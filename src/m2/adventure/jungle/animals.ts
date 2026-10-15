// The jungle's animals, real ones (Meathead 2's own kinds, registered here when the jungle's loaded):
//
//   monkey  sits up on a branch and throws things at him: its own shit, mostly, or whatever fruit's to hand.
//   chimp   on the ground: hoots, arms up, then leaps at him to beat on him. Strong.
//   jaguar  prowls; sees him (on the ground or up a vine), crouches, and pounces, a long leap right at where he is.
//   boa     hangs off a branch, swaying; when he's in reach (under it, climbing past it), it pulls back and strikes.
//   macaw   loops about its patch of canopy, then swoops at him and beats its way back up.
//   frog    a poison dart frog, bright blue: hops at him. Tiny. Touch it and it's poison.
//
// Drawn in animalArt.ts (stamped frames). Every one of them has its hurt and death lines.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { GRAVITY } from '../../../m1/constants';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { jungleOf } from './state';
import { HURT } from './lines';
import { drawMonkeyArt, drawChimpArt, drawJaguarArt, drawBoaArt, drawMacawArt, drawFrogArt } from './animalArt';

type Ctx = CanvasRenderingContext2D;

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const alive = (state: GameState) => state.player.health > 0;
const grounded = (e: Enemy) => e.vel.y === 0;

// ---------------------------------------------------------------------------------------------------------------
// Monkey: up a tree, throwing

/** How hard what a monkey throws falls. */
export const THROWN_G = 0.3;
const MONKEY_RANGE = 520;

const monkey = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  e.vel.x = 0;
  const pm = mid(p), em = mid(e);
  e.facing = dirTo(e, pm.x);
  const inRange = alive(state) && Math.abs(pm.x - em.x) < MONKEY_RANGE && Math.abs(pm.y - em.y) < 420 && !holdingOff(state);
  switch (e.aiState) {
    default:
      e.aiState = 'sit'; e.aiTimer = Math.floor(Math.random() * 60);
      break;
    case 'sit':
      if (inRange && e.aiTimer > 95) setState(e, 'windup');
      break;
    case 'windup':
      if (e.aiTimer === 16) {
        // Lobbed to come down on him (a little ahead of where he's going)
        const adv = state.stage as { s?: unknown } | null;
        if (adv?.s) {
          const fromX = em.x + e.facing * 8, fromY = e.pos.y + 4;
          const t = Math.max(30, Math.min(64, Math.abs(pm.x - fromX) / 5.5));
          const tx = pm.x + p.vel.x * t * 0.4, ty = pm.y;
          const poo = Math.random() < 0.6;
          jungleOf(state).thrown.push({
            x: fromX, y: fromY, vx: (tx - fromX) / t, vy: (ty - fromY - 0.5 * THROWN_G * t * t) / t,
            kind: poo ? 'poo' : 'fruit', fruit: Math.floor(Math.random() * 2), t: 0,
          });
        }
      }
      if (e.aiTimer > 26) { setState(e, 'sit'); e.aiTimer = -Math.floor(Math.random() * 30); }
      break;
  }
  return false;
};

const drawMonkey = (c: Ctx, e: Enemy, f: number) => drawMonkeyArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------
// Chimp: hoots, then leaps on him

const chimp = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  const sees = alive(state) && Math.abs(pm.x - em.x) < 380 && Math.abs(pm.y - em.y) < 130 && !holdingOff(state);
  switch (e.aiState) {
    default: {
      // Knuckle-walking about its patch
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 60 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.9;
      if (sees) setState(e, 'hoot');
      break;
    }
    case 'hoot':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer > 24) {
        // (not off into a pit)
        if (grounded(e) && safeAhead(ctx, e, e.facing, 40) && safeAhead(ctx, e, e.facing, 110)) {
          e.vel.y = -7.5; e.vel.x = e.facing * Math.min(6.5, Math.max(3, Math.abs(pm.x - em.x) / 18));
          setState(e, 'leap');
        } else setState(e, 'recover');
      }
      break;
    case 'leap':
      if (e.aiTimer > 4 && grounded(e)) { setState(e, 'recover'); }
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.8;
      if (e.aiTimer > 40) { setState(e, sees ? 'hoot' : 'idle'); e.homeX = e.pos.x; }
      break;
  }
  return false;
};

