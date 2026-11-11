// The water park, level 3: THE MAINTENANCE TUNNELS (the owner's brief, 2026-11-05: "it's where the janitors and
// technicians negligently work. make it look like it is ran by people who don't care, possessed by the aliens (it's
// their turn here)... the 'piss filter'... the cheap imported chlorine and dubiously safe chemicals... more 'narrow'
// than most... everywhere will be a ceiling... ladders and wires and the 'stairs'... it will open/close forked paths in
// the swimmin section in the second half... the end of the sequence will shoot you and the dirty water through a grate
// and into the wave pool, where the third boss is").
//
// Where everything is. The tunnels are a grid of 40 px cells (a Mega Man castle: rock, air, ladders, water), built
// section by section by code below (one long grid, ROWS tall), read once into blocks, ladders, water and the cast.
// Read it left to right:
//
//   THE SERVICE DOOR    in off THE LAZY RIVER's landing (park2: its MAINTENANCE door): a low concrete corridor, the
//                       BREAK ROOM (a tall spot: the couch, the vending machine, DAYS SINCE LAST INCIDENT: 0), the
//                       first ladder (taught: down a hole in the floor) to the lower corridor.
//   THE PISS FILTER     a tall vault over a vat of every pee the park makes; the stunt wires (Hollywood Land's: off the
//                       ceiling gantry) over it, the filter housing in the middle, the vat spurting (reel up), grubs
//                       dropping off the ceiling; a ladder up out of it to the main level.
//   CHEMICAL STORAGE    drums of cheap imported chlorine leaking gas on a timer (walk between the puffs), electrified
//                       puddles under dangling cables (WET FLOOR), a sludge pit with a drum standing in it to hop on, and
//                       a wall of drums to climb over (the leaky ones in it).
//   THE GANGWAYS        Fairy Land's staircases, harder: four steel flights pivoting up a pillar each, out of step
//                       (each docked up while the next's swung down into the sludge), quicker than the mine shaft's.
//   THE SHAFT           a long ladder down (Spooky Land's, Wily-style): steam vents blasting across it on a timer.
//   THE FLOODED PIPES   the second half, swimming. The junctions (junctions.ts): chambers up a diagonal, each with a
//                       flap valve on its far wall between two pipes, the forward one (up to the next chamber) and the
//                       hazard one (a fan, a pushback current, chlorine): the valves switch on a clock, each opening one
//                       and shutting the other; every other one out of step (the staircases' alternation, in pipes).
//                       Taught with one, then a chain of five.
//   THE PUMP ROOM       up out of the last chamber: dry, the big refill, the boss's checkpoint, and the WAVE POOL OUTFLOW
//                       (a grated intake in the floor: walked into, it's the door: the flush through it, then the pool).
//   THE WAVE POOL       out on its own past the tunnels (WP): the boss (boss.ts).

import { GROUND_Y } from '../../../m1/constants';

export const GY = GROUND_Y;
export const CELL = 40;
export const ROWS = 36;
/** Row 18's top is GY (the main level's floor). */
export const Y0 = GY - 18 * CELL;
export const cellX = (c: number) => c * CELL;
export const cellY = (r: number) => Y0 + r * CELL;

// ---------------------------------------------------------------------------------------------------------------
// The grid's letters

/**
 *  #  rock (solid)          .  air                  H  a ladder (in air; through a floor where it goes up a hole)
 *  =  a one-way ledge (stood on, jumped up through: its top's the cell's top)
 *  ~  water                  P  the piss (the vat: deadly)          C  chemical sludge (deadly)
 *  d  a chlorine drum (solid, stood on)              D  a leaking one (solid; gas out of it on a timer)
 *  v  a steam vent in a wall (solid; blasts into the air beside it on a timer)
 *  w  a puddle under a dangling cable (on the cell's floor: it arcs on a timer)
 *  F  a valve's forward mouth (water; solid while it's shut)   Z  its hazard mouth (likewise)
 *  0-9  a checkpoint (his feet on the floor under it)
 *  j t g e r o  the cast: a janitor, a technician, a grub (on the ceiling over it), an eel, a trooper, a hover alien
 *  h a B A  the pickups: small health, small ammo, the big health, the big ammo
 *  s  a sign (stood on the floor; its words in the section's list, in order)
 */
export type Who3 = 'janitor' | 'tech' | 'grub' | 'eel' | 'trooper' | 'hover';
const CAST_CH: Record<string, Who3> = { j: 'janitor', t: 'tech', g: 'grub', e: 'eel', r: 'trooper', o: 'hover' };
/** Marks (not cells): the cast, the pickups, the checkpoints, the signs. */
const MARK = /^[0-9jtgerohaBAs]$/;
const PICK_CH: Record<string, 'small_health' | 'small_ammo' | 'large_health' | 'large_ammo'> = { h: 'small_health', a: 'small_ammo', B: 'large_health', A: 'large_ammo' };

