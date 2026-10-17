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

const RUGS = [['#B91C1C', '#FCD34D', '#1E3A8A'], ['#1E3A8A', '#F8FAFC', '#B91C1C'], ['#7C2D12', '#F59E0B', '#14532D'], ['#14532D', '#FCA5A5', '#FCD34D'], ['#5B2A6E', '#FCD34D', '#B91C1C']];
/** A rolled rug: a long cylinder (lit along its top, shaded under), its pattern's bands round it in steps, the end's
 *  spiral (the layers rolled in), the fringe out of it. */
const rolledRug = (g: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const [a, b, e] = pick(seed, 3, RUGS);
  limb(g, x0, y0, x1, y1, 8, dk(a, 0.15));
  limb(g, x0, y0 - 1.5, x1, y1 - 1.5, 4, a, false); limb(g, x0, y0 - 3, x1, y1 - 3, 1.5, lt(a, 0.3), false);
  for (let k = 1; k < 6; k++) {
    const t = k / 6, mx = x0 + (x1 - x0) * t, my = y0 + (y1 - y0) * t, col = k % 2 ? b : e;
    px(g, mx - 1, my - 4, 3, 8, col); px(g, mx - 1, my - 4, 3, 1, lt(col, 0.35)); px(g, mx - 1, my + 3, 3, 1, dk(col, 0.35));
  }
  for (let k = -2; k <= 2; k += 2) px(g, x0 - 3, y0 + k - 0.5, 3, 1, '#F5F5F4');
  ball(g, x1, y1, 6, dk(a, 0.2), 1);
  g.strokeStyle = b; g.lineWidth = 1; g.beginPath(); g.arc(x1, y1, 4, 0, Math.PI * 1.5); g.stroke();
  g.strokeStyle = e; g.beginPath(); g.arc(x1, y1, 2, Math.PI, Math.PI * 2.4); g.stroke();
};
/** A fez (felt, in steps: lit down its left, its crown's flat top lit), the gold band, the black tassel swinging. */
const fez = (g: Ctx, B: { hx: number; hy: number; rx: number; ry: number }, col = '#B91C1C', fr = 0) => {
  part(g, () => { g.moveTo(B.hx - 7, B.hy - B.ry + 3); g.lineTo(B.hx - 5, B.hy - B.ry - 9); g.lineTo(B.hx + 5, B.hy - B.ry - 9); g.lineTo(B.hx + 7, B.hy - B.ry + 3); g.closePath(); }, col, B.hx - 7, B.hy - B.ry - 9, 14, 12, 1);
  px(g, B.hx - 5, B.hy - B.ry - 9, 10, 1, lt(col, 0.4)); px(g, B.hx - 7, B.hy - B.ry + 1, 14, 2, '#CA8A04'); px(g, B.hx - 7, B.hy - B.ry + 1, 14, 1, '#FCD34D');
  const sw = Math.sin(fr * 0.9) * 2;
  limb(g, B.hx, B.hy - B.ry - 9, B.hx - 7 + sw, B.hy - B.ry - 2, 1.2, '#1C1917');
  px(g, B.hx - 9 + sw, B.hy - B.ry - 2, 3, 4, '#1C1917');
};

