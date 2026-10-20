// Projectile movement, bouncing/lingering physics and all projectile hit resolution.

import { submerged } from '../enemies/kinds/victor';
import { Enemy, Projectile, VulgarityType } from '../../types';
import { BOTTLE_GRAVITY, PARTICLE_PALETTES } from '../../constants';
import { playGlassShatterSound, playSound } from '../platform/audio';
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
import { getBossDef, hitBoss, maybeReactToWeapon, weaponOf } from '../bosses/registry';
import { explodeOilRocket } from './weapons';
import { tryCorkVent } from '../bosses/victor';
import { ICE_BLOCK_ACCEL, ICE_BLOCK_GRACE, ICE_BLOCK_LIFE, ICE_BLOCK_MAX_SPEED } from '../bosses/artie';
import { pushEnemy } from './knockback';
import { stickNeedle, ENEMY_NEEDLE } from './needles';
import { updateOscarRocket, updateCigarette } from '../bosses/oscar';
import { pickRandom, rectsOverlap, boundsOf, isOnScreen, screenRect } from '../core/utils';
import { getAttackHitbox } from '../player/player';
import { shakeScreen, GameState } from '../core/state';
import { getStageLayout } from '../stages';
import { shieldFacing, isMachineKind } from '../enemies/kinds';
import { isMidBoss } from './midBoss';
import { inFinale, FINALE_FREEZE_TIME, PITCH_SPEED, PITCH_HOMING, FINALE_SLUDGE_LINGER, FINALE_SLICK_SPREAD, FINALE_SLICK_ALIEN_EVERY, FINALE_SLICK_ALIEN_DAMAGE } from './finaleBuffs';
import { ROOM_L, ROOM_R, FLOOR } from '../stages/finale/geometry';
import { ernieQuake } from '../bosses/ernie';
import { hurtTaken, gritty } from '../core/resist';
import { startGunKill, startEnemyDeath } from '../enemies/deaths';
import { gunDeathMode } from '../enemies/gunDeaths';
import { spared } from '../enemies/enemies';
import { isEnemyBullet } from '../player/deathAnim';
import { rayKillLine } from './rayGun';
import { customWeapon } from './customWeapons';

/** Moves one projectile and resolves its collisions. Returns false to remove it. */
export const updateProjectile = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;

  if (p.isMethBarrel && p.health <= 0) {
    fx.spawnMethExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
    return false;
  }
  if (p.health <= 0) return false;
  // (a game's own weapon's shot: its own rules entirely)
  if (p.custom) return customWeapon(p.custom)?.update(ctx, p) ?? false;
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
        fx.playGunSound('poopsplat');
        // (and the room's that much filthier for it: it goes everywhere)
        state.hectorFilth = Math.min(1, state.hectorFilth + HECTOR_FILTH_PER_LOG);
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
  if (p.owner === 'player' && p.pitched) return updatePitchedRock(ctx, p);
  if (p.owner === 'player' && p.isBoulder) return updatePlayerBoulder(ctx, p);

  if (p.thrown) return updateThrown(ctx, p);

  const hasPhysics = p.isBoulder || (p.isIce && (p.width > 30 || p.width <= 20 || p.owner === 'player')) || p.isShrapnel || p.isCocaine || p.isMethBarrel || p.isSludge || p.isPoop;
  if (hasPhysics) {
    if (!updatePhysicsProjectile(ctx, p)) return false;
  } else {
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    if (p.life !== undefined && --p.life <= 0) return false;
    // (Meathead 2's cat form's hairball: drooping a little as it goes; it slaps wet onto the first wall or floor)
    if (p.isHairball && p.owner === 'player') {
      p.vel.y = Math.min(4, p.vel.y + 0.07);
      const box = boundsOf(p);
      if (state.blocks.some(b => b.type !== 'pit' && !b.grating && (b.type !== 'platform' && !b.oneWay ? true : p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= b.y + 2) && rectsOverlap(box, b))) {
        hairSplat(state, p.pos.x + p.width / 2, p.pos.y + p.height / 2);
        fx.playGunSound('hairsplat');
        return false;
      }
    }
    // (Meathead 2's ray gun: no shooting through walls; it fizzles out on the first one, in pink sparks)
    if (p.isRay && p.owner === 'player') {
      const box = boundsOf(p);
      if (state.blocks.some(b => b.type !== 'pit' && b.type !== 'platform' && !b.oneWay && !b.grating && rectsOverlap(box, b))) {
        const fx0 = p.vel.x > 0 ? p.pos.x + p.width : p.pos.x, fy0 = p.pos.y + p.height / 2;
        for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: fx0, y: fy0 }, vel: { x: -Math.sign(p.vel.x || 1) * Math.random() * 2.5, y: (Math.random() - 0.5) * 3 }, life: 10 + Math.random() * 10, color: i % 3 ? '#FF6FD8' : '#FFFFFF', size: 2 + Math.random() * 2 });
        fx.playGunSound('rayFizzle');
        return false;
      }
    }
  }

  if (p.pos.x < state.camera.x - 400 || p.pos.x > state.camera.x + CANVAS_WIDTH + 400) return false;

  return p.owner === 'player' ? resolvePlayerProjectileHits(ctx, p) : resolveEnemyProjectileHit(ctx, p);
};

