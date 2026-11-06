// The hell over a refight's arena (park4/refight.ts): Ned's knockoff of where the boss died, through his portal. The
// first pass, crude on purpose (prototype-first-pass.md), and nothing of it per-frame pixel work:
//   - the light: the land's own, pushed dark and graded blood red (render/lighting.ts's grade and shade);
//   - the sky: a red haze over the land's backdrop, baked once, slid down over it;
//   - the props along the arena's back (dimmed: nothing to stand on): rock teeth, bones, chains, a brazier, and the
//     sin's own (pride's cracked mirrors, gluttony's rotten spread, envy's green eyes, wrath's broken things, greed's
//     coins, lust's thorned hearts, sloth's sagging couches; the robot's: alien cables), baked once per sin;
//   - the boss stitched up the way he died (drawStitches): seams, staples, patches over where he was hit, keyed off the
//     look (crude for now: over the hit box, not his drawn body's own lines).

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import type { Sin } from './defs';

type Ctx = CanvasRenderingContext2D;

/** The land's light, made hell's. */
export const hellLight = (base: SceneLight | null | undefined): SceneLight => ({
  ...(base ?? { lights: [] }),
  lights: base?.lights ?? [],
  dark: Math.max(base?.dark ?? 0, 0.3),
  shade: [70, 6, 10],
  grade: '#FFB2A0',
});

// ---------------------------------------------------------------------------------------------------------------
// The sky's haze (screen space, over the land's backdrop)

