// Futureland's ground, in fake 3D (one eye for the lot: paint.ts's view), shared by the square and the main drag.
// Going back from the play plane: the walk (pale pavers in bands, darker and hazier going back, their seams running
// away toward the eye, the pink and teal stripes inlaid across it, starbursts set in it), the far row along its far
// edge (planters, atomic palms, lollipop topiaries, the backs of the attractions, a monorail beam going along on its
// pylons; painted once for the hour); and the holes in it (the FUTURE SITE OF TOMORROW, the trench, the drained
// lagoon) going all the way back, their walls going down into the dark. At the play plane: the walk under his feet
// (the curb along the line lit: stand here), bent the SNES way so it fans out as he goes by; the holes' near walls hung
// under their lips.

import { bendFloor, BEND } from '../../intro/art/kit';
import { GY } from '../geometry';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, stamp, bandedGradient, hazeBands, pixelBlob, timeOfDay, farTint, skyAt, hourMix, PAVE, CONCRETE, PINK, TEAL, CHROME, ORANGE, LIP, ramp6 } from './paint';

/** How far back the walk goes (the far row along its far edge). */
export const FAR = 0.62;
/** How far toward him the walk under his feet comes. */
const BAND = 300;

export type PitKind = 'site' | 'trench' | 'lagoon';
export interface Pit { a: number; b: number; kind: PitKind }
export interface Ground { id: string; floor: [number, number][]; pits: Pit[] }

const tint = (col: string, k: number, d: number) => mix(farTint(col, k, timeOfDay()), skyAt(0.9, timeOfDay()), (1 - d) * 0.35);

// ---------------------------------------------------------------------------------------------------------------
// The far row (a tile painted once for the hour, put at depth FAR)

