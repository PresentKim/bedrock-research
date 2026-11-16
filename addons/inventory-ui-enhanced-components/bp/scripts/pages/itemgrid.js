const COLUMNS = 9;
const ROWS = 3;
const CELLS = COLUMNS * ROWS;
const SLOT = { cell: 0, shuffle: 27, addDiamond: 28, clear: 29, item: 30, selected: 60, info: 61, summary: 62 };

const NAMES = {
  "minecraft:diamond": "Diamond",
  "minecraft:iron_ingot": "Iron Ingot",
  "minecraft:apple": "Apple",
  "minecraft:oak_log": "Oak Log",
  "minecraft:diamond_sword": "Diamond Sword",
  "minecraft:bread": "Bread",
  "minecraft:cobblestone": "Cobblestone",
  "minecraft:torch": "Torch",
  "minecraft:ender_pearl": "Ender Pearl",
  "minecraft:emerald": "Emerald",
  "minecraft:golden_apple": "Golden Apple",
  "minecraft:redstone": "Redstone Dust",
  "minecraft:bow": "Bow",
};

const START = [
  ["minecraft:diamond", 5], ["minecraft:iron_ingot", 32], null, ["minecraft:apple", 12], ["minecraft:oak_log", 64],
  null, ["minecraft:diamond_sword", 1], ["minecraft:bread", 8], null,
  ["minecraft:cobblestone", 64], null, ["minecraft:torch", 16], ["minecraft:ender_pearl", 4], null,
  ["minecraft:emerald", 3], null, null, ["minecraft:golden_apple", 2],
  null, ["minecraft:redstone", 24], null, null, ["minecraft:bow", 1], null, null, null, null,
];

const MAX_DIAMONDS = 64;

const nameOf = (stack) => NAMES[stack.item] ?? stack.item;

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function addDiamond(items) {
  const stack = items.find((s) => s?.item === "minecraft:diamond" && s.count < MAX_DIAMONDS);
  if (stack) {
    stack.count += 1;
    return true;
  }
  const empty = items.findIndex((s) => !s);
  if (empty < 0) return false;
  items[empty] = { item: "minecraft:diamond", count: 1 };
  return true;
}

function info(state) {
  if (state.selected < 0) return "Tap a cell to select it";
  const stack = state.items[state.selected];
  return stack ? `${nameOf(stack)} x${stack.count}` : "Empty cell";
}

function summary(items) {
  const stacks = items.filter(Boolean);
  const total = stacks.reduce((sum, s) => sum + s.count, 0);
  return `Stacks: ${stacks.length}, items: ${total}`;
}

export const page = {
  key: "itemgrid",
  title: "ItemGrid",
  columns: COLUMNS,
  rows: ROWS,
  slots: SLOT,
  buttons: [...Array.from({ length: CELLS }, (_, k) => SLOT.cell + k), SLOT.shuffle, SLOT.addDiamond, SLOT.clear],
  init: () => ({
    items: START.map((entry) => (entry ? { item: entry[0], count: entry[1] } : null)),
    selected: -1,
  }),
  render: (state) => {
    const names = {
      [SLOT.selected]: state.selected < 0 ? "none" : `s${state.selected}`,
      [SLOT.info]: info(state),
      [SLOT.summary]: summary(state.items),
    };
    state.items.forEach((stack, k) => {
      names[SLOT.item + k] = stack ? { item: stack.item, count: stack.count } : "";
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === SLOT.shuffle) {
      shuffle(state.items);
      state.selected = -1;
      return "shuffled";
    }
    if (slot === SLOT.addDiamond) return addDiamond(state.items) ? "added a diamond" : "no room for a diamond";
    if (slot === SLOT.clear) {
      const stack = state.items[state.selected];
      if (!stack) return state.selected < 0 ? "nothing selected" : "selected cell is empty";
      state.items[state.selected] = null;
      return `cleared ${nameOf(stack)}`;
    }
    const cell = slot - SLOT.cell;
    state.selected = state.selected === cell ? -1 : cell;
    return state.selected < 0 ? "selection cleared" : `selected cell ${cell + 1}`;
  },
};
