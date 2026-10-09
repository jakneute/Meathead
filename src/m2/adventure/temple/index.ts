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
// Crude on purpose (the first pass): boxes and words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Section, Said } from '../section';
import { lay, solid, ledge, teleport, hands, box, label, saidOver, speak, meatheadSays, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { DINO_BACK_DOOR_X } from '../dino';
import { drawPerson } from './people';
import { drawRideCart, SEAT_DX, RIDE_SINK, JAGUAR_EXPRESS } from '../rideCart';
import './kinds';
import {
  type Dressed, GUEST_KICKED, LINE_ASKS, LINE_ANSWERS, MEATHEAD_BOARDS, OPERATOR_PROTEST, OPERATOR2_ENGAGE,
  HURT_BOULDER, DEATH_BOULDER, HURT_DART, DEATH_DART, HURT_SNAKE, DEATH_SNAKE,
} from './lines';

const { x0, x1 } = SECTIONS.temple;
const T = x0;
type Ctx = CanvasRenderingContext2D;

registerHurtLines('temple_boulder', HURT_BOULDER, DEATH_BOULDER);
registerHurtLines('temple_dart', HURT_DART, DEATH_DART);
registerHurtLines('temple_snake', HURT_SNAKE, DEATH_SNAKE);

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The layout

const CATAPULT_X = T + 1500, DART_WALL = T + 2700, DART_TOP = GY - 200, SNAKE_WALL = T + 3900, SNAKE_TOP = GY - 340;
const SNAKE_Y = GY - 268, SNAKE_REACH = 230;
const STATION_X = T + 4400, CART_X = T + 5300, BOOTH_X = T + 5470, SCENE_AT = T + 5130;
/** The stagehands' posts, by which trick they run (`variant`). */
const POSTS: [number, number, 1 | -1][] = [[1, T + 1600, -1], [2, T + 2810, -1], [3, T + 4020, -1], [3, T + 4070, -1]];

const LEDGES: [number, number, number][] = [
  // over the catapult's run
  [T + 650, GY - 120, 160], [T + 950, GY - 200, 160], [T + 1250, GY - 120, 140],
  // up the dart wall
  [T + 2560, GY - 110, 120],
  // the snake's scaffold (this side), and down the far side
  [T + 3560, GY - 115, 140], [T + 3760, GY - 230, 140], [T + 3970, GY - 230, 110], [T + 4100, GY - 115, 120],
  // the queue's rail, by the station
  [T + 4600, GY - 110, 200],
];
const SOLIDS: [number, number, number][] = [
  [T - 60, GY - 700, 70], [DART_WALL, DART_TOP, 40], [SNAKE_WALL, SNAKE_TOP, 50],
  // the end of the station (past the cart, the track goes on through a wall)
  [T + 5800, GY - 700, 200],
];
const ACTORS = [T + 1050, T + 2050, T + 2400, T + 3300, T + 4500];

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Boulder { x: number; y: number; vx: number; vy: number; r: number; rolling: boolean; t: number }
interface Dart { x: number; y: number }
interface Flyer { seed: number; woman: boolean; x: number; y: number; vx: number; vy: number; rot: number }
interface Loading {
  step: number; t: number; walked: boolean;
  kicked: number; flying: Flyer[];
  /** The boot on its way out (frames since it started; 0: not kicking). */
  boot: number;
  said: { who: string; s: Said } | null; busy: boolean;
  rolling: number;
}
interface Temple {
  boulders: Boulder[]; catapultT: number;
  darts: Dart[]; dartT: number; dartHigh: boolean;
  snakeT: number;
  /** First visit: the loading scene's been (a revisit would skip it). */
  loadingSeen: boolean;
  loading: Loading | null;
  fog: { x: number; y: number; r: number; t: number; vx: number }[];
}
const templeOf = (state: GameState) => sectionState<Temple>(state, 'temple', () => ({ boulders: [], catapultT: 60, darts: [], dartT: 90, dartHigh: false, snakeT: 0, loadingSeen: false, loading: null, fog: [] }));

/** Is the stagehand running this trick still at it? */
const crewed = (state: GameState, post: number) => state.enemies.some(e => e.kind === 'm2:stagehand' && e.variant === post && e.health > 0 && !e.isBlownAway);
const pBox = (state: GameState) => {
  const p = state.player;
  const duck = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + duck, w: p.width, h: p.height - duck };
};
const hits = (b: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y;
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;

// ---------------------------------------------------------------------------------------------------------------
// The tricks

const runCatapult = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (crewed(state, 1) && px > T + 250 && px < CATAPULT_X + 300 && --tp.catapultT <= 0) {
    tp.catapultT = 120 + Math.floor(Math.random() * 50);
    tp.boulders.push({ x: CATAPULT_X - 30, y: GY - 130, vx: -(5.5 + Math.random() * 2.5), vy: -8 - Math.random() * 3, r: 15, rolling: false, t: 0 });
    playSound('whoosh', 0.8, -8); playSound('clang', 0.5, -10);
  }
  tp.boulders = tp.boulders.filter(b => {
    b.t++;
    b.x += b.vx;
    if (!b.rolling) {
      b.vy += 0.32; b.y += b.vy;
      if (b.y + b.r >= GY) { b.y = GY - b.r; b.rolling = true; b.vy = 0; playSound('thud', 0.8, -8); shakeScreen(state, 5, 3); }
    } else b.vx = Math.max(-7, b.vx * 0.995);
    if (canHurt(state) && hits(pBox(state), b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)) {
      hurtPlayer(ctx, 14, 'temple_boulder', { x: -5, y: -5 });
    }
    // (into the back of the flats at the near end: it smashes)
    if (b.x < T + 230 || b.t > 500) {
      for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.3) * 5, y: -2 - Math.random() * 4 }, life: 40, color: i % 2 ? '#78716C' : '#A8A29E', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
      playSound('crumble', 0.6);
      return false;
    }
    return true;
  });
};

