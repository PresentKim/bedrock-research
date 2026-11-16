const TICKS_PER_SECOND = 20;
const START_SECONDS = 60;
const ADD_SECONDS = 30;
const MAX_SECONDS = 59 * 60 + 59;
const BAR_STEPS = 100;

const seconds = (state) => Math.ceil(state.left / TICKS_PER_SECOND);
const pad = (n) => String(n).padStart(2, "0");

function reset(state) {
  state.total = START_SECONDS * TICKS_PER_SECOND;
  state.left = state.total;
  state.running = false;
}

function label(state) {
  if (state.left === 0) return "";
  if (state.running) return "Running";
  return state.left === state.total ? "Ready" : "Paused";
}

export const page = {
  key: "countdown",
  title: "Countdown",
  barSteps: BAR_STEPS,
  slots: { start: 0, pause: 1, reset: 2, add: 3, time: 10, bar: 11, alarm: 12, state: 13 },
  buttons: [0, 1, 2, 3],
  init: () => {
    const state = {};
    reset(state);
    return state;
  },
  tick: (state) => {
    if (!state.running) return undefined;
    state.left--;
    if (state.left > 0) return undefined;
    state.running = false;
    return "countdown reached zero";
  },
  render: (state) => {
    const s = seconds(state);
    return {
      10: `§r${pad(Math.floor(s / 60))}:${pad(s % 60)}`,
      11: `w${Math.ceil((state.left / state.total) * BAR_STEPS)}`,
      12: state.left === 0 ? "up" : "idle",
      13: label(state),
    };
  },
  press: (state, slot) => {
    if (slot === 0) {
      if (state.left === 0) return "countdown is at zero, add time or reset";
      state.running = true;
      return "countdown started";
    }
    if (slot === 1) {
      state.running = false;
      return "countdown paused";
    }
    if (slot === 2) {
      reset(state);
      return "countdown reset";
    }
    state.left = Math.min(MAX_SECONDS * TICKS_PER_SECOND, state.left + ADD_SECONDS * TICKS_PER_SECOND);
    state.total = Math.max(state.total, state.left);
    return `countdown ${seconds(state)} s left`;
  },
};
