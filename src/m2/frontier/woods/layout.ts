// Where everything is in the woods (x from the section's start; the ground's flat at GY all the way: a dirt trail
// through real woods, outside the park's back fence):
//
//      0  THE TREELINE (cp 40): in from the crew's clearing (one-way: its left end's a dead end, the river bank and a
//         thicket). The first thing: a real
//         NO TRESPASSING sign nailed to a real tree, buckshot holes in it. Power lines along the trail.
//    500  THE TRAIL: litter (cans, a tire, a mattress, a shopping cart), a fallen tree over the trail (jump it, or stand
//         on it); POISON IVY taught alone (a scout troop's LEAVES OF THREE, LET IT BE on a stake); a crow.
//   1080  A REAL BEAR TRAP, alone, rusty, chained to a stump in the leaves (no sign out here; it glints).
//   1300  a boulder to jump from over a wider patch of ivy; a second crow.
//   1600  THE DIRT LOT (cp 41): the local kids' spot: dirt jumps, a plywood ramp on cinder blocks, a burnt couch, a fire
//         ring and its cans, DIRT RATS sprayed on a boulder; the refill (big health, big ammo) before the bounty; the LEAF
//         PILE by the trail.
//   1900  THE BOUNTY: the kid pulls up, the kick, MINE, Tucker out of the leaf pile, the offer (scene.ts); then off on
//         the kid's bike into the dirt-bike chase (DOORS.dirtbike.start). After: the kid he kicked off sulking on a
//         stump, the pile scattered, the lot empty; off the right end on foot to the chase's start.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.woods.x0, x1 = SECTIONS.woods.x1;
export const X = (rx: number) => x0 + rx;
export { GY };

export const CP_LOT = 1600;
/** The NO TRESPASSING tree. */
export const SIGN_TREE = 320;
/** Power poles along the trail (a pair of wires sagging between each). A pair of sneakers hung over one span. */
export const POLES = [120, 640, 1160, 1680, 2200, 2720];
/** The fallen tree across the trail: a log you jump (or stand on). [a, b, height] */
export const FALLEN: [number, number, number] = [560, 660, 26];
/** The boulder before the second patch of ivy (stand on it, jump from it). [a, b, height] */
export const BOULDER: [number, number, number] = [1230, 1300, 40];
/** Poison ivy patches [a, b], and the scout sign before the first. */
export const IVY: [number, number][] = [[840, 920], [1310, 1420]];
export const SCOUT_SIGN = 770;
/** The real bear trap, and its stump. */
export const TRAP_X = 1080;
/** Crows (the wilds' kind) [x, height]. */
export const CROWS: [number, number][] = [[980, 210], [1460, 240]];
/** Litter on the trail: [x, what]. */
export type Litter = 'can' | 'cans' | 'tire' | 'mattress' | 'cart' | 'bag' | 'tv' | 'bottle' | 'bottles' | 'fastfood' | 'cup' | 'cooler' | 'tires' | 'pizza';
/** (the playtest's: lots more of it; none of it in the ivy, on the trap or in the way: set dressing only) */
export const LITTER: [number, Litter][] = [
  [90, 'cup'], [180, 'bottles'], [260, 'can'], [370, 'fastfood'], [430, 'bag'], [470, 'tires'], [520, 'tire'],
  [700, 'pizza'], [720, 'cans'], [760, 'cup'], [990, 'mattress'], [1010, 'fastfood'], [1150, 'bottle'], [1180, 'cans'],
  [1450, 'cooler'], [1500, 'cart'], [1560, 'bottles'], [1640, 'cans'], [1700, 'cup'], [1780, 'can'], [1840, 'fastfood'],
  [2010, 'bottles'], [2180, 'pizza'], [2260, 'tv'], [2330, 'cup'], [2480, 'cans'], [2560, 'fastfood'], [2660, 'bag'],
  [2760, 'tires'], [2880, 'bottles'], [2950, 'can'],
];
/** The refill before the bounty. */
export const REFILL = 1760;
/** Where he's stood for the bounty; the leaf pile (behind him by then: he walked right past it). */
export const TRIG = 1900, PILE = 1700;
/** The lot's props. */
export const COUCH = 2380, FIRE = 2560, RAMP = 2140, TAG_ROCK = 2820;
/** The dirt jumps in the lot's back lane (the kids loop over them). */
export const MOUNDS = [2050, 2350, 2650];
/** The stump the kicked-off kid sulks on, after. */
export const SULK = 2080;
/** The lot's back lane (feet y) and the far one, and how big people look on each (one shared eye: further is smaller). */
export const LANES = [{ y: GY, s: 1 }, { y: GY - 26, s: 0.82 }, { y: GY - 48, s: 0.64 }] as const;
