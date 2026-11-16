const PRODUCTS = [
  { item: "minecraft:apple", name: "Apple", price: 2 },
  { item: "minecraft:ender_pearl", name: "Ender Pearl", price: 8 },
  { item: "minecraft:diamond", name: "Diamond", price: 25 },
];

const START_BALANCE = 50;
const EARN = 10;
const MAX_QUANTITY = 16;
const SLOT = { minus: 0, plus: 1, buy: 2, earn: 9, icon: 20, quantity: 21, total: 22, balance: 40, coin: 41, message: 42 };
const STRIDE = { button: 3, display: 4 };

const coins = (n) => `${n} coin${n === 1 ? "" : "s"}`;

export const page = {
  key: "shopcard",
  title: "ShopCard",
  products: PRODUCTS,
  slots: SLOT,
  stride: STRIDE,
  buttons: [...PRODUCTS.flatMap((_, k) => [0, 1, 2].map((n) => n + STRIDE.button * k)), SLOT.earn],
  init: () => ({ balance: START_BALANCE, quantity: PRODUCTS.map(() => 1), message: "§7Pick a quantity, then tap Buy" }),
  render: (state) => {
    const names = {
      [SLOT.balance]: `Coins: ${state.balance}`,
      [SLOT.coin]: { item: "minecraft:gold_nugget", count: 1 },
      [SLOT.message]: state.message,
    };
    PRODUCTS.forEach((p, k) => {
      const q = state.quantity[k];
      names[SLOT.icon + STRIDE.display * k] = { item: p.item, count: q };
      names[SLOT.quantity + STRIDE.display * k] = `x${q}`;
      names[SLOT.total + STRIDE.display * k] = `Total: ${coins(q * p.price)}`;
    });
    return names;
  },
  press: (state, slot) => {
    if (slot === SLOT.earn) {
      state.balance += EARN;
      state.message = `§aEarned ${coins(EARN)}`;
      return `balance ${state.balance}`;
    }
    const k = Math.floor(slot / STRIDE.button);
    const action = slot % STRIDE.button;
    const p = PRODUCTS[k];
    const q = state.quantity[k];
    if (action === SLOT.minus || action === SLOT.plus) {
      const next = q + (action === SLOT.plus ? 1 : -1);
      if (next < 1 || next > MAX_QUANTITY) {
        state.message = `§7Quantity stays between 1 and ${MAX_QUANTITY}`;
        return `${p.name} quantity at the end`;
      }
      state.quantity[k] = next;
      return `${p.name} quantity ${next}`;
    }
    const cost = q * p.price;
    if (cost > state.balance) {
      state.message = `§cNot enough coins: ${p.name} x${q} costs ${coins(cost)}, you have ${coins(state.balance)}`;
      return "purchase failed";
    }
    state.balance -= cost;
    state.message = `§aBought ${p.name} x${q} for ${coins(cost)}`;
    return `bought ${p.name} x${q}`;
  },
};
