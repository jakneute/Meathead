// Norway's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   viking        a "viking": a burlap tunic, a fur vest off a craft store, the HORNED helmet (they never had horns;
//                 nobody here cares) with a yarn beard on everybody, women too. Lobs throwing axes end over end. The
//                 horns are real enough: dive kicking down onto one hurts (KindDef.spiky).
//   shieldviking  a shield wall of one: a big round party-store shield held up in front (shots and hits off it from the
//                 front), slow to turn round (get behind it); close in, it drops the shield and BASHES
//   lutefisk      the lutefisk sampler lady (always a lady): a bunad vest and apron, a braided blonde wig, a tray of
//                 quivering fish jelly. Lobs samples at him (a glob: he gags, a moment stuck); close, the tray to the face

import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { castKind, leadOf, meleeHit, type Costume, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { lob } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, VIKING, SHIELD, LUTEFISK } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

const TUNIC = ['#8B6B4A', '#6B4F35', '#7C2D12', '#4B5563'];
const BEARD = ['#EA580C', '#FCD34D', '#78350F', '#F8FAFC'];

/** The horned helmet: a gray dome, a nose guard, two white horns curling up (and the yarn beard under it). */
const hornHelmet = (g: CanvasRenderingContext2D, B: { hx: number; hy: number; rx: number; ry: number }, seed: number) => {
  partTop(g, () => { g.moveTo(B.hx - B.rx - 1, B.hy - 2); g.quadraticCurveTo(B.hx, B.hy - B.ry - 9, B.hx + B.rx + 1, B.hy - 2); g.closePath(); }, '#9CA3AF', B.hx - B.rx - 1, B.hy - B.ry - 6, B.rx * 2 + 2, B.ry + 4, 1.2);
  px(g, B.hx - B.rx - 1, B.hy - 4, B.rx * 2 + 2, 2, '#6B7280');
  px(g, B.hx + 4, B.hy - 4, 2, 6, '#6B7280');
  for (const s of [-1, 1]) part(g, () => { g.moveTo(B.hx + s * (B.rx - 2), B.hy - 6); g.quadraticCurveTo(B.hx + s * (B.rx + 9), B.hy - 9, B.hx + s * (B.rx + 7), B.hy - 22); g.lineTo(B.hx + s * (B.rx + 3), B.hy - 9); g.closePath(); }, '#F5F5F4', B.hx - B.rx - 10, B.hy - 22, B.rx * 2 + 20, 16, 1);
  // (the yarn beard: hooked over the ears, everybody gets one)
  const col = pick(seed, 3, BEARD);
  part(g, () => { g.moveTo(B.hx - 2, B.hy + 2); g.lineTo(B.hx + B.rx + 1, B.hy + 2); g.lineTo(B.hx + 6, B.hy + 16); g.lineTo(B.hx + 1, B.hy + 12); g.closePath(); }, col, B.hx - 2, B.hy + 2, B.rx + 3, 14, 1);
  px(g, B.hx + 2, B.hy + 5, 5, 1, dk(col, 0.3));
};
const furVest = (g: CanvasRenderingContext2D, B: { w: number; shY: number; hipY: number }) => {
  for (const s of [-1, 1]) px(g, s < 0 ? -B.w / 2 - 1 : B.w / 2 - 7, B.shY, 8, B.hipY - B.shY - 6, '#D6C4A8');
  for (let k = 0; k < 5; k++) px(g, -B.w / 2 + (k % 2) * 2, B.shY + 3 + k * 4, 2, 1, '#A8977C');
  px(g, -B.w / 2, B.hipY - 4, B.w, 3, '#3F2A14');
};
const axe = (g: CanvasRenderingContext2D, x: number, y: number, up: boolean) => {
  const a = up ? -2.3 : -1.2;
  const ex = x + Math.cos(a) * 22, ey = y + Math.sin(a) * 22;
  limb(g, x, y, ex, ey, 3, '#92400E');
  g.save(); g.translate(ex, ey); g.rotate(a + Math.PI / 2);
  part(g, () => { g.moveTo(0, -2); g.lineTo(9, -6); g.lineTo(9, 6); g.lineTo(0, 3); g.closePath(); }, '#CBD5E1', 0, -6, 9, 12, 1);
  g.restore();
};

const VIKING_COSTUME: Costume = {
  id: 'viking', top: s => pick(s, 2, TUNIC), legs: s => pick(s, 4, ['#57534E', '#78716C', '#44403C']), shoe: 'boot', shoeCol: '#3F2A14', stripe: '#A8977C',
  over: (g, B) => furVest(g, B),
  hat: (g, B, F) => hornHelmet(g, B, F.seed), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 6, B.shY - 16]] : null),
  hold: (g, B, F, x, y) => { if (F.pose !== 'strike' && F.pose !== 'after') axe(g, x, y, F.pose === 'tell'); },
  mouth: 'teeth',
};