/** A hairball bursting (on a wall, the floor, somebody): tufts of gray-brown fur and a spit of drool. */
const hairSplat = (state: GameState, x: number, y: number) => {
  for (let i = 0; i < 9; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2.5 }, life: 22 + Math.random() * 16, color: ['#6B5B4E', '#8A7766', '#4A3F37', '#B9AC9C'][i % 4], size: 2 + Math.random() * 2, grav: 0.18 } as typeof state.particles[number]);
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 - Math.random() * 1.5 }, life: 14, color: '#D7F2F7', size: 1.5, grav: 0.25 } as typeof state.particles[number]);
};

/** Something thrown: up and over, end over end, and it smashes (or splats, or bursts) on the ground, a wall, or him. */
const updateThrown = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.vel.y += BOTTLE_GRAVITY;
  p.pos.x += p.vel.x;
  p.pos.y += p.vel.y;
  p.rotation = (p.rotation || 0) + (p.thrown === 'teargas' ? 0.2 : 0.32) * Math.sign(p.vel.x || 1);
  // (a trail: smoke off the tear gas, embers off the hot rock, frost off the ice)
  if (state.frame % 2 === 0) {
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
    if (p.thrown === 'teargas') state.particles.push({ pos: { x: cx, y: cy }, vel: { x: -p.vel.x * 0.2, y: -0.5 }, life: 26, color: 'rgba(203, 213, 180, 0.6)', size: 5 + Math.random() * 5 });
    if (p.thrown === 'rock') state.particles.push({ pos: { x: cx, y: cy }, vel: { x: -p.vel.x * 0.2, y: -0.3 }, life: 14, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 2 + Math.random() * 2 });
    if (p.thrown === 'ice') state.particles.push({ pos: { x: cx, y: cy }, vel: { x: -p.vel.x * 0.1, y: 0.2 }, life: 12, color: '#E0F2FE', size: 2 });
  }
  const box = boundsOf(p);
  // (a fire escape's grating it just falls through)
  const solid = state.blocks.some(b => !b.hidden && b.type !== 'platform' && rectsOverlap(box, b)) || state.blocks.some(b => !b.grating && (b.type === 'ground' || (b.type === 'platform' && p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= b.y)) && rectsOverlap(box, b));
  if (solid || p.pos.y > state.camera.y + 900) { smashThrown(ctx, p); return false; }
  if (p.pos.x < state.camera.x - 400 || p.pos.x > state.camera.x + CANVAS_WIDTH + 400) return false;
  const stillFlying = resolveEnemyProjectileHit(ctx, p);
  if (!stillFlying) smashThrown(ctx, p);
  return stillFlying;
};

/** What each thrown thing breaks into (and the sound of it). */
const SMASH: Record<NonNullable<Projectile['thrown']>, { bits: string[]; spill?: string; count: number }> = {
  tequila: { bits: ['#A16207', '#CA8A04', '#FDE68A', '#F8FAFC', '#92400E'], spill: 'rgba(253, 230, 138, 0.7)', count: 14 },
  water: { bits: ['#7DD3FC', '#E0F2FE', '#0EA5E9', '#F8FAFC'], spill: 'rgba(125, 211, 252, 0.8)', count: 10 },
  coconut: { bits: ['#78350F', '#92400E', '#5B3413', '#F8FAFC'], spill: 'rgba(248, 250, 252, 0.8)', count: 12 },
  ice: { bits: ['#E0F2FE', '#BAE6FD', '#FFFFFF', '#7DD3FC'], count: 14 },
  rock: { bits: ['#44403C', '#F97316', '#FDE047', '#57534E', '#EA580C'], count: 16 },
  teargas: { bits: ['#374151', '#65A30D'], count: 4 },
  forty: { bits: ['#78350F', '#A16207', '#C8A26B', '#D6B98C', '#F8FAFC'], spill: 'rgba(250, 204, 21, 0.6)', count: 14 },
  coffee: { bits: ['#F8FAFC', '#E5E7EB', '#15803D'], spill: 'rgba(107, 63, 29, 0.85)', count: 8 },
  stapler: { bits: ['#111827', '#DC2626', '#9CA3AF'], count: 6 },
  cleaner: { bits: ['#2563EB', '#F8FAFC', '#FACC15'], spill: 'rgba(96, 165, 250, 0.8)', count: 8 },
  flask: { bits: ['#E0F2FE', '#F8FAFC', '#BEF264'], spill: 'rgba(132, 204, 22, 0.85)', count: 12 },
  household: { bits: ['#9CA3AF', '#78716C', '#E5E7EB', '#7C2D12'], count: 10 },
  wrench: { bits: ['#9CA3AF', '#6B7280', '#E5E7EB'], count: 6 },
  horseshoe: { bits: ['#78716C', '#A8A29E', '#FDE68A'], count: 6 },
  lunchpail: { bits: ['#B91C1C', '#FACC15', '#F8FAFC', '#A16207', '#78350F'], spill: 'rgba(120, 72, 30, 0.8)', count: 12 },
};

