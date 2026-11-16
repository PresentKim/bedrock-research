import { page } from "../../bp/scripts/pages/shopcard.js";
import { COLOR, label, slotLabel } from "../lib.mjs";
import { panel, box, button } from "./_batch_b.mjs";
import { itemCell, smallButton } from "./_batch_e.mjs";

const CARD = [126, 104];
const GAP = 8;
const TOP = 36;
const ICON_CELL = [22, 22];
const STEP = [16, 16];
const VALUE = [34, 16];

function card(ctx, p, k) {
  const button3 = (n) => ctx.slot(n + page.stride.button * k);
  const display = (n) => ctx.slot(n + page.stride.display * k);
  const stepperX = 34;
  const valueX = stepperX + STEP[0] + 2;
  return {
    [`card${k}`]: panel(CARD, [k * (CARD[0] + GAP), TOP], [
      { frame: box(["100%", "100%"], [0, 0], COLOR.outline, COLOR.boxBorder, { layer: 0 }) },
      itemCell("icon", display(page.slots.icon), ICON_CELL, [8, 8], 3),
      label("name", p.name, [36, 10], { color: COLOR.white, scale: 0.7 }),
      label("price", `${p.price} coin${p.price === 1 ? "" : "s"} each`, [36, 21], { color: COLOR.dimText, scale: 0.55 }),
      label("quantity_caption", "Qty", [8, 44], { color: COLOR.dimText, scale: 0.55 }),
      smallButton("minus", button3(page.slots.minus), [stepperX, 40], STEP, "-"),
      { value_box: box(VALUE, [valueX, 40], COLOR.outline, COLOR.boxBorder, { layer: 1 }) },
      slotLabel("quantity", display(page.slots.quantity), [valueX, 44], [VALUE[0], 9], { color: COLOR.white, scale: 0.7, align: "center" }),
      smallButton("plus", button3(page.slots.plus), [valueX + VALUE[0] + 2, 40], STEP, "+"),
      slotLabel("total", display(page.slots.total), [8, 64], [110, 9], { color: COLOR.text, scale: 0.6 }),
      button("buy", button3(page.slots.buy), [8, 78], [CARD[0] - 16, 18], "Buy", "primary"),
    ], { layer: 1 }),
  };
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Real item icons. The server owns the coin balance and checks every purchase.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      itemCell("coin", ctx.slot(page.slots.coin), [18, 18], [0, 12], 2),
      slotLabel("balance", ctx.slot(page.slots.balance), [22, 17], [80, 9], { color: COLOR.white, scale: 0.7 }),
      button("earn", ctx.slot(page.slots.earn), [104, 12], [70, 18], "Earn 10"),
      ...page.products.map((p, k) => card(ctx, p, k)),
      slotLabel("message", ctx.slot(page.slots.message), [0, TOP + CARD[1] + 8], [394, 9], { color: COLOR.text, scale: 0.6, keepFormat: true }),
    ];
  },
};
