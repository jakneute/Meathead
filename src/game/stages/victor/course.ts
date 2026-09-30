// Victor Volcano's stage, laid out as data: the rocky cliffs on the way to an
// active volcano (it looms closer and closer as the trail curves round toward
// it), Club Caldera at its foot (the doorman won't let you in), then inside: a
// river of lava to cross on drifting rafts of rock, and a tall shaft full of
// fire and furnaces up to a window near the top. Through the window: Club
// Caldera's main floor, lava everywhere (a dance floor of glass over it, the bar
// in a moat of it, an infinity pool of it), the crowd, the club's own crew; then
// the club's atrium, a tower of neon and pyro up to the VIP lounge, a party, and
// then not much of one. The boss door's just past it.
//
// Three places in the world, each built in its own coordinates and shifted into place:
//   - the main run (the cliffs and the club), far to the left
//   - inside the volcano (the lava river, then the shaft), further left still
//   - the club floor and its atrium, further left again
//   - the VIP lounge, right before the boss door

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

export const CP = { TRAIL: 0, BOMBS: 1, CLUB: 2, RIVER: 3, RIVER_MID: 4, SHAFT: 5, FLOOR: 6, ATRIUM: 7, LOUNGE: 8 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** A ledge of rock (or a steel catwalk in the shaft): you can jump up through it. */
export interface Ledge { x: number; y: number; w: number; look: 'rock' | 'catwalk' | 'neon' | 'cage' | 'booth' }
/** Something solid on the club floor to get up on or over: the bar, a stack of speakers. */
export interface Solid { x: number; y: number; w: number; h: number; look: 'bar' | 'speakers' }
/** A crack in the ground that vents fire: it smokes and glows, then erupts in a column (from lava: a spout). */
export interface Vent { x: number; y: number; period: number; phase: number; lava?: boolean }
/** Volcanic bombs come down in here (the lesson ones out ahead of you, then aimed). */
export interface BombZone { x1: number; x2: number; every: number; aimed: boolean }
/** A nozzle in the shaft wall that shoots a jet of flame across (dir +1 out of the left wall, -1 out of the right). */
export interface FlameJet { x: number; y: number; dir: 1 | -1; len: number; period: number; phase: number }
/** A spinning bar of fireballs round a pivot. */
export interface FireBar { x: number; y: number; len: number; speed: number; phase: number }
/** A raft of rock drifting along a stretch of the lava river (it goes under at the far end and comes up again at the start). */
export interface RaftLane { x1: number; x2: number; y: number; count: number; w: number; speed: number }
export interface Prop { look: string; x: number; y: number; w?: number; h?: number; text?: string }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  vents: Vent[];
  bombs: BombZone[];
  jets: FlameJet[];
  bars: FireBar[];
  rafts: RaftLane[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  props: Prop[];
  /** Where the trail starts and where it reaches the foot of the volcano (the volcano looms as you go). */
  approach: { x1: number; x2: number };
  /** The doorman's patch in front of the club, and the club doors. */
  club: { x1: number; x2: number; y: number; door: number };
  /** Inside: where it starts, and the shaft (its walls, floor and the top, with the window). */
  inside: { x1: number; x2: number };
  shaft: { x1: number; x2: number; floor: number; top: number; window: { x: number; y: number } };
  /** Club Caldera's main floor, and its atrium (a second shaft, of neon and pyro, up to the VIP lounge's window). */
  floor: { x1: number; x2: number };
  atrium: { x1: number; x2: number; floor: number; top: number; window: { x: number; y: number } };
  solids: Solid[];
  lounge: { x1: number; x2: number; y: number; window: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const MAIN_X0 = -30000;
const IN_X0 = -52000;
/** Where the lava river starts, inside (local x: it runs up to the shaft at 3000). */
const RIVER_X0 = 3000 - 7730;
const LOUNGE_X1 = BOSS_DOOR_X - 1500;
/** Club Caldera's floor and atrium, in their own coordinates. */
const CLUB_X0 = -150000;

const Y = GROUND_Y;

/** The main run and the inside, in their own coordinates (x from 0), shifted into place at the end. */
const build = () => {
  const main = part(MAIN_X0), inside = part(IN_X0);

  // ============ THE TRAIL ============
  // Easy going at first: salamanders on flat rock, then a crack venting fire (on solid ground, nothing near it)
  const m = main;
  m.ground(0, 700);
  m.lava(700, 860, Y + 28);
  m.ground(860, 1120);
  m.vent(990, Y, 170, 0);
  m.ground(1120, 1400, Y, Y - 80);
  m.ground(1400, 2000, Y - 80);
  m.spawn('salamander', 420); m.spawn('salamander', 1620, Y - 80); m.spawn('salamander', 1840, Y - 80);
  m.ledge(1520, Y - 210, 130);
  m.pickup(1585, Y - 240, 'small_ammo');
  m.spawn('vulture', 1750, Y - 330);
  // A wider pool with a stepping stone in it
  m.lava(2000, 2260, Y - 12);
  m.ledge(2090, Y - 70, 80);
  m.ground(2260, 2640, Y - 40);
  m.spawn('heatsuit', 2560, Y - 40);

  // ============ THE BOMB FIELD ============
  // The volcano starts lobbing lumps of itself: first out ahead of you on open ground, then at you
  m.ground(2640, 3320, Y - 40);
  m.bombZone(2700, 3320, 110, false);
  m.vent(3180, Y - 40, 150, 60);
  m.lava(3320, 3520, Y - 30);
  m.ground(3520, 4120, Y - 60);
  m.bombZone(3520, 6800, 150, true);
  m.ledge(3700, Y - 230, 170);
  m.spawn('heatsuit', 3780, Y - 230);
  m.spawn('smokejumper', 4000, Y - 60);
  m.pickup(3600, Y - 90, 'small_health');
  m.ground(4120, 4320, Y - 60, Y - 160);
  m.ground(4320, 4900, Y - 160);
  m.spawn('blastshield', 4740, Y - 160);
  m.spawn('vulture', 4500, Y - 420);
  m.spawn('salamander', 4420, Y - 160);

  // ============ THE LAVA FLOW ============
  // Basalt columns standing in a flow of lava; fish in the lava (kept up high enough that you can see them coming)
  m.lava(4900, 5060, Y - 130); m.fish(4980, Y - 130);
  m.ground(5060, 5180, Y - 175);
  m.lava(5180, 5340, Y - 130); m.fish(5260, Y - 130);
  m.ground(5340, 5460, Y - 215);
  m.lava(5460, 5630, Y - 130); m.fish(5545, Y - 130);
  m.ground(5630, 5750, Y - 175);
  m.lava(5750, 5900, Y - 130);
  m.pickup(5400, Y - 245, 'small_ammo');

  // ============ UP TO THE CLUB ============
  m.ground(5900, 6150, Y - 150);
  m.ground(6150, 6350, Y - 150, Y - 40);
  m.ground(6350, 6800, Y - 40);
  m.vent(6450, Y - 40, 140, 30);
  m.vent(6650, Y - 40, 140, 100);
  m.spawn('salamander', 6020, Y - 150); m.spawn('heatsuit', 6550, Y - 40); m.spawn('smokejumper', 6760, Y - 40);
  m.spawn('vulture', 6300, Y - 420);
  m.ground(6800, 7100, Y - 40, Y);
  m.pickup(6950, Y - 50, 'large_health');
  // The club: a plaza at the volcano's foot, the doorman on the door
  m.ground(7100, 8600);
  

  // ============ INSIDE: THE LAVA RIVER ============
  // (it runs from RIVER_X0, left of 0: the shaft stays where it is at 3000). Every stretch of it is wider than he can
  // get across in the air, a jump and every charge he's got strung together (1,460 or so): it's the rafts or nothing.
  // The rafts are close enough together to hop between; the islands between the stretches are too short to get a run
  // at it
  const n = inside;
  const R = RIVER_X0;
  /** A stretch of the river from x1 to x2: rafts (as many as keep a hop between them), the fish, the spouts. */
  const stretch = (x1: number, x2: number, w: number, speed: number, fish: number[], spouts: [number, number, number][]) => {
    n.lava(x1, x2, Y + 28);
    n.raftLane(x1, x2, Math.floor((x2 - x1) / (w + 145)), w, speed);
    for (const f of fish) n.fish(f, Y + 28);
    for (const [sx, period, phase] of spouts) n.spout(sx, period, phase);
  };
  n.ground(R, R + 420);
  // Slow and steady first: the rafts come to you, one fish, one spout
  stretch(R + 420, R + 2070, 130, 1.3, [R + 1300], [[R + 900, 200, 20]]);
  n.ground(R + 2070, R + 2250, Y - 20);
  n.spawn('heatsuit', R + 2190, Y - 20);
  // Quicker: two fish, two spouts
  stretch(R + 2250, R + 3950, 120, 1.7, [R + 2700, R + 3450], [[R + 2950, 180, 90], [R + 3650, 170, 30]]);
  n.ground(R + 3950, R + 4150, Y - 20);
  n.spawn('blastshield', R + 4090, Y - 20);
  n.pickup(R + 3990, Y - 50, 'small_health');
  // Quicker still, smaller rafts, vultures over it (knocked off a raft, it's a long way to anywhere)
  stretch(R + 4150, R + 5900, 110, 2.0, [R + 4600, R + 5300], [[R + 4850, 160, 40], [R + 5550, 160, 120]]);
  n.spawn('vulture', R + 4700, Y - 300); n.spawn('vulture', R + 5400, Y - 340);
  n.ground(R + 5900, R + 6080, Y - 20);
  n.pickup(R + 6000, Y - 50, 'large_health');
  // The last: fast, the spouts timed close, fish in it
  stretch(R + 6080, R + 7730, 110, 2.3, [R + 6500, R + 7050, R + 7450], [[R + 6400, 150, 0], [R + 6850, 150, 50], [R + 7300, 150, 100]]);

  // ============ INSIDE: THE SHAFT ============
  // Up the chimney of the volcano: catwalks back and forth, jets of flame out of the walls, spinning fire bars
  const SX1 = 3000, SX2 = 3760, TOP = Y - 2640;
  n.ground(3000, 3760);
  n.pickup(3100, Y - 30, 'large_ammo');
  const walk = (x: number, dy: number, w = 160) => n.ledge(x, Y - dy, w, 'catwalk');
  walk(3500, 110); walk(3240, 220); walk(3020, 330, 180); walk(3300, 440);
  n.jet(SX1, Y - 420, 1, 360, 150, 0);
  walk(3580, 550, 180); walk(3340, 660);
  n.spawn('heatsuit', 3640, Y - 550);
  walk(3060, 770, 180); walk(3360, 880); walk(3600, 990, 160);
  n.jet(SX2, Y - 830, -1, 380, 140, 50);
  n.bar(3300, Y - 1100, 110, 0.03, 0);
  walk(3100, 1110, 150); walk(3020, 1220, 140); walk(3280, 1330); walk(3560, 1440, 200);
  n.spawn('blastshield', 3700, Y - 1440);
  // Furnace vents in the catwalks: they belch fire up through the grating
  n.vent(3600, Y - 1440, 130, 0);
  n.pickup(3080, Y - 1250, 'small_health');
  n.jet(SX1, Y - 1500, 1, 400, 130, 20);
  walk(3300, 1550); walk(3040, 1660, 160); walk(3300, 1770); walk(3580, 1880, 180);
  n.bar(3380, Y - 1990, 130, -0.035, 1);
  walk(3340, 2000, 160); walk(3080, 2110, 150); walk(3280, 2220); walk(3560, 2330, 200);
  n.jet(SX2, Y - 2305, -1, 380, 120, 70);
  n.spawn('heatsuit', 3620, Y - 2330);
  walk(3300, 2440); walk(3060, 2550, 160);
  // The top: a ledge along to the window in the right wall
  walk(3280, 2640, 480);
  n.vent(3480, Y - 2640, 140, 60);
  n.pickup(3400, Y - 2670, 'small_ammo');

  // ============ CLUB CALDERA: THE FLOOR ============
  // In off the top of the shaft through a service door, and out onto the floor: the whole club's lava. Wall to wall
  const c = part(CLUB_X0);
  const floorRun = (x1: number, x2: number) => c.runs.push({ x1: CLUB_X0 + x1, y1: Y, x2: CLUB_X0 + x2, y2: Y, surface: 'clubfloor' });
  const solid = (x: number, w: number, h: number, look: Solid['look']) => solids.push({ x: CLUB_X0 + x, y: Y - h, w, h, look });
  const solids: Solid[] = [];
  const party = (...xs: number[]) => { for (const x of xs) c.spawn('partygoer', x); };
  // The service corridor in, then the dance floor: glass over lava, lit from under, the crowd on it, the pyro going off
  // on the beat, the DJ up in his booth (a raver with him), a fire dancer working the far end
  floorRun(0, 1500);
  c.pickup(320, Y - 30, 'small_ammo');
  party(640, 720, 850, 930, 1010, 1270);
  c.vent(780, Y, 120, 0); c.vent(1180, Y, 120, 60);
  c.ledge(1040, Y - 110, 160, 'booth'); c.spawn('raver', 1130, Y - 110);
  c.spawn('firedancer', 1400);
  // The bar, in a moat of lava: a raver up on the counter, the crowd cowering either side of it, security at the end
  c.lava(1500, 1640, Y + 28);
  floorRun(1640, 2300);
  solid(1760, 300, 46, 'bar'); c.spawn('raver', 1910, Y - 46);
  party(1700, 2140);
  c.spawn('blastshield', 2250);
  c.ledge(2110, Y - 130, 70, 'cage'); c.ledge(2210, Y - 200, 70, 'cage');
  c.pickup(2245, Y - 230, 'small_health');
  // The infinity pool (of lava): go-go cages hanging over it to hop across, the lava spouting on the beat
  c.lava(2300, 2920, Y + 28);
  c.ledge(2360, Y - 30, 70, 'cage'); c.ledge(2500, Y - 60, 70, 'cage'); c.ledge(2640, Y - 40, 70, 'cage'); c.ledge(2780, Y - 70, 70, 'cage');
  c.spout(2440, 150, 0); c.spout(2715, 150, 75);
  // Bottle service: the VIP tables, a speaker stack with a raver up on it, security, a fire dancer
  floorRun(2920, 3700);
  c.spawn('firedancer', 3060);
  solid(3140, 90, 90, 'speakers'); c.spawn('raver', 3185, Y - 90);
  party(2990, 3290, 3360);
  solid(3440, 80, 60, 'speakers');
  c.spawn('blastshield', 3590);
  c.pickup(3640, Y - 30, 'large_health');
  // ============ CLUB CALDERA: THE ATRIUM ============
  // The club's own shaft up to the VIP lounge: not rock, all of it built. Neon catwalks back and forth, pyro cannons
  // out of the walls, disco rigs spinning fire, a lava lamp the height of the whole thing
  const AX1 = 3700, AX2 = 4500, ATOP = Y - 2400;
  floorRun(3700, 4500);
  const neon = (x: number, dy: number, w = 160) => c.ledge(x, Y - dy, w, 'neon');
  neon(4200, 110); neon(3940, 220); neon(3720, 330, 180); neon(4000, 440);
  c.jet(AX1, Y - 420, 1, 360, 140, 0);
  neon(4280, 550, 180); neon(4040, 660);
  c.spawn('raver', 4340, Y - 550);
  neon(3760, 770, 180); neon(4060, 880); neon(4300, 990, 160);
  c.jet(AX2, Y - 830, -1, 380, 130, 50);
  c.bar(4000, Y - 1100, 120, 0.035, 0);
  neon(3800, 1110, 150); neon(3720, 1220, 140); neon(3980, 1330); neon(4260, 1440, 200);
  c.spawn('blastshield', 4400, Y - 1440);
  c.vent(4300, Y - 1440, 120, 0);
  c.pickup(3780, Y - 1250, 'small_health');
  c.jet(AX1, Y - 1500, 1, 400, 120, 20);
  neon(4000, 1550); neon(3740, 1660, 160); neon(4000, 1770); neon(4280, 1880, 180);
  c.spawn('raver', 4330, Y - 1880);
  c.bar(4080, Y - 1990, 130, -0.04, 1);
  neon(4040, 2000, 160); neon(3780, 2110, 150); neon(3980, 2220); neon(4260, 2330, 200);
  c.jet(AX2, Y - 2305, -1, 380, 110, 70);
  // The top: along to the lounge's window in the right wall
  neon(3980, 2400, 520);
  c.pickup(4100, Y - 2430, 'small_ammo');

  return {
    main, inside, club: c, solids,
    floor: { x1: CLUB_X0, x2: CLUB_X0 + AX1 },
    atrium: { x1: CLUB_X0 + AX1, x2: CLUB_X0 + AX2, floor: Y, top: ATOP, window: { x: CLUB_X0 + AX2, y: ATOP - 70 } },
    shaft: { x1: IN_X0 + SX1, x2: IN_X0 + SX2, floor: Y, top: TOP, window: { x: IN_X0 + SX2, y: TOP - 70 } },
  };
};

/** A stretch of course in its own coordinates, shifted by x0. */
const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], vents: Vent[] = [], bombs: BombZone[] = [], jets: FlameJet[] = [], bars: FireBar[] = [], rafts: RaftLane[] = [];
  const spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  return {
    runs, ledges, vents, bombs, jets, bars, rafts, spawns, pickups, props,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2 }); },
    /** Lava lying in a hollow: it's ground, but it burns. */
    lava: (x1: number, x2: number, y: number) => { runs.push({ x1: x0 + x1, y1: y, x2: x0 + x2, y2: y, surface: 'lava' }); },
    ledge: (x: number, y: number, w: number, look: Ledge['look'] = 'rock') => { ledges.push({ x: x0 + x, y, w, look }); },
    vent: (x: number, y: number, period: number, phase: number) => { vents.push({ x: x0 + x, y, period, phase }); },
    spout: (x: number, period: number, phase: number) => { vents.push({ x: x0 + x, y: Y + 28, period, phase, lava: true }); },
    bombZone: (x1: number, x2: number, every: number, aimed: boolean) => { bombs.push({ x1: x0 + x1, x2: x0 + x2, every, aimed }); },
    jet: (x: number, y: number, dir: 1 | -1, len: number, period: number, phase: number) => { jets.push({ x: x0 + x, y, dir, len, period, phase }); },
    bar: (x: number, y: number, len: number, speed: number, phase: number) => { bars.push({ x: x0 + x, y, len, speed, phase }); },
    raftLane: (x1: number, x2: number, count: number, w: number, speed: number) => { rafts.push({ x1: x0 + x1, x2: x0 + x2, y: Y + 12, count, w, speed }); },
    spawn: (kind: EnemyKind, x: number, y = Y) => { spawns.push({ kind, x: x0 + x, y }); },
    fish: (x: number, lavaY: number) => { spawns.push({ kind: 'magmafish', x: x0 + x, y: lavaY }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    prop: (look: string, x: number, y: number, extra: Partial<Prop> = {}) => { props.push({ look, x: x0 + x, y, ...extra }); },
  };
};

