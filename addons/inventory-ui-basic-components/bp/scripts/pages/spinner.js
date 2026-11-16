export const page = {
  key: "spinner",
  title: "Spinner",
  slots: { toggle: 0, running: 10, toggleText: 11 },
  buttons: [0],
  init: () => ({ running: true }),
  render: (state) => ({ 10: state.running ? "on" : "off", 11: state.running ? "Stop" : "Start" }),
  press: (state) => {
    state.running = !state.running;
    return `spinners ${state.running ? "started" : "stopped"}`;
  },
};
