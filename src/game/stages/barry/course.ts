// Blackout Barry's stage, laid out as data. New York, and the lights keep going out.
//
//   I.   The mean streets. Night, dim, the street lamps flickering (Meathead lights
//        up under them). Stoops and parked cars and scaffolding, open trenches
//        where the street's dug up, subway grates that blast steam (catch one and
//        it throws you up), pimps, hookers, muggers, bums, rats. It ends at the
//        revolving doors of a generic skyscraper.
//   II.  The skyscraper, floor by floor, left to right from one elevator to the
//        next (and the elevator never stops where it should): the lobby (New
//        Yorkers who don't have time for your shit), a white-collar office floor,
//        the maintenance floor, and R&D, where they're clearly experimenting on
//        something shady. Cramped: low ceilings all the way. Then the stairs up:
//        ROOF ACCESS.
//   III. The rooftops, in a rolling blackout (the lights across the city going off
//        and on in waves, dark enough to be hard to see, never pitch black), then
//        a tall old building to climb by its fire escapes (the tenants throwing
//        whatever's to hand out of their windows at you), to the power room at the
//        top: Barry's man on the grid, three generators, and what happens when
//        they go. Then the ride down (on him), and Barry's door.
//
// Each place is built in its own coordinates and shifted into place: the streets
// far to the left, then each floor of the skyscraper, the rooftops, the power
// room, and the street at the end, right before the boss door.

import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';
import { GROUND_Y, BOSS_DOOR_X } from '../../../constants';

export const CP = { STREET: 0, AVENUE: 1, LOBBY: 2, OFFICE: 3, MAINTENANCE: 4, LAB: 5, ROOFS: 6, CLIMB: 7, CLIMB2: 8, POWER: 9, LANDING: 10 } as const;

export interface Spawn { kind: EnemyKind; x: number; y: number; variant?: number }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something you can jump up through and stand on: a stoop, a car roof, scaffolding, a desk, a fire escape, a water tower... */
/** (`solid`: no jumping up through it from under it, a fire escape landing up the walk-ups: round the end of it or not at all) */
export interface Ledge { x: number; y: number; w: number; look: LedgeLook; solid?: boolean }
export type LedgeLook = 'stoop' | 'car' | 'dumpster' | 'scaffold' | 'plank' | 'desk' | 'cubicle' | 'shelf' | 'bench' | 'tank' | 'ac' | 'tower' | 'escape' | 'catwalk' | 'counter' | 'rooftop';
/** A street lamp (its head at x, y): it lights the street under it, and some of them don't work so well. `flicker` 0 steady to 1 barely hanging on. */
export interface Lamp { x: number; y: number; flicker: number; look: 'street' | 'sign' | 'bulb' | 'tube' | 'beacon' }
/** A subway grate in the sidewalk that blasts steam every so often: on it when it goes and it throws you up. */
export interface Vent { x: number; w: number; every: number; offset: number }
/** A ceiling or a wall (solid, drawn by the place it's in). */
export interface Wall { x: number; y: number; w: number; h: number }
export interface Prop { look: string; x: number; y: number; w?: number; h?: number; v?: number }
/** A window on the fire-escape building with somebody behind it (x: its left edge, y: its sill). */
export interface Window { x: number; y: number; v: number }
/** One floor of the skyscraper (or the power room): its left and right ends, the floor, the ceiling, what floor it is. */
export interface Room { x1: number; x2: number; floor: number; ceiling: number; label: string; kind: 'lobby' | 'office' | 'maintenance' | 'lab' | 'power' }

export interface Course {
  runs: GroundRun[];
  ledges: Ledge[];
  lamps: Lamp[];
  vents: Vent[];
  walls: Wall[];
  props: Prop[];
  windows: Window[];
  spawns: Spawn[];
  pickups: PickupSpot[];
  streets: { x1: number; x2: number; doors: number };
  lobby: Room; office: Room; maintenance: Room; lab: Room; power: Room;
  /** Each floor's elevator (the doors at the right end of it) and where you come out on the next one. */
  elevators: { x: number; room: Room }[];
  /** The stairs up to the roof (their foot), at the end of the lab. */
  roofAccess: number;
  roofs: { x1: number; x2: number };
  /** The fire-escape building: its left and right walls, the ground, and the door up top to the power room. */
  climb: { x1: number; x2: number; top: number; door: number; buildings: { x1: number; x2: number; top: number }[] };
  generators: number[];
  landing: { x1: number; x2: number };
  checkpoints: { x: number; y: number }[];
  left: number;
  startX: number;
}

