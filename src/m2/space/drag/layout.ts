// The main drag, laid out (x from the section's start, heights up from the ground line). The square's gear again, each
// pushed further and mixed, with holes in the street now (fall in one and that's it):
//
//   0      THE LANDING: flung out of the giant atom (the ride's ram), down onto the street on top of the sled in
//          front's riders. They're a smear; he's fine (landing.ts). The wreck of the sled.
//   900    The OPEN TRENCH (FUTURELAND UNDERGROUND: CAST MEMBERS ONLY): over it on two ANTI-GRAVITY SAUCERS (new: the
//          moving platforms), one bobbing, one gliding. Nothing else about: learn them.
//   1480   CHECKPOINT. A cadet, a jetpacker; a TIMED thrust pad under the monorail's station (the escalation: be on it
//          when it goes) up onto the track.
//   1700   The MONORAIL over the DRAINED LAGOON OF TOMORROW, its track's THIRD RAIL live in three stretches (plates on
//          the track, out of step): ride a train's roof over them, or walk them between buzzes, and the trains behind.
//   3500   CHECKPOINT. A long PEOPLE MOVER the wrong way (a treadmill under fire), a live plate halfway along it,
//          cadets shooting down it, a jetpacker over it.
//   4500   The street or the roofs: a timed pad up onto the googie roofs (a jetpacker, a health), or the street under
//          them (two robots, a guard, a robot dog).
//   5700   CHECKPOINT (Space Needle 2). Its plaza: plates and the guard, a step pad up to the observation balcony (ammo),
//          cadets, a robot at the lift. The lift at the end: on, up the needle (the needle section's start).
//
// Back the other way: the saucers, the track (walk it, or a train's roof then off backwards), the pads.

import { SECTIONS, GY } from '../geometry';

export const X = (rx: number) => SECTIONS.drag.x0 + rx;
export const Y = (h: number) => GY - h;

export const T1 = { a: 900, b: 1400 } as const;
export const T2 = { a: 2000, b: 3200 } as const;
export const TRACK = { a: 1700, b: 3420, h: 220 } as const;
export const LIFT_X = 7380;
/** The smear and the wreck (landing.ts): where they ended up. */
export const SMEAR = { a: 250, b: 560 } as const;
export const WRECK_X = 640;

export const GROUND: [number, number][] = [[-200, T1.a], [T1.b, T2.a], [T2.b, 7700]];
export type LedgeWhat = 'roof' | 'steps' | 'balcony';
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [3240, 110, 120, 'steps'],
  [4700, 260, 220, 'roof'], [5000, 240, 200, 'roof'], [5300, 260, 200, 'roof'],
  [6620, 280, 180, 'balcony'],
];
/** Saucers: [x, height, width, swing across, swing up, period, phase]. */
export const SAUCERS: [number, number, number, number, number, number, number][] = [
  [1030, 120, 110, 0, 60, 180, 0],
  [1270, 140, 110, 70, 0, 220, 60],
];
export const BELTS: [number, number, number][] = [[3650, 4350, -3.2]];
/** Plates: [x, width, height of what it's on, clock offset]. The first three are the track's third rail. */
export const PLATES: [number, number, number, number][] = [
  [2250, 120, TRACK.h, 0], [2600, 120, TRACK.h, 70], [2950, 120, TRACK.h, 140],
  [3940, 120, 0, 0],
  [5900, 140, 0, 0], [6150, 140, 0, 105],
];
/** Pads: [x, width, height, mode, clock offset]. */
export const PADS: [number, number, number, 'step' | 'timed', number][] = [
  [1760, 90, 0, 'timed', 0], [4580, 90, 0, 'timed', 85], [6520, 90, 0, 'step', 0],
];
export const MONO = { a: TRACK.a, b: TRACK.b, len: 270, v: 6.5, period: 400, off: 200 } as const;
export const TRACK_LEGS = [2100, 2550, 3000, 3330];

export type DragKind = 'm2:space_rover' | 'm2:space_cadet' | 'm2:space_guard' | 'm2:space_robot' | 'm2:space_jetpack';
/** Who's where: [kind, x, height]. Off the checkpoints; the two roads differ (the roofs: a robot on the health's roof,
 *  no dive kicking its antenna, a jetpacker over; the street: a robot with a dog at its feet, then the guard). */
export const ENEMIES: [DragKind, number, number][] = [
  // (by the timed pad under the station: shooting at him while he waits on it for it to go; or shove him onto it)
  ['m2:space_cadet', 1870, 0], ['m2:space_jetpack', 1900, 340],
  ['m2:space_jetpack', 2700, 420],
  ['m2:space_cadet', 4430, 0], ['m2:space_cadet', 4510, 0], ['m2:space_jetpack', 4100, 300],
  ['m2:space_robot', 4950, 0], ['m2:space_rover', 5040, 0], ['m2:space_guard', 5350, 0], ['m2:space_robot', 5100, 240],
  ['m2:space_jetpack', 5150, 420],
  // (the needle's plaza: the guard rushing across the plates at him, a cadet up on the observation balcony shooting
  // down (the pad's way up to its ammo), a cadet and a robot at the lift)
  ['m2:space_guard', 6400, 0], ['m2:space_cadet', 6740, 280], ['m2:space_cadet', 6980, 0], ['m2:space_robot', 7120, 0],
  ['m2:space_jetpack', 6800, 360],
];
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [5100, 240, 'small_health'],
  [6710, 280, 'small_ammo'],
];
export const SPEAKERS: [number, number][] = [[870, 190], [3600, 190], [6020, 190]];
export const LAMPS = [60, 560, 1550, 3300, 3960, 4500, 5620, 6450, 7190];

export const CHECKPOINTS = [
  { name: 'THE MAIN DRAG', cp: 30, x: X(700), y: GY },
  { name: 'THE LAGOON MONORAIL', cp: 31, x: X(1480), y: GY },
  { name: 'THE TREADMILL', cp: 32, x: X(3480), y: GY },
  { name: 'SPACE NEEDLE 2', cp: 33, x: X(5700), y: GY },
];
