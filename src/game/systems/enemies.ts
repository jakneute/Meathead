// Regular enemy movement, oiled-enemy collisions and body contact with the player.

import { Enemy, Rect, Player } from '../../types';
import { KillCallout } from '../../dialogue';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BOSS_DOOR_X, GRAVITY, PLAYER_INVINCIBILITY_FRAMES, PLAYER_STUN_INVINCIBILITY,
  PLAYER_PUSHBACK_DURATION, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, BOSS_CHARGE_DAMAGE,
  PLAYER_MASS, ENEMY_DAZE_FRAMES, UPPERCUT_LAUNCH_SPEED, UPPERCUT_LAUNCH_X, BOUNCE_FRAMES,
  GML_SCALE, POWER_CELLS, FROZEN_PUSH_MULTIPLIER, FROZEN_DAMAGE_MULTIPLIER,
  FROZEN_WALL_IMPACT_MULTIPLIER, FROZEN_GROUND_IMPACT_MULTIPLIER, FROZEN_ENEMY_IMPACT_DAMAGE,
  DAMAGE_WALL_IMPACT_SCALER, DAMAGE_FALL_SCALER, IMPACT_DAMAGE_THRESHOLD,
  ENEMY_DOMINO_TRANSFER, ENEMY_DOMINO_LOSS, DOMINO_DAMAGE_SCALER,
  BOSS_UPPERCUT_DAMAGE, ENEMY_UPPERCUT_DAMAGE, BOSS_DIVEKICK_DAMAGE, ENEMY_DIVEKICK_DAMAGE,
  ENEMY_HIT_COOLDOWN, ENEMY_BULLET_DAMAGE, FILTH_SHIELD_CONTACT_DAMAGE, OIL_ROCKET_OILED_DURATION,
  OILED_COLLISION_DAMAGE, OILED_CHARGE_PUSH_MULTIPLIER, OILED_CHARGE_MIN_PUSH, OVERDOSE_HOMING_ACCEL, OVERDOSE_MAX_SPEED, OVERDOSE_HIT_DAMAGE, OVERDOSE_HOMING_FRAMES, OVERDOSE_HOMING_RANGE,
} from '../../constants';
import { FrameContext, killBoss } from '../context';
import { getBossDef, getStageWidth } from '../boss';
import { rectsOverlap, boundsOf } from '../utils';
import { getAttackHitbox, harmlessBounce, recoilOff, getContactHurtSource } from './player';
import { shakeScreen } from '../state';
import { getEnemyMass, enemyGrip, massRatio } from './knockback';

/** Moves one enemy and resolves its contact with the player. Returns false to remove it. */
export const updateEnemy = (ctx: FrameContext, e: Enemy, enemies: Enemy[]): boolean => {
  const { state } = ctx;
  if (e.isBlownAway) {
    if (e.overdosed) flyOverdosedBody(ctx, e, enemies);
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
    // A frozen enemy stays frozen while it's flying from a shove
    if (e.frozenTimer && !isBeingShoved(e)) e.frozenTimer--;
  } else {
    e.isTased = false;
  }

  const shoveSpeed = e.vel.x;
  moveEnemy(ctx, e);
  if (e.type !== 'boss' && knockedOutOfBounds(ctx, e)) return false;
  if (e.sludgeTimer && e.sludgeTimer > 0) e.sludgeTimer--;
  if (e.type !== 'boss') {
    if (slamIntoWalls(ctx, e, shoveSpeed)) return false;
    if (!e.isOiled && isBeingShoved(e) && (!e.enemyCollisionCooldown || e.enemyCollisionCooldown <= 0)) {
      resolveShoveCollision(ctx, e, enemies);
    }
    if (e.health <= 0) return false;
  }

  if (e.isOiled && !e.isBlownAway && e.health > 0 && Math.abs(e.vel.x) > 1.2 && (!e.enemyCollisionCooldown || e.enemyCollisionCooldown <= 0)) {
    resolveOiledSlideCollision(ctx, e, enemies);
  }

  return resolvePlayerContact(ctx, e);
};


