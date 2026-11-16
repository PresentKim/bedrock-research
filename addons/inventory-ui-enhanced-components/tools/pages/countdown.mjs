import { page } from "../../bp/scripts/pages/countdown.js";
import { COLOR, rect, label, slotLabel, keyedCell } from "../lib.mjs";
import { panel, button } from "./_batch_b.mjs";
import { BADGE_RED, centerLabel } from "./_batch_h.mjs";

const ZONE = [220, 52];
const ZONE_AT = [(394 - ZONE[0]) / 2, 14];
const CLOCK = [ZONE[0], 30];
const BAR = [200, 4];
const BAR_AT = [(394 - BAR[0]) / 2, ZONE_AT[1] + CLOCK[1] + 4];
const STATE_Y = ZONE_AT[1] + 44;
const BUTTON = [50, 16];
const BUTTON_GAP = 6;
const FLASHES = 3;

function flashChain(ctx) {
  let next;
  for (let k = FLASHES - 1; k >= 0; k--) {
    const fadeIn = ctx.def(`flash_in${k}`, { anim_type: "alpha", easing: "linear", from: 0.15, to: 1, duration: 0.2, ...(next ? { next } : {}) });
    next = ctx.def(`flash_out${k}`, { anim_type: "alpha", easing: "linear", from: 1, to: 0.15, duration: 0.2, next: fadeIn });
  }
  return next;
}

function alarm(ctx) {
  const [w, h] = CLOCK;
  return panel(ZONE, [0, 0], [
    { glow: rect(BADGE_RED, CLOCK, [0, 0], { layer: 1, alpha: 0.25 }) },
    { top: rect(BADGE_RED, [w, 1], [0, 0], { layer: 2 }) },
    { bottom: rect(BADGE_RED, [w, 1], [0, h - 1], { layer: 2 }) },
    { left: rect(BADGE_RED, [1, h], [0, 0], { layer: 2 }) },
    { right: rect(BADGE_RED, [1, h], [w - 1, 0], { layer: 2 }) },
    centerLabel("up", "Time is up", [0, STATE_Y - ZONE_AT[1]], ZONE[0], { color: BADGE_RED, scale: 0.8 }),
  ], { anims: [flashChain(ctx)] });
}

function bar(ctx) {
  const ids = {};
  for (let v = 0; v <= page.barSteps; v++) {
    const width = Math.round((v * BAR[0]) / page.barSteps);
    ids[`w${v}`] = ctx.def(`w${v}`, panel(BAR, [0, 0], width > 0 ? [{ fill: rect(COLOR.green, [width, BAR[1]], [0, 0]) }] : []));
  }
  return [
    { bar_border: rect([0, 0, 0], [BAR[0] + 2, BAR[1] + 2], [BAR_AT[0] - 1, BAR_AT[1] - 1], { layer: 1 }) },
    { bar_track: rect(COLOR.faceShade, BAR, BAR_AT, { layer: 2 }) },
    keyedCell("bar", ctx.slot(page.slots.bar), BAR, BAR_AT, ids, 3),
  ];
}

export const ui = {
  page,
  build(ctx) {
    const alarmIds = { idle: ctx.def("idle", panel(ZONE, [0, 0])), up: ctx.def("alarm", alarm(ctx)) };
    const names = ["Start", "Pause", "Reset", "+30s"];
    const rowX = (394 - names.length * BUTTON[0] - (names.length - 1) * BUTTON_GAP) / 2;
    const variants = ["primary", "secondary", "secondary", "secondary"];
    return [
      label("intro", "The server counts down 20 times a second and writes the time.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      keyedCell("alarm", ctx.slot(page.slots.alarm), ZONE, ZONE_AT, alarmIds, 1),
      slotLabel("time", ctx.slot(page.slots.time), [ZONE_AT[0], ZONE_AT[1] + 5], [CLOCK[0], 20], { color: COLOR.white, align: "center", scale: 2, keepFormat: true }),
      ...bar(ctx),
      slotLabel("state", ctx.slot(page.slots.state), [ZONE_AT[0], STATE_Y], [ZONE[0], 9], { color: COLOR.dimText, align: "center", scale: 0.7 }),
      ...names.map((text, k) => button(`b${k}`, ctx.slot(page.slots.start + k), [rowX + k * (BUTTON[0] + BUTTON_GAP), ZONE_AT[1] + ZONE[1] + 12], BUTTON, text, variants[k])),
    ];
  },
};
