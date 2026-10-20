// FAIRY LAND's music: the land's theme (an arrangement per section) and TRUELLING TRAGONS. Its fights (the fairy
// wheel, the broomstick deathmatch, Piper) are in fantasyBosses.ts. The high-energy rework: the storybook waltz is gone
// to a soaring, heroic minor-key stage theme at Mega Man pace.
//
// ---- "ONCE UPON A LINE" (land:fantasy) ----
// The park's storybook land as a heroic fantasy stage: the old celesta mystery's hook (the line cliche down to the
// augmented chord, an A-sharp flicking into the B7, the flat-six seventh sliding onto the dominant) on a soaring saw
// lead, power chords and a pumping octave bass under it, a second lead in thirds when it turns to the relative major;
// a B that opens out into the princess-movie tune as a widescreen climb (the strings and the saw lead in unison over
// the horns walking down, the choir, the minor iv's sigh), and a C for the moving staircases (a distorted guitar over a
// square arpeggio turning like gears, the Neapolitan F's raised fourth, a double-kick drive).
// Written in E minor / G major, played in D-sharp minor / F-sharp major (every pitched part tr -1), 160, straight. 44
// bars: a 4-bar spell (once: a square lead sparkling down the chromatic line over the augmented chord, the strings
// swelling, the timpani rolling), then A (Em - Em/D# - C - B7 - Em - Am6 - C7 B7 - Em), A' (Em - Em/D# - Am - D7 - G -
// Cmaj7 - Am7 D7 - G D7), B (16: G - B7/F# - Em - G7/D - C - Cm6 - G/D - E7 - Am - F#m7b5 - G/D - E7 - Am7 - D7 -
// Cmaj7 Cm6 - B7), C (Em - C - Am - B7 - Em - C - F - B7).
// ARRANGEMENTS (by section: cues.ts fantasyArrs):
//   main / square  Hogsmeat Village: the whole band, a sleigh-bell shimmer
//   speaker        Piper on the town's PA: a fast lounge (the tune on alto sax, brushes, harp, bass), calmer
//   wheel          the fairy wheel's plaza: the tune on a rock organ, the accordion's afterbeats, a polka-punk kit
//   glen           the enchanted glen: woodwinds on the tune (flute, oboe, clarinet), harp, pizzicato, oohs; no drums
//   tragons        the ride's hall heard through the walls (the unload, a revisit): horns, trombones, the choir, muffled
//   keep           the castle's base: a processional at speed (trumpet, the brass, a snare tattoo over the kit)
//   runway         the broom port: the horns on the tune, the choir, the tattoo
//   broom          the landing high on the castle after the deathmatch: flute, oohs, harp, nothing else
//   bedroom        the hall outside her door: vibes over slow strings, harp, the bass, brushes
//   wrecked        her room after (a revisit): the tune on a harp, the strings, muffled
//   cutscene       under a scene: the tune on the strings, harp, a pad, the bass
//   boss           any fight without its own (everything, the tattoo and brass in)
//
// ---- "O FORTUNA, TIMES THREE" (seq:tragons) ----
// TRUELLING TRAGONS, the three-car coaster (fire, ice, lightning): a Carmina Burana that thinks it's a dragon, in 3/4,
// with a metal band strapped in. The choir chanting staccato on one breath over the cellos' pulse, then the orchestra
// and the guitars exploding on the dragon's theme (i - bVII - bVI - V), a hemiola chase (accents every two beats against
// the bar, three trains fighting for the track), the theme again. Every car its own color, and the lead follows the
// car he's on (the other two faint beside him): FIRE brass on the theme, trombone blasts, taiko; ICE flute on the theme,
// vibes sparkling in eighths; LIGHTNING a saw lead, a square arpeggiator, a pumping synth bass, a 909.
// B-flat minor, 180, 3/4. 48 bars: A (16: Bbm Bbm Bbm F - Bbm Bbm Gb F, twice: the chant), B (16: Bbm Ab Gb F - Bbm Ab
// Gb F - Ebm Bbm Gb F - Ebm Bbm Gb F: the explosion), C (8: Bbm Bbm Gb Gb Ebm Ebm F F: the hemiola chase), B' (8).
// ARRANGEMENTS (cues.ts tragonsArr): station (the chant through the wall), lift (the chant, the strings, a ratchet),
// fire / ice / bolt (by the car), main (the sound test: all three).

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, pat, pads, harm, scale, sec, troll, KIT, FILL } from './mmkit';

