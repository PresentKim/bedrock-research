import { page } from "../../bp/scripts/pages/tooltip.js";
import { COLOR, label, slotButton, whenSlot } from "../lib.mjs";
import { FULL, panel, button, bubble, centerText, box, TONE } from "./_batch_b.mjs";

const AREA = [394, 168];
const TARGET = [56, 16];
const BUBBLE = [96, 15];

const TARGETS = {
  right: { at: [20, 44], text: "Opens on the right" },
  left: { at: [318, 44], text: "Opens on the left" },
  top: { at: [90, 104], text: "Opens above" },
  bottom: { at: [248, 104], text: "Opens below" },
};

function bubbleAt(side, [x, y]) {
  const midX = x + TARGET[0] / 2 - BUBBLE[0] / 2;
  const midY = y + (TARGET[1] - BUBBLE[1]) / 2;
  if (side === "right") return [x + TARGET[0], Math.floor(midY)];
  if (side === "left") return [x - BUBBLE[0], Math.floor(midY)];
  if (side === "top") return [midX, y - BUBBLE[1]];
  return [midX, y + TARGET[1]];
}

function hoverTarget(ctx) {
  const size = [90, 16];
  const tip = bubble([110, 15], [size[0], 0], "Shown by hover alone", { layer: 20 });
  return slotButton("hover_target", ctx.slot(page.slots.hover), [20, 146], size, {
    faces: [
      { default: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) },
      { hover: panel(FULL, [0, 0], [{ frame: box(FULL, [0, 0], COLOR.outline, TONE.hoverLight) }, { tip }]) },
      { pressed: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) },
    ],
    controls: [centerText("Hover me (PC)", COLOR.white, 0.65, [0, 0])],
    layer: 8,
  });
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a button to open its tooltip. Tap outside to close it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      label("intro2", "Mobile has no hover, so the server opens and closes it.", [0, 8], { color: COLOR.dimText, scale: 0.55 }),
      whenSlot("outside", ctx.slot(page.slots.any), AREA, [0, 0], "open", { type: "panel", size: AREA, controls: [slotButton("outside_press", ctx.slot(page.slots.outside), [0, 0], AREA)] }, 6),
      ...page.sides.map((side, k) => button(`target_${side}`, ctx.slot(page.slots.target + k), TARGETS[side].at, TARGET,
        side[0].toUpperCase() + side.slice(1), "secondary", { layer: 8 })),
      ...page.sides.map((side) => whenSlot(`bubble_${side}`, ctx.slot(page.slots.open), BUBBLE, bubbleAt(side, TARGETS[side].at), side,
        bubble(BUBBLE, [0, 0], TARGETS[side].text), 12)),
      label("hover_caption", "PC only: the bubble lives in the hover state.", [20, 136], { color: COLOR.dimText, scale: 0.5 }),
      hoverTarget(ctx),
    ];
  },
};
