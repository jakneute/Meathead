// NORWAY's art (the SNES pass): the fishing village's fronts (board-and-batten in red, ochre and white, white corner
// boards and window frames, steep gables under sod roofs with their grass and flowers, carved bargeboards, painted
// boards; braced from behind), the troll statues (fiberglass rock in troll green: brows, noses, tusks, moss), the plank
// they hold up, the lutefisk booth, the wave machine's housing (corrugated steel, vents, hazard stripes), the LONGSHIP
// (clinker strakes, round shields with their bosses, the carved dragon prow and curled stern, the striped sail
// bellied and shaded, its rigging), THE STAVE CHURCH (tarred staves, carved portal, shingled roofs stepped down to their
// eaves, dragon heads off every gable), and the far end's TROLL TOLL BRIDGE (two giant trolls: mossy hair and beards,
// glowing eyes, arms up under the deck, fur loincloths, rock knees; the plank deck and its rope rails, the toll hut,
// the striped gate, the drying racks and their stockfish, the boathouse behind, the troll's hand out of the river).
// Still art painted once for the hour; only what moves live. No layout here: index.ts and toll.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, ball, timeOfDay, steppedGlow,
  planks, shingles, rockFace, hole, facade, still, board, LOOKS, onScreen, lip,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
const TROLL = '#6B7F5E';

// ---------------------------------------------------------------------------------------------------------------
// The fishing village's fronts (FACADE_D, braced)

export interface NoFront { rx: number; w: number; h: number; col: string; name: string }
/** A sod roof's turf along a slope (local): its green in steps, grass tufts up out of it, a flower here and there. */
const sod = (g: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const Gr = ramp6(dimmed('#4A7A34'));
  const n = Math.ceil(Math.abs(x1 - x0) / 3);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, hh = 2 + Math.floor(hash(seed + i) * 4);
    box(g, x, y - hh, 3, hh + 6, Gr[2]); box(g, x, y - hh, 3, 1, Gr[4]); box(g, x + 2, y - hh + 1, 1, hh + 4, Gr[1]);
    if (hash(seed + i * 3.3) > 0.88) box(g, x + 1, y - hh - 2, 2, 2, dimmed(hash(seed + i) > 0.5 ? '#FDE047' : '#F8FAFC'));
  }
};
const paintHouse = (g: Ctx, f: NoFront) => {
  const { w, h } = f, R = ramp6(dimmed(f.col)), Wt = ramp6(dimmed('#F5F5F4')), seed = f.rx;
  const gh = Math.round(w * 0.45);
  // (the gable: the boards going up into its point, the walls under it)
  poly(g, [[-2, -h + 1], [w / 2, -h - gh - 2], [w + 2, -h + 1], [w + 2, 0], [-2, 0]], INK);
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.lineTo(w / 2, -h - gh); g.lineTo(w, -h); g.lineTo(w, 0); g.closePath(); g.clip();
  planks(g, 0, -h - gh, w, h + gh, R, true, seed, 12);
  // (battens over the joints, lit down their left)
  for (let x = 12; x < w; x += 12) { box(g, x - 1, -h - gh, 3, h + gh, R[3]); box(g, x - 1, -h - gh, 1, h + gh, R[5]); box(g, x + 1, -h - gh, 1, h + gh, R[1]); }
  box(g, w - 14, -h - gh, 14, h + gh, 'rgba(28, 16, 20, 0.22)');
  g.restore();
  // (the corner boards, white)
  for (const cx of [0, w - 6]) { box(g, cx, -h, 6, h, Wt[3]); box(g, cx, -h, 2, h, Wt[5]); box(g, cx + 5, -h, 1, h, Wt[1]); }
  // (the roof: sod over birch bark, its eaves overhanging, carved bargeboards; a chimney)
  const B = ramp6(dimmed('#3F2A1E'));
  poly(g, [[-16, -h + 2], [w / 2, -h - gh - 10], [w + 16, -h + 2], [w + 16, -h + 10], [w / 2, -h - gh - 2], [-16, -h + 10]], INK);
  poly(g, [[-14, -h + 3], [w / 2, -h - gh - 8], [w / 2, -h - gh], [-14, -h + 9]], B[3]);
  poly(g, [[w / 2, -h - gh - 8], [w + 14, -h + 3], [w + 14, -h + 9], [w / 2, -h - gh]], B[2]);
  for (let k = 0; k < 6; k++) { const t = k / 6; box(g, -14 + t * (w / 2 + 14), -h + 7 - t * (gh + 8), 3, 2, Wt[2]); box(g, w + 12 - t * (w / 2 + 14), -h + 7 - t * (gh + 8), 3, 2, Wt[2]); }
  sod(g, -14, -h + 2, w / 2, -h - gh - 9, seed);
  sod(g, w / 2, -h - gh - 9, w + 14, -h + 2, seed + 50);
  // (crossed bargeboard ends at the peak: little carved dragon heads)
  for (const s of [-1, 1]) poly(g, [[w / 2, -h - gh - 8], [w / 2 + s * 10, -h - gh - 20], [w / 2 + s * 16, -h - gh - 18], [w / 2 + s * 8, -h - gh - 12]], B[4]);
  const cx = w * 0.72, cy = -h - gh * 0.42;
  box(g, cx - 1, cy - 26, 18, 28, INK); slab(g, cx, cy - 25, 16, 26, ramp6(dimmed('#8A8A8A')), false); box(g, cx - 2, cy - 28, 20, 4, INK); box(g, cx - 1, cy - 27, 18, 2, dimmed('#A8A8A8'));
  // (the door: planked, a white frame and a carved lintel; the windows: white frames, mullions, lace)
  const dx = w / 2 - 18;
  box(g, dx - 5, -78, 46, 78, INK); box(g, dx - 4, -77, 44, 77, Wt[3]); box(g, dx - 4, -77, 44, 2, Wt[5]);
  hole(g, dx, -72, 36, 72, true);
  if (!lampsOn()) planks(g, dx, -70, 36, 68, ramp6(dimmed('#5C3A1A')), true, seed + 7, 9);
  box(g, dx - 8, -84, 52, 8, INK); box(g, dx - 7, -83, 50, 6, Wt[3]); for (let x = dx - 4; x < dx + 42; x += 6) box(g, x, -81, 3, 2, Wt[1]);
  for (const wx of [18, w - 46]) {
    box(g, wx - 5, -h + 31, 38, 42, INK); box(g, wx - 4, -h + 32, 36, 40, Wt[3]); box(g, wx - 4, -h + 32, 36, 2, Wt[5]);
    hole(g, wx, -h + 36, 28, 32, true);
    for (let x = wx; x < wx + 28; x += 2) box(g, x, -h + 36, 1, 3 + ((x / 2) & 1), dimmed('#F8FAFC'));
    box(g, wx - 6, -h + 70, 40, 4, INK); box(g, wx - 5, -h + 70, 38, 3, Wt[2]);
  }
  board(g, w / 2, -h + 20, [f.name], LOOKS.norway(1), dimmed('#3F2A14'), ramp6(dimmed('#B45309')), 4);
  // (the stone foundation along the foot)
  box(g, 0, -10, w, 10, INK); for (let x = 1; x < w; x += 14) { box(g, x, -9, 13, 9, dimmed('#6B6B6B')); box(g, x, -9, 13, 1, dimmed('#9A9A9A')); }
};
export const drawHouse = (c: Ctx, v: View, x: number, f: NoFront) => facade(c, v, `no-house-${f.rx}`, x, f.w, f.h, g => paintHouse(g, f), undefined, Math.round(f.w * 0.45) + 40, 24);

