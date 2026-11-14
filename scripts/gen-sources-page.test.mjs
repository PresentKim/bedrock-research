import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { categorize, esc, renderSourcesPage } from './gen-sources-page.mjs';
import { checkPage } from './lib.mjs';

const base = { title: 'T', url: 'https://x.example/r', accessed: '2026-11-13' };
const S = {
  'zz-mit': { ...base, license: 'MIT (Copyright 2024 a)', redistribute: true, author: 'a', commit: 'abc1234' },
  'cc-one': { ...base, license: 'CC BY 4.0', redistribute: true },
  'ms-learn': { ...base, license: 'CC BY 4.0 (문서), MIT (코드)', redistribute: true },
  'gpl-one': { ...base, license: 'GPL-3.0 (플러그인은 예외)', redistribute: true },
  'nc-one': { ...base, license: 'PolyForm Noncommercial License 1.0.0', redistribute: true },
  'mine': { title: 'M', path: 'guide/', license: '이 프로젝트 자료', redistribute: true, accessed: '2026-11-13' },
  'closed': { ...base, license: 'All rights reserved', redistribute: false },
  'weird': { ...base, title: 'A | {b} <c>', license: 'MIT', redistribute: false },
};

test('test_categorize_by_license_and_redistribute', () => {
  assert.equal(categorize(S['zz-mit']), 'permissive');
  assert.equal(categorize(S['cc-one']), 'cc-by');
  assert.equal(categorize(S['ms-learn']), 'cc-by');
  assert.equal(categorize(S['gpl-one']), 'gpl');
  assert.equal(categorize(S['nc-one']), 'polyform-nc');
  assert.equal(categorize(S.mine), 'project');
  assert.equal(categorize(S.closed), 'facts-only');
  // redistribute:false wins over a permissive-looking license
  assert.equal(categorize(S.weird), 'facts-only');
});

test('test_esc_neutralises_mdx_and_table_chars', () => {
  assert.equal(esc('a|b {c} <d>'), 'a\\|b &#123;c&#125; &lt;d&gt;');
  assert.equal(esc('x `a|b` y'), 'x `a\\|b` y');
});

test('test_page_has_all_ids_grouped_and_sorted', () => {
  const md = renderSourcesPage(S);
  for (const id of Object.keys(S)) assert.ok(md.includes(`| \`${id}\` |`), id);
  assert.ok(md.indexOf('## CC BY') < md.indexOf('## MIT, BSD, Apache'));
  assert.ok(md.indexOf('## MIT, BSD, Apache') < md.indexOf('## GPL'));
  assert.ok(md.indexOf('## GPL') < md.indexOf('## PolyForm'));
  assert.ok(md.indexOf('| `cc-one` |') < md.indexOf('| `ms-learn` |'));
  assert.match(md, /\| `closed` \|.*\| 불가 \|/);
  assert.match(md, /\| `zz-mit` \|.*\| abc1234 \| 가능 \|/);
});

test('test_cli_writes_page_that_passes_check', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'gsp-'));
  const src = path.join(d, 'sources.json');
  fs.writeFileSync(src, JSON.stringify({ ...S, 'repo-guide': S.mine }));
  const out = path.join(d, 'docs', 'reference', 'sources.mdx');
  const outEn = path.join(d, 'i18n', 'en', 'current', 'reference', 'sources.mdx');
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'gen-sources-page.mjs');
  execFileSync(process.execPath, [script, src, out, outEn]);
  for (const f of [out, outEn]) {
    fs.writeFileSync(path.join(path.dirname(f), 'license.mdx'), 'x\n'); // link target of the generated page
    assert.deepEqual(checkPage(f, { ...S, 'repo-guide': S.mine }), []);
  }
});

test('test_english_page_uses_english_fields', () => {
  const md = renderSourcesPage({ ...S, mine: { ...S.mine, title_en: 'Mine EN', license_en: 'This project' } }, 'en');
  assert.match(md, /^title: Source list$/m);
  assert.match(md, /## Material from this repository \(1\)/);
  assert.match(md, /\| `mine` \| Mine EN .*\| This project \|/);
  assert.match(md, /\| `closed` \|.*\| No \|/);
});
