// THE LASER-GUIDED FLINTLOCK (Frontier Land): an old horse pistol with a laser pointer duct-taped under the barrel.
// Like the sniper up Dale's bell tower: hold fire and the laser finds somebody near out in front (on the ground or in
// the air, it doesn't care) and draws a bead on his head, the sights closing in. He can walk and jump with it held,
// but not turn round: it's locking on. Held long enough it's primed (the hammer clacks back, a ring off the steel, the
// sights go red), and it goes off when fire's let go (let go before that, and it doesn't). A single-target eliminator:
// the ball goes dead straight at him, his head comes off, and it stops in him (nothing through, no ricochet; anybody
// stood in the way first is the one who gets it). Fired with nobody in front, it goes straight out (up or down if he's
// holding that) till it hits something. One of the Ensemble Cast (weapons/half.ts) loses his the same.
// A boss or a mid-boss keeps his head: the ball goes into him and stays there (no going on through, no ricochet), a big
// hit (BOSS_HIT), one boss hit a shot (the T. rex's parts can't all take it off one ball).

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { playSound } from '../../m1/game/platform/audio';
import { KIND_TOP_REACH, KIND_HEAD } from '../../m1/game/render/enemies';
import { deathFacing } from '../../m1/game/enemies/deaths';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { isRobot } from '../kinds';
import { specialsHalf, halfKill } from './half';
import { since } from '../frames';
type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** How long it's held to go off; how near somebody has to be for it to find him; how far a ball goes. */
const CHARGE = 48, LOCK_REACH = 560, RANGE = 1500, COOLDOWN = 34;
/** A boss or a mid-boss hit: one ball a CHARGE + COOLDOWN (82 frames): ~110 a second, about the ray gun's 125 (25
 *  every 12), the gun's six bolts' worth in one go. Against a boss with Meathead 1's breather (Safari Artie: one hit a
 *  second counts) it's the best there is a shot. */
const BOSS_HIT = 150;

let charge = 0, chargedAt = -10, target: Enemy | null = null, lockFacing: 1 | -1 = 1;
/** The lines the last balls went down (and the sparks off what they ricocheted on), fading. */
interface Trail { x0: number; y0: number; x1: number; y1: number; t: number; spark: boolean }
let trails: Trail[] = [];

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
/** Where his head is: a themed one's own (an animal's out the front of it, the way it's facing), or up top. */
let facingState: GameState | null = null;
const headOf = (e: Enemy) => {
  const kh = e.kind ? KIND_HEAD[e.kind] : undefined;
  if (kh && facingState) return { x: e.pos.x + e.width / 2 + kh.x * deathFacing(facingState, e), y: e.pos.y + e.height + kh.y };
  return { x: e.pos.x + e.width / 2, y: e.pos.y + Math.min(14, e.height * 0.25) - (KIND_TOP_REACH[e.kind ?? ''] ?? 0) * 0.5 };
};

/** Whoever it'd draw a bead on: the nearest in reach out in front of him (it's the way he's facing that it looks). */
const pick = (state: GameState, from: { x: number; y: number }) => {
  const f = state.player.facing;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (!alive(e)) continue;
    const h = headOf(e), d = Math.hypot(h.x - from.x, h.y - from.y);
    if (d > LOCK_REACH || (h.x - from.x) * f < -8) continue;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

const solidAt = (state: GameState, x: number, y: number) =>
  state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);

/**
 * One line of it: from (x, y) along (dx, dy) till it hits something solid or runs out, heads off everybody it passes
 * through; where it ends, and whether that was a surface.
 */
