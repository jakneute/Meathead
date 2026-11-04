// The water park, level 1: where everything is (pure data, world space; GY the ground). Read it left to right:
//
//   THE GATE        in through the gate he kicked down (endgame/lot), past the smashed ticket booths
//   LIL SQUIRT      the first slide: a kiddie one over solid ground (the slide taught: ride it, it throws you)
//   THE TWISTER     a bigger one, and a blast crater past its end too wide to jump: the launch clears it cleanly (a
//                   jump and a charge just about does, risky)
//   THE LAGOON      a pool to swim; THE LAZY RIVER, its current shoving him back
//   THE KAMIKAZE    the tall one: over a sinkhole onto an island, and off the island's own little slide over another
//   THE BLACK HOLE  the first tube ride: down a long chute on an inner tube over the drained DEEP END, aliens shooting,
//                   the chute broken in places (the tube jumps the gaps; jump yourself at the wrong moment and you don't)
//   THE SPLASHDOWN  the middle of the plaza; THE WIPEOUT, two slides back to back over two craters
//   THE ABYSS       the second tube ride, longer and meaner
//   BASE CAMP       the foot of MOUNT EVEREST BUT BETTER, and up it: seven floors of scaffold to fight up, one at a time
//                   (locked in till the floor's clear), a refill landing (THE HILLARY STEP), THE SUMMIT (the kid)
//   THE DESCENT     the slide all the way back down, off the summit to a splash pool (no input: a set piece)
//   LEVEL 2         (a stub: the owner designs it) on past the splash pool
//
// The checkpoints (CP) match endgame/stages.ts's park1 and park2 lists.

import { GROUND_Y } from '../../../m1/constants';
import { L2_CP } from '../stages';

export const GY = GROUND_Y;

// ---------------------------------------------------------------------------------------------------------------
// The checkpoints

