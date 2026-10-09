// Barf on the level: a puddle of it lying on whatever it landed on (slope and all), the underside of a drop-through
// ledge it's soaking through (dripping), and a string of it stretched down off one. Meathead's SLUDGE draws with it
// (green); Meathead 2's crossbow puke does too, in its own colors.

import type { GameState } from '../core/state';
import type { Projectile } from '../../types';
import { groundLineAt } from '../core/terrain';

/** The colors of it. */
export interface GooPalette {
  /** The bands of it, dark under, the color of it, lighter on top. */
  dark: string; mid: string; light: string;
  /** The skin along the top (two steps), the line round it, the wet sheen. */
  skin: string; skinLit: string; ink: string; sheen: string;
  /** Flecks splattered round it (dark, lit). */
  fleck: string; fleckLit: string;
  /** Chunks in it: the shadow under one; the two kinds of chunk and the lit pixel on each. */
  chunkShadow: string; chunkA: string; chunkB: string; chunkALit: string; chunkBLit: string;
  /** Bubbles: the bubble, its edge, its lit side. */
  bubble: string; bubbleInk: string; bubbleLit: string;
  /** A string or a drip of it: dark, the color, lit. */
  strand: string; strandMid: string; strandLit: string;
}

/** Meathead's SLUDGE: green. */
export const SLUDGE_GOO: GooPalette = {
  dark: '#1B5E20', mid: '#2E7D32', light: '#43A047',
  skin: '#7CB342', skinLit: '#9CCC65', ink: '#0A280C', sheen: '#DCFFB4',
  fleck: '#1B5E20', fleckLit: '#43A047',
  chunkShadow: '#14451A', chunkA: '#8D6E63', chunkB: '#C0CA33', chunkALit: '#BCAAA4', chunkBLit: '#E6EE9C',
  bubble: '#9CCC65', bubbleInk: '#1B5E20', bubbleLit: '#C5E1A5',
  strand: '#1B5E20', strandMid: '#2E7D32', strandLit: '#66BB6A',
};

/** What's drawn: where it lies (`pos`, `width`, `height`: its bottom is the floor under it), something to seed its look
 *  by (`seed`, or else its id and where it is: a puddle that grows wants a fixed one, or its lumps jump about), and
 *  whether it's the finale's slick. */
export type GooShape = Pick<Projectile, 'pos' | 'width' | 'height' | 'id'> & { slick?: boolean; seed?: number };

/**
 * A puddle of barf, stuck flat to whatever it's lying on: a low skin of it hugging the ground (following a slope), thin
 * and ragged at the edges, thickest in the middle where it's still lumpy, a wet sheen along the top of it, flecks of it
 * splattered on the ground round it, and bubbles coming up through it and popping.
 */
