// THE MAINTENANCE TUNNELS' hazards (the neglect): each with a tell before it hurts, each hurting the cast too
// (hazards-hit-enemies), none set off by anybody but the clock.
//
//   THE VAT, THE SLUDGE   touched: dead (a set-piece death, its own death screen). God mode: back where he last stood.
//   THE SPURTS            the piss filter's intake burping: the vat boils at a spot (the tell), then a column of it up.
//   THE DRUMS             the leaky ones: a hiss, a wisp curling up out of the crack (the tell), then a cloud of chlorine.
//   THE PUDDLES           a cable dangling over each, fizzing at its end (the tell), then the puddle arcs blue.
//   THE VENTS             a hiss and a dribble (the tell), then steam blasting across.
//   HIS AIR               (the flooded pipes) as Wilderness Land's, with this place's lines: under, it goes; out, it
//                         comes back; gone, he drowns a bit at a time.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { WaterBody } from '../../../m1/game/stages/index';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { SWIM_LEAP } from '../../../m1/constants';
import { hazardVictims, hazardKill, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { registerHurtLines } from '../../kinds';
import { heard, envSound } from '../../bossQuiet';
import { meatheadSays } from '../../adventure/section';
import { CELL, cellAt, isDeadly, SPURTS, VAT_Y, DRUMS, PUDDLES, VENTS } from './geo';
import { PISS, SLUDGE, vis } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
for (const [source, l] of Object.entries(L.HURT3)) registerHurtLines(source, l.hurt, l.death);

const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export interface Hazards { safe: { x: number; y: number } | null }
export const newHazards = (): Hazards => ({ safe: null });

/** A hazard on a clock: [period, tell, on] frames, its phase. Where it is in its cycle: 'off' / 'tell' (k 0..1) / 'on'. */
const cycle = (f: number, period: number, tell: number, on: number, phase: number) => {
  const t = ((f + phase) % period + period) % period, off = period - tell - on;
  if (t < off) return { st: 'off' as const, k: 0 };
  if (t < off + tell) return { st: 'tell' as const, k: (t - off) / tell };
  return { st: 'on' as const, k: (t - off - tell) / on };
};
export const SPURT = { tell: 50, on: 46, h: 320, w: 36 };
export const GAS = { period: 170, tell: 54, on: 52, r: 58 };
export const ZAP = { period: 180, tell: 48, on: 46 };
export const STEAM = { period: 150, tell: 46, on: 56, len: 84 };
const gasOf = (d: { x: number; y: number }) => (Math.floor(d.x / 40) * 37 + Math.floor(d.y / 40) * 11) % GAS.period;

/** The box each is hurting right now (null: not on), for him and for the cast. */
const spurtBox = (f: number, i: number) => { const [x, p, ph] = SPURTS[i], s = cycle(f, p, SPURT.tell, SPURT.on, ph); if (s.st !== 'on') return null; const h = SPURT.h * Math.min(1, s.k * 6) * (s.k > 0.85 ? (1 - s.k) / 0.15 : 1); return { x: x - SPURT.w / 2, y: VAT_Y - h, w: SPURT.w, h }; };
const gasCyc = (f: number, d: { x: number; y: number }) => cycle(f, GAS.period, GAS.tell, GAS.on, gasOf(d) || 0);
const gasBox = (f: number, d: { x: number; y: number }) => { const s = gasCyc(f, d); if (s.st !== 'on') return null; const r = GAS.r * Math.min(1, 0.4 + s.k * 2); return { x: d.x + 20 - r, y: d.y - r * 0.9, w: r * 2, h: r * 1.6 }; };
const zapCyc = (f: number, q: { x: number }) => cycle(f, ZAP.period, ZAP.tell, ZAP.on, Math.floor(q.x / 7) % ZAP.period);
const zapBox = (f: number, q: { x: number; y: number }) => (zapCyc(f, q).st === 'on' ? { x: q.x - 10, y: q.y - 14, w: CELL + 20, h: 14 } : null);
const ventCyc = (f: number, v: { y: number; x: number }) => cycle(f, STEAM.period, STEAM.tell, STEAM.on, (Math.floor(v.y / 40) * 50 + Math.floor(v.x / 40) * 3) % STEAM.period);
const ventBox = (f: number, v: { x: number; y: number; dir: 1 | -1 }) => { if (ventCyc(f, v).st !== 'on') return null; const x0 = v.dir > 0 ? v.x + CELL : v.x - STEAM.len; return { x: x0, y: v.y + 6, w: STEAM.len, h: 28 }; };

/** A frame of them all. `died`: what killed him (the vat, the sludge), for the stage. */
export const updateHazards = (ctx: FrameContext, hz: Hazards, died: (src: string) => void) => {
  const { state } = ctx, p = state.player, f = state.frame;
  const pb = { x: p.pos.x + 6, y: p.pos.y + (p.isDucking ? 24 : 0), w: p.width - 12, h: p.height - (p.isDucking ? 24 : 0) };
  const meHit = (b: { x: number; y: number; w: number; h: number } | null) => !!b && p.health > 0 && !p.inCutscene && pb.x < b.x + b.w && pb.x + pb.w > b.x && pb.y < b.y + b.h && pb.y + pb.h > b.y;
  const ouch = (dmg: number, src: string, fromX: number, up = -6) => { if (p.invincibilityTimer <= 0 && !p.untouchable) { hurtPlayer(ctx, dmg, src, { x: Math.sign(pb.x + pb.w / 2 - fromX || 1) * 5, y: up }, 18); shakeScreen(state, 5, 3); } };
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // ---- the vat, the sludge: dead (god mode: back where he last stood)
  if (p.isGrounded && !isDeadly(cellAt(cx, feet + 4))) hz.safe = { x: cx, y: feet };
  const under = cellAt(cx, feet - 6);
  if (p.health > 0 && !p.inCutscene && isDeadly(under)) {
    const src = under === 'P' ? 'm2:wp3_piss' : 'm2:wp3_sludge';
    p.invincibilityTimer = 0; p.untouchable = false;
    playSound('splash', 1, -8); playSound('screams', 0.6, 2); shakeScreen(state, 8, 4);
    const L2 = under === 'P' ? PISS : SLUDGE;
    for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: feet - 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -3 - Math.random() * 5 }, life: 30, color: L2[2 + (i % 4)], size: 3 + Math.random() * 3 });
    died(src);
    hurtPlayer(ctx, 9999, src);
    if (p.health > 0 && hz.safe) { p.pos.x = hz.safe.x - p.width / 2; p.pos.y = hz.safe.y - p.height - 2; p.vel.x = 0; p.vel.y = 0; p.carried = false; }
    else p.vel.y = Math.min(p.vel.y, 0.8);
  }
  // ---- the spurts, the gas, the puddles, the vents
  SPURTS.forEach(([x, per, ph], i) => {
    const s = cycle(f, per, SPURT.tell, SPURT.on, ph);
    if (s.st === 'tell' && Math.floor(s.k * SPURT.tell) === 1) envSound(state, x, 'glug', 0.5, -6, VAT_Y);
    if (s.st === 'on' && Math.floor(s.k * SPURT.on) === 0) envSound(state, x, 'gush', 0.6, -4, VAT_Y);
    if (meHit(spurtBox(f, i))) ouch(16, 'm2:wp3_spurt', x, -10);
  });
  for (const d of DRUMS) {
    if (!d.leak) continue;
    const s = gasCyc(f, d);
    if (s.st === 'tell' && Math.floor(s.k * GAS.tell) === 2) envSound(state, d.x + 20, 'sizzle', 0.4, 4, d.y);
    if (meHit(gasBox(f, d))) ouch(10, 'm2:wp3_gas', d.x + 20, -4);
  }
  for (const q of PUDDLES) {
    const s = zapCyc(f, q);
    if (s.st === 'tell' && Math.floor(s.k * ZAP.tell) % 12 === 0) envSound(state, q.x + 20, 'taser', 0.25, 10, q.y);
    if (s.st === 'on' && Math.floor(s.k * ZAP.on) === 0) envSound(state, q.x + 20, 'taser', 0.6, -2, q.y);
    if (meHit(zapBox(f, q)) && p.isGrounded) ouch(14, 'm2:wp3_zap', q.x + 20, -8);
  }
  for (const v of VENTS) {
    const s = ventCyc(f, v);
    if (s.st === 'tell' && Math.floor(s.k * STEAM.tell) === 1) envSound(state, v.x + 20, 'sizzle', 0.45, -2, v.y);
    if (s.st === 'on' && Math.floor(s.k * STEAM.on) === 0) envSound(state, v.x + 20, 'whoosh', 0.6, -10, v.y);
    if (meHit(ventBox(f, v))) ouch(14, 'm2:wp3_steam', v.x + 20, -4);
  }
  // ---- the cast: into the vat or the sludge (dead), in a spurt, a cloud, an arc, a jet (hurt)
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ef = e.pos.y + e.height;
    const c = cellAt(ex, ef - 4);
    if (isDeadly(c) && e.enemyType !== 'flyer') { hazardKill(ctx, e, ex - 1, c === 'P' ? 'PISSED AWAY!' : 'DISSOLVED!', { color: c === 'P' ? '#FDE047' : '#5EEAD4', fling: { x: 0, y: -4 }, sound: 'splash' }); continue; }
    if (e.hitFlash && e.hitFlash > 0) continue;
    for (let i = 0; i < SPURTS.length; i++) { const b = spurtBox(f, i); if (b && boxHits(e, b.x, b.y, b.w, b.h)) hazardHit(ctx, e, 30, SPURTS[i][0], 'SQUIRTED!', { color: '#FDE047' }); }
    for (const d of DRUMS) { const b = d.leak ? gasBox(f, d) : null; if (b && boxHits(e, b.x, b.y, b.w, b.h) && f % 20 === 0) hazardHit(ctx, e, 12, d.x + 20, 'GASSED!', { color: '#D9F99D' }); }
    for (const q of PUDDLES) { const b = zapBox(f, q); if (b && boxHits(e, b.x, b.y, b.w, b.h)) hazardHit(ctx, e, 30, q.x + 20, 'ZAPPED!', { color: '#93C5FD' }); }
    for (const v of VENTS) { const b = ventBox(f, v); if (b && boxHits(e, b.x, b.y, b.w, b.h)) hazardHit(ctx, e, 25, v.x + 20, 'STEAMED!', { color: '#E5E7EB' }); }
  }
  // (nobody walks into one on their own)
  setHazardZones(state, 'wp3-hz', [
    ...SPURTS.map(([x]) => ({ x0: x - 30, x1: x + 30, y0: VAT_Y - SPURT.h, y1: VAT_Y })),
    ...DRUMS.filter(d => d.leak).map(d => ({ x0: d.x - 40, x1: d.x + 80, y0: d.y - 60, y1: d.y + 40 })),
    ...PUDDLES.map(q => ({ x0: q.x - 10, x1: q.x + 50, y0: q.y - 20, y1: q.y + 2, ground: true })),
    ...VENTS.map(v => ({ x0: v.dir > 0 ? v.x + 40 : v.x - STEAM.len, x1: v.dir > 0 ? v.x + 40 + STEAM.len : v.x, y0: v.y, y1: v.y + 40 })),
  ]);
};

