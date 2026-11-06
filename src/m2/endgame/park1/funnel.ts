// THE ABYSS's FUNNEL (the owner's "The second tube ride should end in one of those funnels. You know, for the fun of it.
// Then drops down into the pool", and "Show a fun little mini cutscene of him spinning in the funnel using a mode 7 ish
// effect"). A big painted fiberglass bowl up on steel struts over the Abyss's splash pool (geo.ts FUNNEL); the ride's
// part of it is tube.ts updateFunnel.
//
// Depth, back to front (world, side on):
//   behind him (drawFunnelBack, one stamp): the struts down into the pool; the bowl's inside within the rim's ellipse
//     (its banded teal, the water sheeting round it, the amber stripes spiraling down, the hole in its floor); the rim's
//     back half, lit along its top;
//   (the engine: the tube's back half, him, the tube's front half)
//   in front of him (drawFunnelFront, one stamp): the bowl's outside under the rim's front half (amber fiberglass in its
//     bands, lit up its left, its stripes round it), the spout under it, the rim's front half (lit along its top). So as he
//     swings, the back wall's behind him and the front lip's over the bottom of his tube; going down the hole, he goes in
//     behind the lip and the outside; out of the spout, he drops out from behind it.
// The top-down shot (drawFunnelShot, screen space over the world, the HUD's off): the bowl seen straight down into it,
// its texture baked once (TEX) and put down turned and scaled each frame (the one turned draw of a baked canvas: not a
// stamp); a few rings sliding in toward the hole for depth; him in his tube from above (baked once, put down turned),
// going round and round it, spiraling in. Nearest-neighbor all of it: the SNES's chunky mode 7 pixels. No volcanoes.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp } from '../../intro/art/kit';
import { checkerFill } from '../../../m1/game/render/pixelArt';
import { mix } from '../../intro/art/kit';
import { elbowFront, kneeFront } from '../../art/limb';
import { skinTone, skinShadow, skinHighlight } from '../../../m1/game/render/player/body';
import type { Funnel, Pool } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0806';
const ramp5 = (col: string) => [mix(col, INK, 0.55), mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.25), mix(col, '#FFFFFF', 0.5)];
/** The fiberglass: amber outside (and the rim), deep-sea teal inside (the Abyss's), its stripes. */
const SHELL = ramp5('#F59E0B'), BOWL = ramp5('#0E8C8A'), STRIPE = ramp5('#14B8C8'), STEEL = ramp5('#56647A');
const BOWL_BANDS = [BOWL[4], BOWL[3], mix(BOWL[3], BOWL[2], 0.5), BOWL[2], mix(BOWL[2], BOWL[1], 0.5), BOWL[1], mix(BOWL[1], BOWL[0], 0.5), BOWL[0]];
const HOLE_RX = 34, HOLE_RY = 11, SPOUT = 36;

const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, style: string | CanvasPattern) => { c.fillStyle = style; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); c.fill(); };
const arcE = (c: Ctx, x: number, y: number, rx: number, ry: number, a0: number, a1: number, w: number, style: string | CanvasPattern, dash?: number[]) => {
  c.strokeStyle = style; c.lineWidth = w; if (dash) c.setLineDash(dash);
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.stroke();
  if (dash) c.setLineDash([]);
};
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visX = (state: GameState, a: number, b: number) => b > state.camera.x - 40 && a < state.camera.x + W + 40;
const visY = (state: GameState, a: number, b: number) => b > state.camera.y - 40 && a < state.camera.y + H + 40;

/** A painted stripe along `pts`, thinning in three steps (its widths), lighter where it's wider: all of it inked first,
 *  then its paint, so it's one unbroken stripe. */
const stripe = (g: Ctx, pts: [number, number][], ws: number[]) => {
  const n = pts.length - 1, part = (t: number) => pts.slice(Math.floor((t * n) / 3), Math.min(n, Math.floor(((t + 1) * n) / 3)) + 1);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const pass of [0, 1]) ws.forEach((w, t) => {
    const q = part(t);
    g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (const [x, y] of q.slice(1)) g.lineTo(x, y);
    g.strokeStyle = pass ? [SHELL[3], SHELL[2], SHELL[1]][t] : INK; g.lineWidth = pass ? w : w + 2; g.stroke();
  });
};
/** The bowl's inside at depth k (0 the rim, 1 the hole): its ellipse (the rim's, closing in on the hole). */
const ring = (F: Funnel, k: number) => ({ y: F.rimY + (F.holeY - F.rimY) * k, rx: F.rx + (HOLE_RX - F.rx) * k, ry: F.ry + (HOLE_RY - F.ry) * k });

