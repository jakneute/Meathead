// JUNGLE LAND's fights: the T. rex (the paddock's sub-boss) and Safari Artie (the land's boss). The land's theme and
// its set pieces are in jungle.ts. The Mega Man pass (the user's: "give it more of a high energy mega man vibe"): both
// are Mega Man boss fights now, and still nothing alike (MUSIC.md's table).
//
// ---- "ANIMATRONIC APEX" (boss:trex) ----
// A broken robot T. rex out to kill him: an orchestral metal stomp. The palm-muted guitars, the cello and the bass
// grinding a C-sharp/D ostinato, a rock kit with the taiko and the bass drum on its footsteps, the French horns on the
// tune with the brass section an octave under them, choir shouts; in the middle its speaker still doing the friendly
// bit (a chirpy square-wave jingle in E major, "Welcome to Dino Land!", winding down like a dying tape), stamped flat
// by the band playing the same jingle in C-sharp minor; then the climax, the trumpets and the horns in octaves, the
// violins running, power chords.
//
// C-sharp minor, 160. 36 bars: a 4-bar intro (once: the ostinato alone, a gong, the timpani, the choir), then:
//   A   (8)  C#m - D/C# (the Neapolitan grinding over the pedal) - C#m - A - G#7: the horns, the stomps.
//   A2  (8)  the same, the brass section an octave under the horns, the choir shouting on the downbeats.
//   B   (8)  the friendly bit: E - A - B7 - E on the square over the strings (it winds down), then the band slams
//            the jingle in C#m - F#m - G#7 - C#m.
//   C   (8)  the climax: A - E/G# - F#m - C#m/E - D - A/C# - Bm7 - G#7, horns and trumpets in octaves, the violins
//            running, the choir full, orchestra hits.
// ARRANGEMENTS: main, intro (its opening: the ostinato, the drums, the timpani, the choir).
//
// ---- "TOUGH CROWD" (boss:safari-artie) ----
// Safari Artie: a stand-up comic stuck skippering the Jungle Cruise, furious Meathead walked out on his set. Latin
// rock (Santana's mambo with Perez Prado's brass): the sax section's riff, brass shouts, piano montuno, the tumbao,
// congas, timbales, cowbell, "UGH!", over a rock kit and power chords; it keeps dropping into a comedy-club stop-time
// break (the band hitting and waiting, a harmon-muted trumpet telling the joke, the organ stabbing, and a ba-dum-tss
// after every punchline). It opens like he's being introduced at the club (a cheesy B-flat major vamp, a drum roll,
// the rimshot) before the mambo hits in B-flat minor.
//
// B-flat minor, 172. 36 bars: the 4-bar club intro (once), then:
//   A   (8)  Bbm7 - Eb9 (Dorian) - Gbmaj7 - F7 - F7#9: the sax riff, the brass shouts, the montuno, the tumbao.
//   B   (8)  the trumpet's tune (Artie's motif: three Fs, up to the A-flat, the B-flat, the D-flat), screaming up to
//            the sharp-nine at the end, the lead guitar a third under it.
//   C   (8)  the club: stop time, Gbmaj7 - F7 - Ebm7 - Ab7 - Dbmaj7 - Gb7 - C7 - F7, the muted trumpet's set-ups and
//            the rimshots, a fall off the last note.
//   D   (8)  the shout chorus: the tune on the trumpet with the whole brass section under it, "UGH!"
// ARRANGEMENTS: main, intro (his ambush: the montuno on the organ, bass, the kit, congas).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';
import { scale, harm, pump, riff, MM2, DRIVE, FILL, FILL2, FILL_BIG, ROLL_UP, X, sec } from './mega';

// =====================================================================================================================
// ANIMATRONIC APEX

