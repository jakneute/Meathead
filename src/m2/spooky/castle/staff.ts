// The castle's cast: park staff in cheap Monster Mash costumes (generic theme-park takes, nobody's trademark), a
// different person under every one (men and women, every skin, thin and heavy, by seed), each a different way to fight:
//   skeleton  SHIELD:  a skeleton bodysuit, a coffin lid for a shield; shots off the front of it bounce. Walks up and
//                      bashes with it, and the lid's down a moment after (the opening). Go round, over, or charge it.
//   knight    SPIKY:   tin-foil armor, a bucket helm with spikes welded on top (dive kick it and it's your feet), a
//                      sword that is not plastic. Slow, a big wind-up.
//   igor      POINTY:  a hunchback in a chef's hat with a roasting fork out in front (don't shoulder charge into it):
//                      the wind-up, the lunge.
//   witch     THROWER: green face paint, a pointy hat; keeps her distance and lobs potion bottles over.
//   bride     RUSHER:  a vampire bride (a nightgown, the hair, plastic fangs): hisses (the tell), then flat out at him.
//   batsuit   FLYER:   a rubber bat suit on a stunt rig (the wire up to a trolley on the ceiling): hangs, swoops.
//   mummy     TANK:    a big one, wrapped in toilet paper; slow, takes a beating, and hits like a truck.
//   bat       (wildlife: the real thing) flits about, swoops, bites.
// Feet at the origin, facing right; crude on purpose (the prototype pass).

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { safeAhead, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { BOTTLE_GRAVITY } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { type Ctx, INK, dk, lt, rect, dot, head, eyes, mouth, arm } from '../../cast/kit';
import * as L from './lines';

export type Costume = 'skeleton' | 'knight' | 'igor' | 'witch' | 'bride' | 'batsuit' | 'mummy';
export const STAFF = {
  skeleton: 'm2:castle_skeleton', knight: 'm2:castle_knight', igor: 'm2:castle_igor', witch: 'm2:castle_witch', bride: 'm2:castle_bride',
  batsuit: 'm2:castle_batsuit', mummy: 'm2:castle_mummy', bat: 'm2:castle_bat',
} as const;

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) + (e.variant ?? 0) * 31;
const live = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return live(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** His box (ducked or sliding: the low half of it). */
const pBox = (state: GameState) => {
  const p = state.player, low = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + low, w: p.width, h: p.height - low };
};
/** A swing out in front of it: `reach` past its middle, `top..bot` up from its feet. Hurts him if he's in it. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, top: number, bot: number, dmg: number, source: string) => {
  const { state } = ctx, p = state.player;
  if (p.invincibilityTimer > 0 || !live(state)) return false;
  const cx = e.pos.x + e.width / 2, f = e.facing === -1 ? -1 : 1, feet = e.pos.y + e.height;
  const x0 = f > 0 ? cx : cx - reach, x1 = f > 0 ? cx + reach : cx, b = pBox(state);
  if (b.x < x1 && b.x + b.w > x0 && b.y < feet - bot && b.y + b.h > feet - top) { hurtPlayer(ctx, dmg, source, { x: f * 6, y: -5 }); return true; }
  return false;
};
const go = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
/** Walk at him, not off an edge. */
const walk = (ctx: FrameContext, e: Enemy, dir: number, speed: number) => { e.vel.x = safeAhead(ctx, e, dir, 10) ? dir * speed : 0; };

// ---------------------------------------------------------------------------------------------------------------
// Their AIs

const skeletonAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 70;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; e.isShieldActive = true; if (sees(state, e, 560, 200)) go(e, 'walk'); break;
    case 'walk':
      e.isShieldActive = true; e.facing = dir as 1 | -1;
      if (adx > 64) walk(ctx, e, dir, 1.25); else e.vel.x = 0;
      if (adx < 96 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer > 24) { go(e, 'bash'); playSound('whoosh', 0.6, -2); } break;
    case 'bash':
      e.vel.x = e.aiTimer < 7 ? e.facing! * 5 : 0;
      if (e.aiTimer < 9) strike(ctx, e, 56, 66, 4, 12, e.kind!);
      if (e.aiTimer > 12) go(e, 'open');
      break;
    // (the lid down: the opening)
    case 'open': e.vel.x *= 0.8; e.isShieldActive = false; if (e.aiTimer > 46) go(e, 'walk'); break;
  }
  return false;
};

const knightAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 220)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 1.0); else e.vel.x = 0;
      if (adx < 112 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer === 1) playSound('clang', 0.3, 6); if (e.aiTimer > 30) { go(e, 'swing'); playSound('whoosh', 0.8, -4); } break;
    case 'swing':
      e.vel.x = e.aiTimer < 5 ? e.facing! * 2.5 : 0;
      if (e.aiTimer < 10) strike(ctx, e, 82, 74, 0, 14, e.kind!);
      if (e.aiTimer > 14) go(e, 'recover');
      break;
    case 'recover': e.vel.x = 0; if (e.aiTimer > 42) go(e, 'walk'); break;
  }
  return false;
};

const igorAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 200)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 1.7); else e.vel.x = 0;
      if (adx < 110 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer > 20) { go(e, 'thrust'); playSound('whoosh', 0.6, 2); } break;
    case 'thrust':
      e.vel.x = e.aiTimer < 8 ? e.facing! * 6.5 : 0;
      if (e.aiTimer < 12) strike(ctx, e, 66, 50, 30, 12, `${STAFF.igor}_fork`);
      if (e.aiTimer > 16) go(e, 'recover');
      break;
    case 'recover': e.vel.x *= 0.8; if (e.aiTimer > 34) go(e, 'walk'); break;
  }
  return false;
};

/** A potion bottle, lobbed: up and over, coming down where he's stood. */
const lob = (ctx: FrameContext, e: Enemy) => {
  const p = ctx.state.player;
  const x = e.pos.x + e.width / 2 + (e.facing ?? 1) * 10, y = e.pos.y + e.height - 62;
  const tx = p.pos.x + p.width / 2 + p.vel.x * 10, ty = p.pos.y + p.height / 2;
  const t = Math.max(26, Math.min(50, Math.abs(tx - x) / 7));
  const vx = (tx - x) / t, vy = (ty - y - 0.5 * BOTTLE_GRAVITY * t * t) / t;
  playSound('whoosh', 0.5, 5);
  ctx.state.projectiles.push({ id: `witch-${ctx.state.frame}-${Math.random()}`, pos: { x: x - 6, y: y - 8 }, vel: { x: vx, y: vy }, width: 12, height: 16, health: 1, maxHealth: 1, type: 'projectile', damage: 11, owner: 'enemy', shooterKind: e.kind ?? 'enemy', thrown: 'flask', rotation: 0 });
};
const witchAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 620, 320)) go(e, 'keep'); break;
    case 'keep':
      e.facing = dir as 1 | -1;
      // (her distance: back off if he's close, in a bit if he's far)
      if (adx < 230) walk(ctx, e, -dir, 1.5); else if (adx > 430) walk(ctx, e, dir, 1.2); else e.vel.x = 0;
      if (e.aiTimer > 80 && adx < 640 && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; e.facing = dir as 1 | -1; if (e.aiTimer > 22) { lob(ctx, e); go(e, 'keep'); e.aiTimer = Math.floor(Math.random() * 25); } break;
  }
  return false;
};

const brideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 90;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 600, 200)) go(e, 'hiss'); break;
    case 'hiss':
      e.vel.x = 0; e.facing = dir as 1 | -1;
      if (e.aiTimer === 2) playSound('snort', 0.7, 12);
      if (e.aiTimer > (e.aiX ? 16 : 26) && level && live(state)) { go(e, 'rush'); e.aiX = 1; }
      break;
    case 'rush': {
      e.vel.x = safeAhead(ctx, e, e.facing!, 20) ? e.facing! * 7.5 : 0;
      const passed = Math.sign(dx) !== e.facing && adx > 110;
      if (passed || e.vel.x === 0 || e.aiTimer > 90) go(e, 'skid');
      break;
    }
    case 'skid': e.vel.x *= 0.86; if (e.aiTimer > 30) go(e, 'hiss'); break;
  }
  return false;
};

const batsuitAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player);
  switch (e.aiState) {
    default: {
      const t = (state.frame + homeX) * 0.02;
      const tx = homeX + Math.cos(t) * 120, ty = homeY + Math.sin(t * 2) * 16;
      e.vel.x = (tx - e.pos.x) * 0.05; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = (p.x < m.x ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 80 && Math.abs(p.x - m.x) < 360 && p.y > m.y + 40 && live(state)) {
        go(e, 'dive'); e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * 7.5, y: ((p.y - m.y) / len) * 7.5 };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('whoosh', 0.6, 0);
      }
      break;
    }
    case 'dive':
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 16 || m.y > (e.aiY ?? m.y) + 10 || e.aiTimer > 70) go(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-4, e.vel.y - 0.45);
      if (e.pos.y <= homeY) go(e, 'idle');
      break;
  }
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'dive') go(e, 'climb'); }
  return true;
};

const mummyAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 90;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 220)) go(e, 'walk'); break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 70) walk(ctx, e, dir, 0.7); else e.vel.x = 0;
      if (adx < 116 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer === 1) playSound('snort', 0.6, -8); if (e.aiTimer > 40) { go(e, 'slam'); playSound('whoosh', 0.9, -8); } break;
    case 'slam':
      e.vel.x = e.aiTimer < 8 ? e.facing! * 3.5 : 0;
      if (e.aiTimer < 12) strike(ctx, e, 74, 80, 0, 20, e.kind!);
      if (e.aiTimer === 10) { playSound('thud', 0.8, -6); }
      if (e.aiTimer > 14) go(e, 'recover');
      break;
    case 'recover': e.vel.x = 0; if (e.aiTimer > 52) go(e, 'walk'); break;
  }
  return false;
};

const batAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const m = mid(e), p = mid(state.player), seed = seedOf(e);
  if (e.aiState === 'swoop') {
    if (e.aiTimer > 40 || Math.hypot(p.x - m.x, p.y - m.y) < 10) go(e, 'back');
  } else if (e.aiState === 'back') {
    e.vel.x += ((homeX - e.pos.x) * 0.004 - e.vel.x * 0.05); e.vel.y += ((homeY - e.pos.y) * 0.004 - e.vel.y * 0.05);
    if (e.aiTimer > 70) go(e, 'idle');
  } else {
    // (flitting: a jittery figure-eight about where it roosts)
    const t = state.frame * 0.06 + seed;
    const tx = homeX + Math.sin(t) * 90 + Math.sin(t * 3.1) * 20, ty = homeY + Math.sin(t * 2) * 30 + Math.cos(t * 4.3) * 10;
    e.vel.x = (tx - e.pos.x) * 0.08; e.vel.y = (ty - e.pos.y) * 0.08;
    if (e.aiTimer > 60 + (seed % 40) && Math.hypot(p.x - m.x, p.y - m.y) < 300 && live(state)) {
      go(e, 'swoop');
      const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
      e.vel = { x: ((p.x - m.x) / len) * 6, y: ((p.y - m.y) / len) * 6 };
      playSound('chitter', 0.4, 8);
    }
  }
  e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'swoop') go(e, 'back'); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing them (crude: boxes and the cast kit's faces)

type Pose = 'stand' | 'walk' | 'wind' | 'strike' | 'fly';
const poseOf = (e: Enemy): Pose => {
  const s = e.aiState;
  if (s === 'wind' || s === 'hiss') return 'wind';
  if (s === 'bash' || s === 'swing' || s === 'thrust' || s === 'slam' || s === 'rush' || s === 'dive') return 'strike';
  return Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
};

/** One of the cast, in costume, at the origin facing right. `woman` forces it either way. */
export const drawStaff = (c: Ctx, costume: Costume, seed: number, f: number, pose: Pose, woman?: boolean) => {
  const Lk = lookOf(seed, woman);
  const stride = pose === 'walk' ? Math.sin(f * 0.25 + seed) * 4 : 0;
  const heavy = Lk.heavy || costume === 'mummy';
  const w = heavy ? 30 : Lk.woman ? 21 : 24, hip = heavy ? 28 : 21;
  // The costume's colors: [legs, body, sleeves]
  const C: Record<Costume, [string, string, string]> = {
    skeleton: ['#18181B', '#18181B', '#18181B'], knight: ['#9CA3AF', '#B91C1C', '#9CA3AF'], igor: ['#57534E', '#78350F', '#78350F'],
    witch: ['#18181B', '#1F1F2E', '#1F1F2E'], bride: ['#F1F5F9', '#F1F5F9', '#F1F5F9'], batsuit: ['#27272A', '#3F3F46', '#27272A'], mummy: ['#E7E2CF', '#E7E2CF', '#E7E2CF'],
  };
  const [legC, bodyC, armC] = C[costume];
  // the face: their own skin, or the paint
  const face = costume === 'skeleton' ? '#F5F5F4' : costume === 'witch' ? '#86C98A' : costume === 'bride' ? lt(Lk.skin, 0.55) : costume === 'mummy' ? '#E7E2CF' : Lk.skin;
  const hunch = costume === 'igor' ? 7 : 0;
  c.save();
  // Legs (a long gown or dress over them: the bride, the witch)
  if (costume === 'bride' || costume === 'witch') {
    rect(c, -hip / 2 - 4, -32, hip + 8, 30, bodyC, 3);
    for (const s of [-1, 1]) dot(c, s * 5 - 3 + s * stride * 0.4, -4, 8, 4, INK);
  } else for (const s of [-1, 1]) {
    const x = s * 4.5 + s * stride * 0.5 - 3.5;
    rect(c, x, -30, 7, 27, s < 0 ? dk(legC, 0.15) : legC, 1.5);
    if (costume === 'skeleton') dot(c, x + 2, -27, 3, 22, '#E7E5E4');
    if (costume === 'mummy') for (let k = 0; k < 4; k++) dot(c, x, -26 + k * 6, 7, 1, '#B8B19A');
    dot(c, x - 1, -4, 10, 4, costume === 'knight' ? '#6B7280' : costume === 'batsuit' ? '#18181B' : '#27272A');
  }
  // The far arm
  const far: [number, number] = pose === 'strike' ? [w / 2 + 6, -48] : pose === 'wind' ? [-w / 2 - 6, -60] : [-w / 2 + 2, -32];
  arm(c, -w / 2 + 3 + hunch, -52, far[0] + hunch, far[1], armC, costume === 'mummy' ? '#E7E2CF' : costume === 'skeleton' ? '#F5F5F4' : Lk.skin, 1, 6);
  // The body
  c.save(); c.translate(hunch, 0);
  rect(c, -w / 2, -56, w, 28, bodyC, 4);
  c.restore();
  if (costume === 'skeleton') for (let k = 0; k < 3; k++) dot(c, -w / 2 + 5, -51 + k * 7, w - 10, 2, '#E7E5E4');
  if (costume === 'knight') { dot(c, -6, -54, 12, 24, '#7F1D1D'); dot(c, -3, -48, 6, 5, '#FDE68A'); dot(c, -5, -47, 10, 2, '#FDE68A'); }
  if (costume === 'mummy') for (let k = 0; k < 5; k++) dot(c, -w / 2 + 1, -54 + k * 5 + (k % 2), w - 2, 1, '#B8B19A');
  if (costume === 'igor') rect(c, -w / 2 - 4, -62, 16, 14, '#78350F', 7); // (the hump)
  if (costume === 'bride') { dot(c, -w / 2, -40, w, 2, '#CBD5E1'); dot(c, -3, -56, 6, 4, '#FDA4AF'); }
  // The head
  const hy = -67 + (costume === 'igor' ? 6 : 0), hx = 1 + hunch;
  if (costume === 'bride' || (costume === 'witch' && Lk.long)) rect(c, hx - 11, hy - 8, 9, 30, '#111827', 3);
  head(c, hx, hy, 8.5, 9.5, face, costume !== 'knight');
  if (costume === 'knight') {
    // (the bucket helm, its slit, the spikes up top)
    rect(c, hx - 10, hy - 11, 20, 22, '#A1A1AA', 3); dot(c, hx - 2, hy - 2, 12, 3, INK); dot(c, hx - 9, hy - 9, 3, 18, '#D4D4D8');
    for (const sx of [-6, 0, 6]) { c.fillStyle = '#E5E7EB'; c.beginPath(); c.moveTo(hx + sx - 3, hy - 11); c.lineTo(hx + sx, hy - 24); c.lineTo(hx + sx + 3, hy - 11); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); }
  } else if (costume === 'skeleton') {
    // (the skull paint: black sockets, the nose hole, a row of teeth)
    dot(c, hx - 2, hy - 4, 4, 4, INK); dot(c, hx + 4, hy - 4, 4, 4, INK); dot(c, hx + 3, hy + 1, 2, 2, INK);
    for (let k = 0; k < 4; k++) dot(c, hx - 1 + k * 2.5, hy + 5, 1, 3, INK);
    dot(c, hx - 9, hy - 9, 18, 3, '#18181B'); // (the hood's edge)
  } else if (costume === 'batsuit') {
    rect(c, hx - 10, hy - 10, 20, 14, '#27272A', 4);
    // (round floppy ears on the hood, a cheap mascot costume's: a bat, nothing more heroic than that)
    for (const s of [-1, 1]) { c.fillStyle = '#27272A'; c.beginPath(); c.ellipse(hx + s * 8, hy - 11, 5.5, 6.5, s * 0.5, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#9F7A8A'; c.beginPath(); c.ellipse(hx + s * 8, hy - 11, 2.5, 3.5, s * 0.5, 0, Math.PI * 2); c.fill(); }
    eyes(c, hx + 2.5, hy - 1, 3.4, 'angry', f, 0.6, 2, '#27272A'); mouth(c, hx + 4, hy + 6, 5, 'teeth', f);
  } else if (costume === 'mummy') {
    for (let k = 0; k < 4; k++) dot(c, hx - 8, hy - 7 + k * 4.5, 16, 1, '#B8B19A');
    dot(c, hx, hy - 2, 9, 3, INK); dot(c, hx + 2, hy - 1.5, 2, 2, '#FDE047'); dot(c, hx + 6, hy - 1.5, 2, 2, '#FDE047');
  } else {
    eyes(c, hx + 1.5, hy - 1, 3.6, pose === 'wind' || pose === 'strike' ? 'angry' : 'open', f, 0.6, 2.2, dk(face, 0.1));
    mouth(c, hx + 3, hy + 6, 5, costume === 'bride' ? 'teeth' : pose === 'strike' ? 'grin' : 'frown', f);
    if (costume === 'bride' || costume === 'igor') { dot(c, hx + 1, hy + 6, 1.5, 3, '#FFFFFF'); dot(c, hx + 4, hy + 6, 1.5, 3, '#FFFFFF'); }
    if (costume === 'bride') dot(c, hx + 1, hy + 4.8, 5, 1.2, '#B91C1C');
    if (!Lk.woman && costume === 'igor') dot(c, hx - 3, hy - 6, 10, 2, Lk.hair);
  }
  // Hats
  if (costume === 'witch') {
    rect(c, hx - 15, hy - 10, 30, 4, '#111827', 1);
    c.fillStyle = '#111827'; c.beginPath(); c.moveTo(hx - 9, hy - 9); c.lineTo(hx - 4, hy - 32); c.lineTo(hx + 9, hy - 9); c.closePath(); c.fill(); c.strokeStyle = INK; c.stroke();
    dot(c, hx - 8, hy - 13, 16, 2, '#7C3AED');
  }
  if (costume === 'igor') { rect(c, hx - 8, hy - 20, 16, 12, '#F8FAFC', 5); rect(c, hx - 9, hy - 10, 18, 4, '#E2E8F0', 1); }
  if (costume === 'bride') rect(c, hx - 9, hy - 13, 18, 6, '#111827', 3);
  // The near arm, and what it holds
  const hand: [number, number] = pose === 'strike' ? [w / 2 + 14, -48] : pose === 'wind' ? [w / 2 - 6, -66] : [w / 2 + 2, -34];
  if (costume === 'batsuit') {
    // (the wings: rubber, on the arms, out wide flying)
    const up = pose === 'fly' || pose === 'strike' ? Math.sin(f * 0.3) * 10 : 0;
    for (const s of [-1, 1]) { c.fillStyle = s < 0 ? '#18181B' : '#27272A'; c.beginPath(); c.moveTo(0, -52); c.lineTo(s * 42, -62 - up); c.lineTo(s * 34, -40 - up * 0.5); c.lineTo(s * 22, -44); c.lineTo(s * 12, -34); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
  }
  arm(c, w / 2 - 3 + hunch, -52, hand[0] + hunch, hand[1], armC, costume === 'mummy' ? '#E7E2CF' : costume === 'skeleton' ? '#F5F5F4' : Lk.skin, 1, 6);
  const [hx2, hy2] = [hand[0] + hunch, hand[1]];
  if (costume === 'knight') {
    // (the sword: raised over his head winding up, out level swinging)
    c.save(); c.translate(hx2, hy2); c.rotate(pose === 'wind' ? -2.2 : pose === 'strike' ? 0.1 : -1.2);
    dot(c, 0, -2, 40, 4, '#D4D4D8'); dot(c, 0, -2, 40, 1, '#F8FAFC'); dot(c, -6, -5, 3, 10, '#78350F'); dot(c, -12, -1.5, 8, 3, '#78350F');
    c.restore();
  }
  if (costume === 'igor') {
    // (the roasting fork, out in front: two long tines)
    const out = pose === 'strike' ? 14 : pose === 'wind' ? -8 : 4;
    dot(c, hx2 - 14, hy2 - 1, 44 + out, 3, '#78350F');
    dot(c, hx2 + 28 + out, hy2 - 6, 4, 13, '#9CA3AF');
    dot(c, hx2 + 30 + out, hy2 - 6, 16, 2, '#D4D4D8'); dot(c, hx2 + 30 + out, hy2 + 5, 16, 2, '#D4D4D8');
  }
  if (costume === 'witch' && pose === 'wind') { rect(c, hx2 - 4, hy2 - 14, 9, 12, '#22C55E', 2); dot(c, hx2 - 1, hy2 - 18, 3, 4, '#78350F'); }
  c.restore();
  return Lk;
};

/** The coffin lid, in front of a skeleton (`up` or down at its side). */
const drawLid = (c: Ctx, up: boolean, pose: Pose) => {
  const x = pose === 'strike' ? 24 : 15, y = up ? -66 : -40;
  c.save(); c.translate(x, y); if (!up) c.rotate(0.5);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-1, 0); c.lineTo(9, 0); c.lineTo(12, 18); c.lineTo(9, 62); c.lineTo(-1, 62); c.lineTo(-4, 18); c.closePath(); c.fill();
  c.fillStyle = '#7C4A2D'; c.beginPath(); c.moveTo(0, 2); c.lineTo(8, 2); c.lineTo(10, 18); c.lineTo(8, 60); c.lineTo(0, 60); c.lineTo(-2, 18); c.closePath(); c.fill();
  dot(c, 0, 4, 2, 54, '#9A6440'); dot(c, 2, 16, 4, 14, '#C9A227');
  c.restore();
};

/** The bat suit's rig: the wire up from his back to the trolley (off the top of the screen). */
const drawWire = (c: Ctx) => { dot(c, -1, -900, 2, 850, '#A1A1AA'); dot(c, -4, -56, 8, 6, '#52525B'); };

const drawBat = (c: Ctx, f: number, seed: number) => {
  const flap = Math.sin(f * 0.6 + seed) * 7;
  c.fillStyle = INK;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -10); c.lineTo(s * 16, -16 - flap); c.lineTo(s * 13, -8); c.lineTo(s * 7, -9); c.closePath(); c.fill(); }
  c.fillStyle = '#3F2A2A'; c.beginPath(); c.ellipse(0, -9, 5, 6, 0, 0, Math.PI * 2); c.fill();
  dot(c, -3, -16, 2, 4, '#3F2A2A'); dot(c, 1, -16, 2, 4, '#3F2A2A');
  dot(c, -2, -11, 1.5, 1.5, '#FCA5A5'); dot(c, 1, -11, 1.5, 1.5, '#FCA5A5');
};

