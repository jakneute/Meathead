// Canada's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting. Every one of them says SORRY as
// it attacks (shouted on the strike).
//
//   lumberjack  flannel, a toque, a yarn beard on everybody, a big axe: closes in, raises it (the tell: long) and CHOPS
//   mountie     a Mountie in red serge and the flat-brimmed hat, riding a STICK HORSE: gallops at him (a lunge)
//   hockey      a hockey player (jersey, helmet, stick): winds up (the tell) and SLAPSHOTS a puck along the ground at him
//               (shots.ts 'puck': very fast, ricochets off walls and the rink's boards)
//   moose       a kid in a moose suit: brown fuzz, the big moose head with ANTLERS on top (spiky: a dive kick onto them
//               is punished, KindDef.spiky), lowers its head (the tell) and charges

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { safeAhead } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { castKind, meleeHit, womanOf, type Costume, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, LUMBERJACK, MOUNTIE, HOCKEY, MOOSE, SORRY } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];
/** SORRY! (on the strike, in its own voice) */
const sorry = (ctx: FrameContext, e: Enemy, v: { m: string; f: string }) => bark(ctx.state, e, womanOf(e) ? v.f : v.m, SORRY, 0.9);

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const SERGE = '#B91C1C';

const PLAID = [['#B91C1C', '#1C1917'], ['#1D4ED8', '#1C1917'], ['#15803D', '#1C1917'], ['#CA8A04', '#7C2D12'], ['#F8FAFC', '#B91C1C']];
const LUMBERJACK_COSTUME: Costume = {
  id: 'lumberjack', top: s => pick(s, 2, PLAID)[0], legs: s => pick(s, 4, ['#1E3A8A', '#334155', '#78350F']), shoe: 'boot', shoeCol: '#78350F',
  // (the flannel: dark bands both ways over its color and a thin light check between, lit down its near side, the pocket
  // flaps, the buttons; the red suspenders and their clips)
  over: (g, B, F) => {
    const [a, d] = pick(F.seed, 2, PLAID);
    for (let y = B.shY + 3; y < B.hipY; y += 7) { px(g, -B.w / 2, y, B.w, 2, d); px(g, -B.w / 2, y + 4, B.w, 1, lt(a, 0.3)); }
    for (let x = -B.w / 2 + 3; x < B.w / 2; x += 7) { px(g, x, B.shY, 2, B.hipY - B.shY, d); px(g, x + 4, B.shY, 1, B.hipY - B.shY, lt(a, 0.3)); }
    px(g, -B.w / 2, B.shY, 2, B.hipY - B.shY, lt(a, 0.25)); px(g, B.w / 2 - 3, B.shY, 3, B.hipY - B.shY, dk(a, 0.35));
    for (const s of [-1, 1]) { px(g, s * 7 - 4, B.shY + 6, 7, 4, dk(a, 0.2)); px(g, s * 7 - 1, B.shY + 8, 1, 1, '#E7E5E4'); }
    for (let k = 0; k < 4; k++) px(g, B.lean, B.shY + 4 + k * 6, 1, 1, '#E7E5E4');
    for (const s of [-1, 1]) { const sx = s * (B.w / 4) - 1; px(g, sx, B.shY, 3, B.hipY - B.shY, '#DC2626'); px(g, sx, B.shY, 1, B.hipY - B.shY, '#F87171'); px(g, sx - 1, B.hipY - 3, 5, 3, '#A1A1AA'); }
  },
  // (the toque: knit ribs, the folded cuff, its pompom; the yarn beard in strands, its shade)
  hat: (g, B, F) => {
    const col = pick(F.seed, 3, ['#DC2626', '#F8FAFC', '#1D4ED8', '#CA8A04', '#15803D']);
    partTop(g, () => g.ellipse(B.hx, B.hy - 4, B.rx + 1, B.ry, 0, Math.PI, 0), col, B.hx - B.rx - 1, B.hy - B.ry - 4, B.rx * 2 + 2, B.ry, 1);
    for (let x = B.hx - B.rx + 1; x < B.hx + B.rx; x += 3) px(g, x, B.hy - B.ry - 1, 1, B.ry - 4, dk(col, 0.18));
    px(g, B.hx - B.rx - 1, B.hy - 7, B.rx * 2 + 2, 4, dk(col, 0.22)); px(g, B.hx - B.rx - 1, B.hy - 7, B.rx * 2 + 2, 1, lt(col, 0.3));
    ball(g, B.hx, B.hy - B.ry - 5, 3.2, pick(F.seed, 6, ['#F8FAFC', '#FDE047', '#DC2626']), 0.6);
    const beard = pick(F.seed, 5, ['#78350F', '#EA580C', '#1C1917', '#A8A29E', '#FCD34D']);
    part(g, () => { g.moveTo(B.hx - 3, B.hy + 1); g.lineTo(B.hx + B.rx + 1, B.hy + 1); g.lineTo(B.hx + 5, B.hy + 15); g.lineTo(B.hx - 1, B.hy + 11); g.closePath(); }, beard, B.hx - 3, B.hy + 1, B.rx + 4, 14, 1);
    for (let k = 0; k < 4; k++) px(g, B.hx + k * 2, B.hy + 3 + k, 1, 6, dk(beard, 0.3));
    px(g, B.hx + 2, B.hy + 2, 6, 1, lt(beard, 0.3));
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[B.w / 2 - 6, B.shY - 14], [B.w / 2 - 2, B.shY - 18]] : F.pose === 'strike' ? [[B.w / 2 + 8, B.shY + 10], [B.w / 2 + 14, B.shY + 12]] : [[-B.w / 2 - 2, -30], [B.w / 2 - 2, B.shY + 2]]),
  // (the axe: its hickory haft lit along it, the steel head in steps, its edge bright; on the shoulder, high over the
  // head, or chopped down in front)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -1.9 : F.pose === 'strike' ? 0.6 : -2.6, len = 34;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    limb(g, x - Math.cos(a) * 6, y - Math.sin(a) * 6, ex, ey, 3, '#B07A3A'); limb(g, x - Math.cos(a) * 6, y - Math.sin(a) * 6 - 1, ex, ey - 1, 1, '#E0B070', false);
    g.save(); g.translate(ex, ey); g.rotate(a);
    part(g, () => { g.moveTo(-6, -2); g.lineTo(4, -12); g.lineTo(8, -10); g.lineTo(4, 2); g.closePath(); }, '#9CA3AF', -6, -12, 14, 14, 1);
    px(g, 4, -11, 3, 1, '#F8FAFC'); px(g, 6, -10, 2, 8, '#E5E7EB'); px(g, -4, -2, 4, 2, '#52525B');
    g.restore();
  },
  mouth: 'grin',
};

