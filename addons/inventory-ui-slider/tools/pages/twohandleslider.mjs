import { page } from "../../bp/scripts/pages/twohandleslider.js";
import { COLOR, CLEAN, rect, thumb, slotWrap, slotText, view, slotButton, slotLabel, label, releaseSlider } from "../lib.mjs";
import { sliderLabel } from "./_parts.mjs";

const CELL = 18;
const TRACK = page.steps * CELL;
const LOW = "ius_ths_low";
const HIGH = "ius_ths_high";
const center = (k) => k * CELL + CELL / 2;

function tapRange(ctx, y) {
  const is = (value) => [slotText, view(`(${CLEAN} = '${value}')`, "#visible")];
  const handle = (which, slot) => Array.from({ length: page.steps }, (_, k) => slotWrap(`${which}_thumb${k}`, [7, 17], [center(k) - 3, y], {
    thumb: { ...thumb([7, 17], [0, 0]), collection_index: ctx.slot(slot), bindings: is(page.keys[k]) },
  }, 3));
  return [
    { tap_outline: rect(COLOR.outline, [TRACK, 13], [0, y + 2], { layer: 1 }) },
    ...Array.from({ length: page.steps - 1 }, (_, k) => slotWrap(`segment${k}`, [CELL, 11], [center(k), y + 3], {
      fill: rect(COLOR.green, [CELL, 11], [0, 0], { collection_index: ctx.slot(page.slots.segment + k), layer: 1, bindings: is("on") }),
    }, 2)),
    ...handle("low", page.slots.low),
    ...handle("high", page.slots.high),
    ...Array.from({ length: page.steps }, (_, k) => slotButton(`tap${k}`, ctx.slot(page.slots.tap + k), [k * CELL, y], [CELL, 17])),
    slotLabel("tap_value", ctx.slot(page.slots.valueText), [TRACK + 8, y + 4], [120, 9], { color: COLOR.text }),
  ];
}

function readouts(slider, word, offset) {
  return Array.from({ length: page.steps }, (_, k) => sliderLabel(`${slider}_read${k}`, slider, k, `${word} ${k * 10}`, offset));
}

const stepSlots = (ctx, base) => (k) => ctx.slot(base + k);

export const ui = {
  page,
  build(ctx) {
    return [
      label("tap_caption", "Tap the bar. The server moves the nearer handle.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...tapRange(ctx, 12),
      label("drag_caption", "Drag low and high and release. The server sorts them if they cross.", [0, 40], { color: COLOR.dimText, scale: 0.55 }),
      label("low_caption", "Low", [0, 57], { color: COLOR.text, scale: 0.55 }),
      ...releaseSlider(LOW, { width: TRACK, steps: page.steps, offset: [24, 52], slotOfStep: stepSlots(ctx, page.slots.lowStep) }),
      label("high_caption", "High", [0, 79], { color: COLOR.text, scale: 0.55 }),
      ...releaseSlider(HIGH, { width: TRACK, steps: page.steps, offset: [24, 74], slotOfStep: stepSlots(ctx, page.slots.highStep), value: page.steps - 1 }),
      ...readouts(LOW, "Low", [TRACK + 32, 57]),
      ...readouts(HIGH, "High", [TRACK + 32, 79]),
      slotLabel("drag_value", ctx.slot(page.slots.dragText), [0, 98], [260, 9]),
    ];
  },
};