export const drawGooPuddle = (ctx: CanvasRenderingContext2D, state: GameState, p: GooShape, pal: GooPalette = SLUDGE_GOO) => {
  // (the finale's slick grows and runs together: its lumps are pinned to the floor, not to its end, or they'd crawl)
  const slick = p.slick !== undefined;
  const seed = slick ? 313 : p.seed ?? (p.id.length * 37 + Math.round(p.pos.x)) % 997;
  const h = (n: number) => { const v = Math.sin(n * 127.1 + seed * 3.7) * 43758.5453; return v - Math.floor(v); };
  const x0 = p.pos.x, x1 = p.pos.x + p.width, base = p.pos.y + p.height;
  const g0 = slick ? Math.floor(x0 / 6) : 0;
  // (where the ground is under each bit of it: it lies along it, slope and all)
  const floorAt = (x: number) => { const g = groundLineAt(state.groundRuns, x); return g !== null && g !== undefined && Math.abs(g - base) < 24 ? g : base; };
  const thick = Math.min(9, Math.max(4, p.height * 0.55));
  const n = Math.max(6, Math.round(p.width / 6));
  const top: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = slick ? Math.min(x1, Math.max(x0, (g0 + i) * 6)) : x0 + t * p.width;
    const edge = slick ? Math.min(1, Math.min(x - x0, x1 - x) / 22) : Math.min(1, Math.min(t, 1 - t) * 5);
    const lump = slick ? 0.55 + h(g0 + i) * 0.45 + Math.sin((g0 + i) * 0.4) * 0.12 : 0.55 + h(i) * 0.45 + Math.sin(t * 9 + seed) * 0.12;
    top.push([x, floorAt(x) - 1 - thick * edge * lump]);
  }
  const outline = () => {
    ctx.beginPath(); ctx.moveTo(x0 - 2, floorAt(x0) + 1);
    for (const [x, y] of top) ctx.lineTo(x, y);
    ctx.lineTo(x1 + 2, floorAt(x1) + 1);
    for (let i = n; i >= 0; i--) { const x = x0 + (i / n) * p.width; ctx.lineTo(x, floorAt(x) + 1.5); }
    ctx.closePath();
  };
  // Flecks of it splattered round it, flat on the ground, a lit pixel on each
  for (let k = 0; k < 5; k++) {
    const side = k % 2 ? 1 : -1, fx = Math.round(side > 0 ? x1 + 3 + h(k + 9) * 14 : x0 - 3 - h(k + 9) * 14), fw = Math.round(3 + h(k) * 5), fy = Math.round(floorAt(fx) - 1);
    ctx.fillStyle = pal.fleck; ctx.fillRect(fx - fw / 2, fy, fw, 2);
    ctx.fillStyle = pal.fleckLit; ctx.fillRect(fx - fw / 2 + 1, fy, Math.max(1, fw - 2), 1);
  }
  // The body of it, in bands that follow the ground: dark under, the color of it, a lighter skin on top
  ctx.save(); outline(); ctx.clip();
  if (!state.groundRuns?.length) {
    // (a flat floor: each band in one go, not a column at a time)
    const xa = Math.floor(x0 / 2) * 2 - 2, wa = x1 + 4 - xa, fy = base;
    ctx.fillStyle = pal.dark; ctx.fillRect(xa, fy - thick - 4, wa, thick + 6);
    ctx.fillStyle = pal.mid; ctx.fillRect(xa, fy - thick - 4, wa, thick * 0.75 + 4);
    ctx.fillStyle = pal.light; ctx.fillRect(xa, fy - thick - 4, wa, thick * 0.45 + 4);
  } else for (let x = Math.floor(x0 / 2) * 2 - 2; x < x1 + 2; x += 2) {
    const fy = floorAt(x + 1);
    ctx.fillStyle = pal.dark; ctx.fillRect(x, fy - thick - 4, 2, thick + 6);
    ctx.fillStyle = pal.mid; ctx.fillRect(x, fy - thick - 4, 2, thick * 0.75 + 4);
    ctx.fillStyle = pal.light; ctx.fillRect(x, fy - thick - 4, 2, thick * 0.45 + 4);
  }
  // (the skin along the top, two steps deep)
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pal.skin; ctx.lineWidth = 4; ctx.beginPath(); for (const [x, y] of top) ctx.lineTo(x, y); ctx.stroke();
  ctx.strokeStyle = pal.skinLit; ctx.lineWidth = 1.6; ctx.beginPath(); for (const [x, y] of top) ctx.lineTo(x, y + 0.8); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = pal.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 2, floorAt(x0) + 1); for (const [x, y] of top) ctx.lineTo(x, y); ctx.lineTo(x1 + 2, floorAt(x1) + 1); ctx.stroke();
  // (the wet sheen along the top, broken up, and a glint or two)
  ctx.fillStyle = pal.sheen;
  for (let i = 1; i < n - 1; i += 2) {
    if (h((slick ? g0 : 0) + i + 3) < 0.35) continue;
    const [ax, ay] = top[i], [bx] = top[i + 1];
    ctx.fillRect(Math.round(ax), Math.round(ay + 1), Math.max(2, Math.round((bx - ax) * 0.6)), 1);
    if (h((slick ? g0 : 0) + i + 7) > 0.75) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(ax), Math.round(ay + 1), 1, 1); ctx.fillStyle = pal.sheen; }
  }
  // (chunks in it: a lump each, its shadow under it, lit on top)
  for (let k = 0; k < Math.round(p.width / 22); k++) {
    // (a slick's chunks sit one to every 22 of floor, wherever the slick's got to)
    const cx = slick ? Math.round((Math.floor(x0 / 22) + k) * 22 + h(Math.floor(x0 / 22) + k + 20) * 16) : Math.round(x0 + 8 + h(k + 20) * (p.width - 16));
    if (slick && (cx < x0 + 6 || cx > x1 - 6)) continue;
    const cy = Math.round(floorAt(cx) - thick * 0.45), cw = Math.round(2 + h(k) * 2);
    ctx.fillStyle = pal.chunkShadow; ctx.fillRect(cx, cy + 1, cw + 1, 1);
    ctx.fillStyle = k % 2 ? pal.chunkB : pal.chunkA; ctx.fillRect(cx, cy - 1, cw, 2); ctx.fillRect(cx + 1, cy - 2, Math.max(1, cw - 2), 1);
    ctx.fillStyle = k % 2 ? pal.chunkBLit : pal.chunkALit; ctx.fillRect(cx, cy - 1, 1, 1);
  }
  // Bubbles: one comes up, swells, and pops
  for (let k = 0; k < Math.max(1, Math.round(p.width / 40)); k++) {
    const period = 50 + Math.round(h(k + 30) * 40), ph = (state.frame + Math.round(h(k + 40) * period)) % period;
    const bx = slick ? (Math.floor(x0 / 40) + k) * 40 + h(k + 50 + Math.floor((state.frame + h(k + 40) * period) / period)) * 34 : x0 + 6 + h(k + 50 + Math.floor((state.frame + h(k + 40) * period) / period)) * (p.width - 12), by = floorAt(bx) - thick * 0.6;
    if (ph < period - 6) {
      const r = 1 + (ph / period) * 3.2;
      ctx.beginPath(); ctx.arc(bx, by - r * 0.6, r, Math.PI, 0); ctx.closePath();
      ctx.fillStyle = pal.bubble; ctx.fill(); ctx.strokeStyle = pal.bubbleInk; ctx.lineWidth = 0.8; ctx.stroke();
      if (r > 2) { ctx.fillStyle = pal.bubbleLit; ctx.fillRect(Math.round(bx - r * 0.6), Math.round(by - r * 1.2), Math.max(1, Math.round(r * 0.6)), 1); }
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(bx - r * 0.4), Math.round(by - r * 1.3), 1, 1);
    } else {
      ctx.fillStyle = pal.bubbleLit;
      for (let s = 0; s < 4; s++) { const a = -Math.PI * (0.15 + s * 0.23); ctx.fillRect(Math.round(bx + Math.cos(a) * 4), Math.round(by + Math.sin(a) * 4), 1.5, 1.5); }
    }
  }
};

