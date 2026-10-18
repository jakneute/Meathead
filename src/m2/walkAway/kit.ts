// The walk-away screen's painting kit: the view (a low-res picture, scaled up 2x, the SNES's own pixel), the
// projection onto the Mode-7 ground, what a boss's version of it is made of (SceneDef), and the bits every version
// can use: stepped balls, dithered smoke, palette-cycled fire, stipple patterns.

import type { WeaponType } from '../../m1/types';
import { mix } from '../../m1/game/render/backdrops/core';

export type Ctx = CanvasRenderingContext2D;
export { mix };

/** The picture, in its own pixels (each one 2x2 on the screen): 800 wide, the scene between the letterbox bars. */
export const LW = 400, LH = 216;
/** Where the bars are (screen). */
export const TOP = 64, BOT = TOP + LH * 2;
/** The horizon (picture rows), the focal length (picture px), the eye height (meters). */
export const HOR = 86, F = 160, CAM_H = 1.6;
/** How fast he walks (meters a frame) and a step (frames). */
export const SPEED = 0.02, STEP = 30;
/** Where his feet are (picture), and so how far from the eye he is (meters). */
export const FEET_Y = 210;
export const ME_D = (F * CAM_H) / (FEET_Y - HOR);
/** Where the ground runs off to (picture x): off to the right of him (a touch of three-quarter view), so the wreck going
 * away behind him stays in sight over his shoulder instead of shrinking away behind his chest. He's on the path, so the
 * path's off to his side of the middle (meters). */
export const VP_X = 292;
export const ME_X = ((LW / 2 - VP_X) * ME_D) / F;

export const INK = '#1A0B06';

/** A point on the ground (x across, d away, meters) on the picture, and how many picture px a meter is there (`vp`:
 * where the ground runs off to: the walk-away's, off to his side, unless said). */
export const project = (x: number, d: number, sway = 0, vp = VP_X) => ({ sx: vp + sway + (F * x) / d, sy: HOR + (F * CAM_H) / d, s: F / d });

/** Something lying about in the wreckage: where (x across; z: how far off it was when he set out, meters), how big
 * (meters), its picture (painted once at `ppm` px a meter, then scaled: the SNES's sprite scaling), anything on it that
 * moves (live: fire, smoke, flies; its feet at sx, sy, s px a meter), shimmer over it (heat), and whether it's litter
 * that keeps coming (wrap: it goes by again and again, the path strewn with it the whole way). */
export interface Prop {
  id: string; x: number; z: number; w: number; h: number; ppm?: number;
  paint?: (g: Ctx, w: number, h: number) => void;
  live?: (c: Ctx, sx: number, sy: number, s: number, t: number) => void;
  heat?: number; wrap?: boolean;
  /** Beyond this far off (m) it's gone behind the scenery at the far end (back()'s): not drawn. */
  far?: number;
}

/** A boss's version of the screen. */
export interface SceneDef {
  /** The land he's leaving, for the line under the title. */
  land: string;
  /** The weapon he got off the boss (M2_WEAPON_INFO's), or null for a placeholder (weaponName then). */
  weapon: WeaponType | null;
  weaponName?: string;
  /** The title across the top, if not the usual HEADING BACK TO HUB (Tucker's: HEADING BACK TO PARK). */
  title?: string;
  /** What it does, short (two lines at most, ~70 characters each). Left out: the weapon info's first sentences. */
  blurb?: string[];
  /** The sky, top to horizon (banded), and the haze the far ground fades into. */
  sky: string[];
  haze: string;
  /** The ground's tile (16 m square, 16 px a meter, the path he walks down its middle), painted once. */
  ground: (g: Ctx, w: number, h: number) => void;
  /** The sky's furniture and the far layers (sun, clouds, hills, treeline): `sway` his walk's sway (picture px). */
  back: (c: Ctx, t: number, sway: number, weakness: boolean) => void;
  /** The wreckage (weakness: the boss died by it, and the carnage shows it). */
  props: (weakness: boolean) => Prop[];
  /** His new toy, in its own frame (side on, ~56 px long, pointing +x, held at grip[0] and grip[1]). */
  drawWeapon: (c: Ctx, t: number) => void;
  grip: [[number, number], [number, number]];
  /** The light the wreck throws on him from behind (his edges). */
  rim: string;
  /** Embers in the air (colors, cycled), if anything's burning. */
  embers?: string[];
  /** The heat haze rippling across the whole far distance behind him (default on); false: straight (back() can ripple
   *  just its own fires). */
  ripple?: boolean;
}

