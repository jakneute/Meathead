// Who's talking up here (one voice at a time: nobody's words over anybody's). Harry's scripted lines and the landmarks'
// intros queue (they wait their turn); heckles, taunts and barks go only into quiet (dropped if anybody's talking).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { speak } from '../section';
import { lookOf } from '../../adventure/temple/people';
import { heliOf } from './state';
import { HARRY, MECH_VOICE, GOON, GUEST, type MechId } from './lines';

export const quiet = (state: GameState) => { const h = heliOf(state); return !h.harry && !h.harryBusy && !h.mech && !h.guest && !h.goonSaid; };

/** Harry says it. `after`: waits its turn (a must: the script); otherwise only into quiet. */
export const harrySays = (state: GameState, line: string, after = true, onDone?: () => void) => {
  const h = heliOf(state);
  if (!after && !quiet(state)) return false;
  if (after) h.harryBusy = true;
  let done = false;
  speak(HARRY, line, s => { h.harry = s; }, after, () => { if (done) return; done = true; if (after) h.harryBusy = false; onDone?.(); });
  return true;
};

/** The landmark says it (over itself). */
export const mechSays = (state: GameState, id: MechId, line: string, after = true, onDone?: () => void) => {
  const h = heliOf(state);
  if (line === '...') { setTimeout(() => onDone?.(), 900); return true; }
  if (!after && !quiet(state)) return false;
  speak(MECH_VOICE[id], line, s => { h.mech = s; }, after, () => onDone?.());
  return true;
};

/** One of the lackeys (only into quiet, a beat apart). */
export const goonSays = (state: GameState, e: Enemy, woman: boolean, line: string) => {
  const h = heliOf(state);
  if (!quiet(state) || state.frame - h.goonBarkAt < 360) return;
  h.goonBarkAt = state.frame;
  speak(woman ? GOON.f : GOON.m, line, s => { h.goonSaid = s ? { s, e } : null; }, false);
};

/** Somebody in the queue he's skipping (only into quiet, a beat apart): over where they stand (world x). */
export const guestShouts = (state: GameState, line: string, x: number, seed: number) => {
  const h = heliOf(state);
  if (!quiet(state) || state.frame - h.guestAt < 150) return;
  h.guestAt = state.frame;
  speak(lookOf(seed).woman ? GUEST.f : GUEST.m, line, s => { h.guest = s ? { s, x } : null; }, false);
};
