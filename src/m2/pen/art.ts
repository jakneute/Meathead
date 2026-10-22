// The staff room, painted: Happy Land's back of house, where the cheer stops. The inside of the grungy block building
// the hub's STAFF ONLY door is in (hub/draw.ts: backBuilding): the same cinderblock, painted the cream that's peeling
// off it outside (and peeling in here too, the gray-brown block under it), the rusty pipe and the gray conduit it has
// outside coming through, the back of the same gray steel door (its push bar, SMILE! YOU'RE ON STAGE), the same cracked
// wired window (the hub's lamp post, string lights and bunting out through it, the hour's sky), the greasy vent's fan.
// A faded red-white-and-blue stripe, a green tile wainscot, stained drop-ceiling tiles (one missing, the roof dripping
// through it into a bucket), cracked tile underfoot. Along it, near end to far: the door out, the time clock, the mirror
// that tells you to smile, the board that's never got past 0, a fire exit you can't get to, the lockers, the costume
// closet, a rack of limp mascot suits, the spare heads over a headless body taking its break, the punching bag, the
// break table, the counter, the fridge, the vending machine, and the lounge at the far end (the training video on its
// cart, the couch, the lost and found, the chairs stacked in the corner). Peak SNES: stepped ramps, dither where they
// meet, ink lines, never a smooth gradient.
//
// All the still art is painted once into six stamps a strip of the room wide (see kit's stamp); what moves (the
// lights, the flicker, the drip, the roaches, the flies, the punching bag, the microwave's clock) is drawn live over it.

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import {
  type Ctx, INK, FLAG_RED, FLAG_WHITE, FLAG_BLUE, box, text, sign, slab, pole, ball, shinyStar, star, rampOf, lite, dark, dim, mix,
  hash, checker, bandedGradient, hazeBands, steppedGlow, pixelBlob, tilePattern, stamp,
  bendFloor,
} from '../intro/art/kit';
import { X0, LEN, WALL, CEIL_Y, EXIT_X, SHELF } from './index';
import { timeOfDay, skyAt, farTint, lampGlow } from '../timeOfDay';

const G = GROUND_Y;
/** World x from a distance into the room (0 at the near wall's face). */
const rx = (r: number) => X0 + r;

// The wall's bands, top to bottom: painted block, the stripe, the tiled wainscot, the rubber base.
const STRIPE = 410, WAIN = 430, BASE = 536;
const WALLC = '#8E846A';
/** The block under the paint (the hub's back building's own, outside: hub/draw.ts). */
const BLOCK = ['#4E463A', '#5A5144', '#62594B', '#6B6153', '#7A7062', '#8A8072'];
const fade = (c: string, k = 0.45) => mix(c, WALLC, k);

// ---------------------------------------------------------------------------------------------------------------
// Little things everything's put up with

const poly = (c: Ctx, pts: number[], col: string) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fill();
};
const line = (c: Ctx, pts: number[], col: string, w = 1) => {
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
const oval = (c: Ctx, x: number, y: number, rx_: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx_, ry, 0, 0, Math.PI * 2); c.fill(); };
/** The shadow something casts on the wall behind it (lit from the upper left: down and right). */
const shade = (c: Ctx, x: number, y: number, w: number, h: number, k = 0.34, d = 3) => box(c, x + d, y + d, w, h, `rgba(18, 12, 6, ${k})`);
const screw = (c: Ctx, x: number, y: number) => { box(c, x, y, 2, 2, '#26282C'); box(c, x, y, 1, 1, '#D3D9E0'); };
const tape = (c: Ctx, x: number, y: number, w = 10, h = 5) => { box(c, x, y, w, h, 'rgba(226, 214, 160, 0.78)'); box(c, x, y, w, 1, 'rgba(255, 250, 220, 0.6)'); box(c, x, y + h - 1, w, 1, 'rgba(120, 100, 60, 0.35)'); };
const tack = (c: Ctx, x: number, y: number, col: string) => { box(c, x - 1, y - 1, 5, 5, INK); box(c, x, y, 3, 3, col); box(c, x, y, 1, 1, '#FFFFFF'); };
/** A background thing's top edge, put in shade: nothing back here reads as somewhere to stand. */
const dimTop = (c: Ctx, x: number, y: number, w: number, col: string, h = 3) => box(c, x + 1, y + 1, w - 2, h, dark(col, 0.3));

/** A paper note sized to its words (Press Start 2P is monospace: `size` px a letter), taped, tacked or stuck on. */
const note = (c: Ctx, x: number, y: number, lines: string[], opts: { size?: number; paper?: string; ink?: string; mount?: 'tape' | 'tack' | 'magnet' | 'none'; pinCol?: string } = {}) => {
  const size = opts.size ?? 6, paper = opts.paper ?? '#EDE8D4', ink = opts.ink ?? '#26324A';
  const w = Math.max(...lines.map(s => s.length)) * size + 8, lh = size + 3, h = lines.length * lh + 6;
  x = Math.round(x); y = Math.round(y);
  shade(c, x, y, w, h, 0.32, 2);
  const p = rampOf(paper);
  box(c, x, y, w, h, paper);
  box(c, x, y, w, 1, p[4]); box(c, x, y, 1, h, p[3]);
  box(c, x, y + h - 2, w, 2, p[1]); box(c, x + w - 1, y, 1, h, p[1]);
  checker(c, x + 1, y + h - 4, w - 2, 2, p[1], 1);
  // (a corner curled off the wall)
  poly(c, [x + w, y + h - 6, x + w, y + h, x + w - 6, y + h], 'rgba(18, 12, 6, 0.35)');
  poly(c, [x + w - 6, y + h, x + w, y + h - 6, x + w - 6, y + h - 6], p[0]);
  lines.forEach((s, i) => text(c, s, x + w / 2, y + 4 + size + i * lh, ink, size, 'center', null));
  const m = opts.mount ?? 'tape';
  if (m === 'tape') { tape(c, x - 3, y - 2, 10, 5); tape(c, x + w - 7, y - 2, 10, 5); }
  else if (m === 'tack') tack(c, x + w / 2 - 1, y - 2, opts.pinCol ?? '#C02424');
  else if (m === 'magnet') { box(c, x + w / 2 - 4, y - 3, 8, 6, INK); box(c, x + w / 2 - 3, y - 2, 6, 4, opts.pinCol ?? '#2D51B0'); box(c, x + w / 2 - 3, y - 2, 3, 1, '#FFFFFF'); }
  return { w, h };
};

/** A screwed-up plate of one or more lines, sized to its words. `cx` is its middle. */
const plate = (c: Ctx, cx: number, y: number, lines: string[], face: string, ink: string, size = 8) => {
  const w = Math.max(...lines.map(s => s.length)) * size + 18, lh = size + 5, h = lines.length * lh + 9;
  const x = Math.round(cx - w / 2);
  shade(c, x - 4, y - 4, w + 8, h + 8, 0.38, 4);
  box(c, x - 4, y - 4, w + 8, h + 8, INK);
  const fp = rampOf('#3A3F48');
  box(c, x - 3, y - 3, w + 6, h + 6, fp[2]); box(c, x - 3, y - 3, w + 6, 1, fp[4]); box(c, x - 3, y - 3, 1, h + 6, fp[3]);
  box(c, x - 3, y + h + 2, w + 6, 1, fp[0]); box(c, x + w + 2, y - 3, 1, h + 6, fp[1]);
  const fc = rampOf(face);
  box(c, x, y, w, h, face);
  box(c, x, y, w, 2, fc[3]); checker(c, x, y + 2, w, 2, fc[3]);
  box(c, x, y + h - 2, w, 2, fc[1]); checker(c, x, y + h - 4, w, 2, fc[1], 1);
  for (const [bx, by] of [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4], [x + w - 4, y + h - 4]]) screw(c, bx, by);
  lines.forEach((s, i) => text(c, s, cx, y + 5 + size + i * lh, ink, size, 'center', mix(face, INK, 0.5)));
  return { x, w, h };
};

/** A sign put up with `sign` (kit): its shadow on the wall first, and screws in it. */
const wallSign = (c: Ctx, x: number, y: number, words: string, face: string, ink: string, size = 8) => {
  const w = words.length * size + 16, h = size + 12;
  shade(c, x - 4, y - 4, w + 8, h + 8, 0.38, 4);
  sign(c, x, y, w, h, face, words, ink, size);
  return w;
};

/** A water stain down from the ceiling: rings of brown, streaks running down from it. */
const stain = (c: Ctx, x: number, y: number, r: number, run: number) => {
  pixelBlob(c, x, y, r, r * 0.7, 'rgba(92, 70, 28, 0.22)');
  pixelBlob(c, x - r * 0.15, y - 2, r * 0.7, r * 0.45, 'rgba(110, 84, 34, 0.2)');
  c.strokeStyle = 'rgba(70, 50, 18, 0.35)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0, 0.2, Math.PI - 0.2); c.stroke();
  for (let k = 0; k < 4; k++) {
    const sx = Math.round(x - r * 0.6 + k * r * 0.4 + hash(x + k) * 6), len = run * (0.4 + hash(x * 3 + k) * 0.6);
    box(c, sx, y, 2, len, 'rgba(84, 62, 24, 0.22)');
    box(c, sx, y + len - 4, 2, 4, 'rgba(84, 62, 24, 0.3)');
  }
};
/** Black mold in a corner: a dark bloom, specks round it. */
const mold = (c: Ctx, x: number, y: number, rw: number, rh: number) => {
  pixelBlob(c, x, y, rw, rh, 'rgba(24, 34, 18, 0.45)');
  pixelBlob(c, x, y, rw * 0.6, rh * 0.6, 'rgba(16, 24, 12, 0.5)');
  for (let k = 0; k < 26; k++) {
    const a = hash(x * 0.7 + k * 13) * Math.PI * 2, d = 0.6 + hash(y + k * 7) * 0.7;
    box(c, Math.round(x + Math.cos(a) * rw * d), Math.round(y + Math.sin(a) * rh * d), 2, 2, k % 3 ? 'rgba(20, 30, 14, 0.6)' : 'rgba(60, 74, 34, 0.6)');
  }
};
/** Paint peeled off the block: bare gray concrete showing in a ragged patch, the broken paint edge shadowed along the
 * top and left (the light's from up there), lit along the bottom and right, a flake curling off one end. */
const peel = (c: Ctx, x: number, y: number, w: number, h: number) => {
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2), bare = BLOCK[3];
  for (const [px, py, pw, ph] of [[0, 4, w, h - 8], [4, 0, w - 12, h], [8, h - 2, w * 0.4, 4], [w * 0.5, -2, w * 0.3, 4]]) box(c, x0 + px, y0 + py, pw, ph, bare);
  for (let k = 0; k < 8; k++) box(c, x0 + 3 + Math.floor(hash(x + k) * (w - 6)), y0 + 2 + Math.floor(hash(y + k * 3) * (h - 4)), 2, 1, BLOCK[1]);
  box(c, x0 + 4, y0, w - 12, 1, '#463E2E'); box(c, x0, y0 + 4, 1, h - 8, '#463E2E'); box(c, x0 + w * 0.5, y0 - 2, w * 0.3, 1, '#463E2E');
  box(c, x0 + 4, y0 + h, w - 12, 1, lite(WALLC, 0.3)); box(c, x0 + w, y0 + 4, 1, h - 8, lite(WALLC, 0.3));
  poly(c, [x0 + w, y0 + 4, x0 + w + 6, y0 + 2, x0 + w + 4, y0 + 10, x0 + w, y0 + 9], lite(WALLC, 0.18));
  box(c, x0 + w + 1, y0 + 10, 4, 1, dark(WALLC, 0.35));
};
/** A crack across something: a jagged ink line, a lit lip under it. */
const crack = (c: Ctx, x: number, y: number, len: number, seed: number, col = 'rgba(26, 11, 6, 0.75)') => {
  const pts: number[] = [x, y]; let px = x, py = y;
  for (let i = 0; i < 5; i++) { px += len / 5; py += (hash(seed + i) - 0.5) * 10; pts.push(Math.round(px), Math.round(py)); }
  line(c, pts.map((v, i) => (i % 2 ? v + 1 : v)), 'rgba(255, 255, 240, 0.18)');
  line(c, pts, col);
};

// ---------------------------------------------------------------------------------------------------------------
// The room itself: ceiling, wall, floor, end walls (painted a strip at a time, a..b)

const ceiling = (c: Ctx, a: number, b: number) => {
  const w = b - a;
  bandedGradient(c, a, -60, w, CEIL_Y - 4 + 60, ['#3E3C32', '#5E5A4A', '#86806A', '#A29A80'], 8);
  // (the grid: tiles 60 wide, two rows of them in view, the T-bar between)
  for (const ty of [26, CEIL_Y - 8]) { box(c, a, ty, w, 2, '#C4C0AE'); box(c, a, ty + 2, w, 1, '#5A5646'); }
  for (let x = Math.floor((a - X0) / 60) * 60 + X0; x < b; x += 60) {
    box(c, x, -60, 2, CEIL_Y - 8 + 60, '#B4B09E'); box(c, x + 2, -60, 1, CEIL_Y - 8 + 60, '#5A5646');
    for (const [t0, t1] of [[-60, 26], [28, CEIL_Y - 8]]) {
      // (the pinholes in the acoustic tile, and a stain on every few)
      for (let k = 0; k < 14; k++) box(c, x + 4 + Math.floor(hash(x + k * 3.1 + t0) * 52), t0 + 2 + Math.floor(hash(x * 1.3 + k + t1) * (t1 - t0 - 4)), 1, 1, 'rgba(40, 36, 26, 0.5)');
      const s = hash(x * 0.37 + t0);
      if (s > 0.6) pixelBlob(c, x + 18 + s * 24, (t0 + t1) / 2 + 2, 10 + s * 8, 6 + s * 4, 'rgba(110, 82, 30, 0.28)');
    }
  }
  // (the edge of it, where it meets the wall: a dark trim, the underside in shadow)
  box(c, a, CEIL_Y - 6, w, 6, '#34322A'); box(c, a, CEIL_Y - 6, w, 1, '#5A5646'); checker(c, a, CEIL_Y - 2, w, 2, '#1E1C16');
};

/** The two tiles in the ceiling that aren't right: one missing (the roof dripping through it), one sagging. */
const ceilingFaults = (c: Ctx) => {
  // (missing: the dark above, a pipe, a cable hanging out, the tile's edges water-rotted)
  const mx = rx(1880);
  box(c, mx + 3, 28, 57, CEIL_Y - 36, '#0C0B0A');
  box(c, mx + 3, 40, 57, 6, '#3A3F48'); box(c, mx + 3, 40, 57, 1, '#6B737E'); box(c, mx + 3, 45, 57, 1, '#1A1C20');
  for (let k = 0; k < 3; k++) box(c, mx + 10 + k * 18, 47, 2, 2, '#5A3A18');
  line(c, [mx + 40, 30, mx + 44, 50, mx + 38, 66, mx + 42, 80], '#1A1A1A', 2);
  box(c, mx + 40, 78, 4, 6, '#B91C1C');
  pixelBlob(c, mx + 30, 26, 40, 8, 'rgba(92, 64, 22, 0.45)');
  stain(c, mx + 30, CEIL_Y + 8, 26, 120);
  // (sagging: bowed down below the grid, brown in the middle)
  const sx = rx(720);
  poly(c, [sx + 3, CEIL_Y - 8, sx + 57, CEIL_Y - 8, sx + 50, CEIL_Y + 2, sx + 30, CEIL_Y + 6, sx + 10, CEIL_Y + 2], '#8C8670');
  pixelBlob(c, sx + 30, CEIL_Y - 2, 18, 6, 'rgba(100, 72, 24, 0.5)');
  line(c, [sx + 8, CEIL_Y + 2, sx + 30, CEIL_Y + 6, sx + 52, CEIL_Y + 2], INK, 1);
};

const wall = (c: Ctx, a: number, b: number) => {
  const w = b - a;
  // Painted block: the building's own cinderblock (outside: hub/draw.ts), painted the cream that's peeling off it out
  // there, gone the color of nicotine in here; darker up under the ceiling, a shade lighter where the lights hit it
  bandedGradient(c, a, CEIL_Y, w, STRIPE - CEIL_Y, ['#5E5644', '#766C56', '#8E846A', '#968C72', '#8C8268'], 12);
  for (let y = CEIL_Y + 10, row = 0; y < STRIPE; y += 24, row++) {
    box(c, a, y, w, 2, 'rgba(52, 42, 26, 0.55)'); box(c, a, y + 2, w, 1, 'rgba(226, 214, 180, 0.2)');
    for (let x = Math.floor((a - X0) / 48) * 48 + X0 - 48 + (row % 2) * 24; x < b; x += 48) {
      box(c, x, y + 2, 2, 22, 'rgba(52, 42, 26, 0.45)'); box(c, x + 2, y + 2, 1, 22, 'rgba(226, 214, 180, 0.16)');
      // (the block's face under the paint: pitted, a darker smudge on some, the odd chip down to the block)
      for (let k = 0; k < 4; k++) box(c, x + 4 + Math.floor(hash(x + y * 0.1 + k) * 40), y + 4 + Math.floor(hash(x * 0.3 + y + k * 5) * 18), 2, 1, 'rgba(46, 36, 22, 0.35)');
      if (hash(x * 0.11 + y) > 0.85) checker(c, x + 6, y + 6, 30, 12, 'rgba(60, 46, 20, 0.18)');
      if (hash(x * 0.53 + y * 0.7) > 0.93) { const cx = x + 8 + Math.floor(hash(x + y) * 28), cy = y + 6 + Math.floor(hash(y - x) * 10); box(c, cx, cy, 5, 3, BLOCK[3]); box(c, cx, cy, 5, 1, BLOCK[1]); box(c, cx, cy + 3, 5, 1, 'rgba(226, 214, 180, 0.3)'); }
    }
  }
  // The stripe the park paints on everything: red, white and blue, gone pale, chipped
  box(c, a, STRIPE, w, 8, fade(FLAG_RED[2], 0.42)); box(c, a, STRIPE, w, 1, fade(FLAG_RED[3], 0.4));
  box(c, a, STRIPE + 8, w, 4, fade(FLAG_WHITE[3], 0.4));
  box(c, a, STRIPE + 12, w, 8, fade(FLAG_BLUE[2], 0.4)); box(c, a, STRIPE + 19, w, 1, fade(FLAG_BLUE[0], 0.4));
  checker(c, a, STRIPE + 6, w, 2, fade(FLAG_RED[1], 0.4));
  for (let x = Math.floor((a - X0) / 70) * 70 + X0; x < b; x += 70) {
    const s = hash(x * 0.21);
    if (s < 0.45) continue;
    const cw = 6 + Math.floor(s * 22), cy = STRIPE + Math.floor(hash(x) * 10);
    box(c, x + 10, cy, cw, 6 + Math.floor(s * 6), BLOCK[3]); box(c, x + 10, cy + 6 + Math.floor(s * 6), cw, 1, '#463E2E');
    box(c, x + 10, cy, cw, 1, BLOCK[0]);
  }
  // The wainscot: glazed tile, the green of a hospital corridor, grime working up from the floor
  const tile = tilePattern(c, 'pen-wain2', 16, 16, g => {
    g.fillStyle = '#2E3828'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5C6A52'; g.fillRect(0, 0, 15, 15);
    g.fillStyle = '#728266'; g.fillRect(0, 0, 15, 1); g.fillRect(0, 0, 1, 15);
    g.fillStyle = '#4A5642'; g.fillRect(1, 13, 14, 2); g.fillRect(13, 1, 2, 13);
    g.fillStyle = '#8EA080'; g.fillRect(2, 2, 3, 1);
  });
  c.fillStyle = tile; c.fillRect(a, WAIN, w, BASE - WAIN);
  box(c, a, WAIN, w, 4, '#2E3828'); box(c, a, WAIN, w, 1, '#48543E');
  hazeBands(c, a, WAIN + 40, w, BASE - WAIN - 40, '#2A2414', 0.02, 0.5, 5);
  // (cracked and missing tiles, here and there)
  for (let x = Math.floor((a - X0) / 16) * 16 + X0; x < b; x += 16) for (let y = WAIN + 4; y < BASE - 8; y += 16) {
    const s = hash(x * 0.917 + y * 0.31);
    if (s > 0.985) { box(c, x, y - 2, 15, 15, '#3A3628'); for (let k = 0; k < 3; k++) box(c, x + 2, y + 1 + k * 4, 11, 1, '#2A2618'); box(c, x, y - 2, 15, 1, '#24201A'); }
    else if (s > 0.955) line(c, [x + 1, y + 1, x + 6, y + 6, x + 4, y + 9, x + 12, y + 13], 'rgba(26, 11, 6, 0.6)');
  }
  // The rubber base, scuffed
  box(c, a, BASE, w, G - BASE, '#25231E'); box(c, a, BASE, w, 1, '#3A372E'); box(c, a, BASE + 1, w, 1, '#2E2B24');
  for (let x = Math.floor((a - X0) / 30) * 30 + X0; x < b; x += 30) if (hash(x * 0.53) > 0.5) box(c, x + hash(x) * 20, BASE + 4 + hash(x * 2) * 6, 6 + hash(x * 3) * 10, 1, '#4A463A');
};

/** Faults on the wall: water stains, peeling, mold in the corners (the ones in a..b). */
const wallFaults = (c: Ctx) => {
  for (const [r, rad, run] of [[60, 20, 90], [470, 24, 140], [1240, 18, 70], [1730, 22, 120], [2210, 20, 60], [2470, 22, 110]]) stain(c, rx(r), CEIL_Y + 12, rad, run);
  for (const [r, y, w, h] of [[300, 120, 28, 16], [770, 300, 22, 14], [1110, 140, 30, 18], [1440, 300, 24, 14], [1900, 380, 26, 16], [2370, 150, 30, 20], [700, 384, 18, 12], [1270, 200, 20, 12]]) peel(c, rx(r), y, w, h);
  mold(c, rx(10), CEIL_Y + 14, 34, 24); mold(c, rx(LEN - 10), CEIL_Y + 16, 40, 28);
  mold(c, rx(12), BASE - 6, 28, 22); mold(c, rx(LEN - 8), BASE - 10, 30, 26);
  mold(c, rx(1910), CEIL_Y + 30, 30, 18); mold(c, rx(2300), BASE - 4, 26, 14); mold(c, rx(770), BASE - 2, 20, 12);
};

const floor = (c: Ctx, a: number, b: number) => {
  const w = b - a, bottom = CANVAS_HEIGHT + 60;
  // Vinyl tile, faded the two colors it once was, cracked, scuffed, grime in the seams
  const pat = tilePattern(c, 'pen-floor', 64, 16, g => {
    for (let i = 0; i < 2; i++) {
      const col = i ? '#6C6750' : '#7E7860', r = rampOf(col);
      g.fillStyle = '#3A3626'; g.fillRect(i * 32, 0, 32, 16);
      g.fillStyle = col; g.fillRect(i * 32, 0, 31, 15);
      g.fillStyle = r[3]; g.fillRect(i * 32, 0, 31, 1); g.fillRect(i * 32, 0, 1, 15);
      g.fillStyle = r[1]; g.fillRect(i * 32 + 1, 13, 30, 2);
      g.fillStyle = r[1]; for (let k = 0; k < 6; k++) g.fillRect(i * 32 + 3 + ((k * 11) % 26), 3 + ((k * 7) % 9), 2, 1);
    }
  });
  c.save(); c.translate(0, G + 4); c.fillStyle = pat; c.fillRect(a, 0, w, bottom - G); c.restore();
  hazeBands(c, a, G + 4, w, 60, '#14120C', 0.05, 0.6, 5);
  // (the edge he walks on: the only lit top in the room)
  box(c, a, G, w, 2, '#D4CEAE'); box(c, a, G + 2, w, 2, '#9C9678'); checker(c, a, G + 4, w, 2, '#9C9678');
  for (let x = Math.floor((a - X0) / 32) * 32 + X0; x < b; x += 32) {
    const s = hash(x * 0.71);
    if (s > 0.7) crack(c, x + 4, G + 8 + Math.floor(s * 10), 24, x);
    if (s < 0.25) box(c, x + Math.floor(s * 60), G + 6 + Math.floor(hash(x) * 20), 8 + Math.floor(s * 30), 1, 'rgba(14, 12, 8, 0.6)');
    if (s > 0.45 && s < 0.5) pixelBlob(c, x + 16, G + 14, 14, 4, 'rgba(70, 50, 20, 0.35)');
  }
};

