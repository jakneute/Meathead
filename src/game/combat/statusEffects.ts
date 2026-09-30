// The taser beam and damage-over-time effects (fire, needles), plus running boss AI.

import { Enemy, Projectile } from '../../types';
import {
  CANVAS_WIDTH, TASER_RANGE, TASER_DOT_DAMAGE, TASER_FIRE_THRESHOLD,
  TASER_TICK_RATE, TASER_AMMO_CONSUMPTION_RATE, FIRE_TICK_RATE, FIRE_DOT_DAMAGE,
  FIRE_DOT_DAMAGE_HEAVY, NEEDLE_DOT_TICK_RATE, NEEDLE_DOT_DAMAGE_PER_STACK,
} from '../../constants';
import { FrameContext, killBoss } from '../core/context';
import { updateBossAI, getBossDef, hitBoss } from '../bosses/registry';
import { fireWeapon, findTaserTarget, tasedHimself } from './weapons';
import { getStageLayout } from '../stages';
import type { WaterBody } from '../stages';
import { isMidBoss, midBossDamage, MIDBOSS_DAMAGE } from './midBoss';
import { zapCigarette, findFlyingCigarette } from '../bosses/oscar';
import { FrameInput, hasAmmo, armsBusy } from '../player/player';
import { playSound } from '../platform/audio';

/**
 * Holding fire with the taser locks onto a target and zaps it continuously.
 * Regular enemies are frozen, take damage over time and eventually catch fire.
 */
/** The target's dead: the beam shuts off, and stays off until fire is pressed again. */
const cutTaser = (player: FrameContext['state']['player']) => {
  player.isTasing = false;
  player.taserTargetId = null;
  player.taserTimer = 0;
  player.taserSpent = true;
};

export const updateTaser = (ctx: FrameContext, input: FrameInput) => {
  const { state, fx, stageId, currentWeapon, cheats } = ctx;
  const { player, enemies, projectiles } = state;

  const overloaded = (player.taserOverloadTimer || 0) > 0;
  // (no tasing mid charge, uppercut or divekick; a slide's fine)
  if (armsBusy(player)) input = { ...input, shoot: false };
  // Its target died: the beam stays off until fire is let go and pressed again
  if (!input.shoot) player.taserSpent = false;
  // Pulling the trigger while it's still overloaded: it just fizzles, and says so
  if (overloaded && currentWeapon === 'TASER' && input.shootPressed) {
    const x = player.pos.x + (player.facing === 1 ? player.width : 0), y = player.pos.y + 25;
    fx.spawnDamageNumber({ x: x - 40, y: player.pos.y - 34 }, 'STILL OVERLOADED!', false, '#00E5FF');
    playSound('click');
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y }, vel: { x: player.facing * Math.random() * 3, y: -Math.random() * 3 }, life: 12 + Math.random() * 8, color: i % 2 ? '#00E5FF' : '#E0F2FE', size: 2 });
  }
  if (!(currentWeapon === 'TASER' && input.shoot && hasAmmo(ctx, 'TASER')) || overloaded || player.taserSpent) {
    player.isTasing = false;
    player.taserTargetId = null;
    player.taserTimer = 0;
    return;
  }

  if (!player.isTasing) fireWeapon(ctx, input);
  if (!player.isTasing) return;
  // Into the water with the beam still going: it goes straight back up it into him
  if (player.swimming && state.deathTimer <= 0) { cutTaser(player); tasedHimself(ctx); return; }

  player.taserTimer = (player.taserTimer || 0) + 1;
  if (!cheats.infiniteAmmo && state.frame % TASER_AMMO_CONSUMPTION_RATE === 0) player.weaponAmmo['TASER'] -= 1;
  if (!player.isSliding) player.vel.x = 0; // (tasing from a slide doesn't stop the slide)
  if (player.weaponAmmo['TASER'] <= 0) {
    player.isTasing = false;
    player.taserTargetId = null;
  }

  if (!player.taserTargetId) {
    const nearest = findTaserTarget(state);
    if (nearest) player.taserTargetId = nearest.id;
  }
  // Oily Oscar's flicked cigarette steals the lock from anything else
  const cigarette = findFlyingCigarette(state);
  if (cigarette) player.taserTargetId = cigarette.id;

  const target: Enemy | Projectile | undefined = enemies.find(e => e.id === player.taserTargetId) || projectiles.find(p => p.id === player.taserTargetId);
  // Whatever it was locked onto is dead (killed by the beam or anything else): cut the beam.
  // (Oscar's cigarette isn't an enemy: once it's gone the beam just looks for a new target.)
  if (player.taserTargetId && (!target || target.health <= 0 || (target as Enemy).isBlownAway)) {
    if (player.taserTargetId.startsWith('oscar-cig-')) player.taserTargetId = null;
    else { cutTaser(player); return; }
  }
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

  if ((target as Projectile).isCigarette) {
    zapCigarette(ctx, target as Projectile);
    return;
  }

  if (target.type === 'boss') {
    const boss = target as Enemy;
    const def = getBossDef(stageId);
    // Some bosses react to the taser their own way (Oscar gets held until it bursts)
    if (def?.onTaser) { def.onTaser(ctx, boss); return; }
    if (boss.hitCooldown && boss.hitCooldown > 0) return;
    if (def?.shield?.isUp(boss, state)) {
      fx.spawnExplosion(boss.pos, def.shield.color, 4, 0, 3);
      return;
    }
    hitBoss(ctx, boss, 'TASER', { facing: player.facing });
    return;
  }

  // A mid-boss isn't held or set alight by it: the beam just hurts, tick by tick (its own fight sees to its death)
  if (target.type === 'enemy' && isMidBoss(target as Enemy)) {
    if (state.frame % TASER_TICK_RATE === 0) {
      const dmg = midBossDamage(target as Enemy, MIDBOSS_DAMAGE.TASER);
      target.health -= dmg;
      (target as Enemy).hitFlash = 3;
      fx.spawnDamageNumber(target.pos, Math.max(1, Math.round(dmg)));
    }
    return;
  }
  // Got hold of something in the water (and he's out of it): the whole of it round there goes live
  if (target.type === 'enemy') {
    const body = getStageLayout(stageId)?.waterBodyAt?.(state, target.pos.x + target.width / 2, target.pos.y + target.height * 0.6);
    if (body) { shockWater(ctx, target as Enemy, body); cutTaser(player); return; }
  }
  target.isTased = true;
  if (state.frame % TASER_TICK_RATE === 0) {
    target.health -= TASER_DOT_DAMAGE;
    fx.spawnDamageNumber(target.pos, TASER_DOT_DAMAGE);
    if (target.health <= 0) {
      if (target.type === 'enemy') {
        fx.killWithAnimation(target as Enemy, 'fried', 'taser_kill', 'fried');
      }
      cutTaser(player);
      return;
    }
  }
  if (player.taserTimer! >= TASER_FIRE_THRESHOLD && !target.isOnFire) {
    target.isOnFire = true;
    if (target.type === 'enemy') (target as Enemy).ignitedByTaser = true;
    fx.playGunSound('ignite');
  }
};

