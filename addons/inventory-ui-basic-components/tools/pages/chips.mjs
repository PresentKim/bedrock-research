import { page } from "../../bp/scripts/pages/chips.js";
import { COLOR, rect, label, slotLabel, slotButton } from "../lib.mjs";
import { TONE, box, darkFaces, textBody, button } from "./_batch_b.mjs";
import { gate, cross } from "./_batch_f.mjs";

const CHIP = [66, 16];
const PITCH = [70, 20];
const COLUMNS = 4;
const ACTIVE_Y = 24;
const SUGGEST_Y = 80;
const X_SIZE = [15, 16];
const SIDE = 290;

const cellAt = (top, p) => [(p % COLUMNS) * PITCH[0], top + Math.floor(p / COLUMNS) * PITCH[1]];

function activeChip(ctx, i, chip) {
  return [
    { back: box(CHIP, [0, 0], COLOR.green, [0, 0, 0], { layer: 1 }) },
    { text: textBody(chip.label, [5, 5], { scale: 0.6, color: COLOR.white, layer: 6 }) },
    { x_back: rect(TONE.primaryHover, [X_SIZE[0] - 1, CHIP[1] - 2], [CHIP[0] - X_SIZE[0], 1], { layer: 2 }) },
    slotButton("remove", ctx.slot(page.slots.remove + i), [CHIP[0] - X_SIZE[0], 0], X_SIZE, {
      controls: [cross("x", [5, 5], COLOR.white)],
    }),
  ];
}

function suggestionChip(ctx, i, chip) {
  return [
    slotButton("add", ctx.slot(page.slots.add + i), [0, 0], CHIP, {
      faces: darkFaces(COLOR.boxBorder, TONE.hoverLight),
      controls: [{ text: textBody(`+ ${chip.label}`, [5, 5], { scale: 0.6, color: COLOR.text }) }],
    }),
  ];
}

function chipCells(ctx, i, chip) {
  const slot = ctx.slot(page.slots.chip + i);
  const cells = [];
  for (let p = 0; p <= i; p++) {
    cells.push(gate(`chip${i}_a${p}`, slot, `a${p}`, CHIP, cellAt(ACTIVE_Y, p), activeChip(ctx, i, chip)));
    cells.push(gate(`chip${i}_s${p}`, slot, `s${p}`, CHIP, cellAt(SUGGEST_Y, p), suggestionChip(ctx, i, chip)));
  }
  return cells;
}

export const ui = {
  page,
  build(ctx) {
    const caption = (name, text, y) => label(name, text, [0, y], { color: COLOR.dimText, scale: 0.5 });
    const empty = (name, slot, y, text) => gate(name, ctx.slot(slot), "none", [280, 16], [0, y], [{ text: textBody(text, [2, 4], { scale: 0.6, color: COLOR.dimText }) }]);
    return [
      label("intro", "Tap x to remove a chip. Tap a suggestion to add it back.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      caption("active_caption", "Active filters", 14),
      caption("suggest_caption", "Suggestions", SUGGEST_Y - 10),
      ...page.chips.flatMap((chip, i) => chipCells(ctx, i, chip)),
      empty("active_empty", page.slots.activeEmpty, ACTIVE_Y, "No filters. Tap a suggestion to add one."),
      empty("suggest_empty", page.slots.suggestEmpty, SUGGEST_Y, "All filters are active."),
      button("reset", ctx.slot(page.slots.reset), [0, 130], [60, 18], "Reset"),
      slotLabel("summary", ctx.slot(page.slots.summary), [SIDE, 24], [104, 10], { color: COLOR.white, scale: 0.75 }),
      slotLabel("last", ctx.slot(page.slots.last), [SIDE, 38], [104, 20], { color: COLOR.text, scale: 0.55 }),
    ];
  },
};
