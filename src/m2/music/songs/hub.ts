// "ROUND AND ROUND": the hub (Happy Hub: the big roundabout with the lands' portals round it, walked round and round).
// A carousel waltz: the park's merry-go-round, a bit too pleased with itself (Banjo-Kazooie's Spiral Mountain by way of
// a fairground band organ). Distinct from the title (no sax, no shuffle, no big band): 3/4, a tuba's oom and an
// accordion's pah-pah, woodblock horses clip-clopping.
//
// F major, 168 (one-in-a-bar), 3/4. 68 bars: a 4-bar vamp on C7 (once: a harp glissando, the xylophone running up
// into it, a snare roll), then the 64-bar loop:
//   A   (16)  the hook on flute, the xylophone an octave up: up to the A and its chromatic under-neighbour, the same
//             figure a step up over the Gm, then a sequence down; the F7, the B-flat, the minor-six wink (Bbm6: D-flat,
//             C, B-flat, A walking down), a D7 secondary, a half cadence on C7. Accordion pah-pahs.
//   A2  (16)  the clarinet has it (the woodblocks clip-clopping now, pizzicato on the pahs, the strings in), and it
//             comes home to F.
//   B   (16)  the lyrical middle in D-flat (the flat six: a sidestep), a solo violin over harp arpeggios, cello, oohs:
//             Db - Ebm7 - Ab7, the Gb, the minor six again (Gbm6), Bb7, and it slides down a half step, D-flat to C7,
//             the run up the C7 straight into the hook. A snare roll brings in:
//   T   (16)  the whole fair: the hook on trumpet, the glockenspiel two octaves up, the horns' countermelody, accordion
//             and pizz together, the snare on the pahs, a crash every four bars.
//
// ARRANGEMENTS:  main (all of it); cutscene (under the hub's scenes: celesta and music box on the tune, slow strings,
// the cello and harp in the middle). And one per spot round the plaza (cues.ts picks by the one he's nearest, 'main'
// between them, crossfading as he walks): the same waltz in that land's colors, a preview of its theme:
//   adventure  exotica: pan flute, marimba, vibes, flute in the middle, congas and a shaker, upright bass
//   spooky     the theremin, harpsichords, the violin, the hook on the pipe organ, organ pads, choir, a ticking clock
//   space      vibes, theremin, celesta, the oohs on the horns' line, PWM pads, DX piano pahs, upright, bongos
//   hollywood  the studio orchestra: trumpet and horn on the tune, brass-section pahs, choir, the kit up
//   foreign    accordion, koto, sitar in the middle, guitar afterbeats, tambourine and castanets
//   frontier   harmonica, fiddle, banjo pahs, steel guitar, tuba, woodblock clip-clop
//   cartoon    xylophones, clarinet, oboe, muted trumpet, trombones, a big tuba, a slide whistle, slapsticks
//   fantasy    flute, celesta, harps, the choir singing the middle and the last hook, cello oom, a triangle
//   america    America USA's marching band: piccolo, clarinets, bell lyre, horn afterbeats, trombones, snare
//   staff      the staff room's muzak: DX piano, flute, Rhodes, nylon guitar, warm pad, finger bass, brushes

import type { Song } from '../engine';

const join = (...parts: string[][]) => parts.flat().join(' | ');
/** n bars' rest (3/4). */
const rest = (n: number) => Array.from({ length: n }, () => 'r2.');
/** Everything an octave up (each bar's o-numbers raised). */
const up = (bars: string[]) => bars.map(b => b.replace(/o(\d)/g, (_, n) => `o${Number(n) + 1}`));
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
/** A chord from notes with their octaves ('4f', '5c+'), lowest first. */
const ch = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const no = Number(n[0]); s += '>'.repeat(no - o) + n.slice(1) + ' '; o = no; }
  return `${s.trim()}}${len}`;
};
/** One note with its octave ('2f'). */
const nt = (n: string, len: string) => `o${n[0]} ${n.slice(1)}${len}`;

