// THE LAUNCH, from outside (screen space, the whole screen): the giant atom across the way (its nucleus up on its
// stilts, its three electron rings round it), the main drag below it. Out through the top of its shell they come in a
// shower of panels: the two from the sled in front, the two sleds, and him, arcing over the drag. The two of them land
// first: a long red smear down the pavement. The sleds after, in bits. Then him: a bounce, a roll, and up on his feet.
//
// Where it all lands (in the drag's own world: drag/ draws what's left there; see the ride's report): him at
// DOORS.drag.start; the smear from 140 to 460 px right of that, on the pavement; the two sleds' wrecks at 520 and 610.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay } from '../../timeOfDay';
import { lettering, letterSize } from '../square/lettering';
import { INK, box, mix, hash, slab, rampOf, bandedGradient, hazeBands, steppedGlow, bendFloor } from '../../intro/art/kit';
import { cyl, sphere } from '../atom/snes';
import { lookOf } from '../../adventure/temple/people';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the street is on screen, where the hole in the atom is, and where each of them lands. */
const STREET = 500, HOLE: [number, number] = [210, 150];
export const LAND_ME = 470, LAND_A = 560, LAND_B = 640, LAND_SLED: [number, number] = [700, 760];
/** How long it takes: the burst, the flight (each one's), the bounce and up, the hold, the fade. */
export const OUT_FLY = 95, OUT_END = 260, OUT_FADE = 30;

/** Along an arc from the hole to (lx, STREET), over `len` frames, starting at frame `t0`: where, or null before. */
const arc = (t: number, t0: number, len: number, lx: number, top = 40) => {
  const u = (t - t0) / len;
  if (u < 0) return null;
  const v = Math.min(1, u);
  return { x: HOLE[0] + (lx - HOLE[0]) * v, y: HOLE[1] + (STREET - HOLE[1]) * v - Math.sin(v * Math.PI) * (HOLE[1] - top + 80) * (1 - v * 0.2), done: u >= 1, u };
};

/** A little person (from way off), tumbling. */
const tumbler = (c: Ctx, x: number, y: number, rot: number, seed: number, him: boolean) => {
  const L = him ? null : lookOf(seed);
  c.save(); c.translate(x, y); c.rotate(rot);
  box(c, -5, -8, 10, 14, him ? '#F8FAFC' : L!.shirt);
  box(c, -4, 6, 3, 8, him ? '#1E3A8A' : L!.pants); box(c, 1, 6, 3, 8, him ? '#1E3A8A' : L!.pants);
  box(c, -9, -6, 4, 9, him ? '#F1C9A5' : L!.skin); box(c, 5, -6, 4, 9, him ? '#F1C9A5' : L!.skin);
  box(c, -5, -17, 10, 9, him ? '#F1C9A5' : L!.skin); box(c, -5, -18, 10, 3, him ? '#3F2A1A' : L!.hair);
  c.restore();
};
/** A star sled from way off, tumbling (in bits, `wreck`). */
const littleSled = (c: Ctx, x: number, y: number, rot: number, stripe: string, wreck: boolean) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (wreck) { box(c, -20, -6, 18, 8, '#E5E7EB'); box(c, 4, -4, 16, 6, '#E5E7EB'); box(c, -14, -3, 10, 2, stripe); box(c, 8, -2, 8, 2, stripe); }
  else { box(c, -24, -7, 48, 12, '#E5E7EB'); box(c, -24, -2, 48, 3, stripe); box(c, 20, -5, 10, 8, '#E5E7EB'); }
  c.restore();
};

/** The giant atom: the nucleus (a ball of balls) up on stilts, the three rings round it (chaser bulbs along them); the
 *  hole in its top, once burst. Stepped, inked; a haze along its foot. */
