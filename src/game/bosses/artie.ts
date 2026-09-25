// Artie Avalanche: hops around on low gravity, lobs big ice blocks, and
// leaps to the far side of the room whenever the flamethrower gets him.
// Every jump shakes icicles loose from the ceiling (more as he gets hurt), and
// they drop one after another. Burning him brings them down early, but the
// flamethrower can melt them too.

import { Enemy, Icicle, Rect } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, BULLET_DAMAGE, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y } from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, ARENA_MID, CEILING_Y, FLOOR_Y, dirTo, enemyProjectile, hurtPlayer } from './shared';

const ICE_BLOCK_SIZE = 60;
const ICE_BLOCK_SPEED = 11;
const SHOT_COOLDOWN = 60;
const STUCK_FRAMES = 175;       // standing still this long forces a new move
const MUST_MOVE_FRAMES = 120;   // past this he won't pick the ice block
const CHARGE_SPEED = 7.5;

const ICICLES_AT_FULL_HP = 2;   // per jump; ramps up as he loses health...
const ICICLES_AT_ZERO_HP = 6;   // ...to this many
const MAX_ICICLES = 10;         // on the ceiling / in the air at once
const ICICLE_WARNING = 45;      // frames the first one hangs before dropping
const ICICLE_STAGGER = 14;      // then one after another
const ICICLE_RUSHED = 8;        // burned: they come down almost at once...
const ICICLE_RUSHED_STAGGER = 5;
const ICICLE_MIN_GAP = 70;
const ICICLE_WIDTH = 24;
const ICICLE_GRAVITY = 0.55;
const ICICLE_MAX_SPEED = 14;
const ICICLE_DAMAGE = 10;

const update = (ctx: FrameContext, boss: Enemy) => {
  updateIcicles(ctx);
  if (boss.shootTimer > 0) boss.shootTimer--;
  if (boss.isGroundedBoss && Math.abs(boss.vel.x) < 0.5) boss.sideTimer = (boss.sideTimer || 0) + 1;
  else boss.sideTimer = 0;

  if ((boss.stateTimer! <= 0 || (boss.sideTimer || 0) > STUCK_FRAMES) && boss.isGroundedBoss) chooseMove(ctx, boss);

  // Sometimes throws a block at the top of a jump
  if (boss.bossState === 'jumping' && !boss.isGroundedBoss && boss.shootTimer <= 0) {
    if (Math.abs(boss.vel.y) < 2 && boss.stateTimer! > 20 && Math.random() < 0.08) {
      throwIceBlock(ctx, boss, 'ice-big-air');
      boss.shootTimer = SHOT_COOLDOWN;
      boss.stateTimer = 50;
    }
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

/** Jump toward Meathead, throw an ice block, or charge. */
const chooseMove = (ctx: FrameContext, boss: Enemy) => {
  const { player } = ctx.state;
  const r = Math.random();
  const mustMove = (boss.sideTimer || 0) > MUST_MOVE_FRAMES;
  if (r < 0.35 || (mustMove && r < 0.6)) {
    boss.vel.y = -13 - Math.random() * 3;
    boss.vel.x = (player.pos.x < boss.pos.x ? -1 : 1) * (4 + Math.random() * 2);
    boss.stateTimer = 70;
    boss.bossState = 'jumping';
    boss.sideTimer = 0;
    shakeIciclesLoose(ctx, boss, false);
  } else if (r < 0.70 && boss.shootTimer <= 0 && !mustMove) {
    throwIceBlock(ctx, boss, 'ice-big');
    boss.shootTimer = SHOT_COOLDOWN;
    boss.stateTimer = 80;
    boss.bossState = 'attacking';
  } else {
    boss.vel.x = dirTo(boss, player) * CHARGE_SPEED;
    boss.stateTimer = 65;
    boss.bossState = 'attacking';
    boss.sideTimer = 0;
  }
};

const throwIceBlock = (ctx: FrameContext, boss: Enemy, id: string) => {
  const dir = ctx.state.player.pos.x < boss.pos.x + boss.width / 2 ? -1 : 1;
  const x = dir === 1 ? boss.pos.x + boss.width + 5 : boss.pos.x - ICE_BLOCK_SIZE - 5;
  ctx.bossHelpers.addProjectile(enemyProjectile(`${id}-${Date.now()}`, x, boss.pos.y + 10, dir * ICE_BLOCK_SPEED, 0,
    ICE_BLOCK_SIZE, ICE_BLOCK_SIZE, BULLET_DAMAGE, { isIce: true }));
};

/**
 * Weakness: the flamethrower sends him leaping to the opposite side of the
 * arena, and the jolt brings the icicles down early.
 */
const leapAway = (ctx: FrameContext, boss: Enemy) => {
  const targetX = boss.pos.x < ARENA_MID - 40 ? ARENA_RIGHT - 110 : ARENA_LEFT + 10;
  boss.vel.y = -22;
  boss.vel.x = (targetX - boss.pos.x) / 50;
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
  shakeIciclesLoose(ctx, boss, true);
};

// ---------------------------------------------------------------------------
// Icicles
// ---------------------------------------------------------------------------

/**
 * A jump shakes a row of icicles loose: more the more he's hurt, the first one
 * over Meathead's head. `rushed` (he's been burned) drops them, and any still
 * hanging, almost at once.
 */
const shakeIciclesLoose = (ctx: FrameContext, boss: Enemy, rushed: boolean) => {
  const { state } = ctx;
  const missing = Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));
  const count = Math.round(ICICLES_AT_FULL_HP + (ICICLES_AT_ZERO_HP - ICICLES_AT_FULL_HP) * missing);
  const minX = ARENA_LEFT + 30, maxX = ARENA_RIGHT - 30;

  if (rushed) {
    state.icicles.filter(i => i.fallIn > 0).forEach((i, k) => { i.fallIn = Math.min(i.fallIn, ICICLE_RUSHED + k * ICICLE_RUSHED_STAGGER); });
  }
  const hanging = state.icicles.length;
  for (let n = 0; n < count && hanging + n < MAX_ICICLES; n++) {
    let x = Math.max(minX, Math.min(maxX, state.player.pos.x + state.player.width / 2));
    if (n > 0) {
      for (let attempt = 0; attempt < 12; attempt++) {
        x = minX + Math.random() * (maxX - minX);
        if (state.icicles.every(i => Math.abs(i.x - x) >= ICICLE_MIN_GAP)) break;
      }
    }
    const delay = rushed ? ICICLE_RUSHED + n * ICICLE_RUSHED_STAGGER : ICICLE_WARNING + n * ICICLE_STAGGER;
    state.icicles.push({ x, y: CEILING_Y, length: 52 + Math.random() * 18, vy: 0, fallIn: delay, age: 0 });
  }
};

