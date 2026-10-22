// The ride's tricks, from the guests' side: what the temple's backstage showed from behind (temple/), out here on the
// unfriendly track and set to real. Each one set off by its stagehand as the cart comes (once a go: the ride's show
// cues, nothing broken, so a checkpoint finds them all reset and loaded):
//   the idols:   carved heads on plinths at the track's far edge, facing back down it; the mouth glows, then a volley of
//                darts comes down the track (rim-high, over the cart's rim: jump it; head-high: duck). The stagehand's
//                behind the plinth with the leaf blower.
//   the serpent: the Serpent of Doom, out of its hole in the rock behind the track: it rears back (its eyes lit, the
//                hiss), then lunges out right across the track at head height, holds, and goes back in (duck; or be
//                slow enough that it's going back in).
//   the boulder: lobbed over the set (the catapult behind it): it comes down on the track ahead and rolls back at him
//                (jump it); on behind him, it'll have Artie.
//   the big one: the doors in a fake rock wall bang open as he passes and THE ROLLING BOULDER comes out after him,
//                right on his tail, gaining, dropping back, gaining, to the gap, where it goes down. A red herring (the
//                user's: "the boulder trap on the mine cart cannot catch up to you"): it never reaches him, never hurts
//                him (it'll still have Artie, or anybody else in its way).
// They hit whoever's in the way: him, Artie in his cart, anybody else (hazardHit.ts).
//
// Painted in trickArt.ts.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { registerHurtLines } from '../../kinds';
import { IDOLS, SNAKES, LOBS, CHASE_DOORS, trackY, artieTrackY } from './layout';
import {
  HURT_CART_DART, DEATH_CART_DART, HURT_CART_SNAKE, DEATH_CART_SNAKE, HURT_CART_BOULDER, DEATH_CART_BOULDER,
  HURT_CART_CHASE, DEATH_CART_CHASE,
} from './lines';

registerHurtLines('cart_dart', HURT_CART_DART, DEATH_CART_DART);
registerHurtLines('cart_snake', HURT_CART_SNAKE, DEATH_CART_SNAKE);
registerHurtLines('cart_boulder', HURT_CART_BOULDER, DEATH_CART_BOULDER);
registerHurtLines('cart_chase', HURT_CART_CHASE, DEATH_CART_CHASE);

// ---------------------------------------------------------------------------------------------------------------
// Timing

/** The idols: the glow starts with the cart this far off; the volley after the tell; the darts' speed and spacing. */
export const IDOL_CUE = 1000, IDOL_TELL = 60, DART_V = 6, DART_GAP = 44, DART_N = 3, DART_LEN = 20;
/** How far over the rail the darts fly at the idol (rim-high: over the cart's rim, under his ducked head; head-high). */
export const dartRise = (high: boolean) => (high ? 72 : 48);
/** The serpent: cued with the cart this far off; rearing back (the tell), the lunge, out, and back in (frames). */
export const SNAKE_CUE = 520, SNAKE_REAR = 30, SNAKE_LUNGE = 8, SNAKE_HOLD = 64, SNAKE_BACK = 30;
/** Its head, over the rail (bottom, top): the bottom over his ducked head, under his head sat up. */
export const SNAKE_LOW = 56, SNAKE_HIGH = 120;
/** How far back its hole is, how far toward the eye it gets (past him: it's right across the track). */
export const SNAKE_D0 = 0.86, SNAKE_D1 = 1.07;
/** The lobbed boulder: thrown with the cart this far short of where it lands; in the air so long; from how far back
 *  (the catapult, behind the set), how far past where it lands; its size and roll. */
export const LOB_CUE = 925, LOB_FLIGHT = 50, LOB_D0 = 0.86, LOB_FROM = 330, LOB_R = 24, LOB_ROLL = 5;
/** The big one: out with the cart this far past its doors; how long it takes coming out; its size and top speed. */
export const CHASE_CUE = 60, CHASE_OUT = 26, CHASE_R = 56, CHASE_V = 8.9, CHASE_D0 = 0.86;

