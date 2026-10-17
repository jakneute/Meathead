// Mexico's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   mariachi   a charro suit (black, silver buttons down the legs), the big hat, a trumpet: at range he raises it (the
//              tell) and BLASTS: rings of sound down the promenade (shots.ts 'note'), shoving him back
//   sombrero   a souvenir-shop sombrero thrower in a serape over a polo and jeans: lobs spinning sombreros that land and
//              ROLL along the ground at him on their brims (jump them; they bounce off walls)
//   pinata     a party host BLINDFOLDED with a pinata stick: staggers about wherever, swinging at anything (him, and the
//              rest of the cast: it hurts them too)
//   luchador   a masked wrestler (a luchadora in a leotard, or him bare-chested in tights): the GRAPPLER, closes in,
//              crouches (the tell) and lunges; catching him, it's a suplex (thrown back over its head, slammed, a beat
//              dazed). Heavy.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { lookOf } from '../../adventure/temple/people';
import { castKind, setState, womanOf, seedOf, leadOf, meleeHit, byPants, type Costume, type Body, type Ctx, INK, dk, lt, px, part, partTop, ball, limb } from '../cast';
import { shootFlat, lob } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, MARIACHI, SOMBRERO, PINATA, LUCHADOR } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

/** A sombrero: the wide brim (seen edge-on, a lens), the tall crown, a band. */
const sombreroHat = (g: Ctx, B: Body, crown: string, brim: string, band: string, w = 22, trim?: string) => {
  const y = B.hy - 7;
  part(g, () => g.ellipse(B.hx, y, w, 4.5, 0, 0, Math.PI * 2), brim, B.hx - w, y - 4.5, w * 2, 9, 1.2);
  // (the brim's turned-up edge, stitched; its underside's shadow)
  px(g, B.hx - w + 2, y + 2, w * 2 - 4, 1, dk(brim, 0.35));
  for (let k = -w + 4; k < w - 3; k += 3) px(g, B.hx + k, y - 2 + Math.abs(k) * 0.08, 1, 1, trim ?? lt(brim, 0.45));
  partTop(g, () => { g.moveTo(B.hx - 8, y); g.quadraticCurveTo(B.hx - 9, y - 16, B.hx, y - 17); g.quadraticCurveTo(B.hx + 9, y - 16, B.hx + 8, y); g.closePath(); }, crown, B.hx - 9, y - 17, 18, 17, 1.2);
  // (the band round the crown, its studs or stitching)
  px(g, B.hx - 8, y - 5, 16, 3, dk(band, 0.2)); px(g, B.hx - 8, y - 5, 16, 1, lt(band, 0.3));
  for (let k = -6; k <= 6; k += 4) px(g, B.hx + k, y - 4, 1, 1, trim ?? lt(band, 0.5));
  // (a dent in the crown's top, lit)
  px(g, B.hx - 3, y - 15, 6, 1, dk(crown, 0.3)); px(g, B.hx - 4, y - 14, 2, 1, lt(crown, 0.35));
};
const trumpet = (g: Ctx, x: number, y: number, up: boolean) => {
  const a = up ? -0.15 : 0.5;
  g.save(); g.translate(x, y); g.rotate(a);
  px(g, -2, -2, 18, 4, INK); px(g, -1, -1, 16, 2, '#EAB308'); px(g, -1, -1, 16, 1, '#FEF08A');
  part(g, () => { g.moveTo(14, -2); g.lineTo(22, -6); g.lineTo(22, 6); g.lineTo(14, 2); g.closePath(); }, '#EAB308', 14, -6, 8, 12, 1);
  px(g, 4, -5, 2, 3, '#CA8A04'); px(g, 8, -5, 2, 3, '#CA8A04');
  g.restore();
};

