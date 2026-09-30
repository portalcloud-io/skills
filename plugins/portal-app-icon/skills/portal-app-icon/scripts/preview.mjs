#!/usr/bin/env node
// Drive the Portal icon factory: generate → check → preview (collage).
// Usage: node scripts/preview.mjs [projectRoot] [--no-generate] [--collage <path>]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const noGenerate = argv.includes('--no-generate');
const collageIdx = argv.indexOf('--collage');
const collageArg = collageIdx >= 0 ? argv[collageIdx + 1] : null;
const explicit = argv.find((a) => !a.startsWith('--') && a !== collageArg);

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
      exists(path.join(dir, 'app.config.ts'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function resolvePortal(root) {
  const localBin = path.join(root, 'node_modules', '.bin', 'portal');
  if (exists(localBin)) return { command: localBin, prefix: [] };
  try {
    const req = createRequire(path.join(root, 'package.json'));
    const entry = req.resolve('@portalcloud-io/cli');
    const bin = path.join(path.dirname(path.dirname(entry)), 'bin', 'cli.js');
    if (exists(bin)) return { command: process.execPath, prefix: [bin] };
  } catch {
    /* npx fallback */
  }
  return { command: 'npx', prefix: ['--yes', '@portalcloud-io/cli'] };
}

const root = findProjectRoot(explicit || process.cwd());
const portal = resolvePortal(root);
const collage = path.resolve(collageArg || path.join(os.tmpdir(), 'portal-icons-collage.png'));

function run(label, args) {
  console.log(`\n› portal ${args.join(' ')}`);
  const res = spawnSync(portal.command, [...portal.prefix, ...args], { cwd: root, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}

if (!noGenerate) run('icons generate', ['icons', 'generate']);
run('icons check', ['icons', 'check']);
run('icons preview', ['icons', 'preview', collage]);

console.log(`\n✓ Icon pipeline complete`);
console.log(`  collage: ${collage}`);
