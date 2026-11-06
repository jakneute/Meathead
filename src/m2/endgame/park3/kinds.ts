// THE MAINTENANCE TUNNELS' own cast (new kinds, registered as this is loaded), on top of Zorblax's troopers and hover
// aliens still about (park1/kinds.ts). The aliens' turn: the staff are possessed by them. Harder (the endgame's step
// up); every one has a tell before it hurts him, readable up close (it's narrow in here).
//
//   wp3_janitor  possessed: shuffles about. Up close: the mop up over his head (the tell), then slammed down in front.
//                Further off: the bucket swung back (the tell), then the mop water flung in an arc at him. Grab-resistant
//                like the water park's possessed guests (park1).
//   wp3_tech     possessed: up close, the cattle prod held out crackling (the tell), then jabbed. Further off: a fuse
//                held up sparking (the tell), then thrown on a line at him (it pops in sparks). Grab-resistant.
//   wp3_grub     an alien larva on the ceiling: he's under it, it wriggles and drips (the tell), then drops on him; a
//                miss, it crawls after him along the floor (low: shots go over it; a slide does it). Small: one slide.
//   wp3_eel      a space eel in the flooded pipes: it swims its stretch; sees him, it coils up, its lure blazing (the
//                tell), then lunges straight at where he was, and swims back. Grabbing a live one bites.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { helmetStopsAt } from '../../upgrades/gear';
import { registerM2Kind } from '../../kinds';
import { speak, type Said } from '../../adventure/section';
import { byPants, KIND_OF, updateShots, drawShots, drawBarks, clearShots } from '../park1/kinds';
import { heard } from '../../bossQuiet';
import { drawStaff, staffLook, drawGrub, drawEel, type StaffPose, type StaffKind, type GrubPose, type EelPose } from './kindArt';
import { cellAt, isRock, isWater, Y0, CELL, type Who3 } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
export const JANITOR = 'm2:wp3_janitor', TECH = 'm2:wp3_tech', GRUB = 'm2:wp3_grub', EEL = 'm2:wp3_eel';
const KIND3_OF: Record<Who3, string> = { janitor: JANITOR, tech: TECH, grub: GRUB, eel: EEL, trooper: KIND_OF.trooper, hover: KIND_OF.hover };

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const set = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};

// ---------------------------------------------------------------------------------------------------------------
// What's thrown: the mop water (lobbed: a splash where it lands), the fuses (on a line: a pop of sparks)

