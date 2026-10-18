// The train's cast (Meathead 2's own kinds, registered when Wilderness Land is loaded): the park's railroad staff and
// its passengers (all of them people: men and women, every skin, build and hair, seeded per enemy), the cattle in the
// cattle cars, and the robbers who ride up alongside. Each with its tell before it hits:
//
//   porter     in the coaches and the baggage cars: at range he winds up (a suitcase up over his head) and lobs it (it
//              bursts open: somebody's underwear everywhere); up close he swings it
//   brakeman   on the roofs, in hickory-striped overalls with his brake club: walks at him, raises it (the tell), swings
//              (a big knock: off the roof onto the deck, as like as not)
//   robber     a masked bandit galloping up alongside on a horse, on the NEAR side of the line (the foreground: nearer
//              the eye, so bigger and lower, drawn in front of the train; the playtest's): keeps pace, raises the pistol
//              (the tell), fires at him if he's outside (inside's cover: nothing gets through a car's walls); after a
//              bit, or when something's coming that he can't ride through (a tunnel, a bridge's legs, a waterfall: they
//              only ride where there's a clearing), leaps off up onto whatever car's beside him and comes on foot: keeps
//              his distance and shoots, pistol-whips up close. Riding and leaping he isn't one of the cast at all (the
//              playtest's: a foreground thing the train runs, tr.riders, updateRiders: out of the world, out of his
//              reach, nothing hurts him); he's made one of the cast the moment he lands
//   cook       the dining car's: grumpy, heavy; flings cleavers flat across the car (the cleaver up: the tell), swings a
//              frying pan up close
//   passenger  the paying guests, who want him off: a lady with a parasol, a gent with a cane, poking at him; the
//              parasol (or the cane's ferrule) is out in front: charging into it hurts (pointy)
//   steer      a longhorn in the cattle car: paws and snorts (the tell), then charges the length of the car; the horns
//              are out in front (pointy)
//   fireman    on the tender's coal, sooty: shovels lumps of coal back at him (they land and roll back along the roofs:
//              jump them); a swing of the shovel up close
//
// The small stuff of the special deaths (headshots, flings, the bodies) plays out on their drawings (kindArt.ts).

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { CAR_X, ENGINE } from './layout';
import { trainOf, type Rider } from './state';
import { playerRoom } from './where';
import { viewOf } from './view';
import { HURT } from './lines';
import { throwShot } from './shots';
import { drawPorter, drawBrakeman, drawRobber, drawCook, drawPassenger, drawSteer, drawFireman } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Who's in there: the same person every time (where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const gender = (e: Enemy) => (lookOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

