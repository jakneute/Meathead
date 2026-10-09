// The punch, up close (intro/index.ts: naked, no ticket, he panics, and she gets it): a picture-in-picture box over the
// world, painted at half resolution and blown up 2x so it's chunky like everything else. Deb in her window, smiling the
// smile she's been smiling since eight this morning; his big bare left fist coming in from the side; her face taking it
// (the squash, the flash, WHAM); her head whipping round, the visor gone, teeth out, the headset's mic snapped off; then
// down she goes below the counter, stars where she went, a tooth spinning to a stop, and the WINDOW CLOSED sign
// dropping down on its chains. Her shapes are shaded pixel by pixel in stepped ramps (cached), dithered where the shades
// meet: peak SNES.

import { CANVAS_WIDTH } from '../../m1/constants';
import { shaded, ball as roundLight, box as boxLight, RAMP } from '../../m1/game/scenes/art/snes';
import { PIP_LEN, PIP_HIT } from './index';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
/** The box's own resolution (drawn 2x on screen). */
const W = 180, H = 124;
/** Where it sits on screen. */
const SX = CANVAS_WIDTH - W * 2 - 28, SY = 112;

// (her colors, darkest first)
const SKIN = ['#4a2418', '#7a3f2a', '#a85e42', '#cc8262', '#e6a483', '#f4c4a6', '#fde2cf'];
const HAIR = ['#2a0c06', '#4e1a0c', '#7a2c12', '#a3411a', '#c65d28', '#e0854a'];
const POLO = ['#3c0606', '#6a0e0c', '#9c1a14', '#c8281e', '#e2483a', '#f47a66'];
const WOOD = ['#2c1204', '#4c2008', '#72340c', '#9a4c14', '#c06c24', '#dc9044'];
const BRASS = ['#3c2804', '#6c4c0c', '#a0781c', '#ccA032', '#ecc860', '#fcec9c'];
const NAVY = ['#060a24', '#0c1440', '#16245e', '#20367e', '#3250a2'];

let off: HTMLCanvasElement | null = null;
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (v: number) => 1 - (1 - clamp01(v)) ** 3;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A checker of `col` over (x, y, w, h), 1 px cells (at the box's own resolution). */
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) % 2; xx < w; xx += 2) c.fillRect(Math.round(x) + xx, Math.round(y) + yy, 1, 1);
};

// A 3x5 pixel font for the name tag and the sign
const GLYPH: Record<string, string> = {
  H: '101101111101101', I: '111010010010111', '!': '010010010000010', "'": '010010000000000', M: '101111111101101',
  D: '110101101101110', E: '111100110100111', B: '110101110101110', W: '101101111111101', N: '101111111111101',
  O: '111101101101111', C: '111100100100111', L: '100100100100111', S: '111100111001111', ' ': '000000000000000',
  X: '101101010101101', T: '111010010010010', A: '010101111101101', K: '101110100110101',
};
const tiny = (c: Ctx, s: string, x: number, y: number, col: string) => {
  c.fillStyle = col;
  [...s].forEach((ch, i) => { const g = GLYPH[ch] ?? GLYPH[' ']; for (let k = 0; k < 15; k++) if (g[k] === '1') c.fillRect(x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1); });
};

// ---------------------------------------------------------------------------------------------------------------
// The booth behind her (painted once)

