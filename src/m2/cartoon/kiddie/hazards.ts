// Sillyville Square's rides (moving hazards: each hurts him and the cast alike; none of the cast idles in one, but they
// can be knocked in), the ball pits, and what the cast throw.
//
//   THE WUMPLE-GO-ROUND: a kiddie carousel of made-up beasts (the zizzle-horn, the floofalump, the snerg, the grickle,
//     the wuzzle, the plonk) on their poles, going round and bobbing. The front half of the turn's on the play plane
//     (coming at him: jump them, or go over the canopy); the back half's behind the poles, harmless.
//   THE WISH-FISH SPINNER: four fiberglass fish on arms round a fish-bowl hub, going round, each rising and falling on
//     its own; the front half of the turn hits, at whatever height that fish is at.
//   THE SNOOZLE CHOO: the kiddie train (an engine and three cars of screaming kids) out from behind the hedge at the
//     track's right end and along it at him (jump it), round behind the hedges back the other way. The whistle first.
//   THE SKY-HIGH TROLLEY: out of the hattery's wall along its track over the ball pit, bell ringing first; anybody on
//     the track in its way gets hit (he gets up onto a tower's lid over it, or he's too slow).
//   THE BALL PITS: bottomless (LAST KID FOUND 1997). Into one and it spits him back out where he last stood, hurt; the
//     cast it spits out dead.
//   What the cast throw: the hat cat's hat (out, and back), the Whatsits' kites (on their strings: a shake, a dive at
//     him, back up), the painter's paint blobs (they splat).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { mid } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit, hazardKill, boxHits, setHazardZones } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { teleport } from '../section';
import { box, mix, onScreen, hour, dimmed, toonLetters, INK, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { kiddieOf } from './state';
import { onTower } from '../sway';
import { CAROUSEL, SPINNER, TRAIN, TROLLEY, PITS, X, Y } from './layout';
import { GY } from '../geometry';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const overlaps = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
/** A ride hits him (box in world space). */
const rideHurts = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, source: string, knock: { x: number; y: number }) => {
  const { state } = ctx, p = state.player;
  if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x, y, w, h)) { hurtPlayer(ctx, dmg, source, knock); return true; }
  return false;
};
/** A ride hits the cast in its box (each no more than once a second). */
const rideHitsCast = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, fromX: number, call: string) => {
  const { state } = ctx, k = kiddieOf(state);
  for (const e of hazardVictims(state)) {
    if (!boxHits(e, x, y, w, h) || state.frame - (k.rideHit.get(e) ?? -999) < 60) continue;
    k.rideHit.set(e, state.frame);
    hazardHit(ctx, e, dmg, fromX, call, { knock: 11 });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The rides' clocks (worked out from the frame: the same for drawing and for hitting)

const CAR_SPEED = 0.012, CAR_N = 6;
/** The carousel's beasts: x, how high their hooves are, front (on the play plane) or not. */
export const beasts = (f: number) => Array.from({ length: CAR_N }, (_, k) => {
  const a = f * CAR_SPEED + (k / CAR_N) * Math.PI * 2;
  return { k, a, x: X(CAROUSEL.cx) + Math.cos(a) * CAROUSEL.r, front: Math.sin(a) > 0, depth: Math.sin(a), bob: Math.sin(f * 0.05 + k * 1.3) * 10 };
});
const FISH_SPEED = 0.016, FISH_N = 4;
export const fishes = (f: number) => Array.from({ length: FISH_N }, (_, k) => {
  const a = f * FISH_SPEED + (k / FISH_N) * Math.PI * 2;
  const h = SPINNER.lo + (SPINNER.hi - SPINNER.lo) * (0.5 + 0.5 * Math.sin(f * 0.011 + k * 1.7));
  return { k, a, x: X(SPINNER.cx) + Math.cos(a) * SPINNER.r, h, front: Math.sin(a) > 0, depth: Math.sin(a) };
});
const TRAIN_V = 2.6, TRAIN_LEN = 300, TRAIN_H = 52;
const TRAIN_RUN = (TRAIN.b - TRAIN.a + TRAIN_LEN) / TRAIN_V;
/** Its whole loop: the whistle, the front pass, round the end, the back pass, round the other end. */
const TRAIN_P = Math.ceil(70 + TRAIN_RUN + 60 + TRAIN_RUN + 60);
/** The train: 'front' (along the play plane at him, its engine's nose at x), 'back' (behind the hedges, nose at x
 *  going right), or hidden; whistling (the tell). */
export const trainAt = (f: number) => {
  const t = f % TRAIN_P;
  if (t < 70) return { phase: 'whistle' as const, x: X(TRAIN.b) + 40, t };
  if (t < 70 + TRAIN_RUN) return { phase: 'front' as const, x: X(TRAIN.b) + 20 - (t - 70) * TRAIN_V, t };
  const t2 = t - 70 - TRAIN_RUN;
  if (t2 > 60 && t2 < 60 + TRAIN_RUN) return { phase: 'back' as const, x: X(TRAIN.a) - 20 + (t2 - 60) * TRAIN_V, t };
  return { phase: 'gone' as const, x: 0, t };
};
const TROLLEY_P = 820, TROLLEY_V = 3.2, TROLLEY_LEN = 170, TROLLEY_H = 82, BELL = 120;
/** The trolley: ringing its bell (the tell) or running (its nose at x), or not about. */
export const trolleyAt = (f: number) => {
  const t = f % TROLLEY_P;
  if (t < BELL) return { phase: 'bell' as const, x: X(TROLLEY.a), t };
  const x = X(TROLLEY.a) + (t - BELL) * TROLLEY_V;
  if (x - TROLLEY_LEN < X(TROLLEY.b) + 40) return { phase: 'run' as const, x, t };
  return { phase: 'gone' as const, x: 0, t };
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, f = state.frame, p = state.player;
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // The carousel
  {
    const deck = Y(CAROUSEL.deck);
    for (const b of beasts(f)) {
      if (!b.front || b.depth < 0.25) continue;
      const y = deck - 14 - b.bob - 56;
      // (they come at him: knocked the way they're going)
      rideHurts(ctx, b.x - 26, y, 52, 58, 10, 'm2:ct_carousel', { x: -7, y: -6 });
      rideHitsCast(ctx, b.x - 26, y, 52, 58, 45, b.x + 30, 'GO-ROUNDED!');
    }
    zones.push({ x0: X(CAROUSEL.cx - CAROUSEL.r - 40), x1: X(CAROUSEL.cx + CAROUSEL.r + 40), y0: Y(CAROUSEL.deck + 100), y1: GY });
  }
  // The spinner
  for (const fi of fishes(f)) {
    if (!fi.front || fi.depth < 0.25) continue;
    const y = Y(fi.h) - 18;
    rideHurts(ctx, fi.x - 32, y, 64, 34, 11, 'm2:ct_fish', { x: -6, y: -6 });
    rideHitsCast(ctx, fi.x - 32, y, 64, 34, 45, fi.x + 30, 'GONE FISHING!');
  }
  zones.push({ x0: X(SPINNER.cx - SPINNER.r - 50), x1: X(SPINNER.cx + SPINNER.r + 50), y0: Y(SPINNER.hi + 40), y1: GY });
  // The train
  {
    const tr = trainAt(f);
    if (tr.phase === 'whistle' && tr.t === 1) { envSound(state, tr.x, 'horn', 0.5, 18); envSound(state, tr.x, 'ding', 0.3, 10); }
    if (tr.phase === 'whistle' && tr.t % 6 === 0 && onScreen(state, tr.x - 100, tr.x + 100)) state.particles.push({ pos: { x: tr.x - 10, y: Y(70) }, vel: { x: -0.4, y: -1.2 }, life: 40, color: '#F8FAFC', size: 6 });
    if (tr.phase === 'front') {
      if (tr.t % 40 === 0) envSound(state, tr.x, 'engine', 0.25, 14);
      // (only between the hedges at the track's ends: past them it's round the bend, behind)
      const hx0 = Math.max(tr.x, X(TRAIN.a)), hx1 = Math.min(tr.x + TRAIN_LEN, X(TRAIN.b));
      if (hx1 > hx0) {
        rideHurts(ctx, hx0, Y(TRAIN_H), hx1 - hx0, TRAIN_H, 13, 'm2:ct_train', { x: -9, y: -8 });
        rideHitsCast(ctx, hx0, Y(TRAIN_H), hx1 - hx0, TRAIN_H, 60, tr.x + TRAIN_LEN, 'CHOO CHOO!');
      }
      if (tr.t % 8 === 0 && onScreen(state, tr.x, tr.x + 60)) state.particles.push({ pos: { x: tr.x + 22, y: Y(76) }, vel: { x: 0.6, y: -1.4 }, life: 36, color: '#F1F5F9', size: 5 });
    }
    zones.push({ x0: X(TRAIN.a) - 20, x1: X(TRAIN.b) + 20, y0: Y(TRAIN_H + 20), y1: GY });
  }
  // The trolley
  {
    const tl = trolleyAt(f);
    if (tl.phase === 'bell' && tl.t % 30 === 0) envSound(state, X(TROLLEY.a), 'ding', 0.55, 6);
    if (tl.phase === 'run') {
      if (tl.t % 50 === 0) envSound(state, tl.x, 'ding', 0.35, 6);
      const x0 = Math.max(X(TROLLEY.a), tl.x - TROLLEY_LEN);
      if (tl.x > X(TROLLEY.a)) {
        rideHurts(ctx, x0, Y(TROLLEY.h + TROLLEY_H), tl.x - x0, TROLLEY_H, 14, 'm2:ct_trolley', { x: 8, y: -7 });
        rideHitsCast(ctx, x0, Y(TROLLEY.h + TROLLEY_H), tl.x - x0, TROLLEY_H, 70, x0, 'TROLLEYED!');
      }
    }
    zones.push({ x0: X(TROLLEY.a), x1: X(TROLLEY.b) + 40, y0: Y(TROLLEY.h + TROLLEY_H), y1: Y(TROLLEY.h - 4) });
  }
  setHazardZones(state, 'ct-kiddie-rides', zones);
  // The ball pits: him (spat back out where he last stood, hurt), and the cast (spat out dead)
  const k = kiddieOf(state);
  if (k.spat > 0) k.spat--;
  {
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const pit = PITS.find(([a, b]) => cx > X(a) && cx < X(b));
    if (pit && feet > GY + 30 && p.health > 0) {
      spray(state, cx, GY);
      envSound(state, cx, 'splat', 0.6, 10); playSound('boing', 0.6, -8);
      hurtPlayer(ctx, 12, 'm2:ct_ballpit', { x: 0, y: -4 });
      if (p.health > 0) { teleport(state, k.safe.x, k.safe.y); p.invincibilityTimer = Math.max(p.invincibilityTimer, 60); spray(state, k.safe.x, k.safe.y); k.spat = 30; }
    }
  }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || e.isBlownAway) continue;
    const ex = e.pos.x + e.width / 2;
    if (e.pos.y + e.height < GY + 30 || !PITS.some(([a, b]) => ex > X(a) && ex < X(b))) continue;
    spray(state, ex, GY);
    if (e.seen) hazardKill(ctx, e, ex, 'BALL PITTED!', { fling: { x: (Math.random() < 0.5 ? -1 : 1) * 4, y: -14 }, sound: 'boing' });
    // (never seen: spared, back where it was put)
    else { e.pos.x = e.homeX ?? e.pos.x; e.pos.y = e.homeY ?? Y(0) - e.height; e.vel.x = 0; e.vel.y = 0; }
  }
  updateThrows(ctx);
};
const BALLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'];
const spray = (state: GameState, x: number, y: number) => { for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: y - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 5 }, life: 34, color: BALLS[i % BALLS.length], size: 5, grav: 0.3 } as typeof state.particles[number]); };

