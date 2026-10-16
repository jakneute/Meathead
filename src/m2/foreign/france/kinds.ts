// France's cast (Meathead 2's own kinds, registered when Foreign Lands is loaded): college kids in costume (name tags;
// seeded people under them, men and women of every look), on cast.ts's way of fighting:
//
//   mime      white face paint, stripes, suspenders, a beret, white gloves: presses its hands flat on the air (the tell)
//             and there's an INVISIBLE WALL in front of it: it blocks his shots (eaten, one by one, till it cracks and
//             breaks), and him, and anybody walking; it gives out by itself after a while, and when the mime dies. Up
//             close, a punch (a real one)
//   waiter    a snooty waiter (a drawn-on mustache on everybody): a vest, a bow tie, a towel over the arm, a tray: flings
//             plates flat like frisbees (shots.ts 'plate')
//   baguette  stripes, a red neckerchief, a beret and a baguette from Costco: swings it (close)
//   cancan    the can-can line: a frilly skirt, a corset, a feather plume: they KICK IN UNISON, on the beat, all of them
//             at once (in his face or not: it's a show), so the line's a wall of kicks every beat; get in between
//   smoker    a black turtleneck, a beret, shades, a cigarette: rude to him, and blows smoke at him (shots.ts 'smoke')

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { castKind, meleeHit, setState, type Costume, type Ctx, INK, px, part, partTop, ball, limb } from '../cast';
import { shootFlat } from '../shots';
import { registerHurts } from '../pavilion';
import { HURT, V, MIME, WAITER, BAGUETTE, CANCAN, SMOKER } from './lines';

registerHurts(HURT);

const pick = <T>(seed: number, salt: number, l: readonly T[]) => l[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % l.length];

// ---------------------------------------------------------------------------------------------------------------
// Costume pieces

const beret = (g: Ctx, B: { hx: number; hy: number; rx: number; ry: number }, col = '#1C1917') => {
  partTop(g, () => g.ellipse(B.hx - 2, B.hy - B.ry + 1, B.rx + 3, 5, -0.15, Math.PI, 0), col, B.hx - B.rx - 5, B.hy - B.ry - 4, B.rx * 2 + 6, 6, 1);
  px(g, B.hx - 3, B.hy - B.ry - 6, 2, 3, col);
};
const stripes = (g: Ctx, B: { w: number; shY: number; hipY: number }, col: string) => { for (let y = B.shY + 3; y < B.hipY; y += 5) px(g, -B.w / 2, y, B.w, 2, col); };
const mustache = (g: Ctx, B: { hx: number; hy: number }) => { px(g, B.hx + 2, B.hy + 3, 8, 1.5, INK); px(g, B.hx + 9, B.hy + 1, 1.5, 2, INK); };

const MIME_COSTUME: Costume = {
  id: 'mime', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  over: (g, B) => { stripes(g, B, '#1C1917'); for (const s of [-1, 1]) px(g, s * (B.w / 4) - 1, B.shY, 3, B.hipY - B.shY, '#DC2626'); },
  // (the white face paint, a black teardrop, red lips)
  face: (g, B) => {
    px(g, B.hx - B.rx + 1, B.hy - B.ry + 2, B.rx * 2 - 1, 5, '#FFFFFF');
    px(g, B.hx - B.rx + 1, B.hy + 1, B.rx * 2 - 1, B.ry - 2, '#FFFFFF');
    px(g, B.hx + 2, B.hy - 7, 2, 2, INK); px(g, B.hx + 8, B.hy - 1, 1, 3, INK);
    px(g, B.hx + 3, B.hy + 5, 6, 2, '#DC2626');
  },
  hat: (g, B) => beret(g, B), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[B.w / 2 + 10, B.shY - 4], [B.w / 2 + 12, B.shY + 14]] : null),
  // (the white gloves)
  hold: (g, B, F, x, y) => ball(g, x, y, 3.5, '#FFFFFF', 1),
  holdFar: (g, B, F, x, y) => ball(g, x, y, 3.5, '#E5E7EB', 1),
  eyes: 'wide', mouth: 'flat',
};

