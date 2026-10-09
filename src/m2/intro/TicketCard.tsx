// The ticket, up close, at the window (intro/index.ts): what Meathead slaps down on the counter. Painted pixel by pixel
// at half size and blown up 2x, like everything else, peak SNES: card stock in steps, an engraved guilloche border like
// money, Old Glory down the side, HAPPY LAND in fat banded letters with the park's star grinning over it, a holographic
// foil strip catching the light, a perforated stub with its barcode and its fine print. Shitty, it's the same ticket
// after a trip through his back pocket: soaked through brown in rings, smeared, lumpy (a kernel of corn), creased,
// a corner gone soggy and torn off, dripping, stinking (green lines coming off it), and flies. (Naked, there's no
// ticket to show: the window gets the punch instead, see punchCam.ts.)

import React, { useEffect, useRef } from 'react';

type Ctx = CanvasRenderingContext2D;
const W = 280, H = 176;
/** The ticket on the canvas, and where it's perforated. */
const X0 = 8, Y0 = 28, TW = 262, TH = 124, PERF = X0 + 196;
const INK = '#1A0B06';
const PAPER = ['#7d6e54', '#a8987a', '#cdbf9e', '#e6dcbc', '#f6eed6', '#fffbee'];
const PINK = ['#6e0c3a', '#a3155a', '#d42a7a', '#ec4899', '#f67cb8', '#fcc0dc'];
const GOLD = ['#5c3c00', '#8c6000', '#c08c00', '#e8b400', '#f8d440', '#fcf0a0'];
const RED = ['#5c0a0a', '#8e1414', '#b91c1c', '#d93a2e'];
const BLUE = ['#0b1236', '#14205c', '#1e3a8a', '#2d51b0', '#4570d0'];
const BROWN = ['#1e0f04', '#331a07', '#4a2a0c', '#643a12', '#7e4c1a', '#9a6326', '#b47e3a'];

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) % 2; xx < w; xx += 2) c.fillRect(x + xx, y + yy, 1, 1);
};

// A 3x5 pixel font for the fine print
const F: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101110100110101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110',
  '.': '000000000000010', ',': '000000000010100', '-': '000000111000000', '*': '101010101000000', ':': '000010000010000', '$': '011110010011110',
  '!': '010010010000010', '/': '001001010100100', "'": '010010000000000', '#': '101111101111101', ' ': '000000000000000',
};
const fine = (c: Ctx, s: string, x: number, y: number, col: string) => {
  c.fillStyle = col;
  [...s].forEach((ch, i) => { const g = F[ch] ?? F[' ']; for (let k = 0; k < 15; k++) if (g[k] === '1') c.fillRect(x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1); });
};
const fineW = (s: string) => s.length * 4 - 1;

/** Words in the pixel font (8px is its own size: crisp), an ink drop shadow. */
const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, shadow: string | null = INK) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  if (shadow) { c.fillStyle = shadow; c.fillText(s, x + 1, y + 1); }
  c.fillStyle = col; c.fillText(s, x, y);
};

/** Fat letters: an ink outline all round, a drop shadow, the face in bands of the ramp (top lit, bottom dark). */
let scratch: HTMLCanvasElement | null = null;
const fatWords = (c: Ctx, s: string, x: number, y: number, size: number, ramp: string[]) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillStyle = INK;
  for (let dx = -2; dx <= 3; dx++) for (let dy = -2; dy <= 3; dy++) c.fillText(s, x + dx, y + dy);
  if (!scratch) scratch = document.createElement('canvas');
  scratch.width = W; scratch.height = H;
  const g = scratch.getContext('2d')!;
  g.font = c.font; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#fff'; g.fillText(s, x, y);
  g.globalCompositeOperation = 'source-atop';
  const n = ramp.length - 1;
  for (let i = 0; i < size; i++) { g.fillStyle = ramp[Math.max(0, n - 1 - Math.floor((i / size) * (n - 1)))]; g.fillRect(0, y - size + i, W, 1); }
  g.fillStyle = ramp[n]; g.fillRect(0, y - size, W, 2);
  c.drawImage(scratch, 0, 0);
};

