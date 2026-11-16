import { page } from "../../bp/scripts/pages/itemgrid.js";
import { COLOR, label, slotButton, slotLabel, whenSlot } from "../lib.mjs";
import { button } from "./_batch_b.mjs";
import { itemContent, cellFaces, selectionFrame } from "./_batch_e.mjs";

const CELL = [18, 18];
const PITCH = 20;
const TOP = 14;
const SIDE = page.columns * PITCH + 12;
const BUTTON = [96, 18];

function cell(ctx, k) {
  const at = [(k % page.columns) * PITCH, TOP + Math.floor(k / page.columns) * PITCH];
  return slotButton(`cell${k}`, ctx.slot(page.slots.cell + k), at, CELL, {
    faces: cellFaces(),
    controls: [
      ...itemContent(ctx.slot(page.slots.item + k), CELL),
      whenSlot("selection", ctx.slot(page.slots.selected), CELL, [0, 0], `s${k}`, selectionFrame(CELL), 8),
    ],
  });
}

export const ui = {
  page,
  build(ctx) {
    const cells = Array.from({ length: page.columns * page.rows }, (_, k) => cell(ctx, k));
    const gridBottom = TOP + page.rows * PITCH;
    return [
      label("intro", "Real items drawn by the vanilla item renderer. Tap a cell to select it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...cells,
      slotLabel("summary", ctx.slot(page.slots.summary), [0, gridBottom + 4], [178, 9], { color: COLOR.dimText, scale: 0.55 }),
      label("selected_caption", "Selected", [SIDE, TOP], { color: COLOR.dimText, scale: 0.55 }),
      slotLabel("selected_info", ctx.slot(page.slots.info), [SIDE, TOP + 10], [180, 9], { color: COLOR.white, scale: 0.7 }),
      button("shuffle", ctx.slot(page.slots.shuffle), [SIDE, TOP + 26], BUTTON, "Shuffle"),
      button("add_diamond", ctx.slot(page.slots.addDiamond), [SIDE, TOP + 48], BUTTON, "Add diamond", "primary"),
      button("clear_selected", ctx.slot(page.slots.clear), [SIDE, TOP + 70], BUTTON, "Clear selected", "danger"),
    ];
  },
};
