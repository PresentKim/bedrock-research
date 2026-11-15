import { ItemStack, system, world } from "@minecraft/server";

const PACK_VERSION = "v1.1.1";
const LAUNCHER = "bwiki:entity_research";
const BOX = "bwiki:entity_research_box";
const BOX_TAG = "bwiki_entity_research";
const DONE_PROPERTY = "bwiki:entity_research_done";
const SCREEN_MARK = "§8Research screen";
const BUTTON_MARK = "§r§e§r§s§b§r";
const SELECTED = "SELECTED";

const PAGE_SIZE = 48;
const RESEARCH_COUNT = 120;
const CELL_BASE = [1, 49];
const PICK_OFFSET = 146;
const TAB_HEAD = [97, 98];
const PAGER = [[99, 100], [101, 102]];
const DETAIL_BASE = [103, 125];
const MATS = 3;
const REWARDS = 11;
const ACTION = 19;
const DONE_NOTE = 20;
const MESSAGE = 21;
const MAX_LINES = 8;

const ICONS = [
  "minecraft:diamond", "minecraft:apple", "minecraft:iron_ingot", "minecraft:gold_ingot", "minecraft:emerald",
  "minecraft:bread", "minecraft:redstone", "minecraft:book", "minecraft:hopper", "minecraft:coal",
  "minecraft:chest", "minecraft:crafting_table", "minecraft:grass_block", "minecraft:golden_apple", "minecraft:diamond_sword",
];
const MATERIALS = [
  "minecraft:iron_ingot", "minecraft:gold_ingot", "minecraft:redstone", "minecraft:coal", "minecraft:emerald",
  "minecraft:diamond", "minecraft:bread", "minecraft:book", "minecraft:apple", "minecraft:paper",
];
const SENTENCES = [
  "Filters the items fed by a hopper and sends them to the chest next to it.",
  "Works at half speed when power runs low.",
  "Placing several of the same block side by side widens the range.",
  "Pauses for a moment when it receives a redstone signal.",
];

const RESEARCH = Array.from({ length: RESEARCH_COUNT }, (_, i) => ({
  name: `Item ${i + 1}`,
  icon: ICONS[i % ICONS.length],
  desc: [`Description of item ${i + 1}.`, SENTENCES[i % SENTENCES.length]].join(" "),
  mats: Array.from({ length: ((i * 5) % 4) + 1 }, (_, j) => [MATERIALS[(i + j * 3) % MATERIALS.length], ((i + j) % 8) + 1]),
  rewards: Array.from({ length: ((i * 3) % 3) + 1 }, (_, j) => [ICONS[(i + j * 4) % ICONS.length], (j % 4) + 1]),
}));

const sessions = new Map();

function inventory(entity) {
  return entity.getComponent("inventory")?.container;
}

function holdsLauncher(player) {
  return inventory(player)?.getItem(player.selectedSlotIndex)?.typeId === LAUNCHER;
}

function spotInFront(player) {
  const view = player.getViewDirection();
  const eye = player.getHeadLocation();
  return { x: eye.x + view.x * 1.2, y: eye.y + view.y * 1.2 - 0.6, z: eye.z + view.z * 1.2 };
}

