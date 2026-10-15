// The set's hazards (the film's gear, working, sort of; they hurt whoever's under them, the crew too):
//   the lighting rig  a par can hung off the rig on its cable: it sparks and swings (the tell), then comes down on
//                     whoever's under it; a grip hangs another a while later
//   pyro              jets in the floor (PYRO: HOT SET): a hiss and a puff of smoke (the tell), then a column of fire
//   wind machines     a big fan on a stand: it spins up (the tell), then the gust shoves him (and the crew) along; no
//                     harm in it itself, just where it shoves him (a pit, a hung flat)
// Their danger zones keep the crew from walking into them (hazardHit.ts); knocked in, that's another matter.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { isMidBoss } from '../../../m1/game/combat/midBoss';
import { box } from '../section';
import { X, GY, ROOF_Y, LIGHTS, LIGHT, PYRO, PYRO_T, FANS, FAN } from './layout';
import { whOf } from './state';

type Ctx = CanvasRenderingContext2D;

const HANG_Y = ROOF_Y + 90, FALL_G = 0.9, FALLEN = 70;
/** Where a light's cycle is: hanging, the tell (sparking, swinging), falling (frames in), down (broken), or hung again. */
const lightAt = (f: number, off: number) => {
  const cyc = (f + off) % LIGHT.every, fallAt = LIGHT.every - FALLEN - 40, tellAt = fallAt - LIGHT.tell;
  if (cyc < tellAt) return { st: 'hang' as const, k: 0 };
  if (cyc < fallAt) return { st: 'tell' as const, k: (cyc - tellAt) / LIGHT.tell };
  if (cyc < fallAt + 40) return { st: 'fall' as const, k: cyc - fallAt };
  return { st: 'down' as const, k: cyc - fallAt - 40 };
};
const lightY = (t: number) => Math.min(GY - 14, HANG_Y + 0.5 * FALL_G * t * t);
const pyroAt = (f: number, off: number) => {
  const cyc = (f + off) % PYRO_T.every, burnAt = PYRO_T.every - PYRO_T.burn, tellAt = burnAt - PYRO_T.tell;
  return { tell: cyc >= tellAt && cyc < burnAt, burn: cyc >= burnAt, k: cyc >= burnAt ? (cyc - burnAt) / PYRO_T.burn : 0, start: cyc === burnAt };
};
const fanAt = (f: number, off: number) => {
  const cyc = (f + off) % FAN.every, gustAt = FAN.every - FAN.gust, spinAt = gustAt - FAN.spin;
  return { spin: cyc >= spinAt && cyc < gustAt, gust: cyc >= gustAt, k: cyc >= spinAt ? Math.min(1, (cyc - spinAt) / FAN.spin) : 0 };
};

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, o = whOf(state), cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const near = (x: number) => Math.abs(cx - x) < 1400;
  // The lighting rig
  const zl: { x0: number; x1: number; y0: number; y1: number }[] = [];
  LIGHTS.forEach(([rx, off], i) => {
    const x = X(rx), L = lightAt(f, off);
    o.hz.lights[i] ??= { y: HANG_Y, vy: 0, down: 0, hit: new WeakSet(), hitHim: false };
    const h = o.hz.lights[i];
    if (L.st === 'hang') { h.hit = new WeakSet(); h.hitHim = false; }
    if (!near(x)) return;
    if (L.st === 'tell' || L.st === 'fall') zl.push({ x0: x - 54, x1: x + 54, y0: GY - 220, y1: GY });
    if (L.st === 'tell' && f % 7 === 0) { playSound('click', 0.25, 12); state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 16, y: HANG_Y - 26 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 12, color: '#FDE047', size: 2, grav: 0.2 }); }
    if (L.st === 'fall' && L.k === 0) playSound('whoosh', 0.6, -4);
    if (L.st === 'fall' && lightY(L.k) >= GY - 14 && lightY(L.k - 1) < GY - 14) {
      playSound('crash', 0.9); playSound('glass', 0.7); shakeScreen(state, 6, 3);
      for (let k = 0; k < 14; k++) state.particles.push({ pos: { x, y: GY - 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 5 }, life: 24, color: k % 3 ? '#E5E7EB' : '#FDE047', size: 2 + Math.random() * 2, grav: 0.35 });
    }
    // (on the way down and the moment it lands: whoever's under it)
    if (L.st === 'fall') {
      const y = lightY(L.k);
      if (!h.hitHim && p.health > 0 && Math.abs(cx - x) < LIGHT.reach + p.width / 2 && y > p.pos.y - 30 && y < feet + 6 && p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried) {
        h.hitHim = true; hurtPlayer(ctx, LIGHT.dmg, 'm2:hww_light', { x: Math.sign(cx - x || 1) * 6, y: -5 }, 22);
      }
      for (const e of hazardVictims(state)) if (!h.hit.has(e) && boxHits(e, x - LIGHT.reach, y - 30, LIGHT.reach * 2, 40)) { h.hit.add(e); hazardHit(ctx, e, 70, x, 'LIT!'); }
    }
  });
  setHazardZones(state, 'hww-lights', zl);
  // Pyro
  const zp: { x0: number; x1: number; y0: number; y1: number }[] = [];
  PYRO.forEach(([rx, off], i) => {
    const x = X(rx), P = pyroAt(f, off);
    o.hz.pyroHit[i] ??= new WeakSet();
    if (!near(x)) return;
    if (P.tell || P.burn) zp.push({ x0: x - PYRO_T.w / 2 - 20, x1: x + PYRO_T.w / 2 + 20, y0: GY - PYRO_T.h, y1: GY });
    if (P.tell && f % 5 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 12, y: GY - 6 }, vel: { x: (Math.random() - 0.5), y: -1 - Math.random() }, life: 26, color: 'rgba(120, 113, 108, 0.6)', size: 4 + Math.random() * 4 });
    if (P.start) { playSound('flame', 0.8, -4); playSound('ignite', 0.6); o.hz.pyroHit[i] = new WeakSet(); }
    if (!P.burn) return;
    const top = GY - PYRO_T.h * Math.min(1, P.k * 6) * (P.k > 0.85 ? (1 - P.k) / 0.15 : 1);
    if (f % 2 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * PYRO_T.w * 0.6, y: top + 10 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 }, life: 16, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
    const inIt = (bx: number, by: number, bw: number, bh: number) => bx + bw > x - PYRO_T.w / 2 && bx < x + PYRO_T.w / 2 && by + bh > top && by < GY;
    if (p.health > 0 && inIt(p.pos.x, p.pos.y, p.width, p.height) && p.invincibilityTimer <= 0 && !p.inCutscene && !p.carried) hurtPlayer(ctx, PYRO_T.dmg, 'm2:hww_pyro', { x: Math.sign(cx - x || 1) * 6, y: -9 }, 22);
    for (const e of hazardVictims(state)) if (!o.hz.pyroHit[i].has(e) && inIt(e.pos.x, e.pos.y, e.width, e.height)) { o.hz.pyroHit[i].add(e); hazardHit(ctx, e, 45, x, 'TOASTED!', { color: '#FDBA74' }); }
  });
  setHazardZones(state, 'hww-pyro', zp);
  // The wind machines
  FANS.forEach(([rx, dir, off]) => {
    const x = X(rx), F = fanAt(f, off);
    if (!near(x)) return;
    if (F.spin && f % 9 === 0) playSound('whoosh', 0.2 + F.k * 0.3, -10);
    if (!F.gust) return;
    if (f % 12 === 0) playSound('whoosh', 0.45, -12);
    const inFront = (bx: number) => (bx - x) * dir > 0 && Math.abs(bx - x) < FAN.reach;
    if (f % 2 === 0) state.particles.push({ pos: { x: x + dir * (30 + Math.random() * 200), y: GY - 30 - Math.random() * 220 }, vel: { x: dir * (7 + Math.random() * 5), y: (Math.random() - 0.5) }, life: 30, color: 'rgba(241, 245, 249, 0.55)', size: 2 });
    if (p.health > 0 && !p.carried && !p.inCutscene && inFront(cx) && feet > GY - 420) p.vel.x += dir * (p.isGrounded ? 0.5 : 0.3);
    for (const e of state.enemies) if (e.health > 0 && !e.isBlownAway && !isMidBoss(e) && e.vel.y === 0 && inFront(e.pos.x + e.width / 2)) blow(e, dir);
  });
};
const blow = (e: Enemy, dir: number) => { e.pos.x += dir * 1.3; };

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world, behind him)

