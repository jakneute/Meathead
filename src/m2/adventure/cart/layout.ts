// The mine cart's track: where the rail runs (and the gaps between), the beams, the scanner and the fork, the ramp at
// the end (shared by the section's running, index.ts, and its painting, art.ts).

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.cart;
export const X = x0;

// ---------------------------------------------------------------------------------------------------------------
// The track: runs of rail (x from, x to, y from, y to: from X, and from GY), with the gaps between them

export const RUNS: [number, number, number, number][] = [
  [0, 1200, 0, 0],            // the loading station, out of it (slowly), the scanner, the fork
  [1200, 1950, 0, -260],      // UNFRIENDLY GUESTS: up the hill (and getting going)
  [1950, 2500, -260, -260],
  [2500, 2900, -260, -200],   // down a dip
  [3060, 3800, -200, -200],   // (the first gap: 160; the first beam)
  [3800, 4700, -200, -260],
  [4700, 7400, -260, -260],   // (the checkpoint) THE SHOW: the idols' darts, one at a time (rim-high: jump; head-high: duck)
  [7400, 7800, -260, -180],
  [7800, 8600, -180, -180],   // the Serpent of Doom (duck)
  [8760, 9700, -180, -180],   // the rolling boulder, over the set (jump it)
  [9700, 10100, -180, -240],
  [10100, 11300, -240, -240], // the rolling boulder, the big one, out of the wall behind him (outrun it: on a bit)
  [11480, 12900, -220, -220], // (the checkpoint; halfway: Artie) and from here, all of it at once
  [13080, 14300, -160, -160],
  [14480, 15000, -160, -260],
  [15000, 15700, -260, -100],
  [15880, 17400, -100, -100],
  [17400, 17700, -100, -180], // (the checkpoint)
  [17700, 18900, -180, -180],
  [19060, 19800, -180, -180],
  [19800, 20400, -180, -100],
  [20400, 21300, -100, -100],
  [21480, 22800, -100, -100],
  [22980, 23400, -100, -100], // and the ramp
].map(([a, b, ya, yb]) => [X + a, X + b, GY + ya, GY + yb]);
/** Where it curves up to go straight up, and how tight; where the straight-up rail ends (they fly off it). */
export const RAMP_X = X + 23400, RAMP_R = 200, RAMP_Y = GY - 100, RAIL_TOP = RAMP_Y - RAMP_R - 520;
/** Low beams over the track (duck). */
export const BEAMS = [3450, 12500, 15300, 16650, 20500, 21900].map(b => X + b);
/** Halfway: Safari Artie comes up behind him. */
export const SCANNER_X = X + 760, FORK_X = X + 1150, CHASE_X = X + 11800;

// ---------------------------------------------------------------------------------------------------------------
// The ride's tricks, from the guests' side (the temple backstage showed them from behind: temple/), set to real on the
// unfriendly track. Taught one at a time through the first half, all mixed up through the second.

/**
 * The idols: carved heads on plinths at the track's far edge, facing back down it; a volley of darts out of the mouth
 * (rim-high, `high` false: over the cart's rim, jump it; head-high: duck). Each set off as the cart comes (once a go).
 */
export const IDOLS: { x: number; high: boolean }[] = [
  { x: 6100, high: false }, { x: 7250, high: true },
  { x: 12850, high: true }, { x: 13950, high: false }, { x: 18150, high: false }, { x: 18800, high: true }, { x: 22150, high: true },
].map(d => ({ ...d, x: X + d.x }));
/** The Serpent of Doom: out of its hole in the rock behind the track, lunging out across it at head height (duck). */
export const SNAKES = [8250, 16300, 19420].map(x => X + x);
/** The rolling boulder, lobbed over the set (the catapult behind it): where it comes down on the track, to roll back at
 *  him (jump it). */
export const LOBS = [9450, 17100, 20950, 22450].map(x => X + x);
/** The big one: the doors in the fake rock wall it bursts out of behind him (outrun it to the gap: it goes down that). */
export const CHASE_DOORS = X + 10180;
/** Out of the station it rolls slowly to here (the scanner and the fork: there to be seen), then gets up to speed. */
export const SLOW_TO = FORK_X + 250;
/** (where the camera holds a moment, rolling by: the scanner, the switch and both signs in view at once) */
export const FORK_CAM_X = X + 590;
/** Past the last gap: the end of the line, a cutscene from here (no more steering). */
export const OUTRO_X = RAMP_X - 280;
/** How far the beam's bottom is over the rail, and how far down in the cart his feet are. */
export const BEAM_CLEAR = 66, SINK = 14;

export const runAt = (x: number) => RUNS.find(r => x >= r[0] && x <= r[1]);
export const trackY = (x: number): number | null => { const r = runAt(x); return r ? r[2] + ((x - r[0]) / (r[1] - r[0])) * (r[3] - r[2]) : null; };
/** How the track leans at x (radians: up a hill to the right, negative), from its height either side; `y` for where
 *  there's no track (a gap). */
export const slopeAt = (x: number, y: (x: number) => number | null = trackY) => {
  const a = y(x - 14), b = y(x + 14);
  return a === null || b === null ? null : Math.atan2(b - a, 28);
};
/** (Artie's cart: over a gap, it hops it) */
export const artieTrackY = (x: number) => {
  const y = trackY(x);
  if (y !== null) return y;
  const before = [...RUNS].reverse().find(r => r[1] < x), after = RUNS.find(r => r[0] > x);
  if (!before || !after) return GY;
  const u = (x - before[1]) / (after[0] - before[1]);
  return before[3] + (after[2] - before[3]) * u - Math.sin(u * Math.PI) * 70;
};

