// FAIRY LAND's music: the land's theme (an arrangement per section) and TRUELLING TRAGONS. Its fights (the fairy
// wheel, the broomstick deathmatch, Piper) are in fantasyBosses.ts.
//
// ---- "ONCE UPON A LINE" (land:fantasy) ----
// The park's storybook land: the wizard-school village's celesta mystery (the snow on the crooked roofs, the owl post,
// the moving staircases) opening out into a princess-movie main title (the strings sweeping, the oohs swelling, the
// harp never stopping). A lilting 6/8.
// Written in E minor / G major, played in D-sharp minor / F-sharp major (every pitched part tr -1), 114 (the dotted
// quarter at 76). 44 bars of 6/8: a 4-bar spell (once: the celesta's sparkle down a chromatic line over the augmented
// chord, the harp, a triangle), then the 40-bar loop:
//   A  (8)  Em - Em/D# - C - B7 - Em - Am6 - C7 B7 - Em: the hook on the celesta, the line cliche under it, the
//           A-sharp twinkling into the B7, the flat-six seventh sliding onto the dominant.
//   A' (8)  Em - Em/D# - Am - D7 - G - Cmaj7 - Am7 D7 - G D7: the hook turned for the relative major, the flute and
//           the glockenspiel with it, the horns under.
//   B  (16) G - B7/F# - Em - G7/D - C - Cm6 - G/D - E7 - Am - F#m7b5 - G/D - E7 - Am7 - D7 - Cmaj7 Cm6 - B7: the
//           princess movie, the tune on the violins, the horns walking down under it, the oohs, the minor iv's sigh.
//   C  (8)  Em - C - Am - B7 - Em - C - F - B7: the staircases, a clarinet over the celesta turning like gears, the
//           Neapolitan F's raised fourth for the magic.
// ARRANGEMENTS (by section: cues.ts fantasyArrs; the crossfade does the rest):
//   main / square  Hogsmeat Village: the whole storybook orchestra, sleigh bells and a triangle
//   speaker        Piper on the town's PA (the loudspeaker's scene): a lounge in 6/8, the tune on alto sax, brushes
//   wheel          the fairy wheel's plaza: a fairground band organ (calliope, an accordion's oom-pah-pah, a tuba)
//   glen           the enchanted glen: a woodland storybook (flute, oboe, clarinet, harp, pizzicato, soft oohs)
//   tragons        the ride's hall heard through the walls (the unload and a revisit): horns, trombones, the choir
//   keep           the castle's base: a processional (trumpet, harpsichord, the brass, the snare's 6/8 tattoo)
//   runway         the broom port: the horns on the tune, the choir, the tattoo, the wind up
//   broom          the landing high on the castle after the deathmatch: flute, oohs, harp, nothing else
//   bedroom        the hall outside her door: a boudoir (vibes, slow strings, harp, brushes)
//   wrecked        her room after (a revisit): the tune on a music box, muffled
//   cutscene       under a scene: celesta, slow strings, harp, the upright
//   boss           any fight without its own (the whole thing and the tattoo)
//
// ---- "O FORTUNA, TIMES THREE" (seq:tragons) ----
// TRUELLING TRAGONS, the three-car coaster (fire, ice, lightning): a Carmina Burana that thinks it's a dragon. The choir
// chanting staccato on one breath over a pulsing bass in 3, then the whole orchestra exploding on the dragon's theme;
// a hemiola chase (the accents fighting the bar like three trains fighting for the track); the theme again. Every car
// is its own color, and the lead follows the car he's on (the other two still out there, faint, beside him):
//   FIRE       brass on the theme, trombone blasts, taiko
//   ICE        flute on the theme, the celesta's sparkle running in eighths
//   LIGHTNING  a saw lead on the theme, a square arpeggiator, a pumping synth bass, a 909
// B-flat minor, 174, 3/4. 48 bars (no intro: it's on from the station):
//   A  (16) Bbm Bbm Bbm F - Bbm Bbm Gb F (twice): the chant; the car's arpeggios join the second time.
//   B  (16) Bbm Ab Gb F - Bbm Ab Gb F - Ebm Bbm Gb F - Ebm Bbm Gb F: the explosion, the theme on the choir and the car.
//   C  (8)  Bbm Bbm Gb Gb Ebm Ebm F F: the hemiola chase.
//   B' (8)  the theme's first half again, everything.
// ARRANGEMENTS (cues.ts tragonsArr): station (in the load hall: the chant through the wall), lift (out of the station
// and up the lift hill: the chant, the strings, a ratchet), fire / ice / bolt (by the car he's on, or hopping to);
// main (the sound test: all three). The unload and after: the land's 'tragons'.

