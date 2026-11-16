const ITEMS = 7;
const PER_PAGE = 3;
const PAGES = Math.max(1, Math.ceil(ITEMS / PER_PAGE));

function stepPage(state, delta) {
  const target = state.page + delta;
  if (target >= 1 && target <= PAGES) return target;
  if (!state.loop) return undefined;
  return delta > 0 ? 1 : PAGES;
}

export const page = {
  key: "carousel",
  title: "Carousel",
  items: ITEMS,
  perPage: PER_PAGE,
  pages: PAGES,
  slots: { prev: 0, next: 1, dot: 2, loop: 5, track: 10, prevState: 11, nextState: 12, current: 13, pageText: 14, loopText: 15 },
  buttons: [0, 1, ...Array.from({ length: PAGES }, (_, k) => 2 + k), 5],
  init: () => ({ page: 1, dir: "n", loop: false }),
  render: (state) => ({
    10: `p${state.page}${state.dir}`,
    11: stepPage(state, -1) ? "on" : "off",
    12: stepPage(state, 1) ? "on" : "off",
    13: `p${state.page}`,
    14: `Page ${state.page} of ${PAGES}`,
    15: `Loop: ${state.loop ? "on" : "off"}`,
  }),
  press: (state, slot) => {
    if (slot === 5) {
      state.loop = !state.loop;
      return `carousel loop ${state.loop ? "on" : "off"}`;
    }
    if (slot < 2) {
      const delta = slot === 0 ? -1 : 1;
      const target = stepPage(state, delta);
      if (!target) return "carousel has no page there";
      state.dir = delta > 0 ? "f" : "b";
      state.page = target;
      return `carousel page ${target}`;
    }
    const target = slot - 1;
    if (target === state.page) return "";
    state.dir = target > state.page ? "f" : "b";
    state.page = target;
    return `carousel page ${target}`;
  },
};
