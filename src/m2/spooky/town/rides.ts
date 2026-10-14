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
import { type View, viewOf, INK, box, checker, mix, poly, at, board, signPost, words, ironPost, OAK, IRON, BRASS, LIP } from './paint';
import { print } from '../letters';


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
// Drawing (world space, behind everything that moves; only what's in view). Peak SNES, and in the scene's perspective:
// the decks are discs on the ground, as flat as the eye's height over them makes them; what's at the front of a ride
// (where it can get him, or carry him) is drawn right where it is, lit along whatever he can stand on.

const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 200 && a < state.camera.x + CANVAS_WIDTH + 200;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** A filled ellipse (snapped), optionally inked. */
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, ink = 0) => {
  if (ink) { c.fillStyle = INK; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), rx + ink, ry + ink, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fill();
};
/** A beam or pole between two points: inked, lit along one edge. */
const beam = (c: Ctx, xa: number, ya: number, xb: number, yb: number, w: number, col: string, lit: string) => {
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  if (w > 2) { c.strokeStyle = lit; c.lineWidth = 1; c.beginPath(); c.moveTo(xa - w / 3, ya); c.lineTo(xb - w / 3, yb); c.stroke(); }
};

const SKIN = [['#B07850', '#D8A47A', '#F0C8A2'], ['#6E4426', '#8A5A36', '#A86B43'], ['#3E2414', '#55331C', '#6E4426'], ['#C8A088', '#E4C0A8', '#F6DCC8'], ['#9A7048', '#BC8A5E', '#D9A877']];
const HAIR = ['#1F1611', '#A16207', '#7F1D1D', '#111827', '#5A3A1A'];
/** A kid on a ride: a round head (lit upper left), hair, eyes, a mouth wide open (fun). */
const kid = (c: Ctx, x: number, y: number, i: number, s = 1) => {
  const S = SKIN[i % SKIN.length], r = 6 * s;
  ell(c, x, y, r, r, S[1], 1);
  ell(c, x - r * 0.25, y - r * 0.25, r * 0.6, r * 0.6, S[2]);
  box(c, x - r, y - r - 1, r * 2, r * 0.7, INK); box(c, x - r + 1, y - r, r * 2 - 2, r * 0.6, HAIR[i % HAIR.length]);
  if (s > 0.8) { box(c, x - 3, y - 1, 2, 2, INK); box(c, x + 2, y - 1, 2, 2, INK); box(c, x - 1, y + 2, 3, 2, i % 2 ? '#7F1D1D' : INK); }
};

// The coffin cups -------------------------------------------------------------------------------------------------

/** A coffin standing in its cup (the six-sided shape), a kid in it, its lid up behind; `front`: its rim's lit. */
const coffin = (c: Ctx, x: number, top: number, w: number, h: number, i: number, front: boolean) => {
  const P = (u: number, v: number): [number, number] => [x + w * u, top + h * v];
  const R = front ? OAK : OAK.map(col => mix(col, '#0E0A16', 0.35));
  // (the lid, flipped up behind: dark, a cross on it)
  poly(c, [P(0.12, 0.1), P(0.88, 0.1), P(0.8, -0.55), P(0.2, -0.55)], INK);
  poly(c, [P(0.15, 0.08), P(0.85, 0.08), P(0.78, -0.5), P(0.22, -0.5)], R[1]);
  box(c, x + w * 0.48, top - h * 0.42, 3, h * 0.36, R[3]); box(c, x + w * 0.4, top - h * 0.3, w * 0.2, 3, R[3]);
  if (front) kid(c, x + w * 0.42, top - 3, i);
  const shape = [P(0.15, 0), P(0.85, 0), P(1, 0.35), P(0.8, 1), P(0.2, 1), P(0, 0.35)];
  poly(c, shape.map(([px, py]) => [px + (px < x + w / 2 ? -1 : 1), py + (py > top + 1 ? 1 : -1)] as [number, number]), INK);
  poly(c, shape, R[3]);
  // (its facets: lit left, shaded right, the bottom in shadow)
  poly(c, [P(0.15, 0), P(0.32, 0), P(0.2, 0.35), P(0.3, 1), P(0.2, 1), P(0, 0.35)], R[4]);
  poly(c, [P(0.7, 0), P(0.85, 0), P(1, 0.35), P(0.8, 1), P(0.7, 1), P(0.82, 0.35)], R[2]);
  box(c, x + w * 0.2, top + h * 0.82, w * 0.6, h * 0.18, R[1]);
  // (brass handles, the cross)
  box(c, x + w * 0.04, top + h * 0.4, 4, 3, BRASS[4]); box(c, x + w * 0.96 - 4, top + h * 0.4, 4, 3, BRASS[2]);
  if (front) { box(c, x + w * 0.45, top + 12, 4, 15, '#E7E5E4'); box(c, x + w * 0.38, top + 16, 15, 4, '#E7E5E4'); box(c, x + w * 0.45, top + 12, 1, 15, '#FFFFFF'); }
  // (its rim, lit gold: it's for standing on)
  box(c, x + w * 0.15, top - 1, w * 0.7, 3, front ? '#FBBF24' : R[3]);
  if (front) box(c, x + w * 0.15, top - 1, w * 0.7, 1, '#FEF3C7');
};

