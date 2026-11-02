// The flesh close-ups' shared kit (Phase F, group A: Artie, Donnie, Steve, Tucker, Dad Guy): the clothed hips and thighs
// round an X-ray lens over the crotch, the pelvis and femurs banded bone inside it, a hairy veined sac that squashes flat
// under his boot and bursts, the pubic bone cracking, blood sprayed, run down the lens and pooled. Each boss's file
// bakes its own scene (its clothes, its backdrop, its sin's props) with these, and runs the frame through runFlesh with
// its own hooks. Everything still is painted once (closeUp.ts bakeOnce, on first use); a frame is a few drawImages and a
// hundred-odd rects.

import { PANEL_W, PANEL_H, CLOSE_HIT, OPEN, CX, CY, rnd, lerp, clamp, bakeOnce, words } from '../closeUp';
import { type Hand, GRIP, RIP, handAt, strainOf, drawHand, drawTether, drawTent, effort, ripShake, gloveGore } from './ripKit';
import type { CloseUpLook } from '../closeUp';

export type Ctx = CanvasRenderingContext2D;
/** Light, base, shade, deep, line. */
export type Ramp = readonly [string, string, string, string, string];
const TAU = Math.PI * 2;

export const BONE: Ramp = ['#FFFFFF', '#E2E8F0', '#B6C3D6', '#7D8DA8', '#1E2A40'];
export const MEAT: Ramp = ['#FFD6E0', '#F7A1BC', '#E06A8E', '#A93A62', '#4E1028'];
export const BLOOD: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0707'];
const XBG = ['#0E2A52', '#0A1F3D', '#06142B', '#020617'];

// ---- the layout (the panel's): the lens, the bone, where the sac hangs
export const WX = CX, WY = 124, WRX = 160, WRY = 118;
/** The pubic bone's underside (the boot crushes the sac up against it). */
export const BONE_Y = 104;
export const SAC_Y = 150;
const ZX = CX, ZY = 140;

// =====================================================================================================================
// Bake-time painting (pixel loops are fine here: once, on first use)

/** A checker of `col` over a box (the SNES's dithered seam). */
export const dither = (g: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  g.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) g.fillRect(x + xx, y + yy, 1, 1);
};

/** Fills a path with hard bands of a ramp (idx: which shade each band is) along x or y, dithered seams, an outline. */
export const banded = (g: Ctx, path: (g: Ctx) => void, x: number, y: number, w: number, h: number, ramp: readonly string[], idx: number[], axis: 'x' | 'y' = 'y', outline?: string, lw = 3) => {
  g.save(); g.beginPath(); path(g); g.clip();
  const n = idx.length, len = axis === 'y' ? h : w;
  for (let i = 0; i < n; i++) {
    const a = Math.round(len * i / n), b = Math.round(len * (i + 1) / n);
    g.fillStyle = ramp[idx[i]];
    if (axis === 'y') g.fillRect(x, y + a, w, b - a + 1); else g.fillRect(x + a, y, b - a + 1, h);
  }
  for (let i = 1; i < n; i++) {
    if (idx[i] === idx[i - 1]) continue;
    const a = Math.round(len * i / n);
    if (axis === 'y') dither(g, x, y + a, w, 2, ramp[idx[i - 1]]); else dither(g, x + a, y, 2, h, ramp[idx[i - 1]]);
  }
  g.restore();
  if (outline) { g.beginPath(); path(g); g.strokeStyle = outline; g.lineWidth = lw; g.stroke(); }
};

/** The hips and thighs: the waist across the top, a thigh down each side, the crotch between (grow < 0 insets it). */
export const bodyPath = (g: Ctx, grow = 0, crotchY = CY + 8, gap = 56) => {
  g.moveTo(-20, -20); g.lineTo(PANEL_W + 20, -20); g.lineTo(PANEL_W + 20, 60);
  g.quadraticCurveTo(CX + 252 + grow, 200, CX + 228 + grow, PANEL_H + 20);
  g.lineTo(CX + gap - grow, PANEL_H + 20);
  g.quadraticCurveTo(CX + gap * 0.55 - grow, crotchY + 44, CX, crotchY - grow);
  g.quadraticCurveTo(CX - gap * 0.55 + grow, crotchY + 44, CX - gap + grow, PANEL_H + 20);
  g.lineTo(CX - 228 - grow, PANEL_H + 20);
  g.quadraticCurveTo(CX - 252 - grow, 200, -20, 60); g.closePath();
};
const leftHalf = (g: Ctx) => { g.rect(-20, -20, CX + 20, PANEL_H + 40); };
const rightHalf = (g: Ctx) => { g.rect(CX, -20, PANEL_W - CX + 20, PANEL_H + 40); };

/** A vein: a wandering line, a branch off it. */
export const vein = (g: Ctx, x: number, y: number, len: number, ang: number, col: string, w: number, seed: number) => {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
  let a = ang, px = x, py = y;
  for (let i = 0; i < 6; i++) {
    a += (rnd(seed + i * 3.1) - 0.5) * 0.9; px += Math.cos(a) * len / 6; py += Math.sin(a) * len / 6; g.lineTo(px, py);
    if (i === 2 && w > 1) { g.moveTo(px, py); g.lineTo(px + Math.cos(a + 0.8) * len / 4, py + Math.sin(a + 0.8) * len / 4); g.moveTo(px, py); }
  }
  g.stroke(); g.lineCap = 'butt';
};

