const MAX_VISIBLE = 3;
const FRESH_KEYS = "abcdef";
const TICKS_PER_SECOND = 20;

const visible = (state) => state.toasts.slice(-MAX_VISIBLE);

export const page = {
  key: "toast",
  title: "ToastHost",
  maxVisible: MAX_VISIBLE,
  freshKeys: FRESH_KEYS,
  slots: { short: 0, long: 1, dismiss: 2, spot: 10, text: 13, queue: 16 },
  buttons: [0, 1, 2, 3, 4],
  init: () => ({ next: 1, toasts: [] }),
  tick: (state) => {
    for (const toast of state.toasts) toast.left--;
    const expired = state.toasts.filter((toast) => toast.left <= 0);
    if (!expired.length) return undefined;
    state.toasts = state.toasts.filter((toast) => toast.left > 0);
    return `toast ${expired.map((toast) => `t${toast.id}`).join(", ")} timed out`;
  },
  render: (state) => {
    const shown = visible(state);
    const names = { 16: `Toasts ${state.toasts.length}, showing ${shown.length}` };
    for (let k = 0; k < MAX_VISIBLE; k++) {
      const toast = shown[k];
      names[10 + k] = !toast ? "none" : k === shown.length - 1 ? FRESH_KEYS[toast.id % FRESH_KEYS.length] : "still";
      names[13 + k] = toast ? toast.text : "";
    }
    return names;
  },
  press: (state, slot) => {
    if (slot < 2) {
      const seconds = slot === 0 ? 3 : 8;
      const id = state.next++;
      state.toasts.push({ id, text: `Toast t${id}, closes in ${seconds} s`, left: seconds * TICKS_PER_SECOND });
      return `toast t${id} shown for ${seconds} s`;
    }
    const toast = visible(state)[slot - 2];
    if (!toast) return "";
    state.toasts = state.toasts.filter((other) => other !== toast);
    return `toast t${toast.id} dismissed`;
  },
};