export interface WireDef3 { from: { x: number; y: number }; to: { x: number; y: number }; rigY: number }
export interface StairDef3 { px: number; py: number; len: number; docks: number[]; hold: number; swing: number; phase: number }
export interface SignDef3 { x: number; y: number; lines: string[]; wall?: boolean; tilt?: number }
/** A junction (junctions.ts): its chamber (cells), which hazard its other pipe has, its clock. */
export type Hazard3 = 'fan' | 'push' | 'bleach';
export interface JunctionDef { c0: number; r0: number; hazard: Hazard3; air: boolean; clock: 'teach' | 'chain'; parity: 0 | 1 }

interface Sec {
  w: number; g: string[][];
  /** What's marked on a cell but isn't the cell (the cast, the pickups, the checkpoints, the signs): over whatever's there. */
  marks: { c: number; r: number; ch: string }[];
  wires: WireDef3[]; stairs: StairDef3[]; signs: SignDef3[]; junctions: JunctionDef[];
  /** Section-local helpers (cells). */
  fill: (c0: number, r0: number, c1: number, r1: number, ch: string) => void;
  put: (c: number, r: number, ch: string) => void;
}
const sec = (w: number): Sec => {
  const g = Array.from({ length: ROWS }, () => Array.from({ length: w }, () => '#'));
  const s: Sec = {
    w, g, marks: [], wires: [], stairs: [], signs: [], junctions: [],
    fill: (c0, r0, c1, r1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (r >= 0 && r < ROWS && c >= 0 && c < w) g[r][c] = ch; },
    put: (c, r, ch) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= w) return;
      if (MARK.test(ch)) s.marks.push({ c, r, ch }); else g[r][c] = ch;
    },
  };
  return s;
};
/** (local cells, the section's x in px added on as it's laid) */
const X = (c: number) => c * CELL;
const FEET = (r: number) => cellY(r + 1);

// ---------------------------------------------------------------------------------------------------------------
// THE SERVICE DOOR, THE BREAK ROOM, the first ladder (taught)

const serviceDoor = () => {
  const s = sec(72);
  s.fill(0, 13, 47, 17, '.');
  // (the break room: a tall spot)
  s.fill(16, 9, 30, 12, '.');
  // (the lower corridor; the ladder down to it through a hole in the floor)
  s.fill(38, 23, 71, 27, '.');
  s.fill(45, 18, 45, 27, 'H');
  // (the hole's two cells wide: he's 44 across, a cell's 40. In a one-cell hole he could take hold and never climb,
  // and let go in it he was popped out of the rock)
  s.fill(46, 18, 46, 22, '.');
  // (and the corridor ends at the hole: with a lip of floor past it he ran clean over the gap half the time)
  s.fill(47, 13, 47, 17, '#');
  // (a puddle under a dangling cable, short of the ladder: taught on the flat)
  s.put(39, 17, 'w');
  s.put(3, 17, '0'); s.put(50, 27, '1');
  s.put(24, 17, 'j'); s.put(35, 17, 'j'); s.put(60, 27, 't'); s.put(65, 23, 'g');
  s.put(28, 17, 'h'); s.put(68, 27, 'a');
  s.put(8, 17, 's'); s.put(14, 17, 's'); s.put(43, 17, 's');
  s.signs.push(
    { x: X(8) + 20, y: FEET(17), lines: ['STAFF ONLY', 'GUESTS: TURN BACK'] },
    { x: X(14) + 20, y: FEET(17), lines: ['BREAK ROOM', 'NO BREAKS'] },
    { x: X(43) + 20, y: FEET(17), lines: ['LADDER', 'USE AT OWN RISK'] },
    { x: X(22), y: cellY(10) + 6, lines: ['DAYS SINCE LAST', 'INCIDENT: 0'], wall: true },
  );
  return s;
};

// ---------------------------------------------------------------------------------------------------------------
// THE PISS FILTER: the vat, the wires over it, the filter housing in the middle, a ladder up out

