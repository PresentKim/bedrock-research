export const page = {
  key: "modal",
  title: "Modal",
  slots: { open: 0, backdrop: 1, cancel: 2, confirm: 3, state: 10, result: 11 },
  buttons: [0, 1, 2, 3],
  init: () => ({ open: false, result: "No answer yet" }),
  render: (state) => ({ 10: state.open ? "open" : "closed", 11: state.result }),
  press: (state, slot) => {
    if (slot === 0) {
      state.open = true;
      return "modal opened";
    }
    state.open = false;
    if (slot === 1) {
      state.result = "Closed by backdrop tap";
      return "modal closed by backdrop";
    }
    if (slot === 2) {
      state.result = "Cancelled";
      return "modal cancelled";
    }
    state.result = "Deleted";
    return "modal confirmed";
  },
};
