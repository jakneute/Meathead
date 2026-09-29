// Regular enemy movement, oiled-enemy collisions and body contact with the player.

import { Enemy, Rect, Player } from '../../types';
import { KillCallout } from '../../content/dialogue';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BOSS_DOOR_X, GRAVITY, PLAYER_INVINCIBILITY_FRAMES, PLAYER_STUN_INVINCIBILITY,
  PLAYER_PUSHBACK_DURATION, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y, BOSS_CHARGE_DAMAGE, ENEMY_CHARGE_DAMAGE, ENEMY_SLIDE_DAMAGE,
  PLAYER_MASS, ENEMY_DAZE_FRAMES, UPPERCUT_LAUNCH_SPEED, UPPERCUT_LAUNCH_X, BOUNCE_FRAMES,
  GML_SCALE, POWER_CELLS, FROZEN_PUSH_MULTIPLIER, FROZEN_DAMAGE_MULTIPLIER,
  FROZEN_WALL_IMPACT_MULTIPLIER, FROZEN_GROUND_IMPACT_MULTIPLIER, FROZEN_ENEMY_IMPACT_DAMAGE,
  DAMAGE_WALL_IMPACT_SCALER, DAMAGE_FALL_SCALER, IMPACT_DAMAGE_THRESHOLD,
  ENEMY_DOMINO_TRANSFER, ENEMY_DOMINO_LOSS, DOMINO_DAMAGE_SCALER,
  BOSS_UPPERCUT_DAMAGE, ENEMY_UPPERCUT_DAMAGE, BOSS_DIVEKICK_DAMAGE, ENEMY_DIVEKICK_DAMAGE,
  ENEMY_HIT_COOLDOWN, ENEMY_BULLET_DAMAGE, FILTH_SHIELD_CONTACT_DAMAGE, OIL_ROCKET_OILED_DURATION,
  OILED_COLLISION_DAMAGE, OILED_CHARGE_PUSH_MULTIPLIER, OILED_CHARGE_MIN_PUSH, OVERDOSE_GRAVITY, OVERDOSE_RISE_RANGE, OVERDOSE_RISE_STEER, OVERDOSE_MAX_SIDE_SPEED,
  OVERDOSE_MAX_RISE_SPEED, OVERDOSE_DIVE_RANGE, OVERDOSE_DIVE_SPEED, OVERDOSE_DROP_GRAVITY, OVERDOSE_HIT_DAMAGE, OVERDOSE_MAX_FRAMES,
  BOTTLE_GRAVITY, THAW_BURST_DAMAGE,
} from '../../constants';
import { FrameContext, killBoss } from '../core/context';
import type { ThrownKind } from '../../types';
import { THROWN, shotLook, shotSpeed } from './shots';
import { getBossDef, getStageWidth } from '../bosses/registry';
import { rectsOverlap, boundsOf } from '../core/utils';
import { getAttackHitbox, harmlessBounce, recoilOff, getContactHurtSource } from '../player/player';
import { shakeScreen } from '../core/state';
import type { GameState } from '../core/state';
import { startEnemyDeath } from './deaths';
import { getEnemyMass, enemyGrip, massRatio } from '../combat/knockback';
import { floorTopAt, groundLineAt } from '../core/terrain';
import { getStageLeft, getStageLayout } from '../stages';
import { runKindAI, kindContactDamage, holdingOff, shieldFacing, isChargerKind, safeAhead, isSmallCritter } from './kinds';
import { selfPropelled } from './kinds/hector';
import { copMelee, isMeleeCop } from './copMelee';
import { submerged } from './kinds/victor';
import { isMidBoss } from '../combat/midBoss';

