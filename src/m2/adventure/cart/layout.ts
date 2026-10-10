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
  [4700, 5400, -260, -260],   // (the checkpoint; Artie)
  [5580, 6200, -260, -200],
  [6200, 6900, -200, -200],
  [7080, 7500, -200, -120],
  [7500, 8200, -120, -120],
  [8400, 9000, -120, -260],
  [9000, 9700, -260, -100],
  [9880, 10600, -100, -100],
  [10600, 11200, -100, -100],
  [11380, 11700, -100, -100], // and the ramp
].map(([a, b, ya, yb]) => [X + a, X + b, GY + ya, GY + yb]);
/** Where it curves up to go straight up, and how tight; where the straight-up rail ends (they fly off it). */
export const RAMP_X = X + 11700, RAMP_R = 200, RAMP_Y = GY - 100, RAIL_TOP = RAMP_Y - RAMP_R - 520;
/** Low beams over the track (duck). */
export const BEAMS = [3450, 6500, 7850, 9500, 10300, 10950].map(b => X + b);
export const SCANNER_X = X + 760, FORK_X = X + 1150, CHASE_X = X + 5450;
/** Out of the station it rolls slowly to here (the scanner and the fork: there to be seen), then gets up to speed. */
export const SLOW_TO = FORK_X + 250;
/** (where the camera holds a moment, rolling by: the scanner, the switch and both signs in view at once) */
export const FORK_CAM_X = X + 590;
/** Past the last gap: the end of the line, a cutscene from here (no more steering). */
export const OUTRO_X = X + 11420;
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

