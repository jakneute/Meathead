// The water park, level 1: where everything is (pure data, world space; GY the ground). Read it left to right:
//
//   THE GATE        in through the gate he kicked down (endgame/lot), past the smashed ticket booths
//   LIL SQUIRT      the first slide: a kiddie one over solid ground (the slide taught: ride it, it throws you)
//   THE TWISTER     a bigger one, and a blast crater past its end too wide to jump: the launch clears it cleanly (a
//                   jump and a charge just about does, risky)
//   THE LAGOON      a pool to swim (the lazy river's level 2's: the owner's "no lazy river; that's the next level")
//   THE KAMIKAZE    the tall one: over a sinkhole onto an island, and off the island's own little slide over another
//   THE BLACK HOLE  the first tube ride: off a tall tower, down a long chute on an inner tube high over a bottomless
//                   drop, aliens shooting. An autorunner (the owner's): the tube carries him on, stuck to him; he jumps
//                   (tube and all) the broken chute's gaps, ducks and shoots. It goes round and round (the chute loops
//                   seamlessly) till every alien of the ride's dead; then on down into the splash pool
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
  gate: 0, squirt: 1, twister: 2, lagoon: 3, kamikaze: 4, blackHole: 5, splash: 6, abyss: 7, baseCamp: 8, camp2: 9, camp4: 10, hillary: 11,
  L2: L2_CP,
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The ground (flat runs at GY; gaps between are pits: craters, sinkholes, the drained deep end under the tubes)