const WAITER_COSTUME: Costume = {
  id: 'waiter', top: '#F8FAFC', legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917',
  over: (g, B) => { for (const s of [-1, 1]) px(g, s < 0 ? -B.w / 2 : B.w / 2 - 8, B.shY + 2, 8, B.hipY - B.shY, '#1C1917'); px(g, -4, B.shY + 1, 9, 3, INK); px(g, -1, B.shY + 1, 2, 3, '#7F1D1D'); px(g, -B.hipW / 2 + 1, B.hipY - 2, B.hipW - 2, 20, '#F5F5F4'); },
  face: (g, B) => mustache(g, B),
  hairToo: false,
  hat: (g, B, F) => { partTop(g, () => g.ellipse(B.hx - 1, B.hy - 3, B.rx + 0.5, B.ry - 1, 0, Math.PI, 0), pick(F.seed, 2, ['#1C1917', '#3F2A1C', '#57534E']), B.hx - B.rx - 1, B.hy - B.ry - 2, B.rx * 2, B.ry, 1); },
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 14], [-B.w / 2 - 6, B.shY - 12]] : F.pose === 'strike' ? [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 18, B.shY + 4]] : [[-B.w / 2 - 6, B.shY + 10], [B.w / 2 + 10, B.shY - 4]]),
  // (the tray up on the fingertips, a glass of red on it; a plate cocked back in the tell)
  hold: (g, B, F, x, y) => {
    if (F.pose === 'tell') { part(g, () => g.ellipse(x, y - 2, 10, 4, -0.4, 0, Math.PI * 2), '#F8FAFC', x - 10, y - 6, 20, 8, 1); return; }
    if (F.pose === 'strike') return;
    px(g, x - 14, y - 3, 28, 3, INK); px(g, x - 13, y - 3, 26, 2, '#D6D3D1');
    px(g, x - 2, y - 13, 5, 6, '#7F1D1D'); px(g, x, y - 7, 1, 4, '#E5E7EB');
  },
  holdFar: (g, B, F, x, y) => { px(g, x - 4, y - 2, 8, 14, '#F8FAFC'); },
  eyes: 'smug', mouth: 'smirk',
};

const BAGUETTE_COSTUME: Costume = {
  id: 'baguette', top: '#F8FAFC', legs: s => pick(s, 2, ['#1E3A8A', '#1C1917', '#57534E']), shoe: 'shoe', shoeCol: '#1C1917',
  over: (g, B) => { stripes(g, B, '#1E3A8A'); part(g, () => { g.moveTo(-5, B.shY); g.lineTo(6, B.shY); g.lineTo(1, B.shY + 8); g.closePath(); }, '#DC2626', -5, B.shY, 11, 8, 0.8); },
  face: (g, B) => mustache(g, B),
  hat: (g, B) => beret(g, B, '#1C1917'), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' ? [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2, B.shY - 16]] : F.pose === 'strike' ? [[-B.w / 2, B.shY + 14], [B.w / 2 + 14, B.shY + 4]] : null),
  // (the baguette: up and back, swung level, or under the arm)
  hold: (g, B, F, x, y) => {
    const a = F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? -0.1 : 1.2, len = 46;
    limb(g, x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, 4, '#D6A15E');
    for (let k = 1; k < 4; k++) { const t = k / 4; px(g, x + Math.cos(a) * len * t - 1, y + Math.sin(a) * len * t - 1, 3, 1, '#92400E'); }
  },
  eyes: 'smug', mouth: 'grin',
};

const CORSETS = ['#B91C1C', '#1C1917', '#DB2777', '#7C3AED'];
const CANCAN_COSTUME: Costume = {
  id: 'cancan', top: s => pick(s, 2, CORSETS), legs: '#1C1917', shoe: 'shoe', shoeCol: '#1C1917', sleeveLen: 0.2,
  // (the frilly skirt: layers of ruffles round the hips, flared)
  over: (g, B, F) => {
    const col = pick(F.seed, 2, CORSETS);
    for (let k = 0; k < 3; k++) part(g, () => { g.moveTo(-B.hipW / 2 - 2 - k * 3, B.hipY - 4 + k * 7); g.lineTo(B.hipW / 2 + 2 + k * 3, B.hipY - 4 + k * 7); g.lineTo(B.hipW / 2 + 6 + k * 3, B.hipY + 5 + k * 7); g.lineTo(-B.hipW / 2 - 6 - k * 3, B.hipY + 5 + k * 7); g.closePath(); }, k % 2 ? '#F8FAFC' : col, -B.hipW / 2 - 12, B.hipY - 4, B.hipW + 24, 26, 0.8);
    for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 3 + k * 5, B.shY + 4, 1, B.hipY - B.shY - 8, '#1C1917');
  },
  // (the feather plume)
  hat: (g, B, F) => { const col = pick(F.seed, 3, ['#F472B6', '#FDE047', '#F8FAFC', '#A78BFA']); for (let k = 0; k < 3; k++) part(g, () => g.ellipse(B.hx - 4 + k * 4, B.hy - B.ry - 10, 3, 11, -0.3 + k * 0.3, 0, Math.PI * 2), col, B.hx - 8 + k * 4, B.hy - B.ry - 21, 8, 22, 0.6); px(g, B.hx - 6, B.hy - B.ry - 1, 12, 3, '#FCD34D'); },
  hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 10, B.shY - 8], [B.w / 2 + 10, B.shY - 10]] : [[-B.w / 2 - 6, B.hipY + 2], [B.w / 2 + 6, B.hipY + 2]]),
  eyes: 'wide', mouth: 'smile',
};
/** The kick: a black-stockinged leg up high out front, the shoe at the top, the petticoat flipped. */
const drawKick = (c: Ctx, e: Enemy) => {
  if (e.aiState !== 'strike' || e.health <= 0 || !e.id) return;
  limb(c, 2, -34, 30, -70, 6, INK); limb(c, 2, -34, 30, -70, 4, '#1C1917');
  px(c, 26, -78, 10, 6, '#1C1917'); px(c, 24, -76, 3, 3, '#FCD34D');
  part(c, () => { c.moveTo(-6, -36); c.lineTo(16, -52); c.lineTo(20, -40); c.closePath(); }, '#F8FAFC', -6, -52, 26, 16, 0.8);
};

