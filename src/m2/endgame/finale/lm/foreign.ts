import { type Ctx, INK, R, poly, ell, line, txt, sign } from './kit';
import { ramp, hash, dith, wall, drum, cone, gable } from './kitFJF';

// ---------------------------------------------------------------------------------------------------------------
// FOREIGN LANDS (the second pass): the pavilions (one landmark: ten countries round the lagoon, each its own landmark
// small, as foreign/teases.ts has them), the world monuments (the helicopter stage's nine oversized replicas on their
// plinths, in the order he fought them, the googly eyes still stuck on), and the AMERICA pavilion's dig (the steel
// going up, the tower crane, the hoarding, and what's left of the statue down in it). Lit from the sunrise (upper right).

const STONE = ramp('#B8AE98'), WHITE = ramp('#E4E0D4'), IRON = ramp('#8A6A4A'), SAND = ramp('#D8B878'), BASALT = ramp('#6A6A62');
const PLINTH = ramp('#9A9690');

/** Stuck-on googly eyes (the mechs': white, the pupils off somewhere). */
const googly = (g: Ctx, x: number, y: number, r = 2.5, look = 1) => {
  for (const s of [-1, 1]) { const ex = x + s * (r + 0.5); ell(g, ex, y, r + 0.6, r + 0.6, INK, false); ell(g, ex, y, r, r, '#FFFFFF', false); R(g, ex + look * 0.6 - 0.5, y + (s > 0 ? 0 : -1), 1.5, 1.5, INK); }
};
/** A replica's plinth, its brass plate. */
const plinth = (g: Ctx, cx: number, w: number) => {
  R(g, cx - w / 2 - 1, -7, w + 2, 7, INK); R(g, cx - w / 2, -6, w, 6, PLINTH[2]); R(g, cx - w / 2, -6, w, 1, PLINTH[4]); R(g, cx - w / 2, -6, Math.round(w * 0.2), 6, PLINTH[1]); R(g, cx + w / 2 - Math.round(w * 0.25), -5, Math.round(w * 0.25), 5, PLINTH[3]);
  R(g, cx - 4, -4, 8, 2, '#C8962A'); R(g, cx - 4, -4, 8, 1, '#FFF0A0');
};
const flag = (g: Ctx, x: number, top: number, foot: number, paint: (x: number, y: number) => void) => { R(g, x, top, 1, foot - top, '#9CA3AF'); R(g, x + 1, top - 1, 10, 8, INK); paint(x + 1, top); };

// ---------------------------------------------------------------------------------------------------------------
// The world monuments

