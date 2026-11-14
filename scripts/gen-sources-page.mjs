// Generates wiki/docs/reference/sources.mdx from the merged registry (src/data/sources.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CATEGORIES = [
  ['project', '이 저장소 자료'],
  ['cc-by', 'CC BY'],
  ['permissive', 'MIT, BSD, Apache'],
  ['gpl', 'GPL'],
  ['polyform-nc', 'PolyForm Noncommercial (비상업)'],
  ['facts-only', '사실만 다시 씀 (재배포 불가)'],
];

const TEXT = {
  ko: {
    categories: Object.fromEntries(CATEGORIES),
    title: '출처 목록',
    description: (n) => `위키가 쓴 출처 ${n}개를 라이선스별 표로 모은 것이다. id, 제목, 저작자, 라이선스, 커밋, 재배포 여부를 적는다.`,
    lead: (n) =>
      `출처 레지스트리의 ${n}개 항목을 라이선스 종류별로 나눈 표다. 이 페이지는 \`scripts/gen-sources-page.mjs\`가 레지스트리에서 만들므로 직접 고치지 않는다. 재배포가 \`true\`인 출처만 원문을 발췌하고, \`false\`인 출처는 사실만 다시 썼다. 라이선스를 어떻게 적용하는지는 [라이선스 적용 방법](./license.mdx)에 있다.`,
    header: '| id | 제목 | 저작자 | 라이선스 | 커밋 | 재배포 |',
    yes: '가능',
    no: '불가',
  },
  en: {
    categories: {
      project: 'Material from this repository',
      'cc-by': 'CC BY',
      permissive: 'MIT, BSD, Apache',
      gpl: 'GPL',
      'polyform-nc': 'PolyForm Noncommercial (noncommercial)',
      'facts-only': 'Facts rewritten only (no redistribution)',
    },
    title: 'Source list',
    description: (n) => `The ${n} sources the wiki uses, grouped into tables by license. Each row gives the id, title, author, license, commit and whether redistribution is allowed.`,
    lead: (n) =>
      `This page splits the ${n} entries of the source registry by license type. \`scripts/gen-sources-page.mjs\` builds it from the registry, so do not edit it by hand. Only sources with redistribution \`true\` are excerpted; for sources with \`false\` the wiki rewrites the facts only. How the licenses are applied is described in [How licenses are applied](./license.mdx).`,
    header: '| id | Title | Author | License | Commit | Redistribution |',
    yes: 'Yes',
    no: 'No',
  },
};

const localized = (e, lang) =>
  lang === 'en'
    ? {
        ...e,
        title: e.title_en ?? e.title,
        license: e.license_en ?? e.license,
        author: e.author_en ?? e.author,
        commit: e.commit_en ?? e.commit,
      }
    : e;

// Free-text license -> category key. `redistribute: false` always means facts-only.
export function categorize(entry) {
  if (entry.redistribute !== true) return 'facts-only';
  const l = String(entry.license ?? '');
  if (/PolyForm/i.test(l)) return 'polyform-nc';
  if (/^이 프로젝트/.test(l)) return 'project';
  if (/GPL/i.test(l)) return 'gpl';
  if (/CC[ -]BY/i.test(l)) return 'cc-by';
  if (/\b(MIT|BSD|Apache)\b/i.test(l)) return 'permissive';
  return 'facts-only';
}

// Escape text for a Markdown table cell inside MDX (no bare braces, angle brackets or pipes).
export function esc(text) {
  return String(text ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .split(/(`[^`]*`)/)
    .map((part, i) =>
      i % 2 === 1
        ? part.replace(/\|/g, '\\|')
        : part
            .replace(/&/g, '&amp;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\|/g, '\\|'),
    )
    .join('');
}

function titleCell(e) {
  const t = esc(e.title);
  if (e.url && /^https?:\/\/[^\s)]+$/.test(e.url)) return `[${t}](${e.url})`;
  return e.path ? `${t} (\`${String(e.path).replace(/`/g, '')}\`)` : t;
}

export function renderSourcesPage(sources, lang = 'ko') {
  const t = TEXT[lang];
  const ids = Object.keys(sources).sort();
  const groups = new Map(CATEGORIES.map(([k]) => [k, []]));
  for (const id of ids) groups.get(categorize(sources[id])).push(id);
  const lines = [
    '---',
    `title: ${t.title}`,
    `description: ${t.description(ids.length)}`,
    'sidebar_position: 2',
    'sources:',
    '  - repo-guide',
    '---',
    '',
    t.lead(ids.length),
    '',
  ];
  for (const [key] of CATEGORIES) {
    const list = groups.get(key);
    if (!list.length) continue;
    lines.push(`## ${t.categories[key]} (${list.length})`, '', t.header, '| --- | --- | --- | --- | --- | --- |');
    for (const id of list) {
      const e = localized(sources[id], lang);
      lines.push(`| \`${id}\` | ${titleCell(e)} | ${esc(e.author ?? '')} | ${esc(e.license)} | ${esc(e.commit ?? '')} | ${e.redistribute ? t.yes : t.no} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const src = process.argv[2] ?? path.resolve(here, '../src/data/sources.json');
  const out = process.argv[3] ?? path.resolve(here, '../docs/reference/sources.mdx');
  const outEn = process.argv[4] ?? path.resolve(here, '../i18n/en/docusaurus-plugin-content-docs/current/reference/sources.mdx');
  const sources = JSON.parse(fs.readFileSync(src, 'utf8'));
  for (const [file, lang] of [[out, 'ko'], [outEn, 'en']]) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, renderSourcesPage(sources, lang));
    console.log(`wrote ${file} (${Object.keys(sources).length} sources)`);
  }
}
