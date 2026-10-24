// Steve's posse: the stunt cars (the user's design). Every number that matters is up top, to tune.
//
//   RED    out of an upstage door (either end: they come both ways), along the floor at him, fast; close in, the
//          handbrake: a DRIFT, the car swung sideways and sliding along the play plane into him (jump it), or now and
//          then a swing right round him (in front of him, behind him: the near miss, the crowd eats it up); then off
//          into the back lane and out the far door.
//   BLUE   along the back lane to one of MANY RAMPS (both ways; every one always creeping somewhere along the back
//          lane, half the time lining its jump up on him, so no two jumps go off from the same place), up it, through
//          the HULA HOOP hung over that jump's top on its trolley, and down on him (its shadow and a mark on the floor
//          where it'll come down); a miss bounces and skids off out the far door.
//
// What they do to him: knockback more than damage. Every side of a car hurts but its roof (the nose, the sides, the
// back, a blue car's underside coming down on him). Any car that hits him launches him (big, tumbling: his own
// controls back when he's down), a little hurt; in his breather, still launched, no hurt. A car that hits him HEAD-ON
// (its nose, going at him) blows up (only he's hurt by it: not other cars, not Steve). On a car's roof he's carried
// harmlessly (the driver tries to scrape him off on the far wall: still on it when it hits, he's hurt). Never out of
// the arena: its walls and the truss over it hold him in.
//
// Bulked up (the spellbook), he can pick a car up off the floor (the grab's critter throw: it's a critter then) and
// throw it; at Steve, it's a big hit (fight.ts). The spellbook's storm in here: METEORS for the red cars (blown up),
// COMETS for the blue (stopped dead in the air, frozen, shattered): fight.ts picks.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { buffs } from '../../../m1/game/core/buffs';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { grabHolding, grabBusy } from '../../moves/grab';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { ARENA_L, ARENA_R, GY, BACK_Z, LANE_BACK, LANE_FRONT, DOORS_X, CEIL_Y } from './arena';
import { CAR, extents, roofExtent, drawCar, type CarColor } from './carArt';
import type { Car, Ramp, Skid } from './state';
import { HURT, GRAB_CAR } from './lines';

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** Red cars: top speed; frames out of the door onto the floor; how far off him the drift starts; how fast the slide
 *  dies off (a frame); the longest a drift lasts; how often it's a swing round him instead; the swing's size (along,
 *  in depth) and speed (radians a frame). */
export const RED = { V: 10.5, ENTER_T: 44, DRIFT_AT: 205, DECAY: 0.955, DRIFT_T: 50, ORBIT: 0.25, ORBIT_R: 135, ORBIT_RZ: 98, ORBIT_W: 0.09 };
/** Blue cars: speed to the ramp, the launch (along, up), gravity in the air. */
export const BLUE = { V: 9, VX: 8.5, VY: -12.5, G: 0.42 };
/** The ramps: how long (along the floor), the lip's height, how fast they creep after him. */
export const RAMP = { LEN: 130, H: 52, V: 3.2 };
/** What a car does to him: hurt (before the land's softening), and the launch (along, up). */
export const HIT = {
  HEADON: { dmg: 10, vx: 15, vy: -14 },
  DRIFT: { dmg: 6, vx: 12, vy: -11 },
  LAND: { dmg: 10, vx: 12, vy: -15 },
  WALL: { dmg: 8, vx: 10, vy: -12 },
};
/** A launch: the drag on it a frame; no other car gets him this long into one (no pinball). */
const LAUNCH_DRAG = 0.992, LAUNCH_SAFE = 14;
/** The tell before one comes out of a garage (frames: its headlights on in the dark, the door going up, the engine
 *  revving): it comes out this much later than it's sent (the pacing's otherwise as it was). */
export const TELL = 52;
/** Thrown (bulked up): gravity on it; how long a wreck burns before it's dragged off; frozen before it shatters. */
const THROWN_G = 0.32, WRECK_T = 170, FROZEN_T = 28;

/** How far a jump goes (the lip to where it comes down), and the hoop at its top. */
const airTime = () => (-BLUE.VY + Math.sqrt(BLUE.VY * BLUE.VY + 2 * BLUE.G * RAMP.H)) / BLUE.G;
export const JUMP = BLUE.VX * airTime();
const APEX_T = -BLUE.VY / BLUE.G;
export const hoopOf = (r: Ramp) => ({
  x: r.x + r.dir * BLUE.VX * APEX_T,
  y: GY - RAMP.H - (BLUE.VY * BLUE.VY) / (2 * BLUE.G) - CAR.CAB * 0.5,
  z: LANE_BACK * (1 - APEX_T / airTime()),
});
/** Where a ramp's lip can go (its foot inside the arena, its landing inside the arena). */
const rampRange = (dir: 1 | -1) => (dir > 0 ? [ARENA_L + RAMP.LEN + 60, ARENA_R - JUMP - 60] : [ARENA_L + JUMP + 60, ARENA_R - RAMP.LEN - 60]);
/** Where a jump off it comes down. */
export const landingOf = (r: Ramp) => r.x + r.dir * JUMP;