/** Barf run through a drop-through ledge: a string of it stretched down off the ledge's underside (`from`) to the glob,
 * thinning as it goes, till it's too long and lets go. */
export const drawGooString = (ctx: CanvasRenderingContext2D, p: Pick<Projectile, 'pos' | 'width' | 'height'>, from: number, pal: GooPalette = SLUDGE_GOO) => {
  const cx = p.pos.x + p.width / 2, top = from, end = p.pos.y + p.height * 0.3, len = end - top;
  if (len <= 0 || len > 90) return;
  // (fat where it hangs off the ledge and where it meets the glob, pinched thin in the middle, thinner the longer it is)
  const w0 = Math.max(2, p.width * 0.45 * (1 - len / 110)), mid = Math.max(1, w0 * 0.3);
  ctx.beginPath();
  ctx.moveTo(cx - w0, top);
  ctx.quadraticCurveTo(cx - mid, top + len * 0.5, cx - w0 * 0.8, end);
  ctx.lineTo(cx + w0 * 0.8, end);
  ctx.quadraticCurveTo(cx + mid, top + len * 0.5, cx + w0, top);
  ctx.closePath();
  ctx.fillStyle = pal.strand; ctx.fill();
  ctx.fillStyle = pal.strandMid; ctx.fillRect(Math.round(cx - mid), Math.round(top), Math.max(1, Math.round(mid)), Math.round(len));
  ctx.fillStyle = pal.strandLit; ctx.fillRect(Math.round(cx - mid), Math.round(top + 2), 1, Math.round(len * 0.4));
  // (the blob of it still up on the ledge's underside, where the string comes off)
  ctx.fillStyle = pal.strand; ctx.fillRect(Math.round(cx - w0 - 2), Math.round(top), Math.round(w0 * 2 + 4), 3);
};

