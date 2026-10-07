// Up the storm tower: the eye wall the world's wrapped round, and what blows past
// between you and it. The wall's a tile of cloud painted the once (rolls of cloud
// spiralling up round the storm, lit along their tops, dark under, rain sheeting
// down in the murk between them), one lap wide so the wrap's seamless, and a
// second tile of ragged scud over it that the wind drags round faster. Out in
// the air in front, see-through wisps orbit nearer still, so going round reads
// as going round. The storm's lightning lights the cloud edges and rim-lights the
// side of the wall it's on. Nothing here is solid or hurts.

import type { GameState } from '../../core/state';
import { CANVAS_HEIGHT, CANVAS_WIDTH, RENDER_SCALE } from '../../../constants';
import { hazeBands } from '../../render/pixelArt';
import { COURSE } from './course';

const TOWER = COURSE.tower;

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// The storm's lightning (the one system: the sky behind, the wall, the light on everything)
// ---------------------------------------------------------------------------

const BOLT_CYCLE = 200;
/** How bright the storm's lightning is this frame (0..1): now and then (not every cycle), a flash, a flicker, a second flash dying away. */
export const stormFlash = (f: number) => {
  const s = Math.floor(f / BOLT_CYCLE), t = f % BOLT_CYCLE;
  if (hash(s * 1.31) < 0.3) return 0;
  return t < 3 ? 1 : t < 5 ? 0.25 : t < 10 ? 0.7 * (1 - (t - 5) / 5) : 0;
};
/** Where across the screen this cycle's bolt comes down (the side of the tower it lights). */
export const stormBoltX = (f: number) => 100 + hash(Math.floor(f / BOLT_CYCLE)) * 600;

// ---------------------------------------------------------------------------
// The wall's tiles: one lap wide, TH tall, seamless both ways, at world resolution (all of it on the 2px pixel grid,
// so blown up 2x unsmoothed it's exactly what painting it at the screen's resolution would give, at a quarter of the memory)
// ---------------------------------------------------------------------------

const C = TOWER.circumference, TH = 400, SLOPE = TH / C;
/** Something periodic round the lap: n whole waves to it. */
const per = (x: number, n: number, ph: number) => Math.sin((x / C) * TAU * n + ph);
const snap = (v: number) => Math.round(v / 2) * 2;

/** A rect wrapped round the tile both ways, added to the path (each colour's filled the once: see `batch`). */
const put = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const xx = ((x % C) + C) % C, yy = ((y % TH) + TH) % TH;
  for (const ox of xx + w > C ? [0, -C] : [0]) for (const oy of yy + h > TH ? [0, -TH] : [0]) g.rect(xx + ox, yy + oy, w, h);
};
/** Everything `fn` puts, filled in one colour in one go. */
const batch = (g: Ctx, color: string, fn: () => void) => { g.fillStyle = color; g.beginPath(); fn(); g.fill(); };

const BANDS = 5, BAND_SHIFT = [0, 14, -10, 6, -4];
/** One roll of cloud at column x: its top (lumpy, the puffs bigger in places), its bottom, its middle, how big the puff on top is. */
const roll = (k: number, x: number) => {
  const yc = k * (TH / BANDS) + BAND_SHIFT[k] + x * SLOPE + 9 * per(x, 3, k * 1.7) + 5 * per(x, 8, k * 0.9);
  const th = 28 + 10 * per(x, 5, k * 1.3) + 4 * per(x, 11, k * 2.3);
  const puff = (3 + 7 * (0.5 + 0.5 * per(x, 4, k * 2.9))) * Math.abs(per(x, 21 + k * 2, k));
  return { top: snap(yc - th / 2 - puff), bot: snap(yc + th / 2), mid: snap(yc), puff };
};

