// The water park's level 1, drawn (a crude first pass: readable boxes and strokes, the SNES pass comes later). At night
// (the endgame's hour 10; 11 once the kid's dead). Florida: warm, flat, palms, pastel concrete, and MOUNT EVEREST BUT
// BETTER sticking up out of it with fake snow on.
//
// Depth, back to front (each step's own draw, in this order):
//   the backdrop (screen space): the sky; far off, Happy Land's landmarks on the horizon (their own painters, parkFar.ts)
//     and the water park's other rides; nearer, the park's giant tangled slide towers (dimmed); all drop away down the
//     screen as he climbs (the height reads).
//   drawBack (world, behind everything that moves): the plaza's back props (palms, booths, umbrellas: dimmed, nothing
//     to stand on); the pits' walls; the pools'
//     water and tiles; the slides' stairs, decks, chutes and legs; the tube rides' bottomless drop (dark bands down
//     into nothing), their legs going down into it, their chutes, the gaps' striped broken ends and GAP signs, the
//     pipes' gantries; the tower (its back wall, its floors'
//     props, its decks, its stair switchbacks outside it, its doors and gates); the summit; the descent's chute; the
//     level 2 stub. The ground's slab (lit top edge) over all of it at GY.
//   (the engine: enemies, him, the shots' particles)
//   drawFront (world, in front of him): each slide's and chute's near wall (his legs down in the water behind it), the
//     tube's front half round him, the pipes end-on, the shots.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { drawTodSky, timeOfDay, farTint, lampGlow } from '../../timeOfDay';
import { farMark } from '../../parkFar';
import { text, steppedGlow } from '../../intro/art/kit';
import { WATER_PARK_NAME } from '../stages';
import { GY, GROUND, POOLS, LEDGES, ISLANDS, SLIDES, TUBES, TOWER, FLOORS, floorY, exitSide, FLOOR_NAMES, FLOOR_FT, SUMMIT, DESCENT, L2, step, tubeSpan, type Slide, type Tube } from './geo';
import { SLIDE_PATHS, pointAt, type Path } from './slides';
import { tubePaths, tubeLap, tubeLapNo, PIPE_CLEAR, GAP_WARN } from './tube';
import { FLOOR_LEDGES, DOORS_X, ROUND, FACE } from './tower';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0806';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// (the view as drawn: on the spiral the world's drawn into a strip wider than the screen (the turning tower's sides), all
// of which is wrapped on: culled to that, not the camera's 800)
const vis = (state: GameState, a: number, b: number, m = 80) => { const v = state.view, x0 = v && v.w > W ? v.x : state.camera.x, w = v && v.w > W ? v.w : W; return b > x0 - m && a < x0 + w + m; };
const visY = (state: GameState, a: number, b: number, m = 80) => b > state.camera.y - m && a < state.camera.y + H + m;
const checker = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; for (let yy = 0; yy < h; yy += 2) for (let xx = (yy >> 1) & 1 ? 2 : 0; xx < w; xx += 4) c.fillRect(x + xx, y + yy, 2, 2); };

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

/** The tube rides' bottomless drop: banded (stepped down, SNES) into black. */
const VOID = '#020308';
const DROP_BANDS = ['#141A2C', '#0E1322', '#090D18', '#05070F'];
const FAR_W = 1600, FAR_H = 300;
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), t = (col: string, k = 1) => farTint(col, k, tod);
  const foot = FAR_H - 4;
  // Happy Land on the horizon: its lands' landmarks, as they are now (dark, the odd light)
  farMark(g, 'rockies', 200, foot, 70, 0.55, tod);
  farMark(g, 'fairyCastle', 120, foot, 120, 0.45, tod);
  farMark(g, 'needle', 330, foot, 170, 0.45, tod);
  farMark(g, 'atom', 440, foot, 80, 0.45, tod);
  farMark(g, 'clockTower', 560, foot, 110, 0.45, tod);
  farMark(g, 'thrones', 700, foot, 70, 0.5, tod);
  farMark(g, 'cartoonTower', 840, foot, 90, 0.45, tod);
  farMark(g, 'showcase', 960, foot, 80, 0.5, tod);
  // (the water park's own rides, farther along: towers and their tubes)
  for (let i = 0; i < 6; i++) {
    const x = 1080 + i * 85, h = 60 + hash(i) * 60;
    R(g, x, foot - h, 14, h, t('#2A3456', 0.7)); R(g, x - 6, foot - h - 8, 26, 8, t('#7A2A1A', 0.7));
    g.strokeStyle = t(['#0891B2', '#BE185D', '#CA8A04'][i % 3], 0.6); g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + 14, foot - h + 6); g.quadraticCurveTo(x + 70, foot - h, x + 80, foot - 4); g.stroke(); g.lineCap = 'butt';
  }
  // (the treeline and the lights along the horizon)
  g.fillStyle = t('#0C1424', 0.8); for (let x = 0; x < FAR_W; x += 6) { const h = 6 + hash(x * 0.37) * 10; g.fillRect(x, foot - h, 6, h + 4); }
  for (let i = 0; i < 70; i++) R(g, hash(i + 3) * FAR_W, foot - 4 - hash(i) * 40, 2, 2, i % 3 ? '#F6C860' : '#93C5FD');
};
/** The park's giant slides, nearer (the owner's: "i want the scale to feel grander with all the slides"): towers of
 *  scaffold with slides tangled round and between them, helixes, enclosed tubes, long sweeps down to their pools.
 *  Dimmed (nothing here to stand on: no lit tops). A seamless strip (everything's painted at x and x ± BIG_W). */
const BIG_W = 1800, BIG_H = 430, BIG_TW = 300, BIG_TH = 215;
const NOBIG = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('wpnobig');
const BIG_COLS = ['#0891B2', '#DB2777', '#CA8A04', '#16A34A', '#EA580C', '#7C3AED', '#0EA5E9', '#E11D48'];
const paintBig = (g: Ctx, x0 = -1e9, x1 = 1e9) => {
  const t = (col: string) => farTint(col, 0.42);
  const foot = BIG_H - 2;
  const towers = Array.from({ length: 8 }, (_, i) => ({ x: 90 + i * 225 + Math.round(hash(i + 40) * 60), h: 170 + Math.round(hash(i + 7) * 240), w: 30 + Math.round(hash(i + 2) * 16) }));
  for (const off of [-BIG_W, 0, BIG_W]) {
    g.save(); g.translate(off, 0);
    // (the pools at their feet)
    for (let i = 0; i < 8; i++) { const x = 40 + i * 225 + hash(i + 90) * 80; g.fillStyle = t('#1E6FA8'); g.beginPath(); g.ellipse(x, foot - 4, 70, 7, 0, 0, Math.PI * 2); g.fill(); }
    towers.forEach((T, i) => {
      // (a tile's only what reaches into it: a tower and what's off it reach ~700 either side)
      if (T.x + off < x0 - 720 || T.x + off > x1 + 720) return;
      const top = foot - T.h, tl = T.x - T.w / 2;
      // (the scaffold: legs, cross-braces every so far, a platform and its canopy up top)
      g.fillStyle = t('#1C2438'); g.fillRect(tl, top, 4, T.h); g.fillRect(tl + T.w - 4, top, 4, T.h);
      g.strokeStyle = t('#2A3450'); g.lineWidth = 2; g.beginPath();
      for (let y = top + 10; y < foot - 20; y += 28) { g.moveTo(tl + 2, y); g.lineTo(tl + T.w - 2, y + 28); g.moveTo(tl + T.w - 2, y); g.lineTo(tl + 2, y + 28); }
      g.stroke();
      g.fillStyle = t('#232C44'); g.fillRect(tl - 8, top - 4, T.w + 16, 6);
      g.fillStyle = t(BIG_COLS[(i + 3) % 8]); g.beginPath(); g.moveTo(tl - 12, top - 22); g.lineTo(T.x, top - 40); g.lineTo(tl + T.w + 12, top - 22); g.closePath(); g.fill();
      g.fillStyle = t('#1C2438'); g.fillRect(tl - 8, top - 22, 3, 18); g.fillRect(tl + T.w + 5, top - 22, 3, 18);
      g.lineCap = 'round'; g.lineJoin = 'round';
      const col = t(BIG_COLS[i % 8]), col2 = t(BIG_COLS[(i + 5) % 8]);
      // (a helix down the tower: its back halves first, darker, then the front)
      if (i % 2 === 0) {
        const turns = Math.max(3, Math.floor(T.h / 80)), r = T.w / 2 + 26;
        for (const front of [false, true]) for (let k = 0; k < turns; k++) {
          const y = top + 30 + k * ((T.h - 60) / turns);
          g.strokeStyle = front ? col : t('#141A2A'); g.lineWidth = front ? 9 : 7;
          g.beginPath(); g.ellipse(T.x, y + 20, r, 16, -0.12, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke();
        }
      }
      // (a long sweep off the top, down and away to the next tower's pool or further, crossing what's between)
      const dir = i % 3 === 1 ? -1 : 1, reach = 260 + hash(i + 11) * 360;
      g.strokeStyle = t('#0A0E18'); g.lineWidth = 13;
      g.beginPath(); g.moveTo(T.x + dir * T.w / 2, top + 4); g.bezierCurveTo(T.x + dir * reach * 0.35, top - 10, T.x + dir * reach * 0.5, foot - T.h * 0.2, T.x + dir * reach, foot - 10); g.stroke();
      g.strokeStyle = col2; g.lineWidth = 9; g.stroke();
      // (an enclosed tube: thicker, banded, a loop-de-loop on the way down)
      if (i % 3 !== 1) {
        const lx = T.x + dir * 40, ly = top + T.h * 0.45;
        g.strokeStyle = t('#0A0E18'); g.lineWidth = 17;
        g.beginPath(); g.moveTo(T.x - dir * T.w / 2, top + 20); g.quadraticCurveTo(T.x - dir * 120, top + 40, lx, ly - 50);
        g.arc(lx, ly, 50, -Math.PI / 2, Math.PI * 1.5 * (dir > 0 ? 1 : -1) - (dir > 0 ? 0 : Math.PI), dir < 0);
        g.quadraticCurveTo(lx + dir * 180, ly + 40, lx + dir * 240, foot - 8); g.stroke();
        g.strokeStyle = t(BIG_COLS[(i + 2) % 8]); g.lineWidth = 13; g.stroke();
        g.strokeStyle = t('#10162A'); g.lineWidth = 13; g.setLineDash([3, 14]); g.stroke(); g.setLineDash([]);
      }
      // (a short kiddie one off a lower deck)
      const dy = foot - T.h * 0.3;
      g.fillStyle = t('#232C44'); g.fillRect(tl - 10, dy, T.w + 20, 4);
      g.strokeStyle = t(BIG_COLS[(i + 6) % 8]); g.lineWidth = 6; g.beginPath(); g.moveTo(tl - 10, dy + 2); g.quadraticCurveTo(tl - 60, dy + 10, tl - 90, foot - 6); g.stroke();
      g.lineCap = 'butt'; g.lineJoin = 'miter';
    });
    g.restore();
  }
  // (dimmed: a haze over the lot, so none of it reads as somewhere to stand)
  // (over what's painted only: the sky behind's left as it is)
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8, 12, 26, 0.58)'; g.fillRect(0, 0, BIG_W, BIG_H); g.globalCompositeOperation = 'source-over';
};
/** Screen space: the sky; the far horizon and the plaza's rides, dropping away as he climbs. `shift`: how far the tube
 *  rides have carried him back round their loops (the parallax carries on as if they hadn't: no jump). `hole`: a part
 *  of the screen the world's sure to cover, solid, this frame (the turning tower: its face and its floors), where none
 *  of this is put down (it was, under all of it, every frame: a good part of the spiral's cost). */
