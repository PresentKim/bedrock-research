import { COLOR, CLEAN, rect, thumb, slotWrap, slotText, view, slotButton, topLeft } from "../lib.mjs";

export function box(name, size, offset, border, fill, layer = 1) {
  return {
    [name]: {
      type: "panel", size, offset, ...topLeft, layer,
      controls: [
        { border: rect(border, size, [0, 0], { layer: 1 }) },
        { fill: rect(fill, [size[0] - 2, size[1] - 2], [1, 1], { layer: 2 }) },
      ],
    },
  };
}

export const sliderIs = (slider, k) => view(`(#slider_value = ${k})`, "#visible", slider);

export function sliderLabel(name, slider, k, text, offset, { scale = 0.6, color = COLOR.text } = {}) {
  return {
    [name]: {
      type: "label", localize: false, text, color, ...topLeft, offset, font_scale_factor: scale, layer: 3,
      bindings: [sliderIs(slider, k)],
    },
  };
}

export function tapBar(ctx, prefix, { steps, cell, keys, valueSlot, tapSlot, y }) {
  const track = steps * cell;
  const at = (k) => [slotText, view(`(${CLEAN} = '${keys[k]}')`, "#visible")];
  return [
    { [`${prefix}_outline`]: rect(COLOR.outline, [track, 13], [0, y + 2], { layer: 1 }) },
    ...Array.from({ length: steps }, (_, k) => slotWrap(`${prefix}_fill${k}`, [Math.max(6, k * cell + cell / 2), 11], [1, y + 3], {
      fill: rect(COLOR.green, [Math.max(6, k * cell + cell / 2 - 1), 11], [0, 0], { collection_index: ctx.slot(valueSlot), layer: 1, bindings: at(k) }),
    }, 2)),
    ...Array.from({ length: steps }, (_, k) => slotWrap(`${prefix}_thumb${k}`, [7, 17], [k * cell + cell / 2 - 3, y], {
      thumb: { ...thumb([7, 17], [0, 0]), collection_index: ctx.slot(valueSlot), bindings: at(k) },
    }, 3)),
    ...Array.from({ length: steps }, (_, k) => slotButton(`${prefix}_tap${k}`, ctx.slot(tapSlot + k), [k * cell, y], [cell, 17])),
  ];
}
