// HOLLYWOOD LAND's music (land id 'hollywood'): the land's theme, a version of it for every section, and its set
// pieces' own songs (THRONES OF THE STARS between its stops, DISASTER: THE RIDE's stock music, every disaster at once).
// The fights (the Ensemble Cast, Stuntman Steve) are in hollywoodBosses.ts.
//
// ---- "YOUR NAME HERE" (land:hollywood) ----
// Happy Land's cheap Hollywood, scored like a golden-age studio's main title (Alfred Newman, Korngold, "Hooray for
// Hollywood" on a budget): a searchlight fanfare off the studio logo, a showbiz tune on trumpet with a two-beat swing
// under it, a swashbuckling bridge that lurches up a major third into A-flat, and a B-movie suspense reel in A minor
// with a theremin. The palette moves around the lot: film noir on the backlot, a blockbuster temp track in the
// warehouse, B-movie theremin in the wreckage.
//
// C major, 126, a light swing. 36 bars: a 4-bar fanfare (once: C - F/C - Fm/C - G7, the dotted searchlight call, the
// snare and timpani rolls, the harp up into it), then the 32-bar loop:
//   A1 (8)  Cmaj7 - E7 - Fmaj7 - Fm6 - C/G - A7 - D7 - G7: the hook on trumpet (up the major seventh, down the E7, the
//           minor iv's A-flat), the upright's two-beat, the piano's Charleston, the horns' long tones, brass shouts.
//   A2 (8)  ... Em7 - A7 - Dm7 G7 - C6: the glockenspiel doubling, the violins' counterline, the choir, the brass
//           kicking the Charleston, a harp glissando into the bridge.
//   B  (8)  A-flat: Abmaj7 - Fm7 - Dbmaj7 - Bbm7 Eb7 - Abmaj7 - Fm7 - Dm7b5 - G7: the violins' swashbuckler, the horns
//           under it, the harp, a walking bass and a backbeat.
//   C  (8)  the suspense reel, the G7 cheated to A minor: Am - F7 - E7 - Am - Dm - Bb7 - Ab7 - G7: the theremin, low
//           horns, piano octaves, tremolo-ish strings, timpani on every bar, toms.
//
// ARRANGEMENTS (one per section, crossfading as he walks; same song, the place kept):
//   blvd       the whole studio orchestra on the boulevard (and main)
//   coaster    (Thrones of the Stars has its own song: seq:coaster) the same
//   warehouse  the secret Revengers set: the theme as a blockbuster temp track: the hook on French horns, a low string
//              ostinato, taiko, the brass and kit up
//   lot        the backlot as film noir: the whole tune on a smoky tenor sax an octave down, vibes, brushes, the
//              upright, a low piano, the strings far back
//   disaster   (the ride's own music is seq:disaster-ride) lobby muzak: the tune on a cheap organ, through the ceiling
//   havoc      (every disaster at once is seq:havoc) the wreckage after, and the revisit: the tune on a B-movie theremin,
//              slow strings, oohs, harp, timpani
//   stunt      (Steve's fight is his own) the stage before it: the hook on a keytar, power chords, the kit up
//   cutscene   celesta on the tune, slow strings, harp, vibes, the upright soft
//   boss       (a fight without a theme) the full band, the ostinato, taiko
//
// ---- "ROYAL FLUSH" (seq:coaster) ----
// THRONES OF THE STARS between its stops: a coronation galop (Offenbach's can-can by way of a Pomp and Circumstance
// trio, played at rollercoaster speed). Herald trumpets for the lift, the tune on flute and xylophone (piccolo-giddy)
// over an oom-pah of tuba and pizzicato, string swoops down every drop, and a noble trio in A on the brass section and
// the choir, as if the throne were a throne.
// E major, 184. 36 bars: a 4-bar lift (once: the herald trumpets, the ratchet, the snare roll, the swoop into the
// drop), then: A (8: E - E - B7 - E - E - A - B7 - E), A2 (8: ... C#m - F#7 - B7 - B7), B (8: C#m - G#m - A - E - F#m
// - C#7 - F#7 - B7, the violins), C (8: the trio, A - E/G# - F#m - D - A/C# - D - F#7 - B7).
// ARRANGEMENTS (cues.ts picks by the ride): queue (the station's speakers: the tune on a calliope, the oom-pah, muffled),
// board (on the train, parked: the lift's ratchet, low tremolo strings, timpani, horns), ride (everything), stop (a
// stop's staff coming for him: the tune on trumpet, the brass and kit up), launch (EXPERIMENTAL: everything, the choir
// and the hits up).
//
// ---- "STOCK FOOTAGE" (seq:disaster-ride) ----
// DISASTER: THE RIDE's own music: a 70s library cue (the kind a cheap documentary licensed by the yard): a flute tune,
// a string section, Hammond, a clavinet chopping sixteenths, a finger bass, a polite kit, and a suspense vamp that ends
// on the most stock "DUN DUN DUNNN" there is. The narrator's loop changes its orchestration with each disaster.
// G minor, 104. 36 bars: a 4-bar sting (once), then A (Gm - Eb - Cm - D7 - Gm - Eb - Am7b5 - D7), B (B-flat, the
// strings: Bb - F/A - Gm - Eb - Bb/F - Cm7 - F7sus - F7), A again, C (the vamp: Eb - D - Eb - D - Cm - D - Eb - D7b9).
// ARRANGEMENTS (cues.ts picks): lobby (the queue: the tune on an electric piano through the ceiling), preshow (Chip's
// TV), theater (between disasters), quake (a bass drum rumble, timpani), volcano (the tune on marimba, bongos),
// tornado (theremin), blizzard (celesta, glockenspiel, sleigh bells), flood (harp), wildfire (trumpet, the brass up),
// real (REAL DISASTERS: everything, the choir, taiko, orchestra hits: the library cue scored for real), wrecked (the
// revisit: what's left of the speakers).
//
// ---- "EVERY DISASTER AT ONCE" (seq:havoc) ----
// A 70s disaster-movie score (The Towering Inferno, Earthquake, The Poseidon Adventure) going off the rails: a brass
// fanfare over a sixteenth-note string ostinato, a theremin air-raid siren, a heroic B in D major, a C section where
// the harmony climbs a half step every bar (Bm, Cm, C#m ... the water coming up), and a D section that's the tornado
// chase, the tune in driving eighths on the whole orchestra.
// B minor, 172. 36 bars: a 4-bar siren (once), then A (Bm - Bm - G - G - Em - C - F#7sus - F#7), B (D - A/C# - Bm -
// G - D/F# - Em7 - C - F#7), C (Bm up a half step a bar to F minor, then F#7), D (Bm - G - Bm - G - Em - F#7 - Em -
// F#7).
// ARRANGEMENTS (cues.ts picks by where he is): street (the lava and the falling facades), wind (the theremin and the
// strings' gusts up), quake (taiko, timpani, low brass), flood (the climb: harp, violins, choir), blizzard (celesta,
// sleigh bells, the kit down), chase (the tornado: everything, taiko, gusts, a sixteenth shaker), fling (it's got him:
// no kit, the choir and taiko).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars, cut } from './jungle';

