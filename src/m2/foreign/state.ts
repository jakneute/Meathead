// The streets' own state (one lot per stage build, shared by every pavilion: they flow into each other): what's flying
// (shots.ts), what's been said (each once), who's saying what over their heads, the PA.
//
// Talking (dialogue rules): one voice at a time, nobody's words over anybody else's; the cast's barks are rare and
// never on top of each other or the PA; Meathead's arrival and gag lines wait for the PA to finish.

import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { pickLine } from '../../m1/game/platform/speech';
import { speak, meatheadSays, type Said } from './section';
import type { Shot } from './shots';

export interface Streets {
  shots: Shot[];
  said: Record<string, boolean>;
  /** What the PA's saying, while it's said; it has a line going (or waiting); its last word (frame). */
  pa: Said | null; paBusy: boolean; paAt: number;
  /** Somebody's bark over their head, while it's said; the last bark (frame). */
  barks: WeakMap<Enemy, Said>; barkAt: number;
  /** Meathead's last line (frame), so his gags don't pile up. */
  saidAt: number;
  /** Bursts going off (fireworks, the opera's high note): world, the frame it went, how big. */
  bursts: { x: number; y: number; at: number; r: number; col: string }[];
}

const ST = new WeakMap<object, Streets>();
export const streetsOf = (state: GameState): Streets => {
  const k = state.stage as object;
  let s = ST.get(k);
  if (!s) { s = { shots: [], said: {}, pa: null, paBusy: false, paAt: -9999, barks: new WeakMap(), barkAt: -9999, saidAt: -9999, bursts: [] }; ST.set(k, s); }
  return s;
};

import { PA_VOICE } from './talk';
export { PA_VOICE };

/** The PA says something (in the queue: nothing over anything). */
export const paSay = (state: GameState, line: string, onDone?: () => void) => {
  const o = streetsOf(state);
  o.paAt = state.frame; o.paBusy = true;
  let done = false;
  speak(PA_VOICE, line, s => { o.pa = s; }, true, () => { if (done) return; done = true; o.paBusy = false; onDone?.(); });
};

/** Somebody's bark over their head (rare; never on top of another, or the PA): in their own voice. */
export const bark = (state: GameState, e: Enemy, voice: string, pool: string[], chance = 0.4) => {
  const o = streetsOf(state);
  if (o.pa || o.paBusy || state.frame - o.barkAt < 200 || Math.random() > chance) return;
  o.barkAt = state.frame;
  speak(voice, pickLine(pool), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};

/** Once only (by key): `go`. */
export const once = (state: GameState, key: string, go: () => void) => {
  const o = streetsOf(state);
  if (o.said[key]) return;
  o.said[key] = true; go();
};

/** Meathead's say (a gag passing something, once by key): not over the PA, not over a bark, not right on his last. */
export const gag = (state: GameState, key: string, lines: string[]) => {
  const o = streetsOf(state), p = state.player;
  if (o.said[key] || o.pa || o.paBusy || p.inCutscene || p.health <= 0 || state.frame - o.saidAt < 240) return;
  o.said[key] = true; o.saidAt = state.frame;
  meatheadSays(state, pickLine(lines), true);
};