const paintBack = (g: Ctx, F: Funnel, pool: Pool) => {
  // (the struts: two behind (darker), two out at the sides, from under the bowl down into the pool; braced)
  for (const [dx, far] of [[-70, true], [70, true], [-150, false], [150, false]] as const) {
    const x = F.cx + dx, top = F.rimY + 40, h = pool.bottom - top, S = far ? STEEL.map(s => mix(s, '#0B1020', 0.35)) : STEEL;
    R(g, x - 6, top, 12, h, INK); R(g, x - 5, top, 10, h, S[2]); R(g, x - 5, top, 3, h, S[3]); R(g, x - 5, top, 1, h, S[4]); R(g, x + 2, top, 3, h, S[1]);
    for (let y = top + 60; y < pool.bottom; y += 70) { R(g, x - 7, y, 14, 5, INK); R(g, x - 6, y + 1, 12, 3, S[1]); R(g, x - 6, y + 1, 12, 1, S[3]); }
  }
  g.lineCap = 'butt';
  for (const [a, b] of [[-150, -70], [70, 150]]) {
    const xa = F.cx + a, xb = F.cx + b, y0 = F.rimY + 120, y1 = pool.surface - 10;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(xa, y0); g.lineTo(xb, y1); g.moveTo(xa, y1); g.lineTo(xb, y0); g.stroke();
    g.strokeStyle = STEEL[1]; g.lineWidth = 2; g.stroke();
  }
  // (the bowl's inside: in bands closing in on the hole, lit toward the back rim, dark down by the hole; each seam
  // dithered)
  ell(g, F.cx, F.rimY, F.rx, F.ry, INK);
  const n = BOWL_BANDS.length;
  for (let b = 0; b < n; b++) { const q = ring(F, (b / n) * 0.92); ell(g, F.cx, q.y, q.rx - 3, q.ry - 3, BOWL_BANDS[b]); }
  for (let b = 1; b < n; b++) { const q = ring(F, (b / n) * 0.92); const pat = checkerFill(g, BOWL_BANDS[b - 1]); if (pat) arcE(g, F.cx, q.y, q.rx - 3, q.ry - 3, 0, Math.PI * 2, 2, pat); }
  // (the amber stripes spiraling down it, three of them, thinning toward the hole: the front half of each turn's hidden
  // under the lip anyway, so the back half's what's seen)
  g.lineCap = 'round';
  for (let s = 0; s < 3; s++) {
    const pts: [number, number][] = [];
    for (let j = 0; j <= 24; j++) { const k = j / 24 * 0.9, q = ring(F, k), a = s * (Math.PI * 2 / 3) + k * 5.2; pts.push([F.cx + Math.cos(a) * (q.rx - 8), q.y + Math.sin(a) * (q.ry - 4)]); }
    stripe(g, pts, [7, 5, 3]);
  }
  // (the water sheeting round it: light streaks along the bands, the way it runs)
  for (let k = 0; k < 18; k++) {
    const d = 0.08 + hash(k + 3) * 0.75, q = ring(F, d), a = hash(k * 7 + 1) * Math.PI * 2, len = 0.25 + hash(k + 9) * 0.5;
    arcE(g, F.cx, q.y, q.rx - 6, q.ry - 3, a, a + len, k % 3 ? 1 : 2, k % 2 ? '#A5F3FC' : '#E0F2FE');
  }
  // (the hole: inked, black down it, the wet lip round its far edge lit)
  ell(g, F.cx, F.holeY, HOLE_RX + 2, HOLE_RY + 2, INK);
  ell(g, F.cx, F.holeY, HOLE_RX, HOLE_RY, '#020617');
  ell(g, F.cx, F.holeY + 2, HOLE_RX - 8, HOLE_RY - 4, '#000000');
  arcE(g, F.cx, F.holeY, HOLE_RX - 1, HOLE_RY - 1, Math.PI * 1.1, Math.PI * 1.9, 2, BOWL[4]);
  // (the rim's back half, rolled: inked, amber, lit along its top, a glint)
  arcE(g, F.cx, F.rimY, F.rx, F.ry, Math.PI, Math.PI * 2, 13, INK);
  arcE(g, F.cx, F.rimY, F.rx, F.ry, Math.PI, Math.PI * 2, 9, SHELL[2]);
  arcE(g, F.cx, F.rimY - 2, F.rx, F.ry, Math.PI, Math.PI * 2, 3, SHELL[3]);
  arcE(g, F.cx, F.rimY - 3.5, F.rx, F.ry, Math.PI * 1.15, Math.PI * 1.6, 1.5, SHELL[4]);
  arcE(g, F.cx, F.rimY - 3.5, F.rx, F.ry, Math.PI * 1.3, Math.PI * 1.9, 1, '#FFFFFF', [3, 19]);
  arcE(g, F.cx, F.rimY + 3, F.rx, F.ry, Math.PI, Math.PI * 2, 2, SHELL[1]);
};

