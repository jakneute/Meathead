// Behind the dino park (screen space): a tropical sky at whatever hour it is (timeOfDay.ts), clouds drifting, and the
// park going back to the horizon in layers, each sliding by at its own depth: jungle mountains (a waterfall down one),
// the hills (palms, the park's water tower, a brachiosaurus animatronic over the trees, nodding), far paddocks (fences,
// a stranded monorail car, a safari jeep), and the tree line nearest, meeting the ground the world paints from there in.
//
// Every layer's painted once per hour into a held canvas (a tile, repeated) and put down with one drawImage; only the
// clouds, the brachiosaurus's head and the waterfall's shimmer move.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { GY } from '../../geometry';
import { timeOfDay, skyRamp, sunAt, sunTint, cloudTint, farTint, drawStars, drawMoon, hourMix } from '../../../timeOfDay';
import { type Ctx, box, mix, hash, checker, bandedGradient, steppedGlow, pixelBlob, PIX } from './kit';
import { pixelRidge } from '../../../../m1/game/render/pixelArt';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The horizon: where the eye is (see kit's eyeOf), always the same height on screen. */
const HZ = Math.round(H * 0.42);

// ---------------------------------------------------------------------------------------------------------------
// Held canvases (keyed by the hour)

const held = new Map<string, HTMLCanvasElement>();
const heldCanvas = (c: Ctx, key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') return null;
  const a = Math.abs(c.getTransform().a) || 1;
  const id = `${key}@${a.toFixed(3)}@${timeOfDay().key}`;
  let cv = held.get(id);
  if (!cv) {
    if (held.size > 120) held.clear();
    cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w * a)); cv.height = Math.max(1, Math.ceil(h * a));
    const g = cv.getContext('2d')!;
    g.scale(a, a); g.imageSmoothingEnabled = false;
    paint(g);
    held.set(id, cv);
  }
  return cv;
};
const put = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => {
  const cv = heldCanvas(c, key, w, h, paint);
  if (!cv) return;
  const a = Math.abs(c.getTransform().a) || 1;
  c.drawImage(cv, Math.round(x), Math.round(y), cv.width / a, cv.height / a);
};
const tiled = (c: Ctx, key: string, scroll: number, y: number, tw: number, h: number, paint: (g: Ctx) => void) => {
  const off = Math.round(((scroll % tw) + tw) % tw);
  for (let x = -off; x < W; x += tw) put(c, key, x, y, tw, h, paint);
};

// ---------------------------------------------------------------------------------------------------------------

const SKY = ['#1F64C4', '#2E78D2', '#4690DC', '#62A6E4', '#84BCEA', '#A6D0EE', '#C6E0EC', '#DDEADE', '#ECEBCB'];

/** A layer at depth d: where its ground line is on screen (the further, the nearer the horizon), how far it's slid. */
const baseOf = (d: number, camY: number) => Math.round(HZ + d * (GY - camY - HZ));
const scrollOf = (d: number, camX: number) => (camX + W / 2) * d;

export const drawDinoBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, camY = state.camera.y, f = state.frame || 0;
  const tod = timeOfDay();
  put(c, 'dsky', 0, 0, W, H, paintSky);
  drawStars(c, 0, 0, W, HZ, f, cam * 0.02);
  drawMoon(c, 150, 92);
  clouds(c, cam, f, 0);
  clouds(c, cam, f, 1);
  // The mountains, the hills, the far paddocks, the tree line: each its own depth
  const layers: [string, number, number, number, (g: Ctx) => void][] = [
    ['dmtn', 0.03, 1200, 190, g => paintMountains(g, 1200, 190)],
    ['dhill', 0.12, 960, 180, g => paintHills(g, 960, 180)],
    ['dpad', 0.3, 1100, 150, g => paintPaddocks(g, 1100, 150)],
    ['dtree', 0.5, 880, 170, g => paintTreeLine(g, 880, 170)],
  ];
  for (const [key, d, tw, th, paint] of layers) {
    const base = baseOf(d, camY), y = base - (th - 24);
    if (y > H) continue;
    tiled(c, key, scrollOf(d, cam), y, tw, th, paint);
    // (under it, its ground, on down to whatever's nearer)
    if (base + 24 < H) box(c, 0, base + 24, W, H - base - 24, farTint(GROUND[key], 1 - d, tod));
    if (key === 'dmtn') waterfall(c, cam, camY, f);
    if (key === 'dhill') brachio(c, cam, camY, f);
  }
};
const GROUND: Record<string, string> = { dmtn: '#4E6A5A', dhill: '#4A6B34', dpad: '#5E7A34', dtree: '#4F6A2A' };