/** Where he last stood safe (index.ts calls this every frame: on the ground or a ledge, not a tower, not in a ride). */
export const noteSafe = (state: GameState) => {
  const p = state.player, k = kiddieOf(state);
  if (!p.isGrounded || p.health <= 0 || p.inCutscene) return;
  if (k.towers.some(t => onTower(state, t))) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (PITS.some(([a, b]) => cx > X(a) - 30 && cx < X(b) + 30)) {
    // (at a pit's very edge: only the ledges up off it count, never the lip of it)
    if (Math.abs(feet - GY) < 4) return;
  }
  // (not on the trolley's track while the trolley's coming, not on the carousel's deck)
  if (Math.abs(feet - Y(TROLLEY.h)) < 4 && cx > X(TROLLEY.a) && cx < X(TROLLEY.b)) {
    const tl = trolleyAt(state.frame);
    if (tl.phase === 'run' && tl.x > cx - 520 && tl.x - TROLLEY_LEN < cx + 60) return;
    if (tl.phase === 'bell' && cx < X(TROLLEY.a) + 420) return;
  }
  if (Math.abs(feet - Y(CAROUSEL.deck)) < 4 && Math.abs(cx - X(CAROUSEL.cx)) < CAROUSEL.r + 30) return;
  k.safe.x = cx; k.safe.y = feet;
};

