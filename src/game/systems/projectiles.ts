// Projectile movement, bouncing/lingering physics and all projectile hit resolution.

import { Enemy, Projectile } from '../../types';
import {
  CANVAS_WIDTH, GRAVITY, BOSS_DOOR_X, DOOR_WIDTH, PLAYER_INVINCIBILITY_FRAMES,
  PLAYER_PUSHBACK_DURATION, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, ENEMY_HIT_COOLDOWN,
  BOULDER_BOUNCE_DAMPING, BOULDER_SHRAPNEL_COUNT, SHOTGUN_FREEZE_TIME, NEEDLE_OVERDOSE_THRESHOLD,
  SLUDGE_DOT_DAMAGE, SLUDGE_DOT_TICK, SLUDGE_LINGER_DURATION, OIL_ROCKET_OILED_PUSHBACK_MULT,
} from '../../constants';
import { BOSS_DIALOGUE } from '../../dialogue';
import { FrameContext, killBoss } from '../context';
import { getBossDamage, checkIsWeakness, isTommyShielded, stunTommyWithOil, artieWeaknessLeap } from '../boss';
import { explodeOilRocket } from '../weapons';
import { pickRandom, rectsOverlap, boundsOf } from '../utils';
import { getAttackHitbox } from './player';

/** Moves one projectile and resolves its collisions. Returns false to remove it. */
export const updateProjectile = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;

  if (p.isMethBarrel && p.health <= 0) {
    fx.spawnMethExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
    return false;
  }
  if (p.health <= 0) return false;
  if (p.isOilRocket) return updateOilRocket(ctx, p);

  // Filth shield swallows enemy shots
  if (p.owner === 'enemy' && player.filthShieldTimer && player.filthShieldTimer > 0) {
    const pad = 20;
    const shieldBox = { x: player.pos.x - pad, y: player.pos.y - pad, w: player.width + pad * 2, h: player.height + pad * 2 };
    if (rectsOverlap(boundsOf(p), shieldBox)) {
      player.filthShieldTimer = 0;
      fx.spawnExplosion(p.pos, '#ADFF2F', 15, 0, 10);
      return false;
    }
  }

  // Hector's poop logs disintegrate if they fly back into him
  if (p.isPoop) {
    for (const b of state.enemies.filter(e => e.type === 'boss')) {
      if (Math.abs((p.pos.x + p.width / 2) - (b.pos.x + b.width / 2)) < 80 && Math.abs((p.pos.y + p.height / 2) - (b.pos.y + b.height / 2)) < 80) {
        fx.spawnPoopExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, 15);
        return false;
      }
    }
  }

  // Bouncing projectiles eventually fizzle out
  if (p.bounceDecay !== undefined && --p.bounceDecay <= 0) {
    if (p.isIce) {
      const fizzleColors = ['#FFFFFF', '#E0FFFF', '#AFEEEE', '#B0E0E6'];
      for (let i = 0; i < 12; i++) {
        state.particles.push({ pos: { x: p.pos.x + Math.random() * 14 - 7, y: p.pos.y + Math.random() * 14 - 7 }, vel: { x: (Math.random() - 0.5) * 2.0, y: -Math.random() * 2.0 - 0.5 }, life: 25 + Math.random() * 35, color: pickRandom(fizzleColors), size: 2 + Math.random() * 6 });
      }
    }
    return false;
  }

  const hasPhysics = p.isBoulder || (p.isIce && (p.width > 30 || p.width <= 20 || p.owner === 'player')) || p.isShrapnel || p.isCocaine || p.isMethBarrel || p.isSludge || p.isPoop;
  if (hasPhysics) {
    if (!updatePhysicsProjectile(ctx, p)) return false;
  } else {
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    if (p.life !== undefined && --p.life <= 0) return false;
  }

  if (p.pos.x < state.camera.x - 400 || p.pos.x > state.camera.x + CANVAS_WIDTH + 400) return false;

  return p.owner === 'player' ? resolvePlayerProjectileHits(ctx, p) : resolveEnemyProjectileHit(ctx, p);
};

