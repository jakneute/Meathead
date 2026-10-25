// SPOOKY LAND's fights: the hell demon (BLOATHAZAR, Satan's boy: the sub-boss) and Donnie Dracula (the land's boss).
// The land's theme and its set pieces are in spooky.ts.
//
// ---- "SATAN'S BIGGEST FAN" (boss:demon; was Hell's Couch Potato, for the old couch demon) ----
// A fat, lazy demon with a pitchfork who'd rather be lying down: thrash metal that keeps running out of breath. The
// riff gallops (E minor, the flat two and the flat five, a chromatic slide down like him sliding off the couch), twin
// guitars in thirds, a skank beat; then it slumps into a half-time doom groove, the rhythm guitar dragging the tune
// (bending, and a tuba farting down an octave at the end of it); then a shred solo; then a breakdown with gang shouts
// ("HEY!") and double kick. It opens with a yawn: the power chord ringing out, the tuba groaning, the hi-hat counting
// in. (Already Mega Man boss energy before the high-energy pass; that pass only took the tune off the tuba.)
//
// E minor, 200. 36 bars: the 4-bar yawn (once), then:
//   A  (8)  the riff (E, F, G, the C-D-E stabs, the slide), the twin leads in thirds over the second half.
//   B  (8)  the slump: half time, power chords (E - A-Bb - E - Bb-A - C D - E), the rhythm guitar's tune, the lead
//           yawning, the tuba's fart.
//   C  (8)  the riff again under the solo (harmonic minor runs, sweeps, a divebomb).
//   D  (8)  the breakdown: chugs, double kick, the gang shouting HEY!, the leads screaming long notes.
// ARRANGEMENTS: main, intro (the yawn: the power chord, the tuba, the kit, the bass).
//
// ---- "FANGS FOR COMING" (boss:donnie-dracula) ----
// Donnie: a fat balding PA guy in a cheap wig and cape, juiced up by Satan in a tacky ballroom. Tacky grandeur as a
// Mega Man castle boss (Castlevania's organ by way of Wily's): a real three-voice organ fugue in G minor (the subject,
// the tonal answer in D, the countersubject, the subject in the pedal) over a half-time ride groove building, that
// turns into an 80s rock opera (the subject on the organ with a lead guitar under it, power chords, the bass pumping,
// the choir, a harpsichord running sixteenths), then a danse macabre in C minor on the ballroom's violin (the tango's
// tune at a gallop, castanets snapping, the power chords chopping the habanera), then the grand finale: the subject in
// augmentation on the brass section and the organ, the Neapolitan A-flat, the kit driving, before it all starts again
// with the fugue. It opens with a toccata flourish (mordents, the run down, the diminished chord over the pedal D).
//
// G minor, 166. 36 bars: the 4-bar toccata (once), then:
//   A  (8)  the fugue: subject (Gm), answer over the countersubject (Dm), the subject in the pedal, Cm - D7.
//   B  (8)  the rock opera: Gm - Gm - Cm - D7 - Eb - Bb/D - Cm - D7.
//   C  (8)  the danse macabre, in C minor: Cm - Cm - G7 - G7 - Cm - Fm - Ab7 - D7.
//   D  (8)  the finale: Gm - Gm - Eb - Eb - Cm - Ab - D7 - D7.
// ARRANGEMENTS: main, intro (Satan's circle: the organ, the harpsichord, the timpani, the bells).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, hi, nt, chord, bars } from './jungle';
import { pump, gallop, riff, BEAT16, MM2, DRIVE, FILL, FILL2, FILL_BIG, ROLL_UP, X, sec } from './mega';

/** A timpani roll over a bar, building. */
const ROLL = (n: string) => `o2 _v50 [${n}32]8 _v70 [${n}32]8 _v90 [${n}32]8 _v110 [${n}32]8`;

// =====================================================================================================================
// SATAN'S BIGGEST FAN

