// Morocco's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   carpet       a carpet salesman: a fez, an embroidered vest, a rolled-up rug over the shoulder: closes in and RAMS
//                with the rug held out level (a lunge; a big shove)
//   snakecharmer a sequined vest, a gold-trimmed cap, a recorder (it's a recorder) and a basket at its feet: the snake in
//                it sways up (the tell) and STRIKES out low and long (its own hurt: the snake)
//   camel        two kids' worth of camel suit on one kid: tan fuzz, a hump on the back, a big camel head on top with buck
//                teeth: SPITS (a squirt gun in the head; lobbed: he gags, a moment stuck)
//   hookah       the hookah-lounge bro: an open shirt, a gold chain, shades, the hookah under one arm: blows a big slow
//                cloud of apple smoke at him (shots.ts 'smoke': he coughs, a moment stuck)

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { safeAhead } from '../../../m1/game/enemies/kinds';
import { lookOf } from '../../adventure/temple/people';
import { castKind, leadOf, meleeHit, type Costume, type Ctx, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat, lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, CARPET, SNAKE, CAMEL, HOOKAH } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const RUGS = [['#B91C1C', '#FCD34D'], ['#1E3A8A', '#F8FAFC'], ['#7C2D12', '#F59E0B'], ['#14532D', '#FCA5A5']];
/** A rolled rug: a long cylinder, its end's spiral, a band of its pattern. */
const rolledRug = (g: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const [a, b] = pick(seed, 3, RUGS);
  limb(g, x0, y0, x1, y1, 6, a);
  for (let k = 1; k < 4; k++) { const t = k / 4; ball(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 2, b, 0); }
  ball(g, x1, y1, 6, dk(a, 0.2), 1); ball(g, x1, y1, 3, b, 0);
};
const fez = (g: Ctx, B: { hx: number; hy: number; rx: number; ry: number }, col = '#B91C1C') => {
  part(g, () => { g.moveTo(B.hx - 7, B.hy - B.ry + 3); g.lineTo(B.hx - 5, B.hy - B.ry - 9); g.lineTo(B.hx + 5, B.hy - B.ry - 9); g.lineTo(B.hx + 7, B.hy - B.ry + 3); g.closePath(); }, col, B.hx - 7, B.hy - B.ry - 9, 14, 12, 1);
  limb(g, B.hx, B.hy - B.ry - 9, B.hx - 7, B.hy - B.ry - 1, 1.2, '#1C1917');
};

const CARPET_COSTUME: Costume = {
  id: 'carpet', top: '#F5F5F4', legs: s => pick(s, 2, ['#1C1917', '#57534E', '#F5F5F4']), shoe: 'pointy', shoeCol: '#CA8A04',
  over: (g, B, F) => { const v = pick(F.seed, 4, ['#7F1D1D', '#1E3A8A', '#14532D']); for (const s of [-1, 1]) px(g, s < 0 ? -B.w / 2 : B.w / 2 - 9, B.shY, 9, B.hipY - B.shY - 2, v); for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 2, B.shY + 3 + k * 6, 4, 1, '#FCD34D'); },
  hat: (g, B) => fez(g, B), hairToo: true,
  hands: (B, F) => (F.pose === 'strike' || F.pose === 'tell' ? [[B.w / 2, B.shY + 12], [B.w / 2 + 8, B.shY + 10]] : null),
  // (the rug: over the shoulder walking, out level in the ram)
  hold: (g, B, F, x, y) => { if (F.pose === 'strike' || F.pose === 'tell') rolledRug(g, x - 22, y, x + 44, y - 2, F.seed); },
  back: (g, B, F) => { if (F.pose !== 'strike' && F.pose !== 'tell') rolledRug(g, -B.w / 2 - 22, B.shY + 20, B.w / 2 + 14, B.shY - 10, F.seed); },
  eyes: 'smug', mouth: 'grin',
};

