// Who's saying what in the warehouse, in turn (never over each other): the first AD on the stage's bullhorn, somebody
// in the crowd at the fallen walls, one of the cast (by who they are: on the way in, up, or a body), the studio exec.

import type { GameState } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { speak } from '../section';
import { lookOf } from '../../adventure/temple/people';
import type { ByPants } from '../blvd/lines';
import { byPants } from '../blvd/kinds';
import { whOf } from './state';
import { AD_VOICE, ACTOR_VOICE_OF, GUEST_VOICES, EXEC_VOICE } from './lines';

/** A fixed line said in the last 45 s isn't said again yet (pickLine does it for pools). */
const lastSaid = new Map<string, number>();
export const fresh = (line: string) => { const t = Date.now(), l = lastSaid.get(line); if (l !== undefined && t - l < 45000) return false; lastSaid.set(line, t); return true; };

/** The AD on the bullhorn (in turn; `after` waits its turn, else it's dropped if somebody's talking). */
export const adSay = (state: GameState, pool: ByPants | string[], onDone?: () => void, after = true) => {
  const o = whOf(state);
  const line = Array.isArray(pool) ? pickLine(pool) : pickLine(byPants(state, pool));
  if (Array.isArray(pool) && !fresh(line)) { onDone?.(); return; }
  o.adBusy = true;
  let done = false;
  speak(AD_VOICE, line, s => { o.ad = s; }, after, () => { if (done) return; done = true; o.adBusy = false; onDone?.(); });
};
/** Somebody in the crowd at the fallen walls (a man or a woman by seed), over where they stand (x). */
export const crowdSay = (state: GameState, pool: ByPants, x: number, seed: number, onDone?: () => void) => {
  const o = whOf(state);
  let done = false;
  speak(lookOf(seed).woman ? GUEST_VOICES.f : GUEST_VOICES.m, pickLine(byPants(state, pool)), s => { o.crowd = s ? { s, x } : null; }, true, () => { if (done) return; done = true; onDone?.(); });
};
/** One of the cast (their own voice), shown over them wherever they are. */
export const castSay = (state: GameState, i: number, pool: ByPants, after: boolean, onDone?: () => void) => {
  const o = whOf(state);
  let done = false;
  speak(ACTOR_VOICE_OF[i], pickLine(byPants(state, pool)), s => { if (s) o.castSaid.set(i, s); else o.castSaid.delete(i); }, after, () => { if (done) return; done = true; onDone?.(); });
};
/** The studio executive (the ending), in turn, shown over him. */
export const execSay = (state: GameState, pool: string[], onDone?: () => void) => {
  const ex = whOf(state).ending.ex;
  let done = false;
  speak(EXEC_VOICE, pickLine(pool), s => { ex.said = s; }, true, () => { if (done) return; done = true; onDone?.(); });
};