const R1 = 'o2 e8 e8 e8 f8 e8 e8 g8 f+8';
const R2 = 'o2 e8 e8 e8 f8 e8 e8 b-8 a8';
const R3 = 'o2 c4. d4. e4';
const R4 = 'o2 g8 f+8 f8 e8 d+8 d8 c+8 c8';
const RIFF = [R1, R2, R1, R3, R1, R2, R1, R4];
const POWER_A = ['o2 e2 r2', 'r1', 'o2 e2 r2', R3, 'o2 e2 r2', 'r1', 'o2 e2 r2', R4];
const LEAD_A = ['r1', 'r1', 'r1', 'r1', 'o5 e4 f+4 g4 a4', 'o5 b2 a4 g4', 'o5 f+4 g4 a4 b4', 'o6 c2 o5 b2'];
const LEAD2_A = ['r1', 'r1', 'r1', 'r1', 'o4 b4 o5 d4 e4 f+4', 'o5 g2 f+4 e4', 'o5 d4 e4 f+4 g4', 'o5 a2 g2'];
const POWER_B = ['o2 e2. g4', 'o2 a2. b-4', 'o2 e2. g4', 'o2 b-2 a4 g4', 'o2 e2. g4', 'o2 a2. b-4', 'o2 c2 d2', 'o2 e1'];
const TUBA_B = ['o2 e4. g8 _b-1 a4 g4', 'o2 _b-1 b-2. a4', 'o2 e4. g8 _b-1 a4 b-4', 'o2 _f-5 b-2 a4 g4', 'o2 g4. a8 b-4 a4', 'o2 g2 e2', 'o2 c4. c8 d4. d8', 'o2 _f-12/2 e1'];
const LEAD_B = ['r1', 'r2 o5 _b-2 b2', 'r1', 'o5 _f-2 a2 r2', 'r1', 'r2 o5 _b-2 b2', 'o6 c2 d2', 'o5 _b-2 e1'];
const SOLO = [
  'o5 e16 f+16 g16 a16 b16 a16 g16 f+16 e16 f+16 g16 a16 b8 o6 e8',
  'o6 d+16 e16 d+16 c16 o5 b16 a16 g16 f+16 e4 r4',
  'o5 g16 a16 b16 o6 c16 d+16 e16 f+16 g16 a16 g16 f+16 e16 d+8 o5 b8',
  'o6 e4. d+4. o5 b4',
  'o5 e16 g16 b16 o6 e16 o5 e16 g16 b16 o6 e16 o5 f+16 a16 o6 c16 f+16 o5 f+16 a16 o6 c16 f+16',
  'o5 g16 b16 o6 e16 g16 o5 g16 b16 o6 e16 g16 o5 a16 o6 c16 e16 a16 o5 b16 o6 d+16 f+16 a16',
  'o6 e4 _b-2 e4 d+8 c8 o5 b8 a8',
  'o5 b2 _f-12/2 b2',
];
const BD = 'o2 e8 r8 e8 e8 r8 e8 r8 e8';
const CHUG_D = [BD, BD, BD, 'o2 e8 e8 f8 f8 g8 g8 a8 b-8', BD, BD, BD, R4];
const LEAD_D = ['o5 _b-2 b1', 'o6 c1', 'o5 b1', 'o5 a2 g2', 'o5 _b-2 b1', 'o6 c1', 'o6 d+1', 'o6 e2 _f-12/2 e2'];
const LEAD2_D = ['o5 g1', 'o5 a1', 'o5 g1', 'o5 f+2 e2', 'o5 g1', 'o5 a1', 'o5 b1', 'o5 b1'];
const HEY = 'o3 r2. {e b}4';

const SK = '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8';
const SK_IN = '{kx}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8';
const HITS = '{kx}4. {kx}4. {kx}4';
const SLIDE = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 (tom4)8 (tom4)8';
const KIT_A = ['_v105 ' + SK_IN, SK, SK, HITS, SK, SK, SK, SLIDE];
const DOOM = '{kh}4 h4 {sh}2';
const DOOM_IN = '{kx}4 h4 {sh}2';
const DOOM_FILL = 's8 s8 (tom1)8 (tom2)8 (tom3)8 (tom3)8 (tom4)8 (tom4)8';
const DK = '{kh}16 k16 k16 k16 {sh}16 k16 k16 k16 {kh}16 k16 k16 k16 {sh}16 k16 k16 k16';
const DK_IN = '{kx}16 k16 k16 k16 {sh}16 k16 k16 k16 {kh}16 k16 k16 k16 {sh}16 k16 k16 k16';

