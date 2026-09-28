// Drug Trade Dale's stage, laid out as data. Three acts:
//
//   I.   The desert. Meathead comes down out of the sky on Dale and his crew
//        loading a truck at a dirt turnout in the middle of nowhere; Dale takes
//        one look ("OH NO, THE FEDS!") and floors it. Out across the desert after
//        him (rattlesnakes, scorpions, coyotes, vultures, the cartel, cacti), to
//        the cartel's warehouse: conveyor belts and pallet racks, then the stairs
//        up to the office, where Dale's distributor is waiting, out of his mind on
//        his own product. The first of three hitmen.
//   II.  The highway. Out of the office window onto Dale's convoy, four semis
//        doing eighty down the interstate, each one rigged to blow. Clear the
//        goons off the roof before the timer runs out, then over to the next one.
//        The last one's driver is the second hitman, arguing with Dale over the
//        radio about blowing himself up.
//   III. The old west town. The fourth truck ends up in a gift shop in a tourist
//        trap (Deadwood Gulch, est. 1994). A sniper's got you in his sights all
//        the way up the street (the third hitman, a ninja, up the church tower),
//        and then the second one turns out not to be dead after all. Dale's
//        pharmacy (his door) is at the end of the street.
//
// Each part is built in its own coordinates and shifted into place: the desert
// far to the left, the highway after it, the town right before the boss door.

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

