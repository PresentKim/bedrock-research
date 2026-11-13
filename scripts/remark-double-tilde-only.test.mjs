import test from 'node:test';
import assert from 'node:assert/strict';
import { compileSync } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkDoubleTildeOnly from '../src/plugins/remark-double-tilde-only.mjs';

const compile = (md) => String(compileSync(md, { remarkPlugins: [remarkGfm, remarkDoubleTildeOnly] }));

test('keeps single tilde ranges as text', () => {
  const out = compile('40~50명, 대기 800~1000MB');
  assert.doesNotMatch(out, /\bdel\b/);
  assert.equal(out.match(/"~"/g)?.length, 2);
});

test('keeps double tilde strikethrough', () => {
  assert.match(compile('~~old~~ new'), /\bdel\b/);
});