const drawAtom = (c: Ctx, t: number) => {
  const [cx, cy] = [210, 250];
  // (the stilts, braced)
  for (const sx of [-80, 0, 80]) cyl(c, cx + sx - 7, cy + 60, 14, STREET - cy - 60, '#94A3B8', 'y');
  for (const [a, b] of [[-80, 0], [0, 80]]) for (const [lw, col] of [[4, INK], [2, '#64748B']] as const) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.moveTo(cx + a, cy + 90); c.lineTo(cx + b, STREET - 20); c.moveTo(cx + b, cy + 90); c.lineTo(cx + a, STREET - 20); c.stroke(); }
  const ring = (front: boolean) => {
    for (const a of [0, 1.05, -1.05]) for (const [lw, col] of (front ? [[12, INK], [9, '#94A3B8'], [5, '#CBD5E1'], [2, '#F8FAFC']] : [[12, INK], [9, '#334155'], [5, '#475569'], [2, '#64748B']]) as [number, string][]) {
      c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.ellipse(cx, cy, 190, 54, a, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke();
    }
    // (the chaser bulbs along each ring)
    for (const [ri, a] of [0, 1.05, -1.05].entries()) for (let k = 0; k < 14; k++) {
      const th = (front ? 0 : Math.PI) + (k + 0.5) / 14 * Math.PI, ex = Math.cos(th) * 190, ey = Math.sin(th) * 54;
      const x = cx + ex * Math.cos(a) - ey * Math.sin(a), y = cy + ex * Math.sin(a) + ey * Math.cos(a), on = (k + ri + (t >> 2)) % 3 === 0;
      box(c, x - 1, y - 1, 3, 3, on ? '#FEF9C3' : front ? '#64748B' : '#334155');
    }
  };
  ring(false);
  // (the nucleus)
  for (const [dx, dy, r, col] of [[-40, 20, 58, '#B91C1C'], [40, 20, 58, '#1D4ED8'], [0, -30, 62, '#DC2626'], [-30, -10, 50, '#2563EB'], [30, -20, 54, '#B91C1C']] as const) sphere(c, cx + dx, cy + dy, r, col);
  // (the hole they come out of, and its panels flying)
  if (t > 4) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(HOLE[0], HOLE[1] + 30, 37, 21, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#020617'; c.beginPath(); c.ellipse(HOLE[0], HOLE[1] + 30, 34, 18, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; box(c, HOLE[0] + Math.cos(a) * 34 - 3, HOLE[1] + 30 + Math.sin(a) * 18 - 3, 6, 6, k % 2 ? '#7F1D1D' : '#B91C1C'); }
    for (let k = 0; k < 10; k++) {
      const u = (t - 4) * (0.9 + hash(k) * 0.6);
      const px = HOLE[0] + (hash(k * 3) - 0.4) * u * 3, py = HOLE[1] + 30 - u * (3 + hash(k * 7) * 3) + 0.04 * u * u;
      if (py < H) { const col = k % 2 ? '#DC2626' : '#2563EB'; box(c, px - 1, py - 1, 10, 7, INK); box(c, px, py, 8, 5, col); box(c, px, py, 8, 2, mix(col, '#FFFFFF', 0.35)); }
    }
    if (t < 40) steppedGlow(c, HOLE[0], HOLE[1] + 20, 30 + t * 1.6, '#FDE047', 0.7 * (1 - t / 40), 0.05, 5);
  }
  ring(true);
  // (its name the square's way (square/sky.ts): a dark plate bolted across the middle stilt, the words in neon tubes)
  const [lw, lh] = letterSize('THE GIANT ATOM', 'neon'), py = STREET - 73, plate = '#2A0650';
  box(c, cx - lw / 2 - 6, py - lh / 2 - 4, lw + 12, lh + 8, INK); box(c, cx - lw / 2 - 4, py - lh / 2 - 2, lw + 8, lh + 4, plate); box(c, cx - lw / 2 - 4, py - lh / 2 - 2, lw + 8, 1, '#7A3AAE');
  for (const bx of [cx - lw / 2 - 3, cx + lw / 2 + 1]) { box(c, bx, py - 1, 2, 2, '#4A5A70'); box(c, bx, py - 1, 1, 1, '#CDD6E2'); }
  lettering(c, 'THE GIANT ATOM', cx, py, 'neon', timeOfDay().lamps > 0.3 ? '#F0ABFC' : '#F5D0FE', plate);
};

/** The main drag (googie fronts, their sides in perspective toward the middle of the screen; the pavement, bent). */
const EYE = W / 2;
const drawDrag = (c: Ctx) => {
  const fronts = [0, 1, 2, 3, 4].map(k => ({ x: 380 + k * 90, h: 70 + (k % 3) * 30, col: ['#F472B6', '#2DD4BF', '#FBBF24', '#A78BFA', '#60A5FA'][k] }));
  // (their sides first, all of them: every front stands in front of every side)
  for (const b of fronts) {
    const near = b.x + 40 < EYE ? b.x + 80 : b.x, sw = Math.round(Math.abs(near - EYE) * 0.12), d = near < EYE ? 1 : -1;
    if (sw < 2) continue;
    const top = STREET - b.h, r = rampOf(b.col);
    c.fillStyle = INK; c.beginPath(); c.moveTo(near, top - 1); c.lineTo(near + d * sw, top + sw * 0.3 - 1); c.lineTo(near + d * sw, STREET); c.lineTo(near, STREET); c.closePath(); c.fill();
    c.fillStyle = r[1]; c.beginPath(); c.moveTo(near, top + 1); c.lineTo(near + d * (sw - 1), top + sw * 0.3 + 1); c.lineTo(near + d * (sw - 1), STREET); c.lineTo(near, STREET); c.closePath(); c.fill();
  }
  for (const b of fronts) {
    const top = STREET - b.h;
    slab(c, b.x, top, 80, b.h, b.col);
    box(c, b.x + 8, top + 12, 64, 22, INK); bandedGradient(c, b.x + 9, top + 13, 62, 20, ['#F0F9FF', '#BAE6FD', '#7DD3FC'], 3);
    box(c, b.x + 30, STREET - 30, 20, 30, INK); box(c, b.x + 31, STREET - 29, 18, 29, '#0F172A');
    // (the googie roof: a boomerang, banded)
    c.save(); c.beginPath(); c.moveTo(b.x - 10, top + 1); c.lineTo(b.x + 40, top - 20); c.lineTo(b.x + 90, top + 1); c.closePath(); c.fillStyle = INK; c.fill(); c.clip();
    bandedGradient(c, b.x - 10, top - 20, 100, 22, ['#FFFFFF', '#E2E8F0', '#94A3B8'], 3);
    c.restore();
  }
  hazeBands(c, 0, STREET - 40, W, 40, '#E0F2FE', 0, 0.16, 4);
  // (the pavement: banded, the curb, the lane's dashes; bent toward the eye)
  bandedGradient(c, 0, STREET, W, H - STREET, ['#64748B', '#475569', '#334155'], 6);
  box(c, 0, STREET, W, 4, '#CBD5E1'); box(c, 0, STREET + 4, W, 2, '#94A3B8');
  for (let x = 20; x < W; x += 80) { box(c, x, STREET + 50, 40, 4, '#FACC15'); box(c, x, STREET + 50, 40, 1, '#FEF08A'); }
  bendFloor(c, { x: EYE }, STREET, STREET + 6, H);
};

