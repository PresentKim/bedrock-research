const ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const CHARS = ROWS.join("");
const KEY = { shift: 36, back: 37, space: 38, clear: 39, nameField: 40, passField: 41, eye: 42 };
const SHOW = { nameText: 50, namePlaceholder: 51, passText: 52, passPlaceholder: 53, focus: 54, letterCase: 55, eye: 56, count: 57 };
const MAX = { name: 16, pass: 12 };

export const page = {
  key: "textinput",
  title: "TextInput",
  rows: ROWS,
  keys: KEY,
  slots: SHOW,
  buttons: Array.from({ length: 43 }, (_, k) => k),
  init: () => ({ name: "", pass: "", focus: "name", upper: false, shown: false }),
  render: (s) => {
    const cursor = (field) => (s.focus === field ? "_" : "");
    const pass = s.shown ? s.pass : "*".repeat(s.pass.length);
    const asText = (text) => (text ? `§r${text}` : "");
    return {
      [SHOW.nameText]: asText(s.name + cursor("name")),
      [SHOW.namePlaceholder]: s.name ? "" : "Player name",
      [SHOW.passText]: asText(pass + cursor("pass")),
      [SHOW.passPlaceholder]: s.pass ? "" : "Password",
      [SHOW.focus]: s.focus,
      [SHOW.letterCase]: s.upper ? "upper" : "lower",
      [SHOW.eye]: s.shown ? "shown" : "hidden",
      [SHOW.count]: `${s.focus === "name" ? "Name" : "Password"} ${s[s.focus].length} of ${MAX[s.focus]}`,
    };
  },
  press: (s, slot) => {
    if (slot === KEY.nameField || slot === KEY.passField) {
      s.focus = slot === KEY.nameField ? "name" : "pass";
      return `focus ${s.focus}`;
    }
    if (slot === KEY.eye) {
      s.shown = !s.shown;
      return s.shown ? "password shown" : "password hidden";
    }
    if (slot === KEY.shift) {
      s.upper = !s.upper;
      return s.upper ? "upper case" : "lower case";
    }
    const field = s.focus;
    if (slot === KEY.back) s[field] = s[field].slice(0, -1);
    else if (slot === KEY.clear) s[field] = "";
    else {
      if (s[field].length >= MAX[field]) return `${field} is full at ${MAX[field]}`;
      const ch = slot === KEY.space ? " " : CHARS[slot];
      s[field] += s.upper ? ch.toUpperCase() : ch;
    }
    return field === "pass" ? `password ${s.pass.length} chars` : `name ${s.name.length} chars`;
  },
};
