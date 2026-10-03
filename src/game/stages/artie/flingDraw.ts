// Killed in the avalanche's snowball: it doesn't just bury him. First, close in
// on it: a giant cartoon snowball rolling, him rolled up in it, his head and
// arms and legs sticking out of it going round and round, screaming his line.
// Then pull right out: the ball comes bounding over the top of the ridge onto
// the far side of the mountain (somewhere the stage never goes: the back of it,
// in the shadow, the sun going down behind the next range), all the way down to
// the frozen pond at the bottom, and crashes into it: it bursts, and he's left
// head first through the ice, right by the THIN ICE sign. His legs
// kick, slow, go stiff and frost over. His skis come down after him: one sticks
// in the snow beside him like a grave marker, the other bonks off his boot. An
// eagle glides in and settles on his upturned foot. Then the death message.
//
// Drawn over everything, screen space (800 x 600), timed by the death scene's clock.

import type { GameState } from '../../core/state';
import type { SoundType } from '../../../types';
import { drawPlayer } from '../../render/player/player';
import { bandedGradient, steppedGlow, pixelBlob, checker } from '../../render/pixelArt';
import { INK, ink, shaded, eye } from '../../render/npc/kit';
import { pixEllipse, snowDisc, pineTier, slab, letter } from './draw';

type Ctx = CanvasRenderingContext2D;

/** The beats: close on the ball rolling (and his line); the pull out; the ball down the far side into the pond; the
 * skis, the eagle. (The ball doesn't hit the pine any more: that's never.) */
export const CLOSE_END = 200, ZOOM = 50, HIT_ICE = CLOSE_END + 130;
const HIT_PINE = Infinity;
export const SKI1 = HIT_ICE + 16, SKI2 = HIT_ICE + 28, EAGLE_IN = HIT_ICE + 42, EAGLE_DOWN = HIT_ICE + 62;
/** How long it runs before the death message goes up (it can be skipped). */
export const FLING_FRAMES = HIT_ICE + 100;

const PINE = { x: 300, y: 340 }, POND = { x: 560, y: 522 };

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

