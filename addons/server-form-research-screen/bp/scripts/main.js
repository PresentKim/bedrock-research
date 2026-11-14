import { BlockTypes, ItemTypes, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.4.0";
const TEST_ITEM = "bwiki:research_screen_test";
const ITEM_COUNT = 200;
const PAGE_SIZE = 48;

const DETAIL_BASE = 102;
const BLOCK = 20;
const MAX_MATS = 8;
const MAX_REWARDS = 8;
const EMPTY = "§0§e§r";

const ITEM_IDS_VERSION = "26.50";
const SHIFTED_ID_START = 852;
const ENCHANTED = 32768;

const ITEM_IDS = {
  diamond: 306,
  apple: 882,
  iron_ingot: 307,
  gold_ingot: 308,
  emerald: 523,
  bread: 261,
  redstone: 376,
  book: 390,
  hopper: 537,
  coal: 304,
  chest: 54,
  crafting_table: 58,
  grass_block: 2,
  golden_apple: 258,
  diamond_sword: 318,
  writable_book: 521,
};

const ICON_ITEMS = [
  ["diamond"],
  ["apple"],
  ["iron_ingot"],
  ["gold_ingot"],
  ["emerald"],
  ["bread"],
  ["redstone"],
  ["book"],
  ["hopper"],
  ["coal"],
  ["chest"],
  ["crafting_table"],
  ["grass_block"],
  ["golden_apple", true],
  ["diamond_sword", true],
];

let customItemCount;
let icons;

function countCustomItems() {
  const customBlocks = new Set(BlockTypes.getAll().map((t) => t.id).filter((id) => !id.startsWith("minecraft:")));
  return ItemTypes.getAll().filter((t) => !t.id.startsWith("minecraft:") && !customBlocks.has(t.id)).length;
}

function aux(name, enchanted = false) {
  customItemCount ??= countCustomItems();
  const id = ITEM_IDS[name];
  const shifted = id >= SHIFTED_ID_START ? id + customItemCount : id;
  return `aux:${shifted * 65536 + (enchanted ? ENCHANTED : 0)}`;
}

function icon(k) {
  icons ??= ICON_ITEMS.map(([name, enchanted]) => aux(name, enchanted));
  return icons[k % icons.length];
}

const SENTENCES = [
  "Filters the items fed by a hopper and sends them to the chest next to it.",
  "Works at half speed when power runs low.",
  "Placing several of the same block side by side widens the range.",
  "Pauses for a moment when it receives a redstone signal.",
  "Gets faster for each part placed in the upgrade slots.",
];

function item(i) {
  const matCount = ((i * 5) % MAX_MATS) + 1;
  const rewardCount = ((i * 3) % 4) + 1;
  const sentences = (i % SENTENCES.length) + 1;
  return {
    name: `Item ${i + 1}`,
    icon: icon(i),
    done: i % 3 === 0,
    desc: [`Description of item ${i + 1}.`, ...SENTENCES.slice(0, sentences)].join(" "),
    mats: Array.from({ length: matCount }, (_, j) => [icon(i + j + 2), ((i + j) % 16) + 1]),
    rewards: Array.from({ length: rewardCount }, (_, j) => icon(i + j * 3)),
  };
}

function tabItems(count) {
  const tabs = [[], []];
  for (let i = 0; i < count; i++) tabs[item(i).done ? 1 : 0].push(i);
  return tabs;
}

function addDetailBlock(form, i) {
  if (i === undefined) {
    for (let k = 0; k < BLOCK; k++) form.button(EMPTY);
    return;
  }
  const it = item(i);
  form.button(`§c${it.name}`, it.icon);
  form.button(it.done ? "§aResearched" : "§cNot researched");
  form.button(it.desc);
  for (let j = 0; j < MAX_MATS; j++) {
    const m = it.mats[j];
    if (m) form.button(`§f${m[1]}`, m[0]);
    else form.button(EMPTY);
  }
  for (let j = 0; j < MAX_REWARDS; j++) {
    const r = it.rewards[j];
    if (r) form.button("§f+1", r);
    else form.button(EMPTY);
  }
  form.button(it.done ? "Researched" : "Start research");
}

function openResearch(player, state) {
  const tabs = tabItems(ITEM_COUNT);
  const pageItems = [0, 1].map((t) => tabs[t].slice(state.pages[t] * PAGE_SIZE, (state.pages[t] + 1) * PAGE_SIZE));
  const form = new ActionFormData().title(`ffr:F${"ab"[state.tab]}`).body("Research");

  for (const list of pageItems) {
    for (let k = 0; k < PAGE_SIZE; k++) {
      const i = list[k];
      if (i === undefined) form.button("§r");
      else form.button("§r", item(i).icon);
    }
  }
  form.button(`To do ${tabs[0].length}`, aux("writable_book"));
  form.button(`Done ${tabs[1].length}`, aux("emerald"));
  for (let k = 0; k < 4; k++) form.button("§r");
  for (const list of pageItems) for (let k = 0; k < PAGE_SIZE; k++) addDetailBlock(form, list[k]);

  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const s = res.selection;
    if (s >= 98 && s <= 101) {
      const tab = s < 100 ? 0 : 1;
      const last = Math.max(0, Math.ceil(tabs[tab].length / PAGE_SIZE) - 1);
      const step = s % 2 === 0 ? -1 : 1;
      state.pages[tab] = Math.min(last, Math.max(0, state.pages[tab] + step));
      state.tab = tab;
    } else if (s >= DETAIL_BASE && (s - DETAIL_BASE) % BLOCK === BLOCK - 1) {
      const slot = Math.floor((s - DETAIL_BASE) / BLOCK);
      const tab = slot < PAGE_SIZE ? 0 : 1;
      const i = pageItems[tab][slot % PAGE_SIZE];
      state.tab = tab;
      if (i !== undefined) player.sendMessage(`[${PACK_VERSION}] Research requested: ${item(i).name}`);
    }
    openResearch(player, state);
  });
}

