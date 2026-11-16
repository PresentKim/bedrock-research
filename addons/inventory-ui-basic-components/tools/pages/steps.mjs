import { page } from "../../bp/scripts/pages/steps.js";
import { COLOR, rect, label, slotLabel, whenSlot } from "../lib.mjs";
import { rounded } from "./_batch_a.mjs";
import { panel, button, disabledButton } from "./_batch_b.mjs";
import { centerLabel } from "./_batch_h.mjs";

const DOT = 15;
const SPACING = 96;
const FIRST = (394 - SPACING * (page.steps.length - 1)) / 2;
const DOT_Y = 20;
const NAME_W = 80;
const BUTTON = [60, 16];
const BUTTON_Y = 100;

const centerX = (k) => FIRST + k * SPACING;
const disc = (name, size, offset, color, layer) => rounded(name, [size, size], size / 2, offset, () => color, layer);

const LOOK = {
  done: { name: COLOR.text, controls: () => [...disc("fill", DOT, [0, 0], COLOR.green, 1), { mark: { type: "image", texture: "textures/ui/checkmark_white", size: [9, 9], layer: 3 } }] },
  current: { name: COLOR.white, number: COLOR.white, controls: () => [...disc("ring", DOT, [0, 0], COLOR.white, 1), ...disc("hole", DOT - 4, [2, 2], COLOR.outline, 2)] },
  pending: { name: COLOR.dimText, number: COLOR.dimText, controls: () => [...disc("fill", DOT, [0, 0], COLOR.boxBorder, 1), ...disc("hole", DOT - 2, [1, 1], COLOR.outline, 2)] },
};

function stepBody(k, look) {
  const offsetX = (NAME_W - DOT) / 2;
  const tone = LOOK[look];
  return panel([NAME_W, 32], [0, 0], [
    { dot: panel([DOT, DOT], [offsetX, 0], [
      ...tone.controls(),
      ...(tone.number ? [centerLabel("number", `${k + 1}`, [0, 4], DOT, { color: tone.number, layer: 4 })] : []),
    ]) },
    centerLabel("name", page.steps[k].name, [0, DOT + 6], NAME_W, { color: tone.name }),
  ]);
}

function step(ctx, k) {
  const at = [centerX(k) - NAME_W / 2, DOT_Y];
  return Object.keys(LOOK).map((look) => whenSlot(`step${k}_${look}`, ctx.slot(page.slots.state + k), [NAME_W, 32], at, look, stepBody(k, look)));
}

function line(ctx, k) {
  const at = [centerX(k) + DOT / 2 + 4, DOT_Y + (DOT - 2) / 2];
  const size = [SPACING - DOT - 8, 2];
  return [
    { [`line${k}`]: rect(COLOR.boxBorder, size, at, { layer: 1 }) },
    whenSlot(`line${k}_done`, ctx.slot(page.slots.line + k), size, at, "on", rect(COLOR.green, size, [0, 0]), 2),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const backAt = [394 / 2 - BUTTON[0] - 6, BUTTON_Y];
    const nextAt = [394 / 2 + 6, BUTTON_Y];
    return [
      label("intro", "Back and Next move the wizard. The server marks each step.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...page.steps.flatMap((_, k) => step(ctx, k)),
      ...page.steps.slice(0, -1).flatMap((_, k) => line(ctx, k)),
      slotLabel("title", ctx.slot(page.slots.title), [0, 66], [394, 9], { color: COLOR.white, align: "center", scale: 0.7 }),
      slotLabel("text", ctx.slot(page.slots.text), [0, 80], [394, 9], { color: COLOR.dimText, align: "center" }),
      whenSlot("back_on", ctx.slot(page.slots.backState), BUTTON, backAt, "on", panel(BUTTON, [0, 0], [button("back", ctx.slot(page.slots.back), [0, 0], BUTTON, "Back")]), 4),
      whenSlot("back_off", ctx.slot(page.slots.backState), BUTTON, backAt, "off", panel(BUTTON, [0, 0], [disabledButton("back_dim", [0, 0], BUTTON, "Back")]), 4),
      whenSlot("next_on", ctx.slot(page.slots.nextState), BUTTON, nextAt, "on", panel(BUTTON, [0, 0], [
        button("next", ctx.slot(page.slots.next), [0, 0], BUTTON,
          slotLabel("text", ctx.slot(page.slots.nextText), [0, 4], [BUTTON[0], 9], { color: COLOR.white, align: "center", scale: 0.7 }), "primary"),
      ]), 4),
      whenSlot("next_off", ctx.slot(page.slots.nextState), BUTTON, nextAt, "off", panel(BUTTON, [0, 0], [disabledButton("next_dim", [0, 0], BUTTON, "Finished")]), 4),
    ];
  },
};