// ---------------------------------------------------------------------------------------------------------------
// The cars' bodies (the engine's: shots and spells hit them; he can pick one up bulked up). Drawn here, not by it.

const BIG = 100000;
export const CAR_KIND = 'm2:stunt_car', CAR_LOOSE = 'm2:stunt_car_loose';
const carOfEnemy = new WeakMap<Enemy, Car>();
export const carOf = (e: Enemy) => carOfEnemy.get(e) ?? null;
for (const [kind, grab] of [[CAR_KIND, 'none'], [CAR_LOOSE, 'critter']] as const) {
  registerM2Kind({
    kind, stats: { w: CAR.L, h: CAR.CAB, hp: BIG, contact: 0, mass: 1400, air: true },
    make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
    gender: 'n', robot: true, grab, midBoss: true,
    // (his moves on it: nothing of the engine's; cars.ts has its say over him touching one)
    touch: () => true,
    // (in his hands: up over his head, one-handed; everywhere else, the fight draws it)
    draw: (c, e) => { const car = carOf(e); if (car && grabHolding() === e) drawCar(c, { color: car.color, x: 0, y: 0, z: 0, yaw: 0, driver: true }); },
    ai: () => true,
  });
  TOO_BIG_BY_KIND[kind] = GRAB_CAR;
}
for (const [source, h] of Object.entries(HURT)) registerHurtLines(source, h.hurt, h.death);

// ---------------------------------------------------------------------------------------------------------------
// The garage: everything the cars need to know about the fight

export interface Launch { vx: number; t: number; lastX: number }
export interface Garage {
  cars: Car[]; ramps: Ramp[]; skids: Skid[]; nextId: number;
  /** Him flying (launched by a car), and the crowd's excitement (0..1). */
  launch: Launch | null; hype: number;
  /** Phase 3: the hoops on fire. */
  hot: boolean;
  /** The garage doors (arena.ts DOORS_X): how far up each one is (0 down, 1 all the way up). */
  doorOpen: number[];
  /** Steve's box (for a thrown car), and what happens when one gets him (fight.ts). */
  steveBox: () => { x0: number; x1: number; y0: number; y1: number } | null;
  onThrownHit: (ctx: FrameContext, car: Car) => void;
  /** Something for the crowd to whoop at (the fight puts the words up). */
  onCrowd: (ctx: FrameContext, x: number, what: 'ooh' | 'boom' | 'wow') => void;
}

/** Many ramps (the user's), both ways, spread along the back lane, every one always on the move. */
export const RAMPS_N = 5;
export const newRamps = (): Ramp[] => Array.from({ length: RAMPS_N }, (_, i) => {
  const dir = (i % 2 ? -1 : 1) as 1 | -1, [lo, hi] = rampRange(dir);
  const x = lo + ((hi - lo) * (i + 0.5)) / RAMPS_N;
  return { x, dir, lockT: 0, to: x, v: RAMP.V };
});

const AWAY = GY + 4000;
const newRoof = (state: GameState): Block => {
  const b = { x: 0, y: AWAY, w: 60, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'stunt-roof' } as Block;
  state.blocks.push(b);
  return b;
};
const dirYaw = (dir: 1 | -1) => (dir > 0 ? 0 : Math.PI);
const angDiff = (a: number, b: number) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
const turnTo = (car: Car, yaw: number, k: number) => { car.yaw += angDiff(car.yaw, yaw) * k; };
const ease = (k: number) => 1 - (1 - k) * (1 - k);

const newCar = (state: GameState, g: Garage, color: CarColor, x: number, z: number, dir: 1 | -1): Car => {
  const e = makeKindEnemy(CAR_KIND as EnemyKind, x, GY);
  e.seen = true; e.facing = dir;
  const car: Car = {
    id: ++g.nextId, color, e, roof: newRoof(state), x, y: GY, z, vx: 0, vy: 0, yaw: Math.PI / 2, pitch: 0,
    dir, speed: 3, mode: color === 'red' ? 'enter' : 'approach', t: 0,
    plan: 'none', swing: Math.random() < 0.5 ? 1 : -1, ox: 0, ang: 0,
    ramp: -1, airT: 0, airTotal: 1, z0: 0, rider: false, hit: false, crumple: 0, ice: 0, burnt: 0, wheel: 0, fade: 0,
    hold: TELL,
  };
  carOfEnemy.set(e, car);
  // (in the world only once it's out of its garage: the tell first, the engine revving in there, now and then a horn)
  g.cars.push(car);
  playSound('carroar', 0.5, Math.random() * 4 - 2);
  if (Math.random() < 0.45) playSound('horn', 0.3, color === 'red' ? 4 : 8);
  return car;
};

/** A red car out of a door (`doorX`), going `dir`, to drift into him (or swing round him). */
export const spawnRed = (state: GameState, g: Garage, doorX: number, dir: 1 | -1, plan?: 'drift' | 'orbit') => {
  const car = newCar(state, g, 'red', doorX, BACK_Z, dir);
  car.plan = plan ?? (Math.random() < RED.ORBIT ? 'orbit' : 'drift');
  return car;
};
/** A tow car (Steve's way out): out of the door, into the front lane, slow till he's on the rope (fight.ts). */
export const spawnTow = (state: GameState, g: Garage, doorX: number, dir: 1 | -1) => {
  const car = newCar(state, g, 'red', doorX, BACK_Z, dir);
  car.mode = 'tow'; car.plan = 'none'; car.speed = 2;
  return car;
};
/** A blue car for ramp `i`: out of a door behind it (or out of the dark upstage, if there's no door far enough
 *  back). Null if the ramp's busy. */