export const CP = { LANDING: 0, DUNES: 1, WAREHOUSE: 2, OFFICE: 3, HIGHWAY: 4, TRUCK2: 5, TRUCK3: 6, TRUCK4: 7, TOWN: 8, ROOFTOPS: 9, JAIL: 10 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** A ledge you can jump up through: a rock shelf out in the desert, a pallet rack in the warehouse, a balcony in town. */
export interface Ledge { x: number; y: number; w: number; look: 'rock' | 'rack' | 'balcony' | 'tower' }
/** A saguaro (or a clump of prickly pear): touch it and it hurts. `h` is how tall. */
export interface Cactus { x: number; y: number; h: number; look: 'saguaro' | 'pear' }
/** A conveyor belt in the warehouse: its top is at y, it runs at `speed` (negative: toward the way you came), crates riding it. */
export interface Belt { x: number; w: number; y: number; speed: number; crateEvery: number }
/** A building's porch roof on a street in town: jump up onto it and it throws you up onto the roof; under it, the sniper can't see you. */
export interface Awning { x: number; w: number; y: number }
/** A building in town: its false front (and roof you can walk on) from x1 to x2, and how tall. */
export interface Building { x1: number; x2: number; top: number; name: string; look: 'saloon' | 'store' | 'barber' | 'bank' | 'hotel' | 'livery' | 'assay' | 'church' }
export interface Prop { look: string; x: number; y: number }
/** One semi in the convoy: the trailer's rear (its roof's left end), all in world x. */
export interface Truck { x: number }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  cacti: Cactus[];
  belts: Belt[];
  awnings: Awning[];
  buildings: Building[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  props: Prop[];
  /** Where Dale's truck is parked when you land (the back of it), and the goons loading it. */
  landing: { truckX: number; daleX: number };
  desert: { x1: number; x2: number };
  /** The warehouse (inside from x1 to x2, its ceiling), the stairs up, the office at the top (walls, floor, and its things). */
  warehouse: { x1: number; x2: number; ceiling: number; stairs: number };
  office: { x1: number; x2: number; floor: number; ceiling: number; desk: number; cabinet: number; fan: number; closet: number; window: number };
  highway: { x1: number; x2: number; trucks: Truck[] };
  town: { x1: number; x2: number; crash: number; arch: number; tower: { x: number; top: number }; jail: { x1: number; x2: number }; pharmacy: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const DESERT_X0 = -100000;
const HIGHWAY_X0 = -60000;
const TOWN_X0 = BOSS_DOOR_X - 6300;

const Y = GROUND_Y;

/** The convoy's trucks, trailer end to cab front, and the lanes they sit in. */
export const TRAILER_W = 520, CAB_W = 170, TRUCK_W = TRAILER_W + 10 + CAB_W, TRUCK_GAP = 150;
/** Heights: the trailer's roof, the sleeper cab's roof, the hood. */
export const TRAILER_TOP = Y - 170, CAB_TOP = Y - 150, HOOD_TOP = Y - 96;
/** Where the sleeper cab ends and the hood starts (from the cab's back). */
export const SLEEPER_W = 92;

const build = () => {
  const d = part(DESERT_X0), h = part(HIGHWAY_X0), t = part(TOWN_X0);

  // ============ THE LANDING ============
  // A dirt turnout: Dale's box truck backed up to a pile of crates, the goons loading it
  d.ground(0, 1050);
  d.spawn('sicario', 740); d.spawn('enforcer', 900);
  // The first cactus: on flat ground, nothing else going on (see what it does)
  d.cactus(1200, Y, 92, 'saguaro');
  d.ground(1050, 1500);
  d.spawn('rattlesnake', 1400);

  // ============ THE DESERT ============
  // Up onto a mesa
  d.ground(1500, 1700, Y, Y - 100);
  d.ground(1700, 2450, Y - 100);
  d.ledge(1840, Y - 240, 140, 'rock');
  d.pickup(1905, Y - 270, 'small_ammo');
  d.cactus(2090, Y - 100, 64, 'pear');
  d.spawn('sicario', 2320, Y - 100);
  d.spawn('vulture', 2150, Y - 420);
  // An arroyo: over it
  d.ground(2600, 3250, Y - 40);
  d.spawn('scorpion', 2760, Y - 40);
  d.cactus(2960, Y - 40, 80, 'saguaro');
  d.spawn('coyote', 3130, Y - 40);
  // Hoodoos standing up out of a wide arroyo: from one to the next
  d.ground(3400, 3500, Y - 70);
  d.ground(3620, 3710, Y - 140);
  d.ground(3830, 3910, Y - 80);
  d.spawn('vulture', 3660, Y - 460);
  d.ground(4010, 4720, Y - 20);
  d.cactus(4130, Y - 20, 84, 'saguaro');
  d.pickup(4250, Y - 50, 'small_health');
  d.spawn('cardoor', 4360, Y - 20);
  // A patch of prickly pear too wide to jump: a shelf of rock over it
  d.cactus(4500, Y - 20, 40, 'pear'); d.cactus(4545, Y - 20, 46, 'pear'); d.cactus(4590, Y - 20, 38, 'pear');
  d.ledge(4440, Y - 170, 210, 'rock');
  d.ground(4720, 5020, Y - 20, Y);
  d.ground(5020, 5260);
  // Another arroyo, with a rock in the middle of it and a cactus on the rock: land short of it, hop it
  d.ground(5380, 5580, Y - 30);
  d.cactus(5552, Y - 30, 70, 'saguaro');
  d.ground(5670, 6480);
  d.spawn('enforcer', 5960);
  d.spawn('rattlesnake', 6080);
  d.spawn('vulture', 6050, Y - 400);
  d.spawn('sicario', 6360);
  d.pickup(5800, Y - 30, 'small_ammo');

  // ============ THE WAREHOUSE ============
  // In through the loading dock, a conveyor belt feeding crates at you, pallet racks up to the high shelf, another belt, the stairs
  d.ground(6480, 8060, Y, Y, 'concrete');
  d.belt(6760, 420, Y - 50, -2.4, 150);
  d.spawn('cardoor', 6640);
  d.ledge(7300, Y - 90, 110, 'rack'); d.ledge(7440, Y - 180, 120, 'rack'); d.ledge(7600, Y - 270, 200, 'rack');
  d.spawn('sicario', 7700, Y - 270);
  d.spawn('enforcer', 7520);
  d.belt(7850, 190, Y - 50, -2.8, 110);
  d.pickup(7990, Y - 30, 'large_health'); d.pickup(8030, Y - 30, 'large_ammo');
  // Up the stairs to the office
  d.ground(8060, 8360, Y, Y - 240, 'stairs');
  d.ground(8360, 9120, Y - 240, Y - 240, 'office');

  // ============ THE HIGHWAY ============
  // (nothing here but the trucks: the stage lays them out)

  // ============ THE TOWN ============
  // The gift shop the fourth truck ended up in, the arch, and up the street
  t.ground(0, 6300, Y, Y, 'street');
  // The buildings, their porch roofs (bounce up onto the rooftops off these) and their rooftops
  t.building(760, 1120, Y - 290, 'SALOON', 'saloon');
  t.building(1280, 1580, Y - 250, 'GENERAL STORE', 'store');
  t.building(1740, 1930, Y - 220, 'BARBER', 'barber');
  t.building(2090, 2440, Y - 280, 'BANK', 'bank');
  t.building(2640, 3080, Y - 340, 'GRAND HOTEL', 'hotel');
  t.building(3240, 3520, Y - 250, 'LIVERY', 'livery');
  t.building(3680, 3960, Y - 290, 'ASSAY OFFICE', 'assay');
  t.building(4140, 4460, Y - 300, 'CHAPEL', 'church');
  t.awning(760, 360); t.awning(1280, 300); t.awning(1740, 190); t.awning(2090, 350); t.awning(2640, 440); t.awning(3240, 280); t.awning(3680, 280); t.awning(4140, 320);
  // The hotel's balcony, the chapel's bell tower (the sniper's up there)
  t.ledge(2700, Y - 200, 320, 'balcony');
  t.ledge(4240, Y - 390, 120, 'tower');
  t.spawn('sicario', 1000); t.spawn('visitor', 1200, Y, 0); t.spawn('visitor', 1640, Y, 1);
  t.spawn('enforcer', 1880); t.spawn('sicario', 2300, Y - 280); t.spawn('visitor', 2520, Y, 4);
  t.spawn('cardoor', 2860); t.spawn('sicario', 2900, Y - 200); t.spawn('visitor', 3150, Y, 3);
  t.spawn('coyote', 3400); t.spawn('sicario', 3860, Y - 290); t.spawn('enforcer', 4020); t.spawn('visitor', 3580, Y, 2);
  t.pickup(1680, Y - 30, 'small_ammo'); t.pickup(2560, Y - 30, 'small_health'); t.pickup(3600, Y - 30, 'small_ammo');
  t.pickup(3000, Y - 370, 'small_health');
  t.pickup(6060, Y - 30, 'large_health'); t.pickup(6140, Y - 30, 'large_ammo');

  const trucks: Truck[] = [0, 1, 2, 3].map(i => ({ x: HIGHWAY_X0 + i * (TRUCK_W + TRUCK_GAP) }));
  return { d, h, t, trucks };
};

/** A stretch of course in its own coordinates, shifted by x0. */
const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], cacti: Cactus[] = [], belts: Belt[] = [], awnings: Awning[] = [], buildings: Building[] = [];
  const spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  return {
    runs, ledges, cacti, belts, awnings, buildings, spawns, pickups, props,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1, surface?: string) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2, surface }); },
    ledge: (x: number, y: number, w: number, look: Ledge['look']) => { ledges.push({ x: x0 + x, y, w, look }); },
    cactus: (x: number, y: number, h: number, look: Cactus['look']) => { cacti.push({ x: x0 + x, y, h, look }); },
    belt: (x: number, w: number, y: number, speed: number, crateEvery: number) => { belts.push({ x: x0 + x, w, y, speed, crateEvery }); },
    awning: (x: number, w: number) => { awnings.push({ x: x0 + x, w, y: Y - 118 }); },
    building: (x1: number, x2: number, top: number, name: string, look: Building['look']) => { buildings.push({ x1: x0 + x1, x2: x0 + x2, top, name, look }); },
    spawn: (kind: EnemyKind, x: number, y = Y, variant?: number) => { spawns.push({ kind, x: x0 + x, y, variant }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    prop: (look: string, x: number, y: number) => { props.push({ look, x: x0 + x, y }); },
  };
};