let haze: HTMLCanvasElement | null = null;
const bakeHaze = () => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  // (banded, top dark crimson to an orange glow low down; dithered seams between the bands)
  const bands = ['#1A0206', '#2A040A', '#3E0810', '#540E12', '#6E1A10', '#8A2A0E', '#A43E10'];
  const bh = H / bands.length;
  bands.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, Math.floor(i * bh), W, Math.ceil(bh) + 1); });
  for (let i = 1; i < bands.length; i++) { g.fillStyle = bands[i]; const y = Math.floor(i * bh) - 4; for (let x = 0; x < W; x += 4) { g.fillRect(x, y, 2, 2); g.fillRect(x + 2, y + 2, 2, 2); } }
  return cv;
};
/** Over the land's sky: hell's, mostly (the land's shows through a little: a knockoff of it). */
export const drawHellSky = (c: Ctx, f: number) => {
  if (typeof document === 'undefined') return;
  haze ??= bakeHaze();
  c.save(); c.globalAlpha = 0.72; c.drawImage(haze, 0, 0); c.restore();
  // (embers going up, a few)
  c.fillStyle = '#FDBA74';
  for (let i = 0; i < 18; i++) { const x = (i * 97 + f * (0.3 + (i % 3) * 0.2)) % W, y = H - ((f * (0.6 + (i % 4) * 0.25) + i * 53) % H); c.fillRect(Math.round(x), Math.round(y), 2, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// The props along the arena's back (world space, dimmed: not something to stand on)

const tooth = (g: Ctx, x: number, w: number, h: number, col: string, lit: string) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x - w * 0.1, -h); g.lineTo(x + w / 2, 0); g.closePath(); g.fill();
  g.fillStyle = lit; g.beginPath(); g.moveTo(x - w * 0.1, -h); g.lineTo(x + w * 0.05, -h * 0.6); g.lineTo(x - w * 0.18, -h * 0.5); g.closePath(); g.fill();
};
const bone = (g: Ctx, x: number, y: number, len: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = '#C8B89A'; g.fillRect(-len / 2, -2, len, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.arc((s * len) / 2, -2, 3, 0, Math.PI * 2); g.arc((s * len) / 2, 2, 3, 0, Math.PI * 2); g.fill(); }
  g.restore();
};
const skull = (g: Ctx, x: number, y: number, s = 1) => {
  g.fillStyle = '#D8CCB0'; g.beginPath(); g.arc(x, y - 8 * s, 8 * s, 0, Math.PI * 2); g.fill(); g.fillRect(x - 5 * s, y - 4 * s, 10 * s, 6 * s);
  g.fillStyle = '#2A0A0A'; g.fillRect(x - 5 * s, y - 10 * s, 3 * s, 3 * s); g.fillRect(x + 2 * s, y - 10 * s, 3 * s, 3 * s); g.fillRect(x - 1 * s, y - 5 * s, 2 * s, 2 * s);
};
/** One of the sin's own, at (x, its foot). */
const sinProp = (g: Ctx, sin: Sin, x: number, k: number) => {
  switch (sin) {
    case 'PRIDE': {
      // (a tall mirror, cracked, its gilt frame; a trophy on a plinth)
      g.fillStyle = '#8A6A1A'; g.fillRect(x - 22, -110, 44, 110); g.fillStyle = '#5A6A7A'; g.fillRect(x - 16, -104, 32, 94);
      g.strokeStyle = '#D8E4F0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 10, -100); g.lineTo(x + 2, -60); g.lineTo(x - 6, -30); g.moveTo(x + 2, -60); g.lineTo(x + 14, -50); g.stroke();
      if (k % 2) { g.fillStyle = '#4A2A1A'; g.fillRect(x + 30, -30, 24, 30); g.fillStyle = '#C8A030'; g.fillRect(x + 36, -52, 12, 22); g.fillRect(x + 32, -56, 20, 6); }
      break;
    }
    case 'GLUTTONY': {
      // (a heap of rotten food: a turkey's carcass, gone green, flies; a spilled trough)
      g.fillStyle = '#5A4A1A'; g.beginPath(); g.ellipse(x, -14, 40, 16, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#7A6A2A'; g.beginPath(); g.ellipse(x - 6, -26, 18, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#6A8A2A'; for (let i = 0; i < 6; i++) g.fillRect(x - 30 + i * 11, -22 - (i % 3) * 4, 6, 4);
      bone(g, x + 14, -28, 18, -0.6); bone(g, x - 20, -30, 14, 0.4);
      break;
    }
    case 'ENVY': {
      // (a statue of somebody better, its eyes glowing green, scratched at by hands)
      g.fillStyle = '#4A5A4A'; g.fillRect(x - 14, -24, 28, 24); g.fillRect(x - 10, -86, 20, 62); g.beginPath(); g.arc(x, -96, 11, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#4ADE80'; g.fillRect(x - 6, -99, 4, 3); g.fillRect(x + 2, -99, 4, 3);
      g.strokeStyle = '#2A3A2A'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 9 + i * 5, -70); g.lineTo(x - 7 + i * 5, -40); g.stroke(); }
      break;
    }
    case 'WRATH': {
      // (smashed things: a split TV, a broken chair, a fire in a barrel)
      g.fillStyle = '#2A2A30'; g.fillRect(x - 30, -26, 30, 26); g.fillStyle = '#4A5A6A'; g.fillRect(x - 26, -22, 22, 16);
      g.strokeStyle = '#E8F0FF'; g.beginPath(); g.moveTo(x - 24, -20); g.lineTo(x - 12, -12); g.lineTo(x - 18, -8); g.stroke();
      g.fillStyle = '#3A2A1A'; g.fillRect(x + 8, -34, 20, 34); g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(x + 8, -34); g.lineTo(x + 14, -52); g.lineTo(x + 18, -40); g.lineTo(x + 24, -56); g.lineTo(x + 28, -34); g.closePath(); g.fill();
      break;
    }
    case 'GREED': {
      // (a heap of gold coins, too much of it, a hand reaching up out of it)
      g.fillStyle = '#8A6A10'; g.beginPath(); g.ellipse(x, 0, 46, 26, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#E8C030'; for (let i = 0; i < 14; i++) g.fillRect(x - 36 + (i * 37) % 72, -6 - ((i * 13) % 18), 6, 3);
      g.fillStyle = '#9A7A6A'; g.fillRect(x + 4, -44, 6, 22); g.fillRect(x, -48, 14, 6);
      break;
    }
    case 'LUST': {
      // (a heart of thorns on a stake, a pink lamp, a bed's iron frame)
      g.fillStyle = '#3A1A1A'; g.fillRect(x - 2, -80, 4, 80);
      g.fillStyle = '#9A1A4A'; g.beginPath(); g.arc(x - 9, -92, 10, 0, Math.PI * 2); g.arc(x + 9, -92, 10, 0, Math.PI * 2); g.moveTo(x - 19, -90); g.lineTo(x, -66); g.lineTo(x + 19, -90); g.fill();
      g.strokeStyle = '#2A0A0A'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x - 16 + i * 6, -96); g.lineTo(x - 18 + i * 6, -102); g.stroke(); }
      if (k % 2) { g.strokeStyle = '#4A4A50'; g.lineWidth = 3; g.strokeRect(x + 26, -30, 50, 20); g.beginPath(); g.moveTo(x + 26, -10); g.lineTo(x + 26, 0); g.moveTo(x + 76, -10); g.lineTo(x + 76, 0); g.stroke(); }
      break;
    }
    case 'SLOTH': {
      // (a couch sagging into the ground, a TV's glow, empty cans)
      g.fillStyle = '#4A3A2A'; g.fillRect(x - 40, -30, 80, 22); g.fillRect(x - 40, -46, 14, 38); g.fillRect(x + 26, -46, 14, 38); g.fillRect(x - 30, -52, 60, 18);
      g.fillStyle = '#6A5A3A'; g.fillRect(x - 26, -30, 52, 6);
      g.fillStyle = '#9CA3AF'; for (let i = 0; i < 4; i++) g.fillRect(x - 48 + i * 30, -8, 6, 8);
      break;
    }
    case 'ROBOT': {
      // (the aliens' cables up out of the ground, their pods, blinking)
      g.strokeStyle = '#1E3A2A'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 30, 0); g.quadraticCurveTo(x - 10, -80, x + 20, -60); g.quadraticCurveTo(x + 40, -40, x + 30, 0); g.stroke();
      g.fillStyle = '#2A6A4A'; g.beginPath(); g.ellipse(x + 20, -60, 12, 16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#86EFAC'; g.fillRect(x + 16, -64, 8, 4);
      break;
    }
  }
};
/** One stretch of it (the stamp's 720 wide, its foot at 300). */
const SEG = 720, FOOT = 300;
const paintStretch = (g: Ctx, sin: Sin, k: number) => {
  // (the far rock: teeth of it, in two rows)
  for (let i = 0; i < 9; i++) tooth(g, 30 + i * 84 + (k * 31) % 40, 70 + ((i * 7 + k) % 4) * 18, 120 + ((i * 13 + k * 5) % 5) * 34, '#2A0A0C', '#4A1214');
  for (let i = 0; i < 7; i++) tooth(g, 70 + i * 104, 50, 60 + ((i * 11 + k) % 4) * 20, '#3A0E10', '#5E1A16');
  // (chains hanging down from up there, a hook on one)
  g.strokeStyle = '#3A3036'; g.lineWidth = 2;
  for (let i = 0; i < 3; i++) { const x = 120 + i * 230 + (k * 17) % 60; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x, -FOOT); g.lineTo(x, -110 - (i % 2) * 50); g.stroke(); g.setLineDash([]); }
  // (bones and skulls along the foot)
  for (let i = 0; i < 6; i++) bone(g, 40 + i * 120 + (k * 23) % 50, -3, 16 + (i % 3) * 4, (i * 0.9) % 3);
  skull(g, 200 + (k * 41) % 300, 0, 1); skull(g, 560 - (k * 29) % 200, 0, 0.8);
  // (the sin's own, twice a stretch)
  sinProp(g, sin, 150 + (k * 37) % 80, k); sinProp(g, sin, 470 + (k * 53) % 90, k + 1);
  // (a brazier, burning)
  g.fillStyle = '#2A2226'; g.fillRect(340, -40, 16, 40); g.fillRect(332, -46, 32, 8);
  g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(334, -46); g.lineTo(342, -70); g.lineTo(348, -56); g.lineTo(354, -76); g.lineTo(362, -46); g.closePath(); g.fill();
  g.fillStyle = '#FDE047'; g.fillRect(345, -56, 6, 8);
};
/** Along the arena's back, end to end, at its floor: drawn after the land's back, so over its scenery, under the
 *  actors; dimmed and hazed (nothing there to stand on). */
