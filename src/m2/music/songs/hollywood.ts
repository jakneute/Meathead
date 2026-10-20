// HOLLYWOOD LAND's music (land id 'hollywood'): the land's theme, a version of it for every section, and its set
// pieces' own songs (THRONES OF THE STARS between its stops, DISASTER: THE RIDE's stock music, every disaster at once).
// The fights (the Ensemble Cast, Stuntman Steve) are in hollywoodBosses.ts. All of it at Mega Man pace (the high-energy
// rework: mmkit.ts's patterns, a pumping octave bass, power chords, sixteenth arpeggios, twin leads, a fill into every
// section).
//
// ---- "YOUR NAME HERE" (land:hollywood) ----
// A studio's searchlight fanfare turned into an action-movie stage theme: the showbiz hook on a trumpet up front (up the
// major seventh, down the E7, the minor iv's A-flat), a second trumpet in thirds the second time, power chords pushing
// the and-of-two, the bass pumping octaves, a square arpeggio sparkling; a swashbuckling B that lurches up a major third
// into A-flat (the trumpets' twin line, a distorted guitar an octave under); and the B-movie reel in A minor gone to
// half-time menace: the theremin wailing over palm-muted sixteenths, brass hits and toms.
// C major, 168, straight. 36 bars: a 4-bar fanfare (once: C - F/C - Fm/C - G7, power-chord hits on the dotted call,
// the drums building), then A1 (Cmaj7 - E7 - Fmaj7 - Fm6 - C/G - A7 - D7 - G7), A2 (... Em7 - A7 - Dm7 G7 - C6), B (in
// A-flat: Abmaj7 - Fm7 - Dbmaj7 - Bbm7 Eb7 - Abmaj7 - Fm7 - Dm7b5 - G7), C (Am - F7 - E7 - Am - Dm - Bb7 - Ab7 - G7).
// ARRANGEMENTS (one per section, crossfading as he walks):
//   blvd / main / coaster   the whole band
//   warehouse  the secret Revengers set: the hook on French horns, the low strings' da-da-dum, taiko, the brass up
//   lot        the backlot as film noir: the whole tune on a tenor sax an octave down, a sidestick-and-ride half time,
//              the bass, slow strings (calmer, not cute)
//   disaster   lobby music through the ceiling: the tune on the organ, muffled
//   havoc      the wreckage after: the tune on the theremin, slow strings, oohs, timpani, no drums
//   stunt      the stage before Steve: the hook on a saw lead (keytar), the guitars up
//   cutscene   the tune on a horn over slow strings and the bass
//   boss       the band, taiko and the ostinato in, the kit and timpani up
//
// ---- "ROYAL FLUSH" (seq:coaster) ----
// THRONES OF THE STARS between its stops: the can-can galop at rollercoaster speed as a Mega Man stage. A square lead
// tearing through the can-can's eighths, a saw lead in thirds the second time, the kick and snare galloping eighths,
// the octave bass pumping, power chords; a B on a distorted guitar over sixteenth arpeggios; the Pomp-and-Circumstance
// trio in A as a half-time anthem (brass, choir, the guitar an octave up). Herald trumpets and the lift's ratchet once.
// E major, 184. 36 bars: the lift (4, once), A (E - E - B7 - E - E - A - B7 - E), A2 (... C#m - F#7 - B7 - B7), B (C#m -
// G#m - A - E - F#m - C#7 - F#7 - B7), C (the trio: A - E/G# - F#m - D - A/C# - D - F#7 - B7).
// ARRANGEMENTS (cues.ts hollywoodArrs): queue (the station's speakers: the tune on an organ, the bass and kit, muffled),
// board (parked: the ratchet, tremolo strings, timpani, horns), ride (everything), stop (a stop's staff coming: the tune
// on trumpet, the kit and brass up), launch (everything, the choir and hits up).
//
// ---- "STOCK FOOTAGE" (seq:disaster-ride) ----
// DISASTER: THE RIDE's own music, a 70s Italian library cue played like Goblin: the flute's tune doubled an octave under
// by a distorted guitar, a Hammond, a clavinet chopping sixteenths, a funk-rock kit, a syncopated bass; the strings take
// B; the suspense vamp ends on the stockest "DUN DUN DUNNN". Each disaster re-orchestrates it.
// G minor, 144. 36 bars: a 4-bar sting (once), A (Gm - Eb - Cm - D7 - Gm - Eb - Am7b5 - D7), B (B-flat: Bb - F/A - Gm -
// Eb - Bb/F - Cm7 - F7sus - F7), A, C (the vamp: Eb - D - Eb - D - Cm - D - Eb - D7b9).
// ARRANGEMENTS (cues.ts): lobby (the queue: the tune on electric piano through the ceiling), preshow, theater, quake
// (rumble, timpani), volcano (the tune on brass, congas), tornado (theremin), blizzard (a supersaw, sleigh bells, the kit
// down), flood (harp), wildfire (trumpet, the brass up), real (REAL DISASTERS: trumpet, choir, taiko, hits), wrecked.
//
// ---- "EVERY DISASTER AT ONCE" (seq:havoc) ----
// The 70s disaster-movie score off the rails at Mega Man speed: the brass fanfare over sixteenth strings, power chords,
// the octave bass, a theremin air-raid siren, a heroic B in D (the violins, the horns in thirds), the C climbing a half
// step every bar (the water coming up), and D, the tornado chase, the tune in driving eighths over a sixteenth kit.
// B minor, 172. 36 bars: a 4-bar siren (once), A (Bm - Bm - G - G - Em - C - F#7sus - F#7), B (D - A/C# - Bm - G - D/F#
// - Em7 - C - F#7), C (Bm up a half step a bar to Fm, then F#7), D (Bm - G - Bm - G - Em - F#7 - Em - F#7).
// ARRANGEMENTS (cues.ts by where he is): street, wind (theremin and gusts up), quake (taiko, timpani, low brass), flood
// (harp, violins, choir), blizzard (sleigh bells, the kit down), chase (everything, taiko, a sixteenth shaker), fling
// (no kit: the choir and taiko).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, tp, scale, sec, KIT, FILL, troll } from './mmkit';

