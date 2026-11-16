import { COLOR, rgb, rect, topLeft } from "../lib.mjs";
import { panel } from "./_batch_b.mjs";

export const GOLD = rgb(255, 196, 46);
export const BADGE_RED = rgb(218, 38, 38);

function rowRuns(row, scale, split) {
  const runs = [];
  let x = 0;
  while (x < row.length) {
    if (row[x] !== "#") {
      x++;
      continue;
    }
    let end = x;
    while (end < row.length && row[end] === "#") end++;
    const from = x * scale;
    const to = end * scale;
    if (split && from < split.at && to > split.at) runs.push({ x: from, w: split.at - from, left: true }, { x: split.at, w: to - split.at, left: false });
    else runs.push({ x: from, w: to - from, left: split ? to <= split.at : true });
    x = end;
  }
  return runs;
}

export function bitmap(rows, { scale = 1, color = COLOR.white, split, layer = 1 } = {}) {
  const done = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (const run of rowRuns(row, scale, split)) {
      const key = `${run.x}:${run.w}:${run.left}`;
      const merged = open.get(key) ?? { ...run, y: y * scale, h: 0 };
      merged.h += scale;
      next.set(key, merged);
      open.delete(key);
    }
    done.push(...open.values());
    open = next;
  });
  done.push(...open.values());
  return done.map((r, k) => ({ [`px${k}`]: rect(r.left ? color : split.color, [r.w, r.h], [r.x, r.y], { layer }) }));
}

export const bitmapSize = (rows, scale = 1) => [rows[0].length * scale, rows.length * scale];

export const STAR_ROWS = [
  ".....#.....",
  "....###....",
  "....###....",
  "###########",
  ".#########.",
  "..#######..",
  "...#####...",
  "..#######..",
  "..###.###..",
  ".###...###.",
  ".#.......#.",
];
export const STAR_SCALE = 2;
export const STAR_SIZE = bitmapSize(STAR_ROWS, STAR_SCALE);

export function starBody(mode, offset = [0, 0], layer = 1) {
  const color = mode === "empty" ? COLOR.faceShade : GOLD;
  const split = mode === "half" ? { at: STAR_SIZE[0] / 2, color: COLOR.faceShade } : undefined;
  return panel(STAR_SIZE, offset, bitmap(STAR_ROWS, { scale: STAR_SCALE, color, split }), { layer });
}

export function centerLabel(name, text, offset, width, { scale = 0.6, color = COLOR.text, layer = 3 } = {}) {
  return {
    [name]: {
      type: "label", localize: false, text, color, ...topLeft, offset, size: [width, Math.ceil(10 * scale)],
      font_scale_factor: scale, text_alignment: "center", layer,
    },
  };
}
