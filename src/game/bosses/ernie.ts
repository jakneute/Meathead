// Ernie Earthquake: big slow jumps toward Meathead that send boulders rolling,
// and every landing shakes the room. Ice knocks him out of the air.

import { Enemy, Projectile } from '../../types';
import { BULLET_DAMAGE, BOULDER_SPEED, ERNIE_STOMP_VIBRATION_DURATION } from '../../constants';
import type { FrameContext } from '../context';
import { BossDef, dirTo, enemyProjectile } from './shared';

const JUMP_INTERVAL = 180;
const KNOCKDOWN_FRAMES = 90;
const LANDING_SHAKE = 30;
const BOULDER_SIZE = 48;

const update = (ctx: FrameContext, boss: Enemy) => {
  if (boss.bossState === 'stunned_drop') {
    // Back on his feet once he's hit the ground and recovered
    if (boss.isGroundedBoss && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = 40; boss.rotation = 0; }
  } else if (boss.stateTimer! <= 0) {
    boss.vel.y = -12;
    boss.vel.x = (ctx.state.player.pos.x - boss.pos.x) * 0.03;
    boss.stateTimer = JUMP_INTERVAL;
    rollBoulder(ctx, boss, dirTo(boss, ctx.state.player), 'b-ernie-jump');
  }
};

const rollBoulder = (ctx: FrameContext, boss: Enemy, dir: number, id: string) => {
  ctx.bossHelpers.addProjectile(enemyProjectile(`${id}-${Date.now()}`, boss.pos.x + boss.width / 2, boss.pos.y + 20,
    dir * (BOULDER_SPEED + 1), 0, BOULDER_SIZE, BOULDER_SIZE, BULLET_DAMAGE, { isBoulder: true }));
};

/** Every landing shakes the room (and stuns you if you're on the ground). */
const onLand = (ctx: FrameContext, boss: Enemy, dirToPlayer: number, surface: 'block' | 'floor') => {
  ctx.bossHelpers.setScreenShake(LANDING_SHAKE);
  ctx.bossHelpers.setErnieVibration(ERNIE_STOMP_VIBRATION_DURATION);
  if (surface === 'floor') rollBoulder(ctx, boss, dirToPlayer, 'b-ernie-land');
};

/** Weakness: ice knocks him out of the air. */
const knockDown = (ctx: FrameContext, boss: Enemy, p?: Partial<Projectile>) => {
  if (!p?.isIce || boss.isGroundedBoss) return;
  boss.bossState = 'stunned_drop';
  boss.stateTimer = KNOCKDOWN_FRAMES;
  boss.vel.y = 15;
  boss.rotation = Math.PI / 2;
  if (p.pos) ctx.fx.spawnGlassShatter(p.pos);
};

export const ernie: BossDef = {
  id: 'Ernie Earthquake',
  weakness: 'SHOTGUN',
  spawn: { x: 7700 },
  update,
  // Floaty on the way up, heavy on the way down
  physics: { gravity: boss => (boss.isGroundedBoss ? 1 : 0.5), onLand },
  onWeaknessHit: knockDown,
};
