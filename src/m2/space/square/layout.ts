// The square, laid out (x from the section's start, heights up from the ground line). Every stretch has a job; each
// thing it teaches comes in alone first, then escalates, then mixes. He jumps about 145 up at most.
//
//   0      Under the FUTURELAND gate (a rest; the PA's welcome). The shops: ROVER-1s (the robot dogs: slide them),
//          a rocket trash can to hop, the SPACE FOOD STICKS kiosk's dome (up top, a health), a space cadet (the grunt).
//   1800   SET PIECE: THE PEOPLE MOVER. A belt with him (it carries him, and a robot dog on it), then one against him
//          with a cadet at the far end shooting down it.
//   3000   CHECKPOINT. Park security on the HOVER-PATROL (the rusher), alone. Then the ELECTRIC SIDEWALK ("SAFE AS
//          MILK"): one plate alone (buzz, then live: learn the tell), then three, out of step, a cadet past them.
//   4900   SET PIECE: THE WALL OF TOMORROW across the street, too tall to jump: a THRUST PAD ("FEEL THE THRUST")
//          launches him up onto it (a small ammo up there); another on the far side for the way back.
//   5400   CHECKPOINT. The cardboard robot (the bruiser), alone; a robot dog.
//   5880   SET PIECE: THE MONORAIL OF TOMORROW, EXPRESS ONLY: up the station steps onto the track, over the FUTURE SITE
//          OF TOMORROW (a pit: COMING 1964) on its beam. The trains never stop: ride one's roof over (jump on as it
//          comes), or walk the beam between them. A jetpacker over the pit; cadets at the far end.
//   8050   CHECKPOINT (the atom plaza). The mix: a people mover running him into a live plate, jetpackers, the guard,
//          the robot, cadets; the queue's sign; the giant atom's doors (in: the atom section's start).
//
// Back the other way it all still goes: the wall's second pad, the beam (or a train's roof, then off backwards).

import { SECTIONS, GY } from '../geometry';

export const X = (rx: number) => SECTIONS.square.x0 + rx;
export const Y = (h: number) => GY - h;

/** The pit under the monorail (FUTURE SITE OF TOMORROW), the track over it, the wall, the atom's doors. */
export const PIT = { a: 6500, b: 7400 } as const;
export const TRACK = { a: 6060, b: 7820, h: 180 } as const;
export const WALL = { x: 5150, w: 100, h: 230 } as const;
export const DOORS_X = 9870;

/** Ground: [from x, to x] at street level (between them: the pit). */
export const GROUND: [number, number][] = [[-200, PIT.a], [PIT.b, 10200]];

export type SolidWhat = 'trashcan' | 'wall' | 'planter';
/** Solid things (walk into them, stand on them): [x, top height, w, what]. */
export const SOLIDS: [number, number, number, SolidWhat][] = [
  [760, 70, 40, 'trashcan'],
  [WALL.x, WALL.h, WALL.w, 'wall'],
  [8240, 54, 80, 'planter'],
];
export type LedgeWhat = 'kiosk' | 'steps' | 'deck' | 'awning';
/** Things to stand on (one-way): [x, height, width, what]. */
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [1110, 120, 150, 'kiosk'],
  [6130, 90, 110, 'steps'], [7700, 90, 110, 'steps'],
  [8560, 150, 150, 'deck'],
  [3300, 110, 130, 'awning'],
];

/** The people movers: [from x, to x, speed (+ right)]. */
export const BELTS: [number, number, number][] = [[1800, 2300, 2.2], [2420, 2920, -2.6], [8380, 8880, 3]];
/** The electric sidewalk's plates: [x, width, its clock's offset]. */
export const PLATES: [number, number, number][] = [
  [3750, 140, 0],
  [4040, 140, 40], [4260, 140, 110], [4480, 140, 180],
  [8900, 140, 150], [9180, 140, 60],
];
/** The thrust pads: [x, width, height of what it's on]. Both 'step' here (stood on, it counts down). */
export const PADS: [number, number, number][] = [[4980, 90, 0], [5300, 90, 0]];
/** The monorail: one track, trains every so often. */
export const MONO = { a: TRACK.a, b: TRACK.b, len: 250, v: 6, period: 460, off: 0 } as const;
export const TRACK_LEGS = [6300, 6800, 7300, 7650];

export type SquareKind = 'm2:space_rover' | 'm2:space_cadet' | 'm2:space_guard' | 'm2:space_robot' | 'm2:space_jetpack';
/** Who's where: [kind, x, height (what it stands on; a jetpacker: where it flies)]. */
export const ENEMIES: [SquareKind, number, number][] = [
  // the shops: a robot dog alone (slide it); then a cadet up on the kiosk's dome by its health, shooting down, and a
  // robot dog under it at his ankles (low and high at once)
  ['m2:space_rover', 900, 0], ['m2:space_rover', 1330, 0],
  ['m2:space_cadet', 1200, 120],
  // the people movers: a robot dog riding the first; a cadet on the second, carried at him as it shoots down it
  ['m2:space_rover', 2100, 0], ['m2:space_cadet', 2770, 0],
  // the guard, alone
  ['m2:space_guard', 3620, 0],
  // a cadet stood between the out-of-step plates, shooting at him while he times them (or shove him onto a live one)
  ['m2:space_cadet', 4220, 0],
  // the robot, alone (off the checkpoint); a robot dog
  ['m2:space_robot', 5820, 0], ['m2:space_rover', 5960, 0],
  // the monorail: a jetpacker over the pit; a cadet at the far end, another up the far station's steps shooting up the
  // beam at him
  ['m2:space_jetpack', 7000, 330], ['m2:space_cadet', 7560, 0], ['m2:space_cadet', 7730, 90],
  // the atom plaza: the mix
  ['m2:space_jetpack', 8500, 320], ['m2:space_guard', 9450, 0], ['m2:space_cadet', 8650, 150],
  ['m2:space_robot', 9620, 0], ['m2:space_jetpack', 9300, 340], ['m2:space_rover', 9720, 0],
];

/** Lying about up the side routes (lean: small, each for going out of the way). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1185, 120, 'small_health'],
  [WALL.x + WALL.w / 2, WALL.h, 'small_ammo'],
  [3365, 110, 'small_ammo'],
  [8610, 150, 'small_health'],
];

/** The horn speakers (the PA): [x, height]. And the googie lamps (lit after dark). */
export const SPEAKERS: [number, number][] = [[470, 190], [2330, 190], [4000, 190], [6000, 300], [8318, 190], [9620, 190]];
export const LAMPS = [120, 1000, 1900, 2800, 3650, 4600, 5470, 7500, 8545, 9235, 9965];

export const CHECKPOINTS = [
  { name: 'FUTURELAND SQUARE', cp: 0, x: X(150), y: GY },
  { name: 'THE PEOPLE MOVER', cp: 1, x: X(3150), y: GY },
  { name: 'THE WALL OF TOMORROW', cp: 2, x: X(5420), y: GY },
  { name: 'THE ATOM PLAZA', cp: 3, x: X(8100), y: GY },
];
