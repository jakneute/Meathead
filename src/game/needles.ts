// Where darts stick into enemies, so they can be drawn poking out of them.

import { Enemy, Projectile } from '../types';

export interface NeedleStickSpec {
  /** Minimum distance from the entry edge. */
  minDepth: number;
  /** Maximum penetration as a fraction of body width. */
  maxDepthPct: number;
  minY: number;
  bottomMargin: number;
  minSpacing: number;
  nudge: number;
}

export const BOSS_NEEDLE: NeedleStickSpec = { minDepth: 6, maxDepthPct: 0.4, minY: 10, bottomMargin: 10, minSpacing: 12, nudge: 10 };
export const ENEMY_NEEDLE: NeedleStickSpec = { minDepth: 4, maxDepthPct: 0.45, minY: 4, bottomMargin: 5, minSpacing: 10, nudge: 8 };

/** Records where a dart stuck into an enemy so it can be drawn poking out of them. */
export const stickNeedle = (enemy: Enemy, p: Projectile, spec: NeedleStickSpec) => {
  if (!enemy.needleOffsets) enemy.needleOffsets = [];
  const clampDepth = (d: number) => Math.max(spec.minDepth, Math.min(enemy.width * spec.maxDepthPct, d));
  const clampY = (y: number) => Math.max(spec.minY, Math.min(enemy.height - spec.bottomMargin, y));
  const hitX = p.vel.x >= 0
    ? clampDepth((p.pos.x + p.width) - enemy.pos.x)
    : enemy.width - clampDepth((enemy.pos.x + enemy.width) - p.pos.x);
  let hitY = clampY((p.pos.y + p.height / 2) - enemy.pos.y);
  // Spread needles out so they don't stack on top of each other
  for (let attempt = 0; attempt < 5; attempt++) {
    if (!enemy.needleOffsets.some(o => Math.hypot(o.x - hitX, o.y - hitY) < spec.minSpacing)) break;
    hitY = clampY(hitY + ((attempt % 2 === 0) ? spec.nudge : -spec.nudge));
  }
  const rot = Math.atan2(p.vel.y, p.vel.x) + (Math.random() - 0.5) * 0.25;
  enemy.needleOffsets.push({ x: hitX, y: hitY, rot });
};
