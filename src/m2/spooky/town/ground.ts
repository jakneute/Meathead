// The town's ground, in fake 3D (one eye for it all: paint.ts's view). Going back from the play plane: the cobbled
// street in bands (darker and hazier the further back, the cobbles' seams running away toward the eye), a row of far
// townhouses standing along its far edge; the plaza, the ADA ramp and its terrace, and the castle stairs raised on it
// (their tops and their treads going back, their ends' faces, a balustrade along the stairs' far side); the BOTTOMLESS
// MOAT cut through it all (its walls going down in stone, darker and darker to pure black, no bottom to it anywhere).
// At the play plane: the raised things' near faces (their lit lips: stand here), and the street coming toward him under
// his feet, bent the SNES way so it fans out as he goes by (stopping at the moat's lips, its stone hung under them).

import { timeOfDay, farTint, skyAt, hourMix } from '../../timeOfDay';
import { bendFloor, BEND } from '../../intro/art/kit';
import { SECTIONS, GY } from '../geometry';
import { GROUND, MOAT, STAIRS, X, Y } from './layout';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, stamp, bandedGradient, hazeBands, pixelBlob, COBBLE, STONE, LIP, IRON } from './paint';

const { x1: SX1 } = SECTIONS.town;
/** How far back the street goes (the far townhouses along its far edge). */
export const FAR = 0.62;
/** How far back the stairs go (their balustrade along the far side). */
export const STAIR_D = 0.8;
/** How far toward him the street under his feet comes. */
const BAND = 160;
/** Deep (the bottom of everything that goes all the way down: and nothing does). */
const DEEP = GY + 1400;

export interface Run { a: number; b: number; ya: number; yb: number; stairs: boolean; surface: string }
export const RUNS: Run[] = GROUND.map(([a, ha, b, hb, surface]) => ({ a: X(a), b: X(b), ya: Y(ha), yb: Y(hb), stairs: surface === 'stairs', surface }));
const MA = X(MOAT.a), MB = X(MOAT.b);
/** The street at the ground line (under everything raised too), but for the moat. */
export const FLOOR: [number, number][] = [[X(-200), MA], [MB, X(12040)]];
const raised = (r: Run) => r.ya < GY || r.yb < GY;
const isStairs = (r: Run) => r.a >= X(STAIRS.a0) - 1;
/** Each step of a flight: [x0, x1, top] (as the feet go down on it: terrain's treadYAt). */
export const stepsOf = (r: Run, n = 20): [number, number, number][] => {
  const out: [number, number, number][] = [];
  for (let k = 0; k < n; k++) out.push([r.a + ((r.b - r.a) * k) / n, r.a + ((r.b - r.a) * (k + 1)) / n, r.ya + ((r.yb < r.ya ? k + 1 : k) / n) * (r.yb - r.ya)]);
  return out;
};

const tint = (col: string, k: number, d: number) => mix(farTint(col, k, timeOfDay()), skyAt(0.9, timeOfDay()), (1 - d) * 0.35);

// ---------------------------------------------------------------------------------------------------------------
// The far townhouses: along the street's far edge (a tile painted once for the hour, at depth FAR)

