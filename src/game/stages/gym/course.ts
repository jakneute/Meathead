// The Iron Pit: Meathead's gym, at five in the morning, on chest day. The opening stage (START GAME + INTRO): the
// department sends its pencil necks in first, to see what he'll do, and he does it. Laid out to teach, a room at a
// time, each one something new to do to them, the way through it in plain sight:
//
//   1. The free weights: pencil necks with pistols, out in the open. Shoot them.
//   2. The cardio floor: a line of them running at him with clipboards. Shoulder charge through the lot (the ones
//      he sends flying take out the ones behind).
//   3. Under the benches: gym rats. Real ones. Too low to shoot: slide tackle them.
//   4. The plate racks: pencil necks up on top, out of reach. Uppercut them off.
//   5. The mezzanine: up the steps, then down on the ones bunched up below. Dive kick, and keep bouncing.
//   6. The locker room doors: pencil necks behind briefcases. Charge them into the wall.
//
// Then the doors open, and the bigger fellas walk in.

import { BOSS_DOOR_X, GROUND_Y } from '../../../constants';
import type { GroundRun } from '../../core/terrain';
import type { EnemyKind } from '../../../types';

/** The stage's name (it's no boss's: it's his gym). */
export const GYM_STAGE = 'The Iron Pit';

export const CP = { START: 0, RATS: 1, MEZZANINE: 2 } as const;

/** The rooms, in order (each one's lesson: see runtime.ts). */
export type Room = 'free' | 'cardio' | 'wall' | 'benches' | 'racks' | 'mezzanine' | 'lockers';

export interface Spawn { kind: EnemyKind; x: number; y: number; room: Room }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something to stand on that you can jump up through: the top of a plate rack, a step up to the mezzanine. */
export interface Ledge { x: number; y: number; w: number; look: 'rack' | 'step' }
/** The gym's things, for the drawing (no bearing on the game). */
export interface Prop { look: 'bench' | 'squat' | 'dumbbells' | 'treadmill' | 'bike' | 'mirror' | 'poster' | 'fountain' | 'cable' | 'bag' | 'window'; x: number; y: number; text?: string }

const X0 = BOSS_DOOR_X - 4600;
const Y = GROUND_Y;
/** How thick the end wall at the left is drawn (the gym's corner: the room stops there). */
export const END_WALL = 46;
/** The half-wall across the floor at the end of the cardio floor: where, how thick, its top. */
export const WALL_X = X0 + 1700, WALL_W = 44, WALL_TOP = Y - 100;
/** The mouse holes gnawed through the bottom of the wall along the benches (the far one with its vent grille hanging off). */
export const RAT_HOLES = [X0 + 2075, X0 + 2205];
/** The mezzanine's floor (up the steps), and how far it runs. */
export const MEZZ_Y = Y - 200;

