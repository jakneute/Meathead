// A small software 3D renderer on the 2D canvas, for the helicopter's landmarks (the user: "make the landmarks in the
// helicopter portion 3d modeled so the perspective looks more correct when you move"). No WebGL: low-poly meshes built
// once in code (vertices, convex faces, each face its material and an optional painted-on decal), put through the
// park's one camera (park.ts proj), the faces turned away culled, the rest sorted back to front (the painter's way) and
// filled flat, each lit in steps off its material's ramp (SNES: a stepped ramp, a 2x2 dither where a face falls between
// two steps), edged a step darker, the whole silhouette inked.
//
// Meshes are local (x across its front, y up, z away from the camera it faces), split into GROUPS (each moved as one by
// a matrix each frame: an arm swinging, the tower leaning, the head rising) and PARTS (each primitive: the bits that
// fly off as it's blown apart).

type Ctx = CanvasRenderingContext2D;
export interface V3 { x: number; y: number; z: number }
/** A 3x4 matrix, row by row: (x, y, z) -> (m0 x + m1 y + m2 z + m3, ...). */
export type M34 = number[];

// ---------------------------------------------------------------------------------------------------------------
// Matrices

export const ID: M34 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
/** A then B (B applied first). */
export const mmul = (A: M34, B: M34): M34 => [
  A[0] * B[0] + A[1] * B[4] + A[2] * B[8], A[0] * B[1] + A[1] * B[5] + A[2] * B[9], A[0] * B[2] + A[1] * B[6] + A[2] * B[10], A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3],
  A[4] * B[0] + A[5] * B[4] + A[6] * B[8], A[4] * B[1] + A[5] * B[5] + A[6] * B[9], A[4] * B[2] + A[5] * B[6] + A[6] * B[10], A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7],
  A[8] * B[0] + A[9] * B[4] + A[10] * B[8], A[8] * B[1] + A[9] * B[5] + A[10] * B[9], A[8] * B[2] + A[9] * B[6] + A[10] * B[10], A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11],
];
export const mov = (x: number, y: number, z: number): M34 => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
/** Turned `a` about the z axis through (px, py): + tips the top toward -x. */
export const rotZ = (a: number, px = 0, py = 0): M34 => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, px - px * c + py * s, s, c, 0, py - px * s - py * c, 0, 0, 1, 0]; };
/** Turned `a` about the x axis through (py, pz). */
export const rotX = (a: number, py = 0, pz = 0): M34 => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, py - py * c + pz * s, 0, s, c, pz - py * s - pz * c]; };
/** Turned `a` about the y axis through (px, pz). */
export const rotY = (a: number, px = 0, pz = 0): M34 => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, px - px * c - pz * s, 0, 1, 0, 0, -s, 0, c, pz + px * s - pz * c]; };
export const scl = (sx: number, sy: number, sz: number, px = 0, py = 0, pz = 0): M34 => [sx, 0, 0, px - px * sx, 0, sy, 0, py - py * sy, 0, 0, sz, pz - pz * sz];
export const ap = (m: M34, p: V3): V3 => ({ x: m[0] * p.x + m[1] * p.y + m[2] * p.z + m[3], y: m[4] * p.x + m[5] * p.y + m[6] * p.z + m[7], z: m[8] * p.x + m[9] * p.y + m[10] * p.z + m[11] });
const apv = (m: M34, p: V3): V3 => ({ x: m[0] * p.x + m[1] * p.y + m[2] * p.z, y: m[4] * p.x + m[5] * p.y + m[6] * p.z, z: m[8] * p.x + m[9] * p.y + m[10] * p.z });

// ---------------------------------------------------------------------------------------------------------------
// Materials: a ramp of five steps, darkest to the highlight

export interface Mat { id: number; ramp: number[][] }
let matN = 0;
const hexRgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
/** A material from its five steps (dark .. light), or from one color (its steps made from it, shadows cooler). */
export const mat = (cols: string[] | string): Mat => {
  const ramp = Array.isArray(cols) ? cols.map(hexRgb) : (() => { const b = hexRgb(cols); return [[0.42, 0.44, 0.52], [0.62, 0.63, 0.68], [0.8, 0.8, 0.82], [1, 1, 1], [1.16, 1.14, 1.08]].map(k => b.map((v, i) => Math.min(255, v * k[i]))); })();
  return { id: matN++, ramp };
};

// ---------------------------------------------------------------------------------------------------------------
// Meshes

export type DecalKind = 'lattice' | 'rail' | 'hlines' | 'vlines' | 'courses' | 'arches' | 'windows' | 'clock' | 'iwan' | 'niches' | 'eye' | 'hazard' | 'panel' | 'arcade3' | 'moaiArms' | 'moaiFace' | 'tiles' | 'timber' | 'grid';
export interface Decal { k: DecalKind; a?: number; b?: number; col?: string }
export interface Face { v: number[]; n: V3; mat: Mat; part: number; decal?: Decal; detail: boolean; aspect: number; area: number; top: boolean }
export interface Mesh { p: V3[]; g: number[]; vp: number[]; faces: Face[]; parts: V3[]; partGroup: number[]; minY: number; maxY: number; minX: number; maxX: number }

/** Builds a mesh: begin() a primitive (its material, group, whether it's a detail dropped when small), add its points
 *  and faces (each oriented away from the center it's given). */