const Y = GROUND_Y;
const STREETS_X0 = -100000;
const LOBBY_X0 = -80000;
const OFFICE_X0 = -74000;
const MAINT_X0 = -68000;
const LAB_X0 = -62000;
const ROOFS_X0 = -52000;
const POWER_X0 = -36000;
const LANDING_X0 = BOSS_DOOR_X - 1700;

/** The fire escape: the first landing's height off the street, and each one above that (a jump's worth, near enough). */

/** Every floor's ceiling is this low (it's cramped in there). The lobby's taller. */
const LOW_CEILING = Y - 250, LOBBY_CEILING = Y - 330;

/** A stretch of course in its own coordinates, shifted by x0. */
const part = (x0: number) => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], lamps: Lamp[] = [], vents: Vent[] = [], walls: Wall[] = [];
  const props: Prop[] = [], windows: Window[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [];
  return {
    runs, ledges, lamps, vents, walls, props, windows, spawns, pickups, x0,
    ground: (x1: number, x2: number, y1 = Y, y2 = y1, surface?: string) => { runs.push({ x1: x0 + x1, y1, x2: x0 + x2, y2, surface }); },
    ledge: (x: number, y: number, w: number, look: LedgeLook, solid = false) => { ledges.push({ x: x0 + x, y, w, look, solid }); },
    lamp: (x: number, y: number, flicker: number, look: Lamp['look'] = 'street') => { lamps.push({ x: x0 + x, y, flicker, look }); },
    vent: (x: number, w: number, every: number, offset: number) => { vents.push({ x: x0 + x, w, every, offset }); },
    wall: (x: number, y: number, w: number, h: number) => { walls.push({ x: x0 + x, y, w, h }); },
    prop: (look: string, x: number, y: number, w?: number, h?: number, v?: number) => { props.push({ look, x: x0 + x, y, w, h, v }); },
    window: (x: number, y: number, v: number) => { windows.push({ x: x0 + x, y, v }); },
    spawn: (kind: EnemyKind, x: number, y = Y, variant?: number) => { spawns.push({ kind, x: x0 + x, y, variant }); },
    pickup: (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: x0 + x, y, type }); },
  };
};
type Part = ReturnType<typeof part>;

const room = (x0: number, x1: number, x2: number, ceiling: number, label: string, kind: Room['kind']): Room => ({ x1: x0 + x1, x2: x0 + x2, floor: Y, ceiling, label, kind });

