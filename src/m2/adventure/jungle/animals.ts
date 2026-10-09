// The jungle's animals, real ones (Meathead 2's own kinds, registered here when the jungle's loaded):
//
//   monkey  sits up on a branch and throws things at him: its own shit, mostly, or whatever fruit's to hand.
//   chimp   on the ground: hoots, arms up, then leaps at him to beat on him. Strong.
//   jaguar  prowls; sees him (on the ground or up a vine), crouches, and pounces, a long leap right at where he is.
//   boa     hangs off a branch, swaying; when he's in reach (under it, climbing past it), it pulls back and strikes.
//   macaw   loops about its patch of canopy, then swoops at him and beats its way back up.
//   frog    a poison dart frog, bright blue: hops at him. Tiny. Touch it and it's poison.
//
// Crude first-pass drawing (shapes, to get the feel of them). Every one of them has its hurt and death lines.

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

const drawMonkey = (c: Ctx, e: Enemy, f: number) => {
  const throwing = e.aiState === 'windup';
  const bob = Math.sin(f * 0.15) * 1;
  // tail, curled
  c.strokeStyle = '#5B3A1E'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(-22, -4, -18, -20 + Math.sin(f * 0.1) * 3); c.stroke();
  // body, sat
  c.fillStyle = '#7A4B26'; c.beginPath(); c.ellipse(0, -12 + bob, 10, 12, 0, 0, Math.PI * 2); c.fill();
  // head, face
  c.beginPath(); c.arc(3, -27 + bob, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E8C39E'; c.beginPath(); c.ellipse(6, -26 + bob, 5, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#000'; c.fillRect(6, -29 + bob, 2, 2); c.fillRect(9, -29 + bob, 2, 2);
  // the throwing arm: back over his head, then over
  c.strokeStyle = '#7A4B26'; c.lineWidth = 4;
  const k = throwing ? Math.min(1, e.aiTimer! / 16) : 0;
  const ax = throwing ? (e.aiTimer! < 16 ? -10 + k * 4 : 14) : 10, ay = throwing ? (e.aiTimer! < 16 ? -38 : -26) : -8;
  c.beginPath(); c.moveTo(4, -16 + bob); c.lineTo(ax, ay + bob); c.stroke();
  if (throwing && e.aiTimer! < 16) { c.fillStyle = '#5A3A12'; c.beginPath(); c.arc(ax, ay + bob - 3, 4, 0, Math.PI * 2); c.fill(); }
};

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

const drawChimp = (c: Ctx, e: Enemy, f: number) => {
  const hoot = e.aiState === 'hoot', leap = e.aiState === 'leap';
  const step = e.aiState === 'idle' || !e.aiState ? Math.sin(f * 0.25) * 3 : 0;
  c.fillStyle = '#2B211B';
  // legs
  c.fillRect(-12, -14, 8, 14 + (step > 0 ? 0 : -2)); c.fillRect(4, -14, 8, 14 + (step > 0 ? -2 : 0));
  // body, hunched
  c.beginPath(); c.ellipse(0, -28, 16, 17, leap ? -0.3 : 0.15, 0, Math.PI * 2); c.fill();
  // arms: up and hooting, or down on its knuckles
  c.strokeStyle = '#2B211B'; c.lineWidth = 7;
  if (hoot || leap) { c.beginPath(); c.moveTo(-8, -36); c.lineTo(-14, -56 + Math.sin(f * 0.6) * 3); c.moveTo(8, -36); c.lineTo(16, -56 - Math.sin(f * 0.6) * 3); c.stroke(); }
  else { c.beginPath(); c.moveTo(8, -34); c.lineTo(16 + step, -2); c.stroke(); }
  // head, face
  c.fillStyle = '#2B211B'; c.beginPath(); c.arc(10, -44, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C9A08A'; c.beginPath(); c.ellipse(14, -42, 6, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#000'; c.fillRect(13, -46, 2, 2); c.fillRect(17, -46, 2, 2);
  if (hoot) { c.fillStyle = '#5B1A1A'; c.beginPath(); c.ellipse(16, -38, 3, 4 + Math.abs(Math.sin(f * 0.6)) * 2, 0, 0, Math.PI * 2); c.fill(); }
};

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

const drawJaguar = (c: Ctx, e: Enemy, f: number) => {
  const crouch = e.aiState === 'crouch', pounce = e.aiState === 'pounce';
  const walk = !e.aiState || e.aiState === 'idle' ? Math.sin(f * 0.22) * 4 : 0;
  const low = crouch ? 6 : 0;
  // tail
  c.strokeStyle = '#D9952B'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-30, -22 + low); c.quadraticCurveTo(-46, -26, -44, -10 + Math.sin(f * 0.12) * 4); c.stroke();
  // legs
  c.fillStyle = '#C98420';
  if (pounce) { c.fillRect(18, -20, 16, 6); c.fillRect(-36, -18, 16, 6); }
  else { c.fillRect(-26 + walk, -12, 7, 12); c.fillRect(-14 - walk, -12, 7, 12); c.fillRect(12 + walk, -12, 7, 12); c.fillRect(22 - walk, -12, 7, 12); }
  // body
  c.fillStyle = '#E3A537';
  c.beginPath(); c.ellipse(0, -22 + low, 32, 11, pounce ? -0.15 : 0, 0, Math.PI * 2); c.fill();
  // rosettes
  c.fillStyle = '#3B2208';
  for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-24 + i * 8, -24 + low + (i % 2 ? 4 : -2), 2.2, 0, Math.PI * 2); c.fill(); }
  // head
  c.fillStyle = '#E3A537'; c.beginPath(); c.arc(32, -28 + low * 1.3, 10, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(26, -36 + low); c.lineTo(28, -42 + low); c.lineTo(32, -37 + low); c.fill();
  c.fillStyle = '#000'; c.fillRect(34, -31 + low * 1.3, 2, 2);
  if (pounce || crouch) { c.fillStyle = '#7F1D1D'; c.fillRect(34, -24 + low * 1.3, 7, 3); c.fillStyle = '#FFF'; c.fillRect(35, -24 + low * 1.3, 2, 2); c.fillRect(39, -24 + low * 1.3, 2, 2); }
};

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
  const fx = e.facing ?? 1;
  const ax = ((e.homeX ?? 0) - (e.pos.x + e.width / 2)) * fx, ay = (e.homeY ?? 0) - (e.pos.y + e.height);
  const hx = 0, hy = -e.height / 2;
  // wrapped coils at the branch
  c.fillStyle = '#3F6B21';
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.ellipse(ax + i * 9, ay, 7, 9, 0, 0, Math.PI * 2); c.fill(); }
  // the hanging body: a sag between the branch and the head
  const mx = (ax + hx) / 2 + Math.sin(f * 0.05) * 10, my = Math.max(ay, hy) + 20;
  c.strokeStyle = '#3F6B21'; c.lineWidth = 11; c.lineCap = 'round';
  c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
  c.strokeStyle = '#A3B83A'; c.lineWidth = 3; c.setLineDash([5, 7]);
  c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
  c.setLineDash([]); c.lineCap = 'butt';
  // head
  const open = e.aiState === 'strike' || e.aiState === 'coil';
  c.fillStyle = '#4D7C2A'; c.beginPath(); c.ellipse(hx + 4, hy, 13, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE047'; c.fillRect(hx + 7, hy - 5, 3, 3); c.fillStyle = '#000'; c.fillRect(hx + 8, hy - 5, 1, 3);
  if (open) { c.fillStyle = '#9F1239'; c.beginPath(); c.moveTo(hx + 8, hy + 1); c.lineTo(hx + 20, hy - 3); c.lineTo(hx + 20, hy + 7); c.fill(); }
  else if (Math.floor(f / 20) % 3 === 0) { c.strokeStyle = '#DC2626'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 16, hy + 2); c.lineTo(hx + 24, hy + 2); c.lineTo(hx + 27, hy); c.moveTo(hx + 24, hy + 2); c.lineTo(hx + 27, hy + 5); c.stroke(); }
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

