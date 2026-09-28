// Projectile movement, bouncing/lingering physics and all projectile hit resolution.

import { submerged } from '../enemies/kinds/victor';
import { Enemy, Projectile } from '../../types';
import {
  CANVAS_WIDTH, GRAVITY, BOSS_DOOR_X, DOOR_WIDTH, PLAYER_INVINCIBILITY_FRAMES,
  PLAYER_PUSHBACK_DURATION, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y,
  BOULDER_BOUNCE_DAMPING, SHOTGUN_FREEZE_TIME, NEEDLE_OVERDOSE_THRESHOLD, OIL_ROCKET_STEER_ACCEL, OIL_ROCKET_STEER_MAX,
  SHOTGUN_MAX_BOUNCES, SHOTGUN_BOUNCE_VARIANCE_DEG, BOULDER_GRAVITY, BOULDER_MAX_SPEED, BOULDER_WALK_NUDGE,
  BOULDER_PUNT, BOULDER_BILLIARD_LOSS, BOULDER_DAMAGE_PER_SPEED, GML_SCALE,
  SLUDGE_DOT_DAMAGE, SLUDGE_DOT_TICK, SLUDGE_LINGER_DURATION, OIL_ROCKET_OILED_PUSHBACK_MULT, ERNIE_STOMP_VIBRATION_DURATION,
} from '../../constants';
import { BOSS_DIALOGUE } from '../../content/dialogue';
import { FrameContext } from '../core/context';
import { getBossDef, hitBoss, isWeakTo, maybeReactToWeapon, weaponOf } from '../bosses/registry';
import { explodeOilRocket } from './weapons';
import { tryCorkVent } from '../bosses/victor';
import { ICE_BLOCK_ACCEL, ICE_BLOCK_GRACE, ICE_BLOCK_LIFE, ICE_BLOCK_MAX_SPEED } from '../bosses/artie';
import { pushEnemy } from './knockback';
import { stickNeedle, ENEMY_NEEDLE } from './needles';
import { updateOscarRocket, updateCigarette } from '../bosses/oscar';
import { pickRandom, rectsOverlap, boundsOf, isOnScreen } from '../core/utils';
import { getAttackHitbox } from '../player/player';
import { shakeScreen, GameState } from '../core/state';
import { getStageLayout } from '../stages';
import { shieldFacing } from '../enemies/kinds';
import { isMidBoss } from './midBoss';

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
  if (p.isOscarRocket) return updateOscarRocket(ctx, p);
  if (p.isCigarette) return updateCigarette(ctx, p);

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

  if (p.owner === 'enemy' && p.isIce && p.width > 30) return updateIceBlock(ctx, p);

  // Player shotgun pellets and boulders use the GameMaker version's physics
  if (p.owner === 'player' && p.isIce) return updatePellet(ctx, p);
  if (p.owner === 'player' && p.isBoulder) return updatePlayerBoulder(ctx, p);

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
  // Up / down nudge it in flight; let go and it levels back out
  const steer = p.noSteer ? 0 : state.player.steer || 0;
  if (steer) p.vel.y = Math.max(-OIL_ROCKET_STEER_MAX, Math.min(OIL_ROCKET_STEER_MAX, p.vel.y + steer * OIL_ROCKET_STEER_ACCEL));
  else p.vel.y *= 0.9;
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
    // A boulder goes up through a jump-through ledge and only lands on one from above (like him)
    if (b.oneWay && p.isBoulder && (p.vel.y <= 0 || p.pos.y + p.height - p.vel.y > b.y + 1)) continue;
    // Poop logs fly through walls near where they spawned
    if (p.isPoop && p.spawnX !== undefined && Math.abs(p.pos.x - p.spawnX) < 200) continue;

    // NOTE: compares against the player's x, not the projectile's (original behaviour, kept as-is)
    const overlapX = Math.min(p.pos.x + p.width - b.x, b.x + b.w - player.pos.x);
    const overlapY = Math.min(p.pos.y + p.height - b.y, b.y + b.h - player.pos.y);
    if (overlapX < overlapY) {
      // Hit a wall
      if (p.isMethBarrel) { p.vel.x *= -0.8; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
      if (p.isBoulder) { if (p.isHeaved) heavedBoulderRumble(ctx); shatterBoulder(ctx, p); return false; }
      if (p.isCocaine) { fx.spawnPowderExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, 30); return false; }
      if (p.isSludge) { p.isSliding = true; p.vel.x = 0; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
      if (p.isIce && p.width > 30) { shatterIceBlock(ctx, p); return false; }
      if (isSmallIce) {
        p.vel.x *= -1.0;
        p.pos.x += p.vel.x;
        if (p.owner === 'player' && p.isIce && p.bounceDecay === undefined) p.bounceDecay = 15;
      }
      if (p.isShrapnel) return false;
      if (p.isPoop) { fx.spawnPoopExplosion(p.pos, 25); return false; }
    } else {
      // Hit a floor or ceiling
      if (p.isIce && p.width > 30) { shatterIceBlock(ctx, p); return false; }
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
        if (p.isHeaved && p.vel.y > HEAVED_RUMBLE_SPEED) heavedBoulderRumble(ctx);
        p.vel.y = Math.abs(p.vel.y) > 1.0 ? -p.vel.y * (p.isBoulder ? BOULDER_BOUNCE_DAMPING : 0.85) : 0;
      }
      p.pos.y = (p.pos.y + p.height / 2 < b.y + b.h / 2) ? b.y - p.height : b.y + b.h;
      if (p.owner === 'player' && p.isIce && p.bounceDecay === undefined) p.bounceDecay = 15;
    }
  }
  if (!p.isLingering) p.pos.x += p.vel.x;

  if (p.isSludge && p.isLingering) {
    p.life!--;
    // Only Meathead's sludge hurts enemies (Tommy's own puke puddles used to hurt him)
    if (p.owner === 'player') damageEnemiesInSludgePuddle(ctx, p);
    if (state.frame % 4 === 0) {
      state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 6 }, life: 25, color: '#ADFF2F', size: 6 + Math.random() * 8 });
    }
    if (p.life! <= 0) return false;
  }
  if (p.isMethBarrel) p.rotation = (p.rotation || 0) + (p.vel.x * 0.05);
  return true;
};

