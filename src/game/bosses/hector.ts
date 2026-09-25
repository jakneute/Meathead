// Hector Hurricane: leaps across the arena and spins up a hurricane that drags
// Meathead in (harder the closer he is) while poop logs fly in from the walls.
// Hurting Meathead, or being hurt, sends him leaping to the other side.

import { Enemy, Projectile } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, HECTOR_PULL_STRENGTH, HECTOR_PULL_MAX, HECTOR_PULL_RANGE,
  HECTOR_PULL_EDGE, HECTOR_PULL_FAR, HECTOR_PULL_NEAR, HECTOR_PULL_FARTHEST,
} from '../../constants';
import type { FrameContext } from '../context';
import type { BossHelpers } from './shared';
import { BossDef, ARENA_MID, midX, hurtPlayer, enemyProjectile } from './shared';

const HURRICANE_FRAMES = 300;
const REST_FRAMES = 40;
const WIND_DAMAGE = 3;
const WIND_DAMAGE_RANGE = 300;
const BOULDER_PULL = 1.5;
const POOP_INTERVAL = 90;
const POOP_TELEGRAPH_FRAMES = 60;
const POOP_SPEED = 12;
const POOP_HEIGHTS = [510, 498, 440];

const update = (ctx: FrameContext, boss: Enemy) => {
  if (boss.bossState === 'hurricane') updateHurricane(ctx, boss);
  else if (boss.bossState === 'jumping') {
    if (boss.isGroundedBoss) { boss.bossState = 'hurricane'; boss.stateTimer = HURRICANE_FRAMES; boss.vel.x = 0; }
  } else if (boss.stateTimer! <= 0) {
    leapToOtherSide(boss, ctx.bossHelpers);
  }
};

const updateHurricane = (ctx: FrameContext, boss: Enemy) => {
  const { state, cheats } = ctx;
  const { player } = state;
  const helpers = ctx.bossHelpers;
  const gap = midX(boss) - midX(player);
  const pullDir = gap > 0 ? 1 : -1;
  state.totalPullForceX += pullDir * getHectorPull(Math.abs(gap));

  // Meathead's boulders get sucked in too; the poop logs ride the wind
  state.projectiles.forEach((p: Projectile) => {
    if (p.owner === 'player' && p.isBoulder) p.vel.x += (midX(boss) - midX(p) > 0 ? 1 : -1) * BOULDER_PULL;
    if (p.isPoop) p.vel.x += pullDir * HECTOR_PULL_STRENGTH;
  });

  // Warned poop logs launch from the walls
  state.bossPoopTelegraphs = state.bossPoopTelegraphs.filter(t => {
    if (--t.life > 0) return true;
    const fromLeft = t.spawnX < ARENA_MID;
    helpers.addProjectile(enemyProjectile(`poop-${Date.now()}`, t.spawnX, t.pos.y, fromLeft ? POOP_SPEED : -POOP_SPEED, 0, 45, 20, 12,
      { isPoop: true, spawnX: t.spawnX }));
    return false;
  });
  if (state.frame % POOP_INTERVAL === 0) {
    // From the wall behind Meathead, so they fly at his back
    const spawnX = pullDir > 0 ? BOSS_DOOR_X + 60 : ARENA_RIGHT - 20;
    const r = Math.random();
    const y = r < 0.33 ? POOP_HEIGHTS[0] : r < 0.66 ? POOP_HEIGHTS[1] : POOP_HEIGHTS[2];
    helpers.addPoopTelegraph({ pos: { x: spawnX, y }, life: POOP_TELEGRAPH_FRAMES, spawnX });
  }

  // Getting too close hurts, and he resets his cycle
  if (Math.abs(gap) < WIND_DAMAGE_RANGE && player.invincibilityTimer <= 0 && !cheats.invincible) {
    hurtPlayer(ctx, WIND_DAMAGE, 'wind');
    leapToOtherSide(boss, helpers);
    return;
  }
  if (boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; helpers.clearPoopTelegraphs(); }
};

/**
 * How hard the hurricane drags Meathead at a given distance. Always some pull,
 * growing the closer you get: walkable past half a screen, stronger than
 * walking inside it, strongest point-blank.
 */
export const getHectorPull = (distance: number) => {
  const innerEdge = HECTOR_PULL_RANGE - HECTOR_PULL_EDGE;
  if (distance >= HECTOR_PULL_RANGE) {
    const farthest = ARENA_RIGHT - ARENA_LEFT;
    const k = Math.min(1, (distance - HECTOR_PULL_RANGE) / (farthest - HECTOR_PULL_RANGE));
    return HECTOR_PULL_FAR + (HECTOR_PULL_FARTHEST - HECTOR_PULL_FAR) * k;
  }
  if (distance > innerEdge) {
    const k = (HECTOR_PULL_RANGE - distance) / HECTOR_PULL_EDGE;
    return HECTOR_PULL_FAR + (HECTOR_PULL_NEAR - HECTOR_PULL_FAR) * k;
  }
  return HECTOR_PULL_NEAR + (HECTOR_PULL_MAX - HECTOR_PULL_NEAR) * (1 - distance / innerEdge);
};

/** Drops whatever he's doing and leaps to the far end of the arena to start a new cycle. */
const leapToOtherSide = (boss: Enemy, helpers: BossHelpers) => {
  if (boss.bossState === 'jumping') return;
  boss.bossState = 'jumping';
  boss.isGroundedBoss = false;
  boss.vel.y = -22 - Math.random() * 4;
  const targetX = boss.pos.x > ARENA_MID ? ARENA_LEFT + 60 : ARENA_RIGHT - 60;
  boss.vel.x = (targetX - boss.pos.x) * 0.035;
  helpers.clearPoopTelegraphs();
};

export const hector: BossDef = {
  id: 'Hector Hurricane',
  weakness: 'BOULDER',
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can start the hurricane
  physics: { landingEndsJump: false },
  // A melee hit ends the hurricane early; hurting Meathead makes him leap away
  onMeleeHit: (_ctx, boss) => { if (boss.bossState === 'hurricane') boss.stateTimer = 0; },
  onTouchPlayer: (ctx, boss) => leapToOtherSide(boss, ctx.bossHelpers),
};
