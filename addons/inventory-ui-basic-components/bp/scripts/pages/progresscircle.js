const STEPS = [-10, -5, 5, 10];
const SEGMENTS = 20;
const SEGMENT_BASE = 20;

const clamp = (v) => Math.min(100, Math.max(0, v));

export const page = {
  key: "progresscircle",
  title: "ProgressCircle",
  steps: STEPS,
  segments: SEGMENTS,
  slots: { step: 0, zero: 4, full: 5, play: 6, text: 10, playText: 11, segment: SEGMENT_BASE },
  buttons: [0, 1, 2, 3, 4, 5, 6],
  init: () => ({ value: 35, running: false, ticks: 0 }),
  tick: (state) => {
    if (!state.running) return;
    state.ticks = (state.ticks + 1) % 2;
    if (state.ticks === 0) state.value = (state.value + 1) % 101;
  },
  render: (state) => {
    const lit = Math.floor(state.value / (100 / SEGMENTS));
    const names = { 10: `§0${state.value}%`, 11: state.running ? "Pause" : "Play" };
    for (let k = 0; k < SEGMENTS; k++) names[SEGMENT_BASE + k] = k < lit ? "on" : "off";
    return names;
  },
  press: (state, slot) => {
    if (slot < STEPS.length) state.value = clamp(state.value + STEPS[slot]);
    else if (slot === 4) state.value = 0;
    else if (slot === 5) state.value = 100;
    else {
      state.running = !state.running;
      return `auto fill ${state.running ? "running" : "paused"}`;
    }
    return `progress ${state.value}%`;
  },
};
