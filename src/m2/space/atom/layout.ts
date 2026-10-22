// The giant atom (backstage), laid out: where everything is, and its rigs' timing (shared by the section's running,
// index.ts and rigs.ts, and its painting, art.ts).
//
//   the stage door    A+0..A+500     in from the square (the giant atom's CAST MEMBERS ONLY door)
//   THE THRUSTERS     A+600..A+2150  a prop rocket on a test stand, its engine blasting along the floor (teach); then two
//                                    hung nose-up on a gantry, blasting down, out of step (escalate)
//   THE METEORS       A+2300..A+3650 prop meteors on chains, swinging (one, then two out of step); the meteor shower rig
//                                    dropping them on cables (three, in turn)
//   THE AIRLOCKS      A+3750..A+4850 the space station set's airlock doors, slamming (one; then two with the
//                                    decompression air cannon blowing him back into them)
//   THE LASER SHOW    A+4950..A+6050 fog and blacklight; a laser across the floor, ankle-high then head-high by turns;
//                                    then one off the ceiling, sweeping the floor
//   THE LINE          A+6100..A+7500 out a backstage door into the queue's last stretch; along the line to the front;
//                                    the load platform, the operator, a star sled (THE HIJACK)
//
// Each rig has a stagehand at its controls (`post`): dead, it stops (and stays stopped: state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import { SECTIONS, GY } from '../geometry';

export const { x0, x1 } = SECTIONS.atom;
export const A = x0;

// ---------------------------------------------------------------------------------------------------------------
// The rigs

/** A rocket's engine, really firing: `dir` the way the flame goes, from its nozzle (x, y), this long, this wide. On
 *  for `on` frames of every `cycle` from `phase`; the last TELL frames before that it sputters. Run by `post`. */
export interface Thruster { x: number; y: number; dir: 'left' | 'down'; len: number; wide: number; cycle: number; on: number; phase: number; post: number }
export const THRUST_TELL = 44;
export const THRUSTERS: Thruster[] = [
  // (lying on its test stand, its nozzle toward him: the flame along the floor, at him)
  { x: A + 1010, y: GY - 30, dir: 'left', len: 290, wide: 44, cycle: 190, on: 62, phase: 0, post: 1 },
  // (two hung nose-up on the gantry, blasting the floor, out of step)
  { x: A + 1640, y: GY - 270, dir: 'down', len: 270, wide: 64, cycle: 150, on: 50, phase: 0, post: 2 },
  { x: A + 1880, y: GY - 270, dir: 'down', len: 270, wide: 64, cycle: 150, on: 50, phase: 75, post: 2 },
];
/** The test stand's rocket: lying on its side, solid (stand on it, over its nozzle). */
export const ROCKET_BODY = { x: A + 1010, y: GY - 64, w: 250, h: 64 };

/** Where in its cycle a thruster is: off, sputtering (the tell, 0..1), firing. */
export const thrustAt = (t: Thruster, frame: number) => {
  const c = ((frame + t.phase) % t.cycle + t.cycle) % t.cycle, offFor = t.cycle - t.on;
  if (c >= offFor) return { fire: true, tell: 0 };
  return { fire: false, tell: c >= offFor - THRUST_TELL ? (c - (offFor - THRUST_TELL)) / THRUST_TELL : 0 };
};
/** A thruster's flame (world box). */
export const flameBox = (t: Thruster) => (t.dir === 'left'
  ? { x: t.x - t.len, y: t.y - t.wide / 2, w: t.len, h: t.wide }
  : { x: t.x - t.wide / 2, y: t.y, w: t.wide, h: t.len });

