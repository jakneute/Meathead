// The wave in the power room, drawn: the water over the floor, live, and the
// two of them in it with it going through them (a flicker between them and
// their X-rayed skeletons), cooked black after, and keeling over stiff.

import type { GameState } from '../../core/state';
import type { Enemy } from '../../../types';
import { COURSE } from './course';
import type { PowerRoom } from './power';
import { surgeZap, surgeFall, surgeCooked, FLOOD_FRAMES, SURGE } from './power';
import { drawSkipPrompt } from '../../platform/skip';
import { drawPlayer } from '../../render/player/player';
import { drawKindEnemy } from '../../render/enemies';

type Ctx = CanvasRenderingContext2D;

/** Frames where it's showing their bones. */
const xray = (f: number, zap: number) => zap > 0 && f % (zap > 1 ? 4 : 6) < (zap > 1 ? 2 : 3);

/**
 * One of them, standing at (footX, footY), `h` tall: shaking and flickering while it goes through them, lifted
 * up on their toes when it's bad, cooked black after, going over backwards like a plank at the end.
 */
/** Where the head is on one of them, from the feet, facing right: the skull's middle and size, the crown (where the hair
 * stands up off), and the eyes (their height, how far out each one is). */
type HeadAt = { x: number; y: number; r: number; crown: number; eyeY: number; eyeX: [number, number] };
/** A head at the top of a box `h` tall (Meathead's). */
const headAtTop = (h: number): HeadAt => { const r = h * 0.11; return { x: 2, y: -h + r + 2, r, crown: -h - 2, eyeY: -h - 2 + h * 0.1, eyeX: [2, 7] }; };
/** The minion's (one of the townsfolk: his head up over his box, his eyes where his own are drawn). */
const MINION_HEAD: HeadAt = { x: 1, y: -62, r: 7.6, crown: -74, eyeY: -64.6, eyeX: [3, 8.4] };

const drawZapped = (ctx: Ctx, pw: PowerRoom, who: 'minion' | 'meathead', footX: number, footY: number, h: number, facing: number, f: number, body: () => void, hd: HeadAt = headAtTop(h)) => {
  const zap = surgeZap(pw), fall = surgeFall(pw, who), cooked = surgeCooked(pw);
  ctx.save();
  if (zap > 0) ctx.translate((f % 2 ? 1.5 : -1.5) * zap, zap > 1 ? -4 - (f % 3) : (f % 3 ? 0 : -1));
  if (fall > 0) {
    // Over backwards about his heels, stiff as a board
    ctx.translate(footX, footY - 2); ctx.rotate(-facing * (Math.PI / 2) * fall); ctx.translate(-footX, -(footY - 2));
  }
  const bones = xray(f, zap);
  ctx.filter = bones ? 'brightness(0.45) sepia(1) hue-rotate(150deg) saturate(5)' : cooked >= 1 ? 'brightness(0.22) saturate(0.2)' : cooked > 0 ? 'brightness(0.55) saturate(0.6)' : 'none';
  body();
  ctx.filter = 'none';
  if (bones) drawBones(ctx, footX, footY, h, facing, hd);
  if (cooked > 0 && !bones) {
    // Hair stood straight up, and smoke off the top of him
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1.5;
    const top = footY + hd.crown;
    ctx.beginPath();
    for (let i = -3; i <= 3; i++) { ctx.moveTo(footX + i * 2.5, top + 4); ctx.lineTo(footX + i * 3.5 + (i % 2) * 1.5, top - 5 - (i % 2 ? 2 : 0)); }
    ctx.stroke();
    // (the whites of his eyes, blinking out of the black)
    if (cooked >= 1 && f % 90 > 6) { ctx.fillStyle = '#F8FAFC'; for (const ex of hd.eyeX) ctx.fillRect(footX + facing * ex - 1, footY + hd.eyeY, 2.5, 2.5); }
  }
  if (zap > 0) {
    // It crawling over them
    ctx.strokeStyle = '#E0FFFF'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 2 + zap; i++) {
      let x = footX + ((f * 7 + i * 13) % 30) - 15, y = footY - h;
      ctx.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (f + i + k) % 2 ? 7 : -7; y += h / 5; ctx.lineTo(x, y); }
    }
    ctx.stroke();
  }
  ctx.restore();
};

