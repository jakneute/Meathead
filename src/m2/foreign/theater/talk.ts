// Who's talking in the theater (one voice at a time, nobody's words over anybody's): the narrator over the house
// speakers (his lines queue: they wait their turn), the whole house chanting (only into quiet: never over anybody), and
// somebody in the seats shouting (only into quiet, and only now and then).

import type { GameState } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { lookOf } from '../../adventure/temple/people';
import { speak } from '../section';
import type { Theater } from './state';
import { NARRATOR, CHORUS, GUEST } from './lines';

export const quiet = (T: Theater) => !T.pa && !T.paBusy && !T.chant && !T.guest;

/** The narrator says it (queued: after whoever's talking). */
export const narrate = (T: Theater, line: string, onDone?: () => void, after = true) => {
  T.paBusy = true;
  let done = false;
  speak(NARRATOR, line, s => { T.pa = s; }, after, () => { if (done) return; done = true; T.paBusy = false; onDone?.(); });
};

/** The whole house (only into quiet). */
export const chant = (T: Theater, pool: string[]) => {
  if (!quiet(T)) return;
  speak(CHORUS, pickLine(pool), s => { T.chant = s; }, false);
};

/** Somebody in the seats (a man or a woman by seed), over where they sit (world x): only into quiet, a beat apart. */
export const guestSay = (state: GameState, T: Theater, pool: string[], x: number, gap = 300) => {
  if (!quiet(T) || state.frame - T.guestAt < gap) return;
  T.guestAt = state.frame;
  const seed = Math.floor(x * 13 + state.frame);
  speak(lookOf(seed).woman ? GUEST.f : GUEST.m, pickLine(pool), s => { T.guest = s ? { s, x } : null; }, false);
};
