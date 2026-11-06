// THE SLIDES (level 1's new way of getting about: the owner's "many water slides as a big platforming gimmick"). Walk
// off a slide's top deck into its chute, or land on one from above, and he's riding it: sat down in the water (Player.
// logSeat, turned with the chute), carried down it, building speed (RIGHT faster, LEFT slower). Its lip throws him off
// its end: hard and far, as hard as the gap it's there for needs (geo.ts Slide.launch), and JUMP at the lip throws him
// higher still. JUMP on the way down hops him off it early (riding's speed with him). In the air off a launch he keeps
// the throw's speed (the engine's air drag would kill it: it's held) till he lands, does a move, or is hit.
//
// Shooting's fine on a slide; his specials aren't (he's sat down).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { SLIDES, type Slide } from './geo';
import { splash, wake, spray } from './splash';

/** How far down into the chute's water he sits (his feet under its surface line). */
const SINK = 11;
/** The pace on a slide: gravity along it, the drag, the lean either way, the least and most. */
const G = 0.5, DRAG = 0.01, LEAN_ON = 0.09, LEAN_BACK = 0.14, MIN_V = 2.5, MAX_V = 15;
/** JUMP within this many frames of the lip: thrown higher (px a frame up), and a touch further. */
const LIP_JUMP = 12, LIP_UP = 2.6;

interface Seg { x0: number; y0: number; x1: number; y1: number; len: number; at: number; a: number }
const segsOf = (pts: [number, number][]) => {
  const out: Seg[] = [];
  let at = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], len = Math.hypot(x1 - x0, y1 - y0);
    out.push({ x0, y0, x1, y1, len, at, a: Math.atan2(y1 - y0, x1 - x0) });
    at += len;
  }
  return out;
};
export interface Path { segs: Seg[]; len: number }
export const pathOf = (pts: [number, number][]): Path => { const segs = segsOf(pts); return { segs, len: segs.reduce((n, s) => n + s.len, 0) }; };
/** Where along a path `s` is: the point, the chute's angle there. */
export const pointAt = (P: Path, s: number) => {
  let g = P.segs[P.segs.length - 1];
  for (const q of P.segs) if (s <= q.at + q.len) { g = q; break; }
  const k = g.len ? Math.max(0, Math.min(1, (s - g.at) / g.len)) : 0;
  return { x: g.x0 + (g.x1 - g.x0) * k, y: g.y0 + (g.y1 - g.y0) * k, a: g.a };
};
/** The surface's height at world x (its point there and the distance along), or null off its ends. */
export const surfaceAt = (P: Path, x: number) => {
  for (const q of P.segs) {
    const lo = Math.min(q.x0, q.x1), hi = Math.max(q.x0, q.x1);
    if (x < lo || x > hi || hi - lo < 0.01) continue;
    const k = (x - q.x0) / (q.x1 - q.x0);
    return { y: q.y0 + (q.y1 - q.y0) * k, s: q.at + q.len * k, a: q.a };
  }
  return null;
};
const PATHS = SLIDES.map(s => pathOf(s.pts));

export interface SlideState {
  ride: { i: number; s: number; v: number; t: number } | null;
  /** Thrown: the speed he's held at along, frames since. */
  fly: { vx: number; t: number } | null;
  jumpWas: boolean; lastJump: number;
  /** Rode one (for his first time line, and the card). */
  rode: Set<string>;
}
export const newSlides = (): SlideState => ({ ride: null, fly: null, jumpWas: false, lastJump: -99, rode: new Set() });
export const onSlide = (sl: SlideState) => !!sl.ride;
export const slideRiding = (sl: SlideState): Slide | null => (sl.ride ? SLIDES[sl.ride.i] : null);

const board = (state: GameState, sl: SlideState, i: number, s: number, v: number) => {
  const p = state.player, at = pointAt(PATHS[i], s);
  // (into the chute's water: as hard as he came down on it, or a little one walked in off the top)
  splash(at.x, at.y - 2, Math.max(3, p.vel.y), 1, at.a);
  sl.ride = { i, s, v: Math.max(MIN_V + 1, Math.min(MAX_V, v)), t: 0 }; sl.fly = null;
  p.carried = true; p.logSeat = true; p.noSpecials = true; p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.isUppercutting = false; p.isDucking = false;
  p.facing = 1;
  playSound('splash', 0.6, 4);
};
export const offSlide = (state: GameState, sl: SlideState) => {
  const p = state.player;
  if (sl.ride) { p.carried = false; p.logSeat = false; p.noSpecials = false; p.spriteRot = 0; }
  sl.ride = null;
};

/** A frame of the slides: getting on one, riding it, the throw off its lip, the flight after. Returns the controls the
 *  engine's to have (on a slide: no walking, no jumping off his own legs, no specials). `first`: a slide's first ride. */
