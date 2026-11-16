import { page } from "../../bp/scripts/pages/playerlist.js";
import { COLOR, rect, label, slotLabel } from "../lib.mjs";
import { panel, box, button, disabledButton } from "./_batch_b.mjs";
import { TINT, gate, badge } from "./_batch_f.mjs";

const ROW = [280, 16];
const PITCH = 18;
const TOP = 20;
const ROLE = { at: [96, 2], size: [40, 12] };
const STATUS = { at: [142, 2], size: [56, 12] };
const ACTION = { at: [230, 1], size: [46, 14] };
const SIDE = 290;

const STATUS_LOOK = {
  ready: { text: "Ready", fill: COLOR.green, border: [0, 0, 0], color: COLOR.white },
  waiting: { text: "Waiting", fill: COLOR.face, border: [0, 0, 0], color: COLOR.darkText },
  afk: { text: "AFK", fill: TINT.amber, border: [0, 0, 0], color: COLOR.white },
  out: { text: "Not in lobby", fill: COLOR.outline, border: COLOR.boxBorder, color: COLOR.dimText },
};

const ROLE_LOOK = {
  host: { text: "Host", fill: COLOR.outline, border: COLOR.white, color: COLOR.white },
  member: { text: "Member", fill: COLOR.outline, border: COLOR.boxBorder, color: COLOR.dimText },
};

function row(ctx, i, player) {
  const statusSlot = ctx.slot(page.slots.status + i);
  const actionSlot = ctx.slot(page.slots.button + i);
  const { text, ...look } = ROLE_LOOK[player.role];
  const statuses = Object.entries(STATUS_LOOK).map(([key, { text: value, ...tone }]) =>
    gate(`status_${key}`, statusSlot, key, STATUS.size, STATUS.at, [badge("badge", STATUS.size, [0, 0], value, tone)]));
  const actions = player.role === "host"
    ? [gate("action_host", actionSlot, "host", ACTION.size, ACTION.at, [disabledButton("kick", [0, 0], ACTION.size, "Kick")])]
    : [
      gate("action_kick", actionSlot, "kick", ACTION.size, ACTION.at, [button("kick", ctx.slot(page.slots.action + i), [0, 0], ACTION.size, "Kick", "danger")]),
      gate("action_invite", actionSlot, "invite", ACTION.size, ACTION.at, [button("invite", ctx.slot(page.slots.action + i), [0, 0], ACTION.size, "Invite", "primary")]),
    ];
  return {
    [`row${i}`]: panel(ROW, [0, TOP + i * PITCH], [
      { back: box(ROW, [0, 0], COLOR.outline, COLOR.boxBorder, { layer: 1 }) },
      label("name", player.name, [6, 5], { color: COLOR.white, scale: 0.65, layer: 6 }),
      gate("name_dim", statusSlot, "out", [86, 12], [2, 2], [{ veil: rect(COLOR.outline, [86, 12], [0, 0], { alpha: 0.6 }) }], 8),
      badge("role", ROLE.size, ROLE.at, text, look),
      ...statuses,
      ...actions,
    ], { layer: 1 }),
  };
}

export const ui = {
  page,
  build(ctx) {
    const head = (name, text, x) => label(name, text, [x, 11], { color: COLOR.dimText, scale: 0.5 });
    return [
      label("intro", "A lobby list. Kick removes a player, Invite brings them back.", [0, 0], { color: COLOR.dimText, scale: 0.55 }),
      head("head_name", "Player", 6),
      head("head_role", "Role", ROLE.at[0]),
      head("head_status", "Status", STATUS.at[0]),
      head("head_action", "Action", ACTION.at[0]),
      ...page.players.map((player, i) => row(ctx, i, player)),
      label("side_caption", "Lobby", [SIDE, 20], { color: COLOR.dimText, scale: 0.5 }),
      slotLabel("counter", ctx.slot(page.slots.counter), [SIDE, 30], [104, 10], { color: COLOR.white, scale: 0.9 }),
      slotLabel("last", ctx.slot(page.slots.last), [SIDE, 46], [104, 20], { color: COLOR.text, scale: 0.55 }),
      label("host_note", "The host row cannot be kicked.", [SIDE, 70], { color: COLOR.dimText, scale: 0.5, size: [104, 20] }),
    ];
  },
};