/** A roll on one timpani note, a beat each getting louder (o2). */
const ROLL = (n: string) => `o2 _v55 [${n}32]8 _v75 [${n}32]8 _v95 [${n}32]8 _v115 [${n}32]8`;
/** Eight of something in a bar. */
const x8 = (tok: string) => Array.from({ length: 8 }, () => tok).join(' ');

// =====================================================================================================================
// YOUR NAME HERE

const LV: Record<string, string[]> = {
  C: ['4c', '4e', '4g'], 'F/C': ['4c', '4f', '4a'], 'Fm/C': ['4c', '4f', '4a-'], G7: ['3b', '4d', '4f', '4g'],
  Cmaj7: ['4c', '4e', '4g', '4b'], E7: ['3b', '4d', '4e', '4g+'], Fmaj7: ['4c', '4e', '4f', '4a'], Fm6: ['4c', '4d', '4f', '4a-'],
  'C/G': ['4c', '4e', '4g', '5c'], A7: ['4c+', '4e', '4g', '4a'], D7: ['4c', '4d', '4f+', '4a'], Em7: ['3b', '4d', '4e', '4g'],
  Dm7: ['4c', '4d', '4f', '4a'], C6: ['4c', '4e', '4g', '4a'], Abmaj7: ['4c', '4e-', '4g', '4a-'], Fm7: ['4c', '4e-', '4f', '4a-'],
  Dbmaj7: ['4c', '4d-', '4f', '4a-'], Bbm7: ['3a-', '3b-', '4d-', '4f'], Eb7: ['3b-', '4d-', '4e-', '4g'], Dm7b5: ['4c', '4d', '4f', '4a-'],
  Am: ['4c', '4e', '4a'], F7: ['4c', '4e-', '4f', '4a'], Dm: ['4d', '4f', '4a'], Bb7: ['4d', '4f', '4a-', '4b-'], Ab7: ['4c', '4e-', '4g-', '4a-'],
};
const LR: Record<string, [string, string]> = {
  C: ['c', 'g'], 'F/C': ['c', 'f'], 'Fm/C': ['c', 'f'], G7: ['g', 'd'], Cmaj7: ['c', 'g'], E7: ['e', 'b'], Fmaj7: ['f', 'c'], Fm6: ['f', 'c'],
  'C/G': ['g', 'c'], A7: ['a', 'e'], D7: ['d', 'a'], Em7: ['e', 'b'], Dm7: ['d', 'a'], C6: ['c', 'g'], Abmaj7: ['a-', 'e-'], Fm7: ['f', 'c'],
  Dbmaj7: ['d-', 'a-'], Bbm7: ['b-', 'f'], Eb7: ['e-', 'b-'], Dm7b5: ['d', 'a-'], Am: ['a', 'e'], F7: ['f', 'c'], Dm: ['d', 'a'],
  Bb7: ['b-', 'f'], Ab7: ['a-', 'e-'],
};
const L_IN: Bar[] = ['C', 'F/C', 'Fm/C', 'G7'];
const L_A1: Bar[] = ['Cmaj7', 'E7', 'Fmaj7', 'Fm6', 'C/G', 'A7', 'D7', 'G7'];
const L_A2: Bar[] = ['Cmaj7', 'E7', 'Fmaj7', 'Fm6', 'Em7', 'A7', ['Dm7', 'G7'], 'C6'];
const L_B: Bar[] = ['Abmaj7', 'Fm7', 'Dbmaj7', ['Bbm7', 'Eb7'], 'Abmaj7', 'Fm7', 'Dm7b5', 'G7'];
const L_C: Bar[] = ['Am', 'F7', 'E7', 'Am', 'Dm', 'Bb7', 'Ab7', 'G7'];
const L_LOOP: Bar[] = [...L_A1, ...L_A2, ...L_B, ...L_C];

const lx = (c: string, len = '') => chord(LV[c], len);
const lPads = (prog: Bar[]) => bars(prog, (c, b) => lx(c, b === 4 ? '1' : '2'));
/** The Charleston: the chord on one and the and of two. */
const lCharleston = (prog: Bar[]) => bars(prog, (c, b) => { const x = lx(c); return b === 4 ? `${x}4. ${x}8 r2` : `${x}4. ${x}8`; });
/** Comping on two and four. */
const lComp = (prog: Bar[]) => bars(prog, (c, b) => { const x = lx(c); return b === 4 ? `r4 ${x}4 r4 ${x}4` : `r4 ${x}4`; });
const lTwo = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = LR[c]; return b === 4 ? `o2 ${r}2 ${f}2` : `o2 ${r}2`; });
const lWalk = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = LR[c]; return b === 4 ? `o2 ${r}4 ${f}4 o3 ${r}4 o2 ${f}4` : `o2 ${r}4 ${f}4`; });
const lSusp = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = LR[c]; return b === 4 ? `o2 ${r}4 r8 ${r}8 ${f}4 r4` : `o2 ${r}4 ${f}4`; });
/** The harp up the chord and its octave in eighths (and back down if there's room). */
const lHarp = (prog: Bar[]) => bars(prog, (c, b) => { const v = LV[c], n = [...v, ...v.map(hi)]; return cut([...n, ...[...n].reverse()].map(x => nt(x, '8')), b); });
/** The temp track's low strings: da-da-dum da-da-dum da-da-dum, up the octave. */
const lOst = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = LR[c]; return b === 4 ? `o2 ${r}8 ${r}16 ${r}16 ${r}8 ${r}16 ${r}16 ${r}8 ${r}16 ${r}16 ${f}8 o3 ${r}8` : `o2 ${r}8 ${r}16 ${r}16 ${r}8 ${f}8`; });
const lPower = (prog: Bar[]) => bars(prog, (c, b) => `o2 ${Array.from({ length: b * 2 }, () => `${LR[c][0]}8`).join(' ')}`);
const lOctHits = (prog: Bar[]) => bars(prog, (c, b) => { const r = LR[c][0]; return b === 4 ? `o2 {${r} >${r}}4 r2.` : `o2 {${r} >${r}}4 r4`; });
/** A brass shout. */
const lShout = (c: string) => { const x = lx(c); return `${x}4 r8 ${x}8 r4 ${x}4`; };

