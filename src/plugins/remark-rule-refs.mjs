import path from 'node:path';
import { ID_RE } from '../../scripts/rules.mjs';

const SKIP = new Set(['inlineCode', 'code', 'link', 'linkReference', 'heading', 'html', 'mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression']);

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });

export const anchorOf = (id) => id.toLowerCase();

function pageOf(filePath, roots) {
  if (!filePath) return null;
  const abs = path.resolve(filePath);
  for (const root of roots) {
    const rel = path.relative(root, abs);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) return rel.replace(/\\/g, '/').replace(/\.mdx?$/, '');
  }
  return null;
}

function splitText(value, rules) {
  const out = [];
  let last = 0;
  for (const m of value.matchAll(ID_RE)) {
    const rule = rules[m[1]];
    if (!rule) continue;
    if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
    out.push({
      type: 'mdxJsxTextElement',
      name: 'RuleRef',
      attributes: [attr('id', m[1]), attr('title', rule.title), attr('to', `/${rule.page}#${anchorOf(m[1])}`)],
      children: [],
    });
    last = m.index + m[0].length;
  }
  if (!out.length) return null;
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

function definitionAnchor(cell, rules, page) {
  if (cell.children.length !== 1 || cell.children[0].type !== 'text') return false;
  const id = cell.children[0].value.trim();
  if (rules[id]?.page !== page) return false;
  cell.children = [{ type: 'mdxJsxTextElement', name: 'RuleAnchor', attributes: [attr('id', anchorOf(id))], children: [{ type: 'text', value: id }] }];
  return true;
}

function walk(node, rules, page) {
  if (!Array.isArray(node.children) || SKIP.has(node.type)) return;
  if (node.type === 'tableRow' && node.children[0] && definitionAnchor(node.children[0], rules, page)) {
    node.children.slice(1).forEach((c) => walk(c, rules, page));
    return;
  }
  if (node.type === 'mdxJsxTextElement' && node.name === 'RuleRef') return;
  node.children = node.children.flatMap((child) => {
    if (child.type === 'text') return splitText(child.value, rules) ?? [child];
    walk(child, rules, page);
    return [child];
  });
}

// options.locales: [{ root: absolute docs folder, rules: { ID: { title, page } } }]
export default function remarkRuleRefs({ locales }) {
  return (tree, file) => {
    const abs = file.path ? path.resolve(file.path) : '';
    const loc = locales.find((l) => abs.startsWith(l.root + path.sep));
    if (!loc) return;
    walk(tree, loc.rules, pageOf(abs, [loc.root]));
  };
}
