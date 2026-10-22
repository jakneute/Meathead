// Draws the wall-splatted (see game/enemies/wallSplatDeath.ts), as pixel art: an irregular splat of him on the wall
// where he hit (a stepped ramp from a near-black rim through the reds to a bright wet core, its edges dithered, ragged,
// stretched along the wall and running long at the bottom), a spray of droplets thrown out from it along the wall (little
// tadpoles, tails pointing back at the hit), lumps of him and a bit of bone stuck in it, a wet glint. That much never
// changes: it's painted the once, cell by cell, into a little picture of its own and put down whole after (no arcs every
// frame). Live on top: the goo running down the wall from it (a column of it, thickest where it leaves, slowing, a bead on
// the end), the meat sliding down after, and the pool spreading at the foot.

import type { EnemyDeath } from '../../enemies/deaths';
import { WALLSPLAT_FRAMES, WALLSPLAT_FADE, type WallSplat } from '../../enemies/wallSplatDeath';

type Ctx = CanvasRenderingContext2D;

// (the ramp, dark to bright, and the wet highlight)
const RAMP = ['#1E0303', '#3F0707', '#6B0B0B', '#8E1111', '#B01818', '#D42424'];
const WET = '#F87171', GLINT = '#FFE4E1';
const MEAT = ['#B45353', '#E89A9A', '#8F2D2D'];
const BONE = '#E8DCC8', BONE_SH = '#A89F8C';

const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** 4×4 ordered dither threshold, 0..1. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

const rgb = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const RGB = new Map<string, number[]>();
const toRgb = (hex: string) => { let v = RGB.get(hex); if (!v) { v = rgb(hex); RGB.set(hex, v); } return v; };

interface Baked { c: HTMLCanvasElement; ox: number; oy: number }
const baked = new WeakMap<WallSplat, Baked>();

