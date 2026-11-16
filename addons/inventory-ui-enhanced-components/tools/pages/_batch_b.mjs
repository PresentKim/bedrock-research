import { COLOR, rgb, rect, topLeft, slotButton } from "../lib.mjs";

export const TONE = {
  black: [0, 0, 0],
  hoverLight: rgb(177, 178, 181),
  topEdge: rgb(230, 232, 235),
  hoverDark: rgb(60, 61, 62),
  primaryHover: rgb(47, 106, 31),
  danger: rgb(255, 19, 19),
  dangerHover: rgb(200, 15, 15),
};

export const FULL = ["100%", "100%"];

export const panel = (size, offset, controls = [], extra = {}) => ({ type: "panel", size, offset, ...topLeft, controls, ...extra });

export const textBody = (value, offset, { scale = 0.6, color = COLOR.text, layer = 3, size } = {}) => ({
  type: "label", localize: false, text: value, color, ...topLeft, offset, font_scale_factor: scale, layer, ...(size ? { size } : {}),
});

export const centerText = (value, color, scale = 0.7, offset = [0, -1]) => ({
  text: { type: "label", localize: false, text: value, color, offset, layer: 5, font_scale_factor: scale },
});

export function box(size, offset, fill, border, extra = {}) {
  return panel(size, offset, [
    { edge: rect(border, FULL, [0, 0], { layer: 1 }) },
    { fill: rect(fill, ["100% - 2px", "100% - 2px"], [1, 1], { layer: 2 }) },
  ], extra);
}

export function frame(size, offset, color, extra = {}) {
  const bottom = { anchor_from: "bottom_left", anchor_to: "bottom_left" };
  const right = { anchor_from: "top_right", anchor_to: "top_right" };
  return panel(size, offset, [
    { top: rect(color, ["100%", 1], [0, 0], { layer: 1 }) },
    { bottom: rect(color, ["100%", 1], [0, 0], { layer: 1, ...bottom }) },
    { left: rect(color, [1, "100%"], [0, 0], { layer: 1 }) },
    { right: rect(color, [1, "100%"], [0, 0], { layer: 1, ...right }) },
  ], extra);
}

export const darkFaces = (border, hover) => [
  { default: box(FULL, [0, 0], COLOR.outline, border) },
  { hover: box(FULL, [0, 0], COLOR.outline, hover) },
  { pressed: box(FULL, [0, 0], COLOR.outline, border) },
];

export function chevron(dir, offset, color = COLOR.white, layer = 3) {
  const points = [];
  for (let i = 0; i < 4; i++) {
    if (dir === "down") points.push([i, i], [6 - i, i]);
    if (dir === "up") points.push([i, 3 - i], [6 - i, 3 - i]);
    if (dir === "right") points.push([i, i], [i, 6 - i]);
    if (dir === "left") points.push([3 - i, i], [3 - i, 6 - i]);
  }
  const size = dir === "down" || dir === "up" ? [7, 4] : [4, 7];
  return panel(size, offset, points.map((at, n) => ({ [`p${n}`]: rect(color, [1, 1], at) })), { layer });
}

const VARIANT = {
  secondary: { face: COLOR.face, hover: TONE.hoverLight, text: COLOR.darkText },
  primary: { face: COLOR.green, hover: TONE.primaryHover, text: COLOR.white },
  danger: { face: TONE.danger, hover: TONE.dangerHover, text: COLOR.white },
};

function buttonBody(face, shade) {
  return panel(FULL, [0, 0], [
    { edge: rect(TONE.black, FULL, [0, 0], { layer: 1 }) },
    { face: rect(face, ["100% - 2px", "100% - 2px"], [1, 1], { layer: 2 }) },
    { shine: rect(COLOR.white, ["100% - 2px", 1], [1, 1], { layer: 3 }) },
    { shade: rect(COLOR.faceShade, ["100% - 2px", shade], [1, -1], { layer: 3, anchor_from: "bottom_left", anchor_to: "bottom_left" }) },
  ]);
}

export function button(name, slot, offset, size, content, variant = "secondary", extra = {}) {
  const tone = VARIANT[variant];
  return slotButton(name, slot, offset, size, {
    faces: [{ default: buttonBody(tone.face, 2) }, { hover: buttonBody(tone.hover, 2) }, { pressed: buttonBody(tone.hover, 1) }],
    controls: [typeof content === "string" ? centerText(content, tone.text) : content],
    ...extra,
  });
}

export function disabledButton(name, offset, size, text) {
  return { [name]: panel(size, offset, [{ body: buttonBody(COLOR.grayHalf, 2) }, centerText(text, COLOR.darkText)], { alpha: 0.5, layer: 4 }) };
}

export function lightWindow(size, offset, controls, extra = {}) {
  const [w, h] = size;
  return panel(size, offset, [
    { shadow: rect(COLOR.faceShade, [w + 2, h + 2], [-1, 1], { layer: 1 }) },
    { ring: rect(TONE.black, [w + 2, h + 2], [-1, -1], { layer: 2 }) },
    { edge: rect(TONE.black, size, [0, 0], { layer: 3 }) },
    { top: rect(TONE.topEdge, [w, 1], [0, 0], { layer: 4 }) },
    { face: rect(COLOR.face, [w - 2, h - 2], [1, 1], { layer: 4 }) },
    { content: panel(size, [0, 0], controls, { layer: 5 }) },
  ], extra);
}
