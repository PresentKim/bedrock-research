const POINTS = 8;
const LEVELS = 39;
const COLUMN = 4;
const COLUMNS = 37;
const PLOT = { left: 2, width: 144, bottom: 2, height: 74 };
const DATASETS = [
  { name: "Temperature", values: [12, 15, 21, 26, 24, 19, 14, 10] },
  { name: "Visitors", values: [5, 40, 18, 65, 30, 80, 45, 90] },
  { name: "Balance", values: [20, -15, 10, -30, 25, -5, 35, -20] },
  { name: "Flat", values: [50, 50, 50, 50, 50, 50, 50, 50] },
];

const chartDomain = (values) => {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  return max > min ? [min, max] : [0, 1];
};
const ratioIn = (value, [min, max]) => Math.min(1, Math.max(0, (value - min) / (max - min)));
const clampLevel = (k) => Math.min(LEVELS, Math.max(0, k));

function points(values) {
  const domain = chartDomain(values);
  return values.map((value, i) => ({
    x: PLOT.left + (i / (values.length - 1)) * PLOT.width,
    h: PLOT.bottom + ratioIn(value, domain) * PLOT.height,
  }));
}

function heightAt(pts, x) {
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i].x) {
      const t = (x - pts[i - 1].x) / (pts[i].x - pts[i - 1].x);
      return pts[i - 1].h + t * (pts[i].h - pts[i - 1].h);
    }
  }
  return pts[pts.length - 1].h;
}

function column(pts, c) {
  const left = Math.max(c * COLUMN, pts[0].x);
  const right = Math.min((c + 1) * COLUMN, pts[pts.length - 1].x);
  if (left > right) return undefined;
  const heights = [heightAt(pts, left), heightAt(pts, right), ...pts.filter((p) => p.x > left && p.x < right).map((p) => p.h)];
  return { lo: clampLevel(Math.floor((Math.min(...heights) - 1) / 2)), hi: clampLevel(Math.ceil((Math.max(...heights) + 1) / 2)) };
}

function show(state, index) {
  state.dataset = (index + DATASETS.length) % DATASETS.length;
  state.name = DATASETS[state.dataset].name;
  state.values = [...DATASETS[state.dataset].values];
}

export const page = {
  key: "linechart",
  title: "LineChart",
  points: POINTS,
  levels: LEVELS,
  column: COLUMN,
  columns: COLUMNS,
  slots: { prev: 0, next: 1, random: 2, dot: 10, name: 18, values: 19, fill: 20, mask: 60 },
  buttons: [0, 1, 2],
  init: () => {
    const state = {};
    show(state, 0);
    return state;
  },
  render: (state) => {
    const pts = points(state.values);
    const names = { 18: state.name, 19: `Values: ${state.values.join(", ")}` };
    pts.forEach((p, i) => {
      names[10 + i] = `d${clampLevel(Math.round(p.h / 2))}`;
    });
    for (let c = 0; c < COLUMNS; c++) {
      const run = column(pts, c);
      names[20 + c] = run ? `f${run.hi}` : "";
      names[60 + c] = run ? `m${run.lo}` : "";
    }
    return names;
  },
  press: (state, slot) => {
    if (slot === 0) show(state, state.dataset - 1);
    else if (slot === 1) show(state, state.dataset + 1);
    else {
      state.name = "Random";
      state.values = Array.from({ length: POINTS }, () => Math.round(Math.random() * 150) - 50);
    }
    return `line chart ${state.name}`;
  },
};
