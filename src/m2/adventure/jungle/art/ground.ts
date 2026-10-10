// The jungle's ground, in fake 3D: the forest floor at the play plane going back (a strip of it behind where he walks,
// darker and hazier the further back, bushes along its far edge) and coming toward him (the floor under his feet, bent
// the SNES way so it fans out as he goes by); the ravines cut through it, deep (their banks going down in earth and
// rock, mist lying in them, roots hanging off the edges, darkness all the way down); the cliff and the overlook (a rock
// face, its side going back), the rock in the first ravine, and the gorge (a waterfall at the far end of it).

import { GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, farTint, skyAt } from '../../../timeOfDay';
import { stamp, bandedGradient, hazeBands, pixelBlob, bendFloor, BEND } from '../../../intro/art/kit';
import { GROUND, X, Y } from '../layout';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, clump, fern, bigLeaf, rockFace, LEAF, MOSS, EARTH, ROCK, RAVINE, BARK, PIX } from './paint';

const GY = GROUND_Y;
/** How far back the ground strip behind him goes (the bushes along its far edge). */
export const FAR = 0.62;
/** How far toward him the floor under his feet comes. */
const BAND = 160;
/** Deep (the bottom of everything that goes all the way down). */
const DEEP = GY + 1400;

export interface Run { a: number; b: number; y: number }
export const RUNS: Run[] = GROUND.map(([a, b, h]) => ({ a: X(a), b: X(b), y: Y(h) }));
/** The gaps between the runs: the ravines (left bank's height, right bank's). */
export const PITS = RUNS.slice(0, -1).flatMap((r, i) => (RUNS[i + 1].a - r.b > 1 ? [{ a: r.b, b: RUNS[i + 1].a, ya: r.y, yb: RUNS[i + 1].y }] : []));
const touching = (r: Run) => RUNS.some(o => o !== r && o.y === GY && (Math.abs(o.b - r.a) < 1 || Math.abs(o.a - r.b) < 1));
/** The floor at the ground line coming toward him: the ground runs, and under anything raised that stands on them. */
export const FLOOR: [number, number][] = (() => {
  const rs = RUNS.filter(r => r.y === GY || touching(r)).map(r => [r.a, r.b] as [number, number]).sort((p, q) => p[0] - q[0]);
  const out: [number, number][] = [];
  for (const r of rs) { const l = out[out.length - 1]; if (l && r[0] - l[1] < 1) l[1] = Math.max(l[1], r[1]); else out.push([...r]); }
  return out;
})();
/** Raised ground: the overlook, the rock in the ravine. */
const RAISED = RUNS.filter(r => r.y < GY);
/** Where the path out to the park starts (paving creeping in from here on). */
export const PATH_X = X(11380);

/** What a run's top's made of. */
const topCols = (r: Run) => (r.y === GY ? ['#3E4A1E', '#36401A', '#2E3616', '#262C12', '#1E2410'] : ['#4E5A3A', '#465034', '#3E462E', '#363C28', '#2E3222']);

// ---------------------------------------------------------------------------------------------------------------
// Going back: the strips of ground behind the play plane, the ravines going back between them, the faces of things

/** Things drawn at a depth (d of the way from the eye): drawn as if at the play plane, scaled toward the eye. */
export const atDepth = (c: Ctx, eye: { x: number; y: number }, d: number, draw: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore();
};

/** The bushes along the far edge of the ground: a tile, the same all along (stamped), cut to the run. */
const paintBushes = (g: Ctx, key: string, x0: number, base: number, cols: string[]) => {
  // (a back row of bushes, then ferns and big leaves in front of them)
  for (let i = 0; i < 12; i++) clump(g, x0 + i * 48 + hash(i * 1.9) * 20, base - 30 - hash(i) * 26, 44, 32, i * 7 + 2, cols, 2);
  for (let i = 0; i < 22; i++) {
    const x = x0 + i * 26 + hash(i * 3.3) * 16;
    if (i % 2) fern(g, x, base, 40 + hash(i) * 24, i, 0, cols, 3);
    else bigLeaf(g, x, base, 16 + hash(i) * 8, -Math.PI / 2 + (hash(i * 2) - 0.5) * 1.6, cols, 3);
  }
  void key;
};

