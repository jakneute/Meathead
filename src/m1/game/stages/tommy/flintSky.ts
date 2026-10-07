// Flint at dusk, behind the ruins (the last stretch, up over the hole down to Tommy's): the sky going from night at the
// top to the sun just going down behind the town, its first stars, streaks of cloud lit from underneath, the smog
// over it all; and the town in layers, each sliding by slower the further off it is: downtown's few towers, the
// shut-down plants (sawtooth sheds, the stacks, the conveyor), the river (the wrong colour) with the VEHICLE CITY
// arch over the bridge, and the nearest street of what's left of the East Side (boarded up, one burned out, a lot
// gone back to weeds, a billboard still promising clean water). All of it painted the once, at the screen's own
// resolution, and put down every frame; only the little live things are drawn each frame (the warning lights
// blinking, a stack smoking, a streetlight on the blink, a letter on the arch, a police light, birds, the river
// glinting).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE } from '../../../constants';
import { bandedGradient, hazeBands, steppedGlow, checker, pixelBlob } from '../../render/pixelArt';
import { hash, rng, mix } from '../../render/backdrops/core';
import { COURSE, RUINS_Y } from './course';
import { eveningAt, drawWaterTower } from './streetDraw';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, S = RENDER_SCALE;

// ---------------------------------------------------------------------------
// The layers: how far each slides (across and up), and where it sits on the screen with the camera at rest
// ---------------------------------------------------------------------------

/** How far the camera can go along the ruins (from just short of them to the far end), for the layers to slide over. */
const SPAN = 1700;
/** Where the camera rests up in the ruins (him stood on the ground). */
const REST_Y = RUINS_Y - 550;

/** A layer: how far it slides with the camera (across, up), where it sits, its ground's colour under it; one that
 * wraps round (the street's, for the length of the road) is `wrap` wide and painted to join up end to end. */
interface Layer { key: string; fx: number; fy: number; top: number; h: number; paint: (g: Ctx, w: number) => void; base: string; wrap?: number; tint?: [string, number] }
const layerW = (l: Layer) => l.wrap ?? W + Math.ceil(l.fx * SPAN) + 4;

const canvases = new Map<string, HTMLCanvasElement>();
/** A layer painted the once at the screen's resolution, in the screen's own coordinates (y as it sits at rest). */
const painted = (l: Layer) => {
  if (typeof document === 'undefined') return null;
  let c = canvases.get(l.key);
  // (the street's and the ruins' are never wanted at once: the other end's let go)
  if (!c) for (const k of [...canvases.keys()]) if (k.split('-')[1] !== l.key.split('-')[1]) canvases.delete(k);
  if (!c) {
    const w = layerW(l);
    c = document.createElement('canvas'); c.width = w * S; c.height = l.h * S;
    const g = c.getContext('2d')!;
    // (one that wraps is painted twice over, a width apart: whatever runs off its right end comes back on at its left)
    for (const o of l.wrap ? [0, -w] : [0]) { g.setTransform(S, 0, 0, S, o * S, -l.top * S); l.paint(g, w); }
    // (one in another light: washed over with it, just where there's something painted)
    if (l.tint) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = l.tint[1]; g.fillStyle = l.tint[0]; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    canvases.set(l.key, c);
  }
  return c;
};

/** How far a layer's slid across (in its own x) and down the screen, for the camera where it is. */
const slide = (state: GameState, l: Layer) => {
  const u = Math.max(0, Math.min(SPAN, state.camera.x - (COURSE.ruins.x1 - 400)));
  const dy = Math.max(-400, Math.min(1600, state.camera.y - REST_Y));
  return { ox: Math.round(u * l.fx * S) / S, oy: -Math.round(dy * l.fy * S) / S };
};

/** Puts a layer down (and its ground on down to the bottom of the screen, wherever it's slid up to). */
const put = (ctx: Ctx, state: GameState, l: Layer) => {
  const { ox, oy } = slide(state, l);
  const c = painted(l);
  if (c) ctx.drawImage(c, ox * S, 0, W * S, l.h * S, 0, l.top + oy, W, l.h);
  else { ctx.save(); ctx.translate(-ox, oy); l.paint(ctx, layerW(l)); ctx.restore(); }
  if (l.base && l.top + oy + l.h < H) { ctx.fillStyle = l.base; ctx.fillRect(0, l.top + oy + l.h - 1, W, H - (l.top + oy + l.h) + 1); }
  return { ox, oy };
};

// ---------------------------------------------------------------------------
// Little helpers
// ---------------------------------------------------------------------------

/** Letters 3 or so cells wide and 5 tall (just the ones the signs need), each cell `px` square. */
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], C: ['.##', '#..', '#..', '#..', '.##'], E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'], G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], L: ['#..', '#..', '#..', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['##.', '..#', '.#.', '#..', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'], '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '9': ['###', '#.#', '###', '..#', '##.'], '!': ['#', '#', '#', '.', '#'], ' ': ['..', '..', '..', '..', '..'],
};
const textW = (s: string, px: number) => [...s].reduce((n, ch) => n + ((GLYPHS[ch]?.[0].length ?? 3) + 1) * px, -px);
/** Spells `s` out from (x, y) (its top left), each letter its colour from `color(i)` (or nothing, to leave a gap). */
const pixText = (g: Ctx, s: string, x: number, y: number, px: number, color: string | ((i: number) => string | null)) => {
  let cx = x;
  [...s].forEach((ch, i) => {
    const rows = GLYPHS[ch] ?? GLYPHS[' '];
    const c = typeof color === 'string' ? color : color(i);
    if (c) { g.fillStyle = c; rows.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') g.fillRect(cx + rx * px, y + ry * px, px, px); }); }
    cx += (rows[0].length + 1) * px;
  });
};

/** A straight 1px line (stepped, no smoothing to speak of: it's drawn a cell at a time). */
const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, color: string) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  g.fillStyle = color;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
};
/** A wire sagging from one point to another (1px, a cell at a time). */
const wire = (g: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, color: string) => {
  g.fillStyle = color;
  for (let x = Math.round(x0); x <= x1; x++) { const t = (x - x0) / (x1 - x0); g.fillRect(x, Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)), 1, 1); }
};

/**
 * Streaks of cloud: `n` of them from y0 down, `step` apart, each a stack of 2px slats (the middle ones longest, their
 * ends dithered off), toned top to bottom by `tones` (for how far down the sky it is, 0..1): its top, its body, its
 * underside, and a line along the very bottom of it.
 */
const paintClouds = (g: Ctx, w: number, seed: number, y0: number, step: number, n: number, tones: (k: number) => string[]) => {
  const cr = rng(seed);
  for (let i = 0; i < n; i++) {
    const y = Math.round(y0 + i * step + cr() * step * 0.5), x = Math.round(cr() * w - 60), len = Math.round(110 + cr() * 220);
    const [top, body, lit, edge] = tones(Math.min(1, Math.max(0, (i + 0.5) / n)));
    const rows = 4 + Math.floor(cr() * 4);
    for (let rr = 0; rr < rows; rr++) {
      const shrink = Math.abs(rr - (rows - 1) * 0.6) / rows;
      const rx = Math.round(x + len * (0.08 + shrink * 0.3) + (cr() - 0.5) * 30), rl = Math.round(len * (0.75 - shrink * 0.5));
      const ry = y + rr * 2;
      const c = rr === 0 ? top : rr >= rows - 2 ? lit : body;
      g.fillStyle = c; g.fillRect(rx + 4, ry, rl - 8, 2);
      checker(g, rx, ry, 4, 2, c); checker(g, rx + rl - 4, ry, 4, 2, c, 1);
      if (rr === rows - 1) { g.fillStyle = edge; g.fillRect(rx + 10, ry + 1, Math.max(0, rl - 30), 1); }
    }
    // (a thin tail trailing off it, broken up)
    checker(g, x + len, y + rows * 2 - 1, Math.round(40 + cr() * 60), 1, body);
  }
};

// ---------------------------------------------------------------------------
// The sky
// ---------------------------------------------------------------------------

const SKY = ['#120F26', '#1A1533', '#251B40', '#36214C', '#4C2857', '#66305E', '#843A64', '#A44663', '#C2555E', '#DA6A57', '#EB8450', '#F4A055', '#F8BC66'];
const SKY_LOW = SKY[SKY.length - 1];
const SUN_X = 612, SUN_Y = 452;

