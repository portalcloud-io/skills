#!/usr/bin/env node
// Fast glyph contact sheet — NO factory run.
//
// Use this to iterate: it renders assets/glyph.svg (with {{TOKEN}} substituted,
// exactly like the factory) at several sizes, on the app background and on light,
// plus a monochrome pass and a safe-zone overlay — all in one PNG. Run the Portal
// factory once at the end with preview.mjs.
//
// Usage: node scripts/render.mjs [projectRoot] [--out <path>] [--cell 220]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findProjectRoot, loadSharp, readText } from './lib/project.mjs';
import { hexToRgb, loadColors, loadIconSource, substituteTokens } from './lib/colors.mjs';
import { renderSvg } from './lib/raster.mjs';

const argv = process.argv.slice(2);
const opts = { out: null, cell: null };
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--out') opts.out = argv[++i];
  else if (a === '--cell') opts.cell = argv[++i];
  else if (!a.startsWith('--')) positional.push(a);
}
const explicit = positional[0];
const outPath = path.resolve(opts.out || path.join(os.tmpdir(), 'portal-icon-render.png'));
const CELL = Number(opts.cell || 280) || 280;

const DARK_BG = '#0B0F17';
const LIGHT_BG = '#F4F5F7';

function solid(sharp, w, h, hex) {
  const { r, g, b } = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  return sharp({ create: { width: w, height: h, channels: 4, background: { r, g, b, alpha: 1 } } })
    .png()
    .toBuffer();
}

function overlaySvg(sharp, size, safeZone, glyphScale) {
  const c = size / 2;
  const iosR = (size * safeZone) / 2;
  const androidR = (size * glyphScale) / 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<circle cx="${c}" cy="${c}" r="${androidR}" fill="none" stroke="#FBBF24" stroke-width="2" stroke-dasharray="6 5"/>` +
    `<circle cx="${c}" cy="${c}" r="${iosR}" fill="none" stroke="#60A5FA" stroke-width="2"/>` +
    `</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** One cell: background + the glyph at its real pixel size, centered. */
async function cell(sharp, glyphBuf, size, bg, { mono = false } = {}) {
  const panel = await solid(sharp, CELL, CELL, bg);
  let g = sharp(glyphBuf).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (mono) g = g.grayscale();
  const buf = await g.png().toBuffer();
  const left = Math.round((CELL - size) / 2);
  const top = Math.round((CELL - size) / 2);
  return sharp(panel).composite([{ input: buf, left, top }]).png().toBuffer();
}

async function main() {
  const root = findProjectRoot(explicit || process.cwd());
  const config = loadIconSource(root);
  if (!config) throw new Error(`No assets/icon-source.json under ${root}`);
  const rawSvg = readText(path.join(root, 'assets', 'glyph.svg'));
  if (!rawSvg) throw new Error(`No assets/glyph.svg under ${root}`);
  const { svg, missing } = substituteTokens(rawSvg, loadColors(config));
  if (missing.length) console.warn(`! undefined tokens: ${missing.map((t) => `{{${t}}}`).join(', ')}`);

  const sharp = loadSharp(root);
  const glyphBuf = await renderSvg(sharp, svg, 1024);

  const sizes = [16, 32, 64, 128, 256];
  const grid = [];
  // Row 1: app background. Row 2: light background. Row 3: monochrome on light.
  for (const size of sizes) grid.push(await cell(sharp, glyphBuf, size, config.background || DARK_BG));
  grid.push(await overlayCell(sharp, glyphBuf, config));
  for (const size of sizes) grid.push(await cell(sharp, glyphBuf, size, LIGHT_BG));
  grid.push(await solid(sharp, CELL, CELL, LIGHT_BG));
  for (const size of [64, 128, 256]) grid.push(await cell(sharp, glyphBuf, size, LIGHT_BG, { mono: true }));
  while (grid.length < 18) grid.push(await solid(sharp, CELL, CELL, '#FFFFFF'));

  const cols = 6;
  const rows = 3;
  const sheet = await solid(sharp, cols * CELL, rows * CELL, '#FFFFFF');
  const composites = grid.map((input, i) => ({ input, left: (i % cols) * CELL, top: Math.floor(i / cols) * CELL }));
  const out = await sharp(sheet).composite(composites).png().toBuffer();
  fs.writeFileSync(outPath, out);

  console.log(`✓ contact sheet: ${outPath}`);
  console.log(`  layout: row1 app bg (16/32/64/128/256 + safe-zone) · row2 light · row3 monochrome`);
  console.log(`  iterate the SVG here, then run preview.mjs once at the end`);
}

async function overlayCell(sharp, glyphBuf, config) {
  const bg = config.background || DARK_BG;
  const panel = await solid(sharp, CELL, CELL, bg);
  const safeZone = config.safeZone ?? 0.66;
  const glyphScale = config.android?.glyphScale ?? 0.45;
  const g = await sharp(glyphBuf).resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const ov = await overlaySvg(sharp, CELL, safeZone, glyphScale);
  return sharp(panel).composite([{ input: g }, { input: ov }]).png().toBuffer();
}

main().catch((err) => {
  console.error(`✗ render failed: ${err.message}`);
  process.exit(1);
});