const V5: Record<string, string[]> = {
  'C#m': ['4c+', '4e', '4g+'], 'D/C#': ['4d', '4f+', '4a'], A: ['4c+', '4e', '4a'], 'G#7': ['4c', '4d+', '4f+', '4g+'], E: ['4e', '4g+', '4b'],
  B7: ['4d+', '4f+', '4a', '4b'], 'F#m': ['4c+', '4f+', '4a'], 'E/G#': ['4e', '4g+', '4b'], 'C#m/E': ['4c+', '4e', '4g+'], D: ['4d', '4f+', '4a'],
  'A/C#': ['4c+', '4e', '4a'], Bm7: ['4d', '4f+', '4a', '4b'],
};
/** The ostinato's root and the note a half step above it (the grind). */
const R5: Record<string, [string, string]> = {
  'C#m': ['c+', 'd'], 'D/C#': ['c+', 'd'], A: ['a', 'b-'], 'G#7': ['g+', 'a'], E: ['e', 'f'], B7: ['b', 'c'], 'F#m': ['f+', 'g'], 'E/G#': ['g+', 'a'],
  'C#m/E': ['e', 'f'], D: ['d', 'e-'], 'A/C#': ['c+', 'd'], Bm7: ['b', 'c'],
};
const RX_IN: Bar[] = ['C#m', 'C#m', 'D/C#', 'C#m'];
const RX_A: Bar[] = ['C#m', 'C#m', 'D/C#', 'C#m', 'C#m', 'C#m', 'A', 'G#7'];
const RX_B: Bar[] = ['E', 'A', 'B7', 'E', 'C#m', 'F#m', 'G#7', 'C#m'];
const RX_C: Bar[] = ['A', 'E/G#', 'F#m', 'C#m/E', 'D', 'A/C#', 'Bm7', 'G#7'];

/** The low ostinato (o = the octave): the root stomping in eighths, and the grind up to its neighbour. */
const grind = (prog: Bar[], o: number) => bars(prog, c => { const [r, n] = R5[c]; return `o${o} !${r}8 ${r}8 r8 ${r}8 !${r}8 ${r}8 r8 ${n}8`; });
const rxPads = (prog: Bar[]) => bars(prog, c => chord(V5[c], '1'));
/** The violins' run: up the chord two octaves and back, in eighths. */
const rxRun = (prog: Bar[]) => bars(prog, c => { const v = V5[c], n = [...v, ...v.map(hi)]; return [...n, ...[...n].reverse()].slice(0, 8).map(x => nt(hi(x), '8')).join(' '); });

const RX_HORN_A = ['o4 g+2 a4 g+4', 'o4 e2. r8 g+8', 'o4 f+2 a4 f+4', 'o4 g+4 f+4 e4 d+4', 'o4 c+4 e4 g+4 o5 c+4', 'o5 e2 d+4 c+4', 'o4 a4 o5 c+4 e2', 'o5 d+4 c4 o4 g+2'];
const RX_HORN_C = ['o5 c+2. o4 a4', 'o4 b2 g+4 b4', 'o5 c+2 o4 a4 f+4', 'o4 g+2. e4', 'o4 a2 o5 d4 f+4', 'o5 e2 c+4 o4 a4', 'o5 d2 c+4 o4 b4', 'o5 c4 d+4 f+4 g+4'];
const DITTY = ['o6 e8 g+8 b8 g+8 e8 g+8 b4', 'o6 a8 g+8 f+8 e8 c+4 e4', 'o6 d+8 f+8 a8 f+8 b4 a8 f+8', 'o6 g+4 e4 _f-12/2 e2'];
const DITTY_MINOR = ['o4 c+8 e8 g+8 e8 c+8 e8 g+4', 'o4 a8 g+8 f+8 e8 c+4 e4', 'o4 d+8 f+8 g+8 f+8 g+4 c8 d+8', 'o4 e4 c+4 c+2'];
const SHOUT = `${chord(['3c+', '3g+', '4c+'], '8')} r8 r4 r2`;
const STOMP = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const DOUBLE = '{kh}16 k16 h16 k16 {sh}16 k16 h16 k16 {kh}16 k16 h16 k16 {sh}16 k16 {sh}16 k16';