/** Curly hairs over a box. */
export const hairs = (g: Ctx, x: number, y: number, w: number, h: number, n: number, col: string, seed: number, lw = 1.2) => {
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  for (let i = 0; i < n; i++) {
    const hx = x + rnd(seed + i) * w, hy = y + rnd(seed + i * 1.7 + 9) * h, l = 5 + rnd(seed + i * 2.3) * 9, a = rnd(seed + i * 4.1) * TAU;
    g.moveTo(hx, hy); g.quadraticCurveTo(hx + Math.cos(a + 1.4) * l, hy + Math.sin(a + 1.4) * l, hx + Math.cos(a) * l, hy + Math.sin(a) * l);
  }
  g.stroke();
};

/** A backdrop between the legs: hard bands top to bottom. */
export const paintBackdrop = (g: Ctx, cols: readonly string[]) => {
  const n = cols.length;
  for (let i = 0; i < n; i++) { g.fillStyle = cols[i]; g.fillRect(0, Math.floor(PANEL_H * i / n), PANEL_W, Math.ceil(PANEL_H / n) + 1); }
  for (let i = 1; i < n; i++) dither(g, 0, Math.floor(PANEL_H * i / n), PANEL_W, 2, cols[i - 1]);
};

/**
 * The clothes on the hips and thighs: each thigh banded round (lit from the left), the crotch's strain wrinkles, a sweat
 * stain, the shading down the inner thighs. Below `hem` (if any) the bare legs in `leg`.
 */
export const paintCloth = (g: Ctx, cloth: Ramp, o: { hem?: number; leg?: Ramp; stain?: boolean; legHair?: string } = {}) => {
  const L = [3, 2, 1, 0, 0, 1, 2, 3], R = [3, 2, 1, 1, 2, 2, 3, 3];
  const half = (clip: (g: Ctx) => void, x0: number, ramp: Ramp, idx: number[], y0: number, y1: number) => {
    g.save(); g.beginPath(); clip(g); g.clip(); g.beginPath(); g.rect(-20, y0, PANEL_W + 40, y1 - y0); g.clip();
    banded(g, p => bodyPath(p), x0, -20, CX + 20, PANEL_H + 40, ramp, idx, 'x');
    g.restore();
  };
  const hem = o.hem ?? PANEL_H + 40;
  half(leftHalf, -20, cloth, L, -20, hem); half(rightHalf, CX, cloth, R, -20, hem);
  if (o.hem !== undefined && o.leg) {
    half(leftHalf, -20, o.leg, L, hem, PANEL_H + 40); half(rightHalf, CX, o.leg, R, hem, PANEL_H + 40);
    if (o.legHair) { hairs(g, 20, hem + 6, CX - 100, PANEL_H - hem, 40, o.legHair, 51); hairs(g, CX + 80, hem + 6, CX - 100, PANEL_H - hem, 40, o.legHair, 77); }
    // (the hem: a rolled cuff, lit on its lip)
    g.save(); g.beginPath(); bodyPath(g); g.clip();
    g.fillStyle = cloth[4]; g.fillRect(0, hem - 2, PANEL_W, 4);
    g.fillStyle = cloth[1]; g.fillRect(0, hem - 12, PANEL_W, 10);
    g.fillStyle = cloth[0]; g.fillRect(0, hem - 12, PANEL_W, 2);
    g.fillStyle = cloth[3]; g.fillRect(0, hem - 4, PANEL_W, 2);
    g.restore();
  }
  g.save(); g.beginPath(); bodyPath(g); g.clip();
  // (the strain wrinkles fanned out from the crotch)
  for (let i = 0; i < 7; i++) {
    const s = i % 2 ? 1 : -1, k = (i >> 1) * 22;
    g.strokeStyle = cloth[3]; g.lineWidth = 3; g.beginPath();
    g.moveTo(CX + s * 12, CY - 2 - k * 0.3); g.quadraticCurveTo(CX + s * (50 + k), CY - 30 - k * 0.6, CX + s * (110 + k * 1.6), CY - 70 - k);
    g.stroke();
    g.strokeStyle = cloth[0]; g.lineWidth = 1; g.beginPath();
    g.moveTo(CX + s * 14, CY - 6 - k * 0.3); g.quadraticCurveTo(CX + s * (52 + k), CY - 34 - k * 0.6, CX + s * (110 + k * 1.6), CY - 74 - k);
    g.stroke();
  }
  // (the swamp: a dithered sweat stain round the crotch)
  if (o.stain !== false) {
    g.save(); g.beginPath(); g.ellipse(CX, CY + 10, 90, 56, 0, 0, TAU); g.clip(); dither(g, CX - 90, CY - 46, 180, 112, cloth[3]); g.restore();
    g.save(); g.beginPath(); g.ellipse(CX, CY + 14, 60, 38, 0, 0, TAU); g.clip(); dither(g, CX - 60, CY - 24, 120, 76, cloth[3], 1); g.restore();
  }
  g.restore();
  // (the shading down the inner thighs, the outline)
  g.beginPath(); bodyPath(g); g.strokeStyle = cloth[4]; g.lineWidth = 4; g.stroke();
};

const pelvisPath = (g: Ctx) => {
  g.moveTo(CX - 200, 10); g.quadraticCurveTo(CX - 120, 0, CX - 60, 34); g.quadraticCurveTo(CX - 30, 62, CX - 20, 92);
  g.lineTo(CX + 20, 92); g.quadraticCurveTo(CX + 30, 62, CX + 60, 34); g.quadraticCurveTo(CX + 120, 0, CX + 200, 10);
  g.lineTo(CX + 172, 64); g.quadraticCurveTo(CX + 100, 74, CX + 62, 96); g.lineTo(CX - 62, 96); g.quadraticCurveTo(CX - 100, 74, CX - 172, 64);
  g.closePath();
};

