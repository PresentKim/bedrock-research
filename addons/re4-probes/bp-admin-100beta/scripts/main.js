import * as m from "@minecraft/server-admin";

console.warn("RE4 admin100beta loaded keys=" + Object.keys(m).join(","));
for (const k of Object.keys(m)) {
  try {
    const v = m[k];
    console.warn("RE4 admin100beta " + k + " type=" + typeof v + " props=" + Object.getOwnPropertyNames(Object.getPrototypeOf(v) ?? v).join(","));
  } catch (e) {
    console.warn("RE4 admin100beta " + k + " err=" + e);
  }
}
for (const k of ["secrets", "variables"]) {
  try {
    console.warn("RE4 admin100beta " + k + ".names=" + JSON.stringify(m[k].names));
  } catch (e) {
    console.warn("RE4 admin100beta " + k + ".names err=" + e);
  }
  try {
    console.warn("RE4 admin100beta " + k + ".get(x)=" + String(m[k].get("x")));
  } catch (e) {
    console.warn("RE4 admin100beta " + k + ".get err=" + e);
  }
}
try {
  console.warn("RE4 admin100beta serverAdmin.allowList=" + typeof m.serverAdmin.allowList);
} catch (e) {
  console.warn("RE4 admin100beta serverAdmin err=" + e);
}
