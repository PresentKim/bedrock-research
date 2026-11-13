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

export function renderSourcesPage(sources) {
  const ids = Object.keys(sources).sort();
  const groups = new Map(CATEGORIES.map(([k]) => [k, []]));
  for (const id of ids) groups.get(categorize(sources[id])).push(id);
  const lines = [
    '---',
    'title: 출처 목록',
    `description: 위키가 쓴 출처 ${ids.length}개를 라이선스별 표로 모은 것이다. id, 제목, 저작자, 라이선스, 커밋, 재배포 여부를 적는다.`,
    'sidebar_position: 2',
    'sources:',
    '  - repo-guide',
    '---',
    '',
    `출처 레지스트리의 ${ids.length}개 항목을 라이선스 종류별로 나눈 표다. 이 페이지는 \`scripts/gen-sources-page.mjs\`가 레지스트리에서 만들므로 직접 고치지 않는다. 재배포가 \`true\`인 출처만 원문을 발췌하고, \`false\`인 출처는 사실만 다시 썼다. 라이선스를 어떻게 적용하는지는 [라이선스 적용 방법](./license.mdx)에 있다.`,
    '',
  ];
  for (const [key, label] of CATEGORIES) {
    const list = groups.get(key);
    if (!list.length) continue;
    lines.push(`## ${label} (${list.length})`, '', '| id | 제목 | 저작자 | 라이선스 | 커밋 | 재배포 |', '| --- | --- | --- | --- | --- | --- |');
    for (const id of list) {
      const e = sources[id];
      lines.push(`| \`${id}\` | ${titleCell(e)} | ${esc(e.author ?? '')} | ${esc(e.license)} | ${esc(e.commit ?? '')} | ${e.redistribute ? '가능' : '불가'} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const src = process.argv[2] ?? path.resolve(here, '../src/data/sources.json');
  const out = process.argv[3] ?? path.resolve(here, '../docs/reference/sources.mdx');
  const sources = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, renderSourcesPage(sources));
  console.log(`wrote ${out} (${Object.keys(sources).length} sources)`);
}
