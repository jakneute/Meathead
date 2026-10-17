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
import { lookOf } from '../../adventure/temple/people';
import { castKind, leadOf, meleeHit, type Costume, type Body, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat, lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, GONDOLIER, PIZZA, OPERA, NONNA } from './lines';

registerHurts(HURT);

type G = CanvasRenderingContext2D;
const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

/** A neckerchief knotted at the throat (its two tails), in steps. */
const kerchief = (g: G, B: Body, col: string) => {
  px(g, -5, B.shY - 1, 10, 4, col); px(g, -5, B.shY - 1, 10, 1, lt(col, 0.35)); px(g, -5, B.shY + 2, 10, 1, dk(col, 0.3));
  px(g, -1, B.shY + 2, 3, 3, dk(col, 0.15)); px(g, -3, B.shY + 4, 2, 6, col); px(g, 2, B.shY + 4, 2, 5, dk(col, 0.2));
};

const GONDOLIER_COSTUME: Costume = {
  id: 'gondolier', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  // (the striped shirt: navy, red or green bands, lit down the near side, shaded down the far; the sash knotted at the
  // hip with its tails; a neckerchief)
  over: (g, B, F) => {
    const col = pick(F.seed, 2, ['#1E3A8A', '#B91C1C', '#1E3A8A', '#14532D']), sash = pick(F.seed, 3, ['#DC2626', '#1E40AF', '#CA8A04']);
    for (let y = B.shY + 3; y < B.hipY; y += 5) { px(g, -B.w / 2, y, B.w, 2, col); px(g, -B.w / 2, y, 2, 2, lt(col, 0.3)); px(g, B.w / 2 - 3, y, 3, 2, dk(col, 0.35)); }
    px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY - 2, 'rgba(26, 11, 6, 0.12)');
    px(g, -B.w / 2, B.hipY - 3, B.w, 4, sash); px(g, -B.w / 2, B.hipY - 3, B.w, 1, lt(sash, 0.35)); px(g, -B.w / 2, B.hipY, B.w, 1, dk(sash, 0.3));
    px(g, -B.w / 2 - 2, B.hipY - 2, 4, 4, dk(sash, 0.15)); px(g, -B.w / 2 - 3, B.hipY + 2, 3, 9, sash); px(g, -B.w / 2 - 1, B.hipY + 2, 2, 7, dk(sash, 0.25));
    kerchief(g, B, pick(F.seed, 5, ['#DC2626', '#1E3A8A', '#F8FAFC']));
  },
  // (the straw boater: the crown's woven straw in steps, its flat top lit, the brim, the ribbon round it and its tails)
  hat: (g, B, F) => {
    const rib = pick(F.seed, 4, ['#DC2626', '#1E3A8A', '#1C1917']);
    part(g, () => g.ellipse(B.hx, B.hy - 8, B.rx + 6, 3, 0, 0, Math.PI * 2), '#FDE68A', B.hx - B.rx - 6, B.hy - 11, B.rx * 2 + 12, 6, 1);
    px(g, B.hx - B.rx - 5, B.hy - 9, B.rx * 2 + 10, 1, '#FEF3C7'); px(g, B.hx - B.rx - 4, B.hy - 6, B.rx * 2 + 8, 1, '#CA8A04');
    px(g, B.hx - B.rx, B.hy - 16, B.rx * 2, 8, INK); px(g, B.hx - B.rx + 1, B.hy - 15, B.rx * 2 - 2, 7, '#FDE68A');
    px(g, B.hx - B.rx + 1, B.hy - 15, B.rx * 2 - 2, 1, '#FEF9C3'); px(g, B.hx + B.rx - 4, B.hy - 15, 3, 7, '#EAB308');
    for (let x = -B.rx + 2; x < B.rx - 1; x += 3) px(g, B.hx + x, B.hy - 13 + (x & 1), 1, 1, '#CA8A04');
    px(g, B.hx - B.rx + 1, B.hy - 11, B.rx * 2 - 2, 3, rib); px(g, B.hx - B.rx + 1, B.hy - 11, B.rx * 2 - 2, 1, lt(rib, 0.35));
    px(g, B.hx - B.rx - 2, B.hy - 10, 3, 7, rib); px(g, B.hx - B.rx - 4, B.hy - 5, 3, 5, dk(rib, 0.2));
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 6, B.shY + 6], [-B.w / 2 - 2, B.shY - 2]] : F.pose === 'strike' ? [[B.w / 2, B.shY + 10], [B.w / 2 + 14, B.shY + 6]] : [[-B.w / 2 + 2, B.shY + 14], [B.w / 2 + 4, B.shY + 10]]),
  // (the oar (a remo): its shaft in steps, held upright, back for the swing, out level in it; the blade at its foot)
  hold: (g, B, F, x, y) => {
    const [ax, ay, bx, by] = F.pose === 'strike' ? [x - 30, y + 2, x + 96, y - 4] : F.pose === 'tell' ? [x + 20, y - 40, x - 60, y + 10] : [x, y - 70, x, y + 50];
    limb(g, ax, ay, bx, by, 4, INK); limb(g, ax, ay, bx, by, 3, '#8B5A2B'); limb(g, ax, ay - 1, bx, by - 1, 1, '#C08A50', false);
    const d = Math.hypot(bx - ax, by - ay) || 1, ux = (bx - ax) / d, uy = (by - ay) / d, bx0 = bx - ux * 18, by0 = by - uy * 18;
    part(g, () => { g.moveTo(bx0 - uy * 2, by0 + ux * 2); g.lineTo(bx + ux * 4 - uy * 5, by + uy * 4 + ux * 5); g.lineTo(bx + ux * 4 + uy * 5, by + uy * 4 - ux * 5); g.lineTo(bx0 + uy * 2, by0 - ux * 2); g.closePath(); }, '#A16207', Math.min(bx0, bx) - 8, Math.min(by0, by) - 8, Math.abs(bx - bx0) + 16, Math.abs(by - by0) + 16, 1);
  },
  mouth: 'o',
};

