import { page } from "../../bp/scripts/pages/barchart.js";
import { COLOR, rect, slotButton, slotLabel, label, keyedCell } from "../lib.mjs";
import { CHART, faceButton, cellTemplate, cellAt, columnFill, chartFrame } from "./_batch_c.mjs";

const AT = [0, 14];
const [INNER_W, INNER_H] = CHART.inner;
const BAND = INNER_W / page.bars;
const BAR_W = Math.round(0.6 * BAND);

function baselineDef(k) {
  const y = Math.min(INNER_H - 1, Math.max(0, INNER_H - 2 * k - 1));
  return { type: "panel", size: CHART.inner, controls: [{ line: rect(CHART.baseline, [INNER_W, 1], [0, y]) }] };
}

export const ui = {
  page,
  build(ctx) {
    const fillIds = {};
    const maskIds = {};
    const baseIds = {};
    for (let k = 0; k <= page.levels; k++) {
      fillIds[`p${k}`] = ctx.def(`p${k}`, columnFill(INNER_H, 2 * k, COLOR.green));
      fillIds[`n${k}`] = ctx.def(`n${k}`, columnFill(INNER_H, 2 * k, CHART.negative));
      maskIds[`m${k}`] = ctx.def(`m${k}`, columnFill(INNER_H, 2 * k, CHART.bg));
      baseIds[`l${k}`] = ctx.def(`l${k}`, baselineDef(k));
    }
    const fill = cellTemplate(ctx, "fill", [BAR_W, INNER_H], fillIds);
    const mask = cellTemplate(ctx, "mask", [BAR_W, INNER_H], maskIds);
    const inner = [AT[0] + 1, AT[1] + 1];
    const barX = (i) => inner[0] + Math.round((i + 0.2) * BAND);
    const names = ["Prev", "Next", "Random", "Negate"];
    return [
      label("intro", "Bar heights come from the server in 2 px steps.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      chartFrame("frame", AT),
      ...Array.from({ length: page.bars }, (_, i) => cellAt(`bar${i}`, fill, ctx.slot(page.slots.fill + i), [barX(i), inner[1]], 4)),
      ...Array.from({ length: page.bars }, (_, i) => cellAt(`mask${i}`, mask, ctx.slot(page.slots.mask + i), [barX(i), inner[1]], 5)),
      keyedCell("baseline", ctx.slot(page.slots.baseline), CHART.inner, inner, baseIds, 6),
      slotLabel("name", ctx.slot(page.slots.name), [160, 16], [200, 9], { color: COLOR.text, scale: 0.7 }),
      slotLabel("values", ctx.slot(page.slots.values), [160, 30], [230, 9], { scale: 0.55 }),
      ...names.map((text, k) => slotButton(`b${k}`, ctx.slot(page.slots.prev + k), [160 + (k % 2) * 54, 46 + Math.floor(k / 2) * 18], [50, 14], faceButton(text))),
      label("legend_pos", "Green: positive", [160, 86], { color: COLOR.green, scale: 0.55 }),
      label("legend_neg", "Red: negative", [240, 86], { color: CHART.negative, scale: 0.55 }),
    ];
  },
};