// =====================================================================================================================
// ONCE UPON A LINE (written in E minor / G major: every pitched part tr -1)

const SPELL: Bar[] = ['Em', 'Em/D#', 'C', 'B7'];
const FA: Bar[] = ['Em', 'Em/D#', 'C', 'B7', 'Em', 'Am6', ['C7', 'B7'], 'Em'];
const FA2: Bar[] = ['Em', 'Em/D#', 'Am', 'D7', 'G', 'Cmaj7', ['Am7', 'D7'], ['G', 'D7']];
const FB: Bar[] = ['G', 'B7/F#', 'Em', 'G7/D', 'C', 'Cm6', 'G/D', 'E7', 'Am', 'F#m7b5', 'G/D', 'E7', 'Am7', 'D7', ['Cmaj7', 'Cm6'], 'B7'];
const FC: Bar[] = ['Em', 'C', 'Am', 'B7', 'Em', 'C', 'F', 'B7'];
const F_LOOP: Bar[] = [...FA, ...FA2, ...FB, ...FC];

const SPELL_MEL = ['o6 e4. o5 b8 a+8 b8 o6 e4', 'o6 d+4. o5 b8 a+8 b8 o6 d+4', 'o6 c4. o5 g8 e8 g8 o6 c4', 'o5 b2 f+2'];
const HOOK = ['o5 e4. o4 b8 o5 e8 f+8 g4', 'o5 f+4. e8 d+8 e8 f+4', 'o5 g4 e8 o6 c8 r8 c4 o5 b8', 'o5 a+8 b8 f+8 d+8 r8 d+4.', 'o5 e4. o4 b8 o5 e8 f+8 g4', 'o5 f+4. a8 g8 f+8 e8 f+8', 'o5 g8 b-8 e8 f+8 a4 d+4', 'o5 e2. r4'];
const HOOK2 = ['o5 e4. o4 b8 o5 e8 f+8 g4', 'o5 f+4. e8 d+8 e8 f+4', 'o6 c4. o5 b8 a8 b8 o6 c4', 'o5 f+4 a8 o6 d8 r8 d4.', 'o5 b4. a8 g8 a8 b4', 'o5 e4. g8 b8 o6 e8 r8 e8', 'o6 d8 c8 o5 a8 o6 c8 o5 a8 f+8 d8 f+8', 'o5 g4. f+8 e8 d8 r8 d8'];
const EH = scale('e', 'harmonic'), GM = scale('g', 'major');
const HOOK2_TWIN = harm(HOOK2, [EH, EH, GM, GM, GM, GM, GM, GM]);
const MEL_B = [
  'o5 d2 g2', 'o5 f+2 d+4 e8 f+8', 'o5 g2 b2', 'o5 a4. g8 f2',
  'o5 e2 o6 c2', 'o6 c2 o5 a4 g8 e-8', 'o5 d2 g8 a8 b4', 'o5 b2 g+2',
  'o5 a2 o6 c2', 'o6 e2 d8 c8 o5 a4', 'o5 b2 g8 a8 b4', 'o6 d4. c8 o5 b2',
  'o5 a2 o6 e2', 'o6 d2 c8 o5 b8 a4', 'o6 e8 d8 c4 e-8 d8 c4', 'o5 b1',
];
const MEL_C = ['o4 b2 o5 e2', 'o5 g2 f+8 e8 d4', 'o5 e2 c2', 'o5 d+1', 'o4 b2 o5 e2', 'o5 g2 b2', 'o5 a2 o6 c8 o5 b8 a4', 'o5 f+2 d+2'];
const HORN_A2 = ['o4 b1', 'o4 b1', 'o4 a1', 'o4 a1', 'o4 g1', 'o4 g1', 'o4 e2 f+2', 'o4 g2 f+2'];
const HORN_B = ['o4 b1', 'o4 a1', 'o4 g1', 'o4 f1', 'o4 e1', 'o4 e-1', 'o4 d1', 'o4 d1', 'o4 c1', 'o4 c1', 'o3 b1', 'o3 g+2 b2', 'o4 c1', 'o4 c2 f+2', 'o4 e2 e-2', 'o4 d+1'];
const TAT = '{ks}8 ?s16 ?s16 s8 s8 {ks}8 ?s16 ?s16 s8 s8';
const BRUSH = '{ki}8 ?i8 {si}8 ?i8 {ki}8 ?i8 {si}8 ?i8';
const SLEIGH = 'y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16 y16 ?y16';
const TUNES = ['tuneA', 'leadB', 'tuneB', 'tuneC'];
const all = (inst: string) => Object.fromEntries(TUNES.map(k => [k, inst]));