const sky: Layer = {
  key: 'tommy-ruins-sky', fx: 0.012, fy: 0.02, top: -40, h: 680, base: SKY_LOW,
  paint: (g, w) => {
    g.fillStyle = SKY[0]; g.fillRect(0, -40, w, 60);
    bandedGradient(g, 0, 0, w, 480, SKY, 26);
    g.fillStyle = SKY_LOW; g.fillRect(0, 478, w, 162);
    // The first stars, thick up top and gone by halfway down (a few brighter ones crossed)
    const r = rng(41);
    for (let i = 0; i < 110; i++) {
      const x = Math.floor(r() * w), y = Math.floor(Math.pow(r(), 1.7) * 230) - 30, b = r();
      const a = Math.max(0, 1 - (y + 30) / 260) * (0.35 + b * 0.65);
      g.fillStyle = b > 0.7 ? `rgba(255, 246, 222, ${a.toFixed(2)})` : `rgba(214, 200, 255, ${(a * 0.8).toFixed(2)})`;
      g.fillRect(x, y, 1, 1);
      if (b > 0.94 && y < 120) { g.fillStyle = `rgba(255, 246, 222, ${(a * 0.45).toFixed(2)})`; g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x, y - 1, 1, 1); g.fillRect(x, y + 1, 1, 1); }
    }
    // The sun, low and half gone: rings of its light, then the disc banded hot to deep, sliced along the bottom
    steppedGlow(g, SUN_X, SUN_Y, 230, '#FF8A50', 0.26, 0, 7);
    steppedGlow(g, SUN_X, SUN_Y, 96, '#FFC07A', 0.4, 0.04, 5);
    const disc = ['#FFF6D8', '#FFEBB5', '#FFD98E', '#FFC274', '#FFAA60'];
    for (let dy = -24; dy < 24; dy += 2) {
      if (dy === 8 || dy === 14 || dy === 18 || dy === 21 || dy === 22) continue;
      const half = Math.round(Math.sqrt(Math.max(0, 24 * 24 - (dy + 1) * (dy + 1))) / 2) * 2;
      g.fillStyle = disc[Math.min(disc.length - 1, Math.floor((dy + 24) / 10))];
      g.fillRect(SUN_X - half, SUN_Y + dy, half * 2, 2);
    }
    // Streaks of cloud, lit from underneath by the sun that's gone below them: dark and violet up high, hotter lower
    paintClouds(g, w, 77, 118, 21, 13, k => [mix('#2A1C44', '#6E3058', k), mix('#3A2350', '#A84A62', k), mix('#8A466E', '#F28A5C', k), mix('#B0648A', '#FFD49A', k)]);
    // The smog: a brown haze thickening down to the town, and a darker streak of it laid along
    hazeBands(g, 0, 330, w, 150, '#B06A4C', 0, 0.42, 7);
    checker(g, 0, 392, w, 4, 'rgba(110, 56, 62, 0.35)');
    g.fillStyle = 'rgba(110, 56, 62, 0.18)'; g.fillRect(0, 394, w, 1);
  },
};

// ---------------------------------------------------------------------------
// Downtown, far off: a few towers (the old Mott tower, the bank's, the hotel), a steeple, a lot of low blocks
// ---------------------------------------------------------------------------

/** The colours the town far off's painted in (the ruins' dusk; the street's afternoon and its sunset). */
interface Pal { far: string; farD: string; farRim: string; farWin: string | null; low: string; pl: string; plD: string; plRim: string; plGlass: string; glassLit: string; smog: string; band: string; bandLit: string }
const DUSK: Pal = {
  far: '#4F3A63', farD: '#3F2F52', farRim: '#C27A7C', farWin: '#F8CC78', low: SKY_LOW,
  pl: '#3A2A47', plD: '#2D2139', plRim: '#A85E68', plGlass: '#4E3B58', glassLit: '#B8667A', smog: '#A86048', band: '#6A3A4E', bandLit: '#8E5866',
};
/** The palette the far layers are being painted in (set just before each is). */
let P: Pal = DUSK;
const FAR_BASE = 470;
/** Where the old tower's aircraft light is, in the layer. */
const MOTT_LIGHT = { x: 238, y: FAR_BASE - 132 };

const farBlock = (g: Ctx, x: number, w: number, h: number, seed: number, windows = true) => {
  const top = FAR_BASE - h;
  g.fillStyle = P.far; g.fillRect(x, top, w, h);
  // (lit along the edge that faces the sun, and along the roofline)
  g.fillStyle = P.farRim;
  if (x + w / 2 < SUN_X) g.fillRect(x + w - 1, top, 1, h); else g.fillRect(x, top, 1, h);
  g.fillStyle = mix(P.far, P.farRim, 0.45); g.fillRect(x, top, w, 1);
  if (!windows) return;
  for (let wy = top + 4; wy < FAR_BASE - 4; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) {
    const v = hash(seed * 31 + wx * 7.1 + wy * 3.7);
    g.fillStyle = v > 0.93 ? (P.farWin ?? P.farD) : P.farD;
    if (v > 0.93 || v < 0.55) g.fillRect(wx, wy, 1, 2);
  }
};

