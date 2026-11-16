export const page = {
  key: "toggle",
  title: "ToggleButton",
  slots: { press: 0, state: 1, disabledState: 2 },
  buttons: [0],
  init: () => ({ on: false }),
  render: (state) => ({ 1: state.on ? "on" : "off", 2: "on" }),
  press: (state) => {
    state.on = !state.on;
    return `toggle ${state.on ? "on" : "off"}`;
  },
};
