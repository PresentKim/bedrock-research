import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PER_PAGE = 48;
const BLOCK = 20;
const MAX_MATS = 8;
const MAX_REWARDS = 8;

export const SERVER_PAGES = { slots: 96, detailBase: 102 };
export const CLIENT_PAGES = { pagesPerTab: 3, slots: 2 * 3 * PER_PAGE, tabBase: 288, pageLabelBase: 290, detailBase: 296 };

const uiDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui");

function block(k, detailBase) {
  const base = detailBase + k * BLOCK;
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

function detail(ns, k, b) {
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
          controls: [{ "scroll@ffr.detail_scroll": { $scrolling_content: `${ns}.detail_body_${k}` } }],
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

function addDetails(ui, ns, slots, detailBase, factoryPrefix) {
  for (let k = 0; k < slots; k++) {
    const b = block(k, detailBase);
    ui[`detail_body_${k}`] = detailBody(b);
    ui[`detail_${k}`] = detail(ns, k, b);
    ui[`lazy_${k}@ffr.lazy_detail`] = { factory: { name: `${factoryPrefix}_lazy_${k}`, control_name: `${ns}.detail_${k}` } };
  }
}

function itemRow(ns, firstSlot, firstK, r) {
  const toggles = [];
  for (let col = 0; col < 8; col++) {
    const pos = r * 8 + col;
    const k = firstSlot + pos;
    toggles.push({
      [`i${k}@ffr.item_toggle`]: {
        collection_index: k,
        $k: firstK + pos,
        $detail_offset: [152 - col * 18, -4 - r * 18],
        $detail_def: `${ns}.lazy_${k}`,
      },
    });
  }
  return { [`r${r}`]: { type: "stack_panel", orientation: "horizontal", size: [144, 18], collection_name: "form_buttons", controls: toggles } };
}

const rows = (ns, firstSlot, firstK) => Array.from({ length: PER_PAGE / 8 }, (_, r) => itemRow(ns, firstSlot, firstK, r));

const visibleFrom = (control) => ({
  binding_type: "view",
  binding_condition: "always",
  source_control_name: control,
  source_property_name: "#toggle_state",
  target_property_name: "#visible",
});

function serverPagesUi() {
  const ui = { namespace: "ffri" };
  addDetails(ui, "ffri", SERVER_PAGES.slots, SERVER_PAGES.detailBase, "ffr");
  const tabGrid = (tab) => ({
    [`grid${tab}`]: {
      type: "stack_panel",
      orientation: "vertical",
      size: [144, 108],
      anchor_from: "top_left",
      anchor_to: "top_left",
      bindings: [visibleFrom(`ffr_t${tab}`)],
      controls: rows("ffri", tab * PER_PAGE, 0),
    },
  });
  ui.items_f = {
    type: "panel",
    size: [144, 128],
    controls: [tabGrid(0), tabGrid(1), { "pagers@ffr.pagers_tabs": { anchor_from: "top_left", anchor_to: "top_left", offset: [0, 110] } }],
  };
  return ui;
}

function clientPagesUi() {
  const { pagesPerTab, pageLabelBase, slots, detailBase } = CLIENT_PAGES;
  const ui = { namespace: "ffrg" };
  addDetails(ui, "ffrg", slots, detailBase, "ffrg");
  const tabs = [];
  for (let t = 0; t < 2; t++) {
    const controls = [];
    for (let p = 0; p < pagesPerTab; p++) {
      const toggle = `ffrg_p${t}_${p}`;
      ui[`page_${t}_${p}`] = {
        type: "stack_panel",
        orientation: "vertical",
        size: [144, 108],
        anchor_from: "top_left",
        anchor_to: "top_left",
        bindings: [visibleFrom(toggle)],
        controls: rows("ffrg", (t * pagesPerTab + p) * PER_PAGE, p * PER_PAGE),
      };
      ui[`lazy_page_${t}_${p}`] = {
        type: "stack_panel",
        size: [144, 108],
        anchor_from: "top_left",
        anchor_to: "top_left",
        factory: { name: `ffrg_page_${t}_${p}`, control_name: `ffrg.page_${t}_${p}` },
        bindings: [
          { binding_type: "view", binding_condition: "always", source_control_name: toggle, source_property_name: "(#toggle_state * 1)", target_property_name: "#collection_length" },
        ],
      };
      controls.push(p === 0 ? { [`p${p}@ffrg.page_${t}_${p}`]: {} } : { [`p${p}@ffrg.lazy_page_${t}_${p}`]: {} });
    }
    ui[`page_row_${t}`] = {
      type: "stack_panel",
      orientation: "horizontal",
      size: [144, 18],
      collection_name: "form_buttons",
      controls: Array.from({ length: pagesPerTab }, (_, p) => ({
        [`s${p}@ffr.page_slot`]: {
          collection_index: pageLabelBase + t * pagesPerTab + p,
          controls: [{ [`ffrg_p${t}_${p}@ffr.page_toggle`]: { $page_index: p, $page_group: `ffrg_pages_${t}` } }],
        },
      })),
    };
    controls.push({ [`pages@ffrg.page_row_${t}`]: { anchor_from: "top_left", anchor_to: "top_left", offset: [0, 110] } });
    tabs.push({ [`tab${t}`]: { type: "panel", size: [144, 128], anchor_from: "top_left", anchor_to: "top_left", bindings: [visibleFrom(`ffr_t${t}`)], controls } });
  }
  ui.items = { type: "panel", size: [144, 128], controls: tabs };
  return ui;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const [file, ui] of [["ffr_items.json", serverPagesUi()], ["ffr_pages.json", clientPagesUi()]]) {
    const out = join(uiDir, file);
    writeFileSync(out, JSON.stringify(ui) + "\n");
    console.log(`wrote ${out}`);
  }
}
