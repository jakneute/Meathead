// The alpha's ending (the user's: "after exiting to hub ... as the last guy killed, show a closeup of the PA, during
// night time ... then just play triumphant music as "THE END?" plays"). The last land's boss down (store.ts
// takeAlphaEndDue), his walk-away's A doesn't take him on: it cuts to this. The park's PA horn at night, a Ren & Stimpy
// gross-up of it (the user's: "the PA should be a 'gross up' too. why not?"): rust, flaking paint, pigeon shit, gum and
// dead bugs in its grille, a cobweb, a pigeon on it, a frayed taped wire, the grille rattling and spitting as it talks.
// America USA's announcer (intro/lines.ts PA_VOICE) says his piece (PA_ALPHA_END, a line at a time, its words up only
// while they're said). Then the theme, triumphant (music/cues.ts: the 'alphaend' moment), fireworks, THE END? in
// marquee bulbs; a couple of seconds on, any button: back to the title.
//
// Played inside the walk-away (walkAway.ts: it ticks and draws this in its place), so the stage holds still under it,
// in its cutscene, nothing his to play. Start / Esc (the cutscene skip) cuts the PA short, straight to THE END?.
//
// Dev (and the cheats build): ?alphaend plays it on its own over the page; ?alphaend=walk makes the next boss's
// walk-away end in it.

import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import type { Controls } from '../m1/game/platform/input';
import { playSound } from '../m1/game/platform/audio';
import { offerSkip, takeSkip } from '../m1/game/platform/skip';
import { say, cutVoice } from '../m1/game/platform/speech';
import { voicesLoaded } from '../m1/game/platform/voiceclips';
import { inputDevice, padFamily } from '../m1/game/platform/device';
import { drawPadFace } from '../m1/game/render/padGlyph';
import { musicMoment } from './music/moments';
import { PA_VOICE, PA_ALPHA_END } from './intro/lines';
import { glyphDots } from './space/square/lettering';
import { font, bar, canvas } from './walkAway/screen';
import { closeFile, saveProgress } from './save';
import { setAlphaEndDue, setAlphaEndSeen } from './store';
import { M2_PUBLIC } from './build';
import {
  type Buf, type Steps, GW, GH, R, hexU, mixU, WHITE, newBuf, bay, hash2, setSeed, rnd, matAt, plot, shade, seg, path,
  ball, tint, poly, walk, inkEdges, stamps, drawGrossStamp, M_METAL, M_OTHER, GUM,
} from './grossKit';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The painting (once, a step at a time: grossKit's stamps)

const M_SKY = 0, M_PAINT = M_METAL, M_GRILLE = 11, M_POLE = 12, M_BIRD = 13, M_NEST = 14, M_WIRE = 15, M_GLOW = 16, M_RIM = 17, M_CAN = 18;

/** Cream enamel gone yellow, light .. deep, the line last. */
const PAINT = R('#F4EBD0', '#DCCFAA', '#BCAC84', '#988860', '#706044', '#463826', '#1E160E');
const RUST = R('#F2A866', '#D27A3A', '#AA5620', '#803A14', '#56220A', '#2C0E04');
const STEEL = R('#EEF2F6', '#C4CAD2', '#98A0AC', '#6E7682', '#4A505A', '#2A2E36', '#121418');
const POLE = R('#A8B0A0', '#869080', '#687262', '#4E5648', '#363C30', '#1C2018');
const PIGEON = R('#E6E8EE', '#C2C6D2', '#9CA0B2', '#767A8E', '#525468', '#2C2C3A');
const NECK_G = hexU('#5ED69A'), NECK_P = hexU('#B46ADC');
const TWIG = R('#D8B880', '#B08C58', '#86663A', '#5E4424', '#3A2814');
const SHIT = R('#FFFFFF', '#F2F0E6', '#DAD8C4', '#B4B49A', '#7E8466');
const TAPE = R('#E2E4E6', '#C2C4C8', '#9EA2A8', '#787C84', '#4E5258');
const CABLE = R('#4A4A52', '#34343C', '#24242A', '#141418', '#060608');
const GRIME = hexU('#2A1C10');
const SKY = ['#070A1E', '#0B0F2A', '#111436', '#171942', '#1E1C4A', '#272052', '#33265A', '#40295E'];

// The horn: its bell's mouth an ellipse, the throat (the grille) a little up and right of its middle (it's pointed a
// touch down and to his left), the shell going back to the driver can, bolted to the pole by a strap.
const BX = 108, BY = 104, RX = 92, RY = 80;
const GX = 116, GY = 98, GRX = 40, GRY = 36;
const CX = 226, CY = 92, CRX = 18, CRY = 24;
const PX0 = 234, PX1 = 254;
/** The lamp on the pole above it (a caged floodlight): the warm light on the top of it all. */
const LX = 244, LY = 14;
/** The pigeon, on the can. */
const PGX = 222, PGY = 52;

const ell = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);

