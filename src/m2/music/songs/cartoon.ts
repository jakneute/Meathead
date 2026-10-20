// CARTOON LAND's music (land id 'cartoon'): the land's theme, a version of it for every section and for the White
// House's own moments. Its fights (the five pundits, STUPID DAD) are in cartoonBosses.ts.
//
// ---- "TUNE IN NEXT WEEK" (land:cartoon) ----
// A park area frozen in 1994, scored as the theme song of a Saturday morning it never stopped being: a bouncy two-beat
// cartoon main title (the hook up the chord and a hiccup, every bar a secondary dominant pulling to the next: the A7,
// the D7, the minor iv's sigh), a bridge that lurches up a minor third into E-flat (the way 90s cartoon themes jump a
// key to sound expensive), and a sneaky A minor C for the bad guys (staccato, the leading tone creeping). Every
// section re-orchestrates it (the Banjo-Kazooie idea): Seuss whimsy in the kiddie square, a corporate tour video in
// the studio, the show's own peppy theme while the projection's up, the same tune gone sour on the bare soundstage
// after, 90s Nicktoons ska-punk in the big-kid zone, a Carl Stalling chase at PUNCHY & KICKY, and a cheap
// laugh-track sitcom theme for STUPID DAD LIVE!.
//
// Written in C major, played in B-flat (every pitched part tr -2: every key's taken). 142, straight. 36 bars: a 4-bar
// fanfare (once: G7sus - G7sus - Ab7 - G7, the brass's "ta-da-da-DAAA" twice, a snare roll, a tom run), then the loop:
//   A1 (8)  C - A7 - Dm7 - G7 - Em7 A7 - Dm7 G7 - C A7 - D7 G7: the hook.
//   A2 (8)  C - A7 - Dm7 - G7 - C7 - F Fm6 - Dm7 G7 - C Bb7: the hook again, the minor iv, the Bb7 pivoting up.
//   B  (8)  Ebmaj7 - Cm7 - Fm7 - Bb7 - Ebmaj7 - Abmaj7 - Dm7b5 - G7: the bridge, broad, up a minor third; the
//           Abmaj7 turned into the half-diminished D and home by the G7.
//   C  (8)  Am - Am - F - E7 - Am - Am - D7 - G7: the bad guys' sneak (the G7 cheated to A minor, and back).
//
// ARRANGEMENTS (one per section; the crossfade does the rest as he walks):
//   kiddie       SILLYVILLE SQUARE: Seuss whimsy: clarinet, flute and oboe on the tune, the glockenspiel over it, a
//                tuba's two-beat, pizzicato on the offbeats, trombone smears, woodblock clip-clop, a triangle
//   studio       LEARN THE MAGIC OF HOW CARTOONS ARE MADE: a 1994 corporate tour video: DX FM piano on the tune, a PWM
//                pad, slap bass, clean guitar chicks, synth brass, an 808 with claps and a cowbell
//   whitehouse1  CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES (the projection up): the show's own theme, peppy and
//   (and main)   cheesy: trumpet on the hook, strings on the bridge, xylophone on the sneak, the glockenspiel, horns,
//                bouncy piano, power chords, brass stabs, orchestra hits, a rock kit and a tambourine, timpani
//   whitehouse2  the West Wing: the same, the kids' choir on the counterline, a presidential snare tattoo
//   real         the screen's down: the bare soundstage, the backtrack among the bodies: the tune on a far-off celesta
//                over a cello holding the tritone under it, a pad, muffled, quiet
//   tv           the Clintons on the cartoon TV: the theme as a pompous state occasion through a TV speaker (trumpet,
//                horns, tuba, the snare tattoo, timpani, hits)
//   judder       the TV snows out, the picture shakes: the tune warbling on a theremin, muffled
//   down         the screen coming down, the cat sliding off him: nothing but the sour cello and a pad
//   bigkid       THE BIG-KID ZONE: 90s Nicktoons ska-punk: alto sax and trumpet, an organ skanking the offbeats, power
//                chords, a trombone counterline, the polka-punk beat, a distorted guitar on the sneak
//   itchy        PUNCHY & KICKY: a Carl Stalling chase: harmon trumpet on the hook, the xylophone running sixteenths
//                over everything, pizzicato, a tuba, brass blats, trombone smears, a galloping snare, slapsticks, hits
//   amphi        STUPID DAD LIVE!: a cheap laugh-track sitcom theme: alto sax over Rhodes, finger bass, soft oohs, a
//                half-time kit with a sidestick
//   empty        the amphitheater after (a revisit): the sitcom theme on a Rhodes, muffled, nobody there
//   cutscene     under a scene: vibes, slow strings, the upright

