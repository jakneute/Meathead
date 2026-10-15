// The secret warehouse, laid out (x from the section's start, heights up from the ground line). One long soundstage,
// its walls down (the burst-in), its steel frame and roof still up on their columns (the rigging hangs off them). The
// green-screen sets in a row along it, each a platforming stretch with the film crew on it; each new crew kind alone
// first, then mixed; the stunt wires taught again, then escalated.
//
//   0      THE BURST-IN: the throne-train down through the roof (a hole in it for good), wrecked where it landed; the
//          director's panic; the walls falling flat outward, the public staring in over them, phones up; KILL THEM ALL
//          (the crew out at the public in the background). (Off the left end: back to the coaster's stop 3.)
//   700    SET 1, THE ROOFTOP: crash mats, rostrums, a city skyline on a flat, the rooftop set's front a solid wall up to
//          its roof (impassable): a wire from the rostrum up onto the roof (the wires again), down its far side. A grip,
//          alone; a runner (a PA with a walkie and the coffee); a boom op up on the roof.
//   2600   SET 2, THE ABYSS (checkpoint): a soundstage pit dressed in green, too wide to jump: a wire over it; the
//          lighting rig over the landing (a par can comes down). Then the wider one: a wire out to a set flat hung on
//          chains over the pit, another on from it; a wind machine blowing back at it. Mocap stunt doubles, alone, then two.
//   4600   VIDEO VILLAGE AND CRAFT SERVICES (checkpoint): the craft services table (stand on it), the catering truck's
//          counter, the monitors, the director's chair. Craft services, alone (lobbing the food); the director (ACTION!:
//          his crew speeds up) with a grip and a runner. The lighting rig again. Stuntman Steve's headshot on the board.
//   6300   SET 3, THE MOTHERSHIP (checkpoint): scaffold rostrums up, a pyro trench along the floor (PYRO: HOT SET, the
//          jets going off in turn), the camera crane over it (a wire on its own loop: catch it), a landing over the far
//          end. Mocap doubles up the rostrums, a boom op, the stunt coordinator (alone: the tackle).
//   8200   SET 4, THE BATTLE OF NEW NEW YORK (checkpoint): a fake taxi, a toppled building flat (up it, or the wire), a
//          wind machine, the lighting rig, a pyro jet; everybody.
//   9600   THE CAST'S HOLDING AREA: the big health and ammo; PRINCIPAL CAST ONLY BEYOND THIS POINT (checkpoint).
//   9950   THE MAIN STAGE: the arena, one screen (the user's), a bare floor (nothing to stand on). The roll-up stage door
//          behind him, the far wall ahead; the bulldozer parked at the back; THE SCRIPT in its glass case on its plinth
//          at the back of the stage (scenery: no collision), lit from above, the velvet ropes, the laser grid: the
//          showpiece. THE ENSEMBLE CAST (cast.ts, fight.ts). Then the bulldozer through the far wall (ending.ts), out
//          into the dumpster at the lot's start (geometry.ts LOT_WALL_BREAK, LOT_DUMPSTER).

import { SECTIONS, GY } from '../geometry';
export { GY };
import type { StuntWire } from '../section';

export const x0 = SECTIONS.warehouse.x0, x1 = SECTIONS.warehouse.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;
export const R = (x: number) => x - x0;
/** His hands over his feet, hanging off a harness (wires.ts). */
export const HANDS = 80;

/** How far up the screen the back of the stage floor is (where the back wall stood; the sets stand on it). */
export const BACK = 64;
export const BACK_Y = GY - BACK;
/** The roof's underside (the trusses the rigging hangs off). */
export const ROOF_Y = GY - 640;

// ---------------------------------------------------------------------------------------------------------------
// The floor and what's on it

export const PIT_A = { a: 2950, b: 3300 } as const;
export const PIT_B = { a: 3720, b: 4280 } as const;
/** The floor: runs of it (the pits between). */
export const GROUND: [number, number][] = [[-200, PIT_A.a], [PIT_A.b, PIT_B.a], [PIT_B.b, 12700]];