const VESTS = ['#7F1D1D', '#1E3A8A', '#14532D', '#1C1917', '#5B2A6E'];
const SASHES = ['#CA8A04', '#B91C1C', '#0F766E', '#F5F5F4'];
const CARPET_COSTUME: Costume = {
  id: 'carpet', top: s => pick(s, 5, ['#F5F5F4', '#E7E5E4', '#FEF3C7']), legs: s => pick(s, 2, ['#1C1917', '#57534E', '#F5F5F4', '#78350F']), shoe: 'pointy', shoeCol: '#CA8A04',
  // (the embroidered vest open over the shirt: its gold piping, the embroidery in steps down its fronts; the striped
  // sash round the middle)
  over: (g, B, F) => {
    const v = pick(F.seed, 4, VESTS), s2 = pick(F.seed, 6, SASHES);
    for (const s of [-1, 1]) {
      const vx = s < 0 ? -B.w / 2 : B.w / 2 - 9;
      px(g, vx, B.shY, 9, B.hipY - B.shY - 2, v); px(g, vx, B.shY, 9, 1, lt(v, 0.3)); px(g, s < 0 ? vx : vx + 7, B.shY, 2, B.hipY - B.shY - 2, s < 0 ? lt(v, 0.18) : dk(v, 0.3));
      px(g, s < 0 ? vx + 8 : vx, B.shY, 1, B.hipY - B.shY - 2, '#FCD34D');
      for (let k = 0; k < 4; k++) { px(g, vx + 3, B.shY + 4 + k * 6, 3, 1, '#FCD34D'); px(g, vx + 4, B.shY + 3 + k * 6, 1, 3, '#FCD34D'); }
    }
    px(g, -B.hipW / 2 - 1, B.hipY - 6, B.hipW + 2, 5, s2); px(g, -B.hipW / 2 - 1, B.hipY - 6, B.hipW + 2, 1, lt(s2, 0.35)); px(g, -B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 1, dk(s2, 0.3));
    px(g, B.hipW / 2 - 4, B.hipY - 2, 3, 7, s2);
  },
  hat: (g, B, F) => fez(g, B, pick(F.seed, 7, ['#B91C1C', '#9F1239', '#7F1D1D']), F.fr), hairToo: true,
  hands: (B, F) => (F.pose === 'strike' || F.pose === 'tell' ? [[B.w / 2, B.shY + 12], [B.w / 2 + 8, B.shY + 10]] : null),
  // (the rug: over the shoulder walking, out level in the ram)
  hold: (g, B, F, x, y) => { if (F.pose === 'strike' || F.pose === 'tell') rolledRug(g, x - 22, y, x + 44, y - 2, F.seed); },
  back: (g, B, F) => { if (F.pose !== 'strike' && F.pose !== 'tell') rolledRug(g, -B.w / 2 - 22, B.shY + 20, B.w / 2 + 14, B.shY - 10, F.seed); },
  eyes: 'smug', mouth: 'grin',
};

const SEQUINS = ['#7C3AED', '#0F766E', '#B91C1C', '#1E3A8A', '#DB2777'];
const SNAKE_COSTUME: Costume = {
  id: 'snakecharmer', top: s => pick(s, 2, ['#F8FAFC', '#FDE68A', '#E0F2FE', '#F5F5F4']), legs: s => pick(s, 3, ['#7C2D12', '#1E3A8A', '#F8FAFC', '#14532D']), shoe: 'sandal', shoeCol: '#78350F',
  // (the costume shop's sequined vest: its color in steps, sequins in rows catching the light by turns, the gold
  // braid down its fronts; the shirt's placket between)
  over: (g, B, F) => {
    const v = pick(F.seed, 4, SEQUINS);
    px(g, -B.w / 2, B.shY + 1, B.w, B.hipY - B.shY - 4, v); px(g, -B.w / 2, B.shY + 1, 4, B.hipY - B.shY - 4, lt(v, 0.2)); px(g, B.w / 2 - 4, B.shY + 1, 4, B.hipY - B.shY - 4, dk(v, 0.3));
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { const on = (r + k + Math.floor(F.fr / 2)) % 3 === 0; px(g, -B.w / 2 + 2 + k * 5 + (r % 2) * 2, B.shY + 4 + r * 6, 2, 2, on ? '#FFFFFF' : '#FDE047'); }
    px(g, -3, B.shY + 1, 6, B.hipY - B.shY - 4, '#F5F5F4'); px(g, -3, B.shY + 1, 1, B.hipY - B.shY - 4, '#CA8A04'); px(g, 2, B.shY + 1, 1, B.hipY - B.shY - 4, '#CA8A04');
  },
  // (an embroidered cap: its band of gold, the pattern stitched round it, lit along its crown)
  hat: (g, B, F) => {
    const col = pick(F.seed, 5, ['#0F766E', '#7F1D1D', '#1E3A8A', '#F5F5F4']);
    px(g, B.hx - B.rx - 1, B.hy - B.ry - 2, B.rx * 2 + 2, 9, INK); px(g, B.hx - B.rx, B.hy - B.ry - 1, B.rx * 2, 7, col); px(g, B.hx - B.rx, B.hy - B.ry - 1, B.rx * 2, 1, lt(col, 0.35)); px(g, B.hx + B.rx - 3, B.hy - B.ry - 1, 3, 7, dk(col, 0.3));
    px(g, B.hx - B.rx, B.hy - B.ry + 4, B.rx * 2, 2, '#FCD34D');
    for (let k = 0; k < 3; k++) { px(g, B.hx - B.rx + 3 + k * 6, B.hy - B.ry + 1, 2, 2, '#FCD34D'); px(g, B.hx - B.rx + 5 + k * 6, B.hy - B.ry + 2, 1, 1, '#B91C1C'); }
  },
  hairToo: true,
  // (the "flute" up at the mouth: a plastic school recorder, its holes, its bell)
  hands: (B) => [[B.hx + 2, B.hy + 12], [B.hx + 8, B.hy + 10]],
  hold: (g, B) => {
    limb(g, B.hx + 4, B.hy + 6, B.hx + 14, B.hy + 20, 2.4, '#FEF3C7'); limb(g, B.hx + 3.5, B.hy + 5.5, B.hx + 13.5, B.hy + 19.5, 0.8, '#FFFFFF', false);
    for (let k = 1; k < 4; k++) px(g, B.hx + 4 + k * 2.5, B.hy + 6 + k * 3.5, 1, 1, '#78350F');
    px(g, B.hx + 12, B.hy + 18, 5, 4, INK); px(g, B.hx + 13, B.hy + 19, 3, 2, '#FEF3C7');
  },
  eyes: 'tired', mouth: 'o',
};
const SNAKES = [['#4D7C0F', '#A3E635', '#1A2E05'], ['#A16207', '#FDE047', '#422006'], ['#1E3A8A', '#93C5FD', '#0F172A'], ['#7F1D1D', '#FCA5A5', '#1C1917']];
/** The snake's basket at its feet (in front: woven in rows, its rim and its lid tipped off), and the snake (a rubber
 *  one on a stick, in steps: its scales banded, its pale belly, its eyes, its tongue): peeking, swaying up (the tell),
 *  out low and long (the strike). */
