// Artie Avalanche: hops around on low gravity, lobs big ice blocks, and
// leaps to the far side of the room whenever the flamethrower gets him.

import { Enemy } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, BULLET_DAMAGE } from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, ARENA_MID, dirTo, enemyProjectile } from './shared';

const ICE_BLOCK_SIZE = 60;
const ICE_BLOCK_SPEED = 11;
const SHOT_COOLDOWN = 60;
const STUCK_FRAMES = 175;       // standing still this long forces a new move
const MUST_MOVE_FRAMES = 120;   // past this he won't pick the ice block
const CHARGE_SPEED = 7.5;

const update = (ctx: FrameContext, boss: Enemy) => {
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

/** Weakness: the flamethrower sends him leaping to the opposite side of the arena. */
const leapAway = (_ctx: FrameContext, boss: Enemy) => {
  const targetX = boss.pos.x < ARENA_MID - 40 ? ARENA_RIGHT - 110 : ARENA_LEFT + 10;
  boss.vel.y = -22;
  boss.vel.x = (targetX - boss.pos.x) / 50;
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
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