const drawCups = (c: Ctx, state: GameState, v: View) => {
  const cx = X(CUPS.x), f = state.frame, R = CUPS.r + 50;
  const ry = clamp((GY - v.eye.y) * 0.05, 2, 16), cy = GY - 6 - ry;
  // The turntable: its skirt (the deck's edge, toward him), its top in rings, spokes turning with it
  ell(c, cx, cy + 6, R + 2, ry + 2, INK);
  ell(c, cx, cy + 5, R, ry, '#2A2238');
  box(c, cx - R, cy, R * 2, 6, '#3B2F4A');
  ell(c, cx, cy, R, ry, '#4A3A5E', 1);
  ell(c, cx, cy, R - 10, Math.max(1, ry - 2), '#3B2F4A');
  ell(c, cx, cy, R - 60, Math.max(1, ry * 0.7), '#4A3A5E');
  ell(c, cx, cy, R - 120, Math.max(1, ry * 0.45), '#3B2F4A');
  c.strokeStyle = '#2A2238'; c.lineWidth = 2; c.beginPath();
  for (let k = 0; k < 12; k++) { const a = f * CUP_W + (k * Math.PI) / 6; c.moveTo(cx, cy); c.lineTo(cx - Math.cos(a) * (R - 12), cy + Math.sin(a) * Math.max(1, ry - 3)); }
  c.stroke();
  // (the skirt's lights, chasing round)
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI, bx = cx - Math.cos(a) * R * 0.98, by = cy + 3 + Math.sin(a) * ry; box(c, bx - 1, by, 3, 3, (k + (f >> 3)) % 3 ? '#7E22CE' : '#F5D0FE'); }
  const hub = () => {
    // (the hub: a striped center post, the canopy over it (you can stand on its rim: lit), a finial)
    box(c, cx - 9, GY - 165, 18, cy - GY + 165, INK); box(c, cx - 8, GY - 165, 16, cy - GY + 165, IRON[3]); box(c, cx - 8, GY - 165, 5, cy - GY + 165, IRON[4]);
    for (let y = GY - 150; y < cy - 6; y += 18) { box(c, cx - 8, y, 16, 8, '#7E22CE'); box(c, cx - 8, y, 5, 8, '#A855F7'); }
    const top = GY - 165;
    poly(c, [[cx - 57, top + 1], [cx + 57, top + 1], [cx + 8, top - 40], [cx - 8, top - 40]], INK);
    poly(c, [[cx - 54, top], [cx + 54, top], [cx + 6, top - 37], [cx - 6, top - 37]], '#6B21A8');
    for (let k = -2; k <= 2; k += 2) poly(c, [[cx + k * 21.6 - 10.8, top], [cx + k * 21.6 + 10.8, top], [cx + k * 2.4 + 1.2, top - 37], [cx + k * 2.4 - 1.2, top - 37]], '#E9D5FF');
    poly(c, [[cx - 54, top], [cx - 33, top], [cx - 5, top - 37], [cx - 6, top - 37]], '#A855F7');
    box(c, cx - 3, top - 82, 6, 46, INK); box(c, cx - 2, top - 82, 2, 46, IRON[4]);
    board(c, cx, top - 96, 'SPINNING COFFIN CUPS', '#3B0764', '#F5D0FE');
    ell(c, cx, top - 52, 5, 5, '#FBBF24', 1); box(c, cx - 2, top - 55, 2, 2, '#FEF3C7');
    // (its rim: the scalloped edge, lit along its top)
    box(c, cx - 55, top - 1, 110, 8, INK); box(c, cx - 54, top, 108, 6, '#581C87');
    for (let x = cx - 54; x < cx + 54; x += 12) ell(c, x + 6, top + 7, 6, 3, '#581C87', 1);
    box(c, cx - 54, top - 1, 108, 3, LIP[2]); box(c, cx - 54, top - 1, 108, 1, LIP[3]);
  };
  const cups = [0, 1, 2, 3].map(i => ({ i, ...cupAt(f, i) })).sort((a, b) => a.z - b.z);
  let hubDone = false;
  for (const k of cups) {
    if (!hubDone && k.z > 0.05) { hub(); hubDone = true; }
    const front = k.z > 0.05, s = front ? 1 : 0.8, w = CUPS.cupW * s, h = CUPS.cupH * s;
    const bottom = front ? GY - 6 : cy + ry * (CUPS.r / R) * k.z;
    coffin(c, k.x - w / 2, bottom - h, w, h, k.i, front);
  }
  if (!hubDone) hub();
  // (the front rail of the deck: iron posts, brass knobs)
  for (let x = cx - CUPS.r - 40; x <= cx + CUPS.r + 40; x += 40) { box(c, x - 3, GY - 23, 6, 23, INK); box(c, x - 2, GY - 22, 4, 22, IRON[3]); box(c, x - 2, GY - 22, 1, 22, IRON[5]); ell(c, x, GY - 24, 3, 3, BRASS[4], 1); }
  // (its signs: the name up over the hub (clear of its canopy, and of the lamp and the ATM either side), the height
  // limit at the queue's end, its yellow line)
  signPost(c, cx - R + 60, GY, 70, 'MUST BE THIS SHORT', '#1E1036', '#E9D5FF', 7);
  box(c, cx - R + 24, GY - 53, 72, 5, INK); box(c, cx - R + 25, GY - 52, 70, 3, '#FDE047');
};

