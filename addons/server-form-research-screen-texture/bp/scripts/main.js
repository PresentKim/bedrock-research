import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.3.3";
const TEST_ITEM = "bwiki:research_screen_texture_test";
const ITEM_COUNT = 200;
const PAGE_SIZE = 48;

const DETAIL_BASE = 102;
const BLOCK = 20;
const MAX_MATS = 8;
const MAX_REWARDS = 8;
const EMPTY = "§0§e§r";

const ICONS = [
  "textures/items/diamond",
  "textures/items/apple",
  "textures/items/iron_ingot",
  "textures/items/gold_ingot",
  "textures/items/emerald",
  "textures/items/bread",
  "textures/items/redstone_dust",
  "textures/items/book_normal",
  "textures/items/hopper",
  "textures/items/coal",
];

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
    icon: ICONS[i % ICONS.length],
    done: i % 3 === 0,
    desc: [`Description of item ${i + 1}.`, ...SENTENCES.slice(0, sentences)].join(" "),
    mats: Array.from({ length: matCount }, (_, j) => [ICONS[(i + j + 2) % ICONS.length], ((i + j) % 16) + 1]),
    rewards: Array.from({ length: rewardCount }, (_, j) => ICONS[(i + j * 3) % ICONS.length]),
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
  form.button(`To do ${tabs[0].length}`, "textures/items/book_normal");
  form.button(`Done ${tabs[1].length}`, "textures/items/emerald");
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
  form.button(`To do ${tabs[0].length}`, "textures/items/book_normal");
  form.button(`Done ${tabs[1].length}`, "textures/items/emerald");
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
    .title(`Research Screen Texture ${PACK_VERSION}`)
    .body("Pick how pages change.")
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
  if (event.id === "bwiki:research_screen_texture") open(event.sourceEntity);
});
