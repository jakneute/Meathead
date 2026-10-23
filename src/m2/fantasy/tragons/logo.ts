// TRUELLING TRAGONS' logo: the attraction's crest, as the park would have it made (one design for its three signs:
// the queue's facade, glen/sets.ts; the load hall's wall and the marquee hung over the platform, station.ts).
//
//   THE CREST     a heater shield in royal lavender, a diaper of lighter diamonds with gilt studs at the crossings,
//                 stepped shading (lit left, shaded right), a gilt rim in steps, studs round it (the queue's bulbs)
//   THE RIBBON    TRUELLING in white on a rose ribbon across the shield's top, gilt-edged, its ends folded back and
//                 swallowtailed
//   THE NAME      TRAGONS big over the shield (wider than it): fat gilt in banded leaf, inked, lit along the tops,
//                 a deep purple bevel stepped down behind, gold-leaf glints; a warm bloom round it after dark
//   THE TRUEL     the three dragons in their tracks' colors at each other: FIRE up the left (its neck over the
//                 ribbon's tail) and LIGHTNING up the right, flame and bolt meeting in a burst over the ribbon; ICE
//                 curled along the bottom, frost blasting across under the name at FIRE's tail. Little sparkles.
//
// Nothing crosses the lettering. Local to its middle (cx, cy): it keeps inside LOGO's bounds. Painted into the
// callers' stamps (still art), so it's flat fills on whole pixels, once per hour.

import { signText, signW, type Look } from '../../signLetters';
import { INK, box, hash, ramp6, dimmed, polyF, ballR, GOLD, IRON, type Ctx } from '../kit';

/** Its bounds about its middle (px): left/right half-width, top, bottom. */
export const LOGO = { HW: 214, T: -72, B: 68 };

export interface LogoOpts {
  /** Scenery-dimmed by the hour (on the halls' walls and the facade; the marquee's lit up in front: not). */
  dim?: boolean;
  /** After dark: the name blooms. */
  glow?: boolean;
  /** Stood off a wall on iron brackets: its shadow cast on the wall behind. */
  wall?: boolean;
}

type P = [number, number];
const LANE = { fire: '#C42828', ice: '#3A9AD8', bolt: '#E0B020' } as const;
type Kind = keyof typeof LANE;

// ---------------------------------------------------------------------------------------------------------------
// Pixel helpers (whole pixels: discs as rows, lines as steps)

const disc = (g: Ctx, x: number, y: number, r: number, col: string) => {
  g.fillStyle = col;
  const R = Math.max(0.5, r), X = Math.round(x), Y = Math.round(y), n = Math.floor(R);
  for (let dy = -n; dy <= n; dy++) { const w = Math.floor(Math.sqrt(R * R - dy * dy) + 0.3); g.fillRect(X - w, Y + dy, w * 2 + 1, 1); }
};
const line = (g: Ctx, pts: P[], w: number, col: string) => {
  g.fillStyle = col;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
    for (let k = 0; k <= n; k++) g.fillRect(Math.round(ax + ((bx - ax) * k) / n - w / 2), Math.round(ay + ((by - ay) * k) / n - w / 2), w, w);
  }
};
/** A polygon with an ink line round it (1 px out). */
const inked = (g: Ctx, pts: P[], col: string, ink = INK) => {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) polyF(g, pts.map(([x, y]) => [x + dx, y + dy] as P), ink);
  polyF(g, pts, col);
};
/** A four-point twinkle. */
const twinkle = (g: Ctx, x: number, y: number, n: number, core: string, arm: string) => {
  box(g, x - n, y, n * 2 + 1, 1, arm); box(g, x, y - n, 1, n * 2 + 1, arm);
  if (n > 2) { box(g, x - 1, y, 3, 1, core); box(g, x, y - 1, 1, 3, core); }
  box(g, x, y, 1, 1, core);
};
/** A Catmull-Rom curve through pts, sampled about 1 px apart. */
const curve = (pts: P[]): P[] => {
  const out: P[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1])));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The dragons

/** A dragon's body along pts (tail first): scaled, its back's spines, its belly's plates, lit along its top. `only`
 *  redraws just the samples it passes (a stretch in front of something), no ink where the stretch begins and ends so
 *  it joins the rest seamlessly. */
