const STATUSES = [
  { key: "online", label: "Online" },
  { key: "away", label: "Away" },
  { key: "busy", label: "Busy" },
];

export const page = {
  key: "playercard",
  title: "PlayerCard",
  statuses: STATUSES,
  slots: { wave: 0, status: 1, entity: 10, name: 11, statusKey: 12, statusText: 13, level: 14, activity: 15 },
  buttons: [0, 1],
  init: () => ({ status: 0, waves: 0 }),
  render: (state, env) => ({
    10: `"${env.playerId}"`,
    11: `§r${env.playerName}`,
    12: STATUSES[state.status].key,
    13: STATUSES[state.status].label,
    14: "Level 12, 340 of 500 XP",
    15: state.waves ? `${env.playerName} waved ${state.waves === 1 ? "once" : `${state.waves} times`}` : "No activity yet",
  }),
  press: (state, slot, env) => {
    if (slot === 0) {
      state.waves++;
      state.animation = "animation.bwiki.inventory_ui_enhanced_components.wave";
      return `${env.playerName} waves`;
    }
    state.status = (state.status + 1) % STATUSES.length;
    return `status ${STATUSES[state.status].label}`;
  },
};
