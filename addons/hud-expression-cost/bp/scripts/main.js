import { system, world } from "@minecraft/server";

const PACK_VERSION = "v1.0.0";
const LAUNCHER = "bwiki:hud_expression_cost_test";
const SLOTS = 64;
const STAY_TICKS = 40;

const MODES = [
  { title: "hxs064", label: "Shared expression, 64 cells" },
  { title: "hxs256", label: "Shared expression, 256 cells" },
  { title: "hxs512", label: "Shared expression, 512 cells" },
  { title: "hxf064", label: "Fixed expressions, 64 cells" },
  { title: "hxf256", label: "Fixed expressions, 256 cells" },
  { title: "hxf512", label: "Fixed expressions, 512 cells" },
  { title: "", label: "Off" },
];

const byteLength = (text) => [...text].reduce((sum, ch) => sum + (ch.codePointAt(0) < 0x80 ? 1 : ch.codePointAt(0) < 0x800 ? 2 : 3), 0);

function itemField(id) {
  return String(id * 65536).padStart(11, "x");
}

function countField(count) {
  const text = count > 1 ? `§f${count}` : "";
  return text + "~".repeat(8 - byteLength(text));
}

function subtitle(tick) {
  const shift = Math.floor(tick / 4);
  let text = "i";
  for (let n = 0; n < SLOTS; n++) text += itemField(1 + ((n + shift) % 40)) + countField(1 + ((n * 7 + shift) % 64));
  return text;
}

function heldType(player) {
  return player.getComponent("inventory")?.container?.getItem(player.selectedSlotIndex)?.typeId;
}

const modeOf = new Map();
const showing = new Set();

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId !== LAUNCHER) return;
  const next = ((modeOf.get(source.id) ?? MODES.length - 1) + 1) % MODES.length;
  modeOf.set(source.id, next);
  source.onScreenDisplay.setActionBar(`HUD Expression Cost ${PACK_VERSION}: ${MODES[next].label}`);
});

system.runInterval(() => {
  const tick = system.currentTick;
  for (const player of world.getAllPlayers()) {
    const mode = MODES[modeOf.get(player.id) ?? MODES.length - 1];
    if (heldType(player) !== LAUNCHER || !mode.title) {
      if (showing.delete(player.id)) player.onScreenDisplay.clearTitle();
      continue;
    }
    showing.add(player.id);
    player.onScreenDisplay.setTitle(`${mode.title}${tick % 10}`, { subtitle: subtitle(tick), fadeInDuration: 0, stayDuration: STAY_TICKS, fadeOutDuration: 0 });
    if (tick % 10 === 0) player.onScreenDisplay.setActionBar(`HUD Expression Cost ${PACK_VERSION}: ${mode.label}, new title every tick`);
  }
}, 1);

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  modeOf.delete(playerId);
  showing.delete(playerId);
});