const drawChimp = (c: Ctx, e: Enemy, f: number) => drawChimpArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------
// Jaguar: prowls, crouches, pounces (up at him on a vine too)

const jaguar = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  const sees = alive(state) && Math.abs(pm.x - em.x) < 460 && Math.abs(pm.y - em.y) < 330 && !holdingOff(state);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 90 || !safeAhead(ctx, e, e.facing, 12)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 1.2;
      if (sees && e.aiTimer > 20) setState(e, 'crouch');
      break;
    }
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer > 30) {
        if (!grounded(e) || !sees) { setState(e, 'idle'); break; }
        // A leap that comes down where he is (as near as a cat can judge it)
        const dx = pm.x - em.x, dy = pm.y - (e.pos.y + e.height - 20);
        const t = Math.max(18, Math.min(38, Math.abs(dx) / 8));
        e.vel.x = Math.max(-10, Math.min(10, dx / t));
        e.vel.y = Math.max(-17, Math.min(-6, (dy - 0.5 * GRAVITY * t * t) / t));
        setState(e, 'pounce');
      }
      break;
    case 'pounce':
      if (e.aiTimer > 4 && grounded(e)) setState(e, 'recover');
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.82;
      if (e.aiTimer > 50) { setState(e, 'idle'); e.homeX = e.pos.x; e.aiTimer = 10; }
      break;
  }
  return false;
};

const drawJaguar = (c: Ctx, e: Enemy, f: number) => drawJaguarArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------
// Boa: hangs off a branch (homeX, homeY: where it's wrapped round), its head (the enemy's box) swaying under it

const BOA_HANG = 80, BOA_REACH = 175;

const boa = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const ax = e.homeX ?? e.pos.x, ay = e.homeY ?? e.pos.y;
  const pm = mid(p);
  const head = mid(e);
  let tx = ax + Math.sin((state.frame + ax) * 0.03) * 14, ty = ay + BOA_HANG, speed = 0.08;
  const inReach = alive(state) && Math.abs(pm.x - ax) < 170 && pm.y > ay - 60 && pm.y < ay + BOA_REACH + 60 && !holdingOff(state);
  e.facing = dirTo(e, pm.x);
  switch (e.aiState) {
    default:
      if (inReach && e.aiTimer > 40) setState(e, 'coil');
      break;
    case 'coil':
      // Pulled back up, head cocked
      tx = ax - e.facing * 16; ty = ay + 40; speed = 0.15;
      if (e.aiTimer > 22) { setState(e, 'strike'); e.aiX = pm.x; e.aiY = pm.y; }
      break;
    case 'strike': {
      // Straight at where he was, as far as it reaches
      const dx = (e.aiX ?? pm.x) - ax, dy = (e.aiY ?? pm.y) - ay, d = Math.hypot(dx, dy) || 1, r = Math.min(BOA_REACH, d);
      tx = ax + (dx / d) * r; ty = ay + (dy / d) * r; speed = 0.4;
      if (e.aiTimer > 14) setState(e, 'retract');
      break;
    }
    case 'retract':
      speed = 0.06;
      if (e.aiTimer > 36) setState(e, 'idle');
      break;
  }
  const nx = head.x + (tx - head.x) * speed, ny = head.y + (ty - head.y) * speed;
  e.vel.x = nx - head.x; e.vel.y = ny - head.y;
  e.pos.x = nx - e.width / 2; e.pos.y = ny - e.height / 2;
  return true;
};

