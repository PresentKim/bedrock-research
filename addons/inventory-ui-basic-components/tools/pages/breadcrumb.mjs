import { page } from "../../bp/scripts/pages/breadcrumb.js";
import { COLOR, label, slotLabel, slotButton } from "../lib.mjs";
import { chevron } from "./_batch_b.mjs";
import { gate, rowFaces, linkFaces, darkCell, raised, TEXT_LAYER } from "./_batch_g.mjs";

const CRUMB = [66, 16];
const SEP = 12;
const TOP = 14;
const LIST_Y = 44;
const ROW = [200, 18];
const ROW_PITCH = ROW[1] + 2;

const crumbX = (k) => k * (CRUMB[0] + SEP);

function crumb(ctx, k) {
  const x = crumbX(k);
  const state = ctx.slot(page.slots.crumbState + k);
  const next = k + 1 < page.crumbs ? ctx.slot(page.slots.crumbState + k + 1) : null;
  return [
    raised(slotLabel(`crumb${k}_text`, ctx.slot(page.slots.crumbText + k), [x + 4, TOP + 4], [CRUMB[0] - 6, 9],
      { color: COLOR.white, scale: 0.65, keepFormat: true }), TEXT_LAYER),
    gate(`crumb${k}_link`, state, "link", CRUMB, [x, TOP], [slotButton("press", ctx.slot(page.slots.crumb + k), [0, 0], CRUMB, { faces: linkFaces() })], 4),
    ...(next === null ? [] : ["link", "current"].map((value) =>
      gate(`sep${k}_${value}`, next, value, [SEP, CRUMB[1]], [x + CRUMB[0], TOP], [label("slash", "/", [3, 4], { color: COLOR.dimText, scale: 0.65 })]))),
  ];
}

function child(ctx, i) {
  const y = LIST_Y + i * ROW_PITCH;
  const state = ctx.slot(page.slots.childState + i);
  return [
    ...["dir", "leaf"].map((value) => gate(`child${i}_${value}`, state, value, ROW, [0, y], [
      { cell: darkCell(ROW, [0, 0], { layer: 1 }) },
      ...(value === "dir" ? [{ chev: chevron("right", [ROW[0] - 12, 6], COLOR.white, 4) }] : []),
    ], 2)),
    raised(slotLabel(`child${i}_text`, ctx.slot(page.slots.childText + i), [8, y + 5], [ROW[0] - 24, 9], { color: COLOR.white, scale: 0.65, keepFormat: true }), TEXT_LAYER),
    slotButton(`child${i}_press`, ctx.slot(page.slots.child + i), [0, y], ROW, { faces: rowFaces() }),
  ];
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a gray crumb to go back. Tap an item below to go deeper.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...Array.from({ length: page.crumbs }, (_, k) => crumb(ctx, k)).flat(),
      label("list_caption", "Items", [0, LIST_Y - 10], { color: COLOR.dimText, scale: 0.55 }),
      ...Array.from({ length: page.children }, (_, i) => child(ctx, i)).flat(),
      slotLabel("empty", ctx.slot(page.slots.empty), [0, LIST_Y + 4], [ROW[0] + 120, 9], { color: COLOR.text }),
      slotLabel("info", ctx.slot(page.slots.info), [0, LIST_Y + page.children * ROW_PITCH + 6], [ROW[0], 9], { color: COLOR.dimText, scale: 0.55 }),
    ];
  },
};