const HTW = 1100;
const paintHouses = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const H = (c: string) => mix(mix(farTint(hourMix(c, mix(c, '#3A2238', 0.2), mix(c, '#0A0814', 0.45), tod), 0.6, tod), '#1A1428', 0.3), haze, 0.1);
  const walls = ['#3E3352', '#45354E', '#3A3450', '#4A3A4E'].map(H), dark = H('#1A1424'), roof = H('#262236'), roofL = H('#3A3450'), trim = H('#5A4E70');
  const win = hourMix('#2A2440', '#6A4A2A', '#B8823A', tod), lit = timeOfDay().lamps;
  let x = 0, i = 0;
  while (x < HTW) {
    const w = 90 + hash(i * 3.7) * 70, h = 150 + hash(i * 5.3) * 70, top = -h, col = walls[i % walls.length];
    if (x + w > HTW) break;
    const R = [mix(col, '#000000', 0.35), mix(col, '#000000', 0.18), col, mix(col, '#FFFFFF', 0.12)];
    box(g, x, top, w, h, R[2]); box(g, x, top, 3, h, R[3]); box(g, x + w - 4, top, 4, h, R[0]);
    // (the gable, the bargeboard lit, the finial)
    const gh = Math.min(70, w * 0.6);
    poly(g, [[x - 5, top + 2], [x + w / 2, top - gh], [x + w + 5, top + 2]], INK);
    poly(g, [[x - 3, top + 1], [x + w / 2, top - gh + 3], [x + w + 3, top + 1]], roof);
    poly(g, [[x - 3, top + 1], [x + w / 2, top - gh + 3], [x + w / 2, top - gh + 8], [x + 2, top + 1]], roofL);
    box(g, x + w / 2 - 1, top - gh - 8, 2, 10, dark);
    box(g, x - 3, top, w + 6, 3, trim);
    // (a chimney)
    if (i % 2) { box(g, x + w * 0.72, top - gh * 0.7, 10, gh * 0.7, R[1]); box(g, x + w * 0.72 - 2, top - gh * 0.7 - 3, 14, 4, R[0]); }
    // (windows, two rows, pointed; a bay on some; lit after dark, some)
    for (let row = 0; row < 2; row++) for (let wx = x + 14; wx < x + w - 20; wx += 30) {
      const wy = top + 22 + row * 56, on = lit > 0.1 && hash(wx * 0.77 + row) > 0.55;
      box(g, wx - 1, wy - 1, 14, 26, INK); box(g, wx, wy, 12, 24, on ? win : dark);
      poly(g, [[wx - 1, wy], [wx + 6, wy - 7], [wx + 13, wy]], INK);
      if (on) box(g, wx + 1, wy + 2, 3, 10, mix(win, '#FFF0C0', 0.3));
      box(g, wx - 2, wy + 24, 16, 2, trim);
    }
    // (the door, its step; a shop's awning on some, flat and dim)
    box(g, x + w / 2 - 9, -38, 18, 38, dark); poly(g, [[x + w / 2 - 9, -38], [x + w / 2, -46], [x + w / 2 + 9, -38]], dark);
    box(g, x, -12, w, 12, R[1]); checker(g, x, -16, w, 4, R[1]);
    x += w + (hash(i * 9.1) > 0.75 ? 26 : 0);
    i++;
  }
};

export const drawFarHouses = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye;
  atDepth(c, eye, FAR, () => {
    c.save();
    // (none over the moat: it runs off into the dark between them)
    c.beginPath(); c.rect(X(-400), GY - 600, MA - 40 - X(-400), 640); c.rect(MB + 40, GY - 600, SX1 + 400 - MB - 40, 640); c.clip();
    for (let tx = Math.floor((X(-400)) / HTW) * HTW; tx < SX1 + 400; tx += HTW) {
      const ex = eye.x + (tx - eye.x) * FAR;
      if (ex + HTW * FAR < v.cam.x - 60 || ex > v.cam.x + 860) continue;
      c.save(); c.translate(tx, GY); stamp(c, `tn-houses-${tod.key}`, -10, -320, HTW + 20, 330, paintHouses); c.restore();
    }
    c.restore();
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Going back

/** A quad going back from the front edge (xa, ya)-(xb, yb) at depth d0 to d1. */
const back = (c: Ctx, eye: View['eye'], xa: number, ya: number, xb: number, yb: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, xa, ya, d0), at(eye, xb, yb, d0), at(eye, xb, yb, d1), at(eye, xa, ya, d1)], col);

/** A strip of ground going back from the run's front edge to `d`: in bands (darker, hazier back), the seams of its
 *  cobbles (or flags) in rows across and running away toward the eye, a lit lip along its front. */
