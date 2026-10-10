// The clock tower's layout: where everything is (shared by the running, index.ts, and the painting, art.ts).
//
// Left to right (world x):
//   x0 .. TX0      the ELEVATOR TO HELL loading bay: the way back to the hallway, the wait-time sign, HOW THE RIDE
//                  WORKS on the wall, the queue's switchbacks (riders in line), the operator's booth at the gate, the
//                  boarding platform (the car docks there), the CAST MEMBERS ONLY door (security comes out of it)
//   TX0 .. TX1     the clock tower, inside, 1000 across (u: 0..1000 from its left wall). The ride's shaft up the middle
//                  (u 420..580), the car going up it behind everything. Seven floors: the ground floor (0), floors 1..5,
//                  the clock room (6) at the top; each floor slab a stairwell gap at one end (the zigzag). The way UP:
//                  every floor's support beam on the half he comes in on (ram it to get by), the shaft's net to cross,
//                  the ledges up to the gap on the far half. The way DOWN (after the car's gone through, everything
//                  wrecked: WRECK): the shaft open in places and jammed with wreckage in others, floors sagging, one
//                  caved in; down the shaft where he can (the cars still coming down it), through the floors where it's
//                  jammed; down past the ground floor he started from, through the ride's "hell" under it (B1), down
//                  the hole the car made (the chute) into the real one.
// Up is negative y from GY.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.tower;

// ---- The loading bay
export const MIST_DOOR_X = x0 + 50;
export const WAIT_SIGN_X = x0 + 205;
export const HOW_BOARD_X = x0 + 640;
export const QUEUE_X0 = x0 + 330, QUEUE_X1 = x0 + 1000;
export const BOOTH_X = x0 + 1060;
/** Where the car docks to load, and the platform it docks at. */
export const DOCK_X = x0 + 1320, PLATFORM_X0 = x0 + 1150, PLATFORM_X1 = x0 + 1520;
/** Where he walks up to the gate and asks. */
export const ASK_X = x0 + 960;
export const STAFF_DOOR_X = x0 + 1600;
/** The bay's ceiling (it's a building: it's indoors). */
export const BAY_TOP = GY - 520;

// ---- The tower
export const TX0 = x0 + 1700, W = 1000, TX1 = TX0 + W;
/** A point across the tower (u: 0 at its left wall). */
export const U = (u: number) => TX0 + u;
export const WALL = 40;
/** The ride's shaft up the middle. */
export const SH0 = U(420), SH1 = U(580), SHM = (SH0 + SH1) / 2;
/** The maintenance door's height (in through the tower's foot from the bay). */
export const DOOR_H = 150;
/** Each floor's height (floor to floor), and how thick a floor slab is. */
export const STORY = 380, SLAB = 24;
/** Floor k's top (0: the ground floor; 6: the clock room's). */
export const F = (k: number) => GY - k * STORY;
export const STORIES = 6;
/** The clock room: its floor, its ceiling. */
export const TOP = F(STORIES), ROOF = TOP - 560;
/** Under the ground floor: the ride's "hell" (B1, a room a level down, its floor at B1), and the hole the car made
 *  under that (the chute, CH0..CH1), down to HELL_AT: on into the real hell. */
export const B1 = GY + 320;
export const CH0 = U(300), CH1 = U(700);
export const HELL_AT = GY + 1300;
/** The stairwell gap in each floor slab: how wide; which end (floor k's way up out of it: right if k is even). */
export const GAP = 180;
export const upRight = (k: number) => k % 2 === 0;

// ---------------------------------------------------------------------------------------------------------------
// The floor slabs: each a few pieces [u0, u1, dy0, dy1] (dy: down from the floor's line at each end: a piece that sags
// is a slope, stepped so he walks it both ways). WHOLE: as built (the shaft's stretch is a net, separate). WRECK: after
// the crash (the shaft's stretch a jam of wreckage where there is one: JAMS).

