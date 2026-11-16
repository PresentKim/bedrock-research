import { page } from "../../bp/scripts/pages/radiogroup.js";
import { COLOR, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, face, faces, group, diamond, gated } from "./_batch_a.mjs";

const ROW = [120, 28];
const TOP = 14;
const BOX = 13;
const BOX_AT = [3, 7];
const DOT = 5;

const off = (border, layer) => [
  ...diamond("edge", BOX, BOX_AT, border, layer),
  ...diamond("hole", BOX - 2, [BOX_AT[0] + 1, BOX_AT[1] + 1], COLOR.outline, layer + 1),
];

const on = () => [
  ...diamond("on", BOX, BOX_AT, COLOR.green, 1),
  ...diamond("dot", DOT, [BOX_AT[0] + (BOX - DOT) / 2, BOX_AT[1] + (BOX - DOT) / 2], COLOR.white, 2),
];

const rowLabel = (name, value, y) => label(name, value, [BOX_AT[0] + BOX + 9, y + 10], { color: COLOR.white, scale: 0.7 });

export const ui = {
  page,
  build(ctx) {
    const selected = ctx.slot(page.slots.selected);
    const rows = page.options.flatMap((option, k) => {
      const y = TOP + k * ROW[1];
      return [
        { [`off${k}`]: group(ROW, off(COLOR.boxBorder, 1), { offset: [0, y], layer: 1 }) },
        rowLabel(`label${k}`, option.label, y),
        slotButton(`press${k}`, ctx.slot(page.slots.press + k), [0, y], ROW, {
          faces: faces(face([]), face(off(TONE.hover, 1)), face([])),
        }),
        gated(`on${k}`, selected, option.value, ROW, [0, y], on(), 6),
      ];
    });
    const disabledY = TOP + page.options.length * ROW[1];
    return [
      label("intro", "Tap a row. The server writes the selected value.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...rows,
      { disabled: group(ROW, [...off(COLOR.boxBorder, 1), rowLabel("disabled_label", page.disabledLabel, 0)], { offset: [0, disabledY], layer: 1, ...DIM(0.5) }) },
      slotLabel("selected_text", ctx.slot(page.slots.text), [140, TOP + 10], [120, 9], { color: COLOR.text }),
    ];
  },
};