/** The lens: the dark banded glow, the body ghosted (skin and clothes see-through), the bones, the hair, the rim. */
export const paintWindow = (g: Ctx, o: { skin: Ramp; cloth: Ramp; hair: string; fat?: number; veins?: string }) => {
  g.save(); g.beginPath(); g.ellipse(WX, WY, WRX, WRY, 0, 0, TAU); g.clip();
  // (the glow: banded rings, dithered between)
  const x0 = WX - WRX, y0 = WY - WRY;
  const ring = (x: number, y: number) => { const dx = (x - WX) / WRX, dy = (y - WY - 14) / WRY; return Math.sqrt(dx * dx + dy * dy) * 4; };
  g.fillStyle = XBG[3]; g.fillRect(x0, y0, WRX * 2, WRY * 2);
  for (let b = 2; b >= 0; b--) { g.fillStyle = XBG[b]; g.beginPath(); g.ellipse(WX, WY + 14, WRX * (b + 1) / 4, WRY * (b + 1) / 4, 0, 0, TAU); g.fill(); }
  for (let yy = 0; yy < WRY * 2; yy++) for (let xx = (yy & 1); xx < WRX * 2; xx += 2) {
    const r = ring(x0 + xx, y0 + yy), b = Math.floor(r), f = r - b;
    if (b < 3 && f > 0.86) { g.fillStyle = XBG[b + 1]; g.fillRect(x0 + xx, y0 + yy, 1, 1); }
  }
  // (the body ghosted: the skin's tint, the clothes faded, the skin's lit edge)
  g.globalAlpha = 0.16; g.fillStyle = o.cloth[1]; g.beginPath(); bodyPath(g); g.fill();
  g.globalAlpha = 0.14; g.fillStyle = o.skin[1]; g.beginPath(); bodyPath(g, -10); g.fill();
  if (o.fat) { g.globalAlpha = 0.18; g.fillStyle = '#FDE68A'; g.beginPath(); bodyPath(g, -10); g.fill(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 0.18; g.beginPath(); bodyPath(g, -10 - o.fat); g.fill(); g.globalCompositeOperation = 'source-over'; }
  g.globalAlpha = 0.7; g.strokeStyle = '#7DD3FC'; g.lineWidth = 2; g.beginPath(); bodyPath(g, -6); g.stroke();
  g.globalAlpha = 0.35; g.strokeStyle = o.cloth[0]; g.lineWidth = 1; g.beginPath(); bodyPath(g); g.stroke();
  g.globalAlpha = 1;
  // (the veins up the inner thighs, glowing)
  const vc = o.veins ?? 'rgba(220,38,38,0.55)';
  for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1; vein(g, CX + s * (70 + i * 6), PANEL_H - 10 - i * 8, 90, -Math.PI / 2 - s * 0.3, vc, 2, i * 13 + 5); }
  // (the pelvis: banded bone, the hole through it, a lit top edge)
  banded(g, pelvisPath, CX - 210, 0, 420, 100, BONE, [0, 1, 1, 2, 3], 'y', BONE[4], 3);
  g.fillStyle = XBG[1]; g.beginPath(); g.ellipse(CX, 56, 34, 26, 0, 0, TAU); g.fill();
  g.strokeStyle = BONE[3]; g.lineWidth = 3; g.stroke();
  g.fillStyle = BONE[0]; g.fillRect(CX - 190, 9, 110, 2); g.fillRect(CX + 80, 9, 110, 2);
  dither(g, CX - 150, 40, 60, 10, BONE[3]); dither(g, CX + 90, 40, 60, 10, BONE[3]);
  // (the femurs: a ball in each socket, the shafts down, angled in)
  for (const s of [-1, 1]) {
    g.save(); g.translate(CX + s * 132, 74); g.rotate(s * 0.12);
    banded(g, p => p.rect(-12, 6, 24, PANEL_H), -12, 6, 24, PANEL_H, BONE, s < 0 ? [1, 0, 1, 2, 3] : [2, 1, 0, 1, 3], 'x', BONE[4], 2);
    g.restore();
    banded(g, p => p.ellipse(CX + s * 132, 74, 21, 19, 0, 0, TAU), CX + s * 132 - 21, 55, 42, 38, BONE, [0, 1, 2, 3], 'y', BONE[4], 2);
  }
  // (the pubic bone at the front, the joint down its middle: what cracks)
  banded(g, p => p.roundRect(CX - 30, 88, 60, BONE_Y - 88, 5), CX - 30, 88, 60, BONE_Y - 88, BONE, [0, 1, 2], 'y', BONE[4], 2);
  g.fillStyle = BONE[3]; g.fillRect(CX - 1, 90, 2, BONE_Y - 92);
  // (the bush: wiry curls round the bone)
  hairs(g, CX - 80, 92, 160, 40, 90, o.hair, 3, 1.4);
  // (scanlines)
  g.fillStyle = 'rgba(0,0,0,0.2)'; for (let yy = y0; yy < y0 + WRY * 2; yy += 3) g.fillRect(x0, yy, WRX * 2, 1);
  g.restore();
  // (the rim: black, a hot cyan ring, a white inner glint)
  g.beginPath(); g.ellipse(WX, WY, WRX + 2, WRY + 2, 0, 0, TAU); g.strokeStyle = '#000'; g.lineWidth = 7; g.stroke();
  g.beginPath(); g.ellipse(WX, WY, WRX, WRY, 0, 0, TAU); g.strokeStyle = '#38BDF8'; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.ellipse(WX, WY, WRX - 3, WRY - 3, 0, Math.PI * 1.05, Math.PI * 1.45); g.strokeStyle = '#E0F2FE'; g.lineWidth = 2; g.stroke();
};