const smashThrown = (ctx: FrameContext, p: Projectile) => {
  const { state } = ctx;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const s = SMASH[p.thrown!];
  for (let i = 0; i < s.count; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 7, y: -Math.random() * 5 }, life: 22 + Math.random() * 14, color: s.bits[i % s.bits.length], size: 2 + Math.random() * 3 });
  if (s.spill) for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 18, color: s.spill, size: 3 + Math.random() * 3 });
  // (the tear gas: a cloud of it, hanging there a moment)
  if (p.thrown === 'teargas') for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: cy - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 1.6, y: -0.3 - Math.random() * 0.6 }, life: 60 + Math.random() * 40, color: i % 2 ? 'rgba(203, 213, 180, 0.55)' : 'rgba(226, 232, 216, 0.5)', size: 10 + Math.random() * 12 });
  // (the flask: a puff of whatever was in it)
  if (p.thrown === 'flask') for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 20, y: cy - Math.random() * 10 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.4 - Math.random() * 0.5 }, life: 40 + Math.random() * 30, color: 'rgba(163, 230, 53, 0.45)', size: 8 + Math.random() * 8 });
  if (p.thrown === 'tequila' || p.thrown === 'forty' || p.thrown === 'flask') playGlassShatterSound();
  else playSound(p.thrown === 'rock' ? 'crack' : p.thrown === 'teargas' ? 'clink' : p.thrown === 'water' || p.thrown === 'coffee' || p.thrown === 'cleaner' ? 'splash' : p.thrown === 'stapler' ? 'clink' : 'thud');
};

const updateOilRocket = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  // Up / down nudge it in flight; let go and it levels back out
  const steer = p.noSteer ? 0 : state.player.steer || 0;
  if (p.forkDy !== undefined) p.vel.y = p.forkDy;
  else if (steer) p.vel.y = Math.max(-OIL_ROCKET_STEER_MAX, Math.min(OIL_ROCKET_STEER_MAX, p.vel.y + steer * OIL_ROCKET_STEER_ACCEL));
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
  // (the finale's press room: it goes off on the side walls, not out through the doorways at their feet)
  if (inFinale(ctx.stageId) && (p.pos.x < ROOM_L || p.pos.x + p.width > ROOM_R)) return explode();
  for (const b of state.blocks) {
    // Rockets fired inside the arena pass through the (closed) door wall behind them
    if (state.arenaLocked && b.x <= BOSS_DOOR_X + DOOR_WIDTH && p.vel.x > 0) continue;
    // (up through a jump-through ledge, or past it side-on: it only stops a rocket coming down on it)
    if (b.oneWay && !(p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= b.y + 1)) continue;
    if (b.type !== 'pit' && rectsOverlap(box, b)) return explode();
  }
  for (const e of state.enemies) {
    if (e.health > 0 && !e.isBlownAway && rectsOverlap(box, boundsOf(e))) return explode();
  }
  return true;
};