const RTW = 1200;
const paintRow = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const D = (c: string) => mix(mix(farTint(hourMix(c, mix(c, '#5A3050', 0.2), mix(c, '#0A0A20', 0.45), tod), 0.6, tod), '#3A3A60', 0.12), haze, 0.18);
  const bulb = tod.lamps > 0.3 ? '#FFE8A0' : D('#E8ECF4');
  // The attractions' backs, behind the rest: big pastel boxes with zigzag roofs, a dome, a rocket fin
  for (let i = 0, x = 0; x < RTW; i++) {
    const w = 140 + hash(i * 3.7) * 120, h = 110 + hash(i * 5.3) * 70, col = D(['#B8C8F0', '#E8B8D8', '#B8E8E0', '#F0E0B0'][i % 4]);
    const R = [mix(col, '#000000', 0.32), mix(col, '#000000', 0.16), col, mix(col, '#FFFFFF', 0.18)];
    box(g, x, -h, w, h, R[2]); box(g, x, -h, 3, h, R[3]); box(g, x + w - 5, -h, 5, h, R[1]); checker(g, x + w - 9, -h, 4, h, R[1], 0, 2);
    box(g, x, -h, w, 3, R[3]);
    if (i % 3 === 0) { g.fillStyle = R[1]; g.beginPath(); g.moveTo(x - 4, -h); for (let z = 0; z <= 6; z++) g.lineTo(x + (z * w) / 6, -h - (z % 2 ? 18 : 0)); g.lineTo(x + w + 4, -h); g.fill(); }
    else if (i % 3 === 1) { g.fillStyle = R[1]; g.beginPath(); g.arc(x + w / 2, -h, w * 0.3, Math.PI, 0); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(x + w / 2 - w * 0.08, -h - w * 0.08, w * 0.1, 0, Math.PI * 2); g.fill(); }
    else { g.fillStyle = R[1]; g.beginPath(); g.moveTo(x + w - 40, -h); g.lineTo(x + w - 18, -h - 60); g.lineTo(x + w - 10, -h); g.fill(); box(g, x + w - 20, -h - 62, 4, 4, bulb); }
    // (a row of porthole windows, a band of trim, bulbs along the eaves)
    for (let wx = x + 14; wx < x + w - 16; wx += 22) { g.fillStyle = R[0]; g.beginPath(); g.arc(wx + 5, -h + 30, 5, 0, Math.PI * 2); g.fill(); if (tod.lamps > 0.3 && hash(wx) > 0.4) { g.fillStyle = '#E8B060'; g.beginPath(); g.arc(wx + 5, -h + 30, 3, 0, Math.PI * 2); g.fill(); } }
    box(g, x, -h + 46, w, 5, R[1]);
    for (let bx = x + 6; bx < x + w - 4; bx += 12) box(g, bx, -h + 4, 2, 2, bulb);
    x += w + 30 + hash(i * 9.1) * 60;
  }
  // The monorail beam going along on its pylons (the far loop)
  const by = -150, bc = D('#C8D0E0');
  for (let x = 40; x < RTW; x += 220) { box(g, x - 5, by, 10, -by, D('#8A94A8')); box(g, x - 5, by, 3, -by, bc); box(g, x - 16, by + 8, 32, 6, D('#7A8498')); }
  box(g, 0, by - 2, RTW, 12, D('#7A8498')); box(g, 0, by - 2, RTW, 3, bc); box(g, 0, by + 8, RTW, 2, D('#5A6478'));
  // A hedge of planters along the edge of the walk: pink fiberglass tubs, clipped shrubs; atomic palms and lollipop
  // topiaries standing up out of them
  for (let x = 0; x < RTW; x += 60) {
    box(g, x, -34, 56, 34, D('#C8507E')); box(g, x, -34, 56, 4, D('#F08AB4')); box(g, x + 52, -34, 4, 34, D('#8E2A5A'));
    pixelBlob(g, x + 28, -40, 30, 12, D('#2E7A4A')); pixelBlob(g, x + 22, -46, 16, 6, D('#4EA060'));
  }
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * (RTW / 9) + hash(i * 1.9) * 40;
    if (i % 2) {
      // (an atomic palm: a ringed trunk curving up, fronds like a starburst)
      const th = 120 + hash(i) * 40;
      for (let y = 0; y < th; y += 6) box(g, x + Math.sin(y * 0.02) * 10 - 4, -40 - y, 8, 6, D(y % 12 ? '#8A6A4A' : '#6A4E34'));
      const tx = x + Math.sin(th * 0.02) * 10, ty = -40 - th;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.strokeStyle = D(k % 2 ? '#2E8A4A' : '#4EB060'); g.lineWidth = 5; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * 26, ty + Math.sin(a) * 14 - 10, tx + Math.cos(a) * 44, ty + Math.sin(a) * 22 + 6); g.stroke(); }
      g.fillStyle = D('#F0D060'); g.beginPath(); g.arc(tx, ty, 5, 0, Math.PI * 2); g.fill();
    } else {
      // (a lollipop topiary: a ball of clipped hedge on a stick)
      box(g, x - 2, -100, 4, 60, D('#6A4E34'));
      pixelBlob(g, x, -110, 22, 22, D('#2E7A4A')); pixelBlob(g, x - 6, -118, 10, 10, D('#5EB86A'));
    }
  }
  // (the haze lying over the lot)
  hazeBands(g, 0, -200, RTW, 200, haze, 0.04, 0.2, 5);
};

