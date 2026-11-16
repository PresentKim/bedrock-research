const SIDES = ["right", "left", "top", "bottom"];

export const page = {
  key: "tooltip",
  title: "Tooltip",
  sides: SIDES,
  slots: { target: 0, hover: 4, outside: 5, open: 10, any: 11 },
  buttons: [0, 1, 2, 3, 4, 5],
  init: () => ({ open: "none" }),
  render: (state) => ({ 10: state.open, 11: state.open === "none" ? "closed" : "open" }),
  press: (state, slot) => {
    if (slot === 4) return "hover target pressed";
    if (slot === 5) {
      state.open = "none";
      return "tooltip closed by outside tap";
    }
    const side = SIDES[slot];
    state.open = state.open === side ? "none" : side;
    return `tooltip ${side} ${state.open === "none" ? "closed" : "opened"}`;
  },
};
