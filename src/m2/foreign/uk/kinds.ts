// The UK's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   guard     a royal guard: the red tunic, the tall black bearskin, the rifle shouldered: STANDS THERE. No reaction to
//             anything, bumping into one doesn't hurt (harmless), it won't even look at him... till it's hurt (shot, hit,
//             anything): then it's awake for good, fast, and the BAYONET hits hard
//   hooligan  a soccer hooligan: a team jersey, a striped scarf, a painted cheek, a pint in each fist: lobs pints (shots.ts
//             'pint'); keeps to wherever it is (the bus's top deck, the pub's roof: no pathing)
//   tealady   the tea lady (always a lady): a cardigan, pearls, an apron, a curly gray wig, a teapot: lobs scalding tea
//             (shots.ts 'tea'); up close, the pot
//   bobby     a bobby: the tall custodian helmet, the navy tunic, a whistle, a truncheon: closes in and beats him with it

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { castKind, leadOf, meleeHit, womanOf, byPants, type Costume, type Ctx, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { lob } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, GUARD, HOOLIGAN, TEALADY, BOBBY } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

/** Buttons down a front (stepped: a lit pixel, a shade), in pairs or evenly. */
const buttons = (g: Ctx, x: number, y0: number, n: number, gap: number, paired: boolean, col = '#FCD34D') => {
  for (let k = 0; k < n; k++) {
    const y = y0 + (paired ? Math.floor(k / 2) * gap * 2 + (k % 2) * 3 : k * gap);
    px(g, x - 1, y, 3, 2, dk(col, 0.35)); px(g, x - 1, y, 2, 1, col); px(g, x - 1, y, 1, 1, lt(col, 0.6));
  }
};

