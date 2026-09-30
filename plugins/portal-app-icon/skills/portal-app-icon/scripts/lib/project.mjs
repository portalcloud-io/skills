#!/usr/bin/env node
// Shared project/toolchain helpers for the portal-app-icon scripts.
// Keeps one source of truth for project detection, portal resolution and sharp
// loading (previously duplicated across detect/preview/audit).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function readText(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Walk up from `start` until a Portal icon project is found.
 * A project is anything with assets/icon-source.json, assets/glyph.svg,
 * app.config.ts or app.json.
 */
export function findProjectRoot(start) {
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

/** Resolve the `portal` CLI entry for a project (local bin → package bin → npx). */
export function resolvePortal(root) {
  const localBin = path.join(root, 'node_modules', '.bin', 'portal');
  if (exists(localBin)) {
    return { kind: 'local-bin', bin: localBin, command: localBin, prefix: [] };
  }
  try {
    const req = createRequire(path.join(root, 'package.json'));
    const entry = req.resolve('@portalcloud-io/cli');
    // entry ~ <cliPkg>/dist/index.js → package root is dirname(dirname(entry))
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

/**
 * Load sharp. It is not resolvable from a pnpm app root, so try a series of
 * anchors: the project package.json, the resolved Portal CLI, and the project's
 * `expo` / `@expo/cli` (which ship sharp transitively).
 */
export function loadSharp(root) {
  const pkgJson = path.join(root, 'package.json');
  const anchors = [pkgJson];
  const req = createRequire(pkgJson);
  for (const mod of ['@portalcloud-io/cli', 'expo', '@expo/cli']) {
    try {
      anchors.push(req.resolve(mod));
    } catch {
      /* not installed */
    }
  }
  for (const anchor of anchors) {
    try {
      return createRequire(anchor)('sharp');
    } catch {
      /* try next anchor */
    }
  }
  throw new Error(
    "Cannot resolve 'sharp'. Install it in the project or the Portal CLI (e.g. `pnpm add -D sharp`).",
  );
}