/** How long sludge runs down a wall before it's gone (frames). */
const SLUDGE_SLIDE_MAX = 50;

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
    // Running down a wall: it picks up speed as it goes, and a run down a tall one doesn't go on for ever (it's spread
    // itself too thin by then: a last splash, and it's gone)
    if (p.isSliding) {
      p.slideT = (p.slideT || 0) + 1;
      p.vel.y = Math.min(9, 2 + p.slideT * 0.35);
      if (p.slideT > SLUDGE_SLIDE_MAX) {
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 3, y: Math.random() * 2 }, life: 16, color: i % 2 ? '#ADFF2F' : '#4ADE80', size: 3 + Math.random() * 3 });
        return false;
      }
    }
    p.pos.y += p.vel.y;
  }

  for (const b of state.blocks) {
    if (b.type === 'pit' || !rectsOverlap(boundsOf(p), b)) continue;
    // A boulder (and anything of his) goes up through a jump-through ledge and only lands on one from above (like him)
    if (b.oneWay && (p.isBoulder || p.owner === 'player') && (p.vel.y <= 0 || p.pos.y + p.height - p.vel.y > b.y + 1)) continue;
    // Poop logs fly through walls near where they spawned
    if (p.isPoop && p.spawnX !== undefined && Math.abs(p.pos.x - p.spawnX) < 200) continue;

    // NOTE: compares against the player's position, not the projectile's (original behaviour, kept as-is; not for
    // sludge, which got read as landing on top of a tall wall it had hit side-on, or hitting a wall it had landed on)
    const overlapX = Math.min(p.pos.x + p.width - b.x, b.x + b.w - (p.isSludge ? p.pos.x : player.pos.x));
    const overlapY = Math.min(p.pos.y + p.height - b.y, b.y + b.h - (p.isSludge ? p.pos.y : player.pos.y));
    // (come down onto it from above, it's the floor, however deep in it fell this frame: a ledge it's landed on isn't
    // a wall to run down the side of, and through the ledge under it; a glob of sludge coming down fast went in deeper
    // than it was wide, and got read as hitting it side-on)
    const fromAbove = !p.isLingering && p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= b.y + 1;
    if (overlapX < overlapY && !(fromAbove && (b.oneWay || p.isSludge))) {
      // Hit a wall
      if (p.isMethBarrel) { p.vel.x *= -0.8; p.pos.x = (p.pos.x + p.width / 2 < b.x + b.w / 2) ? b.x - p.width : b.x + b.w; continue; }
      if (p.isBoulder) { if (p.isHeaved) heavedBoulderRumble(ctx, p); shatterBoulder(ctx, p); return false; }
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
      if (p.isSludge && p.visualOnly) return false;
      if (p.isSludge) {
        // (the finale: wider puddles that lie there a good while, running together into one slick: see spreadSlick)
        const slick = p.owner === 'player' && inFinale(ctx.stageId);
        const puddleW = p.puddleW ?? (slick ? 110 + Math.random() * 40 : 70 + Math.random() * 30);
        // A ledge he could drop through: it can too. It puddles there, and runs on through to whatever's under it,
        // puddling there the same size (and on through the next one, all the way down)
        if (b.oneWay) {
          state.projectiles.push({
            id: `${p.id}-drip`, pos: { x: p.pos.x, y: b.y + b.h + 1 }, vel: { x: p.vel.x * 0.15, y: 0.5 },
            width: p.width, height: p.height, health: 1, maxHealth: 1, type: 'projectile', damage: p.damage, owner: p.owner, isSludge: true, life: 150, puddleW,
            dripFrom: b.y + b.h,
          });
          p.overhang = { y: b.y + b.h, x1: b.x, x2: b.x + b.w };
        }
        // Splat into a lingering puddle
        p.isLingering = true;
        p.life = slick ? FINALE_SLUDGE_LINGER : SLUDGE_LINGER_DURATION;
        p.vel = { x: 0, y: 0 };
        p.width = puddleW;
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
        if (p.isHeaved && p.vel.y > HEAVED_RUMBLE_SPEED) heavedBoulderRumble(ctx, p);
        p.vel.y = Math.abs(p.vel.y) > 1.0 ? -p.vel.y * (p.isBoulder ? BOULDER_BOUNCE_DAMPING : 0.85) : 0;
      }
      p.pos.y = (p.pos.y + p.height / 2 < b.y + b.h / 2) ? b.y - p.height : b.y + b.h;
      if (p.owner === 'player' && p.isIce && p.bounceDecay === undefined) p.bounceDecay = 15;
    }
  }
  if (!p.isLingering) p.pos.x += p.vel.x;

  if (p.isSludge && p.isLingering && p.owner === 'player' && inFinale(ctx.stageId) && !spreadSlick(ctx, p)) return false;
  if (p.isSludge && p.isLingering) {
    p.life!--;
    // Only Meathead's sludge hurts enemies (Tommy's own puke puddles used to hurt him)
    if (p.owner === 'player') damageEnemiesInSludgePuddle(ctx, p);
    if (state.frame % 4 === 0) {
      // (a slick bubbles all along it: one splash for every puddle's worth of it, so it's no busier than the puddles were)
      for (let k = Math.ceil(p.width / 120); k > 0; k--) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height / 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 6 }, life: 25, color: '#ADFF2F', size: 6 + Math.random() * 8 });
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
  fx.playGunSound('crack');
};

/** Ernie's lobbed boulder slamming into the floor or a wall shakes the room like his stomps (stunning you if you're on the ground). */
const HEAVED_RUMBLE_SPEED = 8; // only real slams, not the little bounces after
const heavedBoulderRumble = (ctx: FrameContext, p: Projectile) => {
  ctx.bossHelpers.setScreenShake(25);
  ctx.bossHelpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION);
  ctx.fx.playGunSound('slam');
  ernieQuake(ctx, p.pos.x + p.width / 2);
};

const shatterBoulder = (ctx: FrameContext, p: Projectile) => {
  ctx.fx.spawnRockShatter(p.pos);
  // Just breaks apart (Meathead's shakes the screen by how fast it was going)
  if (p.owner === 'player') shakeScreen(ctx.state, 8, Math.min(10, (Math.abs(p.vel.x) + Math.abs(p.vel.y)) / GML_SCALE * 0.5) * GML_SCALE);
};

/**
 * What stops a boulder (or a shotgun pellet): a jump-through ledge it treats the way he does: it flies up through it from below
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

  // (a jump-through ledge doesn't stop it going up or across, only coming down onto it)
  if (solidForBoulder(state, { ...boundsOf(p), x: p.pos.x + p.vel.x }, p.vel.y, p.pos.y + p.height)) redirect(Math.PI - Math.atan2(p.vel.y, p.vel.x) + variance());
  if (solidForBoulder(state, { ...boundsOf(p), y: p.pos.y + p.vel.y }, p.vel.y, p.pos.y + p.height)) redirect(-Math.atan2(p.vel.y, p.vel.x) + variance());
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
 * The finale's sludge, lying on the floor: puddles run together into one slick (the newer folded into the older), and
 * the slick creeps out along the floor each way to the walls. False if this one's been folded into another (it's
 * gone). Up on a riser it just lies there, like any puddle.
 */