// ---------------------------------------------------------------------------------------------------------------
// His air (the flooded pipes; the wave pool): Wilderness Land's (frontier/air.ts), with this place's lines

const AIR_FRAMES = 1350, AIR_REFILL = 7.5, DROWN_EVERY = 45, DROWN_DAMAGE = 7;
interface Air { o2: number; drownT: number; lowSaid: boolean }
const AIRS = new WeakMap<object, Air>();
const airOf = (state: GameState): Air => { const k = state.stage as object; let a = AIRS.get(k); if (!a) { a = { o2: 1, drownT: 0, lowSaid: false }; AIRS.set(k, a); } return a; };
export const updateAir3 = (ctx: FrameContext, bodyAt: (x: number, y: number) => WaterBody | null) => {
  const { state } = ctx, p = state.player;
  if (!state.stage) return;
  const a = airOf(state);
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const body = bodyAt(cx, cy);
  const was = p.swimming;
  p.swimming = !!body && cy > body.surface && !p.inCutscene && !p.carried;
  if (p.swimming && body) { p.swimSurfaceY = body.surface; p.swimLeap = SWIM_LEAP; }
  if (p.swimming && !was && p.vel.y > 3) { playSound('splash'); for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: cx, y: body!.surface }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 5 }, life: 26, color: i % 2 ? '#CCFBF1' : '#5EEAD4', size: 3 + Math.random() * 3 }); }
  if (state.deathTimer > 0 || p.health <= 0) return;
  const under = p.swimming && !!body && p.pos.y + 6 > body.surface;
  if (under && !ctx.cheats.invincible) {
    a.o2 = Math.max(0, a.o2 - 1 / AIR_FRAMES);
    if (a.o2 < 0.3 && !a.lowSaid) { a.lowSaid = true; meatheadSays(state, pickLine(L.MH_AIR_LOW), false); }
    if (a.o2 < 0.25 && state.frame % 20 === 0) playSound('beep');
    if (state.frame % 14 === 0) state.particles.push({ pos: { x: cx + p.facing * 8, y: p.pos.y + 10 }, vel: { x: 0, y: -1.2 }, life: 40, color: 'rgba(204, 251, 241, 0.8)', size: 3 });
    if (a.o2 <= 0 && ++a.drownT >= DROWN_EVERY) { a.drownT = 0; p.invincibilityTimer = 0; hurtPlayer(ctx, DROWN_DAMAGE, 'm2:wp3_drown'); }
  } else {
    a.o2 = Math.min(1, a.o2 + AIR_REFILL / AIR_FRAMES);
    a.drownT = 0;
    if (a.o2 > 0.6) a.lowSaid = false;
  }
};
export const drawAir3 = (c: Ctx, state: GameState) => {
  if (!state.stage) return;
  const a = airOf(state), p = state.player;
  if (a.o2 >= 0.999 || p.health <= 0 || p.hidden) return;
  const n = 6, lit = Math.ceil(a.o2 * n), cx = p.pos.x + p.width / 2, y = p.pos.y - 18;
  for (let i = 0; i < n; i++) {
    const bx = cx - (n - 1) * 6 + i * 12;
    c.beginPath(); c.arc(bx, y, 4.5, 0, Math.PI * 2);
    if (i < lit) { c.fillStyle = a.o2 < 0.3 && state.frame % 20 < 10 ? '#F87171' : '#E0F2FE'; c.fill(); }
    c.strokeStyle = '#0C4A6E'; c.lineWidth = 1.5; c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Behind the play: the cables over the puddles (fizzing in the tell), the drums' wisps (the tell), the vents' dribble. */
export const drawHazardsBack = (c: Ctx, state: GameState, _hz: Hazards) => {
  const f = state.frame;
  for (const q of PUDDLES) {
    if (!vis(state, q.x - 40, q.x + 80)) continue;
    const s = zapCyc(f, q), cx = q.x + 22;
    // (the cable: down off the ceiling's conduit, its stripped end hanging just over the puddle)
    c.strokeStyle = '#0A0A0A'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 14, q.y - 200); c.quadraticCurveTo(cx - 20, q.y - 90, cx + Math.sin(f * 0.05) * 2, q.y - 34); c.stroke();
    R(c, cx - 2 + Math.sin(f * 0.05) * 2, q.y - 36, 4, 6, '#C87A3A');
    // (the puddle: a dark sheen on the floor)
    c.fillStyle = 'rgba(60, 90, 110, 0.75)'; c.beginPath(); c.ellipse(q.x + 20, q.y - 2, 30, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(160, 200, 220, 0.6)'; c.fillRect(q.x + 4, q.y - 4, 12, 1);
    if (s.st === 'tell') for (let k = 0; k < 3; k++) if ((f + k * 3) % 6 < 3) R(c, cx - 4 + ((f * 7 + k * 5) % 9), q.y - 40 + ((f * 3 + k * 7) % 10), 2, 2, k ? '#BFDBFE' : '#FFFFFF');
  }
  for (const d of DRUMS) {
    if (!d.leak || !vis(state, d.x - 60, d.x + 100)) continue;
    const s = gasCyc(f, d);
    if (s.st === 'tell') {
      // (the wisp: curling up out of the crack, growing)
      const k = s.k;
      for (let i = 0; i < 4; i++) { c.globalAlpha = 0.25 + 0.35 * k; c.fillStyle = i % 2 ? '#D9F99D' : '#BEF264'; c.beginPath(); c.arc(d.x + 28 + Math.sin(f * 0.2 + i) * 4, d.y + 6 - i * 8 * k, 3 + 4 * k, 0, Math.PI * 2); c.fill(); }
      c.globalAlpha = 1;
    }
  }
  for (const v of VENTS) {
    if (!vis(state, v.x - 100, v.x + 140)) continue;
    const s = ventCyc(f, v), nx = v.dir > 0 ? v.x + CELL : v.x;
    if (s.st === 'tell') { for (let k = 0; k < 3; k++) { c.globalAlpha = 0.5; c.fillStyle = '#E5E7EB'; c.beginPath(); c.arc(nx + v.dir * (4 + k * 6 * s.k), v.y + 20 + Math.sin(f * 0.4 + k) * 3, 3 + k, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; R(c, nx - 1, v.y + 30, 2, 4 + (f % 10), '#93C5FD'); }
  }
};
/** In front: the spurts (the vat boiling at the spot, then the column), the gas clouds, the arcs, the steam. */
export const drawHazardsFront = (c: Ctx, state: GameState, _hz: Hazards) => {
  const f = state.frame;
  SPURTS.forEach(([x, per, ph], i) => {
    if (!vis(state, x - 40, x + 40)) return;
    const s = cycle(f, per, SPURT.tell, SPURT.on, ph);
    if (s.st === 'tell') for (let k = 0; k < 4; k++) { const bx = x - 14 + ((k * 9 + f) % 28), by = VAT_Y - 4 - ((f * 2 + k * 11) % 12) * s.k; c.fillStyle = PISS[5]; c.beginPath(); c.arc(bx, by, 2 + 2 * s.k, 0, Math.PI * 2); c.fill(); }
    const b = spurtBox(f, i);
    if (b) {
      R(c, b.x, b.y, b.w, b.h, PISS[3]); R(c, b.x + 6, b.y, 8, b.h, PISS[4]); R(c, b.x + 8, b.y, 3, b.h, PISS[5]);
      for (let y = b.y + ((f * 8) % 24); y < b.y + b.h; y += 24) R(c, b.x, y, b.w, 4, PISS[2]);
      c.fillStyle = PISS[4]; c.beginPath(); c.ellipse(x, b.y, 24, 10, 0, 0, Math.PI * 2); c.fill();
      for (let k = 0; k < 5; k++) R(c, x - 24 + ((f * 5 + k * 11) % 48), b.y - 8 - ((f + k * 7) % 14), 4, 4, '#FFFBE0');
    }
  });
  for (const d of DRUMS) {
    if (!d.leak) continue;
    const b = gasBox(f, d);
    if (!b || !vis(state, b.x, b.x + b.w)) continue;
    const s = gasCyc(f, d), fade = s.k > 0.75 ? (1 - s.k) / 0.25 : 1;
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + f * 0.03, r = b.w * (0.22 + 0.06 * (i % 3));
      c.globalAlpha = 0.42 * fade; c.fillStyle = i % 2 ? '#D9F99D' : '#A3E635';
      c.beginPath(); c.ellipse(b.x + b.w / 2 + Math.cos(a) * b.w * 0.22, b.y + b.h / 2 + Math.sin(a) * b.h * 0.2, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  for (const q of PUDDLES) {
    const b = zapBox(f, q);
    if (!b || !vis(state, b.x, b.x + b.w)) continue;
    // (the arcs: jagged blue-white over the puddle, a different jag every few frames)
    c.strokeStyle = f % 4 < 2 ? '#BFDBFE' : '#FFFFFF'; c.lineWidth = 2;
    for (let k = 0; k < 3; k++) { c.beginPath(); let x = q.x - 6; c.moveTo(x, q.y - 3); while (x < q.x + 46) { x += 8; c.lineTo(x, q.y - 3 - ((Math.floor(f / 3) * 7 + x + k * 13) % 14)); } c.stroke(); }
    c.strokeStyle = '#60A5FA'; c.lineWidth = 2; c.beginPath(); c.moveTo(q.x + 22, q.y - 34); c.lineTo(q.x + 18, q.y - 18); c.lineTo(q.x + 26, q.y - 12); c.lineTo(q.x + 20, q.y - 2); c.stroke();
  }
  for (const v of VENTS) {
    const b = ventBox(f, v);
    if (!b || !vis(state, b.x, b.x + b.w)) continue;
    const s = ventCyc(f, v), grow = Math.min(1, s.k * 8);
    for (let i = 0; i < 7; i++) {
      const u = (i / 7 + f * 0.04) % 1, x = v.dir > 0 ? b.x + u * b.w * grow : b.x + b.w - u * b.w * grow;
      c.globalAlpha = 0.6 * (1 - u * 0.6); c.fillStyle = i % 2 ? '#F3F4F6' : '#D1D5DB';
      c.beginPath(); c.arc(x, b.y + b.h / 2 + Math.sin(u * 9 + f * 0.3) * 4, 8 + u * 10, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
};
export { heard };