const MARIACHI_COSTUME: Costume = {
  id: 'mariachi', top: s => pick(s, 2, ['#1C1917', '#1C1917', '#7F1D1D', '#F5F5F4']), legs: s => pick(s, 2, ['#1C1917', '#1C1917', '#7F1D1D', '#F5F5F4']),
  shoe: 'boot', shoeCol: '#1C1917',
  over: (g, B, F) => {
    // (the short charro jacket: its hem across the waist, the shirt's white front, silver embroidery scrolling up its
    // fronts, a big bow tie, silver buttons (each lit, a glint) down the jacket and the trouser seams)
    const suit = pick(F.seed, 2, ['#1C1917', '#1C1917', '#7F1D1D', '#F5F5F4']), silver = suit === '#F5F5F4' ? '#A16207' : '#D6D3D1';
    px(g, -B.w / 2, B.hipY - 8, B.w, 2, dk(suit, 0.35));
    px(g, B.hx - 3, B.shY + 2, 6, B.hipY - B.shY - 10, '#F5F5F4'); px(g, B.hx - 3, B.shY + 2, 1, B.hipY - B.shY - 10, '#FFFFFF');
    for (let k = 0; k < 5; k++) { px(g, -B.w / 2 + 2 + (k % 2), B.shY + 4 + k * 4, 2, 1, silver); px(g, B.w / 2 - 4 - (k % 2), B.shY + 4 + k * 4, 2, 1, silver); }
    for (let k = 0; k < 4; k++) { px(g, -B.w / 2 + 3, B.shY + 4 + k * 5, 2, 2, dk(silver, 0.3)); px(g, -B.w / 2 + 3, B.shY + 4 + k * 5, 1, 1, '#FFFFFF'); }
    part(g, () => { g.moveTo(B.hx - 5, B.shY); g.lineTo(B.hx + 7, B.shY); g.lineTo(B.hx + 1, B.shY + 7); g.closePath(); }, '#DC2626', B.hx - 5, B.shY, 12, 7, 0.8);
    ball(g, B.hx + 1, B.shY + 2, 1.6, '#B91C1C', 0.5);
    for (let k = 0; k < 5; k++) { px(g, -B.hipW * 0.22 + 4, B.hipY + 6 + k * 6, 2, 2, dk(silver, 0.3)); px(g, -B.hipW * 0.22 + 4, B.hipY + 6 + k * 6, 1, 1, '#FFFFFF'); }
  },
  hat: (g, B, F) => sombreroHat(g, B, pick(F.seed, 2, ['#1C1917', '#1C1917', '#7F1D1D', '#F5F5F4']), pick(F.seed, 2, ['#292524', '#292524', '#991B1B', '#E7E5E4']), '#D6D3D1', 18, '#E5E7EB'),
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[B.hx + 4, B.hy + 10], [B.hx + 10, B.hy + 6]] : null),
  hold: (g, B, F, x, y) => trumpet(g, x - 2, y, F.pose === 'tell' || F.pose === 'strike'),
  mouth: 'o',
};

const SERAPE = ['#DC2626', '#F59E0B', '#16A34A', '#2563EB', '#DB2777'];
const SOMBRERO_COSTUME: Costume = {
  id: 'sombrero', top: s => pick(s, 3, ['#F8FAFC', '#1E3A8A', '#B91C1C', '#57534E']), legs: '#1E40AF', shoe: 'sneaker', shoeCol: '#F5F5F4',
  over: (g, B, F) => {
    // (the serape: a striped blanket over the shoulder, across the chest)
    const c0 = pick(F.seed, 1, SERAPE);
    part(g, () => { g.moveTo(-B.w / 2 - 1, B.shY); g.lineTo(B.w / 2 + 1, B.shY); g.lineTo(B.w / 2 + 2, B.shY + 18); g.lineTo(-B.w / 2 - 2, B.shY + 26); g.closePath(); }, c0, -B.w / 2 - 2, B.shY, B.w + 4, 26, 1);
    // (its woven stripes, each lit along its top, a zigzag in the middle one; the fringe off its hem)
    for (let k = 0; k < 4; k++) { const sc = SERAPE[(SERAPE.indexOf(c0) + k + 1) % SERAPE.length], yy = B.shY + 4 + k * 5; px(g, -B.w / 2, yy, B.w, 1.5, sc); px(g, -B.w / 2, yy, B.w, 0.6, lt(sc, 0.4)); }
    for (let x = -B.w / 2 + 1; x < B.w / 2 - 1; x += 3) px(g, x, B.shY + 12 + ((x / 3) & 1), 1, 1, '#FFFFFF');
    for (let x = -B.w / 2 - 1; x < B.w / 2 + 2; x += 2) { const t = (x + B.w / 2) / B.w, yy = B.shY + 26 - t * 8; px(g, x, yy, 1, 3 + ((x & 2) ? 1 : 0), dk(c0, 0.2)); }
  },
  hat: (g, B, F) => sombreroHat(g, B, '#FDE68A', '#FCD34D', pick(F.seed, 4, SERAPE), 25, pick(F.seed, 2, SERAPE)),
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 8, B.shY - 14]] : null),
  // (a spare sombrero in hand, cocked back to throw)
  hold: (g, B, F, x, y) => { if (F.pose === 'tell') { part(g, () => g.ellipse(x, y, 13, 4, -0.6, 0, Math.PI * 2), '#FCD34D', x - 13, y - 6, 26, 12, 1); ball(g, x, y - 3, 5, '#FDE68A'); } },
  mouth: 'grin',
};