export type Piece = [number, number, number, number];
const wholeOf = (k: number): Piece[] => (k === 5 ? [[0, 150, 0, 0], [580, 820, 0, 0]] : upRight(k - 1) ? [[0, 420, 0, 0], [580, 820, 0, 0]] : [[180, 420, 0, 0], [580, 1000, 0, 0]]);
export const WHOLE: Piece[][] = [[], ...[1, 2, 3, 4, 5, 6].map(wholeOf)];
export const WRECK: Piece[][] = [
  [],
  // floor 1: its far half sags toward the gap
  [[0, 420, 0, 0], [580, 790, 0, 45]],
  // floor 2: whole, both halves
  [[180, 420, 0, 0], [580, 1000, 0, 0]],
  // floor 3: its far half sags
  [[0, 420, 0, 0], [580, 790, 0, 45]],
  // floor 4: caved in on the left (all but a ledge of it by the shaft): down through it to floor 3
  [[330, 420, 0, 0], [580, 1000, 0, 0]],
  // floor 5: its far half sags toward the gap, steep
  [[0, 420, 0, 0], [580, 790, 0, 50]],
  // the clock room's floor
  [[180, 420, 0, 0], [580, 1000, 0, 0]],
];
// (a sagging half tears away short of the wall: drop off its low end onto the climb's middle ledge below)
/** Floor 3's way up: the clock's counterweight (a ton of iron on its chain), going up and down by the wall, from
 *  its floor to the gap in the floor over it. Ride it. */
export const LIFT = { k: 3, x: U(40), w: 130, top: F(3) - 330, bottom: F(3), period: 330 };
export const liftY = (frame: number) => LIFT.bottom + (LIFT.top - LIFT.bottom) * (0.5 - 0.5 * Math.cos((frame / LIFT.period) * Math.PI * 2));
/** Floor 5's near half: rotten boards (stand on one and it cracks, and goes: down to floor 4), till the crash. */
export const ROTTEN = { k: 5, boards: [[150, 215], [215, 280], [280, 350], [350, 420]] as [number, number][] };
/** Floor 4's net's torn out: a gap over the shaft (jump it; miss it and it's floor 3 again). */
export const TORN_NET = 4;
/** The shaft jammed with wreckage at these floors, after (the car's torn-off roof, girders across): stand on them. */
export const JAMS = [1, 2, 5];
/** A slab piece's floor height at u (world y). */
export const pieceY = (k: number, p: Piece, u: number) => F(k) + p[2] + (p[3] - p[2]) * Math.max(0, Math.min(1, (u - p[0]) / (p[1] - p[0])));
/** Where to stand an enemy on floor k at u (the slab's top there, wrecked or whole). */
export const floorAt = (k: number, u: number, wrecked: boolean) => {
  if (k === 0) return GY;
  const p = (wrecked ? WRECK : WHOLE)[k].find(q => u >= q[0] && u <= q[1]);
  return p ? pieceY(k, p, u) : F(k);
};

// ---------------------------------------------------------------------------------------------------------------
// The ledges (one-way). Up the far half of every floor to its gap (they're the way down too); and the extras.

export const LEDGES: [number, number, number][] = [];
for (let k = 0; k < STORIES; k++) {
  const f = F(k);
  // (floor 3's way up is the clock's counterweight instead: LIFT)
  if (k === 3) continue;
  // (the middle one's far end under the gap: up through the top one from there)
  if (upRight(k)) LEDGES.push([U(590), f - 105, 120], [U(760), f - 200, 140], [U(875), f - 290, 120]);
  else LEDGES.push([U(290), f - 105, 120], [U(100), f - 200, 140], [U(5), f - 290, 120]);
}
// floor 1: a shelf out over the shaft (a long jump from the middle ledge: ammo on it)
LEDGES.push([U(440), F(1) - 240, 120]);
// the clock room: up to the bell's gallery, and a ledge over the way in
export const GALLERY: [number, number, number] = [U(700), TOP - 230, 290];
LEDGES.push([U(600), TOP - 115, 100], GALLERY, [U(40), TOP - 150, 200]);
// down the chute: rock shelves to catch himself on (or not)
export const CHUTE_LEDGES: [number, number, number][] = [[U(310), GY + 560, 110], [U(590), GY + 760, 110], [U(320), GY + 960, 100], [U(570), GY + 1130, 120]];

// ---------------------------------------------------------------------------------------------------------------
// The support beams: one per floor, floor to ceiling, on the half he comes in on (he can't get by without ramming it);
// the main support up in the clock room, by the shaft. How many hits each takes, how it looks.