const SMOKER_COSTUME: Costume = {
  id: 'smoker', top: '#1C1917', legs: s => pick(s, 2, ['#1C1917', '#44403C']), shoe: 'pointy', shoeCol: '#1C1917',
  over: (g, B) => { px(g, -B.w / 2 + 2, B.shY - 2, B.w - 4, 4, '#292524'); },
  face: (g, B) => { px(g, B.hx - 1, B.hy - 4, 13, 4, INK); },
  hat: (g, B) => beret(g, B, '#7F1D1D'), hairToo: true,
  hands: (B, F) => (F.pose === 'tell' || F.pose === 'strike' ? [[-B.w / 2 - 2, B.shY + 14], [B.hx + 7, B.hy + 7]] : [[-B.w / 2 - 2, B.shY + 14], [B.w / 2 + 6, B.shY + 4]]),
  // (the cigarette, its ember, a curl of smoke up off it)
  hold: (g, B, F, x, y) => { px(g, x, y - 2, 9, 2, '#F5F5F4'); px(g, x + 8, y - 2, 2, 2, '#F97316'); const w = Math.sin(F.fr * 0.5) * 2; px(g, x + 9 + w, y - 9, 2, 3, '#D6D3D1'); px(g, x + 10 - w, y - 15, 2, 3, '#E7E5E4'); },
  eyes: 'tired', mouth: 'smirk',
};

// ---------------------------------------------------------------------------------------------------------------
// The mime's invisible walls

interface MimeWall { owner: Enemy; b: Block; hp: number; until: number; hit: number }
const WALLS = new WeakMap<object, MimeWall[]>();
const wallsOf = (state: GameState) => { const k = state.stage as object; let w = WALLS.get(k); if (!w) { w = []; WALLS.set(k, w); } return w; };
const WALL_W = 14, WALL_H = 120, WALL_HP = 6, WALL_LIFE = 420;

const raiseWall = (state: GameState, e: Enemy) => {
  const list = wallsOf(state);
  if (list.some(w => w.owner === e)) return;
  const m = mid(e), x = m.x + (e.facing ?? 1) * 46 - WALL_W / 2, feet = e.pos.y + e.height, y = feet - WALL_H;
  const p = state.player;
  if (p.pos.x < x + WALL_W + 4 && p.pos.x + p.width > x - 4 && p.pos.y < feet && p.pos.y + p.height > y) return;
  const b: Block = { x, y, w: WALL_W, h: WALL_H, type: 'wall', hidden: true, tag: 'fr-mimewall' } as Block;
  state.blocks.push(b);
  list.push({ owner: e, b, hp: WALL_HP, until: state.frame + WALL_LIFE, hit: -99 });
  playSound('click', 0.5, 18);
};

