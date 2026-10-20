// The tour's PA (m2.cartoon.narrator, out of the horn speakers along the ceiling): one line at a time, never over
// anybody (it waits for the floor); a room's story said through in order, then Meathead's say back if it has one; a
// newer story waits for the one going to finish (only the newest waits: he's not made to sit through a backlog if he
// runs on ahead). Each story once a visit (a death doesn't start the tape over). The words go up on screen only while
// they're said (index.ts draws them).

import type { GameState } from '../../../m1/game/core/state';
import { meatheadSays, voice, byPants, landVisit, type Said } from '../section';
import { say, isTalking, pickLine } from '../../../m1/game/platform/speech';
import { STORIES, NARRATOR } from './lines';

interface Pa { gen: number; state: GameState; said: Said | null; busy: boolean; left: string[]; reply: string | null; next: string | null }
let gen = 0;
const PAS = new WeakMap<object, Pa>();
const paOf = (state: GameState): Pa => {
  const key = state.stage as object;
  let pa = PAS.get(key);
  if (!pa) { pa = { gen: ++gen, state, said: null, busy: false, left: [], reply: null, next: null }; PAS.set(key, pa); }
  return pa;
};
/** What's been told this visit. */
let doneVisit = -1;
const done = new Set<string>();
const told = (id: string) => {
  if (doneVisit !== landVisit()) { doneVisit = landVisit(); done.clear(); }
  if (done.has(id)) return true;
  done.add(id);
  return false;
};

const WAIT_MS = 150;
const afterQuiet = (pa: Pa, go: () => void) => {
  if (pa.gen !== gen) return;
  if (isTalking()) { setTimeout(() => afterQuiet(pa, go), WAIT_MS); return; }
  go();
};
const once = (f: () => void) => { let d = false; return () => { if (!d) { d = true; f(); } }; };
const sayNext = (pa: Pa) => {
  if (pa.gen !== gen) return;
  pa.said = null;
  if (!pa.left.length) {
    if (pa.reply) {
      const r = pa.reply; pa.reply = null; pa.busy = true;
      afterQuiet(pa, () => { if (pa.state.player.health > 0) meatheadSays(pa.state, r, true, once(() => sayNext(pa))); else sayNext(pa); });
      return;
    }
    const nx = pa.next; pa.next = null;
    if (!nx) { pa.busy = false; return; }
    load(pa, nx);
  }
  pa.busy = true;
  sayLine(pa, pa.left.shift()!);
};
const sayLine = (pa: Pa, line: string) => afterQuiet(pa, () => {
  let over = false;
  const next = () => { if (over) return; over = true; if (pa.gen === gen) pa.said = null; sayNext(pa); };
  const s = { text: line };
  const shown = say(line, voice(NARRATOR), 'queue', {
    always: true,
    onShow: spoken => { if (pa.gen === gen) pa.said = s; if (!spoken) setTimeout(next, Math.max(1800, line.length * 70)); },
    onHide: next,
    onDropped: () => { if (!over) { over = true; if (pa.gen === gen) sayLine(pa, line); } },
  });
  if (!shown) { over = true; setTimeout(() => sayLine(pa, line), WAIT_MS); }
});
const load = (pa: Pa, id: string) => {
  const st = STORIES[id];
  pa.left = [...st.lines]; pa.reply = st.reply ? pickLine(byPants(pa.state, st.reply)) : null;
};

/** A room's story (by id: lines.ts STORIES), once a visit. Something going: it waits its turn (only the newest waits). */
export const paStory = (state: GameState, id: string) => {
  if (told(id)) return;
  const pa = paOf(state);
  if (pa.busy) { pa.next = id; return; }
  load(pa, id);
  sayNext(pa);
};
/** What it's saying right now (null: nothing). */
export const paSaying = (state: GameState) => paOf(state).said;
