// The haunted kiddie rides: set pieces, not scenery. Each one runs whether he's there or not, carries him if he's on
// it (its moving tops are ledges, moved every frame, with him on them), and hurts him if it runs into him:
//
//   cups      SPINNING COFFIN CUPS: four coffins round a turntable, sweeping the floor of it left to right on the near
//             side (behind the hub, on the far side, out of reach). Hit by one: knocked flying. On one: carried over,
//             and up to the hub's canopy from it.
//   carousel  The BAT-O-ROUND: six bat seats round it, bobbing up and down. The near ones shove him walking through;
//             ridden, the top of a bob gets him onto its roof.
//   train     The LI'L GHOST TRAIN: shuttles over the BOTTOMLESS MOAT between its two stations (the only way over). The
//             horn before it goes; stood on its track as it pulls in, it runs him down (away from the moat, always).
//   drop      The MINI DROP OF DOOM: its seat ring creeps up six feet, holds (rattling: the tell), and drops. Ride it up
//             to the balconies; don't be under it.
//   pony      The SKELETON PONY: stood on its saddle, it rattles, then bucks him sky-high (onto the arcade's roof).
//             Anyone behind it gets the back hooves.
// Plus the stairs' jack-o'-lanterns, rolled down at him by the pumpkin-head at the top (kinds.ts rolls them).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { profileYAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { townOf, type Rides } from './state';
import { rideHit, rideVictims, eIn } from './rideHits';
import { X, Y, CUPS, CAROUSEL, TRAIN, DROP, PONY, MOAT, STAIRS } from './layout';
import { INK, fb, ob, poly, oval, bar, board, signPost, words } from './crude';

const LIP_PIT = '#9A93AE';

type Ctx = CanvasRenderingContext2D;
const AWAY = GY + 4000;

const ledgeBlock = (state: GameState, x: number, y: number, w: number): Block => {
  const b = { x, y, w, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'town-ride' } as Block;
  state.blocks.push(b);
  return b;
};

export const buildRides = (state: GameState) => {
  const t = townOf(state);
  const r: Rides = {
    cups: [0, 1, 2, 3].map(() => ledgeBlock(state, 0, AWAY, CUPS.cupW)),
    seats: Array.from({ length: CAROUSEL.seats }, () => ledgeBlock(state, 0, AWAY, 50)),
    train: { x: X(TRAIN.a), dir: 1, mode: 'wait', t: 60, roof: ledgeBlock(state, X(TRAIN.a), Y(48), TRAIN.len) },
    drop: { h: DROP.lo, mode: 'rest', t: 0, ring: ledgeBlock(state, X(DROP.x) - DROP.w / 2, Y(DROP.lo), DROP.w) },
    pony: { on: 0, cd: 0, buck: 99, saddle: ledgeBlock(state, X(PONY.x) - 34, Y(52), 64) },
  };
  t.rides = r;
};

// ---------------------------------------------------------------------------------------------------------------
// Moving him with what he's stood on, and getting run into

const P = (state: GameState) => state.player;
/** Stood on this ledge right now. */
const standingOn = (state: GameState, b: Block) => {
  const p = P(state), feet = p.pos.y + p.height;
  return p.health > 0 && p.vel.y >= 0 && Math.abs(feet - b.y) <= 3 && p.pos.x + p.width > b.x + 2 && p.pos.x < b.x + b.w - 2;
};
/** The ledge to (x, y), and him with it if he's on it. */
const move = (state: GameState, b: Block, x: number, y: number) => {
  const on = b.y < AWAY - 1 && standingOn(state, b);
  const dx = x - b.x;
  b.x = x; b.y = y;
  if (on && y < AWAY - 1) { const p = P(state); p.pos.x += dx; p.pos.y = y - p.height; }
  return on;
};
/** His box overlapping (x, y, w, h), and not stood up on top of it. */
const runsInto = (state: GameState, x: number, y: number, w: number, h: number) => {
  const p = P(state);
  return p.health > 0 && p.pos.x + p.width > x && p.pos.x < x + w && p.pos.y + p.height > y + 6 && p.pos.y < y + h;
};
const hit = (ctx: FrameContext, dmg: number, source: string, kx: number, ky: number) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.noContactHurt) return false;
  hurtPlayer(ctx, dmg, source, { x: kx, y: ky }, 18);
  playSound('thud', 0.8);
  shakeScreen(ctx.state, 8, 3);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

