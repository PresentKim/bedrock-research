import { ItemStack, system, world } from "@minecraft/server";
import { PAGES } from "./pages/index.js";

const PACK_VERSION = "v1.0.0";
const LAUNCHER = "bwiki:inventory_ui_basic_components_test";
const BOX = "bwiki:inventory_ui_basic_components_box";
const BOX_TAG = "bwiki_inventory_ui_basic_components";
const SCREEN_TITLE = "§b§w§b§c";
const BUTTON_LORE = "§8Inventory UI Basic Components button";
const BUTTON_NAME = "§r§b§c§b§r";
const PAGE_BASE = 10;
const PAGE_SLOTS = 180;
const PICKER_BASE = 190;
const SLOT = { pageKey: 1, pageTitle: 2, status: 3, pickerState: 4, footer: 5, picker: 6, prev: 7, next: 8 };
const FRAME_BUTTONS = [SLOT.picker, SLOT.prev, SLOT.next, ...PAGES.map((_, k) => PICKER_BASE + k)];

const sessions = new Map();

function inventory(entity) {
  return entity.getComponent("inventory")?.container;
}

function heldType(player) {
  return inventory(player)?.getItem(player.selectedSlotIndex)?.typeId;
}

function spotInFront(player) {
  const view = player.getViewDirection();
  const eye = player.getHeadLocation();
  return { x: eye.x + view.x * 1.2, y: eye.y + view.y * 1.2 - 0.6, z: eye.z + view.z * 1.2 };
}

function paper(name, lore) {
  if (name === undefined || name === "") return undefined;
  const item = new ItemStack("minecraft:paper");
  item.nameTag = name;
  if (lore) item.setLore([lore]);
  return item;
}

const buttonItem = () => paper(BUTTON_NAME, BUTTON_LORE);
const isButton = (item) => item?.getLore().includes(BUTTON_LORE);

function put(storage, slot, item) {
  const old = storage.getItem(slot);
  if (!old === !item && old?.typeId === item?.typeId && old?.nameTag === item?.nameTag) return;
  storage.setItem(slot, item);
}

function currentPage(session) {
  return PAGES[session.page];
}

function pageButtons(session) {
  return currentPage(session).buttons.map((n) => PAGE_BASE + n);
}

function showPage(session, index) {
  session.page = (index + PAGES.length) % PAGES.length;
  session.picker = false;
  const storage = inventory(session.box);
  for (let k = 0; k < PAGE_SLOTS; k++) storage.setItem(PAGE_BASE + k);
  for (const slot of pageButtons(session)) storage.setItem(slot, buttonItem());
  const page = currentPage(session);
  session.states[page.key] ??= page.init();
}

function startSession(player) {
  const box = player.dimension.spawnEntity(BOX, spotInFront(player));
  box.addTag(BOX_TAG);
  box.nameTag = SCREEN_TITLE;
  const session = { box, page: 0, picker: false, states: {}, status: "Open a page with Pages or the arrows" };
  const storage = inventory(box);
  for (const slot of FRAME_BUTTONS) storage.setItem(slot, buttonItem());
  showPage(session, 0);
  render(session);
  return session;
}

function log(session, text) {
  session.status = `t${system.currentTick} ${text}`;
}

function pressFrame(session, slot) {
  if (slot === SLOT.picker) session.picker = !session.picker;
  else if (slot === SLOT.prev) showPage(session, session.page - 1);
  else if (slot === SLOT.next) showPage(session, session.page + 1);
  else showPage(session, slot - PICKER_BASE);
}

function watch(player, session) {
  const storage = inventory(session.box);
  for (const slot of FRAME_BUTTONS) {
    if (isButton(storage.getItem(slot))) continue;
    storage.setItem(slot, buttonItem());
    pressFrame(session, slot);
  }
  const page = currentPage(session);
  for (const slot of pageButtons(session)) {
    if (isButton(storage.getItem(slot))) continue;
    storage.setItem(slot, buttonItem());
    const text = page.press(session.states[page.key], slot - PAGE_BASE);
    if (text) log(session, text);
  }
  const own = inventory(player);
  if (own) for (let k = 0; k < own.size; k++) if (isButton(own.getItem(k))) own.setItem(k);
}

function render(session) {
  const storage = inventory(session.box);
  const page = currentPage(session);
  put(storage, SLOT.pageKey, paper(page.key));
  put(storage, SLOT.pageTitle, paper(page.title));
  put(storage, SLOT.status, paper(`§7${session.status}`));
  put(storage, SLOT.pickerState, paper(session.picker ? "open" : "closed"));
  put(storage, SLOT.footer, paper(`§7${PACK_VERSION}  ${session.page + 1}/${PAGES.length}`));
  const values = page.render(session.states[page.key]);
  for (const [local, value] of Object.entries(values)) put(storage, PAGE_BASE + Number(local), paper(value));
}

function stopSession(playerId) {
  const session = sessions.get(playerId);
  if (session?.box.isValid) session.box.remove();
  sessions.delete(playerId);
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    let session = sessions.get(player.id);
    if (session && (heldType(player) !== LAUNCHER || !session.box.isValid)) {
      stopSession(player.id);
      session = undefined;
    }
    if (!session && heldType(player) === LAUNCHER) {
      for (const stray of player.dimension.getEntities({ tags: [BOX_TAG] })) stray.remove();
      session = startSession(player);
      sessions.set(player.id, session);
    }
    if (!session) continue;
    session.box.teleport(spotInFront(player));
    watch(player, session);
    const page = currentPage(session);
    const text = page.tick?.(session.states[page.key]);
    if (text) log(session, text);
    render(session);
  }
}, 1);

world.afterEvents.playerLeave.subscribe(({ playerId }) => stopSession(playerId));
