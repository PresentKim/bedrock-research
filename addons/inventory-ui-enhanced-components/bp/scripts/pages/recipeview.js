const NAMES = {
  "minecraft:oak_planks": "Oak Planks",
  "minecraft:stick": "Stick",
  "minecraft:coal": "Coal",
  "minecraft:iron_ingot": "Iron Ingot",
};

const P = "minecraft:oak_planks";
const S = "minecraft:stick";
const C = "minecraft:coal";
const I = "minecraft:iron_ingot";

const RECIPES = [
  { name: "Crafting Table", result: "minecraft:crafting_table", count: 1, grid: [P, P, null, P, P, null, null, null, null] },
  { name: "Stick", result: "minecraft:stick", count: 4, grid: [null, P, null, null, P, null, null, null, null] },
  { name: "Torch", result: "minecraft:torch", count: 4, grid: [null, C, null, null, S, null, null, null, null] },
  { name: "Chest", result: "minecraft:chest", count: 1, grid: [P, P, P, P, null, P, P, P, P] },
  { name: "Iron Pickaxe", result: "minecraft:iron_pickaxe", count: 1, grid: [I, I, I, null, S, null, null, S, null] },
];

const SLOT = { prev: 0, next: 1, grid: 10, result: 19, name: 20, uses: 21, index: 22 };

function uses(grid) {
  const counts = new Map();
  for (const id of grid) if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  return `Uses ${[...counts].map(([id, n]) => `${n} ${NAMES[id]}`).join(", ")}`;
}

export const page = {
  key: "recipeview",
  title: "RecipeView",
  slots: SLOT,
  buttons: [SLOT.prev, SLOT.next],
  init: () => ({ index: 0 }),
  render: (state) => {
    const recipe = RECIPES[state.index];
    const names = {
      [SLOT.result]: { item: recipe.result, count: recipe.count },
      [SLOT.name]: recipe.name,
      [SLOT.uses]: uses(recipe.grid),
      [SLOT.index]: `Recipe ${state.index + 1} of ${RECIPES.length}`,
    };
    recipe.grid.forEach((id, k) => {
      names[SLOT.grid + k] = id ? { item: id, count: 1 } : "";
    });
    return names;
  },
  press: (state, slot) => {
    const n = RECIPES.length;
    state.index = (state.index + (slot === SLOT.next ? 1 : -1) + n) % n;
    return `recipe ${RECIPES[state.index].name}`;
  },
};