// The chords: voicings (around o4), and the bass's root and fifth
const V: Record<string, string[]> = {
  F: ['4f', '4a', '5c'], 'F/C': ['4f', '4a', '5c'], F7: ['4f', '4a', '5e-'], Gm: ['4g', '4b-', '5d'], C7: ['4e', '4g', '4b-'],
  Bb: ['4f', '4b-', '5d'], Bbm6: ['4f', '4g', '4b-', '5d-'], D7: ['4f+', '4a', '5c'], G7: ['4f', '4g', '4b', '5d'],
  Db: ['4f', '4a-', '5d-'], Ebm7: ['4g-', '4b-', '5d-'], Ab7: ['4g-', '5c', '5e-'], Bbm: ['4f', '4b-', '5d-'], Gb: ['4g-', '4b-', '5d-'],
  Gbm6: ['4g-', '4a', '5d-', '5e-'], Bb7: ['4f', '4a-', '5d'],
};
const R: Record<string, [string, string]> = {
  F: ['2f', '2c'], 'F/C': ['2c', '2f'], F7: ['2f', '2c'], Gm: ['2g', '2d'], C7: ['2c', '1g'], Bb: ['2b-', '2f'], Bbm6: ['2b-', '2f'],
  D7: ['2d', '1a'], G7: ['2g', '2d'], Db: ['2d-', '1a-'], Ebm7: ['2e-', '1b-'], Ab7: ['2a-', '2e-'], Bbm: ['2b-', '2f'], Gb: ['2g-', '2d-'],
  Gbm6: ['2g-', '2d-'], Bb7: ['2b-', '2f'],
};
const INTRO = ['C7', 'C7', 'C7', 'C7'];
const A = ['F', 'F', 'Gm', 'C7', 'C7', 'C7', 'F', 'F', 'F7', 'F7', 'Bb', 'Bbm6', 'F/C', 'D7', 'G7', 'C7'];
const A2 = [...A.slice(0, 14), 'C7', 'F'];
const B = ['Db', 'Db', 'Ebm7', 'Ab7', 'Db', 'Bbm', 'Gb', 'Ab7', 'Gb', 'Gbm6', 'Db', 'Bb7', 'Ebm7', 'Ab7', 'Db', 'C7'];

const pads = (prog: string[]) => prog.map(c => ch(V[c], '2.'));
/** The pah-pah on 2 and 3. */
const pahs = (prog: string[]) => prog.map(c => `r4 ${ch(V[c], '4')} ${ch(V[c], '4')}`);
/** The tuba's oom: the root, then the fifth while the chord stays; the last bar given (a walk). */
const ooms = (prog: string[], last: string) => {
  let run = 0;
  return prog.map((c, i) => {
    run = i > 0 && prog[i - 1] === c ? run + 1 : 0;
    return i === prog.length - 1 ? last : `${nt(R[c][run % 2], '4')} r2`;
  });
};
/** The harp in the middle: the root, then up and down the chord. */
const arps = (prog: string[]) => prog.map(c => { const v = V[c]; return `${nt('3' + R[c][0].slice(1), '4')} ${nt(v[0], '8')} ${nt(v[1], '8')} ${nt(v[2], '8')} ${nt(v[1], '8')}`; });

// ---- The tunes ----