const PIZZA_COSTUME: Costume = {
  id: 'pizzaiolo', top: '#F8FAFC', legs: s => pick(s, 2, ['#1C1917', '#57534E', '#F5F5F4']), shoe: 'sneaker', shoeCol: '#1C1917', sleeveLen: 0.6,
  // (chef's whites: double-breasted, two rows of buttons, shaded down the far side; the apron over them, floury, a
  // sauce spot; a tricolor neckerchief)
  over: (g, B, F) => {
    px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, '#D6D3D1'); px(g, -B.w / 2, B.shY + 2, 2, B.hipY - B.shY, '#FFFFFF');
    for (let k = 0; k < 3; k++) for (const bx of [-5, 3]) { px(g, bx, B.shY + 6 + k * 6, 2, 2, '#A8A29E'); px(g, bx, B.shY + 6 + k * 6, 1, 1, '#E7E5E4'); }
    const ap = pick(F.seed, 3, ['#E7E5E4', '#FECACA', '#BBF7D0']);
    px(g, -B.hipW / 2 + 1, B.shY + 12, B.hipW - 2, B.hipY - B.shY + 12, ap); px(g, -B.hipW / 2 + 1, B.shY + 12, 2, B.hipY - B.shY + 12, lt(ap, 0.4)); px(g, B.hipW / 2 - 3, B.shY + 12, 2, B.hipY - B.shY + 12, dk(ap, 0.15));
    px(g, -B.hipW / 2 + 1, B.shY + 11, B.hipW - 2, 1, dk(ap, 0.2));
    for (let k = 0; k < 6; k++) px(g, -7 + ((F.seed + k * 5) % 13), B.shY + 16 + ((k * 7) % 18), 2 + (k % 2), 2, '#FFFFFF');
    px(g, -3, B.hipY + 10, 3, 2, '#DC2626'); px(g, 3, B.hipY + 4, 2, 2, '#DC2626');
    px(g, -5, B.shY - 1, 4, 4, '#16A34A'); px(g, -1, B.shY - 1, 3, 4, '#F8FAFC'); px(g, 2, B.shY - 1, 3, 4, '#DC2626'); px(g, -5, B.shY + 2, 10, 1, 'rgba(26, 11, 6, 0.25)');
  },
  // (the paper hat: tall, pleated, its pleats lit and shaded in turn, its band)
  hat: (g, B) => {
    px(g, B.hx - B.rx - 1, B.hy - 21, B.rx * 2 + 2, 15, INK);
    for (let x = -B.rx, k = 0; x < B.rx; x += 3, k++) px(g, B.hx + x, B.hy - 20, 3, 13, k % 2 ? '#E7E5E4' : '#FFFFFF');
    px(g, B.hx + B.rx - 3, B.hy - 20, 3, 13, '#D6D3D1');
    px(g, B.hx - B.rx, B.hy - 9, B.rx * 2, 3, '#F5F5F4'); px(g, B.hx - B.rx, B.hy - 7, B.rx * 2, 1, '#A8A29E');
    px(g, B.hx - B.rx - 2, B.hy - 23, B.rx * 2 + 4, 4, INK); px(g, B.hx - B.rx - 1, B.hy - 22, B.rx * 2 + 2, 3, '#FFFFFF');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[B.hx - 4, B.hy - 20], [B.hx + 6, B.hy - 22]] : null),
  // (the pie, spun up on a finger in the tell: the crust in steps, the sauce, the cheese, pepperoni)
  hold: (g, B, F, x, y) => {
    if (F.pose !== 'tell') return;
    const k = Math.abs(Math.cos(F.fr)), ry = 3 + k * 3;
    part(g, () => g.ellipse(x - 2, y - 6, 15, ry + 1, 0, 0, Math.PI * 2), '#C8873A', x - 18, y - 12, 32, 12, 1);
    part(g, () => g.ellipse(x - 2, y - 6.5, 12, ry, 0, 0, Math.PI * 2), '#B91C1C', x - 14, y - 11, 24, 10, 0.4);
    part(g, () => g.ellipse(x - 3, y - 7, 10, Math.max(1, ry - 0.8), 0, 0, Math.PI * 2), '#F4C542', x - 13, y - 11, 20, 9, 0.3);
    px(g, x - 9, y - 8, 4, 1, '#FEF3C7'); px(g, x - 7, y - 7, 3, 2, '#9F1D1D'); px(g, x + 2, y - 6, 3, 2, '#9F1D1D'); px(g, x - 2, y - 5, 2, 1, '#9F1D1D');
  },
  eyes: 'open', mouth: 'grin',
};