const CUP_W = 0.011, SEAT_W = 0.014;
const cupAt = (f: number, i: number) => { const a = f * CUP_W + (i * Math.PI) / 2; return { x: X(CUPS.x) - Math.cos(a) * CUPS.r, z: Math.sin(a), a }; };
const seatAt = (f: number, i: number) => {
  const a = f * SEAT_W + (i * Math.PI * 2) / CAROUSEL.seats;
  return { x: X(CAROUSEL.x) - Math.cos(a) * CAROUSEL.r, z: Math.sin(a), h: 70 + Math.sin(f * 0.045 + i * 1.7) * 40 };
};
/** The train's speed, how long it waits at a station (and when the horn goes before it leaves). */
const TRAIN_V = 2.4, TRAIN_WAIT = 190, TRAIN_HORN = 140;
/** The drop tower: rest, creep up, hold (rattling), drop. */
const DROP_REST = 110, DROP_UP = 0.36, DROP_HOLD = 72, DROP_FALL = 7;
/** The pony: how long on the saddle before it bucks, how hard. */
const PONY_FUSE = 26, PONY_LAUNCH = 15.5;

export const updateRides = (ctx: FrameContext) => {
  const { state } = ctx, r = townOf(state).rides, p = state.player, f = state.frame;
  if (!r) return;
  const near = (x: number) => Math.abs(x - (p.pos.x + p.width / 2)) < CANVAS_WIDTH;
  // (whoever's about the rides: the staff and the wildlife get hit by them too)
  const foes = rideVictims(state).filter(e => Math.abs(e.pos.x - p.pos.x) < CANVAS_WIDTH * 1.5);

  // The coffin cups
  r.cups.forEach((b, i) => {
    const c = cupAt(f, i);
    const front = c.z > 0.05;
    move(state, b, c.x - CUPS.cupW / 2, front ? Y(CUPS.cupH) : AWAY);
    if (front && runsInto(state, c.x - CUPS.cupW / 2, Y(CUPS.cupH), CUPS.cupW, CUPS.cupH) && p.pos.x + p.width / 2 > c.x) hit(ctx, 8, 'm2:town_cups', 7, -6);
    if (front) for (const e of foes) if (eIn(e, c.x - CUPS.cupW / 2, Y(CUPS.cupH), CUPS.cupW, CUPS.cupH) && e.pos.x + e.width / 2 > c.x) rideHit(ctx, e, 60, c.x, 'CUPPED!');
  });

  // The carousel's seats
  r.seats.forEach((b, i) => {
    const s = seatAt(f, i);
    const front = s.z > 0.15;
    move(state, b, s.x - 25, front ? Y(s.h) : AWAY);
    if (front && runsInto(state, s.x - 25, Y(s.h), 50, 22) && p.pos.x + p.width / 2 > s.x) hit(ctx, 6, 'm2:town_carousel', 6, -5);
    if (front) for (const e of foes) if (eIn(e, s.x - 25, Y(s.h), 50, 22) && e.pos.x + e.width / 2 > s.x) rideHit(ctx, e, 45, s.x, 'BATTED!');
  });
  if (f % 90 === 0 && near(X(CAROUSEL.x))) playSound('ding', 0.15, 5);

  // The train
  const tr = r.train;
  tr.t++;
  if (tr.mode === 'wait') {
    if (tr.t === TRAIN_HORN && near(tr.x)) playSound('horn', 0.35, 6);
    if (tr.t > TRAIN_WAIT) { tr.mode = 'go'; tr.t = 0; if (near(tr.x)) playSound('ding', 0.4, 3); }
    move(state, tr.roof, tr.x, Y(48));
  } else {
    const to = tr.dir > 0 ? X(TRAIN.b) : X(TRAIN.a);
    const nx = Math.abs(to - tr.x) <= TRAIN_V ? to : tr.x + tr.dir * TRAIN_V;
    tr.x = nx;
    move(state, tr.roof, tr.x, Y(48));
    // (its nose runs him down if he's stood on the track in front of it: always away from the moat)
    const nose = tr.dir > 0 ? tr.x + TRAIN.len - 14 : tr.x - 4;
    if (runsInto(state, nose, Y(46), 18, 46) && (tr.dir > 0 ? p.pos.x + p.width / 2 > nose : p.pos.x + p.width / 2 < nose + 18)) hit(ctx, 7, 'm2:town_train', tr.dir * 8, -6);
    // (anybody else on the track: run down, flat)
    for (const e of foes) if (eIn(e, nose - 6, Y(46), 30, 46)) rideHit(ctx, e, 0, nose + 9 - tr.dir * 30, 'RUN OVER!', { kill: true, up: 8 });
    if (tr.x === to) { tr.mode = 'wait'; tr.t = 0; tr.dir = (tr.dir > 0 ? -1 : 1); if (near(tr.x)) playSound('ding', 0.4, 3); }
  }

  // The drop tower
  const d = r.drop;
  d.t++;
  if (d.mode === 'rest' && d.t > DROP_REST) { d.mode = 'up'; d.t = 0; }
  else if (d.mode === 'up') { d.h = Math.min(DROP.hi, d.h + DROP_UP); if (d.h >= DROP.hi) { d.mode = 'hold'; d.t = 0; } }
  else if (d.mode === 'hold') {
    if (d.t % 12 === 1 && near(X(DROP.x))) playSound('click', 0.4, 2);
    if (d.t > DROP_HOLD) { d.mode = 'drop'; d.t = 0; }
  } else if (d.mode === 'drop') {
    const was = d.h;
    d.h = Math.max(DROP.lo, d.h - DROP_FALL);
    // (under it as it comes down: the ring lands on him)
    const rx = X(DROP.x) - DROP.w / 2;
    if (runsInto(state, rx, Y(was), DROP.w, was - d.h + 16) && !standingOn(state, d.ring)) hit(ctx, 12, 'm2:town_drop', p.pos.x + p.width / 2 < X(DROP.x) ? -7 : 7, -5);
    for (const e of foes) if (eIn(e, rx, Y(was), DROP.w, was - d.h + 16)) rideHit(ctx, e, 0, X(DROP.x), 'SQUASHED!', { kill: true, up: 4 });
    if (d.h <= DROP.lo) {
      d.mode = 'rest'; d.t = 0;
      if (near(X(DROP.x))) { playSound('slam', 0.7); shakeScreen(state, 10, standingOn(state, d.ring) ? 6 : 3); }
    }
  }
  const shake = d.mode === 'hold' ? (f % 4 < 2 ? 1 : -1) : 0;
  move(state, d.ring, X(DROP.x) - DROP.w / 2 + shake, Y(d.h));

  // The pony
  const po = r.pony;
  po.cd = Math.max(0, po.cd - 1); po.buck++;
  if (standingOn(state, po.saddle) && p.isGrounded && po.cd === 0) {
    po.on++;
    if (po.on % 8 === 1) playSound('click', 0.5, -2);
    if (po.on >= PONY_FUSE) {
      po.on = 0; po.cd = 70; po.buck = 0;
      const dir = (p.facing ?? 1) >= 0 ? 1 : -1;
      p.vel.y = -PONY_LAUNCH; p.vel.x = dir * 5; p.isGrounded = false;
      p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0; p.pos.y -= 2; p.squash = -1;
      playSound('boing'); playSound('snort', 0.6);
    }
  } else po.on = 0;
  // (the back hooves, as it bucks)
  if (po.buck === 3 && runsInto(state, X(PONY.x) - 90, Y(60), 50, 60)) hit(ctx, 8, 'm2:town_pony', -8, -6);
  if (po.buck === 3) for (const e of foes) if (eIn(e, X(PONY.x) - 95, Y(60), 60, 60)) rideHit(ctx, e, 90, X(PONY.x), 'KICKED!', { up: 9 });

  updatePumpkins(ctx);
};

