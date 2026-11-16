const CHIPS = [
  { id: "plains", label: "Plains", group: "biome" },
  { id: "forest", label: "Forest", group: "biome" },
  { id: "desert", label: "Desert", group: "biome" },
  { id: "ocean", label: "Ocean", group: "biome" },
  { id: "survival", label: "Survival", group: "mode" },
  { id: "creative", label: "Creative", group: "mode" },
  { id: "adventure", label: "Adventure", group: "mode" },
  { id: "hardcore", label: "Hardcore", group: "mode" },
];

const DEFAULT = ["plains", "forest", "survival"];

function place(active) {
  let on = 0;
  let off = 0;
  return CHIPS.map((chip) => (active.includes(chip.id) ? `a${on++}` : `s${off++}`));
}

export const page = {
  key: "chips",
  title: "Chips",
  chips: CHIPS,
  slots: { remove: 0, reset: 8, add: 10, chip: 20, activeEmpty: 30, suggestEmpty: 31, summary: 32, last: 33 },
  buttons: [...CHIPS.map((_, i) => i), 8, ...CHIPS.map((_, i) => 10 + i)],
  init: () => ({ active: [...DEFAULT], last: "Tap x to remove a filter" }),
  render: (state) => {
    const names = {};
    place(state.active).forEach((value, i) => {
      names[20 + i] = value;
    });
    const count = state.active.length;
    names[30] = count ? "some" : "none";
    names[31] = count === CHIPS.length ? "none" : "some";
    names[32] = count ? `Active filters: ${count}` : "No filters active";
    names[33] = state.last;
    return names;
  },
  press: (state, slot) => {
    if (slot === 8) {
      state.active = [...DEFAULT];
      state.last = "Filters reset";
      return "chips reset";
    }
    const index = slot >= 10 ? slot - 10 : slot;
    const chip = CHIPS[index];
    if (slot >= 10) {
      if (!state.active.includes(chip.id)) state.active = CHIPS.filter((c) => c.id === chip.id || state.active.includes(c.id)).map((c) => c.id);
      state.last = `Added ${chip.label}`;
      return `chips added ${chip.id}`;
    }
    state.active = state.active.filter((id) => id !== chip.id);
    state.last = `Removed ${chip.label}`;
    return `chips removed ${chip.id}`;
  },
};