// ============ I. THE MEAN STREETS ============
const buildStreets = (s: Part) => {
  // The corner you start on: a bodega, a newsstand, a couple of stoops; a pimp and his girl out front
  s.ground(0, 1150);
  s.prop('bodega', 40, Y); s.prop('newsstand', 520, Y);
  s.ledge(250, Y - 60, 120, 'stoop'); s.ledge(760, Y - 60, 120, 'stoop');
  s.lamp(180, Y - 230, 0); s.lamp(620, Y - 230, 0.5); s.lamp(1060, Y - 230, 0.15);
  s.lamp(80, Y - 190, 0.1, 'sign');
  s.spawn('pimp', 900); s.spawn('hooker', 1040, Y, 0);
  s.spawn('rat', 700);
  // A trench where they've dug the street up (the first gap: plain, planks over it to teach it)
  s.prop('barrier', 1130, Y); s.prop('barrier', 1310, Y);
  s.ledge(1170, Y - 10, 110, 'plank');
  s.ground(1330, 2300);
  // The first steam grate, on its own with nothing else going on (see what it does), a fire escape ladder over it
  s.vent(1510, 120, 150, 0);
  s.ledge(1480, Y - 225, 170, 'escape');
  s.pickup(1560, Y - 255, 'small_ammo');
  s.lamp(1400, Y - 230, 0.3); s.lamp(1850, Y - 230, 0.8); s.lamp(2250, Y - 230, 0);
  s.prop('hydrant', 1720, Y);
  // Parked cars along the curb (roofs to stand on), a bum under the scaffolding with his cart
  s.ledge(1800, Y - 64, 150, 'car'); s.prop('car', 1800, Y, 150, 64, 0);
  s.ledge(2000, Y - 190, 300, 'scaffold'); s.prop('scaffold', 2000, Y, 300, 190);
  s.spawn('bum', 2180, Y, 0);
  s.spawn('mugger', 2260);
  // Dug up again, wider, a steam grate right before it (catch the blast and it takes you over)
  s.vent(2180, 120, 170, 60);
  s.prop('barrier', 2290, Y); s.prop('barrier', 2530, Y);
  s.ground(2540, 3700);
  s.spawn('rat', 2700); s.spawn('rat', 2760);
  // An avenue: dumpsters, a stoop, the hookers working the corner, the pimp up on the stoop
  s.ledge(2700, Y - 70, 110, 'dumpster'); s.prop('dumpster', 2700, Y, 110, 70);
  s.ledge(3000, Y - 60, 140, 'stoop'); s.ledge(3040, Y - 120, 100, 'stoop');
  s.spawn('hooker', 2900, Y, 1); s.spawn('pimp', 3090, Y - 120); s.spawn('hooker', 3300, Y, 2);
  s.lamp(2700, Y - 230, 0.2); s.lamp(3150, Y - 230, 0.9); s.lamp(3550, Y - 230, 0.1);
  s.lamp(3400, Y - 200, 0.2, 'sign');
  s.prop('phonebooth', 3480, Y);
  s.pickup(3060, Y - 150, 'small_health');
  // A long trench, two grates to hop across on, the scaffold overhead the safe way
  s.prop('barrier', 3690, Y); s.prop('barrier', 4230, Y);
  s.ground(3790, 4060, Y); s.vent(3850, 130, 140, 30);
  s.ledge(3760, Y - 210, 520, 'scaffold'); s.prop('scaffold', 3760, Y, 520, 210);
  s.spawn('bum', 4420, Y, 1);
  s.ground(4240, 5480);
  // Muggers down a dark stretch (only one lamp works), rats, a bum behind his cart
  s.lamp(4350, Y - 230, 0.95); s.lamp(4800, Y - 230, 1); s.lamp(5250, Y - 230, 0.1);
  s.spawn('mugger', 4500); s.spawn('rat', 4600); s.spawn('bum', 4750, Y, 2); s.spawn('mugger', 5000); s.spawn('rat', 5100);
  s.ledge(4600, Y - 64, 150, 'car'); s.prop('car', 4600, Y, 150, 64, 1);
  s.ledge(5050, Y - 70, 110, 'dumpster'); s.prop('dumpster', 5050, Y, 110, 70);
  s.pickup(4660, Y - 90, 'small_ammo');
  // The last stretch: up the loading docks and over the steam, everybody out on the street
  s.ledge(5180, Y - 100, 180, 'stoop');
  s.prop('barrier', 5470, Y); s.prop('barrier', 5650, Y);
  s.ground(5660, 6800);
  s.spawn('pimp', 5900); s.spawn('hooker', 6000, Y, 3); s.spawn('bum', 6200, Y, 3); s.spawn('mugger', 6350);
  s.lamp(5750, Y - 230, 0.3); s.lamp(6150, Y - 230, 0); s.lamp(6550, Y - 230, 0.5);
  s.ledge(6050, Y - 64, 150, 'car'); s.prop('car', 6050, Y, 150, 64, 2);
  s.pickup(6500, Y - 30, 'large_health');
  // The skyscraper's revolving doors
  s.prop('skyscraper', 6620, Y);
};

