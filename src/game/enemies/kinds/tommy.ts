// Tommy's stage: the ones with their own AI. (The gangbanger and the hazmat
// crew ride on the usual shooter logic, the bruiser and the bloater on the
// charger's, the manhole man on the shield goon's.)
//
//   pitbull:    on foot it prowls and lunges like the wolverine. On the bike run
//               it comes after the bike from behind at a flat sprint, and leaps
//               at him when it's close enough.
//   lowrider:   a car on the bike run, hopping on its hydraulics, two of the
//               crew leaning out of the windows with pistols. A chaser sits
//               behind him and pulls up alongside to empty on him; a blocker
//               sits out in front shooting back. Shoot them.
//   sludgeling: a little thing made of sewer muck, sat under the surface of the
//               sewage (just its eyes showing) till you come by; then it hops
//               out at you and keeps coming in low hops. Slide it.

import { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { mid, seesPlayer, holdingOff } from './index';

export const runTommyKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'pitbull': return pitbull(ctx, e);
    case 'lowrider': lowrider(ctx, e); return true;
    case 'sludgeling': sludgeling(ctx, e); return false;
    default: return false;
  }
};

/** A slug fired from (x, y) at (tx, ty); `carry` is how fast the shooter's going along the road. */
const shootFrom = (state: GameState, e: Enemy, x: number, y: number, tx: number, ty: number, speed: number, damage: number, carry = 0) => {
  const dx = tx - x, dy = ty - y, len = Math.hypot(dx, dy) || 1;
  state.projectiles.push({
    id: `ep-${e.kind}-${state.frame}-${Math.random()}`, pos: { x: x - 5, y: y - 5 }, vel: { x: (dx / len) * speed + carry, y: (dy / len) * speed },
    width: 10, height: 10, health: 1, maxHealth: 1, type: 'projectile', damage, owner: 'enemy', shooterKind: e.kind, shot: 'slug',
  });
};

// ---------------------------------------------------------------------------

const DOG_PROWL = 1.2, DOG_LUNGE = 8.5;
/** On the bike run: how much faster than the bike it can sprint, and how close it has to be to leap. */
const DOG_SPRINT_EXTRA = 2.6, DOG_LEAP_RANGE = 110;

const pitbull = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(p).x - mid(e).x;
  if (p.bike) {
    // After the bike: flat out till it's close, then a leap at him
    const grounded = e.vel.y === 0;
    e.facing = dx < 0 ? -1 : 1;
    if (e.aiState === 'leap') {
      // (landed: it drops back a way before it comes again)
      if (grounded && e.aiTimer > 8) { e.aiState = 'fallback'; e.aiTimer = 0; }
    } else if (e.aiState === 'fallback') {
      e.vel.x += (p.vel.x - 3 - e.vel.x) * 0.2;
      if (e.aiTimer > 70) { e.aiState = 'chase'; e.aiTimer = 0; }
    } else {
      e.aiState = 'chase';
      const want = p.vel.x + Math.max(-4, Math.min(DOG_SPRINT_EXTRA, dx * 0.03));
      e.vel.x += (want - e.vel.x) * 0.2;
      if (grounded && Math.abs(dx) < DOG_LEAP_RANGE && e.aiTimer > 40 && !holdingOff(state)) {
        e.aiState = 'leap'; e.aiTimer = 0;
        e.vel.y = -9; e.vel.x = p.vel.x + Math.sign(dx) * 4;
      }
    }
    return false;
  }
  // On foot: like the wolverine
  switch (e.aiState) {
    case 'bristle':
      e.facing = dx < 0 ? -1 : 1; e.vel.x = 0;
      if (e.aiTimer > 18) { e.aiState = 'lunge'; e.aiTimer = 0; }
      break;
    case 'lunge':
      e.vel.x = e.facing! * DOG_LUNGE;
      if (e.aiTimer % 14 === 1 && e.vel.y === 0) e.vel.y = -4;
      if (e.aiTimer > 44) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.85;
      if (e.aiTimer > 36) { e.aiState = 'idle'; e.aiTimer = 0; e.homeX = e.pos.x; }
      break;
    default: {
      const home = e.homeX ?? e.pos.x;
      if (e.facing === undefined) e.facing = -1;
      if (Math.abs(e.pos.x - home) > 60) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * DOG_PROWL;
      if (seesPlayer(ctx, e, 340, 110) && !holdingOff(state)) { e.aiState = 'bristle'; e.aiTimer = 0; }
    }
  }
  return false;
};

// ---------------------------------------------------------------------------