// ---------------------------------------------------------------------------------------------------------------
// Registered

const human = (e: Enemy, woman?: boolean) => (lookOf(seedOf(e), woman).woman ? 'f' : 'm');
const brideWoman = (e: Enemy) => seedOf(e) % 5 !== 0;

registerM2Kind({
  kind: STAFF.skeleton, stats: { w: 42, h: 68, hp: 150, contact: 8, mass: 230 }, ai: skeletonAI, humanoid: true,
  make: b => ({ ...b, enemyType: 'shield', isShieldActive: true }),
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => { const pose = poseOf(e); drawStaff(c, 'skeleton', seedOf(e), f, pose); drawLid(c, e.isShieldActive !== false, pose); },
});
registerM2Kind({
  kind: STAFF.knight, stats: { w: 42, h: 70, hp: 210, contact: 9, mass: 300 }, ai: knightAI, humanoid: true,
  spiky: { source: `${STAFF.knight}_spikes`, label: 'SPIKED!' },
  gender: e => human(e), head: { x: 1, y: -67, r: 10 },
  draw: (c, e, f) => drawStaff(c, 'knight', seedOf(e), f, poseOf(e)),
});
registerM2Kind({
  kind: STAFF.igor, stats: { w: 40, h: 62, hp: 120, contact: 9, mass: 200 }, ai: igorAI, humanoid: true,
  pointy: { source: `${STAFF.igor}_fork`, label: 'FORKED!' },
  gender: e => human(e), head: { x: 8, y: -61, r: 9 },
  draw: (c, e, f) => drawStaff(c, 'igor', seedOf(e), f, poseOf(e)),
});
registerM2Kind({
  kind: STAFF.witch, stats: { w: 38, h: 66, hp: 90, contact: 7, mass: 170 }, ai: witchAI, humanoid: true,
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => drawStaff(c, 'witch', seedOf(e), f, poseOf(e)),
});
registerM2Kind({
  kind: STAFF.bride, stats: { w: 38, h: 66, hp: 100, contact: 12, mass: 170 }, ai: brideAI, humanoid: true,
  gender: e => human(e, brideWoman(e)), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => {
    const pose = poseOf(e);
    // (rushing: leaning into it, arms out for his neck)
    if (pose === 'strike') c.rotate(0.18);
    drawStaff(c, 'bride', seedOf(e), f, pose, brideWoman(e));
  },
});
registerM2Kind({
  kind: STAFF.batsuit, stats: { w: 44, h: 66, hp: 80, contact: 10, mass: 160, air: true }, ai: batsuitAI, humanoid: true, grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  gender: e => human(e), head: { x: 1, y: -67, r: 9 },
  draw: (c, e, f) => { drawWire(c); drawStaff(c, 'batsuit', seedOf(e), f, e.aiState === 'dive' ? 'strike' : 'fly'); },
});
registerM2Kind({
  kind: STAFF.mummy, stats: { w: 50, h: 74, hp: 420, contact: 12, mass: 520 }, ai: mummyAI, humanoid: true, grab: 'none',
  gender: e => human(e), head: { x: 1, y: -67, r: 10 },
  draw: (c, e, f) => {
    c.save(); c.scale(1.12, 1.1);
    drawStaff(c, 'mummy', seedOf(e), f, poseOf(e));
    // (a strip of it come loose, trailing)
    c.fillStyle = '#E7E2CF'; c.fillRect(-18, -40 + Math.sin(f * 0.1) * 2, 6, 26);
    c.restore();
  },
});
registerM2Kind({
  kind: STAFF.bat, stats: { w: 26, h: 18, hp: 20, contact: 6, mass: 15, air: true }, ai: batAI, gender: 'n', grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  head: { x: 0, y: -10, r: 5 },
  draw: (c, e, f) => drawBat(c, f, seedOf(e)),
});