export const drawGoingBack = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye;
  const haze = skyAt(0.9, tod);
  const pt = (x: number, y: number, d: number) => at(eye, x, y, d);
  // The gorge's far end: a rock wall a long way back, the waterfall coming down it (drawn first: everything's in front)
  const gorge = PITS.find(p => p.ya < GY - 100);
  if (gorge && gorge.b > v.v0 - 400 && gorge.a < v.v1 + 400) waterfall(c, v, gorge.a, gorge.b);
  // The ravines going back: dark, misty, between their banks (drawn under the strips)
  for (const p of PITS) {
    if (p.b < v.v0 - 300 || p.a > v.v1 + 300) continue;
    const [ax, ay] = pt(p.a, p.ya, FAR), [bx, by] = pt(p.b, p.yb, FAR);
    const topY = Math.min(ay, by, p.ya, p.yb);
    c.save();
    c.beginPath(); c.moveTo(p.a, Math.max(p.ya, GY - 4)); c.lineTo(p.a, p.ya); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(p.b, p.yb); c.lineTo(p.b, v.bot); c.lineTo(p.a, v.bot); c.closePath(); c.clip();
    const R = RAVINE.map(col => mix(farTint(col, 0.4, tod), '#000000', 0));
    const span = Math.max(40, v.bot - topY + 4);
    bandedGradient(c, Math.min(p.a, ax) - 4, topY - 2, Math.max(p.b, bx) - Math.min(p.a, ax) + 8, span, [mix(R[0], haze, 0.12), R[1], R[2], R[3], R[4], R[4], R[4]], 12);
    // (mist lying in it, in layers, the deeper the fainter)
    for (let k = 0; k < 3; k++) {
      const my = GY + 40 + k * 90;
      hazeBands(c, p.a - 200, my - 20, p.b - p.a + 400, 34, mix(haze, '#FFFFFF', 0.2), 0.0, 0.09 - k * 0.025, 4);
    }
    c.restore();
  }
  // The ground behind him, going back: bands, darker and hazier the further (bushes along the far edge, later)
  for (const r of RUNS) {
    if (r.b < v.v0 - 400 || r.a > v.v1 + 400 || eye.y > r.y - 2) continue;
    const cols = topCols(r), steps = 5;
    for (let i = 0; i < steps; i++) {
      const d0 = 1 - ((1 - FAR) * i) / steps, d1 = 1 - ((1 - FAR) * (i + 1)) / steps;
      const col = mix(farTint(cols[i], 0.6, tod), haze, i * 0.05);
      poly(c, [pt(r.a, r.y, d0), pt(r.b, r.y, d0), pt(r.b, r.y, d1), pt(r.a, r.y, d1)], col);
      // (dither at the step)
      const [, sy] = pt(r.a, r.y, d1), [lx] = pt(r.a, r.y, d1), [rx] = pt(r.b, r.y, d1);
      checker(c, lx, sy, rx - lx, PIX, mix(farTint(cols[Math.min(4, i + 1)], 0.6, tod), haze, (i + 1) * 0.05));
    }
    // (its floor: moss and leaf litter in patches, going back with it, smaller and hazier the further)
    const MC = [MOSS[1], MOSS[2], EARTH[2], '#4A3A1A', MOSS[3], EARTH[3]];
    for (let gx = Math.floor((v.v0 - 300) / 56) * 56; gx < v.v1 + 300; gx += 56) for (let row = 0; row < 5; row++) {
      const hs = gx * 0.013 + row * 7.1, wx = gx + hash(hs) * 50;
      if (wx < r.a + 6 || wx > r.b - 6) continue;
      const d = 1 - (1 - FAR) * ((row + 0.3 + hash(hs * 1.7) * 0.5) / 5);
      const [sx, sy] = pt(wx, r.y, d);
      const col = mix(farTint(MC[Math.floor(hash(hs * 2.3) * MC.length)], 0.6, tod), haze, (1 - d) * 0.45);
      c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(sx), Math.round(sy), (10 + hash(hs * 3.1) * 16) * d, (2 + hash(hs * 4.3) * 2) * d, 0, 0, Math.PI * 2); c.fill();
    }
    // (a few things lying about on it: logs, stones, a fern, going back with it)
    for (let k = 0; k < (r.b - r.a) / 180; k++) {
      const wx = r.a + 40 + hash(r.a + k * 3.7) * (r.b - r.a - 80), d = FAR + 0.05 + hash(r.a + k * 5.1) * (1 - FAR - 0.12);
      const [sx, sy] = pt(wx, r.y, d);
      if (sx < v.v0 || sx > v.v1) continue;
      const s = d * 0.9, kind = hash(r.a + k * 9.3);
      const fc = LEAF.map(col => mix(farTint(col, 0.6, tod), haze, (1 - d) * 0.5));
      if (kind < 0.4) fern(c, sx, sy, 26 * s, k + 1, 0, fc, 3);
      else if (kind < 0.6) { c.fillStyle = mix(farTint(ROCK[3], 0.6, tod), haze, (1 - d) * 0.5); c.beginPath(); c.ellipse(sx, sy - 3 * s, 12 * s, 6 * s, 0, Math.PI, 0); c.fill(); box(c, sx - 8 * s, sy - 7 * s, 8 * s, 2, mix(farTint(ROCK[5], 0.6, tod), haze, (1 - d) * 0.5)); }
      else if (kind < 0.75) { const lc = mix(farTint(BARK[3], 0.6, tod), haze, (1 - d) * 0.5); box(c, sx - 30 * s, sy - 9 * s, 60 * s, 9 * s, lc); box(c, sx - 30 * s, sy - 9 * s, 60 * s, 2, mix(farTint(MOSS[3], 0.6, tod), haze, (1 - d) * 0.5)); c.fillStyle = mix(farTint('#B08A5C', 0.6, tod), haze, (1 - d) * 0.5); c.beginPath(); c.ellipse(sx + 30 * s, sy - 4.5 * s, 3 * s, 4.5 * s, 0, 0, Math.PI * 2); c.fill(); }
      else bigLeaf(c, sx, sy, 14 * s, -Math.PI / 2 - 0.4, fc, 3);
    }
    // (the bushes along the far edge)
    const bc = LEAF.map(col => mix(farTint(col, 0.7, tod), haze, 0.22));
    atDepth(c, eye, FAR, () => {
      c.save(); c.beginPath(); c.rect(r.a, r.y - 200, r.b - r.a, 210); c.clip();
      for (let tx = Math.floor((r.a - 60) / 560) * 560; tx < r.b + 60; tx += 560) {
        const ex = eye.x + (tx - eye.x) * FAR;
        if (ex + 560 * FAR < v.v0 - 100 || ex > v.v1 + 100) continue;
        c.save(); c.translate(tx, r.y); stamp(c, `jg-bush-${tod.key}-${r.y === GY ? 0 : 1}`, -60, -110, 680, 116, g => paintBushes(g, '', 0, 0, bc)); c.restore();
      }
      c.restore();
    });
  }
  // The faces going back: the banks of the ravines (earth over rock), the overlook's ends, the rock's sides
  const face = (e: number, side: 1 | -1, top: number, bottom: number, raised: boolean) => {
    if (e < v.v0 - 500 || e > v.v1 + 500) return;
    bankFace(c, v, e, side, top, bottom, raised);
  };
  for (const p of PITS) { face(p.a, 1, p.ya, DEEP, p.ya < GY); face(p.b, -1, p.yb, DEEP, p.yb < GY); }
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const l = RUNS[i], r = RUNS[i + 1];
    if (Math.abs(l.b - r.a) > 1 || l.y === r.y) continue;
    if (l.y < r.y) face(l.b, 1, l.y, r.y, true); else face(r.a, -1, r.y, l.y, true);
  }
};

