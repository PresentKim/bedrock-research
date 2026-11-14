import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:research_screen_test";
const COUNTS = [100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 10000];
const PAGE_SIZE = 48;
const SELECTED = "§0§s§r";

const MODES = [
  ["S", "바닐라 목록"],
  ["J", "최적화 목록: 팩토리가 스크롤째로 만듦"],
  ["K", "최적화 목록: 숨긴 화면 라우터"],
  ["L", "최적화 목록: 1열 스택 팩토리"],
  ["A", "연구: 탭을 누르면 서버가 폼을 다시 보냄"],
  ["B", "연구: 토글 탭, 탭 안에 내용"],
  ["C", "연구: 토글 탭 + 표시 바인딩"],
  ["D", "연구: 토글 탭, 연 탭만 미리 만들고 다른 탭은 팩토리"],
  ["E", "연구: 탭과 선택 모두 토글, 상세 96개 미리"],
  ["F", "연구: 탭과 선택 모두 토글, 상세는 고를 때"],
];

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

function pad(text, width) {
  return (text + " ".repeat(width)).slice(0, width);
}

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

function openSelectable(player, mode, count, state) {
  const tabs = tabItems(count);
  const pageItems = [0, 1].map((t) => tabs[t].slice(state.pages[t] * PAGE_SIZE, (state.pages[t] + 1) * PAGE_SIZE));
  const form = new ActionFormData().title(`ffr:${mode}${"ab"[state.tab]}`).body("연구");

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
      if (i !== undefined) player.sendMessage(`[${PACK_VERSION}] 연구 진행 요청: ${item(i).name} (모드 ${mode})`);
    }
    openSelectable(player, mode, count, state);
  });
}

function openList(player, mode, count) {
  const form = new ActionFormData().title(`ffr:${mode}`).body(`모드 ${mode}, 버튼 ${count}개`);
  for (let i = 0; i < count; i++) {
    const text = pad(`Item ${i + 1}`, 12) + pad(`desc line ${i + 1}`, 20) + String((i * 7) % 101);
    form.button(text, ICONS[i % ICONS.length]);
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    player.sendMessage(`[${PACK_VERSION}] 모드 ${mode}, ${count}개 중 ${res.selection + 1}번 버튼을 눌렀습니다.`);
    openModeMenu(player, count);
  });
}

function tabItems(count) {
  const tabs = [[], []];
  for (let i = 0; i < count; i++) tabs[item(i).done ? 1 : 0].push(i);
  return tabs;
}

function addPage(form, items, page, sel) {
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  for (let k = 0; k < PAGE_SIZE; k++) {
    const i = pageItems[k];
    if (i === undefined) form.button("§r");
    else form.button(i === sel ? SELECTED : "§r", item(i).icon);
  }
}

function openResearch(player, mode, count, state) {
  const tabs = tabItems(count);
  if (state.sel === undefined) state.sel = tabs[state.tab][state.pages[state.tab] * PAGE_SIZE] ?? 0;
  const sel = item(state.sel);
  const form = new ActionFormData().title(`ffr:${mode}${"ab"[state.tab]}`).body(sel.desc);

  addPage(form, tabs[0], state.pages[0], state.sel);
  addPage(form, tabs[1], state.pages[1], state.sel);
  form.button(`연구 필요 ${tabs[0].length}`, "textures/items/book_normal");
  form.button(`연구 완료 ${tabs[1].length}`, "textures/items/emerald");
  for (let k = 0; k < 4; k++) form.button("§r");
  form.button(`§c${sel.name}`, sel.icon);
  form.button(sel.done ? "§a연구 완료" : "§c연구 필요");
  for (const [icon, n] of sel.mats.slice(0, 3)) form.button(`§f${n}`, icon);
  for (let k = sel.mats.length; k < 3; k++) form.button("§r");
  form.button("§f+1", sel.icon);

  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const s = res.selection;
    if (s < 96) {
      const tab = s < 48 ? 0 : 1;
      const i = tabs[tab][state.pages[tab] * PAGE_SIZE + (s % 48)];
      if (i !== undefined) Object.assign(state, { tab, sel: i });
    } else if (s === 96 || s === 97) {
      state.tab = s - 96;
    } else if (s >= 98 && s <= 101) {
      const tab = s < 100 ? 0 : 1;
      const last = Math.max(0, Math.ceil(tabs[tab].length / PAGE_SIZE) - 1);
      const step = s % 2 === 0 ? -1 : 1;
      state.pages[tab] = Math.min(last, Math.max(0, state.pages[tab] + step));
      state.tab = tab;
    }
    openResearch(player, mode, count, state);
  });
}

function openModeMenu(player, count) {
  const form = new ActionFormData().title(`최종 테스트 ${PACK_VERSION}`).body(`${count}개 테스트: 모드를 고르세요.`);
  for (const [mode, desc] of MODES) form.button(`${mode}: ${desc}`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const mode = MODES[res.selection][0];
    if (["S", "J", "K", "L"].includes(mode)) openList(player, mode, count);
    else if (mode === "E" || mode === "F") openSelectable(player, mode, count, { tab: 0, pages: [0, 0] });
    else openResearch(player, mode, count, { tab: 0, pages: [0, 0], sel: undefined });
  });
}

function openMenu(player) {
  const form = new ActionFormData().title(`최종 테스트 ${PACK_VERSION}`).body("버튼 수를 고르세요.");
  for (const count of COUNTS) form.button(`${count}개 테스트`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    openModeMenu(player, COUNTS[res.selection]);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:research_screen") openMenu(event.sourceEntity);
});
