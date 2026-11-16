const STEPPERS = [
  { name: "difficulty", caption: "Difficulty", loop: false, items: ["Peaceful", "Easy", "Normal", "Hard"], start: 2 },
  { name: "season", caption: "Season", loop: true, items: ["Spring", "Summer", "Autumn", "Winter"], start: 0 },
];

function step(index, delta, { loop, items }) {
  const n = items.length;
  if (loop) return (index + delta + n) % n;
  if (index < 0) return delta > 0 ? 0 : undefined;
  const next = index + delta;
  return next >= 0 && next < n ? next : undefined;
}

export const page = {
  key: "stepper",
  title: "Stepper",
  steppers: STEPPERS,
  slots: { prev: 0, next: 1, value: 10, prevState: 11, nextState: 12 },
  stride: { button: 2, display: 3 },
  buttons: STEPPERS.flatMap((_, k) => [2 * k, 2 * k + 1]),
  init: () => ({ index: STEPPERS.map((s) => s.start) }),
  render: (state) => Object.fromEntries(STEPPERS.flatMap((s, k) => {
    const i = state.index[k];
    return [
      [10 + 3 * k, s.items[i]],
      [11 + 3 * k, step(i, -1, s) === undefined ? "off" : "on"],
      [12 + 3 * k, step(i, 1, s) === undefined ? "off" : "on"],
    ];
  })),
  press: (state, slot) => {
    const k = Math.floor(slot / 2);
    const s = STEPPERS[k];
    const next = step(state.index[k], slot % 2 === 0 ? -1 : 1, s);
    if (next === undefined) return `${s.name} is at the end`;
    state.index[k] = next;
    return `${s.name} ${s.items[next]}`;
  },
};