const paintFront = (g: Ctx, F: Funnel) => {
  // (the outside: from the rim's front half down to the spout, amber fiberglass in bands down it, lit up its left side,
  // shaded down its right, each seam dithered)
  const shape = () => {
    g.beginPath();
    g.moveTo(F.cx + F.rx, F.rimY);
    g.lineTo(F.cx + SPOUT, F.coneY); g.lineTo(F.cx - SPOUT, F.coneY); g.lineTo(F.cx - F.rx, F.rimY);
    g.ellipse(F.cx, F.rimY, F.rx, F.ry, 0, Math.PI, 0, true);
    g.closePath();
  };
  g.save(); shape(); g.fillStyle = INK; g.fill(); g.clip();
  const top = F.rimY, h = F.coneY - top, bands = [SHELL[3], SHELL[2], mix(SHELL[2], SHELL[1], 0.5), SHELL[1], mix(SHELL[1], SHELL[0], 0.5), SHELL[0]];
  bands.forEach((col, b) => R(g, F.cx - F.rx - 4, top + (b * h) / bands.length + 2, F.rx * 2 + 8, h / bands.length + 1, col));
  for (let b = 1; b < bands.length; b++) { const p = checkerFill(g, bands[b - 1]); if (p) { g.fillStyle = p; g.fillRect(F.cx - F.rx - 4, Math.round(top + (b * h) / bands.length) + 2, F.rx * 2 + 8, 2); } }
  // (lit up its left, shaded down its right: following the cone's sides in)
  const side = (from: number, to: number, col: string | CanvasPattern) => {
    g.fillStyle = col; g.beginPath();
    g.moveTo(F.cx + F.rx * from, F.rimY); g.lineTo(F.cx + F.rx * to, F.rimY);
    g.lineTo(F.cx + SPOUT * to, F.coneY + 2); g.lineTo(F.cx + SPOUT * from, F.coneY + 2); g.closePath(); g.fill();
  };
  side(-1, -0.72, SHELL[4]); side(-0.72, -0.62, checkerFill(g, SHELL[4]) ?? SHELL[3]);
  side(0.6, 1, SHELL[0]); side(0.5, 0.6, checkerFill(g, SHELL[0]) ?? SHELL[1]);
  // (its stripes round it: teal, inked either side, lit along their tops)
  for (const k of [0.3, 0.6]) {
    const w = F.rx + (SPOUT - F.rx) * k, y = F.rimY + (F.coneY - F.rimY) * k, ry = F.ry * (w / F.rx);
    arcE(g, F.cx, y, w, ry, 0, Math.PI, 9, INK);
    arcE(g, F.cx, y, w, ry, 0, Math.PI, 6, STRIPE[2]);
    arcE(g, F.cx, y - 1.5, w, ry, Math.PI * 0.55, Math.PI, 2, STRIPE[4]);
    arcE(g, F.cx, y + 2, w, ry, 0, Math.PI * 0.45, 2, STRIPE[0]);
  }
  // (a few drips of the water sheeting off it, down its face)
  for (let k = 0; k < 10; k++) { const x = F.cx - F.rx * 0.7 + hash(k + 40) * F.rx * 1.4, y = F.rimY + F.ry * 0.9 + hash(k + 50) * 60; R(g, x, y, 1, 4 + hash(k + 60) * 8, '#BFE6FF'); }
  g.restore();
  // (the outline round its sides)
  g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.moveTo(F.cx + F.rx, F.rimY); g.lineTo(F.cx + SPOUT, F.coneY); g.moveTo(F.cx - F.rx, F.rimY); g.lineTo(F.cx - SPOUT, F.coneY); g.stroke();
  // (the spout: a short pipe under it, lit up its left, its mouth's lip; the dark up it)
  const sh = F.spoutY - F.coneY;
  R(g, F.cx - SPOUT - 2, F.coneY - 2, SPOUT * 2 + 4, sh + 2, INK);
  R(g, F.cx - SPOUT, F.coneY, SPOUT * 2, sh, SHELL[1]); R(g, F.cx - SPOUT, F.coneY, 12, sh, SHELL[3]); R(g, F.cx - SPOUT, F.coneY, 4, sh, SHELL[4]); R(g, F.cx + SPOUT - 14, F.coneY, 14, sh, SHELL[0]);
  R(g, F.cx - SPOUT - 4, F.spoutY - 8, SPOUT * 2 + 8, 8, INK); R(g, F.cx - SPOUT - 3, F.spoutY - 7, SPOUT * 2 + 6, 5, SHELL[2]); R(g, F.cx - SPOUT - 3, F.spoutY - 7, SPOUT * 2 + 6, 2, SHELL[4]);
  ell(g, F.cx, F.spoutY, SPOUT, 7, INK); ell(g, F.cx, F.spoutY + 1, SPOUT - 4, 4, '#020617');
  // (the rim's front half, rolled over the bowl's inside: inked, amber, lit along its top, wet glints)
  arcE(g, F.cx, F.rimY, F.rx, F.ry, 0, Math.PI, 15, INK);
  arcE(g, F.cx, F.rimY, F.rx, F.ry, 0, Math.PI, 11, SHELL[2]);
  arcE(g, F.cx, F.rimY - 3, F.rx, F.ry, 0, Math.PI, 3, SHELL[4]);
  arcE(g, F.cx, F.rimY - 4, F.rx, F.ry, Math.PI * 0.2, Math.PI * 0.8, 1, '#FFFFFF', [2, 17]);
  arcE(g, F.cx, F.rimY + 4, F.rx, F.ry, 0, Math.PI, 3, SHELL[0]);
  // (its name, painted round the front)
  g.fillStyle = INK; g.font = 'bold 13px "Press Start 2P", monospace'; g.textAlign = 'center';
  g.fillText('THE DRAIN', F.cx + 1, F.rimY + F.ry + 42);
  g.fillStyle = '#FEF3C7'; g.fillText('THE DRAIN', F.cx, F.rimY + F.ry + 41);
};

