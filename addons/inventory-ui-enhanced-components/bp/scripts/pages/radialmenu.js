const ITEMS = ["Sword", "Bow", "Shield", "Food", "Torch", "Map", "Pickaxe", "Bucket"];
const SLOT = { item: 0, chosen: 10, chosenText: 11 };

export const page = {
  key: "radialmenu",
  title: "RadialMenu",
  items: ITEMS,
  slots: SLOT,
  buttons: ITEMS.map((_, k) => SLOT.item + k),
  init: () => ({ chosen: -1 }),
  render: (s) => ({
    [SLOT.chosen]: s.chosen < 0 ? "" : ITEMS[s.chosen],
    [SLOT.chosenText]: s.chosen < 0 ? "Nothing picked yet" : `Picked ${ITEMS[s.chosen]}, index ${s.chosen}`,
  }),
  press: (s, slot) => {
    s.chosen = slot - SLOT.item;
    return `radial ${ITEMS[s.chosen]}`;
  },
};