// The carousel ----------------------------------------------------------------------------------------------------

/** A bat seat (wings out, its head, a red eye), a kid riding it at the front; its top lit at the front (stand on it). */
const batSeat = (c: Ctx, x: number, y: number, k: number, front: boolean, i: number, f: number) => {
  const flap = Math.sin(f * 0.2 + i) * 3 * k;
  if (front) kid(c, x - 4, y - 10, i);
  const wing = (s: number) => [[x, y - 2], [x + s * 14 * k, y + 2], [x + s * 34 * k, y - 4 - flap], [x + s * 28 * k, y + 6], [x + s * 22 * k, y + 14], [x + s * 12 * k, y + 8], [x, y + 20 * k]] as [number, number][];
  for (const s of [-1, 1]) poly(c, wing(s).map(([px, py]) => [px + s, py + 1] as [number, number]), INK);
  const body = front ? ['#18181B', '#27272A', '#3F3F46', '#52525B'] : ['#0E0E12', '#18181B', '#232328', '#2E2E36'];
  poly(c, wing(-1), body[2]); poly(c, wing(1), body[1]);
  for (const s of [-1, 1]) { c.strokeStyle = body[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + s * 28 * k, y + 6); c.moveTo(x, y + 4); c.lineTo(x + s * 22 * k, y + 14); c.stroke(); }
  ell(c, x + 16 * k, y + 2, 7 * k, 6 * k, body[3], 1);
  poly(c, [[x + 12 * k, y - 3], [x + 14 * k, y - 9], [x + 17 * k, y - 3]], body[3]); poly(c, [[x + 18 * k, y - 3], [x + 21 * k, y - 9], [x + 22 * k, y - 2]], body[2]);
  box(c, x + 18 * k, y, 2, 2, '#EF4444');
  if (front) { box(c, x - 22, y - 2, 44, 3, LIP[2]); box(c, x - 22, y - 2, 44, 1, LIP[3]); }
};

