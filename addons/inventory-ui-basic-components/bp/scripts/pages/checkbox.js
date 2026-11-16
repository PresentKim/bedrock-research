export const page = {
  key: "checkbox",
  title: "Checkbox",
  slots: { press: 0, state: 1, label: 2, disabledState: 3 },
  buttons: [0],
  init: () => ({ checked: false }),
  render: (state) => ({ 1: state.checked ? "on" : "off", 2: state.checked ? "Checked" : "Unchecked", 3: "on" }),
  press: (state) => {
    state.checked = !state.checked;
    return `checkbox ${state.checked ? "checked" : "unchecked"}`;
  },
};