/** Is there floor under this enemy? (Stages have none missing yet; pits will be gaps in the ground.) */
const hasFloorBelow = (state: FrameContext['state'], e: Enemy) => {
  const cx = e.pos.x + e.width / 2;
  return state.blocks.some(b => b.type === 'ground' && cx >= b.x && cx <= b.x + b.w && b.y <= 551 && b.y + b.h >= 550);
};

/**
 * Knocked clean off the stage: an enemy that ends up entirely outside anywhere
 * the camera can go is gone. Uppercut up past the top of the screen: "TO THE
 * MOON!"; shoved off a ledge down a pit: "OFF THE CLIFF!"; sent flying off
 * either end of the stage: "YEETED!". (Only enemies: Meathead never is.)
 */
const knockedOutOfBounds = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx, stageId } = ctx;
  // Tommy's open-topped arena: the camera follows jumps up, so there's no top edge there
  const openAbove = !!getBossDef(stageId)?.arena?.openTop && e.pos.x + e.width > BOSS_DOOR_X;
  const up = !openAbove && e.pos.y + e.height < 0;
  const down = e.pos.y > CANVAS_HEIGHT;
  const side = e.pos.x + e.width < 0 || e.pos.x > getStageWidth(stageId);
  if (!up && !down && !side) return false;
  e.health = 0;
  const cx = e.pos.x + e.width / 2;
  // The callout goes up at the edge of the screen they left by (the renderer keeps it all on screen)
  const edge = {
    pos: { x: Math.max(state.camera.x, Math.min(state.camera.x + CANVAS_WIDTH, cx)) - 10, y: up ? 75 : down ? 530 : Math.max(90, Math.min(520, e.pos.y)) },
    width: 20,
  };
  fx.spawnKillCallout(edge, up ? 'moon' : down ? 'cliff' : 'yeet');
  if (up) {
    // A twinkle where they vanished into the sky
    for (let i = 0; i < 10; i++) {
      state.particles.push({
        pos: { x: cx, y: 6 }, vel: { x: (Math.random() - 0.5) * 5, y: Math.random() * 2.5 },
        life: 25 + Math.random() * 15, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 2 + Math.random() * 3,
      });
    }
  }
  fx.spawnPickup({ x: e.pos.x, y: 500 });
  fx.speakVulgarity(up ? 'uppercut_kill' : 'charge_kill');
  state.player.killSatisfactionTimer = 60;
  return true;
};

/**
 * An overdosed body on its way off the screen: it veers toward the nearest
 * airborne enemy (a bias, not a guided missile) and anything it plows into
 * takes a massive hit, usually fatal. So overdosing something on the ground
 * can take down a flyer by accident.
 */