const endWall = (c: Ctx, wx: number, face: 1 | -1) => {
  const top = -60, h = CANVAS_HEIGHT + 120;
  const cols = face > 0 ? ['#3A342A', '#443D32', '#4E463A', '#5A5144', '#62594B'] : ['#62594B', '#5A5144', '#4E463A', '#443D32', '#3A342A'];
  cols.forEach((col, i) => box(c, wx + i * (WALL / cols.length), top, WALL / cols.length + 1, h, col));
  for (let i = 1; i < cols.length; i++) checker(c, wx + i * (WALL / cols.length) - 2, top, 2, h, cols[i - 1]);
  const edge = face > 0 ? wx + WALL - 10 : wx;
  box(c, face > 0 ? wx + WALL - 2 : wx, top, 2, h, face > 0 ? BLOCK[5] : '#121210');
  for (let y = top; y < G; y += 28) box(c, edge + (face > 0 ? -2 : 2), y, 8, 14, (Math.floor(y / 28) % 2) ? fade('#CA8A04', 0.3) : '#18181B');
  for (let y = top + 40; y < G; y += 96) for (let k = 0; k < 2; k++) { box(c, wx + 14 + k * 20, y, 4, 4, '#1E1E1A'); box(c, wx + 14 + k * 20, y + 4, 4, 1, '#6A6C60'); }
  for (let y = top; y < G; y += 192) box(c, wx, y, WALL, 2, '#24241F');
  box(c, wx, G, WALL, 4, '#1A1A16');
  // (a run of grime and a water line along its foot)
  hazeBands(c, wx, G - 40, WALL, 40, '#14120C', 0, 0.45, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The props, near end to far

/** A dead potted plant in the corner, a little flag still stuck in it. */
const deadPlant = (c: Ctx) => {
  const x = rx(46), y = G - 30;
  shade(c, x - 18, y, 36, 30, 0.3);
  poly(c, [x - 19, y - 1, x + 19, y - 1, x + 15, G + 1, x - 15, G + 1], INK);
  poly(c, [x - 18, y, x + 18, y, x + 14, G, x - 14, G], '#8A4A26');
  poly(c, [x - 18, y, x - 6, y, x - 6, G, x - 14, G], '#A8623A');
  poly(c, [x + 8, y, x + 18, y, x + 14, G, x + 8, G], '#6A3418');
  box(c, x - 19, y - 4, 38, 6, '#6A3418'); box(c, x - 19, y - 4, 38, 1, '#8A4A26');
  crack(c, x - 10, y + 8, 14, 9, INK);
  // (the stalks, brown and bent over, the leaves dropped)
  line(c, [x - 4, y - 2, x - 8, y - 40, x - 20, y - 52], '#5A4020', 2);
  line(c, [x + 2, y - 2, x + 6, y - 50, x + 18, y - 44], '#5A4020', 2);
  line(c, [x, y - 2, x + 1, y - 30, x - 4, y - 36], '#6A4C24', 2);
  for (const [lx, ly] of [[-20, -52], [18, -44], [-6, -26], [8, -36]]) poly(c, [x + lx, y + ly, x + lx + 6, y + ly + 3, x + lx + 2, y + ly + 6], '#7A5A2A');
  for (const [lx, ly] of [[-26, 0], [22, -2], [30, 0], [-32, -2]]) poly(c, [x + lx, G - 2 + ly, x + lx + 7, G - 3 + ly, x + lx + 4, G + ly], '#6A4C24');
  box(c, x + 10, y - 26, 1, 24, '#C8C4B8');
  box(c, x + 11, y - 26, 10, 6, fade(FLAG_RED[2], 0.2)); box(c, x + 11, y - 26, 4, 3, fade(FLAG_BLUE[2], 0.2)); box(c, x + 11, y - 23, 10, 1, '#E8E4D8');
};

/** The time clock, the punch cards, LATE? DOCKED., the suggestion box (taped shut), the mousetraps. */
const timeClock = (c: Ctx) => {
  const x = rx(180), y = 334;
  // (the clock: beige steel, a dial stopped at five to nine, the slot)
  shade(c, x, y, 52, 66);
  slab(c, x, y, 52, 66, '#B4AA8A');
  ball(c, x + 26, y + 22, 15, '#E8E2CC');
  for (let k = 0; k < 12; k++) { const t = k * Math.PI / 6; box(c, Math.round(x + 26 + Math.cos(t) * 12), Math.round(y + 22 + Math.sin(t) * 12), 1, 1, INK); }
  line(c, [x + 26, y + 22, x + 26, y + 12], INK, 2); line(c, [x + 26, y + 22, x + 33, y + 25], INK, 1);
  line(c, [x + 16, y + 14, x + 34, y + 32], 'rgba(255, 255, 255, 0.35)');
  box(c, x + 12, y + 44, 28, 5, INK); box(c, x + 16, y + 36, 20, 9, '#E8DFC0'); box(c, x + 16, y + 38, 20, 2, '#B91C1C');
  box(c, x + 40, y + 66, 2, G - (y + 66), '#1E1E1E');
  // (the racks of cards, two of them)
  const rx0 = rx(240);
  for (let r = 0; r < 2; r++) {
    const ry = 318 + r * 64;
    shade(c, rx0, ry, 54, 58);
    slab(c, rx0, ry, 54, 58, '#6B737E');
    for (let k = 0; k < 4; k++) {
      const ly = ry + 12 + k * 12;
      for (let s = 0; s < 3; s++) {
        if (hash(r * 31 + k * 7 + s) < 0.2) continue;
        const cx = rx0 + 5 + s * 16, up = 6 + Math.floor(hash(r + k + s * 3) * 4);
        box(c, cx, ly - up, 13, up + 2, '#E8DFC0'); box(c, cx, ly - up, 13, 1, '#FFF8E0'); box(c, cx + 1, ly - up + 2, 11, 1, '#B91C1C');
      }
      box(c, rx0 + 3, ly, 48, 3, '#3A4048'); box(c, rx0 + 3, ly, 48, 1, '#A3ABB6');
    }
  }
  // (one on the floor, footprint on it)
  box(c, rx(262), G - 3, 18, 3, '#D8CFB0'); box(c, rx(266), G - 3, 6, 1, '#6A6050');
  plate(c, rx(238), 282, ['LATE?', 'DOCKED.'], '#7A1E1A', '#FDEFD8');
  // (the suggestion box: a slot taped over in an X, a padlock on it)
  const sx = rx(186), sy = 414;
  shade(c, sx, sy, 42, 34);
  slab(c, sx, sy, 42, 34, '#7A5232');
  box(c, sx + 9, sy + 6, 24, 3, INK);
  line(c, [sx + 6, sy + 2, sx + 36, sy + 14], 'rgba(170, 170, 160, 0.9)', 3); line(c, [sx + 36, sy + 2, sx + 6, sy + 14], 'rgba(170, 170, 160, 0.9)', 3);
  note(c, sx + 2, sy + 16, ['IDEAS'], { mount: 'none', paper: '#E8E0C8' });
  box(c, sx + 18, sy + 34, 6, 6, '#B08A2A'); line(c, [sx + 19, sy + 34, sx + 19, sy + 31, sx + 23, sy + 31, sx + 23, sy + 34], '#8A8E96', 1);
  // (mousetraps: one set, cheese gone hard; one gone off on nothing)
  for (const [mx, set] of [[rx(206), true], [rx(296), false]] as const) {
    box(c, mx - 1, G - 5, 20, 5, INK); box(c, mx, G - 4, 18, 4, '#B08850'); box(c, mx, G - 4, 18, 1, '#D0AA70');
    if (set) { line(c, [mx + 2, G - 5, mx + 2, G - 9, mx + 10, G - 9], '#A3ABB6'); poly(c, [mx + 11, G - 4, mx + 17, G - 4, mx + 17, G - 9], '#E8C040'); }
    else line(c, [mx + 2, G - 5, mx + 16, G - 6], '#A3ABB6', 2);
  }
};

/** EMPLOYEES ONLY / SMILE BEFORE YOU GO OUT, over a cracked mirror with a smile drawn on it in lipstick. */
const mirror = (c: Ctx) => {
  plate(c, rx(410), 190, ['EMPLOYEES ONLY', 'SMILE BEFORE YOU GO OUT'], '#8E2A22', '#FDEFD8');
  const x = rx(362), y = 248, w = 96, h = 124;
  shade(c, x, y, w, h, 0.38, 4);
  slab(c, x, y, w, h, '#A3ABB6');
  box(c, x + 6, y + 6, w - 12, h - 12, INK);
  bandedGradient(c, x + 7, y + 7, w - 14, h - 14, ['#3E505C', '#5A707E', '#6E8696', '#55697A', '#3A4A56'], 8);
  // (what it shows: the room behind you, dimmer)
  box(c, x + 7, y + h - 40, w - 14, 2, 'rgba(30, 36, 30, 0.5)');
  for (const [gx, gw] of [[14, 26], [30, 12]]) line(c, [x + gx, y + 60, x + gx + gw, y + 14], 'rgba(255, 255, 255, 0.35)', 2);
  // (cracked from a corner)
  const cx = x + 72, cy = y + 30;
  for (const [ex, ey] of [[x + 88, y + 8], [x + 52, y + 12], [x + 40, y + 52], [x + 86, y + 70], [x + 64, y + 90]]) line(c, [cx, cy, (cx + ex) / 2 + 3, (cy + ey) / 2 - 2, ex, ey], 'rgba(230, 240, 245, 0.55)');
  box(c, cx - 2, cy - 2, 4, 4, 'rgba(230, 240, 245, 0.7)');
  // (the lipstick: eyes, a big smile)
  c.strokeStyle = '#C0304A'; c.lineWidth = 3; c.beginPath(); c.arc(x + 46, y + 66, 22, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  box(c, x + 34, y + 44, 4, 8, '#C0304A'); box(c, x + 54, y + 44, 4, 8, '#C0304A');
  note(c, x - 4, y + h - 30, ['YOU ARE', 'THE MAGIC'], { paper: '#F2C6D4', ink: '#6E1840' });
  // (a shelf under it, dim; a comb, a can of something that says FRESH on it in another language)
  box(c, x + 8, y + h + 4, w - 16, 5, dim('#6B5A40')); dimTop(c, x + 8, y + h + 4, w - 16, dim('#6B5A40'), 2);
  box(c, x + 20, y + h + 1, 14, 3, '#2A2A2A'); for (let k = 0; k < 6; k++) box(c, x + 21 + k * 2, y + h + 3, 1, 1, '#2A2A2A');
  pole(c, x + 62, y + h - 14, 8, 18, '#5A7A9A'); box(c, x + 62, y + h - 17, 8, 3, '#A3ABB6');
};

/** The mop bucket (gray water), the mop leaned on the wall, a CAUTION sign with nobody on it but the stick man. */
const mopBucket = (c: Ctx) => {
  const x = rx(322);
  line(c, [x + 30, G - 26, x + 70, G - 176], INK, 5); line(c, [x + 30, G - 26, x + 70, G - 176], '#9A7A4A', 3); line(c, [x + 29, G - 28, x + 69, G - 178], '#C49A62', 1);
  shade(c, x, G - 34, 50, 34, 0.25, 3);
  poly(c, [x - 1, G - 35, x + 51, G - 35, x + 47, G - 3, x + 3, G - 3], INK);
  poly(c, [x, G - 34, x + 50, G - 34, x + 46, G - 4, x + 4, G - 4], '#B48A10');
  poly(c, [x, G - 34, x + 14, G - 34, x + 14, G - 4, x + 4, G - 4], '#D4A82A');
  poly(c, [x + 38, G - 34, x + 50, G - 34, x + 46, G - 4, x + 38, G - 4], '#8A6408');
  box(c, x + 1, G - 36, 48, 4, '#5A5A48'); box(c, x + 1, G - 36, 48, 1, '#6E6E58');
  box(c, x + 30, G - 46, 18, 14, '#6B737E'); box(c, x + 30, G - 46, 18, 2, '#A3ABB6'); box(c, x + 46, G - 52, 3, 8, '#3A4048');
  pixelBlob(c, x + 28, G - 36, 14, 6, '#8A8676');
  for (let k = 0; k < 6; k++) box(c, x + 18 + k * 4, G - 36, 2, 10 + (k % 3) * 3, '#7A7666');
  for (const wx of [x + 8, x + 42]) { ball(c, wx, G - 3, 3, '#2A2A2A'); }
  checker(c, x + 4, G - 18, 42, 2, 'rgba(60, 40, 0, 0.4)');
  // (the wet floor sign: a yellow A-frame, faded, a man slipping)
  const sx = rx(440);
  poly(c, [sx - 1, G + 1, sx + 15, G - 47, sx + 31, G - 47, sx + 47, G + 1], INK);
  poly(c, [sx + 1, G, sx + 16, G - 45, sx + 30, G - 45, sx + 45, G], fade('#EAB308', 0.15));
  poly(c, [sx + 1, G, sx + 16, G - 45, sx + 20, G - 45, sx + 8, G], lite(fade('#EAB308', 0.15), 0.25));
  poly(c, [sx + 36, G - 18, sx + 30, G - 45, sx + 45, G], dark(fade('#EAB308', 0.15), 0.25));
  ball(c, sx + 18, G - 34, 3, '#1A1A1A', false);
  line(c, [sx + 18, G - 30, sx + 24, G - 20, sx + 32, G - 22], '#1A1A1A', 3); line(c, [sx + 24, G - 20, sx + 16, G - 12], '#1A1A1A', 3);
  line(c, [sx + 20, G - 28, sx + 12, G - 24], '#1A1A1A', 2); line(c, [sx + 10, G - 8, sx + 36, G - 8], '#1A1A1A', 2);
};

/** The board that's never got past 0 (the 0 rubbed out and written in again, a lot), and the record. */
const incidentBoard = (c: Ctx) => {
  const x = rx(530), y = 128, w = 220, h = 142;
  shade(c, x, y, w, h, 0.38, 4);
  slab(c, x, y, w, h, '#A3ABB6');
  box(c, x + 6, y + 6, w - 12, h - 12, '#5A6068');
  bandedGradient(c, x + 7, y + 7, w - 14, h - 14, ['#F4F4EE', '#E8E8E0', '#DADAD0'], 5);
  for (const [sx, sy, sw] of [[110, 84, 30], [96, 100, 40], [140, 70, 20]]) pixelBlob(c, x + sx, y + sy, sw, 8, 'rgba(120, 130, 150, 0.1)');
  text(c, 'DAYS SINCE LAST', x + w / 2, y + 30, '#1E3A8A', 8, 'center', null);
  text(c, 'INCIDENT:', x + w / 2, y + 46, '#1E3A8A', 8, 'center', null);
  text(c, '0', x + w / 2, y + 100, '#DC2626', 24, 'center', '#F4A0A0');
  text(c, 'RECORD: 1', x + w / 2, y + 124, '#3A3F48', 8, 'center', null);
  for (const [bx, by] of [[x + 3, y + 3], [x + w - 5, y + 3], [x + 3, y + h - 5], [x + w - 5, y + h - 5]]) screw(c, bx, by);
  // (the marker on its string, dried out)
  box(c, x + 30, y + h - 2, 1, 30, '#E8E4D8');
  box(c, x + 27, y + h + 26, 7, 18, INK); box(c, x + 28, y + h + 27, 5, 13, '#2A3A9A'); box(c, x + 28, y + h + 40, 5, 3, '#1A1A1A');
};

/** The fire exit, chained and padlocked, boxes of the park's spare cheer stacked in front of it. */
const fireExit = (c: Ctx) => {
  const x = rx(566), y = 410, w = 78, h = G - 410;
  shade(c, x - 5, y - 5, w + 10, h + 5, 0.3, 4);
  box(c, x - 6, y - 6, w + 12, h + 6, INK);
  slab(c, x - 5, y - 5, w + 10, h + 5, '#3A3F48', { ink: false });
  slab(c, x, y, w, h, '#5A4A44');
  box(c, x + w / 2, y, 1, h, '#2A201C');
  text(c, 'KEEP CLEAR', x + w / 2, y + 22, '#D8D0C0', 6, 'center', '#2A201C');
  // (the crash bar, a chain round it, a padlock)
  slab(c, x + 6, y + 60, w - 12, 7, '#A3ABB6', { ink: true });
  for (let k = 0; k < 9; k++) { const lx = x + 8 + k * 7; c.strokeStyle = k % 2 ? '#8A8E96' : '#B8BCC4'; c.lineWidth = 2; c.strokeRect(lx, y + 58 + (k % 2) * 3, 6, 5); }
  box(c, x + w / 2 - 5, y + 68, 10, 10, INK); box(c, x + w / 2 - 4, y + 69, 8, 8, '#B08A2A'); box(c, x + w / 2 - 4, y + 69, 8, 2, '#D8B650'); box(c, x + w / 2 - 1, y + 72, 2, 3, INK);
  // (the sign over it, on a bracket: lit, the one light in here somebody keeps on)
  box(c, x + 10, 362, 3, 10, '#3A3F48'); box(c, x + w - 13, 362, 3, 10, '#3A3F48');
  steppedGlow(c, x + w / 2, 382, 40, '#FF5A4A', 0.08, 0.0, 4);
  wallSign(c, x + w / 2 - 44, 372, 'FIRE EXIT', '#4A0E0E', '#FF6A50');
  // (the boxes: labels sized to their words)
  const crate = (bx: number, by: number, bw: number, bh: number, label: string, seed: number) => {
    const cr = rampOf('#9A7044');
    shade(c, bx, by, bw, bh, 0.3, 3);
    slab(c, bx, by, bw, bh, '#9A7044');
    dimTop(c, bx, by, bw, '#9A7044', 4);
    box(c, bx + bw / 2 - 5, by + 2, 10, bh * 0.4, 'rgba(206, 186, 130, 0.7)');
    if (label) {
      const lw = label.length * 6 + 6;
      box(c, bx + bw / 2 - lw / 2, by + bh - 18, lw, 11, '#D8C8A0');
      text(c, label, bx + bw / 2, by + bh - 9, '#3A2A18', 6, 'center', null);
    }
    if (hash(seed) > 0.4) pixelBlob(c, bx + bw * 0.7, by + bh - 6, bw * 0.25, 6, 'rgba(60, 40, 16, 0.4)');
    box(c, bx + 2, by + bh - 2, bw - 4, 1, cr[0]);
  };
  crate(rx(524), G - 48, 60, 48, 'BUNTING', 1);
  crate(rx(584), G - 40, 72, 40, 'FOAM HANDS', 2);
  crate(rx(656), G - 64, 48, 64, 'FLAGS', 3);
  crate(rx(536), G - 90, 68, 42, 'SPARKLERS', 4);
  crate(rx(606), G - 72, 46, 32, 'MISC', 5);
  crate(rx(664), G - 90, 32, 26, '', 6);
  // (an open flap, foam hands poking out)
  poly(c, [rx(664), G - 90, rx(672), G - 102, rx(676), G - 90], '#B48A58');
  for (let k = 0; k < 2; k++) { box(c, rx(676 + k * 10), G - 104 + k * 4, 8, 14, INK); box(c, rx(677 + k * 10), G - 103 + k * 4, 6, 12, k ? '#2D51B0' : '#D93A2E'); box(c, rx(679 + k * 10), G - 110 + k * 4, 3, 7, k ? '#2D51B0' : '#D93A2E'); }
};

/** An overflowing trash can, what didn't fit round it on the floor. */
const trash = (c: Ctx) => {
  const x = rx(708);
  pole(c, x, G - 56, 48, 56, '#5B6B7A');
  for (const yy of [G - 50, G - 30, G - 10]) { box(c, x, yy, 48, 2, '#3A4652'); box(c, x, yy + 2, 48, 1, '#7A8A98'); }
  box(c, x - 2, G - 58, 52, 4, INK);
  // (the heap: bags, cups, a pizza box, a banana peel)
  pixelBlob(c, x + 24, G - 64, 30, 14, '#1E1E22'); pixelBlob(c, x + 18, G - 68, 18, 10, '#34343C'); pixelBlob(c, x + 14, G - 72, 8, 4, '#4A4A54');
  poly(c, [x + 26, G - 62, x + 58, G - 76, x + 60, G - 70, x + 30, G - 56], '#B4844A'); line(c, [x + 26, G - 62, x + 58, G - 76], '#D8B070');
  box(c, x + 6, G - 82, 10, 14, INK); box(c, x + 7, G - 81, 8, 12, '#F1EFEA'); box(c, x + 7, G - 77, 8, 3, '#B91C1C');
  poly(c, [x + 34, G - 80, x + 42, G - 84, x + 40, G - 74], '#D8C030'); poly(c, [x + 40, G - 74, x + 46, G - 70, x + 40, G - 70], '#A89020');
  for (const [lx, w_, col] of [[-16, 10, '#F1EFEA'], [52, 8, '#9A7044'], [60, 12, '#B91C1C']] as const) { box(c, x + lx, G - 5, w_, 5, INK); box(c, x + lx + 1, G - 4, w_ - 2, 3, col); }
  pixelBlob(c, x + 24, G - 2, 30, 3, 'rgba(70, 50, 16, 0.4)');
};

/** The mural the park painted on the wall to keep spirits up: faded, peeling, a mustache drawn on the star. */
const mural = (c: Ctx) => {
  const x = rx(796), y = 106, w = 264, h = 140, k = 0.52;
  box(c, x, y, w, h, fade(FLAG_BLUE[2], k));
  checker(c, x, y + h - 2, w, 2, fade(FLAG_BLUE[1], k));
  for (let i = 0; i < 4; i++) { box(c, x, y + h - 30 + i * 8, w, 4, fade(FLAG_RED[2], k)); box(c, x, y + h - 26 + i * 8, w, 4, fade(FLAG_WHITE[3], k)); }
  for (let i = 0; i < 9; i++) star(c, x + 16 + i * 30, y + 14 + (i % 2) * 6, 5, fade('#F1EFEA', k));
  text(c, 'HAPPY LAND', x + w / 2 + 30, y + 54, fade('#F06A55', k - 0.08), 16, 'center', fade('#F1EFEA', k));
  text(c, 'FUN IS MANDATORY', x + w / 2 + 30, y + 82, fade('#FFF0A0', k - 0.05), 8, 'center', fade(INK, k));
  // (the park's star, grinning, a mustache in marker)
  const sx = x + 38, sy = y + 66;
  star(c, sx + 2, sy + 2, 30, fade(INK, k)); star(c, sx, sy, 30, fade('#F2CC4A', k - 0.05));
  box(c, sx - 8, sy - 6, 4, 6, fade(INK, 0.3)); box(c, sx + 4, sy - 6, 4, 6, fade(INK, 0.3));
  c.strokeStyle = fade(INK, 0.3); c.lineWidth = 2; c.beginPath(); c.arc(sx, sy + 2, 8, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  line(c, [sx - 10, sy + 4, sx - 4, sy + 1, sx, sy + 3, sx + 4, sy + 1, sx + 10, sy + 4], '#1A1A1A', 2);
  // (peeled, and somebody scratched HELP into it)
  for (const [px, py, pw, ph] of [[60, 20, 30, 18], [200, 100, 36, 20], [250, 30, 18, 24], [140, 120, 24, 14]]) peel(c, x + px, y + py, pw, ph);
  text(c, 'HELP', x + w - 30, y + 112, 'rgba(30, 30, 30, 0.55)', 6, 'center', null);
  for (let i = 0; i < 6; i++) box(c, x + 20 + i * 44, y + h, 2, 6 + (i % 3) * 5, fade(FLAG_BLUE[2], k));
};

/** A bank of six lockers: dented, taped, stickered, one hanging open, a mascot's tail shut in another. Tops unlit. */
const lockers = (c: Ctx) => {
  const x0 = rx(810), y = 334, lw = 42, h = G - y;
  const cols = ['#3C557A', '#3C557A', '#7A3C3C', '#3C557A', '#6B6F68', '#3C557A'];
  shade(c, x0, y, lw * 6, h, 0.35, 4);
  for (let i = 0; i < 6; i++) {
    const x = x0 + i * lw, col = cols[i], r = rampOf(col);
    slab(c, x, y, lw, h, col);
    dimTop(c, x, y, lw, col, 4);
    for (let k = 0; k < 5; k++) { box(c, x + 10, y + 12 + k * 5, lw - 20, 2, r[0]); box(c, x + 10, y + 14 + k * 5, lw - 20, 1, r[3]); }
    for (let k = 0; k < 5; k++) { box(c, x + 10, y + h - 40 + k * 5, lw - 20, 2, r[0]); box(c, x + 10, y + h - 38 + k * 5, lw - 20, 1, r[3]); }
    box(c, x + lw - 12, y + 92, 5, 22, INK); box(c, x + lw - 11, y + 93, 3, 20, '#A3ABB6'); box(c, x + lw - 11, y + 93, 1, 20, '#F6F8FA');
    box(c, x + 14, y + 44, 14, 7, '#B08A2A'); box(c, x + 14, y + 44, 14, 1, '#F4E08C');
    // (rust along the foot)
    for (let k = 0; k < 6; k++) box(c, x + 3 + Math.floor(hash(i * 9 + k) * (lw - 8)), y + h - 6 - Math.floor(hash(i + k * 3) * 10), 3, 2, '#6A3418');
    if (hash(i * 4.3) > 0.4) { const dx = x + 8 + hash(i) * 20, dy = y + 60 + hash(i * 2) * 80; oval(c, dx, dy, 7, 9, r[1]); oval(c, dx - 1, dy - 2, 5, 6, r[0]); box(c, dx + 4, dy + 4, 3, 2, r[3]); }
  }
  // (0: do not open; 1: stickers; 2: chained; 4: not my smell; 5: duct tape, the tail)
  note(c, x0 + 6, y + 64, ['DO', 'NOT', 'OPEN'], { paper: '#F2E890' });
  line(c, [x0 + 8, y + 10, x0 + 34, y + 36], 'rgba(170, 170, 160, 0.9)', 4); line(c, [x0 + 34, y + 10, x0 + 8, y + 36], 'rgba(170, 170, 160, 0.9)', 4);
  { const x = x0 + lw; shinyStar(c, x + 14, y + 74, 7, '#F2CC4A'); ball(c, x + 28, y + 128, 6, '#E8C040'); box(c, x + 25, y + 126, 2, 2, INK); box(c, x + 30, y + 126, 2, 2, INK); box(c, x + 25, y + 130, 6, 1, INK);
    box(c, x + 6, y + 150, 30, 12, INK); box(c, x + 7, y + 151, 28, 10, '#F1EFEA'); text(c, 'USA', x + 21, y + 160, '#B91C1C', 6, 'center', null); }
  { const x = x0 + lw * 2; for (let k = 0; k < 7; k++) { c.strokeStyle = k % 2 ? '#8A8E96' : '#B8BCC4'; c.lineWidth = 2; c.strokeRect(x + 6 + k * 5, y + 100 + (k % 2) * 2, 5, 4); }
    box(c, x + 18, y + 106, 10, 10, INK); box(c, x + 19, y + 107, 8, 8, '#B08A2A'); }
  // (3: hanging open: the inside, the staff polo on a hook, a glove, a photo, sneakers; the door swung out)
  { const x = x0 + lw * 3;
    box(c, x + 2, y + 2, lw - 4, h - 4, '#14161C'); bandedGradient(c, x + 3, y + 3, lw - 6, h - 6, ['#0E1016', '#1E222C', '#262A34'], 4);
    box(c, x + 3, y + 40, lw - 6, 3, '#3A4048');
    box(c, x + 20, y + 46, 2, 6, '#A3ABB6');
    poly(c, [x + 8, y + 54, x + 34, y + 54, x + 36, y + 66, x + 30, y + 66, x + 30, y + 110, x + 12, y + 110, x + 12, y + 66, x + 6, y + 66], '#9B2020');
    poly(c, [x + 8, y + 54, x + 18, y + 54, x + 14, y + 110, x + 12, y + 110, x + 12, y + 66, x + 6, y + 66], '#BE3A2E');
    star(c, x + 26, y + 72, 4, '#F1EFEA'); box(c, x + 18, y + 54, 6, 4, '#F1EFEA');
    pixelBlob(c, x + 21, y + 34, 10, 5, '#E8E4D8'); for (let k = 0; k < 4; k++) box(c, x + 13 + k * 4, y + 24, 3, 8, '#E8E4D8');
    box(c, x + 6, y + 12, 12, 14, '#E8E4D8'); box(c, x + 7, y + 13, 10, 9, '#5A7AA0'); box(c, x + 9, y + 16, 4, 4, '#D49A70');
    for (const sx of [x + 6, x + 22]) { box(c, sx, G - 14, 14, 8, INK); box(c, sx + 1, G - 13, 12, 6, '#E8E4D8'); box(c, sx + 1, G - 9, 12, 2, '#B91C1C'); }
    const dc = rampOf(cols[3]);
    poly(c, [x + lw - 2, y, x + lw + 12, y + 12, x + lw + 12, y + h - 4, x + lw - 2, y + h], INK);
    poly(c, [x + lw - 1, y + 2, x + lw + 10, y + 13, x + lw + 10, y + h - 6, x + lw - 1, y + h - 2], dc[1]);
    poly(c, [x + lw - 1, y + 2, x + lw + 3, y + 6, x + lw + 3, y + h - 3, x + lw - 1, y + h - 2], dc[2]);
    for (let k = 0; k < 4; k++) box(c, x + lw + 5, y + 18 + k * 6, 4, 2, dc[0]); }
  note(c, x0 + lw * 4 - 1, y + 70, ['NOT MY', 'SMELL'], { paper: '#C8E0F0' });
  { const x = x0 + lw * 5; box(c, x + 8, y + 120, 24, 16, '#8A8E8A'); box(c, x + 8, y + 120, 24, 1, '#B0B4B0'); for (let k = 0; k < 4; k++) box(c, x + 10 + k * 6, y + 122, 1, 12, '#6A6E6A');
    pixelBlob(c, x + 18, y + h - 6, 7, 6, '#9A6A30'); pixelBlob(c, x + 16, y + h - 2, 5, 5, '#C49A62'); box(c, x + 10, y + h - 14, 18, 2, INK); }
  // (on top: a box nobody's opened since, dim)
  slab(c, x0 + 14, y - 22, 40, 22, dim('#9A7044'), { ink: false }); dimTop(c, x0 + 14, y - 22, 40, dim('#9A7044'), 3);
  slab(c, x0 + 190, y - 16, 30, 16, dim('#5B6B7A'), { ink: false }); dimTop(c, x0 + 190, y - 16, 30, dim('#5B6B7A'), 3);
  // (the bench in front: seat unlit, a sock, an energy drink)
  const bx = rx(830), bw = 210;
  for (const lx of [bx + 10, bx + bw - 16]) { box(c, lx, 512, 6, G - 512, INK); box(c, lx + 1, 512, 4, G - 512, '#6B737E'); }
  box(c, bx - 1, 503, bw + 2, 11, INK); box(c, bx, 504, bw, 9, '#6A4E30'); box(c, bx, 504, bw, 2, '#5A4026'); box(c, bx, 508, bw, 1, '#3E2C1A'); box(c, bx, 511, bw, 2, '#4A3420');
  poly(c, [bx + 60, G - 2, bx + 76, G - 4, bx + 80, G, bx + 60, G], '#E8E4D8'); box(c, bx + 60, G - 2, 6, 2, '#B91C1C');
  pole(c, bx + 150, G - 14, 7, 14, '#2D9A3A'); box(c, bx + 150, G - 14, 7, 2, '#A3ABB6');
};

/** The costume closet: its door hanging off the one hinge, inside a mess of foam and fur. COSTUMES over it. */
const closet = (c: Ctx) => {
  const x = rx(1086), y = 300, w = 140, h = G - y;
  plate(c, x + w / 2, 268, ['COSTUMES'], '#2A3A6A', '#F2CC4A');
  shade(c, x - 6, y - 6, w + 12, h + 6, 0.3, 4);
  box(c, x - 7, y - 7, w + 14, h + 7, INK);
  slab(c, x - 6, y - 6, w + 12, h + 6, '#6A4A2A', { ink: false });
  bandedGradient(c, x, y, w, h, ['#0A090C', '#16131A', '#221D24', '#1A161C'], 6);
  // (the rod, costumes on it in the dark)
  box(c, x + 4, y + 18, w - 8, 3, '#5A5E66');
  for (let i = 0; i < 4; i++) {
    const cx = x + 18 + i * 22, col = dark(['#9B1530', '#2D51B0', '#5C3A16', '#D4A017'][i], 0.35);
    poly(c, [cx - 8, y + 22, cx + 8, y + 22, cx + 10, y + 120 + (i % 2) * 14, cx - 10, y + 124], col);
    poly(c, [cx - 8, y + 22, cx - 2, y + 22, cx - 4, y + 120, cx - 10, y + 124], lite(col, 0.15));
  }
  // (a shelf up the back: a foam crown, a busted head)
  box(c, x + 92, y + 56, 44, 4, dim('#5A4026'));
  poly(c, [x + 96, y + 56, x + 100, y + 40, x + 104, y + 50, x + 110, y + 36, x + 116, y + 50, x + 122, y + 40, x + 126, y + 56], fade('#4CA084', 0.2));
  ball(c, x + 112, y + 90, 18, dark('#E8C040', 0.3)); box(c, x + 103, y + 84, 6, 6, INK); line(c, [x + 115, y + 82, x + 123, y + 90], INK, 2); line(c, [x + 123, y + 82, x + 115, y + 90], INK, 2);
  box(c, x + 92, y + 108, 44, 4, dim('#5A4026'));
  note(c, x + 46, y + 140, ['RETURN HEADS', 'OR PAY $40'], { paper: '#D8D0B8' });
  // (on the floor of it: a giant foam finger, a mascot foot, shoes)
  poly(c, [x + 10, G - 2, x + 30, G - 90, x + 42, G - 88, x + 30, G - 2], '#2D51B0'); poly(c, [x + 30, G - 90, x + 34, G - 120, x + 42, G - 118, x + 42, G - 88], '#2D51B0');
  line(c, [x + 30, G - 90, x + 34, G - 120], '#4570D0', 2);
  oval(c, x + 90, G - 10, 26, 10, INK); oval(c, x + 90, G - 11, 24, 8, '#7A5224'); oval(c, x + 84, G - 14, 12, 4, '#9A6C36');
  for (let k = 0; k < 3; k++) { box(c, x + 50 + k * 14, G - 8, 12, 8, INK); box(c, x + 51 + k * 14, G - 7, 10, 6, ['#2A2A2A', '#6A4C24', '#E8E4D8'][k]); }
  // (the door: off its top hinge, swung out, sagging on the bottom one)
  poly(c, [x - 6, y - 4, x - 34, y + 18, x - 34, G, x - 6, G], INK);
  poly(c, [x - 7, y - 2, x - 32, y + 19, x - 32, G - 1, x - 7, G - 1], '#7A5A38');
  poly(c, [x - 7, y - 2, x - 16, y + 6, x - 16, G - 1, x - 7, G - 1], '#9A7A50');
  poly(c, [x - 26, y + 14, x - 32, y + 19, x - 32, G - 1, x - 26, G - 1], '#5A3E22');
  for (const py of [y + 60, y + 150]) line(c, [x - 10, py, x - 30, py + 8], '#5A3E22', 2);
  box(c, x - 10, G - 30, 4, 12, '#B08A2A');
  line(c, [x - 6, y + 4, x - 1, y + 2, x - 4, y + 8, x + 1, y + 10], '#C49A62', 2);
};

/** One mascot suit on a hanger: no head, limp, the arms hanging, the legs crumpled, pits gone dark. */
const suit = (c: Ctx, cx: number, top: number, col: string, kind: number) => {
  const r = rampOf(col);
  line(c, [cx, top - 10, cx, top - 4, cx + 4, top - 8, cx + 2, top - 12], INK, 2);
  line(c, [cx - 16, top + 2, cx, top - 4, cx + 16, top + 2], '#5A4026', 3);
  const body = [cx - 15, top, cx + 15, top, cx + 13, top + 70, cx + 16, top + 130, cx + 4, top + 150, cx - 4, top + 148, cx - 16, top + 132, cx - 13, top + 70];
  const out = body.map((v, i) => (i % 2 ? v : v + (v < cx ? -1 : 1)));
  poly(c, out, INK);
  poly(c, body, r[2]);
  poly(c, [cx - 15, top, cx - 5, top, cx - 6, top + 146, cx - 16, top + 132, cx - 13, top + 70], r[3]);
  poly(c, [cx + 7, top, cx + 15, top, cx + 13, top + 70, cx + 16, top + 130, cx + 4, top + 150], r[1]);
  checker(c, cx - 6, top + 4, 4, 140, r[3]); checker(c, cx + 5, top + 4, 2, 140, r[1], 1);
  // (the arms: empty sleeves straight down, the paws hanging)
  for (const s of [-1, 1]) {
    const ax = cx + s * 17 - (s > 0 ? 0 : 6);
    box(c, ax - 1, top + 3, 8, 82, INK); box(c, ax, top + 4, 6, 80, s < 0 ? r[3] : r[1]);
    oval(c, ax + 3, top + 88, 6, 7, INK); oval(c, ax + 3, top + 88, 5, 6, kind === 0 ? '#E8C040' : '#F1EFEA');
  }
  // (each its own)
  if (kind === 0) { poly(c, [cx - 15, top, cx + 15, top, cx + 10, top + 16, cx - 10, top + 16], '#F1EFEA'); for (let k = 0; k < 5; k++) box(c, cx - 10 + k * 5, top + 30 + (k % 2) * 8, 3, 6, r[0]); }
  if (kind === 1) { for (let k = 0; k < 3; k++) shinyStar(c, cx - 6 + (k % 2) * 12, top + 30 + k * 30, 5, '#F1EFEA'); }
  if (kind === 2) { for (let k = 0; k < 4; k++) box(c, cx - 12 + k * 7, top + 2, 3, 140 - (k === 0 || k === 3 ? 14 : 0), 'rgba(241, 239, 234, 0.75)'); }
  if (kind === 3) { shinyStar(c, cx, top + 44, 10, '#F1EFEA'); for (let k = 0; k < 8; k++) box(c, cx - 12 + (k * 7) % 24, top + 80 + k * 7, 2, 2, r[4]); }
  // (sweat: the pits, the seat)
  pixelBlob(c, cx - 11, top + 12, 5, 8, 'rgba(40, 30, 10, 0.35)'); pixelBlob(c, cx + 11, top + 12, 5, 8, 'rgba(40, 30, 10, 0.35)');
  pixelBlob(c, cx, top + 120, 8, 10, 'rgba(40, 30, 10, 0.25)');
};

/** The rolling rack of suits; one's slid off into a heap underneath. The AC vent over it, furred with dust. */
const rack = (c: Ctx) => {
  const x0 = rx(1250), x1 = rx(1432), top = 330;
  for (const ux of [x0 + 4, x1 - 10]) pole(c, ux, top, 6, G - 14 - top, '#A3ABB6');
  pole(c, x0, G - 16, x1 - x0, 5, '#8A929C', true);
  box(c, x0 - 2, top - 2, x1 - x0 + 4, 7, INK); box(c, x0, top, x1 - x0, 3, '#D3D9E0'); box(c, x0, top + 3, x1 - x0, 2, '#6B737E');
  for (const wx of [x0 + 8, x0 + 22, x1 - 22, x1 - 8]) ball(c, wx, G - 5, 5, '#2A2A2E');
  const suits: [number, string][] = [[1288, '#7A5224'], [1330, '#D4A017'], [1372, '#B91C1C'], [1412, '#2D51B0']];
  suits.forEach(([sx, col], i) => suit(c, rx(sx), top + 12, col, i));
  // (the one that fell)
  pixelBlob(c, rx(1350), G - 6, 40, 8, INK); pixelBlob(c, rx(1350), G - 7, 38, 6, '#2D7A3A'); pixelBlob(c, rx(1340), G - 9, 18, 3, '#4CA04A');
  // (the vent up by the ceiling: dust hanging off it, a black streak down the wall under it)
  const vx = rx(1290), vy = 84;
  for (let k = 0; k < 5; k++) box(c, vx + 10 + k * 16, vy + 30, 6, 40 + (k % 2) * 30, 'rgba(26, 24, 18, 0.18)');
  shade(c, vx, vy, 100, 30);
  slab(c, vx, vy, 100, 30, '#8A8C84');
  for (let k = 0; k < 6; k++) { box(c, vx + 6, vy + 5 + k * 4, 88, 2, '#2A2C28'); box(c, vx + 6, vy + 7 + k * 4, 88, 1, '#B0B2A8'); }
  for (let k = 0; k < 7; k++) { const dx = vx + 8 + k * 13; pixelBlob(c, dx, vy + 30, 3, 3 + (k % 3) * 2, '#9A988C'); box(c, dx, vy + 30, 1, 6 + (k % 4) * 3, '#8A887C'); }
};

/** The spare heads on their shelf, grinning; a headless body slumped in a chair under them on its break. */
const heads = (c: Ctx) => {
  const x0 = rx(1450), x1 = rx(1720), sy = 396;
  for (const bx of [x0 + 20, x1 - 30]) { shade(c, bx, sy + 6, 10, 18); poly(c, [bx, sy + 6, bx + 10, sy + 6, bx + 10, sy + 26], INK); poly(c, [bx + 1, sy + 7, bx + 8, sy + 7, bx + 8, sy + 22], '#6B737E'); screw(c, bx + 6, sy + 16); }
  shade(c, x0, sy, x1 - x0, 8);
  box(c, x0 - 1, sy - 1, x1 - x0 + 2, 10, INK); box(c, x0, sy, x1 - x0, 8, '#4A4E56'); box(c, x0, sy + 6, x1 - x0, 2, '#2E3238');
  const H: [number, string][] = [[1490, '#E05A9A'], [1555, '#E8C040'], [1620, '#4A86D8'], [1685, '#3EB860']];
  H.forEach(([hx, col], i) => {
    const x = rx(hx), y = sy - 24;
    oval(c, x + 4, sy - 1, 22, 3, 'rgba(18, 12, 6, 0.4)');
    ball(c, x, y, 24, col);
    checker(c, x - 18, y - 4, 10, 14, rampOf(col)[3]);
    // (the eyes, staring; one googly eye fallen to the bottom)
    for (const s of [-1, 1]) {
      oval(c, x + s * 9, y - 7, 7, 9, INK); oval(c, x + s * 9, y - 7, 6, 8, '#FFFFFF');
      const dy = i === 2 && s > 0 ? 4 : -1;
      box(c, x + s * 9 - 2, y - 7 + dy, 5, 5, INK); box(c, x + s * 9 - 1, y - 7 + dy, 2, 2, '#FFFFFF');
    }
    // (the grin)
    c.fillStyle = INK; c.beginPath(); c.arc(x, y + 5, 14, 0.05 * Math.PI, 0.95 * Math.PI); c.closePath(); c.fill();
    c.fillStyle = '#5A0A1A'; c.beginPath(); c.arc(x, y + 5, 12, 0.08 * Math.PI, 0.92 * Math.PI); c.closePath(); c.fill();
    for (let k = 0; k < 5; k++) box(c, x - 10 + k * 4, y + 6, 3, 4, '#F4F0E0');
    // (the neck hole, under, dark)
    oval(c, x, y + 22, 11, 3, '#0A0A0E');
    if (i === 1) { tape(c, x + 6, y - 22, 12, 5); }
  });
  // (its plate hung off the shelf's far end, clear of the ladder)
  plate(c, rx(1660), 414, ['SPARE HEADS'], '#2A2E36', '#F4F4F5');
  for (const wx of [rx(1660) - 50, rx(1660) + 50]) box(c, wx, sy + 8, 1, 6, '#A3ABB6');
  // (the chair: an orange shell on legs, faded)
  const cx = rx(1530);
  shade(c, cx - 34, 440, 68, 60, 0.3);
  slab(c, cx - 34, 440, 68, 56, fade('#D86A2A', 0.15));
  for (const lx of [cx - 30, cx + 26]) { box(c, lx, 500, 4, G - 500, INK); box(c, lx + 1, 500, 2, G - 500, '#8A929C'); }
  // (the body: the blue bear, slumped over to one side, a can in its paw)
  const B = rampOf('#3D5A9A');
  oval(c, cx + 6, 474, 33, 33, INK); oval(c, cx + 6, 474, 32, 32, B[2]); oval(c, cx - 2, 466, 22, 22, B[3]); oval(c, cx + 18, 486, 18, 16, B[1]);
  checker(c, cx - 18, 450, 40, 40, B[3]);
  oval(c, cx + 8, 490, 16, 12, '#F1EFEA'); shinyStar(c, cx + 8, 488, 8, fade('#B91C1C', 0.1));
  oval(c, cx + 4, 444, 14, 5, INK); oval(c, cx + 4, 444, 12, 4, '#0A0A0E'); box(c, cx - 4, 441, 16, 1, B[4]);
  for (const lx of [cx - 12, cx + 16]) { box(c, lx - 1, 498, 16, G - 506, INK); box(c, lx, 498, 14, G - 508, B[1]); box(c, lx, 498, 5, G - 508, B[2]); oval(c, lx + 8, G - 5, 13, 6, INK); oval(c, lx + 8, G - 6, 12, 5, B[2]); oval(c, lx + 4, G - 8, 6, 2, B[3]); }
  box(c, cx - 33, 466, 10, 60, INK); box(c, cx - 32, 466, 8, 58, B[2]); oval(c, cx - 28, 528, 7, 6, INK); oval(c, cx - 28, 528, 6, 5, '#F1EFEA');
  box(c, cx + 32, 470, 10, 26, INK); box(c, cx + 33, 470, 8, 24, B[1]); oval(c, cx + 34, 498, 7, 6, INK); oval(c, cx + 34, 498, 6, 5, '#F1EFEA');
  pole(c, cx + 38, 488, 8, 13, '#B91C1C'); box(c, cx + 38, 488, 8, 2, '#D3D9E0');
  // (up the wall: the safety poster, the clock and its plaque, the first aid box with one bandage left)
  const px = rx(1392), py = 140, pw = 144, ph = 150;
  shade(c, px, py, pw, ph, 0.35, 3);
  box(c, px, py, pw, ph, '#E2D6B2'); box(c, px, py, pw, 1, '#F4ECD0'); box(c, px + pw - 2, py, 2, ph, '#B8AC88');
  box(c, px, py, pw, 24, '#2F7D3A'); box(c, px, py, pw, 2, '#4CA04A'); box(c, px, py + 22, pw, 2, '#1E5A2A');
  text(c, 'SAFETY FIRST', px + pw / 2, py + 16, '#F4ECD0', 8, 'center', '#123A1C');
  text(c, 'INJURIES', px + pw / 2, py + 42, '#3A2A18', 8, 'center', null);
  text(c, 'THIS YEAR:', px + pw / 2, py + 56, '#3A2A18', 8, 'center', null);
  ['2', '1', '4'].forEach((d, i) => { const dx = px + pw / 2 - 33 + i * 23; box(c, dx, py + 64, 20, 28, INK); box(c, dx + 1, py + 65, 18, 13, '#2A2A2E'); box(c, dx + 1, py + 78, 18, 13, '#1A1A1E'); text(c, d, dx + 10, py + 87, '#F4F4F5', 16, 'center', null); });
  text(c, 'AND COUNTING!', px + pw / 2, py + 108, '#B91C1C', 8, 'center', null);
  text(c, 'KEEP SMILING', px + pw / 2, py + 130, '#3A2A18', 6, 'center', null);
  ball(c, px + pw / 2, py + 140, 4, '#E8C040', false);
  poly(c, [px + pw, py + ph - 14, px + pw, py + ph, px + pw - 14, py + ph], 'rgba(18, 12, 6, 0.35)');
  poly(c, [px + pw - 14, py + ph, px + pw, py + ph - 14, px + pw - 14, py + ph - 14], '#B8AC88');
  tape(c, px - 3, py - 2, 12, 6); tape(c, px + pw - 9, py - 2, 12, 6); tape(c, px - 3, py + ph - 4, 12, 6);
  const kx = rx(1680), ky = 186;
  oval(c, kx + 3, ky + 3, 22, 22, 'rgba(18, 12, 6, 0.35)');
  ball(c, kx, ky, 21, '#3A3F48'); ball(c, kx, ky, 17, '#EDE6D0', false);
  for (let k = 0; k < 12; k++) { const t = k * Math.PI / 6; box(c, Math.round(kx + Math.cos(t) * 14), Math.round(ky + Math.sin(t) * 14), 2, 2, INK); }
  line(c, [kx, ky, kx - 6, ky - 10], INK, 2); line(c, [kx, ky, kx + 12, ky + 2], INK, 1);
  line(c, [kx - 14, ky - 6, kx + 2, ky + 4, kx + 10, ky + 14], 'rgba(26, 11, 6, 0.5)');
  plate(c, kx, 216, ['TIME THEFT', 'IS THEFT'], '#4A3A20', '#F2CC4A');
  const fx = rx(1612), fy = 268, fw = 66, fh = 46;
  shade(c, fx, fy, fw, fh);
  slab(c, fx, fy, fw, fh, '#E8E4D8');
  box(c, fx + 4, fy + 4, fw - 8, 11, '#B91C1C'); text(c, 'FIRST AID', fx + fw / 2, fy + 13, '#F4F0E0', 6, 'center', null);
  box(c, fx + 4, fy + 17, fw - 8, fh - 21, '#3A3A40'); box(c, fx + 5, fy + 18, fw - 10, fh - 23, '#5A5A62');
  box(c, fx + 10, fy + 34, 14, 5, '#E8C8A0'); box(c, fx + 15, fy + 34, 4, 5, '#F4ECD8');
  box(c, fx + 34, fy + 20, 24, 1, '#3A3A40');
  poly(c, [fx + fw, fy + 16, fx + fw + 12, fy + 21, fx + fw + 12, fy + fh - 4, fx + fw, fy + fh], INK); poly(c, [fx + fw + 1, fy + 18, fx + fw + 11, fy + 22, fx + fw + 11, fy + fh - 5, fx + fw + 1, fy + fh - 2], '#D8D4C8');
};

/** The laundry cart, heaped with sweaty costume parts, a striped sleeve over the side. */
const laundry = (c: Ctx) => {
  const x = rx(1598), w = 112, y = 470;
  shade(c, x, y, w, G - y - 10, 0.3);
  poly(c, [x - 1, y - 1, x + w + 1, y - 1, x + w - 5, G - 11, x + 5, G - 11], INK);
  poly(c, [x, y, x + w, y, x + w - 6, G - 12, x + 6, G - 12], '#A89E80');
  poly(c, [x, y, x + 20, y, x + 22, G - 12, x + 6, G - 12], '#BCB294');
  poly(c, [x + w - 18, y, x + w, y, x + w - 6, G - 12, x + w - 18, G - 12], '#8A8064');
  for (let k = 0; k < 4; k++) pixelBlob(c, x + 20 + k * 26, y + 30 + (k % 2) * 14, 10, 6, 'rgba(90, 70, 30, 0.3)');
  text(c, 'LAUNDRY', x + w / 2, y + 26, fade('#2D51B0', 0.25), 8, 'center', null);
  box(c, x - 2, y - 2, w + 4, 4, '#6B737E'); box(c, x - 2, y - 2, w + 4, 1, '#A3ABB6');
  for (const wx of [x + 10, x + w - 10]) { box(c, wx - 1, G - 12, 3, 6, '#3A4048'); ball(c, wx, G - 5, 5, '#2A2A2E'); }
  // (the heap)
  pixelBlob(c, x + 30, y - 10, 28, 14, '#D4A017'); pixelBlob(c, x + 70, y - 12, 30, 16, '#7A5224'); pixelBlob(c, x + 54, y - 22, 18, 10, '#2D51B0');
  pixelBlob(c, x + 26, y - 14, 10, 6, '#F2CC4A'); pixelBlob(c, x + 66, y - 18, 12, 6, '#9A6C36');
  for (let k = 0; k < 5; k++) box(c, x + 6 + k * 6, y, 6, 30, k % 2 ? '#F1EFEA' : '#B91C1C');
  box(c, x + 5, y + 30, 32, 6, INK); box(c, x + 6, y + 30, 30, 5, '#F1EFEA');
  oval(c, x + 92, y - 2, 10, 8, INK); oval(c, x + 92, y - 2, 9, 7, '#F1EFEA'); for (let k = 0; k < 3; k++) box(c, x + 96 + k * 3, y + 4, 2, 8, '#F1EFEA');
};

/** NOT FOR GUESTS on the wall by the punching bag; the hole somebody punched in the tile instead. */
const bagWall = (c: Ctx) => {
  wallSign(c, rx(1694), 262, 'NOT FOR GUESTS', '#2A2E36', '#FDE047');
  const hx = rx(1790), hy = 470;
  pixelBlob(c, hx, hy, 16, 12, '#2A2618'); pixelBlob(c, hx - 2, hy - 2, 10, 7, '#141208');
  for (const [ex, ey] of [[-26, -14], [24, -10], [-20, 16], [22, 18], [2, -22]]) line(c, [hx, hy, hx + ex, hy + ey], 'rgba(26, 11, 6, 0.6)');
  for (let k = 0; k < 6; k++) poly(c, [hx - 30 + k * 12, G - 2, hx - 26 + k * 12, G - 5, hx - 22 + k * 12, G - 2], '#5C6A52');
};

/** The bucket under the hole in the ceiling, a puddle round it, the leak reported (years ago). */
const leakBucket = (c: Ctx) => {
  const x = rx(1888);
  pixelBlob(c, x + 22, G - 1, 44, 3, 'rgba(150, 170, 180, 0.35)');
  shade(c, x, G - 28, 44, 28, 0.25, 2);
  poly(c, [x - 1, G - 29, x + 45, G - 29, x + 41, G, x + 3, G], INK);
  poly(c, [x, G - 28, x + 44, G - 28, x + 40, G - 1, x + 4, G - 1], '#6A7A8A');
  poly(c, [x, G - 28, x + 12, G - 28, x + 12, G - 1, x + 4, G - 1], '#8A9AAA');
  poly(c, [x + 34, G - 28, x + 44, G - 28, x + 40, G - 1, x + 34, G - 1], '#4A5866');
  box(c, x + 1, G - 30, 42, 4, '#3A4652'); box(c, x + 3, G - 29, 38, 2, '#5A7484');
  line(c, [x + 2, G - 26, x + 22, G - 40, x + 42, G - 26], '#3A4048', 1);
  note(c, rx(1884), 330, ['LEAK REPORTED', 'MAY 2009'], { paper: '#F2E890' });
  note(c, rx(1906), 362, ['STILL'], { paper: '#C8E0F0', ink: '#6E1840' });
};

/** HAPPY 4TH! pennants still up, whatever month it is: one fallen off, the string sagging where it went. */
const pennants = (c: Ctx) => {
  const x0 = rx(2252), x1 = rx(2392), y = 112, n = 9;
  tack(c, x0 - 2, y - 2, '#C02424'); tack(c, x1 - 2, y - 2, '#2D51B0');
  const sag = (k: number) => y + Math.sin(k * Math.PI) * 14 + (k > 0.3 && k < 0.6 ? 6 * Math.sin((k - 0.3) / 0.3 * Math.PI) : 0);
  const pts: number[] = [];
  for (let i = 0; i <= 20; i++) { const k = i / 20; pts.push(x0 + (x1 - x0) * k, sag(k)); }
  line(c, pts, '#C8C4B8', 1);
  'HAPPY 4TH'.split('').forEach((ch, i) => {
    if (ch === ' ' || i === 4) return;
    const k = (i + 0.5) / n, px = Math.round(x0 + (x1 - x0) * k), py = Math.round(sag(k));
    const col = fade([FLAG_RED[2], FLAG_WHITE[3], FLAG_BLUE[2]][i % 3], 0.3);
    poly(c, [px - 8, py, px + 8, py, px, py + 22], INK);
    poly(c, [px - 7, py + 1, px + 7, py + 1, px, py + 20], col);
    poly(c, [px - 7, py + 1, px - 2, py + 1, px, py + 20], lite(col, 0.15));
    text(c, ch, px, py + 11, i % 3 === 1 ? '#7A1E1A' : '#F4F0E0', 8, 'center', null);
  });
};

/** The bulletin board: cork, tacks, the memos. */
const bulletin = (c: Ctx) => {
  const x = rx(1946), y = 124, w = 192, h = 186;
  shade(c, x, y, w, h, 0.38, 4);
  slab(c, x, y, w, h, '#6A4A2A');
  box(c, x + 6, y + 6, w - 12, h - 12, '#3A2A16');
  box(c, x + 7, y + 7, w - 14, h - 14, '#A67C4E');
  checker(c, x + 7, y + 7, w - 14, h - 14, '#946A3E');
  for (let k = 0; k < 40; k++) box(c, x + 8 + Math.floor(hash(k * 3.3) * (w - 18)), y + 8 + Math.floor(hash(k * 1.7 + 9) * (h - 18)), 2, 2, k % 2 ? '#7A5430' : '#C49A62');
  note(c, x + 10, y + 10, ['MANDATORY FUN:', 'SATURDAY', '(UNPAID)'], { mount: 'tack', paper: '#F4F0E0', pinCol: '#C02424' });
  note(c, x + 102, y + 12, ['SMILING IS', 'PART OF YOUR', 'UNIFORM'], { mount: 'tack', paper: '#F2E890', pinCol: '#2D51B0' });
  note(c, x + 12, y + 52, ['BREAKS ARE A', 'PRIVILEGE'], { mount: 'tack', paper: '#F2C6D4', pinCol: '#2F7D3A' });
  note(c, x + 102, y + 54, ['PIZZA PARTY', 'CANCELED'], { mount: 'tack', paper: '#C8E0F0', pinCol: '#E8C040' });
  note(c, x + 10, y + 86, ['POTLUCK', 'SIGN UP:', '1.', '2.', '3.'], { mount: 'tack', paper: '#F4F0E0', pinCol: '#C02424' });
  note(c, x + 72, y + 88, ['DO NOT', 'DISCUSS', 'WAGES'], { mount: 'tack', paper: '#F2E890', pinCol: '#C02424' });
  note(c, x + 130, y + 86, ['HEAT IS', 'A STATE', 'OF MIND'], { mount: 'tack', paper: '#E0F0D0', pinCol: '#2D51B0' });
  note(c, x + 72, y + 132, ['SICK DAYS', 'ARE FOR', 'THE WEAK'], { mount: 'tack', paper: '#F4F0E0', pinCol: '#E8C040' });
  // (a polaroid: the mascot crew, all heads, no faces)
  const px = x + 146, py = y + 132;
  shade(c, px, py, 32, 38, 0.3, 2);
  box(c, px, py, 32, 38, '#F4F2EA'); box(c, px + 3, py + 3, 26, 24, '#5A7A8A');
  for (let k = 0; k < 3; k++) ball(c, px + 8 + k * 8, py + 16, 4, ['#E05A9A', '#E8C040', '#4A86D8'][k], false);
  tack(c, px + 15, py + 1, '#2F7D3A');
};

/** The break table, its mismatched chairs, the one that broke lying in front. Everything's top dim. */
const breakTable = (c: Ctx) => {
  const x = rx(1962), w = 156, ty = 484;
  for (const lx of [x + 8, x + w - 14]) { box(c, lx, ty + 8, 6, G - ty - 8, INK); box(c, lx + 1, ty + 8, 4, G - ty - 8, '#6B737E'); }
  box(c, x + w - 16, G - 4, 10, 4, '#E8E4D8');
  shade(c, x, ty, w, 10, 0.3, 3);
  box(c, x - 1, ty - 1, w + 2, 10, INK); box(c, x, ty, w, 8, '#9A8C6A'); box(c, x, ty, w, 2, '#86785A'); box(c, x, ty + 6, w, 2, '#6A5E44');
  for (let k = 0; k < 5; k++) pixelBlob(c, x + 14 + k * 30, ty + 4, 8, 2, 'rgba(70, 40, 20, 0.35)');
  // (on it: the pizza box with a crust, ketchup, a cupcake with a flag in it, a mug)
  poly(c, [x + 10, ty, x + 52, ty, x + 50, ty - 6, x + 12, ty - 6], '#B4844A'); poly(c, [x + 12, ty - 6, x + 50, ty - 6, x + 46, ty - 30, x + 14, ty - 30], '#C49A62');
  pixelBlob(c, x + 30, ty - 6, 10, 2, '#C88A3A');
  pole(c, x + 66, ty - 22, 9, 22, '#B91C1C'); box(c, x + 68, ty - 26, 5, 4, '#F1EFEA');
  poly(c, [x + 90, ty, x + 104, ty, x + 102, ty - 8, x + 92, ty - 8], '#E8C8E0'); pixelBlob(c, x + 97, ty - 10, 7, 4, '#F4ECD8');
  box(c, x + 97, ty - 22, 1, 12, '#C8C4B8'); box(c, x + 98, ty - 22, 7, 4, fade(FLAG_RED[2], 0.1)); box(c, x + 98, ty - 22, 3, 2, FLAG_BLUE[2]);
  box(c, x + 118, ty - 14, 14, 14, INK); box(c, x + 119, ty - 13, 12, 12, '#F1EFEA'); box(c, x + 119, ty - 13, 12, 2, '#3A2414'); line(c, [x + 132, ty - 11, x + 136, ty - 7, x + 132, ty - 3], INK, 2);
  // (chairs: a blue plastic one, a wooden one from somebody's kitchen)
  const chair = (cx: number, col: string, dir: 1 | -1) => {
    const r = rampOf(col);
    box(c, cx - 1, 459, 7, 51, INK); box(c, cx, 460, 5, 50, r[2]);
    const sx = dir > 0 ? cx : cx - 26;
    box(c, sx - 1, 505, 32, 8, INK); box(c, sx, 506, 30, 6, r[1]);
    for (const lx of [sx + 2, sx + 24]) { box(c, lx, 512, 4, G - 512, INK); box(c, lx + 1, 512, 2, G - 512, r[2]); }
  };
  chair(rx(1932), '#3A6AA8', 1);
  chair(rx(2132), '#7A5224', -1);
  // (the broken one, on its side: seat on the floor, a leg off it)
  const bx = rx(2000);
  poly(c, [bx, G, bx + 6, G - 30, bx + 12, G - 30, bx + 8, G], INK); poly(c, [bx + 1, G - 1, bx + 7, G - 29, bx + 10, G - 29, bx + 7, G - 1], '#A84820');
  box(c, bx + 8, G - 10, 36, 6, INK); box(c, bx + 9, G - 9, 34, 4, '#C2622A');
  line(c, [bx + 40, G - 8, bx + 58, G - 22], INK, 4); line(c, [bx + 40, G - 8, bx + 58, G - 22], '#8A929C', 2);
  line(c, [bx + 30, G - 6, bx + 40, G - 18], INK, 4); line(c, [bx + 30, G - 6, bx + 40, G - 18], '#8A929C', 2);
  box(c, bx + 60, G - 3, 18, 3, INK); box(c, bx + 61, G - 3, 16, 2, '#8A929C');
};

/** The counter: the microwave (something exploded in it), the coffee maker (the pot burnt black), a cabinet door gone. */
const counter = (c: Ctx) => {
  const x = rx(2142), w = 106, ty = 466;
  // (over it: the employee of the month, from 1994; a note about your mother)
  const ex = rx(2148), ey = 150;
  box(c, ex + 47, ey - 12, 2, 2, '#26282C'); line(c, [ex + 8, ey, ex + 48, ey - 11, ex + 88, ey], '#3A3F48', 1);
  shade(c, ex, ey, 96, 124, 0.38, 4);
  slab(c, ex, ey, 96, 124, '#B08A2A');
  box(c, ex + 6, ey + 6, 84, 112, '#F4ECD8');
  text(c, 'EMPLOYEE OF', ex + 48, ey + 18, '#1E3A8A', 6, 'center', null);
  text(c, 'THE MONTH', ex + 48, ey + 27, '#1E3A8A', 6, 'center', null);
  bandedGradient(c, ex + 14, ey + 32, 68, 64, ['#8EA6B4', '#A8B8B8', '#B8B4A0'], 4);
  oval(c, ex + 48, ey + 66, 14, 18, '#C8A88C'); oval(c, ex + 46, ey + 62, 10, 12, '#D8BCA0');
  box(c, ex + 36, ey + 46, 24, 7, '#8E5A5A'); box(c, ex + 34, ey + 52, 30, 3, '#7A4A4A');
  box(c, ex + 42, ey + 64, 3, 3, '#4A3A30'); box(c, ex + 52, ey + 64, 3, 3, '#4A3A30');
  box(c, ex + 40, ey + 72, 16, 3, '#6A4A30'); box(c, ex + 43, ey + 77, 10, 2, '#9A6A5A');
  poly(c, [ex + 28, ey + 96, ex + 34, ey + 84, ex + 62, ey + 84, ex + 68, ey + 96], '#9A6A6A');
  text(c, 'MAR 1994', ex + 48, ey + 110, '#6A5A40', 6, 'center', null);
  line(c, [ex + 20, ey + 90, ex + 40, ey + 40], 'rgba(255, 255, 255, 0.3)', 2);
  note(c, rx(2150), 296, ["YOUR MOM", "DOESN'T WORK", 'HERE.'], { paper: '#F4F0E0', ink: '#7A1E1A' });
  note(c, rx(2196), 344, ['THIS MEANS', 'YOU, GARY'], { paper: '#F2E890', ink: '#26324A' });
  // (and taped on the wall over the microwave, an arrow drawn down at it)
  note(c, x - 2, ty - 84, ['CLEAN UP AFTER', 'YOURSELF!!!'], { size: 5, paper: '#F4F0E0', ink: '#B91C1C' });
  line(c, [x + 28, ty - 60, x + 28, ty - 46], '#B91C1C', 2); poly(c, [x + 23, ty - 48, x + 33, ty - 48, x + 28, ty - 42], '#B91C1C');
  // (the cabinet under it: laminate, one door hanging open, one gone, a pipe and a roach trap in the dark)
  slab(c, x, ty, w, G - ty, '#6E5A3E');
  dimTop(c, x, ty, w, '#6E5A3E', 4);
  box(c, x - 2, ty - 2, w + 4, 6, INK); box(c, x - 1, ty - 1, w + 2, 4, '#5E5040');
  box(c, x + 6, ty + 10, 44, G - ty - 16, '#3E3222'); box(c, x + 8, ty + 12, 40, G - ty - 20, '#5A4A34'); box(c, x + 40, ty + 30, 3, 12, '#A3ABB6');
  box(c, x + 56, ty + 10, 44, G - ty - 16, '#0E0C0A');
  pole(c, x + 70, ty + 10, 6, 40, '#8A929C'); box(c, x + 70, ty + 48, 22, 6, '#6B737E');
  box(c, x + 62, G - 16, 20, 8, '#E8E4D8'); box(c, x + 66, G - 14, 12, 3, '#B91C1C');
  // (the microwave)
  const mx = x + 4, my = ty - 40;
  shade(c, mx, my, 62, 40, 0.35, 3);
  slab(c, mx, my, 62, 40, '#C8BFA2');
  dimTop(c, mx, my, 62, '#C8BFA2', 3);
  box(c, mx + 4, my + 6, 38, 28, INK); box(c, mx + 5, my + 7, 36, 26, '#2A2620');
  for (const [bx, by, br, col] of [[12, 14, 6, '#B4442A'], [26, 20, 8, '#D88A3A'], [34, 12, 5, '#B4442A'], [18, 26, 5, '#8A2A1A'], [30, 28, 4, '#E8B060']] as const) pixelBlob(c, mx + bx, my + by, br, br * 0.7, col);
  for (let k = 0; k < 5; k++) box(c, mx + 8 + k * 7, my + 10 + (k % 2) * 6, 1, 6 + k % 3 * 3, '#8A2A1A');
  line(c, [mx + 8, my + 30, mx + 22, my + 10], 'rgba(255, 255, 255, 0.25)', 2);
  box(c, mx + 43, my + 6, 17, 9, '#0A140A');
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) box(c, mx + 47 + k * 6, my + 18 + r * 5, 4, 3, '#8A8470');
  // (the coffee maker: black plastic, the pot burnt to a crust, sugar packets)
  const cx = x + 72, cy = ty - 50;
  shade(c, cx, cy, 32, 50, 0.35, 3);
  slab(c, cx, cy, 32, 12, '#2A2A2E'); slab(c, cx + 22, cy, 10, 50, '#2A2A2E'); slab(c, cx - 2, ty - 6, 34, 6, '#2A2A2E');
  box(c, cx + 25, cy + 30, 3, 3, '#FF3A2A');
  box(c, cx + 1, cy + 18, 20, 22, INK); box(c, cx + 2, cy + 19, 18, 20, '#3A3028');
  box(c, cx + 2, cy + 30, 18, 9, '#140C06'); box(c, cx + 2, cy + 28, 18, 2, '#4A2A10');
  box(c, cx + 4, cy + 22, 2, 14, 'rgba(255, 255, 255, 0.3)');
  box(c, cx + 2, cy + 16, 18, 3, '#1A1A1E');
  for (let k = 0; k < 3; k++) { box(c, x + 106 - 12 + k * 3, ty - 4 + (k % 2), 6, 3, k % 2 ? '#F1EFEA' : '#F2E890'); }
};

/** The fridge, covered in notes about whose food is whose. A puddle under it. */
const fridge = (c: Ctx) => {
  const x = rx(2252), y = 368, w = 82, h = G - y;
  shade(c, x, y, w, h, 0.35, 4);
  slab(c, x, y, w, h, '#C9C3A6');
  dimTop(c, x, y, w, '#C9C3A6', 4);
  box(c, x + 2, y + 62, w - 4, 2, '#6A6450'); box(c, x + 2, y + 64, w - 4, 1, '#E8E2C6');
  for (const [hy, hh] of [[y + 20, 30], [y + 74, 50]]) { box(c, x + 4, hy, 5, hh, INK); box(c, x + 5, hy + 1, 3, hh - 2, '#D3D9E0'); box(c, x + 5, hy + 1, 1, hh - 2, '#FFFFFF'); }
  for (let k = 0; k < 8; k++) box(c, x + 4 + Math.floor(hash(k * 5.1) * (w - 10)), G - 6 - Math.floor(hash(k) * 12), 4, 3, '#7A4A20');
  box(c, x + 3, G - 10, w - 6, 8, '#3A3628');
  oval(c, x + 50, y + 130, 8, 10, '#ACA68A'); oval(c, x + 49, y + 128, 6, 7, '#9A9478');
  note(c, x + 8, y + 10, ['LABEL YOUR', 'FOOD!!!'], { mount: 'magnet', paper: '#F4F0E0', ink: '#B91C1C', pinCol: '#B91C1C' });
  note(c, x + 8, y + 72, ['WHO ATE MY', 'YOGURT'], { mount: 'magnet', paper: '#F2E890', pinCol: '#2D51B0' });
  note(c, x + 30, y + 104, ['IT WAS', 'ME'], { mount: 'tape', paper: '#F2C6D4', ink: '#6E1840' });
  note(c, x + 10, y + 132, ['CLEANED', 'OUT FRI'], { mount: 'magnet', paper: '#C8E0F0', pinCol: '#2F7D3A' });
  shinyStar(c, x + 66, y + 50, 6, '#F2CC4A');
  box(c, x + 56, y + 46, 4, 10, INK); box(c, x + 57, y + 47, 2, 8, FLAG_RED[2]);
  slab(c, x + 8, y - 20, 36, 20, dim('#9A7044'), { ink: false }); dimTop(c, x + 8, y - 20, 36, dim('#9A7044'), 3);
  pixelBlob(c, x + 40, G + 1, 40, 3, 'rgba(150, 170, 180, 0.3)');
};

/** The vending machine: OUT OF ORDER, a bag of chips hung up in its coil, a boot print on its side. */
const vending = (c: Ctx) => {
  const x = rx(2338), y = 326, w = 60, h = G - y;
  shade(c, x, y, w, h, 0.35, 2);
  slab(c, x, y, w, h, fade('#B91C1C', 0.25));
  dimTop(c, x, y, w, fade('#B91C1C', 0.25), 4);
  text(c, 'SNAX', x + 22, y + 16, fade('#F1EFEA', 0.2), 8, 'center', INK);
  box(c, x, y + 22, w, 3, fade('#F1EFEA', 0.3)); box(c, x, y + 25, w, 3, fade('#2D51B0', 0.3));
  box(c, x + 4, y + 30, 38, 130, INK);
  bandedGradient(c, x + 5, y + 31, 36, 128, ['#1A2028', '#242C36', '#1A2028'], 4);
  const snacks = ['#E8C040', '#B91C1C', '#2D9A3A', '#D86A2A', '#8A3AB4', '#2D51B0'];
  for (let r = 0; r < 5; r++) {
    const ry = y + 34 + r * 25;
    for (let k = 0; k < 3; k++) {
      if (r === 2 && k === 1) continue;
      if (hash(r * 7 + k) < 0.2) continue;
      const col = snacks[(r * 3 + k) % snacks.length];
      box(c, x + 7 + k * 11, ry + 2, 9, 16, INK); box(c, x + 8 + k * 11, ry + 3, 7, 14, col); box(c, x + 8 + k * 11, ry + 3, 2, 14, lite(col, 0.3));
    }
    box(c, x + 5, ry + 19, 36, 2, '#6B737E');
    for (let k = 0; k < 3; k++) for (let s = 0; s < 4; s++) box(c, x + 8 + k * 11 + s * 2, ry + 17, 1, 3, '#A3ABB6');
  }
  // (the one that didn't drop: hung up, tipped)
  poly(c, [x + 18, y + 84 + 4, x + 27, y + 84 + 0, x + 31, y + 84 + 16, x + 22, y + 84 + 20], INK);
  poly(c, [x + 19, y + 84 + 5, x + 26, y + 84 + 2, x + 29, y + 84 + 15, x + 22, y + 84 + 18], '#D86A2A');
  line(c, [x + 8, y + 50, x + 26, y + 32], 'rgba(255, 255, 255, 0.28)', 2); line(c, [x + 10, y + 150, x + 38, y + 112], 'rgba(255, 255, 255, 0.18)', 2);
  // (the panel, the slot, the flap)
  box(c, x + 45, y + 32, 11, 50, '#2A2A2E'); box(c, x + 47, y + 36, 7, 10, '#0A140A'); for (let k = 0; k < 4; k++) box(c, x + 47, y + 50 + k * 6, 7, 4, '#8A8470');
  box(c, x + 48, y + 88, 5, 10, INK);
  box(c, x + 8, y + 170, 32, 14, INK); box(c, x + 9, y + 171, 30, 12, '#1A1A1E');
  note(c, x + 1, y + 104, ['OUT OF', 'ORDER'], { paper: '#F4F0E0', ink: '#B91C1C' });
  // (a boot print, a dent)
  oval(c, x + 30, y + 196, 9, 5, 'rgba(26, 11, 6, 0.4)'); for (let k = 0; k < 3; k++) box(c, x + 24 + k * 5, y + 194, 2, 4, 'rgba(26, 11, 6, 0.5)');
};

// ---------------------------------------------------------------------------------------------------------------
// The filth: what the pigeons, the rats and the staff have left everywhere

/** A cigarette butt on the floor: the filter, a burnt end, flattened. */
const butt = (c: Ctx, x: number, y: number, k: number) => {
  x = Math.round(x); y = Math.round(y);
  box(c, x - 1, y - 1, 7, 3, 'rgba(26, 11, 6, 0.55)');
  box(c, x, y, 3, 1, k > 0.5 ? '#D89A4A' : '#E8E2CC'); box(c, x + 3, y, 2, 1, '#F1EFEA'); box(c, x + 5, y, 1, 1, '#4A4038');
};
/** Pigeon crap: a white splat, a gray-green middle, a few drops round it. */
const splat = (c: Ctx, x: number, y: number, s = 1) => {
  x = Math.round(x); y = Math.round(y);
  box(c, x - 2 * s, y, 5 * s, 2 * s, '#E8E6DC'); box(c, x - s, y - s, 3 * s, 1 * s, '#F4F2EA'); box(c, x, y, s, s, '#6A7458');
  box(c, x + 4 * s, y + s, s, s, '#E8E6DC'); box(c, x - 3 * s, y + 2 * s, s, s, '#D8D6CC');
};
/** A run of pigeon crap down a wall from a ledge: streaks, thickest at the top. */
const streaks = (c: Ctx, x: number, y: number, w: number, n: number) => {
  for (let k = 0; k < n; k++) {
    const sx = Math.round(x + hash(x * 0.3 + k * 7.7) * w), len = 6 + Math.floor(hash(y + k * 3.3) * 18);
    box(c, sx, y, 2, 3, '#ECEAE0'); box(c, sx, y + 3, 1, len, 'rgba(232, 230, 220, 0.8)'); box(c, sx, y + 3 + len, 2, 2, '#D8D6CC');
  }
};
/** The sticky floor: spilled soda gone to tar, the shine still on it; footprints tracked out of it. */
const sticky = (c: Ctx, x: number, y: number, r: number, col: string) => {
  pixelBlob(c, x, y, r, r * 0.22, col);
  pixelBlob(c, x - r * 0.2, y - 1, r * 0.55, r * 0.1, mix(col, '#000000', 0.25));
  box(c, x - r * 0.4, y - 2, Math.max(2, r * 0.3), 1, 'rgba(255, 240, 230, 0.45)'); box(c, x + r * 0.2, y, 2, 1, 'rgba(255, 240, 230, 0.35)');
};

/** The floor's filth along the whole room (a..b): sticky spills, butts, crap, rat droppings. */
const floorFilth = (c: Ctx, a: number, b: number) => {
  for (let x = Math.floor((a - X0) / 46) * 46 + X0; x < b; x += 46) {
    const s = hash(x * 0.913 + 5), t = hash(x * 0.271 + 9);
    if (s > 0.72) sticky(c, x + t * 30, G + 10 + Math.floor(t * 14), 12 + s * 16, t > 0.5 ? 'rgba(58, 24, 30, 0.5)' : 'rgba(70, 48, 14, 0.5)');
    if (s > 0.88) for (let k = 0; k < 4; k++) { const fx = x + t * 30 + 18 + k * 13, fy = G + 12 + (k % 2) * 6; box(c, fx, fy, 5, 2, `rgba(58, 30, 24, ${(0.4 - k * 0.08).toFixed(2)})`); box(c, fx + 1, fy + 2, 3, 1, `rgba(58, 30, 24, ${(0.3 - k * 0.06).toFixed(2)})`); }
    if (t < 0.45) butt(c, x + s * 40, G + 7 + Math.floor(hash(x + 3) * 24), hash(x + 1));
    if (t > 0.35 && t < 0.62) splat(c, x + 10 + s * 30, G + 8 + Math.floor(hash(x * 2.3) * 26), hash(x * 4) > 0.7 ? 2 : 1);
    if (s < 0.22) for (let k = 0; k < 6; k++) box(c, Math.round(x + 8 + hash(x + k * 1.7) * 22), Math.round(G + 6 + hash(x * 1.9 + k) * 6), 2, 1, '#24180E');
  }
};

/** The holes the rats come out of: arches gnawed through the rubber base and the block behind, dark, droppings out front. */
const ratHole = (c: Ctx, x: number) => {
  const y = G, w = 18, h = 16;
  poly(c, [x - w / 2 - 1, y, x - w / 2 - 1, y - h + 6, x - 4, y - h - 1, x + 4, y - h - 1, x + w / 2 + 1, y - h + 6, x + w / 2 + 1, y], INK);
  poly(c, [x - w / 2, y, x - w / 2, y - h + 6, x - 4, y - h, x + 4, y - h, x + w / 2, y - h + 6, x + w / 2, y], '#060504');
  // (gnawed: the rim chewed ragged, the light catching its far side)
  for (let k = 0; k < 4; k++) box(c, x - w / 2 + 2 + k * 4, y - h + 2 - (k % 2), 2, 2, '#25231E');
  box(c, x + w / 2 - 1, y - h + 7, 1, h - 7, '#4A463A');
  // (a pair of eyes in there)
  box(c, x - 3, y - 8, 1, 1, '#DC2626'); box(c, x + 1, y - 8, 1, 1, '#DC2626');
  for (let k = 0; k < 9; k++) box(c, Math.round(x - 16 + hash(x + k) * 32), G + 3 + Math.floor(hash(x * 3 + k) * 5), 2, 1, '#1E140A');
};

/** NO SMOKING, by the door: a butt stubbed out on it, a burn; under it the coffee can they use for an ashtray. */
const smokers = (c: Ctx) => {
  const x = rx(14), y = 296, w = 70, h = 64;
  shade(c, x, y, w, h);
  slab(c, x, y, w, h, '#E8E4D8');
  ball(c, x + w / 2, y + 24, 17, '#E8E4D8', false);
  c.strokeStyle = '#C81E1E'; c.lineWidth = 4; c.beginPath(); c.arc(x + w / 2, y + 24, 15, 0, Math.PI * 2); c.stroke();
  box(c, x + w / 2 - 12, y + 22, 18, 5, '#F4F2EA'); box(c, x + w / 2 + 6, y + 22, 5, 5, '#D89A4A'); box(c, x + w / 2 - 12, y + 22, 18, 1, INK); box(c, x + w / 2 - 12, y + 26, 23, 1, INK);
  line(c, [x + w / 2 - 11, y + 13, x + w / 2 + 11, y + 35], '#C81E1E', 4);
  text(c, 'NO SMOKING', x + w / 2, y + 56, '#3A2A18', 6, 'center', null);
  // (the burn, and the butt stuck to it)
  pixelBlob(c, x + 52, y + 14, 4, 3, '#3A2A18'); pixelBlob(c, x + 52, y + 14, 2, 2, '#14100A');
  box(c, x + 50, y + 15, 5, 2, '#F1EFEA'); box(c, x + 54, y + 15, 2, 2, '#4A4038');
  for (const [sx, sy] of [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4], [x + w - 4, y + h - 4]]) screw(c, sx, sy);
  // (the coffee can, heaped over with butts, the ash down its side)
  const cx = rx(80);
  shade(c, cx, G - 20, 16, 20, 0.3, 2);
  pole(c, cx, G - 20, 16, 20, '#B4442A');
  box(c, cx + 2, G - 14, 12, 6, '#E8C040'); text(c, 'JOE', cx + 8, G - 9, '#6A1A10', 6, 'center', null);
  pixelBlob(c, cx + 8, G - 21, 9, 3, '#6E6A62');
  for (let k = 0; k < 9; k++) { const bx = cx + 1 + (k * 5) % 14, by = G - 24 + (k % 3) * 2; box(c, bx, by, 4, 1, k % 3 ? '#E8E2CC' : '#D89A4A'); box(c, bx + 3, by, 1, 1, '#4A4038'); }
  box(c, cx + 14, G - 18, 1, 10, 'rgba(110, 106, 98, 0.6)');
  for (let k = 0; k < 7; k++) butt(c, cx - 22 + hash(k * 3.7) * 56, G + 3 + Math.floor(hash(k * 5.3) * 10), hash(k));
};

/** A spare head that got away: on its side in the corner by the clock, grinning at the ceiling, a butt in its mouth. */
const lostHead = (c: Ctx) => {
  const x = rx(270), y = G - 16, col = '#E8803A', r = rampOf(col);
  oval(c, x + 4, G, 22, 3, 'rgba(18, 12, 6, 0.4)');
  // (the ears, one squashed under it)
  ball(c, x + 14, y - 11, 5, col); ball(c, x + 14, y - 11, 2.5, '#F4C8A0', false);
  ball(c, x, y, 16, col);
  checker(c, x - 12, y - 10, 9, 10, r[3]);
  // (turned on its side: the eyes one over the other, the grin up the side)
  for (const [ex, ey, look] of [[x + 3, y - 7, -1], [x + 4, y + 3, 1]] as const) { oval(c, ex, ey, 5, 4, INK); oval(c, ex, ey, 4, 3, '#FFFFFF'); box(c, ex - 1 + look, ey - 1, 2, 2, INK); }
  c.fillStyle = INK; c.beginPath(); c.arc(x + 6, y, 9, -0.45 * Math.PI, 0.45 * Math.PI); c.closePath(); c.fill();
  c.fillStyle = '#5A0A1A'; c.beginPath(); c.arc(x + 6, y, 7.5, -0.42 * Math.PI, 0.42 * Math.PI); c.closePath(); c.fill();
  for (let k = 0; k < 3; k++) box(c, x + 10, y - 5 + k * 4, 3, 2, '#F4F0E0');
  box(c, x + 12, y - 1, 6, 2, '#F1EFEA'); box(c, x + 17, y - 1, 1, 2, '#F97316');
  // (the neck hole, to us: dark, a ring of sweat round it)
  oval(c, x - 11, y + 2, 4, 9, INK); oval(c, x - 11, y + 2, 3, 8, '#0A0A0E'); checker(c, x - 15, y - 6, 3, 16, 'rgba(90, 70, 30, 0.6)');
  // (its tag)
  line(c, [x - 2, y - 14, x - 10, y - 24], '#C8C4B8');
  box(c, x - 30, y - 34, 30, 12, INK); box(c, x - 29, y - 33, 28, 10, '#F2E890'); text(c, 'MINE', x - 15, y - 25, '#7A1E1A', 6, 'center', null);
};

/** The union notice the park keeps covering up: the rights, the break (unpaid), the meeting canceled. */
const unionNotice = (c: Ctx) => {
  note(c, rx(1252), 156, ['LOCAL 69', 'UNION NOTICE', '', 'YOU HAVE THE', 'RIGHT TO ONE', '10-MIN BREAK', 'PER SHIFT', '(UNPAID)'], { size: 6, paper: '#F4F0E0', ink: '#1E3A8A', mount: 'tack', pinCol: '#2D51B0' });
  note(c, rx(1270), 248, ['MEETING', 'CANCELED'], { size: 6, paper: '#F2C6D4', ink: '#7A1E1A', mount: 'tape' });
  // (somebody's drawn a face on it)
  box(c, rx(1338), 186, 2, 2, '#3A3F48'); box(c, rx(1344), 186, 2, 2, '#3A3F48'); box(c, rx(1337), 192, 10, 1, '#3A3F48');
};

/** Flypaper hung off the ceiling's grid, so full of flies it's black, curled at the bottom. */
const flypaper = (c: Ctx) => {
  const x = rx(772), top = CEIL_Y - 2, len = 96;
  box(c, x + 2, top, 1, 8, '#3A3A30');
  box(c, x - 1, top + 8, 8, len + 2, INK); box(c, x, top + 9, 6, len, '#C8A040'); box(c, x, top + 9, 2, len, '#DCB860'); box(c, x + 5, top + 9, 1, len, '#9A7820');
  for (let k = 0; k < 34; k++) box(c, x + Math.floor(hash(k * 2.3) * 5), top + 10 + Math.floor(hash(k * 7.1) * (len - 4)), 2, 1 + (k % 2), '#14140E');
  poly(c, [x - 1, top + len + 9, x + 7, top + len + 9, x + 4, top + len + 15], INK);
  box(c, x + 1, top + len + 9, 4, 3, '#C8A040');
};

/** The pigeons' way in and their nest: twigs on the pipe up in the missing tile, the crap down the tile's edge. */
const nest = (c: Ctx) => {
  const mx = rx(1880);
  pixelBlob(c, mx + 22, 39, 16, 5, '#5A4020');
  for (let k = 0; k < 12; k++) { const sx = mx + 8 + k * 2.5, sy = 36 + (k % 3); line(c, [sx, sy, sx + 6 - (k % 4) * 3, sy + 4], k % 2 ? '#8A6A3A' : '#6A4C24', 1); }
  for (let k = 0; k < 2; k++) { oval(c, mx + 18 + k * 7, 35, 3, 2, '#F1EFEA'); }
  streaks(c, mx + 4, CEIL_Y - 8, 52, 7);
};

/** Pigeon crap down from the ledges they sit on: the incident board, the mural, the lockers. */
const pigeonMess = (c: Ctx) => {
  streaks(c, rx(540), 128, 200, 6);
  streaks(c, rx(806), 106, 240, 8);
  streaks(c, rx(814), 334, 240, 7);
  for (const r of [560, 640, 700, 880, 990]) splat(c, rx(r), G + 4 + (r % 7), 1);
};

/** The utility sink: piled over the rim with dishes nobody's doing, gray water standing in it, the drain long gone. */
const SINK_X = 1714, SINK_W = 52, SINK_Y = 480;
const sink = (c: Ctx) => {
  const x = rx(SINK_X), w = SINK_W, y = SINK_Y;
  mold(c, x + 26, y - 12, 30, 14);
  // (the pipes, the legs)
  pole(c, x + 22, y + 20, 6, G - y - 28, '#8A929C'); box(c, x + 14, G - 12, 22, 6, '#6B737E');
  for (const lx of [x + 3, x + w - 7]) { box(c, lx, y + 20, 4, G - y - 20, INK); box(c, lx + 1, y + 20, 2, G - y - 20, '#A3ABB6'); }
  // (the faucet, off the wall)
  box(c, x + 18, y - 22, 16, 5, INK); box(c, x + 19, y - 21, 14, 3, '#C8CCD2'); box(c, x + 19, y - 21, 14, 1, '#FFFFFF');
  box(c, x + 30, y - 18, 4, 8, INK); box(c, x + 31, y - 18, 2, 7, '#A3ABB6');
  for (const kx of [x + 14, x + 34]) { ball(c, kx, y - 20, 3, '#D3D9E0'); }
  // (the dishes, up over the rim: plates on edge, a pot with its handle out, a mug, a pan)
  for (let k = 0; k < 4; k++) { const px = x + 8 + k * 7; oval(c, px, y - 4 - (k % 2) * 3, 4, 10, INK); oval(c, px, y - 4 - (k % 2) * 3, 3, 9, k % 2 ? '#E8E4D8' : '#C8D8E0'); pixelBlob(c, px, y - 6 - (k % 2) * 3, 2, 3, '#B4844A'); }
  box(c, x + 34, y - 10, 14, 10, INK); box(c, x + 35, y - 9, 12, 8, '#6B737E'); box(c, x + 35, y - 9, 12, 2, '#A3ABB6'); box(c, x + 46, y - 7, 10, 3, INK); box(c, x + 47, y - 6, 8, 1, '#3A3A40');
  pixelBlob(c, x + 41, y - 10, 5, 2, '#8AA040');
  box(c, x + 2, y - 8, 8, 8, INK); box(c, x + 3, y - 7, 6, 6, '#B91C1C'); box(c, x + 9, y - 6, 3, 4, INK);
  // (the basin: steel, dented, its rim's top in shade: nothing to stand on)
  shade(c, x, y, w, 20, 0.3, 3);
  box(c, x - 1, y - 1, w + 2, 22, INK); slab(c, x, y, w, 20, '#9AA2AC', { ink: false });
  dimTop(c, x, y, w, '#9AA2AC', 3);
  box(c, x + 3, y + 3, w - 6, 3, '#4E5A50'); box(c, x + 3, y + 3, w - 6, 1, '#7A8A6E');
  line(c, [x + 8, y + 12, x + 16, y + 8], 'rgba(255, 255, 255, 0.35)', 1);
  // (gray water down the front where it's overflowed, a puddle under)
  box(c, x + 40, y + 6, 2, 16, 'rgba(110, 130, 110, 0.6)'); box(c, x + 12, y + 6, 1, 10, 'rgba(110, 130, 110, 0.5)');
  pixelBlob(c, x + 30, G - 1, 30, 3, 'rgba(100, 120, 100, 0.4)');
  note(c, x + 2, 430, ['DO YOUR', 'DISHES!!'], { size: 6, paper: '#F4F0E0', ink: '#B91C1C' });
};

// ---------------------------------------------------------------------------------------------------------------
// The building's own: what it has outside (hub/draw.ts: backBuilding, staffDoor) seen from in here

/** The rusty water pipe along the top of the wall, under the ceiling (outside it runs up the building's side). */
// (a function, not a value: index.ts imports this file, so CEIL_Y isn't there yet while this file's top level runs)
const pipeY = () => CEIL_Y + 4;
/** Where its joints are: over the water stains (they weep). */
const PIPE_JOINTS = [60, 470, 1240, 1730, 2210, 2470];
/**
 * The pipe the length of the room (a..b): rust-red, round (lit along its middle, its top in shade: nothing up here to
 * stand on), hung on straps up into the ceiling, its joints swollen and weeping down the paint.
 */
const pipes = (c: Ctx, a: number, b: number) => {
  const w = b - a, y = pipeY();
  box(c, a, y + 9, w, 3, 'rgba(18, 12, 6, 0.3)');
  box(c, a, y, w, 9, INK);
  box(c, a, y + 1, w, 7, '#7C2D12'); box(c, a, y + 1, w, 1, '#4A180A'); box(c, a, y + 3, w, 2, '#9A3412'); box(c, a, y + 3, w, 1, '#B4622A'); box(c, a, y + 6, w, 2, '#5A1E0C');
  checker(c, a, y + 5, w, 1, '#7C2D12');
  for (let x = Math.floor((a - X0) / 14) * 14 + X0; x < b; x += 14) if (hash(x * 0.37) > 0.55) box(c, x + Math.floor(hash(x) * 10), y + 2 + Math.floor(hash(x * 2.1) * 5), 2, 1, hash(x * 3) > 0.5 ? '#C2703A' : '#3A1206');
  // (the straps: steel bands up into the ceiling's grid)
  for (let x = Math.floor((a - X0) / 120) * 120 + X0 + 40; x < b; x += 120) {
    box(c, x, CEIL_Y - 2, 2, y - CEIL_Y + 2, '#3A3F48');
    box(c, x - 2, y - 1, 6, 11, INK); box(c, x - 1, y, 4, 9, '#6B737E'); box(c, x - 1, y, 1, 9, '#A3ABB6');
  }
  // (the joints: fat collars, rust run down from each)
  for (const r of PIPE_JOINTS) {
    const cx = rx(r) - 7;
    if (cx > b || cx + 14 < a) continue;
    box(c, cx - 1, y - 2, 16, 13, INK); box(c, cx, y - 1, 14, 11, '#8B4A1C'); box(c, cx, y + 2, 14, 2, '#B4622A'); box(c, cx, y + 8, 14, 2, '#5A1E0C');
    box(c, cx + 3, y - 1, 1, 11, '#3A1206'); box(c, cx + 10, y - 1, 1, 11, '#3A1206');
    box(c, cx + 5, y + 11, 3, 4, '#7C2D12'); box(c, cx + 6, y + 15, 1, 3, 'rgba(124, 45, 18, 0.6)');
  }
};

/** The same pipe down the near corner and into the floor (an elbow at the top, straps down it, a collar at the foot). */
const cornerPipe = (c: Ctx) => {
  const x = rx(2), y = pipeY();
  shade(c, x, y, 9, G - y, 0.3, 3);
  box(c, x - 1, y, 11, G - y, INK); box(c, x, y, 9, G - y, '#7C2D12'); box(c, x + 2, y, 2, G - y, '#9A3412'); box(c, x + 2, y, 1, G - y, '#B4622A'); box(c, x + 7, y, 2, G - y, '#5A1E0C');
  for (let yy = y + 30; yy < G - 20; yy += 26) if (hash(yy * 0.3) > 0.4) box(c, x + 3, yy, 3, 2, '#3A1206');
  box(c, x - 2, y - 2, 14, 14, INK); box(c, x - 1, y - 1, 12, 12, '#8B4A1C'); box(c, x - 1, y + 2, 12, 2, '#B4622A');
  for (let yy = y + 70; yy < G - 30; yy += 110) { box(c, x - 2, yy, 13, 5, INK); box(c, x - 1, yy + 1, 11, 3, '#6B737E'); box(c, x - 1, yy + 1, 11, 1, '#A3ABB6'); }
  box(c, x - 3, G - 7, 15, 7, INK); box(c, x - 2, G - 6, 13, 5, '#6B737E'); box(c, x - 2, G - 6, 13, 1, '#A3ABB6');
  pixelBlob(c, x + 5, G - 1, 12, 2, 'rgba(124, 45, 18, 0.45)');
};

/** The gray conduit (up the building's front outside) down beside the door to the light switch: taped on, LEAVE IT ON. */
const conduit = (c: Ctx) => {
  const x = rx(173), top = pipeY() + 9, sy = 300;
  box(c, x - 1, top, 7, sy - top, INK); box(c, x, top, 5, sy - top, '#6B7280'); box(c, x, top, 1, sy - top, '#9CA3AF'); box(c, x + 4, top, 1, sy - top, '#4B5563');
  for (let y = top + 34; y < sy - 10; y += 60) { box(c, x - 2, y, 9, 4, INK); box(c, x - 1, y, 7, 3, '#4B5563'); box(c, x - 1, y, 7, 1, '#9CA3AF'); }
  const bx = x - 6, by = sy;
  shade(c, bx, by, 18, 28, 0.34, 2);
  slab(c, bx, by, 18, 28, '#8A929C');
  screw(c, bx + 8, by + 2); screw(c, bx + 8, by + 24);
  box(c, bx + 5, by + 7, 8, 14, INK); box(c, bx + 6, by + 8, 6, 6, '#E8E4D8'); box(c, bx + 6, by + 8, 6, 1, '#FFFFFF');
  tape(c, bx + 1, by + 10, 16, 5);
  note(c, rx(128), 300, ['LEAVE', 'IT', 'ON'], { size: 5, paper: '#F2E890', ink: '#B91C1C' });
};

/** The window: the building's cracked wired one (outside: hub/draw.ts), from in here. Its glass; out through it is live. */
const WIN = { r: 22, y: 166, w: 64, h: 50 };
/** Its frame, its sill (top in shade), grime run down the paint under it: the still part, in the strip. */
const windowFrame = (c: Ctx) => {
  const x = rx(WIN.r), y = WIN.y, w = WIN.w, h = WIN.h;
  shade(c, x - 6, y - 6, w + 12, h + 12, 0.38, 4);
  box(c, x - 7, y - 7, w + 14, h + 14, INK);
  box(c, x - 6, y - 6, w + 12, h + 12, '#3F3F46'); box(c, x - 6, y - 6, w + 12, 1, '#6B6B74'); box(c, x - 6, y - 6, 1, h + 12, '#5A5A62'); box(c, x + w + 5, y - 6, 1, h + 12, '#26262C'); box(c, x - 6, y + h + 5, w + 12, 1, '#26262C');
  for (const [sx, sy] of [[x - 4, y - 4], [x + w + 2, y - 4], [x - 4, y + h + 2], [x + w + 2, y + h + 2]]) screw(c, sx, sy);
  box(c, x - 1, y - 1, w + 2, h + 2, '#18181B');
  box(c, x, y, w, h, '#2A3036');
  for (let k = 0; k < 6; k++) box(c, x - 6 + k * 14, y + h + 14, 2, 8 + ((k * 7) % 18), 'rgba(46, 36, 22, 0.32)');
  box(c, x - 10, y + h + 6, w + 20, 8, INK); box(c, x - 9, y + h + 7, w + 18, 6, BLOCK[4]); box(c, x - 9, y + h + 12, w + 18, 1, BLOCK[1]);
  dimTop(c, x - 9, y + h + 7, w + 18, BLOCK[4], 2);
  // (on the sill: dead flies, a butt, a curled-up park map)
  for (let k = 0; k < 3; k++) { box(c, x + 6 + k * 19, y + h + 5, 2, 1, INK); box(c, x + 7 + k * 19, y + h + 4, 1, 1, 'rgba(220, 230, 240, 0.6)'); }
  box(c, x + 48, y + h + 4, 5, 2, '#F1EFEA'); box(c, x + 52, y + h + 4, 1, 2, '#D97706');
  box(c, x - 6, y + h, 14, 6, INK); box(c, x - 5, y + h + 1, 12, 4, '#7FB0D8'); box(c, x - 5, y + h + 1, 4, 4, '#E8C040'); box(c, x - 5, y + h + 1, 12, 1, '#B8D4EC');
};
/** The glass over the view: grime, the wire in it, the crack (the outside's, turned round), tape over the hit. Stamped. */
const paintWindowGlass = (g: Ctx) => {
  const x = rx(WIN.r), y = WIN.y, w = WIN.w, h = WIN.h;
  box(g, x, y, w, h, 'rgba(150, 170, 160, 0.14)');
  checker(g, x, y + h - 12, w, 8, 'rgba(70, 60, 36, 0.3)');
  box(g, x, y + h - 4, w, 4, 'rgba(70, 60, 36, 0.4)');
  for (let k = 0; k < 20; k++) box(g, x + Math.floor(hash(k * 2.7) * w), y + Math.floor(hash(k * 5.1 + 3) * h), 1, 1, 'rgba(60, 50, 30, 0.5)');
  for (let k = 9; k < w; k += 9) box(g, x + k, y, 1, h, 'rgba(70, 74, 80, 0.7)');
  for (let k = 7; k < h; k += 7) box(g, x, y + k, w, 1, 'rgba(70, 74, 80, 0.7)');
  const P = (u: number, v: number) => [x + u, y + v];
  for (const pts of [[...P(55, 4), ...P(35, 28), ...P(40, 47)], [...P(35, 28), ...P(9, 22)], [...P(35, 28), ...P(24, 46)]]) {
    line(g, pts.map((v, i) => (i % 2 ? v + 1 : v)), 'rgba(20, 20, 24, 0.5)');
    line(g, pts, 'rgba(229, 231, 235, 0.85)');
  }
  tape(g, x + 27, y + 25, 17, 6);
  line(g, [x + 6, y + h - 8, x + 20, y + 4], 'rgba(255, 255, 255, 0.22)', 2); line(g, [x + 14, y + h - 10, x + 24, y + 10], 'rgba(255, 255, 255, 0.12)', 1);
};
const BULBS = ['#F87171', '#FDE047', '#4ADE80', '#60A5FA', '#F472B6', '#FB923C'];
/**
 * Out through it, live: the hub as it is this hour. Its sky, the far side's rides in the haze (a spire, the big wheel
 * turning), the hedge, the walk; a guest going by now and then (a balloon, some of them); the nearest lamp post, its
 * lamp lit after dark, string lights swagged off it (twinkling, as the hub's do) and a run of bunting.
 */
const windowView = (c: Ctx, f: number) => {
  const x = rx(WIN.r), y = WIN.y, w = WIN.w, h = WIN.h, tod = timeOfDay(), night = lampGlow(tod);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let k = 0; k < 6; k++) box(c, x, y + k * 6, w, 7, skyAt(0.3 + k * 0.1, tod));
  const far = farTint('#4A5468', 1, tod);
  poly(c, [x + 2, y + 34, x + 2, y + 22, x + 5, y + 18, x + 7, y + 8, x + 9, y + 18, x + 12, y + 22, x + 12, y + 26, x + 20, y + 26, x + 20, y + 34], far);
  c.strokeStyle = far; c.lineWidth = 1; c.beginPath(); c.arc(x + 44, y + 20, 13, 0, Math.PI * 2); c.stroke();
  const turn = f * 0.004;
  c.beginPath(); for (let k = 0; k < 4; k++) { const a = turn + k * Math.PI / 4; c.moveTo(x + 44 - Math.cos(a) * 13, y + 20 - Math.sin(a) * 13); c.lineTo(x + 44 + Math.cos(a) * 13, y + 20 + Math.sin(a) * 13); } c.stroke();
  for (let k = 0; k < 8; k++) { const a = turn + k * Math.PI / 4; box(c, Math.round(x + 43 + Math.cos(a) * 13), Math.round(y + 19 + Math.sin(a) * 13), 3, 3, farTint(BULBS[k % 6], 0.8, tod)); }
  poly(c, [x + 38, y + 36, x + 44, y + 20, x + 50, y + 36], far);
  box(c, x, y + 30, w, 6, farTint('#3E5A3A', 0.6, tod)); checker(c, x, y + 30, w, 2, farTint('#56784E', 0.6, tod));
  const walk = farTint('#B8A88A', 0.3, tod), seam = farTint('#8A7C64', 0.3, tod);
  box(c, x, y + 36, w, h - 36, walk);
  for (let k = 0; k < 7; k++) box(c, x + 3 + k * 10, y + 38 + (k % 2) * 4, 1, h - 38, seam);
  box(c, x, y + 41, w, 1, seam); box(c, x, y + 46, w, 1, seam);
  // (a guest going by)
  const P = 420, t = f % P, n = Math.floor(f / P);
  if (t < 220) {
    const dir = n % 2 ? -1 : 1, gx = Math.round(dir > 0 ? x - 10 + (t / 220) * (w + 20) : x + w + 10 - (t / 220) * (w + 20)), gy = y + 44 - ((t >> 3) % 2);
    const shirt = farTint(['#DC2626', '#2563EB', '#F59E0B', '#16A34A'][n % 4], 0.3, tod), skin = farTint(['#E8B48A', '#8A5A3A', '#C68A5E', '#F2CDA8'][(n >> 1) % 4], 0.3, tod);
    box(c, gx - 2, gy - 14, 5, 8, shirt); box(c, gx - 1, gy - 19, 4, 5, skin);
    box(c, gx - 2, gy - 6, 2, 6 - ((t >> 3) % 2) * 2, '#1F2937'); box(c, gx + 1, gy - 6, 2, 4 + ((t >> 3) % 2) * 2, '#1F2937');
    if (n % 3 !== 1) { box(c, gx + 3, gy - 28, 1, 14, '#E5E7EB'); ball(c, gx + 3, gy - 31, 3, farTint(BULBS[n % 6], 0.2, tod), false); }
  }
  // (the lamp post, the nearest: cast iron, its lamp)
  const lx = x + 18;
  box(c, lx - 2, y + 4, 5, h, '#151B26'); box(c, lx - 1, y + 4, 1, h, '#4B5563');
  box(c, lx - 4, y + 22, 9, 2, '#374151');
  box(c, lx - 4, y - 3, 9, 8, INK); box(c, lx - 3, y - 2, 7, 6, mix('#FEF3C7', '#FFFBEB', night));
  if (night > 0.3) { c.fillStyle = `rgba(253, 230, 138, ${(0.25 * night).toFixed(2)})`; c.fillRect(lx - 10, y - 4, 21, 16); }
  // (string lights off it, the bunting under)
  for (let k = 1; k < 10; k++) {
    const u = k / 10, bx = lx + 2 + u * (w - 20), by = y + 4 + 10 * 4 * u * (1 - u);
    box(c, Math.round(bx), Math.round(by) - 1, 1, 1, '#27272A');
    const on = night > 0.3 || ((k + (f >> 4)) % 6) !== 0;
    box(c, Math.round(bx), Math.round(by), 2, 2, on ? (night > 0.3 ? mix(BULBS[k % 6], '#FFFFFF', 0.4) : BULBS[k % 6]) : '#57534E');
  }
  for (let k = 0; k < 4; k++) {
    const u = (k + 0.5) / 4, bx = Math.round(lx - 2 - u * 18), by = Math.round(y + 12 + 6 * 4 * u * (1 - u));
    poly(c, [bx - 2, by, bx + 2, by, bx, by + 4], [FLAG_RED[2], FLAG_WHITE[3], FLAG_BLUE[3]][k % 3]);
  }
  c.restore();
};

/** The greasy vent (outside, by the door): from in here, the exhaust fan behind it, its guard furred with grease. */
const FAN = { r: 214, y: 192, R: 17 };
const fanHousing = (c: Ctx) => {
  const x = rx(FAN.r), y = FAN.y, R = FAN.R;
  for (let k = 0; k < 6; k++) box(c, x - R + 2 + k * 7, y + R + 6, 2, 10 + ((k * 13) % 30), 'rgba(60, 44, 16, 0.42)');
  shade(c, x - R - 5, y - R - 5, R * 2 + 10, R * 2 + 10, 0.38, 4);
  box(c, x - R - 6, y - R - 6, R * 2 + 12, R * 2 + 12, INK);
  slab(c, x - R - 5, y - R - 5, R * 2 + 10, R * 2 + 10, '#8A8C84', { ink: false });
  oval(c, x, y, R + 1, R + 1, INK); oval(c, x, y, R, R, '#0E0D0B');
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + 0.2; box(c, Math.round(x + Math.cos(a) * (R + 1)), Math.round(y + Math.sin(a) * (R + 1)), 3, 2, 'rgba(70, 52, 20, 0.65)'); }
  pixelBlob(c, x, y + R + 4, R, 3, 'rgba(70, 52, 20, 0.5)');
};
/** Its blades going round behind the guard, one of them bent (so it wobbles). */
const fanBlades = (c: Ctx, f: number) => {
  const x = rx(FAN.r), y = FAN.y, R = FAN.R - 2, a0 = f * 0.11 + Math.sin(f * 0.11) * 0.15;
  for (let k = 0; k < 4; k++) {
    const a = a0 + k * Math.PI / 2 + (k === 1 ? 0.3 : 0);
    poly(c, [x, y, x + Math.cos(a - 0.38) * R, y + Math.sin(a - 0.38) * R, x + Math.cos(a + 0.12) * R, y + Math.sin(a + 0.12) * R], k === 1 ? '#5A5C54' : '#6E7068');
    line(c, [x, y, x + Math.cos(a - 0.38) * R, y + Math.sin(a - 0.38) * R], '#8E9088');
  }
  oval(c, x, y, 4, 4, '#2A2C28'); box(c, x - 1, y - 2, 2, 1, '#8E9088');
};
const paintFanGuard = (g: Ctx) => {
  const x = rx(FAN.r), y = FAN.y, R = FAN.R;
  g.lineWidth = 1;
  for (const r of [5, 11, R - 1]) { g.strokeStyle = '#2A2C28'; g.beginPath(); g.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); g.stroke(); g.strokeStyle = 'rgba(176, 178, 168, 0.6)'; g.beginPath(); g.arc(x - 0.5, y - 0.5, r, Math.PI, Math.PI * 1.5); g.stroke(); }
  box(g, x - R, y, R * 2, 1, '#2A2C28'); box(g, x, y - R, 1, R * 2, '#2A2C28');
  for (let k = 0; k < 9; k++) { const a = hash(k * 3.3) * Math.PI * 2, d = 4 + hash(k * 7.1) * (R - 5); pixelBlob(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 2, 2, 'rgba(90, 66, 26, 0.75)'); }
  for (let k = 0; k < 5; k++) box(g, x - 10 + k * 5, y + R - 2, 1, 4 + (k % 3) * 2, 'rgba(90, 66, 26, 0.7)');
};