/** The piss filter's numbers (local cells): the vat's surface row; the housing; the far landing; the ladder up. */
export const VAT = { surf: 29, housing: [32, 37] as [number, number], housingTop: 25, far: [62, 71] as [number, number], farTop: 26, ladder: 72 };
const pissFilter = () => {
  const s = sec(80);
  s.fill(0, 23, 9, 27, '.');
  // (the vault: tall; the vat along its floor)
  s.fill(10, 6, 71, 28, '.');
  s.fill(10, VAT.surf, 61, 31, 'P');
  // (the filter housing stood up out of it; the far landing)
  s.fill(VAT.housing[0], VAT.housingTop, VAT.housing[1], 31, '#');
  s.fill(VAT.far[0], VAT.farTop, VAT.far[1], 31, '#');
  // (the ladder up out of the vault's far corner to the main level, and the corridor on)
  s.fill(VAT.ladder, 13, VAT.ladder, 17, '.');
  s.fill(VAT.ladder, 18, VAT.ladder, 25, 'H');
  s.fill(73, 13, 79, 17, '.');
  s.put(1, 27, '2'); s.put(7, 27, 'a');
  s.put(41, 7, 'g'); s.put(55, 7, 'g'); s.put(50, 15, 'o');
  s.put(66, 25, 'h');
  s.put(4, 27, 's'); s.put(69, 25, 's');
  s.signs.push(
    { x: X(4) + 20, y: FEET(27), lines: ['THE PISS FILTER', "ALL THE PARK'S PEE"] },
    { x: X(69) + 20, y: FEET(25), lines: ['NO SWIMMING', '(SERIOUSLY)'] },
    { x: X(34) + 20, y: cellY(VAT.housingTop) + 90, lines: ['FILTER LAST', 'CHANGED: 1996'], wall: true },
  );
  // (the wires: off the gantry under the vault's ceiling; the vat's edge to the housing, the housing to the far landing)
  const rig = cellY(7) + 10;
  s.wires.push(
    { from: { x: X(9) + 10, y: FEET(27) - 80 }, to: { x: X(VAT.housing[0]) + 30, y: cellY(VAT.housingTop) }, rigY: rig },
    { from: { x: X(VAT.housing[1]) + 10, y: cellY(VAT.housingTop) - 80 }, to: { x: X(VAT.far[0]) + 50, y: cellY(VAT.farTop) }, rigY: rig },
  );
  return s;
};
/** The vat's spurts (local cells: their x), each its period and phase (frames). */
export const SPURTS_L: [number, number, number][] = [[24, 170, 0], [45, 150, 40], [53, 150, 115]];

// ---------------------------------------------------------------------------------------------------------------
// CHEMICAL STORAGE

const chemicals = () => {
  const s = sec(82);
  s.fill(0, 13, 81, 17, '.');
  // (one leaking drum on the floor: walk past between its puffs)
  s.put(9, 17, 'D');
  // (a puddle under a cable, WET FLOOR stood by it)
  s.put(22, 17, 'w');
  // (the sludge pit, a drum stood up in it to hop on (it leaks))
  s.fill(33, 18, 39, 19, 'C');
  s.put(36, 18, 'D');
  // (a tall spot: a wall of drums to climb over, by steps of drums; the leaky ones in it)
  s.fill(44, 8, 60, 12, '.');
  for (const [c, n] of [[46, 1], [47, 2], [48, 3], [49, 4]] as const) for (let k = 0; k < n; k++) s.put(c, 17 - k, c === 48 && k === 1 ? 'D' : 'd');
  s.fill(50, 13, 51, 17, 'd'); s.put(51, 15, 'D');
  // (a second puddle, then the corridor on)
  s.put(65, 17, 'w');
  s.put(2, 17, '3');
  s.put(16, 17, 'j'); s.put(28, 17, 't'); s.put(57, 17, 'r'); s.put(72, 17, 't'); s.put(78, 17, 'j'); s.put(70, 13, 'g');
  s.put(42, 17, 'h'); s.put(75, 17, 'a');
  s.put(4, 17, 's'); s.put(20, 17, 's'); s.put(29, 17, 's');
  s.signs.push(
    { x: X(4) + 20, y: FEET(17), lines: ['CHEMICAL STORAGE', 'PRODUCT OF ???'] },
    { x: X(20) + 20, y: FEET(17), lines: ['CAUTION', 'WET FLOOR'] },
    { x: X(29), y: FEET(17), lines: ['IMPORTED CHLORINE', 'DO NOT INHALE (MUCH)'] },
    { x: X(41), y: cellY(14), lines: ['EYEWASH STATION', 'OUT OF ORDER'], wall: true },
    { x: X(56), y: cellY(9) + 10, lines: ['STACK NO HIGHER', 'THAN THIS'], wall: true },
  );
  return s;
};

// ---------------------------------------------------------------------------------------------------------------
// THE GANGWAYS: four flights, each pivoting up off a pillar's top, docking up to the next (or swung down, over the
// sludge), out of step. The pillars' tops step up 80 px a flight; each flight's 200 long, docked up at asin(0.4).

