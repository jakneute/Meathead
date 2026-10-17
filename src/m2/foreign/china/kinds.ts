// China's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look):
//
//   kungfu     a "kung fu master" in a satin costume-shop suit (frog buttons, a sash, a headband): closes in, crouches
//              (the tell) and FLIES at him in a kick, shouting the move (the wrong move, from the wrong country)
//   fireworks  the pyrotechnics intern: a hi-vis vest over a silk jacket, a hard hat, a lighter and a box of rockets: at
//              range lights one and sends it up and over onto him (shots.ts 'rocket': its burst hurts the cast too)
//   dragon     the dragon dance: six kids under one long red-and-gold cloth, a head with felt teeth and googly eyes at
//              the front. The first one alive leads (dancing at him, a leap now and then); the rest follow its trail.
//              Kill a segment and the kid in it drops out (the cloth torn off); the next one back leads.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { mid, holdingOff } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { castKind, drawCast, womanOf, seedOf, meleeHit, setState, byPants, type Costume, INK, px, part, partTop, ball, limb, dk, lt } from '../cast';
import { reaction } from '../../spooky/costume';
import { launchRocket } from '../shots';
import { bark } from '../state';
import { registerHurts } from '../pavilion';
import { HURT, V, KUNGFU, MOVES, DRAGON, FIREWORKS } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costumes

const SATIN = ['#B91C1C', '#1C1917', '#CA8A04', '#1E3A8A', '#F8FAFC'];
const KUNGFU_COSTUME: Costume = {
  id: 'kungfu', top: s => pick(s, 2, SATIN), legs: s => (pick(s, 2, SATIN) === '#1C1917' ? '#B91C1C' : '#1C1917'), shoe: 'shoe', shoeCol: '#1C1917',
  over: (g, B, F) => {
    const col = pick(F.seed, 2, SATIN), trim = col === '#CA8A04' ? '#B91C1C' : '#FCD34D', h = B.hipY - B.shY;
    // (the satin's sheen: a lit streak down the near side, its glint, shade down the far side, a crease)
    px(g, -B.w / 2 + 2 + B.lean, B.shY + 4, 3, h - 8, lt(col, 0.3)); px(g, -B.w / 2 + 3 + B.lean, B.shY + 5, 1, h - 12, lt(col, 0.6));
    px(g, B.w / 2 - 4 + B.lean, B.shY + 4, 3, h - 8, dk(col, 0.22)); px(g, B.lean + 6, B.shY + 10, 1, h - 16, dk(col, 0.15));
    // (the mandarin collar in the trim; frog buttons down the front: knotted cords, lit)
    px(g, B.lean - 5, B.shY - 1, 10, 3, trim); px(g, B.lean - 5, B.shY - 1, 10, 1, lt(trim, 0.45)); px(g, B.lean - 5, B.shY + 1, 10, 1, dk(trim, 0.3));
    for (let k = 0; k < 4; k++) { const y = B.shY + 4 + k * 5; px(g, B.lean - 3, y, 7, 2, INK); px(g, B.lean - 2, y, 5, 1, trim); px(g, B.lean - 3, y + 1, 1, 1, lt(trim, 0.5)); px(g, B.lean + 3, y + 1, 1, 1, dk(trim, 0.3)); }
    // (a gold dragon embroidered on the chest: a coil of stitches)
    if (pick(F.seed, 5, [0, 1]) === 1) for (let k = 0; k < 5; k++) px(g, B.lean - B.w / 2 + 4 + k * 2, B.shY + 8 + Math.round(Math.sin(k * 1.4) * 2), 2, 1, k % 2 ? '#FCD34D' : '#F59E0B');
    // (the sash: wrapped round, knotted at the hip, its tails hanging and shaded)
    px(g, -B.w / 2, B.hipY - 5, B.w, 4, trim); px(g, -B.w / 2, B.hipY - 5, B.w, 1, lt(trim, 0.4)); px(g, -B.w / 2, B.hipY - 2, B.w, 1, dk(trim, 0.3));
    ball(g, -B.w / 2 + 1, B.hipY - 3, 2.5, trim, 0.5);
    px(g, -B.w / 2 - 3, B.hipY - 1, 4, 12, trim); px(g, -B.w / 2 - 3, B.hipY - 1, 1, 12, lt(trim, 0.4)); px(g, -B.w / 2, B.hipY - 1, 1, 12, dk(trim, 0.3));
    px(g, -B.w / 2 - 1, B.hipY - 1, 3, 9, trim); px(g, -B.w / 2 - 3, B.hipY + 10, 4, 2, dk(trim, 0.2));
  },
  // (the headband: a red band lit along its top, the knot at the back, its tails flying)
  hat: (g, B) => {
    px(g, B.hx - B.rx, B.hy - 6, B.rx * 2, 3, '#DC2626'); px(g, B.hx - B.rx, B.hy - 6, B.rx * 2, 1, '#F87171'); px(g, B.hx - B.rx, B.hy - 4, B.rx * 2, 1, '#991B1B');
    ball(g, B.hx - B.rx, B.hy - 5, 2, '#DC2626', 0.5);
    limb(g, B.hx - B.rx, B.hy - 5, B.hx - B.rx - 9, B.hy + 2, 2, '#DC2626'); limb(g, B.hx - B.rx, B.hy - 4, B.hx - B.rx - 7, B.hy + 6, 2, '#B91C1C');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[B.w / 2 + 4, B.shY + 4], [B.w / 2 + 12, B.shY - 6]] : F.pose === 'fly' ? [[-B.w / 2 - 10, B.shY - 4], [B.w / 2 + 8, B.shY - 10]] : null),
  eyes: 'angry', mouth: 'o',
};

