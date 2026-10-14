// Futureland's far off (screen space; the square's and the main drag's backdrops, and drawn small in the walk in): the
// sky by the hour (banded, the sun, the moon and stars after dark), a bank of fair-weather clouds drifting, the park's
// blimp going over, the far skyline of the future (domes, saucers on stalks, a rocket, the ORBITRON's arms; their
// bulbs lit after dark) with the haze at its foot; and the two big things over it all, each the same wherever it's
// seen: THE GIANT ATOM (a ball of fiberglass on its stalk, three chrome orbits turning round it, a car going round
// each) and SPACE NEEDLE 2 (three legs to a waist, saucer decks up its shaft, the lift going up and down, and on up out
// of sight: it goes to space).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, cloudTint, hourMix, type TimeOfDay } from '../../timeOfDay';
import { type Ctx, INK, box, checker, mix, hash, stamp, hazeBands, pixelBlob, steppedGlow, words, bandedGradient, CHROME, ramp6 } from './paint';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const TW = 1024;

/** Where the horizon sits on screen (it drifts down a little as the camera climbs). */
export const horizonY = (state: GameState) => 430 - Math.min(0, state.camera.y) * 0.12;

/** Futureland's own sky, top to horizon: a clean cartoon blue down to a pale minty haze. */
const SKY = ['#2456C8', '#3A7EE0', '#5AA6EE', '#86CCF0', '#B4E6EA', '#E4F6E4'];

export const drawSky = (c: Ctx, state: GameState) => {
  const hz = horizonY(state);
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: hz, sun: [640, 110], moon: [150, 80], t: state.frame, scroll: state.camera.x * 0.02 });
};

// ---------------------------------------------------------------------------------------------------------------
// Tiles (painted once for the hour, slid along)

const tile = (c: Ctx, key: string, off: number, y: number, h: number, paint: (g: Ctx) => void) => {
  for (let x = -((((off) % TW) + TW) % TW); x < W; x += TW) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key, 0, 0, TW, h, paint); c.restore(); }
};
const wrap = (x: number, draw: (x: number) => void) => { draw(x); if (x < 240) draw(x + TW); if (x > TW - 240) draw(x - TW); };

/** The clouds: puffy, flat-bottomed, in three steps (lit tops), a few long thin streaks higher up. */
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const dk = cloudTint('#C8D4E8', tod), body = cloudTint('#E6EEF8', tod), top = cloudTint('#FFFFFF', tod);
  for (let i = 0; i < 6; i++) wrap(i * (TW / 6) + hash(i * 3.1) * 80, x => {
    const y = 70 + hash(i * 1.7) * 70, w = 90 + hash(i * 2.3) * 90;
    pixelBlob(g, x, y + 8, w * 0.55, 9, dk);
    pixelBlob(g, x - w * 0.12, y, w * 0.3, 14, body);
    pixelBlob(g, x + w * 0.18, y + 2, w * 0.22, 11, body);
    pixelBlob(g, x - w * 0.2, y - 6, w * 0.16, 7, top);
    box(g, x - w * 0.52, y + 14, w * 1.04, 3, dk);
  });
  for (let i = 0; i < 4; i++) wrap(i * (TW / 4) + 60, x => { const y = 30 + hash(i * 5.5) * 20; box(g, x, y, 120, 2, body); checker(g, x - 20, y, 20, 2, body, 0, 2); checker(g, x + 120, y, 30, 2, body, 1, 2); });
};

/** The far skyline of the future (hazy): domes ribbed in steps, saucers up on stalks, a rocket on its gantry, the
 *  ORBITRON's arms, a tower with a ball on top; their bulbs lit after dark. Its foot at the tile's bottom. */