/** Where a lowrider sits: a chaser this far behind him, a blocker this far ahead; how long it rests between bursts. */
const CAR_BACK = 230, CAR_AHEAD = 260, CAR_REST = 170, CAR_BURST = 3, CAR_BURST_GAP = 8;
/** A chaser pulls up alongside every so often (and sits there emptying on him a while). */
const PULL_UP_EVERY = 300, PULL_UP_FRAMES = 120, ALONGSIDE = 70;
/** The shots: a pistol round, and how hard it hits. */
const CAR_SHOT_SPEED = 8, CAR_SHOT_DAMAGE = 8;

/** Where the car's gunmen lean out (from its middle), front window and back, facing right. */
export const LOWRIDER_WINDOWS = [{ x: 18, y: -40 }, { x: -26, y: -40 }];

const lowrider = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  e.shootTimer = (e.shootTimer || 0) + 1;
  const pm = mid(p);
  let off: number;
  if (e.variant === 1) off = CAR_AHEAD;
  else if (e.aiState === 'alongside') { off = ALONGSIDE * (mid(e).x < pm.x ? -1 : 1); if (e.aiTimer > PULL_UP_FRAMES) { e.aiState = 'hold'; e.aiTimer = 0; } }
  else { off = -CAR_BACK; if (e.aiTimer > PULL_UP_EVERY && p.health > 0) { e.aiState = 'alongside'; e.aiTimer = 0; } }
  const dx = pm.x + off - mid(e).x;
  // Going his pace (whatever that is on the hills), plus working toward its spot
  const pace = p.bike ? Math.max(4, p.vel.x) : 0;
  const lim = e.aiState === 'alongside' ? 3 : 1.4;
  e.vel.x += (pace + Math.max(-lim, Math.min(lim, dx * 0.05)) - e.vel.x) * 0.12;
  e.pos.x += e.vel.x;
  // On the road, bouncing on its hydraulics
  const road = groundLineAt(state.groundRuns, mid(e).x);
  const bounce = Math.abs(Math.sin(state.frame * 0.16 + (e.homeX || 0))) * 6;
  if (road !== Infinity) e.pos.y = road - e.height - bounce;
  // (the car faces the way it's driving; the crew in it turn to wherever he is)
  e.facing = 1;
  e.aiX = pm.x < mid(e).x ? -1 : 1;
  // Bursts out of the windows, one gunman then the other
  const settled = Math.abs(dx) < 160;
  if (settled && e.shootTimer > CAR_REST && p.health > 0 && !holdingOff(state)) {
    const k = e.shootTimer - CAR_REST;
    if (k % CAR_BURST_GAP === 0) {
      const w = LOWRIDER_WINDOWS[Math.floor(k / CAR_BURST_GAP) % 2];
      shootFrom(state, e, mid(e).x + w.x + (e.aiX ?? 1) * 20, e.pos.y + e.height + w.y - 8, pm.x, pm.y, CAR_SHOT_SPEED, CAR_SHOT_DAMAGE, e.vel.x * 0.8);
    }
    // (three rounds a burst between the two of them)
    if (k >= CAR_BURST * CAR_BURST_GAP - 1) e.shootTimer = 0;
  }
  // Exhaust off the back
  if (state.frame % 4 === 0) state.particles.push({ pos: { x: mid(e).x - 72, y: e.pos.y + e.height - 10 }, vel: { x: -1.5 + e.vel.x * 0.5, y: -0.6 }, life: 22, color: 'rgba(120, 113, 108, 0.6)', size: 4 + Math.random() * 3 });
};

// ---------------------------------------------------------------------------

const SLUDGE_HOP = 6.5;

const sludgeling = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(p).x - mid(e).x;
  switch (e.aiState) {
    case 'hop':
      // Low hops at him, turning to follow
      e.facing = dx < 0 ? -1 : 1;
      if (e.vel.y === 0) {
        e.vel.x *= 0.7;
        if (e.aiTimer > 22) { e.aiTimer = 0; e.vel.y = -5.5; e.vel.x = e.facing * SLUDGE_HOP; }
      }
      break;
    case 'leap':
      if (e.vel.y === 0 && e.aiTimer > 6) { e.aiState = 'hop'; e.aiTimer = 0; }
      break;
    default:
      // Lurking under the surface where it was put
      e.vel.x = 0;
      if (Math.abs(dx) < 240 && Math.abs(mid(p).y - mid(e).y) < 220 && !holdingOff(state) && p.health > 0) {
        e.aiState = 'leap'; e.aiTimer = 0;
        e.facing = dx < 0 ? -1 : 1;
        e.vel.y = -10.5; e.vel.x = Math.max(-5, Math.min(5, dx / 26));
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: mid(e).x, y: e.pos.y }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 22, color: i % 2 ? '#65A30D' : '#3F6212', size: 3 + Math.random() * 3 });
      }
  }
};
