import { page } from "../../bp/scripts/pages/textinput.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { rawText, frame, box, keyButton, keyText, gateOn } from "./_batch_d.mjs";

const KEY_W = 34;
const KEY_H = 18;
const PITCH = 36;
const LEFT = 17;
const ROW_Y = [50, 70, 90, 110, 130];
const FIELD_Y = 12;
const FIELD_H = 24;

function field(ctx, prefix, x, width, buttonWidth, focusValue, textSlot, placeholderSlot, pressSlot) {
  return [
    box(`${prefix}_box`, [width, FIELD_H], [x, FIELD_Y], COLOR.boxBorder, COLOR.outline),
    whenSlot(`${prefix}_focus`, ctx.slot(page.slots.focus), [width, FIELD_H], [x, FIELD_Y], focusValue, frame(COLOR.white, [width, FIELD_H]), 2),
    slotLabel(`${prefix}_placeholder`, ctx.slot(placeholderSlot), [x + 6, FIELD_Y + 8], [width - 12, 10], { scale: 0.7, color: COLOR.grayHalf }),
    rawText(`${prefix}_text`, ctx.slot(textSlot), [x + 6, FIELD_Y + 8], [width - 12, 10]),
    slotButton(`${prefix}_press`, ctx.slot(pressSlot), [x, FIELD_Y], [buttonWidth, FIELD_H]),
  ];
}

function ring(color, filled) {
  return {
    type: "panel", size: [8, 6],
    controls: filled
      ? [
          { mid: rect(color, [8, 4], [0, 1], { layer: 1 }) },
          { top: rect(color, [6, 1], [1, 0], { layer: 1 }) },
          { bottom: rect(color, [6, 1], [1, 5], { layer: 1 }) },
        ]
      : [
          { top: rect(color, [6, 1], [1, 0], { layer: 1 }) },
          { bottom: rect(color, [6, 1], [1, 5], { layer: 1 }) },
          { left: rect(color, [1, 4], [0, 1], { layer: 1 }) },
          { right: rect(color, [1, 4], [7, 1], { layer: 1 }) },
        ],
  };
}

function eyeButton(ctx, x) {
  const eye = ctx.slot(page.slots.eye);
  return slotButton("eye", ctx.slot(page.keys.eye), [x, FIELD_Y], [12, FIELD_H], {
    controls: [
      whenSlot("eye_hidden", eye, [8, 6], [2, 8], "hidden", ring(COLOR.grayHalf, false), 5),
      whenSlot("eye_shown", eye, [8, 6], [2, 8], "shown", ring(COLOR.green, true), 5),
    ],
  });
}

function letterKey(ctx, name, slot, offset, ch) {
  const caseSlot = ctx.slot(page.slots.letterCase);
  const size = [KEY_W, KEY_H];
  const digit = ch >= "0" && ch <= "9";
  return keyButton(name, ctx.slot(slot), offset, size, digit ? ch : undefined, {
    extra: digit ? [] : [
      gateOn("lower", caseSlot, size, "lower", keyText(ch)),
      gateOn("upper", caseSlot, size, "upper", keyText(ch.toUpperCase())),
    ],
  });
}

function keyboard(ctx) {
  const keys = [];
  let slot = 0;
  page.rows.forEach((row, r) => {
    const indent = r === 2 ? PITCH / 2 : r === 3 ? 52 : 0;
    [...row].forEach((ch, c) => {
      keys.push(letterKey(ctx, `key_${slot}`, slot, [LEFT + indent + c * PITCH, ROW_Y[r]], ch));
      slot += 1;
    });
  });
  const caseSlot = ctx.slot(page.slots.letterCase);
  keys.push(
    keyButton("key_shift", ctx.slot(page.keys.shift), [LEFT, ROW_Y[3]], [50, KEY_H], "Shift", {
      extra: [gateOn("caps_on", caseSlot, [50, KEY_H], "upper", rect(COLOR.green, [46, 2], [2, 2], { layer: 1 }))],
    }),
    keyButton("key_back", ctx.slot(page.keys.back), [LEFT + 52 + 7 * PITCH, ROW_Y[3]], [50, KEY_H], "Back"),
    keyButton("key_clear", ctx.slot(page.keys.clear), [LEFT, ROW_Y[4]], [70, KEY_H], "Clear"),
    keyButton("key_space", ctx.slot(page.keys.space), [LEFT + 72, ROW_Y[4]], [214, KEY_H], "Space"),
  );
  return keys;
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap a field, then type on the keys. The server keeps the text.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      ...field(ctx, "name", 0, 190, 190, "name", page.slots.nameText, page.slots.namePlaceholder, page.keys.nameField),
      ...field(ctx, "pass", 200, 194, 170, "pass", page.slots.passText, page.slots.passPlaceholder, page.keys.passField),
      eyeButton(ctx, 376),
      slotLabel("count", ctx.slot(page.slots.count), [0, 39], [190, 9], { scale: 0.55 }),
      ...keyboard(ctx),
    ];
  },
};
