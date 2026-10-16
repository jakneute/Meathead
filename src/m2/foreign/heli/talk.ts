// Who's talking up here (one voice at a time: nobody's words over anybody's). Harry's scripted lines and the landmarks'
// intros queue (they wait their turn); heckles, taunts and barks go only into quiet (dropped if anybody's talking).

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { speak } from '../section';
import { lookOf } from '../../adventure/temple/people';
import { heliOf } from './state';
import { HARRY, MECH_VOICE, GOON, GUEST, type MechId } from './lines';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import type { ByPants } from '../talk';

export const quiet = (state: GameState) => { const h = heliOf(state); return !h.harry && !h.harryBusy && !h.mech && !h.guest && !h.goonSaid; };

/** Every line Harry's said this life (the user: "make sure harry doesn't say the same thing twice in the same life"):
 *  cleared each stage build (a death starts the stage again: heli/index.ts build), here and in his arena. */
export const harrySaid = new Set<string>();
/** Harry's pool for Meathead's pants: his state's own lines, and the clean ones on top (the general abuse). */
export const harryPool = (bp: ByPants, pants: 'clean' | 'shitty' | 'nude') => (pants === 'clean' ? bp.clean : [...bp[pants], ...bp.clean]);
/** A line of Harry's he hasn't said this life (then pickLine's 45 s rule); none left: null (he goes quiet). */
export const harryPick = (pool: readonly string[]): string | null => { const fresh = pool.filter(l => !harrySaid.has(l)); return fresh.length ? pickLine(fresh) : null; };
/** byPants's state for him. */
export const pantsOf = (state: GameState): 'clean' | 'shitty' | 'nude' => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** Harry's fresh line from a by-pants group, for Meathead as he is. */
export const harryFrom = (state: GameState, bp: ByPants) => harryPick(harryPool(bp, pantsOf(state)));

/** Harry says it. after: waits its turn (a must: the script); otherwise only into quiet. No line (a pool's run dry
 *  this life): he says nothing, and what was to come after goes on. */
export const harrySays = (state: GameState, line: string | null, after = true, onDone?: () => void) => {
  const h = heliOf(state);
  if (line === null) { if (after) onDone?.(); return false; }
  if (!after && !quiet(state)) return false;
  harrySaid.add(line);
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
