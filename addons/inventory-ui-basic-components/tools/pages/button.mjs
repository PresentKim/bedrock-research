import { page } from "../../bp/scripts/pages/button.js";
import { COLOR, rect, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, gated } from "./_batch_a.mjs";

const SIZE = [64, 16];
const GAP = 8;
const LOOK = {
  Secondary: { face: COLOR.face, hover: TONE.hover, text: COLOR.darkText },
  Primary: { face: COLOR.green, hover: TONE.primaryHover, text: COLOR.white },
  Danger: { face: TONE.danger, hover: TONE.dangerHover, text: COLOR.white },
};

function body(size, fill, value, textColor, pressed, extra = {}) {
  const [w, h] = size;
  return face([
    { border: rect(TONE.black, size, [0, 0], { layer: 1 }) },
    { fill: rect(fill, [w - 2, h - 2], [1, 1], { layer: 2 }) },
    { shine: rect(COLOR.white, [w - 2, 1], [1, 1], { layer: 3 }) },
    { shade: rect(COLOR.faceShade, [w - 2, pressed ? 1 : 2], [1, pressed ? h - 2 : h - 3], { layer: 3 }) },
    { text: text(value, textColor, { offset: [0, pressed ? 0 : -1], layer: 4 }) },
  ], extra);
}

function button(name, slot, offset, size, variant, value) {
  const look = LOOK[variant];
  return slotButton(name, slot, offset, size, {
    faces: faces(body(size, look.face, value, look.text, false), body(size, look.hover, value, look.text, false), body(size, look.face, value, look.text, true)),
  });
}

const disabledLook = (variant, value, size) => body(size, COLOR.grayHalf, value, LOOK[variant].text, false, DIM(0.5));

export const ui = {
  page,
  build(ctx) {
    const enabled = ctx.slot(page.slots.enabled);
    const rowSize = [page.variants.length * (SIZE[0] + GAP), SIZE[1]];
    const at = (k) => [k * (SIZE[0] + GAP), 0];
    const toggleSize = [96, 16];
    return [
      label("intro", "Secondary, primary and danger. Each press goes to the server.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      gated("live", enabled, "on", rowSize, [0, 16],
        page.variants.map((variant, k) => button(`press${k}`, ctx.slot(page.slots.press + k), at(k), SIZE, variant, variant))),
      gated("off", enabled, "off", rowSize, [0, 16],
        page.variants.map((variant, k) => ({ [`disabled${k}`]: { ...disabledLook(variant, variant, SIZE), size: SIZE, offset: at(k), anchor_from: "top_left", anchor_to: "top_left" } }))),
      slotLabel("last", ctx.slot(page.slots.last), [0, 40], [200, 9], { color: COLOR.text }),
      gated("disable", enabled, "on", toggleSize, [0, 56], [button("disable_press", ctx.slot(page.slots.toggle), [0, 0], toggleSize, "Secondary", "Disable buttons")]),
      gated("enable", enabled, "off", toggleSize, [0, 56], [button("enable_press", ctx.slot(page.slots.toggle), [0, 0], toggleSize, "Primary", "Enable buttons")]),
      label("disabled_note", "Disabled hides the slot buttons and draws the gray look.", [104, 61], { color: COLOR.dimText, scale: 0.55 }),
    ];
  },
};