/** The hook: up to the A and its chromatic under-neighbour, the figure a step up, the sequence down. */
const HOOK = [
  'o5 a2 g+4', 'o5 a4 >c4 <a4', 'o5 g2 f+4', 'o5 g4 b-4 g4',
  'o5 e2 d+4', 'o5 e4 g4 >c4', 'o5 a2.', 'o5 r4 f4 g4',
  'o5 a2 g+4', 'o5 a4 >c4 e-4', 'o6 d2.', 'o6 d-4 c4 <b-4',
  'o5 a4 >c4 <f4', 'o5 f+2 a4', 'o5 g4 b4 >d4', 'o6 c2 <b-4',
];
/** The second time, home to F. */
const HOOK2 = [...HOOK.slice(0, 14), 'o5 g2 e4', 'o5 f2 r4'];
/** The middle, in D-flat: long notes, the violin's. */
const MIDDLE = [
  'o5 f2.', 'o5 f4 a-4 >d-4', 'o5 b-2.', 'o5 a-4 g-4 e-4',
  'o5 f2.', 'o5 f4 d-4 <b-4', 'o5 d-2 e-4', 'o5 c2 e-4',
  'o5 g-2 f4', 'o5 e-4 d-4 <a4', 'o4 a-4 >d-4 f4', 'o5 a-2.',
  'o5 g-2 f4', 'o5 e-2 c4', 'o5 d-2.', 'o5 c4 e4 g4',
];
/** The horns' countermelody under the last hook. */
const HORNS = [
  'o4 a2.', 'o4 a4 g4 f4', 'o4 b-2.', 'o4 b-4 a4 g4',
  'o4 g2.', 'o4 b-4 >c4 <b-4', 'o4 a2.', 'o4 a2.',
  'o4 a2.', 'o5 e-2.', 'o5 d2.', 'o5 d-2.',
  'o5 c2.', 'o5 c4 <a4 f+4', 'o4 b-2 a4', 'o4 a2.',
];

// ---- The kit (orchestral: bass drum, snare, crash, triangle, woodblocks) ----
const ROLL = (a: number, b: number, c: number) => `_v${a} s16 s16 s16 s16 _v${b} s16 s16 s16 s16 _v${c} s16 s16 s16 s16`;
const DRUMS_INTRO = ['_v90 x4 r2', 'r2.', ROLL(35, 50, 65), '_v80 s16 s16 s16 s16 _v95 s16 s16 s16 s16 _v110 s8 s8'];
const DRUMS_A = ['_v100 {kx}4 r4 ?i4', ...rep('k4 r4 ?i4', 7), '{kx}4 r4 ?i4', ...rep('k4 r4 ?i4', 6), 'k4 ?i4 i4'];
const DRUMS_A2 = ['_v95 {kx}4 ?e4 ?e4', ...rep('k4 ?e4 ?e4', 14), 'k4 r4 i4'];
const DRUMS_B = ['_v85 {ki}4 r2', ...rep('k4 r2', 6), 'k4 r4 ?i4', ...rep('k4 r2', 7), ROLL(40, 60, 85)];
const T4 = ['{kx}4 ?s4 ?s4', 'k4 ?s4 ?s4', 'k4 ?s4 ?s4', 'k4 ?s4 ?s4'];
const DRUMS_T = ['_v110', ...T4, ...T4, ...T4, '{kx}4 ?s4 ?s4', 'k4 ?s4 ?s4', 'k4 ?s4 ?s4', 'k4 s8 s8 s8 s8'];

// ---- The lands' own percussion (one part each, only in its arrangements): intro (4), A, A2, B, T (16 each) ----
/** 16 bars: the first given, then the rest, the last given. */
const sec16 = (first: string, bar: string, last = bar) => [first, ...rep(bar, 14), last];
/** Jungle Land: congas and a shaker (a beguine's lilt in three). */
const HAND = join(rest(3), ['_v80 c8 c8 d8 d8 {cd}4'],
  sec16('_v85 {dz}8 ?c8 c8 d8 ?c8 c8', 'd8 ?c8 c8 d8 ?c8 c8'), sec16('{dz}8 ?c8 {cz}8 d8 ?c8 c8', '{dz}8 ?c8 {cz}8 d8 ?c8 c8'),
  sec16('_v70 d4 ?c8 c8 ?c4', 'd4 ?c8 c8 ?c4', 'd8 c16 c16 d8 c8 b16 b16 b8'), sec16('_v90 {dz}8 ?c8 {cz}8 d8 ?c8 c8', '{dz}8 ?c8 {cz}8 d8 ?c8 c8', 'd8 c16 c16 d8 c8 {cd}4'));
