// Her offspring (the impregnator ray: a robot giving birth; don't ask). Out of her rear in a sac, splat, and out of
// that: cheap little chrome robots with the long eyeless heads of her knockoff kind. Three kinds, all machines (scrap
// and oil, not blood):
//   BITER    small, a chrome bug with a big head: rushes him and nips his ankles (small: a slide finishes it).
//   SPITTER  medium, upright, a tailpipe for a mouth: keeps its distance and spits a gob of hot motor oil at him in an
//            arc (the tell: its head back, the pipe glowing).
//   CHARGER  large, hunched, a battering-ram crest: paws (the tell: steam, a scrape), then bull-rushes the floor.
// Thrown into her (grabbed and pitched, or batted back with the mallet), one's destroyed, and she's hurt (fight.ts).

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { markMachineGore } from '../../../m1/game/enemies/machineGore';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { box } from '../section';
import { GY } from '../geometry';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;

export const BITER = 'm2:sp_kin_biter', SPITTER = 'm2:sp_kin_spitter', CHARGER = 'm2:sp_kin_charger';
export const KIN = new Set<string>([BITER, SPITTER, CHARGER]);
const SPIT = 'm2:sp_kin_spit';
registerHurtLines(BITER, L.HURT_BITER, L.DEATH_BITER);
registerHurtLines(SPITTER, L.HURT_SPITTER, L.DEATH_SPITTER);
registerHurtLines(CHARGER, L.HURT_CHARGER, L.DEATH_CHARGER);
registerHurtLines(SPIT, L.HURT_SPIT, L.DEATH_SPIT);

const born = new WeakMap<Enemy, number>();
/** How long since it came out of her (frames). */
export const kinAge = (state: GameState, e: Enemy) => state.frame - (born.get(e) ?? -9999);
export const isKin = (e: Enemy) => !!e.kind && KIN.has(e.kind);

/** One out into the world (out of its sac, at x on the floor, facing `dir`). */
export const spawnKin = (state: GameState, kind: string, x: number, dir: 1 | -1) => {
  const e = makeKindEnemy(kind as EnemyKind, x, GY);
  e.facing = dir; e.seen = true; e.aiState = 'go'; e.aiTimer = 0;
  // (beating one up gives him nothing back: the user's)
  e.noHeal = true;
  born.set(e, state.frame);
  state.enemies.push(e);
  return e;
};

/** One smashed to scrap (thrown into her, or the lot of them at once when her own's batted back into her). */
export const destroyKin = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  state.enemies = state.enemies.filter(o => o !== e);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  markMachineGore(state, e.pos.x, e.pos.y, e.width, e.height, 8);
  fx.spawnExplosion({ x: cx, y: cy }, '#8B0000', 10, 0, 8);
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 60, color: ['#D4D4D8', '#71717A', '#0A0A0A', '#FDE047'][i % 4], size: 2 + Math.random() * 4, grav: 0.35, chunk: i % 2 === 0 });
  playSound('crash', 0.6, 6); playSound('clang', 0.6, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The spitters' oil: lobbed, hot, splashing where it lands

interface Gob { x: number; y: number; vx: number; vy: number }
let gobs: Gob[] = [];
export const resetKin = () => { gobs = []; };
export const tickKin = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  gobs = gobs.filter(g => {
    g.x += g.vx; g.y += g.vy; g.vy += 0.35;
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && g.x > p.pos.x - 5 && g.x < p.pos.x + p.width + 5 && g.y > p.pos.y && g.y < p.pos.y + p.height) {
      hurtPlayer(ctx, 10, SPIT, { x: Math.sign(g.vx) * 3, y: -3 }, 10); playSound('splat', 0.6, 4); return false;
    }
    if (g.y >= GY - 2) { for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: g.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 16, color: i % 2 ? '#0A0A0A' : '#3F2E12', size: 2 + Math.random() * 2, grav: 0.3 }); return false; }
    return true;
  });
};
export const drawKinShots = (c: Ctx) => { for (const g of gobs) { box(c, g.x - 5, g.y - 5, 10, 10, '#0A0A0A'); box(c, g.x - 3, g.y - 4, 4, 3, '#A16207'); } };

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const faceHim = (state: GameState, e: Enemy) => { e.facing = mid(state.player).x < mid(e).x ? -1 : 1; };
const grounded = (e: Enemy) => Math.abs(e.vel.y) < 0.01;

const biterAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  faceHim(state, e);
  const dx = mid(state.player).x - mid(e).x;
  e.vel.x = Math.abs(dx) > 10 ? (e.facing ?? 1) * 3.2 : 0;
  if (grounded(e) && Math.abs(dx) < 90 && e.aiTimer % 30 === 0) { e.vel.y = -5; playSound('chitter', 0.4, 6); }
  return false;
};
const spitterAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  faceHim(state, e);
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  if (e.aiState === 'tell') {
    e.vel.x = 0;
    if (e.aiTimer === 24) {
      const T = 40, sx = m.x + (e.facing ?? 1) * 12, sy = e.pos.y + 10;
      gobs.push({ x: sx, y: sy, vx: Math.max(-8, Math.min(8, (p.x - sx) / T)), vy: (p.y - sy) / T - 0.5 * 0.35 * T });
      playSound('gush', 0.5, 6);
    }
    if (e.aiTimer > 40) { e.aiState = 'go'; e.aiTimer = 0; }
    return false;
  }
  e.vel.x = adx < 200 ? -(e.facing ?? 1) * 1.4 : adx > 380 ? (e.facing ?? 1) * 1.4 : 0;
  if (e.aiTimer > 100) { e.aiState = 'tell'; e.aiTimer = 0; playSound('click', 0.5, 6); }
  return false;
};
const chargerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  switch (e.aiState) {
    default:
      faceHim(state, e); e.vel.x = (e.facing ?? 1) * 0.8;
      if (e.aiTimer > 50) { e.aiState = 'paw'; e.aiTimer = 0; playSound('snort', 0.7, -6); }
      break;
    case 'paw':
      e.vel.x = 0; faceHim(state, e);
      if (e.aiTimer % 8 === 0) state.particles.push({ pos: { x: mid(e).x, y: e.pos.y + 6 }, vel: { x: -(e.facing ?? 1) * 1.5, y: -1.5 }, life: 24, color: 'rgba(226, 232, 240, 0.6)', size: 6, grav: -0.03 });
      if (e.aiTimer > 36) { e.aiState = 'rush'; e.aiTimer = 0; playSound('engine', 0.7, 4); }
      break;
    case 'rush':
      e.vel.x = (e.facing ?? 1) * 7.5;
      if (e.aiTimer % 8 === 0) shakeScreen(state, 2, 2);
      if (e.aiTimer > 70 || Math.abs(e.vel.x) < 0.5 && e.aiTimer > 5) { e.aiState = 'skid'; e.aiTimer = 0; }
      break;
    case 'skid':
      e.vel.x *= 0.85;
      if (e.aiTimer > 40) { e.aiState = 'go'; e.aiTimer = 0; }
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The look (chrome bodies, her black latex heads, the green of the ray in their eye slits)

const CHROME = '#C0C4CC', CHROME_D = '#7A7F8A', LATEX = '#1F2028', LATEX_L = '#6B7280';
const head = (c: Ctx, x: number, y: number, s: number, open: boolean) => {
  // (the long eyeless dome swept back, the silver teeth, the green slit)
  ink(c, () => { c.moveTo(x - 4 * s, y); c.quadraticCurveTo(x - 30 * s, y - 10 * s, x - 34 * s, y - 2 * s); c.quadraticCurveTo(x - 20 * s, y + 8 * s, x + 14 * s, y + 6 * s); c.quadraticCurveTo(x + 18 * s, y - 2 * s, x - 4 * s, y); c.closePath(); }, LATEX, 1.2);
  c.strokeStyle = LATEX_L; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 26 * s, y - 4 * s); c.quadraticCurveTo(x - 10 * s, y - 6 * s, x + 8 * s, y + 1 * s); c.stroke();
  box(c, x - 2 * s, y + 5 * s, 14 * s, 2 * s, '#E5E7EB');
  if (open) box(c, x, y + 7 * s, 12 * s, 3 * s, '#1C0610');
  box(c, x - 10 * s, y + 1 * s, 6 * s, 2 * s, '#84FF50');
};