export const drawHellProps = (c: Ctx, state: GameState, sin: Sin, a: { l: number; r: number; floor: number }) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: W, h: H };
  for (let k = 0, x = a.l - 120; x < a.r + 120; k++, x += SEG) {
    if (x + SEG < v.x - 50 || x > v.x + v.w + 50) continue;
    c.save(); c.globalAlpha = 0.62; c.translate(Math.round(x), Math.round(a.floor));
    stamp(c, `rf-hell-${sin}-${k % 3}`, 0, -FOOT, SEG, FOOT + 6, g => paintStretch(g, sin, k % 3));
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Stitched up the way he died (crude: over his box)

/** How a look's seams go: the color of the thread and the patches, and what's over him. */
export interface StitchLook {
  /** The thread, and the skin patched in (a different shade: a knockoff). */
  thread: string; patch: string;
  /** Seams: each a line across his box, in fractions (x0, y0, x1, y1: 0..1 over his width and height from the top). */
  seams: [number, number, number, number][];
  /** Patches of somebody else's skin (fractions: x, y, w, h). */
  patches?: [number, number, number, number][];
  /** Staples (x, y fractions), bolts (Frankenstein's: at the neck). */
  staples?: [number, number][];
  /** A stain over him (shat; puke; cement) and how much. */
  stain?: { col: string; k: number };
  /** Holes (shot full of his own rounds): fractions. */
  holes?: [number, number][];
}
const stitchLine = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string) => {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.floor(len / 6)), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  c.strokeStyle = '#1A0A0A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = 1.4; c.beginPath();
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; c.moveTo(x - nx * 4, y - ny * 4); c.lineTo(x + nx * 4, y + ny * 4); }
  c.stroke();
};
/** Him stitched: over his box (feet at `feet`, `w` wide, `h` tall, facing `face`). */
export const drawStitches = (c: Ctx, at: { x: number; feet: number; w: number; h: number; face: number }, s: StitchLook) => {
  const L = at.x - at.w / 2, T = at.feet - at.h;
  const X = (fx: number) => (at.face < 0 ? L + at.w * (1 - fx) : L + at.w * fx), Y = (fy: number) => T + at.h * fy;
  c.save();
  if (s.stain) { c.globalAlpha = s.stain.k; c.fillStyle = s.stain.col; c.beginPath(); c.ellipse(at.x, Y(0.62), at.w * 0.45, at.h * 0.3, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (const [px, py, pw, ph] of s.patches ?? []) {
    const x = Math.min(X(px), X(px + pw)), y = Y(py), w = Math.abs(X(px + pw) - X(px)), h = at.h * ph;
    c.fillStyle = s.patch; c.globalAlpha = 0.85; c.fillRect(x, y, w, h); c.globalAlpha = 1;
    stitchLine(c, x, y, x + w, y, s.thread); stitchLine(c, x + w, y, x + w, y + h, s.thread); stitchLine(c, x + w, y + h, x, y + h, s.thread); stitchLine(c, x, y + h, x, y, s.thread);
  }
  for (const [a, b, d, e] of s.seams) stitchLine(c, X(a), Y(b), X(d), Y(e), s.thread);
  for (const [hx, hy] of s.holes ?? []) { c.fillStyle = '#2A0404'; c.beginPath(); c.arc(X(hx), Y(hy), 2.6, 0, Math.PI * 2); c.fill(); c.strokeStyle = s.thread; c.lineWidth = 1; c.beginPath(); c.moveTo(X(hx) - 4, Y(hy) - 3); c.lineTo(X(hx) + 4, Y(hy) + 3); c.moveTo(X(hx) - 4, Y(hy) + 3); c.lineTo(X(hx) + 4, Y(hy) - 3); c.stroke(); }
  for (const [sx, sy] of s.staples ?? []) { c.fillStyle = '#A8A8B4'; c.fillRect(X(sx) - 4, Y(sy) - 1, 8, 2); c.fillStyle = '#5A5A66'; c.fillRect(X(sx) - 4, Y(sy) - 1, 1, 4); c.fillRect(X(sx) + 3, Y(sy) - 1, 1, 4); }
  c.restore();
};
/** The boss's hit detector (every land boss's: an enemy that never runs out, its health 100000, the hits taken off the
 *  fight's own): his box, near enough where he's drawn. */
export const bossBox = (state: GameState) => {
  const e = state.enemies.find(o => o.health >= 50000 && !o.isBlownAway);
  return e ? { x: e.pos.x + e.width / 2, feet: e.pos.y + e.height, w: e.width, h: e.height, face: e.facing ?? 1 } : null;
};
