// Blackout Barry: kills the lights and teleports around, then either
// ground-pounds (electrifying the floor, ceiling and walls) or calls a
// lightning storm. Gets a little faster as he loses health.
// Weakness, needles: up to three stick in him for a small stacking drain; a
// fourth overloads him for big damage and gets him high as a kite, and for a
// while afterwards he's built up a tolerance and needles bounce off. Either one
// finishing him off is a weakness kill.

import { Enemy, Projectile } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, BARRY_SPEEDUP_AT_ZERO_HP, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y,
} from '../../constants';
import type { FrameContext } from '../core/context';
import { BARRY_LINES } from '../../content/dialogue';
import { stickNeedle, BOSS_NEEDLE } from '../combat/needles';
import { pickRandom } from '../core/utils';
import { BossDef, ARENA_MID, BOSS_WALL_GAP, CEILING_Y, bossFloorY, hurtPlayer, speakAsBoss } from './shared';

const TELEPORT_HEIGHT = CEILING_Y;
const POUND_DROP_SPEED = 60;
const ELECTRIFIED_FRAMES = 30;
const POUND_DAMAGE = 16;
const STRIKE = { width: 70, frames: 35, damage: 20, safeGap: 70 };
const EXHAUSTED_DROP_SPEED = 14;
const BARRY = 'Blackout Barry';
const MAX_NEEDLES = 3;                // the next one overloads him
const NEEDLE_FRAMES = 600;            // stuck needles fall out after this long
const NEEDLE_DAMAGE_PER_SECOND = 1;   // per needle: 1, 2, 3 dps
const OVERLOAD_DAMAGE = 150;
const HIGH_FRAMES = 200;              // floating around like a kite
export const BARRY_TOLERANCE_FRAMES = 330;         // needles bounce off (starts at the overload)
const HIGH_FLOAT_Y = 150;
/** His tell shrinks this much more again than his other timings by the end (on top of the speed-up). */
const TELL_SQUEEZE = 0.2;

const update = (ctx: FrameContext, boss: Enemy) => {
  // Speeding up hard as he loses health: every phase timing shrinks, most of it early (he's frantic by half)
  const missingHpRatio = Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));
  const pace = 1 - Math.sqrt(missingHpRatio) * BARRY_SPEEDUP_AT_ZERO_HP;
  const frames = (n: number) => Math.max(1, Math.round(n * pace));
  if (boss.toleranceTimer && boss.toleranceTimer > 0) boss.toleranceTimer--;

  switch (boss.bossState) {
    case 'high': floatHigh(ctx, boss, frames); break;
    case 'idle':
      if (boss.stateTimer! <= 0) startBlackout(ctx, boss, frames);
      break;
    case 'blackout_teleport': teleport(ctx, boss, frames); break;
    case 'telegraphing': telegraph(ctx, boss, frames); break;
    case 'ground_pound': groundPound(ctx, boss, frames); break;
    case 'lightning_storm': lightningStorm(ctx, boss, frames); break;
    case 'exhausted':
      // Sinks back to the floor and catches his breath
      boss.pos.y = Math.min(bossFloorY(boss), boss.pos.y + EXHAUSTED_DROP_SPEED);
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'idle';
        boss.stateTimer = frames(35);
        boss.pos.y = bossFloorY(boss);
      }
      break;
  }
};

type Frames = (n: number) => number;

const startBlackout = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  boss.bossState = 'blackout_teleport';
  boss.stateTimer = frames(260);
  boss.jumpCount = 0; // teleports so far
  boss.shootTimer = 0; // frames since the last teleport
  ctx.bossHelpers.setScreenShake(10);
};

