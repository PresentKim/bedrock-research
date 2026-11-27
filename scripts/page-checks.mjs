import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';

export const MARKS = {
  ko: ['실측', '바닐라', '작동팩', '코드', '코드(소스)', '코드(바이너리)', '추론', '미검증', '충돌', '설치본', '확인', '문서', '기록', '실측 필요', '커뮤니티 확인', '단일 보고'],
  en: ['measured', 'vanilla', 'working pack', 'code', 'code (source)', 'code (binary)', 'inferred', 'unverified', 'conflict', 'installed', 'verified', 'docs', 'record', 'needs measurement', 'community confirmed', 'single report'],
};

const RULE_PREFIX = '(?:FILE|MOD|LAY|BND|EXP|COL|INP|TXT|ANI|HOST|PAT|ALT|DBG|C|D|NB|RV|R)';
const REF_RE = new RegExp(`(?<![\\w-])(${RULE_PREFIX}-\\d{2,3})(?![\\w-])`, 'g');

export function stripCode(text) {
  return text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
}

export function markerErrors(text, lang) {
  const allowed = new Set(MARKS[lang]);
  const word = lang === 'ko' ? /^[가-힣() ]+$/ : /^[a-z() ]+$/;
  const errs = [];
  for (const m of text.matchAll(/`(?:\{|&#123;)([^`{}]*?)(?:\}|&#125;)`/g)) {
    const toks = m[1].split(/,\s*/).map((t) => t.trim());
    if (!toks.every((t) => word.test(t)) || !toks.some((t) => allowed.has(t))) continue;
    for (const t of toks) if (!allowed.has(t)) errs.push(`level mark "${t}" is not in the legend`);
  }
  return errs;
}

function headingText(md) {
  return md
    .replace(/\s*\{#[^}]+\}\s*$/, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .trim();
}

export function anchorsOf(text) {
  const slugger = new GithubSlugger();
  const ids = new Set();
  let fence = null;
  for (const line of text.split('\n')) {
    const f = line.match(/^(```|~~~)/);
    if (f) fence = fence === f[1] ? null : fence ?? f[1];
    if (fence) continue;
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) {
      const custom = h[1].match(/\{#([^}]+)\}\s*$/);
      ids.add(custom ? custom[1] : slugger.slug(headingText(h[1])));
    }
    const row = line.match(/^\| ([A-Z]{1,5}-\d{2,3}) \|/);
    if (row) ids.add(row[1].toLowerCase());
  }
  return ids;
}

export function anchorErrors(file, text, cache = new Map()) {
  const errs = [];
  for (const m of stripCode(text).matchAll(/\]\(\s*<?(\.\.?\/[^)\s>#]*|)#([^)\s>]+)>?\)/g)) {
    const target = m[1] ? path.resolve(path.dirname(file), m[1]) : file;
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) continue;
    if (!cache.has(target)) cache.set(target, anchorsOf(fs.readFileSync(target, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')));
    let anchor = m[2];
    try {
      anchor = decodeURIComponent(anchor);
    } catch {}
    if (!cache.get(target).has(anchor)) errs.push(`missing anchor ${m[1] || ''}#${m[2]}`);
  }
  return errs;
}

export const idsIn = (text) => new Set([...stripCode(text).matchAll(REF_RE)].map((m) => m[1]));

export function unknownIdErrors(text, known) {
  return [...idsIn(text)].filter((id) => !(id in known)).map((id) => `unknown id ${id}`);
}

export function parityErrors(koText, enText) {
  const ko = idsIn(koText);
  const en = idsIn(enText);
  const onlyKo = [...ko].filter((x) => !en.has(x));
  const onlyEn = [...en].filter((x) => !ko.has(x));
  const errs = [];
  if (onlyKo.length) errs.push(`ids only in Korean: ${onlyKo.join(', ')}`);
  if (onlyEn.length) errs.push(`ids only in English: ${onlyEn.join(', ')}`);
  return errs;
}

export function integerDivisions(source) {
  const hits = [];
  source.split('\n').forEach((line, i) => {
    for (const s of line.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      if (!/[#$]/.test(s[1])) continue;
      for (const m of s[1].matchAll(/\/\s*\d+(?![\d.])/g)) hits.push({ line: i + 1, expr: m[0].trim() });
    }
  });
  return hits;
}
