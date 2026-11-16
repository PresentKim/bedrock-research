import { page } from "../../bp/scripts/pages/radialmenu.js";
import { COLOR, rect, label, slotLabel, slotButton } from "../lib.mjs";
import { frame, keyText } from "./_batch_d.mjs";

const DISC = 120;
const RADIUS = 43;
const ITEM = [30, 15];
const ORIGIN = [10, 14];
const STRIP = 2;

function disc() {
  const half = DISC / 2;
  return Array.from({ length: DISC / STRIP }, (_, k) => {
    const dy = k * STRIP + STRIP / 2 - half;
    const width = 2 * Math.round(Math.sqrt(half * half - dy * dy));
    return { [`disc_${k}`]: rect(COLOR.outline, [width, STRIP], [ORIGIN[0] + half - width / 2, ORIGIN[1] + k * STRIP], { layer: 1 }) };
  });
}

function itemFaces(text) {
  const plain = { type: "panel", size: ["100%", "100%"], controls: [{ border: frame(COLOR.outline, ITEM, 1) }, { text: keyText(text, { scale: 0.55, color: COLOR.white }) }] };
  const lit = rect(COLOR.face, ["100%", "100%"], [0, 0], { controls: [{ text: keyText(text, { scale: 0.55 }) }] });
  return [{ default: plain }, { hover: lit }, { pressed: lit }];
}

function items(ctx) {
  const half = DISC / 2;
  return page.items.map((text, k) => {
    const angle = (k / page.items.length) * 2 * Math.PI;
    const x = Math.round(ORIGIN[0] + half + RADIUS * Math.sin(angle) - ITEM[0] / 2);
    const y = Math.round(ORIGIN[1] + half - RADIUS * Math.cos(angle) - ITEM[1] / 2);
    return slotButton(`item_${k}`, ctx.slot(page.slots.item + k), [x, y], ITEM, { faces: itemFaces(text) });
  });
}

export const ui = {
  page,
  build(ctx) {
    const center = [ORIGIN[0] + DISC / 2 - 20, ORIGIN[1] + DISC / 2 - 4];
    return [
      label("intro", "Tap an item on the ring. PC mouse hover lights it, phones pick on tap.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...disc(),
      ...items(ctx),
      slotLabel("center", ctx.slot(page.slots.chosen), center, [40, 9], { color: COLOR.white, align: "center", scale: 0.55 }),
      slotLabel("chosen", ctx.slot(page.slots.chosenText), [ORIGIN[0] + DISC + 20, ORIGIN[1] + 50], [200, 9], { color: COLOR.text }),
    ];
  },
};