/** Spooky Land: a clock ticking, a gong at the sections' heads. */
const TICK = join(['_v100 g4 r2'], rest(3),
  sec16('_v75 {kg}4 ?e4 ?e4', 'k4 ?e4 ?e4'), sec16('{kg}4 ?e4 ?e4', 'k4 ?e4 ?e4'),
  sec16('_v65 {kg}4 r2', 'k4 r4 ?e4', 'k4 e4 e4'), sec16('_v90 {kg}4 e4 e4', 'k4 e4 e4', 'k4 e8 e8 e8 e8'));
/** Future Land and the staff room: brushes, a shaker, a bongo (lounge in three). */
const LOUNGE = join(rest(2), ['_v70 ?z8 ?z8 z8 ?z8 z8 ?z8', 'z8 ?z8 z8 ?z8 m8 m8'],
  sec16('_v80 {kz}8 ?z8 m8 ?z8 ?b8 m8', '{kz}8 ?z8 m8 ?z8 ?b8 m8'), sec16('{kz}8 ?z8 m8 ?z8 ?b8 m8', '{kz}8 ?z8 m8 ?z8 ?b8 m8'),
  sec16('_v65 k4 ?z8 ?z8 ?z8 ?z8', 'k4 ?z8 ?z8 ?z8 ?z8', 'k4 z8 z8 m8 m8'), sec16('_v85 {kz}8 ?z8 m8 ?z8 b8 m8', '{kz}8 ?z8 m8 ?z8 b8 m8', 'k8 b8 b8 m8 m4'));
/** Foreign Lands: a bass drum, tambourine, castanets in the middle. */
const TAMB = join(rest(3), ['_v80 j8 j8 j8 j8 j4'],
  sec16('_v85 {kx}4 j4 j4', 'k4 j4 j4'), sec16('{kx}4 j8 j8 j4', 'k4 j8 j8 j4'),
  sec16('_v75 k4 (castanets)8 (castanets)8 (castanets)4', 'k4 (castanets)8 (castanets)8 (castanets)4', 'k4 j8 j8 j8 j8'),
  [...rep('_v95 {kx}4 j8 j8 j8 j8 | k4 j8 j8 j8 j8 | k4 j8 j8 j8 j8 | k4 j8 j8 j8 j8', 4)]);
/** Wilderness Land: the woodblocks' clip-clop. */
const CLOP = '(woodblock)8 (woodblocklo)8 (woodblock)8 (woodblocklo)8';
const CLIP = join(rest(2), [`_v75 r4 ${CLOP}`, `r4 ${CLOP}`],
  sec16(`_v85 {kx}4 ${CLOP}`, `k4 ${CLOP}`), sec16(`{kx}4 ${CLOP}`, `k4 ${CLOP}`),
  sec16('_v70 k4 r2', 'k4 r4 ?e4', `k4 ${CLOP}`), sec16(`_v95 {kx}4 ${CLOP}`, `k4 ${CLOP}`, `k4 ${CLOP}`));
/** Cartoon Land: woodblocks, a cowbell, slapsticks at the phrase ends. */
const TOON8 = ['k4 e4 e4', 'k4 e4 e4', 'k4 e4 w4', 'k4 e4 e4', 'k4 e4 e4', 'k4 e4 e4', 'k4 e8 e8 w4', 'k4 r4 a4'];
const TOON = join(rest(3), ['_v90 a4 e8 e8 e4'],
  ['_v85'], TOON8, TOON8, TOON8, TOON8,
  sec16('_v70 k4 r4 ?e4', 'k4 r4 ?e4', 'k4 e8 e8 a4'), ['_v95'], TOON8, TOON8);