/** [x1, x2] runs of plaza at GY. */
export const GROUND: [number, number][] = [
  [-200, 3520],        // the gate, LIL SQUIRT, the Twister's foot
  [4020, 4700],        // past the Twister's crater, to the lagoon
  [5100, 7580],        // past the lagoon, the tiki hut, the Kamikaze's foot
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
/** Raised bits to stand on: [x, top (y), w] one-way ledges (huts' roofs, lifeguard stands); [x, top, w] solid islands. */
export const LEDGES: [number, number, number][] = [
  [5900, GY - 120, 150],    // the tiki hut's roof (a trooper up on it)
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
  // (the owner's: "i want the scale to feel grander with all the slides": the Twister and the Kamikaze tower over the plaza
  // now, their lips where they were (the launches are set for the gaps past them))
  mk('twister', 'THE TWISTER', 2540, 16, 24, 64, 16, [[0, 0], [60, 24], [140, 96], [230, 180], [320, 250], [410, 300], [490, 330], [560, 342], [600, 334]], '#EC4899', [16, -11]),
  mk('kamikaze', 'THE KAMIKAZE', 6338, 22, 24, 70, 16, [[0, 0], [70, 36], [160, 130], [270, 240], [380, 330], [490, 400], [600, 446], [700, 470], [740, 472], [770, 460]], '#22D3EE', [15.5, -12]),
  mk('drop', 'THE DROP', 8420, 4, 24, 44, 24, [[0, 0], [60, 26], [120, 50], [160, 46]], '#A3E635', [14.6, -10]),
  mk('wipeout1', 'THE WIPEOUT', 17200, 7, 24, 62, 24, [[0, 0], [90, 18], [190, 70], [280, 118], [330, 132], [370, 124]], '#F97316', [17.2, -12]),
  // (the second half of the Wipeout: down off the island's far end (its deck the island's top: no stairs, 0 steps))
  { id: 'wipeout2', name: 'THE WIPEOUT', stairs: { x: 18460, n: 0, rise: 0, run: 0 }, deck: { x1: 18300, x2: 18460, y: GY - 100 }, pts: [[18460, GY - 100], [18540, GY - 80], [18620, GY - 50], [18660, GY - 58]], col: '#F97316', launch: [13.2, -10] },
];

// ---------------------------------------------------------------------------------------------------------------
// The tube rides: an autorunner (the owner's: "it's kinda like an autorunner, this section. you cannot lose the tube,
// but you can fall on a misplaced jump"). A chute off a tall tower, broken into pieces over a bottomless drop; it loops
// (tube.ts carries him from its loop's end back to its start, the same chute either side: no seam) till the ride's
// aliens are all dead, then runs on down into its splash pool.

export interface Tube {
  id: string; name: string;
  /** The stairs up to the rack and its deck (where he takes a tube). */
  stairs: Stairs; deck: { x1: number; x2: number; y: number };
  /** The chute's pieces, each its points (world); the gaps between are bottomless (he jumps them, the tube with him). */
  pieces: [number, number][][];
  /** The gaps (world x1, x2), in order. */
  gaps: [number, number][];
  /** The low pipes over the chute (duck under): world x. */
  pipes: number[];
  /** The chute, its gaps and pipes, lap by lap (tube.ts goes on to the next each time he's carried back round): the
   *  loop's middle differs from lap to lap, its ends (all that's on screen at the carry back) the same. (pieces, gaps,
   *  pipes above: the first lap's.) */
  laps: { pieces: [number, number][][]; gaps: [number, number][]; pipes: number[] }[];
  /** The loop: from `a + len` he's carried back to `a` (the chute's the same either side) till the ride's cleared. */
  loop: { a: number; len: number };
  /** The aliens to kill (all of them: then the loop lets him go), at most this many at once. */
  foes: number; most: number;
  /** The splash pool it comes down into at the end. */
  pool: Pool;
  /** Its pace (px a frame, steady: an autorunner). */
  speed: number;
  col: string;
}
const smooth = (t: number) => { const k = Math.max(0, Math.min(1, t)); return k * k * (3 - 2 * k); };
/** A ride's chute: off the deck (x0, y0), down a sweep to the loop's height, the loop (a periodic swell, `len` long from
 *  `a`, its gaps and pipes repeating), on past it far enough to look the same as its start, then down to the pool. Every
 *  gap and pipe in [a - 500, a + len + copy] is the loop's, repeated: so what's on screen either side of the carry back
 *  is the same. Legs (art.ts) stand every 160: a and len are multiples of it. */
const course = (o: {
  x0: number; y0: number; a: number; len: number; yl: number; amp: number;
  gaps: [number, number][]; pipes: number[]; introGaps: [number, number][]; poolX: number;
  /** How far past the loop's end it runs on the same (he's never carried back mid-grab: room for one to finish). */
  copy: number;
}) => {
  const { x0, y0, a, len, yl, amp } = o, z0 = a - 500, z1 = a + len + o.copy, poolY = GY - 6;
  const f = (x: number) => yl + amp * (0.6 * Math.sin(((x - a) / len) * Math.PI * 4) + 0.4 * Math.sin(((x - a) / len) * Math.PI * 6 + 1));
  const yAt = (x: number) => (x < z0 ? y0 + (f(x) - y0) * smooth((x - x0) / (z0 - x0)) : x > z1 ? f(x) + (poolY - f(x)) * smooth((x - z1) / (o.poolX - z1)) : f(x));
  const gaps: [number, number][] = [...o.introGaps.map(([x, w]) => [x, x + w] as [number, number])];
  const pipes: number[] = [];
  for (let k = -1; k <= 1; k++) {
    for (const [g, w] of o.gaps) { const x = a + g + k * len; if (x >= z0 && x + w <= z1) gaps.push([x, x + w]); }
    for (const q of o.pipes) { const x = a + q + k * len; if (x >= z0 && x <= z1) pipes.push(x); }
  }
  gaps.sort((p, q) => p[0] - q[0]); pipes.sort((p, q) => p - q);
  const pieces: [number, number][][] = [];
  let from = x0;
  for (const [g1, g2] of [...gaps, [o.poolX, o.poolX] as [number, number]]) {
    const pts: [number, number][] = [];
    for (let x = from; x < g1; x += 40) pts.push([x, yAt(x)]);
    pts.push([g1, yAt(g1)]);
    pieces.push(pts);
    from = g2;
  }
  return { pieces, gaps, pipes };
};
/** A ride's laps: its ends' gaps and pipes (the first 800 of the loop, the last 500: the same every lap) and each lap's
 *  own middle (the owner's "go through the same obstacles as before": they're not, lap to lap). */
const laps = (o: Omit<Parameters<typeof course>[0], 'gaps' | 'pipes'>, ends: { gaps: [number, number][]; pipes: number[] }, mids: { gaps: [number, number][]; pipes: number[] }[]) => {
  const all = mids.map(m => course({ ...o, gaps: [...ends.gaps, ...m.gaps], pipes: [...ends.pipes, ...m.pipes] }));
  return { ...all[0], laps: all };
};
const BH = laps({ x0: 9990, y0: GY - 600, a: 11520, len: 1920, yl: GY - 330, amp: 40, introGaps: [[10520, 150]], poolX: 15560, copy: 1600 },
  { gaps: [[600, 180]], pipes: [1680] },
  [{ gaps: [[1200, 200]], pipes: [990] }, { gaps: [[1080, 210]], pipes: [900] }, { gaps: [[1120, 230]], pipes: [880] }]);
const AB = laps({ x0: 20100, y0: GY - 720, a: 21440, len: 3840, yl: GY - 390, amp: 55, introGaps: [[20520, 170]], poolX: 27460, copy: 1700 },
  { gaps: [[500, 200]], pipes: [3550] },
  [
    { gaps: [[1400, 240], [2300, 250], [3050, 220]], pipes: [1000, 1900, 2750] },
    { gaps: [[1100, 220], [1900, 260], [2700, 240]], pipes: [1500, 2350, 3150] },
    { gaps: [[1600, 230], [2500, 200], [3100, 200]], pipes: [1250, 2050, 2850] },
  ]);
export const TUBES: Tube[] = [
  {
    id: 'blackHole', name: 'THE BLACK HOLE', stairs: { x: 9500, n: 25, rise: 24, run: 15 }, deck: { x1: 9875, x2: 9990, y: GY - 600 },
    ...BH, loop: { a: 11520, len: 1920 }, foes: 6, most: 3,
    pool: POOLS[1], speed: 8.2, col: '#1E1B4B',
  },
  {
    id: 'abyss', name: 'THE ABYSS', stairs: { x: 19500, n: 30, rise: 24, run: 15 }, deck: { x1: 19950, x2: 20100, y: GY - 720 },
    ...AB, loop: { a: 21440, len: 3840 }, foes: 9, most: 4,
    pool: POOLS[2], speed: 9, col: '#450A0A',
  },
];
/** Where a tube's chute ends (its last point): the pool's edge. */
export const tubeEnd = (t: Tube) => t.pieces[t.pieces.length - 1][t.pieces[t.pieces.length - 1].length - 1];
/** The rides' stretch of world (the deck's end to the pool): the drop under it is bottomless. */
export const tubeSpan = (t: Tube): [number, number] => [t.deck.x2, t.pool.x1];

// The named areas (where each starts, world x: music cues and the like key off these)
export const AREAS = {
  gate: -200, plaza: 0, blackHole: 9990, splashdown: 15560, abyss: 20100, baseCamp: 27900, tower: 28800, l2: 37200,
} as const;

// ---------------------------------------------------------------------------------------------------------------
// MOUNT EVEREST BUT BETTER: the tower (floors stacked FLOOR apart; floor 0 is base camp's ground), the summit on top

/** (CEIL: each deck's thickness under its top, solid: the ceiling of the floor under it (the owner's "make sure there's
 *  a proper cieling in all the rooms"); its top DECK of it the floor, the rest the ceiling's beams) */
export const TOWER = { TL: 28800, TR: 29600, FLOOR: 360, DECK: 24, CEIL: 84, STAIR: 220 };
/** Floors: 0 base camp (the ground), 1..7 the fights, 8 THE HILLARY STEP (the refill, the summit's door), 9 THE SUMMIT. */
export const FLOORS = 9;
export const floorY = (k: number) => GY - k * TOWER.FLOOR;
/** Which side each floor's way up is on: the right, every floor (out onto the spiral round the mountain's outside, in
 *  again on the next floor's left: tower.ts stairsOf; the summit's door's on its left, where he comes in). */
export const exitSide = (_k: number): 1 | -1 => 1;
/** A floor's name and the height painted up on it (FT: what the park claims). */
export const FLOOR_NAMES = ['BASE CAMP', 'KHUMBU ICEFALL', 'CAMP 1', 'CAMP 2', 'THE LHOTSE FACE', 'CAMP 3', 'CAMP 4', 'THE DEATH ZONE', 'THE HILLARY STEP', 'THE SUMMIT'];
export const FLOOR_FT = [0, 111, 222, 333, 444, 555, 666, 777, 888, 1000];
/** The summit: the arena (the whole top floor), its door (on the left, at the top of the Hillary Step's stairs), the slide's
 *  mouth (on the right). */
export const SUMMIT = { y: floorY(9), L: TOWER.TL, R: TOWER.TR, doorX: TOWER.TL, mouthX: TOWER.TR - 110 };
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
  [CP.twister]: { x: 2420, y: GY },
  [CP.lagoon]: { x: 5260, y: GY },
  [CP.kamikaze]: { x: 6200, y: GY },
  [CP.blackHole]: { x: 9360, y: GY },
  [CP.splash]: { x: 16260, y: GY },
  [CP.abyss]: { x: 19360, y: GY },
  [CP.baseCamp]: { x: 28200, y: GY },
  [CP.camp2]: { x: TOWER.TR - 80, y: floorY(3) },
  [CP.camp4]: { x: TOWER.TL + 80, y: floorY(6) },
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
  ['dguest', 1150, GY], ['aguest', 1340, GY],
  // after LIL SQUIRT
  ['gator', 2200, GY], ['trooper', 2330, GY],
  // past the Twister's crater
  ['dguest', 4250, GY], ['pelican', 4420, GY - 260], ['aguest', 4560, GY],
  // past the lagoon, round the tiki hut
  ['gator', 5400, GY], ['aguest', 5640, GY], ['pelican', 5800, GY - 280], ['dguest', 5850, GY], ['trooper', 5975, GY - 120],
  // the Kamikaze's island
  ['trooper', 8300, GY], ['dguest', 8390, GY],
  // the splashdown's plaza, the Wipeout
  ['dguest', 16500, GY], ['aguest', 16700, GY], ['trooper', 17060, GY - 110], ['gator', 16900, GY], ['pelican', 16800, GY - 280],
  ['hover', 18380, GY - 260],
  ['dguest', 19200, GY], ['aguest', 19320, GY], ['trooper', 19480, GY], ['gator', 19600, GY],
  // base camp
  ['aguest', 28400, GY], ['dguest', 28520, GY],
];
/** The pickups along the way (small ones: the endgame's lean drops), and the big refill before the summit. [x, feet y, type] */
export const PICKUPS: [number, number, 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo'][] = [
  [2050, GY, 'small_health'], [4150, GY, 'small_ammo'], [5975, GY - 120, 'small_health'], [8240, GY, 'small_ammo'],
  [16420, GY, 'small_health'], [18380, GY - 100, 'small_ammo'], [28100, GY, 'small_health'],
  // (the summit's door: the big health and ammo, on THE HILLARY STEP)
  [TOWER.TL + 220, floorY(8), 'large_health'], [TOWER.TL + 300, floorY(8), 'large_ammo'],
];