/** Lights out: he blinks around near the ceiling, faster each time. */
const teleport = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  const { player } = ctx.state;
  const helpers = ctx.bossHelpers;
  boss.shootTimer = (boss.shootTimer || 0) + 1;
  const interval = Math.max(6, Math.floor(frames(26) - (boss.jumpCount || 0) * 2));
  if (boss.shootTimer >= interval) {
    boss.shootTimer = 0;
    boss.jumpCount = (boss.jumpCount || 0) + 1;
    boss.pos.x = BOSS_DOOR_X + 100 + Math.random() * (ARENA_RIGHT - boss.width - BOSS_WALL_GAP - (BOSS_DOOR_X + 100));
    boss.pos.y = TELEPORT_HEIGHT;
    helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 }, '#2E1A47', 8, 0, 5);
    helpers.playGunSound('taser');
  }

  if (boss.stateTimer! <= 0) {
    // Lights up on the far side from Meathead and picks an attack
    boss.bossState = 'telegraphing';
    boss.jumpCount = Math.random() > 0.5 ? 1 : 0; // 0 = ground pound, 1 = lightning storm
    // (the tell gets shorter still than everything else as he goes: less and less time to read which it'll be)
    const worn = Math.sqrt(Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth)));
    boss.stateTimer = Math.max(1, Math.round(frames(90) * (1 - worn * TELL_SQUEEZE)));
    boss.pos.y = TELEPORT_HEIGHT;
    boss.pos.x = player.pos.x < ARENA_MID ? ARENA_RIGHT - 260 : BOSS_DOOR_X + 250;
    boss.electrifiedTimer = 0;
    boss.activeLightningStrikes = [];
    helpers.playGunSound('taser');
  }
};

const telegraph = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  if (boss.stateTimer! > 0) return;
  if (boss.jumpCount === 0) {
    boss.bossState = 'ground_pound';
    boss.stateTimer = 90;
    boss.electrifiedTimer = 0;
    boss.activeLightningStrikes = [];
  } else {
    boss.bossState = 'lightning_storm';
    boss.stateTimer = frames(130);
    boss.activeLightningStrikes = [];
    ctx.bossHelpers.setScreenShake(15);
    ctx.bossHelpers.playGunSound('taser');
  }
};

/**
 * Slams down and electrifies the room's edges for half a second: you have to be
 * in the air, but not up by the ceiling or hugging a wall.
 */