const drawCarousel = (c: Ctx, state: GameState, v: View) => {
  const cx = X(CAROUSEL.x), f = state.frame, R = CAROUSEL.r, roof = Y(CAROUSEL.roofH);
  const ry = clamp((GY - v.eye.y) * 0.05, 2, 14), cy = GY - 8 - ry * 0.5;
  // The deck: its skirt, its boards in rings, the lights round its edge
  ell(c, cx, cy + 6, R + 42, ry + 2, INK); ell(c, cx, cy + 5, R + 40, ry, '#2A2238');
  ell(c, cx, cy, R + 40, ry, '#5A3A2A', 1); ell(c, cx, cy, R + 28, Math.max(1, ry - 2), '#6E4A30'); ell(c, cx, cy, R - 30, Math.max(1, ry * 0.7), '#5A3A2A');
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI, bx = cx - Math.cos(a) * (R + 38), by = cy + 4 + Math.sin(a) * ry; box(c, bx - 1, by, 3, 2, (k + (f >> 3)) % 2 ? '#FBBF24' : '#7C2D12'); }
  const column = () => {
    // (the center column: brass, its mirrors catching the light in bands)
    box(c, cx - 27, roof + 15, 54, cy - roof - 15, INK); box(c, cx - 26, roof + 16, 52, cy - roof - 16, BRASS[3]);
    box(c, cx - 26, roof + 16, 8, cy - roof - 16, BRASS[4]); box(c, cx + 16, roof + 16, 10, cy - roof - 16, BRASS[2]);
    for (let y = roof + 30; y < cy - 30; y += 24) { box(c, cx - 21, y - 1, 42, 14, INK); box(c, cx - 20, y, 40, 12, '#B8C4D8'); box(c, cx - 20, y, 14, 12, '#E2E8F0'); box(c, cx + 8, y, 12, 12, '#7A8698'); box(c, cx - 16, y + 2, 3, 3, '#FFFFFF'); }
  };
  const seats = Array.from({ length: CAROUSEL.seats }, (_, i) => ({ i, ...seatAt(f, i) })).sort((a, b) => a.z - b.z);
  let colDone = false;
  for (const s of seats) {
    if (!colDone && s.z > 0) { column(); colDone = true; }
    const front = s.z > 0.15, k = front ? 1 : 0.78, y = Y(s.h) - (front ? 0 : 14);
    // (its pole: brass, twisted)
    const pl = cy - roof - 30 + (front ? 4 : -ry);
    box(c, s.x - 2, roof + 30, 4, pl, INK); box(c, s.x - 1, roof + 30, 2, pl, front ? BRASS[4] : BRASS[2]);
    for (let py = roof + 34 + (f % 8); py < roof + 30 + pl - 2; py += 8) box(c, s.x - 1, py, 2, 2, front ? BRASS[5] : BRASS[3]);
    batSeat(c, s.x, y, k, front, s.i, f);
  }
  if (!colDone) column();
  // The roof (to stand on): a striped cone (lit up its left), the valance round its rim (bulbs chasing along it), its
  // finial and pennant, the lit lip
  const RW = R + 30;
  poly(c, [[cx - RW - 2, roof + 1], [cx + RW + 2, roof + 1], [cx + 42, roof - 72], [cx - 42, roof - 72]], INK);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, col = i % 2 ? '#F5D0FE' : '#7E22CE';
    const cc = i < 2 ? mix(col, '#FFFFFF', 0.15) : i > 5 ? mix(col, '#1A0A2E', 0.3) : col;
    poly(c, [[cx - RW + u0 * RW * 2, roof], [cx - RW + u1 * RW * 2, roof], [cx - 40 + u1 * 80, roof - 70], [cx - 40 + u0 * 80, roof - 70]], cc);
  }
  checker(c, cx - RW + 10, roof - 8, RW * 2 - 20, 6, 'rgba(26, 10, 46, 0.5)');
  ell(c, cx, roof - 72, 42, 4, '#581C87', 1);
  box(c, cx - 3, roof - 96, 6, 24, INK); ell(c, cx, roof - 98, 10, 10, '#FBBF24', 1); ell(c, cx - 3, roof - 101, 4, 4, '#FEF3C7');
  poly(c, [[cx + 3, roof - 110], [cx + 24, roof - 104], [cx + 3, roof - 98]], '#B91C1C');
  box(c, cx - RW - 1, roof - 1, RW * 2 + 2, 24, INK); box(c, cx - RW, roof, RW * 2, 22, '#581C87'); box(c, cx - RW, roof, RW * 2, 4, '#7E22CE'); box(c, cx - RW, roof + 18, RW * 2, 4, '#3B0764');
  for (let x = cx - RW; x < cx + RW; x += 24) ell(c, x + 12, roof + 24, 10, 6, '#581C87', 1);
  for (let x = cx - RW + 8, k = 0; x < cx + RW; x += 16, k++) { box(c, x - 1, roof + 8, 4, 4, INK); box(c, x, roof + 9, 2, 2, (k + (f >> 3)) % 3 ? '#FDE68A' : '#7C2D12'); }
  box(c, cx - RW, roof - 2, RW * 2, 3, LIP[2]); box(c, cx - RW, roof - 2, RW * 2, 1, LIP[3]);
  // (the service ledge off its left end, the ladder's top: steel, lit)
  box(c, cx - R - 56, roof - 1, 28, 12, INK); box(c, cx - R - 55, roof, 26, 10, IRON[3]); box(c, cx - R - 55, roof - 1, 26, 3, LIP[2]);
  board(c, cx, roof + 11, 'BAT-O-ROUND', '#3B0764', '#F5D0FE');
};

// The ghost train -------------------------------------------------------------------------------------------------

