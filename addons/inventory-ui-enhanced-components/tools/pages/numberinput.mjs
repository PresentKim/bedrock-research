import { page } from "../../bp/scripts/pages/numberinput.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot, topLeft } from "../lib.mjs";
import { rawText, frame, box, keyButton, MINUS_BG } from "./_batch_d.mjs";

const H = 24;
const CELL = 24;
const FIELD_W = 100;
const WIDTH = CELL * 2 + FIELD_W;
const PAD_W = 34;
const PAD_H = 18;
const PAD_PITCH = [36, 20];
const PAD_Y = 76;

function sign(plus) {
  return [
    { bar: rect(COLOR.white, [6, 1], [9, 11], { layer: 3 }) },
    ...(plus ? [{ stem: rect(COLOR.white, [1, 6], [12, 9], { layer: 3 }) }] : []),
  ];
}

function body(name, y, disabled) {
  return {
    [name]: {
      type: "panel", size: [WIDTH, H], offset: [0, y], ...topLeft, layer: 1, ...(disabled ? { alpha: 0.5 } : {}),
      controls: [
        box("frame", [WIDTH, H], [0, 0], COLOR.boxBorder, COLOR.outline),
        { minus_cell: { type: "panel", size: [CELL - 1, H - 2], offset: [1, 1], ...topLeft, layer: 3, controls: [{ bg: rect(MINUS_BG, ["100%", "100%"], [0, 0], { layer: 1 }) }, ...sign(false)] } },
        { plus_cell: { type: "panel", size: [CELL - 1, H - 2], offset: [WIDTH - CELL, 1], ...topLeft, layer: 3, controls: [{ bg: rect(MINUS_BG, ["100%", "100%"], [0, 0], { layer: 1 }) }, ...sign(true)] } },
      ],
    },
  };
}

function keypad(ctx) {
  return page.pad.map((key, k) => {
    const wide = key === "0" || key === "ok";
    const col = k === 13 ? 2 : k % 4;
    const row = Math.floor(k / 4);
    const text = key === "back" ? "Back" : key === "ok" ? "OK" : key;
    return keyButton(`pad_${k}`, ctx.slot(page.keys.pad + k), [col * PAD_PITCH[0], PAD_Y + row * PAD_PITCH[1]], [wide ? PAD_W * 2 + 2 : PAD_W, PAD_H], text);
  });
}

export const ui = {
  page,
  build(ctx) {
    const editing = ctx.slot(page.slots.editing);
    return [
      label("intro", "Tap - or + to step. Tap the number to type one on the keypad, then OK.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      body("number", 12, false),
      whenSlot("focus", editing, [WIDTH, H], [0, 12], "on", frame(COLOR.white, [WIDTH, H]), 2),
      rawText("value", ctx.slot(page.slots.value), [CELL + 6, 12 + 8], [FIELD_W - 12, 10], { layer: 6 }),
      slotButton("minus", ctx.slot(page.keys.minus), [0, 12], [CELL, H]),
      slotButton("field", ctx.slot(page.keys.field), [CELL, 12], [FIELD_W, H]),
      slotButton("plus", ctx.slot(page.keys.plus), [CELL + FIELD_W, 12], [CELL, H]),
      slotLabel("range", ctx.slot(page.slots.range), [WIDTH + 10, 20], [200, 9], { scale: 0.55 }),
      body("number_disabled", 44, true),
      rawText("disabled_value", ctx.slot(page.slots.disabledValue), [CELL + 6, 44 + 8], [FIELD_W - 12, 10], { alpha: 0.5, layer: 6 }),
      label("disabled_caption", "Disabled", [WIDTH + 10, 52], { color: COLOR.dimText, scale: 0.55 }),
      ...keypad(ctx),
    ];
  },
};
