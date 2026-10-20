// The river above its waterline, painted (the final look): the jungle going back from it (the sky, the mountains with a
// falls down one, the canopy in ridges), the far bank across the water (mud, roots, reeds, trees hung with vines, the
// tour's signs on posts), the water between there and here (banded, its sheen sliding, the bank's reflection wobbling
// in it, foam along the edge), the tour's wildlife on the bank (the animatronic elephant spraying, the hippo on its
// rod, Dave the gorillas, Gerald), the dock and its station, the boat (the tour launch: river/boat.ts) and its wake, and
// the backside of water (color-cycled, its spray). Everything under the waterline is draw.ts's (the underwater pass).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { timeOfDay, farTint, hourMix, skyAt } from '../../timeOfDay';
import { sign, ball, steppedGlow, pixelBlob, bendFloor } from '../../intro/art/kit';
import { SECTIONS, GY } from '../geometry';
import {
  type Ctx, type Eye, INK, rampOf, box, checker, PIX, hash, mix, tilePattern,
  P, quad, seg, atDepth, depthChunk, bamboo, logPost, thatchRoof, fringe, drawJungleBackdrop, PLANK, STRAW,
} from '../queue/depth';
import { signAt, carved, plank, enamel } from '../letters';
import { drawLaunch } from './boat';
import { drawGags } from './gags';
import { WS, DOCK, BOAT, FALLS, roofAt, PIPE } from './course';

const { x0 } = SECTIONS.river;
const R = (x: number) => x0 + x;
/** The far bank's depth; the water's foot of it. */
const BANK_S = 0.86;
/** Where he's looking from, for what's on the surface: never from under it (down there it's held up over the water). */
const surfEye = (state: GameState): Eye => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: Math.min(state.camera.y + CANVAS_HEIGHT * 0.42, WS - 170) });
const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 140 && a < state.camera.x + CANVAS_WIDTH + 140;

// ---------------------------------------------------------------------------------------------------------------
// The backdrop

export const drawSurfaceBackdrop = (c: Ctx, state: GameState) => {
  drawJungleBackdrop(c, state, GY - 150 - state.camera.y, state.camera.x, state.frame);
};

// ---------------------------------------------------------------------------------------------------------------
// The far bank (painted once a stretch at a time, at its depth)

const CHUNK = 480;
const BANK_A = DOCK - 300, BANK_B = FALLS.x + 40;
const TOP = WS - 300;

/** A tree on the bank: a trunk, its crown in stepped clumps, vines hanging off it. */
const tree = (g: Ctx, x: number, seed: number, tall: number) => {
  const trunk = farTint('#5A4028', 0.35), leaf = farTint('#2E6A32', 0.35), lr = rampOf(leaf), tr = rampOf(trunk);
  const top = WS - 24 - tall, w = 8 + Math.floor(hash(seed) * 6);
  box(g, x - 1, top, w + 2, WS - 20 - top, INK); box(g, x, top, w, WS - 20 - top, tr[2]); box(g, x, top, 2, WS - 20 - top, tr[3]); box(g, x + w - 2, top, 2, WS - 20 - top, tr[1]);
  // (roots spreading at its foot)
  for (const d of [-1, 1]) { g.fillStyle = tr[1]; g.beginPath(); g.moveTo(x + w / 2, WS - 40); g.lineTo(x + w / 2 + d * 18, WS - 18); g.lineTo(x + w / 2 + d * 8, WS - 18); g.closePath(); g.fill(); }
  // (the crown: clumps, each dark under, lit up and to the left)
  const n = 5 + Math.floor(hash(seed * 3) * 4);
  for (let i = 0; i < n; i++) {
    const cx = x + w / 2 + (hash(seed + i * 1.7) - 0.5) * 90, cy = top + (hash(seed * 2 + i) - 0.4) * 40, r = 22 + hash(seed + i) * 18;
    pixelBlob(g, cx, cy + 4, r, r * 0.7, lr[0]);
    pixelBlob(g, cx - 2, cy, r * 0.9, r * 0.6, lr[1]);
    pixelBlob(g, cx - 6, cy - 5, r * 0.6, r * 0.4, lr[2]);
    pixelBlob(g, cx - 9, cy - 9, r * 0.3, r * 0.2, lr[3]);
  }
  // (vines hanging off it)
  for (let i = 0; i < 4; i++) {
    const vx = x + w / 2 + (hash(seed * 5 + i) - 0.5) * 80, len = 40 + hash(seed + i * 9) * 90;
    for (let y = 0; y < len; y += 2) box(g, Math.round(vx + Math.sin(y * 0.06 + i) * 3), top + 10 + y, 2, 2, y % 10 < 2 ? lr[3] : lr[1]);
  }
};
/** A broad-leafed plant at the water's edge. */
const fronds = (g: Ctx, x: number, seed: number) => {
  const lr = rampOf(farTint('#3A7A34', 0.35));
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI * (0.15 + k * 0.17), len = 22 + hash(seed + k) * 16;
    for (let t = 0; t < 1; t += 0.08) {
      const px = x + Math.cos(a) * len * t, py = WS - 22 + Math.sin(a) * len * t + t * t * 12, lw = Math.sin(t * Math.PI) * 6 + 1;
      box(g, px - 1, py, 3, lw, k % 2 ? lr[1] : lr[2]); box(g, px - 1, py, 3, 1, lr[3]);
    }
  }
};
/** A sign on two posts on the bank: its words on a painted board. */
const bankSign = (g: Ctx, x: number, w: number, h: number, face: string, frame: string, lines: [string, string, number][], high = 40) => {
  const top = WS - 22 - high - h, pr = rampOf('#7A5A3A');
  for (const px of [x - w / 2 + 8, x + w / 2 - 12]) { box(g, px - 1, top + h - 4, 6, high + 6, INK); box(g, px, top + h - 4, 4, high + 6, pr[2]); box(g, px, top + h - 4, 1, high + 6, pr[3]); }
  sign(g, x - w / 2, top, w, h, face, '', '#000', 5, frame);
  const wood = face === '#D8B878';
  lines.forEach(([s, col, size], i) => signAt(g, s, x, top + 3 + (h - 3) * ((i + 0.78) / lines.length), size, wood ? carved(size, col, '#F8E8C0', x + i) : plank(size, col, undefined, undefined, x + i)));
};
/** The tour's signs along the bank (relative x). */
const BANK_SIGNS: { x: number; paint: (g: Ctx, x: number) => void }[] = [
  { x: 640, paint: (g, x) => bankSign(g, x, 128, 34, '#D8B878', '#6A3A1A', [['YOU ARE NOW', '#5A1A0A', 5], ['ENTERING THE JUNGLE', '#5A1A0A', 5]]) },
  { x: 1560, paint: (g, x) => bankSign(g, x, 96, 30, '#F4F0E0', '#2A5A3A', [['NO SWIMMING', '#A8221A', 5], ['(PIRANHAS)', '#2A3A2A', 5]]) },
  { x: 2270, paint: (g, x) => {
    // (a road sign: a yellow diamond on a pole, a hippo on it)
    const top = WS - 110, pr = rampOf('#8A8E96');
    box(g, x - 2, top + 20, 5, WS - 22 - top - 20, INK); box(g, x - 1, top + 20, 3, WS - 22 - top - 20, pr[3]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, top - 2); g.lineTo(x + 24, top + 22); g.lineTo(x, top + 46); g.lineTo(x - 24, top + 22); g.closePath(); g.fill();
    g.fillStyle = '#F4C820'; g.beginPath(); g.moveTo(x, top + 1); g.lineTo(x + 21, top + 22); g.lineTo(x, top + 43); g.lineTo(x - 21, top + 22); g.closePath(); g.fill();
    box(g, x - 10, top + 18, 18, 8, '#1A1A1A'); box(g, x + 4, top + 14, 8, 7, '#1A1A1A'); box(g, x - 8, top + 26, 3, 4, '#1A1A1A'); box(g, x + 3, top + 26, 3, 4, '#1A1A1A');
    box(g, x - 35, top + 49, 70, 13, INK); box(g, x - 34, top + 50, 68, 11, '#F4C820'); signAt(g, 'HIPPO XING', x, top + 59, 5, enamel(5, '#1A1A1A'));
  } },
  { x: BOAT.stop + 140, paint: (g, x) => bankSign(g, x, 104, 34, '#D8B878', '#6A3A1A', [['LAST GAS', '#5A1A0A', 6], ['400 MILES BACK', '#5A1A0A', 5]]) },
  { x: FALLS.x - 190, paint: (g, x) => bankSign(g, x, 132, 38, '#2E4A2A', '#6A4A2A', [['THE BACKSIDE', '#F0D890', 6], ['OF WATER  >>', '#F0D890', 6]], 46) },
];

