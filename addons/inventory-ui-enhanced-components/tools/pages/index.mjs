import { ui as textinput } from "./textinput.mjs";
import { ui as numberinput } from "./numberinput.mjs";
import { ui as keybinds } from "./keybinds.mjs";
import { ui as colorpicker } from "./colorpicker.mjs";
import { ui as radialmenu } from "./radialmenu.mjs";
import { ui as tutorial } from "./tutorial.mjs";
import { ui as barchart } from "./barchart.mjs";
import { ui as linechart } from "./linechart.mjs";
import { ui as itemgrid } from "./itemgrid.mjs";
import { ui as shopcard } from "./shopcard.mjs";
import { ui as recipeview } from "./recipeview.mjs";
import { ui as playercard } from "./playercard.mjs";
import { ui as playerlist } from "./playerlist.mjs";
import { ui as table } from "./table.mjs";
import { ui as treeview } from "./treeview.mjs";
import { ui as countdown } from "./countdown.mjs";
import { ui as patternlock } from "./patternlock.mjs";

export const UI_PAGES = [
  textinput, numberinput, keybinds, colorpicker, radialmenu, tutorial,
  barchart, linechart, itemgrid, shopcard, recipeview,
  playercard, playerlist, table, treeview, countdown, patternlock,
];