// ---------------------------------------------------------------------------------------------------------------
// The jack-o'-lanterns down the stairs

/** Rolled from the top (kinds.ts: the pumpkin-head). */
export const rollPumpkin = (state: GameState, x: number) => {
  townOf(state).pumpkins.push({ x, y: Y(STAIRS.top), vx: -0.5, spin: 0, t: 0 });
  playSound('rumble', 0.3, 4);
};
const PUMPKIN_R = 13, PUMPKIN_V = 3.4;
const updatePumpkins = (ctx: FrameContext) => {
  const { state } = ctx, t = townOf(state), p = state.player;
  t.pumpkins = t.pumpkins.filter(k => {
    k.t++;
    k.vx = Math.max(-PUMPKIN_V, k.vx - 0.08);
    k.x += k.vx; k.spin += k.vx / PUMPKIN_R;
    const g = profileYAt(state.groundRuns, k.x) ?? GY;
    // (a little hop off each step)
    k.y = g - Math.abs(Math.sin(k.t * 0.35)) * (g < GY - 2 ? 6 : 0);
    const smash = () => {
      for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: k.x, y: k.y - PUMPKIN_R }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 26, color: ['#EA580C', '#F97316', '#FDE047', '#166534'][i % 4], size: 2 + Math.random() * 4 });
      playSound('splat', 0.5);
    };
    const px = p.pos.x + p.width / 2;
    if (p.health > 0 && Math.abs(px - k.x) < PUMPKIN_R + p.width / 2 - 4 && p.pos.y + p.height > k.y - PUMPKIN_R * 2 + 4 && p.pos.y < k.y) {
      // (charged, slid or dive kicked into: it's the pumpkin that goes)
      if (p.isCharging || p.isSliding || p.isUppercutting) { smash(); return false; }
      hit(ctx, 9, 'm2:town_pumpkin', -6, -6); smash(); return false;
    }
    // (the staff on the stairs are in its way too: bowled over)
    const pins = rideVictims(state).find(e => e.kind !== 'm2:town_pumpkinhead' && Math.abs(e.pos.x + e.width / 2 - k.x) < PUMPKIN_R + e.width / 2 - 2 && e.pos.y + e.height > k.y - PUMPKIN_R * 2 && e.pos.y < k.y);
    if (pins) { rideHit(ctx, pins, 45, k.x + 20, 'STRIKE!', { up: 7 }); smash(); return false; }
    if (k.x < X(STAIRS.a0 - 160)) { smash(); return false; }
    return k.t < 900;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind everything that moves; only what's in view)

