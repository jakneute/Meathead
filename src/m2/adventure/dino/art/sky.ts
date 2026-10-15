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
import { timeOfDay, skyRamp, sunAt, sunTint, cloudTint, farTint, drawStars, drawMoon, hourMix, type TimeOfDay } from '../../../timeOfDay';
import { snap2, wave, jag, range, mist, falls, canopy, banded, fillUnder, flanks, wrapAt, poly, palm as farPalm } from '../../farArt';
import { noteSun } from '../../../sunFlare';
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
  // (the sun's glare, over its disc and under the clouds, the volcano in front of it; the lens's ghosts: sunFlare.ts)
  { const s = sunAt(620, 70, HZ, tod); noteSun(c, s.x, s.y); }
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
/** Far scenery at the hour, into the sky's own haze by k (farther: paler, bluer, flatter). */
const hazed = (col: string, k: number, far: number, tod: TimeOfDay) => mix(farTint(col, far, tod), skyRamp(SKY, tod)[7], k);
const rangeLook = (base: string, k: number, far: number, tod: TimeOfDay) => ({
  body: hazed(base, k, far, tod), lit: hazed(mix(base, '#DCECF2', 0.26), k, far, tod), hi: hazed(mix(base, '#FFFFFF', 0.4), k, far, tod),
  shade: hazed(mix(base, '#0A1418', 0.18), k, far, tod), deep: hazed(mix(base, '#0A1418', 0.3), k, far, tod),
});
const MTN_W = 1200;
const mtnBackY = (x: number) => snap2(52 + wave(x, MTN_W, 1.3) * 38 + jag(x, MTN_W, 8, 3) * 8);
const mtnFrontY = (x: number) => snap2(96 + wave(x, MTN_W, 4.1) * 24 + jag(x, MTN_W, 12, 9) * 4 - 16 * Math.exp(-(((x - MTN_FALL_X) / 90) ** 2)));
/** The mountains: the high peaks at the back (palest, in their mist, a cloud caught on the highest), the jungle range
 *  in front (lit flanks, gullies, forest up its slopes in stepped lumps), the falls down a cliff in it (its shimmer's
 *  live), the mist along their feet. */