const spreadSlick = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.slick ??= false;
  const base = p.pos.y + p.height;
  // (up on a riser it just lies there; out through a door, past the walls, it's gone as quick as any puddle)
  if (p.pos.x + p.width <= ROOM_L || p.pos.x >= ROOM_R) { p.life = Math.min(p.life ?? 0, SLUDGE_LINGER_DURATION); return true; }
  if (base < FLOOR - 4) return true;
  // (creeping out to the walls)
  const x1 = Math.max(ROOM_L, p.pos.x - FINALE_SLICK_SPREAD), x2 = Math.min(ROOM_R, p.pos.x + p.width + FINALE_SLICK_SPREAD);
  p.pos.x = x1; p.width = x2 - x1;
  // (run into another: the two are one)
  for (const q of state.projectiles) {
    if (q === p || !q.isSludge || !q.isLingering || q.owner !== 'player' || q.health <= 0 || (q.life ?? 0) <= 0) continue;
    if (Math.abs(q.pos.y + q.height - base) > 4 || q.pos.x > x2 + 6 || q.pos.x + q.width < x1 - 6) continue;
    const a = Math.min(q.pos.x, x1), b = Math.max(q.pos.x + q.width, x2);
    q.pos.x = a; q.width = b - a;
    q.height = Math.max(q.height, p.height); q.pos.y = base - q.height;
    q.life = Math.max(q.life ?? 0, p.life ?? 0);
    q.slick = true;
    // (gone: and not something for another puddle to run into, the rest of this frame)
    p.health = 0;
    return false;
  }
  return true;
};

/**
 * The finale's pitched boulder: a fastball, homing in on the alien the whole way (fast, flat, end over end). Anyone
 * who happens to be in its way, on foot or up on a jetpack, is just dead (it doesn't slow down for them); it ends in
 * the alien, or a wall if he's gone. The hit on him is the boulder's usual (see alien.ts: the damage, the stun).
 */
const updatePitchedRock = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  p.life = (p.life ?? 0) - 1;
  const alien = state.enemies.find(e => e.type === 'boss' && e.health > 0 && !e.isBlownAway);
  if (alien) {
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
    const dx = alien.pos.x + alien.width / 2 - cx, dy = alien.pos.y + alien.height / 2 - cy, d = Math.hypot(dx, dy) || 1;
    p.vel.x += (dx / d * PITCH_SPEED - p.vel.x) * PITCH_HOMING;
    p.vel.y += (dy / d * PITCH_SPEED - p.vel.y) * PITCH_HOMING;
    const v = Math.hypot(p.vel.x, p.vel.y) || 1;
    p.vel.x *= PITCH_SPEED / v; p.vel.y *= PITCH_SPEED / v;
  }
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  p.rotation = (p.rotation || 0) + 0.55 * (Math.sign(p.vel.x) || 1);
  // (grit and chips streaming off it)
  if (state.frame % 2 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2 - p.vel.x * 0.6, y: p.pos.y + p.height / 2 - p.vel.y * 0.6 }, vel: { x: -p.vel.x * 0.08 + (Math.random() - 0.5), y: -p.vel.y * 0.08 + (Math.random() - 0.5) }, life: 10 + Math.random() * 6, color: Math.random() < 0.5 ? '#A8A29E' : '#78716C', size: 2 + Math.random() * 2 });
  const box = boundsOf(p);
  for (const e of state.enemies) {
    if (e.type === 'boss' || e.health <= 0 || e.isBlownAway || e.innocent || !rectsOverlap(box, boundsOf(e))) continue;
    wrongPlace(ctx, e, p);
  }
  if (alien && rectsOverlap(box, boundsOf(alien))) {
    hitBoss(ctx, alien, 'BOULDER', { facing: p.vel.x > 0 ? 1 : -1, p });
    pitchImpact(ctx, p);
    return false;
  }
  if (p.life <= 0 || state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(box, b))) { shatterBoulder(ctx, p); return false; }
  return true;
};

/** An agent who happened to be where the fastball was going: dead on the spot, sent flying, in pieces. Nobody meant it
 * (Meathead was throwing at the alien): no kill line from him, just the callout. */
const wrongPlace = (ctx: FrameContext, e: Enemy, p: Projectile) => {
  const { state, fx } = ctx;
  const dir = Math.sign(p.vel.x) || 1;
  e.health = 0;
  e.isBlownAway = true;
  e.frozenTimer = 0;
  e.vel = { x: p.vel.x * 0.55, y: Math.min(-9, p.vel.y * 0.5 - 6) };
  fx.spawnDeathShower(e.pos, dir, 2.2);
  fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height * 0.4 }, '#8B0000', 14, dir * 10, 14);
  fx.spawnKillCallout(e, 'wrongplace');
  playSound('crunch'); playSound('splat', 0.8);
  shakeScreen(state, 8, 6);
};