import type { Song } from '../engine';
import { join, rep, nt, chord, hi } from './jungle';

/** Rests: n bars of 6/8 (or of 3/4: the same three beats). */
const rb = (n: number) => Array.from({ length: n }, () => 'r2.');
/** Everything n octaves up (each bar's o-numbers raised). */
const up = (bars: string[], n = 1) => bars.map(b => b.replace(/o(\d)/g, (_, k) => `o${Number(k) + n}`));
/** An octave-note moved to octave o ('2e' at 3: '3e'). */
const at = (n: string, o: number) => `${o}${n.slice(1)}`;
/** An octave-note an octave down. */
const lo = (n: string) => `${Number(n[0]) - 1}${n.slice(1)}`;

// =====================================================================================================================
// ONCE UPON A LINE (written in E minor / G major: every pitched part tr -1)

type B = string | [string, string];
/** A 6/8 bar per chord, or two chords a bar (three eighths each): `f(chord, eighths)`. */
const per = (prog: B[], f: (c: string, e: 6 | 3) => string) => prog.map(b => (typeof b === 'string' ? f(b, 6) : `${f(b[0], 3)} ${f(b[1], 3)}`));
const len = (e: 6 | 3) => (e === 6 ? '2.' : '4.');

const FV: Record<string, string[]> = {
  Em: ['4e', '4g', '4b'], 'Em/D#': ['4d+', '4g', '4b'], C: ['4c', '4e', '4g'], B7: ['3b', '4d+', '4f+', '4a'], Am6: ['4c', '4e', '4f+', '4a'],
  C7: ['4c', '4e', '4g', '4b-'], Am: ['4c', '4e', '4a'], D7: ['4c', '4d', '4f+', '4a'], G: ['4d', '4g', '4b'], Cmaj7: ['4c', '4e', '4g', '4b'],
  Am7: ['4c', '4e', '4g', '4a'], 'B7/F#': ['3b', '4d+', '4f+', '4a'], 'G7/D': ['4d', '4f', '4g', '4b'], Cm6: ['4c', '4e-', '4g', '4a'],
  'G/D': ['4d', '4g', '4b'], E7: ['4d', '4e', '4g+', '4b'], 'F#m7b5': ['4c', '4e', '4f+', '4a'], F: ['4c', '4f', '4a'],
};
/** The bass: the note under the chord, and the one it bounces to. */
const FR: Record<string, [string, string]> = {
  Em: ['2e', '2b'], 'Em/D#': ['2d+', '2b'], C: ['2c', '2g'], B7: ['2b', '2f+'], Am6: ['2a', '2e'], C7: ['2c', '2g'], Am: ['2a', '2e'],
  D7: ['2d', '2a'], G: ['2g', '2d'], Cmaj7: ['2c', '2g'], Am7: ['2a', '2e'], 'B7/F#': ['2f+', '2b'], 'G7/D': ['2d', '2g'], Cm6: ['2c', '2g'],
  'G/D': ['2d', '2g'], E7: ['2e', '2b'], 'F#m7b5': ['2f+', '2c'], F: ['2f', '2c'],
};
const SPELL: B[] = ['Em', 'Em/D#', 'C', 'B7'];
const FA: B[] = ['Em', 'Em/D#', 'C', 'B7', 'Em', 'Am6', ['C7', 'B7'], 'Em'];
const FA2: B[] = ['Em', 'Em/D#', 'Am', 'D7', 'G', 'Cmaj7', ['Am7', 'D7'], ['G', 'D7']];
const FB: B[] = ['G', 'B7/F#', 'Em', 'G7/D', 'C', 'Cm6', 'G/D', 'E7', 'Am', 'F#m7b5', 'G/D', 'E7', 'Am7', 'D7', ['Cmaj7', 'Cm6'], 'B7'];
const FC: B[] = ['Em', 'C', 'Am', 'B7', 'Em', 'C', 'F', 'B7'];

