// The special weapons on a sub-boss (a mid-boss, to the engine, that isn't one of the eight land bosses): each hit's
// SHARE of what it would do (the user's: "reduce all special weapons damage on [sub-]bosses to 35 percent its main
// value like the blood spray"). The land bosses (LAND_BOSSES) are left alone: each one's fight already takes only its
// own SHARE (35%) of a special weapon's hit off him, so there it's cut once already, not twice. The ray gun and his
// moves (the bulk-up's beefed-up ones too) never come through here: those go in full.

import type { Enemy } from '../../m1/types';
import { isMidBoss } from '../../m1/game/combat/midBoss';

/** The share of a special weapon's hit a sub-boss takes. */
export const SUB_BOSS_SHARE = 0.35;
/** The land bosses (their kinds): their fights take their own share. */
const LAND_BOSSES = new Set(['m2:safariartie', 'm2:donnie', 'm2:sp_queen', 'm2:steve', 'm2:fl_harry', 'm2:fr_tucker_boss', 'm2:piper', 'm2:ct_stupid_dad']);

export const landBoss = (e: Enemy) => !!e.kind && LAND_BOSSES.has(e.kind);
/** A sub-boss: a mid-boss that isn't a land boss. */
export const subBoss = (e: Enemy) => isMidBoss(e) && !landBoss(e);
/**
 * A special weapon's hit on him: on a sub-boss, its share; anybody else, all of it. Whole (the default): rounded, never
 * under 1 (a hit with a number over it); not (a trickle: a bite, a burn, a drip of puke), just the share of it.
 */
export const subBossDmg = (e: Enemy, dmg: number, whole = true) => {
  if (!subBoss(e)) return dmg;
  return whole ? Math.max(1, Math.round(dmg * SUB_BOSS_SHARE)) : dmg * SUB_BOSS_SHARE;
};