// ---------------------------------------------------------------------------------------------------------------
// What the cast throw

const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, k = kiddieOf(state), p = state.player;
  for (const s of k.throws) {
    s.t++;
    const owner = s.from, ownerUp = owner.health > 0 && state.enemies.includes(owner);
    if (s.kind === 'hat') {
      // (out: slowing; back: homing on his hand; the owner's gone: it drops)
      if (!ownerUp) { s.vy += 0.3; s.x += s.vx * 0.6; s.y += s.vy; const top = floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0); if ((top !== null && s.y >= top) || s.t > 260) s.dead = true; continue; }
      if (s.dir === 1) {
        s.vx -= Math.sign(s.vx) * 0.13; s.y += ((s.tx ?? s.y) - s.y) * 0.04;
        if (Math.abs(s.vx) < 0.3) s.dir = -1;
      } else {
        const hx = mid(owner).x, hy = owner.pos.y + 12, dx = hx - s.x, dy = hy - s.y, d = Math.hypot(dx, dy) || 1;
        const sp = Math.min(9, 3 + s.t * 0.04);
        s.vx = (dx / d) * sp; s.y += (dy / d) * sp;
        if (d < 14 || s.t > 240) { s.dead = true; continue; }
      }
      s.x += s.vx;
      if (s.t % 10 === 0) envSound(state, s.x, 'whirl', 0.15, 14);
      if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, s.x - 14, s.y - 16, 28, 26)) { hurtPlayer(ctx, 10, 'm2:ct_hat_shot', { x: Math.sign(s.vx || 1) * 6, y: -4 }); playSound('bonk', 0.6, 10); }
      continue;
    }
    if (s.kind === 'kite') {
      if (!ownerUp) { s.vy = Math.min(3, s.vy + 0.08); s.vx *= 0.98; s.x += s.vx + Math.sin(s.t * 0.1) * 0.8; s.y += s.vy; if (s.y > GY + 40 || s.t > 400) s.dead = true; s.phase = 'loose'; continue; }
      const f = owner.facing ?? 1, hx = mid(owner).x + f * 10, hy = owner.pos.y + 20;
      const home = { x: hx - f * 60 + Math.sin(state.frame * 0.03 + owner.initialX) * 24, y: hy - 160 + Math.sin(state.frame * 0.05 + owner.initialX) * 12 };
      if (s.phase === 'fly' || s.phase === 'tell') {
        s.x += (home.x - s.x) * 0.08; s.y += (home.y - s.y) * 0.08;
        if (s.phase === 'tell') {
          s.x += (s.t % 4 < 2 ? 3 : -3);
          if (s.t === 1) playSound('whoosh', 0.3, 18);
          if (s.t > 40) { s.phase = 'dive'; s.t = 0; s.tx = mid(p).x; s.ty = mid(p).y; playSound('whoosh', 0.6, 6); }
        }
      } else if (s.phase === 'dive') {
        const dx = (s.tx ?? s.x) - s.x, dy = (s.ty ?? s.y) - s.y, d = Math.hypot(dx, dy) || 1;
        s.x += (dx / d) * 7.5; s.y += (dy / d) * 7.5;
        if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, s.x - 14, s.y - 14, 28, 28)) hurtPlayer(ctx, 9, 'm2:ct_kite_shot', { x: Math.sign(dx || 1) * 5, y: -5 });
        const floor = floorTopAt(state.blocks, s.x, s.y - 8, 0);
        if (d < 10 || s.t > 60 || (floor !== null && s.y > floor - 6)) { s.phase = 'up'; s.t = 0; }
      } else {
        const dx = home.x - s.x, dy = home.y - s.y, d = Math.hypot(dx, dy) || 1;
        s.x += (dx / d) * Math.min(4.5, d); s.y += (dy / d) * Math.min(4.5, d);
        if (d < 10) { s.phase = 'fly'; s.t = 0; }
      }
      continue;
    }
    if (s.kind === 'splat') { if (s.t > 200) s.dead = true; continue; }
    // (paint: lobbed)
    s.vy += 0.3; s.x += s.vx; s.y += s.vy;
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, s.x - 6, s.y - 6, 12, 12)) {
      hurtPlayer(ctx, 7, 'm2:ct_paint_shot', { x: Math.sign(s.vx || 1) * 4, y: -3 });
      playSound('splat', 0.6, 6); s.dead = true; continue;
    }
    const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h);
    if ((top !== null && s.y >= top) || wall || s.t > 160) {
      s.dead = true;
      envSound(state, s.x, 'splat', 0.4, 8);
      if (top !== null && !wall) k.throws.push({ kind: 'splat', x: s.x, y: top, vx: 0, vy: 0, t: 0, from: s.from, phase: String((s.x | 0) % 5) });
    }
  }
  k.throws = k.throws.filter(s => !s.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space)

