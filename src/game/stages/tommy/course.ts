// Toxic Tommy's stage, laid out as data. Flint, Michigan.
//
//   I.   The hood, late afternoon, the water tower up on its legs over the
//        rooftops. A little way up the street, a few of the local crew are
//        hanging out on the corner, one of them sat on his bike. Not for long.
//   II.  The bike run: down the long, flat road across town, the crew after
//        you in their lowriders,
//        pit bulls off their chains, and the street full of junk. At the end of
//        it, a man in a hazmat suit and a bottle of the town's water.
//   III. The sewer: walkways over channels of the muck (it eats you, slowly),
//        Tommy's crew, the things that live down here. A hazmat suit in a
//        locker, and the tunnel past it flooded to the roof: swim it before the
//        suit's eaten through. Another locker, and a flooded pit past it, deep:
//        down it past the baffles, under the wall at the bottom and back up the
//        far side. Then the cistern, and what's in it.
//   IV.  Blown up out of the sewer (onto the water tower, and the tower onto a
//        house), what's left of the house, and the pit past it, all the way
//        down to Tommy's door.
//
// Each part is built in its own coordinates and shifted into place.

import type { EnemyKind } from '../../../types';
import type { GroundRun } from '../../core/terrain';
import { GROUND_Y, BOSS_DOOR_X } from '../../../constants';

export const CP = { HOOD: 0, ROAD: 1, ROAD_MID: 2, SEWER: 3, SUIT: 4, SUIT2: 5, CISTERN: 6, RUINS: 7 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something you jump up through and stand on: a porch, a grate over the muck, a pipe run. */
export interface Ledge { x: number; y: number; w: number; look: 'porch' | 'grate' | 'pipe' }
export interface Prop { look: string; x: number; y: number; w?: number; text?: string }
/** Junk in the road on the bike run (world x): what it is, and how you get past it. */
export interface RoadJunk { x: number; look: 'cones' | 'trash' | 'pothole' | 'glass' | 'car' | 'hydrant' | 'ramp' | 'barrier' }
/** Something coming after you on the bike run, once you're this far down the road (world x). */
export interface RoadWave { at: number; kind: EnemyKind; from: 'behind' | 'ahead'; variant?: number }
/** A pipe dripping the muck (onto the walkway, or a grate): it builds, drips, and a drip hurts. */
export interface Drip { x: number; y: number; period: number; phase: number }
/** A channel of the muck: its surface, and the floor under it. */
export interface Channel { x1: number; x2: number; surface: number; floor: number }
/** Something in the flooded tunnel to get round: a pipe down from the roof (under it), a grate up off the floor (over it). */
export interface TunnelBar { x: number; w: number; y1: number; y2: number }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  props: Prop[];
  junk: RoadJunk[];
  waves: RoadWave[];
  drips: Drip[];
  channels: Channel[];
  bars: TunnelBar[];
  /** The corner: the crew, the bike (and where he's stopped to watch). */
  hood: { x1: number; x2: number; corner: number; bike: number; stop: number };
  /** The road: where the ride starts and where it ends (the hazmat man and the open manhole). */
  road: { x1: number; x2: number; hazmat: number; manhole: number };
  /**
   * The sewer: where you drop in, the suit lockers (one before each flooded stretch), the flooded tunnel, the flooded
   * pit, the cistern (and the pool the thing's in).
   */
  sewer: {
    x1: number; x2: number; drop: number; lockers: number[];
    tunnel: { x1: number; x2: number; roof: number; surface: number; floor: number; roof1: number; roof2: number };
    pit: { x1: number; x2: number; floor: number; roof1: number; roof2: number };
    cistern: { x1: number; x2: number; pool: number; rack: number };
  };
  /** What's left of the house (up high), and the pit down to Tommy's door. */
  /** What's left of the house (up high), and the hole down past it (narrow: a manhole's worth) to Tommy's door. */
  ruins: { x1: number; x2: number; y: number; house: number; pit: number; pitW: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const Y = GROUND_Y;
const HOOD_X0 = -120000;
const ROAD_START = 1400;
/** How long the road is, and how far past it the hazmat man's waiting. */
export const ROAD_LEN = 26000;
const SEWER_X0 = -80000;
const RUINS_X0 = BOSS_DOOR_X - 3000;
/** The hole down (local to the ruins), and how wide it is. */
const PIT = 2560, PIT_W = 110;
/** How high up the ruins are over the ground at Tommy's door. */
export const RUINS_Y = Y - 2200;
/** How high the cavern outside Tommy's door is, floor to ceiling. */
export const CAVERN_ROOF = 330;

/** The sewer's levels: the walkways, the muck's surface in a channel, the channel's floor. */
export const WALK_Y = Y, MUCK_Y = Y + 40, CHANNEL_FLOOR = Y + 170;
/** The flooded pit: how deep it goes. */
export const PIT_FLOOR = Y + 1010;
/** The flooded tunnel: its roof (so low there's no standing up in it), the muck (right up near it), its floor. */
export const TUNNEL_ROOF = Y - 70, TUNNEL_SURFACE = Y + 10, TUNNEL_FLOOR = Y + 200;


const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  const drips: Drip[] = [], channels: Channel[] = [], bars: TunnelBar[] = [];
  return {
    runs, ledges, spawns, pickups, props, drips, channels, bars,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1, surface?: string) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2, surface }); },
    ledge: (x: number, y: number, w: number, look: Ledge['look']) => { ledges.push({ x: x0 + x, y, w, look }); },
    spawn: (kind: EnemyKind, x: number, y = Y, variant?: number) => { spawns.push({ kind, x: x0 + x, y, variant }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
    prop: (look: string, x: number, y = Y, w?: number, text?: string) => { props.push({ look, x: x0 + x, y, w, text }); },
    drip: (x: number, y: number, period: number, phase: number) => { drips.push({ x: x0 + x, y, period, phase }); },
    /** A channel of the muck from x1 to x2 (its floor's a ground run of its own, down under the surface). */
    channel: (x1: number, x2: number, surface = MUCK_Y, floor = CHANNEL_FLOOR) => {
      channels.push({ x1: x0 + x1, x2: x0 + x2, surface, floor });
      runs.push({ x1: x0 + x1, y1: floor, x2: x0 + x2, y2: floor, surface: 'muck' });
    },
    bar: (x: number, w: number, y1: number, y2: number) => { bars.push({ x: x0 + x, w, y1, y2 }); },
  };
};

