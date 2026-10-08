import React from 'react';
import { WeaponType } from '../types';

// Weapon art and the arsenal cards they sit on in the pause menu. Each weapon is painted pixel by pixel on a 32x32
// grid the way the sprites are: its colors in flat steps lit from the upper left (dithered a row where two steps
// meet), an ink line round every solid part, a hard white glint. Painted once, then drawn as merged SVG rects.

const O = '#0B0B0F'; // ink
const N = 32;

type Pt = [number, number];
type Cell = { c: string; o: string | null } | null;

/** A 32x32 pixel canvas: each cell a color and the ink it wants round it (null: none). */
class Pix {
  g: Cell[] = new Array(N * N).fill(null);
  keep = new Set<number>();
  set(x: number, y: number, c: string, o: string | null = O) { if (x >= 0 && y >= 0 && x < N && y < N) this.g[y * N + x] = { c, o }; }
  has(x: number, y: number) { return x >= 0 && y >= 0 && x < N && y < N && !!this.g[y * N + x]; }
  /** Leave this cell empty when the ink goes on (a hole you see through). */
  hole(x: number, y: number) { this.keep.add(y * N + x); }
}

/** Every pixel whose center passes the test. */
const cells = (test: (x: number, y: number) => boolean): Pt[] => {
  const out: Pt[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (test(x + 0.5, y + 0.5)) out.push([x, y]);
  return out;
};
const rectC = (x: number, y: number, w: number, h: number): Pt[] => cells((px, py) => px > x && px < x + w && py > y && py < y + h);
const polyC = (v: Pt[]): Pt[] => cells((px, py) => {
  let inside = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    const [xi, yi] = v[i], [xj, yj] = v[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
});
const ellC = (cx: number, cy: number, rx: number, ry: number): Pt[] => cells((px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1);
/** A quadratic curve as points (for paths). */
const quad = (a: Pt, c: Pt, b: Pt, n = 8): Pt[] => {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  return out;
};

/** Pick a step of a ramp from 0..1, dithering the last quarter of each step into the next on a checkerboard. */
const step = (ramp: string[], t: number, x: number, y: number) => {
  const f = Math.max(0, Math.min(0.9999, t)) * ramp.length;
  let i = Math.floor(f);
  if (f - i > 0.75 && (x + y) % 2 === 0) i++;
  return ramp[Math.min(ramp.length - 1, i)];
};
const bbox = (P: Pt[]) => {
  let x0 = N, y0 = N, x1 = 0, y1 = 0;
  for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
};
type Fill = (x: number, y: number) => string;
const paint = (p: Pix, P: Pt[], f: Fill | string, o: string | null = O) => { for (const [x, y] of P) p.set(x, y, typeof f === 'string' ? f : f(x, y), o); };
/** Top to bottom in steps (a lit top edge down to the shadow under it). */
const rows = (P: Pt[], ramp: string[]): Fill => { const b = bbox(P); return (x, y) => ramp[Math.min(ramp.length - 1, Math.floor(((y - b.y0) / (b.h + 1)) * ramp.length))]; };
/** Left to right in steps (a cylinder standing up: the ramp's order is left to right). */
const cols = (P: Pt[], ramp: string[]): Fill => { const b = bbox(P); return (x) => ramp[Math.min(ramp.length - 1, Math.floor(((x - b.x0) / (b.w + 1)) * ramp.length))]; };
/** Lit from the upper left: light at the top left corner to dark at the bottom right, dithered. */
const diag = (P: Pt[], ramp: string[]): Fill => { const b = bbox(P); return (x, y) => step(ramp, ((x - b.x0) + (y - b.y0)) / (b.w + b.h), x, y); };
/** Round things: light around a spot up and left, falling off in rings. */
const radial = (P: Pt[], ramp: string[], lx: number, ly: number): Fill => {
  let m = 1; for (const [x, y] of P) m = Math.max(m, Math.hypot(x - lx, y - ly));
  return (x, y) => step(ramp, Math.hypot(x - lx, y - ly) / m, x, y);
};
/** A pixel line (Bresenham). */
const line = (p: Pix, x0: number, y0: number, x1: number, y1: number, c: string, o: string | null = O) => {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    p.set(x0, y0, c, o);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
};
const polyline = (p: Pix, v: Pt[], c: string, o: string | null = O) => { for (let i = 1; i < v.length; i++) line(p, v[i - 1][0], v[i - 1][1], v[i][0], v[i][1], c, o); };
/** The hard white glint, a softer pixel beside it. */
const glint = (p: Pix, x: number, y: number, soft?: string) => { p.set(x, y, '#FFFFFF'); if (soft) p.set(x + 1, y, soft); };

/** Ink round everything that wants it, then the cells as SVG rects (runs merged along each row). */
const finish = (p: Pix): React.ReactNode => {
  const g = p.g.slice();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (p.g[y * N + x] || p.keep.has(y * N + x)) continue;
    let ink: string | null = null;
    // (the four sides first, so a part's own ink wins over a corner's)
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const c = p.g[ny * N + nx];
      if (c && c.o) { ink = c.o; break; }
    }
    if (ink) g[y * N + x] = { c: ink, o: null };
  }
  const out: React.ReactNode[] = [];
  for (let y = 0; y < N; y++) {
    let x = 0;
    while (x < N) {
      const c = g[y * N + x];
      if (!c) { x++; continue; }
      let w = 1;
      while (x + w < N && g[y * N + x + w]?.c === c.c) w++;
      out.push(<rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={c.c} />);
      x += w;
    }
  }
  return <g>{out}</g>;
};
const draw = (fn: (p: Pix) => void) => { const p = new Pix(); fn(p); return finish(p); };

// Ramps, lightest first
const GUNMETAL = ['#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A', '#18181B'];
const STEEL = ['#F1F5F9', '#CBD5E1', '#94A3B8', '#64748B', '#475569'];
const WOOD = ['#FBBF24', '#D97706', '#B45309', '#92400E', '#78350F'];
const OLIVE = ['#7A7A55', '#63634A', '#4F4F3A', '#3F3F2E', '#2F2F22', '#1F1F16'];
const BRASS = ['#FEF08A', '#FACC15', '#CA8A04', '#A16207'];
const FIRE = ['#FEF9C3', '#FDE047', '#F59E0B', '#EA580C', '#B91C1C'];
const RED = ['#FECACA', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#7F1D1D'];

/** The picture of each weapon. */
export const WeaponArt: React.FC<{ type: WeaponType; size?: number }> = ({ type, size = 44 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
    {ART[type]}
  </svg>
);

/**
 * Meathead 2's ray gun (the pistol's slot there): the one in his fist, big. A chrome bulb of a body, a fin on its back,
 * the alien's pink coils glowing round the barrel, a dish at the muzzle with a spark in it; the grip wrapped in duct
 * tape, a red wire looping out of the body back into it.
 */
const PINK = ['#FDF2F8', '#FBCFE8', '#F472B6', '#DB2777', '#9D174D'];
const CHROME = ['#FFFFFF', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B'];
export const RAYGUN_ART: React.ReactNode = draw(p => {
  // The fin on its back, swept
  paint(p, polyC([[6, 9], [12, 5], [14, 5], [13, 11]]), (x, y) => step(['#71717A', '#52525B', '#3F3F46'], (y - 5) / 6, x, y));
  // The grip, under the back of it: duct tape, in bands
  const grip = polyC([[7, 16], [14, 16], [12.5, 28], [5.5, 28]]);
  paint(p, grip, (x, y) => (y % 3 === 0 ? '#A1A1AA' : x < 8 ? '#D4D4D8' : '#9CA3AF'));
  // The barrel, the coils round it, glowing
  const barrel = rectC(19, 11, 7, 5);
  paint(p, barrel, rows(barrel, ['#71717A', '#52525B', '#3F3F46', '#27272A']));
  for (const cx of [20, 23]) { const coil = rectC(cx - 0.5, 9, 2, 9); paint(p, coil, rows(coil, PINK)); }
  // The dish at the muzzle, the spark in it
  const dish = polyC([[25, 13.5], [29.5, 8], [31, 8], [31, 20], [29.5, 20], [25, 14.5]]);
  paint(p, dish, cols(dish, ['#52525B', '#A1A1AA', '#D4D4D8', '#71717A']));
  p.set(30, 13, '#FFFFFF', null); p.set(30, 14, '#F9A8D4', null); p.set(29, 13, '#F9A8D4', null);
  // The body: a fat chrome bulb, lit up top left
  const body = ellC(12.5, 13, 8, 5);
  paint(p, body, radial(body, CHROME, 9, 10));
  glint(p, 8, 10, '#F4F4F5'); p.set(10, 9, '#FFFFFF');
  // The little window on its side, the alien goo glowing in it
  const win = ellC(14, 13.5, 2.2, 1.6); paint(p, win, radial(win, PINK, 13, 13));
  // The trigger, and the wire looping out of the body back down into the grip
  p.set(15, 18, '#3F3F46'); p.set(15, 19, '#3F3F46');
  polyline(p, [[18, 17], [18, 21], [16, 23], [13, 23]], '#DC2626', null);
});

const ART: Record<WeaponType, React.ReactNode> = {
  // Handgun: a chunky semi-auto, serrated slide over the frame, the wood grip he holds it by
  GUN: draw(p => {
    p.set(4, 10, '#27272A'); p.set(4, 11, '#18181B');                                   // the hammer, cocked
    const grip = polyC([[6, 16], [15, 16], [13.5, 29], [4.5, 29]]);
    paint(p, grip, '#27272A');
    const panel = polyC([[7.5, 17], [13.5, 17], [12.3, 27.6], [6.2, 27.6]]);
    const wood = diag(panel, WOOD);
    paint(p, panel, (x, y) => ((x + y) % 2 === 0 && y % 2 === 1 ? '#92400E' : wood(x, y)));   // checkered
    paint(p, rectC(5, 28, 8, 1.6), '#52525B');                                          // the magazine's base plate
    const frame = rectC(8, 14, 17, 2.6);
    paint(p, frame, rows(frame, ['#52525B', '#3F3F46', '#27272A']));
    // trigger guard, drawn in ink round a hole, the trigger in it
    for (const [x, y] of [[15, 17], [15, 18], [15, 19], [16, 20], [17, 20], [18, 20], [19, 19], [19, 18], [19, 17]] as Pt[]) p.set(x, y, O, null);
    p.set(16, 17, '#A1A1AA', null); p.set(16, 18, '#71717A', null);
    for (const [x, y] of [[17, 17], [18, 17], [17, 18], [18, 18], [16, 19], [17, 19], [18, 19]] as Pt[]) p.hole(x, y);
    const slide = rectC(5, 8, 22, 6);
    paint(p, slide, rows(slide, ['#71717A', '#52525B', '#3F3F46', '#3F3F46', '#27272A', '#18181B']));
    for (const sx of [7, 9, 11]) { p.set(sx, 10, '#18181B'); p.set(sx, 11, '#18181B'); p.set(sx, 12, '#18181B'); p.set(sx + 1, 10, '#71717A'); }
    paint(p, rectC(16, 10, 5, 1), '#18181B'); p.set(16, 9, '#A1A1AA');                   // ejection port
    p.set(6, 7, '#3F3F46'); p.set(7, 7, '#3F3F46'); p.set(25, 7, '#52525B');             // sights
    const bush = rectC(27, 9, 2, 4);
    paint(p, bush, rows(bush, ['#CBD5E1', '#94A3B8', '#64748B', '#475569']));
    p.set(28, 10, '#18181B'); p.set(28, 11, '#18181B');                                  // the bore
    paint(p, rectC(6, 8, 6, 1), '#A1A1AA');
    glint(p, 7, 8, '#E4E4E7');
  }),

  // Shotgun Ice: the cryo shotgun, coolant glowing in its bands, frost on it, a snowflake coming off it
  SHOTGUN: draw(p => {
    const stock = polyC([[9, 12.5], [9, 19], [3.5, 23.5], [1, 23.5], [1, 16], [5, 13.5]]);
    paint(p, stock, diag(stock, ['#0369A1', '#075985', '#0C4A6E', '#082F49']));
    paint(p, rectC(1, 16, 1, 7.5), '#082F49');                                           // butt pad
    const pump = rectC(16, 16, 9, 3);
    paint(p, pump, rows(pump, ['#0EA5E9', '#0369A1', '#0C4A6E']));
    for (const gx of [18, 20, 22]) p.set(gx, 17, '#082F49');
    paint(p, rectC(25, 16, 3, 2), rows(rectC(25, 16, 3, 2), ['#CBD5E1', '#64748B']));   // magazine tube cap
    const rec = rectC(8, 11, 11, 7);
    paint(p, rec, rows(rec, ['#38BDF8', '#0EA5E9', '#0284C7', '#0284C7', '#0369A1', '#075985', '#0C4A6E']));
    for (const bx of [10, 13, 16]) for (let y = 12; y <= 16; y++) { p.set(bx, y, y === 12 ? '#F0F9FF' : '#7DD3FC'); p.set(bx + 1, y, y === 12 ? '#BAE6FD' : '#38BDF8'); }
    for (const [x, y] of [[10, 18], [10, 19], [11, 20], [12, 20], [13, 19], [13, 18]] as Pt[]) p.set(x, y, O, null); // trigger guard
    p.set(11, 18, '#94A3B8', null); p.hole(12, 19); p.hole(11, 19); p.hole(12, 18);
    const barrel = rectC(19, 12, 10, 4);
    paint(p, barrel, rows(barrel, STEEL.slice(0, 4)));
    const muz = rectC(28, 11, 2, 6);
    paint(p, muz, rows(muz, ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9']));
    p.set(29, 13, '#0C4A6E'); p.set(29, 14, '#0C4A6E');                                  // the bore, frosted round
    // frost caked on the top edges, an icicle under the barrel
    for (const [x0, x1] of [[9, 11], [19, 22], [25, 26]]) for (let x = x0; x <= x1; x++) p.set(x, 10, x === x0 ? '#FFFFFF' : '#E0F2FE');
    p.set(20, 11, '#E0F2FE'); p.set(26, 11, '#BAE6FD');
    p.set(26, 18, '#BAE6FD'); p.set(26, 19, '#7DD3FC');
    glint(p, 9, 11);
    // the snowflake
    const SF = '#F0F9FF', SO = '#0C4A6E';
    for (let k = -3; k <= 3; k++) { p.set(24 + k, 4, SF, SO); p.set(24, 4 + k, SF, SO); }
    for (const [x, y] of [[22, 2], [26, 2], [22, 6], [26, 6]] as Pt[]) p.set(x, y, '#BAE6FD', SO);
    p.set(24, 4, '#FFFFFF', SO);
    p.set(30, 8, '#BAE6FD', null); p.set(31, 6, '#E0F2FE', null);                       // a breath of frost off the muzzle
  }),

  // Flamethrower: the red fuel canister and its gauge, a hose over to the finned barrel, fire out of the nozzle
  FLAMETHROWER: draw(p => {
    const tank = rectC(2, 11, 7, 17).filter(([x, y]) => !((y === 11 || y === 27) && (x === 2 || x === 8)));
    paint(p, tank, cols(tank, ['#B91C1C', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D']));
    for (const sy of [14, 24]) for (let x = 2; x <= 8; x++) p.set(x, sy, x === 3 ? '#A1A1AA' : x > 6 ? '#27272A' : '#52525B');
    paint(p, ellC(5.5, 19.5, 2.2, 2.2), '#FDE68A');                                       // gauge
    p.set(4, 18, '#FEF9C3'); p.set(5, 19, '#7F1D1D'); p.set(6, 18, '#7F1D1D');
    paint(p, rectC(4, 9, 3, 2), rows(rectC(4, 9, 3, 2), ['#A1A1AA', '#52525B']));       // valve
    p.set(2, 13, '#FECACA');
    // the hose, up off the valve and over into the back of the barrel
    const hose: Pt[] = [[5, 8], [6, 7], [7, 6], [8, 6], [9, 7], [10, 8], [10, 9], [10, 10], [10, 11], [11, 12]];
    polyline(p, hose, '#27272A'); polyline(p, hose.map(([x, y]) => [x + 1, y + 1] as Pt), '#18181B');
    p.set(7, 6, '#52525B'); p.set(8, 6, '#52525B');
    // grip under the barrel
    const grip = polyC([[12, 18], [16, 18], [15, 24], [11, 24]]);
    paint(p, grip, diag(grip, ['#3F3F46', '#27272A', '#18181B']));
    const body = rectC(10, 13, 10, 6);
    paint(p, body, rows(body, GUNMETAL.slice(1)));
    for (const fx of [12, 15, 18]) { p.set(fx, 12, '#71717A'); for (let y = 13; y <= 18; y++) p.set(fx, y, y === 13 ? '#A1A1AA' : '#18181B'); }
    const noz = rectC(20, 13, 3, 5);
    paint(p, noz, rows(noz, ['#FDBA74', '#F97316', '#EA580C', '#C2410C', '#9A3412']));
    glint(p, 12, 13);
    // the fire, in flat rings hotter toward the nozzle
    const flame = polyC([[23, 13], [26, 8.5], [30.5, 4.5], [29, 10], [31.5, 15.5], [29, 21], [30.5, 26.5], [26, 22.5], [23, 18]]);
    paint(p, flame, (x, y) => { const d = Math.hypot(x - 22.5, (y - 15.5) * 0.9); return step(FIRE, d / 9, x, y); }, '#7F1D1D');
    p.set(27, 3, '#FDE047', '#7F1D1D'); p.set(25, 27, '#F59E0B', null);                  // embers
  }),

  // Big Fuckin' Boulder: the rock he throws, tan and craggy, moss on top, cracked, lit from the upper left
  BOULDER: draw(p => {
    const rock = polyC([[7, 8], [12, 3.5], [21, 3.5], [27.5, 8.5], [29.5, 17.5], [26, 26], [15, 29], [5.5, 25], [2.5, 15.5]]);
    paint(p, rock, radial(rock, ['#F0D2A8', '#D7A86E', '#B07D45', '#8B5A2B', '#6B4220', '#4E2F12'], 9, 7));
    // a lit facet up top and a shadowed one under the right
    paint(p, polyC([[18, 17], [28, 15], [26, 26], [17, 27.5]]), (x, y) => step(['#6B4220', '#4E2F12', '#3B2410'], ((x - 17) + (y - 16)) / 20, x, y));
    paint(p, polyC([[8, 9], [12.5, 5], [19, 5.5], [16, 10], [10, 12]]), (x, y) => ((x + y) % 2 ? '#F0D2A8' : '#E2BC88'));
    // cracks, the lip under each catching the light
    const C = '#2A1808';
    const crack1: Pt[] = [[12, 13], [14, 16], [13, 20], [15, 23]], crack2: Pt[] = [[14, 16], [18, 17]], crack3: Pt[] = [[21, 7], [22, 10], [24, 11]];
    for (const c of [crack1, crack2, crack3]) { polyline(p, c.map(([x, y]) => [x + 1, y] as Pt), '#D7A86E'); polyline(p, c, C); }
    // moss on the crown
    const moss = ellC(12.5, 5, 4.5, 2.4).concat(ellC(9, 7, 2, 1.5));
    paint(p, moss, diag(moss, ['#BEF264', '#84CC16', '#65A30D', '#3F6212']));
    p.set(15, 7, '#65A30D'); p.set(11, 8, '#3F6212');
    for (const [x, y] of [[20, 13], [8, 18], [24, 21], [11, 24], [19, 9]] as Pt[]) p.set(x, y, '#4E2F12');
    for (const [x, y] of [[6, 14], [17, 12], [9, 21]] as Pt[]) p.set(x, y, '#F0D2A8');
    glint(p, 7, 11, '#F0D2A8');
  }),

  // TSUNAMI!: a towering wave curling over, foam riding its crest, dark water under the lip
  TSUNAMI: draw(p => {
    const outline: Pt[] = [[2, 27], [2, 20], ...quad([2, 20], [4, 7], [16, 4]), ...quad([16, 4], [27, 2.5], [29.5, 11]), ...quad([29.5, 11], [24, 7.5], [20, 12]),
      ...quad([20, 12], [24, 12], [25.5, 16]), ...quad([25.5, 16], [20, 14], [17.5, 18]), ...quad([17.5, 18], [15, 22], [16.5, 27])];
    const wave = polyC(outline);
    paint(p, wave, diag(wave, ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A']));
    // the face of it, deep under the curl
    const under = polyC([[14, 9], [20, 8], [19, 13], [16, 17], [14, 24], [9, 26], [11, 16]]);
    paint(p, under, (x, y) => step(['#1D4ED8', '#1E40AF', '#1E3A8A', '#172554'], ((x - 9) + (y - 8)) / 22, x, y));
    // streaks running up the face
    polyline(p, [[5, 24], [5, 19], [7, 14], [10, 10], [14, 7]], '#93C5FD');
    polyline(p, [[8, 25], [8, 21], [10, 16]], '#60A5FA');
    // the foam on the crest: the top edge white, a dithered row of it under that
    const W = wave.filter(([x, y]) => x >= 12 && !wave.some(([a, b]) => a === x && b === y - 1));
    for (const [x, y] of W) { if (y > 12) continue; p.set(x, y, '#FFFFFF'); if ((x + y) % 2 === 0 || x > 24) p.set(x, y + 1, '#DBEAFE'); }
    p.set(29, 11, '#DBEAFE'); p.set(28, 10, '#FFFFFF');
    // spray off the lip
    for (const [x, y] of [[29, 3], [24, 1], [30, 7]] as Pt[]) p.set(x, y, '#DBEAFE', null);
    // the sea under it
    const sea = rectC(1, 26, 30, 4);
    paint(p, sea, rows(sea, ['#60A5FA', '#2563EB', '#1D4ED8', '#1E3A8A']));
    for (let x = 1; x <= 30; x++) if (x > 16 && (x % 4 === 0 || x % 4 === 1)) p.set(x, 26, '#DBEAFE');
    glint(p, 6, 13);
  }),

  // Rusty Needle Cannon: a fat syringe full of neon pink, the plunger rusting, a bead on the needle's tip
  NEEDLES: draw(p => {
    // Laid along the diagonal up to the right: u runs along it, v across it (v < 0 is the lit side, up and left)
    const on = (u0: number, u1: number, w: number) => cells((px, py) => { const u = (px - py) / Math.SQRT2, v = (px + py - 32) / Math.SQRT2; return u >= u0 && u < u1 && Math.abs(v) <= w; });
    const vOf = (x: number, y: number) => (x + 0.5 + y + 0.5 - 32) / Math.SQRT2;
    const across = (ramp: string[], w: number): Fill => (x, y) => step(ramp, (vOf(x, y) + w) / (2 * w), x, y);
    const press = on(-20, -17.6, 4.3);
    paint(p, press, across(RED.slice(1), 4.3));
    const rod = on(-17.6, -12, 1.1);
    paint(p, rod, (x, y) => ((x * 7 + y * 3) % 5 === 0 ? '#9A3412' : across(['#D1D5DB', '#9CA3AF', '#6B7280'], 1.1)(x, y)));
    const flange = on(-12, -10.6, 5.6);
    paint(p, flange, (x, y) => ((x + y * 2) % 4 === 0 ? '#B45309' : across(['#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280'], 5.6)(x, y)));
    const barrel = on(-10.6, 6.5, 3.6);
    paint(p, barrel, (x, y) => {
      const v = vOf(x, y), u = (x - y) / Math.SQRT2;
      if (Math.abs(v) > 2.6) return v < 0 ? '#F1F5F9' : '#94A3B8';                    // the glass wall
      if (u < -8.4) return '#CBD5E1';                                                    // empty glass behind the stopper
      if (u < -6.6) return '#27272A';                                                    // the rubber stopper
      return step(['#FFC2F3', '#FF6BE3', '#FF2BD6', '#C0139E', '#86106F'], (v + 2.6) / 5.2, x, y); // the good stuff
    });
    for (const mu of [-4, -1, 2, 5]) for (const [x, y] of on(mu, mu + 0.8, 3.6)) if (vOf(x, y) < -1.4) p.set(x, y, '#475569');
    const hub = on(6.5, 9.4, 2.1);
    paint(p, hub, across(RED.slice(1, 5), 2.1));
    const needle = on(9.4, 19.6, 0.75);
    paint(p, needle, (x, y) => (vOf(x, y) < 0 ? '#F3F4F6' : '#9CA3AF'));
    p.set(29, 2, '#FF6BE3', '#86106F');                                                  // a bead of it on the tip
    for (const [x, y] of on(-9.6, -9, 1)) p.set(x, y, '#FFFFFF');                        // the glass's shine
    glint(p, 11, 15);
  }),

  // Taser Overload: a hazard-striped stun gun, the cyan emitter, a bolt crackling off the prongs
  TASER: draw(p => {
    const grip = polyC([[5, 16], [12, 16], [10.5, 28], [3.5, 28]]);
    paint(p, grip, (x, y) => (y % 2 === 0 && x > 4 && x < 10 ? '#3F3F46' : diag(grip, ['#3F3F46', '#27272A', '#18181B'])(x, y)));
    for (const [x, y] of [[13, 17], [13, 18], [14, 19], [15, 19], [16, 18], [16, 17]] as Pt[]) p.set(x, y, O, null);
    p.set(14, 17, '#A1A1AA', null); p.hole(15, 17); p.hole(15, 18); p.hole(14, 18);
    const body = rectC(3, 10, 18, 7);
    paint(p, body, (x, y) => {
      if (y >= 14) return (x + y) % 4 < 2 ? (y === 14 ? '#FDE047' : '#FACC15') : '#18181B';  // hazard stripes along the bottom
      return ['#71717A', '#52525B', '#3F3F46', '#27272A'][y - 10];
    });
    paint(p, rectC(5, 11, 2, 2), '#22C55E'); p.set(5, 11, '#BBF7D0');                   // charge light
    paint(p, rectC(9, 11, 7, 1), '#18181B'); paint(p, rectC(9, 12, 7, 1), '#164E63');   // the charge meter
    for (let x = 9; x < 14; x++) p.set(x, 12, '#00E5FF');
    glint(p, 4, 10, '#A1A1AA');
    const emit = rectC(21, 9, 3, 9);
    paint(p, emit, rows(emit, ['#E0FFFF', '#67F3FF', '#00E5FF', '#00E5FF', '#00A3B8', '#006B7A']));
    for (const py of [10, 15]) { paint(p, rectC(24, py, 3, 1), '#E5E7EB'); paint(p, rectC(24, py + 1, 3, 1), '#6B7280'); }
    // the arc: a cyan bolt with a white-hot core, out between the prongs
    const G = '#00E5FF', K = '#164E63';
    const bolt: Pt[] = [[27, 13], [29, 10], [28, 13], [31, 12]];
    polyline(p, bolt, G, K); polyline(p, bolt.map(([x, y]) => [x, y + 1] as Pt), G, K);
    polyline(p, bolt, '#FFFFFF', K);
    polyline(p, [[26, 9], [27, 6], [29, 7], [30, 3]], G, K); p.set(27, 6, '#FFFFFF', K);
    polyline(p, [[26, 18], [28, 20], [27, 22], [30, 24]], G, K); p.set(28, 20, '#FFFFFF', K);
  }),

  // Sludge Barfer: a drum of glowing toxic goo, slopping out of the top and down its side into a puddle
  SLUDGE: draw(p => {
    const drum = rectC(5, 8, 16, 20).filter(([x, y]) => !((y === 8 || y === 27) && (x === 5 || x === 20)));
    paint(p, drum, cols(drum, ['#365314', '#65A30D', '#84CC16', '#4D7C0F', '#3F6212', '#3F6212', '#365314', '#1A2E05']));
    // the rolling hoops, the lit edge of each up top
    for (const hy of [12, 22]) for (let x = 5; x <= 20; x++) { p.set(x, hy, x < 9 ? '#A3E635' : x < 16 ? '#65A30D' : '#3F6212'); p.set(x, hy + 1, '#1A2E05'); }
    for (let x = 6; x <= 19; x++) { p.set(x, 8, x < 10 ? '#BEF264' : '#84CC16'); p.set(x, 9, '#1A2E05'); }   // the lid's rim
    // the hazard label
    const LAB = ['.YYYYY.', 'YKKYKKY', 'YKKYKKY', 'YYYKYYY', 'YYKKKYY', 'YYKKKYY', '.YYYYY.'];
    LAB.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') p.set(9 + i, 15 + j, ch === 'K' ? O : (i + j < 4 ? '#FDE047' : '#FACC15')); }));
    // the goo: welling up out of the bung, over the lip, a tongue of it down the front and a run down the side
    const S = ['#F7FEE7', '#D9F99D', '#BEF264', '#A3E635', '#84CC16', '#65A30D'], SO = '#1A2E05';
    const goo = ellC(15.5, 6.5, 4.5, 2.6).concat(rectC(15, 8, 3, 6), ellC(16.5, 14, 1.6, 1.6), rectC(19, 8, 4, 2), rectC(21, 9, 2, 12), ellC(22, 21, 1.5, 1.6));
    paint(p, goo, diag(goo, S), SO);
    const pool = ellC(23, 28.5, 7.5, 2);
    paint(p, pool, diag(pool, S.slice(1)), SO);
    for (const [x, y] of [[28, 23], [27, 24], [28, 24], [27, 25], [28, 25]] as Pt[]) p.set(x, y, y === 23 ? '#D9F99D' : '#A3E635', SO);                                 // a drip falling
    for (const [x, y] of [[13, 5], [17, 5], [21, 10], [19, 27]] as Pt[]) p.set(x, y, '#FFFFFF');
    p.set(14, 6, '#65A30D'); p.set(18, 7, '#84CC16');                                  // bubbles
    glint(p, 7, 10);
  }),

  // Oil Rocket Launcher: an olive launch tube with hazard bands and a sight, the red warhead coated in crude
  OIL_ROCKET: draw(p => {
    const bell = rectC(1, 10, 3, 10);
    paint(p, bell, rows(bell, ['#52525B', '#3F3F46', '#27272A', '#27272A', '#18181B']));
    const grip = polyC([[9, 18], [12, 18], [12, 24.5], [9, 24.5]]);
    paint(p, grip, diag(grip, ['#3F3F46', '#27272A', '#18181B']));
    paint(p, rectC(15, 18, 2, 3), '#27272A');
    const tube = rectC(4, 11, 18, 7);
    paint(p, tube, rows(tube, OLIVE));
    for (const bx of [6, 17]) for (let y = 11; y <= 17; y++) { p.set(bx, y, ['#FEF08A', '#FACC15', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#854D0E'][y - 11]); p.set(bx + 1, y, ['#FACC15', '#EAB308', '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#713F12'][y - 11]); }
    const sight = rectC(10, 7, 5, 3);
    paint(p, sight, rows(sight, ['#52525B', '#3F3F46', '#27272A']));
    p.set(12, 10, '#27272A'); p.set(14, 8, '#F87171'); p.set(14, 7, '#FECACA');         // mount, the red dot
    // the warhead: a steel collar, then the fat red cone
    paint(p, rectC(22, 11, 1, 7), rows(rectC(22, 11, 1, 7), STEEL));
    const war = polyC([[23, 9.5], [26.5, 9.5], [31, 14.5], [26.5, 19.5], [23, 19.5]]);
    paint(p, war, radial(war, RED.slice(1), 24, 11));
    // crude slopped over it, wet, running off in drips
    const oil = ellC(25.5, 10.5, 2.6, 1.6).concat(rectC(27, 11, 1, 3), ellC(27.5, 14.5, 0.9, 1.2), rectC(24, 19, 2, 2), ellC(25, 22.5, 1, 1.2), rectC(19, 18, 1, 2));
    paint(p, oil, '#0A0A0A');
    p.set(19, 21, '#0A0A0A'); p.set(25, 25, '#0A0A0A');
    for (const [x, y] of [[24, 10], [27, 12], [24, 22]] as Pt[]) p.set(x, y, '#71717A');
    p.set(25, 10, '#E5E7EB');
    glint(p, 24, 13, '#FECACA');
    paint(p, rectC(4, 11, 2, 1), '#A3A38A');
    glint(p, 9, 11);
  }),

  // Meathead 2's souvenir launcher: a length of white plastic pipe, duct-taped, a grip off a squirt gun, and a mesh
  // gift-shop bag of junk strapped on top: a little gold Eiffel Tower poking out, a pyramid, the face of Big Ben
  SOUVENIR: draw(p => {
    const grip = polyC([[9, 19], [13, 19], [12, 26], [8.5, 26]]);
    paint(p, grip, diag(grip, ['#F472B6', '#DB2777', '#9D174D']));
    paint(p, rectC(14, 19, 2, 3), '#27272A');
    const tube = rectC(2, 13, 25, 6);
    paint(p, tube, rows(tube, ['#FFFFFF', '#F4F4F5', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A']));
    // (the tape round it, twice)
    for (const tx of [6, 18]) { const tape = rectC(tx, 12.5, 3, 7); paint(p, tape, rows(tape, ['#D4D4D8', '#A1A1AA', '#A1A1AA', '#71717A', '#52525B', '#52525B', '#3F3F46'])); }
    // (the open end, dark inside)
    const mouthC = rectC(27, 12.5, 2, 7); paint(p, mouthC, rows(mouthC, ['#E4E4E7', '#A1A1AA', '#71717A', '#71717A', '#71717A', '#52525B', '#3F3F46']));
    for (let y = 14; y <= 17; y++) p.set(29, y, '#18181B');
    // The bag on top: red mesh, bulging
    const bag = ellC(12, 9, 8, 4.5);
    paint(p, bag, (x, y) => ((x + y) % 2 ? '#DC2626' : '#991B1B'));
    // what's poking out of it: the Eiffel Tower (gold), a pyramid, Big Ben's clock
    for (const [x, y, c] of [[9, 1, '#FDE047'], [9, 2, '#FACC15'], [9, 3, '#FACC15'], [8, 4, '#EAB308'], [10, 4, '#CA8A04'], [8, 5, '#EAB308'], [10, 5, '#A16207'], [7, 6, '#CA8A04'], [11, 6, '#A16207']] as const) p.set(x, y, c);
    const pyr = polyC([[13, 7], [16.5, 2.5], [20, 7]]);
    paint(p, pyr, (x, y) => (x < 16.5 ? step(['#FDE68A', '#FCD34D', '#F59E0B'], (y - 2) / 5, x, y) : step(['#F59E0B', '#D97706', '#B45309'], (y - 2) / 5, x, y)));
    const clock = ellC(5, 8, 2.2, 2.2); paint(p, clock, '#FEF3C7'); p.set(5, 8, '#292524'); p.set(5, 7, '#292524'); p.set(6, 8, '#292524');
    glint(p, 4, 14);
    glint(p, 10, 7);
  }),

  // Meathead 2's soul sucker: a haunted-house shop vac, a purple drum with a sickly green window, a flared intake out
  // front with the grinder's teeth in it, the gore bag (red, lumpy) hanging under
  SOUL_SUCKER: draw(p => {
    const bag = ellC(10, 22, 6.5, 5);
    paint(p, bag, radial(bag, ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D'], 8, 20));
    p.set(8, 20, '#FECACA'); p.set(12, 24, '#450A0A'); p.set(14, 21, '#450A0A');
    const grip = polyC([[13, 16], [16, 16], [15, 22], [12.5, 22]]);
    paint(p, grip, diag(grip, ['#52525B', '#3F3F46', '#27272A']));
    const drum = rectC(2, 8, 15, 9);
    paint(p, drum, rows(drum, ['#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3B0764', '#2E1065']));
    const win = rectC(5, 10, 5, 4); paint(p, win, (x, y) => ((x + y) % 2 ? '#86EFAC' : '#4ADE80'));
    const hose = rectC(17, 10.5, 5, 4); paint(p, hose, rows(hose, ['#71717A', '#52525B', '#3F3F46', '#27272A']));
    const mouthP = polyC([[22, 10.5], [30.5, 6], [30.5, 19], [22, 14.5]]);
    paint(p, mouthP, cols(mouthP, ['#A1A1AA', '#D4D4D8', '#A1A1AA', '#71717A']));
    for (let y = 8; y <= 17; y++) p.set(30, y, '#18181B');
    for (const y of [8, 11, 14, 17]) p.set(29, y, '#F4F4F5');
    glint(p, 4, 9);
  }),

  // Meathead 2's laser-guided flintlock: a long horse pistol, a walnut stock curving down into a brass-capped butt, the
  // long iron barrel banded in brass, the flint cocked back in its hammer, a cheap laser pointer taped under the barrel
  FLINTLOCK: draw(p => {
    const stock = polyC([[2, 13], [13, 12], [13, 16], [8, 17], [6, 25], [1, 24]]);
    paint(p, stock, diag(stock, WOOD));
    paint(p, rectC(0, 23, 6, 3), (x, y) => step(BRASS, (y - 23) / 3, x, y));
    const barrel = rectC(12, 11.5, 18, 4);
    paint(p, barrel, rows(barrel, ['#A1A1AA', '#71717A', '#52525B', '#3F3F46']));
    for (const bx of [17, 27]) paint(p, rectC(bx, 11, 2, 5), (x, y) => step(BRASS, (y - 11) / 5, x, y));
    paint(p, rectC(9, 8, 3, 4), '#71717A'); p.set(10, 7, '#E5E7EB'); p.set(11, 7, '#A1A1AA');
    paint(p, rectC(9, 16, 3, 2), '#52525B');
    paint(p, rectC(19, 16, 8, 2), rows(rectC(19, 16, 8, 2), ['#3F3F46', '#18181B']));
    p.set(27, 16, '#EF4444'); p.set(28, 16, '#FCA5A5', null); p.set(30, 16, '#EF4444', null);
    glint(p, 14, 12);
    glint(p, 4, 14);
  }),

  // Meathead 2's spellbook of the damned: a fat black tome bound in iron, a bone-white skull on the cover, the page edges
  // glowing violet
  SPELLBOOK: draw(p => {
    const book = rectC(4, 5, 21, 23);
    paint(p, book, diag(book, ['#3F3F46', '#27272A', '#18181B', '#0B0B0F']));
    const pages = rectC(25, 6, 3, 21);
    paint(p, pages, (x, y) => ((x + y) % 2 ? '#C084FC' : '#E9D5FF'));
    for (const [x, y] of [[4, 5], [22, 5], [4, 25], [22, 25]] as const) paint(p, rectC(x, y, 3, 3), '#A1A1AA');
    const skull = ellC(14.5, 14, 5, 4.5);
    paint(p, skull, radial(skull, ['#FFFFFF', '#F5F5F4', '#D6D3D1'], 13, 12));
    paint(p, rectC(11.5, 17.5, 6, 3), '#D6D3D1');
    for (const [x, y] of [[12, 13], [13, 13], [16, 13], [17, 13], [12, 14], [17, 14], [14, 16], [13, 19], [15, 19]] as const) p.set(x, y, '#0B0B0F', null);
    glint(p, 6, 7);
  }),

  // Dirty Dan's light machine gun: long and black, a vented shroud, a box of rounds hanging off it, the belt
  LMG: draw(p => {
    const stock = polyC([[1, 10.5], [8, 11.5], [8, 16], [1, 18]]);
    paint(p, stock, diag(stock, ['#52525B', '#3F3F46', '#27272A', '#18181B']));
    paint(p, rectC(1, 11, 1, 7), '#18181B');
    const grip = polyC([[8, 16], [11.5, 16], [10.5, 23], [7, 23]]);
    paint(p, grip, diag(grip, ['#3F3F46', '#27272A', '#18181B']));
    paint(p, rectC(21, 15, 7, 1), '#52525B');                                           // the bipod, folded up under it
    const rec = rectC(7, 10, 14, 6);
    paint(p, rec, rows(rec, ['#71717A', '#52525B', '#3F3F46', '#3F3F46', '#27272A', '#18181B']));
    // carry handle (a hole through it)
    paint(p, rectC(12, 6, 6, 1), '#52525B'); p.set(12, 7, '#3F3F46'); p.set(17, 7, '#3F3F46');
    paint(p, rectC(12, 8, 6, 2), '#3F3F46'); paint(p, rectC(12, 8, 6, 1), '#71717A');
    for (let x = 13; x <= 16; x++) p.hole(x, 7);
    const shroud = rectC(21, 11, 7, 4);
    paint(p, shroud, rows(shroud, ['#71717A', '#52525B', '#3F3F46', '#27272A']));
    for (const vx of [22, 25]) { p.set(vx, 12, '#0B0B0F'); p.set(vx + 1, 12, '#0B0B0F'); p.set(vx, 13, '#52525B'); }
    p.set(26, 10, '#3F3F46');                                                            // front sight
    paint(p, rectC(28, 12, 1, 2), '#94A3B8');
    paint(p, rectC(29, 11, 2, 4), rows(rectC(29, 11, 2, 4), ['#A1A1AA', '#71717A', '#52525B', '#3F3F46']));
    // the ammo box, olive drab, and the belt of brass out of it
    const box = rectC(12, 16, 7, 7);
    paint(p, box, diag(box, ['#8A8A60', ...OLIVE]));
    paint(p, rectC(12, 17, 7, 1), '#1F1F16'); p.set(15, 19, '#CBD5E1'); p.set(15, 20, '#64748B');
    paint(p, rectC(13, 21, 3, 1), '#FACC15');
    for (let k = 0; k < 4; k++) {
      const cx = 19 + k, cy = 16 + k * 2;
      p.set(cx, cy, BRASS[0]); p.set(cx + 1, cy, BRASS[1]); p.set(cx, cy + 1, BRASS[2]); p.set(cx + 1, cy + 1, BRASS[3]);
      p.set(cx + 2, cy + 1, '#C2410C');                                                 // the copper tip
    }
    glint(p, 8, 10, '#D4D4D8');
  }),
};

interface WeaponIconProps {
  type: WeaponType;
  isEquipped: boolean;
  isSelected: boolean;
  /** Keyboard hotkey shown in the corner (1-9). */
  slot?: number;
  /** 0..1 of a full load, or null for unlimited. */
  ammo?: number | null;
  /** Not usable right now (a ride that only allows the one weapon): greyed out, chained up. */
  locked?: boolean;
  onClick?: () => void;
}

/** An arsenal card: the weapon's art on a steel plate, with its hotkey, ammo gauge and equipped/selected states. */
const WeaponIcon: React.FC<WeaponIconProps> = ({ type, isEquipped, isSelected, slot, ammo, locked, onClick }) => {
  const empty = ammo !== null && ammo !== undefined && ammo <= 0;
  return (
    <div
      onClick={onClick}
      title={type.replace(/_/g, ' ')}
      className={`relative w-[72px] h-[72px] flex items-center justify-center ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} pointer-events-auto transition-all duration-150
        ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
      style={{
        background: isEquipped
          ? 'linear-gradient(160deg, #7F1D1D 0%, #450A0A 60%, #1C0505 100%)'
          : 'linear-gradient(160deg, #3F3F46 0%, #1F1F23 60%, #0E0E10 100%)',
        border: `3px solid ${isSelected ? '#FACC15' : isEquipped ? '#EF4444' : '#52525B'}`,
        boxShadow: isSelected
          ? '0 0 14px rgba(250, 204, 21, 0.8), inset 0 1px 0 rgba(255,255,255,0.25)'
          : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 0 rgba(0,0,0,0.5), 2px 2px 0 #000',
      }}
    >
      {/* Rivets */}
      {[[3, 3], [63, 3], [3, 63], [63, 63]].map(([x, y]) => (
        <span key={`${x}-${y}`} className="absolute w-[3px] h-[3px] rounded-full" style={{ left: x, top: y, background: '#A1A1AA', boxShadow: '0 1px 0 #000' }} />
      ))}
      <div className={empty || locked ? 'opacity-35 grayscale' : ''}><WeaponArt type={type} size={46} /></div>
      {locked && (
        <>
          {/* Chained up, a padlock on it */}
          <div className="absolute inset-[6px]" style={{ background: 'repeating-linear-gradient(45deg, transparent 0 9px, rgba(161,161,170,0.55) 9px 12px), repeating-linear-gradient(-45deg, transparent 0 9px, rgba(161,161,170,0.55) 9px 12px)' }} />
          <svg className="absolute" width="26" height="30" viewBox="0 0 26 30" style={{ filter: 'drop-shadow(1px 2px 0 #000)' }}>
            <path d="M7 13 V9 a6 6 0 0 1 12 0 V13" fill="none" stroke="#D4D4D8" strokeWidth="3.5" />
            <rect x="3" y="13" width="20" height="15" rx="2" fill="#FACC15" stroke="#000" strokeWidth="1.5" />
            <rect x="11.5" y="17" width="3" height="6" fill="#000" />
          </svg>
        </>
      )}
      {slot !== undefined && (
        <span className="absolute -top-[2px] -left-[2px] px-[3px] text-[7px] leading-[11px] font-black text-black" style={{ background: isSelected ? '#FACC15' : '#D4D4D8' }}>{slot}</span>
      )}
      {isEquipped && (
        <span className="absolute -top-[2px] -right-[2px] px-[3px] text-[6px] leading-[10px] font-black text-white bg-red-600">EQ</span>
      )}
      {/* Ammo gauge */}
      <div className="absolute left-[6px] right-[6px] bottom-[4px] h-[4px] bg-black/80 border border-black">
        {ammo === null
          ? <div className="h-full w-full" style={{ background: 'repeating-linear-gradient(90deg, #22C55E 0 3px, #15803D 3px 6px)' }} />
          : <div className="h-full" style={{ width: `${Math.max(0, Math.min(1, ammo ?? 1)) * 100}%`, background: (ammo ?? 1) > 0.3 ? '#22C55E' : '#EF4444' }} />}
      </div>
    </div>
  );
};

export default WeaponIcon;