const MOUNTIE_COSTUME: Costume = {
  id: 'mountie', top: SERGE, legs: '#1E293B', shoe: 'boot', shoeCol: '#5A3A1E', stripe: '#FCD34D',
  // (the red serge: lit down its near side, its brass buttons, the blue collar, the Sam Browne belt across the chest and
  // round the waist (its brass buckle), the lanyard)
  over: (g, B) => {
    px(g, -B.w / 2, B.shY + 2, 3, B.hipY - B.shY, lt(SERGE, 0.2)); px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk(SERGE, 0.3));
    px(g, -B.w / 2 + 3, B.shY - 2, B.w - 6, 4, '#1E3A8A'); px(g, -B.w / 2 + 3, B.shY - 2, B.w - 6, 1, '#3B5BB8');
    for (let k = 0; k < 4; k++) { px(g, B.lean - 1, B.shY + 4 + k * 5, 2, 2, '#A16207'); px(g, B.lean - 1, B.shY + 4 + k * 5, 1, 1, '#FCD34D'); }
    limb(g, -B.w / 2 + 2, B.shY + 2, B.w / 2 - 2, B.hipY - 4, 1.6, '#5A3A1E'); limb(g, -B.w / 2 + 2, B.shY + 1, B.w / 2 - 2, B.hipY - 5, 0.6, '#8A5A2E', false);
    px(g, -B.w / 2, B.hipY - 5, B.w, 4, '#5A3A1E'); px(g, -B.w / 2, B.hipY - 5, B.w, 1, '#8A5A2E'); px(g, B.lean - 2, B.hipY - 5, 5, 4, '#CA8A04'); px(g, B.lean - 1, B.hipY - 4, 3, 2, '#FDE68A');
    limb(g, -2, B.shY + 2, -B.w / 2 + 3, B.shY + 12, 0.8, '#FCD34D', false);
  },
  // (the campaign hat: the wide flat brim lit along its top, the Montana pinch in the crown, its band)
  hat: (g, B) => {
    part(g, () => g.ellipse(B.hx, B.hy - 7, B.rx + 9, 3.2, 0, 0, Math.PI * 2), '#A16207', B.hx - B.rx - 9, B.hy - 10, B.rx * 2 + 18, 7, 1);
    px(g, B.hx - B.rx - 7, B.hy - 9, B.rx * 2 + 10, 1, '#D49A3A');
    partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.lineTo(B.hx - 5, B.hy - 18); g.lineTo(B.hx - 2, B.hy - 15); g.lineTo(B.hx, B.hy - 19); g.lineTo(B.hx + 2, B.hy - 15); g.lineTo(B.hx + 5, B.hy - 18); g.lineTo(B.hx + 7, B.hy - 8); g.closePath(); }, '#A16207', B.hx - 7, B.hy - 19, 14, 11, 1);
    px(g, B.hx - 7, B.hy - 11, 14, 3, '#5A3A1E'); px(g, B.hx - 7, B.hy - 11, 14, 1, '#8A5A2E');
    px(g, B.hx - 4, B.hy - 17, 1, 6, '#7A4A10'); px(g, B.hx + 3, B.hy - 17, 1, 6, '#7A4A10');
  },
  hairToo: true,
  hands: (B) => [[B.w / 2 - 2, B.hipY - 8], [B.w / 2 + 6, B.hipY - 10]],
  // (the stick horse: the broom handle back between the legs to the ground behind; the plush head out front (its felt
  // in steps, the yarn mane, the button eye, the felt bridle and its reins); it bobs at the gallop)
  hold: (g, B, F, x, y) => {
    const gallop = F.pose === 'strike' ? Math.sin(F.fr * 1.2) * 3 : 0;
    limb(g, x + 10, y + gallop, -B.w / 2 - 12, 0, 2, '#B07A3A'); limb(g, x + 10, y + gallop - 1, -B.w / 2 - 12, -1, 0.6, '#E0B070', false);
    const col = '#8A5A2E';
    part(g, () => { g.moveTo(x + 6, y - 2 + gallop); g.lineTo(x + 14, y - 16 + gallop); g.lineTo(x + 28, y - 10 + gallop); g.lineTo(x + 26, y - 4 + gallop); g.lineTo(x + 16, y - 4 + gallop); g.lineTo(x + 12, y + 4 + gallop); g.closePath(); }, col, x + 6, y - 16, 22, 20, 1);
    px(g, x + 24, y - 9 + gallop, 4, 3, dk(col, 0.3)); px(g, x + 26, y - 8 + gallop, 1, 1, INK);
    px(g, x + 17, y - 14 + gallop, 3, 3, INK); px(g, x + 18, y - 13 + gallop, 1, 1, '#F8FAFC');
    for (let k = 0; k < 5; k++) { px(g, x + 7 + k * 2, y - 17 + k * 3 + gallop, 3, 3, '#1C1917'); px(g, x + 7 + k * 2, y - 17 + k * 3 + gallop, 1, 1, '#57534E'); }
    px(g, x + 16, y - 10 + gallop, 12, 1, '#DC2626'); px(g, x + 21, y - 10 + gallop, 1, 6, '#DC2626'); limb(g, x + 22, y - 6 + gallop, x + 4, y + 2, 0.6, '#DC2626', false);
  },
  eyes: 'open', mouth: 'smile',
};

