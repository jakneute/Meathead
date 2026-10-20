// THE BROOM PORT, painted (the SNES pass): a Quidditch-ish broom port out on the castle's side for the final trial.
//
//   THE STANDS      (STAND_D) along the back of the deck: six tiers of benches packed with guests (seeded: skin, coats,
//                   hats, a pink cone hat, foam fingers and pennants waved), a painted hoarding along their front in the
//                   houses' colors with the park's gilt crest, a striped canopy over the top; tall stand towers between
//                   them hung with house drapes, a box of guests up top under a cone and its flag; bunting slung tower
//                   to tower; THE SCOREBOARD up on the middle tower (FINAL TRIAL TODAY / PRIZE: THE HIGHEST WINDOW; on
//                   a revisit: NO FLIGHTS TODAY). Revisited (the brooms flown), the stands are empty: bare benches.
//   THE HOOPS       (HOOP_D) two sets of three gold rings up on striped poles, one at either end
//   THE DECK        going back to the stands: planks along it in bands, a painted center line, chevrons at its start,
//                   landing lights in rows (lit after dark); and coming toward him (bent), lit along the edge
//   IN FRONT        wind socks on striped poles (blowing, live; a lantern up top), the broom racks (full of brooms till
//                   the trial's flown; bare after)

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay } from '../../timeOfDay';
import { bendFloor } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import { type Ctx, type View, INK, box, mix, hash, at, still, stillAt, seen, polyF, lit, gilt, dimmed, SNOW, LIP } from '../kit';
import { signText } from '../../signLetters';
import { X, Y, GY, RUNWAY, DECK } from './layout';
import { STAND_D, HOOP_D, PALE, ROOF, PINK, DECK as PLANK, GOLD, IRON, TIMBER, R, RC, cone, guest } from './paint';
import { Q, clipAt, onScreenV, run } from './view';

const PORT = { a: RUNWAY + 40, b: DECK.b + 600 };
const STAND_H = 240, TOWERS = [9080, 9720, 10360, 11000, 11640, 12280], TOWER_H = 430, SCORE = 10680;
const HOUSES: [string, string][] = [['#B02A42', '#E0AE3A'], ['#1E7A4A', '#C8CCD4'], ['#2E4EA8', '#B07A4A'], ['#D8A020', '#26242E']];
const SOCKS = [9420, 11300, 11750], RACKS = [9300, 11500];
const HOOPS: [number, number][] = [[9560, 250], [9640, 330], [9720, 270], [11380, 270], [11460, 350], [11540, 250]];
/** The wind socks' lanterns (art.ts's lamps). */
export const PORT_SCONCES: [number, number][] = SOCKS.map(x => [x + 1, 196]);

// ---------------------------------------------------------------------------------------------------------------
// The stands