const eiffel = (g: Ctx, cx: number) => {
  const P = IRON, B = -6, H = 100;
  // (the legs curving in to the first deck, the arch between; the second deck; the spire)
  const half = (y: number) => { const u = (B - y) / H; return u < 0.28 ? 22 - u * 46 : u < 0.5 ? 9.2 - (u - 0.28) * 20 : Math.max(0.8, 4.8 - (u - 0.5) * 8.4); };
  for (const pass of [0, 1]) for (let y = B; y > B - H; y--) {
    const h = half(y), u = (B - y) / H, x0 = Math.round(cx - h), w = Math.max(1, Math.round(h * 2));
    if (pass === 0) { R(g, x0 - 1, y - 1, w + 2, 2, INK); continue; }
    R(g, x0, y - 1, w, 1, P[2]); R(g, x0, y - 1, Math.max(1, Math.round(w * 0.3)), 1, P[1]); R(g, x0 + Math.round(w * 0.65), y - 1, Math.max(1, Math.round(w * 0.35)), 1, P[3]);
    // (the lattice: holes in it lower down)
    if (u < 0.5 && w > 6 && (y & 1)) for (let x = x0 + 2 + ((y >> 1) & 1); x < x0 + w - 2; x += 3) R(g, x, y - 1, 1, 1, P[0]);
  }
  // (the arch under the first deck)
  g.fillStyle = '#F2B878'; g.beginPath(); g.ellipse(cx, B, 13, 21, 0, Math.PI, 0); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, B, 13, 21, 0, Math.PI, 0); g.stroke();
  g.strokeStyle = P[3]; g.beginPath(); g.ellipse(cx, B, 14.5, 22.5, 0, -1.5, -0.2); g.stroke();
  for (const [y, w] of [[B - 28, 22], [B - 50, 12]] as const) { R(g, cx - w / 2 - 1, y - 2, w + 2, 4, INK); R(g, cx - w / 2, y - 1, w, 2, P[3]); R(g, cx - w / 2, y - 1, w, 1, P[4]); }
  R(g, cx, B - H - 5, 1, 6, '#C8C8D0'); R(g, cx, B - H - 6, 1, 1, '#EF4444');
  googly(g, cx, B - 40, 2.2, -1);
  txt(g, '3X', cx + 0.5, B - 8, '#FDE68A', 4);
};
const opera = (g: Ctx, cx: number) => {
  // (the podium, then the shells: two ranks of white sails, the big ones at the back, lit on their right faces)
  R(g, cx - 28, -16, 56, 10, INK); R(g, cx - 27, -15, 54, 9, STONE[2]); R(g, cx - 27, -15, 54, 1, STONE[4]); for (let x = cx - 24; x < cx + 26; x += 5) R(g, x, -12, 2, 5, '#3A4A5A');
  const sail = (x: number, w: number, h: number, dir: number) => {
    const tip = x + dir * w * 0.5;
    poly(g, [x - w / 2 - 1, -15, tip, -15 - h - 1, x + w / 2 + 1, -15], INK, false);
    poly(g, [x - w / 2, -15, tip, -15 - h, x + w / 2, -15], WHITE[3], false);
    poly(g, [x - w / 2, -15, tip, -15 - h, x - w * 0.1, -15], WHITE[dir > 0 ? 2 : 1], false);
    g.strokeStyle = WHITE[1]; g.lineWidth = 1; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x - w / 2 + (w * k) / 3, -15); g.lineTo(tip, -15 - h); g.stroke(); }
  };
  sail(cx - 16, 16, 20, -1); sail(cx - 6, 18, 30, -1); sail(cx + 10, 18, 26, 1); sail(cx + 20, 12, 16, 1); sail(cx - 2, 12, 14, 1);
  googly(g, cx - 2, -24, 2.4, 1);
};
const redeemer = (g: Ctx, cx: number) => {
  const P = ramp('#CFC8B8');
  // (the hill's cap of rock, the pedestal, the robe, the arms straight out, the head)
  poly(g, [cx - 22, -6, cx - 12, -20, cx + 10, -22, cx + 22, -6], INK, false); poly(g, [cx - 21, -6, cx - 12, -19, cx + 10, -21, cx + 21, -6], '#5A7A4A', false); poly(g, [cx + 2, -6, cx + 4, -21, cx + 10, -21, cx + 21, -6], '#7A9A5A', false);
  wall(g, cx - 6, -32, 12, 12, P);
  // (the robe: wide at the hem, in to the shoulders, its folds; the sleeves out flat, draped under; the neck and head)
  poly(g, [cx - 7, -32, cx - 5, -66, cx + 5, -66, cx + 7, -32], INK, false); poly(g, [cx - 6, -32, cx - 4, -65, cx + 4, -65, cx + 6, -32], P[2], false);
  poly(g, [cx + 1, -32, cx + 1, -65, cx + 4, -65, cx + 6, -32], P[3], false); R(g, cx - 5, -60, 1, 28, P[1]); R(g, cx + 3, -62, 1, 30, P[4]);
  for (const x of [cx - 3, cx - 1, cx + 1]) R(g, x, -54, 1, 20, P[1]);
  for (const s2 of [-1, 1]) {
    poly(g, [cx + s2 * 4, -67, cx + s2 * 23, -66, cx + s2 * 23, -62, cx + s2 * 12, -61, cx + s2 * 6, -55, cx + s2 * 4, -58], INK, false);
    poly(g, [cx + s2 * 4, -66, cx + s2 * 22, -65, cx + s2 * 22, -63, cx + s2 * 12, -62, cx + s2 * 6, -57, cx + s2 * 4, -59], s2 > 0 ? P[3] : P[2], false);
    R(g, cx + s2 * 23 - (s2 > 0 ? 0 : 2), -66, 2, 3, INK); R(g, cx + s2 * 23 - (s2 > 0 ? 0 : 1), -65, 1, 2, P[4]);
  }
  R(g, cx - 6, -66, 12, 1, P[4]);
  R(g, cx - 2, -69, 4, 4, INK); R(g, cx - 1, -69, 2, 3, P[2]);
  ell(g, cx, -73, 4.2, 4.6, INK, false); ell(g, cx, -73, 3.3, 3.8, P[3], false); R(g, cx - 3, -77, 6, 2, P[1]); R(g, cx - 1, -70, 2, 1, P[1]);
  googly(g, cx, -74, 1.5, 1);
};
const pisa = (g: Ctx, cx: number) => {
  // (leaning right: eight drums of white arcades, the belfry on top)
  g.save(); g.translate(cx - 3, -6); g.transform(1, 0, -0.2, 1, 0, 0);
  for (let k = 0; k < 7; k++) {
    const y = -(k + 1) * 10, w = k === 0 ? 20 : 18;
    drum(g, -w / 2, y, w, 10, WHITE);
    R(g, -w / 2 - 1, y, w + 2, 1, INK); R(g, -w / 2 - 1, y + 1, w + 2, 1, WHITE[4]);
    for (let x = -w / 2 + 2; x < w / 2 - 1; x += 3) { R(g, x, y + 4, 1, 5, '#5A5648'); R(g, x, y + 3, 1, 1, '#8A8676'); }
  }
  drum(g, -6, -80, 12, 10, WHITE); R(g, -7, -80, 14, 1, INK); for (let x = -4; x < 5; x += 3) R(g, x, -76, 1, 4, '#5A5648'); R(g, 0, -84, 1, 4, '#9CA3AF'); R(g, 1, -84, 4, 2, '#DC2626');
  googly(g, 0, -55, 2.2, 1);
  g.restore();
};
const taj = (g: Ctx, cx: number) => {
  const P = WHITE;
  // (the minarets at the corners, the plinth, the block with its great arch, the onion dome and the little ones)
  for (const s of [-1, 1]) { const x = cx + s * 27; drum(g, x - 2, -52, 4, 46, P); R(g, x - 3, -40, 6, 1, INK); R(g, x - 3, -28, 6, 1, INK); R(g, x - 3, -53, 6, 2, INK); ell(g, x, -55, 2.5, 2.5, P[3]); R(g, x, -59, 1, 2, '#C8962A'); }
  wall(g, cx - 22, -12, 44, 6, P);
  wall(g, cx - 18, -36, 36, 24, P);
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 6, -12); g.lineTo(cx - 6, -26); g.quadraticCurveTo(cx, -36, cx + 6, -26); g.lineTo(cx + 6, -12); g.closePath(); g.fill();
  g.fillStyle = '#5A6A84'; g.beginPath(); g.moveTo(cx - 4, -12); g.lineTo(cx - 4, -25); g.quadraticCurveTo(cx, -33, cx + 4, -25); g.lineTo(cx + 4, -12); g.closePath(); g.fill();
  for (const s of [-1, 1]) for (const y of [-32, -22]) { R(g, cx + s * 13 - 2, y, 4, 7, INK); R(g, cx + s * 13 - 1, y + 1, 2, 5, '#5A6A84'); }
  for (const s of [-1, 1]) { ell(g, cx + s * 13, -40, 4, 4, P[s > 0 ? 3 : 2]); R(g, cx + s * 13 - 4, -40, 8, 4, P[2]); R(g, cx + s * 13 - 5, -37, 10, 1, INK); R(g, cx + s * 13, -46, 1, 2, '#C8962A'); }
  R(g, cx - 9, -44, 18, 8, INK); R(g, cx - 8, -43, 16, 7, P[2]); R(g, cx + 3, -43, 5, 7, P[3]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 9, -44); g.bezierCurveTo(cx - 16, -60, cx - 4, -64, cx, -70); g.bezierCurveTo(cx + 4, -64, cx + 16, -60, cx + 9, -44); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(cx - 8, -44); g.bezierCurveTo(cx - 14, -59, cx - 3, -63, cx, -68); g.bezierCurveTo(cx + 3, -63, cx + 14, -59, cx + 8, -44); g.closePath(); g.fill();
  g.fillStyle = P[1]; g.beginPath(); g.moveTo(cx - 8, -44); g.bezierCurveTo(cx - 14, -59, cx - 3, -63, cx, -68); g.bezierCurveTo(cx - 5, -60, cx - 7, -52, cx - 4, -44); g.closePath(); g.fill();
  g.fillStyle = P[4]; g.beginPath(); g.ellipse(cx + 4, -55, 2.5, 5, 0.3, 0, Math.PI * 2); g.fill();
  R(g, cx, -74, 1, 5, '#C8962A'); R(g, cx - 1, -72, 3, 1, '#F2C84A');
  googly(g, cx, -50, 2.4, -1);
};
const bigben = (g: Ctx, cx: number) => {
  const P = ramp('#C8A06A'), Sl = ramp('#3A5A4A');
  wall(g, cx - 8, -78, 16, 72, P);
  for (let y = -74; y < -8; y += 4) for (let x = cx - 6; x < cx + 7; x += 3) R(g, x, y, 1, 3, P[1]);
  R(g, cx - 10, -80, 20, 3, INK); R(g, cx - 9, -79, 18, 1, P[4]);
  wall(g, cx - 10, -96, 20, 16, P);
  ell(g, cx, -88, 6.5, 6.5, INK, false); ell(g, cx, -88, 5.5, 5.5, '#F8F6EA', false); line(g, cx, -88, cx, -92, INK); line(g, cx, -88, cx + 3, -87, INK); for (let a = 0; a < 12; a += 3) R(g, cx - 0.5 + Math.cos(a * Math.PI / 6) * 4.5, -88.5 + Math.sin(a * Math.PI / 6) * 4.5, 1, 1, '#8A6A20');
  cone(g, cx, -97, 11, 12, Sl); R(g, cx - 4, -103, 8, 2, '#C8962A'); R(g, cx, -112, 1, 4, '#C8962A');
  for (const s of [-1, 1]) { R(g, cx + s * 9 - (s > 0 ? 1 : 0), -101, 2, 5, INK); R(g, cx + s * 9 - (s > 0 ? 1 : 0), -100, 1, 4, '#C8962A'); }
  googly(g, cx, -70, 2.2, 1);
};
const colosseum = (g: Ctx, cx: number) => {
  const P = ramp('#D0BC92');
  // (three tiers of arches, the fourth with its little windows; the broken end down to two tiers on the right)
  for (let k = 0; k < 4; k++) {
    const y = -6 - (k + 1) * 10, w = k < 2 ? 60 : 42, x0 = cx - 30;
    R(g, x0 - 1, y - 1, w + 2, 12, INK);
    R(g, x0, y, w, 10, P[2]); R(g, x0, y, Math.round(w * 0.2), 10, P[1]); R(g, x0 + Math.round(w * 0.55), y, Math.round(w * 0.45), 10, P[3]); dith(g, x0 + Math.round(w * 0.55) - 1, y, 1, 10, P[3]);
    R(g, x0, y, w, 1, P[4]);
    for (let x = x0 + 2; x < x0 + w - 3; x += 6) { if (k < 3) { R(g, x, y + 4, 4, 6, '#3A2E1E'); R(g, x + 1, y + 3, 2, 1, '#3A2E1E'); } else R(g, x + 1, y + 4, 2, 3, '#3A2E1E'); }
  }
  // (the break: a ragged slope from the top tier down)
  for (let k = 0; k < 6; k++) R(g, cx + 12 + k * 3, -47 + k * 3.3, 4, 2, P[4]);
  googly(g, cx - 6, -31, 2.6, 1);
};
const pyramid = (g: Ctx, cx: number) => {
  const P = SAND, h = 54, hw = 31, B = -6;
  poly(g, [cx - hw - 1, B, cx, B - h - 1, cx + hw + 1, B], INK, false);
  poly(g, [cx - hw, B, cx, B - h, cx + hw, B], P[2], false);
  poly(g, [cx + 5, B, cx, B - h, cx + hw, B], P[3], false);
  poly(g, [cx - hw, B, cx, B - h, cx - 14, B], P[1], false);
  // (the courses, stepping; the capstone still on)
  for (let y = B - 4; y > B - h + 4; y -= 4) { const half = hw * ((y - (B - h)) / h); for (let x = cx - half + 1; x < cx + half - 1; x += 2) if (((x + y) & 3) === 0) R(g, x, y, 2, 1, x > cx + 5 ? P[2] : P[0]); }
  poly(g, [cx - 4, B - h + 7, cx, B - h, cx + 4, B - h + 7], '#F2E6C4', false); poly(g, [cx + 1, B - h + 7, cx, B - h, cx + 4, B - h + 7], '#FFFFFF', false);
  googly(g, cx + 2, B - 24, 2.8, -1);
};
const moai = (g: Ctx, cx: number) => {
  const P = BASALT, B = -6;
  // (the whole guy: the shoulders, the long head, the brow, the nose, the pursed lips, the long ears)
  poly(g, [cx - 13, B, cx - 13, B - 22, cx - 9, B - 28, cx + 9, B - 28, cx + 13, B - 22, cx + 13, B], INK, false);
  poly(g, [cx - 12, B, cx - 12, B - 22, cx - 8, B - 27, cx + 8, B - 27, cx + 12, B - 22, cx + 12, B], P[2], false); R(g, cx + 5, B - 24, 7, 24, P[3]); R(g, cx - 12, B - 22, 4, 22, P[1]);
  poly(g, [cx - 10, B - 26, cx - 11, B - 60, cx - 7, B - 70, cx + 8, B - 70, cx + 11, B - 60, cx + 10, B - 26], INK, false);
  poly(g, [cx - 9, B - 26, cx - 10, B - 60, cx - 6.5, B - 69, cx + 7.5, B - 69, cx + 10, B - 60, cx + 9, B - 26], P[2], false);
  R(g, cx + 4, B - 68, 5, 42, P[3]); R(g, cx - 9, B - 62, 3, 36, P[1]); dith(g, cx + 3, B - 68, 1, 42, P[3]);
  R(g, cx - 9, B - 59, 18, 3, P[0]); R(g, cx - 9, B - 60, 18, 1, P[4]);
  poly(g, [cx - 2, B - 56, cx + 3, B - 42, cx - 3, B - 42], P[1], false); R(g, cx - 3, B - 42, 7, 2, P[0]); R(g, cx + 2, B - 54, 1, 11, P[4]);
  R(g, cx - 5, B - 36, 11, 2, P[0]); R(g, cx - 5, B - 37, 11, 1, P[4]);
  for (const s of [-1, 1]) { R(g, cx + s * 11 - (s > 0 ? 1 : 0), B - 58, 2, 18, INK); R(g, cx + s * 11 - (s > 0 ? 0 : 0), B - 57, 1, 16, s > 0 ? P[4] : P[1]); }
  googly(g, cx, B - 55, 2.2, -1);
};

