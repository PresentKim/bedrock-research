import { page } from "../../bp/scripts/pages/linechart.js";
import { COLOR, rect, slotButton, slotLabel, label } from "../lib.mjs";
import { CHART, faceButton, cellTemplate, cellAt, columnFill, chartFrame } from "./_batch_c.mjs";

const AT = [0, 14];
const [, INNER_H] = CHART.inner;
const DOT = 4;

function dotDef(k) {
  const y = Math.min(INNER_H - DOT, Math.max(0, INNER_H - 2 * k - DOT / 2));
  return { type: "panel", size: [DOT, INNER_H], controls: [{ dot: rect(COLOR.face, [DOT, DOT], [0, y]) }] };
}

export const ui = {
  page,
  build(ctx) {
    const fillIds = {};
    const maskIds = {};
    const dotIds = {};
    for (let k = 0; k <= page.levels; k++) {
      fillIds[`f${k}`] = ctx.def(`f${k}`, columnFill(INNER_H, 2 * k, COLOR.green));
      maskIds[`m${k}`] = ctx.def(`m${k}`, columnFill(INNER_H, 2 * k, CHART.bg));
      dotIds[`d${k}`] = ctx.def(`d${k}`, dotDef(k));
    }
    const fill = cellTemplate(ctx, "fill", [page.column, INNER_H], fillIds);
    const mask = cellTemplate(ctx, "mask", [page.column, INNER_H], maskIds);
    const dot = cellTemplate(ctx, "dot", [DOT, INNER_H], dotIds);
    const inner = [AT[0] + 1, AT[1] + 1];
    const pointX = (i) => inner[0] + Math.round(2 + (i / (page.points - 1)) * 144) - DOT / 2;
    const names = ["Prev", "Next", "Random"];
    return [
      label("intro", "The line is drawn as 4 px columns the server sizes in 2 px steps.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      chartFrame("frame", AT),
      ...Array.from({ length: page.columns }, (_, c) => cellAt(`col${c}`, fill, ctx.slot(page.slots.fill + c), [inner[0] + c * page.column, inner[1]], 4)),
      ...Array.from({ length: page.columns }, (_, c) => cellAt(`gap${c}`, mask, ctx.slot(page.slots.mask + c), [inner[0] + c * page.column, inner[1]], 5)),
      ...Array.from({ length: page.points }, (_, i) => cellAt(`dot${i}`, dot, ctx.slot(page.slots.dot + i), [pointX(i), inner[1]], 6)),
      slotLabel("name", ctx.slot(page.slots.name), [160, 16], [200, 9], { color: COLOR.text, scale: 0.7 }),
      slotLabel("values", ctx.slot(page.slots.values), [160, 30], [230, 9], { scale: 0.55 }),
      ...names.map((text, k) => slotButton(`b${k}`, ctx.slot(page.slots.prev + k), [160 + k * 54, 46], [50, 14], faceButton(text))),
      label("note", "Rotated segments are not possible, so the line is stepped.", [160, 68], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