const drawSnake = (c: Ctx, e: Enemy, f: number) => {
  if (e.health <= 0 || !e.id) return;
  const bx = 26, st = e.aiState, [sc, belly, dark] = SNAKES[Math.abs(Math.round(e.initialX || 0)) % SNAKES.length];
  const sway = Math.sin(f * 0.15) * 4;
  let pts: [number, number][];
  if (st === 'strike') pts = [[bx, -20], [bx + 30, -26], [bx + 60, -18], [bx + 92, -22]];
  else if (st === 'tell') pts = [[bx, -20], [bx + sway, -34], [bx - sway, -48], [bx + 4 + sway, -58]];
  else pts = [[bx, -20], [bx + 2, -26], [bx + 4 + sway * 0.4, -30]];
  const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = 8; path(); c.stroke();
  c.strokeStyle = sc; c.lineWidth = 6; path(); c.stroke();
  c.strokeStyle = lt(sc, 0.3); c.lineWidth = 2; c.save(); c.translate(-1, -1.5); path(); c.stroke(); c.restore();
  c.strokeStyle = belly; c.lineWidth = 1.5; c.save(); c.translate(0.5, 2); path(); c.stroke(); c.restore();
  // (its bands down the back)
  for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx2, by] = pts[i + 1]; for (let t = 0.2; t < 1; t += 0.33) px(c, ax + (bx2 - ax) * t - 1, ay + (by - ay) * t - 2, 2, 3, dark); }
  c.lineCap = 'butt'; c.lineJoin = 'miter';
  const [hx, hy] = pts[pts.length - 1];
  part(c, () => c.ellipse(hx + 3, hy, 6, 4.5, 0, 0, Math.PI * 2), sc, hx - 3, hy - 4.5, 12, 9, 1);
  px(c, hx + 2, hy - 3, 2, 2, '#FDE047'); px(c, hx + 3, hy - 3, 1, 2, INK); px(c, hx + 6, hy - 1, 2, 1, dark); px(c, hx + 1, hy + 2, 6, 1, belly);
  if (st === 'tell' || st === 'strike') { limb(c, hx + 8, hy + 1, hx + 13, hy + 1, 0.8, '#DC2626', false); px(c, hx + 13, hy - 1, 1, 1, '#DC2626'); px(c, hx + 13, hy + 2, 1, 1, '#DC2626'); }
  // (the basket over the snake's tail: woven rows, lit and shaded, the rim, the lid off on its side)
  part(c, () => c.roundRect(bx - 12, -20, 24, 20, 4), '#B45309', bx - 12, -20, 24, 20, 1);
  for (let k = 0; k < 3; k++) { px(c, bx - 11, -17 + k * 6, 22, 1, '#78350F'); for (let x = bx - 10 + (k % 2) * 2; x < bx + 10; x += 4) px(c, x, -16 + k * 6, 2, 2, '#D97706'); }
  px(c, bx - 13, -21, 26, 3, INK); px(c, bx - 12, -21, 24, 2, '#D97706'); px(c, bx - 12, -21, 24, 1, '#FCD34D');
  part(c, () => c.ellipse(bx - 18, -4, 4, 9, 0.35, 0, Math.PI * 2), '#B45309', bx - 22, -13, 8, 18, 1);
};

