// Tommy's stage: the ones with their own AI. (The gangbanger and the hazmat
// crew ride on the usual shooter logic, the bruiser and the bloater on the
// charger's, the manhole man on the shield goon's.)
//
//   pitbull:    on foot it prowls and lunges like the wolverine. On the bike run
//               it comes after the bike from behind at a flat sprint, and leaps
//               at him when it's close enough.
//   lowrider:   a car on the bike run, hopping on its hydraulics, two of the
//               crew leaning out of the windows with pistols. It comes up fast
//               from behind, horn going (jump it, or it runs him down), gets out
//               in front of him and stays there shooting back at him till the
//               next one turns up; then it floors it and it's gone. Shoot it
//               (the dogs are the ones behind).
//   sludgeling: a little thing made of sewer muck, sat under the surface of the
//               sewage (just its eyes showing) till you come by; then it hops
//               out at you and keeps coming in low hops. Slide it.
//   mutantfish: a three-eyed sewer fish, bloated and glowing, down in the
//               flooded tunnel: it hangs about in the muck till he swims by,
//               then comes at him in slow lunges. Shoot it.

import { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { playSound } from '../../platform/audio';
import { mid, seesPlayer, holdingOff } from './index';

export const runTommyKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'pitbull': return pitbull(ctx, e);
    case 'lowrider': lowrider(ctx, e); return true;
    case 'sludgeling': sludgeling(ctx, e); return false;
    case 'mutantfish': mutantfish(ctx, e); return true;
    default: return false;
  }
};