/** A prop meteor swinging on its chain: the pivot, the chain's length, its swing (radians either way), its period. */
export interface Swing { x: number; y: number; len: number; amp: number; period: number; phase: number; r: number }
export const SWINGS: Swing[] = [
  { x: A + 2600, y: GY - 400, len: 340, amp: 0.85, period: 170, phase: 0, r: 34 },
  { x: A + 2960, y: GY - 400, len: 340, amp: 0.8, period: 170, phase: 85, r: 34 },
  { x: A + 3230, y: GY - 400, len: 340, amp: 0.8, period: 170, phase: 0, r: 34 },
];
export const swingAngle = (s: Swing, frame: number) => Math.sin(((frame + s.phase) / s.period) * Math.PI * 2) * s.amp;
export const swingBall = (s: Swing, frame: number) => { const a = swingAngle(s, frame); return { x: s.x + Math.sin(a) * s.len, y: s.y + Math.cos(a) * s.len, a }; };

/** The meteor shower rig: meteors on cables off a trolley over the floor, dropped in turn (the winch: post 3). Each:
 *  where, its turn in the cycle. */
export const SHOWER = { x: A + 3420, post: 3, cycle: 200, drop: [0, 50, 100], xs: [A + 3360, A + 3450, A + 3540], top: GY - 330, r: 28 };
/** A shower meteor's height off the floor (its bottom), in its cycle: up, the rattle (tell), the drop, sat, winched up. */
export const SHOWER_TELL = 30, SHOWER_FALL = 10, SHOWER_SIT = 40, SHOWER_UP = 50;
export const showerAt = (k: number, frame: number) => {
  const c = ((frame - SHOWER.drop[k]) % SHOWER.cycle + SHOWER.cycle) % SHOWER.cycle;
  const H = SHOWER.top;
  if (c < SHOWER_TELL) return { y: H, tell: c / SHOWER_TELL, falling: false, down: false };
  let u = c - SHOWER_TELL;
  if (u < SHOWER_FALL) return { y: H + (GY - H) * (u / SHOWER_FALL) ** 2, tell: 0, falling: true, down: false };
  u -= SHOWER_FALL;
  if (u < SHOWER_SIT) return { y: GY, tell: 0, falling: false, down: true };
  u -= SHOWER_SIT;
  if (u < SHOWER_UP) return { y: GY - (GY - H) * (u / SHOWER_UP), tell: 0, falling: false, down: false };
  return { y: H, tell: 0, falling: false, down: false };
};

/** The space station set's airlock doors: a slab off the ceiling, slammed down on a cycle (the red light first). */
export interface Airlock { x: number; w: number; cycle: number; phase: number }
export const AIRLOCK_TOP = GY - 300, AIRLOCK_WARN = 34, AIRLOCK_SLAM = 7, AIRLOCK_SHUT = 56, AIRLOCK_RAISE = 44;
export const AIRLOCKS: Airlock[] = [
  { x: A + 4000, w: 56, cycle: 210, phase: 0 },
  { x: A + 4330, w: 56, cycle: 210, phase: 70 },
  { x: A + 4640, w: 56, cycle: 210, phase: 140 },
];
export const AIRLOCK_POST = 4;
/** Where an airlock door is in its cycle: how far down (0 up, 1 shut), the warning (0..1), slamming. */
export const airlockAt = (d: Airlock, frame: number, crewed: boolean) => {
  if (!crewed) return { down: 0, warn: 0, slamming: false };
  const c = ((frame + d.phase) % d.cycle + d.cycle) % d.cycle;
  const open = d.cycle - AIRLOCK_WARN - AIRLOCK_SLAM - AIRLOCK_SHUT - AIRLOCK_RAISE;
  if (c < open) return { down: 0, warn: 0, slamming: false };
  let u = c - open;
  if (u < AIRLOCK_WARN) return { down: 0, warn: u / AIRLOCK_WARN, slamming: false };
  u -= AIRLOCK_WARN;
  if (u < AIRLOCK_SLAM) return { down: (u / AIRLOCK_SLAM) ** 2, warn: 1, slamming: true };
  u -= AIRLOCK_SLAM;
  if (u < AIRLOCK_SHUT) return { down: 1, warn: 1, slamming: false };
  u -= AIRLOCK_SHUT;
  return { down: 1 - u / AIRLOCK_RAISE, warn: 0, slamming: false };
};
/** The decompression effect: an air cannon on the far wall, blowing back down the room (from x0 to x1), on a cycle. */
export const CANNON = { x: A + 4820, from: A + 3920, cycle: 240, on: 110, tell: 40, push: 3.4 };
export const cannonAt = (frame: number, crewed: boolean) => {
  if (!crewed) return { blow: 0, tell: 0 };
  const c = ((frame + 40) % CANNON.cycle + CANNON.cycle) % CANNON.cycle, off = CANNON.cycle - CANNON.on;
  if (c >= off) return { blow: Math.min(1, (c - off) / 10, (CANNON.cycle - c) / 10), tell: 0 };
  return { blow: 0, tell: c >= off - CANNON.tell ? (c - (off - CANNON.tell)) / CANNON.tell : 0 };
};

