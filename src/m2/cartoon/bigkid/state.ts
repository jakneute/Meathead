// The big-kid zone's own state (in Cartoon Land's, under 'bigkid'): the towers as they sway, the rides as they roam
// (each its own little machine: rides.ts), what the cast throw and leave lying (cones, boards, loogies and the puddles
// they leave, churros), the ride hits' cooldowns, who's barking what, where he last stood safe (the glop pits spit him
// back there), the talking doll. Rebuilt with the stage on every death; what he's said outlives a death for the rest of
// the visit (keyed by landVisit()).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Tower } from '../sway';
import { cartoonState, landVisit } from '../section';

/** Something the cast threw, or left: a traffic cone (lobbed, then lying), the skate punk's board (skidding along the
 *  ground; he goes and gets it), a loogie (lobbed) and the sticky puddle it leaves, a churro (thrown flat). */
export interface Throw {
  kind: 'cone' | 'board' | 'glop' | 'puddle' | 'churro';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy; dead?: boolean;
  /** Lying on the ground now (a cone, a board): harmless, waiting. */
  down?: boolean;
}

/** A roaming ride's state (rides.ts says what each phase means for which ride). */
export interface Ride {
  /** Its middle (x), its feet (y: the ground, or up in a hop), going (dir), how fast (v); its vertical speed (a hop). */
  x: number; y: number; dir: 1 | -1; v: number; vy: number;
  phase: string; t: number;
  /** Where it's wandering to; how long till it'll line up on him again. */
  target: number; cool: number;
  /** A ride op's put it on him: frames left of it coming straight for him. */
  sic: number;
  /** A spin in place (bumper cars): its angle. */
  spin: number;
  /** The patch it keeps to (its middle's limits). */
  lo: number; hi: number;
  /** Which one (its colors, its riders). */
  k: number;
}

export interface BigKid {
  towers: Tower[];
  couch: Ride; bumpers: Ride[]; whirl: Ride; pod: Ride;
  throws: Throw[];
  /** Ride hits on the cast: frame each was last hit (no hitting one every frame). */
  rideHit: WeakMap<Enemy, number>;
  barks: Map<Enemy, Said>; barkAt: number;
  /** His feet's last safe spot (on the ground or a ledge, never a tower, a ride's way or the halfpipe). */
  safe: { x: number; y: number };
  /** Where he was last frame (the sticky puddles hold him back). */
  lastX: number;
  /** The talking doll: what it's saying (over the bin), when it last went off. */
  doll: Said | null; dollAt: number;
  /** The ride he was last sneered at for lining up (no sneering at every one). */
  sneerAt: number;
}

const ride = (x: number, lo: number, hi: number, k = 0, dir: 1 | -1 = 1): Ride => ({ x, y: 0, dir, v: 0, vy: 0, phase: 'roam', t: 0, target: x, cool: 120, sic: 0, spin: 0, lo, hi, k });
export const bigkidOf = (state: GameState) => cartoonState<BigKid>(state, 'bigkid', () => ({
  towers: [],
  couch: ride(0, 0, 0), bumpers: [], whirl: ride(0, 0, 0), pod: ride(0, 0, 0),
  throws: [], rideHit: new WeakMap(), barks: new Map(), barkAt: -999, safe: { x: 0, y: 0 }, lastX: 0,
  doll: null, dollAt: -9999, sneerAt: -9999,
}));
export const makeRide = ride;

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
