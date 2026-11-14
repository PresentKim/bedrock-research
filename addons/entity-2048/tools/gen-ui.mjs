import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NS = "e2048";
const TEXTURES = `textures/ui/${NS}`;
const CELL = 30;
const TILE = 28;
const POP = 34;
const SLIDE = 0.12;
const PAD = 26;
const SIZE = 4;
const VALUES = 13;
const PARITIES = ["a", "b"];
const TITLE = "§b§w§2§0";
const SLOT = { mover: 1, final: 17, score: 33, status: 34, buttons: 36 };

const DIRECTIONS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
const MOVER_CODES = ["S0", ...Object.keys(DIRECTIONS).flatMap((d) => [1, 2, 3].map((n) => `${d}${n}`))];
const FINAL_CODES = ["N", "M", "P"];

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "ui", `${NS}.json`);

const CLEAN = "(#hover_text - '§o' - '§f' - '§r')";
const slotText = { binding_type: "collection", binding_collection_name: "container_items", binding_name: "#hover_text", binding_condition: "always" };

function tileAnims(code) {
  if (code === "S0") return ["mover_alpha"];
  if (MOVER_CODES.includes(code)) return [`slide_${code}`, "mover_alpha"];
  return { N: ["final_alpha"], M: ["final_alpha", "pop_wait"], P: ["final_alpha", "spawn_wait"] }[code];
}

function anims() {
  const defs = {};
  for (const [dir, [x, y]] of Object.entries(DIRECTIONS)) {
    for (let n = 1; n < SIZE; n++) {
      defs[`slide_${dir}${n}`] = { anim_type: "offset", easing: "out_cubic", duration: SLIDE, from: [0, 0], to: [x * n * CELL, y * n * CELL] };
    }
  }
  return Object.assign(defs, {
    mover_alpha: { anim_type: "alpha", from: 1, to: 1, duration: SLIDE + 0.05, next: `@${NS}.mover_off` },
    mover_off: { anim_type: "alpha", from: 0, to: 0, duration: 0.01 },
    final_alpha: { anim_type: "alpha", from: 0, to: 0, duration: SLIDE, next: `@${NS}.final_on` },
    final_on: { anim_type: "alpha", from: 1, to: 1, duration: 0.01 },
    pop_wait: { anim_type: "size", from: [TILE, TILE], to: [TILE, TILE], duration: SLIDE, next: `@${NS}.pop_up` },
    pop_up: { anim_type: "size", easing: "out_cubic", from: [TILE, TILE], to: [POP, POP], duration: 0.07, next: `@${NS}.pop_down` },
    pop_down: { anim_type: "size", easing: "in_cubic", from: [POP, POP], to: [TILE, TILE], duration: 0.07 },
    spawn_wait: { anim_type: "size", from: [0, 0], to: [0, 0], duration: SLIDE, next: `@${NS}.spawn_grow` },
    spawn_grow: { anim_type: "size", easing: "out_cubic", from: [0, 0], to: [TILE, TILE], duration: 0.12 },
  });
}

const tileImage = (code, texture) => ({
  tile: { type: "image", size: [TILE, TILE], layer: 1, texture, anims: tileAnims(code).map((name) => `@${NS}.${name}`) },
});

function factoryTiles(codes) {
  const defs = {};
  const ids = {};
  const bag = { "#k": [] };
  for (const code of codes) {
    for (let v = 1; v <= VALUES; v++) {
      const def = `ft_${code}_${v}`;
      defs[def] = { type: "panel", size: [CELL, CELL], controls: [tileImage(code, `${TEXTURES}/t${v}`)] };
      for (const parity of PARITIES) {
        const key = `${code}${parity}t${v}`;
        ids[key] = `@${NS}.${def}`;
        bag[`#k${key}`] = [key];
      }
    }
  }
  return { defs, ids, bag };
}

function factoryCell(name, ids, bag) {
  return {
    type: "stack_panel",
    size: [CELL, CELL],
    factory: { name, control_ids: ids },
    property_bag: bag,
    bindings: [
      slotText,
      { binding_type: "view", binding_condition: "always", source_property_name: `('#k' + ${CLEAN})`, target_property_name: "#collection_length" },
    ],
  };
}

function boardLayer(name, base, cellDef, layer) {
  const rows = [];
  for (let r = 0; r < SIZE; r++) {
    const cells = [];
    for (let c = 0; c < SIZE; c++) cells.push({ [`c${r}${c}@${NS}.${cellDef}`]: { collection_index: base + r * SIZE + c } });
    rows.push({
      [`r${r}`]: {
        type: "stack_panel", orientation: "horizontal", size: [CELL * SIZE, CELL], offset: [0, r * CELL],
        anchor_from: "top_left", anchor_to: "top_left", collection_name: "container_items", controls: cells,
      },
    });
  }
  return {
    [name]: { type: "panel", size: [CELL * SIZE, CELL * SIZE], offset: [2, 2], anchor_from: "top_left", anchor_to: "top_left", layer, controls: rows },
  };
}

const BOARD = CELL * SIZE + 4;
const WINDOW_W = BOARD + PAD * 6 + 32;

function board(mode) {
  return {
    type: "image",
    texture: `${TEXTURES}/board`,
    size: [BOARD, BOARD],
    controls: [
      boardLayer("movers", SLOT.mover, `${mode}_mover_cell`, 5),
      boardLayer("finals", SLOT.final, `${mode}_final_cell`, 10),
    ],
  };
}

