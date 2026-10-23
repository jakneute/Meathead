// A boss's death kept in view (the user's: "i killed the queen as it was slightly off screen. make sure if any boss
// gets killed slightly offscreen, you zoom out so you can see everything"; "this is primarily for non weakness deaths").
//
//   frameDeath   each fight's death camera hands over its view (its own zoom, or none) and what of the death has to
//                be seen (the body, the pieces, the head): if any of that's off the screen, the view's widened and
//                slid over just enough to take it all in, eased in as it starts and back out as the death hands the
//                camera back. Never further out than the built level (`room`): past that it slides over instead. A
//                fight's push-in on its subject keeps its push and slides to take it in; a normal view widens.
//   shownBy      the world a stage zoom (or none) puts on the screen (world.ts's state.view, worked out ahead).

import type { GameState } from '../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../m1/constants';

export type Zoom = { scale: number; x: number; y: number; shiftX?: number; shiftY?: number };
/** A box in the world (left, top, right, bottom). */
export interface Box { x0: number; y0: number; x1: number; y1: number }

/** A box around a point, this wide each side and this far up and down. */
export const around = (x: number, y: number, w: number, up: number, down = 0): Box => ({ x0: x - w, y0: y - up, x1: x + w, y1: y + down });
/** The box taking in both (either can be null). */
export const join = (a: Box | null, b: Box | null): Box | null =>
  !a ? b : !b ? a : { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) };
/** The box round a lot of points (pieces, bits), each padded `r`; null for none. */
export const boxOf = (pts: readonly { x: number; y: number }[], r = 20): Box | null => {
  if (!pts.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return { x0: x0 - r, y0: y0 - r, x1: x1 + r, y1: y1 + r };
};

/** The world a zoom (or none) shows (world.ts: the zoom's ignored at a scale of 1). */
export const shownBy = (cam: { x: number; y: number }, z: Zoom | null | undefined): Box => {
  if (!z || z.scale === 1) return { x0: cam.x, y0: cam.y, x1: cam.x + CANVAS_WIDTH, y1: cam.y + CANVAS_HEIGHT };
  const s = z.scale, x = z.x + (cam.x - (z.shiftX ?? 0) - z.x) / s, y = z.y + (cam.y - (z.shiftY ?? 0) - z.y) / s;
  return { x0: x, y0: y, x1: x + CANVAS_WIDTH / s, y1: y + CANVAS_HEIGHT / s };
};
/** The zoom that puts a box (the screen's shape) on the screen. (A hair off 1 if it's the screen's size: world.ts
 *  only moves the view at all at a scale that isn't 1.) */
const zoomTo = (cam: { x: number; y: number }, b: Box): Zoom => {
  let s = CANVAS_WIDTH / (b.x1 - b.x0);
  if (Math.abs(s - 1) < 1e-4) s = 0.9999;
  return { scale: s, x: b.x0, y: b.y0, shiftX: cam.x - b.x0, shiftY: cam.y - b.y0 };
};

const inside = (n: Box, v: Box) => n.x0 >= v.x0 && n.x1 <= v.x1 && n.y0 >= v.y0 && n.y1 <= v.y1;
/** lo..hi, the middle of the two if they've crossed. */
const fit = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));

/** The view (`v`) moved and widened as little as it can to take in `need`, inside `room`. */
const target = (v: Box, n: Box, room: Box): Box => {
  const A = CANVAS_HEIGHT / CANVAS_WIDTH, vw = v.x1 - v.x0;
  // (as wide as it takes, no wider than the level; never pushed in past what the fight's own view has it at)
  const cap = Math.min(room.x1 - room.x0, (room.y1 - room.y0) / A);
  const w = Math.max(vw, Math.min(cap, Math.max(n.x1 - n.x0, (n.y1 - n.y0) / A))), h = w * A;
  // (the least slide that takes it in from where the view was (about its middle, as it widens); then kept in the level)
  const cx = (v.x0 + v.x1) / 2, cy = (v.y0 + v.y1) / 2;
  let x0 = fit(cx - w / 2, n.x1 - w, n.x0), y0 = fit(cy - h / 2, n.y1 - h, n.y0);
  x0 = fit(x0, room.x0, room.x1 - w); y0 = fit(y0, room.y0, room.y1 - h);
  return { x0, y0, x1: x0 + w, y1: y0 + h };
};

interface Framer { frame: number; k: number; need: Box | null }
const FRAMERS = new WeakMap<object, Framer>();
/** How long it eases in, and back out (frames). */
const IN = 24, OUT = 40;
const sm = (u: number) => u * u * (3 - 2 * u);

/**
 * Each frame of a boss's death (from the fight's stage zoom): `view` the fight's own zoom (null: the normal camera);
 * `need` what of the death has to be on screen (null once the death's handed the camera back: it eases out over the
 * last of it); `room` the built level, as far as the view may go. `key`: the fight (its own easing; a new fight, a
 * fresh one). Padded `pad` round what's needed. The view as it was when there's nothing to bring in.
 */
export const frameDeath = (state: GameState, key: object, view: Zoom | null, need: Box | null, room: Box, pad = 28): Zoom | null => {
  let fr = FRAMERS.get(key);
  if (!fr) { fr = { frame: state.frame, k: 0, need: null }; FRAMERS.set(key, fr); }
  const cam = state.camera, v = shownBy(cam, view);
  // (padded; only as much of it as there's level to show)
  const padded = need && { x0: Math.max(room.x0, need.x0 - pad), y0: Math.max(room.y0, need.y0 - pad), x1: Math.min(room.x1, need.x1 + pad), y1: Math.min(room.y1, need.y1 + pad) };
  // (stepped once a frame however often it's asked: the lighting and the HUD's glow ask too; held while paused)
  if (fr.frame !== state.frame) {
    const steps = Math.max(1, Math.min(4, state.frame - fr.frame));
    fr.frame = state.frame;
    const want = !!padded && !inside(padded, v);
    for (let i = 0; i < steps; i++) fr.k = want ? Math.min(1, fr.k + 1 / IN) : Math.max(0, fr.k - 1 / OUT);
    if (padded) fr.need = padded;
  }
  const n = padded ?? fr.need;
  if (fr.k <= 0 || !n) return view;
  const t = target(v, n, room), e = sm(fr.k);
  const b = { x0: v.x0 + (t.x0 - v.x0) * e, y0: v.y0 + (t.y0 - v.y0) * e, x1: v.x1 + (t.x1 - v.x1) * e, y1: v.y1 + (t.y1 - v.y1) * e };
  // (slid off him with it: nothing out there can touch him (it's a cutscene, but to be sure))
  const p = state.player;
  if (!inside({ x0: p.pos.x, y0: p.pos.y, x1: p.pos.x + p.width, y1: p.pos.y + p.height }, b)) p.noContactUntil = Math.max(p.noContactUntil ?? 0, state.frame + 2);
  return zoomTo(cam, b);
};
