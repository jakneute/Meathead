// Hector's stage, in the water: the air meter while he's under, lightning
// lighting up the water, and the drowning (flailing, the last of his air blown
// out, then limp and floating up belly first, bobbing there).

import type { GameState } from '../../state';
import { drawPlayer } from '../../render/playerRenderer';
import { Hazards, DROWN_FRAMES, STRIKE_WARN, headUnder, bodyExtent } from './hazards';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Electricity crackling over a stretch of water, from x1 to x2 at the surface. */
const crackle = (ctx: Ctx, x1: number, x2: number, y: number, depth: number, seed: number, alpha: number) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2; ctx.shadowColor = '#FEF08A'; ctx.shadowBlur = 10;
  for (let k = 0; k < Math.max(2, Math.floor((x2 - x1) / 60)); k++) {
    let x = x1 + hash(seed + k * 7) * (x2 - x1), yy = y + 2;
    ctx.beginPath(); ctx.moveTo(x, yy);
    for (let i = 0; i < 5; i++) { x += (hash(seed + k * 31 + i) - 0.5) * 40; yy += depth / 5; ctx.lineTo(x, yy); }
    ctx.stroke();
  }
  ctx.restore();
};

export const drawWaterHazards = (ctx: Ctx, state: GameState, hz: Hazards) => {
  // A bolt about to come down in the water: the whole body of water crackles (get out!)
  for (const s of hz.strikes) {
    const hit = hz.water.find(w => !w.underDock && s.x > w.x1 && s.x < w.x2);
    if (!hit || s.t >= STRIKE_WARN || Math.abs(Math.floor(s.t / 4) % 2)) continue;
    const z = bodyExtent(hz, hit.body);
    crackle(ctx, z.x1, z.x2, z.surface, 60, s.t + Math.floor(s.x), 0.35 + Math.max(0, s.t / STRIKE_WARN) * 0.5);
  }
  // It hit: the water lights up top to bottom
  if (hz.zap) {
    const z = hz.zap, k = 1 - hz.zap.t / 30;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.45 * k})`;
    ctx.fillRect(z.x1, z.surface, z.x2 - z.x1, z.bottom - z.surface);
    crackle(ctx, z.x1, z.x2, z.surface, z.bottom - z.surface, state.frame, k);
  }
  drawDrowning(ctx, state, hz);
};

/** The air meter over his head while he's under: a row of bubbles that pop one by one. */
export const drawAirMeter = (ctx: Ctx, state: GameState, hz: Hazards) => {
  const p = state.player;
  if (hz.drownT > 0 || hz.o2 >= 1 || (!headUnder(p) && hz.o2 > 0.98)) return;
  const n = 8, cx = p.pos.x + p.width / 2, y = p.pos.y - 22;
  const low = hz.o2 < 0.25;
  if (low && Math.floor(state.frame / 8) % 2) return;
  for (let i = 0; i < n; i++) {
    const fill = Math.max(0, Math.min(1, hz.o2 * n - i));
    const x = cx + (i - (n - 1) / 2) * 11;
    ctx.strokeStyle = low ? '#EF4444' : '#E0F2FE'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.stroke();
    if (fill > 0) {
      ctx.fillStyle = low ? 'rgba(239, 68, 68, 0.8)' : 'rgba(125, 211, 252, 0.85)';
      ctx.beginPath(); ctx.arc(x, y, 4.5 * fill, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2, y - 2, 1.5, 1.5);
    }
  }
  if (low) { ctx.fillStyle = '#EF4444'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('AIR!', cx, y - 10); ctx.textAlign = 'left'; }
};

/** Out of air: he panics, blows out a huge last bubble, goes limp and blue, and floats up belly first. */
const drawDrowning = (ctx: Ctx, state: GameState, hz: Hazards) => {
  if (hz.drownT <= 0 || !hz.drownAt) return;
  const t = hz.drownT, at = hz.drownAt, p = state.player;
  const cx = at.x + p.width / 2, cy0 = at.y + p.height / 2;
  // (a stand-in far off in the world, so nothing round the real one gets drawn with it)
  const body = {
    ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: false, vel: { x: 0, y: t < 50 ? -6 : 2 },
    invincibilityTimer: 0, pushbackTimer: t < 50 ? 5 : 0, hurtTimer: 0, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, swimming: false,
  };
  let x = cx, y = cy0, rot = 0;
  if (t < 50) {
    // Flailing: shaking, arms going
    x += Math.sin(t * 1.3) * 4; y += Math.sin(t * 0.9) * 3; rot = Math.sin(t * 0.7) * 0.4;
  } else {
    // Limp, rolling over belly up and drifting to the surface, then bobbing there
    const k = Math.min(1, (t - 50) / 90);
    rot = -Math.PI / 2 * Math.min(1, (t - 50) / 30) * p.facing;
    y = cy0 + (at.surface - 4 - cy0) * (1 - Math.pow(1 - k, 2));
    if (k >= 1) y += Math.sin(t * 0.08) * 3;
  }
  const blue = t < 50 ? t / 50 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.filter = `hue-rotate(${Math.round(150 * blue)}deg) saturate(${1 + blue * 0.6}) brightness(${1 - blue * 0.15})`;
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  // (drawn even once the death screen's up: he's still floating there)
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  // X'd out eyes once he's gone limp (drawn over where his face ends up)
  if (t >= 80) {
    const fx = x + (rot === 0 ? 0 : -p.facing * 26), fy = y - 6;
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
    for (const dx of [-4, 4]) { ctx.beginPath(); ctx.moveTo(fx + dx - 2, fy - 2); ctx.lineTo(fx + dx + 2, fy + 2); ctx.moveTo(fx + dx + 2, fy - 2); ctx.lineTo(fx + dx - 2, fy + 2); ctx.stroke(); }
  }
  // His air: a stream of bubbles while he panics, then one enormous last one
  if (t < 40) {
    for (let i = 0; i < 4; i++) {
      const by = cy0 - 20 - ((t * 3 + i * 17) % 60);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx + Math.sin(t * 0.3 + i) * 8, by, 3 + (i % 2) * 2, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (t < 110) {
    const k = (t - 40) / 70;
    const by = cy0 - 30 - k * (cy0 - 30 - at.surface), r = 6 + Math.min(1, (t - 40) / 12) * 18;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.95)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, by, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(cx - r * 0.35, by - r * 0.35, r * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  // "BLUB." and a little fish giving him a nibble
  ctx.fillStyle = '#E0F2FE'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
  if (t > 20 && t < 60) ctx.fillText('BLUB BLUB', cx, cy0 - 50);
  if (t >= 110 && t < DROWN_FRAMES + 60) {
    // (the bubble pops at the surface)
    if (t < 120) ctx.fillText('*POP*', cx, at.surface - 14);
  }
  ctx.textAlign = 'left';
  if (t > 120) {
    const fx = x + 30 + Math.sin(t * 0.05) * 16, fy = y + 18 + Math.sin(t * 0.2) * 2;
    ctx.fillStyle = '#FB923C';
    ctx.beginPath(); ctx.ellipse(fx, fy, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx + 7, fy); ctx.lineTo(fx + 13, fy - 4); ctx.lineTo(fx + 13, fy + 4); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(fx - 5, fy - 2, 2, 2);
  }
};