/**
 * The door out to the hub (the player presses up at it): the back of the hub's gray steel STAFF ONLY door (hub/draw.ts:
 * staffDoor). Its hinges this side, the closer up top, the push bar, the deadbolt's thumb turn, the kick plate kicked
 * in, SMILE! YOU'RE ON STAGE on it (the last thing they see before they go out there), the day showing in a line under
 * it. TO THE HUB over it.
 */
const exitDoor = (c: Ctx) => {
  const x = EXIT_X - 34, y = G - 120, w = 68, h = 120;
  shade(c, x - 6, y - 6, w + 12, h + 6, 0.3, 4);
  box(c, x - 7, y - 7, w + 14, h + 7, INK);
  slab(c, x - 6, y - 6, w + 12, h + 6, '#3E434A', { ink: false });
  box(c, x - 1, y - 1, w + 2, h + 1, '#0E0F12');
  slab(c, x, y, w, h, '#6B7280');
  box(c, x + 2, y + 2, 5, h - 4, '#7C8592'); checker(c, x + 7, y + 2, 2, h - 4, '#7C8592');
  box(c, x + w - 6, y + 2, 4, h - 4, '#565C68');
  for (const [dx, dy, r] of [[50, 30, 5], [20, 96, 6], [44, 104, 4]]) { oval(c, x + dx, y + dy, r + 1, r, '#5E6572'); box(c, x + dx - r + 1, y + dy + r - 1, r * 2 - 2, 1, '#8892A0'); }
  // (the hinges, this side)
  for (const hy of [y + 10, y + 54, y + 98]) { box(c, x + w - 3, hy, 5, 14, INK); box(c, x + w - 2, hy + 1, 3, 12, '#A3ABB6'); box(c, x + w - 2, hy + 1, 1, 12, '#E5E7EB'); box(c, x + w - 3, hy + 6, 5, 1, INK); }
  // (the closer: its body on the door, its arm up to the frame)
  box(c, x + w - 36, y + 4, 28, 10, INK); box(c, x + w - 35, y + 5, 26, 8, '#3A3F48'); box(c, x + w - 35, y + 5, 26, 1, '#6B737E');
  line(c, [x + w - 32, y + 9, x + w - 50, y + 1, x + w - 20, y - 4], INK, 3); line(c, [x + w - 32, y + 9, x + w - 50, y + 1, x + w - 20, y - 4], '#8A929C', 1);
  // (SMILE! YOU'RE ON STAGE: the park's yellow and red, curling at a corner, taped where it's lost a screw)
  const px = x + 6, py = y + 18, pw = w - 12, ph = 38;
  shade(c, px, py, pw, ph, 0.38, 2);
  box(c, px - 1, py - 1, pw + 2, ph + 2, INK); box(c, px, py, pw, ph, '#B91C1C'); box(c, px + 2, py + 2, pw - 4, ph - 4, '#F2CC4A');
  box(c, px + 2, py + 2, pw - 4, 1, '#FBE38A'); checker(c, px + 2, py + ph - 5, pw - 4, 2, '#D4A82A');
  text(c, 'SMILE!', px + pw / 2, py + 14, '#B91C1C', 8, 'center', '#7A1E1A');
  text(c, "YOU'RE ON", px + pw / 2, py + 25, '#1E3A8A', 5, 'center', null);
  text(c, 'STAGE', px + pw / 2, py + 32, '#1E3A8A', 5, 'center', null);
  screw(c, px + 2, py + 2); screw(c, px + pw - 4, py + 2); screw(c, px + 2, py + ph - 4);
  poly(c, [px + pw, py + ph - 7, px + pw, py + ph, px + pw - 7, py + ph], '#6B7280'); poly(c, [px + pw - 7, py + ph, px + pw, py + ph - 7, px + pw - 7, py + ph - 7], '#C8A030');
  tape(c, px + pw - 9, py + ph - 9, 10, 5);
  // (the deadbolt's thumb turn, on the latch side)
  box(c, x + 8, y + 62, 9, 9, INK); box(c, x + 9, y + 63, 7, 7, '#A3ABB6'); box(c, x + 12, y + 63, 2, 7, '#3A3F48');
  // (the push bar across: its latch case at that side, the chrome bar, the end cap; grime where the hands go)
  pixelBlob(c, x + 34, y + 78, 22, 6, 'rgba(30, 24, 12, 0.3)');
  box(c, x + 3, y + 72, 16, 16, INK); box(c, x + 4, y + 73, 14, 14, '#5A616C'); box(c, x + 4, y + 73, 14, 1, '#9CA3AF');
  box(c, x + 18, y + 75, w - 24, 9, INK); box(c, x + 19, y + 76, w - 26, 7, '#C8CCD2'); box(c, x + 19, y + 76, w - 26, 1, '#FFFFFF'); box(c, x + 19, y + 81, w - 26, 2, '#7A828E');
  box(c, x + w - 8, y + 73, 5, 13, INK); box(c, x + w - 7, y + 74, 3, 11, '#5A616C');
  text(c, 'PUSH', x + 38, y + 82, '#3A3F48', 5, 'center', null);
  // (the kick plate, kicked; the day in a line under the door)
  slab(c, x + 3, G - 22, w - 6, 18, '#8C8F94', { ink: false });
  for (let k = 0; k < 5; k++) line(c, [x + 8 + k * 11, G - 18 + (k % 2) * 4, x + 14 + k * 11, G - 8], 'rgba(30, 30, 34, 0.6)');
  oval(c, x + 40, G - 12, 6, 4, 'rgba(30, 30, 34, 0.45)');
  box(c, x, G - 2, w, 2, '#08090A');
  box(c, x + 3, G - 1, w - 6, 1, '#F4E2A0'); checker(c, x + 6, G - 2, w - 12, 1, 'rgba(244, 226, 160, 0.5)');
  wallSign(c, EXIT_X - 48, G - 156, 'TO THE HUB', '#1F6B3A', '#ECFCCB');
  // (an arrow pointing at it, painted on the wall, and the path worn into the floor in front)
  for (const [ax, dir] of [[x - 22, 1], [x + w + 22, -1]] as const) { box(c, ax - 5, G - 70, 10, 4, fade('#EAB308', 0.35)); poly(c, [ax + dir * 5, G - 74, ax + dir * 11, G - 68, ax + dir * 5, G - 62], fade('#EAB308', 0.35)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The lounge, at the far end: the training video, the couch, the board over it, the chairs stacked in the corner

/** The TV cart: a black steel AV cart (the TV strapped on, the VCR, the tapes), the cords to a power strip. */
const TV = { r: 2416, w: 64 };
const tvTop = () => G - 62;
const TV_SCREEN = () => ({ x: rx(TV.r) + 6, y: tvTop() - 46, w: 42, h: 34 });
const tvCart = (c: Ctx) => {
  const x = rx(TV.r), w = TV.w, top = tvTop();
  shade(c, x - 2, top - 54, w + 4, G - top + 54, 0.3, 3);
  for (const lx of [x + 1, x + w - 6]) { box(c, lx, top, 5, G - 6 - top, INK); box(c, lx + 1, top, 3, G - 6 - top, '#3A3F48'); box(c, lx + 1, top, 1, G - 6 - top, '#6B737E'); }
  for (const sy of [top, G - 34, G - 12]) { box(c, x - 3, sy, w + 6, 6, INK); box(c, x - 2, sy + 1, w + 4, 4, '#2A2C30'); dimTop(c, x - 2, sy + 1, w + 4, '#2A2C30', 1); box(c, x - 2, sy + 4, w + 4, 1, '#14161A'); }
  for (const wx of [x + 3, x + w - 3]) ball(c, wx, G - 4, 4, '#18181B');
  // (the VCR: 12:00 like everything else in here, a tape half in)
  box(c, x + 4, G - 48, w - 8, 14, INK); box(c, x + 5, G - 47, w - 10, 12, '#2A2A2E'); box(c, x + 5, G - 47, w - 10, 1, '#4A4A50');
  box(c, x + 9, G - 44, 26, 4, '#0A0A0C'); box(c, x + 11, G - 46, 22, 3, '#1A1A1E'); box(c, x + 11, G - 46, 22, 1, '#E8E4D8');
  box(c, x + 40, G - 44, 14, 6, '#0A140A'); box(c, x + 42, G - 42, 3, 2, '#5AFF6A'); box(c, x + 47, G - 42, 5, 2, '#5AFF6A');
  // (the tapes on the bottom shelf, their spines)
  [['#E8E4D8', '#B91C1C'], ['#E8E4D8', '#1E3A8A'], ['#18181B', '#E8C040'], ['#E8E4D8', '#2F7D3A']].forEach(([sp, lab], i) => { box(c, x + 6 + i * 12, G - 26, 10, 14, INK); box(c, x + 7 + i * 12, G - 25, 8, 13, sp); box(c, x + 7 + i * 12, G - 21, 8, 4, lab); });
  // (the TV: a beige CRT from the park's opening year, the screen live; knobs; PROPERTY OF HAPPY LAND)
  const ty = top - 54, tw = w;
  box(c, x - 1, ty - 1, tw + 2, 56, INK); slab(c, x, ty, tw, 54, '#B4AA8A', { ink: false }); dimTop(c, x, ty, tw, '#B4AA8A', 3);
  box(c, x + 4, ty + 6, 46, 38, INK); box(c, x + 5, ty + 7, 44, 36, '#14181A');
  for (let k = 0; k < 2; k++) { ball(c, x + 57, ty + 14 + k * 12, 3, '#3A3F48'); box(c, x + 56, ty + 13 + k * 12, 1, 1, '#A3ABB6'); }
  for (let k = 0; k < 4; k++) box(c, x + 53, ty + 38 + k * 3, 8, 1, '#6A6050');
  box(c, x + 6, ty + 46, 44, 6, '#E8E4D8'); text(c, 'HAPPY LAND', x + 28, ty + 51, '#3A2A18', 4, 'center', null);
  // (the rabbit ears, one bent, foil on it)
  line(c, [x + 30, ty, x + 18, ty - 24], INK, 2); line(c, [x + 34, ty, x + 46, ty - 16, x + 54, ty - 18], INK, 2);
  ball(c, x + 32, ty - 1, 4, '#3A3F48'); box(c, x + 50, ty - 21, 7, 5, '#C8CCD2'); box(c, x + 50, ty - 21, 7, 1, '#FFFFFF');
  // (the cords, down off the back to the power strip on the floor, everything plugged into everything)
  line(c, [x + w, ty + 40, x + w + 6, G - 20, x + w + 4, G - 3, x + w + 14, G - 3], '#18181B', 2);
  box(c, x + w + 12, G - 6, 26, 6, INK); box(c, x + w + 13, G - 5, 24, 4, '#E8E4D8'); box(c, x + w + 14, G - 5, 3, 2, '#DC2626');
  for (let k = 0; k < 3; k++) { box(c, x + w + 19 + k * 6, G - 9, 4, 4, '#2A2A2E'); line(c, [x + w + 21 + k * 6, G - 9, x + w + 24 + k * 9, G - 16 - k * 4], '#18181B', 1); }
  note(c, x + 6, top - 106, ['WATCH ON', 'YOUR BREAK'], { size: 5, paper: '#F2E890', ink: '#1E3A8A' });
};
/** The training video, on its loop forever: three slides, the tracking rolling down them. */
const tvScreen = (c: Ctx, f: number) => {
  const { x, y, w, h } = TV_SCREEN(), slide = Math.floor(f / 160) % 3, cx = x + w / 2;
  box(c, x, y, w, h, ['#1E3A8A', '#2F7D3A', '#8E1E1E'][slide]);
  if (slide === 0) {
    star(c, cx, y + 14, 10, '#F2CC4A'); box(c, cx - 4, y + 11, 2, 3, INK); box(c, cx + 3, y + 11, 2, 3, INK); box(c, cx - 3, y + 17, 7, 1, INK);
    box(c, cx + 11, y + 10, 3, 6, '#F2CC4A'); box(c, cx + 11, y + 8, 2, 3, '#F2CC4A');
    text(c, 'SAFETY!', cx, y + h - 3, '#FFFFFF', 5, 'center', null);
  } else if (slide === 1) {
    // (a stick man lifting a box with his back, the X over him; LEGS!)
    ball(c, cx - 8, y + 6, 3, '#FFFFFF', false); line(c, [cx - 8, y + 9, cx + 2, y + 14, cx - 2, y + 24], '#FFFFFF', 2); line(c, [cx + 2, y + 14, cx + 6, y + 24], '#FFFFFF', 2);
    box(c, cx + 4, y + 12, 8, 7, '#C49A62'); line(c, [cx - 4, y + 10, cx + 4, y + 14], '#FFFFFF', 1);
    line(c, [cx - 14, y + 3, cx + 14, y + 25], '#DC2626', 2); line(c, [cx + 14, y + 3, cx - 14, y + 25], '#DC2626', 2);
    text(c, 'LEGS!', cx, y + h - 3, '#FFFFFF', 5, 'center', null);
  } else {
    ball(c, cx, y + 14, 11, '#F2CC4A', false); box(c, cx - 5, y + 9, 2, 3, INK); box(c, cx + 4, y + 9, 2, 3, INK);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(cx, y + 13, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
    text(c, 'SMILE!', cx, y + h - 3, '#FFFFFF', 5, 'center', null);
  }
  const ty = y + Math.round((f * 0.6) % (h + 10)) - 5;
  if (ty > y - 3 && ty < y + h) { const t0 = Math.max(y, ty), t1 = Math.min(y + h, ty + 3); box(c, x, t0, w, t1 - t0, 'rgba(255, 255, 255, 0.28)'); for (let k = 0; k < 6; k++) box(c, x + Math.floor(hash(k + f) * (w - 3)), t0, 3, 1, 'rgba(0, 0, 0, 0.5)'); }
  for (let k = 0; k < h; k += 2) box(c, x, y + k, w, 1, 'rgba(0, 0, 0, 0.16)');
  box(c, x + 3, y + 3, 10, 2, 'rgba(255, 255, 255, 0.22)'); box(c, x + 3, y + 5, 4, 2, 'rgba(255, 255, 255, 0.14)');
};

/**
 * The couch: a plaid one off a curb somewhere in 1979; a seat cushion gone (the springs), the arm duct-taped, the other
 * bleeding its stuffing, a burn, a stain; somebody's been sleeping on it (a park beach towel, a deflated head for a
 * pillow); the remote down the side. Tops dimmed.
 */
const couch = (c: Ctx) => {
  const x = rx(2490), w = 156, back = G - 76, seat = G - 38, aw = 18;
  const P = rampOf('#8A6A2E');
  shade(c, x, back, w, G - back, 0.32, 4);
  // (the back)
  box(c, x + 6, back - 1, w - 12, seat - back + 2, INK);
  box(c, x + 7, back, w - 14, seat - back, P[2]);
  for (let xx = x + 12; xx < x + w - 10; xx += 14) { box(c, xx, back, 3, seat - back, P[1]); box(c, xx + 7, back, 1, seat - back, '#8E3A1E'); }
  for (let yy = back + 8; yy < seat; yy += 12) { box(c, x + 7, yy, w - 14, 2, P[1]); box(c, x + 7, yy + 5, w - 14, 1, P[3]); }
  dimTop(c, x + 7, back, w - 14, P[2], 3);
  for (const k of [1, 2]) box(c, x + aw + k * ((w - aw * 2) / 3), back + 4, 2, seat - back - 4, P[0]);
  // (the seat: three cushions, the middle one gone)
  const cw = (w - aw * 2) / 3;
  for (let i = 0; i < 3; i++) {
    const sx = Math.round(x + aw + i * cw);
    if (i === 1) {
      box(c, sx, seat - 2, cw, 16, '#1E1408');
      c.strokeStyle = '#8A929C'; c.lineWidth = 1;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(sx + 6 + k * 9, seat + 6, 3, 2, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(sx + 6 + k * 9, seat + 2, 3, 2, 0, 0, Math.PI * 2); c.stroke(); }
      continue;
    }
    box(c, sx - 1, seat - 3, cw + 2, 18, INK); box(c, sx, seat - 2, cw, 16, P[2]); box(c, sx, seat - 2, cw, 2, P[1]); box(c, sx, seat + 11, cw, 3, P[0]);
    for (let xx = sx + 4; xx < sx + cw - 2; xx += 14) box(c, xx, seat, 3, 11, P[1]);
  }
  // (the arms)
  for (const ax of [x, x + w - aw]) { box(c, ax - 1, G - 59, aw + 2, 46, INK); box(c, ax, G - 58, aw, 44, P[2]); box(c, ax, G - 58, aw, 4, P[1]); box(c, ax + 2, G - 54, 3, 38, P[3]); box(c, ax + aw - 4, G - 54, 3, 38, P[0]); }
  // (the skirt, the legs)
  box(c, x - 1, G - 15, w + 2, 9, INK); box(c, x, G - 14, w, 7, P[1]); checker(c, x, G - 14, w, 1, P[0]);
  for (const lx of [x + 6, x + w - 14]) { box(c, lx, G - 7, 8, 7, INK); box(c, lx + 1, G - 7, 6, 6, '#5A3A1A'); }
  // (duct tape on the near arm; the far arm's stuffing out; a burn; a stain)
  line(c, [x + 2, G - 50, x + 16, G - 30], '#9CA3AF', 4); line(c, [x + 16, G - 50, x + 2, G - 30], '#9CA3AF', 4); line(c, [x + 2, G - 51, x + 16, G - 31], '#D1D5DB', 1);
  pixelBlob(c, x + w - 8, G - 50, 7, 6, '#E8E4D8'); pixelBlob(c, x + w - 4, G - 54, 4, 3, '#F4F2EA');
  box(c, x + 60, back + 14, 3, 3, '#1A0B06'); box(c, x + 59, back + 13, 5, 1, 'rgba(26, 11, 6, 0.4)');
  pixelBlob(c, x + 110, seat + 4, 9, 4, 'rgba(60, 40, 10, 0.45)');
  // (the towel over the far end, the park's stripes)
  for (let k = 0; k < 6; k++) box(c, x + w - 46 + k * 7, back - 2, 7, 42 + (k % 2) * 4, [FLAG_RED[2], FLAG_WHITE[3]][k % 2]);
  box(c, x + w - 46, back - 3, 42, 3, INK); box(c, x + w - 46, back - 2, 42, 1, dark(FLAG_WHITE[3], 0.2));
  // (the pillow: a pink foam head gone flat, its grin crumpled)
  oval(c, x + 28, seat - 10, 15, 10, INK); oval(c, x + 28, seat - 10, 14, 9, '#E05A9A'); oval(c, x + 24, seat - 13, 7, 4, '#F08AB8');
  box(c, x + 22, seat - 13, 3, 2, INK); box(c, x + 31, seat - 12, 3, 2, INK); line(c, [x + 21, seat - 6, x + 26, seat - 4, x + 30, seat - 6, x + 35, seat - 4], INK, 1);
  // (the remote down the side)
  box(c, x + 72, seat - 6, 4, 10, INK); box(c, x + 73, seat - 5, 2, 8, '#2A2A2E'); box(c, x + 73, seat - 5, 2, 1, '#DC2626');
  // (under it: a shoe, coins, a sock)
  box(c, x + 40, G - 4, 14, 4, INK); box(c, x + 41, G - 3, 12, 3, '#E8E4D8');
  for (let k = 0; k < 3; k++) box(c, x + 80 + k * 6, G - 2, 3, 2, '#C8A030');
};
/** The board over it: the lost and found, the sign-up nobody signs, LIFT WITH YOUR LEGS, DO NOT FEED THE PIGEONS. */
const loungeBoard = (c: Ctx) => {
  const x = rx(2480), y = 162, w = 184, h = 112;
  shade(c, x, y, w, h, 0.38, 4);
  slab(c, x, y, w, h, '#6A4A2A');
  box(c, x + 6, y + 6, w - 12, h - 12, '#3A2A16'); box(c, x + 7, y + 7, w - 14, h - 14, '#A67C4E'); checker(c, x + 7, y + 7, w - 14, h - 14, '#946A3E');
  for (let k = 0; k < 30; k++) box(c, x + 8 + Math.floor(hash(k * 4.3 + 1) * (w - 18)), y + 8 + Math.floor(hash(k * 2.9 + 5) * (h - 18)), 2, 2, k % 2 ? '#7A5430' : '#C49A62');
  note(c, x + 9, y + 10, ['LOST & FOUND', '212 SUNGLASSES', '1 RETAINER (USED)', '40 LEFT SHOES', 'A GRANDMA', '(UNCLAIMED)'], { size: 5, mount: 'tack', paper: '#F4F0E0', pinCol: '#C02424' });
  const su = note(c, x + 110, y + 10, ['SIGN UP:', 'MASCOT DUTY', 'JULY 4TH', '1. GARY', '2. NOT GARY', '3.'], { size: 5, mount: 'tack', paper: '#F2E890', pinCol: '#2D51B0' });
  line(c, [x + 110 + su.w / 2 - 19, y + 41, x + 110 + su.w / 2 + 19, y + 42], '#B91C1C', 1);
  note(c, x + 10, y + 76, ['LIFT WITH', 'YOUR LEGS'], { size: 6, mount: 'tack', paper: '#E0F0D0', ink: '#2F7D3A', pinCol: '#E8C040' });
  note(c, x + 86, y + 76, ['DO NOT FEED', 'THE PIGEONS'], { size: 6, mount: 'tack', paper: '#C8E0F0', ink: '#7A1E1A', pinCol: '#2F7D3A' });
  splat(c, x + 148, y + 88, 1);
};
/** The chairs stacked in the corner: a leaning tower of them, orange and blue, the top one's top dim. */
const stackedChairs = (c: Ctx) => {
  const x = rx(2648), n = 13;
  shade(c, x, G - 40 - n * 9 - 26, 40, n * 9 + 66, 0.3, 3);
  for (const lx of [x + 2, x + 27]) { box(c, lx - 1, G - 38, 5, 38, INK); box(c, lx, G - 38, 3, 38, '#8A929C'); box(c, lx, G - 38, 1, 38, '#C8CCD2'); }
  for (let k = 0; k < n; k++) {
    const yy = G - 40 - k * 9, dx = Math.round(k * 0.7), col = fade(k % 3 === 1 ? '#3A6AA8' : '#C2622A', 0.15), r = rampOf(col);
    poly(c, [x + dx + 27, yy + 1, x + dx + 32, yy - 26, x + dx + 38, yy - 26, x + dx + 34, yy + 6], INK);
    poly(c, [x + dx + 29, yy + 1, x + dx + 33, yy - 24, x + dx + 36, yy - 24, x + dx + 33, yy + 4], r[1]);
    box(c, x + dx - 1, yy - 1, 34, 7, INK); box(c, x + dx, yy, 32, 5, r[2]); box(c, x + dx, yy + 4, 32, 1, r[0]);
    if (k === n - 1) { dimTop(c, x + dx, yy, 32, r[2], 2); box(c, x + dx + 32, yy - 26, 6, 1, r[0]); }
  }
};

/** The high shelf (a one-way ledge, index.ts): steel on brackets off the wall, its lip lit (stood on); up on it the
 *  costume props nobody's thrown out: a pirate hat off Jungle Land's boat, a rubber alien head from Space Land, a box
 *  or two, and a broken animatronic arm hanging off the end, its wires out. Stamped. */
const paintShelf = (c: Ctx) => {
  const { x, y, w } = SHELF;
  for (const bx of [x + 30, x + w - 40]) {
    c.fillStyle = '#1C1A1E'; c.beginPath(); c.moveTo(bx, y + 14); c.lineTo(bx + 10, y + 14); c.lineTo(bx + 3, y + 54); c.lineTo(bx, y + 54); c.closePath(); c.fill();
    c.fillStyle = '#4A4650'; c.fillRect(bx + 1, y + 14, 2, 38);
  }
  c.fillStyle = '#2A1E14'; c.fillRect(x + 150, y - 34, 46, 34); c.fillStyle = '#8A6A44'; c.fillRect(x + 152, y - 32, 42, 30);
  c.fillStyle = '#6E5234'; c.fillRect(x + 152, y - 20, 42, 3); c.fillStyle = '#B08A5C'; c.fillRect(x + 152, y - 32, 42, 2);
  text(c, 'PROPS', x + 173, y - 6, '#3A2A18', 5, 'center', null);
  c.fillStyle = '#2A1E14'; c.fillRect(x + 204, y - 22, 34, 22); c.fillStyle = '#7A5C3A'; c.fillRect(x + 206, y - 20, 30, 18); c.fillStyle = '#A8845A'; c.fillRect(x + 206, y - 20, 30, 2);
  // (the pirate hat: a black tricorn, gold braid, the skull and bones, a red feather)
  const hx = x + 92;
  poly(c, [hx - 25, y + 1, hx - 21, y - 15, hx - 9, y - 23, hx + 9, y - 23, hx + 21, y - 15, hx + 25, y + 1], INK);
  poly(c, [hx - 23, y, hx - 19, y - 14, hx - 8, y - 21, hx + 8, y - 21, hx + 19, y - 14, hx + 23, y], '#26222C');
  poly(c, [hx - 23, y, hx - 19, y - 14, hx - 12, y - 18, hx - 12, y], '#3A3442');
  line(c, [hx - 23, y - 1, hx - 19, y - 14, hx - 8, y - 21, hx + 8, y - 21, hx + 19, y - 14, hx + 23, y - 1], '#C9A227', 1);
  ball(c, hx, y - 11, 4, '#F1EFEA', false); box(c, hx - 2, y - 12, 1, 2, INK); box(c, hx + 1, y - 12, 1, 2, INK); box(c, hx - 1, y - 8, 3, 1, '#F1EFEA');
  line(c, [hx - 6, y - 5, hx + 6, y - 2], '#F1EFEA', 1); line(c, [hx + 6, y - 5, hx - 6, y - 2], '#F1EFEA', 1);
  line(c, [hx + 16, y - 16, hx + 26, y - 34, hx + 30, y - 36], '#B91C1C', 3); line(c, [hx + 17, y - 17, hx + 27, y - 35], '#F06A55', 1);
  // (the alien head: green rubber, the black eyes, an antenna, split down one side)
  const ax = x + 130;
  oval(c, ax, y - 16, 15, 17, INK); oval(c, ax, y - 16, 14, 16, '#5FAF46'); oval(c, ax - 4, y - 22, 8, 8, '#7ECB60'); checker(c, ax + 4, y - 12, 8, 10, '#3E8A2E');
  for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.ellipse(ax + s * 6, y - 15, 5, 3, s * 0.5, 0, Math.PI * 2); c.fill(); box(c, ax + s * 6 - 1, y - 17, 2, 1, '#FFFFFF'); }
  line(c, [ax + 2, y - 32, ax + 6, y - 44], INK, 2); ball(c, ax + 6, y - 45, 3, '#F2CC4A');
  line(c, [ax + 11, y - 26, ax + 13, y - 16, ax + 10, y - 8], '#1E3A12', 1); box(c, ax + 12, y - 18, 3, 3, '#E8E4D8');
  oval(c, ax, y - 1, 9, 2, '#0A0A0E');
  // (the animatronic arm: steel and servos, its rubber skin half peeled, a tattoo on what's left; the hand hanging off the
  // end; the wires out of the shoulder)
  const sx = x + 244;
  for (const [col, dy] of [['#DC2626', -6], ['#E8C040', -3], ['#2D51B0', 0]] as const) { line(c, [sx, y - 5, sx - 6, y - 7 + dy, sx - 12, y - 2 + dy], col, 1); box(c, sx - 13, y - 3 + dy, 2, 2, '#D97706'); }
  box(c, sx - 1, y - 11, 44, 11, INK); box(c, sx, y - 10, 42, 9, '#8A929C'); box(c, sx, y - 10, 42, 2, '#C8CCD2'); box(c, sx, y - 3, 42, 2, '#5A616C');
  box(c, sx + 14, y - 10, 28, 9, '#D8A27A'); box(c, sx + 14, y - 10, 28, 2, '#ECC0A0'); box(c, sx + 14, y - 3, 28, 2, '#B07A54');
  for (let k = 0; k < 3; k++) box(c, sx + 12 - k, y - 9 + k * 3, 3, 2, '#D8A27A');
  box(c, sx + 26, y - 8, 5, 4, '#1E3A8A'); box(c, sx + 28, y - 9, 1, 6, '#1E3A8A');
  ball(c, sx + 47, y - 6, 6, '#3A3F48'); ball(c, sx + 47, y - 6, 3, '#B91C1C', false);
  // (the plank: inked, its face dark, the top lip lit)
  c.fillStyle = '#0E0C10'; c.fillRect(x - 2, y - 2, w + 4, 18);
  c.fillStyle = '#4C4852'; c.fillRect(x, y + 3, w, 11);
  c.fillStyle = '#36323A'; c.fillRect(x, y + 10, w, 4);
  c.fillStyle = '#C8C2B4'; c.fillRect(x, y, w, 3);
  // (the arm's forearm and hand, hanging down over the plank's end)
  box(c, sx + 50, y - 4, 7, 32, INK); box(c, sx + 51, y - 4, 5, 30, '#D8A27A'); box(c, sx + 51, y - 4, 1, 30, '#ECC0A0'); box(c, sx + 51, y + 6, 5, 8, '#8A929C');
  for (let k = 0; k < 4; k++) { box(c, sx + 49 + k * 3, y + 26, 2, 7 + (k % 2) * 3, INK); box(c, sx + 49 + k * 3, y + 26, 1, 6 + (k % 2) * 3, '#D8A27A'); }
};
export const drawPenShelf = (ctx: Ctx, state: GameState) => {
  const { x, y, w } = SHELF;
  if (x + w < state.camera.x - 40 || x > state.camera.x + CANVAS_WIDTH + 40) return;
  stamp(ctx, 'pen-shelf', x - 30, y - 70, w + 70, 140, paintShelf);
};

// ---------------------------------------------------------------------------------------------------------------
// The room in strips: everything still, painted once per strip

const CHUNK = 420;
const STRIP_X0 = () => X0 - WALL;
const STRIPS = () => Math.ceil((LEN + WALL * 2) / CHUNK);
/** The props, with the stretch of room (world x) each one's paint can reach. */
let items: { a: number; b: number; paint: (c: Ctx) => void }[] | null = null;
const propList = () => items ?? (items = [
  { a: rx(-10), b: rx(30), paint: cornerPipe },
  { a: rx(-10), b: rx(110), paint: deadPlant },
  { a: rx(-10), b: rx(110), paint: windowFrame },
  { a: rx(160), b: rx(250), paint: fanHousing },
  { a: rx(120), b: rx(200), paint: conduit },
  { a: EXIT_X - 70, b: EXIT_X + 70, paint: exitDoor },
  { a: rx(170), b: rx(320), paint: timeClock },
  { a: rx(300), b: rx(520), paint: mirror },
  { a: rx(310), b: rx(500), paint: mopBucket },
  { a: rx(520), b: rx(760), paint: incidentBoard },
  { a: rx(515), b: rx(715), paint: fireExit },
  { a: rx(685), b: rx(780), paint: trash },
  { a: rx(780), b: rx(1080), paint: mural },
  { a: rx(800), b: rx(1080), paint: lockers },
  { a: rx(1040), b: rx(1240), paint: closet },
  { a: rx(1230), b: rx(1440), paint: rack },
  { a: rx(1380), b: rx(1740), paint: heads },
  { a: rx(1590), b: rx(1720), paint: laundry },
  { a: rx(1680), b: rx(1840), paint: bagWall },
  { a: rx(1860), b: rx(1980), paint: leakBucket },
  { a: rx(2240), b: rx(2400), paint: pennants },
  { a: rx(1930), b: rx(2150), paint: bulletin },
  { a: rx(1920), b: rx(2140), paint: breakTable },
  { a: rx(2135), b: rx(2255), paint: counter },
  { a: rx(2245), b: rx(2340), paint: fridge },
  { a: rx(2330), b: rx(2400), paint: vending },
  { a: rx(2400), b: rx(2560), paint: tvCart },
  { a: rx(2470), b: rx(2680), paint: loungeBoard },
  { a: rx(2480), b: rx(2660), paint: couch },
  { a: rx(2640), b: rx(LEN), paint: stackedChairs },
  // (the filth over it all)
  { a: rx(0), b: rx(110), paint: smokers },
  { a: rx(230), b: rx(300), paint: lostHead },
  { a: rx(1240), b: rx(1360), paint: unionNotice },
  { a: rx(760), b: rx(790), paint: flypaper },
  { a: rx(1870), b: rx(1950), paint: nest },
  { a: rx(SINK_X - 10), b: rx(SINK_X + SINK_W + 20), paint: sink },
  { a: rx(470), b: rx(1100), paint: pigeonMess },
  ...[500, 1822].map(r => ({ a: rx(r - 30), b: rx(r + 30), paint: (c: Ctx) => ratHole(c, rx(r)) })),
]);

const strip = (c: Ctx, i: number) => {
  const a = STRIP_X0() + i * CHUNK - 2, b = Math.min(STRIP_X0() + (i + 1) * CHUNK, X0 + LEN + WALL) + 2;
  c.save(); c.beginPath(); c.rect(a, -60, b - a, CANVAS_HEIGHT + 120); c.clip();
  const ia = Math.max(a, X0), ib = Math.min(b, X0 + LEN);
  if (ib > ia) {
    ceiling(c, ia, ib);
    wall(c, ia, ib);
    floor(c, ia, ib);
    floorFilth(c, ia, ib);
    if (a < rx(1950) && b > rx(700)) ceilingFaults(c);
    wallFaults(c);
    pipes(c, ia, ib);
    for (const it of propList()) if (it.b > a && it.a < b) it.paint(c);
  }
  if (a < X0) endWall(c, X0 - WALL, 1);
  if (b > X0 + LEN) endWall(c, X0 + LEN, -1);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// What moves

const FIXTURES = [210, 570, 930, 1290, 1650, 2010, 2310, 2610];
/** The fixture that flickers, and the one that's dead. */
const FLICKER = 930, DEAD = 2310;

const lights = (c: Ctx, f: number, vis: (a: number, b: number) => boolean) => {
  for (const fr of FIXTURES) {
    const x = rx(fr) - 48;
    if (!vis(x - 80, x + 176)) continue;
    let on = fr !== DEAD;
    if (fr === FLICKER) { const t = Math.floor(f / 3); on = hash(t * 0.37) > 0.3 && !(Math.floor(f / 90) % 4 === 1 && hash(t) > 0.15); }
    else if ((f + fr) % 520 < 3) on = false;
    // (the light down the wall: banded, each step a shade fainter)
    if (on) for (let k = 0; k < 3; k++) {
      const spread = 30 + k * 40;
      c.fillStyle = 'rgba(250, 248, 220, 0.035)'; c.beginPath();
      c.moveTo(x + 4 - k * 6, CEIL_Y + 22); c.lineTo(x + 92 + k * 6, CEIL_Y + 22); c.lineTo(x + 96 + spread, G); c.lineTo(x - spread, G); c.closePath(); c.fill();
    }
    // (the fixture: chains, the housing, the tubes, dead bugs in the tray)
    box(c, x + 10, CEIL_Y, 2, 10, '#5A5E66'); box(c, x + 84, CEIL_Y, 2, 10, '#5A5E66');
    box(c, x - 1, CEIL_Y + 9, 98, 10, INK); box(c, x, CEIL_Y + 10, 96, 8, '#8A8C86'); box(c, x, CEIL_Y + 10, 96, 2, '#B0B2AA'); box(c, x, CEIL_Y + 16, 96, 2, '#5A5C56');
    for (let k = 0; k < 4; k++) box(c, x + 14 + k * 21 + (fr % 7), CEIL_Y + 13, 2, 1, '#2A2A22');
    const tube = on ? '#FAFCEC' : '#6F7468', glow = on ? '#E8F0D0' : '#5A5E54';
    box(c, x + 3, CEIL_Y + 19, 90, 4, glow); box(c, x + 3, CEIL_Y + 19, 90, 1, tube); box(c, x + 3, CEIL_Y + 21, 90, 1, tube);
    if (fr === DEAD || fr === FLICKER) { box(c, x + 3, CEIL_Y + 19, 8, 4, '#3A3A30'); box(c, x + 85, CEIL_Y + 19, 8, 4, '#3A3A30'); }
    box(c, x + 1, CEIL_Y + 19, 2, 4, '#3A3F48'); box(c, x + 93, CEIL_Y + 19, 2, 4, '#3A3F48');
  }
};

/** The drip: a drop from the hole in the ceiling every so often, into the bucket, a ring going out on the water. */
const drip = (c: Ctx, f: number) => {
  const x = rx(1910), top = CEIL_Y + 6, bottom = G - 27, period = 64;
  const t = f % period;
  if (t < 12) { const s = Math.floor(t / 4); box(c, x - 1, top, 3, 2 + s, '#A8C8D8'); }
  else {
    const fall = (t - 12) / 20, y = top + fall * fall * (bottom - top);
    if (y < bottom) { box(c, x - 1, y, 3, 5, '#A8C8D8'); box(c, x - 1, y, 1, 2, '#E8F4FA'); }
    else { const k = t - 12 - 20; if (k < 14) { const r = 3 + k; box(c, x - r, bottom - 1, r * 2, 1, 'rgba(200, 225, 235, 0.7)'); if (k < 6) { box(c, x - 4, bottom - 4 - k, 2, 2, '#A8C8D8'); box(c, x + 3, bottom - 4 - k, 2, 2, '#A8C8D8'); } } }
  }
};

/** A roach: a brown body lit along its back, the legs going, the feelers. */
const roach = (c: Ctx, x: number, y: number, dir: number, f: number, up = false) => {
  x = Math.round(x); y = Math.round(y);
  if (up) {
    box(c, x - 2, y - 4, 5, 9, INK); box(c, x - 1, y - 3, 3, 7, '#5A3014'); box(c, x - 1, y - 3, 1, 6, '#8A5428');
    const l = f % 4 < 2 ? 1 : -1;
    for (let k = 0; k < 3; k++) { box(c, x - 4, y - 2 + k * 3 + l, 2, 1, INK); box(c, x + 3, y - 2 + k * 3 - l, 2, 1, INK); }
    const hy = dir < 0 ? y - 8 : y + 5;
    box(c, x - 2, hy, 1, 3, INK); box(c, x + 2, hy, 1, 3, INK);
    return;
  }
  box(c, x - 4, y - 4, 9, 4, INK); box(c, x - 3, y - 4, 7, 3, '#5A3014'); box(c, x - 3, y - 4, 6, 1, '#8A5428');
  const l = f % 4 < 2 ? 1 : 0;
  for (let k = 0; k < 3; k++) box(c, x - 3 + k * 3 + l, y - 1, 1, 1, INK);
  box(c, x + dir * 5, y - 4, 2, 2, INK);
  box(c, x + dir * 7, y - 6, 3, 1, INK);
};

const critters = (c: Ctx, f: number, vis: (a: number, b: number) => boolean) => {
  // (one across the floor under the table, stopping and starting)
  if (vis(rx(1940), rx(2340))) {
    const t = f * 0.012, p = Math.sin(t) + 0.3 * Math.sin(t * 3.7);
    const dir = Math.cos(t) + 1.1 * Math.cos(t * 3.7) > 0 ? 1 : -1;
    roach(c, rx(2140) + p * 150, G, dir, f);
  }
  // (one up and down the wall by the trash)
  if (vis(rx(760), rx(800))) { const t = f * 0.015, dy = Math.sin(t) * 40; roach(c, rx(786), 478 + dy, Math.cos(t) > 0 ? -1 : 1, f, true); }
  // (one in and out of the microwave)
  if (vis(rx(2140), rx(2210))) { const t = f * 0.02, k = Math.sin(t); if (k > -0.4) roach(c, rx(2176) + k * 28, 466, Math.cos(t) > 0 ? 1 : -1, f); }
  // (flies over the trash and the laundry)
  // (the sink's tap, dripping onto the dishes)
  if (vis(rx(SINK_X), rx(SINK_X + SINK_W))) { const t = f % 50, y = SINK_Y - 10 + t * 0.5; if (t < 26) box(c, rx(SINK_X) + 31, Math.round(y), 2, 3, '#A8C8B8'); }
  for (const [fx, fy] of [[rx(732), G - 82], [rx(1660), 448], [rx(270), G - 30], [rx(SINK_X + 26), SINK_Y - 18], [rx(86), G - 34], [rx(2290), G - 20], [rx(2560), G - 56]] as const) {
    if (!vis(fx - 30, fx + 30)) continue;
    for (let i = 0; i < 3; i++) {
      const x = Math.round(fx + Math.sin(f * 0.11 + i * 2.1) * 16 + Math.sin(f * 0.37 + i) * 4), y = Math.round(fy + Math.cos(f * 0.15 + i * 1.3) * 9);
      box(c, x, y, 2, 2, '#14140E'); if ((f + i) % 3) box(c, x - 1, y - 1, 1, 1, 'rgba(220, 230, 240, 0.7)');
    }
  }
  // (the laundry's smell, rising)
  if (vis(rx(1600), rx(1720))) for (let k = 0; k < 3; k++) {
    const bx = rx(1626 + k * 30);
    for (let s = 0; s < 6; s++) { const y = 430 - s * 8 - ((f * 0.5 + k * 10) % 8); box(c, Math.round(bx + Math.sin(f * 0.05 + s * 0.9 + k) * 4), Math.round(y), 2, 4, `rgba(140, 170, 60, ${(0.45 - s * 0.06).toFixed(2)})`); }
  }
  // (the burnt pot, smoking)
  if (vis(rx(2200), rx(2260))) for (let s = 0; s < 5; s++) {
    const y = 404 - ((f * 0.4 + s * 9) % 45), a = 0.3 * (1 - (404 - y) / 45);
    box(c, Math.round(rx(2226) + Math.sin(f * 0.04 + s) * 3), Math.round(y), 3, 3, `rgba(60, 56, 50, ${a.toFixed(2)})`);
  }
  // (the microwave's clock: 12:00, blinking, forever)
  if (vis(rx(2180), rx(2210)) && f % 60 < 36) {
    const d0 = rx(2146) + 45, my = 466 - 40 + 8;
    const seg = (x: number, d: string) => {
      const on = (s: number) => ({ 1: [1, 2], 2: [0, 1, 3, 4, 6], 0: [0, 1, 2, 3, 4, 5] } as Record<string, number[]>)[d].includes(s);
      const S = [[0, 0, 3, 1], [2, 0, 1, 3], [2, 2, 1, 3], [0, 4, 3, 1], [0, 2, 1, 3], [0, 0, 1, 3], [0, 2, 3, 1]];
      S.forEach(([sx, sy, sw, sh], i) => { if (on(i)) box(c, x + sx, my + sy, sw, sh, '#5AFF6A'); });
    };
    seg(d0 - 2, '1'); seg(d0 + 2, '2'); box(c, d0 + 6, my + 1, 1, 1, '#5AFF6A'); box(c, d0 + 6, my + 3, 1, 1, '#5AFF6A'); seg(d0 + 8, '0'); seg(d0 + 12, '0');
  }
  // (a ribbon tied to the AC vent, the one sign it works)
  if (vis(rx(1290), rx(1400))) for (let s = 0; s < 8; s++) {
    const y = 114 + s * 3, x = rx(1376) + Math.sin(f * 0.25 - s * 0.6) * s * 0.9;
    box(c, Math.round(x), y, 3, 3, [FLAG_RED[2], FLAG_WHITE[3], FLAG_BLUE[2]][Math.floor(s / 3) % 3]);
  }
};

/** The punching bag, swinging a little on its chain; MGMT taped on it. */
const bag = (c: Ctx, f: number) => {
  const X = rx(1850), len = 290 - CEIL_Y, sway = Math.sin(f * 0.05) * 0.06;
  c.save(); c.translate(X, CEIL_Y); c.rotate(sway * 0.4);
  for (let y = 0; y < len; y += 6) { box(c, -2, y, 4, 5, INK); box(c, -1, y, 2, 4, y % 12 ? '#8A8E96' : '#B8BCC4'); }
  c.restore();
  c.save(); c.translate(X - Math.sin(sway * 0.4) * len, 290); c.rotate(sway);
  line(c, [-16, 14, 0, 0, 16, 14], '#8A8E96', 2);
  box(c, -23, 12, 46, 122, INK);
  pole(c, -22, 14, 44, 118, '#8E1E1E', false);
  box(c, -22, 14, 44, 6, '#3A0A0A'); box(c, -22, 126, 44, 6, '#3A0A0A');
  box(c, -22, 60, 44, 3, '#3A0A0A');
  box(c, -14, 84, 18, 10, '#8A8E8A'); box(c, -14, 84, 18, 1, '#B0B4B0'); box(c, 4, 100, 14, 8, '#8A8E8A');
  box(c, -12, 28, 28, 28, '#E8E4D0'); box(c, -12, 28, 28, 1, '#FFFFF0');
  box(c, -7, 34, 4, 3, INK); box(c, 6, 34, 4, 3, INK); box(c, -5, 42, 12, 2, INK); box(c, -8, 32, 6, 1, INK); box(c, 5, 32, 6, 1, INK);
  text(c, 'MGMT', 2, 53, '#B91C1C', 6, 'center', null);
  tape(c, -14, 26, 8, 4); tape(c, 10, 26, 8, 4);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The room's side walls, in perspective: coming toward him from the back wall's corners (the same eye as the floor's),
// the same block, stripe, wainscot and base as the back wall turned side on; the ceiling over them and the floor
// under them running on to the screen's edge. A room's end, not a way on.

/** The eye: the middle of the screen across, a little above the middle of the wall up and down. */
// (made when first wanted: CEIL_Y comes from index.ts, which imports this)
const eyeY = () => CEIL_Y + (G - CEIL_Y) * 0.45;
const sideBands = (): [number, number, string][] => [
  [CEIL_Y, pipeY(), '#6A6250'], [pipeY(), pipeY() + 9, '#5A1E0C'], [pipeY() + 9, STRIPE, '#6A6250'],
  [STRIPE, STRIPE + 8, fade(FLAG_RED[1], 0.42)], [STRIPE + 8, STRIPE + 12, fade(FLAG_WHITE[2], 0.42)], [STRIPE + 12, STRIPE + 20, fade(FLAG_BLUE[1], 0.42)],
  [STRIPE + 20, WAIN, '#6A6250'], [WAIN, WAIN + 4, '#2A3424'], [WAIN + 4, BASE, '#46523E'], [BASE, G, '#1C1A16'],
];
const sideWall = (c: Ctx, cam: number, corner: number, side: -1 | 1) => {
  const ex = cam + CANVAS_WIDTH / 2;
  if ((corner - ex) * side <= 4) return;
  // (out to past the screen's edge)
  const edge = side < 0 ? cam - 60 : cam + CANVAS_WIDTH + 60;
  const D = Math.max(1.02, (edge - ex) / (corner - ex));
  if (D <= 1.02 && (side < 0 ? corner < cam - 40 : corner > cam + CANVAS_WIDTH + 40)) return;
  const EYE_Y = eyeY();
  const P = (y: number, d: number): [number, number] => [ex + (corner - ex) * d, EYE_Y + (y - EYE_Y) * d];
  const quad = (pts: [number, number][], col: string) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
  const far = 2000;
  // The ceiling over it, on to the edge. (The floor under it is the bent floor's own: bendFloor fans its ends out from
  // the corners along the wall's foot, its tiles running on toward him. A flat fill over it here cut the floor straight
  // down at the corner, the tiles one side, plain the other.)
  const [cx1, cy1] = P(CEIL_Y, D);
  quad([[corner, CEIL_Y], [cx1, cy1], [cx1, -far], [corner, -far]], '#4E4B3E');
  // (the ceiling's T-bars, going on toward him)
  for (let d = 1.12; d < D; d *= 1.12) {
    const [x0] = P(G, d), [, yc] = P(CEIL_Y, d);
    c.fillStyle = 'rgba(196, 192, 174, 0.35)'; c.fillRect(Math.min(corner, x0), Math.round(yc), Math.abs(x0 - corner), 1);
  }
  // The wall itself, band by band
  for (const [y0, y1, col] of sideBands()) quad([P(y0, 1), P(y0, D), P(y1, D), P(y1, 1)], col);
  // (the block's courses and joints, going back to the corner: wider apart the nearer)
  c.strokeStyle = 'rgba(46, 36, 22, 0.5)'; c.lineWidth = 1; c.beginPath();
  for (let y = CEIL_Y + 34; y < STRIPE; y += 24) { const [a, b] = P(y, 1), [e, f] = P(y, D); c.moveTo(a, b); c.lineTo(e, f); }
  for (let d = 1.1; d < D; d *= 1.1) { const [a, b] = P(CEIL_Y, d), [, f] = P(STRIPE, d); c.moveTo(Math.round(a) + 0.5, b); c.lineTo(Math.round(a) + 0.5, f); }
  c.stroke();
  // (the corner: shadowed into it, an inked line down it)
  quad([P(CEIL_Y, 1), P(CEIL_Y, 1.06), P(G, 1.06), P(G, 1)], 'rgba(10, 10, 8, 0.35)');
  box(c, corner - (side < 0 ? 1 : 0), CEIL_Y, 1, G - CEIL_Y, '#1A1A16');
  // (the ceiling's edge along its top, the floor's along its foot)
  c.strokeStyle = '#2A281F'; c.lineWidth = 2; c.beginPath();
  c.moveTo(...P(CEIL_Y, 1)); c.lineTo(...P(CEIL_Y, D)); c.moveTo(...P(G, 1)); c.lineTo(...P(G, D)); c.stroke();
};

/** Behind the room: nothing but the dark (the room's own walls fill the screen). */
export const drawPenBackdrop = (ctx: Ctx, _state: GameState) => {
  void _state;
  box(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#121410');
};

export const drawPenBack = (ctx: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  const vis = (a: number, b: number) => b > cam - 20 && a < cam + CANVAS_WIDTH + 20;
  for (let i = 0; i < STRIPS(); i++) {
    const a = STRIP_X0() + i * CHUNK - 2, b = Math.min(STRIP_X0() + (i + 1) * CHUNK, X0 + LEN + WALL) + 2;
    if (vis(a, b)) stamp(ctx, `pen-strip-${i}`, a, -60, b - a, CANVAS_HEIGHT + 120, g => strip(g, i));
  }
  // (the floor in perspective: fanning out toward him from where he walks, the rows deeper the nearer they are)
  bendFloor(ctx, { x: cam + CANVAS_WIDTH / 2 }, G, G, G + 120, X0, X0 + LEN);
  // (the side walls: after the bend, which is the floor's alone)
  sideWall(ctx, cam, X0, -1); sideWall(ctx, cam, X0 + LEN, 1);
  // (the window's view, the fan behind its guard, the training video: live, their glass and guard stamped over them)
  if (vis(rx(WIN.r) - 10, rx(WIN.r + WIN.w) + 10)) { windowView(ctx, f); stamp(ctx, 'pen-window-glass', rx(WIN.r) - 2, WIN.y - 2, WIN.w + 4, WIN.h + 4, paintWindowGlass); }
  if (vis(rx(FAN.r - FAN.R), rx(FAN.r + FAN.R))) { fanBlades(ctx, f); stamp(ctx, 'pen-fan-guard', rx(FAN.r) - FAN.R - 2, FAN.y - FAN.R - 2, FAN.R * 2 + 4, FAN.R * 2 + 10, paintFanGuard); }
  if (vis(rx(TV.r), rx(TV.r + TV.w))) tvScreen(ctx, f);
  lights(ctx, f, vis);
  if (vis(rx(1880), rx(1940))) drip(ctx, f);
  critters(ctx, f, vis);
  if (vis(rx(1790), rx(1910))) bag(ctx, f);
};