const groundBack = (c: Ctx, v: View, xa: number, ya: number, xb: number, yb: number, d: number, R: string[], seam: number, k = 0.55) => {
  const eye = v.eye;
  if (eye.y >= Math.max(ya, yb) - 1) return;
  const L = Math.max(xa, v.v0 - 300), Rr = Math.min(xb, v.v1 + 300);
  if (Rr <= L) return;
  const yAt = (x: number) => ya + ((x - xa) / Math.max(1, xb - xa)) * (yb - ya);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - ((1 - d) * i) / n, d1 = 1 - ((1 - d) * (i + 1)) / n;
    back(c, eye, L, yAt(L), Rr, yAt(Rr), d0, d1, tint(R[[4, 3, 3, 2, 2, 1][i]], k, d0));
    if (i) { const [lx, sy] = at(eye, L, yAt(L), d0), [rx, ry] = at(eye, Rr, yAt(Rr), d0); if (Math.abs(ry - sy) < 1) checker(c, lx, sy - 1, rx - lx, 2, tint(R[[4, 3, 3, 2, 2, 1][i - 1]], k, d0)); }
  }
  // (rows of seams across, closer together going back)
  c.fillStyle = tint(R[0], k, 0.8);
  for (let j = 1; j < 9; j++) {
    const dd = 1 - (1 - d) * (1 - Math.pow(1 - j / 9, 1.4));
    const [lx, ly] = at(eye, L, yAt(L), dd), [rx, ry] = at(eye, Rr, yAt(Rr), dd);
    if (Math.abs(ry - ly) < 1) c.fillRect(Math.round(lx), Math.round(ly), Math.round(rx - lx), 1);
    else poly(c, [[lx, ly], [rx, ry], [rx, ry + 1], [lx, ly + 1]], c.fillStyle as string);
  }
  // (and running away toward the eye, staggered row by row: the cobbles)
  c.strokeStyle = tint(R[1], k, 0.8); c.lineWidth = 1;
  c.beginPath();
  for (let x = Math.ceil(L / seam) * seam; x < Rr; x += seam) {
    for (let j = 0; j < 8; j++) {
      const dA = 1 - (1 - d) * (1 - Math.pow(1 - j / 9, 1.4)), dB = 1 - (1 - d) * (1 - Math.pow(1 - (j + 1) / 9, 1.4));
      const xx = x + (j % 2) * seam * 0.5;
      if (xx > Rr) continue;
      const [ax, ay] = at(eye, xx, yAt(xx), dA), [bx, by] = at(eye, xx, yAt(xx), dB);
      c.moveTo(Math.round(ax) + 0.5, ay); c.lineTo(Math.round(bx) + 0.5, by);
    }
  }
  c.stroke();
  // (moss and weeds in the cracks, puddles with the sky in them; going back, smaller and hazier)
  for (let gx = Math.floor(L / 70) * 70; gx < Rr; gx += 70) {
    const h = gx * 0.011, wx = gx + hash(h) * 60, dd = 1 - (1 - d) * (0.2 + hash(h * 1.7) * 0.7);
    if (wx < L + 4 || wx > Rr - 4) continue;
    const [sx, sy] = at(eye, wx, yAt(wx), dd);
    if (hash(h * 3.1) > 0.8) { pixelBlob(c, sx, sy, 14 * dd, 2 * dd, tint('#1E1B33', k, dd)); box(c, sx - 5 * dd, sy - 1, 6 * dd, 1, tint('#6E66A0', k, dd)); }
    else if (hash(h * 4.3) > 0.6) box(c, sx, sy - 1, 3 * dd, 2, tint('#3A4A2A', k, dd));
  }
};

/** A face going back from the play plane at x = e, from `top` to `bottom`, to depth d (seen only from its side): stone
 *  in courses, darker going back, and darker the deeper below the street (pure black, a way down). */
const faceBack = (c: Ctx, v: View, e: number, side: 1 | -1, top: number, bottom: number, d: number, R = STONE) => {
  const eye = v.eye;
  if ((eye.x - e) * side <= 1) return;
  const bot = Math.min(bottom, eye.y + (v.bot - eye.y) / d + 40);
  const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - d) * k);
  const dk = (col: string, y: number) => mix(col, '#000000', Math.min(1, Math.max(0, (y - GY - 10) / 380)));
  const q = (k0: number, y0: number, k1: number, y1: number, col: string) => poly(c, [pt(k0, y0), pt(k1, y0), pt(k1, y1), pt(k0, y1)], col);
  for (let y = top, row = 0; y < bot; row++) {
    const rh = y < GY ? Math.min(16, GY - y) || 16 : 16 + row * 3;
    for (let j = 0; j < 4; j++) {
      const k0 = j / 4, k1 = (j + 1) / 4;
      q(k0, y, k1, Math.min(bot, y + rh), dk(tint(R[[3, 2, 2, 1][j] + (row % 2 && j < 2 ? 1 : 0)], 0.5, 1 - k0 * (1 - d)), y));
      q(k0, y, k1, y + 1, dk(tint(R[1], 0.5, 1), y));
    }
    y += rh;
  }
  const [x1, t1] = pt(1, top);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.stroke();
};