const build = () => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [], dummies: number[] = [];
  const ground = (x1: number, x2: number, y1 = Y, y2 = y1) => { runs.push({ x1: X0 + x1, y1, x2: X0 + x2, y2 }); };
  const ledge = (x: number, y: number, w: number, look: Ledge['look']) => { ledges.push({ x: X0 + x, y, w, look }); };
  const spawn = (kind: EnemyKind, x: number, room: Room, y = Y) => { spawns.push({ kind, x: X0 + x, y, room }); };
  const pickup = (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: X0 + x, y, type }); };
  const prop = (look: Prop['look'], x: number, y = Y, text?: string) => { props.push({ look, x: X0 + x, y, text }); };

  // ============ 1. THE FREE WEIGHTS ============
  // His bench (where the cutscene left him), the dumbbell rack along the mirror, three of them stood about with pistols
  // (the floor, with a half-wall across it at the end of the cardio floor: something to drive a man into, and to hop over)
  ground(-200, WALL_X - X0); ground(WALL_X - X0, WALL_X - X0 + WALL_W, WALL_TOP); ground(WALL_X - X0 + WALL_W, 3100);
  prop('bench', 150); prop('mirror', 60, Y - 250); prop('mirror', 420, Y - 250); prop('dumbbells', 280); prop('dumbbells', 520);
  prop('poster', 740, Y - 330, 'NO PAIN NO GAIN'); prop('window', 900, Y - 360);
  // (well clear of his bench: he gets up before anything comes at him)
  spawn('suit', 640, 'free'); spawn('suit', 770, 'free'); spawn('suit', 890, 'free');

  // ============ 2. THE CARDIO FLOOR ============
  // Treadmills and bikes along the wall; a line of them comes running down it at him, one behind the other
  prop('treadmill', 1000); prop('treadmill', 1150); prop('bike', 1300); prop('treadmill', 1420);
  prop('poster', 1220, Y - 340, 'SWEAT IS FAT CRYING'); prop('window', 1500, Y - 360);
  spawn('temp', 1300, 'cardio'); spawn('temp', 1360, 'cardio'); spawn('temp', 1420, 'cardio'); spawn('temp', 1480, 'cardio');
  pickup(1440, Y - 30, 'small_health');
  // (and at the end of it, the one who won't come out from behind his mat: a way out in front of the half-wall, so
  // there's a good long shove into it)
  spawn('cower', 1500, 'wall');

  // ============ 3. UNDER THE BENCHES ============
  // The benches in a row, and the gym rats (real ones) scurrying between them, under where a bullet goes
  prop('bench', 1880); prop('bench', 2010); prop('bench', 2140); prop('fountain', 2290, Y);
  prop('poster', 2205, Y - 330, 'NO RATS ALLOWED');
  // (they come running out of the rat hole at the end of the benches once he's a way past the wall: these are where
  // they'd be, in order, for a respawn past them)
  spawn('rat', 1980, 'benches'); spawn('rat', 2050, 'benches'); spawn('rat', 2120, 'benches'); spawn('rat', 2190, 'benches');

  // ============ 4. THE PLATE RACKS ============
  // Two tall racks of plates, a pencil neck up on top of each one (hiding up there), right over his head
  ledge(2340, Y - 100, 150, 'rack'); ledge(2600, Y - 100, 150, 'rack');
  prop('squat', 2850); prop('poster', 2480, Y - 340, 'LIFT HEAVY'); prop('window', 2700, Y - 360);
  spawn('suit', 2415, 'racks', Y - 100); spawn('suit', 2675, 'racks', Y - 100);
  pickup(2900, Y - 30, 'small_health');

  // ============ 5. THE MEZZANINE ============
  // Steps up to it, and from the edge of it, a crowd of them bunched up underneath: down on their heads
  ledge(3000, Y - 100, 100, 'step');
  ground(3100, 3300, MEZZ_Y);
  ground(3300, 4200);
  prop('cable', 3200, MEZZ_Y); prop('bag', 3520, Y);
  // (and where a dive kick off the edge comes down, a striking dummy: it takes a dive kick, or a charge, all day long)
  dummies.push(X0 + 3480);
  spawn('suit', 3560, 'mezzanine'); spawn('temp', 3610, 'mezzanine'); spawn('suit', 3660, 'mezzanine'); spawn('suit', 3720, 'mezzanine');

  // ============ 6. THE LOCKER ROOM DOORS ============
  // Two of them behind their briefcases, backed up against the wall by the doors
  spawn('clerk', 3880, 'lockers'); spawn('suit', 3950, 'lockers'); spawn('clerk', 4040, 'lockers');
  prop('poster', 3720, Y - 330, 'WIPE DOWN YOUR BENCH');

  return { runs, ledges, spawns, pickups, props, dummies };
};

const course = () => {
  const { runs, ledges, spawns, pickups, props, dummies } = build();
  return {
    runs, ledges, spawns, pickups, props,
    /** Where the striking dummies stand (never down, never hitting back: something to practise on). */
    dummies,
    /** The wall at the left (behind his bench), and the locker room's double doors at the right, where it ends. */
    x1: X0 - 200, x2: X0 + 4200,
    doors: X0 + 4120,
    /** Where each room starts (its lesson comes up as he gets there). */
    /**
     * Rooms whose lot only turn up once he's got this far (the pacing: one thing at a time): the rats come out from under
     * the benches a way past the wall, and the ones on the racks drop through the ceiling a little past the rats.
     */
    arrivals: { benches: X0 + 1870, racks: X0 + 2250 } as Partial<Record<Room, number>>,
    rooms: { free: X0 + 200, cardio: X0 + 940, wall: X0 + 1480, benches: X0 + 1760, racks: X0 + 2220, mezzanine: X0 + 2960, lockers: X0 + 3780 } as Record<Room, number>,
    checkpoints: [{ x: X0 + 150, y: Y }, { x: X0 + 1790, y: Y }, { x: X0 + 2960, y: Y }],
    left: X0 - 1000,
    startX: X0 + 100,
  };
};

export const COURSE = course();