const paintStands = (g: Ctx, w: number, sx: number, empty: boolean) => {
  const W = R(PLANK), S = R(PALE), Ir = R(IRON), Pk = R(PINK);
  // (the back wall behind the top tier, the canopy over it: pink and white stripes, scalloped, on iron posts)
  box(g, -10, -STAND_H - 40, w + 20, 44, INK); box(g, -10, -STAND_H - 39, w + 20, 42, S[2]);
  for (let k = -(sx % 26); k < w + 10; k += 26) { box(g, k, -STAND_H - 39, 1, 42, S[1]); }
  for (let k = -(sx % 80); k < w + 10; k += 80) { box(g, k - 2, -STAND_H - 74, 4, 40, INK); box(g, k - 1, -STAND_H - 74, 2, 40, Ir[4]); }
  polyF(g, [[-10, -STAND_H - 72], [w + 10, -STAND_H - 72], [w + 10, -STAND_H - 54], [-10, -STAND_H - 54]], INK);
  for (let k = -(sx % 24) - 24; k < w + 10; k += 24) { box(g, k, -STAND_H - 71, 12, 16, Pk[3]); box(g, k + 12, -STAND_H - 71, 12, 16, '#F4F0FA'); box(g, k, -STAND_H - 71, 12, 2, Pk[5]); g.fillStyle = INK; g.beginPath(); g.arc(k + 6, -STAND_H - 55, 6, 0, Math.PI); g.fill(); g.fillStyle = (Math.floor((k + sx) / 24) % 2) ? '#F4F0FA' : Pk[3]; g.beginPath(); g.arc(k + 6, -STAND_H - 55, 5, 0, Math.PI); g.fill(); }
  box(g, -10, -STAND_H - 74, w + 20, 3, R(SNOW)[4]);
  // (the tiers: a bench, its riser, guests packed along it)
  const rows = 6, rh = (STAND_H - 44) / rows;
  for (let r = rows - 1; r >= 0; r--) {
    const y = -44 - r * rh;
    box(g, -10, y - rh, w + 20, rh, W[1]); box(g, -10, y - rh, w + 20, 1, W[0]);
    box(g, -10, y - 8, w + 20, 6, INK); box(g, -10, y - 7, w + 20, 4, W[3]); box(g, -10, y - 7, w + 20, 1, W[5]);
    for (let k = -(sx % 40); k < w + 10; k += 40) box(g, k, y - 3, 3, 3, Ir[2]);
    if (empty) { for (let k = 0; k < w; k += 97) if (hash(k + sx + r) > 0.8) { box(g, k, y - 12, 6, 4, ['#F4F0FA', '#F49AC8', '#E0AE3A'][r % 3]); } continue; }
    for (let k = -(sx % 9); k < w + 9; k += 9) {
      const id = Math.floor((k + sx) / 9) * 7 + r * 131;
      if (hash(id * 0.37) < 0.08) continue;
      guest(g, k + hash(id) * 3, y - 6, id, 1.15, dimmed, hash(id * 1.9) > 0.86);
      const t = hash(id * 2.7);
      if (t > 0.93) { box(g, k + 4, y - 36, 1, 14, INK); polyF(g, [[k + 5, y - 36], [k + 15, y - 33], [k + 5, y - 30]], HOUSES[id % 4][0]); }
      else if (t > 0.9) { box(g, k + 4, y - 34, 3, 10, '#F49AC8'); box(g, k + 5, y - 37, 1, 3, '#F49AC8'); }
    }
  }
  // (the hoarding along the front: panels in the houses' colors, the park's crest on some)
  box(g, -10, -44, w + 20, 44, INK);
  for (let k = -(sx % 120) - 120; k < w + 10; k += 120) {
    const hidx = Math.floor((k + sx) / 120) & 3, [m, t] = HOUSES[hidx], Mm = RC(m), Tt = RC(t);
    box(g, k + 1, -43, 118, 42, Mm[3]); box(g, k + 1, -43, 118, 3, Mm[5]); box(g, k + 1, -4, 118, 3, Mm[1]);
    box(g, k + 5, -38, 110, 2, Tt[3]); box(g, k + 5, -8, 110, 2, Tt[3]);
    polyF(g, [[k + 48, -34], [k + 72, -34], [k + 72, -20], [k + 60, -12], [k + 48, -20]], INK); polyF(g, [[k + 49, -33], [k + 71, -33], [k + 71, -21], [k + 60, -14], [k + 49, -21]], Tt[3]);
    polyF(g, [[k + 52, -30], [k + 54, -26], [k + 58, -30], [k + 60, -24], [k + 62, -30], [k + 66, -26], [k + 68, -30], [k + 68, -22], [k + 52, -22]], Mm[3]);
  }
  box(g, -10, -2, w + 20, 2, W[0]);
};

