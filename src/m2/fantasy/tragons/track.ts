// The tracks' shape, as things stand: each lane's height and depth (layout.ts's keys) with the loops, corkscrews and the
// braid the ride's put on them (ride.ts resolves the script's `spin`s into these as they come up: whose lane), and the
// scene's one eye that every depth is drawn about. Shared by the ride (where the cars are, what he's stood on) and the
// drawing.
//
// A LOOP (the classic side view of one): the track runs on forward at the ride's pace and swings round a circle on
// top of that (x + r sin th, up r (1 - cos th)): r bigger than the pace's own radius, so it really loops over itself,
// faster through the bottom, slow over the top, the train turned right round with it. A CORKSCREW: the track winds
// round a line along the ride, up and over and back down, toward the viewer and away (its depth swinging), the train
// rolled right over with it (drawn squashed through the roll, upside down at the top). THE CHAIN: two lanes' loops,
// one pushed in toward the viewer, the other back away, half a loop apart: through each other like two links. THE
// TRIPLE HELIX: all three lanes wound round one line, a third of a turn apart, in and out of each other. THE FINALE:
// three loops, one near, one middling, one far, each a bit after the last.

import { wxOf, laneY, laneD, type Lane, type LoopKind } from './layout';

/** A loop / corkscrew / braid strand on a lane, from track position s0 for len: its size, its depth push, its phase
 *  (the braid's third of a turn), how many turns, what it came of (for the warnings and the spiel), and whether it's
 *  the first (the card). */
export interface Spin {
  kind: LoopKind; lane: Lane; s0: number; len: number; r: number; dz: number; ph: number; turns: number;
  /** The script's event it came of (its lanes go together in the warnings); its warning's length (frames); the first. */
  ev: number; w: number; teach?: boolean;
}

/** A point of track, before the depth's put on: world x (the play plane's), y, its depth, how far it's rolled. */
export interface Pt { x: number; y: number; d: number; roll: number }

/** The braid's ends: eased in and out over this much track. */
const BRAID_IN = 520;
const sm = (u: number) => { const k = Math.max(0, Math.min(1, u)); return k * k * (3 - 2 * k); };

/** Where lane's track is at s (the trains `dist` along), with whatever's spun on it; into `o`. */
export const trackPt = (spins: Spin[], dist: number, lane: Lane, s: number, o: Pt = { x: 0, y: 0, d: 1, roll: 0 }): Pt => {
  o.x = wxOf(dist, s); o.y = laneY(lane, s); o.d = laneD(lane, s); o.roll = 0;
  for (const q of spins) {
    if (q.lane !== lane || s <= q.s0 || s >= q.s0 + q.len) continue;
    const u = (s - q.s0) / q.len;
    if (q.kind === 'cork') {
      const ph = u * Math.PI * 2 * q.turns;
      // (round the line: up and over, in toward the viewer and back; rolled right over with it; eased in at the ends so
      // the track doesn't kink)
      const e = sm(u * 6) * sm((1 - u) * 6);
      o.y -= q.r * (1 - Math.cos(ph)) * e;
      o.d += q.dz * Math.sin(ph) * e;
      o.roll = ph;
    } else if (q.kind === 'braid') {
      // (all three round one line a little above the middle lane, a third of a turn apart, eased onto it and off)
      const w = sm((s - q.s0) / BRAID_IN) * sm((q.s0 + q.len - s) / BRAID_IN);
      const ph = u * Math.PI * 2 * q.turns + q.ph;
      const cy = laneY(1, s) - q.r * 0.4;
      o.y += (cy - q.r * Math.sin(ph) - o.y) * w;
      o.d += (1 + q.dz * Math.cos(ph) - o.d) * w;
      o.roll = (u * Math.PI * 2 * q.turns) * w;
    } else {
      // (a loop: on round the circle, the circle's own pace a/r of the ride's)
      const a = q.len / (Math.PI * 2), th = (s - q.s0) / a;
      o.x += q.r * Math.sin(th);
      o.y -= q.r * (1 - Math.cos(th));
      o.d += q.dz * (1 - Math.cos(th)) * 0.5;
    }
  }
  return o;
};

/** Is lane's track spun at s (a loop, corkscrew or braid: he's locked in there)? */
export const spinAt = (spins: Spin[], lane: Lane, s: number) => spins.find(q => q.lane === lane && s > q.s0 - 6 && s < q.s0 + q.len + 6) ?? null;

/** The scene's one eye (the user's fake-3D rule): every depth's drawn about it, the track, the trains, him on them. */
export interface Eye { x: number; y: number }
/** A world point at depth d, about the eye: where it's drawn (and where it is, for the ride's physics). */
export const proj = (e: Eye, x: number, y: number, d: number) => ({ x: e.x + (x - e.x) * d, y: e.y + (y - e.y) * d });
