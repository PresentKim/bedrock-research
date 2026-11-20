import * as s from "@minecraft/server";

const ids = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];
const out = [];
for (const id of ids) {
  let ok = "no";
  try {
    ok = s.BlockTypes.get("re7:" + id) ? "yes" : "no";
  } catch (e) {
    ok = "ERR";
  }
  out.push(id + "=" + ok);
}
console.warn("RE7D registered " + out.join(" "));

const filler = "x".repeat(300);
let t = 0;
s.system.runInterval(() => {
  t++;
  console.warn("RE7D pad " + t + " " + filler);
}, 10);