// ---- The tunes ----
const L_FANFARE = ['o5 g8. g16 g4 o6 c2', 'o5 a8. a16 a4 o6 c2', 'o5 a-8. a-16 a-4 o6 c4 d4', 'o5 b2. r4'];
const L_HOOK1 = [
  'o4 g4 o5 c8 e8 g4. b8',
  'o5 b4 g+8 e8 d2',
  'o6 c4 o5 a8 f8 e4 f8 a8',
  'o5 a-4. g8 f4 d4',
  'o4 g4 o5 c8 e8 g4. o6 c8',
  'o6 c+4 o5 a8 e8 g4 e8 c+8',
  'o5 d4 f+8 a8 o6 c4 o5 b8 a8',
  'o5 g2 f8 e8 d8 o4 b8',
];
const L_HOOK2 = [...L_HOOK1.slice(0, 4), 'o5 g4 e8 g8 b4. a8', 'o5 a4 c+8 e8 g4 f8 e8', 'o5 f4 a4 b4 o6 d4', 'o6 c2. o5 e-4'];
const L_BMEL = [
  'o5 a-4. g8 a-4 o6 c4',
  'o6 e-2 c4 o5 a-4',
  'o5 f4. e-8 f4 a-4',
  'o6 d-4 c4 o5 b-4 g4',
  'o5 a-4. g8 a-4 o6 e-4',
  'o6 f2 e-4 c4',
  'o6 d4 c4 o5 a-4 f4',
  'o5 g4 b4 o6 d4 f4',
];
const L_CMEL = ['o5 a2 o6 c4 o5 b4', 'o5 a2 e-2', 'o5 g+2. f4', 'o5 e1', 'o5 d2 f4 a4', 'o5 a-2 f2', 'o5 g-2 e-2', 'o5 f2 d4 o4 b4'];
const L_TUNE = [...L_HOOK1, ...L_HOOK2, ...L_BMEL, ...L_CMEL];
/** The horns: long tones under A1, guide tones under A2, under the bridge, and low and menacing in the reel. */
const LH_IN = ['o4 e1', 'o4 f1', 'o4 f1', 'o4 f1'];
const LH_A1 = ['o4 e1', 'o4 e1', 'o4 f1', 'o4 f1', 'o4 e1', 'o4 e1', 'o4 f+1', 'o4 f1'];
const LH_A2 = ['o4 e1', 'o4 d1', 'o4 c1', 'o4 c1', 'o4 d1', 'o4 c+1', 'o4 c2 o3 b2', 'o4 c1'];
const LH_B = ['o4 e-1', 'o4 c1', 'o4 d-2 c2', 'o4 d-2 o3 b-2', 'o4 e-1', 'o4 c2 e-2', 'o4 d2 f2', 'o4 f2 d2'];
const LH_C = ['o3 a2 b2', 'o4 c2 o3 a2', 'o3 g+1', 'o3 a1', 'o3 a2 f2', 'o3 f1', 'o3 e-1', 'o3 d2 f2'];

// ---- The kit ----
const LK_A = '{ki}4 {si}8 i8 {ki}4 {si}8 i8';
const LK_A_IN = '{kx}4 {si}8 i8 {ki}4 {si}8 i8';
const LK_B = '{kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 {kh}8';
const LK_B_IN = '{kx}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 {kh}8';
const LK_C = '{k(tom4)}4 r4 (tom4)8 (tom4)8 r4';
const LK_C_IN = '{kx}4 r4 (tom4)8 (tom4)8 r4';
const LK_FILL = '{ki}4 {si}8 i8 s8 s8 (tom1)8 (tom3)8';
const LK_FILL_C = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {kx}4';
const lSec = (open: string, groove: string, fill: string) => [open, ...rep(groove, 6), fill];
const L_BRUSH = '{ki}4 {is}8 i8 {ki}4 {ish}8 i8';
const L_TAIKO = 'f4 r8 f8 f4 r4';

