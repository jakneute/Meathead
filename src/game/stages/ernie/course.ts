// Ernie Earthquake's stage, laid out as data. San Francisco, and the big one's
// coming: up and down the steep streets between the painted ladies (tech bros,
// bike couriers, protesters, raccoons, seagulls, drones), the quakes getting
// worse the further you go, dropping flowerpots and bricks off the windowsills
// and, before long, splitting the street open under you. Then the Golden Gate
// Bridge, coming apart a span at a time, cars going over the side and people on
// fire. Down at the water on the far side: a hipster with a jet ski (not for
// long), and a run across the bay to Alcatraz with everything that floats or
// flies after you. The ride ends in the cell block, on a guided tour. Ernie's
// door is just past it.
//
// Three places in the world, each built in its own coordinates and shifted into place:
//   - the streets and the bridge, far to the left
//   - the bay (the pier, and the long run of water across to the island), further left still
//   - the cell block on Alcatraz, right before the boss door

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

export const CP = { STREETS: 0, QUAKES: 1, BRIDGE: 2, DOCK: 3, SKI: 4, ALCATRAZ: 5 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** A fire escape or a bay window's ledge: you can jump up through it. */
export interface Ledge { x: number; y: number; w: number }
/**
 * A fault under the street: paved over till a quake splits it open (a crack, dust, then a
 * chasm). It goes when he gets within `trigger` of it with a quake on (and it starts one if
 * there isn't one): a long way off for the first, so you watch it happen; later, close
 * enough that if you're rushing you're standing on it.
 */
export interface Fault { x: number; w: number; y: number; trigger: number }
/** A span of the bridge deck that gives way when he gets within `trigger` of it (or already has). */
export interface Span { x: number; w: number; trigger: number; open?: boolean }
/** A car stopped on the bridge, on fire; the people in it get out screaming when he's near. */
export interface Wreck { x: number; people: number }
export interface Prop { look: string; x: number; y: number; text?: string }

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
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const MAIN_X0 = -60000;
const BAY_X0 = -120000;
const CELL_X1 = BOSS_DOOR_X - 1500;

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
  m.ground(at, 13000);
  m.wreck(8850, 1); m.wreck(9750, 2); m.wreck(10420, 1); m.wreck(11480, 2); m.wreck(12500, 1);
  m.spawn('techbro', 9150); m.spawn('drone', 9900, Y - 290); m.spawn('courier', 10300);
  m.spawn('protester', 10900); m.spawn('drone', 11500, Y - 310); m.spawn('techbro', 11980);
  m.spawn('seagull', 12400, Y - 330);
  m.pickup(10420, Y - 30, 'small_health');
  m.pickup(11990, Y - 30, 'small_ammo');

  // ============ THE BAY ============
  // A pier (the hipster's at the end of it with his jet ski), then water all the way to Alcatraz
  const PIER = 720, WATER_END = 48000;
  b.ground(0, PIER, Y - 50, Y - 50, 'pier');
  b.ground(PIER, WATER_END, Y, Y, 'water');

  return {
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
    ledge: (x: number, y: number, w: number) => { ledges.push({ x: x0 + x, y, w }); },
    fault: (x: number, w: number, y: number, trigger: number) => { faults.push({ x: x0 + x, w, y, trigger }); },
    wreck: (x: number, people: number) => { wrecks.push({ x: x0 + x, people }); },
    spawn: (kind: EnemyKind, x: number, y = Y) => { spawns.push({ kind, x: x0 + x, y }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    prop: (look: string, x: number, y: number, text?: string) => { props.push({ look, x: x0 + x, y, text }); },
  };
};

const buildCourse = (): Course => {
  const { main, bay, spans, bridgeX, bayX } = build();
  const cellblock = { x1: CELL_X1, x2: BOSS_DOOR_X, y: Y, crashX: CELL_X1 + 470 };
  const runs = [...bay.runs, ...main.runs, { x1: cellblock.x1, y1: Y, x2: cellblock.x2, y2: Y, surface: 'cellblock' }];
  runs.sort((a, b) => a.x1 - b.x1);
  // (the gaps are all drawn by the stage: the faults, the bridge, the gaps between the parts)
  runs.forEach((r, i) => { const next = runs[i + 1]; if (next && next.x1 > r.x2 + 1) r.pitAfter = 'clouds'; });
  // The bridge deck's its own surface
  runs.forEach(r => { if (r.x1 >= bridgeX.x1 - 1 && r.x2 <= bridgeX.x2 + 1) r.surface = 'deck'; });
  const pickups = [...bay.pickups, ...main.pickups, { x: cellblock.x2 - 300, y: Y - 30, type: 'large_health' }, { x: cellblock.x2 - 220, y: Y - 30, type: 'large_ammo' }] as PickupSpot[];
  return {
    runs,
    ledges: [...main.ledges, ...bay.ledges],
    faults: main.faults,
    spans,
    wrecks: main.wrecks,
    spawns: [...main.spawns, ...bay.spawns],
    pickups,
    props: [...main.props, ...bay.props],
    streets: { x1: MAIN_X0, x2: MAIN_X0 + 7400 },
    bridge: bridgeX,
    bay: bayX,
    cellblock,
    checkpoints: [
      { x: MAIN_X0 + 150, y: Y }, { x: MAIN_X0 + 1800, y: Y - 40 }, { x: MAIN_X0 + 7600, y: Y },
      { x: BAY_X0 + 120, y: Y - 50 }, { x: bayX.ski, y: Y }, { x: cellblock.crashX, y: Y },
    ],
    left: BAY_X0 - 2000,
    startX: MAIN_X0,
  };
};

export const COURSE = buildCourse();

/** Where a fault or a span is under x, if anywhere. */
export const faultAt = (x: number) => COURSE.faults.findIndex(f => x > f.x && x < f.x + f.w);
