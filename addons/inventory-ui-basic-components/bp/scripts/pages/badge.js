const ICONS = [
  { name: "Mail", start: 3 },
  { name: "Friends", start: 0 },
  { name: "Alerts", start: 120 },
];
const COUNT = ICONS.length;

const sizeKey = (n) => (n <= 0 ? "none" : n < 10 ? "one" : n < 100 ? "two" : "many");

export const page = {
  key: "badge",
  title: "Badge",
  icons: ICONS,
  slots: { open: 0, add: COUNT, remove: 2 * COUNT, clearAll: 3 * COUNT, size: 10, count: 10 + COUNT, summary: 10 + 2 * COUNT },
  buttons: Array.from({ length: 3 * COUNT + 1 }, (_, k) => k),
  init: () => ({ counts: ICONS.map((icon) => icon.start) }),
  render: (state) => {
    const names = { [10 + 2 * COUNT]: `Unread: ${ICONS.map((icon, k) => `${icon.name} ${state.counts[k]}`).join(", ")}` };
    state.counts.forEach((n, k) => {
      names[10 + k] = sizeKey(n);
      names[10 + COUNT + k] = n <= 0 ? "" : n > 99 ? "§r99+" : `§r${n}`;
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === 3 * COUNT) {
      state.counts = state.counts.map(() => 0);
      return "all badges cleared";
    }
    const k = slot % COUNT;
    const icon = ICONS[k].name;
    if (slot < COUNT) state.counts[k] = 0;
    else if (slot < 2 * COUNT) state.counts[k]++;
    else state.counts[k] = Math.max(0, state.counts[k] - 1);
    return `${icon} ${state.counts[k]}`;
  },
};