export class MB {
  p: V3[] = []; g: number[] = []; vp: number[] = []; faces: Face[] = []; parts: V3[] = []; partGroup: number[] = [];
  m: Mat = mat('#808080'); grp = 0; part = -1; detail = false;
  begin(m: Mat, grp = 0, detail = false) { this.m = m; this.grp = grp; this.detail = detail; this.part = this.parts.length; this.parts.push({ x: 0, y: 0, z: 0 }); this.partGroup.push(grp); return this; }
  v(x: number, y: number, z: number) { this.p.push({ x, y, z }); this.g.push(this.grp); this.vp.push(this.part); return this.p.length - 1; }
  /** A face (convex, in order round it), its normal turned to point away from `c`. */
  f(v: number[], c: V3, decal?: Decal, m?: Mat) {
    const P = v.map(i => this.p[i]);
    let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; nx += (a.y - b.y) * (a.z + b.z); ny += (a.z - b.z) * (a.x + b.x); nz += (a.x - b.x) * (a.y + b.y); cx += a.x; cy += a.y; cz += a.z; }
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-6) return;
    nx /= l; ny /= l; nz /= l; cx /= P.length; cy /= P.length; cz /= P.length;
    if (nx * (cx - c.x) + ny * (cy - c.y) + nz * (cz - c.z) < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const e1 = P.length > 1 ? Math.hypot(P[1].x - P[0].x, P[1].y - P[0].y, P[1].z - P[0].z) : 1, e3 = P.length > 3 ? Math.hypot(P[3].x - P[0].x, P[3].y - P[0].y, P[3].z - P[0].z) : 1;
    this.faces.push({ v, n: { x: nx, y: ny, z: nz }, mat: m ?? this.m, part: this.part, decal, detail: this.detail, aspect: e1 / (e3 || 1), area: l / 2, top: ny > 0.85 });
  }
  done(): Mesh {
    const sums = this.parts.map(() => ({ x: 0, y: 0, z: 0, n: 0 }));
    this.p.forEach((q, i) => { const s = sums[this.vp[i]]; s.x += q.x; s.y += q.y; s.z += q.z; s.n++; });
    const parts = sums.map(s => (s.n ? { x: s.x / s.n, y: s.y / s.n, z: s.z / s.n } : { x: 0, y: 0, z: 0 }));
    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    for (const q of this.p) { minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x); }
    return { p: this.p, g: this.g, vp: this.vp, faces: this.faces, parts, partGroup: this.partGroup, minY, maxY, minX, maxX };
  }
}

// Primitives

export interface BoxDecals { front?: Decal; back?: Decal; left?: Decal; right?: Decal; top?: Decal; sides?: Decal }
/** A box (the front at z0, facing the camera). Its faces' decals run left to right, bottom to top, seen from outside. */
export const box = (b: MB, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, d: BoxDecals = {}, bottom = false) => {
  const v = [b.v(x0, y0, z0), b.v(x1, y0, z0), b.v(x1, y1, z0), b.v(x0, y1, z0), b.v(x0, y0, z1), b.v(x1, y0, z1), b.v(x1, y1, z1), b.v(x0, y1, z1)];
  const c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: (z0 + z1) / 2 };
  b.f([v[0], v[1], v[2], v[3]], c, d.front ?? d.sides);
  b.f([v[5], v[4], v[7], v[6]], c, d.back ?? d.sides);
  b.f([v[4], v[0], v[3], v[7]], c, d.left ?? d.sides);
  b.f([v[1], v[5], v[6], v[2]], c, d.right ?? d.sides);
  b.f([v[3], v[2], v[6], v[7]], c, d.top);
  if (bottom) b.f([v[0], v[4], v[5], v[1]], c);
};
/** A ring of `n` (its middle at cx, cz; radii rx, rz) from y0 to y1, its radii times `k` at the top (a frustum; 0: to a
 *  point). `rot` turns the ring. Sides get `dec`; a top cap unless `cap` is false. */