const PLUMES: (string | null)[] = ['#F8FAFC', '#DC2626', null, '#1D4ED8', '#F8FAFC'];
const GUARD_COSTUME: Costume = {
  id: 'guard', top: '#B91C1C', legs: '#1C1917', shoe: 'boot', shoeCol: '#1C1917', stripe: '#DC2626',
  // (the scarlet tunic: its blue collar and its gold braid, the shoulder straps, the buttons (in pairs on some), the
  // white belt and its brass plate, the skirt flaring under it; lit down its near side, shaded down its far)
  over: (g, B, F) => {
    px(g, -B.w / 2, B.shY + 2, 3, B.hipY - B.shY, lt('#B91C1C', 0.2)); px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk('#B91C1C', 0.3));
    px(g, -B.w / 2 + 2, B.shY - 2, B.w - 4, 4, '#1E3A8A'); px(g, -B.w / 2 + 2, B.shY - 2, B.w - 4, 1, '#3B5BB8'); px(g, -B.w / 2 + 2, B.shY + 1, B.w - 4, 1, '#FCD34D');
    for (const s of [-1, 1]) { px(g, s * (B.w / 2 - 3) - 3, B.shY, 6, 3, '#FCD34D'); px(g, s * (B.w / 2 - 3) - 3, B.shY + 2, 6, 1, '#A16207'); }
    buttons(g, B.lean, B.shY + 4, 6, 5, pick(F.seed, 4, [true, false]));
    px(g, -B.w / 2, B.hipY - 7, B.w, 5, '#F8FAFC'); px(g, -B.w / 2, B.hipY - 7, B.w, 1, '#FFFFFF'); px(g, -B.w / 2, B.hipY - 3, B.w, 1, '#CBD5E1');
    px(g, B.lean - 3, B.hipY - 7, 7, 5, '#CA8A04'); px(g, B.lean - 2, B.hipY - 6, 5, 3, '#FCD34D'); px(g, B.lean - 2, B.hipY - 6, 1, 1, '#FEF9C3');
    px(g, -B.hipW / 2 - 1, B.hipY - 2, B.hipW + 2, 7, '#B91C1C'); px(g, -B.hipW / 2 - 1, B.hipY + 4, B.hipW + 2, 1, dk('#B91C1C', 0.4)); px(g, B.hipW / 2 - 2, B.hipY - 2, 3, 7, dk('#B91C1C', 0.3));
  },
  // (the bearskin: tall, black, its fur in tufts (stepped grays catching the light up its near side), the brass chin
  // chain, a plume down its side on some)
  hat: (g, B, F) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 12, B.rx + 3, B.ry + 14, 0, Math.PI, 0), '#111827', B.hx - B.rx - 3, B.hy - B.ry - 26, B.rx * 2 + 6, B.ry + 14, 1.2);
    px(g, B.hx - B.rx - 3, B.hy - 12, B.rx * 2 + 6, 8, '#111827');
    for (let k = 0; k < 14; k++) { const tx = B.hx - B.rx - 1 + ((k * 5) % (B.rx * 2 + 2)), ty = B.hy - B.ry - 20 + Math.floor(k / 3) * 6 + (k % 2) * 2; px(g, tx, ty, 2, 2, k % 3 ? '#374151' : '#4B5563'); px(g, tx, ty + 2, 1, 1, '#0B0F17'); }
    px(g, B.hx - B.rx - 2, B.hy - B.ry - 16, 2, 22, '#4B5563'); px(g, B.hx + B.rx + 1, B.hy - B.ry - 12, 2, 18, '#030712');
    for (let k = 0; k < 6; k++) px(g, B.hx + 5 + (k % 2), B.hy - 4 + k * 2, 1, 1, k % 2 ? '#A16207' : '#FCD34D');
    const pl = pick(F.seed, 5, PLUMES);
    if (pl) { for (let k = 0; k < 4; k++) px(g, B.hx - B.rx - 4 - (k % 2), B.hy - B.ry - 12 + k * 4, 3, 4, k % 2 ? dk(pl, 0.2) : pl); px(g, B.hx - B.rx - 4, B.hy - B.ry - 12, 1, 14, lt(pl, 0.4)); }
  },
  hands: (B, F) => (F.pose === 'tell' ? [[B.w / 2 - 2, B.shY + 14], [B.w / 2 - 6, B.shY + 8]] : F.pose === 'strike' ? [[B.w / 2 + 6, B.shY + 12], [B.w / 2 + 18, B.shY + 10]] : [[-B.w / 2 - 2, -30], [B.w / 2 + 2, B.shY + 18]]),
  // (the rifle: its wooden stock, the steel down it, the white sling; shouldered upright at attention, or level with the
  // bayonet out (its glint) in the thrust)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'tell' || F.pose === 'strike') {
      limb(g, x - 24, y + 2, x + 8, y, 3.5, '#5A3A1E'); limb(g, x - 24, y + 1, x + 8, y - 1, 1, '#8A5A2E', false);
      limb(g, x + 8, y, x + 30, y - 2, 2, '#52525B'); limb(g, x + 30, y - 2, x + 48, y - 3, 1.5, '#E5E7EB'); px(g, x + 40, y - 4, 3, 1, '#FFFFFF');
      return;
    }
    limb(g, x + 2, y + 6, x + 3, y - 22, 3.5, '#5A3A1E'); limb(g, x + 1, y + 5, x + 2, y - 22, 1, '#8A5A2E', false);
    limb(g, x + 3, y - 22, x + 4, y - 50, 2, '#52525B'); limb(g, x + 4, y - 50, x + 5, y - 66, 1.5, '#E5E7EB'); px(g, x + 4, y - 62, 1, 3, '#FFFFFF');
    px(g, x - 1, y - 30, 1, 30, '#F8FAFC');
  },
  eyes: 'open', mouth: 'flat',
};