/** Its patch: a car's span it keeps to (a steer in its car, a hand on his roof). */
const BOUNDS = new WeakMap<Enemy, [number, number]>();
export const setBounds = (e: Enemy, a: number, b: number) => { BOUNDS.set(e, [a, b]); };
/** Its car's dropped back (a cut): its patch goes with it. */
export const shiftBounds = (e: Enemy, dx: number) => { const b = BOUNDS.get(e); if (b) BOUNDS.set(e, [b[0] + dx, b[1] + dx]); };
const inBounds = (e: Enemy, dir: number) => {
  const b = BOUNDS.get(e);
  if (!b) return true;
  const x = e.pos.x + e.width / 2 + dir * (e.width / 2 + 4);
  return x > b[0] && x < b[1];
};
/** Walk toward x (stopping short, at an edge, at its patch's end). */
const walkTo = (ctx: FrameContext, e: Enemy, x: number, speed: number, stop = 50) => {
  const d = x - mid(e).x;
  e.facing = (d < 0 ? -1 : 1);
  if (Math.abs(d) < stop || !safeAhead(ctx, e, e.facing, 12) || !inBounds(e, e.facing)) { e.vel.x = 0; return; }
  e.vel.x = e.facing * speed;
};
const backOff = (ctx: FrameContext, e: Enemy, x: number, speed: number) => {
  const away = (x < mid(e).x ? 1 : -1);
  e.facing = -away as 1 | -1;
  e.vel.x = safeAhead(ctx, e, away, 12) && inBounds(e, away) ? away * speed : 0;
};
/** A hit in front of it (a club, a jab, a pan): the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  if (p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

// ---------------------------------------------------------------------------------------------------------------
// Porter

const porter = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 400, 90) && e.aiTimer! > 20) setState(e, 'near');
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (!sees(state, e, 460, 100)) { setState(e, 'idle'); break; }
      if (dx < 70 && level(state, e)) { setState(e, 'swingWind'); e.vel.x = 0; break; }
      if (dx > 120 && e.aiTimer! > 40) { setState(e, 'wind'); e.vel.x = 0; e.facing = dirTo(e, pm.x); break; }
      walkTo(ctx, e, pm.x, 1.0, 60);
      break;
    }
    case 'wind':
      // (the suitcase up over his head)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) { throwShot(state, e, 'suitcase', pm.x, p.pos.y + p.height - 20, 30); setState(e, 'after'); }
      break;
    case 'swingWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { playSound('whoosh', 0.6, 0); strike(ctx, e, 46, 12, 'm2:fr_porter', 6); setState(e, 'swing'); }
      break;
    case 'swing': case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (e.aiState === 'swing' ? 14 : 50)) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Brakeman

const brakeman = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default: {
      // (pacing his roof, braced against the wind)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 50 || !safeAhead(ctx, e, e.facing, 12) || !inBounds(e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1);
      e.vel.x = e.facing * 0.6;
      if (sees(state, e, 480, 150) && e.aiTimer! > 20) setState(e, 'come');
      break;
    }
    case 'come':
      if (!sees(state, e, 560, 170)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 72 && level(state, e, 70)) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.7, 56);
      break;
    case 'wind':
      // (the club back over his shoulder)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { playSound('whoosh', 0.8, -4); strike(ctx, e, 56, 14, 'm2:fr_brakeman', 9, -7); setState(e, 'swing'); }
      break;
    case 'swing':
      e.vel.x = 0;
      if (e.aiTimer! > 34) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The robber: on his horse alongside (the near side, the foreground), then up onto the train and on foot

/** The near side's lane (the foreground, in front of the train): where the horses' hooves come down (world), and how
 *  much bigger it's drawn for being nearer the eye (one eye for the scene: the nearer, the bigger and the lower). */
export const FG_GROUND = GY + 40;
export const FG_SCALE = 1.25;
/** Where a rider's pistol hand is, sat on his horse in the near lane (world, over the hooves). */
const HAND_Y = FG_GROUND - 101;

/** What's in the near lane that a horse can't get through or past (a tunnel, a bridge's near legs, a waterfall over
 *  the line, the end of the line): true if any of it's in x0..x1 (world). The robbers only ride where it's clear. */
export const laneBlocked = (state: GameState, x0: number, x1: number) =>
  trainOf(state).passers.some(q => (q.kind === 'tunnel' || q.kind === 'bridge' || q.kind === 'falls' || q.kind === 'bumper') && q.x < x1 && q.x + q.len > x0);

/** The top of the train at x (its roof, its load, a coupling's floor), or null (no car there, or the cab). */
const trainTopAt = (state: GameState, x: number) => {
  const tr = trainOf(state);
  if (x < CAR_X[tr.rear] + 10 || x > CAR_X[ENGINE] - 40) return null;
  let top: number | null = null;
  for (const b of state.blocks) {
    if (!b.tag?.startsWith('tr-') || b.tag === 'tr-cab' || b.y < -1000 || x < b.x + 8 || x > b.x + b.w - 8) continue;
    if (top === null || b.y < top) top = b.y;
  }
  return top;
};

/** Is he inside a car (inside's cover from the riders)? */
const insideAny = (state: GameState) => playerRoom(state, trainOf(state)) >= 0;