function* paintPA(): Steps<Buf> {
  setSeed(9371);
  const b = newBuf();
  // The night sky: banded, dithered at the seams, stars, the moon (low left), the park's glow at the bottom
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const f = (y / GH) * (SKY.length - 1) + (bay(x, y) - 0.5) * 0.9;
    b.px[y * GW + x] = hexU(SKY[Math.max(0, Math.min(SKY.length - 1, Math.round(f)))]);
  }
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(hash2(i, 7) * GW), y = Math.floor(hash2(i, 13) ** 1.4 * GH * 0.8);
    plot(b, x, y, hexU(hash2(i, 3) > 0.8 ? '#FFE9C4' : hash2(i, 5) > 0.8 ? '#C8DAFF' : '#F4F6FF'));
    if (hash2(i, 17) > 0.9) { plot(b, x - 1, y, hexU('#6A70A0')); plot(b, x + 1, y, hexU('#6A70A0')); plot(b, x, y - 1, hexU('#6A70A0')); plot(b, x, y + 1, hexU('#6A70A0')); }
  }
  // (the moon: a stepped glow, the disc, its maria, the dark side's bite)
  for (let r = 3; r >= 1; r--) tint(b, 34, 26, 11 + r * 5, 11 + r * 5, hexU('#9AA6E0'), 0.07 * (4 - r), M_SKY, 0.1);
  ball(b, 34, 26, 11, 11, R('#FAFAFF', '#E6E8F4', '#CACEE2', '#ACB0CA', '#8C90AE'), { mat: M_GLOW });
  for (const [x, y, r] of [[37, 23, 3], [30, 29, 3.5], [38, 30, 2]]) tint(b, x, y, r, r, hexU('#9CA0BE'), 0.5, M_GLOW, 0.3);
  // (the park, far off under it: a skyline, a Ferris wheel's lights, the glow off it all)
  for (let y = 150; y < GH; y++) for (let x = 0; x < GW; x++) shade(b, x, y, hexU('#6A3A6A'), Math.min(0.45, (y - 150) / 120) * (bay(x, y) < 0.7 ? 1 : 0.6), M_SKY);
  const sky = (x: number) => 172 + Math.round(Math.sin(x * 0.11) * 3 + (hash2(Math.floor(x / 9), 1) * 12) - (x > 196 && x < 214 ? 18 : 0));
  for (let x = 0; x < GW; x++) for (let y = sky(x); y < GH; y++) plot(b, x, y, hexU(y - sky(x) < 1 ? '#3A2A50' : '#120E22'));
  for (let i = 0; i < 40; i++) { const x = Math.floor(hash2(i, 41) * GW), y = sky(x) + 3 + Math.floor(hash2(i, 43) * 20); if (y < GH) plot(b, x, y, hexU(hash2(i, 45) > 0.5 ? '#FFD27A' : '#FF9EC8')); }
  for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2; plot(b, 262 + Math.cos(a) * 26, 166 + Math.sin(a) * 26, hexU(['#FF6A8A', '#FFE07A', '#7AE0FF'][k % 3])); }
  yield;

  // The pole (a park lamp post: green paint gone chalky, banded down it) and its lamp
  for (let y = 0; y < GH; y++) for (let x = PX0; x <= PX1; x++) {
    const u = (x - PX0) / (PX1 - PX0), lv = 1 - Math.abs(u - 0.32) * 1.5;
    const k = x === PX0 || x === PX1 ? 5 : Math.max(0, Math.min(4, Math.round((1 - lv) * 4.4 + (bay(x, y) - 0.5) * 0.9)));
    plot(b, x, y, POLE[k], M_POLE);
  }
  for (const y of [40, 41, 128, 129]) for (let x = PX0; x <= PX1; x++) plot(b, x, y, POLE[y % 2 ? 2 : 5], M_POLE);
  // (chipped down to the primer, here and there)
  for (let i = 0; i < 30; i++) { const x = PX0 + 2 + Math.floor(rnd() * (PX1 - PX0 - 3)), y = Math.floor(rnd() * GH); tint(b, x, y, 1 + rnd() * 2, 1 + rnd() * 3, hexU('#8A4A2A'), 0.7, M_POLE, 0.2); }
  // (the lamp: an arm, a caged hood, the bulb lit, a stepped bloom round it)
  seg(b, PX0, LY + 4, LX - 14, LY + 4, POLE[4], 3, M_POLE);
  poly(b, [LX - 26, LY - 2, LX - 6, LY - 2, LX - 2, LY + 10, LX - 30, LY + 10], STEEL, M_CAN);
  for (let r = 4; r >= 1; r--) tint(b, LX - 16, LY + 14, 10 + r * 7, 6 + r * 6, hexU('#FFD98A'), 0.08 * (5 - r), undefined, 0.15);
  ball(b, LX - 16, LY + 12, 9, 4, R('#FFFFFF', '#FFF6D0', '#FFE08A', '#F2B44A', '#B07020'), { mat: M_GLOW });
  for (let x = LX - 28; x <= LX - 4; x += 4) seg(b, x, LY + 10, x + (x < LX - 16 ? 1 : -1), LY + 17, STEEL[5], 1);
  yield;

  // The shell, going back from the bell to the driver can, and the can (and its strap round the pole)
  poly(b, [178, 34, CX - 6, CY - CRY + 2, CX + 4, CY + CRY - 2, 192, 168], PAINT.slice(2), M_PAINT, { tilt: -0.3 });
  ball(b, CX, CY, CRX, CRY, STEEL, { mat: M_CAN, line: true, lw: 1.4, flat: 0.8 });
  for (let k = 0; k < 5; k++) seg(b, CX - CRX + 3, CY - 14 + k * 7, CX + CRX - 3, CY - 14 + k * 7, STEEL[4], 1, undefined, M_CAN);
  // (its label, unreadable now)
  poly(b, [CX - 9, CY - 4, CX + 7, CY - 4, CX + 7, CY + 6, CX - 9, CY + 6], R('#D8D2B8', '#BCB494', '#9E9670', '#6E6646'), M_CAN);
  for (let k = 0; k < 3; k++) seg(b, CX - 7, CY - 1 + k * 3, CX + 2 + k, CY - 1 + k * 3, hexU('#5A5440'), 1);
  for (let y = CY - 5; y <= CY + 5; y++) for (let x = CX - 4; x <= PX1 + 2; x++) {
    const k = y === CY - 5 || y === CY + 5 ? 5 : y < CY - 2 ? 1 : y < CY + 2 ? 2 : 3;
    plot(b, x, y, hash2(x, y) < 0.3 ? RUST[k] : STEEL[k], M_CAN);
  }
  for (const x of [CX + 4, PX1 - 2]) { ball(b, x, CY, 3, 3, STEEL, { mat: M_CAN, line: true, lw: 1 }); walk(x, CY + 3, Math.PI / 2, 22 + rnd() * 18, 0.25, (x2, y2) => { shade(b, x2, y2, RUST[2], 0.6); }); }
  yield;

  // The bell: the rolled lip, the spun cone inside it (lit low right, where it faces the moon; going dark down the
  // throat), spun rings stepped across it
  const [lx, ly, lz] = [-0.42, -0.5, 0.76];
  for (let y = Math.floor(BY - RY); y <= BY + RY; y++) for (let x = Math.floor(BX - RX); x <= BX + RX; x++) {
    const d = ell(x, y, BX, BY, RX, RY);
    if (d > 1 || y < 0 || y >= GH) continue;
    const dx = (x + 0.5 - BX) / RX / Math.max(0.01, d), dy = (y + 0.5 - BY) / RY / Math.max(0.01, d);
    const i = y * GW + x, n = PAINT.length - 2;
    if (d > 0.88) {
      const t = (d - 0.88) / 0.12;
      if (t > 0.86) { b.px[i] = PAINT[n + 1]; b.mat[i] = M_RIM; continue; }
      const nx = dx * (2 * t - 1) * 0.9, ny = dy * (2 * t - 1) * 0.9, nz = Math.sin(Math.PI * t);
      const lv = Math.max(0, (lx * nx + ly * ny + lz * nz) / (Math.hypot(nx, ny, nz) || 1));
      const k = Math.max(0, Math.min(n, Math.round((1 - lv) * n * 1.05 - 0.4 + (bay(x, y) - 0.5) * 0.9)));
      b.px[i] = PAINT[k]; b.mat[i] = M_RIM; b.tone[i] = Math.round((k / n) * 254);
      continue;
    }
    const face = Math.max(0, (dx * 0.55 + dy * 0.65)) * 0.55 + 0.25;
    const deep = 0.5 + 0.5 * Math.max(0, Math.min(1, (d - 0.42) / 0.46));
    const ring = Math.floor(d * 46) % 3 === 0 ? 0.35 : 0;
    const s = (1 - face * deep * 1.5) * n + ring - 0.2 + (bay(x, y) - 0.5) * 0.9;
    const k = Math.max(0, Math.min(n, Math.round(s)));
    b.px[i] = PAINT[k]; b.mat[i] = M_PAINT; b.tone[i] = Math.round((k / n) * 254);
  }
  // (where the lip rolls over: a seam, grime packed in it)
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const d = ell(x, y, BX, BY, RX, RY);
    if (Math.abs(d - 0.885) < 0.012 && matAt(b, x, y) !== M_SKY) plot(b, x, y, bay(x, y) < 0.6 ? GRIME : PAINT[5]);
  }
  yield;

  // The grille: a flange ring bolted round it, the perforated dome inside (each hole a dark pit, its far rim lit),
  // a phase plug in the middle
  for (let y = GY - GRY; y <= GY + GRY; y++) for (let x = GX - GRX; x <= GX + GRX; x++) {
    const d = ell(x, y, GX, GY, GRX, GRY);
    if (d > 1) continue;
    const i = y * GW + x;
    if (d > 0.86) {
      const t = (d - 0.86) / 0.14, up = ((y + 0.5 - GY) / GRY) * (2 * t - 1);
      const k = t > 0.85 || t < 0.12 ? 6 : Math.max(0, Math.min(5, Math.round(2 + up * 2.4 + (bay(x, y) - 0.5) * 0.9)));
      b.px[i] = STEEL[k]; b.mat[i] = M_GRILLE;
      continue;
    }
    const dx = (x + 0.5 - GX) / GRX, dy = (y + 0.5 - GY) / GRY, nz = Math.sqrt(Math.max(0, 1 - d * d)) * 0.6;
    const lv = Math.max(0, (lx * dx + ly * dy + lz * nz) / (Math.hypot(dx, dy, nz) || 1));
    let k = Math.max(1, Math.min(5, Math.round((1 - lv) * 5 + 0.3 + (bay(x, y) - 0.5) * 0.9)));
    // (the holes: a hex grid of pits)
    const row = Math.floor(y / 4), hx = (x + (row % 2) * 2) % 4, hy = y % 4;
    if (hx < 2 && hy < 2) k = 6;
    else if (hx === 2 && hy < 2) k = Math.max(0, k - 2);
    b.px[i] = STEEL[k]; b.mat[i] = M_GRILLE;
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2, x = GX + Math.cos(a) * GRX * 0.93, y = GY + Math.sin(a) * GRY * 0.93;
    ball(b, x, y, 2.6, 2.4, STEEL, { mat: M_GRILLE, line: true, lw: 0.8 });
    // (each bolt weeping rust down the bell)
    walk(x, y + 2, Math.PI / 2 + (rnd() - 0.5) * 0.2, 8 + rnd() * 26, 0.2, (x2, y2, j) => { if (matAt(b, x2, y2) === M_SKY) return false; plot(b, x2, y2, RUST[j < 4 ? 2 : j < 12 ? 3 : 4]); if (j < 6) plot(b, x2 + 1, y2, RUST[3]); });
  }
  ball(b, GX - 1, GY - 1, 9, 8, STEEL, { mat: M_GRILLE, line: true, lw: 1 });
  yield;

  // The weather on it: rust blooms (an orange crust round a dark pitted core), the paint flaking off in curls down to
  // bare steel, streaks run down off the lip, grime in every seam
  const paintMat = (m: number) => m === M_PAINT || m === M_RIM;
  for (let s = 0; s < 22; s++) {
    let x = 0, y = 0;
    for (let tries = 0; tries < 20; tries++) { x = 20 + rnd() * 180; y = 30 + rnd() * 150; if (paintMat(matAt(b, x, y))) break; }
    const r = 3 + rnd() * 8, ry2 = r * (0.6 + rnd() * 0.6);
    for (let yy = Math.floor(y - ry2 - 3); yy <= y + ry2 + 3; yy++) for (let xx = Math.floor(x - r - 3); xx <= x + r + 3; xx++) {
      if (!paintMat(matAt(b, xx, yy))) continue;
      const d = ell(xx, yy, x, y, r, ry2) + (hash2(xx * 3, yy * 7) - 0.5) * 0.5;
      const i = yy * GW + xx, tone = b.tone[i] / 254;
      if (d < 0.55) b.px[i] = RUST[Math.min(5, 3 + Math.round(tone * 2 + (hash2(xx, yy) > 0.8 ? 1 : 0)))];
      else if (d < 1) b.px[i] = RUST[Math.min(5, Math.round(tone * 3 + (bay(xx, yy) - 0.5)))];
      else if (d < 1.25 && hash2(xx + 5, yy) > 0.55) b.px[i] = mixU(b.px[i], RUST[1], 0.5);
    }
    if (rnd() < 0.7) walk(x, y + ry2, Math.PI / 2, 10 + rnd() * 30, 0.15, (x2, y2, j) => { if (!paintMat(matAt(b, x2, y2))) return false; shade(b, x2, y2, RUST[3], j < 8 ? 0.65 : 0.4); });
  }
  yield;
  for (let s = 0; s < 11; s++) {
    let x = 0, y = 0;
    for (let tries = 0; tries < 20; tries++) { x = 20 + rnd() * 200; y = 26 + rnd() * 150; if (paintMat(matAt(b, x, y))) break; }
    const r = 3 + rnd() * 6, ry2 = r * (0.5 + rnd() * 0.7);
    const inside = (xx: number, yy: number) => ell(xx, yy, x, y, r, ry2) + (hash2(Math.floor(xx / 2) * 5, Math.floor(yy / 2) * 11) - 0.5) * 0.3 < 1;
    for (let yy = Math.floor(y - ry2 - 2); yy <= y + ry2 + 2; yy++) for (let xx = Math.floor(x - r - 2); xx <= x + r + 2; xx++) {
      if (!paintMat(matAt(b, xx, yy)) || !inside(xx, yy)) continue;
      const i = yy * GW + xx, k = Math.min(5, Math.round((b.tone[i] / 254) * 4 + (bay(xx, yy) - 0.5)));
      b.px[i] = hash2(xx, yy * 3) > 0.82 ? RUST[3] : STEEL[Math.min(5, k + 1)];
      // (the paint's edge: curled up and lit on the near side, its shadow on the far)
      if (!inside(xx - 1, yy - 1)) plot(b, xx - 1, yy - 1, PAINT[0]);
      else if (!inside(xx + 1, yy + 1)) b.px[i] = PAINT[6];
    }
  }
  // (grime: the seams round the grille, the shell's join, the can's strap, settled in the bell's bottom)
  inkEdges(b, M_GRILLE, GRIME, [M_SKY]);
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const m = matAt(b, x, y);
    if (m === M_PAINT && ell(x, y, GX, GY, GRX, GRY) < 1.12 && hash2(x, y) < 0.5) shade(b, x, y, GRIME, 0.55);
    if (m === M_PAINT && y > BY + 20 && hash2(x * 7, y) < ((y - BY - 20) / 60) * 0.35) shade(b, x, y, GRIME, 0.45);
  }
  yield;

  // Pigeon shit: down off the pigeon over the can and the shell; splats crusted on the lip, run down the bell
  const splat = (x: number, y: number, r: number, run: number) => {
    ball(b, x, y, r, r * 0.7, SHIT, { mat: M_OTHER, line: (dx, dy) => dy > 0.3, lw: 0.8, flat: 0.5 });
    tint(b, x + r * 0.2, y + r * 0.1, r * 0.4, r * 0.3, hexU('#5E6A3E'), 0.7, M_OTHER, 0.3);
    if (run > 0) walk(x, y + r * 0.5, Math.PI / 2, run, 0.18, (x2, y2, j) => { if (matAt(b, x2, y2) === M_SKY) return false; plot(b, x2, y2, SHIT[j < run * 0.6 ? 1 : 2], M_OTHER); if (j < run * 0.4) plot(b, x2 + 1, y2, SHIT[2], M_OTHER); if (j === Math.floor(run) - 1) ball(b, x2, y2 + 1, 1.6, 1.8, SHIT); });
  };
  for (const [x, y, r, run] of [[204, 70, 3, 26], [212, 74, 2.5, 34], [198, 64, 2, 14], [214, 112, 2, 12], [88, 26, 4, 30], [118, 25, 3, 22], [60, 38, 3.5, 40], [140, 30, 2.5, 18], [100, 30, 2, 0], [168, 46, 3, 24], [228, 70, 2.5, 30]] as const) splat(x, y, r, run);
  for (let i = 0; i < 30; i++) { const x = 190 + rnd() * 50, y = 60 + rnd() * 60; if (matAt(b, x, y) !== M_SKY) plot(b, x, y, SHIT[rnd() < 0.5 ? 1 : 3]); }
  yield;

  // In the grille: chewed gum (pressed in, a strand pulled off it), dead bugs, a cobweb across its top left with a
  // moth in it
  const gum = (x: number, y: number, r: number, col = GUM) => {
    ball(b, x, y, r, r * 0.8, col, { mat: M_OTHER, line: true, lw: 0.8, flat: 0.6 });
    for (let k = 0; k < 3; k++) plot(b, x - r * 0.3 + k, y - r * 0.3 + (k % 2), col[4]);
    plot(b, x - r * 0.45, y - r * 0.4, WHITE);
  };
  gum(GX + 14, GY + 12, 5); gum(GX - 20, GY + 18, 3.5, R('#C4F0D8', '#98DCB6', '#6EC094', '#4A9A70', '#2E7050', '#103020'));
  gum(GX + 6, GY - 22, 3, R('#F0F0E0', '#D8D8C4', '#B8B8A0', '#909078', '#686850', '#303020'));
  gum(60, 140, 4); path(b, [GX + 18, GY + 14, GX + 24, GY + 22, GX + 26, GY + 30], GUM[2], 1);
  const bug = (x: number, y: number, a: number, moth = false) => {
    const ca = Math.cos(a), sa = Math.sin(a);
    if (moth) { for (const s of [-1, 1]) poly(b, [x, y, x + (ca * 2 - sa * 6 * s), y + (sa * 2 + ca * 6 * s), x + (-ca * 4 - sa * 5 * s), y + (-sa * 4 + ca * 5 * s)], R('#D8CCB0', '#B8A888', '#988866', '#6A5C44'), M_OTHER); }
    else for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) seg(b, x + ca * k * 1.5, y + sa * k * 1.5, x + ca * k * 2.5 - sa * 3.5 * s, y + sa * k * 2.5 + ca * 3.5 * s, hexU('#1A1410'), 1);
    ball(b, x, y, 2.2, 1.6, R('#6A5A4A', '#4A3C30', '#2E241C', '#1A1410', '#0A0806'), { mat: M_OTHER });
    plot(b, x + ca * 2.4, y + sa * 2.4, hexU('#0A0806'));
    if (!moth) { plot(b, x - sa, y + ca, hexU('#9AB0C8')); plot(b, x - sa * 2, y + ca * 2, hexU('#7A90A8')); }
  };
  for (const [x, y, a] of [[GX - 8, GY + 8, 0.4], [GX + 20, GY - 6, 2.2], [GX - 24, GY - 4, 1.1], [GX + 2, GY + 24, -0.6], [GX - 12, GY - 18, 2.9], [150, 150, 0.8], [52, 92, 1.9]] as const) bug(x, y, a);
  const WX = 50, WY = 52;
  const spokes = [-0.15, 0.25, 0.65, 1.05, 1.45, 1.75];
  const web = hexU('#DCE2F0'), web2 = hexU('#9AA2BA');
  for (const a of spokes) for (let r = 0; r < 62; r++) { const x = WX + Math.cos(a) * r, y = WY + Math.sin(a) * r; if (bay(Math.round(x), Math.round(y)) < 0.75) plot(b, x, y, r < 40 ? web : web2); }
  for (let ring = 10; ring < 60; ring += 7 + (ring % 3)) for (let s = 0; s < spokes.length - 1; s++) {
    const a0 = spokes[s], a1 = spokes[s + 1], sag = ring * 0.08;
    for (let k = 0; k <= 12; k++) {
      const u = k / 12, a = a0 + (a1 - a0) * u, r = ring - Math.sin(u * Math.PI) * sag;
      if ((k + ring) % 2 === 0 || bay(k, ring) < 0.6) plot(b, WX + Math.cos(a) * r, WY + Math.sin(a) * r, ring < 36 ? web : web2);
    }
  }
  bug(WX + 24, WY + 22, 0.9, true);
  yield;

  // The nest: wedged in where the shell meets the lip, twigs out every way, a bit of litter (a straw, a ticket stub)
  for (let k = 0; k < 70; k++) {
    const x = 186 + rnd() * 30, y = 30 + rnd() * 14 + (Math.abs(x - 200) / 15) * 4, a = (rnd() - 0.5) * 1.4 + (rnd() < 0.5 ? 0 : Math.PI), l = 4 + rnd() * 10;
    seg(b, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, TWIG[Math.floor(rnd() * 4)], 1, M_NEST);
  }
  seg(b, 196, 30, 214, 22, hexU('#F2F2F2'), 2, M_NEST); seg(b, 197, 31, 213, 23, hexU('#E04848'), 1, M_NEST);
  poly(b, [188, 38, 198, 36, 199, 41, 189, 43], R('#FFF0B0', '#F2D27A', '#D2AA4A', '#8A6A20'), M_NEST);
  yield;

  // The pigeon, on the can: a fat grey one, its neck gone green and purple, an orange eye, its cere white, pink feet
  const bird = PIGEON;
  poly(b, [PGX - 22, PGY + 4, PGX - 8, PGY - 2, PGX - 6, PGY + 8, PGX - 24, PGY + 10], bird, M_BIRD);
  ball(b, PGX, PGY, 15, 11, bird, { mat: M_BIRD, line: true, lw: 1 });
  for (const yy of [PGY - 1, PGY + 3]) seg(b, PGX - 12, yy, PGX + 2, yy + 2, bird[5], 2, undefined, M_BIRD);
  ball(b, PGX + 8, PGY - 9, 7, 8, bird, { mat: M_BIRD, line: true, lw: 1 });
  for (let y = PGY - 6; y < PGY + 2; y++) for (let x = PGX + 1; x < PGX + 16; x++) if (matAt(b, x, y) === M_BIRD && b.px[y * GW + x] !== bird[5]) shade(b, x, y, (x + y) % 5 < 2 ? NECK_P : NECK_G, 0.45);
  ball(b, PGX + 11, PGY - 17, 6, 6, bird, { mat: M_BIRD, line: true, lw: 1 });
  ball(b, PGX + 13, PGY - 18, 2.4, 2.4, R('#FFE07A', '#FFB030', '#E07A10', '#A04808', '#200800'), { line: true, lw: 0.6 });
  plot(b, PGX + 13, PGY - 18, hexU('#000000')); plot(b, PGX + 12, PGY - 19, WHITE);
  poly(b, [PGX + 16, PGY - 17, PGX + 21, PGY - 15, PGX + 16, PGY - 14], R('#5A4A4A', '#3A2E2E', '#2A2020', '#140C0C'), M_BIRD);
  plot(b, PGX + 16, PGY - 18, WHITE); plot(b, PGX + 17, PGY - 18, hexU('#E8E8E8'));
  for (const fx of [PGX - 3, PGX + 4]) { seg(b, fx, PGY + 10, fx, PGY + 13, hexU('#E07A8A'), 1, M_BIRD); seg(b, fx - 2, PGY + 13, fx + 2, PGY + 13, hexU('#C05A6A'), 1, M_BIRD); }
  yield;

  // The wire: out of the can's back and down the pole, taped (badly) where it split, the copper out through the tape
  path(b, [CX + 8, CY + CRY - 4, CX + 12, CY + CRY + 10, PX0 + 6, 140, PX0 + 7, GH], CABLE[4], 5, M_WIRE);
  path(b, [CX + 8, CY + CRY - 4, CX + 12, CY + CRY + 10, PX0 + 6, 140, PX0 + 7, GH], CABLE[1], 3, M_WIRE);
  path(b, [CX + 7, CY + CRY - 4, CX + 11, CY + CRY + 10, PX0 + 5, 140, PX0 + 6, GH], CABLE[0], 1, M_WIRE);
  for (let y = 140; y < 156; y++) for (let x = PX0 + 1; x < PX0 + 13; x++) {
    if (y > 152 && hash2(x, 9) > 0.5) continue;
    const k = x === PX0 + 1 || x === PX0 + 12 ? 4 : (y - 140) % 4 === 0 ? 3 : x < PX0 + 5 ? 0 : x < PX0 + 9 ? 1 : 2;
    plot(b, x, y, TAPE[k], M_WIRE);
  }
  for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + (rnd() - 0.5) * 2.4, l = 3 + rnd() * 6; seg(b, PX0 + 6, 160, PX0 + 6 + Math.cos(a) * l, 160 + Math.sin(a) * l, hexU(k % 3 === 0 ? '#FFD07A' : k % 3 === 1 ? '#E08A3A' : '#B05A1A'), 1, M_WIRE); }
  seg(b, PX0 + 4, 158, PX0 + 1, 166, hexU('#D83030'), 1, M_WIRE); seg(b, PX0 + 8, 158, PX0 + 11, 165, hexU('#F0F0F0'), 1, M_WIRE);
  yield;

  // The night on it: a cool moonlit grade over everything that isn't sky or lit, the lamp's warm pool on its top, in
  // four stepped bands (dithered at the seams)
  const COOL = hexU('#7680B6'), WARM = hexU('#FFDCA8');
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    const i = y * GW + x, m = b.mat[i];
    if (m === M_SKY || m === M_GLOW) continue;
    const w = Math.max(0, 1 - Math.hypot(x - (LX - 16), (y - LY - 10) * 1.3) / 170);
    const step = Math.max(0, Math.min(4, Math.floor(w * 5 + (bay(x, y) - 0.5) * 0.8))) / 4;
    const g = mixU(COOL, WARM, step);
    const p = b.px[i];
    const ch = (s: number) => Math.round((((p >>> s) & 255) * ((g >>> s) & 255)) / 255);
    b.px[i] = ((255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
  }
  return b;
}

