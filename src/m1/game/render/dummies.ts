// The practice dummies, drawn: a wannabe boxer (a skinny kid in headgear and gloves too big for him, bouncing on his
// toes, a hopeful look), and a man hanging off a bunch of party balloons, legs going. See game/range.ts.
// (Drawn the townsfolk's way: an ink line round every part, each part shaded in steps.)

import type { Enemy } from '../../types';
import { INK, ink, shaded, shadedTop, limb, dark, lite } from './npc/kit';

type Ctx = CanvasRenderingContext2D;

export const isDummy = (e: Enemy) => e.id.startsWith('dummy-');

export const drawDummy = (ctx: Ctx, e: Enemy, frame: number) => {
  if (e.id.startsWith('dummy-ground')) drawBoxer(ctx, e, frame);
  else drawBalloonMan(ctx, e, frame);
};

const SKIN = '#E8B48A', GLOVE = '#D42020', TRUNKS = '#1D4ED8';

/** A boxing glove at (x, y), r its size: the padded fist, the thumb tucked along it, the white cuff and its laces. */
const glove = (ctx: Ctx, x: number, y: number, r: number) => {
  ink(ctx, () => ctx.roundRect(x - r - 3.6, y - r * 0.55, 5, r * 1.1, 1.4), '#F8FAFC', 0.9);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - r - 3, y + r * 0.3, 4, 0.8);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = GLOVE; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = dark(GLOVE, 0.3); ctx.fillRect(x - r, y + r * 0.35, r * 2, r);
  ctx.fillStyle = dark(GLOVE, 0.15); ctx.fillRect(x + r * 0.45, y - r, r, r * 2);
  ctx.fillStyle = lite(GLOVE, 0.3); ctx.fillRect(x - r * 0.5, y - r * 0.75, r * 0.9, r * 0.4);
  ctx.fillStyle = lite(GLOVE, 0.7); ctx.fillRect(x - r * 0.3, y - r * 0.62, r * 0.4, r * 0.18);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // (the thumb, its seam)
  ctx.strokeStyle = dark(GLOVE, 0.45); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x - r * 0.15, y + r * 0.2, r * 0.55, Math.PI * 0.15, Math.PI * 0.95); ctx.stroke();
};