export const frustum = (b: MB, cx: number, cz: number, rx: number, rz: number, y0: number, y1: number, n: number, k = 1, rot = 0, dec?: Decal, cap = true, bottom = false) => {
  const ring = (y: number, kk: number) => Array.from({ length: n }, (_, i) => { const a = rot + (i / n) * Math.PI * 2; return b.v(cx + Math.cos(a) * rx * kk, y, cz - Math.sin(a) * rz * kk); });
  const B = ring(y0, 1), c = { x: cx, y: (y0 + y1) / 2, z: cz };
  if (k < 0.01) {
    const apex = b.v(cx, y1, cz);
    for (let i = 0; i < n; i++) b.f([B[i], B[(i + 1) % n], apex], c, dec);
  } else {
    const T = ring(y1, k);
    for (let i = 0; i < n; i++) b.f([B[i], B[(i + 1) % n], T[(i + 1) % n], T[i]], c, dec);
    if (cap) b.f(T.slice(), { x: cx, y: y0 - 1, z: cz });
  }
  if (bottom) b.f(B.slice().reverse(), { x: cx, y: y1 + 1, z: cz });
};
/** A lathe (a dome, a head): `prof` [radius, y] from the bottom up, turned round `n` times. */
export const lathe = (b: MB, cx: number, cz: number, prof: [number, number][], n: number, zk = 1, rot = 0, dec?: Decal) => {
  const rings = prof.map(([r, y]) => (r < 0.01 ? [b.v(cx, y, cz)] : Array.from({ length: n }, (_, i) => { const a = rot + (i / n) * Math.PI * 2; return b.v(cx + Math.cos(a) * r, y, cz - Math.sin(a) * r * zk); })));
  for (let j = 0; j + 1 < rings.length; j++) {
    const A = rings[j], B = rings[j + 1], cc = { x: cx, y: (prof[j][1] + prof[j + 1][1]) / 2 - 2, z: cz };
    for (let i = 0; i < n; i++) {
      const a0 = A[i % A.length], a1 = A[(i + 1) % A.length], b0 = B[i % B.length], b1 = B[(i + 1) % B.length];
      if (A.length === 1) b.f([a0, b1, b0], cc, dec); else if (B.length === 1) b.f([a0, a1, b0], cc, dec); else b.f([a0, a1, b1, b0], cc, dec);
    }
  }
};
/** A beam from a to b (a strut, a thigh): w across (x-ish), d deep, its ends capped. */
export const beam = (b: MB, a: V3, e: V3, w: number, d: number, dec?: Decal) => {
  const ux = e.x - a.x, uy = e.y - a.y, uz = e.z - a.z, L = Math.hypot(ux, uy, uz) || 1;
  const u = { x: ux / L, y: uy / L, z: uz / L };
  // (across: perpendicular to it and to z, or to x if it runs along z)
  let s = { x: u.y, y: -u.x, z: 0 };
  if (Math.hypot(s.x, s.y) < 0.2) s = { x: 0, y: u.z, z: -u.y };
  const sl = Math.hypot(s.x, s.y, s.z) || 1; s = { x: s.x / sl, y: s.y / sl, z: s.z / sl };
  const t = { x: u.y * s.z - u.z * s.y, y: u.z * s.x - u.x * s.z, z: u.x * s.y - u.y * s.x };
  const corner = (p: V3, i: number) => { const cs = i === 0 || i === 3 ? -1 : 1, ct = i < 2 ? -1 : 1; return b.v(p.x + s.x * w * cs + t.x * d * ct, p.y + s.y * w * cs + t.y * d * ct, p.z + s.z * w * cs + t.z * d * ct); };
  const A = [0, 1, 2, 3].map(i => corner(a, i)), B = [0, 1, 2, 3].map(i => corner(e, i));
  const c = { x: (a.x + e.x) / 2, y: (a.y + e.y) / 2, z: (a.z + e.z) / 2 };
  for (let i = 0; i < 4; i++) b.f([A[i], A[(i + 1) % 4], B[(i + 1) % 4], B[i]], c, dec);
  b.f(A.slice(), c); b.f(B.slice(), c);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Where a model's put (world): its base on the ground (bx, bz) raised by, its axes (across, away; unit, flat), each
 *  group's matrix (null: not drawn), each part's own (flying off), the eye, the light, how it's colored. */
export interface Place {
  bx: number; by: number; bz: number; R: { x: number; z: number }; F: { x: number; z: number };
  groups?: (M34 | null | undefined)[]; parts?: (M34 | null | undefined)[]; all?: M34;
}
export interface View {
  /** A world point on screen (x, y), its depth and scale (park.ts proj). */
  proj: (x: number, y: number, z: number) => { x: number; y: number; z: number; k: number };
  eye: V3; light: V3;
  /** The ground point verticals are kept upright about (the tilt-shift: a landmark's towers stand straight up on screen
   *  however far off-center it is; its ground's untouched), or null. */
  upright: { x: number; z: number } | null;
  /** Each color's last multiply (the hour's light, rgb 0..255), and a key for it. */
  mul: number[]; mulKey: string;
  variant: 'n' | 'flash' | 'wreck' | 'dark';
  /** Small: the details (decals, detail faces) left out. */
  lod: boolean;
  f: number;
  /** Cut off at the ground (sunk into it). */
  clipGround?: boolean;
  /** How beaten up (0..1): cracks and scorches, by face. */
  wear?: number;
}
interface Item { pts: { x: number; y: number }[]; z: number; fill: string | CanvasPattern; edge: string; face: Face; idx: number }
/** What's been put through the camera: its faces back to front, its bounds on screen. */
export interface Prepared { items: Item[]; x0: number; y0: number; x1: number; y1: number }
export const emptyPrep = (): Prepared => ({ items: [], x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });

const colCache = new Map<string, string>();
const patCache = new Map<string, CanvasPattern | string>();
const variantRgb = (rgb: number[], v: View['variant'], mul: number[]) => {
  let [r, g, b] = rgb;
  if (v === 'flash') { r = r + (255 - r) * 0.55; g = g + (255 - g) * 0.55; b = b + (255 - b) * 0.5; }
  else if (v === 'wreck' || v === 'dark') { const y = r * 0.3 + g * 0.59 + b * 0.11, k = v === 'wreck' ? 0.42 : 0.55; r = (r * 0.5 + y * 0.5 * 1.07) * k; g = (g * 0.5 + y * 0.5 * 0.92) * k; b = (b * 0.5 + y * 0.5 * 0.72) * k; }
  return [r * mul[0] / 255, g * mul[1] / 255, b * mul[2] / 255].map(x => Math.max(0, Math.min(255, Math.round(x))));
};
/** Each look's (variant, hour) colors by material and step (index m.id * 8 + step), no key string made per lookup: a
 *  view keeps hold of its table while its look stays the same. */
const stepTabs = new Map<string, string[]>();
type TabbedView = View & { _st?: string[]; _sv?: string; _sm?: string };
const stepCol = (m: Mat, i: number, view: View) => {
  const tv = view as TabbedView;
  let tab = tv._st;
  if (!tab || tv._sv !== view.variant || tv._sm !== view.mulKey) {
    const vk = view.variant + '|' + view.mulKey;
    tab = stepTabs.get(vk);
    if (!tab) { if (stepTabs.size > 64) stepTabs.clear(); tab = []; stepTabs.set(vk, tab); }
    tv._st = tab; tv._sv = view.variant; tv._sm = view.mulKey;
  }
  const at = m.id * 8 + i + 1;
  let s = tab[at];
  if (s === undefined) {
    const key = m.id + '|' + i + '|' + view.variant + '|' + view.mulKey;
    s = colCache.get(key);
    if (!s) { if (colCache.size > 4000) colCache.clear(); s = 'rgb(' + variantRgb(m.ramp[Math.max(0, Math.min(4, i))], view.variant, view.mul).join(',') + ')'; colCache.set(key, s); }
    tab[at] = s;
  }
  return s;
};
/** Two steps dithered in a 2x2 checker (the SNES way between two shades). */
const ditherOf = (c: Ctx, m: Mat, i: number, view: View): CanvasPattern | string => {
  const key = m.id + '|' + i + '|' + view.variant + '|' + view.mulKey;
  let p = patCache.get(key);
  if (p) return p;
  if (patCache.size > 1500) patCache.clear();
  const a = stepCol(m, i, view), b = stepCol(m, i + 1, view);
  if (typeof document === 'undefined') p = a;
  else {
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
    const g = cv.getContext('2d')!; g.fillStyle = a; g.fillRect(0, 0, 2, 2); g.fillStyle = b; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
    p = c.createPattern(cv, 'repeat') ?? a;
  }
  patCache.set(key, p);
  return p;
};
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x); };