const BEASTS: { body: string; mane: string }[] = [
  { body: '#F9A8D4', mane: '#7C3AED' }, { body: '#FDE047', mane: '#EF4444' }, { body: '#86EFAC', mane: '#2563EB' },
  { body: '#93C5FD', mane: '#F97316' }, { body: '#FDBA74', mane: '#16A34A' }, { body: '#C4B5FD', mane: '#DB2777' },
];
/** One of the carousel's made-up beasts, its hooves at (x, y), facing `dir`; `dim` it's round the back. */
const beast = (c: Ctx, x: number, y: number, k: number, dir: number, dim: boolean, f: number) => {
  const B = BEASTS[k % BEASTS.length], T = dim ? dimmed : (col: string) => hour(col);
  const body = T(B.body), mane = T(B.mane);
  c.save(); c.translate(x, y); c.scale(dir, 1);
  const o = (cx: number, cy: number, rx: number, ry: number, col: string, a = 0) => { c.fillStyle = INK; c.beginPath(); c.ellipse(cx, cy, rx + 2, ry + 2, a, 0, Math.PI * 2); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, a, 0, Math.PI * 2); c.fill(); };
  const legs = (k % 2) ? 2 : 4;
  for (let i = 0; i < legs; i++) { const lx = -14 + i * (28 / Math.max(1, legs - 1)); box(c, lx - 3, -16, 6, 16, INK); box(c, lx - 2, -15, 4, 14, mix(body, INK, 0.2)); }
  // (each a different nonsense animal: a long neck, a trunk, a hump, a tuft...)
  o(0, -26, 22, 13, body);
  c.fillStyle = mix(body, '#FFFFFF', 0.4); c.beginPath(); c.ellipse(-6, -31, 10, 4, 0, 0, Math.PI * 2); c.fill();
  if (k % 3 === 0) { c.strokeStyle = INK; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, -30); c.quadraticCurveTo(30, -48, 22, -62); c.stroke(); c.strokeStyle = body; c.lineWidth = 6; c.stroke(); o(24, -64, 9, 7, body); }
  else if (k % 3 === 1) { o(22, -34, 11, 10, body); c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(30, -32); c.quadraticCurveTo(40, -24, 36, -14); c.stroke(); c.strokeStyle = body; c.lineWidth = 3.5; c.stroke(); }
  else { o(20, -40, 10, 12, body); o(-4, -40, 9, 7, mane); }
  // (the mane: a tuft of curls; a striped tail)
  const hx = k % 3 === 0 ? 24 : k % 3 === 1 ? 22 : 20, hy = k % 3 === 0 ? -64 : k % 3 === 1 ? -34 : -40;
  for (let i = 0; i < 3; i++) o(hx - 6 + i * 4, hy - 8 - (i % 2) * 3, 3.5, 3.5, mane);
  box(c, hx + 1, hy - 2, 3, 3, INK);
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(-20, -28); c.quadraticCurveTo(-34, -36 + Math.sin(f * 0.2 + k) * 3, -30, -48); c.stroke(); c.strokeStyle = mane; c.lineWidth = 2.5; c.stroke();
  // (the saddle, a gold rosette)
  o(-2, -38, 9, 4, T('#DC2626')); box(c, -3, -40, 3, 3, T('#FDE047'));
  c.restore();
};
/** A fiberglass fish car, its middle at (x, y), facing `dir`, kids in it; `dim` round the back. */
const fishCar = (c: Ctx, x: number, y: number, k: number, dir: number, dim: boolean, f: number) => {
  const cols = ['#F87171', '#60A5FA', '#FBBF24', '#34D399'], T = dim ? dimmed : (col: string) => hour(col);
  const body = T(cols[k % 4]);
  c.save(); c.translate(x, y); c.scale(dir, 1);
  // (tail, body, fins, eye, the seat dished in its back with two kids)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-28, 0); c.lineTo(-44, -14); c.lineTo(-42, 14); c.closePath(); c.fill();
  c.fillStyle = mix(body, INK, 0.2); c.beginPath(); c.moveTo(-28, 0); c.lineTo(-41, -11); c.lineTo(-40, 11); c.closePath(); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 33, 18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = body; c.beginPath(); c.ellipse(0, 0, 31, 16, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(body, '#FFFFFF', 0.4); c.beginPath(); c.ellipse(-4, -7, 18, 4, 0, 0, Math.PI * 2); c.fill();
  for (let i = -16; i < 18; i += 8) { c.strokeStyle = mix(body, INK, 0.3); c.lineWidth = 1.5; c.beginPath(); c.arc(i, 2, 5, -0.5, 0.9); c.stroke(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(20, -4, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(22, -4, 3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(28, 4, 4, 0.2, 1.8); c.stroke();
  // (two kids, arms up, mouths open)
  for (const [kx, sk] of [[-10, '#F0C8A2'], [4, '#8D5A3B']] as [number, string][]) {
    c.fillStyle = INK; c.beginPath(); c.arc(kx, -18, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = dim ? dimmed(sk) : sk; c.beginPath(); c.arc(kx, -18, 4.8, 0, Math.PI * 2); c.fill();
    box(c, kx - 1, -16, 3, 3, INK);
    if ((f >> 4) % 2) { box(c, kx - 6, -30, 2, 9, INK); box(c, kx + 4, -30, 2, 9, INK); }
  }
  c.restore();
};

/** Behind him: the carousel's deck and canopy and the beasts round its back, the spinner's hub and its back fish,
 *  the train's track, rails and the back pass behind its hedges, the trolley's track on its curly posts. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The carousel
  const cx = X(CAROUSEL.cx), r = CAROUSEL.r, deck = Y(CAROUSEL.deck), can = Y(CAROUSEL.canopy);
  if (onScreen(state, cx - r - 60, cx + r + 60)) {
    // (the center column: mirrored panels, a band organ's pipes)
    box(c, cx - 36, can, 72, deck - can, INK); box(c, cx - 33, can, 66, deck - can, hour('#7C3AED'));
    for (let i = 0; i < 6; i++) { box(c, cx - 28 + i * 10, can + 60, 7, 70 + (i % 3) * 10, hour('#FDE047')); box(c, cx - 28 + i * 10, can + 60, 2, 70 + (i % 3) * 10, '#FFFBEB'); }
    for (let i = 0; i < 4; i++) { box(c, cx - 30, can + 150 + i * 14, 60, 8, hour('#BAE6FD')); }
    // (the beasts round the back, dim, on their poles)
    for (const b of beasts(f)) if (!b.front || b.depth < 0.25) {
      const hy = deck - 14 - b.bob;
      box(c, b.x - 1.5, can + 30, 3, deck - can - 30, dimmed('#FDE047'));
      beast(c, b.x, hy, b.k, -1, true, f);
    }
    // (the deck: a fat round platform, its lit top lip, a skirt with lights)
    c.fillStyle = INK; c.beginPath(); c.ellipse(cx, deck + 8, r + 24, 18, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour('#F472B6'); c.beginPath(); c.ellipse(cx, deck + 8, r + 21, 15, 0, 0, Math.PI * 2); c.fill();
    box(c, cx - r - 20, deck, (r + 20) * 2, 3, '#FFF1F2');
    for (let i = 0; i < 18; i++) { const lx = cx - r + i * ((r * 2) / 17); c.fillStyle = (f >> 4) % 2 === i % 2 ? '#FEF08A' : '#FDA4AF'; c.beginPath(); c.arc(lx, deck + 16, 2.5, 0, Math.PI * 2); c.fill(); }
    // (the canopy: a scalloped big top, striped, lit along its top lip (stand on it), the rounding board's name)
    const top = can;
    c.fillStyle = INK; c.beginPath(); c.moveTo(cx - r - 34, top + 2); c.quadraticCurveTo(cx, top - 70, cx + r + 34, top + 2); c.closePath(); c.fill();
    for (let i = 0; i < 10; i++) { const a0 = cx - r - 30 + i * ((r + 30) * 2 / 10); c.fillStyle = hour(i % 2 ? '#FFF7E8' : '#EC4899'); c.beginPath(); c.moveTo(a0, top); c.lineTo(cx, top - 62); c.lineTo(a0 + (r + 30) * 2 / 10, top); c.closePath(); c.fill(); }
    box(c, cx - r - 32, top, (r + 32) * 2, 26, INK); box(c, cx - r - 30, top + 2, (r + 30) * 2, 22, hour('#7C3AED'));
    for (let i = 0; i < 12; i++) { const sx = cx - r - 30 + i * ((r + 30) * 2 / 12); c.fillStyle = INK; c.beginPath(); c.arc(sx + (r + 30) / 12, top + 24, (r + 30) / 12 + 1, 0, Math.PI); c.fill(); c.fillStyle = hour(i % 2 ? '#FDE047' : '#F472B6'); c.beginPath(); c.arc(sx + (r + 30) / 12, top + 24, (r + 30) / 12 - 1, 0, Math.PI); c.fill(); }
    box(c, cx - r - 30, top, (r + 30) * 2, 3, '#FFFBEB');
    signText(c, 'THE WUMPLE-GO-ROUND', cx, top + 19, toonLetters(1));
    // (a flag on top)
    box(c, cx - 1, top - 90, 3, 30, INK); c.fillStyle = hour('#22C55E'); c.beginPath(); c.moveTo(cx + 2, top - 90); c.lineTo(cx + 22 + Math.sin(f * 0.1) * 3, top - 84); c.lineTo(cx + 2, top - 78); c.fill();
  }
  // The spinner: the hub (a fat striped column, a fish bowl on top with a goldfish in it), the back fish
  const sx = X(SPINNER.cx);
  if (onScreen(state, sx - SPINNER.r - 80, sx + SPINNER.r + 80)) {
    for (const fi of fishes(f)) if (!fi.front || fi.depth < 0.25) {
      c.strokeStyle = dimmed('#94A3B8'); c.lineWidth = 4; c.beginPath(); c.moveTo(sx, Y(SPINNER.hi + 60)); c.lineTo(fi.x, Y(fi.h) - 10); c.stroke();
      fishCar(c, fi.x, Y(fi.h), fi.k, Math.cos(fi.a) > 0 ? 1 : -1, true, f);
    }
    box(c, sx - 26, Y(SPINNER.hi + 70), 52, SPINNER.hi + 70, INK);
    for (let y = Y(SPINNER.hi + 68); y < GY; y += 16) box(c, sx - 23, y, 46, 8, hour('#38BDF8'));
    for (let y = Y(SPINNER.hi + 60); y < GY; y += 16) box(c, sx - 23, y, 46, 8, hour('#FFF7E8'));
    const by = Y(SPINNER.hi + 100);
    c.fillStyle = INK; c.beginPath(); c.arc(sx, by, 42, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour('#BAE6FD'); c.beginPath(); c.arc(sx, by, 39, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour('#38BDF8'); c.beginPath(); c.arc(sx, by, 39, 0.15 * Math.PI, 0.85 * Math.PI); c.fill();
    const gx = sx + Math.sin(f * 0.03) * 16;
    c.fillStyle = hour('#FB923C'); c.beginPath(); c.ellipse(gx, by + 10, 10, 6, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(gx - 9, by + 10); c.lineTo(gx - 16, by + 4); c.lineTo(gx - 16, by + 16); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(sx - 16, by - 18, 9, 5, -0.5, 0, Math.PI * 2); c.fill();
    // (its name on a wavy banner over the bowl, held up on two poles)
    for (const px of [sx - 92, sx + 92]) { box(c, px - 2, by - 70, 4, 50, INK); box(c, px - 1, by - 70, 2, 50, hour('#FDE047')); }
    c.fillStyle = INK; c.beginPath(); c.roundRect(sx - 100, by - 86, 200, 22, 8); c.fill();
    c.fillStyle = hour('#0EA5E9'); c.beginPath(); c.roundRect(sx - 98, by - 84, 196, 18, 7); c.fill();
    signText(c, 'THE WISH-FISH SPINNER', sx, by - 71, toonLetters(1));
  }
  // The train: the track (sleepers and rails along the ground), the back pass behind its hedge row
  const ta = X(TRAIN.a), tb = X(TRAIN.b);
  if (onScreen(state, ta - 80, tb + 80)) {
    const tr = trainAt(f);
    if (tr.phase === 'back') { c.save(); c.beginPath(); c.rect(ta - 30, GY - 220, tb - ta + 60, 230); c.clip(); drawTrain(c, tr.x, Y(26), 1, true, f, 0.75); c.restore(); }
    // (the hedge row it goes round behind)
    for (let x = ta - 60; x < tb + 60; x += 34) { c.fillStyle = INK; c.beginPath(); c.arc(x, Y(30), 22, Math.PI, 0); c.fill(); c.fillStyle = dimmed('#4ADE80'); c.beginPath(); c.arc(x, Y(30), 20, Math.PI, 0); c.fill(); }
    box(c, ta - 80, Y(30), tb - ta + 160, 30, dimmed('#4ADE80'));
    for (let x = ta - 40; x < tb + 40; x += 22) box(c, x, GY - 6, 14, 6, hour('#92400E'));
    box(c, ta - 40, GY - 8, tb - ta + 80, 2, hour('#94A3B8')); box(c, ta - 40, GY - 3, tb - ta + 80, 2, hour('#94A3B8'));
    // (the front pass (on the track, behind him: he's on the path in front of the track), and the topiary hedges at the
    // track's ends it comes out from behind and goes round)
    if (tr.phase === 'front') { c.save(); c.beginPath(); c.rect(ta - 30, GY - 220, tb - ta + 60, 230); c.clip(); drawTrain(c, tr.x, GY, -1, false, f); c.restore(); }
    for (const hx of [ta - 50, tb + 50]) {
      for (const [dx, dy, r] of HEDGE) { c.fillStyle = INK; c.beginPath(); c.arc(hx + dx, GY + dy, r + 3, 0, Math.PI * 2); c.fill(); }
      for (const [dx, dy, r] of HEDGE) { c.fillStyle = hour('#22C55E'); c.beginPath(); c.arc(hx + dx, GY + dy, r, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = hour('#86EFAC'); c.beginPath(); c.arc(hx - 22, GY - 50, 10, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 5; i++) { c.fillStyle = ['#F472B6', '#FDE047', '#FFFFFF'][i % 3]; c.beginPath(); c.arc(hx - 40 + i * 20, GY - 30 - (i % 2) * 18, 3, 0, Math.PI * 2); c.fill(); }
    }
  }
  // The trolley's track: a beam on curly posts out over the pit (its top's the lit lip he walks on), the end station
  const ra = X(TROLLEY.a), rb = X(TROLLEY.b), ry = Y(TROLLEY.h);
  if (onScreen(state, ra - 60, rb + 200)) {
    for (let x = ra + 120; x < rb; x += 260) {
      c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 12; c.beginPath(); c.moveTo(x, GY + 20); c.bezierCurveTo(x - 20, ry + 120, x + 20, ry + 60, x, ry + 10); c.stroke();
      c.strokeStyle = hour('#A78BFA'); c.lineWidth = 7; c.stroke();
    }
    // (the end station: a little domed hut on stilts, behind)
    const ex = rb + 20;
    box(c, ex - 4, ry - 120, 140, 130, INK); box(c, ex, ry - 116, 132, 122, dimmed('#FDE68A'));
    c.fillStyle = INK; c.beginPath(); c.arc(ex + 66, ry - 116, 72, Math.PI, 0); c.fill(); c.fillStyle = dimmed('#F472B6'); c.beginPath(); c.arc(ex + 66, ry - 116, 68, Math.PI, 0); c.fill();
    box(c, ex - 6, ry - 92, 40, 92, '#1A1028');
  }
};

/** A topiary hedge's lumps: [dx, dy, r] about its foot. */
const HEDGE: [number, number, number][] = [[-40, -20, 24], [-14, -40, 30], [16, -34, 28], [42, -18, 22], [0, -14, 30]];
/** The train: its engine's nose at x (going left, or right `back`), sitting on y; scaled `k`. */
const drawTrain = (c: Ctx, x: number, y: number, dir: number, dim: boolean, f: number, k = 1) => {
  const T = dim ? dimmed : (col: string) => hour(col);
  c.save(); c.translate(x, y); c.scale(k * (dir > 0 ? -1 : 1), k);
  // (the engine: a fat boiler with a face, a funnel stack, the cab; three cars of screaming kids)
  const wheel = (wx: number) => { c.fillStyle = INK; c.beginPath(); c.arc(wx, -8, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = T('#EF4444'); c.beginPath(); c.arc(wx, -8, 7, 0, Math.PI * 2); c.fill(); const a = f * 0.2; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(wx + Math.cos(a) * 6, -8 + Math.sin(a) * 6); c.lineTo(wx - Math.cos(a) * 6, -8 - Math.sin(a) * 6); c.stroke(); };
  c.fillStyle = INK; c.beginPath(); c.roundRect(0, -46, 74, 40, 12); c.fill();
  c.fillStyle = T('#3B82F6'); c.beginPath(); c.roundRect(2, -44, 70, 36, 10); c.fill();
  c.fillStyle = INK; c.beginPath(); c.arc(8, -26, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = T('#FDE047'); c.beginPath(); c.arc(8, -26, 14, 0, Math.PI * 2); c.fill();
  box(c, 2, -31, 4, 4, INK); box(c, 10, -31, 4, 4, INK); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(8, -24, 6, 0.3, Math.PI - 0.3); c.stroke();
  c.fillStyle = INK; c.beginPath(); c.moveTo(20, -46); c.lineTo(16, -70); c.lineTo(36, -70); c.lineTo(32, -46); c.closePath(); c.fill();
  c.fillStyle = T('#EF4444'); c.beginPath(); c.moveTo(22, -47); c.lineTo(18, -68); c.lineTo(34, -68); c.lineTo(30, -47); c.closePath(); c.fill();
  box(c, 46, -62, 28, 20, INK); box(c, 48, -60, 24, 16, T('#F472B6'));
  wheel(18); wheel(54);
  for (let i = 0; i < 3; i++) {
    const cx = 80 + i * 74;
    box(c, cx, -34, 68, 28, INK); box(c, cx + 2, -32, 64, 24, T(['#22C55E', '#F97316', '#A855F7'][i]));
    for (let j = 0; j < 3; j++) {
      const kx = cx + 12 + j * 20, sk = ['#F6DCC8', '#A86B43', '#F0C8A2', '#6E4426'][(i + j) % 4];
      c.fillStyle = INK; c.beginPath(); c.arc(kx, -40, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = T(sk); c.beginPath(); c.arc(kx, -40, 4.8, 0, Math.PI * 2); c.fill();
      box(c, kx - 1, -38, 3, 3, INK);
      if (((f >> 3) + j + i) % 3 === 0) { box(c, kx - 6, -52, 2, 9, INK); box(c, kx + 4, -52, 2, 9, INK); }
    }
    wheel(cx + 14); wheel(cx + 54);
  }
  c.restore();
};

/** In front: the carousel's front beasts on their poles, the spinner's front fish, the trolley, the ball pits' near
 *  lip, what the cast throw. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const f = state.frame, k = kiddieOf(state);
  // The carousel's front beasts
  const cx = X(CAROUSEL.cx), deck = Y(CAROUSEL.deck), can = Y(CAROUSEL.canopy);
  if (onScreen(state, cx - CAROUSEL.r - 60, cx + CAROUSEL.r + 60)) {
    for (const b of beasts(f).filter(b => b.front && b.depth >= 0.25).sort((a, b) => a.depth - b.depth)) {
      box(c, b.x - 2.5, can + 26, 5, deck - can - 26, INK); box(c, b.x - 1.5, can + 26, 3, deck - can - 26, hour('#FDE047'));
      beast(c, b.x, deck - 14 - b.bob, b.k, -1, false, f);
    }
  }
  // The spinner's front fish, on their arms
  const sx = X(SPINNER.cx);
  if (onScreen(state, sx - SPINNER.r - 80, sx + SPINNER.r + 80)) {
    for (const fi of fishes(f).filter(fi => fi.front && fi.depth >= 0.25).sort((a, b) => a.depth - b.depth)) {
      c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(sx, Y(SPINNER.hi + 60)); c.lineTo(fi.x, Y(fi.h) - 10); c.stroke();
      c.strokeStyle = hour('#CBD5E1'); c.lineWidth = 3; c.stroke();
      fishCar(c, fi.x, Y(fi.h), fi.k, Math.cos(fi.a) > 0 ? -1 : 1, false, f);
    }
  }
  // The trolley (out of the hattery's wall, into the end station)
  const tl = trolleyAt(f), ra = X(TROLLEY.a), rb = X(TROLLEY.b), ry = Y(TROLLEY.h);
  if (onScreen(state, ra - 200, rb + 200)) {
    // (the hattery's arch: the bell's lamp over it flashing while it rings)
    const lampOn = tl.phase === 'bell' && (tl.t >> 3) % 2 === 0;
    c.fillStyle = INK; c.beginPath(); c.arc(ra - 2, ry - TROLLEY_H - 14, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = lampOn ? '#FDE047' : hour('#92400E'); c.beginPath(); c.arc(ra - 2, ry - TROLLEY_H - 14, 7, 0, Math.PI * 2); c.fill();
    if (lampOn) { c.fillStyle = 'rgba(253,224,71,0.25)'; c.beginPath(); c.arc(ra - 2, ry - TROLLEY_H - 14, 24, 0, Math.PI * 2); c.fill(); }
    if (tl.phase === 'run') {
      c.save(); c.beginPath(); c.rect(ra, ry - 200, rb - ra + 60, 220); c.clip();
      const x0 = tl.x - TROLLEY_LEN;
      // (a curly little tram: a striped awning roof, round windows with grown-ups waving, a bell, a cowcatcher)
      c.fillStyle = INK; c.beginPath(); c.roundRect(x0, ry - TROLLEY_H, TROLLEY_LEN, TROLLEY_H - 6, 14); c.fill();
      c.fillStyle = hour('#FB7185'); c.beginPath(); c.roundRect(x0 + 3, ry - TROLLEY_H + 3, TROLLEY_LEN - 6, TROLLEY_H - 12, 12); c.fill();
      for (let i = 0; i < 9; i++) box(c, x0 + 6 + i * 18, ry - TROLLEY_H - 6, 9, 10, hour(i % 2 ? '#FFF7E8' : '#22C55E'));
      box(c, x0, ry - TROLLEY_H - 8, TROLLEY_LEN, 3, INK);
      for (let i = 0; i < 4; i++) {
        const wx = x0 + 28 + i * 38;
        c.fillStyle = INK; c.beginPath(); c.arc(wx, ry - 48, 13, 0, Math.PI * 2); c.fill();
        c.fillStyle = hour('#BAE6FD'); c.beginPath(); c.arc(wx, ry - 48, 11, 0, Math.PI * 2); c.fill();
        c.fillStyle = hour(['#F6DCC8', '#A86B43', '#F0C8A2', '#6E4426'][i]); c.beginPath(); c.arc(wx, ry - 46, 6, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = INK; c.beginPath(); c.moveTo(tl.x, ry - 30); c.lineTo(tl.x + 16, ry - 4); c.lineTo(tl.x, ry - 4); c.closePath(); c.fill();
      c.fillStyle = hour('#FDE047'); c.beginPath(); c.arc(tl.x - 8, ry - 60, 6, 0, Math.PI * 2); c.fill();
      for (const wx of [x0 + 24, tl.x - 24]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, ry - 4, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#94A3B8'); c.beginPath(); c.arc(wx, ry - 4, 6, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
  }
  // The ball pits: the near lip of the balls (over his feet as he goes in)
  for (const [a, b] of PITS) {
    if (!onScreen(state, X(a), X(b))) continue;
    for (let x = X(a) + 6; x < X(b) - 4; x += 13) { const col = BALLS[Math.abs(Math.floor(x / 13)) % BALLS.length]; c.fillStyle = INK; c.beginPath(); c.arc(x, GY + 14, 7.5, 0, Math.PI * 2); c.fill(); c.fillStyle = hour(col); c.beginPath(); c.arc(x, GY + 14, 6, 0, Math.PI * 2); c.fill(); box(c, x - 3, GY + 10, 2, 2, '#FFFFFF'); }
  }
  // What's thrown
  for (const s of k.throws) {
    if (s.kind === 'hat') {
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.45);
      box(c, -15, -2, 30, 5, INK); box(c, -14, -1, 28, 3, '#F8F4EC');
      box(c, -9, -24, 18, 23, INK); box(c, -8, -23, 16, 22, '#F8F4EC'); for (let i = 0; i < 3; i++) box(c, -8, -20 + i * 7, 16, 3, '#14B8A6');
      c.restore();
    } else if (s.kind === 'kite') {
      const o = s.from, hx = mid(o).x + (o.facing ?? 1) * 10, hy = o.pos.y + 20;
      if (s.phase !== 'loose') { c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo((hx + s.x) / 2 - 20, (hy + s.y) / 2 + 30, s.x, s.y + 12); c.stroke(); }
      const shake = s.phase === 'tell' ? Math.sin(f * 1.2) * 0.3 : 0, a = s.phase === 'dive' ? Math.atan2((s.ty ?? s.y) - s.y, (s.tx ?? s.x) - s.x) - Math.PI / 2 : shake;
      c.save(); c.translate(s.x, s.y); c.rotate(a);
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, -16); c.lineTo(13, 0); c.lineTo(0, 16); c.lineTo(-13, 0); c.closePath(); c.fill();
      c.fillStyle = (o.variant ?? 1) === 2 ? '#3B82F6' : '#DC2626'; c.beginPath(); c.moveTo(0, -14); c.lineTo(11, 0); c.lineTo(0, 14); c.lineTo(-11, 0); c.closePath(); c.fill();
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(0, -14); c.lineTo(11, 0); c.lineTo(0, 0); c.closePath(); c.fill();
      for (let i = 0; i < 4; i++) { c.fillStyle = ['#FDE047', '#F472B6'][i % 2]; c.fillRect(-2 + Math.sin(f * 0.3 + i) * 3, 16 + i * 6, 5, 3); }
      c.restore();
    } else if (s.kind === 'paint') {
      const col = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'][(s.from.initialX | 0) % 5 >= 0 ? (s.from.initialX | 0) % 5 : 0];
      c.fillStyle = INK; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(s.x, s.y, 4.5, 0, Math.PI * 2); c.fill();
    } else {
      const col = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'][Number(s.phase) || 0], a = Math.max(0, 1 - Math.max(0, s.t - 150) / 50);
      c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.ellipse(s.x, s.y - 1, 14, 3, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(s.x + 9, s.y - 2, 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    }
  }
};
