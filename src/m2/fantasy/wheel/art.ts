// The fairy wheel, drawn (crude first pass: flat colors in a few steps, readable shapes). The wheel itself is scenery
// (its A-frame, its rim and spokes, the flower hub and its heart-shaped PA horn: dimmed, nothing on it's stood on); the
// gondolas are what's stood on (each one's floor a lit lip, bright against the wheel): a mushroom-cap canopy with
// fairy wings and fairy lights, the name of whoever's in it on a gilt plaque under the cap, a petal back, a bench, the
// floor, a flower bowl under it. What's thrown; the plaza (the arch's sign, the ticket booth, the queue), the gates.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { groundBox } from '../section';
import { box, mix, INK, gilt, storySign, fairySky, onScreen, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import { X, Y, HUB, R, N, HANG, FLOOR_W, x0, x1 } from './layout';
import type { Item } from './lines';

const CAPS = ['#F49AC8', '#9EE6C8', '#C8A8F4', '#FFC8A0'];
/** (the wheel's own colors, dimmed: it's scenery) */
const dim = (col: string) => mix(col, timeOfDay().haze ?? '#8090B0', 0.35);

// ---------------------------------------------------------------------------------------------------------------
// The sky: as the rest of the land's, lifted as he climbs (the hills sink out of the bottom of the picture)

export const drawWheelBackdrop = (c: Ctx, state: GameState) => {
  const lift = Math.max(0, Math.min(320, (GY - 560 - state.camera.y) * 0.28));
  if (lift > 0) drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: 430, sun: [620, 120], moon: [170, 90] });
  c.save(); c.translate(0, lift);
  fairySky(c, state, MONUMENT_AT.wheel);
  c.restore();
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The wheel

