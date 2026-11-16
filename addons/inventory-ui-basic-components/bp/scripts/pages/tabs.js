const TABS = [
  { id: "general", label: "General", lines: ["Language: English", "Show coordinates: on", "Auto jump: off"] },
  { id: "video", label: "Video", lines: ["Render distance: 12 chunks", "Brightness: 50", "Smooth lighting: on"] },
  { id: "audio", label: "Audio", lines: ["Main volume: 100", "Music: 40", "Sound effects: 80"] },
];

export const page = {
  key: "tabs",
  title: "Tabs",
  tabs: TABS,
  disabledLabel: "Locked",
  slots: { press: 0, active: 10 },
  buttons: TABS.map((_, k) => k),
  init: () => ({ active: "general" }),
  render: (state) => ({ 10: state.active }),
  press: (state, slot) => {
    state.active = TABS[slot].id;
    return `tab ${state.active}`;
  },
};
