// The fire-escape climb: a tall old walk-up, its fire escape zigzagging up the
// front of it, and a window on every landing with a New Yorker behind it who's
// sick of your shit. They lean out and throw whatever's to hand (a pot, a toaster,
// a shoe, a potted plant, the phone). You can only hit them while they're out
// of the window; kill one and he goes out of it, all the way down.

import type { Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Projectile } from '../../../types';
import { makeKindEnemy } from '../../enemies/kinds';
import { BOTTLE_GRAVITY, ENEMY_BULLET_DAMAGE, GROUND_Y } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { playSound } from '../../platform/audio';
import { COURSE } from './course';

/** Where a tenant's box sits when he's out of his window (it's tucked well out of the way when he isn't). */
const OUT = (w: { x: number; y: number }) => ({ x: w.x + 10, y: w.y - 44 });
const AWAY_Y = -99999;

/** Frames: how long a tenant stays in between throws (least, and the most on top), leaning out, winding up, and back in after. */
// (they hang out of it a good while after they've thrown: plenty of time to get them)
const WAIT_MIN = 100, WAIT_RANGE = 160, LEAN = 18, WIND = 16, BACK = 75;
/** How close (up and down, and across) he has to be before they bother. */
const RANGE_Y = 330, RANGE_X = 460;

/** The tenants (in every other window: fewer, but what they throw hurts, and knocks you about). */
export const makeTenants = (): Enemy[] =>
  COURSE.windows.filter((w, i) => i % 2 === 0).map((w, i) => {
    const o = OUT(w);
    const e = makeKindEnemy('tenant', o.x + 20, o.y + 44);
    e.pos = { x: o.x, y: AWAY_Y };
    e.homeX = o.x; e.homeY = o.y;
    e.variant = w.v; e.aiState = 'hidden'; e.aiTimer = -(40 + i * 23 % 90);
    e.facing = 1;
    return e;
  });

/** A tenant's turn: in, out, throw, in. Returns true (the stage runs him, not the generic enemy code). */
export const updateTenant = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = state.player;
  if (e.aiState === 'fall' || e.aiState === 'splat') return fallTenant(ctx, e);
  e.aiTimer = (e.aiTimer || 0) + 1;
  const hx = e.homeX!, hy = e.homeY!;
  const near = Math.abs(p.pos.y - hy) < RANGE_Y && Math.abs(p.pos.x - hx) < RANGE_X && state.deathTimer <= 0;
  e.facing = p.pos.x + p.width / 2 < hx + 20 ? -1 : 1;
  switch (e.aiState) {
    case 'hidden':
      e.pos = { x: hx, y: AWAY_Y };
      if (near && e.aiTimer > WAIT_MIN + (hash(hx + e.aiTimer) * WAIT_RANGE)) { e.aiState = 'lean'; e.aiTimer = 0; e.pos = { x: hx, y: hy }; }
      else if (!near) e.aiTimer = Math.min(e.aiTimer, WAIT_MIN);
      break;
    case 'lean':
      e.pos = { x: hx, y: hy };
      if (e.aiTimer >= LEAN) { e.aiState = 'throw'; e.aiTimer = 0; }
      break;
    case 'throw':
      e.pos = { x: hx, y: hy };
      if (e.aiTimer === WIND) throwItem(state, e);
      if (e.aiTimer >= WIND + BACK) { e.aiState = 'hidden'; e.aiTimer = 0; e.pos = { x: hx, y: AWAY_Y }; }
      break;
  }
  // Hit with a special move (a charge, an uppercut, a dive kick, a slide) while he's out of the window: out he goes
  const hitting = p.isCharging || p.isUppercutting || p.isDivekicking || p.isSliding;
  if (e.aiState !== 'hidden' && hitting && rectsOverlap(boundsOf(e), boundsOf(p))) e.health = 0;
  // (killed any other way at all, the wave, the flamethrower, the taser, whatever: out he goes all the same)
  if (e.health <= 0) startFall(ctx, e);
  return true;
};

/**
 * Killed: out of the window he goes, all of him, arms and legs going, eyes like saucers, screaming all the way
 * down past the fire escape to the street. SPLAT. He stays there, flat, in what came out of him.
 */
