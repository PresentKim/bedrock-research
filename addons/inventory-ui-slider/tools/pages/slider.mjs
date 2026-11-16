import { page } from "../../bp/scripts/pages/slider.js";
import { COLOR, CLEAN, rect, thumb, slotWrap, slotText, view, slotButton, slotLabel, label, releaseSlider } from "../lib.mjs";

const CELL = 18;
const TRACK = page.steps * CELL;

function track(prefix, valueSlot, y) {
  const at = (k) => [slotText, view(`(${CLEAN} = '${page.keys[k]}')`, "#visible")];
  return [
    { [`${prefix}_outline`]: rect(COLOR.outline, [TRACK, 14], [0, y + 2], { layer: 1 }) },
    ...Array.from({ length: page.steps }, (_, k) => slotWrap(`${prefix}_fill${k}`, [k * CELL + CELL / 2, 12], [1, y + 3], {
      fill: rect(COLOR.green, [k * CELL + CELL / 2 - 1, 12], [0, 0], { collection_index: valueSlot, layer: 1, bindings: at(k) }),
    }, 2)),
    ...Array.from({ length: page.steps }, (_, k) => slotWrap(`${prefix}_thumb${k}`, [7, 18], [k * CELL + CELL / 2 - 3, y], {
      thumb: { ...thumb([7, 18], [0, 0]), collection_index: valueSlot, bindings: at(k) },
    }, 3)),
  ];
}

function tapSlider(ctx, y) {
  return [
    ...track("tap", ctx.slot(page.slots.value), y),
    ...Array.from({ length: page.steps }, (_, k) => slotButton(`tap${k}`, ctx.slot(page.slots.tap + k), [k * CELL, y], [CELL, CELL])),
    slotLabel("tap_value", ctx.slot(page.slots.valueText), [TRACK + 8, y + 5], [70, 9], { color: COLOR.text }),
  ];
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("tap_caption", "Tap to set. Each tap goes to the server.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...tapSlider(ctx, 12),
      label("drag_caption", "Drag and release. The value shows at once and reaches the server on release.", [0, 40], { color: COLOR.dimText, scale: 0.55 }),
      ...releaseSlider("ius_slider", { width: TRACK, steps: page.steps, offset: [0, 52], slotOfStep: (k) => ctx.slot(page.slots.dragStep + k) }),
      slotLabel("drag_value", ctx.slot(page.slots.dragText), [TRACK + 8, 57], [140, 9], { color: COLOR.text }),
    ];
  },
};