/** The wheel's frame, rim, spokes, lights and hub (behind the gondolas). `ang` the wheel's turn. */
export const drawWheel = (c: Ctx, state: GameState, ang: number) => {
  const hx = X(HUB.x), hy = Y(HUB.h), f = state.frame;
  if (!onScreen(state, hx - R - 200, hx + R + 200)) return;
  // (the A-frame: two lattice legs down to the flower beds, cross-braced)
  for (const s of [-1, 1]) {
    const fx = hx + s * 480;
    c.strokeStyle = INK; c.lineWidth = 18; c.beginPath(); c.moveTo(fx, GY); c.lineTo(hx + s * 30, hy); c.stroke();
    c.strokeStyle = dim('#B49AD8'); c.lineWidth = 14; c.stroke();
    c.strokeStyle = dim('#8A72B4'); c.lineWidth = 3;
    for (let k = 1; k < 8; k++) { const t = k / 8, ax = fx + (hx + s * 30 - fx) * t, ay = GY + (hy - GY) * t; c.beginPath(); c.moveTo(ax - 6, ay); c.lineTo(ax + 6, ay - 40); c.stroke(); }
  }
  c.strokeStyle = dim('#8A72B4'); c.lineWidth = 6; c.beginPath(); c.moveTo(hx - 300, Y(HUB.h * 0.38)); c.lineTo(hx + 300, Y(HUB.h * 0.38)); c.stroke();
  // (the spokes, pink and mint in turn)
  for (let k = 0; k < N; k++) {
    const a = ang + (k * Math.PI * 2) / N, ex = hx + Math.cos(a) * R, ey = hy + Math.sin(a) * R;
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = dim(k % 2 ? '#F49AC8' : '#9EE6C8'); c.lineWidth = 3; c.stroke();
  }
  // (the rim: a double ring, laced between)
  for (const [r, w, col] of [[R, 10, '#E8B4F0'], [R - 70, 6, '#C8A8F4']] as [number, number, string][]) {
    c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = dim(col); c.lineWidth = w; c.stroke();
  }
  c.strokeStyle = dim('#F4D0F8'); c.lineWidth = 2;
  for (let k = 0; k < N * 2; k++) { const a = ang + (k * Math.PI) / N; c.beginPath(); c.moveTo(hx + Math.cos(a) * (R - 70), hy + Math.sin(a) * (R - 70)); c.lineTo(hx + Math.cos(a + Math.PI / N) * R, hy + Math.sin(a + Math.PI / N) * R); c.stroke(); }
  // (the pixie lights round the rim: soft, twinkling)
  const cols = ['#FEF08A', '#A5F3FC', '#F9A8D4', '#FFFFFF'];
  for (let k = 0; k < 96; k++) {
    const a = ang + (k * Math.PI * 2) / 96, lx = hx + Math.cos(a) * (R + 9), ly = hy + Math.sin(a) * (R + 9);
    const on = (k * 7 + Math.floor(f / 10)) % 5 !== 0;
    box(c, lx - 2, ly - 2, 4, 4, on ? cols[k % 4] : mix(cols[k % 4], '#000000', 0.5));
  }
  // (the hub: a big flower, its petals turning with it; a gold middle; the heart-shaped PA horn hung under it)
  for (let k = 0; k < 8; k++) {
    const a = ang * 1 + (k * Math.PI) / 4;
    c.save(); c.translate(hx + Math.cos(a) * 44, hy + Math.sin(a) * 44); c.rotate(a);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = dim(k % 2 ? '#F49AC8' : '#F8C4E0'); c.beginPath(); c.ellipse(0, 0, 34, 16, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 32, 0, Math.PI * 2); c.fill();
  c.fillStyle = dim('#F6D365'); c.beginPath(); c.arc(hx, hy, 29, 0, Math.PI * 2); c.fill();
  c.fillStyle = dim('#E0AE3A'); c.beginPath(); c.arc(hx + 4, hy + 4, 18, 0, Math.PI * 2); c.fill();
  drawHubHorn(c, hx, hy + 40, false, f);
};

/** The PA horn under the hub: a brass horn out of a pink heart; rings off it while she talks. */
export const drawHubHorn = (c: Ctx, x: number, y: number, talking: boolean, f: number) => {
  const j = talking && f % 4 < 2 ? 1 : 0;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, y + 6); c.bezierCurveTo(x - 26, y - 14, x - 14, y - 30, x, y - 16); c.bezierCurveTo(x + 14, y - 30, x + 26, y - 14, x, y + 6); c.fill();
  c.fillStyle = '#F472B6'; c.beginPath(); c.moveTo(x, y + 3); c.bezierCurveTo(x - 22, y - 13, x - 12, y - 26, x, y - 13); c.bezierCurveTo(x + 12, y - 26, x + 22, y - 13, x, y + 3); c.fill();
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 30, y + 26 + j); c.lineTo(x - 14, y + 34 + j); c.lineTo(x + 4, y + 4); c.closePath(); c.fill();
  c.fillStyle = '#E0AE3A'; c.beginPath(); c.moveTo(x - 3, y + 2); c.lineTo(x - 28, y + 26 + j); c.lineTo(x - 15, y + 32 + j); c.lineTo(x + 2, y + 5); c.closePath(); c.fill();
  if (talking) for (let k = 0; k < 3; k++) { const r = 8 + ((f * 1.5 + k * 12) % 36); c.strokeStyle = `rgba(244, 114, 182, ${Math.max(0, 1 - r / 44)})`; c.lineWidth = 2; c.beginPath(); c.arc(x - 22, y + 32, r, 1.6, 3.2); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The gondolas

/** A gondola's back half (behind whoever's in it): the hanger, the cap, its wings and lights, the posts, the petal
 *  back, the bench (on `side`). (fx, fy) the middle of its floor. `name`: the plaque under the cap. */
export const drawCartBack = (c: Ctx, f: number, k: number, fx: number, fy: number, side: 1 | -1, name: string | null) => {
  const cap = CAPS[k % CAPS.length], py = fy - HANG;
  // (the hanger off the rim, the pivot's bolt)
  box(c, fx - 3, py, 6, 22, INK); box(c, fx - 2, py, 4, 22, '#B8A8D8');
  c.fillStyle = INK; c.beginPath(); c.arc(fx, py, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E0AE3A'; c.beginPath(); c.arc(fx, py, 4, 0, Math.PI * 2); c.fill();
  // (the wings, either side of the cap: gossamer, flapping slow)
  const flap = Math.sin(f * 0.08 + k) * 0.25;
  for (const s of [-1, 1]) {
    c.save(); c.translate(fx + s * 54, fy - 92); c.rotate(s * (-0.5 + flap)); c.scale(s, 1);
    c.fillStyle = 'rgba(26,16,40,0.8)'; c.beginPath(); c.ellipse(16, -8, 20, 10, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(220,208,255,0.75)'; c.beginPath(); c.ellipse(16, -8, 18, 8, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(12, -10, 8, 3, -0.4, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  // (the petal back)
  c.fillStyle = INK; c.beginPath(); c.moveTo(fx - 50, fy); c.quadraticCurveTo(fx - 50, fy - 60, fx, fy - 66); c.quadraticCurveTo(fx + 50, fy - 60, fx + 50, fy); c.closePath(); c.fill();
  c.fillStyle = mix(cap, '#FFFFFF', 0.45); c.beginPath(); c.moveTo(fx - 48, fy); c.quadraticCurveTo(fx - 48, fy - 58, fx, fy - 64); c.quadraticCurveTo(fx + 48, fy - 58, fx + 48, fy); c.closePath(); c.fill();
  for (let p = -2; p <= 2; p++) { c.strokeStyle = mix(cap, '#000000', 0.12); c.lineWidth = 1; c.beginPath(); c.moveTo(fx + p * 18, fy - 2); c.quadraticCurveTo(fx + p * 16, fy - 40, fx + p * 6, fy - 58); c.stroke(); }
  // (the posts: thin stalks, the cap on them)
  for (const s of [-1, 1]) { box(c, fx + s * 48 - 3, fy - 90, 6, 90, INK); box(c, fx + s * 48 - 2, fy - 90, 4, 90, '#FFF0D8'); }
  // (the cap: a toadstool's, spotted; the underside band and the plaque)
  c.fillStyle = INK; c.beginPath(); c.ellipse(fx, fy - 90, 64, 26, 0, Math.PI, 0); c.fill();
  c.fillStyle = cap; c.beginPath(); c.ellipse(fx, fy - 90, 62, 24, 0, Math.PI, 0); c.fill();
  c.fillStyle = mix(cap, '#FFFFFF', 0.4); c.beginPath(); c.ellipse(fx - 14, fy - 104, 26, 7, 0, Math.PI, 0); c.fill();
  for (const [sx, sy, r] of [[-34, -98, 5], [-6, -108, 4], [22, -100, 6], [44, -94, 3]]) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(fx + sx, fy + sy, r, 0, Math.PI * 2); c.fill(); }
  box(c, fx - 62, fy - 91, 124, 8, INK); box(c, fx - 60, fy - 90, 120, 6, mix(cap, '#000000', 0.25));
  if (name) {
    box(c, fx - 50, fy - 88, 100, 13, INK); box(c, fx - 49, fy - 87, 98, 11, '#4A1A5A');
    signText(c, name, fx, fy - 78, gilt(1));
  }
  // (fairy lights along the cap's rim)
  for (let i = 0; i < 7; i++) box(c, fx - 54 + i * 18, fy - 84, 3, 3, (i + Math.floor(f / 12) + k) % 3 ? '#FEF08A' : '#A5F3FC');
  // (the bench, at his end)
  box(c, fx + side * 28 - 18, fy - 24, 36, 24, INK); box(c, fx + side * 28 - 17, fy - 23, 34, 6, '#FFE4F2'); box(c, fx + side * 28 - 17, fy - 17, 34, 17, mix(cap, '#000000', 0.2));
};

/** A gondola's floor and the flower bowl under it (in front of whoever's sat in it): the floor's top lit (it's stood on). */
export const drawCartFloor = (c: Ctx, k: number, fx: number, fy: number) => {
  const cap = CAPS[k % CAPS.length], w = FLOOR_W;
  // (the bowl: petals scalloped round under the floor)
  c.fillStyle = INK; c.beginPath(); c.moveTo(fx - w / 2 - 2, fy + 6); c.quadraticCurveTo(fx, fy + 38, fx + w / 2 + 2, fy + 6); c.closePath(); c.fill();
  c.fillStyle = mix(cap, '#000000', 0.12); c.beginPath(); c.moveTo(fx - w / 2, fy + 7); c.quadraticCurveTo(fx, fy + 35, fx + w / 2, fy + 7); c.closePath(); c.fill();
  for (let p = -2; p <= 2; p++) { c.fillStyle = mix(cap, '#FFFFFF', 0.25); c.beginPath(); c.ellipse(fx + p * 19, fy + 12, 9, 6, 0, 0, Math.PI); c.fill(); }
  // (the floor: a slab, its top a lit lip)
  box(c, fx - w / 2 - 1, fy - 1, w + 2, 10, INK);
  box(c, fx - w / 2, fy, w, 8, '#A85A98');
  box(c, fx - w / 2, fy, w, 2, '#FFF6C8');
  box(c, fx - w / 2, fy + 6, w, 2, '#6E2A6E');
};

// ---------------------------------------------------------------------------------------------------------------
// What they throw

export const drawItem = (c: Ctx, item: Item, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  switch (item) {
    case 'bouquet':
      box(c, -2, 0, 4, 14, INK); box(c, -1, 0, 2, 13, '#3A8A3A'); box(c, -5, 4, 3, 2, '#3A8A3A'); box(c, 2, 6, 3, 2, '#3A8A3A');
      for (const [bx, by, col] of [[-5, -3, '#E11D48'], [4, -3, '#F472B6'], [0, -8, '#E11D48'], [-1, -1, '#FB7185']] as [number, number, string][]) { c.fillStyle = INK; c.beginPath(); c.arc(bx, by, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(bx, by, 4, 0, Math.PI * 2); c.fill(); }
      break;
    case 'chocolates':
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, 10); c.bezierCurveTo(-16, -2, -10, -14, 0, -6); c.bezierCurveTo(10, -14, 16, -2, 0, 10); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(0, 7); c.bezierCurveTo(-13, -2, -8, -11, 0, -4); c.bezierCurveTo(8, -11, 13, -2, 0, 7); c.fill();
      box(c, -6, -3, 3, 2, '#FCA5A5'); box(c, -1, -1, 2, 8, '#F6D365');
      break;
    case 'horseshoe':
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 8, Math.PI * 0.1, Math.PI * 0.9, true); c.stroke();
      c.strokeStyle = '#B8B8C4'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 8, Math.PI * 0.1, Math.PI * 0.9, true); c.stroke();
      box(c, -6, -5, 2, 2, '#FFFFFF');
      break;
    case 'brick':
      box(c, -11, -6, 22, 12, INK); box(c, -10, -5, 20, 10, '#B4472E'); box(c, -10, -5, 20, 2, '#D86A4A');
      box(c, -7, -4, 14, 8, '#FFF8F0'); c.strokeStyle = '#C8B8A8'; c.lineWidth = 1; c.beginPath(); c.moveTo(-7, -4); c.lineTo(0, 1); c.lineTo(7, -4); c.stroke();
      c.fillStyle = '#E11D48'; c.beginPath(); c.arc(-1, 1, 2, 0, Math.PI * 2); c.arc(1, 1, 2, 0, Math.PI * 2); c.fill();
      box(c, -11, -1, 22, 2, '#E11D48');
      break;
    case 'shaker':
      box(c, -6, -10, 12, 20, INK); box(c, -5, -6, 10, 15, '#E4E4E7'); box(c, -5, -9, 10, 4, '#2A6ADC'); box(c, -5, 0, 10, 4, '#C4A882');
      box(c, -3, -13, 6, 4, INK); box(c, -2, -12, 4, 3, '#2A6ADC');
      break;
    case 'wand':
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(-10, 8); c.lineTo(8, -8); c.stroke();
      c.strokeStyle = '#6A4020'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#FEF08A'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5, r = i % 2 ? 3 : 7; c.lineTo(9 + Math.cos(a) * r, -9 + Math.sin(a) * r); } c.closePath(); c.fill();
      break;
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza, the gates

/** The ground and the plaza's things (behind everything). */
export const drawPlaza = (c: Ctx, state: GameState) => {
  groundBox(c, x0 - 200, x1 + 200, GY, '#7A5A8A', '#F2E2F8');
  const f = state.frame;
  // (the flower beds round the wheel's feet)
  if (onScreen(state, X(2300), X(3700))) for (let i = 0; i < 40; i++) { const fx = X(2320 + i * 35), col = ['#F472B6', '#FEF08A', '#A5F3FC', '#C8A8F4'][i % 4]; box(c, fx, GY - 8, 6, 8, '#3A8A3A'); box(c, fx - 2, GY - 13, 10, 6, col); }
  // (the arch's sign; the ticket booth; the queue's rails)
  if (onScreen(state, X(300), X(700))) storySign(c, X(500), GY, ['THE FAIRY WHEEL', 'TRIAL ONE'], { board: '#6E2A6E' });
  if (onScreen(state, X(820), X(1000))) {
    const bx = X(900);
    box(c, bx - 50, GY - 110, 100, 110, INK); box(c, bx - 48, GY - 108, 96, 108, mix('#F49AC8', timeOfDay().haze ?? '#8090B0', 0.2));
    for (let i = 0; i < 6; i++) box(c, bx - 48 + i * 16, GY - 108, 8, 108, mix('#FFFFFF', timeOfDay().haze ?? '#8090B0', 0.3));
    box(c, bx - 30, GY - 80, 60, 34, INK); box(c, bx - 28, GY - 78, 56, 30, '#2A1A3A');
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 62, GY - 108); c.lineTo(bx, GY - 150); c.lineTo(bx + 62, GY - 108); c.closePath(); c.fill();
    c.fillStyle = '#9EE6C8'; c.beginPath(); c.moveTo(bx - 58, GY - 110); c.lineTo(bx, GY - 146); c.lineTo(bx + 58, GY - 110); c.closePath(); c.fill();
    box(c, bx - 40, GY - 132, 80, 16, INK); box(c, bx - 39, GY - 131, 78, 14, '#4A1A5A');
    signText(c, 'TICKETS', bx, GY - 120, gilt(1));
  }
  if (onScreen(state, X(1080), X(1560))) for (let rx = 1100; rx <= 1540; rx += 110) {
    const qx = X(rx), col = mix('#C8C8D4', timeOfDay().haze ?? '#8090B0', 0.35);
    box(c, qx - 3, GY - 40, 6, 40, INK); box(c, qx - 2, GY - 39, 4, 39, col);
    if (rx < 1540) { box(c, qx, GY - 36, 110, 5, INK); box(c, qx, GY - 35, 110, 3, '#9A3A6A'); }
  }
  // (past the far gate: the way on)
  if (onScreen(state, X(5000), X(5400))) storySign(c, X(5200), GY, ['THE ENCHANTED GLEN', 'THIS WAY >'], { board: '#2E5A3A' });
  void f;
};

/** A gate: two stone posts with a heart on each, wrought-iron rose gates between them (shut: full height, thorny,
 *  and a pink shimmer of magic up into the sky over them; open: swung back flat against the posts). `open` 0..1. */
export const drawGate = (c: Ctx, state: GameState, rx: number, open: number) => {
  const gx = X(rx), f = state.frame;
  if (!onScreen(state, gx - 120, gx + 120)) return;
  const H = 300, W = 90;
  for (const s of [-1, 1]) {
    const px = gx + s * (W / 2 + 12);
    box(c, px - 14, GY - H - 20, 28, H + 20, INK); box(c, px - 12, GY - H - 18, 24, H + 18, '#B8A8C8'); box(c, px - 12, GY - H - 18, 4, H + 18, '#D8CCE4');
    c.fillStyle = INK; c.beginPath(); c.arc(px, GY - H - 30, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F472B6'; c.beginPath(); c.arc(px, GY - H - 30, 12, 0, Math.PI * 2); c.fill();
  }
  // (the gates' leaves: shut, they meet in the middle; open, folded back)
  const leaf = (W / 2) * (1 - open * 0.85);
  for (const s of [-1, 1]) {
    const hinge = gx + s * (W / 2);
    const a = hinge, b = hinge - s * leaf;
    const l = Math.min(a, b), r = Math.max(a, b);
    for (let bx = l; bx <= r; bx += 9) { box(c, bx - 1, GY - H, 3, H, INK); box(c, bx, GY - H, 1, H, '#3A2A4A'); }
    for (const yy of [GY - H, GY - H / 2, GY - 20]) { box(c, l, yy - 2, r - l, 5, INK); box(c, l, yy - 1, r - l, 3, '#3A2A4A'); }
    // (the thorny roses up them)
    for (let k = 0; k < 8; k++) { const vx = l + ((k * 23) % Math.max(1, r - l)), vy = GY - 30 - k * 34; c.fillStyle = '#E11D48'; c.beginPath(); c.arc(vx, vy, 4, 0, Math.PI * 2); c.fill(); box(c, vx - 5, vy + 4, 10, 2, '#2A6A2A'); }
    // (spikes along the top)
    for (let bx = l; bx <= r; bx += 9) { c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 3, GY - H); c.lineTo(bx + 1, GY - H - 14); c.lineTo(bx + 5, GY - H); c.closePath(); c.fill(); }
  }
  // (shut: the magic up over it, all the way into the sky)
  if (open < 0.5) {
    const a = 0.25 * (1 - open * 2);
    const g = c.createLinearGradient(0, GY - H - 900, 0, GY - H);
    g.addColorStop(0, 'rgba(244,114,182,0)'); g.addColorStop(1, `rgba(244,114,182,${a})`);
    c.fillStyle = g; c.fillRect(gx - W / 2 - 20, GY - H - 900, W + 40, 900);
    for (let k = 0; k < 10; k++) { const sy = GY - H - ((f * 2 + k * 97) % 900); box(c, gx - W / 2 + ((k * 37) % W), sy, 2, 2, '#FFE4F2'); }
  }
};
