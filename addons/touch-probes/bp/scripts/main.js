import { ItemStack, system, world } from "@minecraft/server";
import { ActionFormData, uiManager } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:touch_probes";
const FIGURE = "bwiki:tp_figure";
const FIGURE_EVENTS = [undefined, "c1", "c2", "c3", "c4"];

function closeLater(player, ticks) {
  system.runTimeout(() => {
    if (player.isValid) uiManager.closeAllForms(player);
  }, ticks);
}

function show(player, form, closeTicks) {
  if (closeTicks) closeLater(player, closeTicks);
  form.show(player).catch(() => {});
}

function keysForm(key) {
  return new ActionFormData().title(`§b§wtp:${key}`).body("keys").button("close");
}

function summonFigures(player) {
  const dimension = player.dimension;
  for (const old of dimension.getEntities({ type: FIGURE })) old.remove();
  const base = player.location;
  return FIGURE_EVENTS.map((event, i) => {
    const location = { x: base.x - 4 + i * 2, y: base.y, z: base.z - 4 };
    const figure = dimension.spawnEntity(FIGURE, location);
    if (event) figure.triggerEvent(event);
    return figure;
  });
}

function openPortrait(player) {
  const figures = summonFigures(player);
  system.runTimeout(() => {
    const form = new ActionFormData().title("§b§wtp:p").body("portrait");
    for (const figure of figures) form.button(figure.id);
    show(player, form, 600);
  }, 20);
}

const BOX = "bwiki:tp_box";
const BOX_ITEMS = ["minecraft:apple", "minecraft:bread", "minecraft:diamond", "minecraft:stick", "minecraft:arrow"];

function openChestProbe(player, title = "§b§wtp:c") {
  const dimension = player.dimension;
  for (const old of dimension.getEntities({ type: BOX })) old.remove();
  const view = player.getViewDirection();
  const length = Math.hypot(view.x, view.z) || 1;
  const base = player.location;
  const box = dimension.spawnEntity(BOX, { x: base.x + (view.x / length) * 2.5, y: base.y, z: base.z + (view.z / length) * 2.5 });
  box.nameTag = title;
  const container = box.getComponent("minecraft:inventory").container;
  BOX_ITEMS.forEach((id, i) => container.setItem(i, new ItemStack(id, 8)));
  player.sendMessage("Use (right click or tap) the figure in front of you within 60 seconds. It disappears after 60 seconds, which also closes its screen.");
  system.runTimeout(() => {
    if (box.isValid) box.remove();
  }, 1200);
}

const FOCUS_VARIANTS = ["F0 baseline", "F1 precedence -20", "F2 precedence 0/5/10", "F3 hidden decoy"];

const PROBES = [
  { key: "c", label: "Chest screen button mappings", open: (p) => openChestProbe(p) },
  ...FOCUS_VARIANTS.flatMap((name, i) => [
    { key: `f${i}`, label: `Focus ${name}, server form`, open: (p) => system.runTimeout(() => show(p, new ActionFormData().title(`§b§wtp:${i}`).body("focus").button("close"), 400), 40) },
    { key: `g${i}`, label: `Focus ${name}, chest screen`, open: (p) => openChestProbe(p, `§b§wtp:f${i}`) },
  ]),
  { key: "k", label: "Button mappings, consume_event unset", open: (p) => show(p, keysForm("k"), 400) },
  { key: "l", label: "Button mappings, consume_event false", open: (p) => show(p, keysForm("l"), 400) },
  { key: "n", label: "Button mappings, consume_event true", open: (p) => show(p, keysForm("n"), 400) },
  { key: "v", label: "Touch variables", open: (p) => show(p, new ActionFormData().title("§b§wtp:v").body("vars").button("close"), 400) },
  { key: "p", label: "Portrait angle compensation", open: openPortrait },
];

function openMenu(player) {
  const form = new ActionFormData().title("Touch Probes").body(`${PACK_VERSION}\nWindows close by themselves after 20 or 30 seconds.`);
  for (const probe of PROBES) form.button(probe.label);
  form.show(player).then((response) => {
    if (response.canceled || response.selection === undefined) return;
    system.runTimeout(() => PROBES[response.selection].open(player), 10);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId === TEST_ITEM) openMenu(event.source);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id !== "bwiki:touch_probes") return;
  const probe = PROBES.find((p) => p.key === event.message.trim());
  if (probe) probe.open(event.sourceEntity);
  else openMenu(event.sourceEntity);
});
