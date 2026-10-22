// Disaster: The Ride, laid out (x from the section's start, heights up from the ground line). Indoors, one building:
//
//   0      In from the backlot (the ride's doors; back out them to the lot).
//   200    CHECKPOINT. THE QUEUE: the lobby, WAIT FROM HERE: 90 MINUTES, switchbacks of guests behind the ropes (shove
//          through, over the rails), the monitors' truss, the LAVA NACHOS counter. An usher, alone; an effects tech,
//          alone.
//   1900   CHECKPOINT. THE PRE-SHOW: CHIP CHADWICK on the big TV, very excited (a tape, looping). Twisty the tornado
//          mascot, alone.
//   2650   CHECKPOINT. THE THEATER: a big room, a big screen, lean rails, the guests standing about; the effects under
//          the screen (a space heater and a red gel, a desk fan, the AC, a squirt nozzle, a fog machine). The narrator's
//          loop. The ride's staff, all of them. Up: road cases, the truss, the left catwalk; the FLYING COW's stunt
//          wire (the tornado scene's cow) over the screen to the right catwalk; the CONTROL BOOTH on it, its sleeper,
//          its lever: REAL DISASTERS (EXPERIMENTAL).
//   5300   The far wall (till the lever: then it's gone, out flat on the lot). Past it, the backlot, every disaster
//          at once; CHECKPOINT; on to the havoc.

import { SECTIONS, GY } from '../geometry';
import type { StuntWire } from '../section';
import type { HandLever } from '../lever';

export const { x0, x1 } = SECTIONS.disaster;
export { GY };
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
export const R = (x: number) => x - x0;
export const HANDS = 80;

/** The rooms: the lobby (and the queue), the pre-show, the theater; past the far wall, outside. */
export const LOBBY = { a: 0, b: 1900, ceil: 330 } as const;
export const PRESHOW = { a: 1900, b: 2650, ceil: 330, tv: 2280 } as const;
export const THEATER = { a: 2650, b: 5300, ceil: 620 } as const;
/** The wall between the pre-show and the theater (art only): its half thickness about THEATER.a. */
export const DOOR_HALF = 14;
/** The far wall (solid till the lever's flipped and it's gone). */
export const FAR_WALL = THEATER.b;

/** The big screen on the theater's back wall. */
export const SCREEN = { a: 3550, b: 4650, lo: 110, hi: 390 } as const;
/** The effects, under the screen (rx): the heater (and its red gel), the fan, the AC, the squirt nozzle, the fogger. */
export const FX = { heater: 3620, fan: 3840, ac: 4080, squirt: 4300, fog: 4520 } as const;
/** The catwalks (rx from, to; height), the booth on the right one, its lever. */
export const CAT_L = { a: 2900, b: 3680, h: 420 } as const;
export const CAT_R = { a: 4470, b: 5260, h: 420 } as const;
export const BOOTH = { cab: 4930, b: 5240, lever: 4800 } as const;
/** The booth's lever itself (../lever.ts, the coaster's haul): its pivot on the balcony, the grip, its throws
 *  (SIMULATED to REAL), him square behind it. */
export const REAL_LEVER: HandLever = { x: X(BOOTH.lever), y: Y(CAT_R.h) - 12, len: 60, from: -0.7, to: 0.7, stand: 0 };
/** The tornado scene's cow, hung off the ceiling by the wire's start (decor; it goes in REAL DISASTERS). */
export const COW_AT = { x: 3420, h: 520 } as const;

/** The queue's rails (rx), each RAIL_H tall: the switchbacks, hopped over (the guests between them). */
export const RAIL_H = 34;
export const QUEUE_RAILS = [520, 700, 880, 1060, 1240];
/** The theater's lean rails (rx). */
export const LEAN_RAILS = [3300, 4300];
/** The queue's guests: [rx, seed]. */
export const GUESTS: [number, number][] = [[570, 811], [620, 834], [760, 857], [820, 872], [940, 893], [1000, 915], [1120, 936], [1180, 951], [1300, 977], [1350, 990]];
/** The theater's guests (scenery, standing about watching): [rx, seed]. */
export const WATCHERS: [number, number][] = [[2880, 1201], [3010, 1217], [3460, 1233], [3700, 1249], [3770, 1265], [3990, 1281], [4170, 1297], [4390, 1313], [4630, 1329], [4900, 1345], [5100, 1361]];
/** The pre-show's guests: [rx, seed]. */
export const PRESHOW_WATCHERS: [number, number][] = [[2080, 1402], [2150, 1419], [2390, 1436], [2520, 1453]];

export const GROUND: [number, number][] = [[-200, 6200]];
export type SolidWhat = 'rail' | 'counter' | 'cases' | 'lean';
export const SOLIDS: [number, number, number, SolidWhat][] = [
  ...QUEUE_RAILS.map(rx => [rx - 5, RAIL_H, 10, 'rail'] as [number, number, number, SolidWhat]),
  [1560, 60, 150, 'counter'],
  [2780, 90, 110, 'cases'],
  ...LEAN_RAILS.map(rx => [rx - 60, 32, 120, 'lean'] as [number, number, number, SolidWhat]),
];
export type LedgeWhat = 'gantry' | 'truss' | 'catwalk';
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [760, 140, 200, 'gantry'],
  [2940, 200, 130, 'truss'],
  [2770, 310, 130, 'truss'],
  [CAT_L.a, CAT_L.h, CAT_L.b - CAT_L.a, 'catwalk'],
  [CAT_R.a, CAT_R.h, CAT_R.b - CAT_R.a, 'catwalk'],
];

/** The stunt wires (keep the order): the FLYING COW's rig, left catwalk to right, over the screen. */
export const WIRES: StuntWire[] = [
  { from: { x: X(CAT_L.b - 30), y: Y(CAT_L.h) - HANDS }, to: { x: X(CAT_R.a + 40), y: Y(CAT_R.h) }, rigY: Y(565), speed: 5 },
];

export type DisasterKind = 'm2:hwd_usher' | 'm2:hwd_tech' | 'm2:hwd_twisty';
/** Everybody (the theater's lot only before the lever: after it, they're all dead). */
export const ENEMIES: [DisasterKind, number, number][] = [
  // the queue: an usher, alone, among the switchbacks; a tech, alone, up on the LAVA NACHOS counter with the health
  // (fogging down the queue at him: up onto it, or shoot it off)
  ['m2:hwd_usher', 1150, 0], ['m2:hwd_tech', 1620, 60],
  // the pre-show: Twisty, alone
  ['m2:hwd_twisty', 2470, 0],
];
export const THEATER_ENEMIES: [DisasterKind, number, number][] = [
  // (an usher up on the high truss, on the way up to the catwalk: the climb's his; the rest on the floor under the wire)
  ['m2:hwd_usher', 2840, 310], ['m2:hwd_tech', 3480, 0], ['m2:hwd_twisty', 3980, 0], ['m2:hwd_usher', 4500, 0],
  ['m2:hwd_tech', 3250, CAT_L.h], ['m2:hwd_usher', 4640, CAT_R.h],
];
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1630, 60, 'small_health'],
  [2830, 310, 'small_ammo'],
];

/** The PA's horns (rx): the lobby's and the pre-show's. */
export const HORNS = [640, 1400, 2000];

export const CHECKPOINTS = [
  { name: 'DISASTER: THE RIDE', cp: 40, x: X(200), y: GY },
  { name: 'THE PRE-SHOW', cp: 41, x: X(1960), y: GY },
  { name: 'THE THEATER', cp: 42, x: X(2720), y: GY },
  { name: 'REAL DISASTERS', cp: 43, x: X(5480), y: GY },
];