// ---- The tunes ----
/** The spell: the celesta sparkling down a chromatic line. */
const SPELL_MEL = ['o6 e4. o5 b8 a+8 b8', 'o6 d+4. o5 b8 a+8 b8', 'o6 c4. o5 g8 e8 c8', 'o5 b4. f+4.'];
/** The hook (A). */
const HOOK = [
  'o5 e4. o4 b8 o5 e8 g8',
  'o5 f+4. e8 d+8 e8',
  'o5 g4 e8 o6 c4 o5 b8',
  'o5 a+8 b8 f+8 d+4.',
  'o5 e4. o4 b8 o5 e8 g8',
  'o5 f+4. a8 g8 f+8',
  'o5 g8 b-8 e8 f+8 a8 d+8',
  'o5 e2.',
];
/** The hook turned for the major (A'). */
const HOOK2 = [
  'o5 e4. o4 b8 o5 e8 g8',
  'o5 f+4. e8 d+8 e8',
  'o6 c4. o5 b8 a8 g8',
  'o5 f+4 a8 o6 d4.',
  'o5 b4. a8 g8 d8',
  'o5 e4. g8 b8 o6 e8',
  'o6 d8 c8 o5 a8 o6 c8 o5 a8 f+8',
  'o5 g4. f+8 e8 d8',
];
/** The princess movie (B), on the violins. */
const MEL_B = [
  'o5 d4. g4.', 'o5 f+4. d+8 e8 f+8', 'o5 g4. b4.', 'o5 a4 g8 f4.',
  'o5 e4. o6 c4.', 'o6 c4. o5 a8 g8 e-8', 'o5 d4. g8 a8 b8', 'o5 b4. g+4.',
  'o5 a4. o6 c4.', 'o6 e4. d8 c8 o5 a8', 'o5 b4. g8 a8 b8', 'o6 d4 c8 o5 b4.',
  'o5 a4. o6 e4.', 'o6 d4. c8 o5 b8 a8', 'o6 e8 d8 c8 e-8 d8 c8', 'o5 b2.',
];
/** The staircases (C), on the clarinet. */
const MEL_C = ['o4 b4. o5 e4.', 'o5 g4. f+8 e8 d8', 'o5 e4. c4.', 'o5 d+2.', 'o4 b4. o5 e4.', 'o5 g4. b4.', 'o5 a4. o6 c8 o5 b8 a8', 'o5 f+4. d+4.'];
/** The horns: under A' and walking down under B. */
const HORN_A2 = ['o4 b2.', 'o4 b2.', 'o4 a2.', 'o4 a2.', 'o4 g2.', 'o4 g2.', 'o4 e4. f+4.', 'o4 g4. f+4.'];
const HORN_B = [
  'o4 b2.', 'o4 a2.', 'o4 g2.', 'o4 f2.', 'o4 e2.', 'o4 e-2.', 'o4 d2.', 'o4 d2.',
  'o4 c2.', 'o4 c2.', 'o3 b2.', 'o3 g+4. b4.', 'o4 c2.', 'o4 c4. f+4.', 'o4 e4. e-4.', 'o4 d+2.',
];

// ---- The accompaniments ----
const fPads = (prog: B[]) => per(prog, (c, e) => chord(FV[c], len(e)));
/** The harp: the bass note, up the chord, the top, and back. */
const fHarp = (prog: B[]) => per(prog, (c, e) => { const v = FV[c]; return [at(FR[c][0], 3), v[1], v[2], hi(v[0]), v[2], v[1]].slice(0, e).map(n => nt(n, '8')).join(' '); });
/** The celesta turning like the staircases' gears (C), an octave up. */
const fGears = (prog: B[]) => per(prog, (c, e) => { const v = FV[c].map(hi); return [v[0], v[1], v[2], hi(v[0]), v[2], v[1]].slice(0, e).map(n => nt(n, '8')).join(' '); });
/** The bass bouncing (A, C): the root, the other. */
const fBounce = (prog: B[]) => per(prog, (c, e) => (e === 6 ? `${nt(FR[c][0], '4')} r8 ${nt(FR[c][1], '4')} r8` : `${nt(FR[c][0], '4')} r8`));
/** The bass flowing (B). */
const fFlow = (prog: B[]) => per(prog, (c, e) => (e === 6 ? `${nt(FR[c][0], '4.')} ${nt(FR[c][1], '4.')}` : nt(FR[c][0], '4.')));
/** Oom-pah-pah in 6/8 (the wheel's accordion; the keep's harpsichord). */
const fPah = (prog: B[]) => per(prog, (c, e) => { const x = chord(FV[c], '8'); return e === 6 ? `r8 ${x} ${x} r8 ${x} ${x}` : `r8 ${x} ${x}`; });
/** The brass on the downbeat (A in the castle). */
const fStab = (prog: B[]) => per(prog, (c, e) => (e === 6 ? `${chord(FV[c], '8')} r4 r4.` : `${chord(FV[c], '8')} r4`));

