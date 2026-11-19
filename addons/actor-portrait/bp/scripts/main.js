import { system, world } from "@minecraft/server";

const PACK_VERSION = "v1.1.0";
const LAUNCHER = "bwiki:actor_portrait_test";
const TITLE = "apt";
const SHOWN = "apt:shown";
const SEND_TICKS = 20;
const STAY_TICKS = 72000;
const ID_STEP = 4294967296n;
const MAX_CANDIDATE = 32n;

function heldType(player) {
  return player.getComponent("inventory")?.container?.getItem(player.selectedSlotIndex)?.typeId;
}

function isCandidate(id) {
  const step = 1n - BigInt(id);
  return step % ID_STEP === 0n && step / ID_STEP >= 1n && step / ID_STEP <= MAX_CANDIDATE;
}

function hide(player) {
  player.setDynamicProperty(SHOWN, undefined);
  player.runCommand("title @s clear");
}

function show(player) {
  player.setDynamicProperty(SHOWN, true);
  player.onScreenDisplay.setTitle(TITLE, { subtitle: player.id, fadeInDuration: 0, stayDuration: STAY_TICKS, fadeOutDuration: 0 });
}

system.runInterval(() => {
  if (system.currentTick % SEND_TICKS !== 0) return;
  for (const player of world.getAllPlayers()) {
    const shown = player.getDynamicProperty(SHOWN) === true;
    if (heldType(player) !== LAUNCHER) {
      if (shown) hide(player);
      continue;
    }
    if (!shown) show(player);
    const note = isCandidate(player.id) ? "portraits show you" : `your id ${player.id} is not in the portrait list`;
    player.onScreenDisplay.setActionBar(`Actor Portrait ${PACK_VERSION}  ${note}`);
  }
}, 1);