interface Shot3 { x: number; y: number; vx: number; vy: number; kind: 'water' | 'fuse'; t: number; src: string; dmg: number }
const SHOTS = new WeakMap<GameState, Shot3[]>();
const shotsOf = (state: GameState) => { let s = SHOTS.get(state); if (!s) { s = []; SHOTS.set(state, s); } return s; };
export const clearShots3 = (state: GameState) => { shotsOf(state).length = 0; clearShots(state); };
const pop = (state: GameState, s: Shot3) => {
  const cols = s.kind === 'water' ? ['#8A9A7A', '#B8C8A8', '#5A6A4A'] : ['#FDE047', '#FFFFFF', '#93C5FD'];
  for (let i = 0; i < 9; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 18, color: cols[i % 3], size: 2 + Math.random() * 3 });
};
/** A frame of the throws (and park1's: the troopers' and hover aliens' bolts). */
export const updateShots3 = (ctx: FrameContext) => {
  updateShots(ctx);
  const { state } = ctx, p = state.player, list = shotsOf(state);
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i];
    s.t++;
    if (s.kind === 'water') s.vy += 0.34; else s.vy += 0.06;
    s.x += s.vx; s.y += s.vy;
    const r = s.kind === 'water' ? 10 : 6;
    if (p.health > 0 && !p.inCutscene && s.x + r > p.pos.x + 4 && s.x - r < p.pos.x + p.width - 4 && s.y + r > p.pos.y + (p.isDucking ? 24 : 0) && s.y - r < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !helmetStopsAt(state, s.x, s.y, 6)) { hurtPlayer(ctx, s.dmg, s.src, { x: Math.sign(s.vx || 1) * 4, y: -4 }, 16); shakeScreen(state, 5, 3); }
      pop(state, s); list.splice(i, 1); continue;
    }
    if (isRock(cellAt(s.x, s.y)) || isWater(cellAt(s.x, s.y)) || s.t > 200) { pop(state, s); if (heard(state, s.x)) playSound(s.kind === 'water' ? 'splat' : 'taser', 0.35, 6); list.splice(i, 1); }
  }
};
export const drawShots3 = (c: Ctx, state: GameState) => {
  drawShots(c, state);
  const f = state.frame;
  for (const s of shotsOf(state)) {
    if (s.kind === 'water') {
      // (a slop of gray mop water, stringy)
      c.fillStyle = '#08090A'; c.beginPath(); c.ellipse(s.x, s.y, 11, 8, Math.atan2(s.vy, s.vx), 0, Math.PI * 2); c.fill();
      c.fillStyle = '#7A8A6A'; c.beginPath(); c.ellipse(s.x, s.y, 9, 6, Math.atan2(s.vy, s.vx), 0, Math.PI * 2); c.fill();
      c.fillStyle = '#B8C8A8'; c.fillRect(s.x - 3, s.y - 3, 3, 2);
      for (let k = 0; k < 3; k++) c.fillRect(s.x - s.vx * (k + 1) * 1.5, s.y - s.vy * (k + 1) * 1.5, 3, 3);
    } else {
      // (a fuse, turning, fizzing)
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.4);
      c.fillStyle = '#08090A'; c.fillRect(-7, -3, 14, 6); c.fillStyle = '#E5E7EB'; c.fillRect(-6, -2, 12, 4); c.fillStyle = '#B45309'; c.fillRect(-6, -2, 3, 4); c.fillRect(3, -2, 3, 4);
      c.restore();
      c.fillStyle = f % 4 < 2 ? '#FDE047' : '#FFFFFF'; c.fillRect(s.x - 1 + (f % 3) * 2, s.y - 6, 2, 2);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Barks (the staff, now and then, in the aliens' voices; never over anybody)

const BARKS = new WeakMap<GameState, { at: number; on: Map<Enemy, Said> }>();
const barksOf = (state: GameState) => { let b = BARKS.get(state); if (!b) { b = { at: -999, on: new Map() }; BARKS.set(state, b); } return b; };
const bark = (state: GameState, e: Enemy) => {
  const b = barksOf(state);
  if (state.frame - b.at < 480 || Math.random() > 0.45) return;
  b.at = state.frame;
  const v = staffLook(seedOf(e)).woman ? L.STAFF_VOICE.f : L.STAFF_VOICE.m;
  speak(v, pickLine(byPants(state, L.STAFF_BARK)), s => { if (s) b.on.set(e, s); else b.on.delete(e); }, false);
};
export const drawBarks3 = (c: Ctx, state: GameState, saidOver: (c: Ctx, s: string, x: number, y: number, col?: string, wide?: number) => void) => {
  drawBarks(c, state, saidOver);
  for (const [e, s] of barksOf(state).on) if (e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 22, '#BEF264', 220);
};

// ---------------------------------------------------------------------------------------------------------------
// The staff: the janitor and the technician (one AI, their own moves)

const ST = {
  janitor: { see: 460, near: 92, raise: 30, reach: 84, dmg: 16, wind: 32, throwDmg: 11, rest: 40 },
  tech: { see: 500, near: 100, raise: 30, reach: 76, dmg: 15, wind: 34, throwDmg: 12, rest: 36 },
};
const staff = (kind: StaffKind) => (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, N = ST[kind];
  tick(e);
  switch (e.aiState) {
    default: {
      // (shuffling about his spot: he doesn't care)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 40 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.5;
      if (e.aiTimer > 30 && sees(state, e, N.see, 140)) { set(e, 'watch'); bark(state, e); }
      break;
    }
    case 'watch':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 220 && safeAhead(ctx, e, e.facing) ? e.facing * 1.1 : 0;
      if (e.aiTimer > 36 && !holdingOff(state)) set(e, Math.abs(dx) < N.near && Math.abs(p.y - m.y) < 70 ? 'raise' : Math.abs(dx) < N.see ? 'wind' : 'watch');
      break;
    case 'raise':
      // (the tell: the mop up over his head / the prod held out crackling)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 1 && heard(state, m.x)) playSound(kind === 'tech' ? 'taser' : 'whoosh', 0.35, kind === 'tech' ? 8 : -6);
      if (e.aiTimer > N.raise) { set(e, 'strike'); e.vel.x = e.facing * 1.5; }
      break;
    case 'strike':
      e.vel.x *= 0.8;
      if (e.aiTimer === 4) {
        playSound(kind === 'tech' ? 'taser' : 'splat', 0.5, kind === 'tech' ? 0 : -4);
        const x0 = e.facing! > 0 ? m.x : m.x - N.reach;
        if (pl.health > 0 && pl.invincibilityTimer <= 0 && pl.pos.x + pl.width > x0 && pl.pos.x < x0 + N.reach && Math.abs(p.y - m.y) < 64) { hurtPlayer(ctx, N.dmg, kind === 'tech' ? 'm2:wp3_tech' : 'm2:wp3_janitor', { x: e.facing! * 7, y: -5 }, 20); shakeScreen(state, 6, 3); }
      }
      if (e.aiTimer > 18) set(e, 'rest');
      break;
    case 'wind':
      // (the tell: the bucket swung back / the fuse held up, sparking)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > N.wind) {
        const sx = m.x + e.facing * 18, sy = e.pos.y + 26;
        if (kind === 'janitor') {
          // (lobbed: to land where he's going)
          const T = 34, tx = p.x + pl.vel.x * 10, ty = pl.pos.y + pl.height - 12;
          shotsOf(state).push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 0.34 * T * T) / T, kind: 'water', t: 0, src: 'm2:wp3_bucket', dmg: N.throwDmg });
          if (heard(state, m.x)) playSound('whoosh', 0.45, -2);
        } else {
          const d = Math.hypot(p.x - sx, p.y - sy) || 1;
          shotsOf(state).push({ x: sx, y: sy, vx: ((p.x - sx) / d) * 6.2, vy: ((p.y - sy) / d) * 6.2 - 1.2, kind: 'fuse', t: 0, src: 'm2:wp3_fuse', dmg: N.throwDmg });
          if (heard(state, m.x)) playSound('whoosh', 0.45, 6);
        }
        set(e, 'throw');
      }
      break;
    case 'throw':
      e.vel.x = 0;
      if (e.aiTimer > 22) set(e, 'rest');
      break;
    case 'rest':
      e.vel.x *= 0.8;
      if (e.aiTimer > N.rest) set(e, sees(state, e, N.see, 140) ? 'watch' : 'idle');
      break;
  }
  return false;
};
const staffPose = (e: Enemy): StaffPose => {
  if ((e.hitFlash ?? 0) > 0) return 'hurt';
  switch (e.aiState) { case 'raise': return 'raise'; case 'strike': return 'strike'; case 'wind': return 'wind'; case 'throw': return 'throw'; default: return Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand'; }
};

// ---------------------------------------------------------------------------------------------------------------
// The grub

const GB = { reach: 46, tell: 36, g: 0.5, dmg: 12, bite: 10, crawl: 0.9 };
const grub = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  switch (e.aiState) {
    default:
      // (on the ceiling: held there; him under it (and below it, not far off to the side), the tell)
      e.vel.x = 0; e.vel.y = 0;
      if (e.aiTimer > 20 && pl.health > 0 && !pl.inCutscene && Math.abs(p.x - m.x) < GB.reach + 30 && p.y > m.y && p.y - m.y < 620) { set(e, 'quiver'); if (heard(state, m.x)) playSound('squish', 0.4, 6); }
      return true;
    case 'quiver':
      e.vel.x = 0; e.vel.y = 0;
      if (e.aiTimer > GB.tell) { set(e, 'drop'); playSound('squish', 0.5, -4); }
      return true;
    case 'drop': {
      // (straight down; on him: a bite; down on the floor: off after him)
      e.vel.y = Math.min(9, (e.vel.y || 0) + GB.g);
      e.pos.y += e.vel.y;
      if (pl.health > 0 && pl.invincibilityTimer <= 0 && Math.abs(p.x - m.x) < 26 && e.pos.y + e.height > pl.pos.y && e.pos.y < pl.pos.y + pl.height) { hurtPlayer(ctx, GB.dmg, 'm2:wp3_grub', { x: Math.sign(p.x - m.x || 1) * 3, y: -3 }, 16); set(e, 'crawl'); }
      if (isRock(cellAt(m.x, e.pos.y + e.height + 2))) { e.pos.y = Y0 + Math.floor((e.pos.y + e.height + 2 - Y0) / CELL) * CELL - e.height; set(e, 'crawl'); e.vel.y = 0; playSound('splat', 0.4, 6); }
      return true;
    }
    case 'crawl':
      e.facing = dirTo(e, p.x);
      e.vel.x = safeAhead(ctx, e, e.facing) ? e.facing * GB.crawl : 0;
      if (pl.health > 0 && pl.invincibilityTimer <= 0 && Math.abs(p.x - m.x) < 24 && Math.abs(pl.pos.y + pl.height - (e.pos.y + e.height)) < 20 && e.aiTimer % 30 === 10) hurtPlayer(ctx, GB.bite, 'm2:wp3_grub', { x: e.facing * 4, y: -3 }, 14);
      return false;
  }
};
const grubPose = (e: Enemy): GrubPose => (e.aiState === 'quiver' ? 'quiver' : e.aiState === 'drop' ? 'drop' : e.aiState === 'crawl' ? 'crawl' : 'cling');

