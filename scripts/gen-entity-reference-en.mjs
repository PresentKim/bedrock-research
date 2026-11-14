// Derives the English entity reference pages from the Korean ones that gen-entity-reference.mjs writes.
// Usage: node scripts/gen-entity-reference-en.mjs [ko dir] [en dir]
// Table cells go back to the MS Learn English through the `cells` map of entity-reference-ko.json.
// The Korean one-line summary (`desc`) is dropped because the English lead under it carries the same text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './gen-entity-reference.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const NO_DESC_KO = '원문에 설명이 없다. 속성 표를 본다.';
const NO_DESC_EN = 'The original has no description. See the property table.';
const LEAD = 'MS Learn(MicrosoftDocs/minecraft-creator a9fd1c0, CC BY 4.0)';
const LEAD_EN = 'MS Learn (MicrosoftDocs/minecraft-creator a9fd1c0, CC BY 4.0)';

const HEAD = {
  이름: 'Name',
  기본값: 'Default Value',
  유형: 'Type',
  설명: 'Description',
  '예시 값': 'Example Values',
  값: 'Value',
  제목: 'Title',
  'Dragonfly 서버 패치': 'Dragonfly server patch',
  [NO_DESC_KO]: NO_DESC_EN,
};
const LISTS = {
  '내장 이벤트 목록': 'Built-in event list',
  '필터 목록': 'Filter list',
  '트리거 목록': 'Trigger list',
  '이벤트 액션 목록': 'Event action list',
};
const KIND = { 컴포넌트: 'component', 'AI 목표(behavior)': 'AI goal (behavior)' };
const LABEL = { '엔티티 컴포넌트': 'Entity component', '엔티티 AI 목표': 'Entity AI goal' };

const isHeading = (l) => /^#{1,6} /.test(l);

function splitCells(row) {
  return row.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((s) => s.trim());
}

export function reverseCells(cells) {
  const back = new Map();
  for (const [en, ko] of Object.entries(cells)) {
    const key = esc(ko, { cell: true });
    if (!back.has(key)) back.set(key, esc(en.replace(/\[([^\]]*)\]\((?!https?:)[^)]*\)/g, '$1'), { cell: true }));
  }
  return back;
}

function translateRow(row, back) {
  if (/^\|[\s:|-]+$/.test(row)) return row;
  return `| ${splitCells(row).map((c) => HEAD[c] ?? back.get(c) ?? c).join(' | ')} |`;
}

