import { COLOR, rect, slotWrap } from "../lib.mjs";
import { panel, box } from "./_batch_b.mjs";
import { itemContent } from "./_batch_e.mjs";

const vanillaSlotMappings = [
  { from_button_id: "button.menu_select", to_button_id: "button.container_take_all_place_all", mapping_type: "pressed" },
  { from_button_id: "button.menu_ok", to_button_id: "button.container_take_all_place_all", mapping_type: "pressed" },
  { from_button_id: "button.menu_secondary_select", to_button_id: "button.container_take_half_place_one", mapping_type: "pressed" },
  { from_button_id: "button.menu_select", to_button_id: "button.coalesce_stack", mapping_type: "double_pressed" },
  { to_button_id: "button.shape_drawing", mapping_type: "pressed" },
  { to_button_id: "button.container_slot_hovered", mapping_type: "pressed" },
];

export function dragCell(name, slot, size, offset, overlay = []) {
  return {
    [name]: panel(size, offset, [
      { well: box(size, [0, 0], COLOR.outline, COLOR.boxBorder, { layer: 1 }) },
      slotWrap("slot", size, [0, 0], {
        button: {
          type: "button", size, collection_index: slot,
          default_control: "default", hover_control: "hover", pressed_control: "pressed",
          bindings: [{ binding_type: "collection_details", binding_collection_name: "container_items" }],
          button_mappings: vanillaSlotMappings,
          controls: [
            { default: { type: "panel", size: ["100%", "100%"] } },
            { hover: rect(COLOR.white, ["100%", "100%"], [0, 0], { alpha: 0.2 }) },
            { pressed: rect(COLOR.white, ["100%", "100%"], [0, 0], { alpha: 0.3 }) },
          ],
        },
      }, 2),
      { content: panel(size, [0, 0], itemContent(slot, size), { layer: 6 }) },
      ...(overlay.length ? [{ overlay: panel(size, [0, 0], overlay, { layer: 10 }) }] : []),
    ], { layer: 2 }),
  };
}