const OPERA_COSTUME: Costume = {
  id: 'opera', top: s => pick(s, 3, ['#7F1D1D', '#1E1B4B', '#14532D']), legs: s => pick(s, 3, ['#7F1D1D', '#1E1B4B', '#14532D']), shoe: 'shoe', shoeCol: '#1C1917',
  // (a cape down the back: velvet in steps, its folds, its lining showing gold along the hem)
  back: (g, B, F) => {
    const col = pick(F.seed, 5, ['#B91C1C', '#CA8A04', '#4C1D95']);
    part(g, () => { g.moveTo(-B.w / 2 - 2, B.shY); g.lineTo(B.w / 2, B.shY); g.lineTo(B.w / 2 - 4, -2); g.lineTo(-B.w / 2 - 14, -2); g.closePath(); }, col, -B.w / 2 - 14, B.shY, B.w + 14, -B.shY, 1.2);
    px(g, -B.w / 2 - 13, -6, B.w + 8, 3, '#FCD34D'); px(g, -B.w / 2 - 10, B.shY + 6, 3, -B.shY - 12, lt(col, 0.25));
    for (let k = 0; k < 3; k++) px(g, -B.w / 2 - 8 + k * 9, B.shY + 10, 1, -B.shY - 18, dk(col, 0.3));
  },
  // (him: the breastplate's brass bosses; her: a sash and a string of pearls)
  over: (g, B, F) => {
    if (lookOf(F.seed).woman) {
      for (let k = 0; k < 8; k++) px(g, -B.w / 2 + k * 3, B.shY + 4 + k * 3, 4, 3, '#FCD34D');
      for (let k = 0; k < 9; k++) { const t = k / 8, x = -6 + t * 12, y = B.shY + 3 + Math.sin(t * Math.PI) * 5; px(g, x, y, 2, 2, '#F5F5F4'); px(g, x, y, 1, 1, '#FFFFFF'); }
    } else for (let k = 0; k < 3; k++) { ball(g, 0, B.shY + 6 + k * 7, 2.4, '#FCD34D', 0.5); px(g, -1, B.shY + 5 + k * 7, 1, 1, '#FEF9C3'); }
  },
  // (him: the horned helmet with braids, the Wagner way (wrong country, right volume): brass in steps, white horns;
  // her: a tiara and its paste jewels)
  hat: (g, B, F) => {
    if (lookOf(F.seed).woman) {
      part(g, () => { g.moveTo(B.hx - 9, B.hy - 7); g.lineTo(B.hx - 6, B.hy - 13); g.lineTo(B.hx - 2, B.hy - 11); g.lineTo(B.hx, B.hy - 17); g.lineTo(B.hx + 2, B.hy - 11); g.lineTo(B.hx + 6, B.hy - 13); g.lineTo(B.hx + 9, B.hy - 7); g.closePath(); }, '#E5E7EB', B.hx - 9, B.hy - 17, 18, 10, 0.8);
      px(g, B.hx - 1, B.hy - 13, 2, 2, '#DC2626'); px(g, B.hx - 6, B.hy - 10, 2, 2, '#2563EB'); px(g, B.hx + 4, B.hy - 10, 2, 2, '#2563EB'); px(g, B.hx - 1, B.hy - 13, 1, 1, '#FFFFFF');
      return;
    }
    partTop(g, () => g.ellipse(B.hx, B.hy - 5, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#CA8A04', B.hx - B.rx - 1, B.hy - B.ry - 4, B.rx * 2 + 2, B.ry, 1.2);
    px(g, B.hx - B.rx + 1, B.hy - B.ry, 4, 4, '#FDE68A'); px(g, B.hx + B.rx - 4, B.hy - B.ry + 2, 3, 4, '#A16207');
    px(g, B.hx - B.rx, B.hy - 6, B.rx * 2 + 1, 2, '#A16207'); for (let x = -B.rx + 2; x < B.rx; x += 4) px(g, B.hx + x, B.hy - 6, 1, 1, '#FEF3C7');
    for (const s of [-1, 1]) {
      part(g, () => { g.moveTo(B.hx + s * (B.rx - 1), B.hy - 8); g.lineTo(B.hx + s * (B.rx + 6), B.hy - 22); g.lineTo(B.hx + s * (B.rx + 2), B.hy - 6); g.closePath(); }, '#F5F5F4', B.hx - B.rx - 6, B.hy - 22, B.rx * 2 + 12, 16, 1);
      px(g, B.hx + s * (B.rx + 2), B.hy - 14, 2, 2, '#D6D3D1');
    }
    for (const s of [-1, 1]) { px(g, B.hx + s * (B.rx - 1) - 1, B.hy - 2, 3, 14, '#FDE047'); for (let y = 0; y < 14; y += 3) px(g, B.hx + s * (B.rx - 1) - 1, B.hy - 2 + y, 3, 1, '#CA8A04'); }
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 8, B.shY - 4], [B.w / 2 + 10, B.shY - 6]] : F.pose === 'strike' ? [[-B.w / 2 - 12, B.shY - 16], [B.w / 2 + 16, B.shY - 18]] : [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 2, B.shY + 4]]),
  eyes: 'tired', mouth: 'o',
};