/** The serpent's reach, at t (frames since cued): 0 in its hole, 1 right out across the track; whether it's rearing. */
export const snakeAt = (t: number) => {
  if (t <= 0) return { k: 0, rear: false };
  if (t < SNAKE_REAR) return { k: -0.06 * (t / SNAKE_REAR), rear: true };
  let u = t - SNAKE_REAR;
  if (u < SNAKE_LUNGE) return { k: u / SNAKE_LUNGE, rear: false };
  u -= SNAKE_LUNGE;
  if (u < SNAKE_HOLD) return { k: 1, rear: false };
  u -= SNAKE_HOLD;
  return { k: Math.max(0, 1 - u / SNAKE_BACK), rear: false };
};
export const snakeDepth = (k: number) => SNAKE_D0 + Math.max(0, k) * (SNAKE_D1 - SNAKE_D0);

// ---------------------------------------------------------------------------------------------------------------
// Its state

export interface Dart { x: number; y: number; high: boolean; from: number; gone: number }
export interface Boulder {
  /** Where it is (its middle: world, his plane's units), how far back (1: on the track), its roll. */
  x: number; y: number; d: number; rot: number;
  vx: number; vy: number; r: number;
  /** Lobbed (in the air, coming in over the set), rolling down the track, gone down a gap; the big one coming out. */
  mode: 'lob' | 'roll' | 'fall' | 'out';
  t: number; big: boolean;
  /** (where it was thrown from, where it lands) */
  sx: number; sy: number; ex: number; ey: number;
  /** Shoved back off the cart: holds off a moment. */
  back: number;
  /** Who it's had (once each: Artie, anybody else). */
  had: Set<object>;
}
export interface Tricks {
  /** Per idol: 0 not yet, >0 frames since the glow came on (it fires at IDOL_TELL), -1 done. */
  idol: number[];
  darts: Dart[];
  /** Per serpent: frames since it was cued (0 not yet). */
  snake: number[];
  /** Per catapult: frames since it threw (0 not yet). */
  lob: number[];
  boulders: Boulder[];
  /** The big one: frames since its doors went (0 not yet). */
  chase: number;
}
export const newTricks = (): Tricks => ({
  idol: IDOLS.map(() => 0), darts: [], snake: SNAKES.map(() => 0), lob: LOBS.map(() => 0), boulders: [], chase: 0,
});

/** Who else is on the track (Artie, in his cart): where he is, and what happens when one of these has him. */
export interface Rider { on: boolean; x: number; hit: (what: 'dart' | 'snake' | 'boulder', dmgX: number) => void }
/** What the tricks need of the cart. */
export interface CartView { x: number; y: number; air: boolean; ride: boolean; /** frames it's been rolling (just back at a checkpoint: nothing's cued till it's going) */ t: number }

