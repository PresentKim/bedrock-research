import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NS = "hxc";
const SLOTS = 64;
const COLUMNS = 8;
const ITEM_WIDTH = 11;
const SLOT_WIDTH = 19;
const CELL = 18;
const PANEL = [COLUMNS * CELL, (SLOTS / COLUMNS) * CELL + 12];
const TIERS = [64, 256, 512];
const PREFIX = { fixed: "hxf", shared: "hxs" };

const uiDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui");

const itemSkip = (n) => 1 + SLOT_WIDTH * (n % SLOTS);
const countSkip = (n) => 1 + ITEM_WIDTH + SLOT_WIDTH * (n % SLOTS);
const stripX = (expr) => `((((${expr} - 'xxxxxxxx') - 'xxxx') - 'xx') - 'x')`;
const stripTilde = (expr) => `((((${expr} - '~~~~~~~~') - '~~~~') - '~~') - '~')`;
const field = (width, skip) => `('%.${width}s' * ($subtitle_text - (${skip} * $subtitle_text)))`;
const itemExpr = (skip) => stripX(field(ITEM_WIDTH, skip));
const countExpr = (skip) => stripTilde(field(8, skip));

function slot(itemVariables, countVariables, defaults) {
  return {
    type: "panel", size: [CELL, CELL], "$aux|default": "0", ...defaults,
    variables: itemVariables,
    controls: [
      { icon: { type: "custom", renderer: "inventory_item_renderer", size: [16, 16], layer: 1, property_bag: { "#item_id_aux": "$aux" } } },
      {
        count: {
          type: "label", anchor_from: "bottom_right", anchor_to: "bottom_right", font_scale_factor: 0.75, shadow: true,
          localize: false, layer: 2, "$count|default": "", variables: countVariables, text: "$count",
        },
      },
    ],
  };
}

const fixedSlot = (cells) => slot(
  Array.from({ length: cells }, (_, n) => ({ requires: `($index = ${n})`, $aux: itemExpr(`'%.${itemSkip(n)}s'`) })),
  Array.from({ length: cells }, (_, n) => ({ requires: `($index = ${n})`, $count: countExpr(`'%.${countSkip(n)}s'`) })),
  { "$index|default": 0 },
);

const sharedSlot = slot(
  [{ requires: "($hxc_on)", $aux: itemExpr("$skip_item") }],
  [{ requires: "($hxc_on)", $count: countExpr("$skip_count") }],
  {},
);

const titleOf = (kind, cells) => `${PREFIX[kind]}${String(cells).padStart(3, "0")}`;

function panel(kind, cells) {
  const caption = kind === "fixed" ? `Fixed: ${cells} cells x ${cells} requires` : `Shared: ${cells} cells x 1 expression`;
  const slotVars = kind === "fixed" ? (n) => ({ $index: n }) : (n) => ({ $skip_item: `%.${itemSkip(n)}s`, $skip_count: `%.${countSkip(n)}s` });
  const slotDef = kind === "fixed" ? `slot_fixed_${cells}` : "slot_shared";
  return {
    type: "panel", size: ["100%", "100%"], "$hxc_on": true,
    ignored: `(not (('%.6s' * $title_text) = '${titleOf(kind, cells)}'))`,
    controls: [
      {
        board: {
          type: "panel", size: PANEL, anchor_from: "top_middle", anchor_to: "top_middle", offset: [0, 4],
          controls: [
            { caption: { type: "label", localize: false, text: caption, anchor_from: "top_left", anchor_to: "top_left", font_scale_factor: 0.7, shadow: true, color: [1, 1, 1] } },
            ...Array.from({ length: cells }, (_, n) => ({
              [`slot${n}@${NS}.${slotDef}`]: {
                anchor_from: "top_left", anchor_to: "top_left",
                offset: [(n % COLUMNS) * CELL, 12 + Math.floor((n % SLOTS) / COLUMNS) * CELL],
                ...slotVars(n),
              },
            })),
          ],
        },
      },
    ],
  };
}

const slide = (from, to, next) => ({ anim_type: "offset", easing: "linear", from, to, duration: 1, next: `@${NS}.${next}` });

const ui = {
  namespace: NS,
  slot_shared: sharedSlot,
  ...Object.fromEntries(TIERS.map((cells) => [`slot_fixed_${cells}`, fixedSlot(cells)])),
  ...Object.fromEntries(TIERS.flatMap((cells) => ["fixed", "shared"].map((kind) => [`panel_${kind}_${cells}`, panel(kind, cells)]))),
  slide_right: slide([0, 0], [PANEL[0] - 8, 0], "slide_left"),
  slide_left: slide([PANEL[0] - 8, 0], [0, 0], "slide_right"),
  meter: {
    type: "panel", size: [PANEL[0], 6], anchor_from: "top_middle", anchor_to: "top_middle", offset: [0, PANEL[1] + 8],
    bindings: [
      { binding_type: "global", binding_name: "#hud_title_text_string", binding_condition: "always" },
      { binding_type: "view", binding_condition: "always", source_property_name: "(('%.2s' * #hud_title_text_string) = 'hx')", target_property_name: "#visible" },
    ],
    controls: [
      { track: { type: "image", texture: "textures/ui/White", color: [0, 0, 0], alpha: 0.5, size: ["100%", "100%"] } },
      { dot: { type: "image", texture: "textures/ui/White", color: [1, 0.8, 0], size: [8, 6], anchor_from: "left_middle", anchor_to: "left_middle", layer: 1, anims: [`@${NS}.slide_right`] } },
    ],
  },
};

const hud = {
  namespace: "hud",
  root_panel: {
    modifications: [
      {
        array_name: "controls",
        operation: "insert_front",
        value: [
          ...TIERS.flatMap((cells) => ["fixed", "shared"].map((kind) => ({
            [`hxc_${kind}_${cells}`]: {
              type: "panel", size: ["100%", "100%"],
              factory: { name: "hud_title_text_factory", control_ids: { hud_title_text: `${kind}_${cells}@${NS}.panel_${kind}_${cells}` } },
            },
          }))),
          { [`hxc_meter@${NS}.meter`]: {} },
        ],
      },
    ],
  },
};

writeFileSync(join(uiDir, `${NS}.json`), JSON.stringify(ui, null, 2) + "\n");
writeFileSync(join(uiDir, "hud_screen.json"), JSON.stringify(hud, null, 2) + "\n");
console.log(`wrote ${NS}.json and hud_screen.json`);
