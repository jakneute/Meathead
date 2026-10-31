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
/**
 * A tint laid on as he's drawn, not after (setSpriteTint: Meathead 2's space suit whitening him), so another game's
 * armor drawn into him stays its own colours: each piece is drawn through armorSeam, which tints what's been drawn so
 * far and banks it (acc), then banks the piece untinted. endSprite tints what's left and outlines the lot.
 */
let live: { tint: string; bare?: number } | null = null;
let acc: HTMLCanvasElement | null = null;
let accUsed = false;

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
  live = null; accUsed = false;
  const b = body.getContext('2d')!;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, body.width, body.height);
  b.globalAlpha = 1;
  b.filter = 'none';
  b.setTransform(res, 0, 0, res, ORIGIN_X * res, ORIGIN_Y * res);
  eyes = null;
  return b;
};

/**
 * Where his eyes ended up in the sprite (the middle of the pair), however he's posed, turned or tilted: noted as the
 * face is drawn, for putting things over them afterwards (a hazmat hood's visor, soot round them).
 */
let eyes: { x: number; y: number; angle: number; flip: boolean } | null = null;
export const markEyes = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  if (!body || ctx.canvas !== body) return;
  const m = ctx.getTransform();
  const pt = m.transformPoint(new DOMPoint(x, y));
  const flip = m.a * m.d - m.b * m.c < 0;
  // (the tilt of the head: which way its "along" runs, righted when he's facing left)
  const angle = flip ? Math.atan2(-m.b, -m.a) : Math.atan2(m.b, m.a);
  eyes = { x: pt.x, y: pt.y, angle, flip };
};
/** Where his eyes are in the world (the sprite stamped with its feet at (x, y)), or null if the face wasn't drawn. */
export const eyesAt = (x: number, y: number) =>
  eyes ? { x: x + (eyes.x - ORIGIN_X * res) / res, y: y + (eyes.y - ORIGIN_Y * res) / res, angle: eyes.angle } : null;

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

/** Tints him as he's drawn (call straight after beginSprite): what armorSeam draws stays untinted. `bare` as endSprite's. */
export const setSpriteTint = (tint: string, bare?: number) => { if (body) live = { tint, bare }; };

/** Lays the tint over what's in the body canvas (all of it, or not within `bare` of his eyes). */
const tintBody = (tint: string, bare?: number) => {
  const b = body!.getContext('2d')!;
  b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-atop'; b.fillStyle = tint;
  if (bare && eyes) { b.beginPath(); b.rect(0, 0, body!.width, body!.height); b.arc(eyes.x, eyes.y, bare * res, 0, Math.PI * 2); b.fill('evenodd'); }
  else b.fillRect(0, 0, body!.width, body!.height);
  b.restore();
};
/** Moves what's in the body canvas onto the bank (tinted first or not), leaving the body canvas empty. */
const bank = (tinted: boolean) => {
  if (!body || !live) return;
  if (tinted) tintBody(live.tint, live.bare);
  acc = ensure(acc, res);
  const a = acc.getContext('2d')!;
  if (!accUsed) { a.setTransform(1, 0, 0, 1, 0, 0); a.globalCompositeOperation = 'source-over'; a.clearRect(0, 0, acc.width, acc.height); accUsed = true; }
  a.drawImage(body, 0, 0);
  const b = body.getContext('2d')!;
  b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, body.width, body.height); b.restore();
};
/** Draws a piece of armor into him, kept out of a tint laid on as he's drawn (setSpriteTint); otherwise just draws it. */
export const armorSeam = (ctx: CanvasRenderingContext2D, draw: () => void) => {
  if (!live || !body || ctx.canvas !== body) { draw(); return; }
  bank(true); draw(); bank(false);
};

/** Outlines what was drawn since beginSprite and draws it into the world with its feet at (x, y). */
/** `tint`: a colour laid over the body (not the outline), keeping its shading under it (a hazmat suit, say). */
/**
 * `under`: drawn into the world first, under the character, given its dark silhouette (the outline's, before anything
 * else goes on it) and the rect it's drawn in about the feet (a shadow of whatever pose it's in, for nothing extra).
 */
/** `bare`: the tint left off within this far of his eyes (his face, through a space helmet's glass). */
export const endSprite = (world: CanvasRenderingContext2D, x: number, y: number, tint?: string, under?: (sil: { img: CanvasImageSource; x: number; y: number; w: number; h: number }) => void, bare?: number) => {
  if (!body || !out) return;
  const o = out.getContext('2d')!;
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = 'source-over';
  o.clearRect(0, 0, out.width, out.height);
  // (tinted as he was drawn: the rest tinted, the bank put back under it as the body)
  if (live) {
    if (accUsed && acc) {
      tintBody(live.tint, live.bare);
      const b = body.getContext('2d')!;
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'destination-over'; b.drawImage(acc, 0, 0); b.restore();
      tint = undefined;
    } else { tint = live.tint; bare = live.bare; }
    live = null;
  }
  const d = OUTLINE_PX * res;
  // Outline silhouette first (on its own), then glows behind it, then the body on top
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    o.drawImage(body, Math.cos(a) * d, Math.sin(a) * d);
  }
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = OUTLINE;
  o.fillRect(0, 0, out.width, out.height);
  under?.({ img: out, x: -ORIGIN_X, y: -ORIGIN_Y, w: W, h: H });
  if (glowUsed && glow) {
    o.globalCompositeOperation = 'destination-over';
    o.drawImage(glow, 0, 0);
  }
  o.globalCompositeOperation = 'source-over';
  // (the body tinted on its own canvas, then over the outline)
  if (tint) tintBody(tint, bare);
  o.drawImage(body, 0, 0);
  world.drawImage(out, x - ORIGIN_X, y - ORIGIN_Y, W, H);
};
