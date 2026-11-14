import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { unzipSync } from 'fflate';
import { build, readAddon, validate } from './build-addons.mjs';

function manifest(kind, v, uuid, extra = {}) {
  return {
    format_version: 2,
    header: { name: `T ${kind.toUpperCase()} v${v.join('.')}`, description: `v${v.join('.')} - t`, uuid, version: v },
    modules: [{ type: kind === 'bp' ? 'data' : 'resources', uuid: `${uuid}-m`, version: [1, 0, 0] }],
    ...extra,
  };
}

function addon(root, id, { v = [1, 2, 3], rpv = v, dep = v, script = `v${v.join('.')}`, item = `t:${id}` } = {}) {
  const dir = path.join(root, id);
  const w = (rel, data) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), typeof data === 'string' ? data : JSON.stringify(data));
  };
  w('rp/manifest.json', manifest('rp', rpv, `${id}-rp`));
  w('bp/manifest.json', manifest('bp', v, `${id}-bp`, { dependencies: [{ uuid: `${id}-rp`, version: dep }] }));
  w('bp/scripts/main.js', `const PACK_VERSION = "${script}";`);
  w('bp/items/a.json', { 'minecraft:item': { description: { identifier: item } } });
  w('rp/texts/en_US.lang', 'x=y\n');
  w('tools/gen.mjs', '');
  return dir;
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'addons-'));

test('accepts a consistent add-on', () => {
  assert.deepEqual(validate([readAddon(addon(tmp(), 'a'))]), []);
});

test('reports version mismatches', () => {
  const errs = validate([readAddon(addon(tmp(), 'a', { rpv: [1, 2, 4], dep: [1, 2, 0], script: 'v1.0.0' }))]);
  assert.ok(errs.some((e) => /rp version 1\.2\.4/.test(e)));
  assert.ok(errs.some((e) => /depends on rp 1\.2\.0/.test(e)));
  assert.ok(errs.some((e) => /PACK_VERSION v1\.0\.0/.test(e)));
});

test('reports items shared between add-ons', () => {
  const root = tmp();
  const errs = validate([readAddon(addon(root, 'a', { item: 't:x' })), readAddon(addon(root, 'b', { item: 't:x' }))]);
  assert.ok(errs.some((e) => /item t:x also defined by a/.test(e)));
});

test('packs bp and rp under the add-on id with the version in the file name', () => {
  const root = tmp();
  addon(path.join(root, 'addons'), 'demo');
  const data = build(path.join(root, 'addons'), path.join(root, 'out'), path.join(root, 'data.json'));
  assert.equal(data.demo.file, 'demo-v1.2.3.mcaddon');
  assert.deepEqual(data.demo.items, ['t:demo']);
  const files = Object.keys(unzipSync(fs.readFileSync(path.join(root, 'out', 'demo-v1.2.3.mcaddon')))).sort();
  assert.deepEqual(files, ['demo_bp/items/a.json', 'demo_bp/manifest.json', 'demo_bp/scripts/main.js', 'demo_rp/manifest.json', 'demo_rp/texts/en_US.lang']);
});
