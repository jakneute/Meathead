// In the fight with Oscar: hold the taser on something that's off the screen (his cigarette, up at the top of its
// arc; him, out past the edge) and the camera pulls back to take it in, him and Meathead both, for as long as it's
// held; let go, and it eases back in.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';

export interface TaseCam { scale: number; x: number; y: number; /** The frame it was last eased on (once a frame, whoever asks). */ at: number }

/** How far it'll pull back at the most, how far in from the edges the held thing's kept, how quick it eases. */
const MIN_SCALE = 0.55, MARGIN = 50, EASE = 0.1;

export const createTaseCam = (): TaseCam => ({ scale: 1, x: 0, y: 0, at: -1 });

/** Each frame: what it wants (pulled back far enough to see what's held, or not at all), eased towards. */
export const updateTaseCam = (state: GameState, cam: TaseCam) => {
  if (cam.at === state.frame) return;
  cam.at = state.frame;
  // (only in the fight: once he's dead, or anywhere else, the view's the ordinary one, straight away)
  if (!state.arenaLocked || state.victoryString || state.bossCorpse || state.bossFallen) { cam.scale = 1; return; }
  const p = state.player;
  let want = 1;
  const id = p.isTasing ? p.taserTargetId : null;
  const target = id ? state.enemies.find(e => e.id === id) ?? state.projectiles.find(q => q.id === id) : undefined;
  // (about the middle of the screen, always: easing back in included)
  cam.x = state.camera.x + CANVAS_WIDTH / 2; cam.y = state.camera.y + CANVAS_HEIGHT / 2;
  if (target) {
    // (about the middle of the screen: far enough back that what's held and Meathead are both in it)
    const cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y + CANVAS_HEIGHT / 2;
    const fit = (d: number, half: number) => (Math.abs(d) > 1 ? (half - MARGIN) / Math.abs(d) : Infinity);
    want = 1;
    for (const q of [{ x: target.pos.x + target.width / 2, y: target.pos.y + target.height / 2 }, { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }]) {
      want = Math.min(want, fit(q.x - cx, CANVAS_WIDTH / 2), fit(q.y - cy, CANVAS_HEIGHT / 2));
    }
    want = Math.max(MIN_SCALE, want);
  }
  cam.scale += (want - cam.scale) * EASE;
  if (Math.abs(cam.scale - 1) < 0.002) cam.scale = 1;
};

/** The pull back, for the stage's zoom (null when there isn't one). */
// (eased here too, every frame it's drawn: so it always comes back in once nothing's held, whatever Oscar's up to)
export const taseZoom = (state: GameState, cam: TaseCam) => { updateTaseCam(state, cam); return cam.scale < 0.999 ? { scale: cam.scale, x: cam.x, y: cam.y } : null; };
