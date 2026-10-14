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
import { exemptFromZones } from '../../hazardHit';
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
// (hers: her pool doesn't keep them out, they walk in and out of it as they like; see fight.ts)
for (const k of KIN) exemptFromZones(k, 'queen-pool');

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
  // (cheap: a throw does them in quicker than most)
  e.throwVuln = 1.6;
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
// The spitters' oil: lobbed, hot, acid, splashing where it lands (a big glossy gob, a sick green glow round it)

interface Gob { x: number; y: number; vx: number; vy: number; t: number }
let gobs: Gob[] = [];
export const resetKin = () => { gobs = []; };
export const tickKin = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  gobs = gobs.filter(g => {
    g.x += g.vx; g.y += g.vy; g.vy += 0.35; g.t++;
    if (g.t % 3 === 0) state.particles.push({ pos: { x: g.x, y: g.y }, vel: { x: -g.vx * 0.1, y: 0.5 }, life: 14, color: g.t % 2 ? '#1C1208' : '#84CC16', size: 2 + Math.random() * 2, grav: 0.15 });
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && g.x > p.pos.x - 6 && g.x < p.pos.x + p.width + 6 && g.y > p.pos.y && g.y < p.pos.y + p.height) {
      hurtPlayer(ctx, 10, SPIT, { x: Math.sign(g.vx) * 3, y: -3 }, 10); playSound('splat', 0.6, 4); playSound('rayFizzle', 0.4, 8); return false;
    }
    if (g.y >= GY - 2) {
      playSound('splat', 0.4, 6);
      for (let i = 0; i < 7; i++) state.particles.push({ pos: { x: g.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: ['#0A0604', '#3F2E12', '#A3E635'][i % 3], size: 2 + Math.random() * 3, grav: 0.3 });
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: g.x + (Math.random() - 0.5) * 14, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.8 - Math.random() * 0.6 }, life: 34, color: 'rgba(190, 242, 100, 0.35)', size: 6 + Math.random() * 5 });
      return false;
    }
    return true;
  });
};
export const drawKinShots = (c: Ctx, f: number) => {
  for (const g of gobs) {
    const x = Math.round(g.x), y = Math.round(g.y);
    // (the glow off it: acid green, pulsing)
    c.fillStyle = `rgba(163, 230, 53, ${f % 8 < 4 ? 0.35 : 0.22})`; c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.fill();
    // (the gob: black-brown, a lit rim, stretched along where it's going; the rainbow sheen, a hard white glint)
    c.save(); c.translate(x, y); c.rotate(Math.atan2(g.vy, g.vx));
    c.fillStyle = '#A3E635'; c.beginPath(); c.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0A0604'; c.beginPath(); c.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3F2A12'; c.beginPath(); c.ellipse(1, 1, 6, 4, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    box(c, x - 4, y - 5, 3, 2, '#C084FC'); box(c, x - 1, y - 5, 3, 2, '#22D3EE'); box(c, x - 4, y - 4, 2, 2, '#FFFFFF');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The AIs (all three come straight for him: the biters rush and nip, the spitters keep their distance and lob, the
// chargers paw and bull-rush across the floor)

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const faceHim = (state: GameState, e: Enemy) => { e.facing = mid(state.player).x < mid(e).x ? -1 : 1; };
const grounded = (e: Enemy) => Math.abs(e.vel.y) < 0.01;
/** Each one's own: a cool-down (frames), where it was last frame (a wall stops a charge), a bit of its own pace. */
const own = new WeakMap<Enemy, { cool: number; lastX: number; pace: number }>();
const mine = (e: Enemy) => { let o = own.get(e); if (!o) own.set(e, (o = { cool: 0, lastX: e.pos.x, pace: 0.85 + Math.random() * 0.3 })); return o; };

const biterAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, o = mine(e);
  e.aiTimer = (e.aiTimer || 0) + 1;
  if (o.cool > 0) o.cool--;
  const dx = mid(state.player).x - mid(e).x, adx = Math.abs(dx);
  switch (e.aiState) {
    case 'crouch':
      // (the tell: down low, jaws wide, a rattle)
      e.vel.x = 0;
      if (e.aiTimer >= 12) { e.aiState = 'lunge'; e.aiTimer = 0; e.vel.x = (e.facing ?? 1) * 7; e.vel.y = -5.5; playSound('gnaw', 0.6, 8); }
      break;
    case 'lunge':
      if (e.aiTimer > 4 && grounded(e)) { e.aiState = 'go'; e.aiTimer = 0; o.cool = 36; }
      break;
    default:
      // (a scuttling rush at his ankles, a hop now and then)
      faceHim(state, e);
      e.vel.x = adx > 8 ? (e.facing ?? 1) * 4 * o.pace : 0;
      if (grounded(e) && e.aiTimer % 22 === 0 && adx > 140) { e.vel.y = -3; playSound('chitter', 0.35, 8); }
      if (grounded(e) && adx < 130 && o.cool <= 0 && Math.abs(mid(state.player).y - mid(e).y) < 90) { e.aiState = 'crouch'; e.aiTimer = 0; playSound('chitter', 0.6, 10); }
  }
  return false;
};
const spitterAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, o = mine(e), pl = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  faceHim(state, e);
  const p = mid(pl), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  if (e.aiState === 'tell') {
    // (the tell: its head back, the pipe glowing, a gurgle and green smoke)
    e.vel.x = 0;
    if (e.aiTimer % 5 === 0) state.particles.push({ pos: { x: m.x + (e.facing ?? 1) * 22, y: e.pos.y - 4 }, vel: { x: (Math.random() - 0.5), y: -1.2 }, life: 20, color: 'rgba(190, 242, 100, 0.4)', size: 4 + Math.random() * 3 });
    if (e.aiTimer === 26) {
      // (lobbed at where he'll be, leading him a bit)
      const sx = m.x + (e.facing ?? 1) * 18, sy = e.pos.y + 4;
      const T = Math.max(26, Math.min(58, adx / 8));
      const tx = p.x + pl.vel.x * T * 0.5, ty = pl.pos.y + pl.height * 0.4;
      gobs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * 0.35 * T, t: 0 });
      playSound('gush', 0.6, 6); playSound('retch', 0.4, 10);
    }
    if (e.aiTimer > 40) { e.aiState = 'go'; e.aiTimer = 0; }
    return false;
  }
  // (keeps its distance: backs off when he's close, comes on when he's far, sidling in between)
  e.vel.x = adx < 190 ? -(e.facing ?? 1) * 2.4 * o.pace : adx > 330 ? (e.facing ?? 1) * 2.2 * o.pace : Math.sin(e.aiTimer * 0.1) * 0.8;
  if (e.aiTimer > 64 && adx < 620) { e.aiState = 'tell'; e.aiTimer = 0; playSound('glug', 0.6, 6); }
  return false;
};
const chargerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, o = mine(e);
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x, stuck = Math.abs(e.pos.x - o.lastX) < 0.5;
  o.lastX = e.pos.x;
  switch (e.aiState) {
    default:
      faceHim(state, e); e.vel.x = (e.facing ?? 1) * 1.8 * o.pace;
      if (e.aiTimer > 36 && Math.abs(dx) < 700) { e.aiState = 'paw'; e.aiTimer = 0; playSound('snort', 0.8, -6); }
      break;
    case 'paw':
      // (the tell: a hoof scraping the floor, sparks off it, steam out of it, the floor shaking with each scrape)
      e.vel.x = 0; faceHim(state, e);
      if (e.aiTimer % 8 === 0) {
        state.particles.push({ pos: { x: mid(e).x, y: e.pos.y + 6 }, vel: { x: -(e.facing ?? 1) * 1.5, y: -1.5 }, life: 24, color: 'rgba(226, 232, 240, 0.6)', size: 6, grav: -0.03 });
        state.particles.push({ pos: { x: mid(e).x - (e.facing ?? 1) * 20, y: GY - 3 }, vel: { x: -(e.facing ?? 1) * 3, y: -1.5 }, life: 14, color: '#FDE047', size: 2, grav: 0.2 });
        playSound('grind', 0.4, 4); shakeScreen(state, 1, 1);
      }
      if (e.aiTimer > 40) { e.aiState = 'rush'; e.aiTimer = 0; playSound('engine', 0.8, 4); playSound('roar', 0.5, 8); }
      break;
    case 'rush':
      // (flat out across the floor, on past him, till it's well by him or it hits the wall)
      e.vel.x = (e.facing ?? 1) * 8.5;
      if (e.aiTimer % 8 === 0) shakeScreen(state, 2, 2);
      if (e.aiTimer > 100 || (e.aiTimer > 6 && stuck) || (Math.sign(dx) === -(e.facing ?? 1) && Math.abs(dx) > 170)) { e.aiState = 'skid'; e.aiTimer = 0; playSound('grind', 0.6, 0); }
      break;
    case 'skid':
      e.vel.x *= 0.88;
      if (e.aiTimer % 3 === 0 && Math.abs(e.vel.x) > 1) state.particles.push({ pos: { x: mid(e).x, y: GY - 3 }, vel: { x: -e.vel.x * 0.3, y: -1 }, life: 12, color: '#FDE047', size: 2, grav: 0.2 });
      if (e.aiTimer > 30) { e.aiState = 'go'; e.aiTimer = 0; }
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
  // (the tell: down low, shivering, jaws wide; the lunge: stretched out at him, jaws wide)
  if (e.aiState === 'crouch') { c.translate(f % 2 ? 1 : -1, 0); c.scale(1.12, 0.78); }
  if (e.aiState === 'lunge') { c.rotate(-0.25); c.scale(1.15, 0.92); }
  if (e.aiState === 'crouch' || e.aiState === 'lunge') f = 4;
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
  const paw = e.aiState === 'paw';
  const step = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * (rush ? 0.8 : 0.3)) * 8 : 0;
  // (pawing: head down, the front foot raking back along the floor)
  if (paw) { c.translate(0, 4); c.rotate(0.08); }
  for (const s of [-1, 1]) { const rake = paw && s > 0 ? Math.sin(f * 0.8) * 12 : 0; limb(c, s * 18, -24, s * 20 + step * s + rake, rake > 6 ? -4 : 0, 9, s < 0 ? CHROME_D : CHROME); }
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
registerM2Kind({ kind: CHARGER, stats: { w: 66, h: 64, hp: 170, contact: 16, mass: 420 }, ai: chargerAI, draw: drawCharger, robot: true, grab: 'body', gender: 'm', head: { x: 24, y: -40, r: 11 } });

/** A sac on its way out of her / lying there hatching. World. */
export const drawSac = (c: Ctx, x: number, y: number, t: number, hatch: number) => {
  const k = 1 + Math.sin(t * 0.5) * 0.06;
  ink(c, () => c.ellipse(x, y - 14, 20 * k, 15 / k, 0, 0, Math.PI * 2), '#C9C2A8', 1.5);
  c.fillStyle = 'rgba(87, 83, 78, 0.5)'; c.beginPath(); c.ellipse(x + 3, y - 14, 10, 8, 0, 0, Math.PI * 2); c.fill();
  box(c, x - 10, y - 26, 6, 3, '#F5F5F4');
  if (hatch > 0) { box(c, x - 3, y - 30, 6, 30 * hatch, '#1C0610'); box(c, x - 14, y - 2, 28, 3, '#84CC16'); }
};