/** The park's star: gold, stepped, grinning. */
const mascot = (c: Ctx, x: number, y: number, r: number) => {
  const pts = (rr: number, dx = 0, dy = 0) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * 0.48 : rr; c.lineTo(x + dx + Math.cos(a) * q, y + dy + Math.sin(a) * q); } c.closePath(); };
  c.fillStyle = INK; pts(r + 2); c.fill();
  c.fillStyle = GOLD[1]; pts(r); c.fill();
  c.fillStyle = GOLD[3]; pts(r * 0.86, -1, -1); c.fill();
  c.fillStyle = GOLD[4]; pts(r * 0.55, -2, -2); c.fill();
  box(c, x - r * 0.45, y - r * 0.55, 2, 2, GOLD[5]);
  // (its face: eyes, a grin, rosy cheeks)
  box(c, x - 4, y - 3, 2, 3, INK); box(c, x + 2, y - 3, 2, 3, INK); box(c, x - 4, y - 3, 1, 1, '#fff'); box(c, x + 2, y - 3, 1, 1, '#fff');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, y + 1); c.quadraticCurveTo(x, y + 6, x + 4, y + 1); c.fill();
  box(c, x - 2, y + 2, 4, 1, '#fff');
  box(c, x - 7, y, 2, 1, '#f87171'); box(c, x + 5, y, 2, 1, '#f87171');
};

/** The ticket's outline (with the two notches either end of the perforation). */
const shape = (c: Ctx, inset = 0) => {
  c.beginPath();
  c.moveTo(X0 + inset, Y0 + inset);
  c.lineTo(PERF - 6, Y0 + inset); c.arc(PERF, Y0 + inset, 6, Math.PI, 0, true);
  c.lineTo(X0 + TW - inset, Y0 + inset); c.lineTo(X0 + TW - inset, Y0 + TH - inset);
  c.lineTo(PERF + 6, Y0 + TH - inset); c.arc(PERF, Y0 + TH - inset, 6, 0, Math.PI, true);
  c.lineTo(X0 + inset, Y0 + TH - inset); c.closePath();
};