const TEAMS = [['#DC2626', '#F8FAFC'], ['#1D4ED8', '#F8FAFC'], ['#F8FAFC', '#1E3A8A'], ['#FDE047', '#1C1917'], ['#7F1D1D', '#7DD3FC']];
/** A pint (local, its foot at x, y): the dimpled mug and its handle, the beer in steps, the head of foam, a drip. */
const pint = (g: Ctx, x: number, y: number) => {
  px(g, x - 5, y - 13, 11, 13, INK); px(g, x - 4, y - 9, 9, 8, '#B45309'); px(g, x - 4, y - 9, 2, 8, '#D97706'); px(g, x + 3, y - 9, 2, 8, '#7C2D12');
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) px(g, x - 3 + k * 3, y - 8 + j * 4, 1, 1, '#FCD34D');
  px(g, x - 4, y - 12, 9, 3, '#FEF3C7'); px(g, x - 4, y - 12, 9, 1, '#FFFFFF'); px(g, x + 3, y - 10, 1, 3, '#FEF3C7');
  px(g, x + 5, y - 10, 3, 1, INK); px(g, x + 7, y - 10, 1, 6, INK); px(g, x + 5, y - 5, 3, 1, INK); px(g, x + 5, y - 9, 2, 4, '#E0F2FE');
};
const HOOLIGAN_COSTUME: Costume = {
  id: 'hooligan', top: s => pick(s, 2, TEAMS)[0], legs: s => pick(s, 3, ['#1E3A8A', '#1C1917', '#57534E']), shoe: 'sneaker', shoeCol: '#F5F5F4', sleeveLen: 0.6,
  // (the team shirt: its collar, the trim down its sides, the crest, a shade down its far side; the striped scarf wound
  // round the neck, its fringed end hanging)
  over: (g, B, F) => {
    const [a, b] = pick(F.seed, 2, TEAMS);
    px(g, -B.w / 2, B.shY + 1, B.w, 2, b); px(g, -B.w / 2, B.shY + 3, 2, B.hipY - B.shY - 3, b); px(g, B.w / 2 - 2, B.shY + 3, 2, B.hipY - B.shY - 3, dk(b, 0.2));
    px(g, B.w / 2 - 5, B.shY + 3, 3, B.hipY - B.shY - 3, dk(a, 0.25));
    px(g, B.lean - 4, B.shY + 8, 7, 8, INK); px(g, B.lean - 3, B.shY + 9, 5, 6, b); px(g, B.lean - 2, B.shY + 10, 3, 3, a); px(g, B.lean - 3, B.shY + 9, 5, 1, lt(b, 0.4));
    for (let k = 0; k < 5; k++) { px(g, -B.w / 2 + k * 5, B.shY - 3, 5, 5, k % 2 ? b : a); px(g, -B.w / 2 + k * 5, B.shY - 3, 5, 1, lt(k % 2 ? b : a, 0.35)); }
    px(g, B.w / 2 - 5, B.shY - 1, 5, 20, a); for (let k = 0; k < 3; k++) px(g, B.w / 2 - 5, B.shY + 2 + k * 6, 5, 2, b);
    for (let k = 0; k < 3; k++) px(g, B.w / 2 - 5 + k * 2, B.shY + 19, 1, 3, b);
    px(g, B.w / 2 - 1, B.shY - 1, 1, 20, dk(a, 0.35));
  },
  // (St George's cross painted on the cheek: a red cross on white, its edge smudged)
  face: (g, B) => { px(g, B.hx + 2, B.hy + 1, 7, 6, '#F1F5F9'); px(g, B.hx + 2, B.hy + 1, 7, 1, '#FFFFFF'); px(g, B.hx + 5, B.hy + 1, 2, 6, '#DC2626'); px(g, B.hx + 2, B.hy + 3, 7, 2, '#DC2626'); px(g, B.hx + 8, B.hy + 5, 1, 2, '#CBD5E1'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 6, B.shY - 16]] : F.pose === 'strike' ? null : [[-B.w / 2 - 6, B.shY + 2], [B.w / 2 + 8, B.shY - 2]]),
  // (pints up, cheering, one cocked back to throw)
  hold: (g, B, F, x, y) => { if (F.pose === 'strike') return; pint(g, x, y); },
  holdFar: (g, B, F, x, y) => pint(g, x, y),
  eyes: 'angry', mouth: 'teeth',
};

const CARDIGANS = ['#F9A8D4', '#A5B4FC', '#86EFAC', '#FDE68A', '#C4B5FD'];
/** The teapot (local, held at x, y): bone china in steps, the floral band round its belly (blue and pink), the lid and
 *  its knob, the spout, the handle; steam off the spout. */