type Overhang = { y: number; x1: number; x2: number };
type OverhangShape = Pick<Projectile, 'pos' | 'width' | 'id'> & { seed?: number };

/** The drips hanging off a puddle's overhang: where each one is along the underside, how long its cycle is and how far
 *  into it (`phase`, frames); from `letGo` on it's let go and falling. The band of it along the underside: x0 to x1. */
export const gooOverhangDrips = (p: OverhangShape, o: Overhang, frame: number) => {
  const x0 = Math.max(o.x1 + 4, p.pos.x + 6), x1 = Math.min(o.x2 - 4, p.pos.x + p.width - 6);
  if (x1 <= x0) return null;
  const seed = p.seed ?? p.id.length * 31 + Math.round(p.pos.x);
  const n = Math.max(1, Math.min(3, Math.round((x1 - x0) / 18)));
  const drips = [];
  for (let k = 0; k < n; k++) {
    const x = Math.round(x0 + (x1 - x0) * ((k + 0.5) / n) + Math.sin(seed + k * 2.3) * Math.min(6, (x1 - x0) / 6));
    const period = 46 + ((seed + k * 17) % 20);
    drips.push({ x, period, phase: (frame + seed * 7 + k * 29) % period, letGo: Math.ceil(period * 0.75) });
  }
  return { x0, x1, drips };
};

/** A puddle up on a drop-through ledge: it's coming through, hanging off the underside (`o`) in drips that stretch, bulb
 * at the end, and let go (a drop falling on down: `fall`, how far, past the stretch; 0: the drop's somebody else's to
 * draw, a real one falling), over and over while it lies there. */
export const drawGooOverhang = (ctx: CanvasRenderingContext2D, p: OverhangShape, o: Overhang, frame: number, pal: GooPalette = SLUDGE_GOO, fall = 60) => {
  const d = gooOverhangDrips(p, o, frame);
  if (!d) return;
  // (a band of it along the underside, where it's soaked through)
  ctx.fillStyle = pal.strand; ctx.fillRect(Math.round(d.x0), Math.round(o.y), Math.round(d.x1 - d.x0), 2);
  for (const { x, period, phase } of d.drips) {
    const t = phase / period;
    // (stretching down, bulbing at the end; then a drop let go, falling on, and the next starting)
    const len = t < 0.75 ? 2 + (t / 0.75) * 12 : 3;
    ctx.fillStyle = pal.strand; ctx.fillRect(x - 1, Math.round(o.y), 3, Math.round(len));
    ctx.fillStyle = pal.strandMid; ctx.fillRect(x, Math.round(o.y), 1, Math.round(len));
    if (t < 0.75) { ctx.fillStyle = pal.strand; ctx.fillRect(x - 2, Math.round(o.y + len - 1), 5, 4); ctx.fillStyle = pal.strandLit; ctx.fillRect(x - 1, Math.round(o.y + len), 1, 1); }
    else if (fall > 0) { const f = (t - 0.75) / 0.25; const dy = o.y + 14 + f * f * fall; ctx.fillStyle = pal.strand; ctx.fillRect(x - 1, Math.round(dy), 3, 4); ctx.fillStyle = pal.strandLit; ctx.fillRect(x, Math.round(dy), 1, 1); }
  }
};
