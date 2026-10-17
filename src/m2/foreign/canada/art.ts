// CANADA's art (the SNES pass): the lumber camp (the log cabin (its logs and their chinking, the notched corners, the
// shake roof, the fieldstone chimney, the porch, the antlers over the door), the log piles' cut ends and their rings,
// the stumps (bark in ridges, the rings on top, an axe left in one), the CARVED POLES (plywood: its laminations showing
// on the sides, the faces painted on it (a moose, a beaver, a goalie's mask, a Mountie), MADE IN OHIO stenciled on the
// foot, the wings bolted on top set back)), the pines in their stepped tiers, the ranger station; the LOG POND's logs
// (bark, knots, the cut ends, moss); THE FALLS (the rock face behind the climb, the pumped pipe painted (badly) like
// rock, the water in stepped bands running down, the foam and the spray), the rock ledges, the cliff and the trail
// (rock in strata, the timber treads, the handrail), the MAPLE LOG FLUME's trestle and trough, the logs; THE RINK (the
// ice going back and its lines and circles, the boards and their ads, the glass, the nets); the flag. And the frozen
// pond and the toboggan hill (pond.ts): the boards behind the pond, the ice panels (the thin ones marked and cracking),
// the snow in steps, the stairs cut in it, the chute, the sugar shack. Still art painted once for the hour; only what
// moves live. No layout here: index.ts and pond.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow, pixelBlob,
  stoneBlocks, planks, facade, still, words, plain, onScreen, lip, topBack, box3Back, ledge3, glassOf, flagPole, signText, postBoard, LOOKS,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const PINE = '#1F4A2E', LOGC = '#A0703A', BARK = '#5A3A1E', ROCK = '#6E6862', SNOW = '#F1F5F9', ICE = '#BAE6FD', PLY = '#D2A868', SERGE = '#B91C1C';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A cut log's end (local; its middle at x, y, radius r): the bark round it, the rings in steps (lit up its top-left),
 *  the pith, a check cracked in from the bark. */
export const logEnd = (g: Ctx, x: number, y: number, r: number, tn: (c: string) => string, seed: number) => {
  const B = ramp6(tn(BARK)), W = ramp6(tn('#E8C080'));
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = B[2]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = W[2]; g.beginPath(); g.arc(x, y, r - 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = W[3]; g.beginPath(); g.arc(x - 1, y - 1, r - 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = W[4]; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2); g.fill();
  g.strokeStyle = W[1]; g.lineWidth = 1;
  for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(x, y, (r - 2) * (k / 4), 0, Math.PI * 2); g.stroke(); }
  box(g, x - 1, y - 1, 2, 2, W[0]);
  const a = hash(seed) * Math.PI * 2; g.strokeStyle = W[0]; g.beginPath(); g.moveTo(x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2)); g.lineTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3); g.stroke();
};
/** Bark (local): ridges running along it (or up it), each a step, the furrows dark between, a lichen fleck. */
const bark = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], vertical: boolean, seed: number) => {
  box(g, x, y, w, h, R[2]);
  if (vertical) for (let xx = x; xx < x + w; xx += 4) { const t = hash(seed + xx * 0.7); box(g, xx, y, 3, h, R[t > 0.7 ? 3 : 2]); box(g, xx + 3, y, 1, h, R[0]); for (let yy = y + hash(seed + xx) * 10; yy < y + h; yy += 14) box(g, xx, yy, 3, 1, R[1]); }
  else for (let yy = y; yy < y + h; yy += 4) { const t = hash(seed + yy * 0.7); box(g, x, yy, w, 3, R[t > 0.7 ? 3 : 2]); box(g, x, yy + 3, w, 1, R[0]); for (let xx = x + hash(seed + yy) * 12; xx < x + w; xx += 16) box(g, xx, yy, 1, 3, R[1]); }
  for (let k = 0; k < (w * h) / 900; k++) box(g, x + hash(seed + k * 3.1) * w, y + hash(seed + k * 1.7) * h, 3, 2, tn0('#7A8A5A'));
};
const tn0 = (c: string) => hour(c);

/** A pine (local: its trunk's foot at x, 0; h tall): the trunk, the boughs in stepped tiers (their drooping tips, lit
 *  down the left, shaded right), dusted with snow if `snow`. */
const paintPine = (g: Ctx, x: number, h: number, seed: number, tn: (c: string) => string, snow = false) => {
  const P = ramp6(tn(PINE)), T = ramp6(tn('#4A3020')), S = ramp6(tn(SNOW));
  box(g, x - 4, -h * 0.25, 8, h * 0.25, INK); box(g, x - 3, -h * 0.25, 6, h * 0.25, T[2]); box(g, x - 3, -h * 0.25, 2, h * 0.25, T[3]);
  const n = 5;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1), ty = -h * 0.18 - t * h * 0.68, tw = (1 - t * 0.8) * h * 0.2 + 6, th = h * 0.24;
    const tip = (s: number) => [x + s * tw, ty] as [number, number];
    const sh: [number, number][] = [tip(-1), [x - tw * 0.55, ty - 4], [x - tw * 0.3, ty - th * 0.55], [x, ty - th], [x + tw * 0.3, ty - th * 0.55], [x + tw * 0.55, ty - 4], tip(1), [x + tw * 0.6, ty + 3], [x, ty - 1], [x - tw * 0.6, ty + 3]];
    poly(g, sh.map(([a, b]) => [a + (a < x ? -1 : a > x ? 1 : 0), b + 1] as [number, number]), INK);
    poly(g, sh, P[2]);
    poly(g, [tip(-1), [x - tw * 0.55, ty - 4], [x - tw * 0.3, ty - th * 0.55], [x, ty - th], [x, ty - 1], [x - tw * 0.6, ty + 3]], P[3]);
    poly(g, [[x + tw * 0.3, ty - th * 0.55], [x + tw * 0.55, ty - 4], tip(1), [x + tw * 0.6, ty + 3], [x + tw * 0.2, ty - 2]], P[1]);
    for (let j = 0; j < 4; j++) box(g, x - tw * 0.7 + hash(seed + k * 4 + j) * tw * 1.2, ty - 3 - hash(seed + j + k) * th * 0.5, 2, 1, P[4]);
    if (snow) { box(g, x - tw * 0.5, ty - 5, tw * 0.45, 2, S[4]); box(g, x - 4, ty - th + 2, 6, 2, S[5]); }
  }
};
export const drawPine = (c: Ctx, v: View, x: number, h: number, seed: number, d = 0.9, snow = false) => facade(c, v, `ca-pine-${h}-${seed % 4}-${snow ? 1 : 0}`, x - 50, 100, h, g => paintPine(g, 50, h, seed % 4, dimmed, snow), d, 10, 10, false);

// ---------------------------------------------------------------------------------------------------------------
// The lumber camp

/** The log cabin (FACADE_D, braced; local foot 0): its logs laid up (each a stepped round, the chinking between), the
 *  notched corners and their log ends, the shake roof over it, the fieldstone chimney up its end, the windows in
 *  their frames (warm after dark), the door, the porch roof on its posts, the antlers over the door. */
