// The sound test (the title's once a file's cleared the game, the cheat panel's): every composed song in every
// arrangement, browsed by folder (the user's: "make the sound test a selectable option with folders you can browse
// through... clear out duplicates" / "separate songs based on the 'lands' they come from"): GENERAL, then a folder per
// land in the park's order; in each, a song with more than one arrangement is a folder of them. Each arrangement's
// listed once: a song filed under more than one cue (the red mist under the ceiling's, the Road Rash chase under the
// teenagers', the pundits' one march under each of the five), the portal and walk-away cuts (onlyArr: their land's or
// boss's, in its folder), and an arrangement that's note for note another of its song's (`main: {}` beside
// `jungle: {}`: listed under the other's name). One the game never picks (cues.ts) is still here, marked (UNUSED) (the
// user's: "keep it in there, but specify (unused) for those cases"). Whatever it's playing wins over the game's own
// cue (cues.ts), unmuffled.

import { SONGS } from './songs/index';

export interface Cue { song: string; arr?: string }
/** A track: its row's label (in its song's folder, just the arrangement), and its whole name (NOW PLAYING). */
export interface Track extends Cue { label: string; full: string }
export interface Folder { name: string; items: Item[] }
export type Item = Track | Folder;
export const isFolder = (it: Item): it is Folder => 'items' in it;

/** The folders, and the cues in each, in order (a cue not in any lands in OTHER); 'song/arr' files just that one
 *  arrangement (the walk-away's and the portal walk's own, the rest being the lands' and the bosses' cuts). */
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

/** What cues.ts never picks, by song ('*': the whole song). Worked out from it, with every song as composed now:
 *  - the walk-away and the portal walk: no music under either (the user's: their own sounds only), every cut;
 *  - the theme's lounge and calliope stand in for the staff room, the intro and the hub till theirs are written (they
 *    are); its 'cutscene' is only ever asked for by those stand-ins;
 *  - a land's 'boss': only for a fight with no song of its own (every fight has one);
 *  - a land's arrangement for a section its sequence always has (the river, the mine cart, the star sled, the saucer's
 *    whole orbit, the basement's stalker, DISASTER: THE RIDE, Timber Tumble's ride, its sewer and river);
 *  - 'main' where the cue always asks for one of the others (Satan's finale by its step, the helicopter by the ride,
 *    the pundits each by name). */
const UNUSED: Record<string, '*' | string[]> = {
  title: ['lounge', 'calliope', 'cutscene'],
  'land:adventure': ['river', 'underwater', 'cart', 'boss'],
  'land:spooky': ['boss'],
  'land:space': ['ride', 'orbit', 'stalker', 'boss'],
  'land:hollywood': ['disaster', 'boss'],
  'land:foreign': ['boss'],
  'land:frontier': ['logride', 'sewer', 'river', 'boss'],
  'land:fantasy': ['boss'],
  'seq:satan': ['main'],
  'seq:heli': ['main'],
  'boss:perot': ['main'],
};
const unused = (song: string, arr: string) => {
  if (song === 'walkaway' || song === 'portal' || song.startsWith('walkaway:') || song.startsWith('portal:')) return true;
  const u = UNUSED[song];
  return u === '*' || !!u?.includes(arr);
};
// (no labels on them (the user's: "remove the unused labels"): the never-picked ones are just listed)
const UN = '';
const name = (arr: string) => arr.replace(/-/g, ' ').toUpperCase();

let tree: Folder[] | null = null;
/** The folders, each arrangement once in all of them. */
export const soundTree = (): Folder[] => {
  if (tree) return tree;
  const seen = new Set<unknown>();
  const itemsOf = (keys: string[]): Item[] => keys.flatMap((key): Item[] => {
    const [song, only] = key.split('/');
    const s = SONGS[song];
    if (!s) return [];
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
      if ((only && arr !== only) || seen.has(a)) continue;
      seen.add(a);
      const j = JSON.stringify(a);
      groups.set(j, [...(groups.get(j) ?? []), arr]);
    }
    const tracks = [...groups.values()].map((arrs): Track => {
      const named = arrs.filter(a => a !== 'main'), un = arrs.every(a => unused(song, a)) ? UN : '';
      const label = named.length ? named.map(name).join(' / ') : 'MAIN';
      return { song, arr: arrs[0], label: label + un, full: `${title} (${label})${un}` };
    });
    // (one: the song's own row, by its title; one of several (the rest listed under another cue), by both)
    if (tracks.length === 1) {
      const t = tracks[0];
      if (!only && Object.keys(s.arrangements).length > 1) return [{ ...t, label: t.full }];
      const full = title + (t.label.endsWith(UN) ? UN : '');
      return [{ ...t, label: full, full }];
    }
    return tracks.length ? [{ name: title + (tracks.every(t => t.label.endsWith(UN)) ? UN : ''), items: tracks }] : [];
  });
  const out = FILED.map(f => ({ name: f.name, items: itemsOf(f.keys) }));
  const filed = new Set(FILED.flatMap(f => f.keys.map(k => k.split('/')[0])));
  // (the portal walk's and the walk-away's songs left out altogether (the user's: "remove the heading in and walk it off
  // songs from the sound test"))
  const other = itemsOf(Object.keys(SONGS).filter(k => !filed.has(k) && !/^(portal|walkaway)(:|$)/.test(k)));
  if (other.length) out.push({ name: 'OTHER', items: other });
  tree = out.filter(f => f.items.length);
  return tree;
};
/** Every track, in the tree's order (the cheat panel's < > step through these). */
export const allTracks = (): Track[] => {
  const flat = (its: Item[]): Track[] => its.flatMap(it => (isFolder(it) ? flat(it.items) : [it]));
  return flat(soundTree());
};
/** The track playing this. */
export const trackOf = (cue: Cue | null) => (cue ? allTracks().find(t => t.song === cue.song && t.arr === cue.arr) ?? null : null);

let test: Cue | null = null;
let at = -1;

export const soundTestCue = () => test;
/** Plays this (or stops the test: null). */
export const setSoundTest = (cue: Cue | null) => {
  test = cue;
  at = cue ? allTracks().findIndex(t => t.song === cue.song && t.arr === cue.arr) : -1;
};
/** On to the next (or back to the last) track; past either end, the test's off. */
export const stepSoundTest = (d: number) => {
  const list = allTracks();
  if (!list.length) { setSoundTest(null); return; }
  at = ((at + d + 1 + list.length + 1) % (list.length + 1)) - 1;
  test = at < 0 ? null : list[at];
};
/** What it's on, for the panel. */
export const soundTestLabel = () => (test ? trackOf(test)?.full ?? test.song.toUpperCase() : 'OFF');