const fire = (state: GameState, e: Enemy) => fireFrom(state, mid(e).x, e.pos.y + 26, e.facing ?? 1, e.kind ?? 'm2:fr_robber');
const fireFrom = (state: GameState, x: number, hy: number, facing: number, kind: string) => {
  const p = state.player, hx = x + facing * 22;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.45;
  const d = Math.hypot(tx - hx, ty - hy) || 1, sp = 8.5;
  state.projectiles.push({ id: `fr-slug-${state.frame}-${Math.random()}`, pos: { x: hx - 5, y: hy - 3 }, vel: { x: ((tx - hx) / d) * sp, y: ((ty - hy) / d) * sp }, width: 10, height: 6, health: 1, maxHealth: 1, type: 'projectile', damage: 10, owner: 'enemy', shooterKind: kind as Enemy['kind'], shot: 'slug' });
  playSound('gun', 0.7, -6);
  for (let n = 0; n < 5; n++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: facing * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 2 }, life: 10, color: n % 2 ? '#FDE047' : '#E7E5E4', size: 2 });
};

/** His leap off the horse up onto the train, frames. */
export const LEAP_T = 34;
/** How far along his leap a rider is, 0..1 (for the drawing: the nearer, the bigger). */
export const leapK = (r: Rider) => (r.leap ? Math.min(1, r.leap.t / LEAP_T) : 1);
/** A rider's feet in his leap (world), 0..1 along it. */
export const leapAt = (r: Rider) => {
  const l = r.leap!, u = Math.min(1, l.t / LEAP_T);
  const peak = Math.min(l.y0, l.y1) - 60, hump = (l.y0 + l.y1) / 2 - peak;
  return { x: l.x0 + (l.x1 - l.x0) * u, y: l.y0 + (l.y1 - l.y0) * u - 4 * hump * u * (1 - u), u };
};

/** Robbers coming: `n` riders in from the view's left edge, galloping up the near lane. */
export const addRiders = (state: GameState, n: number) => {
  const tr = trainOf(state), v = viewOf(state);
  for (let k = 0; k < n; k++) {
    const x = v.x - 90 - k * 130, ix = x - 19, variant = (Math.round(x) + k) % 7;
    tr.riders.push({ x, t: 0, shots: 0, st: 'ride', stT: 0, facing: 1, ix, variant: Math.abs(variant), seed: Math.abs(Math.round(ix)) + Math.abs(variant) * 31 });
  }
};

/**
 * The riders in the near lane (the playtest's: the foreground, out of his reach; not the cast: nothing in the world
 * touches them and his shots and moves don't reach them out there). They come in from the view's left edge, gallop up
 * level with him (a bit off to one side) and ride along on screen a good while, raising the pistol (the tell) and
 * firing at him when he's outside (inside's cover); then (done shooting, a while gone, or the lane closing up ahead: a
 * tunnel, a bridge, the falls) they leap up onto whatever's beside them, and land as one of the cast, on foot. One that
 * never got on screen before the lane closed peels off back the way he came (never a kill, never seen).
 */
