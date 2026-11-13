#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry, checkPage, walk } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const { sources, errors } = loadRegistry(path.resolve(here, '../sources'));
const lines = errors.map((e) => `ERR sources: ${e}`);
const args = process.argv.slice(2);
if (args.length === 0) args.push(path.resolve(here, '../docs'));
let n = 0;
for (const a of args) {
  for (const f of walk(a)) {
    n++;
    for (const e of checkPage(f, sources)) lines.push(`ERR ${f}: ${e}`);
  }
}
if (lines.length) {
  console.log(lines.join('\n'));
  process.exit(1);
}
console.log(`OK ${n} pages`);
