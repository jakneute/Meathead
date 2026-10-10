// The sun's glare (SNES-style: F-Zero, Top Gear): a stepped starburst of rays round the sun, a hollow halo ring (and,
// low in the sky, a flat streak along the horizon); and on the lens, ghosts (discs, hexagons, a ring) strung along the
// line from the sun through the middle of the screen. All flat translucent steps (no gradients, no filters), a handful
// of fills a frame, nothing allocated.
//
// By the hour (timeOfDay.ts): white-gold and strongest with the sun high, warmer and orange with longer rays and the
// ghosts strung further out toward golden hour and sunset, gone once it's down (and at night). Only while the sun's on
// screen (fading as it leaves).
//
// Two halves, for depth:
//   - the glare round the sun is the sun's own: it's drawn with the sky (noteSun, in the backdrop pass), so anything in
//     front of the sun (a mountain, a wall, the canopy) is in front of its glare too;
//   - the ghosts are on the lens, so they're over everything (drawNotedSunFlare, from the stage's drawHud: after the
//     world and its lighting, under everything else up top). They fade out while the sun's behind something solid (the
//     stage's blocks), and a scene that's only glimpsing the sun (the jungle's canopy) asks for none.
// Never in the main HUD's corner (HUD_CLEAR_X / HUD_CLEAR_Y). A scene that didn't note a sun this frame gets none
// (indoors, under water).

import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../m1/constants';
import { mix } from '../m1/game/render/backdrops/core';
import type { GameState } from '../m1/game/core/state';
import { timeOfDay, type TimeOfDay } from './timeOfDay';

type Ctx = CanvasRenderingContext2D;
type Box = { x: number; y: number; w: number; h: number };
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

// ---------------------------------------------------------------------------------------------------------------
// The scene's side

// (the one sun noted this frame: kept in one object, no allocating. `dx`, `dy`, `dr`: where it is on the canvas itself
// (device pixels) and its disc's radius there, for sunBehind; `hid`: how much of it something's been drawn over)
const noted = { on: false, x: 0, y: 0, k: 1, ghosts: 1, dev: false, dx: 0, dy: 0, dr: 0, hid: 0 };
/** Round the sun's middle: where to look for what's in front of it (its middle, then four round its rim). */
const PROBE = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
const PROBE_R = 16;

/**
 * A scene's sun is at (x, y) on screen this frame: draws its glare (rays, halo) right now on `c`, so call it where the
 * sun's drawn (with the sky, behind whatever's in front of the sun), and notes it for the lens's ghosts later on.
 * `k`: how much of it's seen (1 open sky; less glimpsed through leaves), `ghosts`: how much of the ghosts to show (0
 * when it's peeking through something solid), `scale`: the drawing's pixels to the screen's (a half-size scene: 0.5).
 */
export const noteSun = (c: Ctx | null, x: number, y: number, k = 1, ghosts = 1, scale = 1, tod = timeOfDay()) => {
  noted.on = true; noted.x = x * (1 / scale); noted.y = y * (1 / scale); noted.k = k; noted.ghosts = ghosts; noted.hid = 0;
  noted.dev = !!c;
  if (c) {
    const m = c.getTransform();
    noted.dx = m.a * x + m.c * y + m.e; noted.dy = m.b * x + m.d * y + m.f; noted.dr = PROBE_R * scale * Math.hypot(m.a, m.b);
    drawSunGlare(c, x, y, k, { scale, hud: scale === 1 }, tod);
  }
};

/**
 * Something solid's just been drawn on `c` that might be in front of the sun (a mountain, a wall): `inside(x, y)` says
 * whether a point (in `c`'s own units, as it's drawing: the world, at its depth) is inside it. The lens's ghosts fade
 * while the sun's behind it. Call it where it's drawn, with that drawing's transform still on `c`.
 */
export const sunBehind = (c: Ctx, inside: (x: number, y: number) => boolean) => {
  if (!noted.on || !noted.dev) return;
  const m = c.getTransform(), det = m.a * m.d - m.b * m.c;
  if (Math.abs(det) < 1e-9) return;
  let n = 0;
  for (const [ox, oy] of PROBE) {
    const X = noted.dx + ox * noted.dr - m.e, Y = noted.dy + oy * noted.dr - m.f;
    if (inside((m.d * X - m.c * Y) / det, (m.a * Y - m.b * X) / det)) n++;
  }
  noted.hid = Math.max(noted.hid, n / PROBE.length);
};

/** The sun noted this frame (and forgets it), or null. */
export const takeSun = () => {
  if (!noted.on) return null;
  noted.on = false;
  return noted;
};

/** How clear the line to the sun is (eased, so it fades rather than pops behind a pillar). */
let clear = 1;