const build = () => {
  // ============ THE HOOD ============
  const h = part(HOOD_X0);
  h.ground(0, ROAD_START);
  h.prop('house', 60, Y, 260); h.prop('liquor', 380, Y, 240, 'LIQUOR'); h.prop('house', 700, Y, 240); h.prop('fence', 960, Y, 300);
  h.prop('boilsign', 300, Y); h.prop('pallets', 560, Y); h.prop('burnedcar', 1160, Y);
  h.pickup(520, Y - 30, 'small_ammo');

  // ============ THE ROAD ============
  // (flat, all the way across town)
  const r = part(HOOD_X0 + ROAD_START);
  const END = ROAD_LEN + 1300;
  r.ground(0, END);
  const junk: RoadJunk[] = [];
  const j = (lx: number, look: RoadJunk['look']) => junk.push({ x: HOOD_X0 + ROAD_START + lx, look });
  // One thing at a time to learn early (cones are just for smashing), mixing up through the middle, busy at the end
  j(900, 'cones'); j(1700, 'trash'); j(2700, 'pothole'); j(3500, 'ramp'); j(5100, 'car');
  j(6000, 'hydrant'); j(6800, 'cones'); j(7300, 'barrier'); j(8200, 'glass'); j(9000, 'pothole');
  j(10400, 'ramp'); j(11200, 'car'); j(12100, 'hydrant'); j(12800, 'barrier'); j(13600, 'glass');
  j(15000, 'car'); j(15700, 'pothole'); j(16900, 'hydrant'); j(17600, 'ramp'); j(18300, 'car');
  j(19000, 'barrier'); j(19600, 'trash'); j(20900, 'hydrant'); j(21500, 'car'); j(22200, 'pothole');
  j(22800, 'barrier'); j(24200, 'car'); j(24900, 'cones');
  const waves: RoadWave[] = [];
  const w = (lx: number, kind: EnemyKind, from: RoadWave['from'], variant = 0) => waves.push({ at: HOOD_X0 + ROAD_START + lx, kind, from, variant });
  // The rest of the crew, straight after him in the car; the dogs off their chains; more cars joining in
  w(300, 'lowrider', 'behind', 0); w(2300, 'pitbull', 'behind'); w(4000, 'lowrider', 'ahead', 1); w(5800, 'pitbull', 'behind');
  w(7000, 'lowrider', 'behind', 0); w(8600, 'pitbull', 'behind'); w(11000, 'pitbull', 'behind');
  w(12300, 'lowrider', 'behind', 0); w(13500, 'lowrider', 'ahead', 1); w(15800, 'lowrider', 'behind', 0);
  w(17000, 'pitbull', 'behind'); w(17800, 'lowrider', 'ahead', 1); w(20100, 'pitbull', 'behind');
  w(21000, 'lowrider', 'ahead', 1); w(23000, 'pitbull', 'behind');
  // Something to pick up along the way (ride through it)
  for (const lx of [6600, 13300, 19800]) r.pickup(lx, Y - 30, 'small_health');
  r.pickup(10000, Y - 30, 'small_ammo');
  r.prop('boilsign', 1200, Y); r.prop('tower', 6000, Y); r.prop('boilsign', 13000, Y);

  // ============ THE SEWER ============
  const s = part(SEWER_X0);
  // Walkways over the channels (the channel floors are their own ground, down under the muck)
  s.ground(0, 700); s.channel(700, 860);
  s.ground(860, 1600); s.channel(1600, 1900); s.ledge(1720, Y - 6, 60, 'grate');
  s.ground(1900, 2700); s.channel(2700, 3200); s.ledge(2800, Y - 6, 70, 'grate'); s.ledge(3010, Y - 6, 70, 'grate');
  s.ground(3200, 4000); s.ledge(3680, Y - 130, 220, 'pipe');
  s.channel(4000, 4150);
  s.ground(4150, 4760);
  // The flooded tunnel: the muck right up near its roof, pipes down from the roof to go under, grates up off the floor to go over
  s.channel(4760, 7200, TUNNEL_SURFACE, TUNNEL_FLOOR);
  s.bar(5150, 60, TUNNEL_ROOF, Y + 60); s.bar(5520, 50, Y + 95, TUNNEL_FLOOR); s.bar(5900, 60, TUNNEL_ROOF, Y + 70);
  s.bar(6280, 50, Y + 90, TUNNEL_FLOOR); s.bar(6620, 60, TUNNEL_ROOF, Y + 75); s.bar(6950, 50, Y + 95, TUNNEL_FLOOR);
  // Mutant fish in it, to shoot as he swims (hanging about in the open water between the pipes and grates)
  for (const fx of [5330, 5720, 6100, 6460, 6800]) s.spawn('mutantfish', fx, Y + 150);
  // Up out of it: a walkway, the second locker
  s.ground(7200, 7700);
  // The flooded pit: in at the top left, down past the baffles, under the wall at the bottom, back up the far side
  s.channel(7700, 8600, TUNNEL_SURFACE, PIT_FLOOR);
  s.bar(8130, 40, TUNNEL_ROOF, Y + 850);
  // Down the left: a shelf to go round, then one the other way, then a slot in the middle of one, a post under that to
  // weave past, and a last shelf with a narrow way round it at the far wall
  s.bar(7700, 300, Y + 180, Y + 212); s.bar(7830, 300, Y + 360, Y + 392);
  s.bar(7700, 170, Y + 520, Y + 552); s.bar(7950, 180, Y + 520, Y + 552);
  s.bar(7900, 40, Y + 640, Y + 740);
  s.bar(7790, 340, Y + 830, Y + 862);
  // Under the wall at the bottom (a hump on the floor past it to get over), then up the right: round the end of a shelf,
  // through a gap in the middle of the next, round the near end of one, the far end of the next, and the near end of the last
  s.bar(8300, 60, Y + 930, PIT_FLOOR);
  s.bar(8170, 310, Y + 760, Y + 792);
  s.bar(8170, 110, Y + 620, Y + 652); s.bar(8420, 180, Y + 620, Y + 652);
  s.bar(8260, 340, Y + 480, Y + 512);
  s.bar(8170, 280, Y + 330, Y + 362);
  s.bar(8300, 300, Y + 180, Y + 212);
  for (const [fx, fy] of [[7860, Y + 100], [7760, Y + 280], [8040, Y + 440], [7780, Y + 640], [8050, Y + 680], [7980, Y + 920], [8420, Y + 880],
    [8350, Y + 700], [8520, Y + 560], [8420, Y + 410], [8300, Y + 260], [8460, Y + 100]]) s.spawn('mutantfish', fx, fy);
  // On into the cistern (a walkway, and the pool at the far end where it lives)
  s.ground(8600, 9550); s.channel(9550, 10000, Y + 20, Y + 220);
  // What's down here
  s.spawn('rat', 1150); s.spawn('hazmat', 1480); s.spawn('sludgeling', 1660, CHANNEL_FLOOR); s.spawn('sludgeling', 1860, CHANNEL_FLOOR);
  s.spawn('rat', 2250); s.spawn('bloater', 2480); s.spawn('sludgeling', 2760, CHANNEL_FLOOR); s.spawn('sludgeling', 2960, CHANNEL_FLOOR); s.spawn('sludgeling', 3140, CHANNEL_FLOOR);
  s.spawn('manhole', 3480); s.spawn('hazmat', 3790, Y - 130); s.spawn('rat', 3900); s.spawn('bloater', 4450);
  s.drip(2080, Y - 250, 110, 0); s.drip(2300, Y - 250, 130, 50); s.drip(2840, Y - 250, 120, 30); s.drip(3040, Y - 250, 120, 90); s.drip(3560, Y - 250, 100, 20);
  // (a big one where he drops in: he's likely come down off the road hurt)
  s.pickup(380, Y - 30, 'large_health');
  s.pickup(2600, Y - 30, 'small_ammo'); s.pickup(3780, Y - 160, 'small_health');
  s.pickup(4300, Y - 30, 'large_health'); s.pickup(4360, Y - 30, 'small_ammo');
  s.pickup(7450, Y - 30, 'small_health');

  // ============ THE RUINS ============
  const u = part(RUINS_X0);
  // Up top: the ruins, right up to a narrow hole, and the ground on past it; down below, the floor outside the door
  u.ground(1500, PIT, RUINS_Y); u.ground(PIT + PIT_W, 3000, RUINS_Y); u.ground(2200, 3000, Y);
  u.pickup(2700, Y - 30, 'large_health'); u.pickup(2780, Y - 30, 'large_ammo');
  return { h, r, s, u, junk, waves, END };
};

