// The catch-up and Tucker's arena, laid out (world x; flat ground at GY): a dirt trail through real woods out past the
// park, into a clearing round one giant old oak with a pointed branch out of it at a man's chest height.

import { SECTIONS, GY } from '../geometry';
import { IMPALED_TILT, tuckerPoint } from '../tucker';

export const { x0, x1 } = SECTIONS.arena;
export const X = (rx: number) => x0 + rx;
export { GY };

/** The oak: its trunk's middle and half width. */
export const TREE_X = X(1700), TRUNK_W = 26;
/** Where the catch-up starts: Meathead on the kid's bike, Tucker ahead on his, coughing to a stop. */
export const MH_START = X(40), TUCK_START = X(560);
/** Where Meathead pulls up after the crash (and leaves the kid's bike, on its stand, for good). */
export const MH_PARK = TREE_X - 470;
/** The big health and ammo (the boss-door refill): between where he gets off and the body (and short of where a retry's
 *  entrance beat goes off). */
export const REFILL_X = TREE_X - 400;

// ---- Tucker on the branch: hung by it through his chest, his feet a little off the ground ('impaled' pose)
/** His feet, hung. */
export const HANG_FEET = GY - 8;
/** The branch's way from his chest to the trunk (tucker.ts's branch line, tipped with him). */
const dir = (() => { const cs = Math.cos(IMPALED_TILT), sn = Math.sin(IMPALED_TILT), dx = cs - 0.12 * sn, dy = sn + 0.12 * cs, n = Math.hypot(dx, dy); return { x: dx / n, y: dy / n }; })();
/** How far the branch runs from his chest to the trunk. */
const REACH = 46;
const ENTRY = tuckerPoint('impaled', 14, -50);
/** The branch's root on the trunk (its left face). */
export const ROOT = { x: TREE_X - TRUNK_W + 4, y: HANG_FEET + ENTRY[1] + dir.y * REACH };
/** Where it goes into his chest, hung (world). */
export const PIERCE = { x: ROOT.x - dir.x * REACH, y: ROOT.y - dir.y * REACH };
/** His feet's x, hung on it. */
export const HANG_X = PIERCE.x - ENTRY[0];
/** The branch's point, before he's on it (where his back's point ends up: through him and out). */
export const TIP = { x: PIERCE.x - dir.x * 50, y: PIERCE.y - dir.y * 50 };
/** The branch's y at world x (on its line), and its half thickness (a point at TIP, thick at the trunk). */
export const branchY = (x: number) => ROOT.y + (x - ROOT.x) * (dir.y / dir.x);
export const branchR = (x: number) => Math.max(0, Math.min(6.5, 0.3 + (x - TIP.x) * 0.1));

/** Where he lands, popped up off the branch (and runs off right from, for the axe tree). */
export const UP_X = HANG_X - 70;
/** The fake-out: how near the body he has to walk. */
export const BODY_NEAR = 130;

// ---- the arena entry (entry.ts): the axe tree past the oak, a lumberjack's axe stuck in it; Tucker runs off to it and
// taunts from just past it; Meathead chops it down onto his head with one swing
/** The axe tree (a tall pine): its trunk's middle, half width, height (ground to its top). */
export const AXE_TREE_X = TREE_X + 430, AXE_TR = 11, AXE_TREE_H = 300;
/** Where the swing cuts it (the stump's height). */
export const CUT_H = 40;
/** The trunk above the cut: its length. */
export const LOG_LEN = AXE_TREE_H - CUT_H;
/** Meathead's middle, chopping (his axe's bit bites the trunk's near face at CUT_H). */
export const MH_CHOP_X = AXE_TREE_X - 50;
/** Where Tucker stops to taunt, facing back at him, just past the tree (the side it falls): his feet. */
export const TAUNT_X = AXE_TREE_X + 92;
/** Where he stands for his fight, blind (and lies flat on a retry till he pops up again). */
export const FIGHT_X = TAUNT_X;
/** The felled trunk, lying (the butt slid off the stump on the far side): its butt's x; it's down along the ground to
 *  the right, LOG_LEN long, the bare part a low ledge (its lit top) as far as the boughs. */
export const LOG_X = AXE_TREE_X + 14, LOG_BARE = Math.round(LOG_LEN * 0.36);
/** A retry: how near before Tucker pops up again (the entrance beat). */
export const ENTRANCE_NEAR = 220;
/** The placeholder's end (past him and the felled tree): VICTORY, the walk-away. */
export const TRIGGER_X = LOG_X + LOG_LEN + 90;
/** The placeholder board for the fight (past the felled tree). */
export const BOARD_X = LOG_X + LOG_LEN + 20;

/** The bikes' colors: the kid's (his, from the bounty) and the one Tucker stole (the chase's). */
export const MH_BIKE = '#DC2626', TUCK_BIKE = '#2563EB';