const line = (ctx: FrameContext, x: number, y: number, dx: number, dy: number, killed: Set<Enemy>) => {
  const { state, fx } = ctx;
  const STEP = 4;
  let cx = x, cy = y, wall = false, lodged = false;
  for (let d = 0; d < RANGE && !lodged; d += STEP) {
    cx = x + dx * d; cy = y + dy * d;
    if (d > 6 && solidAt(state, cx, cy)) { wall = true; break; }
    for (const e of state.enemies) {
      if (!alive(e) || killed.has(e)) continue;
      if (cx < e.pos.x || cx > e.pos.x + e.width || cy < e.pos.y - (KIND_TOP_REACH[e.kind ?? ''] ?? 0) || cy > e.pos.y + e.height) continue;
      killed.add(e);
      // (one opted in (weapons/half.ts: the Ensemble Cast): the head comes off, but it's one a shot: the ball stops in
      // him, no going on through, no ricochet; the body stays, headless, its own fight lays it down)
      if (specialsHalf(e)) {
        lodged = true;
        fx.spawnExplosion(headOf(e), '#8B0000', 14, dx * 6, 14);
        playSound('splat', 0.9, -2);
        halfKill(ctx, e, 'headless');
        break;
      }
      // (a boss: it's in him, and that's where it stops; one a shot, the ricochet included)
      if (isMidBoss(e)) {
        if (bossHitThisShot) continue;
        bossHitThisShot = true; lodged = true;
        bossHit(ctx, e, cx, cy, dx, dy);
        break;
      }
      // (one a shot: his head comes off, and the ball stops in him)
      headOff(ctx, e, dx, dy);
      lodged = true;
      break;
    }
  }
  trails.push({ x0: x, y0: y, x1: cx, y1: cy, t: 0, spark: wall });
  if (wall) { fx.spawnExplosion({ x: cx, y: cy }, '#FDE047', 8, 0, 8); playSound('clang', 0.5, 6); }
  return { x: cx - dx * STEP, y: cy - dy * STEP, wall };
};

let bossHitThisShot = false;
/** A boss or a mid-boss: no headshot; the ball goes in where it hit, a big hit, blood out of it (a machine: sparks,
 *  a bolt or two and oil, and a little blood: they bleed too). */
const bossHit = (ctx: FrameContext, e: Enemy, x: number, y: number, dx: number, dy: number) => {
  const { state, fx } = ctx;
  e.health -= BOSS_HIT; e.hitFlash = 4;
  fx.spawnDamageNumber(e.pos, BOSS_HIT, true);
  const robot = isRobot(e);
  fx.spawnExplosion({ x, y }, robot ? '#FDE047' : '#8B0000', robot ? 10 : 12, -dx * 3, 10);
  for (let i = 0; i < 8; i++) {
    const c = robot ? (i < 2 ? '#B91C1C' : i % 3 === 0 ? '#0A0A0A' : i % 3 === 1 ? '#9CA3AF' : '#FDE047') : (i % 2 ? '#B91C1C' : '#7F1D1D');
    state.particles.push({ pos: { x, y }, vel: { x: -dx * (1.5 + Math.random() * 3) + (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 2.5 }, life: 30 + Math.random() * 20, color: c, size: 2 + Math.random() * 2, grav: 0.3 });
  }
  if (robot) playSound('clang', 0.6, 2); else playSound('splat', 0.7, -2);
};

/** His head, off: the headshot (the sniper's), the line, the callout. (A mid-boss never gets here: bossHit.) */
const headOff = (ctx: FrameContext, e: Enemy, dx: number, dy: number) => {
  const { fx } = ctx;
  const h = headOf(e);
  fx.spawnExplosion(h, '#8B0000', 14, dx * 6, 14);
  fx.killWithAnimation(e, 'headshot', m2Kill('flintlock_kill'), grabCallout('flintlock'), { x: dx * 6, y: -6 + dy * 4 });
};

/** Bang: straight down the line at him (or out the front), into the first one on it. */
const shoot = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const m = muzzlePoint(pl, 'FLINTLOCK');
  const killed = new Set<Enemy>();
  bossHitThisShot = false;
  let dx = pl.facing, dy = 0;
  if (target && alive(target)) { const h = headOf(target); const d = Math.hypot(h.x - m.x, h.y - m.y) || 1; dx = (h.x - m.x) / d; dy = (h.y - m.y) / d; }
  else if (state.player.steer) { const a = state.player.steer * 0.6; dx = pl.facing * Math.cos(a); dy = Math.sin(a); }
  line(ctx, m.x, m.y, dx, dy, killed);
  // The shot: the flint's spark, the flash, a great cloud of smoke, the kick
  playSound('flintlock');
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: m.x + dx * 6, y: m.y + dy * 6 }, vel: { x: dx * (1 + Math.random() * 2) + (Math.random() - 0.5), y: dy * 2 - Math.random() * 1.2 }, life: 40 + Math.random() * 30, color: `rgba(${200 + Math.floor(Math.random() * 40)}, ${200 + Math.floor(Math.random() * 40)}, ${200 + Math.floor(Math.random() * 40)}, 0.55)`, size: 6 + Math.random() * 8 });
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: dx * 4, y: dy * 4 + (Math.random() - 0.5) * 2 }, life: 5, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 8 + Math.random() * 6 });
  pl.vel.x -= pl.facing * 2;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.FLINTLOCK--;
  pl.shootCooldown = COOLDOWN;
  charge = 0; target = null;
};