const paintBank = (g: Ctx, a: number, b: number) => {
  const mud = farTint('#5A4630', 0.35), mr = rampOf(mud);
  // (the mud bank along the water: lit along its top, dark where it's wet, roots and stones in it)
  box(g, a, WS - 26, b - a, 30, mr[1]);
  box(g, a, WS - 26, b - a, 4, farTint('#4A6A30', 0.35)); box(g, a, WS - 26, b - a, 1, farTint('#6A8A40', 0.35));
  checker(g, a, WS - 22, b - a, PIX, mr[2]);
  box(g, a, WS - 6, b - a, 10, mr[0]);
  for (let x = Math.floor(a / 30) * 30; x < b; x += 30) {
    const k = hash(x * 0.013);
    if (k < 0.35) { ball(g, x + 10, WS - 10, 5 + k * 10, farTint('#6A6A62', 0.35), true); }
    else if (k < 0.6) { g.strokeStyle = mr[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, WS - 22); g.quadraticCurveTo(x + 12, WS - 8, x + 26, WS - 2); g.stroke(); }
  }
  // (the trees, back to front)
  for (let x = Math.floor((a - 200) / 70) * 70; x < b + 200; x += 70) {
    const k = hash(x * 0.021 + 4);
    if (k < 0.82) tree(g, x + Math.floor(hash(x) * 30), x, 120 + Math.floor(hash(x * 1.3) * 120));
  }
  // (the edge: plants, reeds)
  for (let x = Math.floor(a / 26) * 26; x < b; x += 26) {
    const k = hash(x * 0.07 + 1);
    if (k < 0.4) fronds(g, x + 10, x);
    else if (k < 0.75) { const rr = rampOf(farTint('#6A8A3A', 0.35)); for (let i = 0; i < 6; i++) { const h = 16 + hash(x + i) * 18; box(g, x + i * 3, WS - 8 - h, 2, h, i % 2 ? rr[1] : rr[2]); box(g, x + i * 3, WS - 8 - h, 2, 3, rr[0]); } }
  }
  for (const s of BANK_SIGNS) if (s.x + 80 > a - x0 && s.x - 80 < b - x0) s.paint(g, R(s.x));
};

