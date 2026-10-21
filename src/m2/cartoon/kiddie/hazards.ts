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
//   THE BALL PITS: bottomless (LAST KID FOUND 1997). Into one and it bounces him back out onto the bank, a dirty needle
//     stuck in his ass (cartoon/pitBounce.ts); the cast it bounces out too, hurt (the little ones dead).
//   What the cast throw: the hat cat's hat (out, and back), the Whatsits' kites (on their strings: a shake, a dive at
//     him, back up), the painter's paint blobs (they splat).
//
// THE REVISIT (state.ts shut(): back through after the studio): the rides are shut down for the day. The carousel
// stopped dead, its lights off, a CLOSED board hung off its rounding board; the fish all down, a CLOSED FOR THE DAY
// board by the bowl (the goldfish belly up); the train parked behind its hedges, empty, NO MORE TRAINS TODAY; the
// trolley put away in the hattery (the shutter down across its arch, OUT OF SERVICE, the lamp dark). Nothing runs, so
// nothing hurts; the pits and the cast are as ever.
//
// Drawn at peak SNES: every beast, fish, car and kid in stepped ramps, brass poles twisted and lit, the deck's and the
// canopy's round tops going back to the eye, the bowl's water banded, the hedges clipped topiary in steps.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { mid } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { updatePitBounce } from '../pitBounce';
import {
  box, mix, onScreen, hour, dimmed, lit, toonLetters, INK, viewOf, drumTop, ballR, eggR, ramp6, rampH, polyF, candyStroke, shadeAcross, checker,
  toonSign, BRASS, FROSTING, LILAC, BUBBLEGUM, CHERRY, LEMON, SKY, STEEL, GRASS, LIP, MINT, type Ctx,
} from '../kit';
import { signText } from '../../signLetters';
import { lookOf } from '../../adventure/temple/people';
import { kiddieOf, shut } from './state';
import { onTower } from '../sway';
import { CAROUSEL, SPINNER, TRAIN, TROLLEY, PITS, SIGNS, X, Y } from './layout';
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
/** The frame the rides stopped at for the day (the revisit). */
const PARKED = 40;
/** The carousel's beasts: x, how high their hooves are, front (on the play plane) or not. */
export const beasts = (f: number) => Array.from({ length: CAR_N }, (_, k) => {
  const a = f * CAR_SPEED + (k / CAR_N) * Math.PI * 2;
  return { k, a, x: X(CAROUSEL.cx) + Math.cos(a) * CAROUSEL.r, front: Math.sin(a) > 0, depth: Math.sin(a), bob: Math.sin(f * 0.05 + k * 1.3) * 10 };
});
const FISH_SPEED = 0.016, FISH_N = 4;
export const fishes = (f: number, parked = false) => Array.from({ length: FISH_N }, (_, k) => {
  const a = (parked ? PARKED : f) * FISH_SPEED + (k / FISH_N) * Math.PI * 2;
  const h = parked ? SPINNER.lo : SPINNER.lo + (SPINNER.hi - SPINNER.lo) * (0.5 + 0.5 * Math.sin(f * 0.011 + k * 1.7));
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
  // (on till its tail's gone in through the end station's doorway: it goes right in, out of sight)
  if (x - TROLLEY_LEN < DOOR_R) return { phase: 'run' as const, x, t };
  return { phase: 'gone' as const, x: 0, t };
};
/** The end station's doorway (the tunnel mouth the trolley runs into): its left and right edges. */
const DOOR_L = X(TROLLEY.b) + 14, DOOR_R = X(TROLLEY.b) + 54;
/** The trolley's roof: a one-way ledge that rides along with it (he can ride it), off out of the way when it's not
 *  running. Its top's the roof's flat lit top. */
const ROOF_UP = TROLLEY_H + 9;
const roofs = new WeakMap<object, Block>();
const roofOf = (state: GameState) => {
  let b = roofs.get(state.blocks);
  if (!b || !state.blocks.includes(b)) {
    b = { x: 0, y: -99999, w: 0, h: 12, type: 'platform', oneWay: true, hidden: true, tag: 'ct-trolley-roof' } as Block;
    state.blocks.push(b); roofs.set(state.blocks, b);
  }
  return b;
};
/** The roof to where the trolley is now (before he moves), carrying him if he's on it. */
const updateRoof = (state: GameState, off: boolean) => {
  const b = roofOf(state), p = state.player, tl = trolleyAt(state.frame);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const on = b.y > -9999 && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - b.y) <= 3 && cx >= b.x - 4 && cx <= b.x + b.w + 4;
  if (off || tl.phase !== 'run') { b.y = -99999; b.w = 0; return; }
  // (only what's out: from the hattery's wall to the end station's doorway)
  const l = Math.max(X(TROLLEY.a), tl.x - TROLLEY_LEN + 4), r = Math.min(DOOR_L, tl.x - 2);
  if (r - l < 8) { b.y = -99999; b.w = 0; return; }
  if (on) { const prev = trolleyAt(state.frame - 1); if (prev.phase === 'run') p.pos.x += tl.x - prev.x; }
  b.x = l; b.w = r - l; b.y = Y(TROLLEY.h) - ROOF_UP;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, f = state.frame, off = shut(state);
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // The carousel
  {
    const deck = Y(CAROUSEL.deck);
    if (!off) for (const b of beasts(f)) {
      if (!b.front || b.depth < 0.25) continue;
      const y = deck - 14 - b.bob - 56;
      // (they come at him: knocked the way they're going)
      rideHurts(ctx, b.x - 26, y, 52, 58, 10, 'm2:ct_carousel', { x: -7, y: -6 });
      rideHitsCast(ctx, b.x - 26, y, 52, 58, 45, b.x + 30, 'GO-ROUNDED!');
    }
    zones.push({ x0: X(CAROUSEL.cx - CAROUSEL.r - 40), x1: X(CAROUSEL.cx + CAROUSEL.r + 40), y0: Y(CAROUSEL.deck + 100), y1: GY });
  }
  // The spinner
  if (!off) for (const fi of fishes(f)) {
    if (!fi.front || fi.depth < 0.25) continue;
    const y = Y(fi.h) - 18;
    rideHurts(ctx, fi.x - 32, y, 64, 34, 11, 'm2:ct_fish', { x: -6, y: -6 });
    rideHitsCast(ctx, fi.x - 32, y, 64, 34, 45, fi.x + 30, 'GONE FISHING!');
  }
  zones.push({ x0: X(SPINNER.cx - SPINNER.r - 50), x1: X(SPINNER.cx + SPINNER.r + 50), y0: Y(SPINNER.hi + 40), y1: GY });
  // The train
  if (!off) {
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
  }
  zones.push({ x0: X(TRAIN.a) - 20, x1: X(TRAIN.b) + 20, y0: Y(TRAIN_H + 20), y1: GY });
  // The trolley
  updateRoof(state, off);
  if (!off) {
    const tl = trolleyAt(f);
    if (tl.phase === 'bell' && tl.t % 30 === 0) envSound(state, X(TROLLEY.a), 'ding', 0.55, 6);
    if (tl.phase === 'run') {
      if (tl.t % 50 === 0) envSound(state, tl.x, 'ding', 0.35, 6);
      // (its front hits: the cowcatcher and the cab's nose. Its roof he can ride, so nothing up there hurts)
      const x0 = Math.max(X(TROLLEY.a), tl.x - 48), x1 = Math.min(tl.x + 14, DOOR_L);
      if (x1 > x0) {
        rideHurts(ctx, x0, Y(TROLLEY.h + TROLLEY_H - 6), x1 - x0, TROLLEY_H - 6, 14, 'm2:ct_trolley', { x: 8, y: -7 });
        rideHitsCast(ctx, x0, Y(TROLLEY.h + TROLLEY_H - 6), x1 - x0, TROLLEY_H - 6, 70, x0, 'TROLLEYED!');
      }
    }
  }
  zones.push({ x0: X(TROLLEY.a), x1: X(TROLLEY.b) + 40, y0: Y(TROLLEY.h + TROLLEY_H), y1: Y(TROLLEY.h - 4) });
  setHazardZones(state, 'ct-kiddie-rides', zones);
  // The ball pits: him and the cast, bounced back out
  const k = kiddieOf(state);
  if (k.spat > 0) k.spat--;
  // (in, and the pit bounces him back out onto the bank, a dirty needle in his ass: cartoon/pitBounce.ts)
  updatePitBounce(ctx, {
    pits: PIT_SPANS, safe: k.safe, stuff: () => ({ kind: 'balls', colors: BALLS }),
    splash: (x, y) => spray(state, x, y),
    plunge: x => { envSound(state, x, 'splat', 0.6, 10); playSound('boing', 0.6, -8); },
    call: () => 'BALL PITTED!',
  });
  updateThrows(ctx);
};
const PIT_SPANS = PITS.map(([a, b]) => [X(a), X(b)] as [number, number]);
const BALLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'];
const spray = (state: GameState, x: number, y: number) => { for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: y - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 5 }, life: 34, color: BALLS[i % BALLS.length], size: 5, grav: 0.3 } as typeof state.particles[number]); };

