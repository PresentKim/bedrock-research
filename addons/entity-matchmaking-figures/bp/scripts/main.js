import { ItemStack, system, world } from "@minecraft/server";

const PACK_VERSION = "v1.0.1";
const LAUNCHER = "bwiki:entity_matchmaking_figures";
const BOX = "bwiki:entity_matchmaking_figures_box";
const BOT = "bwiki:entity_matchmaking_figures_bot";
const BOX_TAG = "bwiki_entity_matchmaking_figures";
const BOT_TAG = "bwiki_entity_matchmaking_figures_bot";
const SCREEN_TITLE = "§b§w§m§f";
const SCREEN_MARK = "§8Entity Matchmaking Figures";
const BUTTON_MARK = "§r§m§f§b§r";

const TPS = 20;
const READY_SECONDS = 10;
const START_SECONDS = 4;
const MESSAGE_SECONDS = 4;
const DECLINE_CHANCE = 0.1;
const AFK_CHANCE = 0.05;
const PARTY_CHANCE = 0.15;
const LEAVE_CHANCE_PER_SECOND = 0.025;
const STAY_AFTER_FAIL = 0.85;
const BOT_EMOTE_CHANCE_PER_SECOND = 0.04;
const BOT_LOOK_SECONDS = [1.5, 4];
const BOT_BODY_TURN_CHANCE = 0.4;
const BOT_BODY_YAW_RANGE = 45;
const BOT_HEAD_YAW_RANGE = 50;
const BOT_PITCH_RANGE = 25;
const EMOTE_COOLDOWN_SECONDS = 1.5;
const FIGURE_COLUMNS = 4;
const FIGURES = 8;

const SLOT = { rows: 1, rowSize: 5, title: 21, description: 22, header: 23, timer: 24, estimate: 25, count: 26, feed: 27, footer: 28, primary: 29, secondary: 30, readyBar: 31, primaryLabel: 42, secondaryLabel: 43, figures: 44, figureSize: 3, emotes: 68, emoteLabels: 72 };
const FIGURE_PART = { id: 0, badge: 1, name: 2 };
const ROW_PART = { button: 0, name: 1, subtitle: 2, online: 3, state: 4 };

const EMOTES = [
  { label: "Hi", feed: " waves", selfFeed: " wave", animation: "animation.emf.emote.wave" },
  { label: "Clap", feed: " claps", selfFeed: " clap", animation: "animation.emf.emote.clap" },
  { label: "Jump", feed: " jumps", selfFeed: " jump", animation: "animation.emf.emote.jump" },
  { label: "Nod", feed: " nods", selfFeed: " nod", animation: "animation.emf.emote.nod" },
];

const GAMES = [
  { name: "Sky Duels", mode: "1v1", size: 2, description: "Knock your rival off a floating island.", join: [3, 12], estimate: [5, 15], online: 420 },
  { name: "Bed Rush", mode: "4 teams of 2", size: 8, description: "Guard your bed and break everyone else's.", join: [1.5, 6], estimate: [12, 30], online: 1350 },
  { name: "Parkour Race", mode: "Free for all", size: 6, description: "First to the last checkpoint wins.", join: [3, 10], estimate: [15, 35], online: 260 },
  { name: "Hide and Seek", mode: "2 seekers, 6 hiders", size: 8, description: "Hide as a block or hunt the hiders down.", join: [1, 5], estimate: [12, 30], online: 880 },
];

const BOT_NAMES = [
  "Kiro", "xNova", "PixelPanda", "Mossy", "TurboTaco", "Blaze_09", "Nightowl", "CraftyCat", "Quartzy", "LuckyLlama",
  "Rift", "BeeKeeper", "Sn0wfall", "Dusk", "ToastLord", "ZeroLag", "Mintchip", "Creeperoni", "Vex", "Pebble",
  "Jumpman77", "Sora", "IronMika", "ParrotPal", "Glitchy", "Ember", "Waffle", "Stormy", "Noodle", "Axolotl_Ace",
];

