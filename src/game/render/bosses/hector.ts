// Hector Hurricane's sprite: a disgraced Channel 7 weatherman who makes his own weather now. Lacquered TV
// hair gone grey at the temples, a spray tan, teeth like a toilet showroom, one of his forty-one
// windbreakers with the collar popped (foil-lined, so the satellites can't read him) over a shirt and
// tie, and the weather clicker in his hand. Drawn in the boss's local space (0,0 = his top-left corner),
// in an 80x80 box.

import { vortexSpin, vortexShape, vortexGripLevel } from '../../bosses/hector';
import { Enemy } from '../../../types';
import { FaceStyle, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#E8955B', SKIN_DARK = '#B8693A';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#F9BF8F', brow: '#3F2A1D', iris: '#0E7490',
  jaw: 'square', age: 0.35, bags: '#A9582C', lips: '#A4502A',
};
const JACKET = '#16A085', JACKET_DARK = '#0E6B58', JACKET_LIGHT = '#48C9B0';

export const drawHector = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const f = facingOf(e);
  const gore = goreOf(e);
  const storm = e.bossState === 'hurricane';
  const mood = moodOf(e, frame, { hurricane: 'manic', jumping: 'fierce' });
  const b = breath(frame);
  const gust = storm ? Math.sin(frame * 0.6) : Math.sin(frame * 0.08) * 0.3;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // Loafers and pressed navy slacks
  shoe(ctx, 30, 80, 14, 5, f, '#18181B', '#000000');
  shoe(ctx, 50, 80, 14, 5, f, '#18181B', '#000000');
  ctx.fillStyle = '#1E293B';
  ctx.beginPath(); ctx.moveTo(23, 54); ctx.lineTo(57, 54); ctx.lineTo(56, 76); ctx.lineTo(43, 76); ctx.lineTo(40, 62); ctx.lineTo(37, 76); ctx.lineTo(24, 76); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#334155'; ctx.fillRect(30, 57, 0.6, 18); ctx.fillRect(50, 57, 0.6, 18);

  ctx.save(); ctx.translate(0, -b);
  // Shirt and tie at the open neck
  ctx.fillStyle = '#F1F5F9'; ctx.fillRect(34, 32, 12, 12);
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath(); ctx.moveTo(38.6, 33); ctx.lineTo(41.4, 33); ctx.lineTo(42.2, 43 + gust); ctx.lineTo(40, 45 + gust); ctx.lineTo(37.8, 43 + gust); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(38.8, 33, 2.4, 2);
  // The windbreaker: panels, white piping, zip half down, a 7 on the chest
  ctx.fillStyle = JACKET;
  ctx.beginPath(); ctx.moveTo(18, 34); ctx.lineTo(35, 32); ctx.lineTo(38, 45); ctx.lineTo(42, 45); ctx.lineTo(45, 32); ctx.lineTo(62, 34); ctx.lineTo(61, 57); ctx.lineTo(19, 57); ctx.closePath(); ctx.fill();
  ctx.fillStyle = JACKET_DARK; ctx.fillRect(18, 35, 3.5, 22); ctx.fillRect(19, 53, 42, 4);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(19, 44, 17, 1); ctx.fillRect(44, 44, 17, 1);
  ctx.fillStyle = JACKET_LIGHT; ctx.fillRect(24, 37, 8, 1); ctx.fillRect(48, 37, 8, 1);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(39.4, 45, 1.2, 12);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(51, 40, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0E6B58'; ctx.font = 'bold 5px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('7', 51, 40.3);
  // Loose flapping in the wind
  if (storm) {
    ctx.fillStyle = JACKET;
    ctx.beginPath(); ctx.moveTo(19, 50); ctx.lineTo(12 - gust * 3, 55); ctx.lineTo(19, 57); ctx.fill();
    ctx.beginPath(); ctx.moveTo(61, 50); ctx.lineTo(68 + gust * 3, 55); ctx.lineTo(61, 57); ctx.fill();
  }
  bodyBlood(ctx, gore, [[28, 45, 3.5], [52, 49, 3], [40, 38, 2.5], [24, 52, 3], [47, 54, 2.5], [33, 39, 2.5]], frame);

  // Arms: the clicker hand up, presenting the weather; both flung wide in the storm
  for (const side of [-1, 1]) {
    const sx = 40 + side * 20, sy = 37;
    const clickerArm = side === f;
    let ex, ey, hx, hy;
    if (storm) { ex = sx + side * 9; ey = sy - 4 + gust; hx = sx + side * 18; hy = sy - 10 + gust * 2; }
    else if (clickerArm) { ex = sx + side * 7; ey = sy + 6; hx = sx + side * 12; hy = sy - 2 + Math.sin(frame * 0.05); }
    else { ex = sx + side * 3; ey = sy + 10; hx = sx + side * 3; hy = sy + 19; }
    limb(ctx, sx, sy, ex, ey, 7.5, JACKET, JACKET_DARK);
    limb(ctx, ex, ey, hx, hy, 6.5, JACKET, JACKET_DARK);
    hand(ctx, hx, hy, 3.6, SKIN, SKIN_DARK);
    if (clickerArm) {
      // The clicker: changes the forecast
      ctx.fillStyle = '#27272A'; ctx.fillRect(hx - 1.5, hy - 7, 3, 7);
      ctx.fillStyle = frame % 30 < 4 ? '#F87171' : '#DC2626'; ctx.fillRect(hx - 0.8, hy - 6, 1.6, 1.6);
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(hx - 0.8, hy - 3.6, 1.6, 0.8);
    }
  }

  // The head: TV hair (whipped about in the storm), the popped, foil-lined collar
  drawHead(ctx, headAt(e, f, 40, 19), FACE, mood, frame, gore, {
    back: () => {
      foil(ctx, [-13, 4, -15, 10, -9, 15, -6, 11], frame, 1);
      foil(ctx, [13, 4, 15, 10, 9, 15, 6, 11], frame, 3);
    },
    hair: () => {
      ctx.fillStyle = '#4A3222';
      ctx.beginPath();
      ctx.moveTo(-11.5, -4); ctx.quadraticCurveTo(-13, -15, -3, -16.5); ctx.quadraticCurveTo(8, -18.5, 12, -10);
      ctx.quadraticCurveTo(6, -13.5, 0, -11.5); ctx.quadraticCurveTo(-6, -11, -10, -7); ctx.closePath(); ctx.fill();
      // The swoop at the front, lacquered to a shine
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(12, -18, 13, -11); ctx.quadraticCurveTo(8, -14, 2, -13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7A5A42'; ctx.fillRect(-4, -15.4, 8, 0.8); ctx.fillRect(3, -16.2, 5, 0.6);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-11.6, -8, 1.6, 4); // grey at the temples
      if (storm) {
        // Strands torn loose
        ctx.strokeStyle = '#4A3222'; ctx.lineWidth = 0.8;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(-6 + i * 4, -15.5);
          ctx.quadraticCurveTo(-8 + i * 4 + gust * 3, -20, -12 + i * 4 + gust * 5, -21 - i); ctx.stroke();
        }
      }
      // An earpiece, its wire down into the collar
      ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-12.2, -2.5, 1.4, 1.8);
      ctx.strokeStyle = '#D6D3D1'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(-11.5, -0.7); ctx.quadraticCurveTo(-12, 6, -9, 12); ctx.stroke();
    },
  });
  ctx.restore();

  // Hurricane weather round him
  if (storm) {
    ctx.save();
    ctx.translate(40, 40);
    ctx.strokeStyle = 'rgba(200, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const rx = (Math.random() - 0.5) * 300, ry = (Math.random() - 0.5) * 300;
      const len = 20 + Math.random() * 30, inward = rx < 0 ? 1 : -1; // blown in toward the eye of the storm
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + inward * len, ry + len / 2); ctx.stroke();
    }
    if (Math.random() > 0.7) {
      ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 2; ctx.shadowColor = '#FFFF00'; ctx.shadowBlur = 10;
      ctx.beginPath();
      let lx = (Math.random() - 0.5) * 150, ly = (Math.random() - 0.5) * 150;
      ctx.moveTo(lx, ly);
      for (let j = 0; j < 4; j++) { lx += (Math.random() - 0.5) * 40; ly += (Math.random() - 0.5) * 40; ctx.lineTo(lx, ly); }
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
};