/** Fire held: drawing a bead (on whoever's near, kept on him while he lives), and at the end of it, bang. */
const fire = (ctx: FrameContext) => { facingState = ctx.state;
  const { state } = ctx;
  const pl = state.player;
  const m = muzzlePoint(pl, 'FLINTLOCK');
  if (chargedAt !== state.frame - 1) { charge = 0; target = null; lockFacing = pl.facing; playSound('click', 0.8, -3); }
  chargedAt = state.frame;
  pl.shootCooldown = 0;
  // (locking on: he can walk and jump with it held, but he can't turn round)
  pl.facing = lockFacing;
  if (!target || !alive(target) || Math.hypot(headOf(target).x - m.x, headOf(target).y - m.y) > LOCK_REACH * 1.2 || (headOf(target).x - m.x) * pl.facing < -8) target = pick(state, m);
  // (primed: it'll go when he lets go)
  if (charge < CHARGE && ++charge === CHARGE) playSound('primed');
};

const tick = (ctx: FrameContext) => { facingState = ctx.state;
  const { state } = ctx;
  // Fire let go: primed, it goes; not yet, nothing
  if (since(state.frame, chargedAt) > 1 && charge > 0) {
    if (charge >= CHARGE && state.player.currentWeapon === 'FLINTLOCK' && (ctx.cheats.infiniteAmmo || state.player.weaponAmmo.FLINTLOCK > 0)) shoot(ctx);
    charge = 0; target = null;
  }
  if (trails.length) { trails.forEach(t => t.t++); trails = trails.filter(t => t.t < 14); }
};