export const updateRiders = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player, pm = mid(p), v = viewOf(state);
  if (!tr.riders.length) return;
  const keep: Rider[] = [];
  const hold = p.health <= 0 || p.inCutscene;
  for (const r of tr.riders) {
    r.t++; r.stT++;
    if (r.st === 'leap') {
      r.leap!.t++;
      const at = leapAt(r);
      r.x = at.x;
      if (at.u >= 1) {
        // (landed: one of the cast now, on foot, on the train's top where he came down)
        const e = makeKindEnemy('m2:fr_robber' as EnemyKind, r.leap!.x1, r.leap!.y1);
        e.initialX = r.ix; e.variant = r.variant; e.facing = r.facing; e.seen = true; e.aiState = 'foot'; e.aiTimer = 0;
        state.enemies.push(e);
        playSound('thud', 0.6, -6);
        continue;
      }
      keep.push(r);
      continue;
    }
    if (r.st === 'off') {
      // (peeling off: dropping back out of the view, the way he came)
      r.x -= 3 + r.stT * 0.06;
      if (r.x > v.x - 300) keep.push(r);
      continue;
    }
    // (galloping alongside: up level with him, off to one side; the stride bobs him (the drawing's))
    const side = r.variant % 2 ? -1 : 1;
    const want = pm.x + side * (150 + (r.variant % 3) * 40);
    r.x += Math.max(-3.4, Math.min(3.4, (want - r.x) * 0.04));
    r.facing = pm.x < r.x ? -1 : 1;
    keep.push(r);
    if (hold) { if (r.st === 'rideAim') { r.st = 'ride'; r.stT = 0; } continue; }
    const onScreen = r.x > v.x + 40 && r.x < v.x + v.w - 40;
    if (r.st === 'ride') {
      if (onScreen && r.t > 90 && r.stT > 70 && Math.abs(pm.x - r.x) < 560 && !insideAny(state)) { r.st = 'rideAim'; r.stT = 0; continue; }
      const closing = tr.dark > 0.1 || laneBlocked(state, r.x - 140, r.x + 460);
      const done = (r.shots >= 3 && r.t > 360) || r.t > 640;
      if (!closing && !done) continue;
      if (!onScreen) { if (closing) { r.st = 'off'; r.stT = 0; } continue; }
      const lx = r.x + r.facing * 20, top = trainTopAt(state, lx);
      if (top !== null) {
        r.leap = { x0: r.x, y0: FG_GROUND - 36 * FG_SCALE, x1: lx, y1: top, t: 0 };
        r.st = 'leap'; r.stT = 0;
        playSound('jump', 0.6, -4);
        // (the horse runs on riderless and drops back)
        tr.horses.push({ x: r.x, vx: -1, t: 0, seed: r.seed });
      } else if (closing) { r.st = 'off'; r.stT = 0; }
    } else if (r.stT > 26) {
      if (!insideAny(state)) { fireFrom(state, r.x, HAND_Y, r.facing, 'm2:fr_robber'); r.shots++; }
      r.st = 'ride'; r.stT = 0;
    }
  }
  tr.riders = keep;
};

const robber = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const st = e.aiState ?? 'foot';
  switch (st) {
    case 'foot': {
      const dx = Math.abs(pm.x - m.x);
      if (dx < 56 && level(state, e)) { setState(e, 'whipWind'); e.vel.x = 0; break; }
      if (dx > 270) walkTo(ctx, e, pm.x, 1.5, 200);
      else if (dx < 130) backOff(ctx, e, pm.x, 1.1);
      else e.vel.x = 0;
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 56 && sees(state, e, 520, 180)) { setState(e, 'aim'); e.vel.x = 0; }
      break;
    }
    case 'aim':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 24) { fire(state, e); setState(e, 'foot'); }
      break;
    case 'whipWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { playSound('whoosh', 0.6, 4); strike(ctx, e, 44, 11, 'm2:fr_robber', 6); setState(e, 'whip'); }
      break;
    case 'whip':
      e.vel.x = 0;
      if (e.aiTimer! > 20) setState(e, 'foot');
      break;
    default: setState(e, 'foot');
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Cook

const cook = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 440, 90) && e.aiTimer! > 20) setState(e, 'near');
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (!sees(state, e, 500, 100)) { setState(e, 'idle'); break; }
      if (dx < 66 && level(state, e)) { setState(e, 'panWind'); e.vel.x = 0; break; }
      if (dx > 110 && e.aiTimer! > 38) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 0.7, 60);
      break;
    }
    case 'wind':
      // (the cleaver up by his ear)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 22) { throwShot(state, e, 'cleaver', pm.x, 0); setState(e, 'after'); }
      break;
    case 'panWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { if (strike(ctx, e, 50, 13, 'm2:fr_cook', 8)) playSound('clang', 1, 2); else playSound('whoosh', 0.7, -2); setState(e, 'pan'); }
      break;
    case 'pan': case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (e.aiState === 'pan' ? 18 : 44)) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Passenger

const passenger = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 320, 80) && e.aiTimer! > 20) setState(e, 'come');
      break;
    case 'come':
      if (!sees(state, e, 380, 100)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 64 && level(state, e)) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.2, 54);
      break;
    case 'wind':
      // (the parasol, or the cane, drawn back)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { strike(ctx, e, 58, 10, 'm2:fr_passenger', 5); setState(e, 'jab'); }
      break;
    case 'jab':
      e.vel.x = 0;
      if (e.aiTimer! > 30) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Steer (keeps to its car)

