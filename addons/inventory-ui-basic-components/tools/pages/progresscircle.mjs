import { page } from "../../bp/scripts/pages/progresscircle.js";
import { COLOR, rect, slotButton, slotLabel, label, whenSlot } from "../lib.mjs";
import { faceButton } from "./_batch_c.mjs";

const BUTTON = [30, 14];

function rasterize(size, classOf) {
  const done = new Map();
  let open = new Map();
  for (let y = 0; y < size; y++) {
    const next = new Map();
    let x = 0;
    while (x < size) {
      const c = classOf(x, y);
      let end = x + 1;
      while (end < size && classOf(end, y) === c) end++;
      if (c !== null) {
        const key = `${c}:${x}:${end}`;
        const run = open.get(key) ?? { c, x, y, w: end - x, h: 0 };
        run.h++;
        next.set(key, run);
        open.delete(key);
      }
      x = end;
    }
    for (const run of open.values()) (done.get(run.c) ?? done.set(run.c, []).get(run.c)).push(run);
    open = next;
  }
  for (const run of open.values()) (done.get(run.c) ?? done.set(run.c, []).get(run.c)).push(run);
  return done;
}

const SIZE = 30;
const CENTER = SIZE / 2;
const distance = (x, y) => Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER);
const DISC = rasterize(SIZE, (x, y) => (distance(x, y) <= 15 ? "disc" : null)).get("disc");
const HOLE = rasterize(SIZE, (x, y) => (distance(x, y) <= 12 ? "hole" : null)).get("hole");
const SEGMENTS = rasterize(SIZE, (x, y) => {
  const d = distance(x, y);
  if (d > 15 || d <= 12) return null;
  const angle = (Math.atan2(x + 0.5 - CENTER, CENTER - y - 0.5) + 2 * Math.PI) % (2 * Math.PI);
  return Math.min(page.segments - 1, Math.floor((angle / (2 * Math.PI)) * page.segments));
});

const CIRCLES = [{ name: "small", scale: 1, at: [0, 30] }, { name: "large", scale: 2, at: [44, 14] }];
const AREA_AT = [0, 14];
const AREA = [104, 60];

const rects = (prefix, runs, color, scale, [dx, dy] = [0, 0]) => runs.map((r, k) => ({ [`${prefix}${k}`]: rect(color, [r.w * scale, r.h * scale], [dx + r.x * scale, dy + r.y * scale]) }));

function segment(ctx, k) {
  return whenSlot(`seg${k}`, ctx.slot(page.slots.segment + k), AREA, AREA_AT, "on", {
    type: "panel", size: AREA,
    controls: CIRCLES.flatMap(({ name, scale, at }) => rects(`${name}_s`, SEGMENTS.get(k), COLOR.green, scale, [at[0] - AREA_AT[0], at[1] - AREA_AT[1]])),
  }, 2);
}

function progressCircle(ctx, { name, scale, at: [x, y] }) {
  const box = [SIZE * scale, SIZE * scale];
  const holeSize = 24 * scale;
  const textHeight = Math.round(10 * scale * 0.55);
  return [
    { [`${name}_base`]: { type: "panel", size: box, offset: [x, y], anchor_from: "top_left", anchor_to: "top_left", layer: 1, controls: rects("d", DISC, COLOR.faceShade, scale) } },
    { [`${name}_hole`]: { type: "panel", size: box, offset: [x, y], anchor_from: "top_left", anchor_to: "top_left", layer: 3, controls: rects("h", HOLE, COLOR.face, scale) } },
    slotLabel(`${name}_text`, ctx.slot(page.slots.text), [x + 3 * scale, y + 3 * scale + Math.round((holeSize - textHeight) / 2)], [holeSize, textHeight + 2], {
      color: COLOR.darkText, align: "center", scale: 0.55 * scale,
    }),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const names = [...page.steps.map((s) => (s > 0 ? `+${s}` : `${s}`)), "0%", "100%"];
    return [
      label("intro", "Twenty ring pieces light up to the value the server writes.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...CIRCLES.flatMap((circle) => progressCircle(ctx, circle)),
      ...Array.from({ length: page.segments }, (_, k) => segment(ctx, k)),
      label("small_caption", "30 px", [4, 64], { color: COLOR.dimText, scale: 0.5 }),
      label("large_caption", "60 px", [64, 78], { color: COLOR.dimText, scale: 0.5 }),
      ...names.map((text, k) => slotButton(`set${k}`, ctx.slot(page.slots.step + k), [k * (BUTTON[0] + 4), 92], BUTTON, faceButton(text))),
      slotButton("play", ctx.slot(page.slots.play), [0, 112], [40, 14], {
        ...faceButton(""),
        controls: [slotLabel("play_text", ctx.slot(page.slots.playText), [0, 3], [40, 9], { color: COLOR.darkText, align: "center" })],
      }),
      label("play_caption", "Auto fill: the server adds 1% every two ticks.", [46, 115], { color: COLOR.dimText, scale: 0.55 }),
    ];
  },
};
