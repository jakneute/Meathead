// Water hitting water on level 1's rides (the owner's "make the splashes on the tubed water rides more natural on
// impact"): the tube coming down on a chute after a jump, off a chute's end into its pool, out of the funnel's spout,
// the slides' boarding and their lips, and the wake while he's skimming along.
//
// One splash is: a crown thrown up round where it hit (sized by how hard it came down: columns that rise, lean out and
// fall back, their tips breaking off), a sheet thrown on ahead the way he was going, droplets off both that arc up and
// fall back with gravity (fading, gone at the surface they came from), a white foam ring spreading flat on the surface
// and breaking up as it goes, and on a big one a drift of spray mist. A skim's wake is the small end of it: a few drops
// kicked up behind and a foam streak left on the water.
//
// SNES look: a few stepped water shades (no gradients), chunky 2 px-grid drops. Light: a fixed pool of drops in typed
// arrays (no allocation per drop), a handful of bursts drawn as plain rects (a few dozen fillRects each while it's up),
// nothing at all when nothing's splashing; no canvas filters, no pixel work.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

/** The water's steps: deep, body, lit, pale, foam. */
const BLUE = ['#1E4E8C', '#3478C0', '#6EB0E6', '#B6DEFA', '#F4FBFF'];

// ---- the drops: a fixed pool
const MAXD = 420;
const dx = new Float32Array(MAXD), dy = new Float32Array(MAXD), dvx = new Float32Array(MAXD), dvy = new Float32Array(MAXD);
const dlife = new Float32Array(MAXD), dmax = new Float32Array(MAXD), dfloor = new Float32Array(MAXD);
const dsize = new Uint8Array(MAXD), dshade = new Uint8Array(MAXD);
let dn = 0;
const drop = (x: number, y: number, vx: number, vy: number, life: number, size: number, shade: number, floor: number) => {
  if (dn >= MAXD) return;
  const i = dn++;
  dx[i] = x; dy[i] = y; dvx[i] = vx; dvy[i] = vy; dlife[i] = life; dmax[i] = life; dfloor[i] = floor; dsize[i] = size; dshade[i] = shade;
};

// ---- the bursts: crown, sheet, ring, mist (and a wake's streak: a ring with no crown)
interface Burst {
  on: boolean; x: number; y: number; t: number;
  /** Frames the crown's up; the ring lasts twice that. */
  T: number;
  /** The crown's reach out and up (px). 0: none (a wake's streak). */
  R: number; H: number;
  /** The way he was going (-1, 0, 1) and how much sheet it throws that way (px out at its longest). */
  dir: number; sheet: number;
  /** The surface's slope there (a chute's), the ring laid along it. */
  a: number;
  /** The ring's widest (px, half-width), and mist (big ones). */
  ring: number; mist: boolean;
  /** A per-burst seed (its columns' heights). */
  seed: number;
}
const MAXB = 24;
const bursts: Burst[] = Array.from({ length: MAXB }, () => ({ on: false, x: 0, y: 0, t: 0, T: 1, R: 0, H: 0, dir: 0, sheet: 0, a: 0, ring: 0, mist: false, seed: 0 }));
const freeBurst = () => {
  let best: Burst | null = null;
  for (const b of bursts) { if (!b.on) return b; if (!best || b.t / (b.T * 2) > best.t / (best.T * 2)) best = b; }
  return best!;
};
const hsh = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** Crown columns round the ring: their angles (0 = straight out toward the eye, PI = away). */
const COLS = 11;

/** A splash where something's come down into water at (x, surfaceY): `speed` how hard (px a frame: the fall's or the
 *  ride's, 0..18); `dir` the way it was going along (-1, 0, 1); `a` the surface's slope (a chute's; 0 a pool's). */