const paintFar = (g: Ctx, tod: TimeOfDay, h: number, k: number, seed: number) => {
  const T = (c: string) => mix(farTint(c, 1, tod), skyAt(0.86, tod), k);
  const body = T(hourMix('#8A9AC8', '#9A7AA0', '#2A3058', tod)), sh = T(hourMix('#7484B4', '#80648A', '#20264A', tod)), lt = T(hourMix('#A8B6DC', '#C09AB0', '#3A4270', tod));
  const bulb = tod.lamps > 0.3 ? '#FFE8A0' : lt, f = h;
  let x = 0, i = seed;
  while (x < TW) {
    const kind = Math.floor(hash(i * 7.3) * 6), w = 70 + hash(i * 2.9) * 80;
    const cx = x + w / 2;
    if (kind === 0) {
      // (a dome, ribbed)
      const r = w * 0.45;
      g.fillStyle = sh; g.beginPath(); g.arc(cx, f, r, Math.PI, 0); g.fill();
      g.fillStyle = body; g.beginPath(); g.arc(cx - r * 0.1, f, r * 0.82, Math.PI, 0); g.fill();
      g.fillStyle = lt; g.beginPath(); g.arc(cx - r * 0.3, f - r * 0.3, r * 0.3, 0, Math.PI * 2); g.fill();
      for (let a = 1; a < 6; a++) { const xx = cx + Math.cos((a * Math.PI) / 6) * r; box(g, xx, f - Math.sin((a * Math.PI) / 6) * r, 1, Math.sin((a * Math.PI) / 6) * r, sh); }
      box(g, cx - 1, f - r - 10, 2, 10, sh); box(g, cx - 2, f - r - 12, 4, 3, bulb);
    } else if (kind === 1) {
      // (a saucer up on its stalk)
      const sh2 = 80 + hash(i) * 60;
      box(g, cx - 3, f - sh2, 6, sh2, sh); box(g, cx - 3, f - sh2, 2, sh2, lt);
      g.fillStyle = sh; g.beginPath(); g.ellipse(cx, f - sh2, w * 0.42, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = body; g.beginPath(); g.ellipse(cx, f - sh2 - 2, w * 0.4, 5, 0, Math.PI, Math.PI * 2); g.fill();
      g.fillStyle = lt; g.beginPath(); g.arc(cx, f - sh2 - 6, 9, Math.PI, 0); g.fill();
      for (let b = -3; b <= 3; b++) box(g, cx + b * w * 0.1 - 1, f - sh2 + 1, 2, 2, bulb);
    } else if (kind === 2) {
      // (a rocket on its gantry)
      const rh = 110 + hash(i * 1.3) * 50;
      for (let y = f - rh + 20; y < f; y += 10) { box(g, cx + 12, y, 10, 1, sh); box(g, cx + 12, y, 1, 10, sh); box(g, cx + 21, y, 1, 10, sh); }
      g.fillStyle = body; g.beginPath(); g.moveTo(cx - 8, f - 14); g.lineTo(cx - 8, f - rh + 30); g.quadraticCurveTo(cx, f - rh - 10, cx + 8, f - rh + 30); g.lineTo(cx + 8, f - 14); g.fill();
      box(g, cx - 8, f - rh + 30, 4, rh - 44, lt);
      g.fillStyle = sh; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 8, f - 40); g.lineTo(cx + s * 18, f - 4); g.lineTo(cx + s * 8, f - 14); g.fill(); }
      box(g, cx - 2, f - rh + 4, 4, 4, bulb);
    } else if (kind === 3) {
      // (the ORBITRON: a hub up on a post, its arms out, a rocket car on the end of each)
      const ph = 70 + hash(i) * 30;
      box(g, cx - 3, f - ph, 6, ph, sh);
      for (let a = 0; a < 6; a++) { const an = (a * Math.PI) / 3 + 0.3, ex = cx + Math.cos(an) * w * 0.45, ey = f - ph + Math.sin(an) * 14; g.strokeStyle = sh; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, f - ph - 6); g.lineTo(ex, ey); g.stroke(); box(g, ex - 5, ey - 3, 10, 6, body); box(g, ex - 5, ey - 3, 10, 2, lt); }
      g.fillStyle = body; g.beginPath(); g.arc(cx, f - ph - 6, 9, 0, Math.PI * 2); g.fill();
      box(g, cx - 1, f - ph - 24, 2, 10, sh); box(g, cx - 2, f - ph - 26, 4, 3, bulb);
    } else if (kind === 4) {
      // (a tower with a ball on top)
      const th = 120 + hash(i * 4.1) * 70;
      g.fillStyle = sh; g.beginPath(); g.moveTo(cx - 12, f); g.lineTo(cx - 4, f - th); g.lineTo(cx + 4, f - th); g.lineTo(cx + 12, f); g.fill();
      box(g, cx - 4, f - th, 3, th, lt);
      g.fillStyle = body; g.beginPath(); g.arc(cx, f - th - 10, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = lt; g.beginPath(); g.arc(cx - 4, f - th - 14, 4, 0, Math.PI * 2); g.fill();
      for (let y = f - th + 12; y < f - 10; y += 16) box(g, cx - 1, y, 2, 2, bulb);
    } else {
      // (a low pavilion, a zigzag roof)
      const ph = 30 + hash(i) * 30;
      box(g, x + 4, f - ph, w - 8, ph, body); box(g, x + 4, f - ph, 3, ph, lt); box(g, x + w - 8, f - ph, 4, ph, sh);
      g.fillStyle = sh; g.beginPath(); g.moveTo(x, f - ph); for (let z = 0; z <= 4; z++) g.lineTo(x + (z * w) / 4, f - ph - (z % 2 ? 14 : 0)); g.lineTo(x + w, f - ph + 4); g.lineTo(x, f - ph + 4); g.fill();
      for (let wx = x + 12; wx < x + w - 14; wx += 12) box(g, wx, f - ph + 10, 6, 8, tod.lamps > 0.3 ? '#E8C070' : sh);
    }
    x += w + 10 + hash(i * 5.7) * 40;
    i++;
  }
  // (the ground they stand on, and the haze lying over their feet)
  box(g, 0, f, TW, 2, sh);
  hazeBands(g, 0, f - 50, TW, 50, skyAt(0.92, tod), 0, 0.55, 5);
};

