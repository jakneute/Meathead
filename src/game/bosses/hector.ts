// Hector Hurricane: leaps across the arena and spins up a hurricane that drags
// Meathead in (harder the closer he is) while poop logs fly in from the walls.
// Hurting Meathead, or being hurt, sends him leaping to the other side.

import { Enemy, Player, Projectile } from '../../types';
import {
  ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, HECTOR_PULL_STRENGTH, HECTOR_PULL_MAX, HECTOR_PULL_RANGE,
  HECTOR_PULL_EDGE, HECTOR_PULL_FAR, HECTOR_PULL_NEAR, HECTOR_PULL_FARTHEST,
} from '../../constants';
import type { FrameContext } from '../context';
import type { BossHelpers } from './shared';
import { BossDef, ARENA_MID, midX, hurtPlayer, enemyProjectile } from './shared';

const HURRICANE_FRAMES = 300;
const REST_FRAMES = 40;
/** Getting caught in the vortex itself (the visible funnel round him): a heavy hit. */
const VORTEX_DAMAGE = 22;
/** Within half a screen of him for this long, the vortex gets its grip... */
const GRIP_FRAMES = 60;
/** ...and over this many frames yanks him in far harder than he can walk. */
const YANK_RAMP = 20;
const YANK_PULL = 6.5;
/** The funnel spins up over this long when the hurricane starts. */
const SPIN_UP_FRAMES = 20;
const FUNNEL_BASE_R = 62;
const FUNNEL_TOP_R = 105;
const FUNNEL_ABOVE = 70; // how far the funnel rises over his head
const BOULDER_PULL = 1.5;
const POOP_INTERVAL = 90;
const POOP_TELEGRAPH_FRAMES = 60;
const POOP_SPEED = 12;
/** A log of it to the face at speed. */
const POOP_DAMAGE = 18;
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
  // Hang around within half a screen of him for a second and the vortex gets a grip on you
  const grip = Math.abs(gap) < HECTOR_PULL_RANGE ? (boss.vortexGrip || 0) + 1 : Math.max(0, (boss.vortexGrip || 0) - 2);
  boss.vortexGrip = grip;
  const yank = Math.max(0, Math.min(1, (grip - GRIP_FRAMES) / YANK_RAMP)) * YANK_PULL;
  state.totalPullForceX += pullDir * (getHectorPull(Math.abs(gap)) + yank);

  // Meathead's boulders get sucked in too; the poop logs ride the wind
  state.projectiles.forEach((p: Projectile) => {
    if (p.owner === 'player' && p.isBoulder) p.vel.x += (midX(boss) - midX(p) > 0 ? 1 : -1) * BOULDER_PULL;
    if (p.isPoop) p.vel.x += pullDir * HECTOR_PULL_STRENGTH;
  });

  // Warned poop logs launch from the walls
  state.bossPoopTelegraphs = state.bossPoopTelegraphs.filter(t => {
    if (--t.life > 0) return true;
    const fromLeft = t.spawnX < ARENA_MID;
    helpers.addProjectile(enemyProjectile(`poop-${Date.now()}`, t.spawnX, t.pos.y, fromLeft ? POOP_SPEED : -POOP_SPEED, 0, 45, 20, POOP_DAMAGE,
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

  // Only the vortex itself hurts: getting caught in it is a heavy hit that flings you
  // out, and he leaps to the other side to start it up again
  if (isInVortex(boss, player) && player.invincibilityTimer <= 0 && !cheats.invincible) {
    hurtPlayer(ctx, VORTEX_DAMAGE, 'wind', { x: -pullDir * 9, y: -7 });
    helpers.setScreenShake(12);
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

/** How spun-up the vortex is (0..1): it grows over the first moments of the hurricane. */
export const vortexSpin = (boss: Enemy) =>
  boss.bossState !== 'hurricane' ? 0 : Math.max(0, Math.min(1, (HURRICANE_FRAMES - (boss.stateTimer || 0)) / SPIN_UP_FRAMES));

/** The funnel's floor and top, and its radius at height y (narrow at the floor, flaring out above him). */
export const vortexShape = (boss: Enemy) => {
  const floor = boss.pos.y + boss.height;
  const top = boss.pos.y - FUNNEL_ABOVE;
  const spin = vortexSpin(boss);
  const radiusAt = (y: number) => {
    const k = Math.max(0, Math.min(1, (floor - y) / (floor - top)));
    return (FUNNEL_BASE_R + (FUNNEL_TOP_R - FUNNEL_BASE_R) * k) * spin;
  };
  return { cx: midX(boss), floor, top, radiusAt };
};

/** 0..1: how close the vortex is to yanking Meathead in (for the visuals). */
export const vortexGripLevel = (boss: Enemy) => Math.max(0, Math.min(1, (boss.vortexGrip || 0) / GRIP_FRAMES));

/** Is any of Meathead inside the visible funnel? */
const isInVortex = (boss: Enemy, player: Player) => {
  const { cx, floor, top, radiusAt } = vortexShape(boss);
  const pTop = Math.max(top, player.pos.y), pBottom = Math.min(floor, player.pos.y + player.height);
  if (pTop >= pBottom) return false;
  const r = radiusAt((pTop + pBottom) / 2) * 0.85; // a little forgiving at the wispy edge
  const nearestX = Math.max(player.pos.x, Math.min(player.pos.x + player.width, cx));
  return Math.abs(nearestX - cx) < r;
};

/** Drops whatever he's doing and leaps to the far end of the arena to start a new cycle. */
const leapToOtherSide = (boss: Enemy, helpers: BossHelpers) => {
  if (boss.bossState === 'jumping') return;
  boss.vortexGrip = 0;
  boss.bossState = 'jumping';
  boss.isGroundedBoss = false;
  boss.vel.y = -22 - Math.random() * 4;
  const targetX = boss.pos.x > ARENA_MID ? ARENA_LEFT + 60 : ARENA_RIGHT - 60;
  boss.vel.x = (targetX - boss.pos.x) * 0.035;
  helpers.clearPoopTelegraphs();
};

export const hector: BossDef = {
  id: 'Hector Hurricane',
  // (bumping into him)
  contact: { damage: 8 },
  weakness: 'BOULDER',
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can start the hurricane
  physics: { landingEndsJump: false },
  // A melee hit ends the hurricane early; hurting Meathead makes him leap away
  onMeleeHit: (_ctx, boss) => { if (boss.bossState === 'hurricane') boss.stateTimer = 0; },
  onTouchPlayer: (ctx, boss) => leapToOtherSide(boss, ctx.bossHelpers),
};
