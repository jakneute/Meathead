// THE CORNER PIP: a gross-up (grossKit.ts) in a TV inset up over the game while it goes on under it (not a cutscene: no
// input lock, no pause, the HUD stays). The frame and its slide shared by everybody's: Safari Artie's (adventure/river/
// artiePip.ts) and Tucker's on the speaking tube (frontier/train/tuckerPip.ts). Up at the top right, or up the left
// under the main HUD's corner (HUD_CLEAR_Y) when the words would be under the top right.

import { CANVAS_WIDTH, HUD_CLEAR_Y } from '../m1/constants';
import { GW, GH } from './grossKit';

type Ctx = CanvasRenderingContext2D;

/** The picture's scale (screen pixels a gross-up buffer pixel), its size; the bezel round it; the slides in and out. */
export const PIP_S = 0.8, PIP_CW = Math.round(GW * PIP_S), PIP_CH = Math.round(GH * PIP_S), PIP_BZ = 8, PIP_IN = 12, PIP_OUT = 14;
/** The whole inset, bezel and all. */
export const PIP_W = PIP_CW + PIP_BZ * 2, PIP_H = PIP_CH + PIP_BZ * 2;

export const pipEase = (k: number) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

/** Would words up at (ax, ay) on the screen be under the top right one (so it takes the left)? */
export const pipWordsUnder = (ax: number, ay: number) => {
  const x0 = CANVAS_WIDTH - 16 - PIP_CW - PIP_BZ * 2, y1 = 16 + PIP_CH + PIP_BZ * 2;
  return ax + 130 > x0 && ay - 44 < y1;
};

/** Where it is (its bezel's top left), slid `slid` of the way off (0 in, 1 gone) out its own side. */
export const pipAt = (left: boolean, slid: number) => {
  const X0 = left ? 16 : CANVAS_WIDTH - 16 - PIP_W, Y0 = left ? HUD_CLEAR_Y + 8 : 16;
  return { X: Math.round(X0 + (left ? -1 : 1) * slid * (PIP_W + 24)), Y: Y0 };
};

/** The bezel (an old portable TV's: dark plastic, rounded, lit along the top, its red light blinking) and the black
 *  behind the picture; then it's clipped to the picture (`ox`, `oy` its top left). Close with pipGlass. */
export const pipBezel = (c: Ctx, X: number, Y: number, f: number) => {
  const W = PIP_W, H = PIP_H;
  c.fillStyle = '#09090B'; rr(c, X - 2, Y - 2, W + 4, H + 4, 10);
  c.fillStyle = '#27272A'; rr(c, X, Y, W, H, 8);
  c.fillStyle = '#3F3F46'; c.fillRect(X + 8, Y + 1, W - 16, 2); c.fillRect(X + 1, Y + 8, 2, H - 16);
  c.fillStyle = '#18181B'; c.fillRect(X + 8, Y + H - 3, W - 16, 2);
  if (f % 40 < 26) { c.fillStyle = '#EF4444'; c.fillRect(X + W - 9, Y + H - 7, 3, 3); c.fillStyle = '#FCA5A5'; c.fillRect(X + W - 9, Y + H - 7, 1, 1); }
  const ox = X + PIP_BZ, oy = Y + PIP_BZ;
  c.fillStyle = '#000000'; c.fillRect(ox - 1, oy - 1, PIP_CW + 2, PIP_CH + 2);
  c.save();
  c.beginPath(); c.rect(ox, oy, PIP_CW, PIP_CH); c.clip();
  return { ox, oy };
};
/** The tube over the picture (scanlines, the glass's sheen); undoes pipBezel's clip. */
export const pipGlass = (c: Ctx, ox: number, oy: number, f: number) => {
  c.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = oy + (f & 1); y < oy + PIP_CH; y += 3) c.fillRect(ox, y, PIP_CW, 1);
  c.fillStyle = 'rgba(255, 255, 255, 0.06)'; c.fillRect(ox, oy, PIP_CW, 6); c.fillRect(ox, oy, 6, PIP_CH);
  c.restore();
};

/** A rounded rectangle, filled. */
const rr = (c: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.quadraticCurveTo(x + w, y, x + w, y + k); c.lineTo(x + w, y + h - k);
  c.quadraticCurveTo(x + w, y + h, x + w - k, y + h); c.lineTo(x + k, y + h); c.quadraticCurveTo(x, y + h, x, y + h - k); c.lineTo(x, y + k);
  c.quadraticCurveTo(x, y, x + k, y); c.closePath(); c.fill();
};
