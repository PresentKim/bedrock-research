import { system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:json_ui_claims_test";

const EXPRESSION_INPUTS = [
  "a-b-a", "abab", "5", " x", "-x", "+x", ":x", "1x", "#x", "/x",
  "Info: a", "nancy", "0x12", "§cAB", "가나다", "😀xy", "abcdef", "17", "-7", "4",
  "10", "2147483647", "b", "3", "inf", "x", "<x", "xaxbx",
];

const P5_BUTTONS = ["a", "b", "c", "d", "e", "f"];

function buttonsForm(title, body, texts) {
  const form = new ActionFormData().title(title).body(body);
  for (const text of texts) form.button(text);
  return form;
}

function mixedRowsForm() {
  const form = new ActionFormData().title("§b§wjc:4").body("35 buttons, then 4 labels, 3 dividers, 2 headers");
  for (let i = 0; i < 35; i++) form.button(`b${i}`);
  for (let i = 0; i < 4; i++) form.label(`label ${i}`);
  for (let i = 0; i < 3; i++) form.divider();
  for (let i = 0; i < 2; i++) form.header(`header ${i}`);
  return form;
}

const LIVE_BLOCK = { x: 4, y: -57, z: 4 };
const STAND_PATH = [
  { x: 1.5, y: -60, z: 8.5 },
  { x: 5.5, y: -60, z: 8.5 },
  { x: 9.5, y: -60, z: 8.5 },
  { x: 5.5, y: -60, z: 8.5 },
];

function startLiveChanges(player) {
  const dimension = player.dimension;
  dimension.runCommand("kill @e[type=armor_stand,name=juc_probe]");
  const stand = dimension.spawnEntity("minecraft:armor_stand", STAND_PATH[0]);
  stand.nameTag = "juc_probe";
  let step = 0;
  const id = system.runInterval(() => {
    step++;
    if (step > 30 || !stand.isValid) {
      system.clearRun(id);
      return;
    }
    stand.teleport(STAND_PATH[step % STAND_PATH.length]);
    dimension.getBlock(LIVE_BLOCK)?.setType(step % 2 === 0 ? "minecraft:diamond_block" : "minecraft:air");
  }, 20);
}

const PROBES = [
  { key: "1", label: "P1 expressions", build: () => buttonsForm("§b§wjc:1", "P1 expressions", EXPRESSION_INPUTS) },
  { key: "2", label: "P2 layout", build: () => buttonsForm("§b§wjc:2", "P2 layout", ["show", "hide", "show", "show", ".5", "2", "10", "20"]) },
  { key: "3", label: "P3 files and modifications", build: () => buttonsForm("§b§wjc:3", "P3", []) },
  { key: "4", label: "P4 form controls (44 rows)", build: mixedRowsForm },
  { key: "5", label: "P5 more claims", build: () => buttonsForm("§b§wjc:5", "P5", P5_BUTTONS) },
  { key: "6", label: "Marker: two lines with ~x", build: () => buttonsForm("Marker probe", "first line\nsecond line ~x", ["ok"]) },
  { key: "7", label: "Marker: two lines without marker", build: () => buttonsForm("Marker probe", "first line\nsecond line", ["ok"]) },
  { key: "8", label: "Marker: one line with ~x", build: () => buttonsForm("Marker probe", "one line ~x", ["ok"]) },
  { key: "9", label: "P6 structure renderer", build: () => buttonsForm("§b§wjc:6", "P6", ["ok"]) },
  { key: "r", label: "P6 with moving entity and changing block", build: () => buttonsForm("§b§wjc:6", "P6 live", ["ok"]), after: startLiveChanges },
  { key: "h", label: "HUD under form (title after 3 s)", build: () => buttonsForm("plain", "HUD test", ["ok"]), after: (player) => system.runTimeout(() => player.onScreenDisplay.setTitle("JUC during form"), 60) },
  { key: "s", label: "Small form (3 buttons)", build: () => buttonsForm("§b§wjc:4", "3 buttons", ["s0", "s1", "s2"]) },
  { key: "a", label: "Title formA:x", build: () => buttonsForm("formA:x", "gate test", ["ok"]) },
  { key: "b", label: "Title formB:y", build: () => buttonsForm("formB:y", "gate test", ["ok"]) },
  { key: "c", label: "Title plain", build: () => buttonsForm("plain", "gate test", ["ok"]) },
  {
    key: "m",
    label: "Message form",
    build: () => new MessageFormData().title("Message probe").body("Which screen hosts this?").button1("Yes").button2("No"),
  },];

function openProbe(player, probe) {
  probe.after?.(player);
  probe.build().show(player).then((res) => {
    if (res.cancelationReason === "UserBusy") {
      system.runTimeout(() => openProbe(player, probe), 10);
      return;
    }
    if (res.canceled || res.selection === undefined) return;
    player.sendMessage(`[${PACK_VERSION}] ${probe.label}: selection ${res.selection}.`);
  });
}

function openMenu(player) {
  const form = new ActionFormData().title(`JSON UI Claims ${PACK_VERSION}`).body("Pick a probe window.");
  for (const probe of PROBES) form.button(probe.label);
  form.show(player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    openProbe(player, PROBES[res.selection]);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== TEST_ITEM) return;
  system.run(() => openMenu(event.source));
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id !== "bwiki:json_ui_claims") return;
  const key = event.message.trim().split(/\s+/).pop();
  const probe = PROBES.find((p) => p.key === key);
  if (probe) openProbe(event.sourceEntity, probe);
  else openMenu(event.sourceEntity);
});
