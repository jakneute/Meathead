// The ride's tricks, painted from the guests' side (the temple backstage painted their backs: temple/art.ts). The same
// fiberglass "stone" (the backstage dart wall's gray-tan, its moss), the same Serpent of Doom green, the same boulders:
//   the idols:   a carved jaguar head in profile on a stone column at the track's far edge, facing back down the track,
//                its jaws open on the dart hole; the eye and the hole glow before a volley. Out of the back of its skull,
//                the LEAFMASTER's orange hose. A head-high one wears a tall crest (it fires high: duck).
//   the serpent: a fiberglass rock face behind the track, the hole in it, the plaque over it; out of the hole, the head,
//                front on, coming at the eye down its ribbed sleeve, right across the track (and past him: drawn in front).
//   the catapult: a ruined temple wall (the set) behind the track, BEWARE OF FALLING ROCKS; behind it, the arm whips up
//                over the top, the stagehand's headset over the parapet as he winds it.
//   the big one: a fake rock wall, THE ROLLING BOULDER carved over two rock-painted doors; after, the doors stood open
//                toward the eye, the stagehand in the dark behind them, arms still out from the shove.
// Depth is the mine's (temple/art.ts: inDepth, at): every piece at its own depth, the eye shared; culled by where it
// lands on screen.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { inDepth, at, type Eye } from '../temple/art';
import { drawPerson } from '../temple/people';
import { INK, box, slab, rampOf, dark, lite, checker, steppedGlow, stamp, hash } from '../../intro/art/kit';
import { IDOLS, SNAKES, LOBS, CHASE_DOORS, trackY, artieTrackY } from './layout';
import {
  type Tricks, type Boulder, IDOL_TELL, dartRise, DART_LEN, snakeAt, snakeDepth, SNAKE_D0, SNAKE_LOW, SNAKE_HIGH, LOB_FROM,
} from './tricks';
import { signAt, gilt, stone } from '../letters';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

