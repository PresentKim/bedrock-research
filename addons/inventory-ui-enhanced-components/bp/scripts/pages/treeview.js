const NODES = [
  ["worlds", "Worlds", null],
  ["survival", "Survival", "worlds"],
  ["survival_level", "level.dat", "survival"],
  ["survival_db", "db", "survival"],
  ["creative", "Creative", "worlds"],
  ["creative_level", "level.dat", "creative"],
  ["packs", "Packs", null],
  ["resource", "Resource Packs", "packs"],
  ["vanilla", "Vanilla", "resource"],
  ["behavior", "Behavior Packs", "packs"],
  ["components", "Enhanced Components", "behavior"],
  ["options", "options.txt", null],
].map(([id, name, parent]) => ({ id, name, parent }));

const LEVELS = 3;
const ROWS = NODES.length;
const SLOTS = { button: 0, text: 80, key: 120, level: 135, selected: 150, picked: 151, path: 152, count: 153 };

const byId = Object.fromEntries(NODES.map((node) => [node.id, node]));
const children = (id) => NODES.filter((node) => node.parent === id);
const depth = (node) => (node.parent ? depth(byId[node.parent]) + 1 : 0);
const ancestors = (node) => (node.parent ? [...ancestors(byId[node.parent]), byId[node.parent]] : []);

const FOLDER_LEVELS = [...new Set(NODES.filter((node) => children(node.id).length > 0).map(depth))];
const toggleSlot = (row, level) => SLOTS.button + row * LEVELS * 2 + level * 2;
const selectSlot = (row, level) => toggleSlot(row, level) + 1;

function visible(state, parent = null) {
  return children(parent).flatMap((node) => [node, ...(state.expanded.includes(node.id) ? visible(state, node.id) : [])]);
}

function mark(state, node) {
  if (children(node.id).length === 0) return "l";
  return state.expanded.includes(node.id) ? "o" : "c";
}

export const page = {
  key: "treeview",
  title: "TreeView",
  rows: ROWS,
  levels: LEVELS,
  slots: SLOTS,
  folderLevels: FOLDER_LEVELS,
  toggleSlot,
  selectSlot,
  buttons: Array.from({ length: ROWS }, (_, row) => Array.from({ length: LEVELS }, (_, level) =>
    FOLDER_LEVELS.includes(level) ? [toggleSlot(row, level), selectSlot(row, level)] : [selectSlot(row, level)])).flat(2),
  init: () => ({ expanded: ["worlds"], selected: null }),
  render: (state) => {
    const rows = visible(state);
    const selected = state.selected ? byId[state.selected] : null;
    const names = {
      [SLOTS.selected]: "none",
      [SLOTS.picked]: selected ? `Selected: ${selected.name}` : "Nothing selected",
      [SLOTS.path]: selected ? `Path: ${[...ancestors(selected), selected].map((node) => node.name).join(" / ")}` : "Path: none",
      [SLOTS.count]: `Showing ${rows.length} of ${NODES.length} nodes`,
    };
    for (let r = 0; r < ROWS; r++) {
      const node = rows[r];
      const level = node ? depth(node) : -1;
      names[SLOTS.key + r] = node ? `L${level}${mark(state, node)}` : "none";
      names[SLOTS.level + r] = node ? `L${level}` : "none";
      for (let l = 0; l < LEVELS; l++) names[SLOTS.text + r * LEVELS + l] = l === level ? `§r${node.name}` : "";
      if (node && node.id === state.selected) names[SLOTS.selected] = `r${r}`;
    }
    return names;
  },
  press: (state, slot) => {
    const local = slot - SLOTS.button;
    const row = Math.floor(local / (LEVELS * 2));
    const level = Math.floor((local % (LEVELS * 2)) / 2);
    const isToggle = local % 2 === 0;
    const node = visible(state)[row];
    if (!node || depth(node) !== level) return "no node there";
    if (isToggle && children(node.id).length > 0) {
      if (state.expanded.includes(node.id)) {
        state.expanded = state.expanded.filter((id) => id !== node.id);
        if (state.selected && ancestors(byId[state.selected]).includes(node)) state.selected = node.id;
        return `tree ${node.id} collapsed`;
      }
      state.expanded = [...state.expanded, node.id];
      return `tree ${node.id} expanded`;
    }
    state.selected = node.id;
    return `tree selected ${node.id}`;
  },
};
