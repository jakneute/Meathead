// The water park's level 1 cast (new kinds, registered as this is loaded). Harder than the lands': the endgame's step
// up (the owner's "test your mastery"). Every one has a tell before it hurts him.
//
//   wp_dguest   a park guest, possessed by the demons (red). Fast: the head snaps round at him (the tell), then a sprint
//               and a haymaker. Hits hard, takes a beating.
//   wp_aguest   a park guest, possessed by the aliens (green). Crouches, glowing (the tell), and leaps at him from
//               well off: a long arc that comes down on him (jump or roll out from under).
//   wp_gator    a possessed gator (red eyes). Low (shots over him), patrols, the jaws gape (the tell) and it lunges.
//               Its jaws are pointy: a charge into its face gets bit. A slide or a dive kick does it.
//   wp_pelican  a possessed pelican (alien): hangs up in the air, screeches and its pouch glows (the tell), dives at him
//               on a line, then climbs back.
//   wp_trooper  one of Zorblax's soldiers, a harder one: the arm's coil glows (the tell), three bolts in a burst.
//   wp_hover    a soldier on a hover disc: keeps up above and off to one side, fires bolts down at him at an angle (the
//               coil's glow, the tell). On the tube rides, it rides along with him.
//   wp_yeti     MOUNT EVEREST BUT BETTER's mascot suit, a demon inside: slow, huge; both arms up and a roar (the tell),
//               then the fists down on the floor: a shockwave along it both ways (jump it), or a punch up close.
//
// What they fire is their own (shots below: drawn after the enemies, only for him).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { helmetStopsAt } from '../../upgrades/gear';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../../m1/constants';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { speak, type Said } from '../../adventure/section';
import { drawGuest, guestOf, drawGator, drawPelican, drawHover, drawYeti, type GuestPose, type Possession } from './kindArt';
import { drawAlien, type AlienPose } from '../../space/crater/aliens';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;

for (const [source, l] of Object.entries(L.HURT)) registerHurtLines(source, l.hurt, l.death);

export const DGUEST = 'm2:wp_dguest', AGUEST = 'm2:wp_aguest', GATOR = 'm2:wp_gator', PELICAN = 'm2:wp_pelican', TROOPER = 'm2:wp_trooper', HOVER = 'm2:wp_hover', YETI = 'm2:wp_yeti';
export const KIND_OF = { dguest: DGUEST, aguest: AGUEST, gator: GATOR, pelican: PELICAN, trooper: TROOPER, hover: HOVER, yeti: YETI } as const;

export const byPants = <T>(state: GameState, r: { clean: T; shitty: T; nude: T }) => (isNude(state) ? r.nude : isShat(state) ? r.shitty : r.clean);
const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const set = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const alive = (state: GameState) => state.player.health > 0;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return alive(state) && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** On a tube ride (tube.ts says): the hover aliens ride along with him. Set by the stage. */
let riding: (state: GameState) => boolean = () => false;
/** On a tube ride: the hover aliens waiting their turn behind him (tube.ts says): they keep back and don't fire. */
export const QUEUED = new WeakSet<Enemy>();
export const setRidingCheck = (f: (state: GameState) => boolean) => { riding = f; };
/** His box as the shots see it (riding a tube, it's the tube's say: ducked, it's low). Set by the stage. */
let boxOf: (state: GameState) => { x: number; y: number; w: number; h: number } = s => ({ x: s.player.pos.x, y: s.player.pos.y, w: s.player.width, h: s.player.height });
export const setShotBox = (f: typeof boxOf) => { boxOf = f; };

// ---------------------------------------------------------------------------------------------------------------
// What's fired: bolts (straight, Zorblax's pink), the kid's (green), the kid's ice balls (lobbed), the yeti's shockwave
// (along the floor)