/** The boxer: 50 wide, 70 tall, feet at the bottom of his box. Faces the way he's going. */
const drawBoxer = (ctx: Ctx, e: Enemy, frame: number) => {
  const cx = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  const dir = e.vel.x < 0 ? -1 : 1;
  const bob = Math.abs(Math.sin(frame * 0.18 + e.pos.x * 0.01)) * 3;
  const jab = Math.sin(frame * 0.12 + e.pos.x) > 0.85 ? 6 : 0;
  ctx.save();
  ctx.translate(cx, feet);
  ctx.scale(dir, 1);
  // (his shadow on the mat)
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 13 - bob * 0.6, 2, 0, 0, Math.PI * 2); ctx.fill();
  // The back arm: up by his chin, the glove under his nose
  limb(ctx, -5, -54 - bob, 1, -50 - bob, 3.6, SKIN);
  // Legs, skinny (the knees knobblier than the thighs), up on his toes in socks and boxing boots
  for (const x of [-9, 3]) {
    shaded(ctx, () => ctx.rect(x, -26 - bob, 6, 18 + bob), SKIN, x, -26 - bob, 6, 18 + bob, 0.9);
    ctx.fillStyle = dark(SKIN, 0.25); ctx.fillRect(x + 1.4, -16 - bob * 0.5, 3, 0.8); ctx.fillStyle = lite(SKIN, 0.3); ctx.fillRect(x + 1.4, -17.4 - bob * 0.5, 2, 0.8); // (the knee)
    // (socks bunched over the tops of the boots)
    ink(ctx, () => ctx.rect(x - 0.2, -10.5, 6.4, 3.6), '#F8FAFC', 0.8);
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 0.6, -8.4, 4.8, 0.7);
    // (the boots: high-top, laced, the sole)
    shaded(ctx, () => ctx.roundRect(x - 2, -7, 10, 7, [1.5, 3, 1, 1]), '#B91C1C', x - 2, -7, 10, 7, 0.9);
    ctx.fillStyle = '#FDE68A'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 1.5, -6.2 + k * 1.7, 3, 0.7);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x - 2, -1.2, 10, 1.2);
  }
  // Trunks, a size too big, the waistband up round his ribs, a stripe down the side
  shaded(ctx, () => { ctx.moveTo(-12, -38 - bob); ctx.lineTo(12, -38 - bob); ctx.lineTo(13, -24 - bob); ctx.lineTo(1, -24 - bob); ctx.lineTo(0, -27 - bob); ctx.lineTo(-1, -24 - bob); ctx.lineTo(-13, -24 - bob); ctx.closePath(); },
    TRUNKS, -13, -38 - bob, 26, 14);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(9, -37 - bob, 2, 13); ctx.fillRect(-11, -37 - bob, 2, 13);
  ctx.fillStyle = dark(TRUNKS, 0.35); ctx.fillRect(-6, -32 - bob, 1, 7); ctx.fillRect(4, -33 - bob, 1, 8); // (the folds, it's that baggy)
  shadedTop(ctx, () => ctx.rect(-12.5, -41 - bob, 25, 4), '#F8FAFC', -12.5, -41 - bob, 25, 4, 0.9);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-5, -40 - bob, 10, 1.4);
  // A torso with nothing much on it: the ribs showing, a sunken chest, a belly button
  const torso = () => { ctx.moveTo(-8, -40 - bob); ctx.lineTo(-9.5, -55 - bob); ctx.quadraticCurveTo(0, -60 - bob, 9.5, -55 - bob); ctx.lineTo(8, -40 - bob); ctx.closePath(); };
  shaded(ctx, torso, SKIN, -9.5, -60 - bob, 19, 20);
  ctx.strokeStyle = dark(SKIN, 0.28); ctx.lineWidth = 0.7; ctx.beginPath();
  for (let k = 0; k < 3; k++) { const y = -51 - bob + k * 3; ctx.moveTo(-7, y); ctx.quadraticCurveTo(-4, y + 1.4, -1.5, y + 0.4); ctx.moveTo(1.5, y + 0.4); ctx.quadraticCurveTo(4, y + 1.4, 7, y); }
  ctx.moveTo(0, -54 - bob); ctx.lineTo(0, -46 - bob); ctx.stroke();
  ctx.fillStyle = dark(SKIN, 0.35); ctx.fillRect(-0.5, -43 - bob, 1.2, 1.2);
  ctx.fillStyle = lite(SKIN, 0.3); ctx.fillRect(-7, -55 - bob, 4, 0.8);
  // The neck, a pencil
  ink(ctx, () => ctx.rect(-1.5, -60 - bob, 4, 4), dark(SKIN, 0.12), 0.8);
  // Head in red headgear: the padded crown, the cheek pads round his face, the strap under his chin; big hopeful eyes,
  // a mouthguard he can't close his mouth round
  const hy = -66 - bob;
  ctx.save(); ctx.beginPath(); ctx.arc(0, hy, 9, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-9, hy - 9, 18, 18);
  ctx.fillStyle = dark('#B91C1C', 0.3); ctx.fillRect(-9, hy - 9, 4, 18); ctx.fillRect(-9, hy + 5, 18, 4);
  ctx.fillStyle = lite('#B91C1C', 0.3); ctx.fillRect(-3, hy - 8, 7, 2);
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, hy, 9, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = dark('#B91C1C', 0.45); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-6, hy - 5); ctx.quadraticCurveTo(-1, hy - 7.6, 4, hy - 6.4); ctx.stroke(); // (the seam)
  // (the face in the opening)
  shaded(ctx, () => ctx.roundRect(-3.6, hy - 3.4, 10.6, 9.6, [2, 3, 3, 2]), SKIN, -3.6, hy - 3.4, 10.6, 9.6, 0.9);
  // (the forehead pad over it, and the cheek pad on the near side)
  shadedTop(ctx, () => ctx.roundRect(-4.5, hy - 6.4, 12, 3.6, 1.6), '#B91C1C', -4.5, hy - 6.4, 12, 3.6, 0.9);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, hy - 5.4, 4, 1); // (the logo, rubbed off)
  shaded(ctx, () => ctx.roundRect(-5, hy - 2.6, 3.4, 8.4, 1.4), '#B91C1C', -5, hy - 2.6, 3.4, 8.4, 0.8);
  // (eyes: wide, hopeful, looking up at you)
  for (const [ex, w] of [[2.6, 2.6], [5.8, 2.2]] as const) {
    ctx.fillStyle = INK; ctx.fillRect(ex - 0.4, hy - 2.4, w + 0.8, 3.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex, hy - 2, w, 2.8);
    ctx.fillStyle = '#3B2414'; ctx.fillRect(ex + w - 1.4, hy - 1.8, 1.4, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex + w - 1.4, hy - 1.8, 0.6, 0.6);
    ctx.fillStyle = INK; ctx.fillRect(ex, hy - 3.4, w, 0.7); // (brows up)
  }
  ctx.fillStyle = dark(SKIN, 0.3); ctx.fillRect(6.6, hy + 0.6, 1, 1.6); // (the nose)
  ink(ctx, () => ctx.roundRect(1, hy + 2.8, 6, 2.4, 1), '#60A5FA', 0.7);
  ctx.fillStyle = '#BFDBFE'; ctx.fillRect(1.8, hy + 3.2, 3, 0.7);
  // Guard up: gloves way too big for him, one by his chin, one out in front
  glove(ctx, 5, -51 - bob, 6.5);
  limb(ctx, 3, -54 - bob, 11 + jab, -57 - bob, 3.6, SKIN);
  glove(ctx, 16 + jab, -58 - bob, 7);
  ctx.restore();
};

