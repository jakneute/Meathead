// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part two, laid out (x from the section's start, heights up from the
// ground line: Y(h) = GY - h). The West Wing as the show draws it: one floor, room after room, cut away along their backs
// to the one eye. Teach, then escalate (on from part one's vacuum, wax, chandelier, bowling balls and sprinklers): each
// new hazard alone first, then with company; each new mean man alone first, then mixed; breathing room after each fight.
//
//   0      THE WEST COLONNADE (cp 30): in off the Rose Garden; a goon, then a SPIN DOCTOR alone (taught).
//   1100   THE WEST WING OFFICES: THE FILING CABINETS (too tall to jump): drawers shoot out of their faces on a rhythm
//          (steps while they're out; one sliding out into him shoves him off, hurt). A short one alone (one drawer each
//          face), then a tall one (four), the spy blimp over the gap between; a pollster and a DITTOHEAD (taught) past it.
//   2300   THE ROOSEVELT ROOM (cp 31), done up as the EIB studio: a lobbyist, pickups, then RUSH LIMBAUGH (the arena
//          2650..3450: his broadcast desk, two ledges).
//   3600   THE KITCHENS (cp 32): THE RANGE (a step up; its four burners flare in turn: the ring glows and ticks first)
//          across the way; THE JELL-O MOLD (land on it: it throws him up) up to THE POT RACK over the range (a pickup, a
//          way over); a goon, the blimp over the range, a dittohead and a spin doctor past it.
//   5000   THE CABINET ROOM (cp 33): pickups, a goon, then BOB DOLE (the arena 5450..6250: the cabinet table, two
//          ledges).
//   6400   THE MAP ROOM (cp 34): THE GLOBE on its stand; past it, it drops off and rolls after him (run!); a pollster in
//          the way (it flattens him too); up the step onto the map cabinet at the far end before it gets him; it smashes
//          into the step and splits in two (and stays split). A dittohead past it.
//   7800   THE SITUATION ROOM (cp 35): SECURITY LASERS: two blinking beams alone (they flicker first), then a goon, then
//          THE SWEEPING BEAM (a beam across the room going up and down: over it low, under it high) between two more
//          blinkers; a spin doctor past it.
//   9300   THE OUTER OVAL (cp 36): breathing room, pickups, the Oval Office's door.
//   9950   THE OVAL OFFICE: NEWT GINGRICH (the arena 10000..10800: the Resolute desk, two ledges); then the Clintons on
//          the TV, and the projection screen comes down (finale.ts): the real stage, the Newt actor's body, the
//          Chelsea actress being sick. After that (checkpoint 37, the stage): the wings open at the right (the backstage
//          area), the stage door at the far end: on to the big-kid rides.

import { SECTIONS, GY } from '../geometry';

export const x0 = SECTIONS.whitehouse2.x0, x1 = SECTIONS.whitehouse2.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The ceiling's height (one floor all the way). */
export const CEIL = 520;
/** The rooms' back walls' depth about the eye, their props' (the fake 3D: one eye). */
export const D_BACK = 0.8, D_PROPS = 0.88;

// ---------------------------------------------------------------------------------------------------------------
// The rooms

export type RoomId = 'colonnade' | 'offices' | 'roosevelt' | 'kitchen' | 'cabinet' | 'map' | 'situation' | 'outer' | 'oval' | 'backstage';
export interface Room { id: RoomId; a: number; b: number; name: string; outdoors?: boolean }
export const ROOMS: Room[] = [
  { id: 'colonnade', a: -200, b: 1100, name: 'THE WEST COLONNADE', outdoors: true },
  { id: 'offices', a: 1100, b: 2300, name: 'THE WEST WING OFFICES' },
  { id: 'roosevelt', a: 2300, b: 3600, name: 'THE ROOSEVELT ROOM' },
  { id: 'kitchen', a: 3600, b: 5000, name: 'THE KITCHENS' },
  { id: 'cabinet', a: 5000, b: 6400, name: 'THE CABINET ROOM' },
  { id: 'map', a: 6400, b: 7800, name: 'THE MAP ROOM' },
  { id: 'situation', a: 7800, b: 9300, name: 'THE SITUATION ROOM' },
  { id: 'outer', a: 9300, b: 9950, name: 'THE OUTER OVAL' },
  { id: 'oval', a: 9950, b: 10850, name: 'THE OVAL OFFICE' },
  { id: 'backstage', a: 10850, b: 12200, name: 'BACKSTAGE' },
];
export const roomAt = (rx: number) => ROOMS.find(r => rx >= r.a && rx < r.b) ?? (rx < 0 ? ROOMS[0] : ROOMS[ROOMS.length - 1]);

