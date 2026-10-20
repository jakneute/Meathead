// Sillyville Square's own state (in Cartoon Land's, under 'kiddie'): the towers as they sway, what the cast throw, the
// ride hits' cooldowns, who's barking what, what he's said, where he last stood safe (the ball pits spit him back
// there). Rebuilt with the stage on every death; what he's said outlives a death for the rest of the visit (said.ts
// below, keyed by landVisit()).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Tower } from '../sway';
import { cartoonState, landVisit } from '../section';

/** Something the cast threw: the hat cat's hat (out and back), a Whatsit's kite (on its string), a painter's paint
 *  blob, a paint splat left on the ground. */
export interface Throw {
  kind: 'hat' | 'kite' | 'paint' | 'splat';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy; dead?: boolean;
  /** The hat: out (+1) or coming back (-1); the kite: its phase ('fly' | 'tell' | 'dive' | 'up'). */
  dir?: number; phase?: string; tx?: number; ty?: number;
}

export interface Kiddie {
  towers: Tower[];
  throws: Throw[];
  /** Ride hits on the cast: frame each was last hit (no hitting one every frame). */
  rideHit: WeakMap<Enemy, number>;
  barks: Map<Enemy, Said>; barkAt: number;
  /** His feet's last safe spot (on the ground or a ledge, never a tower or a ride). */
  safe: { x: number; y: number };
  /** The pit's spat him out: frames left of it showing. */
  spat: number;
}

export const kiddieOf = (state: GameState) => cartoonState<Kiddie>(state, 'kiddie', () => ({
  towers: [], throws: [], rideHit: new WeakMap(), barks: new Map(), barkAt: -999, safe: { x: 0, y: 0 }, spat: 0,
}));

/** Been in through the studio's door (a later visit's the revisit: its arrival line, and the rides shut for the day). */
export const KIDDIE_DONE_MEMO = 'ct-kiddie-done';
/** The revisit: the rides shut down for the day (the carousel's CLOSED chain, the fish down, the train and the trolley
 *  parked, nothing running), the shops' cards turned to CLOSED, the balloons popped. */
export const shut = (state: GameState) => !!state.stageMemo[KIDDIE_DONE_MEMO];

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
