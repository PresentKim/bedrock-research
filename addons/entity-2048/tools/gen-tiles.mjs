import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "textures", "ui", "e2048");

const TILE = 56;
const CELL = 30;
const BOARD = CELL * 4 + 4;

const FONT = {
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"],
  7: ["111", "001", "010", "010", "010"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "111"],
};

const TILES = [
  { fill: "#8b8b8b", text: "#ffffff" },
  { fill: "#3b3b3b", text: "#ffffff" },
  { fill: "#c8703c", text: "#ffffff" },
  { fill: "#d8c3a5", text: "#3a3a3a" },
  { fill: "#2f56b0", text: "#ffffff" },
  { fill: "#b8221b", text: "#ffffff" },
  { fill: "#f2c62e", text: "#3a3a3a" },
  { fill: "#1fa64a", text: "#ffffff" },
  { fill: "#4fd8d0", text: "#2a3a3a" },
  { fill: "#8f5cc8", text: "#ffffff" },
  { fill: "#4a3f3f", text: "#f2c62e" },
  { fill: "#e870a8", text: "#ffffff" },
  { fill: "#f4f4f4", text: "#3a3a3a" },
];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function png(image) {
  const { width, height, pixels } = image;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const rgb = (hex, alpha = 255) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), alpha];
const shade = ([r, g, b, a], f) => [Math.round(r * f), Math.round(g * f), Math.round(b * f), a];

function canvas(width, height) {
  const image = { width, height, pixels: Buffer.alloc(width * height * 4) };
  image.set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    image.pixels.set(color, (y * width + x) * 4);
  };
  image.rect = (x0, y0, w, h, color) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) image.set(x, y, color);
  };
  return image;
}

function bevelBox(image, x0, y0, size, fill, border) {
  image.rect(x0, y0, size, size, border);
  image.rect(x0 + border.width, y0 + border.width, size - border.width * 2, size - border.width * 2, fill);
  for (const [cx, cy] of [[x0, y0], [x0 + size - 1, y0], [x0, y0 + size - 1], [x0 + size - 1, y0 + size - 1]]) {
    image.set(cx, cy, [0, 0, 0, 0]);
  }
}

function digits(image, text, color, shadow) {
  const scale = text.length <= 2 ? 5 : text.length === 3 ? 4 : 3;
  const width = text.length * 3 * scale + (text.length - 1) * scale;
  const x0 = Math.floor((image.width - width) / 2);
  const y0 = Math.floor((image.height - 5 * scale) / 2);
  const draw = (dx, dy, c) =>
    [...text].forEach((ch, i) =>
      FONT[ch].forEach((row, y) =>
        [...row].forEach((bit, x) => {
          if (bit === "1") image.rect(x0 + dx + (i * 4 + x) * scale, y0 + dy + y * scale, scale, scale, c);
        }),
      ),
    );
  if (shadow) draw(Math.max(1, scale / 2) | 0, Math.max(1, scale / 2) | 0, shadow);
  draw(0, 0, color);
}

function tile(exp) {
  const { fill, text } = TILES[exp - 1];
  const image = canvas(TILE, TILE);
  const base = rgb(fill);
  const border = Object.assign(shade(base, 0.6), { width: 4 });
  bevelBox(image, 0, 0, TILE, base, border);
  image.rect(4, 4, TILE - 8, 4, shade(base, 1.15).map((v, i) => (i < 3 ? Math.min(255, v) : v)));
  const lightText = rgb(text).slice(0, 3).reduce((a, b) => a + b, 0) > 384;
  digits(image, String(2 ** exp), rgb(text), lightText && shade(base, 0.45));
  return image;
}

function board() {
  const image = canvas(BOARD, BOARD);
  const frame = Object.assign(rgb("#5a5048"), { width: 2 });
  bevelBox(image, 0, 0, BOARD, rgb("#5a5048"), frame);
  const pit = Object.assign(rgb("#6d6259"), { width: 1 });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) bevelBox(image, 3 + c * CELL, 3 + r * CELL, 28, rgb("#7d7168"), pit);
  return image;
}

mkdirSync(outDir, { recursive: true });
for (let exp = 1; exp <= TILES.length; exp++) writeFileSync(join(outDir, `t${exp}.png`), png(tile(exp)));
writeFileSync(join(outDir, "board.png"), png(board()));
console.log(`wrote ${TILES.length + 1} textures to ${outDir}`);
