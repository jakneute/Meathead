// Germany's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look):
//
//   tuba     the oompah band's tuba: lederhosen (or a dirndl), a feathered alpine hat, the tuba's bell up over the
//            shoulder. At range: OOM-PAH, a fat slow ring of sound (shots.ts 'tuba') that barely hurts but shoves him
//            hard (off a ledge, as like as not)
//   barmaid  a fistful of steins (a dirndl, or a barman's vest): lobs them, full, at him; they shatter
//   slapper  the lederhosen slap-dancer: closes right in and slaps, slap, SLAP (a flurry: thighs, shoes, his face)

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { lookOf } from '../../adventure/temple/people';
import { castKind, leadOf, meleeHit, type Costume, type Body, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { shootFlat, lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, TUBA, BARMAID, SLAPPER } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];
type G = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

/** Lederhosen's suspenders and their embroidered bar, horn buttons (him), or a dirndl's laced bodice, its apron and bow
 *  (her): each in steps. */
const trachten = (g: G, B: Body, seed: number) => {
  if (lookOf(seed).woman) {
    const body = pick(seed, 3, ['#15803D', '#B91C1C', '#1E3A8A']), apron = pick(seed, 4, ['#F5F5F4', '#FBCFE8', '#BFDBFE']);
    // (the bodice: lit down its near side, shaded down its far, laced up the front in a criss-cross, a trim at its top)
    px(g, -B.w / 2 + 1, B.shY + 6, B.w - 2, B.hipY - B.shY - 4, body); px(g, -B.w / 2 + 1, B.shY + 6, 2, B.hipY - B.shY - 4, lt(body, 0.3)); px(g, B.w / 2 - 3, B.shY + 6, 2, B.hipY - B.shY - 4, dk(body, 0.3));
    px(g, -B.w / 2 + 1, B.shY + 5, B.w - 2, 2, '#FCD34D'); px(g, -B.w / 2 + 1, B.shY + 5, B.w - 2, 1, '#FEF08A');
    for (let k = 0; k < 4; k++) { const y = B.shY + 8 + k * 4; px(g, -3, y, 2, 1, '#F8FAFC'); px(g, 1, y, 2, 1, '#F8FAFC'); px(g, -1, y + 2, 2, 1, '#E5E7EB'); }
    // (the skirt, its hem trim; the apron over it, its folds; the bow tied at the side)
    px(g, -B.hipW / 2 - 2, B.hipY, B.hipW + 4, 24, body); px(g, -B.hipW / 2 - 2, B.hipY, 2, 24, lt(body, 0.25)); px(g, B.hipW / 2, B.hipY, 2, 24, dk(body, 0.3));
    px(g, -B.hipW / 2 - 2, B.hipY + 21, B.hipW + 4, 2, '#FCD34D');
    px(g, -B.hipW / 2 + 3, B.hipY, B.hipW - 6, 22, apron); px(g, -B.hipW / 2 + 3, B.hipY, 2, 22, lt(apron, 0.4));
    for (const fx of [-2, 3]) px(g, fx, B.hipY + 3, 1, 18, dk(apron, 0.12));
    px(g, -B.hipW / 2 + 3, B.hipY - 1, B.hipW - 6, 2, dk(apron, 0.15));
    px(g, B.hipW / 2 - 4, B.hipY - 3, 4, 4, apron); px(g, B.hipW / 2, B.hipY - 3, 3, 3, dk(apron, 0.1)); px(g, B.hipW / 2 - 1, B.hipY + 1, 2, 6, apron);
  } else suspenders(g, B);
};
/** Lederhosen's suspenders: leather, lit down their edges; the bar across embroidered with an edelweiss; horn buttons. */
const suspenders = (g: G, B: Body) => {
  for (const s of [-1, 1]) { px(g, s * 5 - 1, B.shY, 3, B.hipY - B.shY, '#57381E'); px(g, s * 5 - 1, B.shY, 1, B.hipY - B.shY, '#7C5530'); }
  px(g, -6, B.shY + 11, 14, 5, '#57381E'); px(g, -6, B.shY + 11, 14, 1, '#7C5530'); px(g, -6, B.shY + 15, 14, 1, '#3F2A14');
  px(g, 0, B.shY + 12, 3, 3, '#F8FAFC'); px(g, 1, B.shY + 13, 1, 1, '#FCD34D'); for (const lx of [-4, 5]) px(g, lx, B.shY + 13, 2, 1, '#16A34A');
  for (const s of [-1, 1]) { px(g, s * 5 - 1, B.hipY - 3, 3, 3, INK); px(g, s * 5, B.hipY - 2, 1, 1, '#D6D3D1'); }
};
/** The feathered alpine hat: green felt in steps (its crown's dent, its brim lit), a twisted cord, a pin, a feather. */
const alpineHat = (g: G, B: Body) => {
  part(g, () => g.ellipse(B.hx, B.hy - 7, B.rx + 4, 3, 0, 0, Math.PI * 2), '#166534', B.hx - B.rx - 4, B.hy - 10, B.rx * 2 + 8, 6, 1);
  partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.lineTo(B.hx - 5, B.hy - 18); g.lineTo(B.hx + 6, B.hy - 18); g.lineTo(B.hx + 8, B.hy - 8); g.closePath(); }, '#15803D', B.hx - 7, B.hy - 18, 15, 10, 1);
  px(g, B.hx - 1, B.hy - 18, 2, 3, '#14532D'); px(g, B.hx - 5, B.hy - 17, 3, 1, '#22C55E');
  px(g, B.hx - 7, B.hy - 10, 15, 2, '#B91C1C'); for (let x = -7; x < 8; x += 2) px(g, B.hx + x, B.hy - 10, 1, 1, '#F87171');
  px(g, B.hx + 3, B.hy - 11, 3, 3, '#D6D3D1'); px(g, B.hx + 3, B.hy - 11, 1, 1, '#FFFFFF');
  limb(g, B.hx - 6, B.hy - 12, B.hx - 14, B.hy - 26, 2, '#F5F5F4'); px(g, B.hx - 13, B.hy - 25, 1, 4, '#78716C');
};
const legsOf = (s: number) => (lookOf(s).woman ? lookOf(s).skin : '#78350F');

