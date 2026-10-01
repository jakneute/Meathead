// The yard out back of the break room, drawn: the bikers' camp behind it all (their choppers parked up in rows, the
// club stood about with their beers round a burning barrel, more of them cruising up and down at the back), the
// moving derricks (a deck on skids, a lift up a derrick), and the vents in the ground (and what comes out of them),
// these last out back of the field office too.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { drawChopperBike } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Field, LiveGeyser } from './field';
import { geyserErupting, geyserWarning, geyserBox, geyserK, moverAt } from './field';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const inView = (state: GameState, x1: number, x2: number, pad = 120) => x2 > state.camera.x - pad && x1 < state.camera.x + CANVAS_WIDTH + pad;

/** A biker, in silhouette at the back: stood, a beer in his hand (or riding, sat back on a chopper). */
const backBiker = (ctx: Ctx, x: number, y: number, seed: number, f: number) => {
  const sway = Math.sin(f * 0.05 + seed) * 1.5;
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(x - 7, y - 30, 6, 30); ctx.fillRect(x + 1, y - 30, 6, 30);
  ctx.beginPath(); ctx.roundRect(x - 11, y - 62, 22, 34, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(x + sway * 0.3, y - 70, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 6, y - 64, 12, 12); // the beard
  // (the arm up with the can, now and then a swig)
  const up = Math.sin(f * 0.03 + seed * 2) > 0.7 ? -10 : 0;
  ctx.fillRect(x + 9, y - 56 + up, 5, 18);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 9, y - 60 + up, 5, 7);
};

/**
 * The bikers' camp behind the yard: two rows of choppers parked up nose to tail (dark against the evening, chrome
 * catching the light), the club stood about them with their beers round a burning barrel, and further back still,
 * more of them cruising up and down, a haze of dust behind them.
 */