const farLayer = (pal: Pal, key: string, fx: number, fy: number, wrap?: number): Layer => ({
  key, fx, fy, top: 320, h: 170, base: mix(pal.farD, pal.low, 0.3), wrap,
  paint: (g, w) => {
    P = pal;
    const r = rng(5);
    // (low blocks all along, every height a little different, the odd one with a tank on its roof)
    for (let x = 0; x < w; ) {
      const bw = 14 + Math.floor(r() * 26), bh = 10 + Math.floor(r() * 22);
      farBlock(g, x, bw, bh, x);
      if (r() < 0.25) { g.fillStyle = P.far; g.fillRect(x + 4, FAR_BASE - bh - 7, 6, 5); g.fillRect(x + 4, FAR_BASE - bh - 2, 1, 2); g.fillRect(x + 9, FAR_BASE - bh - 2, 1, 2); g.fillStyle = P.farRim; g.fillRect(x + 4, FAR_BASE - bh - 8, 6, 1); }
      x += bw + (r() < 0.3 ? 2 : 0);
    }
    // The hotel: wide, an H of a place, its sign's frame on the roof
    farBlock(g, 130, 66, 58, 1);
    g.fillStyle = P.far; g.fillRect(126, FAR_BASE - 62, 12, 62); g.fillRect(188, FAR_BASE - 62, 12, 62);
    g.fillStyle = P.farRim; g.fillRect(126, FAR_BASE - 62, 12, 1); g.fillRect(199, FAR_BASE - 62, 1, 62);
    for (let x = 142; x < 184; x += 4) { g.fillStyle = P.farD; g.fillRect(x, FAR_BASE - 68, 1, 10); }
    g.fillStyle = P.farD; g.fillRect(140, FAR_BASE - 69, 46, 2);
    // The old tower: a shaft in piers, set back near the top under a cornice, a mast on top (its light's live)
    const mx = 220, mw = 36, mh = 118;
    farBlock(g, mx, mw, mh - 12, 2, false);
    g.fillStyle = P.farD; for (let x = mx + 3; x < mx + mw - 2; x += 4) g.fillRect(x, FAR_BASE - mh + 16, 2, mh - 22);
    for (let wy = FAR_BASE - mh + 18; wy < FAR_BASE - 6; wy += 5) for (let x = mx + 3; x < mx + mw - 2; x += 4) if (hash(wy * 3 + x) > 0.9) { g.fillStyle = (P.farWin ?? P.farD); g.fillRect(x, wy, 2, 2); }
    g.fillStyle = P.far; g.fillRect(mx - 2, FAR_BASE - mh + 10, mw + 4, 3); g.fillRect(mx + 5, FAR_BASE - mh, mw - 10, 10); g.fillRect(mx + 10, FAR_BASE - mh - 5, mw - 20, 5);
    g.fillStyle = P.farRim; g.fillRect(mx - 2, FAR_BASE - mh + 10, mw + 4, 1); g.fillRect(mx + 5, FAR_BASE - mh, mw - 10, 1); g.fillRect(mx + 10, FAR_BASE - mh - 5, mw - 20, 1); g.fillRect(mx + mw - 6, FAR_BASE - mh, 1, 10);
    g.fillStyle = P.far; g.fillRect(MOTT_LIGHT.x - 1, MOTT_LIGHT.y + 2, 2, FAR_BASE - mh - 5 - MOTT_LIGHT.y - 2);
    // The bank's tower: a plain box in bands of window, a penthouse on top
    const bx = 282, bw = 30, bh = 94;
    g.fillStyle = P.far; g.fillRect(bx, FAR_BASE - bh, bw, bh); g.fillRect(bx + 8, FAR_BASE - bh - 6, 12, 6);
    for (let wy = FAR_BASE - bh + 4; wy < FAR_BASE - 3; wy += 3) { g.fillStyle = P.farD; g.fillRect(bx + 2, wy, bw - 4, 1); for (let x = bx + 2; x < bx + bw - 3; x += 3) if (hash(x * 13 + wy) > 0.94) { g.fillStyle = (P.farWin ?? P.farD); g.fillRect(x, wy, 3, 1); } }
    g.fillStyle = P.farRim; g.fillRect(bx + bw - 1, FAR_BASE - bh, 1, bh); g.fillRect(bx, FAR_BASE - bh, bw, 1); g.fillRect(bx + 8, FAR_BASE - bh - 6, 12, 1);
    // A steeple, and a couple more mid-rises either side
    g.fillStyle = P.far; g.fillRect(386, FAR_BASE - 26, 26, 26); g.fillRect(392, FAR_BASE - 58, 9, 32);
    for (let i = 0; i < 26; i++) { const half = Math.floor((i / 26) * 5); g.fillRect(396 - half, FAR_BASE - 84 + i, half * 2 + 1, 1); }
    g.fillStyle = P.farRim; g.fillRect(400, FAR_BASE - 58, 1, 32); for (let i = 0; i < 26; i += 2) g.fillRect(396 + Math.floor((i / 26) * 5), FAR_BASE - 84 + i, 1, 1);
    g.fillStyle = (P.farWin ?? P.farD); g.fillRect(395, FAR_BASE - 50, 3, 4);
    farBlock(g, 334, 26, 66, 3); farBlock(g, 98, 22, 48, 4); farBlock(g, 470, 30, 52, 5); farBlock(g, 760, 24, 58, 6);
    // (trees in the gaps along the bottom, in clumps)
    for (let x = 0; x < w; x += 9) if (hash(x * 1.7) > 0.45) pixelBlob(g, x, FAR_BASE - 3, 6 + hash(x) * 6, 4 + hash(x * 3) * 4, P.farD);
    // (the air: the bottoms of it all fading into the glow)
    hazeBands(g, 0, FAR_BASE - 44, w, 44, P.low, 0, 0.42, 6);
    g.fillStyle = mix(P.farD, P.low, 0.3); g.fillRect(0, FAR_BASE, w, 20);
  },
});
const far = farLayer(DUSK, 'tommy-ruins-far', 0.035, 0.03);

// ---------------------------------------------------------------------------
// The plants: shut down (sawtooth sheds, stacks, a conveyor up to a tower, silos), PLANT 4 still on the wall
// ---------------------------------------------------------------------------

const PL_BASE = 490;
const STACKS = [{ x: 64, w: 10, h: 168 }, { x: 82, w: 8, h: 146 }, { x: 624, w: 11, h: 160 }];
/** The stack whose light blinks, and the one that's still smoking. */
const BLINK_STACK = STACKS[0], SMOKE_STACK = STACKS[2];

const shed = (g: Ctx, x: number, w: number, h: number, seed: number) => {
  const top = PL_BASE - h;
  g.fillStyle = P.pl; g.fillRect(x, top, w, h);
  // (the sawtooth roof: each tooth's steep face to the left, its slope lit where it catches the glow)
  for (let tx = x; tx + 12 <= x + w; tx += 12) {
    for (let i = 0; i < 12; i++) { const th = Math.round(9 * (1 - i / 12)); g.fillStyle = P.pl; g.fillRect(tx + i, top - th, 1, th); g.fillStyle = i % 2 ? P.plRim : mix(P.pl, P.plRim, 0.5); g.fillRect(tx + i, top - th, 1, 1); }
    g.fillStyle = P.plGlass; g.fillRect(tx, top - 8, 1, 8);
  }
  // (a band of glass along the top of the wall, its panes dark, the odd one broken out or catching the sky)
  g.fillStyle = P.plGlass; g.fillRect(x + 2, top + 3, w - 4, 5);
  for (let px = x + 2; px < x + w - 2; px += 3) {
    const v = hash(seed * 17 + px);
    g.fillStyle = v > 0.88 ? P.glassLit : v > 0.76 ? '#1C1426' : P.plD; g.fillRect(px, top + 3, 2, 2);
    if (v < 0.5) { g.fillStyle = P.plD; g.fillRect(px, top + 6, 2, 2); }
  }
  // (the siding: ribs down it)
  g.fillStyle = P.plD; for (let px = x + 1; px < x + w; px += 3) g.fillRect(px, top + 10, 1, h - 10);
  g.fillStyle = P.plRim; if (x + w / 2 < SUN_X) g.fillRect(x + w - 1, top, 1, h); else g.fillRect(x, top, 1, h);
};

const stack = (g: Ctx, s: { x: number; w: number; h: number }) => {
  const top = PL_BASE - s.h;
  g.fillStyle = P.pl; g.fillRect(s.x, top, s.w, s.h);
  g.fillStyle = P.plD; g.fillRect(s.x + s.w - 3, top, 3, s.h); checker(g, s.x + s.w - 5, top, 2, s.h, P.plD);
  g.fillStyle = P.plRim; g.fillRect(s.x, top, 1, s.h);
  // (its two faded bands, its cap, the ladder up it)
  for (const by of [top + 10, top + 22]) { g.fillStyle = P.band; g.fillRect(s.x, by, s.w, 5); g.fillStyle = P.bandLit; g.fillRect(s.x, by, 2, 5); }
  g.fillStyle = P.plD; g.fillRect(s.x - 1, top - 2, s.w + 2, 3); g.fillStyle = P.plRim; g.fillRect(s.x - 1, top - 2, s.w + 2, 1);
  g.fillStyle = P.plD; for (let y = top + 30; y < PL_BASE; y += 3) g.fillRect(s.x + 2, y, 2, 1);
};