// ============ II. THE SKYSCRAPER ============
const buildLobby = (s: Part) => {
  s.ground(0, 1700, Y, Y, 'marble');
  s.wall(-60, LOBBY_CEILING - 400, 60, 800); s.wall(1700, LOBBY_CEILING - 400, 60, 800);
  s.wall(0, LOBBY_CEILING - 30, 1700, 30);
  // The security desk, turnstiles, benches, planters; everyday New Yorkers, in a hurry
  // (nobody close to the doors you come in by)
  s.ledge(560, Y - 70, 180, 'counter'); s.prop('desk', 560, Y, 180, 70);
  s.prop('turnstiles', 820, Y);
  s.ledge(1000, Y - 40, 130, 'bench'); s.ledge(1330, Y - 40, 110, 'bench');
  s.prop('planter', 1200, Y); s.prop('planter', 1480, Y);
  s.spawn('guard', 640, Y - 70); s.spawn('commuter', 900); s.spawn('reader', 1120); s.spawn('commuter', 1260); s.spawn('guard', 1420);
  s.lamp(300, LOBBY_CEILING, 0, 'bulb'); s.lamp(800, LOBBY_CEILING, 0, 'bulb'); s.lamp(1300, LOBBY_CEILING, 0.2, 'bulb');
  s.pickup(1560, Y - 30, 'small_health');
};

const buildOffice = (s: Part) => {
  s.ground(0, 1900, Y, Y, 'carpet');
  s.wall(-60, LOW_CEILING - 400, 60, 800); s.wall(1900, LOW_CEILING - 400, 60, 800);
  s.wall(0, LOW_CEILING - 30, 1900, 30);
  // Cubicles (their walls to hop over and stand on), desks, the copier, the water cooler, the corner office
  for (const x of [300, 560, 820]) { s.ledge(x, Y - 70, 160, 'cubicle'); s.prop('cubicle', x, Y, 160, 70); }
  s.ledge(1150, Y - 60, 160, 'desk'); s.prop('bigdesk', 1150, Y, 160, 60);
  s.prop('copier', 1000, Y); s.prop('cooler', 1420, Y);
  s.ledge(1500, Y - 70, 160, 'cubicle'); s.prop('cubicle', 1500, Y, 160, 70);
  s.spawn('exec', 640, Y - 70); s.spawn('intern', 760); s.spawn('hr', 960); s.spawn('exec', 1230, Y - 60); s.spawn('intern', 1350); s.spawn('hr', 1700);
  for (let x = 150; x < 1900; x += 300) s.lamp(x, LOW_CEILING, x === 1050 ? 0.85 : 0.05, 'tube');
  s.pickup(1210, Y - 90, 'small_ammo');
};

const buildMaintenance = (s: Part) => {
  s.ground(0, 1900, Y, Y, 'concrete');
  s.wall(-60, LOW_CEILING - 400, 60, 800); s.wall(1900, LOW_CEILING - 400, 60, 800);
  s.wall(0, LOW_CEILING - 30, 1900, 30);
  // Ducts hanging low (just over his head: no jumping under them), shelves of supplies, the boiler
  s.wall(520, Y - 100, 180, 28); s.prop('ducts', 520, Y - 100, 180, 28);
  s.wall(1230, Y - 100, 220, 28); s.prop('ducts', 1230, Y - 100, 220, 28);
  s.ledge(250, Y - 100, 150, 'shelf'); s.prop('shelves', 250, Y, 150, 100);
  s.ledge(880, Y - 100, 150, 'shelf'); s.prop('shelves', 880, Y, 150, 100);
  s.prop('boiler', 1060, Y);
  s.ledge(1600, Y - 100, 150, 'shelf'); s.prop('shelves', 1600, Y, 150, 100);
  s.spawn('janitor', 620); s.spawn('custodian', 800); s.spawn('exterminator', 960, Y - 100); s.spawn('janitor', 1150); s.spawn('custodian', 1500); s.spawn('exterminator', 1680, Y - 100);
  for (let x = 120; x < 1900; x += 320) s.lamp(x, LOW_CEILING, x > 1000 && x < 1400 ? 0.9 : 0.3, 'bulb');
  s.pickup(950, Y - 130, 'small_health');
};

