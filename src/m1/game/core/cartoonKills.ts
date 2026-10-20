// Cartoon kills (Meathead 2's cartoon White House: the projection over the stage hides what really happens). While a
// stage has state.cartoonKills on, nothing bleeds: no blood or gore particles, no bodies left lying about; whatever's
// killed goes up in a cartoon puff of smoke (stars and all) and is gone. The kill still counts the way any kill does
// (its drop, his line over it, the callout): the enemy's left on the list, dead, for the rest of the frame it died in,
// then it's dropped. A body he sends flying still flies (and still bowls over whoever it hits: no blood off it) and
// goes up in its puff where it comes down.
//
// The engine's death paths call poofEnemy where they'd leave a body; the game draws the puff (setPoofHook).

import type { Enemy, Particle } from '../../types';
import type { GameState } from './state';
import { isGoreColor } from './effects';

let hook: ((state: GameState, e: Enemy) => void) | null = null;
/** The game's puff (drawn and sounded however it likes): called once per enemy, the frame it goes. */
export const setPoofHook = (fn: ((state: GameState, e: Enemy) => void) | null) => { hook = fn; };

/** Are kills cartoon kills here, now? */
export const cartoonKills = (state: GameState) => !!state.cartoonKills;

/** Gone, in a puff: dead, not drawn, off the list next frame. Once only. */
export const poofEnemy = (state: GameState, e: Enemy) => {
  if (e.poofed) return;
  e.poofed = true;
  e.isBlownAway = true; e.health = Math.min(e.health, 0);
  hook?.(state, e);
  e.vel = { x: 0, y: 0 };
};

/** The reds the engine's hand-coded blood uses (on top of its gore palette). */
const REDS = new Set(['#DC2626', '#B91C1C', '#EF4444', '#7F1D1D', '#991B1B', '#F87171', '#8B0000', '#7F0000', '#660000', '#450A0A']);
const isBlood = (p: Particle) => p.isBossGore || isGoreColor(p.color) || REDS.has(p.color) || (typeof p.color === 'string' && p.color.startsWith('rgba(220,38,38'));

/** Every frame (cartoon kills on): any blood made since, wiped before it's ever drawn. */
export const purgeCartoonGore = (state: GameState) => {
  if (!state.cartoonKills) return;
  state.particles = state.particles.filter(p => !isBlood(p));
};
