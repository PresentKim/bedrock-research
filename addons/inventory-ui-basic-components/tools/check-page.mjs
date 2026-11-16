import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGE_BASE, PAGE_SLOTS, pageContext } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error("usage: node tools/check-page.mjs <key> [<key>...]");
  process.exit(1);
}

function buttonSlots(node, found = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => buttonSlots(n, found));
  else if (node && typeof node === "object") {
    if (node.type === "button" && typeof node.collection_index === "number" && node.button_mappings?.some((m) => m.to_button_id === "button.container_auto_place")) found.add(node.collection_index);
    Object.values(node).forEach((v) => buttonSlots(v, found));
  }
  return found;
}

let failed = false;
for (const key of keys) {
  const { page } = await import(pathToFileURL(join(here, "..", "bp", "scripts", "pages", `${key}.js`)).href);
  const { ui } = await import(pathToFileURL(join(here, "pages", `${key}.mjs`)).href);
  const problems = [];
  if (ui.page !== page) problems.push("ui.page is not the script page object");
  if (page.key !== key) problems.push(`page.key is ${page.key}`);
  for (const n of page.buttons) if (n < 0 || n >= PAGE_SLOTS) problems.push(`button slot ${n} out of 0..${PAGE_SLOTS - 1}`);
  const ctx = pageContext(key);
  const body = { type: "panel", size: [394, 168], controls: ui.build(ctx) };
  const used = buttonSlots(body);
  const declared = new Set(page.buttons.map((n) => PAGE_BASE + n));
  const missing = [...declared].filter((s) => !used.has(s));
  const extra = [...used].filter((s) => !declared.has(s));
  if (missing.length) problems.push(`buttons declared but not in UI: ${missing.map((s) => s - PAGE_BASE)}`);
  if (extra.length) problems.push(`buttons in UI but not declared: ${extra.map((s) => s - PAGE_BASE)}`);
  const state = page.init();
  const buttonSet = new Set(page.buttons);
  for (const n of page.buttons) {
    const values = page.render(state);
    for (const [local, value] of Object.entries(values)) {
      if (Number(local) < 0 || Number(local) >= PAGE_SLOTS) problems.push(`render writes slot ${local}`);
      if (buttonSet.has(Number(local))) problems.push(`render writes button slot ${local}`);
      if (typeof value !== "string") problems.push(`render slot ${local} is not a string`);
      else if (/^-?\d+(\.\d+)?$/.test(value)) problems.push(`render slot ${local} is digits only ("${value}"), it will not draw as text`);
    }
    page.press(state, n);
    page.tick?.(state);
  }
  JSON.stringify(body);
  console.log(`${key}: ${problems.length ? "FAIL" : "ok"} (${page.buttons.length} buttons, ${Object.keys(ctx.defs).length} defs)`);
  for (const p of problems) console.log(`  ${p}`);
  if (problems.length) failed = true;
}
process.exit(failed ? 1 : 0);