/** (France's update: every frame) the walls eat his shots, crack, and give out. */
export const updateMimeWalls = (ctx: FrameContext) => {
  const { state } = ctx, list = wallsOf(state);
  for (let i = list.length - 1; i >= 0; i--) {
    const w = list[i], b = w.b;
    state.projectiles = state.projectiles.filter(pr => {
      if (pr.owner !== 'player' || w.hp <= 0) return true;
      if (pr.pos.x < b.x + b.w && pr.pos.x + pr.width > b.x && pr.pos.y < b.y + b.h && pr.pos.y + pr.height > b.y) {
        w.hp--; w.hit = state.frame; playSound('clink', 0.6, 10 - w.hp * 2);
        for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: b.x + b.w / 2, y: pr.pos.y + pr.height / 2 }, vel: { x: -Math.sign(pr.vel.x || 1) * Math.random() * 3, y: (Math.random() - 0.5) * 3 }, life: 14, color: '#E0F2FE', size: 2 });
        return false;
      }
      return true;
    });
    if (w.hp <= 0 || state.frame > w.until || w.owner.health <= 0 || !state.enemies.includes(w.owner)) {
      const j = state.blocks.indexOf(b); if (j >= 0) state.blocks.splice(j, 1);
      list.splice(i, 1);
      playSound('glass', 0.7, 8);
      for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: b.x + b.w / 2, y: b.y + Math.random() * b.h }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 22, color: k % 2 ? '#E0F2FE' : '#FFFFFF', size: 2 });
    }
  }
};
/** Drawn faint: a shimmer where it is (it's invisible: just enough to read), its cracks as it's shot. */
export const drawMimeWalls = (c: Ctx, state: GameState) => {
  for (const w of wallsOf(state)) {
    const b = w.b, flash = state.frame - w.hit < 6;
    c.globalAlpha = flash ? 0.55 : 0.18 + Math.sin(state.frame * 0.15) * 0.05;
    c.fillStyle = '#E0F2FE'; c.fillRect(b.x, b.y, b.w, b.h);
    c.globalAlpha = flash ? 0.9 : 0.45;
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    for (let k = 0; k < WALL_HP - w.hp; k++) { const y = b.y + 14 + k * 17; c.beginPath(); c.moveTo(b.x + 2, y); c.lineTo(b.x + b.w / 2, y + 6); c.lineTo(b.x + b.w - 2, y + 2); c.stroke(); }
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------

castKind({
  kind: 'm2:fl_mime', costume: MIME_COSTUME, stats: { w: 34, h: 70, hp: 95, contact: 4, mass: 160 },
  voice: V.mime, pool: MIME, speed: 1.1, range: [40, 300], reachY: 80, tell: 24, after: 20, cooldown: 110,
  strike: (ctx, e) => {
    if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 74) { if (meleeHit(ctx, e, 76, 7, 'm2:fl_mime', 8)) playSound('punch', 0.7, 6); }
    else raiseWall(ctx.state, e);
  },
});

castKind({
  kind: 'm2:fl_waiter', costume: WAITER_COSTUME, stats: { w: 36, h: 72, hp: 90, contact: 5, mass: 170 },
  voice: V.waiter, pool: WAITER, speed: 1.1, range: [140, 440], reachY: 200, tell: 22, after: 18, cooldown: 70,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'plate', 5),
});

castKind({
  kind: 'm2:fl_baguette', costume: BAGUETTE_COSTUME, stats: { w: 36, h: 72, hp: 95, contact: 5, mass: 180 },
  voice: V.baguette, pool: BAGUETTE, speed: 1.5, range: [40, 100], reachY: 60, tell: 16, strikeFor: 10, after: 22, cooldown: 40,
  strike: (ctx, e) => { playSound('whoosh', 0.7, 2); if (meleeHit(ctx, e, 86, 9, 'm2:fl_baguette', 9)) playSound('thud', 0.6, 12); },
  striking: (_ctx, e) => { e.vel.x = e.aiTimer < 5 ? (e.facing ?? 1) * 2 : 0; },
});

/** The can-can line kicks on the beat: every one at once, whatever range (it's a show). */
const BEAT = 90;
castKind({
  kind: 'm2:fl_cancan', costume: CANCAN_COSTUME, stats: { w: 34, h: 70, hp: 80, contact: 4, mass: 150 },
  voice: V.cancan, pool: CANCAN, speed: 0.8, range: [30, 80], reachY: 60, tell: 14, strikeFor: 14, after: 10, cooldown: 99999,
  own: (ctx, e) => {
    const st = e.aiState ?? 'idle';
    if ((st === 'idle' || st === 'approach') && ctx.state.frame % BEAT === 0) { e.vel.x = 0; setState(e, 'tell'); return true; }
    return false;
  },
  strike: (ctx, e) => { if (meleeHit(ctx, e, 78, 10, 'm2:fl_cancan', 12)) playSound('punch', 0.7, 8); if (Math.abs(mid(ctx.state.player).x - mid(e).x) < 700) playSound('whoosh', 0.25, 12); },
  drawExtra: (c, e) => drawKick(c, e),
});

castKind({
  kind: 'm2:fl_smoker', costume: SMOKER_COSTUME, stats: { w: 34, h: 72, hp: 85, contact: 4, mass: 160 },
  voice: V.smoker, pool: SMOKER, speed: 0.8, range: [90, 340], reachY: 90, tell: 30, after: 30, cooldown: 90,
  strike: (ctx, e) => shootFlat(ctx.state, e, 'smoke', 2.3),
});
