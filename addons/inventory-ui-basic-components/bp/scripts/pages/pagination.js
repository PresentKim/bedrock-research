const COUNT = 12;
const WINDOW = 5;
const LENGTH = Math.min(WINDOW, COUNT);

const first = (current) => Math.max(1, Math.min(current - Math.floor(LENGTH / 2), COUNT - LENGTH + 1));
const stepPage = (current, delta) => {
  const next = current + delta;
  return next >= 1 && next <= COUNT ? next : undefined;
};

export const page = {
  key: "pagination",
  title: "Pagination",
  count: COUNT,
  length: LENGTH,
  slots: { prev: 0, next: 1, cell: 2, cellKey: 10, prevState: 15, nextState: 16, text: 17 },
  buttons: [0, 1, ...Array.from({ length: LENGTH }, (_, k) => 2 + k)],
  init: () => ({ current: 1 }),
  render: (state) => {
    const start = first(state.current);
    const names = {
      15: stepPage(state.current, -1) === undefined ? "off" : "on",
      16: stepPage(state.current, 1) === undefined ? "off" : "on",
      17: `Page ${state.current} of ${COUNT}`,
    };
    for (let k = 0; k < LENGTH; k++) names[10 + k] = `${start + k === state.current ? "c" : "p"}${start + k}`;
    return names;
  },
  press: (state, slot) => {
    const target = slot < 2 ? stepPage(state.current, slot === 0 ? -1 : 1) : first(state.current) + slot - 2;
    if (target === undefined) return "no page there";
    if (target === state.current) return `already on page ${target}`;
    state.current = target;
    return `page ${target}`;
  },
};