/** The X-RAY tag (and the boss's name on it) in the corner. */
export const paintTag = (g: Ctx, name: string) => {
  g.font = '10px "Press Start 2P"';
  const w = Math.max(64, g.measureText(name).width + 16);
  g.fillStyle = '#000'; g.fillRect(4, 4, w, 34);
  g.fillStyle = '#7DD3FC'; g.fillText('X-RAY', 10, 19);
  g.fillStyle = '#FDE68A'; g.fillText(name, 10, 33);
};

/** The sac: two veined testicles (MK's meat-pink) inside a see-through hairy wrinkled bag, 100x80. `bruised` goes purple. */
export const bakeSac = (key: string, skin: Ramp, hair: string, bruised = false) => bakeOnce(key, g => {
  const meat = MEAT;
  // (the cords up out of the top)
  for (const s of [-1, 1]) { g.strokeStyle = meat[4]; g.lineWidth = 7; g.beginPath(); g.moveTo(50 + s * 14, 26); g.lineTo(50 + s * 8, 0); g.stroke(); g.strokeStyle = meat[2]; g.lineWidth = 4; g.stroke(); }
  for (const [x, y] of [[33, 44], [67, 47]] as const) {
    banded(g, p => p.ellipse(x, y, 17, 21, 0, 0, TAU), x - 17, y - 21, 34, 42, meat, [0, 1, 2, 3], 'y', meat[4], 2);
    g.fillStyle = meat[2]; g.beginPath(); g.ellipse(x + (x < 50 ? -9 : 9), y - 12, 7, 9, 0, 0, TAU); g.fill();
    vein(g, x - 8, y - 10, 26, 1.2, '#6D5BD0', 1.5, x);
    vein(g, x + 6, y + 8, 18, -0.4, '#6D5BD0', 1, x + 3);
    g.fillStyle = '#FFFFFF'; g.fillRect(x - 9, y - 13, 4, 3);
  }
  // (the bag: skin over them, see-through, wrinkled, hairy, beaded with sweat)
  const bag = (p: Ctx) => { p.moveTo(22, 20); p.quadraticCurveTo(4, 40, 10, 62); p.quadraticCurveTo(22, 82, 40, 74); p.quadraticCurveTo(50, 70, 60, 76); p.quadraticCurveTo(82, 84, 92, 62); p.quadraticCurveTo(96, 38, 78, 20); p.closePath(); };
  g.globalAlpha = 0.5; banded(g, bag, 0, 16, 100, 70, skin, [1, 2, 2, 3], 'y'); g.globalAlpha = 1;
  g.beginPath(); bag(g); g.strokeStyle = skin[4]; g.lineWidth = 2; g.stroke();
  g.strokeStyle = skin[3]; g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) { const x = 16 + rnd(i * 3) * 68, y = 28 + rnd(i * 5 + 1) * 44; g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x, y + 3, x + 6, y - 1); g.stroke(); }
  g.strokeStyle = skin[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(50, 24); g.quadraticCurveTo(48, 50, 50, 72); g.stroke();
  hairs(g, 4, 18, 92, 64, 22, hair, 21, 1.3);
  g.fillStyle = '#FFFFFF'; for (let i = 0; i < 5; i++) g.fillRect(18 + rnd(i * 7 + 2) * 64, 30 + rnd(i * 9) * 36, 2, 2);
  if (bruised) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(91,33,182,0.5)'; g.fillRect(0, 0, 100, 86);
    g.fillStyle = 'rgba(185,28,28,0.35)'; g.fillRect(0, 50, 100, 36);
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) vein(g, 20 + i * 18, 30, 30, 1.6, '#DC2626', 1.5, i * 17);
  }
}, 100, 86);