const buildCourse = (): Course => {
  const { main, inside, club, solids, floor, atrium, shaft } = build();
  const lounge = { x1: LOUNGE_X1, x2: BOSS_DOOR_X, y: Y, window: LOUNGE_X1 + 60 };
  const cat = <K extends keyof typeof main>(k: K) => [...(main[k] as unknown[]), ...(inside[k] as unknown[]), ...(club[k] as unknown[])];
  const runs = [...club.runs, ...inside.runs, ...main.runs, { x1: lounge.x1, y1: Y, x2: lounge.x2, y2: Y, surface: 'carpet' }];
  // (the gaps between the parts aren't pits anyone sees: nothing's drawn in them)
  runs.forEach((r, i) => { const next = runs[i + 1]; if (next && next.x1 > r.x2 + 1) r.pitAfter = 'clouds'; });
  const pickups = [...cat('pickups'), { x: lounge.x2 - 300, y: Y - 30, type: 'large_health' }, { x: lounge.x2 - 220, y: Y - 30, type: 'large_ammo' }] as PickupSpot[];
  return {
    runs,
    ledges: cat('ledges') as Ledge[], vents: cat('vents') as Vent[], bombs: cat('bombs') as BombZone[], jets: cat('jets') as FlameJet[],
    bars: cat('bars') as FireBar[], rafts: cat('rafts') as RaftLane[], spawns: cat('spawns') as Spawn[], pickups, props: cat('props') as Prop[],
    approach: { x1: MAIN_X0, x2: MAIN_X0 + 7100 },
    club: { x1: MAIN_X0 + 7730, x2: MAIN_X0 + 8510, y: Y, door: MAIN_X0 + 8300 },
    inside: { x1: IN_X0 + RIVER_X0, x2: IN_X0 + 3760 },
    shaft,
    floor, atrium, solids,
    lounge,
    checkpoints: [
      { x: MAIN_X0 + 150, y: Y }, { x: MAIN_X0 + 2700, y: Y - 40 }, { x: MAIN_X0 + 7150, y: Y },
      { x: IN_X0 + RIVER_X0 + 150, y: Y }, { x: IN_X0 + RIVER_X0 + 3990, y: Y - 20 }, { x: IN_X0 + 3080, y: Y },
      { x: CLUB_X0 + 150, y: Y }, { x: CLUB_X0 + 3780, y: Y }, { x: lounge.x1 + 300, y: Y },
    ],
    left: CLUB_X0 - 2000,
    startX: MAIN_X0,
  };
};

export const COURSE = buildCourse();

/** Is this run lava? */
export const isLava = (r: GroundRun) => r.surface === 'lava';
