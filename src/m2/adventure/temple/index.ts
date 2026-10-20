// THE TEMPLE (BACKSTAGE): in through the Temple of the Jaguar's back door (kicked in, from the dino park), along the
// back of the ride, where every one of its tricks shows how it's done:
//   the catapult:     the "rolling boulder" is a stagehand and a catapult lobbing real ones over the set; they come down
//                     and roll at him. Scaffolding over it. Kill the stagehand, it stops.
//   the dart trap:    the stone faces' poison darts are a stagehand behind the wall with a leaf blower and a bucket of
//                     darts: volleys low (jump them) and high (duck them), a glow at the hole first. Over the wall to him.
//   smoke & mirrors:  a fog machine, a Pepper's-ghost pane with a stagehand in a skeleton suit behind it, and the giant
//                     snake: a puppet head on a pneumatic ram, lunging out over the scaffold he has to climb. Its two
//                     operators are over the wall.
//   the loading station: the line, a long one, in the background; a cart with a family in it. THE LOADING SCENE (first
//                     visit, `loadingSeen`): he kicks them out of it one by one and sits down, and the operators, who
//                     care (or don't), put him on the actual dangerous track. Then he's off to the mine cart (SECTIONS.cart).
// Cast members in the warrior costume (with real spears) along the way.
//
// Backtrackable: back out through the kicked-in back door, to the dino park (it stays open).
// Painted in art.ts (the backstage seen from behind: the set's raw back, the rigs, the station and its line).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Section } from '../section';
import { lay, solid, ledge, teleport, hands, speak, meatheadSays, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound, stopSound } from '../../../m1/game/platform/audio';
import { heard } from '../../bossQuiet';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, KICK_POSE_FRAMES } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { DINO_BACK_DOOR_X } from '../dino';
import { drawRideCart, SEAT_DX, RIDE_SINK, JAGUAR_EXPRESS } from '../rideCart';
import './kinds';
import {
  x0, x1, T, END_WALL, CATAPULT_X, DART_WALL, SNAKE_WALL, SNAKE_Y, SNAKE_REACH, CART_X, SCENE_AT, POSTS, LEDGES, SOLIDS, ACTORS,
  type Temple, type Loading, crewed, DART_EVERY, DART_TELL, DART_SPEED, dartY, SNAKE_CYCLE, SNAKE_WIND, snakeOut, GUESTS, SEAT,
} from './layout';
import { drawTempleBackdrop, drawTempleBack, drawTempleFront, templeLighting } from './art';
import {
  type Dressed, GUEST_KICKED, LINE_ASKS, LINE_ANSWERS, MEATHEAD_BOARDS, OPERATOR_PROTEST, OPERATOR2_ENGAGE,
  HURT_BOULDER, DEATH_BOULDER, HURT_DART, DEATH_DART, HURT_SNAKE, DEATH_SNAKE,
} from './lines';

registerHurtLines('temple_boulder', HURT_BOULDER, DEATH_BOULDER);
registerHurtLines('temple_dart', HURT_DART, DEATH_DART);
registerHurtLines('temple_snake', HURT_SNAKE, DEATH_SNAKE);

const pick = pickLine;
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// Its state

const templeOf = (state: GameState) => sectionState<Temple>(state, 'temple', () => ({ boulders: [], catapultT: 60, darts: [], dartT: 90, dartHigh: false, snakeT: 0, loadingSeen: false, loading: null, fog: [] }));