const updateOilRocket = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;

  // Smoke trail and dripping oil
  if (state.frame % 2 === 0) {
    state.particles.push({ pos: { x: p.pos.x + (p.vel.x > 0 ? 0 : p.width), y: p.pos.y + p.height / 2 }, vel: { x: -p.vel.x * 0.2, y: (Math.random() - 0.5) * 4 }, life: 30, color: '#000000', size: 6 + Math.random() * 6 });
  }
  if (state.frame % 3 === 0) {
    state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height }, vel: { x: p.vel.x * 0.1, y: 1 + Math.random() * 3 }, life: 20 + Math.random() * 20, color: '#000000', size: 4 + Math.random() * 4 });
  }

  const box = boundsOf(p);
  const explode = () => { explodeOilRocket(ctx, { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, p.vel.x); return false; };
  for (const b of state.blocks) {
    // Rockets fired inside the arena pass through the (closed) door wall behind them
    if (state.arenaLocked && b.x <= BOSS_DOOR_X + DOOR_WIDTH && p.vel.x > 0) continue;
    if (b.type !== 'pit' && rectsOverlap(box, b)) return explode();
  }
  for (const e of state.enemies) {
    if (e.health > 0 && !e.isBlownAway && rectsOverlap(box, boundsOf(e))) return explode();
  }
  return true;
};

/** Gravity-affected projectiles: bouncing, sliding, shattering and lingering sludge. */
const updatePhysicsProjectile = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;
  const isSmallIce = (p.isIce && p.width <= 20) || (p.owner === 'player' && p.isIce);

  if (!p.isLingering) {
    let gravity = GRAVITY * (p.isSludge ? 1.8 : 1.0);
    if (p.isMethBarrel) gravity = GRAVITY * 1.5;
    if (isSmallIce || p.isShrapnel) gravity = GRAVITY * 0.4;
    if (p.isPoop) gravity = 0;
    p.vel.y += gravity;
    if (p.isSliding) p.vel.y = 1.5;
    p.pos.y += p.vel.y;
  }

  for (const b of state.blocks) {
    if (b.type === 'pit' || !rectsOverlap(boundsOf(p), b)) continue;
    // Poop logs fly through walls near where they spawned
    if (p.isPoop && p.spawnX !== undefined && Math.abs(p.pos.x - p.spawnX) < 200) continue;

    // NOTE: compares against the player's x, not the projectile's (original behaviour, kept as-is)
    const overlapX = Math.min(p.pos.x + p.width - b.x, b.x + b.w - player.pos.x);
    const overlapY = Math.min(p.pos.y + p.height - b.y, b.y + b.h - player.pos.y);
    if (overlapX < overlapY) {
      // Hit a wall
      if (p.isMethBarrel) { p.vel.x *= -0.8; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
      if (p.isBoulder) { shatterBoulder(ctx, p); return false; }
      if (p.isCocaine) { fx.spawnPowderExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, 30); return false; }
      if (p.isSludge) { p.isSliding = true; p.vel.x = 0; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
      if (p.isIce && p.width > 30) {
        // Artie's big ice block breaks into shards
        for (let i = 0; i < 3; i++) state.projectiles.push({ id: `shard-${Date.now()}-${i}`, pos: { x: p.pos.x + 20, y: p.pos.y + 20 }, vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 }, width: 20, height: 20, health: 1, maxHealth: 1, type: 'projectile', damage: 15, owner: 'enemy', isIce: true, life: 75 });
        fx.spawnGlassShatter(p.pos);
        return false;
      }
      if (isSmallIce) {
        p.vel.x *= -1.0;
        p.pos.x += p.vel.x;
        if (p.owner === 'player' && p.isIce && p.bounceDecay === undefined) p.bounceDecay = 15;
      }
      if (p.isShrapnel) return false;
      if (p.isPoop) { fx.spawnPoopExplosion(p.pos, 25); return false; }
    } else {
      // Hit a floor or ceiling
      if (p.isSludge) {
        // Splat into a lingering puddle
        p.isLingering = true;
        p.life = SLUDGE_LINGER_DURATION;
        p.vel = { x: 0, y: 0 };
        p.width = 70 + Math.random() * 30;
        p.height = 15 + Math.random() * 10;
        p.pos.y = b.y - p.height;
        p.pos.x -= p.width / 2;
        break;
      }
      if (p.isMethBarrel) {
        p.vel.y = -Math.abs(p.vel.y) * 0.8;
        p.vel.x *= 0.98;
        p.bounces = (p.bounces || 0) + 1;
        if (p.bounces > 100) { p.health = 0; return false; }
      } else {
        p.vel.y = Math.abs(p.vel.y) > 1.0 ? -p.vel.y * (p.isBoulder ? BOULDER_BOUNCE_DAMPING : 0.85) : 0;
      }
      p.pos.y = (p.pos.y + p.height / 2 < b.y + b.h / 2) ? b.y - p.height : b.y + b.h;
      if (p.owner === 'player' && p.isIce && p.bounceDecay === undefined) p.bounceDecay = 15;
    }
  }
  if (!p.isLingering) p.pos.x += p.vel.x;

  if (p.isSludge && p.isLingering) {
    p.life!--;
    damageEnemiesInSludgePuddle(ctx, p);
    if (state.frame % 4 === 0) {
      state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 6 }, life: 25, color: '#ADFF2F', size: 6 + Math.random() * 8 });
    }
    if (p.life! <= 0) return false;
  }
  if (p.isMethBarrel) p.rotation = (p.rotation || 0) + (p.vel.x * 0.05);
  return true;
};

