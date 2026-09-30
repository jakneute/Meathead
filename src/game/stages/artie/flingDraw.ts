// Killed in the avalanche's snowball: it doesn't just bury him. The ball comes
// flying over the top of the ridge onto the far side of the mountain (somewhere
// the stage never goes: the back of it, in the shadow, the sun going down behind
// the next range), clips the top of a lone pine and bursts, and he goes
// cartwheeling out of it, screaming, the whole way down to the frozen pond at
// the bottom: head first through the ice, right by the THIN ICE sign. His legs
// kick, slow, go stiff and frost over. His skis come down after him: one sticks
// in the snow beside him like a grave marker, the other bonks off his boot. An
// eagle glides in and settles on his upturned foot. Then the death message.
//
// Drawn over everything, screen space (800 x 600), timed by the death scene's clock.

import type { GameState } from '../../core/state';
import { drawPlayer } from '../../render/player/player';

type Ctx = CanvasRenderingContext2D;

/** How long it runs before the death message goes up. */
export const FLING_FRAMES = 190;

/** The beats: the ball hits the pine, he hits the ice, the skis, the eagle. */
const HIT_PINE = 46, HIT_ICE = 104, SKI1 = 120, SKI2 = 132, EAGLE_IN = 146, EAGLE_DOWN = 166;
const PINE = { x: 300, y: 340 }, POND = { x: 560, y: 522 };

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

export const drawFlingDeath = (ctx: Ctx, state: GameState, t: number) => {
  ctx.save();
  drawFarSide(ctx, t);
  if (t < HIT_PINE + 16) drawBall(ctx, t);
  if (t >= HIT_PINE && t < HIT_ICE) drawFlying(ctx, state, t);
  if (t >= HIT_ICE) drawPlanted(ctx, t);
  drawSkis(ctx, t);
  if (t >= EAGLE_IN) drawEagle(ctx, t);
  // (a moment of black cutting in, the way a cutaway does)
  if (t < 6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 6})`; ctx.fillRect(0, 0, 800, 600); }
  ctx.restore();
};

/** The back of the mountain: a dusk sky, the next range over, the sun going down behind it; the steep face he comes
 * down (the ridge he came over at the top left, powder still spilling over it), the lone pine, the pond at the bottom. */
const drawFarSide = (ctx: Ctx, t: number) => {
  const sky = ctx.createLinearGradient(0, 0, 0, 420);
  sky.addColorStop(0, '#1E1B4B'); sky.addColorStop(0.45, '#4C1D95'); sky.addColorStop(0.8, '#BE185D'); sky.addColorStop(1, '#FB923C');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 800, 600);
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
  ctx.beginPath(); ctx.moveTo(-10, 90); ctx.quadraticCurveTo(180, 170, 330, 390); ctx.quadraticCurveTo(420, 490, 810, 500); ctx.lineTo(810, 610); ctx.lineTo(-10, 610); ctx.closePath(); ctx.fill();
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
  ctx.fillStyle = '#EEF2FF'; ctx.fillRect(0, 500, 800, 100);
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
  if (t >= HIT_PINE) {
    // Burst: powder going everywhere
    const k = (t - HIT_PINE) / 16;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.fillStyle = `rgba(255,255,255,${1 - k})`;
      ctx.beginPath(); ctx.arc(PINE.x + Math.cos(a) * 70 * k, PINE.y - 60 + Math.sin(a) * 50 * k, 14 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  const k = t / HIT_PINE;
  const x = -60 + (PINE.x + 60) * k, y = 40 + (PINE.y - 100) * k - Math.sin(Math.PI * k) * 150;
  const r = 40;
  // (a trail of powder behind it)
  for (let i = 1; i < 6; i++) { const kk = Math.max(0, k - i * 0.04); ctx.fillStyle = `rgba(255,255,255,${0.5 - i * 0.08})`; ctx.beginPath(); ctx.arc(-60 + (PINE.x + 60) * kk, 40 + (PINE.y - 100) * kk - Math.sin(Math.PI * kk) * 150, r * (1 - i * 0.12), 0, Math.PI * 2); ctx.fill(); }
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
