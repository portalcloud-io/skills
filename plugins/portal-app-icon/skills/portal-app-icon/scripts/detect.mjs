#!/usr/bin/env node
// Inspect a Portal project's icon state and resolve the toolchain.
// Usage: node scripts/detect.mjs [projectRoot] [--pretty]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const pretty = args.includes('--pretty');
const explicit = args.find((a) => !a.startsWith('--'));

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
      exists(path.join(dir, 'app.config.ts')) ||
      exists(path.join(dir, 'app.json'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
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

function resolvePortal(root) {
  const localBin = path.join(root, 'node_modules', '.bin', 'portal');
  if (exists(localBin)) {
    return { kind: 'local-bin', bin: localBin, command: localBin, prefix: [] };
  }
  try {
    const req = createRequire(path.join(root, 'package.json'));
    const entry = req.resolve('@portalcloud-io/cli');
    // entry ~ <cliPkg>/dist/index.js  → package root is dirname(dirname(entry))
    const pkgRoot = path.dirname(path.dirname(entry));
    const bin = path.join(pkgRoot, 'bin', 'cli.js');
    if (exists(bin)) {
      return { kind: 'resolved-bin', bin, command: process.execPath, prefix: [bin] };
    }
  } catch {
    /* fall through to npx */
  }
  return { kind: 'npx', bin: null, command: 'npx', prefix: ['--yes', '@portalcloud-io/cli'] };
}

function extractConfigSurfaces(text) {
  const surfaces = {};
  const lastMatch = (re) => {
    const all = [...text.matchAll(re)];
    return all.length ? all[all.length - 1] : null;
  };
  // customConfig appears after expoBase and wins at runtime → last occurrence is effective.
  const adaptive = lastMatch(/adaptiveIcon[\s\S]{0,240}?backgroundColor["']?\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
  if (adaptive) surfaces.androidAdaptiveBackground = adaptive[1];
  const splash = lastMatch(/splashBackgroundColor\s*:\s*["'](#[0-9A-Fa-f]{6})["']/g);
  if (splash) surfaces.splashBackground = splash[1];
  const name = text.match(/"name"\s*:\s*"([^"]+)"/);
  if (name) surfaces.appName = name[1];
  const slug = text.match(/"slug"\s*:\s*"([^"]+)"/);
  if (slug) surfaces.appSlug = slug[1];
  return surfaces;
}

function extendedSrgbToHex(value) {
  const m = /extended-srgb:([\d.]+),([\d.]+),([\d.]+)/.exec(value || '');
  if (!m) return null;
  const to = (n) => Math.round(Number(n) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
}

const root = findProjectRoot(explicit || process.cwd());
const glyphPath = path.join(root, 'assets', 'glyph.svg');
const configPath = path.join(root, 'assets', 'icon-source.json');
const config = readJson(configPath);
const portal = resolvePortal(root);

const result = {
  projectRoot: root,
  portal: { kind: portal.kind, bin: portal.bin, command: portal.command, prefix: portal.prefix },
  files: {
    glyph: path.relative(root, glyphPath),
    config: path.relative(root, configPath),
    hasGlyph: exists(glyphPath),
    hasIconSource: exists(configPath),
  },
  icon: config
    ? {
        background: config.background,
        primary: config.colors?.PRIMARY ?? null,
        safeZone: config.safeZone,
        androidGlyphScale: config.android?.glyphScale ?? null,
        badges: config.badges ? Object.keys(config.badges) : [],
      }
    : null,
  backgroundSurfaces: { iconSource: config?.background ?? null },
  warnings: [],
};

const appConfigText = readText(path.join(root, 'app.config.ts'));
Object.assign(result.backgroundSurfaces, extractConfigSurfaces(appConfigText));

const iconJsonPath = path.join(root, 'assets', 'icons', 'production', 'app-icon.icon', 'icon.json');
const iconJson = readJson(iconJsonPath);
if (iconJson?.fill?.['automatic-gradient']) {
  result.backgroundSurfaces.iosIconFill = extendedSrgbToHex(iconJson.fill['automatic-gradient']);
}

if (result.portal.kind === 'npx') {
  result.warnings.push('portal CLI not found locally; commands will use npx @portalcloud-io/cli');
}
if (!result.files.hasIconSource || !result.files.hasGlyph) {
  result.warnings.push('icon input missing; run `portal setup icons` before generating');
}
if (!appConfigText) {
  result.warnings.push('app.config.ts not found; cannot verify background sync surfaces');
}

process.stdout.write(`${pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result)}\n`);
