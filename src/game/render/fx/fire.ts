// Fire, the one way: painted small and blown up chunky (every pixel of it 2x2, like the backdrops), in the ramp a
// 16-bit fire has (deep red at the edges through orange and yellow to a near-white heart), tongues that lick up and
// split and gutter each on its own clock, sparks spitting off the top, a glow behind, smoke rolling off. Feet of the
// fire at (x, y): `w` wide, `h` tall at its tallest; `f` the frame; `seed` keeps neighbouring fires out of step.

import { steppedGlow, pixelBlob } from '../pixelArt';

type Ctx = CanvasRenderingContext2D;

export interface FireOpts {
  seed?: number;
  /** Smoke rolling up off it (and how dark). */
  smoke?: number;
  /** Sparks spitting off the top. */
  sparks?: boolean;
  /** The glow behind it (0 none). */
  glow?: number;
  /** 0..1: how much it's going (a fire dying down, or catching). */
  k?: number;
}

const RAMP = ['#7F1D1D', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FEF9C3'];
const PX = 2;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

let buf: HTMLCanvasElement | null = null;
const bufFor = (w: number, h: number) => {
  if (typeof document === 'undefined') return null;
  if (!buf) buf = document.createElement('canvas');
  if (buf.width < w + 2) buf.width = w + 2;
  if (buf.height < h + 2) buf.height = h + 2;
  return buf;
};

/** One tongue of flame (in the small canvas): base centre (bx, by), half-width hw at the base, height th, leaning. */
const tongue = (g: Ctx, bx: number, by: number, hw: number, th: number, lean: number) => {
  g.beginPath();
  g.moveTo(bx - hw, by);
  g.bezierCurveTo(bx - hw * 1.1, by - th * 0.45, bx - hw * 0.3 + lean * 0.5, by - th * 0.7, bx + lean, by - th);
  g.bezierCurveTo(bx + hw * 0.4 + lean * 0.5, by - th * 0.65, bx + hw * 1.1, by - th * 0.4, bx + hw, by);
  g.closePath(); g.fill();
};

export const drawFire = (ctx: Ctx, x: number, y: number, w: number, h: number, f: number, o: FireOpts = {}) => {
  const seed = o.seed ?? Math.floor(x * 0.37), k = o.k ?? 1;
  if (k <= 0.02 || w < 2 || h < 2) return;
  const H = h * k;
  // The glow behind it
  if ((o.glow ?? 1) > 0) steppedGlow(ctx, x, y - H * 0.35, Math.max(w * 0.7, H * 0.8), '#F97316', 0.2 * (o.glow ?? 1) * k, 0, 4);
  // Smoke rolling up off it
  if (o.smoke) for (let i = 0; i < 4; i++) {
    const t = ((f * 0.9 + i * 30 + seed * 7) % 120) / 120;
    pixelBlob(ctx, x + Math.sin(t * 4 + i + seed) * w * 0.3, y - H * 0.8 - t * H * 2.2, w * 0.25 + t * w * 0.35, w * 0.18 + t * w * 0.2, `rgba(41, 37, 36, ${(o.smoke * 0.55 * (1 - t) * k).toFixed(3)})`);
  }
  // The flames, painted at half size
  const pad = 8, cw = Math.ceil((w + pad * 2) / PX), ch = Math.ceil((H * 1.15 + pad) / PX);
  const c = bufFor(cw, ch);
  if (!c) return;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, cw + 2, ch + 2); // (and a pixel past it: a turned blit samples over its edge)
  const n = Math.max(2, Math.round(w / 24)), base = ch - 1, sw = w / PX;
  // (each layer, outermost first: every tongue in it, smaller and shorter the hotter the layer)
  const layers = [[1, 1], [0.86, 0.9], [0.68, 0.74], [0.5, 0.56], [0.3, 0.36], [0.14, 0.18]];
  layers.forEach(([ws, hs], li) => {
    g.fillStyle = RAMP[li];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const mid = Math.abs(u - 0.5) * 2;
      const flick = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(f * (0.21 + hash(seed + i) * 0.17) + i * 1.9 + seed)) * (0.7 + 0.3 * Math.sin(f * 0.53 + i * 3.1));
      const th = (H / PX) * (1 - mid * 0.35) * flick * hs;
      const bx = pad / PX + (sw * 0.08) + u * sw * 0.84 + Math.sin(f * 0.13 + i) * 0.6;
      const hw = (sw / n) * 1.05 * ws + 1;
      const lean = Math.sin(f * 0.09 + i * 1.3 + seed) * th * 0.18;
      tongue(g, bx, base, hw, th, lean);
    }
    // (a solid bed under them, so the tongues stand on a body of fire, not on nothing)
    if (li < 4) { g.beginPath(); g.ellipse(pad / PX + sw / 2, base, sw * 0.5 * (1 - li * 0.12), (H / PX) * 0.12 * (1 - li * 0.2), 0, Math.PI, 0); g.fill(); }
  });
  // (licks breaking off the tips and going up on their own)
  for (let i = 0; i < n; i++) {
    const t = ((f * 1.6 + hash(seed + i * 5) * 60) % 30) / 30;
    if (t > 0.7) continue;
    const bx = pad / PX + sw * 0.15 + hash(seed + i) * sw * 0.7, by = base - (H / PX) * (0.75 + t * 0.4);
    g.fillStyle = RAMP[t < 0.35 ? 3 : 2]; g.fillRect(Math.round(bx), Math.round(by), 2, 3 - Math.round(t * 2));
  }
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, 0, 0, cw, ch, Math.round(x - w / 2 - pad), Math.round(y - ch * PX), cw * PX, ch * PX);
  ctx.imageSmoothingEnabled = prev;
  // Sparks spitting off the top
  if (o.sparks !== false) for (let i = 0; i < Math.max(2, n); i++) {
    const t = ((f * (1.1 + hash(seed + i) * 0.8) + hash(seed + i * 3) * 90) % 90) / 90;
    const sx = x + (hash(seed + i * 7) - 0.5) * w + Math.sin(t * 6 + i) * 8, sy = y - H * (0.6 + t * 1.4);
    ctx.fillStyle = t < 0.5 ? '#FDE047' : '#F97316';
    if ((f + i) % 6 < 5) ctx.fillRect(Math.round(sx / PX) * PX, Math.round(sy / PX) * PX, PX, PX);
  }
};
