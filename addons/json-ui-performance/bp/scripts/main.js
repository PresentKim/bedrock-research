import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:json_ui_performance_test";

const variants = [
  ["A", "long_form 안 팩토리"],
  ["B", "화면 맨 위 팩토리 (기본 팩토리 밖)"],
  ["C", "A + 열 때 크기 애니메이션"],
  ["D", "A + 1초 뒤 크기 애니메이션"],
  ["E", "숨김 시작 + visible 조건 길이(상수)"],
  ["F", "A에서 #title_text 받아오는 줄 뺌"],
  ["G", "F + 팩토리 이름 없음, @ 참조"],
  ["H", "팩토리가 만든 칸 안의 팩토리"],
  ["H2", "H + 안쪽 길이 바인딩 always"],
  ["H3", "H + 안쪽 길이를 바깥 데이터 소스에서"],
  ["H4", "H + 안쪽을 grid로"],
  ["H5", "H + 안쪽에 1초 뒤 크기 애니메이션"],
  ["I", "숨김 시작 + 버튼 목록 길이에 visible 조건"],
];

const lagModes = [
  ["S", "바닐라 버튼 목록만"],
  ["V", "레이아웃 6개 모두 생성, 하나만 보임"],
  ["G", "고른 레이아웃만 생성"],
  ["R", "화면 맨 위 라우터"],
  ["X", "V + 가벼운 버튼 소비자"],
  ["Y", "G + 가벼운 버튼 소비자"],
  ["Z", "R + 가벼운 버튼 소비자"],
  ["A", "V + 글자를 식 없이 원문 그대로"],
  ["B", "V + 글자 바인딩 조건 visible"],
  ["C", "V + 1초 뒤 레이아웃 재배치"],
  ["D", "V를 화면 맨 위 게이트로"],
  ["E", "G를 화면 맨 위 게이트로"],
  ["F", "G + 목록을 grid 대신 팩토리 목록으로"],
  ["H", "G + 글자를 식 없이 원문 그대로"],
  ["K", "R 구조를 long_form 안에 (레이아웃 1 고정)"],
  ["L", "R + 레이아웃에 #visible 바인딩 (레이아웃 1 고정)"],
  ["M", "R + stack_panel 한 겹 (레이아웃 1 고정)"],
  ["N", "R + 팩토리 한 겹 (레이아웃 1 고정)"],
  ["O", "스크롤 없는 라우터, 1.5.0 R (레이아웃 1 고정)"],
  ["P", "팩토리가 스크롤째로 만듦 (레이아웃 1 고정)"],
  ["T", "R + jump_to_bottom_on_update (레이아웃 1 고정)"],
  ["U", "R + 스크롤 영역 자르기 끔 (레이아웃 1 고정)"],
  ["W", "팩토리 없이 스크롤 안에 바로 (레이아웃 1 고정)"],
  ["J", "R + 글자 레이어를 배경 위로 (레이아웃 1 고정)"],
  ["Q", "V + 글자 레이어를 배경 위로"],
  ["I", "G + 글자 레이어를 배경 위로"],
];

const fixedLayoutModes = new Set(["K", "L", "M", "N", "O", "P", "T", "U", "W", "J"]);

const icons = [
  "textures/items/diamond",
  "textures/items/apple",
  "textures/items/iron_ingot",
  "textures/items/gold_ingot",
  "textures/items/emerald",
  "textures/items/bread",
  "textures/items/redstone_dust",
  "textures/items/book_normal",
];

function pad(text, width) {
  return (text + " ".repeat(width)).slice(0, width);
}

function openVariant(player, key) {
  const form = new ActionFormData().title(`dsp:${key}`).body(`변형 ${key}`);
  for (let i = 1; i <= 4; i++) form.button(`${key} 버튼 ${i}`);
  form.show(player).then((res) => {
    if (!res.canceled) openVariantMenu(player);
  });
}

function openVariantMenu(player) {
  const form = new ActionFormData().title("dsp:impl").body(`팩 ${PACK_VERSION}. 구현 테스트: 변형을 고르세요.`);
  for (const [key, desc] of variants) form.button(`${key}: ${desc}`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    openVariant(player, variants[res.selection][0]);
  });
}

function openLag(player, mode, count) {
  const layoutIndex = fixedLayoutModes.has(mode) ? 0 : Math.floor(Math.random() * 6);
  const form = new ActionFormData()
    .title(`lag:${mode}${"abcdef"[layoutIndex]}`)
    .body(`모드 ${mode}, 버튼 ${count}개, 레이아웃 ${layoutIndex + 1}`);
  for (let i = 0; i < count; i++) {
    const text = pad(`Item ${i + 1}`, 12) + pad(`desc line ${i + 1}`, 20) + String((i * 7) % 101);
    form.button(text, icons[i % icons.length]);
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    player.sendMessage(`[${PACK_VERSION}] 모드 ${mode}, ${count}개 중 ${res.selection + 1}번 버튼을 눌렀습니다.`);
    openLagMenu(player, count);
  });
}

function openLagMenu(player, count) {
  const form = new ActionFormData().title("dsp:lagmenu").body(`팩 ${PACK_VERSION}. ${count}개 테스트: 모드를 고르세요.`);
  for (const [mode, desc] of lagModes) form.button(`${mode}: ${desc}`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    openLag(player, lagModes[res.selection][0], count);
  });
}

function openMenu(player) {
  const form = new ActionFormData()
    .title("dsp:menu")
    .body(`팩 ${PACK_VERSION}. 시험을 고르세요.`)
    .button("구현 테스트")
    .button("500개 테스트")
    .button("2000개 테스트");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === 0) openVariantMenu(player);
    if (res.selection === 1) openLagMenu(player, 500);
    if (res.selection === 2) openLagMenu(player, 2000);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:json_ui_performance") openMenu(event.sourceEntity);
});
