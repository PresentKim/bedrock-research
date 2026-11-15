import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NS = "emf_box";
const TITLE = "§b§w§m§f";
const READY_SECONDS = 10;
const GAMES = 4;
const FIGURE_COLUMNS = 4;
const FIGURE_ROWS = 2;
const EMOTES = ["Hi", "Clap", "Jump", "Nod"];
const SLOT = { rows: 1, rowSize: 5, title: 21, description: 22, header: 23, timer: 24, estimate: 25, count: 26, feed: 27, footer: 28, primary: 29, secondary: 30, readyBar: 31, primaryLabel: 42, secondaryLabel: 43, figures: 44, figureSize: 3, emotes: 68, emoteLabels: 72 };
const FIGURE_PART = { id: 0, badge: 1, name: 2 };
const ROW_PART = { button: 0, name: 1, subtitle: 2, online: 3, state: 4 };

const WINDOW = [312, 206];
const ROW = [120, 34];
const ROW_GAP = 3;
const LIST = [8, 22];
const DETAIL_X = 136;
const DETAIL_W = 168;
const FIGURE_CELL = [DETAIL_W / FIGURE_COLUMNS, 41];
const FIGURES_Y = 75;
const DOLL = 16;
const BOT_DROP = 1.35;
const BADGE = 10;
const BAR = [DETAIL_W, 4];
const BUTTON = [80, 20];
const BUTTON_Y = 182;
const EMOTE_BUTTON = [BUTTON[0] / EMOTES.length, BUTTON[1]];
const TEXT = [0.25, 0.25, 0.25];

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui", `${NS}.json`);

const CLEAN = "(#hover_text - '§o' - '§f' - '§r')";
const slotText = { binding_type: "collection", binding_collection_name: "container_items", binding_name: "#hover_text", binding_condition: "always" };
const topLeft = { anchor_from: "top_left", anchor_to: "top_left" };

