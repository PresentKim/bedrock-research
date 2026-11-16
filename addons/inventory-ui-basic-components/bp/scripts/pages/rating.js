const STARS = 5;
const VOTES = [5, 4, 4, 3, 3, 2];
const VOTE_SUM = VOTES.reduce((sum, vote) => sum + vote, 0);

function average(rating) {
  const count = VOTES.length + (rating ? 1 : 0);
  return { count, value: Math.round(((VOTE_SUM + rating) / count) * 2) / 2 };
}

const starState = (value, k) => (value >= k + 1 ? "full" : value >= k + 0.5 ? "half" : "none");

export const page = {
  key: "rating",
  title: "Rating",
  stars: STARS,
  slots: { star: 0, mine: 10, average: 15, text: 20, averageText: 21 },
  buttons: Array.from({ length: STARS }, (_, k) => k),
  init: () => ({ rating: 0 }),
  render: (state) => {
    const avg = average(state.rating);
    const names = {
      20: state.rating ? `Rated ${state.rating} of ${STARS}` : "Not rated yet",
      21: `Average ${avg.value.toFixed(1)} from ${avg.count} ratings`,
    };
    for (let k = 0; k < STARS; k++) {
      names[10 + k] = k < state.rating ? "on" : "off";
      names[15 + k] = starState(avg.value, k);
    }
    return names;
  },
  press: (state, slot) => {
    state.rating = state.rating === slot + 1 ? 0 : slot + 1;
    return state.rating ? `rated ${state.rating} of ${STARS}` : "rating cleared";
  },
};
