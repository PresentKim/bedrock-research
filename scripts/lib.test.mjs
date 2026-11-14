import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadRegistry, checkPage, missingTranslations } from './lib.mjs';

const good = { title: 'T', url: 'https://x', license: 'MIT', redistribute: true, accessed: '2026-11-13' };
const noRe = { ...good, redistribute: false };

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'wk-')); }
function wr(dir, rel, body) {
  const f = path.join(dir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, body);
  return f;
}
const page = (fm = {}, body = 'hello\n') => {
  const m = { title: '제목', description: 'd', sidebar_position: 1, sources: ['a'], ...fm };
  const lines = Object.entries(m).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join('\n')}\n---\n\n${body}`;
};
const S = { a: good, norights: noRe };

test('test_identical_dup_ok', () => {
  const d = tmp();
  wr(d, 'a.json', JSON.stringify({ 'bedrock-wiki': good }));
  wr(d, 'b.json', JSON.stringify({ 'bedrock-wiki': { ...good } }));
  const r = loadRegistry(d);
  assert.deepEqual(r.errors, []);
  assert.ok(r.sources['bedrock-wiki']);
});

test('dup with different content errors', () => {
  const d = tmp();
  wr(d, 'a.json', JSON.stringify({ 'bedrock-wiki': good }));
  wr(d, 'b.json', JSON.stringify({ 'bedrock-wiki': { ...good, url: 'https://y' } }));
  assert.deepEqual(loadRegistry(d).errors, ['dup id bedrock-wiki: url differs']);
});

test('registry entry without license', () => {
  const d = tmp();
  const { license, ...e } = good;
  wr(d, 'a.json', JSON.stringify({ x: e }));
  assert.ok(loadRegistry(d).errors.includes('source x: missing license'));
});

test('registry bad id', () => {
  const d = tmp();
  wr(d, 'a.json', JSON.stringify({ 'Bad_Id': good }));
  assert.ok(loadRegistry(d).errors.some((e) => e.includes('Bad_Id')));
});

test('ok page', () => {
  const d = tmp();
  assert.deepEqual(checkPage(wr(d, 'docs/a.mdx', page()), S), []);
});

test('missing title', () => {
  const d = tmp();
  assert.ok(checkPage(wr(d, 'docs/a.mdx', page({ title: undefined })), S).includes('missing title'));
});

test('missing / empty sources', () => {
  const d = tmp();
  assert.ok(checkPage(wr(d, 'docs/a.mdx', page({ sources: [] })), S).includes('missing sources'));
  assert.ok(checkPage(wr(d, 'docs/b.mdx', page({ sources: undefined })), S).includes('missing sources'));
});

test('unknown source', () => {
  const d = tmp();
  assert.ok(checkPage(wr(d, 'docs/a.mdx', page({ sources: ['nope'] })), S).includes('unknown source nope'));
});

test('excerpt from non-redistributable', () => {
  const d = tmp();
  const f = wr(d, 'docs/b.mdx', page({}, '<Excerpt src="norights" title="t">\n\ntext\n\n</Excerpt>\n'));
  assert.ok(checkPage(f, S).includes('excerpt from non-redistributable source norights'));
});

test('excerpt unknown src', () => {
  const d = tmp();
  const f = wr(d, 'docs/b.mdx', page({}, '<Excerpt src="zzz" title="t">\n\ntext\n\n</Excerpt>\n'));
  assert.ok(checkPage(f, S).includes('unknown source zzz'));
});

test('test_relative_escape', () => {
  const d = tmp();
  const f = wr(d, 'wiki/docs/sec/a.mdx', page({}, 'see [x](../../guide/x.md)\n'));
  assert.ok(checkPage(f, S).includes('link leaves wiki/docs'));
});

test('relative link to existing page ok, missing flagged', () => {
  const d = tmp();
  wr(d, 'wiki/docs/sec/b.mdx', page());
  const f = wr(d, 'wiki/docs/sec/a.mdx', page({}, '[b](./b.mdx) [c](./c.mdx) [abs](/sec/b) [e](https://e.com)\n'));
  const errs = checkPage(f, S);
  assert.deepEqual(errs, ['broken link ./c.mdx']);
});

test('links inside code are ignored', () => {
  const d = tmp();
  const f = wr(d, 'wiki/docs/sec/a.mdx', page({}, '`](../../x.md)`\n\n```\n[a](../../y.md)\n```\n'));
  assert.deepEqual(checkPage(f, S), []);
});

test('test_mdx_brace', () => {
  const d = tmp();
  const f = wr(d, 'docs/a.mdx', page({}, '검증 수준은 {바닐라} 이다\n'));
  const errs = checkPage(f, S);
  assert.equal(errs.length, 1);
  assert.match(errs[0], /^mdx: /);
});

test('lists pages without a translation', () => {
  const d = tmp();
  wr(d, 'docs/a.mdx', page());
  wr(d, 'docs/sec/b.mdx', page());
  wr(d, 'i18n/current/a.mdx', page());
  assert.deepEqual(missingTranslations(path.join(d, 'docs'), path.join(d, 'i18n/current')), [path.join('sec', 'b.mdx')]);
});

test('links in translated pages resolve inside current', () => {
  const d = tmp();
  wr(d, 'i18n/en/current/sec/b.mdx', page());
  const f = wr(d, 'i18n/en/current/sec/a.mdx', page({}, '[b](./b.mdx) [x](../../outside.mdx)\n'));
  assert.deepEqual(checkPage(f, S), ['link leaves wiki/docs']);
});

test('braces in code are fine', () => {
  const d = tmp();
  const f = wr(d, 'docs/a.mdx', page({}, '`{바닐라}`\n\n```json\n{"a": 1}\n```\n'));
  assert.deepEqual(checkPage(f, S), []);
});
