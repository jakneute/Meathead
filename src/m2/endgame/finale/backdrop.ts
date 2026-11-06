// THE KAIJU FINALE's world behind and under them (the owner's: a miniature park under three kaiju): the sunrise sky
// (banded, the sun's disc coming up in the east: the right, the way they're going), each land's far skyline (dim, a
// haze band at its foot, parallax far back), the land's near miniature spread out behind the walking line (tiny
// buildings, trees, paths: parallax nearer), and the ground he walks on (the land's own color, a lit top edge: you
// stand on it). One eye for all of it: every layer slides at its own depth's rate, and none is drawn over a nearer one.
// Each layer's tiles are painted once (stamped) and keyed by land: the land a tile shows is fixed by where it is, so
// nothing changes under the camera.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp, prestamp } from '../../../m1/game/render/stamp';
import { RENDER_SCALE } from '../../../m1/constants';
import { timeOfDay } from '../../timeOfDay';
import { landAt, floorY } from './geo';
import type { Land } from './sections';
import { R, poly, tree, INK } from './landmarkArt';

type Ctx = CanvasRenderingContext2D;

interface Look { ground: string[]; far: string[]; bldg: string[]; roof: string[]; tree: 'round' | 'pine' | 'palm' | 'lolly' | 'dead'; leaf: [string, string]; path: string }
const LOOK: Record<Land, Look> = {
  america: { ground: ['#5E8A44', '#4E7A38', '#3E6A2C'], far: ['#8A94B4', '#7A84A4'], bldg: ['#B4533A', '#F1EDE4', '#7A9AB4'], roof: ['#1D4ED8', '#DC2626'], tree: 'round', leaf: ['#3F7A3A', '#6AAF5A'], path: '#C8B89A' },
  hollywood: { ground: ['#B49A70', '#A48A62', '#947A54'], far: ['#A89AB0', '#988AA0'], bldg: ['#E8DCC4', '#D9A878', '#C8C0B0'], roof: ['#8A3A22', '#5A6A7A'], tree: 'palm', leaf: ['#3F8A3A', '#6ABF5A'], path: '#C9B8A0' },
  fantasy: { ground: ['#E4ECF4', '#D0DCE8', '#BCC8DA'], far: ['#B8B4D8', '#A8A4C8'], bldg: ['#E8D8B8', '#C8B8E0', '#D8C0A0'], roof: ['#3B5BBF', '#4A3A5A'], tree: 'pine', leaf: ['#1F5A3A', '#F8FAFC'], path: '#A89AC0' },
  adventure: { ground: ['#3E7A34', '#346A2C', '#2A5A24'], far: ['#6A8A7A', '#5A7A6A'], bldg: ['#9A9A8E', '#A8784A', '#7A7A70'], roof: ['#4A7A3A', '#5A3A1C'], tree: 'round', leaf: ['#2E7A3A', '#5AB04A'], path: '#8A7A54' },
  foreign: { ground: ['#7AA058', '#6A904A', '#5A803E'], far: ['#94A0B8', '#8490A8'], bldg: ['#E8E0D0', '#C89A5A', '#D8A878'], roof: ['#C81E1E', '#3B5BBF'], tree: 'round', leaf: ['#3F7A3A', '#6AAF5A'], path: '#D8C8A8' },
  space: { ground: ['#C0C8D4', '#AEB8C6', '#9CA6B6'], far: ['#A4B0C8', '#94A0B8'], bldg: ['#F1F5F9', '#E2E8F0', '#CBD5E1'], roof: ['#14B8A6', '#F97316'], tree: 'round', leaf: ['#2DA38A', '#7ADBC4'], path: '#94A3B8' },
  frontier: { ground: ['#A8885A', '#98784C', '#886840'], far: ['#8A94A8', '#7A8498'], bldg: ['#9A6A3A', '#8A5A30', '#F8FAFC'], roof: ['#5A3A24', '#4A2E14'], tree: 'pine', leaf: ['#1F5A3A', '#3A8A4A'], path: '#C8A878' },
  spooky: { ground: ['#5A546A', '#4A445A', '#3A344A'], far: ['#6A6480', '#5A5470'], bldg: ['#5A5468', '#6A6478', '#4A4458'], roof: ['#3A2A4A', '#4A3A6A'], tree: 'dead', leaf: ['#000000', '#000000'], path: '#7A7488' },
  cartoon: { ground: ['#F4A8CC', '#E898C0', '#D888B4'], far: ['#C8A8D8', '#B898C8'], bldg: ['#FDE68A', '#F9A8D4', '#C084FC'], roof: ['#7C3AED', '#22D3EE'], tree: 'lolly', leaf: ['#F472B6', '#FBCFE8'], path: '#FEF3C7' },
};