export const spawnBlue = (state: GameState, g: Garage, i: number) => {
  const r = g.ramps[i];
  if (r.lockT > 0) return null;
  const foot = r.x - r.dir * RAMP.LEN;
  const behind = DOORS_X.filter(d => (foot - d) * r.dir > 220 && (foot - d) * r.dir < 700).sort((a, b) => (foot - a) * r.dir - (foot - b) * r.dir)[0];
  const from = behind ?? Math.max(ARENA_L + 50, Math.min(ARENA_R - 50, foot - r.dir * 320));
  const car = newCar(state, g, 'blue', from, BACK_Z, r.dir);
  car.ramp = i; r.lockT = 1;
  return car;
};
/** The ramp to send the next blue car off: the free one whose jump comes down nearest him right now (they're always
 *  moving, so it's somewhere different every time); -1 if they're all busy. */
export const pickRamp = (g: Garage, x: number) => {
  let best = -1, bd = Infinity;
  g.ramps.forEach((r, i) => { if (r.lockT > 0) return; const d = Math.abs(landingOf(r) - x) + Math.random() * 120; if (d < bd) { bd = d; best = i; } });
  return best;
};

// ---------------------------------------------------------------------------------------------------------------
// Him: launched

export const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
/**
 * Sent flying: a little hurt (none in his breather), a lot of launch. Tumbling till he's down; never out of the arena.
 */
export const launchHim = (ctx: FrameContext, g: Garage, vx: number, vy: number, dmg: number, source: string) => {
  const { state } = ctx, p = state.player;
  if (p.health <= 0 || state.deathTimer > 0) return;
  const hurt = dmg > 0 && p.invincibilityTimer <= 0 && !p.noContactHurt;
  if (hurt) hurtPlayer(ctx, dmg, source, { x: vx, y: vy }, 10);
  if (p.health <= 0) return;
  // (in the middle of a grab, he's armored: hurt, not knocked about)
  if (grabBusy()) return;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.vel.x = vx; p.vel.y = vy; p.isGrounded = false; p.pos.y -= 3; p.jumpHoldTimer = 0;
  p.pushbackTimer = Math.max(p.pushbackTimer, 6);
  p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 };
  g.launch = { vx, t: 0, lastX: p.pos.x };
  g.hype = 1;
  ctx.fx.spawnDamageNumber({ x: p.pos.x - 10, y: p.pos.y - 30 }, vy < -13 ? 'AIRBORNE!' : 'LAUNCHED!', true, '#FDE047');
  playSound('whoosh', 1, -6);
};
/** Each frame he's flying: his way kept (the engine would slow him), off the walls, till he's down. */
export const tickLaunch = (ctx: FrameContext, g: Garage) => {
  const { state } = ctx, p = state.player, L = g.launch;
  if (!L) return;
  L.t++;
  if (p.health <= 0 || state.deathTimer > 0) { g.launch = null; p.freefall = undefined; return; }
  if ((p.isGrounded && L.t > 3) || L.t > 300) {
    g.launch = null; p.freefall = undefined; p.pushbackTimer = Math.min(p.pushbackTimer, 4);
    playSound('thud', 0.8, -4); shakeScreen(state, 5, 3);
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 2 }, life: 22, color: 'rgba(168, 162, 158, 0.7)', size: 4 + Math.random() * 4 });
    return;
  }
  // (into a wall: a thump, back off it a little)
  if (L.t > 2 && Math.abs(p.pos.x - L.lastX) < 0.3 && Math.abs(L.vx) > 2) { L.vx = -L.vx * 0.35; playSound('thud', 1, -6); shakeScreen(state, 6, 4); }
  L.lastX = p.pos.x;
  // (his head on the truss)
  if (p.pos.y < CEIL_Y + 50 && p.vel.y < 0) { p.vel.y = 1; playSound('clang', 0.7, -4); }
  L.vx *= LAUNCH_DRAG;
  p.vel.x = L.vx;
  p.pushbackTimer = Math.max(p.pushbackTimer, 2);
  if (p.freefall) { p.freefall.t++; p.freefall.rot += 0.2 * (Math.sign(L.vx) || 1); }
};

// ---------------------------------------------------------------------------------------------------------------
// The ramps: creeping along the back lane, lining the jump up on him (held still once a car's committed to one)