/** The laser show: one off a stand across the floor (ankle-high, then head-high, by turns), then one off the ceiling
 *  sweeping the floor. The laser desk: post 5. */
export const LASER_POST = 5;
export const FLOOR_LASER = { x: A + 5440, from: A + 5000, cycle: 130, tell: 40, on: 46, low: GY - 14, high: GY - 58 };
export const floorLaserAt = (frame: number, crewed: boolean) => {
  if (!crewed) return { tell: 0, on: false, high: false };
  const n = Math.floor(frame / FLOOR_LASER.cycle), c = frame % FLOOR_LASER.cycle, off = FLOOR_LASER.cycle - FLOOR_LASER.on;
  const high = n % 2 === 1;
  if (c >= off) return { tell: 0, on: true, high };
  return { tell: c >= off - FLOOR_LASER.tell ? (c - (off - FLOOR_LASER.tell)) / FLOOR_LASER.tell : 0, on: false, high };
};
/** The sweeping one: off the ceiling at (x, y), its spot on the floor sweeping from x0 to x1 and back. */
export const SWEEP_LASER = { x: A + 5900, y: GY - 330, x0: A + 5520, x1: A + 5860, period: 220 };
/** The sweeping laser's on the blink (a bad connection): in stretches of `seg` frames, live or dead by a roll (about half
 *  live, never two dead in a row more than twice), sputtering (harmless, a tell) the last few frames before it comes back
 *  on. `live`: it burns; `sputter`: it flickers, harmless. */
const SWEEP_SEG = 40, SPUTTER = 16;
const segRoll = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const segLive = (n: number) => segRoll(n) < 0.5 || (segRoll(n - 1) >= 0.5 && segRoll(n - 2) >= 0.5);
export const sweepState = (frame: number) => {
  const n = Math.floor(frame / SWEEP_SEG), k = frame - n * SWEEP_SEG, live = segLive(n);
  return { live, sputter: !live && segLive(n + 1) && k >= SWEEP_SEG - SPUTTER && (k >> 1) % 2 === 0 };
};
export const sweepSpot = (frame: number) => SWEEP_LASER.x0 + (SWEEP_LASER.x1 - SWEEP_LASER.x0) * (0.5 - 0.5 * Math.cos((frame / SWEEP_LASER.period) * Math.PI * 2));

/** The fog machines (by the laser show) and the blacklight's stretch. */
export const FOG_XS = [A + 4990, A + 5560];
export const BLACKLIGHT = { x0: A + 4920, x1: A + 6080 };

// ---------------------------------------------------------------------------------------------------------------
// The line, and the platform

/** The backstage door out into the queue; the line (along the back of it), the merge, the platform, the console, the
 *  sled at the platform; where the hijack starts; the end wall (the tunnel mouth). */
export const QUEUE_DOOR = A + 6100, LINE_X0 = A + 6180, LINE_X1 = A + 6880, PLATFORM_X = A + 6900;
export const CONSOLE_X = A + 7010, SLED_X = A + 7230, HIJACK_AT = A + 6940, TUNNEL_X = A + 7420;
/** The people in line (along the back rail, in two rows: back and front of the switchback), by seed. */
export const QUEUE: { x: number; seed: number; row: 0 | 1 }[] = [];
for (let i = 0, x = LINE_X0 + 10; x < LINE_X1 - 10; i++) {
  const seed = 4001 + i * 337;
  QUEUE.push({ x, seed, row: (i % 2) as 0 | 1 });
  x += 30 + (seed % 23);
}