/** Fairy Land: a triangle, the bass drum soft, a cymbal for the last hook. */
const TRI = join(rest(3), ['_v70 r2 i4'],
  sec16('_v70 {ki}4 r2', '?i4 r2'), sec16('{ki}4 r4 ?i4', '?i4 r4 ?i4'),
  sec16('_v60 i4 r2', 'r2.', '?i8 ?i8 ?i8 ?i8 i4'), sec16('_v85 {kx}4 r4 ?i4', '{ki}4 r4 ?i4', 'k4 i4 i4'));
/** America USA's marching band: bass drum, snare, the crash. */
const MARCH = join(DRUMS_INTRO,
  sec16('_v95 {kx}4 s4 s4', 'k4 s4 s4', 'k4 s8 s8 s8 s8'), sec16('{kx}4 s4 s4', 'k4 s4 s4', 'k4 s8 s8 s8 s8'),
  sec16('_v75 k4 ?s4 ?s4', 'k4 ?s4 ?s4', ROLL(40, 60, 85)), [...rep('_v105 {kx}4 s8 s8 s4 | k4 s8 s8 s4 | k4 s8 s8 s4 | k4 s8 s8 s8 s8', 4)]);
/** Cartoon Land's slide whistle: up through the held A at bar 7, down through the held D at bar 11. */
const SLIDES = rest(16).map((r, i) => (i === 6 ? 'o5 c8 o6 c4 r4.' : i === 10 ? 'o6 a8 o5 a4 r4.' : r));