export const BOSS_TREX: Song = {
  title: 'Animatronic Apex',
  bpm: 160,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.7,
  parts: {
    horns: { inst: 'horn', pan: -0.1, rev: 0.25, vol: 1.1, mml: join(['r1', 'r1', '_v85 o3 g+1', 'o4 c+2. r4'], ['_v112'], RX_HORN_A, RX_HORN_A, ['_v100'], rest(4), DITTY_MINOR, ['_v120'], RX_HORN_C) },
    trumpet: { inst: 'trumpet', pan: 0.2, rev: 0.25, vol: 0.62, mml: join(rest(4), rest(24), ['_v110'], up(RX_HORN_C)) },
    brass: { inst: 'brass', pan: 0.15, rev: 0.25, vol: 0.62, mml: join(rest(4), rest(8), ['_v105'], up(RX_HORN_A, -1), ['r1', 'r1', 'r1', 'r1', '_v118'], DITTY_MINOR, ['_v110'], up(RX_HORN_C, -1)) },
    chug: { inst: 'chug', pan: -0.4, rev: 0.05, vol: 0.55, mml: join(['_v110'], grind(RX_IN, 2), grind(RX_A, 2), grind(RX_A, 2), ['r1', 'r1', 'r1', 'r1', '_v115'], grind(RX_B.slice(4), 2), grind(RX_C, 2)) },
    power: { inst: 'powerchord', pan: 0.4, rev: 0.06, vol: 0.42, mml: join(rest(4), rest(16), ['r1', 'r1', 'r1', 'r1', '_v115'], RX_B.slice(4).map(c => `o2 !${R5[c as string][0]}2 ${R5[c as string][0]}4 ${R5[c as string][0]}4`), riff(RX_C, c => R5[c][0], '! x . x x . x x')) },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.85, mml: join(['_v105'], grind(RX_IN, 1), grind(RX_A, 1), grind(RX_A, 1), ['_v80 o2 e1', 'o2 a1', 'o2 b1', 'o2 e1', '_v110'], grind(RX_B.slice(4), 1), pump(RX_C, c => R5[c][0])) },
    cello: { inst: 'cello', pan: 0.15, rev: 0.22, vol: 0.6, mml: join(['_v95'], grind(RX_IN, 2), grind(RX_A, 2), grind(RX_A, 2), ['_v50 o2 e1', 'o2 a1', 'o2 b1', 'o2 e1', '_v100'], grind(RX_B.slice(4), 2), grind(RX_C, 2)) },
    strings: { inst: 'strings', pan: 0, rev: 0.35, vol: 0.4, mml: join(rest(4), ['_v65'], up(rxPads(RX_A), -1), ['_v80'], rxPads(RX_A), ['_v55'], rxPads(RX_B.slice(0, 4)), ['_v85'], rxPads(RX_B.slice(4)), ['_v95'], rxPads(RX_C)) },
    violins: { inst: 'strings', pan: 0.3, rev: 0.3, vol: 0.48, mml: join(rest(4), rest(24), ['_v95'], rxRun(RX_C)) },
    choir: {
      inst: 'choir', pan: 0, rev: 0.4, vol: 0.52,
      mml: join(['_v60 o3 c+1', 'o3 c+1', 'o3 d1', 'o3 c+1'], rest(8), ['_v120 ' + SHOUT, 'r1', SHOUT, 'r1', SHOUT, 'r1', SHOUT, 'r1'], rest(4), ['_v90'], rxPads(RX_B.slice(4)), ['_v100'], rxPads(RX_C)),
    },
    jingle: { inst: 'squarelead', pan: 0.3, rev: 0.3, dly: 0.2, vol: 0.5, mml: join(rest(4), rest(16), ['_v100'], DITTY, rest(4), rest(8)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.7,
      mml: join(
        ['r1', '_v60 o2 c+4 r2.', 'o2 d4 r2.', 'o2 _v50 [c+32]8 _v70 [c+32]8 _v90 [c+32]8 _v115 [c+32]8'],
        ['_v110 o2 c+4 r2.', 'r1', 'r1', 'r1', 'o2 c+4 r2.', 'r1', 'o2 a4 r2.', 'o2 _v70 [g+32]8 _v90 [g+32]8 _v105 [g+32]8 _v120 [g+32]8'],
        ['_v115 o2 c+4 r2.', 'r1', 'r1', 'r1', 'o2 c+4 r2.', 'r1', 'o2 a4 r2.', 'o2 g+4 r2.'],
        ['r1', 'r1', 'r1', 'o2 _v40 [e32]8 _v60 [e32]8 _v90 [e32]8 _v120 [e32]8', '_v120 o2 c+4 r2.', 'o2 f+4 r2.', 'o2 g+4 r2.', 'o2 c+4 r4 _v80 [g+32]8 _v110 [g+32]8'],
        ['_v115 o2 a4 r2.', 'o2 g+4 r2.', 'o2 f+4 r2.', 'o2 e4 r2.', 'o2 d4 r2.', 'o2 c+4 r2.', 'o2 b4 r2.', 'o2 _v70 [g+32]8 _v90 [g+32]8 _v105 [g+32]8 _v120 [g+32]8'],
      ),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.8,
      mml: join(['_v110 {kx}4 r2.', 'r1', '_v90 k4 r4 k4 r4', ROLL_UP], ['_v105'], sec(STOMP, 8, FILL), sec(DOUBLE, 8, FILL2), ['_v70 (ride)4 (ride)4 (ride)4 (ride)4', 'r1', '(ride)4 (ride)4 (ride)4 (ride)4', '_v100 ' + ROLL_UP, '_v120 ' + X(DOUBLE), DOUBLE, DOUBLE, FILL], ['_v110'], sec(MM2, 8, FILL_BIG)),
    },
    stomp: {
      inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.75,
      mml: join(['_v110 {kg}1', 'r1', '_v100 k2 k2', 'k2 k2'], ['_v120 {kx}2 k2'], rep('k2 k2', 15), ['_v70 (triangle)2 r2', 'r1', '(triangle)2 r2', 'r1', '_v125 {kgx}2 k2', 'k2 k2', 'k2 k2', 'k2 k2'], ['_v125 {kx}2 k2'], rep('k2 k2', 7)),
    },
    taiko: {
      inst: 'taiko', drums: true, rev: 0.3, vol: 0.8,
      mml: join(['r1', 'r1', '_v80 f4 r8 f8 f4 r8 f8', 'f4 r8 f8 f8 f8 f8 f8'], ['_v110'], rep('f4 r8 f8 f4 r8 f8', 15), ['f8 f8 f16 f16 f16 f16 f8 f8 f8 f8'], rest(4), rep('f4 r8 f8 f4 r8 f8', 4), ['_v120'], rep('f4 r8 f8 f4 r8 f8', 7), ['f8 f8 f16 f16 f16 f16 f8 f8 f8 f8']),
    },
    hit: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.6, mml: join(rest(4), rest(20), ['_v110 o4 e4 r2.'], rest(3), ['o4 a4 r2.'], rest(3), ['o4 d4 r2.'], rest(3)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['chug', 'cello', 'bass', 'stomp', 'taiko', 'timpani', 'choir'], vol: { choir: 0.7 }, level: 0.9 },
  },
};