const NONNA_COSTUME: Costume = {
  id: 'nonna', top: s => pick(s, 2, ['#1C1917', '#57534E', '#7C2D12', '#1E3A8A']), legs: s => pick(s, 2, ['#1C1917', '#57534E', '#7C2D12', '#1E3A8A']), shoe: 'shoe', shoeCol: '#1C1917',
  // (the housedress's little flowers; an apron with its pocket; the knit shawl over the shoulders, its rows in steps,
  // its fringe)
  over: (g, B, F) => {
    for (let k = 0; k < 10; k++) { const fx = -B.w / 2 + 2 + ((k * 7 + F.seed) % (B.w - 4)), fy = B.shY + 18 + ((k * 11) % Math.max(1, B.hipY - B.shY)); px(g, fx, fy, 2, 2, k % 2 ? '#FBCFE8' : '#FDE68A'); }
    const ap = pick(F.seed, 4, ['#F5F5F4', '#FDE68A', '#BFDBFE']);
    px(g, -B.hipW / 2 + 2, B.shY + 16, B.hipW - 4, B.hipY - B.shY + 6, ap); px(g, -B.hipW / 2 + 2, B.shY + 16, 2, B.hipY - B.shY + 6, lt(ap, 0.4));
    px(g, -3, B.hipY - 2, 7, 5, dk(ap, 0.12)); px(g, -3, B.hipY - 2, 7, 1, dk(ap, 0.25));
    const sh = pick(F.seed, 3, ['#A8A29E', '#7C2D12', '#4C1D95']);
    part(g, () => { g.moveTo(-B.w / 2 - 2, B.shY); g.lineTo(B.w / 2 + 2, B.shY); g.lineTo(2, B.shY + 18); g.closePath(); }, sh, -B.w / 2 - 2, B.shY, B.w + 4, 18, 1);
    for (let y = B.shY + 2; y < B.shY + 16; y += 3) px(g, -B.w / 2 + (y - B.shY) * 0.5, y, B.w - (y - B.shY), 1, dk(sh, 0.2));
    for (let k = 0; k < 5; k++) px(g, -2 + k, B.shY + 18 + (k % 2), 1, 3, dk(sh, 0.1));
  },
  // (the gray wig in a bun, its hairpins; the glasses on their chain)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx - 1, B.hy - 3, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#D6D3D1', B.hx - B.rx - 2, B.hy - B.ry - 2, B.rx * 2 + 2, B.ry, 1);
    for (let x = -B.rx + 2; x < B.rx; x += 3) px(g, B.hx + x, B.hy - B.ry + 1 + ((x + 9) % 2), 2, 1, '#A8A29E');
    ball(g, B.hx - B.rx + 1, B.hy - B.ry + 1, 4, '#D6D3D1', 1); px(g, B.hx - B.rx - 2, B.hy - B.ry - 1, 5, 1, '#1C1917'); px(g, B.hx - B.rx, B.hy - B.ry + 3, 4, 1, '#1C1917');
    px(g, B.hx + 2, B.hy - 2, 9, 2, INK); px(g, B.hx + 3, B.hy - 2, 3, 1, '#E0F2FE'); px(g, B.hx + 7, B.hy - 2, 3, 1, '#E0F2FE');
    for (let k = 0; k < 5; k++) px(g, B.hx + 10 - k, B.hy + k * 2, 1, 1, '#CA8A04');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 14], [-B.w / 2 - 4, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 16, B.shY + 4]] : null),
  // (the wooden spoon: its handle's grain in steps, the bowl, sauce on it)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -2.4 : F.pose === 'strike' ? -0.3 : -1.3, ex = x + Math.cos(a) * 22, ey = y + Math.sin(a) * 22;
    limb(g, x, y, ex, ey, 3.5, INK); limb(g, x, y, ex, ey, 2.5, '#D6A15E'); limb(g, x, y - 1, ex, ey - 1, 1, '#F0C890', false);
    ball(g, x + Math.cos(a) * 27, y + Math.sin(a) * 27, 5, '#D6A15E', 1); px(g, x + Math.cos(a) * 27 - 1, y + Math.sin(a) * 27, 3, 2, '#B91C1C');
  },
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
