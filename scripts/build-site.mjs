/**
 * Assembles the deployable site from the two builds that already exist.
 *
 * The prototype takes the root and Storybook takes /storybook, so one
 * deployment carries both: the screen a reviewer opens and the system it is
 * built from, at the same origin, with no second service to keep alive.
 *
 * Storybook emits relative asset paths, which is the only reason it survives
 * being moved under a subdirectory. If that ever changes, this script is where
 * it will break — not in production.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'dist');

const parts = [
  { from: join(root, 'apps/prototype/dist'), to: out, name: 'prototype' },
  { from: join(root, 'packages/ui/storybook-static'), to: join(out, 'storybook'), name: 'storybook' },
];

for (const part of parts) {
  if (!existsSync(part.from)) {
    console.error(`missing build output for ${part.name}: ${part.from}`);
    process.exit(1);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const part of parts) {
  cpSync(part.from, part.to, { recursive: true });
  console.log(`${part.name} -> ${part.to.replace(root, '.')}`);
}
