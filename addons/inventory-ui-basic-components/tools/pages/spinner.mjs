import { page } from "../../bp/scripts/pages/spinner.js";
import { NS, COLOR, rect, label, slotLabel, whenSlot } from "../lib.mjs";
import { panel, button } from "./_batch_b.mjs";
import { centerLabel } from "./_batch_h.mjs";

const AREA = [394, 44];
const AREA_Y = 30;
const COLUMN = 130;
const DOTS = 8;
const DOT = 4;
const DOT_STEP = 0.1;
const RADIUS = 13;
const RING_CENTER = [COLUMN / 2, 22];
const PULSE = 6;
const PULSE_GAP = 6;
const PULSE_STEP = 0.15;
const TRACK = [110, 4];
const SEGMENT = 30;

const dotAt = (k) => {
  const angle = (k / DOTS) * 2 * Math.PI;
  return [Math.round(RING_CENTER[0] + RADIUS * Math.sin(angle) - DOT / 2), Math.round(RING_CENTER[1] - RADIUS * Math.cos(angle) - DOT / 2)];
};
const pulseAt = (k) => [COLUMN + (COLUMN - (3 * PULSE + 2 * PULSE_GAP)) / 2 + k * (PULSE + PULSE_GAP), 19];
const TRACK_AT = [2 * COLUMN + (COLUMN - TRACK[0]) / 2, 20];

const ref = (ctx, name) => `@${NS}.${ctx.key}_${name}`;

function defs(ctx) {
  const glow = ref(ctx, "dot_glow");
  ctx.def("dot_glow", { anim_type: "alpha", easing: "linear", from: 1, to: 0, duration: DOT_STEP * 4, next: ctx.def("dot_rest", { anim_type: "alpha", easing: "linear", from: 0, to: 0, duration: DOT_STEP * (DOTS - 4), next: glow }) });
  const dotStart = (k) => (k === 0 ? glow : ctx.def(`dot_wait${k}`, { anim_type: "alpha", easing: "linear", from: 0, to: 0, duration: DOT_STEP * k, next: glow }));
  const up = ref(ctx, "pulse_up");
  const rest = ctx.def("pulse_rest", { anim_type: "alpha", easing: "linear", from: 0.25, to: 0.25, duration: 0.3, next: up });
  const down = ctx.def("pulse_down", { anim_type: "alpha", easing: "in_sine", from: 1, to: 0.25, duration: 0.3, next: rest });
  ctx.def("pulse_up", { anim_type: "alpha", easing: "out_sine", from: 0.25, to: 1, duration: 0.3, next: down });
  const pulseStart = (k) => (k === 0 ? up : ctx.def(`pulse_wait${k}`, { anim_type: "alpha", easing: "linear", from: 0.25, to: 0.25, duration: PULSE_STEP * k, next: up }));
  const travel = TRACK[0] - SEGMENT;
  const back = ref(ctx, "bar_back");
  const forth = ctx.def("bar_forth", { anim_type: "offset", easing: "out_sine", from: [0, 0], to: [travel, 0], duration: 0.7, next: back });
  ctx.def("bar_back", { anim_type: "offset", easing: "out_sine", from: [travel, 0], to: [0, 0], duration: 0.7, next: forth });
  return { dotStart, pulseStart, forth };
}

function idle() {
  return [
    ...Array.from({ length: DOTS }, (_, k) => ({ [`dot${k}`]: rect(COLOR.faceShade, [DOT, DOT], dotAt(k), { layer: 1 }) })),
    ...Array.from({ length: 3 }, (_, k) => ({ [`pulse${k}`]: rect(COLOR.faceShade, [PULSE, PULSE], pulseAt(k), { layer: 1 }) })),
    { track_border: rect([0, 0, 0], [TRACK[0] + 2, TRACK[1] + 2], [TRACK_AT[0] - 1, TRACK_AT[1] - 1], { layer: 1 }) },
    { track: rect(COLOR.faceShade, TRACK, TRACK_AT, { layer: 2 }) },
  ];
}

function moving({ dotStart, pulseStart, forth }) {
  return panel(AREA, [0, 0], [
    ...Array.from({ length: DOTS }, (_, k) => ({ [`glow${k}`]: rect(COLOR.white, [DOT, DOT], dotAt(k), { layer: 2, alpha: 0, anims: [dotStart(k)] }) })),
    ...Array.from({ length: 3 }, (_, k) => ({ [`beat${k}`]: rect(COLOR.white, [PULSE, PULSE], pulseAt(k), { layer: 2, alpha: 0.25, anims: [pulseStart(k)] }) })),
    {
      track_clip: panel(TRACK, TRACK_AT, [{ segment: rect(COLOR.green, [SEGMENT, TRACK[1]], [0, 0], { anims: [forth] }) }], { clips_children: true, layer: 3 }),
    },
  ]);
}

export const ui = {
  page,
  build(ctx) {
    const anims = defs(ctx);
    return [
      label("intro", "Client animations only. The server just shows or hides them.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...["Dot spinner", "Pulse", "Indeterminate bar"].map((text, k) => centerLabel(`caption${k}`, text, [k * COLUMN, 16], COLUMN, { color: COLOR.text })),
      { idle: panel(AREA, [0, AREA_Y], idle(), { layer: 2 }) },
      whenSlot("running", ctx.slot(page.slots.running), AREA, [0, AREA_Y], "on", moving(anims)),
      whenSlot("stopped", ctx.slot(page.slots.running), [394, 9], [0, AREA_Y + AREA[1] + 4], "off", centerLabel("text", "Stopped", [0, 0], 394, { color: COLOR.dimText }).text),
      button("toggle", ctx.slot(page.slots.toggle), [(394 - 60) / 2, AREA_Y + AREA[1] + 18], [60, 16],
        slotLabel("text", ctx.slot(page.slots.toggleText), [0, 4], [60, 9], { color: COLOR.darkText, align: "center", scale: 0.7 })),
    ];
  },
};
