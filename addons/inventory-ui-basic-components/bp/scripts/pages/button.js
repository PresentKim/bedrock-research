const VARIANTS = ["Secondary", "Primary", "Danger"];

export const page = {
  key: "button",
  title: "Button",
  variants: VARIANTS,
  slots: { press: 0, toggle: 3, enabled: 10, last: 11 },
  buttons: [0, 1, 2, 3],
  init: () => ({ enabled: true, last: undefined, count: 0 }),
  render: (state) => ({
    10: state.enabled ? "on" : "off",
    11: state.last === undefined ? "Press a button" : `Last ${state.last} x${state.count}`,
  }),
  press: (state, slot) => {
    if (slot === 3) {
      state.enabled = !state.enabled;
      return `buttons ${state.enabled ? "enabled" : "disabled"}`;
    }
    if (!state.enabled) return "button is disabled";
    const name = VARIANTS[slot];
    state.count = state.last === name ? state.count + 1 : 1;
    state.last = name;
    return `pressed ${name}`;
  },
};