export interface BeamDef { k: number; x: number; w: number; hp: number; look: 'wood' | 'steel' | 'main' }
export const BEAMS: BeamDef[] = [
  { k: 0, x: U(300), w: 34, hp: 1, look: 'wood' },
  { k: 1, x: U(620), w: 34, hp: 1, look: 'wood' },
  { k: 2, x: U(376), w: 36, hp: 2, look: 'steel' },
  { k: 3, x: U(620), w: 36, hp: 2, look: 'wood' },
  { k: 4, x: U(380), w: 38, hp: 2, look: 'steel' },
  { k: 5, x: U(600), w: 38, hp: 2, look: 'steel' },
  { k: 6, x: U(356), w: 54, hp: 3, look: 'main' },
];
/** The beam's top (the slab over it, or the clock room's roof). */
export const beamTop = (b: BeamDef) => (b.k < STORIES ? F(b.k + 1) + SLAB : ROOF);

// ---------------------------------------------------------------------------------------------------------------
// The works

/** The gears on the walls (and one half sunk in a floor): center, radius, spin (radians a frame); a roller goes back
 *  and forth between x and x + roll. */
export interface GearDef { x: number; y: number; r: number; spin: number; roll?: number; wholeOnly?: boolean }
/** A gear by floor k's climb, against the wall it climbs: between the middle and top ledges (don't fall off the middle
 *  one's far end). */
const climbGear = (k: number, spin: number): GearDef => ({ x: upRight(k) ? U(965) : U(35), y: F(k) - 170, r: 28, spin: upRight(k) ? spin : -spin });
export const GEARS: GearDef[] = [
  climbGear(0, 0.03), climbGear(1, 0.035), climbGear(2, 0.04), climbGear(4, 0.045), climbGear(5, 0.05),
  // floor 1: the cuckoo floor's climb has a second one, over the middle ledge's near end
  { x: U(200), y: F(1) - 300, r: 22, spin: 0.06 },
  // floor 3: beside the counterweight's run (stand on its far end, not its near one, riding up)
  { x: U(232), y: F(3) - 210, r: 24, spin: 0.05 },
  // floor 3: one half sunk in the floor on the way to the beam, teeth up (jump it)
  { x: U(760), y: F(3) + 8, r: 30, spin: 0.06, wholeOnly: true },
  // floor 5: over the middle ledge's far end (jump from its near end)
  { x: U(215), y: F(5) - 310, r: 22, spin: -0.06 },
  // the clock room: the gear train, high up round the clock (the look of it)
  { x: U(930), y: ROOF + 110, r: 52, spin: 0.012 },
  { x: U(840), y: ROOF + 70, r: 30, spin: -0.02 },
];

/** The pendulums: the pivot (the ceiling), the length, the swing (radians either side), its period (frames), phase.
 *  At the ends of its swing it's up over his head; at the bottom it's not. (None swings out over the shaft far: the
 *  car's way, and his, down it.) `wild`: after, the tower leaning, it swings further and faster; `snaps`: after, it's
 *  down, its blade stuck in the floor (jump it). */
export interface PendDef { x: number; y: number; len: number; amp: number; period: number; phase: number; snaps?: boolean }
export const PENDULUMS: PendDef[] = [
  // floor 2: the first (time it: the beam's under the end of its swing)
  { x: U(360), y: F(3) + SLAB, len: 280, amp: 0.4, period: 140, phase: 0, snaps: true },
  // floor 5: over the way in, the beam under the end of its swing
  { x: U(720), y: F(6) + SLAB, len: 290, amp: 0.55, period: 130, phase: 0.25 },
];

/** The cuckoo clocks on the walls (their birds come out at him): [x, y] (the clock's middle). */
export const CUCKOOS: [number, number][] = [
  // floor 1: the cuckoo floor (one by the way in, one over the beam, one up the climb)
  [U(780), F(1) - 240], [U(560), F(1) - 300], [U(330), F(1) - 300],
  [U(340), F(3) - 260],
  [U(500), F(4) - 280],
  [U(780), F(5) - 260],
  [U(880), TOP - 380],
];