const UP = -Math.asin(0.4), DOWN = 0.7, FLIGHT = 200, CHAIN3 = { hold: 100, swing: 45 };
const gangways = () => {
  const s = sec(48);
  s.fill(0, 13, 7, 17, '.');
  s.fill(8, 3, 32, 21, '.');
  s.fill(8, 22, 32, 25, 'C');
  // (the pillars: up out of the sludge; the exit ledge (the room's right wall) and its corridor on)
  for (const [c0, c1, top] of [[12, 14, 16], [19, 21, 14], [26, 28, 12]] as const) s.fill(c0, top, c1, 25, '#');
  s.fill(33, 5, 47, 9, '.');
  // (the flights: off the entry ledge's end, then each pillar's right edge; even ones in step, odd ones not)
  const piv: [number, number][] = [[X(8), cellY(18)], [X(15), cellY(16)], [X(22), cellY(14)], [X(29), cellY(12)]];
  piv.forEach(([px, py], i) => s.stairs.push({ px, py, len: FLIGHT, docks: i % 2 ? [DOWN, UP] : [UP, DOWN], ...CHAIN3, phase: 0 }));
  s.put(3, 17, '4');
  s.put(17, 3, 'g'); s.put(24, 3, 'g');
  s.put(42, 9, 'a');
  s.put(5, 17, 's'); s.put(39, 9, 's');
  s.signs.push(
    { x: X(5) + 20, y: FEET(17), lines: ['GANGWAYS', 'USE HANDRAIL'] },
    { x: X(39) + 20, y: FEET(9), lines: ['HANDRAIL', 'ON BACKORDER'] },
  );
  return s;
};

// ---------------------------------------------------------------------------------------------------------------
// THE SHAFT: a long ladder down, steam vents blasting across it; water at the bottom (the flooded pipes)

export const SHAFT = { c: 10, top: 10, water: 28 };
const shaft = () => {
  const s = sec(26);
  s.fill(0, 5, 9, 9, '.');
  s.fill(10, 5, 11, 27, '.');
  s.fill(10, 10, 10, 27, 'H');
  // (the vents: in the walls either side, blasting across)
  s.put(12, 14, 'v'); s.put(9, 19, 'v'); s.put(12, 24, 'v');
  // (the water: the shaft's bottom, and the pipe off it, full)
  s.fill(10, 28, 11, 33, '~');
  s.fill(12, 31, 25, 33, '~');
  s.put(3, 9, '5');
  s.put(6, 9, 'h');
  s.put(7, 9, 's');
  s.signs.push({ x: X(7) + 20, y: FEET(9), lines: ['STEAM VENTS', 'MOSTLY OFF'] });
  return s;
};

// ---------------------------------------------------------------------------------------------------------------
// THE FLOODED PIPES: the junctions (junctions.ts), each a chamber 6 x 8 cells: an air pocket in its top row, its inlet
// on the left in its bottom three, its forward mouth (F) on the right in rows 1 to 3 and its hazard mouth (Z) in rows 5
// to 7, the flap hinged between. The forward pipe runs right and in at the next chamber's inlet (four rows up: the
// diagonal); the hazard pipe runs right under it to its hazard. Every chamber's hazard, when its mouth's open, comes
// out across its bottom three rows (out through the inlet, the way he came: the pushback).

