import * as s from "@minecraft/server";

console.warn("RE7 loaded keys=" + Object.keys(s).length);

const COL_IDS = [
  "minecraft:iron_block", "minecraft:stone_block_slab",
  "re7:co_base", "re7:co_h24", "re7:co_h25", "re7:co_h30", "re7:co_x17", "re7:co_xm9", "re7:co_ym1", "re7:co_z17", "re7:co_o0",
  "re7:cm_base", "re7:cm_h24", "re7:cm_h25", "re7:cm_h30", "re7:cm_x17", "re7:cm_neg",
  "re7:co_h245", "re7:co_y05", "re7:co_two", "re7:cm_h245",
  "re7:co_n16", "re7:co_n17", "re7:co_negsize", "re7:cm_001", "re7:cm_dec1", "re7:cm_dec2", "re7:co_obj60", "re7:co_obj20", "re7:co_arr20"
];
const SEL_IDS = [
  "re7:so_base", "re7:so_h24", "re7:so_h25", "re7:so_x17",
  "re7:sm_base", "re7:sm_h24", "re7:sm_h25", "re7:sm_x17",
  "re7:so_h17", "re7:so_h165", "re7:so_small", "re7:so_neg"
];

function origin(p) {
  return { x: Math.floor(p.location.x), y: -60, z: Math.floor(p.location.z) };
}

function registered() {
  const all = COL_IDS.concat(SEL_IDS, ["re7:colx"]);
  const out = [];
  for (const id of all) {
    let ok = "no";
    try {
      ok = s.BlockTypes.get(id) ? "yes" : "no";
    } catch (e) {
      ok = "ERR";
    }
    out.push(id + "=" + ok);
  }
  console.warn("RE7 registered " + out.join(" "));
}

function colTest(p, ids, i, o) {
  if (i >= ids.length) {
    console.warn("RE7 colTest done");
    return;
  }
  const id = ids[i];
  const dim = p.dimension;
  const cx = o.x + i * 3;
  const cz = o.z + 20;
  try {
    dim.setBlockType({ x: cx, y: o.y - 1, z: cz }, id);
  } catch (err) {
    console.warn("RE7 colTest " + id + " setBlockType ERR " + err);
    s.system.runTimeout(() => colTest(p, ids, i + 1, o), 2);
    return;
  }
  p.teleport({ x: cx + 0.5, y: o.y + 4, z: cz + 0.5 });
  s.system.runTimeout(() => {
    console.warn("RE7 colTest " + id + " floorY=" + (o.y - 1) + " playerY=" + p.location.y.toFixed(4));
    colTest(p, ids, i + 1, o);
  }, 50);
}

function edgeTest(p, id, dxEdge, o) {
  const dim = p.dimension;
  const cx = o.x + 60;
  const cz = o.z + 20;
  try {
    dim.setBlockType({ x: cx, y: o.y - 1, z: cz }, id);
    dim.setBlockType({ x: cx + 1, y: o.y - 1, z: cz }, "minecraft:air");
    dim.setBlockType({ x: cx + 1, y: o.y - 2, z: cz }, "minecraft:air");
    dim.setBlockType({ x: cx + 1, y: o.y - 3, z: cz }, "minecraft:air");
    dim.setBlockType({ x: cx + 1, y: o.y - 4, z: cz }, "minecraft:air");
  } catch (err) {
    console.warn("RE7 edgeTest " + id + " ERR " + err);
    return;
  }
  p.teleport({ x: cx + 1 + dxEdge, y: o.y + 4, z: cz + 0.5 });
  s.system.runTimeout(() => {
    console.warn("RE7 edgeTest " + id + " dxEdge=" + dxEdge + " playerY=" + p.location.y.toFixed(4) + " playerX=" + p.location.x.toFixed(4));
  }, 60);
}

function selTest(p, ids, i, o) {
  if (i >= ids.length) {
    console.warn("RE7 selTest done");
    return;
  }
  const id = ids[i];
  const dim = p.dimension;
  const cx = o.x + i * 3;
  const cz = o.z + 30;
  try {
    dim.setBlockType({ x: cx, y: o.y, z: cz }, id);
  } catch (err) {
    console.warn("RE7 selTest " + id + " setBlockType ERR " + err);
    s.system.runTimeout(() => selTest(p, ids, i + 1, o), 2);
    return;
  }
  const rays = [
    ["down", { x: cx + 0.5, y: o.y + 6, z: cz + 0.5 }, { x: 0, y: -1, z: 0 }],
    ["east", { x: cx - 3, y: o.y + 0.5, z: cz + 0.5 }, { x: 1, y: 0, z: 0 }],
    ["eastHigh", { x: cx - 3, y: o.y + 1.2, z: cz + 0.5 }, { x: 1, y: 0, z: 0 }],
    ["eastLow", { x: cx - 3, y: o.y + 0.1, z: cz + 0.5 }, { x: 1, y: 0, z: 0 }]
  ];
  for (const [name, from, dir] of rays) {
    try {
      const hit = dim.getBlockFromRay(from, dir, { maxDistance: 12, includePassableBlocks: true });
      if (hit) {
        console.warn("RE7 selTest " + id + " ray=" + name + " hit=" + hit.block.typeId + " at=" + hit.block.x + "," + hit.block.y + "," + hit.block.z + " face=" + hit.face + " faceLoc=" + JSON.stringify(hit.faceLocation));
      } else {
        console.warn("RE7 selTest " + id + " ray=" + name + " hit=none");
      }
    } catch (err) {
      console.warn("RE7 selTest " + id + " ray=" + name + " ERR " + err);
    }
  }
  s.system.runTimeout(() => selTest(p, ids, i + 1, o), 3);
}

