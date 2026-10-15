// The havoc, laid out (x from the section's start, heights up from the ground line). Every disaster at once, one at a
// time first (teach), then stacked (escalate):
//
//   0      Out the hole Disaster: The Ride's far wall left (its wall lying flat on the street behind him). The red sky,
//          ash, the HAPPYWOOD hill erupting far off. CHECKPOINT. The PA: the park's experiencing every disaster.
//   1300   LAVA RIVER 1 (jump it). Looters.
//   1650   The facades of PARIS STREET fall flat on the street (the shadow, the creak: out from under), plywood and 2x4s.
//   2520   A studio LIGHT TOWER (a lattice of 2x4s, lamps up top) on the bank of LAVA RIVER 2 (too wide to jump): close
//          to it, it tips over the river and lands across it, a bridge.
//   3150   CHECKPOINT. THE WIND: gusts (the tell: the streaks, the howl) shove him back and throw trash cans, plywood and
//          Steve fliers along the street; LAVA RIVER 3 under a stunt wire. Storm crew with leaf blowers.
//   4500   CHECKPOINT. THE QUAKE: it rumbles (the tell: the shadows on the street where things will land), then shakes,
//          and bricks and studio lights come down. The REVENGERS: RESEMBLE billboard collapses.
//   6300   CHECKPOINT. THE FLOOD (the narrator: HERE'S A FLOOD): the water comes up the backlot, and the only way's up.
//          THE FLOOD CLIMB, a staircase of three shafts as buildings come down round him: the HOTEL HAPPYWOOD's scaffold
//          (up to STAGE 14's roof), the crane over STAGE 14 (its wrecking ball swinging; a stunt wire up), the old water
//          tower's scaffold (up to the hill's ridge). Some ledges crumble under him; what's below him comes down behind
//          him; chunks of the buildings come down the shafts. CHECKPOINTS on STAGE 14's roof and the tower's.
//   8200   CHECKPOINT. THE RIDGE, by the HAPPYWOOD sign's letters. The TORNADO comes down over the flood behind him (it
//          drinks it: the water goes down) and comes after him: touch it and he's dead. Down the hill road and along
//          the foot of the hill, the snow coming down; at each AVALANCHE ZONE a shelter (the fallen O, the snow shed,
//          the fallen Steve billboard, the tour tram on its side, the bus stop): in under it, the avalanche comes down
//          the hill, buries the tornado (it falls back, a lull) and goes over him. Out in the open, it buries him.
//          The tornado throws what it's picked up ahead of him (the HAPPYWOOD letters, a cow, a porta-potty).
//          CHECKPOINTS after the second and fourth shelters, and the fifth.
//   15200  EVERYTHING AT ONCE: lava rivers, the wind, the quake, hail, facades falling, the tornado still coming.
//   18800  A FIRST AID station (the big health and ammo, before the stunt stage). Past it the tornado surges: it catches
//          him and flings him (the cutscene) onto Stuntman Steve's stage.
//
// Revisits (the fling's been: the tornado's spent): no tornado, no flood, no wind, quake or hail; the lava crusted over
// (walkable), every facade down, the snow banked up, the wrecking ball hanging still, the ledges solid. Walkable both
// ways: the hill up and down, the shafts dropped down (or climbed), the street.

import { SECTIONS, GY } from '../geometry';
import type { StuntWire } from '../section';

export const { x0, x1 } = SECTIONS.havoc;
export { GY };
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
export const R = (x: number) => x - x0;
export const HANDS = 80;

// ---------------------------------------------------------------------------------------------------------------
// The ground: [rx from, rx to, height from, height to]

export type Run = [number, number, number, number];
export const RUNS: Run[] = [
  [-200, 1300, 0, 0],
  [1440, 2700, 0, 0],
  [3020, 3700, 0, 0],
  [4180, 8200, 0, 0],
  // the hill: the ridge, down the hill road to its landings and on down to the foot of it
  [8200, 8600, 1500, 1500],
  [8600, 9400, 1500, 1200],
  [9400, 9800, 1200, 1200],
  [9800, 10350, 1200, 970],
  [10470, 11000, 920, 700],
  [11000, 11500, 700, 700],
  [11500, 12700, 700, 0],
  [12700, 14000, 0, 0],
  [14160, 16200, 0, 0],
  [16600, 17400, 0, 0],
  [17540, 19700, 0, 0],
];
/** The ground's height at rx (null over a lava river). */
export const groundH = (rx: number): number | null => {
  for (const [a, b, h1, h2] of RUNS) if (rx >= a && rx <= b) return h1 + ((h2 - h1) * (rx - a)) / (b - a);
  return null;
};