// =====================================================================================================================
// YOUR NAME HERE

const L_IN: Bar[] = ['C', 'F/C', 'Fm/C', 'G7'];
const L_A1: Bar[] = ['Cmaj7', 'E7', 'Fmaj7', 'Fm6', 'C/G', 'A7', 'D7', 'G7'];
const L_A2: Bar[] = ['Cmaj7', 'E7', 'Fmaj7', 'Fm6', 'Em7', 'A7', ['Dm7', 'G7'], 'C6'];
const L_B: Bar[] = ['Abmaj7', 'Fm7', 'Dbmaj7', ['Bbm7', 'Eb7'], 'Abmaj7', 'Fm7', 'Dm7b5', 'G7'];
const L_C: Bar[] = ['Am', 'F7', 'E7', 'Am', 'Dm', 'Bb7', 'Ab7', 'G7'];
const L_LOOP: Bar[] = [...L_A1, ...L_A2, ...L_B, ...L_C];

const L_FANFARE = ['o5 g8. g16 g4 o6 c2', 'o5 a8. a16 a4 o6 c2', 'o5 a-8. a-16 a-4 o6 c4 d4', 'o5 b2. r4'];
const L_HOOK1 = [
  'o4 g8 o5 c8 e8 g8 r8 g4 b8',
  'o5 b4 g+8 e8 r8 d4.',
  'o6 c4 o5 a8 f8 r8 e8 f8 a8',
  'o5 a-4. g8 f4 d4',
  'o4 g8 o5 c8 e8 g8 r8 g4 o6 c8',
  'o6 c+4 o5 a8 e8 r8 g8 e8 c+8',
  'o5 d8 f+8 a8 o6 c8 r8 o5 b8 a8 f+8',
  'o5 g2 f8 e8 d8 o4 b8',
];
const L_HOOK2 = [...L_HOOK1.slice(0, 4), 'o5 g8 e8 g8 b8 r8 b4 a8', 'o5 a8 c+8 e8 g8 r8 f8 e8 c+8', 'o5 d8 f8 a8 o6 d8 r8 c8 o5 b8 g8', 'o6 c2 r8 o5 e-8 f8 g8'];
const L_BMEL = [
  'o5 a-4. g8 a-4 o6 c4',
  'o6 e-4. c8 r8 c8 o5 a-4',
  'o5 f4. e-8 f4 a-4',
  'o6 d-4 c4 o5 b-4 g4',
  'o5 a-4. g8 a-4 o6 e-4',
  'o6 f4. e-8 r8 e-8 c4',
  'o6 c8 o5 b8 o6 c8 d8 r8 f8 e-8 d8',
  'o6 d2 o5 b4 g4',
];
const L_CMEL = ['o5 a2 o6 c4 o5 b4', 'o5 a2 e-2', 'o5 g+2. f4', 'o5 e1', 'o5 d2 f4 a4', 'o5 a-2 f2', 'o5 g-2 e-2', 'o5 f2 d4 o4 b4'];
const L_TUNE = [...L_FANFARE, ...L_HOOK1, ...L_HOOK2, ...L_BMEL, ...L_CMEL];

const CM = scale('c', 'major'), AH = scale('a', 'harmonic'), DH = scale('d', 'harmonic'), CMIN = scale('c', 'minor');
const AB = scale('ab', 'major'), CH = scale('c', 'harmonic');
const L_TWIN2 = harm(L_HOOK2, [CM, AH, CM, CMIN, CM, DH, CM, CMIN]);
const L_TWINB = harm(L_BMEL, [AB, AB, AB, AB, AB, AB, CH, CH]);

const L_HALF = '{kh}8 h8 (tom4)8 h8 {sh}8 h8 (tom4)16 (tom4)16 {kh}8';
const L_LITE = '{ki}8 ?i8 i8 ?i8 {mi}8 ?i8 i8 {ki}8';
const OCT = "B8 B'8 B8 B'8 B8 B'8 B8 B'8";
const PUMP = "!B8 B8 B'8 B8 !B8 B8 B'8 B8";
const ARP = '016 116 216 316';

