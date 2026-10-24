// PUNCHY & KICKY, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). DAD GUY's
// extended universe: the park's tie-in to the show inside the show (the cartoon the Boy watches on DAD GUY), a clear
// Itchy & Scratchy knockoff: PUNCHY the cat and KICKY the mouse, smashing each other to death with hammers. Painted the
// show's way: blood red, mustard, black; cartoon gore splats for decor; bones; bandages. The Looney Tunes violence is
// the area's hazards and set pieces, each taught alone on the flat first, then in combos, then with the land's swaying
// stack-towers (cartoon/sway.ts) over a canyon and a floor of portable holes. Every one telegraphed (the whistle and
// the shadow, the creak and the raised hammer, the fizzing fuse, the fraying rope, the rattling crate), every one hurts
// the cast as well (they walk into the rakes and the bear traps themselves), and every one really kills him.
//
//   0      THE GATE (cp 50): in under the arch from the big-kid zone; PUNCHY & KICKY's sign; a Punchy alone (taught).
//   650    ANVIL ALLEY: the GENERIC-CO drop gantry over the path. One trapdoor alone (the whistle, the shadow, the anvil,
//          winched back up), then three in a rolling wave. A Kicky past it.
//   1700   THE LAWN: rakes lying tines up in the grass (a Punchy walks into one).
//   2300   THE MERCH STAND (cp 51): breathing room; the merch; the jumbotron playing the cartoon; a stagehand laying
//          portable holes (taught).
//   3050   PUNCHY & KICKY'S KILL-O-RAMA: the attraction's facade. A giant animatronic Punchy alone, his mallet up, a
//          creak, and down across the path; then the pair either side of the doors, Punchy and Kicky, swinging at each
//          other in turn. The host past it, calling anvils down on him.
//   4250   THE GENERIC-CO DOCK (cp 52): a crate that punches (a boxing glove on a spring) alone; bear traps; THE SAFE on
//          the dock crane (it drops on him once, then stays: the step up to the pallet rack, a pickup); a crate stack
//          with the dynamite mouse on it; another punching crate.
//   5450   CANNON ROW (cp 53): the circus cannon at the far end firing along the path (a low ball, a high ball); THE
//          PIANO on its hoist (it drops on him once, then stays: cover from the low balls); a Punchy, a dynamite mouse.
//   6500   THE FUSE (cp 54): a giant animatronic Kicky strikes a giant match and lights a long fuse along the path to a
//          pile of TNT; it goes up; a new pile rises out of the trapdoor. A stagehand.
//   7150   THE PAINTED CANYON (cp 55): three towers across a bottomless gorge (lean into each gap); the cannon on its lift
//          on the far rim, rising to his height and firing across; the host on the far rim calling anvils.
//   8650   THE SET (cp 56): the live show's soundstage: a floor of portable holes (in, and he's falling through holes
//          forever: deaths.ts); two towers across it; a fuse along the fly rail and down a line to the
//          TNT at the far tower's foot (it goes up and kicks the tower); a stagehand.
//   9650   THE WAY ON (cp 57): a mixed crowd; the gate to DAD GUY LIVE! (the amphitheater: the right end).

import { SECTIONS, GY } from '../geometry';
import type { TowerDef } from '../sway';

export const x0 = SECTIONS.itchy.x0, x1 = SECTIONS.itchy.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// The ground

/** The painted canyon, and the floor of portable holes (no ground: in, and he's dead: deaths.ts). */
export const CANYON: [number, number] = [7500, 8400];
export const HOLES: [number, number] = [8900, 9500];
export const PITS: [number, number][] = [CANYON, HOLES];
/** Flat ground: [from, to] at the ground line. */
export const GROUND: [number, number][] = [[-200, CANYON[0]], [CANYON[1], HOLES[0]], [HOLES[1], 10200]];

/** The canyon's rim rocks (solid, lit along the top: the steps up off each bank), the set's crate steps. */
export const ROCKS: [number, number, number][] = [[7360, 7460, 120], [8430, 8530, 130]];
export const SET_STEPS: [number, number, number][] = [[8780, 8880, 120], [9530, 9630, 130]];

// ---------------------------------------------------------------------------------------------------------------
// The hazards

/** ANVIL ALLEY's trapdoors in the gantry: [x, phase offset (frames into the cycle)]. The first alone, then the wave. */
export const GANTRY = { a: 700, b: 1580, h: 340 };
export const DOORS_AT: [number, number][] = [[880, 0], [1180, 0], [1320, 56], [1460, 112]];

/** The rakes (where the tines are: step on them and the handle comes up): [x, which way the handle lies (-1 left)]. */
export const RAKES: [number, -1 | 1][] = [[1850, -1], [1990, 1], [2140, -1], [9700, 1]];
export const LAWN: [number, number] = [1720, 2260];