export const drawParkBackdrop = (c: Ctx, state: GameState, shift = 0, hole?: { x0: number; x1: number; y0: number; y1: number } | null) => {
  const h = hole && hole.x1 > hole.x0 && hole.y1 > hole.y0 ? hole : null;
  if (!h) return paintBackdrop(c, state, shift);
  // (round it: what's over it and under it, the whole width; either side of it, its height)
  c.save(); c.beginPath();
  if (h.y0 > 0) c.rect(0, 0, W, h.y0);
  if (h.y1 < H) c.rect(0, h.y1, W, H - h.y1);
  if (h.x0 > 0) c.rect(0, h.y0, h.x0, h.y1 - h.y0);
  if (h.x1 < W) c.rect(h.x1, h.y0, W - h.x1, h.y1 - h.y0);
  c.clip();
  paintBackdrop(c, state, shift);
  c.restore();
  return true;
};
const paintBackdrop = (c: Ctx, state: GameState, shift: number) => {
  const f = state.frame, cx = state.camera.x + shift, cy = state.camera.y, tod = timeOfDay();
  // (over a tube ride's drop: nothing of the backdrop's painted under the drop's top (it's the drop's, black: painted
  // once, below), so the screen's not painted twice over there)
  const drop = dropRect(state);
  // (a plain rect clip only, the drop across the whole screen: a clip of any other shape costs more than it saves)
  const crop = !!drop && drop.x0 <= 0 && drop.x1 >= W;
  if (crop) { c.save(); c.beginPath(); c.rect(0, 0, W, drop!.y); c.clip(); }
  drawTodSky(c, 0, 0, W, H, tod.sky, { moon: [620, 80], horizon: 420, t: f, scroll: cx });
  // (how high he is: the camera's top over the ground's)
  const up = Math.max(0, -cy);
  const hz = 420 + up * 0.05;
  if (hz - FAR_H < H) {
    c.save(); c.translate(-Math.round(((cx * 0.03) % (FAR_W - W) + (FAR_W - W)) % (FAR_W - W)), Math.round(hz - FAR_H));
    stamp(c, `wp-far-${tod.key}`, 0, 0, FAR_W, FAR_H, paintFar);
    c.restore();
  }
  const my = 470 + up * 0.22;
  // (the haze down at the horizon, and under it the dark of the land)
  const base = Math.round(Math.max(hz, my));
  if (base < H) { R(c, 0, base, W, H - base, farTint('#0A1020', 0.8)); }
  // (the park's giant slides (in place of the plain far-off rides there were): a seamless strip, dropping away quicker
  // as he climbs)
  const by = 548 + up * 0.35;
  if (by - BIG_H < H && !NOBIG) {
    const ox = ((cx * 0.2) % BIG_W + BIG_W) % BIG_W;
    // (in tiles, only those on screen (and not under the drop) put down)
    const top = Math.round(by - BIG_H), cut = drop && crop ? drop.y : H;
    for (const dx of [-ox, BIG_W - ox]) for (let tx = 0; tx < BIG_W; tx += BIG_TW) for (let ty = 0; ty < BIG_H; ty += BIG_TH) {
      const sx = Math.round(dx) + tx, sy = top + ty;
      if (sx >= W || sx + BIG_TW <= 0 || sy >= cut || sy + BIG_TH <= 0) continue;
      c.save(); c.translate(Math.round(dx), top);
      stamp(c, `wp-big-${tod.key}-${tx}-${ty}`, tx, ty, BIG_TW, BIG_TH, g => { g.save(); g.beginPath(); g.rect(tx, ty, BIG_TW, BIG_TH); g.clip(); paintBig(g, tx, tx + BIG_TW); g.restore(); });
      c.restore();
    }
    if (by < H) R(c, 0, Math.round(by), W, H - Math.round(by), farTint('#0A1020', 0.8));
  }
  if (drop) {
    if (crop) c.restore();
    // (the drop: banded down into black, no bottom)
    const w = drop.x1 - drop.x0;
    DROP_BANDS.forEach((col, k) => R(c, drop.x0, drop.y + k * 26, w, 26, col));
    const v = drop.y + DROP_BANDS.length * 26;
    if (v < H) R(c, drop.x0, v, w, H - v, VOID);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza: the ground, its pits and pools, its props

const CONC = ['#E8D9C4', '#CDBBA2', '#A8977E', '#7A6C58'];
/** The plaza's slab at GY: pastel concrete, its lit lip (standable reads standable), its tiles anchored to the world. */
const drawGround = (c: Ctx, state: GameState) => {
  const bot = state.camera.y + H + 40;
  if (bot < GY) return;
  for (const [a, b] of GROUND) {
    if (!vis(state, a, b, 20)) continue;
    const x0 = Math.max(a, state.camera.x - 40), x1 = Math.min(b, state.camera.x + W + 40);
    R(c, x0, GY, x1 - x0, bot - GY, CONC[2]);
    R(c, x0, GY, x1 - x0, 3, '#FFF4E0'); R(c, x0, GY + 3, x1 - x0, 4, CONC[0]);
    for (let x = Math.floor(x0 / 64) * 64; x < x1; x += 64) R(c, x, GY + 7, 2, 30, CONC[3]);
    R(c, x0, GY + 36, x1 - x0, 2, CONC[3]);
    // (the edge of a run: a lit corner, the crater's broken edge under it)
    for (const e of [a, b]) if (e > x0 - 2 && e < x1 + 2) R(c, e - (e === a ? 0 : 3), GY, 3, 60, '#FFF4E0');
  }
};
/** The pits between runs: blast craters (glowing at the bottom: something burning down there), or the drained DEEP END
 *  under the tube rides (blue tiles going down, its depth painted). */
const drawPits = (c: Ctx, state: GameState) => {
  const bot = state.camera.y + H + 40;
  for (let i = 0; i + 1 < GROUND.length; i++) {
    const a = GROUND[i][1], b = GROUND[i + 1][0];
    if (!vis(state, a, b, 20) || bot < GY) continue;
    const pool = POOLS.find(p => p.x1 >= a - 1 && p.x2 <= b + 1);
    const deep = TUBES.some(t => t.deck.x1 >= a - 140 && t.deck.x1 <= a + 5);
    const x0 = Math.max(a, state.camera.x - 40), x1 = Math.min(b, state.camera.x + W + 40);
    if (deep) {
      // (under the tube rides: nothing. Black all the way down (the drop's bands over it: drawTubeBack))
      R(c, x0, GY, x1 - x0, bot - GY, VOID);
      continue;
    }
    if (pool) continue;
    // (a crater: broken slab edges, rebar, the dark going down, an orange glow far down)
    R(c, x0, GY, x1 - x0, bot - GY, '#120A0A');
    c.fillStyle = 'rgba(234, 88, 12, 0.18)'; c.fillRect(x0, GY + 200, x1 - x0, Math.max(0, bot - GY - 200));
    for (const [ex, d] of [[a, 1], [b, -1]] as const) {
      if (ex < state.camera.x - 80 || ex > state.camera.x + W + 80) continue;
      c.fillStyle = CONC[3]; c.beginPath(); c.moveTo(ex, GY); c.lineTo(ex + d * 28, GY + 10); c.lineTo(ex + d * 10, GY + 40); c.lineTo(ex + d * 30, GY + 90); c.lineTo(ex, GY + 130); c.closePath(); c.fill();
      c.strokeStyle = '#5A3A2A'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex, GY + 20); c.lineTo(ex + d * 40, GY + 12); c.moveTo(ex, GY + 50); c.lineTo(ex + d * 34, GY + 60); c.stroke();
    }
  }
};
const waterOf = (p: (typeof POOLS)[number], greenPool: number, a: number) => {
  const green = p === POOLS[3] ? greenPool : 0;
  return green > 0 ? `rgba(${Math.round(40 + 30 * (1 - green))}, ${Math.round(120 + 40 * green)}, ${Math.round(200 - 140 * green)}, ${a + 0.12})` : `rgba(40, 140, 220, ${a})`;
};
/** The pools' water in front of him (he's in it, down in it: the water over him), its surface glinting. */
const drawPoolsFront = (c: Ctx, state: GameState, greenPool: number) => {
  for (const p of POOLS) {
    if (!vis(state, p.x1, p.x2) || !visY(state, p.surface, p.bottom)) continue;
    const green = p === POOLS[3] ? greenPool : 0;
    c.fillStyle = waterOf(p, greenPool, 0.32); c.fillRect(p.x1, p.surface, p.x2 - p.x1, p.bottom - p.surface);
    R(c, p.x1, p.surface, p.x2 - p.x1, 2, green > 0.5 ? '#BEF264' : '#BFE6FF');
    for (let x = p.x1 + ((state.frame * 0.6) % 30); x < p.x2 - 8; x += 30) R(c, x, p.surface + 4, 8, 1, '#E0F2FE');
  }
};
const drawPools = (c: Ctx, state: GameState, greenPool: number) => {
  for (const p of POOLS) {
    if (!vis(state, p.x1, p.x2)) continue;
    // (the tiles of its walls and floor; the water over it, banded, its surface glinting)
    R(c, p.x1, GY, p.x2 - p.x1, p.bottom - GY + 20, '#2A6AA8');
    for (let y = GY; y < p.bottom; y += 16) R(c, p.x1, y, p.x2 - p.x1, 1, '#4A8AC8');
    // (its floor: tiles, lit along the top: he stands on it)
    R(c, p.x1, p.bottom, p.x2 - p.x1, 3, '#BFE6FF'); R(c, p.x1, p.bottom + 3, p.x2 - p.x1, 2, '#7FB4E6');
    // (its walls: darker, a lit edge down each)
    R(c, p.x1, GY, 6, p.bottom - GY, '#1E4E82'); R(c, p.x2 - 6, GY, 6, p.bottom - GY, '#1E4E82');
    R(c, p.x1 + 6, GY, 2, p.bottom - GY, '#6AA8E0'); R(c, p.x2 - 8, GY, 2, p.bottom - GY, '#6AA8E0');
    c.fillStyle = waterOf(p, greenPool, 0.5); c.fillRect(p.x1, p.surface, p.x2 - p.x1, p.bottom - p.surface);
    // (its rim: lit, a ladder at the far end)
    R(c, p.x1 - 4, GY - 2, 8, 8, '#F8FAFC'); R(c, p.x2 - 4, GY - 2, 8, 8, '#F8FAFC');
    R(c, p.x2 - 20, GY - 30, 3, 60, '#C8CCD2'); R(c, p.x2 - 10, GY - 30, 3, 60, '#C8CCD2');
    for (let y = GY - 24; y < GY + 30; y += 12) R(c, p.x2 - 20, y, 13, 2, '#C8CCD2');
  }
};
/** A sign on posts, stood on the ground at (x, feet), its board high enough to read over him. */
export const sign = (c: Ctx, x: number, feet: number, lines: string[], board = '#0E7490', ink = '#FEF3C7', key?: string) => {
  const draw = (g: Ctx) => {
    g.font = '8px "Press Start 2P"';
    const w = Math.max(70, ...lines.map(l => g.measureText(l).width + 18)), h = 12 + lines.length * 12, top = feet - 110;
    R(g, x - w / 2 + 6, top + h, 5, 110 - h, '#3F3F46'); R(g, x + w / 2 - 11, top + h, 5, 110 - h, '#3F3F46');
    R(g, x - w / 2 - 2, top - 2, w + 4, h + 4, INK); R(g, x - w / 2, top, w, h, board); R(g, x - w / 2, top, w, 2, '#FFFFFF');
    lines.forEach((l, i) => text(g, l, x, top + 16 + i * 12, ink, 8));
  };
  if (key) stamp(c, `wp-sign-${key}`, x - 200, feet - 120, 400, 124, draw); else draw(c);
};
/** Where the plaza's signs stand (no palm in front of one). */
const SIGN_X = [...SLIDES.filter(S => S.stairs.n > 0).map(S => S.stairs.x - 90), ...TUBES.map(T => T.stairs.x - 90), 4600, 520, 760];
/** The plaza's back props (behind him, dimmed: nothing here to stand on). */
const drawProps = (c: Ctx, state: GameState) => {
  // (palms, every so often, back from the path)
  for (let x = Math.floor((state.camera.x - 200) / 520) * 520 + 130; x < state.camera.x + W + 200; x += 520) {
    if (GROUND.every(([a, b]) => x < a + 40 || x > b - 40) || (x > TOWER.TL - 600 && x < TOWER.TR + 300)) continue;
    // (never over a sign, a slide's stairs or a booth)
    if (SIGN_X.some(sx => Math.abs(sx - x) < 160) || [...SLIDES, ...TUBES].some(S => x > S.stairs.x - 40 && x < S.deck.x2 + 40)) continue;
    stamp(c, `wp-palm-${Math.floor(x / 520) % 3}`, x - 70, GY - 260, 140, 262, g => {
      const lean = (Math.floor(x / 520) % 3 - 1) * 14;
      g.strokeStyle = '#3A2A1A'; g.lineWidth = 12; g.beginPath(); g.moveTo(x, GY); g.quadraticCurveTo(x + lean * 0.4, GY - 120, x + lean, GY - 200); g.stroke();
      g.strokeStyle = '#5A4028'; g.lineWidth = 8; g.stroke();
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48; g.strokeStyle = '#0F3A22'; g.lineWidth = 7; g.beginPath(); g.moveTo(x + lean, GY - 200); g.quadraticCurveTo(x + lean + Math.cos(a) * 40, GY - 214 + Math.sin(a) * 40, x + lean + Math.cos(a) * 66, GY - 186 + Math.sin(a) * 30); g.stroke(); g.strokeStyle = '#1E5A36'; g.lineWidth = 4; g.stroke(); }
    });
  }
  // (the gate, kicked down: its arch and towers behind him (the back of the lot's), the gates themselves flat on the plaza)
  if (vis(state, -200, 420)) {
    stamp(c, 'wp-gate', -200, GY - 310, 620, 316, g => {
      for (const tx of [-120, 210]) { R(g, tx - 2, GY - 262, 54, 262, INK); R(g, tx, GY - 260, 50, 260, '#1E4A7A'); R(g, tx, GY - 260, 8, 260, '#3A7AB8'); R(g, tx - 6, GY - 276, 62, 14, '#22D3EE'); }
      g.strokeStyle = INK; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(-100, GY - 238); g.quadraticCurveTo(110, GY - 330, 240, GY - 238); g.stroke();
      g.strokeStyle = '#0891B2'; g.lineWidth = 24; g.stroke(); g.lineCap = 'butt';
      text(g, WATER_PARK_NAME, 70, GY - 266, '#FEF08A', 14);
      // (the gates, down flat: bars in a sliver on the ground, the chain still round them)
      R(g, -60, GY - 6, 260, 6, INK); for (let x = -56; x < 196; x += 14) R(g, x, GY - 5, 4, 4, '#8A8E98');
      R(g, 60, GY - 9, 30, 4, '#C8CCD2'); R(g, 70, GY - 12, 10, 8, '#D4A017');
    });
  }
  // (the ticket booths, smashed; the turnstiles)
  for (const x of [520, 760]) if (vis(state, x - 80, x + 80)) stamp(c, `wp-booth-${x}`, x - 70, GY - 150, 140, 152, g => {
    R(g, x - 50, GY - 120, 100, 120, INK); R(g, x - 48, GY - 118, 96, 118, '#F472B6'); R(g, x - 48, GY - 118, 96, 4, '#FBCFE8');
    R(g, x - 36, GY - 96, 72, 40, '#0B1220'); for (let k = 0; k < 6; k++) R(g, x - 30 + k * 11, GY - 92 + (k % 2) * 14, 4, 4, '#BFE0FF');
    R(g, x - 58, GY - 136, 116, 18, INK); R(g, x - 56, GY - 134, 112, 14, '#0EA5E9'); text(g, 'TICKETS', x, GY - 123, '#F8FAFC', 7);
    R(g, x - 50, GY - 50, 100, 6, '#7A2A3A');
  });
  // (the slides' and tubes' signs, at their stairs' foot)
  for (const S of SLIDES) if (S.stairs.n > 0 && vis(state, S.stairs.x - 220, S.stairs.x)) sign(c, S.stairs.x - 90, GY, [S.name, S.id === 'squirt' ? 'RIDE IT. FLY.' : S.id === 'kamikaze' ? 'NOT FOR CHILDREN' : S.id === 'twister' ? 'MIND THE CRATER' : 'KEEP ARMS IN'], '#7C2D12', '#FEF3C7', S.id);
  for (const T of TUBES) if (vis(state, T.stairs.x - 260, T.stairs.x)) sign(c, T.stairs.x - 90, GY, [T.name, 'TUBES ONLY', 'MIND THE GAPS'], '#312E81', '#E0E7FF', T.id);
  if (vis(state, 4500, 4720)) sign(c, 4600, GY, ['THE LAGOON', 'NO DIVING'], '#0E7490', '#FEF3C7', 'lagoon');
  // (the tiki hut under its roof ledge, the lifeguard stands: their tops lit, they're stood on)
  for (const [x, y, w] of LEDGES) if (vis(state, x, x + w)) {
    R(c, x + 10, y + 14, 8, GY - y - 14, '#5A4028'); R(c, x + w - 18, y + 14, 8, GY - y - 14, '#5A4028');
    R(c, x - 4, y, w + 8, 16, INK); R(c, x - 2, y + 2, w + 4, 12, '#A16207'); R(c, x - 2, y + 1, w + 4, 3, '#FDE68A');
  }
  for (const [x, y, w] of ISLANDS) if (vis(state, x, x + w)) stamp(c, `wp-island-${x}`, x, y, w, GY + 400 - y, g => {
    R(g, x, y, w, GY + 400 - y, '#7A6C58'); R(g, x, y, w, 3, '#FFF4E0'); R(g, x, y + 3, w, 4, CONC[0]);
    checker(g, x, y + 40, w, 40, '#5A4E40');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The slides

/** A chute along a path, painted: its back wall and its water (world), or its near wall (in front of him). */
const chuteBack = (g: Ctx, pts: [number, number][], col: string, wide = 20, water = -3) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const line = (dy: number, w: number, s: string) => { g.strokeStyle = s; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy))); g.stroke(); };
  line(-wide / 2 + 6, wide + 4, INK);
  line(-wide / 2 + 6, wide, col);
  line(-wide + 8, 3, 'rgba(255,255,255,0.35)');
  // (the water in it)
  line(water, 6, 'rgba(120, 200, 255, 0.85)');
  line(water - 2, 2, '#E0F2FE');
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
const chuteFront = (g: Ctx, pts: [number, number][], col: string, lift = 0) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  // (the near wall: up past the water's line, so whoever's sat in it is down behind it from the hips; `lift`: taller)
  const dy = 2 - lift / 2;
  g.strokeStyle = INK; g.lineWidth = 15 + lift; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy))); g.stroke();
  g.strokeStyle = col; g.lineWidth = 11 + lift; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 3 - lift) : g.moveTo(x, y - 3 - lift))); g.stroke();
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
const boundsOf = (pts: [number, number][], pad = 40) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + pad * 2 };
};
const drawSlideBack = (c: Ctx, state: GameState, S: Slide) => {
  const b = boundsOf(S.pts, 30), x0 = S.stairs.x, x1 = b.x + b.w;
  if (!vis(state, x0 - 40, x1)) return;
  stamp(c, `wp-slide-${S.id}`, x0 - 20, S.deck.y - 60, x1 - x0 + 60, GY - S.deck.y + 120, g => {
    // (the legs down from the chute to the ground (or into the pit))
    for (let i = 1; i < S.pts.length - 1; i++) { const [x, y] = S.pts[i]; R(g, x - 3, y + 8, 6, GY + 60 - y, '#3F4A5A'); R(g, x - 3, y + 8, 2, GY + 60 - y, '#6A7486'); }
    // (the stairs: steel treads, lit along their tops; the deck)
    for (let i = 0; i < S.stairs.n; i++) { const s = step(S.stairs, i); R(g, s.x, s.y, s.w, s.h, '#2E3644'); R(g, s.x, s.y, s.w, 3, '#E2E8F0'); R(g, s.x, s.y + 3, s.w, 2, '#94A3B8'); }
    const d = S.deck;
    if (S.stairs.n > 0) { R(g, d.x1, d.y, d.x2 - d.x1, GY - d.y, '#2E3644'); for (let y = d.y + 20; y < GY; y += 24) R(g, d.x1, y, d.x2 - d.x1, 2, '#1E2430'); }
    R(g, d.x1, d.y, d.x2 - d.x1, 3, '#E2E8F0'); R(g, d.x1, d.y + 3, d.x2 - d.x1, 2, '#94A3B8');
    // (the rail up the stairs)
    if (S.stairs.n > 0) { g.strokeStyle = '#94A3B8'; g.lineWidth = 2; g.beginPath(); g.moveTo(S.stairs.x, GY - 40); g.lineTo(d.x1, d.y - 40); g.lineTo(d.x2, d.y - 40); g.stroke(); }
    chuteBack(g, S.pts, S.col);
  });
};
const drawSlideFront = (c: Ctx, state: GameState, S: Slide) => {
  const b = boundsOf(S.pts, 20);
  if (!vis(state, b.x, b.x + b.w)) return;
  stamp(c, `wp-slidef-${S.id}`, b.x, b.y, b.w, b.h, g => chuteFront(g, S.pts, S.col));
};