const pa = stamps<'pa'>(() => paintPA());
/** Paint it ahead, a slice per idle moment (the walk-away's on: it's due next). */
export const warmAlphaEnd = () => pa.warm();

// ---------------------------------------------------------------------------------------------------------------
// The cutscene

interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string }
interface Fleck { x: number; y: number; vx: number; vy: number; life: number; dust: boolean }
export interface AlphaEnd {
  t: number;
  /** 'pa' the announcement; 'end' THE END? (from `endAt`); 'out' fading off to the title (from `outAt`). */
  phase: 'pa' | 'end' | 'out';
  line: number; said: string | null; nextAt: number;
  endAt: number; outAt: number;
  armed: boolean;
  sparks: Spark[]; flecks: Fleck[];
  onDone: () => void;
}

/** Off to the title (as the pause menu's quit does: the file's time put on it, the page fresh). */
const toTitle = () => { closeFile(); location.reload(); };

/** How long THE END? is up before a button takes it (two seconds and a bit). */
const INPUT_AFTER = 140;

// Any key, any pad button (read here: the game's own controls only know its own buttons)
let anyKey = false, keysOn = false;
const onKey = (e: KeyboardEvent) => { anyKey = e.type === 'keydown'; };
const listen = (on: boolean) => {
  if (typeof window === 'undefined' || on === keysOn) return;
  keysOn = on; anyKey = false;
  if (on) { window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey); }
  else { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); }
};
const anyPad = () => { try { return (navigator.getGamepads?.() ?? []).some(p => p && p.buttons.some(b => b.pressed)); } catch { return false; } };

