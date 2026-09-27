// Textured terrain for each stage: the ground and ledges get a tiled pixel
// material (rock, snow, concrete, planks...) with a decorated top edge, drawn
// in world space so the textures scroll with the level.

import { Block } from '../../../types';
import type { GroundRun } from '../../terrain';
import { hash, mix } from './core';

type Ctx = CanvasRenderingContext2D;

interface Material {
  base: string;
  dark: string;
  light: string;
  /** Paints the repeating 64x64 texture. */
  texture: (g: Ctx) => void;
  /** Decorates the top edge of a ground/ledge block. */
  cap: (ctx: Ctx, b: Block, frame: number) => void;
  /** Extra detail hanging under ledges (icicles, slime). */
  under?: (ctx: Ctx, b: Block, frame: number) => void;
}

const T = 64;

/** Speckle noise and strata in 2px blocks. */
const speckle = (g: Ctx, colors: string[], density: number, seed: number) => {
  for (let y = 0; y < T; y += 2) for (let x = 0; x < T; x += 2) {
    const h = hash(x * 31 + y * 17 + seed);
    if (h < density) { g.fillStyle = colors[Math.floor(hash(h * 99 + seed) * colors.length)]; g.fillRect(x, y, 2, 2); }
  }
};

const MATERIALS: Record<string, Material> = {
  'Artie Avalanche': {
    base: '#B9D3EE', dark: '#7F9CC6', light: '#EEF6FF',
    texture: g => { speckle(g, ['#A6C3E6', '#CFE2F7', '#94B4DD'], 0.3, 1); g.fillStyle = '#9DBBE0'; for (let x = 0; x < T; x += 2) g.fillRect(x, 30 + Math.round(Math.sin(x * 0.2) * 3), 2, 2); },
    cap: (ctx, b) => {
      ctx.fillStyle = '#F7FBFF'; ctx.fillRect(b.x, b.y - 4, b.w, 8);
      for (let x = b.x; x < b.x + b.w; x += 10) { ctx.beginPath(); ctx.ellipse(x + 5, b.y - 3, 7, 4 + hash(x) * 2, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#C8DCF3'; ctx.fillRect(b.x, b.y + 4, b.w, 2);
    },
    under: (ctx, b) => {
      ctx.fillStyle = '#D6E8FA';
      for (let x = b.x + 4; x < b.x + b.w - 4; x += 9) { const len = 6 + hash(x) * 14; ctx.beginPath(); ctx.moveTo(x, b.y + b.h); ctx.lineTo(x + 3, b.y + b.h + len); ctx.lineTo(x + 6, b.y + b.h); ctx.fill(); }
    },
  },
  'Victor Volcano': {
    base: '#2E1510', dark: '#1A0B08', light: '#5A2A1C',
    texture: g => {
      speckle(g, ['#3D1C14', '#241009', '#4A2418'], 0.35, 2);
      g.fillStyle = '#7C2D12'; for (let i = 0; i < 14; i++) g.fillRect(8 + i * 2, 20 + Math.round(Math.sin(i) * 3), 2, 2);
      for (let i = 0; i < 10; i++) g.fillRect(40 + i * 2, 46 + Math.round(Math.cos(i) * 2), 2, 2);
    },
    cap: (ctx, b, f) => {
      ctx.fillStyle = '#1A0B08'; ctx.fillRect(b.x, b.y, b.w, 6);
      // Lava glowing in the cracks along the crust, pulsing
      for (let x = b.x; x < b.x + b.w; x += 14) {
        const glow = 0.5 + 0.5 * Math.sin(f * 0.1 + x * 0.05);
        ctx.fillStyle = mix('#B91C1C', '#FDE047', glow);
        ctx.fillRect(x + Math.round(hash(x) * 8), b.y + 2, 4, 2);
      }
      ctx.fillStyle = '#5A2A1C'; ctx.fillRect(b.x, b.y, b.w, 1);
    },
  },
  'Ernie Earthquake': {
    base: '#5A3B26', dark: '#3A2415', light: '#7A5236',
    texture: g => {
      speckle(g, ['#6B4630', '#4A301E', '#7A5236'], 0.3, 3);
      g.fillStyle = '#3A2415'; for (const y of [18, 42]) for (let x = 0; x < T; x += 2) g.fillRect(x, y + (x % 8 < 4 ? 0 : 2), 2, 2);
    },
    cap: (ctx, b) => {
      // Cracked asphalt with a faded lane line
      ctx.fillStyle = '#3B3A3E'; ctx.fillRect(b.x, b.y, b.w, 8);
      ctx.fillStyle = '#4F4E54'; ctx.fillRect(b.x, b.y, b.w, 2);
      ctx.fillStyle = '#C8A83A'; for (let x = b.x + 10; x < b.x + b.w - 20; x += 60) ctx.fillRect(x, b.y + 4, 26, 2);
      ctx.fillStyle = '#1E1D21';
      for (let x = b.x + 20; x < b.x + b.w; x += 110) { let cx = x, cy = b.y; for (let i = 0; i < 6; i++) { ctx.fillRect(cx, cy, 2, 2); cx += (hash(x + i) - 0.5) * 6; cy += 2; } }
    },
  },
  'Hector Hurricane': {
    base: '#C9A86A', dark: '#9C7E48', light: '#E6CB92',
    texture: g => { speckle(g, ['#D8B97C', '#B8965A', '#E6CB92'], 0.4, 4); },
    cap: (ctx, b) => {
      // A salt-bleached boardwalk
      ctx.fillStyle = '#8A6A45'; ctx.fillRect(b.x, b.y, b.w, 8);
      ctx.fillStyle = '#A8845A'; ctx.fillRect(b.x, b.y, b.w, 2);
      ctx.fillStyle = '#5E4630'; for (let x = b.x; x < b.x + b.w; x += 16) ctx.fillRect(x, b.y, 2, 8);
      ctx.fillStyle = '#3A2A1C'; for (let x = b.x + 7; x < b.x + b.w; x += 16) ctx.fillRect(x, b.y + 3, 2, 2);
    },
  },
  'Toxic Tommy': {
    base: '#2A2620', dark: '#16130F', light: '#4A4236',
    texture: g => {
      g.fillStyle = '#34302A'; for (let y = 0; y < T; y += 16) g.fillRect(0, y, T, 2);
      for (let x = 0; x < T; x += 16) g.fillRect(x, 0, 2, T);
      g.fillStyle = '#5A5246'; for (let y = 4; y < T; y += 16) for (let x = 4; x < T; x += 16) g.fillRect(x, y, 2, 2);
      speckle(g, ['#5A3A1C', '#6B3A1E'], 0.08, 5); // rust
    },
    cap: (ctx, b, f) => {
      ctx.fillStyle = '#3E3A33'; ctx.fillRect(b.x, b.y, b.w, 5);
      ctx.fillStyle = '#6FB82A'; ctx.fillRect(b.x, b.y, b.w, 2);
      for (let x = b.x + 6; x < b.x + b.w; x += 23) { const len = 4 + ((f * 0.3 + hash(x) * 20) % 12); ctx.fillRect(x, b.y + 2, 2, len); ctx.fillRect(x - 1, b.y + 2 + len, 4, 2); }
    },
    under: (ctx, b, f) => { ctx.fillStyle = '#6FB82A'; for (let x = b.x + 10; x < b.x + b.w; x += 29) ctx.fillRect(x, b.y + b.h, 2, 3 + ((f * 0.2 + x) % 8)); },
  },
  'Blackout Barry': {
    base: '#3A4150', dark: '#262B36', light: '#565E70',
    texture: g => {
      // Brickwork
      for (let y = 0; y < T; y += 8) for (let x = ((y / 8) % 2) * 8; x < T; x += 16) {
        g.fillStyle = hash(x + y * 3) > 0.5 ? '#434B5C' : '#3A4150'; g.fillRect(x, y, 14, 6);
      }
      g.fillStyle = '#2B313D'; for (let y = 6; y < T; y += 8) g.fillRect(0, y, T, 2);
    },
    cap: (ctx, b) => {
      // Sidewalk slabs and a curb
      ctx.fillStyle = '#8A8F99'; ctx.fillRect(b.x, b.y, b.w, 8);
      ctx.fillStyle = '#A3A8B1'; ctx.fillRect(b.x, b.y, b.w, 2);
      ctx.fillStyle = '#5F6470'; for (let x = b.x; x < b.x + b.w; x += 40) ctx.fillRect(x, b.y, 2, 8);
      ctx.fillStyle = '#2A2E36'; ctx.fillRect(b.x, b.y + 8, b.w, 2);
    },
  },
  'Oily Oscar': {
    base: '#2B1D16', dark: '#170F0B', light: '#4A3226',
    texture: g => { speckle(g, ['#3A281E', '#1C130E', '#0B0705'], 0.35, 6); g.fillStyle = '#0B0705'; g.beginPath(); g.ellipse(40, 44, 12, 4, 0, 0, Math.PI * 2); g.fill(); },
    cap: (ctx, b, f) => {
      // Diamond steel plate, slick with oil
      ctx.fillStyle = '#5A5F66'; ctx.fillRect(b.x, b.y, b.w, 7);
      ctx.fillStyle = '#7A8088'; for (let x = b.x; x < b.x + b.w; x += 8) ctx.fillRect(x + ((x / 8) % 2) * 4, b.y + 2, 3, 1);
      ctx.fillStyle = '#0B0705'; for (let x = b.x + 30; x < b.x + b.w; x += 130) { ctx.beginPath(); ctx.ellipse(x, b.y + 4, 16, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = `rgba(168, 85, 247, ${0.25 + 0.15 * Math.sin(f * 0.05)})`; for (let x = b.x + 26; x < b.x + b.w; x += 130) ctx.fillRect(x, b.y + 3, 8, 1);
    },
  },
  'Drug Trade Dale': {
    base: '#B5703D', dark: '#8A5028', light: '#D1905A',
    texture: g => {
      speckle(g, ['#C07A45', '#A0612F', '#D1905A'], 0.35, 7);
      g.fillStyle = '#9A5A2C'; for (const y of [22, 50]) g.fillRect(0, y, T, 2); // sandstone strata
    },
    cap: (ctx, b) => {
      ctx.fillStyle = '#E0B07A'; ctx.fillRect(b.x, b.y, b.w, 5);
      ctx.fillStyle = '#F0C890'; ctx.fillRect(b.x, b.y, b.w, 1);
      ctx.fillStyle = '#8A5028'; for (let x = b.x + 5; x < b.x + b.w; x += 17) ctx.fillRect(x + Math.round(hash(x) * 6), b.y + 2, 3, 2); // pebbles
    },
  },
};

const patternCache = new Map<string, CanvasPattern>();

const texturePattern = (ctx: Ctx, stageId: string, m: Material, dark: boolean) => {
  const key = stageId + (dark ? ':dark' : '');
  let p = patternCache.get(key);
  if (!p) {
    const c = document.createElement('canvas');
    c.width = T; c.height = T;
    const g = c.getContext('2d')!;
    g.fillStyle = m.base; g.fillRect(0, 0, T, T);
    m.texture(g);
    if (dark) { g.fillStyle = 'rgba(0, 0, 0, 0.45)'; g.fillRect(0, 0, T, T); }
    p = ctx.createPattern(c, 'repeat')!;
    patternCache.set(key, p);
  }
  return p;
};

/** Draws the ground, ledges and walls of a stage. Returns false if the stage has no material (drawn plainly instead). */
export const drawTerrain = (ctx: Ctx, blocks: Block[], stageId: string | null, frame: number, doorOpenAmount: number): boolean => {
  const m = stageId ? MATERIALS[stageId] : undefined;
  if (!m || typeof document === 'undefined') return false;
  const fill = texturePattern(ctx, stageId!, m, false);
  const wallFill = texturePattern(ctx, stageId!, m, true);
  for (const b of blocks) {
    if (b.type === 'pit' || b.hidden) continue;
    if (b.type === 'door') {
      // The boss door: a heavy riveted shutter
      const y = b.y - doorOpenAmount;
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(b.x, y, b.w, b.h);
      ctx.fillStyle = '#52525B'; for (let yy = y; yy < y + b.h; yy += 12) ctx.fillRect(b.x, yy, b.w, 2);
      ctx.fillStyle = '#FACC15'; for (let yy = y + 6; yy < y + b.h; yy += 24) ctx.fillRect(b.x + 4, yy, b.w - 8, 3);
      continue;
    }
    ctx.fillStyle = b.type === 'wall' ? wallFill : fill;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    if (b.type === 'wall') continue;
    // Shade the sides and underside, then the stage's top edge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4);
    ctx.fillRect(b.x + b.w - 3, b.y, 3, b.h);
    m.cap(ctx, b, frame);
    if (b.type === 'platform') m.under?.(ctx, b, frame);
  }
  return true;
};

/**
 * Sloped ground: each run of the profile drawn as a textured hillside, with the
 * stage's cap following the surface and a shaded cliff face where it ends at a pit.
 * Only the runs on screen are drawn.
 */
export const drawGroundProfile = (ctx: Ctx, runs: GroundRun[], stageId: string | null, frame: number, view: { x: number; y: number; w: number; h: number }) => {
  const m = stageId ? MATERIALS[stageId] : undefined;
  if (!m || !runs.length || typeof document === 'undefined') return;
  const fill = texturePattern(ctx, stageId!, m, false);
  const bottom = view.y + view.h + 40;
  // Pits first: a dark crevasse between the runs either side, fading to black
  for (let i = 0; i + 1 < runs.length; i++) {
    const a = runs[i], n = runs[i + 1];
    if (n.x1 <= a.x2 + 1 || n.x1 < view.x - 20 || a.x2 > view.x + view.w + 20 || a.pitAfter) continue;
    const top = Math.min(a.y2, n.y1);
    const g = ctx.createLinearGradient(0, top, 0, top + 260);
    g.addColorStop(0, '#2B4870'); g.addColorStop(0.35, '#101C33'); g.addColorStop(1, '#02040A');
    ctx.fillStyle = g;
    ctx.fillRect(a.x2, top, n.x1 - a.x2, Math.max(bottom, top + 40) - top);
    // Ice walls catching a little light at the lips
    ctx.fillStyle = 'rgba(200, 225, 255, 0.35)';
    ctx.fillRect(a.x2, a.y2, 3, 70);
    ctx.fillRect(n.x1 - 3, n.y1, 3, 70);
  }
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    if (r.x2 < view.x - 20 || r.x1 > view.x + view.w + 20) continue;
    // Body of the hill down past the bottom of the screen
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.lineTo(r.x2, Math.max(bottom, r.y2 + 40));
    ctx.lineTo(r.x1, Math.max(bottom, r.y1 + 40));
    ctx.closePath();
    ctx.fill();
    // A little shading just under the surface
    ctx.fillStyle = 'rgba(40, 60, 100, 0.18)';
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1 + 10); ctx.lineTo(r.x2, r.y2 + 10); ctx.lineTo(r.x2, r.y2 + 26); ctx.lineTo(r.x1, r.y1 + 26);
    ctx.closePath(); ctx.fill();
    // Cliff faces where the ground stops (a pit, or a step down/up to the next run)
    const prev = runs[i - 1], next = runs[i + 1];
    const faceL = !prev || prev.x2 < r.x1 - 1 || Math.abs(prev.y2 - r.y1) > 2;
    const faceR = !next || next.x1 > r.x2 + 1 || Math.abs(next.y1 - r.y2) > 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    if (faceL) ctx.fillRect(r.x1, r.y1 + 6, 5, Math.max(bottom, r.y1 + 40) - r.y1);
    if (faceR) ctx.fillRect(r.x2 - 5, r.y2 + 6, 5, Math.max(bottom, r.y2 + 40) - r.y2);
    drawSlopeCap(ctx, r, stageId!);
  }
};

/** The top of a sloped run: for Artie, a drift of snow following the surface, with lumps. */
const drawSlopeCap = (ctx: Ctx, r: GroundRun, stageId: string) => {
  if (stageId !== 'Artie Avalanche') {
    ctx.strokeStyle = MATERIALS[stageId].light; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 1); ctx.lineTo(r.x2, r.y2 + 1); ctx.stroke();
    return;
  }
  const len = Math.hypot(r.x2 - r.x1, r.y2 - r.y1);
  const ang = Math.atan2(r.y2 - r.y1, r.x2 - r.x1);
  ctx.save();
  ctx.translate(r.x1, r.y1);
  ctx.rotate(ang);
  ctx.fillStyle = '#F7FBFF';
  ctx.fillRect(0, -4, len, 9);
  for (let d = 0; d < len; d += 10) {
    ctx.beginPath();
    ctx.ellipse(d + 5, -3, 7, 4 + hash(Math.round(r.x1 + d)) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#C8DCF3';
  ctx.fillRect(0, 5, len, 2);
  ctx.restore();
};
