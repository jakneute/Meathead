// The train's camera, pulled back (the playtest: the cars are big now; "perhaps zoom this area out a little bit"): the
// world drawn at ZOOM about the middle of the screen (index.ts's zoom), so what's on screen is more than the camera's
// 800x600. These turn world spots into screen spots for what's drawn in screen space (the backdrop, the words), and give
// what of the world's on screen.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

export const ZOOM = 0.8;

/** What of the world's on screen (as last drawn; the camera's own box, widened by the zoom, till then). */
export const viewOf = (state: GameState) => {
  if (state.view) return state.view;
  const w = CANVAS_WIDTH / ZOOM, h = CANVAS_HEIGHT / ZOOM;
  return { x: state.camera.x + CANVAS_WIDTH / 2 - w / 2, y: state.camera.y + CANVAS_HEIGHT / 2 - h / 2, w, h };
};
/** Is any of x0..x1 on screen (with a margin)? */
export const inView = (state: GameState, x0: number, x1: number, m = 60) => { const v = viewOf(state); return x1 > v.x - m && x0 < v.x + v.w + m; };

/** A world spot on screen (the zoom about the screen's middle; the grade's tilt left out: it's small). */
export const screenX = (state: GameState, wx: number) => CANVAS_WIDTH / 2 + (wx - state.camera.x - CANVAS_WIDTH / 2) * ZOOM;
export const screenY = (state: GameState, wy: number) => CANVAS_HEIGHT / 2 + (wy - state.camera.y - CANVAS_HEIGHT / 2) * ZOOM;
