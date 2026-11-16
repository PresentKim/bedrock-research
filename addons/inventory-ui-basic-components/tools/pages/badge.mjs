import { page } from "../../bp/scripts/pages/badge.js";
import { COLOR, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { rounded } from "./_batch_a.mjs";
import { TONE, panel, darkFaces, button } from "./_batch_b.mjs";
import { BADGE_RED, bitmap, bitmapSize, centerLabel } from "./_batch_h.mjs";

const ICON_ROWS = {
  Mail: [
    "###########",
    "##.......##",
    "#.#.....#.#",
    "#..#...#..#",
    "#...#.#...#",
    "#....#....#",
    "#.........#",
    "###########",
  ],
  Friends: [
    ".###...###..",
    "#####.#####.",
    "#####.#####.",
    ".###...###..",
    "............",
    ".###...###..",
    "#####.#####.",
    "#####.#####.",
    "#####.#####.",
  ],
  Alerts: [
    ".....#.....",
    "...#####...",
    "..#######..",
    "..#######..",
    "..#######..",
    ".#########.",
    ".#########.",
    "###########",
    "...........",
    "....###....",
  ],
};
const ICON_SCALE = 2;
const CELL = 36;
const COLUMN = 110;
const FIRST_X = (394 - page.icons.length * COLUMN) / 2;
const CELL_Y = 22;
const SMALL = [22, 14];
const PILL_H = 9;
const PILLS = { one: 9, two: 13, many: 19 };
const BADGE_CENTER = [CELL - 3, 3];
const LABEL_W = 21;

function icon(name) {
  const rows = ICON_ROWS[name];
  const size = bitmapSize(rows, ICON_SCALE);
  const at = [Math.round((CELL - size[0]) / 2), Math.round((CELL - size[1]) / 2)];
  return { icon: panel(size, at, bitmap(rows, { scale: ICON_SCALE, color: COLOR.white }), { layer: 1 }) };
}

function pill(width) {
  const ring = [width + 2, PILL_H + 2];
  return panel(ring, [0, 0], [
    ...rounded("ring", ring, ring[1] / 2, [0, 0], () => COLOR.outline, 1),
    ...rounded("fill", [width, PILL_H], PILL_H / 2, [1, 1], () => BADGE_RED, 2),
  ]);
}

function badge(ctx, k) {
  const sizeSlot = ctx.slot(page.slots.size + k);
  const pills = Object.entries(PILLS).map(([key, width]) => {
    const size = [width + 2, PILL_H + 2];
    const at = [BADGE_CENTER[0] - Math.floor(size[0] / 2), BADGE_CENTER[1] - Math.floor(size[1] / 2)];
    return whenSlot(`pill_${key}`, sizeSlot, size, at, key, pill(width), 2);
  });
  const textAt = [BADGE_CENTER[0] - Math.floor(LABEL_W / 2), BADGE_CENTER[1] - 2];
  return [...pills, slotLabel("count", ctx.slot(page.slots.count + k), textAt, [LABEL_W, 6], { color: COLOR.white, align: "center", scale: 0.55, keepFormat: true, layer: 6 })];
}

function column(ctx, { name }, k) {
  const x = FIRST_X + k * COLUMN;
  const cellX = x + (COLUMN - CELL) / 2;
  const smallX = x + (COLUMN - 2 * SMALL[0] - 4) / 2;
  const smallY = CELL_Y + CELL + 16;
  return [
    slotButton(`open${k}`, ctx.slot(page.slots.open + k), [cellX, CELL_Y], [CELL, CELL], {
      faces: darkFaces(COLOR.boxBorder, TONE.hoverLight),
      controls: [icon(name), ...badge(ctx, k)],
    }),
    centerLabel(`caption${k}`, name, [x, CELL_Y + CELL + 4], COLUMN, { color: COLOR.text }),
    button(`add${k}`, ctx.slot(page.slots.add + k), [smallX, smallY], SMALL, "+1"),
    button(`remove${k}`, ctx.slot(page.slots.remove + k), [smallX + SMALL[0] + 4, smallY], SMALL, "-1"),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const clearY = CELL_Y + CELL + 40;
    return [
      label("intro", "Tap an icon to read it. +1 adds one, -1 clears one. 100 or more shows 99+.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...page.icons.flatMap((item, k) => column(ctx, item, k)),
      button("clear_all", ctx.slot(page.slots.clearAll), [(394 - 70) / 2, clearY], [70, 16], "Clear all", "danger"),
      slotLabel("summary", ctx.slot(page.slots.summary), [0, clearY + 24], [394, 9], { color: COLOR.dimText, align: "center" }),
    ];
  },
};