/** The wall: murk, rain sheeting down it, and the rolls of cloud spiralling up round (or, `rims`, just their lit edges). */
const paintWall = (g: Ctx, rims: boolean) => {
  if (!rims) {
    g.fillStyle = '#111829'; g.fillRect(0, 0, C, TH);
    // (the murk between the rolls, dithered a shade lighter in streaks)
    for (let i = 0; i < 26; i++) {
      const x = snap(hash(i * 2.3) * C), y = snap(hash(i * 4.1) * TH), w = snap(120 + hash(i * 6.7) * 220);
      batch(g, '#161F35', () => { for (let dx = 0; dx < w; dx += 2) { const yy = snap(y + dx * SLOPE); put(g, x + dx, yy, 2, 6); if ((dx / 2) % 2) put(g, x + dx, yy + 6, 2, 2); else put(g, x + dx, yy - 2, 2, 2); } });
    }
    // Rain sheeting down it, slanting with the wind
    for (let i = 0; i < 90; i++) {
      const x = snap(hash(i * 3.7 + 1) * C), y = snap(hash(i * 5.3 + 2) * TH), len = 30 + hash(i * 7.9) * 90;
      batch(g, i % 3 ? '#1B2440' : '#0A0F1D', () => { for (let dy = 0; dy < len; dy += 2) put(g, snap(x - dy * 0.35), y + dy, 2, 2); });
    }
  }
  // The rolls of cloud (each lower one over the one above it: it's nearer under you)
  const tones = [
    { rim: '#5C6CA0', hi: '#8090C2', lit: '#425083', body: '#2C385E', fold: '#232D4E', under: '#1A2240' },
    { rim: '#556598', hi: '#7988BA', lit: '#3D4A7B', body: '#283358', fold: '#1F2948', under: '#171F3A' },
  ];
  for (let k = 0; k < BANDS; k++) {
    const t = tones[k % 2];
    const cols: ReturnType<typeof roll>[] = [];
    for (let x = 0; x < C; x += 2) cols.push(roll(k, x));
    const each = (color: string, fn: (r: ReturnType<typeof roll>, x: number, par: number) => void) => batch(g, color, () => cols.forEach((r, i) => fn(r, i * 2, i % 2)));
    if (rims) {
      each('rgba(226, 232, 255, 1)', (r, x) => put(g, x, r.top, 2, 2));
      each('rgba(165, 185, 245, 0.55)', (r, x, p) => put(g, x, r.top + 2, 2, p ? 4 : 2));
      continue;
    }
    // (dark under, dithered down into the murk below)
    each(t.under, (r, x, p) => put(g, x, r.bot - 8, 2, p ? 10 : 8));
    each(t.body, (r, x, p) => put(g, x, r.top + 6, 2, Math.max(0, r.bot - 8 - r.top - 6) + (p ? 0 : 2)));
    // (a fold rolling along through it)
    each(t.fold, (r, x) => { if (per(x, 13, k * 2.1) > 0.45) put(g, x, r.mid + 2, 2, 2); });
    each(t.lit, (r, x, p) => put(g, x, r.top + 2, 2, p ? 6 : 4));
    // (the lit top: brightest on the crowns of the puffs)
    each(t.rim, (r, x) => { if (r.puff <= 6) put(g, x, r.top, 2, 2); });
    each(t.hi, (r, x) => { if (r.puff > 6) put(g, x, r.top, 2, 2); });
  }
};

/** Scud: ragged wisps dragged round the wall by the wind, see-through, lit along their tops. */
const paintScud = (g: Ctx) => {
  const wisps = Array.from({ length: 46 }, (_, i) => ({ x: snap(hash(i * 1.9 + 7) * C), y: snap(hash(i * 2.7 + 3) * TH), len: 50 + hash(i * 3.3) * 110, th: 4 + hash(i * 4.4) * 6 }));
  const layer = (color: string, fn: (w: typeof wisps[number], dx: number, top: number, bot: number) => void) => batch(g, color, () => {
    for (const w of wisps) for (let dx = -w.len / 2; dx < w.len / 2; dx += 2) {
      const k = 1 - (2 * dx / w.len) ** 2;
      if (k <= 0.05) continue;
      const half = Math.max(1, w.th * Math.sqrt(k) / 2), yc = w.y + dx * SLOPE + Math.sin(dx * 0.06 + w.x) * 2;
      fn(w, snap(w.x + dx), snap(yc - half), snap(yc + half));
    }
  });
  layer('rgba(14, 20, 38, 0.35)', (w, x, top, bot) => put(g, x, bot, 2, 2));
  layer('rgba(96, 112, 160, 0.42)', (w, x, top, bot) => put(g, x, top, 2, Math.max(2, bot - top)));
  layer('rgba(170, 184, 225, 0.5)', (w, x, top) => put(g, x, top, 2, 2));
};

