// The train's camera, pulled back (the playtest: the cars are big now; "perhaps zoom this area out a little bit"): the
// world drawn at ZOOM about the middle of the screen (index.ts's zoom), so what's on screen is more than the camera's
// 800x600. These turn world spots into screen spots for what's drawn in screen space (the backdrop, the words), and give
// what of the world's on screen.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { trainOf } from './state';
import { DECK } from './layout';

export const ZOOM = 0.8;

/** What of the world's on screen (as last drawn; the camera's own box, widened by the zoom, till then). */
export const viewOf = (state: GameState) => {
  if (state.view) return state.view;
  const w = CANVAS_WIDTH / ZOOM, h = CANVAS_HEIGHT / ZOOM;
  return { x: state.camera.x + CANVAS_WIDTH / 2 - w / 2, y: state.camera.y + CANVAS_HEIGHT / 2 - h / 2, w, h };
};
/** Is any of x0..x1 on screen (with a margin)? */
export const inView = (state: GameState, x0: number, x1: number, m = 60) => { const v = viewOf(state); return x1 > v.x - m && x0 < v.x + v.w + m; };

/**
 * What of the world's on screen AS DRAWN (for drawing only: what to fill, what to cull): the zoomed view turned by the
 * grades' tilt (index.ts worldTilt: the world drawn turned by -tilt about the camera's middle at the deck), its bounding
 * box in world space. Level, it's viewOf's; on a grade the screen's corners reach further out and up and down than the
 * zoomed box does (at the steepest, ~50 px each way), so anything filled or culled to the plain box shows gaps (or pops)
 * in the corners. The rules (what's on screen for the cast, what's set off where) keep viewOf.
 */
export const drawnView = (state: GameState) => {
  const v = viewOf(state), t = trainOf(state).tilt;
  if (Math.abs(t) <= 0.0005) return v;
  const px = state.camera.x + CANVAS_WIDTH / 2, py = DECK, cs = Math.cos(t), sn = Math.sin(t);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [sx, sy] of [[v.x, v.y], [v.x + v.w, v.y], [v.x, v.y + v.h], [v.x + v.w, v.y + v.h]]) {
    const dx = sx - px, dy = sy - py, wx = px + dx * cs - dy * sn, wy = py + dx * sn + dy * cs;
    x0 = Math.min(x0, wx); x1 = Math.max(x1, wx); y0 = Math.min(y0, wy); y1 = Math.max(y1, wy);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};
/** Is any of x0..x1 on screen as drawn (turned with the grade; with a margin)? For drawing. */
export const inDrawn = (state: GameState, x0: number, x1: number, m = 60) => { const v = drawnView(state); return x1 > v.x - m && x0 < v.x + v.w + m; };

/** A world spot on screen (the zoom about the screen's middle; the grade's tilt left out: it's small). */
export const screenX = (state: GameState, wx: number) => CANVAS_WIDTH / 2 + (wx - state.camera.x - CANVAS_WIDTH / 2) * ZOOM;
export const screenY = (state: GameState, wy: number) => CANVAS_HEIGHT / 2 + (wy - state.camera.y - CANVAS_HEIGHT / 2) * ZOOM;
