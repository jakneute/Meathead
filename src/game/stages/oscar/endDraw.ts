// Out back of the field office, drawn: the brick back of it, the NO SMOKING
// sign, the two of them under it with their cigarettes (then what's left of
// them, up the wall), the bike in a heap at the foot of it burning, the machine
// gun flung on top; and him, going over backwards off the bike.

import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { drawPlayer } from '../../render/player/player';
import { drawChopperBike, drawLmgProp } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Ending } from './ending';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The field office's brick back wall, and its sign. */
export const drawEndBack = (ctx: Ctx, state: GameState, en: Ending) => {
  const W = COURSE.end.wall;
  if (state.camera.x > W + 700 || state.camera.x + 800 < W - 200) return;
  const top = Y - 200;
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(W, top, 420, 200);
  ctx.fillStyle = '#9A3412';
  for (let r = 0; r < 20; r++) for (let c = 0; c < 18; c++) { const o = r % 2 ? 12 : 0; ctx.fillRect(W + c * 24 + o, top + r * 10, 21, 7); }
  ctx.fillStyle = '#44403C'; ctx.fillRect(W - 6, top - 10, 432, 12); // the roof edge
  ctx.fillStyle = '#1C1917'; ctx.fillRect(W + 250, Y - 110, 60, 110); // back door
  ctx.fillStyle = '#FACC15'; ctx.fillRect(W + 300, Y - 60, 5, 5);
  // The sign
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(W + 30, top + 40, 120, 60);
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 4; ctx.strokeRect(W + 30, top + 40, 120, 60);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.fillText('NO SMOKING', W + 90, top + 64);
  ctx.font = 'bold 7px monospace'; ctx.fillText('FLAMMABLE AREA', W + 90, top + 78); ctx.fillText('BY ORDER OF MANAGEMENT', W + 90, top + 90); ctx.textAlign = 'left';
  // A butt can by the door, overflowing
  ctx.fillStyle = '#6B7280'; ctx.fillRect(W + 190, Y - 36, 18, 36);
  ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 6; k++) ctx.fillRect(W + 186 + k * 4, Y - 38 - (k % 2) * 2, 3, 2);
  // What's left of the two of them, up the wall
  if (en.smokers === 'paste') drawPaste(ctx, W, state.frame - en.splatAt);
};