const buildLab = (s: Part) => {
  s.ground(0, 2100, Y, Y, 'tile');
  s.wall(-60, LOW_CEILING - 400, 60, 800); s.wall(2100, Y - 700, 60, 800);
  s.wall(0, LOW_CEILING - 30, 1840, 30);
  // Lab benches, specimen tanks with things floating in them, cages, the whiteboard; then the stairs up to the roof
  s.ledge(220, Y - 64, 180, 'counter'); s.prop('bench', 220, Y, 180, 64);
  s.prop('tank', 470, Y, 0, 0, 0);
  s.ledge(640, Y - 64, 180, 'counter'); s.prop('bench', 640, Y, 180, 64);
  s.prop('whiteboard', 900, Y);
  s.prop('cages', 1080, Y);
  s.prop('tank', 1300, Y, 0, 0, 1);
  s.ledge(1420, Y - 64, 180, 'counter'); s.prop('bench', 1420, Y, 180, 64);
  s.prop('tank', 1680, Y, 0, 0, 2);
  s.spawn('labtech', 700, Y - 64); s.spawn('scientist', 1000); s.spawn('subject', 1200); s.spawn('labtech', 1500, Y - 64); s.spawn('scientist', 1660); s.spawn('subject', 1780);
  for (let x = 150; x < 1840; x += 280) s.lamp(x, LOW_CEILING, x > 1100 ? 0.4 : 0.05, 'tube');
  s.pickup(700, Y - 90, 'small_ammo');
  // ROOF ACCESS: up the stairs at the end
  s.prop('stairs', 1840, Y);
};

// ============ III. THE ROOFTOPS ============
const buildRoofs = (s: Part) => {
  // Across the tops of the buildings (alleys between them), water towers, AC units, skylights, antennas
  const R = Y - 40;
  s.ground(0, 900, R, R, 'roof');
  s.ledge(300, R - 130, 120, 'tank'); s.prop('watertower', 300, R, 120, 130);
  s.ledge(620, R - 50, 110, 'ac'); s.prop('ac', 620, R, 110, 50);
  s.spawn('mugger', 700, R); s.spawn('pimp', 850, R);
  s.lamp(420, R - 150, 0.2, 'beacon');
  s.ground(1000, 2000, R - 80, R - 80, 'roof');
  s.ledge(1300, R - 80 - 50, 110, 'ac'); s.prop('ac', 1300, R - 80, 110, 50);
  s.spawn('bum', 1450, R - 80, 0); s.spawn('guard', 1780, R - 80);
  s.lamp(1600, R - 230, 0.3, 'beacon');
  s.pickup(1360, R - 160, 'small_health');
  s.ground(2150, 2900, R + 20, R + 20, 'roof');
  s.ledge(2400, R + 20 - 140, 120, 'tank'); s.prop('watertower', 2400, R + 20, 120, 140);
  s.spawn('mugger', 2300, R + 20); s.spawn('hooker', 2700, R + 20, 1);
  s.lamp(2550, R - 130, 0.1, 'beacon');
  // (a skylight to cross on its frame, a gap you need the AC unit to make)
  s.ground(2990, 3900, R - 60, R - 60, 'roof');
  s.spawn('exec', 3400, R - 60); s.spawn('commuter', 3700, R - 60);
  s.lamp(3500, R - 260, 0.4, 'beacon');
  s.pickup(3300, R - 90, 'small_ammo');
  s.ground(4020, 4700, R - 20, R - 20, 'roof');
  s.spawn('rat', 4200, R - 20); s.spawn('pimp', 4450, R - 20);
  s.ledge(4300, R - 20 - 50, 110, 'ac'); s.prop('ac', 4300, R - 20, 110, 50);
  // Down onto the street in front of the old walk-ups (their fire escapes), and up them
  s.ground(4700, 5600, Y, Y);
  s.pickup(4900, Y - 30, 'large_health');
  // The fire escapes: two walk-ups. Their landings are solid (no jumping up through one: round the end of it), and
  // they go every which way (not the same step up every time): a jump up and across to the next, higher or lower,
  // longer or shorter, a tenant in the window by most of them. The first building's roof, then a big jump across the
  // alley to the second, wider one, and its fire escapes (smaller, further apart), up and up to the door on its roof.
  const land = (bx: number, list: [number, number, number][]) => {
    for (const [dx, up, w] of list) {
      s.ledge(bx + dx, Y - up, w, 'escape', true);
      s.window(bx + dx + Math.max(10, w / 2 - 30), Y - up - 20, up);
    }
  };
  const B1 = 5000, B1W = 520, B1TOP = 1060;
  land(B1, [[20, 130, 220], [330, 240, 170], [60, 370, 150], [300, 470, 200], [40, 590, 130], [200, 700, 100], [400, 830, 110], [120, 940, 200]]);
  s.ledge(B1, Y - B1TOP, B1W, 'rooftop');
  // (and pigeons up here, not many: off the ledges at you)
  s.spawn('pigeon', B1 + 380, Y - 560); s.spawn('pigeon', B1 + 150, Y - 880);
  s.pickup(B1 + 420, Y - B1TOP - 30, 'small_health');
  s.lamp(B1 + 260, Y - B1TOP - 90, 0.3, 'bulb');
  // (its walls: in at the bottom from the street either side; the roof's open to the alley on the right)
  s.wall(B1 - 80, Y - B1TOP - 40, 80, B1TOP + 40 - 260);
  s.wall(B1 + B1W, Y - B1TOP + 20, 80, B1TOP - 20 - 260);
  const B2 = 5690, B2W = 1000, B2TOP = 2220;
  land(B2, [[20, 1020, 160], [280, 1150, 110], [520, 1260, 100], [750, 1370, 120], [560, 1490, 110], [330, 1610, 110], [90, 1740, 120], [330, 1860, 90], [550, 1975, 90], [770, 2095, 120]]);
  s.ledge(B2, Y - B2TOP, B2W, 'rooftop');
  s.spawn('pigeon', B2 + 650, Y - 1400); s.spawn('pigeon', B2 + 200, Y - 1700); s.spawn('pigeon', B2 + 700, Y - 2060);
  s.pickup(B2 + 570, Y - 1260 - 30, 'small_ammo');
  // (the alley side: open where you jump across onto its first landing, walled above and below that)
  s.wall(B2 - 80, Y - 1000, 80, 1000 - 260);
  s.wall(B2 - 80, Y - B2TOP - 300, 80, B2TOP + 300 - 1420);
  s.wall(B2 + B2W, Y - B2TOP - 300, 80, B2TOP + 300);
  s.lamp(B2 + 500, Y - B2TOP - 100, 0.3, 'bulb');
  // (the street runs on under the second one)
  s.ground(5600, B2 + B2W + 80, Y, Y);
};