const shatterBoulder = (ctx: FrameContext, p: Projectile) => {
  ctx.fx.spawnRockShatter(p.pos);
  ctx.fx.spawnBoulderShrapnel(p.pos, BOULDER_SHRAPNEL_COUNT, p.vel.x > 0 ? 1 : -1);
};

/** Enemies standing in a sludge puddle take damage over time (bosses take one hit, then it's used up). */
const damageEnemiesInSludgePuddle = (ctx: FrameContext, p: Projectile) => {
  const { state, fx, stageId } = ctx;
  const isDotTick = state.frame % SLUDGE_DOT_TICK === 0;
  for (const en of state.enemies) {
    if (p.life! <= 0) break;
    if (en.health <= 0 || en.isBlownAway) continue;
    const inPuddle = en.pos.x < p.pos.x + p.width && en.pos.x + en.width > p.pos.x && en.pos.y < p.pos.y + p.height + 15 && en.pos.y + en.height > p.pos.y;
    if (!inPuddle) continue;
    if (en.enemyType === 'flyer') en.sludgeTimer = 45; // keeps flyers pinned down

    if (en.type === 'boss') {
      if (en.hitCooldown && en.hitCooldown > 0) continue;
      const isW = stageId === 'Drug Trade Dale';
      const dmg = isW ? 50 : 15;
      en.health -= dmg;
      en.hitCooldown = ENEMY_HIT_COOLDOWN;
      fx.spawnDamageNumber(en.pos, dmg, isW);
      p.life = 0;
      if (en.health <= 0) killBoss(ctx, en, 0, isW);
    } else if (isDotTick) {
      en.health -= SLUDGE_DOT_DAMAGE;
      fx.spawnDamageNumber(en.pos, SLUDGE_DOT_DAMAGE);
      if (en.health <= 0) fx.blowAwayEnemy(en, { x: 0, y: -5 }, 'sludge_kill');
    }
  }
};

interface NeedleStickSpec {
  /** Minimum distance from the entry edge. */
  minDepth: number;
  /** Maximum penetration as a fraction of body width. */
  maxDepthPct: number;
  minY: number;
  bottomMargin: number;
  minSpacing: number;
  nudge: number;
}