const steer = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 40 || !inBounds(e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1);
      e.vel.x = Math.sin((e.aiTimer ?? 0) * 0.02 + (e.variant ?? 0)) > 0.5 ? e.facing * 0.4 : 0;
      if (sees(state, e, 340, 60) && e.aiTimer! > 40) { setState(e, 'paw'); playSound('snort', 0.9, -6); }
      break;
    }
    case 'paw':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 14 === 0) playSound('thud', 0.35, -10);
      if (e.aiTimer! > 40) { setState(e, 'charge'); playSound('bellow', 0.9, -4); }
      break;
    case 'charge':
      if (!inBounds(e, e.facing!) || !safeAhead(ctx, e, e.facing!, 20) || e.aiTimer! > 80) { setState(e, 'recover'); e.vel.x = 0; break; }
      e.vel.x = e.facing! * 6.2;
      if (strike(ctx, e, 20, 15, 'm2:fr_steer', 10, -6)) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 50) { setState(e, 'idle'); e.homeX = e.pos.x; e.aiTimer = 10; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Fireman (on the tender's coal)

const fireman = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  e.vel.x = 0;
  switch (e.aiState) {
    default:
      e.facing = dirTo(e, pm.x);
      if (Math.abs(pm.x - mid(e).x) < 66 && level(state, e)) { setState(e, 'swingWind'); break; }
      if (sees(state, e, 720, 220) && e.aiTimer! > 70) setState(e, 'wind');
      break;
    case 'wind':
      // (the shovel back, heaped)
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { throwShot(state, e, 'coal', pm.x + (Math.random() - 0.5) * 60, p.pos.y + p.height, 44); setState(e, 'idle'); }
      break;
    case 'swingWind':
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20) { playSound('whoosh', 0.7, -6); if (strike(ctx, e, 52, 12, 'm2:fr_fireman', 8)) playSound('clang', 0.8, -4); setState(e, 'swing'); }
      break;
    case 'swing':
      if (e.aiTimer! > 26) setState(e, 'idle');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const H = { x: 1, y: -68, r: 10 };
registerM2Kind({ kind: 'm2:fr_porter', stats: { w: 38, h: 72, hp: 100, contact: 5, mass: 180 }, humanoid: true, gender, head: H, ai: porter, draw: (c, e, f) => drawPorter(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_brakeman', stats: { w: 40, h: 76, hp: 140, contact: 6, mass: 210 }, humanoid: true, gender, head: { x: 1, y: -72, r: 10 }, ai: brakeman, draw: (c, e, f) => drawBrakeman(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_robber', stats: { w: 38, h: 72, hp: 100, contact: 5, mass: 180 }, humanoid: true, gender, head: H, ai: robber, draw: (c, e, f) => drawRobber(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:fr_cook', stats: { w: 44, h: 74, hp: 170, contact: 7, mass: 260 }, humanoid: true, gender, head: { x: 1, y: -70, r: 10 }, ai: cook, draw: (c, e, f) => drawCook(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_passenger', stats: { w: 36, h: 70, hp: 85, contact: 4, mass: 150 }, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: passenger, draw: (c, e, f) => drawPassenger(c, e, f, seedOf(e)), pathing: false, pointy: { source: 'm2:fr_parasol', label: 'POKED!', damage: 11 } });
registerM2Kind({ kind: 'm2:fr_steer', stats: { w: 84, h: 56, hp: 170, contact: 14, mass: 420 }, gender: 'n', grab: 'none', head: { x: 40, y: -42, r: 11 }, ai: steer, draw: drawSteer, pathing: false, pointy: { source: 'm2:fr_longhorns', label: 'GORED!', damage: 16 } });
registerM2Kind({ kind: 'm2:fr_fireman', stats: { w: 40, h: 74, hp: 120, contact: 5, mass: 220 }, humanoid: true, gender, head: { x: 1, y: -70, r: 10 }, ai: fireman, draw: (c, e, f) => drawFireman(c, e, f, seedOf(e)), pathing: false });
