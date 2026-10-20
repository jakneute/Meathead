// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part one, laid out (x from the section's start, heights up from the
// ground line: Y(h) = GY - h). The show's White House as a Saturday morning cartoon draws it: room after room, one long
// building cut away along its back (the rooms as sets, drawn to the one eye), the ground floor, then up the Grand
// Staircase to the second floor and out over the Truman Balcony into the Rose Garden. Teach, then escalate: each of the
// mean men alone first, then mixed; each hazard alone, then with company; breathing room after each fight.
//
//   0      THE ENTRANCE HALL (cp 20): in from behind the studio's screen; THE TRANSFORMATION (erased, drawn back in as a
//          cat), Chelsea's briefing; a lone goon past it (the hairball taught on him).
//   1100   THE CROSS HALL: THE RUNAWAY VACUUM going up and down the red carpet on its own, alone (jump it; it sucks him
//          toward it if he's in front of it); a goon at the far end.
//   2200   THE EAST ROOM (cp 21): JUST WAXED (a slick floor: he slides, so do they); a lobbyist, a goon on the wax, the
//          spy blimp; the STEINWAY to hop up on, a SWINGING CHANDELIER from it up over THE CHAIR STACK (too tall to jump),
//          down the risers on the far side (and back up them, coming back).
//   3700   THE PRESS ROOM (cp 22): ROSS PEROT (the arena 3900..4700: both sides lock till he's dead; the podium, two
//          ledges); a pickup or two before it.
//   5000   THE STATE DINING ROOM (cp 23): the mean men eating the state dinner: up and down the banquet table, the
//          sideboard; the lot of them mixed.
//   6400   THE GRAND STAIRCASE (cp 24): up the stairs to the second floor, BOWLING BALLS rolled down them at him from the
//          bowling lane's ball return up top (the pins rattle first); a ball return grate at the bottom swallows them.
//   7600   THE CENTER HALL (second floor): the mean men mixed; the Lincoln Bedroom's door.
//   8450   THE LINCOLN BEDROOM (cp 25): JERRY FALWELL (the arena 8500..9300: the Lincoln bed, two ledges).
//   9350   THE WEST SITTING HALL, the fan window; out onto THE TRUMAN BALCONY (9950).
//   10300  THE ROSE GARDEN (cp 26): down off the balcony; THE SPRINKLERS, THE ROSE BUSHES (thorns); the mean men; a
//          topiary STACK-TOWER (the land's own mechanic) back up to the balcony off the arbor and the bench; the West
//          Colonnade at the far end: on to part two (the right end).

import { SECTIONS, GY } from '../geometry';
import type { TowerDef } from '../sway';

export const x0 = SECTIONS.whitehouse1.x0, x1 = SECTIONS.whitehouse1.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The second floor's height; the ceilings' (ground floor, second floor). */
export const F2 = 300;
export const CEIL1 = 520, CEIL2 = F2 + 460;
/** The rooms' back walls' depth about the eye, their props', the near rail's (the fake 3D: one eye). */
export const D_BACK = 0.8, D_PROPS = 0.88;

// ---------------------------------------------------------------------------------------------------------------
// The rooms

export type RoomId = 'entrance' | 'crosshall' | 'eastroom' | 'press' | 'dining' | 'stairhall' | 'centerhall' | 'lincoln' | 'sitting' | 'balcony' | 'garden';
export interface Room { id: RoomId; a: number; b: number; floor: number; ceil: number; name: string; outdoors?: boolean }
export const ROOMS: Room[] = [
  { id: 'entrance', a: -200, b: 1100, floor: 0, ceil: CEIL1, name: 'THE ENTRANCE HALL' },
  { id: 'crosshall', a: 1100, b: 2200, floor: 0, ceil: CEIL1, name: 'THE CROSS HALL' },
  { id: 'eastroom', a: 2200, b: 3700, floor: 0, ceil: CEIL1, name: 'THE EAST ROOM' },
  { id: 'press', a: 3700, b: 5000, floor: 0, ceil: CEIL1, name: 'THE PRESS ROOM' },
  { id: 'dining', a: 5000, b: 6400, floor: 0, ceil: CEIL1, name: 'THE STATE DINING ROOM' },
  { id: 'stairhall', a: 6400, b: 7600, floor: 0, ceil: CEIL2, name: 'THE GRAND STAIRCASE' },
  { id: 'centerhall', a: 7600, b: 8450, floor: F2, ceil: CEIL2, name: 'THE CENTER HALL' },
  { id: 'lincoln', a: 8450, b: 9350, floor: F2, ceil: CEIL2, name: 'THE LINCOLN BEDROOM' },
  { id: 'sitting', a: 9350, b: 9950, floor: F2, ceil: CEIL2, name: 'THE WEST SITTING HALL' },
  { id: 'balcony', a: 9950, b: 10300, floor: F2, ceil: CEIL2, name: 'THE TRUMAN BALCONY', outdoors: true },
  { id: 'garden', a: 10300, b: 12200, floor: 0, ceil: CEIL2, name: 'THE ROSE GARDEN', outdoors: true },
];
export const roomAt = (rx: number) => ROOMS.find(r => rx >= r.a && rx < r.b) ?? (rx < 0 ? ROOMS[0] : ROOMS[ROOMS.length - 1]);

