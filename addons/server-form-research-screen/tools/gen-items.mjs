import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ITEMS = 96;
const PER_TAB = 48;
const DETAIL_BASE = 102;
const BLOCK = 20;
const MAX_MATS = 8;
const MAX_REWARDS = 8;

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui", "ffr_items.json");

function block(k) {
  const base = DETAIL_BASE + k * BLOCK;
  return {
    head: base,
    status: base + 1,
    desc: base + 2,
    mats: Array.from({ length: MAX_MATS }, (_, j) => base + 3 + j),
    rewards: Array.from({ length: MAX_REWARDS }, (_, j) => base + 3 + MAX_MATS + j),
    progress: base + 3 + MAX_MATS + MAX_REWARDS,
  };
}

function row(name, indices) {
  return {
    [name]: {
      type: "stack_panel",
      orientation: "horizontal",
      size: ["100%", 18],
      collection_name: "form_buttons",
      controls: indices.map((i, j) => ({ [`s${j}@ffr.list_slot`]: { collection_index: i } })),
    },
  };
}

function gap(name, h) {
  return { [name]: { type: "panel", size: ["100%", h] } };
}

function detailBody(b) {
  return {
    type: "stack_panel",
    orientation: "vertical",
    size: ["100% - 4px", "100%c"],
    controls: [
      {
        card: {
          type: "stack_panel",
          orientation: "horizontal",
          size: ["100%", 28],
          controls: [
            { icon_row: { type: "stack_panel", orientation: "horizontal", size: [28, 28], collection_name: "form_buttons", controls: [{ "icon@ffr.detail_icon": { collection_index: b.head } }] } },
            { gap: { type: "panel", size: [4, 28] } },
            {
              info: {
                type: "stack_panel",
                orientation: "vertical",
                size: ["fill", 28],
                collection_name: "form_buttons",
                controls: [
                  { pad: { type: "panel", size: ["100%", 3] } },
                  { "name@ffr.text_item": { collection_index: b.head } },
                  { pad2: { type: "panel", size: ["100%", 2] } },
                  { "status@ffr.text_item": { collection_index: b.status } },
                ],
              },
            },
          ],
        },
      },
      gap("gap1", 3),
      { desc: { type: "stack_panel", orientation: "vertical", size: ["100%", "100%c"], collection_name: "form_buttons", controls: [{ "d@ffr.desc_item": { collection_index: b.desc } }] } },
      gap("gap2", 4),
      { "mat_head@ffr.header_label": { text: "Materials" } },
      row("mats", b.mats),
      gap("gap3", 4),
      { "reward_head@ffr.header_label": { text: "Rewards" } },
      row("rewards", b.rewards),
    ],
  };
}

function detail(k, b) {
  return {
    type: "image",
    texture: "textures/ui/ffr/panel",
    size: [158, 136],
    controls: [
      {
        body: {
          type: "panel",
          size: ["100% - 6px", "100% - 6px"],
          offset: [3, 3],
          anchor_from: "top_left",
          anchor_to: "top_left",
          controls: [{ "scroll@ffr.detail_scroll": { $scrolling_content: `ffri.detail_body_${k}` } }],
        },
      },
      {
        go: {
          type: "stack_panel",
          orientation: "horizontal",
          size: [150, 18],
          offset: [0, -4],
          anchor_from: "bottom_middle",
          anchor_to: "bottom_middle",
          collection_name: "form_buttons",
          controls: [{ "b@ffr.progress_button": { collection_index: b.progress } }],
        },
      },
    ],
  };
}

function itemRow(tab, row, detailPrefix) {
  const toggles = [];
  for (let col = 0; col < 8; col++) {
    const pos = row * 8 + col;
    const k = tab * PER_TAB + pos;
    toggles.push({
      [`i${k}@ffr.item_toggle`]: {
        collection_index: k,
        $k: pos,
        $detail_offset: [152 - col * 18, -4 - row * 18],
        $detail_def: `ffri.${detailPrefix}_${k}`,
      },
    });
  }
  return { [`r${row}`]: { type: "stack_panel", orientation: "horizontal", size: [144, 18], collection_name: "form_buttons", controls: toggles } };
}

function tabGrid(tab, detailPrefix) {
  return {
    [`grid${tab}`]: {
      type: "stack_panel",
      orientation: "vertical",
      size: [144, 108],
      anchor_from: "top_left",
      anchor_to: "top_left",
      bindings: [
        { binding_type: "view", binding_condition: "always", source_control_name: `ffr_t${tab}`, source_property_name: "#toggle_state", target_property_name: "#visible" },
      ],
      controls: Array.from({ length: PER_TAB / 8 }, (_, row) => itemRow(tab, row, detailPrefix)),
    },
  };
}

function items(detailPrefix) {
  return {
    type: "panel",
    size: [144, 128],
    controls: [
      tabGrid(0, detailPrefix),
      tabGrid(1, detailPrefix),
      { "pagers@ffr.pagers_tabs": { anchor_from: "top_left", anchor_to: "top_left", offset: [0, 110] } },
    ],
  };
}

const ui = { namespace: "ffri" };
for (let k = 0; k < ITEMS; k++) {
  const b = block(k);
  ui[`detail_body_${k}`] = detailBody(b);
  ui[`detail_${k}`] = detail(k, b);
  ui[`lazy_${k}@ffr.lazy_detail`] = { factory: { name: `ffr_lazy_${k}`, control_name: `ffri.detail_${k}` } };
}
ui.items_f = items("lazy");

writeFileSync(out, JSON.stringify(ui) + "\n");
console.log(`wrote ${out}`);
