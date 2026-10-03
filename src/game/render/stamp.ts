// Stamps: a piece of still art (a parked bike, a shopfront, a wrecked car) painted the once into a little canvas of its
// own at the screen's own resolution, then put down every frame after with one drawImage instead of the few hundred
// fills and strokes it takes to paint. Nothing looks any different: it's painted at the scale it's shown at (the
// render scale times whatever the art's scaled by, mirrored or not), on the screen's pixel grid, and put down right
// where the art would've been drawn.
//
// Only for art that doesn't change from frame to frame (anything moving, flickering or tied to the frame count stays
// live, drawn over it), and only where it's put down flat (no rotation, nothing see-through over the lot of it, no
// filter or shadow): otherwise it's just painted as before.

type Ctx = CanvasRenderingContext2D;

/** The drawing state a paint leaves behind (line joins, colours, the font...), which the live art after it may count on. */
interface Leaves { lineCap: CanvasLineCap; lineJoin: CanvasLineJoin; miterLimit: number; lineWidth: number; fillStyle: Ctx['fillStyle']; strokeStyle: Ctx['strokeStyle']; font: string; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline }
const leaves = (g: Ctx): Leaves => ({ lineCap: g.lineCap, lineJoin: g.lineJoin, miterLimit: g.miterLimit, lineWidth: g.lineWidth, fillStyle: g.fillStyle, strokeStyle: g.strokeStyle, font: g.font, textAlign: g.textAlign, textBaseline: g.textBaseline });
interface Stamp { c: HTMLCanvasElement; L: number; T: number; after: Leaves }
/** Most recently used last; the oldest are let go once they add up to more than BUDGET bytes. */
const stamps = new Map<string, Stamp>();
const BUDGET = 48 * 1024 * 1024;
let bytes = 0;
/** Asked for once but not painted yet: a stamp's only painted the second time it's wanted at that scale (a zoom
 * sweeping through scales frame by frame never fills the cache with ones it'll never use again). */
const asked = new Set<string>();
const MAX = 400;

/** Drops every stamp when the stage changes: none of the old ones will be wanted. */
let stampStage: string | null | undefined;
export const stampsForStage = (stageId: string | null | undefined) => {
  if (stageId === stampStage) return;
  stampStage = stageId; stamps.clear(); asked.clear(); bytes = 0;
};

const q = (n: number) => Math.round(n * 4096) / 4096;

/**
 * Puts down the art `paint` draws (in the current coordinates, inside the box x, y, w, h), from a stamp of it.
 * `key` names what it looks like: the same key must always mean the same picture.
 */
export const stamp = (ctx: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => {
  const m = ctx.getTransform();
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || Math.abs(m.a) !== Math.abs(m.d)
    || ctx.globalAlpha !== 1 || ctx.globalCompositeOperation !== 'source-over' || ctx.filter !== 'none' || ctx.shadowBlur !== 0 || ctx.shadowOffsetX !== 0 || ctx.shadowOffsetY !== 0) {
    paint(ctx); return;
  }
  const a = q(m.a), d = q(m.d);
  const id = `${key}@${a},${d}`;
  let s = stamps.get(id);
  if (s) { stamps.delete(id); stamps.set(id, s); }
  else {
    if (!asked.has(id)) { if (asked.size > MAX) asked.clear(); asked.add(id); paint(ctx); return; }
    // (the box in device pixels, from whole pixels: the art lands in the stamp on the same pixel grid it's shown on)
    const L = Math.floor(Math.min(a * x, a * (x + w))) - 1, T = Math.floor(Math.min(d * y, d * (y + h))) - 1;
    const R = Math.ceil(Math.max(a * x, a * (x + w))) + 1, B = Math.ceil(Math.max(d * y, d * (y + h))) + 1;
    const c = document.createElement('canvas'); c.width = Math.max(1, R - L); c.height = Math.max(1, B - T);
    const g = c.getContext('2d')!;
    g.setTransform(a, 0, 0, d, -L, -T);
    // (it starts from the drawing state the live art would've, and leaves the one it would've)
    Object.assign(g, leaves(ctx)); g.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
    paint(g);
    s = { c, L, T, after: leaves(g) };
    stamps.set(id, s);
    bytes += c.width * c.height * 4;
    for (const [oldId, old] of stamps) {
      if (bytes <= BUDGET || oldId === id) break;
      stamps.delete(oldId); bytes -= old.c.width * old.c.height * 4;
    }
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // (painted on whole device pixels; put down where the art itself would've gone, between pixels when the camera is:
  // its edges soften just the way the live art's do there)
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(s.c, s.L + m.e, s.T + m.f);
  ctx.restore();
  Object.assign(ctx, s.after);
};
