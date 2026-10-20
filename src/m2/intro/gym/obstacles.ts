// The gym's things to pulverize the G-men with (course.ts says where): each one's whole till something hits it hard
// (a shot, his charge or slide or uppercut or dive kick, a body he's sent flying into it), and then it's in pieces,
// and the pieces kill whoever they land on or roll into:
//
//   tubs     a stack of protein tubs: they burst, chocolate powder everywhere, tubs flying off
//   rack     the dumbbell rack: it goes over, the dumbbells down on whoever's huddled in front of it
//   kbells   a rack of kettlebells at floor level: they go rolling off along the floor, like bowling balls
//   cable    the cable machine: its weight stack shoots up the rods and comes down, plates and all
//   bench    a bench with the bar racked on it: come down on the bar's end and it's a catapult, the plates go flying

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { Y, type Obstacle } from './course';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { m2Kill } from '../../moves/killLines';
import { steel, plate, bar, pad, floorShadow, signText } from '../../../m1/game/stages/gym/draw';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../../m1/game/render/npc/kit';

type Ctx = CanvasRenderingContext2D;

export interface Thing { kind: Obstacle; x: number; broken: number; shots: number }
export interface Debris { kind: 'tub' | 'dumbbell' | 'kbell' | 'plate'; x: number; y: number; vx: number; vy: number; rot: number; life: number; rolling?: boolean }

/** Its box, for what hits it. */
export const thingBox = (t: Thing) => {
  switch (t.kind) {
    case 'tubs': return { x: t.x - 34, y: Y - 96, w: 68, h: 96 };
    case 'rack': return { x: t.x - 80, y: Y - 90, w: 160, h: 90 };
    case 'kbells': return { x: t.x - 50, y: Y - 40, w: 100, h: 40 };
    case 'cable': return { x: t.x - 40, y: Y - 180, w: 80, h: 180 };
    case 'bench': return { x: t.x - 60, y: Y - 60, w: 120, h: 60 };
  }
};
const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const kill = (ctx: FrameContext, e: Enemy, vx: number, vy: number) => {
  if (e.health <= 0 || e.isBlownAway) return;
  e.health = 0;
  ctx.fx.blowAwayEnemy(e, { x: vx, y: vy }, m2Kill('throw_kill'), Math.sign(vx) || 1);
  e.meleeFlung = true;
  ctx.fx.spawnKillCallout(e, 'crush');
};

/** Comes apart: its pieces, its sound, a shake. `dir` which way it's going (away from what hit it). */
const smash = (ctx: FrameContext, t: Thing, debris: Debris[], dir: number, killable: (e: Enemy) => boolean) => {
  const { state, fx } = ctx;
  t.broken = state.frame;
  const b = thingBox(t), cx = b.x + b.w / 2;
  const add = (d: Omit<Debris, 'rot' | 'life'>) => debris.push({ ...d, rot: Math.random() * 6, life: 400 });
  switch (t.kind) {
    case 'tubs':
      for (let k = 0; k < 6; k++) add({ kind: 'tub', x: cx + (Math.random() - 0.5) * 30, y: Y - 20 - k * 14, vx: dir * (4 + Math.random() * 6), vy: -4 - Math.random() * 6 });
      for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 60, y: Y - Math.random() * 90 }, vel: { x: dir * Math.random() * 5 + (Math.random() - 0.5) * 3, y: -Math.random() * 4 }, life: 50 + Math.random() * 40, color: ['#6B3A1E', '#8A5230', '#A86E44', '#5A2E14'][k % 4], size: 4 + Math.random() * 8 });
      playSound('crash', 0.8, 4); playSound('whoosh', 0.6);
      break;
    case 'rack':
      for (let k = 0; k < 10; k++) add({ kind: 'dumbbell', x: b.x + 10 + k * 14, y: Y - 80 + (k % 2) * 20, vx: dir * (1 + Math.random() * 4), vy: -3 - Math.random() * 4 });
      playSound('crash', 1, -4); playSound('clang', 0.9);
      break;
    case 'kbells':
      for (let k = 0; k < 5; k++) add({ kind: 'kbell', x: b.x + 14 + k * 18, y: Y - 14, vx: dir * (6 + k * 0.7), vy: 0, rolling: true });
      playSound('clang', 1, -6);
      break;
    case 'cable':
      for (let k = 0; k < 8; k++) add({ kind: 'plate', x: cx + (Math.random() - 0.5) * 20, y: Y - 120 - k * 6, vx: (Math.random() - 0.5) * 6 + dir * 2, vy: -10 - Math.random() * 6 });
      playSound('clang', 1, 4); playSound('crash', 0.7);
      break;
    case 'bench':
      for (let k = 0; k < 4; k++) add({ kind: 'plate', x: cx + 30, y: Y - 70, vx: dir * (6 + k * 2.5), vy: -9 - k * 1.5 });
      playSound('clang', 1, 8); playSound('whoosh', 0.8);
      break;
  }
  shakeScreen(state, 8, 6);
  fx.spawnExplosion({ x: cx, y: b.y + b.h / 2 }, '#A1A1AA', 12, 0, 10);
  // (anybody right in it as it goes: done there and then)
  for (const e of state.enemies) if (killable(e) && overlaps({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, { x: b.x - 10, y: b.y, w: b.w + 20, h: b.h })) kill(ctx, e, dir * 8, -6);
};

