const TEXTS = [
  "Welcome back. Your world was saved a moment ago.",
  "The server wrote this line into a slot name.",
  "Inline styles work inside one label: §agreen§7, §cred§7 and §lbold§7.",
  "Long text wraps to the next line when it is wider than the block, so a few sentences fit in one place.",
];
const VARIANTS = ["title", "body", "caption"];

export const page = {
  key: "textblock",
  title: "TextBlock",
  variants: VARIANTS,
  slots: { nextText: 0, nextVariant: 1, text: 10, variant: 11, variantText: 12 },
  buttons: [0, 1],
  init: () => ({ text: 0, variant: 1 }),
  render: (state) => ({
    10: TEXTS[state.text],
    11: VARIANTS[state.variant],
    12: `Variant: ${VARIANTS[state.variant]}`,
  }),
  press: (state, slot) => {
    if (slot === 0) {
      state.text = (state.text + 1) % TEXTS.length;
      return `text ${state.text + 1} of ${TEXTS.length}`;
    }
    state.variant = (state.variant + 1) % VARIANTS.length;
    return `variant ${VARIANTS[state.variant]}`;
  },
};
