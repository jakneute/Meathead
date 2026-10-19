// FUTURE LAND's fights: the flying saucer (Zorblax's widow, the sub-boss: the whole orbit shooter) and the queen
// (LEGALLY DISTINCT) at the space disco (the land's boss). The land's theme and its set pieces are in space.ts.
//
// ---- "MOURNING STAR" (boss:ufo) ----
// The orbit shooter, with the widow's saucer hanging off his right the whole way: a 1962 space-race rock instrumental
// (Joe Meek's Telstar, the Tornados, the Ventures in space) played like a shmup. A clavioline lead (the square lead,
// wobbling), a twangy guitar riffing on the low strings drenched in spring reverb, a combo organ chopping the
// offbeats, a driving surf kit, a tape echo on everything. A theremin swoops in at the ends of phrases (the saucer),
// a "B" that lifts to the relative major like Telstar's, a half-time menace with the Neapolitan B-flat under a low
// horn motif and the choir, and a Misirlou surf break (E Phrygian dominant, the guitar tremolo-picking, the toms
// galloping) to bring it round.
// A minor, 176. 44 bars: a 4-bar intro (once: the guitar's tremolo, the theremin's swoops, the snare roll), then:
//   A  (8)  Am - Am - F - G - Am - Am - F - E7: the clavioline's tune, the guitar riff, the organ's offbeats.
//   A2 (8)  ... Am - C - Dm E7 - Am.
//   B  (8)  C - G - Am - Em - F - C - Dm - E7: the ride cymbal, the "ooh"s.
//   C  (8)  Am - Bb - Am - Bb - F - E7 - F - E7 in half time: the theremin's line, the low horns, the choir, timpani.
//   D  (8)  E - F - E - F - E - F - Dm - E7: the surf break.
// ARRANGEMENTS (cues.ts picks by the saucer): main (at it), beam (pissed, and THE BEAM: the brass section doubles the
// tune, everything up), down (it's got him, it blows, the fall: the theremin takes the tune, the organ slow, no kit),
// drift (back up here after it's gone: the theremin, the "ooh"s, the choir).
//
// ---- "LESS FATAL MODE" (boss:space-queen) ----
// The queen in GALACTIC GROOVE, the space disco, her keepers spinning in the DJ booth: Italo disco (Giorgio Moroder,
// Gazebo, Kano, the 1983 Euro dance floor). A supersaw lead with a hook you can hum, a resonant synth bass bouncing
// octaves in sixteenths, the 909 four on the floor with open hats and claps, Simmons toms in the fills, string stabs,
// a PWM pad, a DX bell arpeggio, the choir "vocoder", orchestra hits, and a breakdown where the impregnator ray
// sweeps up on a saw lead before it drops back in.
// F minor, 124. 44 bars: a 4-bar intro (once: the kick alone, the pad swelling, the claps and the snare roll), then:
//   A  (8)  Fm - Db - Eb - Cm (i - VI - VII - v, twice): the hook.
//   A2 (8)  the hook, the string stabs, ending on C7.
//   B  (8)  Bbm7 - Eb - Abmaj7 - Dbmaj7 - Bbm7 - C7 - Fm - C7: the chorus, the strings in unison, the choir.
//   C  (8)  the breakdown: Dbmaj7 - Eb - Fm - Fm - Dbmaj7 - Eb - C7sus - C7, hats only, the strings' long line, the
//           ray sweeping up, the snare roll.
//   D  (8)  the drop: the hook with everything.
// ARRANGEMENTS: main, intro (the cutscene: the bass, the pad, the bells and the choir; no kit till she's on).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, hi, chord, bars } from './jungle';

