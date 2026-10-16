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
import { castKind, leadOf, meleeHit, type Costume, type Body, INK, px, part, partTop, ball, limb } from '../cast';
import { shootFlat, lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, TUBA, BARMAID, SLAPPER } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];
type G = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

/** Lederhosen's suspenders and bib (him), or a dirndl's bodice and apron (her). */
const trachten = (g: G, B: Body, seed: number) => {
  if (lookOf(seed).woman) {
    const body = pick(seed, 3, ['#15803D', '#B91C1C', '#1E3A8A']);
    px(g, -B.w / 2 + 1, B.shY + 6, B.w - 2, B.hipY - B.shY - 4, body);
    for (let k = 0; k < 4; k++) px(g, -2, B.shY + 8 + k * 4, 4, 1, '#F8FAFC');
    px(g, -B.hipW / 2 - 2, B.hipY, B.hipW + 4, 24, body);
    px(g, -B.hipW / 2 + 3, B.hipY, B.hipW - 6, 22, '#F5F5F4');
  } else {
    for (const s of [-1, 1]) px(g, s * 5 - 1, B.shY, 3, B.hipY - B.shY, '#57381E');
    px(g, -5, B.shY + 12, 12, 3, '#57381E');
    for (let k = 0; k < 3; k++) px(g, -3 + k * 3, B.shY + 13, 1, 1, '#FCD34D');
  }
};
/** The feathered alpine hat: green felt, a cord, a feather. */
const alpineHat = (g: G, B: Body) => {
  part(g, () => g.ellipse(B.hx, B.hy - 7, B.rx + 4, 3, 0, 0, Math.PI * 2), '#166534', B.hx - B.rx - 4, B.hy - 10, B.rx * 2 + 8, 6, 1);
  partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.lineTo(B.hx - 5, B.hy - 18); g.lineTo(B.hx + 6, B.hy - 18); g.lineTo(B.hx + 8, B.hy - 8); g.closePath(); }, '#15803D', B.hx - 7, B.hy - 18, 15, 10, 1);
  px(g, B.hx - 7, B.hy - 10, 15, 2, '#B91C1C');
  limb(g, B.hx - 6, B.hy - 12, B.hx - 14, B.hy - 26, 2, '#F5F5F4');
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
    ball(g, bx + 18, by + 1, 5, '#1C1917', 0.5);
  },
  hands: (B) => [[-B.w / 2 + 4, B.shY + 18], [B.w / 2 - 2, B.shY + 14]],
  hold: (g, B) => { ball(g, 2, B.shY + 18, 11, '#EAB308', 1.2); ball(g, 2, B.shY + 18, 5, '#CA8A04', 0.6); px(g, -3, B.shY + 4, 3, 8, '#CA8A04'); },
  mouth: 'o',
};

const BARMAID_COSTUME: Costume = {
  id: 'barmaid', top: '#F8FAFC', legs: s => (lookOf(s).woman ? lookOf(s).skin : '#1C1917'), shoe: 'shoe', shoeCol: '#1C1917', sleeveLen: 0.5,
  over: (g, B, F) => { if (lookOf(F.seed).woman) trachten(g, B, F.seed); else { px(g, -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY, '#1C1917'); px(g, -1, B.shY + 2, 2, B.hipY - B.shY, '#F8FAFC'); } },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 14], [-B.w / 2 - 6, B.shY - 14]] : [[-B.w / 2 - 6, B.shY + 12], [B.w / 2 + 8, B.shY + 8]]),
  // (steins: a fistful in each hand, foam on top)
  hold: (g, B, F, x, y) => { for (let k = 0; k < (F.pose === 'tell' ? 1 : 3); k++) { const sx = x - 6 + k * 7, sy = y - 10 - (k % 2) * 2; px(g, sx - 1, sy - 1, 8, 13, INK); px(g, sx, sy, 6, 11, '#F59E0B'); px(g, sx, sy, 6, 3, '#FFFFFF'); } },
  holdFar: (g, B, F, x, y) => { for (let k = 0; k < 2; k++) { const sx = x - 4 + k * 7, sy = y - 10; px(g, sx - 1, sy - 1, 8, 13, INK); px(g, sx, sy, 6, 11, '#F59E0B'); px(g, sx, sy, 6, 3, '#FFFFFF'); } },
  eyes: 'smug', mouth: 'grin',
};

const SLAPPER_COSTUME: Costume = {
  id: 'slapper', top: s => pick(s, 2, ['#F8FAFC', '#FECACA', '#DBEAFE']), legs: '#78350F', shoe: 'boot', shoeCol: '#3F2A14', sleeveLen: 0.55, bareBelow: true,
  over: (g, B, F) => { for (const s of [-1, 1]) px(g, s * 5 - 1, B.shY, 3, B.hipY - B.shY, '#57381E'); px(g, -5, B.shY + 12, 12, 3, '#57381E'); void F; },
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
