// The long fall from the top of the clock tower into hell (Player.freefall, drawn in render/player/freefall.ts): out of
// his hands from the jump to back on his feet in the pit. The tower starts it (the jump, the dive) and hands it on
// through the chute; hell eases him round for the landing, and runs the landing.

import type { Player } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { FREEFALL_LAND, freefallLandRot } from '../../m1/game/render/player/freefall';

export { FREEFALL_LAND };

/** The pose goes with what he hollers going over: a cannonball for CANNONBALL, flailing for anything else. */
export const startFreefall = (p: Player, line: string) => {
  if (p.freefall) return;
  p.freefall = { style: /CANNON/i.test(line) ? 'ball' : 'flail', t: 0, rot: 0, land: 0 };
};

/** How fast he turns over (radians a frame): a slow tumble, or a cannonball's spin. */
const spinOf = (style: 'flail' | 'ball') => (style === 'ball' ? 0.26 : 0.075);

/**
 * Each frame of the fall: on round. `ground` is how far below his feet he'll come down (null: nowhere yet); the last
 * stretch of it, he's eased round, at much the speed he's turning, to come down the way the landing wants.
 */
export const stepFreefall = (p: Player, ground: number | null) => {
  const f = p.freefall;
  if (!f) return;
  if (f.land > 0) { f.land++; return; }
  f.t++;
  const spin = spinOf(f.style) * Math.min(1, f.t / 24);
  const left = ground === null ? Infinity : ground / Math.max(4, p.vel.y);
  if (left > 34) { f.rot += spin; f.goal = undefined; return; }
  if (f.goal === undefined) {
    // (where he'd get to turning as he is, to the nearest way round that he lands right)
    const want = freefallLandRot(f.style), go = f.rot + spin * left, turn = Math.PI * 2;
    f.goal = want + Math.round((go - want) / turn) * turn;
    if (f.goal < f.rot) f.goal += turn;
  }
  f.rot += (f.goal - f.rot) / Math.max(1, left);
};

/** Down: the landing starts (it runs on from stepFreefall). */
export const landFreefall = (p: Player) => {
  const f = p.freefall;
  if (!f || f.land > 0) return;
  if (f.goal !== undefined) f.rot = f.goal;
  f.land = 1;
};

/**
 * World space, over the backdrop and the scenery (not him): black, from nothing at `clear` to all of it at `dark`
 * (world y's, either way up), between world x's `x0` and `x1`. The cut from the tower's chute to hell's shaft is made
 * in the dark, so the fall's all one.
 */
export const drawFallDark = (c: CanvasRenderingContext2D, state: GameState, clear: number, dark: number, x0: number, x1: number) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  // (nothing of it on screen: all of the view on the clear side of it)
  if (dark > clear ? v.y + v.h < clear : v.y > clear) return;
  const g = c.createLinearGradient(0, clear, 0, dark);
  g.addColorStop(0, 'rgba(8, 2, 1, 0)'); g.addColorStop(1, 'rgba(8, 2, 1, 1)');
  c.fillStyle = g;
  const a = Math.max(x0, v.x - 40), b = Math.min(x1, v.x + v.w + 40);
  if (b > a) c.fillRect(a, v.y - 40, b - a, v.h + 80);
};
