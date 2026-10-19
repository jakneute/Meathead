// THE GREAT PIXIE'S CASTLE: Fairy Land's monument (the user's: "a visible background element that gets progressively
// closer the whole stage. not mode 7 closer but a new scene, its background element is larger"). One shared painter,
// drawn in every section's far layer at that section's own size: small and far off over the town square's roofs,
// bigger over the fairy wheel, bigger again from the glen and the ride, looming over the castle's base (its top out of
// the picture). Within a section it drifts slowly across the sky as he goes (from right of middle toward the left), so
// it's always there.
//
// A fairy-tale castle on a snowy crag (Cinderella's spires on Hogwarts' bones, parodied): pale lavender stone in
// steps, a curtain wall with its crenellations and gate, round towers under blue cone roofs banded in gold with pink
// pennants, a tall gothic keep, and over it all the highest spire with the highest window: PIPER'S (the bedroom the
// broomstick flies in through, at the end): pink stained glass, glowing. Crude-but-readable (the first pass), painted
// once per hour and size (a stamp, timeOfDay's key: lit windows after dark); the sparkles round the top drawn live.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { stamp } from '../../m1/game/render/stamp';
import { timeOfDay, farTint, type TimeOfDay } from '../timeOfDay';
import { SECTIONS, type FantasyId } from './geometry';

type Ctx = CanvasRenderingContext2D;

/** Where the castle sits in a section's sky: its size (`k`: 1 is ~340 px tall), the screen x its middle drifts from
 *  (the section's start) to (its end), and the screen y of the crag's foot. */
export interface MonumentAt { id: FantasyId; k: number; from: number; to: number; base: number }

/** Each section's castle (bigger every section: the user's). The broomstick and the bedroom have their own views. */
export const MONUMENT_AT: Record<FantasyId, MonumentAt> = {
  square: { id: 'square', k: 0.42, from: 590, to: 330, base: 420 },
  wheel: { id: 'wheel', k: 0.6, from: 560, to: 360, base: 428 },
  glen: { id: 'glen', k: 0.82, from: 580, to: 300, base: 436 },
  tragons: { id: 'tragons', k: 1.05, from: 560, to: 320, base: 444 },
  keep: { id: 'keep', k: 1.75, from: 470, to: 360, base: 470 },
  broom: { id: 'broom', k: 2.2, from: 400, to: 400, base: 520 },
  bedroom: { id: 'bedroom', k: 2.6, from: 400, to: 400, base: 560 },
};

/** The highest window (Piper's), from the crag's foot at k 1 (x across, y up negative). */
export const PIPER_WINDOW = { x: 6, y: -318 };

const INK = '#1A1028';
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const poly = (g: Ctx, col: string, pts: number[]) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };

/** Stone, roof, gold, pink, rock, snow: each in steps (light to dark), pushed into the distance and the hour. */
const pal = (tod: TimeOfDay) => {
  const T = (c: string) => farTint(c, 0.55, tod);
  return {
    stone: ['#F4EEFA', '#DCD2EC', '#BCAED6', '#9484B4', '#6A5A8C'].map(T),
    roof: ['#7AA8F0', '#4A78D4', '#2E52A8', '#1E3678'].map(T),
    slate: ['#6A7290', '#4C5270', '#343A54'].map(T),
    gold: ['#FFF0A0', '#F2C84A', '#C8962A'].map(T),
    pink: ['#FFD0E8', '#F49AC8', '#D8609E'].map(T),
    rock: ['#9A98B0', '#76748E', '#56546E', '#3A3852'].map(T),
    snow: ['#FFFFFF', '#E6ECF8', '#C4CCE4'].map(T),
    window: tod.lamps > 0.3 ? ['#FFE9A8', '#F6B848'] : [T('#3A3060'), T('#2A2048')],
  };
};

/** A round tower: its stone in steps (lit left, shaded right), arrow slits, a crenellated or plain top, its cone roof
 *  banded in gold, a gold finial and a pink pennant. (cx, foot) the foot's middle, w across, h tall to the roof. */