// ---------------------------------------------------------------------------------------------------------------
// The sky

const paintSky = (g: Ctx) => {
  const tod = timeOfDay();
  bandedGradient(g, 0, 0, W, HZ + 40, skyRamp(SKY, tod), 18);
  box(g, 0, HZ + 40, W, H - HZ - 40, skyRamp(SKY, tod)[SKY.length - 1]);
  // (high wisps, flat, lit along their tops)
  for (let i = 0; i < 5; i++) {
    const x = Math.round(hash(i * 4.1) * 760) - 40, y = 24 + i * 22 + Math.round(hash(i * 2.7) * 8), w = 100 + Math.round(hash(i * 8.3) * 120);
    g.globalAlpha = 0.2 + 0.05 * (i % 3);
    box(g, x + 10, y, w - 20, 2, cloudTint('#EEF6FF', tod)); box(g, x + 26, y - 2, w - 60, 2, cloudTint('#FFFFFF', tod));
    checker(g, x, y, 10, 2, cloudTint('#EEF6FF', tod)); checker(g, x + w - 10, y, 10, 2, cloudTint('#EEF6FF', tod), 1);
    g.globalAlpha = 1;
  }
  // (the sun, over the jungle to the right: glare in rings, a hot disc, sinking gold toward evening)
  const sun = sunAt(620, 70, HZ, tod);
  if (sun.up <= 0.02) return;
  g.globalAlpha = sun.up;
  steppedGlow(g, sun.x, sun.y, 120, sunTint('#FFF2C0', tod), 0.28, 0, 6);
  steppedGlow(g, sun.x, sun.y, 48, sunTint('#FFFBE4', tod), 0.65, 0.2, 4);
  g.fillStyle = sunTint('#FFE48A', tod); g.beginPath(); g.arc(sun.x, sun.y, 21, 0, Math.PI * 2); g.fill();
  g.fillStyle = sunTint('#FFF6CC', tod); g.beginPath(); g.arc(sun.x - 1, sun.y - 1, 17, 0, Math.PI * 2); g.fill();
  g.fillStyle = sunTint('#FFFFFF', tod); g.beginPath(); g.arc(sun.x - 3, sun.y - 3, 11, 0, Math.PI * 2); g.fill();
  for (let a = 0; a < 56; a++) {
    if (a % 2) continue;
    const t = (a / 56) * Math.PI * 2;
    box(g, Math.round((sun.x + Math.cos(t) * 22) / PIX) * PIX, Math.round((sun.y + Math.sin(t) * 22) / PIX) * PIX, PIX, PIX, sunTint('#FFE48A', tod));
  }
  g.globalAlpha = 1;
};