/** The lava rivers: [rx from, rx to, the banks' height (left, right)]. Fall in: burned, and back out at the nearer bank. */
export const LAVA: { a: number; b: number; hl: number; hr: number }[] = [
  { a: 1300, b: 1440, hl: 0, hr: 0 },
  { a: 2700, b: 3020, hl: 0, hr: 0 },
  { a: 3700, b: 4180, hl: 0, hr: 0 },
  { a: 10350, b: 10470, hl: 970, hr: 920 },
  { a: 14000, b: 14160, hl: 0, hr: 0 },
  { a: 16200, b: 16600, hl: 0, hr: 0 },
  { a: 17400, b: 17540, hl: 0, hr: 0 },
];
/** How far down the lava is in its channel (under the lower bank), and the channel's floor. */
export const LAVA_DOWN = 46, LAVA_FLOOR = 140;

// ---------------------------------------------------------------------------------------------------------------
// The flood climb

/** The climb's buildings (solid): [rx, w, height]. STAGE 14 (its roof is shaft 2's floor), the water tower's base
 *  building (its roof is shaft 3's floor). The hill's flank is the right side of shaft 3. */
export const BUILDINGS: [number, number, number, string][] = [
  [7000, 600, 520, 'STAGE 14'],
  [7600, 600, 1040, 'STAGE 15'],
];
/** The shafts (rx from, to; floor and top heights). */
export const SHAFTS = [
  { a: 6300, b: 7000, floor: 0, top: 520, name: 'HOTEL HAPPYWOOD' },
  { a: 7000, b: 7600, floor: 520, top: 1040, name: 'STAGE 14' },
  { a: 7600, b: 8200, floor: 1040, top: 1500, name: 'THE WATER TOWER' },
] as const;
export const CLIMB = { a: 6250, b: 8200, top: 1500 } as const;
/** Where the flood starts (rx: down on the canyon floor). */
export const FLOOD_AT = 6330;
/** The water's top (it stops under the ridge), and where it comes down to once the tornado's drunk it. */
export const FLOOD_MAX = 1400, FLOOD_LOW = -90;

/** The ledges (one-way; standable: lit lips): [rx, h, w, crumbles]. */
export const LEDGES: [number, number, number, boolean][] = [
  // shaft 1: the HOTEL HAPPYWOOD's scaffold
  [6420, 105, 150, false], [6640, 200, 140, true], [6440, 295, 140, false], [6660, 390, 140, true], [6850, 465, 130, false],
  // shaft 2: the crane's scaffold over STAGE 14 (and the wire up it)
  [7050, 615, 140, false], [7270, 705, 140, true], [7080, 795, 130, false], [7300, 885, 150, false], [7470, 965, 110, true],
  // shaft 3: the water tower's scaffold
  [7680, 1135, 140, false], [7900, 1225, 140, true], [7690, 1315, 140, true], [7920, 1400, 150, false], [8070, 1450, 110, false],
];

/** The wrecking ball: the crane's jib end (rx, h), its cable's length, how far it swings (radians), its period. */
export const BALL = { px: 7300, ph: 1270, len: 480, amp: 0.62, w: 0.028, r: 34 } as const;

// ---------------------------------------------------------------------------------------------------------------
// The tornado chase

/** Where the tornado comes down (over the flood, behind him), and where he has to get to for it (the ridge). */
export const TORNADO_FORM = 7750, CHASE_AT = 8320;
/** The shelters, where the avalanches come down: [rx from, to] (his middle in it, on its floor), what it is. */
export const COVERS: { a: number; b: number; what: 'o' | 'shed' | 'billboard' | 'tram' | 'busstop' }[] = [
  { a: 9530, b: 9690, what: 'o' },
  { a: 11120, b: 11360, what: 'shed' },
  { a: 13280, b: 13470, what: 'billboard' },
  { a: 15020, b: 15230, what: 'tram' },
  { a: 17080, b: 17280, what: 'busstop' },
];
/** A shelter's roof: its underside this far over its floor. */
export const ROOF = 104, ROOF_T = 20;
/** The final stretch: past here the tornado surges and gets him. */
export const SURGE_AT = 18960;
/** The first aid station (the big refill). */
export const REFILL = 18780;

// ---------------------------------------------------------------------------------------------------------------
// The street's set pieces

/** Facades that come down: [rx, w, h, how, name]. 'flat' falls flat on the street (forward, toward us); 'bridge' tips
 *  over the lava river to its right and lies across it (a skinny light tower: lying down it's a plank); 'billboard' the Revengers billboard on its stilts (flat). */
export type FallHow = 'flat' | 'bridge' | 'billboard';
export const FALLS: [number, number, number, FallHow, string][] = [
  [1650, 230, 300, 'flat', 'PARIS STREET'],
  [2080, 260, 280, 'flat', 'CAFE DE PARIS'],
  [2656, 44, 340, 'bridge', 'LIGHT TOWER'],
  [5300, 320, 260, 'billboard', 'REVENGERS: RESEMBLE'],
  [15700, 240, 300, 'flat', 'OLD LONDON'],
  [17800, 260, 290, 'flat', 'MAIN STREET USA'],
];
/** How close (rx) he gets before each comes down (it starts to go). */
export const FALL_TRIGGER = 300;