const SNAKE_COSTUME: Costume = {
  id: 'snakecharmer', top: s => pick(s, 2, ['#F8FAFC', '#FDE68A', '#E0F2FE']), legs: s => pick(s, 3, ['#7C2D12', '#1E3A8A', '#F8FAFC']), shoe: 'sandal', shoeCol: '#78350F',
  over: (g, B) => { px(g, -B.w / 2, B.shY + 1, B.w, B.hipY - B.shY - 4, '#7C3AED'); for (let k = 0; k < 8; k++) px(g, -B.w / 2 + 2 + (k % 3) * 6, B.shY + 4 + Math.floor(k / 3) * 7, 2, 2, '#FDE047'); px(g, -2, B.shY + 1, 4, B.hipY - B.shY - 4, '#F5F5F4'); },
  // (a gold-trimmed embroidered cap)
  hat: (g, B) => { px(g, B.hx - B.rx, B.hy - B.ry - 1, B.rx * 2, 7, '#0F766E'); px(g, B.hx - B.rx, B.hy - B.ry + 4, B.rx * 2, 2, '#FCD34D'); for (let k = 0; k < 3; k++) px(g, B.hx - B.rx + 3 + k * 6, B.hy - B.ry + 1, 2, 2, '#FCD34D'); },
  hairToo: true,
  // (the recorder up at the mouth)
  hands: (B) => [[B.hx + 2, B.hy + 12], [B.hx + 8, B.hy + 10]],
  hold: (g, B) => { limb(g, B.hx + 4, B.hy + 6, B.hx + 14, B.hy + 20, 2, '#FEF3C7'); px(g, B.hx + 13, B.hy + 18, 3, 3, '#FEF3C7'); },
  eyes: 'tired', mouth: 'o',
};
/** The snake's basket at its feet (in front), and the snake: peeking, swaying up (the tell), out low and long (the strike). */
const drawSnake = (c: Ctx, e: Enemy, f: number) => {
  if (e.health <= 0 || !e.id) return;
  const bx = 26, st = e.aiState;
  part(c, () => c.roundRect(bx - 12, -20, 24, 20, 4), '#B45309', bx - 12, -20, 24, 20, 1);
  for (let k = 0; k < 3; k++) px(c, bx - 11, -17 + k * 6, 22, 1, '#78350F');
  const sway = Math.sin(f * 0.15) * 4;
  let pts: [number, number][];
  if (st === 'strike') pts = [[bx, -20], [bx + 30, -26], [bx + 60, -18], [bx + 92, -22]];
  else if (st === 'tell') pts = [[bx, -20], [bx + sway, -34], [bx - sway, -48], [bx + 4 + sway, -58]];
  else pts = [[bx, -20], [bx + 2, -26], [bx + 4 + sway * 0.4, -30]];
  c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  c.strokeStyle = '#4D7C0F'; c.lineWidth = 5; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  const [hx, hy] = pts[pts.length - 1];
  ball(c, hx + 2, hy, 5, '#65A30D', 1); px(c, hx + 3, hy - 2, 2, 2, '#FDE047');
  if (st === 'tell' || st === 'strike') { limb(c, hx + 6, hy + 1, hx + 12, hy + 1, 1, '#DC2626'); }
  c.lineCap = 'butt';
};

const FUZZ = ['#C08A4A', '#A16207', '#D6A15E'];
const CAMEL_COSTUME: Costume = {
  id: 'camel', top: s => pick(s, 2, FUZZ), legs: s => pick(s, 2, FUZZ), shoe: 'paw', shoeCol: '#78350F',
  // (the hump on the back, stuffed)
  back: (g, B, F) => { const col = pick(F.seed, 2, FUZZ); part(g, () => g.ellipse(-B.w / 2 - 2, B.shY + 8, 13, 15, -0.3, 0, Math.PI * 2), col, -B.w / 2 - 15, B.shY - 7, 26, 30, 1.2); px(g, -B.w / 2 - 8, B.shY - 2, 5, 3, lt(col, 0.25)); },
  over: (g, B, F) => { const col = pick(F.seed, 2, FUZZ); for (let k = 0; k < 6; k++) px(g, -B.w / 2 + 2 + (k % 3) * 7, B.shY + 5 + Math.floor(k / 3) * 9, 3, 2, dk(col, 0.15)); },
  // (the camel head on top: a long snout out front, droopy lids, buck teeth, little ears)
  hat: (g, B, F) => {
    const col = pick(F.seed, 2, FUZZ), y = B.hy - B.ry - 4;
    partTop(g, () => g.ellipse(B.hx, B.hy - 2, B.rx + 2, B.ry + 1, 0, Math.PI, 0), col, B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 4, B.ry + 2, 1);
    part(g, () => g.ellipse(B.hx + 10, y - 2, 17, 8, -0.15, 0, Math.PI * 2), col, B.hx - 7, y - 10, 34, 16, 1.2);
    px(g, B.hx + 22, y - 2, 3, 2, INK); px(g, B.hx + 18, y + 4, 5, 4, '#FFFFFF'); px(g, B.hx + 18, y + 4, 5, 1, INK);
    px(g, B.hx + 4, y - 8, 6, 4, '#FFFFFF'); px(g, B.hx + 6, y - 7, 3, 3, INK); px(g, B.hx + 3, y - 9, 8, 2, dk(col, 0.3));
    px(g, B.hx - 6, y - 11, 4, 5, dk(col, 0.2));
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 2, B.shY - 4]] : null),
  eyes: 'tired', mouth: 'teeth',
};

