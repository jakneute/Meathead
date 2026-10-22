/**
 * Limbs that bend the way limbs bend: THE two-bone helper for every Meathead 2 figure's arms and legs.
 *
 * The user, more than once: "lots of npcs you first build have their arms bent funny". Hand-picked elbows (a fixed
 * sign, "whichever is lower", a sag off the shoulder-to-hand line) fold arms backward or hyperextend them in some pose.
 * Never pick an elbow or a knee by hand: get it from here.
 *
 * The rules (side view, a figure FACING +x or -x in the coordinates you pass, y down):
 *  - An elbow flexes so the forearm folds toward the FRONT of the upper arm. Arm hanging: the elbow points back and the
 *    hand comes up in front. Arm out forward: the elbow points down, the hand comes up. Arm overhead: the elbow points
 *    forward/up, the hand drops behind the head. Hand behind the hip: the elbow points back/up. It is never bent the
 *    other way (a backward fold, a hyperextended joint).
 *  - A knee flexes the other way: the knee points FORWARD, the shin folding toward the back of the thigh.
 *  - In 2D both reduce to one fact: rotating the root-to-end line toward the joint is a fixed turn RELATIVE TO THE
 *    FACING (elbow: +angle when facing +x; knee: -angle), whatever the pose. So the only input that matters is facing.
 *
 * Facing is the way the figure faces in the coordinates you hand in. If you draw in a local frame that's mirrored by a
 * `scale(-1, 1)` (a figure drawn facing right, flipped for left), pass the LOCAL facing (usually 1), not the world one.
 *
 * Front-on / 3/4 figures (facing the camera): use `elbowFront` / `kneeFront`: the joint goes to the outside of the
 * body (away from its midline), the way an elbow pokes out when you raise or bend an arm facing someone.
 *
 * Reach: the end is pulled in to what the bones can reach (just short of straight, so the joint always reads) and
 * pushed out past the fold limit, so the two bones never stretch or collapse. `reachTo` gives that clamped end, to
 * draw the hand/foot where the limb actually ends.
 */

export type Facing = 1 | -1 | number;
export type P2 = [number, number];

/** How far short of dead straight a limb is held at full reach (in units), so the joint always shows a little. */
const SLACK = 0.6;

/** The end (hand, foot) brought within the bones' reach of the root: no farther than `a + b - SLACK`, no nearer than
 *  `|a - b| + 1`. */
export const reachTo = (rx: number, ry: number, ex: number, ey: number, a: number, b: number): P2 => {
  const dx = ex - rx, dy = ey - ry, d = Math.hypot(dx, dy);
  const lo = Math.abs(a - b) + 1, hi = Math.max(lo, a + b - SLACK);
  if (d < 1e-6) return [rx, ry + lo];
  const k = Math.max(lo, Math.min(hi, d)) / d;
  return [rx + dx * k, ry + dy * k];
};

/** The middle joint of a two-bone limb from (rx, ry) toward (ex, ey), bones `a` (root side) and `b`, turned `turn`
 *  (+1: clockwise on screen, i.e. +angle in y-down coords; -1: the other way) off the root-to-end line. The end is
 *  clamped to reach first. The low-level piece: prefer `elbow` / `knee`. */
export const joint2 = (rx: number, ry: number, ex: number, ey: number, a: number, b: number, turn: number): P2 => {
  const [hx, hy] = reachTo(rx, ry, ex, ey, a, b);
  const d = Math.hypot(hx - rx, hy - ry) || 1;
  const base = Math.atan2(hy - ry, hx - rx);
  const cos = Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)));
  const t = base + (turn >= 0 ? 1 : -1) * Math.acos(cos);
  return [rx + Math.cos(t) * a, ry + Math.sin(t) * a];
};

/** An elbow: shoulder (sx, sy), hand (hx, hy), upper arm `upper`, forearm `fore`, the figure facing `facing` (+1 right,
 *  -1 left, in these coordinates). The forearm always folds toward the front of the upper arm. */
export const elbow = (sx: number, sy: number, hx: number, hy: number, upper: number, fore: number, facing: Facing): P2 =>
  joint2(sx, sy, hx, hy, upper, fore, facing >= 0 ? 1 : -1);

/** A knee: hip (hx, hy), foot/ankle (fx, fy), thigh, shin, facing as for `elbow`. The knee always points forward. */
export const knee = (hx: number, hy: number, fx: number, fy: number, thigh: number, shin: number, facing: Facing): P2 =>
  joint2(hx, hy, fx, fy, thigh, shin, facing >= 0 ? -1 : 1);

/** A front-on figure's elbow: out to the side of the body (`outward` +1: this arm is on the figure's screen-right
 *  side, -1: screen-left). Raised or bent, the elbow pokes outward, never in across the chest. */
export const elbowFront = (sx: number, sy: number, hx: number, hy: number, upper: number, fore: number, outward: number): P2 => {
  const p = joint2(sx, sy, hx, hy, upper, fore, 1), q = joint2(sx, sy, hx, hy, upper, fore, -1);
  return (p[0] - q[0]) * outward >= 0 ? p : q;
};

/** A front-on figure's knee: out to the side a touch (a squat's knees spread, never knock in). */
export const kneeFront = elbowFront;

/** Object-point versions ({x, y}) for figures written that way. */
export interface XY { x: number; y: number }
export const elbowXY = (s: XY, h: XY, upper: number, fore: number, facing: Facing): XY => {
  const [x, y] = elbow(s.x, s.y, h.x, h.y, upper, fore, facing); return { x, y };
};
export const kneeXY = (hip: XY, foot: XY, thigh: number, shin: number, facing: Facing): XY => {
  const [x, y] = knee(hip.x, hip.y, foot.x, foot.y, thigh, shin, facing); return { x, y };
};
export const reachXY = (r: XY, e: XY, a: number, b: number): XY => {
  const [x, y] = reachTo(r.x, r.y, e.x, e.y, a, b); return { x, y };
};

/** Bone lengths for a figure whose limbs are drawn with a stretchy length (the root-to-end distance decides it): both
 *  bones `max(min, d / 2 * give)`, so a near hand bends the joint out instead of folding the limb into a stick. Feed
 *  the result to `elbow` / `knee` as both lengths. */
export const halfBone = (rx: number, ry: number, ex: number, ey: number, min: number, give = 1.04) =>
  Math.max(min, (Math.hypot(ex - rx, ey - ry) / 2) * give);
