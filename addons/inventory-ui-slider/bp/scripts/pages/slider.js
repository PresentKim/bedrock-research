import { holdTap, markDragMoved, settleTap } from "./_tapfilter.js";

const STEPS = 11;
const KEYS = "abcdefghijk";
const DRAG = { step: 20, text: 31 };

export const page = {
  key: "slider",
  title: "Slider",
  steps: STEPS,
  keys: KEYS,
  slots: { tap: 0, value: 11, valueText: 12, dragStep: DRAG.step, dragText: DRAG.text },
  buttons: [
    ...Array.from({ length: STEPS }, (_, k) => k),
    ...Array.from({ length: STEPS }, (_, k) => DRAG.step + k),
  ],
  init: () => ({ value: 4, drag: 0 }),
  render: (state) => ({
    11: KEYS[state.value],
    12: `Value ${state.value * 10}`,
    [DRAG.text]: `Server value: ${state.drag * 10}`,
  }),
  tick: (state) => {
    const { tap, dropped } = settleTap(state);
    if (dropped !== undefined) return `tap ${dropped * 10} ignored, it was the end of a drag`;
    if (tap === undefined) return undefined;
    state.value = tap;
    return `slider ${state.value * 10}`;
  },
  press: (state, slot) => {
    if (slot < STEPS) {
      holdTap(state, slot);
      return undefined;
    }
    const step = slot - DRAG.step;
    if (step === state.drag) return undefined;
    state.drag = step;
    markDragMoved(state);
    return `drag slider ${step * 10}`;
  },
};