const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 200 && a < state.camera.x + CANVAS_WIDTH + 200;

const KIDS = ['#F0C8A2', '#A86B43', '#6E4426', '#F6DCC8', '#D9A877'];
const kid = (c: Ctx, x: number, y: number, i: number, s = 1) => {
  oval(c, x, y, 6 * s, 6 * s, KIDS[i % KIDS.length], 1.5);
  fb(c, x - 5 * s, y - 7 * s, 10 * s, 3 * s, ['#1F1611', '#A16207', '#7F1D1D', '#111827'][i % 4]);
};

const drawCups = (c: Ctx, state: GameState) => {
  const cx = X(CUPS.x), f = state.frame;
  // The turntable: a low round deck (its far half behind)
  oval(c, cx, GY - 4, CUPS.r + 50, 18, '#3B2F4A');
  fb(c, cx - CUPS.r - 50, GY - 4, (CUPS.r + 50) * 2, 4, '#3B2F4A');
  const hub = () => {
    // (the hub: a center post and a canopy you can stand on)
    ob(c, cx - 8, GY - 165, 16, 165, '#78716C');
    poly(c, [cx - 54, GY - 165, cx + 54, GY - 165, cx + 40, GY - 185, cx - 40, GY - 185], '#6B21A8');
    fb(c, cx - 54, GY - 167, 108, 3, '#E9D5FF');
  };
  const cups = [0, 1, 2, 3].map(i => ({ i, ...cupAt(f, i) })).sort((a, b) => a.z - b.z);
  let hubDone = false;
  for (const k of cups) {
    if (!hubDone && k.z > 0.05) { hub(); hubDone = true; }
    const front = k.z > 0.05, s = front ? 1 : 0.8, w = CUPS.cupW * s, h = CUPS.cupH * s;
    const x = k.x - w / 2, top = GY - 6 - h - (front ? 0 : 10);
    // A coffin on its side (the classic six-sided shape), lid flipped up behind, a kid sat in it
    if (front) kid(c, k.x - 8, top - 4, k.i);
    poly(c, [x + w * 0.15, top, x + w * 0.85, top, x + w, top + h * 0.35, x + w * 0.8, top + h, x + w * 0.2, top + h, x, top + h * 0.35], front ? '#5B3A22' : '#3F2A1A');
    fb(c, x + w * 0.2, top + 4, w * 0.6, 3, front ? '#A16207' : '#5B3A22');
    if (front) { fb(c, x + w * 0.45, top + 12, 3, 14, '#D6D3D1'); fb(c, x + w * 0.38, top + 16, 17, 3, '#D6D3D1'); }
    // (its lit rim: it's for standing on)
    if (front) fb(c, x + w * 0.15, top - 1, w * 0.7, 3, '#FBBF24');
  }
  if (!hubDone) hub();
  // (the front rail of the deck)
  for (let x = cx - CUPS.r - 40; x <= cx + CUPS.r + 40; x += 40) ob(c, x - 2, GY - 22, 4, 22, '#A1A1AA', 1);
  signPost(c, cx + CUPS.r + 120, GY, 110, 'SPINNING COFFIN CUPS', '#3B0764', '#F5D0FE');
  signPost(c, cx - CUPS.r - 110, GY, 70, 'MUST BE THIS SHORT', '#1E1036', '#E9D5FF', 7);
  fb(c, cx - CUPS.r - 145, GY - 52, 70, 3, '#FDE047');
};