const back = () => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  // (wood paneling, in steps, the boards' seams, lit at the top where the lamp is)
  const bands = [WOOD[3], WOOD[3], WOOD[2], WOOD[2], WOOD[2], WOOD[1], WOOD[1]];
  bands.forEach((col, i) => box(g, 0, (i * H) / bands.length, W, H / bands.length + 1, col));
  for (let i = 1; i < bands.length; i++) if (bands[i] !== bands[i - 1]) dither(g, 0, Math.round((i * H) / bands.length) - 1, W, 2, bands[i - 1], 1);
  for (let x = 6; x < W; x += 14) { box(g, x, 0, 1, H, WOOD[0]); box(g, x + 1, 0, 1, H, WOOD[4]); for (let k = 0; k < 4; k++) box(g, x + 4 + (k * 3) % 8, 10 + ((x * 7 + k * 29) % (H - 20)), 3, 1, WOOD[1]); }
  // (the lamp's light on the wall: stepped)
  g.fillStyle = 'rgba(255, 236, 170, 0.12)'; g.beginPath(); g.ellipse(96, 10, 70, 40, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255, 236, 170, 0.1)'; g.beginPath(); g.ellipse(96, 6, 44, 24, 0, 0, Math.PI * 2); g.fill();
  // (the bulletin board: cork, pins, EMPLOYEE OF THE MONTH (her, smiling the same smile), a shift schedule, a flag)
  box(g, 6, 14, 52, 46, INK); box(g, 7, 15, 50, 44, '#a9743c'); dither(g, 7, 15, 50, 44, '#8f5c2c');
  box(g, 7, 15, 50, 2, '#c99a5c');
  box(g, 11, 19, 20, 24, '#F8FAFC'); box(g, 13, 21, 16, 14, '#93C5FD');
  g.fillStyle = HAIR[3]; g.beginPath(); g.ellipse(21, 28, 6, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = SKIN[4]; g.beginPath(); g.ellipse(21, 29, 4, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, 15, 33, 12, 2, POLO[3]); box(g, 19, 31, 4, 1, INK);
  tiny(g, 'DEB', 15, 37, '#1E3A8A');
  box(g, 20, 17, 2, 2, '#DC2626');
  box(g, 35, 19, 18, 22, '#FEF9C3'); for (let k = 0; k < 6; k++) box(g, 37, 22 + k * 3, 14 - (k % 3) * 3, 1, '#78716C');
  box(g, 43, 17, 2, 2, '#2563EB');
  box(g, 12, 46, 30, 10, '#FDE68A'); tiny(g, 'SMILE', 14, 48, '#B91C1C'); box(g, 26, 44, 2, 2, '#16A34A');
  box(g, 46, 46, 8, 10, '#F8FAFC'); for (let k = 0; k < 3; k++) box(g, 46, 47 + k * 3, 8, 1, '#DC2626'); box(g, 46, 46, 4, 5, '#1E3A8A');
  // (the clock: a quarter to forever)
  g.fillStyle = INK; g.beginPath(); g.arc(156, 24, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = BRASS[3]; g.beginPath(); g.arc(156, 24, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFBEB'; g.beginPath(); g.arc(156, 24, 9, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, 156 + Math.cos(a) * 7.5, 24 + Math.sin(a) * 7.5, 1, 1, INK); }
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(156, 24); g.lineTo(156, 18); g.moveTo(156, 24); g.lineTo(150, 24); g.stroke();
  box(g, 153, 26, 6, 1, '#DC2626');
  // (the shelf: ticket rolls, a mug that says #1 MOM, a cactus)
  box(g, 128, 50, 48, 4, WOOD[4]); box(g, 128, 54, 48, 2, WOOD[0]);
  for (let k = 0; k < 3; k++) { g.fillStyle = INK; g.beginPath(); g.arc(136 + k * 9, 45, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FBCFE8'; g.beginPath(); g.arc(136 + k * 9, 45, 4, 0, Math.PI * 2); g.fill(); box(g, 135 + k * 9, 44, 2, 2, '#9D174D'); }
  box(g, 163, 41, 8, 9, INK); box(g, 164, 42, 6, 8, '#F8FAFC'); box(g, 170, 44, 2, 4, '#F8FAFC'); box(g, 165, 44, 4, 2, '#DC2626');
  box(g, 155, 38, 4, 12, '#15803D'); box(g, 153, 42, 2, 4, '#15803D'); box(g, 159, 40, 2, 4, '#15803D'); box(g, 154, 48, 6, 3, '#B45309');
  return cv;
};
let backdrop: HTMLCanvasElement | null = null;

// ---------------------------------------------------------------------------------------------------------------
// Deb

type Face = 'smile' | 'blink' | 'shock' | 'hit' | 'out';

/** Her face's light: a round form lit from the upper left, an oval mask; the cheek dented in where the fist is. */
const faceLight = (dent: number) => {
  const L = roundLight(-0.5, -0.55, 0.16);
  return (u: number, v: number) => {
    // (an egg: wider at the cheekbones, the chin narrower)
    const nx = (u * 2 - 1) / (v > 0.55 ? 1 - (v - 0.55) * 0.75 : 1), ny = v * 2 - 1;
    if (nx * nx + ny * ny > 1) return -1;
    let l = L((nx + 1) / 2, v);
    // (the dent: the cheek pushed in, in shadow)
    if (dent > 0) { const dx = u - 0.05, dy = v - 0.66; if (dx * dx * 4 + dy * dy * 6 < 0.08 * dent) l *= 0.55; }
    return l;
  };
};
const hairLight = (u: number, v: number) => {
  const nx = u * 2 - 1, ny = v * 2 - 1;
  if (nx * nx + ny * ny * 1.1 > 1) return -1;
  // (strands: light breaking into streaks)
  return 0.15 + 0.75 * Math.max(0, -nx * 0.45 - ny * 0.6 + 0.4) + 0.12 * Math.sin(u * 40 + v * 6);
};
const fringeLight = (u: number, v: number) => {
  // (the bangs: swept to her right, a ragged bottom edge)
  const edge = 0.55 + 0.32 * (1 - u) - 0.22 * Math.abs(Math.sin(u * Math.PI * 4));
  if (v > edge) return -1;
  return 0.25 + 0.6 * (1 - v / edge) * (1 - u * 0.4) + 0.1 * Math.sin(u * 50);
};
const tailLight = (u: number, v: number) => {
  const nx = u * 2 - 1, ny = v * 2 - 1;
  const w = 1 - Math.abs(ny) ** 1.6 * 0.7;
  if (Math.abs(nx) > w) return -1;
  return 0.2 + 0.6 * Math.max(0, -nx * 0.6 + 0.5 - ny * 0.2) + 0.12 * Math.sin(v * 30 + u * 8);
};
const shoulders = boxLight(-0.5, -0.45, 0.18, 1, 0.3);
const poloLight = (u: number, v: number) => {
  // (her shoulders: a trapezoid, narrow at the neck)
  const half = 0.28 + 0.72 * Math.min(1, v * 2.4);
  if (Math.abs(u * 2 - 1) > half) return -1;
  return shoulders(u, v) - (Math.abs(u - 0.5) < 0.04 ? 0.15 : 0);
};

const eye = (c: Ctx, x: number, y: number, face: Face, side: number, t: number) => {
  if (face === 'blink') { box(c, x - 4, y, 9, 1, INK); box(c, x + (side > 0 ? 4 : -5), y - 1, 2, 1, INK); return; }
  if (face === 'out') {
    // (spirals, going round)
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.4) { const r = a * 0.55, aa = a + t * 0.4 * side; c.lineTo(x + Math.cos(aa) * r, y + Math.sin(aa) * r); }
    c.stroke(); return;
  }
  if (face === 'hit' && side < 0) {
    // (the eye on the side it landed: squeezed shut, tears flying)
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 5, y - 2); c.lineTo(x + 3, y + 1); c.lineTo(x - 4, y + 3); c.stroke();
    box(c, x - 7, y + 2, 2, 2, '#BFDBFE'); box(c, x - 10, y, 2, 2, '#DBEAFE'); return;
  }
  const big = face === 'shock' || face === 'hit';
  const ew = big ? 5 : 4.5, eh = big ? 4.5 : 2.8;
  // (the shadow over the lid, blue eyeshadow, the white, the iris in steps, the pupil, a glint, the lashes)
  c.fillStyle = '#5B8DEF'; c.beginPath(); c.ellipse(x, y - eh * 0.6, ew + 1, eh * 0.7 + 1.2, 0, Math.PI, 0); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, ew + 1, eh + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y, ew, eh, 0, 0, Math.PI * 2); c.fill();
  box(c, x - ew, y + eh - 1, ew * 2, 1, '#D6D3D1');
  if (big) { box(c, x - 1, y - 1, 2, 2, INK); box(c, x - 1, y - 2, 1, 1, '#FFFFFF'); }
  else {
    c.fillStyle = '#1D4ED8'; c.beginPath(); c.arc(x + 0.5, y, 2.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#60A5FA'; c.beginPath(); c.arc(x + 0.5, y + 0.8, 1.6, 0, Math.PI * 2); c.fill();
    box(c, x - 0.5, y - 1, 2, 2, INK); box(c, x - 1, y - 2, 1, 1, '#FFFFFF');
  }
  box(c, x - ew - 1, y - eh - 1, ew * 2 + 2, 1.5, INK);
  box(c, x + side * (ew + 1) - (side < 0 ? 2 : 0), y - eh - 2, 2, 1, INK); box(c, x + side * (ew + 2) - (side < 0 ? 1 : 0), y - eh - 3, 1, 1, INK);
};

const mouth = (c: Ctx, face: Face, t: number) => {
  const lip = ['#5c0a14', '#8e1424', '#c42438', '#e44a5c', '#f6828e'];
  if (face === 'smile' || face === 'blink') {
    // (the smile: lipstick, both rows of teeth, held there since eight this morning)
    c.fillStyle = INK; c.beginPath(); c.moveTo(-10, 9); c.quadraticCurveTo(0, 20, 10, 9); c.quadraticCurveTo(0, 12, -10, 9); c.fill();
    c.fillStyle = '#7f1d1d'; c.beginPath(); c.moveTo(-9, 9.5); c.quadraticCurveTo(0, 18.5, 9, 9.5); c.quadraticCurveTo(0, 12, -9, 9.5); c.fill();
    // (a full row of big white teeth, the gaps between them, the shadow under the top lip)
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-8.5, 9.6); c.quadraticCurveTo(0, 16.5, 8.5, 9.6); c.quadraticCurveTo(0, 11, -8.5, 9.6); c.fill();
    for (const k of [-4, 0, 4]) box(c, k, 11, 1, 2, '#E7E5E4');
    box(c, -7, 10, 14, 1, '#E7E5E4');
    c.fillStyle = lip[2]; c.beginPath(); c.moveTo(-11, 9); c.quadraticCurveTo(0, 6, 11, 9); c.quadraticCurveTo(0, 10.5, -11, 9); c.fill();
    c.fillStyle = lip[2]; c.beginPath(); c.moveTo(-9, 16); c.quadraticCurveTo(0, 22.5, 9, 16); c.quadraticCurveTo(0, 18, -9, 16); c.fill();
    c.fillStyle = lip[3]; c.beginPath(); c.moveTo(-6, 18); c.quadraticCurveTo(0, 21, 6, 18); c.quadraticCurveTo(0, 19, -6, 18); c.fill();
    box(c, -2, 19, 4, 1, lip[4]);
    box(c, -12, 8, 2, 2, '#c47a5e'); box(c, 10, 8, 2, 2, '#c47a5e');
    return;
  }
  if (face === 'shock') {
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 13, 5, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = lip[2]; c.beginPath(); c.ellipse(0, 13, 5, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3b0608'; c.beginPath(); c.ellipse(0, 13.5, 3.2, 4.2, 0, 0, Math.PI * 2); c.fill();
    box(c, -2, 9, 4, 1, lip[4]);
    return;
  }
  if (face === 'hit') {
    // (stretched round sideways, away from the fist, the teeth showing, a gap already)
    c.fillStyle = INK; c.beginPath(); c.moveTo(-6, 13); c.quadraticCurveTo(6, 4, 15, 11); c.quadraticCurveTo(6, 22, -6, 13); c.fill();
    c.fillStyle = '#3b0608'; c.beginPath(); c.moveTo(-5, 13); c.quadraticCurveTo(6, 6, 14, 11); c.quadraticCurveTo(6, 20, -5, 13); c.fill();
    c.fillStyle = '#FFFFFF'; for (const k of [0, 3, 9]) box(c, k, 9 + Math.abs(k - 4) * 0.2, 2, 3, '#FFFFFF');
    c.fillStyle = lip[2]; c.beginPath(); c.moveTo(-7, 13); c.quadraticCurveTo(6, 3, 16, 10); c.quadraticCurveTo(6, 6, -7, 13); c.fill();
    box(c, 10 + (t % 3), 16, 2, 2, '#FFFFFF');
    return;
  }
  // (out cold: mouth hanging open, the tongue out the side, a tooth gone)
  c.fillStyle = INK; c.beginPath(); c.ellipse(1, 13, 8, 5, 0.15, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3b0608'; c.beginPath(); c.ellipse(1, 13, 7, 4, 0.15, 0, Math.PI * 2); c.fill();
  box(c, -5, 10, 3, 2, '#FFFFFF'); box(c, 1, 10, 2, 2, '#FFFFFF'); box(c, 6, 11, 2, 2, '#FFFFFF');
  c.fillStyle = '#e36a7a'; c.beginPath(); c.ellipse(5, 17, 3, 4, 0.4, 0, Math.PI * 2); c.fill(); box(c, 5, 15, 1, 3, '#b8455a');
  c.fillStyle = lip[2]; c.beginPath(); c.ellipse(1, 13, 8.5, 5.5, 0.15, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(8, 11); c.fill();
};

/** Her head, its middle at the origin, looking at him. */
const head = (c: Ctx, face: Face, t: number, visor: boolean, mic: boolean, swing: number, dent: number) => {
  // (the ponytail swinging out behind, the scrunchie)
  c.save(); c.translate(17, -14); c.rotate(0.35 + swing);
  shaded(c, 'deb.tail', -7, 0, 14, 34, HAIR, tailLight);
  box(c, -4, -1, 8, 4, '#2563EB'); box(c, -4, -1, 8, 1, '#60A5FA');
  c.restore();
  // (the hair behind her face; her ears, star earrings)
  shaded(c, 'deb.hair', -23, -30, 46, 44, HAIR, hairLight);
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(s * 20, 1, 3.5, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = SKIN[3]; c.beginPath(); c.ellipse(s * 20, 1, 2.5, 4.5, 0, 0, Math.PI * 2); c.fill();
    box(c, s * 20 - 1, 7, 2, 2, '#FACC15'); box(c, s * 20 - 2, 8, 4, 1, '#FDE68A'); box(c, s * 20, 9, 1, 2, '#CA8A04');
  }
  // (the face, shaded in steps)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 20.5, 23.5, 0, 0, Math.PI * 2); c.fill();
  shaded(c, dent > 0 ? 'deb.face.dent' : 'deb.face', -20, -23, 40, 46, SKIN, faceLight(dent > 0 ? 1 : 0));
  // (blush, a dither of it on each cheek; freckles)
  dither(c, -15, 6, 6, 3, '#e97a7a'); dither(c, 9, 6, 6, 3, '#e97a7a', 1);
  for (const [fx, fy] of [[-9, 4], [-6, 6], [7, 4], [10, 6], [-3, 5], [4, 5]]) box(c, fx, fy, 1, 1, SKIN[2]);
  // (the brows: plucked thin, arched; up in the air when she sees it coming)
  const up = face === 'shock' || face === 'hit' ? 3 : 0;
  for (const s of [-1, 1]) { c.strokeStyle = HAIR[1]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s * 3, -9 - up * 0.5); c.quadraticCurveTo(s * 8, -12 - up, s * 13, -8 - up * 0.3); c.stroke(); }
  eye(c, -8, -3, face, -1, t); eye(c, 8, -3, face, 1, t);
  // (the nose: a lit ridge, its shadow, the nostrils)
  box(c, -1, -1, 1, 7, SKIN[5]); box(c, 1, 0, 2, 7, SKIN[2]); box(c, -2, 7, 2, 1, SKIN[1]); box(c, 2, 7, 2, 1, SKIN[1]); box(c, 0, 8, 2, 1, SKIN[2]);
  mouth(c, face, t);
  // (the bangs over her forehead)
  shaded(c, 'deb.fringe', -21, -28, 42, 20, HAIR, fringeLight);
  // (the headset: the band over her hair, the cup on her ear, the mic out to her mouth, its foam)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(0, -4, 23, Math.PI * 1.08, Math.PI * 1.98); c.stroke();
  c.strokeStyle = '#3F3F46'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -4, 23, Math.PI * 1.08, Math.PI * 1.98); c.stroke();
  box(c, 19, -6, 7, 12, INK); box(c, 20, -5, 5, 10, '#27272A'); box(c, 20, -5, 2, 10, '#52525B'); box(c, 21, -2, 3, 3, '#A1A1AA');
  if (mic) {
    c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(22, 4); c.quadraticCurveTo(20, 14, 10, 15); c.stroke();
    c.strokeStyle = '#52525B'; c.lineWidth = 1; c.beginPath(); c.moveTo(22, 4); c.quadraticCurveTo(20, 14, 10, 15); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.ellipse(9, 15, 3.5, 2.5, 0, 0, Math.PI * 2); c.fill(); box(c, 7, 14, 4, 2, '#3F3F46'); box(c, 7, 14, 2, 1, '#71717A');
  }
  if (visor) visorAt(c, 0, -17, 0);
};

/** The visor: a band of stars round her forehead, the bill out front (from in front, its navy underside, striped edge). */
const visorAt = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 1, 27, 9, 0, Math.PI * 0.98, Math.PI * 2.02); c.lineTo(-27, 3); c.fill();
  c.fillStyle = NAVY[2]; c.beginPath(); c.ellipse(0, 1, 26, 8, 0, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = NAVY[3]; c.beginPath(); c.ellipse(-4, 0, 18, 5, 0, Math.PI, Math.PI * 2); c.fill();
  for (let k = -24; k < 26; k += 4) { box(c, k, -6 + Math.abs(k) * 0.12, 2, 2, (k / 4) % 2 ? '#DC2626' : '#F8FAFC'); }
  box(c, -24, 1, 48, 3, '#B91C1C'); box(c, -24, 1, 48, 1, '#F87171');
  for (let k = -18; k <= 18; k += 9) { box(c, k, 2, 2, 1, '#FFFFFF'); }
  c.restore();
};

/** Her shoulders and front: the red polo, the white collar, the buttons, the name tag. */
const body = (c: Ctx) => {
  c.fillStyle = INK; c.fillRect(-9, 16, 18, 16);
  box(c, -8, 16, 16, 15, SKIN[3]); box(c, -8, 16, 5, 15, SKIN[4]); box(c, 3, 16, 5, 15, SKIN[2]); box(c, -8, 16, 16, 3, SKIN[1]);
  shaded(c, 'deb.polo', -46, 24, 92, 56, POLO, poloLight);
  // (the collar, white, its points)
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(s * 2, 26); c.lineTo(s * 13, 23); c.lineTo(s * 11, 37); c.closePath(); c.fill();
    c.fillStyle = s < 0 ? '#FFFFFF' : '#D6D3D1'; c.beginPath(); c.moveTo(s * 3, 26.5); c.lineTo(s * 12, 24); c.lineTo(s * 10.5, 35); c.closePath(); c.fill();
  }
  box(c, -1, 30, 2, 18, POLO[1]); box(c, -1, 34, 2, 2, '#FFFFFF'); box(c, -1, 41, 2, 2, '#FFFFFF');
  // (the name tag: HI! I'M DEB)
  box(c, -36, 38, 26, 15, INK); box(c, -35, 39, 24, 13, '#F8FAFC'); box(c, -35, 39, 24, 5, '#1E3A8A');
  tiny(c, "HI!", -33, 39, '#FFFFFF'); tiny(c, 'DEB', -32, 46, '#B91C1C'); box(c, -35, 51, 24, 1, '#D6D3D1');
  // (a lanyard pin: a little flag)
  box(c, 16, 36, 8, 6, INK); box(c, 17, 37, 6, 4, '#F8FAFC'); box(c, 17, 37, 6, 1, '#DC2626'); box(c, 17, 39, 6, 1, '#DC2626'); box(c, 17, 37, 3, 2, '#1E3A8A');
};

