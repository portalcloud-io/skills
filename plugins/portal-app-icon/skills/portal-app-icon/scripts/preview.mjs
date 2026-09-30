#!/usr/bin/env node
// Drive the Portal icon factory: generate → check → preview (collage).
// Usage: node scripts/preview.mjs [projectRoot] [--no-generate] [--collage <path>]
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findProjectRoot, resolvePortal } from './lib/project.mjs';

const argv = process.argv.slice(2);
const noGenerate = argv.includes('--no-generate');
const collageIdx = argv.indexOf('--collage');
const collageArg = collageIdx >= 0 ? argv[collageIdx + 1] : null;
const explicit = argv.find((a) => !a.startsWith('--') && a !== collageArg);

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
