#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry, checkPage, walk, missingTranslations } from './lib.mjs';
import { loadRuleData, validateRuleData, plan, stale, REPO } from './gen-rules.mjs';
import { loadRules } from './rules.mjs';
import { markerErrors, anchorErrors, unknownIdErrors, parityErrors, integerDivisions } from './page-checks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, '../docs');
const enDocs = path.resolve(here, '../i18n/en/docusaurus-plugin-content-docs/current');
const { sources, errors } = loadRegistry(path.resolve(here, '../sources'));
const lines = errors.map((e) => `ERR sources: ${e}`);
const warnings = [];
const args = process.argv.slice(2);
const full = args.length === 0;
if (full) {
  args.push(docs, enDocs);
  for (const rel of missingTranslations(docs, enDocs)) lines.push(`ERR ${rel}: missing English translation`);
  const chapters = loadRuleData();
  const planned = plan(chapters);
  for (const e of [...validateRuleData(chapters), ...planned.errors]) lines.push(`ERR rules: ${e}`);
  for (const f of stale(planned)) lines.push(`ERR ${path.relative(REPO, f)}: out of date, run npm run gen-rules`);
}
const anchorCache = new Map();
const knownIds = { [docs]: loadRules(docs), [enDocs]: loadRules(enDocs) };
let n = 0;
for (const a of args) {
  const root = path.resolve(a).startsWith(enDocs) ? enDocs : docs;
  const lang = root === enDocs ? 'en' : 'ko';
  for (const f of walk(a)) {
    n++;
    const text = fs.readFileSync(f, 'utf8');
    const errs = [...checkPage(f, sources), ...markerErrors(text, lang), ...anchorErrors(f, text, anchorCache), ...unknownIdErrors(text, knownIds[root])];
    if (lang === 'ko') {
      const en = path.join(enDocs, path.relative(docs, f));
      if (fs.existsSync(en)) errs.push(...parityErrors(text, fs.readFileSync(en, 'utf8')));
    }
    for (const e of errs) lines.push(`ERR ${f}: ${e}`);
  }
}
const jsonFiles = (p) => (fs.statSync(p).isFile() ? (p.endsWith('.json') ? [p] : []) : fs.readdirSync(p).sort().flatMap((x) => jsonFiles(path.join(p, x))));
if (full) {
  for (const f of jsonFiles(path.join(REPO, 'addons'))) for (const h of integerDivisions(fs.readFileSync(f, 'utf8'))) warnings.push(`WARN ${path.relative(REPO, f)}:${h.line}: integer division ${h.expr} truncates (EXP-18); use * .01 style when a fraction is wanted`);
}
if (warnings.length) console.log(warnings.join('\n'));
if (lines.length) {
  console.log(lines.join('\n'));
  process.exit(1);
}
console.log(`OK ${n} pages`);