/** The bank, a stretch at a time; and its reflection in the water under it, wobbling. */
const drawBank = (c: Ctx, state: GameState, eye: Eye) => {
  const tod = timeOfDay(), f = state.frame;
  const [, footY] = P(eye, 0, WS - 2, BANK_S);
  for (let a = BANK_A; a < BANK_B; a += CHUNK) {
    const wa = R(a), wb = R(Math.min(BANK_B, a + CHUNK));
    const sa = P(eye, wa, 0, BANK_S)[0], sb = P(eye, wb, 0, BANK_S)[0];
    if (sb < state.camera.x - 60 || sa > state.camera.x + CANVAS_WIDTH + 60) continue;
    const ch = depthChunk(c, eye, BANK_S, `rv-bank-${a}-${tod.key}`, wa, TOP, wb - wa, WS + 6 - TOP, g => {
      g.save(); g.beginPath(); g.rect(wa, TOP, wb - wa, WS + 6 - TOP); g.clip(); paintBank(g, wa, wb); g.restore();
    });
    // (its reflection: the bank upside down under itself, in rows, each row slid by the ripple, darkened)
    const k = Math.abs(c.getTransform().a), rows = Math.ceil((WS - footY) / 2) + 1;
    const srcFoot = (footY - ch.sy) * k;
    c.save(); c.globalAlpha = 0.32;
    for (let i = 0; i < rows; i++) {
      const sy = srcFoot - (i * 2 + 2) * k / 0.55;
      if (sy < 0) break;
      const off = Math.round(Math.sin(i * 0.9 + f * 0.07) * (1 + i * 0.15));
      c.drawImage(ch.cv, 0, sy, ch.cv.width, 2 * k, ch.sx + off, footY + i * 2, ch.dw, 2);
    }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The water between there and here

const waterCols = () => {
  const tod = timeOfDay();
  const deep = hourMix('#2A7A86', '#5A5A6A', '#142240'), sky = skyAt(0.8, tod);
  return { far: mix(deep, sky, 0.45), mid: mix(deep, sky, 0.25), near: deep, sheen: mix('#EAFBFF', tod.sun, 0.25 * tod.skyK) };
};
const drawWaterPlane = (c: Ctx, state: GameState, eye: Eye) => {
  const W = waterCols();
  const a = Math.max(R(DOCK), state.camera.x - 40), b = Math.min(R(PIPE.x2), state.camera.x + CANVAS_WIDTH + 40);
  if (b <= a) return;
  // (banded: the sky in it far off, the river's own color near)
  const bands = [BANK_S, 0.88, 0.91, 0.94, 0.97, 1];
  for (let i = 0; i < bands.length - 1; i++) {
    const [, y0] = P(eye, 0, WS, bands[i]), [, y1] = P(eye, 0, WS, bands[i + 1]);
    const col = mix(W.far, W.near, i / (bands.length - 2));
    box(c, a, y0, b - a, y1 - y0 + 1, col);
    if (i) checker(c, a, Math.floor(y0 / PIX) * PIX - PIX, b - a, PIX, mix(W.far, W.near, (i - 1) / (bands.length - 2)));
  }
};
/** The sheen on it (each streak sliding at its own depth's speed) and the foam along the bank's foot. */
const drawWaterSheen = (c: Ctx, state: GameState, eye: Eye) => {
  const f = state.frame, W = waterCols();
  const a = Math.max(R(DOCK), state.camera.x - 40), b = Math.min(R(FALLS.x), state.camera.x + CANVAS_WIDTH + 40);
  if (b <= a) return;
  c.fillStyle = W.sheen;
  for (let row = 0; row < 7; row++) {
    const s = BANK_S + 0.02 + row * 0.019, [, y] = P(eye, 0, WS, s), step = 60 + row * 14;
    c.globalAlpha = 0.25 + row * 0.07;
    // (streaks drifting downstream, coming and going)
    const drift = (f * (0.2 + row * 0.05)) % step;
    for (let wx = Math.floor((a - step) / step) * step; wx < b + step; wx += step) {
      const ph = hash(wx * 0.01 + row), len = (8 + ph * 18) * s * (0.6 + 0.4 * Math.sin(f * 0.03 + ph * 6));
      if (len < 3) continue;
      const [sx] = P(eye, wx + drift + ph * 30, WS, s);
      c.fillRect(Math.round(sx), Math.round(y), Math.round(len), 1);
    }
  }
  c.globalAlpha = 1;
  // (foam along the bank's foot)
  const [, fy] = P(eye, 0, WS, BANK_S);
  c.fillStyle = 'rgba(236, 248, 250, 0.55)';
  for (let wx = Math.floor(a / 12) * 12; wx < b; wx += 12) { const [sx] = P(eye, wx, WS, BANK_S); const k = Math.sin(wx * 0.3 + f * 0.05); if (k > -0.3) c.fillRect(Math.round(sx), Math.round(fy) + (k > 0.5 ? 1 : 0), 6, 1); }
};

// ---------------------------------------------------------------------------------------------------------------
// The tour's wildlife (animatronic: they move in steps, and you can see how)

/** A shape filled in bands down it (lit at the top, shadowed under: `ramp` darkest first), each seam dithered; inked. */
const banded = (c: Ctx, path: () => void, xa: number, xb: number, ya: number, yb: number, ramp: string[], order = [3, 2, 2, 1, 0]) => {
  c.save(); path(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.clip();
  const n = order.length, h = (yb - ya) / n;
  for (let i = 0; i < n; i++) box(c, xa, ya + i * h, xb - xa, h + 1, ramp[order[i]]);
  for (let i = 1; i < n; i++) checker(c, xa, Math.floor((ya + i * h) / PIX) * PIX, xb - xa, PIX, ramp[order[i - 1]]);
  c.restore();
};
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, rot = 0) => () => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const GRAY = ['#3E3E46', '#5A5A64', '#76767F', '#9494A0', '#B4B4C0'];
/** The elephant: a big animatronic bull at the water's edge, nodding in steps, its ear going, its trunk up to spray. */
const elephant = (c: Ctx, x: number, f: number) => {
  const T = f >> 3, nod = (T % 8) < 4 ? 0 : 3, ear = [0, 3, 6, 3][T % 4], up = (T % 30) < 15;
  const G = GRAY.map(g => farTint(g, 0.3)), fy = WS - 22;
  // (the tail, swishing)
  const tw = (T % 6) < 3 ? -4 : 4;
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 54, fy - 74); c.quadraticCurveTo(x - 64, fy - 54, x - 60 + tw, fy - 40); c.stroke();
  c.strokeStyle = G[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 54, fy - 74); c.quadraticCurveTo(x - 64, fy - 54, x - 60 + tw, fy - 40); c.stroke();
  box(c, x - 63 + tw, fy - 42, 6, 7, G[0]);
  // (the far legs: in shadow)
  for (const lx of [-36, 18]) banded(c, () => { c.beginPath(); c.rect(x + lx, fy - 48, 15, 48); }, x + lx, x + lx + 15, fy - 48, fy, G, [1, 1, 0, 0]);
  // (the body: a barrel, lit along its back, the belly in shade)
  banded(c, ell(c, x - 4, fy - 62, 56, 33), x - 62, x + 54, fy - 96, fy - 28, G, [4, 3, 2, 2, 1, 1, 0]);
  // (wrinkles, the seam where its panels meet, the bolts: it's a robot)
  c.strokeStyle = G[1]; c.lineWidth = 1; c.beginPath();
  for (let k = 0; k < 4; k++) { c.moveTo(x - 46 + k * 6, fy - 82 + k * 2); c.quadraticCurveTo(x - 40 + k * 6, fy - 64, x - 46 + k * 6, fy - 44); }
  c.stroke();
  box(c, x + 20, fy - 92, 1, 46, G[0]); for (let k = 0; k < 4; k++) { box(c, x + 22, fy - 88 + k * 11, 2, 2, G[4]); box(c, x + 22, fy - 87 + k * 11, 2, 1, G[0]); }
  // (the near legs: columns, lit down the left; wrinkles at the knee; toenails)
  for (const lx of [-48, 4]) {
    c.save(); c.beginPath(); c.rect(x + lx, fy - 46, 18, 46); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.clip();
    box(c, x + lx, fy - 46, 18, 46, G[2]); box(c, x + lx, fy - 46, 5, 46, G[3]); box(c, x + lx + 13, fy - 46, 5, 46, G[1]); checker(c, x + lx + 5, fy - 46, 2, 46, G[3]);
    for (const wy of [fy - 26, fy - 22]) box(c, x + lx + 3, wy, 12, 1, G[1]);
    c.restore();
    for (let t = 0; t < 3; t++) { box(c, x + lx + 2 + t * 5, fy - 5, 4, 4, '#E8E0C8'); box(c, x + lx + 2 + t * 5, fy - 5, 4, 1, '#FFFFFF'); }
  }
  // (the neck's piston, showing when the head's nodded down)
  if (nod) { box(c, x + 30, fy - 82, 12, 6, INK); box(c, x + 31, fy - 81, 10, 4, '#B8BCC4'); box(c, x + 31, fy - 81, 10, 1, '#F0F2F4'); }
  // (the head: a dome, the brow, the eye)
  const hx = x + 50, hy = fy - 84 + nod;
  banded(c, ell(c, hx, hy, 24, 23), hx - 26, hx + 26, hy - 24, hy + 24, G, [4, 3, 2, 2, 1]);
  box(c, hx + 4, hy - 8, 7, 2, G[0]); box(c, hx + 6, hy - 5, 4, 4, INK); box(c, hx + 7, hy - 5, 1, 1, '#FFFFFF');
  // (the tusk)
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 8, hy + 10); c.quadraticCurveTo(hx + 30, hy + 26, hx + 38, hy + 8); c.lineTo(hx + 34, hy + 12); c.quadraticCurveTo(hx + 26, hy + 18, hx + 8, hy + 16); c.fill();
  c.fillStyle = '#EDE6D0'; c.beginPath(); c.moveTo(hx + 10, hy + 11); c.quadraticCurveTo(hx + 30, hy + 24, hx + 36, hy + 10); c.lineTo(hx + 33, hy + 12); c.quadraticCurveTo(hx + 26, hy + 16, hx + 10, hy + 15); c.fill();
  box(c, hx + 16, hy + 13, 8, 1, '#FFFFFF');
  // (the trunk: down and curled, or up and spraying; ringed)
  const tipX = hx + (up ? 40 : 30), tipY = up ? hy - 46 : hy + 34;
  for (let t = 0; t <= 1.001; t += 0.07) {
    const qx = (1 - t) * (1 - t) * (hx + 18) + 2 * t * (1 - t) * (hx + 42) + t * t * tipX, qy = (1 - t) * (1 - t) * (hy + 6) + 2 * t * (1 - t) * (up ? hy + 6 : hy + 16) + t * t * tipY;
    const r = Math.round(8 - t * 4);
    box(c, qx - r - 1, qy - r - 1, r * 2 + 2, r * 2 + 2, INK);
  }
  for (let t = 0; t <= 1.001; t += 0.07) {
    const qx = (1 - t) * (1 - t) * (hx + 18) + 2 * t * (1 - t) * (hx + 42) + t * t * tipX, qy = (1 - t) * (1 - t) * (hy + 6) + 2 * t * (1 - t) * (up ? hy + 6 : hy + 16) + t * t * tipY;
    const r = Math.round(8 - t * 4), i = Math.round(t / 0.07);
    box(c, qx - r, qy - r, r * 2, r * 2, i % 2 ? G[2] : G[3]); box(c, qx - r, qy - r, 2, r * 2, G[3]); box(c, qx + r - 2, qy - r, 2, r * 2, G[1]);
  }
  // (the ear: a big flap over the side of the head, flapping in steps; pink inside)
  banded(c, ell(c, hx - 18, hy + 4, 16 + ear, 22, -0.15), hx - 40, hx + 4, hy - 20, hy + 28, G, [3, 2, 2, 1, 1]);
  c.fillStyle = farTint('#B88A90', 0.3); c.beginPath(); c.ellipse(hx - 17, hy + 5, 9 + ear * 0.6, 14, -0.15, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#D8A8B0', 0.3); c.beginPath(); c.ellipse(hx - 19, hy + 1, 4 + ear * 0.3, 6, -0.15, 0, Math.PI * 2); c.fill();
  // (the spray: an arc of water off the tip, down onto the river)
  if (up) for (let k = 0; k < 16; k++) {
    const t = ((f * 0.6 + k * 4) % 56) / 56, dx = t * 76, dy = -34 * Math.sin(t * Math.PI) + t * t * 70;
    box(c, tipX + dx, tipY + dy, k % 4 ? 3 : 2, k % 4 ? 3 : 2, k % 3 ? '#CDEFFC' : '#FFFFFF');
  }
};
const hippo = (c: Ctx, x: number, f: number, waterY: number) => {
  const T = f >> 4, bob = (T % 2) * 3, open = (T % 6) < 2 ? 12 : 0, y = waterY - 6 + bob;
  const H = ['#3A2E44', '#5A4A66', '#7A688A', '#9A88AA', '#BCAACA'].map(g => farTint(g, 0.25));
  // (the rod it's on: you can see it)
  box(c, x - 3, y, 6, 30, INK); box(c, x - 2, y, 4, 30, '#8A8E96'); box(c, x - 2, y, 1, 30, '#C8CCD2');
  banded(c, () => { c.beginPath(); c.ellipse(x, y, 40, 20, 0, Math.PI, 0); c.closePath(); }, x - 42, x + 42, y - 21, y + 1, H, [4, 3, 2, 1]);
  for (let k = 0; k < 3; k++) box(c, x - 20 + k * 14, y - 12 + (k % 2) * 3, 6, 1, H[1]);
  // (the head: the jaw hinged open, the teeth, the little ears)
  const hx = x + 32, hy = y - 8;
  banded(c, () => { c.beginPath(); c.roundRect(hx, hy - 12 - open, 30, 13, 4); }, hx, hx + 30, hy - 12 - open, hy + 1 - open, H, [4, 3, 2, 1]);
  banded(c, () => { c.beginPath(); c.roundRect(hx, hy + 1, 30, 7, 3); }, hx, hx + 30, hy + 1, hy + 8, H, [2, 1, 0]);
  box(c, hx + 2, hy - 2 - open, 26, 1, H[0]);
  if (open) { box(c, hx + 2, hy - open + 1, 26, open, '#8A2A3A'); box(c, hx + 6, hy - open + 1, 3, 4, '#F4F0E0'); box(c, hx + 22, hy - open + 1, 3, 4, '#F4F0E0'); box(c, hx + 6, hy - 3, 3, 3, '#F4F0E0'); }
  box(c, hx + 2, hy - 18 - open, 5, 5, H[1]); box(c, hx + 2, hy - 16 - open, 3, 3, INK);
  box(c, hx + 24, hy - 9 - open, 2, 2, INK); box(c, hx + 18, hy - 15 - open, 4, 6, H[0]);
  // (the ripples round it)
  c.fillStyle = 'rgba(230, 248, 255, 0.6)';
  for (let k = 0; k < 2; k++) { const r = 44 + ((f + k * 30) % 60) * 0.5; c.fillRect(x - r, waterY + 2 + k, 10, 1); c.fillRect(x + r - 6, waterY + 2 + k, 10, 1); }
};
const gorilla = (c: Ctx, x: number, f: number, i: number) => {
  const T = (f >> 4) + i * 2, sw = (T % 2) * 5, fy = WS - 22 - (i === 1 ? 6 : 0);
  const F = ['#141214', '#24202A', '#363040', '#4A4458', '#625C70'].map(g => farTint(g, 0.25)), skin = farTint('#6A6070', 0.25);
  // (legs, body, arms swinging (one at a time), head: the fur banded, ragged at the edges, the suit sagging)
  for (const lx of [-12, 2]) { box(c, x + lx - 1, fy - 26, 12, 26, INK); box(c, x + lx, fy - 25, 10, 25, F[1]); box(c, x + lx, fy - 25, 3, 25, F[2]); for (let y = fy - 22; y < fy; y += 6) box(c, x + lx + 9, y, 2, 3, F[0]); box(c, x + lx - 1, fy - 3, 12, 3, skin); }
  banded(c, ell(c, x, fy - 46, 21, 25), x - 22, x + 22, fy - 72, fy - 20, F, [4, 3, 2, 2, 1, 0]);
  c.save(); ell(c, x, fy - 46, 21, 25)(); c.clip();
  for (let y = fy - 68; y < fy - 22; y += 5) for (let k = -18; k < 18; k += 6) box(c, x + k + ((y >> 2) % 2) * 3, y, 2, 3, F[1]);
  c.restore();
  // (the chest: the leather of it, molded in two pecs, lit up the left)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + 3, fy - 44, 10, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = skin; c.beginPath(); c.ellipse(x + 3, fy - 44, 9, 12, 0, 0, Math.PI * 2); c.fill();
  box(c, x - 3, fy - 52, 5, 6, mix(skin, '#FFFFFF', 0.15)); box(c, x + 3, fy - 50, 1, 10, mix(skin, INK, 0.3));
  for (const [ax, d] of [[-24, sw], [16, 5 - sw]] as const) {
    box(c, x + ax - 1, fy - 62 + d, 11, 46, INK); box(c, x + ax, fy - 61 + d, 9, 44, F[2]); box(c, x + ax, fy - 61 + d, 3, 44, F[3]); box(c, x + ax + 7, fy - 61 + d, 2, 44, F[1]);
    for (let y = fy - 56 + d; y < fy - 22 + d; y += 7) { box(c, x + ax - 2, y, 2, 3, F[2]); box(c, x + ax + 9, y + 3, 2, 3, F[1]); }
    box(c, x + ax - 1, fy - 18 + d, 11, 6, skin); for (let k = 0; k < 3; k++) box(c, x + ax + k * 3, fy - 13 + d, 2, 2, mix(skin, INK, 0.35));
  }
  const hy = fy - 78;
  c.fillStyle = INK; c.beginPath(); c.arc(x, hy, 13, 0, Math.PI * 2); c.fill();
  banded(c, () => { c.beginPath(); c.arc(x, hy, 12, 0, Math.PI * 2); }, x - 13, x + 13, hy - 12, hy + 12, F, [4, 3, 2, 1]);
  box(c, x - 4, hy - 13, 8, 4, F[3]);
  box(c, x - 6, hy - 3, 13, 11, skin); box(c, x - 6, hy - 3, 13, 2, mix(skin, '#FFFFFF', 0.15)); box(c, x - 7, hy - 5, 15, 3, F[0]);
  box(c, x - 4, hy - 1, 3, 2, INK); box(c, x + 2, hy - 1, 3, 2, INK); box(c, x - 3, hy + 1, 1, 1, '#FFFFFF');
  box(c, x - 2, hy + 2, 2, 2, mix(skin, INK, 0.4)); box(c, x + 1, hy + 2, 2, 2, mix(skin, INK, 0.4)); box(c, x - 3, hy + 5, 7, 1, INK);
  // (the costume's zipper, where it's come undone at the neck; somebody's skin showing)
  box(c, x - 1, fy - 70, 2, 30, '#B8B8C0'); box(c, x - 2, fy - 72, 4, 4, farTint('#E8B890', 0.25));
};
/** An exhibit placard on a stake (its name: the tour's joke). */
const placard = (c: Ctx, x: number, name: string, y = WS - 24) => {
  box(c, x - 2, y - 26, 4, 26, INK); box(c, x - 1, y - 26, 2, 26, '#8A6A40');
  sign(c, x - 24, y - 42, 48, 16, '#E8DCB8', '', '#000', 5, '#5A3A1A');
  signAt(c, name, x, y - 31, 5, carved(5, '#3A1A08', '#F8F0D8', x));
};
/** Gerald: Artie's best friend, a rock. A proper one: courses of it stepped back, lit up its left, moss over its crown,
 *  lichen in spots, a crack, the river's tide line round its foot. */
const gerald = (c: Ctx, gx: number) => {
  const gy = WS - 22, rr = rampOf(farTint('#6A665E', 0.3)), moss = rampOf(farTint('#4A6A2A', 0.3));
  const shape = () => { c.beginPath(); c.moveTo(gx - 50, gy); c.lineTo(gx - 46, gy - 22); c.lineTo(gx - 34, gy - 40); c.lineTo(gx - 12, gy - 50); c.lineTo(gx + 14, gy - 48); c.lineTo(gx + 36, gy - 36); c.lineTo(gx + 48, gy - 18); c.lineTo(gx + 52, gy); c.closePath(); };
  banded(c, shape, gx - 54, gx + 54, gy - 52, gy, rr, [4, 3, 3, 2, 2, 1, 0]);
  c.save(); shape(); c.clip();
  // (its facets: the left faces lit, the right in shade, a seam of shadow between)
  for (const [x, y, w, h] of [[-40, -36, 18, 14], [-20, -46, 22, 12], [-44, -18, 20, 12]] as const) { box(c, gx + x, gy + y, w, h, rr[3]); box(c, gx + x, gy + y, w, 2, rr[4]); }
  for (const [x, y, w, h] of [[18, -40, 20, 16], [30, -20, 20, 18], [4, -24, 16, 12]] as const) { box(c, gx + x, gy + y, w, h, rr[1]); checker(c, gx + x, gy + y, 2, h, rr[2]); }
  for (let y = -44; y < -4; y += 2) box(c, gx + 2 + Math.round(Math.sin(y * 0.3) * 3), gy + y, 2, 2, rr[0]);
  // (the moss over its crown, dithered off down its sides; the lichen, the tide line)
  box(c, gx - 34, gy - 52, 64, 8, moss[2]); box(c, gx - 30, gy - 52, 40, 3, moss[3]); checker(c, gx - 40, gy - 44, 78, 4, moss[2]); checker(c, gx - 44, gy - 40, 86, 2, moss[1], 1);
  for (const [x, y] of [[-30, -26], [-8, -34], [22, -28], [-38, -10], [12, -14]]) { box(c, gx + x, gy + y, 4, 3, farTint('#C8C070', 0.3)); box(c, gx + x + 1, gy + y + 1, 2, 1, farTint('#E8E0A0', 0.3)); }
  box(c, gx - 52, gy - 6, 106, 6, rr[0]); checker(c, gx - 52, gy - 8, 106, 2, rr[0]);
  c.restore();
};
const drawShow = (c: Ctx, state: GameState, eye: Eye) => {
  const f = state.frame;
  const [, waterY] = P(eye, 0, WS, 0.91);
  // (the crocodiles, the party up the tree, Trader Stan's: gags.ts)
  const gags: { croc?: number; party?: number; stan?: number } = {};
  if (seen(state, P(eye, R(720), 0, BANK_S)[0], P(eye, R(1100), 0, BANK_S)[0])) gags.croc = R(860);
  if (seen(state, P(eye, R(1170), 0, BANK_S)[0], P(eye, R(1430), 0, BANK_S)[0])) gags.party = R(1300);
  if (seen(state, P(eye, R(1630), 0, BANK_S)[0], P(eye, R(1890), 0, BANK_S)[0])) gags.stan = R(1760);
  if (gags.croc !== undefined || gags.party !== undefined || gags.stan !== undefined) { atDepth(c, eye, BANK_S); drawGags(c, f, gags); c.restore(); }
  if (seen(state, R(1900), R(2200))) { atDepth(c, eye, BANK_S); elephant(c, R(2050), f); c.restore(); }
  if (seen(state, R(2280), R(2480))) { const [hx] = P(eye, R(2380), 0, 0.91); hippo(c, hx, f, waterY); }
  if (seen(state, R(2560), R(2860))) {
    atDepth(c, eye, BANK_S);
    for (let i = 0; i < 3; i++) gorilla(c, R(2640 + i * 70), f, i);
    placard(c, R(2710), 'DAVE', WS - 2);
    c.restore();
  }
  if (seen(state, R(3120), R(3320))) {
    atDepth(c, eye, BANK_S);
    const gx = R(3200);
    gerald(c, gx);
    placard(c, gx + 64, 'GERALD', WS - 2);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The dock

const drawDock = (c: Ctx, state: GameState, eye: Eye) => {
  const f = state.frame, a = x0 - 200, b = R(DOCK);
  // (under it: the stone of the bank, in courses)
  c.fillStyle = tilePattern(c, 'rv-dockstone', 48, 24, g => {
    const r = rampOf('#5A5650');
    g.fillStyle = r[1]; g.fillRect(0, 0, 48, 24);
    for (const [x, y, w] of [[0, 0, 22], [24, 0, 22], [12, 12, 22], [36, 12, 12], [0, 12, 10]] as const) { g.fillStyle = r[2]; g.fillRect(x + 1, y + 1, w, 10); g.fillStyle = r[3]; g.fillRect(x + 1, y + 1, w, 2); }
  });
  c.fillRect(a, GY + 10, b - a, 1200);
  // The boards going back (the near edge lit: he's on it), the river past them
  const pr = rampOf(PLANK);
  quad(c, P(eye, a, GY, 1), P(eye, b, GY, 1), P(eye, b, GY, BANK_S), P(eye, a, GY, BANK_S), pr[2]);
  c.strokeStyle = pr[1]; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(a / 28) * 28; x <= b; x += 28) { const p0 = P(eye, x, GY, 1), p1 = P(eye, x, GY, BANK_S); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); }
  c.stroke();
  for (const s of [0.96, 0.92, 0.89]) seg(c, P(eye, a, GY, s), P(eye, b, GY, s), pr[1], 1);
  // (the far edge's bollards, a coil of rope)
  for (const x of [R(60), R(260)]) { const [bx, by] = P(eye, x, GY, BANK_S + 0.01); box(c, bx - 4, by - 10, 9, 10, INK); box(c, bx - 3, by - 9, 7, 9, '#3A3A40'); box(c, bx - 3, by - 9, 7, 2, '#7A7A84'); }
  // The station: log posts, a thatched roof going back, JUNGLE CRUISE hung under it
  atDepth(c, eye, 0.9);
  for (const x of [R(-120), R(110), R(330)]) logPost(c, x - 7, GY - 230, GY, 14);
  c.restore();
  thatchRoof(c, eye, R(-160), R(370), 0.99, GY - 232, 0.88, GY - 320, 40, STRAW, 10);
  fringe(c, R(-160), R(370), GY - 234, 16);
  for (const x of [R(-140), R(350)]) logPost(c, x - 8, GY - 232, GY, 16);
  box(c, R(130), GY - 222, 1, 18, '#8A7048'); box(c, R(250), GY - 222, 1, 18, '#8A7048');
  sign(c, R(112), GY - 206, 156, 28, '#D8B878', '', '#000', 8, '#6A3A1A');
  signAt(c, 'JUNGLE CRUISE', R(190), GY - 188, 8, carved({ sx: 1, sy: 2 }, '#5A1A0A', '#F0D8A0', 3));
  // (BOARDING, a bell on a bracket, a life ring on a post at the edge)
  sign(c, R(150), GY - 168, 80, 14, '#2E4A2A', '', '#000', 5, '#6A4A2A');
  signAt(c, 'BOARDING', R(190), GY - 157, 5, plank(5, '#F0D890', undefined, undefined, 8));
  {
    const bx = R(350) + 10, by = GY - 150, swing = Math.round(Math.sin(f * 0.04) * 1);
    box(c, bx - 10, by - 4, 14, 3, '#3A3A3A');
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 7 + swing, by); c.lineTo(bx + 7 + swing, by); c.lineTo(bx + 10 + swing, by + 16); c.lineTo(bx - 10 + swing, by + 16); c.closePath(); c.fill();
    c.fillStyle = '#C89A2A'; c.beginPath(); c.moveTo(bx - 6 + swing, by + 1); c.lineTo(bx + 6 + swing, by + 1); c.lineTo(bx + 9 + swing, by + 15); c.lineTo(bx - 9 + swing, by + 15); c.closePath(); c.fill();
    box(c, bx - 5 + swing, by + 2, 3, 12, '#F0D070');
  }
  {
    const rx = R(DOCK - 18), ry = GY - 70;
    box(c, rx - 3, ry - 20, 6, 90, INK); box(c, rx - 2, ry - 20, 4, 90, '#7A5A3A');
    c.fillStyle = INK; c.beginPath(); c.arc(rx, ry, 12, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#F4F0E6' : '#D2402E'; c.beginPath(); c.moveTo(rx, ry); c.arc(rx, ry, 11, (k * Math.PI) / 4, ((k + 1) * Math.PI) / 4); c.fill(); }
    c.fillStyle = '#5A4A3A'; c.beginPath(); c.arc(rx, ry, 5, 0, Math.PI * 2); c.fill();
  }
  // (the dock's face, down to the water: a beam, pilings into it)
  box(c, a, GY - 1, b - a, 3, '#E8C890');
  box(c, a, GY + 2, b - a, 10, INK); box(c, a, GY + 3, b - a, 8, pr[1]); box(c, a, GY + 3, b - a, 2, pr[3]);
  for (let x = 20; x < DOCK; x += 70) { box(c, R(x) - 1, GY + 11, 12, WS + 200 - GY, INK); box(c, R(x), GY + 11, 10, WS + 200 - GY, '#6A4A2A'); box(c, R(x), GY + 11, 3, WS + 200 - GY, '#8A6A40'); }
  // The lantern posts at the edge
  for (const x of [R(30), R(DOCK - 40)]) {
    const lamps = timeOfDay().lamps;
    bamboo(c, x - 3, GY - 110, GY, 6);
    box(c, x - 5, GY - 124, 11, 14, INK); box(c, x - 4, GY - 123, 9, 12, lamps > 0.15 ? '#FFC870' : '#9A8A60'); box(c, x - 4, GY - 123, 9, 2, '#3A3A3A');
    if (lamps > 0.15) steppedGlow(c, x, GY - 117, 50, '#FFC060', 0.22 * lamps, 0, 4);
  }
  bendFloor(c, eye, GY, GY, GY + 12, a, b);
};

// ---------------------------------------------------------------------------------------------------------------

/** `jolt`: a lurch (the engine coughing), px; `dry`: out of gas (the cowl's warning light blinking). */
export interface BoatNow { x: number; v: number; on: boolean; jolt?: number; dry?: boolean }

/** Behind everything (world space), above the waterline: the bank, the water across, the show, the dock. */
export const drawSurfaceBack = (c: Ctx, state: GameState) => {
  if (!seen(state, x0 - 200, R(FALLS.x + 200))) return;
  const eye = surfEye(state);
  drawWaterPlane(c, state, eye);
  drawBank(c, state, eye);
  drawWaterSheen(c, state, eye);
  drawShow(c, state, eye);
  if (seen(state, x0 - 300, R(DOCK + 100))) drawDock(c, state, eye);
};

/** The boat (its hull, its awning, its wake on the water; Artie's drawn over it by draw.ts). */
export const drawSurfaceBoat = (c: Ctx, state: GameState, b: BoatNow) => {
  const f = state.frame, eye = surfEye(state);
  // (the wake: foam peeling off the stern, spreading back on the water; the bow wave)
  if (b.v > 0.05) {
    c.fillStyle = 'rgba(240, 250, 252, 0.75)';
    for (let k = 0; k < 16; k++) {
      const t = ((f * b.v * 0.6 + k * 12) % 190) / 190, wx = b.x - 30 - t * 190, spread = t * 0.1;
      const [sx, sy] = P(eye, wx, WS, 1 - spread);
      c.fillRect(Math.round(sx), Math.round(sy) - 1, Math.round(10 * (1 - t)) + 2, 1);
      c.fillRect(Math.round(wx), WS - 1 - Math.round(t * 2), Math.round(8 * (1 - t)) + 2, 2);
    }
    for (let k = 0; k < 4; k++) box(c, b.x + BOAT.w + 6 + k * 4, WS - 3 - (k % 2) * 2 - Math.round(Math.sin(f * 0.3 + k)), 4, 2, '#F4FCFF');
  }
  drawLaunch(c, b.x, BOAT.deck, f, { rock: (b.v > 0.05 ? Math.round(Math.sin(f * 0.12)) : Math.round(Math.sin(f * 0.04) * 0.6)) + (b.jolt ?? 0), dry: b.dry });
};

/** The falls: a sheet of water, its stripes cycling down; its spray boiling at the foot; the mist off it. */
let fallsTile: HTMLCanvasElement | null = null;
const fallsArt = () => {
  if (fallsTile) return fallsTile;
  const cv = document.createElement('canvas'); cv.width = 48; cv.height = 64;
  const g = cv.getContext('2d')!;
  const cols = ['#9AD6EC', '#C8ECF8', '#F2FCFF', '#7CC4E0', '#B4E2F4'];
  for (let x = 0; x < 48; x += 4) for (let y = 0; y < 64; y += 4) {
    const k = (Math.floor(y / 8) + Math.floor(hash(x * 0.37) * 5)) % cols.length;
    g.fillStyle = cols[k]; g.fillRect(x, y, 4, 4);
  }
  for (let x = 0; x < 48; x += 8) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x + Math.floor(hash(x) * 4), Math.floor(hash(x * 2) * 64), 2, 10); }
  fallsTile = cv;
  return cv;
};
export const drawSurfaceFront = (c: Ctx, state: GameState) => {
  if (!seen(state, x0 - 200, R(PIPE.x2))) return;
  const f = state.frame;
  // The waterline: a lit line, foam riding it (only where it's open water)
  const a = Math.max(R(DOCK), state.camera.x - 20), b = Math.min(R(PIPE.x2), state.camera.x + CANVAS_WIDTH + 20);
  for (let x = a - (a % 8); x < b; x += 8) {
    if (roofAt(x - x0) > WS) continue;
    const y = WS - 1 + Math.round(Math.sin(x * 0.05 + f * 0.08) * 1.5);
    c.fillStyle = 'rgba(200, 238, 252, 0.85)'; c.fillRect(x, y, 8, 2);
    if (Math.sin(x * 0.13 + f * 0.05) > 0.4) { c.fillStyle = '#F4FCFF'; c.fillRect(x + 1, y - 1, 5, 1); }
  }
  // The backside of water
  if (seen(state, R(FALLS.x - 60), R(FALLS.x + 100))) {
    const fx = R(FALLS.x - 36), fw = 44, top = state.camera.y - 20;
    const tile = fallsArt();
    c.save();
    c.fillStyle = c.createPattern(tile, 'repeat')!;
    const off = (f * 3) % 64;
    c.translate(fx, off); c.globalAlpha = 0.82;
    c.fillRect(0, top - off, fw, WS + 4 - top);
    c.restore();
    // (its edges: lit on the left, a shadow down the right, the lip of the drop wobbling)
    box(c, fx - 2, top, 2, WS - top, 'rgba(255,255,255,0.75)');
    box(c, fx + fw, top, 3, WS - top, 'rgba(20, 60, 90, 0.35)');
    for (let y = top - (top % 6); y < WS; y += 6) box(c, fx - 3 + Math.round(Math.sin(y * 0.2 + f * 0.3) * 1.5), y, 2, 3, '#F4FCFF');
    // (the foot: boiling foam, spray in blobs, mist drifting up)
    for (let k = 0; k < 7; k++) {
      const t = ((f + k * 17) % 60) / 60, sx = fx + fw / 2 + (k - 3) * 9 + Math.sin(f * 0.1 + k) * 4;
      pixelBlob(c, sx, WS - 6 - t * 26, 7 + t * 8, 5 + t * 5, `rgba(240, 250, 255, ${(0.7 * (1 - t)).toFixed(2)})`);
    }
    box(c, fx - 30, WS - 3, fw + 60, 4, '#F4FCFF');
    for (let k = 0; k < 6; k++) box(c, fx - 26 + ((k * 23 + f) % (fw + 52)), WS - 6 - (k % 3), 6, 2, 'rgba(255,255,255,0.8)');
  }
};