export const LAND_HOLLYWOOD: Song = {
  title: 'Your Name Here',
  bpm: 126,
  swing: 0.3,
  grid: 8,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    hook: { inst: 'trumpet', pan: 0, rev: 0.25, dly: 0.08, mml: join(['_v105'], L_FANFARE, ['_v100'], L_HOOK1, L_HOOK2, rest(16)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.7, mml: join(rest(12), ['_v70'], up(LH_A2), ['_v100'], L_BMEL, rest(8)) },
    theremin: { inst: 'theremin', pan: 0.2, rev: 0.4, dly: 0.2, vol: 0.6, not: ['lot'], mml: join(rest(28), ['_g8 _v90'], L_CMEL, ['_g0']) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.32, vol: 0.7, mml: join(['_v95'], LH_IN, ['_v75'], LH_A1, ['_v85'], LH_A2, ['_v80'], LH_B, ['_v95'], LH_C) },
    brass: {
      inst: 'brass', pan: -0.1, rev: 0.25, vol: 0.75,
      mml: join(
        ['_v110 o4 {c e g}8. {c e g}16 {c e g}4 {e g >c}2', 'o4 {c f a}8. {c f a}16 {c f a}4 {f a >c}2', 'o4 {c f a-}8. {c f a-}16 {c f a-}4 {f a- >c}4 {f a- >d}4', 'o3 {g b >d f}2. r4'],
        ['q4 _v95'], L_A1.map((c, i) => (i === 3 || i === 7 ? lShout(c as string) : 'r1')),
        ['_v100'], lCharleston(L_A2),
        rest(7), [`${lx('G7', '8')} ${lx('G7', '8')} r4 ${lx('G7', '4')} r4`],
        ['_v105'], bars(L_C, c => `${lx(c, '4')} r2.`),
      ),
    },
    strings: { inst: 'strings', pan: 0, rev: 0.35, vol: 0.8, mml: join(['_v85'], lPads(L_IN), ['_v65'], lPads(L_A1), ['_v75'], lPads(L_A2), ['_v80'], lPads(L_B), ['_v70'], lPads(L_C)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.55, mml: join(rest(12), ['_v65'], lPads(L_A2), ['_v75'], lPads(L_B), ['_v70'], lPads(L_C)) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.3, dly: 0.15, vol: 0.7, mml: join(rest(12), ['_v60'], up(L_HOOK2), rest(16)) },
    piano: { inst: 'piano', pan: -0.25, rev: 0.22, vol: 0.6, mml: join(['q6'], rest(4), ['_v80'], lCharleston(L_A1), lCharleston(L_A2), ['_v70'], lComp(L_B), ['q8 _v90'], lOctHits(L_C)) },
    harp: {
      inst: 'harp', pan: 0.4, rev: 0.4, vol: 0.6,
      mml: join(rest(3), ['_v85 o3 g16 b16 o4 d16 f16 g16 b16 o5 d16 f16 g16 b16 o6 d16 f16 g4'], rest(15), ['_v80 o4 c16 e16 g16 a16 o5 c16 e16 g16 a16 o6 c4 r4'], ['_v70'], lHarp(L_B), rest(8)),
    },
    bass: { inst: 'upright', pan: 0, rev: 0.08, mml: join(['_v100 o2 c1', 'o2 c1', 'o2 c1', 'o2 g2 r4 g8 b8'], lTwo(L_A1), lTwo(L_A2), lWalk(L_B), lSusp(L_C)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.75, not: ['lot', 'disaster', 'havoc', 'cutscene'],
      mml: join(
        ['_v40 [s16]8 _v60 [s16]8', '_v80 [s16]8 _v100 [s16]8', '_v120 {kx}4 r4 {kx}4 r4', '{kx}4 r4 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)8'],
        ['_v95'], lSec(LK_A_IN, LK_A, LK_FILL), lSec(LK_A_IN, LK_A, LK_FILL), ['_v100'], lSec(LK_B_IN, LK_B, LK_FILL), lSec(LK_C_IN, LK_C, LK_FILL_C),
      ),
    },
    timpani: {
      inst: 'timpani', pan: -0.15, rev: 0.3, vol: 0.7,
      mml: join(
        [ROLL('c'), ROLL('c'), 'o2 _v120 c4 r2.', 'o2 g4 r4 g8 g8 g4'],
        ['_v100 o2 c4 r2.'], rest(7), rest(7), [ROLL('c')],
        ['_v100 o2 a-4 r2.'], rest(6), ['o2 g4 r4 g4 r4'],
        ['_v100'], bars(L_C.slice(0, 7), c => `o2 ${LR[c][0]}4 r2.`), [ROLL('g')],
      ),
    },
    // (the arrangements' own)
    tune: { inst: 'vibes', pan: 0, rev: 0.3, dly: 0.12, only: ['disaster', 'havoc', 'cutscene'], mml: join(['_v95'], L_FANFARE, ['_v90'], L_TUNE) },
    noir: { inst: 'tenorsax', pan: 0, rev: 0.3, dly: 0.1, only: ['lot'], mml: join(rest(4), ['_v95'], up(L_TUNE, -1)) },
    vibes: { inst: 'vibes', pan: 0.3, rev: 0.35, only: ['lot', 'disaster', 'havoc', 'cutscene'], mml: join(['q5'], rest(4), ['_v70'], lComp(L_LOOP)) },
    brushes: { inst: 'kicksoft', drums: true, kit: 'brush', rev: 0.2, vol: 0.8, only: ['lot', 'disaster'], mml: join(rest(4), rep(L_BRUSH, 32)) },
    ostinato: { inst: 'strings', pan: -0.2, rev: 0.25, vol: 0.55, only: ['warehouse', 'boss'], mml: join(['q5'], rest(4), ['_v100'], lOst(L_LOOP)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.7, only: ['warehouse', 'boss', 'stunt'], mml: join(rest(4), ['_v100'], rep(L_TAIKO, 32)) },
    power: { inst: 'powerchord', pan: -0.35, rev: 0.12, vol: 0.55, only: ['stunt'], mml: join(['q6'], rest(4), ['_v100'], lPower(L_LOOP)) },
  },
  arrangements: {
    main: {},
    blvd: {},
    coaster: {},
    warehouse: {
      inst: { hook: 'horn', bass: 'bass' },
      mute: ['glock', 'harp'],
      vol: { hook: 0.95, brass: 1.15, horns: 1.15, kit: 1.1, piano: 0.8 },
      rev: { hook: 0.35 },
    },
    lot: {
      solo: ['noir', 'vibes', 'bass', 'brushes', 'strings', 'piano'],
      inst: { strings: 'slowstrings' },
      vol: { strings: 0.4, piano: 0.45, vibes: 0.55 },
      rev: { noir: 0.38 },
      level: 0.85,
    },
    disaster: {
      solo: ['tune', 'vibes', 'bass', 'brushes', 'strings'],
      inst: { tune: 'organ', strings: 'warmpad' },
      vol: { tune: 0.6, strings: 0.4, vibes: 0.5, bass: 0.8 },
      lowpass: 3000, level: 0.7,
    },
    havoc: {
      solo: ['tune', 'strings', 'bass', 'timpani', 'harp', 'choir', 'vibes'],
      inst: { tune: 'theremin', strings: 'slowstrings', choir: 'oohs' },
      vol: { tune: 0.65, strings: 0.6, bass: 0.6, vibes: 0.35 },
      rev: { tune: 0.45 },
      level: 0.8,
    },
    stunt: { inst: { hook: 'sawlead', bass: 'bass' }, mute: ['harp', 'glock', 'piano'], vol: { hook: 0.8, kit: 1.15 } },
    cutscene: {
      solo: ['tune', 'strings', 'harp', 'bass', 'vibes'],
      inst: { tune: 'celesta', strings: 'slowstrings' },
      vol: { bass: 0.5, strings: 0.6, vibes: 0.4 },
      rev: { tune: 0.45 },
      level: 0.75,
    },
    boss: { vol: { kit: 1.15, brass: 1.15, timpani: 1.2 } },
  },
};

// =====================================================================================================================
// ROYAL FLUSH

const CV: Record<string, string[]> = {
  E: ['4e', '4g+', '4b'], B7: ['3b', '4d+', '4f+', '4a'], A: ['4c+', '4e', '4a'], 'C#m': ['4c+', '4e', '4g+'], 'F#7': ['4c+', '4e', '4f+', '4a+'],
  'G#m': ['3b', '4d+', '4g+'], 'F#m': ['4c+', '4f+', '4a'], 'C#7': ['3b', '4c+', '4e+', '4g+'], 'E/G#': ['3b', '4e', '4g+'], D: ['4d', '4f+', '4a'],
  'A/C#': ['4c+', '4e', '4a'],
};
const CR: Record<string, [string, string]> = {
  E: ['e', 'b'], B7: ['b', 'f+'], A: ['a', 'e'], 'C#m': ['c+', 'g+'], 'F#7': ['f+', 'c+'], 'G#m': ['g+', 'd+'], 'F#m': ['f+', 'c+'],
  'C#7': ['c+', 'g+'], 'E/G#': ['g+', 'b'], D: ['d', 'a'], 'A/C#': ['c+', 'a'],
};
const C_IN: Bar[] = ['E', 'E', 'E', 'B7'];
const C_A: Bar[] = ['E', 'E', 'B7', 'E', 'E', 'A', 'B7', 'E'];
const C_A2: Bar[] = ['E', 'E', 'B7', 'E', 'C#m', 'F#7', 'B7', 'B7'];
const C_B: Bar[] = ['C#m', 'G#m', 'A', 'E', 'F#m', 'C#7', 'F#7', 'B7'];
const C_C: Bar[] = ['A', 'E/G#', 'F#m', 'D', 'A/C#', 'D', 'F#7', 'B7'];
const C_LOOP: Bar[] = [...C_A, ...C_A2, ...C_B, ...C_C];

const cPads = (prog: Bar[]) => bars(prog, (c, b) => chord(CV[c], b === 4 ? '1' : '2'));
const cOom = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = CR[c]; return b === 4 ? `o2 ${r}4 r4 ${f}4 r4` : `o2 ${r}4 r4`; });
const cPah = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(CV[c], ''); return b === 4 ? `r4 ${x}4 r4 ${x}4` : `r4 ${x}4`; });
const cTrem = (prog: Bar[]) => bars(prog, (c, b) => { const [r, f] = CR[c]; return `o2 [${r}16 ${f}16]${b * 2}`; });

