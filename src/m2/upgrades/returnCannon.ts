// THE RETURN CANNON (the owner, 2026-10-31: "any pickups that are well off the beaten path will have a cannon that will
// shoot you to a location near where you diverged"). One for every far-flung find; this is all of it, land-agnostic.
//
// The owner's rule for every one: "the canon always starts pointing up and if it needs to reorient, it will, if not it
// will stay up. it will then fire meathead out of the cannon and back to where he needs to be"; "if it needs to point
// horizontally, it will rotate in the direction it needs to, then fire."
//
// So: it rests pointing straight up. He walks up to it (the up button's prompt: GET IN THE CANNON) and presses up: he
// hops in (a cutscene from there: no input, no HUD); the barrel swings round from straight up toward the side he's
// going (the short way, left or right) only if straight up won't get him there, settles, and fires (the boom, the
// smoke, the shake). He's shot out along the barrel and up off the screen; then he comes out at `exit` (the place it
// shoots him out to: a hole in the ground, the sky) flying on the arc to `dest`, steered there exactly, and lands on
// his feet. The arc's angle is the one the barrel aims at, so what it points at is where he goes.
//
// Use: makeCannon(x, floorY, exit, dest), then each frame updateCannon(ctx, cn, controls, hooks) in the section's
// update (it hands back the controls) and drawCannon(c, cn) in its drawBack (world space). `cannonCeilingX(cn, y)`:
// where the shot crosses height y on its way out of the room (for the art: the hole it's punched through the ceiling).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { playSound } from '../../m1/game/platform/audio';
import { shakeScreen } from '../../m1/game/core/state';
import { PLAYER_GRAVITY, PLAYER_TERMINAL_VELOCITY } from '../../m1/constants';
import { setUi } from '../store';
import { teleport } from '../adventure/section';

type Ctx = CanvasRenderingContext2D;
type P = { x: number; y: number };

export interface CannonHooks {
  /** He's in (the cutscene's started): say something. */
  onBoard?: (state: GameState) => void;
  /** It's gone off. */
  onFire?: (state: GameState) => void;
  /** He's come out at the exit (a splash of whatever he burst out of). */
  onExit?: (state: GameState, x: number, y: number) => void;
  /** He's down at the destination. */
  onLand?: (state: GameState) => void;
  /** Its prompt (default GET IN THE CANNON). */
  prompt?: string;
}

type Phase = 'rest' | 'in' | 'aim' | 'settle' | 'up' | 'fly';
export interface Cannon {
  /** The carriage's middle, on the floor; the barrel's pivot is up off it. */
  x: number; y: number;
  exit: P; dest: P;
  phase: Phase; t: number;
  /** The barrel's angle off straight up (+ leans right), and the one it wants for the shot. */
  ang: number; want: number;
  /** The arc out of the exit: its launch speed up, its time. */
  vy0: number; T: number;
  /** Where he started the hop in from (feet). */
  from: P;
  upWas: boolean;
}

/** The barrel's pivot over the floor, its length, how fast it swings (rad a frame), how fast he leaves it. */
const PIVOT = 34, LEN = 66, SWING = 0.035, SPEED = 24, UP_FRAMES = 18, HOP = 18, SETTLE = 16;
/** How far up over the higher of the exit and the destination the arc peaks. */
const APEX = 300;
/** Closer to straight up than this: it stays up. */
const STRAIGHT = 0.06;

/** Frames from feet at y0 going up at vy0 to coming down through ty (his gravity, his terminal speed). */
const flightTime = (y0: number, vy0: number, ty: number) => {
  let y = y0, vy = vy0, t = 0;
  while (t < 600) { vy = Math.min(PLAYER_TERMINAL_VELOCITY, vy + PLAYER_GRAVITY); y += vy; t++; if (vy > 0 && y >= ty) break; }
  return t;
};