export const CP = {
  gate: 0, squirt: 1, twister: 2, lazy: 3, kamikaze: 4, blackHole: 5, splash: 6, abyss: 7, baseCamp: 8, camp2: 9, camp4: 10, hillary: 11,
  L2: L2_CP,
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The ground (flat runs at GY; gaps between are pits: craters, sinkholes, the drained deep end under the tubes)

/** [x1, x2] runs of plaza at GY. */
export const GROUND: [number, number][] = [
  [-200, 3520],        // the gate, LIL SQUIRT, the Twister's foot
  [4020, 4700],        // past the Twister's crater, to the lagoon
  [5100, 7580],        // past the lagoon: the lazy river, the Kamikaze's foot
  [8130, 8740],        // the Kamikaze's island
  [9180, 9900],        // past the island, the Black Hole's tower (its foot)
  [16000, 17860],      // the Black Hole's splash pool's far side (the pool's its own: POOLS), the plaza, the Wipeout's foot
  [19060, 19950],      // past the Wipeout, the Abyss's tower
  [27900, 29900],      // the Abyss's splash pool's far side, base camp (the tower's floor 0 inside it; a wall at its end)
  [37700, 40000],      // the descent's splash pool's far side: level 2 (the stub)
];
/** The pools (a swim): the ground's gap filled with water, a floor at its bottom, walls at its ends. */
export interface Pool { x1: number; x2: number; surface: number; bottom: number; name: string }
export const POOLS: Pool[] = [
  { x1: 4700, x2: 5100, surface: GY + 14, bottom: GY + 180, name: 'THE LAGOON' },
  { x1: 15560, x2: 16000, surface: GY + 14, bottom: GY + 200, name: 'BLACK HOLE SPLASH POOL' },
  { x1: 27460, x2: 27900, surface: GY + 14, bottom: GY + 200, name: 'ABYSS SPLASH POOL' },
  { x1: 37200, x2: 37700, surface: GY + 14, bottom: GY + 220, name: 'EVEREST SPLASH POOL' },
];
/** The lazy river: a shallow channel along the ground, its current shoving him back (left) as he wades it. */
export const LAZY = { x1: 5400, x2: 6420, push: -1.7 };
/** Raised bits to stand on: [x, top (y), w] one-way ledges (huts' roofs, lifeguard stands); [x, top, w] solid islands. */
export const LEDGES: [number, number, number][] = [
  [6150, GY - 120, 150],    // the lazy river's tiki hut roof (a trooper up on it)
  [17000, GY - 110, 120],   // a lifeguard stand
];
/** The Wipeout's island: a raised block in the middle of its two craters (solid, from its top down into the pit). */
export const ISLANDS: [number, number, number][] = [[18300, GY - 100, 160]];

// ---------------------------------------------------------------------------------------------------------------
// Stairs up to the slides' tops (solid steps from the ground: he walks up them)

export interface Stairs { x: number; n: number; rise: number; run: number }
/** Each slide's stairs: from x, n steps up (each `rise` tall, `run` deep), to its deck. */
export const step = (s: Stairs, i: number) => ({ x: s.x + i * s.run, y: GY - (i + 1) * s.rise, w: s.run, h: (i + 1) * s.rise });

// ---------------------------------------------------------------------------------------------------------------
// The slides: each a chute from its top deck down to its lip, which throws him off its end

export interface Slide {
  id: string; name: string;
  /** The stairs up to it and the deck at its top (x1..x2 at y). */
  stairs: Stairs; deck: { x1: number; x2: number; y: number };
  /** The chute, top to the lip (world points). Its last stretch turns up: the lip. */
  pts: [number, number][];
  /** The chute's color (the tube's plastic). */
  col: string;
  /** How hard the lip throws him (px a frame along, up): set for the gap it's there to clear (a clean clear riding it
   *  to the end; JUMP at the lip throws him higher still). */
  launch: [number, number];
}
const mk = (id: string, name: string, x: number, n: number, rise: number, deckW: number, run: number, shape: [number, number][], col: string, launch: [number, number]): Slide => {
  const top = GY - n * rise, x1 = x + n * run, x2 = x1 + deckW;
  return { id, name, stairs: { x, n, rise, run }, deck: { x1, x2, y: top }, pts: shape.map(([dx, dy]) => [x2 + dx, top + dy] as [number, number]), col, launch };
};
/** (each shape from its deck's far end: dx along, dy down) */
export const SLIDES: Slide[] = [
  mk('squirt', "LIL' SQUIRT", 1500, 5, 24, 50, 22, [[0, 0], [60, 14], [140, 46], [220, 74], [270, 84], [300, 78]], '#FACC15', [9.5, -8]),
  mk('twister', 'THE TWISTER', 2800, 8, 24, 64, 22, [[0, 0], [80, 12], [160, 50], [240, 98], [320, 136], [380, 150], [420, 142]], '#EC4899', [16, -11]),
  mk('kamikaze', 'THE KAMIKAZE', 6700, 10, 24, 70, 24, [[0, 0], [90, 14], [190, 60], [290, 120], [390, 170], [470, 188], [520, 176]], '#22D3EE', [15.5, -12]),
  mk('drop', 'THE DROP', 8420, 4, 24, 44, 24, [[0, 0], [60, 26], [120, 50], [160, 46]], '#A3E635', [14.6, -10]),
  mk('wipeout1', 'THE WIPEOUT', 17200, 7, 24, 62, 24, [[0, 0], [90, 18], [190, 70], [280, 118], [330, 132], [370, 124]], '#F97316', [17.2, -12]),
  // (the second half of the Wipeout: down off the island's far end (its deck the island's top: no stairs, 0 steps))
  { id: 'wipeout2', name: 'THE WIPEOUT', stairs: { x: 18460, n: 0, rise: 0, run: 0 }, deck: { x1: 18300, x2: 18460, y: GY - 100 }, pts: [[18460, GY - 100], [18540, GY - 80], [18620, GY - 50], [18660, GY - 58]], col: '#F97316', launch: [13.2, -10] },
];

// ---------------------------------------------------------------------------------------------------------------
// The tube rides: a chute in pieces (the gaps between: the tube jumps them off the lips), over a pit

export interface Tube {
  id: string; name: string;
  /** The stairs up to the rack and its deck (where he takes a tube). */
  stairs: Stairs; deck: { x1: number; x2: number; y: number };
  /** The chute's pieces, each its points (world); the tube flies the gaps between (off each piece's lip). */
  pieces: [number, number][][];
  /** The low pipes over the chute (duck under): x, and how high off the chute their underside is. */
  pipes: number[];
  /** The splash pool it comes down into at the end. */
  pool: Pool;
  /** Its pace (px a frame) on the flat, flat out. */
  speed: number;
  col: string;
}
/** A chute's pieces from a start, by stretches: [length, drop] runs (a little wiggle on each), a gap after each but
 *  the last ([gap length, how far down the far side is]). */
const chute = (x: number, y: number, runs: [number, number, number?][]): [number, number][][] => {
  const out: [number, number][][] = [];
  let cx = x, cy = y;
  for (const [len, drop, gap] of runs) {
    const pts: [number, number][] = [[cx, cy]];
    const n = Math.max(2, Math.round(len / 160));
    for (let i = 1; i <= n; i++) {
      const k = i / n, wig = i < n ? Math.sin(i * 1.7 + cx * 0.01) * 10 : 0;
      pts.push([cx + len * k, cy + drop * k + wig]);
    }
    // (the lip: the last bit turned up, if there's a gap after it)
    if (gap) { const [lx, ly] = pts[pts.length - 1]; pts.push([lx + 50, ly - 12]); cx = lx + 50 + gap; cy = ly - 12 + 30; }
    else { cx += len; cy += drop; }
    out.push(pts);
  }
  return out;
};
export const TUBES: Tube[] = [
  {
    id: 'blackHole', name: 'THE BLACK HOLE', stairs: { x: 9500, n: 10, rise: 24, run: 24 }, deck: { x1: 9740, x2: 9900, y: GY - 240 },
    pieces: chute(9900, GY - 240, [[900, 30, 220], [1000, 20, 260], [800, 40, 300], [1050, 30, 280], [800, 40]]),
    pipes: [10500, 11600, 12800, 14000, 15300],
    pool: POOLS[1], speed: 8.2, col: '#1E1B4B',
  },
  {
    id: 'abyss', name: 'THE ABYSS', stairs: { x: 19500, n: 12, rise: 24, run: 24 }, deck: { x1: 19788, x2: 19950, y: GY - 288 },
    pieces: chute(19950, GY - 288, [[900, 20, 260], [800, 20, 300], [1000, 30, 240], [700, 10, 320], [900, 20, 300], [900, 20, 280], [600, 30]]),
    pipes: [20400, 21600, 22800, 23900, 25100, 26300, 27400],
    pool: POOLS[2], speed: 9.2, col: '#450A0A',
  },
];
/** Where a tube's chute ends (its last point): the pool's edge. */
export const tubeEnd = (t: Tube) => t.pieces[t.pieces.length - 1][t.pieces[t.pieces.length - 1].length - 1];

// ---------------------------------------------------------------------------------------------------------------
// MOUNT EVEREST BUT BETTER: the tower (floors stacked FLOOR apart; floor 0 is base camp's ground), the summit on top

export const TOWER = { TL: 28800, TR: 29600, FLOOR: 360, DECK: 24, STAIR: 220 };
/** Floors: 0 base camp (the ground), 1..7 the fights, 8 THE HILLARY STEP (the refill, the summit's door), 9 THE SUMMIT. */
export const FLOORS = 9;
export const floorY = (k: number) => GY - k * TOWER.FLOOR;
/** Which side each floor's way up is on (its stairs, outside the tower: a switchback): base camp's on the right, then
 *  they alternate; THE HILLARY STEP's up to the summit is on the left, the side he comes up on (the summit's door's on
 *  its left; the slide down's off its right). */
export const exitSide = (k: number): 1 | -1 => (k === 8 ? -1 : k % 2 === 0 ? 1 : -1);
/** A floor's name and the height painted up on it (FT: what the park claims). */
export const FLOOR_NAMES = ['BASE CAMP', 'KHUMBU ICEFALL', 'CAMP 1', 'CAMP 2', 'THE LHOTSE FACE', 'CAMP 3', 'CAMP 4', 'THE DEATH ZONE', 'THE HILLARY STEP', 'THE SUMMIT'];
export const FLOOR_FT = [0, 111, 222, 333, 444, 555, 666, 777, 888, 1000];
/** The summit: the arena (the whole top floor), its door (on the left, at the top of the Hillary Step's stairs), the slide's
 *  mouth (on the right). */
export const SUMMIT = { y: floorY(9), L: TOWER.TL, R: TOWER.TR, doorX: TOWER.TL, mouthX: TOWER.TR };
/** The descent: the slide off the summit, all the way down to its splash pool (world points). */
export const DESCENT: [number, number][] = (() => {
  const out: [number, number][] = [];
  const x0 = SUMMIT.mouthX, y0 = SUMMIT.y, x1 = POOLS[3].x1 + 40, y1 = GY - 10, n = 60;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    // (steep off the top, easing out toward the bottom; a hump or two on the way)
    const e = 1 - Math.pow(1 - k, 1.6), hump = Math.sin(k * Math.PI * 5) * 40 * (1 - k) * (k > 0.05 ? 1 : 0);
    out.push([x0 + 40 + (x1 - x0 - 40) * k, y0 + (y1 - y0) * e - hump]);
  }
  out.unshift([x0, y0]);
  return out;
})();
/** Level 2's start (the stub): where he's stood after the splashdown; the closed way on (the owner designs the rest). */
export const L2 = { x: POOLS[3].x2 + 200, wall: 39400 };

