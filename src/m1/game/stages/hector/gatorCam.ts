// Knock one of them into the water and a gator gets him: the camera pulls back to take it in, the gator(s) rolling
// him under and Meathead both, and holds on it a moment after he's gone; then it eases back in.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';

export interface GatorCam { scale: number; x: number; y: number; /** Where the last meal was, and till when it's held on. */ meal?: { x: number; y: number; until: number }; at: number }

/** How far it'll pull back at most, and at least (it always pulls back some: it's a show), the margin, the ease, the hold after. */
const MIN_SCALE = 0.5, MAX_SCALE = 0.82, MARGIN = 70, EASE = 0.07, HOLD = 50;

export const createGatorCam = (): GatorCam => ({ scale: 1, x: 0, y: 0, at: -1 });

const updateGatorCam = (state: GameState, cam: GatorCam) => {
  if (cam.at === state.frame) return;
  cam.at = state.frame;
  const p = state.player;
  // Somebody being eaten: where
  const diner = state.enemies.find(g => g.kind === 'gator' && (g.aiState === 'feed' || g.aiState === 'chomp') && g.prey);
  const prey = diner && state.enemies.find(o => o.id === diner.prey && o.health > 0);
  if (prey) cam.meal = { x: prey.pos.x + prey.width / 2, y: prey.pos.y + prey.height / 2, until: state.frame + HOLD };
  let want = 1;
  cam.x = state.camera.x + CANVAS_WIDTH / 2; cam.y = state.camera.y + CANVAS_HEIGHT / 2;
  if (cam.meal && state.frame < cam.meal.until && state.deathTimer <= 0) {
    const fit = (d: number, half: number) => (Math.abs(d) > 1 ? (half - MARGIN) / Math.abs(d) : Infinity);
    want = MAX_SCALE;
    for (const q of [cam.meal, { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }]) want = Math.min(want, fit(q.x - cam.x, CANVAS_WIDTH / 2), fit(q.y - cam.y, CANVAS_HEIGHT / 2));
    want = Math.max(MIN_SCALE, want);
  } else cam.meal = undefined;
  cam.scale += (want - cam.scale) * EASE;
  if (Math.abs(cam.scale - 1) < 0.002) cam.scale = 1;
};

/** The pull back, for the stage's zoom (null when there isn't one). */
export const gatorZoom = (state: GameState, cam: GatorCam) => { updateGatorCam(state, cam); return cam.scale < 0.999 ? { scale: cam.scale, x: cam.x, y: cam.y } : null; };
