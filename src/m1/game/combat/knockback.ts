// Weight and footing for regular enemies: how far a push sends them depends on
// how heavy they are, and how far they then slide depends on the ground under
// them (ice is slippery) and on whether they're coated in oil (slicker still).

import { Enemy, Block } from '../../types';
import { standingIndoors } from '../core/terrain';
import { boundsOf } from '../core/utils';
import { ENEMY_MASS } from '../../constants';
import { getBossDef } from '../bosses/registry';
import { KIND_STATS } from '../enemies/kinds';

/** An enemy of this mass gets pushed exactly as hard as the push says. */
const REFERENCE_MASS = 200;
/** Nothing gets launched faster than this sideways, however light. */
const MAX_PUSH_SPEED = 30;

export const getEnemyMass = (e: Enemy) => {
  if (e.type === 'boss') return ENEMY_MASS.boss;
  // (every themed enemy carries its own weight: see KIND_STATS)
  if (e.kind && KIND_STATS[e.kind]) return KIND_STATS[e.kind].mass;
  const prefix = Object.keys(ENEMY_MASS).sort((a, b) => b.length - a.length).find(k => e.id.startsWith(k));
  return prefix ? ENEMY_MASS[prefix] : 200;
};

/** Lighter enemies fly further, heavier ones barely budge (the really big ones hardly at all). */
export const massScale = (e: Enemy) => Math.max(0.15, Math.min(2, REFERENCE_MASS / getEnemyMass(e)));

/** Mass ratio for one enemy slamming into another: a heavy one bowls a light one over, not the reverse (a rat kicked
 * into a bloater bounces off him; he hardly rocks). */
export const massRatio = (from: Enemy, to: Enemy) => Math.max(0.08, Math.min(2, getEnemyMass(from) / getEnemyMass(to)));

/** Shove an enemy (a push sized for a reference-weight enemy), dazing it while it goes. */
export const pushEnemy = (e: Enemy, velX: number, velY: number, dazeFrames: number) => {
  const k = massScale(e);
  e.vel.x = Math.max(-MAX_PUSH_SPEED, Math.min(MAX_PUSH_SPEED, velX * k));
  e.vel.y = velY * Math.sqrt(k);
  e.pauseTimer = dazeFrames;
};

/**
 * How much of its speed a knocked-back enemy keeps each frame: sliding along the
 * ground, on landing, and flying through the air. Ice and oil both keep it going.
 */
export const enemyGrip = (stageId: string | null, e: Enemy, blocks: Block[] = []) => {
  const ice = !!getBossDef(stageId)?.slipperyFloor && !standingIndoors(blocks, boundsOf(e));
  const oiled = !!e.isOiled;
  return {
    slide: oiled ? (ice ? 0.985 : 0.965) : (ice ? 0.95 : 0.88),
    landing: oiled ? (ice ? 0.97 : 0.95) : (ice ? 0.88 : 0.7),
    air: oiled ? 0.985 : 0.97,
  };
};