function translateLine(l) {
  let m;
  if ((m = l.match(/^(title: |# )(엔티티 컴포넌트|엔티티 AI 목표) 레퍼런스 \((\d+\/\d+)\)$/))) return `${m[1]}${LABEL[m[2]]} reference (${m[3]})`;
  if ((m = l.match(/^description: MS Learn (.+?) 문서 (\d+)개\((.*)\)\. 속성 표와 예시 JSON을 원문대로 담았다\.$/)))
    return `description: ${m[2]} MS Learn ${KIND[m[1]]} page${m[2] === '1' ? '' : 's'} (${m[3]}). Property tables and sample JSON as in the original.`;
  if ((m = l.match(/^MS Learn\(MicrosoftDocs\/minecraft-creator a9fd1c0, CC BY 4\.0\)의 (.+?) 문서를 옮긴 쪽이다\./)))
    return `This page carries the ${KIND[m[1]]} pages of ${LEAD_EN}. IDs, property names, types, default values and JSON are as in the original. The full list is in the [index](./entity-index.mdx).`;
  if ((m = l.match(/^\(출처: (.*)\)$/))) return `(Source: ${m[1]})`;
  if (l === '### 예시') return '### Samples';
  if ((m = l.match(/^## (.+)$/)) && LISTS[m[1]]) return `## ${LISTS[m[1]]}`;
  if (l === 'title: 엔티티 이벤트·필터·트리거 목록' || l === '# 엔티티 이벤트·필터·트리거 목록')
    return l.replace('엔티티 이벤트·필터·트리거 목록', 'Entity events, filters and triggers');
  if (l === 'description: MS Learn 엔티티 내장 이벤트, 필터, 트리거, 이벤트 액션 목록.')
    return 'description: MS Learn lists of built-in entity events, filters, triggers and event actions.';
  if (l.startsWith(`${LEAD}의 목록을 옮긴 쪽이다.`))
    return `This page carries the lists of ${LEAD_EN}. Relative links of the original are removed. Components and AI goals are in the [index](./entity-index.mdx).`;
  if (l === 'title: 엔티티 컴포넌트·AI 목표 색인' || l === '# 엔티티 컴포넌트·AI 목표 색인')
    return l.replace('엔티티 컴포넌트·AI 목표 색인', 'Entity component and AI goal index');
  if ((m = l.match(/^description: MS Learn 엔티티 컴포넌트 (\d+)개와 AI 목표 (\d+)개를 한 줄 설명과 함께 모은 색인이다\.$/)))
    return `description: Index of the ${m[1]} MS Learn entity components and ${m[2]} AI goals with a one-line description each.`;
  if ((m = l.match(/^MS Learn\(MicrosoftDocs\/minecraft-creator a9fd1c0, CC BY 4\.0\)에 실린 엔티티 컴포넌트 (\d+)개와 AI 목표 (\d+)개의 전체 목록이다\./)))
    return `The full list of the ${m[1]} entity components and ${m[2]} AI goals in ${LEAD_EN}. Select an ID to go to its entry. Events, filters and triggers are in [Entity events, filters and triggers](./entity-events-filters.mdx).`;
  if ((m = l.match(/^## 컴포넌트 \((\d+)개\)$/))) return `## Components (${m[1]})`;
  if ((m = l.match(/^## AI 목표 \((\d+)개\)$/))) return `## AI goals (${m[1]})`;
  return l;
}

// Each entry is `## id`, blank, `(출처: ...)`, blank, Korean summary, blank, English lead.
export function translatePage(text, ko, back, leads) {
  const descs = new Set(Object.values(ko.desc).map((d) => esc(d)));
  const lines = text.split('\n');
  const out = [];
  let id = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const h = l.match(/^## (minecraft&#58;.+)$/);
    if (h) id = h[1].replace(/&#58;/g, ':');
    if (descs.has(l) && lines[i - 1] === '' && /^\(출처: /.test(lines[i - 2] ?? '')) {
      if (l === esc(NO_DESC_KO)) out.push(NO_DESC_EN);
      else if (lines[i + 2] === undefined || isHeading(lines[i + 2]) || lines[i + 2] === '') out.push(l);
      else {
        if (id) leads.set(id, lines[i + 2]);
        leads.set(l, lines[i + 2]);
        i++;
      }
      continue;
    }
    out.push(/^\|/.test(l) ? translateRow(l, back) : translateLine(l));
  }
  return out.join('\n');
}

export function translateIndex(text, back, leads) {
  const cell = (lead) => lead.replace(/^>\s*/, '').replace(/(?<!\\)\|/g, '\\|');
  return text
    .split('\n')
    .map((l) => {
      const m = l.match(/^\| (.+?) \| (.*) \|$/);
      if (!m || /^\|[\s:|-]+$/.test(l)) return /^\|/.test(l) ? translateRow(l, back) : translateLine(l);
      const id = m[1].match(/^\[(.+?)\]\(/)?.[1].replace(/&#58;/g, ':');
      const lead = (id && leads.get(id)) ?? leads.get(m[2]);
      return lead === undefined ? translateRow(l, back) : `| ${HEAD[m[1]] ?? m[1]} | ${cell(lead)} |`;
    })
    .join('\n');
}

export function generate(koDir, enDir, ko) {
  const back = reverseCells(ko.cells);
  const leads = new Map();
  const files = fs.readdirSync(koDir).filter((f) => /^entity-.*\.mdx$/.test(f)).sort();
  fs.mkdirSync(enDir, { recursive: true });
  const written = [];
  for (const f of files.filter((f) => f !== 'entity-index.mdx')) {
    fs.writeFileSync(path.join(enDir, f), translatePage(fs.readFileSync(path.join(koDir, f), 'utf8'), ko, back, leads));
    written.push(f);
  }
  if (files.includes('entity-index.mdx')) {
    fs.writeFileSync(path.join(enDir, 'entity-index.mdx'), translateIndex(fs.readFileSync(path.join(koDir, 'entity-index.mdx'), 'utf8'), back, leads));
    written.push('entity-index.mdx');
  }
  return written;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const koDir = process.argv[2] ?? path.resolve(here, '../docs/content/reference');
  const enDir = process.argv[3] ?? path.resolve(here, '../i18n/en/docusaurus-plugin-content-docs/current/content/reference');
  const ko = JSON.parse(fs.readFileSync(path.join(here, 'entity-reference-ko.json'), 'utf8'));
  const written = generate(koDir, enDir, ko);
  console.log(`wrote ${written.length} pages to ${enDir}`);
}
