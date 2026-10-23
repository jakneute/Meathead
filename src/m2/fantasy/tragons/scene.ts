// Truelling Tragons' scene, shared by the drawing (art.ts, steel.ts, scenery.ts, far.ts): what of the world's on screen,
// the scene's one eye (the ride's own while the camera's handed over to it, the engine camera's at the station and on a
// revisit's walk, blended between), the park's ground coordinates (P: where a thing stands in the park, the ride's
// track position s at P = S0X + s; the park slides under the world by `scroll` once the trains are out and the world
// goes by), and the haze by depth.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { mix } from '../kit';
import { GY, LOCK, S0X } from './layout';
import { viewOf } from './ride';
import type { Tragons } from './state';
import type { Eye } from './track';

/** What of the world's on screen as drawn. */
export const viewBox = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
export const inView = (state: GameState, x0: number, x1: number, m = 80) => { const v = viewBox(state); return x1 > v.x - m && x0 < v.x + v.w + m; };
export const boxIn = (state: GameState, x0: number, y0: number, x1: number, y1: number, m = 60) => { const v = viewBox(state); return x1 > v.x - m && x0 < v.x + v.w + m && y1 > v.y - m && y0 < v.y + v.h + m; };

/** How far the park's slid under the world (the station going off the left as the ride gets going; back where it was
 *  on a revisit). The track's s stands at park x S0X + s. */
export const scrollOf = (t: Tragons) => (t.phase === 'done' ? 0 : Math.max(0, t.dist - LOCK));
/** The park's x P, in the world (at the play plane's depth). */
export const parkX = (t: Tragons, P: number) => P - scrollOf(t);
/** A track position's park x. */
export const parkOfS = (s: number) => S0X + s;

/** Far off: into the haze (toward the sky's blue-grey); near: a step darker. */
export const fog = (col: string, d: number) => {
  if (d === 1 || d !== d) return col;
  // (remembered per color and depth to a thousandth: the same color within a channel step, mixed once)
  const q = Math.round(d * 1000);
  let m = fogMemo.get(col);
  if (!m) { if (fogMemo.size > 4096) fogMemo.clear(); fogMemo.set(col, (m = new Map())); }
  let out = m.get(q);
  if (out === undefined) {
    if (m.size > 2048) m.clear();
    const dq = q / 1000;
    out = dq < 1 ? mix(col, '#8A9AC4', Math.min(0.55, (1 - dq) * 1.4)) : dq > 1 ? mix(col, '#000000', Math.min(0.3, (dq - 1) * 0.6)) : col;
    m.set(q, out);
  }
  return out;
};
const fogMemo = new Map<string, Map<number, string>>();

/** The scene's one eye: the ride's (the trains' middle) while the camera's the ride's, the engine camera's middle (a
 *  little under it, over the ground) at the station and on the revisit's walk; blended as the camera's handed over. */
export const sceneEye = (state: GameState, t: Tragons): Eye => {
  const v = viewOf(state), on = Math.max(0, Math.min(1, t.cam.on));
  const cx = v.cx, cy = Math.min(GY - 150, v.cy + 40);
  if (on >= 1) return t.eye;
  return { x: cx + (t.eye.x - cx) * on, y: cy + (t.eye.y - cy) * on };
};

/** A world point at depth d about an eye (x, y only). */
export const at = (e: Eye, x: number, y: number, d: number): [number, number] => [e.x + (x - e.x) * d, e.y + (y - e.y) * d];
/** The ground's y at depth d (it rises toward the eye's height going back). */
export const groundAt = (e: Eye, d: number) => e.y + (GY - e.y) * d;

/** Draws `fn` with the world's offset snapped to whole device pixels (the scale kept, as Future Land's square does:
 *  space/square/paint.ts snapPx). The lawns' and paths' dither is a checker pattern anchored to the world, and the
 *  halls and props are stamps: put down between pixels at a fractional camera, the checker was resampled to a new
 *  phase every frame and the stamps blended across two pixels, so the ground flickered like an animating checkerboard
 *  as he walked. On whole pixels a step of the camera moves the lot along unchanged. */
export const snapPx = (c: CanvasRenderingContext2D, fn: () => void) => {
  const m = c.getTransform();
  if (m.b !== 0 || m.c !== 0) { fn(); return; }
  c.save(); c.setTransform(m.a, 0, 0, m.d, Math.round(m.e), Math.round(m.f));
  try { fn(); } finally { c.restore(); }
};
