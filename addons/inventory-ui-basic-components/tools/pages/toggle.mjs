import { page } from "../../bp/scripts/pages/toggle.js";
import { COLOR, rect, thumb, keyedCell, slotButton, slotLabel, label } from "../lib.mjs";

const SIZE = [32, 17];

function body(on, disabled) {
  return {
    type: "panel", size: SIZE, ...(disabled ? { alpha: 0.5, propagate_alpha: true } : {}),
    controls: [
      { outline: rect(COLOR.outline, [32, 15], [0, 2], { layer: 1 }) },
      { green: rect(COLOR.green, [15, 13], [1, 3], { layer: 2 }) },
      { gray: rect(COLOR.grayHalf, [15, 13], [16, 3], { layer: 2 }) },
      { on_bar: rect(COLOR.white, [1, 6], [8, 6], { layer: 3 }) },
      { ring_top: rect(COLOR.ring, [4, 1], [22, 6], { layer: 3 }) },
      { ring_bottom: rect(COLOR.ring, [4, 1], [22, 11], { layer: 3 }) },
      { ring_left: rect(COLOR.ring, [1, 4], [21, 7], { layer: 3 }) },
      { ring_right: rect(COLOR.ring, [1, 4], [26, 7], { layer: 3 }) },
      { thumb: thumb([17, 17], on ? [15, 0] : [0, 0], disabled ? {} : { anims: [`@iubc.toggle_${on ? "slide_on" : "slide_off"}`] }) },
    ],
  };
}

export const ui = {
  page,
  build(ctx) {
    ctx.def("slide_on", { anim_type: "offset", easing: "out_cubic", from: [0, 0], to: [15, 0], duration: 0.18 });
    ctx.def("slide_off", { anim_type: "offset", easing: "out_cubic", from: [15, 0], to: [0, 0], duration: 0.18 });
    const ids = { on: ctx.def("on", body(true, false)), off: ctx.def("off", body(false, false)) };
    const disabledIds = { on: ctx.def("disabled_on", body(true, true)) };
    return [
      label("intro", "Tap the toggle. The server flips the value and the thumb slides.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      keyedCell("toggle", ctx.slot(page.slots.state), SIZE, [0, 16], ids),
      slotButton("toggle_press", ctx.slot(page.slots.press), [0, 16], SIZE),
      slotLabel("toggle_value", ctx.slot(page.slots.state), [40, 22], [60, 9], { prefix: "value " }),
      label("disabled_caption", "Disabled", [120, 22], { color: COLOR.dimText, scale: 0.55 }),
      keyedCell("toggle_disabled", ctx.slot(page.slots.disabledState), SIZE, [160, 16], disabledIds),
    ];
  },
};