const drawBoa = (c: Ctx, e: Enemy, f: number) => {
  // (the branch it's wrapped round, back from its head: in its own coordinates, turned with it)
  // (torn off it, in his fist or flying: the tail just hangs off it, whipping about)
  // (and with no branch to tie it back to: its death animation's stand-in has no homeY, which strung it up to y = 0;
  // or knocked or squeaked free well out of reach of it)
  const fx = e.facing ?? 1;
  const hy = -e.height / 2;
  const toBranch = { x: ((e.homeX ?? 0) - (e.pos.x + e.width / 2)) * fx, y: (e.homeY ?? 0) - (e.pos.y + e.height) };
  const loose = e.aiState === 'loose' || !!e.isBlownAway || e.homeY === undefined || e.homeX === undefined || !(Math.hypot(toBranch.x, toBranch.y) < BOA_HANG + BOA_REACH + 40);
  const ax = loose ? -34 + Math.sin(f * 0.4) * 6 : toBranch.x, ay = loose ? hy + 30 : toBranch.y;
  drawBoaArt(c, e, f, ax, ay, loose);
};

// ---------------------------------------------------------------------------------------------------------------
// Macaw: loops about its patch of canopy, swoops on him

const macaw = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const m = mid(e), pm = mid(p);
  switch (e.aiState) {
    default: {
      const t = (state.frame + hx) * 0.025;
      const tx = hx + Math.sin(t) * 120, ty = hy + Math.sin(t * 2) * 30;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 80 && alive(state) && !holdingOff(state) && Math.abs(pm.x - m.x) < 380 && Math.abs(pm.y - m.y) < 360) {
        setState(e, 'swoop'); e.aiX = pm.x; e.aiY = pm.y;
        const d = Math.hypot(pm.x - m.x, pm.y - m.y) || 1;
        e.vel = { x: ((pm.x - m.x) / d) * 7, y: ((pm.y - m.y) / d) * 7 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      }
      break;
    }
    case 'swoop':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 16 || e.aiTimer > 60) setState(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.96; e.vel.y = Math.max(-4, e.vel.y - 0.4);
      if (e.pos.y <= hy || e.aiTimer > 90) setState(e, 'idle');
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'swoop') setState(e, 'climb'); }
  return true;
};

const drawMacaw = (c: Ctx, e: Enemy, f: number) => drawMacawArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------
// Poison dart frog: hops at him

const frog = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  tick(e);
  const pm = mid(p), em = mid(e);
  if (grounded(e)) {
    e.vel.x = 0;
    if (e.aiTimer > 45 + ((e.variant ?? 0) % 3) * 12 && alive(state)) {
      e.aiTimer = 0;
      const near = Math.abs(pm.x - em.x) < 320 && Math.abs(pm.y - em.y) < 120;
      const dir = near ? dirTo(e, pm.x) : (Math.random() < 0.5 ? -1 : 1) as 1 | -1;
      e.facing = dir;
      if (safeAhead(ctx, e, dir, 30) && safeAhead(ctx, e, dir, 60)) { e.vel.y = -6; e.vel.x = dir * (near ? 3.2 : 1.6); }
    }
  }
  return false;
};

const drawFrog = (c: Ctx, e: Enemy, f: number) => drawFrogArt(c, e, f);

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });

registerM2Kind({ kind: 'm2:monkey', stats: { w: 28, h: 36, hp: 14, contact: 6, mass: 25 }, ai: monkey, draw: drawMonkey, head: { x: 4, y: -27, r: 8 }, gender: 'n', grab: 'critter' });
// (the chimp's on two legs, like a person: grabbed by the neck, pinned and shaken, keeling over, as people are)
registerM2Kind({ kind: 'm2:chimp', stats: { w: 40, h: 54, hp: 80, contact: 14, mass: 70 }, ai: chimp, draw: drawChimp, head: { x: 11, y: -44, r: 10 }, gender: 'n', grab: 'body', humanoid: true, pathing: false });
registerM2Kind({ kind: 'm2:jaguar', stats: { w: 72, h: 36, hp: 120, contact: 18, mass: 100 }, ai: jaguar, draw: drawJaguar, head: { x: 32, y: -28, r: 10 }, gender: 'n', grab: 'body' });
registerM2Kind({ kind: 'm2:boa', stats: { w: 28, h: 20, hp: 35, contact: 12, mass: 60, air: true }, ai: boa, make: flyer, draw: drawBoa, head: { x: 4, y: -10, r: 9 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:macaw', stats: { w: 30, h: 22, hp: 14, contact: 8, mass: 3, air: true }, ai: macaw, make: flyer, draw: drawMacaw, head: { x: 10, y: -15, r: 6 }, gender: 'n', grab: 'critter' });
registerM2Kind({ kind: 'm2:frog', stats: { w: 22, h: 16, hp: 8, contact: 10, mass: 2 }, ai: frog, draw: drawFrog, head: { x: 5, y: -10, r: 5 }, gender: 'n', grab: 'critter' });

// ---------------------------------------------------------------------------------------------------------------
// What the monkeys have thrown: in the air till it hits him or something solid

const POO_DAMAGE = 8, FRUIT_DAMAGE = 6;

export const updateThrown = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, j = jungleOf(state);
  j.thrown = j.thrown.filter(t => {
    t.t++;
    t.vy += THROWN_G; t.x += t.vx; t.y += t.vy;
    const splat = (col: string[]) => {
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: col[i % col.length], size: 2 + Math.random() * 4 });
    };
    const cols = t.kind === 'poo' ? ['#5A3A12', '#3F2A0E', '#7C5A2A'] : t.fruit ? ['#FDE047', '#FEF9C3'] : ['#F97316', '#FDBA74', '#FDE047'];
    // Him
    if (p.health > 0 && t.x > p.pos.x + 4 && t.x < p.pos.x + p.width - 4 && t.y > p.pos.y + 2 && t.y < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !p.noContactHurt) {
        hurtPlayer(ctx, t.kind === 'poo' ? POO_DAMAGE : FRUIT_DAMAGE, t.kind === 'poo' ? 'm2:monkey_poo' : 'm2:monkey_fruit', { x: Math.sign(t.vx || 1) * 3, y: -4 }, 16);
      }
      splat(cols);
      return false;
    }
    // Something solid (or the ground), or long gone (the branches are leafy: it goes through those)
    if (state.blocks.some(b => b.type !== 'pit' && !b.oneWay && t.x > b.x && t.x < b.x + b.w && t.y > b.y && t.y < b.y + b.h)) { splat(cols); return false; }
    return t.t < 300;
  });
};

export const drawThrown = (c: Ctx, state: GameState) => {
  for (const t of jungleOf(state).thrown) {
    c.save(); c.translate(t.x, t.y); c.rotate(t.t * 0.3);
    if (t.kind === 'poo') {
      c.fillStyle = '#5A3A12'; c.beginPath(); c.ellipse(0, 2, 7, 4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6B4419'; c.beginPath(); c.ellipse(0, -2, 5, 3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#7C5A2A'; c.beginPath(); c.arc(0, -5, 2.5, 0, Math.PI * 2); c.fill();
    } else if (t.fruit) {
      c.strokeStyle = '#FACC15'; c.lineWidth = 5; c.beginPath(); c.arc(0, -6, 9, 0.3, Math.PI - 0.3); c.stroke();
    } else {
      c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(0, 0, 6, 8, 0.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#16A34A'; c.fillRect(-1, -10, 3, 3);
    }
    c.restore();
    // (a stink line off the poo)
    if (t.kind === 'poo' && t.t % 6 < 3) { c.fillStyle = 'rgba(132, 204, 22, 0.5)'; c.fillRect(t.x - t.vx * 2, t.y - 8, 2, 4); }
  }
};
