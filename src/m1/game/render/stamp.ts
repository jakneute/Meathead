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
/** (a, d: the exact scale it was painted at; L, T: its device box at that scale) */
interface Stamp { c: HTMLCanvasElement; L: number; T: number; a: number; d: number; after: Leaves; /** Only the part of it near the screen (a sweep, pushed right in: stamp()). */ clip?: boolean }
/** Most recently used last; the oldest are let go once they add up to more than BUDGET bytes. */
const stamps = new Map<string, Stamp>();
// (a busy stretch of Adventure Land wants ~100 MB of them at once: under that, the whole lot is let go and painted
// again every frame, and the frame rate goes through the floor. Twice that, so only stamps from somewhere else go)
const BUDGET = 320 * 1024 * 1024;
let bytes = 0;
/** Asked for once but not painted yet: a stamp's only painted the second time it's wanted at that scale (a zoom
 * sweeping through scales frame by frame never fills the cache with ones it'll never use again). */
const asked = new Set<string>();
/** First asked for this frame: asked again in the same frame (the same picture put down more than once: a row of
 *  repeated trees) isn't the scale holding still, it's the one frame of a zoom (a boss's punch-in): scaled, not painted.
 *  (Tucker's mauling punch-in painted his woods' repeated back rank afresh every frame of it: the slowdown.) */
const askedNow = new Set<string>();
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

/** A zoom pulling out (Meathead 2's hub, out of a portal): while it's on, art that's never been stamped is stamped the
 *  first time it's seen, at the scale it's seen at, and scaled down from as the zoom goes on (everything only ever gets
 *  smaller, so nothing's blown up soft). Off, a stamp's never painted till the scale holds still, so art coming into
 *  view mid-zoom was painted live every frame of it: the whole screen's worth by the end. And pushed right in, a big
 *  piece of art (a far landmark, a whole strip of the hub) would be a stamp many screens big, nearly all of it off the
 *  screen: only the part near the screen is painted (room round it for the zoom to pull back into a while), and once
 *  the pull-back reaches past that part, it's painted again at the scale then (smaller, so more of it). */
let sweep = false;
export const setStampSweep = (on: boolean) => { sweep = on; };
/** Is a zoom pulling out (setStampSweep)? (Other caches of the art's own, sized to the screen: hub/crowd.ts.) */
export const stampSweep = () => sweep;
/** How far round the screen a clipped stamp reaches (each side, a fraction of the canvas). */
const CLIP_PAD = 0.5;

/** Painting stamps this frame (ms): past PAINT_MS, a stamp that's only wanted afresh because the scale has settled on a
 *  new one (the end of a zoom: every one on screen at once) goes down scaled from the one it has a frame or two longer,
 *  and the rest are painted over the next frames rather than all in one. */
let spent = 0;
const PAINT_MS = 6;
/** A new frame (world.ts, before the world's drawn). */
export const newStampFrame = () => { spent = 0; askedNow.clear(); };
/** Painting that isn't stamps' but shares their budget (hub/crowd.ts's guests): how long it took; and is this frame's
 *  budget spent, while the screen's covered (setStampCover)? */
export const notePaint = (ms: number) => { spent += ms; };
export const coveredAndSpent = () => cover && spent > PAINT_MS;
/** The screen's covered (the hub built under the black of the stage change and the portal's white): art not painted
 *  yet past this frame's budget is left for the next frame rather than all painted in the one (nobody can see it). */