const flyOverdosedBody = (ctx: FrameContext, e: Enemy, enemies: Enemy[]) => {
  const { fx } = ctx;
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  const alive = (o: Enemy) => o !== e && o.type !== 'boss' && !o.isBlownAway && o.health > 0;

  // Pull toward the nearest airborne enemy (for a little while, and only one that's close)
  e.overdoseAge = (e.overdoseAge || 0) + 1;
  let target: Enemy | undefined, best = e.overdoseAge <= OVERDOSE_HOMING_FRAMES ? OVERDOSE_HOMING_RANGE : 0;
  for (const o of enemies) {
    if (!alive(o) || !isAirEnemy(o)) continue;
    const d = Math.hypot(o.pos.x + o.width / 2 - cx, o.pos.y + o.height / 2 - cy);
    if (d < best) { best = d; target = o; }
  }
  if (target) {
    const dx = target.pos.x + target.width / 2 - cx, dy = target.pos.y + target.height / 2 - cy;
    const len = Math.hypot(dx, dy) || 1;
    e.vel.x += (dx / len) * OVERDOSE_HOMING_ACCEL;
    // Upward pull also cancels the gravity it would otherwise feel this frame
    e.vel.y += (dy / len) * OVERDOSE_HOMING_ACCEL - (dy < 0 ? GRAVITY * 0.5 : 0);
    const speed = Math.hypot(e.vel.x, e.vel.y);
    if (speed > OVERDOSE_MAX_SPEED) { e.vel.x *= OVERDOSE_MAX_SPEED / speed; e.vel.y *= OVERDOSE_MAX_SPEED / speed; }
  }

  // Plowing through anyone in the way
  const hitIds = e.overdoseHitIds || (e.overdoseHitIds = []);
  const box = boundsOf(e);
  for (const o of enemies) {
    if (!alive(o) || hitIds.includes(o.id) || !rectsOverlap(box, boundsOf(o))) continue;
    hitIds.push(o.id);
    o.health -= OVERDOSE_HIT_DAMAGE;
    fx.spawnDamageNumber(o.pos, OVERDOSE_HIT_DAMAGE, true);
    fx.spawnExplosion({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 }, '#E879F9', 14, 0, 10);
    shakeScreen(ctx.state, 8);
    if (o.health <= 0) {
      fx.blowAwayEnemy(o, { x: e.vel.x * 0.7, y: Math.min(-8, e.vel.y * 0.7) }, 'dart_kill', Math.sign(e.vel.x));
      fx.spawnKillCallout(o, 'contact');
    } else {
      o.vel.x += e.vel.x * 0.5;
      o.vel.y += Math.min(0, e.vel.y * 0.5);
    }
  }
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
    if (isStunned) {
      // Knockback still carries frozen enemies
      e.pauseTimer!--;
      e.pos.x += e.vel.x;
      e.vel.x *= 0.92;
      e.pos.y += e.vel.y;
      e.vel.y *= 0.92;
    } else if (!isHeld) {
      if (e.sludgeTimer && e.sludgeTimer > 0) {
        // Sludge drags it down hard: it slams into the floor, or keeps going down a pit
        if (!e.sludgeFallSpeed) e.sludgeFallFromY = e.pos.y;
        e.sludgeFallSpeed = Math.min(18, (e.sludgeFallSpeed || 3) + 1.2);
        const floorY = 550 - e.height;
        if (!hasFloorBelow(state, e) || e.pos.y + e.sludgeFallSpeed < floorY) {
          e.pos.y += e.sludgeFallSpeed;
          dragIntoEnemies(ctx, e);
        } else if (e.pos.y < floorY) {
          e.pos.y = floorY;
          const damage = sludgeFallDamage(e);
          ctx.fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: 550 }, '#ADFF2F', 8, 0, 8);
          shakeScreen(state, 8, Math.min(10, toGml(e.sludgeFallSpeed)) * GML_SCALE * 0.5);
          e.sludgeFallSpeed = 0;
          if (damage > 0) {
            e.health -= damage;
            ctx.fx.spawnDamageNumber(e.pos, damage, damage > 30);
            if (e.health <= 0) impactKill(ctx, e, 'groundsplat', 0);
          }
        }
      } else {
        e.sludgeFallSpeed = 0;
        e.pos.y += Math.sin((state.frame + (e.initialX || 0)) / 25) * 1.2;
        if (e.pos.y > e.initialY) e.pos.y = Math.max(e.initialY, e.pos.y - 0.8);
      }
    }
  }

  // Frozen/tased enemies can't act, but a shove still moves them
  if (e.type === 'boss' || (isHeld && !isStunned)) return;

  if (air) {
    if (isStunned) return;
    if (e.behavior === 'patrol' || e.behavior === 'fly') {
      if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1;
    } else if (e.behavior === 'shoot' && onScreen && ++e.shootTimer > 60) {
      fireEnemyBullet(ctx, e.pos.x + e.width / 2, e.pos.y + e.height - 10, player.pos.x < e.pos.x ? -7 : 7);
      e.shootTimer = 0;
    }
    if (e.behavior === 'shoot') settleAfterKnockback(e);
    e.pos.x += e.vel.x;
    return;
  }

  const floorLevel = 550 - e.height;
  const overFloor = hasFloorBelow(state, e);
  const grip = enemyGrip(ctx.stageId, e);
  // Airborne if above the floor, just launched upward (uppercuts, explosions) or shoved over a pit
  if (e.pos.y < floorLevel - 1 || e.vel.y < 0 || !overFloor) {
    // Launched into the air by knockback
    e.pos.x += e.vel.x;
    e.pos.y += e.vel.y;
    e.vel.y += GRAVITY * 0.75;
    e.vel.x *= grip.air;
    if (overFloor && e.pos.y >= floorLevel) {
      slamIntoFloor(ctx, e, e.vel.y);
      e.pos.y = floorLevel;
      e.vel.y = 0;
      e.vel.x *= grip.landing;
    }
    if (isStunned) e.pauseTimer!--;
    return;
  }

  e.pos.y = floorLevel;
  e.vel.y = 0;
  if (isStunned) {
    // Sliding from knockback: further on ice, further still when oiled
    e.pauseTimer!--;
    e.vel.x *= grip.slide;
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
  if (e.behavior === 'shoot') settleAfterKnockback(e);
  e.pos.x += e.vel.x;
};

