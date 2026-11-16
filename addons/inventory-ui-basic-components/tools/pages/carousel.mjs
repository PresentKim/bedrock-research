import { page } from "../../bp/scripts/pages/carousel.js";
import { COLOR, rgb, rect, label, slotLabel, slotButton, whenSlot, keyedCell, topLeft } from "../lib.mjs";
import { TONE, FULL, panel, box, chevron, darkFaces, button, textBody } from "./_batch_b.mjs";

const ARROW = 16;
const VIEW = [264, 60];
const STAGE_X = (394 - (ARROW + 4 + VIEW[0] + 4 + ARROW)) / 2;
const STAGE_Y = 20;
const VIEW_X = STAGE_X + ARROW + 4;
const ARROW_Y = STAGE_Y + (VIEW[1] - ARROW) / 2;
const SLIDE = VIEW[0] / page.perPage;
const DOTS_Y = STAGE_Y + VIEW[1] + 4;
const DOT_CELL = 8;
const DOTS_X = (394 - page.pages * DOT_CELL) / 2;

const TINTS = [rgb(60, 133, 39), rgb(54, 110, 160), rgb(179, 49, 45), rgb(196, 150, 40), rgb(120, 70, 160), rgb(40, 140, 130), rgb(150, 90, 50)];

function slides(p) {
  const first = (p - 1) * page.perPage;
  const count = Math.min(page.perPage, page.items - first);
  return Array.from({ length: count }, (_, k) => ({
    [`slide${first + k}`]: panel([SLIDE - 8, VIEW[1]], [k * SLIDE + 4, 0], [
      { frame: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) },
      { art: rect(TINTS[first + k], [SLIDE - 12, 38], [2, 2], { layer: 3 }) },
      { name: textBody(`Slide ${first + k + 1}`, [6, 45], { scale: 0.65, color: COLOR.white, layer: 4 }) },
    ]),
  }));
}

function track(ctx) {
  const ids = {};
  for (let p = 1; p <= page.pages; p++) {
    for (const [dir, from] of [["n", null], ["f", [VIEW[0], 0]], ["b", [-VIEW[0], 0]]]) {
      const anims = from ? [ctx.def(`slide_${dir}`, { anim_type: "offset", easing: "out_cubic", from, to: [0, 0], duration: 0.25 })] : [];
      ids[`p${p}${dir}`] = ctx.def(`page${p}${dir}`, panel(VIEW, [0, 0], slides(p), anims.length ? { anims } : {}));
    }
  }
  return {
    view: {
      type: "panel", size: VIEW, offset: [VIEW_X, STAGE_Y], ...topLeft, clips_children: true, layer: 2,
      controls: [keyedCell("track", ctx.slot(page.slots.track), VIEW, [0, 0], ids, 1)],
    },
  };
}

function arrow(ctx, name, dir, slot, stateSlot, x) {
  const at = [x, ARROW_Y];
  const mark = { chevron: chevron(dir, [6, 4], COLOR.white, 4) };
  return [
    whenSlot(`${name}_on`, ctx.slot(stateSlot), [ARROW, ARROW], at, "on", panel([ARROW, ARROW], [0, 0], [
      slotButton(`${name}_press`, ctx.slot(slot), [0, 0], [ARROW, ARROW], { faces: darkFaces(COLOR.boxBorder, TONE.hoverLight), controls: [mark] }),
    ])),
    whenSlot(`${name}_off`, ctx.slot(stateSlot), [ARROW, ARROW], at, "off", panel([ARROW, ARROW], [0, 0], [
      { face: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) }, mark,
    ], { alpha: 0.4 })),
  ];
}

function dots(ctx) {
  return Array.from({ length: page.pages }, (_, k) => {
    const x = DOTS_X + k * DOT_CELL;
    return [
      { [`dot${k}`]: rect(COLOR.boxBorder, [4, 4], [x + 2, DOTS_Y], { layer: 2 }) },
      whenSlot(`dot${k}_current`, ctx.slot(page.slots.current), [4, 4], [x + 2, DOTS_Y], `p${k + 1}`, rect(COLOR.green, [4, 4], [0, 0])),
      slotButton(`dot${k}_press`, ctx.slot(page.slots.dot + k), [x, DOTS_Y - 3], [DOT_CELL, 10]),
    ];
  }).flat();
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap the arrows or a dot. The server picks the page and the track slides.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...arrow(ctx, "prev", "left", page.slots.prev, page.slots.prevState, STAGE_X),
      track(ctx),
      ...arrow(ctx, "next", "right", page.slots.next, page.slots.nextState, VIEW_X + VIEW[0] + 4),
      ...dots(ctx),
      slotLabel("page_text", ctx.slot(page.slots.pageText), [VIEW_X, DOTS_Y + 10], [VIEW[0], 9], { color: COLOR.text, align: "center" }),
      button("loop", ctx.slot(page.slots.loop), [VIEW_X, DOTS_Y + 26], [80, 16],
        slotLabel("text", ctx.slot(page.slots.loopText), [0, 4], [80, 9], { color: COLOR.darkText, align: "center", scale: 0.7 })),
      label("loop_caption", "Loop on: the arrows wrap around the ends.", [VIEW_X + 88, DOTS_Y + 30], { color: COLOR.dimText, scale: 0.5 }),
    ];
  },
};
