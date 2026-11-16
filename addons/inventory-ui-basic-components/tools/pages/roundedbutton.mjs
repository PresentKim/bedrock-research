import { page } from "../../bp/scripts/pages/roundedbutton.js";
import { COLOR, slotButton, slotLabel, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, rounded } from "./_batch_a.mjs";

const SIZE = {
  Small: { size: [48, 12], radius: 6, scale: 0.6 },
  Medium: { size: [64, 16], radius: 8, scale: 0.7 },
  Large: { size: [80, 20], radius: 10, scale: 0.8 },
};

function body(variant, fill, pressed, extra = {}) {
  const { size, radius, scale } = SIZE[variant];
  const [w, h] = size;
  const inner = h - 2;
  const shade = pressed ? 1 : 2;
  return face([
    ...rounded("edge", size, radius, [0, 0], () => TONE.black, 1),
    ...rounded("fill", [w - 2, inner], radius - 1, [1, 1], (y) => (y >= inner - shade ? COLOR.faceShade : fill), 2),
    { text: text(variant, COLOR.darkText, { scale, offset: [0, pressed ? 0 : -1], layer: 4 }) },
  ], extra);
}

export const ui = {
  page,
  build(ctx) {
    let x = 0;
    const row = page.sizes.map((variant, k) => {
      const { size } = SIZE[variant];
      const control = slotButton(`press${k}`, ctx.slot(page.slots.press + k), [x, 16 + (20 - size[1]) / 2], size, {
        faces: faces(body(variant, COLOR.face, false), body(variant, TONE.hover, false), body(variant, COLOR.face, true)),
      });
      x += size[0] + 8;
      return control;
    });
    const disabled = SIZE.Medium.size;
    return [
      label("intro", "Small, medium and large. Corners are stepped rectangles.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...row,
      slotLabel("last", ctx.slot(page.slots.last), [0, 44], [200, 9], { color: COLOR.text }),
      label("disabled_caption", "Disabled", [0, 62], { color: COLOR.dimText, scale: 0.55 }),
      { disabled: { ...body("Medium", COLOR.grayHalf, false, DIM(0.5)), size: disabled, offset: [40, 58], anchor_from: "top_left", anchor_to: "top_left", layer: 3 } },
    ];
  },
};
