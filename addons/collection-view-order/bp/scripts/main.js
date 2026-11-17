import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.1.0";
const TEST_ITEM = "bwiki:collection_view_order_test";
const COUNTS = [100, 2000, 5000, 10000, 20000];
const MODES = [
  { title: "§b§wcv:A", label: "A: collection then view, always" },
  { title: "§b§wcv:V", label: "V: collection then view, no always" },
];

const ICONS = [
  "textures/items/diamond",
  "textures/items/apple",
  "textures/items/iron_ingot",
  "textures/items/gold_ingot",
  "textures/items/emerald",
];

function pad(text, width) {
  return (text + " ".repeat(width)).slice(0, width);
}

function openList(player, mode, count) {
  const form = new ActionFormData().title(mode.title).body(`${count} buttons`);
  for (let i = 0; i < count; i++) {
    const text = pad(`Item ${i + 1}`, 12) + pad(`desc line ${i + 1}`, 20) + String((i * 7) % 101);
    form.button(text, ICONS[i % ICONS.length]);
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    player.sendMessage(`[${PACK_VERSION}] ${mode.label}: pressed button ${res.selection + 1} of ${count}.`);
    openMenu(player);
  });
}

function openMenu(player) {
  const form = new ActionFormData().title(`Collection View Order ${PACK_VERSION}`).body("Pick a binding style and a button count.");
  const choices = [];
  for (const mode of MODES) {
    for (const count of COUNTS) {
      choices.push({ mode, count });
      form.button(`${mode.label}, ${count} buttons`);
    }
  }
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    const choice = choices[res.selection];
    openList(player, choice.mode, choice.count);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:collection_view_order") openMenu(event.sourceEntity);
});