export const LAND_FANTASY: Song = {
  title: 'Once Upon a Line',
  bpm: 160,
  loopFrom: 16,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.25, tone: 3200 },
  parts: {
    spark: { inst: 'squarelead', tr: -1, pan: 0.2, rev: 0.3, dly: 0.25, vol: 0.55, mml: join(['_v100'], SPELL_MEL, rest(40)) },
    tuneA: { inst: 'sawlead', tr: -1, pan: 0, rev: 0.25, dly: 0.12, vol: 0.85, mml: join(rest(4), ['_v108'], HOOK, HOOK2, rest(24)) },
    twinA: { inst: 'sawlead', tr: -1, pan: 0.35, rev: 0.25, vol: 0.42, mml: join(rest(12), ['_v100'], HOOK2_TWIN, rest(24)) },
    tuneB: { inst: 'strings', tr: -1, pan: 0.15, rev: 0.38, vol: 0.85, mml: join(rest(20), ['_v108'], MEL_B, rest(8)) },
    leadB: { inst: 'sawlead', tr: -1, pan: -0.1, rev: 0.25, dly: 0.12, vol: 0.55, mml: join(rest(20), ['_v104'], MEL_B, rest(8)) },
    tuneC: { inst: 'distlead', tr: -1, pan: -0.1, rev: 0.25, dly: 0.12, vol: 0.5, mml: join(rest(36), ['_v108'], MEL_C) },
    gears: { inst: 'squarelead', tr: -1, pan: 0.35, rev: 0.2, dly: 0.12, vol: 0.22, mml: join(rest(36), ['q5 _v92'], pat(FC, "016 116 216 0'16 216 116", 64)) },
    horns: { inst: 'horn', tr: -1, pan: -0.3, rev: 0.35, vol: 0.55, mml: join(rest(12), ['_v85'], HORN_A2, ['_v95'], HORN_B, rest(8)) },
    choir: { inst: 'choir', tr: -1, pan: 0, rev: 0.48, vol: 0.4, mml: join(['_v75'], pads(SPELL, 55), rest(16), ['_v85'], pads(FB, 55), ['_v80'], pads(FC, 55)) },
    pad: { inst: 'strings', tr: -1, pan: -0.15, rev: 0.4, vol: 0.32, mml: join(['_e40 _e127/1^1^1^1 _v90'], pads(SPELL, 55), ['_v62'], pads(FA, 55), pads(FA2, 55), ['_v55'], pads(FB, 52), ['_v68'], pads(FC, 55)) },
    harp: { inst: 'harp', tr: -1, pan: -0.35, rev: 0.4, vol: 0.4, mml: join(['_v85'], pat(SPELL, "B8 18 28 0'8 28 18 08 18", 52), ['_v75'], pat([...FA, ...FA2, ...FB], "B8 18 28 0'8 28 18 08 18", 52), rest(8)) },
    bass: { inst: 'bass', tr: -1, pan: 0, rev: 0.05, vol: 0.82, mml: join(['_v100'], pat(SPELL, 'B1', 28), pat([...FA, ...FA2], "B8 B'8 B8 B'8 B8 B'8 B8 B'8", 28), pat(FB, "!B8 B8 B'8 B8 !B8 B8 B'8 B8", 28), pat(FC, "!B8 B16 B16 B8 B16 B16 !B8 B16 B16 B'8 B8", 28)) },
    gtr: { inst: 'powerchord', tr: -1, pan: -0.4, rev: 0.1, vol: 0.45, mml: join(['_v105'], pat(SPELL.slice(0, 3), 'r1', 40), pat(['B7'], '!R4 r4 R8 R8 R8 R8', 40), ['_v100'], pat([...FA, ...FA2], '!R8 R8 R8 !R8 r8 R8 !R8 R8', 40), pat(FB, '!R2 R4. R8', 40), ['@chug _v108'], pat(FC, '!R16 R16 R16 R16 !R16 R16 R16 R16 !R16 R16 R16 R16 !R16 R16 R8', 40), ['@']) },
    kit: {
      inst: 'kick', drums: true, rev: 0.14, vol: 0.72,
      mml: join(['r1', 'r1', '_v80 ' + FILL.roll, FILL.big], ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.drive, FILL.snare), sec(8, KIT.rock, FILL.toms), sec(8, KIT.drive, FILL.big), ['_v108'], sec(8, KIT.dbl, FILL.big)),
    },
    timp: { inst: 'timpani', tr: -1, pan: -0.15, rev: 0.32, vol: 0.55, mml: join(['_v80 o2 e4 r2.', 'r1', troll('o2 c'), troll('o1 b')], ['_v100 o2 e4 r2.'], rest(6), [troll('o1 b')], ['o2 e4 r2.'], rest(6), [troll('o2 d')], ['o2 g4 r2.'], rest(14), [troll('o1 b')], ['o2 e4 r2.'], rest(6), [troll('o1 b')]) },
    snare: { inst: 'snare', drums: true, pan: 0.1, rev: 0.22, vol: 0.42, only: ['keep', 'runway', 'boss'], mml: join(['_v90'], rest(4), rep(TAT, 40)) },
    brass: { inst: 'brass', tr: -1, pan: 0.2, rev: 0.32, vol: 0.5, only: ['keep', 'runway', 'boss'], mml: join(['_v95'], rest(4), pat(FA, '!X8 r8 r4 r8 X8 X4', 58), pads(FA2, 58), pads(FB, 56), pat(FC, '!X8 r8 r8 X8 r2', 58)) },
    pah: { inst: 'accordion', tr: -1, pan: -0.25, rev: 0.22, vol: 0.45, only: ['wheel'], mml: join(['q4 _v90'], rest(4), pat(F_LOOP, 'r8 X8', 57)) },
    punk: { inst: 'kick', drums: true, rev: 0.12, vol: 0.7, only: ['wheel'], mml: join(['_v100'], rest(4), sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.snare), sec(16, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.big)) },
    brush: { inst: 'kicksoft', drums: true, kit: 'brush', pan: 0.1, rev: 0.22, vol: 0.55, only: ['speaker', 'bedroom'], mml: join(['_v85'], rest(4), rep(BRUSH, 40)) },
    perc: { inst: 'sleigh', drums: true, pan: 0.3, rev: 0.3, vol: 0.32, only: ['main', 'square'], mml: join(['_v85'], rest(4), rep(SLEIGH, 40)) },
  },
  arrangements: {
    main: {},
    square: {},
    speaker: { solo: ['tuneA', 'leadB', 'tuneC', 'harp', 'bass', 'pad', 'brush'], inst: { ...all('sax'), pad: 'slowstrings', bass: 'upright' }, vol: { pad: 1.2, harp: 1.2, bass: 0.75, leadB: 1.5, tuneC: 1.6 }, rev: { tuneA: 0.4, leadB: 0.4, tuneC: 0.4 }, level: 0.75 },
    wheel: { solo: ['tuneA', 'twinA', 'leadB', 'tuneC', 'pah', 'bass', 'gtr', 'punk', 'gears'], inst: { tuneA: 'organ', twinA: 'organ', leadB: 'organ', tuneC: 'organ' }, vol: { tuneA: 0.8, leadB: 1.2, tuneC: 1.4 }, level: 0.9 },
    glen: { solo: [...TUNES, 'horns', 'harp', 'bass', 'pad', 'choir'], inst: { tuneA: 'flute', leadB: 'oboe', tuneB: 'slowstrings', tuneC: 'clarinet', horns: 'clarinet', bass: 'upright', choir: 'oohs' }, vol: { leadB: 1.2, tuneB: 0.5, pad: 1.2, choir: 1.1, bass: 0.6, tuneC: 1.5 }, rev: { tuneA: 0.45, leadB: 0.45 }, level: 0.85 },
    tragons: { solo: [...TUNES, 'horns', 'choir', 'bass', 'timp', 'pad'], inst: { tuneA: 'horn', leadB: 'horn', tuneC: 'horn', horns: 'trombone' }, vol: { choir: 1.2, timp: 0.9, tuneC: 1.5 }, lowpass: 1800, level: 0.8 },
    keep: { mute: ['choir', 'perc', 'harp'], inst: { tuneA: 'trumpet', twinA: 'trumpet', leadB: 'trumpet', tuneC: 'trumpet' }, vol: { tuneA: 1.05, tuneC: 1.5 } },
    runway: { mute: ['perc', 'gears', 'harp'], inst: { tuneA: 'horn', twinA: 'horn', leadB: 'horn', tuneC: 'horn' }, vol: { tuneA: 1.1, choir: 1.3, snare: 1.15, tuneC: 1.5 } },
    broom: { solo: [...TUNES, 'harp', 'pad', 'choir'], inst: { tuneA: 'flute', leadB: 'flute', tuneB: 'oohs', tuneC: 'flute', pad: 'slowstrings', choir: 'oohs' }, vol: { tuneB: 0.6, pad: 1.2, tuneC: 1.5 }, rev: { tuneA: 0.5, leadB: 0.5, tuneC: 0.5 }, level: 0.7 },
    bedroom: { solo: ['tuneA', 'leadB', 'tuneC', 'harp', 'pad', 'bass', 'brush'], inst: { ...all('vibes'), pad: 'slowstrings', bass: 'upright' }, vol: { brush: 0.8, bass: 0.7, pad: 1.3, harp: 1.2, leadB: 1.5, tuneC: 1.6 }, rev: { tuneA: 0.4, leadB: 0.4, tuneC: 0.4 }, level: 0.7 },
    wrecked: { solo: ['tuneA', 'leadB', 'tuneC', 'pad'], inst: { ...all('harp'), pad: 'slowstrings' }, vol: { pad: 1.2, leadB: 1.5, tuneC: 1.6 }, rev: { tuneA: 0.5, leadB: 0.5, tuneC: 0.5 }, lowpass: 3000, level: 0.55 },
    cutscene: { solo: ['tuneA', 'tuneB', 'tuneC', 'harp', 'pad', 'bass'], inst: { tuneA: 'strings', tuneC: 'strings', tuneB: 'slowstrings', pad: 'slowstrings', bass: 'upright' }, vol: { bass: 0.6, pad: 1.2, tuneC: 1.6 }, rev: { tuneA: 0.45 }, level: 0.7 },
    boss: { vol: { kit: 1.15, gtr: 1.15, timp: 1.2 } },
  },
};