import type { Song } from '../engine';
import { type Bar, join, rest, rep, up, nt, chord, bars, hi } from './jungle';

/** Every pitched part's transpose (written in C, heard in B-flat). */
const TR = -2;

const V: Record<string, string[]> = {
  G7sus: ['4c', '4d', '4f', '4g'], Ab7: ['4c', '4e-', '4g-', '4a-'], G7: ['3b', '4d', '4f', '4g'], C: ['4e', '4g', '5c'],
  A7: ['4c+', '4e', '4g', '4a'], Dm7: ['4c', '4d', '4f', '4a'], Em7: ['4d', '4e', '4g', '4b'], D7: ['4c', '4d', '4f+', '4a'],
  C7: ['4c', '4e', '4g', '4b-'], F: ['4c', '4f', '4a'], Fm6: ['4c', '4d', '4f', '4a-'], Bb7: ['4d', '4f', '4a-', '4b-'],
  Ebmaj7: ['4d', '4e-', '4g', '4b-'], Cm7: ['4c', '4e-', '4g', '4b-'], Fm7: ['4c', '4e-', '4f', '4a-'], Abmaj7: ['4c', '4e-', '4g', '4a-'],
  Dm7b5: ['4c', '4d', '4f', '4a-'], Am: ['4c', '4e', '4a'], E7: ['4d', '4e', '4g+', '4b'],
};
/** The bass: the root, and the fifth it bounces to. */
const R: Record<string, [string, string]> = {
  G7sus: ['2g', '2d'], Ab7: ['2a-', '2e-'], G7: ['2g', '2d'], C: ['2c', '2g'], A7: ['2a', '2e'], Dm7: ['2d', '2a'], Em7: ['2e', '2b'],
  D7: ['2d', '2a'], C7: ['2c', '2g'], F: ['2f', '2c'], Fm6: ['2f', '2c'], Bb7: ['2b-', '2f'], Ebmaj7: ['2e-', '2b-'], Cm7: ['2c', '2g'],
  Fm7: ['2f', '2c'], Abmaj7: ['2a-', '2e-'], Dm7b5: ['2d', '2a-'], Am: ['2a', '2e'], E7: ['2e', '2b'],
};
const INTRO: Bar[] = ['G7sus', 'G7sus', 'Ab7', 'G7'];
const A1: Bar[] = ['C', 'A7', 'Dm7', 'G7', ['Em7', 'A7'], ['Dm7', 'G7'], ['C', 'A7'], ['D7', 'G7']];
const A2: Bar[] = ['C', 'A7', 'Dm7', 'G7', 'C7', ['F', 'Fm6'], ['Dm7', 'G7'], ['C', 'Bb7']];
const B: Bar[] = ['Ebmaj7', 'Cm7', 'Fm7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'Dm7b5', 'G7'];
const C: Bar[] = ['Am', 'Am', 'F', 'E7', 'Am', 'Am', 'D7', 'G7'];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];
const ALL: Bar[] = [...INTRO, ...LOOP];
const g2 = (b: Bar) => (typeof b === 'string' ? b : b[1]);