const plantsLayer = (pal: Pal, key: string, fx: number, fy: number, wrap?: number): Layer => ({
  key, fx, fy, top: 300, h: 210, base: pal.plD, wrap,
  paint: (g, w) => {
    P = pal;
    for (const s of STACKS) stack(g, s);
    // The sheds, long and low, end to end down the river
    const sheds: [number, number, number][] = [[0, 150, 34], [150, 108, 44], [290, 180, 30], [470, 96, 40], [600, 170, 36], [770, 130, 28], [900, 120, 42]];
    sheds.forEach(([x, sw, h], i) => { if (x < w) shed(g, x, sw, h, i + 1); });
    // PLANT 4, painted big down the side of one of them, gone pale
    pixText(g, 'PLANT 4', 168, PL_BASE - 28, 2, mix(P.pl, '#D8B0A8', 0.22));
    // The conveyor: a truss going up from the sheds to a tower on legs, braced
    const tx = 540, ty = PL_BASE - 92;
    g.fillStyle = P.pl; g.fillRect(tx, ty, 18, 14); g.fillStyle = P.plRim; g.fillRect(tx, ty, 18, 1); g.fillRect(tx + 17, ty, 1, 14);
    for (const lx of [tx + 1, tx + 15]) { g.fillStyle = P.pl; g.fillRect(lx, ty + 14, 2, PL_BASE - ty - 54); }
    for (let y = ty + 16; y < PL_BASE - 44; y += 10) { line(g, tx + 1, y, tx + 16, y + 10, P.pl); line(g, tx + 16, y, tx + 1, y + 10, P.pl); }
    for (const dy of [0, 6]) line(g, 430, PL_BASE - 30 + dy, tx, ty + 4 + dy, P.pl);
    for (let i = 0; i <= 11; i++) { const x0 = 430 + i * 10, y0 = PL_BASE - 30 - Math.round(i * 10 * (PL_BASE - 30 - ty - 4) / (tx - 430)); line(g, x0, y0, x0 + 5, y0 + 2, P.pl); }
    line(g, 430, PL_BASE - 31, tx, ty + 3, P.plRim);
    // Two silos, domed, banded down their round sides
    for (const sx of [700, 726]) {
      const top = PL_BASE - 58;
      g.fillStyle = P.pl; g.fillRect(sx, top, 22, 58);
      for (let i = 0; i < 6; i++) { const half = Math.round(Math.sqrt(36 - (6 - i) * (6 - i)) * 11 / 6); g.fillRect(sx + 11 - half, top - 6 + i, half * 2, 1); }
      g.fillStyle = P.plRim; g.fillRect(sx + 2, top - 3, 6, 1); g.fillRect(sx + 1, top, 1, 58);
      g.fillStyle = P.plD; g.fillRect(sx + 14, top, 8, 58); checker(g, sx + 10, top, 4, 58, P.plD);
      g.fillStyle = mix(P.pl, P.plD, 0.5); for (let y = top + 8; y < PL_BASE; y += 9) g.fillRect(sx, y, 22, 1);
    }
    // (the yard's fence along the bottom, its posts; scrub in front)
    g.fillStyle = P.plD; g.fillRect(0, PL_BASE - 6, w, 1); for (let x = 0; x < w; x += 6) g.fillRect(x, PL_BASE - 7, 1, 7);
    checker(g, 0, PL_BASE - 5, w, 5, 'rgba(45, 33, 57, 0.6)');
    // (smog sitting low in the yards)
    hazeBands(g, 0, PL_BASE - 40, w, 40, P.smog, 0, 0.3, 5);
    g.fillStyle = P.plD; g.fillRect(0, PL_BASE, w, 20);
  },
});
const plants = plantsLayer(DUSK, 'tommy-ruins-plants', 0.07, 0.05);

// ---------------------------------------------------------------------------
// The river (rust-brown, scum along its banks), the bridge over it with the VEHICLE CITY arch
// ---------------------------------------------------------------------------

const RV_TOP = 492, RV_BOT = 506, BANK = '#2A1F33', BANK_NEAR = '#231A2B';
const ARCH = { x: 470, w: 74, top: 446 };
const ARCH_TEXT = 'VEHICLE CITY';
/** Where the letters start (the layer's x), how big their cells are, and which ones are out (the H) and on the blink (the T). */
const ARCH_PX = 1, ARCH_TX = ARCH.x + Math.round((ARCH.w - textW(ARCH_TEXT, ARCH_PX)) / 2), ARCH_TY = ARCH.top + 9;
const ARCH_DEAD = 2, ARCH_BLINK = 10;
const BULB = '#FFD98A', BULB_OFF = '#4A3850';
/** Where the police car's light is, on the road along the far bank. */
const COP = { x: 820, y: RV_TOP - 3 };

const river: Layer = {
  key: 'tommy-ruins-river', fx: 0.11, fy: 0.08, top: 436, h: 90, base: BANK_NEAR,
  paint: (g, w) => {
    // The far bank: a strip of scrub and a road along it
    g.fillStyle = BANK; g.fillRect(0, RV_TOP - 5, w, 6);
    for (let x = 0; x < w; x += 2) { const h = Math.floor(hash(x * 0.37) * 4); g.fillRect(x, RV_TOP - 5 - h, 2, h); }
    g.fillStyle = mix(BANK, '#A86048', 0.25); g.fillRect(0, RV_TOP - 3, w, 1);
    // The water: rust-brown, streaked where it catches the sky, scummed green at the edges
    bandedGradient(g, 0, RV_TOP, w, RV_BOT - RV_TOP, ['#7E5638', '#8E6036', '#6A462E'], 4);
    const r = rng(9);
    for (let i = 0; i < 160; i++) { const x = Math.floor(r() * w), y = RV_TOP + 1 + Math.floor(r() * (RV_BOT - RV_TOP - 2)), l = 3 + Math.floor(r() * 10); g.fillStyle = r() > 0.5 ? '#9A6A3C' : '#4E3226'; g.fillRect(x, y, l, 1); }
    checker(g, 0, RV_TOP, w, 2, '#6E7434'); checker(g, 0, RV_BOT - 2, w, 2, '#5E6430', 1);
    // The near bank
    g.fillStyle = BANK_NEAR; g.fillRect(0, RV_BOT, w, 526 - RV_BOT);
    checker(g, 0, RV_BOT - 1, w, 1, BANK_NEAR);
    for (let x = 0; x < w; x += 3) if (hash(x * 2.3) > 0.55) { g.fillStyle = BANK_NEAR; g.fillRect(x, RV_BOT - 2 - Math.floor(hash(x) * 4), 1, 4); }
    // The bridge: its deck on piers, a rail, a lamp at each end; the arch over the middle of it, VEHICLE CITY in bulbs
    const bx0 = ARCH.x - 70, bx1 = ARCH.x + ARCH.w + 70, deck = RV_TOP - 6;
    for (const px of [bx0 + 30, ARCH.x + 10, ARCH.x + ARCH.w - 14, bx1 - 34]) { g.fillStyle = BANK; g.fillRect(px, deck + 3, 5, RV_BOT - deck - 3); g.fillStyle = '#3A2A3C'; g.fillRect(px, RV_BOT - 1, 5, 2); }
    g.fillStyle = BANK; g.fillRect(bx0, deck, bx1 - bx0, 4); g.fillStyle = mix(BANK, '#A86048', 0.3); g.fillRect(bx0, deck + 3, bx1 - bx0, 1);
    g.fillStyle = BANK; g.fillRect(bx0, deck - 4, bx1 - bx0, 1); for (let x = bx0; x < bx1; x += 4) g.fillRect(x, deck - 4, 1, 4);
    for (const lx of [bx0 + 6, bx1 - 8]) { g.fillStyle = BANK; g.fillRect(lx, deck - 16, 1, 16); g.fillRect(lx - 1, deck - 17, 3, 2); g.fillStyle = '#F2B66A'; g.fillRect(lx, deck - 16, 1, 1); }
    // (its reflection under it, broken by the ripples)
    for (let x = bx0; x < bx1; x += 2) if (hash(x) > 0.35) { g.fillStyle = 'rgba(30, 20, 34, 0.5)'; g.fillRect(x, RV_TOP + 1 + (x % 4 ? 0 : 1), 2, 1); }
    // The arch: two posts, the curve between them in a lattice, the bulbs strung under it
    const ax0 = ARCH.x, ax1 = ARCH.x + ARCH.w;
    for (const px of [ax0, ax1 - 3]) { g.fillStyle = BANK; g.fillRect(px, ARCH.top + 4, 3, deck - ARCH.top - 4); g.fillStyle = '#6A4A5C'; g.fillRect(px, ARCH.top + 4, 1, deck - ARCH.top - 4); }
    const archY = (x: number) => ARCH.top + Math.round(Math.pow((x - (ax0 + ax1) / 2) / (ARCH.w / 2), 2) * 6);
    for (let x = ax0; x < ax1; x++) { const y = archY(x); g.fillStyle = BANK; g.fillRect(x, y, 1, 7); g.fillStyle = '#6A4A5C'; g.fillRect(x, y, 1, 1); if (x % 4 === 0) { g.fillStyle = mix(SKY_LOW, BANK, 0.55); g.fillRect(x + 1, y + 2, 2, 3); } }
    steppedGlow(g, (ax0 + ax1) / 2, ARCH_TY + 2, 44, '#FFC27A', 0.16, 0, 4);
    pixText(g, ARCH_TEXT, ARCH_TX, ARCH_TY, ARCH_PX, i => i === ARCH_DEAD || i === ARCH_BLINK ? BULB_OFF : BULB);
  },
};

// ---------------------------------------------------------------------------
// The street nearest: houses (boarded up, one burned out), a lot gone to weeds, a billboard, poles and their wires
// ---------------------------------------------------------------------------

