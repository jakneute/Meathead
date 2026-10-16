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
import { castKind, leadOf, meleeHit, womanOf, byPants, type Costume, INK, px, part, partTop, ball, limb } from '../cast';
import { lob } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, GUARD, HOOLIGAN, TEALADY, BOBBY } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const GUARD_COSTUME: Costume = {
  id: 'guard', top: '#B91C1C', legs: '#1C1917', shoe: 'boot', shoeCol: '#1C1917', stripe: '#DC2626',
  over: (g, B) => { for (let k = 0; k < 5; k++) px(g, B.lean - 1, B.shY + 3 + k * 5, 2, 2, '#FCD34D'); px(g, -B.w / 2, B.hipY - 5, B.w, 4, '#F8FAFC'); px(g, -B.w / 2, B.shY, B.w, 3, '#1E3A8A'); },
  // (the bearskin: tall, black, fuzzy, the chin strap)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 12, B.rx + 3, B.ry + 14, 0, Math.PI, 0), '#111827', B.hx - B.rx - 3, B.hy - B.ry - 26, B.rx * 2 + 6, B.ry + 14, 1.2);
    px(g, B.hx - B.rx - 3, B.hy - 12, B.rx * 2 + 6, 8, '#111827');
    for (let k = 0; k < 6; k++) px(g, B.hx - B.rx + k * 4, B.hy - B.ry - 18 + (k % 2) * 6, 2, 2, '#374151');
    px(g, B.hx + 5, B.hy - 4, 2, 12, '#CA8A04');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[B.w / 2 - 2, B.shY + 14], [B.w / 2 - 6, B.shY + 8]] : F.pose === 'strike' ? [[B.w / 2 + 6, B.shY + 12], [B.w / 2 + 18, B.shY + 10]] : [[-B.w / 2 - 2, -30], [B.w / 2 + 2, B.shY + 18]]),
  // (the rifle: shouldered upright at attention, level with the bayonet out in the thrust)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'tell' || F.pose === 'strike') { limb(g, x - 24, y + 2, x + 30, y - 2, 3, '#3F2A1C'); limb(g, x + 30, y - 2, x + 48, y - 3, 1.5, '#E5E7EB'); return; }
    limb(g, x + 2, y + 6, x + 4, y - 50, 3, '#3F2A1C'); limb(g, x + 4, y - 50, x + 5, y - 66, 1.5, '#E5E7EB');
  },
  eyes: 'open', mouth: 'flat',
};

const TEAMS = [['#DC2626', '#F8FAFC'], ['#1D4ED8', '#F8FAFC'], ['#F8FAFC', '#1E3A8A'], ['#FDE047', '#1C1917']];
const HOOLIGAN_COSTUME: Costume = {
  id: 'hooligan', top: s => pick(s, 2, TEAMS)[0], legs: '#1E3A8A', shoe: 'sneaker', shoeCol: '#F5F5F4', sleeveLen: 0.6,
  over: (g, B, F) => {
    const [a, b] = pick(F.seed, 2, TEAMS);
    px(g, -B.w / 2, B.shY + 1, B.w, 2, b); px(g, B.lean - 3, B.shY + 8, 6, 7, b); px(g, B.lean - 2, B.shY + 9, 4, 5, a);
    for (let k = 0; k < 4; k++) px(g, -B.w / 2 + k * 6, B.shY - 2, 6, 5, k % 2 ? b : a);
    px(g, B.w / 2 - 4, B.shY - 1, 5, 18, a); for (let k = 0; k < 3; k++) px(g, B.w / 2 - 4, B.shY + 2 + k * 6, 5, 2, b);
  },
  // (a red cross painted on the cheek)
  face: (g, B) => { px(g, B.hx + 2, B.hy + 1, 6, 6, '#F8FAFC'); px(g, B.hx + 4, B.hy + 1, 2, 6, '#DC2626'); px(g, B.hx + 2, B.hy + 3, 6, 2, '#DC2626'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 6, B.shY - 16]] : F.pose === 'strike' ? null : [[-B.w / 2 - 6, B.shY + 2], [B.w / 2 + 8, B.shY - 2]]),
  // (pints up, cheering, one cocked back to throw)
  hold: (g, B, F, x, y) => { if (F.pose === 'strike') return; px(g, x - 4, y - 12, 9, 12, INK); px(g, x - 3, y - 9, 7, 8, '#B45309'); px(g, x - 3, y - 11, 7, 2, '#FEF3C7'); },
  holdFar: (g, B, F, x, y) => { px(g, x - 4, y - 12, 9, 12, INK); px(g, x - 3, y - 9, 7, 8, '#B45309'); px(g, x - 3, y - 11, 7, 2, '#FEF3C7'); },
  eyes: 'angry', mouth: 'teeth',
};

