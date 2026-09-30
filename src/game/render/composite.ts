// Drawing a detailed sprite under a filter, a shadow or see-through: canvas applies those to every single fill and
// stroke, so a sprite of a few hundred shapes under `brightness(0.4)` is a few hundred filter passes (and overlapping
// shapes show through each other when it's see-through). Instead it's drawn plainly into a scratch canvas and put
// down in one go, with the filter, shadow and alpha applied once to the whole thing. Same picture, a fraction of the work.

type Ctx = CanvasRenderingContext2D;

/** Whether anything's set on the canvas that would be paid for per shape. */
export const needsComposite = (ctx: Ctx) => (!!ctx.filter && ctx.filter !== 'none') || ctx.shadowBlur > 0 || ctx.globalAlpha < 1;

let scratch: HTMLCanvasElement | null = null;
let busy = false;

/**
 * Draws `draw` (in the canvas's current coordinates) into a scratch canvas covering box `b`, then onto `ctx` in one
 * go under whatever filter, shadow and alpha `ctx` has, plus `extra` (a filter to add, a shadow, an alpha to multiply).
 */
export const drawComposited = (
  ctx: Ctx, b: { x: number; y: number; w: number; h: number }, draw: (c: Ctx) => void,
  extra?: { filter?: string; shadowColor?: string; shadowBlur?: number; alpha?: number } | null,
) => {
  if (busy || typeof document === 'undefined') { draw(ctx); return; }
  // (drawn at the resolution it'll be shown at: the current transform's scale, capped)
  const m = ctx.getTransform();
  const k = Math.max(0.5, Math.min(4, Math.hypot(m.a, m.b)));
  const cw = Math.ceil(b.w * k), ch = Math.ceil(b.h * k);
  if (cw <= 0 || ch <= 0) return;
  if (!scratch) scratch = document.createElement('canvas');
  if (scratch.width < cw || scratch.height < ch) { scratch.width = Math.max(scratch.width, cw); scratch.height = Math.max(scratch.height, ch); }
  const s = scratch.getContext('2d')!;
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalAlpha = 1; s.filter = 'none'; s.shadowBlur = 0; s.globalCompositeOperation = 'source-over';
  s.clearRect(0, 0, cw, ch);
  s.setTransform(k, 0, 0, k, -b.x * k, -b.y * k);
  busy = true;
  try { draw(s); } finally { busy = false; }
  ctx.save();
  if (extra?.filter) ctx.filter = ctx.filter && ctx.filter !== 'none' ? `${ctx.filter} ${extra.filter}` : extra.filter;
  if (extra?.shadowBlur) { ctx.shadowBlur = extra.shadowBlur; ctx.shadowColor = extra.shadowColor ?? ctx.shadowColor; }
  if (extra?.alpha !== undefined) ctx.globalAlpha *= extra.alpha;
  ctx.drawImage(scratch, 0, 0, cw, ch, b.x, b.y, b.w, b.h);
  ctx.restore();
};