export const JW = 6, JH = 8, JSTEP = 10;
const carveJunction = (s: Sec, j: JunctionDef, last: boolean) => {
  const { c0, r0 } = j;
  s.fill(c0, r0 + (j.air ? 1 : 0), c0 + JW - 1, r0 + JH - 1, '~');
  if (j.air) s.fill(c0, r0, c0 + JW - 1, r0, '.');
  else s.fill(c0, r0, c0 + JW - 1, r0, '~');
  // (the inlet, in from the left)
  s.fill(c0 - 1, r0 + 5, c0 - 1, r0 + 7, '~');
  // (the mouths, the flap's)
  s.fill(c0 + JW, r0 + 1, c0 + JW, r0 + 3, 'F');
  s.fill(c0 + JW, r0 + 5, c0 + JW, r0 + 7, 'Z');
  // (the forward pipe, to the next chamber's inlet; the last's goes to the pump room)
  if (!last) s.fill(c0 + JW + 1, r0 + 1, c0 + JSTEP - 2, r0 + 3, '~');
  // (the hazard pipe: right, under the next chamber; a fan's ends in its fan, a pushback's and bleach's in a grate)
  s.fill(c0 + JW + 1, r0 + 5, c0 + JW + 6, r0 + 7, '~');
};
/** The pump room (dry, up out of the last chamber's forward pipe): its pool (local cells), its floor, its outflow. */
export const PUMP = { pool: [0, 3] as [number, number], floor: 7, out: [13, 14] as [number, number] };
const flooded = () => {
  // (the pipe in from the shaft; the teaching junction; the chain of five up the diagonal; the pump room)
  const r1 = 26, c1 = 6;
  const js: JunctionDef[] = [
    { c0: c1, r0: r1, hazard: 'fan', air: true, clock: 'teach', parity: 0 },
    { c0: c1 + JSTEP, r0: r1 - 4, hazard: 'push', air: true, clock: 'chain', parity: 0 },
    { c0: c1 + JSTEP * 2, r0: r1 - 8, hazard: 'bleach', air: true, clock: 'chain', parity: 1 },
    { c0: c1 + JSTEP * 3, r0: r1 - 12, hazard: 'fan', air: false, clock: 'chain', parity: 0 },
    { c0: c1 + JSTEP * 4, r0: r1 - 16, hazard: 'bleach', air: true, clock: 'chain', parity: 1 },
    { c0: c1 + JSTEP * 5, r0: r1 - 20, hazard: 'push', air: false, clock: 'chain', parity: 0 },
  ];
  const pumpC = c1 + JSTEP * 5 + JW + 3;
  const s = sec(pumpC + 22);
  s.fill(0, 31, c1 - 1, 33, '~');
  js.forEach((j, i) => carveJunction(s, j, i === js.length - 1));
  s.junctions.push(...js);
  // (the last chamber's forward pipe, up into the pump room's pool)
  const last = js[js.length - 1];
  s.fill(last.c0 + JW + 1, last.r0 + 1, pumpC - 1, last.r0 + 3, '~');
  // (the pump room: the pool he comes up in, the floor, the refill, the outflow's intake down through the floor)
  const pr = PUMP.floor;
  s.fill(pumpC, 3, pumpC + 20, pr - 1, '.');
  s.fill(pumpC + PUMP.pool[0], pr, pumpC + PUMP.pool[1], last.r0 + 3, '~');
  s.fill(pumpC + PUMP.out[0], pr, pumpC + PUMP.out[1], pr + 3, '~');
  // (the cast: eels in the chain; checkpoints in the chambers)
  s.put(c1 + JSTEP * 2 + 3, r1 - 8 + 2, 'e'); s.put(c1 + JSTEP * 4 + 2, r1 - 16 + 3, 'e'); s.put(c1 + JSTEP * 5 + 4, r1 - 20 + 2, 'e');
  s.put(c1 + 2, r1 + 3, '6'); s.put(c1 + JSTEP * 2 + 1, r1 - 8 + 3, '7');
  s.put(pumpC + 6, pr - 1, '8');
  s.put(pumpC + 8, pr - 1, 'B'); s.put(pumpC + 9, pr - 1, 'A');
  s.put(pumpC + 11, pr - 1, 's');
  s.signs.push(
    { x: X(pumpC + 11) + 20, y: FEET(pr - 1), lines: ['WAVE POOL OUTFLOW', 'KEEP CLEAR'] },
    { x: X(c1 + 3), y: cellY(r1) + 4, lines: ['GREEN: GO', "RED: YOU'RE FIRED"], wall: true },
    { x: X(pumpC + 3), y: cellY(4) + 4, lines: ['PUMP ROOM'], wall: true },
  );
  return { s, pumpC };
};

// ---------------------------------------------------------------------------------------------------------------
// Laid end to end: the world grid

const SECTIONS = (() => {
  const f = flooded();
  return [serviceDoor(), pissFilter(), chemicals(), gangways(), shaft(), f.s].map((s, i) => ({ s, i, pumpC: i === 5 ? f.pumpC : 0 }));
})();
export const SEC_X: number[] = [];
{ let c = 0; for (const { s } of SECTIONS) { SEC_X.push(c); c += s.w; } }
export const COLS = SEC_X[SEC_X.length - 1] + SECTIONS[SECTIONS.length - 1].s.w;
/** The grid: GRID[r][c]. */
export const GRID: string[][] = Array.from({ length: ROWS }, (_, r) => SECTIONS.flatMap(({ s }) => s.g[r]));
export const at = (c: number, r: number) => (r < 0 || r >= ROWS || c < 0 || c >= COLS ? '#' : GRID[r][c]);
export const cellAt = (x: number, y: number) => at(Math.floor(x / CELL), Math.floor((y - Y0) / CELL));

