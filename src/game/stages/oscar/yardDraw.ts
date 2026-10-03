// The yard out back of the break room, drawn: the bikers' camp behind it all (their choppers parked up in rows, the
// club stood about with their beers round a burning barrel, more of them cruising up and down at the back), the
// moving derricks (a deck on skids, a lift up a derrick), and the vents in the ground (and what comes out of them),
// these last out back of the field office too.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left), glows
// in rings, no smooth gradients.

import type { GameState } from '../../core/state';
import { drawFire } from '../../render/fx/fire';
import { checker, hazeBands, pixelBlob, pixelRidge, steppedGlow } from '../../render/pixelArt';
import { INK, ink } from '../../render/npc/kit';
import { slab, column as post } from '../barry/rooms';
import { strut } from './kit';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { drawChopperBike } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Field, LiveGeyser, LiveMover } from './field';
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
  // (the firelight catching his edge: down the left of him, his shoulder, the top of his head)
  ctx.fillStyle = '#5A2E16';
  ctx.fillRect(x - 7, y - 30, 2, 28); ctx.fillRect(x - 11, y - 58, 2, 28); ctx.fillRect(x - 7, y - 62, 10, 2);
  ctx.fillRect(x - 6 + sway * 0.3, y - 76, 6, 2); ctx.fillRect(x - 8 + sway * 0.3, y - 74, 2, 6);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 9, y - 60 + up, 5, 7);
  ctx.fillStyle = '#F87171'; ctx.fillRect(x + 9, y - 60 + up, 2, 7);
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
    // (each bank a ridge of dirt column by column: a lit rim, the crest rounded off, the tone dropping down it)
    const bank = (top: number, c: string, rim: string) => {
      const ridge = (x: number) => top + Math.sin(x * 0.013) * 3 + hash(Math.floor(x / 40)) * 2;
      pixelRidge(ctx, x1, x2, Y, ridge, 0, { fill: c, rim, shade: rim });
      checker(ctx, x1, top + 14, x2 - x1, 2, '#2A1C14');
    };
    bank(Y - 152, '#3B2A20', '#6E5A44');
    bank(Y - 98, '#4A3527', '#7A644C');
    bank(Y - 60, '#5A4030', '#86704F');
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
    for (let d = 1; d < 5; d++) pixelBlob(ctx, x - dir * (16 + d * 12), y - 4 - d, 4 + d * 3, 3 + d * 2, 'rgba(214, 196, 160, 0.25)');
  }
  ctx.globalAlpha = 1;
  // The parked rows: dark, the chrome glinting, a bike every 70 px, the club stood among them
  for (const [row, scale, yOff, shade] of [[0, 0.62, -96, 0.55], [1, 0.78, -58, 0.35]] as const) {
    for (let x = Yd.x1 + 60 + row * 35; x < Yd.x2; x += 70) {
      if (!inView(state, x - 60, x + 60)) continue;
      const i = Math.floor((x - Yd.x1) / 70) + row * 100;
      ctx.save(); ctx.translate(x, Y + yOff); ctx.scale(scale * (hash(i) < 0.5 ? 1 : -1), scale);
      drawChopperBike(ctx, 0, 0, 0, 0, ['#7F1D1D', '#1E3A8A', '#111827', '#14532D', '#78350F'][i % 5]);
      ctx.restore();
      if (hash(i * 3) < 0.35) { ctx.save(); ctx.translate(x + 26, Y + yOff); ctx.scale(scale, scale); backBiker(ctx, 0, 0, i, f); ctx.restore(); }
    }
    const hx = Math.max(Yd.x1, state.camera.x - 100), hw = Math.min(Yd.x2, state.camera.x + CANVAS_WIDTH + 100) - hx;
    if (hw > 0) hazeBands(ctx, hx, Y + yOff - 90 * scale, hw, 92 * scale, '#0C0A09', shade * 1.2, shade * 0.7, 3);
  }
  // Burning barrels, every so often along it, the light off them
  for (let x = Yd.x1 + 400; x < Yd.x2; x += 900) {
    if (!inView(state, x - 80, x + 80)) continue;
    const by = Y - 70;
    steppedGlow(ctx, x, by - 20, 90, '#F97316', 0.22, 0.04, 5);
    post(ctx, x - 12, by - 24, 24, 26, '#44403C');
    for (const ry of [by - 16, by - 6]) { ctx.fillStyle = '#78716C'; ctx.fillRect(x - 11, ry, 22, 2); ctx.fillStyle = INK; ctx.fillRect(x - 11, ry + 2, 22, 1); }
    ctx.fillStyle = '#9A3412'; ctx.fillRect(x - 11, by - 24, 22, 2); checker(ctx, x - 6, by - 22, 8, 10, '#7C2D12');
    drawFire(ctx, x, by - 22, 26, 28, f, { seed: x, smoke: 0.3, glow: 0 });
    backBiker(ctx, x - 34, Y - 62, x, f); backBiker(ctx, x + 36, Y - 62, x + 1, f);
  }
  ctx.restore();
};

