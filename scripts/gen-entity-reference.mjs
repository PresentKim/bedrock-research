// Generates wiki/docs/content/reference/entity-*.mdx from the MS Learn EntityReference markdown.
// Usage: node scripts/gen-entity-reference.mjs <minecraft-creator checkout> [out dir]
// Korean text comes from scripts/entity-reference-ko.json:
//   desc  { "minecraft:id": "한 줄 설명" }   one line per component/goal (index + page lead)
//   cells { "English cell": "한국어" }        table description cells (others stay English)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

const here = path.dirname(fileURLToPath(import.meta.url));
const REL = 'creator/Reference/Content/EntityReference/Examples';
export const MAX_LINES = 600;

const HEAD_KO = {
  Name: '이름',
  'Default Value': '기본값',
  Type: '유형',
  Description: '설명',
  'Example Values': '예시 값',
  Value: '값',
  Title: '제목',
};
const SECTION_KO = { Samples: '예시' };

// Escape MDX-significant characters outside code spans and link destinations.
export function esc(text, { cell = false } = {}) {
  return String(text)
    .split(/(`[^`]*`|\]\([^)]*\))/)
    .map((part, i) => {
      if (i % 2 === 1) return cell && part.startsWith('`') ? part.replace(/\|/g, '\\|') : part;
      let s = part
        .replace(/&/g, '&amp;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (cell) s = s.replace(/\|/g, '\\|');
      return s;
    })
    .join('');
}

// Drop relative and in-page links (they point outside the wiki or collide across entries); keep external ones.
export const dropLinks = (t) => t.replace(/\[([^\]]*)\]\((?!https?:)[^)]*\)/g, '$1');

