// The taser beam and damage-over-time effects (fire, needles), plus running boss AI.

import { Enemy, Projectile } from '../../types';
import {
  CANVAS_WIDTH, ENEMY_HIT_COOLDOWN, TASER_RANGE, TASER_DOT_DAMAGE, TASER_FIRE_THRESHOLD,
  TASER_TICK_RATE, TASER_AMMO_CONSUMPTION_RATE, FIRE_TICK_RATE, FIRE_DOT_DAMAGE,
  FIRE_DOT_DAMAGE_HEAVY, NEEDLE_DOT_TICK_RATE, NEEDLE_DOT_DAMAGE_PER_STACK,
} from '../../constants';
import { FrameContext, killBoss } from '../context';
import { updateBossAI, getBossDamage, checkIsWeakness, isTommyShielded, maybeReactToWeapon } from '../boss';
import { fireWeapon, findTaserTarget } from '../weapons';
import { FrameInput, hasAmmo } from './player';

/**
 * Holding fire with the taser locks onto a target and zaps it continuously.
 * Regular enemies are frozen, take damage over time and eventually catch fire.
 */
export const updateTaser = (ctx: FrameContext, input: FrameInput) => {
  const { state, fx, stageId, currentWeapon, cheats } = ctx;
  const { player, enemies, projectiles } = state;

  if (!(currentWeapon === 'TASER' && input.shoot && hasAmmo(ctx, 'TASER'))) {
    player.isTasing = false;
    player.taserTargetId = null;
    player.taserTimer = 0;
    return;
  }

  if (!player.isTasing) fireWeapon(ctx, input);
  if (!player.isTasing) return;

  player.taserTimer = (player.taserTimer || 0) + 1;
  if (!cheats.infiniteAmmo && state.frame % TASER_AMMO_CONSUMPTION_RATE === 0) player.weaponAmmo['TASER'] -= 1;
  player.vel.x = 0;
  if (player.weaponAmmo['TASER'] <= 0) {
    player.isTasing = false;
    player.taserTargetId = null;
  }

  if (!player.taserTargetId) {
    const nearest = findTaserTarget(state);
    if (nearest) player.taserTargetId = nearest.id;
  }

  const target: Enemy | Projectile | undefined = enemies.find(e => e.id === player.taserTargetId) || projectiles.find(p => p.id === player.taserTargetId);
  if (target && (target.pos.x + target.width < state.camera.x || target.pos.x > state.camera.x + CANVAS_WIDTH)) {
    player.taserTargetId = null;
  }
  if (!target || target.health <= 0) return;

  const dx = (target.pos.x + target.width / 2) - (player.pos.x + player.width / 2);
  const dy = (target.pos.y + target.height / 2) - (player.pos.y + player.height / 2);
  if (Math.hypot(dx, dy) > TASER_RANGE + 100) {
    player.taserTargetId = null;
    return;
  }

  if (target.type === 'boss') {
    const boss = target as Enemy;
    if (boss.hitCooldown && boss.hitCooldown > 0) return;
    if (stageId === 'Toxic Tommy' && isTommyShielded(boss, state)) {
      fx.spawnExplosion(boss.pos, '#27AE60', 4, 0, 3);
      return;
    }
    const dmg = getBossDamage(boss, stageId, currentWeapon);
    const isW = checkIsWeakness(stageId, currentWeapon);
    boss.health -= dmg;
    boss.hitCooldown = ENEMY_HIT_COOLDOWN;
    fx.spawnDamageNumber(boss.pos, dmg, isW);
    maybeReactToWeapon(boss, 'TASER', stageId, state, ctx.bossHelpers);
    if (boss.health <= 0) killBoss(ctx, boss, player.facing, isW);
    return;
  }

  target.isTased = true;
  if (state.frame % TASER_TICK_RATE === 0) {
    target.health -= TASER_DOT_DAMAGE;
    fx.spawnDamageNumber(target.pos, TASER_DOT_DAMAGE);
    if (target.health <= 0) {
      if (target.type === 'enemy') {
        fx.blowAwayEnemy(target as Enemy, { x: (Math.random() - 0.5) * 10, y: -15 }, 'taser_kill');
        fx.spawnKillCallout(target, 'fried');
      }
      player.taserTargetId = null;
    }
  }
  if (player.taserTimer! >= TASER_FIRE_THRESHOLD && !target.isOnFire) {
    target.isOnFire = true;
    fx.playGunSound('ignite');
  }
};