function label(typeId) {
  return typeId.replace("minecraft:", "").split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function defaultDone() {
  return RESEARCH.map((_, i) => i).filter((i) => i % 3 === 0);
}

function doneSet(player) {
  const stored = player.getDynamicProperty(DONE_PROPERTY);
  return new Set(typeof stored === "string" ? JSON.parse(stored) : defaultDone());
}

function saveDone(player, done) {
  player.setDynamicProperty(DONE_PROPERTY, JSON.stringify([...done]));
}

function stack(typeId, amount = 1, name, lore) {
  const item = new ItemStack(typeId, Math.min(amount, new ItemStack(typeId).maxAmount));
  if (name !== undefined) item.nameTag = name;
  if (lore) item.setLore(lore);
  return item;
}

function buttonItem(state) {
  return stack("minecraft:paper", 1, BUTTON_MARK, state ? [SCREEN_MARK, state] : [SCREEN_MARK]);
}

function same(a, b) {
  if (!a || !b) return !a && !b;
  return a.typeId === b.typeId && a.amount === b.amount && a.nameTag === b.nameTag && a.getLore().join("|") === b.getLore().join("|");
}

function put(storage, slot, item) {
  if (!same(storage.getItem(slot), item)) storage.setItem(slot, item);
}

function lists(player) {
  const done = doneSet(player);
  const all = RESEARCH.map((_, i) => i);
  return [all.filter((i) => !done.has(i)), all.filter((i) => done.has(i))];
}

function pageOf(list, page) {
  return list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
}

function render(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  const tabs = lists(player);
  session.expected = new Map();
  for (let t = 0; t < 2; t++) {
    const last = Math.max(0, Math.ceil(tabs[t].length / PAGE_SIZE) - 1);
    session.pages[t] = Math.min(session.pages[t], last);
    const page = pageOf(tabs[t], session.pages[t]);
    if (!page.includes(session.sel[t])) session.sel[t] = undefined;
    for (let k = 0; k < PAGE_SIZE; k++) {
      const i = page[k];
      const slot = CELL_BASE[t] + k;
      const r = RESEARCH[i];
      put(storage, slot, r ? stack(r.icon, 1, r.name, i === session.sel[t] ? [SCREEN_MARK, SELECTED] : [SCREEN_MARK]) : undefined);
      put(storage, slot + PICK_OFFSET, r ? buttonItem() : undefined);
      if (r) session.expected.set(slot + PICK_OFFSET, { tab: t, research: i });
    }
    put(storage, TAB_HEAD[t], stack(t === 0 ? "minecraft:writable_book" : "minecraft:emerald", 1, `${t === 0 ? "To do" : "Done"} ${tabs[t].length}`));
    for (const [n, slot] of PAGER[t].entries()) {
      put(storage, slot, buttonItem());
      session.expected.set(slot, { tab: t, page: n === 0 ? -1 : 1, last });
    }
    renderDetail(player, storage, session, t);
  }
}

function ready(player, r) {
  const container = inventory(player);
  return !!container && r.mats.every(([id, n]) => count(container, id) >= n);
}

function renderDetail(player, storage, session, t) {
  const base = DETAIL_BASE[t];
  const i = session.sel[t];
  const r = RESEARCH[i];
  const color = t === 0 ? "§c" : "§a";
  put(storage, base, r ? stack(r.icon, 1, `${color}${r.name}`) : undefined);
  put(storage, base + 1, r ? stack("minecraft:paper", 1, t === 0 ? "§cNot researched" : "§aResearched") : undefined);
  put(storage, base + 2, r ? stack("minecraft:paper", 1, r.desc) : undefined);
  for (let j = 0; j < MAX_LINES; j++) {
    const m = r?.mats[j];
    put(storage, base + MATS + j, m ? stack(m[0], m[1]) : undefined);
    const w = r?.rewards[j];
    put(storage, base + REWARDS + j, w ? stack(w[0], w[1]) : undefined);
  }
  put(storage, base + ACTION, r && t === 0 ? buttonItem(ready(player, r) ? "READY" : "WAIT") : undefined);
  if (r && t === 0) session.expected.set(base + ACTION, { tab: 0, start: i });
  put(storage, base + DONE_NOTE, r && t === 1 ? stack("minecraft:paper", 1, "done") : undefined);
  put(storage, base + MESSAGE, session.message[t] ? stack("minecraft:paper", 1, session.message[t]) : undefined);
}

function unmarked(item) {
  return item && !item.getLore().includes(SCREEN_MARK);
}

function count(container, typeId) {
  let total = 0;
  for (let s = 0; s < container.size; s++) {
    const item = container.getItem(s);
    if (item?.typeId === typeId && unmarked(item)) total += item.amount;
  }
  return total;
}

function take(container, typeId, amount) {
  for (let s = 0; s < container.size && amount > 0; s++) {
    const item = container.getItem(s);
    if (item?.typeId !== typeId || !unmarked(item)) continue;
    const used = Math.min(amount, item.amount);
    amount -= used;
    if (used === item.amount) container.setItem(s);
    else {
      item.amount -= used;
      container.setItem(s, item);
    }
  }
}

function startResearch(player, session, i) {
  const r = RESEARCH[i];
  const container = inventory(player);
  const missing = r.mats.filter(([id, n]) => count(container, id) < n);
  if (missing.length) {
    session.message[0] = `Missing ${missing.map(([id, n]) => `${n - count(container, id)} ${label(id)}`).join(", ")}`;
    return;
  }
  for (const [id, n] of r.mats) take(container, id, n);
  for (const [id, n] of r.rewards) {
    const left = container.addItem(new ItemStack(id, n));
    if (left) player.dimension.spawnItem(left, player.location);
  }
  const done = doneSet(player);
  done.add(i);
  saveDone(player, done);
  session.sel[0] = undefined;
  session.message[0] = `Researched ${r.name}.`;
}

function handle(player, session, action) {
  if (action.research !== undefined) {
    session.sel[action.tab] = action.research;
    session.message[action.tab] = "";
  } else if (action.page !== undefined) {
    session.pages[action.tab] = Math.min(action.last, Math.max(0, session.pages[action.tab] + action.page));
    session.sel[action.tab] = undefined;
  } else if (action.start !== undefined) {
    startResearch(player, session, action.start);
  }
}

function watch(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  for (const [slot, action] of session.expected) {
    if (storage.getItem(slot)) continue;
    handle(player, session, action);
    render(player, session);
    return;
  }
}

function startSession(player) {
  for (const box of player.dimension.getEntities({ tags: [BOX_TAG] })) {
    if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
  }
  const box = player.dimension.spawnEntity(BOX, spotInFront(player));
  box.nameTag = "§b§w§r§s";
  box.addTag(BOX_TAG);
  const session = { box, pages: [0, 0], sel: [undefined, undefined], message: ["", ""], expected: new Map() };
  sessions.set(player.id, session);
  render(player, session);
  return session;
}

function stopSession(player) {
  const session = sessions.get(player.id);
  if (session?.box.isValid) session.box.remove();
  sessions.delete(player.id);
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    let session = sessions.get(player.id);
    if (!holdsLauncher(player)) {
      if (session) stopSession(player);
      continue;
    }
    if (!session || !session.box.isValid) session = startSession(player);
    session.box.teleport(spotInFront(player));
    watch(player, session);
    if (system.currentTick % 10 === 0) render(player, session);
  }
}, 1);

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  const item = event.itemStack;
  if (!item || unmarked(item)) return;
  const container = inventory(event.player);
  const current = container?.getItem(event.slot);
  if (current && !unmarked(current)) container.setItem(event.slot);
});

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== LAUNCHER || !event.source.isSneaking) return;
  const player = event.source;
  system.run(() => {
    player.setDynamicProperty(DONE_PROPERTY);
    const container = inventory(player);
    for (const id of MATERIALS) container?.addItem(new ItemStack(id, 64));
    const session = sessions.get(player.id);
    if (session) render(player, session);
    player.sendMessage(`[Research ${PACK_VERSION}] Research reset and test materials added.`);
  });
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  system.run(() => {
    for (const box of event.player.dimension.getEntities({ tags: [BOX_TAG] })) {
      if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
    }
  });
});