/** Blood splats for the lens (three, side by side, 40x40 each). */
const splats = () => bakeOnce('flesh-splats', g => {
  for (let v = 0; v < 3; v++) {
    const ox = v * 40 + 20, oy = 20;
    g.fillStyle = BLOOD[4];
    for (let i = 0; i < 8; i++) { const a = rnd(v * 20 + i) * TAU, d = 9 + rnd(v * 31 + i) * 9, r = 2 + rnd(v + i * 3) * 2.5; g.beginPath(); g.arc(ox + Math.cos(a) * d, oy + Math.sin(a) * d, r + 1, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(ox, oy, 10, 0, TAU); g.fill();
    g.fillStyle = BLOOD[2];
    for (let i = 0; i < 8; i++) { const a = rnd(v * 20 + i) * TAU, d = 9 + rnd(v * 31 + i) * 9, r = 2 + rnd(v + i * 3) * 2.5; g.beginPath(); g.arc(ox + Math.cos(a) * d, oy + Math.sin(a) * d, r, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(ox, oy, 9, 0, TAU); g.fill();
    g.fillStyle = BLOOD[1]; g.beginPath(); g.arc(ox - 2, oy - 2, 5, 0, TAU); g.fill();
    g.fillStyle = BLOOD[0]; g.fillRect(ox - 5, oy - 5, 3, 2);
  }
}, 120, 40);

// =====================================================================================================================
// Per frame

/** The boot's toe: up from below, landing at `hitY`, driven in to `deep` over 3 frames, grinding there. */
export const kickY = (t: number, hitY: number, deep: number) => {
  const hit = t - CLOSE_HIT;
  if (hit < 0) { const k = clamp((t - OPEN) / (CLOSE_HIT - OPEN)); return lerp(PANEL_H + 100, hitY, k * k); }
  if (hit < 3) return lerp(hitY, deep, hit / 3);
  return deep + 4 + Math.sin(hit * 0.7) * 3 * Math.max(0, 1 - hit / 30);
};

/** The sac between the bone and his toe: hanging, swaying, then squashed flat (wider as it flattens). */
export const drawSac = (c: Ctx, t: number, toe: number, sac: HTMLCanvasElement, bruise: HTMLCanvasElement | null, scale: number, y = SAC_Y) => {
  const h0 = 80 * scale, w0 = 100 * scale;
  const sway = Math.sin(t * 0.25) * 2;
  const restTop = y - h0 * 0.48, restBot = y + h0 * 0.52;
  const push = Math.max(0, restBot - (toe - 18));
  const top = Math.max(BONE_Y - 4, restTop - push * 0.5);
  const bot = Math.max(top + 12, restBot - push);
  const h = bot - top, w = Math.min(190, w0 * Math.sqrt(h0 / h));
  c.drawImage(sac, CX - w / 2 + (push ? 0 : sway), top, w, h * 86 / 80);
  if (bruise && push > 0) { c.globalAlpha = clamp(push / 30); c.drawImage(bruise, CX - w / 2, top, w, h * 86 / 80); c.globalAlpha = 1; }
};

/** The burst: the pulp on his toe, bits of ball flung out and falling, the bag's torn flaps and the cords dangling. */
export const drawBurst = (c: Ctx, k: number, toe: number, skin: Ramp, seed = 0, cols: readonly string[] = [MEAT[1], MEAT[2], MEAT[3], BLOOD[2]]) => {
  // (the cords, snapped, swinging)
  for (const s of [-1, 1]) {
    const sw = Math.sin(k * 0.3 + s) * 10 * Math.max(0.2, 1 - k / 60);
    c.strokeStyle = MEAT[4]; c.lineWidth = 6; c.beginPath(); c.moveTo(CX + s * 10, BONE_Y - 6); c.quadraticCurveTo(CX + s * 26 + sw, BONE_Y + 16, CX + s * 18 + sw * 1.6, BONE_Y + 30); c.stroke();
    c.strokeStyle = MEAT[2]; c.lineWidth = 3; c.stroke();
    c.fillStyle = BLOOD[2]; c.fillRect(CX + s * 18 + sw * 1.6 - 3, BONE_Y + 28 + (k % 8), 5, 5);
  }
  // (the bag's flaps, torn open, hanging off either side of the boot)
  for (const s of [-1, 1]) {
    const fl = Math.sin(k * 0.2 + s * 2) * 3;
    c.fillStyle = skin[4]; c.beginPath(); c.moveTo(CX + s * 20, toe - 22); c.quadraticCurveTo(CX + s * 56, toe - 26 + fl, CX + s * 50 + fl, toe + 14); c.quadraticCurveTo(CX + s * 40, toe - 2, CX + s * 20, toe - 10); c.fill();
    c.fillStyle = skin[2]; c.beginPath(); c.moveTo(CX + s * 22, toe - 20); c.quadraticCurveTo(CX + s * 52, toe - 22 + fl, CX + s * 47 + fl, toe + 9); c.quadraticCurveTo(CX + s * 38, toe - 3, CX + s * 22, toe - 12); c.fill();
    c.fillStyle = BLOOD[3]; c.fillRect(CX + s * 44 + fl - 2, toe + 6, 4, 6 + Math.min(20, k));
  }
  // (the pulp smeared over his toe)
  c.fillStyle = BLOOD[4]; c.beginPath(); c.ellipse(CX - 4, toe - 26, 46, 11, 0, 0, TAU); c.fill();
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(CX - 4, toe - 27, 43, 8, 0, 0, TAU); c.fill();
  c.fillStyle = MEAT[2]; for (let i = 0; i < 6; i++) c.fillRect(CX - 36 + i * 12, toe - 31 + (i % 2) * 4, 7, 4);
  c.fillStyle = MEAT[0]; c.fillRect(CX - 20, toe - 31, 3, 2); c.fillRect(CX + 14, toe - 30, 3, 2);
  // (the bits flung out, tumbling down)
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI / 2 + (rnd(seed + i * 3.3) - 0.5) * 3.4, v = 3 + rnd(seed + i * 1.9) * 6;
    const x = CX + Math.cos(a) * v * k, y = toe - 26 + Math.sin(a) * v * k + 0.3 * k * k;
    if (y > PANEL_H + 10) continue;
    const s = 4 + (i % 4) * 2;
    c.fillStyle = MEAT[4]; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, s + 2, s * 0.8 + 2);
    c.fillStyle = cols[i % cols.length]; c.fillRect(Math.round(x), Math.round(y), s, s * 0.8);
    if (i % 3 === 0) { c.fillStyle = MEAT[0]; c.fillRect(Math.round(x), Math.round(y), 2, 1); }
  }
};

/** The pubic bone cracking: lines branching out from the joint, a gap opening, chips of bone flying. */
export const drawCracks = (c: Ctx, k: number, seed = 0, x = CX, y = BONE_Y - 6) => {
  if (k < 0) return;
  const g = clamp(k / 14);
  // (the joint splitting)
  c.fillStyle = '#000'; c.fillRect(x - 1 - g * 3, 88, 2 + g * 6, BONE_Y - 86);
  c.lineCap = 'round';
  for (const [col, w, off] of [['#000', 3, 0], [BONE[0], 1, -1]] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (rnd(seed + i * 2.7) - 0.5) * 3.0;
      let px = x, py = y, aa = a;
      c.moveTo(px + off, py + off);
      const segs = Math.ceil(4 * g);
      for (let s = 0; s < segs; s++) {
        aa += (rnd(seed + i * 5 + s) - 0.5) * 0.9;
        const l = (14 + rnd(seed + i + s * 7) * 18) * Math.min(1, g * 4 - s);
        if (l <= 0) break;
        px += Math.cos(aa) * l; py += Math.sin(aa) * l * 0.7; c.lineTo(px + off, py + off);
        if (s === 1) { c.lineTo(px + Math.cos(aa + 1) * l * 0.6 + off, py + Math.sin(aa + 1) * l * 0.4 + off); c.moveTo(px + off, py + off); }
      }
    }
    c.stroke();
  }
  c.lineCap = 'butt';
  // (chips)
  if (k < 24) for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (rnd(seed + i * 9.1) - 0.5) * 2.6, v = 3 + rnd(seed + i * 4.4) * 4;
    const cx = x + Math.cos(a) * v * k, cy = y + Math.sin(a) * v * k + 0.3 * k * k;
    c.fillStyle = BONE[4]; c.fillRect(cx - 1, cy - 1, 6, 5); c.fillStyle = BONE[i % 2]; c.fillRect(cx, cy, 4, 3);
  }
};

