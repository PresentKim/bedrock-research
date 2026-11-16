const leaves = (...names) => names.map((name) => ({ name, children: [] }));
const node = (name, children) => ({ name, children });

const ROOT = node("Home", [
  node("Worlds", [
    node("Survival", [
      node("Settings", leaves("Game Rules", "Difficulty", "Cheats")),
      node("Backups", leaves("Monday", "Tuesday")),
      node("Players", leaves("Steve", "Alex")),
    ]),
    node("Creative", [
      node("Settings", leaves("Game Rules", "Difficulty")),
      node("Backups", leaves("Monday")),
    ]),
    node("Hardcore", [node("Settings", leaves("Game Rules"))]),
  ]),
  node("Packs", leaves("Resource Packs", "Behavior Packs")),
  node("Settings", leaves("Video", "Audio", "Controls", "Accessibility")),
  node("Profile", leaves("Skins", "Achievements")),
]);

const CRUMBS = 5;
const CHILDREN = 4;
const SLOTS = { crumb: 0, child: 10, crumbText: 20, crumbState: 30, childText: 40, childState: 50, empty: 60, info: 61 };

const nodesOf = (path) => path.reduce((trail, index) => [...trail, trail[trail.length - 1].children[index]], [ROOT]);

export const page = {
  key: "breadcrumb",
  title: "Breadcrumb",
  crumbs: CRUMBS,
  children: CHILDREN,
  slots: SLOTS,
  buttons: [
    ...Array.from({ length: CRUMBS }, (_, k) => SLOTS.crumb + k),
    ...Array.from({ length: CHILDREN }, (_, k) => SLOTS.child + k),
  ],
  init: () => ({ path: [] }),
  render: (state) => {
    const trail = nodesOf(state.path);
    const here = trail[trail.length - 1];
    const names = {
      [SLOTS.empty]: here.children.length ? "" : `${here.name} has no items. Tap a crumb to go back.`,
      [SLOTS.info]: `Level ${trail.length} of ${CRUMBS}, ${here.children.length} items`,
    };
    for (let k = 0; k < CRUMBS; k++) {
      const crumb = trail[k];
      const current = k === trail.length - 1;
      names[SLOTS.crumbText + k] = crumb ? `${current ? "§f" : "§7"}${crumb.name}` : "";
      names[SLOTS.crumbState + k] = !crumb ? "none" : current ? "current" : "link";
    }
    for (let i = 0; i < CHILDREN; i++) {
      const child = here.children[i];
      names[SLOTS.childText + i] = child ? `§r${child.name}` : "";
      names[SLOTS.childState + i] = !child ? "none" : child.children.length ? "dir" : "leaf";
    }
    return names;
  },
  press: (state, slot) => {
    const trail = nodesOf(state.path);
    if (slot < SLOTS.child) {
      const level = slot - SLOTS.crumb;
      if (level >= trail.length - 1) return "already here";
      state.path = state.path.slice(0, level);
      return `breadcrumb back to ${trail[level].name}`;
    }
    const index = slot - SLOTS.child;
    const child = trail[trail.length - 1].children[index];
    if (!child) return "no item there";
    state.path = [...state.path, index];
    return `breadcrumb into ${child.name}`;
  },
};
