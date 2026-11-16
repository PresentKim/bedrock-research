import { page } from "../../bp/scripts/pages/playercard.js";
import { COLOR, rect, label, slotLabel } from "../lib.mjs";
import { panel, box, button } from "./_batch_b.mjs";
import { TINT, gate, dot, figure } from "./_batch_f.mjs";

const CARD = [260, 112];
const X = 74;
const DOT = { online: COLOR.green, away: TINT.amber, busy: TINT.red };

export const ui = {
  page,
  build(ctx) {
    const at = (name) => ctx.slot(page.slots[name]);
    const dots = page.statuses.map((s) => gate(`dot_${s.key}`, at("statusKey"), s.key, [5, 5], [X, 28], [dot("dot", [0, 0], DOT[s.key])]));
    return [
      label("intro", "Your live figure, name and status come from the server.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      {
        card: panel(CARD, [0, 14], [
          { back: box(CARD, [0, 0], COLOR.outline, COLOR.boxBorder, { layer: 1 }) },
          figure("figure", at("entity"), [60, 100], 44, [6, 6]),
          slotLabel("name", at("name"), [X, 10], [180, 12], { color: COLOR.white, scale: 1.0 }),
          ...dots,
          slotLabel("status_text", at("statusText"), [X + 8, 27], [100, 9], { color: COLOR.white, scale: 0.65 }),
          slotLabel("level", at("level"), [X, 40], [180, 9], { scale: 0.6 }),
          { divider: rect(COLOR.boxBorder, [CARD[0] - X - 8, 1], [X, 54], { layer: 2 }) },
          label("activity_caption", "Activity", [X, 60], { color: COLOR.dimText, scale: 0.5, layer: 6 }),
          slotLabel("activity", at("activity"), [X, 69], [180, 9], { color: COLOR.text, scale: 0.6 }),
          button("wave", at("wave"), [X, 86], [60, 18], "Wave"),
          button("status", at("status"), [X + 66, 86], [100, 18], "Change status", "primary"),
        ], { layer: 1 }),
      },
      label("note", "Wave plays an arm animation on you and the figure. Change status cycles Online, Away and Busy.", [272, 18], { color: COLOR.dimText, scale: 0.55, size: [120, 60] }),
    ];
  },
};