export const drawFlingDeath = (ctx: Ctx, state: GameState, t: number) => {
  ctx.save();
  if (t < CLOSE_END) drawCloseUp(ctx, t);
  else {
    // Pulling out from right up on the ball to the whole far side of the mountain
    const z = t < CLOSE_END + ZOOM ? 1 + 5 * Math.pow(1 - (t - CLOSE_END) / ZOOM, 2) : 1;
    const b = ballAt(t);
    ctx.save();
    // (centered on the ball at first, easing to the plain view: the ball's pinned where the pull-out takes it)
    if (z > 1) { const m = (z - 1) / 5; ctx.translate(400 * m + b.x * (1 - m), 300 * m + b.y * (1 - m)); ctx.scale(z, z); ctx.translate(-b.x, -b.y); }
    drawFarSide(ctx, t);
    if (t < HIT_ICE + 16) drawBall(ctx, t);
    if (t >= HIT_ICE) drawPlanted(ctx, t);
    drawSkis(ctx, t);
    if (t >= EAGLE_IN) drawEagle(ctx, t);
    ctx.restore();
    // (the close-up giving way to it)
    if (t < CLOSE_END + 8) { ctx.globalAlpha = 1 - (t - CLOSE_END) / 8; drawCloseUp(ctx, t); ctx.globalAlpha = 1; }
  }
  void state; void drawFlying;
  // (a moment of black cutting in, the way a cutaway does)
  if (t < 6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 6})`; ctx.fillRect(0, 0, 800, 600); }
  ctx.restore();
};

/** Where the ball is on the far side (bounding down the face from over the ridge to the pond). */
const FACE: [number, number][] = [[-80, 60], [-10, 90], [180, 200], [330, 390], [450, 470], [560, 505]];
const ballAt = (t: number) => {
  const k = clamp01((t - CLOSE_END) / (HIT_ICE - CLOSE_END));
  const x = -80 + (POND.x + 80) * k;
  let y = FACE[FACE.length - 1][1];
  for (let i = 0; i + 1 < FACE.length; i++) if (x >= FACE[i][0] && x <= FACE[i + 1][0]) { const [x1, y1] = FACE[i], [x2, y2] = FACE[i + 1]; y = y1 + (y2 - y1) * (x - x1) / (x2 - x1); }
  const bounce = Math.abs(Math.sin(k * Math.PI * 3.5)) * 90 * (1 - k);
  return { x, y: y - BALL_R - bounce, k };
};
const BALL_R = 52;

/**
 * Right up on the ball, rolling: a giant cartoon snowball, lumpy, packed, flecked, spinning; his head, arms and legs
 * sticking out of it going round with it (flailing), his mouth wide open; the slope streaking by under it, powder
 * kicking up; and his line, in a jagged scream bubble.
 */
const drawCloseUp = (ctx: Ctx, t: number) => {
  // The slope, rushing past (tilted: it's steep)
  ctx.save();
  bandedGradient(ctx, 0, 0, 800, 600, ['#7DB3F4', '#93C5FD', '#B7D9FD', '#E0F2FE'], 10);
  ctx.translate(400, 300); ctx.rotate(0.28); ctx.translate(-400, -300);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-200, 470, 1200, 400);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-200, 470, 1200, 3);
  ctx.fillStyle = '#5A6E92'; ctx.fillRect(-200, 468, 1200, 2);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
  for (let i = 0; i < 12; i++) { const x = ((i * 137 - t * 38) % 1300 + 1300) % 1300 - 250; ctx.fillRect(x, 470 + (i % 3) * 30 + 8, 120 + (i % 4) * 40, 5); }
  // Speed lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) { const x = ((i * 211 - t * 50) % 1300 + 1300) % 1300 - 250, y = 60 + hash(i) * 380; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 140, y); ctx.stroke(); }
  ctx.restore();
  // The ball
  const R = 180, cx = 400 + Math.sin(t * 0.07) * 10, cy = 330 + Math.abs(Math.sin(t * 0.18)) * -14;
  const spin = t * 0.09;
  // (powder spraying up off it)
  for (let i = 0; i < 10; i++) { const k = ((t * 2 + i * 13) % 40) / 40, pr = 16 + k * 30; pixelBlob(ctx, cx - 120 - k * 200 + hash(i) * 60, cy + R - 20 - k * 120 * hash(i + 3), pr, pr, `rgba(255, 255, 255, ${(0.8 * (1 - k)).toFixed(2)})`, 4); }
  ctx.save(); ctx.translate(cx, cy);
  // His limbs round it (under the snow at the root), flailing: jeans and boots, bare arms and fists; shaded, inked
  const flail = Math.sin(t * 0.8) * 0.3;
  const limbs: [number, string, number, boolean][] = [[0.6, '#1E3A8A', 90, true], [1.7, '#1E3A8A', 84, true], [3.4, '#E0AC69', 80, false], [4.5, '#E0AC69', 76, false]];
  for (const [a, col, len, leg] of limbs) {
    ctx.save(); ctx.rotate(spin + a + flail * (leg ? 1 : -1));
    shadedLong(ctx, R - 30, -16, len, 32, col, 3);
    if (leg) { ink(ctx, () => ctx.roundRect(R - 30 + len - 16, -22, 36, 44, 8), '#1C1917', 3); ctx.fillStyle = '#44403C'; ctx.fillRect(R - 30 + len - 12, -18, 26, 8); ctx.fillStyle = '#0C0A09'; ctx.fillRect(R - 30 + len + 14, -20, 4, 40); }
    else { ink(ctx, () => ctx.arc(R - 30 + len, 0, 20, 0, Math.PI * 2), col, 3); ctx.fillStyle = '#B8834D'; ctx.beginPath(); ctx.arc(R - 30 + len + 4, 6, 14, -0.3, 2); ctx.fill(); ctx.fillStyle = '#F3C996'; ctx.fillRect(R - 30 + len - 10, -12, 8, 6); }
    ctx.restore();
  }
  // Lumpy, packed snow: the blue of its shadow, the snow in steps up to a lit cap (lit from the upper left however
  // it's turned), inked heavy; lumps and flecks in it going round
  const lumpy = () => { ctx.beginPath(); for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2 + spin, r = R + Math.sin(i * 2.7) * 8; if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); };
  ctx.save(); lumpy(); ctx.clip();
  ctx.fillStyle = '#9DB3D3'; ctx.fillRect(-R - 10, -R - 10, R * 2 + 20, R * 2 + 20);
  for (const [k, c] of [[0.94, '#B8CAE3'], [0.8, '#D2DFF0'], [0.62, '#E6EEF8'], [0.38, '#F5F8FC'], [0.18, '#FFFFFF']] as const) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(-R * (1 - k) * 0.55, -R * (1 - k) * 0.6, R * k, 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < 18; i++) {
    const a = spin + i * 2.4, r = 30 + (i * 37) % 130, lr = 6 + (i % 3) * 4, lx = Math.cos(a) * r, ly = Math.sin(a) * r;
    ctx.fillStyle = 'rgba(93, 120, 165, 0.45)'; ctx.beginPath(); ctx.arc(lx + 2, ly + 2, lr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath(); ctx.arc(lx - 1, ly - 1, lr * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; lumpy(); ctx.stroke();
  // A twig and a pinecone it's picked up on the way
  ctx.save(); ctx.rotate(spin + 2.4); shadedLong(ctx, R - 20, -4, 60, 8, '#5B3A1E', 2); ctx.restore();
  ctx.save(); ctx.rotate(spin + 5.6);
  ink(ctx, () => ctx.ellipse(R - 4, 0, 16, 11, 0, 0, Math.PI * 2), '#7C4A1E', 2);
  ctx.fillStyle = '#4A2A10'; for (let sx = -10; sx < 12; sx += 6) for (let sy = -6; sy < 7; sy += 6) ctx.fillRect(R - 4 + sx + (sy % 12 ? 3 : 0), sy, 4, 2);
  ctx.fillStyle = '#A8683A'; ctx.fillRect(R - 12, -7, 8, 2);
  ctx.restore();
  // His head, poking out of it: the flat top, the brow, the eyes bugging, the mouth wide open (shaded, inked)
  ctx.save(); ctx.rotate(spin + 5.1); ctx.translate(R - 10, 0); ctx.rotate(Math.PI / 2);
  ink(ctx, () => ctx.ellipse(0, -30, 46, 52, 0, 0, Math.PI * 2), '#E0AC69', 3);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -30, 44, 50, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#C08A50'; ctx.beginPath(); ctx.ellipse(16, -22, 40, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.ellipse(-8, -37, 36, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F3C996'; ctx.fillRect(-34, -60, 14, 22);
  ctx.restore();
  ink(ctx, () => { ctx.rect(-44, -86, 88, 22); for (let k = -40; k < 44; k += 12) { ctx.moveTo(k, -86); ctx.lineTo(k + 6, -100); ctx.lineTo(k + 12, -86); } }, '#1C1917', 2);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-40, -84, 80, 4);
  eye(ctx, -17, -44, 14, Math.sin(t * 0.5) * 0.5 + 0.15, 0.15);
  eye(ctx, 17, -44, 14, Math.sin(t * 0.5) * 0.5 + 0.15, 0.15);
  slab(ctx, -32, -62, 26, 6, '#1C1917', 1); slab(ctx, 6, -62, 26, 6, '#1C1917', 1);
  const mh = 16 + Math.abs(Math.sin(t * 0.6)) * 6;
  ink(ctx, () => ctx.ellipse(0, -6, 20, mh, 0, 0, Math.PI * 2), '#450A0A', 3);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -6, 19, mh - 1, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#F87171'; ctx.beginPath(); ctx.ellipse(0, 4, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-6, 0, 5, 2);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-12, -6 - mh + 4, 24, 5); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-12, -6 - mh + 8, 24, 1);
  ctx.fillStyle = INK; for (let tx = -6; tx < 12; tx += 6) ctx.fillRect(tx, -6 - mh + 4, 1, 5);
  ctx.restore();
  ctx.restore();
  ctx.restore();
  // His line, in a jagged scream bubble
  const lines = ["NOT LIKE THIS!", "I HAVEN'T EVEN HAD", 'MY PROTEIN SHAKE!'];
  ctx.save();
  // (clear of the HUD in the top left and the skip prompt in the top right)
  ctx.translate(500, 180); ctx.rotate(-0.06 + Math.sin(t * 0.5) * 0.02);
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, r = i % 2 ? 1 : 1.18; const x = Math.cos(a) * 190 * r, y = Math.sin(a) * 70 * r; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, 0, -18 + i * 22));
  ctx.restore();
};

/** The back of the mountain: a dusk sky, the next range over, the sun going down behind it; the steep face he comes
 * down (the ridge he came over at the top left, powder still spilling over it), the lone pine, the pond at the bottom. */
const drawFarSide = (ctx: Ctx, t: number) => {
  // (well past the edges: the pull-out starts in close on the ball, off by the corner)
  ctx.fillStyle = '#1E1B4B'; ctx.fillRect(-1600, -1600, 4000, 1700);
  bandedGradient(ctx, -1600, 0, 4000, 420, ['#1E1B4B', '#3B1A78', '#4C1D95', '#8A1B78', '#BE185D', '#E2553F', '#FB923C'], 14);
  ctx.fillStyle = '#FB923C'; ctx.fillRect(-1600, 420, 4000, 180);
  // The sun, half down behind the next range: a stepped glow round it, the disc in bands, cut by stripes of sky
  steppedGlow(ctx, 640, 360, 80, '#FDBA74', 0.35, 0.08, 4);
  ctx.save(); ctx.beginPath(); ctx.arc(640, 360, 44, 0, Math.PI * 2); ctx.clip();
  const sunBands = ['#FEF08A', '#FDE047', '#FCD34D', '#FBBF24', '#F59E0B'];
  sunBands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(596, 316 + i * 18, 88, 18); });
  ctx.fillStyle = '#E2553F'; for (let i = 0; i < 4; i++) ctx.fillRect(596, 362 + i * 9, 88, 2 + i);
  ctx.restore();
  // Two ranges beyond, one behind the other: each lit along its crests by the sunset, darker down into the valley
  for (const [base, col, amp, seed] of [[380, '#3B2A6E', 90, 1], [420, '#2A1F52', 60, 7]] as const) {
    const ridge = () => { ctx.beginPath(); ctx.moveTo(0, 600); for (let x = 0; x <= 800; x += 40) ctx.lineTo(x, base - hash(x * 0.37 + seed) * amp - (x % 80 === 0 ? amp * 0.3 : 0)); ctx.lineTo(800, 600); ctx.closePath(); };
    ctx.fillStyle = col; ridge(); ctx.fill();
    ctx.save(); ridge(); ctx.clip();
    bandedGradient(ctx, 0, base, 800, 600 - base, [col, seed === 1 ? '#2A1D55' : '#1C1540'], 4);
    ctx.restore();
    ctx.strokeStyle = seed === 1 ? '#7C5BB0' : '#5B3F8C'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= 800; x += 40) { const y = base - hash(x * 0.37 + seed) * amp - (x % 80 === 0 ? amp * 0.3 : 0) + 1; if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
  }
  // The face: steep from the ridge at the top left, easing out to the valley floor, lit blue in the shadow side (in
  // bands, dithered), inked along the ridge
  const face = () => { ctx.beginPath(); ctx.moveTo(-1600, -200); ctx.lineTo(-10, 90); ctx.quadraticCurveTo(180, 170, 330, 390); ctx.quadraticCurveTo(420, 490, 810, 500); ctx.lineTo(1600, 500); ctx.lineTo(1600, 1600); ctx.lineTo(-1600, 1600); ctx.closePath(); };
  ctx.save(); face(); ctx.clip();
  ctx.fillStyle = '#E0E7FF'; ctx.fillRect(-1600, -400, 4000, 500);
  bandedGradient(ctx, -1600, 100, 4000, 460, ['#E0E7FF', '#C3CBFD', '#A5B4FC', '#B4C0FD', '#C7D2FE'], 12);
  ctx.fillStyle = '#C7D2FE'; ctx.fillRect(-1600, 560, 4000, 1100);
  ctx.restore();
  ctx.strokeStyle = '#312E81'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1600, -200); ctx.lineTo(-10, 90); ctx.quadraticCurveTo(180, 170, 330, 390); ctx.quadraticCurveTo(420, 490, 810, 500); ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1600, -197); ctx.lineTo(-10, 93); ctx.quadraticCurveTo(180, 173, 330, 393); ctx.quadraticCurveTo(420, 493, 810, 503); ctx.stroke();
  // (rock showing through it, lit on top, inked; shadows down it)
  for (const [x, y, w] of [[90, 170, 40], [200, 260, 30], [140, 330, 50], [380, 460, 36]] as const) {
    ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + w, y + 6); ctx.lineTo(x + w * 0.6, y + 18); ctx.closePath(); }, '#4C4A6E', 1.5);
    ctx.fillStyle = '#6E6A96'; ctx.beginPath(); ctx.moveTo(x + 3, y + 1); ctx.lineTo(x + w - 4, y + 6); ctx.lineTo(x + w * 0.5, y + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F5F7FF'; ctx.fillRect(x + 2, y - 2, w * 0.5, 2);
  }
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'; ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(20 + k * 40, 120 + k * 30); ctx.quadraticCurveTo(120 + k * 50, 260 + k * 25, 260 + k * 60, 420 + k * 12); ctx.stroke(); }
  // The powder still spilling over the ridge where he came over it
  const spill = clamp01(1 - t / 90);
  if (spill > 0) for (let i = 0; i < 12; i++) {
    const k = ((t * 1.5 + i * 20) % 60) / 60;
    const pr = 14 + k * 26;
    pixelBlob(ctx, -10 + i * 14 + k * 50, 70 + k * 80 + hash(i) * 20, pr, pr, `rgba(255, 255, 255, ${(0.7 * spill * (1 - k)).toFixed(2)})`, 4);
  }
  // The pine (it shudders when the ball hits it, and drops its snow)
  const shake = t >= HIT_PINE && t < HIT_PINE + 30 ? Math.sin((t - HIT_PINE) * 1.7) * (1 - (t - HIT_PINE) / 30) * 0.12 : 0;
  ctx.save(); ctx.translate(PINE.x, PINE.y + 60); ctx.rotate(shake);
  shaded(ctx, () => ctx.rect(-5, -20, 10, 30), '#3F2A1D', -5, -20, 10, 30);
  for (let k = 0; k < 4; k++) {
    const w = 46 - k * 10, y = -20 - k * 26;
    pineTier(ctx, 0, y - 40, y, w, { shade: '#14532D', lit: '#22803F', ink: INK }, t < HIT_PINE);
  }
  // (its top snapped off, hanging)
  if (t >= HIT_PINE) { ctx.fillStyle = '#14532D'; ctx.save(); ctx.translate(0, -118); ctx.rotate(1.2); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -26); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // Its snow, dropping off it
  if (t >= HIT_PINE && t < HIT_PINE + 40) for (let i = 0; i < 8; i++) {
    const k = (t - HIT_PINE) / 40;
    ctx.fillStyle = `rgba(248, 250, 252, ${1 - k})`;
    ctx.beginPath(); ctx.arc(PINE.x - 40 + i * 11, PINE.y - 60 + k * k * 160 + hash(i) * 20, 6 + hash(i * 3) * 5, 0, Math.PI * 2); ctx.fill();
  }
  // The valley floor: the pond, frozen over, and the sign by it
  ctx.fillStyle = '#EEF2FF'; ctx.fillRect(0, 500, 1600, 1100);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 500, 1600, 2);
  // (drifts across the valley floor, each with the blue of its lee)
  for (let i = 0; i < 18; i++) {
    const sx = Math.round(hash(i * 5.7 + 2) * 800 / 2) * 2, sy = 512 + Math.round(hash(i * 1.9) * 40) * 2, w = 24 + Math.round(hash(i * 4.3) * 20) * 2;
    ctx.fillStyle = '#D5DCFB'; ctx.fillRect(sx, sy + 2, w, 2); checker(ctx, sx + 2, sy + 4, w - 4, 2, '#D5DCFB');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx + 4, sy, w - 8, 2);
  }
  // (the ice in steps, darker toward the near edge, a rim of packed snow round it, a glint)
  pixEllipse(ctx, POND.x, POND.y + 1, 154, 29, '#A5B4FC');
  pixEllipse(ctx, POND.x, POND.y, 150, 26, '#93C5FD');
  pixEllipse(ctx, POND.x - 6, POND.y - 4, 134, 19, '#B6D6FD');
  pixEllipse(ctx, POND.x - 14, POND.y - 8, 104, 11, '#DBEAFE');
  ctx.strokeStyle = '#3B5BA8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(POND.x, POND.y, 150, 26, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; for (let gx = POND.x - 100; gx < POND.x - 40; gx += 6) ctx.fillRect(gx, Math.round(POND.y - 8 - (gx - POND.x + 100) / 15), 4, 2);
  slab(ctx, 704, 440, 5, 70, '#78350F', 1);
  slab(ctx, 678, 426, 64, 30, '#78350F');
  slab(ctx, 681, 429, 58, 24, '#FEF3C7');
  letter(ctx, 'THIN', 710, 440, 'bold 10px "Press Start 2P"', '#B91C1C', '#FCA5A5');
  letter(ctx, 'ICE', 710, 451, 'bold 10px "Press Start 2P"', '#B91C1C', '#FCA5A5');
};

/** The snowball, over the ridge and down onto the pine: tumbling, his arms and legs sticking out of it, flailing. */
const drawBall = (ctx: Ctx, t: number) => {
  if (t >= HIT_ICE) {
    // Burst on the ice: powder and chunks going everywhere
    const k = (t - HIT_ICE) / 16;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2, pr = 20 * (1 - k * 0.5);
      pixelBlob(ctx, POND.x + Math.cos(a) * 110 * k, POND.y - 40 + Math.sin(a) * 70 * k - k * 30, pr, pr, `rgba(255, 255, 255, ${Math.max(0, 1 - k).toFixed(2)})`);
    }
    return;
  }
  const { x, y } = ballAt(t);
  const r = BALL_R;
  // (a trail of powder behind it)
  for (let i = 1; i < 6; i++) { const b = ballAt(t - i * 3), pr = r * (1 - i * 0.12); pixelBlob(ctx, b.x, b.y, pr, pr, `rgba(255, 255, 255, ${(0.5 - i * 0.08).toFixed(2)})`, 3); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.45);
  // His limbs sticking out, flailing (shaded, inked: boots, fists)
  const flail = Math.sin(t * 0.9) * 0.4;
  for (const [a, col, len] of [[0.3, '#1E3A8A', 30], [1.2, '#1E3A8A', 28], [2.8, '#E0AC69', 26], [4.3, '#E0AC69', 24]] as const) {
    ctx.save(); ctx.rotate(a + flail); shadedLong(ctx, r - 6, -6, len, 12, col, 1.5);
    ink(ctx, () => ctx.arc(r - 6 + len, 0, 8, 0, Math.PI * 2), col === '#1E3A8A' ? '#1C1917' : '#E0AC69', 1.5); ctx.restore();
  }
  ctx.rotate(-t * 0.45); snowDisc(ctx, 0, 0, r, 2.5); ctx.rotate(t * 0.45);
  for (let i = 0; i < 6; i++) { const lx = Math.cos(i) * 22, ly = Math.sin(i * 1.7) * 22; ctx.fillStyle = 'rgba(100, 125, 165, 0.45)'; ctx.beginPath(); ctx.arc(lx + 1, ly + 1, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(lx - 3, ly - 3, 3, 2); }
  // (his face, squashed against the inside of it)
  ctx.fillStyle = 'rgba(224, 172, 105, 0.85)'; ctx.beginPath(); ctx.ellipse(10, -4, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160, 110, 60, 0.6)'; ctx.beginPath(); ctx.ellipse(13, -2, 8, 7, 0, -0.5, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(10, -4, 12, 9, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.fillRect(4, -8, 3, 3); ctx.fillRect(12, -8, 3, 3); ctx.beginPath(); ctx.ellipse(10, 2, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

/** Out of the ball, cartwheeling down the face to the pond, screaming the whole way. */
const drawFlying = (ctx: Ctx, state: GameState, t: number) => {
  const k = (t - HIT_PINE) / (HIT_ICE - HIT_PINE);
  const x = PINE.x + (POND.x - PINE.x) * k, y = PINE.y - 70 + (POND.y - 30 - (PINE.y - 70)) * k * k - Math.sin(Math.PI * k) * 160;
  const p = state.player;
  const body = { ...p, hidden: false, bike: false, jetski: false, skiing: false, isGrounded: false, hurtTimer: 10, vel: { x: 4, y: 6 }, pos: { x: x - p.width / 2, y: y - p.height / 2 } };
  ctx.save(); ctx.translate(x, y); ctx.rotate((t - HIT_PINE) * 0.42); ctx.scale(1.3, 1.3); ctx.translate(-x, -y);
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  // The scream, trailing off behind him
  ctx.save(); ctx.font = 'bold 14px "Press Start 2P"'; ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  const scream = 'AAAAAAAAAAAH' .slice(0, 3 + Math.floor(k * 10));
  ctx.translate(x - 40, y - 60); ctx.rotate(-0.15 + Math.sin(t * 0.8) * 0.05);
  ctx.strokeText(scream, 0, 0); ctx.fillText(scream, 0, 0);
  ctx.restore();
};

/** A long part (a limb, a twig) along x from (x, y), w by h: lit along its top, its shadow along the bottom, inked. */
const shadedLong = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, line: number) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.fillRect(x, y, w, Math.round(h * 0.3));
  ctx.fillStyle = 'rgba(26, 11, 6, 0.28)'; ctx.fillRect(x, y + h - Math.round(h * 0.3), w, Math.round(h * 0.3));
  ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.strokeRect(x, y, w, h);
};

/** In the ice head first to the waist, legs up: kicking, slowing, stiff, frosting over. The ice cracked round him. */
const drawPlanted = (ctx: Ctx, t: number) => {
  const since = t - HIT_ICE;
  // The splash of ice, the cracks
  if (since < 20) for (let i = 0; i < 14; i++) {
    const a = Math.PI + (i / 13) * Math.PI, k = since / 20;
    ctx.fillStyle = `rgba(219, 234, 254, ${1 - k})`;
    ctx.fillRect(POND.x + Math.cos(a) * 80 * k, POND.y - 10 + Math.sin(a) * 90 * k + k * k * 60, 6, 6);
  }
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.6)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.3; ctx.beginPath(); ctx.moveTo(POND.x, POND.y); ctx.lineTo(POND.x + Math.cos(a) * (40 + hash(i) * 50), POND.y + Math.sin(a) * (10 + hash(i * 2) * 8)); ctx.stroke(); }
  pixEllipse(ctx, POND.x, POND.y, 24, 8, '#0B1A4A'); pixEllipse(ctx, POND.x, POND.y + 1, 20, 6, '#1E3A8A'); // (the hole)
  ctx.fillStyle = '#F0F8FF'; for (let i = 0; i < 6; i++) ctx.fillRect(POND.x - 22 + i * 8, POND.y - 7 + (i % 2) * 2, 4, 2);
  // The legs: a V up out of it, kicking, then less, then not at all
  const kick = since < 34 ? Math.sin(since * 0.8) * 0.35 * (1 - since / 34) : 0;
  const frost = clamp01((since - 30) / 60);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(POND.x + s * 6, POND.y - 2); ctx.rotate(s * (0.28 + kick * s));
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -70, 16, 70); ctx.fillStyle = '#172554'; ctx.fillRect(s > 0 ? 4 : -8, -70, 4, 70);
    ctx.fillStyle = '#3B5BB5'; ctx.fillRect(s > 0 ? -8 : 4, -70, 3, 70);
    ctx.fillStyle = '#2B4A9E'; for (let sy = -60; sy < -4; sy += 14) ctx.fillRect(-4, sy, 6, 1); // (creases)
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(-8, -70, 16, 70);
    // (his belt at the ice line, the boot on top, the sole to the sky)
    shaded(ctx, () => ctx.rect(-10, -94, 20, 26), '#1C1917', -10, -94, 20, 26, 1.5);
    ctx.fillStyle = '#57534E'; ctx.fillRect(-6, -90, 2, 18);
    slab(ctx, -11, -98, 22, 5, '#444', 1);
    ctx.fillStyle = '#292524'; for (let tx = -9; tx < 10; tx += 4) ctx.fillRect(tx, -98, 2, 1);
    if (frost > 0) { ctx.fillStyle = `rgba(219, 234, 254, ${frost * 0.55})`; ctx.fillRect(-11, -98, 22, 98); }
    // (an icicle growing off the heel)
    if (frost > 0.3 && s > 0) { ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; ctx.beginPath(); ctx.moveTo(8, -72); ctx.lineTo(12, -72); ctx.lineTo(10, -72 + 18 * frost); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  slab(ctx, POND.x - 18, POND.y - 6, 36, 6, '#78350F', 1); ctx.fillStyle = '#FACC15'; ctx.fillRect(POND.x - 4, POND.y - 6, 8, 6); ctx.fillStyle = '#FEF08A'; ctx.fillRect(POND.x - 4, POND.y - 6, 3, 2);
  // (frozen stiff: a sparkle off him)
  if (frost > 0.8 && t % 30 < 10) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(POND.x + 14, POND.y - 90, 2, 10); ctx.fillRect(POND.x + 10, POND.y - 86, 10, 2); }
};

/** His skis, coming down after him: one spears into the snow beside him, upright; the other bonks off his boot. */
const drawSkis = (ctx: Ctx, t: number) => {
  const ski = (x: number, y: number, rot: number) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    // (red, lit down one edge, a yellow binding block, the rounded tip; inked)
    const plank = () => { ctx.beginPath(); ctx.moveTo(-5, 60); ctx.lineTo(-5, -60); ctx.arc(0, -60, 5, Math.PI, 0); ctx.lineTo(5, 60); ctx.closePath(); };
    ctx.fillStyle = '#DC2626'; plank(); ctx.fill();
    ctx.fillStyle = '#F87171'; ctx.fillRect(-5, -60, 2, 120);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(3, -60, 2, 120);
    slab(ctx, -5, -6, 10, 12, '#FACC15', 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; plank(); ctx.stroke();
    ctx.restore();
  };
  if (t >= SKI1 - 20) {
    const k = clamp01((t - (SKI1 - 20)) / 20);
    ski(POND.x + 90, -60 + (POND.y - 40 + 60) * k, (1 - k) * 3);
  }
  if (t >= SKI2 - 22) {
    const k = clamp01((t - (SKI2 - 22)) / 22);
    if (k < 1) ski(POND.x + 20 - 10 * k, -60 + (POND.y - 120 + 60) * k, k * 6);
    else {
      // (off his boot and down flat in the snow, a BONK where it hit)
      const since = t - SKI2;
      ski(POND.x + 20 + Math.min(since, 14) * 5, Math.min(POND.y + 4, POND.y - 110 + since * 12), Math.PI / 2 - 0.1);
      if (since < 24) { ctx.save(); ctx.font = 'bold 16px "Press Start 2P"'; ctx.fillStyle = '#FDE047'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeText('BONK', POND.x + 20, POND.y - 120 - since); ctx.fillText('BONK', POND.x + 20, POND.y - 120 - since); ctx.restore(); }
    }
  }
};

/** An eagle, gliding in from the right, settling on his upturned boot, folding its wings. */
const drawEagle = (ctx: Ctx, t: number) => {
  const k = clamp01((t - EAGLE_IN) / (EAGLE_DOWN - EAGLE_IN));
  const perchX = POND.x + 22, perchY = POND.y - 104;
  const x = 860 + (perchX - 860) * k, y = 280 + (perchY - 280) * k - Math.sin(Math.PI * k) * 40;
  const flap = k < 1 ? Math.sin(t * 0.6) * 12 : 0;
  ctx.save(); ctx.translate(x, y);
  // (the wings, feathered at the tips, lit along the leading edge; the body; the white head, the hooked yellow beak;
  // the talons once it's down; all inked)
  if (k < 1) {
    for (const [s, tip] of [[-1, -40], [1, 34]] as const) {
      const wing = () => { ctx.beginPath(); ctx.moveTo(s * 4, 0); ctx.lineTo(tip, (s < 0 ? -10 : -12) - flap); ctx.lineTo(s * 14, 6); ctx.closePath(); };
      ink(ctx, wing, '#3F2A1D', 1.2);
      ctx.fillStyle = '#5C4030'; ctx.beginPath(); ctx.moveTo(s * 4, 0); ctx.lineTo(tip, (s < 0 ? -10 : -12) - flap); ctx.lineTo(s * 8, 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1C120B'; for (let f = 0; f < 3; f++) ctx.fillRect(tip * (0.72 + f * 0.09) - 1, ((s < 0 ? -10 : -12) - flap) * (0.72 + f * 0.09) + 2, 2, 3);
    }
  } else { ink(ctx, () => ctx.ellipse(0, -6, 9, 14, 0.1, 0, Math.PI * 2), '#3F2A1D', 1.2); ctx.fillStyle = '#5C4030'; ctx.fillRect(-6, -14, 4, 12); }
  ink(ctx, () => ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2), '#3F2A1D', 1.2);
  ctx.fillStyle = '#2A1B12'; ctx.fillRect(-6, 4, 14, 2);
  ink(ctx, () => ctx.arc(-8, -12, 7, 0, Math.PI * 2), '#F8FAFC', 1.2);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-6, -9, 4, 3);
  ink(ctx, () => { ctx.moveTo(-14, -12); ctx.lineTo(-20, -9); ctx.lineTo(-17, -6); ctx.lineTo(-14, -8); ctx.closePath(); }, '#FACC15', 1);
  ctx.fillStyle = '#111'; ctx.fillRect(-10, -14, 2, 2);
  ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-12, -16, 5, 1); // (the glower)
  if (k >= 1) { slab(ctx, -4, 6, 2, 5, '#FACC15', 0); slab(ctx, 3, 6, 2, 5, '#FACC15', 0); }
  ctx.restore();
};

/**
 * Its sounds, on its beats: the ball rumbling and crunching as it rolls (whooshing by, up close); a thud each time it
 * comes down bounding down the far side; the crash through the ice (it shatters, a splash); the skis coming down
 * after him (a thud, then the BONK off his boot); the eagle swooping in.
 */
export const flingSound = (t: number, play: (s: SoundType, vol?: number, pitch?: number) => void) => {
  if (t < CLOSE_END) {
    if (t % 45 === 1) play('rumble', 0.7);
    if (t % 18 === 5) play('crunch', 0.5, -4 + (t % 5));
    if (t % 60 === 30) play('whoosh', 0.6, -6);
    return;
  }
  if (t === CLOSE_END + 2) play('whoosh', 0.9, -10);
  // (it touches down every so often as it bounds down the face)
  const n = Math.floor(((t - CLOSE_END) / (HIT_ICE - CLOSE_END)) * 3.5), m = Math.floor(((t - 1 - CLOSE_END) / (HIT_ICE - CLOSE_END)) * 3.5);
  if (t < HIT_ICE && n !== m) { play('thud', 0.9); play('crunch', 0.6); }
  if (t === HIT_ICE) { play('crash'); play('glass'); play('splash', 0.8); }
  if (t === HIT_ICE + 6) play('crack', 0.8);
  if (t === SKI1) play('thud', 0.8, 4);
  if (t === SKI2) play('clang', 0.9, 6);
  if (t === EAGLE_IN) play('whoosh', 0.7, 4);
  if (t === EAGLE_DOWN) play('land', 0.5, 8);
};
