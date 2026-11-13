import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, parseEntry, renderEntry, paginate, generate, loadEntries } from './gen-entity-reference.mjs';
import { loadRegistry, checkPage, walk } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const REL = 'creator/Reference/Content/EntityReference/Examples';
const ko = { desc: { 'minecraft:foo': '푸를 정의한다.' }, cells: { 'Some text': '어떤 텍스트' } };

const mkSrc = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ger-'));
  const base = path.join(root, REL);
  for (const d of ['EntityComponents', 'EntityGoals']) fs.mkdirSync(path.join(base, d), { recursive: true });
  const doc = (id, extra = '') =>
    `---\ntitle: "Entity Documentation - ${id}"\n---\n\n# Entity Documentation - ${id}\n\nLead with {braces} and <tags> & more.\n\n## Foo Properties\n\n|Name |Default Value |Type |Description |\n|:--|:--|:--|:--|\n| a | {"x":1} | String | Some text |\n| b | | String | pipe a|b here |\n\n## Samples\n\n#### [S](https://example.com/a?b=1&c=2)\n\n\`\`\`json\n"${id}": { "k": [1, 2] }\n\`\`\`\n${extra}`;
  fs.writeFileSync(path.join(base, 'EntityComponents', 'minecraftComponent_foo.md'), doc('minecraft:foo'));
  fs.writeFileSync(path.join(base, 'EntityComponents', 'minecraftComponent_bar.md'), doc('minecraft:bar'));
  fs.writeFileSync(path.join(base, 'EntityGoals', 'minecraftBehavior_baz.md'), doc('minecraft:behavior.baz'));
  // duplicate copy of the same goal without the `minecraft:` title prefix
  fs.writeFileSync(path.join(base, 'EntityGoals', 'minecraftBehavior_baz2.md'), doc('behavior.baz'));
  for (const f of ['EventList.md', 'FilterList.md', 'TriggerList.md', 'EventActions.md']) {
    fs.writeFileSync(path.join(base, f), `---\ntitle: t\n---\n\n# Entity Documentation - X\n\n|A |B|\n|:-|:-|\n| [l](x.md) | y |\n`);
  }
  return root;
};

test('test_esc_escapes_mdx_outside_code_only', () => {
  assert.equal(esc('a {b} <c> & d'), 'a &#123;b&#125; &lt;c&gt; &amp; d');
  assert.equal(esc('keep `{x}` and [t](https://e.com/?a=1&b=2)'), 'keep `{x}` and [t](https://e.com/?a=1&b=2)');
  assert.equal(esc('a|b `c|d`', { cell: true }), 'a\\|b `c\\|d`');
});

test('test_paginate_respects_limit_and_keeps_big_entry_alone', () => {
  const mk = (n) => ({ lines: new Array(n).fill('x') });
  const pages = paginate([mk(300), mk(200), mk(200), mk(900), mk(10)], 600);
  assert.deepEqual(pages.map((p) => p.map((r) => r.lines.length)), [[300, 200], [200], [900], [10]]);
});

test('test_blockquote_marker_kept', () => {
  const e = parseEntry('# Entity Documentation - minecraft:q\n\nLead.\n\n> [!Note]\n> a <b>\n', 'f.md', 'component');
  const out = renderEntry(e, ko, 'p').join('\n');
  assert.match(out, /^> \[!Note\]$/m);
  assert.match(out, /^> a &lt;b&gt;$/m);
});

