import { page } from "../../bp/scripts/pages/tutorial.js";
import { COLOR, rect, label, slotLabel, whenSlot } from "../lib.mjs";
import { TONE, FULL, panel, box, frame, button, disabledButton, lightWindow, textBody, centerText } from "./_batch_b.mjs";

const AREA = [394, 168];
const CARD = [140, 58];
const ACTION = [50, 16];

const TARGETS = [
  { at: [0, 24], size: [180, 16] },
  { at: [200, 24], size: [70, 16] },
  { at: [0, 112], size: [120, 40] },
];

function cardAt({ at, size }) {
  const x = Math.min(Math.max(0, at[0] + size[0] / 2 - CARD[0] / 2), AREA[0] - CARD[0]);
  const below = at[1] + size[1];
  return [x, below + CARD[1] + 3 <= AREA[1] ? below : at[1] - CARD[1]];
}

function demo() {
  return [
    { search: panel(TARGETS[0].size, TARGETS[0].at, [
      { frame: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) },
      { text: textBody("Search worlds", [6, 5], { scale: 0.65, color: COLOR.grayHalf }) },
    ]) },
    { play: panel(TARGETS[1].size, TARGETS[1].at, [
      { edge: rect(TONE.black, FULL, [0, 0], { layer: 1 }) },
      { face: rect(COLOR.green, ["100% - 2px", "100% - 2px"], [1, 1], { layer: 2 }) },
      centerText("Play", COLOR.white),
    ]) },
    { settings: panel(TARGETS[2].size, TARGETS[2].at, [
      { frame: box(FULL, [0, 0], COLOR.panel, COLOR.boxBorder) },
      { title: textBody("Settings", [6, 6], { scale: 0.65, color: COLOR.white }) },
      { line: textBody("Video, audio, controls", [6, 18], { scale: 0.55, color: COLOR.dimText }) },
    ]) },
  ];
}

function stepOverlay(ctx, i) {
  const step = page.steps[i];
  const target = TARGETS[i];
  const last = i === page.steps.length - 1;
  const nextX = CARD[0] - 6 - ACTION[0];
  const backX = nextX - 4 - ACTION[0];
  const actionY = CARD[1] - 6 - ACTION[1];
  return whenSlot(`step${i}`, ctx.slot(page.slots.step), AREA, [0, 0], `s${i}`, panel(AREA, [0, 0], [
    { dim: rect(TONE.black, AREA, [0, 0], { layer: 1, alpha: 0.5 }) },
    { highlight: frame(target.size, target.at, COLOR.white, { layer: 2 }) },
    {
      card: lightWindow(CARD, cardAt(target), [
        { title: textBody(step.title, [6, 6], { scale: 0.9, color: COLOR.darkText }) },
        { content: textBody(step.content, [6, 19], { scale: 0.65, color: COLOR.darkText }) },
        { counter: textBody(`${i + 1} of ${page.steps.length}`, [6, actionY + 5], { scale: 0.55, color: COLOR.faceShade }) },
        i === 0 ? disabledButton("back", [backX, actionY], ACTION, "Back") : button("back", ctx.slot(page.slots.back), [backX, actionY], ACTION, "Back"),
        button("next", ctx.slot(page.slots.next), [nextX, actionY], ACTION, last ? "Finish" : "Next", "primary"),
      ], { layer: 3 }),
    },
  ]), 10);
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Start the tutorial. Each step highlights one part of this mock screen.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...demo(),
      whenSlot("start", ctx.slot(page.slots.step), [96, 16], [290, 136], "off", panel([96, 16], [0, 0], [
        button("start_press", ctx.slot(page.slots.start), [0, 0], [96, 16], "Start tutorial", "primary"),
      ])),
      slotLabel("result", ctx.slot(page.slots.result), [140, 116], [150, 9], { prefix: "Tutorial: ", color: COLOR.text }),
      ...page.steps.map((_, i) => stepOverlay(ctx, i)),
    ];
  },
};
