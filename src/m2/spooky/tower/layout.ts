// The clock tower's layout: where everything is (shared by the running, index.ts, and the painting, art.ts).
//
// Left to right (world x):
//   x0 .. TX0      the ELEVATOR TO HELL loading bay: the way back to the hallway, the wait-time sign, HOW THE RIDE
//                  WORKS on the wall, the queue's switchbacks (riders in line), the operator's booth at the gate, the
//                  boarding platform (the car docks there), the CAST MEMBERS ONLY door (security comes out of it)
//   TX0 .. TX1     the clock tower, inside: in through its maintenance door at the foot of it. Seven floors up
//                  (stories 0..5, then the clock room at the top), each one a full floor slab with a stairwell gap at
//                  one end, the zigzag up them; the ride's shaft up the middle of it (SH0..SH1), the car going up it
//                  behind; safety nets across the shaft at every floor (they snap when the car falls), the grate over
//                  the shaft at the foot of it (and under that, a level down, the ride's "hell": its floor breaks open
//                  into the real one)
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
export const TX0 = x0 + 1700, TX1 = x0 + 2900;
export const WALL = 40;
/** The ride's shaft up the middle. */
export const SH0 = TX0 + 520, SH1 = TX0 + 680, SHM = (SH0 + SH1) / 2;
/** The maintenance door's height (in through the tower's foot from the bay). */
export const DOOR_H = 150;
/** Each floor's height (floor to floor), and how thick a floor slab is. */
export const STORY = 380, SLAB = 24;
/** Floor k's top (0: the ground floor; 6: the clock room's). */
export const F = (k: number) => GY - k * STORY;
export const STORIES = 6;
/** The clock room: its floor, its ceiling. */
export const TOP = F(STORIES), ROOF = TOP - 560;
/** The ride's "hell", a level under the tower's foot (its floor's what breaks open into the real one). */
export const B1 = GY + 320;
/** Fallen this far below the ground floor, through the hole: on into the real hell. */
export const HELL_AT = GY + 760;
/** The stairwell gap in each floor slab: how wide; which end (story k's way up out of it: right if k is even). */
export const GAP = 150;
export const upRight = (k: number) => k % 2 === 0;

/** Each floor slab k (1..6): its solid stretches (the shaft's own stretch is a net, separate). */
export const slabRuns = (k: number): [number, number][] => {
  // (the gap is at the end story k-1 climbs out of)
  const right = upRight(k - 1);
  const a = right ? TX0 : TX0 + GAP, b = right ? TX1 - GAP : TX1;
  return [[a, SH0], [SH1, b]];
};

/** The ledges up to each story's way out: [x, y, w] (one-way). */
export const LEDGES: [number, number, number][] = [];
for (let k = 0; k < STORIES; k++) {
  const f = F(k), r = upRight(k);
  const at = (dx: number, w: number) => (r ? TX1 - dx - w : TX0 + dx);
  // (the top one under the gap, the middle one half under it: no bumping his head on the slab going up)
  LEDGES.push([at(270, 140), f - 100, 140], [at(100, 130), f - 195, 130], [at(10, 120), f - 290, 120]);
}
// (the clock room: up to the bell's gallery, and the gear train's walkway)
export const GALLERY: [number, number, number] = [TX1 - 330, TOP - 230, 320];
LEDGES.push([TX1 - 470, TOP - 115, 110], GALLERY, [TX0 + 60, TOP - 150, 220]);

/** The support beams: which story, where (x: its left side), how wide, how many hits it takes, how it looks. One per
 *  story, and the main support in the clock room. Floor to ceiling: he can't get by one without breaking it. */
export interface BeamDef { k: number; x: number; w: number; hp: number; look: 'wood' | 'steel' | 'main' }
export const BEAMS: BeamDef[] = [
  { k: 0, x: TX0 + 330, w: 34, hp: 1, look: 'wood' },
  { k: 1, x: TX0 + 470, w: 34, hp: 1, look: 'wood' },
  { k: 2, x: TX1 - 480, w: 36, hp: 2, look: 'steel' },
  { k: 3, x: TX0 + 470, w: 36, hp: 2, look: 'wood' },
  { k: 4, x: TX1 - 480, w: 38, hp: 2, look: 'steel' },
  { k: 5, x: TX0 + 470, w: 38, hp: 2, look: 'steel' },
  { k: 6, x: SH0 - 70, w: 54, hp: 3, look: 'main' },
];
/** The beam's top (the slab over it, or the clock room's roof). */
export const beamTop = (b: BeamDef) => (b.k < STORIES ? F(b.k + 1) + SLAB : ROOF);

/** The gears on the walls (and the ones rolling along a floor): center, radius, spin (radians a frame); a roller goes
 *  back and forth between x and x + roll. */