/** A par can: its yoke, its barn doors, the lens (lit). */
const parCan = (c: Ctx, x: number, y: number, lit: boolean, broken = false) => {
  box(c, x - 12, y - 4, 24, 4, '#27272A');
  box(c, x - 13, y, 26, 22, '#000'); box(c, x - 12, y + 1, 24, 20, '#3F3F46'); box(c, x - 12, y + 1, 6, 20, '#52525B');
  box(c, x - 16, y + 18, 6, 10, '#27272A'); box(c, x + 10, y + 18, 6, 10, '#27272A');
  box(c, x - 9, y + 20, 18, 4, broken ? '#57534E' : lit ? '#FEF9C3' : '#A8A29E');
};
export const drawHazards = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  const view = (x: number) => x > cam - 200 && x < cam + 1000;
  LIGHTS.forEach(([rx, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const L = lightAt(f, off);
    // (the rig's truss over it, the cable)
    box(c, x - 70, ROOF_Y + 30, 140, 8, '#27272A'); box(c, x - 70, ROOF_Y + 30, 140, 2, '#52525B');
    for (let k = -60; k < 60; k += 12) { c.strokeStyle = '#3F3F46'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + k, ROOF_Y + 30); c.lineTo(x + k + 6, ROOF_Y + 38); c.stroke(); }
    if (L.st === 'hang' || L.st === 'tell') {
      const sw = L.st === 'tell' ? Math.sin(f * 0.5) * 8 * L.k : 0;
      c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, ROOF_Y + 38); c.lineTo(x + sw, HANG_Y - 4); c.stroke();
      parCan(c, x + sw, HANG_Y, true);
      // (its light down on the floor; the tell: flickering)
      if (L.st === 'hang' || f % 6 < 4) { c.fillStyle = 'rgba(254, 249, 195, 0.12)'; c.beginPath(); c.moveTo(x - 10 + sw, HANG_Y + 24); c.lineTo(x + 10 + sw, HANG_Y + 24); c.lineTo(x + 60, GY); c.lineTo(x - 60, GY); c.closePath(); c.fill(); }
      if (L.st === 'tell') { c.fillStyle = 'rgba(239, 68, 68, 0.25)'; c.beginPath(); c.ellipse(x, GY - 2, 50, 6, 0, 0, Math.PI * 2); c.fill(); }
    } else if (L.st === 'fall') {
      c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, ROOF_Y + 38); c.lineTo(x + 4, ROOF_Y + 90); c.stroke();
      parCan(c, x, lightY(L.k), true);
    } else {
      // (down: smashed on the floor, its cable snaked up)
      c.save(); c.translate(x, GY - 12); c.rotate(1.1); parCan(c, 0, -10, false, true); c.restore();
      for (let k = 0; k < 5; k++) box(c, x - 24 + k * 11, GY - 3, 4, 3, '#E5E7EB');
    }
  });
  PYRO.forEach(([rx, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const P = pyroAt(f, off);
    // (the nozzle in the floor, hazard-striped; the fire)
    box(c, x - 16, GY - 8, 32, 8, '#000'); box(c, x - 15, GY - 7, 30, 6, '#3F3F46');
    for (let k = 0; k < 4; k++) box(c, x - 14 + k * 8, GY - 7, 4, 6, '#FACC15');
    box(c, x - 6, GY - 12, 12, 5, P.tell ? '#F97316' : '#27272A');
    if (P.burn) {
      const h = PYRO_T.h * Math.min(1, P.k * 6) * (P.k > 0.85 ? (1 - P.k) / 0.15 : 1), w = PYRO_T.w;
      const cols = ['#B91C1C', '#EA580C', '#F97316', '#FDE047', '#FEF9C3'];
      cols.forEach((col, i) => {
        const ww = w * (1 - i * 0.17), hh = h * (1 - i * 0.12);
        c.fillStyle = col; c.beginPath(); c.moveTo(x - ww / 2, GY - 8);
        for (let k = 0; k <= 6; k++) { const t = k / 6; c.lineTo(x - ww / 2 + ww * t, GY - 8 - hh * (0.75 + 0.25 * Math.sin(f * 0.7 + k * 1.7 + i)) * (1 - Math.abs(t - 0.5) * 0.9)); }
        c.lineTo(x + ww / 2, GY - 8); c.closePath(); c.fill();
      });
    }
  });
  FANS.forEach(([rx, dir, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const F = fanAt(f, off), spin = F.gust ? f * 0.9 : F.spin ? f * 0.2 * (1 + F.k * 3) : f * 0.02;
    // (the stand, the cage, the blades going round)
    box(c, x - 4, GY - 120, 8, 120, '#3F3F46'); box(c, x - 30, GY - 8, 60, 8, '#27272A');
    c.fillStyle = '#000'; c.beginPath(); c.arc(x, GY - 150, 52, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#52525B'; c.beginPath(); c.arc(x, GY - 150, 49, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA';
    for (let k = 0; k < 3; k++) { const a = spin + (k * Math.PI * 2) / 3; c.beginPath(); c.ellipse(x + Math.cos(a) * 22 * 0.4 * dir, GY - 150 + Math.sin(a) * 22, 10 * 0.5, 22, a, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = '#18181B'; c.lineWidth = 2;
    for (const r of [20, 36, 48]) { c.beginPath(); c.arc(x, GY - 150, r, 0, Math.PI * 2); c.stroke(); }
    box(c, x - 5, GY - 155, 10, 10, '#18181B');
    // (which way it blows: the arrow painted on its housing)
    box(c, x - dir * 70, GY - 104, 22, 14, '#FACC15');
    c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(x - dir * 70 + (dir > 0 ? 18 : 4), GY - 97); c.lineTo(x - dir * 70 + 11, GY - 102); c.lineTo(x - dir * 70 + 11, GY - 92); c.closePath(); c.fill();
  });
};