/** The balloon man: his box (40 x 30) is him, legs dangling below it; the balloons are up on their strings above. */
const BALLOONS = ['#EF4444', '#FACC15', '#22C55E', '#3B82F6', '#EC4899', '#F97316', '#A855F7'];

/** A party balloon at (x, y): shaded round from the upper left, the shine, the knot at the bottom. */
const balloon = (ctx: Ctx, x: number, y: number, c: string) => {
  const path = () => ctx.ellipse(x, y, 7.5, 9, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = c; ctx.fillRect(x - 8, y - 10, 16, 20);
  ctx.fillStyle = dark(c, 0.18); ctx.beginPath(); ctx.ellipse(x + 2.5, y + 2.5, 7.5, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark(c, 0.36); ctx.beginPath(); ctx.ellipse(x + 4.5, y + 5, 7.5, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(c, 0.25); ctx.beginPath(); ctx.ellipse(x - 2, y - 2.5, 3.8, 4.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x - 4.4, y - 5.4, 2, 3); ctx.fillRect(x - 2, y - 6.6, 1.4, 1);
  ink(ctx, () => { ctx.moveTo(x - 1.6, y + 10.6); ctx.lineTo(x + 1.6, y + 10.6); ctx.lineTo(x, y + 8.4); ctx.closePath(); }, dark(c, 0.2), 0.7);
};

const POLO = '#16A34A', SLACKS = '#57534E', MAN = '#E0AC69';

const drawBalloonMan = (ctx: Ctx, e: Enemy, frame: number) => {
  const cx = e.pos.x + e.width / 2, top = e.pos.y;
  const sway = Math.sin(frame * 0.05 + e.pos.x * 0.02) * 4;
  const dir = e.vel.x < 0 ? -1 : 1;
  ctx.save();
  // The strings, from his fists up to the bunch
  const knot = { x: cx + dir * 1, y: top - 14 };
  const bunch = BALLOONS.map((c, i) => ({ c, x: cx + sway + (i - 3) * 9 + Math.sin(i * 2.1) * 4, y: top - 58 - Math.abs(i - 3) * -4 - (i % 2) * 10 }));
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)'; ctx.lineWidth = 1;
  ctx.beginPath(); for (const b of bunch) { ctx.moveTo(knot.x, knot.y); ctx.quadraticCurveTo((knot.x + b.x) / 2 + sway, (knot.y + b.y) / 2, b.x, b.y + 10); } ctx.stroke();
  // (the back ones first)
  for (const i of [1, 3, 5, 0, 2, 4, 6]) balloon(ctx, bunch[i].x, bunch[i].y, bunch[i].c);
  // Him: a regular guy in a polo shirt and slacks, arms up hanging on to the strings, legs kicking
  ctx.translate(cx, top); ctx.scale(dir, 1);
  const kick = Math.sin(frame * 0.3 + e.pos.x) * 4;
  // (legs: slacks, the cuffs riding up, socks, loafers)
  for (const [x, k] of [[-8, kick], [1, -kick]] as const) {
    shaded(ctx, () => ctx.rect(x, 19, 7, 10 + k), SLACKS, x, 19, 7, 10 + k, 0.9);
    ctx.fillStyle = dark(SLACKS, 0.3); ctx.fillRect(x + 3, 21, 0.7, 7 + k); // (the crease)
    ink(ctx, () => ctx.rect(x + 0.5, 28 + k, 6, 2), '#E7E5E4', 0.7);
    ink(ctx, () => ctx.roundRect(x - 1, 29.5 + k, 10, 4, [1.4, 2.6, 1, 1]), '#3F2A1C', 0.9);
    ctx.fillStyle = lite('#3F2A1C', 0.35); ctx.fillRect(x + 4, 30.2 + k, 3, 0.8);
  }
  // (the polo: short sleeves, the collar, the placket and its buttons, a little logo; riding up off his belly)
  shaded(ctx, () => ctx.roundRect(-9.5, 4, 19, 15, [4, 4, 1, 1]), POLO, -9.5, 4, 19, 15);
  ctx.fillStyle = dark(POLO, 0.3); ctx.fillRect(0.6, 5, 0.8, 6);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(1.6, 6.5, 1, 1); ctx.fillRect(1.6, 9, 1, 1);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(4, 8, 2, 1.4);
  ink(ctx, () => { ctx.moveTo(-4, 4); ctx.lineTo(0.8, 7); ctx.lineTo(5, 4); ctx.lineTo(3, 3); ctx.lineTo(0.8, 5); ctx.lineTo(-2, 3); ctx.closePath(); }, lite(POLO, 0.15), 0.7);
  ink(ctx, () => ctx.rect(-8.5, 18, 17, 2.6), MAN, 0.7); // (his belly, out under it)
  // (the belt and buckle)
  ink(ctx, () => ctx.rect(-9, 19.4, 18, 2.6), '#78350F', 0.8);
  ink(ctx, () => ctx.rect(1, 19.2, 3, 3), '#FACC15', 0.6);
  // (arms: straight up, the sleeves fallen to the shoulders, both fists round the strings)
  for (const [sx, hx] of [[-7, -1.5], [7, 2.6]]) {
    limb(ctx, sx, 7, hx, -12, 4, MAN);
    ink(ctx, () => ctx.roundRect(sx - 3.4, 3.6, 6.8, 5, 2), POLO, 0.8);
    ink(ctx, () => ctx.roundRect(hx - 2.6, -16.6, 5.2, 5, 1.6), MAN, 0.8);
    ctx.fillStyle = dark(MAN, 0.3); ctx.fillRect(hx - 1.8, -14, 3.6, 0.6);
  }
  // (the head: balding, what's left combed over; eyes rolled up at the balloons; mouth open: he'd like to come down now)
  ink(ctx, () => ctx.rect(-2, 0, 4, 4), dark(MAN, 0.15), 0.8);
  const skull = () => ctx.arc(0, -3, 7, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = MAN; ctx.fillRect(-7, -10, 14, 14);
  ctx.fillStyle = dark(MAN, 0.2); ctx.fillRect(-7, -10, 3.4, 14); ctx.fillRect(-7, 1.6, 14, 3);
  ctx.fillStyle = lite(MAN, 0.4); ctx.fillRect(-1, -9, 4, 1.2);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-7, -6, 3.6, 5); ctx.fillRect(-4, -9.2, 7, 1);
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(-4.6, -2.4, 1.4, 2, 0, 0, Math.PI * 2), dark(MAN, 0.2), 0.6);
  for (const ex of [1.6, 4.6]) {
    ctx.fillStyle = INK; ctx.fillRect(ex - 0.4, -6.4, 2.6, 3.2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex, -6, 1.8, 2.4);
    ctx.fillStyle = INK; ctx.fillRect(ex + 0.6, -6, 1.2, 1.2);
  }
  ctx.fillStyle = INK; ctx.fillRect(1, -8, 2.4, 0.7); ctx.fillRect(4.2, -8.4, 2.4, 0.7);
  ctx.fillStyle = dark(MAN, 0.3); ctx.fillRect(6, -3, 1, 1.6);
  ink(ctx, () => ctx.ellipse(3.4, 1, 1.8, 2.1, 0, 0, Math.PI * 2), '#7F1D1D', 0.7);
  ctx.fillStyle = '#F472B6'; ctx.fillRect(2.6, 1.6, 1.6, 0.9);
  // (sweat, flying off him)
  if (frame % 24 < 12) { ctx.fillStyle = 'rgba(186, 230, 253, 0.85)'; ctx.fillRect(-8 - (frame % 24) * 0.3, -6 + (frame % 24) * 0.4, 1.4, 2); }
  ctx.restore();
};