/** The moat going back: a chasm between its walls (black, all the way down), mist lying in it, its far end lost in the
 *  dark between the far houses. */
const moatBack = (c: Ctx, v: View) => {
  if (MB < v.v0 - 300 || MA > v.v1 + 300) return;
  const eye = v.eye, tod = timeOfDay(), haze = skyAt(0.9, tod);
  const [ax, ay] = at(eye, MA, GY, FAR), [bx, by] = at(eye, MB, GY, FAR);
  c.save();
  c.beginPath(); c.moveTo(MA, GY); c.lineTo(ax, ay); c.lineTo(bx, by); c.lineTo(MB, GY); c.lineTo(MB, v.bot); c.lineTo(MA, v.bot); c.closePath(); c.clip();
  const top = Math.min(ay, by) - 2;
  bandedGradient(c, Math.min(MA, ax) - 4, top, Math.max(MB, bx) - Math.min(MA, ax) + 8, Math.max(40, GY + 120 - top), [mix('#1A1526', haze, 0.1), '#0E0B16', '#06050A', '#000000'], 6);
  box(c, Math.min(MA, ax) - 4, GY + 118, Math.max(MB, bx) - Math.min(MA, ax) + 8, v.bot - GY, '#000000');
  // (cold mist lying in it, in layers, fainter deeper)
  for (let k = 0; k < 3; k++) hazeBands(c, MA - 200, ay + 6 + k * 50, MB - MA + 400, 30, mix(haze, '#C8D0E0', 0.3), 0.0, 0.1 - k * 0.03, 4);
  c.restore();
  // (its walls going back: stone in courses, into the black)
  faceBack(c, v, MA, 1, GY, DEEP, FAR);
  faceBack(c, v, MB, -1, GY, DEEP, FAR);
};

/** The ground going back, the far houses along it, the raised things, the moat. */
export const drawGoingBack = (c: Ctx, v: View) => {
  drawFarHouses(c, v);
  // The street (under everything raised too), the moat cut through it
  for (const [a, b] of FLOOR) if (b > v.v0 - 300 && a < v.v1 + 300) groundBack(c, v, a, GY, b, GY, FAR, COBBLE, 26);
  moatBack(c, v);
  // The plaza, the ramp and terrace, the stairs: their tops (and treads, and risers) going back; their ends' faces
  for (let i = 0; i < RUNS.length; i++) {
    const r = RUNS[i];
    if (!raised(r) || r.b < v.v0 - 300 || r.a > v.v1 + 300) continue;
    const d = isStairs(r) ? STAIR_D : FAR;
    if (!r.stairs) { groundBack(c, v, r.a, r.ya, r.b, r.yb, d, r.surface === 'cobbles' ? COBBLE : STONE, isStairs(r) ? 40 : 34, 0.45); continue; }
    // (a flight: each step's riser, then its tread, nearest the eye last)
    const steps = stepsOf(r), up = r.yb < r.ya;
    const order = steps.map((s, k) => ({ s, k, dist: Math.abs((s[0] + s[1]) / 2 - v.eye.x) })).sort((p, q) => q.dist - p.dist);
    for (const { s: [x0, x1, top], k } of order) {
      if (x1 < v.v0 - 200 || x0 > v.v1 + 200) continue;
      const prev = k ? steps[k - 1][2] : r.ya, next = k < steps.length - 1 ? steps[k + 1][2] : r.yb;
      // (its riser: up flights face left (seen from the left), down ones face right)
      if (up && v.eye.x < x0 && prev > top) poly(c, [at(v.eye, x0, prev, 1), at(v.eye, x0, top, 1), at(v.eye, x0, top, d), at(v.eye, x0, prev, d)], tint(STONE[2], 0.45, 0.9));
      if (!up && v.eye.x > x1 && next > top) poly(c, [at(v.eye, x1, next, 1), at(v.eye, x1, top, 1), at(v.eye, x1, top, d), at(v.eye, x1, next, d)], tint(STONE[2], 0.45, 0.9));
      if (v.eye.y < top - 1) {
        back(c, v.eye, x0, top, x1, top, 1, d, tint(STONE[4], 0.45, 0.9));
        back(c, v.eye, x0, top, x1, top, 1, 1 - (1 - d) * 0.12, tint(STONE[5], 0.45, 1));
        // (the tread's front edge worn, its far half in shadow)
        back(c, v.eye, x0, top, x1, top, 1 - (1 - d) * 0.6, d, tint(STONE[3], 0.45, 0.85));
      }
    }
  }
  // The ends that drop (the terrace's right end; the stairs' top end's left, past the castle: none) facing out
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const l = RUNS[i], r = RUNS[i + 1];
    if (Math.abs(l.b - r.a) > 1 || Math.abs(l.yb - r.ya) < 2 || l.stairs || r.stairs) continue;
    if (l.yb < r.ya) faceBack(c, v, l.b, 1, l.yb, r.ya, FAR); else faceBack(c, v, r.a, -1, r.ya, l.yb, FAR);
  }
  drawBalustrade(c, v);
};