// ---------------------------------------------------------------------------------------------------------------
// The floor, the stairs

/** The stairs: from the ground floor at STAIRS.a up to the second floor at STAIRS.b. */
export const STAIRS = { a: 6600, b: 7400, steps: 22 };
/** Where the second floor ends at the balcony's edge (the drop into the garden). */
export const BALCONY_EDGE = 10300;
/** The floor: [from, to, height from, height to] (the stairs a slope with treads). */
export const GROUND: [number, number, number, number][] = [
  [-200, STAIRS.a, 0, 0], [STAIRS.a, STAIRS.b, 0, F2], [STAIRS.b, BALCONY_EDGE, F2, F2], [BALCONY_EDGE, 12200, 0, 0],
];
/** The floor's height at x. */
export const floorAt = (rx: number) => (rx < STAIRS.a ? 0 : rx < STAIRS.b ? ((rx - STAIRS.a) / (STAIRS.b - STAIRS.a)) * F2 : rx < BALCONY_EDGE ? F2 : 0);

// ---------------------------------------------------------------------------------------------------------------
// What he stands on

/** The East Room: the Steinway (a step), the chair stack (too tall), the risers down its far side (and back up). */
export const PIANO = { a: 2930, b: 3070, h: 100 };
export const CHAIRS = { a: 3260, b: 3340, h: 240 };
export const RISER = { a: 3340, b: 3430, h: 130 };
/** The press room: the podium. */
export const PODIUM = { a: 4262, b: 4338, h: 96 };
/** The dining room: the sideboard (a step up onto the table's end). */
export const SIDEBOARD = { a: 5300, b: 5400, h: 105 };
/** The Lincoln bedroom: the bed (its mattress, a step). */
export const BED = { a: 8820, b: 8990, h: F2 + 70 };
/** The garden: the bench, the arbor's top (steps up to the topiary tower). */
export const BENCH = { a: 10640, b: 10720, h: 105 };
/** Solid things (a lit top): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [
  [PIANO.a, PIANO.b, PIANO.h], [CHAIRS.a, CHAIRS.b, CHAIRS.h], [RISER.a, RISER.b, RISER.h], [PODIUM.a, PODIUM.b, PODIUM.h],
  [SIDEBOARD.a, SIDEBOARD.b, SIDEBOARD.h], [BED.a, BED.b, BED.h], [BENCH.a, BENCH.b, BENCH.h],
];
/** The banquet table (one-way). */
export const TABLE = { a: 5410, b: 6060, h: 85 };
/** The arbor's crossbeams (one-way). */
export const ARBOR = { a: 10530, b: 10620, h: 215 };
/** One-way ledges: [from, to, height]. The arenas' ledges are with the arenas. */
export const LEDGES: [number, number, number][] = [[TABLE.a, TABLE.b, TABLE.h], [ARBOR.a, ARBOR.b, ARBOR.h]];

// ---------------------------------------------------------------------------------------------------------------
// The hazards

/** THE RUNAWAY VACUUM: up and down between a and b. */
export const VACUUM = { a: 1320, b: 2060 };
/** JUST WAXED: the slick stretch of the East Room. */
export const WAX: [number, number] = [2400, 3200];
/** THE SWINGING CHANDELIER: its pivot (on the ceiling), its chain's length, how far it swings, how long a swing. */
export const CHANDELIER = { x: 3120, pivotH: CEIL1, len: 320, amp: 0.45, period: 260, w: 92 };
/** THE BOWLING BALLS: the ball return up top they come out of; the grate at the bottom that swallows them. */
export const BALL_RETURN = 7500, BALL_GRATE: [number, number] = [6450, 6520];
/** THE ROSE BUSHES (thorns): [from, to]. */
export const ROSES: [number, number][] = [[10790, 10890], [11400, 11500]];
/** THE SPRINKLERS: [x, phase (0..1 of the cycle)]. */
export const SPRINKLERS: [number, number][] = [[11020, 0], [11220, 0.5], [11640, 0.25]];
export const SPRINKLE_PERIOD = 210;

