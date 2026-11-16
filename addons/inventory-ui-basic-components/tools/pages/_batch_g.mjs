import { COLOR, rect, whenSlot } from "../lib.mjs";
import { TONE, FULL, panel, box, frame } from "./_batch_b.mjs";

export const gate = (name, slot, value, size, offset, controls, layer = 3) => whenSlot(name, slot, size, offset, value, panel(size, [0, 0], controls), layer);

export const rowFaces = () => [
  { default: panel(FULL, [0, 0]) },
  { hover: rect(TONE.hoverDark, FULL, [0, 0], { alpha: 0.6 }) },
  { pressed: rect(TONE.hoverDark, FULL, [0, 0], { alpha: 0.6 }) },
];

export const linkFaces = () => [
  { default: panel(FULL, [0, 0]) },
  { hover: frame(FULL, [0, 0], TONE.hoverLight) },
  { pressed: frame(FULL, [0, 0], COLOR.white) },
];

export function selectedRow(size) {
  return [
    { edge: rect(COLOR.white, size, [0, 0], { layer: 1 }) },
    { fill: rect(TONE.hoverDark, [size[0] - 2, size[1] - 2], [1, 1], { layer: 2 }) },
    { mark: rect(COLOR.green, [2, size[1] - 2], [1, 1], { layer: 3 }) },
  ];
}

export function stepArrow(name, dir, offset, color = COLOR.white, layer = 4) {
  return [0, 1, 2].map((y) => {
    const w = dir === "up" ? 1 + 2 * y : 5 - 2 * y;
    return { [`${name}${y}`]: rect(color, [w, 1], [offset[0] + (5 - w) / 2, offset[1] + y], { layer }) };
  });
}

export function triangle(name, dir, offset, color = COLOR.white, layer = 4) {
  return [0, 1, 2, 3].map((k) => {
    const long = 7 - 2 * k;
    const [size, at] = dir === "right" ? [[1, long], [k, k]] : [[long, 1], [k, k]];
    return { [`${name}${k}`]: rect(color, size, [offset[0] + at[0], offset[1] + at[1]], { layer }) };
  });
}

export const TEXT_LAYER = 20;

export const raised =(control, layer) => Object.fromEntries(Object.entries(control).map(([name, body]) => [name, { ...body, layer }]));

export const darkCell = (size, offset, extra = {}) => box(size, offset, COLOR.outline, COLOR.boxBorder, extra);
