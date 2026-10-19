// SPOOKY LAND's music (land id 'spooky'): the land's theme, a version of it for every section, and its set pieces' own
// songs (the clock tower climb, the dungeon's ceiling (and the red mist, when that hallway's built), Satan and the
// geyser). The fights (the hell demon, Donnie Dracula) are in spookyBosses.ts.
//
// ---- "GRAVE EXPECTATIONS" (land:spooky) ----
// The park's haunted-house kitsch that turns into real gothic dread the further down he goes. A bouncy, swung spooky
// shuffle (a two-beat tuba, a harpsichord tiptoeing, a theremin out front) over a lament bass, the chromatic creep up
// to the raised fourth in the hook; a B section that's pure Victorian music hall (F major, the D7, a Db7 out of
// nowhere); and a C section that stops joking: D Phrygian, the E-flat leaning on the D, the choir, the bells.
//
// D minor, 108, a light swing. 36 bars: a 4-bar intro (once: a bell, the theremin's wail, a timpani roll), then:
//   A1 (8)  the hook: d f a g# a, the lament bass (Dm - Dm/C - Bb7 - A7), the Gm6 and A7 flat-nine to close.
//   A2 (8)  the hook again, the cello answering under it, the celesta an octave up; it turns to F (Gm - C7 - F).
//   B  (8)  F major, the music hall: F - D7 - Gm - C7 - F - Db7 - Gm C7 - Gm6/Bb A7, the trombones under it.
//   C  (8)  the dread: Dm - Eb/D - Dm - Eb/D - Gm - Eb - A7sus - A7b9, half notes, the choir, the bells tolling,
//           the cello low, the toms; the A7b9 climbing back up into the hook.
//
// ARRANGEMENTS (one per section, crossfading as he walks; same song, the place kept):
//   town      the town square's surf-horror: the hook on a twangy guitar, the theremin answering, a combo organ's
//             offbeats, finger bass, the swing kit
//   castle    DRACULA'S OTHER CASTLE's grand tour: harpsichord on the hook, pizzicato, the pipe organ and its pedal,
//             the grandfather clock ticking, the cathedral round it
//   dungeon   a music box somewhere down the corridor, the organ's pedal low, a low choir, drips, the bells
//   tower     the ELEVATOR TO HELL's loading bay: an old hotel-lobby record (harmon trumpet, stride piano, upright,
//             brushes, clarinet), muffled (the climb itself is seq:clock-tower)
//   hell      the real thing: the hook sung by the choir, a low choir under it, the organ's pedal, trombone, taiko
//   control   Donnie's own canned tour music on his booth's monitors: vibes, tine piano, upright, brushes, muffled
//   giftshop  the gift shop chase (the control section past SHOP_X): the whole band, the hook on a calliope
//   ballroom  the foyer's wedding band before the fight: the violin, stride piano, upright, brushes, strings
//   cutscene  celesta on the hook, slow strings, the harpsichord soft, a music box
//   boss      (a fight without a theme) the whole band with taiko
//
// ---- "LOAD-BEARING" (seq:clock-tower) ----
// The clock tower climb (Castlevania Bloodlines' tower, Super Metroid's tension): a harpsichord in sixteenths like the
// clock's gears, a solo violin over it, rock organ, the bass driving, the woodblocks ticking, the bell striking. After
// the crash ('down') the tower's wrecked and it's heavier: power chords pile in.
// G-sharp minor, 160. 36 bars: a 4-bar intro (once: the gears and the tick alone, the bell), then:
//   A  (8)  G#m - E - C#m - D#7: the violin's line, the harpsichord's gears, the bass in octaves.
//   A2 (8)  G#m - G#m/F# - E - D#7 - C#m - A - D#7: the horns in long tones, the harmonic minor run up.
//   B  (8)  B major, soaring: B - F#/A# - G#m - E - B - F# - E - D#7, horn harmony, strings.
//   C  (8)  the Neapolitan: G#m against A, back and forth, half time, the choir, the bell tolling every bar.
// ARRANGEMENTS: climb (going up), down (after the crash: power chords), cutscene (the crash: no kit, the bells and
// the choir).
//
// ---- "RED MIST" (seq:ceiling, seq:red-mist) ----
// Silent Hill industrial horror, as a chase: C octatonic (C Db Eb E F# G A Bb), a palm-muted ostinato on the tritone,
// metal clanking, a heartbeat, the strings' minor-second clusters swelling, the violins' tremolo, choir stabs, and the
// horns' slow motif rising a minor third every eight bars (the scale's symmetrical: it climbs forever).
// C octatonic, 188. 34 bars: a 2-bar hit (once), then four 8-bar segments (C, E-flat, F-sharp, A).
// ARRANGEMENTS: ceiling (the dungeon's chamber with the doors slammed, before the ceiling moves: the heartbeat, the
// clank, the low strings), chase (the ceiling coming down; the red mist's hallway when it's built).
//
// ---- "DADDY'S HOME" (seq:satan) ----
// After the demon: "daaaad". A sad muted trumpet whining over the organ's pedal (wah, wah, wah, waaah) while he sinks;
// then Satan comes up out of the lava: C Phrygian (the D-flat over the C pedal), the choir chanting, the horns' motif,
// the timpani's heartbeat, a gong; and the geyser: everything, taiko, orchestra hits.
// C Phrygian, 66. 16 bars (two 8s, the second an octave up and fuller), looping.
// ARRANGEMENTS: whine (the demon's whine and his sinking), satan (Satan rising and talking), launch (the geyser).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';

