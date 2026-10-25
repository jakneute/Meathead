// The sound test (the title's once a file's cleared the game, the cheat panel's): every composed song in every
// arrangement, browsed by folder (the user's: "make the sound test a selectable option with folders you can browse
// through... clear out duplicates" / "separate songs based on the 'lands' they come from"): GENERAL, then a folder per
// land in the park's order; in each, a song with more than one arrangement is a folder of them. Each arrangement's
// listed once: a song filed under more than one cue (the red mist under the ceiling's, the Road Rash chase under the
// teenagers', the pundits' one march under each of the five), and an arrangement that's note for note another of its
// song's (`main: {}` beside `jungle: {}`: listed under the other's name). The portal walk's and the walk-away's songs
// aren't in it (HIDDEN). Whatever it's playing wins over the game's own cue (cues.ts), unmuffled.

import { SONGS } from './songs/index';

export interface Cue { song: string; arr?: string }
/** A track: its row's label (in its song's folder, just the arrangement), and its whole name (NOW PLAYING). */
export interface Track extends Cue { label: string; full: string }
export interface Folder { name: string; items: Item[] }
export type Item = Track | Folder;
export const isFolder = (it: Item): it is Folder => 'items' in it;

/** The folders, and the cues in each, in order (a cue in none of them lands in OTHER). */
const FILED: { name: string; keys: string[] }[] = [
  { name: 'GENERAL', keys: ['title', 'hub', 'staff', 'intro', 'gym', 'jingle:victory', 'jingle:death'] },
  { name: 'JUNGLE LAND', keys: ['land:adventure', 'seq:river', 'seq:mine-cart', 'seq:temple-collapse', 'boss:trex', 'boss:safari-artie'] },
  { name: 'SPOOKY LAND', keys: ['land:spooky', 'seq:ceiling', 'seq:clock-tower', 'seq:satan', 'boss:demon', 'boss:donnie-dracula'] },
  { name: 'FUTURE LAND', keys: ['land:space', 'seq:space-train', 'boss:ufo', 'seq:stalker', 'boss:space-queen'] },
  { name: 'HOLLYWOOD LAND', keys: ['land:hollywood', 'seq:coaster', 'boss:ensemble-cast', 'seq:disaster-ride', 'seq:havoc', 'boss:stuntman-steve'] },
  { name: 'FOREIGN LANDS', keys: ['land:foreign', 'seq:heli', 'boss:heli-gauntlet', 'boss:helicopter-harry'] },
  { name: 'WILDERNESS LAND', keys: ['land:frontier', 'seq:train', 'seq:brawl', 'seq:duel', 'seq:draw', 'seq:log-ride', 'seq:road-rash', 'boss:tucker'] },
  { name: 'FAIRY LAND', keys: ['land:fantasy', 'boss:fairy-wheel', 'seq:tragons', 'boss:broomsticks', 'boss:piper'] },
  { name: 'CARTOON LAND', keys: ['land:cartoon', 'boss:perot', 'boss:stupid-dad'] },
];
/** Left out of it altogether, wherever they're filed: the portal walk's and the walk-away's songs (the user's: "remove
 *  the heading in and walk it off songs from the sound test"). */
const HIDDEN = (song: string) => /^(portal|walkaway)(:|$)/.test(song);
/** Arrangement ids as the player sees them: the lands by their names on screen (land-names), a few code names spelled
 *  out; the rest as they are. */
const SAYS: Record<string, string> = {
  adventure: 'JUNGLE LAND', spooky: 'SPOOKY LAND', space: 'FUTURE LAND', hollywood: 'HOLLYWOOD LAND', foreign: 'FOREIGN LANDS',
  frontier: 'WILDERNESS LAND', fantasy: 'FAIRY LAND', cartoon: 'CARTOON LAND', whitehouse1: 'WHITE HOUSE', whitehouse2: 'WHITE HOUSE II',
  act1: 'ACT 1', act2: 'ACT 2', act3: 'ACT 3', bigben: 'BIG BEN', logride: 'LOG RIDE', dirtbike: 'DIRT BIKE', qte: 'SHOWDOWN',
};
const name = (arr: string) => SAYS[arr] ?? arr.replace(/-/g, ' ').replace(/(\D)(\d)$/, '$1 $2').toUpperCase();

