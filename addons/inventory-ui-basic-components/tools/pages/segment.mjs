import { page } from "../../bp/scripts/pages/segment.js";
import { COLOR, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, group, box, gated } from "./_batch_a.mjs";

const SIZE = [56, 16];
const STEP = SIZE[0] - 1;

const look = (fill, color, value) => [...box("cell", SIZE, [0, 0], fill, TONE.black, 1), { text: text(value, color, { layer: 5 }) }];

function segment(name, labels, at, cell) {
  return labels.map((value, k) => cell(`${name}${k}`, value, k, [at[0] + k * STEP, at[1]]));
}

export const ui = {
  page,
  build(ctx) {
    const selected = ctx.slot(page.slots.selected);
    const live = segment("seg", page.options.map((o) => o.label), [0, 16], (name, value, k, offset) => [
      slotButton(`${name}_press`, ctx.slot(page.slots.press + k), offset, SIZE, {
        faces: faces(face(look(COLOR.face, COLOR.darkText, value)), face(look(TONE.hover, COLOR.darkText, value))),
      }),
      gated(`${name}_on`, selected, page.options[k].value, SIZE, offset, look(COLOR.green, COLOR.white, value), 6),
    ]).flat();
    const disabled = segment("dis", page.disabledOptions, [0, 0], (name, value, k, offset) => ({
      [name]: group(SIZE, look(k === 0 ? COLOR.green : COLOR.face, k === 0 ? COLOR.white : COLOR.darkText, value), { offset, layer: k === 0 ? 2 : 1 }),
    }));
    return [
      label("intro", "Tap a segment. The server writes the selected value.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...live,
      slotLabel("selected_text", ctx.slot(page.slots.text), [0, 38], [160, 9], { color: COLOR.text }),
      label("disabled_caption", "Disabled", [0, 56], { color: COLOR.dimText, scale: 0.55 }),
      { disabled: group([page.disabledOptions.length * STEP + 1, SIZE[1]], disabled, { offset: [40, 52], layer: 1, ...DIM(0.5) }) },
    ];
  },
};
