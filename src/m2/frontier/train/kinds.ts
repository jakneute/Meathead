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
//              only ride where there's a clearing), leaps off up onto whatever car's beside him (no collision while he
//              rides or leaps: nothing in the world gets in his way or kills him) and comes on foot: keeps his distance
//              and shoots, pistol-whips up close
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

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { CAR_X, ENGINE } from './layout';
import { trainOf } from './state';
import { playerRoom } from './where';
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
      if (dx > 120 && e.aiTimer! > 50) { setState(e, 'wind'); e.vel.x = 0; e.facing = dirTo(e, pm.x); break; }
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
      if (e.aiTimer! > 18) { playSound('whoosh', 0.6, 0); strike(ctx, e, 46, 10, 'm2:fr_porter', 6); setState(e, 'swing'); }
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
/** Where a rider's box is, sat on his horse in the near lane (about where he's drawn, so he can be shot there). */
const rideY = (e: Enemy) => FG_GROUND - 36 * FG_SCALE - e.height - 10;

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

const fire = (state: GameState, e: Enemy) => {
  const p = state.player, m = mid(e);
  const hx = m.x + e.facing! * 22, hy = e.pos.y + 26;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.45;
  const d = Math.hypot(tx - hx, ty - hy) || 1, sp = 8.5;
  state.projectiles.push({ id: `fr-slug-${state.frame}-${Math.random()}`, pos: { x: hx - 5, y: hy - 3 }, vel: { x: ((tx - hx) / d) * sp, y: ((ty - hy) / d) * sp }, width: 10, height: 6, health: 1, maxHealth: 1, type: 'projectile', damage: 9, owner: 'enemy', shooterKind: e.kind, shot: 'slug' });
  playSound('gun', 0.7, -6);
  for (let n = 0; n < 5; n++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: e.facing! * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 2 }, life: 10, color: n % 2 ? '#FDE047' : '#E7E5E4', size: 2 });
};

/** A rider's ride so far: frames on the horse, shots fired from it. */
const RIDES = new WeakMap<Enemy, { t: number; shots: number }>();
/** His leap off the horse up onto the train: from the near lane (x0, y0: his feet) to the top he's landing on. */
const LEAPS = new WeakMap<Enemy, { x0: number; y0: number; x1: number; y1: number; t: number }>();
const LEAP_T = 34;
/** Still on his horse (the train draws him on it, in the near lane, in front of the cars). */
export const riding = (e: Enemy) => e.kind === 'm2:fr_robber' && e.health > 0 && (e.aiState === 'ride' || e.aiState === 'rideAim');
/** In the air between his horse and the train (the train draws him: coming in from the near side). */
export const boarding = (e: Enemy) => e.kind === 'm2:fr_robber' && e.health > 0 && e.aiState === 'leap';
/** How far along his leap he is, 0..1 (for the drawing: the nearer, the bigger). */
export const leapK = (e: Enemy) => { const l = LEAPS.get(e); return l ? Math.min(1, l.t / LEAP_T) : 1; };