const drawMacaw = (c: Ctx, e: Enemy, f: number) => {
  const flap = Math.sin(f * (e.aiState === 'climb' ? 0.7 : 0.4));
  const swoop = e.aiState === 'swoop';
  // tail
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-8, -10); c.lineTo(-24, swoop ? -16 : -2); c.lineTo(-20, swoop ? -10 : 2); c.closePath(); c.fill();
  // body
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(0, -11, 11, 7, swoop ? 0.3 : 0, 0, Math.PI * 2); c.fill();
  // wing (blue over yellow)
  const wy = swoop ? -4 : -11 - flap * 12;
  c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(-4, -12); c.lineTo(-10, wy - 2); c.lineTo(4, -12); c.fill();
  c.fillStyle = '#2563EB'; c.beginPath(); c.moveTo(-6, -12); c.lineTo(-12, wy); c.lineTo(2, -12); c.fill();
  // head, white face, hooked beak
  c.fillStyle = '#DC2626'; c.beginPath(); c.arc(10, -15, 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F5F5F4'; c.fillRect(10, -17, 4, 4); c.fillStyle = '#000'; c.fillRect(11, -16, 2, 2);
  c.fillStyle = '#1C1917'; c.beginPath(); c.moveTo(15, -17); c.lineTo(20, -13); c.lineTo(15, -11); c.fill();
};

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

