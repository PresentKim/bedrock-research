import { EnchantmentTypes, ItemLockMode, ItemStack, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:item_icon_slots_test";
const MARK = "§r§a§b§c§r";
const ENTITY_TAG = "bwiki_item_icon_slots";
const BACKUP_PROPERTY = "bwiki:item_icon_slots_backup";
const HUD_TICKS = 200;
const BACKUP_TICKS = 100;
const SIX_SLOTS = [9, 10, 11, 12, 13, 14];
const ONE_SLOT = 17;
const BUNDLE_SLOT = 8;
const SIX_ITEMS = [
  "minecraft:diamond",
  "minecraft:chest",
  "minecraft:golden_apple",
  "minecraft:netherite_sword",
  "bwiki:item_icon_slots_red",
  "bwiki:item_icon_slots_blue",
];
const STACKABLE = [
  "minecraft:diamond",
  "minecraft:chest",
  "minecraft:golden_apple",
  "bwiki:item_icon_slots_red",
  "bwiki:item_icon_slots_blue",
  "minecraft:iron_ingot",
  "minecraft:bread",
  "minecraft:emerald",
  "minecraft:hopper",
  "minecraft:apple",
  "minecraft:coal",
  "minecraft:gold_ingot",
];
const HELD_ITEMS = ["minecraft:diamond", "minecraft:chest", "bwiki:item_icon_slots_red"];

const backups = new Map();

function inventory(player) {
  return player.getComponent("inventory")?.container;
}

function display(typeId, amount = 1) {
  const item = new ItemStack(typeId, amount);
  item.lockMode = ItemLockMode.slot;
  item.keepOnDeath = true;
  item.nameTag = MARK;
  return item;
}

function clearDisplay(player, slot) {
  const container = inventory(player);
  if (container?.getItem(slot)?.nameTag === MARK) container.setItem(slot);
}

function title(player, text, stayDuration = HUD_TICKS) {
  player.onScreenDisplay.setTitle(text, { fadeInDuration: 0, stayDuration, fadeOutDuration: 0 });
}

function requireEmpty(player, slots) {
  const container = inventory(player);
  const busy = slots.filter((s) => container?.getItem(s));
  if (busy.length === 0) return true;
  player.sendMessage(`[Item Icon Slots] Empty inventory slots ${busy.join(", ")} first.`);
  return false;
}

function describe(item) {
  if (!item) return null;
  const data = { typeId: item.typeId, amount: item.amount, nameTag: item.nameTag, lore: item.getLore() };
  const durability = item.getComponent("durability");
  if (durability) data.damage = durability.damage;
  const enchantable = item.getComponent("enchantable");
  if (enchantable) data.enchantments = enchantable.getEnchantments().map((e) => ({ id: e.type.id, level: e.level }));
  return data;
}

function rebuild(data) {
  if (!data) return undefined;
  const item = new ItemStack(data.typeId, data.amount);
  if (data.nameTag) item.nameTag = data.nameTag;
  if (data.lore?.length) item.setLore(data.lore);
  const durability = item.getComponent("durability");
  if (durability && data.damage) durability.damage = data.damage;
  const enchantable = item.getComponent("enchantable");
  for (const e of data.enchantments ?? []) {
    const type = EnchantmentTypes.get(e.id);
    if (type && enchantable) enchantable.addEnchantment({ type, level: e.level });
  }
  return item;
}

function restoreBackup(player) {
  const container = inventory(player);
  if (!container) return;
  const saved = backups.get(player.id);
  const stored = player.getDynamicProperty(BACKUP_PROPERTY);
  if (!saved && typeof stored !== "string") return;
  const items = saved ?? JSON.parse(stored).map(rebuild);
  SIX_SLOTS.forEach((slot, k) => {
    clearDisplay(player, slot);
    if (items[k]) container.setItem(slot, items[k]);
  });
  backups.delete(player.id);
  player.setDynamicProperty(BACKUP_PROPERTY);
  if (!saved) player.sendMessage("[Item Icon Slots] Restored slots 9 to 14 from the saved backup.");
}

function cleanup(player) {
  restoreBackup(player);
  for (const slot of [...SIX_SLOTS, ONE_SLOT, BUNDLE_SLOT]) clearDisplay(player, slot);
  for (const e of player.dimension.getEntities({ tags: [ENTITY_TAG] })) e.remove();
}

function trialBackup(player) {
  const container = inventory(player);
  const items = SIX_SLOTS.map((slot) => container.getItem(slot));
  backups.set(player.id, items);
  player.setDynamicProperty(BACKUP_PROPERTY, JSON.stringify(items.map(describe)));
  SIX_SLOTS.forEach((slot, k) => container.setItem(slot, display(SIX_ITEMS[k])));
  system.runTimeout(() => title(player, "ixb:", BACKUP_TICKS), 1);
  system.runTimeout(() => restoreBackup(player), 1 + BACKUP_TICKS);
}

function trialLocked(player, clearAfter) {
  if (!requireEmpty(player, SIX_SLOTS)) return;
  const container = inventory(player);
  SIX_SLOTS.forEach((slot, k) => container.setItem(slot, display(SIX_ITEMS[k])));
  system.runTimeout(() => title(player, "ixl:"), 1);
  system.runTimeout(() => {
    for (const slot of SIX_SLOTS) clearDisplay(player, slot);
  }, 1 + clearAfter);
}

function trialOneSlot(player, prefix, step) {
  if (!requireEmpty(player, [ONE_SLOT])) return;
  const container = inventory(player);
  STACKABLE.forEach((id, k) => {
    system.runTimeout(() => container.setItem(ONE_SLOT, display(id, k + 2)), step * k);
    system.runTimeout(() => title(player, prefix + "a".repeat(k + 1)), step * k + 1);
  });
  system.runTimeout(() => clearDisplay(player, ONE_SLOT), step * STACKABLE.length + 10);
}

function trialBundle(player) {
  if (!requireEmpty(player, [BUNDLE_SLOT])) return;
  const bundle = display("minecraft:bundle");
  const storage = bundle.getComponent("minecraft:inventory")?.container;
  if (!storage) {
    player.sendMessage("[Item Icon Slots] The bundle has no storage container in this version.");
    return;
  }
  storage.addItem(new ItemStack("minecraft:diamond"));
  storage.addItem(new ItemStack("bwiki:item_icon_slots_red"));
  inventory(player).setItem(BUNDLE_SLOT, bundle);
  system.runTimeout(() => title(player, "ixu:"), 1);
  system.runTimeout(() => clearDisplay(player, BUNDLE_SLOT), 1 + HUD_TICKS);
}

function trialFormSlot(player) {
  if (!requireEmpty(player, [ONE_SLOT])) return;
  inventory(player).setItem(ONE_SLOT, display("minecraft:diamond"));
  system.runTimeout(() => {
    new ActionFormData()
      .title("ixf:slot")
      .body("Slot 17 holds a diamond.")
      .button("Done")
      .show(player)
      .then(() => {
        clearDisplay(player, ONE_SLOT);
        openMenu(player);
      });
  }, 1);
}

function spawnHeld(player, kind, typeId, spot) {
  if (kind === "item") return player.dimension.spawnItem(new ItemStack(typeId), spot);
  const type = kind === "holder" ? "bwiki:item_icon_slots_holder" : "minecraft:armor_stand";
  const entity = player.dimension.spawnEntity(type, spot);
  entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${typeId}`);
  if (kind === "invisible") entity.addEffect("invisibility", 20 * 600, { showParticles: false });
  return entity;
}

function trialFormEntities(player) {
  const base = player.location;
  const entities = [];
  const spots = [];
  ["item", "stand", "invisible", "holder"].forEach((kind, row) => {
    HELD_ITEMS.forEach((id, i) => {
      const spot = { x: base.x + (i - 1) * 0.8, y: base.y + 4 + 2 * row, z: base.z };
      const entity = spawnHeld(player, kind, id, spot);
      entity.addTag(ENTITY_TAG);
      entities.push(entity);
      spots.push(spot);
    });
  });
  const hold = system.runInterval(() => entities.forEach((e, i) => e.isValid && e.teleport(spots[i])), 1);
  system.runTimeout(() => {
    const form = new ActionFormData().title("ixf:ent").body("Entities drawn by live_horse_renderer");
    for (const e of entities) form.button(e.id);
    form.button(player.id);
    form.show(player).then(() => {
      system.clearRun(hold);
      for (const e of entities) if (e.isValid) e.remove();
      openMenu(player);
    });
  }, 2);
}

const TRIALS = [
  ["HUD: back up slots 9-14 and fill them", trialBackup],
  ["HUD: 6 empty slots, lock check, clear after 1 tick", (p) => trialLocked(p, 1)],
  ["HUD: 6 empty slots, lock check, clear after 10 ticks", (p) => trialLocked(p, 10)],
  ["HUD: 1 slot, count check, 3 ticks apart", (p) => trialOneSlot(p, "ixc:", 3)],
  ["HUD: 1 slot, count check, 1 tick apart", (p) => trialOneSlot(p, "ixc:", 1)],
  ["HUD: 1 slot, no check, 1 tick apart", (p) => trialOneSlot(p, "ixn:", 1)],
  ["HUD: bundle contents", trialBundle],
  ["Form: read inventory slot 17", trialFormSlot],
  ["Form: entities holding items", trialFormEntities],
];

function openMenu(player) {
  const form = new ActionFormData()
    .title(`Item Icon Slots ${PACK_VERSION}`)
    .body("Pick a test. HUD tests run after this menu closes.");
  for (const [label] of TRIALS) form.button(label);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    cleanup(player);
    TRIALS[res.selection][1](player);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) system.run(() => cleanup(event.player));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:item_icon_slots") openMenu(event.sourceEntity);
});
