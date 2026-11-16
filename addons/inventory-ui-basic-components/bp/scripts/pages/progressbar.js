const STEPS = [-10, -1, 1, 10];
const HOLD = 20;

const clamp = (v) => Math.min(100, Math.max(0, v));
const autoValue = (state) => Math.min(100, state.auto);

export const page = {
  key: "progressbar",
  title: "ProgressBar",
  steps: STEPS,
  slots: { step: 0, zero: 4, full: 5, play: 6, fill: 10, text: 11, autoFill: 12, autoText: 13, playText: 14 },
  buttons: [0, 1, 2, 3, 4, 5, 6],
  init: () => ({ value: 40, auto: 0, running: true }),
  tick: (state) => {
    if (state.running) state.auto = (state.auto + 1) % (101 + HOLD);
  },
  render: (state) => ({
    10: `w${state.value}`,
    11: `${state.value}%`,
    12: `w${autoValue(state)}`,
    13: `${autoValue(state)}%`,
    14: state.running ? "Pause" : "Play",
  }),
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
