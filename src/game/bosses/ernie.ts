// Ernie Earthquake: every so often he either jumps at Meathead and sends a
// boulder rolling along the floor, or heaves one high in an arc and then runs
// to the other side of the room. Every landing shakes the room, and he speeds
// up as he loses health. Ice knocks him out of the air.

import { Enemy, Projectile } from '../../types';
import { BULLET_DAMAGE, BOULDER_SPEED, ERNIE_STOMP_VIBRATION_DURATION, GRAVITY, ARENA_LEFT, ARENA_RIGHT } from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, ARENA_MID, FLOOR_Y, dirTo, midX, enemyProjectile } from './shared';

const ATTACK_INTERVAL = 180;     // frames between attacks at full health...
const ATTACK_INTERVAL_RAMP = 70; // ...this many fewer at 0 HP
const ROLL_SPEED_RAMP = 2;       // extra rolling boulder speed at 0 HP
const HEAVE_WINDUP = 26;         // holding the boulder overhead
const HEAVE_FLIGHT = 48;         // frames the heaved boulder takes to come down
const HEAVE_MAX_SPEED_X = 9;
const RUN_SPEED = 4.5;
const RUN_SPEED_RAMP = 2.5;      // extra run speed at 0 HP
const RUN_REST = 60;             // rest after a run (shrinks with the ramp)
const KNOCKDOWN_FRAMES = 90;
const LANDING_SHAKE = 30;
export const ERNIE_BOULDER_SIZE = 72;

/** Keeps a boulder's left edge inside the arena (spawning in a wall would shatter it). */
const insideArena = (x: number) => Math.max(ARENA_LEFT + 2, Math.min(ARENA_RIGHT - ERNIE_BOULDER_SIZE - 2, x));

/** 0 at full health, 1 at none: he gets faster as it drops. */
const pace = (boss: Enemy) => Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));

const update = (ctx: FrameContext, boss: Enemy) => {
  switch (boss.bossState) {
    case 'stunned_drop':
      // Back on his feet once he's hit the ground and recovered
      if (boss.isGroundedBoss && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; boss.rotation = 0; }
      break;
    case 'attacking':
      // Boulder held overhead; then it goes up and he makes a run for it
      boss.vel.x = 0;
      if (boss.stateTimer! <= 0) heaveBoulder(ctx, boss);
      break;
    case 'running':
      runAcross(ctx, boss);
      break;
    default:
      if (boss.stateTimer! > 0 || !boss.isGroundedBoss) break;
      if (Math.random() < 0.5) jumpAndRoll(ctx, boss);
      else { boss.bossState = 'attacking'; boss.stateTimer = HEAVE_WINDUP; }
  }
};

/** The original attack: a big jump toward Meathead that sends a boulder rolling at him. */
const jumpAndRoll = (ctx: FrameContext, boss: Enemy) => {
  boss.vel.y = -12;
  boss.vel.x = (ctx.state.player.pos.x - boss.pos.x) * 0.03;
  boss.stateTimer = Math.round(ATTACK_INTERVAL - pace(boss) * ATTACK_INTERVAL_RAMP);
  rollBoulder(ctx, boss, dirTo(boss, ctx.state.player), 'b-ernie-jump');
};

const rollBoulder = (ctx: FrameContext, boss: Enemy, dir: number, id: string) => {
  const speed = BOULDER_SPEED + 1 + pace(boss) * ROLL_SPEED_RAMP;
  ctx.bossHelpers.addProjectile(enemyProjectile(`${id}-${Date.now()}`, insideArena(midX(boss) - ERNIE_BOULDER_SIZE / 2), FLOOR_Y - ERNIE_BOULDER_SIZE,
    dir * speed, 0, ERNIE_BOULDER_SIZE, ERNIE_BOULDER_SIZE, BULLET_DAMAGE, { isBoulder: true }));
};

/** Lobs it high so it comes down on Meathead (then bounces and rolls on), and runs for the far side. */
const heaveBoulder = (ctx: FrameContext, boss: Enemy) => {
  const { player } = ctx.state;
  const size = ERNIE_BOULDER_SIZE;
  const x = insideArena(midX(boss) - size / 2), y = boss.pos.y - size + 10;
  const vx = Math.max(-HEAVE_MAX_SPEED_X, Math.min(HEAVE_MAX_SPEED_X, (midX(player) - midX(boss)) / HEAVE_FLIGHT));
  const vy = -0.5 * GRAVITY * HEAVE_FLIGHT;
  ctx.bossHelpers.addProjectile(enemyProjectile(`b-ernie-heave-${Date.now()}`, x, y, vx, vy, size, size, BULLET_DAMAGE, { isBoulder: true }));
  ctx.bossHelpers.playGunSound('gun');
  boss.bossState = 'running';
  boss.slideTargetX = midX(boss) < ARENA_MID ? ARENA_RIGHT - boss.width - 30 : ARENA_LEFT + 30;
};

const runAcross = (ctx: FrameContext, boss: Enemy) => {
  const speed = RUN_SPEED + pace(boss) * RUN_SPEED_RAMP;
  const dx = boss.slideTargetX! - boss.pos.x;
  if (Math.abs(dx) <= speed) {
    boss.vel.x = 0;
    boss.bossState = 'idle';
    boss.stateTimer = Math.round(RUN_REST * (1 - pace(boss) * 0.4));
    return;
  }
  // The physics stops him every frame he's on the ground, so keep pushing
  boss.vel.x = Math.sign(dx) * speed;
  if (ctx.state.frame % 4 === 0) {
    ctx.state.particles.push({
      pos: { x: midX(boss) - Math.sign(dx) * 30, y: FLOOR_Y - 6 },
      vel: { x: -Math.sign(dx) * (1 + Math.random() * 2), y: -Math.random() * 2 },
      life: 22, color: Math.random() > 0.5 ? '#8D6E63' : '#A1887F', size: 5 + Math.random() * 6,
    });
  }
};

/** Every landing shakes the room (and stuns you if you're on the ground). */
const onLand = (ctx: FrameContext, boss: Enemy, dirToPlayer: number, surface: 'block' | 'floor') => {
  ctx.bossHelpers.setScreenShake(LANDING_SHAKE);
  ctx.bossHelpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION);
  if (surface === 'floor') rollBoulder(ctx, boss, dirToPlayer, 'b-ernie-land');
};

/** Weakness: ice knocks him out of the air. */
const knockDown = (ctx: FrameContext, boss: Enemy, p?: Partial<Projectile>) => {
  if (!p?.isIce || boss.isGroundedBoss) return;
  boss.bossState = 'stunned_drop';
  boss.stateTimer = KNOCKDOWN_FRAMES;
  boss.vel.y = 15;
  boss.rotation = Math.PI / 2;
  if (p.pos) ctx.fx.spawnGlassShatter(p.pos);
};

export const ernie: BossDef = {
  id: 'Ernie Earthquake',
  weakness: 'SHOTGUN',
  spawn: { x: 7700 },
  update,
  // Floaty on the way up, heavy on the way down
  physics: { gravity: boss => (boss.isGroundedBoss ? 1 : 0.5), onLand },
  onWeaknessHit: knockDown,
};