const startFall = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  const hx = e.homeX!, hy = e.homeY!;
  e.aiState = 'fall'; e.aiTimer = 0;
  // (dead, as far as everything else is concerned: nothing hits him again on the way down, or starts him over)
  e.health = 0; e.isBlownAway = false; e.harmless = true;
  e.pos = { x: hx, y: hy - 20 };
  e.vel = { x: (e.facing ?? 1) * -1.2, y: -4 };
  e.rotation = 0;
  fx.spawnDamageNumber({ x: hx - 30, y: hy - 40 }, 'AAAAAAAH!', true, '#F8FAFC');
  fx.spawnDeathShower({ x: hx + 20, y: hy + 10 }, 0, 0.6);
  fx.speakVulgarity('gun_kill');
  state.player.killSatisfactionTimer = 60;
};

const fallTenant = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  if (e.aiState === 'splat') return true;
  e.pos.x += e.vel.x; e.pos.y += e.vel.y; e.vel.y = Math.min(18, e.vel.y + 0.5);
  e.rotation = (e.rotation || 0) + 0.12 * Math.sign(e.vel.x || 1);
  // (the scream trailing after him)
  if (e.aiTimer % 14 === 0) state.particles.push({ pos: { x: e.pos.x + 20, y: e.pos.y - 10 }, vel: { x: 0, y: -1 }, life: 20, color: 'rgba(248, 250, 252, 0.7)', size: 3 });
  // (down onto the concrete: the street, or the swanky one's terrace; straight past the fire escapes' grating)
  const floor = Math.min(GROUND_Y, ...state.blocks.filter(b => b.type === 'wall' && b.w > 400 && e.pos.x + 20 > b.x && e.pos.x + 20 < b.x + b.w && b.y >= e.pos.y + e.height - e.vel.y - 1).map(b => b.y));
  if (e.pos.y + e.height >= floor) {
    // SPLAT
    e.aiState = 'splat'; e.aiTimer = 0; e.vel = { x: 0, y: 0 };
    e.pos.y = floor - e.height;
    fx.spawnDeathShower({ x: e.pos.x + 20, y: floor - 6 }, 0, 2.2);
    fx.spawnDamageNumber({ x: e.pos.x - 10, y: floor - 90 }, 'SPLAT!', true, '#DC2626');
    for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: e.pos.x + 20, y: floor - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 7 }, life: 30 + Math.random() * 30, color: i % 3 ? '#991B1B' : '#DC2626', size: 2 + Math.random() * 5 });
    shakeScreen(state, 14, 8);
    playSound('splat');
  }
  return true;
};

/** Hidden inside (or on his way down): a shot at the window goes past him. Out of it: one hit and he's gone. */
export const hitTenant = (ctx: FrameContext, e: Enemy, p: Projectile): boolean | 'miss' | undefined => {
  void p;
  if (e.aiState === 'hidden' || e.aiState === 'fall' || e.aiState === 'splat') return 'miss';
  // (one hit: out of the window)
  startFall(ctx, e);
  return true;
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Whatever's to hand, out of the window in an arc that comes down on him. */
const throwItem = (state: GameState, e: Enemy) => {
  const p = state.player;
  const x = e.homeX! + 20, y = e.homeY! + 4;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height / 2;
  const t = Math.max(20, Math.min(40, Math.hypot(tx - x, ty - y) / 7));
  const vx = (tx - x) / t, vy = (ty - y - 0.5 * BOTTLE_GRAVITY * t * t) / t;
  state.projectiles.push({
    id: `tenant-${state.frame}-${Math.random()}`, pos: { x: x - 9, y: y - 9 }, vel: { x: vx, y: vy }, width: 18, height: 18, health: 1, maxHealth: 1,
    type: 'projectile', damage: ENEMY_BULLET_DAMAGE * 1.75, owner: 'enemy', shooterKind: 'tenant', thrown: 'household', item: Math.floor(hash(state.frame + e.homeX!) * 5) + (e.homeX! >= COURSE.climb.buildings[1].x1 ? 5 : 0), rotation: 0,
    // (it'll knock him clean off his jump: hard, the way it was going)
    knock: { x: Math.sign(vx || 1) * 11, y: -5 },
  });
};
