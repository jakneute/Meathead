// THE CAMERA ON BEN WHILE HE TALKS (the owner: "when i met ben in the water tower, ben wasn't in frame. make sure he is
// in frame at every meeting. scroll or zoom as needed to do so"). Opt-in, one call a frame from a lair: while `want` is
// on (his meetup, his gift, a line he's saying in play), the camera eases to hold him and Meathead both whole, with room
// over their heads for their words and the words clear of the HUD's corner; pulled back a little (the section's zoom:
// benCamZoom) when they're too far apart to fit. Starting from where the camera would be anyway (it moves only as much
// as it needs to). When `want` goes off, it eases back to following him and lets go: no snaps either way.
//
// Use: `frameBen(state, want, benX, benFeetY, opts)` every frame he's in the lair (also when `want` is off: that's the
// ease back), `releaseBenCam(state)` when he's out of it some other way (a cannon, a death); and the section's zoom as
// `benCamZoom(state) ?? base.zoom?.(state) ?? null`.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H, HUD_CLEAR_Y } from '../../../m1/constants';
import { benHeadY } from './art';

/** The least zoom (pulled back this far, no more: a little). */
const MIN_SCALE = 0.74;
/** Room over Ben's head for his words (his bubble's rows over benHeadY), and over Meathead's for his. */
const BEN_WORDS = 66, MH_WORDS = 64;
/** Screen px: the top of anybody's words no higher than this (under the HUD's corner, the HUD hidden or not); the
 *  sides and the bottom kept off the edges by these. */
const TOP_CLEAR = HUD_CLEAR_Y + 36, SIDE = 34, BOTTOM = 14;
/** Ben's half-width (a flurry's fists) and Meathead's margin either side. */
const BEN_HALF = 44, MH_SIDE = 18;

export interface BenCamOpts {
  /** The room's ends (world x): the view's kept inside them where it can be (him and Ben whole come first). */
  a?: number; b?: number;
  /** The room's ceiling and floor (world y): the same, up and down. */
  top?: number; bottom?: number;
  /** The camera's top where it'd be held anyway (a section's cameraFixedY): eased back to it on letting go. */
  fixedY?: number;
  /** The zoom the section's at anyway (Sawdust Gulch's 0.8): framed from it, pulled back a little more, back to it. */
  scale?: number;
}
interface Cam { held: boolean; x: number; y: number; s: number; s0: number; baseY: number; rel: number }
const cams = new WeakMap<object, Cam>();
const camOf = (state: GameState): Cam => {
  const key = (state.stage ?? state) as object;
  let c = cams.get(key);
  if (!c) cams.set(key, c = { held: false, x: 0, y: 0, s: 1, s0: 1, baseY: state.camera.y, rel: 0 });
  return c;
};

/** Where the camera would be following him (its top-left), as the engine works it out (x; y where it was). */
const followAt = (state: GameState, c: Cam, fixedY?: number) => {
  const p = state.player;
  const fx = p.pos.x + p.width / 2 - W / 2 + (state.cameraLeadX || 0);
  const x = Math.max(state.cameraMinX, Math.min(state.cameraMaxX ?? Infinity, fx));
  return { x, y: fixedY ?? c.baseY };
};

