// The sound test (the cheat panel's SOUND TEST): every composed song in every arrangement, browsed by folder (the
// user's: "make the sound test a selectable option with folders you can browse through... clear out duplicates"):
// a song filed under more than one cue (the red mist under the ceiling's, the Road Rash chase under the teenagers',
// the pundits' one march under each of the five) and the portal and walk-away cuts of one song each (onlyArr) are
// listed once. Whatever it's playing wins over the game's own cue (cues.ts), unmuffled.

import { SONGS } from './songs/index';

export interface Cue { song: string; arr?: string }
export interface Track extends Cue { label: string }
export interface Folder { name: string; tracks: Track[] }

/** The folders, and the cues in each, in order (a cue not in any lands in OTHER). The first cue a song's filed under
 *  is the one it's listed by. */
const FILED: { name: string; keys: string[] }[] = [
  { name: 'MENUS & HUB', keys: ['title', 'hub', 'intro', 'gym', 'staff'] },
  { name: 'JINGLES', keys: ['jingle:victory', 'jingle:death'] },
  { name: 'PORTALS & WALK-AWAYS', keys: ['portal', 'walkaway'] },
  { name: 'JUNGLE LAND', keys: ['land:adventure', 'seq:river', 'seq:mine-cart', 'seq:temple-collapse', 'boss:trex', 'boss:safari-artie'] },
  { name: 'SPOOKY LAND', keys: ['land:spooky', 'seq:clock-tower', 'seq:red-mist', 'seq:satan', 'boss:demon', 'boss:donnie-dracula'] },
  { name: 'FUTURE LAND', keys: ['land:space', 'seq:space-train', 'seq:stalker', 'boss:ufo', 'boss:space-queen'] },
  { name: 'HOLLYWOOD LAND', keys: ['land:hollywood', 'seq:coaster', 'seq:disaster-ride', 'seq:havoc', 'boss:ensemble-cast', 'boss:stuntman-steve'] },
  { name: 'FOREIGN LANDS', keys: ['land:foreign', 'seq:heli', 'boss:heli-gauntlet', 'boss:helicopter-harry'] },
  { name: 'WILDERNESS LAND', keys: ['land:frontier', 'seq:train', 'seq:brawl', 'seq:duel', 'seq:draw', 'seq:log-ride', 'seq:road-rash', 'boss:tucker'] },
  { name: 'FAIRY LAND', keys: ['land:fantasy', 'seq:tragons', 'boss:fairy-wheel', 'boss:broomsticks', 'boss:piper'] },
  { name: 'CARTOON LAND', keys: ['land:cartoon', 'boss:perot', 'boss:stupid-dad'] },
];

let folders: Folder[] | null = null;
/** The folders, each arrangement once in all of them (the same arrangement under another cue, or cut out of its song
 *  for one cue, isn't listed again). */
export const soundFolders = (): Folder[] => {
  if (folders) return folders;
  const seen = new Set<unknown>();
  const tracksOf = (keys: string[]) => keys.flatMap(song => {
    const s = SONGS[song];
    if (!s) return [];
    const arrs = s.arrangements ?? { main: s };
    return Object.entries(arrs).flatMap(([arr, a]) => {
      if (seen.has(a)) return [];
      seen.add(a);
      const label = `${s.title ?? song}${arr !== 'main' ? ` (${arr.replace(/-/g, ' ')})` : ''}`.toUpperCase();
      return [{ song, arr: s.arrangements ? arr : undefined, label }];
    });
  });
  const out = FILED.map(f => ({ name: f.name, tracks: tracksOf(f.keys) }));
  const filed = new Set(FILED.flatMap(f => f.keys));
  const other = tracksOf(Object.keys(SONGS).filter(k => !filed.has(k)));
  if (other.length) out.push({ name: 'OTHER', tracks: other });
  folders = out.filter(f => f.tracks.length);
  return folders;
};
/** Every track, in folder order (the pad's < > steps through these). */
const allTracks = () => soundFolders().flatMap(f => f.tracks);

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
export const soundTestLabel = () => {
  if (!test) return 'OFF';
  return allTracks().find(t => t.song === test!.song && t.arr === test!.arr)?.label ?? test.song.toUpperCase();
};