const TUBA_COSTUME: Costume = {
  id: 'tuba', top: '#F8FAFC', legs: legsOf, shoe: 'shoe', shoeCol: '#3F2A14', sleeveLen: 0.6,
  over: (g, B, F) => trachten(g, B, F.seed),
  hat: (g, B) => alpineHat(g, B), hairToo: true,
  // (the tuba: its coils in front of the body, the big bell up over the shoulder, pointed at him when it blows)
  back: (g, B, F) => {
    const up = F.pose === 'tell' || F.pose === 'strike';
    const bx = up ? B.w / 2 + 8 : B.w / 2 - 2, by = B.shY - (up ? 12 : 18);
    part(g, () => { g.moveTo(bx - 6, by + 4); g.lineTo(bx + 18, by - 12); g.lineTo(bx + 22, by + 14); g.lineTo(bx + 2, by + 14); g.closePath(); }, '#EAB308', bx - 6, by - 12, 28, 26, 1.2);
    px(g, bx + 17, by - 10, 3, 22, '#FEF08A'); px(g, bx + 21, by - 6, 1, 18, '#A16207');
    ball(g, bx + 18, by + 1, 5, '#1C1917', 0.5); px(g, bx + 15, by - 2, 2, 2, '#57534E');
  },
  hands: (B) => [[-B.w / 2 + 4, B.shY + 18], [B.w / 2 - 2, B.shY + 14]],
  hold: (g, B) => {
    // (the coils in front of him: brass in steps round a dark middle, a glint; the three valves and their caps; the mouthpiece)
    ball(g, 2, B.shY + 18, 11, '#EAB308', 1.2); ball(g, 2, B.shY + 18, 5, '#CA8A04', 0.6); px(g, -6, B.shY + 10, 3, 2, '#FEF9C3');
    for (let k = 0; k < 3; k++) { px(g, -3 + k * 3, B.shY + 9, 2, 7, INK); px(g, -3 + k * 3, B.shY + 10, 1, 5, '#FDE68A'); px(g, -4 + k * 3, B.shY + 8, 3, 1, '#A16207'); }
    px(g, -3, B.shY + 4, 3, 8, '#CA8A04'); px(g, -4, B.shY + 3, 5, 2, '#A8A29E');
  },
  mouth: 'o',
};

/** A stein (its top-left at x, y): glass in steps over the beer, the glint, its handle, the foam heaped and spilling. */
const stein = (g: G, x: number, y: number) => {
  px(g, x - 1, y - 1, 8, 13, INK); px(g, x, y, 6, 11, '#F59E0B'); px(g, x, y + 3, 2, 8, '#FCD34D'); px(g, x + 4, y + 3, 2, 8, '#B45309');
  px(g, x + 1, y + 4, 1, 5, '#FFFBEB'); px(g, x, y + 10, 6, 1, '#D97706');
  px(g, x + 6, y + 3, 3, 6, INK); px(g, x + 6, y + 4, 2, 4, '#E0F2FE');
  px(g, x - 1, y - 2, 8, 4, '#FFFFFF'); px(g, x, y - 3, 5, 2, '#FFFFFF'); px(g, x + 4, y + 1, 1, 3, '#FFFFFF'); px(g, x, y + 1, 6, 1, '#E5E7EB');
};

