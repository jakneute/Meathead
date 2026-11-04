// The hill's lava, the look of it (the user's: "the lava at this section looks off"). Drawing only: the trench's hazard,
// where it burns and where he comes back out, is layout.ts's and chase.ts's, untouched.
//
//   THE FLOW   down the hillside into the trench, lying ON the slope on the one eye: a channel that wanders a little,
//              welling up out of a fissure on the ridge, out wide halfway down, narrowing into the gash in the trench's
//              far wall (where lavaBack's pour takes it over). Each edge on the hillside's own height at its own x, so it
//              tilts with the hill across as well as rising going back. The snow round it lit warm and melted back to
//              wet rock, crusted levees along both banks (lit on top, cracks glowing through them), the molten body
//              flat across (a red rim dithered in, then bands running across it at their depth, the hillside's own
//              lines, crawling down toward us in steps, each dithered into the next), its skin wrinkling, crust plates
//              riding it down and cracking open, bubbles, steam coming up where it meets the snow.
//   THE FALL   out of the trench's mouth over the rock face: a curved lip where it rolls over, ribbons falling (a baked
//              tile scrolled down, a second faster one of bright streaks over it, clots tumbling), crusted edges, its
//              glow on the face either side, steam off the snow at the lip, a splash at its foot (if it's in view).
//
// Painted once where it can be (the fall's tiles are stamps); the rest is a handful of polygons a frame.

import { GY } from '../geometry';
import { X, Y, R, LAVA, LAVA_DOWN } from './layout';
import { type Ctx, type View, box, poly, hash, at, stamp, mix, LAVA_R, BASALT, ROCK, SNOW, ROAD_D, SLOPE_D } from './paint';
import { lavaTop, pourAt, type Proj } from './ground';
import { checkerFill } from '../../../m1/game/render/pixelArt';

type Lava = typeof LAVA[number];
/** The hillside's world y at rx, depth d. */
type Top = (rx: number, d: number) => number;

/** Steps along the flow. */
const NF = 24;
/** Along the flow (t 0 at the ridge, 1 at the trench's far lip): its depth, its middle (world x, at the play plane) and
 *  its half-width (world px). */
export const flowAt = (l: Lava, t: number): [number, number, number] => {
  const d = SLOPE_D + t * (ROAD_D - SLOPE_D);
  const m = X(pourAt(l)) + (Math.sin(t * 6.1 + 0.8) * 22 + Math.sin(t * 13.7 + 2) * 6) * (1 - t) ** 1.2;
  // (rounded off at the top, where it wells up)
  const hw = (11 + 29 * Math.min(1, t / 0.7) ** 0.8 + Math.sin(t * 9.3 + 1.1) * 2.5 * (1 - t)) * Math.min(1, Math.sqrt(t / 0.07 + 0.08));
  return [d, m, hw];
};
const TS = Array.from({ length: NF + 1 }, (_, i) => i / NF);

/** The flow's outline `e` px out past its banks (`k` x its half-width, then `e`). */
const outline = (v: View, l: Lava, top: Top, k: number, e: number): [number, number][] => {
  const L: [number, number][] = [], Rt: [number, number][] = [];
  for (const t of TS) {
    const [d, m, hw] = flowAt(l, t), w = hw * k + e * (1 + 0.35 * Math.sin(t * 31 + e)), w2 = hw * k + e * (1 + 0.35 * Math.sin(t * 27 + e * 1.7 + 2));
    L.push(at(v.eye, m - w, top(R(m - w), d), d));
    Rt.push(at(v.eye, m + w2, top(R(m + w2), d), d));
  }
  return [...L, ...Rt.reverse()];
};
const fillPts = (c: Ctx, pts: [number, number][], style: string | CanvasPattern) => {
  c.fillStyle = style; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};