/**
 * The blood: a spray out of the wound, two pulsing jets, drips running off down, splats on the lens running, and a pool
 * filling the bottom. `cols` mixes in other stuff (bile, beer). k: frames since the burst.
 */
export const drawBlood = (c: Ctx, k: number, x: number, y: number, o: { seed?: number; cols?: readonly string[]; pool?: string[] } = {}) => {
  if (k < 0) return;
  const seed = o.seed ?? 0, cols = o.cols ?? [BLOOD[1], BLOOD[2], BLOOD[3], BLOOD[1]];
  // (the spray)
  for (let i = 0; i < 52; i++) {
    const st = Math.floor(rnd(seed + i * 5) * 10), kk = k - st;
    if (kk < 0) continue;
    const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 3.1, v = 4 + rnd(seed + i * 2) * 9;
    const px = Math.round(x + Math.cos(a) * v * kk), py = Math.round(y + Math.sin(a) * v * kk + 0.34 * kk * kk);
    if (py > PANEL_H + 8 || px < -10 || px > PANEL_W + 10) continue;
    const r = 2 + (i % 4);
    c.fillStyle = cols[i % cols.length]; c.fillRect(px - r, py - r, r * 2, r * 2);
    c.fillStyle = BLOOD[0]; c.fillRect(px - r, py - r, Math.max(1, r - 1), 1);
  }
  // (the jets: pumping in beats, weaker each)
  if (k < 60) for (const s of [-1, 1]) {
    const beat = (k % 12) / 12, pw = (1 - k / 60) * (beat < 0.5 ? 1 : 0.4);
    for (let j = 0; j < 9; j++) {
      const q = j / 9, d = q * 130 * pw;
      const px = x + s * d * 0.8, py = y - 20 - Math.sin(q * Math.PI) * 70 * pw + q * q * 40;
      c.fillStyle = j % 2 ? BLOOD[1] : BLOOD[2]; c.fillRect(px - 4, py - 4, 8 - q * 3, 8 - q * 3);
    }
  }
  // (drips off the boot's sides and the inner thighs)
  for (let i = 0; i < 8; i++) {
    const st = 4 + Math.floor(rnd(seed + i * 7) * 14), kk = k - st;
    if (kk < 0) continue;
    const dx = (i % 2 ? 1 : -1) * (38 + rnd(seed + i * 3) * 50), len = Math.min(PANEL_H - y, kk * (2 + rnd(seed + i) * 2.5)), w = 3 + (i % 3);
    c.fillStyle = BLOOD[3]; c.fillRect(x + dx - 1, y - 6, w + 2, len);
    c.fillStyle = BLOOD[2]; c.fillRect(x + dx, y - 6, w, len);
    c.fillStyle = BLOOD[2]; c.fillRect(x + dx - 2, y - 6 + len - 2, w + 4, w + 3);
  }
  // (splats hitting the lens, running down it)
  const sp = splats();
  for (let i = 0; i < 6; i++) {
    const st = 2 + Math.floor(rnd(seed + i * 11) * 10), kk = k - st;
    if (kk < 0) continue;
    const sx = 40 + rnd(seed + i * 13) * (PANEL_W - 120), sy = 20 + rnd(seed + i * 17) * 120, run = Math.min(140, kk * (0.8 + rnd(i) * 1.2));
    c.fillStyle = BLOOD[3]; c.fillRect(sx + 16, sy + 20, 6, run); c.fillStyle = BLOOD[2]; c.fillRect(sx + 17, sy + 20, 4, run);
    c.fillRect(sx + 15, sy + 18 + run, 8, 6);
    c.drawImage(sp, (i % 3) * 40, 0, 40, 40, sx, sy, 40, 40);
  }
  // (the pool, filling the bottom, its top lit and wobbling)
  if (k > 12) {
    const ph = Math.min(30, (k - 12) * 0.7), pw = Math.min(PANEL_W, 120 + (k - 12) * 14);
    const pc = o.pool ?? [BLOOD[3], BLOOD[2], BLOOD[1]];
    for (let i = 0; i < 8; i++) {
      const wx = CX - pw / 2 + i * pw / 8, wob = Math.sin(k * 0.2 + i) * 2;
      c.fillStyle = BLOOD[4]; c.fillRect(wx, PANEL_H - ph - wob - 2, pw / 8 + 1, ph + wob + 2);
      c.fillStyle = pc[0]; c.fillRect(wx, PANEL_H - ph - wob, pw / 8 + 1, ph + wob);
      c.fillStyle = pc[1]; c.fillRect(wx, PANEL_H - ph - wob, pw / 8 + 1, 4);
      c.fillStyle = pc[2]; c.fillRect(wx + 4, PANEL_H - ph - wob, pw / 16, 1);
    }
  }
};