// ---- The tunes ----
/** The fanfare: "ta-da-da-DAAA", twice, and down the dominant. */
const FANFARE = ['o5 g8 g8 r8 g8 o6 c4 r4', 'o5 a8 a8 r8 a8 o6 d4 r4', 'o6 e-4. c8 o5 a-4 g-4', 'o5 g8 b8 o6 d8 f8 e8 d8 o5 b8 g8'];
/** The hook (A1): up the chord and a hiccup. */
const HOOK_A1 = [
  'o5 c8 d8 e8 g8 r8 e8 g4',
  'o5 a4 g8 e8 c+4 e4',
  'o5 f8 e8 f8 a8 r8 f8 a4',
  'o5 b4 a8 g8 f4 d4',
  'o5 e8 g8 b4 a8 g8 e4',
  'o5 f8 a8 o6 c4 o5 b8 a8 g4',
  'o5 e4 c4 c+4 e4',
  'o5 f+4 a4 g4 r4',
];
/** The hook again (A2): the C7 reaching up, the minor iv, up the Bb7 into the bridge. */
const HOOK_A2 = [
  ...HOOK_A1.slice(0, 4),
  'o5 g8 b-8 o6 c8 e8 r8 c8 o5 b-4',
  'o5 a4 o6 c4 o5 a-4 f4',
  'o5 f4 a4 g4 f4',
  'o5 e4 c4 r8 b-8 o6 c8 d8',
];
/** The bridge (B), broad. */
const MEL_B = ['o6 e-2 d4 o5 b-4', 'o5 g2 e-4 g4', 'o5 a-2 g4 f4', 'o5 d2 f4 a-4', 'o5 g4 b-4 o6 e-4 d4', 'o6 c2 o5 a-4 g4', 'o5 a-4 f4 d4 f4', 'o5 g4 b4 o6 d4 f4'];
/** The bad guys' sneak (C), staccato. */
const MEL_C = [
  'o5 a8 r8 a8 g+8 a8 r8 e8 r8',
  'o5 c8 r8 c8 o4 b8 o5 c8 e8 a4',
  'o5 a8 r8 a8 g8 f8 r8 c8 r8',
  'o5 g+8 r8 g+8 a8 b8 o6 d8 e4',
  'o5 a8 r8 a8 g+8 a8 r8 e8 r8',
  'o5 c8 e8 a8 o6 c8 e4 c4',
  'o6 d8 c8 o5 a8 f+8 d4 f+4',
  'o5 g8 a8 b8 o6 c8 d4 o5 b4',
];
/** The counterline: the guide tones, voice-led (horns; the kids' choir in the West Wing). */
const COUNTER = [
  'o4 e1', 'o4 e2 g2', 'o4 f1', 'o4 f2 d2', 'o4 g2 e2', 'o4 f1', 'o4 e2 g2', 'o4 f+2 f2',
  'o4 e1', 'o4 e2 g2', 'o4 f1', 'o4 f2 d2', 'o4 b-1', 'o4 a2 a-2', 'o4 a2 g2', 'o4 g2 a-2',
  'o4 g1', 'o4 e-1', 'o4 e-2 c2', 'o4 d1', 'o4 g1', 'o4 g2 e-2', 'o4 f1', 'o4 f1',
  'o4 e1', 'o4 e1', 'o4 f1', 'o4 g+1', 'o4 e1', 'o4 e1', 'o4 f+1', 'o4 f1',
];

// ---- The accompaniments ----
const pads = (prog: Bar[]) => bars(prog, (c, b) => chord(V[c], b === 4 ? '1' : '2'));
/** The two-beat: the root, a pickup, the fifth, the octave and back. */
const bounce = (prog: Bar[]) => bars(prog, (c, b) => {
  const [r, f] = R[c];
  return b === 4 ? `${nt(r, '4')} r8 ${nt(r, '8')} ${nt(f, '4')} ${nt(hi(r), '8')} ${nt(f, '8')}` : `${nt(r, '4')} ${nt(f, '4')}`;
});
/** The offbeat chords (pizzicato, piano, the organ's skank, the guitar's chick). */
const offs = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c], '8'); return b === 4 ? `r8 ${x} r8 ${x} r8 ${x} r8 ${x}` : `r8 ${x} r8 ${x}`; });
/** Power chords on the root (they play the fifth themselves). */
const power = (prog: Bar[]) => bars(prog, (c, b) => { const r = R[c][0]; return b === 4 ? `${nt(r, '4.')} ${nt(r, '8')} r8 ${nt(r, '8')} ${nt(r, '4')}` : `${nt(r, '4.')} ${nt(r, '8')}`; });
/** The brass: a stab on one, then a push on the and of two and three (A). */
const stabs = (prog: Bar[]) => prog.map((b, i) => { const x = (len: string) => chord(V[g2(b)], len); return i % 2 === 0 ? `${x('8')} r8 r2.` : `r2 ${x('8')} ${x('8')} r4`; });
/** The brass sneaking on two and four (C). */
const sneak = (prog: Bar[]) => bars(prog, (c, b) => { const x = chord(V[c], '8'); return b === 4 ? `r4 ${x} r8 r4 ${x} r8` : `r4 ${x} r8`; });
/** The xylophone running sixteenths up and down the chord, an octave up (PUNCHY & KICKY). */
const runs = (prog: Bar[]) => bars(prog, (c, b) => {
  const v = V[c].length === 3 ? [...V[c], hi(V[c][0])] : V[c];
  const u = v.map(hi);
  const once = [u[0], u[1], u[2], u[3], hi(u[0]), u[3], u[2], u[1]].map((n, i) => nt(n, '16', i === 0 ? '!' : '')).join(' ');
  return b === 4 ? `${once} ${once}` : once;
});
/** A trombone smear up into the end of every fourth bar. */
const smears = (prog: Bar[]) => prog.map((b, i) => (i % 4 === 3 ? `r2 _b-5/4 ${nt(`3${R[g2(b)][0].slice(1)}`, '2')}` : 'r1'));