/** The whole outside shot, `t` frames in (0..OUT_END). */
export const drawLaunchOutside = (c: Ctx, state: GameState, t: number) => {
  drawTodSky(c, 0, 0, W, H, ['#1E3A8A', '#3B82F6', '#93C5FD', '#E0F2FE'], { horizon: STREET, sun: [640, 110], moon: [120, 80] });
  drawAtom(c, t);
  drawDrag(c);
  // The two of them (first out, first down: the smear), the sleds (in bits), him (a bounce, a roll, up)
  const a = arc(t, 6, OUT_FLY - 10, LAND_A), b = arc(t, 10, OUT_FLY - 6, LAND_B);
  // (the smear: from where the first hit, skidding on to where the last of them stops)
  const firstDown = 6 + OUT_FLY - 10;
  if (t > firstDown) {
    const k = Math.min(1, (t - firstDown) / 14);
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(LAND_A + (LAND_B + 60 - LAND_A) * k / 2, STREET + 10, 20 + (LAND_B + 60 - LAND_A) * k / 2, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(LAND_A + (LAND_B + 60 - LAND_A) * k / 2, STREET + 8, 14 + (LAND_B + 40 - LAND_A) * k / 2, 6, 0, 0, Math.PI * 2); c.fill();
    for (let j = 0; j < 9; j++) box(c, LAND_A - 10 + hash(j) * (LAND_B + 70 - LAND_A) * k, STREET + 2 + hash(j * 5) * 12, 4 + hash(j * 2) * 5, 3, j % 3 ? '#DC2626' : '#FCA5A5');
    // (a shoe, a fanny pack, somebody's ears hat)
    if (k >= 1) { box(c, LAND_B + 50, STREET + 4, 8, 4, '#F8FAFC'); box(c, LAND_A + 30, STREET + 6, 10, 5, '#7C3AED'); c.fillStyle = '#1E3A8A'; c.beginPath(); c.arc(LAND_B + 10, STREET + 6, 4, 0, Math.PI * 2); c.arc(LAND_B + 20, STREET + 6, 4, 0, Math.PI * 2); c.fill(); }
  }
  if (a && !a.done) tumbler(c, a.x, a.y, t * 0.3, 8811, false);
  if (b && !b.done) tumbler(c, b.x, b.y, -t * 0.35, 9922, false);
  const s1 = arc(t, 14, OUT_FLY, LAND_SLED[0]), s2 = arc(t, 18, OUT_FLY, LAND_SLED[1]);
  if (s1) littleSled(c, s1.x, s1.done ? STREET - 3 : s1.y, s1.done ? 0.1 : t * 0.2, '#DC2626', s1.done);
  if (s2) littleSled(c, s2.x, s2.done ? STREET - 3 : s2.y, s2.done ? -0.1 : -t * 0.25, '#2563EB', s2.done);
  // (him: a bounce off the pavement, a roll, up on his feet)
  const m = arc(t, 20, OUT_FLY + 8, LAND_ME);
  if (m) {
    const down = 20 + OUT_FLY + 8;
    if (!m.done) tumbler(c, m.x, m.y, t * 0.4, 0, true);
    else {
      const u = t - down;
      if (u < 26) tumbler(c, LAND_ME - u * 1.2, STREET - 12 - Math.sin((u / 26) * Math.PI) * 40, u * 0.5, 0, true);
      else if (u < 40) tumbler(c, LAND_ME - 31 - (u - 26), STREET - 6, Math.PI / 2 + (u - 26) * 0.3, 0, true);
      else tumbler(c, LAND_ME - 45, STREET - 14, 0, 0, true);
    }
  }
  if (t > OUT_END - OUT_FADE) { c.fillStyle = `rgba(0,0,0,${Math.min(1, (t - (OUT_END - OUT_FADE)) / OUT_FADE)})`; c.fillRect(0, 0, W, H); }
  void state;
};
/** When each one hits the pavement (frames into the shot): the two of them, him. */
export const OUT_SPLAT = 6 + OUT_FLY - 10, OUT_LAND_ME = 20 + OUT_FLY + 8;
