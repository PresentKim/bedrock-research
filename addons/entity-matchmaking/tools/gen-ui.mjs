import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NS = "emm_box";
const TEXTURES = "textures/ui/emm";
const TITLE = "§b§w§m§m";
const READY_SECONDS = 10;
const GAMES = 4;
const PIPS = 10;
const SLOT = { rows: 1, rowSize: 5, title: 21, description: 22, header: 23, timer: 24, estimate: 25, count: 26, feed: 27, footer: 28, primary: 29, secondary: 30, readyBar: 31, pips: 32, primaryLabel: 42, secondaryLabel: 43 };
const ROW_PART = { button: 0, name: 1, subtitle: 2, online: 3, state: 4 };

const WINDOW = [312, 176];
const ROW = [120, 34];
const ROW_GAP = 3;
const LIST = [8, 22];
const DETAIL_X = 136;
const DETAIL_W = 168;
const PIP = 14;
const PIP_CELL = 16;
const BAR = [DETAIL_W, 4];
const BUTTON = [80, 20];
const TEXT = [0.25, 0.25, 0.25];

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui", `${NS}.json`);

const CLEAN = "(#hover_text - '§o' - '§f' - '§r')";
const slotText = { binding_type: "collection", binding_collection_name: "container_items", binding_name: "#hover_text", binding_condition: "always" };
const topLeft = { anchor_from: "top_left", anchor_to: "top_left" };

function anims() {
  return {
    pop: { anim_type: "size", easing: "out_back", from: [0, 0], to: [PIP, PIP], duration: 0.18 },
    pulse_out: { anim_type: "alpha", easing: "in_sine", from: 1, to: 0.25, duration: 0.6, next: `@${NS}.pulse_in` },
    pulse_in: { anim_type: "alpha", easing: "out_sine", from: 0.25, to: 1, duration: 0.6, next: `@${NS}.pulse_out` },
    ready_drain: { anim_type: "size", from: BAR, to: [0, BAR[1]], duration: READY_SECONDS },
  };
}

function keyedDefs(prefix, bodies) {
  const defs = {};
  const ids = {};
  const bag = { "#k": [] };
  for (const [key, body] of Object.entries(bodies)) {
    const def = `${prefix}_${key}`;
    defs[def] = body;
    ids[key] = `@${NS}.${def}`;
    bag[`#k${key}`] = [key];
  }
  return { defs, ids, bag };
}

function keyedCell(name, size, keyed) {
  return {
    type: "stack_panel",
    size,
    factory: { name, control_ids: keyed.ids },
    property_bag: keyed.bag,
    bindings: [
      slotText,
      { binding_type: "view", binding_condition: "always", source_property_name: `('#k' + ${CLEAN})`, target_property_name: "#collection_length" },
    ],
  };
}

function pipBody(texture, animated) {
  const image = { type: "image", texture: `${TEXTURES}/${texture}`, size: [PIP, PIP], layer: 1 };
  if (animated) image.anims = [`@${NS}.pop`];
  return {
    type: "panel",
    size: [PIP_CELL, PIP],
    controls: [{ holder: { type: "panel", size: [PIP, PIP], ...topLeft, controls: [{ pip: image }] } }],
  };
}

const pips = keyedDefs("pip", {
  E: pipBody("pip_empty", false),
  F: pipBody("pip_filled", true),
  Y: pipBody("pip_you", true),
  A: pipBody("pip_accepted", true),
  X: pipBody("pip_declined", true),
});

const rowFrame = (texture, extra = []) => ({
  type: "panel",
  size: ROW,
  controls: [{ frame: { type: "image", texture: `${TEXTURES}/${texture}`, size: ROW, layer: 1 } }, ...extra],
});

const liveDot = {
  dot: {
    type: "image", texture: `${TEXTURES}/dot`, size: [6, 6], layer: 2,
    anchor_from: "top_right", anchor_to: "top_right", offset: [-6, 6], anims: [`@${NS}.pulse_out`],
  },
};

