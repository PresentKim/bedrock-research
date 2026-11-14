// Packs each addons/<id>/{bp,rp} into static/downloads/<id>-v<version>.mcaddon and lists them in src/data/addons.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { zipSync } from 'fflate';

const here = path.dirname(fileURLToPath(import.meta.url));
const PACKS = ['bp', 'rp'];
const ZIP_MTIME = new Date('2026-01-01T00:00:00Z');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function listFiles(dir, base = dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((d) => {
      const p = path.join(dir, d.name);
      return d.isDirectory() ? listFiles(p, base) : [path.relative(base, p).replace(/\\/g, '/')];
    });
}

export function readAddon(dir) {
  const id = path.basename(dir);
  const packs = Object.fromEntries(PACKS.map((p) => [p, readJson(path.join(dir, p, 'manifest.json'))]));
  const script = path.join(dir, 'bp', 'scripts', 'main.js');
  const itemsDir = path.join(dir, 'bp', 'items');
  return {
    id,
    dir,
    packs,
    scriptVersion: fs.existsSync(script) ? fs.readFileSync(script, 'utf8').match(/PACK_VERSION = "([^"]+)"/)?.[1] : undefined,
    items: fs.existsSync(itemsDir)
      ? fs.readdirSync(itemsDir).map((f) => readJson(path.join(itemsDir, f))['minecraft:item'].description.identifier)
      : [],
  };
}

const versionOf = (m) => m.header.version.join('.');

export function validate(addons) {
  const errors = [];
  const uuids = new Map();
  const items = new Map();
  for (const a of addons) {
    const v = versionOf(a.packs.bp);
    for (const [kind, m] of Object.entries(a.packs)) {
      if (versionOf(m) !== v) errors.push(`${a.id}: ${kind} version ${versionOf(m)} differs from bp ${v}`);
      if (!m.header.name.endsWith(` v${v}`)) errors.push(`${a.id}: ${kind} name must end with v${v}`);
      if (!m.header.description.startsWith(`v${v} - `)) errors.push(`${a.id}: ${kind} description must start with "v${v} - "`);
      for (const u of [m.header.uuid, ...m.modules.map((x) => x.uuid)]) {
        if (uuids.has(u)) errors.push(`${a.id}: uuid ${u} also used by ${uuids.get(u)}`);
        uuids.set(u, a.id);
      }
    }
    const dep = a.packs.bp.dependencies?.find((d) => d.uuid === a.packs.rp.header.uuid);
    if (!dep) errors.push(`${a.id}: bp does not depend on rp`);
    else if (dep.version.join('.') !== v) errors.push(`${a.id}: bp depends on rp ${dep.version.join('.')}, expected ${v}`);
    if (a.scriptVersion !== undefined && a.scriptVersion !== `v${v}`) errors.push(`${a.id}: PACK_VERSION ${a.scriptVersion}, expected v${v}`);
    for (const it of a.items) {
      if (items.has(it)) errors.push(`${a.id}: item ${it} also defined by ${items.get(it)}`);
      items.set(it, a.id);
    }
  }
  return errors;
}

export function pack(addon) {
  const entries = {};
  for (const p of PACKS) {
    const root = path.join(addon.dir, p);
    for (const rel of listFiles(root)) entries[`${addon.id}_${p}/${rel}`] = [fs.readFileSync(path.join(root, rel)), { mtime: ZIP_MTIME }];
  }
  return zipSync(entries, { level: 9 });
}

export function build(addonsDir, outDir, dataFile) {
  const addons = fs
    .readdirSync(addonsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readAddon(path.join(addonsDir, d.name)));
  const errors = validate(addons);
  if (errors.length) throw new Error(errors.join('\n'));
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const data = {};
  for (const a of addons) {
    const version = versionOf(a.packs.bp);
    const file = `${a.id}-v${version}.mcaddon`;
    const bytes = pack(a);
    fs.writeFileSync(path.join(outDir, file), bytes);
    data[a.id] = { version, file, size: bytes.length, name: a.packs.bp.header.name.replace(/ BP v[\d.]+$/, ''), items: a.items };
  }
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 1));
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const data = build(path.resolve(here, '../addons'), path.resolve(here, '../static/downloads'), path.resolve(here, '../src/data/addons.json'));
    for (const [id, a] of Object.entries(data)) console.log(`packed ${a.file} (${a.size} bytes) for ${id}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