export const LAND_HOLLYWOOD: Song = {
  title: 'Your Name Here',
  bpm: 168,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.25, tone: 3000 },
  parts: {
    hook: { inst: 'trumpet', pan: 0, rev: 0.22, dly: 0.1, mml: join(['_v112'], L_FANFARE, ['_v108'], L_HOOK1, L_HOOK2, ['_v104'], L_BMEL, rest(8)) },
    twin: { inst: 'trumpet', pan: 0.3, rev: 0.25, vol: 0.5, mml: join(rest(12), ['_v100'], L_TWIN2, L_TWINB, rest(8)) },
    gtrlead: { inst: 'distlead', pan: -0.25, rev: 0.2, dly: 0.1, vol: 0.38, mml: join(rest(20), ['_v100'], up(L_BMEL, -1), rest(8)) },
    theremin: { inst: 'theremin', pan: 0.15, rev: 0.35, dly: 0.2, vol: 0.75, mml: join(rest(28), ['_g8 _v105'], L_CMEL, ['_g0']) },
    gtr: {
      inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.5,
      mml: join(['_v110'], pat(L_IN.slice(0, 3), '!R4. R8 r2', 40), pat(['G7'], '!R8 R8 R8 R8 R8 R8 !R8 !R8', 40),
        ['_v100'], pat([...L_A1, ...L_A2], '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40), pat(L_B, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40),
        ['@chug _v105'], pat(L_C, '!R16 R16 R16 R16 R16 R16 !R16 R16 R16 R16 R16 R16 !R16 R16 R16 R16', 40), ['@']),
    },
    bass: {
      inst: 'bass', pan: 0, rev: 0.05, vol: 0.85,
      mml: join(['_v110'], pat(L_IN.slice(0, 3), '!B4. B8 r2', 28), pat(['G7'], "B8 B8 B8 B8 B'8 B'8 B'8 B'8", 28),
        ['_v100'], pat([...L_A1, ...L_A2], OCT, 28), pat(L_B, PUMP, 28), pat(L_C, "!B4. B8 r8 B8 B'4", 28)),
    },
    arp: { inst: 'squarelead', pan: 0.35, rev: 0.2, dly: 0.15, vol: 0.2, mml: join(rest(12), ['q5 _v90'], pat([...L_A2, ...L_B], ARP, 67), rest(8)) },
    pad: { inst: 'strings', pan: -0.1, rev: 0.35, vol: 0.3, mml: join(['_v90'], pads(L_IN, 55), ['_v62'], pads(L_A1, 55), ['_v70'], pads(L_A2, 55), ['_v85'], pads(L_B, 55), ['_v75'], pads(L_C, 55)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.32, mml: join(rest(20), ['_v85'], pads(L_B, 55), ['_v80'], pads(L_C, 52)) },
    brass: {
      inst: 'brass', pan: 0.2, rev: 0.25, vol: 0.5,
      mml: join(['_v112'], pat(L_IN.slice(0, 3), '!X8. X16 X4 X2', 60), pat(['G7'], '!X2. r4', 59),
        ['_v100'], pat(L_A1, 'r2 r8 !X8 r8 X8', 60), pat(L_A2, '!X4. X8 r2', 60), rest(8), ['_v110'], pat(L_C, '!X8 r8 r8 X8 r2', 57)),
    },
    hits: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.45, mml: join(['_v110 o4 c4 r2.', 'r1', 'r1', 'o4 g4 r2.'], ['o4 c4 r2.'], rest(7), ['o4 c4 r2.'], rest(7), ['o4 a-4 r2.'], rest(7), ['o4 c4 r2.'], rest(6), ['o4 r2 g4 r4']) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.75, not: ['lot', 'disaster', 'havoc', 'cutscene'],
      mml: join(['_v110 {kx}4. {kx}8 r2', '{kx}4. {kx}8 r2', '{kx}4. {kx}8 r2', FILL.big], ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.mm, FILL.snare), sec(8, KIT.drive, FILL.toms), sec(8, L_HALF, FILL.big)),
    },
    timp: {
      inst: 'timpani', pan: -0.15, rev: 0.3, vol: 0.55,
      mml: join(['_v110 o2 c4 r2.', 'o2 c4 r2.', 'o2 c4 r2.', troll('o2 g')], ['o2 c4 r2.'], rest(6), [troll('o2 g')], ['o2 c4 r2.'], rest(6), [troll('o2 g')],
        ['o2 a-4 r2.'], rest(6), [troll('o2 g')], pat(L_C.slice(0, 7), 'B4 r2.', 40), [troll('o2 g')]),
    },
    // (the arrangements' own)
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.6, only: ['warehouse', 'boss'], mml: join(rest(4), ['_v105'], rep('f4 r8 f8 f4 f8 f8', 32)) },
    ostinato: { inst: 'strings', pan: -0.2, rev: 0.25, vol: 0.45, only: ['warehouse', 'boss'], mml: join(rest(4), ['q5 _v100'], pat(L_LOOP, "B8 B16 B16 B8 B16 B16 B8 B16 B16 B8 B'8", 40)) },
    tune: { inst: 'organ', pan: 0, rev: 0.3, dly: 0.12, only: ['disaster', 'havoc', 'cutscene'], mml: join(['_v100'], L_TUNE) },
    noir: { inst: 'tenorsax', pan: 0, rev: 0.3, dly: 0.12, only: ['lot'], mml: join(['_v100'], up(L_TUNE, -1)) },
    lite: { inst: 'kick', drums: true, rev: 0.18, vol: 0.55, only: ['lot', 'disaster'], mml: join(rest(4), ['_v90'], sec(8, L_LITE, L_LITE), sec(8, L_LITE, L_LITE), sec(8, L_LITE, L_LITE), sec(8, L_LITE, FILL.toms)) },
  },
  arrangements: {
    main: {},
    blvd: {},
    coaster: {},
    warehouse: { inst: { hook: 'horn', twin: 'horn' }, mute: ['arp'], vol: { hook: 1.1, brass: 1.2, kit: 1.1, gtr: 1.1 }, rev: { hook: 0.3 } },
    lot: { solo: ['noir', 'bass', 'pad', 'lite', 'theremin'], inst: { pad: 'slowstrings' }, vol: { pad: 0.9, bass: 0.7, theremin: 0.5 }, rev: { noir: 0.38 }, level: 0.8 },
    disaster: { solo: ['tune', 'bass', 'pad', 'lite'], inst: { pad: 'warmpad' }, vol: { tune: 0.6, pad: 0.8, bass: 0.7 }, lowpass: 3000, level: 0.65 },
    havoc: { solo: ['tune', 'pad', 'bass', 'timp', 'choir'], inst: { tune: 'theremin', pad: 'slowstrings', choir: 'oohs' }, vol: { tune: 0.7, pad: 1.2, bass: 0.6, choir: 1.2 }, rev: { tune: 0.45 }, level: 0.75 },
    stunt: { inst: { hook: 'sawlead', twin: 'sawlead' }, vol: { hook: 0.85, gtr: 1.25, kit: 1.1 } },
    cutscene: { solo: ['tune', 'pad', 'bass'], inst: { tune: 'horn', pad: 'slowstrings' }, vol: { tune: 0.85, pad: 1.2, bass: 0.55 }, rev: { tune: 0.4 }, level: 0.75 },
    boss: { vol: { kit: 1.15, brass: 1.2, timp: 1.25, gtr: 1.1 } },
  },
};