const rowStates = keyedDefs("row", { S: rowFrame("row_selected"), Q: rowFrame("row_queued", [liveDot]) });

const readyBody = {
  type: "panel",
  size: BAR,
  controls: [
    { track: { type: "image", texture: `${TEXTURES}/bar_track`, size: BAR, layer: 1 } },
    { fill: { type: "image", texture: `${TEXTURES}/bar_fill`, size: BAR, layer: 2, ...topLeft, anims: [`@${NS}.ready_drain`] } },
  ],
};

const readyBars = keyedDefs("ready", { Ta: readyBody, Tb: readyBody });

const slotWrap = (name, size, offset, layer, child) => ({
  [name]: {
    type: "stack_panel", orientation: "vertical", collection_name: "container_items", size, offset, ...topLeft, layer,
    controls: [child],
  },
});

function text(name, index, size, offset, scale = 1, align = "left") {
  return slotWrap(name, size, offset, 4, {
    [`slot@${NS}.slot_label`]: { collection_index: index, size, $emm_scale: scale, $emm_align: align },
  });
}

function keyed(name, index, size, offset, layer, cellDef) {
  return slotWrap(name, size, offset, layer, { [`slot@${NS}.${cellDef}`]: { collection_index: index, size } });
}

function face(bg) {
  return { type: "image", texture: bg, size: ["100%", "100%"] };
}

function quickButton(index, size, hideWhenEmpty) {
  const bindings = [{ binding_type: "collection_details", binding_collection_name: "container_items" }];
  if (hideWhenEmpty) {
    bindings.push(slotText, { binding_type: "view", binding_condition: "always", source_property_name: `(not (${CLEAN} = ''))`, target_property_name: "#visible" });
  }
  return {
    b: {
      type: "button",
      size,
      collection_index: index,
      default_control: "default",
      hover_control: "hover",
      pressed_control: "pressed",
      sound_name: "random.click",
      sound_volume: 1.0,
      sound_pitch: 1.0,
      bindings,
      button_mappings: [
        { from_button_id: "button.menu_select", to_button_id: "button.container_auto_place", mapping_type: "pressed", consume_event: false },
        { from_button_id: "button.menu_ok", to_button_id: "button.container_auto_place", mapping_type: "focused", consume_event: false },
      ],
      controls: [
        { default: face("textures/ui/button_borderless_light") },
        { hover: face("textures/ui/button_borderless_lighthover") },
        { pressed: face("textures/ui/button_borderless_lightpressed") },
      ],
    },
  };
}

const slotButton = (name, index, size, offset, hideWhenEmpty) => slotWrap(name, size, offset, 2, quickButton(index, size, hideWhenEmpty));

function row(g) {
  const base = SLOT.rows + g * SLOT.rowSize;
  const at = (part) => base + ROW_PART[part];
  return {
    [`row${g}`]: {
      type: "panel",
      size: ROW,
      offset: [LIST[0], LIST[1] + g * (ROW[1] + ROW_GAP)],
      ...topLeft,
      layer: 2,
      controls: [
        slotButton("button", at("button"), ROW, [0, 0], false),
        keyed("state", at("state"), ROW, [0, 0], 3, "row_cell"),
        text("name", at("name"), [ROW[0] - 16, 10], [6, 4], 1),
        text("subtitle", at("subtitle"), [ROW[0] - 10, 9], [6, 15], 0.7),
        text("online", at("online"), [ROW[0] - 10, 9], [6, 24], 0.7),
      ],
    },
  };
}

function pipRow() {
  const left = Math.floor((DETAIL_W - PIPS * PIP_CELL + (PIP_CELL - PIP)) / 2);
  const cells = Array.from({ length: PIPS }, (_, k) => ({ [`p${k}@${NS}.pip_cell`]: { collection_index: SLOT.pips + k } }));
  return {
    pips: {
      type: "stack_panel", orientation: "horizontal", collection_name: "container_items",
      size: [PIPS * PIP_CELL, PIP], offset: [DETAIL_X + left, 102], ...topLeft, layer: 3, controls: cells,
    },
  };
}