export const startAlphaEnd = (onDone: () => void = toTitle): AlphaEnd => {
  // (seen: onto the file now, so quitting part way doesn't bring it back; quitting before it starts does, on CONTINUE)
  setAlphaEndSeen(true); saveProgress();
  listen(true);
  pa.warm();
  return { t: 0, phase: 'pa', line: -1, said: null, nextAt: 50, endAt: 0, outAt: 0, armed: false, sparks: [], flecks: [], onDone };
};

const sayLine = (a: AlphaEnd, i: number) => {
  a.line = i; a.nextAt = Infinity;
  const text = PA_ALPHA_END[i];
  let over = false;
  const done = () => { if (over) return; over = true; a.said = null; if (a.phase === 'pa') a.nextAt = a.t + 24; };
  const shown = say(text, PA_VOICE, i === 0 ? 'urgent' : 'queue', {
    always: true,
    // (not recorded: up its usual while, then on)
    onShow: spoken => { if (a.phase === 'pa') a.said = text; if (!spoken) setTimeout(done, Math.max(2200, text.length * 75)); },
    onHide: done,
    onDropped: done,
  });
  if (!shown) a.nextAt = a.t + 1;
};

const toEnd = (a: AlphaEnd) => { a.phase = 'end'; a.endAt = a.t; a.said = null; cutVoice('m2.pa'); playSound('menuok', 0.6); };

