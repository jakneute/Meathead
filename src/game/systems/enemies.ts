// Regular enemy movement, oiled-enemy collisions and body contact with the player.

import { Enemy, Rect } from '../../types';
import {
  CANVAS_WIDTH, GRAVITY, PLAYER_INVINCIBILITY_FRAMES, PLAYER_STUN_INVINCIBILITY,
  PLAYER_PUSHBACK_DURATION, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, BOSS_CHARGE_DAMAGE,
  BOSS_UPPERCUT_DAMAGE, ENEMY_UPPERCUT_DAMAGE, BOSS_DIVEKICK_DAMAGE, ENEMY_DIVEKICK_DAMAGE,
  ENEMY_HIT_COOLDOWN, ENEMY_BULLET_DAMAGE, FILTH_SHIELD_CONTACT_DAMAGE, OIL_ROCKET_OILED_DURATION,
  OILED_COLLISION_DAMAGE,
} from '../../constants';
import { FrameContext, killBoss } from '../context';
import { isTommyShielded } from '../boss';
import { rectsOverlap, boundsOf } from '../utils';
import { killPlayer, getAttackHitbox, harmlessBounce, getContactHurtSource } from './player';

/** Moves one enemy and resolves its contact with the player. Returns false to remove it. */
export const updateEnemy = (ctx: FrameContext, e: Enemy, enemies: Enemy[]): boolean => {
  const { state } = ctx;
  if (e.isBlownAway) {
    // Dead bodies tumble off-screen
    e.pos.x += e.vel.x;
    e.pos.y += e.vel.y;
    e.vel.y += GRAVITY * 0.5;
    e.rotation = (e.rotation || 0) + 0.3;
    return e.pos.y < 1000;
  }
  if (e.health <= 0) return false;
  if (e.hitCooldown && e.hitCooldown > 0) e.hitCooldown--;
  if (e.enemyCollisionCooldown && e.enemyCollisionCooldown > 0) e.enemyCollisionCooldown--;

  if (e.isOiled) updateOiledDrips(ctx, e);

  const { player } = state;
  if ((e.frozenTimer && e.frozenTimer > 0) || (e.isTased && player.isTasing && player.taserTargetId === e.id)) {
    if (e.frozenTimer) e.frozenTimer--;
  } else {
    e.isTased = false;
  }

  moveEnemy(ctx, e);
  if (e.sludgeTimer && e.sludgeTimer > 0) e.sludgeTimer--;

  if (e.isOiled && !e.isBlownAway && e.health > 0 && Math.abs(e.vel.x) > 1.2 && (!e.enemyCollisionCooldown || e.enemyCollisionCooldown <= 0)) {
    resolveOiledSlideCollision(ctx, e, enemies);
  }

  return resolvePlayerContact(ctx, e);
};

const isAirEnemy = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

const updateOiledDrips = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  e.oiledTimer = (e.oiledTimer || 0) - 1;
  if (e.oiledTimer <= 0) e.isOiled = false;
  if (state.frame % 2 === 0) {
    state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height }, vel: { x: (Math.random() - 0.5) * 1, y: 0.5 + Math.random() * 1.5 }, life: 30, color: '#000000', size: 3 + Math.random() * 5 });
  }
  if (state.frame % 5 === 0) {
    state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: 0, y: 0 }, life: 10, color: '#3E2723', size: 6 + Math.random() * 4 });
  }
  if (Math.abs(e.vel.x) > 1.2 && state.frame % 2 === 0) {
    state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height - 2 }, vel: { x: -Math.sign(e.vel.x) * (Math.random() * 2 + 1), y: -Math.random() * 1.5 }, life: 18, color: '#1A110F', size: 4 + Math.random() * 4 });
  }
};

