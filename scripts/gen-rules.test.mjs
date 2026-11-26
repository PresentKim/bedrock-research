import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBullet, renderChapterPage, syncBullets, validateRuleData, gaps, rebase } from './gen-rules.mjs';

const rule = (over = {}) => ({
  id: 'BND-01',
  level: ['vanilla', 'code'],
  ko: { text: '`a|b`를 쓴다([기록](../design/x.mdx)).', sources: 'VN' },
  en: { text: 'Use `a|b` ([record](../design/x.mdx)).', sources: 'VN' },
  ...over,
});
const chapter = (rules) => ({ file: '04-bindings.json', order: 4, prefix: 'BND', slug: 'bindings', page: 'json-ui/bindings', title: { ko: '바인딩', en: 'Bindings' }, rules });

test('renders a topic bullet with level and source', () => {
  assert.equal(renderBullet(rule(), 'ko'), '- **[BND-01]** `a|b`를 쓴다([기록](../design/x.mdx)). `{바닐라, 코드}` (출처: VN)');
  assert.equal(renderBullet(rule({ status: 'proposed' }), 'en'), '- **[BND-01]** (proposal) Use `a|b` ([record](../design/x.mdx)). `{vanilla, code}` (Source: VN)');
});

test('chapter table escapes pipes and rebases links two levels deep', () => {
  const page = renderChapterPage(chapter([rule()]), 'ko');
  assert.match(page, /\| BND-01 \| `a\\\|b`를 쓴다\(\[기록\]\(\.\.\/\.\.\/design\/x\.mdx\)\)\. \| 바닐라, 코드 \| VN \|/);
  assert.match(page, /\(\.\.\/\.\.\/json-ui\/bindings\.mdx\)/);
});

test('rebases links for the page depth', () => {
  assert.equal(rebase('[x](../a.mdx)', 0), '[x](./a.mdx)');
  assert.equal(rebase('[x](../a.mdx)', 3), '[x](../../../a.mdx)');
});

test('replaces only plain rule bullets and reports unknown ids', () => {
  const src = ['- **[BND-01]** old', '- **[BND-01 보강안(미적용)]** keep', '- **[BND-99]** x', 'text'].join('\n');
  const { text, unknown } = syncBullets(src, { 'BND-01': rule() }, 'ko');
  assert.equal(text.split('\n')[0], renderBullet(rule(), 'ko'));
  assert.equal(text.split('\n')[1], '- **[BND-01 보강안(미적용)]** keep');
  assert.deepEqual(unknown, ['BND-99']);
});

test('rejects off-legend levels, duplicates and missing text', () => {
  const errs = validateRuleData([chapter([rule({ level: ['추론(채팅)'] }), rule({ en: { text: '' } })])]);
  assert.ok(errs.some((e) => e.includes('not in the legend')));
  assert.ok(errs.some((e) => e.includes('duplicate')));
  assert.ok(errs.some((e) => e.includes('missing en text')));
});

test('lists unused numbers per prefix', () => {
  assert.deepEqual(gaps([chapter([rule(), rule({ id: 'BND-04' })])]), [{ prefix: 'BND', missing: ['BND-02', 'BND-03'] }]);
});
