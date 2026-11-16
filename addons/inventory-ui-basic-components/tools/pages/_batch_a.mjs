import { COLOR, rgb, rect, whenSlot } from "../lib.mjs";

export const TONE = {
  black: [0, 0, 0],
  hover: rgb(177, 178, 181),
  primaryHover: rgb(47, 106, 31),
  danger: rgb(255, 19, 19),
  dangerHover: rgb(200, 15, 15),
  cellHover: rgb(60, 61, 62),
};

export const DIM = (alpha) => ({ alpha, propagate_alpha: true });

export function text(value, color, { scale = 0.7, offset = [0, 0], layer = 6 } = {}) {
  return { type: "label", localize: false, text: value, color, font_scale_factor: scale, offset, layer, anchor_from: "center", anchor_to: "center" };
}

export const face = (controls, extra = {}) => ({ type: "panel", size: ["100%", "100%"], controls, ...extra });

export const faces = (normal, hover = normal, pressed = normal) => [{ default: normal }, { hover }, { pressed }];

export const group = (size, controls, extra = {}) => ({ type: "panel", size, anchor_from: "top_left", anchor_to: "top_left", offset: [0, 0], controls, ...extra });

export function gated(name, slot, value, size, offset, controls, layer = 3) {
  return whenSlot(name, slot, size, offset, value, group(size, controls), layer);
}

export function box(name, size, offset, fill, border, layer = 1) {
  return [
    { [`${name}_border`]: rect(border, size, offset, { layer }) },
    { [`${name}_fill`]: rect(fill, [size[0] - 2, size[1] - 2], [offset[0] + 1, offset[1] + 1], { layer: layer + 1 }) },
  ];
}

export function frame(name, size, offset, color, layer = 3) {
  const [w, h] = size;
  const [x, y] = offset;
  return [
    { [`${name}_top`]: rect(color, [w, 1], [x, y], { layer }) },
    { [`${name}_bottom`]: rect(color, [w, 1], [x, y + h - 1], { layer }) },
    { [`${name}_left`]: rect(color, [1, h - 2], [x, y + 1], { layer }) },
    { [`${name}_right`]: rect(color, [1, h - 2], [x + w - 1, y + 1], { layer }) },
  ];
}

function runs(rows) {
  const merged = [];
  for (const row of rows) {
    const last = merged[merged.length - 1];
    if (last && last.x === row.x && last.w === row.w && last.color === row.color) last.h += 1;
    else merged.push({ ...row, h: 1 });
  }
  return merged;
}

function drawRuns(name, rows, offset, layer) {
  return runs(rows).map((r, i) => ({ [`${name}${i}`]: rect(r.color, [r.w, r.h], [offset[0] + r.x, offset[1] + r.y], { layer }) }));
}

export function diamond(name, size, offset, color, layer = 3) {
  const half = (size - 1) / 2;
  const rows = Array.from({ length: size }, (_, y) => {
    const w = 2 * (half - Math.abs(y - half)) + 1;
    return { x: half - (w - 1) / 2, y, w, color };
  });
  return rows.map((r, i) => ({ [`${name}${i}`]: rect(color, [r.w, 1], [offset[0] + r.x, offset[1] + r.y], { layer }) }));
}

function insetAt(y, h, r) {
  const d = y < r ? r - (y + 0.5) : y >= h - r ? y + 0.5 - (h - r) : 0;
  return d > 0 ? Math.round(r - Math.sqrt(r * r - d * d)) : 0;
}

export function rounded(name, size, radius, offset, colorAt, layer = 1) {
  const [w, h] = size;
  const rows = Array.from({ length: h }, (_, y) => {
    const inset = insetAt(y, h, radius);
    return { x: inset, y, w: w - 2 * inset, color: colorAt(y) };
  });
  return drawRuns(name, rows, offset, layer);
}

const CHEVRON_LEFT = [[3, 0], [2, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 6]];

export function chevron(name, direction, offset, color = COLOR.white, layer = 6) {
  const points = direction === "left" ? CHEVRON_LEFT : CHEVRON_LEFT.map(([x, y]) => [3 - x, y]);
  return points.map(([x, y], i) => ({ [`${name}${i}`]: rect(color, [1, 1], [offset[0] + x, offset[1] + y], { layer }) }));
}
