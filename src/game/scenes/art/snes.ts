// The cutscenes' 16-bit look: forms shaded in stepped colour ramps (four to seven
// shades of a thing, not two), the steps broken up with an ordered dither just
// where they meet (not all over), the way the SNES did it; banded gradients for skies, walls and
// light falling off (its HDMA trick). Shapes are shaded pixel by pixel once and
// cached, then just blitted every frame.

type Ctx = CanvasRenderingContext2D;

/** Colour ramps, darkest to lightest. */
export const RAMP = {
  // Meathead's skin, his hair
  mSkin: ['#3e220e', '#6a3e1c', '#955a2a', '#bb7b3e', '#d69c5c', '#e8b87c', '#f6d4a4', '#fde8c8'],
  mHair: ['#020202', '#0c0c0e', '#18181c', '#26262c', '#3a3a44'],
  // The President's skin (a tan out of a can), his hair
  tSkin: ['#6e2808', '#a4420e', '#cc5e1a', '#e8782a', '#f8944a', '#fcb070', '#fdd0a0'],
  tHair: ['#7a5a08', '#b88c08', '#d8a800', '#ecc440', '#f8d878', '#fcf0b0'],
  // The agents: skin, black suit, white shirt
  aSkin: ['#5a3c26', '#80583c', '#a47a58', '#c49a74', '#e0bc96', '#f4d8b8'],
  aSuit: ['#010102', '#060609', '#0e0e14', '#18181f', '#26262f', '#383844'],
  shirt: ['#7c808c', '#a4a8b4', '#c8ccd4', '#e4e6ec', '#fafaff'],
  // Navy (his suit), red (the tie), gold
  navy: ['#04041a', '#0a0a2c', '#141444', '#1e1e5c', '#2c2c78', '#40409a'],
  red: ['#3c0400', '#6c0c04', '#9c1a0a', '#c82814', '#e84a2c', '#fc7c5c'],
  gold: ['#5c3c00', '#8c6000', '#c08c00', '#e8b400', '#f8d440', '#fcf0a0'],
  // The press room's curtain
  curtain: ['#00001c', '#000044', '#000078', '#0010b0', '#1c3ce0', '#3c70fc', '#7cacfc'],
  steel: ['#1c1f24', '#3a3f48', '#5c636e', '#868e9a', '#b6bec8', '#e8eef4'],
  wood: ['#2c1204', '#4c2008', '#72340c', '#9a4c14', '#c06c24', '#dc9044'],
};

/** A 4x4 ordered dither (0..1 thresholds). */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16 - 0.5);

const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

const cache = new Map<string, HTMLCanvasElement>();

/**
 * A shape w x h, shaded in `ramp`: `light(u, v)` (u, v 0..1 across it) gives how lit that pixel is (0..1), or anything
 * below zero where the shape isn't. Stepped to the ramp's shades, dithered where they meet. Drawn once, cached by `key`.
 */
export const shaded = (ctx: Ctx, key: string, x: number, y: number, w: number, h: number, ramp: string[], light: (u: number, v: number) => number) => {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  const k = `${key}|${w}x${h}`;
  let c = cache.get(k);
  if (!c) {
    c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d')!;
    const img = g.createImageData(w, h);
    const cols = ramp.map(rgb), n = cols.length;
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const l = light((px + 0.5) / w, (py + 0.5) / h);
      if (l < 0) continue;
      const i = Math.max(0, Math.min(n - 1, Math.round(Math.min(1, l) * (n - 1) + BAYER[(py & 3) * 4 + (px & 3)] * 0.5)));
      const o = (py * w + px) * 4, cc = cols[i];
      img.data[o] = cc[0]; img.data[o + 1] = cc[1]; img.data[o + 2] = cc[2]; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    cache.set(k, c);
  }
  ctx.drawImage(c, Math.round(x), Math.round(y));
};

/** A whole picture drawn once (the static part of a background) and reused. */
export const layer = (ctx: Ctx, key: string, w: number, h: number, draw: (g: Ctx) => void) => {
  const k = `layer|${key}`;
  let c = cache.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!); cache.set(k, c); }
  ctx.drawImage(c, 0, 0);
};

/** The light off a round form (a ball, a bicep, a head), lit from up and to the left; `amb` the least it gets. */
export const ball = (lx = -0.45, ly = -0.6, amb = 0.12) => {
  const lz = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly));
  return (u: number, v: number) => {
    const nx = u * 2 - 1, ny = v * 2 - 1, d = nx * nx + ny * ny;
    if (d > 1) return -1;
    const nz = Math.sqrt(1 - d);
    return amb + (1 - amb) * Math.max(0, nx * lx + ny * ly + nz * lz);
  };
};

/** The light off a box-ish form with rounded sides (a square head, a torso): round across, flatter down it. */
export const box = (lx = -0.5, ly = -0.35, amb = 0.15, roundX = 1, roundY = 0.45) => {
  const lz = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly));
  return (u: number, v: number) => {
    const nx = (u * 2 - 1) * roundX * Math.abs(u * 2 - 1) ** 0.6, ny = (v * 2 - 1) * roundY * Math.abs(v * 2 - 1) ** 0.6;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return amb + (1 - amb) * Math.max(0, nx * lx + ny * ly + nz * lz);
  };
};

/** Bands of colour down (or across) a rect: a sky, a wall darkening away from a light. */
export const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, ramp: string[], vertical = true) => {
  const n = ramp.length;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = ramp[i];
    if (vertical) { const y1 = Math.round(y + (h * i) / n), y2 = Math.round(y + (h * (i + 1)) / n); ctx.fillRect(Math.round(x), y1, Math.round(w), y2 - y1); }
    else { const x1 = Math.round(x + (w * i) / n), x2 = Math.round(x + (w * (i + 1)) / n); ctx.fillRect(x1, Math.round(y), x2 - x1, Math.round(h)); }
  }
};