/** A timpani roll over a 6/8 bar. */
const roll68 = (n: string) => `o2 _v45 [${n}32]8 _v70 [${n}32]8 _v100 [${n}32]8`;
/** A section's timpani: the downbeat, then a roll into the next. */
const timpSec = (bars: number, first: string, into: string) => [`_v100 o2 ${first}4. r4.`, ...rb(bars - 2), roll68(into)];

// ---- The percussion (6/8) ----
const sleigh = (n: number) => Array.from({ length: n }, (_, i) => (i % 4 === 0 ? '!{y(triangle)}8 ?y8 ?y8 y8 ?y8 ?y8' : '!y8 ?y8 ?y8 y8 ?y8 ?y8'));
const TRI2 = ['(triangle)4. r4.', 'r2.'];
const TAT = '{ks}8 ?s16 ?s16 s8 {ks}8 ?s16 ?s16 s8';
const TAT_IN = TAT.replace('{ks}', '{kx}');
const TAT_FILL = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
const tat = (bars: number) => [TAT_IN, ...rep(TAT, bars - 2), TAT_FILL];
const OOM = 'k8 r4 (trimute)8 r4';
const BRUSH = '{ki}8 ?i8 ?i8 {si}8 ?i8 ?i8';

export const LAND_FANTASY: Song = {
  title: 'Once Upon a Line',
  bpm: 114,
  loopFrom: 12,
  reverb: 'hall',
  reverbMix: 0.9,
  delay: { beats: 1.5, feedback: 0.25, tone: 3200 },
  parts: {
    tuneA: { inst: 'celesta', tr: -1, pan: 0.05, rev: 0.35, dly: 0.12, mml: join(['_v95'], SPELL_MEL, ['_v105'], HOOK, HOOK2, rb(16), rb(8)) },
    flute: { inst: 'flute', tr: -1, pan: 0.2, rev: 0.35, vol: 0.6, mml: join(rb(12), ['_v85'], HOOK2, rb(24)) },
    glock: { inst: 'glock', tr: -1, pan: 0.3, rev: 0.4, vol: 0.45, mml: join(rb(12), ['_v75'], up(HOOK2), rb(24)) },
    tuneB: { inst: 'strings', tr: -1, pan: 0.15, rev: 0.4, mml: join(rb(20), ['_v100'], MEL_B, rb(8)) },
    tuneC: { inst: 'clarinet', tr: -1, pan: -0.1, rev: 0.3, mml: join(rb(36), ['_v100'], MEL_C) },
    horns: { inst: 'horn', tr: -1, pan: -0.3, rev: 0.35, vol: 0.6, mml: join(rb(12), ['_v80'], HORN_A2, ['_v90'], HORN_B, rb(8)) },
    choir: { inst: 'oohs', tr: -1, pan: 0, rev: 0.5, vol: 0.45, mml: join(rb(20), ['_v70'], fPads(FB), rb(8)) },
    pad: { inst: 'strings', tr: -1, pan: -0.1, rev: 0.4, vol: 0.4, mml: join(['_v65'], fPads(SPELL), ['_v55'], fPads(FA), fPads(FA2), ['_v62'], fPads(FB), ['_v50'], fPads(FC)) },
    harp: { inst: 'harp', tr: -1, pan: -0.35, rev: 0.4, vol: 0.6, mml: join(['_v80'], fHarp(SPELL), ['_v75'], fHarp(FA), fHarp(FA2), ['_v70'], fHarp(FB), rb(8)) },
    gears: { inst: 'celesta', tr: -1, pan: 0.3, rev: 0.35, vol: 0.55, mml: join(rb(36), ['_v75'], fGears(FC)) },
    bass: { inst: 'upright', tr: -1, pan: 0, rev: 0.12, vol: 0.8, mml: join(['_v95'], ['r2.', 'r2.', 'r2.', `${nt('2b', '4.')} ${nt('2f+', '4.')}`], fBounce(FA), fBounce(FA2), fFlow(FB), fBounce(FC)) },
    perc: { inst: 'triangle', drums: true, pan: 0.25, rev: 0.3, vol: 0.45, not: ['keep', 'runway'], mml: join(['_v80'], ['r2.', 'r2.', 'r2.', '(triangle)4. r4.'], sleigh(32), [...TRI2, ...TRI2, ...TRI2, ...TRI2]) },
    timpani: {
      inst: 'timpani', tr: -1, pan: -0.15, rev: 0.35, vol: 0.55,
      mml: join(['r2.', 'r2.', 'r2.', roll68('b')], timpSec(8, 'e', 'b'), timpSec(8, 'e', 'd'), timpSec(16, 'g', 'b'), timpSec(8, 'e', 'b')),
    },
    snare: { inst: 'snare', drums: true, pan: 0.1, rev: 0.25, vol: 0.5, only: ['keep', 'runway', 'boss'], mml: join(['_v60'], ['r2.', 'r2.', 'r2.', TAT_FILL], ['_v90'], tat(8), tat(8), tat(16), tat(8)) },
    brass: {
      inst: 'brass', tr: -1, pan: 0.2, rev: 0.35, vol: 0.5, only: ['keep', 'runway', 'boss'],
      mml: join(['_v80'], ['r2.', 'r2.', 'r2.', `_e40 _e127/2. ${chord(FV.B7, '2.')}`], ['_v90'], fStab(FA), ['_v80'], fPads(FA2), ['_v85'], fPads(FB), rb(8)),
    },
    pah: { inst: 'accordion', tr: -1, pan: -0.25, rev: 0.25, vol: 0.5, only: ['wheel', 'keep', 'runway'], mml: join(['_v75'], rb(4), fPah(FA), fPah(FA2), fPah(FB), fPah(FC)) },
    oompah: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0, rev: 0.2, vol: 0.55, only: ['wheel'], mml: join(['_v85'], rb(4), rep(OOM, 40)) },
    brush: { inst: 'kicksoft', drums: true, kit: 'brush', pan: 0.1, rev: 0.25, vol: 0.5, only: ['speaker', 'bedroom'], mml: join(['_v75'], rb(4), rep(BRUSH, 40)) },
  },
  arrangements: {
    main: {},
    square: {},
    speaker: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'harp', 'bass', 'pad', 'brush'],
      inst: { tuneA: 'sax', tuneB: 'sax', tuneC: 'sax', pad: 'slowstrings' },
      vol: { pad: 0.7, harp: 0.75, bass: 0.7, tuneA: 0.85, tuneB: 0.8, tuneC: 0.85 },
      rev: { tuneA: 0.4, tuneB: 0.4, tuneC: 0.4 },
      level: 0.8,
    },
    wheel: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'glock', 'pah', 'bass', 'oompah', 'timpani'],
      inst: { tuneA: 'calliope', tuneB: 'calliope', bass: 'tuba' },
      vol: { glock: 0.7, pah: 0.8, timpani: 0.5 },
      level: 0.9,
    },
    glen: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'horns', 'harp', 'bass', 'pad', 'choir', 'gears'],
      inst: { tuneA: 'flute', tuneB: 'oboe', horns: 'clarinet', bass: 'pizz' },
      vol: { pad: 0.6, choir: 0.7, horns: 0.85, bass: 0.7 },
      rev: { tuneA: 0.45, tuneB: 0.45 },
      level: 0.9,
    },
    tragons: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'horns', 'choir', 'bass', 'timpani', 'pad'],
      inst: { tuneA: 'horn', tuneB: 'horn', tuneC: 'horn', horns: 'trombone', choir: 'choir', bass: 'tuba' },
      vol: { choir: 1.1, timpani: 0.9 },
      lowpass: 1800,
      level: 0.85,
    },
    keep: {
      mute: ['choir', 'glock', 'gears'],
      inst: { tuneA: 'trumpet', tuneC: 'oboe', pah: 'harpsichord', bass: 'pizz' },
      vol: { tuneA: 0.8, flute: 0.5, pah: 0.7, harp: 0.45 },
    },
    runway: {
      mute: ['glock', 'gears', 'flute'],
      inst: { tuneA: 'horn', tuneC: 'oboe', pah: 'harpsichord', choir: 'choir', bass: 'pizz' },
      vol: { choir: 0.9, snare: 1.15, timpani: 0.8, pah: 0.6 },
    },
    broom: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'harp', 'pad', 'choir'],
      inst: { tuneA: 'flute', tuneB: 'oohs', tuneC: 'flute', pad: 'slowstrings' },
      vol: { tuneB: 0.7, pad: 0.6 },
      rev: { tuneA: 0.5, tuneB: 0.55, tuneC: 0.5 },
      level: 0.75,
    },
    bedroom: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'harp', 'pad', 'bass', 'brush'],
      inst: { tuneA: 'vibes', tuneB: 'vibes', tuneC: 'vibes', pad: 'slowstrings' },
      vol: { brush: 0.6, bass: 0.6, pad: 0.7, harp: 0.6 },
      rev: { tuneA: 0.4, tuneB: 0.4, tuneC: 0.4 },
      level: 0.75,
    },
    wrecked: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'pad'],
      inst: { tuneA: 'musicbox', tuneB: 'musicbox', tuneC: 'musicbox', pad: 'slowstrings' },
      vol: { pad: 0.45 },
      rev: { tuneA: 0.5, tuneB: 0.5, tuneC: 0.5 },
      lowpass: 3000,
      level: 0.6,
    },
    cutscene: {
      solo: ['tuneA', 'tuneB', 'tuneC', 'harp', 'pad', 'bass'],
      inst: { tuneB: 'slowstrings', pad: 'slowstrings' },
      vol: { bass: 0.55, pad: 0.6 },
      rev: { tuneA: 0.45 },
      level: 0.75,
    },
    boss: {},
  },
};

