const BARS = 8;
const LEVELS = 39;
const DATASETS = [
  { name: "Monthly sales", values: [12, 30, 22, 45, 38, 60, 52, 70] },
  { name: "Profit", values: [20, -10, 35, -25, 15, 40, -5, 25] },
  { name: "Losses", values: [-10, -30, -20, -45, -15, -35, -25, -5] },
  { name: "All zero", values: [0, 0, 0, 0, 0, 0, 0, 0] },
];

const chartDomain = (values) => {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  return max > min ? [min, max] : [0, 1];
};
const ratioIn = (value, [min, max]) => Math.min(1, Math.max(0, (value - min) / (max - min)));
const level = (ratio) => Math.round(ratio * LEVELS);

function show(state, index) {
  state.dataset = (index + DATASETS.length) % DATASETS.length;
  state.name = DATASETS[state.dataset].name;
  state.values = [...DATASETS[state.dataset].values];
}

export const page = {
  key: "barchart",
  title: "BarChart",
  bars: BARS,
  levels: LEVELS,
  slots: { prev: 0, next: 1, random: 2, negate: 3, fill: 10, mask: 20, baseline: 30, name: 31, values: 32 },
  buttons: [0, 1, 2, 3],
  init: () => {
    const state = {};
    show(state, 0);
    return state;
  },
  render: (state) => {
    const domain = chartDomain(state.values);
    const base = ratioIn(0, domain);
    const names = { 30: `l${level(base)}`, 31: state.name, 32: `Values: ${state.values.join(", ")}` };
    state.values.forEach((value, k) => {
      const ratio = ratioIn(value, domain);
      names[10 + k] = `${value < 0 ? "n" : "p"}${level(Math.max(base, ratio))}`;
      names[20 + k] = `m${level(Math.min(base, ratio))}`;
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === 0) show(state, state.dataset - 1);
    else if (slot === 1) show(state, state.dataset + 1);
    else if (slot === 2) {
      state.name = "Random";
      state.values = Array.from({ length: BARS }, () => Math.round(Math.random() * 150) - 50);
    } else {
      state.name = `${state.name} negated`.replace(" negated negated", "");
      state.values = state.values.map((v) => -v + 0);
    }
    return `bar chart ${state.name}`;
  },
};