const CARDIGANS = ['#F9A8D4', '#A5B4FC', '#86EFAC', '#FDE68A'];
const TEALADY_COSTUME: Costume = {
  id: 'tealady', top: s => pick(s, 2, CARDIGANS), legs: s => pick(s, 3, ['#57534E', '#78716C', '#7C2D12']), shoe: 'shoe', shoeCol: '#57534E',
  over: (g, B) => { for (let k = 0; k < 5; k++) ball(g, -4 + k * 2.4, B.shY + 3 + (k === 2 ? 2 : k % 2), 1.2, '#FFFFFF', 0); px(g, -B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, B.hipY - B.shY + 6, '#F8FAFC'); px(g, -B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, 2, '#FCA5A5'); },
  // (the curly gray wig)
  hat: (g, B) => { for (let k = 0; k < 7; k++) ball(g, B.hx - B.rx + 1 + k * 3, B.hy - B.ry + 1 + (k % 2) * 2, 3.4, '#D1D5DB', 0.6); ball(g, B.hx - B.rx, B.hy - 2, 3.4, '#D1D5DB', 0.6); },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 4, B.shY - 12]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 16, B.shY + 2]] : [[-B.w / 2, B.shY + 14], [B.w / 2 + 8, B.shY + 14]]),
  // (the teapot: china, a floral band, the spout)
  hold: (g, B, F, x, y) => {
    ball(g, x + 4, y + 2, 8, '#F8FAFC', 1); px(g, x - 2, y, 12, 2, '#3B82F6'); px(g, x + 1, y - 8, 6, 3, '#F8FAFC');
    limb(g, x + 11, y + 2, x + 17, y - 4, 2, '#F8FAFC');
    if (F.pose !== 'strike') { const w = Math.sin(F.fr * 0.4) * 2; px(g, x + 16 + w, y - 10, 2, 3, '#E5E7EB'); }
  },
  eyes: 'smug', mouth: 'smile',
};

const BOBBY_COSTUME: Costume = {
  id: 'bobby', top: '#1E293B', legs: '#1E293B', shoe: 'boot', shoeCol: '#0F172A',
  over: (g, B) => { for (let k = 0; k < 4; k++) px(g, B.lean - 1, B.shY + 4 + k * 6, 2, 2, '#CBD5E1'); px(g, -B.w / 2, B.hipY - 4, B.w, 3, '#0F172A'); limb(g, -2, B.shY + 4, -B.w / 2 + 4, B.shY + 14, 1, '#CBD5E1'); },
  // (the custodian helmet: a tall dome, the badge, a knob on top)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 6, B.rx + 1, B.ry + 7, 0, Math.PI, 0), '#1E293B', B.hx - B.rx - 1, B.hy - B.ry - 13, B.rx * 2 + 2, B.ry + 7, 1.2);
    px(g, B.hx - B.rx - 3, B.hy - 6, B.rx * 2 + 6, 2, '#0F172A');
    ball(g, B.hx + 3, B.hy - 12, 3, '#E5E7EB', 0.6); ball(g, B.hx, B.hy - B.ry - 14, 2, '#CBD5E1', 0.6);
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 2, B.shY + 12], [-B.w / 2 + 2, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 14, B.shY + 6]] : null),
  hold: (g, B, F, x, y) => { const a = F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? -0.2 : 1.4; limb(g, x, y, x + Math.cos(a) * 26, y + Math.sin(a) * 26, 3, '#1C1917'); },
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
