import fs from 'node:fs';
import path from 'node:path';
import { loadRuleData } from './gen-rules.mjs';

export const CANONICAL = ['json-ui/conflicts', 'json-ui/community-reports', 'internals/findings-index', 'internals/json-ui-engine-findings', 'internals/ore-ui-engine-findings'];

export const ID_RE = /\b([A-Z]{1,5}-\d{2,3})\b/g;

export function cleanTitle(md) {
  return md
    .replace(/\\\|/g, '|')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1$2')
    .replace(/&#58;/g, ':')
    .trim();
}

export function parseRules(text, page) {
  const rules = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\| ([A-Z]{1,5}-\d{2,3}) \| (.*?) (?<!\\)\|/);
    if (m && !(m[1] in rules)) rules[m[1]] = { title: cleanTitle(m[2]), page };
  }
  return rules;
}

export function rulesFromData(chapters, lang) {
  const rules = {};
  for (const ch of chapters) for (const r of ch.rules) rules[r.id] = { title: cleanTitle(r[lang].text), page: `reference/rules/${ch.slug}` };
  return rules;
}

export function loadRules(docsRoot, chapters = loadRuleData()) {
  const lang = path.basename(docsRoot) === 'docs' ? 'ko' : 'en';
  const rules = rulesFromData(chapters, lang);
  for (const page of CANONICAL) {
    const file = path.join(docsRoot, `${page}.mdx`);
    if (!fs.existsSync(file)) continue;
    for (const [id, r] of Object.entries(parseRules(fs.readFileSync(file, 'utf8'), page))) if (!(id in rules)) rules[id] = r;
  }
  return rules;
}