/** The wind's stretches, the quake's, the hail's: [rx from, to]. */
export const WIND: [number, number][] = [[3150, 4500], [15300, 16800]];
export const QUAKE: [number, number][] = [[4500, 6250], [16700, 18300]];
export const HAIL: [number, number][] = [[16900, 18700]];

/** The stunt wires, in order (wires are matched by their place: keep it). */
export const WIRES: StuntWire[] = [
  // over LAVA RIVER 3
  { from: { x: X(3620), y: Y(0) - HANDS }, to: { x: X(4260), y: Y(0) }, rigY: Y(330) },
  // up the crane over STAGE 14 (shaft 2): from the first ledge up to the fourth
  { from: { x: X(7150), y: Y(615) - HANDS }, to: { x: X(7360), y: Y(885) }, rigY: Y(1000) },
  // over LAVA RIVER 6, at the end (everything at once)
  { from: { x: X(16120), y: Y(0) - HANDS }, to: { x: X(16690), y: Y(0) }, rigY: Y(330) },
];

// ---------------------------------------------------------------------------------------------------------------
// Who's about

export type HavocKind = 'm2:hwh_looter' | 'm2:hwh_crew' | 'm2:hwh_poppy';
/** [kind, rx, height (null: on the ground there)]. Never in a hazard's way (the lava, the covers). */
export const ENEMIES: [HavocKind, number, number | null][] = [
  // the street: each alone first, then mixed
  ['m2:hwh_looter', 1000, null],
  ['m2:hwh_looter', 1880, null], ['m2:hwh_poppy', 2380, null],
  ['m2:hwh_crew', 3350, null], ['m2:hwh_looter', 3520, null],
  ['m2:hwh_crew', 4380, null], ['m2:hwh_poppy', 4800, null], ['m2:hwh_looter', 5050, null],
  ['m2:hwh_crew', 5700, null], ['m2:hwh_poppy', 5950, null],
  // the climb (up on the ledges and roofs, above the water to start)
  ['m2:hwh_looter', 6470, 295], ['m2:hwh_crew', 7380, 520], ['m2:hwh_poppy', 7330, 885], ['m2:hwh_looter', 7730, 1315],
  // the chase (light: it's about the running)
  ['m2:hwh_crew', 8900, null], ['m2:hwh_poppy', 10650, null], ['m2:hwh_looter', 12100, null], ['m2:hwh_crew', 12950, null],
  ['m2:hwh_looter', 14350, null], ['m2:hwh_poppy', 14700, null],
  // everything at once
  ['m2:hwh_looter', 15500, null], ['m2:hwh_crew', 16000, null], ['m2:hwh_poppy', 16900, null], ['m2:hwh_looter', 17650, null],
  ['m2:hwh_crew', 18100, null], ['m2:hwh_poppy', 18450, null],
];

export const PICKUPS: [number, number | null, 'small_health' | 'small_ammo' | 'large_health' | 'large_ammo'][] = [
  [2000, null, 'small_health'], [3100, null, 'small_ammo'], [4420, null, 'small_health'], [5600, null, 'small_ammo'],
  [7350, 885, 'small_health'], [7740, 1315, 'small_ammo'],
  [11250, null, 'small_health'], [13380, null, 'small_ammo'], [15100, null, 'small_health'],
  // the first aid station, before Steve's stage
  [REFILL - 30, null, 'large_health'], [REFILL + 30, null, 'large_ammo'],
];

/** PA horns (on poles): rx. Steve's fliers, posters, standees: [rx, kind]. */
export const HORNS = [400, 2300, 4600, 6150, 12900, 15600, 17900];
export const STEVES: [number, 'standee' | 'poster' | 'flier'][] = [
  [620, 'standee'], [1500, 'poster'], [3300, 'flier'], [4700, 'poster'], [5850, 'standee'], [12800, 'poster'], [14500, 'standee'],
  [16000, 'poster'], [18300, 'standee'], [19300, 'poster'],
];

/** The checkpoints (passed by x; the climb's are on the roofs, past the buildings' walls, so they're only reached up
 *  there). */
export const CHECKPOINTS = [
  { name: 'REAL DISASTERS', cp: 50, x: X(200), y: GY },
  { name: 'THE LAVA RIVERS', cp: 51, x: X(3120), y: GY },
  { name: 'THE QUAKE', cp: 52, x: X(4520), y: GY },
  { name: 'THE FLOOD', cp: 53, x: X(FLOOD_AT), y: GY },
  { name: 'STAGE 14\'S ROOF', cp: 54, x: X(7090), y: Y(520) },
  { name: 'THE WATER TOWER', cp: 55, x: X(7660), y: Y(1040) },
  { name: 'THE HAPPYWOOD SIGN', cp: 56, x: X(8260), y: Y(1500) },
  { name: 'THE SNOW SHED', cp: 57, x: X(11420), y: Y(700) },
  { name: 'THE TOUR TRAM', cp: 58, x: X(15300), y: GY },
  { name: 'THE BUS STOP', cp: 59, x: X(17340), y: GY },
];