// ============ THE POWER ROOM ============
const buildPower = (s: Part) => {
  s.ground(0, 1100, Y, Y, 'grate');
  s.wall(-60, Y - 700, 60, 800); s.wall(1100, Y - 700, 60, 800);
  s.wall(0, Y - 330, 1100, 30);
  s.ledge(140, Y - 120, 120, 'catwalk'); s.ledge(840, Y - 120, 120, 'catwalk');
  for (let x = 100; x < 1100; x += 250) s.lamp(x, Y - 300, 0.1, 'tube');
};

// ============ THE STREET AT THE END ============
const buildLanding = (s: Part) => {
  s.ground(0, 1700 + 60);
  s.prop('burningcar', 700, Y); s.prop('hydrantspray', 1100, Y); s.prop('rubble', 400, Y);
  s.lamp(300, Y - 230, 0.9); s.lamp(900, Y - 230, 1); s.lamp(1400, Y - 230, 0.6);
  // (everything before Barry's door)
  s.pickup(1480, Y - 30, 'large_health'); s.pickup(1540, Y - 30, 'large_ammo');
};

const buildCourse = (): Course => {
  const st = part(STREETS_X0), lo = part(LOBBY_X0), of = part(OFFICE_X0), ma = part(MAINT_X0), la = part(LAB_X0), ro = part(ROOFS_X0), po = part(POWER_X0), ld = part(LANDING_X0);
  buildStreets(st); buildLobby(lo); buildOffice(of); buildMaintenance(ma); buildLab(la); buildRoofs(ro); buildPower(po); buildLanding(ld);
  const parts = [st, lo, of, ma, la, ro, po, ld];
  const runs = parts.flatMap(p => p.runs);
  runs.sort((a, b) => a.x1 - b.x1);
  const lobby = room(LOBBY_X0, 0, 1700, LOBBY_CEILING, 'LOBBY', 'lobby');
  const office = room(OFFICE_X0, 0, 1900, LOW_CEILING, '23', 'office');
  const maintenance = room(MAINT_X0, 0, 1900, LOW_CEILING, '41', 'maintenance');
  const lab = room(LAB_X0, 0, 2100, LOW_CEILING, '58', 'lab');
  const power = room(POWER_X0, 0, 1100, Y - 300, 'POWER', 'power');
  const climbTop = Y - 2220;
  return {
    runs,
    ledges: parts.flatMap(p => p.ledges),
    lamps: parts.flatMap(p => p.lamps),
    vents: parts.flatMap(p => p.vents),
    walls: parts.flatMap(p => p.walls),
    props: parts.flatMap(p => p.props),
    windows: parts.flatMap(p => p.windows),
    spawns: parts.flatMap(p => p.spawns),
    pickups: parts.flatMap(p => p.pickups),
    streets: { x1: STREETS_X0, x2: STREETS_X0 + 6800, doors: STREETS_X0 + 6700 },
    lobby, office, maintenance, lab, power,
    elevators: [
      { x: LOBBY_X0 + 1620, room: office },
      { x: OFFICE_X0 + 1820, room: maintenance },
      { x: MAINT_X0 + 1820, room: lab },
    ],
    roofAccess: LAB_X0 + 1860,
    roofs: { x1: ROOFS_X0, x2: ROOFS_X0 + 6800 },
    climb: { x1: ROOFS_X0 + 5000, x2: ROOFS_X0 + 6690, top: climbTop, door: ROOFS_X0 + 6190, buildings: [{ x1: ROOFS_X0 + 5000, x2: ROOFS_X0 + 5520, top: Y - 1060 }, { x1: ROOFS_X0 + 5690, x2: ROOFS_X0 + 6690, top: climbTop }] },
    generators: [POWER_X0 + 320, POWER_X0 + 580, POWER_X0 + 840],
    landing: { x1: LANDING_X0, x2: BOSS_DOOR_X },
    checkpoints: [
      { x: STREETS_X0 + 150, y: Y }, { x: STREETS_X0 + 2620, y: Y },
      { x: LOBBY_X0 + 80, y: Y }, { x: OFFICE_X0 + 80, y: Y }, { x: MAINT_X0 + 80, y: Y }, { x: LAB_X0 + 80, y: Y },
      { x: ROOFS_X0 + 80, y: Y - 40 }, { x: ROOFS_X0 + 4800, y: Y }, { x: ROOFS_X0 + 5770, y: Y - 1020 },
      { x: POWER_X0 + 80, y: Y }, { x: LANDING_X0 + 300, y: Y },
    ],
    left: STREETS_X0 - 2000,
    startX: STREETS_X0,
  };
};

