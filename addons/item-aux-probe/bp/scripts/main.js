import { BlockTypes, ItemTypes, system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:aux_probe_test";
const CELLS = 64;
const RANGES = [840, -1278, -9776];

function customTypes() {
  const blocks = BlockTypes.getAll()
    .map((t) => t.id)
    .filter((id) => !id.startsWith("minecraft:"));
  const blockSet = new Set(blocks);
  const items = ItemTypes.getAll()
    .map((t) => t.id)
    .filter((id) => !id.startsWith("minecraft:") && !blockSet.has(id));
  const blockItems = ItemTypes.getAll()
    .map((t) => t.id)
    .filter((id) => blockSet.has(id));
  return { items, blocks, blockItems };
}

function openScan(player, start) {
  const form = new ActionFormData().title("auxp:scan").body(`Numeric IDs ${start} to ${start + CELLS - 1}`);
  for (let k = 0; k < CELLS; k++) {
    const id = start + k;
    form.button(`${id}`, `aux:${id * 65536}`);
  }
  form.show(player).then(() => openMenu(player));
}

function openStartPicker(player) {
  new ModalFormData()
    .title(`Item Aux Probe ${PACK_VERSION}`)
    .textField("First numeric ID of 64", "for example 852", { defaultValue: "852" })
    .show(player)
    .then((res) => {
      if (res.canceled || !res.formValues) return openMenu(player);
      const start = Number.parseInt(String(res.formValues[0]), 10);
      if (Number.isNaN(start)) return openMenu(player);
      openScan(player, start);
    });
}

function openMenu(player) {
  const { items, blocks, blockItems } = customTypes();
  const body = [
    `Custom items (${items.length}), ItemTypes.getAll() order:`,
    ...items.map((id, i) => `${i + 1}. ${id}`),
    "",
    `Custom blocks (${blocks.length}), BlockTypes.getAll() order:`,
    ...blocks.map((id, i) => `${i + 1}. ${id}`),
    "",
    `Custom block items in ItemTypes.getAll(): ${blockItems.length}`,
  ].join("\n");
  const form = new ActionFormData().title(`Item Aux Probe ${PACK_VERSION}`).body(body);
  for (const start of RANGES) form.button(`IDs ${start} to ${start + CELLS - 1}`);
  form.button("Pick a start ID");
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection < RANGES.length) openScan(player, RANGES[res.selection]);
    else openStartPicker(player);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:aux_probe") openMenu(event.sourceEntity);
});
