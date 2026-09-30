#!/usr/bin/env node
// Audit the Portal icon glyph + generated assets.
//
// Fixes the old bug where the auditor rasterized glyph.svg *without* substituting
// {{TOKEN}}, so a shape colored only via stroke="{{PRIMARY}}" rendered invisible
// and the audit reported a false "monochrome coverage" failure. It now mirrors the
// factory: substitute tokens from icon-source.json.colors, then rasterize.
//
// The audit is *informational*: it fails only on real defects (missing input,
// undefined color tokens, empty glyph). Composition/style findings are reported as
// pass/warn/info because the skill lets the model choose the composition mode.
//
// Usage: node scripts/audit-icon.mjs [projectRoot] [--variant production] [--json]
import path from 'node:path';
import { exists, findProjectRoot, loadSharp, readText } from './lib/project.mjs';
import {
  contrast,
  extendedSrgbToHex,
  hexToRgb,
  loadColors,
  loadIconSource,
  substituteTokens,
} from './lib/colors.mjs';
import { analyzeRaster, opaqueCorners, renderSvg } from './lib/raster.mjs';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const variantIdx = argv.indexOf('--variant');
const variant = variantIdx >= 0 ? argv[variantIdx + 1] : 'production';
const explicit = argv.find((a) => !a.startsWith('--') && a !== variant);