/** Moves one enemy and resolves its contact with the player. Returns false to remove it. */
export const updateEnemy = (ctx: FrameContext, e: Enemy, enemies: Enemy[]): boolean => {
  const { state } = ctx;
  // A stage's mid-boss runs itself
  const special = e.kind ? getStageLayout(ctx.stageId)?.updateSpecialEnemy?.(ctx, e) : undefined;
  if (special !== undefined) return special;
  if (e.isBlownAway) {
    if (e.overdosed) return flyOverdosedBody(ctx, e, enemies);
    // Dead bodies tumble off-screen
    e.pos.x += e.vel.x;
    e.pos.y += e.vel.y;
    e.vel.y += GRAVITY * 0.5;
    e.rotation = (e.rotation || 0) + 0.3;
    return e.pos.y < state.camera.y + 1000;
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


/** The top of the ground (or ledge) under this enemy, or null over a pit. Steps and slopes up to 26px count. */
const floorUnder = (state: FrameContext['state'], e: Enemy, reach = 26) =>
  floorTopAt(state.blocks, e.pos.x + e.width / 2, e.pos.y + e.height, reach);
const hasFloorBelow = (state: FrameContext['state'], e: Enemy) => floorUnder(state, e) !== null;

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
  const hilly = !!getStageLayout(stageId)?.verticalCamera;
  // A bystander only goes out of bounds if he knocked it there
  if (e.innocent && !((e.pauseTimer || 0) > 0)) return false;
  // (the sharks up the storm tower are out in the air, above and below the view all the time: never out of bounds)
  if (e.kind === 'shark' || e.kind === 'magmafish') return false;
  // (nor anything that lives down in Tommy's muck, under the bottom of the view)
  if (e.kind === 'sludgeling' || e.kind === 'mutantfish') return false;
  // (nor a gator down in the water: it goes deep after its dinner, or after him)
  if (e.kind === 'gator' && e.variant === 1) return false;
  // (On a hilly stage things sit above and below the view all the time, hopping, leaping and flying about:
  // only ones launched by a hit count going up, and only ones with nothing under them going down)
  const launched = (e.pauseTimer || 0) > 0 && e.vel.y < -2;
  const up = !openAbove && e.pos.y + e.height < state.camera.y && (!hilly || launched);
  const down = e.pos.y > state.camera.y + CANVAS_HEIGHT && (!hilly || !hasFloorBelow(state, e));
  // (going out of bounds is about falling off the bottom or being launched off the top; off the ends only counts
  // on the old flat stages, where being knocked clean off either end is the joke)
  const side = !getStageLayout(stageId) && (e.pos.x + e.width < getStageLeft(stageId) || e.pos.x > getStageWidth(stageId));
  if (!up && !down && !side) return false;
  e.health = 0;
  const cx = e.pos.x + e.width / 2;
  // The callout goes up at the edge of the screen they left by (the renderer keeps it all on screen)
  const edge = {
    pos: { x: Math.max(state.camera.x, Math.min(state.camera.x + CANVAS_WIDTH, cx)) - 10, y: state.camera.y + (up ? 75 : down ? 530 : Math.max(90, Math.min(520, e.pos.y - state.camera.y))) },
    width: 20,
  };
  fx.spawnKillCallout(edge, up ? 'moon' : down ? 'cliff' : 'yeet');
  if (up) {
    // A twinkle where they vanished into the sky
    for (let i = 0; i < 10; i++) {
      state.particles.push({
        pos: { x: cx, y: state.camera.y + 6 }, vel: { x: (Math.random() - 0.5) * 5, y: Math.random() * 2.5 },
        life: 25 + Math.random() * 15, color: i % 2 ? '#FFFFFF' : '#FDE047', size: 2 + Math.random() * 3,
      });
    }
  }
  fx.spawnPickup({ x: e.pos.x, y: state.camera.y + 500 });
  fx.speakVulgarity(up ? 'uppercut_kill' : 'charge_kill');
  state.player.killSatisfactionTimer = 60;
  return true;
};

/**
 * An overdosed body's flight. It goes up in an arc, steering its sideways speed
 * so the arc passes through an enemy above it (airborne ones first, kicking a
 * little harder upward if one's just out of reach). From the top of the arc it
 * dives in a dead straight line at the nearest enemy below, or drops straight
 * down if there isn't one, and splats on the ground. Anything it plows into on
 * the way takes a massive hit. Returns false once it's gone.
 */
const flyOverdosedBody = (ctx: FrameContext, e: Enemy, enemies: Enemy[]): boolean => {
  const { state, fx } = ctx;
  const mid = (o: Enemy) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
  const alive = (o: Enemy) => o !== e && o.type !== 'boss' && !o.isBlownAway && o.health > 0;
  const hitIds = e.overdoseHitIds || (e.overdoseHitIds = []);
  const c = mid(e);
  e.overdosePhase = e.overdosePhase || 'rise';
  // Out of time (nothing to hit and nowhere to land): it pops like a balloon full of blood
  e.overdoseFrames = (e.overdoseFrames || 0) + 1;
  if (e.overdoseFrames > OVERDOSE_MAX_FRAMES) {
    fx.spawnDeathShower(e.pos, Math.sign(e.vel.x), 3);
    fx.spawnExplosion(c, '#E879F9', 14, 0, 10);
    fx.spawnExplosion(c, '#8B0000', 18, 0, 12);
    fx.spawnKillCallout(e, 'overdose');
    shakeScreen(state, 8);
    return false;
  }

  if (e.overdosePhase === 'rise') {
    // Something above to arc into (just the one: once it's hit something it rides out the arc).
    // Flyers first, anything else only if there's no flyer about
    const above = hitIds.length > 0 ? [] : enemies.filter(o => alive(o) && mid(o).y < c.y - 10 && Math.abs(mid(o).x - c.x) < OVERDOSE_RISE_RANGE);
    const pool = above.some(isAirEnemy) ? above.filter(isAirEnemy) : above;
    let target: Enemy | undefined, best = Infinity;
    for (const o of pool) {
      const d = Math.hypot(mid(o).x - c.x, mid(o).y - c.y);
      if (d < best) { best = d; target = o; }
    }
    if (target) {
      const t = mid(target);
      const rise = c.y - t.y;               // how far up it is
      let up = -e.vel.y;                    // current upward speed
      // Not enough speed left to get up there: kick harder (it's that eager)
      if (up * up < 2 * OVERDOSE_GRAVITY * rise) up = Math.min(OVERDOSE_MAX_RISE_SPEED, Math.sqrt(2 * OVERDOSE_GRAVITY * rise) * 1.08);
      e.vel.y = -up;
      // Frames until it's level with the target, and the sideways speed that puts it there
      const frames = Math.max(1, (up - Math.sqrt(Math.max(0, up * up - 2 * OVERDOSE_GRAVITY * rise))) / OVERDOSE_GRAVITY);
      const wantX = Math.max(-OVERDOSE_MAX_SIDE_SPEED, Math.min(OVERDOSE_MAX_SIDE_SPEED, (t.x - c.x) / frames));
      e.vel.x += (wantX - e.vel.x) * OVERDOSE_RISE_STEER;
    }
    e.vel.y += OVERDOSE_GRAVITY;
    if (e.vel.y >= 0) {
      // Top of the arc: pick something below and go straight at it
      let dive: Enemy | undefined, bestDive = OVERDOSE_DIVE_RANGE;
      for (const o of enemies) {
        if (!alive(o) || hitIds.includes(o.id) || mid(o).y <= c.y) continue;
        const d = Math.hypot(mid(o).x - c.x, mid(o).y - c.y);
        if (d < bestDive) { bestDive = d; dive = o; }
      }
      if (dive) {
        // Lead it: aim where it'll be by the time the body gets there
        const m = mid(dive);
        const eta = Math.hypot(m.x - c.x, m.y - c.y) / OVERDOSE_DIVE_SPEED;
        const t = { x: m.x + dive.vel.x * eta, y: m.y + (isAirEnemy(dive) ? dive.vel.y * eta : 0) };
        const len = Math.hypot(t.x - c.x, t.y - c.y) || 1;
        e.vel = { x: (t.x - c.x) / len * OVERDOSE_DIVE_SPEED, y: (t.y - c.y) / len * OVERDOSE_DIVE_SPEED };
        e.overdosePhase = 'dive';
      } else {
        e.vel = { x: 0, y: 2 };
        e.overdosePhase = 'drop';
      }
    }
  } else if (e.overdosePhase === 'drop') {
    e.vel.y += OVERDOSE_DROP_GRAVITY;
  }
  // (a dive keeps its speed and direction: a straight line, no arc)

  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
  e.rotation = (e.rotation || 0) + (e.overdosePhase === 'rise' ? 0.3 : 0.12);

  // Plowing through anyone in the way
  const box = boundsOf(e);
  for (const o of enemies) {
    if (!alive(o) || hitIds.includes(o.id) || !rectsOverlap(box, boundsOf(o))) continue;
    hitIds.push(o.id);
    o.health -= OVERDOSE_HIT_DAMAGE;
    fx.spawnDamageNumber(o.pos, OVERDOSE_HIT_DAMAGE, true);
    fx.spawnExplosion(mid(o), '#E879F9', 14, 0, 10);
    shakeScreen(state, 8);
    if (o.health <= 0) {
      fx.blowAwayEnemy(o, { x: e.vel.x * 0.7, y: Math.min(-8, e.vel.y * 0.7) }, 'dart_kill', Math.sign(e.vel.x));
      fx.spawnKillCallout(o, 'contact');
    } else {
      o.vel.x += e.vel.x * 0.5;
      o.vel.y += Math.min(0, e.vel.y * 0.5);
    }
  }

  // Coming down onto solid ground: splat
  if (e.vel.y > 0) {
    const floor = state.blocks.find(b => b.type !== 'pit' && b.type !== 'wall' && rectsOverlap(boundsOf(e), b) && e.pos.y + e.height - e.vel.y <= b.y + 2);
    if (floor) {
      e.pos.y = floor.y - e.height;
      startEnemyDeath(state, e, 'pancaked');
      fx.spawnDeathShower(e.pos, Math.sign(e.vel.x), 2);
      fx.spawnExplosion({ x: c.x, y: floor.y - 4 }, '#8B0000', 16, 0, 12);
      fx.spawnKillCallout(e, 'groundsplat');
      shakeScreen(state, 10);
      return false;
    }
  }
  return e.pos.y < state.camera.y + 1400;
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

/** The quickest and slowest something thrown takes to get to him. */
const THROW_MIN_T = 24, THROW_MAX_T = 48;
/** The size of each thing thrown. */
const THROWN_SIZE: Record<ThrownKind, { w: number; h: number }> = {
  tequila: { w: 10, h: 18 }, water: { w: 10, h: 18 }, coconut: { w: 16, h: 16 }, ice: { w: 16, h: 14 }, rock: { w: 16, h: 14 }, teargas: { w: 10, h: 16 },
  forty: { w: 12, h: 20 }, coffee: { w: 10, h: 14 }, stapler: { w: 16, h: 8 }, cleaner: { w: 10, h: 18 }, flask: { w: 12, h: 16 }, household: { w: 18, h: 18 }, wrench: { w: 20, h: 8 },
  horseshoe: { w: 16, h: 14 }, lunchpail: { w: 18, h: 16 },
};

/** Lobbed at him (from his throwing hand): up and over in an arc that comes down where he's standing. */
const throwAt = (ctx: FrameContext, e: Enemy, what: ThrownKind) => {
  const p = ctx.state.player;
  const x = e.pos.x + e.width / 2, y = e.pos.y + e.height - 58;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height / 2;
  const t = Math.max(THROW_MIN_T, Math.min(THROW_MAX_T, Math.abs(tx - x) / 7));
  const vx = (tx - x) / t, vy = (ty - y - 0.5 * BOTTLE_GRAVITY * t * t) / t;
  const { w, h } = THROWN_SIZE[what];
  ctx.fx.playGunSound('whoosh', 0.5, 5);
  ctx.state.projectiles.push({ id: `et-${Date.now()}-${Math.random()}`, pos: { x: x - w / 2, y: y - h / 2 }, vel: { x: vx, y: vy }, width: w, height: h, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy', shooterKind: e.kind ?? 'enemy', thrown: what, rotation: 0 });
};

/**
 * A shot from his gun, out of its muzzle (chest high, out in front of him, the side he's facing): it looks like what
 * he's holding fires. (Chest high, so ducking still gets under it.)
 */
const fireEnemyBullet = (ctx: FrameContext, e: Enemy, dir: number, from?: { x: number; y: number }) => {
  const look = shotLook(e.kind);
  const size = look ? (look === 'slug' ? 8 : 10) : 14;
  const x = from ? from.x : look ? e.pos.x + e.width / 2 + dir * (e.width / 2 + 6) - size / 2 : e.pos.x + e.width / 2;
  const y = from ? from.y : look ? e.pos.y + e.height - 48 : e.pos.y + 10;
  ctx.state.projectiles.push({ id: `ep-${Date.now()}-${Math.random()}`, pos: { x, y }, vel: { x: dir * (look ? shotSpeed(look, e.kind) : 7), y: 0 }, width: size, height: size, health: 1, maxHealth: 1, type: 'projectile', damage: ENEMY_BULLET_DAMAGE, owner: 'enemy', shooterKind: e.kind ?? 'enemy', shot: look });
  if (look) ctx.fx.playGunSound('egun', 1, look === 'slug' ? -5 : -3);
  // (the flash out the end of it)
  if (look) for (let i = 0; i < 4; i++) ctx.state.particles.push({ pos: { x: x + size / 2, y: y + size / 2 }, vel: { x: dir * (1 + Math.random() * 2), y: (Math.random() - 0.5) * 1.5 }, life: 6, color: look === 'cryo' ? '#E0F2FE' : look === 'flare' ? '#FDBA74' : '#FEF08A', size: 2 + Math.random() * 3 });
};
/** A rifleman fires in bursts: this many rounds, this many frames apart. */
const BURST = 3, BURST_GAP = 6;

/** Patrol / shoot / hover behaviour for regular enemies, plus knockback physics. */
const moveEnemy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  const { player } = state;
  const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH
    && e.pos.y + e.height > state.camera.y && e.pos.y < state.camera.y + CANVAS_HEIGHT;
  const isStunned = (e.pauseTimer || 0) > 0;
  const isHeld = (e.frozenTimer && e.frozenTimer > 0) || e.isTased;
  const air = isAirEnemy(e);

  // Air enemies bob around their spawn height (sludge drags them down to the floor)
  if (air) {
    if (e.initialY === undefined) e.initialY = e.pos.y;
    // A themed flyer (the eagle) flies its own path while it's free to
    if (e.behavior === 'custom' && !isStunned && !isHeld && !(e.sludgeTimer && e.sludgeTimer > 0) && runKindAI(ctx, e)) return;
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
        const top = floorUnder(state, e, 0);
        const floorY = (top ?? Infinity) - e.height;
        if (top === null || e.pos.y + e.sludgeFallSpeed < floorY) {
          e.pos.y += e.sludgeFallSpeed;
          dragIntoEnemies(ctx, e);
        } else if (e.pos.y < floorY) {
          e.pos.y = floorY;
          const damage = sludgeFallDamage(e);
          ctx.fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: floorY + e.height }, '#ADFF2F', 8, 0, 8);
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
    } else if (e.behavior === 'shoot' && onScreen && !holdingOff(state) && ++e.shootTimer > 60) {
      fireEnemyBullet(ctx, e, player.pos.x < e.pos.x ? -1 : 1, { x: e.pos.x + e.width / 2, y: e.pos.y + e.height - 10 });
      e.shootTimer = 0;
    }
    if (e.behavior === 'shoot') settleAfterKnockback(e);
    e.pos.x += e.vel.x;
    return;
  }

  // (a gator waiting in the water, an iguana up a palm: they hold their own position until something knocks them loose)
  if (e.behavior === 'custom' && !isStunned && selfPropelled(e)) { runKindAI(ctx, e); return; }

  const top = floorUnder(state, e);
  const overFloor = top !== null;
  const floorLevel = (top ?? Infinity) - e.height;
  const grip = enemyGrip(ctx.stageId, e, state.blocks);
  // Airborne if above the floor (a little downhill step doesn't count), just launched upward
  // (uppercuts, explosions) or shoved over a pit
  const onGround = e.vel.y === 0 && e.pos.y >= floorLevel - 16;
  if ((e.pos.y < floorLevel - 1 && !onGround) || e.vel.y < 0 || !overFloor) {
    // Launched into the air by knockback
    e.pos.x += e.vel.x;
    // (shoved off into a pit, it stops dead against the far side of it: it doesn't go on into the ground)
    if (e.vel.x !== 0) stopAgainstGround(state, e);
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
    // Sliding from knockback: further on ice, further still when oiled (and on a slick of oil on the ground; tar stops it)
    e.pauseTimer!--;
    const oilHere = groundOilUnder(state, e);
    e.vel.x *= oilHere === 'slick' ? 0.985 : oilHere === 'tar' ? 0.55 : grip.slide;
    e.pos.x += e.vel.x;
    if (Math.abs(e.vel.x) < 0.1) e.vel.x = 0;
    return;
  }

  if (e.behavior === 'custom') {
    runKindAI(ctx, e);
  } else if (e.id.startsWith('rusher') || isChargerKind(e.kind)) {
    const sameLevel = Math.abs((player.pos.y + player.height / 2) - (e.pos.y + e.height / 2)) < 80;
    const dir = player.pos.x < e.pos.x ? -1 : 1;
    // (it pulls up short at the edge of a drop rather than running straight off it: it looks a few strides ahead at that speed)
    e.vel.x = (onScreen && player.invincibilityTimer <= 0 && sameLevel && !holdingOff(state) && safeAhead(ctx, e, dir, CHARGER_LOOK)) ? dir * CHARGER_SPEED : 0;
  } else if (e.behavior === 'patrol') {
    if (e.pos.x > (e.initialX + e.patrolRange) || e.pos.x < e.initialX) e.vel.x *= -1;
  } else if (e.behavior === 'shoot' && onScreen) {
    if (!holdingOff(state)) e.shootTimer++;
    if (e.enemyType === 'shield') {
      turnShieldToPlayer(e, player);
      // Shield drops briefly to fire
      e.isShieldActive = e.shootTimer < 80;
      if (e.shootTimer > 120) {
        const dir = shieldFacing(e);
        // (with the shield down he throws whatever he's got: a bottle, a coconut, a chunk of ice...)
        const what = e.kind && THROWN[e.kind];
        if (what) throwAt(ctx, e, what);
        else fireEnemyBullet(ctx, e, dir);
        e.shootTimer = 0;
      }
    } else if ((e.burstLeft || 0) > 0) {
      // The rest of a rifleman's burst
      if (e.shootTimer >= BURST_GAP) { fireEnemyBullet(ctx, e, player.pos.x < e.pos.x ? -1 : 1); e.burstLeft!--; e.shootTimer = 0; }
    } else if (e.shootTimer > 60) {
      fireEnemyBullet(ctx, e, player.pos.x < e.pos.x ? -1 : 1);
      if (e.kind === 'sicario') e.burstLeft = BURST - 1;
      e.shootTimer = 0;
    }
  }
  if (e.behavior === 'shoot') settleAfterKnockback(e);
  // (the cops don't stand and shoot: they come at you and club you)
  if (isMeleeCop(e)) copMelee(ctx, e, onScreen);
  // Oil on the ground: tar holds its feet (a crawl), a slick has it sliding about (slow to get going, slow to stop)
  const oil = groundOilUnder(state, e);
  if (oil === 'tar') { e.pos.x += e.vel.x * 0.35; e.oilSlide = e.vel.x * 0.35; }
  else if (oil === 'slick') { e.oilSlide = (e.oilSlide ?? 0) + (e.vel.x - (e.oilSlide ?? 0)) * 0.04; e.pos.x += e.oilSlide; }
  else { e.oilSlide = e.vel.x; e.pos.x += e.vel.x; }
};

/** Which of a stage's ground oil (Oscar's field) an enemy's stood in, if any. */
const groundOilUnder = (state: GameState, e: Enemy): 'slick' | 'tar' | null => {
  const zones = state.groundOil;
  if (!zones || !zones.length) return null;
  const cx = e.pos.x + e.width / 2;
  const z = zones.find(o => cx > o.x1 && cx < o.x2);
  if (!z) return null;
  return Math.abs(e.pos.y + e.height - groundLineAt(state.groundRuns, cx)) <= 6 ? z.kind : null;
};

/** How fast a charger runs you down, and how far past its front it checks there's still ground (a few strides at that speed). */
const CHARGER_SPEED = 6, CHARGER_LOOK = 20;

/** Anything that high above an airborne enemy's feet is a wall it's run into, not ground it's landing on. */
const GROUND_SIDE_STEP = 16;

/**
 * An airborne enemy that's moved sideways into the face of the ground (the wall of a pit, a step up):
 * back out to the side it came from, and no more sideways speed. (The walls proper are slamIntoWalls'.)
 */
const stopAgainstGround = (state: GameState, e: Enemy) => {
  const box = boundsOf(e);
  const feet = e.pos.y + e.height;
  const wasX = e.pos.x - e.vel.x;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || b.type === 'wall' || b.oneWay) continue;
    if (feet <= b.y + GROUND_SIDE_STEP || !rectsOverlap(box, b)) continue;
    // (only the face it's just crossed: ground it's dropping away from the edge of, still under half of it, is
    // behind it, and stopping "against" that would throw it to the far end of the ground)
    const crossed = e.vel.x > 0 ? wasX + e.width <= b.x + 1 : wasX >= b.x + b.w - 1;
    if (!crossed) continue;
    e.pos.x = e.vel.x > 0 ? b.x - e.width : b.x + b.w;
    e.vel.x = 0;
    return;
  }
};

