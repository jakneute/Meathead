// The town, laid out (x from the section's start, heights up from the ground line). Every stretch has a job, and each
// thing it teaches comes in alone first, then escalates, then mixes. He jumps about 145 up at most: nothing he has to
// reach is more than ~120 over where he can stand.
//
//   0      The gate in (a rest). Steps up onto the PLAZA. The first LADDER (safe, nothing about: learn to climb): the
//          apothecary's fire escape up to its balcony (a health); or hop the crate and the BLOOD-COLA machine up to it.
//          Bats over the plaza (of course there's bats), the fountain to hop, a bedsheet ghost (the basic grunt).
//   1540   The street: the selfie-station gallows (a step up to the potion shop's balcony, a crow perched over it), rats,
//          a ghost, the CRYPT-O ATM.
//   2350   SET PIECE: the SPINNING COFFIN CUPS. A turntable the coffins sweep across, left to right, along the floor:
//          they knock him flying if they hit him; jump on one and it carries him over (and up to the canopy over the
//          hub: ammo). Rats on the turntable.
//   2950   CHECKPOINT (the kiddie rides). The long straight: the wolfman (the rusher), alone; then another.
//   3550   The ADA ramp up to the crypt terrace (the phone-charging coffin; a crow on the lamp, the cat).
//   4450   SET PIECE: the BAT-O-ROUND. Its bat seats go round and bob up and down: they shove him walking through
//          (riding into him), so ride one; up on one at the top of its bob he can get onto the roof (a health). Or
//          the second LADDER, its service ladder, a bat over the roof: shoot it from the ladder.
//   5000   The monster (the bruiser), alone, on open ground; a hearse parked to hop.
//   5800   CHECKPOINT (the ghost train). SET PIECE: the LI'L GHOST TRAIN, the only way over the BOTTOMLESS MOAT:
//          stand behind the line, ride it over (it runs both ways); bats and a witch (the flyer, the thrower) over the
//          moat while he rides.
//   7100   SET PIECE: the MINI DROP OF DOOM: ride its seat ring up (all six feet of it) to the balconies (the high road:
//          a crow, the witch over it, ammo), or stay low (the mix: a monster, a wolfman, a ghost). It drops: not under it.
//          The third LADDER, the balconies' fire escape at the far end: the way up from below, the witch over it (shoot
//          her from the ladder, or she pelts him all the way up).
//   8350   SET PIECE: the SKELETON PONY, a coin ride that bucks: stand on the saddle and it throws him up onto the
//          arcade's roof (a health), over the skeleton (the shield) holding the arcade under it. Or take him on in there:
//          no jumping over him under that roof.
//   9150   CHECKPOINT (the castle stairs). The sign: DRACULA'S OTHER CASTLE. Two long flights up, a landing between (the
//          skeleton holding it), jack-o'-lanterns rolled down at him by the pumpkin-head at the top (jump them; get up
//          there and stop him), bats, a wolfman coming down; the castle's door at the top: in, to the castle.
//
// Back the other way it all still goes: the ramp, the terrace's drop, the train (it shuttles), the stairs down.

import { SECTIONS, GY } from '../geometry';

export const X = (rx: number) => SECTIONS.town.x0 + rx;
export const Y = (h: number) => GY - h;

/** The plaza (raised a step), the ADA ramp and terrace, the moat, the stairs. */
export const PLAZA = { a: 560, b: 640, c: 1460, d: 1540, h: 50 } as const;
export const RAMP = { r0: 3550, r1: 3850, t1: 4300, h: 110 } as const;
export const MOAT = { a: 6150, b: 6750 } as const;
export const STAIRS = { a0: 9400, a1: 10300, land1: 10600, b1: 11400, mid: 300, top: 600 } as const;

