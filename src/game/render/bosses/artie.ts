// Artie Avalanche's sprite: a glaciologist who stopped writing papers. Puffy ice-blue parka gone
// crystalline at the shoulders, moon boots (indoors), a salt-and-pepper beard stiff with frost, snow goggles up on his
// forehead and his hood lined with emergency foil. Drawn in the boss's local space (0,0 = his top-left
// corner), in an 80x80 box.

import { THROW_WINDUP } from '../../bosses/artie';
import { Enemy } from '../../../types';
import { FaceStyle, Mood, drawHead, headAt, facingOf, goreOf, moodOf, inHead, limb, hand, foil, bodyBlood, breath } from './kit';

const FACE: FaceStyle = {
  skin: '#EBCFC4', shadow: '#B99AA0', highlight: '#FFF1EC', brow: '#4A3F37', iris: '#0EA5E9',
  jaw: 'long', age: 0.5, bags: '#8FA3B8', nose: 'red', lips: '#8FA3B8', bushy: true,
};
const PARKA = '#7FB3D5', PARKA_DARK = '#4F86AD', PARKA_LIGHT = '#B7D7EC', MITT = '#1E40AF';

export const drawArtie = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const f = facingOf(e);
  const gore = goreOf(e);
  const windup = (e.throwWindup ?? 0) > 0;
  const mood: Mood = windup ? 'fierce' : moodOf(e, frame, { attacking: 'fierce', jumping: e.isGroundedBoss ? 'fierce' : 'shock' });
  const b = breath(frame);
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);

  // Moon boots: huge, white, quilted
  for (const x of [29, 51]) {
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath(); ctx.roundRect(x - 10, 64, 20, 16, [7, 7, 3, 3]); ctx.fill();
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x - 10, 69, 20, 1.2); ctx.fillRect(x - 10, 74, 20, 1.2);
    ctx.fillStyle = '#38BDF8'; ctx.fillRect(x - 10, 78, 20, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 6, 65.5, 6, 1.5);
  }
  // Snow pants
  ctx.fillStyle = '#1E3A5F';
  ctx.fillRect(22, 56, 15, 10); ctx.fillRect(43, 56, 15, 10);
  ctx.fillStyle = '#152C47'; ctx.fillRect(22, 56, 3, 10); ctx.fillRect(43, 56, 3, 10);

  // The parka: quilted, puffed, crusted with frost at the hem
  ctx.save(); ctx.translate(0, -b);
  ctx.fillStyle = PARKA;
  ctx.beginPath(); ctx.roundRect(15, 32, 50, 29, [10, 10, 6, 6]); ctx.fill();
  ctx.fillStyle = PARKA_DARK;
  ctx.fillRect(15, 34, 5, 25);
  for (const y of [39, 46, 53]) { ctx.fillRect(16, y, 48, 1.2); ctx.fillStyle = PARKA_LIGHT; ctx.fillRect(20, y - 3, 40, 1); ctx.fillStyle = PARKA_DARK; }
  // Zip and a thermometer poking out of the chest pocket
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(39.3, 36, 1.4, 25);
  ctx.fillStyle = PARKA_DARK; ctx.fillRect(46, 41, 10, 7);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(52, 35, 2, 8);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(52.4, 40, 1.2, 3); disc(ctx, 53, 43.5, 1.4);
  // Frost along the hem
  ctx.fillStyle = '#F0F9FF';
  for (let x = 16; x < 64; x += 4) { ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x + 2, 64 + (x % 3)); ctx.lineTo(x + 4, 60); ctx.fill(); }
  bodyBlood(ctx, gore, [[33, 48, 4], [47, 55, 3.5], [24, 42, 3], [56, 50, 3], [36, 58, 3], [28, 53, 2.5]], frame);

  // Ice grown out of his shoulders
  shoulderIce(ctx, 17, 34, -1, frame);
  shoulderIce(ctx, 63, 34, 1, frame);

  // Arms: puffy sleeves, big mittens (up under the block when he's about to throw one)
  if (windup) {
    limb(ctx, 20, 38, 22, 6, 10, PARKA, PARKA_DARK);
    limb(ctx, 60, 38, 58, 6, 10, PARKA, PARKA_DARK);
    hand(ctx, 22, 2, 5, MITT, '#172554');
    hand(ctx, 58, 2, 5, MITT, '#172554');
  } else {
    const sway = Math.sin(frame * 0.07) * 1.5;
    limb(ctx, 19, 38, 14, 55 + sway, 10, PARKA, PARKA_DARK);
    limb(ctx, 61, 38, 66, 55 - sway, 10, PARKA, PARKA_DARK);
    hand(ctx, 14, 58 + sway, 5, MITT, '#172554');
    hand(ctx, 66, 58 - sway, 5, MITT, '#172554');
  }
  // Fur collar
  ctx.fillStyle = '#F1F5F9';
  for (let i = 0; i < 9; i++) disc(ctx, 26 + i * 3.5, 33 + Math.sin(i * 1.7) * 1, 3.2);
  ctx.fillStyle = '#CBD5E1';
  for (let i = 0; i < 9; i++) ctx.fillRect(25 + i * 3.5, 34.5, 1.5, 1);

  // The head: hood thrown back (lined with foil), wild white hair with icicles in it, goggles up, beard
  const h = headAt(e, f, 40, 19);
  drawHead(ctx, h, FACE, mood, frame, gore, {
    back: () => {
      ctx.fillStyle = PARKA_DARK;
      ctx.beginPath(); ctx.ellipse(-3, -1, 15, 15.5, 0, 0, Math.PI * 2); ctx.fill();
      foil(ctx, [-16, -4, -14, -12, -8, -16, 0, -17, 7, -15, 10, -12, 4, -10, -6, -9, -11, -2, -13, 6, -16, 4], frame, 2);
    },
    hair: () => {
      // Beard: salt and pepper (he's 44: going grey, not there yet), stiff with frost, ringing the jaw under his mouth
      ctx.fillStyle = '#5C5048';
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-10, 12, -2, 15); ctx.lineTo(0, 17); ctx.lineTo(3, 14.5);
      ctx.quadraticCurveTo(10, 12, 10.5, 1); ctx.lineTo(8.5, 2); ctx.quadraticCurveTo(7, 9.5, 1, 10); ctx.quadraticCurveTo(-6, 9.5, -8, 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A8A29E';
      for (let i = 0; i < 9; i++) ctx.fillRect(-8 + i * 2, 4 + ((i * 5) % 8), 0.7, 2.4);  // the grey coming through
      ctx.fillStyle = '#F1F5F9';
      for (let i = 0; i < 6; i++) ctx.fillRect(-7 + i * 2.8, 11.5 + (i % 2), 1.2, 1);      // frost on the ends
      // Icicles hanging off it
      ctx.fillStyle = '#BAE6FD';
      for (const x of [-4, 0.5, 4]) { ctx.beginPath(); ctx.moveTo(x - 0.8, 13); ctx.lineTo(x, 17.5 + (x % 2)); ctx.lineTo(x + 0.8, 13); ctx.fill(); }
      // Moustache (greyer than the rest)
      ctx.fillStyle = '#78716C';
      ctx.beginPath(); ctx.ellipse(-1.5, 2.6, 4, 1.05, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, 2.4, 3.2, 1, -0.2, 0, Math.PI * 2); ctx.fill();
      // Wild hair sticking up: dark, greying through, grey at the temples
      ctx.fillStyle = '#4A3F37';
      ctx.beginPath();
      ctx.moveTo(-11, -6); ctx.lineTo(-14, -12); ctx.lineTo(-9, -12); ctx.lineTo(-10, -17); ctx.lineTo(-4, -14);
      ctx.lineTo(-2, -19); ctx.lineTo(2, -14.5); ctx.lineTo(6, -18.5); ctx.lineTo(7, -13.5); ctx.lineTo(12, -15); ctx.lineTo(10, -10);
      ctx.lineTo(4, -12.5); ctx.lineTo(-4, -12); ctx.lineTo(-9, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A8A29E';
      ctx.fillRect(-6, -15, 0.8, 3); ctx.fillRect(1, -16, 0.8, 3); ctx.fillRect(7, -15, 0.8, 2.5); ctx.fillRect(-3, -13.5, 0.8, 2); ctx.fillRect(4, -14, 0.8, 2);
      ctx.fillStyle = '#D6D3D1';
      ctx.fillRect(-11.5, -9, 2, 3.5); ctx.fillRect(9.5, -11, 1.6, 3); // grey at the temples
    },
    hat: () => {
      // Snow goggles pushed up on his forehead
      ctx.fillStyle = '#1F2937'; ctx.fillRect(-12, -12.5, 24, 1.6);
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.roundRect(-8, -14.5, 7.5, 4.5, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(1.5, -14.5, 7.5, 4.5, 2); ctx.fill();
      ctx.fillStyle = '#38BDF8'; ctx.fillRect(-7, -13.6, 5.5, 2.8); ctx.fillRect(2.5, -13.6, 5.5, 2.8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(-6, -13.2, 1.5, 1); ctx.fillRect(3.5, -13.2, 1.5, 1);
    },
  });
  ctx.restore();

  // Frost breath
  if (frame % 40 < 22) {
    const t = (frame % 40) / 22;
    ctx.fillStyle = `rgba(240, 249, 255, ${0.65 * (1 - t)})`;
    inHead(ctx, h, () => { disc(ctx, 9 + t * 8, 5 - t * 3, 1.5 + t * 2.5); });
  }

  // Hefting an ice block overhead before a throw: it freezes together, then flashes as he's about to let go
  if (windup) {
    const k = 1 - e.throwWindup! / THROW_WINDUP;
    const size = 18 + Math.min(1, k * 1.6) * 42;
    const cx = 40, cy = -34;
    const flash = e.throwWindup! < 10 && frame % 4 < 2;
    ctx.fillStyle = flash ? '#FFFFFF' : 'rgba(174, 214, 241, 0.92)';
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    ctx.strokeStyle = flash ? '#7DD3FC' : '#EBF5FB';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(cx - size / 2 + 5, cy - size / 2 + 5, size * 0.25, size * 0.12);
    ctx.fillStyle = 'rgba(21, 67, 96, 0.35)';
    ctx.fillRect(cx - size / 2, cy + size * 0.2, size, size * 0.3);
    if (!flash && frame % 16 < 8) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx + size * 0.2, cy - size * 0.3, 3, 9);
      ctx.fillRect(cx + size * 0.2 - 3, cy - size * 0.3 + 3, 9, 3);
    }
  }
  ctx.restore();
};

const disc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

/** A cluster of ice crystals grown out through the parka's shoulder. */
const shoulderIce = (ctx: CanvasRenderingContext2D, x: number, y: number, side: number, frame: number) => {
  const shards: [number, number, number][] = [[0, -9, 3], [side * 5, -6, 2.5], [side * -4, -5, 2], [side * 8, -2, 2]];
  for (const [dx, dy, w] of shards) {
    ctx.fillStyle = '#93C5FD';
    ctx.beginPath(); ctx.moveTo(x + dx - w, y); ctx.lineTo(x + dx + side * 1.5, y + dy); ctx.lineTo(x + dx + w, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EFF6FF';
    ctx.beginPath(); ctx.moveTo(x + dx - w * 0.3, y); ctx.lineTo(x + dx + side * 1.5, y + dy); ctx.lineTo(x + dx + w * 0.2, y - 1); ctx.closePath(); ctx.fill();
  }
  if (frame % 80 < 6) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 0.5, y - 10, 1, 4); ctx.fillRect(x - 2, y - 8.5, 4, 1); }
};