const body = (g: Ctx, pts: P[], r0: number, r1: number, R: string[], belly: string[], spine: string, only?: (p: P) => boolean) => {
  const S = curve(pts), n = S.length;
  const rad = (i: number) => r0 + (r1 - r0) * Math.pow(i / (n - 1), 0.8);
  const nrm = (i: number): P => {
    const a = S[Math.max(0, i - 2)], b = S[Math.min(n - 1, i + 2)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    let nx = -dy / l, ny = dx / l;
    if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    return [nx, ny]; // (the back's side: up)
  };
  const on = (i: number) => !only || only(S[i]);
  const edge = (i: number) => !!only && (!only(S[Math.max(0, i - 3)]) || !only(S[Math.min(n - 1, i + 3)]));
  // (the spines along the back, behind the body: alternate long and short)
  for (let i = 6; i < n - 4; i += 7) {
    if (!on(i)) continue;
    const [x, y] = S[i], [nx, ny] = nrm(i), r = rad(i), [bx, by] = S[Math.max(0, i - 4)], L = r + (i % 14 ? 3 : 6);
    inked(g, [[x + nx * (r - 1), y + ny * (r - 1)], [bx + nx * (r - 1), by + ny * (r - 1)], [x - (x - bx) * 0.2 + nx * L, y - (y - by) * 0.2 + ny * L]], spine);
  }
  for (let i = 0; i < n; i++) if (on(i) && !edge(i)) disc(g, S[i][0], S[i][1], rad(i) + 1.4, INK);
  for (let i = 0; i < n; i++) if (on(i)) disc(g, S[i][0], S[i][1], rad(i), R[2]);
  for (let i = 0; i < n; i++) if (on(i)) { const [nx, ny] = nrm(i), r = rad(i); disc(g, S[i][0] + nx * r * 0.25, S[i][1] + ny * r * 0.25, r * 0.72, R[3]); }
  // (the belly: plates in cream, a seam every few px)
  for (let i = 0; i < n; i++) if (on(i)) { const [nx, ny] = nrm(i), r = rad(i); disc(g, S[i][0] - nx * r * 0.5, S[i][1] - ny * r * 0.5, r * 0.45, belly[i % 5 === 0 ? 1 : 3]); }
  // (lit along the back; scales picked out down the flank)
  for (let i = 0; i < n; i++) if (on(i)) { const [nx, ny] = nrm(i), r = rad(i); disc(g, S[i][0] + nx * r * 0.55, S[i][1] + ny * r * 0.55, Math.max(0.5, r * 0.22), R[4]); }
  for (let i = 3; i < n; i += 4) if (on(i)) { const [nx, ny] = nrm(i), r = rad(i), o = (i % 8 ? 0.1 : 0.3); box(g, Math.round(S[i][0] + nx * r * o), Math.round(S[i][1] + ny * r * o), 2, 1, R[1]); }
};

/** A dragon's head, facing right from its neck at the origin (mirror for left): the snout, the jaw dropped open, the
 *  teeth, a gold eye with a slit, horns swept back, its track's frill (flames, icicles, a jagged crest). */
const head = (g: Ctx, x: number, y: number, dir: 1 | -1, R: string[], kind: Kind, T: (c: string) => string) => {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(dir, 1);
  const Hn = ramp6(T('#F2EAD0')), M = T('#2A0A14');
  // (the frill behind it)
  if (kind === 'fire') for (let k = 0; k < 4; k++) inked(g, [[-6 + k * 7, -11 + k], [-14 + k * 7, -24 + k * 2], [-2 + k * 7, -13 + k]], k % 2 ? T('#F6A02A') : T('#FDE047'));
  if (kind === 'bolt') for (let k = 0; k < 4; k++) inked(g, [[-8 + k * 7, -11], [-10 + k * 7, -22], [-4 + k * 7, -16], [-2 + k * 7, -24], [0 + k * 7, -12]], k % 2 ? T('#A78BFA') : T('#FFF7B0'));
  if (kind === 'ice') for (let k = 0; k < 4; k++) inked(g, [[-4 + k * 6, 6], [2 + k * 6, 6], [-1 + k * 6, 12 + (k % 2) * 4]], T('#E0F2FE'));
  // (horns back)
  inked(g, [[-2, -10], [-22, -20], [-26, -18], [2, -6]], Hn[3]);
  inked(g, [[2, -12], [-12, -26], [-15, -25], [6, -9]], Hn[4]);
  // (the lower jaw, dropped; the mouth inside; the upper jaw and skull)
  inked(g, [[2, 3], [16, 3], [32, 8], [33, 11], [18, 12], [2, 11]], R[2]);
  polyF(g, [[8, 1], [30, 1], [32, 8], [16, 4]], M);
  polyF(g, [[14, 3], [28, 2], [29, 5], [18, 4]], T('#C83A5A'));
  const skull: P[] = [[-6, -9], [4, -13], [14, -12], [24, -8], [34, -6], [37, -3], [34, 1], [14, 1], [2, 5], [-6, 7]];
  inked(g, skull, R[3]);
  polyF(g, [[-6, -9], [4, -13], [14, -12], [24, -8], [34, -6], [26, -5], [6, -8], [-4, -6]], R[4]);
  polyF(g, [[-6, 3], [2, 1], [14, 1], [34, 1], [34, 0], [2, 3], [-6, 7]], R[1]);
  // (teeth: down off the upper jaw, up off the lower)
  for (let k = 0; k < 4; k++) { polyF(g, [[16 + k * 5, 1], [19 + k * 5, 1], [17.5 + k * 5, 5]], Hn[5]); polyF(g, [[14 + k * 5, 5 + k], [17 + k * 5, 5 + k], [15.5 + k * 5, 1 + k]], Hn[5]); }
  // (the brow, the eye, a nostril, scales on the cheek)
  box(g, 8, -11, 10, 2, R[1]);
  box(g, 9, -9, 7, 5, INK); box(g, 10, -8, 5, 3, T('#FDE047')); box(g, 12, -8, 1, 3, INK); box(g, 10, -8, 1, 1, '#FFFFFF');
  box(g, 32, -5, 2, 1, INK);
  for (let k = 0; k < 3; k++) { box(g, -2 + k * 5, -2 + (k % 2) * 2, 3, 2, R[2]); box(g, -2 + k * 5, -2 + (k % 2) * 2, 2, 1, R[5]); }
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Breath

const flame = (g: Ctx, from: P, to: P, T: (c: string) => string) => {
  const n = 12;
  for (const pass of [0, 1, 2]) for (let i = 0; i <= n; i++) {
    const u = i / n, x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u + Math.sin(u * 9) * 2.2;
    const r = 2.5 + u * 4.5 + hash(i * 3.1) * 1.5;
    disc(g, x, y, pass === 0 ? r + 1.5 : pass === 1 ? r : r * 0.5, T(pass === 0 ? '#9A1414' : pass === 1 ? (i % 3 ? '#F97316' : '#EA580C') : '#FDE68A'));
  }
  for (let k = 0; k < 6; k++) box(g, Math.round(from[0] + (to[0] - from[0]) * hash(k * 1.7) - 2), Math.round(from[1] + (to[1] - from[1]) * hash(k * 1.7) - 8 - hash(k) * 5), 2, 2, T(k % 2 ? '#FDE047' : '#FB923C'));
};
const bolt = (g: Ctx, from: P, to: P, T: (c: string) => string) => {
  const n = 7, dx = to[0] - from[0], dy = to[1] - from[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) { const u = i / n, j = i === 0 || i === n ? 0 : (i % 2 ? 5 : -5) * (0.6 + hash(i * 2.3) * 0.6); pts.push([from[0] + dx * u + nx * j, from[1] + dy * u + ny * j]); }
  const fork: P[] = [pts[3], [pts[3][0] + dx * 0.12 - nx * 9, pts[3][1] + dy * 0.12 - ny * 9], [pts[3][0] + dx * 0.2 - nx * 6, pts[3][1] + dy * 0.2 - ny * 14]];
  for (const [w, col] of [[5, '#5B21B6'], [3, '#A78BFA'], [2, '#FDE047'], [1, '#FFFFFF']] as const) { line(g, pts, w, T(col)); line(g, fork, Math.max(1, w - 1), T(col)); }
};
const frost = (g: Ctx, from: P, to: P, T: (c: string) => string) => {
  const n = 16;
  for (const pass of [0, 1, 2]) for (let i = 0; i <= n; i++) {
    const u = i / n, x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u + Math.sin(u * 7 + 1) * 1.5;
    const r = 2 + u * 3.5;
    disc(g, x, y, pass === 0 ? r + 1 : pass === 1 ? r : r * 0.45, T(pass === 0 ? '#2563A8' : pass === 1 ? '#93C5FD' : '#F0F9FF'));
  }
  // (crystals flying in it, a snowflake or two, shards where it hits)
  for (let k = 0; k < 9; k++) {
    const u = hash(k * 2.9), x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u + (hash(k * 5.3) - 0.5) * 16;
    if (k % 3 === 0) { twinkle(g, Math.round(x), Math.round(y), 3, '#FFFFFF', T('#BAE6FD')); box(g, Math.round(x) - 2, Math.round(y) - 2, 1, 1, T('#BAE6FD')); box(g, Math.round(x) + 2, Math.round(y) + 2, 1, 1, T('#BAE6FD')); box(g, Math.round(x) + 2, Math.round(y) - 2, 1, 1, T('#BAE6FD')); box(g, Math.round(x) - 2, Math.round(y) + 2, 1, 1, T('#BAE6FD')); }
    else box(g, Math.round(x), Math.round(y), 2, 2, k % 2 ? '#FFFFFF' : T('#BAE6FD'));
  }
  for (let k = 0; k < 4; k++) inked(g, [[to[0] - 2, to[1]], [to[0] - 8 - k * 3, to[1] - 7 + k * 5], [to[0] + 1, to[1] + 2]], T('#E0F2FE'), T('#2563A8'));
};
/** Where flame meets bolt: a burst, fire's side orange, lightning's yellow, white at the heart. */
const burst = (g: Ctx, x: number, y: number, T: (c: string) => string) => {
  const star = (r0: number, r1: number, k: number, rot = 0): P[] => Array.from({ length: k * 2 }, (_, i) => { const a = rot + (i * Math.PI) / k, r = i % 2 ? r0 : r1; return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85] as P; });
  inked(g, star(5, 12, 8), T('#FDE047'), T('#7A2A08'));
  g.save(); g.beginPath(); g.rect(x - 14, y - 14, 14, 28); g.clip(); polyF(g, star(4, 10, 8), T('#FB923C')); g.restore();
  polyF(g, star(3, 7, 4, Math.PI / 4), '#FFF7D6'); disc(g, x, y, 2.5, '#FFFFFF');
  for (const [dx, dy] of [[-15, -4], [14, -6], [-9, 9], [11, 8]]) box(g, x + dx, y + dy, 2, 2, T(dx < 0 ? '#F97316' : '#FDE047'));
};

// ---------------------------------------------------------------------------------------------------------------
// The crest and the ribbon

/** The shield's outline (inset px in from its edge). */
const shield = (k = 0): P[] => {
  const hw = 92 - k, top = -46 + k, side = 6, tip = 62 - k * 1.3, out: P[] = [[-hw, top], [hw, top], [hw, side]];
  for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; out.push([u * u * hw + 2 * u * t * hw + t * t * 0, u * u * side + 2 * u * t * (side + 38 - k) + t * t * tip]); }
  for (let i = 1; i < 10; i++) { const t = i / 10, u = 1 - t; out.push([-(t * t * hw + 2 * u * t * hw), t * t * side + 2 * u * t * (side + 38 - k) + u * u * tip]); }
  out.push([-hw, side]);
  return out;
};
/** The studs round the shield's rim that show (down its sides and round its foot, under the ribbon; clear of ICE's
 *  head): where the queue's live bulbs go, about the logo's middle. */