// ---------------------------------------------------------------------------------------------------------------
// Where each checkpoint puts him (feet), the zones' x for what's said

export const CP_AT: Record<number, { x: number; y: number }> = {
  [CP.gate]: { x: 300, y: GY },
  [CP.squirt]: { x: 1380, y: GY },
  [CP.twister]: { x: 2680, y: GY },
  [CP.lazy]: { x: 5260, y: GY },
  [CP.kamikaze]: { x: 6560, y: GY },
  [CP.blackHole]: { x: 9360, y: GY },
  [CP.splash]: { x: 16260, y: GY },
  [CP.abyss]: { x: 19360, y: GY },
  [CP.baseCamp]: { x: 28200, y: GY },
  [CP.camp2]: { x: TOWER.TL + 60, y: floorY(3) },
  [CP.camp4]: { x: TOWER.TR - 60, y: floorY(6) },
  [CP.hillary]: { x: TOWER.TL + 120, y: floorY(8) },
  [CP.L2]: { x: L2.x, y: GY },
};
/** The tower's checkpoints: the floor each puts him on (every floor under it cleared). */
export const CP_FLOOR: Record<number, number> = { [CP.baseCamp]: 0, [CP.camp2]: 3, [CP.camp4]: 6, [CP.hillary]: 8, [CP.L2]: 10 };

