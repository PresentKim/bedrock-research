const HUES = 12;
const LEVELS = 5;
const HEX_KEYS = [..."0123456789abcdef", "back"];
const DYES = [
  ["white", "#f9fffe"], ["orange", "#f9801d"], ["magenta", "#c74ebd"], ["light blue", "#3ab3da"],
  ["yellow", "#fed83d"], ["lime", "#80c71f"], ["pink", "#f38baa"], ["gray", "#474f52"],
  ["light gray", "#9d9d97"], ["cyan", "#169c9c"], ["purple", "#8932b8"], ["blue", "#3c44aa"],
  ["brown", "#835432"], ["green", "#5e7c16"], ["red", "#b02e26"], ["black", "#1d1d21"],
];
const KEY = { area: 0, hue: 25, dye: 40, hex: 60 };
const SHOW = { hue: 100, sv: 101, preview: 102, hexText: 103, hsvText: 104 };

const channelHex = (c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0");

export const hsvToHex = (h, s, v) => {
  const hue = ((h % 360) + 360) % 360;
  const sector = Math.floor(hue / 60);
  const f = hue / 60 - sector;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][sector];
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
};

const hexToHsv = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
};

export const gridHex = (h, s, v) => hsvToHex(h * (360 / HUES), s / (LEVELS - 1), v / (LEVELS - 1));
export const colorId = (hex) => `c${hex.slice(1)}`;

export function previewHexes() {
  const all = new Set(DYES.map(([, hex]) => hex));
  for (let h = 0; h < HUES; h++) for (let s = 0; s < LEVELS; s++) for (let v = 0; v < LEVELS; v++) all.add(gridHex(h, s, v));
  return [...all];
}

const PREVIEW = new Set(previewHexes());

function adopt(state, hex) {
  const next = hexToHsv(hex);
  state.hex = hex;
  if (next.s > 0 && next.v > 0) state.h = Math.round(next.h / (360 / HUES)) % HUES;
  state.s = Math.round(next.s * (LEVELS - 1));
  state.v = Math.round(next.v * (LEVELS - 1));
}

export const page = {
  key: "colorpicker",
  title: "ColorPicker",
  hues: HUES,
  levels: LEVELS,
  hexKeys: HEX_KEYS,
  dyes: DYES,
  keys: KEY,
  slots: SHOW,
  buttons: [
    ...Array.from({ length: LEVELS * LEVELS }, (_, k) => KEY.area + k),
    ...Array.from({ length: HUES }, (_, k) => KEY.hue + k),
    ...DYES.map((_, k) => KEY.dye + k),
    ...HEX_KEYS.map((_, k) => KEY.hex + k),
  ],
  init: () => ({ h: 4, s: 4, v: 3, hex: gridHex(4, 4, 3), draft: null }),
  render: (s) => ({
    [SHOW.hue]: `h${s.h}`,
    [SHOW.sv]: `s${s.s}v${s.v}`,
    [SHOW.preview]: colorId(PREVIEW.has(s.hex) ? s.hex : gridHex(s.h, s.s, s.v)),
    [SHOW.hexText]: s.draft === null ? s.hex : `#${s.draft}_`,
    [SHOW.hsvText]: `H ${s.h * (360 / HUES)}  S ${s.s * 25}  V ${s.v * 25}`,
  }),
  press: (s, slot) => {
    if (slot < KEY.hue) {
      s.s = (slot - KEY.area) % LEVELS;
      s.v = LEVELS - 1 - Math.floor((slot - KEY.area) / LEVELS);
      s.hex = gridHex(s.h, s.s, s.v);
      s.draft = null;
      return `color ${s.hex}`;
    }
    if (slot < KEY.dye) {
      s.h = slot - KEY.hue;
      s.hex = gridHex(s.h, s.s, s.v);
      s.draft = null;
      return `hue ${s.h * (360 / HUES)}, color ${s.hex}`;
    }
    if (slot < KEY.hex) {
      const [name, hex] = DYES[slot - KEY.dye];
      adopt(s, hex);
      s.draft = null;
      return `dye ${name} ${hex}`;
    }
    const key = HEX_KEYS[slot - KEY.hex];
    if (key === "back") {
      s.draft = (s.draft ?? s.hex.slice(1)).slice(0, -1);
      return `hex draft ${s.draft || "empty"}`;
    }
    s.draft = (s.draft ?? "") + key;
    if (s.draft.length < 6) return `hex draft ${s.draft}`;
    adopt(s, `#${s.draft}`);
    s.draft = null;
    return `hex ${s.hex}`;
  },
};
