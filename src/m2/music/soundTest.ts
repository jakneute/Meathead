// The sound test (the cheat panel's MUSIC row): every composed song in every arrangement, one after the other;
// whatever it's playing wins over the game's own cue (cues.ts), unmuffled.

import { SONGS } from './songs/index';

export interface Cue { song: string; arr?: string }

let test: Cue | null = null;
let at = -1;

/** Every song and arrangement there is, in order. */
export const allCues = (): Cue[] => Object.entries(SONGS).flatMap(([song, s]) => Object.keys(s.arrangements ?? { main: 0 }).map(arr => ({ song, arr })));
export const soundTestCue = () => test;
/** Plays this (or stops the test: null). */
export const setSoundTest = (cue: Cue | null) => { test = cue; if (!cue) at = -1; };
/** On to the next (or back to the last) song or arrangement; past either end, the test's off. */
export const stepSoundTest = (d: number) => {
  const list = allCues();
  if (!list.length) { setSoundTest(null); return; }
  at = ((at + d + 1 + list.length + 1) % (list.length + 1)) - 1;
  test = at < 0 ? null : list[at];
};
/** What it's on, for the panel. */
export const soundTestLabel = () => {
  if (!test) return 'OFF';
  const s = SONGS[test.song];
  return `${s?.title ?? test.song}${test.arr && test.arr !== 'main' ? ` / ${test.arr}` : ''}`.toUpperCase();
};