const drawTrain = (c: Ctx, state: GameState, v: View) => {
  const tr = townOf(state).rides!.train, f = state.frame;
  const a = X(MOAT.a), b = X(MOAT.b), eye = v.eye, D = 0.95;
  // The trestle over the BOTTOMLESS MOAT: its bents going down into the black (darker and darker, never touching
  // anything), braced; the back row a step behind; the track bed, its ties going back, the rails
  const legs = (d: number) => {
    for (let x = a + 20; x < b; x += 60) {
      const [lx, ly] = at(eye, x, GY + 6, d);
      for (let k = 0; k < 9; k++) {
        const col = mix(OAK[3], '#000000', Math.min(1, k / 7)), yy = ly + k * 50 * d;
        box(c, lx - 4 * d, yy, 8 * d, 50 * d, mix(INK, '#000000', Math.min(1, k / 7))); box(c, lx - 3 * d, yy, 6 * d, 50 * d, col);
        if (k < 6) { c.strokeStyle = col; c.lineWidth = 2 * d; c.beginPath(); c.moveTo(lx - 28 * d, yy); c.lineTo(lx + 28 * d, yy + 50 * d); c.moveTo(lx + 28 * d, yy); c.lineTo(lx - 28 * d, yy + 50 * d); c.stroke(); }
      }
    }
  };
  legs(D);
  legs(1);
  if (eye.y < GY) for (let x = a - 30; x < b + 30; x += 14) poly(c, [at(eye, x, GY, 1), at(eye, x + 8, GY, 1), at(eye, x + 8, GY, D), at(eye, x, GY, D)], OAK[2]);
  for (const d of [D + 0.008, 1]) { const [ra, ry1] = at(eye, a - 30, GY - 2, d), [rb] = at(eye, b + 30, GY - 2, d); box(c, ra, ry1 - 1, rb - ra, 4, INK); box(c, ra, ry1, rb - ra, 2, '#A1A1AA'); box(c, ra, ry1, rb - ra, 1, '#E4E4E7'); }
  box(c, a - 30, GY + 2, b - a + 60, 6, OAK[2]); box(c, a - 30, GY + 2, b - a + 60, 1, OAK[4]); box(c, a - 30, GY + 8, b - a + 60, 1, INK);
  // The warnings: one sign to a post, low (eye level, by the rope barriers), spread along both lips, so none of them
  // ever sits over another (or over the tower's sign far off behind)
  const skull = (x: number, y: number) => { ell(c, x, y, 8, 7, '#E7E5E4', 1); ell(c, x - 2, y - 2, 4, 3, '#FFFFFF'); box(c, x - 4, y - 2, 3, 3, INK); box(c, x + 1, y - 2, 3, 3, INK); box(c, x - 3, y + 5, 6, 3, '#E7E5E4'); box(c, x - 2, y + 6, 1, 2, INK); box(c, x + 1, y + 6, 1, 2, INK); };
  const lowSign = (x: number, s: string, col: string, ink: string, size: number, withSkull: boolean, h = 60) => {
    ironPost(c, x, GY - h, GY, 6);
    const w = board(c, x, GY - h, s, col, ink, size);
    if (withSkull) skull(x - w / 2 - 12, GY - h);
  };
  // (clear of where the train docks at each station: it'd cover them)
  lowSign(X(TRAIN.a) - 275, 'BOTTOMLESS PIT. NO, REALLY.', '#450A0A', '#FECACA', 7, true);
  lowSign(X(TRAIN.a) - 175, 'PLEASE STAY ON THE TRAIN', '#1C1917', '#FDE68A', 6, false, 28);
  // (the far side's crowded with the station and the drop tower: this one up on a tall post over the far lip, clear of
  // the train when it's in)
  lowSign(b + 95, 'DROP TIME: ETERNITY', '#450A0A', '#FECACA', 7, true, 150);
  // (the cheap rope barriers, along both lips behind the track: two brass stanchions, the rope sagging, its DANGER tag)
  for (const [ex, s] of [[a, -1], [b, 1]] as const) {
    const r0 = ex + s * 4, r1 = ex + s * 70;
    for (const rx of [r0, r1]) { box(c, rx - 3, GY - 35, 6, 35, INK); box(c, rx - 2, GY - 34, 4, 34, BRASS[3]); box(c, rx - 2, GY - 34, 1, 34, BRASS[5]); ell(c, rx, GY - 36, 4, 3, BRASS[4], 1); box(c, rx - 5, GY - 3, 10, 3, BRASS[2]); }
    for (const [col, w] of [[INK, 5], ['#B91C1C', 3]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(r0, GY - 30); c.quadraticCurveTo((r0 + r1) / 2, GY - 14, r1, GY - 30); c.stroke(); }
    box(c, (r0 + r1) / 2 - 21, GY - 24, 42, 12, INK); box(c, (r0 + r1) / 2 - 20, GY - 23, 40, 10, '#FDE047'); box(c, (r0 + r1) / 2 - 20, GY - 23, 40, 1, '#FEF9C3');
    words(c, 'DANGER', (r0 + r1) / 2, GY - 15, INK, 5, null, print(5, INK));
  }
  // (the stations: a yellow line to stand behind)
  for (const [sx, dir] of [[X(TRAIN.a), -1], [X(TRAIN.b) + TRAIN.len, 1]] as const) box(c, Math.min(sx, sx + dir * 18), GY - 1, 18, 3, '#FDE047');
  // The train: a ghost engine (a pacifier in its mouth, a smokestack), two cars with kids in them
  const x = tr.x, dir = tr.dir, go = tr.mode === 'go', bob = go && f % 10 < 5 ? 1 : 0;
  const nose = dir > 0 ? x + TRAIN.len - 60 : x;
  const wheel = (wx: number, r: number) => { ell(c, wx, GY - r, r, r, '#18181B', 1); ell(c, wx, GY - r, r - 3, r - 3, '#3F3F46'); const a2 = (x * 0.15) * dir; box(c, wx + Math.cos(a2) * (r - 4) - 1, GY - r + Math.sin(a2) * (r - 4) - 1, 2, 2, '#A1A1AA'); box(c, wx - 1, GY - r - 1, 2, 2, '#A1A1AA'); };
  for (let i = 0; i < 2; i++) {
    const cxl = dir > 0 ? x + i * 56 : x + 60 + i * 56, top = Y(46) + bob;
    kid(c, cxl + 16, Y(48) - 6 - bob, i * 2 + 1); kid(c, cxl + 34, Y(48) - 6 - bob, i * 2 + 2);
    // (its top, going back a little: the seat's well)
    if (eye.y < top) poly(c, [at(eye, cxl + 2, top, 1), at(eye, cxl + 52, top, 1), at(eye, cxl + 52, top, 0.97), at(eye, cxl + 2, top, 0.97)], '#3B0764');
    box(c, cxl + 1, top - 1, 52, 36, INK); box(c, cxl + 2, top, 50, 34, '#7E22CE'); box(c, cxl + 2, top, 8, 34, '#A855F7'); box(c, cxl + 42, top, 10, 34, '#581C87');
    box(c, cxl + 2, top + 22, 50, 3, BRASS[4]); box(c, cxl + 12, top + 8, 30, 10, '#581C87'); box(c, cxl + 14, top + 10, 26, 6, '#3B0764');
    box(c, cxl + 2, top, 50, 3, LIP[2]); box(c, cxl + 2, top, 50, 1, LIP[3]);
    wheel(cxl + 12, 7); wheel(cxl + 42, 7);
    if (i === 0) box(c, dir > 0 ? cxl + 52 : cxl - 4, top + 26, 6, 3, IRON[2]);
  }
  // (the engine: a sheet ghost on wheels, its folds in steps)
  const G = ['#9A93AE', '#C8C4D8', '#E7E5EE', '#FFFFFF'];
  const body: [number, number][] = [[nose, GY - 12], [nose + 60, GY - 12], [nose + 60, Y(52)], [nose + 50, Y(64)], [nose + 10, Y(64)], [nose, Y(52)]];
  poly(c, body.map(([px, py]) => [px + (px > nose + 30 ? 1 : -1), py + (py < Y(50) ? -1 : 1)] as [number, number]), INK);
  poly(c, body, G[2]);
  poly(c, [[nose, GY - 12], [nose + 14, GY - 12], [nose + 14, Y(60)], [nose + 10, Y(64)], [nose, Y(52)]], dir > 0 ? G[3] : G[1]);
  poly(c, [[nose + 46, GY - 12], [nose + 60, GY - 12], [nose + 60, Y(52)], [nose + 50, Y(64)], [nose + 46, Y(60)]], dir > 0 ? G[1] : G[3]);
  for (let k = 0; k < 4; k++) box(c, nose + 8 + k * 14, GY - 14, 8, 2, G[0]);
  box(c, nose + 2, Y(63), 56, 2, G[3]);
  const fx = nose + 30 + dir * 8;
  box(c, fx - 13, Y(47) + bob, 9, 10, INK); box(c, fx + 3, Y(47) + bob, 9, 10, INK); box(c, fx - 12, Y(46) + bob, 2, 2, '#4A4458'); box(c, fx + 4, Y(46) + bob, 2, 2, '#4A4458');
  ell(c, fx, Y(28), 7, 5, '#F9A8D4', 1); ell(c, fx - 2, Y(29), 3, 2, '#FBCFE8'); box(c, fx - 2, Y(29), 4, 3, '#DB2777');
  const st = nose + 30 - dir * 18;
  box(c, st - 5, Y(81), 11, 18, INK); box(c, st - 4, Y(80), 9, 16, IRON[3]); box(c, st - 4, Y(80), 3, 16, IRON[4]); box(c, st - 7, Y(83), 15, 4, IRON[2]);
  if (go) for (let k = 0; k < 3; k++) { const t = ((f + k * 7) % 21) / 21; ell(c, st - dir * t * 16, Y(90) - t * 26, 5 + t * 5, 4 + t * 3, t < 0.5 ? '#E7E5E4' : '#A8A29E'); }
  wheel(nose + 14, 8); wheel(nose + 46, 8);
  // (the bell over each station, swinging when it's about to go; the station signs)
  const ring = tr.mode === 'wait' && tr.t > TRAIN_HORN;
  for (const sx of [X(TRAIN.a) - 60, X(TRAIN.b) + TRAIN.len + 60]) {
    ironPost(c, sx, GY - 150, GY, 6);
    box(c, sx - 10, GY - 154, 20, 4, INK);
    const sw = ring ? (f % 16 < 8 ? 4 : -4) : 0;
    poly(c, [[sx + sw - 10, GY - 136], [sx + sw + 10, GY - 136], [sx + sw + 7, GY - 150], [sx + sw - 7, GY - 150]], INK);
    poly(c, [[sx + sw - 8, GY - 137], [sx + sw + 8, GY - 137], [sx + sw + 6, GY - 149], [sx + sw - 6, GY - 149]], ring ? '#FDE047' : BRASS[3]);
    box(c, sx + sw - 6, GY - 148, 3, 10, ring ? '#FEF9C3' : BRASS[5]);
    board(c, sx, GY - 120, "LI'L GHOST TRAIN", '#3B0764', '#F5D0FE', 7);
    board(c, sx, GY - 98, 'STAND BEHIND LINE', '#1C1917', '#FDE68A', 6);
  }
};

// The drop tower --------------------------------------------------------------------------------------------------

const drawDrop = (c: Ctx, state: GameState, v: View) => {
  const d = townOf(state).rides!.drop, x = X(DROP.x), f = state.frame;
  const ry = clamp((GY - v.eye.y) * 0.03, 2, 8);
  const ringY = Y(d.h) + (d.mode === 'hold' ? (f % 4 < 2 ? 1 : -1) : 0), rx = x - DROP.w / 2;
  // (the ring's back half, behind the column)
  ell(c, x, ringY + 2, DROP.w / 2, ry + 2, '#7F1D1D', 1);
  // The tower: a lattice column (not much taller than him), its base, a red cap with its lights (they blink at the
  // top: the tell it's about to drop)
  box(c, x - 16, GY - 8, 32, 8, INK); box(c, x - 15, GY - 7, 30, 7, IRON[3]); box(c, x - 15, GY - 7, 30, 2, IRON[5]);
  box(c, x - 11, GY - 131, 22, 124, INK); box(c, x - 10, GY - 130, 20, 123, '#71717A');
  box(c, x - 10, GY - 130, 3, 123, '#D4D4D8'); box(c, x + 7, GY - 130, 3, 123, '#3F3F46');
  for (let y = GY - 124; y < GY - 8; y += 14) { c.strokeStyle = '#3F3F46'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y + 12); c.moveTo(x + 7, y); c.lineTo(x - 7, y + 12); c.stroke(); box(c, x - 7, y, 14, 1, '#A1A1AA'); }
  box(c, x - 23, GY - 147, 46, 18, INK); box(c, x - 22, GY - 146, 44, 16, '#DC2626'); box(c, x - 22, GY - 146, 44, 3, '#F87171'); box(c, x + 14, GY - 146, 8, 16, '#991B1B');
  for (let i = 0; i < 4; i++) { const on = d.mode === 'hold' && (f >> 2) % 2 === i % 2; ell(c, x - 15 + i * 10, GY - 138, 3, 3, on ? '#FDE047' : '#7F1D1D', 1); if (on) box(c, x - 16 + i * 10, GY - 140, 1, 1, '#FFFFFF'); }
  // The ring of seats (the ledge): kids in it, legs dangling; its front lit (stand on it)
  for (let i = 0; i < 4; i++) kid(c, rx + 14 + i * 25, ringY - 6, i + 3);
  box(c, rx - 1, ringY - 1, DROP.w + 2, 16, INK);
  box(c, rx, ringY, DROP.w, 14, '#B91C1C'); box(c, rx, ringY, 10, 14, '#DC2626'); box(c, rx + DROP.w - 12, ringY, 12, 14, '#7F1D1D'); box(c, rx, ringY + 10, DROP.w, 4, '#7F1D1D');
  for (let i = 0; i < 4; i++) { box(c, rx + 8 + i * 25, ringY + 4, 12, 4, '#450A0A'); box(c, rx + 10 + i * 25, ringY + 14, 4, 10, '#1E3A8A'); box(c, rx + 10 + i * 25, ringY + 22, 5, 3, '#F5F5F4'); }
  box(c, rx, ringY - 1, DROP.w, 3, LIP[2]); box(c, rx, ringY - 1, DROP.w, 1, LIP[3]);
  // (the sign: taller than the ride, and under the balconies (nothing to stand on over it))
  ironPost(c, x + 94, GY - 158, GY, 8); ironPost(c, x + 194, GY - 158, GY, 8);
  board(c, x + 144, GY - 160, 'MINI DROP OF DOOM', '#7F1D1D', '#FECACA');
  board(c, x + 144, GY - 136, 'HEIGHT: 6 FT', '#1E1036', '#E9D5FF', 7);
};

