import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NS, TITLE, SLOT, PAGE_BASE, PICKER_BASE, COLOR, rect, label, slotLabel, slotButton, whenSlot, pageContext } from "./lib.mjs";
import { UI_PAGES } from "./pages/index.mjs";
import { PAGES } from "../bp/scripts/pages/index.js";

const WINDOW = [410, 214];
const CONTENT = [394, 168];
const CONTENT_AT = [8, 28];
const PICKER_COLUMNS = 5;
const PICKER_CELL = [74, 14];

const uiDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui");

function buttonSlots(node, found = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => buttonSlots(n, found));
  else if (node && typeof node === "object") {
    if (node.type === "button" && typeof node.collection_index === "number" && node.button_mappings?.some((m) => m.to_button_id === "button.container_auto_place")) found.add(node.collection_index);
    Object.values(node).forEach((v) => buttonSlots(v, found));
  }
  return found;
}

const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

const faceButton = (text) => ({
  faces: [
    { default: rect(COLOR.face, ["100%", "100%"], [0, 0], { controls: [{ shade: rect(COLOR.faceShade, ["100%", 2], [0, 0], { anchor_from: "bottom_left", anchor_to: "bottom_left" }) }] }) },
    { hover: rect(COLOR.face, ["100%", "100%"], [0, 0]) },
    { pressed: rect(COLOR.grayHalf, ["100%", "100%"], [0, 0]) },
  ],
  controls: [{ text: { type: "label", localize: false, text, color: COLOR.darkText, layer: 5, font_scale_factor: 0.6 } }],
});

const targetsVisible = (binding) => binding.target_property_name === "#visible" || binding.binding_name_override === "#visible";

function evaluateOnlyWhenVisible(node) {
  if (Array.isArray(node)) node.forEach(evaluateOnlyWhenVisible);
  else if (node && typeof node === "object") {
    if (Array.isArray(node.bindings) && !node.bindings.some(targetsVisible)) {
      node.bindings = node.bindings.map((binding) => (binding.binding_condition === "always" ? { ...binding, binding_condition: "visible" } : binding));
    }
    Object.values(node).forEach(evaluateOnlyWhenVisible);
  }
}

const defs = {};
const pageGates = [];
UI_PAGES.forEach((uiPage, index) => {
  const spec = PAGES[index];
  if (spec !== uiPage.page) throw new Error(`page order differs at ${index}: ${spec.key} vs ${uiPage.page.key}`);
  const ctx = pageContext(spec.key);
  const controls = uiPage.build(ctx);
  const body = { type: "panel", size: CONTENT, controls };
  const used = buttonSlots(body);
  const declared = new Set(spec.buttons.map((n) => PAGE_BASE + n));
  if (!sameSet(used, declared)) throw new Error(`${spec.key}: UI buttons ${[...used]} differ from script buttons ${[...declared]}`);
  evaluateOnlyWhenVisible(body);
  evaluateOnlyWhenVisible(ctx.defs);
  Object.assign(defs, ctx.defs);
  pageGates.push(whenSlot(`page_${spec.key}`, SLOT.pageKey, CONTENT, CONTENT_AT, spec.key, body, 3));
});

function picker() {
  return whenSlot("picker", SLOT.pickerState, CONTENT, CONTENT_AT, "open", {
    type: "panel", size: CONTENT,
    controls: [
      { shade: rect(COLOR.outline, CONTENT, [0, 0], { layer: 1, alpha: 0.96 }) },
      ...PAGES.map((spec, k) => slotButton(`pick_${spec.key}`, PICKER_BASE + k,
        [4 + (k % PICKER_COLUMNS) * (PICKER_CELL[0] + 3), 4 + Math.floor(k / PICKER_COLUMNS) * (PICKER_CELL[1] + 3)], PICKER_CELL, faceButton(spec.title))),
    ],
  }, 40);
}

function window() {
  return {
    type: "panel", size: WINDOW, layer: 2,
    controls: [
      { outline: rect(COLOR.outline, WINDOW, [0, 0], { layer: 1 }) },
      { body: rect(COLOR.panel, [WINDOW[0] - 2, WINDOW[1] - 2], [1, 1], { layer: 1 }) },
      label("title", "InvUI", [8, 7], { scale: 0.8 }),
      slotLabel("page_title", SLOT.pageTitle, [36, 8], [140, 9], { color: COLOR.text, scale: 0.7 }),
      slotButton("prev", SLOT.prev, [214, 5], [18, 14], faceButton("<")),
      slotButton("next", SLOT.next, [234, 5], [18, 14], faceButton(">")),
      slotButton("pick", SLOT.picker, [256, 5], [60, 14], faceButton("Pages")),
      slotLabel("footer", SLOT.footer, [322, 8], [60, 9], { scale: 0.5 }),
      { "close@common.close_button": { layer: 4 } },
      { divider: rect(COLOR.outline, [WINDOW[0] - 2, 1], [1, 23], { layer: 2 }) },
      ...pageGates,
      picker(),
      slotLabel("status", SLOT.status, [8, WINDOW[1] - 14], [WINDOW[0] - 16, 9], { scale: 0.55 }),
    ],
  };
}

function overlay() {
  return {
    type: "panel", size: ["100%", "100%"], layer: 1, $bwiki_title: "$container_title",
    controls: [
      {
        host: {
          type: "panel", size: ["100%", "100%"], ignored: `(not ($bwiki_title = '${TITLE}'))`,
          controls: [
            { entity_ui_hide_vanilla: { type: "panel", size: [0, 0], property_bag: { "#entity_ui_vanilla_visible": false } } },
            {
              cover: {
                type: "input_panel", modal: true, size: ["100%", "100%"], layer: 1,
                controls: [
                  { sync_grid: { type: "grid", size: [162, 54], grid_rescaling_type: "horizontal", maximum_grid_items: 27, collection_name: "container_items", grid_item_template: `${NS}.empty_cell` } },
                  { [`window@${NS}.window`]: {} },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

const ui = {
  namespace: NS,
  empty_cell: { type: "panel", size: [18, 18] },
  ...defs,
  window: window(),
  overlay: overlay(),
};

writeFileSync(join(uiDir, `${NS}.json`), JSON.stringify(ui) + "\n");
console.log(`wrote ${NS}.json with ${PAGES.length} pages`);
