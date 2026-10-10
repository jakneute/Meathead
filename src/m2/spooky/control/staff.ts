// The gift shop's staff: park cast members in the cheap getups the shop sells (devil-horn headbands, a red vest with a
// name tag), plus Lil' Lucifer, the shop's mascot (a fat red foam devil suit, a person sweating inside it). Three combat
// types, taught one at a time down the shop, then mixed:
//   CLERK    a souvenir pitchfork held out in front (pointy: shoulder charge into it from the front and it's in you);
//            walks at him, winds up, jabs.
//   HAWKER   behind the merchandise, keeping his distance: lobs I SURVIVED HELL snow globes at him in an arc.
//   MASCOT   the bruiser: slow, heavy, a lot of health; winds up (arms up, the foam head wobbling) and belly-bumps.
// Men and women, every look, by seed (temple/people.ts drawPerson). First pass: crude, but each a person.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { drawPerson, lookOf } from '../../adventure/temple/people';
import { voice, saidOver } from '../section';
import { GY } from '../geometry';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) * 7 + (e.variant ?? 0) * 31 + 5;
const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });

export const CLERK = 'm2:spk_clerk', HAWKER = 'm2:spk_hawker', MASCOT = 'm2:spk_mascot';
const PITCHFORK = 'm2:spk_pitchfork', GLOBE = 'm2:spk_globe';

registerHurtLines(CLERK, L.HURT_CLERK, L.DEATH_CLERK);
registerHurtLines(PITCHFORK, L.HURT_PITCHFORK, L.DEATH_PITCHFORK);
registerHurtLines(GLOBE, L.HURT_GLOBE, L.DEATH_GLOBE);
registerHurtLines(MASCOT, L.HURT_MASCOT, L.DEATH_MASCOT);
registerHurtLines(HAWKER, L.HURT_CLERK, L.DEATH_CLERK);

// ---------------------------------------------------------------------------------------------------------------
// What they say (a bark each, the first time they come for him; over their heads while it's said)

const said = new Map<Enemy, string>();
let game: GameState | null = null;
/** Somebody else on screen talking (Donnie, in the chase): the staff keep it to themselves till they're done. */
let othersTalking: () => boolean = () => false;
export const setStaffHush = (f: () => boolean) => { othersTalking = f; };
/** Any of them saying something just now. */
export const staffTalking = () => { for (const [e, t] of said) if (t && e.health > 0) return true; return false; };
const bark = (e: Enemy) => {
  if (!game || othersTalking() || staffTalking()) return;
  const pool = L.STAFF_BARK[isNude(game) ? 'nude' : isShat(game) ? 'shitty' : 'clean'];
  const text = pick(pool);
  const woman = e.kind !== MASCOT && lookOf(seedOf(e)).woman;
  say(text, voice(woman ? 'm2.spooky.clerkf' : 'm2.spooky.clerk'), 'casual', {
    always: false,
    onShow: spoken => { said.set(e, text); if (!spoken) setTimeout(() => { if (said.get(e) === text) said.delete(e); }, Math.max(1600, text.length * 60)); },
    onHide: () => { if (said.get(e) === text) said.delete(e); },
  });
};
/** Their words over their heads (world space, from the section's drawFront). */
export const drawStaffSaid = (c: Ctx, state: GameState) => {
  for (const e of state.enemies) { const t = said.get(e); if (t && e.health > 0) saidOver(c, t, e.pos.x + e.width / 2, e.pos.y - 16, '#FECACA', 170); }
};

// ---------------------------------------------------------------------------------------------------------------
// The snow globes (the hawkers'): lobbed, smashing on whatever they hit

interface Globe { x: number; y: number; vx: number; vy: number; spin: number }
let globes: Globe[] = [];
export const resetStaff = () => { globes = []; said.clear(); };