/** A person's skeleton, glowing white through the X-ray flicker. */
const drawBones = (ctx: Ctx, x: number, footY: number, h: number, facing: number, hd: HeadAt) => {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const skullR = hd.r, top = footY + hd.y, sx = x + facing * hd.x;
  ctx.beginPath(); ctx.arc(sx, top, skullR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0E7490';
  ctx.fillRect(sx - skullR * 0.6, top - skullR * 0.3, skullR * 0.45, skullR * 0.45);
  ctx.fillRect(sx + skullR * 0.15, top - skullR * 0.3, skullR * 0.45, skullR * 0.45);
  const neck = top + skullR, hip = footY - h * 0.42, w = h * 0.34;
  ctx.beginPath();
  ctx.moveTo(x, neck); ctx.lineTo(x, hip);
  for (let i = 0; i < 4; i++) { const ry = neck + 5 + i * (hip - neck - 8) / 4; ctx.moveTo(x - w * 0.4, ry); ctx.lineTo(x + w * 0.4, ry); }
  ctx.moveTo(x - w * 0.3, hip); ctx.lineTo(x + w * 0.3, hip);
  ctx.moveTo(x - w * 0.2, hip); ctx.lineTo(x - w * 0.3, footY - 2);
  ctx.moveTo(x + w * 0.2, hip); ctx.lineTo(x + w * 0.3, footY - 2);
  // (arms flung out, fingers spread)
  ctx.moveTo(x - w * 0.45, neck + 5); ctx.lineTo(x - w * 0.9, neck - 6);
  ctx.moveTo(x + w * 0.45, neck + 5); ctx.lineTo(x + w * 0.9, neck - 6);
  ctx.stroke();
  ctx.restore();
};

/** Barry's man, in it. */
export const drawSurgeMinion = (ctx: Ctx, e: Enemy, state: GameState, pw: PowerRoom) =>
  drawZapped(ctx, pw, 'minion', e.pos.x + e.width / 2, e.pos.y + e.height, e.height, e.facing || -1, state.frame, () => drawKindEnemy(ctx, e, state), MINION_HEAD);

/** Meathead, in it (the stage hides him and draws him here), then the water over their feet. */
export const drawSurge = (ctx: Ctx, state: GameState, pw: PowerRoom) => {
  if (pw.phase !== 'surge') return;
  const p = state.player, f = state.frame;
  const body = { ...p, hidden: false, vel: { x: 0, y: 0 } };
  drawZapped(ctx, pw, 'meathead', p.pos.x + p.width / 2, p.pos.y + p.height, p.height, p.facing, f,
    () => drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false }));
  drawWater(ctx, state, pw);
};

/** The water spreading over the floor from where he set it off, lit up when it's live. */
const drawWater = (ctx: Ctx, state: GameState, pw: PowerRoom) => {
  const r = COURSE.power, f = state.frame, zap = surgeZap(pw);
  const k = Math.min(1, pw.surgeT / FLOOD_FRAMES);
  const x1 = pw.floodX - (pw.floodX - r.x1) * k, x2 = pw.floodX + (r.x2 - pw.floodX) * k;
  const Y = r.floor, depth = 9 * Math.min(1, pw.surgeT / 25);
  if (depth <= 0) return;
  ctx.save();
  const live = zap > 0 && f % 4 < 2;
  ctx.fillStyle = live ? 'rgba(165, 243, 252, 0.75)' : 'rgba(56, 132, 200, 0.55)';
  ctx.beginPath();
  ctx.moveTo(x1, Y);
  for (let x = x1; x <= x2; x += 12) ctx.lineTo(x, Y - depth + Math.sin(x * 0.08 + f * 0.25) * 1.5);
  ctx.lineTo(x2, Y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(224, 242, 254, 0.5)';
  for (let x = x1 + ((f * 2) % 40); x < x2; x += 40) ctx.fillRect(x, Y - depth + 1, 10, 1);
  if (zap > 0) {
    // Arcs racing across the water, and down into it off each generator
    ctx.strokeStyle = '#F0FDFF'; ctx.lineWidth = zap > 1 ? 2.5 : 1.5;
    ctx.beginPath();
    for (let i = 0; i < 3 * zap; i++) {
      let x = x1 + ((f * 37 + i * 211) % Math.max(1, x2 - x1)), y = Y - depth / 2;
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) { x += 14 + ((f + s * 3 + i) % 3) * 4; y = Y - depth / 2 + ((f + s + i) % 2 ? -4 : 4); ctx.lineTo(x, y); }
    }
    for (const gx of COURSE.generators) {
      let x = gx, y = Y - 150;
      ctx.moveTo(x, y);
      for (let s = 0; s < 7; s++) { x = gx + ((f * 3 + s * 7) % 30) - 15; y += 150 / 7; ctx.lineTo(x, y); }
    }
    ctx.stroke();
  }
  ctx.restore();
};

/** The whole room lighting up blue-white each time it cracks. Screen space. */
export const drawSurgeFlash = (ctx: Ctx, state: GameState, pw: PowerRoom, w: number, h: number) => {
  if (pw.phase === 'surge' && pw.beat < SURGE.length) drawSkipPrompt(ctx, w);
  const zap = surgeZap(pw);
  if (!zap || state.frame % (zap > 1 ? 5 : 8) > 1) return;
  ctx.fillStyle = `rgba(207, 250, 254, ${zap > 1 ? 0.35 : 0.22})`;
  ctx.fillRect(0, 0, w, h);
};