/** Where the cart's tub is (world box). */
const tubBox = (cart: CartView) => ({ x: cart.x - 60, y: cart.y - 45, w: 120, h: 45 });
const pBox = (state: GameState) => {
  const p = state.player;
  const duck = p.isDucking ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + duck, w: p.width, h: p.height - duck };
};
type Box = { x: number; y: number; w: number; h: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const circleBox = (cx: number, cy: number, r: number, b: Box) => {
  const nx = Math.max(b.x, Math.min(cx, b.x + b.w)), ny = Math.max(b.y, Math.min(cy, b.y + b.h));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
};
/** (Artie, in a boulder's list of who it's had) */
const ARTIE = {};
const artieBox = (x: number): Box => { const y = artieTrackY(x); return { x: x - 50, y: y - 80, w: 100, h: 80 }; };
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;
/** The chunks, when a boulder goes to bits. */
const smash = (state: GameState, b: Boulder) => {
  for (let i = 0; i < (b.big ? 22 : 12); i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 40, color: ['#78716C', '#A8A29E', '#57534E'][i % 3], size: 3 + Math.random() * (b.big ? 8 : 5), grav: 0.3, chunk: true });
  playSound('crumble', 0.8); playSound('crash', 0.5, -6);
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** `firstTime(kind)`: the first of that kind this go (he's got something to say about it, the first time). */
export const runTricks = (ctx: FrameContext, tr: Tricks, cart: CartView, artie: Rider, firstTime: (kind: 'dart' | 'snake' | 'lob' | 'chase') => void) => {
  const { state } = ctx;
  const zones: Zone[] = [];
  const me = pBox(state);
  // (just put back in it: nothing new set off at him till he's rolling)
  const cue = cart.ride && cart.t > 90;
  let hurtMe = false;
  // The idols: the glow, then the volley
  IDOLS.forEach((idol, i) => {
    const t = tr.idol[i];
    if (t === 0 && cue && cart.x > idol.x - IDOL_CUE && cart.x < idol.x) { tr.idol[i] = 1; playSound('click', 0.6, 6); playSound('beep', 0.3, -8); return; }
    if (t <= 0) return;
    tr.idol[i]++;
    if (tr.idol[i] === IDOL_TELL) {
      const y = (trackY(idol.x) ?? 0) - dartRise(idol.high);
      for (let k = 0; k < DART_N; k++) tr.darts.push({ x: idol.x - 20 + k * DART_GAP, y, high: idol.high, from: idol.x, gone: -k * 3 });
      playSound('whoosh', 0.8, 10); playSound('dart', 0.7);
      firstTime('dart');
    }
    if (tr.idol[i] > IDOL_TELL + 30) tr.idol[i] = -1;
  });
  tr.darts = tr.darts.filter(d => {
    // (each out of the mouth in its turn: the volley strung out behind the first)
    if (d.gone < 0) { d.gone++; return true; }
    d.x -= DART_V; d.gone++;
    const box = { x: d.x, y: d.y - 2, w: DART_LEN, h: 4 };
    if (canHurt(state) && overlap(me, box)) { hurtMe = true; hurtPlayer(ctx, 9, 'cart_dart'); playSound('dart', 0.6, -4); return false; }
    if (artie.on && overlap(artieBox(artie.x), box)) { artie.hit('dart', d.x + 40); playSound('dart', 0.6, 4); return false; }
    const e = hazardVictims(state).find(o => boxHits(o, box.x, box.y, box.w, box.h));
    if (e) { hazardHit(ctx, e, 25, d.x + 30, 'DARTED!', { knock: 3 }); return false; }
    zones.push({ x0: d.x - 70, x1: d.x + DART_LEN, y0: d.y - 2, y1: d.y + 2 });
    return d.gone < 260;
  });
  // The serpent
  SNAKES.forEach((sx, i) => {
    if (tr.snake[i] === 0) { if (cue && cart.x > sx - SNAKE_CUE && cart.x < sx) { tr.snake[i] = 1; playSound('snort', 0.6, 10); } return; }
    const t = ++tr.snake[i];
    if (t === 8) playSound('snort', 0.7, 14);
    if (t === SNAKE_REAR) { playSound('whoosh', 1, -6); playSound('clang', 0.5, -12); firstTime('snake'); }
    const s = snakeAt(t);
    if (s.k < 0.75) return;
    const rail = trackY(sx) ?? artieTrackY(sx);
    const head = { x: sx - 40, y: rail - SNAKE_HIGH, w: 80, h: SNAKE_HIGH - SNAKE_LOW };
    zones.push({ x0: head.x, x1: head.x + head.w, y0: head.y, y1: head.y + head.h });
    if (canHurt(state) && overlap(me, head)) { hurtMe = true; hurtPlayer(ctx, 14, 'cart_snake'); shakeScreen(state, 8, 4); playSound('punch', 0.9); }
    if (artie.on && Math.abs(artie.x - sx) < 50) artie.hit('snake', sx + 40);
    for (const e of hazardVictims(state)) if (boxHits(e, head.x, head.y, head.w, head.h)) hazardHit(ctx, e, 40, sx + 40, 'BITTEN!', { knock: 8 });
  });
  // The catapults: over the set, onto the track, rolling back
  LOBS.forEach((lx, i) => {
    if (tr.lob[i] === 0) {
      if (!cue || cart.x < lx - LOB_CUE || cart.x > lx - 200) return;
      const ey = (trackY(lx) ?? 0) - LOB_R;
      tr.lob[i] = 1;
      tr.boulders.push({ x: lx + LOB_FROM, y: ey - 136, d: LOB_D0, rot: 0, vx: 0, vy: 0, r: LOB_R, mode: 'lob', t: 0, big: false, sx: lx + LOB_FROM, sy: ey - 136, ex: lx, ey, back: 0, had: new Set() });
      playSound('whoosh', 0.9, -8); playSound('clang', 0.6, -10); playSound('thud', 0.5, -6);
      firstTime('lob');
    } else tr.lob[i]++;
  });
  // The big one
  if (!tr.chase && cue && cart.x > CHASE_DOORS + CHASE_CUE && cart.x < CHASE_DOORS + 900) {
    tr.chase = 1;
    const y = (trackY(CHASE_DOORS) ?? 0) - CHASE_R;
    tr.boulders.push({ x: CHASE_DOORS, y, d: CHASE_D0, rot: 0, vx: 0, vy: 0, r: CHASE_R, mode: 'out', t: 0, big: true, sx: CHASE_DOORS, sy: y, ex: CHASE_DOORS, ey: y, back: 0, had: new Set() });
    playSound('crash', 1, -10); playSound('boom', 0.6, -12); playSound('rumble', 1); shakeScreen(state, 16, 8);
    firstTime('chase');
  } else if (tr.chase) tr.chase++;
  const tub = tubBox(cart);
  tr.boulders = tr.boulders.filter(b => {
    b.t++;
    if (b.mode === 'lob') {
      // (in over the top of the set, coming forward out of the back onto the track)
      const u = Math.min(1, b.t / LOB_FLIGHT);
      b.x = b.sx + (b.ex - b.sx) * u;
      b.y = b.sy + (b.ey - b.sy) * u - 260 * 4 * u * (1 - u);
      b.d = LOB_D0 + (1 - LOB_D0) * u;
      b.rot -= 0.08;
      if (u >= 1) { b.mode = 'roll'; b.vx = -LOB_ROLL; playSound('thud', 1, -8); playSound('clang', 0.5, -6); shakeScreen(state, 6, 3); }
      return true;
    }
    if (b.mode === 'out') {
      // (out through its doors, forward onto the track, getting going)
      const u = Math.min(1, b.t / CHASE_OUT);
      b.d = CHASE_D0 + (1 - CHASE_D0) * u * u;
      b.x += 0.6 * u; b.rot += 0.03 * u;
      if (b.t % 6 === 0) shakeScreen(state, 4, 3);
      if (u >= 1) { b.mode = 'roll'; b.vx = 6; }
      return true;
    }
    // Rolling: along the rail (off the end of one, down the gap)
    if (b.mode === 'roll') {
      if (b.big) {
        if (b.back > 0) b.back--;
        b.vx += ((b.back ? 5 : CHASE_V) - b.vx) * 0.08;
        // (never on him: right behind the cart's tail at the closest, falling back a bit and gaining again)
        const near = tub.x - b.r - 14 - (Math.sin(b.t * 0.035) * 0.5 + 0.5) * 70;
        if (cart.ride && b.x + b.vx > near) b.vx = Math.max(0, Math.min(b.vx, near - b.x));
        if (state.frame % 10 === 0) { playSound('rumble', 0.5); shakeScreen(state, 3, 3); }
      }
      b.x += b.vx;
      const ty = trackY(b.x);
      if (ty === null) { b.mode = 'fall'; b.vy = 1; }
      else b.y = ty - b.r;
      b.rot += b.vx / b.r;
    } else {
      b.vy += 0.5; b.y += b.vy; b.x += b.vx * 0.6; b.rot += b.vx / b.r;
      if (b.vy > 6 && b.vy < 6.6) { playSound('crash', 0.5, -14); if (b.big) shakeScreen(state, 10, 6); }
      return b.y < (trackY(b.x - b.vx * 20) ?? state.camera.y + 700) + 900;
    }
    // Who's in its way
    // (a little one: into the side of the cart, to bits. The big one never gets to him)
    if (cart.ride && !b.big && circleBox(b.x, b.y, b.r - 2, tub)) {
      if (canHurt(state)) { hurtMe = true; hurtPlayer(ctx, 14, 'cart_boulder'); }
      shakeScreen(state, 10, 5); smash(state, b);
      return false;
    }
    if (artie.on && !b.had.has(ARTIE) && circleBox(b.x, b.y, b.r, artieBox(artie.x))) {
      b.had.add(ARTIE); artie.hit('boulder', b.x + 60);
      if (!b.big) { smash(state, b); return false; }
    }
    for (const e of hazardVictims(state)) if (!b.had.has(e) && boxHits(e, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)) {
      b.had.add(e); hazardHit(ctx, e, b.big ? 200 : 60, b.x - b.vx * 10, 'BOWLED OVER!', { knock: 10 });
    }
    zones.push({ x0: b.x - b.r - (b.vx < 0 ? 90 : 0), x1: b.x + b.r + (b.vx > 0 ? 90 : 0), y0: b.y - b.r, y1: b.y + b.r, ground: true });
    // (rolled off well out of the way)
    return Math.abs(b.x - state.camera.x - 400) < 2600;
  });
  setHazardZones(state, 'cart', zones);
  return { hurt: hurtMe };
};

