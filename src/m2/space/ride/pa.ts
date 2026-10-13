// The ride's PA (m2.space.ridepa), out of the speaker in the sled's headrest: one line at a time, never over anybody
// (it waits for the floor); a story's lines said through in order, then Meathead's say back if he has one; a newer
// story waits for the one going to finish (only the newest waits: he's not made to sit through a backlog). The words
// go up over the headrest, only while they're said.

import type { GameState } from '../../../m1/game/core/state';
import { meatheadSays, voice, type Said } from '../section';
import { say, isTalking, pickLine } from '../../../m1/game/platform/speech';
import { PA } from './lines';

const PA_VOICE = 'm2.space.ridepa';
interface Pa { gen: number; state: GameState; said: Said | null; busy: boolean; left: string[]; reply: string | null; next: string | null; done: Set<string> }
let gen = 0;
const PAS = new WeakMap<object, Pa>();
const paOf = (state: GameState): Pa => {
  const key = state.stage as object;
  let pa = PAS.get(key);
  if (!pa) { pa = { gen: ++gen, state, said: null, busy: false, left: [], reply: null, next: null, done: new Set() }; PAS.set(key, pa); }
  return pa;
};
const WAIT_MS = 150;
const afterQuiet = (pa: Pa, go: () => void) => {
  if (pa.gen !== gen) return;
  if (isTalking()) { setTimeout(() => afterQuiet(pa, go), WAIT_MS); return; }
  go();
};
const sayNext = (pa: Pa) => {
  if (pa.gen !== gen) return;
  pa.said = null;
  if (!pa.left.length) {
    if (pa.reply) { const r = pa.reply; pa.reply = null; pa.busy = true; afterQuiet(pa, () => meatheadSays(pa.state, r, true, once(() => sayNext(pa)))); return; }
    const nx = pa.next; pa.next = null;
    if (!nx) { pa.busy = false; return; }
    load(pa, nx);
  }
  pa.busy = true;
  sayLine(pa, pa.left.shift()!);
};
const once = (f: () => void) => { let d = false; return () => { if (!d) { d = true; f(); } }; };
const sayLine = (pa: Pa, line: string) => afterQuiet(pa, () => {
  let over = false;
  const next = () => { if (over) return; over = true; if (pa.gen === gen) pa.said = null; sayNext(pa); };
  const s = { text: line };
  const shown = say(line, voice(PA_VOICE), 'queue', {
    always: true,
    onShow: spoken => { if (pa.gen === gen) pa.said = s; if (!spoken) setTimeout(next, Math.max(1800, line.length * 70)); },
    onHide: next,
    onDropped: () => { if (!over) { over = true; if (pa.gen === gen) sayLine(pa, line); } },
  });
  if (!shown) { over = true; setTimeout(() => sayLine(pa, line), WAIT_MS); }
});
const load = (pa: Pa, id: string) => {
  const st = PA[id];
  pa.left = [...st.lines]; pa.reply = st.reply ? pickLine(st.reply) : null;
};

/** A story (by id: lines.ts PA), once a go. Something going: it waits its turn (only the newest waits). */
export const paStory = (state: GameState, id: string) => {
  const pa = paOf(state);
  if (pa.done.has(id)) return;
  pa.done.add(id);
  if (pa.busy) { pa.next = id; return; }
  load(pa, id);
  sayNext(pa);
};
/** What it's saying right now (null: nothing). */
export const paSaying = (state: GameState) => paOf(state).said;
/** Stops it (the lights up; the crash): nothing waiting either. */
export const paHush = (state: GameState) => { const pa = paOf(state); pa.next = null; pa.reply = null; };