// ---------------------------------------------------------------------------------------------------------------
// The floor's furniture

/** Ledges (one-way: catwalks, crates, the rigs' platforms): [x, y, w]. */
export const LEDGES: [number, number, number][] = [
  // the thrusters: the catwalk over the test stand, a step up to it
  [A + 700, GY - 120, 110], [A + 1360, GY - 190, 200],
  [A + 2040, GY - 150, 120],
  // the meteors: a rigger's perch between the swings, crates
  [A + 3060, GY - 205, 120], [A + 2760, GY - 110, 90],
  // the shower's winch platform
  [A + 3600, GY - 140, 140],
  // the airlocks: the control booth's step
  [A + 4740, GY - 120, 140],
  // the laser desk's riser
  [A + 5960, GY - 90, 160],
  // the queue's rail (the switchback's top rail: hop it)
  [A + 6400, GY - 70, 160],
];
/** Solid boxes: [x, top, w] (down to the floor). */
export const SOLIDS: [number, number, number][] = [
  [ROCKET_BODY.x, ROCKET_BODY.y, ROCKET_BODY.w],
  // (crates by the shower)
  [A + 3700, GY - 70, 70],
  // (the end wall: the tunnel's mouth past the sled)
  [TUNNEL_X + 40, GY - 800, 200],
];

/** The stagehands at the rigs' controls: [post, x, the floor under them, facing]. */
export const POSTS: [number, number, number, 1 | -1][] = [
  [1, A + 1320, GY, -1], [2, A + 2080, GY - 150, -1], [3, A + 3650, GY - 140, -1], [4, A + 4800, GY - 120, -1], [5, A + 6020, GY - 90, -1],
];
/** The cast members in costume (the moon landing's astronauts, with the flag; the friendly martians) and the riggers
 *  (up on the catwalks, throwing wrenches): [kind, x, floor]. None started in a rig's way, but each stood by one (the
 *  rigs hit them too: lure or shove them in), none at a checkpoint:
 *    the thrusters: a flag just short of the test stand's flame; the rigger lobbing off the catwalk; a flag in the gap
 *      between the gantry's two blasts (under the catwalk's end)
 *    the meteors: up on the crate and the perch (the floor's all swept)
 *    the airlocks: a martian and a flag side by side between the first two doors (the dive-kick counter and the charge
 *      counter at once; the air cannon blows them back into the door too), a flag between the next two
 *    the laser show: a flag in the fog in the floor laser's run, two martians under the sweep */
export const CAST: ['flag' | 'martian' | 'rigger', number, number][] = [
  ['flag', A + 640, GY], ['rigger', A + 1450, GY - 190], ['flag', A + 1760, GY],
  ['martian', A + 2790, GY - 110], ['rigger', A + 3110, GY - 205],
  ['martian', A + 4130, GY], ['flag', A + 4240, GY], ['flag', A + 4480, GY],
  ['flag', A + 5300, GY], ['martian', A + 5560, GY], ['martian', A + 5700, GY],
];

// ---------------------------------------------------------------------------------------------------------------
// What's kept across his deaths (state.stageMemo)

/** The posts whose stagehand is dead (their rig's stopped for good). */
export const CREW_MEMO = 'm2:atomCrewDead';
/** The hijack's happened (the line's been cut, the sled taken). */
export const HIJACK_MEMO = 'm2:atomHijacked';
export const deadPosts = (state: GameState) => new Set((state.stageMemo[CREW_MEMO] ?? '').split(',').filter(Boolean).map(Number));
export const markPostDead = (state: GameState, post: number) => {
  const s = deadPosts(state); s.add(post);
  state.stageMemo[CREW_MEMO] = [...s].join(',');
};
