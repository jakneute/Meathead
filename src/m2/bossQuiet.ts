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

const MARKED = new WeakMap<GameState, { at: number; name?: string }>();

/** A boss or sub-boss fight is on this frame; `name` says which (the music plays its theme: music/cues.ts,
 *  'boss:<name>'). Unnamed, the music works it out from the land and section it's in. */
export const markBossFight = (state: GameState, name?: string) => { MARKED.set(state, { at: state.frame, name }); };

/** A boss or sub-boss fight's on (marked this frame or last: whichever of the hazards and the fight updates first). */
export const inBossFight = (state: GameState) => {
  const m = MARKED.get(state);
  if (m === undefined) return false;
  const d = state.frame - m.at;
  return d >= 0 && d <= 1;
};

/** Which fight's on (the name it marked itself with), or null (none on, or it didn't say). */
export const bossFightName = (state: GameState) => (inBossFight(state) ? MARKED.get(state)?.name ?? null : null);

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