/** The bead being drawn (sights closing in on his head, going red), and the balls' lines, fading. */
const drawOverlay = (c: Ctx, state: GameState) => {
  for (const t of trails) {
    const k = 1 - t.t / 14;
    c.strokeStyle = `rgba(255, 237, 160, ${(0.9 * k).toFixed(2)})`; c.lineWidth = 2.5 * k + 0.5;
    c.beginPath(); c.moveTo(t.x0, t.y0); c.lineTo(t.x1, t.y1); c.stroke();
    c.strokeStyle = `rgba(255, 255, 255, ${k.toFixed(2)})`; c.lineWidth = 1;
    c.beginPath(); c.moveTo(t.x0, t.y0); c.lineTo(t.x1, t.y1); c.stroke();
    if (t.spark && t.t < 6) { c.fillStyle = '#FDE047'; c.fillRect(t.x1 - 3, t.y1 - 3, 6, 6); c.fillStyle = '#FFFFFF'; c.fillRect(t.x1 - 1, t.y1 - 1, 2, 2); }
  }
  if (charge <= 0 || state.player.currentWeapon !== 'FLINTLOCK') return;
  const k = Math.min(1, charge / CHARGE);
  const m = muzzlePoint(state.player, 'FLINTLOCK');
  const at = target && alive(target) ? headOf(target) : { x: m.x + state.player.facing * 160, y: m.y };
  // (the laser: a thin red line out to him, brighter as it settles, a red dot on his head)
  const lm = { x: m.x - state.player.facing * 4, y: m.y + 5 };
  c.strokeStyle = `rgba(239, 68, 68, ${(0.25 + k * 0.45).toFixed(2)})`; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(lm.x, lm.y); c.lineTo(at.x, at.y); c.stroke();
  c.strokeStyle = `rgba(254, 202, 202, ${(0.2 + k * 0.4).toFixed(2)})`; c.lineWidth = 0.6; c.stroke();
  c.fillStyle = '#EF4444'; c.fillRect(at.x - 2, at.y - 2, 4, 4); c.fillStyle = '#FECACA'; c.fillRect(at.x - 1, at.y - 1, 2, 2);
  // (the sights: four ticks closing in on him, white going red, and a dot when it's there)
  const r = 26 - k * 16, red = k >= 1;
  c.strokeStyle = INK; c.lineWidth = 4;
  const ticks = () => { c.beginPath(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { c.moveTo(at.x + dx * r, at.y + dy * r); c.lineTo(at.x + dx * (r + 7), at.y + dy * (r + 7)); } c.stroke(); };
  ticks();
  c.strokeStyle = red ? (state.frame % 6 < 3 ? '#EF4444' : '#FCA5A5') : '#F8FAFC'; c.lineWidth = 2; ticks();
  c.beginPath(); c.arc(at.x, at.y, r, 0, Math.PI * 2); c.strokeStyle = red ? 'rgba(239, 68, 68, 0.6)' : 'rgba(248, 250, 252, 0.4)'; c.lineWidth = 1; c.stroke();
  if (red) { c.fillStyle = '#EF4444'; c.fillRect(at.x - 1.5, at.y - 1.5, 3, 3); }
};

/** In his fist: a long horse pistol, walnut stock curving down into his hand, a brass butt and fittings, the long iron
 * barrel, the flint in its hammer cocked back, a wisp of smoke off the pan, and the laser pointer taped under it. */
const drawHeld = (c: Ctx, frame: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(-3, -1); c.lineTo(10, -2); c.lineTo(10, 3); c.lineTo(4, 4); c.lineTo(1, 11); c.lineTo(-5, 10); c.closePath(); c.fill();
  c.fillStyle = '#92400E'; c.beginPath(); c.moveTo(-2, 0); c.lineTo(9, -1); c.lineTo(9, 2); c.lineTo(3, 3); c.lineTo(0.5, 9.5); c.lineTo(-4, 9); c.closePath(); c.fill();
  c.fillStyle = '#B45309'; c.fillRect(-1, 0, 8, 1);
  c.fillStyle = '#CA8A04'; c.fillRect(-5, 8, 5, 3);
  c.fillStyle = INK; c.fillRect(8, -2, 24, 5);
  c.fillStyle = '#52525B'; c.fillRect(9, -1, 22, 3); c.fillStyle = '#A1A1AA'; c.fillRect(9, -1, 22, 1);
  c.fillStyle = '#CA8A04'; c.fillRect(17, -2, 2, 5); c.fillRect(29, -2, 2, 5);
  c.fillStyle = INK; c.fillRect(4, -6, 3, 5); c.fillStyle = '#71717A'; c.fillRect(5, -5, 1, 3); c.fillStyle = '#E5E7EB'; c.fillRect(5, -6, 2, 1);
  if (frame % 50 < 25) { c.fillStyle = 'rgba(220, 220, 220, 0.4)'; c.fillRect(7, -9 - (frame % 25) * 0.2, 2, 2); }
  c.fillStyle = INK; c.fillRect(17, 3, 11, 4); c.fillStyle = '#3F3F46'; c.fillRect(18, 4, 9, 2); c.fillStyle = '#EF4444'; c.fillRect(27, 4, 1, 2);
  c.fillStyle = '#A1A1AA'; c.fillRect(20, 3, 2, 4);
};

/** Everything it was in the middle of, stopped (through a door). */
export const stopFlintlock = () => { charge = 0; target = null; trails = []; };

export const registerFlintlock = () => registerWeapon('FLINTLOCK', { fire: ctx => fire(ctx), update: () => false, draw: () => {}, drawHeld, tick: ctx => tick(ctx), drawOverlay });