const JERSEYS = [['#DC2626', '#F8FAFC'], ['#F8FAFC', '#DC2626'], ['#1D4ED8', '#F8FAFC'], ['#1C1917', '#FCD34D'], ['#15803D', '#FDE047']];
const HOCKEY_COSTUME: Costume = {
  id: 'hockey', top: s => pick(s, 2, JERSEYS)[0], legs: '#1C1917', shoe: 'boot', shoeCol: '#1C1917', stripe: '#E5E7EB',
  // (the jersey: its hem stripes, the shoulder yoke, the crest (a maple leaf), the laced collar, lit and shaded; the
  // padded pants' shell)
  over: (g, B, F) => {
    const [a, b] = pick(F.seed, 2, JERSEYS);
    px(g, -B.w / 2, B.shY + 2, 3, B.hipY - B.shY, lt(a, 0.2)); px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk(a, 0.3));
    px(g, -B.w / 2, B.hipY - 11, B.w, 3, b); px(g, -B.w / 2, B.hipY - 6, B.w, 2, b); px(g, -B.w / 2, B.shY, B.w, 4, b); px(g, -B.w / 2, B.shY, B.w, 1, lt(b, 0.3));
    part(g, () => { g.moveTo(B.lean - 4, B.shY + 12); g.lineTo(B.lean - 2, B.shY + 9); g.lineTo(B.lean, B.shY + 6); g.lineTo(B.lean + 2, B.shY + 9); g.lineTo(B.lean + 4, B.shY + 12); g.lineTo(B.lean + 1, B.shY + 13); g.lineTo(B.lean + 1, B.shY + 16); g.lineTo(B.lean - 1, B.shY + 16); g.lineTo(B.lean - 1, B.shY + 13); g.closePath(); }, b === '#F8FAFC' ? '#DC2626' : b, B.lean - 4, B.shY + 6, 8, 10, 0.6);
    px(g, -1, B.shY - 1, 3, 4, '#F8FAFC'); px(g, 0, B.shY, 1, 1, INK);
    px(g, -B.hipW / 2 - 2, B.hipY - 2, B.hipW + 4, 8, '#1C1917'); px(g, -B.hipW / 2 - 2, B.hipY - 2, B.hipW + 4, 1, '#3F3F46'); px(g, -B.hipW / 2 - 2, B.hipY + 2, B.hipW + 4, 1, b);
  },
  // (the helmet in steps, its vents; the cage in front of the face, its bars)
  hat: (g, B, F) => { const hc = pick(F.seed, 2, JERSEYS)[0]; partTop(g, () => g.ellipse(B.hx, B.hy - 3, B.rx + 1.5, B.ry, 0, Math.PI, 0), hc, B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 3, B.ry, 1.2); for (let k = 0; k < 3; k++) px(g, B.hx - 4 + k * 4, B.hy - B.ry, 2, 1, dk(hc, 0.4)); px(g, B.hx - B.rx - 2, B.hy - 4, B.rx * 2 + 4, 2, dk(hc, 0.25)); },
  face: (g, B) => { for (let k = 0; k < 3; k++) { px(g, B.hx + 1 + k * 4, B.hy - 4, 1, 12, '#9CA3AF'); px(g, B.hx + 1 + k * 4, B.hy - 4, 1, 3, '#E5E7EB'); } px(g, B.hx, B.hy + 2, 11, 1, '#9CA3AF'); px(g, B.hx, B.hy + 6, 11, 1, '#71717A'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 6], [-B.w / 2 - 2, B.shY - 4]] : F.pose === 'strike' ? [[B.w / 2 + 2, B.shY + 18], [B.w / 2 + 12, B.shY + 14]] : [[B.w / 2 - 2, B.shY + 18], [B.w / 2 + 8, B.shY + 20]]),
  // (the stick: its shaft lit along it, the tape on its blade and its knob; on the ice, wound up over the shoulder,
  // followed through)
  hold: (g, B, F, x, y) => {
    let bx: number, by: number;
    if (F.pose === 'tell') { bx = x - 30; by = y - 34; } else if (F.pose === 'strike') { bx = x + 34; by = y - 14; } else { bx = x + 18; by = -2; }
    limb(g, x, y, bx, by, 2.5, '#D6A15E'); limb(g, x, y - 1, bx, by - 1, 0.8, '#F2CFA0', false);
    limb(g, bx, by, bx + 10, by + 1, 3, '#1C1917'); px(g, bx + 2, by - 1, 6, 1, '#52525B');
    px(g, x - 2, y - 2, 4, 4, '#1C1917');
  },
  eyes: 'angry', mouth: 'teeth',
};

