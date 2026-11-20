import * as s from "@minecraft/server";

console.warn("RE4 control loaded server keys=" + Object.keys(s).length);

const filler = "x".repeat(400);
let n = 0;
s.system.runInterval(() => {
  console.warn("RE4 pad " + n++ + " " + filler);
}, 20);