/** The fastball landing in the alien: the crack of it, chips and dust bursting off him, a ring of air, a big shake. */
const pitchImpact = (ctx: FrameContext, p: Projectile) => {
  const { state, fx } = ctx;
  const at = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  const back = -(Math.sign(p.vel.x) || 1);
  fx.spawnRockShatter(p.pos);
  // (a ring of white, then the chips and dust, back off him the way it came)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    state.particles.push({ pos: { ...at }, vel: { x: Math.cos(a) * 7, y: Math.sin(a) * 7 }, life: 7, color: i % 2 ? '#FFFFFF' : '#FDE68A', size: 3 });
  }
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { ...at }, vel: { x: back * (2 + Math.random() * 8), y: -2 - Math.random() * 6 }, life: 22 + Math.random() * 18, color: ['#57534E', '#78716C', '#A8A29E', '#D6D3D1'][i % 4], size: 2 + Math.random() * 4, grav: 0.35 });
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 20, y: at.y + (Math.random() - 0.5) * 20 }, vel: { x: back * Math.random() * 2, y: -0.5 - Math.random() }, life: 30 + Math.random() * 20, color: 'rgba(214, 211, 209, 0.55)', size: 8 + Math.random() * 8 });
  playSound('crack', 1, -4); playSound('punch', 1, -8); playSound('thud', 1, -6);
  shakeScreen(state, 16, 12);
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
  // (a band across its top half: it still rides up over a low step, and a low ceiling it's rolling along under isn't a wall)
  if (solidForBoulder(state, { x: p.pos.x + p.vel.x, y: p.pos.y + 3, w: p.width, h: p.height - GML_SCALE * 16 - 3 }, -1, Infinity)) {
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

    if (en.type === 'boss' && p.slick !== undefined && inFinale(stageId)) {
      // The finale's slick under a grounded alien: it eats into him now and then (it doesn't ground him: only a glob
      // does that), and it isn't used up by it
      if (state.frame % FINALE_SLICK_ALIEN_EVERY !== 0 || en.sludgeTickFrame === state.frame) continue;
      en.sludgeTickFrame = state.frame;
      en.health -= FINALE_SLICK_ALIEN_DAMAGE;
      fx.spawnDamageNumber(en.pos, FINALE_SLICK_ALIEN_DAMAGE, false, '#84CC16');
      if (en.health <= 0) ctx.bossHelpers.killBoss(en, 0, false, 'SLUDGE');
      continue;
    }
    if (en.type === 'boss') {
      const onStandInSludge = getBossDef(stageId)?.onStandInSludge;
      if (onStandInSludge) { onStandInSludge(ctx, en); continue; }
      if (en.hitCooldown && en.hitCooldown > 0) continue;
      p.life = 0;
      // (anyone but Dale, who stands and stews in it (onStandInSludge): one hit, like a shot, and the puddle's gone)
      hitBoss(ctx, en, 'SLUDGE', { facing: 0 });
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

/** What doesn't bleed: machines, vehicles, and things made of muck or magma. */
const BLOODLESS = new Set<string>(['drone', 'generator', 'lowrider', 'pickup', 'cruiser', 'chopper', 'sludgeling', 'amalgam', 'magmafish']);
/** The bosses who aren't made of blood (Artie's ice, Tommy's muck). */
const BLOODLESS_BOSSES = new Set<string>(['Artie Avalanche', 'Toxic Tommy']);

/** A handgun or machine gun round. */
const isBullet = (p: Projectile) => p.id.startsWith('p-') || p.id.startsWith('lmg-');

/** What a round sparks off instead of going into: machines, vehicles. */
const METAL = new Set<string>(['drone', 'generator', 'lowrider', 'pickup', 'cruiser', 'chopper']);

/** A round off something hard (a machine, a shield): a burst of sparks where it hit, and a ping. */
const bulletSparks = (ctx: FrameContext, p: Projectile, box: { x: number; y: number; w: number; h: number }) => {
  const { state } = ctx;
  const dir = -(Math.sign(p.vel.x) || 1);
  const x = Math.max(box.x, Math.min(box.x + box.w, p.pos.x + p.width / 2));
  const y = Math.max(box.y + 2, Math.min(box.y + box.h - 2, p.pos.y + p.height / 2));
  state.particles.push({ pos: { x, y }, vel: { x: 0, y: 0 }, life: 3, color: '#FFFFFF', size: 9 });
  for (let i = 0; i < 8; i++) {
    const a = (Math.random() - 0.5) * 2.2, sp = 3 + Math.random() * 5;
    state.particles.push({ pos: { x, y }, vel: { x: dir * Math.cos(a) * sp, y: Math.sin(a) * sp - 1.5 }, life: 6 + Math.random() * 8, color: i % 3 ? '#FDE047' : '#FFFFFF', size: 1.5 + Math.random() * 1.5 });
  }
  if (state.frame - (state.lastSparkSound ?? -99) > 4) { state.lastSparkSound = state.frame; playSound('clink', 0.35); }
};

/** A bullet that didn't kill: a little spray of blood out of the far side of him, in the direction it was going. */
const bulletBlood = (ctx: FrameContext, p: Projectile, enemy: Enemy) => {
  const { state } = ctx;
  const dir = Math.sign(p.vel.x) || 1;
  const x = Math.max(enemy.pos.x, Math.min(enemy.pos.x + enemy.width, p.pos.x + p.width / 2));
  const y = Math.max(enemy.pos.y + 4, Math.min(enemy.pos.y + enemy.height - 4, p.pos.y + p.height / 2));
  // Out the far side of him, the way the round went: a fan of it, big drops arcing down, a red mist hanging a moment
  const SPRAY = ['#DC2626', '#B91C1C', '#EF4444', '#7F1D1D', '#991B1B'];
  for (let i = 0; i < 18; i++) {
    state.particles.push({
      pos: { x, y }, vel: { x: dir * (2.5 + Math.random() * 7.5), y: -3.5 - Math.random() * 4 + i * 0.25 },
      life: 24 + Math.random() * 22, color: SPRAY[i % SPRAY.length], size: 3 + Math.random() * 4, grav: 0.32,
    });
  }
  // (the burst at the wound itself: a splash of bright red, there and gone)
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * 2.2 + dir, y: Math.sin(a) * 2.2 }, life: 8, color: i % 2 ? '#F87171' : '#DC2626', size: 4 + Math.random() * 2 }); }
  // (a little spurt back out of the hole, toward him)
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x, y }, vel: { x: -dir * (1 + Math.random() * 2.5), y: -1 - Math.random() * 2 }, life: 14 + Math.random() * 8, color: PARTICLE_PALETTES.GORE[(i + 1) % PARTICLE_PALETTES.GORE.length], size: 1.5 + Math.random() * 2, grav: 0.3 });
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: x + dir * (4 + i * 6), y: y - 2 + (Math.random() - 0.5) * 6 }, vel: { x: dir * (0.6 + i * 0.4), y: -0.3 }, life: 12 + i * 3, color: '#B91C1C', size: 7 + i * 3, alpha: 0.35 });
  // (it hit someone: you hear it)
  playSound('gunhit', 0.7);
};

