import { page } from "../../bp/scripts/pages/progressbar.js";
import { COLOR, rect, slotButton, slotLabel, label } from "../lib.mjs";
import { faceButton, cellTemplate, cellAt } from "./_batch_c.mjs";

const INNER = [200, 4];
const BUTTON = [30, 14];

function bar(name, template, slot, [x, y]) {
  return [
    { [`${name}_border`]: rect([0, 0, 0], [INNER[0] + 2, INNER[1] + 2], [x, y], { layer: 1 }) },
    { [`${name}_track`]: rect(COLOR.faceShade, INNER, [x + 1, y + 1], { layer: 2 }) },
    cellAt(`${name}_fill`, template, slot, [x + 1, y + 1]),
  ];
}

function fillDef(width) {
  return { type: "panel", size: INNER, controls: width > 0 ? [{ fill: rect(COLOR.green, [width, INNER[1]], [0, 0]) }] : [] };
}

export const ui = {
  page,
  build(ctx) {
    const ids = {};
    for (let v = 0; v <= 100; v++) ids[`w${v}`] = ctx.def(`w${v}`, fillDef(v * 2));
    const template = cellTemplate(ctx, "fill", INNER, ids);
    const stepNames = page.steps.map((s) => (s > 0 ? `+${s}` : `${s}`));
    const names = [...stepNames, "0%", "100%"];
    return [
      label("intro", "The server writes the value. Each button press changes it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...bar("value", template, ctx.slot(page.slots.fill), [0, 16]),
      slotLabel("value_text", ctx.slot(page.slots.text), [210, 15], [60, 9], { color: COLOR.text, keepFormat: true }),
      ...names.map((text, k) => slotButton(`set${k}`, ctx.slot(page.slots.step + k), [k * (BUTTON[0] + 4), 28], BUTTON, faceButton(text))),
      label("auto_caption", "Auto fill. The server advances the value every tick.", [0, 56], { color: COLOR.dimText, scale: 0.55 }),
      ...bar("auto", template, ctx.slot(page.slots.autoFill), [0, 72]),
      slotLabel("auto_text", ctx.slot(page.slots.autoText), [210, 71], [60, 9], { color: COLOR.text, keepFormat: true }),
      slotButton("play", ctx.slot(page.slots.play), [0, 84], [40, 14], {
        ...faceButton(""),
        controls: [slotLabel("play_text", ctx.slot(page.slots.playText), [0, 3], [40, 9], { color: COLOR.darkText, align: "center" })],
      }),
    ];
  },
};
