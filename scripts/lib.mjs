import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { compileSync } from '@mdx-js/mdx';

const ID_RE = /^[a-z0-9-]+$/;

export function loadRegistry(dir) {
  const sources = {};
  const errors = [];
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    } catch (e) {
      errors.push(`${f}: invalid JSON (${e.message})`);
      continue;
    }
    for (const [id, e] of Object.entries(data)) {
      if (!ID_RE.test(id)) errors.push(`source ${id}: invalid id`);
      if (id in sources) {
        const prev = sources[id];
        const keys = new Set([...Object.keys(prev), ...Object.keys(e)]);
        const diff = [...keys].find((k) => JSON.stringify(prev[k]) !== JSON.stringify(e[k]));
        if (diff) errors.push(`dup id ${id}: ${diff} differs`);
        continue;
      }
      sources[id] = e;
      if (!e.title) errors.push(`source ${id}: missing title`);
      if (!e.url && !e.path) errors.push(`source ${id}: missing url or path`);
      if (!e.license) errors.push(`source ${id}: missing license`);
      if (typeof e.redistribute !== 'boolean') errors.push(`source ${id}: missing redistribute`);
      if (!e.accessed) errors.push(`source ${id}: missing accessed`);
    }
  }
  return { sources, errors };
}

function stripCode(text) {
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
}

function docsRoot(file) {
  const abs = path.resolve(file);
  const parts = abs.split(path.sep);
  const i = parts.lastIndexOf('docs');
  return i < 0 ? null : parts.slice(0, i + 1).join(path.sep);
}

// Bare `{...}` is a valid JS expression in MDX (e.g. `{바닐라}`) and fails only at render time, so reject it.
function noExpressions() {
  return (tree) => {
    const walkNode = (n) => {
      if (n.type === 'mdxFlowExpression' || n.type === 'mdxTextExpression') {
        const e = new Error(`expression {${n.value}} outside code; wrap it in backticks`);
        e.line = n.position?.start.line;
        throw e;
      }
      (n.children ?? []).forEach(walkNode);
    };
    walkNode(tree);
  };
}

export function checkPage(file, sources) {
  const errs = [];
  const raw = fs.readFileSync(file, 'utf8');
  let fm, body;
  try {
    ({ data: fm, content: body } = matter(raw));
  } catch (e) {
    return [`frontmatter: ${e.message.split('\n')[0]}`];
  }
  if (!fm.title) errs.push('missing title');
  if (!fm.description) errs.push('missing description');
  if (fm.sidebar_position === undefined) errs.push('missing sidebar_position');
  if (!Array.isArray(fm.sources) || fm.sources.length === 0) errs.push('missing sources');
  else for (const s of fm.sources) if (!sources[s]) errs.push(`unknown source ${s}`);

  const text = stripCode(body);
  for (const m of text.matchAll(/<Excerpt\b[^>]*?\bsrc=["']([^"']+)["']/g)) {
    const s = m[1];
    if (!sources[s]) errs.push(`unknown source ${s}`);
    else if (sources[s].redistribute !== true) errs.push(`excerpt from non-redistributable source ${s}`);
  }

  const root = docsRoot(file);
  for (const m of text.matchAll(/\]\(\s*<?([^)\s>]+)/g)) {
    const target = m[1];
    if (!/^\.\.?\//.test(target)) continue;
    const clean = target.split('#')[0].split('?')[0];
    const resolved = path.resolve(path.dirname(file), clean);
    if (root && resolved !== root && !resolved.startsWith(root + path.sep)) {
      errs.push('link leaves wiki/docs');
    } else if (!fs.existsSync(resolved)) {
      errs.push(`broken link ${target}`);
    }
  }

  try {
    compileSync(body, { format: 'mdx', remarkPlugins: [noExpressions] });
  } catch (e) {
    errs.push(`mdx: ${String(e.reason || e.message).split('\n')[0]}${e.line ? ` (line ${e.line})` : ''}`);
  }
  return [...new Set(errs)];
}

export function walk(p) {
  const st = fs.statSync(p);
  if (st.isFile()) return /\.mdx?$/.test(p) ? [p] : [];
  return fs.readdirSync(p).sort().flatMap((n) => walk(path.join(p, n)));
}