const ROLL = (n: string) => `o2 _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;

// =====================================================================================================================
// MOURNING STAR

const VU: Record<string, string[]> = {
  Am: ['4c', '4e', '4a'], F: ['4c', '4f', '4a'], G: ['3b', '4d', '4g'], E7: ['3b', '4d', '4e', '4g+'], C: ['4c', '4e', '4g'],
  Dm: ['4d', '4f', '4a'], Em: ['3b', '4e', '4g'], Bb: ['4d', '4f', '4b-'], E: ['3b', '4e', '4g+'],
};
const RU: Record<string, [string, string]> = {
  Am: ['a', 'e'], F: ['f', 'c'], G: ['g', 'd'], E7: ['e', 'b'], C: ['c', 'g'], Dm: ['d', 'a'], Em: ['e', 'b'], Bb: ['b-', 'f'], E: ['e', 'b'],
};
const U_A: Bar[] = ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', 'E7'];
const U_A2: Bar[] = ['Am', 'Am', 'F', 'G', 'Am', 'C', ['Dm', 'E7'], 'Am'];
const U_B: Bar[] = ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'E7'];
const U_C: Bar[] = ['Am', 'Bb', 'Am', 'Bb', 'F', 'E7', 'F', 'E7'];
const U_D: Bar[] = ['E', 'F', 'E', 'F', 'E', 'F', 'Dm', 'E7'];

const uPads = (prog: Bar[]) => bars(prog, (c, b) => chord(VU[c], b === 4 ? '1' : '2'));
/** The guitar's low riff: the root twice, up the chord and back. */
const riff = (prog: Bar[]) => bars(prog, (c, b) => {
  const r = RU[c][0], v = VU[c];
  return [`o3 ${r}8`, `o3 ${r}8`, nt(v[0], '8'), nt(v[1], '8'), `o3 ${r}8`, `o3 ${r}8`, nt(v[1], '8'), nt(v[0], '8')].slice(0, b * 2).join(' ');
});
const offs = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(VU[c], '8'); return Array.from({ length: b }, () => `r8 ${x}`).join(' '); });
const twoFour = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(VU[c], '4'); return b === 4 ? `r4 ${x} r4 ${x}` : `r4 ${x}`; });
const halfStabs = (prog: Bar[]) => bars(prog, (c, b) => (b === 4 ? `${chord(VU[c], '2')} r2` : `${chord(VU[c], '4')} r4`));
/** The bass driving eighths, the octave popped. */
const uDrive = (prog: Bar[]) => bars(prog, (c, b) => {
  const [r, f] = RU[c];
  return [`o2 ${r}8`, `${r}8`, `o3 ${r}8`, `o2 ${r}8`, `${r}8`, `${f}8`, `${r}8`, `${f}8`].slice(0, b * 2).join(' ');
});
const uHalf = (prog: Bar[]) => bars(prog, c => `o2 ${RU[c][0]}2 r4. ${RU[c][0]}8`);
const uGallop = (prog: Bar[]) => bars(prog, c => { const r = RU[c][0]; return `o2 ${Array.from({ length: 4 }, () => `${r}8 ${r}16 ${r}16`).join(' ')}`; });

const UL_A = [
  'o5 e4. a8 a4 b8 o6 c8',
  'o6 c4 o5 b8 a8 e2',
  'o5 f4. a8 o6 c4 d8 c8',
  'o5 b4 a8 g8 d2',
  'o5 e4. a8 a4 b8 o6 c8',
  'o6 e4 d8 c8 o5 a2',
  'o5 a8 o6 c8 f8 e8 d4 c4',
  'o5 b2 g+4 e4',
];
const UL_A2 = [...UL_A.slice(0, 5), 'o6 e4 g8 e8 c2', 'o6 d4 f4 e4 d4', 'o5 a2 r2'];
const UL_B = ['o6 e2 d4 c4', 'o5 b2. d4', 'o6 c4. o5 b8 a4 e4', 'o5 g2 b2', 'o6 c2 o5 a4 f4', 'o5 g2 o6 c4 e4', 'o6 f4. e8 d4 c4', 'o5 b2 g+2'];
/** The theremin: the intro's swoops, a swoop at the ends of A and B, and the line through C. */
const UT_IN = ['_g8 _v85 o4 e2 o5 e2', 'o4 b2 o5 c2', 'o4 a1', 'o4 g+2 o5 e2 _g0'];
const UT_SWOOP = '_g4 o5 r2 e4 o6 e4 _g0';
const UT_C = ['_g8 _v95 o5 e2 f2', 'o5 e1', 'o5 e4 f4 e4 d4', 'o5 d1', 'o5 c1', 'o4 b2 g+2', 'o5 c2 o4 a2', 'o4 b1 _g0'];
/** The surf break's tremolo picking. */
const UG_D = [
  'o5 [e16]4 [f16]4 [g+16]4 [a16]4',
  'o6 [c16]8 o5 [b16]4 [a16]4',
  'o5 [g+16]8 [f16]4 [e16]4',
  'o5 [f16]4 [g+16]4 [a16]4 [b16]4',
  'o6 [c16]4 [d16]4 [c16]4 o5 [b16]4',
  'o6 [c16]4 o5 [b16]4 [a16]4 [g+16]4',
  'o5 [a16]8 [f16]8',
  'o5 [g+16]4 [b16]4 o6 [d16]4 [e16]4',
];
const UH_C = ['o3 a2 b-2', 'o3 a1', 'o3 a2 b-4 a4', 'o3 b-1', 'o3 a1', 'o3 g+1', 'o3 a1', 'o3 g+1'];

const SA = 'k8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const SA_IN = '{kx}8 h8 {sh}8 h8 k8 k8 {sh}8 h8';
const SB = '{ki}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const SB_IN = '{kx}8 i8 {si}8 i8 {ki}8 {ki}8 {si}8 i8';
const SC = '{k(tom4)}4 r4 {s(tom4)}4 r8 (tom4)8';
const SC_IN = '{kx}4 r4 {s(tom4)}4 r8 (tom4)8';
const SD = '{k(tom3)}8 (tom3)16 (tom3)16 (tom1)8 (tom1)16 (tom1)16 {k(tom3)}8 (tom3)16 (tom3)16 s8 s16 s16';
const SD_IN = '{kx}8 (tom3)16 (tom3)16 (tom1)8 (tom1)16 (tom1)16 {k(tom3)}8 (tom3)16 (tom3)16 s8 s16 s16';
const UFILL = 'k8 h8 {sh}8 h8 s16 s16 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16';
const sec = (open: string, groove: string) => [open, ...rep(groove, 6), UFILL];

export const BOSS_UFO: Song = {
  title: 'Mourning Star',
  bpm: 176,
  loopFrom: 16,
  reverb: 'spring',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.35, tone: 2600 },
  parts: {
    lead: { inst: 'squarelead', pan: 0, rev: 0.25, dly: 0.2, mml: join(rest(4), ['_v100'], UL_A, UL_A2, ['_v105'], UL_B, rest(16)) },
    brassLead: { inst: 'brass', pan: -0.2, rev: 0.25, vol: 0.5, only: ['beam'], mml: join(rest(4), ['_v105'], up(UL_A, -1), up(UL_A2, -1), up(UL_B, -1), rest(16)) },
    theremin: { inst: 'theremin', pan: 0.3, rev: 0.4, dly: 0.25, vol: 0.55, mml: join(UT_IN, rest(7), ['_v85 ' + UT_SWOOP], rest(8), rest(7), [UT_SWOOP], UT_C, rest(8)) },
    gtr: {
      inst: 'cleangtr', pan: -0.4, rev: 0.45, dly: 0.15, vol: 0.55,
      mml: join(['_v80 o4 [e32]32', 'o4 [e32]32', 'o4 [f32]32', 'o4 [e32]16 [g+32]16'], ['_v95'], riff(U_A), riff(U_A2), riff(U_B), ['_v90'], halfStabs(U_C), ['_v100'], UG_D),
    },
    organ: { inst: 'organ', pan: 0.4, rev: 0.2, vol: 0.38, mml: join(['q4'], rest(4), ['_v85'], offs(U_A), offs(U_A2), ['q8 _v75'], uPads(U_B), uPads(U_C), ['q4 _v90'], twoFour(U_D)) },
    oohs: { inst: 'oohs', pan: 0.15, rev: 0.45, vol: 0.4, mml: join(rest(4), rest(16), ['_v80'], up(uPads(U_B)), rest(16)) },
    choir: { inst: 'choir', pan: 0, rev: 0.5, vol: 0.45, mml: join(rest(4), rest(24), ['_v95'], up(uPads(U_C), -1), rest(8)) },
    horn: { inst: 'horn', pan: -0.15, rev: 0.4, vol: 0.6, mml: join(rest(4), rest(24), ['_v105'], UH_C, rest(8)) },
    bass: { inst: 'bass', pan: 0, rev: 0.06, vol: 0.8, mml: join(['r1', 'r1', '_v95 o2 f4 r2.', 'o2 e4 r4 e8 e8 e8 e8'], ['_v100'], uDrive(U_A), uDrive(U_A2), uDrive(U_B), uHalf(U_C), uGallop(U_D)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.18, vol: 0.7, not: ['down', 'drift'],
      mml: join(
        ['r1', 'r1', '_v50 [s16]8 _v70 [s16]8', '_v90 [s16]8 _v110 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 {kx}8'],
        ['_v105'], sec(SA_IN, SA), sec(SA_IN, SA), sec(SB_IN, SB), ['_v100'], sec(SC_IN, SC), ['_v110'], sec(SD_IN, SD),
      ),
    },
    timpani: {
      inst: 'timpani', pan: 0.1, rev: 0.35, vol: 0.55,
      mml: join(['r1', 'r1', 'r1', ROLL('e')], rest(16), rest(8), ['_v105 o2 a4 r2.', 'o2 b-4 r2.', 'o2 a4 r2.', 'o2 b-4 r2.', 'o2 f4 r2.', 'o2 e4 r2.', 'o2 f4 r2.', ROLL('e')], rest(8)),
    },
  },
  arrangements: {
    main: {},
    beam: { vol: { kit: 1.1, choir: 1.2, oohs: 1.2, horn: 1.15, lead: 1.05 } },
    down: {
      solo: ['lead', 'choir', 'oohs', 'organ', 'bass', 'horn', 'timpani', 'theremin'],
      inst: { lead: 'theremin', organ: 'organslow' },
      vol: { lead: 0.8, bass: 0.6 },
      level: 0.75,
    },
    drift: { solo: ['lead', 'oohs', 'choir', 'theremin'], inst: { lead: 'theremin' }, vol: { lead: 0.65 }, rev: { lead: 0.5 }, level: 0.6 },
  },
};

// =====================================================================================================================
// LESS FATAL MODE

const VQ: Record<string, string[]> = {
  Fm: ['4c', '4f', '4a-'], Db: ['4d-', '4f', '4a-'], Eb: ['3b-', '4e-', '4g'], Cm: ['3g', '4c', '4e-'], C7: ['3g', '3b-', '4c', '4e'],
  Bbm7: ['3a-', '3b-', '4d-', '4f'], Abmaj7: ['3a-', '4c', '4e-', '4g'], Dbmaj7: ['4c', '4d-', '4f', '4a-'], C7sus: ['3g', '3b-', '4c', '4f'],
};
const RQ: Record<string, string> = { Fm: 'f', Db: 'd-', Eb: 'e-', Cm: 'c', C7: 'c', Bbm7: 'b-', Abmaj7: 'a-', Dbmaj7: 'd-', C7sus: 'c' };
const Q_A: Bar[] = ['Fm', 'Db', 'Eb', 'Cm', 'Fm', 'Db', 'Eb', 'Cm'];
const Q_A2: Bar[] = ['Fm', 'Db', 'Eb', 'Cm', 'Fm', 'Db', 'Eb', 'C7'];
const Q_B: Bar[] = ['Bbm7', 'Eb', 'Abmaj7', 'Dbmaj7', 'Bbm7', 'C7', 'Fm', 'C7'];
const Q_C: Bar[] = ['Dbmaj7', 'Eb', 'Fm', 'Fm', 'Dbmaj7', 'Eb', 'C7sus', 'C7'];
const Q_LOOP: Bar[] = [...Q_A, ...Q_A2, ...Q_B, ...Q_C, ...Q_A2];

const qPads = (prog: Bar[]) => bars(prog, (c, b) => chord(VQ[c], b === 4 ? '1' : '2'));
/** The string stabs: the chord an octave up, short, pushed. */
const qStabs = (prog: Bar[]) => bars(prog, c => { const x = chord(VQ[c].map(hi), '8'); return `${x} r4 ${x} r8 ${x} r4`; });
/** The octave bass in sixteenths. */
const qOct = (prog: Bar[]) => bars(prog, c => { const r = RQ[c]; return Array.from({ length: 8 }, () => `o1 ${r}16 o2 ${r}16`).join(' '); });
const qOct8 = (prog: Bar[]) => bars(prog, c => { const r = RQ[c]; return Array.from({ length: 4 }, () => `o1 ${r}8 o2 ${r}8`).join(' '); });
const qBells = (prog: Bar[]) => bars(prog, c => {
  const v = VQ[c].map(hi), n = [v[0], v[1], v[2], hi(v[0])];
  return [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 1, 2, 1].map(k => nt(n[k], '16')).join(' ');
});

const QL_A = [
  'o5 r8 c8 f8 g8 !a-4. g8',
  'o5 f4 a-8 f8 d-4 c4',
  'o5 r8 e-8 g8 b-8 o6 !d-4. c8',
  'o5 b-4 g4 e-8 f8 g4',
  'o5 r8 c8 f8 g8 !a-4. b-8',
  'o6 c4 o5 a-8 f8 a-4 o6 d-4',
  'o6 c8 o5 b-8 g8 e-8 b-4 g4',
  'o5 g2 r2',
];
const QL_A2 = [...QL_A.slice(0, 7), 'o5 e2 g4 b-4'];
const QL_B = ['o5 f4. f8 a-4 b-4', 'o5 b-4. a-8 g4 e-4', 'o6 c4. o5 b-8 a-4 g4', 'o5 f2 e-4 f4', 'o5 f4. f8 a-4 b-4', 'o6 c4. o5 b-8 g4 e4', 'o6 c4 o5 a-4 f4 a-4', 'o5 g4 b-4 o6 c4 e4'];
const QL_C = ['o5 a-1', 'o5 b-1', 'o6 c1', 'o5 a-2 g2', 'o5 a-1', 'o5 b-1', 'o5 f1', 'o5 e1'];

const DK = '{kh}16 h16 o16 h16 {kph}16 h16 o16 h16 {kh}16 h16 o16 h16 {kph}16 h16 o16 h16';
const DK_IN = '{kx}16 h16 o16 h16 {kph}16 h16 o16 h16 {kh}16 h16 o16 h16 {kph}16 h16 o16 h16';
const DFILL = '{kp}16 p16 p16 p16 {kp}16 p16 (808tom)16 (808tom)16 (808tom)16 (808tomlo)16 (808tom)16 (808tomlo)16 (808tomlo)8 (808tomlo)8';
const CH = 'h8 o8 h8 o8 h8 o8 h8 o8';
const SNROLL = '_v60 [s16]4 _v80 [s16]4 _v100 [s16]4 _v120 [s16]4';

export const BOSS_SPACE_QUEEN: Song = {
  title: 'Less Fatal Mode',
  bpm: 124,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.7,
  delay: { beats: 0.75, feedback: 0.35, tone: 3500 },
  parts: {
    lead: { inst: 'supersaw', pan: 0, rev: 0.25, dly: 0.18, mml: join(rest(4), ['_v100'], QL_A, QL_A2, ['_v105'], QL_B, rest(8), ['_v110'], QL_A2) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.45, mml: join(rest(4), rest(16), ['_v90'], QL_B, ['_v95'], QL_C, ['_v95'], up(QL_A2, -1)) },
    stabs: { inst: 'strings', pan: -0.35, rev: 0.25, vol: 0.35, mml: join(['q3'], rest(4), rest(8), ['_v105'], qStabs(Q_A2), rest(16), qStabs(Q_A2)) },
    pad: { inst: 'pwm', pan: 0.1, rev: 0.4, vol: 0.38, mml: join(['_v85 _e30 _e127/1^1^1 ' + chord(VQ.Fm, '1'), chord(VQ.Fm, '1'), chord(VQ.Db, '1'), chord(VQ.C7sus, '1'), '_e127'], ['_v75'], qPads(Q_LOOP)) },
    bells: { inst: 'fmpiano', pan: 0.4, rev: 0.3, dly: 0.15, vol: 0.28, mml: join(['q4'], rest(4), rest(16), ['_v80'], qBells(Q_B), qBells(Q_C), qBells(Q_A2)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.4, mml: join(rest(4), rest(16), ['_v85'], qPads(Q_B), ['_v95'], qPads(Q_C), rest(8)) },
    ray: { inst: 'sawlead', pan: -0.2, rev: 0.4, dly: 0.3, vol: 0.35, mml: join(rest(4), rest(24), rest(6), ['_g1 _v85 o4 c4 o6 c2.', 'o4 c4 o6 c2. _g0'], rest(8)) },
    bass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.6, mml: join(['r1', 'r1', '_v100'], qOct8(['Db', 'C7sus']), ['_v105'], qOct(Q_A), qOct(Q_A2), qOct(Q_B), qOct8(Q_C), qOct(Q_A2)) },
    kit: {
      inst: '909kick', drums: true, kit: '909', rev: 0.15, vol: 0.7,
      mml: join(
        ['_v100 k4 k4 k4 k4', 'k4 k4 k4 k4', 'k4 {kp}4 k4 {kp}4', '{kp}16 p16 p16 p16 {kp}16 p16 p16 p16 [s16]8'],
        ['_v105'], [DK_IN], rep(DK, 6), [DFILL], [DK_IN], rep(DK, 6), [DFILL], [DK_IN], rep(DK, 6), [DFILL],
        ['_v90'], rep(CH, 4), ['_v100'], rep(DK, 3), [SNROLL],
        ['_v110'], [DK_IN], rep(DK, 6), [DFILL],
      ),
    },
    hits: {
      inst: 'orchhit', pan: 0, rev: 0.35, vol: 0.5,
      mml: join(rest(4), rest(8), rest(7), ['_v110 o4 c4 r4 c8 c8 r4'], ['o4 a-4 r2.'], rest(4), ['o4 c4 r2.'], rest(1), ['o4 c4 r4 c4 r4'], rest(8), ['o4 d-4 r2.'], rest(6), ['o4 c4 r4 c8 c8 r4']),
    },
  },
  arrangements: {
    main: {},
    intro: { solo: ['bass', 'pad', 'bells', 'choir'], vol: { bells: 1.3, choir: 1.1 }, level: 0.8 },
  },
};
