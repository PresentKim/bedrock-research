const OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard" },
];

export const page = {
  key: "radiogroup",
  title: "RadioGroup",
  options: OPTIONS,
  disabledLabel: "Hardcore",
  slots: { press: 0, selected: 10, text: 11 },
  buttons: OPTIONS.map((_, k) => k),
  init: () => ({ value: "normal" }),
  render: (state) => ({
    10: state.value,
    11: `Selected ${OPTIONS.find((o) => o.value === state.value).label}`,
  }),
  press: (state, slot) => {
    state.value = OPTIONS[slot].value;
    return `radio ${state.value}`;
  },
};
