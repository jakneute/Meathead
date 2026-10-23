// CARTOON LAND's music (land id 'cartoon'): the land's theme, a version of it for every section and for the White
// House's own moments. Its fights (the five pundits, DAD MAN) are in cartoonBosses.ts.
//
// ---- "TUNE IN NEXT WEEK" (land:cartoon) ----
// A park area frozen in 1994, scored as the theme song of a Saturday morning it never stopped being, played at
// cartoon-chase speed: the hook up the chord with a hiccup on a trumpet (a second trumpet in thirds the second time),
// every bar a secondary dominant pulling to the next (the A7, the D7, the minor iv's sigh), power chords, the bass
// pumping octaves, a sixteenth kit; a bridge that lurches up a minor third into E-flat (the strings and a saw lead
// soaring, the way 90s cartoon themes jump a key to sound expensive); and a sneaky A minor C for the bad guys
// (staccato on a square lead, the leading tone creeping, palm-muted sixteenths). Every section re-orchestrates it (the
// Banjo-Kazooie idea): a chiptune kiddie square, a 1994 corporate tour video in the studio, the show's own theme while
// the projection's up, the same tune gone sour on the bare soundstage after, ska-punk in the big-kid zone, a Carl
// Stalling chase at PUNCHY & KICKY, and a cheap laugh-track sitcom theme for DAD MAN LIVE!.
// Written in C major, played in B-flat (every pitched part tr -2: every key's taken). 176, straight. 36 bars: a 4-bar
// fanfare (once: G7sus - G7sus - Ab7 - G7, the brass's "ta-da-da-DAAA" twice, a snare roll, a tom run), then A1 (C -
// A7 - Dm7 - G7 - Em7 A7 - Dm7 G7 - C A7 - D7 G7), A2 (C - A7 - Dm7 - G7 - C7 - F Fm6 - Dm7 G7 - C Bb7), B (Ebmaj7 -
// Cm7 - Fm7 - Bb7 - Ebmaj7 - Abmaj7 - Dm7b5 - G7), C (Am - Am - F - E7 - Am - Am - D7 - G7).
// ARRANGEMENTS (one per section; the crossfade does the rest as he walks):
//   kiddie       SILLYVILLE SQUARE: the tune as a chiptune (square leads), the bass, the kit, a clav's offbeats
//   studio       LEARN THE MAGIC OF HOW CARTOONS ARE MADE: a 1994 corporate tour video at full tilt: DX FM piano on
//                the tune, a PWM pad, slap bass, clean guitar chicks, synth brass, an 808 with claps and a cowbell
//   whitehouse1  CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES (the projection up): the show's own theme: trumpets,
//   (and main)   strings and a saw lead on the bridge, the square sneak, horns, piano offbeats, power chords, brass
//                stabs, orchestra hits, the kit and a tambourine, timpani
//   whitehouse2  the West Wing: the same, the choir on the counterline, a presidential snare tattoo
//   real         the screen's down: the bare soundstage, the backtrack among the bodies: the tune on a far-off electric
//                piano over a cello holding the tritone, a pad, muffled, quiet
//   tv           the Clintons on the cartoon TV: the theme as a pompous state occasion through a TV speaker
//   judder       the TV snows out, the picture shakes: the tune warbling on a theremin, muffled
//   down         the screen coming down, the cat sliding off him: nothing but the sour cello and a pad
//   bigkid       THE BIG-KID ZONE: ska-punk: alto sax, trumpet, an overdriven guitar on the sneak, a trombone counter,
//                an organ skanking the offbeats, power chords, the polka-punk beat
//   itchy        PUNCHY & KICKY: a Carl Stalling chase at Mega Man speed: harmon trumpet on the hook, a xylophone
//                running sixteenths over everything, brass blats, trombone smears, a galloping snare, the bass pumping
//   amphi        DAD MAN LIVE!: a cheap laugh-track sitcom theme: alto sax over Rhodes, finger bass, oohs, a
//                half-time kit with a sidestick (calmer)
//   empty        the amphitheater after (a revisit): the sitcom theme on a Rhodes, muffled, nobody there
//   cutscene     under a scene: vibes, slow strings, the bass

import type { Song } from '../engine';
import { type Bar, join, rest, rep, pat, pads, harm, scale, sec, troll, g2, cx, nm, tone, KIT, FILL } from './mmkit';

/** Every pitched part's transpose (written in C, heard in B-flat). */
const TR = -2;