const paintCabin = (g: Ctx, w: number, h: number) => {
  const L = ramp6(dimmed(LOGC)), Ch = ramp6(dimmed('#D8CCB0')), Sh = ramp6(dimmed('#5A4030')), St = ramp6(dimmed('#8A8478'));
  // (the chimney up the right end, behind the roof)
  box(g, w - 54, -h - 110, 32, h + 110, INK); stoneBlocks(g, w - 53, -h - 109, 30, h + 109, St, 5, 12, 9);
  box(g, w - 56, -h - 114, 36, 6, INK); box(g, w - 55, -h - 113, 34, 4, St[4]);
  // (the shake roof: rows of shakes, each a step, the ridge, the eave's shade)
  poly(g, [[-18, -h + 2], [w / 2, -h - 82], [w + 18, -h + 2]], INK);
  poly(g, [[-16, -h], [w / 2, -h - 79], [w + 16, -h]], Sh[2]);
  g.save(); g.beginPath(); g.moveTo(-16, -h); g.lineTo(w / 2, -h - 79); g.lineTo(w + 16, -h); g.closePath(); g.clip();
  for (let y = -h - 80, row = 0; y < -h; y += 8, row++) for (let x = -20 + (row % 2) * 7; x < w + 20; x += 14) { const t = hash(x * 0.3 + row * 1.9); box(g, x, y, 13, 7, Sh[t > 0.7 ? 3 : 2]); box(g, x, y + 6, 13, 1, Sh[0]); box(g, x, y, 1, 7, Sh[1]); }
  poly(g, [[-16, -h], [w / 2, -h - 79], [w / 2 - 30, -h - 79], [-40, -h]], 'rgba(255,240,200,0.12)');
  g.restore();
  box(g, w / 2 - 4, -h - 84, 8, 6, Sh[4]);
  // (the logs: each a round, lit along its top, shaded under, the chinking between, the knots)
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  for (let y = -h, k = 0; y < 0; y += 15, k++) {
    box(g, 0, y, w, 13, L[3]); box(g, 0, y, w, 3, L[4]); box(g, 0, y + 1, w, 1, L[5]); box(g, 0, y + 9, w, 4, L[2]); box(g, 0, y + 12, w, 1, L[1]);
    box(g, 0, y + 13, w, 2, Ch[2]); box(g, 0, y + 13, w, 1, Ch[4]);
    for (let x = 20 + hash(k) * 40; x < w - 20; x += 50 + hash(k + x) * 40) { box(g, x, y + 5, 4, 3, L[1]); box(g, x + 1, y + 5, 2, 1, L[0]); }
  }
  // (the notched corners: the log ends stacked out past each end)
  for (const cx of [-6, w + 6]) for (let y = -h + 7; y < 0; y += 15) logEnd(g, cx, y, 7, dimmed, y + cx);
  // (the windows: frames, the glass by the hour, the muntins, the sills; the door and its iron; the porch roof)
  for (const wx of [30, w - 70]) {
    box(g, wx - 4, -112, 48, 42, INK); box(g, wx - 3, -111, 46, 40, L[1]);
    const on = lampsOn(), G = glassOf();
    box(g, wx, -108, 40, 34, on ? '#C88A36' : G[1]); box(g, wx, -108, 40, 13, on ? '#E8A646' : G[2]); box(g, wx + 19, -108, 2, 34, L[1]); box(g, wx, -92, 40, 2, L[1]);
    if (!on) box(g, wx + 2, -106, 2, 30, G[4]);
    box(g, wx - 6, -72, 52, 4, INK); box(g, wx - 5, -72, 50, 3, L[4]);
    box(g, wx - 3, -112, 3, 42, L[2]); box(g, wx + 40, -112, 3, 42, L[0]);
  }
  const dx = w / 2 - 20;
  box(g, dx - 2, -78, 44, 78, INK); planks(g, dx, -76, 40, 76, ramp6(dimmed('#6A4428')), true, 3, 10);
  for (const hy of [-66, -18]) { box(g, dx + 2, hy, 22, 3, INK); box(g, dx + 2, hy, 22, 1, ramp6(dimmed('#52525B'))[4]); }
  box(g, dx + 32, -42, 4, 4, ramp6(dimmed('#CA8A04'))[4]);
  // (the antlers over the door)
  const Ab = ramp6(dimmed('#E8DCC0'));
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, -86); g.quadraticCurveTo(w / 2 + s * 20, -88, w / 2 + s * 26, -104); g.stroke(); g.strokeStyle = Ab[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, -86); g.quadraticCurveTo(w / 2 + s * 20, -88, w / 2 + s * 26, -104); g.stroke(); for (const t of [0.4, 0.7]) { const px0 = w / 2 + s * 20 * t, py0 = -87 - t * 6; box(g, px0, py0 - 8, 2, 8, Ab[3]); } }
  box(g, w / 2 - 4, -90, 8, 6, Ab[2]);
  // (the porch roof on its posts)
  box(g, dx - 30, -88, 100, 6, INK); box(g, dx - 29, -87, 98, 4, Sh[3]); box(g, dx - 29, -87, 98, 1, Sh[5]);
  for (const px0 of [dx - 26, dx + 62]) { box(g, px0 - 1, -82, 6, 82, INK); box(g, px0, -82, 4, 82, L[3]); box(g, px0, -82, 1, 82, L[5]); }
};
export const drawCabin = (c: Ctx, v: View, x: number, w: number, h: number) => facade(c, v, `ca-cabin-${w}x${h}`, x, w, h, g => paintCabin(g, w, h), undefined, 130, 30);

/** The ranger station (FACADE_D, braced; local foot 0): green board-and-batten, the red roof, the door and its window,
 *  a window with its blind down, the gutter. */
const paintRanger = (g: Ctx, w: number, h: number) => {
  const G = ramp6(dimmed('#2F5A3A')), R = ramp6(dimmed('#7F1D1D')), Wd = ramp6(dimmed('#E8DCC0'));
  poly(g, [[-12, -h + 2], [w / 2, -h - 62], [w + 12, -h + 2]], INK); poly(g, [[-10, -h], [w / 2, -h - 59], [w + 10, -h]], R[2]);
  g.save(); g.beginPath(); g.moveTo(-10, -h); g.lineTo(w / 2, -h - 59); g.lineTo(w + 10, -h); g.closePath(); g.clip();
  for (let x = -10; x < w + 10; x += 8) { box(g, x, -h - 60, 1, 60, R[1]); box(g, x + 1, -h - 60, 1, 60, R[3]); }
  poly(g, [[-10, -h], [w / 2, -h - 59], [w / 2 - 20, -h - 59], [-30, -h]], 'rgba(255,240,200,0.14)');
  g.restore();
  box(g, -1, -h - 1, w + 2, h + 1, INK); planks(g, 0, -h, w, h, G, true, 9, 12);
  for (let x = 11; x < w; x += 12) { box(g, x, -h, 2, h, G[4]); box(g, x + 2, -h, 1, h, G[1]); }
  box(g, -4, -h - 2, w + 8, 4, INK); box(g, -3, -h - 1, w + 6, 2, ramp6(dimmed('#71717A'))[3]);
  const on = lampsOn(), Gl = glassOf();
  box(g, 58, -74, 44, 74, INK); box(g, 60, -72, 40, 72, Wd[2]); box(g, 66, -66, 28, 22, on ? '#E8A646' : Gl[2]); box(g, 92, -36, 3, 3, ramp6(dimmed('#CA8A04'))[4]);
  box(g, 14, -96, 32, 30, INK); box(g, 16, -94, 28, 26, on ? '#C88A36' : Gl[1]); box(g, 16, -94, 28, 14, Wd[3]); for (let y = -92; y < -80; y += 3) box(g, 16, y, 28, 1, Wd[1]);
  box(g, 112, -96, 32, 30, INK); box(g, 114, -94, 28, 26, on ? '#C88A36' : Gl[1]); box(g, 127, -94, 2, 26, Wd[2]);
};
export const drawRanger = (c: Ctx, v: View, x: number, w: number, h: number) => facade(c, v, `ca-ranger-${w}x${h}`, x, w, h, g => paintRanger(g, w, h), undefined, 70, 20);

/** A log pile (a box he stands on): the cut ends stacked in a pyramid's courses, the gaps between them dark; the logs'
 *  tops going back in bark; the lit lip. */