// ---------------------------------------------------------------------------------------------------------------
// The tube rides

const TUBE_TILE = 900;
const tubePts = (P: Path): [number, number][] => [[P.segs[0].x0, P.segs[0].y0], ...P.segs.map(s => [s.x1, s.y1] as [number, number])];
/** The bottomless drop under a ride (world y): a little under the lowest of its chute on screen (the chute's the same
 *  either side of the loop's carry back, so this is too). */
const CHUTE_PTS = TUBES.map(T => T.laps.map(l => l.pieces.flat()));
const dropTopAt = (i: number, x0: number, x1: number) => { let y = -Infinity; for (const [x, yy] of CHUTE_PTS[i][tubeLapNo(i)]) if (x > x0 && x < x1 && yy > y) y = yy; return y + 46; };
const dropTop = (state: GameState, T: Tube) => dropTopAt(TUBES.indexOf(T), state.camera.x - 120, state.camera.x + W + 120);
/** The drop on screen (the backdrop paints it: bands, then black), or null: no ride's drop in view. */
const dropRect = (state: GameState) => {
  for (let i = 0; i < TUBES.length; i++) {
    const [a, b] = tubeSpan(TUBES[i]);
    if (!vis(state, a, b, 0)) continue;
    const t = dropTopAt(i, state.camera.x - 120, state.camera.x + W + 120);
    if (!isFinite(t)) return null;
    const y = Math.round(t - state.camera.y);
    if (y >= H) return null;
    return { x0: Math.max(0, Math.round(a - state.camera.x)), x1: Math.min(W, Math.round(b - state.camera.x)), y: Math.max(0, y) };
  }
  return null;
};
const LEG_RAMP = ['#2A3442', '#1E2632', '#141A24', '#0B0F18'];
const inGap = (i: number, x: number, m = 0) => tubeLap(i).gaps.some(([a, b]) => x > a - m && x < b + m);
const drawTubeBack = (c: Ctx, state: GameState, T: Tube, i: number) => {
  const paths = tubePaths(i);
  const first = T.stairs.x, last = paths[paths.length - 1].segs[paths[paths.length - 1].segs.length - 1].x1;
  if (!vis(state, first - 40, last + 40)) return;
  const dt = dropTop(state, T);
  // (the tower up to the rack: its stairs, its deck (down into the drop where it stands out over it), the rack of tubes)
  if (vis(state, first - 40, T.deck.x2 + 40)) stamp(c, `wp-tubetower-${T.id}`, first - 20, T.deck.y - 120, T.deck.x2 - first + 60, GY - T.deck.y + 520, g => {
    for (let k = 0; k < T.stairs.n; k++) { const s = step(T.stairs, k); R(g, s.x, s.y, s.w, s.h, '#2E3644'); R(g, s.x, s.y, s.w, 3, '#E2E8F0'); }
    const d = T.deck;
    R(g, d.x1, d.y, d.x2 - d.x1, GY - d.y, '#2E3644'); R(g, d.x1, d.y, d.x2 - d.x1, 3, '#E2E8F0');
    for (let y = d.y + 20; y < GY; y += 24) R(g, d.x1, y, d.x2 - d.x1, 2, '#1E2430');
    // (its shaft on down into the dark)
    LEG_RAMP.forEach((col, k) => R(g, d.x1, GY + k * 100, d.x2 - d.x1, 100, col));
    // (the rack: tubes stacked up, the canopy)
    for (let k = 0; k < 4; k++) { g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.ellipse(d.x1 + 40, d.y - 10 - k * 14, 22, 7, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = ['#F97316', '#FACC15', '#22D3EE', '#EC4899'][k]; g.lineWidth = 6; g.stroke(); }
    R(g, d.x1 - 6, d.y - 110, d.x2 - d.x1 + 12, 10, INK); R(g, d.x1 - 4, d.y - 108, d.x2 - d.x1 + 8, 6, T.col);
    R(g, d.x1, d.y - 100, 4, 100, '#3F3F46'); R(g, d.x2 - 4, d.y - 100, 4, 100, '#3F3F46');
  });
  // (the chute's legs down into the drop, darker and darker till they're gone (live, plain boxes: a few a screen). None
  // under a gap: nothing under those at all)
  for (const P of paths) {
    const pts = tubePts(P), a = Math.max(pts[0][0], state.camera.x - 40), b = Math.min(pts[pts.length - 1][0], state.camera.x + W + 40);
    for (let x = Math.ceil(a / 160) * 160; x < b; x += 160) {
      if (inGap(i, x, 30)) continue;
      const y = pointAt(P, Math.max(0, x - pts[0][0])).y, bot = state.camera.y + H + 20;
      if (bot <= y + 10) continue;
      R(c, x - 16, y + 60, 32, 4, '#2A3442');
      for (let k = 0; k < LEG_RAMP.length; k++) {
        const y0 = y + 10 + k * 110, h = k === LEG_RAMP.length - 1 ? Math.min(bot, dt + 260) - y0 : 110;
        if (h > 0 && y0 < bot) { R(c, x - 4, y0, 8, h, LEG_RAMP[k]); if (k < 2) R(c, x - 4, y0, 2, h, k ? '#2E3848' : '#4A5466'); }
      }
    }
  }
  // (the chute: baked in tiles along its length; the ends at the gaps broken off, striped)
  for (let tx = Math.floor((state.camera.x - 60) / TUBE_TILE) * TUBE_TILE; tx < state.camera.x + W + 60; tx += TUBE_TILE) {
    if (tx + TUBE_TILE < T.deck.x2 - 40 || tx > last + 40) continue;
    const [y0, y1] = bandOf(paths.flatMap(tubePts), tx, TUBE_TILE);
    if (y1 < y0 || !visY(state, y0 - 60, y1 + 60)) continue;
    stamp(c, `wp-tube-${T.id}-${tubeLapNo(i)}-${tx}`, tx, y0 - 60, TUBE_TILE, y1 - y0 + 100, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 60, TUBE_TILE, y1 - y0 + 100); g.clip();
      paths.forEach((P, pi) => {
        chuteBack(g, tubePts(P), T.col, 26);
        // (each end at a gap: the last stretch striped yellow and black, the end itself snapped off ragged)
        const ends: [number, number][] = [];
        if (pi < paths.length - 1) ends.push([P.len - 64, P.len]);
        if (pi > 0) ends.push([0, 40]);
        for (const [s0, s1] of ends) {
          g.lineWidth = 9; g.lineCap = 'butt';
          for (let s = s0, k = 0; s < s1; s += 12, k++) { const q = pointAt(P, s), q2 = pointAt(P, Math.min(s1, s + 12)); g.strokeStyle = k % 2 ? INK : '#FACC15'; g.beginPath(); g.moveTo(q.x, q.y - 4); g.lineTo(q2.x, q2.y - 4); g.stroke(); }
          const e = pointAt(P, s0 === 0 ? 0 : P.len), d = s0 === 0 ? -1 : 1;
          g.fillStyle = INK; g.beginPath(); g.moveTo(e.x, e.y - 16); g.lineTo(e.x + d * 6, e.y - 10); g.lineTo(e.x - d * 2, e.y - 4); g.lineTo(e.x + d * 5, e.y + 2); g.lineTo(e.x - d * 3, e.y + 8); g.lineTo(e.x - d * 8, e.y + 8); g.lineTo(e.x - d * 8, e.y - 16); g.closePath(); g.fill();
          // (a bent bit of rebar sticking out of the break)
          g.strokeStyle = '#7A6A5A'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x, e.y - 2); g.lineTo(e.x + d * 10, e.y + 4); g.lineTo(e.x + d * 14, e.y + 14); g.stroke();
        }
      });
      g.restore();
    });
  }
  // (under each gap: the drop from the chute's own height down (where the chute's high, the drop's top on screen is well
  // under it): nothing under a gap but black)
  for (const [g1, g2] of tubeLap(i).gaps) {
    if (!vis(state, g1, g2, 0)) continue;
    const P = paths.find(q => Math.abs(q.segs[q.segs.length - 1].x1 - g1) < 1);
    if (!P) continue;
    const top = Math.round(pointAt(P, P.len).y + 14), bot = Math.min(dt, state.camera.y + H + 10);
    if (bot <= top) continue;
    const n = DROP_BANDS.length, step = (bot - top) / n;
    DROP_BANDS.forEach((col, k) => R(c, g1 + 2, top + k * step, g2 - g1 - 4, step + 1, col));
  }
  // (the GAP signs: hung over the chute off a cable, well before each gap)
  for (const [g1] of tubeLap(i).gaps) {
    const x = g1 - GAP_WARN;
    if (!vis(state, x - 80, x + 80)) continue;
    const P = paths.find(q => q.segs[0].x0 <= x && q.segs[q.segs.length - 1].x1 >= x);
    if (!P) continue;
    const y = pointAt(P, x - P.segs[0].x0).y - 160;
    stamp(c, `wp-gapsign-${T.id}-${g1}`, x - 60, y - 420, 120, 470, g => {
      R(g, x - 40, y - 420, 2, 420, '#3F4A5A'); R(g, x + 38, y - 420, 2, 420, '#3F4A5A');
      R(g, x - 52, y - 2, 104, 44, INK); R(g, x - 50, y, 100, 40, '#FACC15');
      for (let k = 0; k < 100; k += 16) { g.fillStyle = INK; g.beginPath(); g.moveTo(x - 50 + k, y + 40); g.lineTo(x - 42 + k, y + 40); g.lineTo(x - 34 + k, y + 34); g.lineTo(x - 42 + k, y + 34); g.closePath(); g.fill(); }
      text(g, 'GAP AHEAD', x, y + 14, INK, 7, 'center', null);
      text(g, 'JUMP!', x, y + 28, '#B91C1C', 8, 'center', null);
    });
    // (its warning lamps, blinking)
    const on = Math.floor(state.frame / 12) % 2 === 0;
    R(c, x - 56, y + 14, 6, 6, on ? '#EF4444' : '#450A0A'); R(c, x + 50, y + 14, 6, 6, on ? '#450A0A' : '#EF4444');
  }
};
/** The top and bottom of a chute's points in a tile (x tx..tx+w, a margin either side). */
const bandOf = (pts: [number, number][], tx: number, w: number): [number, number] => {
  let y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], nx = pts[i + 1]?.[0] ?? x, px = pts[i - 1]?.[0] ?? x;
    if (Math.max(x, nx, px) < tx - 40 || Math.min(x, nx, px) > tx + w + 40) continue;
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [y0, y1];
};
/** The tube chutes' near walls, the pipes end-on (in front of him). */
const drawTubeFront = (c: Ctx, state: GameState, T: Tube, i: number) => {
  const paths = tubePaths(i);
  for (let tx = Math.floor((state.camera.x - 60) / TUBE_TILE) * TUBE_TILE; tx < state.camera.x + W + 60; tx += TUBE_TILE) {
    const last = paths[paths.length - 1].segs[paths[paths.length - 1].segs.length - 1].x1;
    if (tx + TUBE_TILE < T.deck.x2 - 40 || tx > last + 40) continue;
    const [y0, y1] = bandOf(paths.flatMap(tubePts), tx, TUBE_TILE);
    if (y1 < y0 || !visY(state, y0 - 40, y1 + 40)) continue;
    stamp(c, `wp-tubef-${T.id}-${tubeLapNo(i)}-${tx}`, tx, y0 - 40, TUBE_TILE, y1 - y0 + 70, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 40, TUBE_TILE, y1 - y0 + 70); g.clip();
      for (const P of paths) chuteFront(g, tubePts(P), T.col);
      g.restore();
    });
  }
  // (the low pipes: end-on, striped, LOW on a sign under them; hung off a beam from above)
  for (const x of tubeLap(i).pipes) {
    if (!vis(state, x - 60, x + 60)) continue;
    const P = paths.find(q => q.segs[0].x0 <= x && q.segs[q.segs.length - 1].x1 >= x);
    if (!P) continue;
    const y = pointAt(P, x - P.segs[0].x0).y - PIPE_CLEAR - 12;
    stamp(c, `wp-pipe-${T.id}-${x}`, x - 40, y - 400, 80, 420, g => {
      R(g, x - 3, y - 400, 6, 400, '#3F4A5A');
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FACC15'; g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, 11, k * Math.PI / 2, k * Math.PI / 2 + Math.PI / 4); g.closePath(); g.fill(); }
      g.fillStyle = '#1E293B'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
      R(g, x - 22, y - 34, 44, 14, INK); R(g, x - 21, y - 33, 42, 12, '#FACC15'); text(g, 'LOW', x, y - 23, INK, 7, 'center', null);
    });
  }
};
/** The tube rides' count: the aliens left to kill (the ride goes round till they're all dead). In the top band. */
export const drawTubeHud = (c: Ctx, left: number, band: { x1: number; x2: number; mid: number }) => {
  const s = left > 0 ? `ALIENS LEFT: ${left}` : 'ALL DEAD: RIDE IT OUT';
  c.font = '8px "Press Start 2P"';
  const w = c.measureText(s).width + 16;
  R(c, band.mid - w / 2, 22, w, 16, 'rgba(10, 8, 6, 0.75)');
  text(c, s, band.mid, 34, left > 0 ? '#BEF264' : '#FDE047', 8);
};
/** The tube round him (its back half behind him, its front half over his legs). */
export const drawTubeRing = (c: Ctx, x: number, y: number, a: number, front: boolean, col = '#F97316') => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.strokeStyle = INK; c.lineWidth = 15;
  c.beginPath(); c.ellipse(0, -10, 30, 10, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); c.stroke();
  c.strokeStyle = col; c.lineWidth = 11; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -13, 26, 8, 0, front ? 0.3 : Math.PI + 0.3, front ? 1.2 : Math.PI + 1.2); c.stroke();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// MOUNT EVEREST BUT BETTER

