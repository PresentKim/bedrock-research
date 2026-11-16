import { dragState, restartDrag, dragSettled, senseDrag, renderDrag } from "./_drag.js";

const CELLS = 9;
const MIN_LENGTH = 4;
const SLOT = { source: 0, grid: 1, mode: 20, forget: 21, status: 30, entered: 31, modeText: 32, order: 40 };
const LAYOUT = { source: SLOT.source, cellSlot: (k) => SLOT.grid + k };

const uniqueCells = (path) => path.map((p) => p.cell).filter((cell, i, all) => all.indexOf(cell) === i);
const spell = (cells) => cells.map((c) => c + 1).join("-");

function judge(state, cells) {
  if (cells.length < MIN_LENGTH) return `§cToo short: connect at least ${MIN_LENGTH} dots`;
  if (state.mode === "set") {
    state.saved = cells;
    state.mode = "unlock";
    return `§aPattern saved: ${spell(cells)}`;
  }
  if (!state.saved) return "§cNo pattern saved yet";
  return spell(cells) === spell(state.saved) ? "§aUnlocked" : "§cWrong pattern";
}

export const page = {
  key: "patternlock",
  title: "PatternLock",
  cells: CELLS,
  slots: SLOT,
  buttons: [SLOT.mode, SLOT.forget],
  init: () => ({ ...dragState(CELLS), mode: "set", saved: undefined, shown: [], status: "§7Pick up the sticks, then draw through the dots" }),
  enter: (state) => restartDrag(state),
  tick: (state) => {
    state.tick += 1;
    if (!dragSettled(state)) return undefined;
    state.shown = uniqueCells(state.path);
    state.status = judge(state, state.shown);
    restartDrag(state);
    return `pattern ${spell(state.shown)}`;
  },
  sense: (state, read) => {
    const grown = senseDrag(state, read, LAYOUT);
    if (grown.length) state.shown = uniqueCells(state.path);
    return undefined;
  },
  render: (state) => {
    const values = {
      [SLOT.status]: state.status,
      [SLOT.entered]: state.shown.length ? `Drawn: ${spell(state.shown)}` : "Drawn: none",
      [SLOT.modeText]: state.mode === "set" ? "Mode: set a new pattern" : `Mode: unlock (saved ${state.saved ? spell(state.saved) : "none"})`,
    };
    for (let k = 0; k < CELLS; k++) {
      const at = state.shown.indexOf(k);
      values[SLOT.order + k] = at < 0 ? "" : `§r${at + 1}`;
    }
    return renderDrag(state, values, LAYOUT);
  },
  press: (state, slot) => {
    if (slot === SLOT.mode) {
      state.mode = state.mode === "set" ? "unlock" : "set";
      state.status = state.mode === "set" ? "§7Draw a new pattern" : "§7Draw the saved pattern";
      return `pattern mode ${state.mode}`;
    }
    state.saved = undefined;
    state.mode = "set";
    state.shown = [];
    state.status = "§7Pattern forgotten, draw a new one";
    restartDrag(state);
    return "pattern forgotten";
  },
};