function actionButton(name, index, labelIndex, x) {
  return {
    [name]: {
      type: "panel",
      size: BUTTON,
      offset: [x, 150],
      ...topLeft,
      layer: 2,
      controls: [slotButton("button", index, BUTTON, [0, 0], true), text("label", labelIndex, [BUTTON[0], 10], [0, 6], 1, "center")],
    },
  };
}

function window() {
  const d = (y, h) => [[DETAIL_W, h], [DETAIL_X, y]];
  return {
    type: "image",
    texture: "textures/ui/dialog_background_opaque",
    size: WINDOW,
    layer: 2,
    controls: [
      { title: { type: "label", layer: 3, localize: false, color: TEXT, text: "Minigames", ...topLeft, offset: [8, 7] } },
      text("footer", SLOT.footer, [190, 9], [70, 8], 0.7),
      { "close@common.close_button": {} },
      ...Array.from({ length: GAMES }, (_, g) => row(g)),
      text("game", SLOT.title, ...d(24, 10), 1.2, "center"),
      text("description", SLOT.description, ...d(37, 18), 0.7, "center"),
      text("header", SLOT.header, ...d(58, 10), 1, "center"),
      text("timer", SLOT.timer, ...d(70, 18), 1.8, "center"),
      text("estimate", SLOT.estimate, ...d(90, 9), 0.7, "center"),
      pipRow(),
      text("count", SLOT.count, ...d(119, 9), 0.8, "center"),
      text("feed", SLOT.feed, ...d(129, 9), 0.7, "center"),
      keyed("ready", SLOT.readyBar, BAR, [DETAIL_X, 142], 3, "ready_cell"),
      actionButton("secondary", SLOT.secondary, SLOT.secondaryLabel, DETAIL_X),
      actionButton("primary", SLOT.primary, SLOT.primaryLabel, DETAIL_X + DETAIL_W - BUTTON[0]),
    ],
  };
}

function overlay() {
  return {
    type: "panel",
    size: ["100%", "100%"],
    layer: 1,
    $bwiki_title: "$container_title",
    controls: [
      {
        host: {
          type: "panel",
          size: ["100%", "100%"],
          ignored: `(not ($bwiki_title = '${TITLE}'))`,
          controls: [
            { entity_ui_hide_vanilla: { type: "panel", size: [0, 0], property_bag: { "#entity_ui_vanilla_visible": false } } },
            {
              cover: {
                type: "input_panel", modal: true, size: ["100%", "100%"], layer: 1,
                controls: [
                  {
                    sync_grid: {
                      type: "grid",
                      size: [162, 54],
                      layer: 1,
                      grid_rescaling_type: "horizontal",
                      maximum_grid_items: 27,
                      collection_name: "container_items",
                      grid_item_template: `${NS}.empty_cell`,
                    },
                  },
                  { [`window@${NS}.window`]: { layer: 2 } },
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
  ...anims(),
  ...pips.defs,
  ...rowStates.defs,
  ...readyBars.defs,
  slot_label: {
    type: "label", localize: false, text: "#text", color: TEXT,
    "$emm_scale|default": 1, "$emm_align|default": "left",
    font_scale_factor: "$emm_scale", text_alignment: "$emm_align",
    bindings: [slotText, { binding_type: "view", source_property_name: CLEAN, target_property_name: "#text" }],
  },
  empty_cell: { type: "panel", size: [18, 18] },
  pip_cell: keyedCell(`${NS}_pip`, [PIP_CELL, PIP], pips),
  row_cell: keyedCell(`${NS}_row`, ROW, rowStates),
  ready_cell: keyedCell(`${NS}_ready`, BAR, readyBars),
  window: window(),
  overlay: overlay(),
};

writeFileSync(out, JSON.stringify(ui, null, 2) + "\n");
console.log(`wrote ${out}`);