const pBox = (state: GameState) => {
  const p = state.player;
  const duck = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + duck, w: p.width, h: p.height - duck };
};
const hits = (b: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y;
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;

// ---------------------------------------------------------------------------------------------------------------
// The tricks

/** What the tricks have in the air (or rolling), a stride ahead of each: nobody steps into them (temple-wide). */
const zones: Zone[] = [];
/** Who each boulder's already bowled over (once each). */
const hitBy = new WeakMap<object, Set<object>>();
const runCatapult = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (crewed(state, 1) && px > T + 250 && px < CATAPULT_X + 300 && --tp.catapultT <= 0) {
    tp.catapultT = 120 + Math.floor(Math.random() * 50);
    tp.boulders.push({ x: CATAPULT_X - 30, y: GY - 130, vx: -(5.5 + Math.random() * 2.5), vy: -8 - Math.random() * 3, r: 15, rolling: false, t: 0 });
    if (heard(state, CATAPULT_X)) { playSound('whoosh', 0.8, -8); playSound('clang', 0.5, -10); }
  }
  tp.boulders = tp.boulders.filter(b => {
    b.t++;
    b.x += b.vx;
    if (!b.rolling) {
      b.vy += 0.32; b.y += b.vy;
      if (b.y + b.r >= GY) { b.y = GY - b.r; b.rolling = true; b.vy = 0; if (heard(state, b.x)) { playSound('thud', 0.8, -8); shakeScreen(state, 5, 3); } }
    } else b.vx = Math.max(-7, b.vx * 0.995);
    if (canHurt(state) && hits(pBox(state), b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)) {
      hurtPlayer(ctx, 14, 'temple_boulder', { x: -5, y: -5 });
    }
    // (a warrior in its way: bowled over; a little one, flat)
    for (const e of hazardVictims(state)) if (boxHits(e, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2) && !hitBy.get(b)?.has(e)) {
      (hitBy.get(b) ?? hitBy.set(b, new Set()).get(b)!).add(e);
      hazardHit(ctx, e, 60, b.x + 40, 'BOWLED OVER!', { knock: 10 });
    }
    zones.push({ x0: b.x - b.r - (b.rolling ? 90 : 20), x1: b.x + b.r + 10, y0: b.y - b.r, y1: b.rolling ? GY : b.y + b.r + 60 });
    // (into the back of the flats at the near end: it smashes)
    if (b.x < T + 230 || b.t > 500) {
      for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.3) * 5, y: -2 - Math.random() * 4 }, life: 40, color: i % 2 ? '#78716C' : '#A8A29E', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
      if (heard(state, b.x)) playSound('crumble', 0.6);
      return false;
    }
    return true;
  });
};

const runDarts = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (crewed(state, 2) && px > T + 1750 && px < DART_WALL) {
    tp.dartT--;
    if (tp.dartT === DART_TELL && heard(state, DART_WALL)) playSound('click', 0.5, 6);
    if (tp.dartT <= 0) {
      tp.dartT = DART_EVERY;
      for (let i = 0; i < 2; i++) tp.darts.push({ x: DART_WALL - 4 - i * 30, y: dartY(tp.dartHigh) });
      if (heard(state, DART_WALL)) { playSound('whoosh', 0.7, 10); playSound('dart', 0.6); }
      tp.dartHigh = !tp.dartHigh;
    }
  }
  tp.darts = tp.darts.filter(d => {
    d.x -= DART_SPEED;
    if (canHurt(state) && hits(pBox(state), d.x, d.y - 2, 18, 4)) { hurtPlayer(ctx, 8, 'temple_dart', { x: -3, y: -2 }); return false; }
    const e = hazardVictims(state).find(o => boxHits(o, d.x, d.y - 2, 18, 4));
    if (e) { hazardHit(ctx, e, 25, d.x + 30, 'DARTED!', { knock: 3 }); playSound('dart', 0.5, 4); return false; }
    zones.push({ x0: d.x - 70, x1: d.x + 18, y0: d.y - 2, y1: d.y + 2 });
    return d.x > T + 1750;
  });
};

const runSnake = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (!crewed(state, 3)) return;
  if (px > T + 3300 && px < SNAKE_WALL + 400) tp.snakeT++;
  const s = snakeOut(tp.snakeT);
  if (tp.snakeT % SNAKE_CYCLE === SNAKE_WIND) playSound('whoosh', 0.9, -6);
  if (tp.snakeT % SNAKE_CYCLE === 4) playSound('snort', 0.5, 10);
  // (its reach, out from the wall: nobody stands about in that)
  zones.push({ x0: SNAKE_WALL - SNAKE_REACH - 30, x1: SNAKE_WALL, y0: SNAKE_Y - 30, y1: SNAKE_Y + 30 });
  if (s.k > 0.3) {
    const hx = SNAKE_WALL - s.k * SNAKE_REACH;
    for (const e of hazardVictims(state)) if (boxHits(e, hx - 30, SNAKE_Y - 30, 70, 60)) hazardHit(ctx, e, 40, hx + 40, 'BITTEN!', { knock: 8 });
    if (canHurt(state) && hits(pBox(state), hx - 30, SNAKE_Y - 30, 70, 60)) hurtPlayer(ctx, 12, 'temple_snake', { x: -6, y: -4 });
  }
};

