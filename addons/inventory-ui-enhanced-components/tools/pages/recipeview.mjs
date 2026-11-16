import { page } from "../../bp/scripts/pages/recipeview.js";
import { COLOR, rect, label, slotLabel } from "../lib.mjs";
import { panel, box } from "./_batch_b.mjs";
import { itemCell, smallButton } from "./_batch_e.mjs";

const STEP = [16, 16];
const HEADER = [150, 16];
const CELL = [18, 18];
const PITCH = 20;
const AREA = [170, 74];
const AREA_TOP = 50;
const RESULT = [26, 26];
const SHAFT = 16;
const HEAD = 6;

function arrow(offset) {
  const [x, y] = offset;
  return [
    { arrow_shaft: rect(COLOR.face, [SHAFT, 4], [x, y - 2], { layer: 3 }) },
    ...Array.from({ length: HEAD }, (_, i) => ({
      [`arrow_head${i}`]: rect(COLOR.face, [1, 2 * (HEAD - i) - 1], [x + SHAFT + i, y - (HEAD - i) + 1], { layer: 3 }),
    })),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const grid = Array.from({ length: 9 }, (_, k) =>
      itemCell(`grid${k}`, ctx.slot(page.slots.grid + k), CELL, [8 + (k % 3) * PITCH, 8 + Math.floor(k / 3) * PITCH], 2));
    const middle = AREA[1] / 2;
    const headerX = STEP[0] + 2;
    return [
      label("intro", "A crafting grid of real item icons. Prev and Next cycle through the recipes.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      smallButton("prev", ctx.slot(page.slots.prev), [0, 12], STEP, "left"),
      { header: box(HEADER, [headerX, 12], COLOR.outline, COLOR.boxBorder, { layer: 1 }) },
      slotLabel("name", ctx.slot(page.slots.name), [headerX, 16], [HEADER[0], 9], { color: COLOR.white, scale: 0.7, align: "center" }),
      smallButton("next", ctx.slot(page.slots.next), [headerX + HEADER[0] + 2, 12], STEP, "right"),
      slotLabel("index", ctx.slot(page.slots.index), [headerX, 32], [HEADER[0], 9], { color: COLOR.dimText, scale: 0.55, align: "center" }),
      {
        area: panel(AREA, [0, AREA_TOP], [
          { frame: box(["100%", "100%"], [0, 0], COLOR.panel, COLOR.boxBorder, { layer: 0 }) },
          ...grid,
          ...arrow([80, middle]),
          itemCell("result", ctx.slot(page.slots.result), RESULT, [120, middle - RESULT[1] / 2], 2),
        ], { layer: 1 }),
      },
      slotLabel("uses", ctx.slot(page.slots.uses), [0, AREA_TOP + AREA[1] + 6], [300, 9], { color: COLOR.text, scale: 0.6 }),
    ];
  },
};
