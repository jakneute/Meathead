// Truelling Tragons' own still-art cache, for art drawn under the ride's zoom. The engine's stamps (render/stamp.ts)
// are keyed by the exact scale they're shown at: the ride's camera eases its zoom in and out all the time, so a slow
// tail of the ease asks for the same scale twice and paints the lot afresh (the far park's 2000 px strips, the halls'
// walls, every prop), a stamp a step, every few frames, piling canvases up to the stamps' budget: frames dropped
// heavily and, with that many big canvases, the picture could go blank. Here each picture's painted once per WHOLE
// device scale (1, 2, 3: on whole pixels, no seams) at or over the one it's shown at, and put down scaled to it
// (smoothed): a zoom sweeping anywhere between costs one drawImage, never a repaint.

type Ctx = CanvasRenderingContext2D;
interface Entry { cv: HTMLCanvasElement; s: number }
const cache = new Map<string, Entry>();
/** Let the oldest go past this (bytes). */
const BUDGET = 96 * 1024 * 1024;
let bytes = 0;

/** Puts down `paint`'s art (in the current coordinates, inside the box bx, by, bw, bh), from a cached picture of it at
 *  a whole device scale. `key` names the picture: the same key, the same picture. No rotation (painted live then). */
export const banded = (c: Ctx, key: string, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  const m = c.getTransform();
  const a = Math.abs(m.a);
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || !(a > 0.01) || !Number.isFinite(a) || bw <= 0 || bh <= 0) { paint(c); return; }
  const s = Math.min(3, Math.max(1, Math.ceil(a - 0.02)));
  const id = `${key}@${s}`;
  let e = cache.get(id);
  if (e) { cache.delete(id); cache.set(id, e); }
  else {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(bw * s)); cv.height = Math.max(1, Math.ceil(bh * s));
    const g = cv.getContext('2d');
    if (!g) { paint(c); return; }
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
  const sm = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = true;
  c.drawImage(e.cv, bx, by, e.cv.width / e.s, e.cv.height / e.s);
  c.imageSmoothingEnabled = sm;
};
