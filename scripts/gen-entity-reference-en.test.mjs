import test from 'node:test';
import assert from 'node:assert/strict';
import { reverseCells, translatePage, translateIndex } from './gen-entity-reference-en.mjs';

const ko = { desc: { 'minecraft:foo': '푸를 만든다.' }, cells: { 'Makes a [foo](./x.md).': '푸를 만든다.', 'A | B': '가 | 나' } };

const page = [
  '---',
  'title: 엔티티 컴포넌트 레퍼런스 (1/2)',
  'description: MS Learn 컴포넌트 문서 1개(minecraft:foo). 속성 표와 예시 JSON을 원문대로 담았다.',
  '---',
  '',
  '## minecraft&#58;foo',
  '',
  '(출처: ms-learn, `a.md`)',
  '',
  '푸를 만든다.',
  '',
  'Makes a foo.',
  '',
  '### 예시',
  '',
  '| 이름 | 설명 |',
  '| --- | --- |',
  '| x | 푸를 만든다. |',
  '| y | 가 \\| 나 |',
].join('\n');

test('restores english cells and drops the korean summary', () => {
  const leads = new Map();
  const out = translatePage(page, ko, reverseCells(ko.cells), leads);
  assert.doesNotMatch(out, /[가-힣]/);
  assert.match(out, /^title: Entity component reference \(1\/2\)$/m);
  assert.match(out, /^description: 1 MS Learn component page \(minecraft:foo\)\./m);
  assert.match(out, /\(Source: ms-learn, `a\.md`\)\n\nMakes a foo\.\n/);
  assert.match(out, /^### Samples$/m);
  assert.match(out, /^\| Name \| Description \|$/m);
  assert.match(out, /^\| x \| Makes a foo\. \|$/m);
  assert.match(out, /^\| y \| A \\\| B \|$/m);
  assert.equal(leads.get('minecraft:foo'), 'Makes a foo.');
});

test('index rows take the english lead', () => {
  const leads = new Map([['minecraft:foo', 'Makes a foo.']]);
  const out = translateIndex('| ID | 설명 |\n| --- | --- |\n| [minecraft:foo](./p.mdx#minecraftfoo) | 푸를 만든다. |', new Map(), leads);
  assert.equal(out, '| ID | Description |\n| --- | --- |\n| [minecraft:foo](./p.mdx#minecraftfoo) | Makes a foo. |');
});
