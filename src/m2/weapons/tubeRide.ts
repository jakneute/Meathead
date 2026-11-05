// On a tube ride (the endgame's water park, endgame/park1/tube.ts): the aliens up above him and out in front, him
// carried along at the chute's pace. The weapons work as they do anywhere else; a few get a tube-only hand with the
// aim (the owner's "i want all the weapons to feel at least 'okay' during this section", "give better upward tracking
// for the crossbow when on the tube ride", "except for the hammer. that one will suck"; then "the ray gun too reliably
// homes in. make sure it is as reliable as it can be consdiering the elevation changes"): aim help, never more damage.
// The stage says when he's on one (setTubeRide); the ride says its pace right now and who's out in front fighting
// (setTubeFoes: the ones queued up behind him, waiting their turn, are never sought).

import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';

let ride: (state: GameState) => { speed: number } | null = () => null;
export const setTubeRide = (f: typeof ride) => { ride = f; };
/** The ride's pace this frame (its fast stretches) and the aliens out in front fighting (tube.ts, every frame). */
let pace: number | null = null;
let front: Enemy[] = [];
export const setTubeFoes = (speed: number, foes: Enemy[]) => { pace = speed; front = foes; };
/** On a tube ride right now: the chute's pace (px a frame) and who's out in front fighting, else null. */
export const tubeRide = (state: GameState) => {
  const r = ride(state);
  return r ? { speed: pace ?? r.speed, foes: front } : null;
};

const live = (state: GameState, e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && state.enemies.includes(e);

/** The nearest live one out in front of (x, y) going `dir` (on screen, within `reach`, inside `cone` of straight
 *  ahead, up or down). On a ride: only the ones out in front fighting. */
export const tubeTarget = (state: GameState, x: number, y: number, dir: number, reach = 700, cone = 1.25): Enemy | null => {
  const r = tubeRide(state);
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of r ? r.foes : state.enemies) {
    if (!live(state, e)) continue;
    if (e.pos.x + e.width < state.camera.x || e.pos.x > state.camera.x + 800) continue;
    const dx = (e.pos.x + e.width / 2 - x) * dir, dy = e.pos.y + e.height / 2 - y;
    if (dx < 8) continue;
    const d = Math.hypot(dx, dy);
    if (d > reach || Math.abs(Math.atan2(dy, dx)) > cone) continue;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

/** Each shot's alien, once it's picked one (it keeps after it, wherever it goes, till it's dead). */
const LOCK = new WeakMap<object, Enemy>();
/** How hard each kind of shot turns (radians a frame at most) and how near (px) it's sure of it. */
const TURN = { ray: 0.24, dart: 0.12 } as const;

/** A shot sent after one of the aliens out in front fighting, wherever it is from him: up over him, down on the chute
 *  ahead, ahead on a rise or down in a dip. It picks the nearest out in front as it's fired and keeps after it; it
 *  leads it (the alien goes on at the ride's pace, the shot has to catch it up); its speed is kept, never its damage.
 *  Off a ride: nothing. */
export const steerShot = (state: GameState, p: { pos: { x: number; y: number }; vel: { x: number; y: number }; width: number; height: number }, kind: keyof typeof TURN) => {
  const r = tubeRide(state);
  if (!r) return;
  const sp = Math.hypot(p.vel.x, p.vel.y);
  if (sp < 1) return;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2;
  let e = LOCK.get(p);
  if (!e || !live(state, e)) {
    // (the nearest of the ones out in front, anywhere ahead of the shot or not long passed: never the queue behind)
    e = undefined;
    let bestD = Infinity;
    for (const f of r.foes) {
      if (!live(state, f)) continue;
      const dx = f.pos.x + f.width / 2 - x, d = Math.hypot(dx, f.pos.y + f.height / 2 - y);
      if (dx < -60 || d > 900) continue;
      if (d < bestD) { bestD = d; e = f; }
    }
    if (!e) return;
    LOCK.set(p, e);
  }
  const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2, dist = Math.hypot(ex - x, ey - y);
  // (where it'll be by the time the shot gets there: carried on at the ride's pace, a little of its own up and down)
  const t = Math.min(30, dist / sp);
  const tx = ex + r.speed * t, ty = ey + Math.max(-40, Math.min(40, (e.vel?.y ?? 0) * t));
  const want = Math.atan2(ty - y, tx - x), now = Math.atan2(p.vel.y, p.vel.x);
  // (right on it: straight in)
  if (dist < sp * 2) { p.vel.x = Math.cos(want) * sp; p.vel.y = Math.sin(want) * sp; return; }
  let d = want - now;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const rate = TURN[kind];
  const a = now + Math.max(-rate, Math.min(rate, d));
  p.vel.x = Math.cos(a) * sp; p.vel.y = Math.sin(a) * sp;
};