// =====================================================================================================================
// O FORTUNA, TIMES THREE (B-flat minor, 3/4)

const TV: Record<string, string[]> = {
  Bbm: ['4d-', '4f', '4b-'], F: ['4c', '4f', '4a'], Gb: ['4d-', '4g-', '4b-'], Ab: ['4c', '4e-', '4a-'], Ebm: ['4e-', '4g-', '4b-'],
};
const TR: Record<string, [string, string]> = { Bbm: ['2b-', '2f'], F: ['2f', '2c'], Gb: ['2g-', '2d-'], Ab: ['2a-', '2e-'], Ebm: ['2e-', '2b-'] };
const T_A = ['Bbm', 'Bbm', 'Bbm', 'F', 'Bbm', 'Bbm', 'Gb', 'F'];
const T_B = ['Bbm', 'Ab', 'Gb', 'F', 'Bbm', 'Ab', 'Gb', 'F', 'Ebm', 'Bbm', 'Gb', 'F', 'Ebm', 'Bbm', 'Gb', 'F'];
const T_C = ['Bbm', 'Bbm', 'Gb', 'Gb', 'Ebm', 'Ebm', 'F', 'F'];
const T_B2 = T_B.slice(0, 8);

/** The chant: one breath, staccato. */
const CHANT = ['o4 f4 f4 f4', 'o4 g-4 f4 e-4', 'o4 f4 f4 f4', 'o4 e2 r4', 'o4 f4 f4 f4', 'o4 g-4 a-4 g-4', 'o4 f4 e-4 d-4', 'o4 c2 r4'];
/** The dragon's theme. */
const THEME = [
  'o5 f2 b-4', 'o5 a-2 e-4', 'o5 g-2 d-4', 'o5 e2 c4',
  'o5 d-4 f4 b-4', 'o6 c2 o5 a-4', 'o5 b-2 g-4', 'o5 a2.',
  'o5 g-2 b-4', 'o5 f2 d-4', 'o5 e-2 d-4', 'o5 c2.',
  'o5 g-4 b-4 o6 e-4', 'o6 d-2 c4', 'o5 b-2 a-4', 'o5 a2 r4',
];
/** The chase: accents every two beats against the bar. */
const CHASE = ['o5 !b-4 f4 !a-4', 'o5 f4 !g-4 f4', 'o5 !b-4 g-4 !a-4', 'o5 g-4 !f4 g-4', 'o5 !g-4 e-4 !f4', 'o5 e-4 !d-4 e-4', 'o5 !c4 o4 a4 !b-4', 'o4 a4 !g4 a4'];