const BOSS_NEEDLE: NeedleStickSpec = { minDepth: 6, maxDepthPct: 0.4, minY: 10, bottomMargin: 10, minSpacing: 12, nudge: 10 };
const ENEMY_NEEDLE: NeedleStickSpec = { minDepth: 4, maxDepthPct: 0.45, minY: 4, bottomMargin: 5, minSpacing: 10, nudge: 8 };

/** Records where a dart stuck into an enemy so it can be drawn poking out of them. */
const stickNeedle = (enemy: Enemy, p: Projectile, spec: NeedleStickSpec) => {
  if (!enemy.needleOffsets) enemy.needleOffsets = [];
  const clampDepth = (d: number) => Math.max(spec.minDepth, Math.min(enemy.width * spec.maxDepthPct, d));
  const clampY = (y: number) => Math.max(spec.minY, Math.min(enemy.height - spec.bottomMargin, y));
  const hitX = p.vel.x >= 0
    ? clampDepth((p.pos.x + p.width) - enemy.pos.x)
    : enemy.width - clampDepth((enemy.pos.x + enemy.width) - p.pos.x);
  let hitY = clampY((p.pos.y + p.height / 2) - enemy.pos.y);
  // Spread needles out so they don't stack on top of each other
  for (let attempt = 0; attempt < 5; attempt++) {
    if (!enemy.needleOffsets.some(o => Math.hypot(o.x - hitX, o.y - hitY) < spec.minSpacing)) break;
    hitY = clampY(hitY + ((attempt % 2 === 0) ? spec.nudge : -spec.nudge));
  }
  const rot = Math.atan2(p.vel.y, p.vel.x) + (Math.random() - 0.5) * 0.25;
  enemy.needleOffsets.push({ x: hitX, y: hitY, rot });
};

