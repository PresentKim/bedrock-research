import { holdTap, markDragMoved, settleTap } from "./_tapfilter.js";

const TAP_VALUES = ["Peaceful", "Easy", "Normal", "Hard"];
const DRAG_VALUES = ["Clear", "Rain", "Thunder"];
const KEYS = "abcd";
const SLOT = { tap: 0, value: 10, valueText: 11, dragStep: 20, dragText: 30 };

export const page = {
  key: "textslider",
  title: "TextSlider",
  tapValues: TAP_VALUES,
  dragValues: DRAG_VALUES,
  keys: KEYS,
  slots: SLOT,
  buttons: [...TAP_VALUES.map((_, k) => SLOT.tap + k), ...DRAG_VALUES.map((_, k) => SLOT.dragStep + k)],
  init: () => ({ value: 2, drag: 0 }),
  render: (s) => ({
    [SLOT.value]: KEYS[s.value],
    [SLOT.valueText]: TAP_VALUES[s.value],
    [SLOT.dragText]: `Server weather: ${DRAG_VALUES[s.drag]}`,
  }),
  tick: (s) => {
    const { tap, dropped } = settleTap(s);
    if (dropped !== undefined) return `tap ${TAP_VALUES[dropped]} ignored, it was the end of a drag`;
    if (tap === undefined) return undefined;
    s.value = tap;
    return `difficulty ${TAP_VALUES[s.value]}`;
  },
  press: (s, slot) => {
    if (slot < SLOT.dragStep) {
      holdTap(s, slot - SLOT.tap);
      return undefined;
    }
    const step = slot - SLOT.dragStep;
    if (step === s.drag) return undefined;
    s.drag = step;
    markDragMoved(s);
    return `weather ${DRAG_VALUES[step]}`;
  },
};
