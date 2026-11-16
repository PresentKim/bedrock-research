import { page, gridHex, colorId, previewHexes } from "../../bp/scripts/pages/colorpicker.js";
import { COLOR, rect, thumb, label, slotLabel, slotButton, whenSlot, keyedCell, rgb } from "../lib.mjs";
import { frame, keyButton } from "./_batch_d.mjs";

const AREA = [120, 80];
const AREA_Y = 12;
const SV_CELL = [AREA[0] / page.levels, AREA[1] / page.levels];
const HUE_Y = AREA_Y + AREA[1] + 5;
const HUE_CELL = AREA[0] / page.hues;
const SWATCH_Y = HUE_Y + 13 + 5;
const RIGHT = 138;
const DYE_PITCH = 18;
const HEX_KEY = [26, 16];
const HEX_PITCH = [28, 18];
const HEX_Y = 74;

const tint = (hex) => rgb(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));

function areaFor(h) {
  const controls = [];
  for (let row = 0; row < page.levels; row++) {
    for (let s = 0; s < page.levels; s++) {
      const v = page.levels - 1 - row;
      controls.push({ [`c${row}_${s}`]: rect(tint(gridHex(h, s, v)), SV_CELL, [s * SV_CELL[0], row * SV_CELL[1]], { layer: 1 }) });
    }
  }
  return { type: "panel", size: AREA, controls };
}

function swatch(hex) {
  return {
    type: "panel", size: [15, 15],
    controls: [
      { border: rect(COLOR.outline, [15, 15], [0, 0], { layer: 1 }) },
      { fill: rect(tint(hex), [13, 13], [1, 1], { layer: 2 }) },
    ],
  };
}

function areaKnob() {
  return {
    type: "panel", size: [8, 8],
    controls: [
      { outline: rect(COLOR.outline, [8, 8], [0, 0], { layer: 1 }) },
      { face: rect(COLOR.face, [6, 6], [1, 1], { layer: 2 }) },
    ],
  };
}

function area(ctx) {
  const ids = Object.fromEntries(Array.from({ length: page.hues }, (_, h) => [`h${h}`, ctx.def(`area_h${h}`, areaFor(h))]));
  const sv = ctx.slot(page.slots.sv);
  const parts = [keyedCell("area", ctx.slot(page.slots.hue), AREA, [0, AREA_Y], ids, 1)];
  for (let row = 0; row < page.levels; row++) {
    for (let s = 0; s < page.levels; s++) {
      const v = page.levels - 1 - row;
      const at = [s * SV_CELL[0], AREA_Y + row * SV_CELL[1]];
      const k = row * page.levels + s;
      parts.push(
        whenSlot(`knob_${k}`, sv, [8, 8], [at[0] + SV_CELL[0] / 2 - 4, at[1] + SV_CELL[1] / 2 - 4], `s${s}v${v}`, areaKnob(), 3),
        slotButton(`sv_${k}`, ctx.slot(page.keys.area + k), at, SV_CELL),
      );
    }
  }
  parts.push({ area_frame: { ...frame(COLOR.outline, AREA), offset: [0, AREA_Y], anchor_from: "top_left", anchor_to: "top_left" } });
  return parts;
}

function hueBar(ctx) {
  const hue = ctx.slot(page.slots.hue);
  return [
    { hue_outline: rect(COLOR.outline, [AREA[0], 13], [0, HUE_Y], { layer: 1 }) },
    ...Array.from({ length: page.hues }, (_, h) => ({
      [`hue_band${h}`]: rect(tint(gridHex(h, page.levels - 1, page.levels - 1)), [HUE_CELL, 11], [h * HUE_CELL, HUE_Y + 1], { layer: 2 }),
    })),
    ...Array.from({ length: page.hues }, (_, h) => whenSlot(`hue_thumb${h}`, hue, [7, 17], [h * HUE_CELL + HUE_CELL / 2 - 3, HUE_Y - 2], `h${h}`, thumb([7, 17], [0, 0]), 3)),
    ...Array.from({ length: page.hues }, (_, h) => slotButton(`hue_${h}`, ctx.slot(page.keys.hue + h), [h * HUE_CELL, HUE_Y - 2], [HUE_CELL, 17])),
  ];
}

function preview(ctx) {
  const ids = Object.fromEntries(previewHexes().map((hex) => [colorId(hex), ctx.def(`swatch_${hex.slice(1)}`, swatch(hex))]));
  return [
    keyedCell("preview", ctx.slot(page.slots.preview), [15, 15], [0, SWATCH_Y], ids),
    { hex_box: rect(COLOR.outline, [AREA[0] - 20, 15], [20, SWATCH_Y], { layer: 1 }) },
    slotLabel("hex", ctx.slot(page.slots.hexText), [24, SWATCH_Y + 4], [AREA[0] - 28, 9], { color: COLOR.white, scale: 0.65 }),
  ];
}

function dyes(ctx) {
  return page.dyes.flatMap(([, hex], k) => {
    const at = [RIGHT + (k % 8) * DYE_PITCH, 22 + Math.floor(k / 8) * DYE_PITCH];
    return [
      { [`dye_swatch${k}`]: { ...swatch(hex), offset: at, anchor_from: "top_left", anchor_to: "top_left", layer: 1 } },
      slotButton(`dye_${k}`, ctx.slot(page.keys.dye + k), at, [15, 15]),
    ];
  });
}

function hexKeys(ctx) {
  return page.hexKeys.map((key, k) => {
    const wide = key === "back";
    const at = [RIGHT + (k % 9) * HEX_PITCH[0], HEX_Y + Math.floor(k / 9) * HEX_PITCH[1]];
    return keyButton(`hex_${k}`, ctx.slot(page.keys.hex + k), at, wide ? [HEX_KEY[0] * 2 + 2, HEX_KEY[1]] : HEX_KEY, wide ? "Back" : key.toUpperCase());
  });
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap the square, the hue bar, a dye, or type six hex keys.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...area(ctx),
      ...hueBar(ctx),
      ...preview(ctx),
      label("dye_caption", "Dye swatches", [RIGHT, 12], { color: COLOR.dimText, scale: 0.55 }),
      ...dyes(ctx),
      label("hex_caption", "Hex keys", [RIGHT, HEX_Y - 10], { color: COLOR.dimText, scale: 0.55 }),
      ...hexKeys(ctx),
      slotLabel("hsv", ctx.slot(page.slots.hsvText), [RIGHT, HEX_Y + 40], [200, 9], { color: COLOR.text }),
      label("note", "Preview shows the nearest prebuilt color, the hex is exact.", [RIGHT, HEX_Y + 54], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
