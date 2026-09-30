// Oily Oscar's body (his launcher, cigarette and taser meter are drawn by ./oscarGear.ts): oil man, used
// car salesman, motivational speaker. A silver aluminized fire suit (he sells it as a lifestyle), streaked
// with crude, the hood down, a bolo tie, a Stetson over slicked-back hair, a pencil moustache and a
// salesman's smile. Drawn in the boss's local space (0,0 = his top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { FaceStyle, drawHead, headAt, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath } from './kit';

const SKIN = '#DDA27A', SKIN_DARK = '#A8714E';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#F0C4A2', brow: '#111111', iris: '#78350F',
  jaw: 'square', age: 0.4, bags: '#8C5A3C', lips: '#8A4B32', goldTooth: true,
};

export const drawOscar = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const f = (e.oscarFacing || -1) as 1 | -1;
  const gore = goreOf(e);
  const mood = moodOf(e, frame, { aiming: 'fierce', shooting: 'roar', taser_held: 'shock', ash_face: 'dazed' });
  const b = breath(frame);
  const zap = e.bossState === 'taser_held' ? (frame % 4 < 2 ? 0.8 : -0.8) : 0;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);
  ctx.translate(zap, 0);

  // Cowboy boots
  for (const x of [30, 50]) {
    shoe(ctx, x, 80, 14, 9, f, '#5B3417', '#2A1709');
    ctx.fillStyle = '#7C4A21'; ctx.fillRect(x - 5 + f * 2, 72.5, 10, 0.8);
  }
  // Suit legs: silver, creased, oil-streaked
  foil(ctx, [23, 54, 38, 54, 38, 73, 23, 73], frame, 1);
  foil(ctx, [42, 54, 57, 54, 57, 73, 42, 73], frame, 4);
  ctx.fillStyle = '#111111'; ctx.fillRect(26, 60, 2, 7); ctx.fillRect(48, 64, 3, 5);

  ctx.save(); ctx.translate(0, -b);
  // The suit's torso, silver foil all over, crude streaked down it
  foil(ctx, [19, 34, 61, 34, 60, 57, 20, 57], frame, 2);
  ctx.fillStyle = 'rgba(55, 65, 81, 0.35)'; ctx.fillRect(19, 34, 4, 23);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(39.4, 36, 1.2, 21); // seam
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(20, 49, 40, 1.2);
  ctx.fillStyle = '#111111';
  for (const [x, y, w, h] of [[45, 36, 4, 9], [27, 44, 3, 8], [52, 47, 3, 6]] as const) { ctx.beginPath(); ctx.roundRect(x, y, w, h, 1.5); ctx.fill(); }
  ctx.fillStyle = 'rgba(17, 17, 17, 0.8)'; ctx.fillRect(46, 45, 1.2, 4);
  // Bolo tie at the collar
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(37, 33); ctx.lineTo(39.5, 40); ctx.lineTo(39.5, 46); ctx.moveTo(43, 33); ctx.lineTo(40.5, 40); ctx.lineTo(40.5, 46); ctx.stroke();
  ctx.fillStyle = '#CA8A04'; ctx.beginPath(); ctx.arc(40, 39.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0EA5E9'; ctx.beginPath(); ctx.arc(40, 39.5, 1.1, 0, Math.PI * 2); ctx.fill();
  // Name tag: he's always selling
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(49, 38, 8, 4.5);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(49, 38, 8, 1.4);
  ctx.fillStyle = '#374151'; ctx.fillRect(50, 40.5, 6, 0.7);
  // The hood, down behind his neck
  foil(ctx, [26, 31, 54, 31, 51, 36, 29, 36], frame, 5);
  bodyBlood(ctx, gore, [[33, 42, 3.5], [51, 52, 3], [24, 50, 3], [44, 47, 2.5], [36, 55, 2.5], [56, 42, 2.5]], frame);

  // Arms: silver sleeves, bare hands, one up on the launcher's grip
  for (const side of [-1, 1]) {
    // (the cigarette arm is the gear's while he flicks it)
    if (side === -f && e.bossState === 'flicking') continue;
    const sx = 40 + side * 20, sy = 37;
    const holding = side === f; // up on the launcher's grip
    const ex = holding ? sx + side * 9 : sx + side * 3, ey = holding ? sy + 4 : sy + 10;
    const hx = holding ? 40 + side * 34 : sx + side * 2 + Math.sin(frame * 0.06 + side) * 1.2, hy = holding ? 29 : sy + 19;
    limb(ctx, sx, sy, ex, ey, 7.5, '#C4CAD0', '#8E98A2');
    limb(ctx, ex, ey, hx, hy, 6.5, '#C4CAD0', '#8E98A2');
    ctx.fillStyle = '#6B7280'; ctx.fillRect(hx - 3, hy - 4.5, 6, 1.2);
    hand(ctx, hx, hy, 3.6, SKIN, SKIN_DARK);
  }

  // The head: slick hair, pencil moustache, the Stetson
  drawHead(ctx, headAt(e, f, 40, 19), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.beginPath(); ctx.moveTo(-11.5, -3); ctx.quadraticCurveTo(-12.5, -12, -4, -12.5); ctx.lineTo(10, -11); ctx.lineTo(-9, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4B5563'; ctx.fillRect(-9, -10.5, 8, 0.6); ctx.fillRect(-10.5, -6, 1, 4);
      // Pencil moustache
      ctx.fillStyle = '#111111';
      ctx.fillRect(-3.5, 2.6, 4, 0.9); ctx.fillRect(1.8, 2.5, 5, 0.9);
    },
    hat: () => {
      // Stetson: wide brim, pinched crown, a band
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath(); ctx.ellipse(0, -11, 17, 3.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-8, -20); ctx.quadraticCurveTo(-3, -18, 0, -21); ctx.quadraticCurveTo(3, -18, 8, -20); ctx.lineTo(9, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6B4220'; ctx.fillRect(-9, -14.5, 18, 2.2);
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(4, -14.3, 2, 1.8);
      ctx.fillStyle = '#A87945'; ctx.fillRect(-14, -12.2, 10, 0.8);
    },
  });
  ctx.restore();
  ctx.restore();
};