/**
 * A land's version of the walk in through its portal (portalWalk.ts): him from behind, walking away from the camera
 * up the way into the land, the land's entrance coming up ahead. The camera's behind him, the ground running off
 * straight ahead (to the middle of the picture), his path down the middle of it.
 */
export interface PortalDef {
  /** The land's name, for the title (HEADING TO ...). */
  land: string;
  /** Along the bottom bar: a line or two about the place (~70 characters each at most). */
  lines: string[];
  /** The haze the far ground fades into. */
  haze: string;
  /** The ground's tile (16 m square, 16 px a meter, the path down its middle), painted once. */
  ground: (g: Ctx, w: number, h: number) => void;
  /** The sky's furniture and the far layers (the sun, the land's skyline): over the sky, under everything else. */
  back: (c: Ctx, t: number, sway: number) => void;
  /** What's along the way and up ahead (z: how far off it is when he sets off, meters; x across from his path). */
  props: () => Prop[];
  /** Over the lot (him too): overhangs, light shafts, things in the air. `travel`: how far the camera's come (m). */
  front?: (c: Ctx, t: number, sway: number, travel: number) => void;
  /** The light from where he's headed, round his edges. */
  rim: () => string;
}

// ---------------------------------------------------------------------------------------------------------------

export const box =(c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A deterministic 0..1 noise from a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const lite = (col: string, k = 0.25) => mix(col, '#FFFFFF', k);
export const dark = (col: string, k = 0.28) => mix(col, INK, k);
/** Five steps round a color, darkest first. */
export const rampOf = (col: string): string[] => [dark(col, 0.55), dark(col, 0.3), col, lite(col, 0.22), lite(col, 0.45)];

/** A stipple (every other pixel of `col`): the SNES's see-through, for smoke and shade. Per context (patterns are). */
const stipples = new WeakMap<Ctx, Map<string, CanvasPattern>>();
export const stipple = (c: Ctx, col: string, phase = 0): CanvasPattern | string => {
  if (typeof document === 'undefined') return col;
  let m = stipples.get(c); if (!m) { m = new Map(); stipples.set(c, m); }
  const key = col + phase;
  let p = m.get(key);
  if (!p) {
    const t = document.createElement('canvas'); t.width = 2; t.height = 2;
    const g = t.getContext('2d')!; g.fillStyle = col;
    if (phase) { g.fillRect(1, 0, 1, 1); g.fillRect(0, 1, 1, 1); } else { g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1); }
    p = c.createPattern(t, 'repeat')!; m.set(key, p);
  }
  return p;
};

/** An ellipse, stepped: ink round it, its shade, itself up and left, lit, a highlight pixel. */
export const lump = (c: Ctx, x: number, y: number, rx: number, ry: number, r: string[], ink = true) => {
  const el = (cx: number, cy: number, a: number, b: number, col: string | CanvasPattern) => { if (a <= 0 || b <= 0) return; c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2); c.fill(); };
  if (ink) el(x, y, rx + 1, ry + 1, INK);
  el(x, y, rx, ry, r[1]);
  el(x - rx * 0.12, y - ry * 0.14, rx * 0.84, ry * 0.8, r[2]);
  el(x - rx * 0.3, y - ry * 0.34, rx * 0.46, ry * 0.42, r[3]);
  box(c, x - rx * 0.45, y - ry * 0.5, Math.max(1, rx * 0.18), Math.max(1, ry * 0.16), r[4]);
};

/** A polygon, filled, with an ink line round it. */
export const poly = (c: Ctx, pts: number[][], col: string | CanvasPattern, ink: string | null = INK) => {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.fillStyle = col; c.fill();
  if (ink) { c.strokeStyle = ink; c.lineWidth = 1; c.stroke(); }
};