const FUZZ = ['#C08A4A', '#A16207', '#D6A15E', '#E2B880'];
const CAMEL_COSTUME: Costume = {
  id: 'camel', top: s => pick(s, 2, FUZZ), legs: s => pick(s, 2, FUZZ), shoe: 'paw', shoeCol: '#78350F',
  // (the hump on the back, stuffed: lit, the fuzz in tufts, the seam where it's sewn on)
  back: (g, B, F) => {
    const col = pick(F.seed, 2, FUZZ);
    part(g, () => g.ellipse(-B.w / 2 - 2, B.shY + 8, 13, 15, -0.3, 0, Math.PI * 2), col, -B.w / 2 - 15, B.shY - 7, 26, 30, 1.2);
    px(g, -B.w / 2 - 8, B.shY - 2, 5, 3, lt(col, 0.3));
    for (let k = 0; k < 6; k++) px(g, -B.w / 2 - 12 + (k % 3) * 6, B.shY + 2 + Math.floor(k / 3) * 8, 2, 2, dk(col, 0.18));
    for (let y = B.shY; y < B.shY + 20; y += 3) px(g, -B.w / 2 + 6, y, 1, 2, dk(col, 0.4));
  },
  // (the suit's fuzz in tufts, its zipper up the front, a bridle-tassel bib)
  over: (g, B, F) => {
    const col = pick(F.seed, 2, FUZZ);
    for (let k = 0; k < 9; k++) { px(g, -B.w / 2 + 2 + (k % 3) * 7, B.shY + 4 + Math.floor(k / 3) * 8, 3, 2, dk(col, 0.15)); px(g, -B.w / 2 + 3 + (k % 3) * 7, B.shY + 3 + Math.floor(k / 3) * 8, 2, 1, lt(col, 0.25)); }
    px(g, B.lean - 1, B.shY + 2, 2, B.hipY - B.shY - 2, '#9CA3AF'); for (let y = B.shY + 3; y < B.hipY; y += 3) px(g, B.lean - 2, y, 4, 1, '#6B7280');
    px(g, -B.w / 2 + 2, B.shY, B.w - 4, 3, '#B91C1C'); for (let k = 0; k < 4; k++) { px(g, -B.w / 2 + 4 + k * 7, B.shY + 3, 2, 4, '#FCD34D'); px(g, -B.w / 2 + 4 + k * 7, B.shY + 7, 2, 1, '#B91C1C'); }
  },
  // (the camel head on top: a long snout out front in steps, its nostrils, droopy lids and lashes, buck teeth, the
  // little ears; the kid's face looking out of its neck)
  hat: (g, B, F) => {
    const col = pick(F.seed, 2, FUZZ), y = B.hy - B.ry - 4;
    partTop(g, () => g.ellipse(B.hx, B.hy - 2, B.rx + 2, B.ry + 1, 0, Math.PI, 0), col, B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 4, B.ry + 2, 1);
    part(g, () => g.ellipse(B.hx + 10, y - 2, 17, 8, -0.15, 0, Math.PI * 2), col, B.hx - 7, y - 10, 34, 16, 1.2);
    px(g, B.hx + 14, y + 1, 12, 3, dk(col, 0.2)); px(g, B.hx - 2, y - 8, 14, 2, lt(col, 0.3));
    px(g, B.hx + 22, y - 2, 3, 2, INK); px(g, B.hx + 18, y + 4, 5, 4, '#FFFFFF'); px(g, B.hx + 18, y + 4, 5, 1, INK); px(g, B.hx + 20, y + 4, 1, 4, '#D6D3D1');
    px(g, B.hx + 4, y - 8, 6, 4, '#FFFFFF'); px(g, B.hx + 6, y - 7, 3, 3, INK); px(g, B.hx + 3, y - 9, 8, 2, dk(col, 0.3));
    for (let k = 0; k < 3; k++) px(g, B.hx + 4 + k * 3, y - 11, 1, 2, INK);
    px(g, B.hx - 6, y - 11, 4, 5, dk(col, 0.2)); px(g, B.hx - 5, y - 10, 2, 3, '#E8A0A0');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 2, B.shY - 4]] : null),
  eyes: 'tired', mouth: 'teeth',
};