/** Player projectile vs. enemies, bosses and meth barrels. Returns false if the projectile is spent. */
const resolvePlayerProjectileHits = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;

  for (const enemy of state.enemies) {
    if (enemy.health <= 0 || enemy.isBlownAway || !rectsOverlap(boundsOf(p), boundsOf(enemy))) continue;
    if (p.isSludge && p.isLingering) continue;

    // Bosses are untouchable until the arena locks (boulders bounce off)
    if (enemy.type === 'boss' && !state.arenaLocked) {
      if (p.isBoulder) { p.vel.x *= -0.5; p.vel.y = -5; }
      continue;
    }

    // Shield enemies block shots from the front
    const hitsShieldSide = (p.vel.x > 0 && p.pos.x < enemy.pos.x) || (p.vel.x < 0 && p.pos.x > enemy.pos.x);
    if (enemy.enemyType === 'shield' && enemy.isShieldActive && hitsShieldSide) {
      if (p.isBoulder) shatterBoulder(ctx, p);
      return false;
    }

    if (enemy.type === 'boss') {
      const landedFullHit = hitBossWithProjectile(ctx, enemy, p);
      if (landedFullHit && p.isBoulder) shatterBoulder(ctx, p);
      return false;
    }

    if (p.isDart) {
      enemy.needleCount = (enemy.needleCount || 0) + 1;
      stickNeedle(enemy, p, ENEMY_NEEDLE);
      if (enemy.needleCount >= NEEDLE_OVERDOSE_THRESHOLD) {
        enemy.health = 0;
        enemy.isBlownAway = true;
        enemy.vel = { x: (Math.random() - 0.5) * 15, y: -25 };
        fx.spawnDeathShower(enemy.pos, 0, 3, false, 80);
        fx.spawnPickup(enemy.pos);
        fx.speakVulgarity('dart_kill');
        fx.spawnKillCallout(enemy, 'overdose');
      } else {
        enemy.health -= p.damage;
        fx.spawnDamageNumber(enemy.pos, p.damage);
        if (enemy.health <= 0) {
          fx.blowAwayEnemy(enemy, { x: (Math.random() - 0.5) * 10, y: -15 }, 'dart_kill');
          fx.spawnKillCallout(enemy, 'overdose');
        }
      }
      return false;
    }

    const wasFrozen = !!(enemy.frozenTimer && enemy.frozenTimer > 0);
    enemy.health -= p.damage;
    if (enemy.isOiled && !p.isOilRocket) {
      // Oiled enemies go flying from any hit
      enemy.vel.x = p.vel.x * OIL_ROCKET_OILED_PUSHBACK_MULT;
      enemy.vel.y = -8;
      enemy.pauseTimer = 30;
    }
    if (p.isIce) enemy.frozenTimer = SHOTGUN_FREEZE_TIME;
    fx.spawnDamageNumber(enemy.pos, p.damage, p.isBoulder);
    if (enemy.health <= 0) {
      // Killing an enemy that was already frozen shatters it
      if (wasFrozen) { fx.spawnGlassShatter(enemy.pos); fx.spawnKillCallout(enemy, 'shatter'); }
      else fx.spawnDeathShower(enemy.pos, 0, 1.2);
      fx.spawnPickup(enemy.pos);
      fx.speakVulgarity(p.isBoulder ? 'boulder_kill' : (p.isIce ? 'shotgun_kill' : (p.isSludge ? 'sludge_kill' : 'gun_kill')));
      player.killSatisfactionTimer = 60;
    }
    if (p.isBoulder) shatterBoulder(ctx, p);
    if (p.isSludge) { enemy.sludgeTimer = 45; p.health = 0; }
    return false;
  }

  for (const barrel of state.projectiles.filter(pr => pr.isMethBarrel)) {
    if (!rectsOverlap(boundsOf(p), boundsOf(barrel)) || p.isDart) continue;
    barrel.health = Math.max(0, barrel.health - p.damage);
    fx.spawnDamageNumber(barrel.pos, p.damage);
    if (p.isBoulder) shatterBoulder(ctx, p);
    if (p.isSludge) p.health = 0;
    return false;
  }
  return true;
};

/**
 * Damage, weakness reactions and death for a player projectile hitting the boss.
 * Returns true if a regular (non dart/sludge) hit landed.
 */
const hitBossWithProjectile = (ctx: FrameContext, boss: Enemy, p: Projectile): boolean => {
  const { state, fx, stageId, currentWeapon } = ctx;

  if (stageId === 'Toxic Tommy' && isTommyShielded(boss, state)) {
    fx.spawnExplosion(p.pos, '#27AE60', 10, 0, 5);
    fx.playGunSound('barf');
    return false;
  }
  if (boss.hitCooldown && boss.hitCooldown > 0) return false;
  const isDartOrSludge = !!(p.isDart || p.isSludge);

  if (p.isDart && stageId === 'Blackout Barry') {
    // Barry's weakness: needles stick (max 3) and drain him over time instead of hitting
    boss.needleCount = Math.min(3, (boss.needleCount || 0) + 1);
    boss.needleTimer = 600;
    if (!boss.needleOffsets) boss.needleOffsets = [];
    if (boss.needleOffsets.length >= 3) boss.needleOffsets.shift();
    stickNeedle(boss, p, BOSS_NEEDLE);
    p.health = 0;
    return false;
  }

  // Ernie gets knocked out of the air by ice
  if (stageId === 'Ernie Earthquake' && !boss.isGroundedBoss && p.isIce && !isDartOrSludge) {
    boss.bossState = 'stunned_drop';
    boss.stateTimer = 90;
    boss.vel.y = 15;
    boss.rotation = Math.PI / 2;
    fx.spawnGlassShatter(p.pos);
  }

  const dmg = getBossDamage(boss, stageId, currentWeapon, p);
  const isW = checkIsWeakness(stageId, currentWeapon, p);
  boss.health -= dmg;
  boss.hitCooldown = ENEMY_HIT_COOLDOWN;
  fx.spawnDamageNumber(boss.pos, dmg, isW);
  if (stageId === 'Artie Avalanche' && isW && boss.health > 0 && !isDartOrSludge) artieWeaknessLeap(boss);
  if (stageId === 'Toxic Tommy' && isW && boss.health > 0) stunTommyWithOil(boss, state, ctx.bossHelpers);
  if (boss.health <= 0) killBoss(ctx, boss, p.vel.x > 0 ? 1 : -1, isW);
  if (p.isSludge) p.health = 0;
  return !isDartOrSludge;
};