// =====================================================================================================================
// GRAVE EXPECTATIONS

const V: Record<string, string[]> = {
  Dm: ['3a', '4d', '4f'], 'Dm/C': ['3a', '4d', '4f'], Bb7: ['3a-', '4d', '4f'], A7: ['3g', '4c+', '4e'], 'Gm6/Bb': ['3g', '4d', '4e'],
  A7b9: ['3g', '4c+', '4e', '4b-'], Gm: ['3b-', '4d', '4g'], C7: ['3b-', '4e', '4g'], F: ['4c', '4f', '4a'], D7: ['4c', '4f+', '4a'],
  Db7: ['3b', '4f', '4a-'], 'Eb/D': ['3b-', '4e-', '4g'], Eb: ['3b-', '4e-', '4g'], A7sus: ['3g', '4d', '4e'],
};
/** The bass's root and the note it goes to on three. */
const R: Record<string, [string, string]> = {
  Dm: ['d', 'a'], 'Dm/C': ['c', 'a'], Bb7: ['b-', 'f'], A7: ['a', 'e'], 'Gm6/Bb': ['b-', 'd'], A7b9: ['a', 'e'], Gm: ['g', 'd'],
  C7: ['c', 'g'], F: ['f', 'c'], D7: ['d', 'a'], Db7: ['d-', 'a-'], 'Eb/D': ['d', 'd'], Eb: ['e-', 'b-'], A7sus: ['a', 'e'],
};
const INTRO: Bar[] = ['Dm', 'Dm', 'Bb7', 'A7'];
const A1: Bar[] = ['Dm', 'Dm/C', 'Bb7', 'A7', 'Dm', 'Dm/C', ['Gm6/Bb', 'A7b9'], 'Dm'];
const A2: Bar[] = ['Dm', 'Dm/C', 'Bb7', 'A7', 'Dm', 'Dm/C', ['Gm', 'C7'], 'F'];
const B: Bar[] = ['F', 'D7', 'Gm', 'C7', 'F', 'Db7', ['Gm', 'C7'], ['Gm6/Bb', 'A7']];
const C: Bar[] = ['Dm', 'Eb/D', 'Dm', 'Eb/D', 'Gm', 'Eb', 'A7sus', 'A7b9'];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];

const pads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The harpsichord tiptoeing: the chord broken up and back in (swung) eighths. */
const arp = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c], n = [...v.slice(0, 3), hi(v[0])];
  return [0, 1, 2, 3, 2, 1, 2, 1].slice(0, b * 2).map(k => nt(n[k], '8')).join(' ');
});
/** The combo organ's offbeats. */
const offbeats = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c], '8'); return Array.from({ length: b }, () => `r8 ${x}`).join(' '); });
/** The two-beat: the root, the and of two, the note on three. */
const two = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c]; return b === 4 ? `o2 ${r}4 r8 ${r}8 ${f}4 r4` : `o2 ${r}4 r4`; });
const roots = (prog: Bar[], o: number) => bars(prog, (c, b) => `o${o} ${R[c][0]}${b === 4 ? '1' : '2'}`);
/** Stride: the bass note on one and three, the chord on two and four. */
const stride = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = R[c], x = chord(V[c], '4'); return b === 4 ? `o2 ${r}4 ${x} o2 ${f}4 ${x}` : `o2 ${r}4 ${x}`; });

// ---- The tunes ----
const WAIL_IN = ['_g8 _v90 o5 r2 a2', 'o5 g+4 a4 f4 d4', 'o4 b-2. a4', 'o4 a2 r2 _g0'];
const T_A = [
  'o4 d8 f8 a8 g+8 a4 r8 a8',
  'o5 c8 o4 b-8 a8 g8 a4. f8',
  'o4 a-8 g8 f8 d8 a-4 g8 f8',
  'o4 e8 f8 e8 d8 c+2',
  'o4 d8 f8 a8 g+8 a8 o5 d8 f8 e8',
  'o5 f4 e8 d8 c8 o4 a8 g8 a8',
];
const T_A1 = [...T_A, 'o4 g8 b-8 o5 d8 e8 o4 b-8 a8 g8 c+8', 'o4 d2 r2'];
const T_A2 = [...T_A, 'o4 b-8 a8 g8 b-8 o5 c8 d8 e8 g8', 'o5 f2 r4 o4 a8 o5 c8'];
const T_B = [
  'o5 c4. o4 a8 f4 a4',
  'o5 c4. o4 a8 f+4 a4',
  'o5 d4 c8 o4 b-8 g4 b-8 o5 d8',
  'o5 c2 r4 o4 b-8 a8',
  'o4 a4. g8 a8 o5 c8 f8 a8',
  'o5 a-4. f8 d-4 o4 b4',
  'o4 b-8 o5 d8 g8 f8 e8 d8 c8 o4 b-8',
  'o4 a4 g4 e4 c+4',
];
const T_C = ['o5 d2. e-4', 'o5 d2 c4 o4 b-4', 'o4 a2. b-4', 'o4 a2 g4 b-4', 'o5 d2 c4 o4 b-4', 'o5 e-2 d4 c4', 'o5 d2 e4 d4', 'o5 c+4 e4 g4 b-4'];
/** The cello: answers under A2, the low line through C. */
const K_A2 = ['o3 a2 f2', 'o3 e2 g2', 'o3 f2 a-2', 'o3 g4 f4 e2', 'o3 f2 a2', 'o3 a4 g4 f4 e4', 'o3 d2 e2', 'o3 f4 a4 o4 c2'];
const K_C = ['o3 d1', 'o3 e-1', 'o3 d1', 'o3 e-2 d2', 'o3 b-2 a2', 'o3 g1', 'o3 a1', 'o3 a2 g4 e4'];
/** The trombones under the music hall. */
const TB_B = ['o3 a1', 'o3 a1', 'o3 b-1', 'o3 b-2 g2', 'o3 a1', 'o3 a-1', 'o3 b-2 g2', 'o3 b-2 a2'];

