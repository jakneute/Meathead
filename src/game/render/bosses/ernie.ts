// Ernie Earthquake's sprite: a retired seismologist and professional grump. Stooped, bald on top with
// white tufts, bushy brows, jowls and thick glasses; a cardigan knitted in rock strata over a shirt with a
// seismograph strip hanging out of the pocket, slacks up to his ribs, a rock hammer on his belt and his
// hearing aid wrapped in foil ("they listen through it"). Drawn in the boss's local space (0,0 = his
// top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { KICK_FRAMES } from '../../bosses/ernie';
import { FaceStyle, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#E8C4A8', SKIN_DARK = '#B98E72';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#F8E1CF', brow: '#F5F5F4', iris: '#57534E',
  jaw: 'jowly', age: 1, bags: '#9C7A66', nose: 'big', lips: '#A16B5A', bushy: true,
};
const KNIT = '#7C5A3A', KNIT_DARK = '#5B4128';

export const drawErnie = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const f = facingOf(e);
  const gore = goreOf(e);
  const lifting = e.bossState === 'attacking';
  const running = e.bossState === 'running';
  const mood = moodOf(e, frame, { attacking: 'fierce', perched: 'fierce', running: 'fierce', stunned_drop: 'dazed', frozen: 'shock' });
  const b = breath(frame, 0.05);
  const step = running ? Math.sin(frame * 0.5) * 3 : 0;
  // Kicking a rock at him (Meathead stunned): the front leg drawn back in the windup, then swung through and up
  const kicking = (e.punishT ?? 0) > 0 || (e.kickT ?? 0) > 0;
  const kickAngle = (e.punishT ?? 0) > 0 ? -0.7 * Math.min(1, (8 - e.punishT!) / 4) : (e.kickT ?? 0) > 0 ? 1.15 * Math.sin(Math.PI * Math.min(1, (KICK_FRAMES - e.kickT! + 3) / KICK_FRAMES)) : 0;
  const frontX = f > 0 ? 50 : 30;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // Orthopedic shoes and slacks hitched up high (the kicking one's up off the floor)
  if (!kicking || frontX !== 30) shoe(ctx, 30 + step, 80, 15, 6, f, '#3F2A1A', '#1C1917');
  if (!kicking || frontX !== 50) shoe(ctx, 50 - step, 80, 15, 6, f, '#3F2A1A', '#1C1917');
  ctx.fillStyle = '#6B6258';
  if (!kicking) { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58 - step, 75); ctx.lineTo(43 - step, 75); ctx.lineTo(40, 60); ctx.lineTo(37 + step, 75); ctx.lineTo(22 + step, 75); ctx.closePath(); ctx.fill(); }
  // (kicking: the seat of them, and the leg he's standing on; the other one's drawn swinging, below)
  else if (f > 0) { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58, 60); ctx.lineTo(40, 61); ctx.lineTo(37, 75); ctx.lineTo(22, 75); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58, 75); ctx.lineTo(43, 75); ctx.lineTo(40, 61); ctx.lineTo(22, 60); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#524A42'; ctx.fillRect(21, 50, 3, kicking && f < 0 ? 10 : 25); if (!kicking || frontX !== 30) ctx.fillRect(30 + step, 58, 0.7, 16); if (!kicking || frontX !== 50) ctx.fillRect(50 - step, 58, 0.7, 16);
  if (kicking) {
    // (the kicking leg: from the hip, swung about it, the shoe on the end; the slacks' own leg there painted over first)
    const hipX = frontX, hipY = 56, a = kickAngle * f, len = 22;
    const fx = hipX + Math.sin(a) * len, fy = hipY + Math.cos(a) * len;
    limb(ctx, hipX, hipY, fx, fy, 11, '#6B6258', '#524A42');
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-a * 0.6); shoe(ctx, 0, 4, 15, 6, f, '#3F2A1A', '#1C1917'); ctx.restore();
    // (the whoosh of it, on the way through)
    if ((e.kickT ?? 0) > KICK_FRAMES - 5) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hipX, hipY, len + 4, Math.PI / 2 - f * 0.2, Math.PI / 2 - f * 1.2, f > 0); ctx.stroke(); }
  }
  // Belt, and the rock hammer on it
  ctx.fillStyle = '#292524'; ctx.fillRect(21, 50, 38, 2.6);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(38.5, 50.2, 3, 2.2);
  const hx = 40 - f * 13;
  ctx.fillStyle = '#92400E'; ctx.fillRect(hx - 0.8, 51, 1.6, 10);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(hx - 3.5, 59.5, 7, 2.4); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(hx + 1, 59.5, 2.5, 1);

  ctx.save(); ctx.translate(f * 2, -b + 2);
  // Shirt, then the cardigan over it, knitted in bands like rock strata
  ctx.fillStyle = '#D6D3C4';
  ctx.fillRect(28, 32, 24, 20);
  ctx.fillStyle = '#9F8E6F'; for (let x = 29; x < 52; x += 4) ctx.fillRect(x, 32, 0.6, 20); // plaid
  ctx.fillStyle = '#B8A987'; for (let y = 35; y < 52; y += 4) ctx.fillRect(28, y, 24, 0.6);
  const bands = ['#7C5A3A', '#A0764C', '#6E4A2E', '#B08A5B', '#5E4027'];
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 17 : 51;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = bands[i];
      ctx.fillRect(x0, 33 + i * 4.2, 12, 4.4);
    }
    ctx.fillStyle = KNIT_DARK;
    for (let y = 34; y < 54; y += 2) ctx.fillRect(x0 + (y % 4 === 0 ? 2 : 5), y, 0.7, 0.9); // knit texture
  }
  ctx.fillStyle = KNIT_DARK; ctx.fillRect(17, 33, 3, 21);
  // A fault line running through the knit, glowing like the fissure it is
  ctx.save(); ctx.strokeStyle = '#F59E0B'; ctx.shadowColor = '#FFB300'; ctx.shadowBlur = 3; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(20, 36); ctx.lineTo(23, 41); ctx.lineTo(21, 45); ctx.lineTo(25, 51); ctx.stroke(); ctx.restore();
  // Buttons, and a pocket with the seismograph strip hanging out of it and pencils
  ctx.fillStyle = '#E7E5E4'; for (const y of [37, 42, 47]) { ctx.beginPath(); ctx.arc(52.5, y, 0.9, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#BFB59A'; ctx.fillRect(31, 36, 8, 7);
  ctx.fillStyle = '#FAFAF9'; ctx.fillRect(33, 34, 4, 17);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(35, 34);
  for (let y = 35; y < 51; y += 1) ctx.lineTo(35 + ((y * 7) % 5 - 2) * (y > 44 ? 0.9 : 0.35), y);
  ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(31.5, 32.5, 1, 5); ctx.fillStyle = '#2563EB'; ctx.fillRect(38, 33, 1, 4.5);
  bodyBlood(ctx, gore, [[43, 40, 3.5], [24, 44, 3], [46, 49, 3], [33, 47, 2.5], [55, 38, 2.5], [28, 38, 2.5]], frame);

  // Arms: cardigan sleeves, old hands (up under the boulder when he's lifting one)
  for (const side of [-1, 1]) {
    const sx = 40 + side * 19, sy = 36;
    const swing = running ? Math.sin(frame * 0.5 + (side > 0 ? Math.PI : 0)) * 6 : Math.sin(frame * 0.05) * 1;
    const ex = lifting ? sx + side * 4 : sx + side * 3 + swing * 0.3, ey = lifting ? sy - 10 : sy + 10;
    const hx2 = lifting ? sx - side * 4 : sx + side * 2 + swing, hy = lifting ? sy - 22 : sy + 19;
    limb(ctx, sx, sy, ex, ey, 7.5, KNIT, KNIT_DARK);
    limb(ctx, ex, ey, hx2, hy, 6.5, KNIT, KNIT_DARK);
    ctx.fillStyle = '#A0764C'; ctx.fillRect(hx2 - 3, hy - (lifting ? -2 : 3.5), 6, 1.5); // cuff
    hand(ctx, hx2, hy + (lifting ? -2 : 1.5), 3.6, SKIN, SKIN_DARK);
  }

  // The head, stuck forward the way old men's are: white tufts, glasses, the foil hearing aid, a pencil
  drawHead(ctx, headAt(e, f, 40, 20.5), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#F5F5F4';
      for (const [x, y, r] of [[-11, -7, 3], [-12, -3, 2.6], [-10, -10, 2.4], [10.5, -8, 2], [11, -5, 1.8]] as const) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      // A few long strands combed over the top
      ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-9, -11); ctx.quadraticCurveTo(-1, -16, 8, -11); ctx.moveTo(-8, -10); ctx.quadraticCurveTo(0, -14.5, 7, -10.5); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(-2, -12.3, 4, 0.8); // shine on the dome
      // Hearing aid, wrapped in foil, and a pencil over the ear
      foil(ctx, [-14.5, -5, -13, -8, -10.8, -7.5, -10.5, -2.5, -12.5, -1.5, -14.8, -2.5], frame, 5);
      ctx.fillStyle = '#FACC15'; ctx.save(); ctx.translate(-12, -8); ctx.rotate(-0.5); ctx.fillRect(-1, -6, 1.4, 9); ctx.fillStyle = '#F9A8D4'; ctx.fillRect(-1, -7.5, 1.4, 1.5); ctx.restore();
    },
    eyewear: () => {
      // Thick glasses: the eyes swim behind them
      ctx.strokeStyle = '#292524'; ctx.lineWidth = 1.1;
      ctx.strokeRect(-9, -7.2, 8, 7); ctx.strokeRect(0.5, -7.2, 8.2, 7);
      ctx.beginPath(); ctx.moveTo(-1, -4.5); ctx.lineTo(0.5, -4.5); ctx.moveTo(-9, -5); ctx.lineTo(-12, -4); ctx.stroke();
      ctx.fillStyle = 'rgba(191, 219, 254, 0.18)'; ctx.fillRect(-9, -7.2, 8, 7); ctx.fillRect(0.5, -7.2, 8.2, 7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(-8, -6.5, 1.8, 0.8); ctx.fillRect(1.5, -6.5, 1.8, 0.8);
    },
  });
  ctx.restore();

  // Knocked silly after a drop: cracks of light and birds going round
  if (e.bossState === 'stunned_drop') {
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.12 + i * 2.1;
      ctx.fillStyle = '#FDE047';
      ctx.beginPath(); ctx.arc(40 + Math.cos(a) * 18, -2 + Math.sin(a) * 4, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
};