const PINATA_COSTUME: Costume = {
  id: 'pinata', top: s => pick(s, 1, ['#F472B6', '#A78BFA', '#34D399', '#FBBF24']), legs: '#57534E', shoe: 'sneaker', shoeCol: '#F5F5F4',
  // (a party shirt: confetti dots in every color, a lanyard with a whistle)
  over: (g, B) => {
    for (let k = 0; k < 8; k++) px(g, -B.w / 2 + 2 + ((k * 5) % (B.w - 4)), B.shY + 4 + ((k * 7) % 22), 2, 2, ['#FFFFFF', '#FDE047', '#38BDF8', '#F472B6'][k % 4]);
    px(g, B.hx - 4, B.shY + 1, 1, 10, '#1E3A8A'); px(g, B.hx + 3, B.shY + 1, 1, 10, '#1E3A8A'); px(g, B.hx - 2, B.shY + 10, 4, 3, '#A1A1AA'); px(g, B.hx - 2, B.shY + 10, 2, 1, '#F4F4F5');
  },
  // (the party hat, cocked: striped, its pom-pom, the elastic under the chin)
  hat: (g, B) => {
    part(g, () => { g.moveTo(B.hx - 5, B.hy - 8); g.lineTo(B.hx + 3, B.hy - 26); g.lineTo(B.hx + 8, B.hy - 7); g.closePath(); }, '#F59E0B', B.hx - 5, B.hy - 26, 13, 19, 1);
    for (let k = 0; k < 3; k++) { const t = 0.3 + k * 0.22; px(g, B.hx - 5 + t * 8 - 1, B.hy - 8 - t * 18, 13 - t * 10, 2, '#EC4899'); }
    ball(g, B.hx + 3, B.hy - 27, 3, '#38BDF8', 0.8);
    px(g, B.hx + 7, B.hy - 6, 1, 12, '#E5E7EB');
  },
  hairToo: true,
  // (the blindfold: a bandana round the eyes)
  face: (g, B) => { px(g, B.hx - 9, B.hy - 4, 19, 5, INK); px(g, B.hx - 8, B.hy - 3, 17, 3, '#DC2626'); px(g, B.hx - 12, B.hy - 2, 4, 6, '#DC2626'); },
  hands: (B, F) => (F.pose === 'strike' ? [[B.w / 2 + 2, B.shY + 4], [B.w / 2 + 10, B.shY + 2]] : F.pose === 'tell' ? [[-B.w / 2 + 2, B.shY - 12], [-B.w / 2 + 6, B.shY - 16]] : [[-B.w / 2 - 6, B.shY + 4], [B.w / 2 + 8, B.shY + 2]]),
  hold: (g, B, F, x, y) => {
    // (the pinata stick: up behind for the swing, out level in it, out feeling about otherwise)
    const a = F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? -0.1 : -0.6 + Math.sin(F.fr) * 0.3;
    limb(g, x, y, x + Math.cos(a) * 34, y + Math.sin(a) * 34, 4, '#D6A15E');
  },
  mouth: 'teeth',
};