test('test_generate_pages_index_and_translation', () => {
  const src = mkSrc();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ger-out-'));
  fs.writeFileSync(path.join(out, 'entity-old-1.mdx'), 'stale');
  const r = generate(src, out, ko);
  assert.equal(r.components, 2);
  assert.equal(r.goals, 1, 'duplicate goal file collapses to one entry');
  assert.deepEqual(r.skipped, ['minecraftBehavior_baz2.md']);
  assert.ok(!fs.existsSync(path.join(out, 'entity-old-1.mdx')), 'stale entity pages removed');
  const page = fs.readFileSync(path.join(out, 'entity-components-1.mdx'), 'utf8');
  assert.match(page, /^## minecraft&#58;bar$/m, 'colon is entity-escaped so remark-directive leaves the heading slug alone');
  assert.match(page, /푸를 정의한다\./);
  assert.match(page, /\| a \| &#123;"x":1&#125; \| String \| 어떤 텍스트 \|/);
  assert.match(page, /pipe a\\\|b here/);
  assert.match(page, /^sources:\n {2}- ms-learn$/m);
  assert.match(page, /\(출처: ms-learn, `creator\/Reference\/Content\/EntityReference\/Examples\/EntityComponents\/minecraftComponent_foo\.md`\)/);
  assert.match(page, /"minecraft:foo": \{ "k": \[1, 2\] \}/, 'code fences are untouched');
  const idx = fs.readFileSync(path.join(out, 'entity-index.mdx'), 'utf8');
  assert.match(idx, /\[minecraft:foo\]\(\.\/entity-components-1\.mdx#minecraftfoo\) \| 푸를 정의한다\. \|/);
  assert.match(idx, /\[minecraft:behavior\.baz\]\(\.\/entity-goals-1\.mdx#minecraftbehaviorbaz\)/);
  // every generated page must pass the wiki checker (MDX compiles, links resolve, sources known)
  const { sources } = loadRegistry(path.resolve(here, '../sources'));
  for (const f of walk(out)) assert.deepEqual(checkPage(f, sources), [], f);
});

const EXT = process.env.MS_LEARN_DIR;
test('test_counts_match_source_files', { skip: !fs.existsSync(path.join(EXT ?? '/nonexistent', REL)) && 'set MS_LEARN_DIR to a minecraft-creator checkout' }, () => {
  const base = path.join(EXT, REL);
  const comp = fs.readdirSync(path.join(base, 'EntityComponents')).filter((f) => /^minecraftComponent_.*\.md$/.test(f)).length;
  const goalFiles = fs.readdirSync(path.join(base, 'EntityGoals')).filter((f) => /^minecraftBehavior_.*\.md$/.test(f)).length;
  const { components, goals, skipped } = loadEntries(EXT);
  assert.equal(components.length, comp);
  assert.equal(goals.length + skipped.length, goalFiles, 'every goal file is either generated or a reported duplicate');
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ger-all-'));
  const kof = JSON.parse(fs.readFileSync(path.join(here, 'entity-reference-ko.json'), 'utf8'));
  generate(EXT, out, kof);
  const idx = fs.readFileSync(path.join(out, 'entity-index.mdx'), 'utf8');
  assert.equal((idx.match(/^\| \[minecraft:behavior\./gm) ?? []).length, goals.length);
  assert.equal((idx.match(/^\| \[minecraft:(?!behavior\.)/gm) ?? []).length, components.length);
  for (const e of [...components, ...goals]) assert.ok(kof.desc[e.id], `missing Korean description for ${e.id}`);
});

// Untranslated English sentence in a generated table description cell: no Hangul, and at least two plain words outside code.
export function untranslatedCells(mdx) {
  const bad = [];
  const lines = mdx.split('\n');
  let di = -1;
  let fence = false;
  for (const l of lines) {
    if (/^(```|~~~)/.test(l)) fence = !fence;
    if (fence || !/^\|/.test(l)) {
      di = -1;
      continue;
    }
    const cells = l.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((s) => s.trim());
    if (cells.includes('설명')) {
      di = cells.indexOf('설명');
      continue;
    }
    if (di < 0 || /^[-\s|]+$/.test(l)) continue;
    const c = (cells[di] ?? '').replace(/`[^`]*`/g, '').replace(/&#?\w+;/g, ' ');
    if (!/[가-힣]/.test(c) && /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(c)) bad.push(cells[di]);
  }
  return bad;
}

test('test_untranslated_cell_detector', () => {
  const t = (cell) => untranslatedCells(`| 이름 | 설명 |\n| --- | --- |\n| a | ${cell} |\n`);
  assert.deepEqual(t('The distance in blocks.'), ['The distance in blocks.']);
  assert.deepEqual(t('블록 거리.'), []);
  assert.deepEqual(t('`some code` only'), []);
  assert.deepEqual(t('minecraft:foo'), []);
  assert.deepEqual(t('0.5'), []);
  assert.deepEqual(t('String'), []);
});

test('test_generated_pages_have_no_untranslated_description_cells', () => {
  const dir = path.resolve(here, '../docs/content/reference');
  const files = fs.readdirSync(dir).filter((f) => /^entity-(components|goals)-\d+\.mdx$/.test(f));
  assert.ok(files.length > 0, 'generated entity pages exist');
  const bad = files.flatMap((f) => untranslatedCells(fs.readFileSync(path.join(dir, f), 'utf8')).map((c) => `${f}: ${c}`));
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} untranslated description cells; add them to entity-reference-ko.json cells`);
});
