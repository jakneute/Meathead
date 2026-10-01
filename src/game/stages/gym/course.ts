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
export type Room = 'free' | 'cardio' | 'benches' | 'racks' | 'mezzanine' | 'lockers';

export interface Spawn { kind: EnemyKind; x: number; y: number; room: Room }
export interface PickupSpot { x: number; y: number; type: 'small_health' | 'large_health' | 'small_ammo' | 'large_ammo' }
/** Something to stand on that you can jump up through: the top of a plate rack, a step up to the mezzanine. */
export interface Ledge { x: number; y: number; w: number; look: 'rack' | 'step' }
/** The gym's things, for the drawing (no bearing on the game). */
export interface Prop { look: 'bench' | 'squat' | 'dumbbells' | 'treadmill' | 'bike' | 'mirror' | 'poster' | 'fountain' | 'cable' | 'bag' | 'window'; x: number; y: number; text?: string }

const X0 = BOSS_DOOR_X - 4600;
const Y = GROUND_Y;
/** The mezzanine's floor (up the steps), and how far it runs. */
export const MEZZ_Y = Y - 200;

const build = () => {
  const runs: GroundRun[] = [], ledges: Ledge[] = [], spawns: Spawn[] = [], pickups: PickupSpot[] = [], props: Prop[] = [];
  const ground = (x1: number, x2: number, y1 = Y, y2 = y1) => { runs.push({ x1: X0 + x1, y1, x2: X0 + x2, y2 }); };
  const ledge = (x: number, y: number, w: number, look: Ledge['look']) => { ledges.push({ x: X0 + x, y, w, look }); };
  const spawn = (kind: EnemyKind, x: number, room: Room, y = Y) => { spawns.push({ kind, x: X0 + x, y, room }); };
  const pickup = (x: number, y: number, type: PickupSpot['type']) => { pickups.push({ x: X0 + x, y, type }); };
  const prop = (look: Prop['look'], x: number, y = Y, text?: string) => { props.push({ look, x: X0 + x, y, text }); };

  // ============ 1. THE FREE WEIGHTS ============
  // His bench (where the cutscene left him), the dumbbell rack along the mirror, three of them stood about with pistols
  ground(-200, 3100);
  prop('bench', 150); prop('mirror', 60, Y - 250); prop('mirror', 420, Y - 250); prop('dumbbells', 280); prop('dumbbells', 520);
  prop('poster', 740, Y - 330, 'NO PAIN NO GAIN'); prop('window', 900, Y - 360);
  spawn('suit', 560, 'free'); spawn('suit', 720, 'free'); spawn('suit', 860, 'free');

  // ============ 2. THE CARDIO FLOOR ============
  // Treadmills and bikes along the wall; a line of them comes running down it at him, one behind the other
  prop('treadmill', 1000); prop('treadmill', 1150); prop('bike', 1300); prop('treadmill', 1420);
  prop('poster', 1220, Y - 340, 'SWEAT IS FAT CRYING'); prop('window', 1500, Y - 360);
  spawn('temp', 1300, 'cardio'); spawn('temp', 1360, 'cardio'); spawn('temp', 1420, 'cardio'); spawn('temp', 1480, 'cardio');
  pickup(1590, Y - 30, 'small_health');

  // ============ 3. UNDER THE BENCHES ============
  // The benches in a row, and the gym rats (real ones) scurrying between them, under where a bullet goes
  prop('bench', 1750); prop('bench', 1900); prop('bench', 2050); prop('fountain', 2160, Y);
  prop('poster', 1880, Y - 330, 'NO RATS ALLOWED');
  spawn('rat', 1820, 'benches'); spawn('rat', 1900, 'benches'); spawn('rat', 1990, 'benches'); spawn('rat', 2080, 'benches');

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
  spawn('suit', 3380, 'mezzanine'); spawn('temp', 3430, 'mezzanine'); spawn('suit', 3480, 'mezzanine'); spawn('suit', 3560, 'mezzanine');

  // ============ 6. THE LOCKER ROOM DOORS ============
  // Two of them behind their briefcases, backed up against the wall by the doors
  spawn('clerk', 3800, 'lockers'); spawn('suit', 3880, 'lockers'); spawn('clerk', 4000, 'lockers');
  prop('poster', 3720, Y - 330, 'WIPE DOWN YOUR BENCH');

  return { runs, ledges, spawns, pickups, props };
};

const course = () => {
  const { runs, ledges, spawns, pickups, props } = build();
  return {
    runs, ledges, spawns, pickups, props,
    /** The wall at the left (behind his bench), and the locker room's double doors at the right, where it ends. */
    x1: X0 - 200, x2: X0 + 4200,
    doors: X0 + 4120,
    /** Where each room starts (its lesson comes up as he gets there). */
    rooms: { free: X0 + 200, cardio: X0 + 940, benches: X0 + 1640, racks: X0 + 2220, mezzanine: X0 + 2960, lockers: X0 + 3640 } as Record<Room, number>,
    checkpoints: [{ x: X0 + 150, y: Y }, { x: X0 + 1640, y: Y }, { x: X0 + 2960, y: Y }],
    left: X0 - 1000,
    startX: X0 + 100,
  };
};

export const COURSE = course();