/**
 * The lens's ghosts for the sun noted this frame (and forgets it). `amount`: how outdoors the view is. `state`: to fade
 * them while the sun's behind something solid (its blocks, the flat camera's world); leave it out where the world's
 * not flat on the screen (the hub's roundabout).
 */
export const drawNotedSunFlare = (c: Ctx, amount = 1, state?: GameState) => {
  const n = takeSun();
  if (!n || amount <= 0.01) { clear = 1; return; }
  // (how much of it's hidden: by what the scene's said is in front of it (sunBehind), by the stage's solid blocks)
  let hid = n.hid;
  const v = state?.view;
  if (v && hid < 1) {
    let k = 0;
    for (const [ox, oy] of PROBE) {
      const wx = v.x + ((n.x + ox * PROBE_R) * v.w) / W, wy = v.y + ((n.y + oy * PROBE_R) * v.h) / H;
      for (const b of state.blocks) if (b.h > 24 && wx > b.x && wx < b.x + b.w && wy > b.y && wy < b.y + b.h) { k++; break; }
    }
    hid = Math.max(hid, k / PROBE.length);
  }
  const target = 1 - hid;
  clear += (target - clear) * 0.15;
  drawSunGhosts(c, n.x, n.y, n.k * amount * n.ghosts * clear);
};

// ---------------------------------------------------------------------------------------------------------------
// The drawing

/** The ghosts: how far along (0 the sun, 1 the screen's middle), size, shape, which tint. */
const GHOSTS: [number, number, 'disc' | 'hex' | 'ring', number][] = [
  [0.22, 7, 'disc', 0],
  [0.42, 18, 'hex', 1],
  [0.6, 6, 'disc', 2],
  [0.82, 12, 'hex', 3],
  [1.08, 30, 'ring', 4],
  [1.34, 14, 'hex', 1],
  [1.6, 40, 'hex', 0],
  [1.95, 22, 'disc', 3],
];
/** The ghosts' tints (the coatings on the lens): gold, teal, white, violet, green; warmed by the hour. */
const TINTS = ['#FFD27A', '#7FE0D8', '#FFF6E0', '#C49CFF', '#A8F08A'];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const snap = (v: number) => Math.round(v / 2) * 2;
/** How low the sun is: 0 high, 1 on the horizon. */
const lowOf = (tod: TimeOfDay) => clamp(1 - tod.sunH / 0.6);

/** The hour's colors for it (worked out when the hour changes, not every frame): the rays', the halo's, each tint's. */
let hourCols = { key: '', core: '', warm: '', tints: [] as string[] };
const colorsFor = (tod: TimeOfDay) => {
  if (hourCols.key === tod.key) return hourCols;
  const low = lowOf(tod);
  hourCols = {
    key: tod.key,
    core: mix('#FFFFF4', tod.sun, 0.35 + 0.4 * low), warm: mix('#FFF2C8', tod.sunGlow, 0.3 + 0.6 * low),
    tints: TINTS.map(t => mix(t, tod.sunGlow, 0.15 + 0.45 * low)),
  };
  return hourCols;
};

/** How strong the glare is for a sun at (x, y) on screen, seen `k` much (0 down, off screen or hidden). */
const strength = (x: number, y: number, k: number, tod: TimeOfDay, sw = W, sh = H) => {
  const up = clamp((tod.sunH + 0.12) / 0.2);
  // (on screen: fading out as it goes off the edge)
  const out = Math.hypot(Math.max(0, -x, x - sw), Math.max(0, -y, y - sh));
  return clamp(k) * up * clamp(1 - out / 140) * (1 - 0.25 * lowOf(tod));
};

/** Keeps what's drawn out of the main HUD's corner (and inside `box`, if given). Inside a save. */
const clipHud = (c: Ctx, box?: Box) => {
  c.beginPath();
  if (box) c.rect(box.x, box.y, box.w, box.h); else c.rect(0, 0, W, H);
  c.rect(0, 0, HUD_CLEAR_X, HUD_CLEAR_Y);
  c.clip('evenodd');
};

let tick = 0;

/**
 * The glare round a sun at (x, y): a starburst of rays in three stepped layers (long and faint, to short and bright),
 * a hollow halo ring, and with the sun low, a flat streak along the horizon. `scale`: the drawing's pixels to the
 * screen's; `hud`: keep it out of the main HUD's corner (drawing straight on the screen); `screen`: where it is on
 * the screen, when (x, y) aren't screen space (drawn into the world).
 */
