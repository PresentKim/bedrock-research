import { page } from "../../bp/scripts/pages/xyslider.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { box } from "./_parts.mjs";

const CELL = 10;
const AREA = page.size * CELL;
const TOP = 12;

function handle() {
  return {
    type: "panel", size: [10, 10],
    controls: [
      { outline: rect(COLOR.outline, [10, 10], [0, 0], { layer: 1 }) },
      { face: rect(COLOR.face, [8, 8], [1, 1], { layer: 2 }) },
    ],
  };
}

export const ui = {
  page,
  build(ctx) {
    const position = ctx.slot(page.slots.position);
    const cells = [];
    for (let y = 0; y < page.size; y++) {
      for (let x = 0; x < page.size; x++) {
        const index = y * page.size + x;
        cells.push(
          whenSlot(`handle_${index}`, position, [10, 10], [x * CELL, TOP + y * CELL], `x${x}y${y}`, handle(), 3),
          slotButton(`cell_${index}`, ctx.slot(page.slots.cell + index), [x * CELL, TOP + y * CELL], [CELL, CELL]),
        );
      }
    }
    return [
      label("intro", "Tap a spot in the square. Each cell is one value pair, 10 by 10.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      box("area", [AREA, AREA], [0, TOP], COLOR.outline, COLOR.outline),
      ...cells,
      slotLabel("value", ctx.slot(page.slots.valueText), [AREA + 10, TOP + 4], [120, 9], { color: COLOR.text }),
      label("axis_note", "Top left is X 5, Y 5. Values are cell centers.", [AREA + 10, TOP + 18], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