// ---------------------------------------------------------------------------------------------------------------
// His fist: big, bare, hairy, his left

const fistLight = boxLight(-0.45, -0.6, 0.14, 1, 0.9);
/** A capsule's light (a finger, the thumb): round across its thickness, lit from above. */
const capsule = (u: number, v: number) => {
  const r = 0.5, cx = Math.min(Math.max(u, r * 0.35), 1 - r * 0.35), dx = (u - cx) / 0.18, dy = (v - 0.5) / 0.5;
  if (dx * dx + dy * dy > 1) return -1;
  return 0.15 + 0.85 * Math.max(0, 0.75 - dy * 0.75 - dx * 0.2);
};
/** His fist, side on, going right: the forearm in from off the edge, the back of his hand, four fingers curled, the
 * knuckles leading, the thumb wrapped over; hairy, a vein. (x, y) the wrist; `squash` < 1 as it lands. */
const fist = (c: Ctx, x: number, y: number, squash: number) => {
  const S = RAMP.mSkin;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(squash, 1);
  // (the forearm: in from way off the left)
  box(c, -200, -14, 204, 28, INK);
  shaded(c, 'm.arm', -199, -13, 202, 26, S, (u, v) => fistLight(0.5, v) * 0.92);
  for (let k = 0; k < 30; k++) { const hx = -196 + hash(k) * 196, hy = -12 + hash(k * 3) * 9; box(c, hx, hy, 1, 2, S[1]); box(c, hx + 1, hy - 1, 1, 1, S[0]); }
  box(c, -70, 1, 18, 1, '#8a6aa8'); box(c, -52, 2, 14, 1, '#8a6aa8'); box(c, -38, 1, 8, 1, '#8a6aa8');
  // (the back of his hand, broader than the wrist)
  c.fillStyle = INK; c.beginPath(); c.roundRect(-3, -19, 32, 38, 9); c.fill();
  shaded(c, 'm.hand', -2, -18, 30, 36, S, (u, v) => {
    const r = 0.3, dx = Math.max(0, Math.abs(u - 0.5) - (0.5 - r)), dy = Math.max(0, Math.abs(v - 0.5) - (0.5 - r));
    return dx * dx + dy * dy > r * r ? -1 : fistLight(u, v);
  });
  for (let k = 0; k < 8; k++) box(c, 2 + hash(k * 7) * 18, -15 + hash(k * 11) * 10, 1, 2, S[1]);
  // (the fingers, curled: four rolls stacked down the front, each with its knuckle out ahead, lit on top)
  for (let k = 0; k < 4; k++) {
    const fy = -18 + k * 8.6, fx = 14 + (k === 0 || k === 3 ? -1 : 1);
    c.fillStyle = INK; c.beginPath(); c.roundRect(fx - 1, fy - 1, 28, 11, 5); c.fill();
    shaded(c, 'm.finger', fx, fy, 26, 9, S, capsule);
    // (the knuckle's bump, catching the light; the crease of the middle joint; the nail tucked in at the back)
    box(c, fx + 21, fy + 1, 3, 2, S[7]); box(c, fx + 22, fy + 3, 2, 3, S[5]);
    box(c, fx + 11, fy + 2, 1, 5, S[2]); box(c, fx + 12, fy + 3, 1, 3, S[3]);
    box(c, fx + 2, fy + 6, 4, 2, '#f0c8a0'); box(c, fx + 2, fy + 6, 4, 1, '#fde8c8');
  }
  // (the thumb across the front of them, its nail)
  c.fillStyle = INK; c.beginPath(); c.roundRect(6, 9, 30, 11, 5); c.fill();
  shaded(c, 'm.thumb', 7, 10, 28, 9, S, capsule);
  box(c, 28, 11, 5, 4, '#f6d4a4'); box(c, 28, 11, 5, 1, '#fde8c8'); box(c, 33, 11, 1, 4, S[3]);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The whole thing

/** Everything flying: teeth, spit, the visor; simulated as a function of time so it's the same every time. */
const flying = (c: Ctx, t: number, hx: number, hy: number) => {
  if (t < PIP_HIT) return;
  const dt = t - PIP_HIT;
  const counter = H - 12;
  // (three teeth, out the side of her mouth, tumbling, bouncing on the counter, one spinning to a stop)
  for (let k = 0; k < 3; k++) {
    const vx = 1.2 + k * 0.6, vy = -3.2 + k * 0.6, g = 0.22, y0 = hy + 12, floor = counter - 2;
    let x = hx + 10 + vx * dt, y = y0 + vy * dt + 0.5 * g * dt * dt;
    // (on the counter: a little hop, a slide, and lying there; the middle one rocking a while)
    const land = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, floor - y0))) / g;
    if (dt > land) {
      const after = dt - land;
      y = floor - Math.max(0, 1.4 * after - 0.5 * g * after * after);
      x = hx + 10 + vx * land + vx * 0.4 * Math.min(after, 12);
      if (k === 1) x += Math.sin(after * 0.6) * Math.max(0, 1 - after / 60) * 2;
    }
    if (x > W + 4) continue;
    const spin = dt * 0.5 * (k + 1);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(y >= counter - 2.5 ? 0 : spin);
    box(c, -2, -2, 4, 5, INK); box(c, -1.5, -1.5, 3, 4, '#FFFFFF'); box(c, -1.5, 1.5, 3, 1, '#D6D3D1'); box(c, -1.5, 2.5, 1, 1, '#DC2626');
    c.restore();
  }
  // (spit and a little blood, sprayed out away from the fist)
  for (let k = 0; k < 14; k++) {
    if (dt > 30) break;
    const a = -0.9 + hash(k) * 1.5, sp = 2 + hash(k * 5) * 3;
    const x = hx + 6 + Math.cos(a) * sp * dt, y = hy + 10 + Math.sin(a) * sp * dt + 0.15 * dt * dt;
    box(c, x, y, k % 4 === 0 ? 2 : 1, k % 4 === 0 ? 2 : 1, k % 3 === 0 ? '#B91C1C' : '#E0F2FE');
  }
  // (the visor, spinning off up out of the box)
  if (dt < 40) visorAt(c, hx + 4 + dt * 3.2, hy - 17 - dt * 4 + dt * dt * 0.08, dt * 0.35);
  // (the mic, snapped off)
  if (dt < 50) {
    const mx = hx + 20 + dt * 1.8, my = hy + 8 - dt * 2 + dt * dt * 0.12;
    c.save(); c.translate(mx, my); c.rotate(-dt * 0.4);
    box(c, -6, -1, 10, 2, INK); box(c, -5, -0.5, 8, 1, '#52525B'); box(c, 3, -2, 4, 4, INK); box(c, 4, -1, 2, 2, '#3F3F46');
    c.restore();
  }
};