export const logoStuds = (): P[] => {
  const out: P[] = [], hw = 89.5;
  for (let y = -12; y <= 4; y += 8) out.push([-hw, y], [hw, y]);
  for (let i = 1; i <= 9; i++) {
    const t = i / 10, u = 1 - t, x = u * u * hw + 2 * u * t * hw, y = u * u * 6 + 2 * u * t * 41.5 + t * t * 58;
    out.push([-x, y]);
    if (y < 24) out.push([x, y]);
  }
  return out.map(([x, y]) => [Math.round(x), Math.round(y)] as P);
};

const ribbon = (g: Ctx, T: (c: string) => string) => {
  const R = ramp6(T('#D9468A')), Gd = GOLD.map(T);
  for (const s of [-1, 1]) {
    // (the swallowtail, behind; the fold going back to it)
    const tail: P[] = [[92, -38], [128, -38], [117, -26], [128, -14], [92, -14]].map(([x, y]) => [x * s, y] as P);
    inked(g, tail, R[2]);
    polyF(g, ([[94, -37], [124, -37], [121, -34], [94, -34]] as P[]).map(([x, y]) => [x * s, y] as P), R[3]);
    box(g, s > 0 ? 94 : -124, -18, 30, 2, R[1]);
    const fold: P[] = [[82, -44], [100, -38], [100, -14], [82, -20]].map(([x, y]) => [x * s, y] as P);
    inked(g, fold, R[1]);
  }
  // (the band across: a lit top, a shaded foot, gilt piping)
  box(g, -86, -46, 172, 26, INK);
  box(g, -85, -45, 170, 24, R[3]); box(g, -85, -45, 170, 2, R[4]); box(g, -85, -23, 170, 2, R[2]);
  box(g, -85, -42, 170, 1, Gd[4]); box(g, -85, -25, 170, 1, Gd[3]);
  for (let x = -80; x < 84; x += 12) { box(g, x, -44, 1, 1, R[5]); }
};

