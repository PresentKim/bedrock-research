import { COLOR, slotWrap, slotButton, view } from "../lib.mjs";
import { TONE, FULL, panel, box, frame, centerText, chevron, darkFaces } from "./_batch_b.mjs";

const ICON = [16, 16];

const collectionValue = (name) => ({
  binding_type: "collection", binding_collection_name: "container_items", binding_name: name, binding_condition: "always",
});

export function itemIcon(name, slot, offset, layer = 4) {
  return slotWrap(name, ICON, offset, {
    icon: {
      type: "custom", renderer: "inventory_item_renderer", size: ICON, collection_index: slot, layer: 1,
      property_bag: { "#item_id_aux": 0 },
      bindings: [collectionValue("#item_id_aux")],
    },
  }, layer);
}

export function stackCount(name, slot, offset, size, layer = 6) {
  return slotWrap(name, size, offset, {
    count: {
      type: "label", localize: false, text: "#text", color: COLOR.white, shadow: true, size, collection_index: slot, layer: 1,
      font_scale_factor: 0.6, text_alignment: "right",
      bindings: [collectionValue("#inventory_stack_count"), view("('§r' + #inventory_stack_count)", "#text")],
    },
  }, layer);
}

export function itemContent(slot, size) {
  const [w, h] = size;
  return [
    itemIcon("item", slot, [Math.floor((w - ICON[0]) / 2), Math.floor((h - ICON[1]) / 2)]),
    stackCount("item_count", slot, [0, h - 8], [w - 1, 7]),
  ];
}

export function itemCell(name, slot, size, offset, layer = 2) {
  return { [name]: panel(size, offset, [{ well: box(FULL, [0, 0], COLOR.outline, COLOR.boxBorder, { layer: 1 }) }, ...itemContent(slot, size)], { layer }) };
}

export const cellFaces = () => darkFaces(COLOR.boxBorder, TONE.hoverLight);

export const selectionFrame = (size) => panel(size, [0, 0], [
  { outer: frame(FULL, [0, 0], COLOR.white, { layer: 1 }) },
  { inner: frame(["100% - 2px", "100% - 2px"], [1, 1], COLOR.white, { layer: 1 }) },
]);

export function smallButton(name, slot, offset, size, mark) {
  const content = mark === "left" || mark === "right"
    ? { mark: chevron(mark, [Math.floor((size[0] - 4) / 2), Math.floor((size[1] - 7) / 2)]) }
    : centerText(mark, COLOR.white);
  return slotButton(name, slot, offset, size, { faces: cellFaces(), controls: [content] });
}