// =====================================================================================================================
// O FORTUNA, TIMES THREE (B-flat minor, 3/4)

const T_A = ['Bbm', 'Bbm', 'Bbm', 'F', 'Bbm', 'Bbm', 'Gb', 'F'];
const T_B = ['Bbm', 'Ab', 'Gb', 'F', 'Bbm', 'Ab', 'Gb', 'F', 'Ebm', 'Bbm', 'Gb', 'F', 'Ebm', 'Bbm', 'Gb', 'F'];
const T_C = ['Bbm', 'Bbm', 'Gb', 'Gb', 'Ebm', 'Ebm', 'F', 'F'];
const T_B2 = T_B.slice(0, 8);
const T_ALL = [...T_A, ...T_A, ...T_B, ...T_C, ...T_B2];
const rb = (n: number) => Array.from({ length: n }, () => 'r2.');
const p3 = (prog: string[], pattern: string, lo: number, xlo = lo) => pat(prog, pattern, lo, xlo, 3);

const CHANT = ['o4 f4 f4 f4', 'o4 g-4 f4 e-4', 'o4 f4 f4 f4', 'o4 e2 r4', 'o4 f4 f4 f4', 'o4 g-4 a-4 g-4', 'o4 f4 e-4 d-4', 'o4 c2 r4'];
const THEME = [
  'o5 f2 b-4', 'o5 a-2 e-4', 'o5 g-2 d-4', 'o5 e2 c4',
  'o5 d-4 f4 b-4', 'o6 c2 o5 a-4', 'o5 b-2 g-4', 'o5 a2.',
  'o5 g-2 b-4', 'o5 f2 d-4', 'o5 e-2 d-4', 'o5 c2.',
  'o5 g-4 b-4 o6 e-4', 'o6 d-2 c4', 'o5 b-2 a-4', 'o5 a2 r4',
];
const CHASE = ['o5 !b-4 f4 !a-4', 'o5 f4 !g-4 f4', 'o5 !b-4 g-4 !a-4', 'o5 g-4 !f4 g-4', 'o5 !g-4 e-4 !f4', 'o5 e-4 !d-4 e-4', 'o5 !c4 o4 a4 !b-4', 'o4 a4 !g4 a4'];
const HEM = '!X4 r4 X4 r4 !X4 r4';
const LEAD = join(rb(8), ['_v90 q5'], p3(T_A, "08 18 28 18 08 18", 70), ['q7 _v108'], THEME, ['_v112'], CHASE, THEME.slice(0, 8));
const K3 = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8';
const K3_FILL = '{kh}8 h8 s16 s16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 !{ks}8';

