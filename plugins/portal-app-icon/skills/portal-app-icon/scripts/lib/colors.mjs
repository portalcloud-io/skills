#!/usr/bin/env node
// Color handling shared by the auditor and the renderer.
//
// IMPORTANT: the Portal factory substitutes {{TOKEN}} in glyph.svg from
// `assets/icon-source.json.colors` *before* rasterizing (see the CLI's
// substitute-colors.ts). The skills must do the same, otherwise an SVG whose
// color comes only from `stroke="{{PRIMARY}}"` renders invisible under librsvg
// and the audit lies. This module mirrors that substitution.
import path from 'node:path';
import { readJson } from './project.mjs';

export const UNDEFINED_TOKEN = '#FF00FF'; // visible sentinel for a missing token

export function loadIconSource(root) {
  return readJson(path.join(root, 'assets', 'icon-source.json'));
}

export function loadColors(config) {
  return (config && config.colors) || {};
}

/**
 * Substitute {{TOKEN}} placeholders. Mirrors the CLI semantics but never throws:
 * it returns the list of tokens that were not defined so the audit can report
 * them instead of crashing.
 */
export function substituteTokens(svgText, colors = {}) {
  const missing = [];
  const svg = String(svgText).replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_m, token) => {
    if (token in colors) return colors[token];
    if (!missing.includes(token)) missing.push(token);
    return UNDEFINED_TOKEN;
  });
  return { svg, missing };
}

export function hexToRgb(hex) {
  const v = String(hex || '').replace('#', '');
  if (v.length !== 6) return null;
  return {
    r: Number.parseInt(v.slice(0, 2), 16),
    g: Number.parseInt(v.slice(2, 4), 16),
    b: Number.parseInt(v.slice(4, 6), 16),
  };
}

export function luminance({ r, g, b }) {
  const ch = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function extendedSrgbToHex(value) {
  const m = /extended-srgb:([\d.]+),([\d.]+),([\d.]+)/.exec(value || '');
  if (!m) return null;
  const to = (n) => Math.round(Number(n) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
}
