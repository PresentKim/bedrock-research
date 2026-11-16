import { COLOR, rect, slotWrap, slotText, view, slotButton, whenSlot, topLeft, rgb } from "../lib.mjs";

export const HOVER_BORDER = rgb(177, 178, 181);
export const MINUS_BG = rgb(49, 50, 51);

export function rawText(name, slot, offset, size, { scale = 0.7, align = "left", alpha = 1, layer = 3 } = {}) {
  return slotWrap(name, size, offset, {
    value: {
      type: "label", localize: false, text: "#text", color: COLOR.white, alpha, size, collection_index: slot, layer: 1,
      font_scale_factor: scale, text_alignment: align,
      bindings: [slotText, view("(#hover_text - '§o')", "#text")],
    },
  }, layer);
}

export function frame(color, size, layer = 2) {
  const [w, h] = size;
  return {
    type: "panel", size, layer,
    controls: [
      { top: rect(color, [w, 1], [0, 0], { layer: 1 }) },
      { bottom: rect(color, [w, 1], [0, h - 1], { layer: 1 }) },
      { left: rect(color, [1, h], [0, 0], { layer: 1 }) },
      { right: rect(color, [1, h], [w - 1, 0], { layer: 1 }) },
    ],
  };
}

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

export const keyText = (text, { scale = 0.6, color = COLOR.darkText } = {}) => ({
  type: "label", localize: false, text, color, layer: 5, font_scale_factor: scale,
});

export function lightFaces() {
  return [
    { default: rect(COLOR.face, ["100%", "100%"], [0, 0], { controls: [{ shade: rect(COLOR.faceShade, ["100%", 2], [0, 0], { anchor_from: "bottom_left", anchor_to: "bottom_left" }) }] }) },
    { hover: rect(COLOR.face, ["100%", "100%"], [0, 0]) },
    { pressed: rect(COLOR.grayHalf, ["100%", "100%"], [0, 0]) },
  ];
}

export function keyButton(name, slot, offset, size, text, { scale = 0.6, visible, extra = [] } = {}) {
  return slotButton(name, slot, offset, size, {
    faces: lightFaces(),
    visible,
    controls: [...(text === undefined ? [] : [{ text: keyText(text, { scale }) }]), ...extra],
  });
}

export function gateOn(name, slot, size, value, child, layer = 5) {
  return whenSlot(name, slot, size, [0, 0], value, child, layer);
}