/**
 * A face going back from the play plane at x = e (a ravine's bank, the overlook's end, the rock's side), seen only
 * from its side: a skin of earth (unless it's rock all the way), then rock in blocks (lit along their tops, inked in
 * the seams), darker the further back and the further down; roots hanging off its top edge.
 */
const bankFace = (c: Ctx, v: View, e: number, side: 1 | -1, top: number, bottom: number, raised: boolean) => {
  const eye = v.eye;
  if ((eye.x - e) * side <= 1) return;
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - FAR) * k);
  const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(k0, y0), pt(k1, y0), pt(k1, y1), pt(k0, y1)], col);
  // (only as far down as can be seen)
  const bot = Math.min(bottom, eye.y + (v.bot - eye.y) / FAR + 40);
  const shade = (col: string, k: number, y: number) => mix(mix(farTint(col, 0.3, tod), haze, k * 0.25), '#030605', Math.min(0.85, Math.max(0, (y - top - 80) / 520)));
  const soil = raised ? 0 : 40;
  if (soil) for (let j = 0; j < 4; j++) { q(j / 4, top, (j + 1) / 4, top + soil, shade(EARTH[3 - (j >> 1)], j / 4, top)); q(j / 4, top, (j + 1) / 4, top + 3, shade(EARTH[5], j / 4, top)); }
  let y = top + soil, row = 0;
  while (y < bot) {
    const rh = 22 + hash(e * 0.01 + row * 3.7) * 60;
    const split = [0, 0.1 + hash(e + row) * 0.3, 0.45 + hash(e + row * 2) * 0.2, 0.7 + hash(e + row * 3) * 0.25, 1];
    for (let j = 0; j < 4; j++) {
      const k0 = split[j], k1 = split[j + 1], col = ROCK[2 + Math.floor(hash(e + row * 5 + j) * 3)];
      q(k0, y, k1, Math.min(bot, y + rh), shade(col, (k0 + k1) / 2, y));
      q(k0, y, k1, y + 3, shade(ROCK[5], (k0 + k1) / 2, y));
      // (the seams: inked)
      const [sx0, sy0] = pt(k0, y), [, sy1] = pt(k0, Math.min(bot, y + rh));
      box(c, sx0, sy0, 1, sy1 - sy0, 'rgba(10, 8, 6, 0.6)');
    }
    // (a strand of moss along a seam, now and then: it's a jungle)
    if (hash(e + row * 9.1) > 0.6) { const kk = hash(e + row) * 0.7, [mx, my] = pt(kk, y); box(c, mx, my, 10 * (1 - kk * 0.4), 2, shade(MOSS[3], kk, y)); }
    y += rh; row++;
  }
  // (roots hanging off the top edge of it, going back)
  for (let k = 0; k < 5; k++) {
    const d = 1 - (1 - FAR) * ((k + 0.5) / 5), [rx, ry] = at(eye, e, top, d), len = (16 + hash(e + k) * 40) * d;
    c.strokeStyle = mix(farTint(BARK[2], 0.4, tod), haze, (1 - d) * 0.4); c.lineWidth = 2;
    c.beginPath(); c.moveTo(rx, ry); c.quadraticCurveTo(rx + side * 4, ry + len * 0.5, rx + side * 1, ry + len); c.stroke();
  }
  const [x1, t1] = pt(1, top);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.stroke();
};

