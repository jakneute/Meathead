import type { GameState } from '../../core/state';
import { MEATHEAD_DEATH_FRAMES, EYE_FALL_SPLASH } from '../../player/deathAnim';
import { body } from './deathAnim';
import { eyeball, iris, lids } from '../../stages/hector/eyeDraw';
import { bandedGradient, pixelBlob } from '../pixelArt';

// Off the junk in the Eye of the storm: pulled way back, the whole calm of the eye with the storm wall going round it,
// the sea far below, the junk hanging there, the Eye in the middle of it all; and him, tiny, dropping out of it, end
// over end, all the way down into the sea. The Eye watches him go the whole way. Then the splash. Then it just looks at
// the spot for a while. A blink. Its head on one side (as much as an eyeball has one). A question mark. Another blink.

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const drawEyeFallCam = (ctx: Ctx, state: GameState, W: number, H: number) => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== 'eye_fall' || state.deathTimer <= 0) return;
  const len = state.deathScene?.len ?? MEATHEAD_DEATH_FRAMES.eye_fall;
  const t = Math.min(state.deathScene?.t ?? 9999, len), f = state.frame;
  const sea = 500, ex = W / 2, ey = 170, er = 62;
  ctx.save();
  // The calm in the eye: blue sky straight up, the storm wall going round it in bands, turning
  bandedGradient(ctx, 0, 0, W, sea, ['#1E3A8A', '#3B82F6', '#93C5FD', '#BFDBFE'], 12);
  for (let ring = 0; ring < 4; ring++) {
    const r = 330 + ring * 70, rot = f * (0.004 - ring * 0.0006);
    ctx.save(); ctx.translate(ex, ey + 60); ctx.rotate(rot);
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      pixelBlob(ctx, Math.cos(a) * r, Math.sin(a) * r * 0.7, 70 - ring * 6, 34, ['#64748B', '#475569', '#334155', '#1E293B'][ring]);
    }
    ctx.restore();
  }
  // The sea, way down, the swell on it
  bandedGradient(ctx, 0, sea, W, H - sea, ['#1E40AF', '#1E3A8A', '#172554'], 5);
  for (let k = 0; k < 16; k++) { ctx.fillStyle = 'rgba(219, 234, 254, 0.6)'; ctx.fillRect(Math.floor(((k * 61 + f * 0.3) % (W + 40)) - 20), sea + 6 + (k % 5) * 18, 20, 2); }
  // The junk hanging in the eye: a car, a shed roof, a fridge, a bit of dock
  for (let k = 0; k < 6; k++) {
    const jx = ex - 230 + k * 92 + Math.sin(f * 0.02 + k) * 4, jy = ey + 100 + (k % 2) * 34 + Math.cos(f * 0.03 + k) * 3;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(Math.sin(k) * 0.2);
    ctx.fillStyle = ['#78716C', '#92400E', '#E5E7EB', '#DC2626', '#57534E', '#A16207'][k]; ctx.fillRect(-22, -5, 44, 10);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(-22, 2, 44, 3);
    ctx.restore();
  }
  // Him: dropping out of it, tiny, end over end, all the way down
  const fall = clamp01(t / EYE_FALL_SPLASH);
  const mx = ex + 70 + fall * 30, my = ey + 140 + (sea - ey - 140) * fall * fall;
  if (t < EYE_FALL_SPLASH) {
    ctx.save(); ctx.translate(mx, my); ctx.scale(0.42, 0.42); ctx.rotate(t * 0.35);
    body(ctx, { ...state, blocks: [], camera: { x: 0, y: 0 } } as GameState, { ...d, x: 0, y: 32 }, state.player.currentWeapon, { deathFace: 'scream', isGrounded: false });
    ctx.restore();
  }
  // The splash, and the rings going out from it
  const s = t - EYE_FALL_SPLASH;
  if (s >= 0) {
    if (s < 30) for (let k = 0; k < 7; k++) { const q = s / 30; pixelBlob(ctx, mx + (k - 3) * 6 * (1 + q), sea - Math.sin(q * Math.PI) * (26 + (k % 3) * 10) - 2, 5, 7 * (1 - q * 0.6), 'rgba(255, 255, 255, 0.9)'); }
    for (let r = 0; r < 3; r++) { const q = ((s + r * 22) % 70) / 70; if (s + r * 22 < 0) continue; ctx.strokeStyle = `rgba(255, 255, 255, ${(0.7 * (1 - q)).toFixed(3)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(mx, sea + 2, 6 + q * 60, 2 + q * 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  // The Eye: watching him all the way down (its pupil on him, then on the spot); a blink; its head on one side; a
  // question mark; another blink
  const lookX = mx, lookY = s < 0 ? my : sea;
  const dx = lookX - ex, dy = lookY - ey, dl = Math.hypot(dx, dy) || 1;
  const tilt = clamp01((s - 34) / 10) * (1 - clamp01((s - 100) / 14)) * 0.32;
  const blink = (s >= 22 && s < 30) || (s >= 66 && s < 72) ? 1 : 0;
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(tilt); ctx.translate(-ex, -ey);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'; ctx.lineWidth = 4;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(ex, ey, er + 14 + k * 9, f * 0.03 + k, f * 0.03 + k + 2.2); ctx.stroke(); }
  eyeball(ctx, ex, ey, er, 0.15, f);
  // (pupil wide with interest)
  iris(ctx, ex + (dx / dl) * er * 0.45, ey + (dy / dl) * er * 0.45, er, s > 30 ? 0.75 : 0.35, f);
  lids(ctx, ex, ey, er, blink);
  ctx.restore();
  if (s > 40 && s < 140) {
    const pop = clamp01((s - 40) / 6), bob = Math.sin(s * 0.15) * 2;
    ctx.save(); ctx.translate(ex + er + 26, ey - er - 6 + bob); ctx.scale(pop, pop);
    ctx.fillStyle = '#000000'; ctx.fillRect(-15, -17, 30, 34); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-13, -15, 26, 30);
    ctx.fillStyle = '#111827'; ctx.font = 'bold 20px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('?', 1, 11);
    ctx.restore();
  }
  // (and it dims, for the message)
  const out = clamp01((t - (len - 20)) / 20);
  if (out > 0) { ctx.fillStyle = `rgba(0, 0, 0, ${(out * 0.55).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
};