const robber = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p), m = mid(e);
  tick(e);
  const st = e.aiState ?? 'ride';
  if (st === 'ride' || st === 'rideAim') {
    // (galloping alongside in the near lane: up level with him (a bit off to one side), the stride bobbing him; he moves
    // himself, nothing in the world in his way)
    let r = RIDES.get(e);
    if (!r) { r = { t: 0, shots: 0 }; RIDES.set(e, r); }
    r.t++;
    const side = (e.variant ?? 0) % 2 ? -1 : 1;
    const want = pm.x + side * (150 + ((e.variant ?? 0) % 3) * 40);
    e.pos.x += Math.max(-3.4, Math.min(3.4, (want - m.x) * 0.04));
    e.pos.y = rideY(e) - Math.abs(Math.sin(r.t * 0.22)) * 4;
    e.vel.x = 0; e.vel.y = 0;
    // (out beside the train, not on it: bumping into him isn't a thing)
    e.harmless = true;
    e.facing = dirTo(e, pm.x);
    if (st === 'ride') {
      if (r.t > 70 && e.aiTimer! > 80 && Math.abs(pm.x - m.x) < 520 && p.health > 0 && !p.inCutscene && !insideAny(state)) setState(e, 'rideAim');
      // (enough of that, or the lane's about to close up ahead (a tunnel, a bridge, the falls): up onto the train, onto
      // whatever's beside him)
      const closing = laneBlocked(state, m.x - 140, m.x + 460);
      if (closing || r.shots >= 2 || r.t > 420) {
        const lx = m.x + dirTo(e, pm.x) * 20, top = trainTopAt(state, lx);
        if (top !== null) {
          LEAPS.set(e, { x0: m.x, y0: e.pos.y + e.height, x1: lx, y1: top, t: 0 });
          setState(e, 'leap'); playSound('jump', 0.6, -4);
          return true;
        }
      }
    } else if (e.aiTimer! > 26) {
      if (!insideAny(state)) { fire(state, e); r.shots++; }
      setState(e, 'ride');
    }
    return true;
  }
  if (st === 'leap') {
    // (up off the saddle in an arc onto the train: nothing in his way; landed, he's on foot)
    const l = LEAPS.get(e);
    if (!l) { setState(e, 'foot'); e.harmless = false; return false; }
    l.t++;
    const u = Math.min(1, l.t / LEAP_T);
    const peak = Math.min(l.y0, l.y1) - 60, hump = (l.y0 + l.y1) / 2 - peak;
    const y = l.y0 + (l.y1 - l.y0) * u - 4 * hump * u * (1 - u);
    e.pos.x = l.x0 + (l.x1 - l.x0) * u - e.width / 2;
    e.pos.y = y - e.height;
    e.vel.x = 0; e.vel.y = 0;
    if (u >= 1) { e.pos.y = l.y1 - e.height; LEAPS.delete(e); setState(e, 'foot'); e.harmless = false; playSound('thud', 0.6, -6); }
    return true;
  }
  switch (st) {
    case 'foot': {
      const dx = Math.abs(pm.x - m.x);
      if (dx < 56 && level(state, e)) { setState(e, 'whipWind'); e.vel.x = 0; break; }
      if (dx > 270) walkTo(ctx, e, pm.x, 1.5, 200);
      else if (dx < 130) backOff(ctx, e, pm.x, 1.1);
      else e.vel.x = 0;
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 70 && sees(state, e, 520, 180)) { setState(e, 'aim'); e.vel.x = 0; }
      break;
    }
    case 'aim':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 24) { fire(state, e); setState(e, 'foot'); }
      break;
    case 'whipWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { playSound('whoosh', 0.6, 4); strike(ctx, e, 44, 9, 'm2:fr_robber', 6); setState(e, 'whip'); }
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
      if (dx > 110 && e.aiTimer! > 46) { setState(e, 'wind'); e.vel.x = 0; break; }
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
      if (e.aiTimer! > 18) { strike(ctx, e, 58, 7, 'm2:fr_passenger', 5); setState(e, 'jab'); }
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
registerM2Kind({ kind: 'm2:fr_porter', stats: { w: 38, h: 72, hp: 70, contact: 4, mass: 180 }, humanoid: true, gender, head: H, ai: porter, draw: (c, e, f) => drawPorter(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_brakeman', stats: { w: 40, h: 76, hp: 110, contact: 5, mass: 210 }, humanoid: true, gender, head: { x: 1, y: -72, r: 10 }, ai: brakeman, draw: (c, e, f) => drawBrakeman(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_robber', stats: { w: 38, h: 72, hp: 80, contact: 4, mass: 180 }, humanoid: true, gender, head: H, ai: robber, draw: (c, e, f) => drawRobber(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:fr_cook', stats: { w: 44, h: 74, hp: 140, contact: 5, mass: 260 }, humanoid: true, gender, head: { x: 1, y: -70, r: 10 }, ai: cook, draw: (c, e, f) => drawCook(c, e, f, seedOf(e)), pathing: false });
registerM2Kind({ kind: 'm2:fr_passenger', stats: { w: 36, h: 70, hp: 40, contact: 3, mass: 150 }, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: passenger, draw: (c, e, f) => drawPassenger(c, e, f, seedOf(e)), pathing: false, pointy: { source: 'm2:fr_parasol', label: 'POKED!', damage: 11 } });
registerM2Kind({ kind: 'm2:fr_steer', stats: { w: 84, h: 56, hp: 120, contact: 10, mass: 420 }, gender: 'n', grab: 'none', head: { x: 40, y: -42, r: 11 }, ai: steer, draw: drawSteer, pathing: false, pointy: { source: 'm2:fr_longhorns', label: 'GORED!', damage: 16 } });
registerM2Kind({ kind: 'm2:fr_fireman', stats: { w: 40, h: 74, hp: 120, contact: 5, mass: 220 }, humanoid: true, gender, head: { x: 1, y: -70, r: 10 }, ai: fireman, draw: (c, e, f) => drawFireman(c, e, f, seedOf(e)), pathing: false });