const { TL, TR, FLOOR, DECK, CEIL } = TOWER;
/** Each floor's look (the owner's "make them visually distinct from one another and the doors"): its back wall, its
 *  tarp's print, its staff doors' paint, its accent (the queue's rope, the signs' boards). */
const THEME: { wall: string; band: string; tarp: string; door: string; accent: string }[] = [
  { wall: '#2A3448', band: '#4A5468', tarp: '#3A4A66', door: '#475569', accent: '#DC2626' },  // 0 BASE CAMP
  { wall: '#183048', band: '#2E5878', tarp: '#5AA0C8', door: '#0E7490', accent: '#22D3EE' },  // 1 KHUMBU ICEFALL
  { wall: '#33284A', band: '#54447A', tarp: '#7A60A8', door: '#7C3AED', accent: '#FACC15' },  // 2 CAMP 1
  { wall: '#26381F', band: '#46603A', tarp: '#6A8A4A', door: '#15803D', accent: '#F97316' },  // 3 CAMP 2
  { wall: '#2C3A5A', band: '#4E6290', tarp: '#C8D8EE', door: '#1D4ED8', accent: '#F8FAFC' },  // 4 THE LHOTSE FACE
  { wall: '#4A2A22', band: '#704234', tarp: '#A0604A', door: '#B45309', accent: '#FDE047' },  // 5 CAMP 3
  { wall: '#22222E', band: '#3A3A52', tarp: '#5A5A80', door: '#6D28D9', accent: '#4ADE80' },  // 6 CAMP 4
  { wall: '#141218', band: '#2A2430', tarp: '#4A3A4A', door: '#7F1D1D', accent: '#EF4444' },  // 7 THE DEATH ZONE
  { wall: '#3A2C3E', band: '#5A4460', tarp: '#9A8AA4', door: '#0F766E', accent: '#38BDF8' },  // 8 THE HILLARY STEP
  { wall: '#2A3448', band: '#4A5468', tarp: '#3A4A66', door: '#475569', accent: '#DC2626' },  // 9 THE SUMMIT
];
/** The queue's wait, posted on each floor (the owner's "like a queue for a ride"): sillier the higher he gets. */
const WAIT = ['', '45 MINUTES', '2 HOURS', '4 HOURS', '1 DAY', '3 DAYS', '2 WEEKS', 'A WHOLE SEASON', 'THE REST OF YOUR LIFE'];
/** An arrow on a board (dir: 1 right, -1 left, 0 up). */
const arrowGlyph = (g: Ctx, x: number, y: number, dir: number, col: string, s = 1) => {
  g.fillStyle = col; g.beginPath();
  if (dir === 0) { g.moveTo(x, y - 8 * s); g.lineTo(x + 7 * s, y); g.lineTo(x + 3 * s, y); g.lineTo(x + 3 * s, y + 8 * s); g.lineTo(x - 3 * s, y + 8 * s); g.lineTo(x - 3 * s, y); g.lineTo(x - 7 * s, y); }
  else { g.moveTo(x + dir * 9 * s, y); g.lineTo(x, y - 7 * s); g.lineTo(x, y - 3 * s); g.lineTo(x - dir * 8 * s, y - 3 * s); g.lineTo(x - dir * 8 * s, y + 3 * s); g.lineTo(x, y + 3 * s); g.lineTo(x, y + 7 * s); }
  g.closePath(); g.fill();
};
/** A run of queue stanchions and their sagging rope along a floor at y (background: no lit tops, nothing to stand on). */
const queueRail = (g: Ctx, x0: number, x1: number, y: number, rope: string) => {
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / 70));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    R(g, x - 2, y - 40, 4, 40, '#9CA3AF'); R(g, x - 5, y - 44, 10, 5, '#6B7280'); R(g, x - 7, y - 3, 14, 3, '#4B5563');
    if (i < n) { const nx = x0 + ((x1 - x0) * (i + 1)) / n; g.strokeStyle = rope; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 38); g.quadraticCurveTo((x + nx) / 2, y - 26, nx, y - 38); g.stroke(); }
  }
};
/** One floor (k) of the tower: its back wall, its props, its queue, its doors, its ceiling, its deck (lit). Baked once each. */
const paintFloor = (g: Ctx, k: number) => {
  const y = floorY(k), top = k < FLOORS ? floorY(k + 1) + CEIL : y - FLOOR, T = THEME[k];
  if (k < FLOORS) {
    // (the back wall, in the floor's own colors: scaffold behind a tarp printed with its stretch of the mountain)
    R(g, TL, top, TR - TL, y - top, T.wall);
    for (let yy = top; yy < y; yy += 6) if (((yy - top) / 6) % 2) checker(g, TL, yy, TR - TL, 2, T.band);
    g.fillStyle = T.tarp; g.beginPath(); g.moveTo(TL, y); g.lineTo(TL + 160 + k * 23, top + 50); g.lineTo(TL + 330, top + 100); g.lineTo(TL + 480 + k * 11, top + 26); g.lineTo(TR, y); g.closePath(); g.fill();
    g.fillStyle = '#E8F0FA'; g.beginPath(); g.moveTo(TL + 120 + k * 23, top + 74); g.lineTo(TL + 160 + k * 23, top + 50); g.lineTo(TL + 200 + k * 23, top + 74); g.closePath(); g.fill();
    for (let x = TL; x <= TR; x += 100) R(g, x - 3, top, 6, y - top, T.band);
    g.strokeStyle = T.band; g.lineWidth = 2;
    for (let x = TL; x < TR; x += 100) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 100, top + 20); g.stroke(); }
    // (the ceiling: the deck over's underside, I-beams, a work lamp in a cage every so far: the room's lid)
    const cy0 = floorY(k + 1) + DECK;
    R(g, TL, cy0, TR - TL, CEIL - DECK, '#1A1E28');
    for (let x = TL + 20; x < TR; x += 80) { R(g, x, cy0, 12, CEIL - DECK, '#2C3342'); R(g, x + 2, cy0, 3, CEIL - DECK, '#3E4658'); }
    R(g, TL, top - 6, TR - TL, 6, '#0C0E14'); R(g, TL, top - 8, TR - TL, 2, '#3E4658');
    for (let x = TL + 140; x < TR; x += 260) { R(g, x - 10, top, 20, 8, '#3F3F46'); R(g, x - 7, top + 8, 14, 7, '#FDE68A'); R(g, x - 8, top + 8, 16, 1, '#3F3F46'); }
    // (prayer flags strung across under the ceiling: before the props, so the signs on the wall are in front of them, never crossed)
    const sy = top + 14;
    g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; g.beginPath(); g.moveTo(TL, sy); g.quadraticCurveTo((TL + TR) / 2, sy + 20, TR, sy); g.stroke();
    for (let x = TL + 20; x < TR - 10; x += 26) { const t = (x - TL) / (TR - TL), fy = sy + 20 * 4 * t * (1 - t); R(g, x, fy, 14, 14, ['#2563EB', '#F8FAFC', '#DC2626', '#16A34A', '#FACC15'][Math.floor(x / 26) % 5]); }
    // (its props: what's up there of the real mountain, in plastic)
    themeProps(g, k, y, top);
    // (the floor's name and its height, up on the wall, readable)
    R(g, (TL + TR) / 2 - 130, top + 40, 260, 40, INK); R(g, (TL + TR) / 2 - 128, top + 42, 256, 36, '#7C2D12');
    text(g, FLOOR_NAMES[k], (TL + TR) / 2, top + 58, '#FEF3C7', 10);
    text(g, `ELEV. ${FLOOR_FT[k].toLocaleString('en-US')} FT`, (TL + TR) / 2, top + 72, '#FDE68A', 7);
    // (the queue (the owner's "like a queue for a ride"): rails along the back toward the way up, its signs: an
    // overhead QUEUE CONTINUES and its arrow by the way up, the wait from here on a post)
    {
      const s = exitSide(k), from = s > 0 ? TL + 60 : TR - 60, to = s > 0 ? TR - 70 : TL + 70;
      queueRail(g, from, to, y - 4, T.accent);
      const hx = s > 0 ? TR - 160 : TL + 160;
      R(g, hx - 50, top, 2, 24, '#9CA3AF'); R(g, hx + 48, top, 2, 24, '#9CA3AF');
      R(g, hx - 62, top + 24, 124, 34, INK); R(g, hx - 60, top + 26, 120, 30, '#FDE047');
      text(g, k < FLOORS - 1 ? 'QUEUE CONTINUES' : 'TO THE SUMMIT', hx, top + 38, INK, 6, 'center', null);
      arrowGlyph(g, hx + s * 30, top + 48, s, '#B91C1C', 0.9); arrowGlyph(g, hx - s * 8, top + 48, 0, '#B91C1C', 0.7);
      if (WAIT[k]) {
        const wx = (TL + TR) / 2 + (s > 0 ? -190 : 190);
        R(g, wx - 2, y - 150, 4, 150, '#6B7280');
        R(g, wx - 66, y - 200, 132, 52, INK); R(g, wx - 64, y - 198, 128, 48, '#F8FAFC'); R(g, wx - 64, y - 198, 128, 12, T.accent === '#F8FAFC' ? '#1D4ED8' : T.accent);
        text(g, 'WAIT FROM THIS POINT', wx, y - 189, INK, 5, 'center', null);
        text(g, WAIT[k], wx, y - 172, '#B91C1C', WAIT[k].length > 12 ? 6 : 8, 'center', null);
        text(g, 'THANK YOU FOR YOUR PATIENCE', wx, y - 158, '#475569', 4, 'center', null);
      }
    }
    // (the staff doors at the back: doorways, not wall: a frame in the floor's accent, the door in its own paint, a
    // window, a kick plate, STAFF ONLY over it)
    if (k > 0) for (const dx of DOORS_X) {
      R(g, dx - 34, y - 112, 68, 112, INK); R(g, dx - 32, y - 110, 64, 110, T.accent); R(g, dx - 26, y - 104, 52, 104, '#0B0D12');
      R(g, dx - 24, y - 102, 48, 102, T.door); R(g, dx - 24, y - 102, 48, 3, 'rgba(255,255,255,0.2)');
      R(g, dx - 12, y - 92, 24, 16, '#0F172A'); R(g, dx - 10, y - 90, 20, 12, '#334155'); R(g, dx - 10, y - 90, 20, 2, '#94A3B8');
      for (let i = 0; i < 6; i++) R(g, dx - 24 + i * 8, y - 18, 4, 14, i % 2 ? INK : '#FACC15');
      R(g, dx + 14, y - 56, 5, 5, '#FACC15');
      R(g, dx - 30, y - 126, 60, 14, INK); R(g, dx - 29, y - 125, 58, 12, '#F8FAFC'); text(g, 'STAFF ONLY', dx, y - 116, '#B91C1C', 5, 'center', null);
    }
    // (the way down, on the left, where he came in: a plainer arch, its sign)
    if (k > 0) { const ex = TL + 22; R(g, ex - 20, y - 130, 40, 130, INK); R(g, ex - 16, y - 126, 32, 126, '#05070C'); R(g, ex - 14, y - 152, 70, 18, INK); R(g, ex - 12, y - 150, 66, 14, '#475569'); text(g, 'WAY DOWN', ex + 21, y - 140, '#E2E8F0', 5, 'center', null); }
    // (the way up: an archway in the side wall at its edge, striped like a queue's entrance, its sign over it)
    {
      const s = exitSide(k), ex = s > 0 ? TR - 22 : TL + 22;
      R(g, ex - 22, y - 140, 44, 140, INK); R(g, ex - 18, y - 136, 36, 136, '#05070C');
      for (let yy = y - 136; yy < y; yy += 14) { R(g, ex - 22, yy, 4, 7, T.accent); R(g, ex + 18, yy + 7, 4, 7, T.accent); }
      R(g, ex - 44 - s * 10, y - 170, 88, 22, INK); R(g, ex - 42 - s * 10, y - 168, 84, 18, '#15803D');
      text(g, 'WAY UP', ex - s * 10 - 8, y - 156, '#F0FDF4', 6, 'center', null); arrowGlyph(g, ex - s * 10 + 26, y - 159, s, '#F0FDF4', 0.7);
    }
  }
  // (the ledges: crates of fake snow, oxygen tank racks: lit lips)
  for (const [x, h, w] of FLOOR_LEDGES[k]) {
    const ly = y - h;
    R(g, x + 8, ly + 16, 4, h - 16, '#64748B'); R(g, x + w - 12, ly + 16, 4, h - 16, '#64748B');
    g.strokeStyle = '#475569'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 10, ly + 20); g.lineTo(x + w - 10, y - 4); g.stroke();
    for (let t = x + 14; t < x + w - 20; t += 40) { R(g, t, ly - 22, 10, 22, '#16A34A'); R(g, t, ly - 22, 10, 3, '#86EFAC'); R(g, t + 3, ly - 26, 4, 4, '#94A3B8'); }
    R(g, x, ly, w, 16, INK); R(g, x + 1, ly + 1, w - 2, 14, '#8A6A3A'); R(g, x + 1, ly + 1, w - 2, 3, '#FDE68A');
    g.fillStyle = '#F1F5F9'; g.beginPath(); g.ellipse(x + w * 0.7, ly, w * 0.18, 5, 0, Math.PI, 0); g.fill();
  }
  // (the deck under it: steel, lit along its top: standable reads standable)
  if (k > 0) { R(g, TL, y, TR - TL, DECK, '#3A4252'); R(g, TL, y, TR - TL, 3, '#F1F5F9'); R(g, TL, y + 3, TR - TL, 2, '#94A3B8'); for (let x = TL; x < TR; x += 40) R(g, x, y + 8, 2, DECK - 8, '#262C38'); }
};
/** What's on each floor of the real mountain, done in plastic (background: dimmed, nothing to stand on). */
const themeProps = (g: Ctx, k: number, y: number, top: number) => {
  const tent = (x: number, col: string, w = 90) => { g.fillStyle = INK; g.beginPath(); g.moveTo(x - w / 2 - 3, y); g.lineTo(x, y - w * 0.62 - 3); g.lineTo(x + w / 2 + 3, y); g.closePath(); g.fill(); g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x, y - w * 0.62); g.lineTo(x + w / 2, y); g.closePath(); g.fill(); g.fillStyle = '#0B0D12'; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x, y - 26); g.lineTo(x + 10, y); g.closePath(); g.fill(); };
  const tank = (x: number, yy: number) => { R(g, x, yy - 24, 9, 24, '#B45309'); R(g, x, yy - 24, 9, 3, '#FDBA74'); R(g, x + 2, yy - 28, 5, 4, '#94A3B8'); };
  switch (k) {
    case 1: // (the icefall: blocks of fake ice, the ladders laid over the crevasses)
      for (const [x, w, h] of [[TL + 250, 90, 70], [TL + 440, 70, 100], [TR - 260, 110, 60]]) { g.fillStyle = '#9CC8E4'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y - h); g.lineTo(x + w - 14, y - h - 12); g.lineTo(x + w, y); g.closePath(); g.fill(); }
      for (const x of [TL + 340, TR - 360]) { R(g, x, y - 6, 80, 3, '#CBD5E1'); for (let t = x; t < x + 80; t += 10) R(g, t, y - 9, 2, 6, '#CBD5E1'); }
      break;
    case 2: tent(TL + 260, '#FACC15'); tent(TL + 480, '#F97316', 70); tent(TR - 250, '#EAB308', 100); break;
    case 3: // (camp 2: the mess tent, its pots, its sign)
      tent(TL + 300, '#16A34A', 140); R(g, TL + 470, y - 40, 60, 40, '#475569'); R(g, TL + 478, y - 52, 18, 12, '#94A3B8'); R(g, TL + 502, y - 50, 20, 10, '#94A3B8');
      R(g, TL + 260, y - 246, 80, 18, INK); R(g, TL + 261, y - 245, 78, 16, '#F8FAFC'); text(g, 'MESS TENT', TL + 300, y - 234, INK, 5, 'center', null);
      break;
    case 4: // (the Lhotse face: a steep wall of fake ice up the back, fixed ropes down it)
      g.fillStyle = '#B8CCE4'; g.beginPath(); g.moveTo(TL + 200, y); g.lineTo(TL + 520, top + 30); g.lineTo(TL + 620, top + 30); g.lineTo(TL + 380, y); g.closePath(); g.fill();
      g.strokeStyle = '#DC2626'; g.lineWidth = 2; for (const o of [0, 40]) { g.beginPath(); g.moveTo(TL + 260 + o, y); g.lineTo(TL + 560 + o, top + 34); g.stroke(); }
      break;
    case 5: tent(TL + 230, '#F97316', 80); tent(TL + 380, '#DC2626', 80); tent(TR - 300, '#F97316', 110); break;
    case 6: // (camp 4, the south col: oxygen bottles, piles of them)
      for (let i = 0; i < 9; i++) tank(TL + 220 + (i % 5) * 14 + Math.floor(i / 5) * 7, y - Math.floor(i / 5) * 24);
      for (let i = 0; i < 7; i++) tank(TR - 320 + (i % 4) * 14, y - Math.floor(i / 4) * 24);
      R(g, TL + 420, y - 90, 100, 18, INK); R(g, TL + 421, y - 89, 98, 16, '#F8FAFC'); text(g, 'SOUTH COL', TL + 470, y - 78, INK, 5, 'center', null);
      break;
    case 7: { // (the death zone: frozen mannequins in climbing gear, the famous green boots; a warning)
      for (const [x, f] of [[TL + 260, 1], [TR - 300, -1]] as const) { R(g, x - 30 * f, y - 14, 60 * f, 12, '#475569'); R(g, x + 22 * f, y - 18, 10 * f, 16, '#E2E8F0'); R(g, x - 36 * f, y - 10, 10 * f, 10, '#22C55E'); }
      R(g, TL + 60, y - 252, 140, 34, INK); R(g, TL + 62, y - 250, 136, 30, '#FDE047'); text(g, 'DEATH ZONE', TL + 130, y - 239, INK, 7, 'center', null); text(g, 'NO REFUNDS', TL + 130, y - 226, '#B91C1C', 5, 'center', null);
      break;
    }
    case 8: // (the Hillary step: the big rock step at the back, ONE AT A TIME)
      g.fillStyle = '#6B5E4E'; g.beginPath(); g.moveTo(TL + 240, y); g.lineTo(TL + 260, y - 120); g.lineTo(TL + 420, y - 130); g.lineTo(TL + 440, y - 60); g.lineTo(TL + 560, y - 60); g.lineTo(TL + 580, y); g.closePath(); g.fill();
      R(g, TL + 300, y - 170, 140, 20, INK); R(g, TL + 301, y - 169, 138, 18, '#F8FAFC'); text(g, 'ONE AT A TIME, PLEASE', TL + 370, y - 157, INK, 5, 'center', null);
      break;
  }
  // (dimmed: behind the play, nothing to stand on)
  g.fillStyle = 'rgba(6, 8, 16, 0.18)'; g.fillRect(TL, top, TR - TL, y - top);
};
const drawTower = (c: Ctx, state: GameState, gates: number[], tells: { x: number; t: number }[], lockedFloor: number | null, ox = 0) => {
  if (!vis(state, TL + ox, TR + ox, ox ? 0 : 60)) return;
  if (ox) { c.save(); c.translate(ox, 0); }
  for (let k = 0; k <= FLOORS; k++) {
    const y = floorY(k);
    if (!visY(state, y - FLOOR - 40, y + CEIL + 40)) continue;
    stamp(c, `wp-floor-${k}`, TL - 4, y - FLOOR - 4, TR - TL + 8, FLOOR + DECK + 8, g => paintFloor(g, k));
    // (the way up's gate: shut till the floor's clear, then it swings up; the way up's light, green once it's open)
    if (k < FLOORS) {
      const s = exitSide(k), gx = s > 0 ? TR - 6 : TL - 6, lift = gates[k] ?? 0;
      if (lift < 0.98) { R(c, gx, y - 100 + lift * 90, 12, 100 - lift * 90, INK); for (let yy = y - 96 + lift * 90; yy < y; yy += 12) R(c, gx + 2, yy, 8, 2, '#DC2626'); }
      const ex = s > 0 ? TR - 22 : TL + 22, on = lift > 0.9;
      R(c, ex - 4, y - 146, 8, 4, on ? (Math.floor(state.frame / 15) % 2 ? '#4ADE80' : '#16A34A') : '#7F1D1D');
    }
    if (k === lockedFloor && !ox) for (const t of tells) {
      const on = (t.t >> 2) % 2 === 0;
      R(c, t.x - 24 + (on ? 2 : -2), y - 102, 48, 102, on ? '#64748B' : '#334155');
      steppedGlow(c, t.x, y - 112, 14, '#F87171', 0.6, 0.1, 3);
    }
  }
  if (ox) c.restore();
};
/** The mountain's outside, round which the spiral goes (the owner's: "the 'rotating tower' thing should sell the idea of
 *  climbing the mountain or rather, a weird floridian tacky facismile of it"): fiberglass rock with its seams and bolts,
 *  fake snow (paint, foam, cotton) patchy and sun-faded, more of it and colder the higher, plastic icicles, prayer flags
 *  between scaffold poles, the warm Florida night through the gaps (a palm, the back of an AC unit, pipes), its tacky
 *  signs and statues; and the queue: the spiral's steps, its stanchions and rope, its signs. Band k: floor k up to k+1. */