/** Which section's where (world x of its left edge): THE SERVICE DOOR ... THE FLOODED PIPES. */
/** The gangways' room (world x span): the camera sits lower there, the sludge in view. */
export const GANG_ROOM = { a: (SEC_X[3] + 8) * CELL, b: (SEC_X[3] + 33) * CELL };
export const SEC = { door: SEC_X[0], piss: SEC_X[1], chem: SEC_X[2], gang: SEC_X[3], shaft: SEC_X[4], pipes: SEC_X[5] };
const shift = (i: number) => SEC_X[i] * CELL;
export const WIRES3: WireDef3[] = SECTIONS.flatMap(({ s, i }) => s.wires.map(w => ({ from: { x: w.from.x + shift(i), y: w.from.y }, to: { x: w.to.x + shift(i), y: w.to.y }, rigY: w.rigY })));
export const STAIRS3: StairDef3[] = SECTIONS.flatMap(({ s, i }) => s.stairs.map(d => ({ ...d, px: d.px + shift(i) })));
export const SIGNS3: SignDef3[] = SECTIONS.flatMap(({ s, i }) => s.signs.map(d => ({ ...d, x: d.x + shift(i) })));
export const JUNCTIONS: JunctionDef[] = SECTIONS.flatMap(({ s, i }) => s.junctions.map(j => ({ ...j, c0: j.c0 + SEC_X[i] })));
export const SPURTS: [number, number, number][] = SPURTS_L.map(([c, p, ph]) => [cellX(c + SEC_X[1]) + 20, p, ph]);
export const VAT_Y = cellY(VAT.surf);
/** The pump room (world): its left edge, its floor's top, the outflow's intake (x span), where he's put at its checkpoint. */
export const PUMP_ROOM = (() => {
  const c = SEC_X[5] + SECTIONS[5].pumpC;
  return { x: cellX(c), floor: cellY(PUMP.floor), outA: cellX(c + PUMP.out[0]), outB: cellX(c + PUMP.out[1] + 1), right: cellX(c + 21) };
})();

// ---------------------------------------------------------------------------------------------------------------
// What's read off the grid: checkpoints, the cast, the pickups, the hazards' spots, the ladders

export interface Spot { c: number; r: number; x: number; y: number }
const MARKS = SECTIONS.flatMap(({ s, i }) => s.marks.map(m => ({ ...m, c: m.c + SEC_X[i] })));
/** Cells (terrain) or marks matching. */
const spots = (pred: (ch: string) => boolean) => {
  const out: (Spot & { ch: string })[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const ch = GRID[r][c]; if (pred(ch)) out.push({ ch, c, r, x: cellX(c) + CELL / 2, y: cellY(r + 1) }); }
  for (const m of MARKS) if (pred(m.ch)) out.push({ ch: m.ch, c: m.c, r: m.r, x: cellX(m.c) + CELL / 2, y: cellY(m.r + 1) });
  return out;
};
/** Each checkpoint: his feet (on the floor under the digit's cell). */
export const CP3_AT: Record<number, { x: number; y: number }> = Object.fromEntries(spots(ch => /[0-9]/.test(ch)).map(s => [+s.ch, { x: s.x, y: s.y }]));
export const CP3 = { start: 0, lower: 1, piss: 2, chem: 3, gang: 4, shaft: 5, pipes: 6, chain: 7, pump: 8 } as const;
/** The cast: [who, x, feet y (a grub's: the ceiling's underside over it; an eel's, a hover's: its middle)]. */
export const CAST3: [Who3, number, number][] = spots(ch => ch in CAST_CH).map(s => {
  const who = CAST_CH[s.ch];
  if (who === 'grub') { let r = s.r; while (r > 0 && at(s.c, r - 1) !== '#') r--; return [who, s.x, cellY(r)]; }
  if (who === 'eel' || who === 'hover') return [who, s.x, s.y - CELL / 2];
  return [who, s.x, s.y];
});
export const PICKUPS3: [number, number, 'small_health' | 'small_ammo' | 'large_health' | 'large_ammo'][] = spots(ch => ch in PICK_CH).map(s => [s.x, s.y, PICK_CH[s.ch]]);
/** The drums (every one: its cell), the leaky ones' gas spots. */
export const DRUMS = spots(ch => ch === 'd' || ch === 'D').map(s => ({ x: cellX(s.c), y: cellY(s.r), leak: s.ch === 'D' }));
export const PUDDLES = spots(ch => ch === 'w').map(s => ({ x: cellX(s.c), y: cellY(s.r + 1) }));
/** The vents: the cell, and which way it blasts (into the air beside it). */
export const VENTS = spots(ch => ch === 'v').map(s => ({ x: cellX(s.c), y: cellY(s.r), dir: (at(s.c + 1, s.r) === '#' ? -1 : 1) as 1 | -1 }));

