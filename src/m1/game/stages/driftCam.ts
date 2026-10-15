// The rides the view rolls along with (Artie's ski run, Ernie's jet ski, Hector's boat chase): the view goes on at the
// ride's cruising speed, and pushing on or easing off takes him up and back across the screen, so his speed against
// the world's is right there to see. Let be, he eases back to his spot; held, he settles toward the front or the back
// of the screen; past the margins, the view goes with him. How fast he really goes is the ride's own business: only
// the view's changed.

/** How hard he's drawn back to his spot (a share of how far off it he is, px a frame). */
const SETTLE = 0.012;

/**
 * A frame of it: how far he is ahead of his spot on the screen (world px, + ahead; - behind), having gone `moved` px
 * this frame while the view went `cruise` (and a little toward him). Kept between `back` and `front`. `hold`: the view
 * goes with him this frame, however far that is (knocked about, he's no say in his speed: it's no use him sliding off
 * the back of the screen for it).
 */
export const driftStep = (drift: number, moved: number, cruise: number, back: number, front: number, hold = false) => {
  if (hold) return drift;
  return Math.max(-back, Math.min(front, drift + moved - (cruise + drift * SETTLE)));
};

/** ...and easing back to his spot (the ride's done with, or he's out of it): a little of the way every frame. */
export const driftHome = (drift: number) => (Math.abs(drift) < 0.5 ? 0 : drift * 0.93);