const teapot = (g: Ctx, x: number, y: number, steam: boolean, fr: number) => {
  ball(g, x + 4, y + 2, 8, '#F8FAFC', 1);
  px(g, x - 3, y, 14, 2, '#3B82F6'); for (let k = 0; k < 4; k++) px(g, x - 2 + k * 4, y - 1, 2, 2, k % 2 ? '#F472B6' : '#93C5FD');
  px(g, x - 1, y - 7, 10, 2, INK); px(g, x, y - 7, 8, 1, '#F1F5F9'); ball(g, x + 4, y - 9, 1.6, '#F8FAFC', 0.6);
  limb(g, x + 11, y + 2, x + 18, y - 5, 2.2, '#F8FAFC'); px(g, x + 17, y - 6, 2, 1, '#CBD5E1');
  limb(g, x - 4, y - 2, x - 6, y + 4, 1.6, '#F8FAFC');
  if (steam) { const w = Math.sin(fr * 0.4) * 2; px(g, x + 17 + w, y - 12, 2, 3, '#E5E7EB'); px(g, x + 18 - w, y - 17, 2, 3, '#F1F5F9'); px(g, x + 17 + w, y - 22, 1, 3, '#F8FAFC'); }
};
const TEALADY_COSTUME: Costume = {
  id: 'tealady', top: s => pick(s, 2, CARDIGANS), legs: s => pick(s, 3, ['#57534E', '#78716C', '#7C2D12']), shoe: 'shoe', shoeCol: '#57534E',
  // (the cardigan: lit and shaded down its sides, the ribbed hem; the blouse's collar; the pearls (each lit); the apron:
  // frilled, sprigged with little flowers, its pocket, its ties)
  over: (g, B, F) => {
    const cc = pick(F.seed, 2, CARDIGANS);
    px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk(cc, 0.25)); px(g, -B.w / 2, B.shY + 2, 2, B.hipY - B.shY, lt(cc, 0.3));
    for (let x = -B.w / 2; x < B.w / 2; x += 2) px(g, x, B.hipY - 3, 1, 3, dk(cc, 0.2));
    px(g, -4, B.shY, 3, 3, '#F8FAFC'); px(g, 2, B.shY, 3, 3, '#F8FAFC');
    for (let k = 0; k < 6; k++) { const bx = -5 + k * 2.2, by = B.shY + 3 + (k === 2 || k === 3 ? 2 : k === 1 || k === 4 ? 1 : 0); ball(g, bx, by, 1.2, '#FFFFFF', 0); px(g, bx - 1, by - 1, 1, 1, '#FFFFFF'); }
    const ax = -B.hipW / 2 + 1, aw = B.hipW - 2, ay = B.shY + 14;
    px(g, ax - 1, ay - 1, aw + 2, B.hipY - ay + 8, INK); px(g, ax, ay, aw, B.hipY - ay + 6, '#F8FAFC'); px(g, ax, ay, 2, B.hipY - ay + 6, '#FFFFFF'); px(g, ax + aw - 2, ay, 2, B.hipY - ay + 6, '#E2E8F0');
    for (let k = 0; k < 6; k++) px(g, ax + 2 + ((k * 5) % Math.max(1, aw - 3)), ay + 3 + Math.floor(k / 2) * 6, 1, 1, k % 2 ? '#F472B6' : '#60A5FA');
    for (let x = ax; x < ax + aw; x += 3) px(g, x, B.hipY + 5, 2, 2, '#FCA5A5');
    px(g, ax + 3, B.hipY - 4, aw - 6, 5, '#E2E8F0'); px(g, ax + 3, B.hipY - 4, aw - 6, 1, '#FCA5A5');
    px(g, ax - 2, B.hipY - 8, aw + 4, 2, '#FCA5A5');
  },
  // (the curly gray wig: curls in steps, each lit on its top-left, a shade between)
  hat: (g, B) => {
    for (let k = 0; k < 7; k++) ball(g, B.hx - B.rx + 1 + k * 3, B.hy - B.ry + 1 + (k % 2) * 2, 3.4, '#D1D5DB', 0.6);
    ball(g, B.hx - B.rx, B.hy - 2, 3.4, '#D1D5DB', 0.6); ball(g, B.hx - B.rx + 1, B.hy + 3, 3, '#C4C8CE', 0.6);
    for (let k = 0; k < 5; k++) px(g, B.hx - B.rx + 2 + k * 4, B.hy - B.ry - 1 + (k % 2) * 2, 1, 1, '#F3F4F6');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 4, B.shY - 12]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 16, B.shY + 2]] : [[-B.w / 2, B.shY + 14], [B.w / 2 + 8, B.shY + 14]]),
  hold: (g, B, F, x, y) => teapot(g, x, y, F.pose !== 'strike', F.fr),
  eyes: 'smug', mouth: 'smile',
};