/** The garden's topiary stack-tower (the land's towers: world coordinates): up off the arbor, leaned left onto the
 *  balcony (its lid level with the balcony's floor at its lean). */
export const TOPIARY: TowerDef = { x: X(10470), y: GY + 6, h: 330, w: 96, lean: 0.4, tiers: ['#4ADE80', '#22C55E', '#86EFAC', '#16A34A'], lid: '#BBF7D0' };

// ---------------------------------------------------------------------------------------------------------------
// The pundits' arenas

export interface Arena { a: number; b: number; floor: number; trigger: number; ledges: [number, number, number][] }
export const PEROT_ARENA: Arena = { a: 3900, b: 4700, floor: 0, trigger: 3990, ledges: [[3990, 4110, 150], [4490, 4610, 150]] };
export const FALWELL_ARENA: Arena = { a: 8500, b: 9300, floor: F2, trigger: 8590, ledges: [[8570, 8690, F2 + 150], [9110, 9230, F2 + 150]] };

// ---------------------------------------------------------------------------------------------------------------
// The mean men, the pickups, the checkpoints

/** [kind, x, height of its feet, variant]. */
export const CAST: [string, number, number, number?][] = [
  ['m2:ct_goon', 860, 0],
  ['m2:ct_goon', 2140, 0],
  ['m2:ct_lobbyist', 2470, 0], ['m2:ct_goon', 2720, 0], ['m2:ct_blimp', 3020, 330], ['m2:ct_goon', 3520, 0], ['m2:ct_pollster', 3620, 0],
  ['m2:ct_goon', 5180, 0], ['m2:ct_lobbyist', 5480, TABLE.h], ['m2:ct_pollster', 5760, TABLE.h], ['m2:ct_goon', 5940, 0],
  ['m2:ct_blimp', 6060, 330], ['m2:ct_lobbyist', 6260, 0],
  ['m2:ct_goon', 6540, 0], ['m2:ct_pollster', 7700, F2],
  ['m2:ct_lobbyist', 7820, F2], ['m2:ct_goon', 8000, F2], ['m2:ct_blimp', 8140, F2 + 300], ['m2:ct_pollster', 8300, F2],
  ['m2:ct_goon', 10960, 0], ['m2:ct_lobbyist', 11160, 0], ['m2:ct_blimp', 11320, 260], ['m2:ct_goon', 11540, 0],
  ['m2:ct_pollster', 11700, 0], ['m2:ct_goon', 11860, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1240, 0, 'small_ammo'],
  [CHAIRS.a + 40, CHAIRS.h, 'small_health'],
  [3760, 0, 'small_health'], [3820, 0, 'small_ammo'],
  [SIDEBOARD.a + 50, SIDEBOARD.h, 'small_health'],
  [7470, F2, 'small_ammo'],
  [8360, F2, 'small_health'], [8410, F2, 'small_ammo'],
  [ARBOR.a + 45, ARBOR.h, 'small_health'],
];
export const CHECKPOINTS = [
  { name: 'THE WACKY WHITE HOUSE', cp: 20, x: X(200), y: GY },
  { name: 'THE EAST ROOM', cp: 21, x: X(2250), y: GY },
  { name: 'THE PRESS ROOM', cp: 22, x: X(3720), y: GY },
  { name: 'THE STATE DINING ROOM', cp: 23, x: X(5050), y: GY },
  { name: 'THE GRAND STAIRCASE', cp: 24, x: X(6450), y: GY },
  { name: 'THE LINCOLN BEDROOM', cp: 25, x: X(8390), y: Y(F2) },
  { name: 'THE ROSE GARDEN', cp: 26, x: X(10820), y: GY },
];

/** The transformation goes off as he's in this far (the first time). */
export const TRANSFORM_AT = 300;
/** Once each a visit, passing: [the gag / Chelsea's hint, from x, to x]. */
export const GAG_AT: [string, number, number][] = [['vacuum', 1250, 1600], ['wax', 2380, 2700], ['stairs', 6560, 7000], ['garden', 10340, 10800]];
export const HINT_AT: [string, number, number][] = [
  ['vacuum', 1180, 1500], ['wax', 2300, 2600], ['blimp', 2850, 3100], ['chandelier', 2880, 3100], ['dining', 5080, 5400], ['stairs', 6470, 6800],
  ['upstairs', 7650, 8000], ['roses', 10600, 10850], ['sprinkler', 10880, 11100],
];