const SHIELDS = [['#DC2626', '#F8FAFC'], ['#1D4ED8', '#FCD34D'], ['#15803D', '#F8FAFC'], ['#7C2D12', '#FCD34D']];
const SHIELD_COSTUME: Costume = {
  id: 'shieldviking', top: s => pick(s, 5, TUNIC), legs: '#44403C', shoe: 'boot', shoeCol: '#3F2A14', stripe: '#A8977C',
  over: (g, B) => furVest(g, B),
  hat: (g, B, F) => hornHelmet(g, B, F.seed + 5), hairToo: true,
  hands: (B, F) => (F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 14, B.shY + 8]] : [[-B.w / 2, B.shY + 14], [B.w / 2 + 6, B.shY + 12]]),
  // (the round shield: up in front of the body, its boss and its quarters painted; out in the bash)
  hold: (g, B, F, x, y) => {
    const [a, b] = pick(F.seed, 2, SHIELDS), r = 17, sx = x + 2, sy = y - 4;
    ball(g, sx, sy, r, a, 1.4);
    part(g, () => { g.moveTo(sx, sy - r); g.lineTo(sx, sy + r); g.lineTo(sx - 2, sy + r); g.lineTo(sx - 2, sy - r); g.closePath(); }, b, sx - 2, sy - r, 2, r * 2, 0.5);
    px(g, sx - r + 2, sy - 1, r * 2 - 4, 2, b);
    ball(g, sx, sy, 4, '#D6D3D1');
    px(g, sx - r + 3, sy - r + 6, 3, 3, lt(a, 0.4));
  },
  eyes: 'angry', mouth: 'flat',
};

const LUTEFISK_COSTUME: Costume = {
  id: 'lutefisk', top: '#F8FAFC', legs: '#1E3A8A', shoe: 'shoe', shoeCol: '#1C1917',
  over: (g, B) => {
    // (the bunad: a red vest laced up, an embroidered panel, a white apron)
    px(g, -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY - 2, '#B91C1C');
    for (let k = 0; k < 4; k++) { px(g, -2, B.shY + 5 + k * 5, 4, 1, '#FCD34D'); px(g, -B.w / 2 + 2, B.shY + 4 + k * 5, 2, 2, '#15803D'); }
    px(g, -B.hipW / 2 + 2, B.hipY - 2, B.hipW - 4, 22, '#F5F5F4');
    px(g, -B.hipW / 2 + 2, B.hipY - 2, B.hipW - 4, 2, '#D6D3D1');
  },
  // (the braided blonde wig, the braids down over the shoulders, a little embroidered cap)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 3, B.rx + 1, B.ry - 1, 0, Math.PI, 0), '#FDE68A', B.hx - B.rx - 1, B.hy - B.ry - 3, B.rx * 2 + 2, B.ry, 1);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) ball(g, B.hx + s * (B.rx - 1), B.hy + 2 + k * 5, 2.6, '#FCD34D', 0.6);
    px(g, B.hx - 6, B.hy - B.ry - 2, 12, 4, '#B91C1C'); px(g, B.hx - 5, B.hy - B.ry - 1, 10, 1, '#FCD34D');
  },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 - 6, B.shY - 12]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 16, B.shY + 2]] : [[-B.w / 2, B.shY + 14], [B.w / 2 + 10, B.shY + 10]]),
  // (the sample tray: little cups of gray-white jelly, quivering)
  hold: (g, B, F, x, y) => {
    px(g, x - 12, y - 3, 26, 3, INK); px(g, x - 11, y - 3, 24, 2, '#D6D3D1');
    for (let k = 0; k < 4; k++) { const q = Math.sin(F.fr * 2 + k) > 0 ? 1 : 0; px(g, x - 10 + k * 6, y - 7 - q, 5, 4 + q, '#F5F0D8'); px(g, x - 10 + k * 6, y - 7 - q, 5, 1, '#FFFFFF'); }
  },
  eyes: 'open', mouth: 'smile',
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_viking', costume: VIKING_COSTUME, stats: { w: 38, h: 74, hp: 110, contact: 6, mass: 200 },
  head: { x: 1, y: -68, r: 10 },
  voice: V.viking, pool: VIKING, speed: 1.15, range: [180, 430], reachY: 280, tell: 26, after: 20, cooldown: 80,
  strike: (ctx, e) => { const t = leadOf(ctx.state, 42); lob(ctx.state, e, 'axe', t.x, t.y, 42); },
  spiky: { source: 'm2:fl_viking_horns', label: 'HORNS!' },
});

/** The bash: a step in behind the shield as it comes out. */
const bash = (ctx: FrameContext, e: Enemy) => {
  e.vel.x = e.aiTimer < 8 ? (e.facing ?? 1) * 3.2 : 0;
  if (e.aiTimer === 4) { if (meleeHit(ctx, e, 84, 11, 'm2:fl_shieldviking', 11)) playSound('clang', 0.8, -2); }
};
castKind({
  kind: 'm2:fl_shieldviking', costume: SHIELD_COSTUME, stats: { w: 42, h: 74, hp: 150, contact: 7, mass: 260 },
  head: { x: 1, y: -68, r: 10 },
  voice: V.shield, pool: SHIELD, speed: 0.9, range: [36, 86], tell: 20, strikeFor: 16, after: 34, cooldown: 50, turn: 45,
  shield: true, strike: () => playSound('whoosh', 0.6, -6), striking: bash,
});

castKind({
  kind: 'm2:fl_lutefisk', costume: LUTEFISK_COSTUME, woman: true, stats: { w: 36, h: 70, hp: 90, contact: 5, mass: 160 },
  voice: V.lutefisk, pool: LUTEFISK, speed: 1, range: [40, 360], reachY: 220, tell: 22, after: 22, cooldown: 70,
  strike: (ctx, e) => {
    const d = Math.abs(mid(ctx.state.player).x - mid(e).x);
    if (d < 90) { if (meleeHit(ctx, e, 80, 8, 'm2:fl_lutefisk', 8)) playSound('clang', 0.6, 6); }
    else { const t = leadOf(ctx.state, 38); lob(ctx.state, e, 'fish', t.x, t.y, 38); }
  },
});
