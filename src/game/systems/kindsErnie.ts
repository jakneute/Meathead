// Ernie's stage: the ones with their own AI. (The tech bro, the bike courier
// and the protester ride on the usual shooter / charger / shield logic; the
// raccoon borrows the wolverine's lunge and the seagull the pelican's swoop.)
//
//   drone:    a quadcopter with a camera and a little gun. It picks a spot above
//             you and to one side, flits about erratically, and every so often a
//             red dot lands on you (the tell) and it fires. Then it moves.
//   jetskier: a goon on a jet ski in the chase across the bay. It holds a spot
//             behind you (or ahead of you) on the water and takes shots at you.
//   burning:  somebody from a car on the bridge, on fire, running about
//             screaming. Not out to hurt anyone; only you can end it.

import { Enemy } from '../../types';
import type { FrameContext } from '../context';
import type { GameState } from '../state';
import { mid, safeAhead } from './kinds';

export const runErnieKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'drone': drone(ctx, e); return true;
    case 'jetskier': jetskier(ctx, e); return true;
    case 'burning': burning(ctx, e); return false;
    default: return false;
  }
};

/** A shot at (tx, ty); `carry` is how fast the shooter's going along with him (out on the bay everything's moving), added on. */
const shoot = (state: GameState, e: Enemy, tx: number, ty: number, speed: number, damage: number, carry = 0) => {
  const m = mid(e);
  const dx = tx - m.x, dy = ty - m.y, len = Math.hypot(dx, dy) || 1;
  state.projectiles.push({
    id: `ep-${e.kind}-${state.frame}-${Math.random()}`, pos: { x: m.x - 5, y: m.y - 5 }, vel: { x: (dx / len) * speed + carry, y: (dy / len) * speed },
    width: 10, height: 10, health: 1, maxHealth: 1, type: 'projectile', damage, owner: 'enemy', shooterKind: e.kind,
  });
};

/** How long a drone hangs about between shots, and how long its red dot sits on you before it fires. */
export const DRONE_REST = 110, DRONE_AIM = 26;
const DRONE_SPEED = 5;

const drone = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), pm = mid(p);
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  if (!e.aiState || e.aiState === 'idle') {
    // Hovering over its patch till you come along
    e.vel.x = (homeX + Math.sin((state.frame + homeX) * 0.03) * 30 - e.pos.x) * 0.05;
    e.vel.y = (homeY + Math.sin((state.frame + homeX) * 0.05) * 10 - e.pos.y) * 0.05;
    if (Math.abs(pm.x - m.x) < 520 && p.health > 0) { e.aiState = 'hunt'; e.aiTimer = 0; e.aiX = pm.x < m.x ? 1 : -1; }
  } else {
    // A spot above you and off to one side, jittering about (it's a drone)
    const side = e.aiX || 1;
    // (out on the bay it keeps in closer over him: within reach of a jet ski's leap)
    const tx = pm.x + side * (p.skiing ? 70 : 150) - e.width / 2, ty = pm.y - (p.skiing ? 150 : 170) - e.height / 2;
    const jitter = e.aiState === 'aim' ? 0 : 1;
    e.vel.x += ((tx - e.pos.x) * 0.02 - e.vel.x) * 0.15 + (Math.random() - 0.5) * 1.2 * jitter;
    e.vel.y += ((ty - e.pos.y) * 0.02 - e.vel.y) * 0.15 + (Math.random() - 0.5) * 1.2 * jitter;
    const sp = Math.hypot(e.vel.x, e.vel.y);
    if (sp > DRONE_SPEED) { e.vel.x *= DRONE_SPEED / sp; e.vel.y *= DRONE_SPEED / sp; }
    if (e.aiState === 'hunt' && e.aiTimer > DRONE_REST && p.health > 0) { e.aiState = 'aim'; e.aiTimer = 0; e.aiY = undefined; }
    if (e.aiState === 'aim') {
      e.vel.x *= 0.8; e.vel.y *= 0.8;
      if (e.aiTimer === DRONE_AIM) {
        shoot(state, e, pm.x, pm.y, 8, 10, p.skiing ? p.vel.x : 0);
        // ...and off to the other side of you
        e.aiState = 'hunt'; e.aiTimer = 0; e.aiX = -side;
      }
    }
  }
  e.facing = pm.x < m.x ? -1 : 1;
  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
};