/** Two of the union up against the wall: a red smear, a hard hat, a cigarette still smoking on the ground. */
const drawPaste = (ctx: Ctx, W: number, since: number) => {
  const k = Math.min(1, since / 8);
  ctx.save();
  for (let i = 0; i < 26; i++) {
    const r = (6 + hash(i) * 20) * k;
    ctx.fillStyle = ['#7F1D1D', '#991B1B', '#B91C1C', '#450A0A'][i % 4];
    ctx.beginPath(); ctx.ellipse(W + 6 + hash(i + 3) * 70, Y - 20 - hash(i + 9) * 110, r, r * 0.6, hash(i + 5) * 3, 0, Math.PI * 2); ctx.fill();
  }
  // Drips running down it
  ctx.fillStyle = '#7F1D1D';
  for (let i = 0; i < 8; i++) { const len = Math.min(60, Math.max(0, since - 10) * 0.5) * hash(i + 20); ctx.fillRect(W + 10 + i * 8, Y - 100 + hash(i) * 50, 3, len); }
  // Bits: a hard hat, a boot, a hi-vis rag, a cigarette
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(W - 30, Y - 4, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(W - 60, Y - 8, 14, 8);
  ctx.fillStyle = '#F97316'; ctx.fillRect(W + 20, Y - 60, 20, 8);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(W - 80, Y - 3, 10, 2); ctx.fillStyle = '#EF4444'; ctx.fillRect(W - 70, Y - 3, 2, 2);
  ctx.restore();
};

/** The two of them having their smoke, or the heap, burning, with the gun on it; the bike going in. */
export const drawEndMid = (ctx: Ctx, state: GameState, en: Ending) => {
  const S = COURSE.end.smokers, W = COURSE.end.wall;
  if (state.camera.x > W + 900 || state.camera.x + 800 < S - 900) return;
  const f = state.frame;
  if (en.smokers === 'smoking') {
    drawSmoker(ctx, S - 34, 1, f, '#1D4ED8');
    drawSmoker(ctx, S + 12, -1, f + 40, '#15803D');
  }
  // The bike: loose and heading in, or a burning heap at the foot of the wall
  if (en.bike.state === 'loose') drawChopperBike(ctx, en.bike.x, Y, en.bike.rot, en.bike.x / 12, '#7F1D1D');
  if (en.bike.state === 'crashed') {
    ctx.save(); ctx.translate(W - 36, Y); ctx.rotate(-0.5);
    drawChopperBike(ctx, 0, 0, 0, 0, '#1C1917');
    ctx.restore();
    for (let k = 0; k < 5; k++) {
      const h = 26 + Math.sin(f * 0.35 + k) * 8, x = W - 70 + k * 12;
      ctx.fillStyle = 'rgba(234, 88, 12, 0.85)'; ctx.beginPath(); ctx.moveTo(x - 8, Y); ctx.quadraticCurveTo(x, Y - h, x + 8, Y); ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 4, Y); ctx.quadraticCurveTo(x, Y - h * 0.6, x + 4, Y); ctx.fill();
    }
    for (let k = 0; k < 3; k++) { const q = ((f + k * 30) % 90) / 90; ctx.fillStyle = `rgba(41, 37, 36, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(W - 40 + q * 20, Y - 40 - q * 140, 10 + q * 24, 0, Math.PI * 2); ctx.fill(); }
  }
  if (en.gun.state !== 'held') drawLmgProp(ctx, en.gun.x, en.gun.y, en.gun.rot);
};

/** One of them, stood having a smoke: a hard hat, a vest, the cigarette going, a hand going as he complains. */
const drawSmoker = (ctx: Ctx, x: number, facing: number, f: number, shirt: string) => {
  ctx.save(); ctx.translate(x, Y); ctx.scale(facing, 1);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-9, -28, 8, 22); ctx.fillRect(2, -28, 8, 22);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-10, -6, 11, 6); ctx.fillRect(1, -6, 12, 6);
  ctx.fillStyle = shirt; ctx.fillRect(-12, -56, 24, 28);
  ctx.fillStyle = '#F97316'; ctx.fillRect(-12, -56, 7, 28); ctx.fillRect(5, -56, 7, 28);
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(2, -64, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(2, -67, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(-9, -68, 22, 2);
  // The hand with the cigarette, up to the mouth and down
  const up = Math.sin(f * 0.03) > 0.6;
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(10, up ? -62 : -44, 6, 5);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(15, up ? -62 : -44, 7, 2);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(22, up ? -62 : -44, 2, 2);
  const q = (f % 50) / 50;
  ctx.fillStyle = `rgba(214, 211, 209, ${0.6 * (1 - q)})`; ctx.beginPath(); ctx.arc(24 + q * 6, (up ? -64 : -46) - q * 24, 2 + q * 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

/** Him, going over backwards off the bike (the real him's hidden while he's up there). */
export const drawEndFront = (ctx: Ctx, state: GameState, en: Ending) => {
  if (en.phase !== 'flip') return;
  const p = state.player, fl = en.flip;
  const cy = fl.y - p.height / 2;
  const body = { ...p, hidden: false, moto: false, jetski: false, skiing: false, isGrounded: false, vel: { x: 0, y: -2 }, pos: { x: fl.x - p.width / 2, y: fl.y - p.height } };
  ctx.save(); ctx.translate(fl.x, cy); ctx.rotate(fl.rot); ctx.translate(-fl.x, -cy);
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: 'LMG', showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};