/** Fire's palette, coolest first: cycled up the flames (the colors march up them, the old palette-cycling way). */
export const FIRE = ['#450A0A', '#7F1D1D', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FFFBEB'];
/**
 * A fire, its foot at x, y, `size` px across (picture): tongues of stepped color, the palette cycling up through them,
 * a stepped glow round it.
 */
export const fire = (c: Ctx, x: number, y: number, size: number, t: number, seed = 0) => {
  if (size < 1.5) { box(c, x - 1, y - 2, 2, 2, FIRE[4 + (Math.floor(t / 4) % 2)]); return; }
  // (the glow: rings, stepped)
  for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(251, 146, 60, ${0.07 * (4 - i)})`; c.beginPath(); c.ellipse(x, y - size * 0.4, size * (0.5 + i * 0.35), size * (0.4 + i * 0.3), 0, 0, Math.PI * 2); c.fill(); }
  const n = Math.max(2, Math.round(size / 5));
  const cyc = Math.floor(t / 3);
  for (let k = 0; k < n; k++) {
    const u = n === 1 ? 0 : k / (n - 1) - 0.5;
    const fx = x + u * size * 0.8;
    const h = size * (0.7 + 0.5 * hash(seed + k)) * (1 - Math.abs(u) * 0.8) * (0.85 + 0.15 * Math.sin(t * 0.3 + k * 2 + seed));
    const w = size * 0.32;
    const bands = Math.max(3, Math.round(h / 2));
    for (let b = 0; b < bands; b++) {
      const kb = b / bands;
      const bw = w * (1 - kb) * (0.8 + 0.2 * Math.sin(t * 0.5 + b + k));
      const sway = Math.sin(t * 0.21 + b * 0.6 + k * 1.7 + seed) * kb * size * 0.12;
      // (hot at the foot, cooler up; and the colors marching up it)
      const idx = Math.max(1, Math.min(FIRE.length - 1, Math.round(6 - kb * 5 + (((b - cyc) % 3) + 3) % 3 * 0.6 - 0.6)));
      box(c, fx - bw / 2 + sway, y - (b + 1) * (h / bands), Math.max(1, bw), Math.ceil(h / bands), FIRE[idx]);
    }
  }
};

/** Smoke off a fire at x, y: puffs rising and spreading, darker low, stippled (see-through) as they thin out. */
export const smoke = (c: Ctx, x: number, y: number, s: number, t: number, seed = 0, opts: { n?: number; rise?: number; drift?: number; size?: number; col?: string[] } = {}) => {
  const n = opts.n ?? 9, life = 240, rise = opts.rise ?? 0.035, drift = opts.drift ?? 0.015, size = opts.size ?? 0.5;
  const cols = opts.col ?? ['#3A2E3E', '#544858', '#6E6272', '#8A7E8C'];
  for (let i = n - 1; i >= 0; i--) {
    const age = (t + (i * life) / n + seed * 37) % life, k = age / life;
    const px = x + (drift * age + Math.sin(age * 0.05 + i) * 0.3 * k) * s;
    const py = y - rise * age * s;
    if (py < -20) continue;
    const r = Math.max(1, size * s * (0.35 + k * 0.9));
    const col = cols[Math.min(cols.length - 1, Math.floor(k * cols.length))];
    c.fillStyle = k > 0.62 ? stipple(c, col, i % 2) : col;
    c.beginPath(); c.ellipse(Math.round(px), Math.round(py), r, r * 0.85, 0, 0, Math.PI * 2); c.fill();
    if (k <= 0.62 && r > 3) { c.fillStyle = stipple(c, cols[Math.min(cols.length - 1, Math.floor(k * cols.length) + 1)], 0); c.beginPath(); c.ellipse(Math.round(px - r * 0.3), Math.round(py - r * 0.3), r * 0.55, r * 0.45, 0, 0, Math.PI * 2); c.fill(); }
  }
};

/** Flies round something (picture px): black specks on little loops. */
export const flies = (c: Ctx, x: number, y: number, s: number, t: number, n = 5, seed = 0) => {
  for (let i = 0; i < n; i++) {
    const a = t * (0.09 + hash(seed + i) * 0.08) + i * 2.1, r = (0.25 + hash(seed + i * 3) * 0.35) * s;
    box(c, x + Math.cos(a) * r, y + Math.sin(a * 1.7) * r * 0.5 - 0.3 * s, 1, 1, '#0A0A0A');
  }
};
