import fs from 'node:fs';
import path from 'node:path';

export const CANONICAL = ['reference/rules', 'json-ui/conflicts', 'json-ui/community-reports', 'internals/findings-index'];

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

export function loadRules(docsRoot) {
  const rules = {};
  for (const page of CANONICAL) {
    const file = path.join(docsRoot, `${page}.mdx`);
    if (fs.existsSync(file)) Object.assign(rules, parseRules(fs.readFileSync(file, 'utf8'), page));
  }
  return rules;
}
