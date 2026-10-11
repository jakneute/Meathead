// The ball pit's balls in the air: whenever there's chaos in it (anybody thrashing about in it, landing in it, hit or
// killed in it, a grab going on in it), plastic balls go flying, arc over and drop back in. Drawn in front, with the pit.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { GY } from '../geometry';
import { BALLPIT, DY } from './layout';

type Ctx = CanvasRenderingContext2D;
interface Ball { x: number; y: number; vx: number; vy: number; col: number; t: number }

const COLS: [string, string, string][] = [
  ['#991B1B', '#EF4444', '#FCA5A5'], ['#1E3A8A', '#3B82F6', '#93C5FD'], ['#A16207', '#FACC15', '#FEF08A'],
  ['#166534', '#22C55E', '#86EFAC'], ['#6B21A8', '#A855F7', '#D8B4FE'], ['#9A3412', '#F97316', '#FDBA74'],
];
const INK = '#1A0B06';
/** At most this many in the air (the oldest drop out). */
const MAX = 180;

let balls: Ball[] = [];
let seenHp = new WeakMap<Enemy, number>();
let wasAir = false, lastVy = 0, lastHp = 0;

/** The surface of the balls (world y). */
const top = () => GY + DY.nursery + 4;
const inPit = (x: number, feet: number) => x > BALLPIT.a && x < BALLPIT.b && feet > top() - 4;

/** n balls out of the pit at x, flung (harder the more `force`), mostly up and away from `dir` (0: every way). */
const burst = (x: number, n: number, force: number, dir = 0) => {
  for (let i = 0; i < n; i++) {
    const side = dir || (Math.random() < 0.5 ? -1 : 1);
    balls.push({
      x: Math.max(BALLPIT.a + 6, Math.min(BALLPIT.b - 6, x + (Math.random() - 0.5) * 30)), y: top(),
      vx: side * (0.5 + Math.random() * 2.5) * force * 0.5 + (Math.random() - 0.5) * 2, vy: -(2.5 + Math.random() * 4) * force,
      col: Math.floor(Math.random() * COLS.length), t: 0,
    });
  }
  if (balls.length > MAX) balls.splice(0, balls.length - MAX);
};

/** Each frame: what's going on in the pit, and the balls in the air. */
export const runBalls = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, f = state.frame;
  // Him: thrashing about (a charge, a slide, a dive, running through), landing in it, hurt in it, grabbing in it
  if (inPit(cx, feet) && p.health > 0) {
    const sp = Math.hypot(p.vel.x, p.vel.y);
    if (sp > 2.5 && f % 3 === 0) burst(cx, Math.min(4, Math.floor(sp / 3)), 0.8 + Math.min(1, sp / 12), -Math.sign(p.vel.x));
    if (wasAir && p.isGrounded && lastVy > 5) burst(cx, 10 + Math.floor(lastVy), 1.2);
    if (p.health < lastHp) burst(cx, 8, 1);
    if (p.hidden && f % 4 === 0) burst(cx, 2, 1);
  }
  wasAir = !p.isGrounded; lastVy = p.vel.y; lastHp = p.health;
  // Them: thrashing, hit (a spray), killed (a fountain of them)
  for (const e of state.enemies) {
    const ex = e.pos.x + e.width / 2, ef = e.pos.y + e.height;
    const before = seenHp.get(e);
    seenHp.set(e, e.health);
    if (!inPit(ex, ef)) continue;
    if (before !== undefined && e.health < before) burst(ex, e.health <= 0 ? 24 : 10, e.health <= 0 ? 1.6 : 1.1);
    const sp = Math.hypot(e.vel.x, e.vel.y);
    if (sp > 3 && f % 4 === 0) burst(ex, 2, 0.9, -Math.sign(e.vel.x));
  }
  // The balls: up, over, back down into the pit (or bounced off the rim and in)
  const surf = top();
  balls = balls.filter(b => {
    b.t++; b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.vx *= 0.99;
    if (b.x < BALLPIT.a + 4) { b.x = BALLPIT.a + 4; b.vx = Math.abs(b.vx) * 0.6; }
    if (b.x > BALLPIT.b - 4) { b.x = BALLPIT.b - 4; b.vx = -Math.abs(b.vx) * 0.6; }
    return !(b.vy > 0 && b.y > surf) && b.t < 240;
  });
};

/** The ones in the air (world space). */
export const drawBalls = (c: Ctx) => {
  for (const b of balls) {
    const [d, m, l] = COLS[b.col], x = Math.round(b.x), y = Math.round(b.y);
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = d; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = m; c.beginPath(); c.arc(x - 1, y - 1, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = l; c.fillRect(x - 4, y - 4, 3, 3);
  }
};

/** A fresh life or a fresh start: nothing in the air. */
export const resetBalls = () => { balls = []; seenHp = new WeakMap(); wasAir = false; lastVy = 0; lastHp = 0; };
