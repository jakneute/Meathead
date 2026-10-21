// Stamps: a piece of still art (a parked bike, a shopfront, a wrecked car) painted the once into a little canvas of its
// own at the screen's own resolution, then put down every frame after with one drawImage instead of the few hundred
// fills and strokes it takes to paint. Nothing looks any different: it's painted at the scale it's shown at (the
// render scale times whatever the art's scaled by, mirrored or not), on the screen's pixel grid, and put down right
// where the art would've been drawn.
//
// Only for art that doesn't change from frame to frame (anything moving, flickering or tied to the frame count stays
// live, drawn over it), and only where it's put down flat (no rotation, no blend mode, no
// filter or shadow): otherwise it's just painted as before.

type Ctx = CanvasRenderingContext2D;

/** The drawing state a paint leaves behind (line joins, colours, the font...), which the live art after it may count on. */
interface Leaves { globalAlpha: number; lineCap: CanvasLineCap; lineJoin: CanvasLineJoin; miterLimit: number; lineWidth: number; fillStyle: Ctx['fillStyle']; strokeStyle: Ctx['strokeStyle']; font: string; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline }
const leaves = (g: Ctx): Leaves => ({ globalAlpha: g.globalAlpha, lineCap: g.lineCap, lineJoin: g.lineJoin, miterLimit: g.miterLimit, lineWidth: g.lineWidth, fillStyle: g.fillStyle, strokeStyle: g.strokeStyle, font: g.font, textAlign: g.textAlign, textBaseline: g.textBaseline });
interface Stamp { c: HTMLCanvasElement; L: number; T: number; after: Leaves }
/** Most recently used last; the oldest are let go once they add up to more than BUDGET bytes. */
const stamps = new Map<string, Stamp>();
// (a busy stretch of Adventure Land wants ~100 MB of them at once: under that, the whole lot is let go and painted
// again every frame, and the frame rate goes through the floor. Twice that, so only stamps from somewhere else go)
const BUDGET = 320 * 1024 * 1024;
let bytes = 0;
/** Asked for once but not painted yet: a stamp's only painted the second time it's wanted at that scale (a zoom
 * sweeping through scales frame by frame never fills the cache with ones it'll never use again). */
const asked = new Set<string>();
const MAX = 400;
/** Each picture's newest stamp, whatever scale it was painted at: while the scale's sweeping (a zoom), that one's put
 *  down scaled (smoothed) rather than the whole thing painted afresh every frame (slow, and the dithering crawls). */
const latest = new Map<string, { s: Stamp; a: number; d: number }>();

/** Drops every stamp when the stage changes: none of the old ones will be wanted. */
let stampStage: string | null | undefined;
export const stampsForStage = (stageId: string | null | undefined) => {
  if (stageId === stampStage) return;
  stampStage = stageId; stamps.clear(); asked.clear(); latest.clear(); bytes = 0;
};

const q = (n: number) => Math.round(n * 4096) / 4096;
/** Inside a stamp's paint (how deep). */
let painting = 0;

/**
 * Paints `paint` into the stamp `g` (L, T its device box; cw × ch its size) at scale a, d. At a scale that isn't a
 * whole number of device pixels to the art's pixel (art pushed back in depth, a zoom), filled cells don't end on whole
 * pixels: where two meet, both half-cover the pixel between and the backdrop shows through, a seam down every column
 * (and it crawls as the scale changes). So it's painted at the next whole scale up, where every cell lands on whole
 * pixels, and brought down to this one, smoothed: no seams, the edges soft just as the live art's are.
 */
const paintClean = (g: Ctx, ctx: Ctx, a: number, d: number, L: number, T: number, cw: number, ch: number, paint: (g: Ctx) => void): Leaves => {
  const A = Math.abs(a), S = Math.max(1, Math.ceil(A - 1e-3)), k = S / A;
  Object.assign(g, leaves(ctx)); g.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  if (Math.abs(A - Math.round(A)) < 1e-3 || k > 4 || cw * ch * k * k > 4096 * 4096) {
    g.setTransform(a, 0, 0, d, -L, -T); paint(g); return leaves(g);
  }
  // (the big one's own origin on a whole pixel, so the art's cells land on whole pixels there)
  const oL = Math.round(L * k), oT = Math.round(T * k);
  const big = document.createElement('canvas'); big.width = Math.ceil(cw * k) + 1; big.height = Math.ceil(ch * k) + 1;
  const bg = big.getContext('2d')!;
  Object.assign(bg, leaves(ctx)); bg.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  bg.setTransform(a * k, 0, 0, d * k, -oL, -oT);
  paint(bg);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(big, oL / k - L, oT / k - T, big.width / k, big.height / k);
  g.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  return leaves(bg);
};

/**
 * Puts down the art `paint` draws (in the current coordinates, inside the box x, y, w, h), from a stamp of it.
 * `key` names what it looks like: the same key must always mean the same picture.
 */
