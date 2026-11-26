#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, '..');
export const RULES_DIR = path.join(REPO, 'rules');
export const DOCS = { ko: path.join(REPO, 'docs'), en: path.join(REPO, 'i18n/en/docusaurus-plugin-content-docs/current') };

export const LEVELS = {
  measured: { ko: '실측', en: 'measured' },
  vanilla: { ko: '바닐라', en: 'vanilla' },
  pack: { ko: '작동팩', en: 'working pack' },
  code: { ko: '코드', en: 'code' },
  inferred: { ko: '추론', en: 'inferred' },
  unverified: { ko: '미검증', en: 'unverified' },
  conflict: { ko: '충돌', en: 'conflict' },
};

const TEXT = {
  ko: {
    indexTitle: '규칙 ID 전체표',
    indexDescription: (n) => `JSON UI 규칙 ${n}개를 장별 표로 나눈 목록이다. 근거 수준, ID 접두어, 번호 빈자리를 함께 적는다.`,
    chapterTitle: (t) => `규칙: ${t}`,
    chapterDescription: (t, n) => `${t} 장의 규칙 ${n}개를 근거 수준, 출처와 함께 적은 표다.`,
    generated: '이 페이지는 `scripts/gen-rules.mjs`가 `rules/*.json`에서 만든다. 직접 고치지 않고 JSON을 고친 뒤 `npm run gen-rules`를 실행한다. 주제 페이지의 규칙 글머리(`- **[ID]**`)도 같은 원본에서 채워진다.',
    baseline: '바닐라 기준은 bedrock-samples v1.26.50.4 (46ba6ea)이다.',
    counts: (a, p) => `규칙은 채택 ${a}개, 제안 ${p}개다. 제안 규칙은 근거가 모자라거나 아직 본문 규칙으로 합치지 않은 것이라 "(제안)"을 붙인다.`,
    topicLink: (href, t) => `설명과 예제는 주제 페이지 [${t}](${href})에 있다.`,
    header: '| ID | 규칙 | 수준 | [근거 환경](../rules.mdx#근거-환경) | [출처](../source-abbreviations.mdx) |',
    unknownEnv: '모름',
    proposedHeading: '제안 규칙',
    proposedLead: '아직 본문 규칙으로 합치지 않은 제안이다. 쓰기 전에 근거를 확인한다.',
    proposedMark: '(제안)',
    sourceLabel: '출처',
    chaptersHeading: '장별 표',
    chaptersHeader: '| 장 | 접두어 | 채택 | 제안 |',
    gapsHeading: '번호 빈자리',
    gapsLead: '아래 번호는 아직 어느 규칙에도 배정되지 않았다.',
    gapsHeader: '| 접두어 | 빈 번호 |',
    noGaps: '빈 번호가 없다.',
  },
  en: {
    indexTitle: 'Full rule ID table',
    indexDescription: (n) => `The ${n} JSON UI rules split into per-chapter tables, with the evidence levels, ID prefixes and unused numbers.`,
    chapterTitle: (t) => `Rules: ${t}`,
    chapterDescription: (t, n) => `A table of the ${n} rules of the ${t} chapter with their evidence level and sources.`,
    generated: '`scripts/gen-rules.mjs` builds this page from `rules/*.json`. Do not edit it by hand; edit the JSON and run `npm run gen-rules`. The rule bullets on topic pages (`- **[ID]**`) are filled from the same source.',
    baseline: 'The vanilla baseline is bedrock-samples v1.26.50.4 (46ba6ea).',
    counts: (a, p) => `There are ${a} adopted rules and ${p} proposed rules. A proposed rule lacks evidence or has not been merged into the adopted rules yet, so it is marked "(proposal)".`,
    topicLink: (href, t) => `Explanations and examples are on the topic page [${t}](${href}).`,
    header: '| ID | Rule | Level | [Evidence environment](../rules.mdx#evidence-environment) | [Source](../source-abbreviations.mdx) |',
    unknownEnv: 'unknown',
    proposedHeading: 'Proposed rules',
    proposedLead: 'These proposals are not merged into the adopted rules yet. Check the evidence before using them.',
    proposedMark: '(proposal)',
    sourceLabel: 'Source',
    chaptersHeading: 'Chapter tables',
    chaptersHeader: '| Chapter | Prefix | Adopted | Proposed |',
    gapsHeading: 'Unused numbers',
    gapsLead: 'The numbers below are not assigned to any rule yet.',
    gapsHeader: '| Prefix | Unused numbers |',
    noGaps: 'No numbers are unused.',
  },
};

export function loadRuleData(dir = RULES_DIR) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file, i) => ({ file, order: i + 1, ...JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) }));
}