/**
 * The vortex round him during the hurricane (world space): a spinning funnel of
 * wind bands with debris whipping round it, dust churning at its base and air
 * rushing in from the sides. It darkens and flashes red as it gets its grip.
 */
export const drawHectorVortex = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const spin = vortexSpin(e);
  if (spin <= 0) return;
  const { cx, floor, top, radiusAt } = vortexShape(e);
  const grip = vortexGripLevel(e);
  const yanking = grip >= 1;
  const t = frame * 0.18;
  ctx.save();

  // Air rushing in from both sides
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const y = top + ((i * 37) % (floor - top));
    const prog = ((frame * (yanking ? 14 : 7) + i * 53) % 260) / 260;
    const x0 = cx + side * (380 - prog * 300);
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.45 * prog * spin})`;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo(x0 - side * 30, y + 6, x0 - side * 60, y + 2);
    ctx.stroke();
  }

  // Dust churning round the base
  for (let i = 0; i < 9; i++) {
    const a = t * 1.3 + i * 0.7;
    const r = radiusAt(floor - 6) + 14;
    ctx.fillStyle = `rgba(168, 162, 158, ${0.35 * spin})`;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r, floor - 6 + Math.sin(a) * 4, 12 + (i % 3) * 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spinning bands of wind stacked up the funnel
  const bands = 11;
  for (let b = 0; b < bands; b++) {
    const y = floor - (b + 0.5) * (floor - top) / bands;
    const r = radiusAt(y);
    const phase = t * (1.6 - b * 0.06) + b * 0.9;
    const tint = yanking && frame % 6 < 3 ? '248, 113, 113' : grip > 0.5 ? '203, 213, 225' : '226, 232, 240';
    // Back half, faint
    ctx.strokeStyle = `rgba(${tint}, ${0.18 * spin})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.22, 0, Math.PI + phase % 1, Math.PI * 2 - 0.3); ctx.stroke();
    // Front half, bold streaks that wrap round
    ctx.strokeStyle = `rgba(${tint}, ${(0.45 + grip * 0.25) * spin})`;
    ctx.lineWidth = 2.5 + grip * 1.5;
    for (let s2 = 0; s2 < 2; s2++) {
      const a0 = (phase + s2 * Math.PI) % (Math.PI * 2);
      ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.22, 0, a0, a0 + 1.4); ctx.stroke();
    }
  }

  // Debris whipping round it: leaves, grit and the odd turd
  for (let i = 0; i < 12; i++) {
    const y = top + 10 + ((i * 29) % (floor - top - 20));
    const r = radiusAt(y) * 0.95;
    const a = t * (2 + (i % 3) * 0.4) + i * 1.7;
    const depth = Math.sin(a); // behind him when negative
    const x = cx + Math.cos(a) * r;
    ctx.globalAlpha = spin * (depth < 0 ? 0.45 : 1);
    ctx.fillStyle = i % 4 === 0 ? '#5D4037' : i % 4 === 1 ? '#4CAF50' : i % 4 === 2 ? '#8D6E63' : '#9E9E9E';
    ctx.save();
    ctx.translate(x, y + depth * r * 0.2);
    ctx.rotate(a * 2);
    if (i % 4 === 0) { ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(-3, -2, 6 + (i % 3), 4);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // The rim flares as it gets its grip, and strobes once it's yanking you in
  if (grip > 0.3) {
    const r = radiusAt(top);
    ctx.strokeStyle = yanking ? (frame % 6 < 3 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.8)') : `rgba(248, 250, 252, ${grip * 0.6})`;
    ctx.lineWidth = yanking ? 4 : 2;
    ctx.beginPath(); ctx.ellipse(cx, top, r, r * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
};