// =====================================================================================================================
// ROYAL FLUSH

const C_IN: Bar[] = ['E', 'E', 'E', 'B7'];
const C_A: Bar[] = ['E', 'E', 'B7', 'E', 'E', 'A', 'B7', 'E'];
const C_A2: Bar[] = ['E', 'E', 'B7', 'E', 'C#m', 'F#7', 'B7', 'B7'];
const C_B: Bar[] = ['C#m', 'G#m', 'A', 'E', 'F#m', 'C#7', 'F#7', 'B7'];
const C_C: Bar[] = ['A', 'E/G#', 'F#m', 'D', 'A/C#', 'D', 'F#7', 'B7'];
const C_LOOP: Bar[] = [...C_A, ...C_A2, ...C_B, ...C_C];

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
const EM = scale('e', 'major'), BM = scale('b', 'major');
const CF_TWIN = harm(CF_A2, [EM, EM, EM, EM, EM, BM, EM, EM]);
const CS_B = ['o6 e4. d+8 e4 g+4', 'o6 d+2 o5 b2', 'o6 c+4. o5 b8 o6 c+4 e4', 'o5 b2 g+2', 'o6 c+4. o5 b8 a4 o6 c+4', 'o5 b4. a8 g+4 e+4', 'o5 f+4 a+4 o6 c+4 e4', 'o6 d+4 f+4 a4 f+4'];
const C_TRIO = ['o4 e2. a4', 'o4 g+2 b2', 'o5 c+2. o4 b4', 'o4 a1', 'o4 e2 a4 b4', 'o5 c+2 d2', 'o5 c+2 e2', 'o5 d+2 o4 b2'];
const C_HERALD = ['o5 e8. e16 e8. e16 b2', 'o5 e8. e16 e8. e16 o6 e2', 'o6 e4 g+4 b4 r4', 'o6 b2. r4'];
const CLICK = 'e8 ?e8 e8 ?e8 e8 ?e8 e8 ?e8';