/** Frames a shield enemy takes to swing round when you get behind it (its back's open meanwhile). */
const SHIELD_TURN_FRAMES = 18;

/** Get round behind a shield enemy and it turns to put the shield back between you, after a beat. */
const turnShieldToPlayer = (e: Enemy, player: Player) => {
  const side = player.pos.x + player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
  if (side === shieldFacing(e)) { e.aiTimer = 0; return; }
  e.aiTimer = (e.aiTimer || 0) + 1;
  if (e.aiTimer >= SHIELD_TURN_FRAMES) { e.facing = side; e.aiTimer = 0; }
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
    fx.playGunSound('thud');

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
  if (player.jetski) return player.isUppercutting ? 'skileap' : 'wheelie';
  if (player.swimming && player.isCharging) return 'swim';
  if (player.bike && player.isCharging) return 'bike';
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
  // (a fish down under the lava: nothing to touch)
  if (submerged(e)) return true;
  const onScreen = e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  // Shoulder first into a raised shield: he doesn't go through it, he drives the man behind it back
  if (onScreen && shieldShove(ctx, e)) return true;
  // Straight into a mugger's switchblade: he sticks you
  if (onScreen && knifeFirst(ctx, e)) return true;
  // (and one he's left behind off a ramp, dropping back under him: out of it)
  if (e.kind === 'lowrider' && e.aiState === 'lost') return true;
  const stageDef = getBossDef(stageId);
  const bossDef = e.type === 'boss' ? stageDef : undefined;
  const hasShield = !!(player.filthShieldTimer && player.filthShieldTimer > 0);
  const isAttacking = player.isCharging || player.isUppercutting || !!player.isDivekicking || hasShield;
  const attackHit = isAttacking && rectsOverlap(getAttackHitbox(ctx), boundsOf(e));

  // (a regular enemy can only be hit once per move, but a fresh charge right after lands again: you can keep shoving him;
  // a boss keeps his breather between hits)
  const fresh = e.type !== 'boss' && e.hitByMove !== player.moveId;
  // A dive kick, shoulder charge or slide into a boss still in his breather: nothing goes in, but he doesn't go through
  // him either: a dive kick bounces off his head same as a stomp (no power back for it), a charge or slide rebounds
  // off him same as off anyone who's still standing
  if (attackHit && onScreen && e.type === 'boss' && state.arenaLocked && (player.isDivekicking || player.isCharging) && e.hitCooldown && e.hitCooldown > 0
    && !(player.isDivekicking && player.diveKickHitIds.includes(e.id))) {
    fx.spawnDamageNumber(e.pos, 0);
    if (player.isDivekicking) {
      player.diveKickHitIds.push(e.id);
      fx.playGunSound('stomp');
      player.vel.y = -Math.abs(player.vel.y) * 0.5;
      player.vel.x *= 0.5;
      player.lockTimer = BOUNCE_FRAMES;
      player.recoiling = true;
    } else {
      fx.playGunSound('punch');
      recoilOff(ctx, getEnemyMass(e));
    }
    return true;
  }
  if (attackHit && onScreen && (!e.hitCooldown || e.hitCooldown <= 0 || fresh)) {
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
    if (player.isCharging) {
      // (a boss takes the full hit; so does anything the jet ski's wheelie rams)
      if (e.type === 'boss' || player.jetski) damage = BOSS_CHARGE_DAMAGE;
      else if (player.isSliding) damage = isSmallCritter(e.kind) ? e.health : ENEMY_SLIDE_DAMAGE;
      // (a lunge through the water into a fish: that's the fish done)
      else if (player.swimming && e.kind === 'mutantfish') damage = e.health;
      else damage = ENEMY_CHARGE_DAMAGE;
    }
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
    e.hitByMove = player.moveId;
    fx.spawnDamageNumber(e.pos, damage, player.isUppercutting || !!player.isDivekicking || wasFrozen || hasShield);
    fx.playGunSound(wasFrozen ? 'crack' : player.isDivekicking ? 'stomp' : 'punch');

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
        fx.spawnKillCallout(e, wasFrozen ? 'shatter' : player.jetski ? 'skidive' : 'divekick');
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
    // (a boss's own weight behind it; anything else just a bump)
    if (!cheats.invincible) player.health -= kindContactDamage(e) ?? (e.type === 'boss' ? stageDef?.contact?.damage : undefined) ?? 5.5;
    state.lastHurt = { source: getContactHurtSource(ctx, e), at: state.frame };
    if (player.health > 0) {
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      fx.speakVulgarity('hurt', getContactHurtSource(ctx, e));
      fx.playGunSound('hurt');
      player.pushbackTimer = stageDef?.contact?.pushbackFrames?.(e) ?? PLAYER_PUSHBACK_DURATION;
      // (a goat's headbutt sends you a lot further)
      const butt = e.kind === 'goat' ? 1.8 : 1;
      player.vel = { x: (player.pos.x < e.pos.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X * butt, y: PLAYER_PUSHBACK_VEL_Y * butt };
    }
    bossDef?.onTouchPlayer?.(ctx, e);
    if (e.id.startsWith('rusher') || isChargerKind(e.kind)) e.pauseTimer = 60;
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
  // (a shoulder charge's shove: into a wall, that's a lot more than a bump)
  if (player.isCharging && !player.isSliding && !player.isUppercutting) e.chargedAt = ctx.state.frame;
  interrupt(e);
};

/** What an enemy was winding up to (a lunge, a swing, a shot) is knocked out of it: it has to start over. */
const INTERRUPTIBLE = new Set(['bristle', 'lunge', 'paw', 'charge', 'hiss', 'dive', 'swoop', 'bite', 'ashore-hiss', 'ashore-lunge']);
export const interrupt = (e: Enemy) => {
  e.melee = undefined;
  e.shootTimer = Math.min(e.shootTimer, 10);
  if (e.enemyType === 'shield') e.isShieldActive = true;
  if (e.kind && e.aiState && INTERRUPTIBLE.has(e.aiState)) { e.aiState = 'idle'; e.aiTimer = 0; }
};

// ---------------------------------------------------------------------------
// Shove physics (ported from the GML oEnemyParent): walls and floors hurt,
// shoved enemies domino into each other, and frozen enemies become projectiles.
// ---------------------------------------------------------------------------

const isBeingShoved = (e: Enemy) => (e.pauseTimer || 0) > 0 && Math.abs(e.vel.x) > 0.5;

/** How much two enemies on foot can overlap before they're eased apart (a little, so a crowd still looks like a crowd). */
const CROWD_OVERLAP = 6;

/** On its feet and walking about under its own steam (not flying, swimming, a boss, dead, being shoved, or a mid-boss). */
const onFoot = (e: Enemy) =>
  e.type !== 'boss' && e.health > 0 && !e.isBlownAway && !isAirEnemy(e) && !selfPropelled(e) && !submerged(e)
  && !isMidBoss(e) && !isBeingShoved(e) && !e.innocent;

/**
 * Enemies on foot don't stand in the same spot: two that overlap on the same footing are eased apart, half each
 * (a bit at a time, so they sidestep rather than snap). Neither gets pushed off an edge doing it: if one can't
 * give way, the other takes all of it.
 */
export const separateEnemies = (state: GameState) => {
  const crowd = state.enemies.filter(onFoot);
  for (let i = 0; i < crowd.length; i++) {
    for (let j = i + 1; j < crowd.length; j++) {
      const a = crowd[i], b = crowd[j];
      // (the same footing: their feet level within a step, and their boxes overlapping)
      if (Math.abs(a.pos.y + a.height - (b.pos.y + b.height)) > 20) continue;
      const overlap = Math.min(a.pos.x + a.width, b.pos.x + b.width) - Math.max(a.pos.x, b.pos.x);
      if (overlap <= CROWD_OVERLAP) continue;
      const push = Math.min(4, (overlap - CROWD_OVERLAP) / 2 + 0.5);
      // Whichever's further left goes left (dead level: the earlier one)
      const aLeft = a.pos.x + a.width / 2 <= b.pos.x + b.width / 2;
      const [l, r] = aLeft ? [a, b] : [b, a];
      const canL = hasFloorAt(state, l, -push), canR = hasFloorAt(state, r, push);
      if (canL && canR) { l.pos.x -= push; r.pos.x += push; }
      else if (canL) l.pos.x -= push * 2;
      else if (canR) r.pos.x += push * 2;
    }
  }
};

/** Would it still have ground under its feet moved dx over? */
const hasFloorAt = (state: GameState, e: Enemy, dx: number) => {
  const feet = e.pos.y + e.height;
  const top = floorTopAt(state.blocks, e.pos.x + e.width / 2 + dx + Math.sign(dx) * (e.width / 2 - 4), feet, 26);
  return top !== null && top > feet - 26 && top - feet < 30
    && !state.blocks.some(bk => bk.type === 'wall' && e.pos.x + dx < bk.x + bk.w && e.pos.x + dx + e.width > bk.x && e.pos.y < bk.y + bk.h && feet > bk.y);
};
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

/** What a mugger's knife does to you if you charge straight onto it. */
const KNIFE_DAMAGE = 16;

/**
 * A shoulder charge (not a slide) into a mugger from the front, the way he's facing: his switchblade's out in front
 * of him, and you run onto it. You're stuck and thrown back (the charge ends there); he doesn't get so much as a bruise.
 * From behind, or any other move, and he goes down like anyone else.
 */
const knifeFirst = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx, cheats } = ctx;
  const p = state.player;
  if (e.kind !== 'mugger' || !p.isCharging || p.isSliding || e.health <= 0 || e.isBlownAway || isFrozen(e) || (e.pauseTimer || 0) > 0) return false;
  if (e.hitByMove === p.moveId || !rectsOverlap(getAttackHitbox(ctx), boundsOf(e))) return false;
  const pc = p.pos.x + p.width / 2, ec = e.pos.x + e.width / 2;
  const side = pc < ec ? -1 : 1;
  const facing = Math.abs(e.vel.x) > 0.5 ? Math.sign(e.vel.x) : side;
  if (facing !== side) return false;
  e.hitByMove = p.moveId;
  harmlessBounce(ctx, e, PLAYER_PUSHBACK_VEL_X * 1.4, PLAYER_PUSHBACK_VEL_Y);
  if (p.invincibilityTimer <= 0) {
    if (!cheats.invincible) p.health -= KNIFE_DAMAGE;
    p.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES; p.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
    p.isHarmlessPushback = false; p.smugTimer = 0;
    fx.speakVulgarity('hurt', 'mugger_knife');
    fx.spawnDeathShower({ x: pc, y: p.pos.y + p.height / 2 }, side, 0.8);
    fx.spawnDamageNumber({ x: p.pos.x - 10, y: p.pos.y - 20 }, 'STABBED!', true, '#F87171');
    shakeScreen(state, 10, 6);
  }
  e.vel.x = 0;
  return true;
};

