// Toxic Tommy's stage, laid out as data. Flint, Michigan.
//
//   I.   The hood, late afternoon, the water tower up on its legs over the
//        rooftops. On foot down the block first: the crew's gangbangers up on
//        the porch roofs, their pit bulls, the rats; the hydrants sheared off
//        and blowing the town's water sky high every so often; the street
//        caved in where the mains burst, and the holes flooded with the stuff.
//        Then, a little way up the street, a few of the local crew are
//        hanging out on the corner, one of them sat on his bike. Not for long.
//   II.  The bike run: down the long, flat road across town, the crew after
//        you in their lowriders,
//        pit bulls off their chains, and the street full of junk. At the end of
//        it, a man in a hazmat suit and a bottle of the town's water.
//   III. The sewer: walkways over channels of the muck (it eats you, slowly),
//        Tommy's crew, the things that live down here. A hazmat suit in a
//        locker, and the tunnel past it flooded to the roof: swim it before the
//        suit's eaten through. Up out of it, the floodgate's down across the
//        walkway: up the shaft over it on the shelves and the gantry, and down
//        the far side. Another locker, and a flooded pit past it, deep:
//        down it past the baffles, under the wall at the bottom and back up the
//        far side. Then the cistern, and what's in it.
//   IV.  Blown up out of the sewer (into the water tower, over onto the next
//        block, and him surfing the wave down the street), what's left of the
//        block, the TOMMY'S LAIR sign, and the pit past it, all the way down
//        to Tommy's door.
//
// Each part is built in its own coordinates and shifted into place.

import type { EnemyKind } from '../../../types';
import type { GroundRun } from '../../core/terrain';
import { GROUND_Y, BOSS_DOOR_X } from '../../../constants';

export const CP = { HOOD: 0, BLOCK: 1, ROAD: 2, ROAD_MID: 3, SEWER: 4, SUIT: 5, CLIMB: 6, SUIT2: 7, CISTERN: 8, RUINS: 9 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something you jump up through and stand on: a porch, a grate over the muck, a pipe run. */
export interface Ledge { x: number; y: number; w: number; look: 'porch' | 'grate' | 'pipe' | 'hangpipe' | 'porchroof' | 'carroof' | 'pallet' | 'shelf' | 'gantry' }
/** Something solid on the block to get up on or over: a dumpster, a burned-out car. */
export interface Solid { x: number; y: number; w: number; h: number; look: 'dumpster' | 'wreck' }
/**
 * A burst water main: a hydrant sheared off at the curb, or the broken pipe down in a flooded hole. Every `period` frames
 * it gurgles, then blows the town's water sky high for a moment (hurts, him or anybody). `base` is where it comes up from.
 */
export interface Main { x: number; base: number; period: number; phase: number; look: 'hydrant' | 'pipe' }
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
  solids: Solid[];
  mains: Main[];
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
    /**
     * The floodgate shaft between the two swims: the roof goes up out of sight over it (to `top`), the gate's down
     * across the walkway in it (solid, floor to just under the gantry), and the street grate's up in the top of it.
     */
    climb: { x1: number; x2: number; top: number; gate: { x: number; w: number; top: number }; grate: number };
    cistern: { x1: number; x2: number; pool: number; rack: number };
  };
  /** What's left of the house (up high), and the pit down to Tommy's door. */
  /** What's left of the house (up high), and the hole down past it (narrow: a manhole's worth) to Tommy's door. */
  ruins: { x1: number; x2: number; y: number; house: number; pit: number; pitW: number; signs: number[]; arrows: number[] };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const Y = GROUND_Y;
const HOOD_X0 = -120000;
/** The block before it, on foot (it ends where the corner's street starts). */
const BLOCK_LEN = 5800, BLOCK_X0 = HOOD_X0 - BLOCK_LEN;
const ROAD_START = 1400;
/** How long the road is, and how far past it the hazmat man's waiting. */
export const ROAD_LEN = 26000;
const SEWER_X0 = -80000;
/** The stretch of walkways and channels let into the sewer before the manhole man (everything from there on is built
 * this much further along). */
const SEWER_MID = 1600, SEWER_X1 = SEWER_X0 + SEWER_MID;
/** The floodgate shaft between the two swims (everything past it, from the second locker on, is built this much
 * further along again). */
