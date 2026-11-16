const PLAYERS = [
  { name: "Aurora", role: "host", status: "ready" },
  { name: "Nova", role: "member", status: "ready" },
  { name: "Pixel", role: "member", status: "waiting" },
  { name: "Ember", role: "member", status: "afk" },
  { name: "Quill", role: "member", status: "ready" },
  { name: "Rook", role: "member", status: "waiting" },
  { name: "Sable", role: "member", status: "afk" },
  { name: "Wren", role: "member", status: "out" },
];

export const page = {
  key: "playerlist",
  title: "PlayerList",
  players: PLAYERS,
  slots: { action: 0, status: 20, button: 30, counter: 40, last: 41 },
  buttons: PLAYERS.map((_, i) => i).filter((i) => PLAYERS[i].role !== "host"),
  init: () => ({ status: PLAYERS.map((p) => p.status), last: "Tap Kick or Invite on a row" }),
  render: (state) => {
    const names = {};
    const present = state.status.filter((s) => s !== "out").length;
    const ready = state.status.filter((s) => s === "ready").length;
    state.status.forEach((s, i) => {
      names[20 + i] = s;
      names[30 + i] = PLAYERS[i].role === "host" ? "host" : s === "out" ? "invite" : "kick";
    });
    names[40] = `Ready ${ready} of ${present}`;
    names[41] = state.last;
    return names;
  },
  press: (state, slot) => {
    const player = PLAYERS[slot];
    if (state.status[slot] === "out") {
      state.status[slot] = "waiting";
      state.last = `Invited ${player.name}`;
      return `playerlist invited ${player.name}`;
    }
    state.status[slot] = "out";
    state.last = `Kicked ${player.name}`;
    return `playerlist kicked ${player.name}`;
  },
};