/**
 * A shoulder charge into a shield enemy's raised shield (any number of times: there's no cooldown on it).
 * The first hit's a CLANG (sparks, a jolt, a little chip damage); from then on, for as long as the charge
 * lasts, he's bulldozed backward along the ground on his heels, sparks streaming off the shield, into
 * whatever's behind him (a wall, a drop, the lava...). When the charge runs out he skids on and stumbles.
 */
const shieldShove = (ctx: FrameContext, e: Enemy): boolean => {
  const { state, fx } = ctx;
  const p = state.player;
  if (!p.isCharging || p.isSliding || e.enemyType !== 'shield' || !e.isShieldActive || e.type === 'boss' || e.isBlownAway || e.health <= 0) return false;
  const side = (e.pos.x + e.width / 2 > p.pos.x + p.width / 2 ? 1 : -1);
  if (shieldFacing(e) !== -side || side !== p.chargeFace) return false;
  // (where he'll be this frame, and a little reach in front of that: the shield's out in front of the man)
  const hb = getAttackHitbox(ctx);
  const reach = { x: hb.x - (side < 0 ? 12 : 0), y: hb.y, w: hb.w + 12, h: hb.h };
  if (!rectsOverlap(reach, boundsOf(e))) return false;
  // Driven off the edge of a drop: that's where the shove ends. He goes over, and down (he isn't carried across on the shield)
  if (!hasFloorBelow(state, e)) return false;
  const first = e.shovedAt === undefined || state.frame - e.shovedAt > 8;
  e.shovedAt = state.frame;
  // Held down, the charge keeps driving him a good long way (not forever)
  if (first) p.shoveT = SHIELD_SHOVE_FRAMES;
  if ((p.shoveT || 0) > 0) { p.shoveT!--; p.chargeTimer = Math.max(p.chargeTimer, 2); }
  // Driven back ahead of him, feet dragging; and he's a while getting his feet back under him afterward
  // (no sucker punch the moment you let up)
  e.pos.x = side > 0 ? p.pos.x + p.width + 2 : p.pos.x - e.width - 2;
  e.vel.x = p.vel.x * 0.9;
  // Less room between Meathead and a wall than he is wide: he's compacted between the two, shield and all
  const wall = wallAgainst(state, e);
  if (wall) { compact(ctx, e, wall, side); return true; }
  e.pauseTimer = Math.max(e.pauseTimer || 0, SHIELD_SHOVE_RECOVER);
  e.melee = undefined;
  e.shootTimer = 0;
  const cx = side > 0 ? e.pos.x : e.pos.x + e.width, cy = e.pos.y + e.height * 0.45;
  if (first) {
    // CLANG
    e.health = Math.max(1, e.health - SHIELD_SHOVE_CHIP);
    fx.spawnDamageNumber({ x: cx - 20, y: e.pos.y - 16 }, 'CLANG!', true, '#E5E7EB');
    fx.spawnExplosion({ x: cx, y: cy }, '#FDE047', 14, -side * 6, 10);
    fx.playGunSound('clang');
    shakeScreen(state, 10, 5);
  }
  // Sparks streaming off the shield, and the dust off his heels
  if (state.frame % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: cx, y: cy + (Math.random() - 0.5) * e.height * 0.7 }, vel: { x: -side * (2 + Math.random() * 5), y: -1 - Math.random() * 4 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2 });
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: side > 0 ? e.pos.x + e.width - 6 : e.pos.x + 6, y: e.pos.y + e.height - 3 }, vel: { x: -side * Math.random() * 2, y: -Math.random() * 2 }, life: 20, color: '#78716C', size: 3 + Math.random() * 4 });
  if (state.frame % 4 === 0) shakeScreen(state, 4, 2);
  return true;
};
const SHIELD_SHOVE_CHIP = 5;
/** A shoulder charge's shove into a wall: the bonus on top of the usual slam, and how long after the hit it still counts. */
const CHARGE_WALL_BONUS = 45, CHARGE_WALL_WINDOW = 45;
/** How long a held charge can keep driving a shield goon back (most of a second more), and how long he's reeling after. */
const SHIELD_SHOVE_FRAMES = 50, SHIELD_SHOVE_RECOVER = 55;

