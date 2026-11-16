export const NS = "iubc";
export const TITLE = "§b§w§b§c";
export const PAGE_BASE = 10;
export const PAGE_SLOTS = 180;
export const PICKER_BASE = 190;
export const SLOT = { pageKey: 1, pageTitle: 2, status: 3, pickerState: 4, footer: 5, picker: 6, prev: 7, next: 8 };

export const rgb = (r, g, b) => [r / 255, g / 255, b / 255];
export const COLOR = {
  panel: rgb(49, 50, 51),
  outline: rgb(30, 30, 31),
  green: rgb(60, 133, 39),
  grayHalf: rgb(140, 141, 144),
  ring: rgb(36, 36, 37),
  face: rgb(208, 209, 212),
  faceShade: rgb(88, 88, 90),
  boxBorder: rgb(72, 73, 74),
  white: [1, 1, 1],
  text: [0.9, 0.9, 0.9],
  dimText: [0.62, 0.62, 0.64],
  darkText: rgb(30, 30, 31),
};

export const CLEAN = "(#hover_text - '§o' - '§f' - '§r')";
export const slotText = { binding_type: "collection", binding_collection_name: "container_items", binding_name: "#hover_text", binding_condition: "always" };
export const topLeft = { anchor_from: "top_left", anchor_to: "top_left" };

export const view = (source, target, control) => ({
  binding_type: "view", binding_condition: "always", source_property_name: source, target_property_name: target,
  ...(control ? { source_control_name: control } : {}),
});

export const rect = (color, size, offset, extra = {}) => ({ type: "image", texture: "textures/ui/White", color, size, offset, ...topLeft, ...extra });

export function slotWrap(name, size, offset, child, layer = 1) {
  return {
    [name]: {
      type: "stack_panel", orientation: "vertical", collection_name: "container_items", size, offset, ...topLeft, layer,
      controls: [child],
    },
  };
}

export function label(name, text, offset, { scale = 0.6, color = COLOR.text, layer = 3, size } = {}) {
  return { [name]: { type: "label", localize: false, text, color, ...topLeft, offset, font_scale_factor: scale, layer, ...(size ? { size } : {}) } };
}

export const KEEP_FORMAT = "(#hover_text - '§o')";

export function slotLabel(name, slot, offset, size, { scale = 0.6, prefix = "", color = COLOR.dimText, align = "left", keepFormat = false, layer = 3 } = {}) {
  const source = keepFormat ? KEEP_FORMAT : CLEAN;
  return slotWrap(name, size, offset, {
    value: {
      type: "label", localize: false, text: "#text", color, size, collection_index: slot, layer: 1,
      font_scale_factor: scale, text_alignment: align,
      bindings: [slotText, view(prefix ? `('${prefix}' + ${source})` : source, "#text")],
    },
  }, layer);
}

export function whenSlot(name, slot, size, offset, value, child, layer = 3) {
  return slotWrap(name, size, offset, {
    gate: {
      type: "panel", size, collection_index: slot, layer: 1,
      bindings: [slotText, view(`(${CLEAN} = '${value}')`, "#visible")],
      controls: [{ body: child }],
    },
  }, layer);
}

export const autoPlace = (from) => ({ from_button_id: from, to_button_id: "button.container_auto_place", mapping_type: "pressed", consume_event: false });

export function slotButton(name, slot, offset, size, { faces, visible, controls = [], layer = 4 } = {}) {
  const shown = faces ?? clearFaces();
  return {
    [name]: {
      type: "panel", size, offset, ...topLeft, layer,
      ...(visible ? { bindings: [visible] } : {}),
      controls: [
        slotWrap("button_wrap", size, [0, 0], {
          button: {
            type: "button", size, collection_index: slot,
            default_control: "default", hover_control: "hover", pressed_control: "pressed",
            sound_name: "random.click", sound_volume: 1.0, sound_pitch: 1.0,
            bindings: [{ binding_type: "collection_details", binding_collection_name: "container_items" }],
            button_mappings: [autoPlace("button.menu_select"), autoPlace("button.menu_ok")],
            controls: shown,
          },
        }, 2),
        ...(controls.length ? [{ above_faces: { type: "panel", size: ["100%", "100%"], layer: 20, controls } }] : []),
      ],
    },
  };
}

export function clearFaces() {
  return [
    { default: { type: "panel", size: ["100%", "100%"] } },
    { hover: { type: "panel", size: ["100%", "100%"] } },
    { pressed: rect([0, 0, 0], ["100%", "100%"], [0, 0], { alpha: 0.15 }) },
  ];
}

export function keyedCell(name, slot, size, offset, ids, layer = 3) {
  const bag = { "#k": [] };
  for (const key of Object.keys(ids)) bag[`#k${key}`] = [key];
  return slotWrap(`${name}_wrap`, size, offset, {
    [name]: {
      type: "stack_panel", size, collection_index: slot,
      factory: { name: `${name}_factory`, control_ids: ids },
      property_bag: bag,
      bindings: [slotText, view(`('#k' + ${CLEAN})`, "#collection_length")],
    },
  }, layer);
}