/** The moving derricks: a deck on skids (its own little derrick on the back of it), or a lift up the side of a derrick. */
export const drawMovers = (ctx: Ctx, state: GameState, fld: Field) => {
  for (const m of fld.movers) {
    if (!inView(state, m.x - Math.abs(m.dx), m.x + m.w + Math.abs(m.dx))) continue;
    const at = moverAt(m, state.frame);
    if (m.wrecked) { drawWreckedMover(ctx, state, m, at); continue; }
    if (m.look === 'lift') {
      // The derrick it runs up: a lattice tower behind, the cables down to the cage, the cage's floor
      const tx = m.x + m.w / 2, top = m.y - m.dy / 2 - 200;
      const braces = () => { ctx.beginPath(); for (let y = Y + 40; y > top; y -= 30) { const k = (Y + 40 - y) / (Y + 40 - top), w = 46 - k * 30; ctx.moveTo(tx - w, y); ctx.lineTo(tx + w - 2, y - 30); ctx.moveTo(tx + w, y); ctx.lineTo(tx - w + 2, y - 30); } };
      ctx.strokeStyle = INK; ctx.lineWidth = 3; braces(); ctx.stroke();
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1.5; braces(); ctx.stroke();
      strut(ctx, tx - 46, Y + 40, tx - 16, top, 3, '#57534E'); strut(ctx, tx + 46, Y + 40, tx + 16, top, 3, '#57534E');
      slab(ctx, tx - 18, top - 12, 36, 12, '#44403C');
      ink(ctx, () => ctx.arc(tx, top - 6, 4, 0, Math.PI * 2), '#9CA3AF');
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx - 8, top); ctx.lineTo(at.x + 10, at.y - 40); ctx.moveTo(tx + 8, top); ctx.lineTo(at.x + m.w - 10, at.y - 40); ctx.stroke();
      // (the cage: yellow rails, inked)
      const rails = () => { ctx.beginPath(); ctx.rect(at.x + 4, at.y - 40, m.w - 8, 40); ctx.moveTo(at.x + 4, at.y - 20); ctx.lineTo(at.x + m.w - 4, at.y - 20); };
      ctx.strokeStyle = INK; ctx.lineWidth = 4; rails(); ctx.stroke();
      ctx.strokeStyle = '#EAB308'; ctx.lineWidth = 2; rails(); ctx.stroke();
      ctx.fillStyle = '#FDE047'; ctx.fillRect(at.x + 4, at.y - 41, m.w - 8, 1);
      slab(ctx, at.x, at.y, m.w, 12, '#374151');
      ctx.fillStyle = '#FACC15'; for (let x = 0; x < m.w; x += 12) ctx.fillRect(at.x + x, at.y + 8, 6, 2);
    } else {
      // A deck on skids, dragged by a cable off a winch, a little derrick on the back of it, the skids scraping
      const top = at.y;
      const braces = () => { ctx.beginPath(); for (let k = 0; k < 4; k++) { const y = top - k * 26; ctx.moveTo(at.x + 14 + k * 5, y); ctx.lineTo(at.x + 52 - k * 4, y - 26); } };
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; braces(); ctx.stroke();
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; braces(); ctx.stroke();
      strut(ctx, at.x + 14, top, at.x + 34, top - 110, 2, '#78716C'); strut(ctx, at.x + 54, top, at.x + 36, top - 110, 2, '#78716C');
      slab(ctx, at.x + 28, top - 118, 14, 8, '#44403C', 1);
      slab(ctx, at.x + 6, top + 14, m.w - 12, 6, '#292524', 1);
      slab(ctx, at.x, top, m.w, 14, '#57534E');
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(at.x + 1, top + 1, m.w - 2, 2);
      ctx.fillStyle = '#44403C'; for (let x = at.x + 16; x < at.x + m.w - 4; x += 16) ctx.fillRect(x, top + 3, 2, 10);
      // (the cable it's dragged by, off to the side)
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(at.x + m.w, top + 8); ctx.lineTo(m.x + m.w + m.dx / 2 + 60, Y - 6); ctx.stroke();
      if (state.frame % 6 === 0 && Math.abs(Math.cos((state.frame / m.period) * Math.PI * 2 + m.phase)) > 0.3) state.particles.push({ pos: { x: at.x + (Math.random() < 0.5 ? 6 : m.w - 6), y: top + 20 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 }, life: 12, color: '#FDE047', size: 2 });
    }
  }
};

