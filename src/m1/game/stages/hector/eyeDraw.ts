// The Eye of the Storm: a giant bloodshot human eyeball in the middle of the
// hurricane. Its pupil follows you; it squeezes shut, and bawls when charged. Hurt, it gets more bloodshot. And a different horrible
// death for each weapon.

import type { Enemy, WeaponType } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFlameLicks } from '../../render/fx/fireball';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';
import { EyeFight, EYE_CX, EYE_CY, EYE_R, EYE_HP, eyePupil } from './eye';
import { drawBloodPool } from '../../render/spatter';

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Blend two #RRGGBB colors (k = 0 all a, 1 all b). */
const mix = (a: string, b: string, k: number) => {
  const c = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map(i => Math.round(c(a, i) + (c(b, i) - c(a, i)) * k)).join(', ')})`;
};

const centre = () => ({ x: COURSE.eye.x + EYE_CX, y: COURSE.eye.y + EYE_CY });

/** The sclera: a big white ball with shading, veins spreading as it's hurt. */
export const eyeball = (ctx: Ctx, cx: number, cy: number, r: number, hurt: number, f: number, tint = '#F8FAFC') => {
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
export const iris = (ctx: Ctx, px: number, py: number, r: number, dilate: number, f: number, color = '#3B5B80') => {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, r * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + f * 0.01; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * r * 0.16, py + Math.sin(a) * r * 0.16); ctx.lineTo(px + Math.cos(a + 0.4) * r * 0.4, py + Math.sin(a + 0.4) * r * 0.4); ctx.stroke(); }
  ctx.fillStyle = '#050608'; ctx.beginPath(); ctx.arc(px, py, r * (0.17 + dilate * 0.14), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(px - r * 0.12, py - r * 0.12, r * 0.07, 0, Math.PI * 2); ctx.fill();
};

/** A teardrop hanging from (x, y) (its point), r round at the bottom: inked, lit, a glint on it. */
const teardrop = (ctx: Ctx, x: number, y: number, r: number) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + r * 1.1, y + r * 1.4, x + r, y + r * 2.1); ctx.arc(x, y + r * 2.1, r, 0, Math.PI); ctx.quadraticCurveTo(x - r * 1.1, y + r * 1.4, x, y); ctx.closePath(); };
  path(); ctx.fillStyle = '#38BDF8'; ctx.fill(); ctx.strokeStyle = '#075985'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.save(); path(); ctx.clip();
  ctx.fillStyle = '#7DD3FC'; ctx.fillRect(x - r, y, r * 1.2, r * 3.2);
  ctx.fillStyle = '#0EA5E9'; ctx.fillRect(x + r * 0.35, y + r * 1.2, r, r * 2.2);
  ctx.restore();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(x - r * 0.5), Math.round(y + r * 1.6), Math.max(2, Math.round(r * 0.4)), Math.max(2, Math.round(r * 0.5)));
};

/**
 * Bawling: a film of tears welling along the bottom of it, brimming over at both corners and running down in streams
 * that wobble as they go, a drop swelling at the end of each and falling, big, splashing apart far below; more of it
 * the sorer it is.
 */
const drawTears = (ctx: Ctx, cx: number, cy: number, t: number, sore: number, left: number) => {
  const r = EYE_R;
  // (the film welling up along the lower rim, inside the eye: a glossy band, a white line of light along it)
  const brim = 6 + sore * 8 + Math.sin(t * 0.3) * 1.5;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); ctx.arc(cx, cy, r - 1, Math.PI * 0.12, Math.PI * 0.88); ctx.arc(cx, cy - brim, r - 1, Math.PI * 0.86, Math.PI * 0.14, true); ctx.closePath();
  ctx.fillStyle = `rgba(56, 189, 248, ${(0.45 + sore * 0.3).toFixed(3)})`; ctx.fill();
  ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy - brim, r - 3, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke();
  ctx.restore();
  // (over the rim at both corners, and down)
  for (const side of [-1, 1]) {
    const a = Math.PI / 2 - side * 0.95, sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * (r - 2);
    const len = 40 + sore * 70;
    // the stream: stepped, wobbling as it runs, narrower further down, a dark edge and a lit one
    for (let k = 0; k < len; k += 4) {
      const w = Math.max(3, Math.round(11 * (1 - k / len * 0.4) * (0.6 + sore * 0.4)));
      const wob = Math.round(Math.sin(k * 0.12 + t * 0.25 + side) * 2);
      const x = Math.round(sx + side * k * 0.08 + wob - w / 2);
      ctx.fillStyle = '#0369A1'; ctx.fillRect(x - 1, sy + k, w + 2, 4);
      ctx.fillStyle = '#38BDF8'; ctx.fillRect(x, sy + k, w, 4);
      ctx.fillStyle = '#BAE6FD'; ctx.fillRect(x + 1, sy + k, 1, 4);
    }
    // the drop at the end of it, swelling, then letting go and falling (a new one swelling behind it)
    const cyc = 46, q = ((t + (side > 0 ? 23 : 0)) % cyc) / cyc;
    const ex = sx + side * len * 0.08, ey = sy + len;
    if (q < 0.55) teardrop(ctx, ex, ey - 4, 4 + q * 10 * (0.6 + sore * 0.4));
    else {
      const u = (q - 0.55) / 0.45, fy = ey + u * u * 260;
      teardrop(ctx, ex, fy, 9 * (0.6 + sore * 0.4));
      // (and where the last one landed: a splash, apart in drops)
      if (u > 0.85) for (let k = 0; k < 5; k++) { const ang = Math.PI * (1.1 + k * 0.2); ctx.fillStyle = k % 2 ? '#7DD3FC' : '#E0F2FE'; ctx.fillRect(Math.round(ex + Math.cos(ang) * (u - 0.85) * 120), Math.round(ey + 270 + Math.sin(ang) * (u - 0.85) * 80), 3, 3); }
    }
  }
  void left;
};

/** Eyelids closing over it (0 open, 1 shut). */
export const lids = (ctx: Ctx, cx: number, cy: number, r: number, shut: number) => {
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
  if (f.sore > 0) drawTears(ctx, cx, cy + bob, t, sore, f.sore);
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
      if (t < 40) drawFlameLicks(ctx, cx + 12, cy - 38, 150, 46, f, { seed: 17, n: 12, k: Math.min(1, (40 - t) / 12) });
      break;
    }
    case 'BOULDER': {
      // Popped under a rock: a splat of white and red with the iris squeezed out the side
      ctx.fillStyle = '#F1F5F9'; ctx.beginPath(); ctx.ellipse(cx, cy + 50, EYE_R * 1.5, EYE_R * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      drawBloodPool(ctx, cx, cy + 61, 108, 171, { color: '#B91C1C' });
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