export function validateRuleData(chapters) {
  const errs = [];
  const seen = new Set();
  for (const ch of chapters) {
    for (const k of ['slug', 'page', 'prefix']) if (!ch[k]) errs.push(`${ch.file}: missing ${k}`);
    for (const r of ch.rules) {
      if (seen.has(r.id)) errs.push(`${r.id}: duplicate id`);
      seen.add(r.id);
      if (!r.id.startsWith(`${ch.prefix}-`)) errs.push(`${r.id}: prefix differs from ${ch.file}`);
      if (r.status && r.status !== 'proposed') errs.push(`${r.id}: unknown status ${r.status}`);
      if (!Array.isArray(r.level) || r.level.length === 0) errs.push(`${r.id}: missing level`);
      else for (const l of r.level) if (!LEVELS[l]) errs.push(`${r.id}: level ${l} is not in the legend`);
      for (const lang of ['ko', 'en']) {
        if (!r[lang]?.text) errs.push(`${r.id}: missing ${lang} text`);
        if (r[lang]?.text?.includes('\n')) errs.push(`${r.id}: ${lang} text has a line break`);
      }
    }
  }
  return errs;
}

export const rebase = (text, depth) => (depth === 1 ? text : text.replace(/\]\(\.\.\//g, `](${depth === 0 ? './' : '../'.repeat(depth)}`));

const CODE_KINDS = { source: { ko: '코드(소스)', en: 'code (source)' }, binary: { ko: '코드(바이너리)', en: 'code (binary)' } };
const BINARY_EVIDENCE = /\bNB\b|NB-\d|역컴파일|바이너리|디컴파일/;
const RECONSTRUCTION = /\bCN\b|CN-|Cinnabar|재구성/;

export function codeKinds(r) {
  if (!r.level.includes('code')) return [];
  const evidence = `${r.ko.text} ${r.ko.sources}`;
  const binary = BINARY_EVIDENCE.test(evidence);
  const source = !binary || RECONSTRUCTION.test(evidence);
  return [...(source ? ['source'] : []), ...(binary ? ['binary'] : [])];
}

const PLATFORMS = { Windows: { ko: 'Windows', en: 'Windows' }, Android: { ko: 'Android', en: 'Android' }, iOS: { ko: 'iOS', en: 'iOS' }, 모바일: { ko: '모바일', en: 'mobile' } };
const ENV_RE = /(Windows|Android|iOS|모바일)\s+(?:클라이언트\s+)?((?:1\.)?26\.\d+(?:\.\d+)?)/g;
const SOURCE_ENV = {
  TP: ['Windows', '1.26.52'],
  DF: ['Windows', '1.26.52'],
  NB: ['Android', '1.26.52.3'],
  EML: ['모바일', '1.26.63'],
  E2048: ['모바일', '1.26.63'],
  HXC: ['모바일', '1.26.63'],
  IUC: ['모바일', '1.26.63'],
};

export function environments(r) {
  const found = new Map();
  for (const m of `${r.ko.text} ${r.ko.sources}`.matchAll(ENV_RE)) {
    const version = m[2].startsWith('1.') ? m[2] : `1.${m[2]}`;
    found.set(`${m[1]} ${version}`, [m[1], version]);
  }
  for (const [abbr, env] of Object.entries(SOURCE_ENV)) if (new RegExp(`(^|[^\\w-])${abbr}(?![\\w-])`).test(r.ko.sources ?? '')) found.set(env.join(' '), env);
  return [...found.values()];
}

function environmentText(r, lang) {
  if (!r.level.includes('measured') && !codeKinds(r).includes('binary')) return '-';
  const envs = environments(r);
  if (!envs.length) return TEXT[lang].unknownEnv;
  return envs.map(([p, v]) => `${PLATFORMS[p][lang]} ${v}`).join(', ');
}

const levelText = (r, lang) => r.level.flatMap((l) => (l === 'code' ? codeKinds(r).map((k) => CODE_KINDS[k][lang]) : [LEVELS[l][lang]])).join(', ');
const cell = (s) => s.replace(/\|/g, '\\|');
const numOf = (id) => Number(id.split('-')[1]);

export function renderBullet(r, lang, depth = 1) {
  const t = TEXT[lang];
  const mark = r.status === 'proposed' ? `${t.proposedMark} ` : '';
  const src = r[lang].sources ? rebase(` ([${t.sourceLabel}](../reference/source-abbreviations.mdx): ${r[lang].sources})`, depth) : '';
  return `- **[${r.id}]** ${mark}${rebase(r[lang].text, depth)} \`{${levelText(r, lang)}}\`${src}`;
}

const row = (r, lang) => `| ${r.id} | ${cell(rebase(r[lang].text, 2))} | ${levelText(r, lang)} | ${environmentText(r, lang)} | ${cell(rebase(r[lang].sources ?? '', 2))} |`;

function frontmatter(title, description, position) {
  return ['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, `sidebar_position: ${position}`, 'sources:', '  - repo-guide', '  - private-research', '---', ''].join('\n');
}

export function renderChapterPage(ch, lang) {
  const t = TEXT[lang];
  const adopted = ch.rules.filter((r) => r.status !== 'proposed');
  const proposed = ch.rules.filter((r) => r.status === 'proposed');
  const out = [frontmatter(t.chapterTitle(ch.title[lang]), t.chapterDescription(ch.title[lang], ch.rules.length), ch.order), t.generated, '', t.topicLink(`../../${ch.page}.mdx`, ch.title[lang]), '', t.header, '| --- | --- | --- | --- | --- |', ...adopted.map((r) => row(r, lang))];
  if (proposed.length) out.push('', `## ${t.proposedHeading}`, '', t.proposedLead, '', t.header, '| --- | --- | --- | --- | --- |', ...proposed.map((r) => row(r, lang)));
  return out.join('\n') + '\n';
}

export function gaps(chapters) {
  return chapters.map((ch) => {
    const nums = new Set(ch.rules.map((r) => numOf(r.id)));
    const max = Math.max(...nums);
    const missing = [];
    for (let n = 1; n <= max; n++) if (!nums.has(n)) missing.push(`${ch.prefix}-${String(n).padStart(2, '0')}`);
    return { prefix: ch.prefix, missing };
  });
}

export function renderIndexPage(chapters, lang, legend) {
  const t = TEXT[lang];
  const all = chapters.flatMap((ch) => ch.rules);
  const proposed = all.filter((r) => r.status === 'proposed').length;
  const out = [frontmatter(t.indexTitle, t.indexDescription(all.length), 1), t.generated, '', `${t.baseline} ${t.counts(all.length - proposed, proposed)}`, '', legend.trim(), '', `## ${t.chaptersHeading}`, '', t.chaptersHeader, '| --- | --- | --- | --- |'];
  for (const ch of chapters) {
    const p = ch.rules.filter((r) => r.status === 'proposed').length;
    out.push(`| [${ch.title[lang]}](./rules/${ch.slug}.mdx) | ${ch.prefix} | ${ch.rules.length - p} | ${p} |`);
  }
  out.push('', `## ${t.gapsHeading}`, '', t.gapsLead, '', t.gapsHeader, '| --- | --- |');
  for (const g of gaps(chapters)) out.push(`| ${g.prefix} | ${g.missing.length ? g.missing.map((id) => `\`${id}\``).join(', ') : t.noGaps} |`);
  return out.join('\n') + '\n';
}

const BULLET = /^- \*\*\[([A-Z]{1,5}-\d{2,3})\]\*\* .*$/;

export function syncBullets(text, byId, lang, depth = 1) {
  const unknown = [];
  const lines = text.split('\n').map((line) => {
    const m = line.match(BULLET);
    if (!m) return line;
    const r = byId[m[1]];
    if (!r) {
      unknown.push(m[1]);
      return line;
    }
    return renderBullet(r, lang, depth);
  });
  return { text: lines.join('\n'), unknown };
}

function walk(p) {
  const st = fs.statSync(p);
  if (st.isFile()) return /\.mdx?$/.test(p) ? [p] : [];
  return fs.readdirSync(p).sort().flatMap((n) => walk(path.join(p, n)));
}

export function plan(chapters = loadRuleData(), docs = DOCS) {
  const byId = Object.fromEntries(chapters.flatMap((ch) => ch.rules.map((r) => [r.id, r])));
  const files = new Map();
  const errors = [];
  for (const lang of ['ko', 'en']) {
    const root = docs[lang];
    const legendFile = path.join(RULES_DIR, `legend.${lang}.md`);
    files.set(path.join(root, 'reference/rules.mdx'), renderIndexPage(chapters, lang, fs.readFileSync(legendFile, 'utf8')));
    for (const ch of chapters) files.set(path.join(root, 'reference/rules', `${ch.slug}.mdx`), renderChapterPage(ch, lang));
    for (const f of walk(root)) {
      if (files.has(f)) continue;
      const before = fs.readFileSync(f, 'utf8');
      const depth = path.relative(root, f).split(path.sep).length - 1;
      const { text, unknown } = syncBullets(before, byId, lang, depth);
      for (const id of unknown) errors.push(`${path.relative(REPO, f)}: rule bullet ${id} is not in rules/*.json`);
      if (text !== before) files.set(f, text);
    }
  }
  return { files, errors };
}

export function stale(planned) {
  return [...planned.files].filter(([f, text]) => !fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== text).map(([f]) => f);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const chapters = loadRuleData();
  const errs = validateRuleData(chapters);
  const planned = plan(chapters);
  errs.push(...planned.errors);
  if (errs.length) {
    console.error(errs.map((e) => `ERR rules: ${e}`).join('\n'));
    process.exit(1);
  }
  const changed = stale(planned);
  if (process.argv.includes('--check')) {
    if (changed.length) {
      console.error(changed.map((f) => `ERR ${path.relative(REPO, f)}: out of date, run npm run gen-rules`).join('\n'));
      process.exit(1);
    }
    console.log('rules up to date');
  } else {
    for (const f of changed) {
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, planned.files.get(f));
    }
    console.log(`wrote ${changed.length} files`);
  }
}
