import { COLOR, rect, keyedCell, rgb } from "../lib.mjs";

export const CHART = {
  size: [150, 80],
  inner: [148, 78],
  bg: COLOR.outline,
  border: COLOR.boxBorder,
  baseline: rgb(177, 178, 181),
  negative: rgb(179, 49, 45),
};

export function faceButton(text, scale = 0.6) {
  return {
    faces: [
      { default: rect(COLOR.face, ["100%", "100%"], [0, 0], { controls: [{ shade: rect(COLOR.faceShade, ["100%", 2], [0, 0], { anchor_from: "bottom_left", anchor_to: "bottom_left" }) }] }) },
      { hover: rect(rgb(177, 178, 181), ["100%", "100%"], [0, 0]) },
      { pressed: rect(COLOR.grayHalf, ["100%", "100%"], [0, 0]) },
    ],
    controls: [{ text: { type: "label", localize: false, text, color: COLOR.darkText, layer: 5, font_scale_factor: scale } }],
  };
}

export function cellTemplate(ctx, name, size, ids) {
  const [body] = Object.values(keyedCell(name, "$iubc_slot", size, [0, 0], ids));
  return ctx.def(`${name}_cell`, { ...body, "$iubc_slot|default": 0 });
}

export function cellAt(name, template, slot, offset, layer = 3) {
  return { [`${name}@${template.slice(1)}`]: { $iubc_slot: slot, offset, layer } };
}

export function columnFill(height, filled, color) {
  return {
    type: "panel", size: ["100%", height],
    controls: filled > 0 ? [{ fill: rect(color, ["100%", filled], [0, height - filled]) }] : [],
  };
}

export function chartFrame(name, offset) {
  return {
    [name]: {
      type: "panel", size: CHART.size, offset, anchor_from: "top_left", anchor_to: "top_left", layer: 1,
      controls: [
        { border: rect(CHART.border, CHART.size, [0, 0], { layer: 1 }) },
        { bg: rect(CHART.bg, CHART.inner, [1, 1], { layer: 2 }) },
      ],
    },
  };
}