const FULL_BLEED_RECT = /<rect\b[^>]*(?:width|height)\s*=\s*["']?(?:1024|100%)/i;
const EXTERNAL_REF = /(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/)/i;
const EMBEDDED_IMAGE = /<image\b/i;

const root = findProjectRoot(explicit || process.cwd());
const glyphPath = path.join(root, 'assets', 'glyph.svg');
const config = loadIconSource(root);
const colors = loadColors(config);
const appConfig = readText(path.join(root, 'app.config.ts'));

const checks = [];
const push = (id, label, status, detail) => checks.push({ id, label, status, detail });

let mode = null;

if (!exists(glyphPath) || !config) {
  push('input', 'glyph.svg + icon-source.json present', 'fail', 'missing icon input; run `portal setup icons`');
} else {
  const sharp = loadSharp(root);
  const rawSvg = readText(glyphPath);
  const { svg, missing } = substituteTokens(rawSvg, colors);

  if (missing.length) {
    push('tokens', 'All {{TOKEN}} colors defined', 'fail', `undefined in icon-source.json.colors: ${missing.map((t) => `{{${t}}}`).join(', ')}`);
  } else {
    const used = [...rawSvg.matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g)].map((m) => m[1]);
    push('tokens', 'All {{TOKEN}} colors defined', 'pass', used.length ? `tokens: ${[...new Set(used)].join(', ')}` : 'no tokens (hardcoded palette)');
  }

  if (EXTERNAL_REF.test(rawSvg)) {
    push('self-contained', 'No external references', 'warn', 'SVG references an external URL; the factory cannot resolve it at build time');
  }
  if (EMBEDDED_IMAGE.test(rawSvg)) {
    push('embedded-image', 'Embedded raster detected', 'warn', 'glyph embeds an <image>; monochrome derives from alpha only');
  }
  if (!/<svg[^>]*viewBox=["']0 0 1024 1024["']/i.test(rawSvg)) {
    push('viewbox', 'viewBox is 0 0 1024 1024', 'warn', 'viewBox differs from the factory contract');
  }

  const glyphBuf = await renderSvg(sharp, svg, 1024);
  const glyph = await analyzeRaster(sharp, glyphBuf);

  if (glyph.empty) {
    push('content', 'Glyph has visible content', 'fail', 'no opaque pixels — the artwork is empty or fully transparent');
  } else {
    const fullBleed = FULL_BLEED_RECT.test(rawSvg);
    const opaque = opaqueCorners(glyph);
    mode = fullBleed || opaque > 0 || glyph.coverage > 0.6 ? 'composed' : 'symbol';

    if (mode === 'composed') {
      push('mode', 'Composition mode', 'pass', `composed artwork (coverage ${(glyph.coverage * 100).toFixed(1)}%). Background surfaces are redundant; monochrome becomes a filled tile.`);
    } else {
      push('mode', 'Composition mode', 'pass', `symbol (coverage ${(glyph.coverage * 100).toFixed(1)}%), background supplied by Portal`);
      const bad = opaque > 0;
      push('symbol-only', 'Transparent, symbol-only glyph', bad ? 'warn' : 'pass', bad ? `${opaque}/4 corners opaque — background may be baked in` : 'transparent corners');
    }

    const off = Math.max(Math.abs(glyph.centerOffset.x), Math.abs(glyph.centerOffset.y)) / glyph.width;
    push('centering', 'Optical centering', off <= 0.04 ? 'pass' : off <= 0.08 ? 'warn' : 'warn', `offset ${(off * 100).toFixed(1)}% of canvas`);

    const bg = hexToRgb(config.background);
    const primary = hexToRgb(config.colors?.PRIMARY);
    if (bg && primary) {
      const ratio = contrast(primary, bg);
      push('contrast', 'Accent vs background contrast', ratio >= 3 ? 'pass' : ratio >= 2 ? 'warn' : 'warn', `${ratio.toFixed(2)}:1 (target ≥ 3:1)`);
    } else {
      push('contrast', 'Accent vs background contrast', 'warn', 'missing background or PRIMARY hex');
    }

    const small = {};
    for (const n of [16, 32, 64]) small[n] = await analyzeRaster(sharp, glyphBuf, n);
    if (mode === 'composed') {
      // A composed tile fills the frame, so alpha coverage says nothing about the
      // symbol. Use the surviving tonal range of the mark against its background.
      const range16 = small[16].luma?.range ?? 0;
      push('small-size', 'Symbol survives downscaling', range16 > 0.1 ? 'pass' : 'warn', `tonal range at 16px ${(range16 * 100).toFixed(1)}% (symbol vs background)`);
    } else {
      const c16 = small[16].coverage || 0;
      const c64 = small[64].coverage || 0;
      const stable = c16 > 0.03 && c16 < 0.75 && c64 > 0.05 && Math.abs(c64 - c16) < 0.3;
      push('small-size', 'Legible at 16/32/64 px', stable ? 'pass' : 'warn', `coverage 16px ${(c16 * 100).toFixed(1)}% · 64px ${(c64 * 100).toFixed(1)}%`);
    }

    push('monochrome', 'Monochrome-safe silhouette', mode === 'composed' ? 'warn' : 'pass', mode === 'composed' ? 'composed tile becomes a solid block as Android monochromeImage' : `alpha coverage ${(glyph.coverage * 100).toFixed(1)}%`);

    const iconPng = path.join(root, 'assets', 'icons', variant, 'icon.png');
    const androidPng = path.join(root, 'assets', 'icons', variant, 'android-icon.png');
    if (exists(iconPng)) {
      const rendered = await analyzeRaster(sharp, iconPng);
      const sz = config.safeZone ?? 0.66;
      push('safe-zone-ios', `iOS safe zone (${sz})`, rendered.maxExtent <= sz + 0.03 ? 'pass' : 'warn', `extent ${(rendered.maxExtent * 100).toFixed(1)}% of canvas`);
    } else {
      push('safe-zone-ios', 'Generated icon.png exists', 'warn', `run \`portal icons generate\` (missing assets/icons/${variant}/icon.png)`);
    }
    if (exists(androidPng)) {
      const rendered = await analyzeRaster(sharp, androidPng);
      const gs = config.android?.glyphScale ?? 0.45;
      push('safe-zone-android', `Android glyph scale (${gs})`, rendered.maxExtent <= gs + 0.04 ? 'pass' : 'warn', `extent ${(rendered.maxExtent * 100).toFixed(1)}% of canvas`);
    }
  }
}

// Background surfaces (report-only; sync is a recommendation, not a hard rule).
const surfaces = { iconSource: config?.background ?? null };
const lastMatch = (text, re) => {
  const all = [...text.matchAll(re)];
  return all.length ? all[all.length - 1] : null;
};
const mAdaptive = lastMatch(appConfig, /adaptiveIcon[\s\S]{0,240}?backgroundColor["']?\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
if (mAdaptive) surfaces.androidAdaptive = mAdaptive[1];
const mSplash = lastMatch(appConfig, /splashBackgroundColor\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
if (mSplash) surfaces.splash = mSplash[1];
const iconJsonPath = path.join(root, 'assets', 'icons', variant, 'app-icon.icon', 'icon.json');
try {
  const parsed = JSON.parse(readText(iconJsonPath));
  if (parsed?.fill?.['automatic-gradient']) surfaces.iosFill = extendedSrgbToHex(parsed.fill['automatic-gradient']);
} catch {
  /* ignore */
}

const present = Object.entries(surfaces).filter(([, v]) => v);
const distinct = new Set(present.map(([, v]) => v.toUpperCase()));
if (present.length >= 2) {
  push('background-sync', 'Background synced across surfaces', distinct.size === 1 ? 'pass' : 'warn', distinct.size === 1 ? [...distinct][0] : `mismatch: ${present.map(([k, v]) => `${k}=${v}`).join(', ')}`);
} else {
  push('background-sync', 'Background surfaces detected', 'warn', 'fewer than 2 surfaces found');
}

const fails = checks.filter((c) => c.status === 'fail').length;
const warns = checks.filter((c) => c.status === 'warn').length;
const ok = fails === 0;
const report = { ok, root, variant, mode, fails, warns, checks, surfaces };

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const mark = { pass: '✓', warn: '!', fail: '✗' };
  console.log(`Portal icon audit — ${path.relative(process.cwd(), root) || '.'} (${variant})${mode ? ` [${mode}]` : ''}`);
  for (const c of checks) console.log(`  ${mark[c.status]} ${c.label}: ${c.detail}`);
  console.log(`  → ${fails} fail · ${warns} warn`);
  console.log(`  background: ${present.map(([k, v]) => `${k}=${v}`).join('  ') || 'n/a'}`);
}

process.exit(ok ? 0 : 1);