export interface Shot { x: number; y: number; vx: number; vy: number; kind: 'bolt' | 'kid' | 'snow' | 'wave'; t: number; floor?: number; src: string; dmg: number }
const SHOTS = new WeakMap<GameState, Shot[]>();
export const shotsOf = (state: GameState) => { let s = SHOTS.get(state); if (!s) { s = []; SHOTS.set(state, s); } return s; };
export const clearShots = (state: GameState) => { shotsOf(state).length = 0; };
export const fire = (state: GameState, s: Omit<Shot, 't'>) => { shotsOf(state).push({ ...s, t: 0 }); };
export const fireBolt = (state: GameState, x: number, y: number, tx: number, ty: number, speed = 6, src = 'm2:wp_bolt', dmg = 11, kind: 'bolt' | 'kid' = 'bolt') => {
  const d = Math.hypot(tx - x, ty - y) || 1;
  fire(state, { x, y, vx: ((tx - x) / d) * speed, vy: ((ty - y) / d) * speed, kind, src, dmg });
  playSound('rayFizzle', 0.4, 2);
};
const pop = (state: GameState, s: Shot) => {
  const cols = s.kind === 'snow' ? ['#F8FAFC', '#BFDBFE', '#FFFFFF'] : s.kind === 'kid' ? ['#9BF25E', '#ECFCCB', '#FFF'] : ['#FF7AD9', '#FDE047', '#FFFFFF'];
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 18, color: cols[i % 3], size: 2 + Math.random() * 2 });
};
export const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, list = shotsOf(state);
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i];
    s.t++;
    if (s.kind === 'snow') s.vy += 0.32;
    s.x += s.vx; s.y += s.vy;
    const b = boxOf(state);
    const r = s.kind === 'wave' ? 10 : 5;
    const hit = p.health > 0 && !p.inCutscene && s.x + r > b.x + 4 && s.x - r < b.x + b.w - 4 && s.y + r > b.y && s.y - (s.kind === 'wave' ? 24 : r) < b.y + b.h;
    if (hit) {
      if (p.invincibilityTimer <= 0 && !helmetStopsAt(state, s.x, s.y, 6)) { hurtPlayer(ctx, s.dmg, s.src, { x: Math.sign(s.vx || 1) * 3, y: -4 }, 16); shakeScreen(state, 6, 3); }
      if (s.kind !== 'wave') { pop(state, s); list.splice(i, 1); continue; }
    }
    if (s.kind !== 'wave' && state.blocks.some(k => k.type !== 'pit' && !k.oneWay && s.x > k.x && s.x < k.x + k.w && s.y > k.y && s.y < k.y + k.h)) { pop(state, s); list.splice(i, 1); continue; }
    if (s.t > (s.kind === 'wave' ? 70 : 240)) list.splice(i, 1);
  }
};
export const drawShots = (c: Ctx, state: GameState) => {
  for (const s of shotsOf(state)) {
    if (s.kind === 'bolt' || s.kind === 'kid') {
      const col = s.kind === 'kid' ? '#9BF25E' : '#FF7AD9', a = Math.atan2(s.vy, s.vx);
      c.save(); c.translate(s.x, s.y); c.rotate(a);
      c.globalAlpha = 0.4; c.fillStyle = col; c.beginPath(); c.ellipse(-6, 0, 14, 6, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1; c.fillStyle = '#FFFFFF'; c.fillRect(-8, -2, 14, 4); c.fillStyle = col; c.fillRect(-14, -1, 6, 2);
      c.restore();
    } else if (s.kind === 'snow') {
      c.fillStyle = '#0E0806'; c.beginPath(); c.arc(s.x, s.y, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E8F0FA'; c.beginPath(); c.arc(s.x, s.y, 6.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFFFF'; c.fillRect(s.x - 3, s.y - 4, 3, 2);
    } else {
      // (the shockwave: a crest of cracked floor and fake snow thrown up, going along)
      const k = 1 - s.t / 70;
      c.globalAlpha = Math.max(0, k);
      c.fillStyle = '#E8F0FA'; c.beginPath(); c.moveTo(s.x - 14, s.y); c.lineTo(s.x - 4, s.y - 26); c.lineTo(s.x + 4, s.y - 16); c.lineTo(s.x + 12, s.y - 22); c.lineTo(s.x + 16, s.y); c.closePath(); c.fill();
      c.strokeStyle = '#0E0806'; c.lineWidth = 1.5; c.stroke();
      c.globalAlpha = 1;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Barks (the possessed, now and then; never over anybody)

const BARKS = new WeakMap<GameState, { at: number; on: Map<Enemy, Said> }>();
export const barksOf = (state: GameState) => { let b = BARKS.get(state); if (!b) { b = { at: -999, on: new Map() }; BARKS.set(state, b); } return b; };
const bark = (state: GameState, e: Enemy, pos: Possession) => {
  const b = barksOf(state);
  if (state.frame - b.at < 420 || Math.random() > 0.4) return;
  b.at = state.frame;
  const woman = guestOf(seedOf(e)).woman, v = pos === 'demon' ? (woman ? L.DPOS_VOICE.f : L.DPOS_VOICE.m) : woman ? L.APOS_VOICE.f : L.APOS_VOICE.m;
  speak(v, pickLine(byPants(state, pos === 'demon' ? L.DPOS_BARK : L.APOS_BARK)), s => { if (s) b.on.set(e, s); else b.on.delete(e); }, false);
};
export const drawBarks = (c: Ctx, state: GameState, saidOver: (c: Ctx, s: string, x: number, y: number, col?: string, wide?: number) => void) => {
  for (const [e, s] of barksOf(state).on) if (e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 20, e.kind === DGUEST ? '#FCA5A5' : '#BEF264', 220);
};

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const wander = (ctx: FrameContext, e: Enemy, range: number, v: number) => {
  const home = e.homeX ?? e.pos.x;
  e.facing ??= -1;
  if (Math.abs(e.pos.x - home) > range || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
  e.vel.x = e.facing * v;
};

/** Demon-possessed: snaps round (the tell), sprints, swings. */
const DG = { see: 520, tell: 22, sprint: 6.4, reach: 54, dmg: 18, recover: 38 };
const dguest = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      wander(ctx, e, 60, 1.1);
      if (e.aiTimer > 20 && sees(state, e, DG.see, 120)) { set(e, 'tell'); e.facing = dirTo(e, p.x); playSound('snort', 0.4, 4); bark(state, e, 'demon'); }
      break;
    case 'tell':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > DG.tell) set(e, 'sprint');
      break;
    case 'sprint': {
      const ok = safeAhead(ctx, e, e.facing!, 20);
      e.vel.x = ok ? e.facing! * DG.sprint : 0;
      if (Math.abs(dx) < DG.reach && Math.abs(p.y - m.y) < 60) { set(e, 'punch'); e.vel.x = e.facing! * 2; break; }
      if (!ok || dx * e.facing! < -80 || e.aiTimer > 90) set(e, 'recover');
      break;
    }
    case 'punch':
      e.vel.x *= 0.8;
      if (e.aiTimer === 6) {
        playSound('whoosh', 0.5, 4);
        if (Math.abs(dx) < DG.reach + 14 && Math.abs(p.y - m.y) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, DG.dmg, DGUEST, { x: e.facing! * 7, y: -5 }, 20); shakeScreen(state, 7, 3); }
      }
      if (e.aiTimer > 18) set(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.85;
      if (e.aiTimer > DG.recover) { e.homeX = e.pos.x; set(e, sees(state, e, DG.see, 120) ? 'tell' : 'idle'); }
      break;
  }
  return false;
};

/** Alien-possessed: crouches, glowing (the tell), leaps onto him from well off. */
const AG = { see: 560, tell: 30, g: 0.5, dmg: 16 };
const aguest = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      wander(ctx, e, 50, 0.7);
      if (e.aiTimer > 30 && sees(state, e, AG.see, 160)) { set(e, 'walk'); bark(state, e, 'alien'); }
      return false;
    case 'walk': {
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 160 && safeAhead(ctx, e, e.facing) ? e.facing * 1.6 : 0;
      if (e.aiTimer > 50 && Math.abs(dx) < 420 && Math.abs(p.y - m.y) < 140 && !holdingOff(state)) set(e, 'crouch');
      return false;
    }
    case 'crouch':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 1) playSound('beep', 0.35, -4);
      if (e.aiTimer > AG.tell) {
        // (the leap: an arc that comes down where he is now (and a touch ahead of where he's going))
        const T = 46, tx = p.x + pl.vel.x * 10;
        e.vel.x = (tx - m.x) / T; e.vel.y = -(AG.g * T) / 2 - 1;
        e.vel.x = Math.max(-9, Math.min(9, e.vel.x));
        set(e, 'leap'); playSound('jump', 0.5, -6);
        e.pos.y -= 2;
      }
      return false;
    case 'leap': {
      e.vel.y += AG.g;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      // (landing on him: a slam)
      if (e.vel.y > 0 && Math.abs(dx) < 40 && Math.abs(p.y - m.y) < 50 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, AG.dmg, AGUEST, { x: Math.sign(dx || 1) * 6, y: -6 }, 20); shakeScreen(state, 8, 4); }
      // (down on something: the floor's the engine's to find; it's given back once it's stopped falling)
      const feet = e.pos.y + e.height;
      const floor = state.blocks.find(b => b.type !== 'pit' && m.x > b.x && m.x < b.x + b.w && feet >= b.y && feet - e.vel.y <= b.y + 2);
      if (floor && e.vel.y > 0) { e.pos.y = floor.y - e.height; e.vel.y = 0; e.vel.x = 0; set(e, 'land'); playSound('thud', 0.5, -4); shakeScreen(state, 4, 3); }
      if (e.aiTimer > 160) set(e, 'land');
      return true;
    }
    case 'land':
      e.vel.x = 0;
      if (e.aiTimer > 40) { e.homeX = e.pos.x; set(e, 'walk'); }
      return false;
  }
};