export const updateSlides = (ctx: FrameContext, sl: SlideState, controls: Controls, onFirst?: (s: Slide) => void): Controls => {
  const { state } = ctx, p = state.player;
  const jumpNow = !!controls.jump, jumpEdge = jumpNow && !sl.jumpWas;
  sl.jumpWas = jumpNow;
  if (jumpEdge) sl.lastJump = state.frame;
  if (p.health <= 0 || p.inCutscene) { if (sl.ride) offSlide(state, sl); sl.fly = null; return controls; }
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // ---- getting on: off the top deck into its chute, or down onto it from above
  if (!sl.ride && !p.swimming && !p.vine && !p.ladder) {
    for (let i = 0; i < SLIDES.length; i++) {
      const S = SLIDES[i], P = PATHS[i], [x0, y0] = S.pts[0];
      const atTop = p.isGrounded && Math.abs(feet - y0) < 5 && cx > x0 - 4 && cx < x0 + 24 && (controls.right || p.vel.x > 0.5);
      let on: { s: number } | null = atTop ? { s: 6 } : null;
      if (!on && p.vel.y > 0 && cx > x0 + 10 && cx < S.pts[S.pts.length - 1][0] - 30) {
        const at = surfaceAt(P, cx);
        if (at && feet >= at.y - SINK && feet - p.vel.y <= at.y + 2) on = { s: at.s };
      }
      if (on) {
        board(state, sl, i, on.s, Math.max(3, Math.abs(p.vel.x)));
        if (!sl.rode.has(S.id)) { sl.rode.add(S.id); onFirst?.(S); }
        break;
      }
    }
  }
  // ---- riding it
  if (sl.ride) {
    const r = sl.ride, S = SLIDES[r.i], P = PATHS[r.i];
    r.t++;
    const here = pointAt(P, r.s);
    const lean = controls.right ? LEAN_ON : controls.left ? -LEAN_BACK : 0;
    r.v = Math.max(MIN_V, Math.min(MAX_V, r.v + G * Math.sin(here.a) - DRAG * r.v + lean));
    r.s += r.v;
    if (r.t % 6 === 0) playSound('splash', 0.12, 8 + Math.random() * 4);
    // (his wake, going)
    wake(here.x - 4, here.y - 2, r.v, 1, here.a, r.t % 4 === 0);
    // (off the end: the lip's throw)
    if (r.s >= P.len) {
      const lip = pointAt(P, P.len), jumped = state.frame - sl.lastJump <= LIP_JUMP;
      offSlide(state, sl);
      const [vx, vy] = S.launch;
      p.pos.x = lip.x - p.width / 2; p.pos.y = lip.y - p.height - 2;
      p.vel.x = vx * (jumped ? 1.05 : 1); p.vel.y = vy - (jumped ? LIP_UP : 0);
      p.isGrounded = false; p.jumpHoldTimer = 0; p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0;
      sl.fly = { vx: p.vel.x, t: 0 };
      playSound('whoosh', 0.8, jumped ? 2 : -2); playSound('splash', 0.7, -4);
      spray(lip.x, lip.y - 4, 10, 22, vx * 0.75, vy * 0.6 - 1);
      return controls;
    }
    // (hopped off it, early: riding's speed with him)
    if (jumpEdge) {
      offSlide(state, sl);
      p.vel.x = r.v * Math.cos(here.a); p.vel.y = r.v * Math.sin(here.a) - 8.5;
      p.isGrounded = false; p.pos.y -= 2;
      sl.fly = { vx: p.vel.x, t: 0 };
      playSound('jump', 0.7);
      return controls;
    }
    const now = pointAt(P, r.s);
    p.pos.x = now.x - p.width / 2; p.pos.y = now.y - p.height + SINK;
    p.vel.x = r.v * Math.cos(now.a); p.vel.y = 0;
    p.spriteRot = now.a; p.facing = 1; p.isGrounded = true; p.logSeat = true;
    return { ...controls, left: false, right: false, jump: false, special: false, charge: false, down: false, up: false };
  }
  // ---- thrown: held at the throw's speed till he's down (or does something, or is hit)
  if (sl.fly) {
    const f = sl.fly;
    f.t++;
    const moved = p.isCharging || p.isDivekicking || p.isUppercutting || p.isSliding || p.swimming || p.pushbackTimer > 0 || p.vine || p.ladder;
    if ((f.t > 3 && p.isGrounded) || moved || f.t > 240) { sl.fly = null; return controls; }
    // (a little steer in the air: back eases it off, on keeps it)
    if (controls.left) f.vx = Math.max(0, f.vx - 0.22);
    f.vx *= 0.998;
    // (the engine's air drag takes its share off what's set: set it so what's left is the throw's)
    p.vel.x = f.vx / 0.95;
  }
  return controls;
};

export const SLIDE_PATHS = PATHS;