export const SEQ_COASTER: Song = {
  title: 'Royal Flush',
  bpm: 184,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.7,
  delay: { beats: 0.5, feedback: 0.2, tone: 3200 },
  parts: {
    herald: { inst: 'trumpet', pan: -0.1, rev: 0.3, vol: 0.85, mml: join(['_v115'], C_HERALD, rest(32)) },
    lead: { inst: 'squarelead', pan: 0, rev: 0.18, dly: 0.1, vol: 0.85, mml: join(rest(4), ['_v108'], CF_A, CF_A2, rest(16)) },
    twin: { inst: 'sawlead', pan: 0.3, rev: 0.2, vol: 0.45, mml: join(rest(12), ['_v100'], CF_TWIN, rest(16)) },
    glead: { inst: 'distlead', pan: -0.15, rev: 0.25, dly: 0.12, vol: 0.5, mml: join(rest(20), ['_v105'], CS_B, ['_v110'], up(C_TRIO)) },
    strings: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.4, mml: join(['_v80'], pads(C_IN, 56), rest(16), ['_v90'], up(CS_B, -1), ['_v85'], pads(C_C, 57)) },
    brass: { inst: 'brass', pan: 0.2, rev: 0.28, vol: 0.5, mml: join(['_v100 q5'], pat(C_IN, 'r4 X4 r4 X4', 60), pat([...C_A, ...C_A2], 'r8 X8 r8 X8 r8 X8 r8 X8', 60), ['q8'], rest(8), ['_v115'], C_TRIO) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.45, mml: join(rest(28), ['_v100'], C_TRIO) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.45, mml: join(['_v100'], pat(C_IN, '!R4 r4 R4 r4', 40), pat([...C_A, ...C_A2], '!R8 R8 R8 R8 !R8 R8 R8 R8', 40), pat(C_B, '!R8 R8 r8 R8 !R8 R8 r8 R8', 40), pat(C_C, '!R4. R8 R2', 40)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v105'], pat(C_IN, 'B4 r4 B4 r4', 28), pat([...C_A, ...C_A2, ...C_B], OCT, 28), pat(C_C, "!B4. B8 B'4 B4", 28)) },
    arp: { inst: 'squarelead', pan: 0.4, rev: 0.2, dly: 0.12, vol: 0.18, mml: join(rest(20), ['q5 _v90'], pat(C_B, ARP, 64), rest(8)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.72, not: ['board'],
      mml: join(['_v90', '?s16 ?s16 ?s16 ?s16 s16 s16 s16 s16 ?s16 ?s16 ?s16 ?s16 s16 s16 s16 s16', '?s16 ?s16 s16 s16 s16 s16 s16 s16 s16 s16 s16 s16 !s16 !s16 !s16 !s16', FILL.roll, '_v110 {kx}4 r4 ' + 's16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 !{ks}8'],
        ['_v100'], sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.big), sec(8, KIT.drive, FILL.snare), sec(8, KIT.half, FILL.big)),
    },
    timp: { inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.55, mml: join(['_v90 o2 e4 r2.', 'o2 e4 r2.', troll('o2 b'), 'o2 _v115 b4 r2.'], ['o2 e4 r2.'], rest(6), [troll('o2 b')], ['o2 e4 r2.'], rest(6), [troll('o2 b')], ['o3 c+4 r2.'], rest(6), [troll('o2 b')], ['o2 a4 r2.'], rest(6), [troll('o2 b')]) },
    hits: { inst: 'orchstab', pan: 0, rev: 0.3, vol: 0.45, mml: join(rest(4), ['_v110 o4 e4 r2.'], rest(7), ['o4 e4 r2.'], rest(7), ['o4 e4 r2.'], rest(7), ['o4 a4 r2.'], rest(7)) },
    click: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.1, vol: 0.5, mml: join(['_v90'], [CLICK, CLICK, CLICK, 'r1'], rest(32)) },
    // (on the train, parked)
    ratchet: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.1, vol: 0.45, only: ['board'], mml: join(rest(4), ['_v85'], rep(CLICK, 32)) },
    trem: { inst: 'strings', pan: -0.1, rev: 0.3, vol: 0.4, only: ['board'], mml: join(rest(4), ['q8 _v80'], pat(C_LOOP, "B16 2'16", 40)) },
    horn: { inst: 'horn', pan: -0.3, rev: 0.35, vol: 0.5, only: ['board'], mml: join(rest(4), ['_v80'], pads(C_LOOP, 52)) },
  },
  arrangements: {
    main: {},
    ride: {},
    queue: { solo: ['lead', 'bass', 'kit', 'brass', 'click'], inst: { lead: 'organ' }, vol: { lead: 0.75, kit: 0.6, brass: 0.6 }, lowpass: 2400, level: 0.6 },
    board: { solo: ['trem', 'ratchet', 'click', 'timp', 'horn', 'bass', 'herald'], vol: { bass: 0.6 }, level: 0.75 },
    stop: { inst: { lead: 'trumpet' }, vol: { lead: 0.95, kit: 1.1, brass: 1.2, hits: 1.2, gtr: 1.1 } },
    launch: { vol: { kit: 1.15, choir: 1.4, hits: 1.3, brass: 1.15, timp: 1.2, gtr: 1.15 } },
  },
};

// =====================================================================================================================
// STOCK FOOTAGE

const D_IN: Bar[] = ['Gm', 'Gm', 'Eb', 'D7'];
const D_A: Bar[] = ['Gm', 'Eb', 'Cm', 'D7', 'Gm', 'Eb', 'Am7b5', 'D7'];
const D_B: Bar[] = ['Bb', 'F/A', 'Gm', 'Eb', 'Bb/F', 'Cm7', 'F7sus', 'F7'];
const D_C: Bar[] = ['Eb', 'D', 'Eb', 'D', 'Cm', 'D', 'Eb', 'D7b9'];
const D_LOOP: Bar[] = [...D_A, ...D_B, ...D_A, ...D_C];