const fireEnemyBullet = (ctx: FrameContext, x: number, y: number, velX: number) => {
  ctx.state.projectiles.push({ id: `ep-${Date.now()}`, pos: { x, y }, vel: { x: velX, y: 0 }, width: 14, height: 14, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy' });
};

/** Patrol / shoot / hover behaviour for regular enemies, plus knockback physics. */
const moveEnemy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const { player } = state;
  const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  const isStunned = (e.pauseTimer || 0) > 0;
  const isHeld = (e.frozenTimer && e.frozenTimer > 0) || e.isTased;
  const air = isAirEnemy(e);

  // Air enemies bob around their spawn height (sludge drags them down to the floor)
  if (air) {
    if (e.initialY === undefined) e.initialY = e.pos.y;
    if (!isHeld) {
      if (isStunned) {
        e.pauseTimer!--;
        e.pos.x += e.vel.x;
        e.vel.x *= 0.92;
        e.pos.y += e.vel.y;
        e.vel.y *= 0.92;
      } else if (e.sludgeTimer && e.sludgeTimer > 0) {
        e.pos.y = Math.min(e.pos.y + 3.5, 550 - e.height);
      } else {
        e.pos.y += Math.sin((state.frame + (e.initialX || 0)) / 25) * 1.2;
        if (e.pos.y > e.initialY) e.pos.y = Math.max(e.initialY, e.pos.y - 0.8);
      }
    }
  }

  if (e.type === 'boss' || isHeld) return;

  if (air) {
    if (isStunned) return;
    if (e.behavior === 'patrol' || e.behavior === 'fly') {
      if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1;
    } else if (e.behavior === 'shoot' && onScreen && ++e.shootTimer > 60) {
      fireEnemyBullet(ctx, e.pos.x + e.width / 2, e.pos.y + e.height - 10, player.pos.x < e.pos.x ? -7 : 7);
      e.shootTimer = 0;
    }
    e.pos.x += e.vel.x;
    return;
  }

  const floorLevel = 550 - e.height;
  if (e.pos.y < floorLevel - 1) {
    // Launched into the air by knockback
    e.pos.x += e.vel.x;
    e.pos.y += e.vel.y;
    e.vel.y += GRAVITY * 0.75;
    e.vel.x *= (e.isOiled ? 0.985 : 0.97);
    if (e.pos.y >= floorLevel) {
      e.pos.y = floorLevel;
      e.vel.y = 0;
      e.vel.x *= (e.isOiled ? 0.95 : 0.7);
    }
    if (isStunned) e.pauseTimer!--;
    return;
  }

  e.pos.y = floorLevel;
  e.vel.y = 0;
  if (isStunned) {
    // Sliding from knockback (oiled enemies slide further)
    e.pauseTimer!--;
    e.vel.x *= (e.isOiled ? 0.965 : 0.88);
    e.pos.x += e.vel.x;
    if (Math.abs(e.vel.x) < 0.1) e.vel.x = 0;
    return;
  }

  if (e.id.startsWith('rusher')) {
    const sameLevel = Math.abs((player.pos.y + player.height / 2) - (e.pos.y + e.height / 2)) < 80;
    e.vel.x = (onScreen && player.invincibilityTimer <= 0 && sameLevel) ? (player.pos.x < e.pos.x ? -1 : 1) * 6 : 0;
  } else if (e.behavior === 'patrol') {
    if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1;
  } else if (e.behavior === 'shoot' && onScreen) {
    e.shootTimer++;
    if (e.enemyType === 'shield') {
      // Shield drops briefly to fire
      e.isShieldActive = e.shootTimer < 80;
      if (e.shootTimer > 120) {
        fireEnemyBullet(ctx, e.pos.x, e.pos.y + 15, -6);
        e.shootTimer = 0;
      }
    } else if (e.shootTimer > 60) {
      fireEnemyBullet(ctx, e.pos.x + e.width / 2, e.pos.y + 10, player.pos.x < e.pos.x ? -7 : 7);
      e.shootTimer = 0;
    }
  }
  e.pos.x += e.vel.x;
};

/** An oiled enemy sliding fast bowls into other enemies, hurting both. */
const resolveOiledSlideCollision = (ctx: FrameContext, e: Enemy, enemies: Enemy[]) => {
  const { state, fx } = ctx;
  for (const other of enemies) {
    if (other === e || other.isBlownAway || other.health <= 0 || (other.enemyCollisionCooldown && other.enemyCollisionCooldown > 0)) continue;
    if (!rectsOverlap(boundsOf(e), boundsOf(other))) continue;

    const slideDir = Math.sign(e.vel.x) || (other.pos.x > e.pos.x ? 1 : -1);
    const speed = Math.abs(e.vel.x);
    e.enemyCollisionCooldown = 20;
    other.enemyCollisionCooldown = 20;
    e.health -= OILED_COLLISION_DAMAGE;
    other.health -= OILED_COLLISION_DAMAGE;
    fx.spawnDamageNumber(e.pos, OILED_COLLISION_DAMAGE);
    fx.spawnDamageNumber(other.pos, OILED_COLLISION_DAMAGE);

    const midX = (e.pos.x + e.width / 2 + other.pos.x + other.width / 2) / 2;
    const midY = (e.pos.y + e.height / 2 + other.pos.y + other.height / 2) / 2;
    fx.spawnExplosion({ x: midX, y: midY }, '#3E2723', 10, 0, 5);
    for (let i = 0; i < 8; i++) {
      state.particles.push({ pos: { x: midX, y: midY }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 8 - 2 }, life: 25, color: Math.random() > 0.4 ? '#1A110F' : '#FFD700', size: 4 + Math.random() * 4 });
    }
    fx.playGunSound();

    if (other.type !== 'boss') {
      other.vel.x = slideDir * Math.max(10, speed * 0.85);
      other.vel.y = -8;
      other.pauseTimer = 30;
      other.isOiled = true;
      other.oiledTimer = Math.max(other.oiledTimer || 0, OIL_ROCKET_OILED_DURATION);
    }
    if (e.type !== 'boss') {
      e.vel.x = -slideDir * Math.max(4, speed * 0.4);
      e.vel.y = -5;
      e.pauseTimer = 20;
    }

    if (e.health <= 0) {
      e.health = 0;
      fx.blowAwayEnemy(e, { x: -slideDir * 12, y: -12 }, 'oil_kill', -slideDir);
      fx.spawnDamageNumber(e.pos, 'CRUSHED!', true, '#FFA500');
    }
    if (other.health <= 0) {
      if (other.type === 'boss') {
        killBoss(ctx, other, slideDir, false);
      } else {
        other.health = 0;
        fx.blowAwayEnemy(other, { x: slideDir * 14, y: -14 }, 'oil_kill', slideDir);
        fx.spawnDamageNumber(other.pos, 'CRUSHED!', true, '#FFA500');
      }
    }
    break;
  }
};