/** Puts a mesh through the camera into `out` (more than one mesh go in one list: sorted together). */
export const prepare = (c: Ctx, mesh: Mesh, pl: Place, view: View, out: Prepared) => {
  const N = mesh.p.length, W: (V3 | null)[] = new Array(N), S: ({ x: number; y: number; z: number } | null)[] = new Array(N);
  const gm = pl.groups, pm = pl.parts;
  const up = view.upright, b0 = up ? view.proj(up.x, 0, up.z) : null;
  const toWorld = (l: V3): V3 => ({ x: pl.bx + pl.R.x * l.x + pl.F.x * l.z, y: pl.by + l.y, z: pl.bz + pl.R.z * l.x + pl.F.z * l.z });
  const scr = (w: V3) => {
    const q = view.proj(w.x, w.y, w.z);
    if (b0 && up) { const v = view.proj(up.x, w.y, up.z); return { x: q.x - (v.x - b0.x), y: q.y, z: q.z }; }
    return { x: q.x, y: q.y, z: q.z };
  };
  const mats: (M34 | null)[] = mesh.partGroup.map((g, pi) => {
    const G = gm ? gm[g] : undefined;
    if (G === null) return null;
    let M = G ?? ID;
    const P = pm?.[pi];
    if (P === null) return null;
    if (P) M = mmul(P, M);
    if (pl.all) M = mmul(pl.all, M);
    return M;
  });
  for (let i = 0; i < N; i++) {
    const M = mats[mesh.vp[i]];
    if (!M) { W[i] = null; S[i] = null; continue; }
    const w = toWorld(ap(M, mesh.p[i]));
    W[i] = w; S[i] = scr(w);
  }
  const L = view.light, wear = view.wear ?? 0;
  for (let fi = 0; fi < mesh.faces.length; fi++) {
    const fc = mesh.faces[fi];
    if (view.lod && fc.detail) continue;
    const M = mats[fc.part];
    if (!M) continue;
    const nl = apv(M, fc.n), nw = { x: pl.R.x * nl.x + pl.F.x * nl.z, y: nl.y, z: pl.R.z * nl.x + pl.F.z * nl.z };
    const nn = Math.hypot(nw.x, nw.y, nw.z) || 1; nw.x /= nn; nw.y /= nn; nw.z /= nn;
    const w0 = W[fc.v[0]]!;
    const ex = view.eye.x - w0.x, ey = view.eye.y - w0.y, ez = view.eye.z - w0.z;
    if ((nw.x * ex + nw.y * ey + nw.z * ez) / (Math.hypot(ex, ey, ez) || 1) < -0.04) continue;
    let pts: { x: number; y: number; z: number }[];
    if (view.clipGround) {
      // (sunk: what's under the ground cut off)
      const poly = fc.v.map(i => W[i]!), cl: V3[] = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], ain = a.y >= 0, bin = b.y >= 0;
        if (ain) cl.push(a);
        if (ain !== bin) { const t = a.y / (a.y - b.y); cl.push({ x: a.x + (b.x - a.x) * t, y: 0, z: a.z + (b.z - a.z) * t }); }
      }
      if (cl.length < 3) continue;
      pts = cl.map(scr);
    } else pts = fc.v.map(i => S[i]!);
    // (lit in steps: the light's way, a little always; a 2x2 dither between two steps)
    const d = nw.x * L.x + nw.y * L.y + nw.z * L.z;
    let l = 0.3 + 0.7 * Math.max(0, d) + (d < 0 ? d * 0.12 : 0);
    // (worn: scorched faces a step down)
    const h = hash(fi * 7.3 + fc.part);
    if (wear > 0 && h < wear * 0.28) l -= 0.22;
    const t = Math.max(0, Math.min(3.999, l * 4 - 0.2)), lo = Math.floor(t), fr = t - lo;
    const idx = fr > 0.5 ? lo + 1 : lo;
    const fill = !view.lod && fr > 0.38 && fr < 0.62 && lo < 4 ? ditherOf(c, fc.mat, lo, view) : stepCol(fc.mat, idx, view);
    let z = 0; for (const p of pts) z += p.z; z /= pts.length;
    if (fc.top) z += 6;
    // (a flat top's edge a step lit, not darker: it reads as a top catching the light)
    const it: Item = { pts, z, fill, edge: stepCol(fc.mat, fc.top ? Math.min(4, idx + 1) : Math.max(0, idx - 1), view), face: fc, idx: fi };
    out.items.push(it);
    for (const p of pts) { if (p.x < out.x0) out.x0 = p.x; if (p.x > out.x1) out.x1 = p.x; if (p.y < out.y0) out.y0 = p.y; if (p.y > out.y1) out.y1 = p.y; }
  }
  return { toWorld, scr, mats };
};