/**
 * A moving derrick out back of the field office, wrecked: the deck scorched black and holed (planks gone, the steel
 * curled up at the edges), the tower on it bent over and snapped short (or the lift's tower with a chunk out of it and
 * its cage buckled, one cable gone and the end of it swinging), fire still licking at a corner, smoke off it, sparks.
 */
const drawWreckedMover = (ctx: Ctx, state: GameState, m: LiveMover, at: { x: number; y: number }) => {
  const f = state.frame, top = at.y;
  if (m.look === 'lift') {
    const tx = m.x + m.w / 2, crown = m.y - m.dy / 2 - 190;
    // (the tower, a chunk blown out of one side of it, the rest leaning)
    ctx.save(); ctx.translate(tx, Y + 40); ctx.rotate(0.06);
    const braces = () => { ctx.beginPath(); for (let y = 0; y > crown - Y - 40; y -= 30) { if (y < -100 && y > -170) continue; const k = -y / (Y + 40 - crown), w = 46 - k * 30; ctx.moveTo(-w, y); ctx.lineTo(w - 2, y - 30); } };
    ctx.strokeStyle = INK; ctx.lineWidth = 3; braces(); ctx.stroke();
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1.5; braces(); ctx.stroke();
    strut(ctx, -46, 0, -16, crown - Y - 40, 3, '#3F3F46'); strut(ctx, 46, 0, 30, -110, 3, '#3F3F46'); strut(ctx, 22, -150, 16, crown - Y - 40, 3, '#3F3F46');
    // (bent struts sticking out of the hole)
    const bent = () => { ctx.beginPath(); ctx.moveTo(30, -110); ctx.quadraticCurveTo(44, -124, 52, -118); ctx.moveTo(22, -150); ctx.quadraticCurveTo(40, -146, 46, -160); };
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; bent(); ctx.stroke();
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1.5; bent(); ctx.stroke();
    slab(ctx, -20, crown - Y - 52, 40, 12, '#292524', 1);
    ctx.restore();
    // (one cable left, the other snapped and swinging)
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(tx - 8, crown); ctx.lineTo(at.x + 10, top - 40); ctx.stroke();
    const sw = Math.sin(f * 0.05) * 12;
    ctx.beginPath(); ctx.moveTo(tx + 8, crown); ctx.quadraticCurveTo(tx + 14 + sw, crown + 60, tx + 10 + sw * 1.5, crown + 110); ctx.stroke();
    // (the cage, buckled: knocked crooked, a bar bent in, scorched)
    ctx.save(); ctx.translate(at.x + m.w / 2, top); ctx.rotate(-0.05);
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2; ctx.lineCap = 'square';
    ctx.beginPath(); ctx.moveTo(-m.w / 2 + 4, 0); ctx.lineTo(-m.w / 2 + 6, -40); ctx.lineTo(m.w / 2 - 14, -38); ctx.quadraticCurveTo(m.w / 2 - 2, -30, m.w / 2 - 6, -18); ctx.moveTo(m.w / 2 - 4, 0); ctx.lineTo(m.w / 2 - 8, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-m.w / 2 + 6, -20); ctx.quadraticCurveTo(0, -12, m.w / 2 - 8, -20); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
  } else {
    // (the little derrick on the back of it, bent over and snapped off short)
    ctx.save(); ctx.translate(at.x + 34, top); ctx.rotate(-0.45);
    strut(ctx, -20, 0, -4, -64, 2, '#52525B'); strut(ctx, 20, 0, 6, -58, 2, '#52525B');
    ctx.strokeStyle = '#52525B';
    ctx.lineWidth = 1; for (let k = 0; k < 2; k++) { const y = -k * 26; ctx.beginPath(); ctx.moveTo(-20 + k * 6, y); ctx.lineTo(18 - k * 5, y - 26); ctx.stroke(); }
    // (the jagged top where it snapped)
    ctx.beginPath(); ctx.moveTo(-6, -64); ctx.lineTo(-2, -70); ctx.lineTo(2, -62); ctx.lineTo(7, -68); ctx.stroke();
    ctx.restore();
    // (the cable it's dragged by, frayed)
    ctx.strokeStyle = 'rgba(168, 162, 158, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(at.x + m.w, top + 8); ctx.lineTo(m.x + m.w + m.dx / 2 + 60, Y - 6); ctx.stroke();
  }
  // The deck: scorched black, planks gone, the edges curled up
  const deck = () => { ctx.beginPath(); ctx.moveTo(at.x - 3, top - 4); ctx.lineTo(at.x + 6, top); ctx.lineTo(at.x + m.w - 8, top); ctx.lineTo(at.x + m.w + 4, top - 5); ctx.lineTo(at.x + m.w, top + 12); ctx.lineTo(at.x, top + 12); ctx.closePath(); };
  // (charred in steps across it: blackest at the ends, the middle less so)
  ctx.save(); deck(); ctx.clip();
  const tones = ['#1C1917', '#27272A', '#3F3F46', '#27272A', '#18181B'];
  tones.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(at.x - 4 + Math.floor((m.w + 8) * i / 5), top - 6, Math.ceil((m.w + 8) / 5) + 1, 20); });
  for (let i = 1; i < 5; i++) checker(ctx, at.x - 4 + Math.floor((m.w + 8) * i / 5) - 2, top - 6, 4, 20, tones[i - 1]);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; deck(); ctx.stroke();
  // (the holes where the planks were: the dark under it showing through)
  for (let k = 0; k < 3; k++) { const hx = at.x + 14 + k * (m.w - 30) / 2 + hash(k + m.x) * 8; ctx.fillStyle = '#050505'; ctx.fillRect(hx, top + 2, 9, 7); ctx.fillStyle = '#78350F'; ctx.fillRect(hx - 1, top + 1, 2, 9); }
  ctx.fillStyle = 'rgba(234, 88, 12, 0.6)'; ctx.fillRect(at.x + 6, top, m.w - 14, 1); checker(ctx, at.x + 6, top + 1, m.w - 14, 2, 'rgba(234, 88, 12, 0.5)');
  // (a fire still going at one corner of it, smoke off it, and every so often sparks)
  drawFire(ctx, at.x + m.w - 14, top + 1, 24, 22, f, { seed: Math.floor(m.x), glow: 0.6 });
  if (f % 6 === 0) state.particles.push({ pos: { x: at.x + m.w - 12, y: top - 12 }, vel: { x: -0.3, y: -1.2 - Math.random() }, life: 45, color: 'rgba(28, 25, 23, 0.5)', size: 6 + Math.random() * 6 });
  if (f % 40 < 3) state.particles.push({ pos: { x: at.x + 8 + Math.random() * (m.w - 16), y: top + 12 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2 }, life: 16, color: '#FDE047', size: 2 });
};

