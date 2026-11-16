import { page } from "../../bp/scripts/pages/tabs.js";
import { COLOR, rect, keyedCell, slotButton, label } from "../lib.mjs";
import { TONE, DIM, text, face, faces, group, gated } from "./_batch_a.mjs";

const SIZE = [56, 17];
const BORDER = 2;
const TOP = 14;
const PANEL = [394, 100];
const PANEL_AT = [0, TOP + SIZE[1] + 5];

const look = (value, textColor, borderColor, cover = false) => [
  ...(cover ? [{ cover: rect(COLOR.panel, [SIZE[0], SIZE[1] - BORDER], [0, 0], { layer: 1 }) }] : []),
  { underline: rect(borderColor, [SIZE[0], BORDER], [0, SIZE[1] - BORDER], { layer: 1 }) },
  { text: text(value, textColor, { offset: [0, -1], layer: 5 }) },
];

const tabPanel = (tab) => group(PANEL, tab.lines.map((line, k) => label(`line${k}`, line, [0, k * 12], { color: COLOR.white, scale: 0.7 })));

export const ui = {
  page,
  build(ctx) {
    const active = ctx.slot(page.slots.active);
    const ids = Object.fromEntries(page.tabs.map((tab) => [tab.id, ctx.def(tab.id, tabPanel(tab))]));
    const links = page.tabs.flatMap((tab, k) => {
      const at = [k * SIZE[0], TOP];
      return [
        slotButton(`tab${k}_press`, ctx.slot(page.slots.press + k), at, SIZE, {
          faces: faces(face(look(tab.label, TONE.hover, COLOR.boxBorder)), face(look(tab.label, COLOR.white, COLOR.boxBorder))),
        }),
        gated(`tab${k}_on`, active, tab.id, SIZE, at, look(tab.label, COLOR.white, COLOR.green, true), 6),
      ];
    });
    return [
      label("intro", "Tap a tab. The server writes the active id and the panel is rebuilt.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...links,
      { locked: group(SIZE, look(page.disabledLabel, TONE.hover, COLOR.boxBorder), { offset: [page.tabs.length * SIZE[0], TOP], layer: 1, ...DIM(0.5) }) },
      keyedCell("panel", active, PANEL, PANEL_AT, ids),
    ];
  },
};