const CF_A = [
  'o5 b8 g+8 e8 g+8 b8 o6 e8 g+4',
  'o6 f+8 e8 d+8 e8 f+4 e4',
  'o6 a8 f+8 d+8 f+8 a8 b8 a4',
  'o6 g+8 f+8 e8 f+8 g+4 e4',
  'o5 b8 g+8 e8 g+8 b8 o6 e8 g+4',
  'o6 a8 g+8 f+8 e8 c+4 o5 a4',
  'o5 b8 o6 c+8 d+8 e8 f+8 g+8 a8 f+8',
  'o6 e4 o5 b4 o6 e4 r4',
];
const CF_A2 = [...CF_A.slice(0, 4), 'o6 c+8 e8 g+8 e8 c+4 o5 g+4', 'o5 a+8 o6 c+8 e8 c+8 o5 a+4 f+4', 'o5 b8 o6 d+8 f+8 a8 b4 a4', 'o6 f+8 e8 d+8 c+8 o5 b8 a8 g+8 f+8'];
const CS_B = ['o6 e4. d+8 e4 g+4', 'o6 d+2 o5 b2', 'o6 c+4. o5 b8 o6 c+4 e4', 'o5 b2 g+2', 'o6 c+4. o5 b8 a4 o6 c+4', 'o5 b4. a8 g+4 e+4', 'o5 f+4 a+4 o6 c+4 e4', 'o6 d+4 f+4 a4 b4'];
const C_TRIO = ['o4 e2. a4', 'o4 g+2 b2', 'o5 c+2. o4 b4', 'o4 a1', 'o4 e2 a4 b4', 'o5 c+2 d2', 'o5 c+2 e2', 'o5 d+2 o4 b2'];
const C_HERALD = ['o5 e8. e16 e8. e16 b2', 'o5 e8. e16 e8. e16 o6 e2', 'o6 e4 g+4 b4 r4', 'o6 b2. r4'];
const C_DROP = '_g4 o6 e4 o3 e2. _g0';

const CK = '{kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 h8';
const CK_IN = '{kx}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 h8';
const CK_B = '{ki}8 i8 {si}8 i8 {ki}8 i8 {si}8 i8';
const CK_B_IN = '{kx}8 i8 {si}8 i8 {ki}8 i8 {si}8 i8';
const CK_C = '{kx}4 s4 k4 s4';
const CK_C2 = 'k4 s4 k4 s4';
const CK_FILL = '{kh}8 h8 {sh}8 h8 s16 s16 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16';
const CLICK = x8('e8');

export const SEQ_COASTER: Song = {
  title: 'Royal Flush',
  bpm: 184,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.5, feedback: 0.2, tone: 3000 },
  parts: {
    flute: { inst: 'flute', pan: 0.1, rev: 0.25, dly: 0.08, mml: join(rest(4), ['_v100'], CF_A, CF_A2, ['_v90'], CS_B, rest(8)) },
    xylo: { inst: 'xylophone', pan: 0.3, rev: 0.25, vol: 0.5, not: ['stop'], mml: join(['q4'], rest(4), ['_v95'], CF_A, CF_A2, rest(16)) },
    trumpet: { inst: 'trumpet', pan: -0.15, rev: 0.25, vol: 0.75, mml: join(['_v110'], C_HERALD, rest(8), ['_v85'], CF_A2, rest(16)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.7, mml: join(rest(20), ['_v100'], CS_B, ['_v85'], up(C_TRIO)) },
    brass: { inst: 'brass', pan: -0.2, rev: 0.3, vol: 0.8, mml: join(['_v100'], cPads(C_IN).map(b => `_e70 ${b}`), ['_e127'], rest(24), ['_v110'], C_TRIO) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.35, vol: 0.6, mml: join(['_v80'], cPads(C_IN), rest(16), ['_v70'], cPads(C_B), ['_v95'], cPads(C_C)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.5, mml: join(rest(28), ['_v95'], C_TRIO) },
    glock: { inst: 'glock', pan: 0.4, rev: 0.3, vol: 0.45, mml: join(['q4'], rest(4), ['_v80'], CF_A, rest(24)) },
    pizz: { inst: 'pizz', pan: 0.3, rev: 0.25, vol: 0.65, mml: join(rest(4), ['_v95'], cPah(C_LOOP)) },
    tuba: { inst: 'tuba', pan: 0, rev: 0.12, vol: 0.85, mml: join(['q5'], rest(4), ['_v105'], cOom(C_LOOP)) },
    swoop: { inst: 'strings', pan: -0.3, rev: 0.4, vol: 0.45, mml: join(rest(3), ['_v90 _g4 o5 b4 o3 b2. _g0'], rest(7), [C_DROP], rest(7), [C_DROP], rest(7), [C_DROP], rest(8)) },
    hits: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.5, mml: join(rest(4), ['_v110 o4 e4 r2.'], rest(7), ['o4 e4 r2.'], rest(7), ['o4 e4 r2.'], rest(7), ['o4 a4 r2.'], rest(7)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.7, not: ['queue', 'board'],
      mml: join(
        ['_v50 [s16]8 _v65 [s16]8', '_v80 [s16]8 _v95 [s16]8', '_v105 [s16]8 _v120 [s16]8', '{kx}4 r4 r2'],
        ['_v100'], [CK_IN, ...rep(CK, 6), CK_FILL], [CK_IN, ...rep(CK, 6), CK_FILL], [CK_B_IN, ...rep(CK_B, 6), CK_FILL],
        ['_v110'], [CK_C, CK_C2, CK_C, CK_C2, CK_C, CK_C2, CK_C, CK_FILL],
      ),
    },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.6,
      mml: join(['_v80 o2 e4 r2.', 'o2 e4 r2.', ROLL('b'), 'o2 _v120 b4 r2.'], ['_v105 o2 e4 r2.'], rest(7), ['o2 e4 r2.'], rest(7), ['o2 c+4 r2.'], rest(6), [ROLL('b')], ['o2 a4 r2.'], rest(6), [ROLL('b')]),
    },
    // (the lift's: the ratchet over the intro whatever's on; on the train, parked, it's the whole loop)
    click: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.1, vol: 0.5, mml: join(['_v90'], [CLICK, CLICK, CLICK, 'r1'], rest(32)) },
    ratchet: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.1, vol: 0.45, only: ['board'], mml: join(rest(4), ['_v85'], rep(CLICK, 32)) },
    trem: { inst: 'strings', pan: -0.1, rev: 0.3, vol: 0.4, only: ['board'], mml: join(['q8'], rest(4), ['_v80'], cTrem(C_LOOP)) },
  },
  arrangements: {
    main: {},
    ride: {},
    queue: { solo: ['flute', 'pizz', 'tuba', 'glock', 'click'], inst: { flute: 'calliope' }, vol: { flute: 0.75, glock: 0.6 }, lowpass: 2600, level: 0.6 },
    board: { solo: ['trem', 'ratchet', 'click', 'timpani', 'horns', 'tuba'], vol: { tuba: 0.6, horns: 0.8 }, level: 0.75 },
    stop: { inst: { flute: 'trumpet' }, mute: ['glock', 'swoop'], vol: { flute: 0.8, kit: 1.1, brass: 1.15, hits: 1.2 } },
    launch: { vol: { kit: 1.15, choir: 1.4, hits: 1.3, brass: 1.15, swoop: 1.3, timpani: 1.2 } },
  },
};

// =====================================================================================================================
// STOCK FOOTAGE