const FIREWORKS_COSTUME: Costume = {
  id: 'fireworks', top: s => pick(s, 3, ['#B91C1C', '#1E3A8A', '#15803D']), legs: '#1E3A8A', shoe: 'sneaker', shoeCol: '#F5F5F4',
  // (the hi-vis vest over the silk: fluorescent panels in steps, the reflective bands, its zip; the silk's sheen between)
  over: (g, B, F) => {
    const silk = pick(F.seed, 3, ['#B91C1C', '#1E3A8A', '#15803D']), h = B.hipY - B.shY;
    px(g, -1, B.shY + 2, 3, h - 2, lt(silk, 0.3));
    for (const s2 of [-1, 1]) {
      const x = s2 < 0 ? -B.w / 2 : B.w / 2 - 8;
      px(g, x - 0.5, B.shY + 0.5, 9, h + 0.5, '#5A5A10'); px(g, x, B.shY + 1, 8, h, '#E4F03A'); px(g, x, B.shY + 1, 2, h, '#F6FF8A'); px(g, x + 6, B.shY + 1, 2, h, '#B8C420');
      for (const y of [B.shY + 12, B.shY + 20]) { px(g, x, y, 8, 2, '#D4D4D8'); px(g, x, y, 8, 1, '#FFFFFF'); }
    }
    px(g, -B.w / 2, B.hipY - 3, B.w, 3, '#B8C420');
  },
  // (a hard hat, lit across its crown, its brim; the lantern sticker; safety goggles pushed up on it)
  hat: (g, B) => {
    partTop(g, () => g.ellipse(B.hx, B.hy - 5, B.rx + 2, B.ry - 1, 0, Math.PI, 0), '#F59E0B', B.hx - B.rx - 2, B.hy - B.ry - 4, B.rx * 2 + 4, B.ry, 1.2);
    px(g, B.hx - 4, B.hy - B.ry - 2, 5, 2, '#FDE68A'); px(g, B.hx, B.hy - B.ry - 3, 1, B.ry - 2, '#D97706');
    px(g, B.hx - B.rx - 4, B.hy - 6, B.rx * 2 + 8, 2, '#D97706'); px(g, B.hx - B.rx - 4, B.hy - 6, B.rx * 2 + 8, 1, '#FBBF24');
    px(g, B.hx + 2, B.hy - 11, 3, 3, '#DC2626'); px(g, B.hx + 2, B.hy - 11, 3, 1, '#FCD34D');
    px(g, B.hx - B.rx, B.hy - 9, B.rx * 2 - 4, 2, '#27272A'); px(g, B.hx - B.rx + 1, B.hy - 9, 4, 2, '#7DD3FC'); px(g, B.hx - 1, B.hy - 9, 4, 2, '#7DD3FC');
  },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[B.w / 2 - 2, B.shY + 10], [B.w / 2 + 10, B.shY - 4]] : null),
  // (the lighter, lit in the tell (a stepped flame); the box of rockets under the far arm, its sticks and fuses)
  hold: (g, B, F, x, y) => {
    px(g, x - 3, y - 5, 6, 8, INK); px(g, x - 2, y - 4, 4, 6, '#DC2626'); px(g, x - 2, y - 4, 1, 6, '#F87171'); px(g, x - 2, y - 5, 4, 1, '#A1A1AA');
    if (F.pose === 'tell') { px(g, x - 1, y - 10, 3, 5, '#F97316'); px(g, x - 1, y - 9, 2, 4, '#FDE047'); px(g, x, y - 12, 1, 2, '#FFFFFF'); }
  },
  holdFar: (g, B, F, x, y) => {
    px(g, x - 9, y - 8, 18, 12, INK); px(g, x - 8, y - 7, 16, 10, '#B91C1C'); px(g, x - 8, y - 7, 16, 1, '#EF4444'); px(g, x - 6, y - 4, 12, 3, '#FDE047'); px(g, x - 5, y - 3, 1, 1, '#B91C1C'); px(g, x - 2, y - 3, 1, 1, '#B91C1C'); px(g, x + 1, y - 3, 1, 1, '#B91C1C');
    for (let k = 0; k < 4; k++) { px(g, x - 7 + k * 4, y - 15, 3, 8, INK); px(g, x - 6 + k * 4, y - 14, 2, 7, k % 2 ? '#3B82F6' : '#FDE047'); px(g, x - 6 + k * 4, y - 16, 1, 2, '#16A34A'); }
  },
  eyes: 'wide', mouth: 'grin',
};

