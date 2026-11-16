import { page } from "../../bp/scripts/pages/toast.js";
import { COLOR, rect, label, slotLabel, slotButton, keyedCell } from "../lib.mjs";
import { TONE, panel, button } from "./_batch_b.mjs";

const SIZE = [130, 19];
const X = 394 - 8 - SIZE[0];
const STEP = SIZE[1] + 2 + 4;

function toastBox(extra = {}) {
  return panel(SIZE, [0, 0], [
    { shadow: rect(COLOR.faceShade, SIZE, [0, 2], { layer: 1 }) },
    { edge: rect(TONE.black, SIZE, [0, 0], { layer: 2 }) },
    { face: rect(COLOR.face, [SIZE[0] - 2, SIZE[1] - 2], [1, 1], { layer: 3 }) },
  ], extra);
}

export const ui = {
  page,
  build(ctx) {
    const fadeIn = ctx.def("fade_in", { anim_type: "alpha", easing: "linear", from: 0, to: 1, duration: 0.15 });
    const fresh = ctx.def("fresh", toastBox({ anims: [fadeIn] }));
    const ids = { none: ctx.def("none", panel(SIZE, [0, 0])), still: ctx.def("still", toastBox()) };
    for (const key of page.freshKeys) ids[key] = fresh;
    const spots = Array.from({ length: page.maxVisible }, (_, k) => {
      const at = [X, 8 + k * STEP];
      return [
        keyedCell(`spot${k}`, ctx.slot(page.slots.spot + k), [SIZE[0], SIZE[1] + 2], at, ids, 2),
        slotLabel(`spot${k}_text`, ctx.slot(page.slots.text + k), [at[0] + 6, at[1] + 6], [SIZE[0] - 12, 9], { scale: 0.7, color: COLOR.darkText, layer: 6 }),
        slotButton(`spot${k}_dismiss`, ctx.slot(page.slots.dismiss + k), at, SIZE, { layer: 8 }),
      ];
    }).flat();
    return [
      label("intro", "Toasts stack at the top right.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      label("intro2", "The server removes each one when its time ends.", [0, 8], { color: COLOR.dimText, scale: 0.55 }),
      label("intro3", "Tap a toast to dismiss it.", [0, 16], { color: COLOR.dimText, scale: 0.55 }),
      button("short", ctx.slot(page.slots.short), [0, 30], [90, 16], "Toast 3 s"),
      button("long", ctx.slot(page.slots.long), [0, 50], [90, 16], "Toast 8 s"),
      slotLabel("queue", ctx.slot(page.slots.queue), [0, 72], [200, 9], { color: COLOR.text }),
      label("max_note", "Only the 3 newest show. Older ones wait out their time.", [0, 84], { color: COLOR.dimText, scale: 0.5 }),
      ...spots,
    ];
  },
};
