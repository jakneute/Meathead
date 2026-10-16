// Italy's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look):
//
//   gondolier  a striped shirt, a straw boater with a red ribbon, the long pole: on a gondola or the bank, closes to
//              the pole's reach and SWINGS it level (a long reach: keep out past it, or get in under it)
//   pizzaiolo  whites, an apron, a paper hat, a flour-dusted face: spins a pie up (the tell) and sends it flat and
//              wobbling at him (shots.ts 'pizza')
//   opera      the opera singer (a big build under a cape and a horned helmet, or a gown and a tiara): takes a breath
//              (the tell, long) and hits the HIGH NOTE: a tall pink ring that goes through anything, ringing his ears
//   nonna      a "nonna" (always a woman: a gray wig, a shawl, a housedress) with a wooden spoon: close, the spoon to
//              his head; out of reach, the spoon, flung

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { castKind, leadOf, meleeHit, type Costume, INK, px, part, partTop, ball, limb } from '../cast';
import { shootFlat, lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, GONDOLIER, PIZZA, OPERA, NONNA } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const GONDOLIER_COSTUME: Costume = {
  id: 'gondolier', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  // (the stripes: navy or red, a red sash)
  over: (g, B, F) => { const col = pick(F.seed, 2, ['#1E3A8A', '#B91C1C']); for (let y = B.shY + 3; y < B.hipY; y += 5) px(g, -B.w / 2, y, B.w, 2, col); px(g, -B.w / 2, B.hipY - 3, B.w, 4, '#DC2626'); },
  hat: (g, B) => { part(g, () => g.ellipse(B.hx, B.hy - 8, B.rx + 5, 3, 0, 0, Math.PI * 2), '#FDE68A', B.hx - B.rx - 5, B.hy - 11, B.rx * 2 + 10, 6, 1); px(g, B.hx - B.rx, B.hy - 15, B.rx * 2, 7, '#FDE68A'); px(g, B.hx - B.rx, B.hy - 11, B.rx * 2, 3, '#DC2626'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 6, B.shY + 6], [-B.w / 2 - 2, B.shY - 2]] : F.pose === 'strike' ? [[B.w / 2, B.shY + 10], [B.w / 2 + 14, B.shY + 6]] : [[-B.w / 2 + 2, B.shY + 14], [B.w / 2 + 4, B.shY + 10]]),
  // (the pole: held upright, back for the swing, out level in it)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'strike') limb(g, x - 30, y + 2, x + 96, y - 4, 3, '#78350F');
    else if (F.pose === 'tell') limb(g, x + 20, y - 40, x - 60, y + 10, 3, '#78350F');
    else limb(g, x, y - 70, x, y + 50, 3, '#78350F');
  },
  mouth: 'o',
};

const PIZZA_COSTUME: Costume = {
  id: 'pizzaiolo', top: '#F8FAFC', legs: s => pick(s, 2, ['#1C1917', '#57534E', '#F5F5F4']), shoe: 'sneaker', shoeCol: '#1C1917', sleeveLen: 0.6,
  over: (g, B) => { px(g, -B.hipW / 2 + 1, B.shY + 10, B.hipW - 2, B.hipY - B.shY + 12, '#E7E5E4'); px(g, -3, B.shY + 2, 6, 3, '#16A34A'); px(g, -1, B.shY + 2, 2, 3, '#DC2626'); for (let k = 0; k < 4; k++) px(g, -6 + k * 4, B.shY + 18 + (k % 2) * 6, 2, 2, '#F5F5F4'); },
  hat: (g, B) => { px(g, B.hx - B.rx, B.hy - 15, B.rx * 2, 9, INK); px(g, B.hx - B.rx + 1, B.hy - 14, B.rx * 2 - 2, 8, '#FFFFFF'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[B.hx - 4, B.hy - 20], [B.hx + 6, B.hy - 22]] : null),
  // (the pie, spun up on a finger in the tell)
  hold: (g, B, F, x, y) => { if (F.pose === 'tell') { const k = Math.abs(Math.cos(F.fr)); part(g, () => g.ellipse(x - 2, y - 6, 14, 3 + k * 3, 0, 0, Math.PI * 2), '#FCD34D', x - 16, y - 12, 28, 12, 1); px(g, x - 6, y - 7, 3, 2, '#B91C1C'); px(g, x + 2, y - 6, 3, 2, '#B91C1C'); } },
  eyes: 'open', mouth: 'grin',
};