const NR_BASE = 558, NR_GROUND = '#1F1826';
const WALLS = ['#4A3A4C', '#56414A', '#403A50', '#4E4440', '#4A3846', '#3E4048'];
const ROOF = '#2A2031', NR_RIM = '#7E5262', NR_WIN = '#1C1524', BOARD = '#5E4A44', LIT = '#E8B064';
const POLES = [40, 250, 470, 700, 930, 1150];
/** The streetlight's lamp (on the second pole): it's on the blink. */
const LAMP = { x: POLES[1] + 13, y: NR_BASE - 78 };

const window_ = (g: Ctx, x: number, y: number, w: number, h: number, kind: number) => {
  g.fillStyle = '#6A5260'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  if (kind < 0.45) { // (boarded: plywood, nailed)
    g.fillStyle = BOARD; g.fillRect(x, y, w, h); g.fillStyle = '#4A3A38'; g.fillRect(x, y + Math.floor(h / 2), w, 1);
    g.fillStyle = '#2A2028'; g.fillRect(x, y, 1, 1); g.fillRect(x + w - 1, y + h - 1, 1, 1);
  } else if (kind > 0.95) { g.fillStyle = LIT; g.fillRect(x, y, w, h); g.fillStyle = '#B07848'; g.fillRect(x + Math.floor(w / 2), y, 1, h); }
  else { g.fillStyle = NR_WIN; g.fillRect(x, y, w, h); g.fillStyle = '#3A2C40'; g.fillRect(x, y, w, 1); if (kind > 0.8) { line(g, x, y + 1, x + w - 1, y + h - 1, '#5A4656'); } } // (dark; the odd one cracked)
};

/** A house, x its left, `kind` which sort; `seed` picks its colour and windows. */
const house = (g: Ctx, x: number, kind: 'gable' | 'side' | 'square' | 'burned', seed: number) => {
  const wall = WALLS[seed % WALLS.length], wd = mix(wall, ROOF, 0.4);
  const v = (n: number) => hash(seed * 13.7 + n);
  const siding = (x0: number, y0: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x0, y0, w, h); g.fillStyle = mix(c, ROOF, 0.25); for (let y = y0 + 2; y < y0 + h; y += 3) g.fillRect(x0, y, w, 1); };
  if (kind === 'gable' || kind === 'burned') {
    const w = 46, wh = 34, rh = 22, top = NR_BASE - wh;
    const burned = kind === 'burned';
    siding(x, top, w, wh, burned ? '#2A2028' : wall);
    if (burned) {
      // (charred black up from the windows, the roof fallen in: just the odd rafter left against the sky)
      for (const [sx, sw] of [[x + 6, 10], [x + 28, 10]]) { g.fillStyle = '#16111A'; g.fillRect(sx, top + 8, sw, 12); checker(g, sx - 2, top + 2, sw + 4, 6, '#16111A'); }
      g.clearRect(x + 8, top + 10, 6, 8); g.clearRect(x + 30, top + 10, 6, 8);
      g.fillStyle = '#16111A'; g.fillRect(x + 18, top + 14, 9, wh - 14);
      for (let i = 0; i < 5; i++) { const rx = x + 2 + i * 10; if (i === 2) continue; line(g, rx, top, Math.min(x + w / 2, rx + 10), top - Math.min(rh, 6 + v(i) * rh), '#1E1620'); }
      line(g, x - 1, top, x + 14, top - 10, '#1E1620'); line(g, x + w, top, x + w - 8, top - 6, '#1E1620');
      g.fillStyle = '#1E1620'; g.fillRect(x, top - 1, w, 2); for (let i = 0; i < w; i += 3) if (v(i + 9) > 0.5) g.fillRect(x + i, top - 3, 2, 2);
      return;
    }
    // (the gable: the roof's two slopes, shingled, lit along the edges)
    for (let i = 0; i <= rh; i++) { const half = Math.round((i / rh) * (w / 2 + 4)); g.fillStyle = ROOF; g.fillRect(x + w / 2 - half, top - rh + i, half * 2, 1); }
    g.fillStyle = wd; for (let i = 6; i <= rh; i++) { const half = Math.round(((i - 6) / rh) * (w / 2 - 2)); g.fillRect(x + w / 2 - half, top - rh + i, half * 2, 1); } // (the gable end, in the wall's shade)
    for (let i = 0; i <= rh; i += 2) { const half = Math.round((i / rh) * (w / 2 + 4)); g.fillStyle = NR_RIM; g.fillRect(x + w / 2 - half, top - rh + i, 1, 1); g.fillStyle = mix(NR_RIM, ROOF, 0.5); g.fillRect(x + w / 2 + half - 1, top - rh + i, 1, 1); }
    window_(g, x + w / 2 - 3, top - 10, 6, 6, v(1));
    window_(g, x + 6, top + 8, 9, 12, v(2)); window_(g, x + w - 15, top + 8, 9, 12, v(3));
    // (the porch: its roof on posts across the front, the door in the shade under it)
    g.fillStyle = ROOF; g.fillRect(x - 2, top + 22, w + 4, 3); g.fillStyle = NR_RIM; g.fillRect(x - 2, top + 22, w + 4, 1);
    g.fillStyle = mix(ROOF, wall, 0.3); for (const px of [x, x + w / 2 - 1, x + w - 2]) g.fillRect(px, top + 25, 2, wh - 25);
  } else if (kind === 'side') {
    const w = 64, wh = 28, rh = 14, top = NR_BASE - wh;
    siding(x, top, w, wh, wall);
    g.fillStyle = ROOF; for (let i = 0; i <= rh; i++) { const inset = Math.round((1 - i / rh) * 14); g.fillRect(x - 3 + inset, top - rh + i, w + 6 - inset * 2, 1); }
    g.fillStyle = NR_RIM; g.fillRect(x + 11, top - rh, w - 22, 1); for (let i = 0; i < rh; i += 2) g.fillRect(x - 3 + Math.round((1 - i / rh) * 14), top - rh + i, 1, 1);
    // (a dormer, a chimney)
    g.fillStyle = wd; g.fillRect(x + 24, top - rh - 4, 14, 10); g.fillStyle = ROOF; g.fillRect(x + 22, top - rh - 6, 18, 3); g.fillStyle = NR_RIM; g.fillRect(x + 22, top - rh - 6, 18, 1);
    window_(g, x + 28, top - rh - 2, 6, 6, v(4));
    g.fillStyle = '#3A2A30'; g.fillRect(x + w - 16, top - rh - 8, 6, 12); g.fillStyle = NR_RIM; g.fillRect(x + w - 16, top - rh - 8, 6, 1);
    for (const [i, wx] of [[5, x + 6], [6, x + 20], [7, x + 42], [8, x + 52]] as [number, number][]) window_(g, wx, top + 8, 8, 11, v(i));
  } else {
    // (a foursquare: two floors under a hipped roof, a porch roof all along the front)
    const w = 50, wh = 50, rh = 12, top = NR_BASE - wh;
    siding(x, top, w, wh, wall);
    g.fillStyle = ROOF; for (let i = 0; i <= rh; i++) { const inset = Math.round((1 - i / rh) * 18); g.fillRect(x - 3 + inset, top - rh + i, w + 6 - inset * 2, 1); }
    g.fillStyle = NR_RIM; g.fillRect(x + 15, top - rh, w - 30, 1);
    window_(g, x + 7, top + 6, 9, 12, v(10)); window_(g, x + w - 16, top + 6, 9, 12, v(11));
    g.fillStyle = ROOF; g.fillRect(x - 3, top + 24, w + 6, 4); g.fillStyle = NR_RIM; g.fillRect(x - 3, top + 24, w + 6, 1);
    window_(g, x + 6, top + 32, 10, 12, v(12));
    // (the door boarded, the fire department's X sprayed on it: nobody's coming back)
    g.fillStyle = BOARD; g.fillRect(x + w - 18, top + 31, 10, wh - 31);
    line(g, x + w - 17, top + 33, x + w - 10, top + 42, '#C2602E'); line(g, x + w - 10, top + 33, x + w - 17, top + 42, '#C2602E');
  }
};