/** The car's arpeggios (the chant's second time). */
const tArp = (prog: string[]) => prog.map(c => { const v = TV[c].map(hi); return [v[0], v[1], v[2], v[1], v[0], v[1]].map(n => nt(n, '8')).join(' '); });
/** The strings churning. */
const tChurn = (prog: string[]) => prog.map(c => { const v = TV[c]; return [v[1], v[0], v[1], v[0], v[2], v[1]].map(n => nt(n, '8')).join(' '); });
const tPads = (prog: string[]) => prog.map(c => chord(TV[c], '2.'));
/** The pulse under it all: the root twice, the fifth. */
const tPulse = (prog: string[]) => prog.map(c => { const [r, f] = TR[c]; return `${nt(r, '4')} ${nt(r, '4')} ${nt(f, '4')}`; });
/** Stabs on the hemiola's accents, two bars at a time. */
const tHem = (prog: string[], v: (c: string) => string[] = c => TV[c]) => prog.map((c, i) => { const x = chord(v(c), '4'); return i % 2 === 0 ? `${x} r4 ${x}` : `r4 ${x} r4`; });
const tLow = (c: string) => TV[c].map(lo);
const tBlast = (prog: string[]) => prog.map(c => `${chord(tLow(c), '4')} r2`);
const tIce = (prog: string[]) => prog.map(c => { const v = TV[c].map(hi); return [v[0], v[1], v[2], hi(v[0]), v[2], v[1]].map(n => nt(n, '8')).join(' '); });
const tSquare = (prog: string[]) => prog.map(c => { const v = TV[c]; return [v[0], v[1], v[2], hi(v[0]), v[2], v[1]].map(n => nt(n, '8')).join(' '); });
const tPump = (prog: string[]) => prog.map(c => { const r = TR[c][0], h = hi(r); return [r, r, h, r, r, h].map(n => nt(n, '8')).join(' '); });
const roll3 = (n: string) => `o2 _v50 [${n}32]8 _v75 [${n}32]8 _v105 [${n}32]8`;
const tTimp = (prog: string[], every: number) => prog.map((c, i) => (i % every === 0 ? `${nt(TR[c][0], '4')} r2` : 'r2.'));

