// Ernie Earthquake's stage, laid out as data. San Francisco, and the big one's
// coming: up and down the steep streets between the painted ladies (tech bros,
// bike couriers, protesters, raccoons, seagulls, drones), the quakes getting
// worse the further you go, dropping flowerpots and bricks off the windowsills
// and, before long, splitting the street open under you. Then the Golden Gate
// Bridge, coming apart a span at a time, cars going over the side and people on
// fire. Down at the water on the far side: a hipster with a jet ski (not for
// long), and a run across the bay to Alcatraz with everything that floats or
// flies after you. The ride ends in the cell house, on a guided tour. Then the
// island, with the quakes back on and worse than ever: up the cell house's
// galleries as they come down (the floor gone into the old fort under it in
// places), out into the recreation yard and down the cliffs, the ground opening
// under you, and into the old citadel's vaults under the prison. Ernie's door is
// at the bottom.
//
// Three places in the world, each built in its own coordinates and shifted into place:
//   - the streets and the bridge, far to the left
//   - the bay (the pier, and the long run of water across to the island), further left still
//   - Alcatraz (the cell house, the yard and the cliffs, the citadel), right before the boss door

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

export const CP = { STREETS: 0, QUAKES: 1, BRIDGE: 2, DOCK: 3, SKI: 4, ALCATRAZ: 5, YARD: 6, CITADEL: 7, DOOR: 8 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/**
 * A fire escape or a bay window's ledge (on the island: a cell house gallery, a guard tower's walk, a gun port in the
 * citadel): you can jump up through it. One with `collapse` gives way in a quake when he gets within that of it.
 */
export interface Ledge { x: number; y: number; w: number; collapse?: number }
/**
 * A fault under the street: paved over till a quake splits it open (a crack, dust, then a
 * chasm). It goes when he gets within `trigger` of it with a quake on (and it starts one if
 * there isn't one): a long way off for the first, so you watch it happen; later, close
 * enough that if you're rushing you're standing on it.
 */
export interface Fault { x: number; w: number; y: number; trigger: number; look?: FaultLook }
/** What a fault's opened up in: the street, or on the island the cell house floor, the yard, the cliff path, the citadel's. */
export type FaultLook = 'street' | 'floor' | 'yard' | 'rock' | 'brick';
/** A span of the bridge deck that gives way when he gets within `trigger` of it (or already has). */
export interface Span { x: number; w: number; trigger: number; open?: boolean }
/** A car stopped on the bridge, on fire; the people in it get out screaming when he's near. */
export interface Wreck { x: number; people: number }
export interface Prop { look: string; x: number; y: number; text?: string }
/** Something on the island a quake can bring down: a cell house lamp, plaster off a gallery, a rock off the cliff, a brick off a vault. */
export interface IslandLoose { x: number; y: number; look: 'lamp' | 'plaster' | 'rock' | 'brick' }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  faults: Fault[];
  spans: Span[];
  wrecks: Wreck[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  props: Prop[];
  /** The streets, then the bridge (towers at these x), and the way down off the far end. */
  streets: { x1: number; x2: number };
  bridge: { x1: number; x2: number; towers: number[]; exit: number };
  /** The bay: the pier, the hipster's jet ski at the end of it, the run of water. */
  bay: { x1: number; pier: number; ski: number; x2: number; water: number };
  cellblock: { x1: number; x2: number; y: number; crashX: number };
  /** The island's three parts: the cell house (to house), the yard and the cliffs (to yard), the citadel (to the door). */
  island: { house: number; yard: number; tier2: number; tier3: number; loose: IslandLoose[] };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const MAIN_X0 = -60000;
const BAY_X0 = -120000;
/** Alcatraz, from the cell house to Ernie's door. */
const ISLAND_LEN = 7100;
const CELL_X1 = BOSS_DOOR_X - ISLAND_LEN;

const Y = GROUND_Y;

const build = () => {
  const m = part(MAIN_X0), b = part(BAY_X0);

  // ============ THE STREETS ============
  // Up the first hill: a tech bro at the top, and the first little quake (flowerpots off the sills, out ahead of you)
  m.ground(0, 500);
  m.ground(500, 900, Y, Y - 120);
  m.ground(900, 1300, Y - 120);
  m.spawn('techbro', 1200, Y - 120);
  m.ground(1300, 1700, Y - 120, Y - 40);
  m.ground(1700, 2300, Y - 40);
  m.spawn('raccoon', 1950, Y - 40);
  m.spawn('drone', 2200, Y - 330);
  m.ledge(1820, Y - 190, 120);
  m.pickup(1880, Y - 220, 'small_ammo');

  // A steep one, a courier coming down it; the first fault opens well out ahead of you
  m.ground(2300, 2800, Y - 40, Y - 200);
  m.spawn('courier', 2760, Y - 200);
  m.ground(2800, 3150, Y - 200);
  m.fault(3150, 140, Y - 200, 430);
  m.ground(3290, 3400, Y - 200);
  m.ground(3400, 3900, Y - 200, Y - 60);
  m.ground(3900, 4200, Y - 60);
  m.spawn('seagull', 3980, Y - 330);
  m.spawn('protester', 4080, Y - 60);
  // ...and this one's closer
  m.fault(4200, 150, Y - 60, 240);
  m.ground(4350, 4600, Y - 60);
  m.spawn('techbro', 4520, Y - 60);
  m.pickup(4400, Y - 90, 'small_health');

  // Higher, busier: a fault that goes right as you get to it, fire escapes to get up out of the way
  m.ground(4600, 5000, Y - 60, Y - 220);
  m.ground(5000, 5260, Y - 220);
  m.fault(5260, 160, Y - 220, 185);
  m.ground(5420, 5700, Y - 220);
  m.ledge(5080, Y - 360, 130); m.ledge(5300, Y - 420, 140); m.ledge(5520, Y - 360, 130);
  m.pickup(5370, Y - 450, 'small_ammo');
  m.spawn('drone', 5450, Y - 520);
  m.spawn('courier', 5640, Y - 220);
  m.ground(5700, 6200, Y - 220, Y - 80);
  m.ground(6200, 6420, Y - 80);
  m.spawn('raccoon', 6300, Y - 80);
  m.fault(6420, 150, Y - 80, 190);
  m.ground(6570, 6760, Y - 80);
  m.fault(6760, 170, Y - 80, 180);
  m.ground(6930, 7000, Y - 80);
  m.ground(7000, 7400, Y - 80, Y);
  m.spawn('protester', 7120, Y - 50);
  m.spawn('seagull', 6900, Y - 380);

  // ============ THE BRIDGE ============
  // The toll plaza, then out onto the deck
  m.ground(7400, 8000);
  m.pickup(7700, Y - 30, 'large_health');
  const deck: [number, number][] = [];
  const spans: Span[] = [];
  // Spans that go, sooner and wider as you get further out (the first one well ahead of you, so you see it happen)
  const gap = (x: number, w: number, trigger: number, open = false) => { spans.push({ x: MAIN_X0 + x, w, trigger, open }); deck.push([x, x + w]); };
  gap(8500, 130, 480);
  gap(9350, 150, 360);
  gap(10000, 155, 260);
  gap(10650, 165, 200);
  gap(11200, 170, 160, true);
  gap(11700, 180, 175);
  gap(12200, 190, 165);
  let at = 8000;
  for (const [x1, x2] of deck) { m.ground(at, x1); at = x2; }
  // (and at the far end, the stairs down off the deck: he walks down them into the fade)
  m.ground(at, 12900);
  m.ground(12900, 12984, Y, Y + 72);
  m.ground(12984, 13000, Y + 72);
  m.wreck(8850, 1); m.wreck(9750, 2); m.wreck(10420, 1); m.wreck(11480, 1); m.wreck(12500, 1);
  m.spawn('techbro', 9150); m.spawn('drone', 9900, Y - 290); m.spawn('courier', 10300);
  m.spawn('protester', 10900); m.spawn('techbro', 11980);
  m.pickup(10420, Y - 30, 'small_health');
  m.pickup(11990, Y - 30, 'small_ammo');

  // ============ THE BAY ============
  // A pier (the hipster's at the end of it with his jet ski), then water all the way to Alcatraz
  const PIER = 720, WATER_END = 48000;
  b.ground(0, PIER, Y - 50, Y - 50, 'pier');
  b.ground(PIER, WATER_END, Y, Y, 'water');

  // ============ ALCATRAZ ============
  // (the tour's on Broadway at the start of it; the jet ski comes down through the skylight on top of them)
  const I = part(CELL_X1), loose: IslandLoose[] = [];
  const T2 = Y - 120, T3 = Y - 240;
  const hang = (look: IslandLoose['look'], x: number, y: number) => loose.push({ look, x: CELL_X1 + x, y });
  // THE CELL HOUSE. Broadway, where the tour was; the galleries up either side (the second tier, the third)
  I.ground(0, 1250, Y, Y, 'cellblock');
  I.pickup(820, Y - 30, 'small_ammo');
  I.ledge(620, T2, 580); I.ledge(900, T3, 330);
  I.pickup(1060, T3 - 30, 'small_health');
  I.spawn('convict', 1000); I.spawn('parkranger', 1120, T2);
  // The first quake out here: the floor goes, out ahead of you, into the old fort underneath
  I.fault(1250, 150, Y, 420, 'floor');
  I.ground(1400, 1600, Y, Y, 'cellblock');
  // ...and past it, the floor's already gone: a hole down into the fort too wide to jump. Up the galleries and over it
  // (the second tier gives way in the middle as you come: jump the gap it leaves, or up to the third and round)
  I.ledge(1330, T2, 230); I.ledge(1560, T2, 140, 210); I.ledge(1700, T2, 300);
  I.ledge(1500, T3, 300);
  I.spawn('convict', 1820, T2);
  I.ground(1950, 2150, Y, Y, 'cellblock');
  I.spawn('convict', 2080);
  // The far end of the block's come down in a heap: up the rubble, a gallery's worth of it, and another hole opening in it
  I.ground(2150, 2350, Y, T2, 'rubble');
  I.ground(2350, 2450, T2, T2, 'rubble');
  I.spawn('parkranger', 2400, T2);
  I.fault(2450, 150, T2, 230, 'floor');
  I.ground(2600, 2640, T2, T2, 'rubble');
  // Up the stairs and out the door into the yard
  I.ground(2640, 2720, T2, T3, 'stairs');
  for (const x of [700, 1000, 1300, 1680, 2000, 2280]) hang('lamp', x, Y - 330);
  for (const x of [800, 1420, 1880]) hang('plaster', x, T2 + 16);
  // THE YARD. Up top of the island, the city across the water; a fault goes open across it as you come out
  I.ground(2720, 2900, T3, T3, 'yard');
  I.fault(2900, 150, T3, 360, 'yard');
  I.ground(3050, 3250, T3, T3, 'yard');
  I.spawn('seagull', 2980, T3 - 230); I.spawn('convict', 3180, T3);
  // The bleachers, up to the top of the yard wall (the guard tower's walk over it)
  I.ground(3250, 3310, T3 - 50, T3 - 50, 'bleacher');
  I.ground(3310, 3370, T3 - 100, T3 - 100, 'bleacher');
  I.ground(3370, 3430, T3 - 150, T3 - 150, 'bleacher');
  const TOP = T3 - 150;
  I.ground(3430, 3650, TOP, TOP, 'yard');
  I.pickup(3500, TOP - 30, 'small_ammo');
  I.ledge(3470, TOP - 110, 110);
  I.pickup(3525, TOP - 140, 'small_health');
  I.spawn('parkranger', 3600, TOP);
  // Over the wall and down the cliffs on the old switchback road: faults opening in it, rocks shaken off the cliff
  // over it, a stretch washed clean out into the bay
  I.ground(3650, 3760, TOP, TOP + 60, 'cliff');
  I.ground(3760, 3950, TOP + 60, TOP + 60, 'cliff');
  I.spawn('seagull', 3880, TOP - 170);
  I.fault(3950, 160, TOP + 60, 230, 'rock');
  I.ground(4110, 4300, TOP + 60, Y - 200, 'cliff');
  I.spawn('parkranger', 4250, Y - 245);
  I.ground(4300, 4450, Y - 200, Y - 200, 'cliff');
  I.pickup(4400, Y - 230, 'small_health');
  I.ground(4610, 4800, Y - 200, Y - 110, 'cliff');
  I.spawn('convict', 4700, Y - 170); I.spawn('seagull', 4640, Y - 400);
  I.fault(4800, 150, Y - 110, 190, 'rock');
  I.ground(4950, 5150, Y - 110, Y, 'cliff');
  // (sat on the cliff face over the road: see islandDraw.ts for where its top is)
  const face = (x: number) => TOP - 60 + (x - 3650) * 0.18;
  for (const x of [3830, 4180, 4370, 4700, 5020]) hang('rock', x, face(x) + 26);
  // THE CITADEL. Down into the old fort's vaults under the prison, the bedrock: bricks coming out of the vaults
  // over you, a fault in the floor, the old cistern (flooded), a gun port's ledge over it that won't hold
  I.ground(5150, 5500, Y, Y, 'citadel');
  I.spawn('convict', 5420);
  I.fault(5500, 150, Y, 230, 'brick');
  I.ground(5650, 5800, Y, Y, 'citadel');
  I.spawn('parkranger', 5740);
  I.ledge(5835, Y - 90, 90, 150);
  // (and the last hallway, a good long one, down to Ernie's door)
  I.ground(5960, 7100, Y, Y, 'citadel');
  I.ledge(6080, Y - 120, 140);
  I.pickup(6150, Y - 150, 'small_ammo');
  for (const x of [5300, 5600, 5880, 6150]) hang('brick', x, Y - 196);

  return {
    island: I, islandLoose: loose,
    main: m, bay: b, spans,
    bridgeX: { x1: MAIN_X0 + 8000, x2: MAIN_X0 + 13000, towers: [MAIN_X0 + 9000, MAIN_X0 + 11950], exit: MAIN_X0 + 12900 },
    bayX: { x1: BAY_X0, pier: BAY_X0 + PIER, ski: BAY_X0 + PIER + 50, x2: BAY_X0 + WATER_END, water: Y },
  };
};

/** A stretch of course in its own coordinates, shifted by x0. */
const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], faults: Fault[] = [], wrecks: Wreck[] = [];
  const spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  return {
    runs, ledges, faults, wrecks, spawns, pickups, props,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1, surface = 'street') => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2, surface }); },
    ledge: (x: number, y: number, w: number, collapse?: number) => { ledges.push({ x: x0 + x, y, w, collapse }); },
    fault: (x: number, w: number, y: number, trigger: number, look: FaultLook = 'street') => { faults.push({ x: x0 + x, w, y, trigger, look }); },
    wreck: (x: number, people: number) => { wrecks.push({ x: x0 + x, people }); },
    spawn: (kind: EnemyKind, x: number, y = Y) => { spawns.push({ kind, x: x0 + x, y }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    prop: (look: string, x: number, y: number, text?: string) => { props.push({ look, x: x0 + x, y, text }); },
  };
};

