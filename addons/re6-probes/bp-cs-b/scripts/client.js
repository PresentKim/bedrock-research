import * as mc from "@minecraft/client";

const TAG = "RE6 bp-cs-b";

function protoNames(o) {
  const out = [];
  let p = o;
  for (let i = 0; i < 4 && p; i++) {
    out.push(Object.getOwnPropertyNames(p).join("|"));
    p = Object.getPrototypeOf(p);
  }
  return out.join(" >> ");
}

function safe(label, fn) {
  try {
    console.warn(TAG + " " + label + " = " + fn());
  } catch (e) {
    console.warn(TAG + " " + label + " ERR " + e);
  }
}

console.warn(TAG + " loaded");
safe("module keys", () => Object.keys(mc).join(","));
safe("typeof client", () => typeof mc.client);
safe("typeof Client", () => typeof mc.Client);
safe("client proto", () => protoNames(mc.client));
safe("Client static", () => Object.getOwnPropertyNames(mc.Client).join(","));
safe("events", () => typeof mc.client.events);
safe("events proto", () => protoNames(mc.client.events));
safe("events for-in", () => {
  const k = [];
  for (const x in mc.client.events) k.push(x);
  return k.join(",");
});
safe("typeof setTimeout", () => typeof setTimeout);
safe("typeof setInterval", () => typeof setInterval);
safe("typeof console.log", () => typeof console.log);
safe("typeof globalThis keys", () => Object.getOwnPropertyNames(globalThis).join(","));
safe("postServerMessage", () => String(mc.client.postServerMessage(TAG, "early-hello")));

const ev = mc.client.events;
if (ev) {
  for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(ev))) {
    if (name === "constructor") continue;
    safe("subscribe " + name, () => {
      const sig = ev[name];
      return typeof sig + " proto=" + protoNames(sig) + " subscribe=" + (typeof sig.subscribe);
    });
  }
}

function later() {
  safe("late postServerMessage", () => String(mc.client.postServerMessage(TAG, "late-hello")));
}
if (typeof setTimeout === "function") setTimeout(later, 3000);