export const drawYardCamp = (ctx: Ctx, state: GameState) => {
  const Yd = COURSE.yard, f = state.frame;
  if (!inView(state, Yd.x1, Yd.x2, 300)) return;
  ctx.save();
  // The ground they're on, rising away behind the yard in banks (the access road at the top of it, the camp below):
  // nothing out there's floating
  const x1 = Math.max(Yd.x1 - 300, state.camera.x - 150), x2 = Math.min(COURSE.field.x2 + 100, state.camera.x + CANVAS_WIDTH + 150);
  if (x2 > x1) {
    const bank = (top: number, c: string, lip: string) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, Y);
      for (let x = x1; x <= x2; x += 40) ctx.lineTo(x, top + Math.sin(x * 0.013) * 3 + hash(Math.floor(x / 40)) * 2);
      ctx.lineTo(x2, Y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lip; ctx.fillRect(x1, top - 1, x2 - x1, 2);
    };
    bank(Y - 152, '#3B2A20', 'rgba(214, 196, 160, 0.25)');
    bank(Y - 98, '#4A3527', 'rgba(214, 196, 160, 0.2)');
    bank(Y - 60, '#5A4030', 'rgba(214, 196, 160, 0.2)');
  }
  // Cruising, way at the back (small, hazy), up and down the access road
  ctx.globalAlpha = 0.55;
  for (let k = 0; k < 7; k++) {
    const span = Yd.x2 - Yd.x1 + 600, dir = k % 2 ? 1 : -1;
    const x = Yd.x1 - 300 + (((f * (1.6 + (k % 3) * 0.5) * dir + k * 523) % span) + span) % span;
    if (!inView(state, x - 60, x + 60)) continue;
    const y = Y - 150 - (k % 3) * 6;
    ctx.save(); ctx.translate(x, y); ctx.scale(0.42 * dir, 0.42);
    drawChopperBike(ctx, 0, 0, 0, f * 0.3, '#292524');
    ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.roundRect(-14, -66, 22, 34, 6); ctx.fill(); ctx.beginPath(); ctx.arc(-2, -74, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(214, 196, 160, 0.25)'; for (let d = 1; d < 5; d++) { ctx.beginPath(); ctx.arc(x - dir * (16 + d * 12), y - 4 - d, 4 + d * 3, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  // The parked rows: dark, the chrome glinting, a bike every 70 px, the club stood among them
  for (const [row, scale, yOff, shade] of [[0, 0.62, -96, 'rgba(12, 10, 9, 0.55)'], [1, 0.78, -58, 'rgba(12, 10, 9, 0.35)']] as const) {
    for (let x = Yd.x1 + 60 + row * 35; x < Yd.x2; x += 70) {
      if (!inView(state, x - 60, x + 60)) continue;
      const i = Math.floor((x - Yd.x1) / 70) + row * 100;
      ctx.save(); ctx.translate(x, Y + yOff); ctx.scale(scale * (hash(i) < 0.5 ? 1 : -1), scale);
      drawChopperBike(ctx, 0, 0, 0, 0, ['#7F1D1D', '#1E3A8A', '#111827', '#14532D', '#78350F'][i % 5]);
      ctx.restore();
      if (hash(i * 3) < 0.35) { ctx.save(); ctx.translate(x + 26, Y + yOff); ctx.scale(scale, scale); backBiker(ctx, 0, 0, i, f); ctx.restore(); }
    }
    ctx.fillStyle = shade; ctx.fillRect(Math.max(Yd.x1, state.camera.x - 100), Y + yOff - 90 * scale, Math.min(Yd.x2, state.camera.x + CANVAS_WIDTH + 100) - Math.max(Yd.x1, state.camera.x - 100), 92 * scale);
  }
  // Burning barrels, every so often along it, the light off them
  for (let x = Yd.x1 + 400; x < Yd.x2; x += 900) {
    if (!inView(state, x - 80, x + 80)) continue;
    const by = Y - 70;
    const g = ctx.createRadialGradient(x, by - 20, 4, x, by - 20, 90);
    g.addColorStop(0, 'rgba(253, 186, 116, 0.35)'); g.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = g; ctx.fillRect(x - 90, by - 110, 180, 180);
    ctx.fillStyle = '#292524'; ctx.fillRect(x - 12, by - 24, 24, 26); ctx.fillStyle = '#57534E'; ctx.fillRect(x - 12, by - 16, 24, 2); ctx.fillRect(x - 12, by - 6, 24, 2);
    for (let k = 0; k < 4; k++) { const fh = 14 + Math.sin(f * 0.4 + k * 2) * 6; ctx.fillStyle = k % 2 ? '#F97316' : '#FDE047'; ctx.beginPath(); ctx.moveTo(x - 10 + k * 6, by - 24); ctx.quadraticCurveTo(x - 8 + k * 6, by - 24 - fh, x - 4 + k * 6, by - 24); ctx.fill(); }
    backBiker(ctx, x - 34, Y - 62, x, f); backBiker(ctx, x + 36, Y - 62, x + 1, f);
  }
  ctx.restore();
};

/** The moving derricks: a deck on skids (its own little derrick on the back of it), or a lift up the side of a derrick. */
export const drawMovers = (ctx: Ctx, state: GameState, fld: Field) => {
  for (const m of fld.movers) {
    if (!inView(state, m.x - Math.abs(m.dx), m.x + m.w + Math.abs(m.dx))) continue;
    const at = moverAt(m, state.frame);
    if (m.look === 'lift') {
      // The derrick it runs up: a lattice tower behind, the cables down to the cage, the cage's floor
      const tx = m.x + m.w / 2, top = m.y - m.dy / 2 - 200;
      ctx.strokeStyle = '#57534E'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(tx - 46, Y + 40); ctx.lineTo(tx - 16, top); ctx.moveTo(tx + 46, Y + 40); ctx.lineTo(tx + 16, top); ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let y = Y + 40; y > top; y -= 30) { const k = (Y + 40 - y) / (Y + 40 - top), w = 46 - k * 30; ctx.beginPath(); ctx.moveTo(tx - w, y); ctx.lineTo(tx + w - 2, y - 30); ctx.moveTo(tx + w, y); ctx.lineTo(tx - w + 2, y - 30); ctx.stroke(); }
      ctx.fillStyle = '#44403C'; ctx.fillRect(tx - 18, top - 12, 36, 12);
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx - 8, top); ctx.lineTo(at.x + 10, at.y - 40); ctx.moveTo(tx + 8, top); ctx.lineTo(at.x + m.w - 10, at.y - 40); ctx.stroke();
      ctx.strokeStyle = '#EAB308'; ctx.lineWidth = 2; ctx.strokeRect(at.x + 4, at.y - 40, m.w - 8, 40);
      ctx.beginPath(); ctx.moveTo(at.x + 4, at.y - 20); ctx.lineTo(at.x + m.w - 4, at.y - 20); ctx.stroke();
      ctx.fillStyle = '#374151'; ctx.fillRect(at.x, at.y, m.w, 12);
      ctx.fillStyle = '#FACC15'; for (let x = 0; x < m.w; x += 12) ctx.fillRect(at.x + x, at.y + 10, 6, 3);
    } else {
      // A deck on skids, dragged by a cable off a winch, a little derrick on the back of it, the skids scraping
      const top = at.y;
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(at.x + 14, top); ctx.lineTo(at.x + 34, top - 110); ctx.moveTo(at.x + 54, top); ctx.lineTo(at.x + 36, top - 110); ctx.stroke();
      ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { const y = top - k * 26; ctx.beginPath(); ctx.moveTo(at.x + 14 + k * 5, y); ctx.lineTo(at.x + 52 - k * 4, y - 26); ctx.stroke(); }
      ctx.fillStyle = '#44403C'; ctx.fillRect(at.x + 28, top - 118, 14, 8);
      ctx.fillStyle = '#57534E'; ctx.fillRect(at.x, top, m.w, 14);
      ctx.fillStyle = '#292524'; ctx.fillRect(at.x + 6, top + 14, m.w - 12, 6);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(at.x, top, m.w, 2);
      // (the cable it's dragged by, off to the side)
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(at.x + m.w, top + 8); ctx.lineTo(m.x + m.w + m.dx / 2 + 60, Y - 6); ctx.stroke();
      if (state.frame % 6 === 0 && Math.abs(Math.cos((state.frame / m.period) * Math.PI * 2 + m.phase)) > 0.3) state.particles.push({ pos: { x: at.x + (Math.random() < 0.5 ? 6 : m.w - 6), y: top + 20 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 }, life: 12, color: '#FDE047', size: 2 });
    }
  }
};

