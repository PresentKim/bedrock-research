const N = 10;
const SLOT = { cell: 0, position: 100, valueText: 101 };
const valueOf = (k) => k * 10 + 5;

export const page = {
  key: "xyslider",
  title: "XYSlider",
  size: N,
  slots: SLOT,
  buttons: Array.from({ length: N * N }, (_, k) => SLOT.cell + k),
  init: () => ({ x: 4, y: 4 }),
  render: (s) => ({
    [SLOT.position]: `x${s.x}y${s.y}`,
    [SLOT.valueText]: `X ${valueOf(s.x)}  Y ${valueOf(s.y)}`,
  }),
  press: (s, slot) => {
    const index = slot - SLOT.cell;
    s.x = index % N;
    s.y = Math.floor(index / N);
    return `xy ${valueOf(s.x)}, ${valueOf(s.y)}`;
  },
};