export const updateRamps = (state: GameState, g: Garage, aimX: number) => {
  for (const [i, r] of g.ramps.entries()) {
    // (held still only while a car's going up it or flying off it: its hoop's over that jump's top)
    if (g.cars.some(c => c.ramp === i && (c.mode === 'climb' || c.mode === 'air'))) continue;
    const [lo, hi] = rampRange(r.dir);
    // (there: off somewhere else, a new pace; half the time lining its jump up on him, half anywhere)
    if (Math.abs(r.to - r.x) < 2) {
      r.to = Math.random() < 0.5 ? aimX - r.dir * JUMP + (Math.random() - 0.5) * 200 : lo + Math.random() * (hi - lo);
      r.to = Math.max(lo, Math.min(hi, r.to));
      r.v = RAMP.V * (0.5 + Math.random() * 0.8);
    }
    const d = r.to - r.x;
    r.x += Math.max(-r.v, Math.min(r.v, d));
    if (state.frame % 24 === 0 && Math.abs(r.x - (state.camera.x + 400)) < 500) playSound('click', 0.12, -6);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** Blown up (a head-on, a meteor, thrown, landed on him): a fireball, and a burning wreck where it comes down. */
export const boom = (ctx: FrameContext, g: Garage, car: Car) => {
  const { state, fx } = ctx;
  if (car.mode === 'wreck' || car.mode === 'gone') return;
  const at = { x: car.x, y: car.y + car.z * 0.45 - CAR.BODY };
  fx.spawnExplosion(at, '#F97316', 40, 0, 24); fx.spawnExplosion(at, '#FDE047', 24, 0, 16); fx.spawnExplosion(at, '#57534E', 20, 0, 22);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * 80, y: at.y }, vel: { x: (Math.random() - 0.5) * 9, y: -3 - Math.random() * 7 }, life: 40 + Math.random() * 30, color: car.color === 'red' ? '#DC2626' : '#2563EB', size: 3 + Math.random() * 4, grav: 0.35, chunk: true });
  playSound('boom', 1, -2); playSound('crash', 0.8, -4); shakeScreen(state, 16, 8);
  car.mode = 'wreck'; car.t = 0; car.burnt = 1; car.speed = 0; car.vx = 0; car.crumple = Math.max(car.crumple, 0.6);
  g.hype = 1; g.onCrowd(ctx, car.x, 'boom');
};
/** Frozen solid (a comet): stopped dead, in the air too; a beat later, shattered. */
export const freeze = (ctx: FrameContext, _g: Garage, car: Car) => {
  if (car.mode === 'wreck' || car.mode === 'gone' || car.mode === 'frozen') return;
  car.mode = 'frozen'; car.t = 0; car.ice = 1; car.vx = 0; car.vy = 0; car.speed = 0;
  playSound('ice', 1, -4); playSound('crack', 0.7, 2);
};
const shatter = (ctx: FrameContext, g: Garage, car: Car) => {
  const { state, fx } = ctx;
  const at = { x: car.x, y: car.y + car.z * 0.45 - CAR.BODY };
  fx.spawnGlassShatter(at);
  for (let i = 0; i < 26; i++) {
    const ice = i % 3 !== 0;
    state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * 120, y: at.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 10, y: -2 - Math.random() * 6 }, life: 40 + Math.random() * 30, color: ice ? (i % 2 ? '#BAE6FD' : '#F0F9FF') : '#2563EB', size: 3 + Math.random() * 5, grav: 0.35, chunk: !ice });
  }
  playSound('glass', 1, -2); playSound('crack', 0.9, -4); shakeScreen(state, 10, 5);
  car.mode = 'gone';
  g.hype = 1; g.onCrowd(ctx, car.x, 'wow');
};
/** Into the end wall: crumpled; him on its roof, hurt and thrown back off it. */
const crash = (ctx: FrameContext, g: Garage, car: Car) => {
  const { state } = ctx, { hx } = extents(car.yaw);
  car.x = car.dir > 0 ? ARENA_R - hx : ARENA_L + hx;
  playSound('crash', 1, -4); playSound('slam', 0.8, -6); shakeScreen(state, 14, 7);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: car.x + car.dir * hx, y: GY - 30 }, vel: { x: -car.dir * Math.random() * 5, y: -2 - Math.random() * 4 }, life: 30, color: i % 2 ? '#A8A29E' : '#52525B', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
  if (car.rider) launchHim(ctx, g, -car.dir * HIT.WALL.vx, HIT.WALL.vy, HIT.WALL.dmg, 'm2:stunt_wall');
  car.mode = 'crash'; car.t = 0; car.crumple = 1; car.speed = 0; car.rider = false;
  g.hype = 1; g.onCrowd(ctx, car.x, 'ooh');
};

/** Is it a body (on the floor or in the air, there to be hit, stood on, shot)? */
const bodied = (car: Car) => car.mode !== 'wreck' && car.mode !== 'frozen' && car.mode !== 'held' && car.mode !== 'thrown' && car.mode !== 'gone' && car.mode !== 'crash';
/** Can it hit him (where it is, what it's doing)? */
const live = (car: Car) => bodied(car) && !car.scripted && car.mode !== 'exit';

/** Stood on this roof right now. */
const standingOn = (state: GameState, b: Block) => {
  const p = state.player, feet = p.pos.y + p.height;
  return b.y < AWAY - 1 && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - b.y) <= 4 && p.pos.x + p.width > b.x + 2 && p.pos.x < b.x + b.w - 2;
};