const FACE_SIGNS: [string, string][] = [
  ['BASE CAMP', 'GIFT SHOP >'], ['KHUMBU ICEFALL', '(FIBERGLASS)'], ['OXYGEN BAR', '$12 A HUFF'], ['CAMP 2', 'NOW A GIFT SHOP'],
  ['YETI SIGHTINGS', 'DAILY 7PM'], ['SHERPA PHOTO', '$25'], ['CREVASSE', '(DECAL)'], ['DEATH ZONE', 'PHOTO OP $40'], ['ALMOST THERE!', '(NOT REALLY)'],
];
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const paintFace = (g: Ctx, k: number, cx0 = -1e9, cx1 = 1e9, cy0 = -1e9, cy1 = 1e9) => {
  const x0 = TR, x1 = TR + FACE, yb = floorY(k) + DECK, yt = floorY(k + 1), t = k / (FLOORS - 1);
  const hsh = (n: number) => hash(n * 3.7 + k * 17.3);
  // (the fake rock: warm tan fiberglass low down, colder and bluer up high; banded)
  const ramp = [mixHex('#8A7258', '#6E7E96', t), mixHex('#76604A', '#5C6C86', t), mixHex('#5E4C3A', '#4A5874', t)];
  R(g, x0, yt, FACE, yb - yt, ramp[1]);
  for (let yy = yt; yy < yb; yy += 30) R(g, x0, yy, FACE, 10, ramp[0]);
  // (the dither rows only where this tile is: the rest is clipped, and a row of it is hundreds of fills)
  for (let yy = yt + 20; yy < yb; yy += 30) if (yy + 4 > cy0 && yy < cy1) { const a = Math.max(x0, Math.floor((cx0 - x0) / 4) * 4 + x0), b = Math.min(x1, cx1 + 4); checker(g, a, yy, b - a, 4, ramp[2]); }
  // (facets: rock shapes moulded in, a lit top on each)
  for (let i = 0; i < 9; i++) {
    const fx = x0 + hsh(i) * (FACE - 120), fy = yt + 30 + hsh(i + 9) * (yb - yt - 120), w = 70 + hsh(i + 3) * 90, h = 40 + hsh(i + 5) * 60;
    g.fillStyle = ramp[2]; g.beginPath(); g.moveTo(fx, fy + h); g.lineTo(fx + w * 0.2, fy); g.lineTo(fx + w * 0.7, fy - 8); g.lineTo(fx + w, fy + h); g.closePath(); g.fill();
    g.fillStyle = ramp[0]; g.beginPath(); g.moveTo(fx + w * 0.2, fy); g.lineTo(fx + w * 0.7, fy - 8); g.lineTo(fx + w * 0.62, fy + 6); g.lineTo(fx + w * 0.26, fy + 10); g.closePath(); g.fill();
  }
  // (the panels' seams and their bolts: it's a shell)
  for (let x = x0 + 120; x < x1; x += 160) { R(g, x, yt, 2, yb - yt, '#2A2018'); for (let yy = yt + 14; yy < yb; yy += 40) R(g, x - 3, yy, 3, 3, '#A8A29E'); }
  for (let yy = yt + 90; yy < yb; yy += 120) { R(g, x0, yy, FACE, 2, '#2A2018'); for (let x = x0 + 30; x < x1; x += 60) R(g, x, yy - 3, 3, 3, '#A8A29E'); }
  // (a gap in the shell: the warm Florida night behind it, a palm, the scaffold, an AC unit, its pipes)
  if (k < 6) {
    const gx = x0 + 80 + hsh(21) * (FACE - 260), gy = yt + 40 + hsh(22) * 80;
    R(g, gx - 3, gy - 3, 126, 96, '#1A1410'); R(g, gx, gy, 120, 90, '#1A2448'); R(g, gx, gy + 60, 120, 30, '#2A2A40');
    for (let i = 0; i < 6; i++) R(g, gx + hsh(30 + i) * 114, gy + 4 + hsh(40 + i) * 40, 2, 2, '#F6C860');
    g.strokeStyle = '#0E1A12'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx + 30, gy + 90); g.quadraticCurveTo(gx + 34, gy + 50, gx + 44, gy + 28); g.stroke();
    for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * 0.6; g.beginPath(); g.moveTo(gx + 44, gy + 28); g.lineTo(gx + 44 + Math.cos(a) * 26, gy + 34 + Math.sin(a) * 14); g.stroke(); }
    R(g, gx + 60, gy, 4, 90, '#4A5468'); R(g, gx + 60, gy + 40, 60, 4, '#4A5468');
    R(g, gx + 74, gy + 56, 40, 30, '#9CA3AF'); R(g, gx + 78, gy + 60, 32, 22, '#6B7280'); for (let i = 0; i < 4; i++) R(g, gx + 80, gy + 62 + i * 5, 28, 2, '#4B5563');
    R(g, gx + 100, gy + 30, 4, 26, '#B45309'); R(g, gx + 100, gy + 30, 20, 4, '#B45309');
  }
  // (the fake snow: white paint, spray foam, cotton batting, patchy and gone yellow at the edges; more the higher)
  const snowN = 3 + k * 2;
  for (let i = 0; i < snowN; i++) {
    const sx = x0 + hsh(50 + i) * (FACE - 80), sy = yt + hsh(60 + i) * (yb - yt - 30), w = 50 + hsh(70 + i) * 110;
    g.fillStyle = mixHex('#C8B890', '#A8B8CC', t); g.beginPath(); g.ellipse(sx + w / 2, sy, w / 2 + 3, 13, 0, Math.PI, 0); g.fill();
    g.fillStyle = mixHex('#D8D0B4', '#C8D4E4', t); g.beginPath(); g.ellipse(sx + w / 2, sy, w / 2 - 4, 9, 0, Math.PI, 0); g.fill();
    // (plastic icicles under it, up high)
    if (k >= 3) for (let j = 0; j < 4; j++) { const ix = sx + 8 + (j / 4) * (w - 16), il = 8 + hsh(90 + i * 4 + j) * 14; g.fillStyle = '#C8E4F8'; g.beginPath(); g.moveTo(ix - 3, sy + 1); g.lineTo(ix + 3, sy + 1); g.lineTo(ix, sy + il); g.closePath(); g.fill(); }
  }
  // (prayer flags strung between two scaffold poles sticking out of it)
  { const py = yt + 40 + hsh(100) * 60, pa = x0 + 60 + hsh(101) * 200, pb = pa + 260;
    R(g, pa - 2, py - 10, 4, 70, '#64748B'); R(g, pb - 2, py - 10, 4, 70, '#64748B');
    g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; g.beginPath(); g.moveTo(pa, py); g.quadraticCurveTo((pa + pb) / 2, py + 22, pb, py); g.stroke();
    for (let x = pa + 10; x < pb - 8; x += 22) { const u = (x - pa) / (pb - pa); R(g, x, py + 22 * 4 * u * (1 - u), 12, 12, ['#2563EB', '#F8FAFC', '#DC2626', '#16A34A', '#FACC15'][Math.floor(x / 22) % 5]); } }
  // (its statue: the yeti mascot, paint peeling; or the sherpa animatronic, a seized arm up; or neither)
  if (k === 4 || k === 1) {
    const sx = x0 + FACE - 170, sy = yb - 30;
    g.fillStyle = '#E2E8F0'; g.beginPath(); g.ellipse(sx, sy - 50, 30, 46, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(sx, sy - 104, 20, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 7; i++) R(g, sx - 24 + hsh(110 + i) * 44, sy - 120 + hsh(120 + i) * 100, 8, 6, '#8A7A6A');
    R(g, sx - 9, sy - 110, 5, 4, INK); R(g, sx + 4, sy - 110, 5, 4, INK); R(g, sx - 8, sy - 98, 16, 4, '#7F1D1D');
    R(g, sx - 34, sy - 4, 68, 8, '#57534E'); text(g, 'DO NOT CLIMB', sx, sy + 3, '#FDE68A', 4, 'center', null);
  }
  if (k === 5) {
    const sx = x0 + 150, sy = yb - 30;
    R(g, sx - 12, sy - 90, 24, 60, '#B91C1C'); R(g, sx - 10, sy - 30, 8, 30, '#3F3F46'); R(g, sx + 2, sy - 30, 8, 30, '#3F3F46');
    g.fillStyle = '#C08A5A'; g.beginPath(); g.arc(sx, sy - 102, 12, 0, Math.PI * 2); g.fill(); R(g, sx - 12, sy - 116, 24, 8, '#FACC15');
    R(g, sx + 12, sy - 128, 6, 40, '#B91C1C'); R(g, sx + 12, sy - 134, 6, 6, '#C08A5A'); R(g, sx - 26, sy - 80, 14, 34, '#4B5563');
    R(g, sx - 30, sy - 4, 60, 8, '#57534E'); text(g, 'OUT OF ORDER', sx, sy + 3, '#FDE68A', 4, 'center', null);
  }
  if (k === 6) { g.fillStyle = '#0A1428'; g.beginPath(); g.moveTo(x0 + 280, yb - 40); g.lineTo(x0 + 330, yb - 70); g.lineTo(x0 + 420, yb - 60); g.lineTo(x0 + 470, yb - 34); g.lineTo(x0 + 380, yb - 44); g.closePath(); g.fill(); R(g, x0 + 290, yb - 72, 24, 3, '#F8FAFC'); }
  // (its tacky sign, bolted flat to the rock on brackets (nothing under it to stand posts on): readable)
  { const [l1, l2] = FACE_SIGNS[k] ?? FACE_SIGNS[0], sx = x0 + FACE * 0.68, sy = yb - 150;
    for (const bx of [sx - 52, sx + 44]) { R(g, bx, sy - 8, 8, 20, '#3F3A36'); R(g, bx + 1, sy - 8, 2, 8, '#78716C'); R(g, bx + 2, sy - 5, 3, 3, '#A8A29E'); }
    R(g, sx - 66, sy - 2, 132, 44, INK); R(g, sx - 64, sy, 128, 40, '#BE185D'); R(g, sx - 64, sy, 128, 3, '#F9A8D4');
    text(g, l1, sx, sy + 16, '#FEF3C7', 7, 'center', null); text(g, l2, sx, sy + 30, '#FDE68A', 6, 'center', null); }
  // (the shell's cut edges either side, where the inside's in: dark, its rim)
  R(g, x0, yt, 10, yb - yt, '#120E0A'); R(g, x0 + 10, yt, 2, yb - yt, '#5E4C3A'); R(g, x1 - 10, yt, 10, yb - yt, '#120E0A'); R(g, x1 - 12, yt, 2, yb - yt, '#5E4C3A');
  // (the queue up the spiral: its steps, lit along their tops; stanchions every other one and their rope; a sign half
  // way, QUEUE CONTINUES and the way)
  const ax = TR + 10, ay = floorY(k), bx = TR + FACE - 10, by = floorY(k + 1), n = 28, T = THEME[k];
  g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(ax, ay + 8); g.lineTo(bx, by + 8); g.stroke();
  g.strokeStyle = '#3A4252'; g.lineWidth = 10; g.stroke();
  for (let i = 0; i < n; i++) {
    const u = i / n, x = ax + (bx - ax) * u, yy = ay + (by - ay) * u, w = (bx - ax) / n + 3;
    R(g, x - 1, yy - 4, w, 8, '#64748B'); R(g, x - 1, yy - 4, w, 2, '#E2E8F0');
    if (i % 2 === 0) { R(g, x + 2, yy - 44, 4, 40, '#9CA3AF'); R(g, x - 1, yy - 48, 10, 5, '#6B7280'); }
  }
  g.strokeStyle = T.accent; g.lineWidth = 3; g.beginPath(); g.moveTo(ax + 4, ay - 42); g.lineTo(bx + 4, by - 42); g.stroke();
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  R(g, mx - 1, my - 120, 2, 76, '#9CA3AF'); R(g, mx - 62, my - 150, 124, 32, INK); R(g, mx - 60, my - 148, 120, 28, '#FDE047');
  text(g, 'QUEUE CONTINUES', mx - 8, my - 130, INK, 6, 'center', null); arrowGlyph(g, mx + 46, my - 134, 1, '#B91C1C', 0.7);
  if (WAIT[k + 1]) { const wy = my - 210; R(g, mx + 140, wy + 32, 2, my - 40 - (wy + 32) - 30, '#9CA3AF'); R(g, mx + 80, wy, 124, 34, INK); R(g, mx + 82, wy + 2, 120, 30, '#F8FAFC'); text(g, 'WAIT FROM HERE', mx + 142, wy + 13, INK, 5, 'center', null); text(g, WAIT[k + 1], mx + 142, wy + 26, '#B91C1C', 5, 'center', null); }
};
const FACE_TW = 204, FACE_TH = 197;
const drawFace = (c: Ctx, state: GameState, ox: number) => {
  if (!vis(state, TR + ox, TR + FACE + ox, 0)) return;
  for (let k = 0; k < FLOORS; k++) {
    // (each band from its own top: what of it pokes up over that (its top stanchions, a sign's top) is under the next
    // band's rock, put down after it, so it's not put down at all; but the top band's, under the open sky)
    const yt = floorY(k + 1), yb = floorY(k) + DECK, y0 = k === FLOORS - 1 ? yt - 60 : yt;
    if (!visY(state, y0, yb + 10, 0)) continue;
    // (in tiles: only what's on screen put down, the big stamp's cost was in what wasn't)
    c.save(); c.translate(ox, 0);
    for (let tx = TR - 4; tx < TR + FACE + 4; tx += FACE_TW) for (let ty = y0; ty < yb + 10; ty += FACE_TH) {
      const w = Math.min(FACE_TW, TR + FACE + 4 - tx), h = Math.min(FACE_TH, yb + 10 - ty);
      if (!vis(state, tx + ox, tx + ox + w, 0) || !visY(state, ty, ty + h, 0)) continue;
      stamp(c, `wp-face-${k}-${tx}-${ty}`, tx, ty, w, h, g => { g.save(); g.beginPath(); g.rect(tx, ty, w, h); g.clip(); paintFace(g, k, tx, tx + w, ty, ty + h); g.restore(); });
    }
    c.restore();
  }
};
/** The summit: the peak's snow, the flag, the slide's mouth on its right, its sign. */
const drawSummit = (c: Ctx, state: GameState) => {
  const { TL, TR } = TOWER;
  // (the summit: the peak's snow, the flag, the slide's mouth on its right, its sign)
  const sy = SUMMIT.y;
  if (visY(state, sy - 300, sy + 40)) {
    stamp(c, 'wp-summit', TL - 60, sy - 330, TR - TL + 260, 340, g => {
      g.fillStyle = '#E8F0FA'; g.beginPath(); g.moveTo(TL, sy); g.lineTo(TL + 300, sy - 140); g.lineTo(TL + 400, sy - 240); g.lineTo(TL + 470, sy - 150); g.lineTo(TR, sy); g.closePath(); g.fill();
      g.fillStyle = '#C8D4E4'; g.beginPath(); g.moveTo(TL + 400, sy - 240); g.lineTo(TL + 470, sy - 150); g.lineTo(TR, sy); g.lineTo(TL + 420, sy); g.closePath(); g.fill();
      R(g, TL + 398, sy - 300, 4, 62, '#3F3F46'); R(g, TL + 402, sy - 300, 46, 26, '#DC2626'); text(g, 'SUMMIT', TL + 425, sy - 283, '#F8FAFC', 6);
      // (its sign, stood on the deck on its posts, at the snow's foot: readable over the kid's head)
      // (a board deep enough that the far-off SPACE NEEDLE 2's saucer's all behind it, none of its letters poking out under)
      R(g, TL + 150, sy - 98, 5, 98, '#3F3F46'); R(g, TL + 245, sy - 98, 5, 98, '#3F3F46');
      R(g, TL + 100, sy - 160, 200, 62, INK); R(g, TL + 102, sy - 158, 196, 58, '#7C2D12'); R(g, TL + 102, sy - 158, 196, 3, '#A8502A');
      text(g, 'THE SUMMIT', TL + 200, sy - 140, '#FEF3C7', 9); text(g, 'ELEV. 1,000 FT', TL + 200, sy - 125, '#FDE68A', 7); text(g, '(ROUGHLY)', TL + 200, sy - 110, '#FDBA74', 5);
      // (the slide's mouth: its arch, its sign)
      const mx = SUMMIT.mouthX;
      R(g, mx - 20, sy - 150, 10, 150, INK); R(g, mx + 100, sy - 150, 10, 150, INK);
      R(g, mx - 30, sy - 170, 150, 26, INK); R(g, mx - 28, sy - 168, 146, 22, '#0891B2'); text(g, 'THE BIG ONE', mx + 45, sy - 153, '#F8FAFC', 7);
      // (the deck's lit top over the summit)
      R(g, TL, sy, TR - TL, 3, '#F8FAFC');
    });
  }
};
/** The summit's door (on its left, at the top of the Hillary Step's stairs): up, or kicked in flat. */
const drawSummitDoor = (c: Ctx, state: GameState, down: number, ox = 0) => {
  const sy = SUMMIT.y, x = TL;
  if (!visY(state, sy - 200, sy + 20) || !vis(state, x - 100 + ox, x + 100 + ox)) return;
  // (its frame; the door up in it, or going over inward (squashed toward the deck, not turned: stamped either way),
  // flat on the deck at the last)
  stamp(c, 'wp-sdoor-frame', x - 16, sy - 142, 32, 144, g => { R(g, x - 14, sy - 132, 10, 132, INK); R(g, x + 4, sy - 132, 10, 132, INK); R(g, x - 14, sy - 140, 28, 10, INK); });
  if (down >= 1) { stamp(c, 'wp-sdoor-flat', x + 4, sy - 14, 132, 16, g => { R(g, x + 6, sy - 12, 128, 12, '#7C2D12'); R(g, x + 6, sy - 12, 128, 2, '#A8502A'); }); return; }
  const k = Math.max(0.06, Math.cos(Math.min(1, down) * Math.PI / 2));
  c.save(); c.translate(x, sy); c.scale(1, k); c.translate(-x, -sy);
  stamp(c, 'wp-sdoor', x - 8, sy - 130, 16, 132, g => { R(g, x - 6, sy - 128, 12, 128, '#7C2D12'); R(g, x - 2, sy - 70, 4, 4, '#FACC15'); });
  c.restore();
};
/** Where the descent's behind the mountain (the spiral's world: its outside face, the inside drawn round again past
 *  it): from the tower's right wall round to where the spiral comes in again. Till the kid's dead (the descent's
 *  ridden: then there's no face out there, just the slide in the open), what of the slide's in there isn't drawn: the
 *  mountain's in front of it (it was drawn over the spiral's steps and its signs' posts). */