export const drawClouds = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state);
  tile(c, `spc-clouds-${tod.key}`, state.camera.x * 0.015 + state.frame * 0.03, hz - 330, 200, g => paintClouds(g, tod));
};
/** The far skyline (at parallax `k`; `haze` how far into the sky's haze it's gone). */
export const drawFarSkyline = (c: Ctx, state: GameState, k: number, haze: number, seed: number, dy = 0) => {
  const tod = timeOfDay(), hz = horizonY(state), FH = 240;
  tile(c, `spc-far-${seed}-${haze}-${tod.key}`, state.camera.x * k + seed * 300, hz - FH + dy, FH + 2, g => paintFar(g, tod, FH, haze, seed));
  // (under it, down to the bottom of the screen: the ground of the far park, never the sky)
  // (banded, darker nearer, rows of far planters and lamp bulbs along it)
  const T = (k: number) => mix(farTint(hourMix('#8A9AC8', '#9A7AA0', '#2A3058', tod), 1, tod), skyAt(0.9, tod), haze * k);
  const top = hz + dy + 2;
  bandedGradient(c, 0, top, W, H - top, [T(1), T(0.7), T(0.45), T(0.3)], 6);
  const bulb = tod.lamps > 0.3 ? '#FFE8A0' : T(0.2);
  for (let r = 0; r < 3; r++) { const y = top + 14 + r * 26 + r * r * 6, off = -(((state.camera.x * (k + 0.03 * (r + 1))) % 40) + 40) % 40; for (let x = off; x < W; x += 40 - r * 6) box(c, x, y, 2 + r, 1 + (r >> 1), r % 2 ? bulb : T(0.15)); }
};

