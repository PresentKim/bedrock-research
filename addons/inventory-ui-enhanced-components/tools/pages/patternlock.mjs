import { page } from "../../bp/scripts/pages/patternlock.js";
import { COLOR, label, slotLabel } from "../lib.mjs";
import { button } from "./_batch_b.mjs";
import { dragCell } from "./_drag.mjs";

const DOT = [34, 34];
const PITCH = 40;
const GRID = [44, 14];
const SIDE_X = 180;

function dot(ctx, k) {
  const order = slotLabel("order", ctx.slot(page.slots.order + k), [2, 1], [14, 9], { color: COLOR.white, scale: 0.7, keepFormat: true });
  const at = [GRID[0] + (k % 3) * PITCH, GRID[1] + Math.floor(k / 3) * PITCH];
  return dragCell(`dot${k}`, ctx.slot(page.slots.grid + k), DOT, at, [order]);
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap the sticks, then draw through the dots.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      dragCell("source", ctx.slot(page.slots.source), [26, 26], [0, GRID[1] + PITCH + 4]),
      ...Array.from({ length: page.cells }, (_, k) => dot(ctx, k)),
      slotLabel("mode_text", ctx.slot(page.slots.modeText), [SIDE_X, 16], [210, 9], { color: COLOR.dimText, scale: 0.6 }),
      slotLabel("status", ctx.slot(page.slots.status), [SIDE_X, 34], [210, 12], { color: COLOR.white, scale: 0.8, keepFormat: true }),
      slotLabel("entered", ctx.slot(page.slots.entered), [SIDE_X, 54], [210, 9], { color: COLOR.text, scale: 0.6 }),
      button("mode", ctx.slot(page.slots.mode), [SIDE_X, 76], [100, 18], "Set / Unlock"),
      button("forget", ctx.slot(page.slots.forget), [SIDE_X + 106, 76], [90, 18], "Forget", "danger"),
      label("rule", "Each dot counts once, as on a phone lock screen.", [SIDE_X, 102], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