export const icicleBounds = (i: Icicle): Rect => ({ x: i.x - ICICLE_WIDTH / 2, y: i.y, w: ICICLE_WIDTH, h: i.length });

/** Hanging icicles count down and drop; falling ones hurt Meathead or shatter on the floor. */
const updateIcicles = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const { player } = state;
  const hurtbox = { x: player.pos.x, y: player.pos.y + (player.isDucking ? 28 : 0), w: player.width, h: player.height - (player.isDucking ? 28 : 0) };
  const shatter = (i: Icicle) => {
    fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#E0FFFF', 10, 0, 8);
    fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#FFFFFF', 6, 0, 5);
    fx.playGunSound('ice');
  };
  state.icicles = state.icicles.filter(i => {
    i.age++;
    if (i.fallIn > 0) {
      if (--i.fallIn === 0) i.fallIn = -1;
      return true;
    }
    i.vy = Math.min(ICICLE_MAX_SPEED, i.vy + ICICLE_GRAVITY);
    i.y += i.vy;
    const b = icicleBounds(i);
    if (b.x < hurtbox.x + hurtbox.w && b.x + b.w > hurtbox.x && b.y < hurtbox.y + hurtbox.h && b.y + b.h > hurtbox.y) {
      if (player.invincibilityTimer <= 0) {
        hurtPlayer(ctx, ICICLE_DAMAGE, 'ice', { x: (player.pos.x + player.width / 2 < i.x ? -1 : 1) * PLAYER_PUSHBACK_VEL_X * 0.6, y: PLAYER_PUSHBACK_VEL_Y });
      }
      shatter(i);
      return false;
    }
    if (i.y + i.length >= FLOOR_Y) { shatter(i); return false; }
    return true;
  });
};

/** The flamethrower melts an icicle (hanging or falling). */
export const meltIcicle = (ctx: FrameContext, index: number) => {
  const i = ctx.state.icicles[index];
  ctx.state.icicles.splice(index, 1);
  ctx.fx.spawnSteamExplosionParticles({ x: i.x, y: i.y + i.length / 2 }, 10);
  ctx.fx.spawnExplosion({ x: i.x, y: i.y + i.length }, '#7FDBFF', 5, 0, 3);
  ctx.fx.playGunSound('ignite');
};

export const artie: BossDef = {
  id: 'Artie Avalanche',
  weakness: 'FLAMETHROWER',
  spawn: { x: 7700 },
  slipperyFloor: true,
  update,
  physics: { gravity: () => 0.5 },
  onWeaknessHit: leapAway,
};