/** The giant animatronics' hammers: where each stands (its shoulder: the pivot), which way it swings, where the head
 *  comes down (its middle), its timing offset. */
export interface HammerDef { x: number; side: 1 | -1; hit: number; who: 'punchy' | 'kicky'; phase: number }
export const HAMMERS: HammerDef[] = [
  { x: 3180, side: 1, hit: 3400, who: 'punchy', phase: 0 },
  { x: 3560, side: 1, hit: 3770, who: 'punchy', phase: 0 },
  { x: 4120, side: -1, hit: 3910, who: 'kicky', phase: 75 },
];
/** The KILL-O-RAMA's building behind (its front, the doors in the middle). */
export const KILLORAMA = { a: 3060, b: 4230, doors: 3840 };

/** The GENERIC-CO crates (solid, lit along the top): [from, to, height]; the punching ones among them. */
export const CRATES: [number, number, number][] = [[4400, 4460, 60], [5160, 5260, 100], [5330, 5390, 60]];
export const GLOVE_CRATES = [0, 2];
/** The bear traps (open, on the floor): x. */
export const TRAPS = [4590, 4690, 4760];
/** The dock crane's safe (hung over the path; drops once), and the pallet rack it's the step up to. */
export const SAFE = { x: 4900, w: 70, h: 64, hang: 300 };
export const RACK: [number, number, number] = [4985, 5110, 172];

/** The circus cannon (on the ground at the end of the row, facing back along it: its carriage solid, a step up and
 *  over it; its barrel's mouth out over the path, dipped for a low ball, raised for a high one) and its range. */
export const CANNON = { x: 6340, muzzle: 6262, w: 100, h: 60, range: 980 };
/** The piano on its hoist over the path (drops once; its wreck stays: cover from the low balls). */
export const PIANO = { x: 5860, w: 110, h: 46, hang: 330 };

/** The fuses: the path the spark takes (world-relative x, height), where it's lit, the TNT at its end, and the
 *  giant animatronic Kicky with the match (if there's one). */
export interface FuseDef { pts: [number, number][]; tnt: [number, number]; kicky?: number; tower?: number; radius: number; wait: number }
export const FUSES: FuseDef[] = [
  { pts: [[6640, -4], [7020, -4]], tnt: [7040, 0], kicky: 6560, radius: 110, wait: 40 },
  // (the set's: along the fly rail overhead, then down a line to the far tower's foot)
  { pts: [[9760, 330], [9440, 330], [9440, 40], [9400, 8]], tnt: [9390, 0], tower: 1, radius: 90, wait: 60 },
];

/** The canyon's cannon on its lift (behind the far rim): its muzzle's x; it rises to his height. */
export const LIFT_CANNON = { x: 8700, muzzle: 8648, range: 1200 };

// ---------------------------------------------------------------------------------------------------------------
// The towers (world coordinates)

const T = (rx: number, h: number, extra: Partial<TowerDef> = {}): TowerDef => ({ x: X(rx), y: GY, h, ...extra });
/** The show's colors: blood red, mustard, black, bone; a bone-white lid. */
const PK = (a: string, b: string, c: string) => [a, b, a, b, c, b, a];
export const TOWERS: TowerDef[] = [
  // (the canyon: too far apart upright; lean into each gap)
  // (`pit`: drawing only: no grassy hummock at their feet, art.ts stands each on a rock stack down into the gorge, or
  // a stage lift's column down through the holes)
  T(7590, 230, { tiers: PK('#DC2626', '#FACC15', '#1F2937'), lid: '#FEF3C7', pit: true }),
  T(7950, 260, { tiers: PK('#1F2937', '#DC2626', '#FACC15'), lid: '#FEF3C7', pit: true }),
  T(8260, 220, { tiers: PK('#FACC15', '#7F1D1D', '#F5F5F4'), lid: '#FEF3C7', pit: true }),
  // (the set: over the holes)
  T(9010, 230, { tiers: PK('#7F1D1D', '#F5F5F4', '#FACC15'), lid: '#FEF3C7', pit: true }),
  T(9370, 220, { tiers: PK('#FACC15', '#DC2626', '#1F2937'), lid: '#FEF3C7', pit: true }),
];
/** The set's towers (their index in TOWERS): the fuse's tower counts from here. */
export const SET_TOWER0 = 3;

// ---------------------------------------------------------------------------------------------------------------
// Solids and ledges

/** Solid things (walls with a standable top, lit along it): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [...ROCKS, ...SET_STEPS, ...CRATES, [CANNON.x - CANNON.w / 2, CANNON.x + CANNON.w / 2, CANNON.h]];
/** Ledges (one-way, to stand on): [from, to, height]. */
export const LEDGES: [number, number, number][] = [RACK];

// ---------------------------------------------------------------------------------------------------------------
// The cast, the pickups, the checkpoints