// The skeleton pony -----------------------------------------------------------------------------------------------

const drawPony = (c: Ctx, state: GameState, v: View) => {
  const po = townOf(state).rides!.pony, x = X(PONY.x), f = state.frame;
  const B = ['#57534E', '#A8A29E', '#D6D3D1', '#F5F5F4'];
  // (the base: a round plinth (its top going back), the coin box)
  const ry = clamp((GY - v.eye.y) * 0.03, 2, 8);
  ell(c, x, GY - 8, 48, ry + 8, INK); ell(c, x, GY - 7, 46, ry + 6, IRON[2]); box(c, x - 46, GY - 16, 92, 10, IRON[3]); ell(c, x, GY - 16, 46, ry, IRON[4]); ell(c, x - 6, GY - 17, 30, Math.max(1, ry - 2), IRON[5]);
  box(c, x - 71, GY - 51, 20, 36, INK); box(c, x - 70, GY - 50, 18, 34, '#B91C1C'); box(c, x - 70, GY - 50, 4, 34, '#DC2626'); box(c, x - 64, GY - 44, 6, 2, INK); box(c, x - 68, GY - 38, 14, 9, '#FDE047'); words(c, '25', x - 61, GY - 31, INK, 5, null, print(5, INK));
  // A skeleton horse: rocking, rattling with him on it, rearing as it bucks
  const rattle = po.on > 0 ? (f % 4 < 2 ? 2 : -2) : 0;
  const rear = po.buck < 14 ? (14 - po.buck) / 14 : 0;
  c.save(); c.translate(x, GY - 16); c.rotate(-0.35 * rear + Math.sin(f * 0.12) * 0.03); c.translate(rattle, 0);
  // (the legs: bones, knobbed at the joints)
  for (const lx of [-26, -14, 14, 24]) { const ex = lx + (lx < 0 ? -2 : 2) - (lx < 0 ? rear * 14 : 0); beam(c, lx, -24, ex, 0, 4, lx < 0 ? B[1] : B[2], B[3]); ell(c, (lx + ex) / 2, -12, 3, 3, B[2], 1); }
  // (the spine, the ribs over the belly, the pelvis)
  box(c, -33, -45, 66, 8, INK); box(c, -32, -44, 64, 6, B[2]); box(c, -32, -44, 64, 2, B[3]);
  for (let i = 0; i < 6; i++) { box(c, -27 + i * 10, -38, 5, 16, INK); box(c, -26 + i * 10, -38, 3, 15, i < 3 ? B[3] : B[2]); }
  box(c, -27, -24, 54, 3, B[1]);
  ell(c, -28, -36, 9, 8, B[2], 1); ell(c, -30, -38, 4, 3, B[3]);
  // (neck, skull: the long face, the dark eye socket, teeth)
  poly(c, [[21, -41], [33, -71], [47, -69], [35, -37]], INK); poly(c, [[22, -40], [34, -70], [46, -68], [34, -38]], B[2]);
  for (let k = 0; k < 4; k++) box(c, 26 + k * 4, -46 - k * 6, 8, 2, B[1]);
  poly(c, [[31, -77], [59, -67], [57, -57], [33, -59]], INK); poly(c, [[32, -76], [58, -66], [56, -58], [34, -60]], B[2]); poly(c, [[32, -76], [58, -66], [57, -63], [33, -71]], B[3]);
  box(c, 39, -71, 6, 6, INK); box(c, 41, -69, 2, 2, '#EF4444');
  for (let k = 0; k < 4; k++) box(c, 44 + k * 3, -59, 2, 3, B[3]);
  poly(c, [[34, -76], [36, -84], [40, -75]], B[2]);
  // (the saddle: lit, for standing on; the tail swishing)
  box(c, -17, -51, 36, 8, INK); box(c, -16, -50, 34, 6, '#7F1D1D'); box(c, -16, -46, 34, 2, '#450A0A');
  box(c, -16, -52, 34, 3, '#FCA5A5'); box(c, -16, -52, 34, 1, '#FEE2E2');
  beam(c, -32, -40, -46, -20 + Math.sin(f * 0.2) * 4, 3, B[1], B[3]);
  c.restore();
  signPost(c, x - 140, GY, 90, 'SKELETON PONY', '#3B0764', '#F5D0FE');
  board(c, x - 140, GY - 66, '25 CENTS - RIDE AT OWN RISK', '#1C1917', '#FDE68A', 6);
};

