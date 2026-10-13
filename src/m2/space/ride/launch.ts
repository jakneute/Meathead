// THE LAUNCH, from outside (screen space, the whole screen): the giant atom across the way (its nucleus up on its
// stilts, its three electron rings round it), the main drag below it. Out through the top of its shell they come in a
// shower of panels: the two from the sled in front, the two sleds, and him, arcing over the drag. The two of them land
// first: a long red smear down the pavement. The sleds after, in bits. Then him: a bounce, a roll, and up on his feet.
//
// Where it all lands (in the drag's own world: drag/ draws what's left there; see the ride's report): him at
// DOORS.drag.start; the smear from 140 to 460 px right of that, on the pavement; the two sleds' wrecks at 520 and 610.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky } from '../../timeOfDay';
import { INK, box, text, mix, hash } from '../../intro/art/kit';
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

/** The giant atom: the nucleus (a ball of balls) up on stilts, the three rings round it; the hole in its top, once burst. */
const drawAtom = (c: Ctx, t: number) => {
  const [cx, cy] = [210, 250];
  for (const sx of [-80, 0, 80]) box(c, cx + sx - 6, cy + 60, 12, STREET - cy - 60, '#94A3B8');
  // (the rings: the back half behind it)
  c.lineWidth = 9; c.strokeStyle = '#64748B';
  for (const a of [0, 1.05, -1.05]) { c.beginPath(); c.ellipse(cx, cy, 190, 54, a, Math.PI, Math.PI * 2); c.stroke(); }
  // (the nucleus)
  for (const [dx, dy, r, col] of [[-40, 20, 58, '#B91C1C'], [40, 20, 58, '#1D4ED8'], [0, -30, 62, '#DC2626'], [-30, -10, 50, '#2563EB'], [30, -20, 54, '#B91C1C']] as const) {
    c.fillStyle = INK; c.beginPath(); c.arc(cx + dx, cy + dy, r + 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, '#FFFFFF', 0.35); c.beginPath(); c.arc(cx + dx - r * 0.35, cy + dy - r * 0.35, r * 0.3, 0, Math.PI * 2); c.fill();
  }
  // (the hole they come out of, and its panels flying)
  if (t > 4) {
    c.fillStyle = '#020617'; c.beginPath(); c.ellipse(HOLE[0], HOLE[1] + 30, 34, 18, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 10; k++) {
      const u = (t - 4) * (0.9 + hash(k) * 0.6);
      const px = HOLE[0] + (hash(k * 3) - 0.4) * u * 3, py = HOLE[1] + 30 - u * (3 + hash(k * 7) * 3) + 0.04 * u * u;
      if (py < H) box(c, px, py, 8, 5, k % 2 ? '#DC2626' : '#2563EB');
    }
    if (t < 40) for (let k = 0; k < 8; k++) { c.fillStyle = `rgba(253, 224, 71, ${0.6 * (1 - t / 40)})`; c.beginPath(); c.arc(HOLE[0] + (hash(k) - 0.5) * 60, HOLE[1] + 20 - hash(k * 2) * 30, 10 + t * 0.6, 0, Math.PI * 2); c.fill(); }
  }
  // (the rings' front half, over it)
  c.lineWidth = 9; c.strokeStyle = '#CBD5E1';
  for (const a of [0, 1.05, -1.05]) { c.beginPath(); c.ellipse(cx, cy, 190, 54, a, 0, Math.PI); c.stroke(); }
  text(c, 'THE GIANT ATOM', cx, STREET - 70, '#F8FAFC', 8);
};

/** The main drag (googie fronts, the pavement). */
const drawDrag = (c: Ctx) => {
  for (let k = 0; k < 5; k++) {
    const x = 380 + k * 90, h = 70 + (k % 3) * 30;
    box(c, x, STREET - h, 80, h, ['#F472B6', '#2DD4BF', '#FBBF24', '#A78BFA', '#60A5FA'][k]);
    box(c, x + 8, STREET - h + 12, 64, 20, '#E0F2FE');
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(x - 8, STREET - h); c.lineTo(x + 40, STREET - h - 18); c.lineTo(x + 88, STREET - h); c.closePath(); c.fill();
  }
  box(c, 0, STREET, W, H - STREET, '#475569'); box(c, 0, STREET, W, 4, '#CBD5E1');
  for (let x = 20; x < W; x += 80) box(c, x, STREET + 50, 40, 4, '#FACC15');
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