const CLOUD = { belly: '#93A6C6', shade: '#B4C4DE', mid: '#D6E0F0', lit: '#F0F5FD', hi: '#FFFFFF' };
const paintCloud = (g: Ctx, w: number, h: number, seed: number, far: boolean) => {
  const base = h - 10, n = 4 + Math.floor(hash(seed) * 3);
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = w * (0.16 + t * 0.68) + (hash(seed + i * 7) - 0.5) * w * 0.08;
    const r = (h * 0.32) * (0.65 + 0.55 * Math.sin(t * Math.PI)) * (0.85 + hash(seed + i * 13) * 0.3);
    puffs.push([x, base - r * 0.55, r]);
  }
  const tint = (col: string) => cloudTint(far ? mix(col, '#B8CCEA', 0.35) : col);
  pixelBlob(g, w / 2, base - 2, w * 0.42, 9, tint(CLOUD.belly));
  for (const [x, y, r] of puffs) pixelBlob(g, x, y + 4, r * 1.05, r * 0.82, tint(CLOUD.shade));
  for (const [x, y, r] of puffs) pixelBlob(g, x + r * 0.08, y - 1, r * 0.92, r * 0.72, tint(CLOUD.mid));
  for (const [x, y, r] of puffs) pixelBlob(g, x + r * 0.22, y - r * 0.2, r * 0.66, r * 0.5, tint(CLOUD.lit));
  for (const [x, y, r] of puffs) if (r > h * 0.26) pixelBlob(g, x + r * 0.35, y - r * 0.38, r * 0.3, r * 0.2, tint(CLOUD.hi));
  box(g, w * 0.14, base - 2, w * 0.72, 4, tint(CLOUD.belly));
};
const clouds = (c: Ctx, cam: number, f: number, tier: number) => {
  const defs = tier === 0
    ? [[40, 150, 110, 44], [300, 176, 90, 38], [540, 140, 124, 48], [860, 168, 100, 40]]
    : [[0, 50, 220, 96], [460, 86, 190, 80], [820, 34, 210, 90]];
  const par = tier === 0 ? 0.01 : 0.025, drift = tier === 0 ? 0.03 : 0.07, span = tier === 0 ? 1250 : 1400;
  defs.forEach(([x0, y, w, h], i) => {
    const x = (((x0 - f * drift - cam * par) % span) + span) % span - 240;
    if (x > W || x + w < 0) return;
    put(c, `dcloud${tier}_${i}`, x, y, w, h, g => paintCloud(g, w, h, i * 23 + tier * 97 + 5, tier === 0));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The mountains: jungle-green ranges, blue with distance, a cloud caught on a peak; a waterfall down one (live: its
// shimmer)

const MTN_FALL_X = 760;
const paintMountains = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24;
  const ridge = (seed: number, amp: number, lift: number) => (x: number) => {
    const u = (x / tw) * Math.PI * 2;
    return base - lift - amp * (0.55 + 0.3 * Math.sin(u * 2 + seed) + 0.15 * Math.sin(u * 5 + seed * 2)) - amp * 0.35 * Math.max(0, Math.sin(u * 3 + seed * 3)) ** 3;
  };
  pixelRidge(g, 0, tw, th, ridge(1.3, 120, 10), 0, { fill: farTint('#6E8EA8', 1.4, tod), rim: farTint('#9AB4C8', 1.4, tod), lit: farTint('#86A2BA', 1.4, tod), shade: farTint('#5E7E98', 1.4, tod) });
  pixelRidge(g, 0, tw, th, ridge(4.1, 80, 0), 0, { fill: farTint('#4F7464', 1.2, tod), rim: farTint('#7A9C80', 1.2, tod), lit: farTint('#668A70', 1.2, tod), shade: farTint('#44685A', 1.2, tod) });
  // (the waterfall's cliff: a notch down the near range, the water's white pour painted; its shimmer's live)
  const top = ridge(4.1, 80, 0)(MTN_FALL_X) + 6;
  box(g, MTN_FALL_X - 8, top, 16, base - top, farTint('#3C5A4C', 1.2, tod));
  box(g, MTN_FALL_X - 4, top, 8, base - top, farTint('#C8DCE8', 1.2, tod));
  box(g, MTN_FALL_X - 4, top, 2, base - top, farTint('#EEF6FF', 1.2, tod));
  pixelBlob(g, MTN_FALL_X, base - 2, 18, 6, farTint('#DCE8F0', 1.2, tod));
  // (a lens of cloud caught on the high peak)
  pixelBlob(g, 300, ridge(1.3, 120, 10)(300) + 8, 46, 7, cloudTint(mix('#E8EEF8', '#B8CCEA', 0.4), tod));
  box(g, 0, base, tw, th - base, farTint('#4E6A5A', 1, tod));
};
const waterfall = (c: Ctx, cam: number, camY: number, f: number) => {
  const d = 0.03, base = baseOf(d, camY), y = base - (190 - 24);
  const off = (((scrollOf(d, cam)) % 1200) + 1200) % 1200;
  for (let x = MTN_FALL_X - off; x < W + 20; x += 1200) {
    if (x < -20) continue;
    for (let i = 0; i < 5; i++) { const yy = y + 60 + ((f * 1.5 + i * 23) % 100); if (yy < base - 4) box(c, x - 3 + (i % 2) * 3, yy, 2, 6, 'rgba(255, 255, 255, 0.55)'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The hills: rolling jungle, palms on the crests, the park's water tower

const palm = (g: Ctx, x: number, foot: number, h: number, lean: number, trunk: string, frond: string, frondLo: string) => {
  const topX = x + lean, topY = foot - h;
  for (let i = 0; i < h; i += 2) { const k = i / h; box(g, Math.round(x + lean * k * k - 1.5), foot - i - 2, 3, 2, i % 6 < 2 ? mix(trunk, '#000000', 0.25) : trunk); }
  for (const [dx, dy, len] of [[-1, 0.3, 1], [1, 0.25, 1], [-0.7, -0.4, 0.8], [0.8, -0.35, 0.8], [0, -0.7, 0.6], [-1, 0.7, 0.7], [1, 0.75, 0.7]] as const) {
    const L = h * 0.42 * len;
    for (let s = 0; s < L; s += 2) {
      const k = s / L, xx = topX + dx * s, yy = topY + dy * s + k * k * L * 0.45;
      box(g, Math.round(xx), Math.round(yy), 3, 2, dy < 0 ? frond : frondLo);
      if (s % 4 === 0) box(g, Math.round(xx + (dx > 0 ? -1 : 2)), Math.round(yy + 2), 2, 2, frondLo);
    }
  }
  box(g, topX - 2, topY - 1, 4, 4, mix(trunk, '#000000', 0.3));
};
const paintHills = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24;
  const ridge = (x: number) => { const u = (x / tw) * Math.PI * 2; return base - 34 - 30 * (0.5 + 0.5 * Math.sin(u * 2 + 0.7)) - 12 * Math.sin(u * 5 + 2) ** 2; };
  pixelRidge(g, 0, tw, th, ridge, 0, { fill: farTint('#3E6A3A', 0.9, tod), rim: farTint('#6E9A4E', 0.9, tod), lit: farTint('#58864A', 0.9, tod), shade: farTint('#355E32', 0.9, tod) });
  // (canopy lumps along it, stepped)
  for (let i = 0; i < 26; i++) {
    const x = (i / 26) * tw + hash(i * 3.3) * 20, y = ridge(x) + 6;
    pixelBlob(g, x, y, 16 + hash(i) * 10, 9, farTint('#4A7A40', 0.9, tod));
    pixelBlob(g, x - 3, y - 3, 10 + hash(i) * 6, 5, farTint('#64944E', 0.9, tod));
  }
  for (let i = 0; i < 9; i++) {
    const x = 30 + (i / 9) * tw + hash(i * 7.7) * 40;
    palm(g, x, ridge(x) + 12, 34 + hash(i * 1.9) * 16, (hash(i * 2.2) - 0.5) * 14, farTint('#6A5A44', 0.9, tod), farTint('#4E8A44', 0.9, tod), farTint('#3A6A36', 0.9, tod));
  }
  // (the water tower on its legs, ADVENTURE LAND round its tank)
  const wx = 600, wy = ridge(600) + 4;
  const steel = farTint('#9AA4AE', 0.9, tod), steelLo = farTint('#6A747E', 0.9, tod);
  for (const lx of [-16, -6, 6, 16]) box(g, wx + lx, wy - 56, 2, 56, steelLo);
  for (let y = wy - 50; y < wy; y += 14) box(g, wx - 16, y, 34, 1, steelLo);
  box(g, wx - 22, wy - 80, 44, 26, steel); box(g, wx - 22, wy - 80, 44, 4, farTint('#C4CCD4', 0.9, tod)); box(g, wx + 12, wy - 76, 10, 22, steelLo);
  g.fillStyle = steel; g.beginPath(); g.moveTo(wx - 24, wy - 80); g.lineTo(wx, wy - 92); g.lineTo(wx + 24, wy - 80); g.closePath(); g.fill();
  box(g, wx - 18, wy - 70, 30, 6, farTint('#3E7A3A', 0.9, tod));
  box(g, 0, base, tw, th - base, farTint('#4A6B34', 0.88, tod));
};

/** The brachiosaurus over the trees (a robot too: a neck on a post, the head nodding, a light on it at night). */
const BRACHIO_X = 132000 + 1900;
const brachio = (c: Ctx, cam: number, camY: number, f: number) => {
  const d = 0.12, base = baseOf(d, camY);
  const sx = W / 2 + (BRACHIO_X - (cam + W / 2)) * d;
  if (sx < -120 || sx > W + 120) return;
  const tod = timeOfDay();
  const body = farTint('#6E7A64', 0.9, tod), lo = farTint('#525C4A', 0.9, tod), hi = farTint('#8E9A80', 0.9, tod);
  const y = base - 30;
  // (its back over the canopy, the neck going up, the head nodding)
  pixelBlob(c, sx, y, 40, 14, lo);
  pixelBlob(c, sx - 4, y - 3, 34, 10, body);
  const nod = Math.sin(f * 0.02) * 6, hx = sx + 34 + nod * 0.5, hy = y - 96 + Math.abs(nod) * 0.4;
  c.strokeStyle = lo; c.lineWidth = 10; c.beginPath(); c.moveTo(sx + 18, y - 4); c.quadraticCurveTo(sx + 30, y - 60, hx, hy + 6); c.stroke();
  c.strokeStyle = body; c.lineWidth = 6; c.beginPath(); c.moveTo(sx + 16, y - 6); c.quadraticCurveTo(sx + 28, y - 60, hx - 2, hy + 6); c.stroke();
  c.strokeStyle = hi; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + 14, y - 8); c.quadraticCurveTo(sx + 25, y - 60, hx - 4, hy + 4); c.stroke();
  // (panel seams down the neck)
  for (let k = 0.2; k < 1; k += 0.2) { const px = sx + 18 + (hx - sx - 18) * k, py = y - 4 + (hy - y + 10) * k - Math.sin(k * Math.PI) * 18; box(c, px - 4, py, 8, 1, lo); }
  pixelBlob(c, hx + 6, hy + 2, 12, 6, body); box(c, hx + 2, hy - 2, 12, 2, hi);
  const eyeCol = hourMix('#1A1A1A', '#3A1010', '#FF4040', tod);
  box(c, hx + 8, hy, 2, 2, eyeCol);
  for (let i = 0; i < 3; i++) pixelBlob(c, sx - 26 + i * 26, y + 12, 22, 10, farTint('#4A7A40', 0.9, tod));
};

// ---------------------------------------------------------------------------------------------------------------
// The far paddocks: fences (posts and wire) on the meadows, a stranded monorail car on its far track, a safari jeep,
// ferns, a little sign or two, palms

const paintPaddocks = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24;
  const k = 0.75;
  // (the meadow, rolling a little, banded)
  const ridge = (x: number) => base - 14 - 8 * Math.sin((x / tw) * Math.PI * 6 + 1) ** 2;
  pixelRidge(g, 0, tw, th, ridge, 0, { fill: farTint('#5E7A34', k, tod), rim: farTint('#8AA64C', k, tod), lit: farTint('#78963E', k, tod) });
  // (the monorail's far track on its pillars, and its car, stranded)
  const ty = base - 70;
  for (let x = 40; x < tw; x += 160) { box(g, x, ty, 6, base - ty, farTint('#8A929A', k, tod)); box(g, x + 4, ty, 2, base - ty, farTint('#6A727A', k, tod)); }
  box(g, 0, ty - 6, tw, 6, farTint('#A4ACB4', k, tod)); box(g, 0, ty - 6, tw, 1, farTint('#C8D0D6', k, tod)); box(g, 0, ty, tw, 1, farTint('#5A626A', k, tod));
  const carX = 520;
  box(g, carX, ty - 26, 120, 20, farTint('#D8DCE0', k, tod)); box(g, carX, ty - 26, 120, 3, farTint('#F2F4F6', k, tod));
  box(g, carX, ty - 12, 120, 4, farTint('#C2410C', k, tod));
  for (let i = 0; i < 7; i++) box(g, carX + 8 + i * 15, ty - 22, 10, 7, farTint('#3A4A5A', k, tod));
  g.fillStyle = farTint('#D8DCE0', k, tod); g.beginPath(); g.moveTo(carX + 120, ty - 26); g.lineTo(carX + 136, ty - 14); g.lineTo(carX + 120, ty - 6); g.closePath(); g.fill();
  // (vines grown over it: it's been a while)
  for (let i = 0; i < 6; i++) box(g, carX + 10 + i * 19, ty - 8, 2, 4 + (i % 3) * 3, farTint('#3E6A30', k, tod));
  // (paddock fences: posts with three wires, running along)
  const fy = base - 16;
  for (let x = 0; x < tw; x += 22) { box(g, x, fy - 22, 2, 24, farTint('#5A4A3A', k, tod)); }
  for (const dy of [-20, -13, -6]) box(g, 0, fy + dy, tw, 1, farTint('#3A3A3A', k, tod));
  // (palms, ferns, a jeep, a sign on posts)
  for (let i = 0; i < 7; i++) { const x = 70 + i * 160 + hash(i * 5.1) * 50; palm(g, x, base - 10, 40 + hash(i) * 14, (hash(i * 3.7) - 0.5) * 12, farTint('#6E5E46', k, tod), farTint('#4E8C42', k, tod), farTint('#3A6C34', k, tod)); }
  for (let i = 0; i < 12; i++) { const x = hash(i * 9.1) * tw; pixelBlob(g, x, base - 10, 12, 6, farTint('#3E7034', k, tod)); pixelBlob(g, x - 2, base - 13, 7, 3, farTint('#5E9446', k, tod)); }
  const jx = 300, jy = base - 12;
  box(g, jx, jy - 10, 30, 8, farTint('#C4A04A', k, tod)); box(g, jx + 6, jy - 16, 14, 6, farTint('#3A4A5A', k, tod)); box(g, jx, jy - 10, 30, 2, farTint('#E0C06A', k, tod));
  box(g, jx + 4, jy - 3, 6, 5, farTint('#1A1A1A', k, tod)); box(g, jx + 21, jy - 3, 6, 5, farTint('#1A1A1A', k, tod));
  box(g, 900, base - 40, 2, 30, farTint('#5A4A3A', k, tod)); box(g, 922, base - 40, 2, 30, farTint('#5A4A3A', k, tod)); box(g, 894, base - 46, 36, 14, farTint('#E0B84A', k, tod)); box(g, 898, base - 41, 28, 2, farTint('#5A3A1A', k, tod)); box(g, 898, base - 37, 20, 2, farTint('#5A3A1A', k, tod));
  box(g, 0, base, tw, th - base, farTint('#5E7A34', k * 0.9, tod));
};

// ---------------------------------------------------------------------------------------------------------------
// The tree line: the near edge of the park's jungle, dense and dark (kept lower-contrast than anything he stands on)

const paintTreeLine = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24, k = 0.55;
  const top = (x: number) => base - 70 - 30 * (0.5 + 0.5 * Math.sin((x / tw) * Math.PI * 8 + 0.4)) - 18 * Math.sin((x / tw) * Math.PI * 22) ** 2;
  pixelRidge(g, 0, tw, th, top, 0, { fill: farTint('#2E4E26', k, tod), rim: farTint('#557A3A', k, tod), lit: farTint('#45683A', k, tod), shade: farTint('#28441F', k, tod) });
  for (let i = 0; i < 40; i++) {
    const x = (i / 40) * tw + hash(i * 1.7) * 14, y = top(x) + 10 + hash(i * 2.9) * 30;
    pixelBlob(g, x, y, 14 + hash(i) * 8, 8, farTint('#35582A', k, tod));
    pixelBlob(g, x - 3, y - 3, 8 + hash(i) * 5, 4, farTint('#4E7438', k, tod));
  }
  // (trunks between, dark, palms poking up over it)
  for (let i = 0; i < 16; i++) { const x = hash(i * 6.3) * tw; box(g, x, base - 40, 4, 40, farTint('#2A2018', k, tod)); }
  for (let i = 0; i < 6; i++) { const x = 60 + i * 150 + hash(i * 4.3) * 40; palm(g, x, top(x) + 30, 56 + hash(i * 1.1) * 20, (hash(i * 8.1) - 0.5) * 18, farTint('#5A4A36', k, tod), farTint('#3E7434', k, tod), farTint('#2E5428', k, tod)); }
  // (the foot of it: a band of ferns, then the ground)
  for (let x = 0; x < tw; x += 12) pixelBlob(g, x + hash(x) * 6, base - 4, 9, 6, farTint('#3A6430', k, tod));
  box(g, 0, base, tw, th - base, farTint('#4F6A2A', k * 0.8, tod));
};
