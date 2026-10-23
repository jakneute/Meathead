// MOROCCO's art (the SNES pass): the medina fronts (lime plaster in sand, ochre, rose and clay over a zellige dado,
// the stepped merlons along their tops, horseshoe-arched shop fronts with their goods inside (hanging rugs, brass
// lanterns, tagines and painted plates, babouches, fezzes), studded cedar doors, mashrabiya lattice windows, the green
// glazed tile canopy over the door on its carved brackets, a brass lantern by it, painted boards; braced from behind),
// the gate (a tiled horseshoe arch under its merlons), the ROOFTOPS' houses (lime plaster, zellige under their roofs,
// the cedar rafter ends, wooden spouts, the doors, iron-grilled windows; the parapet along each roof's back), the
// CARPETS hung on lines between them (field, border and guard stripes, the stepped medallion, the fringe, the fold
// over the line), the crates, THE TOWER (its inside: the souvenir shelves, slits of sky, the elevator OUT OF ORDER; its
// walls in cut stone and zellige, the cedar floors, the balcony on its corbels, the lantern room and its green dome and
// gold finial; the carpets off its far side on their poles), THE TANNERY (the dye vats: their stained clay backs, the
// dye going back and bubbling and steaming, the dye over whoever's in one; the drying racks and their hides), the
// hookah lounge's tent (its striped canopy and tasseled valance, the lounge inside: rugs, the brass tray, the hookah,
// a lantern), the poufs, the spice stall (cones of spice, sacks); and THE SOUK (the covered market's far wall, the
// stalls' goods, the striped awnings, the corral and its broken gate, the dust, the runaway ride camels). Still art
// painted once for the hour; only what moves live. No layout here: index.ts and souk.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow, pixelBlob,
  stucco, planks, stoneBlocks, barrelTile, facade, still, board, words, plain, LOOKS, onScreen, lip, topBack, sideBack, box3Back, ledge3, pavingBack, skyAt, flagPole, nearX, NEAR_BAND,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const SAND = '#E7C9A0', CLAY = '#C2794A', ROSE = '#D08A6E', OCHRE = '#D6A25A', TILEBLUE = '#1D4ED8', TILEGREEN = '#15803D', CEDAR = '#7A4A26', BRASS = '#C8962E', LIME = '#F2EDE2';
/** The dark inside an arch (a herd gate's: what a camel going in goes toward). */
const DARK_IN = '#120A0C';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** Zellige (local): a band of little glazed tiles in a repeating star (an eight-point star of blue round an ochre
 *  heart, on white, a green diamond between), each tile glinting, the grout dark between, edged top and bottom. */
export const zellige = (g: Ctx, x: number, y: number, w: number, h: number, scenery = true) => {
  const f = scenery ? dimmed : hour;
  const Bl = ramp6(f(TILEBLUE)), Gr = ramp6(f(TILEGREEN)), Wt = ramp6(f(LIME)), Oc = ramp6(f(OCHRE));
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  box(g, x, y, w, h, Wt[3]); checker(g, x, y + h - 3, w, 2, Wt[2], 0, 1);
  const rows = Math.max(1, Math.round(h / 12)), rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const cy = Math.round(y + rh * (r + 0.5));
    for (let cx = x + 6 + (r % 2) * 6; cx < x + w + 8; cx += 12) {
      poly(g, [[cx, cy - 6], [cx + 6, cy], [cx, cy + 6], [cx - 6, cy]], Bl[1]);
      box(g, cx - 4, cy - 4, 8, 8, Bl[1]);
      poly(g, [[cx, cy - 5], [cx + 5, cy], [cx, cy + 5], [cx - 5, cy]], Bl[3]);
      box(g, cx - 3, cy - 3, 6, 6, Bl[3]);
      box(g, cx - 3, cy - 3, 2, 1, Bl[5]); box(g, cx - 3, cy - 2, 1, 1, Bl[4]); box(g, cx + 1, cy + 2, 2, 1, Bl[2]);
      box(g, cx - 1, cy - 1, 2, 2, Oc[3]); box(g, cx - 1, cy - 1, 1, 1, Oc[5]);
      const gx = cx + 6;
      poly(g, [[gx, cy - 3], [gx + 3, cy], [gx, cy + 3], [gx - 3, cy]], Gr[3]); box(g, gx - 1, cy - 1, 1, 1, Gr[5]);
    }
  }
  g.restore();
  box(g, x, y, w, 1, Bl[0]); box(g, x, y + h - 1, w, 1, Bl[0]);
};
/** A horseshoe arch's outline (local; a path: begin and fill it yourself): its round head swelling past its jambs,
 *  `r` its radius, its top `h` over its foot. */
export const horseshoe = (g: Ctx, cx: number, foot: number, r: number, h: number) => {
  const cy = foot - h + r, jx = r * 0.8, a = Math.asin(0.6);
  g.moveTo(cx - jx, foot); g.lineTo(cx - jx, cy + r * 0.6); g.arc(cx, cy, r, Math.PI - a, a); g.lineTo(cx + jx, foot); g.closePath();
};
const fillShoe = (g: Ctx, cx: number, foot: number, r: number, h: number, col: string) => { g.fillStyle = col; g.beginPath(); horseshoe(g, cx, foot, r, h); g.fill(); };
/** A horseshoe-arched opening (local) in a carved surround: the ring in its trim (lit up its left, its voussoirs in
 *  steps), and the opening itself `inside`; `fill` paints into it (clipped). */
export const archOpening = (g: Ctx, cx: number, foot: number, r: number, h: number, T: string[], inside: string, fill?: () => void) => {
  fillShoe(g, cx, foot, r + 6, h + 6, INK);
  fillShoe(g, cx, foot, r + 5, h + 5, T[3]);
  const cy = foot - h + r;
  for (let k = 0; k <= 12; k++) { const a = Math.PI * 0.8 + (k / 12) * Math.PI * 1.4, vx = cx + Math.cos(a) * (r + 2.5), vy = cy + Math.sin(a) * (r + 2.5); box(g, vx - 1, vy - 1, 3, 3, k % 2 ? T[2] : T[4]); }
  box(g, cx - r * 0.8 - 5, cy + r * 0.6, 2, foot - cy - r * 0.6, T[4]); box(g, cx + r * 0.8 + 3, cy + r * 0.6, 2, foot - cy - r * 0.6, T[1]);
  fillShoe(g, cx, foot, r + 1, h + 1, INK);
  fillShoe(g, cx, foot, r, h, inside);
  g.save(); g.beginPath(); horseshoe(g, cx, foot, r, h); g.clip();
  fill?.();
  // (the shade inside the head of it)
  box(g, cx - r, foot - h, r * 2, 5, 'rgba(28, 16, 20, 0.35)'); checker(g, cx - r, foot - h + 5, r * 2, 2, 'rgba(28, 16, 20, 0.35)', 0, 1);
  g.restore();
};
/** A studded cedar door filling a horseshoe opening (local; clipped to it): planks up and down, rows of brass studs,
 *  the iron ring knocker. */
export const studDoor = (g: Ctx, cx: number, foot: number, r: number, h: number, scenery = true, seed = 0) => {
  const W = ramp6(scenery ? dimmed(CEDAR) : hour(CEDAR)), Bz = ramp6(scenery ? dimmed(BRASS) : hour(BRASS));
  g.save(); g.beginPath(); horseshoe(g, cx, foot, r, h); g.clip();
  planks(g, cx - r, foot - h, r * 2, h, W, true, seed, 6);
  for (let y = foot - h + 8; y < foot - 4; y += 10) for (let x = cx - r + 3; x < cx + r - 2; x += 6) { box(g, x, y, 2, 2, Bz[3]); box(g, x, y, 1, 1, Bz[5]); }
  box(g, cx - 1, foot - h, 2, h, W[0]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(cx + 5, foot - h * 0.45, 3, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = Bz[3]; g.lineWidth = 1; g.beginPath(); g.arc(cx + 5, foot - h * 0.45, 3, 0, Math.PI * 2); g.stroke();
};
/** A mashrabiya (local): a cedar frame, its lattice of little holes (dark inside, lit warm after dark), a little tiled
 *  hood over it. */
export const mashrabiya = (g: Ctx, x: number, y: number, w: number, h: number, scenery = true) => {
  const W = ramp6(scenery ? dimmed(CEDAR) : hour(CEDAR)), T = ramp6(scenery ? dimmed(TILEGREEN) : hour(TILEGREEN)), on = lampsOn();
  box(g, x - 3, y - 2, w + 6, h + 5, INK); box(g, x - 2, y - 1, w + 4, h + 3, W[3]); box(g, x - 2, y - 1, w + 4, 1, W[5]); box(g, x - 2, y - 1, 1, h + 3, W[4]);
  box(g, x, y + 1, w, h - 1, W[2]);
  for (let yy = y + 2, row = 0; yy < y + h - 1; yy += 3, row++) for (let xx = x + 1 + (row % 2) * 2; xx < x + w - 1; xx += 4) box(g, xx, yy, 2, 2, on ? (row % 3 ? '#E8A646' : '#FCD884') : '#1C1014');
  box(g, x + w / 2 - 1, y + 1, 2, h - 1, W[3]);
  // (the little hood: green tile on a cedar shelf)
  box(g, x - 6, y - 8, w + 12, 7, INK); barrelTile(g, x - 5, y - 7, w + 10, 5, T, 5);
  box(g, x - 4, y - 2, w + 8, 2, W[1]);
};
/** Moroccan merlons (local) along a wall's top at y: each stepped up in three to a point, lit up the left, shaded. */
export const merlons = (g: Ctx, x: number, y: number, w: number, R: string[], s = 7) => {
  for (let mx = x + 2; mx + s * 2 <= x + w + 1; mx += s * 3) {
    const st: [number, number, number][] = [[0, s * 2, s], [Math.round(s * 0.4), Math.round(s * 1.2), Math.round(s * 0.6)], [Math.round(s * 0.75), Math.round(s * 0.5), Math.round(s * 0.5)]];
    let top = y;
    for (const [ox, ww, hh] of st) {
      box(g, mx + ox - 1, top - hh - 1, ww + 2, hh + 1, INK);
      box(g, mx + ox, top - hh, ww, hh, R[3]); box(g, mx + ox, top - hh, ww, 1, R[5]); box(g, mx + ox, top - hh, 1, hh, R[4]); box(g, mx + ox + ww - 1, top - hh, 1, hh, R[1]);
      top -= hh;
    }
  }
};
/** A brass lantern (live or still): its chain, the pierced dome cap, the body (stars punched through it, lit after
 *  dark, glowing), the finial under it. */
export const brassLantern = (c: Ctx, x: number, y: number, r: number, scenery = false, chain = 10) => {
  const B = ramp6(scenery ? dimmed(BRASS) : hour(BRASS)), on = lampsOn();
  for (let k = y - r - chain; k < y - r; k += 3) { box(c, x - 1, k, 2, 2, INK); box(c, x, k, 1, 1, B[4]); }
  if (on && !scenery) steppedGlow(c, x, y, r * 3.2, '#FFB060', 0, 0.28, 4);
  poly(c, [[x - r * 0.5, y - r], [x, y - r * 1.5], [x + r * 0.5, y - r]], INK); poly(c, [[x - r * 0.4, y - r], [x, y - r * 1.35], [x + r * 0.4, y - r]], B[3]);
  const body: [number, number][] = [[x - r * 0.55, y - r], [x + r * 0.55, y - r], [x + r, y - r * 0.2], [x + r * 0.7, y + r * 0.6], [x - r * 0.7, y + r * 0.6], [x - r, y - r * 0.2]];
  poly(c, body.map(([px, py]) => [px + (px < x ? -1 : 1), py + (py > y ? 1 : -1)] as [number, number]), INK);
  poly(c, body, on ? mix(B[3], '#FFE7A0', 0.35) : B[2]);
  poly(c, [body[0], [x, y - r], [x, y + r * 0.6], body[4], body[5]], on ? mix(B[4], '#FFE7A0', 0.4) : B[3]);
  // (the stars punched through it)
  for (const [sx, sy] of [[-0.45, -0.4], [0.05, -0.55], [0.45, -0.3], [-0.3, 0.15], [0.25, 0.2]] as const) {
    const px = Math.round(x + sx * r), py = Math.round(y + sy * r);
    const col = on ? '#FFF4C8' : '#2A1A10';
    box(c, px - 1, py, 3, 1, col); box(c, px, py - 1, 1, 3, col);
  }
  box(c, x - r * 0.7, y - r * 0.2, r * 1.4, 1, B[1]);
  box(c, x - 1, y + r * 0.6, 3, r * 0.5, INK); box(c, x, y + r * 0.6, 1, r * 0.5, B[4]); ball(c, x, y + r * 1.2, 2, B[3], true);
};
/** A string of brass lanterns swagged between two points (on a chain). */
export const lanternString = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, step = 40) => {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  const pt = (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)] as const;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= 16; i++) { const [x, y] = pt(i / 16); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  for (let i = 1; i < n; i++) { const [x, y] = pt(i / n); brassLantern(c, Math.round(x), Math.round(y) + 14, 6, false, 6); }
};

// ---------------------------------------------------------------------------------------------------------------
// Shop goods (local, inside an opening at x..x+w, y..y+h: its foot at y + h)