const CLIMB_W = 700, SEWER_X2 = SEWER_X1 + CLIMB_W;
/** The shaft (local to the sewer past the manhole man): where it starts, how high it goes, the gate across it. */
const SHAFT_X = 7500, SHAFT_TOP = Y - 640, GATE_X = 7900, GATE_W = 60, GANTRY_Y = Y - 420;
const RUINS_X0 = BOSS_DOOR_X - 3000;
/** The hole down (local to the ruins), and how wide it is. */
const PIT = 2560, PIT_W = 110;
/** What's left of the family's house (local to the ruins), and the walk from it over the rubble to the hole. */
const HOUSE = 2130 - 2000;
/** Along the walk: the little hand-painted signs, and the yellow arrows slapped down on the rubble (all pointing on). */
const SIGNS = [HOUSE + 380, HOUSE + 880, HOUSE + 1700], ARROWS = [HOUSE + 620, HOUSE + 1150, HOUSE + 2080];
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
  const drips: Drip[] = [], channels: Channel[] = [], bars: TunnelBar[] = [], solids: Solid[] = [], mains: Main[] = [];
  return {
    runs, ledges, spawns, pickups, props, drips, channels, bars, solids, mains,
    solid: (x: number, w: number, h: number, look: Solid['look']) => { solids.push({ x: x0 + x, y: Y - h, w, h, look }); },
    main: (x: number, period: number, phase: number, look: Main['look'] = 'hydrant', base = Y) => { mains.push({ x: x0 + x, base, period, phase, look }); },
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

/** A hole in the street where the main burst, flooded: its surface, and its floor. */
const HOLE_SURFACE = Y + 34, HOLE_FLOOR = Y + 190;

const build = () => {
  // ============ THE BLOCK ============
  // On foot, down to the corner. A hydrant blowing on its own first; the crew up on the porch roofs, a dog on the
  // sidewalk; a flooded hole in the street to get across; hydrants either side of a porch with a shooter up on it; a
  // brute and a wreck; and a last hole with the main still blowing up out of the middle of it, a dog waiting past it.
  const k = part(BLOCK_X0);
  k.ground(0, 1450);
  // A hydrant going off on its own, out in the open (see what it does)
  k.main(560, 170, 0);
  // Up on a porch roof, one of the crew; a pit bull on the sidewalk under him
  k.ledge(820, Y - 110, 170, 'porchroof'); k.spawn('banger', 900, Y - 110); k.spawn('pitbull', 1120);
  // A dumpster (up on it and over, or round the back)
  k.solid(1260, 96, 60, 'dumpster'); k.pickup(1308, Y - 90, 'small_ammo');
  // The first hole: a van sunk in it up to its roof, a pallet floating, the far side (something living in it)
  k.channel(1450, 1880, HOLE_SURFACE, HOLE_FLOOR);
  k.ledge(1530, Y - 8, 160, 'carroof'); k.ledge(1806, HOLE_SURFACE - 8, 56, 'pallet');
  k.spawn('sludgeling', 1750, HOLE_FLOOR);
  // (one of the crew out on the far end of the roof, holding the crossing: nothing behind him but the water)
  k.spawn('banger', 1660, Y - 8);
  k.ground(1880, 3200);
  k.pickup(1960, Y - 30, 'small_health');
  k.spawn('rat', 2160); k.spawn('rat', 2240);
  // Two hydrants going off in turn, a porch between them with one of the crew up on it
  k.main(2380, 150, 0); k.main(2600, 150, 75);
  k.ledge(2420, Y - 115, 130, 'porchroof'); k.spawn('banger', 2485, Y - 115);
  // The brute with the bat, and the wreck behind him
  k.spawn('bruiser', 2860); k.solid(2990, 150, 52, 'wreck');
  // (and one right on the lip of the last hole past the wreck, his back to it: come down off the wreck into him)
  k.spawn('banger', 3168);
  // The last hole: a car roof, the main blowing up out of the water past it, a pallet past that; a dog on the far side
  k.channel(3200, 3560, HOLE_SURFACE, HOLE_FLOOR);
  k.ledge(3270, Y - 8, 90, 'carroof'); k.main(3405, 130, 40, 'pipe', HOLE_SURFACE); k.ledge(3450, HOLE_SURFACE - 8, 60, 'pallet');
  k.ground(3560, 4200);
  k.spawn('pitbull', 3720);
  k.pickup(3640, Y - 30, 'small_health');
  // Three hydrants in a row going off one after the other (run them on the beat), one of the crew up on the porch roof
  // before them, shooting down at you while you wait for your gap
  k.ledge(3730, Y - 115, 120, 'porchroof'); k.spawn('banger', 3790, Y - 115);
  k.main(3910, 120, 0); k.main(4010, 120, 40); k.main(4110, 120, 80);
  // The widest hole yet: a car roof, a pallet, the main blowing up between that and the next car roof (time the jump
  // through it), a last pallet; two things in the water, one of the crew holding the far roof
  k.channel(4200, 4720, HOLE_SURFACE, HOLE_FLOOR);
  k.ledge(4260, Y - 8, 100, 'carroof'); k.ledge(4400, HOLE_SURFACE - 8, 50, 'pallet');
  k.main(4475, 140, 60, 'pipe', HOLE_SURFACE);
  k.ledge(4500, Y - 8, 110, 'carroof'); k.ledge(4640, HOLE_SURFACE - 8, 50, 'pallet');
  k.spawn('sludgeling', 4330, HOLE_FLOOR); k.spawn('sludgeling', 4600, HOLE_FLOOR); k.spawn('banger', 4580, Y - 8);
  k.ground(4720, BLOCK_LEN);
  k.pickup(4780, Y - 30, 'small_health');
  // Rats, then a brute and one of the crew together; a dumpster with one up on the porch roof over it, and a last
  // wreck with a dog behind it, just short of the corner
  k.spawn('rat', 4880); k.spawn('rat', 4930); k.spawn('rat', 4990);
  k.spawn('bruiser', 5120); k.spawn('banger', 5200);
  k.solid(5300, 96, 60, 'dumpster'); k.pickup(5348, Y - 90, 'small_ammo');
  k.ledge(5420, Y - 115, 140, 'porchroof'); k.spawn('banger', 5500, Y - 115);
  k.solid(5600, 120, 52, 'wreck'); k.spawn('pitbull', 5760);

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
  // One thing at a time to learn early (cones are just for smashing), mixing up through the middle, busy at the end.
  // Nothing that has to be jumped (a pothole, a car) in the run-up to a ramp: its callout goes up that far out
  // (RAMP_CALL, in bike.ts), and it's held back while there's something to jump first
  j(700, 'cones'); j(1200, 'trash'); j(1700, 'pothole'); j(3500, 'ramp'); j(5100, 'car');
  j(6000, 'hydrant'); j(6800, 'cones'); j(7300, 'barrier'); j(8200, 'pothole'); j(9000, 'glass');
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
  // A long channel on a run of grates, a pipe dripping onto each of the middle ones (wait them out), sludgelings under
  s.ground(3200, 3450); s.spawn('rat', 3330);
  s.channel(3450, 4000); s.ledge(3540, Y - 6, 60, 'grate'); s.ledge(3700, Y - 6, 60, 'grate'); s.ledge(3860, Y - 6, 60, 'grate');
  s.drip(3730, Y - 250, 110, 0); s.drip(3890, Y - 250, 110, 55);
  s.spawn('sludgeling', 3620, CHANNEL_FLOOR); s.spawn('sludgeling', 3790, CHANNEL_FLOOR); s.spawn('sludgeling', 3960, CHANNEL_FLOOR);
  // A walkway with a pipe run along over it: a hazmat suit up on the pipe, a bloater down on the walkway under him
  s.ground(4000, 4420); s.pickup(4060, Y - 30, 'small_health');
  s.ledge(4150, Y - 130, 230, 'pipe'); s.spawn('hazmat', 4300, Y - 130); s.pickup(4190, Y - 160, 'small_ammo');
  s.spawn('bloater', 4340); s.drip(4250, Y - 250, 120, 30);
  // A narrow channel, one grate, another suit on the far side of it
  s.channel(4420, 4600); s.ledge(4485, Y - 6, 50, 'grate'); s.spawn('sludgeling', 4560, CHANNEL_FLOOR);
  s.ground(4600, SEWER_MID + 3200); s.spawn('hazmat', 4720);

  // (on from here, SEWER_MID further along)
  const s2 = part(SEWER_X1);
  s2.ground(3200, 4000); s2.ledge(3680, Y - 130, 220, 'pipe');
  // (wide past the manhole man, too wide to jump: a pipe hung from the roof over the middle of it to hop across on, high
  // enough that anything he's shoved along the walkway goes under it and in, not across)
  s2.channel(4000, 4300); s2.ledge(4095, Y - 92, 110, 'hangpipe');
  s2.ground(4300, 4760);
  // The flooded tunnel: the muck right up near its roof, pipes down from the roof to go under, grates up off the floor to go over
  s2.channel(4760, 7200, TUNNEL_SURFACE, TUNNEL_FLOOR);
  s2.bar(5150, 60, TUNNEL_ROOF, Y + 60); s2.bar(5520, 50, Y + 95, TUNNEL_FLOOR); s2.bar(5900, 60, TUNNEL_ROOF, Y + 70);
  s2.bar(6280, 50, Y + 90, TUNNEL_FLOOR); s2.bar(6620, 60, TUNNEL_ROOF, Y + 75); s2.bar(6950, 50, Y + 95, TUNNEL_FLOOR);
  // Mutant fish in it, to shoot as he swims (hanging about in the open water between the pipes and grates)
  for (const fx of [5330, 5720, 6100, 6460, 6800]) s2.spawn('mutantfish', fx, Y + 150);
  // Up out of it: a walkway, and the floodgate down across it in a shaft going up out of sight. Up and over: shelves hung
  // in the shaft, one then the other way (a hop each), a pipe dripping down through the grating of the third; the gantry
  // over the top of the gate, one of the suits on it; down the far side onto the walkway again, the second locker
  s2.ground(7200, SHAFT_X + CLIMB_W + 200);
  s2.pickup(7380, Y - 30, 'small_health');
  s2.spawn('rat', 7460);
  s2.ledge(7605, Y - 105, 85, 'shelf');
  s2.ledge(7730, Y - 210, 120, 'shelf'); s2.spawn('rat', 7800, Y - 210);
  s2.ledge(7540, Y - 315, 100, 'shelf'); s2.drip(7588, SHAFT_TOP + 70, 120, 0);
  s2.ledge(7690, GANTRY_Y, 380, 'gantry'); s2.pickup(7720, GANTRY_Y - 30, 'small_ammo'); s2.spawn('hazmat', 8010, GANTRY_Y);
  s2.ledge(8085, Y - 215, 95, 'shelf');
  // (on, from the second locker: CLIMB_W further along again)
  const s3 = part(SEWER_X2);
  // The flooded pit: in at the top left, down past the baffles, under the wall at the bottom, back up the far side
  s3.channel(7700, 8600, TUNNEL_SURFACE, PIT_FLOOR);
  s3.bar(8130, 40, TUNNEL_ROOF, Y + 850);
  // Down the left: a shelf to go round, then one the other way, then a slot in the middle of one, a post under that to
  // weave past, and a last shelf with a narrow way round it at the far wall
  s3.bar(7700, 300, Y + 180, Y + 212); s3.bar(7830, 300, Y + 360, Y + 392);
  s3.bar(7700, 170, Y + 520, Y + 552); s3.bar(7950, 180, Y + 520, Y + 552);
  s3.bar(7900, 40, Y + 640, Y + 740);
  s3.bar(7790, 340, Y + 830, Y + 862);
  // Under the wall at the bottom (a hump on the floor past it to get over), then up the right: round the end of a shelf,
  // through a gap in the middle of the next, round the near end of one, the far end of the next, and the near end of the last
  s3.bar(8300, 60, Y + 930, PIT_FLOOR);
  s3.bar(8170, 310, Y + 760, Y + 792);
  s3.bar(8170, 110, Y + 620, Y + 652); s3.bar(8420, 180, Y + 620, Y + 652);
  s3.bar(8260, 340, Y + 480, Y + 512);
  s3.bar(8170, 280, Y + 330, Y + 362);
  s3.bar(8300, 300, Y + 180, Y + 212);
  for (const [fx, fy] of [[7860, Y + 100], [7760, Y + 280], [8040, Y + 440], [7780, Y + 640], [8050, Y + 680], [7980, Y + 920], [8420, Y + 880],
    [8350, Y + 700], [8520, Y + 560], [8420, Y + 410], [8300, Y + 260], [8460, Y + 100]]) s3.spawn('mutantfish', fx, fy);
  // On into the cistern (a walkway, and the pool at the far end where it lives)
  s3.ground(8600, 9550); s3.channel(9550, 10000, Y + 20, Y + 220);
  // What's down here
  s.spawn('rat', 1150); s.spawn('hazmat', 1480); s.spawn('sludgeling', 1660, CHANNEL_FLOOR); s.spawn('sludgeling', 1860, CHANNEL_FLOOR);
  s.spawn('rat', 2250); s.spawn('bloater', 2480); s.spawn('sludgeling', 2760, CHANNEL_FLOOR); s.spawn('sludgeling', 2960, CHANNEL_FLOOR); s.spawn('sludgeling', 3140, CHANNEL_FLOOR);
  s2.spawn('manhole', 3480); s2.spawn('hazmat', 3790, Y - 130); s2.spawn('rat', 3900); s2.spawn('bloater', 4450);
  s.drip(2080, Y - 250, 110, 0); s.drip(2300, Y - 250, 130, 50); s.drip(2840, Y - 250, 120, 30); s.drip(3040, Y - 250, 120, 90); s2.drip(3560, Y - 250, 100, 20);
  // (a big one where he drops in: he's likely come down off the road hurt)
  s.pickup(380, Y - 30, 'large_health');
  s.pickup(2600, Y - 30, 'small_ammo'); s2.pickup(3780, Y - 160, 'small_health');
  s2.pickup(4380, Y - 30, 'large_health'); s2.pickup(4440, Y - 30, 'small_ammo');

  // ============ THE RUINS ============
  const u = part(RUINS_X0);
  // Up top: the ruins, right up to a narrow hole, and the ground on past it; down below, the floor outside the door
  // (a block's worth of what's left: the family's house, and more either side of it)
  u.ground(HOUSE - 1230, PIT, RUINS_Y); u.ground(PIT + PIT_W, 3000, RUINS_Y); u.ground(2200, 3000, Y);
  u.pickup(2700, Y - 30, 'large_health'); u.pickup(2780, Y - 30, 'large_ammo');
  return { k, h, r, s, s2, s3, u, junk, waves, END };
};

const buildCourse = (): Course => {
  const { k, h, r, s, s2, s3, u, junk, waves, END } = build();
  const all = [k, h, r, s, s2, s3, u];
  const runs = all.flatMap(p => p.runs);
  runs.sort((a, b) => a.x1 - b.x1 || a.y1 - b.y1);
  // (the stage draws all of its own ground, and the gaps between the parts)
  for (const r of runs) {
    r.surface ??= r.x1 >= RUINS_X0 + HOUSE - 1230 ? (r.y1 === Y ? 'floor' : 'rubble') : r.x1 >= SEWER_X0 ? 'walk' : 'street';
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
    drips: [...s.drips, ...s2.drips],
    // (the flooded holes up on the block first, then the sewer's)
    channels: [...k.channels, ...s.channels, ...s2.channels, ...s3.channels],
    bars: [...s2.bars, ...s3.bars],
    solids: k.solids,
    mains: k.mains,
    hood: { x1: BLOCK_X0, x2: RX, corner: HOOD_X0 + 900, bike: HOOD_X0 + 1000, stop: HOOD_X0 + 620 },
    road: { x1: RX, x2: RX + END, hazmat: RX + ROAD_LEN + 520, manhole: RX + ROAD_LEN + 760 },
    sewer: {
      x1: SEWER_X0, x2: SEWER_X2 + 10000, drop: SEWER_X0 + 200, lockers: [SEWER_X1 + 4600, SEWER_X2 + 7580],
      // (the roof comes down a little way in from each end: room to drop in, and to climb out)
      tunnel: { x1: SEWER_X1 + 4760, x2: SEWER_X1 + 7200, roof: TUNNEL_ROOF, surface: TUNNEL_SURFACE, floor: TUNNEL_FLOOR, roof1: SEWER_X1 + 4900, roof2: SEWER_X1 + 7060 },
      // (the roof over the pit leaves it open at each end: in at the top left, out at the top right)
      pit: { x1: SEWER_X2 + 7700, x2: SEWER_X2 + 8600, floor: PIT_FLOOR, roof1: SEWER_X2 + 7770, roof2: SEWER_X2 + 8530 },
      climb: { x1: SEWER_X1 + SHAFT_X, x2: SEWER_X1 + SHAFT_X + CLIMB_W, top: SHAFT_TOP, gate: { x: SEWER_X1 + GATE_X, w: GATE_W, top: GANTRY_Y + 14 }, grate: SEWER_X1 + 7860 },
      cistern: { x1: SEWER_X2 + 9200, x2: SEWER_X2 + 10000, pool: SEWER_X2 + 9550, rack: SEWER_X2 + 9280 },
    },
    ruins: { x1: RUINS_X0 + HOUSE - 1230, x2: BOSS_DOOR_X, y: RUINS_Y, house: RUINS_X0 + HOUSE, pit: RUINS_X0 + PIT, pitW: PIT_W, signs: SIGNS.map(x => RUINS_X0 + x), arrows: ARROWS.map(x => RUINS_X0 + x) },
    checkpoints: [
      { x: BLOCK_X0 + 150, y: Y }, { x: BLOCK_X0 + 1940, y: Y }, { x: RX + 60, y: Y }, { x: RX + 12000, y: Y },
      { x: SEWER_X0 + 200, y: Y }, { x: SEWER_X1 + 4450, y: Y }, { x: SEWER_X1 + 7300, y: Y }, { x: SEWER_X2 + 7480, y: Y }, { x: SEWER_X2 + 8700, y: Y }, { x: RUINS_X0 + HOUSE - 490, y: RUINS_Y },
    ],
    left: BLOCK_X0 - 2000,
    startX: BLOCK_X0,
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
