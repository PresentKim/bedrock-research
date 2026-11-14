import { ItemLockMode, ItemStack, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.3.0";
const LAUNCHER = "bwiki:entity_menu_lab";
const BOX = "bwiki:entity_menu_lab_box";
const MARKER = "bwiki:entity_menu_lab_marker";
const BOX_TAG = "bwiki_entity_menu_lab";
const BUTTON_MARK = "§r§e§m§l§b§r";
const BUTTON_SLOT = 26;
const LOCK_PREFIX = "Lock ";
const CELL_ITEMS = [
  "minecraft:diamond",
  "minecraft:chest",
  "minecraft:golden_apple",
  "minecraft:netherite_sword",
  "minecraft:grass_block",
  "minecraft:bow",
  "minecraft:emerald",
  "minecraft:totem_of_undying",
];
const COLORS = ["red", "blue", "lime", "yellow"];
const SCREENS = [
  ["menu", "Menu screen (item name and lore checks)"],
  ["lock", "Vanilla chest with lock mode items"],
];
const LOCKS = [
  ["none", ItemLockMode.none],
  ["inventory", ItemLockMode.inventory],
  ["slot", ItemLockMode.slot],
];

const settings = new Map();
const sessions = new Map();

function settingsOf(player) {
  if (!settings.has(player.id)) settings.set(player.id, { screen: "menu" });
  return settings.get(player.id);
}

function say(player, text) {
  player.sendMessage(`[Entity Menu Lab] ${text}`);
}

function inventory(entity) {
  return entity.getComponent("inventory")?.container;
}

function holdsLauncher(player) {
  return inventory(player)?.getItem(player.selectedSlotIndex)?.typeId === LAUNCHER;
}

function named(typeId, name, lore, lock = ItemLockMode.slot, amount = 1) {
  const item = new ItemStack(typeId, amount);
  item.nameTag = name;
  if (lore) item.setLore(lore);
  item.lockMode = lock;
  return item;
}

function data(name, lore) {
  return named("minecraft:paper", name, lore, ItemLockMode.none);
}

function buttonItem() {
  const item = new ItemStack("minecraft:lime_wool");
  item.nameTag = BUTTON_MARK;
  return item;
}

function fillMenu(storage) {
  storage.setItem(0, new ItemStack(MARKER));
  CELL_ITEMS.forEach((id, k) => storage.setItem(k + 1, named(id, `Item ${k + 1}`, [`Line for item ${k + 1}`])));
  storage.setItem(12, data("Pressed 0"));
  storage.setItem(13, data("Tick label", ["Seconds 0"]));
  storage.setItem(14, data("STATE_ON"));
  storage.setItem(15, data(COLORS[0]));
  storage.setItem(16, data("0"));
  storage.setItem(BUTTON_SLOT, buttonItem());
}

function fillLock(storage) {
  LOCKS.forEach(([name, lock], k) => storage.setItem(k, named("minecraft:diamond", LOCK_PREFIX + name, undefined, lock, 5)));
}

function lockSnapshot(storage) {
  return LOCKS.map((_, k) => storage.getItem(k)?.amount ?? 0);
}

function lockedInPlayer(player) {
  const container = inventory(player);
  let count = 0;
  for (let i = 0; i < (container?.size ?? 0); i++) {
    const item = container.getItem(i);
    if (item?.nameTag?.startsWith(LOCK_PREFIX)) count += item.amount;
  }
  const cursor = player.getComponent("cursor_inventory")?.item;
  if (cursor?.nameTag?.startsWith(LOCK_PREFIX)) count += cursor.amount;
  return count;
}

function spotInFront(player) {
  const view = player.getViewDirection();
  const eye = player.getHeadLocation();
  return { x: eye.x + view.x * 1.2, y: eye.y + view.y * 1.2 - 0.6, z: eye.z + view.z * 1.2 };
}

function removeStrayBoxes(player) {
  for (const box of player.dimension.getEntities({ tags: [BOX_TAG] })) {
    if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
  }
}

function startSession(player) {
  removeStrayBoxes(player);
  const s = settingsOf(player);
  const box = player.dimension.spawnEntity(BOX, spotInFront(player));
  box.addTag(BOX_TAG);
  const storage = inventory(box);
  if (s.screen === "menu") fillMenu(storage);
  else fillLock(storage);
  const session = { box, screen: s.screen, presses: 0, seconds: 0, lock: lockSnapshot(storage), held: 0 };
  sessions.set(player.id, session);
  return session;
}

function stopSession(player) {
  const session = sessions.get(player.id);
  if (session?.box.isValid) session.box.remove();
  sessions.delete(player.id);
}

function watchButton(player, session) {
  const storage = inventory(session.box);
  if (storage.getItem(BUTTON_SLOT)?.nameTag === BUTTON_MARK) return;
  session.presses += 1;
  storage.setItem(12, data(`Pressed ${session.presses}`));
  storage.setItem(BUTTON_SLOT, buttonItem());
}

function watchLock(player, session) {
  const now = lockSnapshot(inventory(session.box));
  const held = lockedInPlayer(player);
  now.forEach((amount, k) => {
    if (amount !== session.lock[k]) say(player, `Lock ${LOCKS[k][0]}: ${session.lock[k]} -> ${amount} in the entity.`);
  });
  if (held !== session.held) say(player, `Lock items on you or your cursor: ${held}.`);
  session.lock = now;
  session.held = held;
}

function tickData(session) {
  session.seconds += 1;
  const n = session.seconds;
  const storage = inventory(session.box);
  storage.setItem(13, data("Tick label", [`Seconds ${n}`]));
  storage.setItem(14, data(n % 2 === 0 ? "STATE_ON" : "STATE_OFF"));
  storage.setItem(15, data(COLORS[n % COLORS.length]));
  storage.setItem(16, data(String(n % 11)));
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
    if (system.currentTick % 2 !== 0) continue;
    if (session.screen === "menu") watchButton(player, session);
    else watchLock(player, session);
  }
}, 1);

system.runInterval(() => {
  for (const session of sessions.values()) {
    if (session.screen === "menu" && session.box.isValid) tickData(session);
  }
}, 20);

function openSettings(player) {
  const s = settingsOf(player);
  const session = sessions.get(player.id);
  const lines = [
    `Screen: ${SCREENS.find(([id]) => id === s.screen)[1]}`,
    `Button presses this session: ${session?.presses ?? 0}`,
  ];
  const form = new ActionFormData().title(`Entity Menu Lab ${PACK_VERSION}`).body(lines.join("\n"));
  for (const [, label] of SCREENS) form.button(`Screen: ${label}`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    s.screen = SCREENS[res.selection][0];
    stopSession(player);
    say(player, "Settings saved. The menu entity is spawned again while you hold the item.");
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== LAUNCHER) return;
  const player = event.source;
  if (player.isSneaking) {
    system.run(() => openSettings(player));
    return;
  }
});

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  if (event.itemStack?.nameTag !== BUTTON_MARK) return;
  const container = inventory(event.player);
  if (container?.getItem(event.slot)?.nameTag === BUTTON_MARK) container.setItem(event.slot);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) system.run(() => removeStrayBoxes(event.player));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:entity_menu_lab") openSettings(event.sourceEntity);
});