/** Behind him (world): the struts, the bowl's inside, the rim's back half. One stamp. */
export const drawFunnelBack = (c: Ctx, state: GameState, F: Funnel, pool: Pool) => {
  const x0 = F.cx - F.rx - 24, y0 = F.rimY - F.ry - 14;
  if (!visX(state, x0, F.cx + F.rx + 24) || !visY(state, y0, pool.bottom)) return;
  stamp(c, 'wp-funnel-back', x0, y0, F.rx * 2 + 48, pool.bottom - y0 + 4, g => paintBack(g, F, pool));
};
/** In front of him (world): the bowl's outside, the spout, the rim's front half. One stamp. */
export const drawFunnelFront = (c: Ctx, state: GameState, F: Funnel) => {
  const x0 = F.cx - F.rx - 12, y0 = F.rimY - 14;
  if (!visX(state, x0, F.cx + F.rx + 12) || !visY(state, y0, F.spoutY + 12)) return;
  stamp(c, 'wp-funnel-front', x0, y0, F.rx * 2 + 24, F.spoutY - y0 + 14, g => paintFront(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The top-down shot

/** The bowl straight down into it (TEX by TEX, its middle the hole): the rim's amber roll, the teal in bands down to the
 *  hole (seams dithered), the three amber stripes spiraling in, the water sheeting round, the hole. Low-res: put down
 *  scaled up, nearest-neighbor (mode 7's chunky pixels). Baked once. */
const TEX = 256, TR = 124;
let tex: HTMLCanvasElement | null = null;
const paintTex = (g: Ctx) => {
  const m = TEX / 2;
  g.fillStyle = '#020617'; g.fillRect(0, 0, TEX, TEX);
  const disc = (r: number, col: string | CanvasPattern) => { g.fillStyle = col; g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill(); };
  disc(TR + 2, INK); disc(TR, SHELL[1]); disc(TR - 2, SHELL[2]); disc(TR - 5, SHELL[3]); disc(TR - 7, INK);
  const n = BOWL_BANDS.length, r0 = TR - 8, r1 = 18;
  for (let b = 0; b < n; b++) disc(r0 - ((r0 - r1) * b) / n, BOWL_BANDS[b]);
  for (let b = 1; b < n; b++) { const p = checkerFill(g, BOWL_BANDS[b - 1], 0, 1); if (p) { g.strokeStyle = p; g.lineWidth = 2; g.beginPath(); g.arc(m, m, r0 - ((r0 - r1) * b) / n, 0, Math.PI * 2); g.stroke(); } }
  // (the stripes: three arms in, thinning)
  g.lineCap = 'round';
  for (let s = 0; s < 3; s++) {
    const pts: [number, number][] = [];
    for (let j = 0; j <= 30; j++) { const k = j / 30, rr = r0 - (r0 - r1 - 4) * k, a = s * (Math.PI * 2 / 3) + k * 5.2; pts.push([m + Math.cos(a) * rr, m + Math.sin(a) * rr]); }
    stripe(g, pts, [8, 6, 3]);
  }
  // (the water sheeting round it)
  g.lineCap = 'butt';
  for (let k = 0; k < 40; k++) { const r = r1 + 6 + hash(k + 11) * (r0 - r1 - 10), a = hash(k * 3 + 2) * Math.PI * 2; g.strokeStyle = k % 2 ? '#A5F3FC' : '#E0F2FE'; g.lineWidth = k % 3 ? 1 : 2; g.beginPath(); g.arc(m, m, r, a, a + 0.2 + hash(k + 5) * 0.5); g.stroke(); }
  // (the hole)
  disc(r1 + 2, INK); disc(r1, '#020617'); disc(r1 - 6, '#000000');
  g.strokeStyle = BOWL[4]; g.lineWidth = 1; g.beginPath(); g.arc(m, m, r1 - 1, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
};

/** Him in his tube from straight above (TOP by TOP, facing up the canvas, his middle at its middle): the tube's ring
 *  (aqua, its stripe, lit round its top-left), his butt down in its hole, the legs out over its front (knees from
 *  limb.ts, out to the sides), the boots; leaned back, the big shoulders and his head on the back rim (the flat-top, the
 *  glasses' rims at its front), the arms thrown out over the rim (elbows from limb.ts, out to the sides). Baked once. */
const TOP = 64;
let top: HTMLCanvasElement | null = null;
const JEANS = '#1E3A8A', JEANS_D = '#172554', BOOT = '#3B2412', HAIR = '#16110C';
const RING = ramp5('#14B8C8');
export const paintTop = (g: Ctx) => {
  const m = TOP / 2;
  const line = (a: [number, number], b: [number, number], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  const dot = (x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  // (the ring)
  dot(m, m, 23, INK); dot(m, m, 22, RING[1]); dot(m, m, 20, RING[2]);
  g.strokeStyle = RING[3]; g.lineWidth = 3; g.beginPath(); g.arc(m, m, 18, Math.PI * 0.95, Math.PI * 1.65); g.stroke();
  g.strokeStyle = RING[4]; g.lineWidth = 1; g.beginPath(); g.arc(m, m, 19, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.strokeStyle = '#FDE047'; g.lineWidth = 2; g.beginPath(); g.arc(m, m, 16, 0, Math.PI * 2); g.stroke();
  dot(m, m, 11, INK); dot(m, m, 10, '#071526');
  // (the legs out over its front: the far side's first; knees out to the side)
  for (const s of [-1, 1] as const) {
    const hip: [number, number] = [m + s * 5, m - 1], foot: [number, number] = [m + s * 8, m - 26];
    const kn = kneeFront(hip[0], hip[1], foot[0], foot[1], 12, 14, s);
    line(hip, kn, 8, INK); line(kn, foot, 7, INK);
    line(hip, kn, 6, s < 0 ? JEANS_D : JEANS); line(kn, foot, 5, s < 0 ? JEANS_D : JEANS);
    dot(foot[0], foot[1] - 1, 4, INK); dot(foot[0], foot[1] - 1, 3, BOOT); dot(foot[0] - 1, foot[1] - 2, 1, '#6B4A2A');
  }
  // (his butt, down in the hole)
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, m + 1, 10, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = JEANS; g.beginPath(); g.ellipse(m, m + 1, 9, 7, 0, 0, Math.PI * 2); g.fill();
  // (the arms out over the rim, the fists hooked on it)
  for (const s of [-1, 1] as const) {
    const sh: [number, number] = [m + s * 11, m + 10], fist: [number, number] = [m + s * 20, m + 4];
    const el = elbowFront(sh[0], sh[1], fist[0], fist[1], 8, 8, s);
    line(sh, el, 7, INK); line(el, fist, 6, INK);
    line(sh, el, 5, s < 0 ? skinShadow : skinTone); line(el, fist, 4, s < 0 ? skinShadow : skinTone);
    dot(fist[0], fist[1], 3.5, INK); dot(fist[0], fist[1], 2.5, skinTone);
  }
  // (leaned back: the shoulders, the chest's top lit, his head on the back rim)
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, m + 11, 14, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = skinTone; g.beginPath(); g.ellipse(m, m + 11, 13, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = skinHighlight; g.beginPath(); g.ellipse(m - 3, m + 9, 7, 2.5, 0, 0, Math.PI * 2); g.fill();
  dot(m, m + 18, 6.5, INK); dot(m, m + 18, 5.5, skinTone);
  dot(m, m + 19, 5, HAIR); g.fillStyle = HAIR; g.fillRect(m - 5, m + 18, 10, 4);
  g.fillStyle = INK; g.fillRect(m - 5, m + 12, 4, 2); g.fillRect(m + 1, m + 12, 4, 2); g.fillRect(m - 1, m + 12, 2, 1);
};
const bakeTop = () => {
  if (top) return top;
  top = document.createElement('canvas'); top.width = TOP; top.height = TOP;
  paintTop(top.getContext('2d')!);
  return top;
};
const bakeTex = () => {
  if (tex) return tex;
  tex = document.createElement('canvas'); tex.width = TEX; tex.height = TEX;
  paintTex(tex.getContext('2d')!);
  return tex;
};
/** Baked ahead (the ride's last stretch): nothing painted the frame the shot cuts in. */
export const prebakeFunnelShot = () => { if (typeof document !== 'undefined') { bakeTex(); bakeTop(); } };

/** The top-down shot (screen space, over everything; `k` 0..1 through it): straight down into the bowl, the bowl turning
 *  and zooming in as he goes round it, spiraling in toward the hole. */
export const drawFunnelShot = (c: Ctx, k: number, frame: number) => {
  const T = bakeTex(), S = bakeTop();
  c.save();
  c.imageSmoothingEnabled = false;
  R(c, 0, 0, W, H, '#020617');
  const s = 1.9 + 1.8 * k * k, th = k * 5.5, cx = W / 2, cy = H / 2 + 10;
  c.save(); c.translate(cx, cy); c.rotate(th); c.scale(s, s); c.drawImage(T, -TEX / 2, -TEX / 2); c.restore();
  // (rings sliding in toward the hole: depth, the bowl going down under him)
  c.lineWidth = 2; c.strokeStyle = mix(BOWL[0], INK, 0.3);
  for (let j = 0; j < 3; j++) { const f = (j / 3 + k * 2.2) % 1, r = (TR - 10) * s * (1 - f) + 18 * s * f; if (r > 22 * s) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); } }
  // (him: round and round it (faster than it turns), feet first, spiraling in; a wobble)
  const rho = (TR - 30) * (1 - 0.72 * k), phi = -k * 15, a = th + phi;
  const px = cx + Math.cos(a) * rho * s, py = cy + Math.sin(a) * rho * s;
  c.save(); c.translate(Math.round(px), Math.round(py)); c.rotate(a + Math.sin(frame * 0.3) * 0.12); c.scale(s * 0.42, s * 0.42);
  c.drawImage(S, -TOP / 2, -TOP / 2); c.restore();
  // (letterboxed: a cutscene)
  R(c, 0, 0, W, 44, '#000000'); R(c, 0, H - 44, W, 44, '#000000');
  c.restore();
};

/** (dev) The contact sheet: him from above at 6x, turned four ways, and the bowl's texture, as a PNG data URL. */
export const funnelSheet = () => {
  const T = bakeTex(), S = bakeTop(), cv = document.createElement('canvas');
  cv.width = 4 * TOP * 6 + 5 * 10 + TEX * 2; cv.height = Math.max(TOP * 6, TEX * 2) + 20;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false; g.fillStyle = '#334155'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 4; i++) { g.save(); g.translate(10 + i * (TOP * 6 + 10) + TOP * 3, 10 + TOP * 3); g.rotate(i * Math.PI / 2 + (i ? 0.3 : 0)); g.scale(6, 6); g.drawImage(S, -TOP / 2, -TOP / 2); g.restore(); }
  g.drawImage(T, 10 + 4 * (TOP * 6 + 10), 10, TEX * 2, TEX * 2);
  return cv.toDataURL('image/png');
};