const MASKS = ['#2563EB', '#DC2626', '#16A34A', '#9333EA', '#F59E0B'];
const LUCHADOR_COSTUME: Costume = {
  id: 'luchador',
  // (bare-chested in tights, him; a leotard, her)
  top: s => (lookOf(s).woman ? pick(s, 5, MASKS) : lookOf(s).skin), sleeve: s => lookOf(s).skin,
  legs: s => pick(s, 5, MASKS), shoe: 'boot', shoeCol: '#F5F5F4',
  over: (g, B, F) => { const m = pick(F.seed, 5, MASKS); px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 4, lt(m, 0.3)); px(g, -3, B.hipY - 3, 6, 6, '#FCD34D'); },
  // (the mask: over the whole head, the eye and mouth holes trimmed, a flame up the middle)
  face: (g, B, F) => {
    const m = pick(F.seed, 5, MASKS);
    part(g, () => g.ellipse(B.hx, B.hy - 1, B.rx + 0.6, B.ry + 0.6, 0, 0, Math.PI * 2), m, B.hx - B.rx, B.hy - B.ry, B.rx * 2, B.ry * 2, 1.2);
    const trim = pick(F.seed, 3, ['#F8FAFC', '#FCD34D', '#F8FAFC']);
    for (const ex of [B.hx + 0.5, B.hx + 6]) {
      // (the eye holes trimmed in a flame shape, the eye in them)
      px(g, ex - 3, B.hy - 4, 7, 6, INK); px(g, ex - 2, B.hy - 3, 5, 4, trim); px(g, ex - 2, B.hy - 5, 2, 2, trim);
      px(g, ex - 1, B.hy - 2, 3, 2, F.md === 'dead' ? INK : '#F5F5F4'); px(g, ex, B.hy - 2, 1, 2, F.md === 'dead' ? INK : '#1C1917');
    }
    px(g, B.hx, B.hy + 3, 9, 5, INK); px(g, B.hx + 1, B.hy + 4, 7, 3, trim); px(g, B.hx + 2, B.hy + 5, 5, 1, INK);
    // (the flame up the middle, lit; the laces at the back)
    part(g, () => { g.moveTo(B.hx - 2, B.hy - 4); g.lineTo(B.hx - 3, B.hy - B.ry - 1); g.lineTo(B.hx, B.hy - B.ry + 3); g.lineTo(B.hx + 2, B.hy - B.ry - 2); g.lineTo(B.hx + 2, B.hy - 4); g.closePath(); }, '#FCD34D', B.hx - 3, B.hy - B.ry - 2, 5, B.ry - 2, 0.6);
    for (let k = 0; k < 3; k++) px(g, B.hx - B.rx + 1, B.hy - 3 + k * 3, 2, 1, trim);
    px(g, B.hx - B.rx * 0.5, B.hy - B.ry + 2, 2, 2, lt(m, 0.45));
  },
  hat: () => {},
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 + 6, B.shY + 10], [B.w / 2 + 8, B.shY + 10]] : F.pose === 'strike' ? [[B.w / 2 + 8, B.shY + 2], [B.w / 2 + 16, B.shY + 6]] : null),
  eyes: 'angry', mouth: 'teeth',
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_mariachi', costume: MARIACHI_COSTUME, stats: { w: 36, h: 72, hp: 100, contact: 5, mass: 180 },
  voice: V.mariachi, pool: MARIACHI, speed: 1.1, range: [170, 430], tell: 28, after: 22, cooldown: 70,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'note', 4.2),
});

castKind({
  kind: 'm2:fl_sombrero', costume: SOMBRERO_COSTUME, stats: { w: 36, h: 72, hp: 90, contact: 5, mass: 170 },
  voice: V.sombrero, pool: SOMBRERO, speed: 1.2, range: [200, 470], reachY: 260, tell: 24, after: 18, cooldown: 85,
  strike: (ctx, e) => { const t = leadOf(ctx.state, 40); lob(ctx.state, e, 'sombrero', t.x, t.y, 40); },
});