const skid = (g: Garage, car: Car, state: GameState) => {
  if (state.frame % 2) return;
  const back = car.x - Math.cos(car.yaw) * CAR.L * 0.35, bz = car.z - Math.sin(car.yaw) * CAR.L * 0.35;
  g.skids.push({ x: back, z: bz, yaw: car.yaw });
  if (g.skids.length > 280) g.skids.shift();
  if (state.frame % 4 === 0) state.particles.push({ pos: { x: back, y: GY + bz * 0.45 - 4 }, vel: { x: -car.dir * Math.random() * 1.5, y: -0.6 - Math.random() * 0.8 }, life: 36, color: 'rgba(214, 211, 209, 0.55)', size: 8 + Math.random() * 8 });
};

/** Him and the car: a hit (and what kind), or nothing. */
const contact = (ctx: FrameContext, g: Garage, car: Car) => {
  const { state } = ctx, p = state.player;
  if (!live(car) || car.hit || (g.launch && g.launch.t < LAUNCH_SAFE) || p.health <= 0 || state.deathTimer > 0) return;
  const { hx, hz } = extents(car.yaw);
  if (Math.abs(car.z) > hz + 10) return;
  if (p.pos.x >= car.x + hx || p.pos.x + p.width <= car.x - hx) return;
  const feet = p.pos.y + p.height;
  // (up over it, or on it: nothing)
  if (feet <= car.y - CAR.CAB + 10 || p.pos.y > car.y - 2) return;
  const mx = pmid(state).x, away = Math.sign(mx - car.x) || car.dir;
  if (car.mode === 'air') {
    car.hit = true;
    boom(ctx, g, car);
    launchHim(ctx, g, away * HIT.LAND.vx, HIT.LAND.vy, HIT.LAND.dmg, 'm2:stunt_landing');
    return;
  }
  const moving = car.speed > 2.5;
  const along = Math.abs(Math.cos(car.yaw)) > 0.75;
  if (moving && along && car.dir * (mx - car.x) > 0) {
    // Head-on: the nose into him. It goes up; he goes flying
    car.hit = true;
    boom(ctx, g, car);
    launchHim(ctx, g, car.dir * HIT.HEADON.vx, HIT.HEADON.vy, HIT.HEADON.dmg, 'm2:stunt_headon');
    return;
  }
  // Any other side of it (the user: only the roof doesn't hurt): swiped, flying, the way it's going (stopped: away
  // off it)
  car.hit = true;
  const way = moving ? car.dir : away;
  launchHim(ctx, g, way * (HIT.DRIFT.vx + car.speed * 0.3), HIT.DRIFT.vy, HIT.DRIFT.dmg, car.color === 'blue' ? 'm2:stunt_landing' : 'm2:stunt_drift');
};

