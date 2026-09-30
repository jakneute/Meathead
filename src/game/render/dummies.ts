// The practice dummies, drawn: a wannabe boxer (a skinny kid in headgear and gloves too big for him, bouncing on his
// toes, a hopeful look), and a man hanging off a bunch of party balloons, legs going. See game/range.ts.

import type { Enemy } from '../../types';

type Ctx = CanvasRenderingContext2D;

export const isDummy = (e: Enemy) => e.id.startsWith('dummy-');

export const drawDummy = (ctx: Ctx, e: Enemy, frame: number) => {
  if (e.id.startsWith('dummy-ground')) drawBoxer(ctx, e, frame);
  else drawBalloonMan(ctx, e, frame);
};

/** The boxer: 50 wide, 70 tall, feet at the bottom of his box. Faces the way he's going. */
const drawBoxer = (ctx: Ctx, e: Enemy, frame: number) => {
  const cx = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  const dir = e.vel.x < 0 ? -1 : 1;
  const bob = Math.abs(Math.sin(frame * 0.18 + e.pos.x * 0.01)) * 3;
  ctx.save();
  ctx.translate(cx, feet);
  ctx.scale(dir, 1);
  // Legs, skinny, in socks and boxing boots
  ctx.fillStyle = '#E8B48A'; ctx.fillRect(-9, -26 - bob, 6, 20); ctx.fillRect(3, -26 - bob, 6, 20);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-9, -10, 6, 5); ctx.fillRect(3, -10, 6, 5);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-11, -6, 9, 6); ctx.fillRect(2, -6, 9, 6);
  // Trunks, a size too big, the waistband up round his ribs
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-12, -38 - bob, 24, 14);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-12, -40 - bob, 24, 3); ctx.fillRect(-2, -38 - bob, 4, 14);
  // A torso with nothing much on it
  ctx.fillStyle = '#E8B48A'; ctx.fillRect(-9, -58 - bob, 18, 20);
  ctx.fillStyle = '#C9906A'; ctx.fillRect(-1, -52 - bob, 2, 10); ctx.fillRect(-7, -46 - bob, 5, 1); ctx.fillRect(2, -46 - bob, 5, 1);
  // Head in red headgear, a mouthguard, big hopeful eyes
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(0, -66 - bob, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E8B48A'; ctx.fillRect(-4, -69 - bob, 11, 9);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1, -68 - bob, 3, 3); ctx.fillRect(5, -68 - bob, 2, 3);
  ctx.fillStyle = '#111827'; ctx.fillRect(2, -67 - bob, 1, 2); ctx.fillRect(5, -67 - bob, 1, 2);
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(1, -62 - bob, 6, 2);
  // Guard up: gloves way too big for him, one by his chin, one out in front
  const jab = Math.sin(frame * 0.12 + e.pos.x) > 0.85 ? 6 : 0;
  ctx.fillStyle = '#E8B48A'; ctx.fillRect(4, -56 - bob, 8, 4);
  ctx.fillStyle = '#DC2626';
  ctx.beginPath(); ctx.arc(14 + jab, -56 - bob, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -63 - bob, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(12 + jab, -60 - bob, 3, 2); ctx.fillRect(6, -67 - bob, 3, 2);
  ctx.restore();
};

/** The balloon man: his box (40 x 30) is him, legs dangling below it; the balloons are up on their strings above. */
const BALLOONS = ['#EF4444', '#FACC15', '#22C55E', '#3B82F6', '#EC4899', '#F97316', '#A855F7'];
const drawBalloonMan = (ctx: Ctx, e: Enemy, frame: number) => {
  const cx = e.pos.x + e.width / 2, top = e.pos.y;
  const sway = Math.sin(frame * 0.05 + e.pos.x * 0.02) * 4;
  const dir = e.vel.x < 0 ? -1 : 1;
  ctx.save();
  // The strings, from his belt up to the bunch
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.8)'; ctx.lineWidth = 1;
  const knot = { x: cx, y: top + 14 };
  const bunch = BALLOONS.map((c, i) => ({ c, x: cx + sway + (i - 3) * 9 + Math.sin(i * 2.1) * 4, y: top - 58 - Math.abs(i - 3) * -4 - (i % 2) * 10 }));
  ctx.beginPath(); for (const b of bunch) { ctx.moveTo(knot.x, knot.y); ctx.quadraticCurveTo((knot.x + b.x) / 2 + sway, (knot.y + b.y) / 2, b.x, b.y + 9); } ctx.stroke();
  for (const b of bunch) {
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(b.x, b.y, 7.5, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(b.x - 4, b.y - 5, 2, 3);
  }
  // Him: a regular guy in a polo shirt and slacks, arms up hanging on to the strings, legs kicking
  ctx.translate(cx, top); ctx.scale(dir, 1);
  const kick = Math.sin(frame * 0.3 + e.pos.x) * 4;
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(-10, -6, 4, 12); ctx.fillRect(6, -6, 4, 12); // (arms up to the knot)
  ctx.fillStyle = '#16A34A'; ctx.fillRect(-9, 4, 18, 14);
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(0, -3, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(-7, -10, 14, 4);
  ctx.fillStyle = '#111827'; ctx.fillRect(1, -4, 2, 2); ctx.fillRect(4, -4, 2, 2);
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.arc(3, 1, 2, 0, Math.PI * 2); ctx.fill(); // (mouth open: he'd like to come down now)
  ctx.fillStyle = '#A16207'; ctx.fillRect(-9, 17, 18, 3); // belt
  ctx.fillStyle = '#57534E'; ctx.fillRect(-8, 20, 7, 10 + kick); ctx.fillRect(1, 20, 7, 10 - kick);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-9, 29 + kick, 9, 4); ctx.fillRect(0, 29 - kick, 9, 4);
  ctx.restore();
};