export const BOSS_DEMON: Song = {
  title: "Satan's Biggest Fan",
  bpm: 200,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.6,
  delay: { beats: 0.75, feedback: 0.2, tone: 2800 },
  parts: {
    lead: { inst: 'distlead', pan: 0.2, rev: 0.2, dly: 0.12, vol: 0.75, mml: join(rest(4), ['_v105'], LEAD_A, ['_v95'], LEAD_B, ['_v115'], SOLO, ['_v110'], LEAD_D) },
    lead2: { inst: 'overdrive', pan: -0.3, rev: 0.18, dly: 0.08, vol: 0.6, mml: join(rest(4), ['_v100'], LEAD2_A, ['_v110'], up(TUBA_B.slice(0, 7)), ['r1'], rest(8), ['_v100'], LEAD2_D) },
    chug: { inst: 'chug', pan: -0.4, rev: 0.06, vol: 0.6, mml: join(rest(4), ['_v110'], RIFF, rest(8), RIFF, CHUG_D) },
    power: { inst: 'powerchord', pan: 0.4, rev: 0.1, vol: 0.5, mml: join(['_v105 o2 e1', 'o2 e1', 'r1', 'r1'], POWER_A, ['_v110'], POWER_B, POWER_A, ['r1', 'r1', 'r1', R3, 'r1', 'r1', 'r1', R4]) },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.75, mml: join(['_v95 o1 e1', 'o1 e1', 'r1', 'r1'], ['_v105'], up(RIFF, -1), up(POWER_B, -1), up(RIFF, -1), up(CHUG_D, -1)) },
    // (the tuba only groans the yawn and farts the slump's last note: the guitar has the slump's tune)
    tuba: { inst: 'tuba', pan: 0.1, rev: 0.2, vol: 0.8, mml: join(['r1', 'r1', '_v115 o1 _b-5 e2 _f-7/2 e2', 'r1'], rest(8), rest(7), ['_v120'], TUBA_B.slice(7), rest(16)) },
    choir: { inst: 'choir', pan: 0, rev: 0.25, vol: 0.55, mml: join(rest(4), rest(24), ['q3 _v125', HEY, HEY, HEY, 'r1', HEY, HEY, HEY, 'r1']) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.75,
      mml: join(['r1', 'r1', 'r1', '_v100 h4 h4 h4 h4'], KIT_A, ['_v100 ' + DOOM_IN], rep(DOOM, 6), [DOOM_FILL], KIT_A, ['_v110 ' + DK_IN, DK, DK, DK, DK, DK, DK, SLIDE]),
    },
  },
  arrangements: {
    main: {},
    intro: { solo: ['power', 'tuba', 'kit', 'bass'], level: 0.9 },
  },
};

// =====================================================================================================================
// FANGS FOR COMING

const V8: Record<string, string[]> = {
  Gm: ['3b-', '4d', '4g'], Cm: ['3g', '4c', '4e-'], D7: ['3f+', '3a', '4c', '4d'], Eb: ['3b-', '4e-', '4g'], 'Bb/D': ['3b-', '4d', '4f'],
  Fm: ['3a-', '4c', '4f'], Ab7: ['3a-', '4c', '4e-', '4g-'], G7: ['3g', '3b', '4d', '4f'], Ab: ['3a-', '4c', '4e-'],
};
const R8: Record<string, [string, string]> = {
  Gm: ['g', 'd'], Cm: ['c', 'g'], D7: ['d', 'a'], Eb: ['e-', 'b-'], 'Bb/D': ['d', 'b-'], Fm: ['f', 'c'], Ab7: ['a-', 'e-'], G7: ['g', 'd'], Ab: ['a-', 'e-'],
};
const DN_A: Bar[] = ['Gm', 'Gm', 'D7', 'D7', 'Gm', 'Gm', 'Cm', 'D7'];
const DN_B: Bar[] = ['Gm', 'Gm', 'Cm', 'D7', 'Eb', 'Bb/D', 'Cm', 'D7'];
const DN_C: Bar[] = ['Cm', 'Cm', 'G7', 'G7', 'Cm', 'Fm', 'Ab7', 'D7'];
const DN_D: Bar[] = ['Gm', 'Gm', 'Eb', 'Eb', 'Cm', 'Ab', 'D7', 'D7'];
const dnRoot = (c: string) => R8[c][0];