const BARMAID_COSTUME: Costume = {
  id: 'barmaid', top: '#F8FAFC', legs: s => (lookOf(s).woman ? lookOf(s).skin : '#1C1917'), shoe: 'shoe', shoeCol: '#1C1917', sleeveLen: 0.5,
  over: (g, B, F) => { if (lookOf(F.seed).woman) trachten(g, B, F.seed); else { px(g, -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY, '#1C1917'); px(g, -1, B.shY + 2, 2, B.hipY - B.shY, '#F8FAFC'); } },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 14], [-B.w / 2 - 6, B.shY - 14]] : [[-B.w / 2 - 6, B.shY + 12], [B.w / 2 + 8, B.shY + 8]]),
  // (steins: a fistful in each hand, foam on top)
  hold: (g, B, F, x, y) => { for (let k = 0; k < (F.pose === 'tell' ? 1 : 3); k++) stein(g, x - 6 + k * 7, y - 10 - (k % 2) * 2); },
  holdFar: (g, B, F, x, y) => { for (let k = 0; k < 2; k++) stein(g, x - 4 + k * 7, y - 10); },
  eyes: 'smug', mouth: 'grin',
};

const SLAPPER_COSTUME: Costume = {
  id: 'slapper', top: s => pick(s, 2, ['#F8FAFC', '#FECACA', '#DBEAFE']), legs: '#78350F', shoe: 'boot', shoeCol: '#3F2A14', sleeveLen: 0.55, bareBelow: true,
  // (the lederhosen's suspenders, whoever's in them: the man's cut, every time)
  over: (g, B, F) => { suspenders(g, B); void F; },
  hat: (g, B) => alpineHat(g, B), hairToo: true,
  // (the slaps: hands everywhere, a different place every few frames)
  hands: (B, F) => {
    if (F.pose === 'strike') { const k = F.fr % 3; return k === 0 ? [[-B.w / 2, B.hipY + 6], [B.w / 2 + 16, B.shY + 2]] : k === 1 ? [[B.w / 2 + 14, B.shY - 4], [B.w / 2 + 4, B.hipY + 10]] : [[-B.w / 2 - 6, B.hipY + 4], [B.w / 2 + 18, B.shY - 8]]; }
    if (F.pose === 'tell') return [[-B.w / 2 - 8, B.shY - 10], [B.w / 2 + 6, B.shY - 14]];
    return null;
  },
  eyes: 'wide', mouth: 'grin',
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_tuba', costume: TUBA_COSTUME, stats: { w: 40, h: 72, hp: 130, contact: 6, mass: 230 },
  voice: V.tuba, pool: TUBA, speed: 0.8, range: [160, 460], tell: 32, after: 26, cooldown: 90,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'tuba', 3),
});

castKind({
  kind: 'm2:fl_barmaid', costume: BARMAID_COSTUME, stats: { w: 36, h: 70, hp: 95, contact: 5, mass: 170 },
  voice: V.barmaid, pool: BARMAID, speed: 1.2, range: [180, 440], reachY: 280, tell: 22, after: 18, cooldown: 70,
  strike: (ctx, e) => { const t = leadOf(ctx.state, 36); lob(ctx.state, e, 'stein', t.x, t.y, 36); },
});

/** The slap flurry: a slap every few frames, a little shuffle in. */
const slaps = (ctx: FrameContext, e: Enemy) => {
  e.vel.x = (e.facing ?? 1) * 0.8;
  if (e.aiTimer % 6 === 2) { playSound('punch', 0.5, 10); meleeHit(ctx, e, 62, 4, 'm2:fl_slapper', 4, 50); }
};
castKind({
  kind: 'm2:fl_slapper', costume: SLAPPER_COSTUME, stats: { w: 36, h: 72, hp: 110, contact: 6, mass: 180 },
  voice: V.slapper, pool: SLAPPER, speed: 1.7, range: [24, 70], tell: 14, strikeFor: 30, after: 30, cooldown: 40,
  strike: () => playSound('whoosh', 0.5, 10), striking: slaps,
});