/** Ground: [from x, from height, to x, to height, surface]. Between runs that don't meet: a pit (the moat). */
export const GROUND: [number, number, number, number, string][] = [
  [-200, 0, PLAZA.a, 0, 'cobbles'],
  [PLAZA.a, 0, PLAZA.b, PLAZA.h, 'stairs'],
  [PLAZA.b, PLAZA.h, PLAZA.c, PLAZA.h, 'stone'],
  [PLAZA.c, PLAZA.h, PLAZA.d, 0, 'stairs'],
  [PLAZA.d, 0, RAMP.r0, 0, 'cobbles'],
  [RAMP.r0, 0, RAMP.r1, RAMP.h, 'stone'],
  [RAMP.r1, RAMP.h, RAMP.t1, RAMP.h, 'stone'],
  [RAMP.t1, 0, MOAT.a, 0, 'cobbles'],
  [MOAT.b, 0, STAIRS.a0, 0, 'cobbles'],
  [STAIRS.a0, 0, STAIRS.a1, STAIRS.mid, 'stairs'],
  [STAIRS.a1, STAIRS.mid, STAIRS.land1, STAIRS.mid, 'stone'],
  [STAIRS.land1, STAIRS.mid, STAIRS.b1, STAIRS.top, 'stairs'],
  [STAIRS.b1, STAIRS.top, 12040, STAIRS.top, 'stone'],
];

/** Solid things (walk into them, stand on them): [x, top height, w, base height, what]. */
export type SolidWhat = 'crate' | 'vending' | 'fountain' | 'statue' | 'hearse' | 'arcade';
export const SOLIDS: [number, number, number, number, SolidWhat][] = [
  [700, 110, 56, PLAZA.h, 'crate'],
  [770, 170, 60, PLAZA.h, 'vending'],
  [1000, 90, 160, PLAZA.h, 'fountain'],
  [1060, 160, 40, 90, 'statue'],
  [5480, 62, 170, 0, 'hearse'],
  // (the arcade's roof: a ceiling over the skeleton, a high road over him)
  [8450, 150, 520, 118, 'arcade'],
];

/** Things to stand on (one-way: balconies, the gallows): [x, height, width]. */
export const LEDGES: [number, number, number][] = [
  [860, 270, 170], // the apothecary's balcony (off the vending machine)
  [1640, 100, 160], // the gallows' platform (the selfie station)
  [1860, 210, 180], // the potion shop's balcony
  [2550, 165, 100], // the coffin cups' hub canopy
  [4420, 205, 405], // the BAT-O-ROUND's roof (and the service ledge off its left end, where the ladder comes up)
  [7230, 200, 160], [7470, 210, 160], [7710, 200, 170], // the drop tower's balconies (the high road)
];

export type TownKind = 'm2:town_bat' | 'm2:town_crow' | 'm2:town_rat' | 'm2:town_cat' | 'm2:town_ghost' | 'm2:town_wolfman' | 'm2:town_monster' | 'm2:town_witch' | 'm2:town_skeleton' | 'm2:town_pumpkinhead';
/** Who's where: [kind, x, height (of what it stands on; a bat or a witch: where it flies; a crow: its perch)]. */
export const ENEMIES: [TownKind, number, number][] = [
  // the plaza: bats, then a ghost
  ['m2:town_bat', 1250, 220], ['m2:town_bat', 1420, 200],
  ['m2:town_ghost', 1350, PLAZA.h],
  // the street: a crow over the gallows, rats, a ghost
  ['m2:town_crow', 1950, 300],
  ['m2:town_rat', 2080, 0], ['m2:town_ghost', 2250, 0],
  // the cups: rats on the turntable
  ['m2:town_rat', 2700, 0], ['m2:town_rat', 2820, 0],
  // the long straight: a wolfman alone, then another
  ['m2:town_wolfman', 3250, 0], ['m2:town_wolfman', 3500, 0],
  // the terrace: a crow on the lamp, the cat
  ['m2:town_crow', 4205, 290], ['m2:town_cat', 4100, RAMP.h],
  // over the carousel
  ['m2:town_bat', 4700, 330],
  // the monster, alone
  ['m2:town_monster', 5250, 0],
  // the moat: bats, the witch over it; a ghost waiting at the far station
  ['m2:town_bat', 6300, 210], ['m2:town_witch', 6560, 270], ['m2:town_ghost', 6950, 0],
  // the drop tower: the high road (a crow, the witch) and the low (the mix)
  ['m2:town_crow', 7560, 330], ['m2:town_witch', 7800, 360],
  ['m2:town_monster', 7500, 0], ['m2:town_wolfman', 7900, 0], ['m2:town_ghost', 8150, 0], ['m2:town_cat', 8250, 0],
  // the arcade: the skeleton, alone, under its roof
  ['m2:town_skeleton', 8740, 0],
  // the stairs
  ['m2:town_bat', 9850, 380], ['m2:town_skeleton', 10470, STAIRS.mid],
  ['m2:town_bat', 10950, 640], ['m2:town_wolfman', 11520, STAIRS.top], ['m2:town_pumpkinhead', 11700, STAIRS.top], ['m2:town_crow', 11850, 790],
];