/** The balustrade along the stairs' far side (at STAIR_D: never in front of anything): a stone rail on turned
 *  balusters, a newel post at each end of each flight, an urn on each. */
const drawBalustrade = (c: Ctx, v: View) => {
  const eye = v.eye, d = STAIR_D;
  const stairs = RUNS.filter(r => isStairs(r));
  if (stairs[stairs.length - 1].b < v.v0 - 200 || stairs[0].a > v.v1 + 200) return;
  const RH = 46;
  atDepth(c, eye, d, () => {
    for (const r of stairs) {
      const yAt = (x: number) => (r.stairs ? r.ya + ((x - r.a) / (r.b - r.a)) * (r.yb - r.ya) : r.ya);
      const L = Math.max(r.a, v.v0 - 300), R = Math.min(r.b, v.v1 + 300);
      // (the balusters)
      for (let x = Math.ceil(L / 14) * 14; x < R; x += 14) {
        const foot = r.stairs ? stepsOf(r).find(s => x >= s[0] && x < s[1])?.[2] ?? yAt(x) : r.ya;
        const top = yAt(x) - RH + 6;
        box(c, x - 3, top, 7, foot - top, INK); box(c, x - 2, top, 5, foot - top, tint(STONE[4], 0.4, d)); box(c, x - 2, top, 2, foot - top, tint(STONE[5], 0.4, d));
        box(c, x - 3, top + (foot - top) * 0.45, 7, 3, tint(STONE[3], 0.4, d));
      }
      // (the rail on top, lit along its top)
      const pts: [number, number][] = [[L, yAt(L) - RH - 2], [R, yAt(R) - RH - 2], [R, yAt(R) - RH + 8], [L, yAt(L) - RH + 8]];
      poly(c, pts.map(([x, y]) => [x, y - 1] as [number, number]), INK);
      poly(c, [[L, yAt(L) - RH], [R, yAt(R) - RH], [R, yAt(R) - RH + 7], [L, yAt(L) - RH + 7]], tint(STONE[4], 0.4, d));
      poly(c, [[L, yAt(L) - RH], [R, yAt(R) - RH], [R, yAt(R) - RH + 2], [L, yAt(L) - RH + 2]], tint(STONE[5], 0.4, d));
      // (the newel posts and their urns)
      for (const px of [r.a, r.b]) {
        if (px < v.v0 - 300 || px > v.v1 + 300 || !r.stairs) continue;
        const py = px === r.a ? r.ya : r.yb;
        box(c, px - 10, py - RH - 20, 20, RH + 20, INK); box(c, px - 9, py - RH - 19, 18, RH + 19, tint(STONE[4], 0.4, d)); box(c, px - 9, py - RH - 19, 5, RH + 19, tint(STONE[5], 0.4, d));
        box(c, px - 12, py - RH - 24, 24, 6, INK); box(c, px - 11, py - RH - 23, 22, 4, tint(STONE[5], 0.4, d));
        c.fillStyle = INK; c.beginPath(); c.ellipse(px, py - RH - 32, 9, 9, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = tint(STONE[4], 0.4, d); c.beginPath(); c.ellipse(px, py - RH - 32, 8, 8, 0, 0, Math.PI * 2); c.fill();
        box(c, px - 5, py - RH - 37, 4, 4, tint(STONE[6], 0.4, d));
      }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

/** A raised thing's near face (at the play plane): dressed stone in courses down to the street, its top lip lit. */
const nearFace = (c: Ctx, x0: number, x1: number, topAt: (x: number) => number, v: View, R = STONE) => {
  const L = Math.max(x0, v.v0), Rr = Math.min(x1, v.v1);
  if (Rr <= L) return;
  const pts: [number, number][] = [];
  for (let x = L; x <= Rr; x += Math.max(1, Math.min(8, Rr - x))) { pts.push([x, topAt(x)]); if (x === Rr) break; }
  if (pts[pts.length - 1][0] !== Rr) pts.push([Rr, topAt(Rr)]);
  const body = [...pts, [Rr, GY] as [number, number], [L, GY] as [number, number]];
  poly(c, body, R[3]);
  // (coursed: a joint line every course, staggered joints, the course's top catching light)
  c.save(); c.beginPath(); body.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const minY = Math.min(...pts.map(p => p[1]));
  for (let y = GY - 18, row = 0; y > minY - 18; y -= 18, row++) {
    box(c, L, y, Rr - L, 1, R[1]); box(c, L, y + 1, Rr - L, 1, R[4]);
    for (let x = Math.floor(L / 44) * 44 + (row % 2) * 22; x < Rr; x += 44) { box(c, x, y + 1, 1, 17, R[1]); box(c, x + 1, y + 1, 1, 17, R[4]); if (hash(x * 0.3 + row) > 0.7) box(c, x + 2, y + 2, 40, 16, R[2]); }
  }
  checker(c, L, GY - 20, Rr - L, 12, R[1]);
  box(c, L, GY - 8, Rr - L, 8, R[1]);
  c.restore();
  // (the lip: a capstone along the top, lit (stand on it), its shadow under it)
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    if (Math.abs(ay - by) < 0.5) { box(c, ax, ay, bx - ax, 6, R[2]); box(c, ax, ay, bx - ax, 3, LIP[2]); box(c, ax, ay, bx - ax, 1, LIP[3]); box(c, ax, ay + 6, bx - ax, 1, INK); }
    else { poly(c, [[ax, ay], [bx, by], [bx, by + 4], [ax, ay + 4]], LIP[2]); poly(c, [[ax, ay + 4], [bx, by + 4], [bx, by + 5], [ax, ay + 5]], INK); }
  }
};

/** A flight's near face (the stringer): stone under the steps' profile, each tread's nosing lit. */
const flightFace = (c: Ctx, r: Run, v: View) => {
  const steps = stepsOf(r).filter(([x0, x1]) => x1 > v.v0 && x0 < v.v1);
  if (!steps.length) return;
  for (const [x0, x1, top] of steps) {
    box(c, x0, top, x1 - x0 + 1, GY - top, STONE[3]);
    box(c, x0, top + 6, x1 - x0 + 1, 1, STONE[1]);
  }
  // (the stringer's courses: big blocks, sloped with the flight)
  const L = steps[0][0], R = steps[steps.length - 1][1];
  for (let x = Math.floor(L / 60) * 60; x < R; x += 60) { const s = steps.find(q => x >= q[0] && x < q[1]); if (s) { box(c, x, s[2] + 7, 1, GY - s[2] - 7, STONE[1]); box(c, x + 1, s[2] + 7, 1, GY - s[2] - 7, STONE[4]); } }
  for (let y = GY - 18; y > Math.min(...steps.map(s => s[2])); y -= 18) for (const [x0, x1, top] of steps) if (top + 7 < y) { box(c, x0, y, x1 - x0 + 1, 1, STONE[1]); box(c, x0, y + 1, x1 - x0 + 1, 1, STONE[4]); }
  checker(c, L, GY - 20, R - L, 12, STONE[1]); box(c, L, GY - 8, R - L, 8, STONE[1]);
  for (const [x0, x1, top] of steps) { box(c, x0, top, x1 - x0 + 1, 5, STONE[2]); box(c, x0, top, x1 - x0 + 1, 2, LIP[2]); box(c, x0, top, x1 - x0 + 1, 1, LIP[3]); box(c, x0, top + 5, x1 - x0 + 1, 1, INK); }
};

/** The street under him, painted flat (bent afterwards): cobbles in rows (bigger nearer), the curb along the line
 *  (lit: stand on it), puddles with the sky in them, dead leaves, a drain now and then. */
const paintFloor = (g: Ctx, x0: number, w: number) => {
  const tod = timeOfDay();
  const C = COBBLE.map(col => farTint(col, 0.15, tod));
  bandedGradient(g, x0, GY, w, BAND, [C[3], C[2], C[2], C[1], C[1], C[0]], 8);
  const s = Math.floor(x0);
  // (the cobbles: rows of them, each one a rounded block lit along its top, staggered)
  for (let y = GY + 8, row = 0; y < GY + BAND; row++) {
    const rh = 6 + row * 2.2, cw = 16 + row * 4;
    for (let x = x0 - ((row * 7) % cw); x < x0 + w; x += cw) {
      const t = hash(s + x * 0.37 + row * 11.3), col = C[t > 0.66 ? 3 : t > 0.33 ? 2 : 4] ;
      box(g, x + 1, y + 1, cw - 2, rh - 2, col);
      box(g, x + 2, y + 1, cw - 4, 1, C[5]);
      box(g, x + 1, y + rh - 2, cw - 2, 1, C[1]);
    }
    y += rh;
  }
  // (puddles, the sky in them; dead leaves; a drain grate)
  for (let i = 0; i < w / 160; i++) {
    const px = x0 + hash(s + i * 3.3) * w, py = GY + 20 + hash(s + i * 5.1) * (BAND - 40), sc = 1 + (py - GY) / 60;
    g.fillStyle = '#1E1B33'; g.beginPath(); g.ellipse(px, py, 18 * sc, 3 * sc, 0, 0, Math.PI * 2); g.fill();
    box(g, px - 8 * sc, py - 1, 10 * sc, 1, '#6E66A0'); box(g, px + 4 * sc, py + 1, 5 * sc, 1, '#4A4478');
  }
  const lc = ['#7C2D12', '#9A3412', '#713F12', '#4A3A1A'];
  for (let i = 0; i < w / 6; i++) { const lx = x0 + hash(s + i * 0.71) * w, ly = GY + 6 + hash(s + i * 1.93) * (BAND - 8), sc = 1 + (ly - GY) / 70; box(g, lx, ly, 2 * sc, Math.max(1, sc), lc[i % 4]); }
  for (let i = 0; i < w / 700; i++) {
    const dx = x0 + 60 + hash(s + i * 7.7) * (w - 120), dy = GY + 30;
    box(g, dx - 1, dy - 1, 34, 14, INK); box(g, dx, dy, 32, 12, IRON[2]);
    for (let k = 0; k < 6; k++) box(g, dx + 3 + k * 5, dy + 2, 2, 8, INK);
    box(g, dx, dy, 32, 1, IRON[4]);
  }
  // (the curb along the line: granite, lit along its top (it's what he walks on), its joints)
  box(g, x0, GY, w, 8, STONE[3]); box(g, x0, GY, w, 3, LIP[1]); box(g, x0, GY, w, 1, LIP[2]);
  for (let x = Math.floor(x0 / 48) * 48; x < x0 + w; x += 48) box(g, x, GY + 1, 1, 7, STONE[1]);
  box(g, x0, GY + 8, w, 1, INK); checker(g, x0, GY + 9, w, 2, C[0]);
};

/** A moat lip at the play plane: the street's edge (bent like the street) and the stone hung under it, darker the
 *  deeper (seen when he's looking at it). */
const nearBank = (c: Ctx, v: View, e: number, side: 1 | -1) => {
  const ex = v.eye.x;
  if ((ex - e) * side <= 1) return;
  const Y1 = GY + BAND + 120;
  const edge = (y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const N = 12, pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const y = GY + ((Y1 - GY) * i) / N; pts.push([edge(y), y]); }
  const dk = (col: string, s: number) => mix(col, '#000000', Math.min(1, 0.2 + Math.max(0, s - 20) / 300));
  for (let s0 = 0, row = 0; s0 < 560; row++) {
    const rh = 18 + row * 4;
    for (let i = row % 2; i < N; i += 2) {
      const seg = pts.slice(i, Math.min(N, i + 2) + 1);
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + rh] as [number, number])], dk(STONE[2 + ((row + i) % 2)], s0));
      poly(c, [...seg.map(([x, y]) => [x, y + s0] as [number, number]), ...seg.slice().reverse().map(([x, y]) => [x, y + s0 + 2] as [number, number])], dk(STONE[4], s0));
    }
    s0 += rh;
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
};

/** The play plane: the raised things' near faces, the street under him (bent), the moat's lips. */
export const drawPlayPlane = (c: Ctx, v: View) => {
  // The raised things' near faces
  for (const r of RUNS) {
    if (!raised(r) || r.b < v.v0 || r.a > v.v1) continue;
    if (r.stairs) flightFace(c, r, v);
    else nearFace(c, r.a, r.b, x => r.ya + ((x - r.a) / (r.b - r.a)) * (r.yb - r.ya), v);
  }
  // The street under him (stamped in chunks, flat, then bent)
  const CH = 512, tod = timeOfDay();
  for (const [a, b] of FLOOR) {
    for (let x = a, i = 0; x < b; x += CH, i++) {
      const w = Math.min(CH, b - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stamp(c, `tn-floor-${tod.key}-${a}-${i}`, x, GY - 2, w, BAND + 2, g => paintFloor(g, x, w));
    }
  }
  bendFloor(c, v.eye, GY, GY, GY + BAND, FLOOR[0][0], FLOOR[FLOOR.length - 1][1]);
  // The moat's lips, hung under the street's edge
  nearBank(c, v, MA, 1);
  nearBank(c, v, MB, -1);
};

/** The moat's dressing at the play plane (after the bend: drawn over it): the lips' broken edges, rubble trickling off
 *  into the black and gone, the cold updraft of mist rising out of it. */
export const drawMoatDressing = (c: Ctx, v: View) => {
  if (MB < v.v0 - 100 || MA > v.v1 + 100) return;
  const f = v.f;
  for (const [ex, s] of [[MA, 1], [MB, -1]] as const) {
    poly(c, [[ex, GY], [ex + s * 22, GY], [ex + s * 14, GY + 8], [ex + s * 26, GY + 14], [ex + s * 8, GY + 22], [ex, GY + 18]], INK);
    poly(c, [[ex, GY + 1], [ex + s * 20, GY + 1], [ex + s * 12, GY + 8], [ex + s * 23, GY + 13], [ex + s * 7, GY + 20], [ex, GY + 16]], STONE[3]);
    box(c, Math.min(ex, ex + s * 18), GY + 1, 18, 2, STONE[5]);
  }
  for (let i = 0; i < 6; i++) {
    const ph = ((f * 0.012 + i * 0.37) % 1), side = i % 2 ? MB - 14 - (i % 3) * 6 : MA + 10 + (i % 3) * 6;
    const fy = GY + ph * ph * 520, sz = 3 - Math.floor(ph * 3);
    if (sz > 0) box(c, side + Math.sin(i + ph * 4) * 4, fy, sz, sz, ph < 0.5 ? STONE[5] : STONE[3]);
  }
  // (the updraft: pale mist rising out of the black at the bottom of the screen, in flat steps)
  const sb = v.cam.y + 600;
  for (let i = 0; i < 9; i++) {
    const ph = (f * 0.004 + i / 9) % 1, mx = MA + 40 + ((i * 97) % (MB - MA - 80)), my = sb - ph * 140;
    if (my > GY + 30) pixelBlob(c, mx + Math.round(Math.sin(f * 0.01 + i) * 12 / 2) * 2, my, 46, 8, `rgba(203, 213, 225, ${(0.16 * Math.sin(ph * Math.PI)).toFixed(3)})`);
  }
};