/**
 * Stationary shooters don't walk: whatever speed a knockback left them with
 * bleeds off once they've recovered, instead of carrying them along forever.
 */
const settleAfterKnockback = (e: Enemy) => {
  e.vel.x *= 0.8;
  if (Math.abs(e.vel.x) < 0.1) e.vel.x = 0;
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
      other.vel.x = slideDir * Math.max(6, speed * 0.85 * massRatio(e, other));
      other.vel.y = -8;
      other.pauseTimer = 30;
      other.isOiled = true;
      other.oiledTimer = Math.max(other.oiledTimer || 0, OIL_ROCKET_OILED_DURATION);
    }
    if (e.type !== 'boss') {
      e.vel.x = -slideDir * Math.max(3, speed * 0.4 * massRatio(other, e));
      e.vel.y = -5;
      e.pauseTimer = 20;
    }

    if (e.health <= 0) {
      e.health = 0;
      fx.blowAwayEnemy(e, { x: -slideDir * 12, y: -12 }, 'oil_kill', -slideDir);
      fx.spawnKillCallout(e, 'crush');
    }
    if (other.health <= 0) {
      if (other.type === 'boss') {
        killBoss(ctx, other, slideDir, false);
      } else {
        other.health = 0;
        fx.blowAwayEnemy(other, { x: slideDir * 14, y: -14 }, 'oil_kill', slideDir);
        fx.spawnKillCallout(other, 'crush');
      }
    }
    break;
  }
};

/** Which callout a melee kill earns. Shattering a frozen enemy beats everything. */
const getMeleeKillCallout = (player: Player, wasFrozen: boolean): KillCallout => {
  if (wasFrozen) return 'shatter';
  if (player.isUppercutting) return 'uppercut';
  if (player.isCharging) return player.isSliding ? 'slide' : 'charge';
  return 'shield';
};

/** Mass used for knockback and recoil (GML `mass`). */

/**
 * Special moves (and the filth shield) hurt enemies on contact; otherwise
 * touching an enemy hurts the player. Returns false if the enemy was destroyed.
 * Hit reactions follow the GameMaker version's oHurtbox: kills plow straight
 * through, survivors get shoved by mass and bounce you back.
 */