const drawBiter = (c: Ctx, e: Enemy, f: number) => {
  const step = Math.sin(f * 0.6) * 4;
  for (let i = 0; i < 3; i++) limb(c, -10 + i * 9, -10, -12 + i * 9 + (i % 2 ? step : -step), 0, 3, CHROME_D);
  ink(c, () => c.ellipse(0, -12, 14, 8, 0, 0, Math.PI * 2), CHROME, 1.2);
  box(c, -8, -15, 10, 2, '#FFFFFF');
  head(c, 10, -20, 0.6, f % 20 < 10);
};
const drawSpitter = (c: Ctx, e: Enemy, f: number) => {
  const tell = e.aiState === 'tell';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.4) * 6 : 0;
  limb(c, -6, -26, -8 + step, 0, 5, CHROME_D); limb(c, 6, -26, 8 - step, 0, 5, CHROME);
  ink(c, () => c.roundRect(-14, -50, 28, 28, 6), CHROME, 1.2);
  box(c, -10, -46, 6, 18, '#FFFFFF');
  limb(c, 12, -42, 22, -30, 4, CHROME_D);
  c.save(); c.translate(4, -52); c.rotate(tell ? -0.5 : 0);
  head(c, 0, 0, 0.8, tell);
  // (the tailpipe mouth, glowing on the tell)
  ink(c, () => c.roundRect(10, 2, 10, 6, 2), '#52525B');
  if (tell) box(c, 18, 3, 3, 4, f % 4 < 2 ? '#F97316' : '#FDE047');
  c.restore();
};
const drawCharger = (c: Ctx, e: Enemy, f: number) => {
  const rush = e.aiState === 'rush';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * (rush ? 0.8 : 0.3)) * 8 : 0;
  for (const s of [-1, 1]) { limb(c, s * 18, -24, s * 20 + step * s, 0, 9, s < 0 ? CHROME_D : CHROME); }
  ink(c, () => c.ellipse(-4, -36, 34, 22, 0, 0, Math.PI * 2), CHROME, 1.5);
  box(c, -26, -48, 20, 4, '#FFFFFF');
  for (let i = 0; i < 4; i++) box(c, -24 + i * 12, -22, 6, 4, '#3F3F46');
  // (the battering-ram crest, out front, low)
  ink(c, () => { c.moveTo(18, -52); c.quadraticCurveTo(48, -40, 44, -20); c.lineTo(20, -24); c.closePath(); }, LATEX, 1.5);
  head(c, 24, -40, 0.9, rush);
  if (e.aiState === 'paw' && f % 6 < 3) box(c, 30, -62, 6, 6, 'rgba(226, 232, 240, 0.7)');
};

registerM2Kind({ kind: BITER, stats: { w: 30, h: 26, hp: 30, contact: 7, mass: 40 }, ai: biterAI, draw: drawBiter, robot: true, grab: 'critter', gender: 'm', head: { x: 10, y: -20, r: 7 } });
registerM2Kind({ kind: SPITTER, stats: { w: 38, h: 58, hp: 80, contact: 6, mass: 140 }, ai: spitterAI, draw: drawSpitter, robot: true, grab: 'body', gender: 'm', head: { x: 4, y: -52, r: 9 } });
registerM2Kind({ kind: CHARGER, stats: { w: 66, h: 64, hp: 170, contact: 16, mass: 420 }, ai: chargerAI, draw: drawCharger, robot: true, grab: 'none', gender: 'm', head: { x: 24, y: -40, r: 11 } });

/** A sac on its way out of her / lying there hatching. World. */
export const drawSac = (c: Ctx, x: number, y: number, t: number, hatch: number) => {
  const k = 1 + Math.sin(t * 0.5) * 0.06;
  ink(c, () => c.ellipse(x, y - 14, 20 * k, 15 / k, 0, 0, Math.PI * 2), '#C9C2A8', 1.5);
  c.fillStyle = 'rgba(87, 83, 78, 0.5)'; c.beginPath(); c.ellipse(x + 3, y - 14, 10, 8, 0, 0, Math.PI * 2); c.fill();
  box(c, x - 10, y - 26, 6, 3, '#F5F5F4');
  if (hatch > 0) { box(c, x - 3, y - 30, 6, 30 * hatch, '#1C0610'); box(c, x - 14, y - 2, 28, 3, '#84CC16'); }
};