/**
 * Artie's big ice block: aimed at Meathead when it's thrown, then it flies in a
 * straight line (no homing), speeding up from slow to mid. It shatters on the
 * first wall, floor or ceiling it hits (after clearing his hands), on Meathead,
 * or when it runs out of steam.
 */
const updateIceBlock = (ctx: FrameContext, p: Projectile): boolean => {
  p.life = (p.life ?? ICE_BLOCK_LIFE) - 1;
  if (p.life <= 0) { shatterIceBlock(ctx, p); return false; }

  const speed = Math.hypot(p.vel.x, p.vel.y) || 1;
  const faster = Math.min(ICE_BLOCK_MAX_SPEED, speed + ICE_BLOCK_ACCEL) / speed;
  p.vel.x *= faster;
  p.vel.y *= faster;
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;

  if (ICE_BLOCK_LIFE - p.life > ICE_BLOCK_GRACE) {
    const box = boundsOf(p);
    for (const b of ctx.state.blocks) {
      if (b.type !== 'pit' && rectsOverlap(box, b)) { shatterIceBlock(ctx, p); return false; }
    }
  }

  const alive = resolveEnemyProjectileHit(ctx, p);
  if (!alive) shatterIceBlock(ctx, p);
  return alive;
};

/**
 * Artie's big ice block doesn't bounce: it shatters on whatever it hits. The
 * pieces are just for show, so dodging the block means you've dodged the attack.
 */
const shatterIceBlock = (ctx: FrameContext, p: Projectile) => {
  const { state, fx } = ctx;
  for (let i = 0; i < 14; i++) {
    state.particles.push({
      pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 },
      vel: { x: (Math.random() - 0.5) * 14, y: -2 - Math.random() * 8 },
      life: 30 + Math.random() * 25, color: i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? '#AED6F1' : '#7DD3FC', size: 4 + Math.random() * 7,
    });
  }
  fx.spawnGlassShatter(p.pos);
  fx.playGunSound('ice');
};

/** Ernie's lobbed boulder slamming into the floor or a wall shakes the room like his stomps (stunning you if you're on the ground). */
const HEAVED_RUMBLE_SPEED = 8; // only real slams, not the little bounces after
const heavedBoulderRumble = (ctx: FrameContext) => {
  ctx.bossHelpers.setScreenShake(25);
  ctx.bossHelpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION);
  ctx.fx.playGunSound('tsunami');
};

