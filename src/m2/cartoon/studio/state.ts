// The studio's own state (in Cartoon Land's, under 'studio'): the rooms' lights, the stacks of drawings as they lean,
// what moves that he stands on, what the staff throw, who's barking what, where he last stood safe (the reject pile and
// the paint vat cough him back up there). Rebuilt with the stage on every death; the lights outlive a death and the
// visit too (state.stageMemo: which rooms are lit), and what he's said and what the narrator's told him outlive a
// death for the rest of the visit (below, keyed by landVisit()).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, Block } from '../../../m1/types';
import type { Said } from '../section';
import type { Tower } from '../sway';
import type { MoverDef } from './layout';
import { cartoonState, landVisit } from '../section';
import { ROOMS } from './layout';

/** Been behind the screen (a later visit's the revisit: the lights on, the PA off, the staff gone home). */
export const STUDIO_DONE_MEMO = 'ct-studio-done';
/** Which rooms are lit (a bit each, ROOMS' order): the lights stay on through a death and after. */
export const STUDIO_LIT_MEMO = 'ct-studio-lit';

/** Something the staff threw: an intern's coffee (lobbed; it leaves a puddle, steaming, harmless), a guide's
 *  souvenir plate (flung flat, spinning; it smashes). */
export interface Throw {
  kind: 'coffee' | 'puddle' | 'plate';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy; dead?: boolean;
}
/** A moving platform: where it is, its block, him on it. */
export interface Mover { d: MoverDef; x: number; y: number; b: Block; on: boolean }

export interface Studio {
  towers: Tower[];
  movers: Mover[];
  throws: Throw[];
  barks: Map<Enemy, Said>; barkAt: number;
  /** Each room's light (0 dark .. 1 up), and frames since it was switched on (-1: not yet). */
  light: number[]; on: number[];
  /** His feet's last safe spot (on the floor or a desk, never a stack or a cel). */
  safe: { x: number; y: number };
  /** The pile's (or the vat's) coughed him up: frames left of it showing. */
  spat: number;
  /** Back after the tour's done (the house lights up, the PA off). */
  revisit: boolean;
}

export const studioOf = (state: GameState) => cartoonState<Studio>(state, 'studio', () => ({
  towers: [], movers: [], throws: [], barks: new Map(), barkAt: -999,
  light: ROOMS.map(() => 0), on: ROOMS.map(() => -1), safe: { x: 0, y: 0 }, spat: 0, revisit: false,
}));

/** Which rooms are lit (the memo's bits). */
export const litRooms = (state: GameState) => Number(state.stageMemo[STUDIO_LIT_MEMO] || 0);
export const markLit = (state: GameState, i: number) => { state.stageMemo[STUDIO_LIT_MEMO] = String(litRooms(state) | (1 << i)); };

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