export const drawLogPile = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: BARK });
  if (v.eye.y < top - 1) { c.strokeStyle = hour('#3A2410'); c.lineWidth = 1; c.beginPath(); for (let x = a + 11; x < b; x += 22) { const [p0, q0] = at(v.eye, x, top, 1), [p1, q1] = at(v.eye, x, top, 0.93); c.moveTo(p0, q0); c.lineTo(p1, q1); } c.stroke(); }
  still(c, `ca-logpile-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    box(g, -1, 0, w + 2, h + 1, INK); box(g, 0, 0, w, h, '#1C1014');
    for (let y = h - 11, row = 0; y > -4; y -= 21, row++) for (let x = 11 + (row % 2) * 11; x < w - 4; x += 22) logEnd(g, x, y, 11, hour, x * 3 + row);
  });
  lip(c, a, top, w);
};
/** A stump (a box he stands on): bark down its sides in ridges, its cut top going back (the rings round the heart), a
 *  root flaring at its foot; an axe left stuck in one. */
export const drawStump = (c: Ctx, v: View, a: number, b: number, top: number, axe: boolean) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const w = b - a, h = GY - top, W = ramp6(hour('#E8C080'));
  box3Back(c, v, { x: a, top, w, bottom: GY, col: BARK });
  if (v.eye.y < top - 1) {
    const [p0, q0] = at(v.eye, a, top, 1), [p1] = at(v.eye, b, top, 1), [, q1] = at(v.eye, a, top, 0.93), mx = (p0 + p1) / 2, my = (q0 + q1) / 2, rx = (p1 - p0) / 2 - 3, ry = Math.max(1, (q0 - q1) / 2 - 1);
    c.fillStyle = W[2]; c.beginPath(); c.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = W[1]; c.lineWidth = 1; for (const k of [0.33, 0.66]) { c.beginPath(); c.ellipse(mx, my, rx * k, ry * k, 0, 0, Math.PI * 2); c.stroke(); }
    box(c, mx - 1, my, 2, 1, W[0]);
  }
  still(c, `ca-stump-${w}x${h}`, a, top, -8, -1, w + 16, h + 2, g => {
    const B = ramp6(hour(BARK));
    poly(g, [[-7, h], [0, h - 14], [w, h - 14], [w + 7, h]], INK); poly(g, [[-6, h], [1, h - 13], [w - 1, h - 13], [w + 6, h]], B[2]);
    box(g, -1, 0, w + 2, h + 1, INK); bark(g, 0, 0, w, h, B, true, a);
    box(g, 0, 0, 5, h, 'rgba(255,240,210,0.12)'); box(g, w - 8, 0, 8, h, 'rgba(28,16,20,0.28)');
    box(g, 0, 0, w, 3, W[3]); box(g, 0, 0, w, 1, W[4]);
  });
  if (axe) {
    const S = ramp6(hour('#A8AEB8')), Hd = ramp6(hour('#8A5A2E')), ax = a + w * 0.6;
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(ax, top + 2); c.lineTo(ax + 18, top - 30); c.stroke();
    c.strokeStyle = Hd[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, top + 2); c.lineTo(ax + 18, top - 30); c.stroke();
    c.strokeStyle = Hd[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - 1, top + 1); c.lineTo(ax + 17, top - 31); c.stroke();
    poly(c, [[ax - 9, top + 3], [ax + 6, top - 3], [ax + 8, top + 3], [ax - 8, top + 9]], INK); poly(c, [[ax - 8, top + 3], [ax + 5, top - 2], [ax + 6, top + 2], [ax - 7, top + 7]], S[3]); box(c, ax - 7, top + 3, 6, 1, S[5]);
  }
  lip(c, a, top, w);
};

/** One of the carved poles' faces (local: 0..w across, its top at y, fh tall): painted flat on the plywood like the
 *  carving it isn't (dark outlines, stepped shades): a moose, a beaver, a goalie's mask, a Mountie. */
const poleFace = (g: Ctx, w: number, y: number, fh: number, kind: number) => {
  const cx = w / 2, K = (c: string) => ramp6(hour(c));
  if (kind === 0) {
    // (a moose: the brown head, the big droopy nose, the antlers painted out flat to the edges)
    const M = K('#6B4423'), A = K('#D8C4A0');
    for (const s of [-1, 1]) { poly(g, [[cx + s * 6, y + 10], [cx + s * (w / 2 - 2), y + 2], [cx + s * (w / 2 - 2), y + 14], [cx + s * 10, y + 16]], INK); poly(g, [[cx + s * 7, y + 11], [cx + s * (w / 2 - 3), y + 4], [cx + s * (w / 2 - 3), y + 13], [cx + s * 10, y + 15]], A[3]); for (let k = 0; k < 3; k++) box(g, cx + s * (12 + k * 5) - 1, y + 1, 2, 4, A[4]); }
    box(g, cx - 11, y + 12, 22, fh - 14, INK); box(g, cx - 10, y + 13, 20, fh - 16, M[3]); box(g, cx - 10, y + 13, 5, fh - 16, M[4]);
    box(g, cx - 13, y + fh - 18, 26, 14, INK); box(g, cx - 12, y + fh - 17, 24, 12, M[2]); box(g, cx - 8, y + fh - 13, 3, 3, INK); box(g, cx + 5, y + fh - 13, 3, 3, INK);
    box(g, cx - 7, y + 18, 4, 4, '#F8FAFC'); box(g, cx + 3, y + 18, 4, 4, '#F8FAFC'); box(g, cx - 6, y + 19, 2, 2, INK); box(g, cx + 4, y + 19, 2, 2, INK);
  } else if (kind === 1) {
    // (a beaver: round ears, the buck teeth, the whiskers, the flat tail crossed behind)
    const B = K('#7C3F1E'), T = K('#3A2A1E');
    box(g, 4, y + fh - 14, w - 8, 8, INK); box(g, 5, y + fh - 13, w - 10, 6, T[3]); for (let x = 8; x < w - 8; x += 4) box(g, x, y + fh - 12, 1, 4, T[1]);
    for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.arc(cx + s * 12, y + 8, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = B[3]; g.beginPath(); g.arc(cx + s * 12, y + 8, 5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, y + fh / 2, 15, fh / 2 - 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[3]; g.beginPath(); g.ellipse(cx, y + fh / 2, 14, fh / 2 - 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[4]; g.beginPath(); g.ellipse(cx - 5, y + fh / 2 - 4, 6, 8, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - 7, y + 14, 4, 4, '#F8FAFC'); box(g, cx + 3, y + 14, 4, 4, '#F8FAFC'); box(g, cx - 6, y + 15, 2, 2, INK); box(g, cx + 4, y + 15, 2, 2, INK);
    box(g, cx - 3, y + 21, 6, 4, INK); box(g, cx - 4, y + 26, 8, 8, INK); box(g, cx - 3, y + 26, 3, 7, '#F8FAFC'); box(g, cx + 1, y + 26, 2, 7, '#F8FAFC');
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) box(g, cx + s * 6 - (s < 0 ? 8 : 0), y + 23 + k * 3, 8, 1, INK);
  } else if (kind === 2) {
    // (a goalie's mask: white, its eye holes, the breathing holes, a red and blue stripe)
    const Wm = K('#F8FAFC');
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, y + fh / 2, 15, fh / 2 - 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Wm[3]; g.beginPath(); g.ellipse(cx, y + fh / 2, 14, fh / 2 - 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Wm[2]; g.beginPath(); g.ellipse(cx + 6, y + fh / 2 + 2, 7, fh / 2 - 8, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - 2, y + 4, 4, fh - 8, hour('#DC2626')); box(g, cx - 6, y + 4, 3, fh - 12, hour('#1D4ED8'));
    for (const s of [-1, 1]) { box(g, cx + s * 7 - 4, y + 14, 8, 5, INK); }
    for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) box(g, cx - 5 + k * 4, y + 26 + j * 4, 2, 2, INK);
  } else {
    // (a Mountie: the flat-brimmed hat, the face, the red serge collar and its gold)
    const H = K('#A16207'), Sk = K('#E8B890'), R = K(SERGE);
    box(g, 3, y + 9, w - 6, 5, INK); box(g, 4, y + 10, w - 8, 3, H[3]); box(g, 4, y + 10, w - 8, 1, H[5]);
    poly(g, [[cx - 9, y + 10], [cx - 6, y + 1], [cx, y + 4], [cx + 6, y + 1], [cx + 9, y + 10]], INK); poly(g, [[cx - 8, y + 9], [cx - 5, y + 2], [cx, y + 5], [cx + 5, y + 2], [cx + 8, y + 9]], H[3]); box(g, cx - 8, y + 8, 16, 2, hour('#78350F'));
    box(g, cx - 10, y + 14, 20, 18, INK); box(g, cx - 9, y + 15, 18, 16, Sk[3]); box(g, cx - 9, y + 15, 4, 16, Sk[4]);
    box(g, cx - 6, y + 19, 3, 3, INK); box(g, cx + 3, y + 19, 3, 3, INK); box(g, cx - 4, y + 26, 8, 2, hour('#9A3A3A')); box(g, cx - 5, y + 24, 10, 1, hour('#5A3A1E'));
    box(g, 3, y + 32, w - 6, fh - 33, INK); box(g, 4, y + 33, w - 8, fh - 35, R[3]); box(g, 4, y + 33, 4, fh - 35, R[4]); box(g, cx - 1, y + 33, 2, fh - 35, hour('#FCD34D'));
  }
};
/** A carved pole (a box he stands on): plywood, its laminations showing down its sides going back; the faces stacked up
 *  its front, each its own carving; the grain, the bolts; MADE IN OHIO stenciled at its foot; the wings bolted across its
 *  top, set back. */
export const drawPole = (c: Ctx, v: View, a: number, b: number, top: number, i: number) => {
  if (!onScreen(v, a - 50, b + 50)) return;
  const w = b - a, h = GY - top, P = ramp6(hour(PLY));
  // (the wings: two flat boards bolted across the top, set back behind where he'd stand)
  const [pa, py] = at(v.eye, a, top, 0.96), [pb] = at(v.eye, b, top, 0.96), pm = (pa + pb) / 2, Wn = ramp6(dimmed(['#1D4ED8', '#B91C1C', '#15803D'][i % 3]));
  if (py < top - 1) {
    c.save(); c.beginPath(); c.rect(pm - 80, py - 60, 160, top - (py - 60)); c.clip();
    for (const s of [-1, 1]) { poly(c, [[pm + s * 4, py + 2], [pm + s * 48, py - 22], [pm + s * 42, py - 8], [pm + s * 50, py - 4], [pm + s * 6, py + 4]], INK); poly(c, [[pm + s * 5, py + 1], [pm + s * 46, py - 20], [pm + s * 41, py - 8], [pm + s * 47, py - 5], [pm + s * 6, py + 3]], Wn[3]); for (let k = 1; k < 4; k++) box(c, pm + s * (8 + k * 10) - 1, py - k * 5, 2, 4, Wn[1]); }
    c.restore();
  }
  box3Back(c, v, { x: a, top, w, bottom: GY, col: PLY });
  // (the plies down the sides going back)
  c.strokeStyle = P[1]; c.lineWidth = 1; c.beginPath();
  for (const [e, s] of [[a, -1], [b, 1]] as const) if ((v.eye.x - e) * s > 1) for (const k of [0.25, 0.5, 0.75]) { const d = 1 - 0.07 * k, [p0, q0] = at(v.eye, e, top, d), [, q1] = at(v.eye, e, GY, d); c.moveTo(p0, q0); c.lineTo(p0, q1); }
  c.stroke();
  still(c, `ca-pole-${w}x${h}-${i}`, a, top, -2, -1, w + 4, h + 2, g => {
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, P, true, i * 7 + 2, Math.round(w / 2));
    const n = Math.floor((h - 26) / 50);
    for (let k = 0; k < n; k++) poleFace(g, w, 6 + k * 50, 46, (k + i) % 4);
    for (const bx of [5, w - 7]) for (let y = 12; y < h - 20; y += 50) { box(g, bx, y, 2, 2, P[0]); box(g, bx, y, 1, 1, P[5]); }
    box(g, 0, h - 22, w, 22, P[2]); box(g, 0, h - 22, w, 1, P[4]);
    signText(g, 'MADE IN', w / 2, h - 13, { sx: 1, sy: 1, fill: hour('#1C1917'), gap: 0, stencil: true });
    signText(g, 'OHIO', w / 2, h - 4, { sx: 1, sy: 1, fill: hour('#1C1917'), gap: 1, stencil: true });
    box(g, 0, 0, 2, h, P[4]); box(g, w - 3, 0, 3, h, P[1]);
  });
  lip(c, a, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// The log pond, the falls, the cliff

/** A log side on (local: its top-left at x, y; w x h): bark in ridges along it (stepped round: lit along its top, its
 *  belly in shade), knots, a patch of moss, the cut end's rings at its right. */
const paintLog = (g: Ctx, w: number, h: number) => {
  const B = ramp6(hour(BARK)), M = ramp6(hour('#4A6A2A'));
  box(g, -1, -1, w + 2, h + 2, INK);
  bark(g, 0, 0, w, h, B, false, w);
  box(g, 0, 0, w, 3, B[4]); box(g, 0, 1, w, 1, B[5]); box(g, 0, h - 6, w, 6, B[1]); box(g, 0, h - 2, w, 2, B[0]);
  for (const kx of [w * 0.28, w * 0.66]) { g.fillStyle = INK; g.beginPath(); g.ellipse(kx, h * 0.45, 4, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = B[3]; g.beginPath(); g.ellipse(kx, h * 0.45, 3, 2, 0, 0, Math.PI * 2); g.fill(); box(g, kx - 1, h * 0.45 - 1, 1, 1, B[5]); }
  pixelBlob(g, w * 0.45, 3, 10, 2.5, M[3], 1); box(g, w * 0.45 - 6, 1, 5, 1, M[5]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(w, h / 2, 6, h / 2 + 1, 0, 0, Math.PI * 2); g.fill();
  logEndOval(g, w, h / 2, 5, h / 2);
};
const logEndOval = (g: Ctx, x: number, y: number, rx: number, ry: number) => {
  const W = ramp6(hour('#E8C080'));
  g.fillStyle = ramp6(hour(BARK))[2]; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = W[3]; g.beginPath(); g.ellipse(x, y, rx - 1.5, ry - 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = W[4]; g.beginPath(); g.ellipse(x - 1, y - ry * 0.3, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = W[1]; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, rx * 0.5, ry * 0.55, 0, 0, Math.PI * 2); g.stroke();
};
/** A log (live: it floats, it falls): stamped, put where it is. */
export const drawLog = (c: Ctx, x: number, y: number, w: number, h = 22) => still(c, `ca-log-${w}x${h}`, x, y, -2, -2, w + 10, h + 4, g => paintLog(g, w, h));

/** The rock face behind the climb (set back; local: its left foot at 0, 0; w across, h up): fiberglass rock in strata
 *  (its seams showing), lichen and moss, a pine clinging on, wet streaks down beside the falls. */
const paintRockFace = (g: Ctx, w: number, h: number, fx0: number, fx1: number) => {
  const R = ramp6(dimmed(ROCK));
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  worldRock(g, 0, -h, w, h, R, 0, -h, 71);
  for (let y = -h + 120; y < 0; y += 180) { box(g, 0, y, w, 1, R[0]); for (let x = 6; x < w; x += 18) box(g, x, y - 1, 2, 3, R[4]); }
  for (let x = fx0 - 12; x < fx1 + 12; x += 3) for (let y = -h + 30; y < 0; y += 6) if (hash(x * 0.3 + y) > 0.6) box(g, x, y, 2, 4, R[0]);
  for (let k = 0; k < 8; k++) { const px0 = 30 + hash(k * 3.3) * (w - 60), py0 = -h + 80 + hash(k * 2.1) * (h - 160); if (px0 > fx0 - 30 && px0 < fx1 + 30) continue; g.save(); g.translate(0, Math.round(py0)); paintPine(g, px0, 40 + hash(k) * 30, k, dimmed); g.restore(); }
};
/** Rock in strata (local box x, y, w, h; the strata and the lumps by world place wx, wy so tiles meet seamlessly):
 *  each stratum's top shaded and dithered, the lumps along it lit on their tops, cracks down them, lichen. */
export const worldRock = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], wx: number, wy: number, seed: number) => {
  box(g, x, y, w, h, R[2]);
  const SH = 22, n0 = Math.floor(wy / SH) - 1, n1 = Math.ceil((wy + h) / SH) + 1;
  const top = (n: number) => n * SH + Math.round(hash(seed + n * 1.37) * 8);
  for (let n = n0; n < n1; n++) {
    const sy = top(n) - wy + y, ey = top(n + 1) - wy + y;
    if (ey < y || sy > y + h) continue;
    box(g, x, sy, w, 2, R[1]); checker(g, x, sy + 2, w, 2, R[1], 0, 1);
    for (let gx = Math.floor((wx) / 16) * 16 - 16; gx < wx + w + 16; gx += 16) {
      const t = hash(seed + n * 7.1 + gx * 0.13); if (t < 0.25) continue;
      const lx = gx - wx + x + Math.round(hash(seed + gx + n) * 8), lw = 10 + Math.round(t * 18), lh = Math.min(ey - sy - 4, 4 + Math.round(hash(seed + n + gx * 0.7) * 9));
      if (lh < 2) continue;
      box(g, lx, sy + 3, lw, lh, R[3]); box(g, lx, sy + 3, lw, 1, R[4]); box(g, lx, sy + 3, Math.min(3, lw), lh, R[4]); box(g, lx, sy + 3 + lh, lw, 1, R[1]);
      if (t > 0.9) box(g, lx + 2, sy + 2, 3, 2, ramp6(mix(R[3], '#7A8A5A', 0.5))[3]);
    }
    for (let gx = Math.floor(wx / 40) * 40; gx < wx + w + 40; gx += 40) if (hash(seed + gx * 0.37 + n * 2.9) > 0.78) { const cx = gx - wx + x + Math.round(hash(gx + n) * 30); for (let yy = sy + 3; yy < ey; yy += 3) box(g, cx + ((yy >> 2) % 2), yy, 1, 3, R[0]); }
  }
};
/** The rock face behind the climb (set back at 0.94). */
export const drawRockFace = (c: Ctx, v: View, x: number, w: number, h: number, fx0: number, fx1: number) => facade(c, v, `ca-rockface-${w}x${h}`, x, w, h, g => paintRockFace(g, w, h, fx0, fx1), 0.94, 0, 0, false);
/** A mass of rock at the play plane (a polygon of world points): rock in strata, tiled (world-placed, so it's seamless)
 *  and clipped to it. */
export const rockMass = (c: Ctx, v: View, pts: [number, number][], seed: number) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.max(Math.min(...xs), v.cam.x - 20), x1 = Math.min(Math.max(...xs), v.cam.x + 820), y0 = Math.max(Math.min(...ys), v.cam.y - 20), y1 = Math.min(Math.max(...ys), v.cam.y + 620);
  if (x1 <= x0 || y1 <= y0) return;
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const T = 160, R = ramp6(hour(ROCK));
  for (let tx = Math.floor(x0 / T) * T; tx < x1; tx += T) for (let ty = Math.floor(y0 / T) * T; ty < y1; ty += T) still(c, `ca-rock-${seed}-${tx}-${ty}`, tx, ty, 0, 0, T, T, g => worldRock(g, 0, 0, T, T, R, tx, ty, seed));
  c.restore();
};
/** A rock ledge (one-way): its front in strata (the lit lip), the boulder under it in steps, moss along its edge. */
export const rockLedge = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const R = ramp6(hour('#78716C')), M = ramp6(hour('#4A6A2A'));
  poly(c, [[a + 2, y + 13], [b - 2, y + 13], [b - 14, y + 40], [a + 22, y + 36]], INK);
  poly(c, [[a + 3, y + 14], [b - 3, y + 14], [b - 15, y + 38], [a + 22, y + 34]], R[1]);
  poly(c, [[a + 3, y + 14], [a + (b - a) * 0.5, y + 14], [a + (b - a) * 0.45, y + 30], [a + 22, y + 34]], R[2]);
  ledge3(c, v, a, y, b - a, '#78716C', 14, 'rock');
  for (let x = a + 3; x < b - 3; x += 7) if (hash(x * 0.7 + y) > 0.5) { box(c, x, y + 3, 5, 2, M[3]); box(c, x + 1, y + 5, 2, 2, M[2]); }
};
/** The falls (live): the pumped pipe at the top (steel, painted (badly) to look like rock: its blotches, the bolted
 *  flange, an access hatch), the water down the column in stepped bands with streaks running down, its lit edge, the
 *  foam at the foot, the spray. */
export const drawFalls = (c: Ctx, a: number, b: number, top: number, bot: number, f: number) => {
  const w = b - a, Pp = ramp6(hour('#6A6460'));
  box(c, a - 13, top - 33, w + 26, 30, INK); box(c, a - 12, top - 32, w + 24, 28, Pp[3]); box(c, a - 12, top - 32, w + 24, 4, Pp[5]); box(c, a - 12, top - 8, w + 24, 4, Pp[1]);
  for (let k = 0; k < 8; k++) pixelBlob(c, a - 6 + hash(k * 3.1) * (w + 12), top - 26 + hash(k * 1.7) * 16, 5, 3, k % 2 ? hour('#8A7A6A') : hour('#5A5450'), 1);
  for (let x = a - 10; x < b + 10; x += 10) { box(c, x, top - 31, 2, 2, Pp[0]); }
  box(c, a + w / 2 - 8, top - 28, 16, 12, INK); box(c, a + w / 2 - 7, top - 27, 14, 10, Pp[2]); signText(c, 'PUMP', a + w / 2, top - 19, { sx: 1, sy: 1, fill: hour('#F4F1EA'), gap: 0 });
  const W = [hour('#3A8AC8'), hour('#7DD3FC'), hour('#BAE6FD'), hour('#F0F9FF')];
  c.globalAlpha = 0.78;
  box(c, a, top, w, bot - top, W[0]); box(c, a + 6, top, w - 12, bot - top, W[1]); box(c, a + 14, top, w - 30, bot - top, W[2]);
  c.globalAlpha = 1;
  for (let x = a + 2; x < b - 2; x += 4) { const off = (f * 7 + x * 13) % 60; for (let y = top + off - 60; y < bot; y += 60) if (y > top) box(c, x, y, 2, 14, W[3]); }
  checker(c, a, top, 3, bot - top, W[3], 0, 1); box(c, b - 3, top, 3, bot - top, W[0]);
  for (let k = 0; k < 7; k++) { const fx = a - 6 + k * ((w + 12) / 6), fy = bot - 4 + Math.sin(f * 0.3 + k) * 3; pixelBlob(c, fx, fy, 9, 6, W[2]); pixelBlob(c, fx - 2, fy - 2, 5, 3, W[3]); }
  c.globalAlpha = 0.4; for (let k = 0; k < 4; k++) pixelBlob(c, a + w / 2 + Math.sin(f * 0.04 + k * 2) * 40, bot - 24 - k * 12, 30 - k * 4, 10, '#F0F9FF'); c.globalAlpha = 1;
};
/** The cliff and the trail (at the play plane): the rock mass (strata), the front face's lit edge, the clifftop going back
 *  (snow-dusted, the lit lip), the trail's timber treads (each a lit lip) and the log handrail set back down the slope. */
export const drawCliffArt = (c: Ctx, v: View, cliff: number, trailA: number, trailB: number, topY: number, steps: number) => {
  if (!onScreen(v, cliff - 40, trailB + 40)) return;
  const n = steps, tread = (trailB - trailA) / n, rise = (GY - topY) / n;
  const pts: [number, number][] = [[cliff, topY], [trailA, topY]];
  for (let i = 0; i < n; i++) { const x = trailA + tread * i, y = topY + rise * (i + 1); pts.push([x, y - rise], [x, y]); pts.push([x + tread, y]); }
  pts.push([trailB, GY + 400], [cliff, GY + 400]);
  rockMass(c, v, pts, 5);
  const R = ramp6(hour(ROCK));
  box(c, cliff, topY, 6, GY - topY, R[4]); box(c, cliff, topY, 2, GY - topY, R[5]); checker(c, cliff + 6, topY, 3, GY - topY, R[4], 0, 1);
  // (the clifftop going back: dusted with snow, banded)
  const S = ramp6(hour(SNOW));
  if (v.eye.y < topY - 1) topBack(c, v.eye, cliff, trailA, topY, 1, 0.9, S, 3);
  // (the trail: a timber riser and a gravel tread on each step, the lit lip; posts and the log rail set back)
  const T = ramp6(hour('#7A5230')), Gv = ramp6(hour('#9A9088'));
  for (let i = 0; i < n; i++) {
    const a = trailA + tread * i, y = topY + rise * (i + 1);
    if (!onScreen(v, a - 10, a + tread + 10)) continue;
    box(c, a, y, tread, 6, Gv[3]); checker(c, a, y + 1, tread, 4, Gv[2], i % 2, 2);
    box(c, a - 1, y - 1, 6, rise + 2, INK); box(c, a, y, 4, rise, T[2]); box(c, a, y, 1, rise, T[4]);
    box(c, a - 1, y + 6, tread + 2, 8, INK); box(c, a, y + 6, tread, 6, T[3]); box(c, a, y + 6, tread, 1, T[5]); box(c, a, y + 11, tread, 1, T[1]);
    lip(c, a, y, tread);
  }
  const d = 0.96, D = ramp6(dimmed('#7A5230'));
  for (let i = 0; i <= n; i += 3) { const x = trailA + tread * i + 4, y = topY + rise * i; const [p0, q0] = at(v.eye, x, y - 34, d), [, q1] = at(v.eye, x, y, d); box(c, p0 - 2, q0, 5, q1 - q0, INK); box(c, p0 - 1, q0, 3, q1 - q0, D[3]); }
  const [r0x, r0y] = at(v.eye, trailA + 4, topY - 30, d), [r1x, r1y] = at(v.eye, trailB - 20, GY - 30, d);
  for (const [col, lw] of [[INK, 5], [D[3], 3], [D[5], 1]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(r0x, r0y); c.lineTo(r1x, r1y); c.stroke(); }
  lip(c, cliff, topY, trailA - cliff);
};
/** The MAPLE LOG FLUME (set back, local to it: its trough along at ty): the trestle (timber legs, X-braced), the
 *  plank trough and the water running in it, the log sliding along it (the tell: live). */
export const paintFlume = (c: Ctx, w: number, ty: number, overVoid: number, logX: number | null, f: number) => {
  const T = ramp6(dimmed('#7A4A22')), Wt = [dimmed('#3A8AC8'), dimmed('#7DD3FC'), dimmed('#E0F2FE')];
  for (let x = 30; x < w; x += 90) {
    const hh = x < overVoid ? 60 : 50;
    box(c, x - 1, ty, 8, hh, INK); box(c, x, ty, 6, hh, T[3]); box(c, x, ty, 2, hh, T[4]);
    if (x + 90 < w && x > overVoid) { for (const [col, lw] of [[INK, 4], [T[2], 2]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x + 3, ty + 4); c.lineTo(x + 93, ty + hh - 4); c.moveTo(x + 93, ty + 4); c.lineTo(x + 3, ty + hh - 4); c.stroke(); } }
  }
  box(c, -1, ty - 21, w + 2, 24, INK); planks(c, 0, ty - 20, w, 22, T, false, 3, 7); box(c, 0, ty - 20, w, 3, T[4]);
  box(c, 0, ty - 17, w, 4, Wt[1]); for (let x = (f * 3) % 24 - 24; x < w; x += 24) box(c, Math.max(0, x), ty - 16, 8, 1, Wt[2]);
  box(c, -4, ty - 18, 6, 10, Wt[1]); box(c, -3, ty - 8, 4, 12, Wt[2]);
  if (logX !== null) drawLog(c, logX, ty - 34, 130, 20);
};
/** A falling log off the flume, down the falls (live: tumbling). */
export const fallingLog = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(x, y); c.rotate(1.3 + Math.sin(f * 0.2) * 0.2); drawLog(c, -40, -11, 80); c.restore();
  for (let k = 0; k < 4; k++) box(c, x - 20 + k * 12, y - 30 - ((f * 3 + k * 7) % 20), 3, 3, '#F0F9FF');
};

// ---------------------------------------------------------------------------------------------------------------
// THE RINK

/** The rink (a..b the ice between the boards, at y): the ice going back (banded, scored by skates), the blue lines and
 *  the red, the faceoff circles; the back boards set back (white, the yellow kick plate, the ads), the glass over them. */
export const drawRinkIce = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const I = ramp6(hour('#E8F4FC')), d1 = 0.88, P = (x: number, dd: number) => at(v.eye, x, y, dd);
  if (v.eye.y < y - 1) {
    for (let k = 0; k < 4; k++) { const da = 1 - ((1 - d1) * k) / 4, db = 1 - ((1 - d1) * (k + 1)) / 4; poly(c, [P(a, da), P(b, da), P(b, db), P(a, db)], I[[4, 3, 3, 2][k]]); }
    c.strokeStyle = I[2]; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 18; k++) { const x = a + hash(k * 3.7) * (b - a), dd = 0.9 + hash(k * 1.3) * 0.09, [p0, q0] = P(x, dd), [p1, q1] = P(x + 30 + hash(k) * 40, dd - 0.01); c.moveTo(p0, q0); c.lineTo(p1, q1); } c.stroke();
    for (const [lx, col, lw] of [[0.33, '#2563EB', 4], [0.5, '#DC2626', 4], [0.67, '#2563EB', 4]] as const) { const x = a + (b - a) * lx; poly(c, [P(x - lw / 2, 1), P(x + lw / 2, 1), P(x + lw / 2, d1), P(x - lw / 2, d1)], hour(col)); }
    for (const lx of [0.18, 0.5, 0.82]) { const x = a + (b - a) * lx, [cx, cy] = P(x, 0.94), [ex] = P(x + 40, 0.94), [, ty] = P(x, 0.91); c.strokeStyle = hour(lx === 0.5 ? '#2563EB' : '#DC2626'); c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, ex - cx, Math.max(1, cy - ty), 0, 0, Math.PI * 2); c.stroke(); box(c, cx - 2, cy - 1, 4, 2, hour('#DC2626')); }
  }
  // (the back boards and the glass, set back)
  const [ba, by] = P(a, d1), [bb] = P(b, d1), Wb = ramp6(dimmed('#F8FAFC'));
  box(c, ba, by - 32, bb - ba, 32, INK); box(c, ba, by - 31, bb - ba, 30, Wb[3]); box(c, ba, by - 31, bb - ba, 2, Wb[5]); box(c, ba, by - 8, bb - ba, 8, dimmed('#FDE047')); box(c, ba, by - 32, bb - ba, 3, dimmed('#DC2626'));
  const ADS = ['SORRY', 'MAPLE', 'EH?', 'POUTINE', 'SORRY'];
  for (let k = 0; k < 5; k++) { const ax = ba + 10 + k * ((bb - ba - 20) / 5), aw = (bb - ba - 20) / 5 - 8; box(c, ax, by - 26, aw, 15, dimmed(['#1E3A8A', '#B91C1C', '#14532D', '#7C2D12', '#1E3A8A'][k])); signText(c, ADS[k], ax + aw / 2, by - 15, { sx: 1, sy: 1, fill: dimmed('#F8FAFC'), gap: 1 }); }
  c.globalAlpha = 0.25; box(c, ba, by - 76, bb - ba, 44, '#E0F2FE'); c.globalAlpha = 1;
  for (let x = ba; x < bb; x += 60) box(c, x, by - 76, 2, 44, dimmed('#94A3B8'));
  box(c, ba, by - 77, bb - ba, 2, dimmed('#94A3B8'));
  for (let x = ba + 20; x < bb; x += 120) poly(c, [[x, by - 76], [x + 10, by - 76], [x - 6, by - 32], [x - 14, by - 32]], 'rgba(255,255,255,0.18)');
};
/** The rink's nets (at the play plane, on the ice at y): the red pipe frames, the white mesh dithered, the shade inside. */
export const drawNets = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  for (const nx of [a + 30, b - 60]) {
    box(c, nx - 1, y - 27, 32, 27, INK); box(c, nx, y - 26, 30, 3, hour('#DC2626')); box(c, nx, y - 26, 3, 26, hour('#DC2626')); box(c, nx + 27, y - 26, 3, 26, hour('#DC2626'));
    box(c, nx + 3, y - 23, 24, 23, 'rgba(28,16,20,0.35)'); checker(c, nx + 3, y - 23, 24, 23, '#F8FAFC', 0, 2);
  }
};
/** The rink's boards (a box he stands on, low): white, the yellow kick plate, the red rail along the top, an ad. */
export const drawBoards = (c: Ctx, v: View, a: number, b: number, top: number, bottom: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = bottom - top;
  box3Back(c, v, { x: a, top, w, bottom, col: '#F8FAFC' });
  still(c, `ca-boards-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const Wb = ramp6(hour('#F8FAFC'));
    box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, Wb, false);
    box(g, 0, 0, w, 4, hour('#DC2626')); box(g, 0, 0, w, 1, hour('#F87171'));
    box(g, 0, h - 10, w, 10, hour('#FDE047')); box(g, 0, h - 10, w, 1, hour('#FEF08A'));
    box(g, 3, 8, w - 6, h - 20, hour('#1E3A8A')); box(g, 4, 10, w - 8, 2, hour('#F8FAFC'));
  });
  lip(c, a, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// The flag

/** Canada's flag at x on the ground: red, white, red, the maple leaf in the middle, in stepped folds. */
export const drawMapleFlag = (c: Ctx, x: number, f: number) => {
  flagPole(c, x, GY, 200, ['#D52B1E', '#F8FAFC', '#F8FAFC', '#D52B1E'], f, true);
  // (the leaf over the white, waving with it)
  const fx = x + 2 + 24, top = GY - 198, wave = Math.sin(f * 0.08 + 24 * 0.12) * 2 * (0.5 + 0.3);
  const L: [number, number][] = [[0, -12], [3, -6], [7, -8], [5, -2], [10, -3], [7, 2], [9, 4], [2, 3], [1, 9], [-1, 9], [-2, 3], [-9, 4], [-7, 2], [-10, -3], [-5, -2], [-7, -8], [-3, -6]];
  poly(c, L.map(([a, b]) => [fx + a * 1.15, top + 15 + wave + b * 1.15] as [number, number]), INK);
  poly(c, L.map(([a, b]) => [fx + a, top + 15 + wave + b] as [number, number]), hour('#D52B1E'));
  poly(c, [[fx, top + 3 + wave], [fx - 3, top + 9 + wave], [fx - 7, top + 7 + wave], [fx - 5, top + 13 + wave], [fx, top + 15 + wave]], hour('#E8473A'));
};

// ---------------------------------------------------------------------------------------------------------------
// The frozen pond and the toboggan hill (pond.ts)

/** The boards behind the pond (set back: local foot 0, w across): white, the red rail, the kick plate, the ads, the
 *  glass over them. */
const paintPondBoards = (g: Ctx, w: number) => {
  const Wb = ramp6(dimmed('#F8FAFC'));
  box(g, -1, -45, w + 2, 45, INK); slab(g, 0, -44, w, 44, Wb, false);
  box(g, 0, -44, w, 4, dimmed('#DC2626')); box(g, 0, -10, w, 10, dimmed('#FDE047'));
  const ADS = ['SORRY ABOUT THE ICE', 'SKATE AT OWN RISK', 'REFRIGERATED', 'SORRY'];
  for (let k = 0; k < 4; k++) { const ax = 10 + k * (w / 4), aw = w / 4 - 20; box(g, ax, -36, aw, 20, dimmed(['#1E3A8A', '#B91C1C', '#14532D', '#7C2D12'][k])); signText(g, ADS[k], ax + aw / 2, -21, { sx: 1, sy: 1, fill: dimmed('#F8FAFC'), gap: 1 }); }
  g.globalAlpha = 0.22; box(g, 0, -100, w, 56, '#E0F2FE'); g.globalAlpha = 1;
  for (let x = 0; x <= w; x += 70) box(g, x, -100, 2, 56, dimmed('#94A3B8'));
  box(g, 0, -101, w, 2, dimmed('#94A3B8'));
};
export const drawPondBoards = (c: Ctx, v: View, x: number, w: number) => facade(c, v, `ca-pondboards-${w}`, x, w, 44, g => paintPondBoards(g, w), 0.92, 60, 4, false);

/** An ice panel over the pond (one-way: the lit lip): stepped ice (its lit top face, the body, bubbles frozen in it, a
 *  glint); the thin ones darker and marked (a red X painted on them), their hairline cracks spreading as they go
 *  (`crackK` 0..1), flashing as they go. */
export const icePanel = (c: Ctx, x: number, w: number, thin: boolean, crackK: number, cracking: boolean, f: number) => {
  const I = ramp6(thin ? mix(hour(ICE), '#1E3A8A', 0.32) : hour(ICE));
  box(c, x, GY, w, 13, INK); box(c, x + 1, GY, w - 2, 12, I[3]); box(c, x + 1, GY, w - 2, 3, I[4]); box(c, x + 1, GY + 9, w - 2, 3, I[2]); checker(c, x + 1, GY + 7, w - 2, 2, I[2], 0, 1);
  for (let k = 0; k < 4; k++) box(c, x + 6 + ((k * 17 + x) % (w - 12)), GY + 5 + (k % 2) * 2, 2, 2, I[5]);
  if (!thin) { box(c, x + 10, GY + 4, 18, 1, '#F8FAFC'); box(c, x + 14, GY + 5, 8, 1, I[5]); }
  else {
    c.strokeStyle = hour('#DC2626'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w / 2 - 6, GY + 3); c.lineTo(x + w / 2 + 6, GY + 10); c.moveTo(x + w / 2 + 6, GY + 3); c.lineTo(x + w / 2 - 6, GY + 10); c.stroke();
    c.strokeStyle = '#E0F2FE'; c.lineWidth = 1; c.beginPath();
    const n = 2 + Math.floor(crackK * 6);
    for (let k = 0; k < n; k++) { const sx = x + 8 + ((k * 23) % (w - 16)), dx = k % 2 ? 1 : -1; c.moveTo(sx, GY + 2); c.lineTo(sx + dx * 5, GY + 6); c.lineTo(sx + dx * 2, GY + 8); c.lineTo(sx + dx * 9, GY + 12); }
    c.stroke();
    if (cracking && (f >> 2) % 2) box(c, x, GY - 2, w, 2, '#E0F2FE');
  }
  box(c, x, GY + 12, w, 2, mix(I[2], INK, 0.4));
  lip(c, x, GY, w);
};
/** A hole where a panel went through: ice chunks bobbing in it, in steps. */
export const iceChunks = (c: Ctx, x: number, f: number) => {
  const I = ramp6(hour(ICE));
  for (let k = 0; k < 3; k++) { const cx = x + 8 + k * 20, cy = GY + 26 + Math.sin(f * 0.1 + k) * 2; poly(c, [[cx, cy + 5], [cx + 2, cy], [cx + 12, cy - 1], [cx + 15, cy + 5]], INK); poly(c, [[cx + 1, cy + 4], [cx + 3, cy + 1], [cx + 11, cy], [cx + 14, cy + 4]], I[4]); box(c, cx + 3, cy + 1, 6, 1, I[5]); }
};
/** The toboggan hill (snow over it all, banded, drifts and sparkle; the stairs cut in it, each with its timber edge and
 *  lit lip; the flat top; the chute down the far side: an icy groove between its wooden rails, the lit lip along it). */
export const drawHill = (c: Ctx, v: View, a: number, topX: number, b: number, end: number, topY: number, steps: number, f: number) => {
  if (!onScreen(v, a - 20, end + 20)) return;
  const S = ramp6(hour(SNOW)), T = ramp6(hour('#7A5230')), Ic = ramp6(hour('#93C5FD'));
  const shape: [number, number][] = [[a, GY], [topX, topY], [b, topY], [end, GY], [end, GY + 400], [a, GY + 400]];
  poly(c, shape, S[3]);
  c.save(); c.beginPath(); shape.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  for (let k = 0; k < 6; k++) { const y = topY + 40 + k * 60; box(c, a, y, end - a, 60, S[[3, 3, 2, 2, 1, 1][k]]); checker(c, a, y - 2, end - a, 2, S[[3, 3, 2, 2, 1, 1][k]], k % 2, 2); }
  box(c, a, GY, end - a, 400, S[1]);
  for (let k = 0; k < 40; k++) { const x = a + hash(k * 3.1) * (end - a), y = topY + 10 + hash(k * 1.7) * (GY - topY); if (((f >> 4) + k) % 7 === 0) box(c, x, y, 2, 2, '#FFFFFF'); else box(c, x, y, 2, 1, S[4]); }
  c.restore();
  // (the stairs cut in its near slope)
  const tw = (topX - a) / steps, rh = (GY - topY) / steps;
  for (let k = 0; k < steps; k++) {
    const x = a + tw * k, y = GY - rh * (k + 1);
    box(c, x, y, tw, rh + 1, S[2]); box(c, x, y, tw, 3, S[4]);
    box(c, x - 1, y - 1, tw + 2, 6, INK); box(c, x, y, tw, 4, T[3]); box(c, x, y, tw, 1, T[5]);
    lip(c, x, y, tw);
  }
  // (the flat top)
  box(c, topX, topY, b - topX, 4, S[4]); lip(c, topX, topY, b - topX);
  // (the chute: the icy groove, its rails, the lit lip down it)
  for (const [col, lw, dy] of [[INK, 10, -4], [T[2], 8, -4], [Ic[3], 5, -3], [Ic[5], 1, -5]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(b, topY + dy); c.lineTo(end, GY + dy); c.stroke(); }
  for (let k = 0; k <= 6; k++) { const t = k / 6, x = b + (end - b) * t, y = topY + (GY - topY) * t; box(c, x - 1, y - 12, 3, 10, INK); box(c, x, y - 12, 1, 9, T[4]); }
  c.strokeStyle = '#FFF6D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(b, topY); c.lineTo(end, GY); c.stroke();
};
/** The sugar shack (a box he stands on, on the hilltop): its logs and their chinking, the notched corners, the snow on
 *  its roof (the lit lip), the door, a window warm inside, the sap buckets on their taps; the stovepipe set back,
 *  steaming. */
export const drawShack = (c: Ctx, v: View, a: number, b: number, top: number, bottom: number, f: number) => {
  if (!onScreen(v, a - 30, b + 30)) return;
  const w = b - a, h = bottom - top;
  const [sx, sy] = at(v.eye, a + w * 0.7, top, 0.95);
  if (sy < top - 1) {
    const M = ramp6(dimmed('#3F3F46'));
    c.save(); c.beginPath(); c.rect(sx - 30, sy - 120, 60, top - (sy - 120)); c.clip();
    box(c, sx - 5, sy - 34, 10, 34, INK); box(c, sx - 4, sy - 34, 8, 34, M[3]); box(c, sx - 4, sy - 34, 2, 34, M[5]); box(c, sx - 7, sy - 38, 14, 5, M[2]);
    c.restore();
    c.globalAlpha = 0.5; for (let k = 0; k < 4; k++) { const t = ((f * 0.5 + k * 22) % 88) / 88; pixelBlob(c, sx + Math.sin(t * 6 + k) * 6 + t * 10, sy - 42 - t * 70, 5 + t * 10, 4 + t * 7, '#F1F5F9'); } c.globalAlpha = 1;
  }
  box3Back(c, v, { x: a, top, w, bottom, col: '#92400E' });
  still(c, `ca-shack-${w}x${h}`, a, top, -10, -6, w + 20, h + 8, g => {
    const L = ramp6(hour(LOGC)), Ch = ramp6(hour('#D8CCB0')), S = ramp6(hour(SNOW)), on = lampsOn(), G = glassOf(), Mt = ramp6(hour('#A8AEB8'));
    box(g, -1, 0, w + 2, h + 1, INK);
    for (let y = 0, k = 0; y < h; y += 13, k++) { box(g, 0, y, w, 11, L[3]); box(g, 0, y, w, 2, L[4]); box(g, 0, y + 8, w, 3, L[2]); box(g, 0, y + 11, w, 2, Ch[2]); }
    for (const cx of [-5, w + 5]) for (let y = 6; y < h; y += 13) logEnd(g, cx, y, 6, hour, cx + y);
    // (the snow on its roof edge, drifted, icicles)
    box(g, -8, -5, w + 16, 9, INK); box(g, -7, -4, w + 14, 7, S[3]); box(g, -7, -4, w + 14, 2, S[5]);
    for (let x = -4; x < w + 4; x += 7) { box(g, x, 3, 2, 3 + (x % 3) * 2, S[4]); box(g, x, 3, 1, 2 + (x % 3) * 2, '#FFFFFF'); }
    box(g, 40, h - 60, 36, 60, INK); planks(g, 41, h - 59, 34, 59, ramp6(hour('#5A3A1E')), true, 4, 9); box(g, 70, h - 32, 3, 3, hour('#CA8A04'));
    box(g, 8, 26, 24, 20, INK); box(g, 9, 27, 22, 18, on ? '#E8A646' : G[1]); box(g, 19, 27, 2, 18, L[1]); box(g, 9, 35, 22, 2, L[1]);
    if (!on) box(g, 10, 28, 1, 16, G[4]);
    for (const bx of [86, 102]) { box(g, bx + 3, 30, 2, 4, Mt[2]); box(g, bx - 1, 34, 10, 12, INK); box(g, bx, 35, 8, 10, Mt[3]); box(g, bx, 35, 2, 10, Mt[5]); box(g, bx, 37, 8, 1, Mt[1]); }
  });
  lip(c, a, top, w);
};

void stoneBlocks; void words; void plain; void post; void ball; void steppedGlow; void atDepth; void postBoard; void LOOKS;