const dnPads = (prog: Bar[]) => bars(prog, c => chord(V8[c], '1'));
/** The harpsichord: the chord an octave up, up and down in sixteenths. */
const arp16 = (prog: Bar[]) => bars(prog, c => {
  const v = V8[c].map(hi), n = [...v, ...v.map(hi)];
  return [...n, ...[...n].reverse(), ...n].slice(0, 16).map(x => nt(x, '16')).join(' ');
});
const dnRoots = (prog: Bar[]) => bars(prog, c => `o2 ${R8[c][0]}1`);

// The toccata (once), the fugue's three voices, the rock opera's tune, the danse macabre, the subject in augmentation
const TOCCATA = ['o5 g16 f+16 g8 r4 d16 c+16 d8 r4', 'o5 b-16 a16 g16 f+16 e-16 d16 c16 o4 b-16 a16 g16 f+16 e-16 d4', chord(['4c', '4e-', '4f+', '4a'], '1'), chord(['4c', '4d', '4f+', '4a'], '1')];
const SUBJ = ['o4 g4 d8 g8 b-8 a8 g8 f+8', 'o4 g8 a8 b-8 o5 c8 d4 o4 d4'];
const FUGUE1 = [...SUBJ, 'o4 b-8 a8 g8 f8 e8 g8 a8 o5 c+8', 'o5 d4 c8 o4 b-8 a4 f+4', 'o5 d4. c8 o4 b-4 a4', 'o4 b-8 o5 c8 d8 e-8 f+4 g4', 'o5 g8 f8 e-8 d8 c8 o4 b-8 a8 g8', 'o4 f+4 a4 o5 c4 o4 a4'];
const FUGUE2 = ['r1', 'r1', 'o5 d4 o4 a8 o5 d8 f8 e8 d8 c+8', 'o5 d8 e8 f8 g8 a4 o4 a4', 'o4 g2 f+2', 'o4 d2 f+2', 'o4 e-2 g2', 'o4 d2 c2'];
const FUGUE3 = ['r1', 'r1', 'o2 d1', 'o2 d1', ...up(SUBJ, -1), 'o2 c2 e-2', 'o2 d1'];
const OPERA = [...up(SUBJ), 'o5 c4 o4 g8 o5 c8 e-8 d8 c8 o4 b-8', 'o4 a8 b-8 o5 c8 d8 f+4 d4', 'o5 g2 f4 e-4', 'o5 d2 c4 o4 b-4', 'o4 a4 b-4 o5 c4 e-4', 'o5 d1'];
const MACABRE = ['o5 g4 g8. a-16 g8 f8 e-8 d8', 'o5 c4. o4 b8 o5 c2', 'o5 f4 f8. g16 f8 e-8 d8 c8', 'o4 b4. a-8 g2', 'o5 e-8 f8 g8 a-8 b-4 a-8 g8', 'o5 a-4. g8 f4 c4', 'o5 g-4 e-8 c8 o4 a-4 o5 c4', 'o5 d8 e-8 f+8 a8 o6 c4 o5 a4'];
const AUG = ['o4 g2 d4 g4', 'o4 b-4 a4 g4 f+4', 'o4 g4 a4 b-4 o5 c4', 'o5 d2 d2', 'o5 e-2 d4 c4', 'o5 c2 e-2', 'o5 d1', 'o5 c4 o4 b-4 a4 f+4'];

const RIDE_A = '{k(ride)}8 (ride)8 (ride)8 (ride)8 {s(ride)}8 (ride)8 {k(ride)}8 (ride)8';
const CAST = '(castanets)8. (castanets)16 (castanets)8 (castanets)8 (castanets)4 (castanets)16 (castanets)16 (castanets)8';