/** Enemy projectile hitting the player. Returns false if the projectile is spent. */
const resolveEnemyProjectileHit = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx, stageId, cheats } = ctx;
  const { player } = state;
  if (player.invincibilityTimer > 0) return true;

  const hurtbox = boundsOf(player);
  if (player.isDucking || player.isSliding) { hurtbox.y += 28; hurtbox.h -= 28; }
  else if (player.isCharging) { hurtbox.w += 10; hurtbox.h -= 10; }
  else if (player.isUppercutting) { hurtbox.w -= 15; hurtbox.h += 40; hurtbox.y -= 30; hurtbox.x += 7.5; }
  if (!rectsOverlap(boundsOf(p), hurtbox)) return true;

  // Uppercuts and divekicks slice cleanly through Tommy's vomit
  if (p.isSludge && stageId === 'Toxic Tommy' && (player.isUppercutting || player.isDivekicking)) {
    fx.spawnExplosion(p.pos, '#27AE60', 10, 0, 5);
    return false;
  }

  if (!cheats.invincible) {
    player.health -= (p.damage / 2);
    if (player.health > 0) {
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      fx.speakVulgarity('hurt', getProjectileHurtSource(p, stageId));
      player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
      const pDir = p.vel.x !== 0 ? Math.sign(p.vel.x) : (player.pos.x < p.pos.x ? -1 : 1);
      player.vel.x = pDir * PLAYER_PUSHBACK_VEL_X;
      player.vel.y = PLAYER_PUSHBACK_VEL_Y;
      player.isCharging = false;
      player.isUppercutting = false;
      player.isDivekicking = false;
    }
  }
  if (p.isBoulder) fx.spawnRockShatter(p.pos);
  if (p.isPoop) fx.spawnPoopExplosion(p.pos, 25);
  if (p.isCocaine) fx.spawnPowderExplosion(p.pos, 25);
  if (p.isMethBarrel) p.health = 0;
  return false;
};

const getProjectileHurtSource = (p: Projectile, stageId: string | null): string => {
  if (p.isMethBarrel) return 'meth_barrel';
  if (p.isDart) return 'needle';
  if (p.isPoop) return 'wind';
  if (p.isBoulder || p.isShrapnel) return 'boulder';
  if (p.isIce) return 'ice';
  if (p.isSludge) return 'sludge';
  if (p.isTased) return 'electric';
  if (stageId && BOSS_DIALOGUE.HURT[stageId]) return stageId;
  return 'bullet';
};

/** Special moves smash Dale's meth barrels. */
export const updateSpecialMovesVsBarrels = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  if (!player.isCharging && !player.isUppercutting && !player.isDivekicking) return;
  const hitbox = getAttackHitbox(ctx);
  const isHeavy = player.isUppercutting || player.isDivekicking;
  state.projectiles.forEach(p => {
    if (!p.isMethBarrel || p.health <= 0 || !rectsOverlap(hitbox, boundsOf(p))) return;
    const dmg = isHeavy ? 100 : 50;
    p.health -= dmg;
    fx.spawnDamageNumber(p.pos, dmg, !!isHeavy);
    if (p.health <= 0) p.health = 0;
    else { p.vel.x = player.facing * 10; p.vel.y = -6; }
  });
};
