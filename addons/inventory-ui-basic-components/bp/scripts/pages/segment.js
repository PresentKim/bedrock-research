const OPTIONS = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "rain", label: "Rain" },
];

export const page = {
  key: "segment",
  title: "Segment",
  options: OPTIONS,
  disabledOptions: ["Low", "High"],
  slots: { press: 0, selected: 10, text: 11 },
  buttons: OPTIONS.map((_, k) => k),
  init: () => ({ value: "day" }),
  render: (state) => ({
    10: state.value,
    11: `Selected ${OPTIONS.find((o) => o.value === state.value).label}`,
  }),
  press: (state, slot) => {
    state.value = OPTIONS[slot].value;
    return `segment ${state.value}`;
  },
};