/** A band of the flow between t0 and t1, `k` x its half-width across. */
const band = (v: View, l: Lava, top: Top, t0: number, t1: number, k: number): [number, number][] => {
  const [d0, m0, h0] = flowAt(l, t0), [d1, m1, h1] = flowAt(l, t1);
  const p = (m: number, w: number, d: number) => at(v.eye, m + w, top(R(m + w), d), d);
  return [p(m0, -h0 * k, d0), p(m0, h0 * k, d0), p(m1, h1 * k, d1), p(m1, -h1 * k, d1)];
};
/** Steam where it meets snow: pale puffs coming up off (x, y), drifting with the wind, thinning out. */
export const steam = (c: Ctx, x: number, y: number, f: number, seed: number, s = 1, n = 4) => {
  for (let k = 0; k < n; k++) {
    const per = 80 + (k % 3) * 16, t = ((f + k * (per / n) + seed * 29) % per) / per, r = (2 + t * 9) * s;
    const px = x + (Math.sin(t * 3 + seed) * 3 + t * 16) * s, py = y - t * 46 * s, al = 0.34 * (1 - t);
    c.fillStyle = `rgba(226, 232, 242, ${al.toFixed(3)})`; c.fillRect(Math.round(px - r), Math.round(py - r * 0.6), Math.round(r * 2), Math.max(1, Math.round(r * 1.2)));
    c.fillStyle = `rgba(248, 250, 252, ${(al * 0.7).toFixed(3)})`; c.fillRect(Math.round(px - r * 0.5), Math.round(py - r * 0.6), Math.max(1, Math.round(r)), Math.max(1, Math.round(r * 0.5)));
  }
};