const DART_EVERY = 75, DART_TELL = 18, DART_SPEED = 9;
const dartY = (high: boolean) => (high ? GY - 52 : GY - 16);
const runDarts = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (crewed(state, 2) && px > T + 1750 && px < DART_WALL) {
    tp.dartT--;
    if (tp.dartT === DART_TELL) playSound('click', 0.5, 6);
    if (tp.dartT <= 0) {
      tp.dartT = DART_EVERY;
      for (let i = 0; i < 2; i++) tp.darts.push({ x: DART_WALL - 4 - i * 30, y: dartY(tp.dartHigh) });
      playSound('whoosh', 0.7, 10); playSound('dart', 0.6);
      tp.dartHigh = !tp.dartHigh;
    }
  }
  tp.darts = tp.darts.filter(d => {
    d.x -= DART_SPEED;
    if (canHurt(state) && hits(pBox(state), d.x, d.y - 2, 18, 4)) { hurtPlayer(ctx, 8, 'temple_dart', { x: -3, y: -2 }); return false; }
    return d.x > T + 1750;
  });
};

const SNAKE_CYCLE = 150, SNAKE_WIND = 40, SNAKE_OUT = 10, SNAKE_HOLD = 24;
/** How far out the snake's head is (0..1), and whether it's rearing back (the tell). */
const snakeOut = (t: number) => {
  const c = t % SNAKE_CYCLE;
  if (c < SNAKE_WIND) return { k: -0.12 * (c / SNAKE_WIND), rear: true };
  if (c < SNAKE_WIND + SNAKE_OUT) return { k: (c - SNAKE_WIND) / SNAKE_OUT, rear: false };
  if (c < SNAKE_WIND + SNAKE_OUT + SNAKE_HOLD) return { k: 1, rear: false };
  return { k: Math.max(0, 1 - (c - SNAKE_WIND - SNAKE_OUT - SNAKE_HOLD) / 40), rear: false };
};
const runSnake = (ctx: FrameContext, tp: Temple) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  if (!crewed(state, 3)) return;
  if (px > T + 3300 && px < SNAKE_WALL + 400) tp.snakeT++;
  const s = snakeOut(tp.snakeT);
  if (tp.snakeT % SNAKE_CYCLE === SNAKE_WIND) playSound('whoosh', 0.9, -6);
  if (tp.snakeT % SNAKE_CYCLE === 4) playSound('snort', 0.5, 10);
  if (s.k > 0.3) {
    const hx = SNAKE_WALL - s.k * SNAKE_REACH;
    if (canHurt(state) && hits(pBox(state), hx - 30, SNAKE_Y - 30, 70, 60)) hurtPlayer(ctx, 12, 'temple_snake', { x: -6, y: -4 });
  }
};