/** The rides that aren't on top of everything (all of them are behind him). */
export const drawRides = (c: Ctx, state: GameState) => {
  if (!townOf(state).rides) return;
  const v = viewOf(state);
  if (inView(state, X(CUPS.x) - 420, X(CUPS.x) + 420)) drawCups(c, state, v);
  if (inView(state, X(CAROUSEL.x) - 260, X(CAROUSEL.x) + 260)) drawCarousel(c, state, v);
  if (inView(state, X(TRAIN.a) - 400, X(TRAIN.b) + 400)) drawTrain(c, state, v);
  if (inView(state, X(DROP.x) - 80, X(DROP.x) + 220)) drawDrop(c, state, v);
  if (inView(state, X(PONY.x) - 220, X(PONY.x) + 100)) drawPony(c, state, v);
};

/** The jack-o'-lanterns (in front: they're coming at him): ribbed, lit from the upper left, the face cut in it glowing. */
export const drawPumpkins = (c: Ctx, state: GameState) => {
  const R = PUMPKIN_R;
  for (const k of townOf(state).pumpkins) {
    c.save(); c.translate(Math.round(k.x), Math.round(k.y - R)); c.rotate(k.spin);
    ell(c, 0, 0, R + 2, R, '#C2410C', 1);
    ell(c, -5, 0, 7, R - 1, '#EA580C'); ell(c, 5, 0, 7, R - 1, '#DD5208');
    ell(c, -1, 0, 4, R - 1, '#F97316'); ell(c, -7, -4, 3, 5, '#FB923C');
    box(c, -1, -R, 2, R * 2, '#9A3412');
    box(c, -3, -R - 5, 5, 6, INK); box(c, -2, -R - 5, 3, 5, '#166534'); box(c, -2, -R - 5, 1, 5, '#22C55E');
    poly(c, [[-9, -3], [-3, -3], [-6, -9]], INK); poly(c, [[3, -3], [9, -3], [6, -9]], INK); poly(c, [[-9, 2], [9, 2], [6, 8], [-6, 8]], INK);
    poly(c, [[-8, -4], [-4, -4], [-6, -7]], '#FDE047'); poly(c, [[4, -4], [8, -4], [6, -7]], '#FDE047');
    poly(c, [[-8, 3], [8, 3], [5, 7], [-5, 7]], '#FBBF24'); box(c, -3, 3, 2, 2, '#C2410C'); box(c, 2, 5, 2, 2, '#C2410C');
    c.restore();
  }
};
