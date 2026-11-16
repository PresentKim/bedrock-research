import { page } from "../../bp/scripts/pages/checkbox.js";
import { COLOR, rect, keyedCell, slotButton, slotLabel, label } from "../lib.mjs";

const SIZE = [13, 13];

function body(on, disabled) {
  return {
    type: "panel", size: SIZE, ...(disabled ? { alpha: 0.5, propagate_alpha: true } : {}),
    controls: on
      ? [
          { fill: rect(COLOR.green, SIZE, [0, 0], { layer: 1 }) },
          { mark: { type: "image", texture: "textures/ui/checkmark_white", size: [9, 9], layer: 2, ...(disabled ? {} : { anims: ["@iubc.checkbox_fade_in"] }) } },
        ]
      : [
          { border: rect(COLOR.boxBorder, SIZE, [0, 0], { layer: 1 }) },
          { fill: rect(COLOR.outline, [11, 11], [1, 1], { layer: 2 }) },
        ],
  };
}

export const ui = {
  page,
  build(ctx) {
    ctx.def("fade_in", { anim_type: "alpha", easing: "linear", from: 0, to: 1, duration: 0.15 });
    const ids = { on: ctx.def("on", body(true, false)), off: ctx.def("off", body(false, false)) };
    const disabledIds = { on: ctx.def("disabled_on", body(true, true)) };
    return [
      label("intro", "Tap the box or its label. The server answers with the new state.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      keyedCell("check", ctx.slot(page.slots.state), SIZE, [0, 16], ids),
      slotLabel("check_label", ctx.slot(page.slots.label), [18, 19], [80, 9], { color: COLOR.text }),
      slotButton("check_press", ctx.slot(page.slots.press), [0, 16], [90, 13]),
      keyedCell("check_disabled", ctx.slot(page.slots.disabledState), SIZE, [0, 36], disabledIds),
      label("disabled_label", "Disabled", [18, 39], { color: COLOR.dimText }),
    ];
  },
};