const players = new Map();
const sessions = new Map();
const forming = new Map();
const lobbies = new Set();
const online = GAMES.map((game) => game.online);

const now = () => system.currentTick;
const random = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const seconds = (s) => Math.round(s * TPS);

function clock(ticks) {
  const total = Math.max(0, Math.floor(ticks / TPS));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function stateOf(player) {
  let state = players.get(player.id);
  if (!state) {
    state = { selected: 0, phase: "idle", lobby: undefined, queuedAt: 0, estimate: 0, message: "", messageUntil: 0, emoteReadyAt: 0 };
    players.set(player.id, state);
  }
  return state;
}

function tell(state, message) {
  state.message = message;
  state.messageUntil = now() + seconds(MESSAGE_SECONDS);
}

function freeBotName(lobby) {
  const taken = new Set(lobby.members.map((m) => m.name));
  const free = BOT_NAMES.filter((name) => !taken.has(name));
  return free.length ? pick(free) : `Player${randomInt(100, 999)}`;
}

function addBot(lobby) {
  const member = { name: freeBotName(lobby), playerId: undefined, slim: Math.random() < 0.5, yaw: 0 };
  lookAround(member);
  lobby.members.push(member);
  return member;
}

function feed(lobby, member, text, selfText = text) {
  lobby.feed = { name: member.name, playerId: member.playerId, text, selfText };
}

function bots(lobby) {
  return lobby.members.filter((m) => !m.playerId);
}

function realMembers(lobby) {
  return lobby.members.filter((m) => m.playerId);
}

function scheduleJoin(lobby) {
  lobby.nextJoinAt = now() + seconds(random(...GAMES[lobby.game].join));
}

function createLobby(game) {
  const size = GAMES[game].size;
  const lobby = { game, phase: "forming", members: [], feed: undefined, nextJoinAt: 0 };
  const initial = randomInt(0, Math.max(0, Math.min(size - 2, Math.floor(size * 0.5))));
  for (let k = 0; k < initial; k++) addBot(lobby);
  scheduleJoin(lobby);
  forming.set(game, lobby);
  lobbies.add(lobby);
  return lobby;
}

function dissolve(lobby) {
  lobbies.delete(lobby);
  if (forming.get(lobby.game) === lobby) forming.delete(lobby.game);
}

function joinQueue(player, state) {
  const lobby = forming.get(state.selected) ?? createLobby(state.selected);
  const member = { name: player.name, playerId: player.id };
  lobby.members.push(member);
  feed(lobby, member, " joined the queue");
  const [low, high] = GAMES[state.selected].estimate;
  Object.assign(state, { phase: "queued", lobby, queuedAt: now(), estimate: seconds(randomInt(low, high)) });
  player.playSound("random.orb", { pitch: 1.4 });
}

function leaveLobby(playerId, lobby) {
  const member = lobby.members.find((m) => m.playerId === playerId);
  lobby.members = lobby.members.filter((m) => m !== member);
  if (member) feed(lobby, member, " left the queue");
  if (!realMembers(lobby).length) dissolve(lobby);
}

function cancelQueue(player, state) {
  if (state.lobby) leaveLobby(player.id, state.lobby);
  Object.assign(state, { phase: "idle", lobby: undefined });
  tell(state, "You left the queue.");
  player.playSound("note.bass", { pitch: 0.8 });
}

function forEachReal(lobby, action) {
  for (const member of realMembers(lobby)) {
    const player = world.getEntity(member.playerId);
    const state = players.get(member.playerId);
    if (player && state) action(player, state, member);
  }
}

function startReadyCheck(lobby) {
  forming.delete(lobby.game);
  lobby.phase = "ready";
  lobby.readyEndsAt = now() + seconds(READY_SECONDS);
  lobby.responses = new Map();
  lobby.botPlans = new Map();
  const candidates = bots(lobby);
  const spoiler = candidates.length && Math.random() < DECLINE_CHANCE + AFK_CHANCE ? pick(candidates) : undefined;
  const afk = spoiler && Math.random() < AFK_CHANCE / (DECLINE_CHANCE + AFK_CHANCE);
  for (const bot of candidates) {
    if (bot === spoiler && afk) continue;
    const answer = bot === spoiler ? "declined" : "accepted";
    const delay = bot === spoiler ? random(2, READY_SECONDS - 1) : random(0.6, READY_SECONDS - 2.5);
    lobby.botPlans.set(bot, { answer, at: now() + seconds(delay) });
  }
  feed(lobby, { name: "", playerId: undefined }, "Match found");
  forEachReal(lobby, (player, state) => {
    state.phase = "ready";
    state.barKey = state.barKey === "Ta" ? "Tb" : "Ta";
    player.playSound("random.levelup", { pitch: 1.2 });
  });
}

function respond(lobby, member, answer) {
  lobby.responses.set(member, answer);
  feed(lobby, member, answer === "accepted" ? " accepted" : " declined");
}

function returnToQueue(lobby, kept) {
  const target = forming.get(lobby.game);
  if (!target) {
    Object.assign(lobby, { phase: "forming", members: kept, responses: undefined, botPlans: undefined });
    forming.set(lobby.game, lobby);
    scheduleJoin(lobby);
    if (!realMembers(lobby).length) dissolve(lobby);
    return lobby;
  }
  dissolve(lobby);
  const merged = [...kept, ...target.members];
  const real = merged.filter((m) => m.playerId);
  const room = Math.max(0, GAMES[lobby.game].size - 1 - real.length);
  target.members = [...real, ...merged.filter((m) => !m.playerId).slice(0, room)];
  return target;
}

function failReadyCheck(lobby, timedOut) {
  const kept = [];
  for (const member of lobby.members) {
    const answer = lobby.responses.get(member);
    const state = member.playerId && players.get(member.playerId);
    const player = member.playerId && world.getEntity(member.playerId);
    const dropped = answer === "declined" || (timedOut && !answer);
    if (!dropped) {
      if (state || (!member.playerId && Math.random() < STAY_AFTER_FAIL)) kept.push(member);
      continue;
    }
    if (!state) continue;
    Object.assign(state, { phase: "idle", lobby: undefined });
    tell(state, answer === "declined" ? "You declined the match." : "You missed the ready check.");
    player?.playSound("note.bass", { pitch: 0.6 });
  }
  const target = returnToQueue(lobby, kept);
  feed(target, { name: "", playerId: undefined }, "A player did not accept. Back in the queue");
  forEachReal(target, (player, state) => {
    if (state.phase === "ready" || state.lobby === lobby) {
      Object.assign(state, { phase: "queued", lobby: target });
      tell(state, "A player did not accept. You keep your spot.");
      player.playSound("note.bass", { pitch: 1 });
    }
  });
}

function startMatch(lobby) {
  lobby.phase = "starting";
  lobby.startAt = now() + seconds(START_SECONDS);
  forEachReal(lobby, (player, state) => {
    state.phase = "starting";
    player.playSound("random.orb", { pitch: 0.8 });
  });
}

function finishMatch(lobby) {
  const game = GAMES[lobby.game];
  forEachReal(lobby, (player, state) => {
    Object.assign(state, { phase: "idle", lobby: undefined });
    tell(state, `Mock ${game.name} match is over.`);
    player.sendMessage(`§7[Minigame Lobby] ${game.name}: this is a mock queue, no match was played.`);
  });
  dissolve(lobby);
}

function tickForming(lobby) {
  const game = GAMES[lobby.game];
  const t = now();
  if (t % TPS === 0) {
    const leaving = bots(lobby);
    if (leaving.length && Math.random() < LEAVE_CHANCE_PER_SECOND) {
      const member = pick(leaving);
      lobby.members = lobby.members.filter((m) => m !== member);
      feed(lobby, member, " left the queue");
    }
  }
  if (t >= lobby.nextJoinAt && lobby.members.length < game.size) {
    const room = game.size - lobby.members.length;
    const party = room >= 2 && Math.random() < PARTY_CHANCE ? randomInt(2, Math.min(3, room)) : 1;
    const leader = addBot(lobby);
    for (let k = 1; k < party; k++) addBot(lobby);
    feed(lobby, leader, party > 1 ? `'s party (${party}) joined` : " joined the queue");
    scheduleJoin(lobby);
  }
  if (lobby.members.length >= game.size) startReadyCheck(lobby);
}

function tickReady(lobby) {
  const t = now();
  for (const [bot, plan] of lobby.botPlans) {
    if (t < plan.at) continue;
    lobby.botPlans.delete(bot);
    respond(lobby, bot, plan.answer);
  }
  const answers = [...lobby.responses.values()];
  if (answers.includes("declined")) return failReadyCheck(lobby, false);
  if (t >= lobby.readyEndsAt) return failReadyCheck(lobby, true);
  if (answers.length === lobby.members.length) startMatch(lobby);
}

function tickLobbies() {
  for (const lobby of [...lobbies]) {
    if (!lobbies.has(lobby)) continue;
    if (now() % TPS === 0) {
      botEmotes(lobby);
      botLooks(lobby);
    }
    if (lobby.phase === "forming") tickForming(lobby);
    else if (lobby.phase === "ready") tickReady(lobby);
    else if (lobby.phase === "starting" && now() >= lobby.startAt) finishMatch(lobby);
  }
}

function driftOnline() {
  GAMES.forEach((game, g) => {
    const pull = (game.online - online[g]) * 0.1;
    online[g] = Math.max(12, Math.round(online[g] + pull + random(-0.03, 0.03) * online[g]));
  });
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
  if (!name) return undefined;
  const item = new ItemStack("minecraft:paper");
  item.nameTag = name;
  if (lore) item.setLore(lore);
  return item;
}

const button = () => paper(BUTTON_MARK, [SCREEN_MARK]);

function same(a, b) {
  if (!a || !b) return !a && !b;
  return a.typeId === b.typeId && a.nameTag === b.nameTag && a.getLore().join("|") === b.getLore().join("|");
}

function put(storage, slot, item) {
  if (!same(storage.getItem(slot), item)) storage.setItem(slot, item);
}

function feedLine(lobby, player) {
  const entry = lobby?.feed;
  if (!entry) return "";
  if (!entry.name) return `§8${entry.text}`;
  return entry.playerId === player.id ? `§8You${entry.selfText}` : `§8${entry.name}${entry.text}`;
}

function figureIndexes(size) {
  const first = Math.min(size, FIGURE_COLUMNS);
  const second = size - first;
  const centered = (count, row) => Array.from({ length: count }, (_, k) => row * FIGURE_COLUMNS + Math.floor((FIGURE_COLUMNS - count) / 2) + k);
  return [...centered(first, 0), ...centered(second, 1)];
}

function botEntity(player, session, member) {
  let bot = session.bots.get(member);
  if (bot?.isValid) return bot;
  bot = player.dimension.spawnEntity(BOT, player.location);
  bot.addTag(BOT_TAG);
  if (member.slim) bot.triggerEvent("bwiki:slim");
  applyLook(bot, member);
  session.bots.set(member, bot);
  return bot;
}

function applyLook(bot, member) {
  bot.setProperty("bwiki:yaw", member.yaw);
  bot.setProperty("bwiki:head_yaw", member.headYaw);
  bot.setProperty("bwiki:pitch", member.pitch);
}

function lookAround(member) {
  if (Math.random() < BOT_BODY_TURN_CHANCE) member.yaw = randomInt(-BOT_BODY_YAW_RANGE, BOT_BODY_YAW_RANGE);
  member.headYaw = randomInt(-BOT_HEAD_YAW_RANGE, BOT_HEAD_YAW_RANGE);
  member.pitch = randomInt(-BOT_PITCH_RANGE, BOT_PITCH_RANGE);
  member.nextLookAt = now() + seconds(random(...BOT_LOOK_SECONDS));
}

function botCopies(lobby, member) {
  return realMembers(lobby)
    .map((real) => sessions.get(real.playerId)?.bots.get(member))
    .filter((bot) => bot?.isValid);
}

function botLooks(lobby) {
  for (const member of bots(lobby)) {
    if (now() < member.nextLookAt) continue;
    lookAround(member);
    for (const bot of botCopies(lobby, member)) applyLook(bot, member);
  }
}

function releaseBots(session, keep) {
  for (const [member, bot] of session.bots) {
    if (keep.has(member)) continue;
    if (bot.isValid) bot.remove();
    session.bots.delete(member);
  }
}

function figureCells(player, session, state, game) {
  const lobby = state.phase === "idle" ? undefined : state.lobby;
  const cells = Array.from({ length: FIGURES }, () => ({ id: "", badge: "", name: "" }));
  releaseBots(session, new Set(lobby ? bots(lobby) : []));
  if (!lobby) return cells;
  figureIndexes(game.size).forEach((index, k) => {
    const member = lobby.members[k];
    if (!member) {
      cells[index].badge = "E";
      return;
    }
    const you = member.playerId === player.id;
    const answer = lobby.responses?.get(member);
    const mark = lobby.phase === "starting" || answer === "accepted" ? "A" : answer === "declined" ? "X" : "";
    const id = member.playerId ? `p"${member.playerId}"` : `b"${botEntity(player, session, member).id}"`;
    cells[index] = { id, badge: `${you ? "Y" : "M"}${mark}`, name: you ? "§1You" : `§8${member.name}` };
  });
  return cells;
}

function playEmote(lobby, member, emote) {
  if (member.playerId) {
    world.getEntity(member.playerId)?.playAnimation(emote.animation);
  } else {
    for (const bot of botCopies(lobby, member)) bot.playAnimation(emote.animation);
  }
  feed(lobby, member, emote.feed, emote.selfFeed);
}

function botEmotes(lobby) {
  if (lobby.phase === "ready") return;
  for (const bot of bots(lobby)) {
    if (Math.random() < BOT_EMOTE_CHANCE_PER_SECOND) playEmote(lobby, bot, pick(EMOTES));
  }
}

function memberOf(lobby, player) {
  return lobby?.members.find((m) => m.playerId === player.id);
}

function detail(player, state, game) {
  const lobby = state.lobby;
  const t = now();
  const dots = ".".repeat(1 + (Math.floor(t / 10) % 3));
  if (state.phase === "queued") {
    return {
      header: `Finding match${dots}`,
      timer: clock(t - state.queuedAt),
      estimate: `Estimated ${clock(state.estimate)}`,
      count: `${lobby.members.length} / ${game.size} players`,
      primary: "§4Cancel",
    };
  }
  if (state.phase === "ready") {
    const answered = lobby.responses.has(memberOf(lobby, player));
    const accepted = [...lobby.responses.values()].filter((a) => a === "accepted").length;
    return {
      header: "§2Match found!",
      timer: `${Math.ceil(Math.max(0, lobby.readyEndsAt - t) / TPS)}`,
      estimate: answered ? "Waiting for the other players" : "Accept to join the match",
      count: `${accepted} / ${game.size} accepted`,
      primary: answered ? "" : "§2Accept",
      secondary: answered ? "" : "§4Decline",
      bar: state.barKey,
    };
  }
  if (state.phase === "starting") {
    return {
      header: "§2Match starting",
      timer: `${Math.ceil(Math.max(0, lobby.startAt - t) / TPS)}`,
      estimate: `Sending you to ${game.name}${dots}`,
      count: `${game.size} / ${game.size} accepted`,
    };
  }
  const [low, high] = game.estimate;
  return {
    header: "§8Not in queue",
    timer: "",
    estimate: `Usual wait ${clock(seconds(low))} - ${clock(seconds(high))}`,
    count: `${game.size} players per match`,
    primary: "§2Play",
  };
}

function render(player, session) {
  const storage = inventory(session.box);
  if (!storage) return;
  const state = stateOf(player);
  const t = now();
  const buttons = new Set();
  const putButton = (slot, label, labelSlot) => {
    put(storage, slot, label ? button() : undefined);
    if (labelSlot !== undefined) put(storage, labelSlot, paper(label));
    if (label) buttons.add(slot);
  };
  GAMES.forEach((game, g) => {
    const base = SLOT.rows + g * SLOT.rowSize;
    const queuedHere = state.phase !== "idle" && state.lobby?.game === g;
    putButton(base + ROW_PART.button, game.name);
    put(storage, base + ROW_PART.name, paper(g === state.selected ? `§1${game.name}` : game.name));
    put(storage, base + ROW_PART.subtitle, paper(queuedHere ? `§2In queue ${clock(t - state.queuedAt)}` : `§8${game.mode}`));
    put(storage, base + ROW_PART.online, paper(`§8${thousands(online[g])} playing`));
    put(storage, base + ROW_PART.state, paper(queuedHere ? "Q" : g === state.selected ? "S" : ""));
  });
  const game = GAMES[state.selected];
  const view = detail(player, state, game);
  put(storage, SLOT.title, paper(game.name));
  put(storage, SLOT.description, paper(state.phase === "idle" ? `§8${game.description}` : ""));
  put(storage, SLOT.header, paper(view.header));
  put(storage, SLOT.timer, paper(view.timer && `§1${view.timer}`));
  put(storage, SLOT.estimate, paper(`§8${view.estimate}`));
  put(storage, SLOT.count, paper(`§8${view.count}`));
  put(storage, SLOT.feed, paper(state.phase === "idle" ? "" : feedLine(state.lobby, player)));
  put(storage, SLOT.footer, paper(t < state.messageUntil ? `§6${state.message}` : `§8${PACK_VERSION}`));
  put(storage, SLOT.readyBar, paper(view.bar));
  figureCells(player, session, state, game).forEach((cell, k) => {
    const base = SLOT.figures + k * SLOT.figureSize;
    put(storage, base + FIGURE_PART.id, paper(cell.id));
    put(storage, base + FIGURE_PART.badge, paper(cell.badge));
    put(storage, base + FIGURE_PART.name, paper(cell.name));
  });
  const emotesShown = state.phase === "queued" || state.phase === "starting";
  EMOTES.forEach((emote, e) => putButton(SLOT.emotes + e, emotesShown ? emote.label : "", SLOT.emoteLabels + e));
  putButton(SLOT.primary, view.primary, SLOT.primaryLabel);
  putButton(SLOT.secondary, view.secondary, SLOT.secondaryLabel);
  session.buttons = buttons;
}

function press(player, state, slot) {
  const row = Math.floor((slot - SLOT.rows) / SLOT.rowSize);
  if (slot >= SLOT.rows && slot < SLOT.rows + GAMES.length * SLOT.rowSize) {
    if (state.phase === "idle") state.selected = row;
    else if (row !== state.selected) tell(state, "Leave the queue to switch games.");
    return;
  }
  const member = memberOf(state.lobby, player);
  const emote = EMOTES[slot - SLOT.emotes];
  if (emote && member && now() >= state.emoteReadyAt) {
    state.emoteReadyAt = now() + seconds(EMOTE_COOLDOWN_SECONDS);
    playEmote(state.lobby, member, emote);
  }
  if (slot === SLOT.primary) {
    if (state.phase === "idle") joinQueue(player, state);
    else if (state.phase === "queued") cancelQueue(player, state);
    else if (state.phase === "ready" && member && !state.lobby.responses.has(member)) respond(state.lobby, member, "accepted");
  }
  if (slot === SLOT.secondary && state.phase === "ready" && member && !state.lobby.responses.has(member)) {
    respond(state.lobby, member, "declined");
  }
}

function watch(player, session) {
  const storage = inventory(session.box);
  if (!storage || !session.buttons) return false;
  const pressed = [...session.buttons].find((slot) => !storage.getItem(slot));
  if (pressed === undefined) return false;
  press(player, stateOf(player), pressed);
  return true;
}

function removeStrayBoxes(dimension) {
  const owned = new Set([...sessions.values()].flatMap((s) => [s.box.id, ...[...s.bots.values()].map((bot) => bot.id)]));
  for (const tag of [BOX_TAG, BOT_TAG]) {
    for (const entity of dimension.getEntities({ tags: [tag] })) {
      if (!owned.has(entity.id)) entity.remove();
    }
  }
}

function removeSessionEntities(session) {
  if (session.box.isValid) session.box.remove();
  releaseBots(session, new Set());
}

function followPlayer(player, session) {
  session.box.teleport(spotInFront(player));
  if (now() % 10 !== 0) return;
  for (const bot of session.bots.values()) {
    if (bot.isValid) bot.teleport(player.location);
  }
}

function startSession(player) {
  removeStrayBoxes(player.dimension);
  const box = player.dimension.spawnEntity(BOX, spotInFront(player));
  box.addTag(BOX_TAG);
  box.nameTag = SCREEN_TITLE;
  const session = { box, bots: new Map(), buttons: undefined };
  sessions.set(player.id, session);
  render(player, session);
  return session;
}

function stopSession(player) {
  const session = sessions.get(player.id);
  if (session) removeSessionEntities(session);
  sessions.delete(player.id);
}

function actionBar(player, state) {
  if (state.phase === "idle" || !state.lobby) return;
  const game = GAMES[state.lobby.game];
  const t = now();
  const holding = holdsLauncher(player);
  if (state.phase === "queued") {
    player.onScreenDisplay.setActionBar(`§e${game.name}§r  ${clock(t - state.queuedAt)}  §7${state.lobby.members.length}/${game.size}`);
  } else if (state.phase === "ready") {
    const left = Math.ceil(Math.max(0, state.lobby.readyEndsAt - t) / TPS);
    const answered = state.lobby.responses.has(memberOf(state.lobby, player));
    const hint = answered ? "Waiting for the other players" : holding ? "Tap the screen to accept" : "Hold the Minigame Lobby item and tap to accept";
    player.onScreenDisplay.setActionBar(`§aMatch found! §r${hint} §7(${left})`);
  } else if (state.phase === "starting") {
    player.onScreenDisplay.setActionBar(`§aMatch starting: ${game.name}`);
  }
}

system.runInterval(() => {
  tickLobbies();
  if (now() % (TPS * 3) === 0) driftOnline();
  for (const player of world.getAllPlayers()) {
    const state = stateOf(player);
    if (now() % 10 === 0) actionBar(player, state);
    let session = sessions.get(player.id);
    if (!holdsLauncher(player)) {
      if (session) stopSession(player);
      continue;
    }
    if (!session || !session.box.isValid) {
      if (session) removeSessionEntities(session);
      session = startSession(player);
    }
    followPlayer(player, session);
    if (watch(player, session) || now() % 4 === 0) render(player, session);
  }
}, 1);

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  const item = event.itemStack;
  if (!item?.getLore().includes(SCREEN_MARK)) return;
  const container = inventory(event.player);
  if (container?.getItem(event.slot)?.getLore().includes(SCREEN_MARK)) container.setItem(event.slot);
});

world.afterEvents.playerLeave.subscribe((event) => {
  const state = players.get(event.playerId);
  const lobby = state?.lobby;
  const session = sessions.get(event.playerId);
  if (session) removeSessionEntities(session);
  players.delete(event.playerId);
  sessions.delete(event.playerId);
  if (!lobby || !lobbies.has(lobby)) return;
  if (lobby.phase === "ready") {
    const member = lobby.members.find((m) => m.playerId === event.playerId);
    if (member) lobby.responses.set(member, "declined");
    return;
  }
  leaveLobby(event.playerId, lobby);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  system.run(() => removeStrayBoxes(event.player.dimension));
});
