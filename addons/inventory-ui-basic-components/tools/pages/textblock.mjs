import { page } from "../../bp/scripts/pages/textblock.js";
import { COLOR, rgb, slotButton, slotLabel, label, keyedCell } from "../lib.mjs";
import { faceButton } from "./_batch_c.mjs";

const VARIANT = {
  title: { scale: 1.2, color: COLOR.white, prefix: "§l" },
  body: { scale: 0.8, color: COLOR.white, prefix: "" },
  caption: { scale: 0.7, color: rgb(177, 178, 181), prefix: "" },
};
const BLOCK = [180, 60];

function sample(name, text, offset, variant, width = 180) {
  const { scale, color, prefix } = VARIANT[variant];
  return label(name, `${prefix}${text}`, offset, { scale, color, size: [width, "default"] });
}

export const ui = {
  page,
  build(ctx) {
    const textSlot = ctx.slot(page.slots.text);
    const ids = {};
    for (const variant of page.variants) {
      const { scale, color, prefix } = VARIANT[variant];
      ids[variant] = ctx.def(`variant_${variant}`, {
        type: "panel", size: BLOCK,
        controls: [slotLabel("text", textSlot, [0, 0], BLOCK, { scale, color, prefix })],
      });
    }
    return [
      sample("title", "Title text", [0, 0], "title"),
      label("title_note", "title: 12 px, bold", [0, 14], { color: COLOR.dimText, scale: 0.5 }),
      sample("body", "Body text is the default block. It wraps when the line is too long.", [0, 26], "body"),
      label("body_note", "body: 8 px", [0, 46], { color: COLOR.dimText, scale: 0.5 }),
      sample("caption", "Caption text for small notes under a control.", [0, 58], "caption"),
      label("caption_note", "caption: 7 px", [0, 76], { color: COLOR.dimText, scale: 0.5 }),
      sample("inline", "InlineTextBlock: press §aConfirm§r to save, or §lhold§r to skip.", [0, 88], "body"),
      label("inline_note", "inline: format codes inside one label", [0, 108], { color: COLOR.dimText, scale: 0.5 }),
      label("server_caption", "From the server", [200, 0], { color: COLOR.dimText, scale: 0.55 }),
      slotLabel("variant_name", ctx.slot(page.slots.variantText), [290, 0], [100, 9], { scale: 0.55 }),
      keyedCell("server_text", ctx.slot(page.slots.variant), BLOCK, [200, 14], ids),
      slotButton("next_text", ctx.slot(page.slots.nextText), [200, 80], [60, 14], faceButton("Next text")),
      slotButton("next_variant", ctx.slot(page.slots.nextVariant), [264, 80], [60, 14], faceButton("Variant")),
    ];
  },
};