/** Where the horizon sits on screen, and the near miniature's foot. */
const HORIZON = 372, NEAR_FOOT = 486;
const FAR_K = 0.15, NEAR_K = 0.45, FAR_W = 640, NEAR_W = 512;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------------------------------------------------------
// The sky (screen space)

export const drawFinaleSky = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), sky = tod.sky, n = 12;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), j = Math.min(sky.length - 1, Math.floor(k * (sky.length - 1)));
    R(c, 0, Math.round((i / n) * HORIZON), W, Math.ceil(HORIZON / n) + 1, k * (sky.length - 1) - j > 0.5 && j + 1 < sky.length ? sky[j + 1] : sky[j]);
  }
  // (the sun, coming up in the east: its disc's top over the horizon, stepped rings of its glow)
  const sx = 620 - (state.camera.x * 0.01) % 40, sy = HORIZON - 8;
  for (const [r, a] of [[90, 0.12], [64, 0.18], [44, 0.26]] as const) { c.globalAlpha = a; c.fillStyle = tod.sunGlow; c.beginPath(); c.arc(sx, sy, r, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1; c.fillStyle = tod.sun; c.beginPath(); c.arc(sx, sy, 26, Math.PI, 0); c.fill();
  c.fillStyle = '#FFF6DC'; c.fillRect(Math.round(sx - 20), sy - 10, 40, 2);
  // (a few clouds, lit from under, drifting)
  for (let k = 0; k < 5; k++) {
    const x = ((k * 240 - state.camera.x * 0.03 - state.frame * 0.05) % (W + 200) + W + 200) % (W + 200) - 100, y = 60 + k * 38;
    c.fillStyle = tod.cloud; c.globalAlpha = 0.55; c.fillRect(Math.round(x), y, 90, 6); c.fillRect(Math.round(x) + 14, y - 4, 50, 4); c.globalAlpha = 1;
    c.fillStyle = tod.sunGlow; c.globalAlpha = 0.35; c.fillRect(Math.round(x) + 6, y + 5, 80, 2); c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far skyline and the near miniature (screen space, parallax: drawn as part of the backdrop)

const paintFar = (g: Ctx, land: Land, i: number) => {
  const L = LOOK[land];
  // (hills or ridges, the land's skyline shapes in silhouette, dim; a haze band along the foot)
  g.fillStyle = L.far[1];
  g.beginPath(); g.moveTo(0, 80); for (let x = 0; x <= FAR_W; x += 40) g.lineTo(x, 50 + Math.sin((x + i * 97) * 0.012) * 14 + hash(x + i) * 8); g.lineTo(FAR_W, 80); g.closePath(); g.fill();
  g.fillStyle = L.far[0];
  for (let k = 0; k < 7; k++) {
    const x = 30 + k * 90 + hash(i * 7 + k) * 30, w = 20 + hash(k + i) * 30, h = 20 + hash(k * 3 + i) * 34;
    switch (land) {
      case 'fantasy': case 'spooky': g.fillRect(x, 80 - h, w * 0.4, h); g.beginPath(); g.moveTo(x - 3, 80 - h); g.lineTo(x + w * 0.2, 80 - h - 16); g.lineTo(x + w * 0.4 + 3, 80 - h); g.fill(); break;
      case 'space': g.fillRect(x + w / 2 - 2, 80 - h - 20, 4, h + 20); g.beginPath(); g.ellipse(x + w / 2, 80 - h - 10, w / 2, 4, 0, 0, Math.PI * 2); g.fill(); break;
      case 'frontier': g.beginPath(); g.moveTo(x - 20, 80); g.lineTo(x + w / 2, 80 - h - 20); g.lineTo(x + w + 20, 80); g.fill(); break;
      case 'adventure': g.beginPath(); g.arc(x + w / 2, 80 - h * 0.5, w * 0.6, 0, Math.PI * 2); g.fill(); break;
      case 'cartoon': g.beginPath(); g.arc(x + w / 2, 80, w * 0.7, Math.PI, 0); g.fill(); break;
      default: g.fillRect(x, 80 - h, w, h);
    }
  }
  g.fillStyle = 'rgba(244, 196, 154, 0.35)'; g.fillRect(0, 70, FAR_W, 10);
};
const paintNear = (g: Ctx, land: Land, i: number) => {
  const L = LOOK[land], D = NEAR_FOOT - HORIZON;
  // (the ground going back: bands, darker toward the front; a path across it)
  for (let k = 0; k < 4; k++) R(g, 0, (k / 4) * D, NEAR_W, D / 4 + 1, L.ground[Math.min(2, Math.max(0, 2 - k))]);
  R(g, 0, D * 0.55, NEAR_W, 3, L.path); R(g, 0, D * 0.55, NEAR_W, 1, '#FFFFFF44');
  // (tiny buildings and trees on it, back rows smaller: one shared eye)
  for (let row = 0; row < 3; row++) {
    const foot = 8 + row * (D * 0.3), s = 0.5 + row * 0.3, n = 6 + row * 2;
    for (let k = 0; k < n; k++) {
      const x = ((k + hash(i * 13 + row * 5 + k) * 0.6) / n) * NEAR_W, sh = hash(i * 31 + k * 7 + row);
      g.save(); g.translate(Math.round(x), Math.round(foot)); g.scale(s, s);
      if (sh < 0.45) { const w = 16 + sh * 30, h = 10 + sh * 30; R(g, -w / 2 - 1, -h - 1, w + 2, h + 1, INK); R(g, -w / 2, -h, w, h, L.bldg[k % 3]); R(g, -w / 2, -h, w, 1, '#FFFFFF66'); poly(g, [-w / 2 - 2, -h, 0, -h - 6, w / 2 + 2, -h], L.roof[k % 2], false); for (let wx = 0; wx < 3; wx++) R(g, -w / 2 + 3 + wx * (w / 3), -h + 4, 2, 2, '#3A4A5A'); }
      else tree(g, 0, 14 + sh * 10, L.tree, L.leaf);
      g.restore();
    }
  }
  // (a dimmed haze along the top, where it meets the far skyline)
  g.fillStyle = 'rgba(244, 196, 154, 0.25)'; g.fillRect(0, 0, NEAR_W, 6);
};

export const drawFinaleBackdrop = (c: Ctx, state: GameState) => {
  drawFinaleSky(c, state);
  const cam = state.camera.x;
  // (the far skyline: its tiles by where they are in its own depth's space)
  {
    const off = cam * FAR_K, i0 = Math.floor(off / FAR_W);
    for (let i = i0; i <= i0 + 2; i++) {
      const sx = Math.round(i * FAR_W - off), land = landAt((i * FAR_W + FAR_W / 2) / FAR_K);
      if (sx > W || sx + FAR_W < 0) continue;
      c.save(); c.translate(sx, HORIZON - 80); stamp(c, `fin-far-${land}-${((i % 3) + 3) % 3}`, 0, -30, FAR_W, 112, g => paintFar(g, land, ((i % 3) + 3) % 3)); c.restore();
    }
  }
  // (the near miniature)
  {
    const off = cam * NEAR_K, i0 = Math.floor(off / NEAR_W);
    for (let i = i0; i <= i0 + 2; i++) {
      const sx = Math.round(i * NEAR_W - off), land = landAt((i * NEAR_W + NEAR_W / 2) / NEAR_K);
      if (sx > W || sx + NEAR_W < 0) continue;
      c.save(); c.translate(sx, HORIZON); stamp(c, `fin-near-${land}-${((i % 4) + 4) % 4}`, 0, -40, NEAR_W, NEAR_FOOT - HORIZON + 40, g => paintNear(g, land, ((i % 4) + 4) % 4)); c.restore();
    }
  }
  // (between the miniature's foot and the walking line: the near ground, flat, the land's front color)
  // (in each land's color where that land is: no whole-screen switch at a border)
  for (let x = 0; x < W;) {
    const land = landAt(cam + x); let e = x + 16;
    while (e < W && landAt(cam + e) === land) e += 16;
    R(c, x, NEAR_FOOT, Math.min(W, e) - x, H - NEAR_FOOT, LOOK[land].ground[2]);
    x = e;
  }
};

/** The ground he walks on (world space, before everything on it): from the profile down, in each land's color, a lit
 *  top edge (it's what you stand on), specks anchored to the world (no crawl). */
export const drawFinaleGround = (c: Ctx, state: GameState) => {
  const x0 = Math.floor(state.camera.x / 8) * 8 - 16, x1 = state.camera.x + W + 16;
  let x = x0;
  while (x < x1) {
    const land = landAt(x), L = LOOK[land];
    let xe = x; while (xe < x1 && landAt(xe) === land) xe += 8;
    c.fillStyle = L.ground[1];
    c.beginPath(); c.moveTo(x, H + 10);
    for (let xx = x; xx <= xe; xx += 8) c.lineTo(xx, floorY(xx));
    c.lineTo(xe, H + 10); c.closePath(); c.fill();
    // (the top edge: lit; a darker band under it)
    c.strokeStyle = L.ground[0]; c.lineWidth = 2; c.beginPath(); for (let xx = x; xx <= xe; xx += 8) { const y = floorY(xx) + 1; if (xx === x) c.moveTo(xx, y); else c.lineTo(xx, y); } c.stroke();
    c.strokeStyle = '#FFFFFF55'; c.lineWidth = 1; c.beginPath(); for (let xx = x; xx <= xe; xx += 8) { const y = floorY(xx); if (xx === x) c.moveTo(xx, y); else c.lineTo(xx, y); } c.stroke();
    for (let xx = Math.ceil(x / 24) * 24; xx < xe; xx += 24) { const y = floorY(xx) + 6 + Math.floor(hash(xx) * 30); c.fillStyle = L.ground[2]; c.fillRect(xx, y, 3, 2); }
    x = xe;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Ahead of him (the instant-loads rule: nothing painted the frame it's first seen): one stamp a frame, the next of the
// far and near tiles off the right of the screen, and the landmarks coming up, painted into their stamps on a scratch
// canvas at the screen's own scale, before they're wanted.

let scratch: Ctx | null = null;
const scratchCtx = () => {
  if (!scratch) { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; scratch = cv.getContext('2d')!; }
  scratch.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  return scratch;
};
const warmed = new Set<string>();
export const clearWarm = () => warmed.clear();
/** One a frame: true if it painted something. `extra`: the landmarks' (key, box, paint) ahead, nearest first. */
export const prewarmAhead = (state: GameState, extra: { key: string; x: number; y: number; w: number; h: number; paint: (g: Ctx) => void }[]) => {
  const cam = state.camera.x, jobs: { key: string; x: number; y: number; w: number; h: number; paint: (g: Ctx) => void }[] = [];
  { const off = cam * FAR_K, i = Math.floor(off / FAR_W) + 3, land = landAt((i * FAR_W + FAR_W / 2) / FAR_K), v = ((i % 3) + 3) % 3; jobs.push({ key: `fin-far-${land}-${v}`, x: 0, y: -30, w: FAR_W, h: 112, paint: g => paintFar(g, land, v) }); }
  { const off = cam * NEAR_K, i = Math.floor(off / NEAR_W) + 3, land = landAt((i * NEAR_W + NEAR_W / 2) / NEAR_K), v = ((i % 4) + 4) % 4; jobs.push({ key: `fin-near-${land}-${v}`, x: 0, y: -40, w: NEAR_W, h: NEAR_FOOT - HORIZON + 40, paint: g => paintNear(g, land, v) }); }
  jobs.push(...extra);
  for (const j of jobs) {
    if (warmed.has(j.key)) continue;
    warmed.add(j.key);
    // (asked twice: the stamp cache paints it into its stamp the second time)
    const g = scratchCtx();
    prestamp(g, j.key, j.x, j.y, j.w, j.h, j.paint);
    return true;
  }
  return false;
};