export const COURSE = buildCourse();

/** The places, in order (for what's ahead of a checkpoint, and which one the camera's in). */
export type Place = 'streets' | 'lobby' | 'office' | 'maintenance' | 'lab' | 'roofs' | 'power' | 'landing';
export const PLACES: { place: Place; x1: number; x2: number }[] = [
  { place: 'streets', x1: STREETS_X0 - 2000, x2: STREETS_X0 + 9000 },
  { place: 'lobby', x1: LOBBY_X0 - 1000, x2: LOBBY_X0 + 3000 },
  { place: 'office', x1: OFFICE_X0 - 1000, x2: OFFICE_X0 + 3000 },
  { place: 'maintenance', x1: MAINT_X0 - 1000, x2: MAINT_X0 + 3000 },
  { place: 'lab', x1: LAB_X0 - 1000, x2: LAB_X0 + 3500 },
  { place: 'roofs', x1: ROOFS_X0 - 1000, x2: ROOFS_X0 + 8000 },
  { place: 'power', x1: POWER_X0 - 1000, x2: POWER_X0 + 3000 },
  { place: 'landing', x1: LANDING_X0 - 3000, x2: BOSS_DOOR_X + 100000 },
];
export const placeOf = (x: number): Place => (PLACES.find(p => x >= p.x1 && x < p.x2) ?? PLACES[0]).place;
export const placeIndex = (x: number) => PLACES.findIndex(p => p.place === placeOf(x));
export const roomOf = (place: Place): Room | null =>
  place === 'lobby' ? COURSE.lobby : place === 'office' ? COURSE.office : place === 'maintenance' ? COURSE.maintenance : place === 'lab' ? COURSE.lab : place === 'power' ? COURSE.power : null;
