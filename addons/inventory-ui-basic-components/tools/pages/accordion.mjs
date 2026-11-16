import { page } from "../../bp/scripts/pages/accordion.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { TONE, FULL, panel, box, chevron, button } from "./_batch_b.mjs";

const W = 260;
const HEAD = 16;
const GAP = 2;
const BODY = 22;
const TOP = 16;

function header(ctx, i, item, open) {
  const inner = [
    label("title", item.title, [6, 5], { scale: 0.65, color: COLOR.white }),
    { chevron: chevron(open ? "up" : "down", [W - 13, open ? 7 : 5], COLOR.white, 4) },
  ];
  if (item.disabled) return { header: panel([W, HEAD], [0, 0], [{ face: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) }, ...inner], { alpha: 0.5 }) };
  const border = open ? COLOR.white : COLOR.boxBorder;
  return slotButton("header", ctx.slot(page.slots.header + i), [0, 0], [W, HEAD], {
    faces: [
      { default: box(FULL, [0, 0], COLOR.outline, border) },
      { hover: box(FULL, [0, 0], COLOR.outline, open ? COLOR.white : TONE.hoverLight) },
      { pressed: box(FULL, [0, 0], COLOR.outline, border) },
    ],
    controls: inner,
  });
}

function body(item) {
  return panel([W, BODY], [0, HEAD], [
    { edge: rect(COLOR.boxBorder, [W, BODY], [0, 0], { layer: 1 }) },
    { fill: rect(COLOR.panel, [W - 2, BODY - 1], [1, 0], { layer: 2 }) },
    label("text", item.text, [6, 8], { scale: 0.6, color: COLOR.white }),
  ]);
}

function item(ctx, i, entry) {
  const cells = [];
  for (let pos = 0; pos <= i; pos++) {
    for (const open of entry.disabled ? [false] : [false, true]) {
      const key = `p${pos}${open ? "o" : "c"}`;
      cells.push(whenSlot(`item${i}_${key}`, ctx.slot(page.slots.item + i), [W, HEAD + BODY], [0, TOP + i * (HEAD + GAP) + pos * BODY], key,
        panel([W, HEAD + BODY], [0, 0], [header(ctx, i, entry, open), ...(open ? [{ body: body(entry) }] : [])])));
    }
  }
  return cells;
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a header. The server opens it and closes the others.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...page.items.flatMap((entry, i) => item(ctx, i, entry)),
      button("multiple", ctx.slot(page.slots.multiple), [W + 16, TOP], [110, 16],
        slotLabel("text", ctx.slot(page.slots.multipleText), [0, 4], [110, 9], { color: COLOR.darkText, align: "center", scale: 0.7 })),
      label("multiple_caption", "On: many items open", [W + 16, TOP + 22], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