// ---------------------------------------------------------------------------------------------------------------
// Who's where (the plaza's; the tower's floors spawn their own: tower.ts). [kind, x, feet y]

export type Who = 'dguest' | 'aguest' | 'gator' | 'pelican' | 'trooper' | 'hover' | 'yeti';
export const PLAZA_CAST: [Who, number, number][] = [
  // the gate: the possessed taught, one of each
  ['dguest', 1000, GY], ['aguest', 1220, GY],
  // after LIL SQUIRT
  ['gator', 2400, GY], ['trooper', 2560, GY],
  // past the Twister's crater
  ['dguest', 4250, GY], ['pelican', 4420, GY - 260], ['aguest', 4560, GY],
  // past the lagoon, the lazy river
  ['gator', 5340, GY], ['aguest', 5760, GY], ['pelican', 5900, GY - 280], ['dguest', 6050, GY], ['trooper', 6225, GY - 120],
  // the Kamikaze's island
  ['trooper', 8300, GY], ['dguest', 8390, GY],
  // past the island
  ['aguest', 9260, GY],
  // the splashdown's plaza, the Wipeout
  ['dguest', 16500, GY], ['aguest', 16700, GY], ['trooper', 17060, GY - 110], ['gator', 16900, GY], ['pelican', 16800, GY - 280],
  ['hover', 18380, GY - 260],
  ['dguest', 19200, GY], ['aguest', 19320, GY], ['trooper', 19480, GY], ['gator', 19600, GY],
  // base camp
  ['aguest', 28400, GY], ['dguest', 28520, GY],
];
/** The pickups along the way (small ones: the endgame's lean drops), and the big refill before the summit. [x, feet y, type] */
export const PICKUPS: [number, number, 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo'][] = [
  [2050, GY, 'small_health'], [4150, GY, 'small_ammo'], [6225, GY - 120, 'small_health'], [8240, GY, 'small_ammo'],
  [16420, GY, 'small_health'], [18380, GY - 100, 'small_ammo'], [28100, GY, 'small_health'],
  // (the summit's door: the big health and ammo, on THE HILLARY STEP)
  [TOWER.TL + 220, floorY(8), 'large_health'], [TOWER.TL + 300, floorY(8), 'large_ammo'],
];
