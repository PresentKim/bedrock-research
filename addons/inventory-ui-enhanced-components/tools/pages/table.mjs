import { page } from "../../bp/scripts/pages/table.js";
import { COLOR, rect, label, slotLabel, slotButton } from "../lib.mjs";
import { TONE, darkFaces, button, disabledButton } from "./_batch_b.mjs";
import { gate, rowFaces, selectedRow, stepArrow, raised, TEXT_LAYER } from "./_batch_g.mjs";

const TOP = 12;
const HEAD = 16;
const ROW = 16;
const BODY_Y = TOP + HEAD + 1;
const WIDTH = page.columns.reduce((sum, column) => sum + column.width, 0);
const PAGER_Y = BODY_Y + page.rows * ROW + 6;
const PAGER = [44, 16];

const columnX = (c) => page.columns.slice(0, c).reduce((sum, column) => sum + column.width, 0);

function header(ctx, column, c) {
  const x = columnX(c);
  const sort = ctx.slot(page.slots.sort);
  return [
    slotButton(`head${c}`, ctx.slot(page.slots.header + c), [x, TOP], [column.width, HEAD], {
      faces: darkFaces(COLOR.boxBorder, TONE.hoverLight),
      controls: [label("title", column.title, [6, 5], { scale: 0.65, color: COLOR.white })],
    }),
    ...["a", "d"].map((dir) => gate(`head${c}_${dir}`, sort, `c${c}${dir}`, [5, 3], [x + column.width - 11, TOP + 7],
      stepArrow("step", dir === "a" ? "up" : "down", [0, 0]), TEXT_LAYER)),
  ];
}

function row(ctx, r) {
  const y = BODY_Y + r * ROW;
  const state = ctx.slot(page.slots.rowState + r);
  const size = [WIDTH, ROW];
  return [
    gate(`row${r}_on`, state, "on", size, [0, y], [
      { fill: rect(COLOR.outline, size, [0, 0], { layer: 1 }) },
      { line: rect(COLOR.boxBorder, [WIDTH, 1], [0, ROW - 1], { layer: 2 }) },
    ], 2),
    gate(`row${r}_sel`, state, "sel", size, [0, y], selectedRow(size), 2),
    ...page.columns.map((column, c) => raised(slotLabel(`row${r}_cell${c}`, ctx.slot(page.slots.cell + r * page.columns.length + c),
      [columnX(c) + 6, y + 5], [column.width - 10, 9], { color: COLOR.white, keepFormat: true }), TEXT_LAYER)),
    slotButton(`row${r}_press`, ctx.slot(page.slots.row + r), [0, y], size, { faces: rowFaces(), layer: 6 }),
  ];
}

function pager(ctx, name, buttonSlot, stateSlot, x, text) {
  return [
    gate(`${name}_on`, ctx.slot(stateSlot), "on", PAGER, [x, PAGER_Y], [button("press", ctx.slot(buttonSlot), [0, 0], PAGER, text)], 4),
    gate(`${name}_off`, ctx.slot(stateSlot), "off", PAGER, [x, PAGER_Y], [disabledButton("look", [0, 0], PAGER, text)], 4),
  ];
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a header to sort, tap it again to flip. Tap a row to select it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...page.columns.flatMap((column, c) => header(ctx, column, c)),
      ...Array.from({ length: page.rows }, (_, r) => row(ctx, r)).flat(),
      ...pager(ctx, "prev", page.slots.prev, page.slots.prevState, 0, "Prev"),
      slotLabel("range", ctx.slot(page.slots.range), [PAGER[0] + 8, PAGER_Y + 4], [130, 9], { color: COLOR.text, align: "center" }),
      ...pager(ctx, "next", page.slots.next, page.slots.nextState, PAGER[0] + 146, "Next"),
      slotLabel("picked", ctx.slot(page.slots.picked), [0, PAGER_Y + 24], [WIDTH, 9], { color: COLOR.text }),
    ];
  },
};
