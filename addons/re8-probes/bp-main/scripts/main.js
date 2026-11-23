import * as s from "@minecraft/server";

console.warn("RE8 loaded");

function player() {
  return s.world.getAllPlayers()[0];
}

function spawn(type, dx, dz, ev) {
  const p = player();
  const l = p.location;
  try {
    const e = p.dimension.spawnEntity(type, { x: l.x + dx, y: l.y, z: l.z + dz }, ev ? { spawnEvent: ev } : undefined);
    console.warn("RE8 spawn ok " + type + " id=" + e.id);
    return e;
  } catch (err) {
    console.warn("RE8 spawn ERR " + type + " " + err);
  }
}

function lootTrial(name, n) {
  const p = player();
  const dim = p.dimension;
  const l = p.location;
  const bx = Math.floor(l.x) + 30;
  const bz = Math.floor(l.z) + 30;
  const tally = {};
  let total = 0;
  const dmg = [];
  for (let i = 0; i < n; i++) {
    try {
      dim.runCommand("loot spawn " + bx + " " + Math.floor(l.y) + " " + bz + ' loot "' + name + '"');
    } catch (err) {
      console.warn("RE8 loot " + name + " cmdERR " + err);
      return;
    }
    for (const e of dim.getEntities({ type: "minecraft:item", location: { x: bx, y: l.y, z: bz }, maxDistance: 4 })) {
      const it = e.getComponent("minecraft:item").itemStack;
      const key = it.typeId + "|" + it.localizationKey;
      tally[key] = (tally[key] || 0) + it.amount;
      total += it.amount;
      const d = it.getComponent("minecraft:durability");
      if (d && dmg.length < 12) dmg.push(d.damage);
      e.remove();
    }
  }
  console.warn("RE8 loot " + name + " n=" + n + " total=" + total + " tally=" + JSON.stringify(tally) + " dmg=" + JSON.stringify(dmg));
}

function countEntities(type) {
  const p = player();
  const list = p.dimension.getEntities({ type });
  console.warn("RE8 count " + type + " n=" + list.length + " " + list.map((e) => e.location.x.toFixed(1) + "," + e.location.y.toFixed(1) + "," + e.location.z.toFixed(1)).join(" "));
}

function scanBlocks(id, radius) {
  const p = player();
  const l = p.location;
  const dim = p.dimension;
  const found = [];
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      for (let y = -2; y <= 3; y++) {
        const b = dim.getBlock({ x: Math.floor(l.x) + x, y: Math.floor(l.y) + y, z: Math.floor(l.z) + z });
        if (b && b.typeId === id) found.push(b.x + "," + b.y + "," + b.z);
      }
    }
  }
  console.warn("RE8 scan " + id + " n=" + found.length + " " + found.slice(0, 20).join(" "));
}

function spawnAhead(type, dist) {
  const p = player();
  const l = p.location;
  const v = p.getViewDirection();
  const e = p.dimension.spawnEntity(type, { x: l.x + v.x * dist, y: l.y, z: l.z + v.z * dist });
  console.warn("RE8 spawnAhead ok " + type + " " + e.location.x.toFixed(1) + "," + e.location.z.toFixed(1));
}

function walk(type) {
  const p = player();
  const list = p.dimension.getEntities({ type });
  const e = list[0];
  if (!e) {
    console.warn("RE8 walk none " + type);
    return;
  }
  let i = 0;
  const h = s.system.runInterval(() => {
    i++;
    const l = e.location;
    e.teleport({ x: l.x + 1, y: l.y, z: l.z });
    if (i >= 12) {
      s.system.clearRun(h);
      console.warn("RE8 walk done " + type + " end=" + e.location.x.toFixed(1));
    }
  }, 10);
}

function clearAll() {
  const dim = player().dimension;
  for (const e of dim.getEntities()) {
    if (e.typeId.startsWith("re8:")) e.remove();
  }
}

s.system.afterEvents.scriptEventReceive.subscribe((ev) => {
  const id = ev.id;
  const a = ev.message.split(" ");
  try {
    if (id === "re8:reg") {
      const out = [];
      for (const n of a) out.push(n + "=" + (s.EntityTypes.get("re8:" + n) ? "yes" : "no"));
      console.warn("RE8 reg " + out.join(" "));
    }
    if (id === "re8:loot") lootTrial("re8/" + a[0], Number(a[1] || 20));
    if (id === "re8:spawn") spawn("re8:" + a[0], Number(a[1] || 3), Number(a[2] || 0), a[3]);
    if (id === "re8:count") countEntities("re8:" + a[0]);
    if (id === "re8:ahead") spawnAhead("re8:" + a[0], Number(a[1] || 2));
    if (id === "re8:walk") walk("re8:" + a[0]);
    if (id === "re8:scan") scanBlocks(a[0], Number(a[1] || 10));
    if (id === "re8:clear") clearAll();
    if (id === "re8:ping") console.warn("RE8 ping " + ev.message);
  } catch (err) {
    console.warn("RE8 handler ERR " + id + " " + err);
  }
});

const filler = "x".repeat(300);
let t = 0;
s.system.runInterval(() => {
  t++;
  console.warn("RE8 pad " + t + " " + filler);
}, 10);