export const tickAlphaEnd = (a: AlphaEnd, controls?: Controls | null, padA = false) => {
  a.t++;
  musicMoment('alphaend', a.phase === 'pa' ? 'pa' : 'end');
  offerSkip();
  const skip = takeSkip();
  if (a.phase === 'pa') {
    if (skip && a.t > 20) { toEnd(a); return; }
    // (the voice pack in first (a page that's only just loaded: it's still coming), ten seconds at most)
    if (a.t >= a.nextAt && (a.line >= 0 || voicesLoaded() || a.t > 600)) { if (a.line + 1 < PA_ALPHA_END.length) sayLine(a, a.line + 1); else toEnd(a); }
    // (the grille spitting as he talks: dust off it, and spit)
    if (a.said && Math.random() < 0.6) {
      const ang = Math.random() * Math.PI * 2, r = Math.random() * 30;
      a.flecks.push({ x: GX + Math.cos(ang) * r, y: GY + Math.sin(ang) * r * 0.9, vx: Math.cos(ang) * (0.4 + Math.random()), vy: Math.sin(ang) * (0.4 + Math.random()) - 0.3, life: 0, dust: Math.random() < 0.6 });
    }
  }
  a.flecks = a.flecks.filter(f => { f.life++; f.x += f.vx; f.y += f.vy; f.vy += f.dust ? 0.01 : 0.06; return f.life < 50; });
  if (a.phase !== 'pa') {
    // (fireworks: a shell bursting every so often, its sparks falling and fading)
    const u = a.t - a.endAt;
    if (a.phase === 'end' && (u === 4 || u % 46 === 20 || (u > 60 && Math.random() < 0.015))) {
      const x = 80 + Math.random() * (W - 160), y = 70 + Math.random() * 170, col = ['#FF5A7A', '#FFE066', '#6AE0FF', '#A8FF7A', '#FFFFFF', '#FF9A3A'][Math.floor(Math.random() * 6)];
      for (let k = 0; k < 44; k++) { const ang = (k / 44) * Math.PI * 2, s = 2 + Math.random() * 2.4; a.sparks.push({ x, y, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, life: 0, max: 50 + Math.random() * 30, col }); }
      playSound('boom', 0.16, 6 + Math.random() * 4);
    }
    a.sparks = a.sparks.filter(s => { s.life++; s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy = s.vy * 0.96 + 0.05; return s.life < s.max; });
  }
  if (a.phase === 'end') {
    const press = anyKey || anyPad() || padA || !!skip || !!(controls && (controls.jump || controls.shoot || controls.special));
    if (!press) a.armed = true;
    else if (a.armed && a.t - a.endAt > INPUT_AFTER) { a.phase = 'out'; a.outAt = a.t; playSound('menuok', 0.8); }
  }
  if (a.phase === 'out' && a.t - a.outAt >= 40) { listen(false); a.phase = 'out'; a.outAt = Infinity; a.onDone(); }
};

