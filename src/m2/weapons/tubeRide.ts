// On a tube ride (the endgame's water park, endgame/park1/tube.ts): the aliens up above him and out in front, him
// carried along at the chute's pace. The weapons work as they do anywhere else; a few get a tube-only hand with the
// aim (the owner's "i want all the weapons to feel at least 'okay' during this section", "give better upward tracking
// for the crossbow when on the tube ride", "except for the hammer. that one will suck"): aim help, never more damage.
// The stage says when he's on one (setTubeRide).

import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';

let ride: (state: GameState) => { speed: number } | null = () => null;
export const setTubeRide = (f: typeof ride) => { ride = f; };
/** On a tube ride right now: the chute's pace (px a frame), else null. */
export const tubeRide = (state: GameState) => ride(state);

/** The nearest live one out in front of (x, y) going `dir` (on screen, within `reach`, inside `cone` of straight
 *  ahead, up or down). */
export const tubeTarget = (state: GameState, x: number, y: number, dir: number, reach = 700, cone = 1.25): Enemy | null => {
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent) continue;
    if (e.pos.x + e.width < state.camera.x || e.pos.x > state.camera.x + 800) continue;
    const dx = (e.pos.x + e.width / 2 - x) * dir, dy = e.pos.y + e.height / 2 - y;
    if (dx < 8) continue;
    const d = Math.hypot(dx, dy);
    if (d > reach || Math.abs(Math.atan2(dy, dx)) > cone) continue;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

/** A shot bent a little toward the nearest one out in front of it, `rate` radians a frame at most, its speed kept. */
export const steerShot = (state: GameState, p: { pos: { x: number; y: number }; vel: { x: number; y: number }; width: number; height: number }, rate: number) => {
  const sp = Math.hypot(p.vel.x, p.vel.y);
  if (sp < 1) return;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2, dir = Math.sign(p.vel.x) || 1;
  const e = tubeTarget(state, x, y, dir, 700, 1.3);
  if (!e) return;
  const want = Math.atan2(e.pos.y + e.height / 2 - y, e.pos.x + e.width / 2 - x), now = Math.atan2(p.vel.y, p.vel.x);
  let d = want - now;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const a = now + Math.max(-rate, Math.min(rate, d));
  p.vel.x = Math.cos(a) * sp; p.vel.y = Math.sin(a) * sp;
};