const DV: Record<string, string[]> = {
  Gm: ['4d', '4g', '4b-'], Eb: ['4e-', '4g', '4b-'], Cm: ['4c', '4e-', '4g'], D7: ['4c', '4d', '4f+', '4a'], Am7b5: ['4c', '4e-', '4g', '4a'],
  Bb: ['4d', '4f', '4b-'], 'F/A': ['4c', '4f', '4a'], 'Bb/F': ['4d', '4f', '4b-'], Cm7: ['4c', '4e-', '4g', '4b-'], F7sus: ['4c', '4e-', '4f', '4b-'],
  F7: ['4c', '4e-', '4f', '4a'], D: ['4d', '4f+', '4a'], D7b9: ['4c', '4d', '4e-', '4f+', '4a'],
};
const DR: Record<string, [string, string]> = {
  Gm: ['g', 'd'], Eb: ['e-', 'b-'], Cm: ['c', 'g'], D7: ['d', 'a'], Am7b5: ['a', 'e-'], Bb: ['b-', 'f'], 'F/A': ['a', 'c'], 'Bb/F': ['f', 'b-'],
  Cm7: ['c', 'g'], F7sus: ['f', 'c'], F7: ['f', 'c'], D: ['d', 'a'], D7b9: ['d', 'a'],
};
const D_IN: Bar[] = ['Gm', 'Gm', 'Eb', 'D7'];
const D_A: Bar[] = ['Gm', 'Eb', 'Cm', 'D7', 'Gm', 'Eb', 'Am7b5', 'D7'];
const D_B: Bar[] = ['Bb', 'F/A', 'Gm', 'Eb', 'Bb/F', 'Cm7', 'F7sus', 'F7'];
const D_C: Bar[] = ['Eb', 'D', 'Eb', 'D', 'Cm', 'D', 'Eb', 'D7b9'];
const D_LOOP: Bar[] = [...D_A, ...D_B, ...D_A, ...D_C];

const dx = (c: string, len = '') => chord(DV[c], len);
const dPads = (prog: Bar[]) => bars(prog, (c, b) => dx(c, b === 4 ? '1' : '2'));
/** The clavinet's sixteenths. */
const dClav = (prog: Bar[]) => bars(prog, c => { const x = dx(c); return `${x}16 r16 ${x}16 r16 r8 ${x}16 r16 ${x}8 r8 ${x}16 ${x}16 r8`; });
const dBass = (prog: Bar[]) => bars(prog, c => { const [r, f] = DR[c]; return `o2 ${r}8. ${r}16 r8 ${f}8 ${r}8. ${r}16 r8 o3 ${r}8`; });
const dHarp = (prog: Bar[]) => bars(prog, (c, b) => { const v = DV[c].slice(0, 3), n = [...v, ...v.map(hi)]; return cut([...n, ...[...n].reverse(), ...n, ...[...n].reverse()].map(x => nt(x, '16')), b, 4); });

const DL_A = ['o5 d4 g4 b-4. a8', 'o5 g2 e-4 g4', 'o5 c4 e-4 g4. f8', 'o5 f+2. a4', 'o5 b-4 a4 g4 d4', 'o5 e-4 g4 b-4 o6 e-4', 'o6 c4 o5 a4 g4 e-4', 'o5 d2 f+4 a4'];
const DL_B = ['o5 f4. b-8 b-2', 'o5 a4. o6 c8 c2', 'o5 b-4. a8 g4 d4', 'o5 e-4 g4 b-2', 'o5 f4. b-8 o6 d2', 'o6 e-4. d8 c4 o5 g4', 'o5 b-2 a4 g4', 'o5 a2 o6 c2'];
const DL_C = ['o5 b-1', 'o5 a1', 'o5 b-1', 'o5 a1', 'o5 g1', 'o5 f+1', 'o5 g2 a2', 'o5 a1'];

const DK = '{kh}8 h16 h16 {sh}8 h8 {kh}16 h16 k16 h16 {sh}8 o8';
const DK_IN = '{kx}8 h16 h16 {sh}8 h8 {kh}16 h16 k16 h16 {sh}8 o8';
const DK_C = '{k(tom4)}4 r4 s4 r4';
const DK_FILL = '{kh}8 h16 h16 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)8';
const dSec = (groove: string) => [DK_IN, ...rep(groove, 6), DK_FILL];

export const SEQ_DISASTER_RIDE: Song = {
  title: 'Stock Footage',
  bpm: 104,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 2600 },
  parts: {
    lead: { inst: 'flute', pan: 0, rev: 0.25, dly: 0.12, mml: join(rest(4), ['_v100'], DL_A, rest(8), DL_A, ['_v90'], DL_C) },
    vibes: { inst: 'vibes', pan: 0.3, rev: 0.3, vol: 0.45, mml: join(rest(4), ['_v80'], DL_A, rest(8), DL_A, rest(8)) },
    violins: { inst: 'strings', pan: 0.2, rev: 0.35, vol: 0.75, mml: join(rest(12), ['_v100'], DL_B, rest(16)) },
    pad: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v80'], dPads(D_IN), ['_v70'], dPads(D_LOOP)) },
    organ: { inst: 'organslow', pan: -0.35, rev: 0.25, vol: 0.35, mml: join(['_v95'], dPads(D_IN), ['_v80'], dPads(D_LOOP)) },
    clav: { inst: 'clav', pan: 0.4, rev: 0.12, vol: 0.4, not: ['blizzard'], mml: join(['q4'], rest(4), ['_v90'], dClav(D_LOOP)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.85, mml: join(['_v100 o2 g1', 'o2 g1', 'o2 e-1', 'o2 d2 r4 d8 f+8'], dBass(D_LOOP)) },
    brass: {
      inst: 'brass', pan: -0.2, rev: 0.3, vol: 0.7,
      mml: join(
        [`_v110 ${dx('Gm', '4')} r2.`, 'r1', `${dx('Eb', '4')} r2.`, `${dx('D7', '2.')} r4`],
        rest(24),
        bars(D_C.slice(0, 6), c => `${dx(c, '2.')} r4`), [`${dx('Eb', '4')} r4 ${dx('D', '4')} r4`, `_v120 ${dx('D7b9', '1')}`],
      ),
    },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.3, vol: 0.6,
      mml: join(
        ['_v100 o2 g4 r2.', 'r1', 'o2 e-4 r2.', 'o2 d4 r4 d4 r4'],
        ['o2 g4 r2.'], rest(7), rest(8), ['o2 g4 r2.'], rest(7),
        ['o2 e-4 r2.', 'o2 d4 r2.', 'o2 e-4 r2.', 'o2 d4 r2.', 'o2 c4 r2.', 'o2 d4 r2.', 'o2 e-4 r4 d4 r4', ROLL('d')],
      ),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.6, not: ['lobby', 'wrecked'],
      mml: join(['r1', 'r1', 'r1', '_v80 s16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {kx}4'], ['_v90'], dSec(DK), dSec(DK), dSec(DK), [DK_IN, ...rep(DK_C, 6), DK_FILL]),
    },
    // (each disaster's own)
    rumble: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.4, only: ['quake', 'real'], mml: join(['_v70'], rep('[k16]16', 36)) },
    hot: { inst: 'congahi', drums: true, pan: 0.35, rev: 0.15, vol: 0.6, only: ['volcano', 'real'], mml: join(['_v95'], rep('c8 ?c8 d8 c8 b8 ?b8 d8 c8', 36)) },
    sleigh: { inst: 'sleigh', drums: true, pan: 0.3, rev: 0.25, vol: 0.5, only: ['blizzard'], mml: join(['_v90'], rep('y8 ?y8 y8 ?y8 y8 ?y8 y8 ?y8', 36)) },
    harp: { inst: 'harp', pan: 0.35, rev: 0.4, vol: 0.5, only: ['flood', 'real'], mml: join(['_v80'], dHarp(D_IN), dHarp(D_LOOP)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.5, only: ['real'], mml: join(['_v95'], dPads(D_IN), dPads(D_LOOP)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.65, only: ['real'], mml: join(['_v105'], rep('f4 r8 f8 f4 f4', 36)) },
    hits: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.45, only: ['real'], mml: join(['_v110 o4 b-4 r2.'], rest(3), ['o4 b-4 r2.'], rest(7), ['o4 b-4 r2.'], rest(7), ['o4 b-4 r2.'], rest(7), ['o4 e-4 r2.'], rest(5), ['o4 e-4 r4 d4 r4', 'o4 d4 r2.']) },
  },
  arrangements: {
    main: {},
    theater: {},
    lobby: { solo: ['lead', 'vibes', 'bass', 'organ', 'pad'], inst: { lead: 'epiano' }, vol: { lead: 0.8, pad: 0.4, organ: 0.6 }, lowpass: 2600, level: 0.6 },
    preshow: { mute: ['brass', 'timpani'], lowpass: 4000, level: 0.7 },
    quake: { vol: { timpani: 1.4, bass: 1.15 } },
    volcano: { inst: { lead: 'marimba', vibes: 'steeldrum' } },
    tornado: { inst: { lead: 'theremin' }, vol: { lead: 0.75 }, rev: { lead: 0.4 } },
    blizzard: { inst: { lead: 'celesta', vibes: 'glock' }, vol: { vibes: 0.6 } },
    flood: { vol: { pad: 1.2 } },
    wildfire: { inst: { lead: 'trumpet' }, vol: { lead: 0.85, brass: 1.3 } },
    real: { inst: { lead: 'trumpet' }, vol: { lead: 0.9, kit: 1.2, brass: 1.35, timpani: 1.3, rumble: 1.2 } },
    wrecked: { solo: ['lead', 'bass', 'pad', 'organ'], inst: { pad: 'warmpad' }, vol: { pad: 0.6 }, lowpass: 1500, level: 0.55 },
  },
};

