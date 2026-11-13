import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const { sources, errors } = loadRegistry(path.resolve(here, '../sources'));
if (errors.length) {
  console.error(errors.map((e) => `ERR sources: ${e}`).join('\n'));
  process.exit(1);
}
const out = path.resolve(here, '../src/data/sources.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(sources, null, 1));
console.log(`merged ${Object.keys(sources).length} sources`);
