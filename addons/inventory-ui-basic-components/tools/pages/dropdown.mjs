import { page } from "../../bp/scripts/pages/dropdown.js";
import { COLOR, rect, label, slotLabel, slotButton, whenSlot } from "../lib.mjs";
import { TONE, FULL, panel, box, frame, chevron, darkFaces, textBody } from "./_batch_b.mjs";

const W = 120;
const H = 16;
const ROW = 15;
const TOP = 24;
const LIST_Y = TOP + H;
const AREA = [394, 168];

function optionRow(ctx, option, k) {
  const y = LIST_Y + 1 + k * ROW;
  if (option.disabled) return [label(`option_${option.value}`, option.label, [7, y + 4], { scale: 0.65, color: COLOR.grayHalf, layer: 5 })];
  return [
    whenSlot(`selected_${option.value}`, ctx.slot(page.slots.selected), [W - 2, ROW], [1, y], option.value, rect(COLOR.green, [W - 2, ROW], [0, 0])),
    slotButton(`option_${option.value}`, ctx.slot(page.slots.option + k), [1, y], [W - 2, ROW], {
      faces: [
        { default: panel(FULL, [0, 0]) },
        { hover: rect(TONE.hoverDark, FULL, [0, 0]) },
        { pressed: rect(TONE.hoverDark, FULL, [0, 0]) },
      ],
      controls: [label("text", option.label, [6, 4], { scale: 0.65, color: COLOR.white })],
    }),
  ];
}

function list(ctx) {
  return whenSlot("list", ctx.slot(page.slots.open), AREA, [0, 0], "open", panel(AREA, [0, 0], [
    slotButton("outside", ctx.slot(page.slots.outside), [0, 0], AREA, { layer: 1 }),
    { list_box: box([W, page.options.length * ROW + 2], [0, LIST_Y], COLOR.panel, COLOR.boxBorder, { layer: 2 }) },
    ...page.options.flatMap((option, k) => optionRow(ctx, option, k)),
  ]), 10);
}

export const ui = {
  page,
  build(ctx) {
    return [
      label("intro", "Tap the field to open the list. Tap outside to close it.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      label("caption", "Biome", [0, 13], { color: COLOR.dimText, scale: 0.55 }),
      slotButton("trigger", ctx.slot(page.slots.trigger), [0, TOP], [W, H], {
        faces: darkFaces(COLOR.boxBorder, TONE.hoverLight),
        controls: [
          whenSlot("placeholder", ctx.slot(page.slots.selected), [W - 20, 9], [6, 5], "none", textBody("Choose a biome", [0, 0], { scale: 0.65, color: COLOR.grayHalf, layer: 1 })),
          slotLabel("value", ctx.slot(page.slots.valueText), [6, 5], [W - 20, 9], { scale: 0.65, color: COLOR.white }),
          { chevron: chevron("down", [W - 13, 6], COLOR.white, 4) },
        ],
      }),
      whenSlot("open_frame", ctx.slot(page.slots.open), [W, H], [0, TOP], "open", frame([W, H], [0, 0], COLOR.white), 6),
      label("disabled_caption", "Disabled", [200, 13], { color: COLOR.dimText, scale: 0.55 }),
      {
        disabled: panel([W, H], [200, TOP], [
          { face: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder) },
          { text: textBody("Forest", [6, 5], { scale: 0.65, color: COLOR.white }) },
          { chevron: chevron("down", [W - 13, 6], COLOR.white, 4) },
        ], { alpha: 0.5 }),
      },
      list(ctx),
    ];
  },
};