function anims() {
  return {
    pop: { anim_type: "size", easing: "out_back", from: [0, 0], to: [BADGE, BADGE], duration: 0.18 },
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

function badgeBody(frame, mark) {
  const controls = [{ frame: { type: "image", texture: `textures/ui/emf/${frame}`, size: FIGURE_CELL, ...topLeft, layer: 1 } }];
  if (mark) {
    controls.push({
      holder: {
        type: "panel", size: [BADGE, BADGE], anchor_from: "top_right", anchor_to: "top_right", offset: [-1, 1], layer: 2,
        controls: [{ mark: { type: "image", texture: `textures/ui/emf/${mark}`, size: [BADGE, BADGE], anims: [`@${NS}.pop`] } }],
      },
    });
  }
  return { type: "panel", size: FIGURE_CELL, controls };
}

const badges = keyedDefs("badge", {
  E: badgeBody("figure_empty"),
  M: badgeBody("figure_member"),
  Y: badgeBody("figure_you"),
  MA: badgeBody("figure_member", "pip_accepted"),
  YA: badgeBody("figure_you", "pip_accepted"),
  MX: badgeBody("figure_member", "pip_declined"),
  YX: badgeBody("figure_you", "pip_declined"),
});

const rowFrame = (texture, extra = []) => ({
  type: "panel",
  size: ROW,
  controls: [{ frame: { type: "image", texture: `textures/ui/emf/${texture}`, size: ROW, layer: 1 } }, ...extra],
});

const liveDot = {
  dot: {
    type: "image", texture: "textures/ui/emf/dot", size: [6, 6], layer: 2,
    anchor_from: "top_right", anchor_to: "top_right", offset: [-6, 6], anims: [`@${NS}.pulse_out`],
  },
};

const rowStates = keyedDefs("row", { S: rowFrame("row_selected"), Q: rowFrame("row_queued", [liveDot]) });

const readyBody = {
  type: "panel",
  size: BAR,
  controls: [
    { track: { type: "image", texture: "textures/ui/emf/bar_track", size: BAR, layer: 1 } },
    { fill: { type: "image", texture: "textures/ui/emf/bar_fill", size: BAR, layer: 2, ...topLeft, anims: [`@${NS}.ready_drain`] } },
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
    [`slot@${NS}.slot_label`]: { collection_index: index, size, $emf_scale: scale, $emf_align: align },
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

function doll(name, index, prefix, drop) {
  const id = `(#emf_id - '${prefix}')`;
  return slotWrap(name, [DOLL, DOLL], [(FIGURE_CELL[0] - DOLL) / 2, 1 + Math.round(DOLL * drop)], 5, {
    renderer: {
      type: "custom",
      renderer: "live_horse_renderer",
      size: [DOLL, DOLL],
      collection_index: index,
      bindings: [
        slotText,
        { binding_type: "view", binding_condition: "always", source_property_name: CLEAN, target_property_name: "#emf_id" },
        { binding_type: "view", binding_condition: "always", source_property_name: id, target_property_name: "#entity_id" },
        { binding_type: "view", binding_condition: "always", source_property_name: `(not (${id} = #emf_id))`, target_property_name: "#visible" },
      ],
    },
  });
}

function figure(k) {
  const base = SLOT.figures + k * SLOT.figureSize;
  const at = (part) => base + FIGURE_PART[part];
  const column = k % FIGURE_COLUMNS;
  const row = Math.floor(k / FIGURE_COLUMNS);
  return {
    [`figure${k}`]: {
      type: "panel",
      size: FIGURE_CELL,
      offset: [DETAIL_X + column * FIGURE_CELL[0], FIGURES_Y + row * FIGURE_CELL[1]],
      ...topLeft,
      layer: 3,
      clips_children: true,
      controls: [
        keyed("badge", at("badge"), FIGURE_CELL, [0, 0], 1, "badge_cell"),
        doll("player", at("id"), "p", 0),
        doll("bot", at("id"), "b", BOT_DROP),
        text("name", at("name"), [FIGURE_CELL[0], 7], [0, FIGURE_CELL[1] - 7], 0.5, "center"),
      ],
    },
  };
}

function actionButton(name, index, labelIndex, x, size = BUTTON, scale = 1) {
  return {
    [name]: {
      type: "panel",
      size,
      offset: [x, BUTTON_Y],
      ...topLeft,
      layer: 2,
      controls: [slotButton("button", index, size, [0, 0], true), text("label", labelIndex, [size[0], 10], [0, (size[1] - 10 * scale) / 2 + 1], scale, "center")],
    },
  };
}

const emoteButtons = () =>
  EMOTES.map((_, e) => actionButton(`emote${e}`, SLOT.emotes + e, SLOT.emoteLabels + e, DETAIL_X + e * EMOTE_BUTTON[0], EMOTE_BUTTON, 0.6));

function window() {
  const d = (y, h) => [[DETAIL_W, h], [DETAIL_X, y]];
  return {
    type: "image",
    texture: "textures/ui/dialog_background_opaque",
    size: WINDOW,
    layer: 2,
    controls: [
      { title: { type: "label", layer: 3, localize: false, color: TEXT, text: "Minigame Lobby", ...topLeft, offset: [8, 7] } },
      text("footer", SLOT.footer, [170, 9], [104, 8], 0.7),
      { "close@common.close_button": {} },
      ...Array.from({ length: GAMES }, (_, g) => row(g)),
      text("game", SLOT.title, ...d(24, 10), 1.2, "center"),
      text("header", SLOT.header, ...d(37, 10), 1, "center"),
      text("timer", SLOT.timer, ...d(48, 14), 1.4, "center"),
      text("estimate", SLOT.estimate, ...d(63, 9), 0.7, "center"),
      text("description", SLOT.description, ...d(95, 18), 0.7, "center"),
      ...Array.from({ length: FIGURE_COLUMNS * FIGURE_ROWS }, (_, k) => figure(k)),
      text("count", SLOT.count, ...d(159, 9), 0.8, "center"),
      text("feed", SLOT.feed, ...d(168, 9), 0.7, "center"),
      keyed("ready", SLOT.readyBar, BAR, [DETAIL_X, 177], 3, "ready_cell"),
      ...emoteButtons(),
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
  ...badges.defs,
  ...rowStates.defs,
  ...readyBars.defs,
  slot_label: {
    type: "label", localize: false, text: "#text", color: TEXT,
    "$emf_scale|default": 1, "$emf_align|default": "left",
    font_scale_factor: "$emf_scale", text_alignment: "$emf_align",
    bindings: [slotText, { binding_type: "view", source_property_name: CLEAN, target_property_name: "#text" }],
  },
  empty_cell: { type: "panel", size: [18, 18] },
  badge_cell: keyedCell("emf_badge", FIGURE_CELL, badges),
  row_cell: keyedCell("emf_row", ROW, rowStates),
  ready_cell: keyedCell("emf_ready", BAR, readyBars),
  window: window(),
  overlay: overlay(),
};

writeFileSync(out, JSON.stringify(ui, null, 2) + "\n");
console.log(`wrote ${out}`);