const drawFarRow = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye;
  atDepth(c, eye, FAR, () => {
    // (along the far edge of the holes too: they end in a far wall at FAR, the planters along its top)
    // (the tiles' span at FAR: wider than the screen by 1/FAR)
    const L = eye.x - (eye.x - v.cam.x + 200) / FAR, R = eye.x + (v.cam.x + 1000 - eye.x) / FAR;
    for (let tx = Math.floor(L / RTW) * RTW; tx < R; tx += RTW) { c.save(); c.translate(tx, GY); stamp(c, `spc-row-${tod.key}`, -10, -280, RTW + 20, 284, paintRow); c.restore(); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Going back

const back = (c: Ctx, eye: View['eye'], xa: number, xb: number, y: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, xa, y, d0), at(eye, xb, y, d0), at(eye, xb, y, d1), at(eye, xa, y, d1)], col);

/** A run of the walk going back from the play plane to FAR: pavers in bands (darker, hazier back), their seams across
 *  and running away toward the eye, the pink and teal stripes inlaid across it, a starburst set in it now and then. */
const walkBack = (c: Ctx, v: View, xa: number, xb: number) => {
  const eye = v.eye, d = FAR;
  if (eye.y >= GY - 1) return;
  const L = Math.max(xa, v.v0 - 300), R = Math.min(xb, v.v1 + 300);
  if (R <= L) return;
  const n = 6, P = PAVE;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - ((1 - d) * i) / n, d1 = 1 - ((1 - d) * (i + 1)) / n;
    back(c, eye, L, R, GY, d0, d1, tint(P[[5, 4, 4, 3, 3, 2][i]], 0.5, d0));
    if (i) { const [lx, sy] = at(eye, L, GY, d0), [rx] = at(eye, R, GY, d0); checker(c, lx, sy - 1, rx - lx, 2, tint(P[[5, 4, 4, 3, 3, 2][i - 1]], 0.5, d0)); }
  }
  const dAt = (j: number) => 1 - (1 - d) * (1 - Math.pow(1 - j / 10, 1.4));
  // (the stripes inlaid across it: pink, a teal one behind)
  for (const [j0, j1, col] of [[1.2, 1.9, PINK[3]], [2.2, 2.6, TEAL[3]], [6.4, 6.8, PINK[2]]] as const) back(c, eye, L, R, GY, dAt(j0), dAt(j1), tint(col, 0.5, dAt(j0)));
  // (rows of seams across, closer together going back)
  c.fillStyle = tint(P[1], 0.5, 0.8);
  for (let j = 1; j < 10; j++) { const [lx, ly] = at(eye, L, GY, dAt(j)), [rx] = at(eye, R, GY, dAt(j)); c.fillRect(Math.round(lx), Math.round(ly), Math.round(rx - lx), 1); }
  // (and running away toward the eye, staggered: the pavers)
  c.strokeStyle = tint(P[2], 0.5, 0.8); c.lineWidth = 1; c.beginPath();
  const seam = 48;
  for (let x = Math.ceil(L / seam) * seam; x < R; x += seam) for (let j = 0; j < 9; j++) {
    const xx = x + (j % 2) * seam * 0.5;
    if (xx > R) continue;
    const [ax, ay] = at(eye, xx, GY, dAt(j)), [bx, by] = at(eye, xx, GY, dAt(j + 1));
    c.moveTo(Math.round(ax) + 0.5, ay); c.lineTo(Math.round(bx) + 0.5, by);
  }
  c.stroke();
  // (starbursts set in it, squashed going back; popcorn, a dropped ticket)
  for (let sx = Math.floor(L / 420) * 420 + 160; sx < R; sx += 420) {
    const dd = dAt(4 + hash(sx * 0.01) * 3), [px, py] = at(eye, sx, GY, dd), r = 22 * dd;
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, len = k % 2 ? r * 0.5 : r; poly(c, [[px, py], [px + Math.cos(a - 0.2) * len * 0.3, py + Math.sin(a - 0.2) * len * 0.3 * 0.25], [px + Math.cos(a) * len, py + Math.sin(a) * len * 0.25], [px + Math.cos(a + 0.2) * len * 0.3, py + Math.sin(a + 0.2) * len * 0.3 * 0.25]], tint(k % 2 ? TEAL[3] : '#F0C840', 0.5, dd)); }
  }
  for (let gx = Math.floor(L / 37) * 37; gx < R; gx += 37) {
    const h = gx * 0.013, wx = gx + hash(h) * 30, dd = dAt(1 + hash(h * 1.7) * 7);
    const [sx, sy] = at(eye, wx, GY, dd);
    if (hash(h * 3.1) > 0.85) box(c, sx, sy - 1, 2, 1, tint('#FFF6D0', 0.5, dd));
    else if (hash(h * 4.3) > 0.93) box(c, sx, sy - 1, 4 * dd, 1, tint('#E86F6F', 0.5, dd));
  }
};

/** A face going back from the play plane at x = e, down from GY (a hole's wall), to depth FAR (seen from its side): in
 *  courses (concrete, or the lagoon's pool tile), darker going back and darker the deeper (pure black, a long way down). */