export const drawSunGlare = (c: Ctx, x: number, y: number, k = 1, opts: { scale?: number; hud?: boolean; screen?: [number, number] } = {}, tod = timeOfDay()) => {
  const scale = opts.scale ?? 1, sx = opts.screen ? opts.screen[0] : x / scale, sy = opts.screen ? opts.screen[1] : y / scale;
  const s = strength(sx, sy, k, tod);
  if (s < 0.02) return;
  tick++;
  const low = lowOf(tod), { core, warm } = colorsFor(tod), px = 2 * scale;
  x = Math.round(x / px) * px; y = Math.round(y / px) * px;
  c.save();
  c.globalCompositeOperation = 'lighter';
  if (opts.hud ?? true) clipHud(c);
  // (the rays: turned a little by where the sun is on screen; a stepped shimmer in their length; longer as it's low)
  const turn = Math.atan2(sy - H / 2, sx - W / 2) * 0.25;
  const shimmer = 1 + (0.06 * Math.round(Math.sin(tick * 0.05) * 2)) / 2;
  const L = (96 + 60 * low) * shimmer * scale;
  c.fillStyle = core;
  for (let layer = 0; layer < 3; layer++) {
    const len = L * [1, 0.62, 0.36][layer], wid = [2, 3.5, 5][layer] * scale;
    c.globalAlpha = s * [0.12, 0.16, 0.22][layer];
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = turn + (i / 8) * Math.PI * 2, r = len * (i % 2 ? 0.55 : 1);
      const ca = Math.cos(a), sa = Math.sin(a);
      c.moveTo(x - sa * wid, y + ca * wid);
      c.lineTo(x + ca * r, y + sa * r);
      c.lineTo(x + sa * wid, y - ca * wid);
      c.closePath();
    }
    c.fill();
  }
  // (the halo ring, hollow: two steps)
  const hr = (62 + 26 * low) * scale;
  c.fillStyle = warm;
  for (let i = 0; i < 2; i++) {
    c.globalAlpha = s * (i ? 0.1 : 0.06);
    const r0 = hr - (i ? 2 : 4) * scale, r1 = hr + (i ? 2 : 4) * scale;
    c.beginPath(); c.arc(x, y, r1, 0, Math.PI * 2); c.arc(x, y, r0, 0, Math.PI * 2, true); c.fill();
  }
  // (golden hour on: a flat streak across it, stepped: the glare along the horizon)
  if (low > 0.3) {
    const sk = (s * (low - 0.3)) / 0.7;
    for (let i = 0; i < 3; i++) {
      const len = [220, 140, 70][i] * scale, th = [2, 2, 4][i] * scale;
      c.globalAlpha = sk * [0.12, 0.14, 0.18][i];
      c.fillRect(x - len, y - th / 2, len * 2, th);
    }
  }
  c.restore();
};

/**
 * The lens's ghosts for a sun at (x, y) on screen, `k` how much (already allowing for what's in front of it): down the
 * line from the sun through the middle of the screen, further out, bigger and warmer as it gets low. Faint (they're
 * over the play). `box`: keep them inside it (a letterboxed scene).
 */
export const drawSunGhosts = (c: Ctx, x: number, y: number, k = 1, box?: Box, tod = timeOfDay()) => {
  const g = strength(x, y, k, tod);
  if (g < 0.02) return;
  const low = lowOf(tod), { tints } = colorsFor(tod);
  x = snap(x); y = snap(y);
  const vx = W / 2 - x, vy = H / 2 - y, spread = 1 + 0.35 * low, grow = 1 + 0.3 * low;
  c.save();
  c.globalCompositeOperation = 'lighter';
  clipHud(c, box);
  for (const [t, size, shape, tint] of GHOSTS) {
    const gx = snap(x + vx * t * spread), gy = snap(y + vy * t * spread), r = size * grow;
    if (gx + r < 0 || gx - r > W || gy + r < 0 || gy - r > H) continue;
    c.fillStyle = tints[tint];
    c.globalAlpha = g * (shape === 'ring' ? 0.08 : 0.055);
    if (shape === 'ring') {
      c.beginPath(); c.arc(gx, gy, r, 0, Math.PI * 2); c.arc(gx, gy, r - 4, 0, Math.PI * 2, true); c.fill();
      continue;
    }
    // (two steps: the whole of it, then its middle again over it)
    for (let step = 0; step < 2; step++) {
      const rr = step ? r * 0.6 : r;
      c.beginPath();
      if (shape === 'hex') {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.26, hx = Math.round(gx + Math.cos(a) * rr), hy = Math.round(gy + Math.sin(a) * rr);
          if (i === 0) c.moveTo(hx, hy); else c.lineTo(hx, hy);
        }
        c.closePath();
      } else c.arc(gx, gy, rr, 0, Math.PI * 2);
      c.fill();
    }
  }
  c.restore();
};
