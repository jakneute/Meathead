// The buildings along the back of each land's stretch of the hub (stamped with the stretch: stretch.ts puts them in),
// at the lands' own SNES detail (bkit.ts). Each stands square on to the hub's one eye, its tops going back toward it.
//
//   FUTURE LAND   TOMORROW HALL (a folded-plate pavilion over a band of glass, terrazzo, its neon), the moon rocket on
//                 its pad and gantry, the SPACE DOME (a geodesic, its entrance tube), the SAUCER DINER up on its stalk
//   WILDERNESS    the GENERAL STORE's false front, the fort's stockade and blockhouse, the water tower on its trestle
//   SPOOKY        the haunted house (a crooked Victorian: clapboard, a mansard and a tower, shutters hanging, the porch),
//                 the mausoleum, the cemetery behind its wall and gate
//   CARTOON       the toadstool cottage, the crooked tall shop, the candy-striped water tower smiling, giant lollipops
//   AMERICA USA   the last of Main Street's shopfronts either side of the way out
//   HOLLYWOOD     HAPPYWOOD STUDIOS' gate (deco pylons, the arch, the guard booth), STAGE 7, the camera crane
//   FAIRY         half-timbered cottages, the castle wall and its banners, the storybook tower
//   JUNGLE        the bamboo trading post, the tiki, the carved ruin, the fake rock the falls come down
//   FOREIGN       the onion dome, the Bavarian front, the Spanish arcade, the pagoda
//
// Layout's as it was (each at its old place round its spot's middle, the portal clear between).

import {
  type Ctx, type Pt, INK, mix, hash, checker, box, R6, poly, polyI, seg, back, wall, bricks, clapboard, boards, ashlar, plaster, corrugated, rivets,
  win, door, sconce, flatTop, gableBack, eaveRoof, awning, gutter, chimney, ventPipe, board, hangSign, planter, poster, banner, bulbs,
} from './bkit';
import { ROW } from './geometry';
import { signText } from '../signLetters';
import { PLASTER, TIMBER, SLATE, STONE as FSTONE, GOLD } from '../fantasy/kit';
import { stripes } from '../cartoon/kit';

const B = ROW.back;
/** How far back a building's tops show (its depth, as the scale it shrinks to at its back). */
const S = 0.9;
type Facade = (g: Ctx, cx: number, lit: boolean) => void;
type L = Parameters<typeof signText>[4];

// ---------------------------------------------------------------------------------------------------------------
// FUTURE LAND

const CHROME = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0', '#FFFFFF'];
const TEAL = R6('#22BCAC'), PINK = R6('#E8659E'), CREAM = R6('#F2EEE2');
const neon = (lit: boolean, col: string) => (lit ? mix(col, '#FFFFFF', 0.35) : mix(col, '#9AA0B0', 0.35));
const futureLook = (lit: boolean): L => ({ sx: 1, sy: 1, fill: lit ? ['#FFFFFF', '#BDF4FF', '#7DF9FF', '#22BCAC'] : ['#F8FAFC', '#CFF4F0', '#7ED8CE', '#1E8A80'], dither: true, glow: lit ? '#0E5A6A' : undefined });