export function parseEntry(text, file, kind) {
  const fm = text.match(/^---\n[\s\S]*?\n---\n/);
  const body = fm ? text.slice(fm[0].length) : text;
  const lines = body.split('\n');
  const h1 = lines.findIndex((l) => /^# /.test(l));
  const title = lines[h1].replace(/^# /, '').trim().replace(/^Entity Documentation - /, '');
  const id = title.startsWith('minecraft:') ? title : `minecraft:${title}`;
  const rest = lines.slice(h1 + 1);
  while (rest.length && !rest[0].trim()) rest.shift();
  while (rest.length && !rest[rest.length - 1].trim()) rest.pop();
  return { id, kind, file, lines: rest, full: title.startsWith('minecraft:') };
}

function splitRow(line) {
  return line.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((s) => s.trim());
}

function translateHead(c) {
  return HEAD_KO[c] ?? c;
}

function renderTable(rows, ko) {
  const head = splitRow(rows[0]);
  const n = head.length;
  const di = head.indexOf('Description');
  const out = [`| ${head.map((c) => esc(translateHead(c), { cell: true })).join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`];
  for (const r of rows.slice(2)) {
    let cells = splitRow(r);
    // Unescaped pipes in the source would add cells and be dropped by remark-gfm; fold extras into the last column.
    if (cells.length > n) cells = [...cells.slice(0, n - 1), cells.slice(n - 1).join('|')];
    while (cells.length < n) cells.push('');
    out.push(
      `| ${cells
        .map((c, i) => {
          const raw = dropLinks(c);
          const t = i === di && ko.cells[c] ? ko.cells[c] : raw;
          return esc(t, { cell: true });
        })
        .join(' | ')} |`,
    );
  }
  return out;
}

export function renderEntry(e, ko, srcPath) {
  // `&#58;` keeps remark-directive from reading `:behavior` as a text directive, which would also change the heading slug.
  const out = [`## ${esc(e.id).replace(/:/g, '&#58;')}`, ''];
  out.push(`(출처: ms-learn, \`${srcPath}\`)`, '');
  const ref = ko.desc[e.id];
  const lines = e.lines;
  // Lead: text before the first heading.
  let i = 0;
  const lead = [];
  while (i < lines.length && !/^#{2,6} /.test(lines[i])) lead.push(lines[i++]);
  while (lead.length && !lead[0].trim()) lead.shift();
  while (lead.length && !lead[lead.length - 1].trim()) lead.pop();
  if (ref) out.push(esc(ref), '');
  if (lead.length) out.push(...renderBlock(lead, ko), '');
  out.push(...renderBlock(lines.slice(i), ko, true));
  while (out.length && !out[out.length - 1].trim()) out.pop();
  out.push('');
  return out;
}

function renderBlock(lines, ko, shift = false) {
  const out = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const f = l.match(/^(```|~~~)/);
    if (fence) {
      out.push(l);
      if (f && f[1] === fence) fence = null;
      continue;
    }
    if (f) {
      fence = f[1];
      out.push(l);
      continue;
    }
    if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      i--;
      if (rows.length >= 2 && /^\|[\s:|-]+$/.test(rows[1])) out.push(...renderTable(rows, ko));
      else out.push(...rows.map((r) => esc(dropLinks(r))));
      continue;
    }
    const h = l.match(/^(#{2,6}) (.*)$/);
    if (h) {
      const level = Math.min(6, h[1].length + (shift ? 1 : 0));
      const t = SECTION_KO[h[2].trim()] ?? dropLinks(h[2]);
      out.push(`${'#'.repeat(level)} ${esc(t)}`);
      continue;
    }
    const q = l.match(/^((?:> ?)+)(.*)$/); // keep blockquote markers, escape only the text after them
    out.push(q ? q[1] + esc(dropLinks(q[2])) : esc(dropLinks(l)));
  }
  return out;
}

export function slugOf(headings) {
  const s = new GithubSlugger();
  return headings.map((h) => s.slug(h));
}

function sortKey(id) {
  return id.replace(/^minecraft:(behavior\.)?/, '');
}

export function loadEntries(srcRoot) {
  const base = path.join(srcRoot, REL);
  const read = (dir, prefix, kind) =>
    fs
      .readdirSync(path.join(base, dir))
      .filter((f) => f.startsWith(prefix) && f.endsWith('.md'))
      .sort()
      .map((f) => parseEntry(fs.readFileSync(path.join(base, dir, f), 'utf8'), f, kind));
  const dedupe = (list, skipped) => {
    const by = new Map();
    for (const e of list) {
      const prev = by.get(e.id);
      if (!prev) by.set(e.id, e);
      else {
        // MS Learn ships some goals twice (`jump.to_block` and `jump_to_block`); keep the copy with the full `minecraft:` title.
        const keep = prev.full !== e.full ? (prev.full ? prev : e) : prev.lines.length >= e.lines.length ? prev : e;
        skipped.push((keep === prev ? e : prev).file);
        by.set(e.id, keep);
      }
    }
    return [...by.values()];
  };
  const skipped = [];
  const components = dedupe(read('EntityComponents', 'minecraftComponent_', 'component'), skipped);
  const goals = dedupe(read('EntityGoals', 'minecraftBehavior_', 'goal'), skipped);
  const by = (a, b) => (sortKey(a.id) < sortKey(b.id) ? -1 : sortKey(a.id) > sortKey(b.id) ? 1 : 0);
  return { components: components.sort(by), goals: goals.sort(by), skipped };
}

const dirOf = { component: 'EntityComponents', goal: 'EntityGoals' };

// Greedy packing of rendered entries into pages of at most MAX_LINES lines (a single larger entry gets its own page).
export function paginate(rendered, limit = MAX_LINES - 15) {
  const pages = [];
  let cur = [];
  let n = 0;
  for (const r of rendered) {
    if (cur.length && n + r.lines.length > limit) {
      pages.push(cur);
      cur = [];
      n = 0;
    }
    cur.push(r);
    n += r.lines.length;
  }
  if (cur.length) pages.push(cur);
  return pages;
}

const KIND = {
  component: { label: '엔티티 컴포넌트', file: 'entity-components', pos: 100, what: '컴포넌트' },
  goal: { label: '엔티티 AI 목표', file: 'entity-goals', pos: 200, what: 'AI 목표(behavior)' },
};

export function buildPages(entries, ko) {
  const result = []; // { name, content, ids: [{id, anchor}] }
  const k = KIND[entries[0].kind];
  const rendered = entries.map((e) => ({
    e,
    lines: renderEntry(e, ko, `${REL}/${dirOf[e.kind]}/${e.file}`),
  }));
  const pages = paginate(rendered);
  pages.forEach((p, pi) => {
    const name = `${k.file}-${pi + 1}`;
    const first = p[0].e.id;
    const last = p[p.length - 1].e.id;
    const title = `${k.label} 레퍼런스 (${pi + 1}/${pages.length})`;
    const slug = new GithubSlugger();
    const ids = p.map((r) => ({ id: r.e.id, anchor: slug.slug(r.e.id) }));
    const head = [
      '---',
      `title: ${title}`,
      `description: MS Learn ${k.what} 문서 ${p.length}개(${first === last ? first : `${first} ~ ${last}`}). 속성 표와 예시 JSON을 원문대로 담았다.`,
      `sidebar_position: ${k.pos + pi}`,
      'sources:',
      '  - ms-learn',
      '---',
      '',
      `# ${title}`,
      '',
      `MS Learn(MicrosoftDocs/minecraft-creator a9fd1c0, CC BY 4.0)의 ${k.what} 문서를 옮긴 쪽이다. 설명은 한국어로 옮기고 ID, 속성 이름, 유형, 기본값, JSON은 원문 그대로 두었다. 전체 목록은 [색인](./entity-index.mdx)에 있다.`,
      '',
    ];
    const content = [...head, ...p.flatMap((r) => r.lines)].join('\n');
    result.push({ name, content, ids, count: p.length });
  });
  return result;
}

export function buildIndex(componentPages, goalPages, entries, ko) {
  const row = (page, { id, anchor }, e) => {
    const d = ko.desc[id] ?? e.get(id).lines.find((l) => l.trim() && !/^#/.test(l)) ?? '';
    return `| [${esc(id)}](./${page.name}.mdx#${anchor}) | ${esc(dropLinks(d), { cell: true })} |`;
  };
  const table = (pages, kind) => {
    const e = new Map(entries.filter((x) => x.kind === kind).map((x) => [x.id, x]));
    return ['| ID | 설명 |', '| --- | --- |', ...pages.flatMap((p) => p.ids.map((i) => row(p, i, e)))];
  };
  const nc = componentPages.reduce((a, p) => a + p.count, 0);
  const ng = goalPages.reduce((a, p) => a + p.count, 0);
  return [
    '---',
    'title: 엔티티 컴포넌트·AI 목표 색인',
    `description: MS Learn 엔티티 컴포넌트 ${nc}개와 AI 목표 ${ng}개를 한 줄 설명과 함께 모은 색인이다.`,
    'sidebar_position: 99',
    'sources:',
    '  - ms-learn',
    '---',
    '',
    '# 엔티티 컴포넌트·AI 목표 색인',
    '',
    `MS Learn(MicrosoftDocs/minecraft-creator a9fd1c0, CC BY 4.0)에 실린 엔티티 컴포넌트 ${nc}개와 AI 목표 ${ng}개의 전체 목록이다. ID를 누르면 해당 항목으로 이동한다. 이벤트·필터·트리거 목록은 [이벤트·필터 목록](./entity-events-filters.mdx)에 있다.`,
    '',
    `## 컴포넌트 (${nc}개)`,
    '',
    ...table(componentPages, 'component'),
    '',
    `## AI 목표 (${ng}개)`,
    '',
    ...table(goalPages, 'goal'),
    '',
  ].join('\n');
}

const LISTS = [
  ['EventList.md', '내장 이벤트 목록'],
  ['FilterList.md', '필터 목록'],
  ['TriggerList.md', '트리거 목록'],
  ['EventActions.md', '이벤트 액션 목록'],
];

export function buildEventsPage(srcRoot, ko) {
  const base = path.join(srcRoot, REL);
  const out = [
    '---',
    'title: 엔티티 이벤트·필터·트리거 목록',
    'description: MS Learn 엔티티 내장 이벤트, 필터, 트리거, 이벤트 액션 목록.',
    'sidebar_position: 98',
    'sources:',
    '  - ms-learn',
    '---',
    '',
    '# 엔티티 이벤트·필터·트리거 목록',
    '',
    'MS Learn(MicrosoftDocs/minecraft-creator a9fd1c0, CC BY 4.0)의 목록을 옮긴 쪽이다. 원문의 상대 링크는 제거했다. 컴포넌트와 AI 목표는 [색인](./entity-index.mdx)을 본다.',
    '',
  ];
  for (const [f, title] of LISTS) {
    const text = fs.readFileSync(path.join(base, f), 'utf8');
    const e = parseEntry(text, f, 'list');
    out.push(`## ${title}`, '', `(출처: ms-learn, \`${REL}/${f}\`)`, '', ...renderBlock(e.lines, ko, true), '');
  }
  return out.join('\n');
}

export function generate(srcRoot, outDir, ko) {
  const { components, goals, skipped } = loadEntries(srcRoot);
  const cp = buildPages(components, ko);
  const gp = buildPages(goals, ko);
  const all = [...components, ...goals];
  const files = new Map();
  for (const p of [...cp, ...gp]) files.set(`${p.name}.mdx`, p.content);
  files.set('entity-index.mdx', buildIndex(cp, gp, all, ko));
  files.set('entity-events-filters.mdx', buildEventsPage(srcRoot, ko));
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (/^entity-.*\.mdx$/.test(f)) fs.rmSync(path.join(outDir, f));
  for (const [f, c] of files) fs.writeFileSync(path.join(outDir, f), c);
  return { components: components.length, goals: goals.length, skipped, pages: [...files.keys()].sort() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const src = process.argv[2];
  if (!src) {
    console.error('usage: node scripts/gen-entity-reference.mjs <minecraft-creator checkout> [out dir]');
    process.exit(2);
  }
  const out = process.argv[3] ?? path.resolve(here, '../docs/content/reference');
  const ko = JSON.parse(fs.readFileSync(path.join(here, 'entity-reference-ko.json'), 'utf8'));
  ko.desc ??= {};
  ko.cells ??= {};
  const r = generate(src, out, ko);
  console.log(`components ${r.components}, goals ${r.goals}, pages ${r.pages.length}, duplicate files skipped: ${r.skipped.join(', ') || 'none'}`);
}
