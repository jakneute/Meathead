// The flight's world (Cuphead's Djimmi framing): a giant GLOBE across the bottom of the screen, turning under the
// helicopter the whole time (oceans, the continents going by, the curve of it), the sky by the hour above it with
// clouds streaming past, and the landmarks standing on it: the one he's fighting in front, upright; the ones still to
// come further round ahead (smaller: further off), coming round into place one at a time as each is beaten; the
// wrecks rolling away behind (they stay on the globe: Harry's arena has them all).

import type { GameState } from '../../../m1/game/core/state';
import { drawTodSky, farTint, hourMix } from '../../timeOfDay';
import { heliOf, type Heli } from './state';
import { GLOBE, THETA_F, onGlobe, CAMX, CY, W, H } from './geo';
import { MECHS } from './lines';
import { drawMech } from './mechArt';

type Ctx = CanvasRenderingContext2D;
const SKY = ['#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#FDE68A'];

/** How far up out of view the globe's sunk (the lift: it comes up from under as he climbs; 1 there). */
export const globeRise = (h: Heli) => (h.phase === 'lift' ? Math.max(0, Math.min(1, (h.t - 60) / 140)) : 1);
const sink = (h: Heli) => (1 - globeRise(h)) * 520;

/** A landmark's place on the globe for `s` (0: in front, fighting; more: further round ahead; less: rolled away). */
export const slot = (s: number) => {
  const t = s >= 0 ? THETA_F + s * 0.13 : THETA_F + s * 0.6;
  const p = onGlobe(t);
  return { x: p.x, y: p.y, scale: s >= 0 ? 1 / (1 + s * 1.3) : 1, rot: s >= 0 ? t * Math.min(1, s * 3) : t };
};

/** Screen: the sky, the clouds streaming by, the globe. */
export const drawFlightBackdrop = (c: Ctx, state: GameState) => {
  const h = heliOf(state), f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: H, sun: [620, 110], moon: [170, 90] });
  // (high cloud, slow; low cloud, fast: they stream left, he's going somewhere)
  for (let i = 0; i < 9; i++) {
    const near = i % 3 === 0, sp = near ? 2.4 : 0.8, y = 60 + ((i * 67) % 330), x = ((i * 191 - f * sp) % (W + 300) + W + 300) % (W + 300) - 150;
    c.fillStyle = farTint('#F8FAFC', near ? 0.3 : 0.75);
    for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * (near ? 34 : 22), y + (k % 2) * 6, (near ? 26 : 16) - Math.abs(k - 1.5) * 4, 0, Math.PI * 2); c.fill(); }
  }
  // (speed streaks)
  c.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 10; i++) { const y = (i * 53) % 440 + 20, x = ((i * 337 - f * 9) % (W + 200) + W + 200) % (W + 200) - 100; c.fillRect(x, y, 40 + (i % 3) * 20, 1); }
  drawGlobe(c, h, f);
};

const drawGlobe = (c: Ctx, h: Heli, f: number) => {
  const { cx, r } = GLOBE, cy = GLOBE.cy + sink(h);
  if (cy - r > H + 20) return;
  // (its glow, the atmosphere's rim)
  c.fillStyle = farTint('#BFDBFE', 0.5); c.beginPath(); c.arc(cx, cy, r + 18, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#93C5FD', 0.4); c.beginPath(); c.arc(cx, cy, r + 8, 0, Math.PI * 2); c.fill();
  // (the ocean, banded darker down into it)
  const sea = [hourMix('#2563EB', '#7C3AED', '#1E293B'), hourMix('#1D4ED8', '#6D28D9', '#172033'), hourMix('#1E40AF', '#5B21B6', '#0F172A')];
  for (let k = 0; k < 3; k++) { c.fillStyle = sea[k]; c.beginPath(); c.arc(cx, cy, r - k * 40, 0, Math.PI * 2); c.fill(); }
  // (the continents going by: blobs along the curve, turning with it)
  const spin = h.spin + h.prog * 0.6;
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < 14; i++) {
    const a = ((i * 0.83 - spin) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI, d = 30 + ((i * 47) % 110);
    if (Math.abs(a) > 0.9) continue;
    const x = cx + Math.sin(a) * (r - d), y = cy - Math.cos(a) * (r - d), w = 50 + ((i * 31) % 70);
    c.fillStyle = hourMix(i % 3 ? '#16A34A' : '#CA8A04', '#7C6A3A', '#1E3A2A');
    c.beginPath(); c.ellipse(x, y, w, w * 0.32, a, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x + w * 0.4, y + 6, w * 0.5, w * 0.2, a, 0, Math.PI * 2); c.fill();
    c.fillStyle = hourMix('#4ADE80', '#A3A36A', '#2A4A38'); c.beginPath(); c.ellipse(x - w * 0.2, y - 3, w * 0.5, w * 0.12, a, 0, Math.PI * 2); c.fill();
  }
  // (latitude lines, faint; the shine on top)
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 2;
  for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(cx, cy, r - k * 55, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); c.ellipse(cx - 120, cy - r + 30, 260, 18, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  c.strokeStyle = '#0F172A'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  void f;
};

/** World (behind everything): the landmarks on the globe. */
export const drawLandmarks = (c: Ctx, state: GameState) => {
  const h = heliOf(state), f = state.frame, dy = sink(h);
  const awake = h.turned;
  const order = MECHS.map((id, i) => ({ id, i, s: i - h.prog })).filter(o => o.s < 3.4 && o.s > -1.6).sort((a, b) => b.s - a.s);
  for (const o of order) {
    const p = slot(o.s), m = h.mechs[o.i];
    if (p.x - 260 * p.scale > W + 60) continue;
    const wreck = m?.st === 'dead';
    drawMech(c, o.id, CAMX + p.x, CY + p.y + dy, p.scale, p.rot, { awake, f: f + o.i * 37, m, wreck, flash: (m?.flash ?? 0) > 0 });
  }
};