const lob = (state: GameState, e: Enemy) => throwGlobe(state, mid(e).x + (e.facing ?? 1) * 14, e.pos.y + 14);
/** A snow globe lobbed from (sx, sy) to come down on him (the hawkers'; Donnie's, over his shoulder in the chase). */
export const throwGlobe = (state: GameState, sx: number, sy: number, T = 44) => {
  const p = mid(state.player);
  const g = 0.42;
  const vx = (p.x - sx) / T, vy = (p.y - sy - 0.5 * g * T * T) / T;
  globes.push({ x: sx, y: sy, vx: Math.max(-9, Math.min(9, vx)), vy: Math.max(-14, vy), spin: 0 });
  playSound('whoosh', 0.5, 6);
};
/** Each frame (the section's update): the globes in the air, hitting him or the floor. */
export const tickStaff = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  game = state;
  globes = globes.filter(gl => {
    gl.x += gl.vx; gl.y += gl.vy; gl.vy += 0.42; gl.spin += 0.3;
    const smash = () => {
      playSound('glass', 0.6, 4);
      for (let i = 0; i < 9; i++) state.particles.push({ pos: { x: gl.x, y: gl.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: ['#BAE6FD', '#F97316', '#FDE047', '#F8FAFC'][i % 4], size: 2 + Math.random() * 2, grav: 0.3 });
    };
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && gl.x > p.pos.x - 4 && gl.x < p.pos.x + p.width + 4 && gl.y > p.pos.y && gl.y < p.pos.y + p.height) {
      hurtPlayer(ctx, 9, GLOBE, { x: Math.sign(gl.vx) * 3, y: -3 }, 10);
      smash(); return false;
    }
    if (gl.y >= GY - 4) { smash(); return false; }
    return true;
  });
};
export const drawGlobes = (c: Ctx) => {
  for (const gl of globes) drawGlobe(c, gl.x, gl.y, gl.spin);
};
/** An I SURVIVED HELL snow globe: a black base, the dome, orange glitter in it. */
const drawGlobe = (c: Ctx, x: number, y: number, spin: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(spin);
  c.fillStyle = '#1A0B06'; c.fillRect(-6, 2, 12, 5);
  c.fillStyle = '#7F1D1D'; c.fillRect(-5, 3, 10, 3);
  c.fillStyle = '#1A0B06'; c.beginPath(); c.arc(0, -2, 6.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(0, -2, 5.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(-2, -3, 4, 5);
  c.fillStyle = '#F97316'; for (let i = 0; i < 5; i++) c.fillRect(-4 + ((i * 3.3) % 8), -6 + ((i * 2.1) % 6), 1, 1);
  c.fillStyle = '#FFFFFF'; c.fillRect(-3, -6, 2, 2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The AI: up to him along the floor (no hopping: the shop's flat), and their own go at him

const WALK = 2;
const walkAt = (e: Enemy, dx: number, stopAt: number, speed = WALK) => {
  const face = (dx < 0 ? -1 : 1) as 1 | -1;
  e.facing = face;
  e.vel.x = Math.abs(dx) > stopAt ? face * speed : 0;
};
const wake = (state: GameState, e: Enemy, range: number) => {
  const p = mid(state.player), m = mid(e);
  if (Math.abs(p.x - m.x) < range && Math.abs(p.y - m.y) < 200 && state.player.health > 0) { e.aiState = 'walk'; e.aiTimer = 0; bark(e); return true; }
  return false;
};

const clerkAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x;
  switch (e.aiState) {
    default: e.vel.x = 0; wake(state, e, 460); break;
    case 'walk':
      walkAt(e, dx, 70);
      if (Math.abs(dx) < 96) { e.aiState = 'windup'; e.aiTimer = 0; e.vel.x = 0; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = dx < 0 ? -1 : 1;
      if (e.aiTimer > 20) { e.aiState = 'jab'; e.aiTimer = 0; playSound('whoosh', 0.6, 2); }
      break;
    case 'jab':
      e.vel.x = (e.facing ?? 1) * (e.aiTimer < 8 ? 6 : 0);
      if (e.aiTimer > 16) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 34) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const hawkerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x, adx = Math.abs(dx);
  switch (e.aiState) {
    default: e.vel.x = 0; if (wake(state, e, 560)) e.aiTimer = 40; break;
    case 'walk':
      // (keeps his distance: backs off if he's close, comes up if he's far)
      e.facing = dx < 0 ? -1 : 1;
      e.vel.x = adx < 200 ? -(e.facing ?? 1) * 1.6 : adx > 420 ? (e.facing ?? 1) * 1.6 : 0;
      // (up on a perch, he stays up on it: no wandering off the edge)
      if (e.homeY + e.height < GY - 20 && ((e.vel.x < 0 && e.pos.x < e.homeX - 30) || (e.vel.x > 0 && e.pos.x > e.homeX + 30))) e.vel.x = 0;
      if (e.aiTimer > 80 && adx < 560) { e.aiState = 'windup'; e.aiTimer = 0; e.vel.x = 0; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = dx < 0 ? -1 : 1;
      if (e.aiTimer === 18) lob(state, e);
      if (e.aiTimer > 30) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const mascotAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x;
  switch (e.aiState) {
    default: e.vel.x = 0; wake(state, e, 420); break;
    case 'walk':
      walkAt(e, dx, 40, 1.2);
      if (Math.abs(dx) < 170 && e.aiTimer > 30) { e.aiState = 'windup'; e.aiTimer = 0; e.vel.x = 0; playSound('snort', 0.6, -6); }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = dx < 0 ? -1 : 1;
      if (e.aiTimer > 32) { e.aiState = 'bump'; e.aiTimer = 0; playSound('whoosh', 0.8, -6); }
      break;
    case 'bump':
      e.vel.x = (e.facing ?? 1) * (e.aiTimer < 22 ? 5 : 0);
      if (e.aiTimer > 26) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.85;
      if (e.aiTimer > 50) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The look (crude)

/** The headband: two red plastic horns on a black band, a little crooked. */
const horns = (c: Ctx, y: number) => {
  c.fillStyle = '#18181B'; c.fillRect(-8, y + 1, 18, 2);
  for (const hx of [-4, 5]) {
    c.fillStyle = '#1A0B06'; c.beginPath(); c.moveTo(hx - 3, y + 2); c.quadraticCurveTo(hx - 2, y - 6, hx + 2, y - 9); c.quadraticCurveTo(hx, y - 3, hx + 3, y + 2); c.closePath(); c.fill();
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(hx - 2, y + 1.5); c.quadraticCurveTo(hx - 1.4, y - 5, hx + 1.6, y - 7.4); c.quadraticCurveTo(hx, y - 3, hx + 2, y + 1.5); c.closePath(); c.fill();
    c.fillStyle = '#FCA5A5'; c.fillRect(hx - 1.2, y - 2, 1, 2);
  }
};
/** The vest over their shirt: red, a name tag on it. */
const vest = (c: Ctx, heavy: boolean) => {
  const w = heavy ? 26 : 20;
  c.fillStyle = '#1A0B06'; c.fillRect(-w / 2 + 1, -56, w - 2, 26);
  c.fillStyle = '#B91C1C'; c.fillRect(-w / 2 + 2, -55, w - 4, 24);
  c.fillStyle = '#7F1D1D'; c.fillRect(-1, -55, 2, 24);
  c.fillStyle = '#F8FAFC'; c.fillRect(2, -50, 6, 4); c.fillStyle = '#1A0B06'; c.fillRect(3, -48.5, 4, 1);
};
/** A souvenir pitchfork: plastic-handled, but the tines are real enough. */
const pitchfork = (c: Ctx, e: Enemy) => {
  const a = e.aiState === 'windup' ? -0.35 : e.aiState === 'jab' ? 0 : -0.15;
  const out = e.aiState === 'jab' && (e.aiTimer ?? 0) < 10 ? 10 : e.aiState === 'windup' ? -6 : 0;
  c.save(); c.translate(6 + out, -44); c.rotate(a);
  c.fillStyle = '#1A0B06'; c.fillRect(-10, -2, 44, 4);
  c.fillStyle = '#991B1B'; c.fillRect(-9, -1, 42, 2);
  c.fillStyle = '#1A0B06'; c.fillRect(33, -6, 3, 12);
  for (const ty of [-6, -1, 4]) { c.fillStyle = '#1A0B06'; c.fillRect(34, ty - 0.5, 10, 3); c.fillStyle = '#D4D4D8'; c.fillRect(35, ty, 9, 2); }
  c.restore();
};

registerM2Kind({
  kind: CLERK, stats: { w: 38, h: 66, hp: 90, contact: 9, mass: 200 }, ai: clerkAI, humanoid: true, grab: 'body',
  pointy: { source: PITCHFORK, label: 'FORKED!' },
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -64, r: 9 },
  draw: (c, e, f) => {
    const pose = e.aiState === 'jab' ? 'thrust' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
    const look = drawPerson(c, { seed: seedOf(e), outfit: 'guest', f, pose, mood: 'angry' });
    vest(c, look.heavy);
    horns(c, -78);
    pitchfork(c, e);
  },
});

registerM2Kind({
  kind: HAWKER, stats: { w: 38, h: 66, hp: 70, contact: 6, mass: 200 }, ai: hawkerAI, humanoid: true, grab: 'body',
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -64, r: 9 },
  draw: (c, e, f) => {
    const windup = e.aiState === 'windup';
    const look = drawPerson(c, { seed: seedOf(e), outfit: 'guest', f, pose: windup ? 'fly' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand', mood: 'angry' });
    vest(c, look.heavy);
    horns(c, -78);
    // (the next globe, in hand, up over his head in the windup; a crate of them at his feet otherwise)
    if (windup && (e.aiTimer ?? 0) < 18) drawGlobe(c, 14, -74, 0);
    else { c.fillStyle = '#1A0B06'; c.fillRect(-26, -16, 18, 16); c.fillStyle = '#A16207'; c.fillRect(-25, -15, 16, 14); c.fillStyle = '#BAE6FD'; c.fillRect(-22, -18, 4, 3); c.fillRect(-16, -18, 4, 3); }
  },
});

registerM2Kind({
  kind: MASCOT, stats: { w: 58, h: 88, hp: 340, contact: 16, mass: 420 }, ai: mascotAI, humanoid: true, grab: 'none',
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 2, y: -70, r: 16 },
  draw: (c, e, f) => drawMascot(c, e, f),
});

/** LIL' LUCIFER: a fat red foam devil (a big round body, a foam head with a fixed grin and googly eyes, a tail, felt
 *  horns), somebody's face looking out of the mouth hole, sweating. */
const drawMascot = (c: Ctx, e: Enemy, f: number) => {
  const wind = e.aiState === 'windup', bump = e.aiState === 'bump';
  const step = Math.abs(e.vel.x) > 0.2 ? Math.sin(f * 0.2) * 3 : 0;
  const lean = bump ? 0.25 : wind ? -0.15 : 0;
  const L = lookOf(seedOf(e));
  c.save();
  // (the legs: stubby, foam feet)
  for (const s of [-1, 1]) { c.fillStyle = '#1A0B06'; c.fillRect(s * 11 - 7 + s * step, -18, 14, 18); c.fillStyle = '#B91C1C'; c.fillRect(s * 11 - 6 + s * step, -17, 12, 13); c.fillStyle = '#18181B'; c.fillRect(s * 11 - 8 + s * step, -5, 17, 5); }
  c.rotate(lean);
  // (the tail, behind)
  c.strokeStyle = '#1A0B06'; c.lineWidth = 5; c.beginPath(); c.moveTo(-24, -30); c.quadraticCurveTo(-42, -26, -38, -46); c.stroke();
  c.strokeStyle = '#DC2626'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(-38, -46); c.lineTo(-44, -54); c.lineTo(-33, -50); c.closePath(); c.fill();
  // (the body: a big red ball, a lighter belly)
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(0, -40, 30, 26, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(0, -40, 28.5, 24.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(8, -36, 18, 18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FCA5A5'; c.beginPath(); c.ellipse(6, -36, 14, 14, 0, 0, Math.PI * 2); c.fill();
  // (the arms: up for the windup, out for the bump)
  const ay = wind ? -74 : bump ? -44 : -36, ax = wind ? 20 : bump ? 34 : 28;
  for (const s of [-1, 1]) { c.strokeStyle = '#1A0B06'; c.lineWidth = 10; c.beginPath(); c.moveTo(s * 22, -50); c.lineTo(s < 0 ? -ax : ax, ay); c.stroke(); c.strokeStyle = '#DC2626'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#18181B'; c.beginPath(); c.arc(s < 0 ? -ax : ax, ay, 5, 0, Math.PI * 2); c.fill(); }
  // (the foam head, wobbling; the grin; the googly eyes; the mouth hole with a real face in it)
  const wob = Math.sin(f * (wind ? 0.8 : 0.15)) * (wind ? 0.15 : 0.04);
  c.save(); c.translate(2, -72); c.rotate(wob);
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(0, 0, 19, 17, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#EF4444'; c.beginPath(); c.ellipse(0, 0, 17.5, 15.5, 0, 0, Math.PI * 2); c.fill();
  for (const hx of [-10, 10]) { c.fillStyle = '#1A0B06'; c.beginPath(); c.moveTo(hx - 5, -11); c.lineTo(hx + (hx < 0 ? -4 : 4), -24); c.lineTo(hx + 5, -11); c.closePath(); c.fill(); c.fillStyle = '#FDE68A'; c.beginPath(); c.moveTo(hx - 3.5, -11); c.lineTo(hx + (hx < 0 ? -3.5 : 3.5), -21.5); c.lineTo(hx + 3.5, -11); c.closePath(); c.fill(); }
  for (const [ex, k] of [[-6, 0], [8, 1]] as const) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex, -5, 5, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#1A0B06'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#000'; c.beginPath(); c.arc(ex + Math.sin(f * 0.3 + k * 2) * 2.4, -5 + Math.cos(f * 0.27 + k) * 2.4, 2, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(2, 6, 10, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(2, 6.5, 7.5, 4.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1A0B06'; c.fillRect(-1, 5, 2, 1.4); c.fillRect(4, 5, 2, 1.4); c.fillRect(0, 8.6, 5, 1);
  c.fillStyle = '#7DD3FC'; c.fillRect(7, 3 + ((f % 30) / 30) * 6, 1, 2);
  c.restore();
  c.restore();
};
