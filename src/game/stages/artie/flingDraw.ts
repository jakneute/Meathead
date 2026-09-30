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
  const sky = ctx.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, '#93C5FD'); sky.addColorStop(1, '#E0F2FE');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 800, 600);
  ctx.translate(400, 300); ctx.rotate(0.28); ctx.translate(-400, -300);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-200, 470, 1200, 400);
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
  for (let i = 0; i < 10; i++) { const k = ((t * 2 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; ctx.beginPath(); ctx.arc(cx - 120 - k * 200 + hash(i) * 60, cy + R - 20 - k * 120 * hash(i + 3), 16 + k * 30, 0, Math.PI * 2); ctx.fill(); }
  ctx.save(); ctx.translate(cx, cy);
  // His limbs round it (under the snow at the root), flailing
  const flail = Math.sin(t * 0.8) * 0.3;
  const limbs: [number, string, number, boolean][] = [[0.6, '#1E3A8A', 90, true], [1.7, '#1E3A8A', 84, true], [3.4, '#E0AC69', 80, false], [4.5, '#E0AC69', 76, false]];
  for (const [a, col, len, leg] of limbs) {
    ctx.save(); ctx.rotate(spin + a + flail * (leg ? 1 : -1)); ctx.fillStyle = col; ctx.fillRect(R - 30, -16, len, 32);
    ctx.fillStyle = leg ? '#111' : '#E0AC69'; ctx.beginPath(); ctx.arc(R - 30 + len, 0, leg ? 22 : 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Lumpy, packed snow
  const g = ctx.createRadialGradient(-50, -60, 20, 0, 0, R);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.7, '#E0EAF7'); g.addColorStop(1, '#AFC6E4');
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2 + spin, r = R + Math.sin(i * 2.7) * 8; if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7D9BC4'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(125, 155, 196, 0.45)';
  for (let i = 0; i < 18; i++) { const a = spin + i * 2.4, r = 30 + (i * 37) % 130; ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 6 + (i % 3) * 4, 0, Math.PI * 2); ctx.fill(); }
  // A twig and a pinecone it's picked up on the way
  ctx.save(); ctx.rotate(spin + 2.4); ctx.fillStyle = '#5B3A1E'; ctx.fillRect(R - 20, -4, 60, 8); ctx.restore();
  ctx.save(); ctx.rotate(spin + 5.6); ctx.fillStyle = '#7C4A1E'; ctx.beginPath(); ctx.ellipse(R - 4, 0, 16, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // His head, poking out of it: the flat top, the brow, the eyes bugging, the mouth wide open
  ctx.save(); ctx.rotate(spin + 5.1); ctx.translate(R - 10, 0); ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.ellipse(0, -30, 46, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-44, -86, 88, 22); for (let k = -40; k < 44; k += 12) { ctx.beginPath(); ctx.moveTo(k, -86); ctx.lineTo(k + 6, -100); ctx.lineTo(k + 12, -86); ctx.fill(); }
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-17, -44, 14, 0, Math.PI * 2); ctx.arc(17, -44, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-15 + Math.sin(t * 0.5) * 3, -42, 5, 0, Math.PI * 2); ctx.arc(19 + Math.sin(t * 0.5) * 3, -42, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-32, -62, 26, 6); ctx.fillRect(6, -62, 26, 6);
  ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(0, -6, 20, 16 + Math.abs(Math.sin(t * 0.6)) * 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.beginPath(); ctx.ellipse(0, 4, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-12, -20, 24, 5);
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
  const sky = ctx.createLinearGradient(0, 0, 0, 420);
  sky.addColorStop(0, '#1E1B4B'); sky.addColorStop(0.45, '#4C1D95'); sky.addColorStop(0.8, '#BE185D'); sky.addColorStop(1, '#FB923C');
  // (well past the edges: the pull-out starts in close on the ball, off by the corner)
  ctx.fillStyle = '#1E1B4B'; ctx.fillRect(-1600, -1600, 4000, 1700);
  ctx.fillStyle = sky; ctx.fillRect(-1600, 0, 4000, 600);
  // The sun, half down behind the next range
  ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.arc(640, 360, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(253, 186, 116, 0.25)'; ctx.beginPath(); ctx.arc(640, 360, 80, 0, Math.PI * 2); ctx.fill();
  // Two ranges beyond, one behind the other
  for (const [base, col, amp, seed] of [[380, '#3B2A6E', 90, 1], [420, '#2A1F52', 60, 7]] as const) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 600);
    for (let x = 0; x <= 800; x += 40) ctx.lineTo(x, base - hash(x * 0.37 + seed) * amp - (x % 80 === 0 ? amp * 0.3 : 0));
    ctx.lineTo(800, 600); ctx.closePath(); ctx.fill();
  }
  // The face: steep from the ridge at the top left, easing out to the valley floor, lit blue in the shadow side
  const face = ctx.createLinearGradient(0, 100, 600, 560);
  face.addColorStop(0, '#E0E7FF'); face.addColorStop(0.5, '#A5B4FC'); face.addColorStop(1, '#C7D2FE');
  ctx.fillStyle = face;
  ctx.beginPath(); ctx.moveTo(-1600, -200); ctx.lineTo(-10, 90); ctx.quadraticCurveTo(180, 170, 330, 390); ctx.quadraticCurveTo(420, 490, 810, 500); ctx.lineTo(1600, 500); ctx.lineTo(1600, 1600); ctx.lineTo(-1600, 1600); ctx.closePath(); ctx.fill();
  // (rock showing through it; shadows down it)
  ctx.fillStyle = '#4C4A6E';
  for (const [x, y, w] of [[90, 170, 40], [200, 260, 30], [140, 330, 50], [380, 460, 36]] as const) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 6); ctx.lineTo(x + w * 0.6, y + 18); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'; ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(20 + k * 40, 120 + k * 30); ctx.quadraticCurveTo(120 + k * 50, 260 + k * 25, 260 + k * 60, 420 + k * 12); ctx.stroke(); }
  // The powder still spilling over the ridge where he came over it
  const spill = clamp01(1 - t / 90);
  if (spill > 0) for (let i = 0; i < 12; i++) {
    const k = ((t * 1.5 + i * 20) % 60) / 60;
    ctx.fillStyle = `rgba(255,255,255,${0.7 * spill * (1 - k)})`;
    ctx.beginPath(); ctx.arc(-10 + i * 14 + k * 50, 70 + k * 80 + hash(i) * 20, 14 + k * 26, 0, Math.PI * 2); ctx.fill();
  }
  // The pine (it shudders when the ball hits it, and drops its snow)
  const shake = t >= HIT_PINE && t < HIT_PINE + 30 ? Math.sin((t - HIT_PINE) * 1.7) * (1 - (t - HIT_PINE) / 30) * 0.12 : 0;
  ctx.save(); ctx.translate(PINE.x, PINE.y + 60); ctx.rotate(shake);
  ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-5, -20, 10, 30);
  for (let k = 0; k < 4; k++) {
    const w = 46 - k * 10, y = -20 - k * 26;
    ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(0, y - 40); ctx.lineTo(w, y); ctx.closePath(); ctx.fill();
    if (t < HIT_PINE) { ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-w * 0.7, y - 12); ctx.lineTo(0, y - 38); ctx.lineTo(w * 0.7, y - 12); ctx.lineTo(0, y - 22); ctx.closePath(); ctx.fill(); }
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
  const ice = ctx.createLinearGradient(0, POND.y - 22, 0, POND.y + 22);
  ice.addColorStop(0, '#DBEAFE'); ice.addColorStop(1, '#93C5FD');
  ctx.fillStyle = ice; ctx.beginPath(); ctx.ellipse(POND.x, POND.y, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(POND.x - 100, POND.y - 8); ctx.lineTo(POND.x - 40, POND.y - 12); ctx.stroke();
  ctx.fillStyle = '#78350F'; ctx.fillRect(704, 440, 5, 70);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(680, 428, 60, 26); ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.strokeRect(680, 428, 60, 26);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('THIN', 710, 440); ctx.fillText('ICE', 710, 451); ctx.textAlign = 'left';
};