const SHIRTS = ['#F8FAFC', '#FBCFE8', '#BAE6FD', '#FDE68A'];
const HOOKAH_COSTUME: Costume = {
  id: 'hookah', top: s => pick(s, 2, SHIRTS), legs: s => pick(s, 3, ['#F5F5F4', '#1C1917', '#57534E']), shoe: 'sandal', shoeCol: '#1C1917', sleeveLen: 0.5,
  // (the shirt open to the middle, a gold chain)
  over: (g, B, F) => { px(g, B.lean - 3, B.shY, 7, 18, lookSkin(F.seed)); for (let k = 0; k < 5; k++) px(g, B.lean - 4 + k * 2, B.shY + 6 + (k === 2 ? 3 : k % 2 ? 2 : 0), 2, 2, '#FCD34D'); },
  // (shades)
  face: (g, B) => { px(g, B.hx - 1, B.hy - 4, 13, 4, INK); px(g, B.hx, B.hy - 3, 5, 2, '#3F3F46'); px(g, B.hx + 6, B.hy - 3, 5, 2, '#3F3F46'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 4, B.shY + 18], [B.hx + 8, B.hy + 10]] : [[-B.w / 2 - 4, B.shY + 18], [B.w / 2 + 4, B.shY + 14]]),
  // (the hookah under the far arm: the glass base, the stem, the bowl, the hose up to the near hand)
  holdFar: (g, B, F, x, y) => {
    ball(g, x - 2, y + 6, 8, '#0E7490', 1); px(g, x - 3, y - 16, 3, 16, '#CA8A04'); px(g, x - 7, y - 20, 11, 4, '#CA8A04'); px(g, x - 5, y - 23, 7, 3, '#B91C1C');
    if (F.pose === 'tell' || F.pose === 'strike') limb(g, x + 2, y - 8, B.hx + 10, B.hy + 9, 1.5, '#1E3A8A');
    else limb(g, x + 2, y - 8, B.w / 2 + 4, B.shY + 14, 1.5, '#1E3A8A');
  },
  eyes: 'tired', mouth: 'o',
};
const lookSkin = (seed: number) => lookOf(seed).skin;

// ---------------------------------------------------------------------------------------------------------------

/** The rug ram: a lunge, the rug out in front; one hit a lunge. */
const RAMMED = new WeakSet<Enemy>();
const ram = (ctx: FrameContext, e: Enemy) => {
  const ok = safeAhead(ctx, e, e.facing ?? 1, 30);
  e.vel.x = ok && e.aiTimer < 18 ? (e.facing ?? 1) * 6.5 : 0;
  if (!RAMMED.has(e) && e.aiTimer < 20 && meleeHit(ctx, e, 66, 11, 'm2:fl_carpet', 15, 50)) { RAMMED.add(e); playSound('thud', 0.9, -6); }
};
castKind({
  kind: 'm2:fl_carpet', costume: CARPET_COSTUME, stats: { w: 36, h: 72, hp: 105, contact: 5, mass: 190 },
  voice: V.carpet, pool: CARPET, speed: 1.3, range: [70, 260], reachY: 70, tell: 22, strikeFor: 24, after: 30, cooldown: 60,
  strike: (_ctx, e) => { RAMMED.delete(e); playSound('whoosh', 0.7, -4); },
  striking: ram,
});

castKind({
  kind: 'm2:fl_snakecharmer', costume: SNAKE_COSTUME, stats: { w: 36, h: 72, hp: 90, contact: 4, mass: 170 },
  voice: V.snake, pool: SNAKE, speed: 0.5, range: [40, 128], reachY: 60, tell: 26, strikeFor: 14, after: 24, cooldown: 45,
  strike: (ctx, e) => { playSound('whoosh', 0.6, 16); if (meleeHit(ctx, e, 124, 9, 'm2:fl_snake', 7, 40)) playSound('crunch', 0.6, 14); },
  drawExtra: drawSnake,
});

castKind({
  kind: 'm2:fl_camel', costume: CAMEL_COSTUME, stats: { w: 40, h: 78, hp: 125, contact: 6, mass: 240 },
  head: { x: 1, y: -70, r: 10 },
  voice: V.camel, pool: CAMEL, speed: 0.9, range: [130, 420], reachY: 240, tell: 28, after: 24, cooldown: 80,
  strike: (ctx, e) => { const t = leadOf(ctx.state, 34); lob(ctx.state, e, 'spit', t.x, t.y - 30, 34); playSound('splat', 0.4, 14); },
});

castKind({
  kind: 'm2:fl_hookah', costume: HOOKAH_COSTUME, stats: { w: 36, h: 72, hp: 95, contact: 4, mass: 180 },
  voice: V.hookah, pool: HOOKAH, speed: 0.9, range: [90, 360], reachY: 90, tell: 30, after: 30, cooldown: 95,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'smoke', 2.6),
});

void ball; void partTop;
