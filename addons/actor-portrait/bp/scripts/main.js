import { system, world } from "@minecraft/server";

const PACK_VERSION = "v1.0.0";
const LAUNCHER = "bwiki:actor_portrait_test";
const TITLE = "apt";
const PORTRAIT_ID = "-4294967295";
const SEND_TICKS = 20;
const STAY_TICKS = 72000;

function heldType(player) {
  return player.getComponent("inventory")?.container?.getItem(player.selectedSlotIndex)?.typeId;
}

const holding = new Set();

system.runInterval(() => {
  if (system.currentTick % SEND_TICKS !== 0) return;
  for (const player of world.getAllPlayers()) {
    if (heldType(player) !== LAUNCHER) {
      if (holding.delete(player.id)) player.onScreenDisplay.clearTitle();
      continue;
    }
    if (!holding.has(player.id)) {
      holding.add(player.id);
      player.onScreenDisplay.setTitle(TITLE, { fadeInDuration: 0, stayDuration: STAY_TICKS, fadeOutDuration: 0 });
    }
    const note = player.id === PORTRAIT_ID ? "portraits show you" : `portraits draw id ${PORTRAIT_ID}, yours is ${player.id}`;
    player.onScreenDisplay.setActionBar(`Actor Portrait ${PACK_VERSION}  ${note}`);
  }
}, 1);