// =====================================================================================================================
// EVERY DISASTER AT ONCE

const HV: Record<string, string[]> = {
  Bm: ['3b', '4d', '4f+'], G: ['3b', '4d', '4g'], Em: ['3b', '4e', '4g'], C: ['4c', '4e', '4g'], 'F#7sus': ['3b', '4c+', '4e', '4f+'],
  'F#7': ['3a+', '4c+', '4e', '4f+'], D: ['4d', '4f+', '4a'], 'A/C#': ['4c+', '4e', '4a'], 'D/F#': ['3f+', '3a', '4d'], Em7: ['3b', '4d', '4e', '4g'],
};
const HR: Record<string, [string, string]> = {
  Bm: ['b', 'f+'], G: ['g', 'd'], Em: ['e', 'b'], C: ['c', 'g'], 'F#7sus': ['f+', 'c+'], 'F#7': ['f+', 'c+'], D: ['d', 'a'], 'A/C#': ['c+', 'a'],
  'D/F#': ['f+', 'd'], Em7: ['e', 'b'],
};
const H_A: Bar[] = ['Bm', 'Bm', 'G', 'G', 'Em', 'C', 'F#7sus', 'F#7'];
const H_B: Bar[] = ['D', 'A/C#', 'Bm', 'G', 'D/F#', 'Em7', 'C', 'F#7'];
const H_D: Bar[] = ['Bm', 'G', 'Bm', 'G', 'Em', 'F#7', 'Em', 'F#7'];
/** The C section: B minor up a half step a bar (transposed: _k), seven bars, then F#7 at pitch. */
const hClimb = (f: (c: string) => string) => [...Array.from({ length: 7 }, (_, i) => `_k${i} ${f('Bm')}`), `_k0 ${f('F#7')}`];

const hx = (c: string, len = '') => chord(HV[c], len);
const hPads = (prog: Bar[]) => bars(prog, (c, b) => hx(c, b === 4 ? '1' : '2'));
/** The strings' sixteenths, round the chord. */
const hOst1 = (c: string) => { const v = HV[c]; return [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 2, 1, 2].map(k => nt(v[k], '16')).join(' '); };
const hOst = (prog: Bar[]) => bars(prog, c => hOst1(c));
const hDrive1 = (c: string) => { const r = HR[c][0]; return `o2 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8 ${r}8 ${r}8 o3 ${r}8 o2 ${r}8`; };
const hDrive = (prog: Bar[]) => bars(prog, c => hDrive1(c));
const hStabs = (prog: Bar[]) => bars(prog, c => { const x = hx(c); return `${x}4 r8 ${x}8 r2`; });
const hHarp1 = (c: string) => { const v = HV[c].slice(0, 3), n = [...v, ...v.map(hi)]; return [...n, ...[...n].reverse(), ...n, ...[...n].reverse()].slice(0, 16).map(x => nt(x, '16')).join(' '); };

const HL_A = ['o5 f+4. f+8 b4 o6 c+8 d8', 'o6 c+4 o5 b4 f+2', 'o5 g4. g8 b4 o6 d8 e8', 'o6 d4 c+8 o5 b8 g2', 'o5 e4. g8 b4 o6 e4', 'o6 e4. d8 c4 o5 g4', 'o6 c+2 o5 b2', 'o5 a+2 f+2'];
const HL_B = ['o5 a4. f+8 a4 o6 d4', 'o6 c+2 o5 e2', 'o5 f+4. e8 f+4 b4', 'o5 b2 g2', 'o5 a4. f+8 a4 o6 d4', 'o6 e4. d8 o5 b4 g4', 'o5 g4 o6 c4 e4 g4', 'o6 f+2 e4 c+4'];
const HL_D = [
  'o5 f+8 f+8 b8 f+8 o6 d8 c+8 o5 b8 f+8',
  'o5 g8 g8 b8 g8 o6 d8 e8 d8 o5 b8',
  'o5 f+8 f+8 b8 f+8 o6 d8 c+8 o5 b8 f+8',
  'o5 g8 b8 o6 d8 g8 f+4 d4',
  'o5 e8 g8 b8 o6 e8 g4 e4',
  'o6 f+8 e8 c+8 o5 a+8 f+4 a+4',
  'o5 g8 b8 o6 e8 g8 b4 g4',
  'o6 a+4 f+4 e4 c+4',
];
/** The climb's motif, up the B minor chord (transposed a half step a bar). */
const HC_MOTIF = hClimb(c => (c === 'Bm' ? 'o4 b8 o5 d8 f+8 d8 o4 b8 o5 d8 f+8 b8' : 'o5 f+8 e8 c+8 o4 a+8 f+8 e8 c+8 o3 a+8'));
const H_SIREN = '_g2 o4 b2 o5 b2';
const H_GUST = '_g4 o4 b4 o6 e4 o4 b2 _g0';