const isRockCh = (ch: string | undefined) => ch === '#' || ch === 'v' || ch === undefined;
export interface Ladder3 { x: number; top: number; bottom: number; wet?: boolean }
/** The ladders: each column's runs of H (its top the top of the run; its foot the bottom of it, on the floor there or
 *  in the water). */
export const LADDERS3: Ladder3[] = (() => {
  const out: Ladder3[] = [];
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      if (GRID[r][c] !== 'H') { r++; continue; }
      const a = r; while (r < ROWS && GRID[r][c] === 'H') r++;
      // (a foot over water: the rails run on down into it, so he can take hold swimming and climb back out)
      const wet = r < ROWS && (GRID[r][c] === '~');
      // (up a shaft two cells wide (rock, the ladder's cell, a cell of air, rock): stood in the middle of it, clear of
      // both walls. He's 44 across: in the left cell alone his box was 2 px into the wall the whole way)
      const mid = isRockCh(GRID[a][c - 1]) && GRID[a][c + 1] === '.' && isRockCh(GRID[a][c + 2]);
      out.push({ x: cellX(c) + (mid ? CELL : CELL / 2), top: cellY(a), bottom: cellY(r) + (wet ? 56 : 0), wet });
    }
  }
  return out;
})();

/** Solid to the physics: rock, the drums, the vents (the valve mouths are the junctions' to say). */
export const isRock = (ch: string) => ch === '#' || ch === 'd' || ch === 'D' || ch === 'v';
export const isWater = (ch: string) => ch === '~' || ch === 'F' || ch === 'Z';
export const isDeadly = (ch: string) => ch === 'P' || ch === 'C';

// ---------------------------------------------------------------------------------------------------------------
// THE WAVE POOL (the boss's: boss.ts, pool.ts, mazes.ts, waves.ts): out on its own past the tunnels. The owner's
// (2026-11-06): "ridiculously deep and long. much more than a real wave pool... by far the largest boss arena in the
// game". Nine screens long, three deep. The beach (the shallow end: zero entry, dry at its top) on the left, where he's
// flushed in; the floor slopes down to a long run at 16 FT, a second slope, THE SHELF (the first body maze), then THE
// DROP: a wall straight down to the deep end's floor (120 FT), four more body mazes along it, the wave machine's
// housing over the far wall. The waves come from there and push everything back toward the beach.

const WX = (COLS + 60) * CELL;
/** How deep (px under the surface) the shelf's floor and the deep end's floor are. */
const SHELF_D = 680, DEEP_D = 1800;
export const WP = {
  x0: WX, beach: WX + 520, x1: WX + 7200,
  /** The water's surface; the beach's top (just over it); the deep end's floor. */
  surf: GY + 10, beachTop: GY, deep: GY + 10 + DEEP_D,
  /** The shelf (the first maze's floor); the drop (the shelf's edge, and the foot of the wall under it). */
  shelf: GY + 10 + SHELF_D, dropA: WX + 3100, dropB: WX + 3300,
  /** Where the shallow end is (he's in it: the taunts). */
  shallow: WX + 1300,
  /** The outflow pipe he's flushed out of (in the deck's back wall, over the beach: its mouth). */
  pipe: { x: WX + 70, y: GY - 150 },
};
/** The pool's floor, as runs (the ground: lay()), left to right: [x1, y1, x2, y2]. */
export const POOL_RUNS: [number, number, number, number][] = [
  [WX - 300, GY, WP.beach, GY],
  [WP.beach, GY, WX + 1300, WP.surf + 240],
  [WX + 1300, WP.surf + 240, WX + 2100, WP.surf + 240],
  [WX + 2100, WP.surf + 240, WX + 2500, WP.shelf],
  [WX + 2500, WP.shelf, WP.dropA, WP.shelf],
  [WP.dropA, WP.shelf, WP.dropB, WP.deep],
  [WP.dropB, WP.deep, WP.x1, WP.deep],
];
/** The pool's floor under x. */
export const poolFloor = (x: number) => {
  if (x <= WP.beach) return WP.beachTop;
  for (const [a, ya, b, yb] of POOL_RUNS) if (x >= a && x <= b) return b === a ? ya : ya + ((x - a) / (b - a)) * (yb - ya);
  return WP.deep;
};
/** Feet of depth at y (the markings, his depth gauge): 15 px a foot (120 FT at the bottom: it's a wave pool). */
export const feetAt = (y: number) => Math.max(0, Math.round((y - WP.surf) / 15));
/** The stage's right end (past the pool). */
export const STAGE_END = WP.x1 + 400;