let paperArt: HTMLCanvasElement | null = null;
/** The clean ticket, everything that doesn't move (painted once). */
const paintTicket = () => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;
  // (its shadow on the counter)
  c.fillStyle = 'rgba(0, 0, 0, 0.45)'; c.save(); c.translate(4, 5); shape(c); c.fill(); c.restore();
  // The card stock: an ink edge, banded from lit (top left) to shaded, fibers
  c.fillStyle = INK; shape(c); c.fill();
  c.save(); shape(c, 1); c.clip();
  const bands = [PAPER[5], PAPER[4], PAPER[4], PAPER[4], PAPER[3], PAPER[3]];
  bands.forEach((col, i) => box(c, X0, Y0 + (i * TH) / bands.length, TW, TH / bands.length + 1, col));
  for (let i = 1; i < bands.length; i++) if (bands[i] !== bands[i - 1]) dither(c, X0, Math.round(Y0 + (i * TH) / bands.length) - 1, TW, 2, bands[i - 1], 1);
  for (let k = 0; k < 420; k++) box(c, X0 + hash(k) * TW, Y0 + hash(k * 3.1) * TH, hash(k * 7) > 0.7 ? 2 : 1, 1, hash(k * 5) > 0.5 ? PAPER[2] : PAPER[5]);
  box(c, X0, Y0 + 1, TW, 1, '#ffffff'); box(c, X0 + 1, Y0, 1, TH, PAPER[5]);
  box(c, X0, Y0 + TH - 3, TW, 2, PAPER[2]); box(c, X0 + TW - 3, Y0, 2, TH, PAPER[2]);

  // The engraved border, like money: two sine waves crossing round a frame, a fine rule either side
  const fx0 = X0 + 4, fy0 = Y0 + 4, fx1 = PERF - 8, fy1 = Y0 + TH - 5;
  c.fillStyle = BLUE[3];
  const lattice = (x: number, y: number, along: number, horiz: boolean) => {
    for (let k = 0; k < 2; k++) { const o = Math.round(Math.sin(along * 0.42 + k * Math.PI) * 1.6); c.fillRect(horiz ? x : x + o + 1, horiz ? y + o + 1 : y, 1, 1); }
  };
  for (let x = fx0; x <= fx1; x++) { lattice(x, fy0, x, true); lattice(x, fy1 - 4, x, true); }
  for (let y = fy0; y <= fy1; y++) { lattice(fx0, y, y, false); lattice(fx1 - 4, y, y, false); }
  box(c, fx0 - 1, fy0 - 1, fx1 - fx0 + 2, 1, BLUE[2]); box(c, fx0 - 1, fy1 + 1, fx1 - fx0 + 2, 1, BLUE[2]);
  box(c, fx0 - 1, fy0 - 1, 1, fy1 - fy0 + 3, BLUE[2]); box(c, fx1 + 1, fy0 - 1, 1, fy1 - fy0 + 3, BLUE[2]);
  // (rosettes in the corners)
  for (const [rx, ry] of [[fx0 + 2, fy0 + 2], [fx1 - 2, fy0 + 2], [fx0 + 2, fy1 - 2], [fx1 - 2, fy1 - 2]]) {
    c.fillStyle = RED[2]; for (let a = 0; a < 12; a++) { const an = (a / 12) * Math.PI * 2, r = 3 + (a % 2); c.fillRect(Math.round(rx + Math.cos(an) * r), Math.round(ry + Math.sin(an) * r), 1, 1); }
    box(c, rx - 1, ry - 1, 2, 2, GOLD[3]);
  }

  // Old Glory down the left: stripes in steps, the canton, its stars
  const gx = X0 + 12, gy = Y0 + 12, gw = 36, gh = TH - 24;
  box(c, gx - 1, gy - 1, gw + 2, gh + 2, INK);
  for (let i = 0; i < 13; i++) {
    const y = gy + Math.round((i * gh) / 13), h = Math.round(((i + 1) * gh) / 13) - Math.round((i * gh) / 13);
    box(c, gx, y, gw, h, i % 2 ? PAPER[5] : RED[2]); box(c, gx, y, gw, 1, i % 2 ? '#ffffff' : RED[3]);
    box(c, gx + gw - 6, y, 6, h, i % 2 ? PAPER[3] : RED[1]);
  }
  const ch = Math.round((7 * gh) / 13);
  box(c, gx, gy, gw * 0.6, ch, BLUE[2]); box(c, gx, gy, gw * 0.6, 2, BLUE[3]); dither(c, gx, gy + ch - 4, Math.round(gw * 0.6), 4, BLUE[1]);
  for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) { const sx = gx + 3 + k * 5 + (r % 2) * 2, sy = gy + 3 + r * 8; box(c, sx, sy + 1, 3, 1, '#ffffff'); box(c, sx + 1, sy, 1, 3, '#ffffff'); }

  // HAPPY LAND, fat, banded pink; the star grinning over it
  fatWords(c, 'HAPPY', 120, Y0 + 40, 16, PINK);
  fatWords(c, 'LAND', 120, Y0 + 62, 16, PINK);
  mascot(c, 172, Y0 + 20, 13);
  // (sparkles off it)
  for (const [sx, sy] of [[156, Y0 + 12], [188, Y0 + 36], [70, Y0 + 20]]) { box(c, sx, sy - 2, 1, 5, GOLD[4]); box(c, sx - 2, sy, 5, 1, GOLD[4]); box(c, sx, sy, 1, 1, '#fff'); }
  // ONE DAY ADMISSION, ADMIT ONE, the fine print
  box(c, 60, Y0 + 70, 120, 1, BLUE[2]);
  words(c, 'ONE DAY', 120, Y0 + 80, BLUE[2], 8, null);
  words(c, 'ADMISSION', 120, Y0 + 90, BLUE[2], 8, null);
  box(c, 74, Y0 + 93, 92, 12, RED[2]); box(c, 74, Y0 + 93, 92, 1, RED[3]); box(c, 74, Y0 + 104, 92, 1, RED[0]);
  words(c, 'ADMIT ONE', 120, Y0 + 103, '#fffbee', 8, RED[0]);
  const fp = 'NON-REFUNDABLE. GOD BLESS.';
  fine(c, fp, 120 - Math.floor(fineW(fp) / 2), Y0 + 108, PAPER[1]);

  // The perforation: holes punched down it
  for (let y = Y0 + 9; y < Y0 + TH - 8; y += 5) { box(c, PERF - 1, y, 3, 3, PAPER[1]); box(c, PERF - 1, y, 3, 1, PAPER[0]); }
  // The stub: ADMIT ONE across the top, the barcode, its number, the fine print
  const sx0 = PERF + 6, sx1 = X0 + TW - 6;
  box(c, sx0, Y0 + 6, sx1 - sx0, 10, BLUE[2]); box(c, sx0, Y0 + 6, sx1 - sx0, 1, BLUE[3]);
  fine(c, 'ADMIT ONE', sx0 + Math.floor((sx1 - sx0 - fineW('ADMIT ONE')) / 2), Y0 + 9, '#fffbee');
  for (let x = sx0 + 2, k = 0; x < sx1 - 2; k++) { const w = hash(k * 13) > 0.62 ? 2 : 1; if (k % 2 === 0) box(c, x, Y0 + 22, w, 50, INK); x += w + (hash(k * 7) > 0.6 ? 2 : 1); }
  fine(c, '4 1776 00001', sx0 + 2, Y0 + 75, INK);
  fine(c, 'NO.000001', sx0 + 6, Y0 + 86, RED[2]);
  fine(c, 'VALID:', sx0 + 2, Y0 + 96, PAPER[1]); fine(c, 'TODAY ONLY', sx0 + 2, Y0 + 102, PAPER[1]);
  fine(c, 'ALL RIDES*', sx0 + 2, Y0 + 110, BLUE[2]); fine(c, '*NOT ALL', sx0 + 2, Y0 + 116, PAPER[1]);
  c.restore();
  return cv;
};