const quad = (c: Ctx, col: string, a: Pt, b: Pt, cc: Pt, dd: Pt) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath(); c.fill();
};
const seg = (c: Ctx, a: Pt, b: Pt, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
/** Fiberglass "stone" (the backstage dart wall's), its moss; the serpent's green; real rock. */
const STONE = '#8E8676', MOSS = '#4C6B3A', SERPENT = '#2F7A3A', ROCK_FACE = '#6E665A', BOULDER = '#8A8178';
/** Where the set pieces stand (behind the track: in front of the timbered wall, 0.84), the idols (at its far edge). */
const SET_D = 0.9, IDOL_D = 0.945;
/** Down into the dark, under the track (the mine's dark comes up over it). */
const DEEP = 700;

/** On screen, at depth d, for x0..x1 (world: his plane's units). */
const seen = (state: GameState, eye: Eye, x0: number, x1: number, d: number) => {
  const a = at(eye, x0, 0, d)[0], b = at(eye, x1, 0, d)[0];
  return b > state.camera.x - 60 && a < state.camera.x + CANVAS_WIDTH + 60;
};
const railAt = (x: number) => trackY(x) ?? artieTrackY(x);

/**
 * A straight-walled block of the set (its front at `fd`, going back to `bd`): the side facing the eye, its top if the
 * eye's over it; then `face` painted on its front (world units, at fd).
 */
const setBlock = (c: Ctx, eye: Eye, x: number, top: number, w: number, bottom: number, col: string, fd: number, bd: number, face: () => void) => {
  const r = rampOf(col);
  const side = eye.x < x ? x : eye.x > x + w ? x + w : null;
  if (side !== null) {
    quad(c, r[1], at(eye, side, top, fd), at(eye, side, top, bd), at(eye, side, bottom, bd), at(eye, side, bottom, fd));
    seg(c, at(eye, side, top, bd), at(eye, side, bottom, bd), INK);
  }
  if (eye.y < top) {
    quad(c, r[3], at(eye, x, top, fd), at(eye, x + w, top, fd), at(eye, x + w, top, bd), at(eye, x, top, bd));
    seg(c, at(eye, x, top, bd), at(eye, x + w, top, bd), r[2], 2);
  }
  inDepth(c, eye, fd, face);
};

/** Fiberglass stone, painted: blocks in courses, stepped, the moss in its joints. (Stamped: `key`.) */
const paintStone = (g: Ctx, x: number, top: number, w: number, h: number, col: string, seed: number) => {
  const r = rampOf(col);
  box(g, x, top, w, h, r[2]);
  for (let y = top, row = 0; y < top + h; y += 24, row++) {
    const off = row % 2 ? 0 : 20;
    for (let bx = x - off; bx < x + w; bx += 40) {
      const k = hash(bx * 0.13 + y * 0.7 + seed);
      const x0 = Math.max(x, bx), x1 = Math.min(x + w, bx + 40);
      if (x1 - x0 < 2) continue;
      box(g, x0, y, x1 - x0, 24, k < 0.3 ? r[1] : k > 0.8 ? r[3] : r[2]);
      box(g, x0, y, x1 - x0, 2, r[3]); box(g, x0, y + 22, x1 - x0, 2, r[0]); box(g, x1 - 2, y, 2, 24, r[0]);
      if (k > 0.86) box(g, x0 + 4, y + 20, Math.min(14, x1 - x0 - 6), 4, MOSS);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The idols

const drawIdol = (c: Ctx, eye: Eye, state: GameState, x: number, high: boolean, t: number) => {
  const f = state.frame, rail = railAt(x), my = rail - dartRise(high);
  const telling = t > 0 && t < IDOL_TELL, just = t >= IDOL_TELL && t < IDOL_TELL + 10;
  const glow = telling ? (f % 6 < 3 ? '#FDE047' : '#F97316') : just ? '#FFFBEA' : null;
  const top = my - 46, colTop = my + 24;
  // (the column it's on: stone, down into the dark; straight sides going back)
  setBlock(c, eye, x - 22, colTop, 54, rail + DEEP, STONE, IDOL_D, IDOL_D - 0.05, () => {
    stamp(c, `cart-idolcol-${x}`, x - 24, colTop - 2, 58, rail + DEEP - colTop + 4, g => {
      paintStone(g, x - 22, colTop, 54, rail + DEEP - colTop, STONE, x);
      // (a cap stone under the head, stepped out)
      slab(g, x - 26, colTop, 62, 12, lite(STONE, 0.1), { edge: 2 });
    });
  });
  inDepth(c, eye, IDOL_D, () => {
    const r = rampOf(STONE);
    // the LEAFMASTER's hose out of the back of its skull, down behind the column (the stagehand's down there)
    c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x + 34, my - 10); c.quadraticCurveTo(x + 64, my, x + 50, colTop + 60); c.stroke();
    c.strokeStyle = '#E8701A'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = lite('#E8701A', 0.35); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 35, my - 12); c.quadraticCurveTo(x + 62, my - 3, x + 48, colTop + 60); c.stroke();
    // (a high one: its crest, tall, fanned, the moss in it)
    if (high) {
      for (let k = 0; k < 5; k++) {
        const fx = x - 6 + k * 9, fh = 40 + (k === 2 ? 14 : k % 2 ? 6 : 0);
        box(c, fx - 1, top - fh - 1, 10, fh + 2, INK);
        box(c, fx, top - fh, 8, fh, k % 2 ? r[1] : r[2]); box(c, fx, top - fh, 2, fh, r[3]);
        box(c, fx + 2, top - fh + 4, 4, 4, k === 2 ? '#B91C1C' : MOSS);
      }
    }
    // the head, in profile, facing back down the track: the skull, the ears, the upper jaw out over the hole
    c.fillStyle = INK; c.beginPath();
    c.moveTo(x + 38, top + 6); c.lineTo(x + 30, top - 4); c.lineTo(x - 4, top - 4); c.lineTo(x - 22, top + 10);
    c.lineTo(x - 36, my - 14); c.lineTo(x - 40, my - 2); c.lineTo(x + 4, my - 2); c.lineTo(x + 4, my + 4);
    c.lineTo(x - 32, my + 6); c.lineTo(x - 30, my + 18); c.lineTo(x + 38, colTop + 2); c.closePath(); c.fill();
    c.fillStyle = r[2]; c.beginPath();
    c.moveTo(x + 36, top + 7); c.lineTo(x + 29, top - 2); c.lineTo(x - 3, top - 2); c.lineTo(x - 20, top + 11);
    c.lineTo(x - 34, my - 13); c.lineTo(x - 37, my - 4); c.lineTo(x + 6, my - 4); c.lineTo(x + 6, my + 6);
    c.lineTo(x - 30, my + 8); c.lineTo(x - 28, my + 16); c.lineTo(x + 36, colTop); c.closePath(); c.fill();
    // (lit along its brow and snout, shaded under the jaw and down the back)
    c.fillStyle = r[3]; c.beginPath(); c.moveTo(x + 29, top - 2); c.lineTo(x - 3, top - 2); c.lineTo(x - 20, top + 11); c.lineTo(x - 34, my - 13); c.lineTo(x - 28, my - 13); c.lineTo(x - 14, top + 14); c.lineTo(x + 2, top + 4); c.lineTo(x + 28, top + 4); c.closePath(); c.fill();
    box(c, x - 3, top - 2, 30, 2, r[4]);
    c.fillStyle = r[1]; c.beginPath(); c.moveTo(x - 28, my + 16); c.lineTo(x + 36, colTop); c.lineTo(x + 36, colTop - 6); c.lineTo(x - 24, my + 11); c.closePath(); c.fill();
    box(c, x + 28, top + 8, 8, colTop - top - 10, r[1]);
    // (the ear, the carved spiral on the cheek, the whiskers' studs, the moss in the creases)
    box(c, x + 14, top - 12, 14, 12, INK); box(c, x + 16, top - 10, 10, 9, r[2]); box(c, x + 18, top - 8, 6, 5, r[0]);
    box(c, x + 6, my - 30, 18, 18, INK); box(c, x + 8, my - 28, 14, 14, r[2]); box(c, x + 11, my - 25, 8, 8, r[1]); box(c, x + 13, my - 23, 4, 4, r[3]);
    for (let k = 0; k < 3; k++) box(c, x - 22 + k * 7, my - 10, 3, 3, r[0]);
    box(c, x - 6, top + 2, 12, 3, MOSS); box(c, x + 20, colTop - 6, 12, 4, MOSS);
    // (the fangs, either side of the hole)
    for (const [fx, fy, h] of [[-34, my - 4, 7], [-28, my + 6, -6]] as const) { box(c, x + fx, Math.min(fy, fy + h), 4, Math.abs(h), INK); box(c, x + fx + 1, Math.min(fy, fy + h) + 1, 2, Math.abs(h) - 2, '#F1EFEA'); }
    // the eye, the dart hole in the mouth: dead stone, or lit (the tell)
    box(c, x - 16, top + 12, 12, 8, INK);
    box(c, x - 15, top + 13, 10, 6, glow ?? '#2A2420');
    box(c, x - 40, my - 4, 10, 8, INK); box(c, x - 39, my - 3, 8, 6, glow ?? '#0C0A08');
    if (glow) { steppedGlow(c, x - 36, my, 26, glow, 0.4, 0.05, 3); steppedGlow(c, x - 10, top + 16, 16, glow, 0.3, 0.05, 3); }
    // (a puff of dust out of it, the volley going)
    if (just) for (let k = 0; k < 4; k++) box(c, x - 46 - k * 6 - (t - IDOL_TELL) * 2, my - 6 + (k % 2) * 6 - k, 5, 4, `rgba(220, 210, 190, ${0.5 - k * 0.1})`);
    // (its name, on a plaque on the column)
    slab(c, x - 18, colTop + 22, 46, 18, '#5A1A0C', { edge: 2 });
    signAt(c, high ? 'BEHOLD' : 'BEWARE', x + 5, colTop + 34, 5, gilt(5));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The Serpent of Doom: its rock, its hole, and it

const snakeY = (sx: number) => railAt(sx) - (SNAKE_LOW + SNAKE_HIGH) / 2;
const drawSnakeRock = (c: Ctx, eye: Eye, state: GameState, sx: number, t: number) => {
  const f = state.frame, rail = railAt(sx), hy = snakeY(sx), top = rail - 250;
  const s = snakeAt(t);
  inDepth(c, eye, SNAKE_D0, () => {
    stamp(c, `cart-snakerock-${sx}`, sx - 160, top - 40, 320, rail + DEEP - top + 40, g => {
      const r = rampOf(ROCK_FACE);
      // the rock face: fiberglass, its top in lumps, lit along the left of each; down into the dark
      g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 150, rail + DEEP);
      const lumps = [[-150, 60], [-110, 20], [-60, 0], [-10, -26], [40, -6], [90, 14], [130, 50], [150, 80]];
      for (const [dx, dy] of lumps) g.lineTo(sx + dx, top + dy);
      g.lineTo(sx + 150, rail + DEEP); g.closePath(); g.fill();
      g.save(); g.clip();
      box(g, sx - 160, top - 40, 320, rail + DEEP - top + 40, r[2]);
      for (let k = 0; k < 14; k++) { const yy = top + 10 + k * 34; box(g, sx - 150, yy, 300, 3, r[1]); box(g, sx - 150 + (k % 3) * 40, yy + 3, 120, 3, r[3]); }
      for (const [dx, dy] of lumps) { box(g, sx + dx, top + dy, 6, 70, r[3]); box(g, sx + dx + 36, top + dy + 10, 4, 60, r[1]); }
      for (let k = 0; k < 10; k++) box(g, sx - 140 + hash(k + sx) * 280, top + 30 + hash(k * 3 + sx) * 180, 6 + hash(k) * 10, 4, MOSS);
      g.restore();
      // (a snake carved coiling round the hole: the tail, the coils)
      for (let k = 0; k < 18; k++) {
        const a = k * 0.42, rr = 58 + k * 2.2;
        const px = sx + Math.cos(a) * rr, py = hy + Math.sin(a) * rr * 0.9;
        box(g, px - 6, py - 6, 12, 12, INK); box(g, px - 5, py - 5, 10, 10, dark(SERPENT, 0.25)); box(g, px - 5, py - 5, 10, 3, lite(SERPENT, 0.1));
      }
      // the hole: black, its lip lit
      g.fillStyle = INK; g.beginPath(); g.ellipse(sx, hy, 52, 46, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#050405'; g.beginPath(); g.ellipse(sx, hy + 2, 46, 40, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = r[4]; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, hy, 50, 44, 0, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
      // (the plaque over it)
      slab(g, sx - 70, top + 24, 140, 22, '#14301A', { edge: 2 });
      signAt(g, 'SERPENT OF DOOM', sx, top + 40, 6, stone(6, '#BBF7D0', '#05140A'));
    });
    // (back in its hole: its eyes, dim; rearing (the tell), lit and swaying, the hiss's breath)
    if (s.k <= 0.02) {
      const lit = s.rear, sway = lit ? Math.sin(f * 0.6) * 3 : 0;
      for (const ex of [-16, 16]) { box(c, sx + ex - 5 + sway, hy - 8, 10, 6, INK); box(c, sx + ex - 4 + sway, hy - 7, 8, 4, lit ? (f % 4 < 2 ? '#FDE047' : '#FACC15') : '#3A2E0A'); }
      if (lit) steppedGlow(c, sx, hy - 4, 40, '#FACC15', 0.3, 0.04, 3);
    }
  });
};

/** One ring of its sleeve (or its head), at depth d: front on. */
const snakeRing = (c: Ctx, eye: Eye, sx: number, hy: number, d: number, i: number) => {
  inDepth(c, eye, d, () => {
    const r = rampOf(SERPENT);
    box(c, sx - 27, hy - 25, 54, 50, INK);
    box(c, sx - 25, hy - 23, 50, 46, i % 2 ? r[2] : r[1]);
    box(c, sx - 25, hy - 23, 50, 6, r[3]); box(c, sx - 25, hy - 23, 6, 46, r[3]); box(c, sx + 19, hy - 23, 6, 46, r[0]);
    checker(c, sx - 19, hy - 17, 38, 2, r[3]);
  });
};
const snakeHead = (c: Ctx, eye: Eye, f: number, sx: number, hy: number, d: number, open: number) => {
  inDepth(c, eye, d, () => {
    const r = rampOf(SERPENT);
    // the head, front on: a broad wedge, the brow plates, the eyes out at the sides; the jaw hung open under it
    const top = hy - 32, w = 46;
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx - w - 2, hy - 6); c.lineTo(sx - 30, top - 2); c.lineTo(sx + 30, top - 2); c.lineTo(sx + w + 2, hy - 6); c.lineTo(sx + 34, hy + 6); c.lineTo(sx - 34, hy + 6); c.closePath(); c.fill();
    c.fillStyle = r[2]; c.beginPath(); c.moveTo(sx - w, hy - 6); c.lineTo(sx - 29, top); c.lineTo(sx + 29, top); c.lineTo(sx + w, hy - 6); c.lineTo(sx + 33, hy + 4); c.lineTo(sx - 33, hy + 4); c.closePath(); c.fill();
    c.fillStyle = r[3]; c.beginPath(); c.moveTo(sx - w, hy - 6); c.lineTo(sx - 29, top); c.lineTo(sx + 29, top); c.lineTo(sx + 22, top + 8); c.lineTo(sx - 22, top + 8); c.lineTo(sx - w + 8, hy - 6); c.closePath(); c.fill();
    box(c, sx - 28, top, 56, 2, r[4]);
    for (let k = 0; k < 5; k++) { box(c, sx - 20 + k * 8, top + 10 + (k % 2) * 4, 6, 3, r[1]); }
    // (the nostrils)
    box(c, sx - 8, hy - 2, 4, 3, INK); box(c, sx + 4, hy - 2, 4, 3, INK);
    // (the eyes: lit, slit)
    for (const s of [-1, 1]) { const ex = sx + s * 34; box(c, ex - 6, hy - 18, 12, 10, INK); box(c, ex - 5, hy - 17, 10, 8, '#FACC15'); box(c, ex - 1, hy - 17, 2, 8, INK); box(c, ex - 4, hy - 16, 2, 2, '#FFFBEA'); }
    // the mouth: open on the dark of its throat, the fangs, the forked tongue out at him
    const jaw = hy + 4 + open;
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 34, hy + 4); c.lineTo(sx + 34, hy + 4); c.lineTo(sx + 26, jaw + 10); c.lineTo(sx - 26, jaw + 10); c.closePath(); c.fill();
    if (open > 3) {
      c.fillStyle = '#7F1D1D'; c.beginPath(); c.moveTo(sx - 30, hy + 6); c.lineTo(sx + 30, hy + 6); c.lineTo(sx + 22, jaw + 2); c.lineTo(sx - 22, jaw + 2); c.closePath(); c.fill();
      box(c, sx - 14, hy + 10, 28, Math.max(1, open - 8), '#3A0A0A');
      for (const s of [-1, 1]) { box(c, sx + s * 20 - 2, hy + 6, 5, 12, INK); box(c, sx + s * 20 - 1, hy + 6, 3, 10, '#F8FAFC'); }
      const tl = 8 + Math.sin(f * 0.8) * 4;
      box(c, sx - 1, jaw - 4, 3, tl, '#DC2626'); box(c, sx - 4, jaw - 4 + tl, 3, 4, '#DC2626'); box(c, sx + 2, jaw - 4 + tl, 3, 4, '#DC2626');
    }
    // (the lower jaw)
    c.fillStyle = r[1]; c.beginPath(); c.moveTo(sx - 26, jaw + 2); c.lineTo(sx + 26, jaw + 2); c.lineTo(sx + 22, jaw + 10); c.lineTo(sx - 22, jaw + 10); c.closePath(); c.fill();
    box(c, sx - 22, jaw + 9, 44, 2, r[0]);
  });
};
/** The serpent out of its hole: its sleeve's rings and its head, from the hole to `upTo` (the back part, then the near). */
const drawSerpent = (c: Ctx, eye: Eye, f: number, sx: number, t: number, near: boolean) => {
  const s = snakeAt(t);
  if (s.k <= 0.02) return;
  const d = snakeDepth(s.k), hy = snakeY(sx);
  const step = 0.014;
  let i = 0;
  for (let dd = SNAKE_D0 + 0.01; dd < d - step / 2; dd += step, i++) if ((dd > 1) === near) snakeRing(c, eye, sx, hy, dd, i);
  if ((d > 1) === near) snakeHead(c, eye, f, sx, hy, d, Math.max(0, s.k) * 18);
};

// ---------------------------------------------------------------------------------------------------------------
// The catapult, behind the set

const WALL_X0 = 150, WALL_X1 = 540;
const wallTop = (lx: number) => railAt(lx) - 200;
const drawCatapultWall = (c: Ctx, eye: Eye, state: GameState, lx: number, t: number) => {
  const f = state.frame, rail = railAt(lx), top = wallTop(lx);
  const pivot: Pt = [lx + LOB_FROM + 70, top + 50];
  // (behind it: the arm. Lying back out of sight; thrown, it whips up over the top, up and back the way he's coming,
  // and stops there; then it's wound back down)
  const u = t <= 0 ? 0 : t < 8 ? t / 8 : t < 40 ? 1 : Math.max(0, 1 - (t - 40) * 0.015);
  const th = 0.15 + (-Math.PI / 2 - 0.5 - 0.15) * u;
  inDepth(c, eye, SET_D - 0.03, () => {
    c.save(); c.translate(pivot[0], pivot[1]); c.rotate(th);
    // (+x along the arm, out of its pivot)
    slab(c, -10, -6, 150, 12, '#8A5E34', { edge: 2 });
    box(c, 40, -7, 6, 14, '#3A3E44'); box(c, 100, -7, 6, 14, '#3A3E44');
    c.fillStyle = INK; c.beginPath(); c.arc(146, 0, 18, -Math.PI / 2, Math.PI / 2, true); c.fill();
    c.fillStyle = '#4A4E56'; c.beginPath(); c.arc(146, 0, 16, -Math.PI / 2, Math.PI / 2, true); c.fill();
    c.restore();
    // (the stagehand on the winch: his head and headset over the parapet the whole time, watching for the cart; he
    // winds it back down after)
    c.save(); c.translate(lx + WALL_X1 - 50, top + 60); c.scale(-1, 1);
    drawPerson(c, { seed: 4411, outfit: 'stage', f, pose: t > 40 && u > 0 ? 'crank' : 'stand', mood: t > 0 && t < 40 ? 'happy' : 'bored' });
    c.restore();
  });
  // the wall: a ruined temple wall (the set), stepped along its broken top, carved; down into the dark
  setBlock(c, eye, lx + WALL_X0, top, WALL_X1 - WALL_X0, rail + DEEP, STONE, SET_D, SET_D - 0.04, () => {
    stamp(c, `cart-lobwall-${lx}`, lx + WALL_X0 - 4, top - 60, WALL_X1 - WALL_X0 + 8, rail + DEEP - top + 64, g => {
      const x0 = lx + WALL_X0, w = WALL_X1 - WALL_X0;
      paintStone(g, x0, top, w, rail + DEEP - top, STONE, lx);
      // (its broken top: stones standing up past it, here and there)
      for (let k = 0; k < 6; k++) { const bx = x0 + 10 + k * 64, h = 12 + Math.round(hash(k + lx) * 3) * 12; slab(g, bx, top - h, 40, h + 2, k % 2 ? STONE : dark(STONE, 0.08), { edge: 2 }); }
      // (a frieze along it: jaguars, carved, stepped)
      const r = rampOf(STONE);
      box(g, x0, top + 30, w, 34, r[1]);
      for (let k = 0; k < 6; k++) { const jx = x0 + 18 + k * 62; box(g, jx, top + 36, 40, 22, r[3]); box(g, jx + 2, top + 38, 36, 18, r[2]); box(g, jx + 30, top + 40, 6, 6, INK); box(g, jx + 4, top + 50, 28, 4, r[1]); }
      // (the sign: the ride's own, cut into the stone, a falling rock on it)
      slab(g, x0 + w / 2 - 80, top + 80, 160, 48, '#E8C130', { edge: 4 });
      signAt(g, 'BEWARE OF', x0 + w / 2, top + 97, 7, stone(7, INK, '#FFF0A0'));
      signAt(g, 'FALLING ROCKS', x0 + w / 2, top + 112, 7, stone(7, INK, '#FFF0A0'));
      box(g, x0 + 4, top + 140, w - 8, 3, MOSS);
    });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The big one's doors

const DOOR_W = 74, DOOR_H = 156;
const drawChaseWall = (c: Ctx, eye: Eye, state: GameState, t: number) => {
  const f = state.frame, x = CHASE_DOORS, rail = railAt(x), top = rail - 300, dTop = rail - DOOR_H;
  const open = t > 0;
  // (the dark inside, behind the doors: the stagehand in it, arms out from the shove, the work light on him)
  if (open) inDepth(c, eye, SET_D - 0.02, () => {
    box(c, x - DOOR_W, dTop, DOOR_W * 2, DOOR_H + 40, '#050406');
    steppedGlow(c, x, dTop + 20, 70, '#FDE68A', 0.12, 0.02, 4);
    c.save(); c.translate(x + 10, rail + 2); c.scale(-1, 1);
    drawPerson(c, { seed: 6203, outfit: 'stage', f, pose: t < 90 ? 'thrust' : 'stand', mood: t < 90 ? 'happy' : 'bored' });
    c.restore();
  });
  // the wall: a fake rock face, carved over the doors; down into the dark (the doorway cut out of it, once open)
  const w0 = x - 260, w1 = x + 260;
  setBlock(c, eye, w0, top, w1 - w0, rail + DEEP, ROCK_FACE, SET_D, SET_D - 0.05, () => {
    stamp(c, `cart-chasewall-${open ? 1 : 0}`, w0 - 4, top - 4, w1 - w0 + 8, rail + DEEP - top + 8, g => {
      const r = rampOf(ROCK_FACE);
      g.save();
      if (open) { g.beginPath(); g.rect(w0, top, w1 - w0, rail + DEEP - top); g.rect(x + DOOR_W, dTop, -DOOR_W * 2, DOOR_H); g.clip('evenodd'); }
      box(g, w0, top, w1 - w0, rail + DEEP - top, r[2]);
      for (let k = 0; k < 22; k++) { const yy = top + 8 + k * 46; box(g, w0, yy, w1 - w0, 3, r[1]); box(g, w0 + (k % 3) * 70, yy + 3, 260, 3, r[3]); }
      for (let k = 0; k < 16; k++) { const lx = w0 + 10 + k * 32; box(g, lx, top + hash(k) * 40, 5, 120 + hash(k * 2) * 200, k % 2 ? r[3] : r[1]); }
      for (let k = 0; k < 12; k++) box(g, w0 + hash(k * 5 + 1) * 500, top + hash(k * 7) * 260, 8 + hash(k) * 14, 5, MOSS);
      // (the doors, closed: rock-painted, their seam, their hinges)
      if (!open) {
        for (const s of [-1, 1]) {
          const dx = s < 0 ? x - DOOR_W : x;
          box(g, dx, dTop, DOOR_W, DOOR_H, r[2]);
          for (let k = 0; k < 4; k++) box(g, dx + 4, dTop + 10 + k * 38, DOOR_W - 8, 3, r[1]);
          box(g, dx + (s < 0 ? 0 : DOOR_W - 4), dTop + 16, 4, 12, '#3A3E44'); box(g, dx + (s < 0 ? 0 : DOOR_W - 4), dTop + DOOR_H - 30, 4, 12, '#3A3E44');
        }
        box(g, x - 1, dTop, 2, DOOR_H, INK);
        box(g, x - DOOR_W - 2, dTop - 2, DOOR_W * 2 + 4, 2, INK);
      }
      g.restore();
      // (the lintel and its carving: what it is, in the ride's lettering)
      slab(g, x - 130, dTop - 52, 260, 40, '#5A1A0C', { edge: 4 });
      signAt(g, 'THE ROLLING BOULDER', x, dTop - 27, 8, gilt({ sx: 2, sy: 2 }, INK));
      slab(g, x - DOOR_W - 10, dTop - 12, DOOR_W * 2 + 20, 12, lite(ROCK_FACE, 0.1), { edge: 2 });
    });
  });
  // (open: the doors stood out toward the eye, each on its hinge, only its edge-on face if that's all the eye sees)
  if (open) {
    const swing = Math.min(1, t / 6);
    const dOut = SET_D + 0.07 * swing;
    for (const hx of [x - DOOR_W, x + DOOR_W]) {
      const r = rampOf(ROCK_FACE);
      quad(c, eye.x > hx ? r[1] : r[3], at(eye, hx, dTop, SET_D), at(eye, hx, dTop, dOut), at(eye, hx, rail, dOut), at(eye, hx, rail, SET_D));
      seg(c, at(eye, hx, dTop, dOut), at(eye, hx, rail, dOut), INK, 2);
      seg(c, at(eye, hx, dTop, SET_D), at(eye, hx, dTop, dOut), INK, 1);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The boulders, the darts

const drawBoulder = (c: Ctx, eye: Eye, b: Boulder) => {
  inDepth(c, eye, b.d, () => {
    const r = rampOf(BOULDER), R = b.r;
    c.fillStyle = INK; c.beginPath(); c.arc(b.x, b.y, R + 2, 0, Math.PI * 2); c.fill();
    // (stepped: the shadow side, the body, the lit side, a glint; the lumps and cracks turning with it)
    c.fillStyle = r[1]; c.beginPath(); c.arc(b.x, b.y, R, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[2]; c.beginPath(); c.arc(b.x - R * 0.12, b.y - R * 0.12, R * 0.8, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[3]; c.beginPath(); c.arc(b.x - R * 0.32, b.y - R * 0.32, R * 0.42, 0, Math.PI * 2); c.fill();
    box(c, b.x - R * 0.5, b.y - R * 0.58, R * 0.22, R * 0.16, r[4]);
    c.save(); c.beginPath(); c.arc(b.x, b.y, R, 0, Math.PI * 2); c.clip();
    for (let k = 0; k < (b.big ? 7 : 4); k++) {
      const a = b.rot + k * 2.1, rr = R * (0.3 + hash(k + (b.big ? 9 : 0)) * 0.55);
      const px = b.x + Math.cos(a) * rr, py = b.y + Math.sin(a) * rr, s = R * 0.16;
      box(c, px - s, py - s * 0.5, s * 2, s, r[0]); box(c, px - s, py - s * 0.5 - 2, s * 2, 2, r[3]);
    }
    c.restore();
  });
};

const drawDart = (c: Ctx, eye: Eye, x: number, y: number, from: number) => {
  // (out of the mouth, at the column's depth, onto the track: between the rails)
  const d = Math.min(0.99, IDOL_D + (from - x) / 1200);
  inDepth(c, eye, d, () => {
    box(c, x - 1, y - 2, DART_LEN + 2, 4, INK);
    box(c, x, y - 1, DART_LEN - 6, 2, '#C8B98A');
    box(c, x - 4, y - 2, 5, 4, '#D4D4D8'); box(c, x - 6, y - 1, 3, 2, '#F8FAFC');
    // (the fletching: red feathers)
    box(c, x + DART_LEN - 7, y - 4, 7, 3, '#EF4444'); box(c, x + DART_LEN - 7, y + 1, 7, 3, '#B91C1C');
    box(c, x + DART_LEN, y - 1, 10, 2, 'rgba(255, 255, 255, 0.18)');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The lot

const behindTrack = (b: Boulder) => b.mode === 'out' && b.d < 0.955;

/** The set pieces (behind the track): the catapults' walls, the big one's doors, the serpents' rocks (and the serpent
 *  when it's further back than him), the idols; lobbed boulders still behind the set. */
export const drawTrickSets = (c: Ctx, eye: Eye, state: GameState, tr: Tricks) => {
  const f = state.frame;
  // (furthest first: what's coming over the walls (behind them), the walls, the doors, the rocks, the idols)
  for (const b of tr.boulders) if (b.mode === 'lob' && b.d < SET_D) drawBoulder(c, eye, b);
  LOBS.forEach((lx, i) => { if (seen(state, eye, lx + WALL_X0 - 60, lx + WALL_X1 + 60, SET_D)) drawCatapultWall(c, eye, state, lx, tr.lob[i]); });
  if (seen(state, eye, CHASE_DOORS - 280, CHASE_DOORS + 280, SET_D)) drawChaseWall(c, eye, state, tr.chase);
  // (the big one, still coming out of its doorway: behind the track yet)
  for (const b of tr.boulders) if (behindTrack(b)) drawBoulder(c, eye, b);
  SNAKES.forEach((sx, i) => {
    if (seen(state, eye, sx - 170, sx + 170, SNAKE_D0)) drawSnakeRock(c, eye, state, sx, tr.snake[i]);
    // (it comes out at the eye: wherever it's got to, it's culled by the widest it could be on screen)
    if (seen(state, eye, sx - 60, sx + 60, 1.07) || seen(state, eye, sx - 60, sx + 60, SNAKE_D0)) drawSerpent(c, eye, f, sx, tr.snake[i], false);
  });
  IDOLS.forEach((idol, i) => { if (seen(state, eye, idol.x - 60, idol.x + 80, IDOL_D)) drawIdol(c, eye, state, idol.x, idol.high, tr.idol[i]); });
};
/** On the track (after it, and the beams): the boulders, the darts. */
export const drawTrickActors = (c: Ctx, eye: Eye, state: GameState, tr: Tricks) => {
  for (const b of tr.boulders) if (!(b.mode === 'lob' && b.d < SET_D) && !behindTrack(b) && seen(state, eye, b.x - b.r, b.x + b.r, b.d)) drawBoulder(c, eye, b);
  for (const d of tr.darts) if (d.gone >= 0 && seen(state, eye, d.x - 10, d.x + 30, 1)) drawDart(c, eye, d.x, d.y, d.from);
};
/** Nearer than him: the serpent, out past him across the track. */
export const drawTrickFront = (c: Ctx, eye: Eye, state: GameState, tr: Tricks) => {
  SNAKES.forEach((sx, i) => { if (seen(state, eye, sx - 60, sx + 60, 1.07) || seen(state, eye, sx - 60, sx + 60, 1)) drawSerpent(c, eye, state.frame, sx, tr.snake[i], true); });
};

/** Their light: the show's spots on each, the idols' glow before a volley, the serpent's eyes, the work light behind
 *  the big one's doors. */
export const trickLights = (state: GameState, eye: Eye, tr: Tricks): Light[] => {
  const out: Light[] = [], cam = state.camera.x, f = state.frame;
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  IDOLS.forEach((idol, i) => {
    const [lx] = at(eye, idol.x, 0, IDOL_D);
    if (!near(lx)) return;
    const rail = railAt(idol.x), my = rail - dartRise(idol.high);
    const p = at(eye, idol.x - 10, my - 60, IDOL_D);
    out.push({ x: p[0], y: p[1], r: 150, a: 0.55, color: 'rgba(52, 211, 153, 0.08)' });
    const t = tr.idol[i];
    if (t > 0 && t < IDOL_TELL + 10) { const q = at(eye, idol.x - 36, my, IDOL_D); out.push({ x: q[0], y: q[1], r: 120, a: f % 6 < 3 ? 0.9 : 0.7, color: 'rgba(253, 186, 60, 0.16)' }); }
  });
  SNAKES.forEach((sx, i) => {
    const [lx] = at(eye, sx, 0, SNAKE_D0);
    if (!near(lx)) return;
    const s = snakeAt(tr.snake[i]), q = at(eye, sx, snakeY(sx), snakeDepth(s.k));
    out.push({ x: q[0], y: q[1] - 60, r: 200, a: 0.6, color: 'rgba(132, 204, 22, 0.1)' });
    if (s.rear || s.k > 0) out.push({ x: q[0], y: q[1], r: 110, a: 0.8, color: 'rgba(250, 204, 21, 0.12)' });
  });
  LOBS.forEach(lx => {
    const p = at(eye, lx + (WALL_X0 + WALL_X1) / 2, wallTop(lx) + 100, SET_D);
    if (near(p[0])) out.push({ x: p[0], y: p[1], r: 220, a: 0.6, color: 'rgba(251, 191, 36, 0.09)' });
  });
  { const p = at(eye, CHASE_DOORS, railAt(CHASE_DOORS) - 200, SET_D); if (near(p[0])) out.push({ x: p[0], y: p[1], r: 260, a: 0.7, color: tr.chase ? 'rgba(254, 226, 160, 0.12)' : 'rgba(239, 68, 68, 0.1)' }); }
  for (const b of tr.boulders) if (b.big && near(b.x)) out.push({ x: b.x, y: b.y, r: 160, a: 0.5 });
  return out;
};