/** The snowball, over the ridge and down onto the pine: tumbling, his arms and legs sticking out of it, flailing. */
const drawBall = (ctx: Ctx, t: number) => {
  if (t >= HIT_ICE) {
    // Burst on the ice: powder and chunks going everywhere
    const k = (t - HIT_ICE) / 16;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      ctx.fillStyle = `rgba(255,255,255,${1 - k})`;
      ctx.beginPath(); ctx.arc(POND.x + Math.cos(a) * 110 * k, POND.y - 40 + Math.sin(a) * 70 * k - k * 30, 20 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  const { x, y } = ballAt(t);
  const r = BALL_R;
  // (a trail of powder behind it)
  for (let i = 1; i < 6; i++) { const b = ballAt(t - i * 3); ctx.fillStyle = `rgba(255,255,255,${0.5 - i * 0.08})`; ctx.beginPath(); ctx.arc(b.x, b.y, r * (1 - i * 0.12), 0, Math.PI * 2); ctx.fill(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.45);
  // His limbs sticking out, flailing
  const flail = Math.sin(t * 0.9) * 0.4;
  for (const [a, col, len] of [[0.3, '#1E3A8A', 30], [1.2, '#1E3A8A', 28], [2.8, '#E0AC69', 26], [4.3, '#E0AC69', 24]] as const) {
    ctx.save(); ctx.rotate(a + flail); ctx.fillStyle = col; ctx.fillRect(r - 6, -6, len, 12);
    ctx.fillStyle = col === '#1E3A8A' ? '#111' : '#E0AC69'; ctx.beginPath(); ctx.arc(r - 6 + len, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const g = ctx.createRadialGradient(-12, -14, 6, 0, 0, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#BFD2EC');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(Math.cos(i) * 22, Math.sin(i * 1.7) * 22, 5, 0, Math.PI * 2); ctx.fill(); }
  // (his face, squashed against the inside of it)
  ctx.fillStyle = 'rgba(224, 172, 105, 0.8)'; ctx.beginPath(); ctx.ellipse(10, -4, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
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
  ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.ellipse(POND.x, POND.y, 22, 7, 0, 0, Math.PI * 2); ctx.fill(); // (the hole)
  // The legs: a V up out of it, kicking, then less, then not at all
  const kick = since < 34 ? Math.sin(since * 0.8) * 0.35 * (1 - since / 34) : 0;
  const frost = clamp01((since - 30) / 60);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(POND.x + s * 6, POND.y - 2); ctx.rotate(s * (0.28 + kick * s));
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -70, 16, 70); ctx.fillStyle = '#172554'; ctx.fillRect(s > 0 ? 4 : -8, -70, 4, 70);
    // (his belt at the ice line, the boot on top, the sole to the sky)
    ctx.fillStyle = '#111'; ctx.fillRect(-10, -94, 20, 26); ctx.fillStyle = '#444'; ctx.fillRect(-11, -98, 22, 5);
    if (frost > 0) { ctx.fillStyle = `rgba(219, 234, 254, ${frost * 0.55})`; ctx.fillRect(-11, -98, 22, 98); }
    // (an icicle growing off the heel)
    if (frost > 0.3 && s > 0) { ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; ctx.beginPath(); ctx.moveTo(8, -72); ctx.lineTo(12, -72); ctx.lineTo(10, -72 + 18 * frost); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  ctx.fillStyle = '#78350F'; ctx.fillRect(POND.x - 18, POND.y - 6, 36, 6); ctx.fillStyle = '#FACC15'; ctx.fillRect(POND.x - 4, POND.y - 6, 8, 6);
  // (frozen stiff: a sparkle off him)
  if (frost > 0.8 && t % 30 < 10) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(POND.x + 14, POND.y - 90, 2, 10); ctx.fillRect(POND.x + 10, POND.y - 86, 10, 2); }
};

/** His skis, coming down after him: one spears into the snow beside him, upright; the other bonks off his boot. */
const drawSkis = (ctx: Ctx, t: number) => {
  const ski = (x: number, y: number, rot: number) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-5, -60, 10, 120); ctx.fillStyle = '#FACC15'; ctx.fillRect(-5, -6, 10, 12);
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(0, -60, 5, Math.PI, 0); ctx.fill();
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
  ctx.fillStyle = '#3F2A1D';
  if (k < 1) { ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-40, -10 - flap); ctx.lineTo(-14, 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(34, -12 - flap); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(0, -6, 9, 14, 0.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(-8, -12, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(-20, -9); ctx.lineTo(-14, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(-10, -14, 2, 2);
  if (k >= 1) { ctx.fillStyle = '#FACC15'; ctx.fillRect(-4, 6, 2, 5); ctx.fillRect(3, 6, 2, 5); }
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