/** A caption bar along the bottom (ALL CAPS). */
export const caption = (c: Ctx, text: string, col = '#FDE68A') => {
  c.font = '10px "Press Start 2P"';
  const w = c.measureText(text).width + 16;
  c.fillStyle = '#000'; c.fillRect(PANEL_W - w - 6, PANEL_H - 24, w, 18);
  c.fillStyle = col; c.fillText(text, PANEL_W - w + 2, PANEL_H - 10);
};

// =====================================================================================================================
// The run: the standard order of a frame, with each boss's hooks. THE RIP (ripKit.ts; the owner's "he just tears them
// out"): his glove comes up and clamps on the sac (GRIP), wrenches it down in jerks, the sac and its cords stretching
// long, the bone cracking with the strain, till it tears free (RIP) in a gush; the torn flaps and snapped cords left
// hanging, the bag (and what's in it) held up in his fist, bloody, shaken.

export interface FleshRun {
  id: string;
  /** The still scene: backdrop, the clothed body, the lens. */
  scene: () => HTMLCanvasElement;
  /** A still layer over the hand (a gut, a belt). */
  over?: () => HTMLCanvasElement;
  skin: Ramp; hair: string;
  sacScale?: number; sacY?: number;
  /** Frames after the tear the blood comes (default 0: there and then; a lazy one's late) and the shake lands. */
  gushAt?: number; shakeAt?: number; shakeAmp?: number;
  word: string; wordAt?: number;
  caption?: string; captionAt?: number; captionCol?: string;
  bloodCols?: readonly string[]; burstCols?: readonly string[]; pool?: string[];
  /** Hooks, `rip` frames since it tore free (< 0 before), `hand` the fist's y while it's in there (off the panel
   *  after): after the scene (behind the sac), after the sac (behind the hand), after the hand (and `over`), last. */
  behind?: (c: Ctx, t: number, rip: number, hand: number) => void;
  front?: (c: Ctx, t: number, rip: number, hand: number) => void;
  overBoot?: (c: Ctx, t: number, rip: number, hand: number) => void;
  top?: (c: Ctx, t: number, rip: number, hand: number) => void;
}

/** The sac between the bone and his fist: hanging, swaying; clamped, then dragged down long and thin by it, bruising
 *  as it goes. */
const drawSacPulled = (c: Ctx, t: number, h: Hand, sac: HTMLCanvasElement, bruise: HTMLCanvasElement, scale: number, y: number) => {
  const h0 = 80 * scale, w0 = 100 * scale;
  const restTop = y - h0 * 0.48;
  const bot = Math.max(restTop + h0, h.shut ? h.y + 12 : 0);
  const top = restTop + (bot - restTop - h0) * 0.18;
  const hh = bot - top, w = w0 * Math.sqrt(h0 / hh) * (h.shut ? 0.92 : 1);
  const x = CX - w / 2 + (h.shut ? (h.x - CX) * 0.4 : Math.sin(t * 0.25) * 2);
  c.drawImage(sac, x, top, w, hh * 86 / 80);
  if (h.strain > 0) { c.globalAlpha = clamp(h.strain * 1.3); c.drawImage(bruise, x, top, w, hh * 86 / 80); c.globalAlpha = 1; }
};

/** What's held up after: the torn bag, its two in it, dripping, the cords hanging off it. */
const trophy = (key: string, skin: Ramp, hair: string) => bakeOnce(`${key}-trophy`, g => {
  g.drawImage(bakeSac(`${key}-sacB`, skin, hair, true), 0, 6);
  // (the torn top: ragged, red; the cords hanging)
  g.fillStyle = BLOOD[3];
  g.beginPath(); g.moveTo(16, 26); for (let i = 0; i <= 8; i++) g.lineTo(16 + i * 8.5, 18 + (i % 2) * 9); g.lineTo(84, 30); g.closePath(); g.fill();
  g.fillStyle = BLOOD[1]; for (let i = 0; i < 6; i++) g.fillRect(20 + i * 11, 22 + (i % 2) * 4, 6, 4);
  for (const s of [-1, 1]) { g.strokeStyle = MEAT[4]; g.lineWidth = 6; g.beginPath(); g.moveTo(50 + s * 12, 24); g.quadraticCurveTo(50 + s * 24, 8, 50 + s * 18, 0); g.stroke(); g.strokeStyle = MEAT[2]; g.lineWidth = 3; g.stroke(); }
  // (blood smeared down it)
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(185,28,28,0.45)'; for (let i = 0; i < 5; i++) g.fillRect(14 + i * 16, 20, 8, 30 + rnd(i * 3) * 40);
  g.globalCompositeOperation = 'source-over';
}, 100, 96);