/** The view (its middle, its zoom) that holds them both, nearest the follow camera's. */
const framing = (state: GameState, bx: number, by: number, o: BenCamOpts, base: { x: number; y: number }) => {
  const p = state.player, s0 = o.scale ?? 1;
  const L = Math.min(bx - BEN_HALF, p.pos.x - MH_SIDE), R = Math.max(bx + BEN_HALF, p.pos.x + p.width + MH_SIDE);
  const T = Math.min(benHeadY(by) - BEN_WORDS, p.pos.y - 20 - MH_WORDS), B = Math.max(by, p.pos.y + p.height);
  const s = Math.max(MIN_SCALE * s0, Math.min(s0, (W - SIDE * 2) / (R - L), (H - TOP_CLEAR - BOTTOM) / (B - T)));
  const vw = W / s, vh = H / s;
  // (from the follow camera's view, the same middle: in the room where it can be, then moved just enough for them both)
  let cx = base.x + W / 2, cy = base.y + H / 2;
  const fitIn = (c: number, half: number, a?: number, b?: number) => {
    if (a === undefined || b === undefined) return c;
    return b - a <= half * 2 ? (a + b) / 2 : Math.max(a + half, Math.min(b - half, c));
  };
  cx = fitIn(cx, vw / 2, o.a, o.b); cy = fitIn(cy, vh / 2, o.top, o.bottom);
  const side = SIDE / s, topC = TOP_CLEAR / s, bot = BOTTOM / s;
  // (left and right: both whole; too wide even pulled back, Meathead's the one kept whole)
  if (R - L <= vw - side * 2) { cx = Math.max(R + side - vw / 2, Math.min(L - side + vw / 2, cx)); }
  else { const pl = p.pos.x - MH_SIDE, pr = p.pos.x + p.width + MH_SIDE; cx = Math.max(pr + side - vw / 2, Math.min(pl - side + vw / 2, (L + R) / 2)); }
  // (up and down: their feet off the bottom, their words under the HUD's corner)
  cy = Math.max(B + bot - vh / 2, Math.min(T - topC + vh / 2, cy));
  return { x: cx, y: cy, s };
};

/** Each frame in the lair: `want` on, the camera eases to hold Ben (his feet at benX, benFeetY) and Meathead; off, it
 *  eases back to following him, then lets go. */
export const frameBen = (state: GameState, want: boolean, benX: number, benFeetY: number, o: BenCamOpts = {}) => {
  const c = camOf(state);
  if (!want && !c.held) { c.baseY = state.camera.y; return; }
  if (want && !c.held) {
    // (taking the camera from wherever it is)
    c.held = true; c.rel = 0; c.s = o.scale ?? 1;
    c.baseY = state.camera.y;
    c.x = state.camera.x + W / 2; c.y = state.camera.y + H / 2;
  }
  c.s0 = o.scale ?? 1;
  const f = followAt(state, c, o.fixedY);
  if (want) {
    c.rel = 0;
    const t = framing(state, benX, benFeetY, o, f);
    c.s += (t.s - c.s) * 0.06;
    c.x += (t.x - c.x) * 0.1; c.y += (t.y - c.y) * 0.1;
  } else {
    // (back to following him: eased, faster and faster, so a running start never leaves it trailing)
    c.rel++;
    const k = Math.min(1, 0.1 + c.rel * 0.012);
    const s0 = o.scale ?? 1;
    c.s += (s0 - c.s) * Math.min(1, k * 0.8);
    c.x += (f.x + W / 2 - c.x) * k; c.y += (f.y + H / 2 - c.y) * k;
    if (k >= 1 || (Math.abs(c.s - s0) < 0.002 && Math.abs(c.x - f.x - W / 2) < 0.75 && Math.abs(c.y - f.y - H / 2) < 0.75)) {
      c.held = false;
      state.camera.x = f.x; state.camera.y = f.y; state.cameraOverride = null;
      return;
    }
  }
  state.camera.x = c.x - W / 2; state.camera.y = c.y - H / 2;
  state.cameraOverride = { x: state.camera.x, y: state.camera.y };
};

/** Let go of the camera now (he's left the lair some way that takes the camera itself: a cannon shot, a death). */
export const releaseBenCam = (state: GameState) => {
  const c = camOf(state);
  if (!c.held) return;
  c.held = false; c.s = 1; c.rel = 0;
  state.cameraOverride = null;
};
/** The camera's held on Ben (the section's own camera calls can stand aside). */
export const benCamHeld = (state: GameState) => camOf(state).held;

/** The section's zoom while it's pulled back (about the view's middle), else null. */
export const benCamZoom = (state: GameState) => {
  const c = camOf(state);
  if (!c.held || (c.s0 === 1 && Math.abs(c.s - 1) < 0.002)) return null;
  return { scale: c.s, x: state.camera.x + W / 2, y: state.camera.y + H / 2 };
};
