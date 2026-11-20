import { MolangVariableMap, system, world } from "@minecraft/server";
import { ActionFormData, MessageFormData, uiManager } from "@minecraft/server-ui";

const PACK_VERSION = "v1.0.0";
const TEST_ITEM = "bwiki:json_ui_claims_test";

const EXPRESSION_INPUTS = [
  "a-b-a", "abab", "5", " x", "-x", "+x", ":x", "1x", "#x", "/x",
  "Info: a", "nancy", "0x12", "§cAB", "가나다", "😀xy", "abcdef", "17", "-7", "4",
  "10", "2147483647", "b", "3", "inf", "x", "<x", "xaxbx", "100", "-37",
];

const P5_BUTTONS = ["a", "b", "c", "d", "e", "f", "abcabc", "100"];

const P7_BUTTONS = ["50", "7abc", "a-b-a", "abc|UI|def"];

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

function closeKeysLater(player) {
  system.runTimeout(() => {
    if (player.isValid) uiManager.closeAllForms(player);
  }, 200);
}

const PROBES = [
  { key: "1", label: "P1 expressions", build: () => buttonsForm("§b§wjc:1", "P1 expressions", EXPRESSION_INPUTS) },
  { key: "2", label: "P2 layout", build: () => buttonsForm("§b§wjc:2", "P2 layout", ["show", "hide", "show", "show", ".5", "2", "10", "20"]) },
  { key: "3", label: "P3 files and modifications", build: () => buttonsForm("§b§wjc:3", "P3", []) },
  { key: "4", label: "P4 form controls (44 rows)", build: mixedRowsForm },
  { key: "5", label: "P5 more claims", build: () => buttonsForm("§b§wjc:5", "P5", P5_BUTTONS) },
  { key: "x", label: "P7 literals and lookups", build: () => buttonsForm("§b§wjc:7", "P7", P7_BUTTONS) },
  { key: "k", label: "Button mappings (consume_event unset)", delay: 40, after: closeKeysLater, build: () => buttonsForm("§b§wjc:k", "keys", ["ok"]) },
  { key: "l", label: "Button mappings (consume_event false)", delay: 40, after: closeKeysLater, build: () => buttonsForm("§b§wjc:l", "keys", ["ok"]) },
  { key: "n", label: "Button mappings (consume_event true)", delay: 40, after: closeKeysLater, build: () => buttonsForm("§b§wjc:n", "keys", ["ok"]) },
  { key: "6", label: "Marker: two lines with ~x", build: () => buttonsForm("Marker probe", "first line\nsecond line ~x", ["ok"]) },
  { key: "7", label: "Marker: two lines without marker", build: () => buttonsForm("Marker probe", "first line\nsecond line", ["ok"]) },
  { key: "8", label: "Marker: one line with ~x", build: () => buttonsForm("Marker probe", "one line ~x", ["ok"]) },
  { key: "9", label: "P6 structure renderer", build: () => buttonsForm("§b§wjc:6", "P6", ["ok"]) },
  { key: "r", label: "P6 with moving entity and changing block", build: () => buttonsForm("§b§wjc:6", "P6 live", ["ok"]), after: startLiveChanges },
  { key: "h", label: "HUD under form (title after 3 s)", build: () => buttonsForm("plain", "HUD test", ["ok"]), after: (player) => system.runTimeout(() => player.onScreenDisplay.setTitle("JUC during form"), 60) },
  { key: "s", label: "Small form (3 buttons)", build: () => buttonsForm("§b§wjc:4", "3 buttons", ["s0", "s1", "s2"]) },
  { key: "t", label: "Tester measurements", build: () => buttonsForm("§b§wjc:t", "tester", ["ok"]) },
  { key: "q", label: "Renderer probes", build: () => buttonsForm("§b§wjc:r", "renderers", ["ok"]) },
  { key: "g", label: "Debug screen renderer", build: () => buttonsForm("§b§wjc:g", "debug", ["ok"]) },
  { key: "u", label: "Paper doll probes", build: () => buttonsForm("§b§wjc:u", "dolls", ["ok"]) },
  { key: "w", label: "Wheel: 40 buttons", build: () => buttonsForm("wheel probe", "wheel", Array.from({ length: 40 }, (_, i) => `w${i}`)) },
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

const PERF_ICONS = [
  "textures/items/diamond", "textures/items/apple", "textures/items/iron_ingot", "textures/items/gold_ingot", "textures/items/emerald",
  "textures/items/coal", "textures/items/redstone_dust", "textures/items/bread", "textures/items/stick", "textures/items/bone",
];

function perfForm(variant, count) {
  const form = new ActionFormData().title(`§b§wjc:${variant}`).body(`perf ${variant} ${count}`);
  for (let i = 0; i < count; i++) {
    const digit = i % 10;
    if (variant === "b") form.button(`d${digit}`, PERF_ICONS[digit]);
    else if (variant === "e" || variant === "f") form.button(`AAAABBBB${String(i).padStart(4, "0")}DDDD`);
    else form.button(`d${digit}`);
  }
  return form;
}

function spawnProbeParticle(player, message) {
  const [effect, name, value] = message.trim().split(/\s+/);
  const variables = new MolangVariableMap();
  if (name) variables.setFloat(name, Number(value));
  const view = player.getViewDirection();
  const head = player.getHeadLocation();
  const location = { x: head.x + view.x * 3, y: head.y + view.y * 3, z: head.z + view.z * 3 };
  player.dimension.spawnParticle(effect, location, variables);
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player") return;
  if (event.id === "bwiki:juc_particle") {
    spawnProbeParticle(event.sourceEntity, event.message);
    return;
  }
  if (event.id !== "bwiki:json_ui_claims") return;
  const words = event.message.trim().split(/\s+/);
  const perfAt = words.indexOf("perf");
  if (perfAt >= 0) {
    const variant = words[perfAt + 1];
    const count = Number(words[perfAt + 2]);
    openProbe(event.sourceEntity, { label: `perf ${variant} ${count}`, build: () => perfForm(variant, count) });
    return;
  }
  const key = words.pop();
  const probe = PROBES.find((p) => p.key === key);
  if (probe) system.runTimeout(() => openProbe(event.sourceEntity, probe), probe.delay ?? 0);
  else openMenu(event.sourceEntity);
});
