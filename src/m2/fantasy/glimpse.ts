// Fairy Land's attractions as glimpsed from far off: one painter each, matched to how the attraction itself looks now
// (wheel/art.ts, tragons/steel.ts and station.ts), so every section's backdrop that shows it shows the same thing, and
// the park's neighbors on the horizon (Jungle Land's temple on one side, Hollywood Land's hill and its sign on the
// other). For far layers painted once for the hour into a tile or a stamp: `T` is the layer's own haze-and-hour tint.
//
//   THE FAIRY WHEEL      lilac lattice trusses in an A on stone plinths, the double lavender rim laced in a zigzag, the
//                        spokes pink and mint in turn, the big pink flower at the hub with its gold heart, the toadstool
//                        gondolas (pink, mint, lilac, peach caps, white spots, little wings), the pixie lights after dark
//   TRUELLING TRAGONS    three tracks in the dragons' colors (LIGHTNING yellow on purple, FIRE orange on red, ICE blue
//                        on blue) on steel lattice legs, knotted round their loops; the snow-capped plaster mountain
//                        and its tunnel mouth; the load station with its three dragon heads over the roof
//   THE NEIGHBORS        Jungle Land's broken-topped temple over its crowns; Hollywood Land's dry hill with its
//                        white letters

import { box, mix, hash, checker, INK, type Ctx } from './kit';

// (the attractions' own colors, copied here so a far layer needn't pull their whole sections in: wheel/art.ts CAPS,
// tragons/layout.ts LANE_COL)
const CAPS = ['#F49AC8', '#9EE6C8', '#C8A8F4', '#FFC8A0'];
const LANE_COL: [string, string, string][] = [['#FACC15', '#FEF9C3', '#6D28D9'], ['#EA580C', '#FDBA74', '#991B1B'], ['#38BDF8', '#F0F9FF', '#1D4ED8']];

type Tint = (c: string) => string;
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** Shade, itself, lit, highlight. */
const r4 = (T: Tint, col: string) => [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.3)), T(mix(col, '#FFFFFF', 0.6))];
const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
const PIXIE = ['#FEF08A', '#A5F3FC', '#F9A8D4', '#FFFFFF', '#BBF7D0'];