const DL_A = ['o5 d4 g4 b-4. a8', 'o5 g4. e-8 r8 e-8 g4', 'o5 c4 e-4 g4. f8', 'o5 f+4. d8 r8 f+8 a4', 'o5 b-4 a8 g8 r8 g8 d4', 'o5 e-4 g4 b-4 o6 e-4', 'o6 c4 o5 a8 g8 r8 g8 e-4', 'o5 d4. f+8 r8 f+8 a4'];
const DL_B = ['o5 f4. b-8 b-2', 'o5 a4. o6 c8 c2', 'o5 b-4. a8 g4 d4', 'o5 e-4 g4 b-2', 'o5 f4. b-8 o6 d2', 'o6 e-4. d8 c4 o5 g4', 'o5 b-2 a4 g4', 'o5 a2 o6 c2'];
const DL_C = ['o5 b-1', 'o5 a1', 'o5 b-1', 'o5 a1', 'o5 g1', 'o5 f+1', 'o5 g2 a2', 'o5 a1'];
const D_LINE = [...DL_A, ...rest(8), ...DL_A, ...DL_C];
const DK = '{kh}16 ?h16 h16 ?h16 {sh}16 ?h16 h16 k16 ?h16 h16 {kh}16 ?h16 {sh}16 ?h16 o8';

export const SEQ_DISASTER_RIDE: Song = {
  title: 'Stock Footage',
  bpm: 144,
  loopFrom: 16,
  reverb: 'room',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.28, tone: 2800 },
  parts: {
    lead: { inst: 'flute', pan: 0.05, rev: 0.25, dly: 0.12, mml: join(rest(4), ['_v108'], D_LINE) },
    dbl: { inst: 'distlead', pan: -0.2, rev: 0.2, dly: 0.1, vol: 0.4, not: ['lobby', 'wrecked', 'blizzard'], mml: join(rest(4), ['_v100'], up(D_LINE, -1)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.7, mml: join(rest(12), ['_v105'], DL_B, rest(16)) },
    organ: { inst: 'organ', pan: -0.35, rev: 0.25, vol: 0.32, mml: join(['_v100'], pads(D_IN, 55), ['_v90'], pads(D_LOOP, 55)) },
    pad: { inst: 'strings', pan: 0.1, rev: 0.35, vol: 0.28, mml: join(['_v85'], pads(D_IN, 55), ['_v70'], pads(D_LOOP, 55)) },
    clav: { inst: 'clav', pan: 0.4, rev: 0.1, vol: 0.38, not: ['blizzard', 'wrecked'], mml: join(['q4'], rest(4), ['_v95'], pat(D_LOOP, '!X16 r16 X16 r16 r8 X16 r16 X8 r8 X16 X16 r8', 55)) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.4, not: ['lobby', 'wrecked', 'blizzard', 'preshow'], mml: join(['_v110'], pat(D_IN, '!R4 r2.', 40), ['_v100'], pat([...D_A, ...D_B, ...D_A], '!R8 R8 r8 R8 !R8 R8 r8 R8', 40), pat(D_C, '!R2. R4', 40)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v105'], pat(D_IN, 'B1', 28), pat(D_LOOP, "!B8. B16 r8 28 B8. B16 r8 B'8", 28)) },
    brass: {
      inst: 'brass', pan: 0.2, rev: 0.3, vol: 0.6,
      mml: join(['_v112'], pat(D_IN, '!X4 r2.', 60), rest(24), pat(D_C.slice(0, 6), '!X2. r4', 58), pat([['Eb', 'D']], '!X4 r4', 58), ['_v125 o4 {c d e- f+ a}1']),
    },
    timp: {
      inst: 'timpani', pan: 0.1, rev: 0.3, vol: 0.6,
      mml: join(['_v105 o2 g4 r2.', 'r1', 'o2 e-4 r2.', 'o2 d4 r4 d4 r4'], ['o2 g4 r2.'], rest(7), rest(8), ['o2 g4 r2.'], rest(7), pat(D_C.slice(0, 7), 'B4 r2.', 38), [troll('o2 d')]),
    },
    kit: {
      inst: 'kick', drums: true, rev: 0.12, vol: 0.7, not: ['lobby', 'wrecked'],
      mml: join(['r1', 'r1', 'r1', '_v90 ' + FILL.big], ['_v100'], sec(8, DK, FILL.toms), sec(8, DK, FILL.snare), sec(8, DK, FILL.toms), sec(8, KIT.half, FILL.roll)),
    },
    // (each disaster's own)
    rumble: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.3, vol: 0.4, only: ['quake', 'real'], mml: join(['_v70'], rep('[k16]16', 36)) },
    hot: { inst: 'congahi', drums: true, pan: 0.35, rev: 0.15, vol: 0.55, only: ['volcano', 'real'], mml: join(['_v95'], rep('c16 ?c16 d16 c16 b16 ?b16 d16 c16 c16 ?c16 d16 c16 b16 b16 d8', 36)) },
    sleigh: { inst: 'sleigh', drums: true, pan: 0.3, rev: 0.25, vol: 0.5, only: ['blizzard'], mml: join(['_v90'], rep('y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16', 36)) },
    harp: { inst: 'harp', pan: 0.35, rev: 0.4, vol: 0.45, only: ['flood', 'real'], mml: join(['_v85'], pat([...D_IN, ...D_LOOP], "016 116 216 0'16 216 116", 55)) },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.45, only: ['real'], mml: join(['_v95'], pads([...D_IN, ...D_LOOP], 55)) },
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.6, only: ['real'], mml: join(['_v105'], rep('f4 r8 f8 f4 f8 f8', 36)) },
    hits: { inst: 'orchstab', pan: 0, rev: 0.35, vol: 0.45, only: ['real'], mml: join(['_v110 o4 b-4 r2.'], rest(3), ['o4 b-4 r2.'], rest(7), ['o4 b-4 r2.'], rest(7), ['o4 b-4 r2.'], rest(7), ['o4 e-4 r2.'], rest(5), ['o4 e-4 r4 d4 r4', 'o4 d4 r2.']) },
  },
  arrangements: {
    main: {},
    theater: {},
    lobby: { solo: ['lead', 'bass', 'organ', 'pad'], inst: { lead: 'epiano' }, vol: { lead: 0.8, pad: 0.8, organ: 0.6 }, lowpass: 2600, level: 0.55 },
    preshow: { mute: ['brass', 'timp'], lowpass: 4000, level: 0.7 },
    quake: { vol: { timp: 1.4, bass: 1.15, gtr: 1.2 } },
    volcano: { inst: { lead: 'brass' }, vol: { lead: 0.8 } },
    tornado: { inst: { lead: 'theremin' }, vol: { lead: 0.8 }, rev: { lead: 0.4 } },
    blizzard: { inst: { lead: 'supersaw' }, vol: { lead: 0.7, kit: 0.6 } },
    flood: { vol: { pad: 1.4 } },
    wildfire: { inst: { lead: 'trumpet' }, vol: { lead: 0.9, brass: 1.3, gtr: 1.2 } },
    real: { inst: { lead: 'trumpet' }, vol: { lead: 0.95, kit: 1.2, brass: 1.35, timp: 1.3, rumble: 1.2, gtr: 1.2 } },
    wrecked: { solo: ['lead', 'bass', 'pad', 'organ'], inst: { pad: 'warmpad' }, vol: { pad: 1.2 }, lowpass: 1500, level: 0.5 },
  },
};