/** Lying about up the side routes (lean: just these, small, each for going out of the way). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [960, 270, 'small_health'],
  [2600, 165, 'small_ammo'],
  [4650, 205, 'small_health'],
  [7795, 200, 'small_ammo'],
  [8900, 150, 'small_health'],
];

/** The haunted kiddie rides (set pieces: rides.ts): where each one stands. */
export type RideId = 'cups' | 'carousel' | 'train' | 'drop' | 'pony';
export const CUPS = { x: 2600, r: 230, cupW: 72, cupH: 44 } as const;
export const CAROUSEL = { x: 4650, r: 175, roofH: 205, seats: 6 } as const;
/** The train: its stations (where its left end stops), its length. */
export const TRAIN = { a: 5975, b: 6770, len: 170 } as const;
export const DROP = { x: 7150, w: 104, lo: 16, hi: 92 } as const;
export const PONY = { x: 8360 } as const;
export const RIDES: { id: RideId; x: number }[] = [
  { id: 'cups', x: CUPS.x }, { id: 'carousel', x: CAROUSEL.x }, { id: 'train', x: 6050 }, { id: 'drop', x: DROP.x }, { id: 'pony', x: PONY.x },
];

/** The ladders (Spooky Land's own: moves/ladders.ts), taught here: [x, bottom height, top height, why, where he steps
 *  off at the top (x from the ladder)]. The first is
 *  safe (nothing about: just learn to climb, up to the apothecary's balcony and its health); the second goes up the
 *  carousel's side to its roof with a bat over it (shoot it from the ladder); the third is the high road's back way up
 *  at the drop tower, the witch hovering over it (shoot her from the ladder, or she pelts you all the way up). */
export const LADDERS: [number, number, number, string, number][] = [
  [880, PLAZA.h, 270, 'apothecary fire escape', 40],
  [4432, 0, 205, 'carousel service ladder', 40],
  [7898, 0, 200, 'balcony fire escape', -40],
];

/** The gas lamps (lit after dark): [x, height of what it stands on]. */
export const LAMPS: [number, number][] = [
  [470, 0], [1500, 0], [3000, 0], [4205, RAMP.h], [5750, 0], [6880, 0], [8300, 0], [9250, 0], [10560, STAIRS.mid], [11500, STAIRS.top],
];

export const CHECKPOINTS = [
  { name: 'THE TOWN SQUARE', cp: 0, x: X(200), y: GY },
  { name: 'THE KIDDIE RIDES', cp: 1, x: X(2950), y: GY },
  { name: 'THE GHOST TRAIN', cp: 2, x: X(5800), y: GY },
  { name: 'THE CASTLE STAIRS', cp: 3, x: X(9150), y: GY },
];