export const BOSS_DONNIE: Song = {
  title: 'Fangs for Coming',
  bpm: 166,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.65,
  parts: {
    org1: { inst: 'churchorgan', pan: 0.15, rev: 0.32, vol: 0.75, mml: join(['_v110'], TOCCATA, ['_v105'], FUGUE1, ['_v112'], OPERA, rest(8), ['_v112'], up(AUG)) },
    org2: { inst: 'churchorgan', pan: -0.15, rev: 0.32, vol: 0.55, mml: join(rest(4), ['_v95'], FUGUE2, ['_v100'], up(OPERA, -1), rest(8), ['_v90'], dnPads(DN_D)) },
    org3: { inst: 'churchorgan', pan: 0, rev: 0.32, vol: 0.55, mml: join(['r1', 'r1', '_v105 o1 {d >d}1', 'o1 {d >d}1'], ['_v95'], FUGUE3, ['_v100'], dnRoots(DN_B), rest(8), dnRoots(DN_D)) },
    guitar: { inst: 'distlead', pan: -0.3, rev: 0.2, dly: 0.1, vol: 0.5, mml: join(rest(4), rest(8), ['_v105'], up(OPERA, -1), rest(8), ['_v110'], AUG) },
    violin: { inst: 'violin', pan: 0.25, rev: 0.25, dly: 0.08, vol: 0.85, mml: join(rest(4), rest(16), ['_v110'], MACABRE, rest(8)) },
    harpsi: { inst: 'harpsichord', pan: -0.4, rev: 0.25, vol: 0.4, mml: join(rest(4), ['_v95'], up(SUBJ), rest(6), ['_v90'], arp16(DN_B), arp16(DN_C), arp16(DN_D)) },
    brass: { inst: 'brass', pan: 0.1, rev: 0.25, vol: 0.65, mml: join(rest(4), rest(24), ['_v118'], AUG) },
    power: { inst: 'powerchord', pan: 0.4, rev: 0.06, vol: 0.42, mml: join(rest(4), rest(8), ['_v105'], riff(DN_B, dnRoot, '! x . x x . x x'), riff(DN_C, dnRoot, '! . . x . . x .'), riff(DN_D, dnRoot, '! x x x x x x x')) },
    bass: { inst: 'bass', pan: 0, rev: 0.04, vol: 0.8, mml: join(['r1', 'r1', '_v100 o1 d1', 'o1 d1'], ['_v100'], up(FUGUE3, -1).map((b, i) => (i < 2 ? 'o1 g1' : b)), pump(DN_B, dnRoot, 1), gallop(DN_C, dnRoot, 1), pump(DN_D, dnRoot, 1)) },
    choir: { inst: 'choir', pan: 0, rev: 0.4, vol: 0.5, mml: join(rest(4), rest(8), ['_v95'], dnPads(DN_B), rest(8), ['_v110'], dnPads(DN_D)) },
    strings: { inst: 'strings', pan: 0.05, rev: 0.35, vol: 0.38, mml: join(rest(4), ['_v60'], dnPads(DN_A), ['_v80'], dnPads(DN_B), ['_v75'], dnPads(DN_C), ['_v95'], dnPads(DN_D)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.1, vol: 0.78,
      mml: join(['r1', 'r1', '_v100 {kx}4 r2.', ROLL_UP], ['_v95'], sec(RIDE_A, 8, FILL), ['_v105'], sec(BEAT16, 8, FILL2), sec(MM2, 8, FILL), ['_v112'], [X(DRIVE)], rep(DRIVE, 6), [FILL_BIG]),
    },
    castanets: { inst: 'castanets', drums: true, pan: 0.35, rev: 0.2, vol: 0.5, mml: join(rest(4), rest(16), ['_v100'], rep(CAST, 8), rest(8)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.6,
      mml: join(
        ['r1', 'r1', ROLL('d'), '_v120 o2 d4 r4 d4 r4'],
        rest(7), [ROLL('d')],
        ['_v110 o2 g4 r2.', 'r1', 'o2 c4 r2.', 'o2 d4 r2.', 'o2 e-4 r2.', 'o2 d4 r2.', 'o2 c4 r2.', 'o2 d4 r4 d4 d4'],
        ['_v100 o2 c4 r2.', 'r1', 'o2 g4 r2.', 'r1', 'o2 c4 r2.', 'o2 f4 r2.', 'o2 a-4 r2.', ROLL('d')],
        ['_v120 o2 g4 r2.', 'r1', 'o2 e-4 r2.', 'r1', 'o2 c4 r2.', 'o2 a-4 r2.', 'o2 d4 r2.', ROLL('d')],
      ),
    },
    chimes: { inst: 'chimes', pan: 0.25, rev: 0.45, vol: 0.45, mml: join(['_v100 o4 g2 r2', 'r1', 'o4 d2 r2', 'r1'], rest(24), ['_v100 o4 g2 r2'], rest(7)) },
  },
  arrangements: {
    main: {},
    intro: { solo: ['org1', 'org2', 'org3', 'harpsi', 'timpani', 'chimes'], level: 0.9 },
  },
};
