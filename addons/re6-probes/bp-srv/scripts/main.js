import * as s from "@minecraft/server";

console.warn("RE6 srv loaded keys=" + Object.keys(s).length);

try {
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(s.world.afterEvents)).filter((n) => /essage/.test(n));
  console.warn("RE6 srv afterEvents message names=" + names.join(","));
} catch (e) {
  console.warn("RE6 srv afterEvents ERR " + e);
}

try {
  s.world.afterEvents.messageReceive.subscribe((ev) => {
    let d = "";
    try {
      d = Object.getOwnPropertyNames(Object.getPrototypeOf(ev)).join("|") + " id=" + ev.id + " message=" + ev.message + " player=" + (ev.player && ev.player.name);
    } catch (e) {
      d = "ERR " + e;
    }
    console.warn("RE6 srv messageReceive " + d);
  });
  console.warn("RE6 srv subscribed messageReceive");
} catch (e) {
  console.warn("RE6 srv subscribe ERR " + e);
}

function setup(p) {
  const dim = p.dimension;
  const bx = Math.floor(p.location.x);
  const by = Math.floor(p.location.y);
  const bz = Math.floor(p.location.z);
  p.teleport(p.location, { rotation: { x: 0, y: 0 } });
  const row1 = [-6, -3, 0, 3, 6];
  const row2 = [-9, -6, -3, 0, 3, 6, 9];
  const spawn = (type, x, y, z, ev) => {
    try {
      const e = dim.spawnEntity(type, { x, y, z }, ev ? { spawnEvent: ev } : undefined);
      return e;
    } catch (err) {
      console.warn("RE6 srv spawn ERR " + type + " " + err);
    }
  };
  for (const t of ["re6:za", "re6:zb"]) for (const e of dim.getEntities({ type: t })) e.remove();
  for (let i = 0; i < 5; i++) {
    spawn("re6:zb", bx + row1[i] + 0.5, by, bz + 8.5, "v" + i);
    spawn("re6:za", bx + row1[i] + 0.5, by, bz + 8.5);
  }
  for (let i = 5; i < 9; i++) {
    const x = row2[i - 5 + 1];
    spawn("re6:zb", bx + x + 0.5, by, bz + 14.5, "v" + i);
    spawn("re6:za", bx + x + 0.5, by, bz + 14.5);
  }
  spawn("re6:zb", bx - 2 + 0.5, by, bz + 11.5, "v9");
  spawn("re6:zb", bx + 2 + 0.5, by, bz + 11.5, "v10");
  const types = ["minecraft:iron_block", "minecraft:snow", "minecraft:quartz_block", "minecraft:white_wool", "minecraft:white_concrete", "re6:colmm", "re6:colos", "re6:colmm2", "re6:colmm3", "re6:colmm4"];
  types.forEach((id, i) => {
    try {
      dim.setBlockType({ x: bx - 3 + i, y: by, z: bz + 4 }, id);
    } catch (err) {
      console.warn("RE6 srv setBlockType ERR " + id + " " + err);
    }
  });
  console.warn("RE6 srv setup base=" + bx + "," + by + "," + bz);
}

function colTest(p, id, dx) {
  const dim = p.dimension;
  const bx = Math.floor(p.location.x);
  const by = Math.floor(p.location.y);
  const bz = Math.floor(p.location.z);
  const cx = bx + dx;
  const cz = bz + 20;
  dim.setBlockType({ x: cx, y: by - 1, z: cz }, id);
  p.teleport({ x: cx + 0.5, y: by + 6, z: cz + 0.5 });
  s.system.runTimeout(() => {
    console.warn("RE6 srv colTest " + id + " floorY=" + (by - 1) + " playerY=" + p.location.y + " blockExists=" + dim.getBlock({ x: cx, y: by - 1, z: cz }).typeId);
  }, 80);
}

try {
  s.world.afterEvents.chatSend.subscribe((ev) => {
    if (ev.message === "!setup") setup(ev.sender);
    if (ev.message === "!colmm") colTest(ev.sender, "re6:colmm", 0);
    if (ev.message === "!colos") colTest(ev.sender, "re6:colos", 4);
    if (ev.message === "!coliron") colTest(ev.sender, "minecraft:iron_block", 8);
    if (ev.message === "!colmm2") colTest(ev.sender, "re6:colmm2", 16);
    if (ev.message === "!colmm3") colTest(ev.sender, "re6:colmm3", 20);
    if (ev.message === "!colmm4") colTest(ev.sender, "re6:colmm4", 24);
    if (ev.message === "!colslab") colTest(ev.sender, "minecraft:stone_block_slab", 12);
  });
  console.warn("RE6 srv chatSend subscribed");
} catch (e) {
  console.warn("RE6 srv chatSend ERR " + e);
}

const filler = "x".repeat(300);
let t = 0;
s.system.runInterval(() => {
  t++;
  console.warn("RE6 pad " + t + " " + filler);
  if (t === 10 || t === 60) {
    try {
      s.world.broadcastClientMessage("re6srv", "hello-from-server-" + t);
      console.warn("RE6 srv broadcastClientMessage ok t=" + t);
    } catch (e) {
      console.warn("RE6 srv broadcastClientMessage ERR " + e);
    }
    try {
      for (const p of s.world.getAllPlayers()) {
        p.postClientMessage("re6srv", "hello-player-" + t);
        console.warn("RE6 srv postClientMessage ok t=" + t);
      }
    } catch (e) {
      console.warn("RE6 srv postClientMessage ERR " + e);
    }
  }
}, 20);
