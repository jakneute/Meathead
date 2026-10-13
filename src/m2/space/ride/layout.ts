// The ride's track: where the rail runs (and the gaps), each act, the tricks along it, the PA's cues, the breaker, the
// brake run and the station at the end (shared by the section's running, index.ts, and its painting, art.ts).
//
//   ACT 1  R+0..6200       the dark ride, slow: the narrated scenes of 2010 (home, office, traffic, the moon).
//                          Satellites hung low (duck), Robo-Butler's tray across the track (rim-high: jump; head-high:
//                          duck), the track not built yet (jump the gap)
//   LIFT   R+6200..7800    the chain lift up into the dome, slow whatever's pressed; the first laser curtain
//   ACT 2  R+7800..13100   space, fast: the drops, the laser curtains (on and off: time them; a band: duck or jump),
//                          meteors lowered onto the track, a rocket's exhaust blasting down across it, gaps
//   BREAKER R+13100        the sled smashes the MAIN BREAKER: the work lights bang on, bank by bank. It's a warehouse
//   ACT 3  R+13300..14960  the warehouse version, the show dead: workers on the track, a forklift with a pallet,
//                          the meteor on a hand hoist, a gap
//   BRAKES R+14960..15300  the brake run: he goes through the brake controls (a scene from here)
//   STATION R+15300..16000 back into the station where he started; the sled in front, loading; the ram, the launch

import type { GameState } from '../../../m1/game/core/state';
import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.ride;
export const R = x0;

export const RUNS: [number, number, number, number][] = [
  [0, 2350, 0, 0],
  [2490, 3700, 0, -60],
  [3700, 4700, -60, -60],
  [4860, 6200, -60, 0],
  [6200, 7800, 0, -900],      // the lift
  [7800, 8100, -900, -900],   // the crest
  [8100, 8800, -900, -500],   // the first drop
  [8800, 9600, -500, -500],
  [9780, 10500, -500, -620],
  [10500, 11200, -620, -620],
  [11200, 11800, -620, -300], // the second drop
  [11980, 13300, -300, -300], // (the breaker at 13100)
  [13300, 14000, -300, -100], // the warehouse
  [14000, 14800, -100, -100],
  [14960, 16000, -100, 0],    // the brake run, the station
].map(([a, b, ya, yb]) => [R + a, R + b, GY + ya, GY + yb]);

export const LIFT_X0 = R + 6200, LIFT_X1 = R + 7800, ACT2_X = R + 7800;
export const BREAKER_X = R + 13100, ACT3_X = R + 13300;
export const BRAKE_AT = R + 14990, BRAKE_X = R + 15150;
export const STATION_X0 = R + 15300, STATION_X1 = R + 16000;
/** The sled in front, loading at the platform (he rams it). */
export const FRONT_AT = R + 15720;
/** The station's roof (they go up through it). */
export const STATION_ROOF = GY - 330;

/** How fast it goes, by where (px a frame): left alone, on a bit (right), held back (left). */
export const speedAt = (x: number, right: boolean, left: boolean) => {
  if (x < R + 600) return right ? 3.4 : 2.6;
  if (x < LIFT_X0) return right ? 5.6 : left ? 3.2 : 4.3;
  if (x < LIFT_X1) return 2.6;
  if (x < BREAKER_X) return right ? 9.6 : left ? 5.4 : 7.6;
  return right ? 8.4 : left ? 4.8 : 6.6;
};

// ---------------------------------------------------------------------------------------------------------------
// The tricks

/** Satellites (and in the warehouse, a ladder's crossbar), hung low over the track: duck. */
export const SATELLITES = [1500, 3300, 5400, 13700].map(x => R + x);
/** Robo-Butler, beside the track: the tray across it (rim-high: jump; head-high: duck). */
export const BUTLERS: { x: number; high: boolean }[] = [{ x: 2950, high: false }, { x: 4250, high: true }, { x: 5850, high: false }].map(b => ({ ...b, x: R + b.x }));
/** Laser curtains: `kind` full (on and off: get through while it's off), high (a band at head height: duck), low (a band
 *  at the rim: jump). */
export const LASERS: { x: number; kind: 'full' | 'high' | 'low'; phase: number }[] = ([
  { x: 7100, kind: 'high', phase: 0 }, { x: 9150, kind: 'low', phase: 0 }, { x: 9450, kind: 'full', phase: 0 },
  { x: 10300, kind: 'full', phase: 50 }, { x: 12450, kind: 'high', phase: 0 }, { x: 12800, kind: 'full', phase: 30 },
] as { x: number; kind: 'full' | 'high' | 'low'; phase: number }[]).map(l => ({ ...l, x: R + l.x }));
export const LASER_CYCLE = 110, LASER_ON = 46, LASER_TELL = 26;
/** Meteors lowered onto the track as it comes (sat there a moment, then hauled up): jump one sat there, or time it. */
export const METEORS = [10050, 11000, 12250, 14350].map(x => R + x);
/** A rocket hung nose-up over the track, its exhaust down across it on a cycle: time it. */
export const ROCKETS: { x: number; phase: number }[] = [{ x: 10850, phase: 0 }, { x: 12650, phase: 60 }].map(r => ({ ...r, x: R + r.x }));
export const ROCKET_CYCLE = 120, ROCKET_ON = 44, ROCKET_TELL = 30;
/** The forklift, its pallet across the track at the rim: jump it. */
export const FORKLIFT_X = R + 13950;
/** Workers on the track (the warehouse's, and a stagehand or two crossing in the dark): [x, in a hi-vis vest]. */
export const WORKERS: [number, number][] = [[3450, 0], [5600, 0], [13480, 1], [14150, 1], [14600, 1]].map(([x, v]) => [R + x, v]);

/** Where it is along the ride, for the PA: its stories, by where they're cued. */
export const PA_CUES: [string, number][] = [
  ['welcome', R + 40], ['home', R + 900], ['office', R + 2600], ['cars', R + 3900], ['moon', R + 5000],
  ['lift', LIFT_X0], ['crest', R + 7700], ['space1', R + 8500], ['space2', R + 10900], ['station', R + 13550], ['end', R + 14500],
];

export const runAt = (x: number) => RUNS.find(r => x >= r[0] && x <= r[1]);
export const trackY = (x: number): number | null => { const r = runAt(x); return r ? r[2] + ((x - r[0]) / (r[1] - r[0])) * (r[3] - r[2]) : null; };
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
