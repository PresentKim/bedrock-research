import { page } from "../../bp/scripts/pages/keybinds.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { frame, box, keyButton, gateOn } from "./_batch_d.mjs";

const ROW_Y = 12;
const ROW_PITCH = 18;
const CELL = [60, 16];
const CELL_X = 124;
const LIST_X = 200;
const LIST_COLS = 6;
const LIST_KEY = [30, 16];
const LIST_PITCH = [32, 18];

function row(ctx, [, name], k) {
  const y = ROW_Y + k * ROW_PITCH;
  return [
    label(`action_${k}`, name, [0, y + 4], { color: COLOR.white, scale: 0.6 }),
    box(`cell_${k}`, CELL, [CELL_X, y], COLOR.boxBorder, COLOR.outline),
    whenSlot(`listen_${k}`, ctx.slot(page.slots.listening), CELL, [CELL_X, y], `l${k}`, frame(COLOR.white, CELL), 2),
    slotLabel(`key_${k}`, ctx.slot(page.slots.keyText + k), [CELL_X, y + 4], [CELL[0], 9], { color: COLOR.white, align: "center" }),
    slotLabel(`hint_${k}`, ctx.slot(page.slots.hint + k), [CELL_X, y + 4], [CELL[0], 9], { color: COLOR.grayHalf, align: "center", scale: 0.55 }),
    slotButton(`press_${k}`, ctx.slot(page.keys.action + k), [CELL_X, y], CELL),
  ];
}

function modes(ctx) {
  const y = ROW_Y + page.actions.length * ROW_PITCH + 6;
  const modeSlot = ctx.slot(page.slots.mode);
  return [
    label("mode_caption", "On conflict", [0, y + 4], { color: COLOR.dimText, scale: 0.55 }),
    ...page.modes.map((mode, k) => keyButton(`mode_${mode}`, ctx.slot(page.keys.mode + k), [60 + k * 44, y], [42, 14], mode, {
      scale: 0.55,
      extra: [gateOn("chosen", modeSlot, [42, 14], mode, rect(COLOR.green, [38, 2], [2, 1], { layer: 1 }))],
    })),
  ];
}

function picker(ctx) {
  const rows = Math.ceil(page.keyNames.length / LIST_COLS);
  const size = [LIST_COLS * LIST_PITCH[0], rows * LIST_PITCH[1] + 22];
  return whenSlot("picker", ctx.slot(page.slots.picker), size, [LIST_X, ROW_Y], "open", {
    type: "panel", size,
    controls: [
      ...page.keyNames.map((name, k) => keyButton(`pick_${k}`, ctx.slot(page.keys.list + k),
        [(k % LIST_COLS) * LIST_PITCH[0], Math.floor(k / LIST_COLS) * LIST_PITCH[1]], LIST_KEY, name, { scale: 0.5 })),
      keyButton("cancel", ctx.slot(page.keys.cancel), [0, rows * LIST_PITCH[1] + 4], [60, 16], "Cancel"),
    ],
  });
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a key box, then pick a key. The pick is shown only, game controls stay the same.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...page.actions.flatMap((action, k) => row(ctx, action, k)),
      ...modes(ctx),
      whenSlot("picker_hint", ctx.slot(page.slots.picker), [190, 20], [LIST_X, ROW_Y + 4], "closed",
        { type: "label", localize: false, text: "Tap a key box to rebind it.", color: COLOR.dimText, font_scale_factor: 0.55, size: [190, 20] }),
      picker(ctx),
    ];
  },
};