const buildCourse = (): Course => {
  const { h, r, s, u, junk, waves, END } = build();
  const all = [h, r, s, u];
  const runs = all.flatMap(p => p.runs);
  runs.sort((a, b) => a.x1 - b.x1 || a.y1 - b.y1);
  // (the stage draws all of its own ground, and the gaps between the parts)
  for (const r of runs) {
    r.surface ??= r.x1 >= RUINS_X0 ? (r.y1 === Y ? 'floor' : 'rubble') : r.x1 >= SEWER_X0 ? 'walk' : 'street';
    r.pitAfter = 'clouds';
  }
  const RX = HOOD_X0 + ROAD_START;
  return {
    runs,
    ledges: all.flatMap(p => p.ledges),
    spawns: all.flatMap(p => p.spawns),
    pickups: all.flatMap(p => p.pickups),
    props: all.flatMap(p => p.props),
    junk, waves,
    drips: s.drips,
    channels: s.channels,
    bars: s.bars,
    hood: { x1: HOOD_X0, x2: RX, corner: HOOD_X0 + 900, bike: HOOD_X0 + 1000, stop: HOOD_X0 + 620 },
    road: { x1: RX, x2: RX + END, hazmat: RX + ROAD_LEN + 520, manhole: RX + ROAD_LEN + 760 },
    sewer: {
      x1: SEWER_X0, x2: SEWER_X0 + 10000, drop: SEWER_X0 + 200, lockers: [SEWER_X0 + 4600, SEWER_X0 + 7580],
      // (the roof comes down a little way in from each end: room to drop in, and to climb out)
      tunnel: { x1: SEWER_X0 + 4760, x2: SEWER_X0 + 7200, roof: TUNNEL_ROOF, surface: TUNNEL_SURFACE, floor: TUNNEL_FLOOR, roof1: SEWER_X0 + 4900, roof2: SEWER_X0 + 7060 },
      // (the roof over the pit leaves it open at each end: in at the top left, out at the top right)
      pit: { x1: SEWER_X0 + 7700, x2: SEWER_X0 + 8600, floor: PIT_FLOOR, roof1: SEWER_X0 + 7770, roof2: SEWER_X0 + 8530 },
      cistern: { x1: SEWER_X0 + 9200, x2: SEWER_X0 + 10000, pool: SEWER_X0 + 9550, rack: SEWER_X0 + 9280 },
    },
    ruins: { x1: RUINS_X0 + 1500, x2: BOSS_DOOR_X, y: RUINS_Y, house: RUINS_X0 + 2130, pit: RUINS_X0 + PIT, pitW: PIT_W },
    checkpoints: [
      { x: HOOD_X0 + 150, y: Y }, { x: RX + 60, y: Y }, { x: RX + 12000, y: Y },
      { x: SEWER_X0 + 200, y: Y }, { x: SEWER_X0 + 4450, y: Y }, { x: SEWER_X0 + 7400, y: Y }, { x: SEWER_X0 + 8700, y: Y }, { x: RUINS_X0 + 1640, y: RUINS_Y },
    ],
    left: HOOD_X0 - 2000,
    startX: HOOD_X0,
  };
};

export const COURSE = buildCourse();

export type Place = 'hood' | 'road' | 'sewer' | 'tunnel' | 'cistern' | 'ruins';
export const placeOf = (x: number): Place => {
  const C = COURSE;
  if (x >= C.ruins.x1 - 200) return 'ruins';
  if (x >= C.sewer.x1 - 2000 && x < C.sewer.x2 + 2000) return x >= C.sewer.cistern.x1 - 400 ? 'cistern'
    : (x >= C.sewer.tunnel.x1 - 100 && x < C.sewer.tunnel.x2) || (x >= C.sewer.pit.x1 - 60 && x < C.sewer.pit.x2) ? 'tunnel' : 'sewer';
  return x >= C.road.x1 ? 'road' : 'hood';
};
