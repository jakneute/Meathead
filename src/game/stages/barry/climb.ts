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
import { BOTTLE_GRAVITY, ENEMY_BULLET_DAMAGE } from '../../../constants';
import { COURSE } from './course';

/** Where a tenant's box sits when he's out of his window (it's tucked well out of the way when he isn't). */
const OUT = (w: { x: number; y: number }) => ({ x: w.x + 10, y: w.y - 44 });
const AWAY_Y = -99999;

/** Frames: how long a tenant stays in between throws (least, and the most on top), leaning out, winding up, and back in after. */
const WAIT_MIN = 100, WAIT_RANGE = 160, LEAN = 12, WIND = 16, BACK = 26;
/** How close (up and down, and across) he has to be before they bother. */
const RANGE_Y = 330, RANGE_X = 460;

/** The tenants (one in every other window, and in all the ones higher up). */
export const makeTenants = (): Enemy[] =>
  COURSE.windows.filter((w, i) => i % 2 === 0 || w.y < COURSE.climb.top + 700).map((w, i) => {
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
  const { state, fx } = ctx;
  const p = state.player;
  if (e.isBlownAway) {
    // Out of the window and all the way down
    e.pos.x += e.vel.x; e.pos.y += e.vel.y; e.vel.y += 0.55; e.rotation = (e.rotation || 0) + 0.2;
    return e.pos.y < 1400;
  }
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
  if (e.health <= 0 && !e.isBlownAway) {
    // Out of the window he goes
    e.isBlownAway = true; e.health = 0;
    e.pos = { x: hx, y: hy };
    e.vel = { x: (e.facing ?? 1) * 1.5, y: -3 };
    fx.spawnDamageNumber({ x: hx - 20, y: hy - 30 }, 'AAAAAH!', true, '#F8FAFC');
    fx.spawnDeathShower({ x: hx + 20, y: hy + 10 }, 0, 0.8);
    state.player.killSatisfactionTimer = 60;
  }
  return true;
};

/** Hidden inside: a shot at the window goes past him. */
export const hitTenant = (e: Enemy, p: Projectile): boolean | 'miss' | undefined => {
  void p;
  return e.aiState === 'hidden' || e.isBlownAway ? 'miss' : undefined;
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
    type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy', shooterKind: 'tenant', thrown: 'household', item: Math.floor(hash(state.frame + e.homeX!) * 5), rotation: 0,
  });
};