export interface GearDef { x: number; y: number; r: number; spin: number; roll?: number }
/** A gear by story k's climb: `dx` in from the wall it climbs up against, `dy` up off the floor. */
const climbGear = (k: number, dx: number, dy: number, r: number, spin: number): GearDef => ({ x: upRight(k) ? TX1 - dx : TX0 + dx, y: F(k) - dy, r, spin: upRight(k) ? spin : -spin });
export const GEARS: GearDef[] = [
  // story 0: the first one, by the climb (between the ledges, against the wall: don't drop off the middle one there)
  climbGear(0, 40, 150, 30, 0.03),
  // story 1: two by the climb
  climbGear(1, 40, 150, 30, 0.035), climbGear(1, 300, 330, 28, -0.05),
  // story 2: one half sunk in the floor's middle, teeth up (jump it)
  { x: TX0 + 790, y: F(2) + 8, r: 30, spin: 0.06 },
  climbGear(2, 40, 150, 30, 0.04),
  // story 3: by the climb
  climbGear(3, 40, 150, 30, 0.04), climbGear(3, 300, 330, 28, 0.05),
  // story 4: a roller along the floor (jump it as it comes)
  { x: TX0 + 300, y: F(4) - 30, r: 30, spin: 0.08, roll: 190 },
  climbGear(4, 40, 150, 30, 0.045),
  // story 5: the climb's lined with them
  climbGear(5, 40, 150, 30, 0.05), climbGear(5, 300, 330, 30, -0.06), climbGear(5, 200, 60, 26, 0.07),
  // the clock room: the gear train, high up round the clock (out of reach: the look of it)
  { x: TX1 - 120, y: ROOF + 110, r: 52, spin: 0.012 },
  { x: TX1 - 210, y: ROOF + 70, r: 30, spin: -0.02 },
];

/** The pendulums: the pivot (the ceiling), the length, the swing (radians either side), its period (frames), phase. */
/** (none of them swings out over the shaft: the car's way, and his, down it) */
export interface PendDef { x: number; y: number; len: number; amp: number; period: number; phase: number }
export const PENDULUMS: PendDef[] = [
  // story 2: the first one, swinging over the floor (time it)
  { x: TX0 + 400, y: F(3) + SLAB, len: 300, amp: 0.4, period: 150, phase: 0 },
  // story 4: by the climb
  { x: TX1 - 330, y: F(5) + SLAB, len: 270, amp: 0.7, period: 130, phase: 0.3 },
  // story 5: one more, by the way in
  { x: TX1 - 300, y: F(6) + SLAB, len: 300, amp: 0.7, period: 140, phase: 0.25 },
];

/** The cuckoo clocks on the walls (their birds come out at him): [x, y] (the clock's middle). */
export const CUCKOOS: [number, number][] = [
  [TX1 - 380, F(1) - 220],
  [TX0 + 260, F(3) - 230], [TX1 - 280, F(3) - 250],
  [TX0 + 900, F(4) - 260],
  [TX1 - 300, F(5) - 230],
  [TX1 - 150, TOP - 380],
];

/** Who's where in the tower (cuckoos aside): [kind, x, the floor it's on]. The bell ringers' patrols: their home ±. */
export type TowerFoe = 'igor' | 'mummy' | 'bride' | 'ringer' | 'wolfman' | 'monster';
/** (none of them stood over the shaft: its nets go, and they'd go down it) */
export const FOES: [TowerFoe, number, number][] = [
  // story 1: an igor (the pitchfork: don't charge him from the front), in front of the beam
  ['igor', TX0 + 780, F(1)],
  // story 2: the mummy, on the way to the beam (slow, and takes a lot)
  ['mummy', TX0 + 470, F(2)],
  // story 3: the bell ringer (the automaton: the hammer), an igor by the climb
  ['ringer', TX0 + 860, F(3)],
  ['igor', TX0 + 300, F(3)],
  // story 4: the mix (a bride lobbing her bouquet down off the climb, wolfmen running him down, an igor at the beam)
  ['bride', TX1 - 190, F(4) - 195],
  ['wolfman', TX0 + 450, F(4)],
  ['igor', TX0 + 700, F(4)],
  ['wolfman', TX0 + 960, F(4)],
  // story 5: all of it
  ['monster', TX0 + 800, F(5)],
  ['ringer', TX0 + 1000, F(5)],
  ['igor', TX0 + 420, F(5)],
  ['mummy', TX0 + 300, F(5)],
  ['bride', TX0 + 75, F(5) - 290],
  // the clock room: the clock's own figure up by the bell, and a last couple at the main support
  ['ringer', GALLERY[0] + 160, GALLERY[1]],
  ['bride', TX0 + 170, TOP - 150],
  ['igor', TX0 + 390, TOP],
];
/** Security, out of the CAST MEMBERS ONLY door when the operator calls them. */
export const SECURITY: TowerFoe[] = ['wolfman', 'igor'];

/** The car: how high it goes (its floor, at the top: in the clock room), where it hangs. */
export const CAR_W = 150, CAR_H = 120;
export const CAR_TOP = TOP - 40;
/** The riders in line (scenery), and seats in the car (from its middle). */
export const SEATS = [-48, -16, 16, 48];