const buildCourse = (): Course => {
  const { d, t, trucks } = build();
  const runs = [...d.runs, ...t.runs];
  runs.sort((a, b) => a.x1 - b.x1);
  // (every gap's drawn by the stage: the arroyos, and the gaps between the parts)
  runs.forEach((r, i) => { const next = runs[i + 1]; if (next && next.x1 > r.x2 + 1) r.pitAfter = 'clouds'; });
  const office = { x1: DESERT_X0 + 8360, x2: DESERT_X0 + 9120, floor: Y - 240, ceiling: Y - 560, desk: DESERT_X0 + 8500, cabinet: DESERT_X0 + 8640, fan: DESERT_X0 + 8790, closet: DESERT_X0 + 8990, window: DESERT_X0 + 9120 };
  return {
    runs,
    ledges: [...d.ledges, ...t.ledges],
    cacti: d.cacti,
    belts: d.belts,
    awnings: t.awnings,
    buildings: t.buildings,
    spawns: [...d.spawns, ...t.spawns],
    pickups: [...d.pickups, ...t.pickups],
    props: [...d.props, ...t.props],
    landing: { truckX: DESERT_X0 + 560, daleX: DESERT_X0 + 520 },
    desert: { x1: DESERT_X0, x2: DESERT_X0 + 6480 },
    warehouse: { x1: DESERT_X0 + 6480, x2: DESERT_X0 + 8360, ceiling: Y - 470, stairs: DESERT_X0 + 8060 },
    office,
    highway: { x1: HIGHWAY_X0 - 400, x2: trucks[3].x + TRUCK_W + 400, trucks },
    town: {
      x1: TOWN_X0, x2: BOSS_DOOR_X, crash: TOWN_X0 + 140, arch: TOWN_X0 + 600,
      tower: { x: TOWN_X0 + 4300, top: Y - 390 }, jail: { x1: TOWN_X0 + 5300, x2: TOWN_X0 + 5640 }, pharmacy: TOWN_X0 + 5860,
    },
    checkpoints: [
      { x: DESERT_X0 + 150, y: Y }, { x: DESERT_X0 + 5100, y: Y }, { x: DESERT_X0 + 6540, y: Y }, { x: DESERT_X0 + 7960, y: Y },
      // (on each truck, at the back of its trailer)
      ...trucks.map(tr => ({ x: tr.x + 160, y: TRAILER_TOP })),
      { x: TOWN_X0 + 380, y: Y }, { x: TOWN_X0 + 2600, y: Y }, { x: TOWN_X0 + 4560, y: Y },
    ],
    left: DESERT_X0 - 2000,
    startX: DESERT_X0,
  };
};

export const COURSE = buildCourse();