// ---------------------------------------------------------------------------------------------------------------
// The eel

const EL = { see: 320, tell: 30, lunge: 7, dmg: 12, range: 110 };
const eel = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const wet = (x: number, y: number) => isWater(cellAt(x, y)) && isWater(cellAt(x + e.width, y)) && isWater(cellAt(x, y + e.height)) && isWater(cellAt(x + e.width, y + e.height));
  const go = (vx: number, vy: number) => { if (wet(e.pos.x + vx, e.pos.y)) e.pos.x += vx; if (wet(e.pos.x, e.pos.y + vy)) e.pos.y += vy; };
  switch (e.aiState) {
    default: {
      // (its stretch: back and forth about home, bobbing)
      e.facing ??= 1;
      if (Math.abs(e.pos.x - hx) > EL.range || !wet(e.pos.x + e.facing * 3, e.pos.y)) e.facing = (e.pos.x > hx ? -1 : 1) as 1 | -1;
      go(e.facing * 1.1, (hy + Math.sin((state.frame + seedOf(e)) * 0.05) * 14 - e.pos.y) * 0.05);
      if (e.aiTimer > 50 && pl.swimming && sees(state, e, EL.see, 220)) { set(e, 'coil'); if (heard(state, m.x)) playSound('chitter', 0.4, 6); }
      break;
    }
    case 'coil':
      e.facing = dirTo(e, p.x);
      if (e.aiTimer > EL.tell) { const d = Math.hypot(p.x - m.x, p.y - m.y) || 1; e.aiX = ((p.x - m.x) / d) * EL.lunge; e.aiY = ((p.y - m.y) / d) * EL.lunge; set(e, 'lunge'); playSound('whoosh', 0.5, 6); }
      break;
    case 'lunge':
      go(e.aiX ?? 0, e.aiY ?? 0);
      if (pl.health > 0 && pl.invincibilityTimer <= 0 && Math.abs(p.x - m.x) < 30 && Math.abs(p.y - m.y) < 34) { hurtPlayer(ctx, EL.dmg, 'm2:wp3_eel', { x: Math.sign(e.aiX || 1) * 4, y: -2 }, 16); set(e, 'back'); }
      if (e.aiTimer > 26) set(e, 'back');
      break;
    case 'back':
      go(Math.max(-2, Math.min(2, (hx - e.pos.x) * 0.04)), Math.max(-2, Math.min(2, (hy - e.pos.y) * 0.04)));
      if (e.aiTimer > 80) set(e, 'idle');
      break;
  }
  e.vel.x = 0; e.vel.y = 0;
  return true;
};
const eelPose = (e: Enemy): EelPose => (e.aiState === 'coil' ? 'coil' : e.aiState === 'lunge' ? 'lunge' : 'swim');