/** The foil strip (it moves: the light going across it). */
const foil = (c: Ctx, t: number) => {
  const x = PERF - 22, y0 = Y0 + 10, h = TH - 20;
  const HOLO = ['#9ae6f5', '#b7f0c0', '#f8f0a0', '#f8c0d8', '#c8b8f8', '#a8d0f8'];
  box(c, x - 1, y0 - 1, 10, h + 2, '#8a8a8a');
  for (let y = 0; y < h; y++) for (let k = 0; k < 8; k++) {
    const v = Math.floor((y + k * 2 + t * 0.6) / 4) % HOLO.length;
    c.fillStyle = HOLO[(v + HOLO.length) % HOLO.length]; c.fillRect(x + k, y0 + y, 1, 1);
  }
  // (the glint sliding down it, the stars pressed into it)
  const gy = y0 + ((t * 1.2) % (h + 30)) - 15;
  for (let k = 0; k < 8; k++) { const yy = gy + k * 0.6; if (yy > y0 && yy < y0 + h - 1) box(c, x + k, yy, 1, 3, '#ffffff'); }
  for (let k = 0; k < 5; k++) { const sy = y0 + 8 + k * 20; box(c, x + 3, sy, 2, 4, '#8890a8'); box(c, x + 2, sy + 1, 4, 2, '#8890a8'); }
};

// ---------------------------------------------------------------------------------------------------------------
// After his back pocket

/** An irregular blob (a stain), r round (x, y), its edge wobbling by the seed. */
const blob = (c: Ctx, x: number, y: number, r: number, seed: number, squash = 0.7) => {
  c.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2, rr = r * (1 + 0.22 * Math.sin(a * 3 + seed) + 0.12 * Math.sin(a * 7 + seed * 2) + 0.06 * Math.sin(a * 13 + seed * 5));
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * squash);
  }
  c.closePath();
};