export type SolidWhat = 'mat' | 'roof' | 'table' | 'taxi';
/** Solid things (stood on; walked into): [x, height, width, what]. */
export const SOLIDS: [number, number, number, SolidWhat][] = [
  [900, 40, 150, 'mat'],
  // (the rooftop set's front: a building flat, solid from the floor to its roof)
  [1820, 300, 330, 'roof'],
  [4950, 50, 170, 'table'],
  [8440, 62, 140, 'taxi'],
];
export type LedgeWhat = 'rostrum' | 'flat' | 'truck' | 'scaffold' | 'riser';
/** One-way ledges (up through, stood on): [x, height, width, what]. */
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [1290, 110, 170, 'rostrum'], [1540, 200, 160, 'rostrum'],
  // (the set flat hung on chains over the abyss)
  [3930, 60, 130, 'flat'],
  [5220, 110, 210, 'truck'],
  [6480, 120, 170, 'scaffold'], [6700, 240, 180, 'scaffold'], [7640, 130, 220, 'scaffold'], [7900, 250, 150, 'scaffold'],
  [8700, 120, 150, 'scaffold'], [8880, 240, 200, 'flat'],
];

/** The stunt wires, in a steady order (wires are matched frame to frame by their place). */
export const WIRES: StuntWire[] = [
  // up onto the rooftop set, from the high rostrum (it lets him go over the roof: he drops onto it)
  { from: { x: X(1630), y: Y(200) - HANDS }, to: { x: X(2010), y: Y(460) }, rigY: Y(600) },
  // over the abyss (it parks: back over too)
  { from: { x: X(2880), y: Y(0) - HANDS }, to: { x: X(3380), y: Y(0) }, rigY: Y(330) },
  // out to the hung flat, and on from it
  { from: { x: X(3650), y: Y(0) - HANDS }, to: { x: X(3990), y: Y(60) }, rigY: Y(360) },
  { from: { x: X(4020), y: Y(60) - HANDS }, to: { x: X(4380), y: Y(0) }, rigY: Y(380) },
  // the camera crane over the pyro trench: on its own loop
  { from: { x: X(6850), y: Y(240) - HANDS }, to: { x: X(7720), y: Y(130) }, rigY: Y(470), shuttle: true, speed: 5 },
  // up the toppled building flat
  { from: { x: X(8560), y: Y(0) - HANDS }, to: { x: X(8960), y: Y(240) }, rigY: Y(450) },
];

// ---------------------------------------------------------------------------------------------------------------
// The set's hazards (hazards.ts): the lighting rig's par cans, the pyro jets, the wind machines

/** A par can on the rig: where it hangs (it comes down on whoever's under it), its cycle's offset. */
export const LIGHTS: [number, number][] = [[3470, 0], [5520, 90], [9120, 40]];
export const LIGHT = { every: 300, tell: 70, reach: 34, dmg: 14 } as const;
/** A pyro jet in the floor: where, its cycle's offset. */
export const PYRO: [number, number][] = [[7090, 0], [7240, 60], [7390, 120], [7540, 180], [9330, 30]];
export const PYRO_T = { every: 240, tell: 50, burn: 54, h: 170, w: 46, dmg: 10 } as const;
/** A wind machine: where it stands, which way it blows, its cycle's offset. */
export const FANS: [number, -1 | 1, number][] = [[4470, -1, 0], [8280, 1, 120]];
export const FAN = { every: 330, spin: 70, gust: 130, reach: 720 } as const;

// ---------------------------------------------------------------------------------------------------------------
// The crew (kinds.ts): [kind, x, height of what it's stood on]