// =====================================================================================================================
// EVERY DISASTER AT ONCE

const H_IN: Bar[] = ['Bm', 'Bm', 'C', 'F#7'];
const H_A: Bar[] = ['Bm', 'Bm', 'G', 'G', 'Em', 'C', 'F#7sus', 'F#7'];
const H_B: Bar[] = ['D', 'A/C#', 'Bm', 'G', 'D/F#', 'Em7', 'C', 'F#7'];
const H_C: Bar[] = ['Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#7'];
const H_D: Bar[] = ['Bm', 'G', 'Bm', 'G', 'Em', 'F#7', 'Em', 'F#7'];
const H_LOOP: Bar[] = [...H_A, ...H_B, ...H_C, ...H_D];

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
const DMAJ = scale('d', 'major'), BH = scale('b', 'harmonic');
const HL_BTWIN = harm(HL_B, DMAJ);
const HL_DTWIN = harm(HL_D, [BH, BH, BH, BH, BH, BH, BH, BH]);
const HC_MOTIF = H_C.map((_, i) => (i < 7 ? tp(['o4 b8 o5 d8 f+8 d8 o4 b8 o5 d8 f+8 b8'], i)[0] : 'o5 f+8 e8 c+8 o4 a+8 f+8 e8 c+8 o3 a+8'));
const H_SIREN = '_g2 o4 b2 o5 b2';
const H_GUST = '_g4 o4 b4 o6 e4 o4 b2 _g0';
const HK_C = '{kh}8 k8 {sh}8 k8 {kh}8 k8 {sh}8 {sk}8';