// =====================================================================================================================
// TOUGH CROWD

const V6: Record<string, string[]> = {
  Bbm7: ['4d-', '4f', '4a-', '5c'], Eb9: ['4d-', '4f', '4g', '4b-'], Gbmaj7: ['4b-', '5d-', '5f'], F7: ['4e-', '4a', '5c'], 'F7#9': ['4a', '5e-', '5a-'],
  Ebm7: ['4d-', '4g-', '4b-'], Ab7: ['4c', '4e-', '4g-'], Dbmaj7: ['4c', '4f', '4a-'], Gb7: ['4e', '4b-', '5d-'], C7: ['4e', '4g', '4b-'],
  Bb6: ['4d', '4f', '4g'], G7: ['4d', '4f', '4b'], Cm7: ['4e-', '4g', '4b-'],
};
const R6: Record<string, [string, string]> = {
  Bbm7: ['b-', 'f'], Eb9: ['e-', 'b-'], Gbmaj7: ['g-', 'd-'], F7: ['f', 'c'], 'F7#9': ['f', 'c'], Ebm7: ['e-', 'b-'], Ab7: ['a-', 'e-'],
  Dbmaj7: ['d-', 'a-'], Gb7: ['g-', 'd-'], C7: ['c', 'g'],
};
const AR_A: string[] = ['Bbm7', 'Eb9', 'Bbm7', 'Eb9', 'Gbmaj7', 'F7', 'Bbm7', 'F7#9'];
const AR_C: string[] = ['Gbmaj7', 'F7', 'Ebm7', 'Ab7', 'Dbmaj7', 'Gb7', 'C7', 'F7'];
const BBM = scale('b-', 'dorian');