/** Signs round the pool. */
export const POOL_SIGNS: SignDef3[] = [
  { x: WP.x0 + 190, y: WP.beachTop, lines: ['THE WAVE POOL', 'ADULT SWIM ONLY'] },
  { x: WP.x0 + 360, y: WP.beachTop, lines: ['NO DIVING', 'NO RUNNING', 'NO HUMANS'] },
];

// ---------------------------------------------------------------------------------------------------------------
// THE DEAD BODY MAZES (the owner's: "you need to swim through some treacherous piles of dead bodies in several 'dead
// body mazes' to find chlorine tanks and dash into them"). Every guest the aliens drowned, heaped on the bottom. A grid
// of their own: 40 px cells, row 0 the cells just under the surface, so a maze's bottom row (44 in the deep end, 16 on
// the shelf) sits on the floor. Corridors two cells (80 px: he's 64 tall) or three; GUPPLAX is too fat to get in.
//
//   #  the pile (solid; its top lit where it can be stood on)       .  water
//   T  a chlorine tank (its pocket's top-left cell: the tank fills 2 x 2 cells of water)
//   x  a snag (rebar, fish hooks, a broken femur: in the water, it hurts)
//   h  a dead hand (out of the wall beside it, across the corridor, on a clock: it grabs and holds him)
//
// Each one's a timing run (the owner's: "stage 3 is about timed navigation"): the surges shove him back toward the
// beach the whole time, so the dash into each tank goes in between them; his air runs out down there; the hands are on
// clocks; and the way out puts him back in open water, where GUPPLAX is waiting.

export interface MazeDef { name: string; c0: number; r0: number; map: string[] }
export const MAZES: MazeDef[] = [
  // THE PILE-UP, on the shelf: taught. In at the top, along, down the left, along to the tank: dash right.
  { name: 'THE PILE-UP', c0: 63, r0: 7, map: [
    '#####..#######',
    '#####..#######',
    '##..........x#',
    '##h..........#',
    '##..##########',
    '##..##########',
    '##......T....#',
    '##.x.........#',
    '##############',
    '##############',
  ] },
  // THE BODY FARM: in from the right, along the top, down the left, back along, the dash DOWN into the tank (the surge
  // shoving him off the line of it while he lines up).
  { name: 'THE BODY FARM', c0: 86, r0: 31, map: [
    '.############.',
    '##############',
    '##.......x....',
    '##h...........',
    '##..##########',
    '##..##########',
    '##..##########',
    '##..##########',
    '##.........###',
    '##...h.....###',
    '#########..###',
    '#########T.###',
    '#########..###',
    '##############',
  ] },
  // THE MASS GRAVE: the tallest. Down a shaft from the top, along, down past a hand, back along, down the left, along
  // the bottom under another hand to the tank at the far end: dash right, into the surge.
  { name: 'THE MASS GRAVE', c0: 106, r0: 27, map: [
    '#######..#######',
    '#######..#######',
    '###...........##',
    '###x..........##',
    '###########..###',
    '###########..###',
    '###########h.###',
    '##...........###',
    '##..........x###',
    '##..############',
    '##..############',
    '##..############',
    '##.......h....##',
    '##.........T..##',
    '##x...........##',
    '################',
    '################',
    '################',
  ] },
  // THE MEAT LOCKER: low on the deep floor, one long tunnel in from the left (the surges blow straight down it, out),
  // three hands on it out of step; the tank at its far end.
  { name: 'THE MEAT LOCKER', c0: 128, r0: 33, map: [
    '..##########..',
    '.############.',
    '##############',
    '##############',
    '##############',
    '##############',
    '##############',
    '...h...h..T..#',
    '..x....h.....#',
    '##############',
    '##############',
    '##############',
  ] },
  // THE TOWER OF BODIES: two ways in (low on the left, or down the shaft on the right), along to the middle, the dash UP
  // a shaft past a hand into the tank at the top.
  { name: 'THE TOWER OF BODIES', c0: 150, r0: 33, map: [
    '############..##',
    '######.T.###..##',
    '######....##..##',
    '#######..###..##',
    '#######..###.h##',
    '#######h.###..##',
    '#######..###..##',
    '..............##',
    '...x..........##',
    '################',
    '################',
    '################',
  ] },
];
/** The maze grid's cell (col, row) to world. */
export const mzX = (c: number) => WX + c * CELL;
export const mzY = (r: number) => WP.surf + r * CELL;