export const SEQ_HAVOC: Song = {
  title: 'Every Disaster at Once',
  bpm: 172,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 2800 },
  parts: {
    lead: { inst: 'trumpet', pan: 0, rev: 0.22, dly: 0.08, mml: join(rest(4), ['_v110'], HL_A, rest(16), ['_v112'], HL_D) },
    horns: { inst: 'horn', pan: -0.3, rev: 0.35, vol: 0.6, mml: join(['_v95'], pads(H_IN, 52), up(HL_A, -1), ['_v100'], up(HL_BTWIN, -1), pads(H_C, 52), up(HL_DTWIN, -1)) },
    violins: { inst: 'strings', pan: 0.25, rev: 0.35, vol: 0.65, mml: join(rest(12), ['_v105'], HL_B, ['_v100'], HC_MOTIF, ['_v85'], HL_D) },
    glead: { inst: 'distlead', pan: 0.3, rev: 0.2, vol: 0.38, mml: join(rest(12), ['_v100'], up(HL_B, -1), up(HC_MOTIF, 0), rest(8)) },
    strings: { inst: 'strings', pan: -0.2, rev: 0.3, vol: 0.4, mml: join(['q6 _v75'], pat(H_IN, '016 116 216 116', 59), ['_v95'], pat(H_LOOP, '016 116 216 116', 59)) },
    brass: {
      inst: 'brass', pan: 0.15, rev: 0.3, vol: 0.55,
      mml: join(['_v105 _e30 _e127/1^1'], pads(['Bm', 'Bm'], 59), ['_e127'], pat(['C'], '!X2. r4', 60), pat(['F#7'], '!X4 r4 X4 r4', 58),
        ['q5'], pat(H_A, '!X4 r8 X8 r2', 59), ['q8 _v90'], pads(H_B, 57), ['_v100'], H_C.map(c => `_e60 _e127/1 ${pads([c], 57)[0]}`), ['_e127 q5 _v112'], pat(H_D, '!X4 r8 X8 r8 X8 r4', 59)),
    },
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.45, mml: join(['_v85'], pads(H_IN, 55), rest(8), ['_v90'], pads(H_B, 55), ['_v95'], pads(H_C, 55), ['_v100'], pads(H_D, 55)) },
    theremin: { inst: 'theremin', pan: 0.3, rev: 0.4, dly: 0.2, vol: 0.45, mml: join(['_v95'], rep(H_SIREN, 4), ['_g0'], rest(16), ['_g4 _v90'], H_C.map((_, i) => (i < 7 ? tp(['o5 b2 o6 d2'], i)[0] : 'o5 a+2 f+2')), rep(H_SIREN, 8), ['_g0']) },
    gtr: { inst: 'powerchord', pan: -0.4, rev: 0.1, vol: 0.45, mml: join(['_v100'], pat(H_IN, '!R2 R2', 40), pat([...H_A, ...H_B], '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40), ['@chug'], pat(H_C, '!R16 R16 R16 R16', 40), ['@'], pat(H_D, '!R8 R8 R8 R8 !R8 R8 R8 R8', 40)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.85, mml: join(['_v105'], pat(H_IN, 'B1', 28), pat(H_LOOP, OCT, 28)) },
    kit: {
      inst: 'kick', drums: true, rev: 0.15, vol: 0.72, not: ['fling'],
      mml: join(['_v80 ' + FILL.roll, FILL.roll, '_v110 {kx}4 r2.', FILL.big], ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.ride, FILL.snare), sec(8, HK_C, FILL.toms), ['_v110'], sec(8, KIT.drive, FILL.big)),
    },
    timp: {
      inst: 'timpani', pan: -0.1, rev: 0.3, vol: 0.55,
      mml: join(['_v100 o2 b4 r2.', troll('o2 b'), 'o2 c4 r2.', 'o2 f+4 r4 f+4 r4'], ['o2 b4 r2.'], rest(6), [troll('o2 f+')], ['o2 d4 r2.'], rest(6), [troll('o2 f+')], pat(H_C.slice(0, 7), 'B4 r2.', 41), [troll('o2 f+')], ['o2 b4 r2.'], rest(6), [troll('o2 f+')]),
    },
    hits: { inst: 'orchstab', pan: 0, rev: 0.35, vol: 0.42, mml: join(['r1', 'r1', '_v110 o4 c4 r2.', 'r1'], ['o4 d4 r2.'], rest(7), ['o4 d4 r2.'], rest(15), ['o4 d4 r4 d4 r4'], rest(4), ['o4 f+4 r2.'], rest(2)) },
    // (each stretch's own)
    taiko: { inst: 'taiko', drums: true, rev: 0.3, vol: 0.65, only: ['quake', 'chase', 'fling'], mml: join(rest(4), ['_v105'], rep('f4 r8 f8 f4 f8 f8', 32)) },
    harp: { inst: 'harp', pan: 0.4, rev: 0.4, vol: 0.45, only: ['flood', 'fling'], mml: join(rest(4), ['_v85'], pat(H_LOOP, "016 116 216 0'16", 55)) },
    sleigh: { inst: 'sleigh', drums: true, pan: 0.3, rev: 0.3, vol: 0.5, only: ['blizzard'], mml: join(rest(4), ['_v90'], rep('y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16', 32)) },
    gust: { inst: 'strings', pan: -0.4, rev: 0.45, vol: 0.4, only: ['wind', 'chase'], mml: join(rest(4), ['_v85'], ...Array.from({ length: 16 }, () => [H_GUST, 'r1'])) },
    drive: { inst: 'shaker', drums: true, pan: 0.25, rev: 0.12, vol: 0.5, only: ['chase'], mml: join(rest(4), ['_v90'], rep('z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16 z16 ?z16', 32)) },
  },
  arrangements: {
    main: {},
    street: {},
    wind: { vol: { theremin: 1.4, strings: 1.15 } },
    quake: { vol: { timp: 1.4, brass: 1.2, bass: 1.15, gtr: 1.15 } },
    flood: { vol: { violins: 1.2, choir: 1.25 } },
    blizzard: { vol: { kit: 0.6, choir: 1.1, gtr: 0.7 } },
    chase: { vol: { kit: 1.15, brass: 1.15, lead: 1.05, gtr: 1.15 } },
    fling: { vol: { choir: 1.35, brass: 1.2 }, level: 0.95 },
  },
};
