// The town, laid out (x from the section's start, heights up from the ground line). Teach, then escalate:
//
//   0      THE TOWN SQUARE. The gate in; the square's modern conveniences (free Wi-Fi on a gas lamp, a vending
//          machine, the selfie-station gallows, the crypt's ATM). The ELEVATOR TO HELL's clock tower far off behind
//          (his first look at it). Bats first (of course), then the bedsheet ghosts (the basic grunt), rats; a balcony
//          up over the shops (a health, for going up there).
//   2500   The SPINNING COFFIN CUPS. The wolfman (the rusher): one alone, on the flat, then another.
//   3200   CHECKPOINT. THE KIDDIE RIDES. The ADA ramp up to the crypt terrace (the phone-charging coffin up there), a
//          crow on its lamp; the BAT-O-ROUND carousel (its roof to stand on, ammo up there), bats over it; the mangy cat;
//          the stitched-up monster (the bruiser), alone.
//   5900   CHECKPOINT. THE GHOST TRAIN. The LI'L GHOST TRAIN for toddlers; the witch on her broom (the flyer and
//          thrower), alone; then the mix: a monster and a wolfman together, the MINI DROP OF DOOM, the shops' balconies
//          (a health up top) with a witch over them, a ghost, crows, a cat; the skeleton behind his tombstone (the
//          shield), alone, by the SKELETON PONY.
//   9200   CHECKPOINT. THE CASTLE STAIRS. The sign: DRACULA'S OTHER CASTLE. Two long flights up (a landing between,
//          a skeleton holding it, a witch over the top flight, bats, a wolfman coming down), the castle's door at the
//          top: in, to the castle.
//
// Back the other way it all still goes (the ramp, the terrace's drop, the stairs down).

import { SECTIONS, GY } from '../geometry';

export const X = (rx: number) => SECTIONS.town.x0 + rx;
export const Y = (h: number) => GY - h;

/** The stairs: the bottom flight, the landing, the top flight, and the top. */
export const STAIRS = { a0: 9400, a1: 10300, land1: 10560, b1: 11400, mid: 300, top: 600 } as const;
/** The ADA ramp up to the crypt terrace, and the terrace. */
export const RAMP = { r0: 3500, r1: 3800, t1: 4250, h: 110 } as const;

/** Ground: [from x, from height, to x, to height, surface]. */
export const GROUND: [number, number, number, number, string][] = [
  [-200, 0, RAMP.r0, 0, 'cobbles'],
  [RAMP.r0, 0, RAMP.r1, RAMP.h, 'stone'],
  [RAMP.r1, RAMP.h, RAMP.t1, RAMP.h, 'stone'],
  [RAMP.t1, 0, STAIRS.a0, 0, 'cobbles'],
  [STAIRS.a0, 0, STAIRS.a1, STAIRS.mid, 'stairs'],
  [STAIRS.a1, STAIRS.mid, STAIRS.land1, STAIRS.mid, 'stone'],
  [STAIRS.land1, STAIRS.mid, STAIRS.b1, STAIRS.top, 'stairs'],
  [STAIRS.b1, STAIRS.top, 12040, STAIRS.top, 'stone'],
];

/** Things to stand on (one-way: balconies, the gallows, the carousel's roof...): [x, height, width]. */
export const LEDGES: [number, number, number][] = [
  [1280, 100, 170], // the gallows' platform (the selfie station)
  [1900, 120, 180], [2140, 230, 170], // the shops' balconies
  [4720, 170, 330], // the BAT-O-ROUND's roof
  [6930, 130, 170], // the mausoleum restrooms' roof
  [7600, 120, 170], [7840, 230, 170], [8080, 120, 170], // more balconies
];

export type TownKind = 'm2:town_bat' | 'm2:town_crow' | 'm2:town_rat' | 'm2:town_cat' | 'm2:town_ghost' | 'm2:town_wolfman' | 'm2:town_monster' | 'm2:town_witch' | 'm2:town_skeleton';
/** Who's where: [kind, x, height (of what it stands on; a bat or a witch: where it flies; a crow: its perch)]. */
export const ENEMIES: [TownKind, number, number][] = [
  // the square: bats, then the sheets, rats
  ['m2:town_bat', 900, 170], ['m2:town_bat', 1250, 200],
  ['m2:town_ghost', 1600, 0], ['m2:town_ghost', 2050, 0],
  ['m2:town_rat', 2300, 0], ['m2:town_rat', 2420, 0],
  // the wolfman, alone; another
  ['m2:town_wolfman', 2950, 0], ['m2:town_wolfman', 3400, 0],
  // the terrace, the carousel, the cat, the monster alone
  ['m2:town_crow', 4120, 290], ['m2:town_rat', 4050, RAMP.h],
  ['m2:town_bat', 4800, 300], ['m2:town_bat', 5050, 260],
  ['m2:town_cat', 4500, 0],
  ['m2:town_monster', 5500, 0],
  // the witch, alone
  ['m2:town_witch', 6450, 230],
  ['m2:town_ghost', 6650, 0], ['m2:town_rat', 6780, 0],
  // the mix
  ['m2:town_monster', 7150, 0], ['m2:town_wolfman', 7450, 0],
  ['m2:town_crow', 7700, 330], ['m2:town_witch', 7950, 340], ['m2:town_ghost', 8150, 0], ['m2:town_cat', 8300, 0],
  // the skeleton, alone
  ['m2:town_skeleton', 8780, 0],
  // the stairs
  ['m2:town_bat', 9800, 330], ['m2:town_ghost', 9900, 0 /* (set on the stairs at build) */],
  ['m2:town_skeleton', 10450, STAIRS.mid],
  ['m2:town_bat', 10700, 560], ['m2:town_witch', 11000, 760], ['m2:town_wolfman', 11650, STAIRS.top], ['m2:town_crow', 11850, 790],
];

/** Lying about up the side routes (lean: just these). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2225, 230, 'small_health'],
  [4885, 170, 'small_ammo'],
  [7925, 230, 'small_health'],
  [10430, STAIRS.mid, 'small_ammo'],
];

/** The haunted kiddie rides (drawn in the back): where each stands, and what he makes of it as he passes. */
export type RideId = 'cups' | 'carousel' | 'train' | 'drop' | 'pony';
export const RIDES: { id: RideId; x: number }[] = [
  { id: 'cups', x: 2650 }, { id: 'carousel', x: 4885 }, { id: 'train', x: 6250 }, { id: 'drop', x: 7300 }, { id: 'pony', x: 8650 },
];

/** The gas lamps (lit after dark): [x, height of what it stands on]. */
export const LAMPS: [number, number][] = [
  [700, 0], [1800, 0], [3300, 0], [4180, RAMP.h], [5700, 0], [6700, 0], [8450, 0], [9250, 0], [10520, STAIRS.mid], [11550, STAIRS.top],
];

export const CHECKPOINTS = [
  { name: 'THE TOWN SQUARE', cp: 0, x: X(200), y: GY },
  { name: 'THE KIDDIE RIDES', cp: 1, x: X(3200), y: GY },
  { name: 'THE GHOST TRAIN', cp: 2, x: X(5900), y: GY },
  { name: 'THE CASTLE STAIRS', cp: 3, x: X(9200), y: GY },
];