/** The Oval Office's far wall (till the screen comes down: the end of the show's White House). */
export const OVAL_WALL = 10850;
/** The stage door (after the screen's down: the way out of the studio, on to the big-kid rides). */
export const STAGE_DOOR = { a: 11760, b: 11900 };

// ---------------------------------------------------------------------------------------------------------------
// What he stands on

/** THE FILING CABINETS: their faces (from, to), their tops, the heights of the drawers' tops (each face has them). The
 *  drawers burst out top first (a ripple down, `ripple` frames apart), stay out `out` frames, and slam shut bottom first:
 *  so whichever drawer he's on, the one above it is already out (climbing never gets him shoved), and the climb's a
 *  race against the bottom ones shutting. Every `period` frames; `phase` (0..1) offsets one cabinet from another. */
export interface Cabinet { a: number; b: number; h: number; drawers: number[]; period: number; out: number; ripple: number; phase: number }
export const CAB_A: Cabinet = { a: 1380, b: 1460, h: 170, drawers: [78], period: 170, out: 105, ripple: 0, phase: 0 };
export const CAB_B: Cabinet = { a: 1780, b: 1880, h: 330, drawers: [72, 148, 224, 296], period: 300, out: 200, ripple: 12, phase: 0.3 };
export const CABINETS = [CAB_A, CAB_B];
/** How far a drawer slides out of its face, how deep its front is (the box under its top). */
export const DRAWER_W = 66, DRAWER_D = 34;
/** Limbaugh's broadcast desk (a solid top in his arena). */
export const DESK_EIB = { a: 2990, b: 3110, h: 92 };
/** THE JELL-O MOLD (land on it: it throws him up), THE RANGE (a solid step, its burners on top), THE POT RACK (one-way,
 *  hung over the range). */
export const JELLO = { a: 3870, b: 3970, h: 46 };
export const RANGE = { a: 4100, b: 4560, h: 110 };
export const BURNERS: number[] = [4165, 4275, 4385, 4495];
export const BURNER_PERIOD = 190;
export const POT_RACK = { a: 4070, b: 4590, h: 250 };
/** The cabinet table (a solid top across the middle of Dole's arena). */
export const CAB_TABLE = { a: 5680, b: 6020, h: 80 };
/** THE GLOBE: its stand, its size, where he sets it off, the step and the map cabinet at the far end (and a footstool
 *  down the far side, the way back). */
export const GLOBE = { stand: 6560, r: 56, standH: 112, trigger: 6700, max: 4.05 };
export const MAP_STEP = { a: 7400, b: 7470, h: 62 };
export const MAP_CAB = { a: 7470, b: 7650, h: 132 };
export const MAP_STOOL = { a: 7650, b: 7710, h: 64 };
/** The Resolute desk (a solid top in Newt's arena). */
export const RESOLUTE = { a: 10360, b: 10480, h: 92 };
/** Solid things (a lit top): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [
  [CAB_A.a, CAB_A.b, CAB_A.h], [CAB_B.a, CAB_B.b, CAB_B.h], [DESK_EIB.a, DESK_EIB.b, DESK_EIB.h], [JELLO.a, JELLO.b, JELLO.h],
  [RANGE.a, RANGE.b, RANGE.h], [CAB_TABLE.a, CAB_TABLE.b, CAB_TABLE.h], [MAP_STEP.a, MAP_STEP.b, MAP_STEP.h],
  [MAP_CAB.a, MAP_CAB.b, MAP_CAB.h], [MAP_STOOL.a, MAP_STOOL.b, MAP_STOOL.h], [RESOLUTE.a, RESOLUTE.b, RESOLUTE.h],
];
/** One-way ledges: [from, to, height] (the arenas' are with the arenas). */
export const LEDGES: [number, number, number][] = [[POT_RACK.a, POT_RACK.b, POT_RACK.h]];

// ---------------------------------------------------------------------------------------------------------------
// The lasers