const drawCarousel = (c: Ctx, state: GameState) => {
  const cx = X(CAROUSEL.x), f = state.frame, R = CAROUSEL.r, roof = Y(CAROUSEL.roofH);
  // The deck, the center column (its mirrors), the far seats behind it
  oval(c, cx, GY - 8, R + 40, 14, '#3B2F4A');
  const column = () => {
    ob(c, cx - 26, roof + 16, 52, GY - roof - 24, '#A16207');
    for (let y = roof + 30; y < GY - 30; y += 24) fb(c, cx - 20, y, 40, 12, '#FDE68A');
  };
  const seats = Array.from({ length: CAROUSEL.seats }, (_, i) => ({ i, ...seatAt(f, i) })).sort((a, b) => a.z - b.z);
  let colDone = false;
  for (const s of seats) {
    if (!colDone && s.z > 0) { column(); colDone = true; }
    const front = s.z > 0.15, k = front ? 1 : 0.78, y = Y(s.h) - (front ? 0 : 14);
    // (its pole, the bat on it with a kid riding)
    bar(c, s.x, roof + 30, s.x, GY - 10, 3, '#E5E7EB', false);
    if (front) kid(c, s.x - 4, y - 10, s.i);
    poly(c, [s.x - 34 * k, y - 4, s.x - 14 * k, y + 2, s.x, y - 2, s.x + 14 * k, y + 2, s.x + 34 * k, y - 4, s.x + 22 * k, y + 14, s.x, y + 20 * k, s.x - 22 * k, y + 14], front ? '#27272A' : '#18181B');
    oval(c, s.x + 16 * k, y + 2, 7 * k, 6 * k, front ? '#3F3F46' : '#27272A', 1.5);
    fb(c, s.x + 18 * k, y, 2, 2, '#EF4444');
    if (front) fb(c, s.x - 22, y - 1, 44, 3, '#E9D5FF');
  }
  if (!colDone) column();
  // The roof (to stand on): a striped cone on a band, lit along its edge
  poly(c, [cx - R - 30, roof, cx + R + 30, roof, cx + 40, roof - 70, cx - 40, roof - 70], '#7E22CE');
  for (let i = -3; i <= 3; i += 2) poly(c, [cx + i * 48, roof, cx + (i + 1) * 48, roof, cx + (i + 1) * 10, roof - 70, cx + i * 10, roof - 70], '#F5D0FE', 0);
  oval(c, cx, roof - 76, 10, 10, '#FBBF24');
  ob(c, cx - R - 30, roof, (R + 30) * 2, 22, '#581C87');
  fb(c, cx - R - 30, roof - 2, (R + 30) * 2, 3, '#F5D0FE');
  for (let x = cx - R - 30; x < cx + R + 30; x += 24) oval(c, x + 12, roof + 24, 10, 6, '#581C87', 1);
  // (the service ledge off its left end, the ladder's top)
  ob(c, cx - R - 55, roof, 26, 10, '#52525B'); fb(c, cx - R - 55, roof - 1, 26, 3, '#D4D4D8');
  board(c, cx, roof + 11, 'BAT-O-ROUND', '#3B0764', '#F5D0FE');
};