type Goods = 'rugs' | 'lamps' | 'pots' | 'slippers' | 'fez';
const goodsIn = (g: Ctx, x: number, y: number, w: number, h: number, kind: Goods, seed: number) => {
  const on = lampsOn(), D = (c: string) => ramp6(dimmed(c));
  box(g, x, y, w, h, on ? '#4A2A14' : '#24161A'); if (on) { box(g, x, y + h * 0.3, w, h * 0.7, '#6A3E18'); checker(g, x, y + h * 0.3 - 2, w, 2, '#6A3E18', 0, 1); }
  const foot = y + h;
  if (kind === 'rugs') {
    const COLS = ['#9F1D1D', '#1E2F6A', '#7C3A1A', '#1F4A2E', '#5B2A6E'];
    for (let k = 0, rx = x + 2; rx < x + w - 6; k++) {
      const rw = 9 + Math.floor(hash(seed + k) * 6), R = D(COLS[((Math.floor(seed + k) % COLS.length) + COLS.length) % COLS.length]), top = y + 4 + (k % 2) * 4;
      box(g, rx - 1, top - 1, rw + 2, h - 10, INK); box(g, rx, top, rw, h - 12, R[3]); box(g, rx, top, 2, h - 12, R[4]); box(g, rx + rw - 2, top, 2, h - 12, R[1]);
      for (let yy = top + 6; yy < top + h - 18; yy += 8) { box(g, rx + 2, yy, rw - 4, 2, D('#F2C14E')[3]); box(g, rx + rw / 2 - 1, yy + 3, 2, 2, D('#F4EFE4')[3]); }
      for (let fx = rx; fx < rx + rw; fx += 2) box(g, fx, top + h - 12, 1, 3, D('#F4EFE4')[3]);
      rx += rw + 2;
    }
  } else if (kind === 'lamps') {
    for (let k = 0; k < Math.floor(w / 14); k++) { const lx = x + 8 + k * 14, ly = y + 14 + (k % 2) * 10; brassLantern(g, lx, ly, 5, true, ly - y - 6); if (on) steppedGlow(g, lx, ly, 14, '#FFB060', 0, 0.25, 3); }
    box(g, x, foot - 14, w, 3, D(CEDAR)[3]);
    for (let k = 0; k < Math.floor(w / 10); k++) { const R = D(BRASS); box(g, x + 3 + k * 10, foot - 22, 7, 8, INK); box(g, x + 4 + k * 10, foot - 21, 5, 7, R[3]); box(g, x + 4 + k * 10, foot - 21, 2, 7, R[5]); }
  } else if (kind === 'pots') {
    // (painted plates up the back, tagines on the shelves)
    for (let k = 0; k < Math.floor(w / 13); k++) { const px0 = x + 7 + k * 13, py0 = y + 12, R = D(['#1E50A8', '#E8B04A', '#15803D', '#B91C1C'][((Math.floor(seed + k) % 4) + 4) % 4]); g.fillStyle = INK; g.beginPath(); g.arc(px0, py0, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(px0, py0, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = D(LIME)[3]; g.beginPath(); g.arc(px0, py0, 2.5, 0, Math.PI * 2); g.fill(); box(g, px0 - 3, py0 - 4, 2, 1, R[5]); }
    for (const sy of [foot - 30, foot - 8]) {
      box(g, x, sy, w, 3, D(CEDAR)[3]); box(g, x, sy, w, 1, D(CEDAR)[5]);
      for (let k = 0; k < Math.floor(w / 14); k++) {
        const tx = x + 8 + k * 14, R = D([CLAY, '#1E50A8', '#B45309', TILEGREEN][((Math.floor(Math.abs(seed + k + sy)) % 4) + 4) % 4]);
        box(g, tx - 6, sy - 3, 13, 3, INK); box(g, tx - 5, sy - 3, 11, 2, R[2]);
        poly(g, [[tx - 5, sy - 3], [tx, sy - 13], [tx + 5, sy - 3]], INK); poly(g, [[tx - 4, sy - 3], [tx, sy - 12], [tx + 4, sy - 3]], R[3]); poly(g, [[tx - 4, sy - 3], [tx, sy - 12], [tx - 1, sy - 3]], R[4]);
        box(g, tx - 1, sy - 15, 2, 3, R[4]);
      }
    }
  } else if (kind === 'slippers') {
    for (let r = 0; r < 4; r++) {
      const sy = y + 12 + r * ((h - 16) / 4);
      box(g, x, sy + 5, w, 2, D(CEDAR)[3]);
      for (let k = 0; k < Math.floor(w / 9); k++) { const R = D(['#EAB308', '#B91C1C', '#F4EFE4', '#1E50A8'][((Math.floor(r + k + seed) % 4) + 4) % 4]), sx = x + 2 + k * 9; poly(g, [[sx, sy + 5], [sx + 2, sy], [sx + 7, sy + 2], [sx + 8, sy + 5]], INK); poly(g, [[sx + 1, sy + 4], [sx + 2, sy + 1], [sx + 6, sy + 2], [sx + 7, sy + 4]], R[3]); box(g, sx + 2, sy + 1, 2, 1, R[5]); }
    }
  } else {
    // (fezzes stacked up in a pyramid, their tassels)
    const R = D('#B91C1C');
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - r; k++) {
      const fx = x + w / 2 - (4 - r) * 6 + k * 12 + 6, fy = foot - 4 - r * 11;
      poly(g, [[fx - 6, fy], [fx - 4, fy - 10], [fx + 4, fy - 10], [fx + 6, fy]], INK); poly(g, [[fx - 5, fy - 1], [fx - 3, fy - 9], [fx + 3, fy - 9], [fx + 5, fy - 1]], R[3]); box(g, fx - 3, fy - 9, 2, 8, R[4]); box(g, fx + 2, fy - 9, 2, 8, R[2]);
      box(g, fx, fy - 10, 1, 4, INK); box(g, fx + 1, fy - 7, 1, 3, INK);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The medina fronts (FACADE_D, braced) and the gate

export interface MaFront { rx: number; w: number; h: number; col: string; name: string; goods: Goods }
const paintFront = (g: Ctx, f: MaFront) => {
  const { w, h } = f, R = ramp6(dimmed(f.col)), S = ramp6(dimmed(LIME)), seed = f.rx;
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, R, true); stucco(g, 0, -h, w, h, R, seed);
  // (where the plaster's fallen off: the mud brick under it, a lit lip under each patch)
  for (let k = 0; k < 2; k++) {
    const pw = 18 + hash(seed + k * 5.3) * 22, ph = 10 + hash(seed + k * 2.1) * 10, px0 = 14 + hash(seed + k * 3.1) * (w - pw - 28), py0 = -h + 30 + hash(seed + k * 1.7) * (h - 150);
    box(g, px0 - 1, py0 - 1, pw + 2, ph + 2, R[1]); stoneBlocks(g, px0, py0, pw, ph, ramp6(dimmed('#A8724A')), seed + k, 8, 4); box(g, px0, py0 + ph, pw, 1, R[4]);
  }
  // (the merlons along its top, the zellige band under them)
  merlons(g, 0, -h, w, R, 7);
  box(g, 0, -h + 6, w, 14, INK); zellige(g, 0, -h + 7, w, 12);
  // (the upper windows: mashrabiyas in their surrounds; two rows if it's tall)
  const winTop = -h + 34, winBot = -170, rows = winBot - winTop > 100 ? 2 : 1, wh = Math.min(44, (winBot - winTop - 14 * (rows - 1)) / rows);
  const n = Math.max(2, Math.floor((w - 30) / 64));
  if (wh > 16) for (let row = 0; row < rows; row++) for (let k = 0; k < n; k++) {
    const wx = Math.round(24 + k * ((w - 70) / Math.max(1, n - 1))), wy = Math.round(winTop + 8 + row * (wh + 14));
    box(g, wx - 5, wy - 4, 32, wh + 8, R[2]); box(g, wx - 5, wy - 4, 32, 1, R[1]);
    mashrabiya(g, wx, wy, 22, Math.round(wh));
  }
  // (a rug flung over a sill to air)
  if (hash(seed * 0.7) > 0.4 && wh > 16) {
    const rx0 = Math.round(24 + (n - 1) * ((w - 70) / Math.max(1, n - 1))) - 4, ry0 = Math.round(winTop + 8 + wh), Rg = ramp6(dimmed('#9F1D1D'));
    box(g, rx0 - 1, ry0 - 1, 32, 26, INK); box(g, rx0, ry0, 30, 24, Rg[3]); box(g, rx0 + 3, ry0 + 3, 24, 18, dimmed('#1E2F6A')); box(g, rx0 + 11, ry0 + 8, 8, 8, dimmed('#F2C14E')); box(g, rx0, ry0, 30, 2, Rg[4]);
    for (let fx = rx0; fx < rx0 + 30; fx += 2) box(g, fx, ry0 + 24, 1, 3, dimmed('#F4EFE4'));
  }
  // (the ground floor: the shop's arch and its goods; a studded door if there's room; the canopy over the shop)
  const dx = Math.round(w / 2), T = ramp6(dimmed(LIME));
  archOpening(g, dx, 0, 28, 82, T, '#24161A', () => goodsIn(g, dx - 28, -82, 56, 82, f.goods, seed));
  if (w >= 260) { const sx = w - 46; archOpening(g, sx, 0, 15, 62, ramp6(dimmed(TILEBLUE)), INK, () => studDoor(g, sx, 0, 15, 62, true, seed)); }
  // (the green tile canopy over the shop on its carved cedar brackets)
  const Wd = ramp6(dimmed(CEDAR)), Gt = ramp6(dimmed(TILEGREEN));
  for (const bx of [dx - 40, dx + 34]) { box(g, bx - 1, -120, 8, 16, INK); box(g, bx, -120, 6, 4, Wd[3]); box(g, bx + 1, -116, 4, 5, Wd[2]); box(g, bx + 2, -111, 2, 5, Wd[1]); box(g, bx, -120, 6, 1, Wd[5]); }
  box(g, dx - 46, -134, 92, 15, INK); barrelTile(g, dx - 45, -133, 90, 12, Gt, 6); box(g, dx - 46, -121, 92, 2, Wd[2]);
  // (the dado: zellige up the foot)
  box(g, 0, -23, w, 1, INK);
  for (const [a, b] of [[0, dx - 35], [dx + 35, w >= 260 ? w - 65 : w], ...(w >= 260 ? [[w - 27, w]] : [])] as [number, number][]) if (b - a > 4) zellige(g, a, -22, b - a, 18);
  box(g, 0, -4, w, 4, R[1]); checker(g, 0, -6, w, 2, R[1], 0, 1);
  // (a brass lantern by the shop; the board on the canopy, nothing over it)
  box(g, dx + 42, -110, 10, 2, INK); brassLantern(g, dx + 50, -92, 6, true, 4);
  board(g, dx, -150, [f.name], LOOKS.morocco(1), dimmed(TILEBLUE), ramp6(dimmed(BRASS)), 4);
  void S;
};
export const drawFront = (c: Ctx, v: View, x: number, f: MaFront) => facade(c, v, `ma-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 50, 22);

/** The gate (at 0.92: the bazaar's way in): two towers of plaster under their merlons, the tiled horseshoe arch between
 *  (blue zellige round it, the inscription band's pattern, the dark passage through, the studs on its open doors),
 *  green tile over it. */
const paintGate = (g: Ctx) => {
  const W = 260, H = 260, R = ramp6(dimmed(SAND)), Bl = ramp6(dimmed(TILEBLUE)), Gt = ramp6(dimmed(TILEGREEN));
  box(g, -1, -H - 1, W + 2, H + 1, INK);
  slab(g, 0, -H, W, H, R, true); stucco(g, 0, -H, W, H, R, 77);
  // (the towers either side, standing proud, their own merlons)
  for (const tx of [0, W - 50]) { box(g, tx - 1, -H - 13, 52, H + 13, INK); slab(g, tx, -H - 12, 50, H + 12, R, true); stucco(g, tx, -H - 12, 50, H + 12, R, tx + 3); merlons(g, tx, -H - 12, 50, R, 6); box(g, tx, -H + 30, 50, 14, INK); zellige(g, tx, -H + 31, 50, 12); for (const wy of [-H + 70, -H + 140]) { box(g, tx + 21, wy, 8, 18, INK); box(g, tx + 22, wy + 1, 6, 16, '#1C1014'); } box(g, tx + 48, -H - 12, 2, H + 12, R[1]); }
  merlons(g, 50, -H, W - 100, R, 6);
  // (the tiled panel round the arch: blue zellige, a band of pattern over it in place of an inscription)
  box(g, 50, -H + 20, W - 100, H - 20, INK); box(g, 52, -H + 22, W - 104, 22, Bl[2]);
  for (let x = 54; x < W - 54; x += 8) { box(g, x, -H + 26, 4, 4, dimmed('#F2C14E')); box(g, x + 2, -H + 34, 4, 4, Bl[4]); }
  g.save(); g.beginPath(); g.rect(52, -H + 44, W - 104, H - 44); g.clip(); zellige(g, 52, -H + 44, W - 104, H - 44); g.restore();
  // (the arch: its ring, the dark passage through, the doors folded back inside it)
  archOpening(g, W / 2, 0, 58, 176, ramp6(dimmed(LIME)), '#1C1014', () => {
    box(g, W / 2 - 60, -176, 120, 176, '#1C1014');
    box(g, W / 2 - 34, -110, 68, 110, mix(dimmed(SAND), '#1C1014', 0.55)); checker(g, W / 2 - 34, -112, 68, 2, mix(dimmed(SAND), '#1C1014', 0.55), 0, 1);
    for (const dx0 of [W / 2 - 46, W / 2 + 34]) { planks(g, dx0, -150, 12, 150, ramp6(dimmed(CEDAR)), true, dx0, 4); for (let y = -144; y < -6; y += 10) box(g, dx0 + 5, y, 2, 2, dimmed(BRASS)); }
  });
  // (green tile along the top of the panel)
  box(g, 46, -H + 8, W - 92, 13, INK); barrelTile(g, 47, -H + 9, W - 94, 11, Gt, 5);
  box(g, 0, -4, W, 4, R[1]);
};
export const drawGate = (c: Ctx, v: View, x: number) => facade(c, v, 'ma-gate', x, 260, 260, paintGate, 0.92, 30, 20, false);

// ---------------------------------------------------------------------------------------------------------------
// The rooftops: the houses (play-plane boxes he climbs), their parapets, the carpets, the crates

/** A house's front (local: its top-left 0, 0; w x h): lime plaster in its color, zellige under the roof, the cedar
 *  rafter ends, a wooden spout, the horseshoe door, iron-grilled windows if it's tall. */
const paintHouse = (g: Ctx, w: number, h: number, col: string, seed: number) => {
  const R = ramp6(hour(col)), Wd = ramp6(hour(CEDAR)), I = ramp6(hour('#2E3436'));
  box(g, -1, 0, w + 2, h + 1, INK);
  slab(g, 0, 0, w, h, R, true); stucco(g, 0, 0, w, h, R, seed);
  box(g, 0, 5, w, 14, INK); zellige(g, 0, 6, w, 12, false);
  for (let x = 6; x < w - 4; x += 14) { box(g, x - 1, 20, 6, 5, INK); box(g, x, 20, 4, 4, Wd[3]); box(g, x, 20, 4, 1, Wd[5]); }
  // (a wooden spout out of the roof, a stain down from it)
  const sx = seed % 2 ? 10 : w - 22;
  box(g, sx - 1, 26, 14, 6, INK); box(g, sx, 27, 12, 4, Wd[3]); box(g, sx, 27, 12, 1, Wd[5]); checker(g, sx + 4, 32, 4, Math.min(60, h - 50), R[2], 0, 1);
  // (windows with iron grilles, dark inside, lit after dark)
  if (h > 180) for (const wx of [20, w - 40]) {
    box(g, wx - 3, 40, 26, 34, R[2]); box(g, wx - 2, 41, 24, 1, R[1]);
    box(g, wx - 1, 43, 22, 30, INK); box(g, wx, 44, 20, 28, lampsOn() ? '#E8A646' : '#1C1014');
    for (let k = 0; k < 4; k++) box(g, wx + 2 + k * 5, 44, 1, 28, I[3]); for (const y of [52, 62]) box(g, wx, y, 20, 1, I[3]);
    box(g, wx - 3, 74, 26, 3, INK); box(g, wx - 2, 74, 24, 2, R[4]);
  }
  // (the door: a horseshoe arch, the studded cedar door in it)
  const mx = Math.round(w / 2);
  archOpening(g, mx, h, 18, 74, ramp6(hour(TILEBLUE)), INK, () => studDoor(g, mx, h, 18, 74, false, seed));
  box(g, mx - 22, h - 3, 44, 3, R[1]);
};
/** A low parapet along a roof's back (set back at 0.95, behind where he stands; clipped above the front's top edge). */
export const backParapet = (c: Ctx, v: View, a: number, b: number, y: number, col: string) => {
  const R = ramp6(dimmed(col)), [pa, py] = at(v.eye, a, y, 0.95), [pb] = at(v.eye, b, y, 0.95), h = 12;
  c.save(); c.beginPath(); c.rect(pa - 4, py - h - 12, pb - pa + 8, y - (py - h - 12)); c.clip();
  box(c, pa - 1, py - h - 1, pb - pa + 2, h + 2, INK); box(c, pa, py - h, pb - pa, h, R[3]); box(c, pa, py - h, pb - pa, 1, R[5]);
  for (let x = pa + 3; x < pb - 8; x += 15) { box(c, x - 1, py - h - 6, 8, 6, INK); box(c, x, py - h - 5, 6, 5, R[3]); box(c, x, py - h - 5, 6, 1, R[5]); box(c, x + 1, py - h - 8, 4, 3, R[3]); }
  c.restore();
};
/** A house he climbs: its side and roof going back, the parapet along its back, its front (stamped), the lit lip. */
export const drawHouseBox = (c: Ctx, v: View, a: number, b: number, top: number, col: string, seed: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col });
  backParapet(c, v, a, b, top, col);
  still(c, `ma-house-${w}x${h}-${col}-${seed % 2}`, a, top, -2, -1, w + 4, h + 2, g => paintHouse(g, w, h, col, seed));
  lip(c, a, top, w);
};

const RUGS = [['#9F1D1D', '#F2C14E', '#1E2F6A', '#F4EFE4'], ['#1E2F6A', '#F4EFE4', '#9F1D1D', '#E8B04A'], ['#7C3A1A', '#E8A33A', '#1F4A2E', '#F4EFE4'], ['#1F4A2E', '#E9A0A0', '#E8C04A', '#F4EFE4'], ['#5B2A6E', '#F2C14E', '#9F1D1D', '#F4EFE4']];
/** A rug's face (local: its top-left at 0, 0, w x h; the fringe under it): the field (its abrash: bands of the dye
 *  lot), the border and its stepped diamonds, the guard stripes, the stepped medallion and its hooks, little motifs in
 *  the field, the fold over the line lit along its top, the fringe. */
export const paintRug = (g: Ctx, w: number, h: number, i: number, scenery = false) => {
  const T = (c: string) => ramp6(scenery ? dimmed(c) : hour(c));
  const [base, pat, edge, wt] = RUGS[i % RUGS.length], B = T(base), P = T(pat), E = T(edge), Wt = T(wt);
  box(g, -1, -1, w + 2, h + 2, INK);
  box(g, 0, 0, w, h, E[3]);
  // (the border: stepped diamonds of the pattern color round it)
  for (let x = 3; x < w - 4; x += 8) { poly(g, [[x + 3, 1], [x + 6, 4], [x + 3, 7], [x, 4]], P[3]); poly(g, [[x + 3, h - 8], [x + 6, h - 5], [x + 3, h - 2], [x, h - 5]], P[3]); }
  for (let y = 10; y < h - 10; y += 8) { poly(g, [[4, y], [7, y + 3], [4, y + 6], [1, y + 3]], P[3]); poly(g, [[w - 4, y], [w - 1, y + 3], [w - 4, y + 6], [w - 7, y + 3]], P[3]); }
  // (the guard stripe, then the field: its abrash bands)
  box(g, 8, 8, w - 16, h - 16, Wt[3]); box(g, 10, 10, w - 20, h - 20, B[3]);
  for (let y = 10, k = 0; y < h - 10; y += 7, k++) if (hash(i * 7 + k) > 0.6) box(g, 10, y, w - 20, 3, B[2]);
  // (the medallion: a stepped lozenge, ring in ring, hooks at its tips)
  const cx = Math.round(w / 2), cy = Math.round(h / 2), rr = Math.min(w * 0.3, h * 0.42);
  for (let k = 0; k < 4; k++) {
    const r = rr - k * 4, col = [E[3], P[3], Wt[3], E[2]][k];
    if (r < 2) break;
    for (let y = -r; y <= r; y += 2) { const half = Math.round(((r - Math.abs(y)) * (w * 0.3)) / rr); box(g, cx - half, cy + y, half * 2, 2, col); }
  }
  for (const [hx, hy] of [[0, -rr - 3], [0, rr + 1], [-rr * (w * 0.3) / rr - 4, -1], [rr * (w * 0.3) / rr + 2, -1]] as const) box(g, cx + hx - 1, cy + hy, 3, 3, P[3]);
  // (little motifs in the field's corners)
  for (const [mx, my] of [[16, 16], [w - 18, 16], [16, h - 18], [w - 18, h - 18]] as const) { box(g, mx - 1, my - 3, 2, 6, P[3]); box(g, mx - 3, my - 1, 6, 2, P[3]); box(g, mx - 1, my - 1, 2, 2, Wt[4]); }
  // (the fold over the line: lit along the top, the drape shading down its foot, a crease or two)
  box(g, 0, 0, w, 2, mix(E[3], E[5], 0.5)); box(g, 0, 2, w, 1, E[4]);
  checker(g, 0, h - 6, w, 4, 'rgba(28, 16, 20, 0.35)', 0, 1); box(g, 0, h - 2, w, 2, 'rgba(28, 16, 20, 0.35)');
  for (let k = 1; k < 3; k++) { const fx = Math.round((w * k) / 3 + hash(i + k) * 8 - 4); box(g, fx, 3, 1, h - 6, 'rgba(28, 16, 20, 0.25)'); box(g, fx + 1, 3, 1, h - 6, 'rgba(255, 255, 255, 0.12)'); }
  // (the fringe)
  for (let x = 1; x < w - 1; x += 3) { const fl = 4 + ((x / 3) % 2) * 2; box(g, x, h + 1, 2, fl, INK); box(g, x, h + 1, 1, fl - 1, Wt[3]); }
};
/** A carpet hung over a line between two walls (world a..b, its fold's top at y): the rope and its iron rings at each
 *  wall, the fold's top going back, the rug (stamped), the lit lip along the fold. */
export const drawCarpet = (c: Ctx, v: View, a: number, b: number, y: number, i: number, rope = true) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a - 8, h = 52, B = ramp6(hour(RUGS[i % RUGS.length][2]));
  if (rope) {
    box(c, a, y, b - a, 3, INK); box(c, a, y + 1, b - a, 1, hour('#C8A060'));
    for (const rx of [a + 1, b - 4]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(rx + 1.5, y + 1, 3, 0, Math.PI * 2); c.stroke(); c.strokeStyle = hour('#71717A'); c.lineWidth = 1; c.beginPath(); c.arc(rx + 1.5, y + 1, 3, 0, Math.PI * 2); c.stroke(); }
  }
  topBack(c, v.eye, a + 4, b - 4, y, 1, 0.97, B, 1);
  still(c, `ma-rug-${w}-${i % RUGS.length}`, a + 4, y, -2, -2, w + 4, h + 10, g => paintRug(g, w, h, i));
  lip(c, a + 4, y, w);
};
/** A crate (a box he stands on): planks in its frame, a diagonal brace, its stencil. */
export const drawCrate = (c: Ctx, v: View, a: number, b: number, top: number, seed: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top, col = '#A16207';
  box3Back(c, v, { x: a, top, w, bottom: GY, col, look: 'plank' });
  still(c, `ma-crate-${w}x${h}-${seed % 3}`, a, top, -2, -1, w + 4, h + 2, g => {
    const R = ramp6(hour(col)), F = ramp6(hour('#7C4A12'));
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, R, false, seed, 10);
    for (const [x, y, ww, hh] of [[0, 0, w, 5], [0, h - 5, w, 5], [0, 0, 5, h], [w - 5, 0, 5, h]] as const) { box(g, x, y, ww, hh, F[3]); box(g, x, y, ww, 1, F[5]); box(g, x, y, 1, hh, F[4]); }
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(5, 5); g.lineTo(w - 5, h - 5); g.stroke();
    g.strokeStyle = F[3]; g.lineWidth = 4; g.beginPath(); g.moveTo(5, 5); g.lineTo(w - 5, h - 5); g.stroke();
    g.strokeStyle = F[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(5, 3); g.lineTo(w - 5, h - 7); g.stroke();
    for (const [nx, ny] of [[2, 2], [w - 4, 2], [2, h - 4], [w - 4, h - 4]] as const) box(g, nx, ny, 2, 2, INK);
    words(g, ['RUGS', 'FRAGILE', 'LAMPS'][((Math.floor(seed) % 3) + 3) % 3], w / 2, h * 0.38, plain(1, 1, hour('#3A2208')));
  });
  lip(c, a, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// THE TOWER (the gift shop's)

const paintTowerInside = (g: Ctx, w: number, H: number, floors: number[]) => {
  const R = ramp6(dimmed(SAND)), Wd = ramp6(dimmed(CEDAR)), on = lampsOn(), sky = on ? '#1A1A34' : dimmed('#9CC4E4');
  box(g, 0, -H, w, H, R[2]); stucco(g, 0, -H, w, H, R, 9);
  for (let x = 0; x <= w; x += 64) { box(g, Math.min(w - 6, x), -H, 6, H, R[1]); box(g, Math.min(w - 6, x), -H, 1, H, R[3]); }
  // (each storey: a slit window either side (sky through it), zellige round its foot, a shelf of souvenirs; the cedar
  // beam under the floor over it (no ledge: nowhere to stand))
  const levels = [0, ...floors.filter((h, i, l) => l.indexOf(h) === i).sort((p, q) => p - q), H - 40];
  levels.forEach((lo, i) => {
    if (i === levels.length - 1) return;
    const hi = levels[i + 1];
    box(g, 0, -lo - 14, w, 12, INK); zellige(g, 0, -lo - 13, w, 10);
    if (lo > 0) { box(g, 0, -lo, w, 8, Wd[2]); box(g, 0, -lo, w, 1, Wd[4]); for (let x = 6; x < w; x += 16) box(g, x, -lo + 8, 6, 3, Wd[1]); }
    if (hi - lo < 60) return;
    const mid = -Math.round((lo + hi) / 2) - 6;
    for (const sx of [26, w - 38]) { fillShoe(g, sx + 6, mid + 22, 7, 46, INK); fillShoe(g, sx + 6, mid + 21, 6, 44, sky); if (!on) box(g, sx + 3, mid - 18, 2, 30, dimmed('#C8E0F4')); }
    if (lo === 0) return;
    // (the shelf: brass lamps, tagines, fezzes, little camels, I LOVE MOROCCO mugs)
    const shy = mid + 10;
    box(g, 56, shy, w - 112, 4, Wd[3]); box(g, 56, shy, w - 112, 1, Wd[5]); box(g, 60, shy + 4, 4, 8, Wd[1]); box(g, w - 64, shy + 4, 4, 8, Wd[1]);
    for (let x = 64, k = 0; x < w - 72; x += 20, k++) {
      const kind = (k + i) % 4;
      if (kind === 0) { brassLantern(g, x + 6, shy - 9, 4, true, 0); }
      else if (kind === 1) { const T = ramp6(dimmed(['#1E50A8', CLAY, TILEGREEN][k % 3])); box(g, x, shy - 3, 13, 3, INK); poly(g, [[x + 1, shy - 3], [x + 6, shy - 13], [x + 11, shy - 3]], T[3]); poly(g, [[x + 1, shy - 3], [x + 6, shy - 13], [x + 5, shy - 3]], T[4]); }
      else if (kind === 2) { const T = ramp6(dimmed('#B91C1C')); poly(g, [[x + 1, shy], [x + 2, shy - 9], [x + 10, shy - 9], [x + 11, shy]], INK); poly(g, [[x + 2, shy], [x + 3, shy - 8], [x + 9, shy - 8], [x + 10, shy]], T[3]); box(g, x + 3, shy - 8, 2, 8, T[4]); box(g, x + 6, shy - 9, 1, 4, INK); }
      else { const T = ramp6(dimmed('#F4EFE4')); box(g, x, shy - 10, 10, 10, INK); box(g, x + 1, shy - 9, 8, 9, T[3]); box(g, x + 1, shy - 9, 2, 9, T[5]); box(g, x + 9, shy - 7, 3, 4, INK); box(g, x + 4, shy - 6, 2, 2, dimmed('#DC2626')); }
    }
  });
  // (the elevator on the ground floor: its steel doors, the call button, the sign taped across it)
  const ex = Math.round(w / 2) - 26, St = ramp6(dimmed('#9CA3AF'));
  box(g, ex - 5, -104, 62, 104, INK); box(g, ex - 4, -103, 60, 103, St[2]); box(g, ex - 4, -103, 60, 2, St[4]);
  for (const dx0 of [ex, ex + 27]) { box(g, dx0, -96, 25, 96, St[3]); box(g, dx0, -96, 2, 96, St[5]); box(g, dx0 + 23, -96, 2, 96, St[1]); }
  box(g, ex + 25, -96, 2, 96, INK);
  box(g, ex + 60, -60, 6, 12, INK); box(g, ex + 61, -59, 4, 10, St[3]); box(g, ex + 62, -56, 2, 2, dimmed('#7F1D1D'));
  box(g, ex + 2, -72, 48, 22, INK); box(g, ex + 3, -71, 46, 20, dimmed('#F8FAFC')); box(g, ex + 3, -71, 46, 1, '#FFFFFF');
  words(g, 'OUT OF', ex + 26, -62, plain(1, 1, dimmed('#1C1917'))); words(g, 'ORDER', ex + 26, -53, plain(1, 1, dimmed('#B91C1C')));
  for (const [tx, ty] of [[ex + 1, -73], [ex + 45, -73], [ex + 1, -53], [ex + 45, -53]] as const) box(g, tx, ty, 6, 3, dimmed('#D6D3D1'));
  box(g, 0, -H, w, 6, Wd[0]);
};
/** The lantern room over the balcony (at 0.95: set back off it): plaster under merlons, its arched windows (lit after
 *  dark), zellige, the green dome and its ribs, the gold finial and its three balls. Local: its foot at 0. */
const paintTowerTop = (g: Ctx, w: number) => {
  const R = ramp6(dimmed(SAND)), Gt = ramp6(dimmed(TILEGREEN)), Gd = ramp6(dimmed('#E8B83A'));
  box(g, -1, -91, w + 2, 91, INK); slab(g, 0, -90, w, 90, R, true); stucco(g, 0, -90, w, 90, R, 4);
  box(g, 0, -82, w, 12, INK); zellige(g, 0, -81, w, 10);
  for (let k = 0; k < 3; k++) { const ax = Math.round(w / 2 + (k - 1) * 40); archOpening(g, ax, -10, 9, 46, ramp6(dimmed(TILEBLUE)), lampsOn() ? '#E8A646' : '#1C1014'); }
  merlons(g, 0, -90, w, R, 6);
  // (the dome: green tile in bands round it, its ribs, lit up its left)
  const r = w / 2 - 14, cx = w / 2, cy = -96;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, r + 1, Math.PI, 0); g.fill();
  g.save(); g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.closePath(); g.clip();
  box(g, cx - r, cy - r, r * 2, r, Gt[2]);
  for (let y = cy - r; y < cy; y += 5) box(g, cx - r, y, r * 2, 1, Gt[1]);
  box(g, cx - r, cy - r, r * 0.7, r, Gt[3]); box(g, cx - r * 0.75, cy - r, r * 0.25, r, Gt[4]); box(g, cx + r * 0.5, cy - r, r * 0.5, r, Gt[1]);
  for (let k = 1; k < 6; k++) { const x = cx - r + (k * r * 2) / 6; box(g, x, cy - r, 1, r, Gt[0]); }
  g.restore();
  box(g, cx - r - 2, cy - 2, r * 2 + 4, 4, INK); box(g, cx - r - 1, cy - 1, r * 2 + 2, 2, Gd[3]);
  // (the finial: a rod, three gold balls, the little crescent-free top: just a point)
  box(g, cx - 2, cy - r - 46, 4, 46, INK); box(g, cx - 1, cy - r - 46, 2, 46, Gd[3]);
  for (let k = 0; k < 3; k++) ball(g, cx, cy - r - 10 - k * 12, 5 - k, Gd[3], true);
  poly(g, [[cx - 2, cy - r - 46], [cx, cy - r - 54], [cx + 2, cy - r - 46]], Gd[4]);
};
export interface TowerP { a: number; b: number; top: number; walls: [number, number, number, number][]; floors: [number, number, number][]; balcony: [number, number, number]; carpets: [number, number, number][] }
/** The tower: its inside (set back), its two walls (box faces, cut stone and zellige, the cedar lintels over the
 *  doors under them), its cedar floors, the balcony on its corbels and its parapet, the lantern room and dome over it,
 *  the carpets hung off its far side on their poles. */
export const drawTowerArt = (c: Ctx, v: View, X: (rx: number) => number, Y: (h: number) => number, P: TowerP) => {
  if (!onScreen(v, X(P.a) - 60, X(P.b) + 200)) return;
  const w = P.b - P.a, H = P.top + 40;
  atDepth(c, v.eye, 0.94, () => still(c, `ma-tower-in-${w}x${H}`, X(P.a), GY, -2, -H - 2, w + 4, H + 4, g => paintTowerInside(g, w, H, P.floors.map(f => f[2]))));
  const S = ramp6(hour(SAND)), Wd = ramp6(hour(CEDAR));
  for (const [a, b, lo, hi] of P.walls) {
    box3Back(c, v, { x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: SAND });
    still(c, `ma-tower-wall-${b - a}x${hi - lo}`, X(a), Y(hi), -2, -1, b - a + 4, hi - lo + 2, g => {
      box(g, -1, 0, b - a + 2, hi - lo + 1, INK); stoneBlocks(g, 0, 0, b - a, hi - lo, S, a, 20, 12);
      for (let y = 30; y < hi - lo - 20; y += 90) { box(g, 0, y - 1, b - a, 20, INK); zellige(g, 0, y, b - a, 18, false); }
      box(g, 0, 0, 2, hi - lo, S[4]); box(g, b - a - 3, 0, 3, hi - lo, S[1]);
    });
    // (the cedar lintel over the door under it, carved, on stepped corbels)
    box(c, X(a) - 6, Y(lo) - 2, b - a + 12, 12, INK); box(c, X(a) - 5, Y(lo) - 1, b - a + 10, 10, Wd[3]); box(c, X(a) - 5, Y(lo) - 1, b - a + 10, 2, Wd[5]);
    for (let x = X(a) - 3; x < X(b) + 3; x += 4) box(c, x, Y(lo) + 4, 2, 2, Wd[1]);
    for (const [cx0, dir] of [[X(a) - 5, -1], [X(b) + 5, 1]] as const) { box(c, cx0 - (dir < 0 ? 4 : 0), Y(lo) + 9, 4, 4, INK); box(c, cx0 - (dir < 0 ? 3 : 0), Y(lo) + 9, 3, 3, Wd[2]); }
  }
  for (const [a, b, h] of P.floors) ledge3(c, v, X(a), Y(h), b - a, '#8A5A30', 10, 'plank');
  // (the lantern room over the balcony, set back off it)
  const tw = w - 80;
  atDepth(c, v.eye, 0.95, () => still(c, `ma-tower-top-${tw}`, X(P.a) + 40, Y(P.top), -4, -tw / 2 - 160, tw + 8, tw / 2 + 162, g => paintTowerTop(g, tw)));
  // (the balcony: its parapet along its back, the corbels under it, the stone slab)
  const [ba, bb, bh] = P.balcony;
  backParapet(c, v, X(ba), X(bb), Y(bh), SAND);
  for (let x = X(ba) + 8; x < X(bb) - 8; x += 24) { box(c, x - 1, Y(bh) + 16, 12, 16, INK); box(c, x, Y(bh) + 16, 10, 4, S[3]); box(c, x + 2, Y(bh) + 20, 7, 5, S[2]); box(c, x + 4, Y(bh) + 25, 4, 5, S[1]); box(c, x, Y(bh) + 16, 2, 4, S[4]); }
  ledge3(c, v, X(ba), Y(bh), bb - ba, '#C9A27A', 16, 'stone');
  box(c, X(ba), Y(bh) + 9, bb - ba, 5, INK); zellige(c, X(ba), Y(bh) + 10, bb - ba, 4, false);
  // (the carpets off the far side, each over its pole out of the wall)
  P.carpets.forEach(([a, b, h], i) => {
    const y = Y(h) + 1, x0 = X(P.b), x1 = X(b) + 6;
    box(c, x0, y - 2, x1 - x0, 6, INK); box(c, x0, y - 1, x1 - x0, 4, Wd[2]); box(c, x0, y - 1, x1 - x0, 1, Wd[4]);
    box(c, x0 - 2, y - 5, 8, 12, INK); box(c, x0 - 1, y - 4, 6, 10, Wd[3]);
    ball(c, x1, y + 1, 4, hour(BRASS), true);
    drawCarpet(c, v, X(a), X(b), Y(h), i + 1, false);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE TANNERY: the dye vats, the drying racks

/** How far back a vat's dug-out goes (its far wall): in front of the fronts (they stand at 0.88). */
const VAT_D = 0.9;
/** The paving behind a vat, from its far wall back to the railing (draw it before the fronts: it's farther back). */
export const vatPaving = (c: Ctx, v: View, a: number, b: number) => { if (onScreen(v, a, b)) pavingBack(c, v, a, b, VAT_D, '#E7D3B0', '#9C7F5A'); };
/** A vat (after the fronts): its stained clay far wall going down into the dye, its end walls going back, the dye's
 *  surface going back (bubbling, scum drifting, steam coming off it), the coping round its back, the masonry under it
 *  at the play plane; and the dye at the play plane (`col` exactly, under the hour). */
export const drawVat = (c: Ctx, v: View, a: number, b: number, surface: number, bed: number, col: string, wall: string, f: number, seed: number) => {
  if (!onScreen(v, a, b)) return;
  const eye = v.eye, W = ramp6(hour(wall)), sY = GY + surface, bot = GY + bed, D = hour(col), Dr = ramp6(D);
  const P = (x: number, y: number, d: number) => at(eye, x, y, d);
  const [ax, ay] = P(a, GY, VAT_D), [bx] = P(b, GY, VAT_D), [, sy] = P(a, sY, VAT_D), [, by] = P(a, bot, VAT_D);
  // (its stretch of the near band, edges fanned out from the eye like the paving's (the promenade's `fan` ends meet them
  // on the same line): the end walls' faces coming toward him where they fan out past the cut-through, the dark under)
  const yb = GY + NEAR_BAND + 600, near: [number, number][] = [[a, GY], [b, GY], [nearX(eye, b, yb), yb], [nearX(eye, a, yb), yb]];
  poly(c, near, W[0]);
  for (const e of [a, b]) poly(c, [[e, GY], [nearX(eye, e, bot), bot], [e, bot]], W[2]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (const e of [a, b]) { c.moveTo(e, GY); c.lineTo(nearX(eye, e, yb), yb); }
  c.stroke();
  // (the far wall: clay plaster, the dye's tide marks and drips down it from the rim, darker under the dye line)
  box(c, ax, ay, bx - ax, sy - ay, W[3]);
  for (let x = Math.round(ax) + 2; x < bx - 2; x += 3) { const dl = 2 + Math.round(hash(seed + x * 0.37) * (sy - ay - 3)); if (hash(seed + x * 0.11) > 0.45) box(c, x, ay + 1, 2, dl, mix(W[3], D, 0.45)); }
  box(c, ax, sy - 4, bx - ax, 4, mix(W[2], D, 0.65)); checker(c, ax, sy - 6, bx - ax, 2, mix(W[2], D, 0.65), 0, 1);
  box(c, ax, sy, bx - ax, by - sy, mix(W[1], D, 0.6));
  // (its end walls going back)
  for (const [e, side] of [[a, 1], [b, -1]] as const) sideBack(c, eye, e, side, GY, bot, 1, VAT_D, [W[0], W[1], mix(W[2], D, 0.25), W[3], W[4], W[5]], 2, false);
  // (the dye's surface going back, banded, scum drifting on it)
  if (eye.y < sY - 1) {
    const S = [Dr[3], mix(Dr[3], Dr[2], 0.5), Dr[2]];
    for (let i = 0; i < 3; i++) { const d0 = 1 - ((1 - VAT_D) * i) / 3, d1 = 1 - ((1 - VAT_D) * (i + 1)) / 3; poly(c, [P(a + 6, sY, d0), P(b - 6, sY, d0), P(b - 6, sY, d1), P(a + 6, sY, d1)], S[i]); }
    for (let k = 0; k < 3; k++) {
      const d = VAT_D + 0.02 + hash(seed + k * 3.7) * 0.07, gx = a + 12 + (((hash(seed + k) * (b - a - 30) + f * 0.12 * (k + 1)) % (b - a - 30)) + (b - a - 30)) % (b - a - 30);
      const [px, py] = P(gx, sY, d);
      box(c, px, py, 10 * d, 1, Dr[4]); box(c, px + 2, py + 1, 5 * d, 1, mix(Dr[4], Dr[3], 0.5));
    }
  }
  // (the coping round its back: a lit stone lip)
  box(c, ax - 1, ay - 2, bx - ax + 2, 3, INK); box(c, ax, ay - 2, bx - ax, 2, hour('#E8DFC8'));
  // (its end walls at the play plane, the masonry under it all)
  // (the masonry under it all, stamped for the hour: the vat's stained clay bottom over courses of cut stone (each
  // block a step, dye seeped down its joints), darkening down into the dark)
  const vw = Math.round(b - a);
  c.save(); c.beginPath(); near.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  still(c, `ma-vatbase-${vw}-${wall}-${col}`, a, bot, 0, 0, vw, 170, g => {
    stoneBlocks(g, 0, 8, vw, 162, W, seed, 34, 17);
    box(g, 0, 0, vw, 8, mix(W[1], D, 0.5)); box(g, 0, 0, vw, 1, INK); checker(g, 0, 8, vw, 2, mix(W[1], D, 0.5), 0, 1);
    for (let x = 4; x < vw - 4; x += 5) if (hash(seed + x * 0.7) > 0.6) box(g, x, 8, 1, 6 + hash(seed + x) * 22, mix(W[1], D, 0.4));
    for (let k = 0; k < 4; k++) { const y = 70 + k * 26; checker(g, 0, y, vw, 2, W[0], k % 2); box(g, 0, y + 2, vw, 24, mix(W[1], W[0], 0.25 + k * 0.2)); }
    box(g, 0, 166, vw, 4, W[0]);
  });
  box(c, a, bot + 170, b - a, 230, W[0]);
  c.restore();
  // (its end walls at the play plane: clay, a zellige band down their tops, the lit edge)
  for (const sx of [a, b - 6]) { box(c, sx, GY, 6, bed, W[2]); box(c, sx, GY, 2, bed, W[4]); box(c, sx + 5, GY, 1, bed, INK); box(c, sx, GY, 6, 6, hour(TILEBLUE)); box(c, sx + 1, GY + 1, 2, 2, hour('#F2EDE2')); }
  // (the dye at the play plane, banded down into its depths, dithered between; the surface's lit line)
  const dh = bed - surface, dw = b - a - 12;
  box(c, a + 6, sY, dw, dh, D);
  for (const [k, col2] of [[0.3, mix(D, Dr[2], 0.5)], [0.55, Dr[2]], [0.8, Dr[1]]] as const) { const yy = Math.round(sY + dh * k); box(c, a + 6, yy, dw, Math.round(sY + dh) - yy, col2); checker(c, a + 6, yy - 2, dw, 2, col2, 0, 1); }
  box(c, a + 6, sY, dw, 2, Dr[4]); box(c, a + 6, sY + 2, dw, 1, mix(Dr[4], D, 0.5));
  // (swirls of the dye turning over, drifting, live; a scrap of hide adrift under the surface)
  for (let k = 0; k < 5; k++) { const sx = a + 10 + (((hash(seed + k * 2.3) * dw + f * (0.2 + k * 0.07)) % (dw - 16)) + (dw - 16)) % (dw - 16), sy2 = sY + 8 + hash(seed + k * 1.1) * (dh * 0.6); box(c, sx, sy2, 8 + k * 2, 1, Dr[3]); box(c, sx + 3, sy2 + 1, 6, 1, mix(Dr[3], Dr[2], 0.5)); }
  { const hx = a + 14 + (((seed * 37 + f * 0.15) % (dw - 30)) + (dw - 30)) % (dw - 30), hy = sY + dh * 0.35 + Math.sin(f * 0.03 + seed) * 3; box(c, hx - 1, hy - 1, 12, 6, mix(Dr[1], INK, 0.3)); box(c, hx, hy, 10, 4, mix(hour('#C08A5A'), D, 0.55)); box(c, hx, hy, 10, 1, mix(hour('#E0B080'), D, 0.4)); }
  // (bubbles coming up and popping, live)
  for (let k = 0; k < 4; k++) {
    const t = (f + k * 23 + seed) % 46, bx2 = a + 18 + hash(seed + k * 1.9 + Math.floor((f + k * 23 + seed) / 46)) * (b - a - 36), r = 1 + t / 12;
    if (t < 38) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(bx2, sY - 1, r + 0.5, Math.PI, 0); c.stroke(); c.strokeStyle = Dr[4]; c.lineWidth = 1; c.beginPath(); c.arc(bx2, sY - 1, r, Math.PI, 0); c.stroke(); box(c, bx2 - r * 0.5, sY - r - 1, 1, 1, Dr[5]); }
    else { box(c, bx2 - 4, sY - 4, 2, 2, Dr[4]); box(c, bx2 + 2, sY - 5, 2, 2, Dr[4]); box(c, bx2 - 1, sY - 7, 2, 2, Dr[5]); }
  }
  // (the steam off it: stepped wisps rising and thinning)
  c.globalAlpha = 0.35;
  for (let k = 0; k < 3; k++) { const t = ((f * 0.6 + k * 40 + seed * 7) % 120) / 120, sx = a + 20 + k * ((b - a - 40) / 2) + Math.sin(t * 6 + k) * 6, syy = sY - 6 - t * 70; pixelBlob(c, sx, syy, 6 + t * 10, 4 + t * 6, '#F4F4F2'); }
  c.globalAlpha = 1;
};
/** The dye over whoever's in a vat (drawn in front): translucent, its lit surface line. */
export const drawVatFront = (c: Ctx, v: View, a: number, b: number, surface: number, bed: number, col: string) => {
  if (!onScreen(v, a, b)) return;
  const sY = GY + surface, D = hour(col), Dr = ramp6(D);
  c.globalAlpha = 0.62; box(c, a + 6, sY, b - a - 12, bed - surface, D); box(c, a + 6, sY + (bed - surface) * 0.55, b - a - 12, (bed - surface) * 0.45, Dr[2]); c.globalAlpha = 1;
  box(c, a + 6, sY, b - a - 12, 2, Dr[4]);
};
const HIDES = ['#D6A15E', '#1E40AF', '#EAB308', '#DC2626', '#C08A5A', '#16A34A'];
/** A drying rack over the vats: two lashed poles down into them, a brace, the plank top (standable: its lit lip), the
 *  hides hung under it (stepped, their legs, a stitched edge), dripping dye. */
export const drawRackArt = (c: Ctx, v: View, a: number, b: number, y: number, seed: number, f: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const Wd = ramp6(hour('#8A5A30')), Rp = ramp6(hour('#C8A060'));
  for (const px0 of [a + 6, b - 6]) {
    post(c, px0, y, GY + 18, 6, Wd);
    for (let k = 0; k < 3; k++) { box(c, px0 - 4, y + 10 + k * 3, 8, 2, INK); box(c, px0 - 3, y + 10 + k * 3, 6, 1, Rp[3]); }
  }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(a + 6, y + 40); c.lineTo(b - 6, y + 40); c.stroke(); c.strokeStyle = Wd[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(a + 6, y + 40); c.lineTo(b - 6, y + 40); c.stroke();
  ledge3(c, v, a, y, b - a, '#8A5A30', 8, 'plank');
  for (let k = 0; k < 4; k++) {
    const hx = Math.round(a + 30 + k * ((b - a - 60) / 3)), R = ramp6(hour(HIDES[((Math.floor(seed + k) % HIDES.length) + HIDES.length) % HIDES.length])), hy = y + 8, sw = Math.sin(f * 0.03 + k) * 1.5;
    const hide: [number, number][] = [[hx - 15, hy], [hx + 15, hy], [hx + 19 + sw, hy + 10], [hx + 16 + sw, hy + 16], [hx + 20 + sw, hy + 34], [hx + 12 + sw, hy + 40], [hx + 6 + sw, hy + 50], [hx - 6 + sw, hy + 50], [hx - 12 + sw, hy + 40], [hx - 20 + sw, hy + 34], [hx - 16 + sw, hy + 16], [hx - 19 + sw, hy + 10]];
    poly(c, hide.map(([px, py]) => [px + (px < hx ? -1 : 1), py + 1] as [number, number]), INK);
    poly(c, hide, R[3]);
    poly(c, [hide[0], [hx, hy], [hx + sw, hy + 50], hide[7], hide[8], hide[9], hide[10], hide[11]], R[4]);
    box(c, hx + 6, hy + 4, 3, 40, R[2]); checker(c, hx - 12, hy + 38, 24, 4, R[2], 0, 1);
    for (let yy = hy + 6; yy < hy + 44; yy += 6) box(c, hx - 13 + (yy % 4), yy, 1, 2, R[1]);
    if ((f + k * 17) % 50 < 30) box(c, hx + sw, hy + 52 + ((f + k * 17) % 50) / 3, 2, 3, R[2]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The hookah lounge, the poufs, the spice stall

/** The lounge inside the tent (at 0.95: behind the cushions): striped wool walls, a rug on its floor, the brass tray
 *  table and tea glasses, the big hookah, a lantern over it. Local: foot at 0, `w` across, `h` up. */
const paintLounge = (g: Ctx, w: number, h: number) => {
  const St = ['#7F1D1D', '#F2E6CC', '#1C1917', '#B45309'], Bz = ramp6(dimmed(BRASS)), on = lampsOn();
  for (let x = 0, k = 0; x < w; x += 10, k++) { const R = ramp6(dimmed(St[k % St.length])); box(g, x, -h, 10, h, R[2]); box(g, x, -h, 2, h, R[3]); box(g, x + 8, -h, 2, h, R[1]); for (let y = -h + 8; y < 0; y += 16) box(g, x + 3, y, 4, 2, R[4]); }
  if (on) { g.globalAlpha = 0.35; box(g, 0, -h, w, h, '#E8A646'); g.globalAlpha = 1; }
  box(g, 0, -h, w, 10, 'rgba(28, 16, 20, 0.4)');
  // (the rug on the floor)
  const Rg = ramp6(dimmed('#9F1D1D'));
  box(g, 10, -10, w - 20, 10, INK); box(g, 11, -9, w - 22, 8, Rg[3]); for (let x = 16; x < w - 16; x += 12) box(g, x, -7, 6, 4, dimmed('#F2C14E')); box(g, 11, -9, w - 22, 1, Rg[4]);
  // (the brass tray table, the tea glasses on it)
  const tx = Math.round(w * 0.62);
  box(g, tx - 26, -36, 52, 6, INK); box(g, tx - 25, -35, 50, 4, Bz[3]); box(g, tx - 25, -35, 50, 1, Bz[5]); for (let x = tx - 22; x < tx + 22; x += 6) box(g, x, -33, 3, 1, Bz[1]);
  for (const lx of [tx - 18, tx + 16]) { box(g, lx - 1, -30, 4, 22, INK); box(g, lx, -30, 2, 22, Bz[2]); }
  for (let k = 0; k < 3; k++) { const gx = tx - 14 + k * 9; box(g, gx - 1, -46, 6, 10, INK); box(g, gx, -45, 4, 9, dimmed('#B45309')); box(g, gx, -45, 4, 2, dimmed('#F4EFE4')); box(g, gx, -45, 1, 9, dimmed('#FDE68A')); }
  box(g, tx + 10, -52, 12, 16, INK); box(g, tx + 11, -51, 10, 14, Bz[3]); box(g, tx + 11, -51, 3, 14, Bz[5]); box(g, tx + 21, -48, 5, 2, Bz[2]);
  // (the hookah: the glass base, the brass stem, the bowl and its coals, the hose)
  const hx = Math.round(w * 0.3), G = ramp6(dimmed('#0E7490'));
  g.fillStyle = INK; g.beginPath(); g.arc(hx, -16, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[2]; g.beginPath(); g.arc(hx, -16, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[3]; g.beginPath(); g.arc(hx - 3, -18, 8, 0, Math.PI * 2); g.fill(); box(g, hx - 8, -24, 2, 6, G[5]);
  box(g, hx - 12, -12, 24, 1, G[4]);
  box(g, hx - 3, -66, 6, 52, INK); box(g, hx - 2, -66, 4, 52, Bz[3]); box(g, hx - 2, -66, 1, 52, Bz[5]); for (const y of [-58, -44, -34]) { box(g, hx - 5, y, 10, 3, INK); box(g, hx - 4, y, 8, 2, Bz[4]); }
  box(g, hx - 10, -70, 20, 4, INK); box(g, hx - 9, -69, 18, 2, Bz[4]);
  box(g, hx - 5, -78, 10, 8, INK); box(g, hx - 4, -77, 8, 7, dimmed(CLAY)); box(g, hx - 3, -79, 6, 2, on ? '#FB923C' : dimmed('#7F1D1D'));
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(hx + 3, -40); g.quadraticCurveTo(hx + 40, -20, hx + 52, -6); g.stroke();
  g.strokeStyle = dimmed('#1E3A8A'); g.lineWidth = 2; g.beginPath(); g.moveTo(hx + 3, -40); g.quadraticCurveTo(hx + 40, -20, hx + 52, -6); g.stroke();
  // (a lantern hung in it)
  brassLantern(g, Math.round(w * 0.5), -h + 40, 7, true, 18);
  if (on) steppedGlow(g, Math.round(w * 0.5), -h + 40, 30, '#FFB060', 0, 0.3, 4);
};
/** The tent: its back (the lounge inside, set back), the poles, the canopy's top (standable: its lit lip), the striped
 *  valance hanging off its front, scalloped, tasseled. */
export const drawTentArt = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 40, b + 40)) return;
  facade(c, v, `ma-lounge-${b - a}x${GY - top}`, a, b - a, GY - top - 30, g => paintLounge(g, b - a, GY - top - 30), 0.95, 10, 10, false);
  const Wd = ramp6(hour('#6B4423')), Bz = ramp6(hour(BRASS));
  for (const px0 of [a + 8, b - 8]) { post(c, px0, top, GY, 6, Wd); box(c, px0 - 5, GY - 6, 10, 6, INK); box(c, px0 - 4, GY - 5, 8, 5, Wd[2]); }
  // (the guy ropes off the ends)
  c.strokeStyle = hour('#C8A060'); c.lineWidth = 1;
  for (const [x0, x1] of [[a, a - 30], [b, b + 30]] as const) { c.beginPath(); c.moveTo(x0, top + 4); c.lineTo(x1, GY); c.stroke(); box(c, x1 - 2, GY - 4, 4, 4, INK); }
  // (the canopy's front: its stripes in steps, scalloped, a tassel under every scallop)
  const ST = ['#B91C1C', '#F2C14E', '#7F1D1D', '#F2E6CC'];
  for (let x = a - 10, k = 0; x < b + 10; x += 20, k++) {
    const R = ramp6(hour(ST[k % ST.length])), h = 26;
    box(c, x - 1, top, 22, h + 1, INK); box(c, x, top, 20, h, R[3]); box(c, x, top, 3, h, R[4]); box(c, x + 16, top, 4, h, R[2]); checker(c, x, top + h - 6, 20, 4, R[2], 0, 1);
    c.fillStyle = INK; c.beginPath(); c.arc(x + 10, top + h, 11, 0, Math.PI); c.fill(); c.fillStyle = R[3]; c.beginPath(); c.arc(x + 10, top + h, 10, 0, Math.PI); c.fill(); box(c, x + 2, top + h, 3, 6, R[4]);
    box(c, x + 9, top + h + 10, 2, 4, INK); ball(c, x + 10, top + h + 15, 2, Bz[3], true); box(c, x + 9, top + h + 17, 3, 5, hour(ST[(k + 1) % ST.length]));
  }
  ledge3(c, v, a, top, b - a, '#B91C1C', 6);
};
/** The poufs and cushions (a box he stands on): two leather poufs stitched in their pattern, a kilim bolster on top. */
export const drawPoufs = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#7C3AED' });
  still(c, `ma-poufs-${w}x${h}`, a, top, -4, -4, w + 8, h + 6, g => {
    const L = ramp6(hour('#B45309')), L2 = ramp6(hour('#7C3AED')), K = ramp6(hour('#9F1D1D'));
    for (const [px0, R] of [[0, L], [w / 2, L2]] as const) {
      const pw = w / 2;
      g.fillStyle = INK; g.beginPath(); g.ellipse(px0 + pw / 2, h * 0.58, pw / 2 + 1, h * 0.45, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[2]; g.beginPath(); g.ellipse(px0 + pw / 2, h * 0.58, pw / 2, h * 0.44, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[3]; g.beginPath(); g.ellipse(px0 + pw / 2 - 3, h * 0.5, pw / 2 - 5, h * 0.3, 0, 0, Math.PI * 2); g.fill();
      box(g, px0 + 6, h * 0.35, 6, 3, R[4]);
      for (let k = 0; k < 5; k++) { const sx = px0 + 8 + k * ((pw - 16) / 4); box(g, sx, h * 0.45, 2, 2, hour('#F2C14E')); box(g, sx - 1, h * 0.62, 4, 1, R[1]); }
    }
    // (the kilim bolster along the top: its stripes, its tasseled ends)
    box(g, 1, -2, w - 2, 12, INK); box(g, 2, -1, w - 4, 10, K[3]); box(g, 2, -1, w - 4, 2, K[4]);
    for (let x = 6; x < w - 6; x += 10) { box(g, x, 1, 5, 5, hour('#F2C14E')); box(g, x + 1, 2, 3, 3, hour('#1E2F6A')); }
    for (const tx of [0, w - 3]) { box(g, tx, 0, 3, 8, hour('#F2C14E')); box(g, tx, 8, 3, 3, INK); }
  });
  lip(c, a, top, w);
};
/** The spice stall (a box he stands on): its cedar frame, the shelf of spice cones in their bowls (paprika, turmeric,
 *  cumin, ras el hanout, mint), the sacks under it rolled down, a brass scoop. */
export const drawSpiceStall = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#7A4A26', look: 'plank' });
  still(c, `ma-spice-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const Wd = ramp6(hour(CEDAR)), Bu = ramp6(hour('#B89A6A'));
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, Wd, true, 5, 10);
    box(g, 4, 6, w - 8, 40, INK); box(g, 5, 7, w - 10, 38, '#2A1A10');
    box(g, 4, 44, w - 8, 5, Wd[3]); box(g, 4, 44, w - 8, 1, Wd[5]);
    const SP = ['#C2410C', '#EAB308', '#92400E', '#B45309', '#4D7C0F'];
    for (let k = 0; k < 4; k++) {
      const sx = 18 + k * ((w - 36) / 3), R = ramp6(hour(SP[k % SP.length])), Bw = ramp6(hour(['#1E50A8', '#F4EFE4', '#15803D', '#B91C1C'][k]));
      box(g, sx - 12, 36, 24, 8, INK); box(g, sx - 11, 37, 22, 7, Bw[3]); box(g, sx - 11, 37, 22, 1, Bw[5]); for (let x = sx - 9; x < sx + 9; x += 5) box(g, x, 40, 2, 2, Bw[1]);
      poly(g, [[sx - 11, 37], [sx, 12], [sx + 11, 37]], INK); poly(g, [[sx - 10, 37], [sx, 13], [sx + 10, 37]], R[3]);
      poly(g, [[sx - 10, 37], [sx, 13], [sx - 1, 37]], R[4]); poly(g, [[sx + 4, 37], [sx, 13], [sx + 10, 37]], R[2]);
      for (let y = 18; y < 36; y += 4) box(g, sx - (y - 13) * 0.4, y, (y - 13) * 0.8, 1, R[1]);
      box(g, sx - 1, 13, 2, 2, R[5]);
    }
    // (the sacks under: burlap, rolled down, the spice heaped in them)
    for (let k = 0; k < 3; k++) {
      const sx = 6 + k * ((w - 12) / 3), sw = (w - 12) / 3 - 4, R = ramp6(hour(SP[(k + 2) % SP.length]));
      box(g, sx - 1, 56, sw + 2, h - 58, INK); box(g, sx, 57, sw, h - 60, Bu[3]); box(g, sx, 57, 3, h - 60, Bu[4]); box(g, sx + sw - 3, 57, 3, h - 60, Bu[2]);
      for (let y = 62; y < h - 4; y += 4) box(g, sx + 2, y, sw - 4, 1, Bu[2]);
      box(g, sx - 2, 54, sw + 4, 6, INK); box(g, sx - 1, 55, sw + 2, 4, Bu[4]);
      pixelBlob(g, sx + sw / 2, 55, sw / 2 - 2, 4, R[3]); box(g, sx + 4, 52, 4, 2, R[4]);
    }
    box(g, w - 18, 50, 12, 4, INK); box(g, w - 17, 50, 10, 3, hour(BRASS));
  });
  lip(c, a, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// THE SOUK

/** The covered market's far wall (at 0.9): clay plaster, an arcade of shop arches at its foot (their goods inside),
 *  the windows up the floors over it (mashrabiyas), and the cedar beams and reed lattice of the roof over the alley,
 *  daylight in slots through it. Local: foot at 0. */
const paintSoukWall = (g: Ctx, w: number, h: number) => {
  const R = ramp6(dimmed(CLAY)), Wd = ramp6(dimmed(CEDAR)), T = ramp6(dimmed(LIME)), on = lampsOn();
  box(g, -1, -h - 1, w + 2, h + 1, INK); slab(g, 0, -h, w, h, R, true); stucco(g, 0, -h, w, h, R, 61);
  const KINDS: Goods[] = ['lamps', 'rugs', 'pots', 'slippers', 'fez'];
  for (let ax = 60, k = 0; ax < w - 30; ax += 130, k++) {
    archOpening(g, ax + 6, 0, 32, 118, T, '#24161A', () => goodsIn(g, ax - 26, -118, 64, 118, KINDS[k % KINDS.length], k * 11));
    box(g, ax - 32, -138, 76, 10, INK); zellige(g, ax - 31, -137, 74, 8);
  }
  box(g, 0, -24, w, 1, INK);
  for (let x = 0; x < w; x += 130) zellige(g, x + 102, -22, 20, 18);
  // (the upper wall worked over: a carved plaster frieze (a run of little arches) and a stone string course across it,
  // plaster patches gone pale, damp stains down from the roof, rugs hung up to air on poles, the odd shuttered window)
  const fy = Math.round(-h * 0.5);
  box(g, 0, fy - 1, w, 16, INK); box(g, 0, fy, w, 14, T[3]); box(g, 0, fy, w, 2, T[5]); box(g, 0, fy + 12, w, 2, T[1]);
  for (let x = 2; x < w - 8; x += 10) { box(g, x, fy + 4, 8, 7, T[2]); box(g, x + 1, fy + 3, 6, 1, T[2]); box(g, x + 1, fy + 5, 6, 6, T[1]); box(g, x + 1, fy + 4, 1, 7, T[4]); }
  const sc = -176; box(g, 0, sc - 1, w, 10, INK); stoneBlocks(g, 0, sc, w, 8, ramp6(dimmed(SAND)), 7, 26, 8);
  for (let k = 0; k < w / 70; k++) { const px = hash(k * 4.7) * (w - 60), py = -h + 60 + hash(k * 2.9) * (h - 260), pw = 24 + hash(k) * 30, ph = 14 + hash(k * 1.3) * 18; if (Math.abs(py - fy) < 24) continue; box(g, px, py, pw, ph, R[4]); box(g, px, py, pw, 1, R[5]); box(g, px, py + ph, pw, 1, R[2]); checker(g, px + 2, py + 2, pw - 4, ph - 4, R[3], k % 2, 2); }
  for (let k = 0; k < w / 45; k++) { const sx = 10 + hash(k * 6.1) * (w - 20); for (let y = -h + 24; y < -h + 60 + hash(k * 3.3) * 90; y += 2) box(g, sx + ((y >> 3) % 2), y, 3, 2, R[1]); }
  for (let bx = 0, k = 0; bx + 140 <= w; bx += 140, k++) {
    const rx = bx + (k % 2 ? 100 : 104), ry = k % 2 ? -300 : -400, RR = ramp6(dimmed(['#9F1D1D', '#1E3A8A', '#B45309', '#166534'][k % 4]));
    box(g, rx - 4, ry - 3, 46, 4, INK); box(g, rx - 3, ry - 2, 44, 2, Wd[4]);
    box(g, rx - 1, ry, 40, 58, INK); box(g, rx, ry + 1, 38, 56, RR[3]); box(g, rx + 3, ry + 4, 32, 50, RR[2]); box(g, rx + 6, ry + 7, 26, 44, RR[3]);
    poly(g, [[rx + 19, ry + 12], [rx + 29, ry + 29], [rx + 19, ry + 46], [rx + 9, ry + 29]], dimmed('#F2C14E')); poly(g, [[rx + 19, ry + 18], [rx + 24, ry + 29], [rx + 19, ry + 40], [rx + 14, ry + 29]], RR[1]);
    for (let y = ry + 6; y < ry + 54; y += 8) { box(g, rx + 3, y, 2, 2, T[4]); box(g, rx + 33, y, 2, 2, T[4]); }
    for (let x = rx; x < rx + 38; x += 3) box(g, x, ry + 57, 1, 4, T[3]);
    box(g, rx, ry + 1, 2, 56, RR[4]);
  }
  for (let bx = 0, k = 0; bx + 140 <= w; bx += 140, k++) { if (k % 2) mashrabiya(g, bx + 50, -400, 40, 56); else mashrabiya(g, bx + 55, -300, 30, 44); }
  // (the roof over the alley: cedar beams across, a reed lattice between, daylight through its slots; dark after dark)
  for (let x = 0; x < w; x += 140) { box(g, x - 1, -h, 10, h - 150, INK); box(g, x, -h, 8, h - 150, Wd[2]); box(g, x, -h, 2, h - 150, Wd[4]); }
  box(g, 0, -h, w, 24, INK); box(g, 0, -h + 1, w, 22, Wd[1]);
  for (let x = 0; x < w; x += 4) box(g, x, -h + 2, 2, 20, (x / 4) % 3 ? Wd[2] : (on ? '#1A1A34' : dimmed('#F4E8C8')));
  for (let x = 0; x < w; x += 140) { box(g, x, -h + 22, 8, 6, Wd[3]); box(g, x, -h + 22, 8, 1, Wd[5]); }
  // (a pierced brass lantern down off every other beam on its chain, lit after dark)
  const Br = ramp6(dimmed(BRASS));
  for (let x = 70; x < w - 20; x += 280) {
    const ly = -h + 28 + 34;
    for (let y = -h + 28; y < ly; y += 3) box(g, x + 3, y, 2, 2, Br[1]);
    box(g, x - 4, ly - 1, 16, 26, INK); box(g, x - 3, ly, 14, 24, Br[3]); box(g, x - 3, ly, 3, 24, Br[5]); box(g, x + 8, ly, 3, 24, Br[1]);
    for (let yy = ly + 4; yy < ly + 21; yy += 5) for (let xx = x - 1; xx < x + 9; xx += 3) box(g, xx, yy, 1, 2, on ? '#FFD88A' : Br[0]);
    poly(g, [[x - 5, ly], [x + 4, ly - 7], [x + 13, ly]], Br[2]); box(g, x - 2, ly + 24, 12, 3, Br[2]);
  }
  // (the slats of daylight down the wall, dithered, by day)
  if (!on) for (let k = 0; k < w / 140; k++) { const x = 40 + k * 140 + hash(k * 2.3) * 30; for (let y = -h + 24; y < -150; y += 2) checker(g, x + (y + h) * 0.25, y, 10, 2, 'rgba(255, 240, 200, 0.18)', 0, 1); }
};
export const drawSoukWall = (c: Ctx, v: View, x: number, w: number, h: number) => facade(c, v, `ma-soukwall-${w}x${h}`, x, w, h, g => paintSoukWall(g, w, h), 0.9, 20, 10, false);
/** A stall's goods (at 0.96: behind the awning's posts, under it): its back panel hung with goods, a table of them. */
const paintStall = (g: Ctx, w: number, h: number, seed: number) => {
  const Wd = ramp6(dimmed(CEDAR)), KINDS: Goods[] = ['slippers', 'lamps', 'pots', 'rugs', 'fez'];
  box(g, 0, -h, w, h, INK); goodsIn(g, 1, -h + 1, w - 2, h - 32, KINDS[((Math.floor(seed) % KINDS.length) + KINDS.length) % KINDS.length], seed);
  // (the table out front: a cloth over it, its goods)
  box(g, 4, -36, w - 8, 36, INK); box(g, 5, -35, w - 10, 35, ramp6(dimmed(['#9F1D1D', '#1E2F6A', '#1F4A2E'][((Math.floor(seed) % 3) + 3) % 3]))[3]);
  for (let x = 8; x < w - 8; x += 6) box(g, x, -35, 3, 2, dimmed('#F2C14E'));
  for (let x = 10, k = 0; x < w - 14; x += 16, k++) { const R = ramp6(dimmed([BRASS, '#1E50A8', CLAY, TILEGREEN][((Math.floor(k + seed) % 4) + 4) % 4])); box(g, x - 1, -48, 12, 13, INK); box(g, x, -47, 10, 12, R[3]); box(g, x, -47, 3, 12, R[5]); box(g, x + 2, -51, 6, 3, R[2]); }
  box(g, 0, -h, w, 4, Wd[1]);
};
/** A stall under its awning: the goods behind, the poles, the striped canvas (its stripes in steps, scalloped and
 *  fringed along its foot), its top going back (standable: the lit lip). */
export const drawStallAwning = (c: Ctx, v: View, a: number, b: number, y: number, col: string, seed: number, goods = true) => {
  if (!onScreen(v, a - 20, b + 20)) return;
  const gh = Math.min(140, GY - y - 30);
  if (goods && gh > 50) atDepth(c, v.eye, 0.96, () => still(c, `ma-stall-${b - a}-${gh}-${seed % 5}`, a + 6, GY, -2, -gh - 2, b - a - 8, gh + 4, g => paintStall(g, b - a - 12, gh, seed)));
  const Pl = ramp6(hour('#57534E'));
  for (const px0 of [a + 8, b - 8]) post(c, px0, y + 14, GY, 4, Pl);
  const C = ramp6(hour(col)), Wt = ramp6(hour('#F4EFE4'));
  topBack(c, v.eye, a, b, y, 1, 0.95, C, 2);
  for (let x = a, k = 0; x < b; x += 16, k++) {
    const R = k % 2 ? Wt : C, sw = Math.min(16, b - x);
    box(c, x, y, sw, 22, R[3]); box(c, x, y, 2, 22, R[4]); box(c, x + sw - 3, y, 3, 22, R[2]); checker(c, x, y + 16, sw, 4, R[2], 0, 1);
    c.fillStyle = INK; c.beginPath(); c.arc(x + sw / 2, y + 22, sw / 2 + 0.5, 0, Math.PI); c.fill(); c.fillStyle = R[2]; c.beginPath(); c.arc(x + sw / 2, y + 22, sw / 2 - 0.5, 0, Math.PI); c.fill();
    for (let fx = x + 2; fx < x + sw - 1; fx += 3) box(c, fx, y + 22 + sw / 2 - 2, 1, 4, C[4]);
  }
  box(c, a - 1, y, 1, 22, INK); box(c, b, y, 1, 22, INK);
  lip(c, a, y, b - a);
};
/** The corral: its gatepost (a box he hops: lit lip), the rails set back (one broken, hanging), the gate hanging off its
 *  one hinge, a hoofprint trail. */
export const drawCorral = (c: Ctx, v: View, postA: number, postB: number, postTop: number, railTo: number) => {
  if (!onScreen(v, postA - 40, railTo + 40)) return;
  const Wd = ramp6(dimmed('#8A5A30'));
  // (the rails, set back)
  const [r0] = at(v.eye, postB, GY, 0.95), [r1] = at(v.eye, railTo, GY, 0.95);
  const ry = (h: number) => at(v.eye, postB, GY - h, 0.95)[1];
  for (let x = r0 + 40; x < r1; x += 46) { box(c, x - 1, ry(56), 8, ry(0) - ry(56), INK); box(c, x, ry(56), 6, ry(0) - ry(56), Wd[3]); box(c, x, ry(56), 2, ry(0) - ry(56), Wd[4]); }
  for (const h of [44, 22]) { box(c, r0, ry(h) - 1, r1 - r0, 6, INK); box(c, r0, ry(h), r1 - r0, 4, Wd[3]); box(c, r0, ry(h), r1 - r0, 1, Wd[5]); }
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(r1 - 80, ry(44)); c.lineTo(r1 - 30, ry(4)); c.stroke(); c.strokeStyle = Wd[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(r1 - 80, ry(44)); c.lineTo(r1 - 30, ry(4)); c.stroke();
  // (the gate: planks in a Z frame, hanging askew off its top hinge on the gatepost)
  c.save(); c.translate(postB + 2, GY - 54); c.rotate(0.5);
  const G = ramp6(hour('#9A6A3A'));
  for (const yy of [0, 18, 36]) { box(c, -1, yy - 1, 62, 10, INK); box(c, 0, yy, 60, 8, G[3]); box(c, 0, yy, 60, 1, G[5]); }
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(2, 40); c.lineTo(58, 4); c.stroke(); c.strokeStyle = G[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(2, 40); c.lineTo(58, 4); c.stroke();
  box(c, -3, 1, 8, 6, INK); box(c, -2, 2, 6, 4, hour('#71717A'));
  c.restore();
  // (the gatepost: a box he hops)
  box3Back(c, v, { x: postA, top: postTop, w: postB - postA, bottom: GY, col: '#8A5A30' });
  const P = ramp6(hour('#8A5A30'));
  box(c, postA - 1, postTop, postB - postA + 2, GY - postTop, INK); box(c, postA, postTop, postB - postA, GY - postTop, P[3]); box(c, postA, postTop, 4, GY - postTop, P[4]); box(c, postB - 4, postTop, 4, GY - postTop, P[1]);
  for (let y = postTop + 8; y < GY; y += 9) box(c, postA + 6, y, 6, 1, P[2]);
  box(c, postA - 3, postTop - 4, postB - postA + 6, 5, INK); box(c, postA - 2, postTop - 3, postB - postA + 4, 3, P[4]);
  lip(c, postA, postTop, postB - postA);
  // (a trail of hoofprints out of it)
  for (let k = 0; k < 6; k++) { const [hx, hy] = at(v.eye, postA - 40 - k * 46, GY, 0.985 - (k % 2) * 0.012); box(c, hx - 3, hy - 1, 6, 2, dimmed('#7A6A54')); }
};
/** The dust boiling up at the far end (the tell) or kicked up behind the herd: stepped puffs. */
export const dustPuff = (c: Ctx, x: number, y: number, r: number) => {
  const D = ['#A8916A', '#C8B088', '#E0CCA6'];
  pixelBlob(c, x + 2, y + 2, r, r * 0.7, D[0]); pixelBlob(c, x, y, r * 0.86, r * 0.6, D[1]); pixelBlob(c, x - r * 0.25, y - r * 0.2, r * 0.45, r * 0.32, D[2]);
};
/** A fiberglass ride camel at the run (its feet at x.., GY; heading left): legs going (knees, the pads of its feet),
 *  the body in its fiberglass steps (the seam and its bolts, a chip off it), the humps, the saddle blanket and its
 *  tassels, the ride pole snapped off in the saddle, the long neck, the head (the droopy lip, the eye and lashes, an
 *  ear), the bridle and its bells. */
export const drawRideCamel = (c: Ctx, x: number, f: number, k: number, dk = 0) => {
  // (`dk`: how deep in a doorway's dark it is, 0..1: its colors go that far toward the dark in there)
  const sh = (col: string) => (dk > 0 ? mix(hour(col), DARK_IN, dk) : hour(col)), WHITE = dk > 0 ? mix('#F4F2EE', DARK_IN, dk) : '#F4F2EE';
  const C = ramp6(sh(['#C08A4A', '#B47A3E', '#CC9A5A'][k % 3])), Bl = ramp6(sh(['#B91C1C', '#1E3A8A', '#15803D'][k % 3])), Gd = ramp6(sh('#E8B83A')), Ch = ramp6(sh('#C8CDD4'));
  const leg = Math.sin(f * 0.6 + k) * 10, bob = Math.abs(Math.sin(f * 0.3 + k)) * 4, y = GY - bob;
  // (the legs: the far pair darker, the near pair; thigh, knee, shin, the pad)
  for (const [lx, s, far] of [[x + 24, -1, 1], [x + 66, -1, 1], [x + 14, 1, 0], [x + 76, 1, 0]] as const) {
    const R = far ? [C[0], C[1], C[1], C[2]] : [C[1], C[2], C[3], C[4]], sw = s * leg * 0.4, kx = lx + sw * 0.5, ky = y - 28 - bob * 0.2;
    c.strokeStyle = INK; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx + 3, y - 54); c.lineTo(kx + 3, ky); c.lineTo(lx + sw + 3, y - 4); c.stroke();
    c.strokeStyle = R[2]; c.lineWidth = 7; c.beginPath(); c.moveTo(lx + 3, y - 54); c.lineTo(kx + 3, ky); c.lineTo(lx + sw + 3, y - 4); c.stroke();
    c.strokeStyle = R[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(lx + 1, y - 52); c.lineTo(kx + 1, ky); c.stroke();
    c.lineCap = 'butt';
    box(c, kx - 1, ky - 3, 8, 6, R[1]);
    box(c, lx + sw - 3, y - 6, 13, 6, INK); box(c, lx + sw - 2, y - 5, 11, 4, R[1]); box(c, lx + sw - 2, y - 5, 11, 1, R[3]);
  }
  // (the body, the humps)
  const body: [number, number][] = [[x + 8, y - 72], [x + 20, y - 82], [x + 76, y - 82], [x + 90, y - 70], [x + 88, y - 52], [x + 70, y - 46], [x + 24, y - 46], [x + 10, y - 54]];
  poly(c, body.map(([px, py]) => [px + (px < x + 50 ? -1 : 1), py + (py > y - 60 ? 1 : -1)] as [number, number]), INK);
  poly(c, body, C[3]);
  for (const hx of [x + 30, x + 66]) { c.fillStyle = INK; c.beginPath(); c.arc(hx, y - 80, 17, Math.PI, 0); c.fill(); c.fillStyle = C[3]; c.beginPath(); c.arc(hx, y - 80, 16, Math.PI, 0); c.fill(); c.fillStyle = C[4]; c.beginPath(); c.arc(hx - 4, y - 84, 9, Math.PI, 0); c.fill(); box(c, hx - 10, y - 92, 3, 2, C[5]); }
  box(c, x + 12, y - 58, 76, 8, C[2]); checker(c, x + 12, y - 62, 76, 4, C[2], 0, 1); box(c, x + 22, y - 50, 50, 4, C[1]);
  // (the fiberglass seam down its side and its bolts; a chip off the paint, white under it)
  box(c, x + 48, y - 80, 1, 32, C[1]); for (let yy = y - 76; yy < y - 50; yy += 7) box(c, x + 46, yy, 2, 2, Ch[2]);
  if (k % 2) { box(c, x + 74, y - 66, 7, 5, WHITE); box(c, x + 74, y - 66, 7, 1, C[1]); }
  // (the saddle blanket and its tassels between the humps, the snapped ride pole in the saddle)
  box(c, x + 38, y - 90, 22, 30, INK); box(c, x + 39, y - 89, 20, 28, Bl[3]); box(c, x + 39, y - 89, 4, 28, Bl[4]);
  for (let yy = y - 86; yy < y - 62; yy += 6) box(c, x + 41, yy, 16, 2, Gd[3]);
  for (let t = 0; t < 4; t++) { box(c, x + 39 + t * 5, y - 61, 3, 6, Gd[3]); box(c, x + 39 + t * 5, y - 56, 3, 2, Bl[2]); }
  box(c, x + 45, y - 104, 8, 16, INK); box(c, x + 46, y - 104, 6, 15, Ch[3]); box(c, x + 46, y - 104, 2, 15, Ch[5]);
  poly(c, [[x + 45, y - 104], [x + 47, y - 108], [x + 50, y - 105], [x + 53, y - 109], [x + 53, y - 104]], Ch[2]);
  // (the tail)
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 89, y - 68); c.quadraticCurveTo(x + 98, y - 60 + leg * 0.3, x + 94, y - 46); c.stroke();
  c.strokeStyle = C[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 89, y - 68); c.quadraticCurveTo(x + 98, y - 60 + leg * 0.3, x + 94, y - 46); c.stroke();
  // (the neck and head, out front: they run left)
  const neck: [number, number][] = [[x + 10, y - 72], [x - 2, y - 92], [x - 10, y - 106], [x - 2, y - 112], [x + 8, y - 100], [x + 22, y - 76]];
  poly(c, neck.map(([px, py]) => [px - 1, py] as [number, number]), INK); poly(c, neck, C[3]);
  poly(c, [neck[0], neck[1], neck[2], [x - 4, y - 104], [x + 4, y - 92], [x + 14, y - 74]], C[4]);
  box(c, x - 29, y - 117, 26, 15, INK); box(c, x - 28, y - 116, 24, 13, C[3]); box(c, x - 28, y - 116, 24, 3, C[4]); box(c, x - 28, y - 106, 10, 3, C[2]);
  box(c, x - 30, y - 107, 9, 6, INK); box(c, x - 29, y - 106, 7, 4, C[2]); box(c, x - 28, y - 104, 5, 1, C[1]);
  box(c, x - 27, y - 113, 2, 2, INK);
  box(c, x - 18, y - 115, 6, 5, WHITE); box(c, x - 16, y - 114, 3, 3, INK); box(c, x - 19, y - 116, 8, 1, INK); box(c, x - 16, y - 117, 1, 1, INK); box(c, x - 13, y - 117, 1, 1, INK);
  box(c, x - 6, y - 122, 5, 7, INK); box(c, x - 5, y - 121, 3, 5, C[2]);
  // (the bridle and its bells)
  box(c, x - 26, y - 110, 22, 2, Bl[2]); box(c, x - 6, y - 116, 2, 12, Bl[2]);
  for (const [bx, by] of [[x - 2, y - 96], [x + 4, y - 88], [x + 10, y - 80]] as const) { ball(c, bx, by + ((f >> 2) % 2), 3, Gd[3], true); box(c, bx - 1, by + 3, 2, 1, INK); }
};

// ---------------------------------------------------------------------------------------------------------------
// The herd's ways in and out (flush behind the alley, at HERD_D): the CAMEL RIDE's stable gate at the far end, where
// they burst out (its doors rattle first, then fly open), and the souk's gate at the near end, where they go (its doors
// shoved open, swinging shut after). Each a gatehouse of plaster under merlons, a carved frieze, a zellige panel round
// a big horseshoe arch under a green tile hood, a brass lantern hung in the arch's head, its board over it; the dark
// passage going back in steps. The doors and the threshold live (they move); the rest stamped.

/** Where the herd's gates stand (just behind the alley, in front of the souk's wall). */
export const HERD_D = 0.96;
export interface HerdGate { w: number; r: number; h: number; H: number; col: string; lines: string[]; bg: string; seed: number; floor: 'straw' | 'paving'; hoof?: boolean }
/** A herd gate's opening between its jambs (x from its left end). */
export const herdJambs = (G: HerdGate): [number, number] => [G.w / 2 - G.r * 0.8, G.w / 2 + G.r * 0.8];
const boardH = (n: number) => n * 18 - 4 + 6;

const paintHerdGate = (g: Ctx, G: HerdGate) => {
  const { w, r, h, H } = G, cx = w / 2, R = ramp6(dimmed(G.col)), T = ramp6(dimmed(LIME)), Wd = ramp6(dimmed(CEDAR)), Gt = ramp6(dimmed(TILEGREEN));
  box(g, -1, -H - 1, w + 2, H + 1, INK); slab(g, 0, -H, w, H, R, true); stucco(g, 0, -H, w, H, R, G.seed * 17);
  // (the merlons along its top, the zellige band under them, the carved plaster frieze (a run of little arches) under that)
  merlons(g, 0, -H, w, R, 6);
  box(g, 0, -H + 6, w, 14, INK); zellige(g, 0, -H + 7, w, 12);
  const fy = -H + 21;
  box(g, 0, fy, w, 12, T[3]); box(g, 0, fy, w, 1, T[5]); box(g, 0, fy + 11, w, 1, T[1]);
  for (let x = 3; x < w - 7; x += 9) { box(g, x, fy + 3, 7, 7, T[1]); box(g, x + 1, fy + 2, 5, 1, T[1]); box(g, x, fy + 3, 1, 7, T[4]); }
  box(g, 0, fy + 12, w, 1, INK);
  // (the zellige panel round the arch, the green tile hood over it on its cedar shelf)
  const px0 = Math.round(cx - r - 12), pw = Math.round((r + 12) * 2), ptop = -h - 14;
  box(g, px0 - 1, ptop - 1, pw + 2, -ptop + 1, INK);
  g.save(); g.beginPath(); g.rect(px0, ptop, pw, -ptop); g.clip(); zellige(g, px0, ptop, pw, -ptop); g.restore();
  box(g, px0 - 6, ptop - 12, pw + 12, 12, INK); barrelTile(g, px0 - 5, ptop - 11, pw + 10, 10, Gt, 5);
  box(g, px0 - 6, ptop - 1, pw + 12, 2, Wd[1]);
  // (the arch: its ring, the passage going back in steps, darker deeper, its floor (straw in the stable, paving in the
  // souk's))
  archOpening(g, cx, 0, r, h, T, DARK_IN, () => {
    ['#2A1A18', '#20141A', '#170D10'].forEach((col, i) => { const k = i + 1; fillShoe(g, cx, -k * 3, r - k * 8 + 1, h - k * 16 + 1, INK); fillShoe(g, cx, -k * 3, r - k * 8, h - k * 16, col); });
    const F = G.floor === 'straw' ? ramp6(dimmed('#B8923A')) : ramp6(dimmed(SAND));
    poly(g, [[cx - r, 0], [cx + r, 0], [cx + r - 26, -10], [cx - r + 26, -10]], mix(F[1], DARK_IN, 0.55));
    poly(g, [[cx - r, 0], [cx + r, 0], [cx + r - 10, -4], [cx - r + 10, -4]], mix(F[2], DARK_IN, 0.35));
    if (G.floor === 'straw') for (let k = 0; k < 14; k++) { const sx = cx - r + 6 + hash(G.seed + k * 1.7) * (r * 2 - 12), sy = -1 - hash(k * 2.3) * 8; box(g, sx, sy, 3 + (k % 3), 1, mix(F[4], DARK_IN, 0.3 + (-sy / 8) * 0.4)); }
    else for (let x = cx - r + 4; x < cx + r - 4; x += 12) box(g, x, -3, 1, 3, mix(F[0], DARK_IN, 0.4));
  });
  // (the dado: zellige up its foot either side; the plinth)
  box(g, 0, -23, w, 1, INK);
  for (const [a, b] of [[0, px0 - 2], [px0 + pw + 2, w]] as [number, number][]) if (b - a > 4) zellige(g, a, -22, b - a, 18);
  box(g, 0, -4, w, 4, R[1]); checker(g, 0, -6, w, 2, R[1], 0, 1);
  // (its board over the hood, nothing over it; the souk's has a hoofprint stamped on it)
  const bh = boardH(G.lines.length), by = Math.round(ptop - 14 - bh / 2 - 6);
  const [bw] = board(g, cx, by, G.lines, LOOKS.morocco(1), dimmed(G.bg), ramp6(dimmed(BRASS)), 4);
  if (G.hoof) {
    const hx = Math.round(cx + bw / 2 - 12), hy = Math.round(by + bh / 2 - 12), Hf = mix(dimmed(G.bg), INK, 0.6);
    pixelBlob(g, hx - 3, hy, 3, 5, Hf); pixelBlob(g, hx + 3, hy, 3, 5, Hf); box(g, hx - 1, hy - 3, 2, 6, dimmed(G.bg));
  }
};
const paintHerdLeaf = (g: Ctx, G: HerdGate, side: -1 | 1) => {
  const r = G.r, h = G.h, jw = r * 0.8, ccx = -side * jw, x0 = side < 0 ? ccx - r : ccx;
  const W = ramp6(dimmed(CEDAR)), Bz = ramp6(dimmed(BRASS)), Fe = ramp6(dimmed('#52525B'));
  g.save(); g.beginPath(); horseshoe(g, ccx, 0, r, h); g.clip(); g.beginPath(); g.rect(x0, -h, r, h); g.clip();
  planks(g, x0, -h, r, h, W, true, G.seed * 7 + side, 6);
  // (two iron straps across, the brass studs in rows, the dark seam where they meet)
  for (const sy of [Math.round(-h * 0.3), Math.round(-h * 0.7)]) { box(g, x0, sy - 1, r, 6, INK); box(g, x0, sy, r, 4, Fe[2]); box(g, x0, sy, r, 1, Fe[4]); for (let x = x0 + 4; x < x0 + r; x += 9) box(g, x, sy + 1, 2, 2, Fe[0]); }
  for (let y = -h + 12; y < -6; y += 12) for (let x = x0 + 3; x < x0 + r - 2; x += 7) { box(g, x, y, 2, 2, Bz[3]); box(g, x, y, 1, 1, Bz[5]); }
  box(g, ccx - 1, -h, 2, h, INK);
  g.restore();
  // (the iron ring pull by the meeting edge)
  const rx = ccx + side * 7, ry = Math.round(-h * 0.45);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(rx, ry, 4, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = Fe[4]; g.lineWidth = 1; g.beginPath(); g.arc(rx, ry, 4, 0, Math.PI * 2); g.stroke();
};
/** A herd gate (its left end at world x): its ends and top going back, the gatehouse, its threshold out to the alley. */
export const drawHerdGate = (c: Ctx, v: View, x: number, G: HerdGate) => {
  if (!onScreen(v, x - 30, x + G.w + 30, HERD_D)) return;
  const R = ramp6(dimmed(G.col)), D1 = HERD_D - 0.02;
  sideBack(c, v.eye, x, -1, GY - G.H, GY, HERD_D, D1, R, 2, false);
  sideBack(c, v.eye, x + G.w, 1, GY - G.H, GY, HERD_D, D1, R, 2, false);
  topBack(c, v.eye, x, x + G.w, GY - G.H, HERD_D, D1, R, 2);
  facade(c, v, `ma-herdgate-${G.seed}`, x, G.w, G.H, g => paintHerdGate(g, G), HERD_D, 24, 4, false);
  // (the threshold: the passage's floor coming out from under the arch to the alley's paving)
  const [l, rr] = herdJambs(G), F = ramp6(hour(G.floor === 'straw' ? '#9C8058' : SAND));
  const p0 = at(v.eye, x + l, GY, HERD_D), p1 = at(v.eye, x + rr, GY, HERD_D);
  poly(c, [p0, p1, [x + rr, GY], [x + l, GY]], mix(F[1], DARK_IN, 0.35));
  box(c, x + l, GY - 1, rr - l, 1, F[3]);
};
/** A herd gate's doors (live: they move): `open` 0 (shut) .. 1 (swung back into the dark against the jambs); `shake`
 *  px of rattle (the leaves knocking together: something big shoving on them). */
export const drawHerdDoors = (c: Ctx, v: View, x: number, G: HerdGate, open: number, shake: number) => {
  if (!onScreen(v, x, x + G.w, HERD_D)) return;
  const jw = G.r * 0.8, cx = x + G.w / 2, r = G.r, h = G.h;
  atDepth(c, v.eye, HERD_D, () => {
    for (const side of [-1, 1] as const) {
      const ccx = -side * jw, x0 = side < 0 ? ccx - r : ccx;
      c.save(); c.translate(Math.round(cx + side * jw - shake * side), GY); c.scale(1 - 0.82 * open, 1);
      still(c, `ma-herdleaf-${G.seed}-${side}`, 0, 0, x0 - 4, -h - 4, r + 16, h + 6, g => paintHerdLeaf(g, G, side));
      if (open > 0) { c.beginPath(); horseshoe(c, ccx, 0, r, h); c.clip(); c.fillStyle = `rgba(18, 10, 12, ${(0.65 * open).toFixed(2)})`; c.fillRect(x0, -h, r, h); }
      c.restore();
    }
    // (the brass lantern hung on its chain from the hood, over the crown of the arch: lit after dark)
    brassLantern(c, cx, GY - h + 14, 6, false, 22);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The flag

/** Morocco's flag: red in stepped folds, the green star outline riding them. */
export const drawMaFlag = (c: Ctx, x: number, f: number) => {
  flagPole(c, x, GY, 200, ['#C1272D'], f);
  const top = GY - 198, cx = x + 26, cy = top + 15 + Math.sin(f * 0.08 + 3) * 2 * (24 / 48 + 0.3);
  c.strokeStyle = hour('#00502A'); c.lineWidth = 3; c.beginPath();
  for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5, sx = cx + Math.cos(a) * 8, sy = cy + Math.sin(a) * 8; if (k) c.lineTo(sx, sy); else c.moveTo(sx, sy); }
  c.stroke();
  c.strokeStyle = hour('#00A050'); c.lineWidth = 1; c.stroke();
};

void skyAt; void mix;