// ---- The kits ----
const ROCK = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
const RIDE = '{ki}8 i8 {si}8 i8 {ki}8 i8 {si}8 i8';
const DRIVE = '{kh}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {sh}8';
const POLKA = '{kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8 {kh}8 {sh}8';
const HALF = '{kh}8 h8 h8 h8 {sh}8 h8 h8 h8';
const crashIn = (p: string) => p.replace(/^\{k./, '{kx');
const FILL = '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)16 (tom4)16';
const FILL_TOP = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {ks}8 {ks}8';
const ROLL = '_v45 s16 s16 s16 s16 _v60 s16 s16 s16 s16 _v80 s16 s16 s16 s16 _v100 s16 s16 s16 s16';
/** Eight bars: in on a crash, six of the groove, a fill. */
const sec8 = (groove: string, fill = FILL) => [crashIn(groove), ...rep(groove, 6), fill];
/** The fanfare's hits with the brass, the roll, the run down the toms. */
const KIT_INTRO = ['{kx}8 {ks}8 r8 {ks}8 {kx}4 r4', '{kx}8 {ks}8 r8 {ks}8 {kx}4 r4', ROLL, FILL_TOP];

/** The 808 (k 808kick, h 808hat, p 808clap, s 808snare, w 808cowbell, t u 808 toms). */
const DM = '{kh}8 h8 {ph}8 h8 {kh}8 {kh}8 {ph}8 h8';
const DM_B = '{kh}8 h8 {sh}8 h8 {kh}8 h8 {sh}8 h8';
const DM_C = '{kh}8 w8 {ph}8 h8 {kh}8 w8 {ph}8 h8';
const DM_FILL = '{kh}8 h8 {ph}8 h8 t16 t16 t16 t16 u16 u16 u16 u16';
const dm8 = (g: string) => [g, ...rep(g, 6), DM_FILL];

/** The sitcom's half-time kit (sidestick on three). */
const SIT = '{kh}8 ?h8 h8 ?h8 {mh}8 ?h8 h8 ?h8';
const SIT_IN = '{k(ride)}8 ?h8 h8 ?h8 {mh}8 ?h8 h8 ?h8';
const SIT_FILL = '{kh}8 ?h8 h8 ?h8 (tom2)8 (tom3)8 (tom4)8 r8';
const sit8 = () => [SIT_IN, ...rep(SIT, 6), SIT_FILL];

/** The kiddie square's clip-clop (the orchestra kit: k bass drum, e woodblock). */
const KID = '{ke}8 r8 (woodblocklo)8 r8 e8 e8 (woodblocklo)8 r8';
const KID_IN = '{ke(triangle)}8 r8 (woodblocklo)8 r8 e8 e8 (woodblocklo)8 r8';
const KID_END = '{ke}8 r8 (woodblocklo)8 r8 (slapstick)4 r4';
const kid8 = () => [KID_IN, ...rep(KID, 6), KID_END];

/** The chase's galloping snare. */
const CH = '!{ks}8 ?s16 ?s16 s8 ?s16 ?s16 !{ks}8 ?s16 ?s16 s8 ?s16 ?s16';
const CH_IN = '!{kx}8 ?s16 ?s16 s8 ?s16 ?s16 !{ks}8 ?s16 ?s16 s8 ?s16 ?s16';
const CH_FILL = '(tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 !{k(slapstick)}8 r8 !{kx}8 r8';
const ch8 = () => [CH_IN, ...rep(CH, 6), CH_FILL];

/** The presidential tattoo. */
const POMP = '!s8 ?s16 ?s16 s8 ?s8 !s8 ?s16 ?s16 s8 s8';
const POMP_IN = '!{kx}8 ?s16 ?s16 s8 ?s8 !s8 ?s16 ?s16 s8 s8';
const pomp8 = () => [POMP_IN, ...rep(POMP, 6), ROLL];

const TAMB = 'j8 ?j8 !j8 ?j8 j8 ?j8 !j8 ?j8';

/** A timpani roll up into the next bar. */
const roll = (n: string) => `o2 _v40 [${n}32]8 _v60 [${n}32]8 _v85 [${n}32]8 _v110 [${n}32]8`;

const LEADS = ['leadA', 'leadB', 'leadC'];
const each = (inst: string) => Object.fromEntries(LEADS.map(k => [k, inst]));

export const LAND_CARTOON: Song = {
  title: 'Tune In Next Week',
  bpm: 142,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.8,
  delay: { beats: 0.75, feedback: 0.22, tone: 3000 },
  parts: {
    // The tune, in three parts so each section can voice each part of it its own way
    leadA: { inst: 'trumpet', tr: TR, pan: 0.05, rev: 0.22, dly: 0.08, mml: join(['_v105'], FANFARE, ['_v100'], HOOK_A1, ['_v108'], HOOK_A2, rest(16)) },
    leadB: { inst: 'strings', tr: TR, pan: 0.1, rev: 0.32, mml: join(rest(20), ['_v100'], MEL_B, rest(8)) },
    leadC: { inst: 'xylophone', tr: TR, pan: 0.15, rev: 0.25, dly: 0.1, mml: join(rest(28), ['_v105 q5'], MEL_C) },
    // (the glockenspiel an octave over the second hook and the bridge)
    dbl: { inst: 'glock', tr: TR, pan: 0.35, rev: 0.35, dly: 0.12, vol: 0.4, mml: join(rest(12), ['_v80'], up(HOOK_A2), up(MEL_B), rest(8)) },
    counter: { inst: 'horn', tr: TR, pan: -0.3, rev: 0.32, vol: 0.55, mml: join(rest(4), ['_v85'], COUNTER) },
    pad: { inst: 'strings', tr: TR, pan: -0.1, rev: 0.4, vol: 0.32, mml: join(['_v80'], pads(INTRO), ['_v70'], pads(A1), pads(A2), ['_v78'], pads(B), ['_v68'], pads(C)) },
    comp: { inst: 'piano', tr: TR, pan: 0.25, rev: 0.18, vol: 0.45, mml: join(['q4 _v80'], rest(4), offs(LOOP)) },
    bass: { inst: 'bass', tr: TR, pan: 0, rev: 0.06, vol: 0.85, mml: join(['q6 _v105'], bars(INTRO.slice(0, 2), (c) => `${nt(R[c][0], '4')} r4 ${nt(R[c][0], '4')} r4`), [`${nt('2a-', '2')} ${nt('2e-', '2')}`, `${nt('2g', '4')} ${nt('2b', '4')} ${nt('3d', '4')} ${nt('3f', '4')}`], bounce(LOOP)) },
    gtr: { inst: 'powerchord', tr: TR, pan: -0.35, rev: 0.1, vol: 0.5, only: ['main', 'whitehouse1', 'whitehouse2', 'bigkid'], mml: join(['_v95'], ['o2 g4 r2.', 'o2 g4 r2.', 'o2 a-1', 'o2 g1'], power(LOOP)) },
    brass: {
      inst: 'brass', tr: TR, pan: 0.2, rev: 0.28, vol: 0.5,
      mml: join(
        ['_v100'], [`${chord(V.G7sus, '8')} ${chord(V.G7sus, '8')} r8 ${chord(V.G7sus, '8')} ${chord(V.C, '4')} r4`, `${chord(V.G7sus, '8')} ${chord(V.G7sus, '8')} r8 ${chord(V.G7sus, '8')} ${chord(V.Dm7, '4')} r4`, `_e50 _e127/1 ${chord(V.Ab7, '1')}`, `${chord(V.G7, '8')} r8 r2.`],
        ['_v95'], stabs(A1), stabs(A2), ['_v70'], pads(B), ['_v95 q4'], sneak(C), ['q7'],
      ),
    },
    // (a major chord on the note: G, A-flat; the downbeats; the E of the E7, the G)
    hits: {
      inst: 'orchstab', tr: TR, pan: 0, rev: 0.3, vol: 0.5, only: ['main', 'whitehouse1', 'whitehouse2', 'itchy', 'tv'],
      mml: join(['_v100'], ['o4 g8 r8 r2.', 'r1', 'o4 a-4 r2.', 'o4 g4 r2.'], ['o4 c4 r2.'], rest(7), ['o4 c4 r2.'], rest(7), ['o4 e-4 r2.'], rest(7), rest(3), ['o4 e4 r2.'], rest(3), ['o4 r2 g4 r4']),
    },
    timp: {
      inst: 'timpani', tr: TR, pan: -0.15, rev: 0.3, vol: 0.55, only: ['main', 'whitehouse1', 'whitehouse2', 'itchy', 'tv'],
      mml: join(['_v100'], ['o2 g4 r2.', 'o2 g4 r2.', 'o2 a-4 r2.', roll('g')], ['_v105 o2 c4 r2.'], rest(6), ['o2 r2 g4 g4'], ['o2 c4 r2.'], rest(6), [roll('b-')], ['o2 e-4 r2.'], rest(6), ['o2 r2 g4 g4'], ['o2 a4 r2.', 'r1', 'r1', 'o2 e4 r2.', 'o2 a4 r2.', 'r1', 'r1', roll('g')]),
    },
    run: { inst: 'xylophone', tr: TR, pan: 0.3, rev: 0.2, vol: 0.42, only: ['itchy'], mml: join(['_v90 q6'], runs(ALL)) },
    smear: { inst: 'trombone', tr: TR, pan: -0.25, rev: 0.25, vol: 0.55, only: ['kiddie', 'itchy'], mml: join(['_v100'], smears(ALL)) },
    // (the bare soundstage: the tritone under the key, swelling and sinking two bars at a time)
    sour: { inst: 'cello', tr: TR, pan: -0.15, rev: 0.5, vol: 0.7, only: ['real', 'down'], mml: join(['_v80'], Array.from({ length: 18 }, (_, i) => (i % 2 ? '_e100 _e35/1^1 o3 f+1^1' : '_e35 _e100/1^1 o3 f+1^1'))) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.75, only: ['main', 'whitehouse1', 'whitehouse2'], mml: join(['_v105'], KIT_INTRO, ['_v100'], sec8(ROCK), sec8(ROCK), ['_v90'], sec8(RIDE), ['_v105'], sec8(DRIVE, FILL_TOP)) },
    punk: { inst: 'kick', drums: true, rev: 0.1, vol: 0.75, only: ['bigkid'], mml: join(['_v105'], KIT_INTRO, ['_v100'], sec8(POLKA), sec8(POLKA), sec8(ROCK), sec8(HALF, FILL_TOP)) },
    dm: { inst: 'kick', drums: true, kit: '808', rev: 0.15, vol: 0.6, only: ['studio'], mml: join(['_v95'], ['r1', 'r1', 'r1', DM_FILL], dm8(DM), dm8(DM), ['_v85'], dm8(DM_B), ['_v95'], dm8(DM_C)) },
    sitcom: { inst: 'kick', drums: true, rev: 0.2, vol: 0.55, only: ['amphi'], mml: join(['_v80'], ['r1', 'r1', 'r1', SIT_FILL], sit8(), sit8(), sit8(), sit8()) },
    kidPerc: { inst: 'bassdrum', drums: true, kit: 'orchestra', pan: 0.15, rev: 0.25, vol: 0.5, only: ['kiddie'], mml: join(['_v90'], ['(triangle)4 r2.', 'r1', '(triangle)4 r2.', 'r2 (slapstick)4 r4'], kid8(), kid8(), kid8(), kid8()) },
    chase: { inst: 'snare', drums: true, rev: 0.15, vol: 0.6, only: ['itchy'], mml: join(['_v100'], KIT_INTRO, ch8(), ch8(), ch8(), ch8()) },
    pomp: { inst: 'snare', drums: true, pan: 0.1, rev: 0.25, vol: 0.5, only: ['whitehouse2', 'tv'], mml: join(['_v90'], ['r1', 'r1', ROLL, ROLL], pomp8(), pomp8(), pomp8(), pomp8()) },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.15, vol: 0.45, only: ['main', 'whitehouse1', 'whitehouse2', 'bigkid'], mml: join(['_v80'], rest(4), rep(TAMB, 32)) },
  },
  arrangements: {
    main: {},
    whitehouse1: {},
    whitehouse2: { inst: { counter: 'choir' }, vol: { counter: 0.5, kit: 0.65 } },
    kiddie: {
      mute: ['pad', 'brass'],
      inst: { leadA: 'clarinet', leadB: 'flute', leadC: 'oboe', comp: 'pizz', bass: 'tuba' },
      vol: { dbl: 0.5, comp: 0.6, counter: 0.4, bass: 0.8 },
      rev: { leadA: 0.3, leadB: 0.35, leadC: 0.3 },
      level: 0.9,
    },
    studio: {
      mute: ['dbl', 'counter'],
      inst: { ...each('fmpiano'), pad: 'pwm', comp: 'cleangtr', bass: 'slapbass', brass: 'synthbrass' },
      vol: { pad: 0.4, comp: 0.35, brass: 0.4, bass: 0.75 },
      rev: { leadA: 0.3, leadB: 0.3, leadC: 0.3 },
      level: 0.8,
    },
    real: {
      solo: [...LEADS, 'pad', 'sour'],
      inst: { ...each('celesta'), pad: 'warmpad' },
      vol: { pad: 0.3, leadA: 0.7, leadB: 0.7, leadC: 0.7 },
      rev: { leadA: 0.6, leadB: 0.6, leadC: 0.6 },
      lowpass: 1600,
      level: 0.55,
    },
    tv: {
      mute: ['comp'],
      inst: { leadB: 'trumpet', leadC: 'trumpet', pad: 'brass', bass: 'tuba' },
      vol: { pad: 0.4, hits: 0.6, timp: 0.7 },
      lowpass: 2600,
      level: 0.8,
    },
    judder: {
      solo: [...LEADS, 'bass', 'pad'],
      inst: { ...each('theremin'), bass: 'upright', pad: 'warmpad' },
      vol: { pad: 0.35, bass: 0.6 },
      lowpass: 900,
      level: 0.5,
    },
    down: { solo: ['sour', 'pad'], inst: { pad: 'warmpad' }, vol: { pad: 0.3 }, lowpass: 1000, level: 0.45 },
    bigkid: {
      mute: ['dbl', 'pad'],
      inst: { leadA: 'sax', leadB: 'trumpet', leadC: 'overdrive', counter: 'trombone', comp: 'organ' },
      vol: { counter: 0.6, comp: 0.5, gtr: 0.6, brass: 0.55 },
    },
    itchy: {
      mute: ['dbl', 'pad', 'counter'],
      inst: { leadA: 'mutetrumpet', leadB: 'strings', leadC: 'clarinet', comp: 'pizz', bass: 'tuba' },
      vol: { comp: 0.55, brass: 0.6, hits: 0.6, bass: 0.8 },
    },
    amphi: {
      mute: ['dbl', 'comp', 'brass'],
      inst: { ...each('sax'), counter: 'oohs', pad: 'epiano', bass: 'bass' },
      vol: { counter: 0.35, pad: 0.55, bass: 0.7, leadA: 0.85, leadB: 0.85, leadC: 0.85 },
      rev: { leadA: 0.42, leadB: 0.42, leadC: 0.42 },
      level: 0.75,
    },
    empty: {
      solo: [...LEADS, 'pad'],
      inst: { ...each('epiano'), pad: 'warmpad' },
      vol: { pad: 0.3 },
      rev: { leadA: 0.6, leadB: 0.6, leadC: 0.6 },
      lowpass: 1500,
      level: 0.45,
    },
    cutscene: {
      solo: [...LEADS, 'pad', 'bass'],
      inst: { ...each('vibes'), pad: 'slowstrings', bass: 'upright' },
      vol: { pad: 0.5, bass: 0.55 },
      rev: { leadA: 0.4, leadB: 0.4, leadC: 0.4 },
      level: 0.7,
    },
  },
};