const runFog = (state: GameState, tp: Temple) => {
  if (state.frame % 14 === 0 && Math.abs(state.player.pos.x - (T + 3450)) < 900) tp.fog.push({ x: T + 3460, y: GY - 14 - Math.random() * 12, r: 10 + Math.random() * 8, t: 0, vx: 0.6 + Math.random() * 0.8 });
  tp.fog = tp.fog.filter(f => { f.t++; f.x += f.vx; f.y -= 0.06; f.r += 0.25; return f.t < 260; });
};

// ---------------------------------------------------------------------------------------------------------------
// The loading scene

/** How long the scene's held after he's sent off, before the ride itself (frames: a beat, ~1.75 s). */
const SENT_OFF_HOLD = 105;
/** Frames from the kick starting to the boot all the way out (where it lands). */
const KICK_LANDS = 9;

const startLoading = (state: GameState, tp: Temple) => {
  tp.loadingSeen = true;
  tp.loading = { step: 0, t: 0, walked: false, kicked: 0, boot: 0, flying: [], said: null, busy: false, rolling: 0 };
  state.player.inCutscene = true;
};
const say = (ld: Loading, who: string, text: string, next: () => void) => {
  ld.busy = true;
  speak(who, text, s => { ld.said = s ? { who, s } : null; }, true, () => { ld.busy = false; next(); });
};

const handOff = (state: GameState) => {
  const p = state.player;
  p.carried = false; p.hidden = false; p.inCutscene = false; p.cartSeat = false;
  teleport(state, SECTIONS.cart.x0 + 150, GY);
  (getAdv(state)!.s as Record<string, unknown>).cartBoarded = true;
};

const endLoading = (state: GameState, tp: Temple, skipped: boolean) => {
  if (skipped) silenceAll();
  // (the alarm stops with the scene)
  stopSound('alarm');
  state.player.kickPose = 0;
  tp.loading = null;
  handOff(state);
};