export const splash = (x: number, y: number, speed: number, dir = 0, a = 0, reach = 1e9) => {
  const v = Math.max(1, Math.min(18, speed)), b = freeBurst();
  const R = 8 + v * 2.4, H = 8 + v * 5.2;
  Object.assign(b, { on: true, x, y, t: 0, T: Math.round(16 + v * 1.6), R, H, dir, sheet: dir ? Math.max(0, Math.min(reach - R * 0.5, R * (1.6 + v * 0.08))) : 0, a, ring: R * 2.4, mist: v >= 8, seed: Math.random() * 1000 });
  // (the drops: off the crown's rim, out and up, the far side's thrown higher (it's seen over the near side); off the
  // sheet's edge, on ahead, low and fast; a few big slow globs straight up out of the middle)
  const ca = Math.cos(a), sa = Math.sin(a);
  const n = Math.round(10 + v * 5);
  for (let k = 0; k < n; k++) {
    const th = Math.random() * Math.PI * 2, out = Math.cos(th), sp = 0.4 + Math.random() * 0.8;
    const vx = out * (0.6 + v * 0.22) * sp + dir * v * 0.18, vy = -(1.5 + v * 0.62) * (0.55 + Math.random() * 0.6);
    const px = x + out * R * 0.7 * ca, py = y + out * R * 0.7 * sa;
    drop(px, py - 2, vx, vy, 40 + Math.random() * 30, Math.random() < 0.25 ? 4 : 2, Math.random() < 0.4 ? 4 : 3, py + 2);
  }
  if (dir) for (let k = 0; k < Math.round(v * 2.2); k++) {
    const u = 0.5 + Math.random() * 0.7;
    drop(x + dir * R * 0.5, y - 4, dir * (2 + v * 0.45) * u, -(1 + v * 0.38) * (0.5 + Math.random() * 0.6), 34 + Math.random() * 20, Math.random() < 0.3 ? 4 : 2, Math.random() < 0.5 ? 4 : 3, y + dir * (v * 6) * sa + 2);
  }
  for (let k = 0; k < Math.round(v * 0.5); k++) drop(x + (Math.random() - 0.5) * R * 0.6, y - 6, (Math.random() - 0.5) * 1.2 + dir * 0.6, -(3 + v * 0.75) * (0.7 + Math.random() * 0.4), 60, 6, 2, y + 2);
};

/** A skim's wake at (x, y) on water sloping `a`, going `dir` at `speed`: a couple of drops kicked up behind, and (every
 *  few frames: `streak`) a foam streak left on the surface. */
export const wake = (x: number, y: number, speed: number, dir: number, a: number, streak: boolean) => {
  const v = Math.max(1, Math.min(14, speed));
  drop(x - dir * 10, y - 2, -dir * (0.6 + Math.random() * 1.4) + dir * v * 0.5, -(1 + Math.random() * (1 + v * 0.18)), 18 + Math.random() * 8, 2, Math.random() < 0.5 ? 4 : 3, y + 1);
  if (streak) {
    const b = freeBurst();
    Object.assign(b, { on: true, x: x - dir * 8, y, t: 0, T: 10, R: 0, H: 0, dir: 0, sheet: 0, a, ring: 10 + v * 1.2, mist: false, seed: Math.random() * 1000 });
  }
};

/** Water thrown off something (out of a spout, off a slide's lip): `n` drops from across `w` px at (x, y), going about
 *  (vx, vy) each, falling till they're back down past `floor`. */
export const spray = (x: number, y: number, w: number, n: number, vx: number, vy: number, floor = 1e9) => {
  for (let k = 0; k < n; k++) {
    const u = 0.6 + Math.random() * 0.6;
    drop(x + (Math.random() - 0.5) * w, y, vx * u + (Math.random() - 0.5) * 1.6, vy * u + (Math.random() - 0.5) * 1.6, 30 + Math.random() * 16, Math.random() < 0.3 ? 4 : 2, Math.random() < 0.5 ? 4 : 3, floor);
  }
};

/** Everything near `from` moved along by `d` (the tube's loop carry). */
export const shiftSplashes = (from: number, d: number) => {
  for (let i = 0; i < dn; i++) if (Math.abs(dx[i] - from) < 2400) dx[i] += d;
  for (const b of bursts) if (b.on && Math.abs(b.x - from) < 2400) b.x += d;
};
export const clearSplashes = () => { dn = 0; for (const b of bursts) b.on = false; };

/** A frame: the drops fall (gone back into the water they came from, or when their time's up); the bursts age. */
export const updateSplashes = () => {
  for (let i = 0; i < dn; i++) {
    dvy[i] += 0.42; dvx[i] *= 0.985;
    dx[i] += dvx[i]; dy[i] += dvy[i];
    dlife[i]--;
    if (dlife[i] <= 0 || (dvy[i] > 0 && dy[i] > dfloor[i])) {
      dn--;
      if (i < dn) { dx[i] = dx[dn]; dy[i] = dy[dn]; dvx[i] = dvx[dn]; dvy[i] = dvy[dn]; dlife[i] = dlife[dn]; dmax[i] = dmax[dn]; dfloor[i] = dfloor[dn]; dsize[i] = dsize[dn]; dshade[i] = dshade[dn]; }
      i--;
    }
  }
  for (const b of bursts) if (b.on && ++b.t > b.T * 2) b.on = false;
};

