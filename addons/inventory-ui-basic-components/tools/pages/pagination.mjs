import { page } from "../../bp/scripts/pages/pagination.js";
import { COLOR, keyedCell, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, group, box, frame, gated, chevron } from "./_batch_a.mjs";

const CELL = [16, 16];
const PITCH = CELL[0] + 2;
const TOP = 16;
const CHEVRON_AT = [6, 4];

const cellBody = (n, current) => group(CELL, [
  ...box("cell", CELL, [0, 0], current ? COLOR.green : COLOR.outline, current ? COLOR.white : COLOR.boxBorder, 1),
  { number: text(`${n}`, COLOR.white, { layer: 3 }) },
]);

const hoverFaces = () => faces(face([]), face(frame("hover", CELL, [0, 0], TONE.hover, 1)));

function arrow(name, side, buttonSlot, stateSlot, x) {
  const drawn = (layer) => [...box("cell", CELL, [0, 0], COLOR.outline, COLOR.boxBorder, layer), ...chevron("mark", side, CHEVRON_AT, COLOR.white, layer + 2)];
  return [
    gated(`${name}_on`, stateSlot, "on", CELL, [x, TOP], [
      { look: group(CELL, drawn(1), { layer: 1 }) },
      slotButton(`${name}_press`, buttonSlot, [0, 0], CELL, { faces: hoverFaces() }),
    ]),
    gated(`${name}_off`, stateSlot, "off", CELL, [x, TOP], [{ look: group(CELL, drawn(1), { layer: 1, ...DIM(0.4) }) }]),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const ids = {};
    for (let n = 1; n <= page.count; n++) {
      ids[`p${n}`] = ctx.def(`p${n}`, cellBody(n, false));
      ids[`c${n}`] = ctx.def(`c${n}`, cellBody(n, true));
    }
    const cells = Array.from({ length: page.length }, (_, k) => {
      const x = (k + 1) * PITCH;
      return [
        keyedCell(`cell${k}`, ctx.slot(page.slots.cellKey + k), CELL, [x, TOP], ids),
        slotButton(`cell${k}_press`, ctx.slot(page.slots.cell + k), [x, TOP], CELL, { faces: hoverFaces() }),
      ];
    }).flat();
    return [
      label("intro", "Tap a number or an arrow. The server writes each cell.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...arrow("prev", "left", ctx.slot(page.slots.prev), ctx.slot(page.slots.prevState), 0),
      ...cells,
      ...arrow("next", "right", ctx.slot(page.slots.next), ctx.slot(page.slots.nextState), (page.length + 1) * PITCH),
      slotLabel("page_text", ctx.slot(page.slots.text), [0, TOP + 22], [160, 9], { color: COLOR.text }),
    ];
  },
};