const buildCourse = (): Course => {
  const { main, bay, island, islandLoose, spans, bridgeX, bayX } = build();
  const cellblock = { x1: CELL_X1, x2: BOSS_DOOR_X, y: Y, crashX: CELL_X1 + 470 };
  const runs = [...bay.runs, ...main.runs, ...island.runs];
  runs.sort((a, b) => a.x1 - b.x1);
  // (the gaps are all drawn by the stage: the faults, the bridge, the gaps between the parts)
  runs.forEach((r, i) => { const next = runs[i + 1]; if (next && next.x1 > r.x2 + 1) r.pitAfter = 'clouds'; });
  // The bridge deck's its own surface
  runs.forEach(r => { if (r.x1 >= bridgeX.x1 - 1 && r.x2 <= bridgeX.x2 + 1) r.surface = 'deck'; });
  const pickups = [...bay.pickups, ...main.pickups, ...island.pickups, { x: cellblock.x2 - 300, y: Y - 30, type: 'large_health' }, { x: cellblock.x2 - 220, y: Y - 30, type: 'large_ammo' }] as PickupSpot[];
  return {
    runs,
    ledges: [...main.ledges, ...bay.ledges, ...island.ledges],
    faults: [...main.faults, ...island.faults],
    spans,
    wrecks: main.wrecks,
    spawns: [...main.spawns, ...bay.spawns, ...island.spawns],
    pickups,
    props: [...main.props, ...bay.props],
    streets: { x1: MAIN_X0, x2: MAIN_X0 + 7400 },
    bridge: bridgeX,
    bay: bayX,
    cellblock,
    island: { house: CELL_X1 + 2720, yard: CELL_X1 + 5150, tier2: Y - 120, tier3: Y - 240, loose: islandLoose },
    checkpoints: [
      { x: MAIN_X0 + 150, y: Y }, { x: MAIN_X0 + 1800, y: Y - 40 }, { x: MAIN_X0 + 7600, y: Y },
      { x: BAY_X0 + 120, y: Y - 50 }, { x: bayX.ski, y: Y }, { x: cellblock.crashX, y: Y },
      { x: CELL_X1 + 2780, y: Y - 240 }, { x: CELL_X1 + 5230, y: Y }, { x: BOSS_DOOR_X - 480, y: Y },
    ],
    left: BAY_X0 - 2000,
    startX: MAIN_X0,
  };
};

export const COURSE = buildCourse();

/** Where the houses along the streets stop (the toll plaza's open ground after that). */
export const HOUSES_END = COURSE.bridge.x1 - 700;

/** Where a fault or a span is under x, if anywhere. */
export const faultAt = (x: number) => COURSE.faults.findIndex(f => x > f.x && x < f.x + f.w);

/** Placed on Alcatraz (waiting there for him: whatever clears the streets, the bridge or the bay doesn't touch it). */
export const onTheIsland = (e: { pos: { x: number } }) => e.pos.x >= COURSE.cellblock.x1 - 200;