// ---------------------------------------------------------------------------------------------------------------
// The troll statues and their plank; the booth; the wave machine

/** A troll statue's features over its box (local: its top-left at 0, 0; `w` x `h`): the mossy hair over the top (not
 *  on the standable lip), the brow, the eyes, the nose, the tusks, the arm up to the plank (`armUp` px over its top),
 *  its belly. */
export const trollFace = (c: Ctx, x: number, top: number, w: number, h: number, armX: number, armUp: number) => {
  still(c, `fl-no-troll-${w}x${h}-${armX}-${armUp}`, x, top, -20, -armUp - 6, w + 40, h + armUp + 8, g => {
    const R = ramp6(hour(TROLL)), M = ramp6(hour('#3F6212'));
    // (the arm up to the plank: thick, lumpy, its hand flat under it)
    box(g, armX - 1, -armUp + 8, 16, armUp - 4, INK); box(g, armX, -armUp + 8, 14, armUp - 4, R[2]); box(g, armX, -armUp + 8, 4, armUp - 4, R[3]); box(g, armX + 11, -armUp + 8, 3, armUp - 4, R[1]);
    for (let y = -armUp + 14; y < 0; y += 12) box(g, armX + 2, y, 10, 2, R[1]);
    box(g, armX - 5, -armUp, 24, 10, INK); box(g, armX - 4, -armUp + 1, 22, 8, R[3]); box(g, armX - 4, -armUp + 1, 22, 2, R[4]);
    for (let k = 0; k < 4; k++) box(g, armX - 3 + k * 6, -armUp + 7, 4, 3, R[1]);
    // (the brow, the eyes under it, the big nose, the mouth and tusks)
    const cx = w / 2;
    box(g, cx - 34, 16, 68, 8, R[1]); box(g, cx - 34, 16, 68, 2, R[4]);
    for (const ex of [cx - 22, cx + 14]) { box(g, ex - 1, 24, 10, 7, INK); box(g, ex, 25, 8, 5, hour('#F5F0D8')); box(g, ex + 3, 26, 3, 3, INK); box(g, ex + 3, 26, 1, 1, '#FFFFFF'); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, 44, 15, 19, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.ellipse(cx, 44, 14, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[4]; g.beginPath(); g.ellipse(cx - 4, 38, 7, 10, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - 6, 34, 3, 3, R[5]);
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(cx + 6, 54, 5, 5, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - 26, 68, 52, 6, INK); box(g, cx - 25, 69, 50, 4, hour('#3A1A1A'));
    for (const tx of [cx - 20, cx + 14]) { poly(g, [[tx - 1, 74], [tx + 7, 74], [tx + 3, 60]], INK); poly(g, [[tx, 73], [tx + 6, 73], [tx + 3, 62]], hour('#F5F0D8')); box(g, tx + 1, 66, 1, 6, '#FFFFFF'); }
    // (moss for hair, hanging down its sides; a moss beard)
    for (let k = 0; k < 8; k++) { const mx = k < 4 ? 2 + k * 3 : w - 14 + (k - 4) * 3, len = 20 + hash(k * 2.1 + w) * 26; box(g, mx, 4, 3, len, M[2 + (k % 2)]); box(g, mx, 4 + len, 3, 2, M[1]); }
    for (let k = 0; k < 10; k++) { const bx = cx - 22 + k * 5, len = 14 + hash(k * 1.7) * 18; box(g, bx, 76, 4, len, M[2 + (k % 2)]); box(g, bx, 76, 1, len, M[4]); }
    // (the belly's lumps further down)
    if (h > 110) { g.fillStyle = R[1]; g.beginPath(); g.ellipse(cx, h - 26, 24, 12, 0, Math.PI, 0); g.fill(); box(g, cx - 2, h - 26, 4, 3, R[0]); }
  });
};
/** The lutefisk booth's bits over its box: the awning (scalloped stripes, blue and white) on its poles, a rack of fish
 *  hung off the back pole, the price chalked on its front. */
export const drawBooth = (c: Ctx, a: number, b: number, top: number) => {
  const w = b - a;
  still(c, `fl-no-booth-${w}`, a, top, -14, -88, w + 28, 150, g => {
    const P = ramp6(dimmed('#78716C')), Bl = ramp6(dimmed('#1D4ED8')), Wt = ramp6(dimmed('#F8FAFC'));
    for (const px0 of [6, w - 10]) { box(g, px0 - 1, -70, 6, 70, INK); box(g, px0, -70, 4, 70, P[3]); box(g, px0, -70, 1, 70, P[5]); }
    box(g, -9, -83, w + 18, 16, INK);
    for (let k = 0; k < Math.ceil((w + 16) / 22); k++) { const R = k % 2 ? Wt : Bl; box(g, -8 + k * 22, -82, 22, 14, R[3]); box(g, -8 + k * 22, -82, 22, 2, R[4]); box(g, -8 + k * 22 + 19, -82, 3, 14, R[2]); g.fillStyle = INK; g.beginPath(); g.arc(-8 + k * 22 + 11, -68, 11, 0, Math.PI); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(-8 + k * 22 + 11, -68, 10, 0, Math.PI); g.fill(); }
    // (the chalkboard on its front: the price, the smiley that isn't fooling anybody)
    box(g, 30, 16, w - 60, 40, INK); box(g, 31, 17, w - 62, 38, hour('#1F2A24')); box(g, 31, 17, w - 62, 1, hour('#3A4A40'));
    for (let r = 0; r < 2; r++) box(g, 38, 24 + r * 10, (w - 76) * (0.6 + r * 0.2), 2, hour('#E5E7EB'));
    g.strokeStyle = hour('#E5E7EB'); g.lineWidth = 1; g.beginPath(); g.arc(w - 46, 44, 5, 0.3, Math.PI - 0.3); g.stroke(); box(g, w - 49, 39, 1, 2, hour('#E5E7EB')); box(g, w - 44, 39, 1, 2, hour('#E5E7EB'));
  });
};
/** The wave machine's housing at the pool's far end (set back, stamped): corrugated steel, louvered vents, the pipe into
 *  the pool, hazard stripes, a red light that comes on before a wave (live, by `warn`). */
const paintHousing = (g: Ctx) => {
  const S = ramp6(dimmed('#475569'));
  box(g, -1, -91, 122, 91, INK); slab(g, 0, -90, 120, 90, S, false);
  for (let x = 3; x < 120; x += 4) { box(g, x, -88, 1, 86, S[2]); box(g, x + 1, -88, 1, 86, S[4]); }
  box(g, -4, -96, 128, 7, INK); box(g, -3, -95, 126, 5, S[3]); box(g, -3, -95, 126, 1, S[5]);
  for (let k = 0; k < 3; k++) { const vx = 14 + k * 34; box(g, vx - 1, -71, 22, 32, INK); box(g, vx, -70, 20, 30, dimmed('#1E293B')); for (let y = -68; y < -40; y += 4) { box(g, vx, y, 20, 2, S[2]); box(g, vx, y, 20, 1, S[4]); } }
  for (let x = 0; x < 120; x += 12) { poly(g, [[x, -14], [x + 6, -14], [x + 12, -8], [x + 12, -2], [x, -14 + 12]], dimmed('#FACC15')); }
  box(g, 0, -14, 120, 1, INK); box(g, 0, -2, 120, 2, INK);
  box(g, 96, -110, 10, 14, INK); box(g, 97, -109, 8, 12, S[2]);
};
export const drawHousing = (c: Ctx, v: View, x: number, warn: boolean) => {
  facade(c, v, 'no-housing', x, 120, 96, paintHousing, 0.9, 30, 10, false);
  if (onScreen(v, x, x + 120, 0.9)) {
    const [lx, ly] = at(v.eye, x + 101, GY - 106, 0.9);
    if (warn) steppedGlow(c, lx, ly, 18, '#FF4A4A', 0, 0.35, 3);
    box(c, lx - 3, ly - 3, 6, 6, INK); box(c, lx - 2, ly - 2, 4, 4, warn ? '#FF6A6A' : dimmed('#7F1D1D'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The longship (live: it rides the swell)

/** The longship: the hull's clinker strakes (each lit along its top), a row of round shields along the gunwale (painted
 *  quarters, iron bosses), the dragon at the prow (scales, its eye, its teeth, a curl of mane), the curled stern, the
 *  mast and its yard, the striped sail bellied (shaded down its sides), the stays, the oars out; the deck's lit lip. */
export const drawShip = (c: Ctx, v: View, sx: number, dy: number, w: number, f: number) => {
  if (!onScreen(v, sx - 80, sx + w + 80)) return;
  const R = ramp6(hour('#7C4A1E')), tilt = Math.sin(f * 0.05) * 3, eye = v.eye;
  // (the deck going back)
  poly(c, [at(eye, sx, dy, 1), at(eye, sx + w, dy, 1), at(eye, sx + w, dy, 0.94), at(eye, sx, dy, 0.94)], R[4]);
  c.strokeStyle = R[2]; c.lineWidth = 1; c.beginPath(); for (const d of [0.98, 0.96]) { const [p0, q0] = at(eye, sx, dy, d), [p1, q1] = at(eye, sx + w, dy, d); c.moveTo(p0, q0); c.lineTo(p1, q1); } c.stroke();
  // (the stays down from the masthead to either end)
  const mx = sx + w / 2, mt = dy - 172;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(mx, mt); c.lineTo(sx - 30, dy - 30 + tilt); c.moveTo(mx, mt); c.lineTo(sx + w + 40, dy - 50 - tilt); c.stroke();
  // (the mast, its yard)
  box(c, mx - 4, mt, 8, 172, INK); box(c, mx - 3, mt, 6, 172, R[3]); box(c, mx - 3, mt, 2, 172, R[4]); box(c, mx + 2, mt, 1, 172, R[1]);
  box(c, mx - 74, dy - 168, 148, 6, INK); box(c, mx - 73, dy - 167, 146, 4, R[3]); box(c, mx - 73, dy - 167, 146, 1, R[5]);
  // (the sail: red and white stripes, bellied, shaded toward its edges, a dither down each seam)
  for (let k = 0; k < 7; k++) {
    const x = mx - 66 + k * 19, bel = Math.sin((k / 6) * Math.PI) * 10, edge = Math.abs(k - 3) / 3;
    const S = ramp6(hour(k % 2 ? '#F8FAFC' : '#B91C1C')), col = edge > 0.9 ? S[2] : edge > 0.5 ? S[3] : S[4];
    box(c, x - (k === 0 ? 1 : 0), dy - 163 + bel * 0.2, 19, 100 + bel, k === 0 || k === 6 ? INK : col);
    box(c, x + (k === 0 ? 1 : 0), dy - 162 + bel * 0.2, 19 - (k === 0 || k === 6 ? 2 : 0), 98 + bel, col);
    box(c, x, dy - 162 + bel * 0.2 + 98 + bel - 4, 19, 4, S[2]);
    checker(c, x + 17, dy - 160 + bel * 0.2, 2, 96 + bel, S[2], 0, 1);
  }
  box(c, mx - 67, dy - 64, 134, 1, INK);
  // (the oars out of their ports, down into the water)
  for (let k = 0; k < 6; k++) { const ox = sx + 30 + k * 40, a = Math.sin(f * 0.05 + k * 0.4) * 0.15; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(ox, dy + 22); c.lineTo(ox - 26 + a * 20, dy + 60); c.stroke(); c.strokeStyle = R[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(ox, dy + 22); c.lineTo(ox - 26 + a * 20, dy + 60); c.stroke(); }
  // (the hull: curving up at both ends, its strakes overlapping, each lit along its top)
  const hull: [number, number][] = [[sx - 30, dy - 30 + tilt], [sx, dy], [sx + w, dy], [sx + w + 30, dy - 30 - tilt], [sx + w - 20, dy + 44], [sx + 20, dy + 44]];
  poly(c, hull.map(([x, y]) => [x + (x < sx + w / 2 ? -1 : 1), y + (y > dy + 20 ? 1 : -1)] as [number, number]), INK);
  poly(c, hull, R[2]);
  for (let k = 0; k < 5; k++) {
    const y = dy + 4 + k * 8, inset = k * 4;
    box(c, sx + 2 + inset, y, w - 4 - inset * 2, 1, R[4]); box(c, sx + 2 + inset, y + 6, w - 4 - inset * 2, 2, R[1]);
    for (let x = sx + 20 + k * 13; x < sx + w - 20; x += 46) box(c, x, y + 2, 1, 1, R[0]);
  }
  box(c, sx, dy, w, 4, R[3]); box(c, sx, dy, w, 1, R[5]);
  // (the shields along the gunwale: painted quarters, an iron boss with a glint)
  const QC = [['#DC2626', '#FCD34D'], ['#1D4ED8', '#F8FAFC'], ['#FCD34D', '#15803D'], ['#F8FAFC', '#DC2626']];
  for (let k = 0; k < 7; k++) {
    const cx = sx + 26 + k * 35, cy = dy + 12, [q0, q1] = QC[k % QC.length];
    c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour(q0); c.beginPath(); c.arc(cx, cy, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour(q1); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 11, 0, Math.PI / 2); c.lineTo(cx, cy); c.fill(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 11, Math.PI, Math.PI * 1.5); c.fill();
    c.strokeStyle = hour('#57534E'); c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, 10.5, 0, Math.PI * 2); c.stroke();
    ball(c, cx, cy, 3.5, hour('#9CA3AF'));
  }
  // (the dragon's head at the prow (right): its neck in scales, the snout, an eye, teeth, its mane)
  const D = ramp6(hour('#8A5A2A')), t2 = -tilt;
  const neck: [number, number][] = [[sx + w + 24, dy - 24 + t2], [sx + w + 36, dy - 66 + t2], [sx + w + 50, dy - 80 + t2], [sx + w + 70, dy - 78 + t2], [sx + w + 72, dy - 68 + t2], [sx + w + 58, dy - 62 + t2], [sx + w + 48, dy - 58 + t2], [sx + w + 40, dy - 22 + t2]];
  poly(c, neck.map(([x, y]) => [x + 1, y + 1] as [number, number]), INK); poly(c, neck, D[3]);
  poly(c, [[sx + w + 24, dy - 24 + t2], [sx + w + 36, dy - 66 + t2], [sx + w + 42, dy - 64 + t2], [sx + w + 30, dy - 24 + t2]], D[4]);
  for (let k = 0; k < 5; k++) box(c, sx + w + 34 + k * 1.5, dy - 30 - k * 8 + t2, 6, 2, D[1]);
  box(c, sx + w + 56, dy - 76 + t2, 4, 4, INK); box(c, sx + w + 57, dy - 75 + t2, 2, 2, '#FDE047');
  for (let k = 0; k < 3; k++) box(c, sx + w + 62 + k * 3, dy - 66 + t2, 2, 3, '#F5F5F4');
  for (let k = 0; k < 4; k++) poly(c, [[sx + w + 40 - k * 2, dy - 60 - k * 6 + t2], [sx + w + 28 - k * 2, dy - 66 - k * 6 + t2], [sx + w + 38 - k * 2, dy - 54 - k * 6 + t2]], D[2]);
  // (the tail curled at the stern)
  const tail: [number, number][] = [[sx - 26, dy - 26 + tilt], [sx - 40, dy - 60 + tilt], [sx - 30, dy - 78 + tilt], [sx - 16, dy - 76 + tilt], [sx - 22, dy - 66 + tilt], [sx - 30, dy - 64 + tilt], [sx - 28, dy - 54 + tilt], [sx - 18, dy - 24 + tilt]];
  poly(c, tail.map(([x, y]) => [x - 1, y + 1] as [number, number]), INK); poly(c, tail, D[3]);
  poly(c, [[sx - 26, dy - 26 + tilt], [sx - 40, dy - 60 + tilt], [sx - 34, dy - 62 + tilt], [sx - 22, dy - 26 + tilt]], D[4]);
  // (the deck's edge: somewhere to stand)
  lip(c, sx, dy, w);
};

// ---------------------------------------------------------------------------------------------------------------
// THE STAVE CHURCH

const TAR = '#3F2A14';
/** Its walls (set back at 0.96, stamped): tarred staves, the carved portal (vines and beasts round the door), small
 *  round windows high up, each storey stepped in. */
const paintChurchWalls = (g: Ctx) => {
  const W = ramp6(dimmed(TAR));
  for (const [x, w, h] of [[0, 500, 140], [70, 360, 270], [150, 200, 400], [220, 60, 520]] as const) {
    box(g, x - 1, -h - 1, w + 2, h + 1, INK);
    planks(g, x, -h, w, h, W, true, x, 10);
    box(g, x, -h, 3, h, W[4]); box(g, x + w - 5, -h, 5, h, W[1]);
    if (h > 140) for (let k = 0; k < Math.floor(w / 60); k++) { const cx = x + 30 + k * 60, cy = -h + 40; g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = lampsOn() ? '#E8A646' : dimmed('#2A1E14'); g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill(); }
  }
  // (the portal: the door deep in a carved surround of vines and beasts)
  const G = ramp6(dimmed('#8A6A3A'));
  box(g, 200, -124, 100, 124, INK); box(g, 202, -122, 96, 122, G[2]);
  for (let y = -118; y < 0; y += 8) { box(g, 204 + ((y / 8) & 1) * 3, y, 6, 4, G[4]); box(g, 290 - ((y / 8) & 1) * 3, y, 6, 4, G[4]); }
  g.fillStyle = INK; g.beginPath(); g.arc(250, -100, 38, Math.PI, 0); g.fill();
  g.fillStyle = G[3]; g.beginPath(); g.arc(250, -100, 36, Math.PI, 0); g.fill();
  for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI; box(g, 250 + Math.cos(a) * 30 - 2, -100 + Math.sin(a) * 30 - 2, 4, 4, G[k % 2 ? 1 : 5]); }
  hole(g, 220, -100, 60, 100, true);
  if (!lampsOn()) { planks(g, 220, -98, 60, 98, ramp6(dimmed('#5C3A1A')), true, 3, 10); for (const y of [-80, -30]) { box(g, 222, y, 56, 3, dimmed('#2A2A2A')); box(g, 222, y, 56, 1, dimmed('#5A5A5A')); } }
};
/** Its roofs (in the play plane, stamped): shingles sloping from each ridge (the bit he stands on) down to the eaves,
 *  the ridge board, a dragon head off each gable end. */
const paintChurchRoof = (g: Ctx, A: number, B: number, x0: number, y0: number) => {
  const W = ramp6(hour(TAR)), D = ramp6(hour('#6B4A2A'));
  const a = A - x0, b = B - x0;
  const shape: [number, number][] = [[a, y0], [b, y0], [b + 24, y0 + 46], [a - 24, y0 + 46]];
  poly(g, [[a - 1, y0], [b + 1, y0], [b + 26, y0 + 47], [a - 26, y0 + 47]], INK);
  g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  shingles(g, a - 24, y0, b - a + 48, 46, W, 8, 7, A);
  box(g, a - 24, y0 + 40, b - a + 48, 6, W[0]);
  g.restore();
  box(g, a - 26, y0 + 46, b - a + 52, 2, INK);
  for (const s of [-1, 1]) {
    // (a dragon head curling off the gable end, its tongue, its eye)
    const ex = s < 0 ? a - 24 : b + 24, y = y0;
    const head: [number, number][] = [[ex, y + 46], [ex + s * 10, y + 26], [ex + s * 22, y + 12], [ex + s * 36, y + 10], [ex + s * 34, y + 18], [ex + s * 22, y + 22], [ex + s * 26, y + 28], [ex + s * 14, y + 32]];
    poly(g, head.map(([px, py]) => [px + s, py + 1] as [number, number]), INK); poly(g, head, D[3]);
    poly(g, [[ex, y + 46], [ex + s * 10, y + 26], [ex + s * 22, y + 12], [ex + s * 18, y + 20], [ex + s * 6, y + 40]], D[4]);
    box(g, ex + s * 24 - 2, y + 14, 3, 3, INK); box(g, ex + s * 24 - 1, y + 15, 1, 1, '#FDE047');
    poly(g, [[ex + s * 34, y + 18], [ex + s * 42, y + 20], [ex + s * 38, y + 22]], hour('#B91C1C'));
  }
};
export const drawChurch = (c: Ctx, v: View, X: (rx: number) => number, Y: (h: number) => number, roofs: [number, number, number][]) => {
  if (!onScreen(v, X(2880), X(3520))) return;
  facade(c, v, 'no-church', X(2950), 500, 520, paintChurchWalls, 0.96, 20, 10, false);
  for (const [ra, rb, h] of roofs) {
    const A = X(ra), B = X(rb), y = Y(h);
    still(c, `fl-no-roof-${ra}`, A - 40, y, -30, -4, rb - ra + 150, 56, g => paintChurchRoof(g, A, B, A - 40, 0));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE TROLL TOLL BRIDGE's giants (in the play plane; their bodies and heads are the boxes he climbs)

/** A giant troll's features over its body and head boxes (world): moss hair down past the head, a beard of moss, the
 *  brow, glowing eyes, the nose, tusks; its arms up under the deck, the hands gripping the planks' edge; the fur
 *  loincloth, the belly, the legs down to its feet. `flip`: facing left. */
export const drawGiant = (c: Ctx, body: readonly number[], head: readonly number[], X: (rx: number) => number, Y: (h: number) => number, flip: boolean, deckH: number) => {
  const [ba, bb, bh] = body, [ha, hb, hh] = head;
  const bx = X(ba), bw = bb - ba, top = Y(hh), hx = X(ha), hw = hb - ha;
  still(c, `fl-no-giant-${ba}`, bx, top, -40, -20, bw + 80, Y(0) - top + 2, g => {
    const R = ramp6(hour(TROLL)), M = ramp6(hour('#3F6212')), F = ramp6(hour('#7A5A3A'));
    const lx = hx - bx, s = flip ? -1 : 1, ht = 0, hb2 = Y(bh) - top;
    // (the face on the head: the brow, the eyes, the nose, the mouth and its tusks)
    const fx = lx + hw / 2 + s * 8;
    box(g, fx - 36, ht + 22, 72, 10, R[1]); box(g, fx - 36, ht + 22, 72, 3, R[4]); box(g, fx - 36, ht + 31, 72, 1, R[0]);
    for (const ex of [fx - 26, fx + 16]) { box(g, ex - 1, ht + 31, 12, 9, INK); box(g, ex, ht + 32, 10, 7, hour('#2A1A0A')); box(g, ex + 3, ht + 33, 4, 4, '#FDE047'); box(g, ex + 4, ht + 33, 1, 1, '#FFFFFF'); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(fx + s * 4, ht + 64, 18, 26, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.ellipse(fx + s * 4, ht + 64, 17, 25, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[4]; g.beginPath(); g.ellipse(fx + s * 4 - 5, ht + 56, 8, 13, 0, 0, Math.PI * 2); g.fill();
    box(g, fx + s * 4 - 8, ht + 48, 3, 4, R[5]);
    g.fillStyle = R[1]; g.beginPath(); g.ellipse(fx + s * 4 + 7, ht + 80, 6, 6, 0, 0, Math.PI * 2); g.fill();
    box(g, fx - 30, ht + 96, 60, 8, INK); box(g, fx - 29, ht + 97, 58, 6, hour('#2A0E0E')); box(g, fx - 29, ht + 97, 58, 1, hour('#5A1E1E'));
    for (const tx of [fx - 24, fx + 16]) { poly(g, [[tx - 1, ht + 104], [tx + 9, ht + 104], [tx + 4, ht + 84]], INK); poly(g, [[tx, ht + 103], [tx + 8, ht + 103], [tx + 4, ht + 86]], hour('#F5F0D8')); box(g, tx + 2, ht + 92, 1, 9, '#FFFFFF'); }
    // (moss hair down both sides of the head, a moss beard down onto the body)
    for (let k = 0; k < 10; k++) { const mx = k < 5 ? lx + 2 + k * 3 : lx + hw - 17 + (k - 5) * 3, len = 30 + hash(k * 2.1 + ba) * 40; box(g, mx, ht + 2, 3, len, M[2 + (k % 2)]); box(g, mx, ht + 2 + len, 3, 2, M[1]); box(g, mx, ht + 2, 1, len, M[4]); }
    for (let k = 0; k < 12; k++) { const mx = fx - 28 + k * 5, len = 18 + hash(k * 1.7 + ba) * 30; box(g, mx, ht + 106, 4, len, M[2 + (k % 2)]); box(g, mx, ht + 106, 1, len, M[4]); box(g, mx, ht + 106 + len, 4, 2, M[1]); }
    // (the shoulders' bulk down the body's top corners, each a lumpy step; the knuckles of its hands showing under the
    // deck's edge either side of its head, gripping)
    for (const [sx0, sw] of [[0, 40], [bw - 40, 40]] as const) { box(g, sx0, hb2 + 4, sw, 30, R[3]); box(g, sx0, hb2 + 4, sw, 3, R[4]); box(g, sx0, hb2 + 30, sw, 4, R[1]); }
    for (const kx of flip ? [lx + 2] : [lx + hw - 30]) for (let k = 0; k < 4; k++) { box(g, kx + k * 7 - 1, ht + 16, 8, 9, INK); box(g, kx + k * 7, ht + 17, 6, 7, R[3]); box(g, kx + k * 7, ht + 17, 6, 2, R[4]); box(g, kx + k * 7 + 1, ht + 21, 4, 2, hour('#F5F0D8')); }
    void deckH;
    // (the body: the belly's swell, the navel, the fur loincloth with its stepped tufts, the legs down to the feet)
    const by0 = hb2;
    g.fillStyle = R[4]; g.beginPath(); g.ellipse(bw / 2 + s * 10, by0 + 70, bw * 0.34, 46, 0, Math.PI * 1.1, Math.PI * 1.9); g.fill();
    box(g, bw / 2 + s * 10 - 3, by0 + 84, 6, 4, R[0]);
    const ly0 = Y(150) - top, ly1 = Y(110) - top;
    box(g, -2, ly0 - 1, bw + 4, ly1 - ly0 + 2, INK);
    for (let x = 0; x < bw; x += 6) { const t = hash(x + ba); box(g, x, ly0, 6, ly1 - ly0, F[t > 0.6 ? 3 : 2]); box(g, x, ly0, 6, 2, F[4]); box(g, x + 1, ly1 - 2, 4, 4 + Math.round(t * 6), F[t > 0.5 ? 2 : 1]); }
    box(g, 0, ly0 + 4, bw, 3, hour('#3F2A14')); ball(g, bw / 2, ly0 + 5, 4, hour('#9CA3AF'));
    const foot = Y(0) - top;
    for (const lxx of [20, bw - 70]) {
      box(g, lxx - 1, ly1 + 4, 52, foot - ly1 - 4, INK); box(g, lxx, ly1 + 4, 50, foot - ly1 - 4, R[1]); box(g, lxx, ly1 + 4, 10, foot - ly1 - 4, R[2]);
      for (let y = ly1 + 14; y < foot - 10; y += 14) box(g, lxx + 6, y, 38, 2, R[0]);
      box(g, lxx - 8, foot - 16, 66, 16, INK); box(g, lxx - 7, foot - 15, 64, 15, R[2]); box(g, lxx - 7, foot - 15, 64, 3, R[4]);
      for (let k = 0; k < 4; k++) { box(g, lxx - 5 + k * 15, foot - 8, 12, 6, R[3]); box(g, lxx - 4 + k * 15, foot - 8, 8, 2, hour('#F5F0D8')); }
    }
  });
};
/** The bridge's deck furniture: the posts along it and the rope rails swagged between them, the planks' ends. */
export const drawDeck = (c: Ctx, a: number, b: number, y: number) => {
  const R = ramp6(hour('#5C3A1A'));
  for (let x = a; x < b; x += 26) { box(c, x, y + 2, 1, 14, R[1]); box(c, x + 1, y + 2, 1, 14, R[4]); }
  for (let x = a + 10; x <= b - 4; x += 70) { box(c, x - 1, y - 42, 7, 42, INK); box(c, x, y - 41, 5, 41, R[3]); box(c, x, y - 41, 2, 41, R[5]); box(c, x - 2, y - 44, 9, 3, INK); }
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(a + 12, y - 38);
  for (let x = a + 10; x + 70 <= b; x += 70) c.quadraticCurveTo(x + 37, y - 24, x + 72, y - 38);
  c.stroke();
  c.strokeStyle = hour('#C8A060'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(a + 12, y - 38);
  for (let x = a + 10; x + 70 <= b; x += 70) c.quadraticCurveTo(x + 37, y - 24, x + 72, y - 38);
  c.stroke();
};
/** The toll hut on the deck (set back a touch, stamped): planked, its window, a sod roof, the cash box. */
export const drawHut = (c: Ctx, v: View, x: number, w: number, deckY: number) => {
  if (!onScreen(v, x - 20, x + w + 20, 0.96)) return;
  atDepth(c, v.eye, 0.96, () => still(c, `fl-no-hut-${w}`, x, deckY, -24, -170, w + 48, 172, g => {
    const R = ramp6(dimmed('#9F1239')), Wt = ramp6(dimmed('#F5F5F4'));
    box(g, -1, -111, w + 2, 111, INK); planks(g, 0, -110, w, 110, R, true, 31, 10);
    for (const cx of [0, w - 5]) { box(g, cx, -110, 5, 110, Wt[3]); box(g, cx, -110, 1, 110, Wt[5]); }
    hole(g, 20, -84, 60, 34, true);
    box(g, 18, -50, 64, 4, INK); box(g, 19, -50, 62, 3, Wt[2]);
    box(g, 40, -46, 20, 12, INK); box(g, 41, -45, 18, 10, dimmed('#71717A')); box(g, 47, -42, 6, 2, INK);
    const B = ramp6(dimmed('#3F2A1E'));
    poly(g, [[-14, -108], [w / 2, -150], [w + 14, -108], [w + 14, -100], [w / 2, -142], [-14, -100]], INK);
    poly(g, [[-12, -107], [w / 2, -148], [w / 2, -142], [-12, -101]], B[3]); poly(g, [[w / 2, -148], [w + 12, -107], [w + 12, -101], [w / 2, -142]], B[2]);
    sod(g, -12, -108, w / 2, -149, 77); sod(g, w / 2, -149, w + 12, -108, 91);
  }));
};
/** The toll gate: its posts and crossbeam (stepped timber, iron straps), the gate itself (planks painted red and white,
 *  braced), lifted by `lift` px. */
export const drawTollGate = (c: Ctx, a: number, b: number, top: number, deck: number, lift: number) => {
  const P = ramp6(hour('#78350F')), I = ramp6(hour('#3F3F46'));
  const post = (x: number, w: number) => { box(c, x - 1, top - 17, w + 2, deck - top + 17, INK); box(c, x, top - 16, w, deck - top + 16, P[2]); box(c, x, top - 16, 3, deck - top + 16, P[4]); box(c, x + w - 3, top - 16, 3, deck - top + 16, P[1]); for (let y = top + 10; y < deck; y += 60) { box(c, x - 1, y, w + 2, 4, I[2]); box(c, x - 1, y, w + 2, 1, I[4]); } };
  post(a - 14, 12); post(b + 2, 12);
  box(c, a - 21, top - 23, b - a + 42, 14, INK); box(c, a - 20, top - 22, b - a + 40, 12, P[3]); box(c, a - 20, top - 22, b - a + 40, 2, P[5]); box(c, a - 20, top - 13, b - a + 40, 3, P[1]);
  const gTop = top - lift, gH = deck - top;
  box(c, a - 1, gTop - 1, b - a + 2, gH + 2, INK);
  for (let k = 0; k < gH; k += 30) {
    const R = ramp6(hour(k % 60 ? '#F5F5F4' : '#DC2626')), hh = Math.min(30, gH - k);
    box(c, a, gTop + k, b - a, hh, R[3]); box(c, a, gTop + k, b - a, 2, R[4]); box(c, a, gTop + k, 3, hh, R[4]); box(c, b - 3, gTop + k, 3, hh, R[1]); box(c, a, gTop + k + hh - 1, b - a, 1, INK);
  }
  for (let y = gTop + 20; y < gTop + gH - 10; y += 80) { box(c, a, y, b - a, 3, I[2]); ball(c, (a + b) / 2, y + 1, 2, I[4]); }
};
/** A drying rack: its two poles, the crossbar he stands on (its lit lip drawn by the caller), the stockfish hung under
 *  it in pairs (dried gray-gold, tails up, stepped), a gull's droppings on it. */
export const drawRack = (c: Ctx, a: number, b: number, y: number, foot: number) => {
  still(c, `fl-no-rack-${b - a}-${foot - y}`, a, y, -4, -2, b - a + 8, foot - y + 4, g => {
    const P = ramp6(hour('#57534E')), Fi = ramp6(hour('#C8B48A'));
    for (const px0 of [4, b - a - 8]) { box(g, px0 - 1, 0, 6, foot - y, INK); box(g, px0, 0, 4, foot - y, P[3]); box(g, px0, 0, 1, foot - y, P[5]); }
    for (let x = 12; x < b - a - 10; x += 14) {
      box(g, x + 2, 8, 1, 6, INK);
      const fish: [number, number][] = [[x, 14], [x + 6, 14], [x + 7, 26], [x + 5, 40], [x + 3, 44], [x + 1, 40], [x - 1, 26]];
      poly(g, fish.map(([px, py]) => [px + (px < x + 3 ? -1 : 1), py] as [number, number]), INK); poly(g, fish, Fi[3]);
      box(g, x, 16, 2, 22, Fi[4]); box(g, x + 4, 18, 2, 20, Fi[1]);
      poly(g, [[x - 2, 14], [x + 3, 9], [x + 8, 14]], Fi[2]);
      box(g, x + 2, 36, 2, 2, INK);
    }
  });
};
/** The boathouse behind the racks (set back at 0.9, stamped): red planks under a sod roof, its big doors. */
const paintBoathouse = (g: Ctx) => {
  const R = ramp6(dimmed('#9F1239')), Wt = ramp6(dimmed('#F5F5F4')), B = ramp6(dimmed('#3F2A1E'));
  box(g, -1, -161, 302, 161, INK); planks(g, 0, -160, 300, 160, R, true, 52, 12);
  for (const cx of [0, 295]) { box(g, cx, -160, 5, 160, Wt[3]); box(g, cx, -160, 1, 160, Wt[5]); }
  poly(g, [[-12, -158], [150, -262], [312, -158], [312, -150], [150, -254], [-12, -150]], INK);
  poly(g, [[-10, -157], [150, -260], [150, -254], [-10, -151]], B[3]); poly(g, [[150, -260], [310, -157], [310, -151], [150, -254]], B[2]);
  sod(g, -10, -158, 150, -261, 13); sod(g, 150, -261, 310, -158, 29);
  hole(g, 130, -72, 40, 72, true);
  for (const dx of [40, 200]) { box(g, dx - 1, -101, 62, 101, INK); planks(g, dx, -100, 60, 100, ramp6(dimmed('#5C3A1A')), false, dx, 10); box(g, dx + 28, -100, 4, 100, INK); poly(g, [[dx, -2], [dx + 56, -96], [dx + 60, -96], [dx + 4, -2]], dimmed('#3F2A1E')); }
  hole(g, 136, -140, 28, 26, true);
};
export const drawBoathouse = (c: Ctx, v: View, x: number) => facade(c, v, 'no-boathouse', x, 300, 160, paintBoathouse, 0.9, 120, 20, false);

/** THE TROLL UNDER THE BRIDGE's hand (live): up out of the river, a huge green hand (knuckles, nails, its palm's
 *  shade), its wrist down into the water, the water torn white round it. */
export const drawTrollHand = (c: Ctx, x: number, sy: number, k: number, f: number) => {
  const R = ramp6(hour(TROLL)), up = 70 * k;
  box(c, x - 19, sy - up - 1, 38, up + 42, INK); box(c, x - 18, sy - up, 36, up + 40, R[2]); box(c, x - 18, sy - up, 8, up + 40, R[3]); box(c, x + 12, sy - up, 6, up + 40, R[1]);
  for (let y = sy - up + 10; y < sy + 30; y += 12) box(c, x - 12, y, 24, 2, R[1]);
  box(c, x - 41, sy - up - 41, 82, 48, INK); box(c, x - 40, sy - up - 40, 80, 46, R[3]); box(c, x - 40, sy - up - 40, 80, 4, R[4]); box(c, x + 24, sy - up - 40, 16, 46, R[2]);
  for (let k2 = 0; k2 < 4; k2++) {
    const fx = x - 37 + k2 * 19, fl = 22 + (k2 === 1 || k2 === 2 ? 4 : 0);
    box(c, fx - 1, sy - up - 40 - fl - 1, 16, fl + 4, INK); box(c, fx, sy - up - 40 - fl, 14, fl + 2, R[3]); box(c, fx, sy - up - 40 - fl, 4, fl + 2, R[4]); box(c, fx + 11, sy - up - 40 - fl, 3, fl + 2, R[1]);
    box(c, fx + 2, sy - up - 40 - fl - 2, 10, 5, INK); box(c, fx + 3, sy - up - 40 - fl - 1, 8, 3, hour('#F5F0D8')); box(c, fx + 3, sy - up - 40 - fl - 1, 3, 1, '#FFFFFF');
    box(c, fx + 2, sy - up - 44, 10, 2, R[1]);
  }
  for (let k2 = 0; k2 < 3; k2++) box(c, x - 30 + k2 * 22, sy - up - 18, 10, 3, R[1]);
  // (the water torn white round its wrist)
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI, r = 28 + Math.sin(f * 0.3 + i) * 4; box(c, x + Math.cos(a) * r - 3, sy - Math.sin(a) * 6 - 2, 6, 4, '#E0F2FE'); box(c, x + Math.cos(a) * r - 2, sy - Math.sin(a) * 6 - 2, 3, 1, '#FFFFFF'); }
};

void mix; void rockFace; void lip;