/** The flow down the hillside (drawn with the hillside, before the road covers its foot). Spent: crusted black. */
export const hillFlow = (c: Ctx, v: View, l: Lava, top: Top, f: number, done: boolean) => {
  // (on screen at all: by where its widest reach lands)
  const [, mm] = flowAt(l, 0.5), [sa] = at(v.eye, mm - 90, 0, SLOPE_D), [sb] = at(v.eye, mm + 90, 0, ROAD_D);
  if (sb < v.cam.x - 40 || sa > v.cam.x + 840) return;
  const fl = 0.85 + 0.15 * Math.sin(f * 0.11 + l.a) * Math.sin(f * 0.037);
  if (done) {
    // (crusted: the snow melted back round it, the basalt in its channel, its levees, a few cracks faintly glowing)
    fillPts(c, outline(v, l, top, 1, 6), mix(SNOW[1], ROCK[2], 0.55));
    fillPts(c, outline(v, l, top, 1, 3), BASALT[1]);
    fillPts(c, outline(v, l, top, 1, 0), BASALT[2]);
    fillPts(c, outline(v, l, top, 0.55, 0), BASALT[3]);
    const br = 0.5 + 0.5 * Math.sin(f * 0.025 + l.a);
    c.strokeStyle = `rgba(226, 104, 36, ${(0.18 + 0.18 * br).toFixed(3)})`; c.lineWidth = 1; c.beginPath();
    for (let k = 0; k < 6; k++) {
      const t0 = 0.1 + k * 0.14, [d0, m0, h0] = flowAt(l, t0), [d1, m1] = flowAt(l, t0 + 0.06), u = (hash(k * 3.7 + l.a) - 0.5) * h0;
      const [p0, q0] = at(v.eye, m0 + u, top(R(m0 + u), d0), d0), [p1, q1] = at(v.eye, m1 + u * 0.4, top(R(m1 + u * 0.4), d1), d1);
      c.moveTo(p0, q0); c.lineTo(p1, q1);
    }
    c.stroke();
    return;
  }
  // (its light on the snow round it: stepped, dithered at the outside, flickering)
  fillPts(c, outline(v, l, top, 1, 30), checkerFill(c, `rgba(253, 170, 110, ${(0.1 * fl).toFixed(3)})`, 0));
  fillPts(c, outline(v, l, top, 1, 20), `rgba(251, 146, 70, ${(0.08 * fl).toFixed(3)})`);
  fillPts(c, outline(v, l, top, 1, 13), `rgba(249, 125, 40, ${(0.1 * fl).toFixed(3)})`);
  // (the snow melted back off its banks: slush, then wet rock)
  fillPts(c, outline(v, l, top, 1, 9), checkerFill(c, mix(SNOW[1], ROCK[3], 0.5), 1));
  fillPts(c, outline(v, l, top, 1, 6), mix(ROCK[2], LAVA_R[0], 0.3));
  // (the levees: crust, lit along their tops, the inner edge glowing)
  fillPts(c, outline(v, l, top, 1, 3), BASALT[2]);
  fillPts(c, outline(v, l, top, 1, 1.5), mix(BASALT[1], LAVA_R[0], 0.5));
  const edge = (k: number, e: number, side: 1 | -1, col: string, w = 1) => {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    TS.forEach((t, i) => { const [d, m, hw] = flowAt(l, t), x = m + side * (hw * k + e), [p, q] = at(v.eye, x, top(R(x), d), d); i ? c.lineTo(p, q) : c.moveTo(p, q); });
    c.stroke();
  };
  edge(1, 2.5, -1, BASALT[5]); edge(1, 2.5, 1, BASALT[4]);
  // (the molten body: a deep red rim at its banks dithered in, then flat across: it lies on the slope, so its bands run
  // across it at their depth (the hillside's own lines), crawling down toward us in steps, each dithered into the next)
  fillPts(c, outline(v, l, top, 1, 0), LAVA_R[1]);
  fillPts(c, outline(v, l, top, 0.94, 0), checkerFill(c, LAVA_R[2], 0));
  fillPts(c, outline(v, l, top, 0.86, 0), LAVA_R[2]);
  const CORE = [3, 4, 4, 5, 4, 3, 3, 4, 3, 2], step = Math.floor(f / 10);
  for (let i = 0; i < NF; i++) {
    const t0 = TS[i], t1 = TS[i + 1], ci = CORE[(((i - step) % CORE.length) + CORE.length) % CORE.length];
    const nx = CORE[(((i + 1 - step) % CORE.length) + CORE.length) % CORE.length];
    poly(c, band(v, l, top, t0, t1, 0.8), LAVA_R[ci]);
    // (the step into the next band: its color dithered over this one's near half)
    if (nx !== ci) { c.fillStyle = checkerFill(c, LAVA_R[nx], i & 1); const p = band(v, l, top, t0 + (t1 - t0) * 0.5, t1, 0.8); c.beginPath(); p.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); }
  }
  // (crust plates riding it down, cracking open as they come; ripples, bubbles: the rivers' own, on the slope)
  const body = outline(v, l, top, 1, 0);
  c.save(); c.beginPath(); body.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const proj: Proj = (u, t) => {
    const tt = Math.max(0, Math.min(1, t)), [d, m, hw] = flowAt(l, tt), x = m + (u * hw) / 60, [sx, sy] = at(v.eye, x, top(R(x), d), d);
    return [sx, sy, d * 0.6];
  };
  // (its skin wrinkling: short folds bowed downhill here and there, carried on down, a dark crease, a lit fold under it)
  for (let k = 0; k < 16; k++) {
    const t0 = (k / 16 + f * 0.0009) % 1, u0 = (hash(k * 5.1 + l.a) - 0.5) * 1.1, uw = 0.25 + hash(k * 2.7) * 0.25;
    if (t0 < 0.04) continue;
    const fold = (dt: number, col: string) => {
      c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
      for (let j = 0; j <= 4; j++) { const s2 = -1 + j / 2, u = u0 + s2 * uw, tt = Math.min(1, t0 + dt + 0.01 * (1 - s2 * s2)), [d, m, hw] = flowAt(l, tt), x = m + u * hw, [p, q] = at(v.eye, x, top(R(x), d), d); j ? c.lineTo(p, q) : c.moveTo(p, q); }
      c.stroke();
    };
    fold(0, LAVA_R[1]); fold(0.006, k % 3 ? LAVA_R[5] : LAVA_R[6]);
  }
  lavaTop(c, proj, -60, 60, f, l.a + 7, 1 / 700);
  c.restore();
  // (cracks glowing through the levees, breathing)
  for (let k = 0; k < 10; k++) {
    if (((f >> 4) + k * 3) % 7 === 0) continue;
    const t = 0.08 + (k / 10) * 0.88, side = k % 2 ? 1 : -1, [d, m, hw] = flowAt(l, t);
    const x0 = m + side * (hw - 1), x1 = m + side * (hw + 3 + hash(k * 2.3) * 2);
    const [p0, q0] = at(v.eye, x0, top(R(x0), d), d), [p1, q1] = at(v.eye, x1, top(R(x1), d + 0.004), d + 0.004);
    c.strokeStyle = LAVA_R[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
    c.strokeStyle = LAVA_R[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo((p0 + p1) / 2, (q0 + q1) / 2); c.stroke();
  }
  // (where it wells up on the ridge: the fissure glowing, smoke and embers off it)
  const [d0, m0] = flowAt(l, 0), [vx, vy] = at(v.eye, m0, top(R(m0), d0), d0);
  box(c, vx - 7, vy - 1, 14, 3, LAVA_R[1]); box(c, vx - 4, vy - 1, 8, 2, LAVA_R[5]); box(c, vx - 1, vy - 1, 3, 1, LAVA_R[6]);
  // (steam coming up off its banks into the cold)
  for (let k = 0; k < 6; k++) {
    const t = 0.12 + k * 0.15, side = k % 2 ? 1 : -1, [d, m, hw] = flowAt(l, t), x = m + side * (hw + 7), [p, q] = at(v.eye, x, top(R(x), d), d);
    steam(c, p, q, f, k + l.a * 0.01, d * 0.8, 3);
  }
};

const FALL_TH = 96;
/** The fall's tile (w across, FALL_TH down, seamless top to bottom): ribbons of molten in stepped ramps, dithered at
 *  each step, pulsing, clots of crust in them, the crusted edges wobbling. */
const paintFall = (g: Ctx, w: number) => {
  const TH = FALL_TH, TAU = Math.PI * 2;
  const rib: { c: number; hw: number; k: number; ph: number }[] = [];
  for (let i = 0, x = 8; x < w - 8; i++) { const hw = 7 + hash(i * 3.1) * 7; rib.push({ c: x + hw, hw, k: 1 + (i % 2), ph: hash(i * 5.3) * TAU }); x += hw * 1.6; }
  const RAMP = [LAVA_R[1], LAVA_R[2], LAVA_R[3], LAVA_R[4], LAVA_R[5], LAVA_R[6]], CUT = [0.16, 0.36, 0.56, 0.76, 0.93];
  for (let y = 0; y < TH; y += 2) {
    const pulse = 0.86 + 0.14 * Math.sin((y / TH) * TAU * 2);
    for (let x = 0; x < w; x += 2) {
      let it = 0;
      for (const r of rib) { const cx = r.c + Math.sin((y / TH) * TAU * r.k + r.ph) * 2.5; it = Math.max(it, 1 - Math.abs(x + 1 - cx) / r.hw); }
      it = it * pulse + (((x + y) >> 1) & 1 ? 0.035 : -0.035);
      let i = 0; while (i < CUT.length && it > CUT[i]) i++;
      g.fillStyle = RAMP[i]; g.fillRect(x, y, 2, 2);
    }
    // (the crusted edges, wobbling down)
    const e = 3 + Math.round(1.5 + Math.sin((y / TH) * TAU * 3) * 1.5);
    g.fillStyle = LAVA_R[0]; g.fillRect(0, y, e, 2); g.fillRect(w - e, y, e, 2);
    g.fillStyle = BASALT[2]; g.fillRect(0, y, e - 2, 2); g.fillRect(w - e + 2, y, e - 2, 2);
  }
  // (clots of crust carried down in it, a lit top on each)
  for (let k = 0; k < Math.round(w / 30); k++) {
    const x = 10 + hash(k * 7.7) * (w - 20), y = 6 + hash(k * 2.9) * (TH - 16), s = 2 + Math.round(hash(k * 1.3) * 2);
    g.fillStyle = LAVA_R[0]; g.fillRect(Math.round(x), Math.round(y), s * 2, s + 1);
    g.fillStyle = BASALT[4]; g.fillRect(Math.round(x), Math.round(y), s * 2, 1);
  }
};
/** The faster streaks over the fall (seamless, see-through between). */
const paintStreaks = (g: Ctx, w: number) => {
  for (let k = 0; k < Math.round(w / 9); k++) {
    const x = 8 + hash(k * 4.1 + 1) * (w - 16), y = hash(k * 6.3) * FALL_TH, h = 6 + hash(k * 2.2) * 14;
    for (const yy of [y, y - FALL_TH]) { g.fillStyle = LAVA_R[5]; g.fillRect(Math.round(x), Math.round(yy), 2, Math.round(h)); g.fillStyle = LAVA_R[6]; g.fillRect(Math.round(x), Math.round(yy + 1), 1, Math.round(h * 0.5)); }
  }
};

/** The fall out of the trench's mouth over the rock face (live; spent's the crust's front, climb.ts's). */
export const hillFall = (c: Ctx, v: View, l: Lava, f: number) => {
  const la = X(l.a), lb = X(l.b), w = lb - la, surf = Y(Math.min(l.hl, l.hr)) + LAVA_DOWN, top = surf - 2;
  if (lb < v.v0 || la > v.v1 || top > v.bot) return;
  const foot = Math.min(GY, v.bot + 20), fl = 0.85 + 0.15 * Math.sin(f * 0.11 + l.a) * Math.sin(f * 0.037), mid = (la + lb) / 2;
  // (its glow on the rock face and the snow either side, stepped, flickering)
  for (const [e, al] of [[28, 0.04], [18, 0.06], [9, 0.08]] as const) { c.fillStyle = `rgba(249, 115, 22, ${(al * fl).toFixed(3)})`; c.fillRect(Math.round(la - e), Math.round(top - e * 0.6), Math.round(w + e * 2), Math.round(foot - top + e)); }
  // (the ribbons: the tile scrolled down, the streaks over it faster)
  c.save(); c.beginPath(); c.rect(la, top + 5, w, foot - top - 5); c.clip();
  const lay = (key: string, speed: number, paint: (g: Ctx) => void) => {
    const off = Math.floor(f * speed) % FALL_TH;
    for (let y = top + 5 - FALL_TH + off; y < foot; y += FALL_TH) { c.save(); c.translate(Math.round(la), Math.round(y)); stamp(c, key, 0, 0, w, FALL_TH, paint); c.restore(); }
  };
  lay(`hv-lavafall-${w}`, 1.5, g => paintFall(g, w));
  lay(`hv-lavastreak-${w}`, 2.75, g => paintStreaks(g, w));
  // (clots tumbling down it, faster than it)
  for (let k = 0; k < 5; k++) { const t = ((f * 2.2 + k * 61) % 420) / 420, x = la + 12 + hash(k * 3.3) * (w - 24), y = top + 10 + t * 420; box(c, x, y, 4, 3, LAVA_R[0]); box(c, x, y, 4, 1, BASALT[4]); }
  c.restore();
  // (the lip: rolling over in a curve, brightest where it thins over the edge)
  for (let x = la + 2; x < lb - 2; x += 2) {
    const u = (x + 1 - mid) / (w / 2), b = Math.round(4 * (1 - u * u)), wob = ((x >> 1) + (f >> 3)) % 5 === 0 ? 1 : 0;
    box(c, x, top - b, 2, 3, LAVA_R[4]);
    box(c, x, top - b + 2, 2, 2 + wob, Math.abs(u) < 0.8 ? LAVA_R[6] : LAVA_R[5]);
    box(c, x, top - b + 4 + wob, 2, 3 + b, LAVA_R[5]);
  }
  box(c, la, top - 1, 3, 9, LAVA_R[1]); box(c, lb - 3, top - 1, 3, 9, LAVA_R[1]);
  // (steam off the snow where it rolls over the edge, and up its sides)
  steam(c, la - 2, top - 2, f, 1, 1.2, 5); steam(c, lb + 2, top - 2, f, 2, 1.2, 5);
  for (let k = 0; k < 3; k++) { const y = top + 50 + k * 70; if (y < foot) { steam(c, la - 3, y, f, 3 + k, 0.8, 2); steam(c, lb + 3, y + 30, f, 6 + k, 0.8, 2); } }
  // (its foot, in view: the splash, a pool spreading, spatter thrown up)
  if (GY < v.bot + 20) {
    box(c, la - 26, GY - 3, w + 52, 4, LAVA_R[3]); box(c, la - 12, GY - 4, w + 24, 3, LAVA_R[5]); box(c, la + 6, GY - 5, w - 12, 2, LAVA_R[6]);
    for (let k = 0; k < 9; k++) {
      const t = ((f * 1.3 + k * 11) % 34) / 34, dx = (k - 4) * 9 * t, dy = (22 + (k % 3) * 10) * t - t * t * 34;
      box(c, mid + dx + (hash(k) - 0.5) * w * 0.6, GY - 4 - dy, 2, 2, t < 0.4 ? LAVA_R[6] : t < 0.75 ? LAVA_R[5] : LAVA_R[3]);
    }
  }
};