const tiles: Partial<Record<'wall' | 'rims' | 'scud', HTMLCanvasElement>> = {};
const tile = (key: 'wall' | 'rims' | 'scud') => {
  if (typeof document === 'undefined') return null;
  let c = tiles[key];
  if (!c) {
    // (painted in software, where tens of thousands of little rects are quick, then handed over in one upload)
    const soft = document.createElement('canvas'); soft.width = C; soft.height = TH;
    const g = soft.getContext('2d', { willReadFrequently: true })!;
    if (key === 'scud') paintScud(g); else paintWall(g, key === 'rims');
    c = document.createElement('canvas'); c.width = C; c.height = TH;
    c.getContext('2d')!.drawImage(soft, 0, 0);
    tiles[key] = c;
  }
  return c;
};

/** Lays a tile over the view, repeating, with its corner at world (TOWER.x0 + u, v). */
const lay = (ctx: Ctx, cv: HTMLCanvasElement, u: number, v: number, vx0: number, vx1: number, vy0: number, vy1: number) => {
  const ox = TOWER.x0 + snap(u), oy = snap(v);
  for (let tx = ox + Math.floor((vx0 - ox) / C) * C; tx < vx1; tx += C) {
    for (let ty = oy + Math.floor((vy0 - oy) / TH) * TH; ty < vy1; ty += TH) {
      const sx = Math.max(0, Math.floor(vx0 - tx)), sy = Math.max(0, Math.floor(vy0 - ty));
      const sw = Math.min(C, Math.ceil(vx1 - tx)) - sx, sh = Math.min(TH, Math.ceil(vy1 - ty)) - sy;
      if (sw > 0 && sh > 0) ctx.drawImage(cv, sx, sy, sw, sh, tx + sx, ty + sy, sw, sh);
    }
  }
};

/** How far up the climb the view is (0 the floor of the storm, 1 the top). */
const climbOf = (state: GameState) => clamp01((TOWER.floorY - (state.camera.y + CANVAS_HEIGHT / 2)) / (TOWER.floorY - TOWER.topY));

/**
 * The eye wall, flat (the renderer wraps it round): the cloud turning slowly round on its own, the scud over it
 * dragged round faster the higher you get, lightning catching the cloud edges, and just over the storm rising under
 * you the wall going dark with it.
 */