const drawFrog = (c: Ctx, e: Enemy, f: number) => {
  const air = e.vel.y !== 0;
  c.fillStyle = '#1D4ED8';
  if (air) { c.fillRect(-11, -4, 6, 3); c.fillRect(5, -4, 6, 3); }
  c.fillStyle = '#38BDF8'; c.beginPath(); c.ellipse(0, -7, 10, air ? 5 : 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0B1220';
  c.fillRect(-5, -10, 3, 3); c.fillRect(1, -6, 3, 3); c.fillRect(-2, -12, 2, 2);
  // eyes
  c.fillStyle = '#0B1220'; c.beginPath(); c.arc(6, -12, 2.5, 0, Math.PI * 2); c.fill();
  // throat going
  if (!air && Math.floor(f / 12) % 4 === 0) { c.fillStyle = '#93C5FD'; c.beginPath(); c.arc(8, -4, 3, 0, Math.PI * 2); c.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });

registerM2Kind({ kind: 'm2:monkey', stats: { w: 28, h: 36, hp: 20, contact: 6, mass: 25 }, ai: monkey, draw: drawMonkey, head: { x: 4, y: -27, r: 8 }, gender: 'n' });
registerM2Kind({ kind: 'm2:chimp', stats: { w: 40, h: 54, hp: 60, contact: 14, mass: 70 }, ai: chimp, draw: drawChimp, head: { x: 11, y: -44, r: 10 }, gender: 'n' });
registerM2Kind({ kind: 'm2:jaguar', stats: { w: 72, h: 36, hp: 90, contact: 18, mass: 100 }, ai: jaguar, draw: drawJaguar, head: { x: 32, y: -28, r: 10 }, gender: 'n' });
registerM2Kind({ kind: 'm2:boa', stats: { w: 28, h: 20, hp: 50, contact: 12, mass: 60, air: true }, ai: boa, make: flyer, draw: drawBoa, head: { x: 4, y: -10, r: 9 }, gender: 'n' });
registerM2Kind({ kind: 'm2:macaw', stats: { w: 30, h: 22, hp: 15, contact: 8, mass: 3, air: true }, ai: macaw, make: flyer, draw: drawMacaw, head: { x: 10, y: -15, r: 6 }, gender: 'n' });
registerM2Kind({ kind: 'm2:frog', stats: { w: 22, h: 16, hp: 8, contact: 10, mass: 2 }, ai: frog, draw: drawFrog, head: { x: 5, y: -10, r: 5 }, gender: 'n' });

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