/**
 * A wall (or a shut door) the enemy's body is up against or into (its feet and head aside: floors and ceilings don't
 * count); or the side of anything solid too tall to step up onto (a conveyor belt, a raised floor: he isn't pushed
 * into it).
 */
const wallAgainst = (state: FrameContext['state'], e: Enemy) => {
  const box = { x: e.pos.x, y: e.pos.y + 6, w: e.width, h: e.height - 16 };
  const doorShut = state.doorState !== 'opening' && state.doorState !== 'open' && state.doorState !== 'closing';
  const feet = e.pos.y + e.height;
  return state.blocks.find(b => rectsOverlap(box, b) && (b.type === 'wall' || (b.type === 'door' && doorShut)
    || ((b.type === 'ground' || b.type === 'platform') && !b.oneWay && b.y < feet - SHOVE_STEP)));
};
/** A lip this low he's shoved up onto; any higher and it's a wall to him. */
const SHOVE_STEP = 26;

/** A shield goon crushed flat between Meathead and a wall: dead on the spot, and messily. */
const compact = (ctx: FrameContext, e: Enemy, wall: { x: number; w: number }, side: number) => {
  const { state, fx } = ctx;
  const at = { x: side > 0 ? wall.x : wall.x + wall.w, y: e.pos.y + e.height / 2 };
  e.pos.x = side > 0 ? wall.x - e.width : wall.x + wall.w;
  fx.spawnDamageNumber(e.pos, e.health, true);
  impactKill(ctx, e, 'compacted', -side);
  fx.spawnDeathShower(at, 0, 1.5);
  fx.spawnExplosion(at, '#E5E7EB', 12, -side * 6, 12);
  fx.playGunSound('crack');
  shakeScreen(state, 14, 8);
  state.player.shoveT = 0;
};