const paintMountains = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24, hz = skyRamp(SKY, tod)[7];
  // (the high peaks)
  range(g, tw, mtnBackY, th, rangeLook('#6E8EA8', 0.42, 1.4, tod), 5, { gullies: 30, d: 16 });
  mist(g, tw, 20, base - 10, hz, 0.0, 0.55, 6);
  let px = 300, best = 1e9;
  for (let x = 60; x < tw - 60; x += 4) if (mtnBackY(x) < best) { best = mtnBackY(x); px = x; }
  pixelBlob(g, px + 4, best + 12, 54, 7, cloudTint(mix('#C8D4E4', '#B8CCEA', 0.4), tod));
  pixelBlob(g, px, best + 9, 44, 5, cloudTint(mix('#E8EEF8', '#B8CCEA', 0.3), tod));
  pixelBlob(g, px - 10, best + 7, 22, 3, cloudTint('#FFFFFF', tod));
  // (the jungle range, nearer)
  const F = rangeLook('#4F7464', 0.2, 1.2, tod);
  range(g, tw, mtnFrontY, th, F, 21, { gullies: 22, d: 18, forest: [hazed('#3A6444', 0.2, 1.2, tod), hazed('#56844E', 0.2, 1.2, tod)], forestY: x => mtnFrontY(x) + 28 + wave(x, tw, 7.7, 2) * 10 });
  // (the waterfall's cliff, its pour painted; its shimmer's live)
  const top = mtnFrontY(MTN_FALL_X) + 6;
  falls(g, MTN_FALL_X, top, base, 8, { rock: F.deep, water: hazed('#C8DCE8', 0.15, 1.2, tod), lit: hazed('#F4FAFF', 0.1, 1.2, tod), spray: hazed('#DCE8F0', 0.1, 1.2, tod) });
  mist(g, tw, base - 50, 50, hz, 0.0, 0.45, 5);
  box(g, 0, base, tw, th - base, farTint('#4E6A5A', 1, tod));
};
const waterfall = (c: Ctx, cam: number, camY: number, f: number) => {
  const d = 0.03, base = baseOf(d, camY), y = base - (190 - 24);
  const off = (((scrollOf(d, cam)) % 1200) + 1200) % 1200;
  for (let x = MTN_FALL_X - off; x < W + 20; x += 1200) {
    if (x < -20) continue;
    const top = y + mtnFrontY(MTN_FALL_X) + 6;
    for (let i = 0; i < 5; i++) { const yy = top + ((f * 1.5 + i * 23) % 100); if (yy < base - 4) box(c, x - 3 + (i % 2) * 3, yy, 2, 6, 'rgba(255, 255, 255, 0.55)'); }
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
/** The hills: rolling jungle (crowns shoulder to shoulder, lit up the left, the hollows in shade going down), palms
 *  up off the crests, the park's water tower on its legs (its tank in bands round it, the cone roof stepped, the
 *  catwalk, ADVENTURE LAND's green band; a red light on top after dark). */
const paintHills = (g: Ctx, tw: number, th: number) => {
  const tod = timeOfDay(), base = th - 24, hz = skyRamp(SKY, tod)[7];
  const ridge = (x: number) => { const u = (x / tw) * Math.PI * 2; return base - 34 - 30 * (0.5 + 0.5 * Math.sin(u * 2 + 0.7)) - 12 * Math.sin(u * 5 + 2) ** 2; };
  const R = ['#2E5A30', '#3E6E3A', '#58884A', '#76A45C'].map(c => hazed(c, 0.12, 0.9, tod));
  // (the palms first, their feet down in the crowns)
  for (let i = 0; i < 9; i++) {
    const x = snap2(30 + (i / 9) * tw + hash(i * 7.7) * 40);
    if (Math.abs(x - 600) < 50) continue;
    wrapAt(tw, x, xx => farPalm(g, xx, ridge(xx) + 14, 40 + hash(i * 1.9) * 18, (hash(i * 2.2) - 0.5) * 14, [hazed('#4A3C2C', 0.12, 0.9, tod), hazed('#7A6648', 0.12, 0.9, tod)], [R[0], R[1], R[3]], i * 7), 60);
  }
  // (the water tower on its legs, behind the crowns along its foot)
  const wx = 600, wy = Math.round(ridge(600)) + 10;
  const ST = ['#4E5862', '#6A747E', '#8A949E', '#AAB4BC', '#CCD4DA'].map(c => hazed(c, 0.12, 0.9, tod));
  for (const lx of [-17, -7, 5, 15]) { box(g, wx + lx, wy - 58, 2, 58, ST[lx < 0 ? 2 : 1]); }
  // (the bracing: an X between each pair of legs, a girt across)
  for (let y = wy - 52; y < wy - 6; y += 16) {
    box(g, wx - 17, y, 34, 1, ST[1]);
    for (let k = 0; k < 16; k += 2) { box(g, wx - 15 + k * 0.6, y + k, 1, 2, ST[0]); box(g, wx + 13 - k * 0.6, y + k, 1, 2, ST[0]); }
  }
  // (the tank: in bands round it, lit at the left, dithered into its shade at the right)
  const tankL = wx - 22, tankT = wy - 84, bands = [3, 4, 3, 2, 2, 2, 1, 1, 0];
  for (let k = 0; k < bands.length; k++) box(g, tankL + Math.round((k * 44) / bands.length), tankT, Math.ceil(44 / bands.length) + 1, 28, ST[bands[k]]);
  for (let k = 1; k < bands.length; k++) if (bands[k] !== bands[k - 1]) checker(g, tankL + Math.round((k * 44) / bands.length) - 2, tankT, 2, 28, ST[bands[k]]);
  box(g, tankL, tankT + 28, 44, 2, ST[0]);
  // (ADVENTURE LAND's band round it: green, lettering a row of pale ticks from out here)
  const GB = [hazed('#2A5A2A', 0.12, 0.9, tod), hazed('#3E7A3A', 0.12, 0.9, tod), hazed('#5A9A4A', 0.12, 0.9, tod)];
  box(g, tankL, tankT + 10, 44, 8, GB[1]); box(g, tankL, tankT + 10, 8, 8, GB[2]); box(g, tankL + 32, tankT + 10, 12, 8, GB[0]);
  for (let k = 0; k < 9; k++) if (k !== 4) box(g, tankL + 4 + k * 4, tankT + 13, 2, 2, hazed('#F2E8C8', 0.12, 0.9, tod));
  // (the catwalk round its foot, railed)
  box(g, tankL - 3, tankT + 30, 50, 2, ST[1]); for (let k = 0; k <= 50; k += 5) box(g, tankL - 3 + k, tankT + 24, 1, 6, ST[0]); box(g, tankL - 3, tankT + 24, 50, 1, ST[0]);
  // (the roof: a cone stepped across, its finial)
  const roof = [ST[4], ST[3], ST[2], ST[1]];
  for (let k = 0; k < 4; k++) { const a = -24 + k * 12, b = a + 12; g.fillStyle = roof[k]; g.beginPath(); g.moveTo(wx + a, tankT); g.lineTo(wx + a * 0.12, tankT - 13); g.lineTo(wx + b * 0.12, tankT - 13); g.lineTo(wx + b, tankT); g.closePath(); g.fill(); }
  box(g, wx - 1, tankT - 18, 2, 5, ST[0]);
  // (its light on top: red, after dark a step of glow round it)
  if (tod.lamps > 0.1) { box(g, wx - 3, tankT - 22, 6, 6, mix(ST[2], '#FF3020', 0.35 * tod.lamps)); box(g, wx - 1, tankT - 20, 2, 2, '#FF5040'); }
  else box(g, wx - 1, tankT - 20, 2, 2, hazed('#8A2A20', 0.12, 0.9, tod));
  // (the crowns along the hills, then their hollows going down in shade)
  canopy(g, tw, x => ridge(x) + 6, th, R, 12, 31);
  banded(g, tw, base - 22, 12, [mix(R[0], hz, 0.05), mix(R[0], '#0A140A', 0.15)], th);
  mist(g, tw, base - 70, 70, hz, 0.12, 0.0, 4);
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
  const tod = timeOfDay(), base = th - 24, hz = skyRamp(SKY, tod)[7];
  const k = 0.75;
  const T = (col: string) => farTint(col, k, tod);
  const lamps = tod.lamps;
  // (the meadow, rolling a little: its rises lit up the left, its dips in shade, banded darker going down)
  const ridge = (x: number) => snap2(base - 14 - 8 * Math.sin((x / tw) * Math.PI * 6 + 1) ** 2);
  const M = ['#3E5A24', '#4E6A2C', '#5E7A34', '#78963E', '#8AA64C'].map(T);
  fillUnder(g, tw, ridge, th, M[2]);
  flanks(g, tw, ridge, M[3], M[1], 6);
  for (let x = 0; x < tw; x += 6) if (hash(x * 0.31) > 0.6) box(g, x, ridge(x) + 4 + Math.round(hash(x) * 6), 2, 2, M[hash(x * 1.7) > 0.5 ? 1 : 3]);
  // (the monorail's far track on its pillars (T-heads, lit at the left), and its car, stranded)
  const ty = base - 70, S = ['#4A525A', '#6A727A', '#8A929A', '#A4ACB4', '#C8D0D6'].map(T);
  for (let x = 40; x < tw; x += 160) {
    box(g, x, ty, 6, base - ty, S[2]); box(g, x, ty, 2, base - ty, S[3]); box(g, x + 4, ty, 2, base - ty, S[1]);
    box(g, x - 4, ty, 14, 4, S[1]); box(g, x - 4, ty, 14, 1, S[3]);
    box(g, x - 2, base - 16, 10, 4, S[1]);
  }
  box(g, 0, ty - 6, tw, 6, S[3]); box(g, 0, ty - 6, tw, 1, S[2]); box(g, 0, ty - 1, tw, 1, S[1]); box(g, 0, ty, tw, 1, S[0]);
  for (let x = 0; x < tw; x += 32) box(g, x, ty - 5, 1, 4, S[2]);
  const carX = 520, CAR = ['#8A8E92', '#B4B8BC', '#D8DCE0', '#F2F4F6'].map(T);
  // (its body in bands: lit along the roof's curve, shaded along its skirt; the nose rounded)
  box(g, carX, ty - 26, 120, 20, CAR[2]); box(g, carX + 2, ty - 28, 116, 2, CAR[3]); box(g, carX, ty - 26, 120, 2, CAR[3]);
  box(g, carX, ty - 10, 120, 4, CAR[1]); checker(g, carX, ty - 12, 120, 2, CAR[1]);
  box(g, carX, ty - 14, 120, 3, T('#C2410C')); box(g, carX, ty - 14, 120, 1, T('#E2611C'));
  g.fillStyle = CAR[2]; g.beginPath(); g.moveTo(carX + 120, ty - 28); g.quadraticCurveTo(carX + 140, ty - 24, carX + 138, ty - 14); g.lineTo(carX + 120, ty - 6); g.closePath(); g.fill();
  box(g, carX + 124, ty - 22, 10, 6, T('#2A3A4A')); box(g, carX + 124, ty - 22, 4, 2, T('#6A8AA8'));
  // (its windows: the sky in them by day, a dead car's dark after, a work light left on in one)
  for (let i = 0; i < 7; i++) {
    const wx = carX + 8 + i * 15;
    box(g, wx, ty - 23, 10, 8, T('#2A3A4A'));
    if (lamps > 0.2 && i === 4) { box(g, wx, ty - 23, 10, 8, mix(T('#2A3A4A'), '#FFD890', 0.7 * lamps)); box(g, wx + 1, ty - 22, 3, 3, '#FFF0C0'); }
    else { box(g, wx, ty - 23, 5, 3, mix(T('#6A8AA8'), hz, 0.3 * (1 - lamps))); box(g, wx, ty - 20, 2, 2, T('#6A8AA8')); }
    box(g, wx - 1, ty - 24, 12, 1, CAR[1]);
  }
  // (vines grown over it: it's been a while; a strand down off it to the meadow)
  for (let i = 0; i < 6; i++) { box(g, carX + 10 + i * 19, ty - 8, 2, 4 + (i % 3) * 3, T('#3E6A30')); box(g, carX + 10 + i * 19, ty - 8, 2, 1, T('#5E8A44')); }
  for (let y = ty - 6; y < base - 12; y += 2) box(g, carX + 66 + Math.round(Math.sin(y * 0.2) * 2), y, 2, 2, (y >> 1) % 3 ? T('#3E6A30') : T('#5E8A44'));
  // (the paddock's gate: two log towers, the crossbeam over the road, torches on them lit after dark)
  {
    const gx = 160, gy = base - 12, L = ['#3A2A1C', '#5A4430', '#7A5E40', '#9A7E58'].map(T);
    for (const tx of [gx - 34, gx + 22]) {
      box(g, tx, gy - 66, 12, 66, L[2]); box(g, tx, gy - 66, 3, 66, L[3]); box(g, tx + 9, gy - 66, 3, 66, L[1]);
      for (let y = gy - 60; y < gy; y += 8) box(g, tx, y, 12, 1, L[1]);
      box(g, tx - 2, gy - 70, 16, 4, L[1]); box(g, tx - 2, gy - 70, 16, 1, L[2]);
      // (a torch on its top)
      box(g, tx + 5, gy - 76, 2, 6, L[0]);
      if (lamps > 0.15) { box(g, tx + 2, gy - 84, 8, 8, mix(T('#7A5E40'), '#FF9A30', 0.4 * lamps)); box(g, tx + 4, gy - 82, 4, 5, '#FFB040'); box(g, tx + 5, gy - 81, 2, 2, '#FFF0B0'); }
    }
    box(g, gx - 38, gy - 58, 76, 8, L[2]); box(g, gx - 38, gy - 58, 76, 1, L[1]); box(g, gx - 38, gy - 52, 76, 2, L[1]);
    for (let k = 0; k < 7; k++) box(g, gx - 26 + k * 8, gy - 56, 4, 2, T('#E8C890'));
    // (the doors, shut, planked)
    for (let k = 0; k < 6; k++) box(g, gx - 22 + k * 8, gy - 44, 7, 44, L[k % 2 ? 1 : 2]);
    box(g, gx - 22, gy - 30, 44, 2, L[0]); box(g, gx - 22, gy - 14, 44, 2, L[0]);
  }
  // (the ranger lookout: a hut on stilts, its roof thatched, a window lit after dark)
  {
    const lx = 820, ly = base - 12, L = ['#3A2A1C', '#5A4430', '#7A5E40', '#9A7E58'].map(T), TH = ['#6A5428', '#8A7038', '#AA8C4A', '#C8A864'].map(T);
    for (const px of [-14, 12]) { box(g, lx + px, ly - 52, 3, 52, L[1]); box(g, lx + px, ly - 52, 1, 52, L[3]); }
    for (let y = ly - 46; y < ly - 4; y += 14) for (let k = 0; k < 13; k += 1) box(g, lx - 12 + k * 2, y + k, 2, 1, L[0]);
    box(g, lx - 18, ly - 72, 36, 20, L[2]); box(g, lx - 18, ly - 72, 3, 20, L[3]); box(g, lx + 13, ly - 72, 5, 20, L[1]);
    box(g, lx - 20, ly - 54, 40, 2, L[1]);
    box(g, lx - 8, ly - 68, 14, 8, lamps > 0.2 ? mix(L[0], '#FFC870', 0.75 * lamps) : L[0]);
    poly(g, [[lx - 24, ly - 72], [lx, ly - 90], [lx + 24, ly - 72]], TH[1]);
    poly(g, [[lx - 24, ly - 72], [lx, ly - 90], [lx, ly - 86], [lx - 18, ly - 72]], TH[3]);
    for (let k = 0; k < 6; k++) box(g, lx - 22 + k * 8, ly - 72, 2, 3, TH[0]);
    // (a ladder up to it)
    for (let y = ly - 52; y < ly; y += 5) box(g, lx - 4, y, 6, 1, L[2]);
    box(g, lx - 4, ly - 52, 1, 52, L[1]); box(g, lx + 1, ly - 52, 1, 52, L[1]);
  }
  // (paddock fences: posts lit at the left, three wires, a warning plate here and there)
  const fy = base - 16;
  for (let x = 0; x < tw; x += 22) {
    if (Math.abs(x - 160) < 46) continue;
    box(g, x, fy - 22, 2, 24, T('#7A6A50')); box(g, x + 2, fy - 22, 1, 24, T('#4A3A2A'));
    if (x % 154 === 0) { box(g, x + 4, fy - 16, 8, 6, T('#E0B84A')); box(g, x + 7, fy - 15, 2, 3, T('#3A2A1A')); }
  }
  for (const dy of [-20, -13, -6]) { box(g, 0, fy + dy, 126, 1, T('#3A3A3A')); box(g, 198, fy + dy, tw - 198, 1, T('#3A3A3A')); }
  // (palms, ferns, a jeep, a sign on posts)
  for (let i = 0; i < 7; i++) {
    const x = snap2(70 + i * 160 + hash(i * 5.1) * 50);
    if (Math.abs(x - 160) < 50 || Math.abs(x - 820) < 40) continue;
    wrapAt(tw, x, xx => farPalm(g, xx, base - 10, 40 + hash(i) * 14, (hash(i * 3.7) - 0.5) * 12, [T('#4A3A2A'), T('#7A6A4E')], [T('#2E5A2A'), T('#3E7034'), T('#5E9446')], i * 13), 60);
  }
  for (let i = 0; i < 12; i++) { const x = hash(i * 9.1) * tw; pixelBlob(g, x, base - 10, 12, 6, T('#3E7034')); pixelBlob(g, x - 2, base - 13, 7, 3, T('#5E9446')); }
  const jx = 300, jy = base - 12;
  box(g, jx, jy - 10, 30, 8, T('#C4A04A')); box(g, jx, jy - 10, 30, 2, T('#E0C06A')); box(g, jx, jy - 4, 30, 2, T('#94742A'));
  box(g, jx + 6, jy - 16, 14, 6, T('#3A4A5A')); box(g, jx + 6, jy - 16, 6, 2, mix(T('#6A8AA8'), hz, 0.3)); box(g, jx + 4, jy - 17, 18, 1, T('#5A5A5A'));
  box(g, jx + 24, jy - 18, 1, 8, T('#2A2A2A'));
  box(g, jx + 4, jy - 3, 6, 5, T('#1A1A1A')); box(g, jx + 21, jy - 3, 6, 5, T('#1A1A1A')); box(g, jx + 6, jy - 2, 2, 2, T('#6A6A6A')); box(g, jx + 23, jy - 2, 2, 2, T('#6A6A6A'));
  if (lamps > 0.3) box(g, jx + 29, jy - 8, 2, 2, '#FFE8A0');
  box(g, 900, base - 40, 2, 30, T('#5A4A3A')); box(g, 922, base - 40, 2, 30, T('#5A4A3A')); box(g, 894, base - 46, 36, 14, T('#E0B84A')); box(g, 894, base - 46, 36, 2, T('#F0D070')); box(g, 898, base - 41, 28, 2, T('#5A3A1A')); box(g, 898, base - 37, 20, 2, T('#5A3A1A'));
  // (the haze lying on the meadow, banded off going down)
  mist(g, tw, base - 90, 80, hz, 0.14, 0.02, 4);
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