const HK = '{kh}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const HK_IN = '{kx}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const HK_B = '{ki}8 i8 {si}8 i8 k8 {ki}8 {si}8 i8';
const HK_B_IN = '{kx}8 i8 {si}8 i8 k8 {ki}8 {si}8 i8';
const HK_C = 'k8 k8 {sh}8 k8 k8 k8 {sh}8 {sk}8';
const HK_D = '{kh}16 h16 h16 h16 {sh}16 h16 h16 h16 {kh}16 h16 {kh}16 h16 {sh}16 h16 h16 h16';
const HK_D_IN = '{kx}16 h16 h16 h16 {sh}16 h16 h16 h16 {kh}16 h16 {kh}16 h16 {sh}16 h16 h16 h16';
const HK_FILL = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {kx}4';

export const SEQ_HAVOC: Song = {
  title: 'Every Disaster at Once',
  bpm: 172,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 0.75, feedback: 0.25, tone: 2600 },
  parts: {
    lead: { inst: 'trumpet', pan: 0, rev: 0.25, dly: 0.08, mml: join(rest(4), ['_v105'], HL_A, rest(16), ['_v110'], HL_D) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.35, vol: 0.75, mml: join(['_v90'], hPads(['Bm', 'Bm', 'C', 'F#7']), up(HL_A, -1), ['_v100'], up(HL_B, -1), hClimb(c => hx(c, '1')), up(HL_D, -1)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.7, mml: join(rest(12), ['_v100'], HL_B, ['_v95'], HC_MOTIF, ['_v80'], HL_D) },
    strings: { inst: 'strings', pan: -0.15, rev: 0.3, vol: 0.5, mml: join(['q6 _v70'], rep(hOst1('Bm'), 2), [hOst1('C'), hOst1('F#7')], ['_v95'], hOst(H_A), hOst(H_B), hClimb(hOst1), hOst(H_D)) },
    brass: {
      inst: 'brass', pan: 0.15, rev: 0.3, vol: 0.7,
      mml: join(
        ['_v105 _e30 _e127/1^1 o3 {b >d f+}1', 'o3 {b >d f+}1', `_e127 ${hx('C', '2.')} r4`, `${hx('F#7', '4')} r4 ${hx('F#7', '4')} r4`],
        ['q5'], hStabs(H_A), ['q8 _v85'], hPads(H_B), ['_v100'], hClimb(c => `_e60 _e127/1 ${hx(c, '1')}`), ['_e127 q5 _v110'], hStabs(H_D),
      ),
    },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.5, mml: join(['_v80'], hPads(['Bm', 'Bm', 'C', 'F#7']), rest(8), ['_v85'], hPads(H_B), ['_v95'], hClimb(c => hx(c, '1')), ['_v100'], hPads(H_D)) },
    theremin: {
      inst: 'theremin', pan: 0.3, rev: 0.4, dly: 0.2, vol: 0.5,
      mml: join(['_v95'], rep(H_SIREN, 4), ['_g0'], rest(16), ['_g4 _v90'], hClimb(c => (c === 'Bm' ? 'o5 b2 o6 d2' : 'o5 a+2 f+2')), rep(H_SIREN, 8), ['_g0']),
    },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['_v100 o2 b1', 'o2 b1', 'o2 c1', 'o2 f+4 r4 f+4 r4'], hDrive(H_A), hDrive(H_B), hClimb(hDrive1), hDrive(H_D)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.7, not: ['fling'],
      mml: join(
        ['_v40 [s16]8 _v55 [s16]8', '_v70 [s16]8 _v90 [s16]8', '_v110 {kx}4 r2.', 's16 s16 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 {kx}8 r8 {kx}8 r8'],
        ['_v100'], [HK_IN, ...rep(HK, 6), HK_FILL], [HK_B_IN, ...rep(HK_B, 6), HK_FILL], [HK_IN, ...rep(HK_C, 6), HK_FILL], ['_v110'], [HK_D_IN, ...rep(HK_D, 6), HK_FILL],
      ),
    },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.6,
      mml: join(['_v100 o2 b4 r2.', ROLL('b'), 'o2 c4 r2.', 'o2 f+4 r4 f+4 r4'], ['o2 b4 r2.'], rest(6), [ROLL('f+')], ['o2 d4 r2.'], rest(6), [ROLL('f+')], hClimb(c => (c === 'Bm' ? 'o2 b4 r2.' : ROLL('f+'))), ['o2 b4 r2.'], rest(6), [ROLL('f+')]),
    },
    hits: { inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.45, mml: join(['r1', 'r1', '_v110 o4 c4 r2.', 'r1'], ['o4 d4 r2.'], rest(7), ['o4 d4 r2.'], rest(15), ['o4 d4 r4 d4 r4'], rest(4), ['o4 f+4 r2.'], rest(2)) },
    // (each stretch's own)
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.7, only: ['quake', 'chase', 'fling'], mml: join(rest(4), ['_v105'], rep('f4 r8 f8 f4 f8 f8', 32)) },
    harp: { inst: 'harp', pan: 0.4, rev: 0.4, vol: 0.5, only: ['flood', 'fling'], mml: join(rest(4), ['_v80'], bars(H_A, c => hHarp1(c)), bars(H_B, c => hHarp1(c)), hClimb(hHarp1), bars(H_D, c => hHarp1(c))) },
    celesta: { inst: 'celesta', pan: 0.35, rev: 0.45, dly: 0.15, vol: 0.5, only: ['blizzard'], mml: join(rest(4), ['_v85'], up(HL_A), up(HL_B), up(HC_MOTIF), HL_D) },
    sleigh: { inst: 'sleigh', drums: true, pan: 0.3, rev: 0.3, vol: 0.5, only: ['blizzard'], mml: join(rest(4), ['_v90'], rep('y8 ?y8 y8 ?y8 y8 ?y8 y8 ?y8', 32)) },
    gust: { inst: 'strings', pan: -0.4, rev: 0.45, vol: 0.4, only: ['wind', 'chase'], mml: join(rest(4), ['_v85'], ...Array.from({ length: 16 }, () => [H_GUST, 'r1'])) },
    drive: { inst: 'shaker', drums: true, pan: 0.25, rev: 0.12, vol: 0.5, only: ['chase'], mml: join(rest(4), ['_v90'], rep('z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16', 32)) },
  },
  arrangements: {
    main: {},
    street: {},
    wind: { vol: { theremin: 1.4, strings: 1.1 } },
    quake: { vol: { timpani: 1.4, brass: 1.2, bass: 1.15 } },
    flood: { vol: { violins: 1.2, choir: 1.2 } },
    blizzard: { vol: { kit: 0.65, choir: 1.1 } },
    chase: { vol: { kit: 1.15, brass: 1.15, lead: 1.05 } },
    fling: { vol: { choir: 1.35, brass: 1.2 }, level: 0.95 },
  },
};
