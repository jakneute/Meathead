// Real hell, laid out (world x from the section's x0 = D; GY the ground). Left to right:
//
//   the pit      D+0..1300     the shaft he falls down from the top of the clock tower (rock both sides, far up), the
//                              wrecked elevator car and its riders all over the floor; the way back up (MAINTENANCE
//                              STAIRS) in the left rock. Every so often another car comes down the shaft.
//   the critters D+1300..3300  taught one at a time: an imp (thrower), another up on a rock; a hellhound (rusher), then
//                              two; fire bats (flyers) over the first lava.
//   the steps    D+3300..7150  the platforming, taught then escalated: a lava puddle to hop; a wider pool with a rock in
//                              it; a fire jet, then three in a row; crumbling rocks over a pool; the hell goat (pointy:
//                              horns) on its own; then the lake: rocks, a jet on one, crumbling rocks, an imp on a pillar,
//                              bats over it.
//   the shore    D+7150..7900  two hounds and an imp; the big health and ammo; the gate into the demon's pit.
//   the arena    D+7900..9400  the demon (BLOATHAZAR); its far side shut by a wall of fire till he's beaten.
//   the doorstep D+9400..11000 Satan's lake; the geyser vent (EXPRESS TO SURFACE): the way up to Donnie's control room.

import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.hell;
export const D = x0;

/** The pit's shaft (he falls down it from the clock tower), and how far up its rock goes. */
export const SHAFT_L = D + 150, SHAFT_R = D + 950, SHAFT_TOP = GY - 2600;
/** Where he comes in from the top of the clock tower (feet, in the air over the pit). */
export const DROP_IN = { x: D + 560, y: GY - 1500 };
/** The rock over the pit's ways out: low over the tunnel up (left), and the overhang he walks out under (right). */
export const LEFT_ROCK_BOTTOM = GY - 190, RIGHT_ROCK_BOTTOM = GY - 260, RIGHT_ROCK_W = 320;
/** The wrecked car (its middle), and the way back up to the clock tower (walk into it). */
export const WRECK_X = D + 520;
export const STAIRS_X = D + 70;

/** Lava pools: [from, to] (the lava's a little under the ground). */
export const LAVA_DROP = 40;
export const POOLS: [number, number][] = [
  [D + 3450, D + 3610],
  [D + 3950, D + 4350],
  [D + 5150, D + 5560],
  [D + 6150, D + 7150],
];
/** Rocks that stay put: [x, top, w] (solid down into the lava). */
export const ROCKS: [number, number, number][] = [
  [D + 4110, GY - 40, 80],
  [D + 6260, GY - 60, 110],
  [D + 6770, GY - 90, 120],
];
/** Rocks that crumble under him (one-way ledges): [x, y, w]. */
export const CRUMBLES: [number, number, number][] = [
  [D + 5235, GY - 50, 100],
  [D + 5395, GY - 70, 100],
  [D + 6450, GY - 100, 90],
  [D + 6610, GY - 130, 90],
  [D + 6965, GY - 70, 95],
];
/** Fire jets: [x, the floor it's set in, its phase in the cycle (frames)]. */
export const JETS: [number, number, number][] = [
  [D + 4620, GY, 0],
  [D + 4840, GY, 0], [D + 4960, GY, 50], [D + 5080, GY, 100],
  [D + 6315, GY - 60, 30],
];
/** Plain rock ledges (the critters' stretch, and the arena's two). */
export const LEDGES: [number, number, number][] = [
  [D + 1880, GY - 110, 200], [D + 2130, GY - 210, 180],
  [D + 8130, GY - 165, 170], [D + 9050, GY - 165, 170],
];

/** The big health and ammo, before the demon. */
export const REFILL_X = D + 7760;
/** The demon's pit: in at ARENA_IN (always open), out at ARENA_OUT (fire till he's beaten); where he lounges. */
export const ARENA_IN = D + 7900, ARENA_OUT = D + 9400, DEMON_HOME = D + 8420;
export const ARENA_MID = (ARENA_IN + ARENA_OUT) / 2;
/** Satan's geyser vent: the way up to Donnie's control room (and where he's put coming back down from it). */
export const VENT_X = D + 9950;
export const BACK_IN_X = D + 10350;