const runLoading = (ctx: FrameContext, tp: Temple): Controls => {
  const { state } = ctx, p = state.player;
  const ld = tp.loading!;
  ld.t++;
  p.inCutscene = true;
  if (ld.t > SKIP_AFTER) offerSkip();
  if (ld.t > SKIP_AFTER && takeSkip()) { endLoading(state, tp, true); return hands(); }
  const dr = dressed(state);
  for (const g of ld.flying) { g.vy += 0.4; g.x += g.vx; g.y += g.vy; g.rot += 0.18; }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  // Up to the cart
  if (!ld.walked) {
    const to = CART_X - 100;
    p.facing = 1;
    if (p.pos.x + p.width / 2 < to) { p.pos.x += 3; p.vel.x = 0.01; }
    else { ld.walked = true; ld.t = 0; }
    return hands();
  }
  // One at a time out of the cart, each with something to say about it; then the line has its say
  if (ld.kicked < GUESTS.length) {
    p.facing = 1;
    // (the boot comes up and drives out; it lands on the cart when it's all the way out, and out they go)
    if (!ld.boot && !ld.busy && ld.t > 16) { ld.boot = 1; p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.6, -4); }
    else if (ld.boot && ++ld.boot > KICK_LANDS) {
      const i = ld.kicked, g = GUESTS[i];
      ld.kicked++; ld.t = 0; ld.boot = 0;
      playSound('punch', 1); playSound('whoosh', 0.6); shakeScreen(state, 5, 3);
      ld.flying.push({ seed: g.seed, woman: g.woman, x: CART_X + SEAT[i], y: GY - 30, vx: -(5 + i), vy: -10 - i, rot: 0 });
      say(ld, g.woman ? 'm2.guest' : 'm2.guest2', GUEST_KICKED[dr][i], () => {});
    }
    return hands();
  }
  // In he gets
  if (ld.step === 0 && !ld.busy) {
    ld.step = 1;
    p.carried = true; p.cartSeat = true; p.facing = 1; p.pos.x = CART_X + SEAT_DX - p.width / 2; p.pos.y = GY - RIDE_SINK - p.height; p.vel.x = 0; p.vel.y = 0;
    playSound('land', 0.8); playSound('clang', 0.4, -4);
    say(ld, 'm2.guest', LINE_ASKS, () => say(ld, 'm2.guest2', LINE_ANSWERS, () => {
      ld.busy = true; meatheadSays(state, pick(MEATHEAD_BOARDS), true, () => { ld.busy = false; ld.step = 2; });
    }));
  }
  if (ld.step === 2) {
    ld.step = 3;
    say(ld, 'm2.operator', OPERATOR_PROTEST[dr], () => say(ld, 'm2.operator2', OPERATOR2_ENGAGE, () => { ld.step = 4; ld.t = 0; }));
  }
  if (p.carried) { p.cartSeat = true; p.pos.x = CART_X + SEAT_DX + ld.rolling - p.width / 2; p.pos.y = GY - RIDE_SINK - p.height; }
  // The lever; and away it goes
  if (ld.step === 4) {
    if (ld.t === 10) { playSound('clang', 1, -8); playSound('thud', 0.8); }
    if (ld.t === 30) playSound('grind', 0.7, -6);
    // (the alarm, from the lever thrown, going the whole time he's sent off: one ring after another)
    if (ld.t >= 12 && (ld.t - 12) % 54 === 0) playSound('alarm', 0.5);
    if (ld.t > 30) ld.rolling += Math.min(9, (ld.t - 30) * 0.25);
    // (into the tunnel: gone into the dark of it once he's past its mouth; the scene held on a beat after)
    if (p.pos.x + p.width / 2 > END_WALL - 6) p.hidden = true;
    if (ld.t > 80 + SENT_OFF_HOLD) endLoading(state, tp, false);
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

export const temple: Section = {
  id: 'temple', x0, x1,
  checkpoints: [
    { name: 'THE TEMPLE (BACKSTAGE)', cp: 40, x: T + 150, y: GY },
    // (past the catapult's crew, short of the darts' run (they fall at T + 1750): halfway to the snake)
    { name: 'THE DART TRAP', cp: 41, x: T + 1720, y: GY },
    { name: 'SMOKE AND MIRRORS', cp: 42, x: T + 3050, y: GY },
    // (down off the snake's scaffold, past its reach (it only runs short of here): the station ahead; the loading
    // scene still to come, as it would be (it's never been, this far on: it hands him straight to the cart))
    { name: 'THE LOADING STATION', cp: 43, x: T + 4300, y: GY },
  ],
  build: (state) => {
    const n0 = state.blocks.length;
    lay(state, [{ x1: T - 200, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
    for (const [x, top, w] of SOLIDS) solid(state, x, top, w, GY - top);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w);
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    ACTORS.forEach(([x, y], i) => { const e = makeKindEnemy('m2:actor' as EnemyKind, x, y); e.variant = i; state.enemies.push(e); });
    for (const [post, x, face] of POSTS) {
      const e: Enemy = makeKindEnemy('m2:stagehand' as EnemyKind, x, GY);
      e.variant = post; e.facing = face; e.homeX = e.pos.x;
      state.enemies.push(e);
    }
    templeOf(state);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const tp = templeOf(state);
    if (tp.loading) return runLoading(ctx, tp);
    const cx = p.pos.x + p.width / 2;
    // Back out through the back door (kicked in: it stays open)
    if (cx < T + 70 && controls.left) { teleport(state, DINO_BACK_DOOR_X, GY); p.facing = -1; return controls; }
    zones.length = 0;
    runCatapult(ctx, tp);
    runDarts(ctx, tp);
    runSnake(ctx, tp);
    setHazardZones(state, 'temple', zones);
    runFog(state, tp);
    // The station: the first time, the scene; after, the cart's straight there to get in
    if (p.isGrounded && cx > SCENE_AT) {
      if (!tp.loadingSeen) { startLoading(state, tp); return hands(); }
      if (cx > CART_X - 40) { handOff(state); return controls; }
    }
    return controls;
  },
  drawBackdrop: (c, state) => { drawTempleBackdrop(c, state); return true; },
  // (and the back of the ride's cart, over all that: behind whoever's sat in it)
  drawBack: (c, state) => {
    drawTempleBack(c, state, templeOf(state));
    // (clipped at the end wall: it rolls off into the tunnel there)
    c.save(); c.beginPath(); c.rect(T - 400, GY - 1000, END_WALL - T + 400, 1100); c.clip();
    drawRideCart(c, CART_X + (templeOf(state).loading?.rolling ?? 0), GY, state.frame, JAGUAR_EXPRESS, true);
    c.restore();
  },
  drawFront: (c, state) => drawTempleFront(c, state, templeOf(state)),
  lighting: (state) => templeLighting(state, templeOf(state)),
  drawHud: (c, state) => {
    const tp = templeOf(state);
    if (tp.loading && tp.loading.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