/** Paints the splat the once: its picture, and where its top-left corner goes (world). */
const bake = (ws: WallSplat): Baked | null => {
  if (typeof document === 'undefined') return null;
  const { side, r, seed } = ws;
  const spray = Math.max(0.6, Math.min(1.6, ws.speed / 16));
  const R = Math.ceil(r * (1.6 + spray * 0.5)) + 4;
  const W = R * 2, H = R * 2 + Math.ceil(r * 0.5);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) return null;
  const img = g.createImageData(W, H), px = img.data;
  const put = (x: number, y: number, hex: string) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const [rr, gg, bb] = toRgb(hex), i = (y * W + x) * 4;
    px[i] = rr; px[i + 1] = gg; px[i + 2] = bb; px[i + 3] = 255;
  };
  const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && px[(y * W + x) * 4 + 3] > 0;
  // (the splat's middle: a little into the wall from its face)
  const cx = R - side * r * 0.25, cy = R;
  // Its outline: lumpy (a few slow waves round it), a spike out here and there, flattest against the wall, longer down
  const ph = [h01(seed) * 6.28, h01(seed + 1) * 6.28, h01(seed + 2) * 6.28];
  const radius = (a: number) => {
    const into = -Math.cos(a) * side > 0;
    let k = 0.86 + 0.09 * Math.sin(a * 3 + ph[0]) + 0.07 * Math.sin(a * 5 + ph[1]) + 0.05 * Math.sin(a * 8 + ph[2]);
    // (spikes: thrown out along the wall, mostly)
    const sp = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 22);
    if (h01(seed + sp * 3.1) > 0.7) k += 0.25 + h01(seed + sp) * 0.35 * spray;
    const down = Math.sin(a) > 0 ? 1 + Math.sin(a) * 0.22 : 1;
    return r * k * down * (into ? 1 : 0.45);
  };
  // The body of it: a stepped ramp by how far in from its edge, dithered between the steps, a ragged dark rim
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / 0.95;
    const d = Math.hypot(dx, dy) / radius(Math.atan2(dy, dx));
    const jit = (h01(seed + x * 13.7 + y * 7.3) - 0.5) * 0.08;
    const v = d + jit + (bayer(x, y) - 0.5) * 0.14;
    if (v > 1.07) continue;
    // (lit from above and away from the wall: the bright core sits up and out)
    const lx = dx + side * r * 0.12, ly = dy + r * 0.18;
    const core = Math.hypot(lx, ly) / Math.max(1, r);
    let i: number;
    if (v > 0.99) i = 0;
    else if (v > 0.86) i = 1;
    else if (v > 0.66) i = 2;
    else i = core + (bayer(x, y) - 0.5) * 0.18 < 0.22 ? 5 : core + (bayer(x, y) - 0.5) * 0.18 < 0.42 ? 4 : 3;
    put(x, y, RAMP[i]);
  }
  // The spray: droplets thrown out along the wall from it, tails pointing back at the hit, a few out into the air
  const nDrops = Math.round(10 + 10 * spray);
  for (let k = 0; k < nDrops; k++) {
    const up = h01(seed + k * 4.7) < 0.5 ? -1 : 1;
    // (along the wall, up or down, fanned; one in five off at an angle out from it)
    const off = (h01(seed + k * 2.3) - 0.5) * (h01(seed + k * 6.1) < 0.2 ? 2.6 : 1.4);
    const a = up * Math.PI / 2 + off * -side * up;
    const dist = r * (1.0 + h01(seed + k * 5.9) * (0.7 + spray * 0.5));
    const ux = Math.cos(a), uy = Math.sin(a);
    const x = cx + ux * dist, y = cy + uy * dist;
    const s = h01(seed + k * 8.3) < 0.3 ? 2 : 1;
    // (the tail, back toward the splat, thinning)
    const tail = Math.round(1 + h01(seed + k * 3.7) * 4 * spray);
    for (let t = 1; t <= tail; t++) put(x - ux * (s + t), y - uy * (s + t), t < tail ? RAMP[2] : RAMP[1]);
    for (let yy = -s; yy <= s; yy++) for (let xx = -s; xx <= s; xx++) {
      if (s === 2 && Math.abs(xx) + Math.abs(yy) > 3) continue;
      const edge = Math.abs(xx) === s || Math.abs(yy) === s;
      put(x + xx, y + yy, s === 1 ? (xx || yy ? RAMP[1] : RAMP[3]) : edge ? RAMP[1] : RAMP[3]);
    }
    if (s === 2) put(x - 1, y - 1, RAMP[5]);
  }
  // Lumps of him stuck in it (meat, fat), a bit of bone
  const lumps = 3 + Math.floor(h01(seed + 9) * 2);
  for (let k = 0; k < lumps; k++) {
    const a = h01(seed + k * 7.7) * Math.PI * 2, dist = r * 0.55 * h01(seed + k * 3.3);
    const lx = Math.round(cx + Math.cos(a) * dist * (Math.cos(a) * side > 0 ? 0.4 : 1)), ly = Math.round(cy + Math.sin(a) * dist);
    const bone = k === lumps - 1;
    const w = bone ? 4 + Math.round(h01(seed + k) * 2) : 2 + Math.round(h01(seed + k) * 3), h = bone ? 2 : 2 + Math.round(h01(seed + k * 1.9) * 2);
    for (let yy = -1; yy <= h; yy++) for (let xx = -1; xx <= w; xx++) {
      const rim = yy < 0 || xx < 0 || yy === h || xx === w;
      // (corners off: lumpy, not boxes)
      if ((xx < 0 || xx === w) && (yy < 0 || yy === h)) continue;
      put(lx + xx, ly + yy, rim ? RAMP[0] : bone ? (yy === h - 1 ? BONE_SH : BONE) : yy === h - 1 ? MEAT[2] : MEAT[k % 2]);
    }
    put(lx, ly, bone ? '#FFFFFF' : WET);
  }
  // The wet: a few glints across its top, a bright pick of light near the core
  for (let k = 0; k < 7; k++) {
    const x = Math.round(cx - side * r * 0.15 + (h01(seed + k * 9.1) - 0.5) * r * 1.1), y = Math.round(cy - r * 0.25 + (h01(seed + k * 6.7) - 0.5) * r * 0.7);
    if (!filled(x, y) || !filled(x, y + 1)) continue;
    put(x, y, WET); if (k % 2) put(x, y + 1, RAMP[5]);
  }
  put(Math.round(cx - side * 3), Math.round(cy - r * 0.32), GLINT);
  put(Math.round(cx - side * 3) + 1, Math.round(cy - r * 0.32), WET);
  g.putImageData(img, 0, 0);
  return { c, ox: ws.wx - R, oy: ws.cy - R };
};

/** A run down the wall from `top`, `L` long: a column of goo (dark either side, the red, a lit line down it, wet
 *  flecks), widest where it leaves the splat, and the bead swelling on the end. */
