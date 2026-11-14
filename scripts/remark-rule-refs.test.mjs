import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { compileSync } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkRuleRefs from '../src/plugins/remark-rule-refs.mjs';
import { parseRules, cleanTitle } from './rules.mjs';

const root = path.resolve('/wiki/docs');
const rules = {
  'COL-04': { title: 'Use `#collection_length`', page: 'reference/rules' },
  'C-31': { title: 'label', page: 'json-ui/conflicts' },
};
const compile = (md, page) =>
  String(
    compileSync({ value: md, path: path.join(root, `${page}.mdx`) }, { remarkPlugins: [remarkGfm, [remarkRuleRefs, { locales: [{ root, rules }] }]] }),
  );

test('links known ids in text with title and target', () => {
  const out = compile('See COL-04와 C-31, not XYZ-01.', 'json-ui/a');
  assert.match(out, /RuleRef, \{\s*id: "COL-04",\s*title: "Use `#collection_length`",\s*to: "\/reference\/rules#col-04"/);
  assert.match(out, /to: "\/json-ui\/conflicts#c-31"/);
  assert.doesNotMatch(out, /XYZ-01"/);
});

test('leaves code, links and headings alone', () => {
  const out = compile('# COL-04 title\n\n`COL-04` [COL-04](./x.mdx)\n\n```\nCOL-04\n```\n', 'json-ui/a');
  assert.doesNotMatch(out, /RuleRef/);
});

test('anchors the defining row on its own page', () => {
  const out = compile('| ID | Rule |\n| --- | --- |\n| COL-04 | see C-31 |\n', 'reference/rules');
  assert.match(out, /id: "col-04"/);
  assert.equal(out.match(/RuleRef, \{/g)?.length, 1);
});

test('ignores files outside the docs roots', () => {
  const out = String(compileSync({ value: 'COL-04', path: '/elsewhere/a.mdx' }, { remarkPlugins: [[remarkRuleRefs, { locales: [{ root, rules }] }]] }));
  assert.doesNotMatch(out, /RuleRef/);
});

test('parses the id and second column of rule tables', () => {
  const r = parseRules('| ID | 규칙 |\n| --- | --- |\n| FILE-01 | **굵게** `a\\|b` [링크](./x.mdx) | 바닐라 |\n| PAT-04 | [x](./y.mdx) | z |\n', 'reference/rules');
  assert.deepEqual(r['FILE-01'], { title: '굵게 `a|b` 링크', page: 'reference/rules' });
  assert.equal(r['PAT-04'].title, 'x');
});

test('cleans italic markers', () => {
  assert.equal(cleanTitle('*confirmed* and **bold**'), 'confirmed and bold');
});