export const makeCannon = (x: number, floorY: number, exit: P, dest: P): Cannon => {
  const apexY = Math.min(exit.y, dest.y) - APEX;
  const vy0 = -Math.sqrt(2 * PLAYER_GRAVITY * (exit.y - apexY));
  const T = flightTime(exit.y, vy0, dest.y);
  const vx = (dest.x - exit.x) / T;
  let want = Math.atan2(vx, -vy0);
  if (Math.abs(want) < STRAIGHT) want = 0;
  want = Math.max(-1.3, Math.min(1.3, want));
  return { x, y: floorY, exit, dest, phase: 'rest', t: 0, ang: 0, want, vy0, T, from: { x, y: floorY }, upWas: false };
};
/** Is he in it (or on his way out of it)? */
export const cannonBusy = (cn: Cannon) => cn.phase !== 'rest';
/** Where the shot crosses height y going up out of the room (world x). */
export const cannonCeilingX = (cn: Cannon, y: number) => {
  const px = cn.x, py = cn.y - PIVOT;
  return px + Math.tan(cn.want) * (py - y);
};
const muzzle = (cn: Cannon) => ({ x: cn.x + Math.sin(cn.ang) * LEN, y: cn.y - PIVOT - Math.cos(cn.ang) * LEN });

/** Each frame (the section's update, before he moves): its prompt, him getting in, the swing, the shot, the flight. */
export const updateCannon = (ctx: FrameContext, cn: Cannon, controls: Controls, hooks: CannonHooks = {}): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const upNow = !!controls.up, upPress = upNow && !cn.upWas;
  cn.upWas = upNow;
  cn.t++;
  switch (cn.phase) {
    case 'rest': {
      const near = Math.abs(cx - cn.x) < 46 && Math.abs(feet - cn.y) < 10 && p.isGrounded && !p.inCutscene && p.health > 0;
      if (near) setUi({ upPrompt: hooks.prompt ?? 'GET IN THE CANNON' });
      if (near && upPress) {
        cn.phase = 'in'; cn.t = 0; cn.from = { x: cx, y: feet };
        p.inCutscene = true; p.vel.x = 0; p.vel.y = 0;
        playSound('jump', 0.7, 2);
        hooks.onBoard?.(state);
        return { ...NO_CONTROLS };
      }
      return controls;
    }
    case 'in': {
      // (a hop up and into the muzzle, feet first)
      p.inCutscene = true;
      const u = Math.min(1, cn.t / HOP), m = muzzle(cn);
      const x = cn.from.x + (m.x - cn.from.x) * u, y = cn.from.y + (m.y + 10 - cn.from.y) * u - Math.sin(u * Math.PI) * 60;
      p.pos.x = x - p.width / 2; p.pos.y = y - p.height; p.vel.x = 0; p.vel.y = -PLAYER_GRAVITY; p.isGrounded = false;
      state.playerStunTimer = Math.max(state.playerStunTimer, 2);
      if (cn.t >= HOP) { p.hidden = true; playSound('thud', 0.8, -4); cn.phase = 'aim'; cn.t = 0; }
      return { ...NO_CONTROLS };
    }
    case 'aim': {
      // (straight up's no good: round the short way toward where he's going, then hold)
      p.inCutscene = true; p.hidden = true; hold(state, cn);
      const d = cn.want - cn.ang;
      if (Math.abs(d) <= SWING) { cn.ang = cn.want; cn.phase = 'settle'; cn.t = 0; if (d !== 0) playSound('clang', 0.5, -6); }
      else { cn.ang += Math.sign(d) * SWING; if (cn.t % 6 === 0) playSound('clink', 0.3, -4 + (cn.t % 12 ? 2 : 0)); }
      return { ...NO_CONTROLS };
    }
    case 'settle': {
      p.inCutscene = true; p.hidden = true; hold(state, cn);
      if (cn.t === 1) playSound('clang', 0.35, -2);
      if (cn.t >= SETTLE) {
        // Fire
        cn.phase = 'up'; cn.t = 0;
        playSound('boom', 1, -6); playSound('whoosh', 0.8, -2); shakeScreen(state, 12, 8);
        const m = muzzle(cn), dx = Math.sin(cn.ang), dy = -Math.cos(cn.ang);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: m.x + dx * 8, y: m.y + dy * 8 }, vel: { x: dx * (2 + Math.random() * 5) + (Math.random() - 0.5) * 4, y: dy * (2 + Math.random() * 5) + (Math.random() - 0.5) * 4 }, life: 30 + Math.random() * 20, color: i % 3 ? '#E2E0EA' : '#FDE047', size: 4 + Math.random() * 5 });
        p.hidden = false;
        p.pos.x = m.x - p.width / 2; p.pos.y = m.y - p.height / 2;
        hooks.onFire?.(state);
      }
      return { ...NO_CONTROLS };
    }
    case 'up': {
      // (out along the barrel and up off the top of the room)
      p.inCutscene = true;
      const dx = Math.sin(cn.ang), dy = -Math.cos(cn.ang);
      p.vel.x = dx * SPEED; p.vel.y = dy * SPEED - PLAYER_GRAVITY; p.isGrounded = false;
      if (dx) p.facing = dx > 0 ? 1 : -1;
      p.invincibilityTimer = Math.max(p.invincibilityTimer, 30);
      state.playerStunTimer = Math.max(state.playerStunTimer, 2);
      if (cn.t % 2 === 0) state.particles.push({ pos: { x: cx, y: feet }, vel: { x: 0, y: 1 }, life: 22, color: '#CBD5E1', size: 5 });
      if (cn.t >= UP_FRAMES) {
        // Out at the exit, on the arc to the destination
        teleport(state, cn.exit.x, cn.exit.y);
        p.vel.y = cn.vy0; p.vel.x = 0; p.isGrounded = false;
        p.inCutscene = false;
        cn.phase = 'fly'; cn.t = 0;
        playSound('boom', 0.6, 4);
        hooks.onExit?.(state, cn.exit.x, cn.exit.y);
      }
      return { ...NO_CONTROLS };
    }
    case 'fly': {
      // (steered along the arc: walls still stop him; nobody steers, nothing hurts him on the way)
      state.playerStunTimer = Math.max(state.playerStunTimer, 2);
      p.invincibilityTimer = Math.max(p.invincibilityTimer, 20);
      const u = Math.min(1, (cn.t + 1) / cn.T), want = cn.exit.x + (cn.dest.x - cn.exit.x) * u;
      p.vel.x = Math.max(-30, Math.min(30, want - cx));
      if (Math.abs(want - cx) > 0.5) p.facing = want > cx ? 1 : -1;
      if (cn.t % 3 === 0 && cn.t < cn.T - 10) state.particles.push({ pos: { x: cx, y: feet - 10 }, vel: { x: 0, y: 0.5 }, life: 20, color: '#E2E0EA', size: 4 });
      if ((p.isGrounded && p.vel.y >= 0 && cn.t > 4) || cn.t > cn.T + 120) {
        cn.phase = 'rest'; cn.t = 0; cn.ang = 0; p.vel.x = 0;
        playSound('land', 0.8, -4); shakeScreen(state, 4, 3);
        hooks.onLand?.(state);
      }
      return controls;
    }
  }
};
/** Him held still in the barrel (hidden) while it swings. */
const hold = (state: GameState, cn: Cannon) => {
  const p = state.player, m = muzzle(cn);
  p.pos.x = m.x - p.width / 2; p.pos.y = m.y - p.height / 2; p.vel.x = 0; p.vel.y = -PLAYER_GRAVITY; p.isGrounded = false;
  state.playerStunTimer = Math.max(state.playerStunTimer, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: a circus cannon (painted once: the carriage as is; the barrel baked once, then drawn turned)

export interface CannonLook { barrel: string[]; band: string[]; wood: string[]; star: string }
/** Cartoon Land's (the default): a red barrel with yellow bands and stars on a blue wheeled carriage. */
export const CIRCUS: CannonLook = {
  barrel: ['#4A060E', '#7A0E1C', '#B01C2C', '#DC3442', '#F06A72', '#FAAEB2'],
  band: ['#6A4A06', '#A6760E', '#D8A818', '#F6D23A', '#FCE880', '#FFF8C8'],
  wood: ['#0E2A5A', '#18408A', '#2A5CBC', '#4A80DE', '#86AEF0', '#C6DCFC'],
  star: '#FDE047',
};
const INK = '#1A1028';
const barrels = new Map<CannonLook, HTMLCanvasElement | null>();
/** The barrel, standing up, its pivot at (BW / 2, BH - 10): baked once a look. */
const BW = 44, BH = LEN + 22;
const barrelOf = (look: CannonLook) => {
  if (barrels.has(look)) return barrels.get(look)!;
  if (typeof document === 'undefined') { barrels.set(look, null); return null; }
  const cv = document.createElement('canvas'); cv.width = BW * 2; cv.height = BH * 2;
  const g = cv.getContext('2d')!;
  g.scale(2, 2);
  const B = look.barrel, Y = look.band, mx = BW / 2;
  // (the body: tapering up, banded across in its ramp, lit down its left)
  const body = () => { g.beginPath(); g.moveTo(mx - 15, BH - 6); g.lineTo(mx - 11, 8); g.lineTo(mx + 11, 8); g.lineTo(mx + 15, BH - 6); g.closePath(); };
  g.fillStyle = INK; g.beginPath(); g.moveTo(mx - 17, BH - 4); g.lineTo(mx - 13, 6); g.lineTo(mx + 13, 6); g.lineTo(mx + 17, BH - 4); g.closePath(); g.fill();
  g.save(); body(); g.clip();
  const cols = [B[4], B[3], B[3], B[2], B[2], B[1]];
  for (let i = 0; i < cols.length; i++) { g.fillStyle = cols[i]; g.fillRect(mx - 16 + i * 5.5, 0, 6, BH); }
  g.fillStyle = B[5]; g.fillRect(mx - 9, 12, 2, BH - 24);
  // (the bands)
  for (const by of [14, BH * 0.55, BH - 14]) { g.fillStyle = INK; g.fillRect(mx - 18, by - 1, 36, 7); g.fillStyle = Y[3]; g.fillRect(mx - 18, by, 36, 5); g.fillStyle = Y[5]; g.fillRect(mx - 18, by, 36, 1); g.fillStyle = Y[1]; g.fillRect(mx - 18, by + 4, 36, 1); }
  // (a star between them)
  const star = (sx: number, sy: number, r: number) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } g.closePath(); };
  g.fillStyle = INK; star(mx, BH * 0.36, 7); g.fill(); g.fillStyle = look.star; star(mx, BH * 0.36, 5.5); g.fill();
  g.fillStyle = INK; star(mx, BH * 0.74, 6); g.fill(); g.fillStyle = look.star; star(mx, BH * 0.74, 4.6); g.fill();
  g.restore();
  // (the muzzle: a fat lip and the black hole down it)
  g.fillStyle = INK; g.beginPath(); g.ellipse(mx, 7, 15, 5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Y[3]; g.beginPath(); g.ellipse(mx, 7, 13.5, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0A0610'; g.beginPath(); g.ellipse(mx, 7, 9.5, 2.6, 0, 0, Math.PI * 2); g.fill();
  barrels.set(look, cv);
  return cv;
};

/** It, world space (the section's drawBack). */
export const drawCannon = (c: Ctx, cn: Cannon, look: CannonLook = CIRCUS) => {
  const W = look.wood, px = cn.x, py = cn.y - PIVOT;
  // (the barrel, turned about its pivot: drawn before the carriage's cheeks so they hold it)
  const cv = barrelOf(look);
  // (a recoil kick just after it fires)
  const kick = cn.phase === 'up' && cn.t < 8 ? (8 - cn.t) * 1.2 : 0;
  if (cv) {
    c.save(); c.translate(Math.round(px), Math.round(py)); c.rotate(cn.ang);
    c.drawImage(cv, -BW / 2, -(BH - 10) + kick, BW, BH);
    c.restore();
  }
  // (the carriage: a wedge of painted wood, the wheels either side, the axle bolt)
  const cy = cn.y;
  c.fillStyle = INK; c.beginPath(); c.moveTo(px - 30, cy); c.lineTo(px - 18, py - 4); c.lineTo(px + 18, py - 4); c.lineTo(px + 30, cy); c.closePath(); c.fill();
  c.fillStyle = W[2]; c.beginPath(); c.moveTo(px - 27, cy - 2); c.lineTo(px - 16, py - 1); c.lineTo(px + 16, py - 1); c.lineTo(px + 27, cy - 2); c.closePath(); c.fill();
  c.fillStyle = W[3]; c.fillRect(Math.round(px - 22), Math.round(py + 2), 14, Math.round(cy - py - 6));
  c.fillStyle = W[4]; c.fillRect(Math.round(px - 16), Math.round(py), 32, 2);
  for (const s of [-1, 1]) {
    const wx = px + s * 24, wy = cy - 14;
    c.fillStyle = INK; c.beginPath(); c.arc(wx, wy, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = look.band[3]; c.beginPath(); c.arc(wx, wy, 13, 0, Math.PI * 2); c.fill();
    c.fillStyle = look.band[1]; c.beginPath(); c.arc(wx, wy, 13, 0.2, Math.PI - 0.2); c.fill();
    c.fillStyle = INK; for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; c.fillRect(Math.round(wx + Math.cos(a) * 6) - 1, Math.round(wy + Math.sin(a) * 6) - 1, 3, 3); }
    c.fillStyle = look.band[5]; c.beginPath(); c.arc(wx - 4, wy - 5, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(wx, wy, 3.5, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = INK; c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = look.band[4]; c.beginPath(); c.arc(px, py, 3.2, 0, Math.PI * 2); c.fill();
};
