const ROWS = 14;

export const page = {
  key: "scroll",
  title: "Scroll",
  rows: ROWS,
  slots: { row: 0, selected: 30, selectedText: 31 },
  buttons: Array.from({ length: ROWS }, (_, k) => k),
  init: () => ({ selected: undefined }),
  render: (state) => ({
    30: state.selected === undefined ? "" : `r${state.selected}`,
    31: state.selected === undefined ? "Nothing picked yet" : `Picked Row ${state.selected + 1}`,
  }),
  press: (state, slot) => {
    state.selected = slot;
    return `scroll row ${slot + 1}`;
  },
};