const groundPound = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  const { player } = ctx.state;
  const helpers = ctx.bossHelpers;
  const floorY = bossFloorY(boss);
  boss.pos.y = Math.min(floorY, boss.pos.y + POUND_DROP_SPEED);
  if (boss.pos.y < floorY) return;

  if (!boss.electrifiedTimer) {
    boss.electrifiedTimer = ELECTRIFIED_FRAMES;
    helpers.setScreenShake(25);
    helpers.playGunSound('slam');
    helpers.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: 540 }, '#ffff00', 15, 0, 10);
    helpers.spawnExplosion({ x: boss.pos.x, y: 540 }, '#00ffff', 10, -5, 8);
    helpers.spawnExplosion({ x: boss.pos.x + boss.width, y: 540 }, '#00ffff', 10, 5, 8);
    return;
  }
  if (boss.electrifiedTimer < 0) return;
  boss.electrifiedTimer--;

  const touchesFloor = player.isGrounded || player.pos.y + player.height >= 540;
  const touchesCeiling = player.pos.y <= 150;
  const touchesWall = player.pos.x <= ARENA_LEFT + 20 || player.pos.x + player.width >= ARENA_RIGHT - 20;
  if ((touchesFloor || touchesCeiling || touchesWall) && (player.invincibilityTimer || 0) <= 0) {
    helpers.spawnExplosion({ x: player.pos.x + player.width / 2, y: player.pos.y + player.height / 2 }, '#ffff00', 12, 0, 10);
    helpers.playGunSound('taser');
    hurtPlayer(ctx, POUND_DAMAGE, 'electric', { x: (player.pos.x < boss.pos.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
  }

  if (boss.electrifiedTimer <= 0) {
    boss.bossState = 'exhausted';
    boss.stateTimer = frames(150);
    boss.pos.y = floorY;
  }
};

/** Lightning bolts rain down across the arena, never right next to Barry. */
const lightningStorm = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  const { player } = ctx.state;
  const helpers = ctx.bossHelpers;
  const strikes = boss.activeLightningStrikes = boss.activeLightningStrikes || [];
  const minX = ARENA_LEFT + 20, maxX = ARENA_RIGHT - 20;

  if (boss.stateTimer! % frames(10) === 0 && boss.stateTimer! > 25) {
    const safeMin = boss.pos.x - STRIKE.safeGap;
    const safeMax = boss.pos.x + boss.width + STRIKE.safeGap;
    for (let s = 0; s < 2; s++) {
      let x = minX + Math.random() * (maxX - minX);
      if (x >= safeMin && x <= safeMax) {
        x = x < (safeMin + safeMax) / 2 ? safeMin - 60 - Math.random() * 80 : safeMax + 60 + Math.random() * 80;
      }
      x = Math.max(minX, Math.min(maxX, x));
      strikes.push({ x, duration: STRIKE.frames, maxDuration: STRIKE.frames, width: STRIKE.width });
      helpers.spawnExplosion({ x, y: 530 }, '#ffffff', 5, 0, 5);
    }
    helpers.playGunSound('thunder');
    helpers.setScreenShake(8);
  }

  // Each bolt hurts for as long as it lasts
  for (let i = strikes.length - 1; i >= 0; i--) {
    const strike = strikes[i];
    strike.duration--;
    const playerMidX = player.pos.x + player.width / 2;
    if (Math.abs(playerMidX - strike.x) < strike.width / 2 + player.width / 2 && (player.invincibilityTimer || 0) <= 0) {
      helpers.spawnExplosion({ x: strike.x, y: player.pos.y + player.height / 2 }, '#ffff00', 10, 0, 10);
      helpers.playGunSound('taser');
      hurtPlayer(ctx, STRIKE.damage, 'electric', { x: (player.pos.x < strike.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
    }
    if (strike.duration <= 0) strikes.splice(i, 1);
  }

  if (boss.stateTimer! <= 0) {
    boss.bossState = 'exhausted';
    boss.stateTimer = frames(150);
    boss.activeLightningStrikes = [];
  }
};

/**
 * Weakness: needles stick in him (up to three) instead of hitting. A fourth
 * overloads him. While his tolerance is up they just bounce off.
 */
const catchNeedle = (ctx: FrameContext, boss: Enemy, p: Projectile) => {
  if (!p.isDart) return false;
  p.health = 0;
  if (boss.toleranceTimer && boss.toleranceTimer > 0) {
    ctx.fx.spawnExplosion(p.pos, '#9CA3AF', 6, -Math.sign(p.vel.x) * 3, 4);
    ctx.fx.spawnDamageNumber({ x: boss.pos.x + boss.width / 2, y: boss.pos.y - 20 }, 'TOLERANCE', false, '#C084FC');
    ctx.fx.playGunSound('clink');
    speakAsBoss(BARRY, pickRandom(BARRY_LINES.TOLERANCE), ctx.bossHelpers, 'casual');
    return true;
  }
  if ((boss.needleCount || 0) >= MAX_NEEDLES) { overload(ctx, boss, p); return true; }

  boss.needleCount = (boss.needleCount || 0) + 1;
  boss.needleTimer = NEEDLE_FRAMES;
  if (!boss.needleOffsets) boss.needleOffsets = [];
  stickNeedle(boss, p, BOSS_NEEDLE);
  return true;
};

/** The fourth needle: big damage, the needles pop out, and he gets high as a kite. */
const overload = (ctx: FrameContext, boss: Enemy, p: Projectile) => {
  const { fx } = ctx;
  const center = { x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 };
  boss.needleCount = 0;
  boss.needleOffsets = [];
  boss.needleTimer = 0;
  boss.dotTimer = 0;
  boss.toleranceTimer = BARRY_TOLERANCE_FRAMES;
  boss.health -= OVERLOAD_DAMAGE;
  boss.hitCooldown = 30;
  fx.spawnDamageNumber(boss.pos, OVERLOAD_DAMAGE, true);
  for (const color of ['#FF007F', '#39FF14', '#FFD700', '#00F0FF', '#B388FF']) fx.spawnExplosion(center, color, 8, 0, 14);
  fx.playGunSound('dart');
  ctx.bossHelpers.setScreenShake(15);
  ctx.state.damageNumbers.push({
    id: `callout-${ctx.state.frame}-${Math.random()}`, text: 'HIGH AS A KITE!', pos: { x: center.x, y: boss.pos.y - 40 },
    vel: { x: 0, y: -3 }, life: 75, maxLife: 75, isCritical: true, isCallout: true, color: '#C084FC',
  });
  if (boss.health <= 0) { ctx.bossHelpers.killBoss(boss, p.vel.x > 0 ? 1 : -1, true, 'NEEDLES'); return; }

  // Whatever he was doing, he's done doing it
  boss.bossState = 'high';
  boss.stateTimer = HIGH_FRAMES;
  boss.electrifiedTimer = 0;
  boss.activeLightningStrikes = [];
  speakAsBoss(BARRY, pickRandom(BARRY_LINES.HIGH), ctx.bossHelpers);
};

/** Drifts up toward the ceiling and bobs and sways around like a kite, then comes down dazed. */
const floatHigh = (ctx: FrameContext, boss: Enemy, frames: Frames) => {
  const t = HIGH_FRAMES - (boss.stateTimer || 0);
  const targetY = HIGH_FLOAT_Y + Math.sin(t * 0.08) * 25;
  boss.pos.y += (targetY - boss.pos.y) * 0.06;
  boss.pos.x = Math.max(ARENA_LEFT + BOSS_WALL_GAP, Math.min(ARENA_RIGHT - boss.width - BOSS_WALL_GAP, boss.pos.x + Math.sin(t * 0.05) * 2.2));
  boss.rotation = Math.sin(t * 0.1) * 0.35;
  if (ctx.state.frame % 6 === 0) {
    const colors = ['#FF007F', '#39FF14', '#FFD700', '#00F0FF'];
    ctx.fx.spawnExplosion({ x: boss.pos.x + boss.width / 2, y: boss.pos.y + boss.height / 2 }, colors[(ctx.state.frame / 6) % 4], 2, 0, 3);
  }
  if (boss.stateTimer! <= 0) {
    boss.rotation = 0;
    boss.bossState = 'exhausted';
    boss.stateTimer = frames(90);
  }
};

const needleTick = (ctx: FrameContext, boss: Enemy) => {
  if (boss.needleTimer) boss.needleTimer--;
  if (boss.needleTimer! <= 0) {
    boss.needleCount = 0;
    boss.needleOffsets = [];
  } else if (boss.dotTimer! >= 60) {
    const damage = boss.needleCount! * NEEDLE_DAMAGE_PER_SECOND;
    boss.health -= damage;
    ctx.fx.spawnDamageNumber(boss.pos, damage);
    boss.dotTimer = 0;
    // (the drip finishing him off counts as much as the overload does: it's the needles either way)
    const p = ctx.state.player;
    if (boss.health <= 0) ctx.bossHelpers.killBoss(boss, boss.pos.x + boss.width / 2 >= p.pos.x + p.width / 2 ? 1 : -1, true, 'NEEDLES');
  }
};

export const barry: BossDef = {
  id: 'Blackout Barry',
  // (bumping into him)
  contact: { damage: 10 },
  weakness: 'NEEDLES',
  weaknessDamage: 0, // needles work through catchNeedle/needleTick instead
  spawn: { x: ARENA_RIGHT - 120 },
  update,
  catchProjectile: catchNeedle,
  needleTick,
};
