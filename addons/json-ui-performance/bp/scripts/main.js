import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.2.0";
const TEST_ITEM = "bwiki:json_ui_performance_test";
const COUNTS = [100, 500, 1000, 2000];

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

function openList(player, count) {
  const form = new ActionFormData().title("ffr:J").body(`${count} buttons`);
  for (let i = 0; i < count; i++) {
    const text = pad(`Item ${i + 1}`, 12) + pad(`desc line ${i + 1}`, 20) + String((i * 7) % 101);
    form.button(text, ICONS[i % ICONS.length]);
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    player.sendMessage(`[${PACK_VERSION}] Pressed button ${res.selection + 1} of ${count}.`);
    openMenu(player);
  });
}

function openMenu(player) {
  const form = new ActionFormData().title(`JSON UI Optimization ${PACK_VERSION}`).body("Pick the number of buttons.");
  for (const count of COUNTS) form.button(`${count} buttons`);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    openList(player, COUNTS[res.selection]);
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
