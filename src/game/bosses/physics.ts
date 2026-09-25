// Jump/gravity physics shared by the bosses that hop around the arena
// (Artie, Victor, Ernie, Hector). The rest move themselves.

import { Enemy } from '../../types';
import { GRAVITY, BOSS_DOOR_X, STAGE_WIDTH } from '../../constants';
import type { FrameContext } from '../context';
import { BossPhysics, CEILING_Y, bossFloorY, dirTo } from './shared';

const KNOCKDOWN_GRAVITY = 1.5;
const KNOCKDOWN_RECOVERY = 30; // max frames left on the floor after a knockdown lands

export const applyBossPhysics = (ctx: FrameContext, boss: Enemy, physics: BossPhysics) => {
  if (boss.bossState === 'stunned_drop') { fallAfterKnockdown(boss); return; }
  const { state } = ctx;
  const dirToPlayer = dirTo(boss, state.player);
  const endJump = () => { if (boss.bossState === 'jumping' && physics.landingEndsJump !== false) boss.bossState = 'idle'; };

  boss.vel.y += GRAVITY * (physics.gravity?.(boss) ?? 1);
  boss.pos.x += boss.vel.x;
  const prevY = boss.pos.y;
  boss.pos.y += boss.vel.y;
  boss.pos.x = Math.max(BOSS_DOOR_X + 10, Math.min(STAGE_WIDTH - boss.width - 10, boss.pos.x));
  if (boss.pos.y < CEILING_Y) { boss.pos.y = CEILING_Y; boss.vel.y = 0; }

  // Land on terrain
  if (boss.vel.y >= 0) {
    for (const b of state.blocks) {
      if (b.type !== 'platform' && b.type !== 'ground') continue;
      const overlapsX = boss.pos.x < b.x + b.w && boss.pos.x + boss.width > b.x;
      if (!overlapsX || prevY + boss.height > b.y || boss.pos.y + boss.height < b.y) continue;
      boss.pos.y = b.y - boss.height;
      if (prevY < b.y - boss.height) physics.onLand?.(ctx, boss, dirToPlayer, 'block');
      boss.vel.y = 0;
      boss.vel.x = 0;
      boss.isGroundedBoss = true;
      endJump();
      return;
    }
  }

  // Fallback: the arena floor line
  const floorY = bossFloorY(boss);
  if (boss.pos.y <= floorY) { boss.isGroundedBoss = false; return; }
  boss.pos.y = floorY;
  if (prevY < floorY && boss.vel.y > 0) physics.onLand?.(ctx, boss, dirToPlayer, 'floor');
  boss.vel.y = 0;
  boss.vel.x = 0;
  boss.isGroundedBoss = true;
  endJump();
};

/** Knocked out of the air: drops hard and lies there briefly. */
const fallAfterKnockdown = (boss: Enemy) => {
  boss.vel.y += GRAVITY * KNOCKDOWN_GRAVITY;
  boss.pos.y += boss.vel.y;
  const floorY = bossFloorY(boss);
  if (boss.pos.y > floorY) {
    boss.pos.y = floorY;
    boss.vel.y = 0;
    boss.isGroundedBoss = true;
    if (boss.stateTimer! > KNOCKDOWN_RECOVERY) boss.stateTimer = KNOCKDOWN_RECOVERY;
  }
};