const shatterBoulder = (ctx: FrameContext, p: Projectile) => {
  ctx.fx.spawnRockShatter(p.pos);
  // Just breaks apart (Meathead's shakes the screen by how fast it was going)
  if (p.owner === 'player') shakeScreen(ctx.state, 8, Math.min(10, (Math.abs(p.vel.x) + Math.abs(p.vel.y)) / GML_SCALE * 0.5) * GML_SCALE);
};

const solidAt = (state: GameState, box: { x: number, y: number, w: number, h: number }) =>
  state.blocks.find(b => b.type !== 'pit' && rectsOverlap(box, b));

/**
 * The same, for a boulder, which treats a jump-through ledge the way he does: it flies up through it from below
 * (and passes it side-on), and only lands on it coming down from above. `bottom` is where its bottom was before
 * this move, `vy` which way it's going.
 */
const solidForBoulder = (state: GameState, box: { x: number, y: number, w: number, h: number }, vy: number, bottom: number) =>
  state.blocks.find(b => b.type !== 'pit' && rectsOverlap(box, b) && (!b.oneWay || (vy > 0 && bottom <= b.y + 1)));

/**
 * GML oShotgunBullet: flies straight, ricochets off terrain at a random angle,
 * and melts away after a couple of bounces or when its lifetime runs out.
 */
const updatePellet = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.life = (p.life ?? 0) - 1;
  const variance = () => (Math.random() - 0.5) * 2 * SHOTGUN_BOUNCE_VARIANCE_DEG * Math.PI / 180;
  const speed = Math.hypot(p.vel.x, p.vel.y);
  const redirect = (angle: number) => { p.vel.x = Math.cos(angle) * speed; p.vel.y = Math.sin(angle) * speed; p.bounces = (p.bounces || 0) + 1; };

  if (solidAt(state, { ...boundsOf(p), x: p.pos.x + p.vel.x })) redirect(Math.PI - Math.atan2(p.vel.y, p.vel.x) + variance());
  if (solidAt(state, { ...boundsOf(p), y: p.pos.y + p.vel.y })) redirect(-Math.atan2(p.vel.y, p.vel.x) + variance());
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;

  if (p.life <= 0 || (p.bounces || 0) > SHOTGUN_MAX_BOUNCES) {
    spawnIceMist(state, p, 8);
    return false;
  }
  if (p.pos.x < state.camera.x - 400 || p.pos.x > state.camera.x + CANVAS_WIDTH + 400) return false;
  return resolvePlayerProjectileHits(ctx, p);
};

const spawnIceMist = (state: GameState, p: Projectile, count: number) => {
  const mist = ['#FFFFFF', '#E0FFFF', '#AFEEEE', '#B0E0E6'];
  for (let i = 0; i < count; i++) {
    state.particles.push({
      pos: { x: p.pos.x + Math.random() * 14 - 7, y: p.pos.y + Math.random() * 14 - 7 },
      vel: { x: p.vel.x * 0.1 + (Math.random() - 0.5) * 2, y: -Math.random() * 2 - 0.5 },
      life: 20 + Math.random() * 25, color: pickRandom(mist), size: 2 + Math.random() * 5,
    });
  }
};

/**
 * GML oBoulderBullet: a heavy ball. Gravity pulls it to the floor where it
 * rolls; walking into it nudges it and a charge/divekick punts it; it breaks
 * against walls and knocks into other boulders like billiard balls.
 */