/** How far along the water the current kills, either way from what the taser had hold of. */
const SHOCK_REACH = 480;

/**
 * The taser into water: the one it had hold of and everything else in that body of water near it is fried on the
 * spot (not the bosses, not a mid-boss), the water lights up, and there's a callout for it.
 */
const shockWater = (ctx: FrameContext, target: Enemy, body: WaterBody) => {
  const { state, fx, stageId } = ctx;
  const tx = target.pos.x + target.width / 2;
  const x1 = Math.max(body.x1, tx - SHOCK_REACH), x2 = Math.min(body.x2, tx + SHOCK_REACH);
  const layout = getStageLayout(stageId);
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.type !== 'enemy' || isMidBoss(e)) continue;
    const ex = e.pos.x + e.width / 2;
    if (ex < x1 || ex > x2) continue;
    if (e !== target && layout?.waterBodyAt?.(state, ex, e.pos.y + e.height * 0.6)?.key !== body.key) continue;
    fx.killWithAnimation(e, 'fried', 'taser_kill', e === target ? 'conducted' : undefined);
  }
  state.waterShock = { x1, x2, surface: body.surface, bottom: body.bottom, at: state.frame };
  state.screenShakeTimer = Math.max(state.screenShakeTimer, 14);
  fx.playGunSound('taser');
  playSound('crack');
  for (let i = 0; i < 30; i++) {
    state.particles.push({ pos: { x: x1 + Math.random() * (x2 - x1), y: body.surface - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 5 }, life: 18 + Math.random() * 14, color: i % 3 ? '#00E5FF' : '#FFFFFF', size: 2 + Math.random() * 3 });
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
  const { state, fx, stageId } = ctx;
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
          // A fire the taser started is still an electrocution
          else if (e.ignitedByTaser) fx.killWithAnimation(e, 'fried', 'taser_kill', 'fried');
          else fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'charred');
        }
      }
      if (state.frame % 2 === 0) spawnFlames(ctx, e, true);
    }

    if (e.health > 0 && e.needleCount && e.needleCount > 0) {
      e.dotTimer = (e.dotTimer || 0) + 1;
      const needleTick = e.type === 'boss' ? getBossDef(stageId)?.needleTick : undefined;
      if (needleTick) {
        // A boss weak to needles handles them his own way
        needleTick(ctx, e);
      } else if (e.dotTimer >= NEEDLE_DOT_TICK_RATE) {
        const dotDmg = e.needleCount * NEEDLE_DOT_DAMAGE_PER_STACK;
        e.health -= dotDmg;
        fx.spawnDamageNumber(e.pos, dotDmg);
        e.dotTimer = 0;
        if (e.health <= 0) {
          if (e.type === 'boss') killBoss(ctx, e, 0, false);
          else {
            fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 10, y: -15 }, 'dart_kill');
            e.overdosed = true;
            fx.spawnKillCallout(e, 'overdose');
          }
        }
      }
    }

    if (e.type === 'boss') {
      if (e.health > 0 && state.arenaLocked) updateBossAI(ctx, e);
    } else if (!e.isBlownAway && ((e.frozenTimer && e.frozenTimer > 0) || (e.isTased && player.isTasing && player.taserTargetId === e.id)) && (e.pauseTimer || 0) <= 0) {
      // (held still: frozen, or tased; a body on its way out never is)
      e.vel.x = 0;
      e.vel.y = 0;
    } else {
      e.isTased = false;
    }
  });
};