let shitArt: HTMLCanvasElement | null = null;
const paintShit = () => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;
  c.drawImage(paperArt!, 0, 0);
  c.save(); shape(c, 1); c.clip();
  // Yellowed, damp all over; creased where it was sat on
  c.fillStyle = 'rgba(150, 105, 30, 0.22)'; c.fillRect(X0, Y0, TW, TH);
  dither(c, X0, Y0, TW, TH, 'rgba(110, 70, 20, 0.08)');
  for (const [x1, y1, x2, y2] of [[X0, Y0 + 30, X0 + TW, Y0 + 70], [X0 + 90, Y0, X0 + 130, Y0 + TH], [X0 + 30, Y0 + TH, X0 + 230, Y0 + 10]]) {
    c.strokeStyle = 'rgba(70, 45, 15, 0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.strokeStyle = 'rgba(255, 250, 230, 0.6)'; c.beginPath(); c.moveTo(x1, y1 - 1); c.lineTo(x2, y2 - 1); c.stroke();
  }
  // The stains: soaked in rings (a dark tide line round each, the wet edge, the middle darkest)
  const stains: [number, number, number, number][] = [[150, Y0 + 86, 50, 1], [96, Y0 + 104, 32, 2.4], [232, Y0 + 40, 28, 4.1], [40, Y0 + 30, 18, 6.3], [200, Y0 + 112, 20, 8.8], [120, Y0 + 22, 14, 3.3], [70, Y0 + 70, 12, 5.5]];
  for (const [x, y, r, s] of stains) {
    c.fillStyle = 'rgba(60, 35, 10, 0.55)'; blob(c, x, y, r + 3, s); c.fill();
    c.fillStyle = 'rgba(160, 110, 50, 0.55)'; blob(c, x, y, r + 1, s); c.fill();
    const layers = [BROWN[5], BROWN[4], BROWN[3], BROWN[2], BROWN[1]];
    layers.forEach((col, i) => { c.fillStyle = col; c.globalAlpha = 0.86 + i * 0.035; blob(c, x - i * 1.5, y + i, r * (0.86 - i * 0.16), s + i * 0.7); c.fill(); });
    c.globalAlpha = 1;
    // (dithered into the paper round its edge)
    for (let k = 0; k < 60; k++) { const a = hash(k + s * 10) * Math.PI * 2, d = r * (0.9 + hash(k * 3 + s) * 0.35); box(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, 1, 1, BROWN[5]); }
  }
  // Smears: three fingers dragged across it, tapering
  for (let f = 0; f < 3; f++) for (let k = 0; k < 70; k++) {
    const x = 104 + k * 1.3 + f * 2, y = Y0 + 46 + f * 5 + k * 0.38 + Math.sin(k * 0.3) * 1.2, w = Math.max(1, 4 - k / 22);
    box(c, x, y, 2, w, k % 9 < 6 ? BROWN[3] : BROWN[4]);
    if (k % 5 === 0) box(c, x, y, 1, 1, BROWN[6]);
  }
  // (the ink ran where it got wet: the letters bleeding down)
  for (let k = 0; k < 26; k++) { const x = 78 + hash(k * 9) * 84; box(c, x, Y0 + 104, 1, 3 + hash(k) * 9, 'rgba(120, 20, 20, 0.6)'); }
  // Lumps: chunky, shiny wet tops; a kernel of corn
  for (const [x, y, r, s] of [[146, Y0 + 82, 7, 1], [160, Y0 + 92, 5, 2], [130, Y0 + 94, 4, 3], [236, Y0 + 38, 5, 4], [98, Y0 + 102, 4, 5], [168, Y0 + 78, 3, 6]] as [number, number, number, number][]) {
    c.fillStyle = INK; blob(c, x, y + 1, r + 1, s, 0.8); c.fill();
    c.fillStyle = BROWN[1]; blob(c, x, y, r, s, 0.8); c.fill();
    c.fillStyle = BROWN[3]; blob(c, x - r * 0.25, y - r * 0.2, r * 0.7, s + 1, 0.8); c.fill();
    c.fillStyle = BROWN[5]; blob(c, x - r * 0.4, y - r * 0.35, r * 0.35, s + 2, 0.8); c.fill();
    box(c, x - r * 0.5, y - r * 0.5, 2, 1, '#f6e2c0'); box(c, x - r * 0.5 + 2, y - r * 0.5 + 1, 1, 1, '#ffffff');
  }
  c.fillStyle = INK; c.beginPath(); c.ellipse(154, Y0 + 88, 3.5, 2.8, 0.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#d6a412'; c.beginPath(); c.ellipse(154, Y0 + 88, 2.6, 2, 0.4, 0, Math.PI * 2); c.fill();
  box(c, 152, Y0 + 87, 2, 1, '#fde68a'); box(c, 155, Y0 + 89, 1, 1, '#a07408');
  // (a hair, stuck in it)
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(60, Y0 + 70); c.quadraticCurveTo(80, Y0 + 60, 74, Y0 + 84); c.quadraticCurveTo(70, Y0 + 92, 88, Y0 + 96); c.stroke();
  c.restore();
  // (the corner that went soggy and tore off: gone, its fibers ragged)
  c.save(); c.globalCompositeOperation = 'destination-out';
  c.beginPath(); c.moveTo(X0 - 2, Y0 + TH - 34); for (let i = 0; i <= 10; i++) c.lineTo(X0 + i * 3.6 + (i % 2) * 2, Y0 + TH - 34 + i * 3.6 + (i % 2 ? -2 : 2)); c.lineTo(X0 + 44, Y0 + TH + 10); c.lineTo(X0 - 2, Y0 + TH + 10); c.closePath(); c.fill();
  c.restore();
  // (the soggy torn edge: darker, fibers showing)
  c.save(); shape(c, 1); c.clip(); c.globalCompositeOperation = 'source-atop';
  c.strokeStyle = BROWN[3]; c.lineWidth = 4; c.beginPath(); c.moveTo(X0, Y0 + TH - 34); c.lineTo(X0 + 44, Y0 + TH + 8); c.stroke();
  c.restore();
  // Drips, hanging off the bottom edge
  for (const [x, len] of [[140, 10], [158, 16], [210, 7], [104, 6]]) {
    box(c, x - 1, Y0 + TH - 2, 4, len, INK); box(c, x, Y0 + TH - 2, 2, len, BROWN[2]); box(c, x, Y0 + TH - 2, 1, len - 2, BROWN[4]);
    c.fillStyle = INK; c.beginPath(); c.arc(x + 1, Y0 + TH - 2 + len, 2.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = BROWN[2]; c.beginPath(); c.arc(x + 1, Y0 + TH - 2 + len, 1.8, 0, Math.PI * 2); c.fill(); box(c, x, Y0 + TH - 3 + len, 1, 1, BROWN[6]);
  }
  return cv;
};

/** What moves on the shitty one: a drop falling off it now and then, the stink coming off it, the flies. */
const shitLive = (c: Ctx, t: number) => {
  // (wet shine sliding on the big stain)
  const sh = (t * 0.5) % 60;
  if (sh < 14) for (let k = 0; k < 6; k++) box(c, 134 + sh * 2 + k, Y0 + 74 + k * 0.5, 1, 1, '#f6e2c0');
  // (a drop falling off the longest drip)
  const d = t % 70;
  if (d < 24) { const y = Y0 + TH + 14 + d * d * 0.05; box(c, 158, y, 2, 3, INK); box(c, 158, y, 1, 2, BROWN[3]); }
  // (the stink: green lines coming up off it, wavering)
  for (let k = 0; k < 4; k++) {
    const x = 70 + k * 46, ph = t * 0.12 + k * 1.7;
    for (let i = 0; i < 22; i++) {
      const y = Y0 - 2 - i - ((t * 0.4 + k * 9) % 8), xx = x + Math.sin(ph + i * 0.35) * 4;
      if (y < 0) continue;
      const a = 1 - i / 22;
      c.fillStyle = `rgba(${i % 4 < 2 ? '120, 160, 50' : '160, 190, 70'}, ${(0.85 * a).toFixed(2)})`; c.fillRect(Math.round(xx), Math.round(y), 2, 1);
    }
  }
  // (the flies: going round it in loops, their wings a blur)
  for (let k = 0; k < 4; k++) {
    const a = t * (0.07 + k * 0.013) + k * 2.1;
    const x = 140 + Math.sin(a) * (60 + k * 18), y = Y0 + 50 + Math.sin(a * 2 + k) * (34 + k * 6);
    box(c, x - 2, y - 1, 4, 3, INK); box(c, x - 1, y - 1, 1, 1, '#4a5a2a'); box(c, x + 1, y, 1, 1, '#b91c1c');
    if ((t + k) % 4 < 2) { box(c, x - 3, y - 3, 2, 2, 'rgba(220, 235, 245, 0.85)'); box(c, x + 1, y - 3, 2, 2, 'rgba(220, 235, 245, 0.85)'); }
    else { box(c, x - 4, y - 2, 3, 1, 'rgba(220, 235, 245, 0.7)'); box(c, x + 1, y - 2, 3, 1, 'rgba(220, 235, 245, 0.7)'); }
  }
};

const TicketCard: React.FC<{ kind: 'clean' | 'shitty' | 'nude' }> = ({ kind }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || kind === 'nude') return;
    const c = cv.getContext('2d')!;
    let raf = 0, t = 0;
    const frame = () => {
      if (!paperArt) paperArt = paintTicket();
      if (kind === 'shitty' && !shitArt) shitArt = paintShit();
      c.clearRect(0, 0, W, H);
      c.drawImage(kind === 'shitty' ? shitArt! : paperArt, 0, 0);
      if (kind === 'clean') foil(c, t);
      else shitLive(c, t);
      t++;
      raf = requestAnimationFrame(frame);
    };
    // (the font has to be in before the words are painted into the stock)
    void document.fonts.load('8px "Press Start 2P"').then(() => { paperArt = null; shitArt = null; frame(); });
    return () => cancelAnimationFrame(raf);
  }, [kind]);
  if (kind === 'nude') return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(0, 0, 0, 0.55)' }}>
      <canvas ref={ref} width={W} height={H} style={{ width: W * 2, height: H * 2, imageRendering: 'pixelated', transform: 'rotate(-3deg)' }} />
    </div>
  );
};

export default TicketCard;
