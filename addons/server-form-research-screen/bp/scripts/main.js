import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.1.0";
const TEST_ITEM = "bwiki:research_screen_test";
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
  "호퍼로 넣은 재료를 걸러 옆 상자에 보냅니다.",
  "전력이 부족하면 작업 속도가 절반으로 줄어듭니다.",
  "같은 블록을 여러 개 이어 붙이면 범위가 넓어집니다.",
  "레드스톤 신호를 받으면 잠시 멈춥니다.",
  "업그레이드 슬롯에 넣은 부품 수만큼 빨라집니다.",
];

function item(i) {
  const matCount = ((i * 5) % MAX_MATS) + 1;
  const rewardCount = ((i * 3) % 4) + 1;
  const sentences = (i % SENTENCES.length) + 1;
  return {
    name: `아이템 ${i + 1}`,
    icon: ICONS[i % ICONS.length],
    done: i % 3 === 0,
    desc: [`아이템 ${i + 1}의 설명입니다.`, ...SENTENCES.slice(0, sentences)].join(" "),
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
  form.button(it.done ? "§a연구 완료" : "§c연구 필요");
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
  form.button(it.done ? "연구 완료됨" : "연구 진행");
}

function openResearch(player, state) {
  const tabs = tabItems(ITEM_COUNT);
  const pageItems = [0, 1].map((t) => tabs[t].slice(state.pages[t] * PAGE_SIZE, (state.pages[t] + 1) * PAGE_SIZE));
  const form = new ActionFormData().title(`ffr:F${"ab"[state.tab]}`).body("연구");

  for (const list of pageItems) {
    for (let k = 0; k < PAGE_SIZE; k++) {
      const i = list[k];
      if (i === undefined) form.button("§r");
      else form.button("§r", item(i).icon);
    }
  }
  form.button(`연구 필요 ${tabs[0].length}`, "textures/items/book_normal");
  form.button(`연구 완료 ${tabs[1].length}`, "textures/items/emerald");
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
      if (i !== undefined) player.sendMessage(`[${PACK_VERSION}] 연구 진행 요청: ${item(i).name}`);
    }
    openResearch(player, state);
  });
}

function open(player) {
  openResearch(player, { tab: 0, pages: [0, 0] });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => open(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:research_screen") open(event.sourceEntity);
});
