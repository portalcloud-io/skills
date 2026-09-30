#!/usr/bin/env node
// Audit the Portal icon glyph + generated assets: geometry, centering, safe zones,
// contrast, monochrome separability, small-size survivability, and background sync.
// Usage: node scripts/audit-icon.mjs [projectRoot] [--variant production] [--json]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const variantIdx = argv.indexOf('--variant');
const variant = variantIdx >= 0 ? argv[variantIdx + 1] : 'production';
const explicit = argv.find((a) => !a.startsWith('--') && a !== variant);

const ALPHA = 10;

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function findProjectRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (
      exists(path.join(dir, 'assets', 'icon-source.json')) ||
      exists(path.join(dir, 'assets', 'glyph.svg')) ||
      exists(path.join(dir, 'app.config.ts'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function loadSharp(root) {
  const anchors = [path.join(root, 'package.json')];
  try {
    const req = createRequire(path.join(root, 'package.json'));
    anchors.push(req.resolve('@portalcloud-io/cli'));
  } catch {
    /* ignore */
  }
  for (const anchor of anchors) {
    try {
      const req = createRequire(anchor);
      return req('sharp');
    } catch {
      /* try next anchor */
    }
  }
  throw new Error(
    "Cannot resolve 'sharp'. Install it in the project or the Portal CLI (e.g. `pnpm add -D sharp`).",
  );
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function readText(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function hexToRgb(hex) {
  const v = String(hex || '').replace('#', '');
  if (v.length !== 6) return null;
  return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
}

function luminance({ r, g, b }) {
  const ch = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function extendedSrgbToHex(value) {
  const m = /extended-srgb:([\d.]+),([\d.]+),([\d.]+)/.exec(value || '');
  if (!m) return null;
  const to = (n) => Math.round(Number(n) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
}

async function analyze(sharp, input, target = 1024) {
  const { data, info } = await sharp(input, { density: 96 })
    .resize(target, target, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let covered = 0;
  let lumaMin = 255;
  let lumaMax = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a <= ALPHA) continue;
      covered += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (luma < lumaMin) lumaMin = luma;
      if (luma > lumaMax) lumaMax = luma;
    }
  }

  if (maxX < 0) {
    return { empty: true, width, height, coverage: 0, corners: [0, 0, 0, 0] };
  }

  const bbox = { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const corners = [
    data[3],
    data[(width - 1) * 4 + 3],
    data[((height - 1) * width) * 4 + 3],
    data[(height * width - 1) * 4 + 3],
  ];

  return {
    empty: false,
    width,
    height,
    coverage: covered / (width * height),
    bbox,
    centerOffset: { x: centerX - width / 2, y: centerY - height / 2 },
    maxExtent: Math.max(bbox.width, bbox.height) / width,
    corners,
    luma: { min: lumaMin, max: lumaMax, range: (lumaMax - lumaMin) / 255 },
  };
}

const root = findProjectRoot(explicit || process.cwd());
const sharp = loadSharp(root);
const glyphPath = path.join(root, 'assets', 'glyph.svg');
const config = readJson(path.join(root, 'assets', 'icon-source.json'));
const appConfig = readText(path.join(root, 'app.config.ts'));

const checks = [];
const push = (id, label, status, detail) => checks.push({ id, label, status, detail });

if (!exists(glyphPath) || !config) {
  push('input', 'glyph.svg + icon-source.json present', 'fail', 'missing icon input; run `portal setup icons`');
} else {
  const glyph = await analyze(sharp, glyphPath);

  // Transparency / symbol-only
  const cornersOpaque = glyph.corners.filter((a) => a > ALPHA).length;
  if (glyph.coverage > 0.9) {
    push('symbol-only', 'Transparent, symbol-only glyph', 'fail', `coverage ${(glyph.coverage * 100).toFixed(1)}% — looks like a full-canvas background/tile`);
  } else if (cornersOpaque > 0) {
    push('symbol-only', 'Transparent, symbol-only glyph', 'warn', `${cornersOpaque}/4 corners are opaque — background may be baked in`);
  } else {
    push('symbol-only', 'Transparent, symbol-only glyph', 'pass', `coverage ${(glyph.coverage * 100).toFixed(1)}%, transparent corners`);
  }

  // Centering
  const off = Math.max(Math.abs(glyph.centerOffset.x), Math.abs(glyph.centerOffset.y)) / glyph.width;
  push('centering', 'Optical centering', off <= 0.04 ? 'pass' : off <= 0.08 ? 'warn' : 'fail', `offset ${(off * 100).toFixed(1)}% of canvas`);

  // Monochrome separability (alpha silhouette)
  push('monochrome', 'Monochrome-safe silhouette', glyph.coverage > 0.02 && glyph.coverage < 0.9 ? 'pass' : 'fail', `alpha coverage ${(glyph.coverage * 100).toFixed(1)}%`);

  // Contrast vs background
  const bg = hexToRgb(config.background);
  const primary = hexToRgb(config.colors?.PRIMARY);
  if (bg && primary) {
    const ratio = contrast(primary, bg);
    push('contrast', 'Accent vs background contrast', ratio >= 3 ? 'pass' : ratio >= 2 ? 'warn' : 'fail', `${ratio.toFixed(2)}:1 (target ≥ 3:1)`);
  } else {
    push('contrast', 'Accent vs background contrast', 'warn', 'missing background or PRIMARY hex');
  }

  // Small-size survivability
  const buf1024 = await sharp(glyphPath, { density: 96 }).resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const small = {};
  for (const n of [16, 32, 64]) {
    small[n] = await analyze(sharp, buf1024, n);
  }
  const c16 = small[16].coverage || 0;
  const c64 = small[64].coverage || 0;
  const stable = c16 > 0.03 && c16 < 0.75 && c64 > 0.05 && Math.abs(c64 - c16) < 0.3;
  push('small-size', 'Legible at 16/32/64 px', stable ? 'pass' : 'warn', `coverage 16px ${(c16 * 100).toFixed(1)}% · 64px ${(c64 * 100).toFixed(1)}%`);

  // Rendered per-variant assets (if generated)
  const iconPng = path.join(root, 'assets', 'icons', variant, 'icon.png');
  const androidPng = path.join(root, 'assets', 'icons', variant, 'android-icon.png');
  if (exists(iconPng)) {
    const rendered = await analyze(sharp, iconPng);
    const sz = config.safeZone ?? 0.66;
    const ok = rendered.maxExtent <= sz + 0.03;
    push('safe-zone-ios', `iOS safe zone (${sz})`, ok ? 'pass' : 'warn', `extent ${(rendered.maxExtent * 100).toFixed(1)}% of canvas`);
  } else {
    push('safe-zone-ios', 'Generated icon.png exists', 'warn', `run \`portal icons generate\` (missing assets/icons/${variant}/icon.png)`);
  }
  if (exists(androidPng)) {
    const rendered = await analyze(sharp, androidPng);
    const gs = config.android?.glyphScale ?? 0.45;
    const ok = rendered.maxExtent <= gs + 0.04;
    push('safe-zone-android', `Android glyph scale (${gs})`, ok ? 'pass' : 'warn', `extent ${(rendered.maxExtent * 100).toFixed(1)}% of canvas`);
  }

  // Monochrome gradation (informational)
  if (glyph.luma) {
    push('monochrome-gradation', 'Grayscale tonal range', glyph.luma.range > 0.05 ? 'pass' : 'warn', `range ${(glyph.luma.range * 100).toFixed(1)}% (0 = flat color, fine for flat marks)`);
  }
}

// Background sync across the three surfaces
const surfaces = { iconSource: config?.background ?? null };
const lastMatch = (text, re) => {
  const all = [...text.matchAll(re)];
  return all.length ? all[all.length - 1] : null;
};
// customConfig appears after expoBase and wins at runtime, so the last occurrence
// is the effective value.
const mAdaptive = lastMatch(appConfig, /adaptiveIcon[\s\S]{0,240}?backgroundColor["']?\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
if (mAdaptive) surfaces.androidAdaptive = mAdaptive[1];
const mSplash = lastMatch(appConfig, /splashBackgroundColor\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
if (mSplash) surfaces.splash = mSplash[1];
const iconJson = readJson(path.join(root, 'assets', 'icons', variant, 'app-icon.icon', 'icon.json'));
if (iconJson?.fill?.['automatic-gradient']) surfaces.iosFill = extendedSrgbToHex(iconJson.fill['automatic-gradient']);

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
const report = { ok, root, variant, fails, warns, checks, surfaces };

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const mark = { pass: '✓', warn: '!', fail: '✗' };
  console.log(`Portal icon audit — ${path.relative(process.cwd(), root) || '.'} (${variant})`);
  for (const c of checks) console.log(`  ${mark[c.status]} ${c.label}: ${c.detail}`);
  console.log(`  → ${fails} fail · ${warns} warn`);
  console.log(`  background: ${present.map(([k, v]) => `${k}=${v}`).join('  ') || 'n/a'}`);
}

process.exit(ok ? 0 : 1);