/** THE BLINKING BEAMS (floor to ceiling): [x, phase (0..1 of the cycle)]. */
export const BLINKERS: [number, number][] = [[8000, 0], [8230, 0.5], [8560, 0.25], [9030, 0.75]];
export const BLINK_PERIOD = 170;
/** THE SWEEPING BEAM: across [a, b], up and down between lo and hi (heights) every period. */
export const SWEEP = { a: 8640, b: 8960, lo: 22, hi: 150, period: 230 };

// ---------------------------------------------------------------------------------------------------------------
// The pundits' arenas

export interface Arena { a: number; b: number; floor: number; trigger: number; ledges: [number, number, number][] }
export const LIMBAUGH_ARENA: Arena = { a: 2650, b: 3450, floor: 0, trigger: 2740, ledges: [[2720, 2840, 160], [3260, 3380, 160]] };
export const DOLE_ARENA: Arena = { a: 5450, b: 6250, floor: 0, trigger: 5540, ledges: [[5500, 5610, 200], [6090, 6200, 200]] };
export const NEWT_ARENA: Arena = { a: 10000, b: 10800, floor: 0, trigger: 10090, ledges: [[10060, 10180, 170], [10620, 10740, 170]] };

// ---------------------------------------------------------------------------------------------------------------
// The mean men, the pickups, the checkpoints

/** [kind, x, height of its feet]. */
export const CAST: [string, number, number][] = [
  ['m2:ct_goon', 760, 0], ['m2:ct_spindoc', 1040, 0],
  ['m2:ct_blimp', 1620, 380], ['m2:ct_pollster', 2010, 0], ['m2:ct_ditto', 2190, 0],
  ['m2:ct_lobbyist', 2540, 0],
  ['m2:ct_goon', 3760, 0], ['m2:ct_blimp', 4330, 400], ['m2:ct_ditto', 4720, 0], ['m2:ct_spindoc', 4890, 0],
  ['m2:ct_goon', 5330, 0],
  ['m2:ct_pollster', 7160, 0], ['m2:ct_ditto', 7750, 0],
  ['m2:ct_goon', 8440, 0], ['m2:ct_spindoc', 9180, 0], ['m2:ct_blimp', 8800, 420],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [960, 0, 'small_ammo'],
  [CAB_B.a + 50, CAB_B.h, 'small_health'],
  [2420, 0, 'small_health'], [2480, 0, 'small_ammo'],
  [4330, POT_RACK.h, 'small_health'],
  [5150, 0, 'small_health'], [5210, 0, 'small_ammo'],
  [MAP_CAB.a + 90, MAP_CAB.h, 'small_ammo'],
  [9230, 0, 'small_health'],
  [9600, 0, 'small_health'], [9660, 0, 'small_ammo'], [9720, 0, 'small_health'],
];
export const CHECKPOINTS = [
  { name: 'THE WEST COLONNADE', cp: 30, x: X(200), y: GY },
  { name: 'THE ROOSEVELT ROOM', cp: 31, x: X(2340), y: GY },
  { name: 'THE KITCHENS', cp: 32, x: X(3680), y: GY },
  { name: 'THE CABINET ROOM', cp: 33, x: X(5080), y: GY },
  { name: 'THE MAP ROOM', cp: 34, x: X(6440), y: GY },
  { name: 'THE SITUATION ROOM', cp: 35, x: X(7840), y: GY },
  { name: 'THE OUTER OVAL', cp: 36, x: X(9400), y: GY },
  // (set by the screen coming down, never by walking past: the real stage)
  { name: 'THE REAL STAGE', cp: 37, x: X(10180), y: GY, manual: true },
];

/** Once each a visit, passing: [the gag, from x, to x]. */
export const GAG_AT: [string, number, number][] = [
  ['colonnade', 120, 500], ['drawers', 1300, 1400], ['jello', 3800, 3880], ['range', 4060, 4120], ['lasers', 7900, 8000], ['oval', 9420, 9700],
];
/** Chelsea's hints (the first time he gets to each). */
export const HINT_AT: [string, number, number][] = [
  ['westwing', 300, 700], ['drawers', 1250, 1380], ['blimp', 1560, 1700], ['ditto', 2100, 2250], ['kitchen', 3640, 3850], ['jello', 3820, 3880],
  ['map', 6440, 6650], ['lasers', 7850, 7980], ['sweep', 8500, 8640], ['oval', 9350, 9600],
];