let cover = false;
export const setStampCover = (on: boolean) => { cover = on; };

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
    let l = latest.get(lk);
    // (one painted only near the screen that doesn't reach as far as the art now shows: as good as none)
    if (l && l.s.clip && !covers(ctx, m, l.s, x, y, w, h)) l = undefined;
    // (pulling out: scaled down from the one it has (just painted, at a bigger scale), never blown up)
    const near = !!l && Math.sign(l.a) === Math.sign(a) && Math.sign(l.d) === Math.sign(d) && (!sweep || Math.abs(l.s.a) >= Math.abs(m.a) - 1e-6);
    if (sweep && near) {
      const ka = m.a / l!.s.a, kd = m.d / l!.s.d;
      putDown(ctx, m, l!.s.c, l!.s.L * ka, l!.s.T * kd, l!.s.c.width * ka, l!.s.c.height * kd);
      Object.assign(ctx, l!.s.after);
      return;
    }
    if (!asked.has(id)) {
      if (asked.size > MAX) asked.clear(); asked.add(id); askedNow.add(id);
      // (a new scale (a zoom sweeping through them): the one it was last painted at, scaled to this, if it's near
      // enough. Too far off, it's painted at this scale right now and that's the one scaled from here on: never live
      // paint mid-sweep (its column seams shift every frame, and it pops against the scaled ones either side))
      // (any distance while it's sweeping: a fresh paint mid-zoom (a ride's drop, the helicopter's pull-back) was the
      // big stall: painted afresh only once the scale holds still (asked for again at it))
      if (near) {
        const ka = m.a / l!.s.a, kd = m.d / l!.s.d;
        putDown(ctx, m, l!.s.c, l!.s.L * ka, l!.s.T * kd, l!.s.c.width * ka, l!.s.c.height * kd);
        Object.assign(ctx, l!.s.after);
        return;
      }
      if (!l && !sweep) { paint(ctx); return; }
    } else if (near && (spent > PAINT_MS || askedNow.has(id))) {
      // (wanted at a settled scale, but this frame's painted plenty already: the one it has, scaled, for now)
      const ka = m.a / l!.s.a, kd = m.d / l!.s.d;
      putDown(ctx, m, l!.s.c, l!.s.L * ka, l!.s.T * kd, l!.s.c.width * ka, l!.s.c.height * kd);
      Object.assign(ctx, l!.s.after);
      return;
    }
    // (under cover, this frame's painted plenty: next frame)
    if (cover && spent > PAINT_MS) return;
    // (the box in device pixels, from whole pixels: the art lands in the stamp on the same pixel grid it's shown on)
    // (at the transform's exact scale, not the rounded one that keys it: art out at world coordinates (x in the tens of
    // thousands, pushed back in depth by a scale that isn't whole) came down pixels off, the rounding times x)
    const pa = m.a, pd = m.d;
    let L = Math.floor(Math.min(pa * x, pa * (x + w))) - 1, T = Math.floor(Math.min(pd * y, pd * (y + h))) - 1;
    let R = Math.ceil(Math.max(pa * x, pa * (x + w))) + 1, B = Math.ceil(Math.max(pd * y, pd * (y + h))) + 1;
    // (pulling out, pushed right in: just the part of it near the screen, if it reaches well past it)
    let clip = false;
    if (sweep && pa > 0 && pd > 0) {
      const cw = ctx.canvas.width, ch = ctx.canvas.height;
      const vL = Math.floor(-m.e - cw * CLIP_PAD), vR = Math.ceil(cw * (1 + CLIP_PAD) - m.e), vT = Math.floor(-m.f - ch * CLIP_PAD), vB = Math.ceil(ch * (1 + CLIP_PAD) - m.f);
      if (L < vL || R > vR || T < vT || B > vB) {
        L = Math.max(L, vL); R = Math.min(R, vR); T = Math.max(T, vT); B = Math.min(B, vB);
        // (nowhere near the screen: nothing of it would show)
        if (R <= L || B <= T) return;
        clip = true;
      }
    }
    const c = document.createElement('canvas'); c.width = Math.max(1, R - L); c.height = Math.max(1, B - T);
    const g = c.getContext('2d')!;
    // (it starts from the drawing state the live art would've, and leaves the one it would've)
    painting++;
    let after: Leaves;
    const t0 = performance.now();
    try { after = paintClean(g, ctx, pa, pd, L, T, c.width, c.height, paint); } finally { painting--; spent += performance.now() - t0; }
    s = { c, L, T, a: pa, d: pd, after, clip };
    // (a clipped one's never what's wanted at its scale once the sweep's over: kept under a name of its own, only to be
    // scaled from)
    stamps.set(clip ? `${id}#clip` : id, s);
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
  // (the scale now a hair off the one it was painted at, inside the rounding that keys it: shifted so its box's corner
  // lands right where the art's own would)
  putDown(ctx, m, s.c, s.L + (m.a - s.a) * x, s.T + (m.d - s.d) * y, s.c.width, s.c.height);
  Object.assign(ctx, s.after);
};

/** Does the clipped stamp `s`, scaled to the transform `m`, reach over every part of the art's box (x, y, w, h) that's
 *  on the canvas? */
const covers = (ctx: Ctx, m: DOMMatrix, s: Stamp, x: number, y: number, w: number, h: number) => {
  if (m.a <= 0 || m.d <= 0) return false;
  const ka = m.a / s.a, kd = m.d / s.d;
  const nL = Math.max(m.a * x, -m.e), nR = Math.min(m.a * (x + w), ctx.canvas.width - m.e);
  const nT = Math.max(m.d * y, -m.f), nB = Math.min(m.d * (y + h), ctx.canvas.height - m.f);
  if (nR <= nL || nB <= nT) return true;
  return nL >= s.L * ka - 0.5 && nR <= (s.L + s.c.width) * ka + 0.5 && nT >= s.T * kd - 0.5 && nB <= (s.T + s.c.height) * kd + 0.5;
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
