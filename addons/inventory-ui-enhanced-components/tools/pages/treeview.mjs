import { page } from "../../bp/scripts/pages/treeview.js";
import { COLOR, label, slotLabel, slotButton } from "../lib.mjs";
import { gate, rowFaces, selectedRow, darkCell, raised, triangle, TEXT_LAYER } from "./_batch_g.mjs";

const W = 230;
const ROW = 12;
const INDENT = 12;
const TOP = 12;
const INNER = W - 2;
const SIDE_X = W + 12;

const marks = {
  c: () => triangle("tri", "right", [4, 2]),
  o: () => triangle("tri", "down", [2, 4]),
};

function levelControls(ctx, r, l) {
  const x = l * INDENT;
  return [
    ...(page.folderLevels.includes(l) ? [slotButton("toggle", ctx.slot(page.toggleSlot(r, l)), [x, 0], [INDENT, ROW], { faces: rowFaces() })] : []),
    slotButton("select", ctx.slot(page.selectSlot(r, l)), [x + INDENT, 0], [INNER - x - INDENT, ROW], { faces: rowFaces() }),
  ];
}

function row(ctx, r) {
  const y = TOP + 1 + r * ROW;
  const levels = Array.from({ length: page.levels }, (_, l) => l);
  return [
    gate(`row${r}_selected`, ctx.slot(page.slots.selected), `r${r}`, [INNER, ROW], [1, y], selectedRow([INNER, ROW]), 2),
    ...page.folderLevels.flatMap((l) => Object.entries(marks).map(([kind, draw]) =>
      gate(`row${r}_mark${l}${kind}`, ctx.slot(page.slots.key + r), `L${l}${kind}`, [INDENT, ROW], [1 + l * INDENT, y], draw(), 4))),
    ...levels.map((l) => raised(slotLabel(`row${r}_text${l}`, ctx.slot(page.slots.text + r * page.levels + l),
      [1 + (l + 1) * INDENT + 2, y + 2], [INNER - (l + 1) * INDENT - 4, 9], { color: COLOR.white, keepFormat: true }), TEXT_LAYER)),
    ...levels.map((l) => gate(`row${r}_level${l}`, ctx.slot(page.slots.level + r), `L${l}`, [INNER, ROW], [1, y], levelControls(ctx, r, l), 6)),
  ];
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap an arrow to expand or collapse. Tap a name to select it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      { frame: darkCell([W, page.rows * ROW + 2], [0, TOP], { layer: 1 }) },
      ...Array.from({ length: page.rows }, (_, r) => row(ctx, r)).flat(),
      label("side_caption", "Selection", [SIDE_X, TOP], { color: COLOR.dimText, scale: 0.55 }),
      slotLabel("picked", ctx.slot(page.slots.picked), [SIDE_X, TOP + 12], [150, 9], { color: COLOR.white }),
      slotLabel("path", ctx.slot(page.slots.path), [SIDE_X, TOP + 24], [150, 18], { color: COLOR.text, scale: 0.55 }),
      slotLabel("count", ctx.slot(page.slots.count), [SIDE_X, TOP + 48], [150, 9], { color: COLOR.dimText, scale: 0.55 }),
      label("side_note", "The server lists the visible rows.", [SIDE_X, TOP + 64], { color: COLOR.dimText, scale: 0.5 }),
      label("side_note2", "Each row reads its own slots.", [SIDE_X, TOP + 72], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