function spawn(dim, type, x, y, z, ev) {
  try {
    return dim.spawnEntity(type, { x, y, z }, ev ? { spawnEvent: ev } : undefined);
  } catch (err) {
    console.warn("RE7 spawn ERR " + type + " " + err);
  }
}

function clearAll(dim) {
  for (const t of ["re7:s13", "re7:s0", "re7:s1", "re7:osc", "re7:sw", "re7:sr"]) {
    for (const e of dim.getEntities({ type: t })) e.remove();
  }
}

function faceSouth(p) {
  p.teleport(p.location, { rotation: { x: 0, y: 0 } });
}

function sndSetup(p) {
  const dim = p.dimension;
  const o = origin(p);
  faceSouth(p);
  clearAll(dim);
  const rows = [
    ["re7:s13", "v0"], ["re7:s13", "v1"], ["re7:s13", "v2"],
    ["re7:s0", "v0"], ["re7:s0", "v1"],
    ["re7:s1", "v0"], ["re7:s1", "v1"]
  ];
  rows.forEach(([t, ev], i) => {
    spawn(dim, t, o.x - 9 + i * 3 + 0.5, o.y, o.z + 8.5, ev);
  });
  console.warn("RE7 sndSetup done");
}

function sndOne(p, type, ev) {
  const dim = p.dimension;
  const o = origin(p);
  faceSouth(p);
  for (const t of ["re7:s13", "re7:s0", "re7:s1", "re7:sn"]) for (const e of dim.getEntities({ type: t })) e.remove();
  spawn(dim, type, o.x + 0.5, o.y, o.z + 6.5, ev);
  console.warn("RE7 sndOne type=" + type + " ev=" + ev);
}

function sndHurt(p, idx) {
  const dim = p.dimension;
  const order = [];
  for (const t of ["re7:s13", "re7:s0", "re7:s1"]) {
    for (const e of dim.getEntities({ type: t })) order.push(e);
  }
  const e = order[idx];
  if (!e) {
    console.warn("RE7 sndHurt no entity idx=" + idx);
    return;
  }
  let v = "?";
  try {
    v = e.getComponent("minecraft:mark_variant").value;
  } catch (err) {
    v = "ERR";
  }
  e.applyDamage(1);
  console.warn("RE7 sndHurt idx=" + idx + " type=" + e.typeId + " mark_variant=" + v);
}

function oscSetup(p, side) {
  const dim = p.dimension;
  const o = origin(p);
  faceSouth(p);
  for (const e of dim.getEntities({ type: "re7:osc" })) e.remove();
  const z = side === "behind" ? o.z - 6.5 : o.z + 6.5;
  spawn(dim, "re7:osc", o.x + 0.5, o.y, z, undefined);
  console.warn("RE7 oscSetup side=" + side);
}

function stencilSetup(p) {
  const dim = p.dimension;
  const o = origin(p);
  faceSouth(p);
  for (const t of ["re7:sw", "re7:sr"]) for (const e of dim.getEntities({ type: t })) e.remove();
  for (let i = 0; i < 5; i++) {
    const x = o.x + (i - 2) * 3 + 0.5;
    spawn(dim, "re7:sw", x, o.y + 1, o.z + 8.5, undefined);
  }
  for (let i = 0; i < 5; i++) {
    const x = o.x + (i - 2) * 3 + 0.5 + 0.5;
    spawn(dim, "re7:sr", x, o.y + 1, o.z + 10.5, "v" + i);
  }
  console.warn("RE7 stencilSetup done");
}

function partSetup(p) {
  const dim = p.dimension;
  const o = origin(p);
  const eyeY = o.y + 1.62;
  const items = [
    ["re7:dexp", -2.4, 3], ["re7:dexp60", -1.2, 3], ["re7:dexpl", 0, 3], ["re7:dctl", 1.2, 3], ["re7:dcol", 2.4, 3],
    ["re7:dexp", -4.8, 12], ["re7:dexp60", -2.4, 12], ["re7:dexpl", 0, 12], ["re7:dctl", 2.4, 12], ["re7:dcol", 4.8, 12]
  ];
  for (const [id, dx, dz] of items) {
    try {
      dim.spawnParticle(id, { x: o.x + 0.5 + dx, y: eyeY + (dz < 5 ? -0.35 : 1.5), z: o.z + 0.5 + dz });
    } catch (err) {
      console.warn("RE7 partSetup ERR " + id + " " + err);
    }
  }
  console.warn("RE7 partSetup spawned");
}

s.world.afterEvents.chatSend.subscribe((ev) => {
  const p = ev.sender;
  const m = ev.message;
  if (m === "!reg") registered();
  if (m === "!col") colTest(p, COL_IDS, 0, origin(p));
  if (m === "!sel") selTest(p, SEL_IDS, 0, origin(p));
  if (m.startsWith("!edge ")) {
    const [, id, d] = m.split(" ");
    edgeTest(p, id, Number(d), origin(p));
  }
  if (m === "!snd") sndSetup(p);
  if (m.startsWith("!sp ")) {
    const [, t, e] = m.split(" ");
    sndOne(p, t, e);
  }
  if (m.startsWith("!hurt ")) sndHurt(p, Number(m.split(" ")[1]));
  if (m === "!osc") oscSetup(p, "front");
  if (m === "!oscb") oscSetup(p, "behind");
  if (m === "!stencil") stencilSetup(p);
  if (m === "!part") partSetup(p);
  if (m === "!face") faceSouth(p);
});

const filler = "x".repeat(300);
let t = 0;
s.system.runInterval(() => {
  t++;
  console.warn("RE7 pad " + t + " " + filler);
}, 10);
