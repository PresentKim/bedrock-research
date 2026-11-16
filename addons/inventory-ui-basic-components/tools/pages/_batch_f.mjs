import { COLOR, CLEAN, rgb, rect, slotWrap, slotText, view, whenSlot } from "../lib.mjs";
import { FULL, panel, box, centerText } from "./_batch_b.mjs";

export const TINT = {
  amber: rgb(214, 158, 46),
  red: rgb(179, 49, 45),
};

export function gate(name, slot, value, size, offset, controls, layer = 3) {
  return whenSlot(name, slot, size, offset, value, panel(size, [0, 0], controls), layer);
}

export function badge(name, size, offset, text, { fill = COLOR.outline, border = COLOR.boxBorder, color = COLOR.white, scale = 0.55, layer = 2 } = {}) {
  return { [name]: panel(size, offset, [{ frame: box(FULL, [0, 0], fill, border) }, centerText(text, color, scale, [0, 0])], { layer }) };
}

const DOT_ROWS = [[1, 3], [0, 5], [0, 5], [0, 5], [1, 3]];

export function dot(name, offset, color, layer = 4) {
  return { [name]: panel([5, 5], offset, DOT_ROWS.map(([x, w], y) => ({ [`r${y}`]: rect(color, [w, 1], [x, y]) })), { layer }) };
}

export function cross(name, offset, color = COLOR.white, layer = 6) {
  const points = [0, 1, 2, 3, 4].flatMap((i) => (i === 2 ? [[2, 2]] : [[i, i], [4 - i, i]]));
  return { [name]: panel([5, 5], offset, points.map(([x, y], n) => ({ [`p${n}`]: rect(color, [1, 1], [x, y]) })), { layer }) };
}

export function figure(name, slot, cell, doll, offset) {
  return {
    [name]: panel(cell, offset, [
      { back: box(FULL, [0, 0], COLOR.panel, COLOR.boxBorder, { layer: 1 }) },
      slotWrap("doll", [doll, doll], [(cell[0] - doll) / 2, 3], {
        renderer: {
          type: "custom", renderer: "live_horse_renderer", size: [doll, doll], collection_index: slot, layer: 1,
          bindings: [slotText, view(CLEAN, "#entity_id")],
        },
      }, 5),
    ], { clips_children: true, layer: 3 }),
  };
}
