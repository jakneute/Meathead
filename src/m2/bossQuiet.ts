// The land's own noise, kept to where he can hear it and out of the big fights (the user's: "make sure any latent
// environmental sounds don't play or activate during boss/sub boss fights").
//
//   markBossFight   every boss and sub-boss fight calls it each frame it's on (intro to death); while it's marked,
//                   the land's latent hazards (set gear on a timer, ambient machinery, tells, clicks, whooshes, drips)
//                   neither run nor make a sound: they check inBossFight. What belongs to the fight's own design is
//                   the fight's, and never checks it.
//   heard           a hazard's sound only plays when where it is is on the screen or just off it (never far-off gear
//                   ticking away somewhere he can't see); envSound does both checks at once.

import type { GameState } from '../m1/game/core/state';
import { playSound } from '../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../m1/constants';

type SoundType = Parameters<typeof playSound>[0];

const MARKED = new WeakMap<GameState, number>();

/** A boss or sub-boss fight is on this frame. */
export const markBossFight = (state: GameState) => { MARKED.set(state, state.frame); };

/** A boss or sub-boss fight's on (marked this frame or last: whichever of the hazards and the fight updates first). */
export const inBossFight = (state: GameState) => {
  const at = MARKED.get(state);
  if (at === undefined) return false;
  const d = state.frame - at;
  return d >= 0 && d <= 1;
};

/** Where it is, on the screen or just off it (`margin` past either edge). */
export const heard = (state: GameState, x: number, margin = 240) =>
  x > state.camera.x - margin && x < state.camera.x + CANVAS_WIDTH + margin;

/** Somewhere along `a`..`b` (a stretch: a rain cloud, a gust's reach, a beam), on the screen or just off it. */
export const heardSpan = (state: GameState, a: number, b: number, margin = 240) =>
  Math.max(a, b) > state.camera.x - margin && Math.min(a, b) < state.camera.x + CANVAS_WIDTH + margin;

/** A latent environmental sound from `x`: only near the screen, never during a boss or sub-boss fight. */
export const envSound = (state: GameState, x: number, type: SoundType, vol?: number, pitch?: number) => {
  if (inBossFight(state) || !heard(state, x)) return;
  playSound(type, vol, pitch);
};
