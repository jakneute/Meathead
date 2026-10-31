// His four moves (charge, slide, uppercut, dive kick) against a boss, normalized (the owner's: "normalize charge and
// slide damage to bosses"): each counts as MOVE_VALUE, times the non-weakness share: a land boss's 25% (37.5), a
// sub-boss's 35% (52.5). With that move's armor piece (state.ts pieceFor) the share doubles: 50% (75) / 70% (105).
// Regular enemies keep their own tables (the piece adds nothing on them: extra damage is for bosses only).
// Through the amulet's rage (amulet.ts rageDamageK) every one of these is RAGE_DAMAGE_K (×1.5) on top: 56.25 a move on a
// land boss (112.5 with the piece), 78.75 on a sub-boss (157.5). Their breathers as ever: the amount, not the rate.

import type { Player } from '../../m1/types';
import { meleeMoveOf, type MeleeMove } from '../../m1/game/core/tuning';
import { moveArmored } from './state';
import { rageDamageK } from './amulet';

/** What any of the four moves counts as, before the share. */
export const MOVE_VALUE = 150;
/** The non-weakness share: a land boss's, a sub-boss's. */
export const LAND_BOSS_SHARE = 0.25, SUB_BOSS_MELEE_SHARE = 0.35;

/** A move's hit on a boss: the land bosses' (default) or a sub-boss's. */
export const bossMeleeOf = (move: MeleeMove, sub = false) =>
  MOVE_VALUE * (sub ? SUB_BOSS_MELEE_SHARE : LAND_BOSS_SHARE) * (moveArmored(move) ? 2 : 1) * rageDamageK();

/** The move he's doing now, on a land boss (each fight.ts's plain hit). A charge if somehow none's on. */
export const bossMelee = (p: Player) => bossMeleeOf(meleeMoveOf(p) ?? 'charge');
/** ...on a sub-boss (the rex, the hell demon, the White House pundits). */
export const subBossMelee = (p: Player) => bossMeleeOf(meleeMoveOf(p) ?? 'charge', true);