/** The world monuments, the whole row (the owner's one throw target; they go over like dominoes, left to right): the
 *  park's oversized replicas on their plinths, in the order the helicopter met them: EIFFEL 3X, THE OPERA HOUSE,
 *  CHRIST THE REDEEMER, PISA (leaning already), THE TAJ MAHAL, BIG BEN BIGGER, THE COLOSSEUM, THE GREAT PYRAMID, THE
 *  EASTER ISLAND HEAD. Each stands clear of the next. One sign over the lot, on its posts. */
export const paintMonuments = (g: Ctx) => {
  // (the promenade they stand along: paving, a lit edge, lamp posts between)
  R(g, -308, -3, 616, 3, '#B8AC98'); R(g, -308, -3, 616, 1, '#E8E0D0'); for (let x = -304; x < 308; x += 8) R(g, x, -2, 1, 2, '#8A7E6C');
  sign(g, 'THE WORLD MONUMENTS', 138, -74, 0, '#0C5A8A', '#F8FAFC', 5, true);
  const at = (i: number) => -276 + i * 69;
  for (let i = 0; i < 9; i++) plinth(g, at(i), [46, 60, 48, 28, 62, 26, 66, 66, 30][i]);
  for (let i = 0; i < 8; i++) { const x = at(i) + 35; R(g, x, -18, 1, 18, '#3A3A44'); R(g, x - 1, -20, 3, 2, INK); R(g, x, -20, 1, 1, '#FFE9A8'); }
  eiffel(g, at(0)); opera(g, at(1)); redeemer(g, at(2)); pisa(g, at(3)); taj(g, at(4)); bigben(g, at(5)); colosseum(g, at(6)); pyramid(g, at(7)); moai(g, at(8));
};