const FUR = ['#5B3A1E', '#6B4423', '#4A2F17', '#7A5230'];
const MOOSE_COSTUME: Costume = {
  id: 'moose', top: s => pick(s, 2, FUR), legs: s => pick(s, 2, FUR), shoe: 'paw', shoeCol: '#1C1917',
  // (the moose suit: its fuzz in tufts, the paler belly, the zipper up its front (its pull), lit down its near side)
  over: (g, B, F) => {
    const col = pick(F.seed, 2, FUR);
    px(g, -B.w / 2, B.shY + 2, 3, B.hipY - B.shY, lt(col, 0.18)); px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk(col, 0.3));
    px(g, -5, B.shY + 4, 10, B.hipY - B.shY - 4, lt(col, 0.22));
    for (let k = 0; k < 10; k++) { const tx = -B.w / 2 + 3 + ((k * 7) % (B.w - 6)), ty = B.shY + 6 + Math.floor(k / 3) * 8; px(g, tx, ty, 2, 2, dk(col, 0.25)); px(g, tx, ty, 1, 1, lt(col, 0.3)); }
    px(g, B.lean, B.shY + 2, 1, B.hipY - B.shY - 2, '#A1A1AA'); for (let y = B.shY + 3; y < B.hipY; y += 2) px(g, B.lean - 1, y, 3, 1, '#71717A'); px(g, B.lean - 1, B.shY + 2, 3, 4, '#D4D4D8');
  },
  // (the moose head on top: the long droopy snout and its nostrils, the dewlap, the felt antlers spread wide (their
  // palms in steps, the points up), the googly eyes)
  hat: (g, B, F) => {
    const col = pick(F.seed, 2, FUR), y = B.hy - B.ry - 2;
    partTop(g, () => g.ellipse(B.hx, B.hy - 2, B.rx + 2, B.ry + 1, 0, Math.PI, 0), col, B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 4, B.ry + 2, 1);
    part(g, () => g.ellipse(B.hx + 10, y + 2, 15, 8, 0.25, 0, Math.PI * 2), col, B.hx - 5, y - 6, 30, 16, 1.2);
    px(g, B.hx + 20, y + 3, 4, 3, INK); px(g, B.hx + 16, y + 5, 3, 2, INK); px(g, B.hx + 14, y - 2, 8, 2, lt(col, 0.3));
    for (const ex of [B.hx + 4, B.hx + 9]) { ball(g, ex, y - 3, 2.6, '#F8FAFC', 0.6); px(g, ex + (F.fr % 2), y - 3, 1.5, 1.5, INK); }
    part(g, () => { g.moveTo(B.hx + 6, y + 8); g.lineTo(B.hx + 13, y + 9); g.lineTo(B.hx + 10, y + 18); g.closePath(); }, dk(col, 0.15), B.hx + 6, y + 8, 7, 10, 0.8);
    for (const s of [-1, 1]) {
      const ax = B.hx + s * 8, ay = y - 6;
      part(g, () => { g.moveTo(ax, ay); g.lineTo(ax + s * 18, ay - 6); g.lineTo(ax + s * 24, ay - 16); g.lineTo(ax + s * 18, ay - 14); g.lineTo(ax + s * 16, ay - 22); g.lineTo(ax + s * 10, ay - 14); g.lineTo(ax + s * 8, ay - 20); g.lineTo(ax + s * 3, ay - 8); g.closePath(); }, '#D6C4A8', ax - 24, ay - 22, 48, 22, 1);
      px(g, ax + s * 6, ay - 9, 1, 3, '#A8946E'); px(g, ax + s * 12, ay - 10, 1, 3, '#A8946E'); px(g, ax + s * 16 - 1, ay - 20, 2, 1, '#F2E8D4');
    }
  },
  hairToo: false,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[B.w / 2, B.shY + 18], [B.w / 2 + 6, B.shY + 20]] : null),
  eyes: 'wide', mouth: 'o',
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_lumberjack', costume: LUMBERJACK_COSTUME, stats: { w: 38, h: 74, hp: 140, contact: 6, mass: 230 },
  head: { x: 1, y: -68, r: 10 },
  voice: V.lumberjack, pool: LUMBERJACK, speed: 1.1, range: [40, 100], reachY: 60, tell: 30, strikeFor: 12, after: 30, cooldown: 45,
  strike: (ctx, e) => { sorry(ctx, e, V.lumberjack); playSound('whoosh', 0.8, -8); if (meleeHit(ctx, e, 88, 15, 'm2:fl_lumberjack', 10)) { playSound('crunch', 0.9, -6); shakeScreen(ctx.state, 4, 3); } },
});