/** The tumbao: the fifth on the and of two, the next chord's root on four (pushed). */
const tumbao = (prog: string[], next: string) => prog.map((c, i) => `o2 ${R6[c][0]}4 r8 ${R6[c][1]}8 r4 ${R6[prog[i + 1] ?? next][0]}4`);
/** The piano montuno: the chord's notes in octaves, syncopated. */
const montuno = (prog: string[]) => prog.map(c => { const v = V6[c], o = (n: string) => chord([n, hi(n)], '8'); const [a, b, d] = v; return [o(a), o(d), o(b), o(a), 'r8', o(b), o(d), o(b)].join(' '); });
const RIFF: Record<string, string> = {
  Bbm7: 'o4 b-8 o5 d-8 r8 f8 r8 e-8 d-8 r8', Eb9: 'o4 b-8 o5 d-8 r8 g8 r8 f8 e-8 r8', Gbmaj7: 'o4 b-8 o5 d-8 r8 f8 r8 e-8 d-8 r8',
  F7: 'o4 a8 o5 c8 r8 e-8 r8 d-8 c8 r8', 'F7#9': 'o4 a8 o5 c8 r8 e-8 r8 d-8 c8 r8',
};
const riffs = (prog: string[]) => prog.map(c => RIFF[c]);
const shouts = (prog: string[]) => prog.map(c => { const x = chord(V6[c], ''); return `r2 r8 ${x}8 r8 !${x}8`; });
/** The club's stop time: the band hits the one and the and of two, and waits. */
const stops = (prog: string[]) => prog.map(c => { const x = chord(V6[c], ''); return `!${x}8 r8 r8 !${x}8 r2`; });
const charleston = (prog: string[]) => prog.map(c => { const x = chord(V6[c], ''); return `${x}4. ${x}8 r2`; });

const AR_TUNE = [
  'o5 f8 f8 r8 f8 _b-2 a-4 b-4',
  'o6 d-4. c8 o5 b-8 a-8 f4',
  'o5 f8 f8 r8 f8 _b-2 b-4 o6 d-4',
  'o6 f4. e-8 d-8 c8 o5 b-4',
  'o6 d-4 c8 o5 b-8 r8 b-8 o6 d-8 f8',
  'o6 _b-1 e-2 _f-5 c2',
  'o5 b-8 o6 c8 d-8 e-8 f8 g-8 f8 e-8',
  'o6 _b-3 a-2 _f-7/4 f2',
];
const AR_JOKE = [
  'o5 r2 b-8 a-8 b-8 f8',
  'o5 a4 r4 r2',
  'o5 r2 g-8 f8 g-8 d-8',
  'o5 _f-5 g-4 r4 r2',
  'o5 r2 f8 a-8 o6 c8 d-8',
  'o5 e4 d-8 b-8 r2',
  'o5 r2 e8 g8 b-8 o6 c8',
  'o5 a4 _f-12/2 c2.',
];
const UGH = 'r2. o3 !b-8 r8';

const MAMBO = '{kw}8 h8 {sw}8 w8 {kw}8 {kw}8 {sw}8 w8';
const TIMB_FILL = '{kw}4 w8 w8 (timbale)16 (timbale)16 (timbale)16 (timbale)16 (timbale)8 (timbale)8';
const CLUB = '{kx}8 r8 r8 {kx}8 r4 (ride)8 (ride)8';
const BADUM = '{kx}8 r8 r8 {kx}8 r8 s8 (tom3)8 {k(crash)}8';
const CLUB_IN = '{k(ride)}4 (ride)8 (ride)8 {m(ride)}4 (ride)8 (ride)8';
const TUMB_CONGA = '?c8 ?c8 (congaslap)8 c8 ?c8 ?c8 d8 d8';
const MARTILLO = 'b8 ?b8 (bongolo)8 ?b8 b8 ?b8 (bongolo)8 b8';
const A8 = (fill: string) => [X(MAMBO), ...rep(MAMBO, 6), fill];