const wallBack = (c: Ctx, v: View, e: number, side: 1 | -1, kind: PitKind) => {
  const eye = v.eye, d = FAR;
  if ((eye.x - e) * side <= 1) return;
  const bot = Math.min(GY + 1400, eye.y + (v.bot - eye.y) / d + 40);
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - d) * k);
  const R = kind === 'lagoon' ? ['#0E2A3E', '#1A4660', '#2A6A88', '#4A92B0', '#7ABCD4', '#B4E2EE'] : CONCRETE;
  const dk = (col: string, y: number) => mix(col, '#000000', Math.min(1, Math.max(0, (y - GY - 10) / 380)));
  const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(k0, y0), pt(k1, y0), pt(k1, y1), pt(k0, y1)], col);
  for (let y = GY, row = 0; y < bot; row++) {
    const rh = (kind === 'lagoon' ? 10 : 18) + row * 3;
    for (let j = 0; j < 4; j++) {
      const k0 = j / 4, k1 = (j + 1) / 4;
      q(k0, y, k1, Math.min(bot, y + rh), dk(tint(R[[3, 2, 2, 1][j] + (row % 2 && j < 2 ? 1 : 0)], 0.5, 1 - k0 * (1 - d)), y));
      q(k0, y, k1, y + 1, dk(tint(R[1], 0.5, 1), y));
    }
    y += rh;
  }
  // (the lagoon's tide line: green scum a way down; the trench's conduit along it)
  if (kind === 'lagoon') { q(0, GY + 30, 1, GY + 36, tint('#3A5A2A', 0.5, 0.8)); q(0, GY + 36, 1, GY + 38, tint('#5A7A3A', 0.5, 0.8)); }
  if (kind === 'trench') { q(0, GY + 40, 1, GY + 48, tint('#4A4A58', 0.5, 0.8)); q(0, GY + 40, 1, GY + 42, tint('#8A8A98', 0.5, 0.8)); q(0, GY + 70, 1, GY + 76, tint('#B83C0C', 0.5, 0.8)); }
  const [x1, t1] = pt(1, GY);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, GY); c.lineTo(x1, t1); c.stroke();
};