export const updateCars = (ctx: FrameContext, g: Garage) => {
  const { state } = ctx, p = state.player;
  const mx = pmid(state).x;
  const bulked = buffs.knock > 1;
  for (const car of g.cars) {
    // Still in the garage (the tell): out, and into the world, once it's done
    if (car.hold && car.hold > 0) {
      if (--car.hold <= 0) { car.hold = 0; if (!state.enemies.includes(car.e)) state.enemies.push(car.e); playSound('engine', 0.5, 4); }
      continue;
    }
    car.t++;
    car.wheel += car.speed * 0.15;
    // In his hands (bulked up, the grab's critter throw), or thrown
    if (car.mode === 'held') {
      if (grabHolding() === car.e) continue;
      if (state.enemies.includes(car.e)) {
        const e = car.e;
        state.enemies = state.enemies.filter(o => o !== e);
        if (e.isBlownAway) {
          // Let fly: his throw, heavy (it's a car)
          car.mode = 'thrown'; car.t = 0; car.z = 0;
          car.x = e.pos.x + e.width / 2; car.y = e.pos.y + e.height;
          car.vx = e.vel.x * 0.9; car.vy = Math.min(e.vel.y, -2) * 0.9; car.dir = car.vx >= 0 ? 1 : -1; car.yaw = dirYaw(car.dir);
          playSound('whoosh', 1.2, -8);
        } else {
          // (got loose of him: back on its wheels)
          car.mode = 'recover'; car.t = 0; car.x = e.pos.x + e.width / 2; car.y = GY; car.z = 0; car.speed = 2; state.enemies.push(e);
        }
      } else car.mode = 'gone';
      continue;
    }
    if (bodied(car) && !state.enemies.includes(car.e)) {
      // (picked up just now: the grab's got it)
      if (grabHolding() === car.e) { car.mode = 'held'; car.roof.y = AWAY; car.rider = false; continue; }
      car.mode = 'gone';
    }
    car.rider = standingOn(state, car.roof);
    const { hx } = extents(car.yaw);
    const wallHit = () => (car.dir > 0 ? car.x + hx >= ARENA_R : car.x - hx <= ARENA_L);
    switch (car.mode) {
      case 'enter': {
        const k = Math.min(1, car.t / RED.ENTER_T), ek = ease(k);
        car.z = BACK_Z * (1 - ek);
        car.yaw = Math.PI / 2 + angDiff(Math.PI / 2, dirYaw(car.dir)) * ek;
        car.speed = 3 + (RED.V - 3) * k;
        car.x += car.dir * car.speed * k;
        if (k >= 1) { car.mode = 'run'; car.t = 0; }
        break;
      }
      case 'run': {
        car.speed += (RED.V - car.speed) * 0.08;
        car.z += (0 - car.z) * 0.2; turnTo(car, dirYaw(car.dir), 0.2);
        car.x += car.dir * car.speed;
        const d = (mx - car.x) * car.dir;
        if (!car.rider && car.plan === 'drift' && d > 0 && d < RED.DRIFT_AT) { car.mode = 'drift'; car.t = 0; playSound('whoosh', 0.9, 8); playSound('engine', 0.5, 6); }
        else if (!car.rider && car.plan === 'orbit' && d > 0 && d < RED.ORBIT_R + 20) { car.mode = 'orbit'; car.t = 0; car.ox = car.x + car.dir * RED.ORBIT_R; car.ang = 0; playSound('whoosh', 0.9, 6); }
        else if (car.rider || car.scripted ? wallHit() : (car.dir > 0 ? car.x > ARENA_R - 330 : car.x < ARENA_L + 330) || d < -260) {
          if (car.rider || car.scripted) crash(ctx, g, car); else { car.mode = 'recover'; car.t = 0; }
        }
        break;
      }
      case 'drift': {
        // The handbrake: the tail out, the car sideways, sliding along the plane into him
        turnTo(car, dirYaw(car.dir) + car.swing * (Math.PI / 2 + 0.35), 0.18);
        car.x += car.dir * car.speed;
        car.speed *= RED.DECAY;
        car.z += (Math.sin(car.t * 0.2) * 3 - car.z) * 0.2;
        skid(g, car, state);
        if (wallHit()) crash(ctx, g, car);
        else if (car.speed < 1.3 || car.t > RED.DRIFT_T) {
          if (!car.hit && Math.abs(mx - car.x) < 170) g.onCrowd(ctx, car.x, 'ooh');
          car.mode = 'recover'; car.t = 0;
        }
        break;
      }
      case 'orbit': {
        // Round him: in front of him, past him, behind him, and off the far side (the near miss)
        car.ang += RED.ORBIT_W;
        const s = car.swing;
        const nx = car.ox - car.dir * RED.ORBIT_R * Math.cos(car.ang), nz = s * RED.ORBIT_RZ * Math.sin(car.ang);
        const tx = car.dir * RED.ORBIT_R * Math.sin(car.ang), tz = s * RED.ORBIT_RZ * Math.cos(car.ang);
        let yaw = Math.atan2(tz, tx);
        yaw += Math.max(-0.5, Math.min(0.5, angDiff(yaw, Math.atan2(-nz, car.ox - nx))));
        car.yaw = yaw; car.x = nx; car.z = nz; car.speed = RED.V * 0.9;
        skid(g, car, state);
        // (right past him, missing: the crowd)
        if (Math.abs(Math.sin(car.ang)) > 0.97 && car.t % 10 === 0 && Math.abs(mx - car.x) < 60 && !car.hit) g.onCrowd(ctx, car.x, 'ooh');
        car.x = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, car.x));
        if (car.ang >= Math.PI * 3) { car.mode = 'recover'; car.t = 0; }
        break;
      }
      case 'recover': case 'skid': {
        // Off into the back lane and on to the far door (on its roof: the driver goes for the far wall instead)
        if (car.mode === 'skid') { car.speed *= 0.96; if (car.speed < 3 || car.t > 40) { car.mode = 'recover'; car.t = 0; } }
        else car.speed += (RED.V - car.speed) * 0.05;
        turnTo(car, dirYaw(car.dir), 0.12);
        car.x += car.dir * car.speed;
        if (car.rider) car.z += (0 - car.z) * 0.2;
        else car.z = Math.max(LANE_BACK, car.z - 3);
        if (car.mode === 'skid') skid(g, car, state);
        const door = car.dir > 0 ? DOORS_X[3] : DOORS_X[0];
        if (!car.rider && (car.x - door) * car.dir >= -40) { car.mode = 'exit'; car.t = 0; }
        else if (wallHit()) { if (Math.abs(car.z) < 30) crash(ctx, g, car); else { car.mode = 'exit'; car.t = 0; } }
        break;
      }
      case 'exit': {
        // Into the door it's at, and gone
        const door = car.dir > 0 ? DOORS_X[3] : DOORS_X[0];
        car.speed = Math.max(3, car.speed * 0.95);
        car.x += (door - car.x) * 0.1;
        turnTo(car, -Math.PI / 2, 0.15);
        car.z -= 3.5;
        if (car.z < BACK_Z + 20) car.fade = Math.min(1, car.fade + 0.12);
        if (car.fade >= 1) car.mode = 'gone';
        break;
      }
      case 'approach': {
        // Out of the door, along the back lane to its ramp (it follows it, as it creeps)
        const r = g.ramps[car.ramp];
        const k = Math.min(1, car.t / 30);
        car.z = Math.min(LANE_BACK, BACK_Z + (LANE_BACK - BACK_Z) * ease(Math.min(1, car.t / 24)));
        car.yaw = Math.PI / 2 + angDiff(Math.PI / 2, dirYaw(car.dir)) * ease(k);
        car.speed = 3 + (BLUE.V - 3) * k;
        car.x += car.dir * car.speed * k;
        if ((car.x - (r.x - r.dir * RAMP.LEN)) * car.dir >= 0) { car.mode = 'climb'; car.t = 0; playSound('carroar', 0.8, 2); }
        break;
      }
      case 'climb': {
        const r = g.ramps[car.ramp], foot = r.x - r.dir * RAMP.LEN;
        car.x += car.dir * BLUE.V;
        car.speed = BLUE.V;
        const k = Math.min(1, ((car.x - foot) * car.dir) / RAMP.LEN);
        car.y = GY - RAMP.H * k; car.z = LANE_BACK;
        car.pitch = -car.dir * Math.atan2(RAMP.H, RAMP.LEN) * 0.9;
        if (k >= 1) {
          car.mode = 'air'; car.t = 0; car.airT = 0; car.airTotal = airTime(); car.z0 = LANE_BACK;
          car.x = r.x; car.y = GY - RAMP.H; car.vx = car.dir * BLUE.VX; car.vy = BLUE.VY;
          r.lockT = 0;
          playSound('whoosh', 1, -4); playSound('carroar', 0.7, 6);
        }
        break;
      }
      case 'air': {
        car.airT++;
        car.x += car.vx; car.y += car.vy; car.vy += BLUE.G;
        car.z = car.z0 * Math.max(0, 1 - car.airT / car.airTotal);
        car.pitch = car.dir * Math.atan2(car.vy, Math.abs(car.vx)) * 0.5;
        car.speed = Math.abs(car.vx);
        // (through the hoop: a hot one throws sparks)
        if (g.hot && Math.abs(car.airT - APEX_T) < 1) for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: car.x, y: car.y + car.z * 0.45 - 30 }, vel: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }, life: 20, color: i % 2 ? '#F97316' : '#FDE047', size: 3 });
        if (car.y >= GY) {
          // Down: on him (it crashes down on him: it goes up, he goes flying), or a bounce and a skid away
          car.y = GY; car.z = 0;
          contact(ctx, g, car);
          if (car.mode !== 'air') break;
          car.pitch = 0;
          playSound('slam', 1, -6); playSound('crash', 0.6, 2); shakeScreen(state, 10, 5);
          for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * 120, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 26, color: 'rgba(168, 162, 158, 0.75)', size: 5 + Math.random() * 6 });
          car.mode = 'skid'; car.t = 0; car.speed = BLUE.VX * 0.8;
          if (!car.hit && Math.abs(mx - car.x) < 200) g.onCrowd(ctx, car.x, 'ooh');
        }
        break;
      }
      case 'tow': {
        // (Steve on the rope: the fight sets the speed; the front lane, clear of him)
        car.z += (LANE_FRONT - car.z) * 0.08;
        turnTo(car, dirYaw(car.dir), 0.1);
        car.x += car.dir * car.speed;
        if (wallHit()) crash(ctx, g, car);
        break;
      }
      case 'crash':
        if (car.t % 6 === 0) state.particles.push({ pos: { x: car.x + car.dir * hx * 0.8, y: GY - 34 }, vel: { x: (Math.random() - 0.5), y: -1.2 }, life: 40, color: 'rgba(230, 230, 230, 0.5)', size: 7 + Math.random() * 6 });
        if (car.t > 30) { car.mode = 'wreck'; car.t = 0; car.burnt = 0.4; }
        break;
      case 'wreck':
        // (burning where it came down; a beat, then dragged off out of the way)
        if (car.y < GY) { car.vy += 0.6; car.y = Math.min(GY, car.y + car.vy); car.z += (0 - car.z) * 0.05; if (car.y >= GY) { playSound('crash', 0.7, -6); shakeScreen(state, 6, 3); } }
        if (car.burnt > 0.8 && car.t % 4 === 0 && car.t < WRECK_T - 30) state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * 90, y: car.y + car.z * 0.45 - 30 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5), y: -1.5 - Math.random() }, life: 28, color: Math.random() < 0.5 ? '#F97316' : 'rgba(68, 64, 60, 0.6)', size: 5 + Math.random() * 6 });
        if (car.t > WRECK_T) car.fade = Math.min(1, car.fade + 0.04);
        if (car.fade >= 1) car.mode = 'gone';
        break;
      case 'frozen':
        if (car.t >= FROZEN_T) shatter(ctx, g, car);
        break;
      case 'thrown': {
        // His throw: heavy, tumbling; into Steve (a big hit), another car (both go up), a wall or the floor (it goes up)
        car.x += car.vx; car.y += car.vy; car.vy += THROWN_G; car.pitch += 0.12 * car.dir;
        const sb = g.steveBox();
        const { hx: thx } = extents(car.yaw);
        if (sb && car.x + thx > sb.x0 && car.x - thx < sb.x1 && car.y > sb.y0 && car.y - CAR.CAB < sb.y1) { g.onThrownHit(ctx, car); boom(ctx, g, car); break; }
        const other = g.cars.find(o => o !== car && bodied(o) && Math.abs(o.z) < 40 && Math.abs(o.x - car.x) < extents(o.yaw).hx + thx && car.y > o.y - CAR.CAB && car.y - CAR.CAB < o.y);
        if (other) { boom(ctx, g, other); boom(ctx, g, car); break; }
        if (car.y >= GY || car.x - thx <= ARENA_L || car.x + thx >= ARENA_R) { car.y = Math.min(car.y, GY); boom(ctx, g, car); }
        break;
      }
      default: break;
    }
    // Him and it
    contact(ctx, g, car);
    // Its body, for the engine (shots, spells, the grab): where it is; out of the world once it's done
    const e = car.e;
    if (bodied(car)) {
      const ex = extents(car.yaw).hx;
      e.pos.x = car.x - ex; e.width = ex * 2; e.pos.y = car.y - CAR.CAB; e.height = CAR.CAB - CAR.CLEAR;
      e.vel.x = 0; e.vel.y = 0; e.facing = car.dir; e.initialY = e.pos.y;
      e.health = BIG; e.maxHealth = BIG; e.hitCooldown = 0; e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
      // (bulked up, one on the floor in his plane can be picked up: a critter then)
      e.kind = (bulked && Math.abs(car.z) < 16 && car.y >= GY - 2 && car.mode !== 'exit' && car.mode !== 'tow' ? CAR_LOOSE : CAR_KIND) as EnemyKind;
    } else if (state.enemies.includes(e)) state.enemies = state.enemies.filter(o => o !== e);
    // Its roof: a ledge he can stand on (carried along with it), only while it's in his plane and on its wheels
    const roofOk = bodied(car) && Math.abs(car.z) < 14 && car.y >= GY - 3;
    const b = car.roof;
    if (roofOk) {
      const { hx: rhx, mid } = roofExtent(car.yaw);
      const nx = car.x + mid - rhx, ny = car.y - CAR.CAB;
      const on = standingOn(state, b);
      const dx = nx - b.x;
      b.x = nx; b.y = ny; b.w = rhx * 2;
      if (on) { p.pos.x += dx; p.pos.y = ny - p.height; }
    } else b.y = AWAY;
  }
  // (the gone ones out of the list, their roofs out of the world)
  const gone = g.cars.filter(c => c.mode === 'gone');
  if (gone.length) {
    for (const c of gone) { state.blocks = state.blocks.filter(b => b !== c.roof); if (state.enemies.includes(c.e)) state.enemies = state.enemies.filter(o => o !== c.e); }
    g.cars = g.cars.filter(c => c.mode !== 'gone');
  }
  for (const r of g.ramps) if (r.lockT > 0 && !g.cars.some(c => c.ramp === g.ramps.indexOf(r) && (c.mode === 'approach' || c.mode === 'climb'))) r.lockT = 0;
  // The garage doors: up over a tell (all the way by the time it comes out), up while one's going in or out of it,
  // rolled back down slowly after
  DOORS_X.forEach((dx, i) => {
    const tell = g.cars.some(c => (c.hold ?? 0) > 0 && Math.abs(c.x - dx) < 4);
    const busy = !tell && g.cars.some(c => !c.hold && c.mode !== 'gone' && c.z < BACK_Z + 80 && Math.abs(c.x - dx) < 150);
    const o = g.doorOpen[i] ?? 0;
    g.doorOpen[i] = tell || busy ? Math.min(1, o + (tell ? 1.25 / TELL : 0.08)) : Math.max(0, o - 0.02);
  });
};
/** The tells on now (cars still in their garages, about to come out): where, what color, how far along (0..1). */
export const tellsOf = (g: Garage) => g.cars.filter(c => (c.hold ?? 0) > 0).map(c => ({ x: c.x, color: c.color, k: 1 - (c.hold ?? 0) / TELL }));