let tree: Folder[] | null = null;
/** The folders, each arrangement once in all of them. */
export const soundTree = (): Folder[] => {
  if (tree) return tree;
  const seen = new Set<unknown>();
  const itemsOf = (keys: string[]): Item[] => keys.flatMap((song): Item[] => {
    const s = SONGS[song];
    if (!s || HIDDEN(song)) return [];
    const title = (s.title ?? song).toUpperCase();
    if (!s.arrangements) {
      if (seen.has(s)) return [];
      seen.add(s);
      return [{ song, label: title, full: title }];
    }
    // (arrangements note for note the same, by what's in them: small, so compared whole; listed by the names that
    // aren't 'main')
    const groups = new Map<string, string[]>();
    for (const [arr, a] of Object.entries(s.arrangements)) {
      if (seen.has(a)) continue;
      seen.add(a);
      const plays = Object.entries(s.parts).map(([k, d]) => +!((d.only && !d.only.includes(arr)) || d.not?.includes(arr)) + k);
      const j = JSON.stringify([a, plays]);
      groups.set(j, [...(groups.get(j) ?? []), arr]);
    }
    const tracks = [...groups.values()].map((arrs): Track => {
      const named = arrs.filter(a => a !== 'main');
      const label = named.length ? named.map(name).join(' / ') : 'MAIN';
      return { song, arr: arrs[0], label, full: `${title} (${label})` };
    });
    // (one: the song's own row, by its title; one of several (the rest listed under another cue), by both)
    if (tracks.length === 1) {
      const t = tracks[0];
      return [Object.keys(s.arrangements).length > 1 ? { ...t, label: t.full } : { ...t, label: title, full: title }];
    }
    return tracks.length ? [{ name: title, items: tracks }] : [];
  });
  const out = FILED.map(f => ({ name: f.name, items: itemsOf(f.keys) }));
  const filed = new Set(FILED.flatMap(f => f.keys));
  const other = itemsOf(Object.keys(SONGS).filter(k => !filed.has(k)));
  if (other.length) out.push({ name: 'OTHER', items: other });
  tree = out.filter(f => f.items.length);
  return tree;
};
/** Every track, in the tree's order (the cheat panel's < > step through these): flattened the once. */
let flatList: Track[] | null = null;
export const allTracks = (): Track[] => {
  if (flatList) return flatList;
  const flat = (its: Item[]): Track[] => its.flatMap(it => (isFolder(it) ? flat(it.items) : [it]));
  return (flatList = flat(soundTree()));
};
/** How many tracks are in a folder, all the way down (counted the once). */
const counts = new WeakMap<Folder, number>();
export const trackCount = (f: Folder): number => {
  let n = counts.get(f);
  if (n === undefined) { n = f.items.reduce((k, it) => k + (isFolder(it) ? trackCount(it) : 1), 0); counts.set(f, n); }
  return n;
};
/** The track playing this. */
export const trackOf = (cue: Cue | null) => (cue ? allTracks().find(t => t.song === cue.song && t.arr === cue.arr) ?? null : null);

let test: Cue | null = null;
let at = -1;

export const soundTestCue = () => test;
/** Plays this (or stops the test: null). */
export const setSoundTest = (cue: Cue | null) => {
  // (only what's in it: anything else (a hidden song, a cue gone since) stops it)
  at = cue ? allTracks().findIndex(t => t.song === cue.song && t.arr === cue.arr) : -1;
  test = at < 0 ? null : cue;
};
/** On to the next (or back to the last) track; past either end, the test's off. */
export const stepSoundTest = (d: number) => {
  const list = allTracks();
  if (!list.length) { setSoundTest(null); return; }
  at = ((at + d + 1 + list.length + 1) % (list.length + 1)) - 1;
  test = at < 0 ? null : list[at];
};
/** What it's on, for the panel. */
export const soundTestLabel = () => (test ? trackOf(test)?.full ?? 'OFF' : 'OFF');
