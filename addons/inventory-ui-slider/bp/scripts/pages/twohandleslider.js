import { holdTap, markDragMoved, settleTap } from "./_tapfilter.js";

const STEPS = 11;
const KEYS = "abcdefghijk";
const SLOT = { tap: 0, low: 11, high: 12, valueText: 13, segment: 14, lowStep: 30, highStep: 50, dragText: 70 };

const nearestHandle = (k, low, high) => {
  const toLow = Math.abs(k - low);
  const toHigh = Math.abs(k - high);
  if (toLow !== toHigh) return toLow < toHigh ? "low" : "high";
  return k < low ? "low" : "high";
};

const steps = (base) => Array.from({ length: STEPS }, (_, k) => base + k);

function dragRange(s) {
  const low = Math.min(s.dragLow, s.dragHigh);
  const high = Math.max(s.dragLow, s.dragHigh);
  return `Server range: ${low * 10} to ${high * 10}${s.dragLow > s.dragHigh ? ", swapped" : ""}`;
}

export const page = {
  key: "twohandleslider",
  title: "TwoHandleSlider",
  steps: STEPS,
  keys: KEYS,
  slots: SLOT,
  buttons: [...steps(SLOT.tap), ...steps(SLOT.lowStep), ...steps(SLOT.highStep)],
  init: () => ({ low: 2, high: 7, dragLow: 0, dragHigh: STEPS - 1 }),
  render: (s) => {
    const names = {
      [SLOT.low]: KEYS[s.low],
      [SLOT.high]: KEYS[s.high],
      [SLOT.valueText]: `Range ${s.low * 10} to ${s.high * 10}`,
      [SLOT.dragText]: dragRange(s),
    };
    for (let k = 0; k < STEPS - 1; k++) names[SLOT.segment + k] = s.low <= k && k + 1 <= s.high ? "on" : "off";
    return names;
  },
  tick: (s) => {
    const { tap, dropped } = settleTap(s);
    if (dropped !== undefined) return `tap ${dropped * 10} ignored, it was the end of a drag`;
    if (tap === undefined) return undefined;
    if (nearestHandle(tap, s.low, s.high) === "low") s.low = Math.min(tap, s.high);
    else s.high = Math.max(tap, s.low);
    return `range ${s.low * 10} to ${s.high * 10}`;
  },
  press: (s, slot) => {
    if (slot < SLOT.tap + STEPS) {
      holdTap(s, slot - SLOT.tap);
      return undefined;
    }
    const field = slot < SLOT.highStep ? "dragLow" : "dragHigh";
    const step = slot - (field === "dragLow" ? SLOT.lowStep : SLOT.highStep);
    if (step === s[field]) return undefined;
    s[field] = step;
    markDragMoved(s);
    return `${field === "dragLow" ? "low" : "high"} handle ${step * 10}`;
  },
};