const SHIRTS = ['#F8FAFC', '#FBCFE8', '#BAE6FD', '#FDE68A', '#C4B5FD', '#FECACA'];
const HOOKAH_COSTUME: Costume = {
  id: 'hookah', top: s => pick(s, 2, SHIRTS), legs: s => pick(s, 3, ['#F5F5F4', '#1C1917', '#57534E', '#1E3A8A']), shoe: 'sandal', shoeCol: '#1C1917', sleeveLen: 0.5,
  // (the silk shirt open to the middle, its collar spread, a sheen down it; the gold chain and its medallion)
  over: (g, B, F) => {
    const sh = pick(F.seed, 2, SHIRTS);
    px(g, B.lean - 3, B.shY, 7, 18, lookSkin(F.seed)); px(g, B.lean - 3, B.shY, 1, 18, dk(lookSkin(F.seed), 0.2));
    for (const s of [-1, 1]) { px(g, B.lean + s * 5 - 2, B.shY - 1, 5, 4, lt(sh, 0.3)); px(g, B.lean + s * 5 - 2, B.shY + 3, 5, 1, dk(sh, 0.3)); }
    px(g, -B.w / 2 + 2, B.shY + 2, 2, B.hipY - B.shY - 4, lt(sh, 0.45));
    for (let k = 0; k < 5; k++) px(g, B.lean - 4 + k * 2, B.shY + 6 + (k === 2 ? 3 : k % 2 ? 2 : 0), 2, 2, '#FCD34D');
    px(g, B.lean - 1, B.shY + 10, 3, 3, '#CA8A04'); px(g, B.lean - 1, B.shY + 10, 1, 1, '#FEF9C3');
  },
  // (shades: the frames, the lenses, the shine)
  face: (g, B) => { px(g, B.hx - 1, B.hy - 4, 13, 4, INK); px(g, B.hx, B.hy - 3, 5, 2, '#3F3F46'); px(g, B.hx + 6, B.hy - 3, 5, 2, '#3F3F46'); px(g, B.hx + 1, B.hy - 3, 1, 1, '#A1A1AA'); px(g, B.hx + 7, B.hy - 3, 1, 1, '#A1A1AA'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 4, B.shY + 18], [B.hx + 8, B.hy + 10]] : [[-B.w / 2 - 4, B.shY + 18], [B.w / 2 + 4, B.shY + 14]]),
  // (the hookah under the far arm: the glass base (the water in it, a shine), the brass stem in its bands, the tray,
  // the clay bowl and its coal glowing, the hose up to the near hand)
  holdFar: (g, B, F, x, y) => {
    ball(g, x - 2, y + 6, 8, '#0E7490', 1); px(g, x - 9, y + 7, 14, 1, '#67E8F9'); px(g, x - 6, y + 1, 2, 4, '#E0F2FE');
    px(g, x - 4, y - 17, 5, 18, INK); px(g, x - 3, y - 16, 3, 16, '#CA8A04'); px(g, x - 3, y - 16, 1, 16, '#FEF3C7'); for (const by of [y - 12, y - 6]) px(g, x - 5, by, 7, 2, '#A16207');
    px(g, x - 8, y - 21, 13, 5, INK); px(g, x - 7, y - 20, 11, 3, '#CA8A04'); px(g, x - 7, y - 20, 11, 1, '#FCD34D');
    px(g, x - 6, y - 25, 9, 5, INK); px(g, x - 5, y - 24, 7, 4, '#B45309'); px(g, x - 4, y - 25, 5, 1, (F.fr % 2) ? '#FB923C' : '#F97316');
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