// ---- The drums ----
const SH = '{kh}8 ?h8 {sh}8 ?h8 {kh}8 ?h8 {sh}8 h8';
const SH_IN = '{kx}8 ?h8 {sh}8 ?h8 {kh}8 ?h8 {sh}8 h8';
const SH_FILL = '{kh}8 ?h8 {sh}8 h8 s8 (tom2)8 (tom3)8 (tom4)8';
const DREAD = 'k4 r4 (tom4)4 r8 (tom4)8';
const DREAD_IN = '{kx}4 r4 (tom4)4 r8 (tom4)8';
const DREAD_FILL = '_v80 s16 s16 s16 s16 _v95 (tom2)16 (tom2)16 (tom3)16 (tom3)16 _v110 (tom4)8 (tom4)8 s8 s8';
const BRUSH = '{ki}4 {ish}8 i8 i4 {ish}8 i8';
const TICK = 'e4 (woodblocklo)4 e4 (woodblocklo)4';
const DRIP = ['o6 a8 r8 r4 r2', 'r2 r4 o6 d8 r8', 'r1', 'r4 o5 a8 r8 r4 o6 e8 r8'];
const TAIKO_A = 'f4 r4 r4 f8 f8';
const TAIKO_C = 'f2 f4. f8';
const ROLL = (n: string) => `o2 _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;

export const LAND_SPOOKY: Song = {
  title: 'Grave Expectations',
  bpm: 108,
  swing: 0.4,
  grid: 8,
  loopFrom: 16,
  reverb: 'cathedral',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.3, tone: 2600 },
  parts: {
    hook: { inst: 'theremin', pan: 0, rev: 0.3, dly: 0.12, mml: join(rest(4), ['_v100'], T_A1, ['_v105'], T_A2, ['_v100'], T_B, ['_v95'], T_C) },
    wail: { inst: 'theremin', pan: 0.35, rev: 0.45, dly: 0.2, vol: 0.55, not: ['tower', 'control', 'ballroom', 'cutscene', 'dungeon'], mml: join(WAIL_IN, rest(7), ['_g8 _v80 o5 r2 a4 d4 _g0'], rest(24)) },
    counter: { inst: 'cello', pan: -0.3, rev: 0.3, vol: 0.6, not: ['control', 'dungeon', 'cutscene'], mml: join(rest(4), rest(8), ['_v85'], K_A2, rest(8), ['_v80'], K_C) },
    harpsi: { inst: 'harpsichord', pan: -0.35, rev: 0.28, vol: 0.45, not: ['tower', 'control', 'hell', 'dungeon', 'ballroom'], mml: join(['_v85'], arp(INTRO), arp(A1), arp(A2), ['_v75'], arp(B), ['_v60'], arp(C)) },
    organ: { inst: 'churchorgan', pan: 0.1, rev: 0.45, vol: 0.4, only: ['castle', 'hell', 'boss'], mml: join(['_v80'], pads(INTRO), ['_v65'], pads(A1), pads(A2), pads(B), ['_v85'], pads(C)) },
    combo: { inst: 'organ', pan: 0.35, rev: 0.18, vol: 0.4, only: ['town', 'main', 'giftshop', 'boss'], mml: join(['q4'], rest(4), ['_v85'], offbeats(A1), offbeats(A2), offbeats(B), ['q8 _v70'], pads(C)) },
    strings: { inst: 'strings', pan: 0, rev: 0.4, vol: 0.4, not: ['town', 'control', 'dungeon'], mml: join(['_v70'], pads(INTRO), ['_v55'], pads(A1), ['_v65'], pads(A2), ['_v75'], pads(B), ['_v90'], pads(C)) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.5, not: ['town', 'tower', 'control', 'ballroom', 'dungeon'], mml: join(rest(4), rest(24), ['_v90'], pads(C)) },
    choirLow: { inst: 'choir', pan: 0, rev: 0.55, vol: 0.45, only: ['hell', 'dungeon'], mml: join(['_v70'], up(pads(INTRO), -1), up(pads(LOOP), -1)) },
    trombone: { inst: 'trombone', pan: -0.2, rev: 0.25, vol: 0.6, only: ['main', 'giftshop', 'boss'], mml: join(rest(4), rest(16), ['_v95'], TB_B, rest(8)) },
    bass: { inst: 'tuba', pan: 0, rev: 0.1, vol: 0.8, not: ['hell', 'dungeon'], mml: join(['r1', 'r1', '_v95 o2 b-4 r4 f4 r4', 'o2 a4 r4 e4 r4'], ['_v100'], two(A1), two(A2), two(B), ['_v90'], roots(C, 2)) },
    pedal: { inst: 'churchorgan', pan: 0, rev: 0.45, vol: 0.5, only: ['castle', 'hell', 'dungeon'], mml: join(['_v90'], roots(INTRO, 1), roots(LOOP, 1)) },
    piano: { inst: 'piano', pan: -0.25, rev: 0.2, vol: 0.55, only: ['tower', 'control', 'ballroom'], mml: join(rest(4), ['_v85'], stride(LOOP)) },
    bell: { inst: 'celesta', pan: 0.3, rev: 0.4, dly: 0.15, vol: 0.4, only: ['main', 'town', 'castle', 'cutscene', 'giftshop'], mml: join(rest(4), rest(8), ['_v80'], up(T_A2), rest(16)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.65, only: ['main', 'town', 'giftshop', 'boss'],
      mml: join(['r1', 'r1', 'r1', '_v80 r2 s8 s8 (tom3)8 (tom4)8'], ['_v95 ' + SH_IN], rep(SH, 6), [SH_FILL], [SH_IN], rep(SH, 6), [SH_FILL], [SH_IN], rep(SH, 6), [SH_FILL], ['_v90 ' + DREAD_IN], rep(DREAD, 6), [DREAD_FILL]),
    },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.6, only: ['tower', 'control', 'ballroom'], mml: join(rest(4), ['_v85'], rep(BRUSH, 32)) },
    tick: { inst: 'woodblock', drums: true, pan: 0.4, rev: 0.4, vol: 0.35, only: ['castle'], mml: join(['_v80'], rep(TICK, 36)) },
    drip: { inst: 'marimba', pan: 0.45, rev: 0.6, dly: 0.4, vol: 0.35, only: ['dungeon'], mml: join(['_v70'], rep(DRIP.join(' | '), 9)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.35, vol: 0.7, only: ['hell', 'boss'], mml: join(rest(4), ['_v90'], rep(TAIKO_A, 24), ['_v105'], rep(TAIKO_C, 8)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.4, vol: 0.6, not: ['town', 'tower', 'control', 'ballroom'],
      mml: join(
        ['_v90 o2 d4 r2.', 'r1', 'o2 b-4 r2.', ROLL('a')],
        ['_v100 o2 d4 r2.'], rest(7),
        ['_v100 o2 d4 r2.'], rest(6), ['_v95 o2 c4 r4 c4 r4'],
        ['_v100 o2 f4 r2.'], rest(6), [ROLL('a')],
        ['_v110 o2 d4 r2.', 'o2 e-4 r2.', 'o2 d4 r2.', 'o2 e-4 r2.', 'o2 g4 r2.', 'o2 e-4 r2.', 'o2 a4 r2.', ROLL('a')],
      ),
    },
    chimes: {
      inst: 'chimes', pan: 0.2, rev: 0.55, vol: 0.45, not: ['control', 'tower'],
      mml: join(['_v90 o4 d2 r2', 'r1', 'r1', 'r1'], ['_v80 o4 d2 r2'], rest(7), ['o4 d2 r2'], rest(7), ['o4 f2 r2'], rest(7), ['_v95 o4 d2 r2', 'o4 e-2 r2', 'o4 d2 r2', 'o4 e-2 r2'], rest(4)),
    },
  },
  arrangements: {
    main: {},
    town: {
      inst: { hook: 'cleangtr', counter: 'theremin', bass: 'bass' },
      vol: { hook: 0.95, counter: 0.5, timpani: 0.7, chimes: 0.35 },
      rev: { hook: 0.18, counter: 0.4, combo: 0.12 },
    },
    castle: {
      inst: { hook: 'harpsichord', harpsi: 'pizz', bass: 'pizz' },
      vol: { hook: 1.05, harpsi: 0.6, bass: 0.7, strings: 0.45, chimes: 0.55 },
      rev: { hook: 0.38, harpsi: 0.4, bass: 0.3 },
      level: 0.9,
    },
    dungeon: {
      inst: { hook: 'musicbox' },
      vol: { hook: 0.55, pedal: 0.45, choirLow: 0.4, timpani: 0.5, chimes: 0.5 },
      rev: { hook: 0.65 },
      lowpass: 3200, level: 0.75,
    },
    tower: {
      inst: { hook: 'mutetrumpet', bass: 'upright', counter: 'clarinet', strings: 'slowstrings' },
      mute: ['wail', 'choir', 'chimes', 'timpani'],
      vol: { strings: 0.3, piano: 0.75, counter: 0.7, bass: 0.75 },
      rev: { hook: 0.25, piano: 0.25 },
      lowpass: 3600, level: 0.75,
    },
    hell: {
      inst: { hook: 'choir', strings: 'slowstrings', counter: 'trombone' },
      vol: { hook: 0.85, choirLow: 0.45, pedal: 0.6, organ: 0.6, choir: 0.7, strings: 0.45, counter: 0.7, chimes: 0.4 },
      rev: { hook: 0.5, counter: 0.4 },
      level: 0.9,
    },
    control: {
      solo: ['hook', 'piano', 'bass', 'brushes'],
      inst: { hook: 'vibes', piano: 'epiano', bass: 'upright' },
      vol: { piano: 0.7, bass: 0.75 },
      lowpass: 2800, level: 0.7,
    },
    giftshop: { inst: { hook: 'calliope' }, vol: { kit: 1.15, trombone: 1.1, hook: 0.9 } },
    ballroom: {
      solo: ['hook', 'piano', 'bass', 'brushes', 'strings', 'counter', 'chimes'],
      inst: { hook: 'violin', bass: 'upright', strings: 'slowstrings' },
      vol: { strings: 0.45, piano: 0.75, counter: 0.6, bass: 0.75, chimes: 0.35 },
      rev: { hook: 0.35 },
      level: 0.85,
    },
    cutscene: {
      solo: ['hook', 'strings', 'harpsi', 'bass', 'bell'],
      inst: { hook: 'celesta', strings: 'slowstrings', bass: 'upright', bell: 'musicbox' },
      vol: { bass: 0.5, strings: 0.55, harpsi: 0.35, bell: 0.45 },
      rev: { hook: 0.45 },
      level: 0.75,
    },
    boss: { vol: { kit: 1.1 } },
  },
};

// =====================================================================================================================
// LOAD-BEARING

const VT: Record<string, string[]> = {
  'G#m': ['4d+', '4g+', '4b'], 'G#m/F#': ['4d+', '4g+', '4b'], E: ['4e', '4g+', '4b'], 'C#m': ['4c+', '4e', '4g+'], 'D#7': ['4c+', '4d+', '4g', '4a+'],
  B: ['4d+', '4f+', '4b'], 'F#/A#': ['4c+', '4f+', '4a+'], 'F#': ['4c+', '4f+', '4a+'], A: ['4c+', '4e', '4a'],
};
const RT: Record<string, string> = { 'G#m': 'g+', 'G#m/F#': 'f+', E: 'e', 'C#m': 'c+', 'D#7': 'd+', B: 'b', 'F#/A#': 'a+', 'F#': 'f+', A: 'a' };
const TW_IN: Bar[] = ['G#m', 'G#m', 'G#m', 'D#7'];
const TW_A: Bar[] = ['G#m', 'G#m', 'E', 'E', 'C#m', 'C#m', 'D#7', 'D#7'];
const TW_A2: Bar[] = ['G#m', 'G#m/F#', 'E', 'D#7', 'C#m', 'A', 'D#7', 'D#7'];
const TW_B: Bar[] = ['B', 'F#/A#', 'G#m', 'E', 'B', 'F#', 'E', 'D#7'];
const TW_C: Bar[] = ['G#m', 'A', 'G#m', 'A', 'E', 'D#7', 'E', 'D#7'];

const twPads = (prog: Bar[]) => bars(prog, c => chord(VT[c], '1'));
/** The gears: the chord in sixteenths, the top note kicking up on the second and fourth beats. */
const gears = (prog: Bar[]) => bars(prog, c => {
  const v = VT[c], n = v.length === 4 ? [v[1], v[2], v[3], hi(v[0])] : [v[0], v[1], v[2], hi(v[0])];
  return [0, 1, 2, 1, 3, 1, 2, 1, 0, 1, 2, 1, 3, 2, 1, 2].map(k => nt(n[k], '16')).join(' ');
});
/** The bass: the root in eighths, the octave popped on the two-and and the four-and. */
const drive = (prog: Bar[]) => bars(prog, c => { const r = RT[c]; return `o2 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8`; });
/** Half time in C: 3 + 3 + 2. */
const lurch = (prog: Bar[]) => bars(prog, c => { const r = RT[c]; return `o2 ${r}8 ${r}8 r8 ${r}8 ${r}8 r8 ${r}8 ${r}8`; });
const power8 = (prog: Bar[]) => bars(prog, c => `o2 ${Array.from({ length: 8 }, () => `${RT[c]}8`).join(' ')}`);
const stabs = (prog: Bar[]) => bars(prog, c => { const x = chord(VT[c], '8'); return `r4 ${x} r8 r4 ${x} r8`; });

const VN_A = ['o5 d+4. g+8 b4 a+8 g+8', 'o5 a+8 b8 a+8 g+8 f+4 d+4', 'o5 e4. g+8 b4 o6 c+8 d+8', 'o6 e2 d+4 o5 b4', 'o5 c+4. e8 g+4 f+8 e8', 'o5 d+8 e8 f+8 g+8 e4 c+4', 'o5 d+4 g4 a+4 o6 c+4', 'o6 d+2. r4'];
const VN_A2 = ['o5 d+4. g+8 b4 a+8 g+8', 'o6 c+8 d+8 c+8 o5 b8 a+4 f+4', 'o5 g+4. b8 o6 e4 d+8 e8', 'o6 c+4. o5 a+8 g4 a+4', 'o5 g+4. b8 o6 c+4 e4', 'o6 e4. c+8 o5 a4 o6 c+4', 'o5 a+4 g4 d+4 g4', 'o5 g8 a+8 b8 o6 c+8 d+8 e8 g8 a+8'];
const VN_B = ['o6 b2 a+4 f+4', 'o6 c+2 o5 a+4 f+4', 'o5 b4. a+8 g+4 d+4', 'o5 e2 g+4 b4', 'o6 d+2 c+4 o5 b4', 'o5 a+2 o6 c+4 f+4', 'o6 e4. d+8 c+4 o5 b4', 'o5 a+2 g2'];
const VN_C = ['o5 d+1', 'o5 e1', 'o5 d+1', 'o5 e1', 'o5 g+1', 'o5 g1', 'o5 b1', 'o5 a+2 o6 d+2'];
const HN_A2 = ['o4 b1', 'o4 b1', 'o4 b1', 'o4 a+1', 'o4 g+1', 'o4 a1', 'o4 a+1', 'o4 a+1'];
const HN_B = ['o4 f+1', 'o4 f+1', 'o4 d+1', 'o4 e1', 'o4 f+1', 'o4 f+1', 'o4 g+1', 'o4 g1'];

const RK = 'k8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const RK_IN = '{kx}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const RK_FILL = 'k8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)8';
const HT = '{k(ride)}4 (ride)4 {s(ride)}4 (ride)8 (tom4)8';
const HT_IN = '{kx}4 (ride)4 {s(ride)}4 (ride)8 (tom4)8';
const SNARE_UP = '_v80 s16 s16 s16 s16 _v95 s16 s16 s16 s16 _v105 (tom1)16 (tom1)16 (tom2)16 (tom2)16 _v120 (tom3)16 (tom3)16 (tom4)16 (tom4)16';

export const SEQ_CLOCK_TOWER: Song = {
  title: 'Load-Bearing',
  bpm: 160,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    violin: { inst: 'violin', pan: 0.1, rev: 0.3, dly: 0.1, mml: join(rest(4), ['_v105'], VN_A, ['_v110'], VN_A2, ['_v115'], VN_B, ['_v100'], VN_C) },
    gears: { inst: 'harpsichord', pan: -0.3, rev: 0.25, vol: 0.5, mml: join(['_v90'], gears(TW_IN), gears(TW_A), gears(TW_A2), ['_v80'], gears(TW_B), ['_v95'], gears(TW_C)) },
    organ: { inst: 'organ', pan: 0.35, rev: 0.2, vol: 0.38, mml: join(rest(4), ['_v80'], twPads(TW_A), twPads(TW_A2), twPads(TW_B), ['q4 _v95'], stabs(TW_C)) },
    horn: { inst: 'horn', pan: -0.2, rev: 0.35, vol: 0.55, mml: join(rest(4), rest(8), ['_v90'], HN_A2, ['_v100'], HN_B, rest(8)) },
    strings: { inst: 'strings', pan: 0, rev: 0.4, vol: 0.4, mml: join(rest(4), rest(16), ['_v80'], twPads(TW_B), ['_v95'], twPads(TW_C)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.45, mml: join(rest(4), rest(24), ['_v95'], twPads(TW_C)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['r1', 'r1', '_v95'], drive(['G#m', 'D#7']), ['_v105'], drive(TW_A), drive(TW_A2), drive(TW_B), lurch(TW_C)) },
    power: { inst: 'powerchord', pan: -0.4, rev: 0.12, vol: 0.45, only: ['down'], mml: join(rest(4), ['_v100'], power8(TW_A), power8(TW_A2), power8(TW_B), bars(TW_C, c => `o2 ${RT[c]}1`)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.7, not: ['cutscene'],
      mml: join(['r1', 'r1', 'r1', '_v90 r2 s16 s16 s16 s16 (tom2)16 (tom3)16 (tom4)8'], ['_v100 ' + RK_IN], rep(RK, 6), [RK_FILL], [RK_IN], rep(RK, 6), [RK_FILL], ['_v110 ' + RK_IN], rep(RK, 6), [RK_FILL], ['_v95 ' + HT_IN], rep(HT, 6), [SNARE_UP]),
    },
    tick: { inst: 'woodblock', drums: true, pan: 0.45, rev: 0.3, vol: 0.4, mml: join(['_v85'], rep(TICK, 36)) },
    chimes: { inst: 'chimes', pan: -0.15, rev: 0.5, vol: 0.5, mml: join(['_v100 o4 g+1', 'r1', 'r1', 'r1'], ['_v90 o4 g+2 r2'], rest(7), ['o4 g+2 r2'], rest(7), ['o4 b2 r2'], rest(7), ['_v95'], rep('o4 g+4 r2.', 8)) },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.6,
      mml: join(['r1', 'r1', 'r1', ROLL('d+')], ['_v105 o2 g+4 r2.'], rest(6), [ROLL('d+')], ['_v105 o2 g+4 r2.'], rest(6), [ROLL('d+')], ['_v110 o2 b4 r2.'], rest(6), [ROLL('d+')], ['_v110 o2 g+4 r2.', 'o2 a4 r2.', 'o2 g+4 r2.', 'o2 a4 r2.', 'o2 e4 r2.', 'o2 d+4 r2.', 'o2 e4 r2.', ROLL('d+')]),
    },
  },
  arrangements: {
    climb: {},
    main: {},
    down: { vol: { kit: 1.1, choir: 1.15, strings: 1.1 } },
    cutscene: { solo: ['chimes', 'choir', 'strings', 'organ', 'timpani', 'violin', 'horn', 'gears'], vol: { choir: 1.2, strings: 1.2, gears: 0.6 }, level: 0.9 },
  },
};

// =====================================================================================================================
// RED MIST

/** Each 8-bar segment transposed (the octatonic scale is the same up a minor third: it climbs and climbs). */
const segs = (b8: string[], ks: number[]) => [...ks.flatMap(k => [`_k${k}`, ...b8]), '_k0'];
const UP = [0, 3, 6, 9], LOW = [0, 3, -6, -3], VUP = [0, 3, 6, -3];

const O1 = 'o2 c8 c8 d-8 c8 c8 e-8 c8 g-8';
const O2 = 'o2 c8 c8 d-8 c8 e8 c8 g8 g-8';
const RM_LOW = [O1, O1, O1, O2, O1, O1, O1, O2];
const RM_MOTIF = ['o3 c2 d-4 e-4', 'o3 g-2. e4', 'o3 e-4 c4 d-2', 'o3 c1', 'o3 c2 d-4 e-4', 'o3 g-2 g4 a4', 'o3 b-4 a4 g-4 e-4', 'o3 d-1'];
const RM_CLUSTER = ['_e40 _e127/1 o5 {c d-}1', '_e127 o5 {c d-}1', '_e40 _e127/1 o5 {e- e}1', '_e127 o5 {e- e}1'];
const RM_TREM = ['o5 [g-16 >c16<]8', 'o5 [g16 >d-16<]8', 'o5 [a16 >e-16<]8', 'o5 [b-16 >e16<]8'];
const RM_CHOIR = ['o4 {c g-}2 r2', 'r1', 'o4 {d- g}2 r2', 'r1', 'o4 {e- a}2 r2', 'r1', 'o4 {e b-}2 o4 {g- >c}2', 'r1'];
const STAB = 'r8 o3 {c g- >c}8 r4 r8 o3 {c g- >c}8 r4';
const RM_BRASS = [STAB, STAB, STAB, 'o3 {c g- >c}4 o3 {d- g >d-}4 o3 {e- a >e-}4 o3 {e b- >e}4', STAB, STAB, STAB, 'o3 {c g- >c}4 o3 {d- g >d-}4 o3 {e- a >e-}4 o3 {e b- >e}4'];
const K1 = 'k8 h8 {sh}8 k8 h8 k8 {sh}8 h8';
const K1_IN = '{kx}8 h8 {sh}8 k8 h8 k8 {sh}8 h8';
const K1_FILL = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {s(china)}8 {s(china)}8';
const METAL = '(ridebell)8 ?(ridebell)8 (timbale)8 ?(ridebell)8 (ridebell)8 ?(ridebell)8 (timbale)16 (timbale)16 (ridebell)8';
const HEART = 'k8 ?k8 r4 k8 ?k8 r4';
const TK = 'f4 r8 f8 r8 f8 f4';
const TK_FILL = 'f16 f16 f16 f16 f16 f16 f16 f16 f8 f8 f8 f8';

export const SEQ_RED_MIST: Song = {
  title: 'Red Mist',
  bpm: 188,
  loopFrom: 8,
  reverb: 'cave',
  reverbMix: 0.6,
  parts: {
    low: { inst: 'chug', pan: -0.3, rev: 0.1, vol: 0.6, mml: join(['_v110 o2 c8 r8 r4 r2', 'o2 c8 c8 c8 c8 c16 c16 c16 c16 c16 c16 c16 c16'], ['_v105'], segs(RM_LOW, LOW)) },
    cello: { inst: 'cello', pan: 0.25, rev: 0.2, vol: 0.55, mml: join(['_v100 o3 {c g-}1', 'o3 {c g-}1'], ['_v95'], segs(up(RM_LOW), LOW)) },
    synbass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.6, mml: join(['_v100 o2 c1', 'o2 c1'], segs([...rep('o2 c1', 7), 'o2 c2 g-2'], LOW)) },
    horns: { inst: 'horn', pan: -0.15, rev: 0.35, vol: 0.75, mml: join(['_v110 o3 c1', 'o3 c1'], ['_v110'], segs(RM_MOTIF, UP)) },
    trombone: { inst: 'trombone', pan: 0.15, rev: 0.3, vol: 0.6, mml: join(['_v110 o3 c1', 'o3 c1'], ['_v105'], segs(RM_MOTIF, UP)) },
    strings: { inst: 'strings', pan: 0, rev: 0.45, vol: 0.4, mml: join(['_v95 _e30 _e127/1^1 o5 {c d- g-}1', 'o5 {c d- g-}1'], segs([...RM_CLUSTER, ...RM_CLUSTER], UP)) },
    violins: { inst: 'strings', pan: 0.35, rev: 0.35, vol: 0.32, mml: join(['r1', 'r1'], ['_v85'], segs([...RM_TREM, ...RM_TREM], VUP)) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.5, mml: join(['_v120 o4 {c g- >c}2 r2', 'r1'], ['_v115'], segs(RM_CHOIR, UP)) },
    brass: { inst: 'brass', pan: 0.3, rev: 0.25, vol: 0.55, mml: join(['_v115 o3 {c g- >c}4 r2.', 'r1'], ['_v110'], segs(RM_BRASS, UP)) },
    kit: { inst: 'kick', drums: true, rev: 0.15, vol: 0.75, mml: join(['_v120 {kx}2 r2', '_v60 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v100 s16 s16 s16 s16 _v120 s16 s16 s16 s16'], rep(['_v105 ' + K1_IN, ...rep(K1, 6), K1_FILL].join(' | '), 4)) },
    metal: { inst: 'ridebell', drums: true, pan: 0.4, rev: 0.3, vol: 0.4, mml: join(['r1', 'r1'], ['_v90'], rep(METAL, 32)) },
    heart: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.6, mml: join(['r1', 'r1'], ['_v110'], rep(HEART, 32)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.7, mml: join(['_v110 f2 r2', TK_FILL], rep(['_v100 ' + TK, ...rep(TK, 6), TK_FILL].join(' | '), 4)) },
  },
  arrangements: {
    chase: {},
    main: {},
    ceiling: { solo: ['cello', 'synbass', 'strings', 'heart', 'metal'], vol: { metal: 0.45, strings: 0.55, cello: 0.6, synbass: 0.7, heart: 0.9 }, level: 0.85 },
  },
};

// =====================================================================================================================
// DADDY'S HOME

const V7: Record<string, string[]> = {
  Cm: ['3g', '4c', '4e-'], 'Db/C': ['3a-', '4d-', '4f'], Ab: ['3a-', '4c', '4e-'], Db: ['3a-', '4d-', '4f'], Bbm: ['3b-', '4d-', '4f'], G: ['3g', '3b', '4d'],
};
const R7: Record<string, string> = { Cm: 'c', 'Db/C': 'c', Ab: 'a-', Db: 'd-', Bbm: 'b-', G: 'g' };
/** The timpani's heartbeat note for each (the G's a roll). */
const TP7: Record<string, string> = { Cm: 'c', 'Db/C': 'c', Ab: 'a-', Db: 'd-', Bbm: 'b-', G: 'g' };
const SAT: Bar[] = ['Cm', 'Db/C', 'Cm', 'Db/C', 'Ab', 'Db', 'Bbm', 'G'];
const satPads = (prog: Bar[]) => bars(prog, c => chord(V7[c], '1'));
const SAT_HORN = ['o3 c2. d-4', 'o3 c1', 'o3 e-2. d-4', 'o3 c1', 'o3 c2 e-2', 'o3 f2 a-2', 'o3 f2 d-2', 'o3 d2 o2 b2'];
const SAT_SAD = ['o4 _b-1 g4 _b-1 g-4 _b-1 f4 _f-5/4 e4', 'r1', 'o4 _b-1 a-4 _b-1 g4 _b-1 g-4 _f-5/4 f4', 'r1', 'o4 e-4. c8 _f-3/2 e-2', 'o4 _f-2/4 d-1', 'o3 b-4 o4 c4 d-4 f4', 'o4 _f-12/2 d1'];
const satTimp = (prog: Bar[]) => bars(prog, c => (c === 'G' ? ROLL('g') : `o2 ${TP7[c]}4. ${TP7[c]}8 r2`));
const SAT_TK = 'f4 r8 f8 f4 f4';
const SAT_TK_FILL = 'f8 f8 f16 f16 f16 f16 f8 f8 f8 f8';
/** The strings' tremolo: the chord's top note an octave up, in thirty-seconds. */
const tremolo = (prog: Bar[]) => bars(prog, c => { const t = hi(V7[c][V7[c].length - 1]); return `o${t[0]} [${t.slice(1)}32]32`; });

export const SEQ_SATAN: Song = {
  title: 'Daddy\'s Home',
  bpm: 66,
  reverb: 'cave',
  reverbMix: 0.9,
  parts: {
    sad: { inst: 'mutetrumpet', pan: 0.15, rev: 0.3, vol: 0.85, mml: join(['_v100'], SAT_SAD, SAT_SAD) },
    pedal: { inst: 'churchorgan', pan: 0, rev: 0.5, vol: 0.55, mml: join(['_v95'], bars([...SAT, ...SAT], c => chord([`1${R7[c]}`, `2${R7[c]}`], '1'))) },
    organ: { inst: 'churchorgan', pan: -0.2, rev: 0.5, vol: 0.4, mml: join(['_v80'], satPads(SAT), ['_v100'], satPads(SAT)) },
    choir: { inst: 'choir', pan: 0, rev: 0.55, vol: 0.55, mml: join(['_v85'], up(satPads(SAT), -1), ['_v110'], up(satPads(SAT))) },
    horns: { inst: 'horn', pan: -0.25, rev: 0.4, vol: 0.7, mml: join(['_v95'], SAT_HORN, ['_v115'], up(SAT_HORN)) },
    trombone: { inst: 'trombone', pan: 0.25, rev: 0.35, vol: 0.6, mml: join(rest(8), ['_v110'], SAT_HORN) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.25, vol: 0.7, mml: join(['_v95'], bars([...SAT, ...SAT], c => `o1 ${R7[c]}1`)) },
    strings: { inst: 'strings', pan: 0.1, rev: 0.45, vol: 0.4, mml: join(['_v70'], satPads(SAT), ['_v95'], tremolo(SAT)) },
    timpani: { inst: 'timpani', pan: -0.1, rev: 0.4, vol: 0.65, mml: join(['_v105'], satTimp(SAT), ['_v115'], satTimp(SAT)) },
    gong: { inst: 'gong', drums: true, kit: 'orchestra', rev: 0.5, vol: 0.6, mml: join(['_v110 g1'], rest(7), ['_v120 g1'], rest(7)) },
    hits: { inst: 'orchhit', pan: 0, rev: 0.4, vol: 0.6, mml: join(rest(8), ['_v115 o4 e-4 r2.'], rest(3), ['o4 a-4 r2.'], rest(2), ['o4 g4 r4 g4 r4']) },
    taiko: { inst: 'taiko', drums: true, rev: 0.4, vol: 0.75, mml: join(['_v100'], rep(SAT_TK, 7), [SAT_TK_FILL], ['_v115'], rep(SAT_TK, 7), [SAT_TK_FILL]) },
  },
  arrangements: {
    main: { mute: ['sad'] },
    whine: { solo: ['sad', 'pedal', 'tuba'], vol: { pedal: 0.45, tuba: 0.6 }, level: 0.8 },
    satan: { mute: ['sad', 'taiko', 'hits'] },
    launch: { mute: ['sad'], vol: { taiko: 1.1, hits: 1.1 } },
  },
};