/** Who's under the dragon, knocked out of it: black tee and pants, a scrap of the cloth on their head. */
const DRAGON_KID: Costume = {
  id: 'dragonkid', top: '#1C1917', legs: '#1C1917', shoe: 'sneaker', shoeCol: '#F5F5F4',
  hat: (g, B) => part(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.lineTo(B.hx + 10, B.hy - 9); g.lineTo(B.hx + 6, B.hy - 1); g.closePath(); }, '#DC2626', B.hx - 9, B.hy - 9, 19, 8, 1),
  hairToo: true, eyes: 'wide', mouth: 'o',
};

// ---------------------------------------------------------------------------------------------------------------
// The kung fu flying kick

const kick = (ctx: FrameContext, e: Enemy) => {
  if (e.aiTimer === 1) { e.vel.y = -7.5; e.vel.x = (e.facing ?? 1) * 6.4; }
  else if (e.vel.y !== 0 || e.aiTimer < 6) e.vel.x = (e.facing ?? 1) * 6.4;
  else e.vel.x = 0;
  if (!KICKED.has(e) && meleeHit(ctx, e, 46, 12, 'm2:fl_kungfu', 10, 50)) { KICKED.add(e); playSound('punch', 0.9, 2); }
};
const KICKED = new WeakSet<Enemy>();
castKind({
  kind: 'm2:fl_kungfu', costume: KUNGFU_COSTUME, stats: { w: 36, h: 72, hp: 100, contact: 5, mass: 180 },
  voice: V.kungfu, pool: KUNGFU, speed: 1.6, range: [90, 240], reachY: 70, tell: 22, strikeFor: 30, after: 26, cooldown: 60,
  strike: (ctx, e) => {
    KICKED.delete(e); playSound('whoosh', 0.8, 4);
    // (shouting the move: always tries, the bark's own rules permitting)
    bark(ctx.state, e, womanOf(e) ? V.kungfu.f : V.kungfu.m, MOVES, 0.9);
  },
  striking: kick,
  poseFor: e => (e.aiState === 'strike' ? 'fly' : null),
});