const updatePlayerBoulder = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const { player } = state;
  p.life = (p.life ?? 0) - 1;
  p.vel.y += BOULDER_GRAVITY;

  // Pushed around by the player
  if (rectsOverlap(boundsOf(p), boundsOf(player))) {
    const mult = (player.isCharging || player.isDivekicking) ? BOULDER_PUNT : BOULDER_WALK_NUDGE;
    p.vel.x = clamp(p.vel.x + player.vel.x * mult, -BOULDER_MAX_SPEED, BOULDER_MAX_SPEED);
    p.vel.y = clamp(p.vel.y + player.vel.y * mult, -BOULDER_MAX_SPEED, BOULDER_MAX_SPEED);
    if (mult === BOULDER_PUNT) shakeScreen(state, 6, Math.min(10, Math.abs(p.vel.x) / GML_SCALE * 0.5) * GML_SCALE);
  }

  // Floor / ceiling: stop dead (no bounce)
  const floor = solidForBoulder(state, { ...boundsOf(p), y: p.pos.y + p.vel.y }, p.vel.y, p.pos.y + p.height);
  if (floor) {
    if (Math.abs(p.vel.y) / GML_SCALE > 4) shakeScreen(state, 6, Math.min(10, Math.abs(p.vel.y) / GML_SCALE) * GML_SCALE * 0.5);
    p.pos.y = p.vel.y > 0 ? floor.y - p.height : floor.y + floor.h;
    p.vel.y = 0;
  } else {
    p.pos.y += p.vel.y;
  }

  // Walls break it
  // (a jump-through ledge is never a wall: it rolls past the end of one, and through one it's rising into)
  if (solidForBoulder(state, { x: p.pos.x + p.vel.x, y: p.pos.y - GML_SCALE * 8, w: p.width, h: p.height - GML_SCALE * 8 }, -1, Infinity)) {
    shatterBoulder(ctx, p);
    return false;
  }
  p.pos.x += p.vel.x;

  // Billiards: swap speeds with any boulder we roll into
  for (const other of state.projectiles) {
    if (other === p || !other.isBoulder || other.owner !== 'player' || other.health <= 0) continue;
    if (!rectsOverlap({ ...boundsOf(p), x: p.pos.x + Math.sign(p.vel.x) * 2 }, boundsOf(other))) continue;
    const mine = p.vel.x;
    p.vel.x = other.vel.x * BOULDER_BILLIARD_LOSS;
    other.vel.x = mine * BOULDER_BILLIARD_LOSS;
    ctx.fx.spawnExplosion({ x: (p.pos.x + other.pos.x) / 2 + p.width / 2, y: p.pos.y + p.height / 2 }, '#FDE047', 5, 0, 6);
    shakeScreen(state, 6, Math.min(10, Math.max(Math.abs(p.vel.x), Math.abs(other.vel.x)) / GML_SCALE * 0.5) * GML_SCALE);
    p.pos.x += Math.sign(p.pos.x - other.pos.x || 1) * 4 * GML_SCALE;
    break;
  }

  if (p.life <= 0) { shatterBoulder(ctx, p); return false; }
  if (p.pos.y > state.camera.y + 1000) return false;
  // Jammed into one of Victor's vents
  if (state.bossVolcanoes.length > 0 && tryCorkVent(ctx, p)) return false;
  return resolvePlayerProjectileHits(ctx, p);
};

/** How long a sludged enemy stays dragged down (flyers). */
const SLUDGE_PULL_FRAMES = 40;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Enemies standing in a sludge puddle take damage over time (bosses take one hit, then it's used up). */
const damageEnemiesInSludgePuddle = (ctx: FrameContext, p: Projectile) => {
  const { state, fx, stageId } = ctx;
  const isDotTick = state.frame % SLUDGE_DOT_TICK === 0;
  for (const en of state.enemies) {
    if (p.life! <= 0) break;
    if (en.health <= 0 || en.isBlownAway) continue;
    const inPuddle = en.pos.x < p.pos.x + p.width && en.pos.x + en.width > p.pos.x && en.pos.y < p.pos.y + p.height + 15 && en.pos.y + en.height > p.pos.y;
    if (!inPuddle) continue;
    if (en.enemyType === 'flyer') en.sludgeTimer = SLUDGE_PULL_FRAMES; // keeps flyers pinned down

    if (en.type === 'boss') {
      const onStandInSludge = getBossDef(stageId)?.onStandInSludge;
      if (onStandInSludge) { onStandInSludge(ctx, en); continue; }
      if (en.hitCooldown && en.hitCooldown > 0) continue;
      p.life = 0;
      hitBoss(ctx, en, 'SLUDGE', { facing: 0, damage: isWeakTo(stageId, 'SLUDGE') ? 50 : 15 });
    } else if (isMidBoss(en)) {
      // (a mid-boss wades through it: no melting, the blob that made it already did its damage)
      continue;
    } else if (isDotTick && en.sludgeTickFrame !== state.frame) {
      // Overlapping puddles don't stack: one tick per enemy
      en.sludgeTickFrame = state.frame;
      en.health -= SLUDGE_DOT_DAMAGE;
      fx.spawnDamageNumber(en.pos, SLUDGE_DOT_DAMAGE);
      if (en.health <= 0) fx.killWithAnimation(en, 'melted', 'sludge_kill', 'melted');
    }
  }
};

/**
 * A glob of sludge splashing through an enemy: it hurts each enemy once and keeps
 * going (it's only used up by walls and the floor, where it pools). Flyers get
 * dragged down by it.
 */
const sludgeHitsEnemy = (ctx: FrameContext, p: Projectile, enemy: Enemy) => {
  const { fx } = ctx;
  if (!p.hitIds) p.hitIds = [];
  if (p.hitIds.includes(enemy.id)) return;
  p.hitIds.push(enemy.id);
  enemy.health -= p.damage;
  enemy.sludgeTimer = SLUDGE_PULL_FRAMES;
  fx.spawnDamageNumber(enemy.pos, p.damage);
  fx.spawnExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, '#ADFF2F', 4, 0, 5);
  if (enemy.health <= 0) fx.killWithAnimation(enemy, 'melted', 'sludge_kill', 'melted');
};

