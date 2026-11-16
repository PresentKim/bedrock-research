import { COLOR, rgb, topLeft } from "../lib.mjs";

export const BADGE_RED = rgb(218, 38, 38);

export function centerLabel(name, text, offset, width, { scale = 0.6, color = COLOR.text, layer = 3 } = {}) {
  return {
    [name]: {
      type: "label", localize: false, text, color, ...topLeft, offset, size: [width, Math.ceil(10 * scale)],
      font_scale_factor: scale, text_alignment: "center", layer,
    },
  };
}
