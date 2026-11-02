// The land's own noise, kept to where he can hear it and out of the big fights (the user's: "make sure any latent
// environmental sounds don't play or activate during boss/sub boss fights").
//
//   markBossFight   every boss and sub-boss fight calls it each frame it's on (intro to death); while it's marked,
//                   the land's latent hazards (set gear on a timer, ambient machinery, tells, clicks, whooshes, drips)
//                   neither run nor make a sound: they check inBossFight. What belongs to the fight's own design is
//                   the fight's, and never checks it.
//   heard           a hazard's sound only plays when where it is is on the screen or just off it (never far-off gear
//                   ticking away somewhere he can't see); envSound does both checks at once, and fades the sound out
//                   just past the screen's edge (onScreen.ts). Pass the height where it's known: a floor away is far.

import type { GameState } from '../m1/game/core/state';
import { playSound } from '../m1/game/platform/audio';
import { offScreenBy, worldSound, midY } from './onScreen';

type SoundType = Parameters<typeof playSound>[0];

/** A fight's locked room, left to right (world x: its walls, its barricades). */
export interface BossArena { l: number; r: number }

const MARKED = new WeakMap<GameState, { at: number; name?: string; arena?: BossArena }>();

/** A boss or sub-boss fight is on this frame; `name` says which (the music plays its theme: music/cues.ts,
 *  'boss:<name>'). Unnamed, the music works it out from the land and section it's in. `arena`: the room it's locked
 *  in; while it's on, the land's own enemies outside it are gone (arenaClear.ts: the user's "there are regular enemies
 *  at the edges who try to attack me despite being barricaded from me"). */
export const markBossFight = (state: GameState, name?: string, arena?: BossArena) => { MARKED.set(state, { at: state.frame, name, arena }); };

/** The locked room of the fight that's on, if it said (null: none on, or a fight with no room: a chase, a flight). */
export const bossArena = (state: GameState) => (inBossFight(state) ? MARKED.get(state)?.arena ?? null : null);

/** A boss or sub-boss fight's on (marked this frame or last: whichever of the hazards and the fight updates first). */
export const inBossFight = (state: GameState) => {
  const m = MARKED.get(state);
  if (m === undefined) return false;
  const d = state.frame - m.at;
  return d >= 0 && d <= 1;
};

/** Which fight's on (the name it marked itself with), or null (none on, or it didn't say). */
export const bossFightName = (state: GameState) => (inBossFight(state) ? MARKED.get(state)?.name ?? null : null);

/** Where it is, on the screen or just off it (`margin` past either edge). Give `y` and a floor up or down counts too
 *  (onScreen.ts: the true 2D distance off the screen); without it, only how far off to the side. */
export const heard = (state: GameState, x: number, margin = 240, y?: number) =>
  offScreenBy(state, x, y ?? midY(state)) <= margin;

/** Somewhere along `a`..`b` (a stretch: a rain cloud, a gust's reach, a beam), on the screen or just off it. `y`/`h`:
 *  its height (top, and how tall), so a stretch a floor away isn't heard. */
export const heardSpan = (state: GameState, a: number, b: number, margin = 240, y?: number, h = 0) =>
  offScreenBy(state, Math.min(a, b), y ?? midY(state), Math.abs(b - a), y === undefined ? 0 : h) <= margin;

/** A latent environmental sound from `x` (and `y`, where it's known: a floor away is far): full on screen, fading out
 *  just past its edge (onScreen.ts), silent further off; never during a boss or sub-boss fight. */
export const envSound = (state: GameState, x: number, type: SoundType, vol = 1, pitch = 0, y?: number) => {
  if (inBossFight(state)) return;
  worldSound(state, type, vol, pitch, x, y);
};