const OPERA_COSTUME: Costume = {
  id: 'opera', top: s => pick(s, 3, ['#7F1D1D', '#1E1B4B', '#14532D']), legs: s => pick(s, 3, ['#7F1D1D', '#1E1B4B', '#14532D']), shoe: 'shoe', shoeCol: '#1C1917',
  // (a cape down the back)
  back: (g, B, F) => { const col = pick(F.seed, 5, ['#B91C1C', '#CA8A04', '#4C1D95']); part(g, () => { g.moveTo(-B.w / 2 - 2, B.shY); g.lineTo(B.w / 2, B.shY); g.lineTo(B.w / 2 - 4, -2); g.lineTo(-B.w / 2 - 14, -2); g.closePath(); }, col, -B.w / 2 - 14, B.shY, B.w + 14, -B.shY, 1.2); },
  over: (g, B) => { for (let k = 0; k < 3; k++) ball(g, 0, B.shY + 6 + k * 7, 2, '#FCD34D', 0.5); },
  // (the horned helmet with braids, the Wagner way: wrong country, right volume)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 5, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#CA8A04', B.hx - B.rx - 1, B.hy - B.ry - 4, B.rx * 2 + 2, B.ry, 1.2);
    for (const s of [-1, 1]) part(g, () => { g.moveTo(B.hx + s * (B.rx - 1), B.hy - 8); g.lineTo(B.hx + s * (B.rx + 6), B.hy - 22); g.lineTo(B.hx + s * (B.rx + 2), B.hy - 6); g.closePath(); }, '#F5F5F4', B.hx - B.rx - 6, B.hy - 22, B.rx * 2 + 12, 16, 1);
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 8, B.shY - 4], [B.w / 2 + 10, B.shY - 6]] : F.pose === 'strike' ? [[-B.w / 2 - 12, B.shY - 16], [B.w / 2 + 16, B.shY - 18]] : [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 2, B.shY + 4]]),
  eyes: 'tired', mouth: 'o',
};

const NONNA_COSTUME: Costume = {
  id: 'nonna', top: s => pick(s, 2, ['#1C1917', '#57534E', '#7C2D12']), legs: s => pick(s, 2, ['#1C1917', '#57534E', '#7C2D12']), shoe: 'shoe', shoeCol: '#1C1917',
  // (the shawl over the shoulders)
  over: (g, B) => { part(g, () => { g.moveTo(-B.w / 2 - 2, B.shY); g.lineTo(B.w / 2 + 2, B.shY); g.lineTo(2, B.shY + 18); g.closePath(); }, '#A8A29E', -B.w / 2 - 2, B.shY, B.w + 4, 18, 1); },
  // (the gray wig in a bun, the clip-on glasses chain)
  hat: (g, B) => { partTop(g, () => g.ellipse(B.hx - 1, B.hy - 3, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#D6D3D1', B.hx - B.rx - 2, B.hy - B.ry - 2, B.rx * 2 + 2, B.ry, 1); ball(g, B.hx - B.rx + 1, B.hy - B.ry + 1, 4, '#D6D3D1', 1); px(g, B.hx + 2, B.hy - 2, 9, 2, INK); },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 14], [-B.w / 2 - 4, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 16, B.shY + 4]] : null),
  hold: (g, B, F, x, y) => { const a = F.pose === 'tell' ? -2.4 : F.pose === 'strike' ? -0.3 : -1.3; limb(g, x, y, x + Math.cos(a) * 22, y + Math.sin(a) * 22, 2.5, '#D6A15E'); ball(g, x + Math.cos(a) * 26, y + Math.sin(a) * 26, 4, '#D6A15E', 1); },
  eyes: 'angry', mouth: 'flat',
};

// ---------------------------------------------------------------------------------------------------------------

/** The pole's swing: level, long, a step in behind it. */
const poleSwing = (ctx: FrameContext, e: Enemy) => {
  e.vel.x = e.aiTimer < 5 ? (e.facing ?? 1) * 1.5 : 0;
  if (e.aiTimer === 3 && meleeHit(ctx, e, 132, 11, 'm2:fl_gondolier', 10, 50)) playSound('thud', 0.8, 0);
};
castKind({
  kind: 'm2:fl_gondolier', costume: GONDOLIER_COSTUME, stats: { w: 36, h: 72, hp: 110, contact: 5, mass: 190 },
  voice: V.gondolier, pool: GONDOLIER, speed: 1, range: [70, 140], tell: 24, strikeFor: 14, after: 28, cooldown: 55,
  strike: () => playSound('whoosh', 0.8, -8), striking: poleSwing,
  // (keeps to his gondola: no hopping off after him)
  pathing: false,
});

castKind({
  kind: 'm2:fl_pizzaiolo', costume: PIZZA_COSTUME, stats: { w: 36, h: 72, hp: 90, contact: 5, mass: 170 },
  voice: V.pizza, pool: PIZZA, speed: 1.2, range: [160, 440], tell: 24, after: 18, cooldown: 70,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'pizza', 4.6),
});

castKind({
  kind: 'm2:fl_opera', costume: OPERA_COSTUME, stats: { w: 44, h: 76, hp: 160, contact: 7, mass: 260 },
  head: { x: 1, y: -68, r: 10 },
  voice: V.opera, pool: OPERA, speed: 0.6, range: [140, 520], reachY: 200, tell: 50, after: 40, cooldown: 110,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'aria', 3.2),
});

castKind({
  kind: 'm2:fl_nonna', costume: NONNA_COSTUME, woman: true, stats: { w: 34, h: 66, hp: 85, contact: 5, mass: 150 },
  voice: V.nonna, pool: NONNA, speed: 1.3, range: [30, 300], reachY: 220, tell: 18, after: 20, cooldown: 55,
  strike: (ctx, e) => {
    const d = Math.abs(mid(ctx.state.player).x - mid(e).x);
    if (d < 80) { if (meleeHit(ctx, e, 72, 8, 'm2:fl_nonna', 8)) playSound('thud', 0.7, 10); }
    else { const t = leadOf(ctx.state, 34); lob(ctx.state, e, 'spoon', t.x, t.y, 34); }
  },
});