/** The gorge's far end: a cliff a long way back with the falls coming down it, the spray at the bottom. */
const waterfall = (c: Ctx, v: View, a: number, b: number) => {
  const tod = timeOfDay(), d = 0.48, mid = (a + b) / 2, f = v.f;
  const haze = skyAt(0.88, tod);
  atDepth(c, v.eye, d, () => {
    const x0 = mid - 560, x1 = mid + 560, top = Y(640);
    // (the cliff: rock, hazed, jungle along its top)
    c.save(); c.translate(x0, top);
    stamp(c, `jg-farcliff-${tod.key}`, -60, -120, x1 - x0 + 120, DEEP - top + 120, g => {
      const rk = ROCK.map(col => mix(mix(farTint(col, 1, tod), '#14261A', 0.45), haze, 0.25));
      rockFace(g, 0, 0, x1 - x0, DEEP - top, 77, rk);
      const lf = LEAF.map(col => mix(farTint(col, 1, tod), haze, 0.4));
      for (let i = 0; i < 30; i++) clump(g, i * 62 + hash(i) * 30, -10 + hash(i * 2) * 20, 46, 30, i * 5 + 9, lf, 1);
      // (vines down it)
      for (let i = 0; i < 16; i++) { const vx = hash(i * 4.4) * (x1 - x0), len = 60 + hash(i * 7) * 200; for (let y = 0; y < len; y += 4) box(g, vx + Math.sin(y * 0.05 + i) * 3, y, 3, 4, lf[2]); }
    });
    c.restore();
    // (the falls: a sheet of water in bands, streaks running down it, white where it breaks over the lip)
    const w = 150, fx = mid - w / 2, fy = top + 14;
    const W = ['#3E6A86', '#5A8CA8', '#7EB0C8', '#A8D4E4', '#DDF2F8'].map(col => mix(farTint(col, 0.8, tod), haze, 0.25));
    box(c, fx, fy, w, DEEP - fy, W[1]);
    for (let i = 0; i < 10; i++) box(c, fx + (i * w) / 10, fy, w / 10 + 1, DEEP - fy, W[(i * 7 + 3) % 4]);
    // (streaks falling: color cycling down the sheet)
    for (let i = 0; i < 26; i++) {
      const sx = fx + hash(i * 3.1) * (w - 4), sp = 3 + hash(i) * 2, len = 30 + hash(i * 5.7) * 60;
      for (let k = 0; k < 6; k++) {
        const sy = fy + (((f * sp + hash(i * 9 + k) * 2000) % 1600));
        box(c, sx, sy, 2, len, k % 2 ? W[3] : W[4]);
      }
    }
    // (the lip: white water curling over, rocks either side)
    for (let i = 0; i < w; i += 6) box(c, fx + i, fy - 4 + Math.round(Math.sin(f * 0.2 + i) * 1.5), 6, 8, i % 12 ? W[4] : W[3]);
    clump(c, fx - 20, fy - 6, 34, 22, 31, LEAF.map(col => mix(farTint(col, 1, tod), haze, 0.4)), 1);
    clump(c, fx + w + 20, fy - 6, 34, 22, 37, LEAF.map(col => mix(farTint(col, 1, tod), haze, 0.4)), 1);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: the overlook's face, the rock, the floor coming toward him (bent), the ravines' near banks

/** The floor under him, painted flat (bent afterwards): leaf litter, moss, roots across it, stones; paving near the end. */
const paintFloor = (g: Ctx, x0: number, w: number) => {
  // (banded: lighter at the line, where the light gets to it; darker coming toward him)
  bandedGradient(g, x0, GY, w, BAND, ['#4A5420', '#3C4219', '#323616', '#2A2C13', '#221F10', '#1A160C'], 8);
  const s = Math.floor(x0);
  // (moss in drifts)
  for (let i = 0; i < w / 40; i++) {
    const mx = x0 + hash(s + i * 1.3) * w, my = GY + 8 + hash(s + i * 2.9) ** 1.5 * (BAND - 20), sc = 1 + (my - GY) / 60;
    pixelBlob(g, mx, my, 22 * sc, 4 * sc, mix(MOSS[1], '#2A2C13', 0.3));
    pixelBlob(g, mx - 6 * sc + hash(s + i) * 8, my - 1, 12 * sc, 2.5 * sc, MOSS[2]);
  }
  // (fallen leaves: specks of brown, rust and green, bigger nearer)
  const lc = ['#6A4A22', '#8A5A26', '#A0662A', '#5E6A26', '#4A3A1A', '#7A7030'];
  for (let i = 0; i < w / 3; i++) {
    const lx = x0 + hash(s + i * 0.71) * w, ly = GY + 4 + hash(s + i * 1.93) * (BAND - 6), sc = 1 + (ly - GY) / 70;
    box(g, lx, ly, 2 * sc, Math.max(1, sc), lc[Math.floor(hash(s + i * 3.1) * lc.length)]);
  }
  // (roots snaking across it: lit on top)
  for (let i = 0; i < w / 150; i++) {
    const rx = x0 + hash(s + i * 4.7) * w, ry = GY + 14 + hash(s + i * 6.1) * (BAND - 40), len = 60 + hash(s + i * 8.3) * 140, sc = 1 + (ry - GY) / 70;
    g.lineCap = 'round';
    for (const [col, lw, dy] of [[INK, 5 * sc, 0], [BARK[2], 4 * sc, 0], [BARK[4], 1.5 * sc, -1.2 * sc]] as [string, number, number][]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(rx, ry + dy);
      g.bezierCurveTo(rx + len * 0.3, ry + dy - 6 * sc, rx + len * 0.6, ry + dy + 8 * sc, rx + len, ry + dy + 2 * sc); g.stroke();
    }
    g.lineCap = 'butt';
  }
  // (stones, lit on top; a mushroom or two)
  for (let i = 0; i < w / 90; i++) {
    const sx = x0 + hash(s + i * 5.9) * w, sy = GY + 10 + hash(s + i * 7.3) * (BAND - 20), sc = 0.7 + (sy - GY) / 60;
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy, 9 * sc + 1, 4 * sc + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ROCK[3]; g.beginPath(); g.ellipse(sx, sy, 9 * sc, 4 * sc, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ROCK[5]; g.beginPath(); g.ellipse(sx - 2 * sc, sy - 1.5 * sc, 5 * sc, 2 * sc, 0, 0, Math.PI * 2); g.fill();
    if (hash(s + i * 2.2) > 0.75) { box(g, sx + 10 * sc, sy - 6 * sc, 2 * sc, 6 * sc, '#E8DCC0'); g.fillStyle = '#C0392B'; g.beginPath(); g.ellipse(sx + 11 * sc, sy - 6 * sc, 5 * sc, 3 * sc, 0, Math.PI, 0); g.fill(); box(g, sx + 9 * sc, sy - 8 * sc, 2, 1, '#FFFFFF'); }
  }
  // (the path out to the park: flagstones creeping in, then paving)
  if (x0 + w > PATH_X) for (let row = 0; row < 7; row++) {
    const ry = GY + 6 + row * 22 + row * row * 0.6, rh = 14 + row * 3;
    for (let px = PATH_X - 100 + (row % 2) * 20; px < x0 + w + 40; px += 34 + row * 6) {
      const k = Math.max(0, Math.min(1, (px - PATH_X) / 260));
      if (hash(px * 0.13 + row) > k + 0.05) continue;
      const pw = 28 + row * 5 + hash(px + row) * 8;
      g.fillStyle = INK; g.beginPath(); g.ellipse(px + pw / 2, ry + rh / 2, pw / 2 + 1, rh / 2 + 1, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5E584A'; g.beginPath(); g.ellipse(px + pw / 2, ry + rh / 2, pw / 2, rh / 2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#767060'; g.beginPath(); g.ellipse(px + pw / 2 - 2, ry + rh / 2 - 2, pw / 2 - 3, rh / 2 - 3, 0, 0, Math.PI * 2); g.fill();
      box(g, px + pw * 0.25, ry + 3, pw * 0.3, 2, '#948C76');
      box(g, px + 2, ry + rh / 2 + 1, 6, 2, MOSS[2]);
    }
  }
  // (the lip: moss along the line, lit, grass sticking up out of it)
  box(g, x0, GY, w, 5, MOSS[2]); box(g, x0, GY, w, 3, MOSS[4]); box(g, x0, GY, w, 1, MOSS[5]);
  checker(g, x0, GY + 5, w, PIX, MOSS[1]);
  for (let i = 0; i < w / 7; i++) {
    const gx = x0 + i * 7 + hash(s + i) * 5, gh = 3 + hash(s + i * 1.7) * 6;
    box(g, gx, GY - gh, 1, gh, MOSS[3]); box(g, gx + 1, GY - gh + 2, 1, gh - 2, MOSS[5]);
  }
};

/** The top of the overlook, flat (bent after): rock, moss over it, the lip lit. */
const TOP_D = 28;
const paintTop = (g: Ctx, x0: number, w: number, y: number) => {
  bandedGradient(g, x0, y, w, TOP_D, [MOSS[3], MOSS[2], ROCK[3], ROCK[2]], 4);
  const s = Math.floor(x0);
  for (let i = 0; i < w / 30; i++) { const mx = x0 + hash(s + i) * w, my = y + 6 + hash(s + i * 2) * (TOP_D - 8); g.fillStyle = MOSS[1]; g.beginPath(); g.ellipse(mx, my, 16, 3, 0, 0, Math.PI * 2); g.fill(); box(g, mx - 8, my - 1, 10, 1, MOSS[4]); }
  box(g, x0, y, w, 3, MOSS[4]); box(g, x0, y, w, 1, MOSS[5]);
  for (let i = 0; i < w / 7; i++) { const gx = x0 + i * 7 + hash(s + i) * 5, gh = 3 + hash(s + i * 1.7) * 6; box(g, gx, y - gh, 1, gh, MOSS[3]); box(g, gx + 1, y - gh + 2, 1, gh - 2, MOSS[5]); }
  // (its edge coming toward him: the rock's lip, the face starting under it)
  box(g, x0, y + TOP_D - 2, w, 2, INK);
};

/** The overlook's face (and the rock's): stamped in chunks. Moss and roots hanging off the lip down it. */
const paintFace = (g: Ctx, x0: number, w: number, top: number, bottom: number, seed: number) => {
  rockFace(g, x0, top, w, bottom - top, seed);
  // (darker going down, toward the foot)
  hazeBands(g, x0, top + (bottom - top) * 0.5, w, (bottom - top) * 0.5, '#0A100C', 0, 0.45, 5);
  // (moss and creepers hanging off the lip)
  for (let i = 0; i < w / 12; i++) {
    const hx = x0 + i * 12 + hash(seed + i) * 8, len = 8 + hash(seed + i * 3.3) ** 2 * 90;
    for (let y = 0; y < len; y += 2) box(g, hx + Math.sin(y * 0.15 + i) * 1.5, top + y, 2, 2, y > len - 6 ? LEAF[4] : (y >> 1) % 3 ? LEAF[2] : LEAF[3]);
    if (len > 50) for (let k = 10; k < len; k += 14) { box(g, hx - 3, top + k, 3, 2, LEAF[4]); box(g, hx + 2, top + k + 6, 3, 2, LEAF[3]); }
  }
};

export const drawPlayPlane = (c: Ctx, v: View) => {
  // The raised ground's faces at the play plane (stamped, in chunks)
  for (const r of RAISED) {
    const bottom = touching(r) ? GY : DEEP;
    const CH = 256;
    for (let x = r.a, i = 0; x < r.b; x += CH, i++) {
      const w = Math.min(CH, r.b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      const fb = Math.min(bottom, v.bot + 40), ft = r.y + TOP_D;
      if (fb <= ft) continue;
      // (stamped from the top down, a screen's worth at a time)
      for (let y = ft, j = 0; y < fb; y += 512, j++) {
        if (y + 512 < v.top) continue;
        stamp(c, `jg-face-${r.a}-${i}-${j}`, x, y, w, 512, g => { g.save(); g.beginPath(); g.rect(x, y, w, 512); g.clip(); paintFace(g, x, w, ft, Math.max(ft + 200, Math.min(bottom, ft + 1400)), r.a + i * 17 + j * 3); g.restore(); });
      }
    }
    // (its top, flat: bent with the floor below)
    for (let x = r.a, i = 0; x < r.b; x += CH, i++) {
      const w = Math.min(CH, r.b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `jg-top-${r.a}-${i}`, x, r.y - 10, w, TOP_D + 10, g => paintTop(g, x, w, r.y));
    }
  }
  // The floor under him (stamped in chunks, flat, then bent)
  const CH = 512;
  for (const [a, b] of FLOOR) {
    for (let x = a, i = 0; x < b; x += CH, i++) {
      const w = Math.min(CH, b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `jg-floor-${a}-${i}`, x, GY - 10, w, BAND + 10, g => paintFloor(g, x, w));
    }
  }
  bendFloor(c, v.eye, GY, GY, GY + BAND, FLOOR[0][0], FLOOR[FLOOR.length - 1][1]);
  for (const r of RAISED) if (r.b > v.v0 && r.a < v.v1 && v.eye.y < r.y) bendFloor(c, v.eye, r.y, r.y, r.y + TOP_D, r.a, r.b);
  // The ravines' near banks: where the floor coming toward him stops, its earth going down (seen when he's looking at it)
  for (const p of PITS) {
    if (p.b < v.v0 - 300 || p.a > v.v1 + 300) continue;
    if (p.ya === GY || FLOOR.some(([, b]) => Math.abs(b - p.a) < 1)) nearBank(c, v, p.a, 1);
    if (p.yb === GY || FLOOR.some(([a]) => Math.abs(a - p.b) < 1)) nearBank(c, v, p.b, -1);
    // (mist rising out of it)
    const tod = timeOfDay(), mist = mix(skyAt(0.9, tod), '#FFFFFF', 0.3);
    const [mr, mg, mb] = [1, 3, 5].map(i => parseInt(mist.slice(i, i + 2), 16));
    c.save(); c.beginPath(); c.rect(p.a, v.top, p.b - p.a, v.bot - v.top); c.clip();
    hazeBands(c, p.a, GY - 70, p.b - p.a, 90, mist, 0, 0.12, 5);
    for (let k = 0; k < (p.b - p.a) / 90; k++) {
      const mx = p.a + ((hash(p.a + k) * (p.b - p.a) + v.f * (0.2 + hash(k) * 0.2)) % (p.b - p.a + 200)) - 100, my = GY - 10 + hash(p.a + k * 2) * 120 - ((v.f * 0.1 + k * 40) % 60);
      pixelBlob(c, mx, my, 50 + hash(k * 3) * 30, 8, `rgba(${mr}, ${mg}, ${mb}, 0.05)`);
    }
    c.restore();
  }
};

/** A ravine's near bank: the floor's edge (bent like the floor) and the earth and rock face hung under it. */
const nearBank = (c: Ctx, v: View, e: number, side: 1 | -1) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 120;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const band = (s0: number, s1: number, col: string) => poly(c, [...pts.map(([x, y]) => [x, y + s0] as [number, number]), ...pts.slice().reverse().map(([x, y]) => [x, y + s1] as [number, number])], col);
  const tod = timeOfDay();
  const E = EARTH.map(col => farTint(col, 0.2, tod)), R = ROCK.map(col => farTint(col, 0.2, tod));
  band(0, 4, E[5]); band(4, 18, E[4]); band(18, 34, E[3]); band(34, 42, E[2]);
  // (rock under the earth, in blocks along the bank: lit along their tops, darker the deeper)
  const dk = (col: string, sdown: number) => mix(col, '#030605', Math.min(0.92, 0.35 + Math.max(0, sdown - 40) / 220));
  for (let s0 = 42, row = 0; s0 < 520; row++) {
    const rh = 26 + hash(e * 0.01 + row * 2.9) * 30, st = 1 + Math.floor(hash(e + row * 1.3) * 3);
    for (let i = (row % 2); i < N; i += st) {
      const seg = pts.slice(i, Math.min(N, i + st) + 1);
      const col = dk(R[1 + Math.floor(hash(e + row * 3 + i) * 3)], s0);
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + rh] as [number, number])], col);
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + 3] as [number, number])], dk(R[5], s0));
      const [ix, iy] = seg[0];
      c.strokeStyle = 'rgba(10, 8, 6, 0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ix, iy + s0); c.lineTo(ix, iy + s0 + rh); c.stroke();
    }
    s0 += rh;
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  // (roots hanging off the edge into the dark, swaying a little)
  for (let k = 0; k < 6; k++) {
    const y = GY + 6 + hash(e + k * 1.7) * (BAND - 20), x = edge(y) + side * 2, len = 24 + hash(e + k * 3.1) * 70;
    const sw = Math.sin(v.f * 0.02 + k) * 3;
    for (const [col, lw] of [[INK, 4], [BARK[3], 2]] as [string, number][]) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + side * 8, y + len * 0.5, x + side * 4 + sw, y + len); c.stroke();
    }
    if (k % 2) { box(c, x + side * 4 + sw - 2, y + len - 2, 4, 3, LEAF[3]); }
  }
};
