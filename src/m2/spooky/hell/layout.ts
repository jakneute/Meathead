// Real hell, laid out (world x from the section's x0 = D; GY the ground). A designed run, left to right: each thing
// taught on its own, then pushed, then mixed in with the rest, with rests between and a side path or two with something
// on it for whoever takes the risk.
//
//   the pit       D+0..1300     he lands at the bottom of the shaft from the top of the clock tower. The wrecked car
//                               (stand on its roof: up from there to a ledge on the shaft wall, ammo on it) and its
//                               riders in bits all over. The ride's still boarding: now and then another car comes down
//                               the shaft (a shadow and a creak first). The STAIRS UP back to the tower in the left rock.
//   the bone yard D+1300..2400  a rest, then the imp: one on a low rock (a thrower, up off the floor), then one higher
//                               (ammo on its rock for getting up there).
//   the hound run D+2400..3400  a long flat run for the rushers: one hound, then two; a rock step in the middle of it to
//                               get up out of a pounce.
//   the first lava D+3400..4500 a puddle to hop; then a pool with one rock in it and bats over it (flyers over the pit).
//   the vents     D+4500..5150  one fire jet alone (watch it); then three in a wave, under a rock shelf: the high road
//                               over them has an imp on it and health at its end.
//   the crumbles  D+5150..5650  rocks that give way under him, over a pool; checkpoint after.
//   the goat      D+5650..6150  the horned goat alone on a flat (don't charge it: jump it, from the rock).
//   the lake      D+6150..7150  all of it at once: a rock with a jet on it, crumbling rocks climbing, an imp on a
//                               pillar, bats over it; a crumbling rock way up high with health on it.
//   the shore     D+7150..7900  hounds on the run in, the goat, an imp on a rock; the big health and ammo; the gate.
//   the arena     D+7900..9400  the demon (BLOATHAZAR); its far side shut by a wall of fire till he's beaten.
//   the doorstep  D+9400..11000 Satan's lake; the geyser vent (EXPRESS TO SURFACE): the way up to Donnie's control room.

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
export const WRECK_X = D + 400;
/** The wreck's cab (solid: stand on its roof), and the ledge on the shaft wall up from it. */
export const CAB_W = 112, CAB_H = 124;
export const STAIRS_X = D + 70;

/** Lava pools: [from, to] (the lava's a little under the ground). */
export const LAVA_DROP = 40;
export const POOLS: [number, number][] = [
  [D + 3450, D + 3610],
  [D + 3950, D + 4350],
  [D + 5150, D + 5560],
  [D + 6150, D + 7150],
];
/** Rocks that stay put: [x, top, w] (solid down into the lava, or up off the floor). */
export const ROCKS: [number, number, number][] = [
  // (the hound run's step)
  [D + 2880, GY - 54, 100],
  // (the pool's one rock)
  [D + 4110, GY - 40, 80],
  // (the step up to the shelf over the vents)
  [D + 4700, GY - 100, 70],
  // (the goat's rock)
  [D + 6000, GY - 64, 110],
  // (the lake: the jet's rock, the imp's pillar)
  [D + 6260, GY - 60, 110],
  [D + 6770, GY - 90, 120],
];
/** Rocks that crumble under him (one-way ledges): [x, y, w]. */
export const CRUMBLES: [number, number, number][] = [
  [D + 5235, GY - 50, 100],
  [D + 5395, GY - 70, 100],
  [D + 6450, GY - 100, 90],
  [D + 6610, GY - 130, 90],
  [D + 6640, GY - 245, 70],
  [D + 6965, GY - 70, 95],
];
/** Fire jets: [x, the floor it's set in, its phase in the cycle (frames)]. One alone; three in a wave; one on a rock. */
export const JETS: [number, number, number][] = [
  [D + 4600, GY, 0],
  [D + 4860, GY, 0], [D + 4980, GY, 45], [D + 5100, GY, 90],
  [D + 6315, GY - 60, 30],
];
/** Plain rock ledges (jump up through them): [x, y, w]. */
export const LEDGES: [number, number, number][] = [
  // (the shaft wall's, up from the wreck's roof)
  [D + 150, GY - 240, 110],
  // (the imps' rocks)
  [D + 1850, GY - 110, 200], [D + 2130, GY - 220, 170],
  // (the shelf over the vents)
  [D + 4790, GY - 200, 380],
  // (the shore's imp)
  [D + 7520, GY - 120, 130],
  // (the arena's two)
  [D + 8130, GY - 165, 170], [D + 9050, GY - 165, 170],
];
/** Pickups put out on the side paths (for whoever goes up there): [x, the floor under it, small health or ammo]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [D + 205, GY - 240, 'small_ammo'],
  [D + 2260, GY - 220, 'small_ammo'],
  [D + 5140, GY - 200, 'small_health'],
  [D + 6675, GY - 245, 'small_health'],
];
/** Set dressing: cages hung on chains (x, how low), bone piles (x). */
export const CAGES: [number, number][] = [[D + 1450, 260], [D + 3700, 300], [D + 5800, 250], [D + 9700, 280]];
export const BONES: number[] = [D + 1380, D + 1720, D + 2600, D + 4450, D + 5620, D + 7250, D + 9550, D + 10100, D + 10600];

/** The big health and ammo, before the demon. */
export const REFILL_X = D + 7760;
/** The demon's pit: in at ARENA_IN (always open), out at ARENA_OUT (fire till he's beaten); where he lounges. */
export const ARENA_IN = D + 7900, ARENA_OUT = D + 9400, DEMON_HOME = D + 8420;
export const ARENA_MID = (ARENA_IN + ARENA_OUT) / 2;
/** Satan's geyser vent: the way up to Donnie's control room (and where he's put coming back down from it). */
export const VENT_X = D + 9950;
export const BACK_IN_X = D + 10350;
