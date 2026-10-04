// Hector Hurricane's stage, laid out as data: Miami Beach (sunny, then the storm
// hits), the strip of tacky motels, the marina, a stolen boat, the climb up the
// inside of the hurricane, the Eye, and the daycare the flood lands on.
//
// Four places in the world:
//   - the main run (beach, motels, marina, open water), left of the daycare
//   - the storm tower, far off to the left, wrapped round a cylinder
//   - the Eye's arena, at the top of the storm (its own spot, also far left)
//   - the daycare, right before the boss door
// Each is built in its own coordinates and shifted into place.

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import { profileYAt, type GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

export const CP = { BEACH: 0, STORM: 1, MOTEL: 2, MARINA: 3, CHASE: 4, TOWER: 5, EYE: 6, DOOR: 7 } as const;

export type Surface = 'sand' | 'road' | 'dock' | 'grass' | 'pool';

/** A standable thing that isn't the ground: its look, and whether it's a bouncy awning. */
export interface Plat { x: number; y: number; w: number; look: 'lifeguard' | 'pier' | 'balcony' | 'car' | 'dock' | 'boat' | 'palm' | 'awning' | 'umbrella' | 'tiki'; color?: string }

/** Awnings and beach umbrellas bounce you. */
export const isBouncy = (p: Plat) => p.look === 'awning' || p.look === 'umbrella';
/** A floating dock bobbing on the swell. */
export interface FloatDock { x: number; y: number; w: number; amp: number; period: number; phase: number }
/** Flooded ground a downed power line keeps electrifying (on, then off). */
export interface ShockZone { x1: number; x2: number; y: number; on: number; off: number; phase: number }
/** Lightning keeps striking the ground in here once the storm's up. */
export interface StrikeZone { x1: number; x2: number; every: number; aimed: boolean }
/** Junk blown in from the right across here (beach chairs, umbrellas, trash cans), at these heights above the ground. */
export interface DebrisLane { x1: number; x2: number; every: number; heights: number[] }
export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Scenery (drawn by the stage): beach umbrellas, the volleyball net, motels and their signs, boats, palms. */
export interface Prop { look: string; x: number; y: number; w?: number; h?: number; text?: string; color?: string }

export interface Course {
  runs: GroundRun[];
  plats: Plat[];
  floats: FloatDock[];
  shocks: ShockZone[];
  strikes: StrikeZone[];
  debris: DebrisLane[];
  spawns: Spawn[];
  civilians: Spawn[];
  pickups: PickupSpot[];
  props: Prop[];
  /** Past here the storm rolls in (as long as the cops aren't on you). */
  stormAt: number;
  /** Doors the beachgoers run for when the storm hits. */
  shelters: number[];
  /** The old boy fishing at the end of the marina, and his boat. */
  fisherman: { x: number; y: number };
  boat: { x: number; y: number };
  /** The open water the boat runs out across, and where the waterspout takes it. */
  sea: { x1: number; x2: number; y: number; spoutX: number };
  tower: Tower;
  eye: { x: number; y: number };
  daycare: { x1: number; x2: number; y: number; building: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

/** The storm climb: platforms around a cylinder (u runs round it, 0..circumference), going up. */
export interface Tower {
  x0: number;
  radius: number;
  circumference: number;
  floorY: number;
  topY: number;
  plats: { u: number; y: number; w: number; look: string; orbit?: number; bounce?: boolean }[];
  sharks: { u: number; y: number }[];
  pickups: { u: number; y: number; type: PickupSpot['type'] }[];
}

/** Props that stand on the ground (put down on it wherever they're placed, slopes and all). */
const STANDS = new Set(['umbrella', 'net', 'palm', 'tiki', 'sign', 'powerline']);

// Where each part sits in the world
const MAIN_LEN = 28100;
const MAIN_X0 = BOSS_DOOR_X - 1500 - 300 - MAIN_LEN;  // the main run ends at the daycare wall (open water up to it)
const TOWER_X0 = -60000;
const EYE_X0 = -48000, EYE_Y0 = -2600;

// ---------------------------------------------------------------------------
// The main run, in its own coordinates (x from 0), shifted to MAIN_X0 at the end
// ---------------------------------------------------------------------------

const buildMain = () => {
  const runs: GroundRun[] = [];
  const plats: Plat[] = [], floats: FloatDock[] = [], shocks: ShockZone[] = [], strikes: StrikeZone[] = [], debris: DebrisLane[] = [];
  const spawns: Spawn[] = [], civilians: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  const Y = GROUND_Y;
  /** Ground from x1 to x2 (rising or falling to y2), of a surface, with water after it if it's the last before a gap. */
  const ground = (x1: number, x2: number, surface: Surface, y1 = Y, y2 = y1, waterAfter = false) => {
    runs.push({ x1, y1, x2, y2, surface, ...(waterAfter ? { pitAfter: 'water' as const } : {}) });
  };
  const spawn = (kind: EnemyKind, x: number, y = Y, variant?: number) => spawns.push({ kind, x, y, variant });
  const civ = (variant: number, x: number) => civilians.push({ kind: 'civilian', x, y: Y, variant });

  // ============ MIAMI BEACH, SUNNY ============
  // Sand, a gentle dune, sunbathers, a volleyball game, a lifeguard tower, the tiki bar
  // (the dune's flat along the top, where the umbrella's up and the towels are down: they lie flat)
  ground(0, 1150, 'sand');
  ground(1150, 1300, 'sand', Y, Y - 30);
  ground(1300, 1500, 'sand', Y - 30);
  ground(1500, 1650, 'sand', Y - 30, Y);
  ground(1650, 2700, 'sand');
  props.push({ look: 'umbrella', x: 330, y: Y, color: '#F43F5E' }, { look: 'umbrella', x: 720, y: Y, color: '#FACC15' },
    { look: 'net', x: 910, y: Y }, { look: 'umbrella', x: 1400, y: Y, color: '#22D3EE' }, { look: 'umbrella', x: 2170, y: Y, color: '#A3E635' },
    { look: 'tiki', x: 2450, y: Y, text: 'TIKI BAR' }, { look: 'palm', x: 120, y: Y }, { look: 'palm', x: 1080, y: Y }, { look: 'palm', x: 2350, y: Y });
  plats.push({ x: 1700, y: Y - 118, w: 96, look: 'lifeguard' });
  civ(0, 300); civ(0, 380); civ(1, 560); civ(0, 690); civ(2, 860); civ(2, 960); civ(3, 1180);
  civ(0, 1380); civ(0, 1450); civ(1, 1650); civ(4, 1900); civ(0, 2150); civ(0, 2230);
  // (at the tiki bar, and only once there are no cops after you: see beach.ts)
  const stormAt = 2450;
  const shelters = [2450, 60];

  // ============ THE STORM HITS: THE BEACH, THEN THE PIER ============
  // Lightning taught out on the open sand (it lands well ahead of you), then aimed at you
  strikes.push({ x1: 2850, x2: 3150, every: 150, aimed: false }, { x1: 3150, x2: 6200, every: 190, aimed: true });
  // Junk blowing in: beach chairs low (jump), umbrellas high (duck)
  debris.push({ x1: 3350, x2: 3900, every: 110, heights: [10] }, { x1: 3900, x2: 4250, every: 120, heights: [58] });
  spawn('tourist', 3150);
  spawn('crab', 3450); spawn('crab', 3800);
  // A gator on the sand where it meets the water
  spawn('gator', 4000);
  pickups.push({ x: 3700, y: Y - 30, type: 'small_health' });
  ground(2700, 4250, 'sand', Y, Y, true);
  // The old pier, planks missing, out over the surf (the sea gets you if you fall)
  plats.push({ x: 4250, y: Y - 70, w: 330, look: 'pier' }, { x: 4700, y: Y - 70, w: 250, look: 'pier' }, { x: 5090, y: Y - 70, w: 320, look: 'pier' });
  spawn('pelican', 4820, Y - 330);
  pickups.push({ x: 5200, y: Y - 100, type: 'small_ammo' });
  ground(5410, 6200, 'sand');
  props.push({ look: 'palm', x: 5550, y: Y }, { look: 'palm', x: 5820, y: Y });
  // Iguanas clinging to the tops of the palms, whipping about in the wind (it rips them loose at you)
  spawn('iguana', 5550, Y - 150); spawn('iguana', 5820, Y - 150);
  spawn('bouncer', 5960);
  spawn('surfer', 6120);

  // ============ THE STRIP: TACKY MOTELS ============
  ground(6200, 7760, 'road');
  // (the Pink Flamingo's pool, sunk into the lot; the road carries on past it)
  ground(7760, 8060, 'pool' as Surface, Y + 70);
  ground(8060, 10000, 'road');
  // The Sea Breeze: an awning to bounce up onto the balcony (taught with nothing below it but road)
  props.push({ look: 'motel', x: 6250, y: Y, w: 560, h: 250, text: 'SEA BREEZE', color: '#5EEAD4' });
  plats.push({ x: 6270, y: Y - 92, w: 90, look: 'awning', color: '#F472B6' }, { x: 6380, y: Y - 130, w: 420, look: 'balcony' });
  spawn('tourist', 6650, Y - 130);
  pickups.push({ x: 6750, y: Y - 160, type: 'large_ammo' });
  // The flooded lot: a downed power line keeps electrifying the water; car roofs are the dry way across
  shocks.push({ x1: 6880, x2: 7380, y: Y, on: 100, off: 110, phase: 0 });
  props.push({ look: 'powerline', x: 6900, y: Y });
  plats.push({ x: 6960, y: Y - 44, w: 110, look: 'car', color: '#DC2626' }, { x: 7160, y: Y - 44, w: 110, look: 'car', color: '#2563EB' });
  spawn('crab', 7020, Y - 44);
  spawn('bouncer', 7520);
  // The Pink Flamingo: a pool with a gator in it, balconies over it (another awning up)
  props.push({ look: 'motel', x: 7600, y: Y, w: 720, h: 300, text: 'PINK FLAMINGO', color: '#F472B6' });
  props.push({ look: 'pool', x: 7760, y: Y, w: 300 });
  spawn('gator', 7910, Y + 10, 1);
  plats.push({ x: 7620, y: Y - 95, w: 90, look: 'awning', color: '#22D3EE' }, { x: 7740, y: Y - 150, w: 340, look: 'balcony' }, { x: 8120, y: Y - 230, w: 180, look: 'balcony' });
  spawn('pelican', 7950, Y - 360);
  spawn('tourist', 8220, Y - 230);
  props.push({ look: 'palm', x: 8420, y: Y });
  spawn('iguana', 8420, Y - 150);
  // Neon row: awnings chained over a longer stretch of live water
  shocks.push({ x1: 8560, x2: 9260, y: Y, on: 120, off: 80, phase: 60 });
  props.push({ look: 'powerline', x: 8580, y: Y }, { look: 'sign', x: 8700, y: Y, text: 'VACANCY', color: '#F43F5E' }, { look: 'sign', x: 9080, y: Y, text: 'COLOR TV', color: '#FACC15' });
  plats.push({ x: 8560, y: Y - 92, w: 90, look: 'awning', color: '#FACC15' }, { x: 8760, y: Y - 110, w: 90, look: 'awning', color: '#A3E635' },
    { x: 8960, y: Y - 100, w: 90, look: 'awning', color: '#F472B6' }, { x: 9160, y: Y - 92, w: 90, look: 'awning', color: '#22D3EE' });
  debris.push({ x1: 8500, x2: 9300, every: 170, heights: [120, 170] });
  spawn('surfer', 9420);
  spawn('tourist', 9700); spawn('bouncer', 9880);
  pickups.push({ x: 9500, y: Y - 30, type: 'small_health' });
  props.push({ look: 'sign', x: 9960, y: Y, text: 'MARINA', color: '#38BDF8' });

  // ============ THE MARINA ============
  // Boardwalk, then docks over the water: floating ones bob on the swell; gators wait in between
  ground(10000, 10400, 'dock', Y - 20, Y - 20, true);
  floats.push({ x: 10470, y: Y - 20, w: 150, amp: 14, period: 150, phase: 0 });
  ground(10700, 11100, 'dock', Y - 20, Y - 20, true);
  spawn('crab', 10850, Y - 20); spawn('tourist', 11020, Y - 20);
  floats.push({ x: 11180, y: Y - 20, w: 120, amp: 20, period: 130, phase: 0 }, { x: 11400, y: Y - 20, w: 120, amp: 20, period: 130, phase: 65 });
  spawn('gator', 11350, Y + 10, 1);
  ground(11600, 11950, 'dock', Y - 20, Y - 20, true);
  props.push({ look: 'yacht', x: 11640, y: Y - 20, w: 280 });
  plats.push({ x: 11660, y: Y - 110, w: 240, look: 'boat' });
  spawn('riotcop', 11900, Y - 20);
  spawn('pelican', 11800, Y - 380);
  floats.push({ x: 12030, y: Y - 20, w: 100, amp: 24, period: 120, phase: 20 }, { x: 12220, y: Y - 20, w: 100, amp: 24, period: 120, phase: 80 }, { x: 12410, y: Y - 20, w: 120, amp: 26, period: 110, phase: 40 });
  spawn('gator', 12160, Y + 10, 1); spawn('gator', 12360, Y + 10, 1);
  strikes.push({ x1: 11950, x2: 12550, every: 170, aimed: true });
  ground(12560, 13200, 'dock', Y - 20, Y - 20, true);
  pickups.push({ x: 12650, y: Y - 50, type: 'large_health' });
  spawn('surfer', 12800, Y - 20);
  const fisherman = { x: 13080, y: Y - 20 };
  const boat = { x: 13230, y: Y + 4 };
  // (a long way out: the Coast Guard's after him the whole way)
  const sea = { x1: 13200, x2: MAIN_LEN + 300, y: Y + 10, spoutX: 27400 };

  // Whatever stands on the ground stands on it, at the height it is where it's stood (up on the dune and all)
  for (const p of props) if (STANDS.has(p.look)) p.y = profileYAt(runs, p.x) ?? p.y;
  // Every beach umbrella's canopy is a trampoline
  for (const p of props) if (p.look === 'umbrella') plats.push({ x: p.x - 45, y: p.y - 108, w: 90, look: 'umbrella' });
  return { runs, plats, floats, shocks, strikes, debris, spawns, civilians, pickups, props, stormAt, shelters, fisherman, boat, sea };
};

// ---------------------------------------------------------------------------
// The storm tower: a spiral of junk up the inside of the hurricane
// ---------------------------------------------------------------------------

const buildTower = (): Tower => {
  const radius = 360;
  const circumference = Math.round(Math.PI * 2 * radius);
  const floorY = GROUND_Y;
  const plats: Tower['plats'] = [];
  const LOOKS = ['plank', 'door', 'carroof', 'shed', 'billboard', 'sofa', 'fridge', 'hull'];
  // Round and up: each a jump from the last (up to ~95px higher, a gap of 40 to ~75px)
  let u = 260, y = floorY - 80;
  for (let i = 0; i < 34; i++) {
    // (the last: the lift, the updraft that carries you up into the Eye: wide, still, and plain to see)
    const last = i === 33;
    const w = last ? 170 : 90 + ((i * 37) % 60);
    // Every so often a trampoline (big bounce). (Nothing orbits: drifting junk wandered off round the lap and sat
    // about to the left of the climb, going nowhere; it's right and up, and that's all)
    const bounce = !last && i % 9 === 5;
    const orbit = undefined;
    plats.push({ u, y, w, look: last ? 'lift' : bounce ? 'trampoline' : LOOKS[i % LOOKS.length], bounce, orbit });
    u = (u + w + 40 + ((i * 53) % 36)) % circumference;
    y -= bounce ? 160 : 72 + ((i * 29) % 22);
  }
  const topY = y;
  const sharks = [{ u: 700, y: floorY - 760 }, { u: 1700, y: floorY - 1100 }, { u: 300, y: floorY - 1650 }, { u: 1200, y: floorY - 2150 }];
  const pickups = [{ u: plats[8].u + 30, y: plats[8].y - 30, type: 'small_health' as const }, { u: plats[17].u + 30, y: plats[17].y - 30, type: 'large_ammo' as const },
    { u: plats[26].u + 30, y: plats[26].y - 30, type: 'large_health' as const }];
  return { x0: TOWER_X0, radius, circumference, floorY, topY, plats, sharks, pickups };
};

// ---------------------------------------------------------------------------

export const buildCourse = (): Course => {
  const m = buildMain();
  const sx = (v: number) => v + MAIN_X0;
  const tower = buildTower();
  const daycare = { x1: BOSS_DOOR_X - 1500, x2: BOSS_DOOR_X, y: GROUND_Y, building: BOSS_DOOR_X - 1040 };
  return {
    runs: [
      ...m.runs.map(r => ({ ...r, x1: sx(r.x1), x2: sx(r.x2) })),
      // The daycare's lawn and sidewalk
      { x1: daycare.x1, y1: GROUND_Y, x2: daycare.x2, y2: GROUND_Y, surface: 'grass' },
    ],
    plats: m.plats.map(p => ({ ...p, x: sx(p.x) })),
    floats: m.floats.map(f => ({ ...f, x: sx(f.x) })),
    shocks: m.shocks.map(z => ({ ...z, x1: sx(z.x1), x2: sx(z.x2) })),
    strikes: m.strikes.map(z => ({ ...z, x1: sx(z.x1), x2: sx(z.x2) })),
    debris: m.debris.map(z => ({ ...z, x1: sx(z.x1), x2: sx(z.x2) })),
    spawns: m.spawns.map(s => ({ ...s, x: sx(s.x) })),
    civilians: m.civilians.map(s => ({ ...s, x: sx(s.x) })),
    pickups: m.pickups.map(p => ({ ...p, x: sx(p.x) })),
    props: m.props.map(p => ({ ...p, x: sx(p.x) })),
    stormAt: sx(m.stormAt),
    shelters: m.shelters.map(sx),
    fisherman: { x: sx(m.fisherman.x), y: m.fisherman.y },
    boat: { x: sx(m.boat.x), y: m.boat.y },
    sea: { x1: sx(m.sea.x1), x2: sx(m.sea.x2), y: m.sea.y, spoutX: sx(m.sea.spoutX) },
    tower,
    eye: { x: EYE_X0, y: EYE_Y0 },
    daycare,
    checkpoints: [
      { x: sx(150), y: GROUND_Y }, { x: sx(2750), y: GROUND_Y }, { x: sx(6230), y: GROUND_Y }, { x: sx(10050), y: GROUND_Y - 20 },
      // (out on the water: in the boat as it sets off with the Coast Guard after it)
      { x: sx(m.boat.x + 40), y: m.boat.y - 18 },
      { x: TOWER_X0 + 120, y: tower.floorY }, { x: EYE_X0 + 80, y: EYE_Y0 + 480 }, { x: BOSS_DOOR_X - 650, y: GROUND_Y },
    ],
    left: TOWER_X0 - 3000,
    startX: sx(0),
  };
};

export const COURSE = buildCourse();

/** Where the top of a palm is (it bends over in the storm and whips about): offset from its base. */
export const palmTip = (x: number, frame: number, storm: number) => {
  const lean = -0.1 - storm * (0.55 + Math.sin(frame * 0.1 + x) * 0.2);
  return { x: Math.sin(lean) * 150, y: -Math.cos(lean) * 150, lean };
};