/** The gator: patrols, gapes (the tell), lunges. */
const gator = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      wander(ctx, e, 80, 1.0);
      if (e.aiTimer > 30 && sees(state, e, 300, 50)) { set(e, 'tell'); e.facing = dirTo(e, p.x); playSound('snort', 0.5, -8); }
      break;
    case 'tell':
      e.vel.x = 0;
      if (e.aiTimer > 24) set(e, 'lunge');
      break;
    case 'lunge':
      e.vel.x = safeAhead(ctx, e, e.facing!, 16) ? e.facing! * 7.5 : 0;
      if (Math.abs(dx) < 46 && Math.abs(p.y - m.y) < 40 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.isCharging) { hurtPlayer(ctx, 14, GATOR, { x: e.facing! * 5, y: -4 }, 18); }
      if (e.aiTimer > 26) set(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 50) { e.homeX = e.pos.x; set(e, 'idle'); }
      break;
  }
  return false;
};

/** The pelican: hangs up there, screeches (the tell), dives on a line, climbs back. */
const pelican = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default: {
      const awake = sees(state, e, 520, 520);
      const tx = awake ? Math.max(hx - 260, Math.min(hx + 260, p.x - e.width / 2 + (m.x < p.x ? -160 : 160))) : hx;
      e.vel.x = Math.max(-2.5, Math.min(2.5, (tx - e.pos.x) * 0.03));
      e.vel.y = Math.max(-2.5, Math.min(2.5, (hy + Math.sin((state.frame + seedOf(e)) * 0.05) * 14 - e.pos.y) * 0.04));
      e.facing = dirTo(e, p.x);
      if (awake && e.aiTimer > 110 && !holdingOff(state)) { set(e, 'tell'); playSound('beep', 0.4, 12); }
      break;
    }
    case 'tell':
      e.vel.x *= 0.8; e.vel.y *= 0.8;
      if (e.aiTimer > 30) { const d = Math.hypot(p.x - m.x, p.y - m.y) || 1; e.aiX = ((p.x - m.x) / d) * 7.5; e.aiY = ((p.y - m.y) / d) * 7.5; set(e, 'dive'); playSound('whoosh', 0.5, 6); }
      break;
    case 'dive':
      e.vel.x = e.aiX ?? 0; e.vel.y = e.aiY ?? 4;
      if (Math.abs(p.x - m.x) < 34 && Math.abs(p.y - m.y) < 34 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, 12, PELICAN, { x: Math.sign(e.vel.x || 1) * 4, y: -4 }, 16); set(e, 'climb'); }
      // (pulls out before the ground)
      if (e.aiTimer > 70 || e.pos.y + e.height > (state.player.pos.y + state.player.height) + 10) set(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-4, (hy - e.pos.y) * 0.05);
      if (e.aiTimer > 70) set(e, 'idle');
      break;
  }
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  return true;
};