const tower = (g: Ctx, P: ReturnType<typeof pal>, cx: number, foot: number, w: number, h: number, roofH: number, opts: { slate?: boolean; flag?: boolean; windows?: number } = {}) => {
  const x = cx - w / 2, top = foot - h, S = P.stone;
  box(g, x - 1, top - 1, w + 2, h + 1, INK);
  box(g, x, top, w, h, S[1]); box(g, x, top, w * 0.22, h, S[0]); box(g, x + w * 0.62, top, w * 0.2, h, S[2]); box(g, x + w * 0.82, top, w * 0.18, h, S[3]);
  // (the courses: a mortar line every so often)
  for (let y = top + 6; y < foot - 2; y += 7) box(g, x, y, w, 1, S[2]);
  // (a corbelled band under the roof)
  box(g, x - 3, top - 4, w + 6, 5, INK); box(g, x - 2, top - 3, w + 4, 3, S[0]); box(g, x - 2, top, w + 4, 1, S[3]);
  // (windows: tall, arched, lit after dark)
  const n = opts.windows ?? Math.max(1, Math.floor(h / 40));
  for (let i = 0; i < n; i++) {
    const wy = top + 14 + i * (h - 20) / Math.max(1, n), ww = Math.max(3, w * 0.18), wx = cx - ww / 2;
    box(g, wx - 1, wy - 1, ww + 2, ww * 2.2 + 2, INK); box(g, wx, wy, ww, ww * 2.2, P.window[1]); box(g, wx, wy, ww * 0.5, ww * 2.2, P.window[0]);
  }
  // (the roof: a cone in three steps, gold bands, the finial, the pennant)
  const R = opts.slate ? P.slate : P.roof, rb = top - 3, rw = w / 2 + 5;
  poly(g, INK, [cx - rw - 1, rb + 1, cx, rb - roofH - 2, cx + rw + 1, rb + 1]);
  poly(g, R[1], [cx - rw, rb, cx, rb - roofH, cx + rw, rb]);
  poly(g, R[0], [cx - rw, rb, cx, rb - roofH, cx - rw * 0.45, rb]);
  poly(g, R[2], [cx + rw * 0.35, rb, cx, rb - roofH, cx + rw, rb]);
  if (!opts.slate) for (const k of [0.3, 0.62]) { const yb = rb - roofH * k, hw = rw * (1 - k); box(g, cx - hw, yb, hw * 2, 2, P.gold[1]); box(g, cx - hw, yb, hw * 0.6, 1, P.gold[0]); }
  box(g, cx - 1, rb - roofH - 7, 2, 7, P.gold[2]); g.fillStyle = P.gold[1]; g.beginPath(); g.arc(cx, rb - roofH - 8, 2, 0, Math.PI * 2); g.fill();
  if (opts.flag !== false) { poly(g, P.pink[1], [cx + 1, rb - roofH - 14, cx + 14, rb - roofH - 11, cx + 1, rb - roofH - 8]); box(g, cx, rb - roofH - 16, 1, 10, INK); }
};