/** Each frame: what's hit them, and the pieces flying. */
export const updateThings = (ctx: FrameContext, things: Thing[], debris: Debris[], killable: (e: Enemy) => boolean) => {
  const { state } = ctx;
  const p = state.player, pb = { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
  const pcx = p.pos.x + p.width / 2;
  const used = new Set<object>();
  for (const t of things) {
    if (t.broken) continue;
    const b = thingBox(t);
    const away = b.x + b.w / 2 > pcx ? 1 : -1;
    // His moves into it
    const moving = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking;
    if (moving && overlaps(pb, { x: b.x - 6, y: b.y, w: b.w + 12, h: b.h })) { smash(ctx, t, debris, p.isUppercutting ? away * 0.5 : away, killable); continue; }
    // A shot into it
    for (const q of state.projectiles) {
      if (q.owner !== 'player' || !overlaps({ x: q.pos.x, y: q.pos.y, w: q.width, h: q.height }, b)) continue;
      t.shots++;
      used.add(q);
      if (t.shots >= 2) { smash(ctx, t, debris, Math.sign(q.vel.x) || away, killable); break; }
    }
    if (used.size) state.projectiles = state.projectiles.filter(q => !used.has(q));
    if (t.broken) continue;
    // A body he sent flying into it
    for (const e of state.enemies) {
      if (!(e.isBlownAway || (e.pauseTimer ?? 0) > 3) || Math.hypot(e.vel.x, e.vel.y) < 4) continue;
      if (overlaps({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, b)) { smash(ctx, t, debris, Math.sign(e.vel.x) || away, killable); break; }
    }
  }
  // The pieces: falling, bouncing, rolling; whoever's in the way of a fast one is done
  for (const d of debris) {
    d.life--;
    d.vy += d.rolling ? 0 : 0.5;
    d.x += d.vx; d.y += d.vy;
    d.rot += d.vx * 0.08;
    const r = d.kind === 'plate' ? 12 : d.kind === 'kbell' ? 12 : 9;
    if (d.y > Y - r) { d.y = Y - r; d.vy = Math.abs(d.vy) > 2 ? -d.vy * 0.3 : 0; d.vx *= d.rolling ? 0.995 : 0.8; if (Math.abs(d.vy) > 1) playSound('thud', 0.3, 4); }
    if (Math.abs(d.vx) < 0.1) d.vx = 0;
    if (Math.hypot(d.vx, d.vy) < 2.5) continue;
    for (const e of state.enemies) if (killable(e) && overlaps({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height }, { x: d.x - r, y: d.y - r, w: r * 2, h: r * 2 })) kill(ctx, e, d.vx * 1.4, -7);
  }
  for (let i = debris.length - 1; i >= 0; i--) if (debris[i].life <= 0) debris.splice(i, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn

const tub = (c: Ctx, x: number, y: number) => {
  shaded(c, () => c.roundRect(x - 13, y - 26, 26, 26, 3), '#18181C', x - 13, y - 26, 26, 26);
  shadedTop(c, () => c.roundRect(x - 14, y - 29, 28, 5, 2), '#26262C', x - 14, y - 29, 28, 5, 0.8);
  ink(c, () => c.rect(x - 11, y - 20, 22, 11), '#B81C1C', 0.6);
  c.fillStyle = '#F8F0E0'; c.fillRect(x - 8, y - 17, 16, 1.6); c.fillRect(x - 6, y - 14, 12, 1.2);
  c.fillStyle = lite('#B81C1C', 0.4); c.fillRect(x - 11, y - 20, 22, 1);
  c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x - 11, y - 25, 3, 22);
};
const dumbbell = (c: Ctx, x: number, y: number, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  ink(c, () => c.rect(-7, -1.4, 14, 2.8), '#A1A1AA', 0.6);
  for (const hx of [-10, 6]) shaded(c, () => c.roundRect(hx, -6, 4, 12, 1.4), '#27272A', hx, -6, 4, 12, 0.8);
  c.restore();
};
const kbell = (c: Ctx, x: number, y: number, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(0, -9, 6, Math.PI, 0); c.stroke();
  c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath(); c.arc(0, -9, 6, Math.PI, 0); c.stroke();
  shaded(c, () => c.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2), '#27272A', -11, -10, 22, 20);
  c.fillStyle = '#71717A'; c.fillRect(-6, -5, 3, 3);
  c.restore();
};
const plateRound = (c: Ctx, x: number, y: number, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  shaded(c, () => c.arc(0, 0, 12, 0, Math.PI * 2), '#1F1F23', -12, -12, 24, 24);
  c.strokeStyle = '#52525B'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#A1A1AA'; c.fillRect(-2, -2, 4, 4);
  c.restore();
};

export const drawThing = (c: Ctx, t: Thing, frame: number) => {
  const x = t.x, gone = !!t.broken;
  switch (t.kind) {
    case 'tubs': {
      floorShadow(c, x, 70);
      if (gone) { c.fillStyle = '#6B3A1E'; c.fillRect(x - 40, Y - 5, 80, 5); c.fillStyle = '#8A5230'; for (let k = 0; k < 6; k++) c.fillRect(x - 36 + k * 13, Y - 7 - (k % 2) * 2, 9, 3); break; }
      const wob = t.shots ? Math.sin(frame * 0.8) * 1.5 : 0;
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) tub(c, x - 28 + k * 28 + r * 14 + wob * r, Y - r * 30);
      c.save(); c.translate(x + 8, Y - 96); c.rotate(0.1); ink(c, () => c.rect(-16, -6, 32, 12), '#FDE68A', 0.7); c.restore();
      signText(c, 'FREE', x + 8, Y - 93, 'bold 6px "Press Start 2P"', '#7F1D1D', 'rgba(0,0,0,0)');
      break;
    }
    case 'rack': {
      floorShadow(c, x, 170);
      if (gone) {
        c.save(); c.translate(x, Y - 6); c.rotate(0.12); steel(c, -80, -4, 160, 5, '#3F3F46'); c.restore();
        steel(c, x - 78, Y - 14, 5, 14, '#27272A'); break;
      }
      steel(c, x - 78, Y - 80, 5, 80, '#27272A'); steel(c, x + 73, Y - 80, 5, 80, '#27272A');
      for (const row of [-82, -56, -30]) {
        for (let k = 0; k < 8; k++) dumbbell(c, x - 64 + k * 18, Y + row - 6);
        steel(c, x - 80, Y + row, 160, 5, '#3F3F46');
      }
      break;
    }
    case 'kbells': {
      floorShadow(c, x, 110);
      steel(c, x - 52, Y - 30, 104, 4, '#3F3F46'); steel(c, x - 52, Y - 30, 4, 30, '#27272A'); steel(c, x + 48, Y - 30, 4, 30, '#27272A');
      if (!gone) for (let k = 0; k < 5; k++) kbell(c, x - 36 + k * 18, Y - 40 + 8);
      break;
    }
    case 'cable': {
      floorShadow(c, x, 90);
      steel(c, x - 40, Y - 180, 8, 180, '#3F3F46'); steel(c, x + 32, Y - 180, 8, 180, '#3F3F46');
      steel(c, x - 40, Y - 182, 80, 8, '#3F3F46');
      c.fillStyle = '#A1A1AA'; c.fillRect(x - 16, Y - 172, 1.4, 160); c.fillRect(x + 15, Y - 172, 1.4, 160);
      ink(c, () => c.arc(x, Y - 172, 4, 0, Math.PI * 2), '#71717A', 0.8);
      if (!gone) {
        c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, Y - 168); c.lineTo(x, Y - 74); c.stroke();
        for (let k = 0; k < 9; k++) { shadedTop(c, () => c.rect(x - 12, Y - 72 + k * 8, 24, 6.4), '#27272A', x - 12, Y - 72 + k * 8, 24, 6.4, 0.8); c.fillStyle = '#E5E7EB'; c.fillRect(x - 10, Y - 70 + k * 8, 3, 1.4); }
      } else { c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, Y - 168); c.quadraticCurveTo(x + 10, Y - 120, x - 6, Y - 90); c.stroke(); }
      break;
    }
    case 'bench': {
      floorShadow(c, x - 6, 130);
      steel(c, x - 40, Y - 26, 4, 26); steel(c, x + 36, Y - 26, 4, 26);
      pad(c, x - 46, Y - 35, 92, 9);
      steel(c, x + 44, Y - 90, 6, 90, '#71717A');
      if (!gone) { bar(c, x - 20, x + 90, Y - 92); plate(c, x + 82, Y - 92, 6, 18, '#1F1F23'); plate(c, x + 75, Y - 92, 5, 14, '#991B1B'); plate(c, x - 14, Y - 92, 6, 18, '#1F1F23'); }
      else { c.save(); c.translate(x + 30, Y - 50); c.rotate(-0.9); bar(c, -50, 50, 0); c.restore(); }
      break;
    }
  }
  void dark;
};

export const drawDebris = (c: Ctx, debris: Debris[]) => {
  for (const d of debris) {
    if (d.kind === 'tub') { c.save(); c.translate(d.x, d.y + 13); c.rotate(d.rot); tub(c, 0, 13); c.restore(); }
    else if (d.kind === 'dumbbell') dumbbell(c, d.x, d.y, d.rot);
    else if (d.kind === 'kbell') kbell(c, d.x, d.y + 2, d.rot);
    else plateRound(c, d.x, d.y, d.rot);
  }
};

/** (for the stage: is anything flying fast near x?) */
export const debrisNear = (debris: Debris[], x: number) => debris.some(d => Math.abs(d.x - x) < 200 && Math.hypot(d.vx, d.vy) > 2);
export type { GameState };