/** The park's blimp, going over (FUTURELAND on its side; its lights blinking after dark). */
export const drawBlimp = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), t = state.frame;
  const x = Math.round((((t * 0.12 - state.camera.x * 0.03) % 1600) + 1600) % 1600 - 300), y = Math.round(horizonY(state) - 300 + Math.sin(t * 0.01) * 3);
  if (x < -140 || x > W + 140) return;
  const R = ['#4A3448', '#7A5A78', '#B48CB0', '#DCC0DA', '#F6E8F4'].map(col => farTint(col, 0.6, tod));
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 62, 19, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[1]; c.beginPath(); c.ellipse(x, y, 61, 18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.ellipse(x - 3, y - 2, 57, 14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[3]; c.beginPath(); c.ellipse(x - 10, y - 7, 40, 7, 0, 0, Math.PI * 2); c.fill();
  box(c, x - 30, y - 12, 24, 2, R[4]);
  // (the fins, the gondola, its stripe)
  for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(x - 50, y + s * 4); c.lineTo(x - 70, y + s * 18); c.lineTo(x - 62, y + s * 2); c.fill(); c.fillStyle = farTint('#22BCAC', 0.6, tod); c.beginPath(); c.moveTo(x - 52, y + s * 4); c.lineTo(x - 68, y + s * 15); c.lineTo(x - 61, y + s * 2); c.fill(); }
  box(c, x - 60, y - 1, 120, 3, farTint('#E8659E', 0.6, tod));
  box(c, x - 10, y + 18, 22, 7, INK); box(c, x - 9, y + 18, 20, 5, R[2]); for (let k = 0; k < 4; k++) box(c, x - 7 + k * 5, y + 19, 3, 2, tod.lamps > 0.3 ? '#FFE8A0' : '#3A4A6A');
  if (tod.lamps > 0.3 && (t >> 4) % 2) { box(c, x + 60, y - 1, 3, 3, '#FF4A4A'); box(c, x - 70, y + 16, 2, 2, '#4AFF8A'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Stepped spheres and tubes

/** A ball in stepped shells (darkest at the rim, lit to the upper left), each shell dithered into the one under it. */
const sphere = (c: Ctx, x: number, y: number, r: number, R: string[], px = 2) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + Math.max(1, px * 0.6), 0, Math.PI * 2); c.fill();
  const n = R.length;
  for (let i = 0; i < n; i++) {
    const rr = r * (1 - i * 0.15), off = r * i * 0.085;
    if (rr <= 0) break;
    if (i) { c.save(); c.beginPath(); c.arc(x - off, y - off, rr + px * 1.5, 0, Math.PI * 2); c.clip(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip(); checker(c, x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4, R[i], 0, px); c.restore(); }
    c.fillStyle = R[i]; c.beginPath(); c.arc(x - off, y - off, rr, 0, Math.PI * 2); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE GIANT ATOM

/**
 * The giant atom (screen space), its nucleus at (x, y), `s` its scale: a ball of pale lilac fiberglass on a chrome
 * stalk, its panels' seams, a band of portholes (lit after dark), three chrome orbits turning slow round it with bulbs
 * chasing along them and a car going round each (it's a ride); lit by the hour, hazier the smaller (the further) it is.
 * `hole`: the hole he came out through, torn, smoking. `px`: the size of a pixel here (1 in the walk-in's picture).
 */
export const drawGiantAtom = (c: Ctx, x: number, y: number, s: number, t: number, hole = false, px = 2) => {
  const tod = timeOfDay(), night = tod.lamps;
  const far = Math.max(0, Math.min(1, 1.3 - s * 0.7));
  const T = (col: string, k = 0) => mix(farTint(col, 0.3 + far * 0.6, tod), skyAt(0.85, tod), far * 0.22 + k);
  const R = 74 * s;
  // The stalk, down to the ground, and its fins (chrome, banded across; a collar under the ball)
  const st = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0'].map(col => T(col));
  const sw = 34 * s;
  box(c, x - sw / 2 - 1, y, sw + 2, 900, INK);
  box(c, x - sw / 2, y, sw, 900, st[2]);
  box(c, x - sw / 2, y, sw * 0.18, 900, st[3]); box(c, x - sw / 2 + sw * 0.18, y, Math.max(1, sw * 0.1), 900, st[4]);
  box(c, x + sw / 2 - sw * 0.28, y, sw * 0.28, 900, st[1]); checker(c, x + sw / 2 - sw * 0.38, y, sw * 0.1, 900, st[1], 0, px);
  for (let k = 1; k < 8; k++) box(c, x - sw / 2, y + R + k * 60 * s, sw, Math.max(1, 2 * s), st[0]);
  for (const sd of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + sd * sw / 2, y + 150 * s); c.lineTo(x + sd * 74 * s, y + 330 * s); c.lineTo(x + sd * 74 * s, y + 345 * s); c.lineTo(x + sd * sw / 2, y + 310 * s); c.fill();
    c.fillStyle = sd < 0 ? st[3] : st[1]; c.beginPath(); c.moveTo(x + sd * sw / 2, y + 156 * s); c.lineTo(x + sd * 70 * s, y + 330 * s); c.lineTo(x + sd * 70 * s, y + 340 * s); c.lineTo(x + sd * sw / 2, y + 306 * s); c.fill();
    box(c, x + sd * 70 * s - (sd > 0 ? 0 : 2), y + 330 * s, 2, 10 * s, night > 0.3 ? '#FF5A6A' : T('#E8659E'));
  }
  // The rings: a chrome tube each (inked, shaded under, lit along the top), bulbs chasing; a car going round
  const ringR = ['#3A3258', '#6A6290', '#A0A0C8', '#D4D8EC', '#FFFFFF'].map(col => T(col));
  const ringB = ringR.map(col => mix(col, skyAt(0.6, tod), 0.25 + far * 0.1));
  const tube = (k: number, front: boolean) => {
    const a = (k * Math.PI) / 3 + t * 0.0025, rx = 210 * s, ry = 58 * s, tw = Math.max(px * 1.5, 9 * s);
    const Rr = front ? ringR : ringB;
    const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2;
    c.save(); c.translate(x, y); c.rotate(a);
    c.lineCap = 'butt';
    c.lineWidth = tw + 2; c.strokeStyle = INK; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
    c.lineWidth = tw; c.strokeStyle = Rr[1]; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke();
    c.lineWidth = tw * 0.55; c.strokeStyle = Rr[2]; c.beginPath(); c.ellipse(0, -tw * 0.12, rx, ry, 0, a0, a1); c.stroke();
    c.lineWidth = Math.max(px * 0.5, tw * 0.18); c.strokeStyle = Rr[4]; c.beginPath(); c.ellipse(0, -tw * 0.25, rx, ry, 0, a0, a1); c.stroke();
    // (the bulbs: chasing; brighter after dark)
    const n = 14;
    for (let i = 0; i < n; i++) {
      const u = a0 + ((i + ((t * 0.05) % 1)) / n) * Math.PI;
      const on = (i + Math.floor(t / 5)) % 4 === 0;
      const col = on ? (night > 0.3 ? '#FFF2A8' : '#FFFFFF') : (night > 0.3 ? '#F0ABFC' : Rr[3]);
      const bs = Math.max(px, 4 * s);
      box(c, Math.cos(u) * rx - bs / 2, Math.sin(u) * ry - bs / 2, bs, bs, col);
    }
    // (its car: a little rocket going round, on the half it's on)
    const cu = ((t * 0.006 + k * 2.1) % (Math.PI * 2));
    if ((cu < Math.PI) === front) {
      const cx = Math.cos(cu) * rx, cy = Math.sin(cu) * ry, cs = Math.max(px * 2, 12 * s);
      c.fillStyle = INK; c.beginPath(); c.ellipse(cx, cy - tw * 0.4, cs * 0.75, cs * 0.45, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = T(['#E8659E', '#22BCAC', '#FB9440'][k]); c.beginPath(); c.ellipse(cx, cy - tw * 0.4, cs * 0.65, cs * 0.36, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = T('#BFE6FF'); c.beginPath(); c.ellipse(cx - cs * 0.1, cy - tw * 0.4 - cs * 0.22, cs * 0.3, cs * 0.2, 0, Math.PI, 0); c.fill();
    }
    c.restore();
  };
  for (let k = 0; k < 3; k++) tube(k, false);
  // The ball: stepped shells, its seams, a band of portholes round it
  if (night > 0.3) steppedGlow(c, x, y, R * 1.5, '#F0ABFC', 0.12 * night, 0, 4);
  const B = ['#4A2A78', '#6E46A2', '#9470C4', '#B89ADE', '#DCC8F2', '#F6EEFF'].map(col => T(col));
  sphere(c, x, y, R, B, px);
  c.save(); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.clip();
  c.strokeStyle = B[1]; c.lineWidth = Math.max(1, px * 0.5);
  for (let k = -2; k <= 2; k++) if (k) { c.beginPath(); c.ellipse(x, y, R * Math.abs(Math.sin(k * 0.55)), R, 0, 0, Math.PI * 2); c.stroke(); }
  for (const dy of [-0.55, 0.55]) box(c, x - R, y + dy * R, R * 2, Math.max(1, px * 0.5), B[1]);
  // (the band: chrome, portholes along it, lit after dark)
  const bh = Math.max(px * 2, 14 * s);
  box(c, x - R, y - bh / 2, R * 2, bh, INK); box(c, x - R, y - bh / 2 + 1, R * 2, bh - 2, T(CHROME[3])); box(c, x - R, y - bh / 2 + 1, R * 2, Math.max(1, bh * 0.2), T(CHROME[5]));
  const ps = Math.max(px, 5 * s);
  for (let k = -5; k <= 5; k++) { const pxx = x + k * R * 0.17 * (1 - Math.abs(k) * 0.03); box(c, pxx - ps / 2, y - ps / 2, ps, ps, night > 0.3 ? '#FFE8A0' : T('#2A3A5A')); }
  // (light off the rings round its lower right)
  c.strokeStyle = T('#F0ABFC'); c.lineWidth = Math.max(px, 3 * s); c.beginPath(); c.arc(x, y, R - 2 * s, 0.1, 1.3); c.stroke();
  c.restore();
  if (hole) {
    // (the hole he came out through: torn, its edges peeled back, dark inside, a wire or two hanging, smoke)
    const hx = x + R * 0.42, hy = y + R * 0.2;
    c.fillStyle = INK; c.beginPath();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = R * (0.17 + (i % 2) * 0.08 + hash(i) * 0.03); c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); }
    c.closePath(); c.fill();
    c.fillStyle = '#05020A'; c.beginPath(); c.arc(hx, hy, R * 0.13, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 6; i++) { const a = i * 1.05, r = R * 0.22; box(c, hx + Math.cos(a) * r - px, hy + Math.sin(a) * r - px, px * 2, px * 2, B[4]); }
    c.strokeStyle = T('#FB9440'); c.lineWidth = Math.max(1, px * 0.5); c.beginPath(); c.moveTo(hx - R * 0.05, hy + R * 0.1); c.quadraticCurveTo(hx, hy + R * 0.3, hx + R * 0.06, hy + R * 0.34); c.stroke();
    for (let i = 0; i < 6; i++) {
      const u = ((t * 0.5 + i * 40) % 240) / 240;
      const g2 = Math.round(70 + 40 * u);
      pixelBlob(c, hx + u * 50 * s + Math.sin(t * 0.04 + i) * 6 * s, hy - u * 170 * s, (10 + u * 30) * s, (8 + u * 24) * s, `rgba(${g2}, ${g2}, ${g2 + 10}, ${(0.6 * (1 - u)).toFixed(3)})`, px);
    }
  }
  for (let k = 0; k < 3; k++) tube(k, true);
  // Its name on a plate up on the ball (dark: the near rings cross it; up there, clear of the signs down in the square)
  if (s > 0.6) {
    const size = s > 1.2 ? 10 : 8, ly = Math.round(y - R * 0.5 + size / 2);
    c.font = `${size}px "Press Start 2P"`;
    const w = c.measureText('THE GIANT ATOM').width + 14;
    box(c, x - w / 2 - 2, ly - size - 7, w + 4, size + 12, INK); box(c, x - w / 2, ly - size - 5, w, size + 8, T('#3B0764')); box(c, x - w / 2, ly - size - 5, w, 1, T('#7A3AAE'));
    words(c, 'THE GIANT ATOM', x, ly, night > 0.3 ? '#F0ABFC' : '#FFFFFF', size, INK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// SPACE NEEDLE 2

/**
 * Space Needle 2 (screen space), its base at (x, gy), `s` its scale: three legs (white enamel, lit down their left
 * sides) from wide at the ground in to a waist and out again to the first deck; the lift shaft straight up the middle
 * forever, the lift going up and down it; saucer decks up it (their undersides stepped, a rim of windows, a dome on
 * top), smaller and smaller; the beacon blinking. `px`: the size of a pixel here.
 */
export const drawNeedle = (c: Ctx, x: number, gy: number, s: number, t: number, px = 2) => {
  const tod = timeOfDay(), night = tod.lamps;
  const far = Math.max(0, Math.min(1, 1.2 - s * 0.8));
  const T = (col: string) => mix(farTint(col, 0.3 + far * 0.6, tod), skyAt(0.85, tod), far * 0.25);
  const L = ['#5A6680', '#8A96B0', '#C4CCDC', '#EEF2F8', '#FFFFFF'].map(T);
  const D = ['#5A0E2A', '#8E1A42', '#C8325E', '#F05A80', '#FF9AB4', '#FFD8E2'].map(T);
  const waist = gy - 220 * s, deck1 = gy - 380 * s;
  // (a leg: foot to waist to the deck, a quad each way, lit down its left)
  const leg = (a: number, b: number, col: string, lit: string) => {
    const seg = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) => {
      c.fillStyle = INK; c.beginPath(); c.moveTo(x0 - w0 - 1, y0); c.lineTo(x1 - w1 - 1, y1); c.lineTo(x1 + w1 + 1, y1); c.lineTo(x0 + w0 + 1, y0); c.fill();
      c.fillStyle = col; c.beginPath(); c.moveTo(x0 - w0, y0); c.lineTo(x1 - w1, y1); c.lineTo(x1 + w1, y1); c.lineTo(x0 + w0, y0); c.fill();
      c.fillStyle = lit; c.beginPath(); c.moveTo(x0 - w0, y0); c.lineTo(x1 - w1, y1); c.lineTo(x1 - w1 * 0.3, y1); c.lineTo(x0 - w0 * 0.3, y0); c.fill();
    };
    seg(x + a * 90 * s, gy, x + b * 22 * s, waist, 6 * s, 4 * s);
    seg(x + b * 22 * s, waist, x + a * 46 * s, deck1, 4 * s, 3 * s);
  };
  leg(-1, -0.35, L[1], L[2]); leg(-0.3, 0.05, L[2], L[3]); leg(1, 0.35, L[2], L[4]);
  // (the waist ring)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, waist, 30 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = D[2]; c.beginPath(); c.ellipse(x, waist, 28 * s, 5 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = D[4]; c.beginPath(); c.ellipse(x - 4 * s, waist - 2 * s, 20 * s, 2 * s, 0, 0, Math.PI * 2); c.fill();
  // (the core: the lift shaft, straight up from the ground, forever; banded round)
  const cw = 18 * s;
  box(c, x - cw / 2 - 1, -10, cw + 2, gy + 10, INK);
  box(c, x - cw / 2, -10, cw, gy + 10, L[2]);
  box(c, x - cw / 2, -10, cw * 0.25, gy + 10, L[3]); box(c, x - cw / 2 + cw * 0.12, -10, Math.max(1, px * 0.5), gy + 10, L[4]);
  box(c, x + cw / 2 - cw * 0.3, -10, cw * 0.3, gy + 10, L[1]); checker(c, x + cw / 2 - cw * 0.42, -10, cw * 0.12, gy + 10, L[1], 0, px);
  for (let y = gy - 40 * s; y > -10; y -= 50 * s) box(c, x - cw / 2, y, cw, Math.max(1, px * 0.5), L[1]);
  // (the lift going up and down it)
  const lift = gy - (((t * 1.4) % 1400) / 1400) * (gy + 200);
  box(c, x - cw * 0.4, lift, cw * 0.8, 16 * s, INK); box(c, x - cw * 0.35, lift + 1, cw * 0.7, 16 * s - 2, night > 0.3 ? '#FDE68A' : '#F59E0B');
  // (the decks: saucers round the shaft)
  const saucer = (y: number, r: number) => {
    if (y + r * 0.4 < -20 || y - r * 0.4 > H + 20) return;
    // the underside, stepped up into the rim
    for (let k = 0; k < 4; k++) { c.fillStyle = k ? D[k - 1] : INK; c.beginPath(); c.ellipse(x, y + r * 0.04 * (3 - k), r * (1 - k * 0.12) + (k ? 0 : 2), r * 0.24 * (1 - k * 0.2) + (k ? 0 : 2), 0, 0, Math.PI); c.fill(); }
    // the rim (a band of windows), the dome on top
    box(c, x - r - 2, y - r * 0.07 - 1, r * 2 + 4, r * 0.1 + 2, INK);
    box(c, x - r, y - r * 0.07, r * 2, r * 0.1, D[3]); box(c, x - r, y - r * 0.07, r * 2, Math.max(1, r * 0.025), D[5]);
    const n = Math.max(4, Math.round(r / (8 * Math.max(0.3, s))));
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, wx = x - r + u * 2 * r; box(c, wx - Math.max(px, r * 0.03), y - r * 0.045, Math.max(px, r * 0.06), Math.max(px, r * 0.05), night > 0.3 ? '#FEF08A' : T('#1E2A48')); }
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - r * 0.07, r * 0.94 + 1, r * 0.2 + 1, 0, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = L[2]; c.beginPath(); c.ellipse(x, y - r * 0.07, r * 0.94, r * 0.2, 0, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = L[3]; c.beginPath(); c.ellipse(x - r * 0.15, y - r * 0.1, r * 0.6, r * 0.13, 0, Math.PI, Math.PI * 2); c.fill();
    box(c, x - r * 0.5, y - r * 0.2, r * 0.3, Math.max(1, px * 0.5), L[4]);
  };
  saucer(deck1, 110 * s);
  saucer(deck1 - 520 * s, 70 * s);
  saucer(deck1 - 980 * s, 44 * s);
  saucer(deck1 - 1380 * s, 30 * s);
  // (beacons up it, blinking)
  if ((t >> 4) % 2) for (const by of [deck1 - 540 * s, deck1 - 1000 * s, deck1 - 1400 * s]) if (by > -10) box(c, x - px, by - 12 * s, px * 2, px * 2, night > 0.2 ? '#FF4A5A' : '#FF8A9A');
  // (the sign on the first deck)
  if (s > 0.5) words(c, 'SPACE NEEDLE 2', x, deck1 + 30 * s, '#FFFFFF', s > 1 ? 10 : 8, INK);
  void ramp6;
};