/** Drops falling off what he's holding up. */
const drawBloodDrips = (c: Ctx, k: number, x: number, y: number) => {
  for (let i = 0; i < 6; i++) {
    const u = (k * 3 + i * 13) % 44, dx = (rnd(i * 4.1) - 0.5) * 50;
    c.fillStyle = BLOOD[3]; c.fillRect(Math.round(x + dx) - 1, Math.round(y + 20 + u * 2.4) - 1, 6, 7);
    c.fillStyle = BLOOD[1]; c.fillRect(Math.round(x + dx), Math.round(y + 20 + u * 2.4), 4, 5);
  }
};

export const runFlesh = (c: Ctx, t: number, look: CloseUpLook, r: FleshRun) => {
  const rip = t - RIP;
  const shakeAt = r.shakeAt ?? 0, amp = r.shakeAmp ?? 12;
  const scale = r.sacScale ?? 1, sacY = r.sacY ?? SAC_Y;
  const h = handAt(t, CX, sacY + 80 * scale * 0.4, { pull: 48 });
  const hook = h.held ? PANEL_H + 60 : h.y;
  c.save();
  // (the zoom: creeping in as he reaches, pushing in as he strains, snapping on the tear, easing back)
  const z = t < GRIP ? 1 + 0.05 * clamp(t / GRIP) ** 2 : rip < 0 ? 1.05 + 0.06 * strainOf(t) : 1.14 - 0.08 * clamp(rip / 30);
  c.translate(ZX, ZY); c.scale(z, z); c.translate(-ZX, -ZY);
  if (rip < 0) ripShake(c, t, amp);
  const sh = rip - shakeAt;
  if (sh >= 0 && sh < 12) c.translate((sh % 2 ? 1 : -1) * amp * (1 - sh / 12), (sh % 3 - 1) * amp * 0.3 * (1 - sh / 12));
  // (the twitching, after; the body jerked toward him with each yank before)
  const tw = rip > 14 && (rip * 7) % 23 < 2 ? (rip % 2 ? 2 : -2) : 0;
  const jy = rip < 0 ? h.jerk * h.strain * 5 : 0;
  c.drawImage(r.scene(), tw, jy);
  r.behind?.(c, t, rip, hook);
  // (the bone cracking with the strain, and on through the tear)
  drawCracks(c, t - (GRIP + 18), r.id.length * 7);
  // (the sac: hanging behind whatever's in front of it (a sock, a cup, an apron); once he's got it, dragged out from
  // under it all, long, the cords and the skin stretched down to his fist)
  const sac = () => drawSacPulled(c, t, h, bakeSac(`${r.id}-sac`, r.skin, r.hair), bakeSac(`${r.id}-sacB`, r.skin, r.hair, true), scale, sacY + jy);
  if (rip < 0 && !h.shut) sac();
  if (rip >= 0) drawBurst(c, rip, BONE_Y + 46, r.skin, r.id.length * 3, r.burstCols);
  r.front?.(c, t, rip, hook);
  if (rip < 0 && h.shut) {
    drawTent(c, CX, BONE_Y + 6 + jy, h.x, h.y, h.strain, r.skin[2], r.skin[4], 60 * scale);
    sac();
    drawTether(c, t, CX, BONE_Y - 4 + jy, h.x, h.y - 30, h.strain, [MEAT[4], MEAT[2], MEAT[0]], 2, 8, 14);
  }
  if (h.held) { c.save(); c.translate(h.x, h.y - 8); c.rotate(h.rot * 1.5 + Math.sin(rip * 0.5) * 0.1); c.drawImage(trophy(r.id, r.skin, r.hair), -50, -80); c.restore(); }
  drawHand(c, h, t);
  gloveGore(c, h, [BLOOD[2], BLOOD[1], BLOOD[3]]);
  if (r.over) c.drawImage(r.over(), tw, jy);
  r.overBoot?.(c, t, rip, hook);
  drawBlood(c, rip - (r.gushAt ?? 0), CX, BONE_Y + 22, { seed: r.id.length * 11, cols: r.bloodCols, pool: r.pool });
  // (and off the trophy, raining down as he shakes it)
  if (h.held) drawBloodDrips(c, rip, h.x, h.y - 20);
  r.top?.(c, t, rip, hook);
  c.restore();
  effort(c, t);
  const wa = r.wordAt ?? 1;
  if (rip >= wa) words(c, rip - wa + 1, look, r.word);
  if (r.caption && rip >= (r.captionAt ?? 24)) caption(c, r.caption, r.captionCol);
  // (the grab's squish: a quick white; the tear's flash: white, then red)
  if (t >= GRIP && t < GRIP + 2) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 0, PANEL_W, PANEL_H); }
  if (sh >= 0 && sh < 2) { c.fillStyle = `rgba(255,255,255,${sh ? 0.35 : 0.75})`; c.fillRect(0, 0, PANEL_W, PANEL_H); }
  else if (sh >= 2 && sh < 5) { c.fillStyle = 'rgba(220,0,0,0.22)'; c.fillRect(0, 0, PANEL_W, PANEL_H); }
};