/** A round fired from (x, y) toward tx, flat along the road (it can be jumped); `carry` is how fast the shooter's going. */
const shootFrom = (state: GameState, e: Enemy, x: number, y: number, tx: number, speed: number, damage: number, carry = 0) => {
  const dir = tx < x ? -1 : 1;
  state.projectiles.push({
    id: `ep-${e.kind}-${state.frame}-${Math.random()}`, pos: { x: x - 5, y: y - 5 }, vel: { x: dir * speed + carry, y: 0 },
    width: 10, height: 10, health: 1, maxHealth: 1, type: 'projectile', damage, owner: 'enemy', shooterKind: e.kind, shot: 'tracer',
  });
  // (a big red-white flash at the muzzle: you see where it's coming from)
  for (let i = 0; i < 9; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 4) + carry, y: (Math.random() - 0.5) * 3 }, life: 10, color: i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? '#FF2D2D' : '#FB7185', size: 4 + Math.random() * 4 });
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
const CAR_AHEAD = 280, CAR_REST = 210, CAR_BURST = 3, CAR_BURST_GAP = 8;
/** How much faster than him it comes through from behind; how gently it keeps its spot out in front; how hard it floors it leaving. */
const CAR_OVERTAKE = 9, CAR_KEEP = 1.6, CAR_LEAVE = 0.35;
/** Left behind (he ramped away from it): how much slower than him it drops back, out of it. */
const CAR_LOST = 9;
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
  const dx = pm.x + CAR_AHEAD - mid(e).x;
  const pace = p.bike ? Math.max(4, p.vel.x) : 0;
  if (e.aiState === 'leave') {
    // Floored it: off up the road and gone
    e.vel.x += CAR_LEAVE;
  } else if (e.aiState === 'lost') {
    // He's flown off ahead of it: it drops back, horn going, and that's the last of it
    e.vel.x += (pace - CAR_LOST - e.vel.x) * 0.08;
    if (e.aiTimer % 50 === 1) playSound('horn');
  } else if (e.aiState === 'overtake') {
    // Coming through from behind, flat out, right through where he is (he jumps it)
    e.vel.x = pace + CAR_OVERTAKE;
    if (dx < 40) { e.aiState = 'hold'; e.aiTimer = 0; }
  } else {
    // Out in front of him, whatever he does (speeding up, easing off)
    e.vel.x += (pace + Math.max(-CAR_KEEP, Math.min(CAR_KEEP, dx * 0.05)) - e.vel.x) * 0.12;
  }
  e.pos.x += e.vel.x;
  // The horn, coming up behind him
  if (e.aiState === 'overtake' && state.frame % 40 === 0) playSound('horn');
  // On the road, bouncing on its hydraulics
  const road = groundLineAt(state.groundRuns, mid(e).x);
  const bounce = Math.abs(Math.sin(state.frame * 0.16 + (e.homeX || 0))) * 6;
  if (road !== Infinity) e.pos.y = road - e.height - bounce;
  // (the car faces the way it's driving; the crew in it turn to wherever he is)
  e.facing = 1;
  e.aiX = pm.x < mid(e).x ? -1 : 1;
  // Bursts out of the windows, one gunman then the other
  const settled = e.aiState === 'hold' && Math.abs(dx) < 160;
  if (settled && e.shootTimer > CAR_REST && p.health > 0 && !holdingOff(state)) {
    const k = e.shootTimer - CAR_REST;
    if (k % CAR_BURST_GAP === 0) {
      const w = LOWRIDER_WINDOWS[Math.floor(k / CAR_BURST_GAP) % 2];
      shootFrom(state, e, mid(e).x + w.x + (e.aiX ?? 1) * 20, e.pos.y + e.height + w.y - 8, pm.x, CAR_SHOT_SPEED, CAR_SHOT_DAMAGE, e.vel.x * 0.8);
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

// ---------------------------------------------------------------------------

/** How far it notices him from, how fast it drifts, how hard it lunges, and how often. */
const FISH_SEES = 460, FISH_DRIFT = 1.2, FISH_LUNGE = 4.2, FISH_LUNGE_EVERY = 90;

const mutantfish = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), pm = mid(p);
  const homeY = e.initialY ?? e.homeY ?? e.pos.y;
  const dx = pm.x - m.x, dy = pm.y - m.y, d = Math.hypot(dx, dy) || 1;
  const box = e.swimBox;
  // (it only goes for him when he's in its water)
  const inWater = !box || (pm.x > box.x1 && pm.x < box.x2 && pm.y > box.y1 - 20 && pm.y < box.y2);
  if (inWater && Math.abs(dx) < FISH_SEES && p.health > 0 && !holdingOff(state)) {
    // After him: a slow drift his way, and a lunge every so often
    const sp = e.aiTimer % FISH_LUNGE_EVERY < 22 ? FISH_LUNGE : FISH_DRIFT;
    e.vel.x += ((dx / d) * sp - e.vel.x) * 0.1;
    e.vel.y += ((dy / d) * sp - e.vel.y) * 0.1;
  } else {
    // Hanging about where it was put, finning gently
    e.vel.x *= 0.9;
    e.vel.y = (homeY + Math.sin((state.frame + (e.homeX || 0)) * 0.05) * 8 - e.pos.y) * 0.05;
  }
  e.facing = e.vel.x < 0 ? -1 : 1;
  // It swims round things, not through them: a move that'd put it in a pipe, a grate or a wall doesn't happen
  const solidAt = (x: number, y: number) => state.blocks.some(b => b.type !== 'pit' && !b.oneWay && x < b.x + b.w && x + e.width > b.x && y < b.y + b.h && y + e.height > b.y);
  if (!solidAt(e.pos.x + e.vel.x, e.pos.y)) e.pos.x += e.vel.x; else e.vel.x = 0;
  if (!solidAt(e.pos.x, e.pos.y + e.vel.y)) e.pos.y += e.vel.y; else e.vel.y = 0;
  // ...and it never leaves its water
  if (box) {
    e.pos.x = Math.max(box.x1, Math.min(box.x2 - e.width, e.pos.x));
    e.pos.y = Math.max(box.y1 + 8, Math.min(box.y2 - e.height, e.pos.y));
  } else e.pos.y = Math.max(homeY - 90, Math.min(homeY + 40, e.pos.y));
};