/** All of them off (the fight's over, or he's dead): the drivers bail, the cars back off out the doors. */
/** Fried, the floor cleared for the shot (the user's: "make sure there are no cars in the way so he has a clear
 *  shot"): the wrecks and the frozen ones dragged off now (their fade), not after their burn. */
export const clearWrecks = (g: Garage) => {
  for (const c of g.cars) if (c.mode === 'wreck' || c.mode === 'frozen') { c.mode = 'wreck'; c.t = Math.max(c.t, WRECK_T + 1); }
};
export const clearCars = (g: Garage) => {
  for (const c of g.cars) {
    // (one still in its garage just stays in there)
    if (c.hold) { c.hold = 0; c.mode = 'gone'; continue; }
    if (c.mode !== 'wreck' && c.mode !== 'gone' && c.mode !== 'held') { c.mode = 'exit'; c.t = 0; c.scripted = true; c.rider = false; }
  }
};
/** Out of the world altogether (the stage going away). */
export const dropCars = (state: GameState, g: Garage) => {
  for (const c of g.cars) { state.blocks = state.blocks.filter(b => b !== c.roof); state.enemies = state.enemies.filter(o => o !== c.e); }
  g.cars = [];
};

/** How many of a color are still out there doing their thing. */
export const countCars = (g: Garage, color: CarColor) => g.cars.filter(c => c.color === color && bodied(c) && c.mode !== 'exit' && c.mode !== 'tow').length;
/** The ones a spell can go for (out of their doors, still cars). */
export const targetable = (car: Car) => bodied(car) && !car.scripted && car.mode !== 'exit' && car.z > BACK_Z + 30;
export { bodied };
