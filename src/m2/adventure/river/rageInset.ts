// ARTIE LOSES IT (the user's: "show a picture-in-picture image of artie getting enraged when you jump off the boat"):
// Meathead goes over the side mid-ride, and up in a corner comes a TV inset of Artie on his boat, his gross-up
// (artieGross.ts): going red (seething, the sneer, shaking, steam off his ears) while Meathead says his piece, then as
// his own line comes (ARTIE_JUMPED, voiced) the jaw drops and he yells, the helmet pops off his head and goes flying
// (pale as a fish under it, the comb-over), his fist up in the camera shaking, spit flying at the lens, the veins up.
// His line done, he's left seething a beat, and the inset slides off. Gameplay goes on under it (it's not a cutscene:
// no input lock, the HUD stays). Once a visit: the jump only happens the once (the boat's memo keeps it over deaths).
// Never over the main HUD's corner, and never over Artie's own words (it takes the other side if they'd be under it).
// Its stamps are painted ahead (warmGrossUps, while he's on the boat): it waits for them rather than paint on the spot.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, HUD_CLEAR_Y } from '../../../m1/constants';
import { hash2, GW, GH } from '../../grossKit';
import { artieStamp, artieStampReady, drawArtieGrossBack, ARTIE_FX as FX, ARTIE_FY as FY, HAT_DY, type Key } from './artieGross';
import { BOAT } from './course';
import { ARTIE_H } from './artie';

type Ctx = CanvasRenderingContext2D;

export interface RageInset {
  /** Frames it's been up; when his line started and ended (-1: not yet); how long it's waited on its paint. */
  t: number; yellAt: number; endAt: number; wait: number;
  /** Up the left (under the HUD) instead of the top right. */
  left: boolean;
}

/** Its picture's scale (screen pixels a buffer pixel), size; the bezel round it; the slides in and out. */
const S = 0.8, CW = Math.round(GW * S), CH = Math.round(GH * S), BZ = 8, IN = 12, OUT = 14;
/** The seething before his line, at most (his line out of earshot, never coming); the yell without one; at the least. */
const PRE_MAX = 200, YELL_MAX = 420, YELL_MIN = 110, SEETHE_AFTER = 24;
const KEYS: Key[] = ['a', 'rc', 'r', 'r2', 'hat', 'fist'];

/** Over the side: up it comes. */
export const startRage = (): RageInset => ({ t: 0, yellAt: -1, endAt: -1, wait: 0, left: false });
/** His line (what's shown while it's said: null once it's done). */
export const rageLine = (r: RageInset | undefined, said: string | null) => {
  if (!r) return;
  if (said && r.yellAt < 0) r.yellAt = r.t;
  if (!said && r.yellAt >= 0 && r.endAt < 0) r.endAt = r.t;
};

/** Each frame; false once it's gone. */
export const stepRage = (state: GameState, r: RageInset, boatX: number) => {
  if (r.t === 0 && !KEYS.every(artieStampReady)) return ++r.wait < 120;
  if (r.t === 0) {
    // (which corner: the top right, unless Artie's words would come up under it)
    const ax = boatX + 200 - state.camera.x, ay = BOAT.deck - ARTIE_H - 8 - state.camera.y;
    const x0 = CANVAS_WIDTH - 16 - CW - BZ * 2, y1 = 16 + CH + BZ * 2;
    r.left = ax + 130 > x0 && ay - 44 < y1;
  }
  r.t++;
  if (r.yellAt < 0 && r.t > PRE_MAX) r.yellAt = r.t;
  if (r.yellAt >= 0 && r.endAt < 0 && r.t - r.yellAt > YELL_MAX) r.endAt = r.t;
  return r.endAt < 0 || r.t < outAt(r) + OUT;
};
const outAt = (r: RageInset) => Math.max(r.endAt, r.yellAt + YELL_MIN) + SEETHE_AFTER;
const ease = (k: number) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

