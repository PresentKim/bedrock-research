import { page } from "../../bp/scripts/pages/textslider.js";
import { COLOR, label, slotLabel, releaseSlider } from "../lib.mjs";
import { tapBar, sliderLabel } from "./_parts.mjs";

const CELL = 48;
const TRACK = 192;
const DRAG = "ius_textslider";

export const ui = {
  page,
  build(ctx) {
    return [
      label("tap_caption", "Tap a stop. The server sends back the chosen word.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      slotLabel("tap_value", ctx.slot(page.slots.valueText), [0, 12], [TRACK, 9], { color: COLOR.white, scale: 0.7 }),
      ...tapBar(ctx, "difficulty", { steps: page.tapValues.length, cell: CELL, keys: page.keys, valueSlot: page.slots.value, tapSlot: page.slots.tap, y: 23 }),
      label("drag_caption", "Drag: the word changes on screen at once and reaches the server on release.", [0, 50], { color: COLOR.dimText, scale: 0.55 }),
      ...page.dragValues.map((word, k) => sliderLabel(`drag_word${k}`, DRAG, k, word, [0, 62], { color: COLOR.white, scale: 0.7 })),
      ...releaseSlider(DRAG, { width: TRACK, steps: page.dragValues.length, offset: [0, 72], slotOfStep: (k) => ctx.slot(page.slots.dragStep + k) }),
      slotLabel("drag_value", ctx.slot(page.slots.dragText), [TRACK + 8, 77], [150, 9], { color: COLOR.text }),
    ];
  },
};