/** The pinata host: blindfolded, its own way about (no range kept): staggers, lurching now this way, now that, a bit
 *  more often his way if he's near (it hears him), and swings every so often at whatever's in front of it. */
const pinataOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  const near = Math.abs(dx) < 500 && Math.abs(p.y - m.y) < 200 && pl.health > 0;
  if (e.aiState === 'tell') { e.vel.x = 0; if (e.aiTimer >= 18) { setState(e, 'strike'); playSound('whoosh', 0.6, 2); } return true; }
  if (e.aiState === 'strike') {
    e.vel.x = 0;
    if (e.aiTimer === 2) {
      meleeHit(ctx, e, 74, 10, 'm2:fl_pinata', 9);
      // (and anybody else stood there: it can't see who it's hitting)
      for (const o of hazardVictims(state)) if (o !== e && Math.abs(mid(o).y - m.y) < 60 && (mid(o).x - m.x) * (e.facing ?? 1) > 0 && Math.abs(mid(o).x - m.x) < 74) hazardHit(ctx, o, 30, m.x, 'WHACK!', { color: '#F472B6' });
    }
    if (e.aiTimer >= 12) setState(e, 'stagger');
    return true;
  }
  // (staggering about)
  if (e.aiState !== 'stagger') setState(e, 'stagger');
  if (e.aiTimer % 50 === 1) {
    const toward = near && Math.random() < 0.65 ? Math.sign(dx) : Math.random() < 0.5 ? -1 : 1;
    e.facing = (toward || 1) as 1 | -1;
    if (near && Math.random() < 0.35) bark(state, e, womanOf(e) ? V.pinata.f : V.pinata.m, byPants(state, PINATA), 0.5);
  }
  const ok = safeAhead(ctx, e, e.facing ?? 1);
  e.vel.x = ok ? (e.facing ?? 1) * (0.6 + 0.6 * Math.abs(Math.sin(e.aiTimer * 0.07))) : 0;
  if (!ok && e.aiTimer % 50 > 10) e.facing = (-(e.facing ?? 1)) as 1 | -1;
  if (e.aiTimer % 50 === 40 && (near || Math.random() < 0.3)) setState(e, 'tell');
  return true;
};
castKind({
  kind: 'm2:fl_pinata', costume: PINATA_COSTUME, stats: { w: 36, h: 72, hp: 80, contact: 6, mass: 170 },
  voice: V.pinata, pool: PINATA, speed: 1, range: [0, 80], tell: 18, after: 10, cooldown: 30,
  strike: () => {}, own: pinataOwn, pathing: false,
  poseFor: e => (e.aiState === 'stagger' ? 'walk' : null),
});

/** The luchador's lunge: on him, the suplex (back over its head, slammed, dazed). */
const luchadorLunge = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  const ok = safeAhead(ctx, e, e.facing ?? 1, 30);
  e.vel.x = ok && e.aiTimer < 20 ? (e.facing ?? 1) * 7.5 : 0;
  if (e.aiTimer < 22 && Math.abs(p.x - m.x) < 40 && Math.abs(p.y - m.y) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried && !pl.inCutscene) {
    // (grabbed round the middle and thrown back over: he lands behind it)
    hurtPlayer(ctx, 15, 'm2:fl_luchador', { x: -(e.facing ?? 1) * 9, y: -13 }, 34);
    state.playerStunTimer = Math.max(state.playerStunTimer, 30);
    shakeScreen(state, 8, 5); playSound('slam', 0.9, -4);
    e.aiTimer = 30;
  }
};
castKind({
  kind: 'm2:fl_luchador', costume: LUCHADOR_COSTUME, stats: { w: 42, h: 78, hp: 170, contact: 7, mass: 240 },
  head: { x: 1, y: -70, r: 10 },
  voice: V.luchador, pool: LUCHADOR, speed: 1.5, range: [60, 230], tell: 22, strikeFor: 30, after: 34, cooldown: 60,
  strike: () => { playSound('whoosh', 0.7, -2); }, striking: luchadorLunge,
});

void seedOf; void dk;