export const BOSS_SAFARI_ARTIE: Song = {
  title: 'Tough Crowd',
  bpm: 172,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.22, tone: 3000 },
  parts: {
    trumpet: { inst: 'trumpet', pan: 0, rev: 0.18, dly: 0.1, vol: 1.05, mml: join(rest(4), rest(8), ['_v115'], AR_TUNE, rest(8), ['_v120'], AR_TUNE) },
    guitar: { inst: 'distlead', pan: -0.3, rev: 0.18, dly: 0.1, vol: 0.5, mml: join(rest(4), rest(8), ['_v100'], harm(AR_TUNE, BBM, -2), rest(8), ['_v105'], harm(AR_TUNE, BBM, -2)) },
    harmon: { inst: 'mutetrumpet', pan: 0.1, rev: 0.25, dly: 0.12, mml: join(rest(4), rest(16), ['_v105'], AR_JOKE, rest(8)) },
    brass: { inst: 'brass', pan: -0.15, rev: 0.2, vol: 0.7, mml: join(['r1', 'r1', 'r1', 'r1'], ['_v105'], shouts(AR_A), shouts(AR_A), ['_v110'], stops(AR_C), ['_v115'], up(AR_TUNE, -1)) },
    trombone: { inst: 'trombone', pan: -0.35, rev: 0.2, vol: 0.65, mml: join(rest(4), ['_v100'], AR_A.map(c => `o3 ${R6[c][0]}2 r2`), rest(8), rest(8), ['_v110'], AR_A.map(c => `o3 ${R6[c][0]}4. ${R6[c][0]}8 r2`)) },
    sax: { inst: 'sax', pan: 0.3, rev: 0.15, vol: 0.62, mml: join(rest(4), ['_v105'], riffs(AR_A), ['_v85'], riffs(AR_A), rest(8), ['_v105'], riffs(AR_A)) },
    tenor: { inst: 'tenorsax', pan: 0.4, rev: 0.15, vol: 0.55, mml: join(rest(4), ['_v105'], up(riffs(AR_A), -1), ['_v85'], up(riffs(AR_A), -1), rest(8), ['_v105'], up(riffs(AR_A), -1)) },
    piano: { inst: 'piano', pan: -0.3, rev: 0.12, vol: 0.55, mml: join(rest(4), ['_v100'], montuno(AR_A), montuno(AR_A), rest(8), montuno(AR_A)) },
    organ: {
      inst: 'organ', pan: -0.4, rev: 0.18, vol: 0.5,
      mml: join(['_v90 ' + charleston(['Bb6'])[0], charleston(['G7'])[0], charleston(['Cm7'])[0].replace('r2', chord(V6.Cm7, '2')), `_e127 ${chord(V6.F7, '1')}`], rest(16), ['_v95'], stops(AR_C), rest(8)),
    },
    power: { inst: 'powerchord', pan: 0.45, rev: 0.06, vol: 0.4, mml: join(rest(4), ['_v105'], riff(AR_A, c => R6[c][0], '! - - x - - x -'), riff(AR_A, c => R6[c][0], '! x . x x . x x'), AR_C.map(c => `o2 !${R6[c][0]}8 r8 r8 !${R6[c][0]}8 r2`), riff(AR_A, c => R6[c][0], '! x . x x . x x')) },
    bass: {
      inst: 'bass', pan: 0, rev: 0.04, vol: 0.85,
      mml: join(['_v95 o2 b-4 o3 d4 o2 f4 a4', 'o2 g4 b4 o3 d4 o2 b4', 'o2 c4 e-4 g4 a4', 'o2 f4 r4 r2'], ['_v105'], tumbao(AR_A, 'Bbm7'), pump(AR_A, c => R6[c][0]), AR_C.map(c => `o2 !${R6[c][0]}8 r8 r8 !${R6[c][0]}8 r2`), pump(AR_A, c => R6[c][0])),
    },
    choir: { inst: 'choir', pan: 0, rev: 0.3, vol: 0.5, mml: join(rest(4), ['q3 _v120'], ['r1', UGH, 'r1', UGH, 'r1', 'r1', 'r1', 'r1'], rest(8), rest(8), ['r1', UGH, 'r1', UGH, 'r1', 'r1', 'r1', UGH]) },
    kit: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.78,
      mml: join(
        ['_v75 ' + CLUB_IN, CLUB_IN, '_v50 s16 s16 s16 s16 _v65 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v100 s16 s16 s16 s16', '_v110 s8 (tom3)8 {k(crash)}4 r2'],
        ['_v100'], A8(TIMB_FILL), ['_v108'], sec(DRIVE, 8, FILL2),
        ['_v105', CLUB, BADUM, CLUB, BADUM, CLUB, BADUM, CLUB, FILL],
        ['_v110'], A8(FILL_BIG),
      ),
    },
    perc: { inst: 'congahi', drums: true, pan: 0.3, rev: 0.12, vol: 0.55, mml: join(rest(4), ['_v95'], rep(TUMB_CONGA, 16), rest(8), rep(TUMB_CONGA, 8)) },
    bongo: { inst: 'bongohi', drums: true, pan: -0.25, rev: 0.12, vol: 0.45, mml: join(rest(4), rest(8), ['_v90'], rep(MARTILLO, 8), rest(8), rep(MARTILLO, 8)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['piano', 'bass', 'kit', 'perc', 'organ', 'harmon'], inst: { piano: 'organ' }, vol: { piano: 0.9 }, level: 0.85 },
  },
};