const drawTrain = (c: Ctx, state: GameState) => {
  const tr = townOf(state).rides!.train, f = state.frame;
  // The BOTTOMLESS PIT the train crosses (a real pit: no bottom, and no way out of it). Its walls go down in stepped
  // bands of stone, darker and darker, to pure black; the lips crumble, bits trickling off them and gone; a cold
  // updraft of mist at the bottom of the screen; the trestle's legs down into the black, never touching anything.
  const a = X(MOAT.a), b = X(MOAT.b), deep = GY + 900;
  fb(c, a, GY, b - a, deep - GY, '#000000');
  const WALL = ['#3F3A4A', '#332F3D', '#292532', '#1F1C27', '#17141D', '#100E14', '#09080C', '#040305'];
  WALL.forEach((col, i) => {
    const y = GY + i * 34, w = 46 - i * 4;
    fb(c, a, y, w, 34, col); fb(c, b - w, y, w, 34, col);
    // (each band's ledge, lit a little less each time down)
    if (i < 5) { fb(c, a, y, w, 2, i ? '#4A4458' : LIP_PIT); fb(c, b - w, y, w, 2, i ? '#4A4458' : LIP_PIT); }
  });
  // (the lips: broken, chunks out of them)
  for (const [ex, s] of [[a, 1], [b, -1]] as const) {
    poly(c, [ex, GY, ex + s * 22, GY, ex + s * 14, GY + 8, ex + s * 26, GY + 14, ex + s * 8, GY + 22, ex, GY + 18], '#3F3A4A', 1.5);
    poly(c, [ex - s * 6, GY + 30, ex + s * 10, GY + 36, ex - s * 2, GY + 46], '#2A2533', 1);
  }
  // (rubble trickling off the lips, falling away into the black and gone)
  for (let i = 0; i < 6; i++) {
    const ph = ((f * 0.012 + i * 0.37) % 1), side = i % 2 ? b - 14 - (i % 3) * 6 : a + 10 + (i % 3) * 6;
    const fy = GY + ph * ph * 520, sz = 3 - Math.floor(ph * 3);
    if (sz > 0) fb(c, side + Math.sin(i + ph * 4) * 4, fy, sz, sz, ph < 0.5 ? '#78716C' : '#44403C');
  }
  // (the cold updraft: pale mist rising out of it at the bottom of the screen)
  const sb = state.camera.y + 600;
  for (let i = 0; i < 9; i++) {
    const ph = (f * 0.004 + i / 9) % 1, mx = a + 40 + ((i * 97) % (b - a - 80)), my = sb - ph * 140;
    if (my > GY + 30) { c.globalAlpha = 0.18 * Math.sin(ph * Math.PI); oval(c, mx + Math.sin(f * 0.01 + i) * 12, my, 46, 10, '#CBD5E1', 0); c.globalAlpha = 1; }
  }
  // (the trestle: a narrow track bed, its legs going down into nothing)
  for (let x = a + 20; x < b; x += 60) {
    for (let k = 0; k < 8; k++) { c.globalAlpha = 1 - k / 8; fb(c, x - 3, GY + 6 + k * 50, 6, 50, '#3F2A1A'); }
    c.globalAlpha = 1;
    bar(c, x - 26, GY + 6, x + 4, GY + 60, 2, '#3F2A1A', false); bar(c, x + 26, GY + 6, x - 4, GY + 60, 2, '#3F2A1A', false);
  }
  fb(c, a - 30, GY - 2, b - a + 60, 4, '#71717A');
  for (let x = a - 30; x < b + 30; x += 16) fb(c, x, GY + 2, 8, 3, '#3F2A1A');
  // The warnings, at both lips: the park's official one (a skull on it), and a cheap rope barrier with its tag
  for (const [ex, s] of [[a, -1], [b, 1]] as const) {
    const px = ex + s * 40;
    ob(c, px - 3, GY - 170, 6, 170, '#3F3F46', 1);
    board(c, px, GY - 176, 'BOTTOMLESS PIT. NO, REALLY.', '#450A0A', '#FECACA', 7);
    oval(c, px, GY - 150, 10, 9, '#F5F5F4', 1.5); fb(c, px - 5, GY - 153, 3, 3, INK); fb(c, px + 2, GY - 153, 3, 3, INK); fb(c, px - 4, GY - 143, 8, 3, '#F5F5F4');
    board(c, px, GY - 124, 'DROP TIME: ETERNITY', '#1C1917', '#FDE68A', 6);
    board(c, px, GY - 104, 'PLEASE STAY ON THE TRAIN', '#1C1917', '#FDE68A', 6);
    // (the rope barrier, along the lip behind the track: two stanchions, the rope sagging, its DANGER tag)
    const r0 = ex + s * 4, r1 = ex + s * 90;
    for (const rx of [r0, r1]) ob(c, rx - 2, GY - 34, 4, 34, '#CA8A04', 1);
    c.strokeStyle = '#B91C1C'; c.lineWidth = 3; c.beginPath(); c.moveTo(r0, GY - 30); c.quadraticCurveTo((r0 + r1) / 2, GY - 14, r1, GY - 30); c.stroke();
    ob(c, (r0 + r1) / 2 - 16, GY - 22, 32, 10, '#FDE047', 1); words(c, 'DANGER', (r0 + r1) / 2, GY - 14, INK, 5);
  }
  // (the stations: a yellow line to stand behind, a shelter, its sign)
  for (const [sx, dir] of [[X(TRAIN.a), -1], [X(TRAIN.b) + TRAIN.len, 1]] as const) {
    fb(c, sx + dir * 14, GY - 2, 4 * dir, 3, '#FDE047');
    fb(c, Math.min(sx, sx + dir * 18) , GY - 1, 18, 2, '#FDE047');
  }
  // The train: a ghost engine (a pacifier in its mouth, a smokestack), two cars with kids in them
  const x = tr.x, dir = tr.dir, go = tr.mode === 'go', bob = go && f % 10 < 5 ? 1 : 0;
  const nose = dir > 0 ? x + TRAIN.len - 60 : x;
  for (let i = 0; i < 2; i++) {
    const cxl = dir > 0 ? x + i * 56 : x + 60 + i * 56;
    kid(c, cxl + 16, Y(48) - 6 - bob, i * 2 + 1); kid(c, cxl + 34, Y(48) - 6 - bob, i * 2 + 2);
    ob(c, cxl + 2, Y(46) + bob, 50, 34, '#7E22CE');
    fb(c, cxl + 2, Y(46) + bob, 50, 3, '#F5D0FE');
    oval(c, cxl + 12, GY - 8, 7, 7, '#18181B'); oval(c, cxl + 42, GY - 8, 7, 7, '#18181B');
  }
  // (the engine: a sheet ghost on wheels)
  poly(c, [nose, GY - 12, nose + 60, GY - 12, nose + 60, Y(52), nose + 50, Y(64), nose + 10, Y(64), nose, Y(52)], '#F5F5F4');
  fb(c, nose + 2, Y(50), 56, 3, '#FFFFFF');
  const fx = nose + 30 + dir * 8;
  fb(c, fx - 12, Y(46) + bob, 7, 8, INK); fb(c, fx + 4, Y(46) + bob, 7, 8, INK);
  oval(c, fx, Y(28), 7, 5, '#F9A8D4', 1.5); fb(c, fx - 2, Y(29), 4, 3, '#DB2777');
  ob(c, nose + 30 - dir * 18 - 4, Y(80), 9, 16, '#3F3F46');
  if (go && f % 20 < 10) oval(c, nose + 30 - dir * 18, Y(88) - (f % 20), 6, 5, '#D6D3D1', 0);
  oval(c, nose + 14, GY - 8, 8, 8, '#18181B'); oval(c, nose + 46, GY - 8, 8, 8, '#18181B');
  // (the bell over the near station, swinging when it's about to go)
  const ring = tr.mode === 'wait' && tr.t > TRAIN_HORN;
  for (const sx of [X(TRAIN.a) - 60, X(TRAIN.b) + TRAIN.len + 60]) {
    ob(c, sx - 3, GY - 150, 6, 150, '#3F3F46');
    oval(c, sx + (ring ? (f % 16 < 8 ? 4 : -4) : 0), GY - 150, 9, 9, ring ? '#FDE047' : '#A16207');
    board(c, sx, GY - 120, "LI'L GHOST TRAIN", '#3B0764', '#F5D0FE', 7);
    board(c, sx, GY - 98, 'STAND BEHIND LINE', '#1C1917', '#FDE68A', 6);
  }
};