/** [kind, x, height of its feet]. Encounter pass (cartoon-spec.md, 2026-10-21): nobody within a checkpoint's safe
 *  reach (spawnSafe.ts SAFE_X); the cast set among the gags so the gags can be turned on them. (The canyon, the set
 *  and the way on sit inside their checkpoints' reach end to end: their threats are the hazards.) */
export const CAST: [string, number, number][] = [
  // (the gate: a Punchy alone on the flat, taught, out of the checkpoint's reach)
  ['m2:ct_punchy', 620, 0],
  // (anvil alley: a Punchy between the lone trapdoor and the wave; his leap sticks the mallet in the floor: lure him
  // under a trapdoor and the anvil does it. A Kicky at the wave's end, cleavers in while the anvils roll)
  ['m2:ct_punchy', 1040, 0], ['m2:ct_kicky', 1640, 0],
  // (the lawn: a Punchy in among the rakes (he treads on them too); the merch stand: the stagehand's holes, taught)
  ['m2:ct_punchy', 1920, 0],
  ['m2:ct_stagehand', 2920, 0],
  // (the kill-o-rama: the host between the first two hammers calling anvils while he times them (knock him under one))
  ['m2:ct_host', 3590, 0],
  // (the dock: a Kicky in among the bear traps, the glove crate's reach behind him (the cleaver's pointy: no charging
  // in; shove him onto a trap); the host up on the pallet rack calling anvils at him by the safe; the dynamite mouse
  // on the crate stack)
  ['m2:ct_kicky', 4640, 0], ['m2:ct_host', RACK[0] + 60, RACK[2]],
  ['m2:ct_kickyboom', 5210, 100],
  // (cannon row: a Punchy past the piano and the dynamite mouse at the cannon's end, the balls coming through)
  ['m2:ct_punchy', 5990, 0],
  ['m2:ct_kickyboom', 6140, 0],
  // (the fuse: a stagehand by the TNT laying holes in his way while the spark crawls up; keep him there and it gets him)
  ['m2:ct_stagehand', 6890, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [2560, 0, 'small_ammo'],
  [2720, 0, 'small_health'],
  [RACK[0] + 60, RACK[2], 'small_health'],
  [7310, 0, 'small_ammo'],
  [8610, 0, 'small_health'],
  [9600, 0, 'small_ammo'],
];
export const CHECKPOINTS = [
  { name: 'PUNCHY & KICKY', cp: 50, x: X(200), y: GY },
  { name: 'THE MERCH STAND', cp: 51, x: X(2340), y: GY },
  // (52, 53: clear of the punching crates' reach (they go off at anybody within 180 of them, right as he's back))
  { name: 'THE GENERIC-CO DOCK', cp: 52, x: X(4180), y: GY },
  { name: 'CANNON ROW', cp: 53, x: X(5600), y: GY },
  { name: 'THE FUSE', cp: 54, x: X(6500), y: GY },
  { name: 'THE PAINTED CANYON', cp: 55, x: X(7280), y: GY },
  { name: 'THE SET', cp: 56, x: X(8640), y: GY },
  { name: 'THE WAY ON', cp: 57, x: X(9560), y: GY },
];

/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['sign', 300], ['anvil', 760], ['rake', 1700], ['merch', 2420], ['tv', 2600], ['killorama', 3080], ['dock', 4300], ['cannon', 5500], ['fuse', 6520], ['canyon', 7240], ['holes', 8720], ['exit', 9900]];

/** The merch stand and its jumbotron; the dock crane; the big top; the exit gate. */
export const MERCH = { a: 2420, b: 2740, tv: 2600 };
export const EXIT_GATE = 9930;
/** The signs: [x, feet height, lines, board color]. */
export const SIGNS: [number, number, string[], string][] = [
  [300, 0, ['PUNCHY & KICKY', 'AS SEEN ON DAD GUY!', 'THEY FIGHT! THEY BITE!'], '#B91C1C'],
  [740, 0, ['ANVIL ALLEY', 'GENERIC-CO PROUDLY DROPS'], '#1F2937'],
  [1690, 0, ['KEEP OFF THE GRASS', 'BY ORDER OF PUNCHY'], '#15803D'],
  [4270, 0, ['THE GENERIC-CO DOCK', 'QUALITY. ALLEGEDLY.'], '#92400E'],
  [5480, 0, ["PUNCHY'S BIG TOP", 'SEE THE CANNON!', 'BE THE CANNONBALL!'], '#B91C1C'],
  [7240, 0, ['THE PAINTED CANYON', "AS SEEN IN 'MOUSE MESA'"], '#C2410C'],
  [8660, 0, ['STAGE 9', 'PUNCHY & KICKY LIVE!', 'TAPING TODAY'], '#1F2937'],
];