// ---- THE END? in marquee bulbs: each dot of the letters a bulb in a gold plate cell, chasing
const CELL = 15;
const ENDTXT = 'THE END?';
const endCells = (() => {
  const out: { x: number; y: number; i: number }[] = [];
  let x = 0, n = 0;
  for (const ch of ENDTXT) {
    if (ch === ' ') { x += 3; continue; }
    const g = glyphDots(ch);
    for (const [c, r] of g.on) out.push({ x: x + c, y: r, i: n++ });
    x += g.w + 1;
  }
  return { cells: out, w: x - 1 };
})();
let plateCv: HTMLCanvasElement | null = null;
/** The letters' plates (painted once): inked, a drop shadow, banded gold, a lit top lip on each cell. */
const plates = () => {
  if (plateCv) return plateCv;
  const pw = endCells.w * CELL + 16, ph = 7 * CELL + 16;
  const cv = canvas(pw, ph), g = cv.getContext('2d')!;
  const at = (c: { x: number; y: number }) => [8 + c.x * CELL, 8 + c.y * CELL] as const;
  g.fillStyle = '#000000'; for (const c of endCells.cells) { const [x, y] = at(c); g.fillRect(x + 4, y + 5, CELL, CELL); }
  g.fillStyle = '#2A0A04'; for (const c of endCells.cells) { const [x, y] = at(c); g.fillRect(x - 3, y - 3, CELL + 6, CELL + 6); }
  const bands = ['#FFE27A', '#F6C443', '#E0A12A', '#C07E18', '#94580C'];
  for (const c of endCells.cells) {
    const [x, y] = at(c);
    for (let k = 0; k < 5; k++) { g.fillStyle = bands[Math.min(4, Math.floor((c.y * CELL + k * 3) / (7 * CELL) * 5 + k * 0.2))]; g.fillRect(x, y + k * 3, CELL, 3); }
    g.fillStyle = '#FFF4C0'; g.fillRect(x, y, CELL, 1);
    g.fillStyle = '#6A3A06'; g.fillRect(x, y + CELL - 1, CELL, 1);
  }
  plateCv = cv;
  return cv;
};

