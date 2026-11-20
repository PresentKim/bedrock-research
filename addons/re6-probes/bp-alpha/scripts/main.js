import * as s from "@minecraft/server";

console.warn("RE6 alpha loaded keys=" + Object.keys(s).length + " Duration=" + typeof s.Duration + " ");
const filler = "x".repeat(300);
let t = 0;
s.system.runInterval(() => {
  t++;
  console.warn("RE6 alphapad " + t + " " + filler);
}, 20);