/** A hole going back: the dark inside it (banded down to black), its far wall, what's at the bottom; then its walls. */
const pitBack = (c: Ctx, v: View, p: Pit) => {
  if (p.b < v.v0 - 300 || p.a > v.v1 + 300) return;
  const eye = v.eye, tod = timeOfDay(), haze = skyAt(0.9, tod);
  const [ax, ay] = at(eye, p.a, GY, FAR), [bx, by] = at(eye, p.b, GY, FAR);
  c.save();
  c.beginPath(); c.moveTo(p.a, GY); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(p.b, GY); c.lineTo(p.b, v.bot); c.lineTo(p.a, v.bot); c.closePath(); c.clip();
  const top = Math.min(ay, by) - 2, x0 = Math.min(p.a, ax) - 4, w = Math.max(p.b, bx) - x0 + 8;
  const deep = p.kind === 'lagoon' ? ['#2A5A70', '#1A3A50', '#0E2030', '#040A12'] : ['#3A3A48', '#22222C', '#101016', '#000000'];
  bandedGradient(c, x0, top, w, Math.max(40, GY + 160 - top), [mix(deep[0], haze, 0.15), deep[1], deep[2], deep[3]], 7);
  box(c, x0, GY + 158, w, v.bot - GY, deep[3]);
  // (the far wall: a flat face at FAR going down, in courses)
  const fy = ay;
  for (let y = fy, row = 0; y < fy + 200; row++) { const rh = 10 + row * 2; box(c, ax, y, bx - ax, 1, mix(deep[1], '#000000', row * 0.1)); y += rh; }
  if (p.kind === 'site') {
    // (rebar sticking up far down, a hard hat left lying, the form ties)
    for (let x = p.a + 30; x < p.b; x += 70) { box(c, x, GY + 220, 3, 90, '#57534E'); box(c, x, GY + 220, 1, 90, '#8A847E'); box(c, x - 2, GY + 218, 7, 2, '#8A847E'); }
    for (let x = ax + 10; x < bx; x += 40) box(c, x, fy + 20, 2, 2, '#4A4A54');
    c.fillStyle = '#B88A10'; c.beginPath(); c.ellipse(p.a + (p.b - p.a) * 0.6, GY + 300, 12, 6, 0, Math.PI, 0); c.fill();
  } else if (p.kind === 'trench') {
    // (pipes and conduits along its far wall, a work light caged, cable trays; it's lit dim)
    for (const [yy, col] of [[24, '#5A6A7A'], [44, '#7A2A1A'], [64, '#4A5A3A']] as const) { box(c, ax, fy + yy, bx - ax, 6, col); box(c, ax, fy + yy, bx - ax, 1, mix(col, '#FFFFFF', 0.3)); }
    for (let x = ax + 30; x < bx; x += 90) { box(c, x, fy + 14, 6, 6, '#2A2A30'); box(c, x + 1, fy + 15, 4, 4, tod.lamps > 0.3 ? '#FFE070' : '#C8A040'); }
  } else {
    // (the drained lagoon: puddles on its bottom far down, a submarine lying on its side, weed)
    const sx = p.a + (p.b - p.a) * 0.42, sy = GY + 330;
    c.fillStyle = '#0A1622'; c.beginPath(); c.ellipse(sx, sy + 8, 150, 14, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(sx, sy); c.rotate(0.12);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 122, 28, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3A4A58'; c.beginPath(); c.ellipse(0, 0, 120, 26, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#56687A'; c.beginPath(); c.ellipse(-8, -8, 104, 14, 0, 0, Math.PI * 2); c.fill();
    box(c, -20, -50, 34, 26, INK); box(c, -18, -48, 30, 24, '#4A5A6A'); box(c, -18, -48, 30, 3, '#7A8A9A');
    for (let k = -3; k <= 3; k++) { c.fillStyle = '#1A2430'; c.beginPath(); c.arc(k * 26, 2, 5, 0, Math.PI * 2); c.fill(); }
    box(c, -110, -4, 220, 3, '#B8C040');
    c.restore();
    for (let i = 0; i < 6; i++) { const wx = p.a + 80 + i * (p.b - p.a - 160) / 5; pixelBlob(c, wx, GY + 360 + hash(i) * 20, 30, 3, '#1A3A4A'); }
  }
  for (let k = 0; k < 2; k++) hazeBands(c, p.a - 200, ay + 6 + k * 60, p.b - p.a + 400, 30, mix(haze, '#C8D0E0', 0.3), 0.0, 0.08 - k * 0.03, 4);
  c.restore();
  wallBack(c, v, p.a, 1, p.kind);
  wallBack(c, v, p.b, -1, p.kind);
};

/** The far row, the walk going back, the holes. */
export const drawGoingBack = (c: Ctx, v: View, G: Ground) => {
  drawFarRow(c, v);
  for (const [a, b] of G.floor) if (b > v.v0 - 300 && a < v.v1 + 300) walkBack(c, v, a, b);
  for (const p of G.pits) pitBack(c, v, p);
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

/** The walk under him, painted flat (bent afterwards): the curb along the line (chrome-edged, lit: stand on it), the
 *  pavers in rows (bigger nearer) with the stripes inlaid, a starburst set in it, popcorn and litter, a drain. */
const paintFloor = (g: Ctx, x0: number, w: number) => {
  const tod = timeOfDay();
  const C = PAVE.map(col => farTint(col, 0.15, tod));
  const Pk = PINK.map(col => farTint(col, 0.15, tod)), Tl = TEAL.map(col => farTint(col, 0.15, tod));
  bandedGradient(g, x0, GY, w, BAND, [C[4], C[3], C[3], C[2], C[2], C[1]], 8);
  const s = Math.floor(x0);
  // (the pavers: rows of them, each lit along its top, shaded at its foot, staggered; the stripes' rows in color)
  for (let y = GY + 10, row = 0; y < GY + BAND; row++) {
    const rh = 6 + row * 2.4, cw = 22 + row * 5;
    const stripe = row === 2 ? Pk : row === 3 ? Tl : row === 7 ? Pk : null;
    for (let x = x0 - ((row * 11) % cw); x < x0 + w; x += cw) {
      const t = hash(s + x * 0.37 + row * 11.3);
      const R = stripe ?? C, col = stripe ? R[3] : R[t > 0.7 ? 4 : t > 0.25 ? 5 : 3];
      box(g, x + 1, y + 1, cw - 2, rh - 2, col);
      box(g, x + 2, y + 1, cw - 4, 1, stripe ? R[4] : C[6]);
      box(g, x + 1, y + rh - 2, cw - 2, 1, stripe ? R[2] : C[2]);
      if (!stripe && t < 0.08) checker(g, x + 3, y + 3, cw - 6, rh - 6, C[3], 0, 2);
    }
    y += rh;
  }
  // (starbursts set in it: gold and teal tiles)
  for (let sx = Math.floor(x0 / 420) * 420 + 160; sx < x0 + w; sx += 420) {
    const sy = GY + 110, r = 40;
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, len = k % 2 ? r * 0.5 : r; poly(g, [[sx, sy], [sx + Math.cos(a - 0.22) * len * 0.3, sy + Math.sin(a - 0.22) * len * 0.3 * 0.35], [sx + Math.cos(a) * len, sy + Math.sin(a) * len * 0.35], [sx + Math.cos(a + 0.22) * len * 0.3, sy + Math.sin(a + 0.22) * len * 0.3 * 0.35]], k % 2 ? Tl[3] : '#E8B830'); }
    g.fillStyle = '#FFF0A0'; g.beginPath(); g.ellipse(sx, sy, 6, 2.5, 0, 0, Math.PI * 2); g.fill();
  }
  // (litter: popcorn, ticket stubs, gum, a dropped ice cream melting)
  for (let i = 0; i < w / 5; i++) { const lx = x0 + hash(s + i * 0.71) * w, ly = GY + 12 + hash(s + i * 1.93) * (BAND - 20), sc = 1 + (ly - GY) / 80; box(g, lx, ly, 2 * sc, Math.max(1, sc), ['#FFF6D0', '#F4E8B0', '#2A2A30', '#E86F6F'][i % 4]); }
  for (let i = 0; i < w / 900; i++) {
    const cx = x0 + 100 + hash(s + i * 5.3) * (w - 200), cy = GY + 60 + hash(s + i * 2.1) * 80;
    g.fillStyle = '#F7C8DA'; g.beginPath(); g.ellipse(cx, cy, 16, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FCE4EE'; g.beginPath(); g.ellipse(cx - 3, cy - 1, 8, 2, 0, 0, Math.PI * 2); g.fill();
    poly(g, [[cx + 8, cy - 2], [cx + 26, cy - 8], [cx + 24, cy + 2]], '#D8A050'); box(g, cx + 14, cy - 5, 8, 1, '#A87030');
  }
  for (let i = 0; i < w / 700; i++) {
    const dx = x0 + 60 + hash(s + i * 7.7) * (w - 120), dy = GY + 34;
    box(g, dx - 1, dy - 1, 38, 14, INK); box(g, dx, dy, 36, 12, CHROME[2]);
    for (let k = 0; k < 7; k++) box(g, dx + 3 + k * 5, dy + 2, 2, 8, INK);
    box(g, dx, dy, 36, 1, CHROME[4]);
  }
  // (the curb along the line: chrome-edged concrete, lit along its top (it's what he walks on), its joints)
  box(g, x0, GY, w, 9, C[4]); box(g, x0, GY, w, 3, LIP[2]); box(g, x0, GY, w, 1, LIP[3]);
  for (let x = Math.floor(x0 / 64) * 64; x < x0 + w; x += 64) { box(g, x, GY + 1, 1, 8, C[2]); box(g, x + 1, GY + 3, 1, 6, C[6]); }
  box(g, x0, GY + 9, w, 1, INK); checker(g, x0, GY + 10, w, 2, C[1]);
};

/** A hole's near lip at the play plane: the walk's edge (bent like the walk) and the wall hung under it, darker the
 *  deeper (seen when he's looking at it). */
const nearBank = (c: Ctx, v: View, e: number, side: 1 | -1, kind: PitKind) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 120;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const R = kind === 'lagoon' ? ['#0E2A3E', '#1A4660', '#2A6A88', '#4A92B0', '#7ABCD4', '#B4E2EE'] : CONCRETE;
  const dk = (col: string, s: number) => mix(col, '#000000', Math.min(1, 0.15 + Math.max(0, s - 20) / 300));
  for (let s0 = 0, row = 0; s0 < 560; row++) {
    const rh = (kind === 'lagoon' ? 10 : 18) + row * 4;
    for (let i = row % 2; i < N; i += 2) {
      const seg = pts.slice(i, Math.min(N, i + 2) + 1);
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + rh] as [number, number])], dk(R[2 + ((row + i) % 2)], s0));
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + 2] as [number, number])], dk(R[4], s0));
    }
    s0 += rh;
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
};