const INTRO: Bar[] = ['G7sus', 'G7sus', 'Ab7', 'G7'];
const A1: Bar[] = ['C', 'A7', 'Dm7', 'G7', ['Em7', 'A7'], ['Dm7', 'G7'], ['C', 'A7'], ['D7', 'G7']];
const A2: Bar[] = ['C', 'A7', 'Dm7', 'G7', 'C7', ['F', 'Fm6'], ['Dm7', 'G7'], ['C', 'Bb7']];
const B: Bar[] = ['Ebmaj7', 'Cm7', 'Fm7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'Dm7b5', 'G7'];
const C: Bar[] = ['Am', 'Am', 'F', 'E7', 'Am', 'Am', 'D7', 'G7'];
const LOOP: Bar[] = [...A1, ...A2, ...B, ...C];
const ALL: Bar[] = [...INTRO, ...LOOP];

const FANFARE = ['o5 g8 g8 r8 g8 o6 c4 r4', 'o5 a8 a8 r8 a8 o6 d4 r4', 'o6 e-4. c8 o5 a-4 g-4', 'o5 g8 b8 o6 d8 f8 e8 d8 o5 b8 g8'];
const HOOK_A1 = ['o5 c8 d8 e8 g8 r8 e8 g4', 'o5 a4 g8 e8 c+4 e4', 'o5 f8 e8 f8 a8 r8 f8 a4', 'o5 b4 a8 g8 f4 d4', 'o5 e8 g8 b4 a8 g8 e4', 'o5 f8 a8 o6 c4 o5 b8 a8 g4', 'o5 e4 c4 c+4 e4', 'o5 f+4 a4 g4 r4'];
const HOOK_A2 = [...HOOK_A1.slice(0, 4), 'o5 g8 b-8 o6 c8 e8 r8 c8 o5 b-4', 'o5 a4 o6 c4 o5 a-4 f4', 'o5 f4 a4 g4 f4', 'o5 e4 c4 r8 b-8 o6 c8 d8'];
const MEL_B = ['o6 e-2 d4 o5 b-4', 'o5 g2 e-4 g4', 'o5 a-2 g4 f4', 'o5 d2 f4 a-4', 'o5 g4 b-4 o6 e-4 d4', 'o6 c2 o5 a-4 g4', 'o5 a-4 f4 d4 f4', 'o5 g4 b4 o6 d4 f4'];
const MEL_C = ['o5 a8 r8 a8 g+8 a8 r8 e8 r8', 'o5 c8 r8 c8 o4 b8 o5 c8 e8 a4', 'o5 a8 r8 a8 g8 f8 r8 c8 r8', 'o5 g+8 r8 g+8 a8 b8 o6 d8 e4', 'o5 a8 r8 a8 g+8 a8 r8 e8 r8', 'o5 c8 e8 a8 o6 c8 e4 c4', 'o6 d8 c8 o5 a8 f+8 d4 f+4', 'o5 g8 a8 b8 o6 c8 d4 o5 b4'];
const CM = scale('c', 'major');
const HOOK_A2_TWIN = harm(HOOK_A2, [CM, scale('d', 'harmonic'), CM, CM, scale('f', 'major'), scale('c', 'minor'), CM, scale('f', 'major')]);
const COUNTER = [
  'o4 e1', 'o4 e2 g2', 'o4 f1', 'o4 f2 d2', 'o4 g2 e2', 'o4 f1', 'o4 e2 g2', 'o4 f+2 f2',
  'o4 e1', 'o4 e2 g2', 'o4 f1', 'o4 f2 d2', 'o4 b-1', 'o4 a2 a-2', 'o4 a2 g2', 'o4 g2 a-2',
  'o4 g1', 'o4 e-1', 'o4 e-2 c2', 'o4 d1', 'o4 g1', 'o4 g2 e-2', 'o4 f1', 'o4 f1',
  'o4 e1', 'o4 e1', 'o4 f1', 'o4 g+1', 'o4 e1', 'o4 e1', 'o4 f+1', 'o4 f1',
];
const OCT = "B8 B'8 B8 B'8 B8 B'8 B8 B'8";
const SIT = '{kh}8 ?h8 h8 ?h8 {mh}8 ?h8 h8 ?h8';
const CH = '!{ks}8 ?s16 ?s16 s8 ?s16 ?s16 !{ks}8 ?s16 ?s16 s8 ?s16 ?s16';
const POMP = '!s8 ?s16 ?s16 s8 ?s8 !s8 ?s16 ?s16 s8 s8';
const DM = '{kh}8 h8 {ph}8 h8 {kh}8 {kh}8 {ph}8 w8';
const DM_FILL = '{kh}8 h8 {ph}8 h8 t16 t16 t16 t16 u16 u16 u16 u16';
const KIT_IN = ['{kx}8 {ks}8 r8 {ks}8 {kx}4 r4', '{kx}8 {ks}8 r8 {ks}8 {kx}4 r4', FILL.roll, FILL.big];
const LEADS = ['leadA', 'leadB', 'leadC'];
const each = (inst: string) => Object.fromEntries(LEADS.map(k => [k, inst]));

export const LAND_CARTOON: Song = {
  title: 'Tune In Next Week',
  bpm: 176,
  loopFrom: 16,
  reverb: 'plate',
  reverbMix: 0.75,
  delay: { beats: 0.75, feedback: 0.22, tone: 3000 },
  parts: {
    leadA: { inst: 'trumpet', tr: TR, pan: 0.05, rev: 0.2, dly: 0.08, mml: join(['_v110'], FANFARE, ['_v106'], HOOK_A1, ['_v110'], HOOK_A2, rest(16)) },
    twin: { inst: 'trumpet', tr: TR, pan: 0.35, rev: 0.22, vol: 0.48, mml: join(rest(12), ['_v100'], HOOK_A2_TWIN, rest(16)) },
    leadB: { inst: 'strings', tr: TR, pan: 0.1, rev: 0.32, mml: join(rest(20), ['_v106'], MEL_B, rest(8)) },
    sawB: { inst: 'sawlead', tr: TR, pan: -0.15, rev: 0.22, dly: 0.1, vol: 0.45, mml: join(rest(20), ['_v100'], MEL_B, rest(8)) },
    leadC: { inst: 'squarelead', tr: TR, pan: 0.15, rev: 0.2, dly: 0.12, vol: 0.75, mml: join(rest(28), ['_v108 q5'], MEL_C) },
    counter: { inst: 'horn', tr: TR, pan: -0.3, rev: 0.32, vol: 0.45, mml: join(rest(4), ['_v85'], COUNTER) },
    pad: { inst: 'strings', tr: TR, pan: -0.1, rev: 0.4, vol: 0.28, mml: join(['_v80'], pads(INTRO, 55), ['_v68'], pads([...A1, ...A2], 55), ['_v78'], pads(B, 55), ['_v68'], pads(C, 55)) },
    comp: { inst: 'piano', tr: TR, pan: 0.25, rev: 0.15, vol: 0.4, mml: join(['q4 _v85'], rest(4), pat(LOOP, 'r8 X8', 57)) },
    bass: { inst: 'bass', tr: TR, pan: 0, rev: 0.05, vol: 0.82, mml: join(['_v108'], pat(INTRO.slice(0, 2), 'B4 r4 B4 r4', 29), ['o1 a-2 o2 e-2', 'o1 g4 b4 o2 d4 f4'], ['_v100'], pat(LOOP, OCT, 29)) },
    gtr: { inst: 'powerchord', tr: TR, pan: -0.38, rev: 0.1, vol: 0.45, only: ['main', 'whitehouse1', 'whitehouse2', 'bigkid', 'itchy'], mml: join(['_v105'], ['o2 g4 r2.', 'o2 g4 r2.', 'o2 a-1', 'o2 g1'], ['_v100'], pat([...A1, ...A2, ...B], '!R8 R8 R8 !R8 r8 R8 !R8 R8', 41), ['@chug'], pat(C, '!R16 R16 R16 R16', 41), ['@']) },
    brass: {
      inst: 'brass', tr: TR, pan: 0.2, rev: 0.26, vol: 0.48,
      mml: join(['_v104'], [`${cx('G7sus', 60, '8')} ${cx('G7sus', 60, '8')} r8 ${cx('G7sus', 60, '8')} ${cx('C', 60, '4')} r4`, `${cx('G7sus', 60, '8')} ${cx('G7sus', 60, '8')} r8 ${cx('G7sus', 60, '8')} ${cx('Dm7', 60, '4')} r4`, `_e50 _e127/1 ${cx('Ab7', 60, '1')}`, `${cx('G7', 59, '8')} r8 r2.`],
        ['_v98'], [...A1, ...A2].map((b, i) => (i % 2 === 0 ? `${cx(g2(b), 60, '8')} r8 r2.` : `r2 ${cx(g2(b), 60, '8')} ${cx(g2(b), 60, '8')} r4`)), ['_v72'], pads(B, 58), ['_v100 q4'], pat(C, 'r4 X8 r8 r4 X8 r8', 57), ['q7']),
    },
    hits: { inst: 'orchstab', tr: TR, pan: 0, rev: 0.3, vol: 0.45, only: ['main', 'whitehouse1', 'whitehouse2', 'itchy', 'tv'], mml: join(['_v104'], ['o4 g8 r8 r2.', 'r1', 'o4 a-4 r2.', 'o4 g4 r2.'], ['o4 c4 r2.'], rest(7), ['o4 c4 r2.'], rest(7), ['o4 e-4 r2.'], rest(7), rest(3), ['o4 e4 r2.'], rest(3), ['o4 r2 g4 r4']) },
    timp: { inst: 'timpani', tr: TR, pan: -0.15, rev: 0.3, vol: 0.52, only: ['main', 'whitehouse1', 'whitehouse2', 'itchy', 'tv'], mml: join(['_v100'], ['o2 g4 r2.', 'o2 g4 r2.', 'o2 a-4 r2.', troll('o2 g')], ['_v105 o2 c4 r2.'], rest(6), ['o2 r2 g4 g4'], ['o2 c4 r2.'], rest(6), [troll('o2 b-')], ['o2 e-4 r2.'], rest(6), ['o2 r2 g4 g4'], ['o2 a4 r2.', 'r1', 'r1', 'o2 e4 r2.', 'o2 a4 r2.', 'r1', 'r1', troll('o2 g')]) },
    run: { inst: 'xylophone', tr: TR, pan: 0.3, rev: 0.18, vol: 0.38, only: ['itchy'], mml: join(['_v92 q6'], pat(ALL, "!0'16 1'16 2'16 3'16 0''16 3'16 2'16 1'16", 48)) },
    smear: { inst: 'trombone', tr: TR, pan: -0.25, rev: 0.25, vol: 0.52, only: ['itchy', 'bigkid'], mml: join(['_v100'], ALL.map((b, i) => (i % 4 === 3 ? `r2 _b-5/4 ${nm(tone(g2(b), 0, 43), '2')}` : 'r1'))) },
    sour: { inst: 'cello', tr: TR, pan: -0.15, rev: 0.5, vol: 0.7, only: ['real', 'down'], mml: join(['_v80'], Array.from({ length: 18 }, (_, i) => (i % 2 ? '_e100 _e35/1^1 o3 f+1^1' : '_e35 _e100/1^1 o3 f+1^1'))) },
    kit: { inst: 'kick', drums: true, rev: 0.12, vol: 0.72, only: ['main', 'whitehouse1', 'whitehouse2', 'kiddie', 'tv'], mml: join(['_v105'], KIT_IN, ['_v100'], sec(8, KIT.mm, FILL.toms), sec(8, KIT.drive, FILL.snare), ['_v95'], sec(8, KIT.ride, FILL.toms), ['_v105'], sec(8, KIT.mm, FILL.big)) },
    punk: { inst: 'kick', drums: true, rev: 0.1, vol: 0.72, only: ['bigkid'], mml: join(['_v105'], KIT_IN, ['_v100'], sec(8, KIT.punk, FILL.toms), sec(8, KIT.punk, FILL.snare), sec(8, KIT.rock, FILL.toms), sec(8, KIT.half, FILL.big)) },
    dm: { inst: 'kick', drums: true, kit: '808', rev: 0.15, vol: 0.62, only: ['studio'], mml: join(['_v98'], ['r1', 'r1', 'r1', DM_FILL], sec(8, DM, DM_FILL), sec(8, DM, DM_FILL), sec(8, DM, DM_FILL), sec(8, DM, DM_FILL)) },
    sitcom: { inst: 'kick', drums: true, rev: 0.2, vol: 0.55, only: ['amphi'], mml: join(['_v82'], ['r1', 'r1', 'r1', '{kh}8 ?h8 h8 ?h8 (tom2)8 (tom3)8 (tom4)8 r8'], sec(8, SIT, SIT), sec(8, SIT, SIT), sec(8, SIT, SIT), sec(8, SIT, '{kh}8 ?h8 h8 ?h8 (tom2)8 (tom3)8 (tom4)8 r8')) },
    chase: { inst: 'snare', drums: true, rev: 0.15, vol: 0.6, only: ['itchy'], mml: join(['_v102'], KIT_IN, sec(8, CH, FILL.big), sec(8, CH, FILL.toms), sec(8, CH, FILL.big), sec(8, CH, FILL.big)) },
    pomp: { inst: 'snare', drums: true, pan: 0.1, rev: 0.22, vol: 0.45, only: ['whitehouse2', 'tv'], mml: join(['_v90'], ['r1', 'r1', FILL.roll, FILL.roll], rep(POMP, 32)) },
    tamb: { inst: 'tamb', drums: true, pan: 0.3, rev: 0.12, vol: 0.4, only: ['main', 'whitehouse1', 'whitehouse2', 'bigkid'], mml: join(['_v82'], rest(4), rep('j16 ?j16 !j16 ?j16 j16 ?j16 !j16 ?j16 j16 ?j16 !j16 ?j16 j16 ?j16 !j16 ?j16', 32)) },
  },
  arrangements: {
    main: {},
    whitehouse1: {},
    whitehouse2: { inst: { counter: 'choir' }, vol: { counter: 1.1, kit: 0.75 } },
    kiddie: { solo: [...LEADS, 'twin', 'sawB', 'bass', 'kit', 'comp'], inst: { ...each('squarelead'), twin: 'squarelead', comp: 'clav' }, vol: { leadA: 0.75, twin: 0.8, leadB: 0.65, comp: 1.1 }, level: 0.85 },
    studio: { mute: ['counter', 'sawB'], inst: { ...each('fmpiano'), twin: 'fmpiano', pad: 'pwm', comp: 'cleangtr', bass: 'slapbass', brass: 'synthbrass' }, vol: { pad: 1.3, comp: 1.0, brass: 0.9 }, rev: { leadA: 0.28, leadB: 0.28, leadC: 0.28 }, level: 0.85 },
    real: { solo: [...LEADS, 'pad', 'sour'], inst: { ...each('epiano'), pad: 'warmpad' }, vol: { pad: 1.1, leadA: 0.7, leadB: 0.7, leadC: 0.7 }, rev: { leadA: 0.6, leadB: 0.6, leadC: 0.6 }, lowpass: 1600, level: 0.55 },
    tv: { mute: ['comp', 'sawB'], inst: { leadB: 'trumpet', leadC: 'trumpet', pad: 'brass', bass: 'tuba' }, vol: { pad: 1.3, hits: 1.2, timp: 1.3, leadC: 1.1 }, lowpass: 2600, level: 0.8 },
    judder: { solo: [...LEADS, 'bass', 'pad'], inst: { ...each('theremin'), bass: 'upright', pad: 'warmpad' }, vol: { pad: 1.2, bass: 0.6 }, lowpass: 900, level: 0.5 },
    down: { solo: ['sour', 'pad'], inst: { pad: 'warmpad' }, vol: { pad: 1.1 }, lowpass: 1000, level: 0.45 },
    bigkid: { mute: ['pad', 'sawB'], inst: { leadA: 'sax', twin: 'trumpet', leadB: 'trumpet', leadC: 'overdrive', counter: 'trombone', comp: 'organ' }, vol: { counter: 1.2, comp: 1.2, gtr: 1.2, brass: 1.1, leadC: 0.8 } },
    itchy: { mute: ['pad', 'counter'], inst: { leadA: 'mutetrumpet', twin: 'mutetrumpet', leadC: 'mutetrumpet', comp: 'pizz' }, vol: { comp: 1.3, brass: 1.2, hits: 1.3 } },
    amphi: { solo: [...LEADS, 'counter', 'pad', 'bass', 'sitcom'], inst: { ...each('sax'), counter: 'oohs', pad: 'epiano', bass: 'bass' }, vol: { counter: 0.8, pad: 1.8, bass: 0.7, leadA: 0.85, leadB: 0.85, leadC: 0.85 }, rev: { leadA: 0.42, leadB: 0.42, leadC: 0.42 }, level: 0.7 },
    empty: { solo: [...LEADS, 'pad'], inst: { ...each('epiano'), pad: 'warmpad' }, vol: { pad: 1.1 }, rev: { leadA: 0.6, leadB: 0.6, leadC: 0.6 }, lowpass: 1500, level: 0.45 },
    cutscene: { solo: [...LEADS, 'pad', 'bass'], inst: { ...each('vibes'), pad: 'slowstrings', bass: 'upright' }, vol: { pad: 1.6, bass: 0.55 }, rev: { leadA: 0.4, leadB: 0.4, leadC: 0.4 }, level: 0.7 },
  },
};