/** The vents, in the ground: a rusted wellhead stub, crude caked round it; bubbling before it goes; a little fire on it, lit. */
export const drawGeyserVents = (ctx: Ctx, state: GameState, fld: Field) => {
  const f = state.frame;
  for (const g of fld.geysers) {
    if (!inView(state, g.x - 60, g.x + 60)) continue;
    const warn = geyserWarning(g, f);
    const shake = warn ? (Math.random() - 0.5) * 2 : 0;
    ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(g.x, g.y - 1, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120, 90, 200, 0.25)'; ctx.beginPath(); ctx.ellipse(g.x - 8, g.y - 2, 14, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350F'; ctx.fillRect(g.x - 10 + shake, g.y - 12, 20, 12);
    ctx.fillStyle = '#44403C'; ctx.fillRect(g.x - 13 + shake, g.y - 15, 26, 5);
    // (a crack out from it, wider as it's about to go)
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = warn ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(g.x - 14, g.y - 1); ctx.lineTo(g.x - 30, g.y - 3); ctx.moveTo(g.x + 14, g.y - 1); ctx.lineTo(g.x + 28, g.y - 2); ctx.stroke();
    if (warn) for (let k = 0; k < 3; k++) { const r = 2 + ((f * 0.3 + k * 5) % 6); ctx.strokeStyle = g.lit ? 'rgba(253, 224, 71, 0.8)' : 'rgba(41, 37, 36, 0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(g.x - 12 + k * 12, g.y - 16, r, Math.PI, 0); ctx.stroke(); }
    if (g.lit && !geyserErupting(g, f)) {
      // Lit: fire licking off the top of it, waiting
      for (let k = 0; k < 3; k++) { const fh = 12 + Math.sin(f * 0.5 + k * 2) * 5; ctx.fillStyle = k === 1 ? '#FDE047' : '#F97316'; ctx.beginPath(); ctx.moveTo(g.x - 9 + k * 6, g.y - 15); ctx.quadraticCurveTo(g.x - 7 + k * 6, g.y - 15 - fh, g.x - 3 + k * 6, g.y - 15); ctx.fill(); }
    }
  }
};

/** What comes out of them: a column of crude, glossy, slopping over at the top; or, lit, a roaring column of fire. */
export const drawGeyserColumns = (ctx: Ctx, state: GameState, fld: Field) => {
  const f = state.frame;
  for (const g of fld.geysers) {
    if (!inView(state, g.x - 80, g.x + 80) || !geyserErupting(g, f)) continue;
    const box = geyserBox(g, f), k = geyserK(g, f);
    if (box.h < 4) continue;
    column(ctx, g, box, f, k);
  }
};

const column = (ctx: Ctx, g: LiveGeyser, box: { x: number; y: number; w: number; h: number }, f: number, k: number) => {
  const cx = g.x, top = box.y, w = box.w / 2;
  const wob = (y: number) => Math.sin(y * 0.08 + f * 0.6) * 3;
  const body = () => {
    ctx.beginPath(); ctx.moveTo(cx - w * 0.55, g.y);
    for (let y = g.y; y > top; y -= 10) ctx.lineTo(cx - w * (0.55 + (g.y - y) / box.h * 0.35) + wob(y), y);
    ctx.quadraticCurveTo(cx, top - 26, cx + w * 0.9, top);
    for (let y = top; y < g.y; y += 10) ctx.lineTo(cx + w * (0.55 + (g.y - y) / box.h * 0.35) + wob(y + 40), y);
    ctx.lineTo(cx + w * 0.55, g.y); ctx.closePath();
  };
  if (g.lit) {
    const gr = ctx.createLinearGradient(0, g.y, 0, top - 30);
    gr.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); gr.addColorStop(0.15, 'rgba(147, 197, 253, 0.85)'); gr.addColorStop(0.35, 'rgba(253, 224, 71, 0.95)'); gr.addColorStop(0.75, 'rgba(234, 88, 12, 0.9)'); gr.addColorStop(1, 'rgba(127, 29, 29, 0.2)');
    ctx.fillStyle = gr; body(); ctx.fill();
    const glow = ctx.createRadialGradient(cx, (g.y + top) / 2, 10, cx, (g.y + top) / 2, box.h * 0.8);
    glow.addColorStop(0, 'rgba(253, 186, 116, 0.35)'); glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glow; ctx.fillRect(cx - box.h, top - 40, box.h * 2, box.h + 60);
    // (black smoke rolling off the top)
    for (let s = 0; s < 4; s++) { ctx.fillStyle = 'rgba(28, 25, 23, 0.6)'; ctx.beginPath(); ctx.arc(cx + Math.sin(f * 0.1 + s) * 16, top - 20 - s * 14 - k * 20, 12 + s * 5, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.fillStyle = '#0C0A09'; body(); ctx.fill();
    // (its gloss: a streak of sheen up it, the rainbow of it)
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'; ctx.fillRect(cx - w * 0.3, top, 4, box.h);
    ctx.fillStyle = 'rgba(167, 139, 250, 0.18)'; ctx.fillRect(cx + w * 0.1, top, 3, box.h);
    ctx.restore();
    // (slopping over at the top, the gobs of it raining back down)
    for (let s = 0; s < 8; s++) { const a = (s / 8) * Math.PI + f * 0.05, r = 14 + hash(s + f) * 10; ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.4, top + Math.sin(a) * -r * 0.4 + (s % 3) * 6, 4 + (s % 3) * 2, 0, Math.PI * 2); ctx.fill(); }
  }
};
