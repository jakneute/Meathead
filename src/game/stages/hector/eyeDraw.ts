// The Eye of the Storm: a giant bloodshot human eyeball in the middle of the
// hurricane. Its pupil follows you; it squeezes shut, and bawls when charged. Hurt, it gets more bloodshot. And a different horrible
// death for each weapon.

import type { Enemy, WeaponType } from '../../../types';
import type { GameState } from '../../state';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';
import { EyeFight, EYE_CX, EYE_CY, EYE_R, EYE_HP, eyePupil } from './eye';

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Blend two #RRGGBB colors (k = 0 all a, 1 all b). */
const mix = (a: string, b: string, k: number) => {
  const c = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map(i => Math.round(c(a, i) + (c(b, i) - c(a, i)) * k)).join(', ')})`;
};

const centre = () => ({ x: COURSE.eye.x + EYE_CX, y: COURSE.eye.y + EYE_CY });

/** The sclera: a big white ball with shading, veins spreading as it's hurt. */
const eyeball = (ctx: Ctx, cx: number, cy: number, r: number, hurt: number, f: number, tint = '#F8FAFC') => {
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.7, tint); g.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // Veins crawling in from the edge (more the more it's hurt)
  const veins = 6 + Math.floor(hurt * 14);
  ctx.strokeStyle = `rgba(185, 28, 28, ${0.45 + hurt * 0.4})`; ctx.lineWidth = 1.5;
  for (let i = 0; i < veins; i++) {
    const a = (i / veins) * Math.PI * 2 + 0.3;
    let x = cx + Math.cos(a) * r * 0.98, y = cy + Math.sin(a) * r * 0.98;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 1; k <= 4; k++) {
      const rr = r * (0.98 - k * (0.1 + hurt * 0.05));
      const wig = Math.sin(i * 7.1 + k * 3.3 + f * 0.02) * 0.12;
      x = cx + Math.cos(a + wig) * rr; y = cy + Math.sin(a + wig) * rr;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

/** Iris and pupil at (px, py): a stormy grey-blue iris with a swirl, a black pupil. */
const iris = (ctx: Ctx, px: number, py: number, r: number, dilate: number, f: number, color = '#3B5B80') => {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, r * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + f * 0.01; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * r * 0.16, py + Math.sin(a) * r * 0.16); ctx.lineTo(px + Math.cos(a + 0.4) * r * 0.4, py + Math.sin(a + 0.4) * r * 0.4); ctx.stroke(); }
  ctx.fillStyle = '#050608'; ctx.beginPath(); ctx.arc(px, py, r * (0.17 + dilate * 0.14), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(px - r * 0.12, py - r * 0.12, r * 0.07, 0, Math.PI * 2); ctx.fill();
};

/** Eyelids closing over it (0 open, 1 shut). */
const lids = (ctx: Ctx, cx: number, cy: number, r: number, shut: number) => {
  if (shut <= 0) return;
  ctx.fillStyle = '#C08A6B';
  const reach = r * 2 * shut;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r + 1, 0, Math.PI * 2); ctx.clip();
  ctx.fillRect(cx - r - 2, cy - r - 2, r * 2 + 4, reach * 0.55);
  ctx.fillRect(cx - r - 2, cy + r + 2 - reach * 0.45, r * 2 + 4, reach * 0.45);
  ctx.strokeStyle = '#6B3F2A'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - r, cy - r - 2 + reach * 0.55); ctx.quadraticCurveTo(cx, cy - r + reach * 0.55 + 10, cx + r, cy - r - 2 + reach * 0.55); ctx.stroke();
  ctx.restore();
  // Lashes
  if (shut > 0.8) { ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(cx + i * r * 0.2, cy + 2); ctx.lineTo(cx + i * r * 0.24, cy + 14); ctx.stroke(); } }
};

export const drawEye = (ctx: Ctx, state: GameState, f: EyeFight, e: Enemy) => {
  const { x: cx, y: cy } = centre();
  const hurt = 1 - e.health / EYE_HP;
  const t = state.frame;
  // A swirl of storm round it
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'; ctx.lineWidth = 6;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(cx, cy, EYE_R + 22 + k * 14, t * 0.03 + k, t * 0.03 + k + 2.2); ctx.stroke(); }
  ctx.restore();
  const bob = Math.sin(t * 0.05) * 3;
  // (charged in the eye: red raw, fading back over a few seconds)
  const sore = clamp01(f.sore / 120);
  eyeball(ctx, cx, cy + bob, EYE_R, Math.max(hurt, sore), t, (e.hitFlash || 0) > 0 ? '#FECACA' : sore > 0 ? mix('#F1F5F9', '#F87171', sore) : '#F1F5F9');
  const pp = eyePupil(f);
  iris(ctx, pp.x, pp.y + bob, EYE_R, 0.2, t, sore > 0.5 ? '#7F1D1D' : '#3B5B80');
  // Bawling: brimming along the lower lid and streaming down
  if (f.sore > 0) {
    ctx.fillStyle = `rgba(125, 211, 252, ${0.35 + sore * 0.4})`;
    ctx.beginPath(); ctx.ellipse(cx, cy + EYE_R * 0.82 + bob, EYE_R * 0.75, 6, 0, 0, Math.PI * 2); ctx.fill();
    for (const side of [-1, 1]) {
      const sx = cx + side * EYE_R * 0.55, len = 30 + ((t * 3) % 40);
      ctx.fillRect(sx - 3, cy + EYE_R * 0.8 + bob, 6, len);
    }
  }
  const shut = f.attack === 'blink' ? Math.min(1, f.attackT / 6, (75 - f.attackT) / 6) : f.phase === 'intro' ? clamp01(1 - f.t / 40) : 0;
  lids(ctx, cx, cy + bob, EYE_R, shut);
};

// ---------------------------------------------------------------------------
// Its deaths, by weapon (drawn in the arena where it hung)
// ---------------------------------------------------------------------------

export const drawEyeCorpse = (ctx: Ctx, state: GameState, weapon: WeaponType, t0: number) => {
  const { x: cx, y: cy } = centre();
  const t = state.frame - t0;
  const f = state.frame;
  const drop = Math.min(1, t / 70);
  ctx.save();
  switch (weapon) {
    case 'SHOTGUN': {
      // Frozen solid, then it shatters into icy chunks
      if (t < 50) { eyeball(ctx, cx, cy, EYE_R, 1, f, '#BAE6FD'); iris(ctx, cx, cy, EYE_R, 0.6, f, '#0EA5E9'); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(i) * EYE_R, cy + Math.sin(i * 1.3) * EYE_R); ctx.stroke(); } }
      else for (let i = 0; i < 14; i++) { const k = t - 50; const a = i * 0.45; ctx.fillStyle = i % 3 ? '#E0F2FE' : '#7DD3FC'; ctx.save(); ctx.translate(cx + Math.cos(a) * k * 3, cy + Math.sin(a) * k * 2 + k * k * 0.05); ctx.rotate(k * 0.1 + i); ctx.fillRect(-10, -8, 20, 16); ctx.restore(); }
      break;
    }
    case 'FLAMETHROWER': {
      // Cooked like a boiled egg: white going brown, the iris melting down it, smoke
      eyeball(ctx, cx, cy + drop * 40, EYE_R * (1 - drop * 0.1), 1, f, '#D6C3A5');
      ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(cx, cy + drop * 40 + drop * 20, EYE_R * 0.42, EYE_R * 0.42 + drop * 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(68, 64, 60, ${0.5 - (t % 30) / 60})`; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(cx - 30 + i * 20, cy - EYE_R - (t % 60) - i * 10, 10 + (t % 60) * 0.2, 0, Math.PI * 2); ctx.fill(); }
      if (t < 40) { ctx.fillStyle = '#F97316'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - 60 + i * 24, cy - 40); ctx.lineTo(cx - 52 + i * 24, cy - 70 - (f * 3 + i * 7) % 20); ctx.lineTo(cx - 44 + i * 24, cy - 40); ctx.fill(); } }
      break;
    }
    case 'BOULDER': {
      // Popped under a rock: a splat of white and red with the iris squeezed out the side
      ctx.fillStyle = '#F1F5F9'; ctx.beginPath(); ctx.ellipse(cx, cy + 50, EYE_R * 1.5, EYE_R * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#B91C1C'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(cx - 100 + i * 28, cy + 58, 10, 4, 0, 0, Math.PI * 2); ctx.fill(); }
      iris(ctx, cx + EYE_R * 1.3, cy + 44, EYE_R * 0.6, 1, f);
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.arc(cx, cy + 10, 40, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'TSUNAMI': {
      // Waterlogged: it swells, goes bright red, and bursts
      const swell = 1 + Math.min(0.4, t / 80);
      if (t < 70) { eyeball(ctx, cx, cy, EYE_R * swell, 1, f, '#FCA5A5'); iris(ctx, cx, cy, EYE_R * swell, 1, f); }
      else for (let i = 0; i < 20; i++) { const k = t - 70; ctx.fillStyle = i % 2 ? '#7DD3FC' : '#B91C1C'; ctx.beginPath(); ctx.arc(cx + Math.cos(i) * k * 4, cy + Math.sin(i * 1.7) * k * 3 + k * k * 0.06, 6, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'NEEDLES': {
      // Overdosed: the pupil blows wide open, veins go pink, it spins, syringes stuck all over it
      ctx.translate(cx, cy + drop * 60); ctx.rotate(t * 0.12 * (1 - drop * 0.5)); ctx.translate(-cx, -cy);
      eyeball(ctx, cx, cy, EYE_R, 1, f, '#F5D0FE');
      iris(ctx, cx, cy, EYE_R, 2.2, f, '#A21CAF');
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i * 1.05; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * EYE_R * 0.8, cy + Math.sin(a) * EYE_R * 0.8); ctx.lineTo(cx + Math.cos(a) * (EYE_R + 24), cy + Math.sin(a) * (EYE_R + 24)); ctx.stroke(); ctx.fillStyle = '#F472B6'; ctx.fillRect(cx + Math.cos(a) * (EYE_R + 20) - 3, cy + Math.sin(a) * (EYE_R + 20) - 3, 6, 6); }
      break;
    }
    case 'TASER': {
      // Fried: flickering to an x-ray of its nerves, then a smoking black husk with an X for a pupil
      if (t < 50 && f % 6 < 3) { ctx.fillStyle = '#0891B2'; ctx.beginPath(); ctx.arc(cx, cy, EYE_R, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); for (let i = 0; i < 8; i++) { ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(i * 0.8) * EYE_R * 1.3, cy + Math.sin(i * 0.8) * EYE_R * 1.3); } ctx.stroke(); }
      else { eyeball(ctx, cx, cy + drop * 40, EYE_R * 0.9, 1, f, '#44403C'); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 14, cy + drop * 40 - 14); ctx.lineTo(cx + 14, cy + drop * 40 + 14); ctx.moveTo(cx + 14, cy + drop * 40 - 14); ctx.lineTo(cx - 14, cy + drop * 40 + 14); ctx.stroke(); }
      break;
    }
    case 'SLUDGE': {
      // Melting: sliding down into a green drip, the iris last to go
      const melt = Math.min(1, t / 90);
      ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(cx, cy + EYE_R * melt, EYE_R * (1 + melt * 0.4), EYE_R * (1 - melt * 0.6), 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#84CC16'; for (let i = 0; i < 6; i++) ctx.fillRect(cx - 60 + i * 24, cy + EYE_R * melt, 6, 30 + ((t * 2 + i * 11) % 80));
      if (melt < 0.9) iris(ctx, cx, cy + EYE_R * melt * 0.6, EYE_R * (1 - melt * 0.5), 0.8, f, '#365314');
      break;
    }
    case 'OIL_ROCKET': {
      // Blown open and dripping black, one half hanging off
      ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.arc(cx - 20, cy + drop * 30, EYE_R * 0.8, 0.5, Math.PI * 1.6); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 40, cy + 60 + drop * 50, EYE_R * 0.6, -0.8, Math.PI * 0.9); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - 50, cy - 20 + drop * 30, 6, 30);
      ctx.fillStyle = '#111111'; for (let i = 0; i < 6; i++) ctx.fillRect(cx - 50 + i * 18, cy + 40 + drop * 30, 4, 20 + ((t + i * 13) % 60));
      break;
    }
    default: {
      // Shot to pieces: holes all through it, leaking, deflating and drooping
      const sag = Math.min(1, t / 100);
      ctx.save(); ctx.translate(cx, cy + sag * 50); ctx.scale(1 + sag * 0.3, 1 - sag * 0.45);
      eyeball(ctx, 0, 0, EYE_R, 1, f);
      iris(ctx, 10, 20 * sag, EYE_R, 1, f);
      ctx.fillStyle = '#450A0A'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 2.1) * EYE_R * 0.7, Math.sin(i * 1.4) * EYE_R * 0.7, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = 'rgba(226, 232, 240, 0.8)'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 40 + i * 20, cy + 40 + sag * 50, 3, 10 + ((t * 2 + i * 9) % 50));
    }
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------

export const drawEyeHud = (ctx: Ctx, state: GameState, f: EyeFight) => {
  if (f.phase !== 'intro' && f.phase !== 'fight') return;
  const e = f.eye;
  if (!e) return;
  const fill = f.phase === 'intro' ? Math.min(1, f.t / 70) : Math.max(0, e.health / EYE_HP);
  const L = 330, R = 780;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(L - 10, 12, R - L + 20, 40);
  ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 2; ctx.strokeRect(L - 10, 12, R - L + 20, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FECACA'; ctx.textAlign = 'left';
  ctx.fillText('EYE OF THE STORM', L, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L, 34, R - L, 10);
  ctx.fillStyle = f.hpFlash > 0 ? '#FEF3C7' : (e.health < EYE_HP * 0.5 ? '#DC2626' : '#B91C1C');
  ctx.fillRect(L, 34, (R - L) * fill, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = L; x < R; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
  void CANVAS_WIDTH;
};