const paintTower = (g: Ctx, idx: number, empty: boolean) => {
  const Tm = R(TIMBER), Gd = R(GOLD), Rf = R(ROOF), [m, t] = HOUSES[idx % 4], Mm = RC(m), Tt = RC(t);
  // (the tower: a timber frame clad in planks, cross braces; the house drapes down its front)
  box(g, -41, -TOWER_H, 82, TOWER_H, INK); box(g, -40, -TOWER_H, 80, TOWER_H, Tm[2]);
  for (let k = -40; k < 40; k += 8) { box(g, k, -TOWER_H, 1, TOWER_H, Tm[1]); box(g, k + 1, -TOWER_H, 2, TOWER_H, Tm[3]); }
  for (let y = -TOWER_H + 60; y < -10; y += 70) { g.strokeStyle = Tm[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(-38, y); g.lineTo(38, y + 60); g.moveTo(38, y); g.lineTo(-38, y + 60); g.stroke(); }
  for (const [x0, col] of [[-30, Mm], [8, Tt]] as const) {
    polyF(g, [[x0 - 1, -TOWER_H + 70], [x0 + 23, -TOWER_H + 70], [x0 + 23, -40], [x0 + 11, -54], [x0 - 1, -40]], INK);
    polyF(g, [[x0, -TOWER_H + 71], [x0 + 22, -TOWER_H + 71], [x0 + 22, -41], [x0 + 11, -52], [x0, -41]], col[3]);
    for (let k = 0; k < 3; k++) { box(g, x0 + k * 8, -TOWER_H + 71, 2, TOWER_H - 120, col[4]); box(g, x0 + k * 8 + 5, -TOWER_H + 71, 2, TOWER_H - 120, col[2]); }
    box(g, x0, -TOWER_H + 74, 22, 3, Gd[3]);
  }
  // (the box up top: a rail, guests leaning on it, its cone roof and a flag in the house's color)
  box(g, -50, -TOWER_H - 6, 100, 8, INK); box(g, -49, -TOWER_H - 5, 98, 6, Tm[4]); box(g, -49, -TOWER_H - 5, 98, 1, Tm[5]);
  if (!empty) for (let k = -44; k < 44; k += 9) guest(g, k, -TOWER_H - 4, idx * 37 + k, 1.2, dimmed, hash(idx + k) > 0.8);
  for (let k = -48; k <= 48; k += 8) box(g, k, -TOWER_H + 2, 2, 14, Tm[1]);
  box(g, -50, -TOWER_H + 14, 100, 4, Tm[3]);
  for (const px of [-46, 44]) { box(g, px - 1, -TOWER_H - 50, 4, 46, INK); box(g, px, -TOWER_H - 50, 2, 46, Tm[3]); }
  cone(g, 0, -TOWER_H - 50, 56, 70, idx % 2 ? Rf : Mm, Gd, m);
};

const paintScoreboard = (g: Ctx, done: boolean) => {
  const Gd = R(GOLD), Ir = R(IRON);
  const bw = 300, bh = 96;
  box(g, -bw / 2 - 6, -bh - 6, bw + 12, bh + 12, INK); box(g, -bw / 2 - 5, -bh - 5, bw + 10, bh + 10, Gd[3]); box(g, -bw / 2 - 5, -bh - 5, bw + 10, 2, Gd[5]); box(g, -bw / 2 - 2, -bh - 2, bw + 4, bh + 4, Gd[1]);
  box(g, -bw / 2, -bh, bw, bh, '#140C24'); for (let y = -bh; y < 0; y += 3) box(g, -bw / 2, y, bw, 1, '#1E1434');
  for (let k = -bw / 2 + 6; k < bw / 2; k += 12) { box(g, k, -bh - 12, 4, 6, INK); box(g, k + 1, -bh - 11, 2, 4, lit() ? '#FFE9A8' : Gd[4]); }
  polyF(g, [[-40, -bh - 6], [-30, -bh - 30], [-14, -bh - 16], [0, -bh - 40], [14, -bh - 16], [30, -bh - 30], [40, -bh - 6]], INK);
  polyF(g, [[-38, -bh - 7], [-30, -bh - 27], [-14, -bh - 14], [0, -bh - 37], [14, -bh - 14], [30, -bh - 27], [38, -bh - 7]], Gd[3]); box(g, -2, -bh - 30, 4, 4, '#F472B6');
  for (const px of [-bw / 2 + 30, bw / 2 - 34]) { box(g, px - 3, 0, 8, 60, INK); box(g, px - 2, 0, 6, 60, Ir[3]); }
  const bulb = (s: string, y: number, col: string) => signText(g, s, 0, y, { sx: 2, sy: 2, gap: 1, fill: [mix(col, '#FFFFFF', 0.5), col, col, mix(col, '#000000', 0.25)], dither: true, shadow: '#000000' });
  if (done) { bulb('NO FLIGHTS', -54, '#F87171'); bulb('TODAY', -24, '#F87171'); }
  else { bulb('FINAL TRIAL', -66, '#FDE68A'); signText(g, 'LAST MAN FLYING GETS', 0, -38, gilt(1)); signText(g, 'THE HIGHEST WINDOW', 0, -22, gilt(1)); box(g, -60, -14, 120, 1, '#5A4A7A'); signText(g, 'BROOMSTICK DEATHMATCH', 0, -5, { sx: 1, sy: 1, gap: 1, fill: ['#FFD0E8', '#F49AC8', '#F49AC8', '#C8508E'], dither: true }); }
};

const paintHoop = (g: Ctx, h: number) => {
  const Gd = R(GOLD), Ir = R(IRON), Pk = R(PINK);
  box(g, -12, -10, 24, 10, INK); box(g, -11, -9, 22, 9, Ir[3]); box(g, -11, -9, 22, 2, Ir[5]);
  box(g, -4, -h + 22, 8, h - 30, INK);
  for (let y = -h + 22; y < -8; y += 16) { box(g, -3, y, 6, 8, Gd[3]); box(g, -3, y + 8, 6, 8, '#F4F0FA'); box(g, -3, y, 2, 16, Gd[5]); }
  for (const [lw, col] of [[9, INK], [6, Gd[2]], [3, Gd[4]]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(0, -h, 22, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = Gd[5]; g.lineWidth = 1; g.beginPath(); g.arc(0, -h, 23, Math.PI * 1.05, Math.PI * 1.5); g.stroke();
  polyF(g, [[0, -h + 22], [6, -h + 30], [0, -h + 34], [-6, -h + 30]], Pk[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// The deck

const deckBack = (c: Ctx, v: View) => {
  const [a, b] = clipAt(v, X(PORT.a - 80), X(PORT.b), STAND_D);
  if (b <= a) return;
  const W = R(PLANK), n = 12;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - ((1 - STAND_D) * i) / n, d1 = 1 - ((1 - STAND_D) * (i + 1)) / n;
    Q(c, v, a, b, d0, d1, W[i % 2 ? 3 : 4 - (i > 6 ? 1 : 0)]);
    const [p, y] = at(v.eye, a, GY, d1), [q] = at(v.eye, b, GY, d1); box(c, p, Math.round(y), q - p, 1, W[1]);
    // (the boards' butt joints, staggered, running back to the eye)
    for (let x = Math.floor(a / 90) * 90 + (i % 2) * 45; x < b; x += 90) { const [s0, t0] = at(v.eye, x, GY, d0), [s1, t1] = at(v.eye, x, GY, d1); c.strokeStyle = W[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(s0, t0); c.lineTo(s1, t1); c.stroke(); }
  }
  // (the painted center line, dashed; the edge lines; chevrons at the start)
  const dl = 0.86;
  for (let x = Math.floor(a / 80) * 80; x < b; x += 80) polyF(c, [at(v.eye, x, GY, dl + 0.008), at(v.eye, x + 44, GY, dl + 0.008), at(v.eye, x + 44, GY, dl - 0.008), at(v.eye, x, GY, dl - 0.008)], mix('#F4F4F5', W[3], 0.25));
  for (const de of [0.97, 0.74]) Q(c, v, a, b, de + 0.004, de - 0.004, mix('#F6D365', W[3], 0.3));
  for (let k = 0; k < 4; k++) { const x = X(RUNWAY + 140 + k * 40); polyF(c, [at(v.eye, x, GY, 0.95), at(v.eye, x + 26, GY, 0.86), at(v.eye, x, GY, 0.77), at(v.eye, x - 12, GY, 0.77), at(v.eye, x + 14, GY, 0.86), at(v.eye, x - 12, GY, 0.95)], mix('#F472B6', W[3], 0.25)); }
  // (landing lights in two rows along it, lit after dark)
  const on = lit();
  for (const de of [0.95, 0.78]) for (let x = Math.floor(a / 120) * 120; x < b; x += 120) {
    const [sx, sy] = at(v.eye, x, GY, de), s = de;
    box(c, sx - 3 * s, sy - 3 * s, 6 * s + 1, 3 * s + 1, INK); box(c, sx - 2 * s, sy - 2 * s, 4 * s, 2 * s, on ? '#FDE68A' : '#8A8494');
    if (on) { c.globalAlpha = 0.2 + 0.1 * Math.sin(v.f * 0.1 + x * 0.01); c.fillStyle = '#FDE68A'; c.fillRect(Math.round(sx - 8), Math.round(sy - 6), 16, 8); c.globalAlpha = 1; }
  }
  // (snow swept up along the stands' foot)
  const Sn = R(SNOW);
  Q(c, v, a, b, STAND_D + 0.02, STAND_D, Sn[3]);
};

const nearDeck = (c: Ctx) => {
  const W = R(PLANK, false);
  return tilePattern(c, `fa-kp-deck-${timeOfDay().key}`, 120, 64, g => {
    box(g, 0, 0, 120, 64, W[3]);
    for (let r = 0; r < 8; r++) {
      const y = r * 8;
      box(g, 0, y, 120, 1, W[1]); box(g, 0, y + 1, 120, 1, W[4]);
      const jx = ((r * 47) % 120); box(g, jx, y, 1, 8, W[1]); box(g, jx + 1, y + 1, 1, 7, W[4]);
      for (let k = 0; k < 120; k += 30) box(g, (k + jx + 6) % 120, y + 3, 1, 1, W[0]);
      if (r % 3 === 1) box(g, (jx + 40) % 120, y + 3, 24, 2, W[2]);
    }
  });
};
const drawNearDeck = (c: Ctx, state: GameState, v: View) => {
  const a = X(RUNWAY), b = X(PORT.b), L = state.camera.x - 40, Rr = state.camera.x + CANVAS_WIDTH + 40;
  const s = Math.max(a, L), e = Math.min(b, Rr);
  if (e <= s) return;
  const W = R(PLANK, false);
  box(c, s, GY, e - s, 700, W[2]);
  c.fillStyle = nearDeck(c); c.fillRect(s, GY + 8, e - s, 600);
  // (a painted edge line, the trial's runway dashes)
  box(c, s, GY + 22, e - s, 3, '#E8DCC0'); box(c, s, GY + 22, e - s, 1, '#FFFFFF');
  for (let x = Math.floor(s / 100) * 100; x < e; x += 100) { box(c, x, GY + 64, 56, 6, '#E8E4D8'); box(c, x, GY + 64, 56, 1, '#FFFFFF'); }
  bendFloor(c, v.eye, GY, GY, GY + 140, a, b);
  // (the edge he walks along: a timber nosing, lit; the landing lights along it)
  box(c, s, GY, e - s, 8, W[4]); box(c, s, GY + 6, e - s, 2, W[1]);
  for (let x = Math.floor(s / 60) * 60; x < e; x += 60) { box(c, x, GY + 2, 2, 2, W[0]); }
  box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
  const on = lit();
  for (let x = Math.floor(s / 160) * 160 + 40; x < e; x += 160) { box(c, x - 4, GY + 9, 8, 4, INK); box(c, x - 3, GY + 10, 6, 2, on ? '#FDE68A' : '#9A94AE'); }
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the wind socks and the broom racks

const sock = (c: Ctx, x: number, f: number) => {
  still(c, 'kp-sockpole', x, GY, -12, -210, 30, 214, g => {
    const Ir = R(IRON, false), Gd = R(GOLD, false);
    box(g, -8, -10, 16, 10, INK); box(g, -7, -9, 14, 9, Ir[3]); box(g, -7, -9, 14, 2, Ir[5]);
    box(g, -3, -186, 6, 178, INK); for (let y = -186; y < -8; y += 20) { box(g, -2, y, 4, 10, '#E8E4EC'); box(g, -2, y + 10, 4, 10, '#C81E3A'); } box(g, -2, -186, 1, 178, '#FFFFFF');
    box(g, -6, -196, 12, 12, INK); box(g, -5, -195, 10, 10, lit() ? '#FFE9A8' : '#B8B4C8'); box(g, -5, -195, 3, 10, lit() ? '#FFF6D8' : '#D8D4E4'); box(g, -7, -198, 14, 3, Gd[3]); box(g, -1, -204, 2, 6, Gd[3]);
  });
  const w = Math.sin(f * 0.05 + x) * 4, droop = Math.sin(f * 0.031 + x * 0.3) * 0.12;
  for (let k = 0; k < 5; k++) {
    const x0 = x + 3 + k * 11, x1 = x0 + 11, ya = GY - 180 + k * 1.5 + w * k * 0.2 + droop * k * 10, yb = GY - 180 + (k + 1) * 1.5 + w * (k + 1) * 0.2 + droop * (k + 1) * 10, ha = 14 - k * 1.6, hb = 14 - (k + 1) * 1.6;
    polyF(c, [[x0, ya - 1], [x1, yb - 1], [x1, yb + hb + 1], [x0, ya + ha + 1]], INK);
    polyF(c, [[x0, ya], [x1, yb], [x1, yb + hb], [x0, ya + ha]], k % 2 ? '#F4F4F5' : '#F97316');
    polyF(c, [[x0, ya], [x1, yb], [x1, yb + 2], [x0, ya + 2]], k % 2 ? '#FFFFFF' : '#FDBA74');
  }
};
const rack = (c: Ctx, x: number, done: boolean) => {
  still(c, `kp-rack-${done ? 'bare' : 'full'}`, x, GY, -14, -130, 150, 134, g => {
    const Tm = R(TIMBER, false), Ir = R(IRON, false), Bs = R(['#5A4018', '#7A5A24', '#A07A34', '#C8A050', '#E0C070', '#F4E0A0'], false);
    for (const dx of [0, 114]) { box(g, dx - 1, -100, 8, 100, INK); box(g, dx, -100, 6, 100, Tm[3]); box(g, dx, -100, 2, 100, Tm[5]); }
    for (const y of [-96, -34]) { box(g, -2, y - 1, 124, 8, INK); box(g, -1, y, 122, 6, Tm[3]); box(g, -1, y, 122, 1, Tm[5]); for (let k = 10; k < 120; k += 18) box(g, k, y + 1, 4, 4, Tm[1]); }
    box(g, 30, -118, 60, 14, INK); box(g, 31, -117, 58, 12, Tm[2]); for (let k = 0; k < 6; k++) box(g, 36 + k * 9, -113, 5, 4, R(GOLD, false)[3]);
    if (done) { box(g, 50, -30, 22, 3, Ir[3]); return; }
    for (let k = 0; k < 6; k++) {
      const bx = 12 + k * 18;
      box(g, bx - 1, -124, 5, 104, INK); box(g, bx, -124, 3, 104, Tm[4]); box(g, bx, -124, 1, 104, Tm[5]);
      polyF(g, [[bx - 7, -2], [bx + 10, -2], [bx + 6, -22], [bx - 3, -22]], INK); polyF(g, [[bx - 6, -3], [bx + 9, -3], [bx + 5, -21], [bx - 2, -21]], Bs[3]);
      for (let j = -5; j < 9; j += 2) box(g, bx + j, -18, 1, 15, Bs[j % 4 ? 2 : 4]);
      box(g, bx - 3, -24, 9, 3, '#B91C1C');
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** The broom port, by layer: 'back' (the stands, the hoops, the deck going back), 'ground' (the deck coming toward
 *  him), 'near' (wind socks, racks); 'mid' is for nothing yet. */
export const drawPort = (c: Ctx, state: GameState, v: View, done: boolean, layer: 'back' | 'mid' | 'ground' | 'near') => {
  if (!seen(v, X(PORT.a - 300), X(PORT.b), STAND_D, 120)) return;
  const f = state.frame;
  if (layer === 'back') {
    run(c, v, STAND_D, `stands-${done ? 'e' : 'f'}`, PORT.a, PORT.b, 0, STAND_H + 80, (g, w, sx) => paintStands(g, w, sx, done));
    TOWERS.forEach((rx, i) => {
      if (!seen(v, X(rx) - 70, X(rx) + 70, STAND_D, 60)) return;
      stillAt(c, v, STAND_D, `kp-stower-${i}-${done ? 'e' : 'f'}`, X(rx), GY, -64, -TOWER_H - 160, 128, TOWER_H + 164, g => paintTower(g, i, done));
    });
    // (bunting slung tower to tower)
    for (let i = 0; i < TOWERS.length - 1; i++) {
      const a = X(TOWERS[i] + 40), b = X(TOWERS[i + 1] - 40), y0 = Y(TOWER_H - 30);
      if (!seen(v, a, b, STAND_D, 20)) continue;
      for (let k = 0; k < 24; k++) {
        const t = k / 24, t2 = (k + 1) / 24, [sx, sy] = at(v.eye, a + (b - a) * t, y0 + 4 * 60 * t * (1 - t), STAND_D), [ex, ey] = at(v.eye, a + (b - a) * t2, y0 + 4 * 60 * t2 * (1 - t2), STAND_D);
        c.strokeStyle = dimmed('#3A3448'); c.lineWidth = 1; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
        const col = dimmed(['#F472B6', '#FDE68A', '#60A5FA', '#4ADE80', '#F4F0FA'][k % 5]), sw = Math.sin(f * 0.08 + k) * 1.5;
        polyF(c, [[sx, sy], [ex, ey], [(sx + ex) / 2 + sw, (sy + ey) / 2 + 9]], col);
      }
    }
    if (seen(v, X(SCORE) - 170, X(SCORE) + 170, STAND_D, 40)) stillAt(c, v, STAND_D, `kp-score-${done ? 'done' : 'on'}`, X(SCORE), Y(STAND_H + 150), -170, -150, 340, 220, g => paintScoreboard(g, done));
    deckBack(c, v);
    HOOPS.forEach(([rx, h], i) => { if (seen(v, X(rx) - 40, X(rx) + 40, HOOP_D, 40)) stillAt(c, v, HOOP_D, `kp-hoop-${i}`, X(rx), GY, -34, -h - 40, 68, h + 44, g => paintHoop(g, h)); });
  } else if (layer === 'ground') {
    drawNearDeck(c, state, v);
  } else if (layer === 'near') {
    for (const x of SOCKS) if (onScreenV(v, X(x) - 30, X(x) + 90)) sock(c, X(x), f);
    for (const x of RACKS) if (onScreenV(v, X(x) - 30, X(x) + 150)) rack(c, X(x), done);
  }
};

/** After dark: the landing lights along the deck, the stand towers' boxes, the scoreboard. */
export const portLamps = (state: GameState, v: View): Light[] => {
  const out: Light[] = [];
  const add = (x: number, y: number, r: number, a: number, color: string) => { if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r, a, color }); };
  for (let rx = PORT.a; rx < PORT.b; rx += 400) add(X(rx), Y(10), 110, 0.35, '#FDE68A');
  for (const rx of TOWERS) { const [x, y] = at(v.eye, X(rx), Y(TOWER_H + 10), STAND_D); add(x, y, 120, 0.3, '#FFD08A'); }
  const [sx, sy] = at(v.eye, X(SCORE), Y(STAND_H + 200), STAND_D); add(sx, sy, 180, 0.35, '#FDE68A');
  return out;
};