const RODE = new WeakSet<Enemy>();
castKind({
  kind: 'm2:fl_mountie', costume: MOUNTIE_COSTUME, stats: { w: 38, h: 74, hp: 120, contact: 6, mass: 210 },
  voice: V.mountie, pool: MOUNTIE, speed: 1.4, range: [90, 300], reachY: 70, tell: 22, strikeFor: 26, after: 30, cooldown: 55,
  strike: (ctx, e) => { RODE.delete(e); sorry(ctx, e, V.mountie); playSound('snort', 0.6, 10); },
  striking: (ctx, e) => {
    const ok = safeAhead(ctx, e, e.facing ?? 1, 30);
    e.vel.x = ok && e.aiTimer < 22 ? (e.facing ?? 1) * 6 : 0;
    if (e.aiTimer % 6 === 0) playSound('thud', 0.3, 18);
    if (!RODE.has(e) && meleeHit(ctx, e, 52, 12, 'm2:fl_mountie', 12, 50)) { RODE.add(e); playSound('slam', 0.7, 4); }
  },
  poseFor: e => (e.aiState === 'strike' ? 'walk' : null),
});

castKind({
  kind: 'm2:fl_hockey', costume: HOCKEY_COSTUME, stats: { w: 36, h: 74, hp: 100, contact: 6, mass: 200 },
  voice: V.hockey, pool: HOCKEY, speed: 1.3, range: [160, 520], reachY: 50, tell: 26, after: 22, cooldown: 75,
  strike: (ctx, e) => { sorry(ctx, e, V.hockey); shootFlat(ctx.state, e, 'puck', 8); },
});

const GORED = new WeakSet<Enemy>();
castKind({
  kind: 'm2:fl_moose', costume: MOOSE_COSTUME, stats: { w: 44, h: 84, hp: 200, contact: 8, mass: 320 },
  head: { x: 4, y: -76, r: 12 }, grab: 'body',
  voice: V.moose, pool: MOOSE, speed: 0.9, range: [100, 320], reachY: 70, tell: 30, strikeFor: 30, after: 36, cooldown: 70,
  strike: (ctx, e) => { GORED.delete(e); sorry(ctx, e, V.moose); playSound('bellow', 0.7, 0); },
  striking: (ctx, e) => {
    const ok = safeAhead(ctx, e, e.facing ?? 1, 30);
    e.vel.x = ok && e.aiTimer < 26 ? (e.facing ?? 1) * 5.5 : 0;
    if (!GORED.has(e) && meleeHit(ctx, e, 58, 13, 'm2:fl_moose', 16, 60)) { GORED.add(e); playSound('slam', 0.9, -10); shakeScreen(ctx.state, 4, 3); }
  },
  spiky: { source: 'm2:fl_moose_antlers', label: 'ANTLERS!' },
});

void ball;