/**
 * Special moves (and the filth shield) hurt enemies on contact; otherwise
 * touching an enemy hurts the player. Returns false if the enemy was destroyed.
 */
const resolvePlayerContact = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx, stageId, cheats } = ctx;
  const { player } = state;
  const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  const hasShield = !!(player.filthShieldTimer && player.filthShieldTimer > 0);
  const isAttacking = player.isCharging || player.isUppercutting || player.isDivekicking || hasShield;
  const attackHit = isAttacking && rectsOverlap(getAttackHitbox(ctx), boundsOf(e));

  if (attackHit && onScreen && (!e.hitCooldown || e.hitCooldown <= 0)) {
    if (e.type === 'boss' && !state.arenaLocked) {
      harmlessBounce(ctx, e, 18, -4);
      return true;
    }
    if (e.type === 'boss' && stageId === 'Toxic Tommy' && isTommyShielded(e, state)) {
      fx.spawnExplosion(player.pos, '#27AE60', 12, 0, 6);
      fx.playGunSound('barf');
      harmlessBounce(ctx, e, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y);
      player.isCharging = false;
      player.isUppercutting = false;
      player.isDivekicking = false;
      player.invincibilityTimer = PLAYER_STUN_INVINCIBILITY;
      return true;
    }
    if (e.id === 'boss' && stageId === 'Hector Hurricane' && e.bossState === 'hurricane') e.stateTimer = 0;

    let damage = 0;
    if (player.isCharging) damage = BOSS_CHARGE_DAMAGE;
    else if (player.isUppercutting) damage = (e.type === 'boss' ? BOSS_UPPERCUT_DAMAGE : ENEMY_UPPERCUT_DAMAGE);
    else if (player.isDivekicking) damage = (e.type === 'boss' ? BOSS_DIVEKICK_DAMAGE : ENEMY_DIVEKICK_DAMAGE);

    if (hasShield) {
      damage += FILTH_SHIELD_CONTACT_DAMAGE;
      player.filthShieldTimer = 0;
      fx.spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#43A047', 15, 0, 15);
    }

    // Frozen enemies take double damage and shatter
    const wasFrozen = !!(e.frozenTimer && e.frozenTimer > 0);
    if (wasFrozen) damage *= 2;

    e.health -= damage;
    e.hitCooldown = ENEMY_HIT_COOLDOWN;
    fx.spawnDamageNumber(e.pos, damage, player.isUppercutting || player.isDivekicking || wasFrozen || hasShield);

    if (e.health > 0) {
      if (wasFrozen) e.frozenTimer = 0;
      if (e.id.startsWith('rusher')) { e.vel.x = player.facing * 15; e.pauseTimer = 120; }
      else if (e.type !== 'boss') e.pauseTimer = 60;

      if (player.isDivekicking) {
        // Non-lethal divekick: Meathead clips into the enemy and takes damage himself
        player.isDivekicking = false;
        player.isGrounded = false;
        player.vel.x = player.facing * 2;
        player.vel.y = 4;
        if (!cheats.invincible) {
          const isDale = stageId === 'Drug Trade Dale';
          player.health -= e.type === 'boss' ? (isDale ? 10 : 8) : (isDale ? 7.5 : 5.5);
          player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
          player.isHarmlessPushback = false;
          player.smugTimer = 0;
          fx.speakVulgarity('hurt', getContactHurtSource(ctx, e));
          if (player.health <= 0) {
            player.health = 0;
            if (state.deathTimer <= 0) killPlayer(ctx, "YOU DIED");
          }
        }
        state.screenShakeTimer = 12;
        fx.spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#FF0000', 14, 0, 8);
        fx.playGunSound();
      } else {
        player.vel = { x: (player.pos.x + player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
        player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
        player.isCharging = false;
        player.isUppercutting = false;
        player.invincibilityTimer = PLAYER_STUN_INVINCIBILITY;
        player.isHarmlessPushback = true;
        player.smugTimer = 35;
        player.hurtTimer = 0;
      }
      return true;
    }

    // Lethal hit
    if (e.type === 'boss') {
      killBoss(ctx, e, player.facing, false);
    } else {
      e.isBlownAway = true;
      if (player.isDivekicking) {
        // Splat the enemy into the ground; Meathead keeps plummeting
        e.vel = { x: player.facing * 8, y: 18 };
        fx.spawnDeathShower(e.pos, player.facing, 2.5);
        fx.spawnExplosion(e.pos, '#8B0000', 16, 0, 12);
        fx.spawnDamageNumber(e.pos, "SPLAT!", true, '#FF0000');
        fx.speakVulgarity('charge_kill');
      } else {
        e.vel = { x: player.isUppercutting ? 0 : player.facing * 30, y: player.isUppercutting ? -30 : -5 };
        if (wasFrozen) fx.spawnGlassShatter(e.pos);
        else fx.spawnDeathShower(e.pos, player.facing);
        fx.speakVulgarity(hasShield ? 'sludge_kill' : (player.isUppercutting ? 'uppercut_kill' : 'charge_kill'));
      }
      fx.spawnPickup(e.pos);
      player.killSatisfactionTimer = 60;
    }
    return false;
  }

  // Plain body contact hurts the player (ducking shrinks the hurtbox)
  const hurtbox: Rect = player.isDucking
    ? { x: player.pos.x + 2, y: player.pos.y + (player.height - 26), w: player.width - 4, h: 26 }
    : boundsOf(player);
  if (!isAttacking && player.invincibilityTimer <= 0 && rectsOverlap(hurtbox, boundsOf(e))) {
    if (!cheats.invincible) player.health -= (stageId === 'Drug Trade Dale' ? 7.5 : 5.5);
    if (player.health > 0) {
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      fx.speakVulgarity('hurt', getContactHurtSource(ctx, e));
      player.pushbackTimer = (stageId === 'Drug Trade Dale' && e.bossState !== 'idle') ? 24 : PLAYER_PUSHBACK_DURATION;
      player.vel = { x: (player.pos.x < e.pos.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
    }
    if (e.id === 'boss' && stageId === 'Hector Hurricane' && e.bossState === 'hurricane') e.stateTimer = 0;
    if (e.id.startsWith('rusher')) e.pauseTimer = 60;
  }
  return true;
};