export const stamp = (ctx: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => {
  // (a stamp asked for while another's being painted (a sign on a painted shopfront): just painted into that one)
  if (painting > 0) { paint(ctx); return; }
  const m = ctx.getTransform();
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || Math.abs(m.a) !== Math.abs(m.d)
    || ctx.globalCompositeOperation !== 'source-over' || ctx.filter !== 'none' || ctx.shadowBlur !== 0 || ctx.shadowOffsetX !== 0 || ctx.shadowOffsetY !== 0) {
    paint(ctx); return;
  }
  // (see-through art too: painted into the stamp at the same alpha, so it's the same pixels the live art would leave,
  // then put down opaque; keyed by its alpha (stepped), and it leaves the alpha the live art would've)
  const al = Math.round(ctx.globalAlpha * 64) / 64;
  const a = q(m.a), d = q(m.d), lk = al === 1 ? key : `${key}~${al}`;
  const id = `${lk}@${a},${d}`;
  let s = stamps.get(id);
  if (s) { stamps.delete(id); stamps.set(id, s); }
  else {
    const l = latest.get(lk);
    const near = !!l && Math.sign(l.a) === Math.sign(a) && Math.sign(l.d) === Math.sign(d);
    if (!asked.has(id)) {
      if (asked.size > MAX) asked.clear(); asked.add(id);
      // (a new scale (a zoom sweeping through them): the one it was last painted at, scaled to this, if it's near
      // enough. Too far off, it's painted at this scale right now and that's the one scaled from here on: never live
      // paint mid-sweep (its column seams shift every frame, and it pops against the scaled ones either side))
      // (any distance while it's sweeping: a fresh paint mid-zoom (a ride's drop, the helicopter's pull-back) was the
      // big stall: painted afresh only once the scale holds still (asked for again at it))
      if (near) {
        const ka = a / l!.a, kd = d / l!.d;
        putDown(ctx, m, l!.s.c, l!.s.L * ka, l!.s.T * kd, l!.s.c.width * ka, l!.s.c.height * kd);
        Object.assign(ctx, l!.s.after);
        return;
      }
      if (!l) { paint(ctx); return; }
    }
    // (the box in device pixels, from whole pixels: the art lands in the stamp on the same pixel grid it's shown on)
    const L = Math.floor(Math.min(a * x, a * (x + w))) - 1, T = Math.floor(Math.min(d * y, d * (y + h))) - 1;
    const R = Math.ceil(Math.max(a * x, a * (x + w))) + 1, B = Math.ceil(Math.max(d * y, d * (y + h))) + 1;
    const c = document.createElement('canvas'); c.width = Math.max(1, R - L); c.height = Math.max(1, B - T);
    const g = c.getContext('2d')!;
    // (it starts from the drawing state the live art would've, and leaves the one it would've)
    painting++;
    let after: Leaves;
    try { after = paintClean(g, ctx, a, d, L, T, c.width, c.height, paint); } finally { painting--; }
    s = { c, L, T, after };
    stamps.set(id, s);
    bytes += c.width * c.height * 4;
    for (const [oldId, old] of stamps) {
      if (bytes <= BUDGET || oldId === id) break;
      stamps.delete(oldId); bytes -= old.c.width * old.c.height * 4;
      const ok = oldId.slice(0, oldId.lastIndexOf('@'));
      if (latest.get(ok)?.s === old) latest.delete(ok);
    }
  }
  latest.set(lk, { s, a, d });
  // (painted on whole device pixels; put down where the art itself would've gone, between pixels when the camera is:
  // its edges soften just the way the live art's do there)
  putDown(ctx, m, s.c, s.L, s.T, s.c.width, s.c.height);
  Object.assign(ctx, s.after);
};

/**
 * A stamp put down over the device box (x, y, w, h), relative to the transform's own offset (m.e, m.f). Unmirrored:
 * through the transform as it stands, sized to land one stamp pixel to one screen pixel (no save, restore or transform
 * swapped round it, which cost more than the drawImage). Mirrored (the transform's scale negative: anything facing
 * left): the stamp's already painted mirrored, so it goes down unturned (drawn through the mirrored transform it'd be
 * turned back round: every enemy facing left drawn facing right, its back to him).
 */
const putDown = (ctx: Ctx, m: DOMMatrix, img: HTMLCanvasElement, x: number, y: number, w: number, h: number) => {
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1;
  if (m.a > 0 && m.d > 0) ctx.drawImage(img, x / m.a, y / m.d, w / m.a, h / m.d);
  else { ctx.save(); ctx.setTransform(1, 0, 0, 1, m.e, m.f); ctx.drawImage(img, x, y, w, h); ctx.restore(); }
  ctx.imageSmoothingEnabled = sm;
};