/** The whole castle, its crag's foot at (0, 0), facing us, k 1. */
const paintCastle = (g: Ctx, tod: TimeOfDay) => {
  const P = pal(tod);
  // THE CRAG: a snowy rock under it all, in steps
  poly(g, INK, [-172, 1, -150, -40, -110, -70, -60, -84, 60, -86, 112, -66, 150, -36, 172, 1]);
  poly(g, P.rock[1], [-170, 0, -148, -40, -108, -68, -60, -82, 60, -84, 110, -64, 148, -36, 170, 0]);
  poly(g, P.rock[0], [-170, 0, -148, -40, -108, -68, -60, -82, -40, -82, -90, -40, -120, 0]);
  poly(g, P.rock[2], [60, -84, 110, -64, 148, -36, 170, 0, 90, 0, 80, -40]);
  poly(g, P.rock[3], [120, -40, 148, -36, 170, 0, 136, 0]);
  for (const [x, y, w] of [[-140, -42, 30], [-104, -68, 40], [-56, -82, 60], [40, -84, 46], [100, -64, 28]]) { box(g, x, y, w, 4, P.snow[0]); box(g, x + 4, y + 4, w - 10, 2, P.snow[1]); }
  // THE CURTAIN WALL: crenellated, the gate in the middle
  const wy = -84, wallH = 46, S = P.stone;
  box(g, -131, wy - wallH - 1, 262, wallH + 2, INK);
  box(g, -130, wy - wallH, 260, wallH, S[1]); box(g, -130, wy - wallH, 260, 4, S[0]); box(g, -130, wy - 6, 260, 6, S[2]);
  for (let y = wy - wallH + 8; y < wy - 4; y += 8) for (let x = -130 + ((y / 8) % 2) * 9; x < 128; x += 18) box(g, x, y, 1, 7, S[2]);
  for (let x = -130; x < 130; x += 12) { box(g, x - 1, wy - wallH - 9, 8, 9, INK); box(g, x, wy - wallH - 8, 6, 8, S[0]); box(g, x + 4, wy - wallH - 8, 2, 8, S[2]); }
  // (the gate: an arch, the portcullis, a gold crest over it)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-17, wy); g.lineTo(-17, wy - 26); g.arc(0, wy - 26, 17, Math.PI, 0); g.lineTo(17, wy); g.closePath(); g.fill();
  g.fillStyle = P.slate[2]; g.beginPath(); g.moveTo(-14, wy); g.lineTo(-14, wy - 26); g.arc(0, wy - 26, 14, Math.PI, 0); g.lineTo(14, wy); g.closePath(); g.fill();
  for (let x = -12; x <= 12; x += 4) box(g, x, wy - 38, 1, 38, P.gold[2]);
  for (let y = wy - 34; y < wy; y += 5) box(g, -14, y, 28, 1, P.gold[2]);
  g.fillStyle = P.pink[1]; g.beginPath(); g.moveTo(0, wy - 54); g.lineTo(6, wy - 48); g.lineTo(0, wy - 42); g.lineTo(-6, wy - 48); g.closePath(); g.fill();
  // THE TOWERS behind the wall (far ones first, slate-roofed: the Hogwarts bones), then the near ones
  tower(g, P, -96, wy - 30, 22, 110, 34, { slate: true, flag: false });
  tower(g, P, 92, wy - 30, 22, 124, 36, { slate: true, flag: false });
  // THE KEEP: tall, gothic, a rose window, its own crenellations
  const kx = -44, kw = 88, kTop = wy - 196;
  box(g, kx - 1, kTop - 1, kw + 2, 196 - wallH + 2, INK);
  box(g, kx, kTop, kw, 196 - wallH, S[1]); box(g, kx, kTop, kw * 0.2, 196 - wallH, S[0]); box(g, kx + kw * 0.66, kTop, kw * 0.18, 196 - wallH, S[2]); box(g, kx + kw * 0.84, kTop, kw * 0.16, 196 - wallH, S[3]);
  for (let y = kTop + 8; y < wy - wallH; y += 8) box(g, kx, y, kw, 1, S[2]);
  for (let x = kx; x < kx + kw; x += 11) { box(g, x - 1, kTop - 8, 8, 8, INK); box(g, x, kTop - 7, 6, 7, S[0]); }
  g.fillStyle = INK; g.beginPath(); g.arc(0, kTop + 38, 15, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.pink[2]; g.beginPath(); g.arc(0, kTop + 38, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.window[0]; for (let a = 0; a < 8; a++) { g.beginPath(); g.arc(Math.cos(a * Math.PI / 4) * 7, kTop + 38 + Math.sin(a * Math.PI / 4) * 7, 3, 0, Math.PI * 2); g.fill(); }
  for (const wx of [-30, 22]) for (const wyy of [kTop + 70, kTop + 106]) { box(g, wx - 1, wyy - 1, 10, 24, INK); box(g, wx, wyy, 8, 22, P.window[1]); box(g, wx, wyy, 4, 22, P.window[0]); g.fillStyle = INK; g.beginPath(); g.arc(wx + 4, wyy, 5, Math.PI, 0); g.fill(); g.fillStyle = P.window[1]; g.beginPath(); g.arc(wx + 4, wyy + 1, 4, Math.PI, 0); g.fill(); }
  // (the near round towers, either side of the keep, and the wall's corner towers)
  tower(g, P, -62, wy - wallH + 4, 26, 150, 46);
  tower(g, P, 62, wy - wallH + 4, 26, 132, 42);
  tower(g, P, -128, wy + 2, 30, 74, 30);
  tower(g, P, 128, wy + 2, 30, 80, 32);
  // THE HIGHEST SPIRE: up out of the keep, Piper's window near its top (pink stained glass, a heart in it)
  const sx = 6, sTop = kTop - 92;
  box(g, sx - 15, sTop - 1, 30, 94, INK); box(g, sx - 14, sTop, 28, 93, S[1]); box(g, sx - 14, sTop, 6, 93, S[0]); box(g, sx + 6, sTop, 8, 93, S[2]);
  for (let y = sTop + 6; y < kTop; y += 7) box(g, sx - 14, y, 28, 1, S[2]);
  const w = PIPER_WINDOW;
  box(g, w.x - 8, w.y - 12, 16, 26, INK);
  g.fillStyle = INK; g.beginPath(); g.arc(w.x, w.y - 12, 8, Math.PI, 0); g.fill();
  g.fillStyle = P.pink[1]; g.fillRect(w.x - 6, w.y - 12, 12, 24); g.beginPath(); g.arc(w.x, w.y - 12, 6, Math.PI, 0); g.fill();
  g.fillStyle = P.pink[0]; g.fillRect(w.x - 6, w.y - 12, 4, 24);
  g.fillStyle = '#D8306E'; g.beginPath(); g.arc(w.x - 2, w.y - 2, 2.4, 0, Math.PI * 2); g.arc(w.x + 2, w.y - 2, 2.4, 0, Math.PI * 2); g.fill(); poly(g, '#D8306E', [w.x - 4.4, w.y - 1, w.x, w.y + 5, w.x + 4.4, w.y - 1]);
  box(g, w.x - 6, w.y + 2, 12, 1, INK);
  // (its roof: the tallest cone, gold-banded, a gold star on top)
  const rb = sTop - 2, rh = 70;
  poly(g, INK, [sx - 21, rb + 1, sx, rb - rh - 2, sx + 21, rb + 1]);
  poly(g, P.roof[1], [sx - 20, rb, sx, rb - rh, sx + 20, rb]); poly(g, P.roof[0], [sx - 20, rb, sx, rb - rh, sx - 8, rb]); poly(g, P.roof[2], [sx + 7, rb, sx, rb - rh, sx + 20, rb]);
  for (const k of [0.22, 0.5, 0.75]) { const yb = rb - rh * k, hw = 20 * (1 - k); box(g, sx - hw, yb, hw * 2, 2, P.gold[1]); }
  const st = rb - rh - 8;
  poly(g, P.gold[1], [sx, st - 7, sx + 2, st - 2, sx + 7, st - 2, sx + 3, st + 1, sx + 5, st + 6, sx, st + 3, sx - 5, st + 6, sx - 3, st + 1, sx - 7, st - 2, sx - 2, st - 2]);
  box(g, sx - 1, st - 4, 1, 2, P.gold[0]);
  // (snow on the wall's top and the roofs' brims)
  box(g, -130, wy - wallH - 9, 260, 2, mix(P.snow[0], P.stone[0], 0.4));
};

/** Draws the castle in a section's far layer (screen space), at its size, drifted for how far through it he is. */
export const drawMonument = (c: Ctx, state: GameState, at: MonumentAt) => {
  const { x0, x1 } = SECTIONS[at.id];
  const span = Math.max(1, x1 - x0 - CANVAS_WIDTH);
  const k = Math.max(0, Math.min(1, (state.camera.x - x0) / span));
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), Math.round(at.base), at.k, state.frame);
};

