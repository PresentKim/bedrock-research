import { page } from "../../bp/scripts/pages/modal.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { TONE, panel, button, lightWindow, textBody } from "./_batch_b.mjs";

const AREA = [394, 168];
const SIZE = [170, 80];
const AT = [(AREA[0] - SIZE[0]) / 2, (AREA[1] - SIZE[1]) / 2];
const ACTION = [50, 16];

function backdrop(ctx) {
  const slot = ctx.slot(page.slots.backdrop);
  const [x, y] = AT;
  const [w, h] = SIZE;
  return [
    slotButton("backdrop_top", slot, [0, 0], [AREA[0], y], { layer: 2 }),
    slotButton("backdrop_bottom", slot, [0, y + h], [AREA[0], AREA[1] - y - h], { layer: 2 }),
    slotButton("backdrop_left", slot, [0, y], [x, h], { layer: 2 }),
    slotButton("backdrop_right", slot, [x + w, y], [AREA[0] - x - w, h], { layer: 2 }),
  ];
}

function dialog(ctx) {
  const actionY = SIZE[1] - 8 - ACTION[1];
  const confirmX = SIZE[0] - 8 - ACTION[0];
  return lightWindow(SIZE, AT, [
    { title: textBody("Delete world?", [8, 8], { scale: 0.9, color: COLOR.darkText }) },
    { line1: textBody("This cannot be undone. The world", [8, 23], { scale: 0.65, color: COLOR.darkText }) },
    { line2: textBody("and its backups are removed.", [8, 31], { scale: 0.65, color: COLOR.darkText }) },
    button("cancel", ctx.slot(page.slots.cancel), [confirmX - 4 - ACTION[0], actionY], ACTION, "Cancel", "secondary"),
    button("confirm", ctx.slot(page.slots.confirm), [confirmX, actionY], ACTION, "Delete", "danger"),
  ], { layer: 3 });
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Open the modal. Tap outside the window or a button to close it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      button("open", ctx.slot(page.slots.open), [0, 16], [80, 16], "Open modal", "primary"),
      slotLabel("result", ctx.slot(page.slots.result), [90, 20], [200, 9], { prefix: "Result: ", color: COLOR.text }),
      label("esc_note", "Esc closes the whole chest screen, so it cannot close only the modal.", [0, 40], { color: COLOR.dimText, scale: 0.5 }),
      whenSlot("overlay", ctx.slot(page.slots.state), AREA, [0, 0], "open", panel(AREA, [0, 0], [
        { dim: rect(TONE.black, AREA, [0, 0], { layer: 1, alpha: 0.5 }) },
        ...backdrop(ctx),
        { dialog: dialog(ctx) },
      ]), 10),
    ];
  },
};
