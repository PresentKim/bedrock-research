import { page } from "../../bp/scripts/pages/scroll.js";
import { COLOR, rgb, rect, slotButton, slotLabel, label, whenSlot, topLeft } from "../lib.mjs";

const TRACK = COLOR.outline;
const THUMB = rgb(177, 178, 181);
const LIST = [180, 140];
const TEXT = [190, 60];
const ROW = [LIST[0] - 8, 16];

const PARAGRAPH = [
  "This block scrolls inside the chest screen without the server.",
  "Drag the text or the bar on the right, or use the mouse wheel on PC.",
  "The bar sits 2 px from the right edge and is 4 px wide. The thumb height follows the ratio of the view to the content.",
  "The server never learns the scroll position. Only a press on a slot button inside the list reaches it, like the rows on the left.",
  "Ore UI can keep a scroll pinned to the end while content grows. That option is not shown here.",
].join(" ");

const pad = (name) => ({ [name]: { type: "panel", size: [2, "100%"] } });

function scrollPanel(name, size, offset, content) {
  return {
    [name]: {
      type: "input_panel", size, offset, ...topLeft, layer: 2, consume_hover_events: true,
      controls: [{
        view: {
          type: "scroll_view", size: ["100%", "100%"],
          scroll_speed: 15, touch_mode: "$touch", always_listen_to_input: true, always_handle_pointer: true,
          allow_scroll_even_when_content_fits: false,
          scrollbar_track_button: "button.scrollbar_skip_track", scrollbar_touch_button: "button.scrollbar_touch",
          scrollbar_track: "track", scrollbar_box: "box", scroll_content: "content",
          scroll_view_port: "port", scroll_box_and_track_panel: "bar",
          button_mappings: [{ from_button_id: "button.menu_select", to_button_id: "button.scrollbar_touch", mapping_type: "pressed", button_up_right_of_first_refusal: true }],
          bindings: [{ binding_name: "#gesture_control_enabled" }],
          controls: [{
            columns: {
              type: "stack_panel", orientation: "horizontal", size: ["100%", "100%"], ...topLeft,
              controls: [
                { port: { type: "panel", size: ["fill", "100%"], clips_children: true, layer: 1, controls: [{ content: { ...content, ...topLeft, layer: 1 } }] } },
                {
                  bar: {
                    type: "stack_panel", orientation: "horizontal", size: [8, "100%"],
                    controls: [
                      pad("left"),
                      {
                        rail: {
                          type: "panel", size: [4, "100%"],
                          controls: [
                            {
                              track: {
                                type: "scroll_track", size: ["100%", "100%"], layer: 2,
                                button_mappings: [{ from_button_id: "button.menu_select", to_button_id: "button.scrollbar_skip_track", mapping_type: "pressed" }],
                                controls: [{ rail_image: rect(TRACK, ["100%", "100%"], [0, 0], { layer: 1 }) }],
                              },
                            },
                            {
                              box: {
                                type: "scrollbar_box", ...topLeft, layer: 5, contained: true, draggable: "vertical",
                                button_mappings: [{ from_button_id: "button.menu_select", to_button_id: "button.menu_select", mapping_type: "pressed", button_up_right_of_first_refusal: true }],
                                controls: [{ thumb_image: rect(THUMB, ["100%", "100%"], [0, 0], { layer: 1 }) }],
                              },
                            },
                          ],
                        },
                      },
                      pad("right"),
                    ],
                  },
                },
              ],
            },
          }],
        },
      }],
    },
  };
}

function row(ctx, k) {
  const slot = ctx.slot(page.slots.row + k);
  const selected = ctx.slot(page.slots.selected);
  const cell = [ROW[0], ROW[1] - 2];
  return {
    [`row${k}`]: {
      type: "panel", size: ROW,
      controls: [
        { border: rect(COLOR.boxBorder, cell, [0, 1], { layer: 1 }) },
        { bg: rect(COLOR.outline, [cell[0] - 2, cell[1] - 2], [1, 2], { layer: 2 }) },
        whenSlot("picked", selected, cell, [0, 1], `r${k}`, {
          type: "panel", size: cell,
          controls: [
            { edge: rect(COLOR.white, cell, [0, 0], { layer: 1 }) },
            { fill: rect(rgb(60, 61, 62), [cell[0] - 2, cell[1] - 2], [1, 1], { layer: 2 }) },
            { mark: rect(COLOR.green, [3, cell[1] - 2], [1, 1], { layer: 3 }) },
          ],
        }),
        label("name", `Row ${k + 1}`, [8, 5], { scale: 0.6, layer: 7 }),
        slotButton("press", slot, [0, 1], cell, { layer: 6 }),
      ],
    },
  };
}

export const ui = {
  page,
  build(ctx) {
    const rows = {
      type: "stack_panel", orientation: "vertical", size: [ROW[0], "100%c"],
      controls: Array.from({ length: page.rows }, (_, k) => row(ctx, k)),
    };
    const text = {
      type: "stack_panel", orientation: "vertical", size: [TEXT[0] - 8, "100%c"],
      controls: [{ paragraph: { type: "label", localize: false, text: PARAGRAPH, color: COLOR.text, size: ["100%", "default"], font_scale_factor: 0.7 } }],
    };
    return [
      label("list_caption", "Scroll the list, then tap a row.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      scrollPanel("list", LIST, [0, 12], rows),
      slotLabel("picked", ctx.slot(page.slots.selectedText), [0, 156], [180, 9], { color: COLOR.text }),
      label("text_caption", "Long text in a scroll view", [200, 0], { color: COLOR.dimText, scale: 0.55 }),
      scrollPanel("text", TEXT, [200, 12], text),
    ];
  },
};
