// Truelling Tragons' own still-art cache, for art drawn under the ride's zoom. The engine's stamps (render/stamp.ts)
// are keyed by the exact scale they're shown at: the ride's camera eases its zoom in and out all the time, so a slow
// tail of the ease asks for the same scale twice and paints the lot afresh (the far park's 2000 px strips, the halls'
// walls, every prop), a stamp a step, every few frames, piling canvases up to the stamps' budget: frames dropped
// heavily. Here each picture's painted once per band of device scale (1, 1.5, 2, 3: the art's 2 px cells on whole
// pixels, no seams) at or over the one it's shown at, and put down scaled to it (smoothed): a zoom sweeping anywhere
// within a band costs one drawImage, never a repaint.

type Ctx = CanvasRenderingContext2D;
interface Entry { cv: HTMLCanvasElement; s: number }
const cache = new Map<string, Entry>();
/** Let the oldest go past this (bytes). */
const BUDGET = 160 * 1024 * 1024;
let bytes = 0;

/** Puts down `paint`'s art (in the current coordinates, inside the box bx, by, bw, bh), from a cached picture of it at
 *  a whole device scale. `key` names the picture: the same key, the same picture. No rotation (painted live then). */
export const banded = (c: Ctx, key: string, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  const m = c.getTransform();
  const a = Math.abs(m.a);
  if (m.b !== 0 || m.c !== 0) { paint(c); return; }
  const e = bandedAt(key, a, bx, by, bw, bh, paint);
  if (!e) { paint(c); return; }
  const sm = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = true;
  c.drawImage(e.cv, bx, by, e.cv.width / e.s, e.cv.height / e.s);
  c.imageSmoothingEnabled = sm;
};

/** The cached picture behind `banded` for art shown at device scale `a` (null: paint it live instead). For a caller
 *  putting the one picture down many times (far.ts's tiles): its canvas, and the scale it's painted at. */
export const bandedAt = (key: string, a: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void): Entry | null => {
  if (typeof document === 'undefined' || !(a > 0.01) || !Number.isFinite(a) || bw <= 0 || bh <= 0) return null;
  // (the band at or just over the scale shown: 1, 1.5, 2 or 3. The art's on a 2 px grid, so 1.5 still lands its cells
  // on whole pixels; and it's never brought down more than a third: a big strip scaled down hard every frame is slow)
  const s = a <= 1.02 ? 1 : a <= 1.52 ? 1.5 : a <= 2.02 ? 2 : 3;
  const id = `${key}@${s}`;
  let e = cache.get(id);
  if (e) { cache.delete(id); cache.set(id, e); }
  else {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(bw * s)); cv.height = Math.max(1, Math.ceil(bh * s));
    const g = cv.getContext('2d');
    if (!g) return null;
    g.imageSmoothingEnabled = false;
    g.setTransform(s, 0, 0, s, -bx * s, -by * s);
    paint(g);
    e = { cv, s };
    cache.set(id, e);
    bytes += cv.width * cv.height * 4;
    for (const [oldId, old] of cache) {
      if (bytes <= BUDGET || oldId === id) break;
      cache.delete(oldId); bytes -= old.cv.width * old.cv.height * 4;
    }
  }
  return e;
};