function sliderBar(suffix) {
  return {
    type: "panel", size: ["100%", 14],
    controls: [
      { [`track${suffix}`]: { type: "image", texture: "textures/ui/White", color: COLOR.outline, size: ["100%", "100%"], layer: 1 } },
      { [`fill${suffix}`]: { type: "image", texture: "textures/ui/White", color: COLOR.green, alpha: 0, size: ["100% - 2px", "100% - 2px"], layer: 3, clip_direction: "left", clip_pixelperfect: false } },
    ],
  };
}

export const sliderStepCenter = (width, steps, k) => 1 + Math.round((k * (width - 2)) / (steps - 1));

function snappedParts(name, width, steps) {
  const atStep = (k) => [view(`(#slider_value = ${k})`, "#visible", name)];
  return Array.from({ length: steps }, (_, k) => {
    const center = sliderStepCenter(width, steps, k);
    return [
      { [`snap_fill${k}`]: rect(COLOR.green, [Math.max(center - 1, 1), 12], [1, 3], { layer: 5, bindings: atStep(k), ...(center > 1 ? {} : { alpha: 0 }) }) },
      { [`snap_thumb${k}`]: { ...thumb([7, 18], [center - 3, 0]), layer: 6, bindings: atStep(k) } },
    ];
  }).flat();
}

export function customSlider(name, { width, steps, offset, value = 0 }) {
  return {
    type: "slider", size: [width, 18], offset, ...topLeft, layer: 2,
    slider_name: name, slider_track_button: name, slider_direction: "horizontal", slider_steps: steps,
    slider_box_control: "knob", default_control: "bar", hover_control: "bar_hover",
    background_control: "track", background_hover_control: "track_hover", progress_control: "fill", progress_hover_control: "fill_hover",
    always_handle_pointer: true, focus_enabled: true,
    property_bag: { "#slider_steps": steps, "#slider_value": value, "#slider_timeout": 0.25 },
    button_mappings: [{ from_button_id: "button.menu_select", to_button_id: name, mapping_type: "pressed", button_up_right_of_first_refusal: true }],
    controls: [
      {
        knob: {
          type: "slider_box", size: [7, 18], anchor_from: "center", anchor_to: "center", layer: 4,
          default_control: "default", hover_control: "hover", locked_control: "locked", indent_control: "indent",
          controls: ["default", "hover", "locked", "indent"].map((state) => ({ [state]: { type: "panel", size: [7, 18] } })),
        },
      },
      { bar: sliderBar("") },
      { bar_hover: { ...sliderBar("_hover"), visible: false } },
      ...snappedParts(name, width, steps),
    ],
  };
}

export function releaseSlider(name, { width, steps, offset, slotOfStep }) {
  const slider = customSlider(name, { width, steps, offset });
  const emptyFaces = ["default", "hover", "pressed"].map((state) => ({ [state]: { type: "panel", size: ["100%", "100%"] } }));
  return [
    { [name]: { ...slider, layer: 3 } },
    ...Array.from({ length: steps }, (_, k) => slotWrap(`${name}_step${k}`, [width, 18], offset, {
      button: {
        type: "button", size: [width, 18], collection_index: slotOfStep(k),
        default_control: "default", hover_control: "hover", pressed_control: "pressed",
        bindings: [{ binding_type: "collection_details", binding_collection_name: "container_items" }, view(`(#slider_value = ${k})`, "#visible", name)],
        button_mappings: [{ from_button_id: "button.menu_select", to_button_id: "button.container_auto_place", mapping_type: "global", consume_event: false }],
        controls: emptyFaces,
      },
    }, 1)),
  ];
}

export function thumb(size, offset, extra = {}) {
  return {
    type: "panel", size, offset, ...topLeft, layer: 5, ...extra,
    controls: [
      { outline: rect(COLOR.outline, size, [0, 0], { layer: 1 }) },
      { face: rect(COLOR.face, [size[0] - 2, size[1] - 2], [1, 1], { layer: 2 }) },
      { bevel: rect(COLOR.white, [size[0] - 2, 1], [1, 1], { layer: 3, alpha: 0.6 }) },
      { shade: rect(COLOR.faceShade, [size[0] - 2, 2], [1, size[1] - 3], { layer: 3 }) },
    ],
  };
}

export function pageContext(key) {
  const defs = {};
  return {
    key,
    slot: (n) => {
      if (n < 0 || n >= PAGE_SLOTS) throw new Error(`${key}: page slot ${n} out of range`);
      return PAGE_BASE + n;
    },
    def: (name, body) => {
      defs[`${key}_${name}`] = body;
      return `@${NS}.${key}_${name}`;
    },
    defs,
  };
}