/** A bare tree, its branches forking up (in silhouette). */
const tree = (g: Ctx, x: number, h: number, seed: number) => {
  const c = '#2A2030';
  g.fillStyle = c; g.fillRect(x - 1, NR_BASE - h * 0.45, 3, h * 0.45);
  const branch = (bx: number, by: number, a: number, len: number, d: number) => {
    const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
    line(g, Math.round(bx), Math.round(by), Math.round(ex), Math.round(ey), c);
    if (d > 0) for (const s of [-1, 1]) branch(ex, ey, a + s * (0.35 + hash(seed + d * 3 + s) * 0.3), len * 0.68, d - 1);
  };
  branch(x, NR_BASE - h * 0.45, -Math.PI / 2, h * 0.3, 4);
};

/** Weeds, up past the knees, in tufts. */
const weeds = (g: Ctx, x: number, w: number, seed: number) => {
  for (let i = 0; i < w; i += 2) {
    const h = 3 + Math.floor(hash(seed + i * 0.7) * 9);
    g.fillStyle = hash(seed + i) > 0.5 ? '#36402F' : '#2C3428'; g.fillRect(x + i, NR_BASE - h, 1, h);
    if (h > 8) { g.fillStyle = '#525C3C'; g.fillRect(x + i, NR_BASE - h, 1, 1); }
  }
};

/** The billboard: CLEAN WATER COMING SOON!, a glass of the stuff the colour it actually comes out, the dates on it crossed out one after another. */
const billboard = (g: Ctx, x: number) => {
  const bw = 132, bh = 40, top = 432;
  g.fillStyle = '#2A2030'; for (const px of [x + 22, x + bw - 26]) g.fillRect(px, top + bh, 4, NR_BASE - top - bh);
  for (let y = top + bh + 8; y < NR_BASE - 8; y += 14) line(g, x + 24, y, x + bw - 24, y + 10, '#2A2030');
  g.fillStyle = '#2A2030'; g.fillRect(x - 2, top - 2, bw + 4, bh + 4); g.fillRect(x - 2, top + bh + 2, bw + 4, 2);
  // (the paper: faded, peeling here and there to the last one under it)
  bandedGradient(g, x, top, bw, bh, ['#8C7E82', '#82747A', '#766870'], 3);
  for (const [px, py, pw, ph] of [[x + 96, top + 2, 14, 6], [x + 4, top + 30, 10, 8], [x + 120, top + 24, 10, 12]]) checker(g, px, py, pw, ph, '#5E5060');
  g.fillStyle = '#B0A2A0'; g.fillRect(x + bw - 9, top, 9, 1); line(g, x + bw - 9, top, x + bw - 1, top + 8, '#B0A2A0');
  // (the glass of water, brown)
  g.fillStyle = '#5A4C5A'; g.fillRect(x + 7, top + 6, 1, 26); g.fillRect(x + 22, top + 6, 1, 26); g.fillRect(x + 8, top + 31, 14, 1);
  g.fillStyle = '#8A5A30'; g.fillRect(x + 8, top + 12, 14, 19); g.fillStyle = '#A8723E'; g.fillRect(x + 8, top + 12, 14, 1); g.fillStyle = '#6E4626'; g.fillRect(x + 18, top + 13, 4, 18);
  g.fillStyle = '#C8C0B8'; g.fillRect(x + 10, top + 14, 1, 12);
  pixText(g, 'CLEAN WATER', x + 28, top + 5, 1.5, '#2E3658');
  pixText(g, 'COMING SOON!', x + 28, top + 16, 1.5, '#7A2830');
  let dx = x + 28;
  for (const yr of ['2016', '2017', '2019']) { pixText(g, yr, dx, top + 30, 1, '#3E3448'); g.fillStyle = '#9A2A2A'; g.fillRect(dx - 1, top + 32, textW(yr, 1) + 2, 1); dx += textW(yr, 1) + 6; }
  pixText(g, '20', dx, top + 30, 1, '#3E3448');
  // (a lamp on the catwalk, the only one still working, its light up the left of it)
  steppedGlow(g, x + 30, top + bh, 40, '#FFC27A', 0.14, 0, 4);
  g.fillStyle = '#2A2030'; g.fillRect(x + 28, top + bh + 2, 5, 3); g.fillStyle = LIT; g.fillRect(x + 29, top + bh + 2, 3, 1);
};

/** FOR SALE, on a post out front (and has been for years). */
const forSale = (g: Ctx, x: number) => {
  g.fillStyle = '#2A2030'; g.fillRect(x + 15, NR_BASE - 16, 2, 16);
  g.fillStyle = '#2A2030'; g.fillRect(x - 1, NR_BASE - 26, 34, 11);
  g.fillStyle = '#A8988A'; g.fillRect(x, NR_BASE - 25, 32, 9);
  pixText(g, 'FOR SALE', x + 1, NR_BASE - 23, 1, '#8A2A2A');
};

const near: Layer = {
  key: 'tommy-ruins-near', fx: 0.2, fy: 0.12, top: 420, h: 150, base: NR_GROUND,
  paint: (g, w) => {
    // (what's on the street, lot by lot)
    house(g, 0, 'side', 1);
    weeds(g, 66, 40, 3); tree(g, 90, 70, 2);
    house(g, 112, 'gable', 2); forSale(g, 150);
    house(g, 190, 'square', 3);
    house(g, 268, 'burned', 4);
    weeds(g, 316, 70, 5); tree(g, 340, 80, 7);
    billboard(g, 360);
    house(g, 510, 'gable', 5);
    house(g, 566, 'side', 6);
    weeds(g, 634, 50, 9);
    house(g, 690, 'square', 7);
    house(g, 750, 'gable', 8);
    tree(g, 812, 64, 11); weeds(g, 800, 40, 13);
    house(g, 846, 'burned', 9);
    house(g, 900, 'side', 10); forSale(g, 920);
    house(g, 976, 'gable', 11);
    weeds(g, 1028, 40, 15); tree(g, 1050, 72, 17);
    house(g, 1070, 'square', 12);
    house(g, 1128, 'gable', 13);
    // (the yards in front: chain-link sagging, weeds coming up through it)
    g.fillStyle = '#3A3444'; g.fillRect(0, NR_BASE - 9, w, 1); for (let x = 0; x < w; x += 12) g.fillRect(x, NR_BASE - 10, 1, 10);
    checker(g, 0, NR_BASE - 8, w, 8, 'rgba(58, 52, 68, 0.35)');
    weeds(g, 0, w, 21);
    // The poles, and the wires sagging from one to the next
    for (const px of POLES) {
      g.fillStyle = '#2A2030'; g.fillRect(px, NR_BASE - 84, 3, 84); g.fillStyle = '#4A3A48'; g.fillRect(px, NR_BASE - 84, 1, 84);
      g.fillStyle = '#2A2030'; g.fillRect(px - 8, NR_BASE - 80, 19, 2);
      g.fillStyle = '#6E8A88'; for (const ix of [px - 7, px + 1, px + 9]) g.fillRect(ix, NR_BASE - 82, 1, 2);
    }
    for (let i = 0; i + 1 < POLES.length; i++) for (const [o, s] of [[-7, 9], [1, 11], [9, 10]]) wire(g, POLES[i] + o, NR_BASE - 82, POLES[i + 1] + o, NR_BASE - 82, s, '#1E1826');
    // (the streetlight's arm and head; its light's live)
    g.fillStyle = '#2A2030'; g.fillRect(POLES[1] + 3, LAMP.y - 3, 10, 2); g.fillRect(LAMP.x - 2, LAMP.y - 2, 6, 2);
    g.fillStyle = NR_GROUND; g.fillRect(0, NR_BASE, w, 12);
  },
};

// ---------------------------------------------------------------------------
// It all, and what's live in it
// ---------------------------------------------------------------------------

/** Birds now and then: a few of them crossing high up, flapping (every so often, a while at a time). */
const birds = (ctx: Ctx, f: number) => {
  const T = 1500, t = f % T;
  if (t > 700) return;
  const k = Math.floor(f / T);
  const x0 = -40 + t * 1.25, y0 = 170 + hash(k) * 90;
  ctx.fillStyle = '#2A1E36';
  for (let i = 0; i < 4; i++) {
    const bx = Math.round(x0 - i * 14 - (i % 2) * 4), by = Math.round(y0 + (i % 2 ? 6 : 0) + i * 3 + Math.sin((f + i * 9) * 0.05) * 2);
    if ((f + i * 7) % 16 < 8) { ctx.fillRect(bx - 3, by - 1, 2, 1); ctx.fillRect(bx - 1, by, 2, 1); ctx.fillRect(bx + 1, by - 1, 2, 1); }
    else { ctx.fillRect(bx - 3, by, 7, 1); }
  }
};

