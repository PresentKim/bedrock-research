export const STACK = 64;
export const SETTLE_TICKS = 20;
export const MARKER = { item: "minecraft:stick", name: "§rDrag me", marker: true };

export function dragState(cells) {
  return { tick: 0, refill: true, clearTrack: true, counts: Array(cells).fill(0), path: [], lastChange: 0, emptying: [] };
}

export function restartDrag(state) {
  state.refill = true;
  state.clearTrack = true;
  state.collectMarkers = true;
  state.counts = state.counts.map(() => 0);
  state.path = [];
  state.emptying = [];
  state.topUp = false;
}

export const dragSettled = (state) => state.path.length > 0 && !state.clearTrack && state.tick - state.lastChange >= SETTLE_TICKS;

export function senseDrag(state, read, { source, cellSlot, emptyOnReach = false }) {
  const sourceItem = read(source);
  if ((state.refill || state.topUp) && sourceItem?.marker && sourceItem.count === STACK) {
    state.refill = false;
    state.topUp = false;
  }
  const counts = state.counts.map((_, k) => {
    const cell = read(cellSlot(k));
    return cell?.marker ? cell.count : 0;
  });
  if (state.clearTrack) {
    if (counts.every((c) => c === 0)) state.clearTrack = false;
    return [];
  }
  state.emptying = state.emptying.filter((k) => counts[k] > 0);
  if (counts.some((c, k) => c !== state.counts[k])) state.lastChange = state.tick;
  const grown = counts.map((c, k) => (c > state.counts[k] ? k : -1)).filter((k) => k >= 0);
  state.counts = counts;
  for (const k of grown) state.path.push({ cell: k, tick: state.tick });
  if (emptyOnReach && grown.length) {
    state.emptying.push(...grown.filter((k) => !state.emptying.includes(k)));
    state.topUp = true;
  }
  return grown;
}

export function renderDrag(state, values, { source, cellSlot }) {
  if (state.refill || state.topUp) values[source] = { ...MARKER, count: STACK };
  const emptied = state.clearTrack ? state.counts.map((_, k) => k) : state.emptying;
  for (const k of emptied) values[cellSlot(k)] = "";
  return values;
}
