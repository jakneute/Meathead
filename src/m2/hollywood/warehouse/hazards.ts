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
import { box, poly } from '../blvd/kit';
import { INK, pal, truss } from './paint';
import { beam } from '../coaster/paint';
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
// Drawing (world, behind him; peak SNES: steel and gear in steps, inked; the fire banded)

const GR = ['#08080A', '#121216', '#1C1C22', '#28282F', '#36363E', '#4A4A54', '#6A6A76'];
/** A par can: its yoke, the can (stepped black), its barn doors, the lens (lit: a glint), cracked once it's down. */
const parCan = (c: Ctx, x: number, y: number, lit: boolean, broken = false) => {
  const S = pal().steel;
  box(c, x - 14, y - 6, 28, 6, INK); box(c, x - 13, y - 5, 26, 4, S[3]); box(c, x - 13, y - 5, 26, 1, S[5]);
  box(c, x - 14, y - 2, 4, 14, INK); box(c, x + 10, y - 2, 4, 14, INK);
  box(c, x - 12, y, 24, 22, INK); box(c, x - 11, y + 1, 22, 20, GR[3]); box(c, x - 11, y + 1, 6, 20, GR[5]); box(c, x - 9, y + 1, 1, 20, GR[6]); box(c, x + 6, y + 1, 5, 20, GR[1]);
  for (const s of [-1, 1]) poly(c, [[x + s * 11, y + 20], [x + s * 18, y + 30], [x + s * 15, y + 31], [x + s * 9, y + 21]], GR[2]);
  box(c, x - 10, y + 20, 20, 5, INK);
  box(c, x - 9, y + 21, 18, 3, broken ? '#57534E' : lit ? '#FEF3C0' : '#A8A29E');
  if (!broken && lit) box(c, x - 6, y + 21, 4, 1, '#FFFFFF');
  if (broken) { box(c, x - 4, y + 21, 1, 3, INK); box(c, x + 3, y + 21, 1, 3, INK); }
};
export const drawHazards = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x, S = pal().steel;
  const view = (x: number) => x > cam - 200 && x < cam + 1000;
  LIGHTS.forEach(([rx, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const L = lightAt(f, off);
    // (the rig: a length of box truss on its two chain motors, the can's safety cable up to it)
    for (const mx of [x - 56, x + 56]) { box(c, mx - 1, ROOF_Y, 3, 14, INK); box(c, mx - 6, ROOF_Y + 12, 12, 14, INK); box(c, mx - 5, ROOF_Y + 13, 10, 12, GR[3]); box(c, mx - 5, ROOF_Y + 13, 3, 12, GR[5]); box(c, mx, ROOF_Y + 26, 1, 4, S[4]); }
    truss(c, x - 76, x + 76, ROOF_Y + 30, 12, S, 12);
    if (L.st === 'hang' || L.st === 'tell') {
      const sw = L.st === 'tell' ? Math.sin(f * 0.5) * 8 * L.k : 0;
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, ROOF_Y + 42); c.lineTo(x + sw, HANG_Y - 6); c.stroke();
      c.strokeStyle = S[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, ROOF_Y + 42); c.lineTo(x + sw, HANG_Y - 6); c.stroke();
      parCan(c, x + sw, HANG_Y, L.st === 'hang' || f % 6 < 4);
      // (its light down on the floor (banded); the tell: flickering, the pool under it gone red)
      if (L.st === 'hang' || f % 6 < 4) beam(c, x + sw, HANG_Y + 26, GY - 2, 62, '#FEF9C3', 0.1);
      if (L.st === 'tell') { for (const [rx2, a] of [[56, 0.18], [40, 0.22], [22, 0.3]] as const) { c.fillStyle = `rgba(239, 68, 68, ${a})`; c.beginPath(); c.ellipse(x, GY - 2, rx2, rx2 * 0.12, 0, 0, Math.PI * 2); c.fill(); } }
    } else if (L.st === 'fall') {
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, ROOF_Y + 42); c.lineTo(x + 4, ROOF_Y + 90); c.stroke();
      c.strokeStyle = S[4]; c.lineWidth = 1; c.stroke();
      parCan(c, x, lightY(L.k), true);
    } else {
      // (down: smashed on the floor, its cable snaked up, the glass)
      c.save(); c.translate(x, GY - 12); c.rotate(1.1); parCan(c, 0, -10, false, true); c.restore();
      for (let k = 0; k < 5; k++) { box(c, x - 25 + k * 11, GY - 4, 5, 4, INK); box(c, x - 24 + k * 11, GY - 3, 3, 2, '#E5E7EB'); }
    }
  });
  PYRO.forEach(([rx, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const P = pyroAt(f, off);
    // (the nozzle in the floor: its plate hazard-striped, the burner's mouth (glowing for the tell))
    box(c, x - 18, GY - 9, 36, 9, INK);
    c.save(); c.beginPath(); c.rect(x - 17, GY - 8, 34, 7); c.clip();
    box(c, x - 17, GY - 8, 34, 7, '#18141A');
    c.fillStyle = '#E8B416'; for (let k = -10; k < 40; k += 10) { c.beginPath(); c.moveTo(x - 17 + k, GY - 1); c.lineTo(x - 12 + k, GY - 1); c.lineTo(x - 5 + k, GY - 8); c.lineTo(x - 10 + k, GY - 8); c.closePath(); c.fill(); }
    c.restore();
    box(c, x - 17, GY - 8, 34, 1, '#FFF09A');
    box(c, x - 8, GY - 14, 16, 6, INK); box(c, x - 7, GY - 13, 14, 4, P.tell ? (f % 6 < 3 ? '#F97316' : '#FDBA74') : GR[4]); box(c, x - 7, GY - 13, 14, 1, P.tell ? '#FEF3C0' : GR[6]);
    if (P.burn) {
      const h = PYRO_T.h * Math.min(1, P.k * 6) * (P.k > 0.85 ? (1 - P.k) / 0.15 : 1), w = PYRO_T.w;
      // (banded: dark red out to white-hot at the core, each band a flicker of its own; inked at its edge)
      const cols = ['#5A0A06', '#B91C1C', '#EA580C', '#F97316', '#FDE047', '#FEF9C3'];
      cols.forEach((col, i) => {
        const ww = (w + 6) * (1 - i * 0.15), hh = h * (1 - i * 0.11);
        c.fillStyle = col; c.beginPath(); c.moveTo(x - ww / 2, GY - 12);
        for (let k = 0; k <= 8; k++) { const t = k / 8; c.lineTo(Math.round(x - ww / 2 + ww * t), Math.round(GY - 12 - hh * (0.72 + 0.28 * Math.sin(f * 0.7 + k * 1.7 + i)) * (1 - Math.abs(t - 0.5) * 0.9))); }
        c.lineTo(x + ww / 2, GY - 12); c.closePath(); c.fill();
      });
      // (its glow on the floor)
      for (const [r, a] of [[70, 0.12], [44, 0.18]] as const) { c.fillStyle = `rgba(253, 186, 116, ${a})`; c.beginPath(); c.ellipse(x, GY - 2, r, r * 0.12, 0, 0, Math.PI * 2); c.fill(); }
    }
  });
  FANS.forEach(([rx, dir, off]) => {
    const x = X(rx);
    if (!view(x)) return;
    const F = fanAt(f, off), spin = F.gust ? f * 0.9 : F.spin ? f * 0.2 * (1 + F.k * 3) : f * 0.02, cy = GY - 150;
    // (the stand: a rolling base, its casters, the yoke up to the drum)
    box(c, x - 34, GY - 12, 68, 8, INK); box(c, x - 33, GY - 11, 66, 6, GR[3]); box(c, x - 33, GY - 11, 66, 1, GR[5]);
    for (const wx of [x - 26, x + 26]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 4, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = GR[4]; c.beginPath(); c.arc(wx, GY - 4, 3, 0, Math.PI * 2); c.fill(); }
    box(c, x - 6, GY - 110, 12, 100, INK); box(c, x - 5, GY - 110, 10, 100, GR[3]); box(c, x - 5, GY - 110, 3, 100, GR[5]);
    for (const s of [-1, 1]) { box(c, x + s * 54 - 4, cy - 6, 8, 60, INK); box(c, x + s * 54 - 3, cy - 5, 6, 58, GR[4]); }
    box(c, x - 58, GY - 96, 116, 8, INK); box(c, x - 57, GY - 95, 114, 6, GR[3]); box(c, x - 57, GY - 95, 114, 1, GR[5]);
    // (the drum: its housing ring stepped, the blades a blur when it's going, the cage rings and spokes over them)
    c.fillStyle = INK; c.beginPath(); c.arc(x, cy, 53, 0, Math.PI * 2); c.fill();
    c.fillStyle = GR[4]; c.beginPath(); c.arc(x, cy, 51, 0, Math.PI * 2); c.fill();
    c.fillStyle = GR[5]; c.beginPath(); c.arc(x - 2, cy - 2, 49, Math.PI * 0.9, Math.PI * 1.6); c.lineTo(x - 2, cy - 2); c.fill();
    c.fillStyle = GR[1]; c.beginPath(); c.arc(x, cy, 45, 0, Math.PI * 2); c.fill();
    if (F.gust) { c.fillStyle = 'rgba(161, 161, 170, 0.45)'; c.beginPath(); c.arc(x, cy, 40, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(212, 212, 216, 0.3)'; c.beginPath(); c.arc(x, cy, 26, 0, Math.PI * 2); c.fill(); }
    else for (let k = 0; k < 3; k++) {
      const a = spin + (k * Math.PI * 2) / 3;
      c.fillStyle = INK; c.beginPath(); c.ellipse(x + Math.cos(a) * 21 * 0.4 * dir, cy + Math.sin(a) * 21, 6.5, 23, a, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.ellipse(x + Math.cos(a) * 21 * 0.4 * dir, cy + Math.sin(a) * 21, 5, 21, a, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = INK; c.lineWidth = 2;
    for (const r of [16, 30, 44]) { c.beginPath(); c.arc(x, cy, r, 0, Math.PI * 2); c.stroke(); }
    c.beginPath(); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; c.moveTo(x + Math.cos(a) * 8, cy + Math.sin(a) * 8); c.lineTo(x + Math.cos(a) * 45, cy + Math.sin(a) * 45); } c.stroke();
    c.strokeStyle = GR[6]; c.lineWidth = 1; c.beginPath(); c.arc(x - 1, cy - 1, 44, Math.PI * 1.05, Math.PI * 1.5); c.stroke();
    box(c, x - 7, cy - 7, 14, 14, INK); box(c, x - 6, cy - 6, 12, 12, GR[4]); box(c, x - 6, cy - 6, 4, 4, GR[6]);
    // (which way it blows: the arrow stenciled on its housing, yellow; its spin-up light)
    const ax = x - dir * 72;
    box(c, ax - 13, GY - 108, 26, 16, INK); box(c, ax - 12, GY - 107, 24, 14, '#E8B416'); box(c, ax - 12, GY - 107, 24, 1, '#FFF09A');
    c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(ax + dir * 9, GY - 100); c.lineTo(ax - dir * 2, GY - 105); c.lineTo(ax - dir * 2, GY - 95); c.closePath(); c.fill();
    box(c, ax - dir * 9 - 3, GY - 101, 8, 3, '#18181B');
    box(c, x - 3, GY - 120, 6, 5, INK); box(c, x - 2, GY - 119, 4, 3, F.spin || F.gust ? (f % 10 < 5 ? '#EF4444' : '#7F1D1D') : '#4ADE80');
  });
};