/** Player projectile vs. enemies, bosses and meth barrels. Returns false if the projectile is spent. */
const resolvePlayerProjectileHits = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;

  for (const enemy of state.enemies) {
    if (enemy.health <= 0 || enemy.isBlownAway || !rectsOverlap(boundsOf(p), boundsOf(enemy))) continue;
    // (a stray shot that's flown off screen doesn't kill what it finds out there)
    if (!isOnScreen(state.camera, enemy) || submerged(enemy)) continue;
    if (p.isSludge && p.isLingering) continue;

    // Bosses are untouchable until the arena locks (boulders bounce off)
    if (enemy.type === 'boss' && !state.arenaLocked) {
      if (p.isBoulder) { p.vel.x *= -0.5; p.vel.y = -5; }
      continue;
    }

    // Shield enemies block shots from the side the shield's facing
    const shieldLeft = shieldFacing(enemy) < 0;
    const hitsShieldSide = shieldLeft ? p.vel.x > 0 && p.pos.x < enemy.pos.x + enemy.width / 2 : p.vel.x < 0 && p.pos.x + p.width > enemy.pos.x + enemy.width / 2;
    if (enemy.enemyType === 'shield' && enemy.isShieldActive && hitsShieldSide) {
      if (p.isSludge) {
        // Splats against the shield and runs down it into a puddle at his feet
        p.isSliding = true;
        p.vel.x = 0;
        p.pos.x = p.pos.x < enemy.pos.x ? enemy.pos.x - p.width : enemy.pos.x + enemy.width;
        continue;
      }
      if (p.isBoulder) shatterBoulder(ctx, p);
      return false;
    }

    // A stage's mid-boss takes hits its own way (or the shot just went past it: a round thing in a square box)
    const special = enemy.kind ? getStageLayout(ctx.stageId)?.hitSpecialEnemy?.(ctx, enemy, p) : undefined;
    if (special === 'miss') continue;
    if (special) return false;

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
        enemy.overdosed = true;
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
          enemy.overdosed = true;
          fx.spawnKillCallout(enemy, 'overdose');
        }
      }
      return false;
    }

    const wasFrozen = !!(enemy.frozenTimer && enemy.frozenTimer > 0);
    if (p.isBoulder) return boulderHitsEnemy(ctx, p, enemy);
    if (p.isSludge) { sludgeHitsEnemy(ctx, p, enemy); continue; }

    enemy.health -= p.damage;
    if (enemy.isOiled && !p.isOilRocket) {
      // Oiled enemies go flying from any hit (light ones furthest)
      pushEnemy(enemy, p.vel.x * OIL_ROCKET_OILED_PUSHBACK_MULT, -8, 30);
    }
    if (p.isIce) enemy.frozenTimer = SHOTGUN_FREEZE_TIME;
    fx.spawnDamageNumber(enemy.pos, p.damage, p.isBoulder);
    if (p.isIce) spawnIceMist(state, p, 8);
    if (enemy.health <= 0) {
      // Killing an enemy that was already frozen shatters it
      if (wasFrozen) { fx.spawnGlassShatter(enemy.pos); fx.spawnKillCallout(enemy, 'shatter'); }
      else fx.spawnDeathShower(enemy.pos, 0, 1.2);
      fx.spawnPickup(enemy.pos);
      fx.speakVulgarity(p.isBoulder ? 'boulder_kill' : (p.isIce ? 'shotgun_kill' : (p.isSludge ? 'sludge_kill' : 'gun_kill')));
      player.killSatisfactionTimer = 60;
    }
    if (p.isBoulder) shatterBoulder(ctx, p);
    return false;
  }

  for (const barrel of state.projectiles.filter(pr => pr.isMethBarrel)) {
    if (!rectsOverlap(boundsOf(p), boundsOf(barrel)) || p.isDart) continue;
    const damage = p.isBoulder ? BOULDER_DAMAGE_PER_SPEED * Math.max(1, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE) : p.damage;
    barrel.health = Math.max(0, barrel.health - damage);
    fx.spawnDamageNumber(barrel.pos, damage);
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
  const { state, fx, stageId } = ctx;
  const def = getBossDef(stageId);
  const weapon = weaponOf(p);

  if (def?.shield?.isUp(boss, state)) {
    fx.spawnExplosion(p.pos, def.shield.color, 10, 0, 5);
    if (def.shield.sound) fx.playGunSound(def.shield.sound);
    return false;
  }
  if (boss.hitCooldown && boss.hitCooldown > 0) return false;
  // Some bosses take certain projectiles their own way (Barry's needles stick in him)
  if (def?.catchProjectile?.(ctx, boss, p)) {
    maybeReactToWeapon(boss, weapon, stageId, state, ctx.bossHelpers);
    return false;
  }

  hitBoss(ctx, boss, weapon, { facing: p.vel.x > 0 ? 1 : -1, p });
  if (p.isSludge) p.health = 0;
  return !(p.isDart || p.isSludge);
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
  if (p.isSludge && (player.isUppercutting || player.isDivekicking)) {
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
      player.isSliding = false;
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
  if (p.isPoop) return 'poop';
  if (p.isBoulder || p.isShrapnel) return 'boulder';
  if (p.isIce) return 'ice';
  if (p.isSludge) return 'sludge';
  if (p.isTased) return 'electric';
  // An ordinary enemy's shot: what that kind shoots (a cop's bullet, a coconut...), never the boss's lines
  if (p.shooterKind) return BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT[`${p.shooterKind}_shot`] ? `${p.shooterKind}_shot` : 'bullet';
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

/**
 * GML boulder vs enemy: damage scales with the boulder's speed (rolling fast or
 * dropping hard). A kill doesn't stop it; a survivor breaks it.
 */
const boulderHitsEnemy = (ctx: FrameContext, p: Projectile, enemy: Enemy): boolean => {
  const { state, fx } = ctx;
  const absX = Math.abs(p.vel.x) / GML_SCALE;
  const absY = Math.abs(p.vel.y) / GML_SCALE;
  const speed = Math.max(absX, absY);
  const damage = BOULDER_DAMAGE_PER_SPEED * Math.max(1, speed);
  enemy.health -= damage;
  fx.spawnDamageNumber(enemy.pos, damage, true);
  shakeScreen(state, 6, Math.min(10, speed * 0.1) * GML_SCALE);

  if (enemy.health > 0) {
    shatterBoulder(ctx, p);
    return false;
  }
  const flattened = absX >= absY;
  fx.spawnDeathShower(enemy.pos, flattened ? Math.sign(p.vel.x) : 0, 0.8);
  // Flyers get knocked out of the air; anything on the ground is left flat as a pancake
  if (enemy.pos.y + enemy.height >= 540) fx.killWithAnimation(enemy, 'pancaked', 'boulder_kill', flattened ? 'flattened' : 'squished');
  else {
    fx.blowAwayEnemy(enemy, { x: Math.sign(p.vel.x) * 8, y: -6 }, 'boulder_kill');
    fx.spawnKillCallout(enemy, flattened ? 'flattened' : 'squished');
  }
  state.player.killSatisfactionTimer = 60;
  return true;
};