const one = (name, size, offset, index, child) => ({
  [name]: {
    type: "stack_panel", orientation: "vertical", collection_name: "container_items", size, offset,
    anchor_from: "top_left", anchor_to: "top_left", layer: 3,
    controls: [{ [`slot@${NS}.${child}`]: { collection_index: index, size } }],
  },
});

function face(bg, content) {
  return { type: "panel", size: ["100%", "100%"], controls: [{ bg: { type: "image", texture: bg, size: ["100%", "100%"] } }, content] };
}

function quickButton(name, index, content, size) {
  return {
    [name]: {
      type: "button",
      size,
      collection_index: index,
      layer: 2,
      default_control: "default",
      hover_control: "hover",
      pressed_control: "pressed",
      sound_name: "random.click",
      sound_volume: 1.0,
      sound_pitch: 1.0,
      bindings: [{ binding_type: "collection_details", binding_collection_name: "container_items" }],
      button_mappings: [
        { from_button_id: "button.menu_select", to_button_id: "button.container_auto_place", mapping_type: "pressed", consume_event: false },
        { from_button_id: "button.menu_ok", to_button_id: "button.container_auto_place", mapping_type: "focused", consume_event: false },
      ],
      controls: [
        { default: face("textures/ui/button_borderless_light", content) },
        { hover: face("textures/ui/button_borderless_lighthover", content) },
        { pressed: face("textures/ui/button_borderless_lightpressed", content) },
      ],
    },
  };
}

const arrow = (texture) => ({ arrow: { type: "image", layer: 2, texture, size: [14, 14] } });

function slotButton(name, index, content, size, anchor) {
  return {
    [name]: {
      type: "stack_panel", orientation: "vertical", size, collection_name: "container_items",
      anchor_from: anchor, anchor_to: anchor,
      controls: [quickButton("b", index, content, size)],
    },
  };
}

function dpad() {
  const b = SLOT.buttons;
  const size = [PAD, PAD];
  return {
    type: "panel",
    size: [PAD * 3, PAD * 3],
    controls: [
      slotButton("up", b, arrow("textures/ui/gameTipArrow_up"), size, "top_middle"),
      slotButton("down", b + 1, arrow("textures/ui/gameTipArrow_down"), size, "bottom_middle"),
      slotButton("left", b + 2, arrow("textures/ui/gameTipArrow_left"), size, "left_middle"),
      slotButton("right", b + 3, arrow("textures/ui/gameTipArrow_right"), size, "right_middle"),
    ],
  };
}

const newButton = () =>
  slotButton("new", SLOT.buttons + 4, { text: { type: "label", layer: 2, text: "New", localize: false, color: [0.2, 0.2, 0.2] } }, [PAD * 3, 20], "bottom_right");

function window(mode) {
  return {
    type: "image",
    texture: "textures/ui/dialog_background_opaque",
    size: [WINDOW_W, BOARD + 52],
    layer: 2,
    controls: [
      { title: { type: "label", layer: 3, localize: false, color: [0.25, 0.25, 0.25], text: "2048", anchor_from: "top_left", anchor_to: "top_left", offset: [8, 7] } },
      one("score", [120, 10], [40, 7], SLOT.score, "slot_label"),
      one("status", [200, 10], [(WINDOW_W - 200) / 2, BOARD + 30], SLOT.status, "slot_label"),
      { "close@common.close_button": {} },
      { [`board@${NS}.${mode}_board`]: { layer: 2, anchor_from: "top_middle", anchor_to: "top_middle", offset: [0, 22] } },
      { [`pad_left@${NS}.dpad`]: { layer: 2, anchor_from: "left_middle", anchor_to: "left_middle", offset: [8, -8] } },
      { [`pad_right@${NS}.dpad`]: { layer: 2, anchor_from: "right_middle", anchor_to: "right_middle", offset: [-8, -8] } },
      { new: { type: "panel", size: [PAD * 3, 20], anchor_from: "bottom_right", anchor_to: "bottom_right", offset: [-8, -6], layer: 2, controls: [newButton()] } },
    ],
  };
}

function overlay() {
  return {
    type: "panel",
    size: ["100%", "100%"],
    layer: 50,
    $bwiki_title: "$container_title",
    controls: [
      {
        host: {
          type: "panel",
          size: ["100%", "100%"],
          ignored: `(not ($bwiki_title = '${TITLE}'))`,
          controls: [
            {
              cover: {
                type: "input_panel", modal: true, size: ["100%", "100%"], layer: 100,
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
                  { [`window@${NS}.factory_window`]: { layer: 2 } },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

const movers = factoryTiles(MOVER_CODES);
const finals = factoryTiles(FINAL_CODES);

const ui = {
  namespace: NS,
  ...anims(),
  ...movers.defs,
  ...finals.defs,
  slot_label: {
    type: "label", localize: false, text: "#text", color: [0.25, 0.25, 0.25], font_scale_factor: 0.8,
    bindings: [slotText, { binding_type: "view", source_property_name: CLEAN, target_property_name: "#text" }],
  },
  empty_cell: { type: "panel", size: [18, 18] },
  factory_mover_cell: factoryCell(`${NS}_mover`, movers.ids, movers.bag),
  factory_final_cell: factoryCell(`${NS}_final`, finals.ids, finals.bag),
  factory_board: board("factory"),
  dpad: dpad(),
  factory_window: window("factory"),
  overlay: overlay(),
};

writeFileSync(out, JSON.stringify(ui, null, 2) + "\n");
console.log(`wrote ${out}`);
