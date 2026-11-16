import { page } from "../../bp/scripts/pages/rating.js";
import { COLOR, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { STAR_SIZE, starBody } from "./_batch_h.mjs";

const CELL = STAR_SIZE[0] + 6;
const MINE_Y = 28;
const AVERAGE_Y = 92;

function stars(prefix, y, gates) {
  return Array.from({ length: page.stars }, (_, k) => {
    const at = [3 + k * CELL, y];
    return [
      { [`${prefix}${k}_base`]: starBody("empty", at, 2) },
      ...gates(k).map(([name, slot, value, mode]) => whenSlot(`${prefix}${k}_${name}`, slot, STAR_SIZE, at, value, starBody(mode))),
    ];
  }).flat();
}

export const ui = {
  page,
  build(ctx) {
    const mine = stars("mine", MINE_Y, (k) => [["on", ctx.slot(page.slots.mine + k), "on", "full"]]);
    const taps = Array.from({ length: page.stars }, (_, k) => slotButton(`mine${k}_press`, ctx.slot(page.slots.star + k), [k * CELL, MINE_Y - 3], [CELL, CELL]));
    const average = stars("avg", AVERAGE_Y, (k) => [
      ["full", ctx.slot(page.slots.average + k), "full", "full"],
      ["half", ctx.slot(page.slots.average + k), "half", "half"],
    ]);
    return [
      label("intro", "Tap a star to rate. Tap the same star again to clear.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      label("mine_caption", "Your rating", [0, 16], { color: COLOR.text, scale: 0.6 }),
      ...mine,
      ...taps,
      slotLabel("mine_text", ctx.slot(page.slots.text), [0, MINE_Y + STAR_SIZE[1] + 6], [200, 9], { color: COLOR.white, scale: 0.65 }),
      label("avg_caption", "Average rating (read only, includes yours)", [0, AVERAGE_Y - 12], { color: COLOR.text, scale: 0.6 }),
      ...average,
      slotLabel("avg_text", ctx.slot(page.slots.averageText), [0, AVERAGE_Y + STAR_SIZE[1] + 6], [200, 9], { color: COLOR.dimText }),
    ];
  },
};