export const SEQ_TRAGONS: Song = {
  title: 'O Fortuna, Times Three',
  bpm: 180,
  reverb: 'hall',
  reverbMix: 0.8,
  delay: { beats: 1, feedback: 0.22, tone: 2800 },
  parts: {
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.55, mml: join(['q3 _v82'], CHANT, ['_v94'], CHANT, ['q7 _v102'], up(THEME, -1), ['_v106'], p3(T_C, HEM, 58), ['_v110'], up(THEME.slice(0, 8), -1)) },
    strings: { inst: 'strings', pan: 0.2, rev: 0.32, vol: 0.4, mml: join(['q5 _v72'], p3([...T_A, ...T_A], '18 08 18 08 28 18', 61), ['q8 _v85'], pads(T_B, 58, 3), ['q5 _v95'], p3([...T_C, ...T_B2], '18 08 18 08 28 18', 61)) },
    low: { inst: 'cello', pan: -0.15, rev: 0.2, vol: 0.62, mml: join(['q6 _v95'], p3([...T_A, ...T_A], 'B4 B4 24', 38), ['_v110'], p3([...T_B, ...T_C, ...T_B2], 'B4 B4 24', 38)) },
    timp: { inst: 'timpani', pan: -0.1, rev: 0.35, vol: 0.55, mml: join(['_v78'], T_A.map((c, i) => (i % 2 ? 'r2.' : p3([c], 'B4 r2', 38)[0])), T_A.slice(0, 7).map((c, i) => (i % 2 ? 'r2.' : p3([c], 'B4 r2', 38)[0])), ['o2 _v50 [f32]8 _v75 [f32]8 _v105 [f32]8'], ['_v110'], p3(T_B.slice(0, 15), 'B4 r2', 38), ['o2 _v50 [f32]8 _v75 [f32]8 _v105 [f32]8'], ['_v105'], p3(T_C, '!B4 r4 B4 r4 !B4 r4', 38), ['_v110'], p3(T_B2.slice(0, 7), 'B4 r2', 38), ['o2 _v50 [f32]8 _v75 [f32]8 _v105 [f32]8']) },
    perc: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0, rev: 0.3, vol: 0.5, mml: join(['_v72'], Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 'k4 r2' : 'r2.')), ['_v110'], T_B.map((_, i) => (i === 0 ? '{k(gong)}4 r4 k4' : 'k4 r4 k4')), ['_v105'], T_C.map((_, i) => (i % 2 === 0 ? 'k4 r4 k4' : 'r4 k4 r4')), ['_v110'], T_B2.map((_, i) => (i === 0 ? '{kx}4 r4 k4' : 'k4 r4 k4'))) },
    gtr: { inst: 'chug', pan: -0.45, rev: 0.08, vol: 0.45, mml: join(rb(16), ['_v110'], p3(T_B, '!R8 R16 R16 R8 R16 R16 !R8 R8', 40), ['@powerchord'], p3(T_C, '!R4 r4 R4 r4 !R4 r4', 40), ['@ _v110'], p3(T_B2, '!R8 R16 R16 R8 R16 R16 !R8 R8', 40)) },
    bass: { inst: 'bass', pan: 0, rev: 0.05, vol: 0.78, mml: join(rb(16), ['_v105'], p3([...T_B, ...T_C, ...T_B2], "B8 B'8 B8 B'8 B8 B'8", 28)) },
    kit: { inst: 'kick', drums: true, rev: 0.15, vol: 0.68, mml: join(rb(14), [FILL.roll.split(' ').slice(0, 12).join(' '), '!s16 s16 !s16 s16 !s16 s16 !s16 s16 !s16 s16 !s16 !s16'], ['_v105'], [K3.replace('{kh}', '{kx}'), ...rep(K3, 14), K3_FILL], T_C.map((_, i) => (i % 2 === 0 ? '{kx}4 r4 {ks}4' : 'r4 {ks}4 r4')), [K3.replace('{kh}', '{kx}'), ...rep(K3, 6), K3_FILL]) },
    fireLead: { inst: 'brass', pan: -0.2, rev: 0.28, vol: 0.85, mml: LEAD },
    iceLead: { inst: 'flute', pan: 0.25, rev: 0.38, vol: 0.85, mml: LEAD },
    boltLead: { inst: 'sawlead', pan: 0.1, rev: 0.22, dly: 0.12, vol: 0.7, mml: LEAD },
    fireLow: { inst: 'trombone', pan: -0.3, rev: 0.25, vol: 0.5, only: ['fire', 'main'], mml: join(rb(16), ['_v105'], p3(T_B, 'X4 r2', 46), ['_v110'], p3(T_C, HEM, 46), p3(T_B2, 'X4 r2', 46)) },
    fireTaiko: { inst: 'taiko', drums: true, pan: -0.2, rev: 0.3, vol: 0.55, only: ['fire', 'main'], mml: join(['_v75'], rep('f4 r2', 16), ['_v105'], rep('f4 f8 f8 f4', 16), T_C.map((_, i) => (i % 2 === 0 ? 'f4 r4 f4' : 'r4 f4 r4')), rep('f4 f8 f8 f4', 8)) },
    iceBed: { inst: 'vibes', pan: 0.35, rev: 0.42, dly: 0.15, vol: 0.4, only: ['ice'], mml: join(['_v72'], p3(T_ALL, "0'8 1'8 2'8 0''8 2'8 1'8", 58)) },
    boltBed: { inst: 'squarelead', pan: 0.3, rev: 0.2, dly: 0.2, vol: 0.28, only: ['bolt'], mml: join(['q4 _v82'], p3(T_ALL, "08 18 28 0'8 28 18", 58)) },
    boltBass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.5, only: ['bolt'], mml: join(['q5 _v95'], p3(T_ALL, "B8 B8 B'8 B8 B8 B'8", 28)) },
    boltKit: { inst: '909kick', drums: true, kit: '909', pan: 0, rev: 0.12, vol: 0.45, only: ['bolt'], mml: join(['_v95'], rep('{kh}8 h8 {ph}8 h8 {kh}8 ?h8', 48)) },
    ratchet: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.25, vol: 0.4, only: ['lift'], mml: join(['_v90'], rep('!e8 ?e8 e8 ?e8 e8 ?e8', 48)) },
  },
  arrangements: {
    main: { vol: { iceLead: 0.45, boltLead: 0.4 } },
    station: { solo: ['choir', 'low', 'timp'], vol: { choir: 0.75 }, lowpass: 900, level: 0.65 },
    lift: { solo: ['choir', 'strings', 'low', 'timp', 'perc', 'ratchet'], vol: { strings: 0.6, perc: 0.6 }, level: 0.85 },
    fire: { vol: { iceLead: 0.18, boltLead: 0.14 } },
    ice: { vol: { fireLead: 0.15, boltLead: 0.14 } },
    bolt: { vol: { fireLead: 0.15, iceLead: 0.18 } },
  },
};