export type CrewKind = 'm2:hww_grip' | 'm2:hww_boom' | 'm2:hww_runner' | 'm2:hww_director' | 'm2:hww_craft' | 'm2:hww_mocap' | 'm2:hww_stuntco';
export const ENEMIES: [CrewKind, number, number][] = [
  // the burst-in's own foreground crew (on the set he comes down on: they come at him on KILL THEM ALL)
  ['m2:hww_grip', 720, 0], ['m2:hww_runner', 840, 0],
  // the rooftop: a grip alone, a runner, a boom op up on the roof, a grip down its far side
  ['m2:hww_grip', 1060, 0], ['m2:hww_runner', 1470, 0], ['m2:hww_boom', 2070, 300], ['m2:hww_grip', 2420, 0],
  // the abyss: a runner between the pits; a mocap double alone past the second, then two
  ['m2:hww_runner', 3560, 0], ['m2:hww_mocap', 4640, 0], ['m2:hww_mocap', 4790, 0], ['m2:hww_mocap', 4870, 0],
  // craft services alone (up on the truck's counter); the director with a grip and a runner
  ['m2:hww_craft', 5330, 110], ['m2:hww_director', 5760, 0], ['m2:hww_grip', 5880, 0], ['m2:hww_runner', 6000, 0],
  // the mothership: doubles up the rostrums, a boom op over the far end, the stunt coordinator alone
  ['m2:hww_mocap', 6760, 240], ['m2:hww_mocap', 6540, 120], ['m2:hww_boom', 7720, 130], ['m2:hww_stuntco', 8060, 0],
  // New New York: everybody
  ['m2:hww_grip', 8380, 0], ['m2:hww_director', 8640, 0], ['m2:hww_stuntco', 8820, 0], ['m2:hww_mocap', 8960, 240],
  ['m2:hww_craft', 9230, 0], ['m2:hww_boom', 9420, 0], ['m2:hww_runner', 9500, 0],
];

/** Lying about (lean: small ones, each for going somewhere for it). */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2110, 300, 'small_health'],
  [3990, 60, 'small_ammo'],
  [5330, 110, 'small_health'],
  [7960, 250, 'small_ammo'],
];
/** The big health and ammo before the main stage. */
export const REFILL = 9700;

// ---------------------------------------------------------------------------------------------------------------
// The main stage

/** The arena (one screen): the stage door (the lock behind him), the far wall's inside face. */
export const ARENA = { a: 9950, b: 10690 } as const;
/** The camera on the main stage (the whole of it on the screen: the stage door at its left edge, the far wall at its
 *  right). */
export const ARENA_CAM = ARENA.a - 30;
/** Where he's gone far enough in for the cast to come out. */
export const ARENA_TRIGGER = 10070;
/** The script's case on its plinth, at the back of the stage (scenery: no collision). */
export const CASE_X = 10560;
/** The bulldozer, parked at the back of the stage (its middle). */
export const DOZER_X = 10090;
/** The ending: the bulldozer brought round into the play plane (its middle), the heap ahead of its blade (its middle). */
export const DOZER_START = 10070;
export const PILE_X = 10284;

/** Back outside: the far wall smashed open, the way out to the lot. */
export const FAR_WALL = ARENA.b;

/** Steve, foreshadowed: [x, height, kind] (fliers on the frame's columns and the props, posters on the flats). */
export const STEVES: [number, number, 'flier' | 'poster' | 'standee'][] = [
  [750, 150, 'flier'], [1990, 420, 'flier'], [3610, 220, 'poster'], [5165, 0, 'standee'], [6150, 200, 'flier'],
  [8420, 260, 'poster'], [9640, 0, 'standee'],
];

export const CHECKPOINTS = [
  { name: 'THE SECRET WAREHOUSE', cp: 20, x: X(200), y: GY },
  { name: 'THE ABYSS', cp: 21, x: X(2650), y: GY },
  { name: 'CRAFT SERVICES', cp: 22, x: X(4370), y: GY },
  { name: 'THE MOTHERSHIP', cp: 23, x: X(6320), y: GY },
  { name: 'THE BATTLE OF NEW NEW YORK', cp: 24, x: X(8230), y: GY },
  // (back for another go at the cast: nobody about the refill and the stage)
  { name: 'THE ENSEMBLE CAST', cp: 25, x: X(REFILL - 60), y: GY, clear: [600, 1400] as [number, number] },
];

/** Kept across his deaths (state.stageMemo): the walls down (the burst-in seen), the cast dead, the bulldozer gone
 *  through the far wall (the leak). */
export const WALLS_MEMO = 'hollywood-warehouse-walls';
export const CAST_MEMO = 'hollywood-warehouse-cast';
export const LEAK_MEMO = 'hollywood-warehouse-leak';