/** A red aircraft light, blinking (on a third of the time), with a little ring of glow when it's on. */
const warnLight = (ctx: Ctx, x: number, y: number, f: number, phase: number) => {
  if ((f + phase) % 96 >= 34) { ctx.fillStyle = '#5A2030'; ctx.fillRect(x - 1, y - 1, 2, 2); return; }
  ctx.fillStyle = 'rgba(255, 70, 60, 0.22)'; ctx.fillRect(x - 3, y - 2, 6, 4); ctx.fillRect(x - 2, y - 3, 4, 6);
  ctx.fillStyle = '#FF5A48'; ctx.fillRect(x - 1, y - 1, 2, 2);
};

/** The one stack still going: smoke coming off it slowly, drifting off with the wind and thinning out (paler by day). */
const smoke = (ctx: Ctx, smx: number, smy: number, f: number, k: number) => {
  const c = mix('#C8C4CC', '#8A707A', k), [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  for (let i = 0; i < 7; i++) {
    const t = ((f * 0.25 + i * 40) % 280) / 280;
    pixelBlob(ctx, Math.round(smx + t * 70 + Math.sin(t * 6 + i) * 3), Math.round(smy - t * 46), 4 + t * 14, 3 + t * 7, `rgba(${r}, ${g}, ${b}, ${t < 0.4 ? 0.42 : t < 0.7 ? 0.28 : 0.15})`);
  }
};

/** The streetlight, on the blink: mostly on, cutting out in fits. */
const streetLamp = (ctx: Ctx, lx: number, ly: number, f: number) => {
  const fl = hash(Math.floor(f / 4)), on = !(Math.floor(f / 90) % 4 === 1 && fl > 0.4);
  if (on) {
    steppedGlow(ctx, lx + 1, ly + 1, 22, '#FFB86A', 0.22, 0, 3);
    ctx.fillStyle = '#FFE2A8'; ctx.fillRect(lx - 1, ly, 4, 1);
  } else { ctx.fillStyle = '#4A3A40'; ctx.fillRect(lx - 1, ly, 4, 1); }
};

/** The few stars bright enough to twinkle (the sky's own are painted in). */
const TWINKLE = [[70, 30], [204, 62], [355, 18], [498, 84], [690, 40], [770, 96]];

export const drawRuinsSky = (ctx: Ctx, state: GameState) => {
  const f = state.frame || 0;
  // (above the sky, should the camera ever get that high: more of the night)
  ctx.fillStyle = SKY[0]; ctx.fillRect(0, 0, W, H);
  const s = put(ctx, state, sky);
  TWINKLE.forEach(([x, y], i) => {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.03 + i * 1.7));
    ctx.fillStyle = `rgba(255, 246, 222, ${a.toFixed(2)})`; ctx.fillRect(x - s.ox, y + s.oy, 1, 1);
    if (a > 0.85) { ctx.fillStyle = `rgba(255, 246, 222, ${((a - 0.85) * 2.5).toFixed(2)})`; ctx.fillRect(x - s.ox - 1, y + s.oy, 3, 1); ctx.fillRect(x - s.ox, y + s.oy - 1, 1, 3); }
  });
  birds(ctx, f);
  const a = put(ctx, state, far);
  warnLight(ctx, MOTT_LIGHT.x - a.ox, MOTT_LIGHT.y + a.oy, f, 0);
  const p = put(ctx, state, plants);
  warnLight(ctx, BLINK_STACK.x + BLINK_STACK.w / 2 - p.ox, PL_BASE - BLINK_STACK.h - 4 + p.oy, f, 40);
  smoke(ctx, SMOKE_STACK.x + SMOKE_STACK.w / 2 - p.ox, PL_BASE - SMOKE_STACK.h - 3 + p.oy, f, 1);
  const r = put(ctx, state, river);
  // (the sun glinting off the water, straight down under it)
  for (let i = 0; i < 9; i++) {
    const h = hash(Math.floor(f / 10) * 9 + i);
    if (h < 0.3) continue;
    ctx.fillStyle = h > 0.8 ? '#FFD49A' : '#E8945A';
    ctx.fillRect(Math.round(SUN_X - s.ox - 24 + h * 48), RV_TOP + 2 + (i % 5) * 2 + r.oy, 2 + Math.floor(h * 5), 1);
  }
  // (the T on the arch on the blink: it's not had a new bulb in years)
  if (hash(Math.floor(f / 6)) > 0.35) pixText(ctx, 'T', ARCH_TX + textW(ARCH_TEXT.slice(0, ARCH_BLINK), ARCH_PX) + ARCH_PX - r.ox, ARCH_TY + r.oy, ARCH_PX, BULB);
  // (a police car stopped along the far bank, now and then, its lights going)
  const cop = f % 2400;
  if (cop < 520) {
    const cx = COP.x - r.ox, cy = COP.y + r.oy, red = (f >> 3) % 2 === 0;
    ctx.fillStyle = red ? 'rgba(255, 60, 60, 0.2)' : 'rgba(80, 120, 255, 0.2)'; ctx.fillRect(cx - 4, cy - 3, 10, 6);
    ctx.fillStyle = '#1E1626'; ctx.fillRect(cx - 3, cy, 8, 2);
    ctx.fillStyle = red ? '#FF5050' : '#2A1E3A'; ctx.fillRect(cx, cy - 1, 1, 1);
    ctx.fillStyle = red ? '#2A1E3A' : '#6A8CFF'; ctx.fillRect(cx + 1, cy - 1, 1, 1);
  }
  const n = put(ctx, state, near);
  streetLamp(ctx, LAMP.x - n.ox, LAMP.y + n.oy, f);
};

// ---------------------------------------------------------------------------
// The street at the start (the block, the road): the same town from the other side of it, earlier on, the sky going
// from the afternoon to the sunset down the length of the road
// ---------------------------------------------------------------------------

const DAY_SKY = ['#3E6FB0', '#4A7DBD', '#5689C6', '#6595CD', '#74A2D4', '#86AFD9', '#98BCDD', '#ABC7DE', '#BFD1DC', '#D2D8D4', '#E2DCC4', '#EEDAB0', '#F6D29A'];
const SET_SKY = ['#2A2050', '#3A2A5C', '#4E3062', '#663868', '#80406C', '#9A4A6C', '#B4546A', '#CA6266', '#DC7460', '#E8885A', '#F09C56', '#F5AE58', '#F8BE62'];
const DAY: Pal = {
  far: '#8A96B2', farD: '#7C88A6', farRim: '#D4DAE6', farWin: null, low: '#E6DCC0',
  pl: '#76809C', plD: '#687290', plRim: '#B8C2D4', plGlass: '#8A96B0', glassLit: '#DCE6F0', smog: '#C8BCA8', band: '#9A7A86', bandLit: '#B4949E',
};
const SUNSET: Pal = {
  far: '#5C4670', farD: '#4C3A60', farRim: '#E08C7C', farWin: '#F8CC78', low: '#F5AE58',
  pl: '#46344F', plD: '#3A2B44', plRim: '#C86E6A', plGlass: '#5A425E', glassLit: '#E8987A', smog: '#B87050', band: '#7A4252', bandLit: '#9A5E68',
};
const WRAP = 1024;
const ST_FAR = [farLayer(DAY, 'tommy-street-far-day', 0.035, 0.03, WRAP), farLayer(SUNSET, 'tommy-street-far-set', 0.035, 0.03, WRAP)];
const ST_PLANTS = [plantsLayer(DAY, 'tommy-street-plants-day', 0.07, 0.05, WRAP), plantsLayer(SUNSET, 'tommy-street-plants-set', 0.07, 0.05, WRAP)];
const cloudLayer = (key: string, tones: (k: number) => string[]): Layer => ({ key, fx: 0.02, fy: 0, top: 50, h: 290, base: '', wrap: WRAP, paint: (g, w) => paintClouds(g, w, 23, 70, 24, 10, tones) });
const ST_CLOUDS = [
  // (by day: white, lit along their tops, grey underneath)
  cloudLayer('tommy-street-clouds-day', () => ['#FFFFFF', '#EEF0F4', '#C8CEDC', '#B4BCCE']),
  // (at sunset: lit up from underneath, hotter the lower they are)
  cloudLayer('tommy-street-clouds-set', k => [mix('#5A3460', '#9A4A66', k), mix('#8A4468', '#D06866', k), mix('#E08068', '#FFB070', k), mix('#FFC08A', '#FFE2A8', k)]),
];
/** The river and the next street over, nearer still: the ruins' own, in the afternoon's light and the sunset's. */
const NEAR_WRAP = 1200;
const ST_RIVER = [{ ...river, key: 'tommy-street-river-day', wrap: WRAP, tint: ['#9AA6C0', 0.5] }, { ...river, key: 'tommy-street-river-set', wrap: WRAP, tint: ['#6A4A70', 0.15] }] as Layer[];
const ST_NEAR = [{ ...near, key: 'tommy-street-near-day', wrap: NEAR_WRAP, tint: ['#8A94AE', 0.45] }, { ...near, key: 'tommy-street-near-set', wrap: NEAR_WRAP, tint: ['#5A4468', 0.12] }] as Layer[];
/** Where along the road the layers are lined up from (downtown in view at the start, gone by in the middle, back by the end). */
const ANCHOR = [-300, -60, 200, 0];