/** Where he last stood safe (index.ts calls this every frame: on the ground or a ledge, not a tower, not in a ride). */
export const noteSafe = (state: GameState) => {
  const p = state.player, k = kiddieOf(state);
  if (!p.isGrounded || p.health <= 0 || p.inCutscene) return;
  if (k.towers.some(t => onTower(state, t))) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // (nor riding the trolley's roof)
  { const r = roofOf(state); if (r.y > -9999 && Math.abs(feet - r.y) < 4 && cx > r.x - 6 && cx < r.x + r.w + 6) return; }
  if (PITS.some(([a, b]) => cx > X(a) - 30 && cx < X(b) + 30)) {
    // (at a pit's very edge: only the ledges up off it count, never the lip of it)
    if (Math.abs(feet - GY) < 4) return;
  }
  // (not on the trolley's track while the trolley's coming, not on the carousel's deck)
  if (!shut(state) && Math.abs(feet - Y(TROLLEY.h)) < 4 && cx > X(TROLLEY.a) && cx < X(TROLLEY.b)) {
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

const BEASTS: { body: string; mane: string; name: string }[] = [
  { body: '#F9A8D4', mane: '#7C3AED', name: 'zizzle-horn' }, { body: '#FDE047', mane: '#EF4444', name: 'floofalump' }, { body: '#86EFAC', mane: '#2563EB', name: 'snerg' },
  { body: '#93C5FD', mane: '#F97316', name: 'grickle' }, { body: '#FDBA74', mane: '#16A34A', name: 'wuzzle' }, { body: '#C4B5FD', mane: '#DB2777', name: 'plonk' },
];
/** One of the carousel's made-up beasts, its hooves at (x, y), facing `dir`; `dim` it's round the back. In steps: a
 *  fat body lit along its back, the shade under its belly, its legs stepped, the head of whatever nonsense it is, a
 *  curly mane in tufts, a saddle with its gilt rosette and stirrup. */
const beast = (c: Ctx, x: number, y: number, k: number, dir: number, dim: boolean, f: number) => {
  const B = BEASTS[k % BEASTS.length], T = dim ? dimmed : (col: string) => hour(col);
  const R = ramp6(T(B.body)), M = ramp6(T(B.mane)), Gd = ramp6(T(BRASS[3])), Sd = ramp6(T('#DC2626'));
  c.save(); c.translate(x, y); c.scale(dir, 1);
  // (legs: two or four, stepped, hooves)
  const legs = (k % 2) ? 2 : 4;
  for (let i = 0; i < legs; i++) { const lx = -14 + i * (28 / Math.max(1, legs - 1)), back = i % 2 === 0; box(c, lx - 3.5, -18, 7, 18, INK); box(c, lx - 2.5, -17, 5, 15, back ? R[2] : R[3]); box(c, lx - 2.5, -17, 1, 15, back ? R[3] : R[4]); box(c, lx + 1.5, -17, 1, 15, R[1]); box(c, lx - 3, -4, 6, 4, M[1]); box(c, lx - 2, -4, 2, 1, M[3]); }
  // (the body)
  eggR(c, 0, -27, 22, 13, R);
  box(c, -14, -17, 26, 2, R[1]);
  // (each a different nonsense animal: a long neck, a trunk, a hump, a tuft...)
  let hx = 20, hy = -40;
  if (k % 3 === 0) { candyStroke(c, () => { c.moveTo(14, -30); c.quadraticCurveTo(30, -48, 22, -62); }, 6, R, null); eggR(c, 24, -64, 9, 7, R); hx = 24; hy = -64; box(c, 30, -76, 2, 9, INK); box(c, 30.5, -75, 1, 7, T('#FFF4C8')); }
  else if (k % 3 === 1) { eggR(c, 22, -34, 11, 10, R); candyStroke(c, () => { c.moveTo(30, -32); c.quadraticCurveTo(40, -24, 36, -14); }, 4, R, null); hx = 22; hy = -34; }
  else { eggR(c, 20, -40, 10, 12, R); eggR(c, -4, -40, 9, 7, M); }
  // (the mane: curls in tufts; the eye, glossy; a striped tail)
  for (let i = 0; i < 3; i++) ballR(c, hx - 6 + i * 4, hy - 8 - (i % 2) * 3, 3.5, M);
  box(c, hx + 1, hy - 3, 4, 4, INK); box(c, hx + 2, hy - 2, 2, 2, '#FFFFFF'); box(c, hx + 3, hy - 1, 1, 1, INK);
  candyStroke(c, () => { c.moveTo(-20, -28); c.quadraticCurveTo(-34, -36 + Math.sin(f * 0.2 + k) * 3, -30, -48); }, 3, M, null);
  ballR(c, -30, -49, 3, M);
  // (the saddle, its gilt rosette, the stirrup hanging)
  eggR(c, -2, -38, 9, 4, Sd); box(c, -3, -41, 3, 3, Gd[4]); box(c, -3, -41, 1, 1, Gd[5]);
  box(c, -3, -34, 1, 8, Gd[2]); box(c, -5, -27, 5, 2, Gd[3]);
  c.restore();
};
/** A fiberglass fish car, its middle at (x, y), facing `dir`, kids in it; `dim` round the back. Its scales in rows, the
 *  fins and tail stepped, the eye glossy, the seat dished in its back with two kids (seeded looks) screaming. */
const fishCar = (c: Ctx, x: number, y: number, k: number, dir: number, dim: boolean, f: number, empty = false) => {
  const cols = ['#F87171', '#60A5FA', '#FBBF24', '#34D399'], T = dim ? dimmed : (col: string) => hour(col);
  const R = ramp6(T(cols[k % 4]));
  c.save(); c.translate(x, y); c.scale(dir, 1);
  polyF(c, [[-28, 0], [-45, -15], [-43, 15]], INK); polyF(c, [[-28, 0], [-42, -12], [-41, 12]], R[2]); polyF(c, [[-29, 0], [-42, -12], [-38, -2]], R[4]);
  for (let i = 0; i < 3; i++) box(c, -40 + i * 3, -8 + i * 2, 1, 16 - i * 4, R[1]);
  eggR(c, 0, 0, 32, 17, R);
  for (let i = -18; i < 18; i += 7) for (let j = -1; j < 2; j++) { c.strokeStyle = R[1]; c.lineWidth = 1; c.beginPath(); c.arc(i + (j & 1) * 3, 2 + j * 5, 3.5, -0.4, Math.PI * 0.6); c.stroke(); }
  polyF(c, [[-6, -15], [6, -26], [12, -15]], INK); polyF(c, [[-4, -15], [6, -24], [10, -15]], R[3]); box(c, 2, -21, 2, 5, R[4]);
  polyF(c, [[-4, 12], [6, 20], [10, 12]], R[1]);
  ballR(c, 20, -4, 6, ramp6(T('#F4F4F8')));
  box(c, 21, -5, 3, 3, INK); box(c, 21, -5, 1, 1, '#FFFFFF');
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(28, 4, 4, 0.2, 1.8); c.stroke();
  // (the seat, its two kids, arms up, mouths open)
  c.fillStyle = INK; c.beginPath(); c.ellipse(-3, -14, 16, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[1]; c.beginPath(); c.ellipse(-3, -14, 14, 3.5, 0, 0, Math.PI * 2); c.fill();
  if (!empty) for (const [kx, s] of [[-10, k * 7 + 1], [4, k * 7 + 4]] as [number, number][]) {
    const L = lookOf(s), Sk = ramp6(T(L.skin));
    box(c, kx - 4, -18, 8, 6, T(['#3B82F6', '#EF4444', '#FDE047', '#22C55E'][s % 4]));
    ballR(c, kx, -22, 5, Sk); box(c, kx - 5, -28, 10, 3, T(L.hair));
    box(c, kx - 1, -21, 3, 3, INK);
    if ((f >> 4) % 2) { box(c, kx - 7, -32, 2, 10, Sk[2]); box(c, kx + 5, -32, 2, 10, Sk[2]); }
  }
  c.restore();
};

/** Behind him: the carousel's deck and canopy and the beasts round its back, the spinner's hub and its back fish,
 *  the train's track, rails and the back pass behind its hedges, the trolley's track on its curly posts. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const f = state.frame, v = viewOf(state), off = shut(state), cf = off ? PARKED : f;
  // The carousel
  const cx = X(CAROUSEL.cx), r = CAROUSEL.r, deck = Y(CAROUSEL.deck), can = Y(CAROUSEL.canopy);
  if (onScreen(state, cx - r - 60, cx + r + 60)) {
    const Gd = rampH(BRASS), Pu = rampH(LILAC), Pk = rampH(BUBBLEGUM), W2 = rampH(FROSTING);
    // (the deck's top going back, round)
    drumTop(c, v.eye, cx - r - 20, cx + r + 20, deck, 0.9, rampH(ramp6('#C86A9A')));
    // (the center column: mirrored panels, the band organ's pipes, brass)
    shadeAcross(c, () => c.rect(cx - 34, can, 68, deck - can), cx - 34, can, 68, deck - can, Pu);
    box(c, cx - 36, can, 2, deck - can, INK); box(c, cx + 34, can, 2, deck - can, INK);
    for (let i = 0; i < 6; i++) { const ph = 70 + (i % 3) * 10; box(c, cx - 29 + i * 10, can + 60, 8, ph, INK); box(c, cx - 28 + i * 10, can + 61, 6, ph - 2, Gd[3]); box(c, cx - 28 + i * 10, can + 61, 2, ph - 2, Gd[5]); box(c, cx - 23 + i * 10, can + 61, 1, ph - 2, Gd[1]); box(c, cx - 27 + i * 10, can + 61 + ph - 8, 4, 3, INK); }
    for (let i = 0; i < 4; i++) { box(c, cx - 30, can + 150 + i * 14, 60, 9, INK); box(c, cx - 29, can + 151 + i * 14, 58, 7, hour('#BAE6FD')); box(c, cx - 29, can + 151 + i * 14, 12, 7, hour('#E8F6FE')); }
    // (the beasts round the back, dim, on their poles)
    for (const b of beasts(cf)) if (!b.front || b.depth < 0.25) {
      const hy = deck - 14 - b.bob;
      box(c, b.x - 1.5, can + 30, 3, deck - can - 30, dimmed(BRASS[3]));
      beast(c, b.x, hy, b.k, -1, true, cf);
    }
    // (the deck's skirt: painted panels, bulbs (dark the revisit), lit along its top)
    c.fillStyle = INK; c.beginPath(); c.ellipse(cx, deck + 8, r + 24, 18, 0, 0, Math.PI); c.fill();
    c.fillStyle = Pk[2]; c.beginPath(); c.ellipse(cx, deck + 8, r + 21, 15, 0, 0, Math.PI); c.fill();
    c.fillStyle = Pk[3]; c.beginPath(); c.ellipse(cx, deck + 6, r + 18, 11, 0, 0, Math.PI); c.fill();
    box(c, cx - r - 22, deck, (r + 22) * 2, 6, INK); box(c, cx - r - 20, deck + 1, (r + 20) * 2, 4, Pk[3]);
    box(c, cx - r - 20, deck, (r + 20) * 2, 2, LIP[2]); box(c, cx - r - 10, deck, r, 1, LIP[3]);
    for (let i = 0; i < 18; i++) { const lx = cx - r + i * ((r * 2) / 17), ly = deck + 14 + Math.sin((i / 17) * Math.PI) * 6, on = !off && (f >> 4) % 2 === i % 2; c.fillStyle = INK; c.beginPath(); c.arc(lx, ly, 3.5, 0, Math.PI * 2); c.fill(); c.fillStyle = off ? hour('#7A5A6A') : on ? '#FFF6B0' : '#FDA4AF'; c.beginPath(); c.arc(lx, ly, 2.5, 0, Math.PI * 2); c.fill(); }
    // (the canopy: a scalloped big top, its gores stepped, the rounding board's mirrors and bulbs, lit along its top lip
    // (stand on it), the name)
    const top = can;
    c.fillStyle = INK; c.beginPath(); c.moveTo(cx - r - 35, top + 2); c.quadraticCurveTo(cx, top - 72, cx + r + 35, top + 2); c.closePath(); c.fill();
    for (let i = 0; i < 10; i++) {
      const a0 = cx - r - 30 + i * ((r + 30) * 2 / 10), a1 = a0 + (r + 30) * 2 / 10, R = i % 2 ? W2 : Pk, k = i < 5 ? 4 - Math.floor(i / 2) : 2 - Math.floor((i - 5) / 3);
      polyF(c, [[a0, top], [cx, top - 62], [a1, top]], R[Math.max(1, Math.min(4, k))]);
      polyF(c, [[a1 - 4, top], [cx, top - 62], [a1, top]], R[Math.max(0, Math.min(4, k) - 1)]);
    }
    box(c, cx - r - 32, top, (r + 32) * 2, 26, INK);
    for (let i = 0; i < 3; i++) box(c, cx - r - 30, top + 2 + i * 7, (r + 30) * 2, 8, Pu[4 - i]);
    for (let i = 0; i < 14; i++) { const mx = cx - r - 22 + i * ((r + 22) * 2 / 13); box(c, mx - 5, top + 5, 10, 13, Gd[2]); box(c, mx - 4, top + 6, 8, 11, i % 2 ? hour('#BAE6FD') : hour('#F9D2E6')); box(c, mx - 4, top + 6, 2, 11, '#FFFFFF'); }
    box(c, cx - 96, top + 7, 192, 13, Pu[2]);
    for (let i = 0; i < 12; i++) { const sx = cx - r - 30 + i * ((r + 30) * 2 / 12), rr = (r + 30) / 12; c.fillStyle = INK; c.beginPath(); c.arc(sx + rr, top + 24, rr + 1, 0, Math.PI); c.fill(); c.fillStyle = hour(i % 2 ? '#FDE047' : '#F472B6'); c.beginPath(); c.arc(sx + rr, top + 24, rr - 1, 0, Math.PI); c.fill(); c.fillStyle = hour(i % 2 ? '#FFF6B0' : '#FBC4E0'); c.beginPath(); c.arc(sx + rr - 2, top + 24, rr - 4, 0, Math.PI * 0.5); c.fill(); }
    for (let i = 0; i < 24; i++) { const bx = cx - r - 26 + i * ((r + 26) * 2 / 23), on = !off && ((f >> 3) + i) % 3 === 0; box(c, bx - 1, top + 2, 3, 3, off ? hour('#5A4A6A') : on ? '#FFFFFF' : '#FDE68A'); }
    box(c, cx - r - 30, top, (r + 30) * 2, 2, LIP[2]); box(c, cx - r - 20, top, r, 1, LIP[3]);
    signText(c, 'THE WUMPLE-GO-ROUND', cx, top + 18, toonLetters(1));
    // (a flag on top, its pole twisted brass)
    box(c, cx - 2, top - 92, 4, 32, INK); box(c, cx - 1, top - 91, 2, 30, Gd[4]);
    const fl = off ? 0 : Math.sin(f * 0.1) * 3;
    polyF(c, [[cx + 2, top - 91], [cx + 24 + fl, top - 85], [cx + 2, top - 77]], INK); polyF(c, [[cx + 2, top - 90], [cx + 21 + fl, top - 85], [cx + 2, top - 79]], hour(GRASS[3])); polyF(c, [[cx + 2, top - 90], [cx + 12 + fl * 0.5, top - 87], [cx + 2, top - 85]], hour(GRASS[4]));
    ballR(c, cx, top - 94, 3, Gd);
    // (the revisit: a CLOSED board hung off the rounding board on two chains)
    if (off) {
      for (const s of [-1, 1]) for (let y = top + 26; y < top + 48; y += 4) { box(c, cx + s * 40 - 1, y, 3, 3, INK); box(c, cx + s * 40, y + 1, 1, 1, hour(STEEL[4])); }
      box(c, cx - 56, top + 48, 112, 26, INK); box(c, cx - 54, top + 50, 108, 22, hour(CHERRY[3])); box(c, cx - 54, top + 50, 108, 3, hour(CHERRY[4])); box(c, cx - 54, top + 69, 108, 3, hour(CHERRY[1]));
      signText(c, 'CLOSED', cx, top + 67, toonLetters(2, ['#FFFFFF', '#FFFFFF', '#FFE4E6', '#FECDD3']));
    }
  }
  // The spinner: the hub (a fat striped column, a fish bowl on top with a goldfish in it), the back fish
  const sx = X(SPINNER.cx);
  if (onScreen(state, sx - SPINNER.r - 80, sx + SPINNER.r + 80)) {
    const St = rampH(STEEL), Sk = rampH(SKY), W2 = rampH(FROSTING), fish = fishes(f, off);
    for (const fi of fish) if (!fi.front || fi.depth < 0.25) {
      c.strokeStyle = dimmed(STEEL[2]); c.lineWidth = 4; c.beginPath(); c.moveTo(sx, Y(SPINNER.hi + 60)); c.lineTo(fi.x, Y(fi.h) - 10); c.stroke();
      fishCar(c, fi.x, Y(fi.h), fi.k, Math.cos(fi.a) > 0 ? 1 : -1, true, f, off);
    }
    // (the hub column: candy stripes, stepped round)
    const ctop = Y(SPINNER.hi + 70);
    c.save(); c.beginPath(); c.rect(sx - 24, ctop, 48, GY - ctop); c.clip();
    for (let y = ctop - 16; y < GY; y += 16) { c.fillStyle = Sk[3]; c.beginPath(); c.moveTo(sx - 24, y); c.lineTo(sx + 24, y + 8); c.lineTo(sx + 24, y + 16); c.lineTo(sx - 24, y + 8); c.closePath(); c.fill(); c.fillStyle = W2[3]; c.beginPath(); c.moveTo(sx - 24, y + 8); c.lineTo(sx + 24, y + 16); c.lineTo(sx + 24, y + 24); c.lineTo(sx - 24, y + 16); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(sx - 24, ctop, 12, GY - ctop); checker(c, sx - 12, ctop, 2, GY - ctop, 'rgba(255,255,255,0.28)', 0, 1);
    c.fillStyle = 'rgba(26,16,40,0.24)'; c.fillRect(sx + 8, ctop, 16, GY - ctop); checker(c, sx + 6, ctop, 2, GY - ctop, 'rgba(26,16,40,0.24)', 1, 1);
    c.restore();
    box(c, sx - 26, ctop, 2, GY - ctop, INK); box(c, sx + 24, ctop, 2, GY - ctop, INK);
    box(c, sx - 32, ctop - 6, 64, 8, INK); box(c, sx - 31, ctop - 5, 62, 6, St[3]); box(c, sx - 31, ctop - 5, 62, 2, St[5]);
    // (the bowl: glass, the water banded, the goldfish (belly up the revisit), bubbles, a shine)
    const by = Y(SPINNER.hi + 100);
    c.fillStyle = INK; c.beginPath(); c.arc(sx, by, 43, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour('#D8F0FC'); c.beginPath(); c.arc(sx, by, 40, 0, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.arc(sx, by, 40, 0, Math.PI * 2); c.clip();
    for (let i = 0; i < 5; i++) box(c, sx - 41, by - 4 + i * 9, 82, 10, hour(['#7ED0F6', '#5EC0F0', '#44AEE8', '#3496D8', '#2A7EC0'][i]));
    checker(c, sx - 41, by + 4, 82, 2, hour('#5EC0F0'), 0, 1); checker(c, sx - 41, by + 13, 82, 2, hour('#44AEE8'), 1, 1);
    box(c, sx - 41, by - 5, 82, 2, hour('#E6F8FE'));
    const gx = off ? sx + 6 : sx + Math.sin(f * 0.03) * 16, gy = off ? by - 6 : by + 10;
    c.save(); c.translate(gx, gy); if (off) c.scale(1, -1);
    eggR(c, 0, 0, 10, 6, ramp6(hour('#FB923C'))); polyF(c, [[-9, 0], [-17, -6], [-17, 6]], hour('#EA6A1A')); box(c, 4, -2, 2, 2, INK); if (off) { box(c, 3, -3, 4, 1, INK); box(c, 4, -4, 1, 3, INK); }
    c.restore();
    if (!off) for (let i = 0; i < 3; i++) { const bt = ((f * 0.5 + i * 20) % 60) / 60; box(c, sx + 8 + Math.sin(bt * 6 + i) * 3, by + 8 - bt * 40, 2, 2, '#FFFFFF'); }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.65)'; c.beginPath(); c.ellipse(sx - 17, by - 19, 9, 5, -0.5, 0, Math.PI * 2); c.fill(); box(c, sx + 22, by - 10, 3, 8, 'rgba(255,255,255,0.5)');
    // (its name on a wavy banner over the bowl, held up on two poles)
    for (const px of [sx - 92, sx + 92]) { box(c, px - 2, by - 70, 4, 52, INK); box(c, px - 1, by - 69, 2, 50, hour(LEMON[4])); ballR(c, px, by - 72, 3, rampH(LEMON)); }
    c.fillStyle = INK; c.beginPath(); c.roundRect(sx - 100, by - 86, 200, 22, 8); c.fill();
    c.save(); c.beginPath(); c.roundRect(sx - 98, by - 84, 196, 18, 7); c.clip(); for (let i = 0; i < 4; i++) box(c, sx - 98, by - 84 + i * 5, 196, 6, hour(['#7ED0F6', '#0EA5E9', '#0EA5E9', '#0B7DB8'][i])); c.restore();
    signText(c, 'THE WISH-FISH SPINNER', sx, by - 71, toonLetters(1));
    if (off) closedBoard(c, sx + 60, ['CLOSED FOR', 'THE DAY']);
  }
  // The train: the track (sleepers and rails along the ground), the back pass behind its hedge row
  const ta = X(TRAIN.a), tb = X(TRAIN.b);
  if (onScreen(state, ta - 80, tb + 80)) {
    const tr = trainAt(f), Gr = rampH(GRASS), Hd = rampH(GRASS, true);
    if (off) { c.save(); c.beginPath(); c.rect(ta - 30, GY - 220, tb - ta + 60, 230); c.clip(); drawTrain(c, ta + 360, Y(26), 1, true, f, 0.75, true); c.restore(); }
    else if (tr.phase === 'back') { c.save(); c.beginPath(); c.rect(ta - 30, GY - 220, tb - ta + 60, 230); c.clip(); drawTrain(c, tr.x, Y(26), 1, true, f, 0.75); c.restore(); }
    // (the hedge row it goes round behind: clipped lumps, stepped)
    for (let x = ta - 60; x < tb + 60; x += 34) { c.fillStyle = INK; c.beginPath(); c.arc(x, Y(30), 22, Math.PI, 0); c.fill(); c.fillStyle = Hd[2]; c.beginPath(); c.arc(x, Y(30), 20, Math.PI, 0); c.fill(); c.fillStyle = Hd[3]; c.beginPath(); c.arc(x - 4, Y(31), 14, Math.PI, 0); c.fill(); box(c, x - 12, Y(46), 6, 2, Hd[4]); }
    box(c, ta - 80, Y(30), tb - ta + 160, 30, Hd[2]); checker(c, ta - 80, Y(30), tb - ta + 160, 2, Hd[3], 0, 1);
    for (let x = ta - 40; x < tb + 40; x += 22) { box(c, x, GY - 7, 14, 7, INK); box(c, x + 1, GY - 6, 12, 5, hour('#92400E')); box(c, x + 1, GY - 6, 12, 1, hour('#C2742E')); }
    for (const ry of [GY - 9, GY - 4]) { box(c, ta - 40, ry, tb - ta + 80, 3, INK); box(c, ta - 40, ry, tb - ta + 80, 1, hour(STEEL[5])); box(c, ta - 40, ry + 1, tb - ta + 80, 1, hour(STEEL[3])); }
    // (the front pass (on the track, behind him: he's on the path in front of the track), and the topiary hedges at the
    // track's ends it comes out from behind and goes round)
    if (!off && tr.phase === 'front') { c.save(); c.beginPath(); c.rect(ta - 30, GY - 220, tb - ta + 60, 230); c.clip(); drawTrain(c, tr.x, GY, -1, false, f); c.restore(); }
    for (const hx of [ta - 50, tb + 50]) {
      for (const [dx, dy, rr] of HEDGE) { c.fillStyle = INK; c.beginPath(); c.arc(hx + dx, GY + dy, rr + 3, 0, Math.PI * 2); c.fill(); }
      for (const [dx, dy, rr] of HEDGE) ballR(c, hx + dx, GY + dy, rr, Gr, false);
      for (let i = 0; i < 5; i++) ballR(c, hx - 40 + i * 20, GY - 30 - (i % 2) * 18, 3, rampH(ramp6(['#F472B6', '#FDE047', '#FFFFFF'][i % 3])), false);
    }
    if (off) closedBoard(c, tb + 10, ['NO MORE TRAINS', 'TODAY']);
  }
  // The trolley's track: a beam on curly posts out over the pit (its top's the lit lip he walks on), the end station
  const ra = X(TROLLEY.a), rb = X(TROLLEY.b), ry = Y(TROLLEY.h);
  if (onScreen(state, ra - 60, rb + 200)) {
    const Pu = rampH(LILAC);
    for (let x = ra + 120; x < rb; x += 260) candyStroke(c, () => { c.moveTo(x, GY + 20); c.bezierCurveTo(x - 20, ry + 120, x + 20, ry + 60, x, ry + 10); }, 8, Pu, rampH(FROSTING), 8);
    // (where the beam comes out of the hattery: a candy strut up under it off a bolted steel plate on the wall)
    {
      const St = rampH(STEEL);
      candyStroke(c, () => { c.moveTo(ra + 2, ry + 78); c.quadraticCurveTo(ra + 20, ry + 40, ra + 64, ry + 16); }, 6, Pu, rampH(FROSTING), 7);
      box(c, ra - 4, ry + 66, 12, 24, INK); box(c, ra - 3, ry + 67, 10, 22, St[3]); box(c, ra - 3, ry + 67, 10, 2, St[5]);
      for (const by of [ry + 71, ry + 82]) { box(c, ra, by, 3, 3, St[1]); box(c, ra, by, 1, 1, St[5]); }
      box(c, ra + 54, ry + 14, 20, 8, INK); box(c, ra + 55, ry + 15, 18, 6, St[3]); box(c, ra + 55, ry + 15, 18, 1, St[5]);
    }
    // (the hattery's arch: the bell's lamp over it flashing while it rings; the revisit, the trolley's put away: the
    // shutter rolled down across the arch, its slats, OUT OF SERVICE on it, the lamp dark)
    const tl = trolleyAt(f), lampOn = !off && tl.phase === 'bell' && (tl.t >> 3) % 2 === 0;
    ballR(c, ra - 2, ry - TROLLEY_H - 14, 8, lampOn ? ramp6('#FDE047') : rampH(ramp6('#92400E')));
    if (lampOn) { c.fillStyle = 'rgba(253,224,71,0.25)'; c.beginPath(); c.arc(ra - 2, ry - TROLLEY_H - 14, 24, 0, Math.PI * 2); c.fill(); }
    if (off) {
      const St = rampH(STEEL);
      c.save(); c.beginPath(); c.moveTo(ra - 64, ry); c.lineTo(ra - 64, ry - 68); c.quadraticCurveTo(ra - 34, ry - 102, ra - 4, ry - 68); c.lineTo(ra - 4, ry); c.closePath(); c.clip();
      for (let y = ry - 104; y < ry; y += 6) { box(c, ra - 66, y, 64, 6, St[3]); box(c, ra - 66, y, 64, 1, St[5]); box(c, ra - 66, y + 5, 64, 1, St[1]); }
      c.restore();
      box(c, ra - 60, ry - 46, 52, 22, INK); box(c, ra - 59, ry - 45, 50, 20, hour('#F4E8D0'));
      signText(c, 'OUT OF', ra - 34, ry - 37, { sx: 1, sy: 1, bold: true, fill: hour(CHERRY[2]) }); signText(c, 'SERVICE', ra - 34, ry - 28, { sx: 1, sy: 1, bold: true, fill: hour(CHERRY[2]) });
    }
    endStation(c, rb, ry, f, off);
    // (the studio's THIS WAY sign stands in front of the station's legs: drawn again over them, so nothing's over it)
    for (const [sx, sh, lines, board, tall] of SIGNS) if (Math.abs(X(sx) - (rb + 100)) < 320) toonSign(c, X(sx), Y(sh), lines, { board, tall });
  }
};

/** THE END STATION: built onto the monorail like the rest of it. The beam runs on into its floor (the same candy
 *  stripes, the trolley's doorway over it: the tunnel mouth it runs into), the floor carried on two of the track's own
 *  curly lilac posts with a candy X-brace between and bolted steel brackets where they meet it; the body's lemon
 *  clapboard on that floor under the pink-striped dome (its finial and pennant), round windows, two lanterns at the
 *  doorway, the END OF THE LINE board over it; down its far side a caged lift tower in the posts' lilac to the street
 *  (the car waiting at the bottom), its head joined to the body. Nothing new to stand on (the dome's not lit). */
const endStation = (c: Ctx, rb: number, ry: number, f: number, off: boolean) => {
  const L0 = rb + 14, W = 160, R0 = L0 + W, top = ry - 124;
  const Pu = rampH(LILAC), Wt = rampH(FROSTING), Mn = rampH(MINT), St = rampH(STEEL), Ye = rampH(LEMON), Pk = rampH(BUBBLEGUM);
  // (the lift tower, behind the body's far end: four lilac corner posts, cross-laced, the car at the bottom)
  const tx = R0 - 8, tw = 46, tt = top + 30;
  box(c, tx - 2, tt - 2, tw + 4, GY - tt + 2, INK);
  box(c, tx, tt, tw, GY - tt, hour('#2A1E4A'));
  for (let y = tt + 8; y < GY - 8; y += 26) { c.strokeStyle = Pu[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + 3, y); c.lineTo(tx + tw - 3, y + 26); c.moveTo(tx + tw - 3, y); c.lineTo(tx + 3, y + 26); c.stroke(); box(c, tx, y - 1, tw, 3, Pu[3]); box(c, tx, y - 1, tw, 1, Pu[4]); }
  for (const px of [tx, tx + tw - 5]) { box(c, px, tt, 5, GY - tt, Pu[3]); box(c, px, tt, 1, GY - tt, Pu[5]); box(c, px + 4, tt, 1, GY - tt, Pu[1]); }
  const cy = GY - 50;
  box(c, tx + 6, cy, tw - 12, 48, INK); box(c, tx + 8, cy + 2, tw - 16, 44, Ye[3]); box(c, tx + 8, cy + 2, tw - 16, 3, Ye[4]); box(c, tx + 8, cy + 40, tw - 16, 6, Ye[1]);
  box(c, tx + 12, cy + 8, tw - 24, 22, hour('#BAE6FD')); box(c, tx + 12, cy + 8, tw - 24, 3, 'rgba(255,255,255,0.7)'); box(c, tx + tw / 2 - 1, cy + 8, 2, 22, INK);
  box(c, tx + tw / 2 - 1, tt + 6, 2, cy - tt - 6, St[2]);
  box(c, tx - 4, tt - 10, tw + 8, 12, INK); box(c, tx - 2, tt - 8, tw + 4, 8, Pk[3]); box(c, tx - 2, tt - 8, tw + 4, 2, Pk[4]);
  // (the floor's posts: the track's own curly candy posts, a candy X between, bolted brackets up top)
  const p1 = L0 + 34, p2 = R0 - 44, fy = ry + 18;
  candyStroke(c, () => { c.moveTo(p1 + 14, GY - 30); c.lineTo(p2 - 14, fy + 26); }, 5, Pu, Wt, 7);
  candyStroke(c, () => { c.moveTo(p1 + 14, fy + 26); c.lineTo(p2 - 14, GY - 30); }, 5, Pu, Wt, 7);
  for (const px of [p1, p2]) {
    candyStroke(c, () => { c.moveTo(px, GY + 20); c.bezierCurveTo(px - 16, fy + 110, px + 16, fy + 50, px, fy); }, 8, Pu, Wt, 8);
    box(c, px - 11, fy - 1, 22, 12, INK); box(c, px - 10, fy, 20, 10, St[3]); box(c, px - 10, fy, 20, 2, St[5]); box(c, px - 10, fy + 8, 20, 2, St[1]);
    for (const bx of [px - 6, px + 4]) { box(c, bx, fy + 4, 3, 3, St[1]); box(c, bx, fy + 4, 1, 1, St[5]); }
  }
  // (the floor: the beam's candy stripes carried on through, its steel rivets)
  box(c, rb - 2, ry - 2, R0 - rb + 4, 22, INK); box(c, rb, ry, R0 - rb, 18, Wt[3]);
  for (let x = Math.floor(rb / 24) * 24; x < R0; x += 24) { const x0 = Math.max(rb, x), ww = Math.min(12, R0 - x0); if (ww > 0) { box(c, x0, ry + 3, ww, 10, Mn[3]); box(c, x0, ry + 3, ww, 2, Mn[4]); box(c, x0, ry + 11, ww, 2, Mn[2]); } }
  box(c, rb, ry + 14, R0 - rb, 4, Wt[1]); box(c, rb, ry + 1, R0 - rb, 1, Wt[5]);
  for (let x = rb + 10; x < R0; x += 36) { box(c, x, ry + 7, 3, 3, St[1]); box(c, x, ry + 7, 1, 1, St[5]); }
  // (the body: lemon clapboard, shaded across, its corner boards)
  box(c, L0 - 2, top - 2, W + 4, ry - top + 2, INK);
  shadeAcross(c, () => c.rect(L0, top, W, ry - top), L0, top, W, ry - top, Ye);
  for (let y = top + 10; y < ry; y += 10) box(c, L0, y, W, 1, Ye[1]);
  box(c, R0 - 8, top, 8, ry - top, Pk[2]); box(c, R0 - 8, top, 2, ry - top, Pk[4]);
  box(c, L0, top, W, 6, Pk[3]); box(c, L0, top + 4, W, 2, Pk[1]);
  // (the dome, pink stripes, its finial and a pennant)
  const dx = L0 + W / 2, dr = W / 2 - 6;
  c.fillStyle = INK; c.beginPath(); c.arc(dx, top, dr + 4, Math.PI, 0); c.fill();
  c.save(); c.beginPath(); c.arc(dx, top, dr, Math.PI, 0); c.clip();
  // (the stripes as wedges out of the dome's middle, so they fill it right out to its curve)
  for (let k = 0; k < 10; k++) { const a0 = Math.PI + (k / 10) * Math.PI, a1 = Math.PI + ((k + 1) / 10) * Math.PI; c.fillStyle = k % 2 ? Wt[3] : Pk[k < 5 ? 4 : 2]; c.beginPath(); c.moveTo(dx, top); c.arc(dx, top, dr + 1, a0, a1); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(26,16,40,0.18)'; c.beginPath(); c.arc(dx, top, dr, 0, Math.PI * 2); c.arc(dx, top, dr - 8, 0, Math.PI * 2, true); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.arc(dx - dr * 0.35, top - dr * 0.5, dr * 0.35, 0, Math.PI * 2); c.fill();
  c.restore();
  box(c, dx - 2, top - dr - 22, 4, 20, INK); box(c, dx - 1, top - dr - 21, 2, 18, hour(BRASS[4]));
  ballR(c, dx, top - dr - 4, 5, rampH(ramp6(BRASS[3])));
  const wav = Math.sin(f * 0.12) * 3;
  polyF(c, [[dx + 2, top - dr - 22], [dx + 26, top - dr - 17 + wav], [dx + 2, top - dr - 12]], INK); polyF(c, [[dx + 3, top - dr - 20], [dx + 22, top - dr - 17 + wav], [dx + 3, top - dr - 14]], hour(CHERRY[3]));
  // (round windows, the doorway the trolley runs into, its lanterns)
  for (let k = 0; k < 3; k++) { const wx = L0 + 70 + k * 26; c.fillStyle = INK; c.beginPath(); c.arc(wx, ry - 70, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = lit() ? '#FFE08A' : hour('#9ACAEA'); c.beginPath(); c.arc(wx, ry - 70, 7, 0, Math.PI * 2); c.fill(); box(c, wx - 4, ry - 75, 3, 3, 'rgba(255,255,255,0.6)'); }
  box(c, L0, ry - 92, 40, 92, '#1A1028');
  for (let k = 0; k < 4; k++) box(c, L0 + 2, ry - 80 + k * 18, 36, 2, 'rgba(60,40,90,0.6)');
  box(c, L0 - 3, ry - 98, 46, 6, INK); box(c, L0 - 2, ry - 97, 44, 4, Ye[4]);
  for (const lx of [L0 + 50, L0 + 140]) {
    box(c, lx - 1, ry - 46, 2, 8, INK);
    ballR(c, lx, ry - 34, 6, lit() && !off ? ramp6('#FDE047') : rampH(ramp6('#D9A84A')));
    if (lit() && !off) { c.fillStyle = 'rgba(253,224,71,0.22)'; c.beginPath(); c.arc(lx, ry - 34, 18, 0, Math.PI * 2); c.fill(); }
  }
  // (the board over it all, held up on two brass rods off the dome's base)
  const bw = 120, bx = dx - bw / 2, by = top - 30;
  for (const rx of [bx + 14, bx + bw - 14]) { box(c, rx - 1, by + 20, 3, 12, INK); box(c, rx, by + 20, 1, 12, hour(BRASS[4])); }
  box(c, bx, by, bw, 22, INK); box(c, bx + 2, by + 2, bw - 4, 18, hour(CHERRY[3])); box(c, bx + 2, by + 2, bw - 4, 2, hour(CHERRY[4])); box(c, bx + 2, by + 17, bw - 4, 3, hour(CHERRY[1]));
  signText(c, off ? 'NO MORE TODAY' : 'END OF THE LINE', dx, by + 15, toonLetters(1));
};

/** A sandwich board on the ground (a CLOSED notice), its feet at x. */
const closedBoard = (c: Ctx, x: number, lines: string[]) => {
  const W = 92, top = GY - 52, Wd = rampH(ramp6('#F4E8D0'));
  polyF(c, [[x - 4, GY], [x + 6, top], [x + W - 6, top], [x + W + 4, GY]], INK);
  polyF(c, [[x - 2, GY - 1], [x + 7, top + 2], [x + W - 7, top + 2], [x + W + 2, GY - 1]], Wd[3]);
  box(c, x + 8, top + 2, W - 16, 3, Wd[5]); box(c, x, GY - 8, W, 3, Wd[1]);
  box(c, x + 10, top + 8, W - 20, 30, hour(CHERRY[3])); box(c, x + 10, top + 8, W - 20, 2, hour(CHERRY[4]));
  lines.forEach((l, i) => signText(c, l, x + W / 2, top + 20 + i * 12, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' }));
};
/** A topiary hedge's lumps: [dx, dy, r] about its foot. */
const HEDGE: [number, number, number][] = [[-40, -20, 24], [-14, -40, 30], [16, -34, 28], [42, -18, 22], [0, -14, 30]];
/** The train: its engine's nose at x (going left, or right `back`), sitting on y; scaled `k`. A fat boiler with a
 *  face (rosy cheeks, a grin), its funnel stack banded, the cab, brass trim, spoked wheels; three cars of screaming
 *  kids (seeded looks), each car stepped with its scalloped trim. `empty` (parked): no kids, the face asleep. */
const drawTrain = (c: Ctx, x: number, y: number, dir: number, dim: boolean, f: number, k = 1, empty = false) => {
  const T = dim ? dimmed : (col: string) => hour(col);
  const Bl = ramp6(T('#3B82F6')), Rd = ramp6(T('#EF4444')), Yl = ramp6(T('#FDE047')), Pk = ramp6(T('#F472B6')), Gd = ramp6(T(BRASS[3]));
  c.save(); c.translate(x, y); c.scale(k * (dir > 0 ? -1 : 1), k);
  const wheel = (wx: number, R: string[]) => { c.fillStyle = INK; c.beginPath(); c.arc(wx, -8, 9.5, 0, Math.PI * 2); c.fill(); c.fillStyle = R[2]; c.beginPath(); c.arc(wx, -8, 7.5, 0, Math.PI * 2); c.fill(); c.fillStyle = R[4]; c.beginPath(); c.arc(wx - 1, -9, 5, Math.PI, Math.PI * 1.6); c.lineTo(wx - 1, -9); c.fill(); const a = empty ? 0.3 : f * 0.2; c.strokeStyle = INK; c.lineWidth = 1.5; for (const o of [0, Math.PI / 2]) { c.beginPath(); c.moveTo(wx + Math.cos(a + o) * 6, -8 + Math.sin(a + o) * 6); c.lineTo(wx - Math.cos(a + o) * 6, -8 - Math.sin(a + o) * 6); c.stroke(); } box(c, wx - 1.5, -9.5, 3, 3, Gd[4]); };
  // (the engine)
  c.fillStyle = INK; c.beginPath(); c.roundRect(-1, -47, 76, 42, 12); c.fill();
  c.save(); c.beginPath(); c.roundRect(2, -44, 70, 36, 10); c.clip(); for (let i = 0; i < 5; i++) box(c, 2, -44 + i * 8, 70, 9, [Bl[4], Bl[3], Bl[3], Bl[2], Bl[1]][i]); box(c, 2, -44, 70, 1, Bl[5]); c.restore();
  for (const bx of [24, 40]) { box(c, bx, -44, 3, 36, Gd[3]); box(c, bx, -44, 1, 36, Gd[5]); }
  ballR(c, 8, -26, 15, Yl);
  box(c, 2, -32, 4, 4, INK); box(c, 10, -32, 4, 4, INK);
  if (!empty) { box(c, 3, -31, 1, 1, '#FFFFFF'); box(c, 11, -31, 1, 1, '#FFFFFF'); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(8, -24, 6, 0.3, Math.PI - 0.3); c.stroke(); }
  else { box(c, 2, -30, 4, 1, Yl[0]); box(c, 10, -30, 4, 1, Yl[0]); box(c, 5, -21, 6, 1, INK); }
  c.fillStyle = 'rgba(255,110,140,0.5)'; c.beginPath(); c.arc(0, -21, 3, 0, Math.PI * 2); c.arc(16, -21, 3, 0, Math.PI * 2); c.fill();
  polyF(c, [[20, -46], [15, -72], [37, -72], [32, -46]], INK);
  polyF(c, [[22, -47], [18, -70], [34, -70], [30, -47]], Rd[3]); polyF(c, [[22, -47], [18, -70], [22, -70], [25, -47]], Rd[4]); polyF(c, [[28, -47], [31, -70], [34, -70], [30, -47]], Rd[1]);
  box(c, 15, -75, 22, 5, INK); box(c, 16, -74, 20, 3, Gd[3]); box(c, 16, -74, 20, 1, Gd[5]);
  box(c, 45, -63, 30, 22, INK); box(c, 47, -61, 26, 18, Pk[3]); box(c, 47, -61, 26, 3, Pk[4]); box(c, 49, -57, 10, 8, T('#BAE6FD')); box(c, 49, -57, 3, 8, '#FFFFFF');
  box(c, 43, -66, 34, 5, INK); box(c, 44, -65, 32, 3, Rd[3]);
  wheel(18, Rd); wheel(54, Rd);
  // (the cars: stepped, scalloped trim, the kids)
  for (let i = 0; i < 3; i++) {
    const cx = 80 + i * 74, C = ramp6(T(['#22C55E', '#F97316', '#A855F7'][i]));
    box(c, cx, -35, 68, 29, INK);
    c.save(); c.beginPath(); c.rect(cx + 2, -33, 64, 25); c.clip(); for (let j = 0; j < 4; j++) box(c, cx + 2, -33 + j * 7, 64, 8, [C[4], C[3], C[2], C[1]][j]); c.restore();
    for (let j = 0; j < 5; j++) { c.fillStyle = INK; c.beginPath(); c.arc(cx + 8 + j * 13, -33, 5, 0, Math.PI); c.fill(); c.fillStyle = Yl[3]; c.beginPath(); c.arc(cx + 8 + j * 13, -33, 3.5, 0, Math.PI); c.fill(); }
    if (!empty) for (let j = 0; j < 3; j++) {
      const kx = cx + 12 + j * 20, L = lookOf(i * 11 + j * 5 + 3), Sk = ramp6(T(L.skin));
      ballR(c, kx, -41, 5.5, Sk); box(c, kx - 5, -47, 10, 3, T(L.hair));
      box(c, kx - 1, -39, 3, 3, INK);
      if (((f >> 3) + j + i) % 3 === 0) { box(c, kx - 7, -54, 2, 10, Sk[2]); box(c, kx + 5, -54, 2, 10, Sk[2]); }
    }
    wheel(cx + 14, Gd); wheel(cx + 54, Gd);
  }
  c.restore();
};

/** In front: the carousel's front beasts on their poles, the spinner's front fish, the trolley, the ball pits' near
 *  lip, what the cast throw. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const f = state.frame, k = kiddieOf(state), off = shut(state), cf = off ? PARKED : f;
  // The carousel's front beasts (on twisted brass poles)
  const cx = X(CAROUSEL.cx), deck = Y(CAROUSEL.deck), can = Y(CAROUSEL.canopy), Gd = rampH(BRASS);
  if (onScreen(state, cx - CAROUSEL.r - 60, cx + CAROUSEL.r + 60)) {
    for (const b of beasts(cf).filter(b => b.front && b.depth >= 0.25).sort((a, b) => a.depth - b.depth)) {
      box(c, b.x - 3, can + 26, 6, deck - can - 26, INK); box(c, b.x - 2, can + 26, 4, deck - can - 26, Gd[3]); box(c, b.x - 2, can + 26, 1, deck - can - 26, Gd[5]); box(c, b.x + 1, can + 26, 1, deck - can - 26, Gd[1]);
      for (let y = can + 30; y < deck; y += 8) box(c, b.x - 2, y, 4, 2, Gd[2]);
      beast(c, b.x, deck - 14 - b.bob, b.k, -1, false, cf);
    }
  }
  // The spinner's front fish, on their arms
  const sx = X(SPINNER.cx);
  if (onScreen(state, sx - SPINNER.r - 80, sx + SPINNER.r + 80)) {
    for (const fi of fishes(f, off).filter(fi => fi.front && fi.depth >= 0.25).sort((a, b) => a.depth - b.depth)) {
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(sx, Y(SPINNER.hi + 60)); c.lineTo(fi.x, Y(fi.h) - 10); c.stroke();
      c.strokeStyle = hour(STEEL[3]); c.lineWidth = 4; c.stroke();
      c.strokeStyle = hour(STEEL[5]); c.lineWidth = 1; c.beginPath(); c.moveTo(sx, Y(SPINNER.hi + 60) - 1); c.lineTo(fi.x, Y(fi.h) - 11); c.stroke();
      fishCar(c, fi.x, Y(fi.h), fi.k, Math.cos(fi.a) > 0 ? -1 : 1, false, f, off);
    }
  }
  // The trolley (out of the hattery's wall, into the end station); the revisit: put away, the shutter down
  const tl = trolleyAt(f), ra = X(TROLLEY.a), rb = X(TROLLEY.b), ry = Y(TROLLEY.h);
  if (onScreen(state, ra - 200, rb + 200)) {
    if (!off && tl.phase === 'run') {
      // (out of the hattery's arch, and right in through the end station's doorway: clipped to between the two)
      c.save(); c.beginPath(); c.rect(ra, ry - 200, DOOR_R - ra, 220); c.clip();
      const x0 = tl.x - TROLLEY_LEN, Bd = rampH(ramp6('#FB7185')), W2 = rampH(FROSTING), Gr = rampH(GRASS);
      // (a curly little tram: a striped awning roof, round windows with grown-ups waving, a bell, a cowcatcher)
      c.fillStyle = INK; c.beginPath(); c.roundRect(x0, ry - TROLLEY_H, TROLLEY_LEN, TROLLEY_H - 6, 14); c.fill();
      c.save(); c.beginPath(); c.roundRect(x0 + 3, ry - TROLLEY_H + 3, TROLLEY_LEN - 6, TROLLEY_H - 12, 12); c.clip(); for (let i = 0; i < 5; i++) box(c, x0, ry - TROLLEY_H + 3 + i * 14, TROLLEY_LEN, 15, [Bd[4], Bd[3], Bd[3], Bd[2], Bd[1]][i]); box(c, x0, ry - 24, TROLLEY_LEN, 4, W2[3]); box(c, x0, ry - 24, TROLLEY_LEN, 1, W2[5]); c.restore();
      // (the roof: a flat striped canopy he can ride, its top lit along it, scallops hanging off its front edge)
      const rt = ry - ROOF_UP;
      box(c, x0 + 2, rt - 1, TROLLEY_LEN - 4, 11, INK);
      for (let i = 0; i * 17 < TROLLEY_LEN - 6; i++) { const R = i % 2 ? W2 : Gr, sx = x0 + 3 + i * 17, sw = Math.min(17, x0 + TROLLEY_LEN - 3 - sx); box(c, sx, rt + 1, sw, 8, R[3]); box(c, sx, rt + 6, sw, 2, R[2]); }
      for (let i = 0; i * 17 < TROLLEY_LEN - 6; i++) { const R = i % 2 ? W2 : Gr, sx = x0 + 3 + i * 17 + 8.5; c.fillStyle = INK; c.beginPath(); c.arc(sx, rt + 9, 7.5, 0, Math.PI); c.fill(); c.fillStyle = R[2]; c.beginPath(); c.arc(sx, rt + 9, 6, 0, Math.PI); c.fill(); }
      box(c, x0 + 3, rt + 1, TROLLEY_LEN - 6, 2, LIP[2]); box(c, x0 + 6, rt + 1, TROLLEY_LEN * 0.6, 1, LIP[3]);
      for (let i = 0; i < 4; i++) {
        const wx = x0 + 28 + i * 38, L = lookOf(i * 9 + 17);
        c.fillStyle = INK; c.beginPath(); c.arc(wx, ry - 48, 13, 0, Math.PI * 2); c.fill();
        c.fillStyle = hour('#BAE6FD'); c.beginPath(); c.arc(wx, ry - 48, 11, 0, Math.PI * 2); c.fill();
        ballR(c, wx, ry - 46, 6, ramp6(hour(L.skin)), false); box(c, wx - 6, ry - 53, 12, 3, hour(L.hair)); box(c, wx - 2, ry - 46, 1, 1, INK); box(c, wx + 2, ry - 46, 1, 1, INK);
        if ((f >> 4) % 2 === i % 2) box(c, wx + 6, ry - 58, 2, 8, ramp6(hour(L.skin))[2]);
        box(c, wx - 8, ry - 56, 3, 5, 'rgba(255,255,255,0.7)');
      }
      polyF(c, [[tl.x, ry - 30], [tl.x + 17, ry - 3], [tl.x, ry - 3]], INK); for (let k2 = 0; k2 < 3; k2++) box(c, tl.x + 2 + k2 * 4, ry - 24 + k2 * 7, 2, 18 - k2 * 7, hour(STEEL[4]));
      ballR(c, tl.x - 8, ry - 60, 6, rampH(LEMON));
      for (const wx of [x0 + 24, tl.x - 24]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, ry - 4, 8.5, 0, Math.PI * 2); c.fill(); c.fillStyle = hour(STEEL[3]); c.beginPath(); c.arc(wx, ry - 4, 6.5, 0, Math.PI * 2); c.fill(); box(c, wx - 3, ry - 8, 3, 2, hour(STEEL[5])); }
      // (in the doorway it's in the station's dark, going darker in; past it, the station's wall hides it)
      if (tl.x > DOOR_L) {
        const g = c.createLinearGradient(DOOR_L, 0, DOOR_R, 0); g.addColorStop(0, 'rgba(26,16,40,0.55)'); g.addColorStop(1, 'rgba(26,16,40,0.97)');
        c.fillStyle = g; c.fillRect(DOOR_L, ry - 120, DOOR_R - DOOR_L, 124);
      }
      c.restore();
      // (the doorway's jambs and lintel over it, so it reads going in under the station's arch)
      if (tl.x > DOOR_L - 20) {
        const Y2 = rampH(LEMON);
        box(c, DOOR_L - 3, ry - 96, 5, 96, INK); box(c, DOOR_L - 2, ry - 95, 3, 95, Y2[4]);
        box(c, DOOR_L - 3, ry - 98, DOOR_R - DOOR_L + 6, 6, INK); box(c, DOOR_L - 2, ry - 97, DOOR_R - DOOR_L + 4, 4, Y2[4]);
      }
    }
  }
  // The ball pits: the near lip of the balls (over his feet as he goes in), only what's on screen
  for (const [a, b] of PITS) {
    const l = Math.max(X(a) + 6, state.camera.x - 20), r = Math.min(X(b) - 4, state.camera.x + 820);
    if (r <= l) continue;
    for (let x = l - ((l - X(a) - 6) % 13); x < r; x += 13) { const col = BALLS[Math.abs(Math.floor(x / 13)) % BALLS.length]; ballR(c, x, GY + 14, 6.5, ramp6(hour(col))); }
  }
  // What's thrown
  for (const s of k.throws) {
    if (s.kind === 'hat') {
      // (the stovepipe spinning: its stripes stepped, the brim lit)
      const Tl = ramp6('#14B8A6'), Wt = ramp6('#F8F4EC');
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.45);
      box(c, -16, -3, 32, 7, INK); box(c, -15, -2, 30, 5, Wt[3]); box(c, -15, -2, 30, 1, Wt[5]); box(c, -15, 2, 30, 1, Wt[1]);
      box(c, -10, -25, 20, 24, INK); box(c, -9, -24, 18, 23, Wt[3]);
      for (let i = 0; i < 3; i++) { box(c, -9, -21 + i * 7, 18, 3, Tl[3]); box(c, -9, -21 + i * 7, 4, 3, Tl[4]); box(c, 4, -21 + i * 7, 5, 3, Tl[1]); }
      box(c, -9, -24, 3, 23, 'rgba(255,255,255,0.35)'); box(c, 4, -24, 5, 23, 'rgba(26,16,40,0.18)');
      c.restore();
    } else if (s.kind === 'kite') {
      const o = s.from, hx = mid(o).x + (o.facing ?? 1) * 10, hy = o.pos.y + 20;
      if (s.phase !== 'loose') { c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo((hx + s.x) / 2 - 20, (hy + s.y) / 2 + 30, s.x, s.y + 12); c.stroke(); }
      const shake = s.phase === 'tell' ? Math.sin(f * 1.2) * 0.3 : 0, a = s.phase === 'dive' ? Math.atan2((s.ty ?? s.y) - s.y, (s.tx ?? s.x) - s.x) - Math.PI / 2 : shake;
      const K = ramp6((o.variant ?? 1) === 2 ? '#3B82F6' : '#DC2626'), W2 = ramp6('#FFFFFF');
      c.save(); c.translate(s.x, s.y); c.rotate(a);
      polyF(c, [[0, -17], [14, 0], [0, 17], [-14, 0]], INK);
      polyF(c, [[0, -15], [12, 0], [0, 0]], W2[4]); polyF(c, [[0, -15], [-12, 0], [0, 0]], K[4]);
      polyF(c, [[0, 15], [12, 0], [0, 0]], K[2]); polyF(c, [[0, 15], [-12, 0], [0, 0]], W2[2]);
      box(c, -0.5, -15, 1, 30, hour('#8A5A30')); box(c, -12, -0.5, 24, 1, hour('#8A5A30'));
      for (let i = 0; i < 4; i++) { const tx = Math.sin(f * 0.3 + i) * 3; polyF(c, [[tx - 3, 18 + i * 7], [tx + 3, 18 + i * 7], [tx, 21 + i * 7]], ['#FDE047', '#F472B6'][i % 2]); polyF(c, [[tx - 3, 24 + i * 7], [tx + 3, 24 + i * 7], [tx, 21 + i * 7]], mix(['#FDE047', '#F472B6'][i % 2], INK, 0.3)); }
      c.restore();
    } else if (s.kind === 'paint') {
      const col = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'][(s.from.initialX | 0) % 5 >= 0 ? (s.from.initialX | 0) % 5 : 0];
      ballR(c, s.x, s.y, 5, ramp6(col));
      box(c, s.x - s.vx * 1.5 - 1, s.y - s.vy * 1.5 - 1, 3, 3, mix(col, '#FFFFFF', 0.2)); box(c, s.x - s.vx * 2.6 - 1, s.y - s.vy * 2.6, 2, 2, col);
    } else {
      const col = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'][Number(s.phase) || 0], R = ramp6(col), a = Math.max(0, 1 - Math.max(0, s.t - 150) / 50);
      c.globalAlpha = a;
      c.fillStyle = R[1]; c.beginPath(); c.ellipse(s.x, s.y - 1, 15, 3.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = R[3]; c.beginPath(); c.ellipse(s.x - 1, s.y - 1.5, 12, 2.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = R[3]; c.beginPath(); c.arc(s.x + 10, s.y - 3, 3, 0, Math.PI * 2); c.arc(s.x - 12, s.y - 2, 2, 0, Math.PI * 2); c.fill();
      box(c, s.x - 6, s.y - 3, 4, 1, R[5]); box(c, s.x + 9, s.y - 5, 1, 1, R[5]);
      c.globalAlpha = 1;
    }
  }
};