/** Player projectile vs. enemies, bosses and meth barrels. Returns false if the projectile is spent. */
/** How much filthier Hector's arena gets for each poop log that goes into his wind (it's at its worst after this many: 1 / it). */
const HECTOR_FILTH_PER_LOG = 0.07;

const resolvePlayerProjectileHits = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const { player } = state;

  // (its first check reaches back to where it came from: point blank, the muzzle's already past what's up against him)
  const reach = boundsOf(p);
  if (p.fromX !== undefined) { const x1 = Math.min(reach.x, p.fromX), x2 = Math.max(reach.x + reach.w, p.fromX); reach.x = x1; reach.w = x2 - x1; p.fromX = undefined; }
  for (const enemy of state.enemies) {
    if (enemy.health <= 0 || enemy.isBlownAway || !rectsOverlap(reach, boundsOf(enemy))) continue;
    // (a stray shot that's flown off screen doesn't kill what it finds out there)
    if (!isOnScreen(screenRect(state), enemy) || submerged(enemy)) continue;
    if (p.isSludge && p.isLingering) continue;
    // (the finale's ice pellets punch on through whoever they hit, freezing each once; their life's the same)
    const icePierce = !!p.isIce && p.owner === 'player' && inFinale(ctx.stageId);
    if (icePierce && p.hitIds?.includes(enemy.id)) continue;

    // Bosses are untouchable until the arena locks (boulders bounce off)
    if (enemy.type === 'boss' && !state.arenaLocked) {
      if (p.isBoulder) { p.vel.x *= -0.5; p.vel.y = -5; }
      continue;
    }

    // Shield enemies block shots from the side the shield's facing
    const shieldLeft = shieldFacing(enemy) < 0;
    const hitsShieldSide = shieldLeft ? p.vel.x > 0 && p.pos.x < enemy.pos.x + enemy.width / 2 : p.vel.x < 0 && p.pos.x + p.width > enemy.pos.x + enemy.width / 2;
    // (except from overhead: a lobbed boulder, anything coming down on top of him, goes over the shield)
    // (coming down on him from above, or plunging steeply in: a boulder spiked down, say)
    const overhead = p.vel.y > 1.5 && (p.pos.y + p.height / 2 < enemy.pos.y + enemy.height * 0.45 || p.vel.y > Math.abs(p.vel.x) * 1.5);
    // (the finale's needles go straight through a ballistic shield, into the man behind it)
    const pierces = (p.isDart && inFinale(ctx.stageId)) || icePierce;
    if (enemy.enemyType === 'shield' && enemy.isShieldActive && hitsShieldSide && !overhead && !pierces) {
      if (isBullet(p)) bulletSparks(ctx, p, boundsOf(enemy));
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

    // (a round off a machine sparks)
    if (isBullet(p) && (METAL.has(enemy.kind || '') || isMachineKind(enemy.kind))) bulletSparks(ctx, p, boundsOf(enemy));
    // A stage's mid-boss takes hits its own way (or the shot just went past it: a round thing in a square box)
    const special = enemy.kind ? getStageLayout(ctx.stageId)?.hitSpecialEnemy?.(ctx, enemy, p) : undefined;
    if (special === 'miss') continue;
    if (special) return false;

    if (enemy.type === 'boss') {
      const hpBefore = enemy.health;
      const landedFullHit = hitBossWithProjectile(ctx, enemy, p);
      if (isBullet(p) && enemy.health > 0 && enemy.health < hpBefore && !BLOODLESS_BOSSES.has(ctx.stageId || '')) bulletBlood(ctx, p, enemy);
      if (landedFullHit && p.isBoulder) shatterBoulder(ctx, p);
      if (icePierce) { (p.hitIds ??= []).push(enemy.id); continue; }
      return false;
    }

    // A dart into a machine (a generator, an electrical panel, a car): it's only a dart. It doesn't stick, nothing gets
    // into it, nothing to overdose: just the hit
    if (p.isDart && (METAL.has(enemy.kind || '') || isMachineKind(enemy.kind))) {
      enemy.health -= p.damage;
      fx.spawnDamageNumber(enemy.pos, p.damage);
      if (enemy.health <= 0) fx.blowAwayEnemy(enemy, { x: (Math.random() - 0.5) * 10, y: -15 }, 'dart_kill');
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
    // (the finale: frozen solid a good while longer)
    if (p.isIce) { if (!wasFrozen) enemy.frozeAt = state.frame; enemy.frozenTimer = inFinale(ctx.stageId) ? FINALE_FREEZE_TIME : SHOTGUN_FREEZE_TIME; }
    fx.spawnDamageNumber(enemy.pos, p.damage, p.isBoulder);
    if (p.isIce) spawnIceMist(state, p, 8);
    // (a hairball: a wet slap of fur off him)
    if (p.isHairball) { hairSplat(state, p.pos.x + p.width / 2, p.pos.y + p.height / 2); fx.playGunSound('hairsplat'); }
    if (isBullet(p) && enemy.health > 0 && !wasFrozen && !(BLOODLESS.has(enemy.kind || '') || isMachineKind(enemy.kind))) bulletBlood(ctx, p, enemy);
    if (enemy.health <= 0) {
      // (the plain pistol: a person through the forehead, an animal its own stupid way: see gunDeaths.ts)
      const gunMode = !wasFrozen && p.id.startsWith('p-') && !p.isLmg && !spared(enemy) ? gunDeathMode(enemy) : null;
      // Killing an enemy that was already frozen shatters it
      if (wasFrozen) { fx.spawnGlassShatter(enemy.pos); fx.spawnKillCallout(enemy, 'shatter'); }
      // (a ray gun's bolt: vaporized, the way the alien's beam did his men)
      else if (p.isRay && !spared(enemy)) { startEnemyDeath(state, enemy, 'vaporized', { x: Math.sign(p.vel.x) || 1, y: 0 }); fx.spawnKillCallout(enemy, 'vaporized'); }
      else if (gunMode) startGunKill(state, enemy, gunMode, p.vel);
      else fx.spawnDeathShower(enemy.pos, 0, 1.2);
      fx.spawnPickup(enemy.pos);
      // (a hairball kill: Meathead 2's own pool, put in the table at its startup)
      fx.speakVulgarity(p.isBoulder ? 'boulder_kill' : (p.isIce ? 'shotgun_kill' : (p.isSludge ? 'sludge_kill' : p.isRay ? rayKillLine() : p.isHairball ? 'hairball_kill' as VulgarityType : 'gun_kill')));
      player.killSatisfactionTimer = 60;
    }
    if (p.isBoulder) shatterBoulder(ctx, p);
    if (icePierce) { (p.hitIds ??= []).push(enemy.id); continue; }
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
  if (player.invincibilityTimer > 0 || player.untouchable || p.visualOnly) return true;

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
    player.health -= hurtTaken(stageId, p.damage / 2);
    state.lastHurt = { source: getProjectileHurtSource(p, stageId), at: state.frame };
    // (a bullet that's killed him: through his forehead, see player/deathAnim)
    if (player.health <= 0 && isEnemyBullet(p)) state.shotDead = { frame: state.frame, dir: Math.sign(p.vel.x) || (player.pos.x + player.width / 2 < p.pos.x ? -1 : 1) };
    if (player.health > 0) {
      player.invincibilityTimer = PLAYER_INVINCIBILITY_FRAMES;
      player.hurtTimer = PLAYER_INVINCIBILITY_FRAMES;
      // (the finale: he takes it and keeps going, no knockback, nothing interrupted)
      if (gritty(stageId)) { fx.speakVulgarity('hurt', getProjectileHurtSource(p, stageId)); fx.playGunSound('hurt'); }
      else {
      // (hurt out of a rebound: the hurt takes over, the rebound's done)
      player.recoiling = false; player.lockTimer = 0; player.slideRecoil = false;
      player.isHarmlessPushback = false;
      player.smugTimer = 0;
      fx.speakVulgarity('hurt', getProjectileHurtSource(p, stageId));
      player.pushbackTimer = PLAYER_PUSHBACK_DURATION;
      const pDir = p.vel.x !== 0 ? Math.sign(p.vel.x) : (player.pos.x < p.pos.x ? -1 : 1);
      player.vel.x = p.knock ? p.knock.x : pDir * PLAYER_PUSHBACK_VEL_X;
      player.vel.y = p.knock ? p.knock.y : PLAYER_PUSHBACK_VEL_Y;
      player.isCharging = false;
      player.isSliding = false;
      player.isUppercutting = false;
      player.isDivekicking = false;
      }
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
  // Lobbed and still on its way up: it takes them up with it
  if (p.vel.y < -1) {
    fx.blowAwayEnemy(enemy, { x: p.vel.x * 0.6, y: Math.min(-10, p.vel.y * 1.1) }, 'boulder_kill');
    fx.spawnKillCallout(enemy, 'uppercut');
  }
  // On its way down (or rolling along): flat. A flyer's brought down out of the air, hard, and flattens anything it
  // comes down on
  else if (enemy.enemyType === 'flyer' || enemy.enemyType === 'drone' || enemy.behavior === 'fly' || enemy.behavior === 'hover') {
    fx.blowAwayEnemy(enemy, { x: p.vel.x * 0.15 || 0.5, y: 18 }, 'boulder_kill');
    enemy.meleeFlung = true;
    enemy.crushing = true;
    fx.spawnKillCallout(enemy, 'squished');
  }
  // Anything else is left flat as a pancake, never sent flying (up on a ledge or a hill: flat right there)
  else fx.killWithAnimation(enemy, 'pancaked', 'boulder_kill', flattened ? 'flattened' : 'squished');
  state.player.killSatisfactionTimer = 60;
  return true;
};