// ---------------------------------------------------------------------------------------------------------------
// The pavilions

/** THE WORLD SHOWCASE PAVILIONS, one landmark: ten countries along the lagoon's shore, each its flag and its own
 *  landmark: MEXICO's pyramid, NORWAY's stave church, CHINA's pagoda on its wall, GERMANY's castle and cuckoo clock,
 *  ITALY's campanile, JAPAN's pagoda and torii, MOROCCO's tower, FRANCE's arc and glass pyramid, the UK's tallest phone
 *  box and bridge, CANADA's falls and carved pole. */
export const paintPavilions = (g: Ctx) => {
  // (the shore walk, the lagoon's edge in front of it)
  R(g, -210, -4, 420, 4, INK); R(g, -209, -3, 418, 2, '#D8C8A8'); R(g, -209, -3, 418, 1, '#FFF4DC'); R(g, -209, -1, 418, 1, '#3B82C4'); dith(g, -209, -1, 418, 1, '#8AC0F0');
  sign(g, 'WORLD SHOWCASE', 0, -81, 0, '#0C5A8A', '#F8FAFC', 6, true);
  const at = (i: number) => -189 + i * 42, F = -4;
  const S = (x: number, y: number, w: number, h: number, c: string) => R(g, x, y, w, h, c);
  // 1 MEXICO: the stepped pyramid, its stair, the temple on top
  { const cx = at(0), P = ramp('#B8A07A'); for (let k = 0; k < 5; k++) { const w = 36 - k * 6, y = F - (k + 1) * 6; S(cx - w / 2 - 1, y - 1, w + 2, 7, INK); S(cx - w / 2, y, w, 6, P[2]); S(cx - w / 2, y, w, 1, P[4]); S(cx + w / 2 - 4, y + 1, 4, 5, P[3]); S(cx - w / 2, y + 1, 3, 5, P[1]); } S(cx - 3, F - 30, 6, 30, P[1]); for (let y = F - 29; y < F; y += 2) S(cx - 3, y, 6, 1, P[4]); wall(g, cx - 6, F - 38, 12, 8, ramp('#A0442A')); S(cx - 2, F - 35, 4, 5, '#140C08'); }
  // 2 NORWAY: the stave church: three tiers of dark shingled roofs, dragon heads off the gables, the red door
  { const cx = at(1), Wd = ramp('#4A2E1E'), Sh = ramp('#3A2E2A'); const tier = (y: number, w: number, h: number) => { wall(g, cx - w / 2 + 3, y, w - 6, 8, Wd); gable(g, cx - w / 2, cx + w / 2, y, h, Sh); for (const s of [-1, 1]) { line(g, cx + s * (w / 2 - 1), y - 1, cx + s * (w / 2 + 2), y - 5, INK, 2); R(g, cx + s * (w / 2 + 2) - (s > 0 ? 0 : 1), y - 6, 1, 1, '#C8962A'); } }; tier(F - 8, 30, 10); tier(F - 22, 22, 10); tier(F - 36, 14, 9); S(cx, F - 52, 1, 8, Wd[1]); S(cx - 3, F - 7, 6, 7, INK); S(cx - 2, F - 6, 4, 6, '#9F1239'); }
  // 3 CHINA: a run of the wall, the red pagoda on it, gold roofs turned up at the ends
  { const cx = at(2), W = ramp('#9A9488'), Rd = ramp('#C81E1E'), Gd = ramp('#E8B020'); wall(g, cx - 17, F - 10, 34, 10, W); for (let x = cx - 17; x < cx + 16; x += 4) { S(x, F - 13, 3, 3, INK); S(x, F - 13, 2, 2, W[3]); } for (let k = 0; k < 3; k++) { const w = 18 - k * 4, y = F - 20 - k * 10; wall(g, cx - w / 2 + 2, y, w - 4, 8, Rd); poly(g, [cx - w / 2 - 3, y - 1, cx - w / 2 - 1, y - 3, cx + w / 2 + 1, y - 3, cx + w / 2 + 3, y - 1, cx + w / 2 + 2, y + 1, cx - w / 2 - 2, y + 1], INK, false); S(cx - w / 2 - 1, y - 2, w + 2, 2, Gd[2]); S(cx + 1, y - 2, w / 2, 1, Gd[4]); S(cx - w / 2 - 3, y - 3, 1, 1, Gd[2]); S(cx + w / 2 + 2, y - 3, 1, 1, Gd[4]); } S(cx, F - 48, 1, 6, Gd[2]); }
  // 4 GERMANY: the half-timbered hall, its two blue cone towers, the cuckoo clock in the gable
  { const cx = at(3), P = ramp('#E8E0D0'), Bl = ['#1E3678', '#2E52A8', '#4A78D4', '#7AA8F0', '#B8D0FF']; for (const s of [-1, 1]) { drum(g, cx + s * 12 - 3, F - 26, 6, 26, P); cone(g, cx + s * 12, F - 26, 5, 10, Bl); } wall(g, cx - 10, F - 18, 20, 18, P); for (const x of [cx - 10, cx - 1, cx + 9]) S(x, F - 18, 1, 18, '#4A2E1A'); S(cx - 10, F - 10, 20, 1, '#4A2E1A'); gable(g, cx - 11, cx + 11, F - 18, 10, ramp('#8A3A22')); ell(g, cx, F - 20, 3, 3, '#F8F6EA'); S(cx, F - 22, 1, 2, INK); S(cx - 2, F - 7, 4, 7, '#3A2414'); S(cx - 7, F - 16, 3, 4, '#FFD88A'); S(cx + 4, F - 16, 3, 4, '#FFD88A'); }
  // 5 ITALY: the campanile in brick, its green cap and gold angel; a pizza on the wall of the trattoria
  { const cx = at(4), Br = ramp('#C87A5A'), Wh = ramp('#E8E0D0'); wall(g, cx - 14, F - 14, 18, 14, ramp('#E8C890')); gable(g, cx - 15, cx + 5, F - 14, 5, ramp('#A8503A')); ell(g, cx - 5, F - 7, 4, 4, '#E8B040'); ell(g, cx - 5, F - 7, 3, 3, '#D8402A', false); S(cx - 6, F - 8, 1, 1, '#F8F0D0'); S(cx - 4, F - 6, 1, 1, '#F8F0D0'); wall(g, cx + 6, F - 44, 9, 44, Br); for (let y = F - 40; y < F - 4; y += 7) S(cx + 10, y, 1, 3, Br[0]); wall(g, cx + 5, F - 52, 11, 8, Wh); for (const x of [cx + 7, cx + 11]) S(x, F - 50, 2, 5, '#3A4A5A'); cone(g, cx + 10.5, F - 53, 6, 9, ramp('#3E8A6A')); S(cx + 10, F - 65, 1, 3, '#F2C84A'); }
  // 6 JAPAN: the five-story pagoda, the vermilion torii at the water
  { const cx = at(5), Wd = ramp('#8A2A1E'), Rf = ramp('#3A4048'); for (let k = 0; k < 5; k++) { const w = 20 - k * 3, y = F - 10 - k * 9; wall(g, cx + 4 - w / 2 + 3, y, w - 6, 8, k % 2 ? Wd : ramp('#E8E0D0')); poly(g, [cx + 4 - w / 2 - 3, y - 1, cx + 4 - w / 2, y - 3, cx + 4 + w / 2, y - 3, cx + 4 + w / 2 + 3, y - 1, cx + 4 + w / 2 + 2, y + 1, cx + 4 - w / 2 - 2, y + 1], INK, false); S(cx + 4 - w / 2 - 1, y - 2, w + 2, 2, Rf[2]); S(cx + 5, y - 2, w / 2, 1, Rf[4]); } S(cx + 4, F - 58, 1, 10, '#C8962A'); for (const x of [cx - 16, cx - 9]) { S(x - 1, F - 12, 3, 12, INK); S(x, F - 12, 1, 12, '#E8401A'); } S(cx - 19, F - 14, 15, 3, INK); S(cx - 18, F - 13, 13, 1, '#E8401A'); S(cx - 17, F - 10, 11, 1, '#E8401A'); }
  // 7 MOROCCO: the square tower in ochre, tile band, the green dome; a keyhole gate
  { const cx = at(6), P = ramp('#D8A868'), Gn = ramp('#1F8A5A'); wall(g, cx - 14, F - 14, 16, 14, P); g.fillStyle = '#3A2414'; g.beginPath(); g.arc(cx - 6, F - 7, 3.5, 0, Math.PI * 2); g.fill(); S(cx - 8, F - 6, 5, 6, '#3A2414'); for (let x = cx - 14; x < cx + 2; x += 3) { S(x, F - 16, 2, 2, P[3]); } wall(g, cx + 4, F - 40, 10, 40, P); for (let x = cx + 5; x < cx + 13; x += 2) S(x, F - 34, 1, 2, x % 4 ? '#1F8A5A' : '#2E52A8'); S(cx + 8, F - 28, 2, 5, '#3A2414'); S(cx + 8, F - 16, 2, 5, '#3A2414'); for (let x = cx + 4; x < cx + 14; x += 3) S(x, F - 43, 2, 3, P[3]); wall(g, cx + 6, F - 48, 6, 6, P); ell(g, cx + 9, F - 49, 3.5, 3.5, Gn[2]); S(cx + 10, F - 52, 1, 2, Gn[4]); S(cx + 9, F - 56, 1, 4, '#F2C84A'); }
  // 8 FRANCE: the Arc, the glass pyramid beside it
  { const cx = at(7), P = ramp('#E0D8C4'), Gl = ramp('#8AC0E0'); wall(g, cx - 16, F - 26, 20, 26, P); S(cx - 17, F - 28, 22, 3, INK); S(cx - 16, F - 27, 20, 1, P[4]); S(cx - 16, F - 21, 20, 1, P[1]); g.fillStyle = INK; g.beginPath(); g.arc(cx - 6, F - 12, 5, Math.PI, 0); g.fill(); S(cx - 11, F - 12, 10, 12, INK); g.fillStyle = '#F2B878'; g.beginPath(); g.arc(cx - 6, F - 12, 4, Math.PI, 0); g.fill(); S(cx - 10, F - 12, 8, 12, '#F2B878'); poly(g, [cx + 4, F, cx + 12, F - 14, cx + 20, F], INK, false); poly(g, [cx + 5, F, cx + 12, F - 13, cx + 19, F], Gl[2], false); poly(g, [cx + 12, F, cx + 12, F - 13, cx + 19, F], Gl[4], false); line(g, cx + 8, F - 6, cx + 16, F - 6, Gl[0]); line(g, cx + 12, F - 13, cx + 12, F, Gl[0]); }
  // 9 UK: the world's tallest phone box; Tower Bridge's two towers and walkway
  { const cx = at(8), Rd = ramp('#C81E1E'), St = STONE; wall(g, cx - 14, F - 40, 9, 40, Rd); for (let y = F - 36; y < F - 4; y += 5) for (const x of [cx - 13, cx - 9]) S(x, y, 2, 3, '#3A4A5A'); S(cx - 15, F - 43, 11, 3, INK); S(cx - 14, F - 42, 9, 1, '#F2ECE0'); g.fillStyle = INK; g.beginPath(); g.ellipse(cx - 9.5, F - 43, 5.5, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = Rd[3]; g.beginPath(); g.ellipse(cx - 9.5, F - 43, 4.5, 2.2, 0, Math.PI, 0); g.fill(); for (const x of [cx + 3, cx + 15]) { wall(g, x - 3, F - 24, 6, 24, St); cone(g, x, F - 24, 4, 7, ramp('#4A5060')); S(x - 1, F - 18, 2, 4, St[0]); } S(cx + 6, F - 22, 7, 3, INK); S(cx + 6, F - 21, 7, 1, '#7AA8D0'); line(g, cx + 6, F - 18, cx + 9, F - 8, '#4A7AA8'); line(g, cx + 12, F - 18, cx + 9, F - 8, '#4A7AA8'); S(cx - 2, F - 8, 22, 2, '#4A7AA8'); }
  // 10 CANADA: the falls down their cliff, pines on top, a carved pole with its wings
  { const cx = at(9), Rk = ramp('#6A6E78'), Wt = ['#8AB0D0', '#A8C8E0', '#C8DCEC', '#E4F0F8', '#FFFFFF'], Pl = ramp('#B88A54'); poly(g, [cx - 19, F, cx - 19, F - 24, cx - 12, F - 30, cx + 2, F - 31, cx + 9, F - 26, cx + 11, F], INK, false); poly(g, [cx - 18, F, cx - 18, F - 24, cx - 12, F - 29, cx + 2, F - 30, cx + 8, F - 26, cx + 10, F], Rk[2], false); S(cx - 18, F - 24, 5, 24, Rk[1]); S(cx + 4, F - 26, 5, 26, Rk[3]); for (let y = F - 22; y < F; y += 6) S(cx - 16, y + (y % 4), 22, 1, Rk[1]); S(cx - 8, F - 30, 8, 28, Wt[2]); S(cx - 3, F - 30, 2, 28, Wt[4]); S(cx - 8, F - 30, 2, 28, Wt[0]); for (let y = F - 26; y < F - 4; y += 4) S(cx - 6 + ((y >> 1) % 3), y, 1, 2, Wt[4]); for (let k = 0; k < 5; k++) ell(g, cx - 10 + k * 3, F - 2 - (k % 2), 2.5, 2, Wt[4], false); for (const px of [cx - 15, cx + 4]) { poly(g, [px - 4, F - 28, px, F - 40, px + 4, F - 28], INK, false); poly(g, [px - 3, F - 28, px, F - 38, px + 3, F - 28], '#2E4A36', false); poly(g, [px, F - 28, px, F - 38, px + 3, F - 28], '#4A7A56', false); } wall(g, cx + 13, F - 34, 5, 34, Pl); for (let y = F - 30; y < F - 2; y += 8) { S(cx + 14, y, 1, 1, INK); S(cx + 16, y, 1, 1, INK); S(cx + 14, y + 3, 3, 1, '#A02A1A'); } poly(g, [cx + 6, F - 33, cx + 15.5, F - 38, cx + 25, F - 33, cx + 15.5, F - 31], INK, false); poly(g, [cx + 8, F - 33.5, cx + 15.5, F - 37, cx + 23, F - 33.5, cx + 15.5, F - 32], Pl[3], false); }
  // (the flags, one a country, on poles between: readable blocks of their colors)
  const FLAGS: ((x: number, y: number) => void)[] = [
    (x, y) => { S(x, y, 3, 6, '#15803D'); S(x + 3, y, 3, 6, '#F8FAFC'); S(x + 6, y, 3, 6, '#DC2626'); S(x + 4, y + 2, 1, 2, '#8A5A2A'); },
    (x, y) => { S(x, y, 9, 6, '#C8102E'); S(x + 2, y, 2, 6, '#F8FAFC'); S(x, y + 2, 9, 2, '#F8FAFC'); S(x + 2.5, y, 1, 6, '#1E3A8A'); S(x, y + 2.5, 9, 1, '#1E3A8A'); },
    (x, y) => { S(x, y, 9, 6, '#DC2626'); S(x + 1, y + 1, 2, 2, '#FDE047'); S(x + 4, y + 1, 1, 1, '#FDE047'); S(x + 4, y + 3, 1, 1, '#FDE047'); },
    (x, y) => { S(x, y, 9, 2, '#111827'); S(x, y + 2, 9, 2, '#DC2626'); S(x, y + 4, 9, 2, '#F2C84A'); },
    (x, y) => { S(x, y, 3, 6, '#15803D'); S(x + 3, y, 3, 6, '#F8FAFC'); S(x + 6, y, 3, 6, '#DC2626'); },
    (x, y) => { S(x, y, 9, 6, '#F8FAFC'); ell(g, x + 4.5, y + 3, 2, 2, '#DC2626', false); },
    (x, y) => { S(x, y, 9, 6, '#C1272D'); S(x + 3, y + 2, 3, 2, '#15803D'); },
    (x, y) => { S(x, y, 3, 6, '#1E3A8A'); S(x + 3, y, 3, 6, '#F8FAFC'); S(x + 6, y, 3, 6, '#DC2626'); },
    (x, y) => { S(x, y, 9, 6, '#1E3A8A'); line(g, x, y, x + 9, y + 6, '#F8FAFC'); line(g, x + 9, y, x, y + 6, '#F8FAFC'); S(x + 4, y, 1, 6, '#DC2626'); S(x, y + 2.5, 9, 1, '#DC2626'); },
    (x, y) => { S(x, y, 2, 6, '#DC2626'); S(x + 2, y, 5, 6, '#F8FAFC'); S(x + 7, y, 2, 6, '#DC2626'); S(x + 4, y + 2, 1, 3, '#DC2626'); S(x + 3, y + 3, 3, 1, '#DC2626'); },
  ];
  for (let i = 0; i < 10; i++) flag(g, at(i) - 20, -66, F, FLAGS[i]);
};

// ---------------------------------------------------------------------------------------------------------------
// AMERICA, under construction

/** AMERICA (UNDER CONSTRUCTION) (the owner's "in construction america land"): the pavilion's steel going up in red
 *  primer (columns, girders, X bracing, one floor decked), scaffold and a blue tarp up one end, the tower crane over
 *  it (lattice mast, the jib out with a girder on the hook, the counter-jib's block, the cab), the flag at the steel's
 *  corner, an excavator in the dirt, the hoarding along the front with its sign (AMERICA: COMING SOON); and down in the
 *  dig, what's left of the statue: the crowned head on its side, the torch stuck up out of the dirt. */
export const paintLibertyDig = (g: Ctx) => {
  const Stl = ramp('#8A4A2A'), Yl = ramp('#E8B020'), Gy = ramp('#8A8E96'), Dirt = ramp('#8A6A4A'), Cu = ramp('#6AB0A0');
  // (the dirt, heaped; the pit dark in the middle)
  poly(g, [-100, 0, -96, -8, -70, -11, -40, -8, 40, -9, 70, -12, 96, -8, 100, 0], INK, false);
  poly(g, [-99, 0, -95, -7, -70, -10, -40, -7, 40, -8, 70, -11, 95, -7, 99, 0], Dirt[2], false);
  poly(g, [40, -8, 70, -11, 95, -7, 99, 0, 50, 0], Dirt[3], false); R(g, -99, -3, 40, 3, Dirt[1]);
  for (let k = 0; k < 24; k++) R(g, -94 + k * 8 + (k % 3), -3 - (k % 4), 2, 1, k % 2 ? Dirt[0] : Dirt[4]);
  // (the steel: columns and girders, the bracing, the decked floor)
  const x0 = -66, x1 = 30, top = -70;
  for (let x = x0; x <= x1; x += 16) { R(g, x - 2, top, 5, -top - 8, INK); R(g, x - 1, top + 1, 3, -top - 9, Stl[2]); R(g, x + 1, top + 1, 1, -top - 9, Stl[4]); R(g, x - 1, top + 1, 1, -top - 9, Stl[1]); }
  for (const y of [top, top + 20, top + 40]) { R(g, x0 - 2, y - 1, x1 - x0 + 5, 4, INK); R(g, x0 - 1, y, x1 - x0 + 3, 2, Stl[2]); R(g, x0 - 1, y, x1 - x0 + 3, 1, Stl[4]); for (let x = x0 + 4; x < x1; x += 8) R(g, x, y + 1, 1, 1, Stl[0]); }
  for (let x = x0, k = 0; x < x1; x += 16, k++) for (let y = top, j = 0; y < top + 40; y += 20, j++) if (hash(k * 3 + j * 7) > 0.4) { line(g, x + 2, y + 3, x + 14, y + 19, Stl[1]); if ((k + j) % 2) line(g, x + 14, y + 3, x + 2, y + 19, Stl[1]); }
  R(g, x0 - 1, top + 38, 52, 3, INK); R(g, x0, top + 38, 50, 2, Gy[3]); R(g, x0, top + 38, 50, 1, Gy[4]);
  // (two tiny ironworkers on the top girder, eating lunch; a welder's spark lower down)
  for (const [x, c] of [[-40, '#F97316'], [-34, '#FDE047']] as const) { R(g, x, top - 4, 2, 3, c); R(g, x, top - 6, 2, 2, '#E8B48A'); R(g, x, top - 7, 2, 1, '#F8FAFC'); R(g, x, top - 1, 1, 3, '#1E3A8A'); }
  R(g, 13, top + 22, 1, 1, '#FFFFFF'); R(g, 12, top + 23, 3, 1, '#FDE047'); R(g, 13, top + 24, 1, 2, '#F97316');
  // (the scaffold up the right end: poles, boards, braces, the tarp)
  for (const x of [34, 48]) { R(g, x, top + 4, 1, -top - 12, '#C8C4B4'); }
  for (const y of [top + 6, top + 26, top + 46]) { R(g, 33, y, 17, 2, '#B8945A'); R(g, 33, y, 17, 1, '#E8C88A'); }
  line(g, 34, top + 8, 48, top + 26, '#9A968A'); line(g, 48, top + 28, 34, top + 46, '#9A968A');
  R(g, 33, top + 8, 17, 18, INK); R(g, 34, top + 9, 15, 16, '#2E5AA8'); R(g, 42, top + 9, 7, 16, '#4A7AD0'); for (let y = top + 12; y < top + 24; y += 4) R(g, 34, y, 15, 1, '#1E3E7A');
  // (the tower crane: the mast, the cab, the jib out left with its trolley and hook, the counter-jib and its block)
  const cx = 66, cy = -104;
  R(g, cx - 3, cy, 7, -cy - 8, INK); R(g, cx - 2, cy + 1, 5, -cy - 9, Yl[2]); R(g, cx + 2, cy + 1, 1, -cy - 9, Yl[4]); R(g, cx - 2, cy + 1, 1, -cy - 9, Yl[1]);
  for (let y = cy + 4; y < -12; y += 6) { line(g, cx - 2, y, cx + 3, y + 6, Yl[0]); line(g, cx + 3, y, cx - 2, y + 6, Yl[0]); }
  R(g, cx - 96, cy - 1, 118, 5, INK); R(g, cx - 95, cy, 116, 3, Yl[2]); R(g, cx - 95, cy, 116, 1, Yl[4]); for (let x = cx - 94; x < cx + 20; x += 5) line(g, x, cy + 1, x + 3, cy + 3, Yl[0]);
  line(g, cx, cy - 10, cx - 70, cy, Gy[1]); line(g, cx, cy - 10, cx + 20, cy, Gy[1]); R(g, cx - 1, cy - 11, 3, 11, INK); R(g, cx, cy - 10, 1, 10, Yl[2]);
  R(g, cx + 10, cy + 4, 12, 8, INK); R(g, cx + 11, cy + 5, 10, 6, Gy[1]); R(g, cx + 11, cy + 5, 10, 1, Gy[3]);
  R(g, cx - 12, cy + 4, 10, 8, INK); R(g, cx - 11, cy + 5, 8, 6, Yl[3]); R(g, cx - 10, cy + 6, 4, 3, '#9CC8E8');
  const hx = cx - 62;
  R(g, hx - 3, cy + 4, 6, 3, INK); R(g, hx, cy + 7, 1, 20, '#2A2A2A'); R(g, hx - 1, cy + 27, 3, 3, Gy[0]);
  line(g, hx, cy + 30, hx - 10, cy + 36, '#2A2A2A'); line(g, hx, cy + 30, hx + 10, cy + 36, '#2A2A2A');
  R(g, hx - 13, cy + 35, 26, 4, INK); R(g, hx - 12, cy + 36, 24, 2, Stl[2]); R(g, hx - 12, cy + 36, 24, 1, Stl[4]);
  // (the flag at the steel's corner)
  R(g, x0 - 6, top - 22, 1, 60, Gy[2]);
  R(g, x0 - 6, top - 23, 16, 10, INK); for (let k = 0; k < 4; k++) R(g, x0 - 5, top - 22 + k * 2, 14, 2, k % 2 ? '#F4F0E8' : '#B91C1C'); R(g, x0 - 5, top - 22, 6, 4, '#1E3A8A'); R(g, x0 - 4, top - 21, 1, 1, '#FFFFFF'); R(g, x0 - 2, top - 20, 1, 1, '#FFFFFF');
  // (the excavator at the left: tracks, the cab, the boom up and bent at its elbow, the bucket down in the dirt)
  {
    const ex = -84, ey = -10;
    R(g, ex - 9, ey - 4, 20, 5, INK); R(g, ex - 8, ey - 3, 18, 3, '#2A2A2E'); for (let k = 0; k < 5; k++) R(g, ex - 7 + k * 4, ey - 2, 2, 1, '#6A6A72');
    R(g, ex - 7, ey - 13, 14, 9, INK); R(g, ex - 6, ey - 12, 12, 7, Yl[2]); R(g, ex - 6, ey - 12, 12, 1, Yl[4]); R(g, ex + 1, ey - 11, 4, 4, '#9CC8E8');
    line(g, ex + 5, ey - 10, ex + 13, ey - 24, INK, 4); line(g, ex + 13, ey - 24, ex + 21, ey - 12, INK, 4); line(g, ex + 5, ey - 10, ex + 13, ey - 24, Yl[2], 2); line(g, ex + 13, ey - 24, ex + 21, ey - 12, Yl[3], 2);
    poly(g, [ex + 18, ey - 12, ex + 25, ey - 12, ex + 23, ey - 5, ex + 19, ey - 6], INK, false); R(g, ex + 20, ey - 11, 4, 4, Gy[1]);
  }
  // (the hoarding along the front on its posts, striped at the foot; the sign on it; cones; a portable toilet)
  for (let x = -60; x <= 52; x += 16) R(g, x, -20, 2, 20, '#5A4A3A');
  R(g, -63, -24, 118, 16, INK); R(g, -62, -23, 116, 14, '#E5E7EB'); R(g, -62, -23, 116, 1, '#FFFFFF'); for (let x = -62; x < 54; x += 12) R(g, x, -23, 1, 14, '#9CA3AF');
  for (let x = -62; x < 54; x += 6) R(g, x, -11, 3, 2, (x / 6) % 2 ? '#111827' : '#FDE047');
  R(g, -58, -22, 108, 10, '#1D4ED8'); R(g, -58, -22, 108, 1, '#6A9CF4'); txt(g, 'AMERICA: COMING SOON', -3.5, -14, '#F8FAFC', 5);
  for (const x of [-72, -20, 30]) { poly(g, [x - 3, -6, x, -14, x + 3, -6], INK, false); poly(g, [x - 2, -6, x, -13, x + 2, -6], '#F97316', false); R(g, x - 1, -10, 2, 1, '#F8FAFC'); R(g, x - 3, -6, 6, 1, '#F97316'); }
  // (what's left of the statue, in the dirt past the crane: the crowned head on its side, cracked, staring; the torch
  // stuck up out of the heap)
  {
    const tx = 76;
    R(g, tx - 2, -30, 4, 22, INK); R(g, tx - 1, -29, 2, 21, Cu[2]); R(g, tx, -29, 1, 21, Cu[4]);
    R(g, tx - 5, -33, 10, 4, INK); R(g, tx - 4, -32, 8, 2, Cu[3]); R(g, tx - 4, -32, 8, 1, Cu[4]);
    poly(g, [tx - 3, -33, tx - 2, -39, tx, -43, tx + 2, -38, tx + 3, -33], INK, false); poly(g, [tx - 2, -33, tx - 1, -38, tx, -41, tx + 1, -37, tx + 2, -33], '#F2C84A', false); R(g, tx, -38, 1, 4, '#FFF6C0');
    g.save(); g.translate(85, -7); g.rotate(0.8);
    for (let k = -2; k <= 2; k++) { poly(g, [k * 3 - 2, -15, k * 3.6, -25 + Math.abs(k) * 2, k * 3 + 2, -15], INK, false); poly(g, [k * 3 - 1, -15, k * 3.6, -23 + Math.abs(k) * 2, k * 3 + 1, -15], Cu[k > 0 ? 4 : 2], false); }
    ell(g, 0, -7, 8, 9, Cu[2]); ell(g, 2, -9, 4.5, 5.5, Cu[3], false); R(g, -8, -16, 16, 2, INK); R(g, -7, -16, 14, 1, Cu[4]);
    R(g, -5, -10, 3, 2, INK); R(g, 1, -10, 3, 2, INK); R(g, -4, -10, 1, 1, '#FFFFFF'); R(g, 2, -10, 1, 1, '#FFFFFF'); R(g, -1, -8, 1, 4, Cu[0]); R(g, -3, -2, 5, 1, Cu[0]);
    line(g, 4, -15, 1, -9, Cu[0]); line(g, 1, -9, 5, -4, Cu[0]);
    g.restore();
    poly(g, [78, -5, 86, -8, 99, -5, 99, 0, 76, 0], Dirt[2], false); R(g, 80, -6, 16, 1, Dirt[4]);
  }
  R(g, -99, -22, 9, 14, INK); R(g, -98, -21, 7, 12, '#2E7AC8'); R(g, -98, -21, 7, 1, '#8AC0F0'); R(g, -96, -18, 3, 8, '#1E5A9A'); R(g, -99, -24, 9, 2, '#E5E7EB');
};
