// Into a land through its portal, the last of it (portalWalk.ts closed on him from behind, to black): the land opens
// on him, in the side view, where he starts: an iris opening out from him, the picture coming up out of mosaic blocks
// as it does (the SNES's way back in). Black a beat first, while the camera's put right where it'll be (no glide);
// he's not his own till it's open (no HUD till then: he's in a cutscene). The land runs it: takePortalArrival as it's
// built, tickPortalArrival from its update (it says when he's still not in control), drawPortalArrival in its drawHud.

import type { GameState } from '../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import { offerSkip, takeSkip, drawSkipPrompt } from '../m1/game/platform/skip';
import { iris, mosaic } from './walkAway/screen';

let pending = false;
/** He's coming in through a portal (the walk in played): the land he's going to opens on him. */
export const notePortalArrival = () => { pending = true; };
/** As the land's built: is he coming in through a portal? (Once.) */
export const takePortalArrival = () => { const p = pending; pending = false; return p; };
/** Is he on his way in through a portal (not taken yet)? (The HUD stays down from the moment he goes.) */
export const portalArrivalPending = () => pending;

/** Frames: black (the camera settling, under it); then the iris opening. */
const HOLD = 20, OPEN = 36;

export interface PortalArrival { t: number }
export const startPortalArrival = (): PortalArrival => ({ t: 0 });

/**
 * A frame of it. `row`: where the land's camera keeps his feet on the screen. True: still going (he's not in control);
 * false: it's over (give him back).
 */
export const tickPortalArrival = (state: GameState, a: PortalArrival, row: number): boolean => {
  a.t++;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  // (the camera put where it'd settle, under the black: when it opens it's already there)
  if (a.t <= HOLD && p.isGrounded) { state.cameraRestY = p.pos.y + p.height - row; state.camera.y = state.cameraRestY; }
  // (all of it, the walk in and this: skipped, it's just over)
  if (a.t > 4) offerSkip();
  if (takeSkip()) a.t = HOLD + OPEN;
  if (a.t >= HOLD + OPEN) { p.inCutscene = false; return false; }
  return true;
};

const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };

/** Over the land (screen space, in its drawHud): the blocks resolving, the iris opening on him. */
export const drawPortalArrival = (c: CanvasRenderingContext2D, state: GameState, a: PortalArrival) => {
  const k = ease((a.t - HOLD) / OPEN);
  if (k >= 1) return;
  const p = state.player;
  // (the blocks: in the canvas's own pixels, big to none)
  const scale = c.canvas.width / W;
  if (k > 0) mosaic(c, Math.max(1, Math.round((1 - k) * (1 - k) * 9 * scale)));
  const cx = p.pos.x + p.width / 2 - state.camera.x, cy = p.pos.y + p.height * 0.45 - state.camera.y;
  iris(c, cx, cy, k * 640, 0, 0, W, H);
  if (a.t > 4) drawSkipPrompt(c, W);
};
