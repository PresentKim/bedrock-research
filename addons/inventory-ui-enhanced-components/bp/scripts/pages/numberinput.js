const MIN = 0;
const MAX = 64;
const STEP = 1;
const DRAFT_MAX = 8;
const PAD = ["7", "8", "9", "back", "4", "5", "6", "-", "1", "2", "3", ".", "0", "ok"];
const KEY = { minus: 0, plus: 1, field: 2, pad: 3 };
const SHOW = { value: 30, editing: 31, range: 32, disabledValue: 33 };

const clamp = (n) => Math.min(MAX, Math.max(MIN, n));
const stepNumber = (n) => clamp(Math.round(n * 1e10) / 1e10);

export const page = {
  key: "numberinput",
  title: "NumberInput",
  pad: PAD,
  keys: KEY,
  slots: SHOW,
  buttons: Array.from({ length: KEY.pad + PAD.length }, (_, k) => k),
  init: () => ({ value: 16, draft: null }),
  render: (s) => ({
    [SHOW.value]: s.draft === null ? `§r${s.value}` : `§r${s.draft}_`,
    [SHOW.editing]: s.draft === null ? "off" : "on",
    [SHOW.range]: `Range ${MIN} to ${MAX}, step ${STEP}`,
    [SHOW.disabledValue]: "§r8",
  }),
  press: (s, slot) => {
    if (slot === KEY.minus || slot === KEY.plus) {
      s.draft = null;
      s.value = stepNumber(s.value + (slot === KEY.plus ? STEP : -STEP));
      return `number ${s.value}`;
    }
    if (slot === KEY.field) {
      s.draft = s.draft === null ? "" : null;
      return s.draft === null ? "edit cancelled" : "editing number";
    }
    const key = PAD[slot - KEY.pad];
    if (key === "ok") {
      const typed = s.draft;
      s.draft = null;
      const n = typed === null || typed === "" ? NaN : Number(typed);
      if (Number.isNaN(n)) return "ignored, not a number";
      s.value = clamp(n);
      return s.value === n ? `number ${s.value}` : `number ${s.value} (clamped)`;
    }
    s.draft ??= "";
    if (key === "back") s.draft = s.draft.slice(0, -1);
    else if (s.draft.length < DRAFT_MAX) s.draft += key;
    return `draft ${s.draft || "empty"}`;
  },
};
