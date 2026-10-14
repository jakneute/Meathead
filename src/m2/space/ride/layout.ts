// The ride's track: where the rail runs (and the gaps), each act, the obstacles along it, the PA's cues, the breaker,
// the brake run and the station at the end (shared by the section's running, index.ts, and its painting, art.ts).
//
// The track's a circuit: its last stretch is a steep drop down into the load station (seen from the start, the brake
// zone at the bottom of it; ridden at the end, with no brakes).
//
//   ACT 1  R+0..6200       the dark ride, slow: the narrated scenes of 2010. A satellite hung low (duck), the track not
//                          built yet (jump), a cardboard Martian on the rail (the space blaster's taught: blast it),
//                          Robo-Butler's trolley (jump) and tray (duck), another gap, another satellite, another Martian
//   LIFT   R+6200..7800    the chain lift up into the dome, slow: a laser band across it, head-high (duck)
//   ACT 2  R+7800..13100   space, fast: a laser tripwire on the rail (jump), gaps, an asteroid lowered onto the track
//                          (blast), a space station module hung low (duck), a laser band (duck)
//   BREAKER R+13100        the sled smashes the MAIN BREAKER: the work lights bang on, bank by bank. It's a warehouse
//   ACT 3  R+13300..14600  the warehouse version, the show dead: workers on the track, the forklift's pallet (jump), a
//                          stack of snack cases on the rail (blast)
//   BRAKES R+14600..14950  the brake run (a scene from here): the fins grab, he blasts the brake box, they're gone
//   DROP   R+14950..15300  the last drop, no brakes, impossibly fast
//   STATION R+15300..16000 back into the load station; everybody on the track flattened; the sled in front; the launch
//
// Every obstacle's beaten one way, shown by its cue (a glowing arrow: up jump, down duck; a crosshair: blast), and
// tested against him rail-relative (tricks.ts) so a slope's no different from the flat.

import type { GameState } from '../../../m1/game/core/state';
import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.ride;
export const R = x0;

export const RUNS: [number, number, number, number][] = [
  [0, 2350, 0, 0],
  [2470, 3700, 0, -60],
  [3700, 4700, -60, -60],
  [4830, 6200, -60, 0],
  [6200, 7800, 0, -900],      // the lift
  [7800, 8100, -900, -900],   // the crest
  [8100, 8800, -900, -500],   // the first drop
  [8800, 9600, -500, -500],
  [9780, 10500, -500, -620],
  [10500, 11200, -620, -620],
  [11200, 11800, -620, -300], // the second drop
  [11980, 13300, -300, -300], // (the breaker at 13100)
  [13300, 13700, -300, -420], // the warehouse, up to the brake run
  [13700, 14950, -420, -420], // (the brake run from 14600)
  [14950, 15300, -420, 0],    // the last drop
  [15300, 16000, 0, 0],       // the station
].map(([a, b, ya, yb]) => [R + a, R + b, GY + ya, GY + yb]);

export const LIFT_X0 = R + 6200, LIFT_X1 = R + 7800, ACT2_X = R + 7800;
export const BREAKER_X = R + 13100, ACT3_X = R + 13300;
/** The brake run: the scene from BRAKE_AT; the fins along the rail; the brake box beside it; the crest; the drop. */
export const BRAKE_AT = R + 14600, FINS_X0 = R + 14640, FINS_X1 = R + 14900, BRAKE_X = R + 14780, CREST_X = R + 14950;
export const STATION_X0 = R + 15300, STATION_X1 = R + 16000;
/** The sled in front, loading at the platform (he rams it). */
export const FRONT_AT = R + 15720;
/** The station's roof (they go up through it). */
export const STATION_ROOF = GY - 330;