const S2 = (n: number) => Math.round(n / 2) * 2;

/** The splashes (world space): `front` false, the parts behind him (the crown's far side, the ring's far arc); true, the
 *  rest over him (the near side, the sheet, the drops, the mist). */
export const drawSplashes = (c: CanvasRenderingContext2D, state: GameState, front: boolean) => {
  const x0 = state.camera.x - 200, x1 = state.camera.x + CANVAS_WIDTH + 200, y0 = state.camera.y - 200, y1 = state.camera.y + CANVAS_HEIGHT + 200;
  const was = c.globalAlpha;
  for (const b of bursts) {
    if (!b.on || b.x < x0 || b.x > x1 || b.y < y0 || b.y > y1) continue;
    const ca = Math.cos(b.a), sa = Math.sin(b.a);
    // ---- the foam ring: flat on the surface (seen near edge-on), spreading, broken up more the older it is
    const u = b.t / (b.T * 2), rx = b.ring * (0.35 + 0.65 * Math.sqrt(u)), ry = Math.max(2, rx * 0.16);
    const segs = 22;
    for (let j = 0; j < segs; j++) {
      const th = (j / segs) * Math.PI * 2, near = Math.sin(th) > 0;
      if (near !== front) continue;
      // (dithered away as it goes: each dash drops out at its own age)
      if (hsh(b.seed + j) < u * 1.15 - 0.05) continue;
      const ox = Math.cos(th) * rx, oy = Math.sin(th) * ry;
      const px = S2(b.x + ox * ca - oy * sa), py = S2(b.y + ox * sa + oy * ca);
      c.fillStyle = near ? BLUE[4] : BLUE[3];
      c.fillRect(px - 3, py - 1, 6, 2);
    }
    // (the churn in its middle at first: white water)
    if (front && u < 0.4 && b.R > 0) {
      const w = S2(b.R * (1.1 + u)), k = 1 - u / 0.4;
      c.fillStyle = BLUE[4]; c.fillRect(S2(b.x - w / 2), S2(b.y - 2), w, 2);
      c.fillStyle = BLUE[3]; c.fillRect(S2(b.x - w / 2 + 2), S2(b.y), S2(w - 4), 2);
      if (k > 0.5) { c.fillStyle = BLUE[4]; for (let j = 0; j < 4; j++) c.fillRect(S2(b.x - w / 2 + hsh(b.seed + 40 + j) * w), S2(b.y - 4), 4, 2); }
    }
    if (b.R <= 0) continue;
    // ---- the crown: columns round the rim, up fast, over, and back down (their tips gone to drops by then)
    const e = b.t / b.T;
    if (e < 1) {
      const up = e < 0.32 ? Math.sin((e / 0.32) * Math.PI / 2) : 1 - Math.pow((e - 0.32) / 0.68, 1.6);
      const r = b.R * (0.55 + 0.75 * Math.sqrt(e));
      for (let j = 0; j < COLS; j++) {
        const th = (j / COLS) * Math.PI * 2 + 0.3, out = Math.cos(th), near = Math.sin(th) > 0;
        if (near !== front) continue;
        // (higher toward the way he was going (the sheet's side), and each its own)
        const hj = (0.55 + hsh(b.seed + j) * 0.6) * (1 + b.dir * out * 0.35), h = b.H * hj * up;
        if (h < 3) continue;
        const bx = b.x + out * r * ca, by = b.y + out * r * sa + (near ? 2 : -2);
        const lean = out * (0.25 + e * 0.5);
        // (in bands: deeper at its foot, lit up it, the pale tip; thinning; breaking up near the top on the way down)
        const steps = Math.max(2, Math.min(6, Math.round(h / 6)));
        for (let s = 0; s < steps; s++) {
          const f0 = s / steps, f1 = (s + 1) / steps, yA = by - h * f1, yB = by - h * f0;
          if (e > 0.45 && s === steps - 1 && hsh(b.seed + j * 7 + b.t) < 0.5) continue;
          const w = Math.max(2, S2((near ? 7 : 5) * (1 - f0 * 0.6) * (0.7 + b.R / 60)));
          const sh = near ? (f1 > 0.8 ? 4 : f1 > 0.45 ? 3 : 2) : (f1 > 0.8 ? 3 : f1 > 0.45 ? 2 : 1);
          c.fillStyle = BLUE[sh];
          c.fillRect(S2(bx + lean * h * f0 - w / 2), S2(yA), w, Math.max(2, S2(yB - yA)));
        }
        // (its lit edge up the side toward the light (the left))
        if (near && h > 8) { c.fillStyle = BLUE[4]; c.fillRect(S2(bx + lean * h * 0.3 - 3), S2(by - h * 0.7), 2, S2(h * 0.4)); }
      }
      // ---- the sheet thrown on ahead: a leaning curtain out the way he was going, low at its root, up and over at its
      // end, falling
      if (front && b.sheet > 0) {
        // (in strands, thin, leaning on the way it's going: a curtain of water, not a heap)
        const L = b.sheet * Math.min(1, e * 1.6 + 0.15), n = 9;
        for (let s = 0; s < n; s++) {
          const f = (s + 0.5) / n, sx = b.x + b.dir * (b.R * 0.5 + L * f), sy = b.y + b.dir * (b.R * 0.5 + L * f) * sa;
          const hh = b.H * 0.6 * up * Math.sin(Math.min(1, f * 1.1) * Math.PI * 0.8) * (0.7 + hsh(b.seed + 90 + s) * 0.6);
          if (hh < 4) continue;
          if (e > 0.5 && hsh(b.seed + s * 3 + b.t) < (e - 0.5) * 1.4) continue;
          const lean = b.dir * (0.3 + f * 0.5), steps = Math.max(2, Math.min(5, Math.round(hh / 7)));
          for (let k = 0; k < steps; k++) {
            const f0 = k / steps, f1 = (k + 1) / steps, yA = sy - hh * f1, yB = sy - hh * f0;
            c.fillStyle = BLUE[f1 > 0.75 ? 4 : f1 > 0.4 ? 3 : 2];
            c.fillRect(S2(sx + lean * hh * f0 - 2), S2(yA), 4, Math.max(2, S2(yB - yA)));
          }
        }
        c.fillStyle = BLUE[3]; c.fillRect(S2(Math.min(b.x, b.x + b.dir * L)), S2(b.y - 2), S2(L), 2);
      }
    }
    // ---- mist: a few pale drifts hung over it, rising, thinning: dithered dots (the SNES way), sparser as it goes
    if (front && b.mist && u > 0.1 && u < 0.85) {
      const k = (u - 0.1) / 0.75, keep = 0.7 - k * 0.6;
      c.fillStyle = BLUE[3];
      for (let j = 0; j < 4; j++) {
        const mx = b.x + (hsh(b.seed + 60 + j) - 0.5) * b.R * 2.4 + b.dir * b.R * k, my = b.y - b.H * (0.35 + hsh(b.seed + 70 + j) * 0.45) - k * 16;
        const rr = 8 + b.R * 0.3 + k * 10;
        for (let q = 0; q < 14; q++) {
          if (hsh(b.seed + j * 31 + q) > keep) continue;
          const ox = (hsh(b.seed + j * 13 + q * 7) - 0.5) * 2 * rr, oy = (hsh(b.seed + j * 17 + q * 5) - 0.5) * rr;
          c.fillRect(S2(mx + ox), S2(my + oy), 2, 2);
        }
      }
    }
  }
  if (!front || !dn) return;
  // ---- the drops: chunky, in their shades, a short streak behind the fast ones; fading out at the end of their time
  for (let i = 0; i < dn; i++) {
    const x = dx[i], y = dy[i];
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const lf = dlife[i] / dmax[i], s = dsize[i];
    c.globalAlpha = was * (lf > 0.35 ? 1 : lf > 0.18 ? 0.66 : 0.33);
    const px = S2(x), py = S2(y), sh = dshade[i];
    const vy = dvy[i], vx = dvx[i];
    if (vx * vx + vy * vy > 16) { c.fillStyle = BLUE[sh - 1]; c.fillRect(S2(x - vx * 0.8), S2(y - vy * 0.8), Math.max(2, s - 2), Math.max(2, s - 2)); }
    c.fillStyle = BLUE[sh]; c.fillRect(px, py, s, s);
    if (s >= 4) { c.fillStyle = BLUE[4]; c.fillRect(px, py, 2, 2); c.fillStyle = BLUE[sh - 1]; c.fillRect(px + s - 2, py + s - 2, 2, 2); }
  }
  c.globalAlpha = was;
};

// (dev only: the headless checks set one off where they like)
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __wpSplash?: typeof splash }).__wpSplash = splash;
