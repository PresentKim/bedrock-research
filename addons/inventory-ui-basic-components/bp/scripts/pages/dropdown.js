const OPTIONS = [
  { value: "plains", label: "Plains" },
  { value: "forest", label: "Forest" },
  { value: "desert", label: "Desert" },
  { value: "jungle", label: "Jungle (disabled)", disabled: true },
  { value: "taiga", label: "Taiga" },
];

export const page = {
  key: "dropdown",
  title: "Dropdown",
  options: OPTIONS,
  slots: { trigger: 0, outside: 1, option: 2, open: 10, selected: 11, valueText: 12 },
  buttons: [0, 1, ...OPTIONS.flatMap((option, k) => (option.disabled ? [] : [2 + k]))],
  init: () => ({ open: false, value: undefined }),
  render: (state) => ({
    10: state.open ? "open" : "closed",
    11: state.value ?? "none",
    12: OPTIONS.find((option) => option.value === state.value)?.label ?? "",
  }),
  press: (state, slot) => {
    if (slot === 0) {
      state.open = !state.open;
      return `dropdown ${state.open ? "opened" : "closed"}`;
    }
    if (slot === 1) {
      state.open = false;
      return "dropdown closed by outside tap";
    }
    const option = OPTIONS[slot - 2];
    state.value = option.value;
    state.open = false;
    return `dropdown ${option.value}`;
  },
};
