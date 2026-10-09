// A line at a time: whoever's next says theirs once the last one's done (and a beat after), so nobody talks over
// anybody. Shared by the queue and the river (Artie's monologue runs through one of these).

import type { GameState } from '../../../m1/game/core/state';
import { speak, meatheadSays } from '../section';

export interface Line {
  /** 'meathead', or a voice id. */
  voice: string;
  text: string;
  /** What's shown over the one saying it (null when it's done). Not needed for Meathead (the engine shows his). */
  set?: (s: string | null) => void;
  /** Said: what to do then. */
  then?: () => void;
}
export interface Talk { q: Line[]; busy: boolean; gap: number; current: Line | null }
export const talk = (): Talk => ({ q: [], busy: false, gap: 0, current: null });

/** Each frame: the next line out, if it's time. */
export const stepTalk = (state: GameState, t: Talk, beat = 24) => {
  if (t.gap > 0) t.gap--;
  if (t.busy || t.gap > 0 || !t.q.length) return;
  const l = t.q.shift()!;
  t.busy = true; t.current = l;
  const done = () => { t.busy = false; t.current = null; t.gap = beat; l.then?.(); };
  if (l.voice === 'meathead') meatheadSays(state, l.text, true, done);
  else speak(l.voice, l.text, s => l.set?.(s ? s.text : null), true, done);
};
export const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
