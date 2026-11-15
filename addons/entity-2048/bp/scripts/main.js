import { ItemStack, system, world } from "@minecraft/server";

const PACK_VERSION = "v1.1.0";
const LAUNCHER = "bwiki:entity_2048";
const BOX = "bwiki:entity_2048_box";
const BOX_TAG = "bwiki_entity_2048";
const SCREEN_TITLE = "§b§w§2§0";
const SCREEN_MARK = "§8Entity 2048";
const BUTTON_MARK = "§r§e§r§s§b§r";

const SIZE = 4;
const CELLS = SIZE * SIZE;
const WIN_EXP = 11;
const SLOT = { mover: 1, final: 17, score: 33, status: 34, buttons: 36 };
const BUTTONS = ["U", "D", "L", "R", "New"];

const sessions = new Map();
const games = new Map();

function lines(dir) {
  const result = [];
  for (let a = 0; a < SIZE; a++) {
    const line = [];
    for (let b = 0; b < SIZE; b++) {
      if (dir === "L") line.push(a * SIZE + b);
      if (dir === "R") line.push(a * SIZE + (SIZE - 1 - b));
      if (dir === "U") line.push(b * SIZE + a);
      if (dir === "D") line.push((SIZE - 1 - b) * SIZE + a);
    }
    result.push(line);
  }
  return result;
}

function spawn(board) {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return -1;
  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 1 : 2;
  return index;
}

function canMove(board) {
  for (let i = 0; i < CELLS; i++) {
    if (!board[i]) return true;
    if (i % SIZE < SIZE - 1 && board[i] === board[i + 1]) return true;
    if (i + SIZE < CELLS && board[i] === board[i + SIZE]) return true;
  }
  return false;
}

function newGame() {
  const board = Array(CELLS).fill(0);
  const spawned = [spawn(board), spawn(board)];
  return {
    board,
    score: 0,
    won: false,
    parity: "a",
    previous: Array(CELLS).fill(0),
    movers: Array(CELLS).fill("E"),
    finals: board.map((v, i) => (!v ? "E" : spawned.includes(i) ? "P" : "N")),
  };
}

function move(game, dir) {
  const old = game.board;
  const board = Array(CELLS).fill(0);
  const merged = Array(CELLS).fill(false);
  const movers = Array(CELLS).fill("E");
  let moved = false;
  for (const line of lines(dir)) {
    let next = 0;
    line.forEach((from, k) => {
      const value = old[from];
      if (!value) return;
      const last = line[next - 1];
      let dest;
      if (next > 0 && board[last] === value && !merged[last]) {
        dest = next - 1;
        board[last] = value + 1;
        merged[last] = true;
        game.score += 2 ** (value + 1);
      } else {
        dest = next;
        board[line[dest]] = value;
        next++;
      }
      const distance = k - dest;
      if (distance) moved = true;
      movers[from] = distance ? `${dir}${distance}` : "S0";
    });
  }
  const spawned = moved ? spawn(board) : -1;
  game.previous = old;
  game.board = board;
  game.movers = movers;
  game.finals = board.map((v, i) => (!v ? "E" : i === spawned ? "P" : merged[i] ? "M" : "N"));
  game.parity = game.parity === "a" ? "b" : "a";
  if (board.some((v) => v >= WIN_EXP)) game.won = true;
}

function status(game) {
  if (!canMove(game.board)) return "Game over. Press New.";
  if (game.won) return "You made 2048!";
  return PACK_VERSION;
}

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

function paper(name, lore) {
  const item = new ItemStack("minecraft:paper");
  item.nameTag = name;
  if (lore) item.setLore(lore);
  return item;
}

function same(a, b) {
  if (!a || !b) return !a && !b;
  return a.typeId === b.typeId && a.nameTag === b.nameTag && a.getLore().join("|") === b.getLore().join("|");
}

function put(storage, slot, item) {
  if (!same(storage.getItem(slot), item)) storage.setItem(slot, item);
}

function tile(code, exp, parity) {
  return code === "E" || !exp ? undefined : paper(`${code}${parity}t${exp}`);
}

function render(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  const game = games.get(player.id);
  for (let i = 0; i < CELLS; i++) {
    put(storage, SLOT.mover + i, tile(game.movers[i], game.previous[i], game.parity));
    put(storage, SLOT.final + i, tile(game.finals[i], game.board[i], game.parity));
  }
  put(storage, SLOT.score, paper(`Score ${game.score}`));
  put(storage, SLOT.status, paper(status(game)));
  BUTTONS.forEach((_, k) => put(storage, SLOT.buttons + k, paper(BUTTON_MARK, [SCREEN_MARK])));
}

function watch(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  const pressed = BUTTONS.findIndex((_, k) => !storage.getItem(SLOT.buttons + k));
  if (pressed < 0) return;
  const game = games.get(player.id);
  if (BUTTONS[pressed] === "New") games.set(player.id, { ...newGame(), parity: game.parity === "a" ? "b" : "a" });
  else move(game, BUTTONS[pressed]);
  render(player, session);
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
  if (!games.has(player.id)) games.set(player.id, newGame());
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
  }
}, 1);

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  const item = event.itemStack;
  if (!item?.getLore().includes(SCREEN_MARK)) return;
  const container = inventory(event.player);
  if (container?.getItem(event.slot)?.getLore().includes(SCREEN_MARK)) container.setItem(event.slot);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  system.run(() => {
    for (const box of event.player.dimension.getEntities({ tags: [BOX_TAG] })) {
      if (![...sessions.values()].some((s) => s.box.id === box.id)) box.remove();
    }
  });
});