const HIDE_X0 = TR, HIDE_X1 = TR + ROUND;
/** The descent's chute: deeper than the plaza's (its near wall up past the riders' hips, the water's line over it). */
export const DESC_WIDE = 30, DESC_WATER = -18, DESC_LIFT = 10;
/** The descent's chute (baked in tiles), its legs down to the ground. `behind`: the mountain's face out there, in front. */
const drawDescentChute = (c: Ctx, state: GameState, behind: boolean) => {
  const x0 = DESCENT[0][0], x1 = DESCENT[DESCENT.length - 1][0];
  if (!vis(state, x0 - 60, x1 + 60)) return;
  // (its legs down to the ground: live boxes, a few a screen; crossbraces up them)
  const bot = Math.min(GY, state.camera.y + H + 20), v = state.view && state.view.w > W ? state.view : { x: state.camera.x, w: W };
  for (let x = Math.ceil(Math.max(x0 + 100, v.x - 40) / 200) * 200; x < Math.min(x1, v.x + v.w + 40); x += 200) {
    if (behind && x > HIDE_X0 - 10 && x < HIDE_X1 + 10) continue;
    // (up to the chute's underside right there: between its points, not the next point down (50-80 short of it))
    const j = DESCENT.findIndex(([px]) => px >= x);
    if (j < 1) continue;
    const [ax, ay] = DESCENT[j - 1], [bx, by] = DESCENT[j], py = ay + (by - ay) * ((x - ax) / Math.max(1, bx - ax));
    if (bot <= py + 8) continue;
    const top = Math.max(py + 8, state.camera.y - 20);
    R(c, x - 4, top, 8, bot - top, '#2A3442'); R(c, x - 4, top, 2, bot - top, '#4A5466');
    for (let yy = Math.ceil((py + 80) / 160) * 160; yy < bot; yy += 160) if (yy > state.camera.y - 10) R(c, x - 26, yy, 52, 4, '#2A3442');
  }
  for (let tx = Math.floor((v.x - 60) / 600) * 600; tx < v.x + v.w + 60; tx += 600) {
    if (tx + 600 < x0 - 40 || tx > x1 + 40) continue;
    if (behind && tx >= HIDE_X0 && tx + 600 <= HIDE_X1) continue;
    const pts = DESCENT.filter(([x]) => x > tx - 300 && x < tx + 900);
    if (pts.length < 2) continue;
    const [y0, y1] = bandOf(DESCENT, tx, 600);
    if (y1 < y0 || !visY(state, y0 - 60, y1 + 60)) continue;
    stamp(c, `wp-desc-${tx}`, tx, y0 - 60, 600, y1 - y0 + 100, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 60, 600, y1 - y0 + 100); g.clip();
      chuteBack(g, pts, '#0891B2', DESC_WIDE, DESC_WATER);
      g.restore();
    });
  }
};
const drawDescentFront = (c: Ctx, state: GameState, behind: boolean) => {
  const x0 = DESCENT[0][0], x1 = DESCENT[DESCENT.length - 1][0];
  if (!vis(state, x0 - 60, x1 + 60)) return;
  const v = state.view && state.view.w > W ? state.view : { x: state.camera.x, w: W };
  for (let tx = Math.floor((v.x - 60) / 600) * 600; tx < v.x + v.w + 60; tx += 600) {
    if (tx + 600 < x0 - 40 || tx > x1 + 40) continue;
    // (behind the mountain: none of it in there; the one tile that's half in, cut at the tower's wall (out of the
    // slide's mouth at the summit, then round the back))
    if (behind && tx >= HIDE_X0 && tx + 600 <= HIDE_X1) continue;
    const cut = behind && tx < HIDE_X0 && tx + 600 > HIDE_X0;
    const pts = DESCENT.filter(([x]) => x > tx - 300 && x < tx + 900);
    if (pts.length < 2) continue;
    const ys = pts.map(p => p[1]), y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
    if (!visY(state, y0, y1)) continue;
    // (and down at the summit's deck: what of it's under there is inside the deck and the tower's wall, not over them)
    const w = cut ? HIDE_X0 - tx : 600, h = cut ? Math.min(y1, SUMMIT.y + 2) - y0 : y1 - y0;
    stamp(c, `wp-descf-${tx}${cut ? '-cut' : ''}`, tx, y0, w, h, g => { g.save(); g.beginPath(); g.rect(tx, y0, w, h); g.clip(); chuteFront(g, pts, '#0891B2', DESC_LIFT); g.restore(); });
  }
};
/** Base camp's dressing: the big sign, the queue rails, the yeti mascot's cutout. */
const drawBaseCamp = (c: Ctx, state: GameState) => {
  if (!vis(state, 27900, TL + 40)) return;
  stamp(c, 'wp-basecamp', 27900, GY - 300, TL - 27900 + 40, 302, g => {
    R(g, 28300, GY - 240, 340, 70, INK); R(g, 28302, GY - 238, 336, 66, '#1E3A8A'); R(g, 28302, GY - 238, 336, 3, '#93C5FD');
    text(g, 'MOUNT EVEREST', 28470, GY - 212, '#F8FAFC', 12); text(g, 'BUT BETTER', 28470, GY - 190, '#FDE047', 12);
    R(g, 28330, GY - 170, 6, 170, '#3F3F46'); R(g, 28604, GY - 170, 6, 170, '#3F3F46');
    for (let x = 28000; x < 28280; x += 60) { R(g, x, GY - 40, 4, 40, '#94A3B8'); }
    R(g, 28000, GY - 40, 280, 3, '#CBD5E1');
    // (the yeti's cutout, waving, grinning; THE YETI SAYS: NO REFUNDS)
    g.fillStyle = INK; g.beginPath(); g.ellipse(28720, GY - 80, 44, 80, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E8F0FA'; g.beginPath(); g.ellipse(28720, GY - 80, 40, 76, 0, 0, Math.PI * 2); g.fill();
    R(g, 28700, GY - 130, 8, 8, INK); R(g, 28730, GY - 130, 8, 8, INK); R(g, 28700, GY - 106, 40, 6, '#7F1D1D');
    R(g, 28650, GY - 30, 140, 26, INK); R(g, 28652, GY - 28, 136, 22, '#FDE047'); text(g, 'BASE CAMP 0 FT', 28720, GY - 13, INK, 6, 'center', null);
  });
};
/** Level 2's stub (the owner designs it): the deck on past the splash pool, the way on shut. */
const drawStub = (c: Ctx, state: GameState) => {
  if (!vis(state, L2.wall - 300, L2.wall + 100)) return;
  stamp(c, 'wp-stub', L2.wall - 260, GY - 220, 360, 222, g => {
    R(g, L2.wall - 10, GY - 200, 20, 200, INK); R(g, L2.wall - 6, GY - 196, 12, 196, '#0E7490');
    for (let x = L2.wall - 220; x < L2.wall; x += 16) R(g, x, GY - 120, 4, 120, '#8A8E98');
    R(g, L2.wall - 224, GY - 124, 230, 6, '#A4A8B2');
    R(g, L2.wall - 200, GY - 190, 190, 46, INK); R(g, L2.wall - 198, GY - 188, 186, 42, '#F8FAFC');
    text(g, 'THE WAVE POOL', L2.wall - 105, GY - 170, '#0E7490', 8, 'center', null); text(g, 'OPENING SOON', L2.wall - 105, GY - 154, '#B91C1C', 7, 'center', null);
  });
};

// ---------------------------------------------------------------------------------------------------------------

export interface DrawState {
  gates: number[]; tells: { x: number; t: number }[]; locked: number | null; door: number; greenPool: number;
  /** On the spiral: off floor k, how far wrapped round (the tower's face drawn round again either side, its steps). */
  climb?: { k: number; e: number } | null;
  /** The descent's on or done (the kid's dead): no mountain face out past the tower's right wall, the slide in the open
   *  (he's riding it); else the face is there, in front of the slide's run behind it. */
  descent?: boolean;
}
/** World space, behind everything that moves. */
export const drawParkBack = (c: Ctx, state: GameState, d: DrawState, extra?: () => void) => {
  drawProps(c, state);
  drawBaseCamp(c, state);
  drawPits(c, state);
  drawPools(c, state, d.greenPool);
  for (const S of SLIDES) drawSlideBack(c, state, S);
  TUBES.forEach((T, i) => drawTubeBack(c, state, T, i));
  drawDescentChute(c, state, !d.descent);
  extra?.();
  drawTower(c, state, d.gates, d.tells, d.locked);
  // (the mountain's outside, round which the spiral goes (out past the way up, and again round the far side); on the
  // spiral, the inside drawn round again either side of it (where he comes in at the top: tower.ts))
  if (!d.descent) { drawFace(c, state, 0); drawFace(c, state, -ROUND); }
  if (d.climb) { drawTower(c, state, d.gates, d.tells, null, -ROUND); drawTower(c, state, d.gates, d.tells, null, ROUND); }
  drawSummit(c, state);
  drawSummitDoor(c, state, d.door);
  // (on the spiral: the summit round with the tower's inside, either side (no lone sliver of its snow, no pop onto it))
  if (d.climb) for (const ox of [-ROUND, ROUND]) if (vis(state, TL - 60 + ox, TR + 200 + ox, 0)) { c.save(); c.translate(ox, 0); drawSummit(c, state); drawSummitDoor(c, state, d.door, ox); c.restore(); }
  drawStub(c, state);
  drawGround(c, state);
};
/** World space, in front of him: the near walls. */
export const drawParkFront = (c: Ctx, state: GameState, greenPool = 0, descent = false) => {
  drawPoolsFront(c, state, greenPool);
  for (const S of SLIDES) drawSlideFront(c, state, S);
  TUBES.forEach((T, i) => drawTubeFront(c, state, T, i));
  drawDescentFront(c, state, !descent);
};
/** The lamps (world): the plaza's light poles, the towers' work lights, a floor's lights. */
export const parkLamps = (state: GameState): Light[] => {
  const out: Light[] = [], k = lampGlow();
  for (let x = Math.floor((state.camera.x - 300) / 700) * 700 + 350; x < state.camera.x + W + 300; x += 700) if (!TUBES.some(T => x > tubeSpan(T)[0] - 200 && x < tubeSpan(T)[1])) out.push({ x, y: GY - 160, r: 200, a: 0.3 * k, color: '#FDE68A' } as Light);
  if (vis(state, TL - 200, TR + 200)) for (let j = 0; j <= FLOORS; j++) { const y = floorY(j) - 200; if (visY(state, y - 200, y + 200)) out.push({ x: (TL + TR) / 2, y, r: 420, a: 0.32, color: '#E0F2FE' } as Light); }
  return out;
};
export { SLIDE_PATHS };
