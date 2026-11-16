const PLAYERS = [
  ["Steve", 24, 8, 2150],
  ["Alex", 31, 12, 2620],
  ["Notch", 9, 3, 870],
  ["Herobrine", 40, 2, 3910],
  ["Sunny", 15, 15, 1180],
  ["Kai", 22, 19, 1640],
  ["Zuri", 18, 6, 1700],
  ["Noor", 27, 21, 1990],
  ["Makena", 12, 9, 1010],
  ["Efe", 35, 14, 3080],
  ["Ari", 6, 11, 420],
  ["Tex", 19, 7, 1730],
].map(([name, kills, deaths, score]) => ({ name, kills, deaths, score }));

const COLUMNS = [
  { key: "name", title: "Player", width: 130, first: "a" },
  { key: "kills", title: "Kills", width: 70, first: "d" },
  { key: "deaths", title: "Deaths", width: 70, first: "d" },
  { key: "score", title: "Score", width: 70, first: "d" },
];
const ROWS = 5;
const PAGES = Math.ceil(PLAYERS.length / ROWS);
const SLOTS = { header: 0, row: 4, prev: 9, next: 10, sort: 20, prevState: 22, nextState: 23, range: 24, picked: 25, cell: 30, rowState: 60 };

function sorted(state) {
  const { key } = COLUMNS[state.column];
  const sign = state.dir === "a" ? 1 : -1;
  return [...PLAYERS].sort((a, b) => {
    const order = typeof a[key] === "string" ? a[key].localeCompare(b[key]) : a[key] - b[key];
    return order * sign || a.name.localeCompare(b.name);
  });
}

const visible = (state) => sorted(state).slice(state.page * ROWS, state.page * ROWS + ROWS);

export const page = {
  key: "table",
  title: "Table",
  columns: COLUMNS,
  rows: ROWS,
  slots: SLOTS,
  buttons: Array.from({ length: SLOTS.next + 1 }, (_, k) => k),
  init: () => ({ column: 3, dir: "d", page: 0, selected: null }),
  render: (state) => {
    const rows = visible(state);
    const first = state.page * ROWS + 1;
    const names = {
      [SLOTS.sort]: `c${state.column}${state.dir}`,
      [SLOTS.prevState]: state.page > 0 ? "on" : "off",
      [SLOTS.nextState]: state.page < PAGES - 1 ? "on" : "off",
      [SLOTS.range]: `Rows ${first} to ${first + rows.length - 1} of ${PLAYERS.length}`,
      [SLOTS.picked]: state.selected ? `Selected: ${state.selected}` : "Tap a row to select it",
    };
    for (let r = 0; r < ROWS; r++) {
      const player = rows[r];
      names[SLOTS.rowState + r] = !player ? "off" : player.name === state.selected ? "sel" : "on";
      COLUMNS.forEach((column, c) => {
        names[SLOTS.cell + r * COLUMNS.length + c] = player ? `§r${player[column.key]}` : "";
      });
    }
    return names;
  },
  press: (state, slot) => {
    if (slot < SLOTS.row) {
      if (state.column === slot) state.dir = state.dir === "a" ? "d" : "a";
      else {
        state.column = slot;
        state.dir = COLUMNS[slot].first;
      }
      return `table sorted by ${COLUMNS[slot].key} ${state.dir === "a" ? "ascending" : "descending"}`;
    }
    if (slot === SLOTS.prev || slot === SLOTS.next) {
      const target = state.page + (slot === SLOTS.prev ? -1 : 1);
      if (target < 0 || target >= PAGES) return "no rows there";
      state.page = target;
      return `table page ${target + 1}`;
    }
    const player = visible(state)[slot - SLOTS.row];
    if (!player) return "empty row";
    state.selected = state.selected === player.name ? null : player.name;
    return state.selected ? `table selected ${player.name}` : "table selection cleared";
  },
};