const resolvePlayerContact = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx, stageId, cheats } = ctx;
  const { player } = state;
  const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  const stageDef = getBossDef(stageId);
  const bossDef = e.type === 'boss' ? stageDef : undefined;
  const hasShield = !!(player.filthShieldTimer && player.filthShieldTimer > 0);
  const isAttacking = player.isCharging || player.isUppercutting || !!player.isDivekicking || hasShield;
  const attackHit = isAttacking && rectsOverlap(getAttackHitbox(ctx), boundsOf(e));

  if (attackHit && onScreen && (!e.hitCooldown || e.hitCooldown <= 0)) {
    // Each uppercut / divekick only hits a given enemy once
    if (player.isUppercutting && player.uppercutHitIds.includes(e.id)) return true;
    if (player.isDivekicking && player.diveKickHitIds.includes(e.id)) return true;

    if (e.type === 'boss' && !state.arenaLocked) {
      harmlessBounce(ctx, e, 18, -4);
      return true;
    }
    if (bossDef?.shield?.isUp(e, state)) {
      fx.spawnExplosion(player.pos, bossDef.shield.color, 12, 0, 6);
      if (bossDef.shield.sound) fx.playGunSound(bossDef.shield.sound);
      harmlessBounce(ctx, e, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y);
      player.invincibilityTimer = PLAYER_STUN_INVINCIBILITY;
      return true;
    }
    bossDef?.onMeleeHit?.(ctx, e);

    let damage = 0;
    if (player.isCharging) damage = BOSS_CHARGE_DAMAGE;
    else if (player.isUppercutting) damage = (e.type === 'boss' ? BOSS_UPPERCUT_DAMAGE : ENEMY_UPPERCUT_DAMAGE);
    else if (player.isDivekicking) damage = (e.type === 'boss' ? BOSS_DIVEKICK_DAMAGE : ENEMY_DIVEKICK_DAMAGE);

    if (hasShield) {
      damage += FILTH_SHIELD_CONTACT_DAMAGE;
      player.filthShieldTimer = 0;
      fx.spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#43A047', 15, 0, 15);
    }

    // Frozen enemies take double damage, fly further, and shatter
    const wasFrozen = !!(e.frozenTimer && e.frozenTimer > 0);
    if (wasFrozen) damage *= FROZEN_DAMAGE_MULTIPLIER;

    e.health -= damage;
    e.hitCooldown = ENEMY_HIT_COOLDOWN;
    fx.spawnDamageNumber(e.pos, damage, player.isUppercutting || !!player.isDivekicking || wasFrozen || hasShield);

    if (player.isUppercutting) {
      player.uppercutHitIds.push(e.id);
      shakeScreen(state, 10, 6 * GML_SCALE);
      fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, '#FFD700', 15, 0, 12);
    }
    if (player.isDivekicking) player.diveKickHitIds.push(e.id);

    if (e.health > 0) {
      const mass = getEnemyMass(e);
      if (e.type !== 'boss') {
        knockBackEnemy(ctx, e, mass, wasFrozen);
      }
      if (player.isDivekicking) {
        // Stomp: a satisfying bounce, and you can divekick again mid-bounce. It also
        // refunds a power cell on the spot (chain them for air combos)
        player.power = Math.min(POWER_CELLS, player.power + 1);
        player.vel.y *= -0.5;
        player.vel.x *= 0.5;
        player.lockTimer = BOUNCE_FRAMES;
        player.recoiling = true;
      } else {
        recoilOff(ctx, mass);
      }
      return true;
    }

    // Lethal hit: charges and uppercuts plow straight through
    if (e.type === 'boss') {
      killBoss(ctx, e, player.facing, false);
    } else {
      e.isBlownAway = true;
      if (player.isDivekicking) {
        // Splat the enemy into the ground; Meathead keeps plummeting
        e.vel = { x: player.facing * 8, y: 18 };
        fx.spawnDeathShower(e.pos, player.facing, 2.5);
        fx.spawnExplosion(e.pos, '#8B0000', 16, 0, 12);
        fx.spawnKillCallout(e, wasFrozen ? 'shatter' : 'divekick');
        fx.speakVulgarity('charge_kill');
      } else {
        e.vel = { x: player.isUppercutting ? 0 : player.facing * 30, y: player.isUppercutting ? -30 : -5 };
        if (wasFrozen) fx.spawnGlassShatter(e.pos);
        else fx.spawnDeathShower(e.pos, player.facing);
        fx.spawnKillCallout(e, getMeleeKillCallout(player, wasFrozen));
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
  if (!e.harmless && !isAttacking && player.invincibilityTimer <= 0 && rectsOverlap(hurtbox, boundsOf(e))) {
    if (!cheats.invincible) player.health -= stageDef?.contact?.damage ?? 5.5;
    if (player.health > 0) {
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      fx.speakVulgarity('hurt', getContactHurtSource(ctx, e));
      player.pushbackTimer = stageDef?.contact?.pushbackFrames?.(e) ?? PLAYER_PUSHBACK_DURATION;
      player.vel = { x: (player.pos.x < e.pos.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y };
    }
    bossDef?.onTouchPlayer?.(ctx, e);
    if (e.id.startsWith('rusher')) e.pauseTimer = 60;
  }
  return true;
};

/**
 * Shove a surviving enemy (GML pushback): the push scales with the player's
 * speed and the mass ratio, and heavy enemies resist it. Uppercuts launch them.
 * The enemy is dazed for a moment either way.
 */
const knockBackEnemy = (ctx: FrameContext, e: Enemy, mass: number, wasFrozen: boolean) => {
  const { player } = ctx.state;
  const massResistance = Math.min(1, Math.max(0.1, 1 - mass / 1000));
  let pushX = ((player.vel.x * PLAYER_MASS / mass) / 2) * massResistance;
  if (wasFrozen) pushX *= FROZEN_PUSH_MULTIPLIER;
  // Shoulder-charging a greased enemy: nothing to grip, it shoots off like a puck
  if (player.isCharging && e.isOiled) {
    pushX *= OILED_CHARGE_PUSH_MULTIPLIER;
    if (Math.abs(pushX) < OILED_CHARGE_MIN_PUSH) pushX = player.facing * OILED_CHARGE_MIN_PUSH;
  }

  if (player.isUppercutting) {
    const launch = UPPERCUT_LAUNCH_SPEED * Math.min(1, Math.max(0.4, 1 - mass / 1500));
    e.vel.y = -launch;
    e.vel.x = player.facing * UPPERCUT_LAUNCH_X + pushX;
  } else {
    e.vel.x = pushX;
    if (!player.isDivekicking) e.vel.y = 0;
  }
  e.pauseTimer = ENEMY_DAZE_FRAMES;
};

// ---------------------------------------------------------------------------
// Shove physics (ported from the GML oEnemyParent): walls and floors hurt,
// shoved enemies domino into each other, and frozen enemies become projectiles.
// ---------------------------------------------------------------------------

const isBeingShoved = (e: Enemy) => (e.pauseTimer || 0) > 0 && Math.abs(e.vel.x) > 0.5;
const isFrozen = (e: Enemy) => !!(e.frozenTimer && e.frozenTimer > 0);
const toGml = (v: number) => Math.abs(v) / GML_SCALE;

/** Kill an enemy from an impact, splattering it (or shattering it if frozen). */
const impactKill = (ctx: FrameContext, e: Enemy, callout: KillCallout, splatDir: number) => {
  const { fx, state } = ctx;
  e.health = 0;
  if (isFrozen(e)) {
    fx.spawnGlassShatter(e.pos);
    fx.spawnKillCallout(e, 'shatter');
  } else {
    fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, splatDir, 1.5);
    fx.spawnKillCallout(e, callout);
  }
  fx.spawnPickup(e.pos);
  fx.speakVulgarity('charge_kill');
  state.player.killSatisfactionTimer = 60;
};

/** Knocked into a wall: damage scales with speed (hugely if frozen). Returns true if it died. */
const slamIntoWalls = (ctx: FrameContext, e: Enemy, speed: number): boolean => {
  const { state, fx } = ctx;
  if ((e.pauseTimer || 0) <= 0 && Math.abs(speed) < 1) return false;
  // Only walls hit side-on: a ceiling it was launched up into isn't one (it would get
  // teleported to the end of the ceiling block). Where it was before this move tells which.
  const prevMidX = e.pos.x + e.width / 2 - speed;
  const wall = state.blocks.find(b => (b.type === 'wall' || (b.type === 'door' && state.doorState !== 'opening' && state.doorState !== 'open' && state.doorState !== 'closing'))
    && rectsOverlap(boundsOf(e), b) && !(prevMidX > b.x && prevMidX < b.x + b.w));
  if (!wall) return false;

  const dir = Math.sign(speed) || (e.pos.x + e.width / 2 < wall.x + wall.w / 2 ? 1 : -1);
  e.pos.x = dir > 0 ? wall.x - e.width : wall.x + wall.w;
  e.vel.x = 0;

  const damage = toGml(speed) * DAMAGE_WALL_IMPACT_SCALER * (isFrozen(e) ? FROZEN_WALL_IMPACT_MULTIPLIER : 1);
  if (damage <= IMPACT_DAMAGE_THRESHOLD) return false;
  e.health -= damage;
  fx.spawnDamageNumber(e.pos, damage, isFrozen(e));
  fx.spawnExplosion({ x: dir > 0 ? wall.x : wall.x + wall.w, y: e.pos.y + e.height / 2 }, '#FDE047', 5, -dir * 4, 8);
  shakeScreen(state, 8, Math.min(10, toGml(speed)) * GML_SCALE * 0.6);
  if (e.health <= 0) { impactKill(ctx, e, 'wallsplat', -dir); return true; }
  return false;
};

/** How hard a sludge-dragged flyer hits: from how fast it's going and how far it's been dragged. */
const sludgeFallDamage = (e: Enemy) => {
  const dragged = Math.max(0, e.pos.y - (e.sludgeFallFromY ?? e.pos.y));
  const damage = toGml(e.sludgeFallSpeed || 0) * DAMAGE_FALL_SCALER + dragged * SLUDGE_DRAG_DISTANCE_DAMAGE;
  return damage > IMPACT_DAMAGE_THRESHOLD ? Math.round(damage) : 0;
};
const SLUDGE_DRAG_DISTANCE_DAMAGE = 0.08; // per pixel dragged down

/**
 * A flyer being dragged down by sludge crashes into whoever's underneath it:
 * both take the hit, the one below gets knocked aside and the flyer glances
 * off it and keeps falling (slower).
 */
const dragIntoEnemies = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  if (e.enemyCollisionCooldown && e.enemyCollisionCooldown > 0) return;
  for (const other of state.enemies) {
    if (other === e || other.type === 'boss' || other.health <= 0 || other.isBlownAway) continue;
    if (other.enemyCollisionCooldown && other.enemyCollisionCooldown > 0) continue;
    if (!rectsOverlap(boundsOf(e), boundsOf(other))) continue;
    const damage = Math.max(IMPACT_DAMAGE_THRESHOLD + 1, sludgeFallDamage(e));
    const dir = other.pos.x + other.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
    other.health -= damage;
    e.health -= damage;
    fx.spawnDamageNumber(other.pos, damage, true);
    fx.spawnDamageNumber(e.pos, damage, true);
    fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height }, '#FDE047', 8, 0, 8);
    shakeScreen(state, 8, Math.min(10, toGml(e.sludgeFallSpeed || 0)) * GML_SCALE * 0.5);
    other.vel.x = dir * 6;
    other.pauseTimer = ENEMY_DAZE_FRAMES;
    other.enemyCollisionCooldown = 20;
    e.enemyCollisionCooldown = 20;
    e.pos.x -= dir * 10;
    e.sludgeFallSpeed = (e.sludgeFallSpeed || 0) * 0.5;
    e.sludgeFallFromY = e.pos.y;
    if (other.health <= 0) impactKill(ctx, other, 'crush', dir);
    if (e.health <= 0) { impactKill(ctx, e, 'crush', -dir); return; }
    break;
  }
};