/** The trooper: keeps his distance, the coil glows (the tell), three bolts. */
const trooper = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 260)) { set(e, 'walk'); e.shootTimer = 30 + (seedOf(e) % 40); }
      break;
    case 'walk': {
      e.facing = dirTo(e, p.x);
      const want = Math.abs(dx) > 340 ? e.facing : Math.abs(dx) < 160 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.3 : 0;
      e.shootTimer++;
      if (e.shootTimer > 80 && Math.abs(dx) < 560 && !holdingOff(state)) set(e, 'aim');
      break;
    }
    case 'aim':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26 && (e.aiTimer - 26) % 9 === 0 && e.aiTimer <= 44) fireBolt(state, m.x + e.facing * 34, e.pos.y + 16, p.x, p.y - 6, 6.5, 'm2:wp_bolt', 10);
      if (e.aiTimer > 60) { e.shootTimer = Math.floor(Math.random() * 30); set(e, 'walk'); }
      break;
  }
  return false;
};

/** The hover alien: up above and off to one side; bolts down at him (the coil's glow first). Riding along on a tube. */
const hover = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  // (dropped down onto a tube's chute ahead of him to fire back along it: tube.ts has it there)
  if (e.aiState === 'skim') { e.facing = dirTo(e, p.x); return true; }
  const ride = riding(state);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const awake = ride || sees(state, e, 640, 600);
  const side = (seedOf(e) % 2 ? 1 : -1) * (ride ? 1 : m.x < p.x ? -1 : 1);
  const queued = ride && QUEUED.has(e);
  // (on a tube: ahead of him and up (behind him, up high and waiting, in the queue); on foot: its own patch of sky)
  const tx = ride ? p.x + (queued ? -150 - (seedOf(e) % 3) * 40 : 180 + (seedOf(e) % 3) * 50) - e.width / 2 : awake ? Math.max(hx - 280, Math.min(hx + 280, p.x + side * 220 - e.width / 2)) : hx;
  const ty = (ride ? p.y - (queued ? 230 : 170 + (seedOf(e) % 2) * 50) : Math.min(hy, awake ? p.y - 200 : hy)) + Math.sin((state.frame + seedOf(e)) * 0.06) * 10;
  const k = ride ? 0.12 : 0.03;
  e.vel.x = Math.max(-14, Math.min(14, (tx - e.pos.x) * k + (ride ? pl.vel.x : 0)));
  e.vel.y = Math.max(-4, Math.min(4, (ty - e.pos.y) * 0.05));
  e.facing = dirTo(e, p.x);
  switch (e.aiState) {
    default:
      if (awake && !queued && e.aiTimer > (ride ? 120 : 100) && !holdingOff(state)) set(e, 'aim');
      break;
    case 'aim':
      if (e.aiTimer === 28) fireBolt(state, m.x + e.facing! * 20, m.y + 4, p.x + (ride ? pl.vel.x * 14 : 0), p.y, ride ? 6 : 5.5, 'm2:wp_bolt', 10);
      if (e.aiTimer > 40) { set(e, 'idle'); e.aiTimer = -Math.floor(Math.random() * 40); }
      break;
  }
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  // (on a tube: never off the screen (enemies-always-visible): the ride doesn't end till it's dead)
  if (ride && e.health > 0) {
    const cam = state.camera;
    e.pos.x = Math.max(cam.x + 24, Math.min(cam.x + CANVAS_WIDTH - 24 - e.width, e.pos.x));
    // (and clear of the HUD up in the top left)
    e.pos.y = Math.max(cam.y + (e.pos.x < cam.x + HUD_CLEAR_X ? HUD_CLEAR_Y + 8 : 48), Math.min(cam.y + CANVAS_HEIGHT - 60 - e.height, e.pos.y));
  }
  return true;
};

