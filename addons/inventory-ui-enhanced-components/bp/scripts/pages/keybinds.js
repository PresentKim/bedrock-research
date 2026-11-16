const ACTIONS = [
  ["jump", "Jump", "Space"],
  ["sneak", "Sneak", "Shift"],
  ["attack", "Attack", "Mouse1"],
  ["use", "Use item", "Mouse2"],
  ["inventory", "Inventory", "E"],
  ["drop", "Drop item", "Q"],
];
const KEYS = [
  "Q", "W", "E", "R", "T", "Y",
  "A", "S", "D", "F", "G", "H",
  "Z", "X", "C", "V", "B", "N",
  "Space", "Shift", "Ctrl", "Alt", "Tab", "Enter",
  "Mouse1", "Mouse2", "Mouse3", "F1", "F2", "F3",
];
const MODES = ["swap", "replace", "block"];
const KEY = { action: 0, list: 10, cancel: 40, mode: 41 };
const SHOW = { keyText: 50, hint: 60, listening: 70, mode: 71, picker: 72 };

export const resolveBinding = (bindings, action, key, conflict) => {
  const holder = Object.keys(bindings).find((other) => other !== action && bindings[other] === key);
  if (holder === undefined) return { ...bindings, [action]: key };
  if (conflict === "block") return bindings;
  if (conflict === "swap") return { ...bindings, [holder]: bindings[action] ?? null, [action]: key };
  return { ...bindings, [holder]: null, [action]: key };
};

export const page = {
  key: "keybinds",
  title: "Keybinds",
  actions: ACTIONS,
  keyNames: KEYS,
  modes: MODES,
  keys: KEY,
  slots: SHOW,
  buttons: [
    ...ACTIONS.map((_, k) => KEY.action + k),
    ...KEYS.map((_, k) => KEY.list + k),
    KEY.cancel,
    ...MODES.map((_, k) => KEY.mode + k),
  ],
  init: () => ({ bindings: Object.fromEntries(ACTIONS.map(([id, , key]) => [id, key])), listening: null, conflict: "swap" }),
  render: (s) => {
    const names = {};
    ACTIONS.forEach(([id], k) => {
      const listening = s.listening === k;
      names[SHOW.keyText + k] = listening ? "" : s.bindings[id] ?? "";
      names[SHOW.hint + k] = listening ? "Pick a key" : s.bindings[id] ? "" : "Not bound";
    });
    names[SHOW.listening] = s.listening === null ? "none" : `l${s.listening}`;
    names[SHOW.mode] = s.conflict;
    names[SHOW.picker] = s.listening === null ? "closed" : "open";
    return names;
  },
  press: (s, slot) => {
    if (slot < KEY.action + ACTIONS.length) {
      s.listening = s.listening === slot ? null : slot;
      return s.listening === null ? "listening cancelled" : `listening for ${ACTIONS[slot][0]}`;
    }
    if (slot === KEY.cancel) {
      s.listening = null;
      return "listening cancelled";
    }
    if (slot >= KEY.mode) {
      s.conflict = MODES[slot - KEY.mode];
      return `conflict ${s.conflict}`;
    }
    if (s.listening === null) return "pick an action first";
    const [action] = ACTIONS[s.listening];
    const key = KEYS[slot - KEY.list];
    s.listening = null;
    const next = resolveBinding(s.bindings, action, key, s.conflict);
    if (next === s.bindings) return `${key} blocked, already in use`;
    const changed = Object.keys(next).some((id) => next[id] !== s.bindings[id]);
    s.bindings = next;
    return changed ? `${action} bound to ${key}` : `${action} unchanged`;
  },
};