const BOBBY_COSTUME: Costume = {
  id: 'bobby', top: '#1E293B', legs: '#1E293B', shoe: 'boot', shoeCol: '#0F172A',
  // (the navy tunic: lit down its near side, its silver buttons, the collar numbers, the belt and its buckle, the whistle
  // chain looped from a button to the pocket)
  over: (g, B) => {
    px(g, -B.w / 2, B.shY + 2, 3, B.hipY - B.shY, lt('#1E293B', 0.18)); px(g, B.w / 2 - 4, B.shY + 2, 4, B.hipY - B.shY, dk('#1E293B', 0.35));
    buttons(g, B.lean, B.shY + 4, 4, 6, false, '#CBD5E1');
    px(g, -B.w / 2 + 3, B.shY - 1, 4, 3, '#CBD5E1'); px(g, B.w / 2 - 7, B.shY - 1, 4, 3, '#CBD5E1');
    px(g, -B.w / 2, B.hipY - 4, B.w, 3, '#0F172A'); px(g, B.lean - 2, B.hipY - 4, 5, 3, '#94A3B8'); px(g, B.lean - 2, B.hipY - 4, 5, 1, '#E2E8F0');
    limb(g, -2, B.shY + 4, -B.w / 2 + 4, B.shY + 14, 1, '#CBD5E1', false); px(g, -B.w / 2 + 3, B.shY + 14, 2, 3, '#E2E8F0');
    px(g, -B.w / 2 + 2, B.shY + 12, 6, 1, dk('#1E293B', 0.4));
  },
  // (the custodian helmet: a tall dome in steps, the silver star badge on its front (lit, its points), the rose on top,
  // the black band round its brim, the chin strap)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 6, B.rx + 1, B.ry + 8, 0, Math.PI, 0), '#1E293B', B.hx - B.rx - 1, B.hy - B.ry - 14, B.rx * 2 + 2, B.ry + 8, 1.2);
    px(g, B.hx - B.rx, B.hy - B.ry - 8, 2, 10, '#475569'); px(g, B.hx + B.rx - 2, B.hy - B.ry - 6, 2, 8, '#0F172A');
    px(g, B.hx - B.rx - 3, B.hy - 7, B.rx * 2 + 6, 3, '#0F172A'); px(g, B.hx - B.rx - 3, B.hy - 7, B.rx * 2 + 6, 1, '#334155');
    const sx = B.hx + 3, sy = B.hy - 13;
    px(g, sx - 3, sy - 1, 7, 3, '#94A3B8'); px(g, sx - 1, sy - 3, 3, 7, '#94A3B8'); px(g, sx - 2, sy - 2, 5, 5, '#CBD5E1'); px(g, sx - 1, sy - 1, 2, 2, '#F8FAFC'); px(g, sx, sy, 1, 1, '#1E3A8A');
    ball(g, B.hx, B.hy - B.ry - 15, 2, '#CBD5E1', 0.6);
    px(g, B.hx + B.rx - 1, B.hy - 5, 1, 9, '#0F172A');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 12], [-B.w / 2 + 2, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 14, B.shY + 6]] : null),
  // (the truncheon: black, lit along it, its grip's ridges, the leather thong)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? -0.2 : 1.4, ca = Math.cos(a), sa = Math.sin(a);
    limb(g, x, y, x + ca * 26, y + sa * 26, 3.2, '#1C1917'); limb(g, x - sa, y + ca - 1, x + ca * 26 - sa, y + sa * 26 + ca - 1, 1, '#57534E', false);
    for (let k = 0; k < 3; k++) px(g, x + ca * (2 + k * 2) - 1, y + sa * (2 + k * 2) - 1, 2, 2, '#3F3F46');
    px(g, x - ca * 3, y - sa * 3 + 2, 2, 5, '#78350F');
  },
  eyes: 'angry', mouth: 'flat',
};