/** The vents, in the ground: a rusted wellhead stub, crude caked round it; bubbling before it goes; a little fire on it, lit. */
export const drawGeyserVents = (ctx: Ctx, state: GameState, fld: Field) => {
  const f = state.frame;
  for (const g of fld.geysers) {
    if (!inView(state, g.x - 60, g.x + 60)) continue;
    const warn = geyserWarning(g, f);
    const shake = warn ? (Math.random() - 0.5) * 2 : 0;
    // (the crude caked round it, a sheen on it; the wellhead stub, rusted, its flange bolted on top)
    ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(g.x, g.y - 1, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(g.x - 4, g.y - 2, 24, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'; ctx.fillRect(Math.round(g.x - 18), g.y - 3, 8, 1); ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.fillRect(Math.round(g.x - 10), g.y - 3, 8, 1);
    post(ctx, Math.round(g.x - 10 + shake), g.y - 12, 20, 12, '#78350F');
    ctx.fillStyle = '#451A03'; ctx.fillRect(Math.round(g.x - 4 + shake), g.y - 8, 4, 6);
    slab(ctx, Math.round(g.x - 13 + shake), g.y - 15, 26, 5, '#44403C', 1);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(Math.round(g.x - 10 + shake), g.y - 14, 2, 2); ctx.fillRect(Math.round(g.x + 8 + shake), g.y - 14, 2, 2);
    // (a crack out from it, wider as it's about to go)
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = warn ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(g.x - 14, g.y - 1); ctx.lineTo(g.x - 30, g.y - 3); ctx.moveTo(g.x + 14, g.y - 1); ctx.lineTo(g.x + 28, g.y - 2); ctx.stroke();
    if (warn) for (let k = 0; k < 3; k++) {
      // (bubbles welling up out of it, each a little inked dome with a glint)
      const r = 2 + ((f * 0.3 + k * 5) % 6), bx = g.x - 12 + k * 12;
      ink(ctx, () => ctx.arc(bx, g.y - 16, r, Math.PI, 0), g.lit ? '#FDE047' : '#292524');
      ctx.fillStyle = g.lit ? '#FEF9C3' : '#78716C'; ctx.fillRect(Math.round(bx - r * 0.5), Math.round(g.y - 16 - r * 0.7), 2, 1);
    }
    if (g.lit && !geyserErupting(g, f)) {
      // Lit: fire licking off the top of it, waiting
      drawFire(ctx, g.x, g.y - 14, 22, 22, f, { seed: Math.floor(g.x), glow: 0.7 });
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
    steppedGlow(ctx, cx, (g.y + top) / 2, box.h * 0.8, '#F97316', 0.26, 0.04, 5);
    // In bands, red at its edges in to a white-hot heart, a blue throat at the vent; each band its own flicker
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(cx - w * 2, top - 30, w * 4, g.y - top + 30);
    const bands = [['#EA580C', 0.8, 0.04], ['#F59E0B', 0.6, 0.1], ['#FDE047', 0.42, 0.18], ['#FEF9C3', 0.24, 0.3]] as const;
    bands.forEach(([col, wk, from], li) => {
      ctx.fillStyle = col;
      for (let y = Math.floor((top + box.h * from) / 4) * 4; y < g.y; y += 4) {
        const half = w * (0.55 + (g.y - y) / box.h * 0.35) * wk + Math.sin(f * 0.7 + y * 0.15 + li * 2) * 2;
        const lx = Math.round((cx + wob(y) - half) / 2) * 2;
        ctx.fillRect(lx, y, Math.round((half * 2) / 2) * 2, 4);
      }
    });
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(Math.round(cx - w * 0.16), g.y - Math.min(18, box.h * 0.15), Math.round(w * 0.32), Math.min(18, box.h * 0.15));
    ctx.restore();
    // (licking up off the top of it)
    drawFire(ctx, cx, top + 14, w * 1.7, 34 + k * 14, f, { seed: Math.floor(g.x), glow: 0 });
    // (black smoke rolling off the top)
    for (let s = 0; s < 4; s++) pixelBlob(ctx, cx + Math.sin(f * 0.1 + s) * 16, top - 40 - s * 14 - k * 20, 12 + s * 5, 10 + s * 4, 'rgba(28, 25, 23, 0.6)');
  } else {
    // (glossy: in bands across it, black at its edges, a dark brown body, a lit streak and the rainbow of it up one side)
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(cx - w * 2, top - 30, w * 4, g.y - top + 30);
    ctx.fillStyle = '#1C1410'; ctx.fillRect(Math.round(cx - w * 0.45), top - 30, Math.round(w * 0.8), g.y - top + 30);
    checker(ctx, Math.round(cx - w * 0.45) - 2, top - 30, 2, g.y - top + 30, '#1C1410');
    ctx.fillStyle = '#2A1F18'; ctx.fillRect(Math.round(cx - w * 0.3), top - 30, 4, g.y - top + 30);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(Math.round(cx - w * 0.3), top, 2, box.h);
    ctx.fillStyle = 'rgba(167, 139, 250, 0.3)'; ctx.fillRect(Math.round(cx + w * 0.1), top, 2, box.h);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; ctx.fillRect(Math.round(cx + w * 0.1) + 2, top, 2, box.h);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; body(); ctx.stroke();
    // (slopping over at the top, the gobs of it raining back down)
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI + f * 0.05, r = 14 + hash(s + f) * 10, gr = 4 + (s % 3) * 2;
      const gx = cx + Math.cos(a) * r * 1.4, gy = top + Math.sin(a) * -r * 0.4 + (s % 3) * 6;
      ink(ctx, () => ctx.arc(gx, gy, gr, 0, Math.PI * 2), '#1C1917');
      ctx.fillStyle = '#57534E'; ctx.fillRect(Math.round(gx - gr * 0.5), Math.round(gy - gr * 0.6), 2, 2);
    }
  }
};