const spawnFlames = (ctx: FrameContext, box: { pos: { x: number, y: number }, width: number, height: number }, withSparks: boolean) => {
  const { particles } = ctx.state;
  const vx = (Math.random() - 0.5) * 9;
  const vy = -Math.random() * 15;
  particles.push({ pos: { x: box.pos.x + Math.random() * box.width, y: box.pos.y + Math.random() * box.height }, vel: { x: vx, y: vy }, life: 45, color: '#FF4500', size: 10 + Math.random() * 12 });
  if (withSparks && Math.random() > 0.4) particles.push({ pos: { x: box.pos.x + Math.random() * box.width, y: box.pos.y + Math.random() * box.height }, vel: { x: vx * 0.6, y: vy * 0.8 }, life: 30, color: '#FFFF00', size: 6 + Math.random() * 8 });
};

/** Burning meth barrels take heavy fire damage; tased-state is cleared when the beam moves on. */
export const updateBurningProjectiles = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  state.projectiles.forEach(p => {
    if (p.health > 0 && p.isOnFire) {
      p.fireTimer = (p.fireTimer || 0) + 1;
      if (p.fireTimer >= FIRE_TICK_RATE) {
        p.health -= FIRE_DOT_DAMAGE_HEAVY;
        fx.spawnDamageNumber(p.pos, FIRE_DOT_DAMAGE_HEAVY);
        p.fireTimer = 0;
      }
      if (state.frame % 2 === 0) spawnFlames(ctx, p, false);
    }
    if (!player.isTasing || player.taserTargetId !== p.id) p.isTased = false;
  });
};

/** Fire and needle damage-over-time, boss AI, and freezing from ice/taser. */
export const updateEnemyStatusEffects = (ctx: FrameContext) => {
  const { state, fx, stageId, currentWeapon, cheats } = ctx;
  const { player } = state;

  state.enemies.forEach(e => {
    if (e.health > 0 && e.isOnFire) {
      e.fireTimer = (e.fireTimer || 0) + 1;
      if (e.fireTimer >= FIRE_TICK_RATE) {
        const isBoss = e.type === 'boss';
        const dmg = isBoss ? FIRE_DOT_DAMAGE : FIRE_DOT_DAMAGE_HEAVY;
        e.health -= dmg;
        fx.spawnDamageNumber(e.pos, dmg);
        e.fireTimer = 0;
        if (e.health <= 0) {
          if (isBoss) killBoss(ctx, e, 0, false);
          else fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 10, y: -15 }, 'flamethrower_kill');
        }
      }
      if (state.frame % 2 === 0) spawnFlames(ctx, e, true);
    }

    if (e.health > 0 && e.needleCount && e.needleCount > 0) {
      e.dotTimer = (e.dotTimer || 0) + 1;
      if (stageId === 'Blackout Barry' && e.type === 'boss') {
        // Barry's weakness: up to 3 needles stick for 10s, each dealing 15/s
        if (e.needleTimer) e.needleTimer--;
        if (e.needleTimer! <= 0) {
          e.needleCount = 0;
          e.needleOffsets = [];
        } else if (e.dotTimer >= 60) {
          const dotDmg = e.needleCount * 15;
          e.health -= dotDmg;
          fx.spawnDamageNumber(e.pos, dotDmg);
          e.dotTimer = 0;
          if (e.health <= 0) killBoss(ctx, e, 0, false, 'NEEDLES');
        }
      } else if (e.dotTimer >= NEEDLE_DOT_TICK_RATE) {
        const dotDmg = e.needleCount * NEEDLE_DOT_DAMAGE_PER_STACK;
        e.health -= dotDmg;
        fx.spawnDamageNumber(e.pos, dotDmg);
        e.dotTimer = 0;
        if (e.health <= 0) {
          if (e.type === 'boss') killBoss(ctx, e, 0, false);
          else {
            fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 10, y: -15 }, 'dart_kill');
            fx.spawnKillCallout(e, 'overdose');
          }
        }
      }
    }

    if (e.type === 'boss') {
      if (e.health > 0 && state.arenaLocked) updateBossAI(e, stageId, player, currentWeapon, cheats.invincible, state, ctx.bossHelpers);
    } else if (((e.frozenTimer && e.frozenTimer > 0) || (e.isTased && player.isTasing && player.taserTargetId === e.id)) && (e.pauseTimer || 0) <= 0) {
      e.vel.x = 0;
      e.vel.y = 0;
    } else {
      e.isTased = false;
    }
  });
};
