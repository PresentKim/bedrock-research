import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "rp", "textures", "ui", "emf");

const PIP = 14;
const FIGURE = [42, 41];
const ROW = [120, 34];
const BAR = [168, 4];

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
const CLEAR = [0, 0, 0, 0];

function canvas(width, height) {
  const image = { width, height, pixels: Buffer.alloc(width * height * 4) };
  image.set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    image.pixels.set(color, (y * width + x) * 4);
  };
  image.rect = (x0, y0, w, h, color) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) image.set(x, y, color);
  };
  image.frame = (x0, y0, w, h, t, color) => {
    image.rect(x0, y0, w, t, color);
    image.rect(x0, y0 + h - t, w, t, color);
    image.rect(x0, y0, t, h, color);
    image.rect(x0 + w - t, y0, t, h, color);
  };
  image.round = () => {
    for (const [x, y] of [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]) image.set(x, y, CLEAR);
  };
  image.draw = (rows, x0, y0, color) =>
    rows.forEach((row, y) => [...row].forEach((bit, x) => bit === "1" && image.set(x0 + x, y0 + y, color)));
  return image;
}

const CHECK = ["00000001", "00000011", "10000110", "11001100", "01111000", "00110000"];
const CROSS = ["1100011", "0110110", "0011100", "0011100", "0110110", "1100011"];

function pip(fill, border, glyph, glyphColor, gx, gy) {
  const image = canvas(PIP, PIP);
  image.rect(0, 0, PIP, PIP, rgb(border));
  image.rect(1, 1, PIP - 2, PIP - 2, rgb(fill));
  image.round();
  image.draw(glyph, gx, gy, rgb(glyphColor));
  return image;
}

function figureFrame(fill, fillAlpha, border) {
  const [w, h] = FIGURE;
  const image = canvas(w, h);
  image.rect(2, 2, w - 4, h - 4, rgb(fill, fillAlpha));
  image.frame(1, 1, w - 2, h - 2, 1, rgb(border));
  return image;
}

function rowFrame(color) {
  const [w, h] = ROW;
  const image = canvas(w, h);
  image.rect(0, 0, w, h, rgb(color, 45));
  image.frame(0, 0, w, h, 2, rgb(color));
  image.round();
  return image;
}

function dot() {
  const image = canvas(6, 6);
  image.rect(1, 0, 4, 6, rgb("#3fbf4a"));
  image.rect(0, 1, 6, 4, rgb("#3fbf4a"));
  return image;
}

function bar(color) {
  const image = canvas(...BAR);
  image.rect(0, 0, ...BAR, rgb(color));
  return image;
}

function launcher() {
  const image = canvas(16, 16);
  image.rect(1, 1, 14, 14, rgb("#2b2f3a"));
  image.frame(0, 0, 16, 16, 1, rgb("#12141a"));
  image.round();
  for (let y = 0; y < 8; y++) {
    const w = y < 4 ? y + 1 : 8 - y;
    image.rect(6, 4 + y, w * 2 - 1, 1, rgb("#4fd16b"));
  }
  return image;
}

const textures = {
  figure_empty: figureFrame("#000000", 25, "#a0a0a0"),
  figure_member: figureFrame("#4a6fa5", 45, "#4a6fa5"),
  figure_you: figureFrame("#e0b32e", 60, "#b8901c"),
  pip_accepted: pip("#3c9a3c", "#235c23", CHECK, "#ffffff", 3, 4),
  pip_declined: pip("#b8352b", "#6e1f19", CROSS, "#ffffff", 3, 4),
  row_selected: rowFrame("#3d6fd1"),
  row_queued: rowFrame("#3c9a3c"),
  dot: dot(),
  bar_track: bar("#4a4a4a"),
  bar_fill: bar("#3fbf4a"),
  launcher: launcher(),
};

mkdirSync(outDir, { recursive: true });
for (const [name, image] of Object.entries(textures)) writeFileSync(join(outDir, `${name}.png`), png(image));
console.log(`wrote ${Object.keys(textures).length} textures to ${outDir}`);