/** The play plane: the walk under him (bent), the holes' near walls. */
export const drawPlayPlane = (c: Ctx, v: View, G: Ground) => {
  const CH = 512, tod = timeOfDay();
  for (const [a, b] of G.floor) {
    for (let x = a, i = 0; x < b; x += CH, i++) {
      const w = Math.min(CH, b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `spc-floor-${G.id}-${tod.key}-${a}-${i}`, x, GY - 2, w, BAND + 2, g => paintFloor(g, x, w));
    }
  }
  for (const [a, b] of G.floor) if (b > v.v0 && a < v.v1 && v.bot > GY + BAND) box(c, Math.max(a, v.v0), GY + BAND - 1, Math.min(b, v.v1) - Math.max(a, v.v0), v.bot - GY - BAND + 1, farTint(PAVE[1], 0.15, tod));
  bendFloor(c, v.eye, GY, GY, GY + BAND, G.floor[0][0], G.floor[G.floor.length - 1][1]);
  for (const p of G.pits) { nearBank(c, v, p.a, 1, p.kind); nearBank(c, v, p.b, -1, p.kind); }
};

/** After the bend, at the play plane: the holes' broken lips, and the barricades either side of each (orange and
 *  white sawhorses, a blinker on each after dark). */
export const drawPitDressing = (c: Ctx, v: View, G: Ground) => {
  for (const p of G.pits) {
    if (p.b < v.v0 - 100 || p.a > v.v1 + 100) continue;
    for (const [ex, s] of [[p.a, 1], [p.b, -1]] as const) {
      poly(c, [[ex, GY], [ex + s * 20, GY], [ex + s * 12, GY + 7], [ex + s * 22, GY + 12], [ex + s * 6, GY + 18], [ex, GY + 15]], INK);
      poly(c, [[ex, GY + 1], [ex + s * 18, GY + 1], [ex + s * 10, GY + 7], [ex + s * 19, GY + 11], [ex + s * 5, GY + 16], [ex, GY + 13]], CONCRETE[3]);
      box(c, Math.min(ex, ex + s * 16), GY + 1, 16, 2, LIP[2]);
    }
    for (const fx of [p.a - 70, p.b + 14]) {
      for (const lx of [fx + 4, fx + 46]) { box(c, lx - 1, GY - 34, 5, 34, INK); box(c, lx, GY - 34, 3, 34, ORANGE[3]); box(c, lx, GY - 34, 1, 34, ORANGE[5]); poly(c, [[lx - 6, GY], [lx + 1, GY - 12], [lx + 3, GY - 12], [lx + 10, GY]], ORANGE[1]); }
      for (const by of [GY - 31, GY - 19]) {
        box(c, fx - 2, by - 1, 60, 7, INK);
        for (let k = 0; k < 58; k += 8) box(c, fx - 1 + k, by, Math.min(8, 58 - k), 5, (k / 8) % 2 ? '#F8FAFC' : ORANGE[3]);
        box(c, fx - 1, by, 58, 1, 'rgba(255,255,255,0.5)');
      }
      const on = timeOfDay().lamps > 0.3 && (v.f >> 4) % 2 === 0;
      box(c, fx + 25, GY - 40, 8, 6, INK); box(c, fx + 26, GY - 39, 6, 4, on ? '#FFD040' : '#B88A10');
    }
  }
  void ramp6;
};