/**
 * A frozen enemy thawed out by hitting something (a wall, another enemy): the ice bursts off him, and the burst hurts
 * (THAW_BURST_DAMAGE, on top of whatever the impact did). Enough to kill him and he shatters where he is.
 * Returns true if it did.
 */
const thawBurst = (ctx: FrameContext, e: Enemy, dir: number, at: { x: number; y: number }, impact: number, callout: KillCallout): boolean => {
  const { state, fx } = ctx;
  e.health -= THAW_BURST_DAMAGE;
  fx.spawnDamageNumber(e.pos, Math.round(impact + THAW_BURST_DAMAGE), true, '#7DD3FC');
  fx.spawnExplosion(at, '#E0F2FE', 16, dir * 5, 14, true);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 9, y: -Math.random() * 7 }, life: 24 + Math.random() * 16, color: i % 2 ? '#BAE6FD' : '#FFFFFF', size: 2 + Math.random() * 4 });
  shakeScreen(state, 12, 8);
  fx.playGunSound('glass');
  // (still frozen for the kill: he shatters)
  if (e.health <= 0) { impactKill(ctx, e, callout, dir); return true; }
  e.frozenTimer = 0;
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 24 }, 'THAWED!', false, '#BAE6FD');
  return false;
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
  // Only a shove (or a blast) slams it into the wall; walking into one under its own steam it just stops there
  if ((e.pauseTimer || 0) <= 0) return false;

  // Shoulder-charged into it: major bonus damage, however slow it got there
  const charged = e.chargedAt !== undefined && state.frame - e.chargedAt < CHARGE_WALL_WINDOW;
  e.chargedAt = undefined;
  const damage = toGml(speed) * DAMAGE_WALL_IMPACT_SCALER * (isFrozen(e) ? FROZEN_WALL_IMPACT_MULTIPLIER : 1) + (charged ? CHARGE_WALL_BONUS : 0);
  // (frozen, it thaws on the wall with a burst, however hard it hit)
  if (isFrozen(e)) {
    e.health -= damage;
    return thawBurst(ctx, e, -dir, { x: dir > 0 ? wall.x : wall.x + wall.w, y: e.pos.y + e.height / 2 }, damage, 'wallsplat');
  }
  if (damage <= IMPACT_DAMAGE_THRESHOLD) return false;
  e.health -= damage;
  fx.spawnDamageNumber(e.pos, Math.round(damage), isFrozen(e) || charged);
  if (charged) fx.spawnExplosion({ x: dir > 0 ? wall.x : wall.x + wall.w, y: e.pos.y + e.height / 2 }, '#FFFFFF', 8, -dir * 5, 10);
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
  // (a bystander coming down from its own hop is fine; only one he sent flying gets hurt landing. And a sludgeling
  // coming down its own hops, or into the muck it lives in, is fine too)
  if ((e.innocent || e.kind === 'sludgeling') && !((e.pauseTimer || 0) > 0)) return;
  if (e.kind === 'sludgeling' && state.groundRuns.some(r => r.surface === 'muck' && e.pos.x + e.width / 2 > r.x1 && e.pos.x + e.width / 2 < r.x2)) return;
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
      // (and it thaws out against him, with a burst)
      const dir = -Math.sign(e.vel.x) || 1;
      e.vel.x *= 0.4;
      if (other.health <= 0) { fx.blowAwayEnemy(other, { x: -dir * 10, y: -10 }, 'charge_kill', -dir); fx.spawnKillCallout(other, isFrozen(other) ? 'shatter' : 'crush'); }
      thawBurst(ctx, e, dir, { x: midX, y: midY }, 0, 'crush');
      fx.playGunSound('thud');
      break;
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
    fx.playGunSound('thud');

    if (other.health <= 0) {
      fx.blowAwayEnemy(other, { x: Math.sign(e.vel.x) * 10, y: -10 }, 'charge_kill', Math.sign(e.vel.x));
      fx.spawnKillCallout(other, isFrozen(other) ? 'shatter' : 'crush');
    }
    if (e.health <= 0) impactKill(ctx, e, 'crush', -Math.sign(e.vel.x));
    break;
  }
};