/** The yeti: slow; arms up and a roar (the tell); the fists down: a shockwave both ways along the floor; up close, a punch. */
const yeti = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 640, 200)) set(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 80 && safeAhead(ctx, e, e.facing) ? e.facing * 1.0 : 0;
      if (e.aiTimer > 60 && !holdingOff(state)) set(e, Math.abs(dx) < 110 ? 'wind' : 'tell');
      break;
    case 'tell':
      e.vel.x = 0;
      if (e.aiTimer === 2) { playSound('snort', 0.8, -12); playSound('roar', 0.5, -6); }
      if (e.aiTimer > 40) {
        set(e, 'pound');
        const fy = e.pos.y + e.height;
        for (const d of [-1, 1]) fire(state, { x: m.x + d * 40, y: fy, vx: d * 6.5, vy: 0, kind: 'wave', src: YETI, dmg: 16, floor: fy });
        playSound('slam', 0.9, -10); playSound('thud', 1, -12); shakeScreen(state, 12, 6);
      }
      break;
    case 'pound':
      if (e.aiTimer > 50) set(e, 'walk');
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 18) {
        playSound('whoosh', 0.7, -6);
        if (Math.abs(dx) < 120 && Math.abs(p.y - m.y) < 90 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, 22, YETI, { x: e.facing * 9, y: -7 }, 22); shakeScreen(state, 9, 4); }
      }
      if (e.aiTimer > 46) set(e, 'walk');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The poses off their AI

