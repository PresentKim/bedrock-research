const SIZES = ["Small", "Medium", "Large"];

export const page = {
  key: "roundedbutton",
  title: "RoundedButton",
  sizes: SIZES,
  slots: { press: 0, last: 10 },
  buttons: [0, 1, 2],
  init: () => ({ last: undefined, count: 0 }),
  render: (state) => ({ 10: state.last === undefined ? "Press a button" : `Last ${state.last} x${state.count}` }),
  press: (state, slot) => {
    const name = SIZES[slot];
    state.count = state.last === name ? state.count + 1 : 1;
    state.last = name;
    return `pressed ${name} rounded button`;
  },
};