/** Who's where: [kind, u across, floor] (stood on the floor there; a bride on a ledge: the ledge's y given instead). */
export type TowerFoe = 'igor' | 'mummy' | 'bride' | 'ringer' | 'wolfman' | 'monster';
export type FoeAt = [TowerFoe, number, number | 'floor', number];
/** On the way up. */
export const FOES: FoeAt[] = [
  // floor 1: an igor (the pitchfork: don't charge him from the front), between him and the beam
  ['igor', 720, 'floor', 1],
  // floor 2: the mummy, past the beam, on the way to the climb (slow, takes a beating)
  ['mummy', 690, 'floor', 2],
  // floor 3: the bell ringer on the long half (the hammer), an igor at the climb
  ['ringer', 760, 'floor', 3],
  ['igor', 330, 'floor', 3],
  // floor 4: an igor at the beam, a wolfman across the shaft (he comes when the beam's out), a bride up the climb
  ['igor', 350, 'floor', 4],
  ['wolfman', 820, 'floor', 4],
  ['bride', 790, F(4) - 200, 4],
  // floor 5: the monster at the climb, a bride up it
  ['monster', 300, 'floor', 5],
  ['bride', 70, F(5) - 290, 5],
  // the clock room: an igor at the main support, a bride over the way in, the clock's own figure up by the bell
  ['igor', 335, 'floor', 6],
  ['bride', 140, TOP - 150, 6],
  ['ringer', 860, GALLERY[1], 6],
];
/** On the way down (the staff regrouped: everything from before that's still standing is gone). */
export const DESCENT_FOES: FoeAt[] = [
  ['ringer', 860, GALLERY[1], 6],
  // floor 5: an igor coming up the sag at him
  ['igor', 760, 'floor', 5],
  // floor 4: a bride on the climb he goes down
  ['bride', 790, F(4) - 200, 4],
  // floor 3: the bell ringer on the sag, between him and the gap
  ['ringer', 700, 'floor', 3],
  // floor 2: the mummy in front of the way down
  ['mummy', 230, 'floor', 2],
  // floor 1: the monster on the sag
  ['monster', 700, 'floor', 1],
  // the ground floor: security, up from the bay
  ['wolfman', 620, 'floor', 0],
  ['igor', 690, 'floor', 0],
];
/** Security, out of the CAST MEMBERS ONLY door when the operator calls them. */
export const SECURITY: TowerFoe[] = ['wolfman', 'igor'];

/** Floor 2's pendulum, snapped: its blade stuck in the floor here, after (u). */
export const BLADE_U = 280;

/** The pickups (small: Meathead 2's lean): [u, y (where it sits), type, after the crash only]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo', boolean][] = [
  // floor 1: on the shelf out over the shaft
  [500, F(1) - 240, 'small_ammo', false],
  // floor 2: right under the pendulum's swing
  [320, F(2), 'small_health', false],
  // floor 4: on the ledge left of the shaft, across from the climb (after: the way through the floors, not the shaft)
  [375, F(4), 'small_health', true],
  // the chute: on a shelf
  [640, GY + 760, 'small_health', true],
];

/** The car: how high it goes (its floor, at the top: in the clock room), where it hangs. */
export const CAR_W = 150, CAR_H = 120;
export const CAR_TOP = TOP - 40;
/** The seats in the car (from its middle). */
export const SEATS = [-48, -16, 16, 48];

/** Where the ladders go once Spooky Land has them (moves/ladders.ts, LadderDef {x, top, bottom}): not wired yet.
 *  Up: the clock room's gallery (a ladder up to the bell); floor 3, a perch over the bell ringer's beat (shoot it
 *  from the ladder); floor 5, the way up to its beam's floor runs up a ladder that tops out beside the beam (no
 *  ramming from a ladder: off it first). Down: a ladder hanging off the edge of floor 4's cave-in, down to floor 3;
 *  one torn loose and dangling in the shaft under floor 5's jam (a step off it onto floor 4). */
export const LADDER_SPOTS: { x: number; top: number; bottom: number; after?: boolean }[] = [
  { x: U(975), top: GALLERY[1], bottom: TOP },
  { x: U(700), top: F(3) - 200, bottom: F(3) },
  { x: U(345), top: F(4) + 10, bottom: F(3) - 40, after: true },
  { x: U(560), top: F(5) + 30, bottom: F(4) - 60, after: true },
];