/** Screen space (the section's drawHud). */
export const drawRage = (c: Ctx, r: RageInset, f: number) => {
  if (r.t <= 0 || typeof document === 'undefined') return;
  const t = r.t, out = r.endAt >= 0 ? ease((t - outAt(r)) / OUT) : 0, slid = 1 - ease(t / IN) + out;
  if (slid >= 1) return;
  const W = CW + BZ * 2, H = CH + BZ * 2;
  const X0 = r.left ? 16 : CANVAS_WIDTH - 16 - W, Y0 = r.left ? HUD_CLEAR_Y + 8 : 16;
  const X = Math.round(X0 + (r.left ? -1 : 1) * slid * (W + 24)), Y = Y0;
  // ---- the bezel: an old portable TV's, dark plastic, rounded, lit along the top; the red light on it blinking
  c.fillStyle = '#09090B'; rr(c, X - 2, Y - 2, W + 4, H + 4, 10);
  c.fillStyle = '#27272A'; rr(c, X, Y, W, H, 8);
  c.fillStyle = '#3F3F46'; c.fillRect(X + 8, Y + 1, W - 16, 2); c.fillRect(X + 1, Y + 8, 2, H - 16);
  c.fillStyle = '#18181B'; c.fillRect(X + 8, Y + H - 3, W - 16, 2);
  if (f % 40 < 26) { c.fillStyle = '#EF4444'; c.fillRect(X + W - 9, Y + H - 7, 3, 3); c.fillStyle = '#FCA5A5'; c.fillRect(X + W - 9, Y + H - 7, 1, 1); }
  const ox = X + BZ, oy = Y + BZ;
  c.fillStyle = '#000000'; c.fillRect(ox - 1, oy - 1, CW + 2, CH + 2);
  c.save();
  c.beginPath(); c.rect(ox, oy, CW, CH); c.clip();
  c.save(); c.translate(ox, oy); drawArtieGrossBack(c, CW, CH); c.restore();
  // ---- him: what phase of it
  const yell = r.yellAt >= 0 ? t - r.yellAt : -1, talking = yell >= 0 && (r.endAt < 0 || t < r.endAt);
  const red = ease((t - 6) / 50);
  const jolt = talking ? 6 : yell >= 0 ? 2 : red * 3;
  // (the stamps' shake, the same for all of them: drawGrossStamp's lurch and jitter, his rage on top)
  const jx = Math.round(Math.sin(f * 0.045) * 1.4 + (hash2(Math.floor(f / 9), 3) > 0.7 ? (hash2(Math.floor(f / 9), 5) - 0.5) * 2 : 0)) + (jolt * (f % 4 < 2 ? 1 : -1)) / 3;
  const jy = Math.round(Math.sin(f * 0.06) * 1.2) + (jolt > 3 && f % 6 < 3 ? 1 : 0);
  const put = (k: Key, a = 1, dx = 0, dy = 0) => {
    const img = artieStamp(k);
    if (!img || a <= 0) return;
    c.globalAlpha = a;
    c.drawImage(img, Math.round(ox + (jx + dx) * S), Math.round(oy + (jy + dy) * S), Math.round(GW * S), Math.round(GH * S));
    c.globalAlpha = 1;
  };
  c.imageSmoothingEnabled = false;
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(ox + (x + jx) * S), Math.round(oy + (y + jy) * S), Math.max(1, Math.round(w * S)), Math.max(1, Math.round(h * S))); };
  if (yell < 0) {
    // Seething: going red, the sneer, the helmet still on; steam off his ears
    put('a'); put('rc', red);
    put('hat', 1, 0, -HAT_DY);
    if (red > 0.6) for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const a = ((f + k * 11) % 33) / 33, x = FX + s * (100 + a * 18), y = FY - a * 40;
      box(x - 3 - a * 4, y - 3 - a * 4, 6 + a * 8, 6 + a * 8, `rgba(244, 244, 245, ${(0.75 * (1 - a)).toFixed(2)})`);
    }
  } else {
    // Yelling: the mouth going (wide on the words, half shut between); done, seething again
    const k: Key = talking ? (hash2(Math.floor(yell / 5), 7) > 0.35 ? 'r' : 'r2') : 'rc';
    put(k);
    // (the veins throbbing: lit up a beat each pulse)
    if (f % 14 < 4) { box(FX - 7, 40, 2, 30, '#FFB0B0'); box(FX + 54, 70, 2, 24, '#FFB0B0'); box(FX - 56, 70, 2, 24, '#FFB0B0'); }
    // (spit, flying at the lens: bigger the nearer it gets)
    if (talking && k === 'r') for (let n = 0; n < 9; n++) {
      const a = (yell + n * 7) % 30, vx = (hash2(n, Math.floor((yell + n * 7) / 30)) - 0.5) * 7, vy = (hash2(n + 9, Math.floor((yell + n * 7) / 30)) - 0.6) * 3;
      const z = 1 + a / 7, x = FX + 2 + vx * a, y = 166 + vy * a + 0.06 * a * a;
      box(x, y, z * 2, z * 2, '#DCEBFA'); box(x, y, z, z, '#FFFFFF');
    }
    // The helmet: popped straight up off him, spinning, gone out the top
    const u = yell;
    if (u < 40) {
      const img = artieStamp('hat');
      if (img) {
        c.save();
        c.translate(ox + (FX + jx + u * 1.8) * S, oy + (30 + jy - u * 6 + u * u * 0.08) * S);
        c.rotate(u * 0.16); c.scale(S, S);
        c.drawImage(img, -FX, -30 - HAT_DY);
        c.restore();
      }
    }
    // His fist: up in the camera, shaken (in while he's yelling, down out of it after)
    const up = ease(u / 8) - (talking ? 0 : ease((t - (r.endAt >= 0 ? r.endAt : t)) / 10));
    if (up > 0) {
      const img = artieStamp('fist');
      if (img) {
        const fs = S * 0.62, fx = ox + CW - 70 + Math.sin(f * 0.9) * 4, fy = oy + CH - 52 + (1 - up) * 140 + Math.sin(f * 1.3) * 10;
        c.drawImage(img, Math.round(fx - FX * fs), Math.round(fy - FY * fs), Math.round(GW * fs), Math.round(GH * fs));
      }
    }
  }
  // (the tube: scanlines, the glass's sheen)
  c.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = oy + (f & 1); y < oy + CH; y += 3) c.fillRect(ox, y, CW, 1);
  c.fillStyle = 'rgba(255, 255, 255, 0.06)'; c.fillRect(ox, oy, CW, 6); c.fillRect(ox, oy, 6, CH);
  c.restore();
};

/** A rounded rectangle, filled. */
const rr = (c: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w - k, y); c.quadraticCurveTo(x + w, y, x + w, y + k); c.lineTo(x + w, y + h - k);
  c.quadraticCurveTo(x + w, y + h, x + w - k, y + h); c.lineTo(x + k, y + h); c.quadraticCurveTo(x, y + h, x, y + h - k); c.lineTo(x, y + k);
  c.quadraticCurveTo(x, y, x + k, y); c.closePath(); c.fill();
};