castKind({
  kind: 'm2:fl_fireworks', costume: FIREWORKS_COSTUME, stats: { w: 36, h: 72, hp: 80, contact: 4, mass: 170 },
  voice: V.fireworks, pool: FIREWORKS, speed: 0.9, range: [220, 620], reachY: 520, tell: 34, after: 30, cooldown: 110,
  strike: (ctx, e) => {
    const p = ctx.state.player, h = mid(e);
    launchRocket(ctx.state, h.x + (e.facing ?? 1) * 14, e.pos.y + 10, p.pos.x + p.width / 2 + p.vel.x * 30, p.pos.y + p.height - 10, e);
  },
});

// ---------------------------------------------------------------------------------------------------------------
// The dragon dance

interface Chain { members: Enemy[]; hist: { x: number; y: number }[]; at: number; hopAt: number }
const CHAIN = new WeakMap<Enemy, Chain>();

/** Puts the dragon down: `n` segments from world x (its head) going right, feet at y; its head faces left. */
export const spawnDragon = (state: GameState, make: (x: number, y: number) => Enemy, x: number, y: number, n = 6) => {
  const ch: Chain = { members: [], hist: [], at: -1, hopAt: 0 };
  for (let i = 0; i < n; i++) {
    const e = make(x + i * 42, y);
    e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = i; e.facing = -1;
    CHAIN.set(e, ch); ch.members.push(e); state.enemies.push(e);
  }
};

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !reaction(e);
const rankOf = (ch: Chain, e: Enemy) => ch.members.filter(alive).indexOf(e);

const dragonAI = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, ch = CHAIN.get(e);
  e.aiTimer = (e.aiTimer || 0) + 1;
  if (!ch) return false;
  const live = ch.members.filter(alive), lead = live[0];
  if (!lead) return false;
  const pl = state.player, p = mid(pl);
  // (the leader's trail, once a frame)
  if (ch.at !== state.frame) { ch.at = state.frame; ch.hist.unshift({ x: lead.pos.x, y: lead.pos.y }); if (ch.hist.length > 160) ch.hist.length = 160; }
  const grounded = Math.abs(e.vel.y) < 0.01;
  if (e === lead) {
    const m = mid(e), dx = p.x - m.x, near = Math.abs(dx) < 720 && Math.abs(p.y - m.y) < 300 && pl.health > 0 && !holdingOff(state) && !pl.inCutscene;
    if (near) {
      e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
      // (dancing at him: a weave in its step)
      e.vel.x = e.facing * (1.6 + Math.sin(e.aiTimer * 0.12) * 1.0);
      if (grounded && state.frame - ch.hopAt > 150 && Math.abs(dx) < 320) { ch.hopAt = state.frame; e.vel.y = -8.5; e.vel.x = e.facing * 5; playSound('roar', 0.5, 8); }
      if (e.aiTimer % 200 === 60) bark(state, e, pick(seedOf(e), 1, [V.dragon.m, V.dragon.f]), byPants(state, DRAGON), 0.5);
    } else { e.vel.x = Math.sin(e.aiTimer * 0.05) * 0.6; }
    return false;
  }
  // (the rest: after the leader's trail, a step behind the one before)
  const r = Math.max(1, rankOf(ch, e)), t = ch.hist[r * 9];
  // (not enough trail yet: stay put)
  if (!t) { e.vel.x = 0; return false; }
  e.vel.x = Math.max(-5, Math.min(5, (t.x - e.pos.x) * 0.2));
  // (never bunching up into the one in front: a body's width apart at least)
  const front = live[r - 1];
  if (front && Math.abs(front.pos.x - e.pos.x) < 38 && Math.sign(front.pos.x - e.pos.x) === Math.sign(e.vel.x)) e.vel.x = 0;
  e.facing = (t.x < e.pos.x - 1 ? -1 : t.x > e.pos.x + 1 ? 1 : e.facing ?? -1) as 1 | -1;
  if (grounded && t.y < e.pos.y - 24) e.vel.y = -8.5;
  return false;
};