/** Knocked down onto the floor: fall damage from the landing speed (hugely if frozen). */
const slamIntoFloor = (ctx: FrameContext, e: Enemy, speed: number) => {
  const { fx, state } = ctx;
  const damage = toGml(speed) * DAMAGE_FALL_SCALER * (isFrozen(e) ? FROZEN_GROUND_IMPACT_MULTIPLIER : 1);
  if (speed <= 0 || damage <= IMPACT_DAMAGE_THRESHOLD) return;
  e.health -= damage;
  fx.spawnDamageNumber(e.pos, damage, isFrozen(e));
  if (toGml(speed) > 6) shakeScreen(state, 8, Math.min(10, toGml(speed)) * GML_SCALE * 0.5);
  if (e.health <= 0) impactKill(ctx, e, 'groundsplat', 0);
};

/**
 * A shoved enemy hitting another one. Frozen enemies are projectiles: they
 * hurt what they hit and keep going. Otherwise it's a domino: both take damage
 * and most of the shove transfers to the enemy that got hit.
 */
const resolveShoveCollision = (ctx: FrameContext, e: Enemy, enemies: Enemy[]) => {
  const { fx } = ctx;
  for (const other of enemies) {
    if (other === e || other.type === 'boss' || other.isBlownAway || other.health <= 0) continue;
    if (other.enemyCollisionCooldown && other.enemyCollisionCooldown > 0) continue;
    if (!rectsOverlap(boundsOf(e), boundsOf(other))) continue;

    e.enemyCollisionCooldown = 20;
    other.enemyCollisionCooldown = 20;
    const midX = (e.pos.x + e.width / 2 + other.pos.x + other.width / 2) / 2;
    const midY = (e.pos.y + e.height / 2 + other.pos.y + other.height / 2) / 2;

    if (isFrozen(e)) {
      other.health -= FROZEN_ENEMY_IMPACT_DAMAGE;
      other.vel.x = e.vel.x * 0.5 * massRatio(e, other);
      other.pauseTimer = Math.max(other.pauseTimer || 0, 30);
      fx.spawnDamageNumber(other.pos, FROZEN_ENEMY_IMPACT_DAMAGE, true);
      fx.spawnExplosion({ x: midX, y: midY }, '#B3F0FF', 8, 0, 8);
    } else {
      const massResistance = Math.min(1, Math.max(0.1, 1 - getEnemyMass(e) / 1000));
      const damage = (toGml(e.vel.x) + toGml(e.vel.y)) * DOMINO_DAMAGE_SCALER * massResistance;
      if (damage > 2) {
        e.health -= damage;
        other.health -= damage;
        fx.spawnDamageNumber(other.pos, damage);
        fx.spawnExplosion({ x: midX, y: midY }, '#FDE047', 3, 0, 6);
      }
      other.vel.x = e.vel.x * ENEMY_DOMINO_TRANSFER * massRatio(e, other);
      other.pauseTimer = Math.max(other.pauseTimer || 0, e.pauseTimer || 0);
      e.vel.x *= ENEMY_DOMINO_LOSS;
    }
    fx.playGunSound();

    if (other.health <= 0) {
      fx.blowAwayEnemy(other, { x: Math.sign(e.vel.x) * 10, y: -10 }, 'charge_kill', Math.sign(e.vel.x));
      fx.spawnKillCallout(other, isFrozen(other) ? 'shatter' : 'crush');
    }
    if (e.health <= 0) impactKill(ctx, e, 'crush', -Math.sign(e.vel.x));
    break;
  }
};
