import { page } from "../../bp/scripts/pages/stepper.js";
import { COLOR, rect, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, group, box, gated, chevron } from "./_batch_a.mjs";

const SIZE = [120, 16];
const CELL = [16, 16];
const CHEVRON_AT = [6, 4];
const LEFT = 90;

const arrowAt = (side) => [side === "left" ? 0 : SIZE[0] - CELL[0], 0];

function arrow(name, side, buttonSlot, stateSlot, y) {
  const [x] = arrowAt(side);
  const at = [LEFT + x, y];
  return [
    gated(`${name}_on`, stateSlot, "on", CELL, at, [
      slotButton(`${name}_press`, buttonSlot, [0, 0], CELL, {
        faces: faces(face([]), face([{ glow: rect(TONE.cellHover, [14, 14], [1, 1], { layer: 1 }) }])),
      }),
      ...chevron(`${name}_mark`, side, CHEVRON_AT),
    ], 4),
    gated(`${name}_off`, stateSlot, "off", CELL, at, [{ dim: group(CELL, chevron("mark", side, CHEVRON_AT, COLOR.white, 1), DIM(0.3)) }], 4),
  ];
}

function frame(name, offset, extra = {}) {
  return { [name]: group(SIZE, box("frame", SIZE, [0, 0], COLOR.outline, COLOR.boxBorder, 1), { offset, layer: 1, ...extra }) };
}

export const ui = {
  page,
  build(ctx) {
    const rows = page.steppers.flatMap((s, k) => {
      const y = 16 + k * 24;
      const display = (n) => ctx.slot(n + page.stride.display * k);
      const button = (n) => ctx.slot(n + page.stride.button * k);
      return [
        label(`caption${k}`, `${s.caption}${s.loop ? " (loop)" : ""}`, [0, y + 5], { color: COLOR.dimText, scale: 0.55 }),
        frame(`frame${k}`, [LEFT, y]),
        slotLabel(`value${k}`, display(page.slots.value), [LEFT + CELL[0], y + 4], [SIZE[0] - 2 * CELL[0], 9], { color: COLOR.white, scale: 0.7, align: "center" }),
        ...arrow(`prev${k}`, "left", button(page.slots.prev), display(page.slots.prevState), y),
        ...arrow(`next${k}`, "right", button(page.slots.next), display(page.slots.nextState), y),
      ];
    });
    const disabledY = 16 + page.steppers.length * 24;
    return [
      label("intro", "Tap the arrows. The server writes the value and blocks the ends.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...rows,
      label("disabled_caption", "Disabled", [0, disabledY + 5], { color: COLOR.dimText, scale: 0.55 }),
      {
        disabled: group(SIZE, [
          ...box("frame", SIZE, [0, 0], COLOR.outline, COLOR.boxBorder, 1),
          ...chevron("prev", "left", CHEVRON_AT, COLOR.white, 3),
          ...chevron("next", "right", [SIZE[0] - CELL[0] + CHEVRON_AT[0], CHEVRON_AT[1]], COLOR.white, 3),
          { value: text("Normal", COLOR.white, { layer: 3 }) },
        ], { offset: [LEFT, disabledY], layer: 1, ...DIM(0.5) }),
      },
    ];
  },
};