/** A wrapping layer put down `ox` along, its top at `y`, see-through by `alpha`. */
const putWrap = (ctx: Ctx, l: Layer, ox: number, y: number, alpha = 1) => {
  const c = painted(l), w = l.wrap!;
  const sx0 = Math.round((((ox % w) + w) % w) * S) / S;
  ctx.globalAlpha = alpha;
  if (c) {
    const w1 = Math.min(W, w - sx0);
    ctx.drawImage(c, sx0 * S, 0, w1 * S, l.h * S, 0, y, w1, l.h);
    if (w1 < W) ctx.drawImage(c, 0, 0, (W - w1) * S, l.h * S, w1, y, W - w1, l.h);
  } else { ctx.save(); ctx.translate(-sx0, y - l.top); l.paint(ctx, w); ctx.restore(); }
  ctx.globalAlpha = 1;
};
/** Where a thing at x in a wrapping layer is on the screen, `ox` along (or null, off it). */
const onScreen = (x: number, ox: number, wrap = WRAP) => { let sx = (((x - ox) % wrap) + wrap) % wrap; if (sx > W + 40) sx -= wrap; return sx < -40 ? null : sx; };

const SKY_STEPS = new Map<number, string[]>();

/** The street's sky and the town behind it (the water tower standing over it all, while it still is). */
export const drawStreetBackdrop = (ctx: Ctx, state: GameState) => {
  const f = state.frame || 0, k = eveningAt(state.camera.x);
  const along = state.camera.x - COURSE.hood.x1;
  // The sky: its bands going over from the afternoon's to the sunset's (in small steps, each step's colours worked out
  // the once: the bands' dither is a pattern per colour, and those are kept)
  const step = Math.round(k * 48);
  let stops = SKY_STEPS.get(step);
  if (!stops) { stops = DAY_SKY.map((c, i) => mix(c, SET_SKY[i], step / 48)); SKY_STEPS.set(step, stops); }
  bandedGradient(ctx, 0, 0, W, 450, stops, 22);
  ctx.fillStyle = stops[stops.length - 1]; ctx.fillRect(0, 448, W, H - 448);
  // The sun, getting lower: its light round it in rings, the disc banded, sliced along the bottom once it's going down
  const sy = Math.round(250 + k * 170);
  steppedGlow(ctx, 640, sy, 130 + k * 90, mix('#FFE8B0', '#FF9A58', k), 0.3 + k * 0.05, 0, 6);
  steppedGlow(ctx, 640, sy, 60 + k * 30, mix('#FFF4D6', '#FFC07A', k), 0.4, 0.04, 4);
  const disc = ['#FFFFFF', '#FFF8E4', '#FFF0C8', mix('#FFE8B8', '#FFC274', k), mix('#FFE0A8', '#FFAA60', k)];
  for (let dy = -18; dy < 18; dy += 2) {
    if (k > 0.5 && (dy === 6 || dy === 12 || dy === 14)) continue;
    const half = Math.round(Math.sqrt(Math.max(0, 18 * 18 - (dy + 1) * (dy + 1))) / 2) * 2;
    ctx.fillStyle = disc[Math.min(disc.length - 1, Math.floor((dy + 18) / 8))];
    ctx.fillRect(640 - half, sy + dy, half * 2, 2);
  }
  // The clouds, drifting
  const cox = along * 0.02 + f * 0.03;
  putWrap(ctx, ST_CLOUDS[0], cox, ST_CLOUDS[0].top, 0.8 * (1 - k));
  if (k > 0.01) putWrap(ctx, ST_CLOUDS[1], cox, ST_CLOUDS[1].top, 0.85 * k);
  birds(ctx, f);
  // The town far off (down a little as the camera comes up, up a little as it goes down)
  const horizon = Math.round(420 - Math.max(-40, Math.min(40, state.camera.y * 0.08)));
  const fox = along * 0.035 + ANCHOR[0], fy = horizon - FAR_BASE;
  putWrap(ctx, ST_FAR[0], fox, ST_FAR[0].top + fy);
  if (k > 0.01) putWrap(ctx, ST_FAR[1], fox, ST_FAR[1].top + fy, k);
  const ml = onScreen(MOTT_LIGHT.x, fox);
  if (ml !== null) warnLight(ctx, ml, MOTT_LIGHT.y + fy, f, 0);
  // The plants, nearer
  const pox = along * 0.07 + ANCHOR[1], py = horizon + 20 - PL_BASE;
  putWrap(ctx, ST_PLANTS[0], pox, ST_PLANTS[0].top + py);
  if (k > 0.01) putWrap(ctx, ST_PLANTS[1], pox, ST_PLANTS[1].top + py, k);
  const bl = onScreen(BLINK_STACK.x + BLINK_STACK.w / 2, pox);
  if (bl !== null) warnLight(ctx, bl, PL_BASE - BLINK_STACK.h - 4 + py, f, 40);
  const sm = onScreen(SMOKE_STACK.x + SMOKE_STACK.w / 2, pox);
  if (sm !== null) smoke(ctx, sm, PL_BASE - SMOKE_STACK.h - 3 + py, f, k);
  // The river under them, and the next street over (a row of houses, poles, a billboard) between there and here
  const rox = along * 0.11 + ANCHOR[2];
  putWrap(ctx, ST_RIVER[0], rox, ST_RIVER[0].top + py);
  if (k > 0.01) putWrap(ctx, ST_RIVER[1], rox, ST_RIVER[1].top + py, k);
  const rb = ST_RIVER[0].top + py + ST_RIVER[0].h - 1;
  ctx.fillStyle = mix('#5E6478', BANK_NEAR, k); ctx.fillRect(0, rb, W, H - rb);
  const at = onScreen(ARCH_TX + textW(ARCH_TEXT.slice(0, ARCH_BLINK), ARCH_PX) + ARCH_PX, rox);
  if (at !== null && k > 0.3 && hash(Math.floor(f / 6)) > 0.35) pixText(ctx, 'T', at, ARCH_TY + py, ARCH_PX, BULB);
  const nox = along * 0.2 + ANCHOR[3], ny = horizon + 90 - NR_BASE;
  putWrap(ctx, ST_NEAR[0], nox, ST_NEAR[0].top + ny);
  if (k > 0.01) putWrap(ctx, ST_NEAR[1], nox, ST_NEAR[1].top + ny, k);
  const lamp = onScreen(LAMP.x, nox, NEAR_WRAP);
  if (lamp !== null && k > 0.4) streetLamp(ctx, lamp, LAMP.y + ny, f);
  const nb = ST_NEAR[0].top + ny + ST_NEAR[0].h - 1;
  if (nb < H) { ctx.fillStyle = mix('#5A5C70', NR_GROUND, k); ctx.fillRect(0, nb, W, H - nb); }
  // The water tower over it all
  const tx = 620 - along * 0.018;
  if (tx > -120 && tx < W + 120) drawWaterTower(ctx, tx, horizon + 20, 1, k);
};