/** Paints what's been prepared: the silhouette inked, then each face back to front, then their decals and wear. */
export const paint = (c: Ctx, P: Prepared, view: View, ink = '#1A0B06', inkW = 2.5) => {
  const items = P.items.sort((a, b) => b.z - a.z);
  if (!items.length) return;
  c.lineJoin = 'round';
  // (the ink: every face, thick, under it all)
  if (inkW > 0) {
    c.beginPath();
    for (const it of items) { const p = it.pts; c.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) c.lineTo(p[i].x, p[i].y); c.closePath(); }
    c.strokeStyle = ink; c.lineWidth = inkW * 2; c.stroke(); c.fillStyle = ink; c.fill();
  }
  c.lineWidth = 1;
  const wear = view.wear ?? 0;
  for (const it of items) {
    const p = it.pts;
    c.beginPath(); c.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) c.lineTo(p[i].x, p[i].y); c.closePath();
    c.fillStyle = it.fill; c.fill();
    c.strokeStyle = it.edge; c.stroke();
    if (!view.lod) {
      if (it.face.decal && p.length === 4) drawDecal(c, it, view);
      if (wear > 0.05 && p.length >= 3 && it.face.area > 900 && hash(it.idx * 3.1) < wear * 0.75) crack(c, it, view);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Decals: painted onto a quad face (u across it, v up it), through its corners on screen

const bil = (p: { x: number; y: number }[], u: number, v: number) => ({
  x: (1 - u) * (1 - v) * p[0].x + u * (1 - v) * p[1].x + u * v * p[2].x + (1 - u) * v * p[3].x,
  y: (1 - u) * (1 - v) * p[0].y + u * (1 - v) * p[1].y + u * v * p[2].y + (1 - u) * v * p[3].y,
});
const tint = (hex: string, view: View) => {
  const key = hex + '|' + view.variant + '|' + view.mulKey;
  let s = colCache.get(key);
  if (!s) { s = 'rgb(' + variantRgb(hexRgb(hex), view.variant, view.mul).join(',') + ')'; colCache.set(key, s); }
  return s;
};
const poly = (c: Ctx, p: { x: number; y: number }[], uv: [number, number][], fill: string) => {
  c.beginPath(); uv.forEach(([u, v], i) => { const q = bil(p, u, v); if (i) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }); c.closePath(); c.fillStyle = fill; c.fill();
};
const line = (c: Ctx, p: { x: number; y: number }[], u0: number, v0: number, u1: number, v1: number) => { const a = bil(p, u0, v0), b = bil(p, u1, v1); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); };
/** An arched opening in the uv box (u0..u1, v0..v1): straight sides, a round (or pointed) head. */
const archUv = (u0: number, u1: number, v0: number, v1: number, pointed = false, aspect = 1): [number, number][] => {
  const w = u1 - u0, head = Math.min((v1 - v0) * 0.6, (w / 2) * aspect), out: [number, number][] = [[u0, v0], [u1, v0], [u1, v1 - head]];
  for (let k = 1; k < 6; k++) { const a = (k / 6) * Math.PI, x = 0.5 - Math.cos(a) * 0.5, y = Math.sin(a); out.push([u1 - w * x, v1 - head + head * (pointed ? Math.pow(y, 0.6) : y)]); }
  out.push([u0, v1 - head]);
  return out;
};
const drawDecal = (c: Ctx, it: Item, view: View) => {
  const d = it.face.decal!, p = it.pts, m = it.face.mat, dark = stepCol(m, 0, view), mid = stepCol(m, 1, view), lite = stepCol(m, 4, view);
  const asp = it.face.aspect;
  // (how big it is on screen: fine work only where there's room for it)
  const span = Math.max(Math.abs(p[1].x - p[0].x) + Math.abs(p[1].y - p[0].y), Math.abs(p[3].x - p[0].x) + Math.abs(p[3].y - p[0].y));
  c.lineWidth = 1;
  switch (d.k) {
    case 'lattice': {
      // (crossed girders, each lit along one side: the X's and the rungs, a lit line beside each dark one)
      const n = d.a ?? 4; c.strokeStyle = dark; c.beginPath();
      for (let r = 0; r < n; r++) { const v0 = r / n, v1 = (r + 1) / n; line(c, p, 0.04, v0, 0.96, v1); line(c, p, 0.96, v0, 0.04, v1); line(c, p, 0, v0, 1, v0); }
      c.stroke();
      if (span > 40) {
        c.strokeStyle = lite; c.beginPath();
        for (let r = 0; r < n; r++) { const v0 = r / n, v1 = (r + 1) / n, o = 0.03; line(c, p, 0.04 + o, v0, 0.96 + o * 0.2, v1 - o); line(c, p, 0, v0 + o * 0.6, 1, v0 + o * 0.6); }
        c.stroke();
        // (the rivets along the rungs)
        if (span > 90) for (let r = 0; r <= n; r++) for (let q = 1; q < 6; q++) { const a = bil(p, q / 6, r / n); c.fillStyle = lite; c.fillRect(Math.round(a.x), Math.round(a.y) - 1, 1, 1); }
      }
      break;
    }
    case 'rail': { const n = d.a ?? 10; c.strokeStyle = dark; c.beginPath(); for (let k = 1; k < n; k++) line(c, p, k / n, 0.15, k / n, 0.85); line(c, p, 0, 0.82, 1, 0.82); c.stroke(); c.strokeStyle = lite; c.beginPath(); line(c, p, 0, 0.9, 1, 0.9); c.stroke(); break; }
    case 'hlines': {
      // (courses across: each line dark, the course over it lit along its foot)
      const n = d.a ?? 4; c.strokeStyle = d.col ? tint(d.col, view) : dark; c.beginPath(); for (let k = 1; k < n; k++) line(c, p, 0, k / n, 1, k / n); c.stroke();
      if (span > 50 && !d.col) { c.strokeStyle = lite; c.beginPath(); for (let k = 1; k < n; k++) line(c, p, 0, k / n + 0.5 / n / Math.max(2, span / 30), 1, k / n + 0.5 / n / Math.max(2, span / 30)); c.stroke(); }
      break;
    }
    case 'vlines': { const n = d.a ?? 4; c.strokeStyle = d.col ? tint(d.col, view) : dark; c.beginPath(); for (let k = 1; k < n; k++) line(c, p, k / n, 0.02, k / n, 0.98); c.stroke(); break; }
    case 'tiles': {
      // (the shells' chevron tiles: the ribs fanning up, rows of tiles across them, a matte tile picked out here and there)
      const n = d.a ?? 5; c.strokeStyle = tint('#94A3B8', view); c.beginPath(); for (let k = 1; k < n; k++) line(c, p, k / n, 0, k / n * 0.6 + 0.4, 1); c.stroke();
      if (span > 40) {
        c.strokeStyle = tint('#B4C0D0', view); c.beginPath(); for (let r = 1; r < 5; r++) line(c, p, 0, r / 5, 1, r / 5); c.stroke();
        for (let r = 0; r < 5; r++) for (let k = 0; k < n; k++) if (hash(it.idx * 3 + r * 7 + k) > 0.78) poly(c, p, [[k / n + 0.02, r / 5 + 0.03], [(k + 1) / n - 0.02, r / 5 + 0.03], [(k + 1) / n - 0.02, (r + 1) / 5 - 0.03], [k / n + 0.02, (r + 1) / 5 - 0.03]], tint('#E2E8F0', view));
      }
      break;
    }
    case 'courses': {
      // (cut blocks in courses: each joint dark, a block here and there a step lit or a step down, its top lit)
      const n = d.a ?? 6, j = d.b ?? 5;
      if (span > 36) for (let k = 0; k < n; k++) for (let q = 0; q < j; q++) {
        const h = hash(it.idx * 5.1 + k * 13 + q * 3.7);
        if (h < 0.7) continue;
        const u0 = Math.max(0, (q - (k % 2 ? 0.5 : 0.75)) / j + 0.5 / j), u1 = Math.min(1, u0 + 1 / j);
        poly(c, p, [[u0, k / n], [u1, k / n], [u1, (k + 1) / n], [u0, (k + 1) / n]], h > 0.88 ? mid : lite);
      }
      c.strokeStyle = dark; c.beginPath();
      for (let k = 1; k < n; k++) line(c, p, 0, k / n, 1, k / n);
      for (let k = 0; k < n; k++) for (let q = 0; q < j; q++) { const u = (q + (k % 2 ? 0.5 : 0.25)) / j; line(c, p, u, k / n, u, (k + 1) / n); }
      c.stroke(); break;
    }
    case 'arches': case 'windows': {
      // (each opening dark inside, the inside's top a step darker still; a lit sill under a window, a keystone over an arch)
      const cols = d.a ?? 3, rows = d.b ?? 1, col = d.col ? tint(d.col, view) : dark, deep = d.col ? tint(d.col, { ...view, variant: 'dark' }) : stepCol(m, 0, { ...view, variant: 'dark' });
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const u0 = (k + 0.22) / cols, u1 = (k + 0.78) / cols, v0 = (r + 0.12) / rows, v1 = (r + (d.k === 'windows' ? 0.82 : 0.86)) / rows;
        poly(c, p, archUv(u0, u1, v0, v1, d.k === 'windows', asp * rows / cols), col);
        if (span / Math.max(cols, rows) > 14) {
          poly(c, p, [[u0, v1 - (v1 - v0) * 0.36], [u1, v1 - (v1 - v0) * 0.36], [u1, v1 - (v1 - v0) * 0.46], [u0, v1 - (v1 - v0) * 0.46]], deep);
          if (d.k === 'windows') poly(c, p, [[u0 - 0.02, v0 - 0.04 / rows], [u1 + 0.02, v0 - 0.04 / rows], [u1 + 0.02, v0], [u0 - 0.02, v0]], lite);
          else { const um = (u0 + u1) / 2; poly(c, p, [[um - 0.03, v1 - 0.01], [um + 0.03, v1 - 0.01], [um + 0.02, v1 + 0.05 / rows], [um - 0.02, v1 + 0.05 / rows]], lite); }
        }
      }
      break;
    }
    case 'timber': {
      // (half-timbering: the frame round it, the posts, a rail across, the braces; dark oak over the plaster)
      const col = tint(d.col ?? '#3A2414', view), n = d.a ?? 3;
      const bar = (u0: number, v0: number, u1: number, v1: number, w = 0.035) => { const du = u1 - u0, dv = v1 - v0, L = Math.hypot(du, dv) || 1, nu = (-dv / L) * w, nv = (du / L) * w * asp; poly(c, p, [[u0 + nu, v0 + nv], [u1 + nu, v1 + nv], [u1 - nu, v1 - nv], [u0 - nu, v0 - nv]], col); };
      bar(0, 0.03, 1, 0.03); bar(0, 0.97, 1, 0.97); bar(0, 0.5, 1, 0.5, 0.025);
      for (let k = 0; k <= n; k++) bar(k / n, 0, k / n, 1, 0.025);
      for (let k = 0; k < n; k++) { if (k % 2) bar(k / n, 0.5, (k + 1) / n, 0.97, 0.02); else bar(k / n, 0.97, (k + 1) / n, 0.5, 0.02); }
      break;
    }
    case 'grid': {
      // (panes: a frame round each, the glass by its own color, a glint in the top-left of each)
      const cols = d.a ?? 3, rows = d.b ?? 6, col = tint(d.col ?? '#9CC9E6', view), g2 = tint('#FFFFFF', view);
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const u0 = (k + 0.14) / cols, u1 = (k + 0.86) / cols, v0 = (r + 0.12) / rows, v1 = (r + 0.88) / rows;
        poly(c, p, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], col);
        if (span / Math.max(cols, rows) > 10 && (r + k) % 3 === 0) poly(c, p, [[u0, v1 - 0.25 / rows], [u0 + 0.3 / cols, v1 - 0.25 / rows], [u0 + 0.3 / cols, v1], [u0, v1]], g2);
      }
      break;
    }
    case 'arcade3': {
      // (the Colosseum's tiers of arches, by height: `a` the face's height; three tiers of 64 and the attic over them)
      const H = d.a ?? 220, col = dark;
      c.strokeStyle = mid; c.beginPath();
      for (let t = 1; t <= 3; t++) if (t * 64 < H) line(c, p, 0, (t * 64) / H, 1, (t * 64) / H);
      c.stroke();
      for (let t = 0; t < 3; t++) { const y0 = t * 64 + 8, y1 = t * 64 + 54; if (y1 > H) break; poly(c, p, archUv(0.2, 0.8, y0 / H, y1 / H, false, asp * (64 / H)), col); }
      if (H > 210) for (const u of [0.3, 0.7]) poly(c, p, [[u - 0.06, 200 / H], [u + 0.06, 200 / H], [u + 0.06, 208 / H], [u - 0.06, 208 / H]], col);
      break;
    }
    case 'clock': {
      const cu = 0.5, cv = d.b ?? 0.5, ru = d.a ?? 0.38, rv = ru * asp, ring = (r: number): [number, number][] => Array.from({ length: 16 }, (_, k) => [cu + Math.cos((k / 16) * Math.PI * 2) * ru * r, cv + Math.sin((k / 16) * Math.PI * 2) * rv * r]);
      poly(c, p, ring(1.15), tint('#CA8A04', view)); poly(c, p, ring(1), tint('#FEF3C7', view));
      c.strokeStyle = tint('#1A0B06', view); c.beginPath();
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; line(c, p, cu + Math.cos(a) * ru * 0.8, cv + Math.sin(a) * rv * 0.8, cu + Math.cos(a) * ru * 0.95, cv + Math.sin(a) * rv * 0.95); }
      c.stroke();
      const t = view.f * 0.01; c.lineWidth = 2; c.beginPath();
      line(c, p, cu, cv, cu + Math.cos(-t) * ru * 0.78, cv + Math.sin(-t) * rv * 0.78); line(c, p, cu, cv, cu + Math.cos(-t / 12 + 1) * ru * 0.5, cv + Math.sin(-t / 12 + 1) * rv * 0.5);
      c.stroke(); c.lineWidth = 1; break;
    }
    case 'iwan': {
      poly(c, p, [[0.2, 0.02], [0.8, 0.02], [0.8, 0.92], [0.2, 0.92]], mid);
      poly(c, p, archUv(0.28, 0.72, 0.02, 0.82, true, asp), tint('#334155', view));
      c.strokeStyle = tint('#CA8A04', view); c.beginPath(); line(c, p, 0.2, 0.92, 0.8, 0.92); line(c, p, 0.2, 0.02, 0.2, 0.92); line(c, p, 0.8, 0.02, 0.8, 0.92); c.stroke();
      break;
    }
    case 'niches': { const col = tint('#475569', view); poly(c, p, archUv(0.25, 0.75, 0.08, 0.44, true, asp * 2), col); poly(c, p, archUv(0.25, 0.75, 0.54, 0.9, true, asp * 2), col); break; }
    case 'eye': {
      const pts: [number, number][] = Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [0.5 + Math.cos(a) * 0.22, 0.42 + Math.sin(a) * 0.09]; });
      poly(c, p, pts, tint('#FFFFFF', view));
      poly(c, p, Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return [0.5 + Math.cos(a) * 0.07, 0.42 + Math.sin(a) * 0.07] as [number, number]; }), tint('#BE185D', view));
      break;
    }
    case 'hazard': {
      poly(c, p, [[0, 0.25], [1, 0.25], [1, 0.75], [0, 0.75]], tint('#FACC15', view));
      const n = d.a ?? 8, k0 = tint('#1A0B06', view);
      for (let k = 0; k < n; k++) { const u = k / n; poly(c, p, [[u, 0.25], [u + 0.5 / n, 0.25], [u + 0.25 / n, 0.75], [Math.max(0, u - 0.25 / n), 0.75]], k0); }
      break;
    }
    case 'panel': {
      // (an inset panel: dark along its top and left (in shadow), lit along its bottom and right; rivets in its corners)
      c.strokeStyle = dark; c.beginPath(); line(c, p, 0.15, 0.8, 0.85, 0.8); line(c, p, 0.15, 0.8, 0.15, 0.2); c.stroke();
      c.strokeStyle = lite; c.beginPath(); line(c, p, 0.15, 0.2, 0.85, 0.2); line(c, p, 0.85, 0.2, 0.85, 0.8); c.stroke();
      if (span > 30) for (const [u, v] of [[0.07, 0.1], [0.93, 0.1], [0.07, 0.9], [0.93, 0.9]]) { const a = bil(p, u, v); c.fillStyle = dark; c.fillRect(Math.round(a.x) - 1, Math.round(a.y) - 1, 2, 2); c.fillStyle = lite; c.fillRect(Math.round(a.x) - 1, Math.round(a.y) - 1, 1, 1); }
      break;
    }
    case 'moaiArms': {
      for (const [u0, u1] of [[0.04, 0.13], [0.87, 0.96]]) poly(c, p, [[u0, 0.08], [u1, 0.08], [u1, 0.92], [u0, 0.92]], dark);
      for (const [u0, u1] of [[0.2, 0.46], [0.54, 0.8]]) poly(c, p, [[u0, 0.42], [u1, 0.42], [u1, 0.52], [u0, 0.52]], dark);
      poly(c, p, [[0.48, 0.66], [0.52, 0.66], [0.52, 0.7], [0.48, 0.7]], dark);
      break;
    }
    case 'moaiFace': {
      for (const [u0, u1] of [[0.12, 0.42], [0.58, 0.88]]) poly(c, p, [[u0, 0.73], [u1, 0.73], [u1 - 0.03, 0.8], [u0 + 0.03, 0.8]], dark);
      break;
    }
  }
};
/** A crack across a face (its own, by face): a jagged dark line, a light lip down one side. */
const crack = (c: Ctx, it: Item, view: View) => {
  const p = it.pts, s = it.idx * 1.7;
  const q = (u: number, v: number) => (p.length === 4 ? bil(p, u, v) : { x: p[0].x + (p[1].x - p[0].x) * u + (p[2].x - p[0].x) * v * (1 - u), y: p[0].y + (p[1].y - p[0].y) * u + (p[2].y - p[0].y) * v * (1 - u) });
  // (jagged down the face from near its top, a branch off it partway; a lit lip down one side of it (the broken edge
  // catching the light), a chip knocked out where it starts)
  const pts: { x: number; y: number }[] = [];
  let u = 0.2 + hash(s) * 0.6, v = 0.85;
  pts.push(q(u, v));
  for (let k = 0; k < 5; k++) { u += (hash(s + k) - 0.5) * 0.32; v -= 0.15; pts.push(q(Math.max(0.05, Math.min(0.95, u)), v)); }
  const lip = stepCol(it.face.mat, 4, view);
  c.strokeStyle = lip; c.lineWidth = 1; c.beginPath(); pts.forEach((a, i) => (i ? c.lineTo(a.x + 1, a.y) : c.moveTo(a.x + 1, a.y))); c.stroke();
  c.strokeStyle = tint('#1A0B06', view); c.lineWidth = 1.5; c.beginPath(); pts.forEach((a, i) => (i ? c.lineTo(a.x, a.y) : c.moveTo(a.x, a.y))); c.stroke();
  // (the branch)
  const b0 = pts[2], bu = Math.max(0.05, Math.min(0.95, u + (hash(s + 9) > 0.5 ? 0.22 : -0.22))), b1 = q(bu, 0.4), b2 = q(bu + (hash(s + 11) - 0.5) * 0.15, 0.25);
  c.lineWidth = 1; c.beginPath(); c.moveTo(b0.x, b0.y); c.lineTo(b1.x, b1.y); c.lineTo(b2.x, b2.y); c.stroke();
  // (the chip at its head)
  const h0 = pts[0]; c.fillStyle = stepCol(it.face.mat, 0, view); c.beginPath(); c.moveTo(h0.x - 2, h0.y - 1); c.lineTo(h0.x + 3, h0.y - 2); c.lineTo(h0.x + 1, h0.y + 3); c.closePath(); c.fill();
  c.lineWidth = 1;
};