/** The impact: a jagged burst, white in the middle, gold, red at the tips. */
const burst = (c: Ctx, x: number, y: number, r: number, spin: number) => {
  const pts = (rad: number) => { c.beginPath(); for (let i = 0; i < 24; i++) { const a = spin + (i / 24) * Math.PI * 2, rr = i % 2 ? rad * 0.45 : rad * (0.8 + hash(i) * 0.4); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); };
  c.fillStyle = INK; pts(r + 2); c.fill();
  c.fillStyle = '#DC2626'; pts(r); c.fill();
  c.fillStyle = '#FACC15'; pts(r * 0.75); c.fill();
  c.fillStyle = '#FFFFFF'; pts(r * 0.45); c.fill();
};

/** The WINDOW CLOSED sign dropping down on its chains, swinging, settling. */
const closedSign = (c: Ctx, t: number) => {
  const T = 118;
  if (t < T) return;
  const dt = t - T, drop = Math.min(1, dt / 8);
  const y = -30 + drop * 58, ang = drop < 1 ? 0 : Math.sin((dt - 8) * 0.35) * 0.35 * Math.exp(-(dt - 8) / 18);
  c.save(); c.translate(W / 2 + 8, 0); c.rotate(ang);
  for (const s of [-1, 1]) for (let k = 0; k < y - 6; k += 3) box(c, s * 22 - 1, k, 2, 2, k % 6 ? '#A1A1AA' : '#52525B');
  box(c, -34, y - 8, 68, 20, INK); box(c, -33, y - 7, 66, 18, '#B91C1C'); box(c, -33, y - 7, 66, 2, '#F87171'); box(c, -33, y + 9, 66, 2, '#7F1D1D');
  box(c, -31, y - 5, 62, 14, '#FEF3C7'); box(c, -31, y - 5, 62, 1, '#FFFFFF');
  tiny(c, 'WINDOW', -12, y - 3, '#B91C1C'); tiny(c, 'CLOSED', -12, y + 3, '#1E3A8A');
  c.restore();
};