const wrap = (c: Ctx, text: string, maxW: number) => {
  const words = text.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const next = cur ? `${cur} ${w}` : w; if (c.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next; }
  if (cur) lines.push(cur);
  return lines;
};

const SUB_Y = 516;

export const drawAlphaEnd = (c: Ctx, a: AlphaEnd) => {
  if (typeof document === 'undefined') return;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.scale(c.canvas.width / W, c.canvas.height / H);
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#05030A'; c.fillRect(0, 0, W, H);
  const img = pa.ready('pa') || a.t > 8 ? pa('pa').img : null;
  const talking = !!a.said;
  drawGrossStamp(c, img, W / 2, (SUB_Y) / 2 + 8, GW / 2, GH / 2 - 4, 1, a.t, talking && a.t % 3 === 0 ? 2 : 0, box => {
    // (the can's light, blinking red; the moths round the lamp; the pigeon blinking)
    if (Math.floor(a.t / 30) % 2 === 0) { box(CX + 12, CY - 14, 2, 2, '#FF3030'); box(CX + 11, CY - 15, 4, 4, 'rgba(255,60,60,0.25)'); }
    for (let k = 0; k < 3; k++) { const ang = a.t * (0.07 + k * 0.03) + k * 2; box(LX - 16 + Math.cos(ang) * (10 + k * 4), LY + 20 + Math.sin(ang * 1.3) * (5 + k * 2), 1, 1, '#2A2020'); }
    if (a.t % 170 < 6) box(PGX + 11, PGY - 20, 5, 4, '#9CA0B2');
    // (talking: the grille's middle buzzing, the dust and spit off it)
    if (talking) for (let k = 0; k < 6; k++) { const ang = Math.random() * Math.PI * 2, r = Math.random() * 28; box(GX + Math.cos(ang) * r, GY + Math.sin(ang) * r * 0.9, 1, 1, 'rgba(230,220,200,0.5)'); }
    for (const f of a.flecks) { const s = f.dust ? 1 : 1 + Math.floor(f.life / 18); box(f.x, f.y, s, s, f.dust ? 'rgba(190,170,140,0.7)' : 'rgba(236,240,226,0.85)'); }
  });
  // The bar under it, and what he's saying in it (only while it's said: wrapped to fit, nothing off the edge)
  bar(c, SUB_Y, H - SUB_Y, SUB_Y);
  if (a.said) {
    c.font = font(14); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const lines = wrap(c, a.said, W - 64);
    const y0 = SUB_Y + 42 - (lines.length - 1) * 12;
    lines.forEach((l, i) => { c.fillStyle = '#000000'; c.fillText(l, W / 2 + 2, y0 + i * 24 + 2); c.fillStyle = '#FDE68A'; c.fillText(l, W / 2, y0 + i * 24); });
  }
  if (a.phase !== 'pa') {
    const u = a.t - a.endAt;
    // (the PA gone dark behind it, stepped)
    c.fillStyle = `rgba(4, 3, 14, ${Math.min(0.62, Math.floor(u / 4) * 0.08).toFixed(2)})`; c.fillRect(0, 0, W, SUB_Y);
    for (const s of a.sparks) {
      const k = 1 - s.life / s.max;
      c.globalAlpha = k > 0.3 ? 1 : (s.life % 4 < 2 ? k * 2.5 : 0);
      c.fillStyle = s.col; c.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
      if (k > 0.6) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(s.x) + 1, Math.round(s.y) + 1, 1, 1); }
    }
    c.globalAlpha = 1;
    // THE END?: punched in big, bouncing down to size
    if (u > 10) {
      const v = u - 10, pc = plates();
      const zoom = v < 14 ? 2.6 - 1.7 * (v / 14) : v < 22 ? 0.9 + 0.1 * Math.sin(((v - 14) / 8) * Math.PI) + 0.1 * ((v - 14) / 8) : 1;
      const cx = W / 2, cy = 236;
      c.save();
      c.translate(Math.round(cx), Math.round(cy)); c.scale(zoom, zoom);
      c.drawImage(pc, -pc.width / 2, -pc.height / 2);
      // (the bulbs, chasing: every third lit brighter in turn)
      for (const cell of endCells.cells) {
        const x = -pc.width / 2 + 8 + cell.x * CELL + CELL / 2, y = -pc.height / 2 + 8 + cell.y * CELL + CELL / 2;
        const on = (cell.i + Math.floor(a.t / 6)) % 3 !== 0;
        c.fillStyle = on ? 'rgba(255,240,170,0.35)' : 'rgba(0,0,0,0)'; c.fillRect(x - 6, y - 6, 12, 12);
        c.fillStyle = '#3A2006'; c.fillRect(x - 4, y - 4, 8, 8);
        c.fillStyle = on ? '#FFF7C2' : '#B08A3A'; c.fillRect(x - 3, y - 3, 6, 6);
        c.fillStyle = on ? '#FFFFFF' : '#D8B868'; c.fillRect(x - 2, y - 2, 2, 2);
      }
      c.restore();
    }
    // PRESS [A] (once it'll take it)
    if (a.phase === 'end' && u > INPUT_AFTER) {
      c.save();
      c.globalAlpha = Math.min(1, (u - INPUT_AFTER) / 15) * (0.75 + 0.25 * Math.sin(a.t * 0.12));
      c.font = font(10); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      const pad = inputDevice() === 'pad';
      const label = 'PRESS', tail = 'FOR THE MAIN MENU';
      c.font = font(7);
      const keyW = pad ? 22 : Math.max(30, c.measureText('SPACE').width + 10);
      c.font = font(10);
      const total = c.measureText(label).width + 10 + keyW + 10 + c.measureText(tail).width;
      let x = Math.round(W / 2 - total / 2);
      const y = SUB_Y + 52;
      c.fillStyle = '#F8FAFC'; c.fillText(label, x, y); x += c.measureText(label).width + 10;
      if (pad) drawPadFace(c, x + 11, y - 5, 11, 'A', padFamily());
      else {
        c.fillStyle = '#E4E4E7'; c.beginPath(); c.roundRect(x, y - 13, keyW, 17, 2); c.fill();
        c.strokeStyle = '#52525B'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#A1A1AA'; c.fillRect(x + 1, y + 1, keyW - 2, 2);
        c.font = font(7); c.fillStyle = '#18181B'; c.textAlign = 'center'; c.fillText('SPACE', x + keyW / 2, y - 1); c.textAlign = 'left'; c.font = font(10);
      }
      x += keyW + 10;
      c.fillStyle = '#F8FAFC'; c.fillText(tail, x, y);
      c.restore();
    }
  }
  // In from black, stepped; out to black, stepped
  const fadeIn = Math.max(0, 1 - Math.floor(a.t / 5) / 6);
  const fadeOut = a.phase === 'out' && Number.isFinite(a.outAt) ? Math.min(1, Math.floor((a.t - a.outAt) / 5) / 7) : a.phase === 'out' ? 1 : 0;
  const k = Math.max(fadeIn, fadeOut);
  if (k > 0) { c.fillStyle = `rgba(0,0,0,${k.toFixed(2)})`; c.fillRect(0, 0, W, H); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dev (and the cheats build): ?alphaend plays it alone over the page (round again after); ?alphaend=walk: the next
// walk-away ends in it

export const devAlphaEnd = () => {
  if (typeof document === 'undefined' || M2_PUBLIC) return;
  const q = new URLSearchParams(location.search);
  if (!q.has('alphaend')) return;
  if (q.get('alphaend') === 'walk') { setAlphaEndDue(true); return; }
  alphaEndOver(true);
};
/** It on its own, over the page (a file all-cleared that never saw it, on CONTINUE: App.tsx; or the dev ?alphaend,
 *  looping). */
export const alphaEndOver = (loop = false) => {
  const cv = canvas(W, H);
  Object.assign(cv.style, { position: 'fixed', inset: '0', margin: 'auto', zIndex: '9999', background: '#000', imageRendering: 'pixelated', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '4 / 3', width: 'min(100vw, 133.33vh)' });
  document.body.appendChild(cv);
  const c = cv.getContext('2d')!;
  const start = (): AlphaEnd => (loop ? startAlphaEnd(() => setTimeout(() => { cur = start(); }, 600)) : startAlphaEnd());
  let cur = start();
  (window as unknown as { __alphaEnd: () => AlphaEnd }).__alphaEnd = () => cur;
  const frame = () => { tickAlphaEnd(cur); drawAlphaEnd(c, cur); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
};