/** The castle with its crag's foot at (sx, sy) (whatever space c is in), `k` its size, `f` a frame count (the window's
 *  glow, the sparkles). The walk in and the walk away use it too. */
export const drawCastleAt = (c: Ctx, sx: number, sy: number, k: number, f: number) => {
  const tod = timeOfDay();
  c.save(); c.translate(sx, sy); c.scale(k, k);
  stamp(c, `fa-castle-${tod.key}`, -180, -470, 360, 476, g => paintCastle(g, tod));
  // (Piper's window: glowing pink, breathing; little sparkles drifting round the top spire)
  const w = PIPER_WINDOW, glow = 0.18 + 0.1 * Math.sin(f * 0.05) + tod.lamps * 0.2;
  c.globalAlpha = Math.min(0.6, glow); c.fillStyle = '#FF8AC8';
  c.beginPath(); c.arc(w.x, w.y - 2, 16, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
  for (let i = 0; i < 6; i++) {
    const a = f * 0.02 + i * 1.05, r = 26 + (i % 3) * 8;
    const x = w.x + Math.cos(a) * r, y = w.y - 60 + Math.sin(a * 1.3) * 34;
    const tw = (f + i * 13) % 40 < 20;
    c.fillStyle = tw ? '#FFF6C8' : '#FFC8E8';
    c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1);
  }
  c.restore();
};