export const HUB: Song = {
  title: 'Round and Round',
  bpm: 168,
  loopFrom: 12,
  reverb: 'hall',
  reverbMix: 0.65,
  delay: { beats: 1, feedback: 0.2, tone: 2600 },
  parts: {
    flute: { inst: 'flute', pan: 0.05, rev: 0.25, dly: 0.12, mml: join(rest(4), ['_v95'], HOOK, rest(48)) },
    xylo: { inst: 'xylophone', pan: 0.3, rev: 0.2, vol: 0.45, mml: join(rest(2), ['_v90 o5 c12 d12 e12 f12 g12 a12 b-12 a12 g12', 'o5 e4 f4 g4'], up(HOOK), rest(48)) },
    clar: { inst: 'clarinet', pan: -0.05, rev: 0.25, dly: 0.1, mml: join(rest(20), ['_v95'], HOOK2, rest(32)) },
    violin: { inst: 'violin', pan: 0.1, rev: 0.35, dly: 0.1, mml: join(rest(36), ['_v92'], MIDDLE, rest(16)) },
    trumpet: { inst: 'trumpet', pan: 0, rev: 0.25, dly: 0.08, vol: 0.9, mml: join(rest(52), ['_v100'], HOOK2) },
    glock: { inst: 'glock', pan: 0.35, rev: 0.3, dly: 0.15, vol: 0.5, mml: join(rest(52), ['_v80'], up(HOOK2)) },
    horns: { inst: 'horn', pan: -0.35, rev: 0.3, vol: 0.75, mml: join(rest(52), ['_v85 _q95'], HORNS) },
    strings: { inst: 'strings', pan: 0, rev: 0.35, vol: 0.8, mml: join(['_v60'], pads(INTRO), ['_v45'], pads(A), ['_v55'], pads(A2), ['_v72'], pads(B), ['_v80'], pads(A2)) },
    oohs: { inst: 'oohs', pan: 0, rev: 0.45, vol: 0.5, mml: join(rest(36), ['_v65'], pads(B), rest(16)) },
    accordion: { inst: 'accordion', pan: -0.3, rev: 0.15, vol: 0.6, mml: join(['q4 _v80'], pahs(INTRO), pahs(A), rest(32), pahs(A2)) },
    pizz: { inst: 'pizz', pan: 0.3, rev: 0.2, vol: 0.7, mml: join(['_v85'], rest(20), pahs(A2), rest(16), pahs(A2)) },
    harp: {
      inst: 'harp', pan: 0.25, rev: 0.35, vol: 0.75,
      mml: join(['_v80 o3 c16 e16 g16 b-16 o4 c16 e16 g16 b-16 o5 c16 e16 g16 b-16'], rest(35), ['_v75'], arps(B), rest(16)),
    },
    tuba: {
      inst: 'tuba', pan: 0, rev: 0.1, vol: 0.85,
      mml: join(['_v95 o2 c4 r2', 'o1 g4 r2', 'o2 c4 r2', 'o2 c4 d4 e4'], ooms(A, 'o2 c4 d4 e4'), ooms(A2, 'o2 f4 r2'), rest(16), ooms(A2, 'o2 f4 o1 a4 o2 c4')),
    },
    cello: { inst: 'cello', pan: -0.15, rev: 0.25, vol: 0.8, mml: join(rest(36), ['_v80 _q100'], B.map(c => nt(R[c][0], '2.')), rest(16)) },
    drums: { inst: 'bassdrum', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.8, mml: join(DRUMS_INTRO, DRUMS_A, DRUMS_A2, DRUMS_B, DRUMS_T) },
    // (the lands' own percussion, and Cartoon Land's slide whistle: each only in its arrangements)
    hand: { inst: 'congahi', drums: true, pan: 0.25, rev: 0.2, vol: 0.7, only: ['adventure'], mml: HAND },
    tick: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: -0.2, rev: 0.35, vol: 0.6, only: ['spooky'], mml: TICK },
    lounge: { inst: 'kicksoft', drums: true, kit: 'brush', pan: 0.15, rev: 0.2, vol: 0.65, only: ['space', 'staff'], mml: LOUNGE },
    tamb: { inst: 'tamb', drums: true, kit: 'orchestra', pan: 0.2, rev: 0.2, vol: 0.65, only: ['foreign'], mml: TAMB },
    clip: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: -0.15, rev: 0.2, vol: 0.65, only: ['frontier'], mml: CLIP },
    toon: { inst: 'woodblock', drums: true, kit: 'orchestra', pan: 0.15, rev: 0.2, vol: 0.7, only: ['cartoon'], mml: TOON },
    tri: { inst: 'triangle', drums: true, kit: 'orchestra', pan: 0.3, rev: 0.4, vol: 0.55, only: ['fantasy'], mml: TRI },
    march: { inst: 'snare2', drums: true, kit: 'orchestra', rev: 0.2, vol: 0.8, only: ['america'], mml: MARCH },
    slide: { inst: 'flute', pan: 0.35, rev: 0.3, vol: 0.55, only: ['cartoon'], mml: join(rest(4), ['_g8 _m0 _v85'], SLIDES, SLIDES, rest(16), SLIDES) },
  },
  arrangements: {
    main: {},
    // ---- Round the plaza (cues.ts hubArr): each spot's land in the waltz ----
    adventure: {
      inst: { flute: 'panflute', xylo: 'marimba', clar: 'vibes', violin: 'flute', trumpet: 'panflute', accordion: 'vibes', pizz: 'nylongtr', tuba: 'upright', strings: 'slowstrings' },
      mute: ['drums', 'glock'], vol: { xylo: 0.8, strings: 0.75, flute: 1.1, trumpet: 1.1 }, rev: { flute: 0.4, trumpet: 0.4, clar: 0.35 },
    },
    spooky: {
      inst: { flute: 'theremin', xylo: 'harpsichord', clar: 'harpsichord', trumpet: 'churchorgan', glock: 'musicbox', horns: 'choir', strings: 'churchorgan', oohs: 'choir', accordion: 'harpsichord' },
      mute: ['drums'], vol: { strings: 0.5, xylo: 0.8, trumpet: 0.8, horns: 0.9 }, rev: { flute: 0.45, trumpet: 0.5, strings: 0.5, glock: 0.5 },
    },
    space: {
      inst: { flute: 'vibes', xylo: 'celesta', clar: 'theremin', violin: 'theremin', trumpet: 'vibes', horns: 'oohs', strings: 'pwm', accordion: 'fmpiano', harp: 'fmpiano', tuba: 'upright', cello: 'upright' },
      mute: ['drums'], vol: { flute: 1.15, trumpet: 1.15, horns: 1.1, strings: 0.6 }, rev: { flute: 0.4, trumpet: 0.4, clar: 0.4, violin: 0.4 },
    },
    hollywood: {
      inst: { flute: 'trumpet', clar: 'horn', accordion: 'brass', oohs: 'choir' },
      mute: ['xylo'], vol: { flute: 0.9, accordion: 0.8, strings: 1.05, drums: 1.15, horns: 1.1 }, rev: { flute: 0.3, clar: 0.3 },
    },
    foreign: {
      inst: { flute: 'accordion', clar: 'koto', violin: 'sitar', pizz: 'nylongtr', harp: 'koto' },
      mute: ['drums', 'xylo'], vol: { flute: 1.1, accordion: 0.8, clar: 1.1 },
    },
    frontier: {
      inst: { flute: 'harmonica', clar: 'violin', trumpet: 'harmonica', accordion: 'banjo', pizz: 'steelgtr', harp: 'steelgtr' },
      mute: ['drums', 'xylo', 'glock'], vol: { accordion: 0.9, trumpet: 1.05 },
    },
    cartoon: {
      inst: { flute: 'xylophone', violin: 'oboe', trumpet: 'mutetrumpet', horns: 'trombone', accordion: 'marimba', cello: 'trombone' },
      mute: ['drums'], vol: { flute: 0.9, xylo: 0.7, tuba: 1.15, strings: 0.55, oohs: 0.7 },
    },
    fantasy: {
      inst: { xylo: 'celesta', clar: 'flute', violin: 'choir', trumpet: 'choir', strings: 'slowstrings', oohs: 'choir', accordion: 'harp', pizz: 'celesta', tuba: 'cello' },
      mute: ['drums'], vol: { xylo: 0.8, violin: 0.85, trumpet: 0.85, pizz: 0.8, tuba: 0.9 }, rev: { flute: 0.4, clar: 0.4, violin: 0.5, trumpet: 0.5, harp: 0.45 },
    },
    america: {
      inst: { xylo: 'glock', violin: 'horn', horns: 'trombone', accordion: 'brass', pizz: 'horn', harp: 'clarinet', cello: 'trombone' },
      mute: ['drums', 'strings', 'oohs'], vol: { tuba: 1.1, accordion: 0.8, pizz: 0.8, harp: 0.7 }, rev: { violin: 0.25 },
    },
    staff: {
      inst: { flute: 'fmpiano', clar: 'flute', violin: 'fmpiano', trumpet: 'fmpiano', horns: 'flute', strings: 'warmpad', oohs: 'warmpad', accordion: 'epiano', pizz: 'nylongtr', harp: 'vibes', tuba: 'bass', cello: 'bass' },
      mute: ['drums', 'xylo', 'glock'], vol: { flute: 1.1, violin: 1.1, trumpet: 1.1, horns: 0.7, strings: 0.6 }, rev: { flute: 0.3, trumpet: 0.3 }, level: 0.9,
    },
    cutscene: {
      solo: ['flute', 'clar', 'violin', 'trumpet', 'strings', 'cello', 'harp'],
      inst: { flute: 'celesta', clar: 'celesta', trumpet: 'musicbox', strings: 'slowstrings' },
      vol: { strings: 0.6, flute: 0.8, clar: 0.8, trumpet: 0.8 },
      rev: { flute: 0.45, clar: 0.45, trumpet: 0.45 },
      level: 0.75,
    },
  },
};