registerHurtLines(STAFF.skeleton, L.HURT_SKELETON, L.DEATH_SKELETON);
registerHurtLines(STAFF.knight, L.HURT_KNIGHT, L.DEATH_KNIGHT);
registerHurtLines(`${STAFF.knight}_spikes`, L.HURT_KNIGHT_SPIKES, L.DEATH_KNIGHT_SPIKES);
registerHurtLines(STAFF.igor, L.HURT_IGOR, L.DEATH_IGOR);
registerHurtLines(`${STAFF.igor}_fork`, L.HURT_FORK, L.DEATH_FORK);
registerHurtLines(STAFF.witch, L.HURT_WITCH, L.DEATH_WITCH);
registerHurtLines(`${STAFF.witch}_shot`, L.HURT_FLASK, L.DEATH_FLASK);
registerHurtLines(STAFF.bride, L.HURT_BRIDE, L.DEATH_BRIDE);
registerHurtLines(STAFF.batsuit, L.HURT_BATSUIT, L.DEATH_BATSUIT);
registerHurtLines(STAFF.mummy, L.HURT_MUMMY, L.DEATH_MUMMY);
registerHurtLines(STAFF.bat, L.HURT_BAT, L.DEATH_BAT);

// ---------------------------------------------------------------------------------------------------------------
// Putting them in the world

export type StaffKind = keyof typeof STAFF;
/** One of them, its feet at (x, feetY) (a flyer: hung at that height), facing `facing`. */
export const spawnStaff = (state: GameState, kind: StaffKind, x: number, feetY: number, variant = 0, facing: 1 | -1 = -1): Enemy => {
  // (made by hand, like makeKindEnemy: the kind's own make)
  const e = makeStaff(STAFF[kind], x, feetY);
  e.homeX = x; e.homeY = e.pos.y; e.variant = variant; e.facing = facing; e.aiState = 'idle'; e.aiTimer = 0;
  state.enemies.push(e);
  return e;
};
const makeStaff = (kind: string, x: number, feetY: number) => makeKindEnemy(kind as EnemyKind, x, feetY);