const CLIENT_PAGES_PER_TAB = 3;
const CLIENT_SLOTS = 2 * CLIENT_PAGES_PER_TAB * PAGE_SIZE;
const CLIENT_PAGE_LABEL_BASE = CLIENT_SLOTS + 2;
const CLIENT_DETAIL_BASE = CLIENT_PAGE_LABEL_BASE + 2 * CLIENT_PAGES_PER_TAB;

function openClientPages(player, tab) {
  const tabs = tabItems(ITEM_COUNT);
  const slotItems = [];
  for (let t = 0; t < 2; t++) for (let k = 0; k < CLIENT_PAGES_PER_TAB * PAGE_SIZE; k++) slotItems.push(tabs[t][k]);
  const form = new ActionFormData().title(`ffr:G${"ab"[tab]}`).body("Research");

  for (const i of slotItems) {
    if (i === undefined) form.button("§r");
    else form.button("§r", item(i).icon);
  }
  form.button(`To do ${tabs[0].length}`, aux("writable_book"));
  form.button(`Done ${tabs[1].length}`, aux("emerald"));
  for (let t = 0; t < 2; t++) {
    const pages = Math.ceil(tabs[t].length / PAGE_SIZE);
    for (let p = 0; p < CLIENT_PAGES_PER_TAB; p++) form.button(p < pages ? `§f${p + 1}` : EMPTY);
  }
  for (const i of slotItems) addDetailBlock(form, i);

  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const s = res.selection;
    let nextTab = tab;
    if (s >= CLIENT_DETAIL_BASE && (s - CLIENT_DETAIL_BASE) % BLOCK === BLOCK - 1) {
      const slot = Math.floor((s - CLIENT_DETAIL_BASE) / BLOCK);
      const i = slotItems[slot];
      nextTab = slot < CLIENT_SLOTS / 2 ? 0 : 1;
      if (i !== undefined) player.sendMessage(`[${PACK_VERSION}] Research requested: ${item(i).name}`);
    }
    openClientPages(player, nextTab);
  });
}

function open(player) {
  const form = new ActionFormData()
    .title(`Research Screen ${PACK_VERSION}`)
    .body(`Pick how pages change.\nItem icons use numeric item IDs from ${ITEM_IDS_VERSION}. Custom items found: ${(customItemCount ??= countCustomItems())}.`)
    .button("Server pages")
    .button("Client pages");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === 0) openResearch(player, { tab: 0, pages: [0, 0] });
    else openClientPages(player, 0);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => open(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:research_screen") open(event.sourceEntity);
});