const drawDrop = (c: Ctx, state: GameState) => {
  const d = townOf(state).rides!.drop, x = X(DROP.x), f = state.frame;
  // The tower: a lattice column (not much taller than him), a red cap with its lights
  ob(c, x - 10, GY - 130, 20, 130, '#A1A1AA');
  for (let y = GY - 124; y < GY; y += 14) { bar(c, x - 8, y, x + 8, y + 12, 2, '#52525B', false); }
  ob(c, x - 22, GY - 146, 44, 16, '#DC2626');
  for (let i = 0; i < 4; i++) oval(c, x - 15 + i * 10, GY - 138, 3, 3, d.mode === 'hold' && (f >> 2) % 2 === i % 2 ? '#FDE047' : '#7F1D1D', 0);
  // The ring of seats (the ledge): kids in it, legs dangling
  const ry = Y(d.h) + (d.mode === 'hold' ? (f % 4 < 2 ? 1 : -1) : 0), rx = x - DROP.w / 2;
  for (let i = 0; i < 4; i++) kid(c, rx + 14 + i * 25, ry - 6, i + 3);
  ob(c, rx, ry, DROP.w, 14, '#B91C1C');
  fb(c, rx, ry - 1, DROP.w, 3, '#FCA5A5');
  for (let i = 0; i < 4; i++) fb(c, rx + 10 + i * 25, ry + 14, 4, 10, '#1E3A8A');
  // (the sign: a lot taller than the ride)
  ob(c, x + 90, GY - 210, 8, 210, '#3F3F46'); ob(c, x + 190, GY - 210, 8, 210, '#3F3F46');
  board(c, x + 144, GY - 222, 'MINI DROP OF DOOM', '#7F1D1D', '#FECACA');
  board(c, x + 144, GY - 196, 'HEIGHT: 6 FT', '#1E1036', '#E9D5FF', 7);
};