/** How fast it goes, by where (px a frame). The ride sets the pace: he can't hurry it or hold it back. */
export const speedAt = (x: number) => {
  if (x < R + 600) return 2.6;
  if (x < LIFT_X0) return 4.3;
  if (x < LIFT_X1) return 2.6;
  if (x < BREAKER_X) return 7.6;
  return 6.6;
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles: each beaten one way (`verb`). Gaps are the RUNS' gaps (jump), cued the same.
//   duck   sat (a satellite / a station module hung low), beam (a laser band, head-high, off a housing to the ceiling),
//          tray (Robo-Butler's tray swung out, head-high)
//   jump   trolley (Robo-Butler's meal trolley shoved onto the rail), wire (a laser tripwire at the rim), pallet (the
//          forklift's, across the rail)
//   blast  martian (a cardboard Martian cutout stood on the rail), rock (an asteroid prop lowered onto the track on its
//          cable), crates (a stack of snack cases on a pallet on the rail)

export type Verb = 'duck' | 'jump' | 'blast';
export type ObKind = 'sat' | 'beam' | 'tray' | 'trolley' | 'wire' | 'pallet' | 'martian' | 'rock' | 'crates';
export interface Ob { x: number; kind: ObKind; verb: Verb; hp: number; show: boolean }
const VERB: Record<ObKind, Verb> = { sat: 'duck', beam: 'duck', tray: 'duck', trolley: 'jump', wire: 'jump', pallet: 'jump', martian: 'blast', rock: 'blast', crates: 'blast' };
/** (blast: how much it takes; the space blaster's bolt does 25) */
const HP: Partial<Record<ObKind, number>> = { martian: 25, rock: 50, crates: 50 };
/** (the show's: dead once the breaker's gone, i.e. on a second ride, the warehouse version) */
const SHOWS: ObKind[] = ['tray', 'trolley', 'wire', 'beam', 'martian', 'rock'];
export const OBS: Ob[] = ([
  [1500, 'sat'], [3000, 'martian'], [3600, 'trolley'], [4250, 'tray'], [5400, 'sat'], [5850, 'martian'],
  [7000, 'beam'],
  [8950, 'wire'], [10250, 'rock'], [10900, 'sat'], [12450, 'beam'],
  [13950, 'pallet'], [14400, 'crates'],
] as [number, ObKind][]).map(([x, kind]) => ({ x: R + x, kind, verb: VERB[kind], hp: HP[kind] ?? 0, show: SHOWS.includes(kind) }));
/** The gaps: [where the rail stops, where it starts again]. */
export const GAPS: [number, number][] = RUNS.flatMap((r, i) => (RUNS[i + 1] && RUNS[i + 1][0] - r[1] > 20 ? [[r[1], RUNS[i + 1][0]] as [number, number]] : []));

/** Every cue, in order along the track: its obstacle's x (a gap: its near edge) and how it's beaten. */
export interface Cue { x: number; verb: Verb; ob: number }
export const CUES: Cue[] = [...OBS.map((o, i) => ({ x: o.x, verb: o.verb, ob: i })), ...GAPS.map(([a]) => ({ x: a, verb: 'jump' as Verb, ob: -1 }))].sort((a, b) => a.x - b.x);
/** Where each cue's arrow stands: about a second ahead of what it's about at the speed there, never back past the cue
 *  (or the obstacle) before it, never over a gap. */
export const cueX = (i: number) => {
  const q = CUES[i], lead = Math.max(260, speedAt(q.x - 200) * 58);
  let x = q.x - lead;
  if (i > 0) x = Math.max(x, CUES[i - 1].x + 110);
  for (const [a, b] of GAPS) if (x > a - 40 && x < b + 40) x = b + 40;
  return x;
};
export const CUE_XS = CUES.map((_, i) => cueX(i));

/** Workers on the track (the warehouse's, and a stagehand or two crossing in the dark): [x, in a hi-vis vest]. */
export const WORKERS: [number, number][] = [[3230, 0], [4990, 0], [13450, 1], [13680, 1]].map(([x, v]) => [R + x, v]);
/** The people on the track in the station (the bottom of the drop on): flattened by the runaway. */
export const STATION_FOLK: { x: number; outfit: 'hand' | 'worker' | 'guest'; seed: number; paddle?: boolean }[] = [
  { x: R + 15335, outfit: 'hand', seed: 7301, paddle: true },
  { x: R + 15395, outfit: 'worker', seed: 7402 },
  { x: R + 15450, outfit: 'guest', seed: 7517 },
  { x: R + 15482, outfit: 'guest', seed: 7633 },
  { x: R + 15540, outfit: 'hand', seed: 7741 },
];
/** The narrated scenes of 2010 (act 1), along the track: home, office, traffic, the moon. */
export const TABLEAU_XS = [1100, 2800, 4100, 5200].map(x => R + x);

/** Where it is along the ride, for the PA: its stories, by where they're cued. */
export const PA_CUES: [string, number][] = [
  ['welcome', R + 40], ['blaster', R + 1100], ['home', R + 1700], ['office', R + 3300], ['cars', R + 4500],
  ['lift', LIFT_X0], ['crest', R + 7700], ['space1', R + 8500], ['space2', R + 10900], ['station', R + 13550],
];

export const runAt = (x: number) => RUNS.find(r => x >= r[0] && x <= r[1]);
export const trackY = (x: number): number | null => { const r = runAt(x); return r ? r[2] + ((x - r[0]) / (r[1] - r[0])) * (r[3] - r[2]) : null; };
/** The rail's line, across a gap too (straight from one end to the other): what heights are measured from. */
export const railLine = (x: number): number => {
  const y = trackY(x);
  if (y !== null) return y;
  const i = RUNS.findIndex(r => r[0] > x);
  if (i <= 0) return RUNS[RUNS.length - 1][3];
  const a = RUNS[i - 1], b = RUNS[i];
  return a[3] + ((x - a[1]) / (b[0] - a[1])) * (b[2] - a[3]);
};
export const slopeAt = (x: number) => {
  const a = trackY(x - 14), b = trackY(x + 14);
  return a === null || b === null ? null : Math.atan2(b - a, 28);
};

// ---------------------------------------------------------------------------------------------------------------
// What's kept across his deaths (state.stageMemo)

/** The MAIN BREAKER's been smashed: the work lights are on, the show's dead (for good: a revisit rides the warehouse). */
export const BREAKER_MEMO = 'm2:rideBreaker';
/** He's been launched out onto the main drag (the smear's there: drag/'s to draw). */
export const LAUNCHED_MEMO = 'm2:rideLaunched';
export const lightsOn = (state: GameState) => !!state.stageMemo[BREAKER_MEMO];