const guestPose = (e: Enemy, pos: Possession): GuestPose => {
  const s = e.aiState;
  if ((e.hitFlash ?? 0) > 0) return 'hurt';
  if (pos === 'demon') return s === 'tell' ? 'tell' : s === 'sprint' ? 'run' : s === 'punch' ? 'punch' : Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand';
  return s === 'crouch' || s === 'land' ? 'crouch' : s === 'leap' ? 'leap' : Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand';
};
const trooperPose = (e: Enemy): AlienPose => ((e.hitFlash ?? 0) > 0 ? 'hurt' : e.aiState === 'aim' ? (e.aiTimer! < 26 ? 'tell' : 'aim') : Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand');
const gender = (e: Enemy) => (guestOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
registerM2Kind({ kind: DGUEST, stats: { w: 36, h: 70, hp: 220, contact: 12, mass: 190 }, ai: dguest, humanoid: true, gender, head: { x: 3, y: -64, r: 10 }, draw: (c, e, f) => drawGuest(c, guestOf(seedOf(e)), 'demon', guestPose(e, 'demon'), f) });
registerM2Kind({ kind: AGUEST, stats: { w: 36, h: 70, hp: 200, contact: 12, mass: 190 }, ai: aguest, humanoid: true, gender, pathing: false, head: { x: 3, y: -64, r: 10 }, draw: (c, e, f) => drawGuest(c, guestOf(seedOf(e)), 'alien', guestPose(e, 'alien'), f) });
registerM2Kind({
  kind: GATOR, stats: { w: 80, h: 26, hp: 40, contact: 10, mass: 120 }, ai: gator, gender: 'n', grab: 'critter', head: { x: 52, y: -14, r: 8 },
  pointy: { source: 'm2:wp_gator', label: 'CHOMP!', damage: 16 },
  draw: (c, e, f) => drawGator(c, (e.hitFlash ?? 0) > 0 ? 'hurt' : e.aiState === 'tell' ? 'tell' : e.aiState === 'lunge' ? 'lunge' : 'walk', f),
});
registerM2Kind({ kind: PELICAN, stats: { w: 44, h: 30, hp: 40, contact: 8, mass: 20, air: true }, ai: pelican, make: flyer, gender: 'n', grab: 'critter', blood: '#3FA34D', head: { x: 18, y: -18, r: 6 }, draw: (c, e, f) => drawPelican(c, e.aiState === 'tell' ? 'tell' : e.aiState === 'dive' ? 'dive' : 'fly', f) });
registerM2Kind({ kind: TROOPER, stats: { w: 40, h: 88, hp: 170, contact: 10, mass: 220 }, ai: trooper, humanoid: true, gender: e => (seedOf(e) % 3 === 0 ? 'f' : 'm'), blood: '#3FA34D', head: { x: 4, y: -82, r: 11 }, draw: (c, e, f) => drawAlien(c, { seed: seedOf(e), gun: true, woman: seedOf(e) % 3 === 0 }, trooperPose(e), f) });
registerM2Kind({ kind: HOVER, stats: { w: 40, h: 70, hp: 120, contact: 10, mass: 160, air: true }, ai: hover, make: flyer, humanoid: true, gender: 'm', blood: '#3FA34D', head: { x: 3, y: -62, r: 9 }, draw: (c, e, f) => drawHover(c, { seed: seedOf(e), gun: true }, e.aiState === 'aim' ? (e.aiTimer! < 28 ? 'tell' : 'aim') : 'stand', f) });
registerM2Kind({
  kind: YETI, stats: { w: 70, h: 150, hp: 560, contact: 16, mass: 500 }, ai: yeti, humanoid: true, gender: 'm', grab: 'none', head: { x: 4, y: -116, r: 22 },
  draw: (c, e, f) => drawYeti(c, (e.hitFlash ?? 0) > 0 ? 'hurt' : e.aiState === 'tell' ? 'tell' : e.aiState === 'pound' ? 'pound' : e.aiState === 'wind' ? (e.aiTimer! > 14 ? 'punch' : 'tell') : Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand', f),
});
