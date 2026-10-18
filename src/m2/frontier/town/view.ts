// Sawdust Gulch's camera, pulled back (the playtest: "the general size of everything should be larger here. the town
// seems tiny so far": the town was built bigger, and the camera pulled back to take it in, as the train's is): the world
// drawn at the town's zoom about the middle of the screen (index.ts), 0.8 most of the way, further back (0.72) in the
// saloon, so its whole room is on screen for the brawl. Eased, never snapped. What's on screen is the zoomed view (the
// whole view is the screen for the rules: everybody in it is on screen).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { townOf } from './state';
import { inSaloon } from './layout';

export const ZOOM = 0.8, SALOON_ZOOM = 0.72;

/** A frame of the zoom: toward the saloon's while he's in it (or its brawl's on), the town's otherwise. */
export const updateZoom = (state: GameState) => {
  const tw = townOf(state), p = state.player;
  const want = tw.saloon.state === 'on' || inSaloon(p.pos.x + p.width / 2, p.pos.y + p.height) ? SALOON_ZOOM : ZOOM;
  tw.zoom += Math.max(-0.004, Math.min(0.004, want - tw.zoom));
};
/** The zoom right now. */
export const zoomOf = (state: GameState) => townOf(state).zoom;

/** What of the world's on screen (as last drawn; the camera's box widened by the zoom, till then). */
export const viewOf = (state: GameState) => {
  if (state.view) return state.view;
  const z = zoomOf(state), w = CANVAS_WIDTH / z, h = CANVAS_HEIGHT / z;
  return { x: state.camera.x + CANVAS_WIDTH / 2 - w / 2, y: state.camera.y + CANVAS_HEIGHT / 2 - h / 2, w, h };
};
/** Is any of a..b on screen (with a margin)? */
export const onScreen = (state: GameState, a: number, b: number, m = 60) => { const v = viewOf(state); return b > v.x - m && a < v.x + v.w + m; };
/** How far the view reaches past the camera's own 800 on each side (the camera's limits keep the view in the section). */
export const spill = (state: GameState) => (CANVAS_WIDTH / zoomOf(state) - CANVAS_WIDTH) / 2;