// ---------------------------------------------------------------------------------------------------------------

/** The guard: at attention (harmless, still, facing the street) till it's hurt; then awake for good. */
const AWAKE = new WeakSet<Enemy>();
const guardOwn = (ctx: FrameContext, e: Enemy) => {
  if (AWAKE.has(e)) return false;
  if (e.health < e.maxHealth) {
    AWAKE.add(e); e.harmless = false;
    bark(ctx.state, e, womanOf(e) ? V.guard.f : V.guard.m, byPants(ctx.state, GUARD), 1);
    return false;
  }
  e.harmless = true; e.vel.x = 0; e.facing = -1; e.aiState = 'stand';
  return true;
};
const THRUST = new WeakSet<Enemy>();
castKind({
  kind: 'm2:fl_guard', costume: GUARD_COSTUME, stats: { w: 36, h: 76, hp: 170, contact: 8, mass: 220 },
  head: { x: 1, y: -70, r: 10 },
  voice: V.guard, pool: GUARD, speed: 1.9, range: [50, 150], reachY: 70, tell: 16, strikeFor: 12, after: 24, cooldown: 40,
  own: guardOwn,
  strike: (_ctx, e) => { THRUST.delete(e); playSound('whoosh', 0.8, 0); },
  striking: (ctx, e) => {
    e.vel.x = e.aiTimer < 8 ? (e.facing ?? 1) * 4.5 : 0;
    if (!THRUST.has(e) && meleeHit(ctx, e, 106, 16, 'm2:fl_guard', 13)) { THRUST.add(e); playSound('crunch', 0.9, -2); }
  },
  poseFor: e => (AWAKE.has(e) ? null : 'stand'),
});

castKind({
  kind: 'm2:fl_hooligan', costume: HOOLIGAN_COSTUME, stats: { w: 36, h: 72, hp: 100, contact: 6, mass: 190 },
  voice: V.hooligan, pool: HOOLIGAN, speed: 1.2, range: [130, 420], reachY: 260, tell: 22, after: 20, cooldown: 70,
  strike: (ctx, e) => { const t = leadOf(ctx.state, 36); lob(ctx.state, e, 'pint', t.x, t.y, 36); },
  pathing: false,
});

castKind({
  kind: 'm2:fl_tealady', costume: TEALADY_COSTUME, woman: true, stats: { w: 34, h: 66, hp: 85, contact: 4, mass: 150 },
  voice: V.tealady, pool: TEALADY, speed: 1.1, range: [30, 340], reachY: 240, tell: 22, after: 22, cooldown: 60,
  strike: (ctx, e) => {
    if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 80) { if (meleeHit(ctx, e, 74, 8, 'm2:fl_tealady', 8)) playSound('clink', 0.8, 0); }
    else { const t = leadOf(ctx.state, 34); lob(ctx.state, e, 'tea', t.x, t.y, 34); }
  },
});

castKind({
  kind: 'm2:fl_bobby', costume: BOBBY_COSTUME, stats: { w: 36, h: 74, hp: 115, contact: 6, mass: 200 },
  head: { x: 1, y: -68, r: 10 },
  voice: V.bobby, pool: BOBBY, speed: 1.45, range: [40, 100], reachY: 60, tell: 18, strikeFor: 10, after: 24, cooldown: 45,
  strike: (ctx, e) => { playSound('beep', 0.5, 20); if (meleeHit(ctx, e, 82, 10, 'm2:fl_bobby', 10)) playSound('thud', 0.8, 4); },
  striking: (_ctx, e) => { e.vel.x = e.aiTimer < 5 ? (e.facing ?? 1) * 2 : 0; },
});

void part;