// ---------------------------------------------------------------------------------------------------------------

/** The possessed staff: grab-resistant as the water park's possessed guests are (park1: the owner's "they won't go as
 *  far or hurt as much"). */
const STAFF_GRAB_RESIST = 0.5;
const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
for (const kind of ['janitor', 'tech'] as StaffKind[]) registerM2Kind({
  kind: kind === 'janitor' ? JANITOR : TECH, stats: { w: 34, h: 74, hp: kind === 'janitor' ? 160 : 170, contact: 10, mass: 190 }, ai: staff(kind), humanoid: true,
  gender: e => (staffLook(seedOf(e)).woman ? 'f' : 'm'), grabResist: STAFF_GRAB_RESIST, blood: '#3FA34D', head: { x: 4, y: -70, r: 9 },
  draw: (c, e, f) => drawStaff(c, kind, seedOf(e), staffPose(e), f),
});
registerM2Kind({
  kind: GRUB, stats: { w: 36, h: 18, hp: 14, contact: 8, mass: 14 }, ai: grub, gender: 'n', grab: 'critter', blood: '#3FA34D', pathing: false,
  head: { x: 16, y: -9, r: 6 },
  draw: (c, e, f) => { const pose = grubPose(e); if (pose === 'cling' || pose === 'quiver') { c.save(); c.translate(0, -18); drawGrub(c, pose, f); c.restore(); } else drawGrub(c, pose, f); },
});
registerM2Kind({
  kind: EEL, stats: { w: 50, h: 22, hp: 40, contact: 8, mass: 20, air: true }, ai: eel, make: flyer, gender: 'n', grab: 'critter', blood: '#3FA34D',
  grabHurts: { dmg: 6 }, head: { x: 18, y: -11, r: 7 },
  draw: (c, e, f) => drawEel(c, eelPose(e), f),
});

/** One of the level's cast (any kind) at (x, y: feet; a grub's, the ceiling over it; an eel's or a hover's, its middle). */
export const makeCast3 = (who: Who3, x: number, y: number, i: number) => {
  const kind = KIND3_OF[who] as EnemyKind;
  const e = makeKindEnemy(kind, x, who === 'grub' ? y + 18 : who === 'eel' || who === 'hover' ? y + 11 : y);
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = (i * 7 + Math.floor(x / 10)) % 23;
  return e;
};
