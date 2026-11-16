export function holdTap(state, tap) {
  state.pendingTap = tap;
}

export function markDragMoved(state) {
  state.dragMoved = true;
}

export function settleTap(state) {
  const tap = state.pendingTap;
  const moved = state.dragMoved;
  state.pendingTap = undefined;
  state.dragMoved = false;
  if (tap === undefined) return {};
  return moved ? { dropped: tap } : { tap };
}