const crest = (g: Ctx, T: (c: string) => string) => {
  const V = ramp6(T('#6B3FA0')), Gd = GOLD.map(T);
  inked(g, shield(0), Gd[1]);
  polyF(g, shield(1), Gd[3]);
  polyF(g, shield(2), Gd[4]);
  g.save(); g.beginPath(); shield(2).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  box(g, 90 - 9, -46, 12, 120, Gd[1]); box(g, -92, 40, 184, 30, Gd[2]);
  g.restore();
  polyF(g, shield(5), INK);
  polyF(g, shield(6), V[3]);
  g.save(); g.beginPath(); shield(6).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  // (stepped shading: lit down the left, shaded down the right and into the foot)
  box(g, -92, -46, 40, 120, V[4]); box(g, -92, -46, 14, 120, V[5]);
  box(g, 40, -46, 60, 120, V[2]); box(g, 70, -46, 30, 120, V[1]); box(g, -92, 44, 184, 30, V[2]);
  // (the diaper: diamonds in a lighter lavender, gilt studs where they cross, pink in every other)
  for (let k = -10; k <= 10; k++) {
    const x = k * 18;
    line(g, [[x - 70, -46], [x + 70, 94]], 1, V[5]);
    line(g, [[x + 70, -46], [x - 70, 94]], 1, V[5]);
  }
  for (let r = 0; r < 8; r++) for (let k = -6; k <= 6; k++) {
    const x = k * 18 + (r % 2) * 9, y = -46 + 9 + r * 9 + ((r % 2) ? 0 : 0);
    if ((k + r) % 2 === 0) box(g, x - 1, y - 1, 3, 3, Gd[3]); else box(g, x, y, 1, 1, T('#F9A8D4'));
  }
  g.restore();
  // (the rim's studs: gilt balls, catching the light)
  for (const [x, y] of logoStuds()) ballR(g, x, y, 2, Gd, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The lettering

const LEAF = ['#FFFCE6', '#FCE58E', '#F4C64A', '#E09A28', '#B86E16'];
const nameLook = (glow?: string): Look => ({ sx: 4, sy: 4, gap: 2, bold: true, serif: true, fill: LEAF, dither: true, ink: '#24082E', hi: '#FFFFFF', lo: '#7A3E0C', glow });
const ribbonLook: Look = { sx: 2, sy: 2, gap: 2, bold: true, serif: true, fill: ['#FFFFFF', '#FFF4FB', '#F6DCEE'], dither: true, ink: '#3A0A28', shadow: '#7A1A4A' };
const NAME_Y = 20, RIB_Y = -26;

const lettering = (g: Ctx, o: LogoOpts) => {
  // (TRUELLING on the ribbon)
  signText(g, 'TRUELLING', 0, RIB_Y, ribbonLook);
  // (TRAGONS: the bloom after dark, the bevel stepped down behind, the gilt over it)
  if (o.glow) signText(g, 'TRAGONS', 0, NAME_Y, { sx: 4, sy: 4, gap: 2, bold: true, serif: true, fill: 'rgba(0,0,0,0)', glow: 'rgba(255,214,120,0.55)' });
  for (const [k, col] of [[4, '#12041C'], [3, '#2A0E44'], [2, '#3E1662'], [1, '#56208A']] as const) signText(g, 'TRAGONS', k, NAME_Y + k, { sx: 4, sy: 4, gap: 2, bold: true, serif: true, fill: col, ink: k === 4 ? '#12041C' : undefined });
  signText(g, 'TRAGONS', 0, NAME_Y, nameLook());
  // (gold-leaf glints on a few of its letters' shoulders)
  const W = signW('TRAGONS', nameLook()), x0 = Math.round(-W / 2) + 1, top = NAME_Y - 28;
  for (const [i, dx, dy] of [[0, 3, 2], [3, 18, 1], [5, 4, 3], [6, 20, 14]] as const) twinkle(g, x0 + i * 32 + dx, top + dy, 3, '#FFFFFF', '#FFF2B0');
};

// ---------------------------------------------------------------------------------------------------------------

const FIRE_PATH: P[] = [[-150, 58], [-172, 60], [-190, 46], [-184, 28], [-166, 20], [-162, 2], [-148, -14], [-128, -22], [-116, -32], [-120, -42]];
const BOLT_PATH: P[] = [[176, 34], [198, 30], [208, 14], [196, 0], [174, 2], [162, -6], [148, -14], [128, -22], [116, -32], [120, -42]];
const ICE_PATH: P[] = [[198, 38], [192, 56], [168, 64], [142, 62], [122, 60], [106, 54], [100, 50]];
/** The ribbon's tails (where FIRE's and LIGHTNING's necks go over them). */
const overTail = ([x, y]: P) => Math.abs(x) > 104 && Math.abs(x) < 134 && y > -40 && y < -10;

/** Paints the logo about (cx, cy). */
export const paintLogo = (g: Ctx, cx: number, cy: number, o: LogoOpts = {}) => {
  const T = o.dim ? (c: string) => dimmed(c) : (c: string) => c;
  const R = (col: string) => ramp6(T(col)), belly = ramp6(T('#F2D8A8'));
  g.save(); g.translate(Math.round(cx), Math.round(cy));
  // (stood off the wall: its shadow on the wall, the iron brackets it's on)
  if (o.wall) {
    g.save(); g.translate(5, 6); polyF(g, shield(0), 'rgba(16,8,28,0.38)'); polyF(g, [[-128, -38], [128, -38], [128, -14], [-128, -14]], 'rgba(16,8,28,0.3)'); g.restore();
    const I = IRON.map(T);
    for (const [x, y] of [[-96, -30], [96, -30], [-70, 38], [70, 38]]) { box(g, x - 4, y - 3, 8, 6, INK); box(g, x - 3, y - 2, 6, 4, I[2]); box(g, x - 3, y - 2, 6, 1, I[4]); }
  }
  // (the dragons' bodies behind it all; FIRE's and LIGHTNING's heads up top, ICE's at the foot)
  const Rf = R(LANE.fire), Rb = R(LANE.bolt), Ri = R(LANE.ice);
  body(g, BOLT_PATH, 2, 7, Rb, belly, T('#7C3AED'));
  body(g, FIRE_PATH, 2, 7, Rf, belly, T('#F59E0B'));
  crest(g, T);
  ribbon(g, T);
  // (their necks over the ribbon's tails: coiled round it)
  body(g, BOLT_PATH, 2, 7, Rb, belly, T('#7C3AED'), overTail);
  body(g, FIRE_PATH, 2, 7, Rf, belly, T('#F59E0B'), overTail);
  lettering(g, o);
  // (ICE curled along the foot, in front of the crest's point)
  body(g, ICE_PATH, 2, 7, Ri, ramp6(T('#E8F4FF')), T('#E0F2FE'));
  head(g, -120, -44, 1, Rf, 'fire', T);
  head(g, 120, -44, -1, Rb, 'bolt', T);
  head(g, 100, 50, -1, Ri, 'ice', T);
  // (the truel: flame and bolt meeting over the ribbon, frost across the foot at FIRE's tail)
  flame(g, [-84, -45], [-12, -55], T);
  bolt(g, [84, -45], [10, -56], T);
  burst(g, 0, -56, T);
  frost(g, [64, 52], [-136, 54], T);
  // (sparkles round it, in the land's colors)
  for (const [x, y, n, col] of [[-204, -24, 3, '#F9A8D4'], [-196, -60, 2, '#FDE68A'], [-62, -64, 2, '#BAE6FD'], [58, -66, 2, '#F9A8D4'], [204, -40, 3, '#FDE68A'], [-104, 34, 2, '#C4B5FD'], [-206, 10, 2, '#BAE6FD'], [176, -58, 2, '#C4B5FD'], [150, 22, 2, '#F9A8D4']] as const) twinkle(g, x, y, n, '#FFFFFF', T(col));
  g.restore();
};