const runFog = (state: GameState, tp: Temple) => {
  if (state.frame % 14 === 0 && Math.abs(state.player.pos.x - (T + 3450)) < 900) tp.fog.push({ x: T + 3460, y: GY - 14 - Math.random() * 12, r: 10 + Math.random() * 8, t: 0, vx: 0.6 + Math.random() * 0.8 });
  tp.fog = tp.fog.filter(f => { f.t++; f.x += f.vx; f.y -= 0.06; f.r += 0.25; return f.t < 260; });
};

// ---------------------------------------------------------------------------------------------------------------
// The loading scene

const GUESTS = [{ seed: 7101, woman: false }, { seed: 3317, woman: true }, { seed: 5523, woman: true }];
/** Where they sit in the cart, from its middle. */
const SEAT = [-34, -6, 22];
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
    if (ld.t === 30) { playSound('alarm', 0.5); playSound('grind', 0.7, -6); }
    if (ld.t > 30) ld.rolling += Math.min(9, (ld.t - 30) * 0.25);
    if (ld.t > 80) endLoading(state, tp, false);
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

export const temple: Section = {
  id: 'temple', x0, x1,
  checkpoints: [
    { name: 'THE TEMPLE (BACKSTAGE)', cp: 40, x: T + 150, y: GY },
    { name: 'SMOKE AND MIRRORS', cp: 41, x: T + 3050, y: GY },
  ],
  build: (state) => {
    const n0 = state.blocks.length;
    lay(state, [{ x1: T - 200, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
    for (const [x, top, w] of SOLIDS) solid(state, x, top, w, GY - top);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w);
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    ACTORS.forEach((x, i) => { const e = makeKindEnemy('m2:actor' as EnemyKind, x, GY); e.variant = i; state.enemies.push(e); });
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
    runCatapult(ctx, tp);
    runDarts(ctx, tp);
    runSnake(ctx, tp);
    runFog(state, tp);
    // The station: the first time, the scene; after, the cart's straight there to get in
    if (p.isGrounded && cx > SCENE_AT) {
      if (!tp.loadingSeen) { startLoading(state, tp); return hands(); }
      if (cx > CART_X - 40) { handOff(state); return controls; }
    }
    return controls;
  },
  drawBackdrop: (c) => {
    // Backstage: black, the underside of the set, work lights
    c.fillStyle = '#0C0A09'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.fillStyle = '#1C1917'; for (let x = 20; x < CANVAS_WIDTH; x += 120) c.fillRect(x, 0, 10, CANVAS_HEIGHT);
    return true;
  },
  // (and the back of the ride's cart, over all that: behind whoever's sat in it)
  drawBack: (c, state) => { drawTempleBack(c, state); drawRideCart(c, CART_X + (templeOf(state).loading?.rolling ?? 0), GY, state.frame, JAGUAR_EXPRESS, true); },
  drawFront: (c, state) => drawTempleFront(c, state),
  drawHud: (c, state) => {
    const tp = templeOf(state);
    if (tp.loading && tp.loading.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass)

const lip = (c: Ctx, x: number, y: number, w: number, col: string) => { box(c, x, y, w, 4, col); box(c, x, y + 4, w, 2, 'rgba(0,0,0,0.3)'); };

const drawTempleBack = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, f = state.frame;
  const vis = (a: number, b: number) => b > cam - 150 && a < cam + CANVAS_WIDTH + 150;
  if (!vis(T - 200, x1)) return;
  const tp = templeOf(state);
  // The floor: painted black plywood, gaffer tape
  box(c, Math.max(T - 200, cam - 50), GY, CANVAS_WIDTH + 100, 400, '#292524');
  box(c, Math.max(T - 200, cam - 50), GY, CANVAS_WIDTH + 100, 3, '#57534E');
  for (let x = Math.floor(cam / 180) * 180; x < cam + CANVAS_WIDTH; x += 180) box(c, x + 40, GY + 6, 30, 3, '#FACC15');
  // The backs of the set's flats along the far side: stud frames, stenciled
  for (let x = Math.floor((cam - 200) / 300) * 300; x < cam + CANVAS_WIDTH + 200; x += 300) {
    if (x < T || x > STATION_X - 100) continue;
    box(c, x, GY - 380, 290, 380, '#4A3A28');
    for (let k = 0; k < 4; k++) box(c, x + k * 96, GY - 380, 6, 380, '#6B5338');
    box(c, x, GY - 260, 290, 6, '#6B5338');
    label(c, 'THIS SIDE BACK', x + 145, GY - 300, '#A8A29E', 7);
  }
  // The back door (kicked in), the break room
  if (vis(T - 60, T + 400)) {
    box(c, T - 60, GY - 700, 70, 700, '#44403C');
    box(c, T + 10, GY - 92, 52, 92, '#0C0A09');
    label(c, 'TO DINO PARK', T + 36, GY - 104, '#A8A29E', 6);
    box(c, T + 220, GY - 70, 90, 70, '#57534E'); label(c, 'BREAK ROOM', T + 265, GY - 80, '#E7E5E4', 7);
    label(c, 'TEMPLE OF THE JAGUAR', T + 300, GY - 420, '#FDE047', 10);
    label(c, 'BACKSTAGE. CAST AND CREW ONLY. NO FLASH PHOTOGRAPHY OF THE MAGIC.', T + 300, GY - 404, '#E7E5E4', 6);
  }
  // The catapult: an A-frame, the arm (back, then flung up), the bucket of boulders
  if (vis(CATAPULT_X - 120, CATAPULT_X + 200)) {
    const cocked = tp.catapultT > 20 ? 1 : tp.catapultT / 20;
    box(c, CATAPULT_X - 60, GY - 30, 140, 30, '#78350F');
    box(c, CATAPULT_X - 10, GY - 90, 14, 60, '#92400E');
    c.save(); c.translate(CATAPULT_X - 3, GY - 84); c.rotate(-0.4 - cocked * 0.9 + (crewed(state, 1) ? 0 : 0.6)); box(c, -6, -100, 10, 104, '#A16207'); box(c, -16, -112, 30, 14, '#57534E'); c.restore();
    for (let i = 0; i < 4; i++) { c.fillStyle = '#78716C'; c.beginPath(); c.arc(CATAPULT_X + 110 + (i % 2) * 22, GY - 14 - (i >> 1) * 22, 12, 0, Math.PI * 2); c.fill(); }
    label(c, 'BOULDERS (REAL)', CATAPULT_X + 120, GY - 64, '#FDE047', 6);
    label(c, 'INSURANCE SAID FOAM', CATAPULT_X + 120, GY - 54, '#FCA5A5', 6);
    label(c, 'THE ROLLING BOULDER', CATAPULT_X, GY - 220, '#FDE047', 8);
  }
  // The dart wall: the backs of the stone faces, the holes (glowing before a volley), the leaf blower behind it
  if (vis(DART_WALL - 100, DART_WALL + 200)) {
    box(c, DART_WALL, DART_TOP, 40, GY - DART_TOP, '#78716C'); lip(c, DART_WALL, DART_TOP, 40, '#D6D3D1');
    const tell = crewed(state, 2) && tp.dartT <= DART_TELL;
    for (const h of [true, false]) {
      const lit = tell && tp.dartHigh === h;
      box(c, DART_WALL - 4, dartY(h) - 4, 6, 8, lit ? (f % 4 < 2 ? '#FDE047' : '#F97316') : '#1C1917');
    }
    box(c, DART_WALL + 40, GY - 70, 30, 6, '#3F3F46');
    label(c, 'POISON DART TRAP', DART_WALL - 60, DART_TOP - 30, '#FDE047', 8);
    label(c, '(LEAF BLOWER, BUCKET OF DARTS)', DART_WALL - 60, DART_TOP - 18, '#E7E5E4', 6);
  }
  // Smoke and mirrors: the fog machine, the ghost pane and the guy in the skeleton suit behind it
  if (vis(T + 3150, T + 3550)) {
    c.save(); c.translate(T + 3300, GY); c.rotate(-0.35); box(c, -4, -170, 8, 170, 'rgba(186, 230, 253, 0.35)'); c.restore();
    c.save(); c.translate(T + 3230, GY); c.scale(-1, 1);
    drawPerson(c, { seed: 909, outfit: 'stage', f, pose: (f % 120) < 60 ? 'fly' : 'stand', mood: 'bored' });
    c.restore();
    c.fillStyle = '#F5F5F4'; for (let i = 0; i < 4; i++) c.fillRect(T + 3226 - 6, GY - 50 + i * 8, 12, 2);
    label(c, "PEPPER'S GHOST", T + 3290, GY - 200, '#FDE047', 8);
    label(c, '(DO NOT LEAN ON GLASS)', T + 3290, GY - 188, '#E7E5E4', 6);
    box(c, T + 3420, GY - 34, 50, 34, '#3F3F46'); label(c, 'FOG', T + 3445, GY - 14, '#E7E5E4', 7);
  }
  // The snake rig: the wall, the ram and its hose, the lever on the far side
  if (vis(SNAKE_WALL - 300, SNAKE_WALL + 250)) {
    box(c, SNAKE_WALL, SNAKE_TOP, 50, GY - SNAKE_TOP, '#57534E'); lip(c, SNAKE_WALL, SNAKE_TOP, 50, '#A8A29E');
    box(c, SNAKE_WALL + 50, SNAKE_Y - 8, 90, 16, '#3F3F46');
    box(c, SNAKE_WALL + 140, GY - 80, 10, 80, '#71717A');
    label(c, 'THE SERPENT OF DOOM', SNAKE_WALL - 150, SNAKE_TOP - 40, '#FDE047', 8);
    label(c, '(PNEUMATIC. 1,200 PSI. DO NOT STAND IN FRONT.)', SNAKE_WALL - 150, SNAKE_TOP - 28, '#FCA5A5', 6);
  }
  // The loading station: the line (long), the platform, the track, the cart, the operators' booth
  if (vis(STATION_X - 100, x1)) {
    // the line, switching back and forth behind
    for (let row = 0; row < 3; row++) {
      box(c, STATION_X + 100, GY - 160 - row * 70, 1100, 4, '#A16207');
      for (let i = 0; i < 18; i++) {
        const gx = STATION_X + 140 + i * 60 + (row % 2) * 30, seed = 200 + row * 40 + i * 7;
        c.save(); c.translate(gx, GY - 160 - row * 70 + 2); c.scale((i + row) % 2 ? 0.55 : -0.55, 0.55);
        c.globalAlpha = 0.75;
        drawPerson(c, { seed, outfit: 'guest', f, mood: 'bored' });
        c.restore();
      }
    }
    label(c, 'WAIT TIME FROM HERE: 240 MINUTES', STATION_X + 650, GY - 380, '#FDE047', 8);
    label(c, 'KEEP HANDS, ARMS AND EXPECTATIONS INSIDE THE CART AT ALL TIMES', STATION_X + 650, GY - 366, '#E7E5E4', 6);
    // the track, on through the end wall
    box(c, STATION_X + 600, GY - 6, x1 - STATION_X - 600, 6, '#52525B');
    box(c, T + 5800, GY - 700, 200, 700, '#44403C');
    label(c, 'FRIENDLY TRACK', T + 5700, GY - 120, '#86EFAC', 7);
    // the operators' booth, them in it
    box(c, BOOTH_X, GY - 120, 170, 120, '#57534E'); box(c, BOOTH_X + 10, GY - 110, 150, 50, '#1E293B');
    const ld = templeOf(state).loading;
    for (const [i, seed, woman] of [[0, 818, false], [1, 1331, true]] as const) {
      c.save(); c.translate(BOOTH_X + 50 + i * 70, GY - 30); c.scale(-1, 1);
      const voice = i ? 'm2.operator2' : 'm2.operator';
      drawPerson(c, { seed, woman, outfit: 'operator', f, mood: i ? 'bored' : 'shocked', talking: ld?.said?.who === voice });
      c.restore();
    }
    box(c, BOOTH_X + 120, GY - 64, 6, 24, '#A1A1AA'); box(c, BOOTH_X + 117, GY - 70, 12, 8, '#DC2626');
    label(c, 'OPERATORS', BOOTH_X + 85, GY - 126, '#E7E5E4', 7);
  }
  // Solids and ledges, lit
  for (const [x, y, w] of LEDGES) { if (!vis(x, x + w)) continue; box(c, x, y, w, 10, '#52525B'); lip(c, x, y, w, '#A1A1AA'); }
};

const drawCart = (c: Ctx, x: number, f: number, riders: number[]) => {
  // the guests still in it, sat
  riders.forEach(i => { c.save(); c.translate(x + SEAT[i], GY - 12); c.scale(0.9, 0.9); drawPerson(c, { seed: GUESTS[i].seed, woman: GUESTS[i].woman, outfit: 'guest', pose: 'sit', f, mood: 'happy' }); c.restore(); });
  drawRideCart(c, x, GY, f, JAGUAR_EXPRESS, false);
};

const drawTempleFront = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, f = state.frame;
  if (cam > x1 || cam + CANVAS_WIDTH < T - 200) return;
  const tp = templeOf(state);
  // Boulders
  for (const b of tp.boulders) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.x * 0.06);
    c.fillStyle = '#1A0B06'; c.beginPath(); c.arc(0, 0, b.r + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#78716C'; c.beginPath(); c.arc(0, 0, b.r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A8A29E'; c.fillRect(-b.r * 0.5, -b.r * 0.6, b.r * 0.6, 3); c.fillStyle = '#57534E'; c.fillRect(-2, 2, b.r * 0.7, 3);
    c.restore();
  }
  // Darts (feathered)
  for (const d of tp.darts) { box(c, d.x, d.y - 1, 14, 2, '#D4D4D8'); box(c, d.x + 12, d.y - 3, 6, 6, '#EF4444'); }
  // The snake: a big painted rubber head on the ram
  if (crewed(state, 3) || tp.snakeT % SNAKE_CYCLE !== 0) {
    const s = crewed(state, 3) ? snakeOut(tp.snakeT) : { k: 0, rear: false };
    const hx = SNAKE_WALL - Math.max(-0.12, s.k) * SNAKE_REACH;
    box(c, hx + 20, SNAKE_Y - 6, SNAKE_WALL - hx - 20 + 50, 12, '#A1A1AA');
    box(c, hx - 32, SNAKE_Y - 28, 56, 56, '#15803D'); box(c, hx - 32, SNAKE_Y - 28, 56, 6, '#22C55E');
    box(c, hx - 44, SNAKE_Y - 4, 16, 22, '#7F1D1D');
    c.fillStyle = '#FDE047'; c.fillRect(hx - 20, SNAKE_Y - 18, 8, 6);
    if (s.rear && f % 6 < 3) label(c, 'HSSSS', hx, SNAKE_Y - 40, '#BBF7D0', 7);
    if (!crewed(state, 3)) label(c, '(OFF)', hx, SNAKE_Y - 40, '#A8A29E', 6);
  }
  // Fog over the floor there
  for (const fg of tp.fog) { c.fillStyle = `rgba(214, 211, 209, ${0.16 * (1 - fg.t / 260)})`; c.beginPath(); c.arc(fg.x, fg.y, fg.r, 0, Math.PI * 2); c.fill(); }
  // The cart, and whoever's still in it; the ones kicked out, flying
  const ld = tp.loading;
  const riders = ld ? GUESTS.map((_, i) => i).filter(i => i >= ld.kicked) : tp.loadingSeen ? [] : [0, 1, 2];
  drawCart(c, CART_X + (ld?.rolling ?? 0), f, riders);
  if (ld) for (const g of ld.flying) { c.save(); c.translate(g.x, g.y); c.rotate(-g.rot); drawPerson(c, { seed: g.seed, woman: g.woman, outfit: 'guest', pose: 'fly', f, mood: 'shocked' }); c.restore(); }
  // What's being said (over whoever's saying it)
  if (ld?.said) {
    const who = ld.said.who;
    const at = who === 'm2.operator' ? { x: BOOTH_X + 50, y: GY - 140 } : who === 'm2.operator2' ? { x: BOOTH_X + 120, y: GY - 160 }
      : ld.step >= 1 ? { x: STATION_X + 520 + (who === 'm2.guest' ? 0 : 90), y: GY - 250 }
      : ld.flying.length ? { x: Math.max(cam + 140, ld.flying[ld.flying.length - 1].x), y: Math.max(state.camera.y + 140, ld.flying[ld.flying.length - 1].y - 50) } : { x: CART_X - 300, y: GY - 300 };
    saidOver(c, ld.said.s.text, at.x, at.y, who.startsWith('m2.operator') ? '#FDE68A' : '#FFFFFF', 260);
  }
};
