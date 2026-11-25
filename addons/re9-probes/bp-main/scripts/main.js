import { system, world, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

function firstPlayer() {
  return world.getAllPlayers()[0];
}

function aheadOf(player, distance) {
  const loc = player.location;
  const dir = player.getViewDirection();
  return { x: loc.x + dir.x * distance, y: loc.y, z: loc.z + dir.z * distance };
}

const handlers = {
  "re9:chest": (player, message) => {
    const item = new ItemStack("minecraft:chest", 2);
    item.nameTag = message || "RE9Box";
    player.getComponent("minecraft:inventory").container.addItem(item);
    return "named chest given";
  },
  "re9:boat": (player) => {
    const boat = player.dimension.spawnEntity("minecraft:chest_boat", aheadOf(player, 2));
    boat.nameTag = "RE9Boat";
    return `boat ${boat.id}`;
  },
  "re9:donkey": (player) => {
    const donkey = player.dimension.spawnEntity("minecraft:donkey", aheadOf(player, 3));
    donkey.nameTag = "RE9Donkey";
    const tame = donkey.getComponent("minecraft:tamemount");
    const tamed = tame ? tame.tameToPlayer(false, player) : "no tamemount";
    system.runTimeout(() => donkey.triggerEvent("minecraft:on_chest"), 5);
    return `donkey ${donkey.id} tamed=${tamed}`;
  },
  "re9:form": (player) => {
    new ActionFormData()
      .title("RE9F")
      .body("re9 form body")
      .button("one")
      .button("two")
      .show(player)
      .then((r) => console.warn(`RE9 form closed selection=${r.selection} canceled=${r.canceled}`));
    return "form shown";
  },
  "re9:spam": (player, message) => {
    const count = Number(message) || 60;
    for (let i = 0; i < count; i++) world.sendMessage(`re9 line ${i}`);
    return `spam ${count}`;
  },
};

system.afterEvents.scriptEventReceive.subscribe((event) => {
  const handler = handlers[event.id];
  if (!handler) return;
  const player = event.sourceEntity ?? firstPlayer();
  try {
    console.warn(`RE9 ${event.id} ${handler(player, event.message)}`);
  } catch (e) {
    console.warn(`RE9 ${event.id} error ${e}`);
  }
});