const drawPony = (c: Ctx, state: GameState) => {
  const po = townOf(state).rides!.pony, x = X(PONY.x), f = state.frame;
  // (the coin box, the base)
  ob(c, x - 46, GY - 16, 92, 16, '#52525B');
  fb(c, x - 46, GY - 18, 92, 3, '#A1A1AA');
  ob(c, x - 70, GY - 50, 18, 34, '#B91C1C'); fb(c, x - 64, GY - 44, 6, 2, INK);
  // A skeleton horse: rocking, rattling with him on it, rearing as it bucks
  const rattle = po.on > 0 ? (f % 4 < 2 ? 2 : -2) : 0;
  const rear = po.buck < 14 ? (14 - po.buck) / 14 : 0;
  c.save(); c.translate(x, GY - 16); c.rotate(-0.35 * rear + Math.sin(f * 0.12) * 0.03); c.translate(rattle, 0);
  for (const lx of [-26, -14, 14, 24]) bar(c, lx, -24, lx + (lx < 0 ? -2 : 2) - (lx < 0 ? rear * 14 : 0), 0, 4, '#E7E5E4');
  // (ribs, spine)
  ob(c, -32, -44, 64, 20, '#E7E5E4');
  for (let i = 0; i < 5; i++) fb(c, -26 + i * 11, -40, 4, 14, '#57534E');
  // (neck, skull, the dark eye)
  poly(c, [22, -40, 34, -70, 46, -68, 34, -38], '#E7E5E4');
  poly(c, [32, -76, 58, -66, 56, -58, 34, -60], '#E7E5E4');
  fb(c, 40, -70, 4, 4, INK);
  // (the saddle: lit, for standing on; the tail)
  ob(c, -16, -50, 34, 6, '#7F1D1D');
  fb(c, -16, -52, 34, 2, '#FCA5A5');
  bar(c, -32, -40, -46, -20 + Math.sin(f * 0.2) * 4, 3, '#D6D3D1');
  c.restore();
  signPost(c, x - 140, GY, 100, 'SKELETON PONY', '#3B0764', '#F5D0FE');
  board(c, x - 140, GY - 76, '25 CENTS - RIDE AT OWN RISK', '#1C1917', '#FDE68A', 6);
};

/** The rides that aren't on top of everything (all of them are behind him). */
export const drawRides = (c: Ctx, state: GameState) => {
  if (!townOf(state).rides) return;
  if (inView(state, X(CUPS.x) - 420, X(CUPS.x) + 420)) drawCups(c, state);
  if (inView(state, X(CAROUSEL.x) - 260, X(CAROUSEL.x) + 260)) drawCarousel(c, state);
  if (inView(state, X(TRAIN.a) - 160, X(TRAIN.b) + 360)) drawTrain(c, state);
  if (inView(state, X(DROP.x) - 80, X(DROP.x) + 220)) drawDrop(c, state);
  if (inView(state, X(PONY.x) - 220, X(PONY.x) + 100)) drawPony(c, state);
};

/** The jack-o'-lanterns (in front: they're coming at him). */
export const drawPumpkins = (c: Ctx, state: GameState) => {
  for (const k of townOf(state).pumpkins) {
    c.save(); c.translate(k.x, k.y - PUMPKIN_R); c.rotate(k.spin);
    oval(c, 0, 0, PUMPKIN_R + 2, PUMPKIN_R, '#EA580C');
    fb(c, -2, -PUMPKIN_R - 4, 4, 5, '#166534');
    poly(c, [-8, -4, -3, -4, -5, -8], '#FDE047', 0); poly(c, [3, -4, 8, -4, 6, -8], '#FDE047', 0);
    poly(c, [-8, 3, 8, 3, 5, 7, -5, 7], '#FDE047', 0);
    c.restore();
  }
};