/** THE FAIRY WHEEL far off: its hub at (cx, cy), `r` the rim, its plinths' feet on `foot`. */
export const farWheel = (g: Ctx, T: Tint, cx: number, cy: number, r: number, foot: number, lamps: boolean) => {
  const S = r4(T, '#B8A4DC'), St = r4(T, '#968EB4'), Pk = r4(T, '#F49AC8'), Mn = r4(T, '#9EE6C8'), Lv = r4(T, '#C8A8F4'), Gd = r4(T, '#F2C84A');
  const k = r / 80;
  // (the A-frame: a lattice truss each side, from a stone plinth up to the axle)
  for (const s of [-1, 1]) {
    const fx = cx + s * r * 0.62;
    line(g, fx, foot - 6 * k, cx, cy, Math.max(3, 5 * k), T(INK)); line(g, fx, foot - 6 * k, cx, cy, Math.max(2, 3 * k), S[s < 0 ? 2 : 1]);
    const n = Math.max(4, Math.round(r / 14));
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; line(g, fx + (cx - fx) * t0 + s * 3 * k * (i % 2 ? 1 : -1), foot - 6 * k + (cy - foot + 6 * k) * t0, fx + (cx - fx) * t1 - s * 3 * k * (i % 2 ? 1 : -1), foot - 6 * k + (cy - foot + 6 * k) * t1, 1, S[0]); }
    box(g, fx - 8 * k, foot - 8 * k, 16 * k, 8 * k, T(INK)); box(g, fx - 7 * k, foot - 7 * k, 14 * k, 7 * k, St[1]); box(g, fx - 7 * k, foot - 7 * k, 14 * k, 2, St[3]); box(g, fx - 7 * k, foot - 8 * k, 14 * k, 1, T('#FFFFFF'));
  }
  // (the spokes, pink and mint in turn)
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, M = i % 2 ? Pk : Mn; line(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(1, 1.6 * k), M[1]); }
  // (the double rim, laced in a zigzag between)
  for (const [rr, w] of [[r, Math.max(2, 3.4 * k)], [r * 0.78, Math.max(1, 2.2 * k)]] as const) {
    g.strokeStyle = T(INK); g.lineWidth = w + 2; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = Lv[1]; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = Lv[3]; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, rr - w * 0.3, Math.PI * 0.95, Math.PI * 1.75); g.stroke();
  }
  g.strokeStyle = Lv[0]; g.lineWidth = 1; g.beginPath();
  for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, rr = i % 2 ? r : r * 0.78, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  // (the pixie lights round the rim after dark)
  if (lamps) for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; box(g, cx + Math.cos(a) * (r + 2) - 1, cy + Math.sin(a) * (r + 2) - 1, 2, 2, PIXIE[i % 5]); }
  // (the toadstool gondolas, hanging plumb: a white stalk, the spotted cap, its little wings)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13, gx = cx + Math.cos(a) * r, gy = cy + Math.sin(a) * r, cw = Math.max(5, 8 * k), C = r4(T, CAPS[i % CAPS.length]);
    box(g, gx, gy, 1, 3 * k, T('#4A3E6A'));
    poly(g, [[gx - cw * 1.1, gy + 4 * k], [gx + 0.5, gy + 4 * k - cw * 0.8], [gx + cw * 1.1 + 1, gy + 4 * k]], T('#F4F0FA'));
    poly(g, [[gx - cw * 1.1, gy + 4 * k], [gx + 0.5, gy + 4 * k - cw * 0.5], [gx + cw * 1.1 + 1, gy + 4 * k]], T('#C8C4DA'));
    box(g, gx - cw, gy + 4 * k, cw * 2 + 1, Math.max(3, 5 * k), T(INK)); box(g, gx - cw + 1, gy + 4 * k, cw * 2 - 1, Math.max(2, 4 * k), C[1]);
    box(g, gx - cw + 1, gy + 4 * k, cw * 2 - 1, 1, C[2]); box(g, gx + cw * 0.4, gy + 5 * k, cw * 0.6, Math.max(1, 3 * k), C[0]);
    box(g, gx - cw * 0.5, gy + 4 * k + 1, 1, 1, T('#FFFFFF')); box(g, gx + cw * 0.2, gy + 5 * k, 1, 1, T('#FFFFFF'));
    box(g, gx - cw * 0.3, gy + 8 * k, cw * 0.8, Math.max(1, 3 * k), T('#E8E0D0'));
    if (lamps) box(g, gx - 1, gy + 6 * k, 2, 2, '#FFE9A8');
  }
  // (the hub: the big pink flower, its gold middle and heart)
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.fillStyle = Pk[i % 2 ? 1 : 2]; g.beginPath(); g.ellipse(cx + Math.cos(a) * 7 * k, cy + Math.sin(a) * 7 * k, 5 * k, 3 * k, a, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = Gd[1]; g.beginPath(); g.arc(cx, cy, 4.5 * k, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#E0408A'); g.beginPath(); g.arc(cx - 1.4 * k, cy - 0.6 * k, 1.6 * k, 0, Math.PI * 2); g.arc(cx + 1.4 * k, cy - 0.6 * k, 1.6 * k, 0, Math.PI * 2); g.fill();
  poly(g, [[cx - 3 * k, cy], [cx, cy + 3 * k], [cx + 3 * k, cy]], T('#E0408A'));
};

/** TRUELLING TRAGONS far off, x0..x1 along `base` (the ground). */
export const farTragons = (g: Ctx, T: Tint, x0: number, x1: number, base: number, lamps: boolean) => {
  const w = x1 - x0, St = r4(T, '#7A84A0');
  const trackY = (k: number, x: number) => base - 44 - Math.sin((x - x0) * (11 / w) + k * 2.1) * 22 - Math.sin((x - x0) * (26 / w) + k) * 10 - k * 6;
  // (the mountain: snow-capped plaster in steps, a tunnel mouth at its foot, the tracks diving in)
  const mx = x0 + w * 0.56, mh = 96, mw = 90;
  const Rk = r4(T, '#8A7A88'), Sn = r4(T, '#E8EEF8');
  poly(g, [[mx - mw, base], [mx - mw * 0.5, base - mh * 0.55], [mx - mw * 0.18, base - mh * 0.92], [mx, base - mh], [mx + mw * 0.22, base - mh * 0.84], [mx + mw * 0.55, base - mh * 0.5], [mx + mw, base]], Rk[1]);
  poly(g, [[mx - mw, base], [mx - mw * 0.5, base - mh * 0.55], [mx - mw * 0.18, base - mh * 0.92], [mx, base - mh], [mx - mw * 0.1, base - mh * 0.4], [mx - mw * 0.4, base]], Rk[2]);
  poly(g, [[mx + mw * 0.3, base - mh * 0.7], [mx + mw * 0.55, base - mh * 0.5], [mx + mw, base], [mx + mw * 0.5, base]], Rk[0]);
  poly(g, [[mx - mw * 0.3, base - mh * 0.7], [mx - mw * 0.18, base - mh * 0.92], [mx, base - mh], [mx + mw * 0.22, base - mh * 0.84], [mx + mw * 0.3, base - mh * 0.7], [mx + mw * 0.12, base - mh * 0.74], [mx, base - mh * 0.66], [mx - mw * 0.14, base - mh * 0.76]], Sn[2]);
  poly(g, [[mx - mw * 0.3, base - mh * 0.7], [mx - mw * 0.18, base - mh * 0.92], [mx, base - mh], [mx - mw * 0.1, base - mh * 0.72]], Sn[3]);
  for (let k = 0; k < 7; k++) { const sx = mx - mw * 0.6 + k * mw * 0.18, sy = base - mh * (0.2 + hash(k * 3.7) * 0.3); box(g, sx, sy, 8, 1, Rk[0]); box(g, sx + 1, sy - 1, 5, 1, Sn[1]); }
  g.fillStyle = T('#0B0612'); g.beginPath(); g.ellipse(mx - mw * 0.2, base - 14, 12, 14, 0, Math.PI, 0); g.fill(); box(g, mx - mw * 0.2 - 12, base - 14, 24, 14, T('#0B0612'));
  // (the legs: steel lattice from each track down to the park)
  for (let x = x0; x < x1; x += 12) for (let k = 0; k < 3; k++) {
    if (Math.abs(x - mx) < mw * 0.6) continue;
    const y = trackY(k, x); box(g, x, y + 3, 2, base - y - 3, St[0]); box(g, x, y + 3, 1, base - y - 3, St[1]);
    if ((x / 12) % 2 === 0) line(g, x, y + 8, x + 12, base, 1, St[0]);
  }
  // (the three tracks, each its color on its dark spine, a loop standing up off it)
  for (let k = 0; k < 3; k++) {
    const [main, light, dark] = LANE_COL[k];
    for (const [col, lw, dy] of [[mix(dark, INK, 0.3), 5, 1], [main, 2, 0], [light, 1, -1]] as const) {
      g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath();
      let on = false;
      for (let x = x0; x <= x1; x += 3) { const y = trackY(k, x) + dy, hide = Math.abs(x - (mx - mw * 0.2)) < mw * 0.45 && y > base - mh * 0.6; if (hide) { on = false; continue; } on ? g.lineTo(x, y) : g.moveTo(x, y); on = true; }
      g.stroke();
    }
    const lx = x0 + w * (0.14 + k * 0.13) + (k === 2 ? w * 0.42 : 0), ly = trackY(k, lx) - 24;
    for (const [col, lw] of [[mix(dark, INK, 0.3), 5], [main, 2]] as const) { g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath(); g.ellipse(lx, ly, 15, 24, 0, 0, Math.PI * 2); g.stroke(); }
    box(g, lx - 1, ly + 24, 2, base - ly - 24, St[0]);
    if (lamps) for (let i = 0; i < 10; i++) { const x = x0 + ((i * 37 + k * 13) % w); if (Math.abs(x - mx) > mw * 0.6) box(g, x, trackY(k, x) + 2, 1, 1, T(light)); }
  }
  // (the load station: a castle-stone hall, a snowy slate roof, the three dragon heads up over it)
  const sx = x1 - 34, S2 = r4(T, '#9A92B4');
  box(g, sx - 30, base - 34, 60, 34, T(INK)); box(g, sx - 29, base - 33, 58, 33, S2[1]); box(g, sx - 29, base - 33, 10, 33, S2[2]); box(g, sx + 19, base - 33, 10, 33, S2[0]);
  for (let y = base - 27; y < base; y += 6) box(g, sx - 29, y, 58, 1, S2[0]);
  for (let k = 0; k < 3; k++) { const wx = sx - 20 + k * 16; box(g, wx, base - 26, 6, 12, T(INK)); box(g, wx + 1, base - 25, 4, 10, lamps ? '#FFD88A' : T(LANE_COL[k][0])); }
  poly(g, [[sx - 34, base - 33], [sx, base - 54], [sx + 34, base - 33]], T('#363A58')); poly(g, [[sx - 34, base - 33], [sx, base - 54], [sx - 6, base - 33]], T('#4E5474'));
  box(g, sx - 34, base - 35, 68, 2, T('#F4F8FF'));
  for (let k = 0; k < 3; k++) {
    const hx = sx - 22 + k * 22, hy = base - 56 - (k === 1 ? 8 : 0), C = r4(T, LANE_COL[k][0]);
    poly(g, [[hx - 5, hy + 12], [hx - 4, hy], [hx + 6, hy - 2], [hx + 10, hy + 3], [hx + 3, hy + 5], [hx + 2, hy + 12]], T(INK));
    poly(g, [[hx - 4, hy + 11], [hx - 3, hy + 1], [hx + 5, hy - 1], [hx + 9, hy + 3], [hx + 2, hy + 4], [hx + 1, hy + 11]], C[1]);
    box(g, hx - 3, hy + 1, 2, 9, C[2]); box(g, hx + 3, hy + 1, 1, 1, T('#FFFFFF'));
    poly(g, [[hx - 3, hy + 1], [hx - 6, hy - 5], [hx - 1, hy]], C[0]);
  }
};

/** Jungle Land's temple over its crowns, far on the park's horizon (`foot` the horizon). */
export const farJungle = (g: Ctx, T: Tint, x: number, foot: number) => {
  const S = r4(T, '#9A9488'), M = r4(T, '#4D7C0F'), L = r4(T, '#2F6B22');
  for (let k = 0; k < 5; k++) {
    const w = 64 - k * 11, h = 7, y = foot - 6 - (k + 1) * h, x0 = x - w / 2;
    box(g, x0, y, w, h, S[1]); box(g, x0, y, w, 1, S[3]); box(g, x0 + w - 5, y, 5, h, S[0]);
    if (k < 4) for (let j = 0; j < w; j += 6) if (hash(j + k * 13) > 0.6) box(g, x0 + j, y + 1, 2, 4, M[1]);
  }
  box(g, x - 4, foot - 18, 8, 12, T('#1A140E'));
  box(g, x - 6, foot - 6 - 5 * 7 - 4, 9, 4, S[1]); box(g, x + 2, foot - 6 - 5 * 7 - 2, 4, 2, S[2]);
  for (let k = -70; k < 70; k += 9) { const r = 6 + hash(k) * 6, y = foot - 2 - hash(k * 3) * 6; g.fillStyle = L[0]; g.beginPath(); g.arc(x + k, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = L[1]; g.beginPath(); g.arc(x + k - 1, y - 1, r * 0.75, 0, Math.PI * 2); g.fill(); checker(g, x + k - r * 0.5, y - r * 0.4, r, 1, L[2]); }
};

/** Hollywood Land's dry hill and its white letters, far on the park's horizon. */
export const farHollywood = (g: Ctx, T: Tint, x: number, foot: number) => {
  const H = r4(T, '#A88A62'), Sc = r4(T, '#5E6A3A');
  const y = (u: number) => foot - 38 * Math.max(0, 1 - Math.abs(u) ** 1.6) - 4 * Math.sin(u * 7);
  g.fillStyle = H[1]; g.beginPath(); g.moveTo(x - 90, foot); for (let k = -90; k <= 90; k += 3) g.lineTo(x + k, y(k / 90)); g.lineTo(x + 90, foot); g.closePath(); g.fill();
  for (let k = -90; k < 0; k += 3) box(g, x + k, y(k / 90), 3, 3, H[2]);
  for (let k = 0; k < 90; k += 3) box(g, x + k, y(k / 90), 3, 6, H[0]);
  for (let k = 0; k < 16; k++) box(g, x - 80 + hash(k * 2.3) * 160, foot - 4 - hash(k * 5.1) * 18, 3, 2, Sc[1]);
  for (let k = 0; k < 9; k++) { const lx = x - 34 + k * 8, ly = y((lx - x) / 90) + 8; box(g, lx, ly, 5, 7, T('#F4F2EA')); box(g, lx + 4, ly, 1, 7, T('#B8B4AA')); }
};