const CLOTH = ['#DC2626', '#B91C1C'];
/** One segment: the cloth hump (scales, a gold fringe), two legs under it; the head's the felt dragon's, the tail's
 *  tip at the end. Knocked about or dead: the kid, out of it. */
const drawDragon = (c: CanvasRenderingContext2D, e: Enemy, f: number) => {
  if (e.health <= 0 || !e.id || reaction(e)) { drawCast(c, e, f, DRAGON_KID); return; }
  const ch = CHAIN.get(e), live = ch ? ch.members.filter(alive) : [e], r = Math.max(0, live.indexOf(e));
  const head = r === 0, tail = r === live.length - 1 && !head;
  const L = lookOf(seedOf(e), womanOf(e));
  const bob = Math.round(Math.sin(f * 0.18 + r * 0.9) * 4), step = Math.sin(f * 0.3 + r) * 5;
  // (the legs under it: black pants, sneakers, a bit of ankle)
  for (const s of [-1, 1]) { const lx = s * 8 + (s > 0 ? step : -step); px(c, lx - 3, -22, 7, 20, '#1C1917'); px(c, lx - 3, -4, 7, 2, L.skin); px(c, lx - 4, -2, 10, 3, '#F5F5F4'); }
  // (the cloth: a hump of red satin (shaded by the drawer), scales in rows (each a stepped arc lit on top), a belly band of
  // gold, the fringe along the bottom in two steps, the shadow under the hump)
  const top = -54 + bob, C = CLOTH[r % 2];
  part(c, () => { c.moveTo(-26, -20); c.quadraticCurveTo(-24, top - 6, 0, top - 8); c.quadraticCurveTo(24, top - 6, 26, -20); c.closePath(); }, C, -26, top - 8, 52, -20 - top + 8, 1.4);
  for (let row = 0; row < 3; row++) for (let k = -2; k <= 2; k++) {
    const sx = k * 9 + (row % 2) * 4, sy = top + 8 + row * 9, sc = row % 2 ? '#F59E0B' : '#FCD34D';
    px(c, sx - 3, sy - 2, 7, 1, INK); px(c, sx - 4, sy - 1, 9, 3, sc); px(c, sx - 3, sy - 1, 7, 1, lt(sc, 0.45)); px(c, sx - 4, sy + 2, 9, 1, dk(sc, 0.35));
  }
  px(c, -24, -26, 48, 4, '#CA8A04'); px(c, -24, -26, 48, 1, '#FDE68A'); px(c, -24, -23, 48, 1, '#92400E');
  for (let x = -24; x < 24; x += 4) { px(c, x, -21, 2, 5, '#FCD34D'); px(c, x + 2, -21, 1, 4, '#D97706'); px(c, x, -17 + ((x >> 2) & 1), 2, 2, '#F59E0B'); }
  // (a spine of green felt spikes along the top, lit on their left)
  for (let k = -2; k <= 2; k++) part(c, () => { c.moveTo(k * 9 - 4, top - 4); c.lineTo(k * 9, top - 13); c.lineTo(k * 9 + 4, top - 4); c.closePath(); }, '#16A34A', k * 9 - 4, top - 13, 8, 9, 0.8);
  if (head) {
    // (the felt head: a big box of a snout (lit on top), googly eyes under shaggy brows, felt teeth, nostrils, whiskers, a
    // fringe beard, gold horns, an orange mane behind)
    const hx = 22, hy = top - 4;
    for (let k = 0; k < 6; k++) { const mx = hx - 12 + (k % 3) * 4, my = hy - 8 + Math.floor(k / 3) * 12; px(c, mx - 1, my, 6, 14, INK); px(c, mx, my, 4, 13, k % 2 ? '#F97316' : '#FB923C'); px(c, mx, my, 1, 13, '#FDBA74'); }
    part(c, () => { c.moveTo(hx - 8, hy - 10); c.lineTo(hx + 30, hy - 4); c.lineTo(hx + 32, hy + 16); c.lineTo(hx - 6, hy + 20); c.closePath(); }, '#DC2626', hx - 8, hy - 10, 40, 30, 1.4);
    px(c, hx - 4, hy - 7, 32, 2, '#F87171');
    const chomp = Math.sin(f * 0.25) > 0.6 ? 4 : 0;
    px(c, hx + 6, hy + 12 + chomp, 26, 6, '#7F1D1D'); px(c, hx + 6, hy + 16 + chomp, 26, 2, '#450A0A');
    for (let k = 0; k < 5; k++) { px(c, hx + 8 + k * 5, hy + 10, 3, 4, '#F8FAFC'); px(c, hx + 8 + k * 5, hy + 13, 3, 1, '#D6D3D1'); px(c, hx + 8 + k * 5, hy + 16 + chomp, 3, 3, '#F8FAFC'); }
    for (const nx of [hx + 24, hx + 28]) px(c, nx, hy + 2, 2, 2, '#450A0A');
    for (const ex of [hx + 4, hx + 16]) {
      ball(c, ex, hy - 6, 6, '#FFFFFF', 1); const lk = Math.sin(f * 0.4 + ex) * 2; ball(c, ex + 1 + lk, hy - 5, 2.6, INK, 0);
      px(c, ex - 6, hy - 14, 12, 3, '#FCD34D'); px(c, ex - 6, hy - 14, 12, 1, '#FEF08A');
    }
    limb(c, hx + 30, hy + 4, hx + 46, hy - 6 + bob, 1.5, '#FCD34D'); limb(c, hx + 30, hy + 8, hx + 48, hy + 12 - bob, 1.5, '#FCD34D');
    for (let k = 0; k < 4; k++) { px(c, hx + 2 + k * 6, hy + 20 + chomp, 3, 8 + (k % 2) * 3, '#FCD34D'); px(c, hx + 2 + k * 6, hy + 20 + chomp, 1, 8 + (k % 2) * 3, '#FEF08A'); }
    part(c, () => { c.moveTo(hx - 2, hy - 10); c.lineTo(hx - 10, hy - 26); c.lineTo(hx + 4, hy - 10); c.closePath(); }, '#FCD34D', hx - 10, hy - 26, 14, 16, 1);
    part(c, () => { c.moveTo(hx + 8, hy - 9); c.lineTo(hx + 4, hy - 24); c.lineTo(hx + 13, hy - 8); c.closePath(); }, '#FBBF24', hx + 4, hy - 24, 9, 16, 1);
  }
  if (tail) {
    part(c, () => { c.moveTo(-24, top + 4); c.quadraticCurveTo(-46, top - 10 + bob, -54, top - 20); c.lineTo(-44, top - 4); c.lineTo(-26, top + 14); c.closePath(); }, '#DC2626', -54, top - 20, 30, 34, 1.2);
    for (let k = 0; k < 3; k++) px(c, -50 + k * 3, top - 18 + k * 2, 3, 6, '#FCD34D');
  }
  void dk; void lt;
};

registerM2Kind({
  kind: 'm2:fl_dragon', stats: { w: 40, h: 56, hp: 90, contact: 9, mass: 170 },
  humanoid: true, head: { x: 6, y: -50, r: 12 }, pathing: false,
  gender: e => (womanOf(e) ? 'f' : 'm'),
  ai: dragonAI, draw: drawDragon,
});

void setState;
