const ITEMS = [
  { id: "graphics", title: "Graphics", text: "Render distance, smooth lighting and clouds." },
  { id: "audio", title: "Audio", text: "Music, sound effects and voice volume." },
  { id: "controls", title: "Controls", text: "Touch layout, sensitivity and keybinds." },
  { id: "online", title: "Online (disabled)", disabled: true },
];

export const page = {
  key: "accordion",
  title: "Accordion",
  items: ITEMS,
  slots: { header: 0, multiple: 5, item: 10, multipleText: 14 },
  buttons: [0, 1, 2, 5],
  init: () => ({ open: [], multiple: false }),
  render: (state) => {
    const names = { 14: `Multiple: ${state.multiple ? "on" : "off"}` };
    let openBefore = 0;
    ITEMS.forEach((item, i) => {
      const open = state.open.includes(item.id);
      names[10 + i] = `p${openBefore}${open ? "o" : "c"}`;
      if (open) openBefore++;
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === 5) {
      state.multiple = !state.multiple;
      if (!state.multiple) state.open = state.open.slice(0, 1);
      return `accordion multiple ${state.multiple ? "on" : "off"}`;
    }
    const { id } = ITEMS[slot];
    if (state.open.includes(id)) {
      state.open = state.open.filter((x) => x !== id);
      return `accordion ${id} closed`;
    }
    state.open = state.multiple ? [...state.open, id] : [id];
    return `accordion ${id} opened`;
  },
};
