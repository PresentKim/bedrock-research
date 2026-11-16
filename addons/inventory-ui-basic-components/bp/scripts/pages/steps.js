const STEPS = [
  { name: "Account", text: "Sign in with the account that owns the world." },
  { name: "World", text: "Pick a world name and a seed." },
  { name: "Rules", text: "Choose the game mode and difficulty." },
  { name: "Done", text: "Check the summary, then tap Finish." },
];
const LAST = STEPS.length - 1;

function stepState(state, k) {
  if (state.finished || k < state.step) return "done";
  return k === state.step ? "current" : "pending";
}

export const page = {
  key: "steps",
  title: "Steps",
  steps: STEPS,
  slots: { back: 0, next: 1, state: 10, line: 14, title: 17, text: 18, backState: 19, nextState: 20, nextText: 21 },
  buttons: [0, 1],
  init: () => ({ step: 0, finished: false }),
  render: (state) => {
    const names = {
      17: state.finished ? "All steps finished" : `Step ${state.step + 1} of ${STEPS.length}: ${STEPS[state.step].name}`,
      18: state.finished ? "The wizard is complete. Tap Back to change something." : STEPS[state.step].text,
      19: state.finished || state.step > 0 ? "on" : "off",
      20: state.finished ? "off" : "on",
      21: state.step === LAST ? "Finish" : "Next",
    };
    STEPS.forEach((_, k) => {
      names[10 + k] = stepState(state, k);
      if (k < LAST) names[14 + k] = stepState(state, k) === "done" ? "on" : "off";
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === 0) {
      if (state.finished) state.finished = false;
      else if (state.step > 0) state.step--;
      else return "already at the first step";
      return `step ${STEPS[state.step].name}`;
    }
    if (state.finished) return "wizard already finished";
    if (state.step === LAST) {
      state.finished = true;
      return "wizard finished";
    }
    state.step++;
    return `step ${STEPS[state.step].name}`;
  },
};