export const drawStormWall = (ctx: Ctx, state: GameState, riseY: number) => {
  const wall = tile('wall'), scud = tile('scud');
  if (!wall || !scud) return;
  const f = state.frame, v = state.view;
  const vx0 = v ? v.x - 4 : state.camera.x - 600, vx1 = v ? v.x + v.w + 4 : state.camera.x + CANVAS_WIDTH + 600;
  const vy0 = state.camera.y - 20, vy1 = state.camera.y + CANVAS_HEIGHT + 20;
  const climb = climbOf(state);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const wallU = -f * 0.3;
  lay(ctx, wall, wallU, 0, vx0, vx1, vy0, vy1);
  // (lightning: the cloud edges caught white)
  const flash = stormFlash(f);
  if (flash > 0) { const rims = tile('rims'); if (rims) { ctx.globalAlpha = flash * 0.7; lay(ctx, rims, wallU, 0, vx0, vx1, vy0, vy1); } }
  ctx.globalAlpha = 0.7 + 0.3 * climb;
  lay(ctx, scud, -f * (1.3 + climb * 1.2), -f * 0.25, vx0, vx1, vy0, vy1);
  ctx.restore();
  // The wall going dark and rain-lashed just over the storm rising under you
  const edge = 300;
  if (riseY - edge < vy1 && riseY > vy0) {
    hazeBands(ctx, vx0, riseY - edge, vx1 - vx0, edge, '#03060E', 0, 0.6, 6);
    ctx.fillStyle = 'rgba(3, 6, 14, 0.45)';
    const span = vx1 - vx0;
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const x = snap(vx0 + ((hash(i * 2.9) * span - f * 7) % span + span) % span);
      const y = snap(riseY - edge * 0.8 + ((hash(i * 6.1) * edge + f * 9) % edge));
      ctx.rect(x, y, 2, 16); ctx.rect(x - 2, y + 16, 2, 10);
    }
    ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// In front of the wall: wisps orbiting nearer than it, and the lightning's rim light
// ---------------------------------------------------------------------------

const WISP_W = 200, WISP_H = 18;
const wisps: HTMLCanvasElement[] = [];
/** A wisp of scud, at the screen's resolution: a ragged streak tapering both ends, lit along its top. */
const wisp = (n: number) => {
  if (typeof document === 'undefined') return null;
  if (!wisps[n]) {
    const c = document.createElement('canvas'); c.width = WISP_W * RENDER_SCALE; c.height = WISP_H * RENDER_SCALE;
    const g = c.getContext('2d')!; g.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    const cy = WISP_H / 2;
    const rows = (color: string, fn: (x: number, top: number, bot: number) => void) => {
      g.fillStyle = color;
      for (let x = 0; x < WISP_W; x += 2) {
        const u = (x + 1) / WISP_W, k = Math.sin(u * Math.PI) ** 0.7;
        // (ragged: thick and thin along it, gaps torn in the tail)
        const th = (3 + 4 * k * (0.6 + 0.4 * Math.sin(x * 0.11 + n * 2))) * (hash(n * 50 + Math.floor(x / 10)) > (u < 0.75 ? 0 : 0.35) ? 1 : 0);
        if (th < 1.5) continue;
        const yc = cy + Math.sin(x * 0.045 + n) * 2;
        fn(x, snap(yc - th / 2), snap(yc + th / 2));
      }
    };
    rows('rgba(20, 28, 52, 0.45)', (x, top, bot) => g.fillRect(x, bot, 2, 2));
    rows('rgba(120, 136, 180, 0.55)', (x, top, bot) => g.fillRect(x, top, 2, Math.max(2, bot - top)));
    rows('rgba(205, 215, 240, 0.7)', (x, top) => g.fillRect(x, top, 2, 2));
    wisps[n] = c;
  }
  return wisps[n];
};

const WISPS = 22, WISP_PERIOD = 760;

/**
 * Over the wrapped wall, flat: scud and spray orbiting the storm out in front of it (further out than the wall, so
 * they sweep across quicker as you go round, foreshortened and fading as they go round the sides), see-through so
 * nothing behind them is hidden; and when the lightning goes, the side of the wall it's on lit up.
 */
export const drawStormFore = (ctx: Ctx, state: GameState, radius: number, around: (x: number) => number) => {
  const f = state.frame, camY = state.camera.y, climb = climbOf(state);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < WISPS; i++) {
    const cv = wisp(i % 3);
    if (!cv) break;
    const speed = 2.2 + hash(i * 5.1) * 1.8;
    const u = (((hash(i * 3.7) * C - f * speed) % C) + C) % C;
    const a = around(TOWER.x0 + u);
    const facing = Math.cos(a);
    if (facing < 0.15) continue;
    const reach = radius * (1.12 + hash(i * 8.3) * 0.2);
    const len = (0.6 + hash(i * 9.7) * 0.6) * facing, h = 0.8 + hash(i * 4.9) * 0.6;
    const w = WISP_W * len, sx = CANVAS_WIDTH / 2 + Math.sin(a) * reach;
    const base = TOWER.floorY - hash(i * 7.3) * WISP_PERIOD;
    for (let y = base - Math.ceil((base - (camY - 20)) / WISP_PERIOD) * WISP_PERIOD; y < camY + CANVAS_HEIGHT + 20; y += WISP_PERIOD) {
      ctx.globalAlpha = Math.min(1, (facing - 0.15) * 3) * (0.42 + 0.18 * climb);
      ctx.drawImage(cv, Math.round(sx - w / 2), Math.round(y - camY), Math.round(w), Math.round(WISP_H * h));
    }
  }
  ctx.globalAlpha = 1;
  // The lightning: the side of the wall nearer the bolt lit, in steps out to its edge
  const flash = stormFlash(f);
  if (flash > 0) {
    // (in steps, each a little brighter than the last and a little narrower, as the wall turns to face the bolt)
    const side = stormBoltX(f) < CANVAS_WIDTH / 2 ? -1 : 1, steps = 7;
    ctx.fillStyle = `rgba(199, 210, 254, ${(flash * 0.06).toFixed(3)})`;
    for (let s = 0; s < steps; s++) {
      const k0 = 0.45 + 0.55 * (1 - (1 - s / steps) ** 1.6);
      const xa = CANVAS_WIDTH / 2 + side * radius * k0, xb = CANVAS_WIDTH / 2 + side * radius;
      ctx.fillRect(snap(Math.min(xa, xb)), 0, snap(Math.abs(xb - xa)), CANVAS_HEIGHT);
    }
  }
  ctx.restore();
};
