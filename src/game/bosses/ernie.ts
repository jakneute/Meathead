// Ernie Earthquake: every so often he either jumps at Meathead and sends a
// boulder rolling along the floor, or heaves one high in an arc and then runs
// to the other side of the room. Every landing shakes the room, and he speeds
// up as he loses health.
// Weakness, the shotgun: blast him mid-jump or mid-run and he freezes solid,
// topples over and the ice shatters for heavy damage; then he scrambles on to
// where he was headed (untouchable while he does) and carries on.

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
const ICE_HIT_DAMAGE = 30;       // a plain shotgun hit (the shatter is where the damage is)
const FREEZE_FRAMES = 24;        // frozen solid before he topples
const SHATTER_DAMAGE = 120;
const SCRAMBLE_SPEED_MULT = 1.7;
const RESUME_FRAMES = 25;        // after scrambling, this long before his next attack
const LANDING_SHAKE = 30;
export const ERNIE_BOULDER_SIZE = 72;

/** Keeps a boulder's left edge inside the arena (spawning in a wall would shatter it). */
const insideArena = (x: number) => Math.max(ARENA_LEFT + 2, Math.min(ARENA_RIGHT - ERNIE_BOULDER_SIZE - 2, x));

/** 0 at full health, 1 at none: he gets faster as it drops. */
const pace = (boss: Enemy) => Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));

const update = (ctx: FrameContext, boss: Enemy) => {
  switch (boss.bossState) {
    case 'frozen':
      // Held solid in the ice, then he topples over
      boss.vel.x = 0;
      boss.vel.y = 0;
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'stunned_drop';
        boss.stateTimer = KNOCKDOWN_FRAMES;
        boss.vel.y = 4;
        boss.rotation = Math.PI / 2;
      }
      break;
    case 'stunned_drop':
      // Hits the floor: the ice shatters. Then he gets up and scrambles on.
      if (boss.isGroundedBoss && (boss.frozenTimer || 0) > 0) shatter(ctx, boss);
      if (boss.isGroundedBoss && boss.stateTimer! <= 0) {
        boss.rotation = 0;
        boss.bossState = 'running';
        boss.scrambling = true;
      }
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
  const speed = (RUN_SPEED + pace(boss) * RUN_SPEED_RAMP) * (boss.scrambling ? SCRAMBLE_SPEED_MULT : 1);
  const dx = boss.slideTargetX! - boss.pos.x;
  // Scrambling back up after a shatter he can't be hurt (and flickers)
  if (boss.scrambling) boss.hitCooldown = Math.max(boss.hitCooldown || 0, 10);
  if (Math.abs(dx) <= speed) {
    boss.vel.x = 0;
    boss.bossState = 'idle';
    boss.stateTimer = boss.scrambling ? RESUME_FRAMES : Math.round(RUN_REST * (1 - pace(boss) * 0.4));
    boss.scrambling = false;
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

/**
 * Weakness: shotgun ice catching him mid-jump or mid-run freezes him solid.
 * He remembers where he was headed so he can scramble there afterwards.
 */
const freeze = (ctx: FrameContext, boss: Enemy, p?: Partial<Projectile>) => {
  if (!p?.isIce) return;
  const running = boss.bossState === 'running' && !boss.scrambling;
  const jumping = !boss.isGroundedBoss && boss.bossState !== 'stunned_drop' && boss.bossState !== 'frozen';
  if (!running && !jumping) return;
  if (jumping) {
    const dir = Math.abs(boss.vel.x) > 0.5 ? Math.sign(boss.vel.x) : (midX(boss) < ARENA_MID ? 1 : -1);
    boss.slideTargetX = dir > 0 ? ARENA_RIGHT - boss.width - 30 : ARENA_LEFT + 30;
  }
  boss.bossState = 'frozen';
  boss.stateTimer = FREEZE_FRAMES;
  boss.frozenTimer = 999; // encased until he shatters
  boss.vel.x = 0;
  boss.vel.y = 0;
  ctx.fx.spawnExplosion({ x: midX(boss), y: boss.pos.y + boss.height / 2 }, '#E0FFFF', 16, 0, 10);
  ctx.fx.playGunSound('ice');
};

/** He's hit the floor in his block of ice: it shatters, and so does a good chunk of his health. */
const shatter = (ctx: FrameContext, boss: Enemy) => {
  const { fx } = ctx;
  const at = { x: midX(boss), y: boss.pos.y + boss.height / 2 };
  boss.frozenTimer = 0;
  boss.health -= SHATTER_DAMAGE;
  boss.hitCooldown = 60;
  fx.spawnDamageNumber(boss.pos, SHATTER_DAMAGE, true);
  fx.spawnGlassShatter(at);
  fx.spawnExplosion(at, '#B3F0FF', 25, 0, 16);
  fx.spawnKillCallout(boss, 'shatter');
  fx.playGunSound('ice');
  ctx.bossHelpers.setScreenShake(15);
  if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, 0, true, 'SHOTGUN');
};

export const ernie: BossDef = {
  id: 'Ernie Earthquake',
  weakness: 'SHOTGUN',
  weaknessDamage: ICE_HIT_DAMAGE,
  spawn: { x: 7700 },
  update,
  // Floaty on the way up, heavy on the way down
  physics: { gravity: boss => (boss.isGroundedBoss ? 1 : 0.5), onLand },
  onWeaknessHit: freeze,
};
