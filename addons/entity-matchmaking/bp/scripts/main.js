import { ItemStack, system, world } from "@minecraft/server";

const PACK_VERSION = "v1.1.1";
const LAUNCHER = "bwiki:entity_matchmaking";
const BOX = "bwiki:entity_matchmaking_box";
const SCREEN_TITLE = "§b§w§m§m";
const BOX_TAG = "bwiki_entity_matchmaking";
const BUTTON_MARK = "§r§m§m§b§r";
const CANCEL_SLOT = 26;
const PLAYER_SLOTS = [6, 7, 8, 9, 10, 11, 12, 13];
const MODES = [
  { id: "duel", label: "Duel", size: 2, slot: 20 },
  { id: "squad", label: "Squad", size: 4, slot: 21 },
  { id: "party", label: "Party", size: 8, slot: 22 },
];
const BUTTON_SLOTS = [...MODES.map((m) => m.slot), CANCEL_SLOT];
const BOT_NAMES = ["Alex", "Kai", "Noor", "Sunny", "Makena", "Zuri", "Efe", "Ari", "Tom", "Jin", "Lia"];
const FOUND_SECONDS = 2;
const COUNTDOWN = 3;

const sessions = new Map();
const queues = new Map();
const queuedMode = new Map();

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

function data(name) {
  const item = new ItemStack("minecraft:paper");
  item.nameTag = name;
  return item;
}

function entry(name, typeId) {
  const item = new ItemStack(typeId);
  item.nameTag = name;
  return item;
}

function buttonItem() {
  const item = new ItemStack("minecraft:paper");
  item.nameTag = BUTTON_MARK;
  return item;
}

function clock(ticks) {
  const seconds = Math.floor(ticks / 20);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function realPlayers(queue) {
  return queue.entries.filter((e) => e.playerId);
}

function statusOf(queue) {
  if (!queue) return "Idle: pick a mode";
  if (queue.state === "found") return "Match found";
  if (queue.state === "starting") return `Starting in ${queue.timer}`;
  return "Searching" + ".".repeat(1 + (Math.floor(system.currentTick / 20) % 3));
}

function put(storage, slot, item) {
  const current = storage.getItem(slot);
  if (current?.typeId === item?.typeId && current?.nameTag === item?.nameTag) return;
  storage.setItem(slot, item);
}

function render(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  const queue = queues.get(queuedMode.get(player.id));
  const mode = queue && MODES.find((m) => m.id === queue.mode);
  put(storage, 1, data(statusOf(queue)));
  put(storage, 2, data(mode ? `Mode: ${mode.label} (${mode.size} players)` : "Mode: none"));
  put(storage, 3, data(mode ? `${queue.entries.length} / ${mode.size} players` : "Not in a queue"));
  put(storage, 4, data(String(mode ? Math.round((queue.entries.length / mode.size) * 10) : 0)));
  put(storage, 5, data(queue ? `Waiting ${clock(system.currentTick - queue.since)}` : "Waiting 0:00"));
  PLAYER_SLOTS.forEach((slot, k) => {
    const e = queue?.entries[k];
    put(storage, slot, e ? entry(e.name, e.playerId ? "minecraft:player_head" : "minecraft:zombie_head") : undefined);
  });
  for (const slot of BUTTON_SLOTS) {
    if (storage.getItem(slot)?.nameTag !== BUTTON_MARK) storage.setItem(slot, buttonItem());
  }
}

function startSession(player) {
  for (const box of player.dimension.getEntities({ tags: [BOX_TAG] })) {
    if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
  }
  const box = player.dimension.spawnEntity(BOX, spotInFront(player));
  box.addTag(BOX_TAG);
  box.nameTag = SCREEN_TITLE;
  const session = { box };
  sessions.set(player.id, session);
  render(player, session);
  return session;
}

function stopSession(player) {
  const session = sessions.get(player.id);
  if (session?.box.isValid) session.box.remove();
  sessions.delete(player.id);
}

function join(player, mode) {
  if (queuedMode.has(player.id)) return;
  let queue = queues.get(mode.id);
  if (!queue) {
    queue = { mode: mode.id, size: mode.size, entries: [], since: system.currentTick, state: "searching", timer: 0 };
    queues.set(mode.id, queue);
  }
  if (queue.state !== "searching") return;
  queue.entries.push({ name: player.name, playerId: player.id });
  queuedMode.set(player.id, mode.id);
}

function leave(player) {
  const modeId = queuedMode.get(player.id);
  const queue = queues.get(modeId);
  queuedMode.delete(player.id);
  if (!queue || queue.state !== "searching") return;
  queue.entries = queue.entries.filter((e) => e.playerId !== player.id);
  if (realPlayers(queue).length === 0) queues.delete(modeId);
}

function startMatch(queue) {
  const mode = MODES.find((m) => m.id === queue.mode);
  const names = queue.entries.map((e) => e.name).join(", ");
  for (const e of realPlayers(queue)) {
    queuedMode.delete(e.playerId);
    const player = world.getEntity(e.playerId);
    if (!player) continue;
    stopSession(player);
    player.sendMessage(`[Matchmaking] ${mode.label} match started: ${names}`);
  }
  queues.delete(queue.mode);
}

function stepQueue(queue) {
  if (queue.state === "searching") {
    if (queue.entries.length < queue.size && Math.random() < 0.45) {
      const taken = new Set(queue.entries.map((e) => e.name));
      const name = BOT_NAMES.find((n) => !taken.has(n));
      if (name) queue.entries.push({ name });
    }
    if (queue.entries.length >= queue.size) {
      queue.state = "found";
      queue.timer = FOUND_SECONDS;
    }
    return;
  }
  queue.timer -= 1;
  if (queue.timer > 0) return;
  if (queue.state === "found") {
    queue.state = "starting";
    queue.timer = COUNTDOWN;
    return;
  }
  startMatch(queue);
}

function watchButtons(player, session) {
  const storage = inventory(session.box);
  if (!storage) return false;
  let pressed = false;
  for (const slot of BUTTON_SLOTS) {
    if (storage.getItem(slot)?.nameTag === BUTTON_MARK) continue;
    pressed = true;
    if (slot === CANCEL_SLOT) leave(player);
    else join(player, MODES.find((m) => m.slot === slot));
  }
  return pressed;
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
    if (system.currentTick % 2 === 0 && watchButtons(player, session)) render(player, session);
  }
}, 1);

system.runInterval(() => {
  for (const queue of [...queues.values()]) stepQueue(queue);
  for (const player of world.getAllPlayers()) {
    const session = sessions.get(player.id);
    if (session?.box.isValid) render(player, session);
  }
}, 20);

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  if (event.itemStack?.nameTag !== BUTTON_MARK) return;
  const container = inventory(event.player);
  if (container?.getItem(event.slot)?.nameTag === BUTTON_MARK) container.setItem(event.slot);
});

world.afterEvents.playerLeave.subscribe((event) => {
  const modeId = queuedMode.get(event.playerId);
  const queue = queues.get(modeId);
  queuedMode.delete(event.playerId);
  sessions.delete(event.playerId);
  if (!queue) return;
  queue.entries = queue.entries.filter((e) => e.playerId !== event.playerId);
  if (realPlayers(queue).length === 0) queues.delete(modeId);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  system.run(() => {
    for (const box of event.player.dimension.getEntities({ tags: [BOX_TAG] })) {
      if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
    }
    event.player.sendMessage(`[Matchmaking ${PACK_VERSION}] Hold the Matchmaking item and tap the middle of the screen.`);
  });
});