/** Draws the close-up, t frames in (screen space: world drawFront translated back by the camera). */
export const drawPunchCam = (ctx: Ctx, camX: number, camY: number, t: number) => {
  if (typeof document === 'undefined') return;
  if (!off) { off = document.createElement('canvas'); off.width = W; off.height = H; }
  if (!backdrop) backdrop = back();
  const c = off.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, W, H);
  c.drawImage(backdrop, 0, 0);

  // Her, by the moment: smiling; seeing it coming; taking it; whipping round; going down
  const hitIn = t - PIP_HIT;
  const face: Face = t < PIP_HIT - 11 ? ((t > 12 && t < 16) ? 'blink' : 'smile') : t < PIP_HIT ? 'shock' : hitIn < 22 ? 'hit' : 'out';
  const whip = hitIn < 0 ? 0 : easeOut(hitIn / 9) + (hitIn > 9 ? Math.sin((hitIn - 9) * 0.55) * 0.12 * Math.exp(-(hitIn - 9) / 12) : 0);
  const fall = Math.max(0, t - (PIP_HIT + 34));
  const bob = t < PIP_HIT ? Math.round(Math.sin(t * 0.18)) : 0;
  const hx = 100 + whip * 26 + fall * 0.6, hy = 50 + bob + fall * fall * 0.06;
  const rot = whip * 0.62 + fall * 0.025, squash = hitIn >= 0 && hitIn < 6 ? [0.8, 0.84, 0.9, 0.96, 1.02, 1][hitIn] : 1;
  // (her body: leaning with it, then dropping)
  c.save(); c.translate(100 + whip * 10 + fall * 0.5, 50 + bob + fall * fall * 0.06); c.rotate(whip * 0.12 + fall * 0.012);
  body(c); c.restore();
  c.save(); c.translate(hx, hy); c.rotate(rot); c.scale(squash, 2 - squash);
  head(c, face, t, hitIn < 1, hitIn < 1, hitIn >= 0 ? -whip * 0.9 + Math.sin(hitIn * 0.4) * 0.3 * Math.exp(-hitIn / 20) : Math.sin(t * 0.1) * 0.05, hitIn >= 0 && hitIn < 14 ? 1 : 0);
  c.restore();

  // The counter in front of her: brass trim, the wood, the ticket slot (she goes down behind it)
  box(c, 0, H - 14, W, 14, INK);
  box(c, 0, H - 13, W, 3, BRASS[4]); box(c, 0, H - 13, W, 1, BRASS[5]); box(c, 0, H - 10, W, 1, BRASS[1]);
  box(c, 0, H - 9, W, 9, WOOD[2]); dither(c, 0, H - 9, W, 2, WOOD[3]); box(c, 0, H - 2, W, 2, WOOD[0]);
  box(c, 60, H - 9, 70, 4, WOOD[0]); box(c, 60, H - 9, 70, 1, INK);
  flying(c, t, 100 + whip * 26, 50);
  // (stars and a bird going round where she went down)
  if (fall > 26) for (let k = 0; k < 4; k++) {
    const a = t * 0.15 + (k * Math.PI) / 2, x = 112 + Math.cos(a) * 18, y = H - 20 + Math.sin(a) * 4;
    if (k === 3) { box(c, x - 2, y - 1, 4, 3, '#93C5FD'); box(c, x + 2, y, 2, 1, '#FACC15'); box(c, x - 3, y - 2 + ((t >> 2) % 2), 2, 1, '#60A5FA'); }
    else { c.fillStyle = INK; c.fillRect(x - 2, y - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(x - 1, y - 2, 3, 5); c.fillRect(x - 2, y - 1, 5, 3); c.fillStyle = '#FFFFFF'; c.fillRect(x, y - 1, 1, 1); }
  }
  closedSign(c, t);

  // His fist: in from the left, accelerating; through; back out
  const fx = t < PIP_HIT - 14 ? -120 : t <= PIP_HIT ? -100 + 140 * ((t - (PIP_HIT - 14)) / 14) ** 2 : hitIn < 6 ? 40 + hitIn * 3 : 58 - (hitIn - 6) ** 2 * 0.6;
  if (fx > -60) {
    // (speed lines behind it, coming in)
    if (t > PIP_HIT - 12 && t <= PIP_HIT) for (let k = 0; k < 7; k++) box(c, fx - 150 - hash(k + t) * 30, 40 + k * 6, 60 + hash(k) * 40, 1, k % 2 ? '#FFFFFF' : '#FDE68A');
    fist(c, fx, 58, hitIn >= 0 && hitIn < 4 ? 0.9 : 1);
  }
  // The moment it lands: a white flash, the burst
  if (hitIn >= 0 && hitIn < 2) { c.fillStyle = 'rgba(255, 255, 255, 0.75)'; c.fillRect(0, 0, W, H); }
  if (hitIn >= 0 && hitIn < 14) burst(c, 86, 60, 10 + Math.min(hitIn, 5) * 4 - Math.max(0, hitIn - 8) * 3, hitIn * 0.1);

  // Onto the screen: the box opening and closing, a brass frame round it, shaking when it lands
  const open = Math.min(easeOut(t / 8), easeOut((PIP_LEN - t) / 10));
  if (open <= 0.01) return;
  const shake = hitIn >= 0 && hitIn < 18 ? (18 - hitIn) / 18 : 0;
  const sx = camX + SX + Math.round((hash(t) - 0.5) * 10 * shake), sy = camY + SY + Math.round((hash(t * 3) - 0.5) * 8 * shake);
  const h = Math.round(H * 2 * open), top = sy + Math.round((H * 2 - h) / 2);
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; ctx.fillRect(sx + 8, top + 8, W * 2 + 8, h + 8);
  ctx.fillStyle = INK; ctx.fillRect(sx - 8, top - 8, W * 2 + 16, h + 16);
  const fr = BRASS;
  ctx.fillStyle = fr[3]; ctx.fillRect(sx - 6, top - 6, W * 2 + 12, h + 12);
  ctx.fillStyle = fr[5]; ctx.fillRect(sx - 6, top - 6, W * 2 + 12, 2); ctx.fillStyle = fr[4]; ctx.fillRect(sx - 6, top - 6, 2, h + 12);
  ctx.fillStyle = fr[1]; ctx.fillRect(sx - 6, top + h + 4, W * 2 + 12, 2); ctx.fillStyle = fr[2]; ctx.fillRect(sx + W * 2 + 4, top - 6, 2, h + 12);
  ctx.fillStyle = INK; ctx.fillRect(sx - 2, top - 2, W * 2 + 4, h + 4);
  for (const [bx, by] of [[sx - 4, top - 4], [sx + W * 2 + 1, top - 4], [sx - 4, top + h + 1], [sx + W * 2 + 1, top + h + 1]]) { ctx.fillStyle = fr[0]; ctx.fillRect(bx, by, 3, 3); ctx.fillStyle = fr[5]; ctx.fillRect(bx, by, 1, 1); }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, W, H, sx, top, W * 2, h);
  // (WHAM, over the box, when it lands)
  if (hitIn >= 1 && hitIn < 30 && open > 0.9) {
    const s = hitIn < 4 ? 1.6 - hitIn * 0.15 : 1;
    ctx.translate(sx + 150, sy + 70); ctx.rotate(-0.18); ctx.scale(s, s);
    ctx.font = '26px "Press Start 2P"'; ctx.textAlign = 'center';
    for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3], [3, 3], [-3, 3], [3, -3], [-3, -3]]) { ctx.fillStyle = INK; ctx.fillText('WHAM!', dx, dy + 4); }
    ctx.fillStyle = '#DC2626'; ctx.fillText('WHAM!', 2, 3);
    ctx.fillStyle = '#FDE047'; ctx.fillText('WHAM!', 0, 0);
    ctx.textAlign = 'left';
  }
  ctx.restore();
};
