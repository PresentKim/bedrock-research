const STEPS = [
  { title: "Search", content: "Type a world name here." },
  { title: "Play", content: "Starts the selected world." },
  { title: "Settings", content: "Change video and audio here." },
];

export const page = {
  key: "tutorial",
  title: "Tutorial",
  steps: STEPS,
  slots: { start: 0, back: 1, next: 2, step: 10, result: 11 },
  buttons: [0, 1, 2],
  init: () => ({ step: -1, result: "Not started" }),
  render: (state) => ({ 10: state.step < 0 ? "off" : `s${state.step}`, 11: state.result }),
  press: (state, slot) => {
    if (slot === 0) {
      state.step = 0;
      state.result = "Running";
      return "tutorial started";
    }
    if (state.step < 0) return "";
    if (slot === 1) {
      state.step = Math.max(0, state.step - 1);
      return `tutorial step ${state.step + 1}`;
    }
    if (state.step === STEPS.length - 1) {
      state.step = -1;
      state.result = "Finished";
      return "tutorial finished";
    }
    state.step++;
    return `tutorial step ${state.step + 1}`;
  },
};
