// A doorway between two rooms, done as a passage through a thick wall (the one shared eye's light fake 3D, paint.ts):
// the wall's a block from x = A to B (its face at his plane, going back to the back wall); the passage is cut through it
// along his way, from a step in front of his plane (`near`) back to `dp`, `H` high. So from the front, over his head,
// the lintel; through it, the passage's own back wall (at dp: it shifts slower than he walks) and its floor, the one
// room's paper and floor giving way to the other's at the threshold; from the side, the wall's face going back with the
// mouth of the passage cut out of it; and in front of it all, the near edge of the opening (its jambs and the lintel's
// edge, thin and dark) sliding past faster than he walks.

import { GY } from '../geometry';
import { INK, box, mix, rampOf, stamp, at, quad, seg, inDepth, WALL_D, type Eye, type P } from './paint';

type Ctx = CanvasRenderingContext2D;

export interface Passage {
  /** The wall block's two faces (x at his plane). */
  A: number; B: number;
  /** The top of the opening (world y), the top of the wall. */
  H: number; top: number;
  /** How far back the passage goes (its back wall's depth); how far in front of his plane its near edge stands. */
  dp: number; near: number;
  /** Where the one room gives way to the other (x). */
  split: number;
}

/**
 * Behind him: the passage's back wall (`paintRear` paints x A..B, y H..GY in its own units: stamped, at dp), its
 * floor (the one room's floor up to the split, the other's after, a saddle across the threshold), and the lintel's
 * underside if he's below it.
 */
export const passageBack = (c: Ctx, eye: Eye, p: Passage, key: string, paintRear: (g: Ctx) => void, floorL: string, floorR: string, soffit: string) => {
  inDepth(c, eye, p.dp, () => stamp(c, key, p.A - 2, p.H - 2, p.B - p.A + 4, GY - p.H + 4, paintRear));
  const band = (x0: number, x1: number, col: string) => {
    const r = rampOf(col);
    const m = (1 + p.dp) / 2;
    quad(c, r[1], at(eye, x0, GY, p.dp), at(eye, x1, GY, p.dp), at(eye, x1, GY, m), at(eye, x0, GY, m));
    quad(c, col, at(eye, x0, GY, m), at(eye, x1, GY, m), at(eye, x1, GY, 1), at(eye, x0, GY, 1));
  };
  band(p.A, p.split, floorL); band(p.split, p.B, floorR);
  // (the threshold's saddle: a strip of brass across the passage's floor)
  quad(c, INK, at(eye, p.split - 3, GY, p.dp), at(eye, p.split + 3, GY, p.dp), at(eye, p.split + 3, GY, 1), at(eye, p.split - 3, GY, 1));
  quad(c, '#A16207', at(eye, p.split - 2, GY, p.dp), at(eye, p.split + 2, GY, p.dp), at(eye, p.split + 2, GY, 1), at(eye, p.split - 2, GY, 1));
  // (the passage's back wall meets its floor: a dark line)
  seg(c, at(eye, p.A, GY, p.dp), at(eye, p.B, GY, p.dp), INK, 1);
  if (eye.y > p.H) quad(c, soffit, at(eye, p.A, p.H, 1), at(eye, p.B, p.H, 1), at(eye, p.B, p.H, p.dp), at(eye, p.A, p.H, p.dp));
};

/**
 * The wall's face at X going back (`side` -1 its left face, 1 its right; drawn only if it faces the eye), with the
 * passage's mouth cut out of it: below H, only from dp back. The mouth's edges lit (the inner jamb's corner).
 */
export const passageSide = (c: Ctx, eye: Eye, X: number, side: -1 | 1, p: Passage, col: string, courses = true) => {
  if (side < 0 ? eye.x >= X : eye.x <= X) return;
  const r = rampOf(col);
  const pt = (y: number, d: number): P => at(eye, X, y, d);
  const ds = [1, 0.97, 0.94, 0.91, 0.885, WALL_D];
  for (let i = 0; i < ds.length - 1; i++) {
    const shade = mix(r[1], INK, i * 0.1);
    // (each band on to the back wall, the next over it: no antialiased hairline between them crawling as it scrolls)
    quad(c, shade, pt(p.top, ds[i]), pt(p.top, WALL_D), pt(p.H, WALL_D), pt(p.H, ds[i]));
    // (below the lintel: only behind the passage)
    const a = Math.min(ds[i], p.dp), b = WALL_D;
    if (a > b) quad(c, shade, pt(p.H, a), pt(p.H, b), pt(GY, b), pt(GY, a));
  }
  if (courses) {
    c.strokeStyle = mix(r[0], INK, 0.2); c.lineWidth = 1; c.beginPath();
    for (let y = GY - 16; y > p.top; y -= 16) { const d0 = y > p.H ? p.dp : 1, a = pt(y, d0), b = pt(y, WALL_D); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
  }
  // (the mouth's edges: the jamb's inner corner going down, the lintel's going back)
  seg(c, pt(p.H, p.dp), pt(GY, p.dp), INK, 2);
  seg(c, pt(p.H, 1), pt(p.H, p.dp), INK, 2);
  seg(c, pt(p.H + 2, 1), pt(p.H + 2, p.dp), r[3], 1);
  seg(c, pt(p.top, WALL_D), pt(GY, WALL_D), INK, 2);
};

/**
 * In front of everything: the opening's near edge (`near` in front of his plane): its two jambs (thin posts, dark,
 * a lit edge on the side facing the eye) and the lintel's edge across over his head. They slide past faster than he
 * walks; thin, so nothing's hidden behind them.
 */
export const passageFront = (c: Ctx, eye: Eye, p: Passage, col: string, w = 8) => {
  const r = rampOf(col);
  const n = p.near, floor = at(eye, 0, GY, n)[1], hy = at(eye, 0, p.H, n)[1];
  const lx = at(eye, p.A, 0, n)[0], rx = at(eye, p.B, 0, n)[0];
  const pw = Math.max(4, Math.round(w * n));
  // (the lintel's edge: a beam across the top of the opening, from jamb to jamb)
  box(c, lx, hy - pw - 1, rx - lx, pw + 2, INK); box(c, lx, hy - pw, rx - lx, pw, r[1]); box(c, lx, hy - 2, rx - lx, 1, r[3]);
  // (the jambs: the opening's casing, from the floor up to the beam, a block at each top corner)
  const cy = hy - pw - 6;
  for (const [x, lit] of [[lx, eye.x > p.A], [rx - pw, eye.x < p.B]] as const) {
    box(c, x - 1, cy, pw + 2, floor - cy, INK);
    box(c, x, cy, pw, floor - cy, r[0]);
    box(c, lit ? (x === lx ? x + pw - 2 : x) : x, cy, 2, floor - cy, lit ? r[2] : r[1]);
    box(c, x - 3, cy - 1, pw + 6, 8, INK); box(c, x - 2, cy, pw + 4, 6, r[1]); box(c, x - 2, cy, pw + 4, 1, r[3]);
  }
};

/** The front face over the opening (his plane: x A..B, top..H), stamped; `paint` paints it. */
export const passageLintel = (c: Ctx, p: Passage, key: string, paint: (g: Ctx) => void) => {
  stamp(c, key, p.A - 2, p.top - 2, p.B - p.A + 4, p.H - p.top + 4, paint);
  box(c, p.A, p.H - 2, p.B - p.A, 2, INK);
};
