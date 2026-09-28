// Draws a character into an offscreen sprite so it can get a dark cartoon
// outline all the way round its silhouette, then stamps it back into the world.
//
//   const body = beginSprite(ctx);          // an offscreen context, origin at the feet
//   ...draw the character around (0, 0)...
//   endSprite(ctx, feetX, feetY);           // outline + composite (uses ctx's alpha/filter)
//
// Soft glows go on a separate layer (glowLayer) behind the outline, so they
// don't pick up a dark rim.

const W = 240, H = 230;
const ORIGIN_X = 120, ORIGIN_Y = 155;   // feet; room for effects above, behind and below
const OUTLINE = '#140c07';
const OUTLINE_PX = 1.25;

let body: HTMLCanvasElement | null = null;
let glow: HTMLCanvasElement | null = null;
let glowUsed = false;
let out: HTMLCanvasElement | null = null;
let res = 1;

const ensure = (canvas: HTMLCanvasElement | null, r: number) => {
  const c = canvas ?? document.createElement('canvas');
  if (c.width !== W * r || c.height !== H * r) { c.width = W * r; c.height = H * r; }
  return c;
};

/**
 * Returns an offscreen context with (0,0) at the character's feet, or null
 * where there's no DOM (then draw straight into the world instead).
 * Resolution follows the world's zoom so close-ups stay crisp.
 */
export const beginSprite = (world: CanvasRenderingContext2D): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') return null;
  const m = world.getTransform();
  res = Math.max(1, Math.min(5, Math.ceil(Math.hypot(m.a, m.b) * 2) / 2));
  body = ensure(body, res);
  out = ensure(out, res);
  glow = ensure(glow, res);
  glowUsed = false;
  const b = body.getContext('2d')!;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, body.width, body.height);
  b.globalAlpha = 1;
  b.filter = 'none';
  b.setTransform(res, 0, 0, res, ORIGIN_X * res, ORIGIN_Y * res);
  return b;
};

/**
 * Where to draw a soft glow: the sprite's glow layer (with the caller's current
 * transform), or `ctx` itself when it isn't drawing into the sprite.
 */
export const glowLayer = (ctx: CanvasRenderingContext2D): CanvasRenderingContext2D => {
  if (!body || !glow || ctx.canvas !== body) return ctx;
  const g = glow.getContext('2d')!;
  if (!glowUsed) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, glow.width, glow.height);
    glowUsed = true;
  }
  g.setTransform(ctx.getTransform());
  g.globalAlpha = ctx.globalAlpha;
  return g;
};

/** Outlines what was drawn since beginSprite and draws it into the world with its feet at (x, y). */
export const endSprite = (world: CanvasRenderingContext2D, x: number, y: number) => {
  if (!body || !out) return;
  const o = out.getContext('2d')!;
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over';
  o.clearRect(0, 0, out.width, out.height);
  const d = OUTLINE_PX * res;
  // Outline silhouette first (on its own), then glows behind it, then the body on top
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    o.drawImage(body, Math.cos(a) * d, Math.sin(a) * d);
  }
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = OUTLINE;
  o.fillRect(0, 0, out.width, out.height);
  if (glowUsed && glow) {
    o.globalCompositeOperation = 'destination-over';
    o.drawImage(glow, 0, 0);
  }
  o.globalCompositeOperation = 'source-over';
  o.drawImage(body, 0, 0);
  world.drawImage(out, x - ORIGIN_X, y - ORIGIN_Y, W, H);
};