/** The car's lead: the theme (and the arpeggios, the chase). The same line on all three cars. */
const LEAD = join(rb(8), ['_v90 q5'], tArp(T_A), ['q7 _v105'], THEME, ['_v110'], CHASE, THEME.slice(0, 8));

const OPERC = (prog: string[]) => prog.map((_, i) => (i === 0 ? '{k(gong)}4 r4 k4' : i % 4 === 0 ? '{kx}4 r4 k4' : 'k4 r4 k4'));
const TAIKO_B = 'f4 f8 f8 f4';

export const SEQ_TRAGONS: Song = {
  title: 'O Fortuna, Times Three',
  bpm: 174,
  reverb: 'hall',
  reverbMix: 0.85,
  delay: { beats: 1, feedback: 0.22, tone: 2800 },
  parts: {
    choir: { inst: 'choir', pan: 0, rev: 0.45, vol: 0.6, mml: join(['q3 _v80'], CHANT, ['_v92'], CHANT, ['q7 _v100'], up(THEME, -1), ['_v105'], tHem(T_C), ['_v110'], up(THEME.slice(0, 8), -1)) },
    strings: { inst: 'strings', pan: 0.2, rev: 0.35, vol: 0.42, mml: join(['q5 _v70'], tChurn(T_A), tChurn(T_A), ['q8 _v85'], tPads(T_B), ['q5 _v95'], tChurn(T_C), tChurn(T_B2)) },
    low: { inst: 'cello', pan: -0.15, rev: 0.2, vol: 0.7, mml: join(['q6 _v95'], tPulse(T_A), tPulse(T_A), ['_v110'], tPulse(T_B), tPulse(T_C), tPulse(T_B2)) },
    timpani: {
      inst: 'timpani', pan: -0.1, rev: 0.35, vol: 0.6,
      mml: join(['_v75'], tTimp(T_A, 2), tTimp(T_A.slice(0, 7), 2), [roll3('f')], ['_v110'], tTimp(T_B.slice(0, 15), 1), [roll3('f')], ['_v105'], tHem(T_C, c => [at(TR[c][0], 2)]), ['_v110'], tTimp(T_B2.slice(0, 7), 1), [roll3('f')]),
    },
    perc: {
      inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0, rev: 0.3, vol: 0.55,
      mml: join(['_v70'], Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 'k4 r2' : 'r2.')), ['_v110'], OPERC(T_B), ['_v105'], T_C.map((_, i) => (i % 2 === 0 ? 'k4 r4 k4' : 'r4 k4 r4')), ['_v110'], OPERC(T_B2)),
    },
    fireLead: { inst: 'brass', pan: -0.2, rev: 0.3, vol: 0.85, mml: LEAD },
    iceLead: { inst: 'flute', pan: 0.25, rev: 0.4, vol: 0.85, mml: LEAD },
    boltLead: { inst: 'sawlead', pan: 0.1, rev: 0.25, dly: 0.12, vol: 0.7, mml: LEAD },
    fireLow: { inst: 'trombone', pan: -0.3, rev: 0.25, vol: 0.5, only: ['fire', 'main'], mml: join(rb(16), ['_v105'], tBlast(T_B), ['_v110'], tHem(T_C, tLow), tBlast(T_B2)) },
    fireTaiko: { inst: 'taiko', drums: true, pan: -0.2, rev: 0.3, vol: 0.55, only: ['fire', 'main'], mml: join(['_v75'], rep('f4 r2', 16), ['_v105'], rep(TAIKO_B, 16), T_C.map((_, i) => (i % 2 === 0 ? 'f4 r4 f4' : 'r4 f4 r4')), rep(TAIKO_B, 8)) },
    iceBed: { inst: 'celesta', pan: 0.35, rev: 0.45, dly: 0.15, vol: 0.45, only: ['ice'], mml: join(['_v70'], tIce(T_A), tIce(T_A), ['_v80'], tIce(T_B), tIce(T_C), tIce(T_B2)) },
    boltBed: { inst: 'squarelead', pan: 0.3, rev: 0.2, dly: 0.2, vol: 0.3, only: ['bolt'], mml: join(['q4 _v80'], tSquare(T_A), tSquare(T_A), tSquare(T_B), tSquare(T_C), tSquare(T_B2)) },
    boltBass: { inst: 'synthbass', pan: 0, rev: 0.05, vol: 0.55, only: ['bolt'], mml: join(['q5 _v95'], tPump(T_A), tPump(T_A), tPump(T_B), tPump(T_C), tPump(T_B2)) },
    boltKit: { inst: '909kick', drums: true, kit: '909', pan: 0, rev: 0.12, vol: 0.5, only: ['bolt'], mml: join(['_v95'], rep('{kh}8 h8 {ph}8 h8 {kh}8 ?h8', 48)) },
    ratchet: { inst: 'woodblock', drums: true, pan: 0.2, rev: 0.25, vol: 0.4, only: ['lift'], mml: join(['_v90'], rep('!e8 ?e8 e8 ?e8 e8 ?e8', 48)) },
  },
  arrangements: {
    main: { vol: { iceLead: 0.45, boltLead: 0.4 } },
    station: { solo: ['choir', 'low', 'timpani'], vol: { choir: 0.75 }, lowpass: 900, level: 0.65 },
    lift: { solo: ['choir', 'strings', 'low', 'timpani', 'perc', 'ratchet'], vol: { strings: 0.6, perc: 0.6 }, level: 0.85 },
    fire: { vol: { iceLead: 0.18, boltLead: 0.14 } },
    ice: { vol: { fireLead: 0.15, boltLead: 0.14 } },
    bolt: { vol: { fireLead: 0.15, iceLead: 0.18 } },
  },
};