const tomorrowHall = (g: Ctx, x: number, lit: boolean) => {
  // (a low pavilion: terrazzo plinth, a band of glass between slim columns, a folded-plate roof zigzagging over)
  const w = 140, x0 = x - w / 2, h = 50, top = B - h;
  box(g, x0 - 4, B - 6, w + 8, 6, INK); box(g, x0 - 3, B - 5, w + 6, 5, CREAM[3]); for (let k = 0; k < w; k += 5) box(g, x0 + k, B - 4 + (k % 3), 1, 1, k % 2 ? '#E8659E' : '#22BCAC');
  wall(g, x0, top, w, h - 6, CREAM);
  for (let k = 0; k < 6; k++) { const wx = x0 + 6 + k * 22; win(g, wx, top + 12, 16, h - 24, lit, { frame: '#AEBAD0', sill: false, trans: false, mull: 1, glass: '#7FD6E8', seed: k + 31 }); }
  for (let k = 0; k <= 6; k++) { const cxk = x0 + 3 + k * 22; box(g, cxk - 1, top + 8, 3, h - 14, INK); box(g, cxk, top + 8, 1, h - 14, CHROME[4]); }
  // (the roof: plates folded up and down, each lit on its left face, shaded on its right; their tops going back)
  const n = 7, pw = (w + 16) / n, ry = top + 2;
  for (let k = 0; k < n; k++) {
    const a = x0 - 8 + k * pw, m = a + pw / 2, b = a + pw;
    const up: Pt = [m, ry - 16], l: Pt = [a, ry], r: Pt = [b, ry];
    poly(g, [l, up, back(up[0], up[1], x, S), back(l[0], l[1], x, S)], CHROME[3]);
    poly(g, [up, r, back(r[0], r[1], x, S), back(up[0], up[1], x, S)], CHROME[2]);
    polyI(g, [l, up, [m, ry + 4]], CHROME[4]); polyI(g, [up, r, [m, ry + 4]], CHROME[2]);
    seg(g, [a + 2, ry - 1], [m - 1, ry - 14], CHROME[5]);
  }
  box(g, x0 - 8, ry + 2, w + 16, 3, INK); box(g, x0 - 8, ry + 2, w + 16, 2, neon(lit, '#E8659E'));
  // (the sign on its pylon: a starburst, TOMORROW HALL)
  const px = x0 + 18;
  box(g, px - 2, top - 44, 5, 44, INK); box(g, px - 1, top - 44, 3, 44, CHROME[3]);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; seg(g, [px, top - 50], [px + Math.cos(a) * 9, top - 50 + Math.sin(a) * 9], neon(lit, k % 2 ? '#22BCAC' : '#FDE68A'), 2); }
  box(g, px - 2, top - 52, 5, 5, neon(lit, '#FFFFFF'));
  board(g, x0 + 84, top - 9, 86, 14, 'TOMORROW HALL', futureLook(lit), '#1E2448', '#AEBAD0');
};
const moonRocket = (g: Ctx, x: number, lit: boolean) => {
  // (the gantry: a lattice tower, its arms out to the rocket, a lift cage)
  const gx = x + 26, top = B - 150;
  box(g, gx - 1, top - 1, 14, B - top + 1, INK); box(g, gx, top, 12, B - top, '#B91C1C');
  g.strokeStyle = '#7F1D1D'; g.lineWidth = 1; g.beginPath(); for (let y = top; y < B; y += 10) { g.moveTo(gx, y); g.lineTo(gx + 12, y + 10); g.moveTo(gx + 12, y); g.lineTo(gx, y + 10); } g.stroke();
  box(g, gx, top, 2, B - top, '#F87171');
  for (const ay of [top + 30, top + 80]) { box(g, gx - 14, ay, 15, 3, INK); box(g, gx - 14, ay, 15, 2, '#DC2626'); }
  box(g, gx + 2, top + 54, 8, 10, INK); box(g, gx + 3, top + 55, 6, 8, lit ? '#FFF4C8' : '#9CC8E8');
  // (the rocket: its body in columns across (lit at its left), the bands, portholes, the nose, the fins)
  const rx = x - 4, rw = 24, rtop = B - 128;
  for (let u = 0; u < rw; u += 2) box(g, rx - rw / 2 + u, rtop, 2, B - 24 - rtop, CHROME[u < 4 ? 4 : u < 8 ? 5 : u < 14 ? 4 : u < 19 ? 3 : 2]);
  box(g, rx - rw / 2 - 1, rtop, 1, B - 24 - rtop, INK); box(g, rx + rw / 2, rtop, 1, B - 24 - rtop, INK);
  for (const by of [rtop + 20, B - 50]) { box(g, rx - rw / 2, by, rw, 5, PINK[3]); box(g, rx - rw / 2, by, rw, 1, PINK[5]); box(g, rx + rw / 2 - 5, by, 5, 5, PINK[1]); }
  for (const py of [rtop + 36, rtop + 56]) { g.fillStyle = INK; g.beginPath(); g.arc(rx, py, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[3]; g.beginPath(); g.arc(rx, py, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = lit ? '#FFD87A' : '#3B5A8A'; g.beginPath(); g.arc(rx, py, 2.5, 0, Math.PI * 2); g.fill(); box(g, rx - 2, py - 2, 1, 1, '#FFFFFF'); }
  polyI(g, [[rx - rw / 2, rtop], [rx, rtop - 34], [rx + rw / 2, rtop]], PINK[3]); poly(g, [[rx - rw / 2 + 1, rtop], [rx, rtop - 32], [rx - 4, rtop]], PINK[4]); poly(g, [[rx + 5, rtop], [rx, rtop - 32], [rx + rw / 2 - 1, rtop]], PINK[1]);
  for (const s of [-1, 1]) polyI(g, [[rx + s * rw / 2, B - 60], [rx + s * (rw / 2 + 14), B - 26], [rx + s * (rw / 2 + 14), B - 14], [rx + s * rw / 2, B - 24]], s < 0 ? PINK[3] : PINK[1]);
  polyI(g, [[rx - 5, B - 60], [rx + 5, B - 60], [rx + 4, B - 16], [rx - 4, B - 16]], PINK[2]);
  // (the pad: a stepped concrete drum, hazard banded, its top going back)
  flatTop(g, x - 34, x + 42, B - 14, x, S, R6('#A8A29E'));
  box(g, x - 35, B - 15, 78, 15, INK); box(g, x - 34, B - 14, 76, 14, '#C8C2B8'); box(g, x - 34, B - 14, 76, 2, '#E7E5E4');
  for (let k = 0; k < 76; k += 8) box(g, x - 34 + k, B - 5, 4, 5, k % 16 ? '#1C1A1E' : '#E8B400');
  box(g, rx - 8, B - 24, 16, 10, INK); box(g, rx - 7, B - 23, 14, 9, CHROME[1]);
};
const spaceDome = (g: Ctx, x: number, lit: boolean) => {
  // (a geodesic: triangles in rings, each a step of its own by which way it faces (lit up at its left), its seams inked;
  // the entrance tube coming out of it, its canopy; SPACE DOME over it)
  const r = 54, cy = B - 4;
  g.fillStyle = INK; g.beginPath(); g.arc(x, cy, r + 1, Math.PI, 0); g.fill();
  const rings = 5, seg2 = 10;
  for (let i = 0; i < rings; i++) {
    const a0 = (i / rings) * (Math.PI / 2), a1 = ((i + 1) / rings) * (Math.PI / 2), n = Math.max(3, seg2 - i * 2);
    for (let k = 0; k < n * 2; k++) {
      const t0 = Math.PI + (k / (n * 2)) * Math.PI, t1 = Math.PI + ((k + 1) / (n * 2)) * Math.PI;
      const p = (a: number, t: number): Pt => [x + Math.cos(t) * Math.cos(a) * r, cy + Math.sin(t) * Math.cos(a) * r - Math.sin(a) * 0];
      const P0 = p(a0, t0), P1 = p(a0, t1), Q0 = p(a1, t0), Q1 = p(a1, t1);
      const lum = Math.cos(((t0 + t1) / 2 - Math.PI * 1.25)) * 0.5 + 0.5 - i * 0.04;
      const col = CHROME[lum > 0.85 ? 5 : lum > 0.65 ? 4 : lum > 0.4 ? 3 : lum > 0.2 ? 2 : 1];
      poly(g, [P0, P1, Q1], col); poly(g, [P0, Q1, Q0], mix(col, CHROME[1], 0.18));
    }
  }
  g.strokeStyle = 'rgba(26, 16, 40, 0.45)'; g.lineWidth = 1;
  for (let i = 1; i < rings; i++) { const rr = Math.cos((i / rings) * (Math.PI / 2)) * r; g.beginPath(); g.arc(x, cy, rr, Math.PI, 0); g.stroke(); }
  for (let k = 0; k <= 10; k++) { const t = Math.PI + (k / 10) * Math.PI; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(t) * r, cy + Math.sin(t) * r); g.stroke(); }
  // (a band of portholes round its foot, lit after dark)
  for (let k = 0; k < 7; k++) { const t = Math.PI * 1.08 + (k / 6) * Math.PI * 0.84, px = x + Math.cos(t) * r * 0.86, py = cy + Math.sin(t) * r * 0.3 - 6; box(g, px - 3, py - 3, 6, 6, INK); box(g, px - 2, py - 2, 4, 4, lit ? '#FFD87A' : '#3B5A8A'); }
  // (the tube: banded chrome, its canopy in teal, the doors)
  box(g, x - 20, B - 26, 40, 26, INK); for (let u = 0; u < 38; u += 2) box(g, x - 19 + u, B - 25, 2, 25, CHROME[u < 6 ? 4 : u < 16 ? 5 : u < 28 ? 3 : 2]);
  for (let k = 0; k < 4; k++) box(g, x - 19, B - 22 + k * 6, 38, 1, CHROME[1]);
  box(g, x - 9, B - 18, 18, 18, INK); box(g, x - 8, B - 17, 16, 17, lit ? '#FFE8A0' : '#2E4A6A'); box(g, x, B - 17, 1, 17, INK);
  box(g, x - 26, B - 32, 52, 6, INK); box(g, x - 25, B - 31, 50, 4, TEAL[3]); box(g, x - 25, B - 31, 50, 1, TEAL[5]);
};
const saucerDiner = (g: Ctx, x: number, lit: boolean) => {
  // (the stalk: a tapering column, the lift glass up it; the saucer: its underside stepped, a band of windows round it
  // (lit after dark), the rim in chrome, a dome on top with its antenna; SAUCER DINER in neon)
  const top = B - 96;
  poly(g, [[x - 12, B], [x - 5, top], [x + 5, top], [x + 12, B]], INK);
  for (let u = -10; u < 10; u += 2) { const t = (u + 10) / 20; poly(g, [[x + u, B], [x + u * 0.4, top], [x + (u + 2) * 0.4, top], [x + u + 2, B]], CHROME[t < 0.2 ? 4 : t < 0.5 ? 3 : t < 0.8 ? 2 : 1]); }
  box(g, x - 2, top + 4, 4, B - top - 8, lit ? '#FFF4C8' : '#7FD6E8'); box(g, x - 2, top + 30, 4, 6, PINK[2]);
  const sy = top - 6, rx = 58;
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, sy + 6, rx * 0.7, 12, 0, 0, Math.PI); g.fill();
  for (let k = 0; k < 4; k++) { g.fillStyle = [CHROME[1], CHROME[2], CHROME[2], CHROME[3]][k]; g.beginPath(); g.ellipse(x, sy + 6, rx * 0.7 - k * 8, 11 - k * 2.5, 0, 0, Math.PI); g.fill(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, sy, rx + 1, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[3]; g.beginPath(); g.ellipse(x, sy, rx, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[4]; g.beginPath(); g.ellipse(x - 4, sy - 2, rx - 6, 5, 0, Math.PI, Math.PI * 2); g.fill();
  box(g, x - rx + 4, sy + 1, rx * 2 - 8, 4, INK);
  for (let k = 0; k < 14; k++) box(g, x - rx + 6 + k * 8, sy + 2, 6, 2, lit ? '#FFD87A' : '#3B5A8A');
  box(g, x - rx, sy - 1, rx * 2, 1, neon(lit, '#E8659E'));
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, sy - 6, 24, 15, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#9CDCEC'; g.beginPath(); g.ellipse(x, sy - 6, 23, 14, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#DDF4FA'; g.beginPath(); g.ellipse(x - 7, sy - 12, 8, 5, -0.3, 0, Math.PI * 2); g.fill();
  if (lit) for (let k = 0; k < 3; k++) box(g, x - 12 + k * 10, sy - 12, 3, 5, '#4A2A14');
  box(g, x, sy - 34, 1, 14, CHROME[1]); box(g, x - 1, sy - 37, 3, 3, neon(lit, '#E8659E'));
  board(g, x, B - 46, 62, 14, 'SAUCER DINER', futureLook(lit), '#1E2448', '#AEBAD0');
};

// ---------------------------------------------------------------------------------------------------------------
// WILDERNESS LAND

const WOOD = R6('#A07444'), LOG = R6('#8A5A32'), DARKWOOD = R6('#5E3E22');
const westLook = (big = false): L => ({ sx: 1, sy: big ? 2 : 1, fill: ['#3A2208', '#2A1608'], dither: true });

const generalStore = (g: Ctx, x0: number, lit: boolean) => {
  const w = 88, h = 76, top = B - h, x = x0 + w / 2;
  // (the false front: boards up and down, stepped top with its cornice and brackets, the sign painted on boards)
  box(g, x0 - 1, top - 1, w + 2, h + 1, INK);
  boards(g, x0, top, w, h, WOOD, 3);
  box(g, x0 + 16, top - 14, w - 32, 15, INK); boards(g, x0 + 17, top - 13, w - 34, 14, WOOD, 8);
  box(g, x0 + 30, top - 22, w - 60, 9, INK); boards(g, x0 + 31, top - 21, w - 62, 8, WOOD, 11);
  for (const [a, b, y] of [[x0 - 2, x0 + w + 2, top], [x0 + 14, x0 + w - 14, top - 14], [x0 + 28, x0 + w - 28, top - 22]] as const) { box(g, a, y - 3, b - a, 4, INK); box(g, a + 1, y - 2, b - a - 2, 2, DARKWOOD[4]); box(g, a + 1, y, b - a - 2, 1, DARKWOOD[1]); }
  for (let bx = x0 + 4; bx < x0 + w - 2; bx += 12) { box(g, bx, top + 1, 3, 5, DARKWOOD[2]); box(g, bx, top + 1, 1, 5, DARKWOOD[4]); }
  box(g, x0 + 6, top + 15, w - 12, 15, INK); boards(g, x0 + 7, top + 16, w - 14, 13, R6('#F2E6C4'), 21, 9);
  signText(g, 'GENERAL STORE', x, top + 26, westLook());
  // (upstairs windows, frames, a sash up, curtains)
  win(g, x0 + 12, top + 33, 12, 7, lit, { frame: '#E8DCC0', curtain: '#B91C1C', seed: 2, trans: false }); win(g, x0 + w - 24, top + 33, 12, 7, lit, { frame: '#E8DCC0', curtain: '#B91C1C', seed: 3, trans: false });
  // (the porch: its roof of tin going back, on posts, the boardwalk, the hitching rail, barrels, a lantern)
  eaveRoof(g, x0 - 4, x0 + w + 4, B - 34, 6, x, S, R6('#8A929C'), 'tin', 2);
  for (const px of [x0 - 2, x0 + w / 2 - 18, x0 + w / 2 + 15, x0 + w - 1]) { box(g, px - 1, B - 34, 5, 32, INK); box(g, px, B - 34, 3, 32, DARKWOOD[3]); box(g, px, B - 34, 1, 32, DARKWOOD[4]); box(g, px - 2, B - 34, 7, 3, DARKWOOD[2]); }
  win(g, x0 + 6, B - 27, 18, 18, lit, { frame: '#5E3E22', mull: 2, seed: 4, glass: '#7A9AB0' });
  win(g, x0 + w - 24, B - 27, 18, 18, lit, { frame: '#5E3E22', mull: 2, seed: 5, glass: '#7A9AB0' });
  door(g, x - 7, B - 4, 14, 24, '#4A2E18', { frame: '#5E3E22', glass: true, lit });
  box(g, x0 - 8, B - 5, w + 16, 5, INK); boards(g, x0 - 7, B - 4, w + 14, 4, DARKWOOD, 9, 6);
  for (const bx of [x0 + 2, x0 + 12]) { box(g, bx - 1, B - 15, 10, 11, INK); box(g, bx, B - 14, 8, 10, '#8A5A32'); box(g, bx, B - 12, 8, 1, '#3F3F46'); box(g, bx, B - 7, 8, 1, '#3F3F46'); box(g, bx, B - 14, 2, 10, '#B07A48'); }
  box(g, x0 + w + 4, B - 16, 18, 2, INK); box(g, x0 + w + 4, B - 15, 18, 1, DARKWOOD[4]); for (const px of [x0 + w + 5, x0 + w + 19]) box(g, px, B - 14, 2, 10, DARKWOOD[2]);
  sconce(g, x + 12, B - 30, lit);
};
const stockade = (g: Ctx, x0: number, x1: number, lit: boolean) => {
  // (pointed logs, bark in streaks, lit down their left, the walkway behind showing over, lashings, the gate's beam)
  for (let x = x0; x < x1; x += 9) {
    const h = 64 + (hash(x) - 0.5) * 8, top = B - h;
    polyI(g, [[x, B], [x, top], [x + 4.5, top - 7], [x + 9, top], [x + 9, B]], LOG[3]);
    box(g, x + 1, top, 2, h, LOG[4]); box(g, x + 6, top, 2, h, LOG[1]);
    for (let k = 0; k < 4; k++) box(g, x + 3 + (k % 2), top + 8 + hash(x + k) * (h - 16), 1, 6, LOG[2]);
    poly(g, [[x + 1, top], [x + 4.5, top - 6], [x + 4.5, top]], LOG[5]);
    box(g, x + 2, B - 46, 6, 2, '#C8A060');
  }
  box(g, x0, B - 47, x1 - x0, 1, INK);
  void lit;
};
const blockhouse = (g: Ctx, x: number, lit: boolean) => {
  // (logs laid across, the corners notched, the upper story overhanging, loopholes, a shingled pyramid roof going back)
  const lower = (x0: number, y: number, w: number, h: number, R: string[]) => {
    box(g, x0 - 1, y - 1, w + 2, h + 1, INK);
    for (let yy = y, k = 0; yy < y + h; yy += 6, k++) { box(g, x0, yy, w, 6, R[k % 2 ? 3 : 2]); box(g, x0, yy, w, 1, R[4]); box(g, x0, yy + 5, w, 1, R[1]); for (const ex of [x0 - 3, x0 + w - 1]) { box(g, ex, yy, 4, 6, R[1]); box(g, ex, yy + 1, 4, 4, R[3]); box(g, ex + 1, yy + 2, 2, 2, R[4]); } }
    box(g, x0, y, 3, h, mix(R[4], R[3], 0.3));
  };
  lower(x - 22, B - 96, 44, 96, R6('#7A4E2A'));
  box(g, x - 34, B - 97, 68, 4, INK); for (let k = 0; k < 6; k++) box(g, x - 30 + k * 12, B - 93, 4, 6, DARKWOOD[1]);
  lower(x - 30, B - 136, 60, 40, LOG);
  for (const lx of [-18, 0, 18]) { box(g, x + lx - 2, B - 122, 4, 9, INK); box(g, x + lx - 1, B - 121, 2, 7, lit ? '#F0A83E' : '#1A0E06'); }
  for (const lx of [-10, 10]) { box(g, x + lx - 2, B - 70, 4, 8, INK); box(g, x + lx - 1, B - 69, 2, 6, '#1A0E06'); }
  // (the door: planks, iron straps)
  door(g, x - 8, B, 16, 26, '#5E3E22', { frame: '#3A2208', planks: true });
  const R = R6('#6A4428'), py = B - 136, apex: Pt = [x, py - 26];
  gableBack(g, x - 38, x + 38, py, apex[0], apex[1], x, S, R, 5);
  polyI(g, [[x - 38, py], apex, [x + 38, py]], R[2]);
  for (let k = 1; k < 5; k++) { const t = k / 5; seg(g, [x - 38 + 38 * t, py - 26 * t], [x + 38 - 38 * t, py - 26 * t], R[1]); }
  for (let k = 0; k < 8; k++) box(g, x - 30 + k * 8, py - 3, 1, 3, R[0]);
  box(g, x - 40, py, 80, 2, INK);
};
const waterTower = (g: Ctx, x: number, lit: boolean) => {
  // (the trestle: four legs, X braced with rods and turnbuckles; the tank: staves, iron hoops riveted; a conical roof
  // shingled, its finial; the spout swung up; a ladder up a leg)
  const T = DARKWOOD, St = R6('#9A6A3E'), I = R6('#4A4A52');
  for (const lx of [-22, -8, 8, 22]) { box(g, x + lx - 2, B - 94, 5, 94, INK); box(g, x + lx - 1, B - 94, 3, 94, T[3]); box(g, x + lx - 1, B - 94, 1, 94, T[4]); }
  g.strokeStyle = I[2]; g.lineWidth = 1; g.beginPath(); for (const [ya, yb] of [[B - 90, B - 50], [B - 50, B - 10]]) { g.moveTo(x - 22, yb); g.lineTo(x + 22, ya); g.moveTo(x + 22, yb); g.lineTo(x - 22, ya); } g.stroke();
  for (const yy of [B - 50, B - 90]) { box(g, x - 24, yy, 48, 3, INK); box(g, x - 23, yy, 46, 2, T[2]); }
  for (let yy = B - 86; yy < B - 4; yy += 5) box(g, x + 25, yy, 6, 1, T[1]); box(g, x + 24, B - 90, 1, 88, T[1]); box(g, x + 31, B - 90, 1, 88, T[1]);
  // (the tank)
  const tw = 56, tt = B - 140, tb = B - 92;
  box(g, x - tw / 2 - 1, tt - 1, tw + 2, tb - tt + 2, INK);
  for (let u = 0; u < tw; u += 4) { const t = u / tw; box(g, x - tw / 2 + u, tt, 4, tb - tt, St[t < 0.1 ? 4 : t < 0.3 ? 5 : t < 0.55 ? 4 : t < 0.8 ? 3 : 2]); box(g, x - tw / 2 + u, tt, 1, tb - tt, St[1]); }
  for (let k = 0; k < 4; k++) { const hy = tt + 6 + k * 12; box(g, x - tw / 2, hy, tw, 3, I[2]); box(g, x - tw / 2, hy, tw, 1, I[4]); rivets(g, x - tw / 2 + 3, x + tw / 2, hy + 1, 7, I); }
  checker(g, x - tw / 2, tb - 10, tw, 10, St[1]);
  // (the roof)
  const R = R6('#6A4428'), apex: Pt = [x, tt - 24];
  gableBack(g, x - tw / 2 - 5, x + tw / 2 + 5, tt, apex[0], apex[1], x, S, R, 4);
  polyI(g, [[x - tw / 2 - 5, tt], apex, [x + tw / 2 + 5, tt]], R[3]);
  poly(g, [[x - tw / 2 - 4, tt - 1], apex, [x - 6, tt - 1]], R[4]);
  for (let k = 1; k < 4; k++) { const t = k / 4; seg(g, [x - (tw / 2 + 5) * (1 - t), tt - 24 * t], [x + (tw / 2 + 5) * (1 - t), tt - 24 * t], R[1]); }
  box(g, x - 1, tt - 32, 2, 9, I[2]); box(g, x - 2, tt - 34, 4, 3, I[4]);
  // (the spout, swung up)
  box(g, x + tw / 2, B - 108, 18, 4, INK); box(g, x + tw / 2, B - 107, 18, 2, I[3]); box(g, x + tw / 2 + 16, B - 108, 4, 16, INK); box(g, x + tw / 2 + 17, B - 107, 2, 14, I[3]);
  void lit;
};

// ---------------------------------------------------------------------------------------------------------------
// SPOOKY LAND

const GHOUL = R6('#5A5268'), SLATEP = R6('#2E2440'), BONE = R6('#B4AEBE');
const sickGlow = (lit: boolean) => (lit ? '#D9F99D' : '#5A5468');

const hauntedHouse = (g: Ctx, x0: number, lit: boolean) => {
  const w = 124, h = 116, top = B - h, x = x0 + w / 2;
  // (the tower on its corner first, its candle-snuffer roof going back, a lit window up it)
  const tx = x0 + w - 14, tw = 30, tt = B - 168;
  wall(g, tx - tw / 2, tt, tw, B - tt, GHOUL); clapboard(g, tx - tw / 2 + 3, tt, tw - 8, B - tt, GHOUL, 9, 5);
  box(g, tx - tw / 2, tt, 3, B - tt, GHOUL[4]); box(g, tx + tw / 2 - 5, tt, 5, B - tt, GHOUL[1]);
  win(g, tx - 5, tt + 16, 10, 16, lit, { frame: '#3B3049', arch: true, glass: '#4A4458', on: true, seed: 66 });
  gableBack(g, tx - tw / 2 - 6, tx + tw / 2 + 6, tt, tx + 3, tt - 54, tx, S, SLATEP, 6);
  polyI(g, [[tx - tw / 2 - 6, tt], [tx + 3, tt - 54], [tx + tw / 2 + 6, tt]], SLATEP[2]);
  for (let k = 1; k < 7; k++) { const t = k / 7, yy = tt - 54 * t, hw = (tw / 2 + 6) * (1 - t); for (let xx = tx - hw; xx < tx + hw; xx += 4) box(g, xx + 3 * t, yy, 3, 2, (xx / 4 + k) % 2 < 1 ? SLATEP[1] : SLATEP[3]); }
  box(g, tx + 2, tt - 66, 2, 14, INK); poly(g, [[tx + 4, tt - 66], [tx + 14, tt - 62], [tx + 4, tt - 59]], '#5A1010');
  // (the house: clapboard gone gray-violet, its boards sprung here and there; a mansard of fish-scale slate going back)
  wall(g, x0, top, w - 20, h, GHOUL);
  clapboard(g, x0 + 4, top, w - 28, h, GHOUL, 4, 5);
  box(g, x0, top, 4, h, GHOUL[4]); box(g, x0 + w - 28, top, 8, h, GHOUL[2]);
  for (let k = 0; k < 5; k++) { const bx = x0 + 10 + hash(k * 7) * (w - 40), by = top + 10 + hash(k * 3) * (h - 30); box(g, bx, by, 10, 2, GHOUL[1]); box(g, bx + 9, by - 1, 2, 2, GHOUL[1]); }
  const my = top, mx0 = x0 - 6, mx1 = x0 + w - 14;
  const { r0, r1 } = eaveRoof(g, mx0 + 6, mx1 - 6, my, 28, x0 + (w - 20) / 2, S, SLATEP, 'slate', 6);
  for (let k = 0; k < 4; k++) { const t = (k + 0.5) / 4; box(g, mx0 + 4 + t * (mx1 - mx0 - 8), my - 4, 2, 2, SLATEP[0]); }
  // (iron cresting along the ridge, a widow's walk)
  for (let xx = r0[0]; xx < r1[0]; xx += 4) { box(g, xx, r0[1] - 5, 1, 5, INK); box(g, xx - 1, r0[1] - 6, 3, 1, INK); }
  // (dormers in the mansard: a crooked one, its window lit sick green)
  for (const dx of [x0 + 20, x0 + 66]) { const dy = my - 26; polyI(g, [[dx - 2, my - 2], [dx - 2, dy + 6], [dx + 9, dy - 4], [dx + 20, dy + 6], [dx + 20, my - 2]], GHOUL[2]); win(g, dx + 3, dy + 8, 12, 12, lit, { frame: '#3B3049', glass: sickGlow(lit), on: false, sill: false, seed: dx }); }
  // (the windows: tall, their shutters hanging off, the glass lit sick green after dark, a figure in one)
  for (const [wx, wy, hang] of [[x0 + 12, top + 20, 1], [x0 + 62, top + 20, 0], [x0 + 12, top + 62, 0]] as const) {
    box(g, wx - 2, wy - 2, 22, 30, INK);
    box(g, wx - 1, wy - 1, 20, 28, '#3B3049');
    box(g, wx, wy, 18, 26, lit ? '#BEF264' : '#4A4458'); box(g, wx, wy, 18, 9, lit ? '#D9F99D' : '#5A5468'); checker(g, wx, wy + 8, 18, 2, lit ? '#D9F99D' : '#5A5468');
    box(g, wx + 8, wy, 2, 26, INK); box(g, wx, wy + 12, 18, 2, INK);
    if (wx === x0 + 62) { box(g, wx + 11, wy + 4, 5, 5, '#1A1028'); box(g, wx + 10, wy + 9, 7, 17, '#1A1028'); }
    box(g, wx - 9, wy + (hang ? 4 : 0), 7, 26, INK); box(g, wx - 8, wy + (hang ? 5 : 1), 5, 24, '#2E2440'); for (let yy = wy + 4; yy < wy + 24; yy += 3) box(g, wx - 8, yy + (hang ? 2 : 0), 5, 1, '#3B3049');
    box(g, wx - 3, wy + 27, 24, 3, INK); box(g, wx - 2, wy + 27, 22, 2, BONE[2]);
  }
  // (the porch: its roof going back on turned posts, spindles, the steps, the door with its knocker)
  eaveRoof(g, x0 + 44, x0 + 104, B - 40, 7, x0 + 74, S, SLATEP, 'slate', 4);
  for (const px of [x0 + 44, x0 + 64, x0 + 84, x0 + 102]) { box(g, px - 2, B - 40, 5, 36, INK); box(g, px - 1, B - 40, 3, 36, BONE[3]); for (let yy = B - 36; yy < B - 6; yy += 8) box(g, px - 2, yy, 5, 2, BONE[2]); }
  for (let k = 0; k < 7; k++) box(g, x0 + 46 + k * 8, B - 30, 2, 2, BONE[4]);
  box(g, x0 + 44, B - 33, 60, 3, INK); box(g, x0 + 44, B - 32, 60, 1, BONE[3]);
  door(g, x0 + 66, B - 6, 16, 28, '#2E1A10', { frame: '#3B3049', arch: true });
  box(g, x0 + 73, B - 22, 2, 3, '#C8A050');
  for (let k = 0; k < 3; k++) { box(g, x0 + 58 - k * 3, B - 6 + k * 2, 32 + k * 6, 2, BONE[k % 2 ? 2 : 3]); }
  // (a chimney, crooked; cobwebs; a jack-o'-lantern on the steps)
  chimney(g, x0 + 30, my - 44, my - 18, 12, R6('#5A3A4A'));
  g.strokeStyle = 'rgba(241, 245, 249, 0.55)'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x0 + 44, B - 40, 4 + k * 4, 0, Math.PI / 2); g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(x0 + 96, B - 6, 6, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#EA580C'; g.beginPath(); g.ellipse(x0 + 96, B - 6, 5, 4, 0, 0, Math.PI * 2); g.fill();
  box(g, x0 + 93, B - 8, 2, 2, lit ? '#FDE047' : '#7C2D12'); box(g, x0 + 97, B - 8, 2, 2, lit ? '#FDE047' : '#7C2D12'); box(g, x0 + 94, B - 5, 4, 1, lit ? '#FDE047' : '#7C2D12');
  void x;
};
const mausoleum = (g: Ctx, x: number, lit: boolean) => {
  // (granite blocks, a pediment going back, columns fluted, the bronze door gone green, a name over it, urns)
  const R = R6('#8A8494'), w = 72, top = B - 64;
  flatTop(g, x - w / 2 - 4, x + w / 2 + 4, top, x, S, R);
  box(g, x - w / 2 - 1, top - 1, w + 2, 65, INK); ashlar(g, x - w / 2, top, w, 64, R, 7, 14, 8);
  const ped: Pt = [x, top - 26];
  gableBack(g, x - w / 2 - 6, x + w / 2 + 6, top, ped[0], ped[1], x, S, R, 4);
  polyI(g, [[x - w / 2 - 6, top], ped, [x + w / 2 + 6, top]], R[3]); polyI(g, [[x - w / 2 + 4, top - 3], [x, top - 20], [x + w / 2 - 4, top - 3]], R[2]);
  g.fillStyle = INK; g.beginPath(); g.arc(x, top - 9, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[3]; g.beginPath(); g.arc(x, top - 9, 3, 0, Math.PI * 2); g.fill(); box(g, x - 2, top - 10, 1, 1, INK); box(g, x + 1, top - 10, 1, 1, INK);
  box(g, x - w / 2 - 4, top - 2, w + 8, 4, INK); box(g, x - w / 2 - 3, top - 1, w + 6, 2, R[4]);
  box(g, x - 24, top + 3, 48, 10, INK); box(g, x - 23, top + 4, 46, 8, BONE[2]); box(g, x - 23, top + 4, 46, 1, BONE[4]); for (let k = 0; k < 5; k++) box(g, x - 18 + k * 8, top + 7, 5, 2, BONE[1]);
  for (const px of [-28, -16, 16, 28]) { box(g, x + px - 4, top + 14, 8, 50, INK); box(g, x + px - 3, top + 14, 6, 50, BONE[3]); box(g, x + px - 3, top + 14, 2, 50, BONE[5]); box(g, x + px + 1, top + 14, 2, 50, BONE[1]); box(g, x + px - 5, top + 12, 10, 3, BONE[4]); }
  box(g, x - 10, B - 40, 20, 40, INK); box(g, x - 9, B - 39, 18, 39, '#2F6B5A'); box(g, x - 9, B - 39, 18, 2, '#4A9A80'); box(g, x, B - 39, 1, 39, INK);
  for (let yy = B - 34; yy < B; yy += 8) { box(g, x - 7, yy, 5, 5, '#3E8A70'); box(g, x + 2, yy, 5, 5, '#3E8A70'); }
  checker(g, x - 9, B - 20, 18, 20, '#1E4A3A');
  for (const ux of [x - w / 2 - 8, x + w / 2 + 4]) { box(g, ux - 1, B - 18, 6, 18, INK); box(g, ux, B - 17, 4, 17, R[2]); g.fillStyle = INK; g.beginPath(); g.ellipse(ux + 2, B - 22, 5, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.ellipse(ux + 2, B - 22, 4, 4, 0, 0, Math.PI * 2); g.fill(); }
  void lit;
};
const cemetery = (g: Ctx, cx: number, lit: boolean) => {
  // (stones leaning, crosses, an angel; the wall of rough stone, its piers and their skull caps, the iron gate open)
  for (let k = 0; k < 8; k++) {
    const tx = cx + 72 + k * 20 + hash(k) * 6, th = 16 + hash(k + 3) * 12, lean = (hash(k + 7) - 0.5) * 0.35, kind = k % 4;
    g.save(); g.translate(tx, B - 12); g.rotate(lean);
    const R = R6(kind === 2 ? '#6E6880' : '#8A8494');
    if (kind === 1) { box(g, -2, -th - 4, 5, th + 4, INK); box(g, -1, -th - 3, 3, th + 3, R[3]); box(g, -6, -th + 3, 13, 4, INK); box(g, -5, -th + 4, 11, 2, R[3]); }
    else { g.fillStyle = INK; g.beginPath(); g.roundRect(-7, -th - 1, 14, th + 1, [7, 7, 0, 0]); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.roundRect(-6, -th, 12, th, [6, 6, 0, 0]); g.fill(); box(g, -6, -th + 4, 2, th - 4, R[4]); box(g, 3, -th + 4, 3, th - 4, R[1]); box(g, -3, -th + 7, 6, 1, R[1]); box(g, -2, -th + 10, 4, 1, R[1]); checker(g, -6, -6, 12, 6, '#3F6212'); }
    g.restore();
  }
  // (the angel)
  const ax = cx + 128;
  box(g, ax - 6, B - 20, 12, 8, INK); box(g, ax - 5, B - 19, 10, 7, BONE[2]);
  polyI(g, [[ax - 3, B - 20], [ax - 4, B - 40], [ax + 4, B - 40], [ax + 3, B - 20]], BONE[3]);
  polyI(g, [[ax - 3, B - 38], [ax - 14, B - 46], [ax - 8, B - 30]], BONE[4]); polyI(g, [[ax + 3, B - 38], [ax + 14, B - 46], [ax + 8, B - 30]], BONE[2]);
  g.fillStyle = INK; g.beginPath(); g.arc(ax, B - 43, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[3]; g.beginPath(); g.arc(ax, B - 43, 3, 0, Math.PI * 2); g.fill();
  // (the wall, rough stone, moss at its foot)
  const W = R6('#6E6684');
  box(g, cx + 59, B - 15, 168, 15, INK); ashlar(g, cx + 60, B - 14, 166, 14, W, 3, 10, 5); checker(g, cx + 60, B - 4, 166, 4, '#3F6212');
  for (const px of [cx + 60, cx + 214]) {
    box(g, px - 7, B - 53, 18, 53, INK); ashlar(g, px - 6, B - 52, 16, 52, W, px, 8, 6);
    box(g, px - 9, B - 56, 22, 5, INK); box(g, px - 8, B - 55, 20, 3, W[4]);
    g.fillStyle = INK; g.beginPath(); g.arc(px + 2, B - 62, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = BONE[3]; g.beginPath(); g.arc(px + 2, B - 62, 6, 0, Math.PI * 2); g.fill();
    box(g, px - 1, B - 63, 2, 2, INK); box(g, px + 3, B - 63, 2, 2, INK); box(g, px, B - 59, 4, 1, INK);
  }
  // (the gate, iron, swung open)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 6; k++) { g.moveTo(cx + 70 + k * 4, B - 2); g.lineTo(cx + 70 + k * 3, B - 42 - (k % 2) * 4); } g.moveTo(cx + 69, B - 30); g.lineTo(cx + 88, B - 34); g.moveTo(cx + 69, B - 10); g.lineTo(cx + 92, B - 12); g.stroke();
  void lit;
};

// ---------------------------------------------------------------------------------------------------------------
// CARTOON LAND

const toonInk = (g: Ctx, path: () => void, fill: string | CanvasPattern, w = 3) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = w; g.stroke(); };
/** Fill a path in stepped bands across it (lit left, shaded right), dithered at each step, then ink it. */
const toonShade = (g: Ctx, path: () => void, x0: number, x1: number, y0: number, y1: number, R: string[], w = 3) => {
  g.save(); g.beginPath(); path(); g.clip();
  const n = [0.14, 0.32, 0.7, 0.86, 1], cols = [R[4], R[5], R[3], R[2], R[1]];
  let a = x0;
  n.forEach((t, i) => { const b = x0 + (x1 - x0) * t; box(g, a, y0, b - a + 1, y1 - y0, cols[i]); if (i) checker(g, a - 1, y0, 2, y1 - y0, cols[i - 1]); a = b; });
  g.restore();
  g.beginPath(); path(); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = w; g.stroke();
};
const toadstoolCottage = (g: Ctx, x0: number, lit: boolean) => {
  const W = R6('#FFF1F6'), Cap = R6('#DC3442');
  const body = () => { g.moveTo(x0, B); g.quadraticCurveTo(x0 - 7, B - 40, x0 + 4, B - 72); g.lineTo(x0 + 66, B - 72); g.quadraticCurveTo(x0 + 78, B - 40, x0 + 70, B); g.closePath(); };
  toonShade(g, body, x0 - 8, x0 + 78, B - 74, B, W);
  // (a band of scallops round its foot, a round window with its shutters, the round-topped door, a flower box)
  for (let k = 0; k < 9; k++) { g.fillStyle = '#F9A8D4'; g.beginPath(); g.arc(x0 + 4 + k * 8, B - 6, 4, Math.PI, 0); g.fill(); }
  box(g, x0 + 1, B - 6, 68, 6, '#F9A8D4'); box(g, x0 + 1, B - 7, 68, 1, INK);
  win(g, x0 + 23, B - 56, 22, 20, lit, { frame: '#F2822A', round: true, curtain: '#4CA8E8', seed: 81 });
  for (const sx of [x0 + 16, x0 + 48]) { toonInk(g, () => g.roundRect(sx, B - 56, 6, 20, 3), '#4CC89C', 2); box(g, sx + 1, B - 52, 4, 1, '#26A07E'); box(g, sx + 1, B - 44, 4, 1, '#26A07E'); }
  toonInk(g, () => g.roundRect(x0 + 26, B - 26, 18, 26, [9, 9, 0, 0]), '#F2822A', 2); box(g, x0 + 29, B - 22, 2, 18, '#FAAE64'); box(g, x0 + 39, B - 14, 3, 3, '#FCE880');
  planter(g, x0 + 4, 18, 3); planter(g, x0 + 50, 16, 7);
  // (the cap: banded red, its spots, the underside's gills going back, a curly chimney)
  const cap = () => { g.moveTo(x0 - 22, B - 64); g.quadraticCurveTo(x0 + 35, B - 136, x0 + 92, B - 64); g.quadraticCurveTo(x0 + 35, B - 54, x0 - 22, B - 64); g.closePath(); };
  toonShade(g, cap, x0 - 22, x0 + 92, B - 136, B - 54, Cap);
  g.save(); g.beginPath(); cap(); g.clip(); for (const [dx, dy, r] of [[8, -82, 7], [34, -100, 9], [62, -82, 6], [44, -76, 4], [18, -96, 4]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(x0 + dx, B + dy, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x0 + dx, B + dy, r, 0, Math.PI * 2); g.fill(); box(g, x0 + dx - r * 0.5, B + dy - r * 0.6, 2, 2, '#FFFFFF'); g.fillStyle = '#E4D2DE'; g.beginPath(); g.arc(x0 + dx + r * 0.3, B + dy + r * 0.3, r * 0.5, 0, Math.PI * 2); g.fill(); } g.restore();
  for (let k = 0; k < 10; k++) seg(g, [x0 - 14 + k * 11, B - 62], [x0 + 35, B - 68], '#C0507E');
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + 70, B - 96); g.bezierCurveTo(x0 + 78, B - 110, x0 + 64, B - 116, x0 + 74, B - 128); g.stroke();
  g.strokeStyle = '#9476DE'; g.lineWidth = 3; g.stroke();
};
const crookedShop = (g: Ctx, x0: number, lit: boolean) => {
  const W = R6('#BAA4F0'), Rf = R6('#4CA8E8');
  const body = () => { g.moveTo(x0, B); g.lineTo(x0 + 6, B - 120); g.quadraticCurveTo(x0 + 30, B - 132, x0 + 58, B - 116); g.lineTo(x0 + 52, B); g.closePath(); };
  toonShade(g, body, x0, x0 + 58, B - 132, B, W);
  // (polka dots, round windows up it in a wiggle, the shop window and its candy awning, a board on a curly bracket)
  g.save(); g.beginPath(); body(); g.clip(); for (let k = 0; k < 14; k++) { g.fillStyle = W[4]; g.beginPath(); g.arc(x0 + 6 + (k % 4) * 14 + (Math.floor(k / 4) % 2) * 7, B - 112 + Math.floor(k / 4) * 22, 2.5, 0, Math.PI * 2); g.fill(); } g.restore();
  for (const [wx, wy] of [[18, -96], [38, -92], [16, -68], [36, -64]] as const) win(g, x0 + wx - 6, B + wy - 6, 12, 12, lit, { frame: '#F6D23A', round: true, seed: wx + wy });
  win(g, x0 + 8, B - 34, 38, 22, lit, { frame: '#F2822A', mull: 3, seed: 91 });
  for (let k = 0; k < 6; k++) { const gx = x0 + 12 + k * 6; box(g, gx, B - 18, 4, 5, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][k % 4]); }
  awning(g, x0 + 4, x0 + 50, B - 44, 8, '#DC3442', '#FFFFFF', 6);
  const roof = () => { g.moveTo(x0 + 2, B - 116); g.quadraticCurveTo(x0 + 32, B - 152, x0 + 64, B - 110); g.quadraticCurveTo(x0 + 34, B - 124, x0 + 2, B - 116); g.closePath(); };
  toonShade(g, roof, x0, x0 + 64, B - 152, B - 110, Rf);
  g.fillStyle = INK; g.beginPath(); g.arc(x0 + 34, B - 146, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FCE880'; g.beginPath(); g.arc(x0 + 34, B - 146, 4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 4, B - 74); g.bezierCurveTo(x0 - 8, B - 76, x0 - 12, B - 66, x0 - 8, B - 60); g.stroke();
  toonInk(g, () => g.roundRect(x0 - 26, B - 60, 26, 14, 6), '#FFFFFF', 2);
  signText(g, 'JOKES', x0 - 13, B - 50, { sx: 1, sy: 1, fill: ['#DC3442', '#B01C2C'], dither: true });
};
const toonWaterTower = (g: Ctx, x: number, lit: boolean) => {
  for (const lx of [-24, -8, 8, 24]) { stripes(g, () => g.rect(x + lx - 3, B - 100, 6, 100), '#FFFFFF', '#DC3442', x + lx - 3, B - 100, 6, 100, 5, 0.8); g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(x + lx - 3, B - 100, 6, 100); box(g, x + lx - 3, B - 100, 2, 100, 'rgba(255,255,255,0.25)'); }
  // (a catwalk round under the tank, its railing)
  box(g, x - 44, B - 102, 88, 4, INK); box(g, x - 43, B - 101, 86, 2, '#9476DE');
  for (let k = 0; k < 12; k++) box(g, x - 42 + k * 8, B - 110, 1, 8, INK); box(g, x - 43, B - 111, 86, 1, INK);
  const tank = () => { g.moveTo(x - 38, B - 100); g.quadraticCurveTo(x - 44, B - 140, x - 32, B - 168); g.lineTo(x + 32, B - 168); g.quadraticCurveTo(x + 44, B - 140, x + 38, B - 100); g.closePath(); };
  stripes(g, tank, '#FFFFFF', '#DC3442', x - 46, B - 170, 92, 72, 9, 0);
  g.save(); g.beginPath(); tank(); g.clip(); box(g, x - 46, B - 170, 12, 72, 'rgba(255,255,255,0.3)'); box(g, x + 22, B - 170, 24, 72, 'rgba(26,16,40,0.22)'); checker(g, x + 18, B - 170, 4, 72, 'rgba(26,16,40,0.22)'); g.restore();
  g.beginPath(); tank(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  const cap = () => { g.moveTo(x - 40, B - 166); g.quadraticCurveTo(x, B - 206, x + 40, B - 166); g.closePath(); };
  toonShade(g, cap, x - 40, x + 40, B - 206, B - 166, R6('#F06A72'));
  g.fillStyle = INK; g.beginPath(); g.arc(x, B - 196, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FCE880'; g.beginPath(); g.arc(x, B - 196, 5.5, 0, Math.PI * 2); g.fill(); box(g, x - 3, B - 199, 2, 2, '#FFFFFF');
  for (const ex of [-12, 12]) { toonInk(g, () => g.ellipse(x + ex, B - 146, 6, 8, 0, 0, Math.PI * 2), '#FFFFFF', 2); box(g, x + ex - 1, B - 146, 4, 5, INK); box(g, x + ex, B - 146, 1, 1, '#FFFFFF'); }
  g.fillStyle = 'rgba(248,140,180,0.5)'; for (const ex of [-22, 22]) { g.beginPath(); g.ellipse(x + ex, B - 132, 5, 3, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(x, B - 130, 14, 0.2, Math.PI - 0.2); g.stroke();
  box(g, x - 4, B - 118, 8, 5, '#FFFFFF'); box(g, x, B - 118, 1, 5, INK);
  void lit;
};
const lollipop = (g: Ctx, x: number, h: number, col: string) => {
  box(g, x - 2, B - h, 4, h, INK); box(g, x - 1, B - h, 2, h, '#FFFFFF'); box(g, x, B - h, 1, h, '#E4D2DE');
  const R = R6(col);
  g.fillStyle = INK; g.beginPath(); g.arc(x, B - h, 15, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 4; k++) { g.fillStyle = [R[2], R[3], R[4], R[5]][k]; g.beginPath(); g.arc(x - k * 1.5, B - h - k * 1.5, 13 - k * 3, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.beginPath(); for (let t = 0; t < Math.PI * 5; t += 0.2) { const r = t * 0.8; g.lineTo(x + Math.cos(t) * r, B - h + Math.sin(t) * r); } g.stroke();
  box(g, x - 6, B - h + 14, 12, 3, '#F472B6');
};

// ---------------------------------------------------------------------------------------------------------------
// AMERICA USA

const mainStreet = (g: Ctx, x0: number, w: number, col: string, name: string, lit: boolean, seed: number) => {
  const h = 112 + Math.round(hash(x0) * 20), top = B - h, x = x0 + w / 2, R = R6(col), brick = col === '#B4533C';
  const trim = brick ? '#F1E8D8' : col === '#7A9ABE' ? '#F8FAFC' : '#7A3424';
  flatTop(g, x0 - 2, x0 + w + 2, top - 6, x, S, R6('#57534E'), 1);
  box(g, x0 - 1, top - 1, w + 2, h + 1, INK);
  if (brick) bricks(g, x0, top, w, h, R, seed); else clapboard(g, x0, top, w, h, R, seed, 4);
  box(g, x0, top, 3, h, R[4]); box(g, x0 + w - 4, top, 4, h, R[1]); checker(g, x0 + w - 6, top, 2, h, R[1]);
  // (the cornice: a frieze, brackets under, its dentils)
  const T = R6(trim);
  box(g, x0 - 4, top - 8, w + 8, 9, INK); box(g, x0 - 3, top - 7, w + 6, 7, T[3]); box(g, x0 - 3, top - 7, w + 6, 1, T[5]); box(g, x0 - 3, top - 2, w + 6, 1, T[1]);
  for (let k = 0; k < w; k += 4) box(g, x0 + k, top + 1, 2, 2, T[2]);
  for (const bx of [x0 + 1, x0 + w - 5]) { box(g, bx, top, 4, 8, INK); box(g, bx + 1, top, 2, 7, T[3]); }
  // (upstairs: two tall windows with their lintels, curtains, a flag out; a painted sign between the floors)
  for (const wx of [x0 + 9, x0 + w - 23]) for (const wy of [top + 12, top + 44]) win(g, wx, wy, 14, 20, lit && hash(wx + wy) > 0.35, { frame: trim, lintel: trim, curtain: ['#B91C1C', '#1E3A8A', '#15803D'][Math.floor(hash(wx * wy) * 3)], seed: wx + wy });
  board(g, x, B - 60, w - 12, 10, name, { sx: 1, sy: 1, fill: brick ? '#F8FAFC' : '#3A2208' }, brick ? '#1E3A8A' : '#F8FAFC', '#3A2208');
  // (the shopfront: pilasters, a big display window, the door with its transom, the awning, a sconce, a bench)
  awning(g, x0 - 1, x0 + w + 1, B - 48, 10, '#DC2626', '#F8FAFC', 8);
  box(g, x0 + 3, B - 36, w - 6, 36, INK); box(g, x0 + 4, B - 35, w - 8, 35, T[2]);
  win(g, x0 + 7, B - 33, w - 31, 24, lit, { frame: '#3A2208', mull: 2, sill: false, seed: x0 + 1, on: true });
  // (what's in the window)
  for (let k = 0; k < Math.floor((w - 33) / 8); k++) { box(g, x0 + 9 + k * 8, B - 16, 6, 6, ['#F59E0B', '#EF4444', '#FDE68A', '#60A5FA'][(k + seed) % 4]); box(g, x0 + 9 + k * 8, B - 16, 6, 1, '#FFFFFF'); }
  box(g, x0 + 5, B - 9, w - 29, 9, T[1]); box(g, x0 + 5, B - 9, w - 29, 1, T[4]);
  door(g, x0 + w - 21, B, 14, 28, '#5E3E22', { frame: '#3A2208', glass: true, lit, transom: false });
  sconce(g, x0 + w - 4, B - 34, lit);
  bulbs(g, x0, top + 6, x0 + w, top + 6, 3, lit, ['#DC2626', '#F8FAFC', '#1E3A8A']);
  // (bunting fans under the upstairs windows)
  for (const fx of [x0 + 16, x0 + w - 16]) { for (const [i, c] of ['#DC2626', '#F8FAFC', '#1E3A8A'].entries()) { g.fillStyle = c; g.beginPath(); g.arc(fx, top + 76, 9 - i * 3, 0, Math.PI); g.fill(); } box(g, fx - 9, top + 76, 18, 1, INK); }
};

// ---------------------------------------------------------------------------------------------------------------
// HOLLYWOOD LAND

const DECO = R6('#E8DCC4'), GOLDR = R6('#C9A227');
const studioGate = (g: Ctx, gx: number, lit: boolean) => {
  // (the lot beyond, through the arch: a street of flats, a soundstage, the sky)
  box(g, gx - 34, B - 88, 68, 88, '#B8D4E8'); box(g, gx - 34, B - 60, 68, 30, '#CFE2EE');
  wall(g, gx - 32, B - 70, 30, 40, R6('#E7E5E4'), false); for (let k = 0; k < 3; k++) box(g, gx - 28 + k * 9, B - 62, 5, 7, lit ? '#FFD87A' : '#7AA8C8');
  wall(g, gx + 4, B - 58, 28, 28, R6('#A8A29E'), false); box(g, gx + 4, B - 58, 28, 3, '#78716C');
  box(g, gx - 34, B - 30, 68, 30, '#D6CDB8'); for (let k = 0; k < 4; k++) box(g, gx - 30 + k * 18, B - 18, 10, 2, '#F8FAFC');
  box(g, gx - 34, B - 8, 68, 8, '#52525B');
  // (the pylons: stepped deco towers, fluted, gold bands, a sunburst on each)
  for (const k of [-1, 1]) {
    const px = gx + k * 46;
    wall(g, px - 12, B - 112, 24, 112, DECO);
    for (let fx = px - 8; fx < px + 9; fx += 4) { box(g, fx, B - 104, 1, 94, DECO[2]); box(g, fx + 1, B - 104, 1, 94, DECO[4]); }
    for (let s = 0; s < 3; s++) { const w = 28 - s * 6, y = B - 120 - s * 9; box(g, px - w / 2 - 1, y - 1, w + 2, 10, INK); box(g, px - w / 2, y, w, 9, DECO[3 + (s % 2)]); box(g, px - w / 2, y, w, 1, DECO[5]); box(g, px + w / 2 - 3, y, 3, 9, DECO[1]); }
    for (let y = B - 100; y < B - 14; y += 16) { box(g, px - 12, y, 24, 2, GOLDR[3]); box(g, px - 12, y, 24, 1, GOLDR[5]); }
    for (let a = 0; a < 7; a++) { const t = Math.PI + (a / 6) * Math.PI; seg(g, [px, B - 44], [px + Math.cos(t) * 9, B - 44 + Math.sin(t) * 9], GOLDR[4], 1); }
    box(g, px - 2, B - 147, 4, 4, lit ? '#FFF7C2' : GOLDR[4]);
    box(g, px - 14, B - 6, 28, 6, INK); box(g, px - 13, B - 5, 26, 5, DECO[2]);
  }
  // (the arch across: the board with HAPPYWOOD STUDIOS, bulbs along it)
  box(g, gx - 60, B - 106, 120, 18, INK); box(g, gx - 59, B - 105, 118, 16, DECO[3]); box(g, gx - 59, B - 105, 118, 2, DECO[5]); box(g, gx - 59, B - 91, 118, 2, DECO[1]);
  box(g, gx - 50, B - 102, 100, 10, '#27272A');
  signText(g, 'HAPPYWOOD STUDIOS', gx, B - 93, { sx: 1, sy: 1, fill: ['#FDE68A', '#C9A227', '#8A6A10'], dither: true });
  for (let k = 0; k < 15; k++) box(g, gx - 56 + k * 8, B - 108, 2, 2, lit ? '#FFF7C2' : '#C9A227');
  // (the guard's booth and its bar up; a sign: NO PEDESTRIANS)
  box(g, gx - 30, B - 30, 3, 30, '#F8FAFC'); g.save(); g.translate(gx - 29, B - 28); g.rotate(-1.2); for (let k = 0; k < 6; k++) box(g, k * 8, -2, 8, 4, k % 2 ? '#DC2626' : '#F8FAFC'); g.restore();
  const bx = gx + 16;
  flatTop(g, bx - 2, bx + 22, B - 36, bx + 10, S, R6('#A8A29E'));
  wall(g, bx, B - 36, 20, 36, R6('#E7E5E4')); win(g, bx + 3, B - 30, 14, 12, lit, { frame: '#C9A227', mull: 2, sill: false, on: true });
  box(g, bx - 2, B - 38, 24, 3, INK); box(g, bx - 1, B - 37, 22, 1, GOLDR[4]);
};
const soundstage = (g: Ctx, sx: number, lit: boolean) => {
  const sw = 190, sh = 128, top = B - sh, cx = sx + sw / 2, R = R6('#D6CDB8');
  // (the roof: a barrel vault going back, its ribs, AC units and a vent on it)
  const ap: Pt = [cx, top - 22];
  const pts: Pt[] = []; for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push([sx - 2 + (sw + 4) * t, top - Math.sin(Math.PI * t) * 22]); }
  for (let k = 0; k < 12; k++) { const a = pts[k], b = pts[k + 1]; poly(g, [a, b, back(b[0], b[1], cx, S), back(a[0], a[1], cx, S)], k < 6 ? R[k < 3 ? 3 : 4] : R[k < 9 ? 2 : 1]); seg(g, a, back(a[0], a[1], cx, S), R[1]); }
  for (const u of [0.3, 0.62]) { const [px, py] = back(sx + sw * u, top - Math.sin(Math.PI * u) * 22, cx, 0.95); box(g, px - 7, py - 8, 14, 8, INK); box(g, px - 6, py - 7, 12, 7, '#9CA3AF'); for (let j = 0; j < 3; j++) box(g, px - 6, py - 6 + j * 2, 12, 1, '#6B7280'); }
  void ap;
  // (the wall: corrugated, its pilasters, the number painted big on a white field, the elephant door, the red light)
  box(g, sx - 1, top - 1, sw + 2, sh + 1, INK);
  corrugated(g, sx, top, sw, sh, R, 7);
  g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 2, top); for (let k = 0; k <= 12; k++) g.lineTo(pts[k][0], pts[k][1]); g.lineTo(sx + sw + 2, top); g.closePath(); g.fill();
  g.fillStyle = R[3]; g.beginPath(); g.moveTo(sx, top); for (let k = 0; k <= 12; k++) g.lineTo(pts[k][0], pts[k][1] + 2); g.lineTo(sx + sw, top); g.closePath(); g.fill();
  for (let x = sx + 30; x < sx + sw; x += 40) { box(g, x, top, 6, sh, R[4]); box(g, x + 5, top, 2, sh, R[1]); }
  box(g, sx, top, 4, sh, R[4]); box(g, sx + sw - 8, top, 8, sh, R[2]);
  box(g, sx + 27, top + 17, 62, 42, INK); box(g, sx + 28, top + 18, 60, 40, '#F8FAFC'); box(g, sx + 28, top + 18, 60, 2, '#FFFFFF'); box(g, sx + 28, top + 55, 60, 3, '#D6D3D1');
  signText(g, 'STAGE', sx + 58, top + 34, { sx: 2, sy: 2, fill: ['#3F3F46', '#27272A'], dither: true }); signText(g, '7', sx + 58, top + 53, { sx: 2, sy: 2, fill: ['#B91C1C', '#7F1D1D'], dither: true });
  // (the elephant door: a big roller door, banded; a man door beside it with the red light over)
  box(g, sx + 19, B - 61, 52, 61, INK); box(g, sx + 20, B - 60, 50, 60, '#A8A29E'); for (let y = B - 57; y < B; y += 5) { box(g, sx + 20, y, 50, 1, '#78716C'); box(g, sx + 20, y + 1, 50, 1, '#C8C2B8'); }
  box(g, sx + 20, B - 60, 50, 3, '#57534E'); box(g, sx + 22, B - 6, 46, 6, '#E8B400'); for (let k = 0; k < 46; k += 8) box(g, sx + 22 + k, B - 6, 4, 6, '#1C1A1E');
  door(g, sx + 140, B, 16, 30, '#57534E', { frame: '#78716C' });
  g.fillStyle = INK; g.beginPath(); g.arc(sx + 148, B - 40, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#B91C1C'; g.beginPath(); g.arc(sx + 148, B - 40, 4, 0, Math.PI * 2); g.fill();
  board(g, sx + 148, B - 54, 40, 8, 'QUIET!', { sx: 1, sy: 1, fill: '#FFFFFF' }, '#B91C1C', '#27272A');
  // (an iron stair up the side to a door high up, posters by the man door, a fire hose cabinet)
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + 168, B); g.lineTo(sx + 186, B - 70); g.stroke(); g.strokeStyle = '#57534E'; g.lineWidth = 1; g.stroke();
  for (let k = 0; k < 9; k++) box(g, sx + 168 + k * 2, B - 4 - k * 8, 8, 1, '#3F3F46');
  box(g, sx + 172, B - 72, 18, 2, '#3F3F46'); box(g, sx + 178, B - 92, 10, 20, INK); box(g, sx + 179, B - 91, 8, 19, '#57534E');
  poster(g, sx + 80, B - 44, 16, 22, ['#1E3A8A', '#F59E0B', '#DC2626'], 1); poster(g, sx + 100, B - 44, 16, 22, ['#18181B', '#B91C1C', '#FDE68A'], 2); poster(g, sx + 120, B - 44, 14, 22, ['#065F46', '#FDE047', '#F8FAFC'], 3);
  box(g, sx + 4, B - 30, 10, 14, INK); box(g, sx + 5, B - 29, 8, 12, '#DC2626'); box(g, sx + 5, B - 29, 8, 2, '#F87171');
  // (the camera crane up over the wall)
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(sx + sw - 30, top); g.lineTo(sx + sw + 30, top - 60); g.stroke();
  g.strokeStyle = '#57534E'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#8A8F98'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + sw - 30, top - 1); g.lineTo(sx + sw + 30, top - 61); g.stroke();
  for (let k = 0; k < 6; k++) { const t = k / 6; box(g, sx + sw - 30 + t * 60 - 1, top - t * 60 - 3, 2, 3, '#3F3F46'); }
  box(g, sx + sw + 21, top - 73, 22, 16, INK); box(g, sx + sw + 22, top - 72, 20, 14, '#27272A'); box(g, sx + sw + 22, top - 72, 20, 2, '#52525B');
  g.fillStyle = INK; for (const ox of [-6, 6]) { g.beginPath(); g.arc(sx + sw + 32 + ox, top - 78, 6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#3F3F46'; for (const ox of [-6, 6]) { g.beginPath(); g.arc(sx + sw + 32 + ox, top - 78, 4.5, 0, Math.PI * 2); g.fill(); }
  box(g, sx + sw + 42, top - 68, 6, 6, INK); box(g, sx + sw + 43, top - 67, 4, 4, '#9CC8E8');
};

// ---------------------------------------------------------------------------------------------------------------
// FAIRY LAND

const PL = PLASTER, TI = TIMBER, SL = SLATE;
const cottage = (g: Ctx, x: number, w: number, h: number, lit: boolean, seed: number, name: string | null) => {
  const top = B - h, cx = x + w / 2, rh = Math.round(w * 0.62), apex: Pt = [cx, top - rh];
  // (the roof: its slopes going back in slate, then the gable's face)
  gableBack(g, x - 10, x + w + 10, top, apex[0], apex[1], cx, S, SL, 7);
  // (a stone plinth, the plaster, the timbers (posts, a rail, braces), the gable in timbers and plaster too)
  box(g, x - 1, top - 1, w + 2, h + 1, INK);
  box(g, x, top, w, h, PL[4]); plaster(g, x, top, w, h, PL, seed);
  box(g, x + w - 6, top, 6, h, PL[2]); checker(g, x + w - 8, top, 2, h, PL[2]);
  ashlar(g, x, B - 10, w, 10, R6(FSTONE[3]), seed, 10, 5);
  for (const px of [x, x + w - 4, x + w / 2 - 2]) { box(g, px, top, 4, h - 10, TI[3]); box(g, px, top, 1, h - 10, TI[4]); }
  box(g, x, top + h * 0.48, w, 4, TI[2]); box(g, x, top + h * 0.48, w, 1, TI[4]); box(g, x, top, w, 3, TI[2]);
  g.strokeStyle = TI[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, top + h * 0.48); g.lineTo(x + w / 2 - 2, top + 4); g.moveTo(x + w - 4, top + h * 0.48); g.lineTo(x + w / 2 + 2, top + 4); g.stroke();
  polyI(g, [[x - 10, top], apex, [x + w + 10, top]], PL[3]);
  g.save(); g.beginPath(); g.moveTo(x - 10, top); g.lineTo(apex[0], apex[1]); g.lineTo(x + w + 10, top); g.closePath(); g.clip();
  plaster(g, x - 10, top - rh, w + 20, rh, PL, seed + 3);
  for (let k = -2; k <= 2; k++) box(g, cx + k * (w / 5) - 1, top - rh, 3, rh, TI[3]);
  box(g, x - 10, top - rh * 0.45, w + 20, 3, TI[2]);
  g.restore();
  // (the bargeboards, carved, lit along the left)
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 12, top + 2); g.lineTo(apex[0], apex[1] - 2); g.lineTo(x + w + 12, top + 2); g.stroke();
  g.strokeStyle = TI[3]; g.lineWidth = 3; g.stroke(); seg(g, [x - 11, top], [apex[0] - 1, apex[1] - 1], TI[5]);
  for (let k = 1; k < 6; k++) { const t = k / 6; box(g, x - 10 + (cx - x + 10) * t - 1, top - rh * t + 2, 2, 3, TI[1]); box(g, cx + (x + w + 10 - cx) * t - 1, top - rh * (1 - t) + 2, 2, 3, TI[1]); }
  // (casements: leaded, their shutters, a box of flowers; one up in the gable)
  for (const wx of [x + 8, x + w - 22]) win(g, wx, top + h * 0.2, 14, 16, lit, { frame: TI[3], curtain: '#B91C1C', shutters: seed % 2 ? '#2E5A4A' : '#2A3E6A', box: true, seed: wx });
  win(g, cx - 6, top - rh * 0.4, 12, 12, lit, { frame: TI[3], arch: true, sill: false, seed: seed * 3 });
  door(g, cx - 7, B, 14, 24, '#5E3E2A', { frame: TI[2], arch: true, planks: true });
  sconce(g, cx + 12, B - 24, lit, TI[1]);
  if (name) hangSign(g, seed > 5 ? x : x + w, top + h * 0.56, seed > 5 ? -1 : 1, 26, 12, '#1E3A6E', (sx, sy) => signText(g, name, sx, sy + 3, { sx: 1, sy: 1, fill: ['#FFF6C8', '#F6D365', '#E0AE3A'], dither: true }));
  chimney(g, x + w * 0.7, top - rh * 0.72, top - rh * 0.3, 10);
};
const castleWall = (g: Ctx, x0: number, x1: number, lit: boolean) => {
  const R = [FSTONE[1], FSTONE[2], FSTONE[3], FSTONE[4], FSTONE[5], '#FFFFFF'], top = B - 92, cx = (x0 + x1) / 2;
  flatTop(g, x0, x1, top, cx, S, R);
  box(g, x0 - 1, top - 1, x1 - x0 + 2, 93, INK); ashlar(g, x0, top, x1 - x0, 92, R, 11, 18, 9);
  box(g, x0, top, 4, 92, R[4]); box(g, x1 - 8, top, 8, 92, R[1]);
  for (let x = x0; x < x1; x += 16) { const a = back(x, top - 10, cx, 0.97); box(g, x - 1, top - 11, 12, 12, INK); ashlar(g, x, top - 10, 10, 10, R, x, 10, 5); box(g, x, top - 10, 10, 1, R[5]); box(g, a[0], a[1], 10, 2, R[2]); }
  for (let k = 0; k < 3; k++) { const ax = x0 + 30 + k * 50; box(g, ax - 2, top + 20, 4, 14, INK); box(g, ax - 1, top + 21, 2, 12, lit ? '#F0A83E' : '#1A1028'); }
  for (const bx of [x0 + 16, x1 - 34]) banner(g, bx, top + 6, 18, 44, '#1D4ED8', GOLD[4], cxx => { box(g, cxx - 3, top + 20, 6, 6, '#FACC15'); box(g, cxx - 1, top + 18, 2, 2, '#FACC15'); });
  for (const tx of [x0 + 50, x1 - 52]) sconce(g, tx, top + 54, lit);
};
const storybookTower = (g: Ctx, x: number, lit: boolean) => {
  const tw = 46, th = 176, top = B - th, R = [PL[1], PL[2], PL[3], PL[4], PL[5], '#FFFFFF'];
  box(g, x - tw / 2 - 1, top - 1, tw + 2, th + 1, INK);
  for (let u = 0; u < tw; u += 2) box(g, x - tw / 2 + u, top, 2, th, R[u < 4 ? 4 : u < 10 ? 5 : u < 26 ? 4 : u < 36 ? 3 : u < 42 ? 2 : 1]);
  for (let y = top + 6, r = 0; y < B; y += 8, r++) for (let u = (r % 2) * 6; u < tw; u += 12) box(g, x - tw / 2 + u, y, 1, 8, mix(R[2], R[3], 0.5));
  for (let y = top + 6; y < B; y += 8) checker(g, x - tw / 2, y, tw, 1, R[2]);
  ashlar(g, x - tw / 2, B - 14, tw, 14, R6(FSTONE[3]), 4, 10, 5);
  for (const wy of [top + 30, top + 84]) win(g, x - 6, wy, 12, 20, lit, { frame: TI[3], arch: true, curtain: '#B91C1C', seed: wy });
  door(g, x - 8, B, 16, 28, '#5E3E2A', { frame: TI[2], arch: true, planks: true });
  // (the balcony: its floor going back, brackets, a rail, the flower box)
  flatTop(g, x - tw / 2 - 6, x + tw / 2 + 6, top + 54, x, 0.94, R6(TI[3]));
  box(g, x - tw / 2 - 7, top + 53, tw + 14, 5, INK); box(g, x - tw / 2 - 6, top + 54, tw + 12, 3, TI[3]); box(g, x - tw / 2 - 6, top + 54, tw + 12, 1, TI[5]);
  for (let k = 0; k < 8; k++) box(g, x - tw / 2 - 5 + k * 7, top + 44, 1, 10, TI[1]); box(g, x - tw / 2 - 6, top + 43, tw + 12, 2, TI[2]);
  for (let k = 0; k < 10; k++) box(g, x - 20 + k * 4, top + 49 + (k % 2), 3, 3, ['#F472B6', '#FDE047', '#F87171'][k % 3]);
  for (const bx of [x - tw / 2 - 2, x + tw / 2 - 2]) polyI(g, [[bx, top + 58], [bx + 4, top + 58], [bx + 2, top + 66]], TI[2]);
  // (the cone: a tall blue roof in courses, gilt bands, its slopes going back a touch, the finial)
  const rb = top, apex: Pt = [x, top - 76], Bl = R6('#2563EB');
  gableBack(g, x - tw / 2 - 8, x + tw / 2 + 8, rb, apex[0], apex[1], x, S, Bl, 8);
  polyI(g, [[x - tw / 2 - 8, rb], apex, [x + tw / 2 + 8, rb]], Bl[3]);
  poly(g, [[x - tw / 2 - 7, rb - 1], apex, [x - 10, rb - 1]], Bl[4]); poly(g, [[x + 8, rb - 1], apex, [x + tw / 2 + 7, rb - 1]], Bl[1]);
  for (let k = 1; k < 9; k++) { const t = k / 9, hw = (tw / 2 + 8) * (1 - t); for (let xx = x - hw; xx < x + hw - 2; xx += 4) box(g, xx + (k % 2) * 2, rb - 76 * t, 3, 1, Bl[2]); }
  for (const t of [0.25, 0.55]) { const hw = (tw / 2 + 8) * (1 - t); box(g, x - hw, rb - 76 * t, hw * 2, 2, GOLD[3]); box(g, x - hw, rb - 76 * t, hw * 2, 1, GOLD[5]); }
  box(g, x - tw / 2 - 9, rb, tw + 18, 3, INK); box(g, x - tw / 2 - 8, rb, tw + 16, 2, GOLD[3]);
  box(g, x - 1, top - 96, 2, 22, '#57534E'); g.fillStyle = INK; g.beginPath(); g.arc(x, top - 78, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD[4]; g.beginPath(); g.arc(x, top - 78, 2, 0, Math.PI * 2); g.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// JUNGLE LAND

const BAMBOO = R6('#B4CC5C'), THATCH = R6('#C8A050'), ROCK = R6('#B0805A');
const jungleLook: L = { sx: 1, sy: 1, fill: ['#3A3226', '#2A2620'], dither: true, lip: '#E8DCC0', moss: '#4D7C0F', worn: 0.12, wornCol: '#6A6050', seed: 7 };
const tradingPost = (g: Ctx, x0: number, lit: boolean) => {
  const w = 84, h = 56, top = B - h, cx = x0 + w / 2;
  // (stilts and a deck going back, the walls of bamboo poles lashed (each pole banded at its nodes), the thatch layered)
  flatTop(g, x0 - 6, x0 + w + 6, B - 6, cx, S, R6('#8A6A44'));
  box(g, x0 - 1, top - 1, w + 2, h + 1, INK);
  for (let xx = x0, k = 0; xx < x0 + w; xx += 6, k++) { box(g, xx, top, 6, h, BAMBOO[k % 3 ? 3 : 2]); box(g, xx, top, 1, h, BAMBOO[5]); box(g, xx + 1, top, 1, h, BAMBOO[4]); box(g, xx + 5, top, 1, h, BAMBOO[1]); for (let yy = top + 8 + (k % 3) * 3; yy < B; yy += 14) { box(g, xx, yy, 6, 1, BAMBOO[1]); box(g, xx, yy + 1, 6, 1, BAMBOO[5]); } }
  for (const yy of [top + 10, B - 16]) { box(g, x0, yy, w, 3, '#5E3E22'); for (let xx = x0 + 2; xx < x0 + w; xx += 6) box(g, xx, yy - 1, 2, 5, '#A27E44'); }
  // (a shuttered window propped open on a stick, the doorway with its bead curtain, the sign carved on a plank)
  box(g, x0 + 8, top + 18, 18, 14, INK); box(g, x0 + 9, top + 19, 16, 12, lit ? '#F0A83E' : '#2A1A0C');
  polyI(g, [[x0 + 7, top + 17], [x0 + 27, top + 17], [x0 + 30, top + 8], [x0 + 10, top + 8]], BAMBOO[2]); seg(g, [x0 + 24, top + 31], [x0 + 28, top + 10], '#5E3E22');
  box(g, cx - 1, top + 22, 22, 34, INK); box(g, cx, top + 23, 20, 33, '#2A1A0C');
  for (let k = 0; k < 6; k++) for (let yy = top + 24; yy < B - 2; yy += 3) box(g, cx + 2 + k * 3, yy, 1, 2, ['#DC2626', '#FDE047', '#16A34A'][(k + yy) % 3]);
  board(g, x0 + 22, top + 2, 40, 10, 'TRADING POST', jungleLook, '#C8A86E', '#5E3E22');
  // (the thatch: layered bundles in rows, the ridge tied off, ragged at its eaves)
  const apex: Pt = [cx, top - 46];
  gableBack(g, x0 - 16, x0 + w + 16, top + 6, apex[0], apex[1], cx, S, THATCH, 6);
  polyI(g, [[x0 - 16, top + 6], apex, [x0 + w + 16, top + 6]], THATCH[3]);
  for (let r = 0; r < 6; r++) { const t = r / 6, y = top + 6 - 52 * t, hw = (w / 2 + 16) * (1 - t); for (let xx = cx - hw; xx < cx + hw; xx += 3) { const len = 6 + hash(xx + r) * 4; box(g, xx, y - len, 2, len, hash(xx * 3 + r) > 0.6 ? THATCH[4] : hash(xx + r * 7) > 0.3 ? THATCH[3] : THATCH[1]); } box(g, cx - hw, y - 1, hw * 2, 1, THATCH[0]); }
  for (let xx = x0 - 14; xx < x0 + w + 14; xx += 3) box(g, xx, top + 6, 2, 2 + hash(xx) * 4, THATCH[1]);
  box(g, cx - 3, top - 50, 6, 6, '#5E3E22');
  // (tiki torches either side, a mask on the wall, a crate)
  for (const tx of [x0 - 8, x0 + w + 8]) { box(g, tx - 2, B - 40, 4, 40, INK); box(g, tx - 1, B - 40, 2, 40, BAMBOO[3]); polyI(g, [[tx - 4, B - 46], [tx + 4, B - 46], [tx + 2, B - 40], [tx - 2, B - 40]], '#8A5A32'); }
  box(g, x0 + w - 18, top + 14, 10, 14, INK); box(g, x0 + w - 17, top + 15, 8, 12, '#B45309'); box(g, x0 + w - 15, top + 18, 2, 2, INK); box(g, x0 + w - 12, top + 18, 2, 2, INK); box(g, x0 + w - 15, top + 23, 5, 2, '#F5F5F4');
  box(g, x0 + 4, B - 14, 14, 10, INK); boards(g, x0 + 5, B - 13, 12, 8, R6('#A27E44'), 3, 4);
  void lit;
};
const tiki = (g: Ctx, x: number) => {
  const R = R6('#8A5A32');
  box(g, x - 13, B - 67, 26, 67, INK);
  for (let u = 0; u < 24; u += 2) box(g, x - 12 + u, B - 66, 2, 66, R[u < 4 ? 4 : u < 8 ? 5 : u < 16 ? 4 : u < 20 ? 3 : 2]);
  // (three faces stacked: brows, eyes, the grin; carved grooves; paint worn on them)
  for (const fy of [B - 62, B - 40, B - 18]) {
    box(g, x - 11, fy, 22, 3, R[1]); box(g, x - 11, fy, 22, 1, R[5]);
    box(g, x - 9, fy + 5, 6, 5, INK); box(g, x + 3, fy + 5, 6, 5, INK); box(g, x - 8, fy + 6, 2, 2, '#FDE68A'); box(g, x + 4, fy + 6, 2, 2, '#FDE68A');
    box(g, x - 2, fy + 8, 4, 6, R[2]); box(g, x - 7, fy + 15, 14, 4, INK); for (let k = 0; k < 3; k++) box(g, x - 6 + k * 4, fy + 15, 2, 2, '#F5F5F4');
  }
  box(g, x - 15, B - 70, 30, 5, INK); box(g, x - 14, B - 69, 28, 3, '#C2410C'); box(g, x - 14, B - 69, 28, 1, '#FB923C');
  for (let k = 0; k < 5; k++) box(g, x - 12 + k * 6, B - 75, 3, 6, ['#16A34A', '#FDE047', '#DC2626'][k % 3]);
};
const ruin = (g: Ctx, rx: number) => {
  const R = R6('#A8A29E'), M = R6('#4D7C0F');
  for (const [x, y, w, h] of [[rx - 30, B - 84, 18, 84], [rx + 20, B - 60, 18, 60], [rx - 32, B - 98, 48, 14]] as const) { box(g, x - 1, y - 1, w + 2, h + 1, INK); ashlar(g, x, y, w, h, R, x, 9, 7); box(g, x, y, 2, h, R[4]); box(g, x + w - 3, y, 3, h, R[1]); }
  // (the broken end, glyphs carved, a face in the keystone, moss and vines)
  poly(g, [[rx + 16, B - 98], [rx + 22, B - 92], [rx + 18, B - 86], [rx + 16, B - 84]], INK);
  for (let k = 0; k < 4; k++) { const gx = rx - 26 + (k % 2) * 6, gy = B - 76 + k * 16; box(g, gx, gy, 8, 8, R[1]); box(g, gx + 1, gy + 1, 6, 6, R[2]); box(g, gx + 2, gy + 2, 2, 2, R[0]); box(g, gx + 5, gy + 4, 1, 3, R[0]); }
  box(g, rx - 16, B - 96, 16, 10, R[2]); box(g, rx - 13, B - 94, 3, 2, INK); box(g, rx - 6, B - 94, 3, 2, INK); box(g, rx - 12, B - 90, 8, 2, INK);
  checker(g, rx - 32, B - 98, 48, 3, M[2]); checker(g, rx - 30, B - 10, 18, 10, M[1]); checker(g, rx + 20, B - 10, 18, 10, M[1]);
  for (let k = 0; k < 6; k++) { const vx = rx - 30 + k * 9, len = 26 + hash(k) * 34; for (let y = B - 98; y < B - 98 + len; y += 2) box(g, vx + Math.sin(y * 0.25 + k) * 2, y, 2, 2, (y >> 1) % 3 ? M[2] : M[3]); box(g, vx + 1, B - 98 + len, 3, 2, M[4]); }
  // (rubble at its foot)
  for (let k = 0; k < 5; k++) { const bx = rx - 20 + k * 11, s2 = 4 + hash(k * 5) * 4; box(g, bx - 1, B - s2 - 1, s2 + 2, s2 + 1, INK); box(g, bx, B - s2, s2, s2, R[hash(k) > 0.5 ? 3 : 2]); box(g, bx, B - s2, s2, 1, R[5]); }
};
const fakeRock = (g: Ctx, fx: number, lit: boolean) => {
  // (lumps of painted concrete, too orange: stepped shells, the pour lines and the panel seams showing, rebar in a
  // chip, a cave mouth, the pool, ferns, a speaker pretending to be a stone)
  const lumps: [number, number, number, number][] = [[-70, -40, 40, 40], [-40, -90, 46, 56], [10, -120, 50, 70], [56, -80, 40, 60], [74, -30, 34, 30], [-10, -40, 60, 40]];
  const outline = (grow: number) => { g.beginPath(); for (const [dx, dy, rw, rh] of lumps) { g.moveTo(fx + dx + rw + grow, B + dy); g.ellipse(fx + dx, B + dy, rw + grow, rh + grow, 0, 0, Math.PI * 2); } };
  outline(1); g.fillStyle = INK; g.fill();
  g.save(); g.beginPath(); g.rect(fx - 140, B - 200, 280, 200); g.clip();
  outline(0); g.clip();
  box(g, fx - 140, B - 200, 280, 200, ROCK[1]);
  for (const [dx, dy, rw, rh] of lumps) {
    const cx = fx + dx, cy = B + dy;
    for (const [k, col] of [[0.92, ROCK[2]], [0.72, ROCK[3]], [0.46, ROCK[4]], [0.2, ROCK[5]]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(cx - rw * (1 - k) * 0.5, cy - rh * (1 - k) * 0.6, rw * k, rh * k, 0, 0, Math.PI * 2); g.fill(); }
    checker(g, cx - rw * 0.6, cy - rh * 0.1, rw * 1.2, 2, ROCK[3]);
  }
  for (let y = B - 180; y < B; y += 14) { for (let x = fx - 120; x < fx + 120; x += 6) box(g, x, y + Math.sin(x * 0.05) * 2, 4, 1, ROCK[1]); }
  for (let x = fx - 110; x < fx + 120; x += 46) { for (let y = B - 190; y < B; y += 4) box(g, x + Math.sin(y * 0.06) * 3, y, 1, 2, ROCK[0]); }
  box(g, fx + 40, B - 110, 10, 6, ROCK[0]); seg(g, [fx + 42, B - 108], [fx + 49, B - 106], '#7A3A1A'); seg(g, [fx + 42, B - 106], [fx + 48, B - 104], '#7A3A1A');
  g.restore();
  // (the cave mouth: dark, its lip lit, a glow inside after dark)
  polyI(g, [[fx - 52, B], [fx - 50, B - 30], [fx - 36, B - 48], [fx - 22, B - 34], [fx - 16, B]], '#1C1410');
  if (lit) { g.fillStyle = 'rgba(245, 158, 11, 0.4)'; g.beginPath(); g.ellipse(fx - 34, B - 10, 12, 10, 0, 0, Math.PI * 2); g.fill(); }
  seg(g, [fx - 50, B - 30], [fx - 36, B - 48], ROCK[5], 2);
  // (the pool: banded water, its rim of stones)
  g.fillStyle = INK; g.beginPath(); g.ellipse(fx + 30, B - 3, 42, 7, 0, 0, Math.PI * 2); g.fill();
  for (const [k, col] of [[1, '#1E6A90'], [0.8, '#2A8AB0'], [0.5, '#5AB4D8'], [0.2, '#C6E8FC']] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(fx + 30, B - 3 - (1 - k) * 2, 40 * k, 6 * k, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 9; k++) { const a = Math.PI * (0.05 + k * 0.11), bx = fx + 30 + Math.cos(a) * 42, by = B - 3 + Math.sin(a) * 7; box(g, bx - 3, by - 2, 6, 4, INK); box(g, bx - 2, by - 1, 4, 2, ROCK[3]); }
  // (ferns and jungle crowns tucked in its folds, a fake stone with a speaker grille)
  for (const [dx, dy, r] of [[-80, -60, 14], [70, -100, 12], [20, -170, 16], [-30, -130, 10], [96, -40, 12]] as const) {
    const L = R6('#3F7A22');
    g.fillStyle = INK; g.beginPath(); g.arc(fx + dx, B + dy, r + 1, 0, Math.PI * 2); g.fill();
    for (const [k, col] of [[1, L[1]], [0.78, L[2]], [0.5, L[3]], [0.22, L[4]]] as const) { g.fillStyle = col; g.beginPath(); g.arc(fx + dx - r * (1 - k) * 0.4, B + dy - r * (1 - k) * 0.4, r * k, 0, Math.PI * 2); g.fill(); }
    checker(g, fx + dx - r * 0.7, B + dy, r * 1.3, 2, L[2]);
  }
  for (let k = 0; k < 7; k++) { const a = Math.PI + 0.3 + k * 0.4; g.strokeStyle = '#2F6B22'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx + 64, B); g.quadraticCurveTo(fx + 64 + Math.cos(a) * 10, B - 16, fx + 64 + Math.cos(a) * 20, B - 6 + Math.sin(a) * 4); g.stroke(); }
  box(g, fx - 92, B - 12, 16, 12, INK); box(g, fx - 91, B - 11, 14, 11, ROCK[3]); for (let k = 0; k < 4; k++) box(g, fx - 89, B - 9 + k * 2, 10, 1, '#3A2A1A');
};

// ---------------------------------------------------------------------------------------------------------------
// FOREIGN LANDS

const foreignLook: L = { sx: 1, sy: 1, gap: 1, fill: ['#FFFFFF', '#FEE2E2', '#FECACA', '#F87171'], dither: true, shadow: '#0A1A4A' };
const onionDome = (g: Ctx, ox: number, lit: boolean) => {
  const W = R6('#F2E6D0'), G = R6('#2E7D5B'), Au = GOLD;
  // (the hall: stucco, a band of tiles, arched windows with their kokoshnik gables, the door; the drum, the dome)
  flatTop(g, ox - 34, ox + 34, B - 72, ox, S, W);
  wall(g, ox - 32, B - 72, 64, 72, W); plaster(g, ox - 32, B - 72, 64, 72, W, 3);
  for (let k = 0; k < 64; k += 6) { box(g, ox - 32 + k, B - 66, 5, 5, k % 12 ? '#1E40AF' : '#DC2626'); box(g, ox - 31 + k, B - 65, 2, 2, '#FDE047'); }
  for (const wx of [ox - 24, ox + 12]) { win(g, wx, B - 52, 12, 22, lit, { frame: '#7A2A22', arch: true, curtain: '#DC2626', seed: wx }); polyI(g, [[wx - 4, B - 52], [wx + 6, B - 64], [wx + 16, B - 52]], G[3]); }
  door(g, ox - 7, B, 14, 26, '#7A2A22', { frame: '#C9A227', arch: true });
  const dr = R6('#F2E6D0');
  wall(g, ox - 11, B - 106, 22, 34, dr); for (let k = 0; k < 3; k++) win(g, ox - 8 + k * 6, B - 100, 3, 10, lit, { frame: '#7A2A22', arch: true, sill: false, mull: 1, trans: false, seed: k + 4 });
  box(g, ox - 13, B - 108, 26, 3, INK); box(g, ox - 12, B - 107, 24, 1, Au[4]);
  g.save(); g.beginPath(); g.moveTo(ox - 2, B - 106); g.bezierCurveTo(ox - 30, B - 120, ox - 14, B - 142, ox, B - 158); g.bezierCurveTo(ox + 14, B - 142, ox + 30, B - 120, ox + 2, B - 106); g.closePath();
  g.fillStyle = INK; g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.clip();
  for (let u = -22; u < 22; u += 2) { const t = (u + 22) / 44; box(g, ox + u, B - 160, 2, 56, G[t < 0.15 ? 4 : t < 0.3 ? 5 : t < 0.6 ? 3 : t < 0.8 ? 2 : 1]); }
  for (let k = 0; k < 5; k++) { g.strokeStyle = Au[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(ox, B - 158); g.quadraticCurveTo(ox - 20 + k * 10, B - 130, ox - 6 + k * 3, B - 106); g.stroke(); }
  g.restore();
  box(g, ox - 1, B - 172, 2, 16, Au[2]); box(g, ox - 5, B - 168, 10, 2, Au[3]); box(g, ox - 3, B - 163, 6, 2, Au[3]); g.fillStyle = Au[4]; g.beginPath(); g.arc(ox, B - 158, 3, 0, Math.PI * 2); g.fill();
};
const bavarian = (g: Ctx, bx: number, lit: boolean) => {
  const w = 64, h = 96, top = B - h, cx = bx + w / 2, P = [PL[1], PL[2], PL[3], PL[4], PL[5], '#FFFFFF'], Rf = R6('#9A3A22');
  const apex: Pt = [cx, top - 46];
  gableBack(g, bx - 8, bx + w + 8, top, apex[0], apex[1], cx, S, Rf, 7);
  box(g, bx - 1, top - 1, w + 2, h + 1, INK); box(g, bx, top, w, h, P[4]); plaster(g, bx, top, w, h, P, 9);
  box(g, bx + w - 6, top, 6, h, P[2]);
  ashlar(g, bx, B - 30, w, 30, R6('#C8BFAE'), 2, 12, 6);
  g.strokeStyle = TI[2]; g.lineWidth = 3; g.beginPath();
  for (const [x1, y1, x2, y2] of [[0, 0, w, 0], [0, 33, w, 33], [0, 0, 20, 33], [w, 0, w - 20, 33], [w / 2, 0, w / 2, 33], [0, 0, 0, 66], [w, 0, w, 66]] as const) { g.moveTo(bx + x1, top + y1); g.lineTo(bx + x2, top + y2); }
  g.stroke();
  polyI(g, [[bx - 8, top], apex, [bx + w + 8, top]], Rf[3]);
  g.save(); g.beginPath(); g.moveTo(bx - 8, top); g.lineTo(apex[0], apex[1]); g.lineTo(bx + w + 8, top); g.closePath(); g.clip();
  for (let r = 0; r < 9; r++) { const y = top - r * 5; for (let xx = bx - 8 + (r % 2) * 3; xx < bx + w + 8; xx += 6) { box(g, xx, y - 5, 5, 4, Rf[hash(xx + r) > 0.6 ? 4 : 3]); box(g, xx, y - 1, 5, 1, Rf[1]); } }
  g.restore();
  win(g, cx - 5, top - 30, 10, 12, lit, { frame: TI[3], sill: false, seed: 41 });
  for (const wx of [bx + 8, bx + 40]) win(g, wx, top + 10, 14, 18, lit, { frame: TI[2], shutters: '#15803D', box: true, curtain: '#F8FAFC', seed: wx });
  win(g, bx + 6, B - 26, 20, 16, lit, { frame: TI[2], mull: 3, seed: 7 });
  door(g, bx + 38, B, 16, 26, '#5E3E2A', { frame: TI[2], arch: true, planks: true });
  hangSign(g, bx + w, top + 40, 1, 24, 12, '#F8FAFC', (sx, sy) => { g.fillStyle = '#C9A227'; g.beginPath(); g.ellipse(sx - 4, sy, 3, 4, 0, 0, Math.PI * 2); g.fill(); box(g, sx - 1, sy - 4, 6, 8, '#FDE68A'); box(g, sx - 1, sy - 4, 6, 2, '#FFFFFF'); });
  // (a painted clock in the gable, a coat of arms)
  g.fillStyle = INK; g.beginPath(); g.arc(cx, top - 14, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(cx, top - 14, 4, 0, Math.PI * 2); g.fill(); box(g, cx, top - 17, 1, 3, INK); box(g, cx, top - 14, 3, 1, INK);
  chimney(g, bx + w - 16, top - 34, top - 12, 8, R6('#7A2A22'));
};
const arcade = (g: Ctx, ax: number, lit: boolean) => {
  const w = 96, h = 72, top = B - h, cx = ax + w / 2, W = R6('#F4E8D2'), T = R6('#C2410C');
  eaveRoof(g, ax - 4, ax + w + 4, top - 10, 12, cx, S, T, 'tile', 4);
  wall(g, ax, top - 10, w, h + 10, W); plaster(g, ax, top - 10, w, h + 10, W, 5);
  // (the upper floor: windows with iron balconies, flower pots)
  for (const wx of [ax + 10, ax + 42, ax + 74]) { win(g, wx, top, 12, 16, lit, { frame: '#5E3E22', shutters: '#1E40AF', seed: wx + 1 }); box(g, wx - 4, top + 17, 20, 2, INK); for (let k = 0; k < 6; k++) box(g, wx - 3 + k * 4, top + 11, 1, 6, INK); box(g, wx - 4, top + 10, 20, 1, INK); box(g, wx, top + 7, 3, 3, '#DC2626'); box(g, wx + 9, top + 7, 3, 3, '#F472B6'); }
  // (the arcade: arches on columns, the shade under them, a tiled dado, a lantern in each)
  box(g, ax, B - 46, w, 2, W[1]);
  for (let k = 0; k < 4; k++) {
    const x = ax + 6 + k * 22;
    box(g, x - 2, B - 44, 18, 44, INK); g.fillStyle = '#4A2E1A'; g.beginPath(); g.roundRect(x - 1, B - 43, 16, 43, [8, 8, 0, 0]); g.fill();
    g.fillStyle = W[2]; g.beginPath(); g.roundRect(x - 1, B - 43, 16, 4, [8, 8, 0, 0]); g.fill();
    box(g, x + 1, B - 30, 12, 24, lit ? '#F0A83E' : '#6A4A30'); box(g, x + 6, B - 38, 2, 6, INK); box(g, x + 5, B - 32, 4, 5, lit ? '#FFF4C8' : '#C9A227');
    for (let j = 0; j < 4; j++) box(g, x + 1 + j * 3, B - 8, 2, 8, j % 2 ? '#1E40AF' : '#F8FAFC');
  }
  for (let k = 0; k <= 4; k++) { const px = ax + 4 + k * 22; box(g, px - 2, B - 46, 4, 46, W[4]); box(g, px - 3, B - 48, 6, 3, W[5]); }
  board(g, cx, top - 6, 50, 9, 'CANTINA', foreignLook, '#1E40AF', '#5E3E22');
};
const pagoda = (g: Ctx, px: number, lit: boolean) => {
  const Rd = R6('#B91C1C'), Gr = R6('#1F3B2A'), Au = GOLD;
  for (let k = 0; k < 3; k++) {
    const y = B - 30 - k * 36, w = 54 - k * 10, bw = w - 16;
    wall(g, px - bw / 2, y, bw, 30, Rd);
    for (let c = 0; c <= 3; c++) { const cxk = px - bw / 2 + (c * bw) / 3; box(g, cxk - 1, y, 3, 30, Rd[1]); }
    win(g, px - 5, y + 8, 10, 12, lit, { frame: Au[3], sill: false, mull: 2, seed: k * 9 + 2 });
    // (the roof tier: swept up at its ends, tiles in courses, its underside, the top going back)
    const l = px - w / 2 - 8, r = px + w / 2 + 8, ey = y + 4;
    poly(g, [[l + 6, ey - 8], [r - 6, ey - 8], back(r - 6, ey - 8, px, S), back(l + 6, ey - 8, px, S)], Gr[2]);
    g.beginPath(); g.moveTo(l, ey); g.quadraticCurveTo(l + 8, ey - 4, l + 6, ey - 10); g.lineTo(r - 6, ey - 10); g.quadraticCurveTo(r - 8, ey - 4, r, ey); g.closePath();
    g.fillStyle = Gr[3]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    for (let xx = l + 8; xx < r - 8; xx += 3) box(g, xx, ey - 9, 1, 8, Gr[(xx / 3) % 2 < 1 ? 4 : 2]);
    box(g, l + 4, ey - 1, r - l - 8, 2, Rd[1]);
    for (const ex of [l, r]) box(g, ex - 1, ey - 2, 3, 3, Au[4]);
  }
  box(g, px - 1, B - 160, 2, 28, Au[2]); for (let k = 0; k < 5; k++) box(g, px - 4 + k * 0.5, B - 154 + k * 4, 8 - k, 2, Au[3]);
  door(g, px - 6, B, 12, 18, '#7F1D1D', { frame: Au[3] });
  // (lanterns hung from the lowest eaves)
  for (const lx of [px - 30, px + 30]) { box(g, lx, B - 26, 1, 4, INK); g.fillStyle = INK; g.beginPath(); g.ellipse(lx, B - 18, 4, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = lit ? '#FCA5A5' : '#DC2626'; g.beginPath(); g.ellipse(lx, B - 18, 3, 4, 0, 0, Math.PI * 2); g.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------

export const FACADES: Record<string, Facade> = {
  space: (g, cx, lit) => { spaceDome(g, cx + 46, lit); tomorrowHall(g, cx - 172, lit); moonRocket(g, cx - 84, lit); saucerDiner(g, cx + 162, lit); },
  frontier: (g, cx, lit) => {
    stockade(g, cx - 70, cx + 112, lit);
    blockhouse(g, cx + 100, lit);
    generalStore(g, cx - 214, lit);
    waterTower(g, cx + 196, lit);
  },
  spooky: (g, cx, lit) => { cemetery(g, cx, lit); hauntedHouse(g, cx - 214, lit); mausoleum(g, cx + 10, lit); },
  cartoon: (g, cx, lit) => {
    toadstoolCottage(g, cx - 196, lit); crookedShop(g, cx - 100, lit); toonWaterTower(g, cx + 150, lit);
    lollipop(g, cx + 60, 70, '#4CC89C'); lollipop(g, cx + 86, 56, '#F2822A'); lollipop(g, cx + 222, 64, '#9476DE');
  },
  america: (g, cx, lit) => {
    const fronts = [[cx - 262, 70, '#B4533C', 'HARDWARE'], [cx - 190, 70, '#E8DCC4', 'BAKERY'], [cx + 118, 70, '#7A9ABE', 'BARBER'], [cx + 190, 74, '#B4533C', 'PHARMACY']] as const;
    fronts.forEach(([x0, w, col, name], i) => mainStreet(g, x0, w, col, name, lit, i * 5));
  },
  hollywood: (g, cx, lit) => {
    for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(254, 249, 195, ${(0.06 + k * 0.04).toFixed(2)})`; g.beginPath(); g.ellipse(cx + 120, B - 150, 90 - k * 26, 40 - k * 10, 0, 0, Math.PI * 2); g.fill(); }
    soundstage(g, cx + 30, lit); studioGate(g, cx - 165, lit);
  },
  fantasy: (g, cx, lit) => {
    castleWall(g, cx - 66, cx + 94, lit);
    cottage(g, cx - 222, 70, 70, lit, 3, 'TEAS'); cottage(g, cx - 136, 62, 84, lit, 8, 'WANDS');
    storybookTower(g, cx + 170, lit);
  },
  adventure: (g, cx, lit) => { fakeRock(g, cx + 150, lit); ruin(g, cx - 40); tradingPost(g, cx - 214, lit); tiki(g, cx - 110); },
  foreign: (g, cx, lit) => { onionDome(g, cx - 196, lit); bavarian(g, cx - 120, lit); arcade(g, cx + 56, lit); pagoda(g, cx + 196, lit); },
  staff: () => { /* (the back building's its own: draw.ts) */ },
};

export { gutter, ventPipe };