/** How fast a jet ski closes on the spot it wants (on top of keeping up with him), how often it shoots, and its moves. */
const JETSKI_CLOSE = 3.5, JETSKI_REST = 110;
/** A chaser (variant 0) sits behind him taking shots, and every so often guns it to come alongside and ram him. */
const CHASE_BACK = 210, RAM_EVERY = 250, RAM_FRAMES = 100;
/** A blocker (1) sits out in front shooting back at him, and every so often brake-checks him. */
const BLOCK_AHEAD = 175, BRAKE_EVERY = 210, BRAKE_FRAMES = 55, BRAKE_GAP = 70;

const jetskier = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  e.shootTimer = (e.shootTimer || 0) + 1;
  // Riding the swell at the waterline (placed with its hull on the water)
  const waterline = (e.homeY ?? e.pos.y) + e.height;
  const pm = mid(p);
  let off: number;
  if (e.variant === 1) {
    if (e.aiState === 'brake') { off = BRAKE_GAP; if (e.aiTimer > BRAKE_FRAMES) { e.aiState = 'hold'; e.aiTimer = 0; } }
    else { off = BLOCK_AHEAD; if (e.aiTimer > BRAKE_EVERY && p.health > 0) { e.aiState = 'brake'; e.aiTimer = 0; } }
  } else {
    if (e.aiState === 'ram') { off = -8; if (e.aiTimer > RAM_FRAMES) { e.aiState = 'hold'; e.aiTimer = 0; } }
    else { off = -CHASE_BACK; if (e.aiTimer > RAM_EVERY && p.health > 0) { e.aiState = 'ram'; e.aiTimer = 0; } }
  }
  const dx = pm.x + off - mid(e).x;
  // Keeping up with him (at his cruising pace: when he guns it or pulls a wheelie, it's caught out), plus closing on its spot
  const carry = p.skiing ? p.skiSpeed ?? p.vel.x : 0;
  const close = Math.max(-JETSKI_CLOSE, Math.min(JETSKI_CLOSE, dx * 0.06));
  e.vel.x += (carry + close - e.vel.x) * 0.12;
  e.pos.x += e.vel.x;
  e.pos.y = waterline - e.height + Math.sin(state.frame * 0.12 + (e.homeX || 0)) * 2;
  e.facing = pm.x < mid(e).x ? -1 : 1;
  // A shot at him now and then, from where it's sitting
  const settled = e.aiState !== 'ram' && e.aiState !== 'brake' && Math.abs(dx) < 140;
  if (settled && e.shootTimer > JETSKI_REST && p.health > 0) {
    e.shootTimer = 0;
    shoot(state, e, pm.x, pm.y, 7.5, 12, e.vel.x);
  }
  // Spray off the back (a burst off the front when it brakes)
  const back = e.aiState === 'brake' ? 1 : -1;
  if (state.frame % (e.aiState === 'brake' ? 1 : 3) === 0) state.particles.push({ pos: { x: mid(e).x + back * e.facing * 34, y: waterline - 4 }, vel: { x: back * e.facing * (1 + Math.random() * 3) + carry, y: -Math.random() * (e.aiState === 'brake' ? 5 : 2) }, life: 16, color: '#E0F2FE', size: 3 + Math.random() * 3 });
};

const burning = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  // Running blind, this way then that, flailing
  if (e.facing === undefined) e.facing = Math.random() < 0.5 ? -1 : 1;
  if (e.aiTimer % (50 + ((e.homeX || 0) % 40)) === 0 || !safeAhead(ctx, e, e.facing)) e.facing = (-e.facing) as 1 | -1;
  e.vel.x = e.facing * 4.2;
  if (state.frame % 2 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.8 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 2 }, life: 18, color: Math.random() > 0.4 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
};

/** What a burning soul is screaming, now and then. */
export const BURNING_SCREAMS = ['AAAAAAAH!', 'IT BURNS!', 'MY INSURANCE!', 'KILL ME!', 'MOMMY!', 'WHY?!', 'HELP ME!'];