const run = (ctx: Ctx, x: number, top: number, L: number, w: number, seed: number, t: number) => {
  x = Math.round(x); top = Math.round(top); L = Math.round(L);
  const x0 = x - Math.floor(w / 2);
  ctx.fillStyle = RAMP[0]; ctx.fillRect(x0 - 1, top, w + 2, L);
  ctx.fillStyle = RAMP[3]; ctx.fillRect(x0, top, w, L);
  // (it narrows a pixel on the way down, past the first stretch)
  if (L > 14 && w > 2) { ctx.fillStyle = RAMP[0]; ctx.fillRect(x0 + w - 1, top + Math.round(L * 0.55), 1, L - Math.round(L * 0.55)); }
  ctx.fillStyle = RAMP[4]; ctx.fillRect(x0, top, 1, L);
  ctx.fillStyle = WET;
  for (let y = 4; y < L - 3; y += 5 + Math.floor(h01(seed + y) * 6)) ctx.fillRect(x0, top + y, 1, 1);
  // (the bead: swelling and settling as it hangs)
  const swell = (Math.sin(t * 0.06 + seed) + 1) * 0.5 > 0.5 ? 1 : 0;
  const bw = w + 2 + swell, by = top + L;
  ctx.fillStyle = RAMP[0]; ctx.fillRect(x0 - 1 - Math.floor(swell / 2) , by - 1, bw, 3 + swell); ctx.fillRect(x0, by + 2 + swell, w, 1);
  ctx.fillStyle = RAMP[3]; ctx.fillRect(x0 - Math.floor(swell / 2), by - 1, bw - 2, 2 + swell);
  ctx.fillStyle = WET; ctx.fillRect(x0, by - 1, 1, 1);
};

export const drawWallSplat = (ctx: Ctx, d: EnemyDeath) => {
  const ws = d.ws;
  if (!ws) return;
  const { wx, side, cy, r } = ws;
  const t = d.t;
  ctx.globalAlpha = Math.max(0, Math.min(1, (WALLSPLAT_FRAMES - t) / WALLSPLAT_FADE));
  const bottom = ws.foot ?? cy + 260;
  const ox = wx - side * r * 0.25;

  // The pool at the foot, spreading as the runs get there: a flat stepped puddle
  if (ws.foot !== null) {
    const arrived = ws.runs.filter(rn => (t - rn.start) * rn.speed >= rn.max - 1).length;
    const pw = Math.round(Math.min(r * 2.2, arrived * r * 0.35 + Math.max(0, t - 200) * 0.03));
    if (pw > 3) {
      const px = Math.round(wx - side * r * 0.3 - pw / 2), py = Math.round(ws.foot);
      ctx.fillStyle = RAMP[0]; ctx.fillRect(px + 2, py - 3, pw - 4, 1); ctx.fillRect(px, py - 2, pw, 2);
      ctx.fillStyle = RAMP[2]; ctx.fillRect(px + 2, py - 2, pw - 4, 1);
      ctx.fillStyle = RAMP[3]; ctx.fillRect(px + 3, py - 2, Math.max(1, pw - 8), 1);
      ctx.fillStyle = WET; ctx.fillRect(px + Math.round(pw * 0.3), py - 2, Math.max(1, Math.round(pw * 0.15)), 1);
    }
  }

  // The runs down the wall (under the splat: they come out of it)
  for (const rn of ws.runs) {
    const p = Math.min(1, Math.max(0, (t - rn.start) * rn.speed) / rn.max);
    // (quick off the splat, slowing as it goes, stopped at the end)
    const L = rn.max * (1 - (1 - p) * (1 - p));
    if (L < 2) continue;
    run(ctx, wx + rn.dx, cy + rn.top - 2, L, Math.max(2, Math.min(5, Math.round(rn.w * 0.55))), rn.seed, t);
  }

  // The splat itself (painted the once): bursting out to its size over its first few frames
  let b = baked.get(ws);
  if (!b) { const nb = bake(ws); if (nb) { b = nb; baked.set(ws, nb); } }
  if (b) {
    const grow = Math.min(1, 0.5 + t / 10);
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    if (grow >= 1) ctx.drawImage(b.c, Math.round(b.ox), Math.round(b.oy));
    else {
      const w = b.c.width * grow, h = b.c.height * grow, ax = ox + (b.ox - ox) * grow, ay = cy + (b.oy - cy) * grow;
      ctx.drawImage(b.c, Math.round(ax), Math.round(ay), Math.round(w), Math.round(h));
    }
    ctx.imageSmoothingEnabled = sm;
  }

  // The meat sliding down after the runs, on smears of its own
  for (const ch of ws.chunks) {
    const s = Math.max(2, Math.round(ch.r)), x = Math.round(ch.x - s / 2);
    const y = Math.round(Math.min(ch.y, bottom - ch.r) - s / 2);
    if (ch.y > ch.y0 + 2) {
      ctx.fillStyle = RAMP[2]; ctx.fillRect(x + 1, Math.round(ch.y0), Math.max(1, s - 2), y - Math.round(ch.y0));
      ctx.fillStyle = RAMP[1]; ctx.fillRect(x, Math.round(ch.y0), 1, y - Math.round(ch.y0));
    }
    ctx.fillStyle = RAMP[0]; ctx.fillRect(x - 1, y, s + 2, s); ctx.fillRect(x, y - 1, s, s + 2);
    ctx.fillStyle = ch.col; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = MEAT[2]; ctx.fillRect(x, y + s - 1, s, 1);
    ctx.fillStyle = WET; ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
};
