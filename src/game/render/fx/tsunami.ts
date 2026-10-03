// The tsunami, painted as a 16-bit breaking wave: small (every pixel of it 2x2, like fire.ts) and blown up chunky. A
// banded body going from deep blue-green at the foot to a light teal near the top, its bands dithered into each
// other. The lip curls over at the front with a pale underside and a dark tube under it, inked round the outside.
// A thick foam crest churns along the top and spray flies off it forward. Current streaks and troughs run back along
// the body. The foot froths where it hits the ground, and a tail of water thins out behind it into wet foam.
// Everything moves on the frame count and fixed hashes, so nothing flickers at random.
//
// Two passes: the body behind the sprites (drawTsunamiBack), then the foam, the lip, the spray and the shallow
// water at the foot over them (drawTsunamiFront), so whoever's caught in it is in the water, not pasted on top of
// it. Visuals only: where it is, how tall and how long are all updateTsunami's (bosses/hazards.ts).

import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { tsunamiTop } from '../../bosses/hazards';

type Ctx = CanvasRenderingContext2D;

const PX = 2;
/** Deep at the foot to light at the top. */
const BODY = ['#0A2C44', '#0C3D58', '#0F506B', '#12647D', '#16798D', '#1C8F9C', '#27A5A8', '#3CBAB3', '#5ACDC0'];
const INK = '#051624';
const TUBE = '#071F33', TUBE_IN = '#0B3149';
const UNDER = '#9FE6DA', UNDER_DIM = '#62C4BE';
const FOAM = '#F2FFFC', FOAM_SHADE = '#B9E2E8', FOAM_DEEP = '#7FBFCF';
const STREAK = '#7ED9CC', TROUGH = '#0A3550';
const SHALLOW = 'rgba(28, 143, 156, 0.55)', SHALLOW_TOP = 'rgba(126, 217, 204, 0.85)';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const bufs: (HTMLCanvasElement | null)[] = [null, null];
const buf = (i: number, w: number, h: number) => {
  if (typeof document === 'undefined') return null;
  const c = bufs[i] ??= document.createElement('canvas');
  if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); }
  return c;
};

/** The wave's shape this frame, in its own half-size pixels: U forward from its middle, V up from the floor line. */
interface Wave {
  X: number; dir: number; base: number; f: number;
  /** How tall above the floor line, how big the curl is, how thick the water left behind it is. */
  H: number; R: number; Hs: number;
  /** The crest top, the lip's tip, the mouth under it, the foot, the back of the body, the end of the tail. */
  crest: [number, number]; tip: [number, number]; mouth: [number, number]; foot: number; back: number; tail: number;
  /** The lip's outside (its two bezier controls, crest to tip), and the top of the tube inside it. */
  lip1: [number, number]; lip2: [number, number]; inner: [number, number];
  /** What of it's painted (the part on screen). */
  u0: number; u1: number; v0: number; v1: number;
  /** 0..1: going (it sinks into the floor at the end). */
  k: number;
  /** How far down the water goes under the floor line, every 4 along from dropU0: down to the ground where that's
   * lower (fired from up a slope or a ledge, it pours down over it), as far as updateTsunami reaches under it at most. */
  drop: number[]; dropU0: number;
}

const waveOf = (state: GameState): Wave | null => {
  if (!state.tsunamiActive) return null;
  const dir = state.tsunamiDir || 1, X = Math.round(state.tsunamiX);
  const off = state.tsunamiOffsetY || 0, base = Math.round(GROUND_Y + off);
  const dist = Math.abs(state.tsunamiX - state.tsunamiStartX);
  // (the same top as updateTsunami's: only what's above the floor line shows)
  const top = tsunamiTop(state, dist);
  const above = base - top;
  const k = clamp(above / 50, 0, 1);
  if (!(k > 0.02) || !Number.isFinite(X)) return null;
  const f = state.frame || 0;
  const H = Math.max(6, above / PX);
  const R = Math.round(Math.min(clamp(H * 0.17, 7, 30), H * 0.42));
  const Hs = Math.round(clamp(H * 0.1, 3, 11));
  // (the curl rolls: the tip reaches and draws back, the crest bobs)
  const roll = Math.sin(f * 0.23), bob = Math.sin(f * 0.17 + 1);
  const crest: [number, number] = [-R * 0.3, H + bob * 0.8];
  const tip: [number, number] = [R * (1.75 + roll * 0.12), H - R * (1.4 - roll * 0.12)];
  const lip1: [number, number] = [R * 1.4, H + R * 0.15 + bob * 0.5], lip2: [number, number] = [R * (2.3 + roll * 0.1), H - R * 0.45];
  const inner: [number, number] = [R * 0.95, H - R * 0.55];
  const mouth: [number, number] = [R * 0.15, H - R * 1.8];
  const foot = Math.round(R * 0.6 + 10);
  const back = -Math.round(H * 0.8 + 40);
  const tail = -Math.ceil(dist / PX) - 4;
  // (what's on screen, in its own terms)
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: 600 };
  const sx0 = dir === 1 ? v.x - X : X - (v.x + v.w), sx1 = dir === 1 ? v.x + v.w - X : X - v.x;
  const u0 = Math.max(tail, Math.floor(sx0 / PX) - 2), u1 = Math.min(Math.ceil(tip[0] + 60), Math.ceil(sx1 / PX) + 2);
  const v0 = Math.max(-28, Math.floor((base - (v.y + v.h)) / PX) - 2), v1 = Math.min(Math.ceil(H + 34), Math.ceil((base - v.y) / PX) + 2);
  if (u1 <= u0 || v1 <= v0) return null;
  const runs = state.groundRuns ?? [], dropU0 = Math.floor((u0 - 8) / 4) * 4, drop: number[] = [];
  for (let u = dropU0; u <= u1 + 8; u += 4) {
    // (no ground profile, no telling where the floor is: it stops at the line)
    const gy = runs.length ? groundLineAt(runs, X + dir * u * PX) : base;
    drop.push(Number.isFinite(gy) ? Math.round(clamp((gy - base) / PX, 3, 25)) : 3);
  }
  return { X, dir, base, f, H, R, Hs, crest, tip, mouth, foot, back, tail, lip1, lip2, inner, u0, u1, v0, v1, k, drop, dropU0 };
};

/** How thick the water's left lying at U (behind the body): thinning out the further back. */
const sheetAt = (w: Wave, u: number) => {
  const behind = w.back - u;
  if (behind <= 0) return w.Hs;
  const t = clamp(1 - behind / 260, 0, 1);
  return Math.max(0, w.Hs * t * t + Math.sin(u * 0.21 + w.f * 0.35) * 0.9 * t);
};

const dropAt = (w: Wave, u: number) => w.drop[clamp(Math.floor((u - w.dropU0) / 4), 0, w.drop.length - 1)];

/** From the lip's tip across the open mouth of the tube to the face (a path already at the tip). */
const underside = (g: Ctx, w: Wave) => g.quadraticCurveTo(w.tip[0] - w.R * 0.35, w.mouth[1] - w.R * 0.3, w.mouth[0], w.mouth[1]);

/** The outline of the water, wave and tail, in its own coordinates (V up). */
const silhouette = (g: Ctx, w: Wave) => {
  const { R, H, crest, tip, mouth, foot, back } = w;
  // (from where what's left behind has thinned out to nothing)
  const start = Math.max(w.tail, w.u0 - 4, w.back - 260);
  g.beginPath();
  g.moveTo(start, -dropAt(w, start));
  // (the tail: what's left lying behind, rippling)
  if (start < back) for (let u = start; u < back; u += 3) g.lineTo(u, sheetAt(w, u));
  g.lineTo(back, w.Hs);
  // (the back of the wave up to the crest)
  g.bezierCurveTo(back * 0.55, w.Hs + H * 0.12, crest[0] - R * 1.9, H * 0.97, crest[0], crest[1]);
  // (over the top and down round the lip to its tip)
  g.bezierCurveTo(w.lip1[0], w.lip1[1], w.lip2[0], w.lip2[1], tip[0], tip[1]);
  // (across the mouth of the tube, back in to the face)
  underside(g, w);
  // (the face: hollow, down to the foot)
  g.bezierCurveTo(mouth[0] - R * 0.25, mouth[1] - (mouth[1]) * 0.35, foot - 14, H * 0.06, foot, 0);
  g.lineTo(foot + 2, -3);
  // (and back along the bottom: the ground, or as far down as it goes)
  // (raked back from the foot, not a sheer wall of it under the front)
  for (let u = foot + 2; u > start; u -= 4) g.lineTo(u, -Math.min(dropAt(w, u), 3 + (foot + 2 - u) * 0.7));
  g.closePath();
};

// Everything small is laid down in batches: rects gathered up by colour, then each colour filled as one path (a
// few fills a frame, not a fillRect for every row of every clump of foam)
const batch = new Map<string, number[]>();
const rect = (c: string, x: number, y: number, w: number, h: number) => {
  let a = batch.get(c);
  if (!a) batch.set(c, a = []);
  a.push(x, y, w, h);
};
const flush = (g: Ctx, order: string[]) => {
  for (const c of order) {
    const a = batch.get(c);
    if (!a?.length) continue;
    g.beginPath();
    for (let i = 0; i < a.length; i += 4) g.rect(a[i], a[i + 1], a[i + 2], a[i + 3]);
    g.fillStyle = c; g.fill();
    a.length = 0;
  }
};

/** A disc of whole pixels (foam clumps, froth). */
const disc = (c: string, cx: number, cy: number, r: number) => {
  const x = Math.round(cx), y = Math.round(cy), rr = Math.max(1, Math.round(r));
  for (let dy = -rr; dy <= rr; dy++) {
    const half = Math.round(Math.sqrt(Math.max(0, rr * rr - dy * dy)) + 0.3);
    if (half > 0) rect(c, x - half, y + dy, half * 2, 1);
  }
};

/** A clump of foam: a deep shadow under it, the shade, the white on top. (V up) */
const clump = (x: number, y: number, r: number) => {
  disc(FOAM_DEEP, x + 0.5, y - 1.2, r);
  disc(FOAM_SHADE, x, y - 0.4, r);
  disc(FOAM, x - 0.3, y + 0.4, Math.max(1, r - 1));
};
const FOAM_ORDER = [SHALLOW, SHALLOW_TOP, FOAM_DEEP, FOAM_SHADE, FOAM];

/** The body's ramp as a fill: flat bands `bandH` tall, each seam dithered (one for each band height, painted once). */
const ramps = new Map<number, { p: CanvasPattern; top: number }>();
const rampFill = (g: Ctx, bandH: number) => {
  let r = ramps.get(bandH);
  if (!r) {
    // (and under the floor line, what pours down off a ledge or a slope: thinner, so lighter)
    const n = BODY.length, extra = 44, under = 30, h = n * bandH + extra + under;
    const c = document.createElement('canvas');
    c.width = 2; c.height = h;
    const q = c.getContext('2d')!;
    // (row 0 is the top: the lightest band, run on up past the crest)
    const b0 = h - under;
    for (let i = 0; i < n; i++) { q.fillStyle = BODY[i]; q.fillRect(0, i === n - 1 ? 0 : b0 - (i + 1) * bandH, 2, i === n - 1 ? bandH + extra : bandH); }
    q.fillStyle = BODY[2]; q.fillRect(0, b0, 2, under);
    q.fillStyle = BODY[0]; q.fillRect(1, b0, 1, 1); q.fillRect(0, b0 + 1, 1, 1);
    for (let i = 1; i < n; i++) {
      const y = b0 - i * bandH;
      q.fillStyle = BODY[i - 1]; q.fillRect(0, y - 1, 1, 1);
      q.fillStyle = BODY[i]; q.fillRect(1, y, 1, 1);
    }
    r = { p: g.createPattern(c, 'repeat-x')!, top: b0 - 4 };
    ramps.set(bandH, r);
  }
  // (its row 0 at the top, the wave's own V running up: flipped, like the buffer)
  r.p.setTransform(new DOMMatrix([1, 0, 0, -1, 0, r.top]));
  return r.p;
};

const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const m = 1 - t;
  return m * m * m * p0 + 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t * p3;
};

/** Sets up a buffer the size of what's painted, with the transform that takes the wave's own coordinates onto it. */
const begin = (i: number, w: Wave) => {
  const bw = w.u1 - w.u0, bh = w.v1 - w.v0;
  const c = buf(i, bw + 2, bh + 2);
  if (!c) return null;
  const g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, bw + 2, bh + 2);
  g.setTransform(1, 0, 0, -1, -w.u0, w.v1);
  g.imageSmoothingEnabled = false;
  return { c, g, bw, bh };
};

const blit = (ctx: Ctx, w: Wave, c: HTMLCanvasElement, bw: number, bh: number) => {
  const prev = ctx.imageSmoothingEnabled, prevA = ctx.globalAlpha;
  ctx.imageSmoothingEnabled = false;
  if (w.k < 1) ctx.globalAlpha = prevA * w.k;
  const y = w.base - w.v1 * PX;
  if (w.dir === 1) ctx.drawImage(c, 0, 0, bw, bh, w.X + w.u0 * PX, y, bw * PX, bh * PX);
  else {
    ctx.save(); ctx.translate(w.X, 0); ctx.scale(-1, 1);
    ctx.drawImage(c, 0, 0, bw, bh, w.u0 * PX, y, bw * PX, bh * PX);
    ctx.restore();
  }
  ctx.globalAlpha = prevA;
  ctx.imageSmoothingEnabled = prev;
};

/** The body of the wave and the water it leaves behind it: under whoever's in it. */
export const drawTsunamiBack = (ctx: Ctx, state: GameState) => {
  const w = waveOf(state);
  if (!w) return;
  const b = begin(0, w);
  if (!b) return;
  const { g } = b;
  const { R, H, f, crest, tip, mouth, foot, back, inner } = w;
  // The body, in its ramp (everything after this only goes on over it, so there's no clip)
  silhouette(g, w);
  g.fillStyle = rampFill(g, Math.max(2, Math.ceil((H + 4) / BODY.length)));
  g.fill();
  g.globalCompositeOperation = 'source-atop';
  // (the tail's surface, lit along its top)
  for (let u = Math.max(w.u0, w.tail); u < back; u += 3) { const s = sheetAt(w, u); if (s >= 1) rect(BODY[5], u, Math.round(s) - 1, 3, 1); }
  flush(g, [BODY[5]]);
  // The back of the wave in shadow: a darker wash down the back slope
  g.fillStyle = 'rgba(5, 22, 36, 0.28)';
  g.beginPath(); g.moveTo(back, -4); g.lineTo(back, w.Hs);
  g.bezierCurveTo(back * 0.55, w.Hs + H * 0.12, crest[0] - R * 1.9, H * 0.97, crest[0] - R * 0.2, crest[1]);
  g.bezierCurveTo(crest[0] - R * 1.1, H * 0.6, back * 0.35, H * 0.15, back * 0.3, -4);
  g.closePath(); g.fill();
  // The face, lit: a light band in along the front edge, and a thinner, brighter one at the very edge
  g.beginPath();
  g.moveTo(mouth[0], mouth[1]);
  g.bezierCurveTo(mouth[0] - R * 0.25, mouth[1] * 0.65, foot - 14, H * 0.06, foot, 0);
  g.strokeStyle = BODY[6]; g.lineWidth = 8; g.stroke();
  g.strokeStyle = BODY[7]; g.lineWidth = 3; g.stroke();
  // Currents: light streaks and dark troughs running back along the body (the water going under, the wave going on)
  const span = Math.max(30, foot - back);
  for (let i = 0; i < 26; i++) {
    const v = Math.round(2 + hash(i * 3.1 + 1) * (H * 0.82));
    const len = 3 + Math.round(hash(i * 5.7) * (6 + R * 0.3));
    const u = Math.round(foot - ((f * (0.9 + hash(i) * 0.8) + hash(i * 9.3) * span) % span));
    const c = i % 3 === 0 ? TROUGH : STREAK;
    rect(c, u, v, len, 1);
    if (c === STREAK && len > 5) rect(c, u + 2, v + 1, len - 4, 1);
  }
  flush(g, [TROUGH, STREAK]);
  // (troughs: dark scoops curving down the face)
  g.strokeStyle = TROUGH; g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const t = ((f * 0.02 + i / 4) % 1);
    const v = H * (0.15 + t * 0.6);
    const u = mouth[0] - R * 0.3 - 8 - i * 3 + t * 4;
    g.moveTo(u, v); g.quadraticCurveTo(u - 10 - R * 0.3, v - 4, u - 22 - R * 0.6, v - 10 - t * 6);
  }
  g.stroke();
  // (light through the lip, from the crest round to the tip)
  g.beginPath();
  g.moveTo(crest[0], crest[1]);
  g.bezierCurveTo(w.lip1[0], w.lip1[1], w.lip2[0], w.lip2[1], tip[0], tip[1]);
  g.strokeStyle = BODY[7]; g.lineWidth = Math.max(4, R * 0.7); g.stroke();
  g.strokeStyle = BODY[8]; g.lineWidth = Math.max(2, R * 0.35); g.stroke();
  // The tube in under the lip: dark, the inside of the lip pale where the light comes through it
  g.beginPath();
  g.moveTo(tip[0], tip[1]);
  g.quadraticCurveTo(tip[0] + R * 0.05, inner[1] + R * 0.1, inner[0], inner[1]);
  g.quadraticCurveTo(R * -0.05, inner[1] - R * 0.05, mouth[0], mouth[1]);
  g.quadraticCurveTo(tip[0] - R * 0.35, mouth[1] - R * 0.3, tip[0], tip[1]);
  g.fillStyle = TUBE; g.fill();
  // (the back wall of it, a little light off the water)
  g.beginPath();
  g.moveTo(inner[0] - R * 0.1, inner[1] - R * 0.15);
  g.quadraticCurveTo(R * 0.05, inner[1] - R * 0.25, mouth[0] + R * 0.15, mouth[1] + R * 0.1);
  g.strokeStyle = TUBE_IN; g.lineWidth = Math.max(2, R * 0.22); g.stroke();
  g.beginPath();
  g.moveTo(tip[0], tip[1]);
  g.quadraticCurveTo(tip[0] + R * 0.05, inner[1] + R * 0.1, inner[0], inner[1]);
  g.strokeStyle = UNDER_DIM; g.lineWidth = 3; g.stroke();
  g.strokeStyle = UNDER; g.lineWidth = 1; g.stroke();
  // The ink round the outside (put in behind what's there: only its outer half shows)
  g.globalCompositeOperation = 'destination-over';
  silhouette(g, w);
  g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.globalCompositeOperation = 'source-over';
  blit(ctx, w, b.c, b.bw, b.bh);
};

/** The foam, the lip, the spray and the shallows at the foot: over whoever's in it. */
export const drawTsunamiFront = (ctx: Ctx, state: GameState) => {
  const w = waveOf(state);
  if (!w) return;
  const b = begin(1, w);
  if (!b) return;
  const { g } = b;
  const { R, f, crest, tip, foot, back } = w;
  const sc = clamp(R / 18, 0.5, 1.6);
  // The shallows: the bottom of the water over whoever's standing in it, its top lit and flecked with foam
  const end = Math.round(foot - 6);
  for (let u = Math.max(w.u0, w.tail); u < end; u += 2) {
    const s = Math.min(u < back ? sheetAt(w, u) : w.Hs, 7);
    if (s < 1) continue;
    const top = Math.round(s + Math.sin(u * 0.3 - f * 0.5) * 0.7);
    rect(SHALLOW, u, -3, 2, top + 3);
    rect(SHALLOW_TOP, u, top, 2, 1);
  }
  // (foam lying on it, in patches, thinning out the further behind it is)
  for (let i = 0; i < 40; i++) {
    const u = Math.round(back + 20 - ((hash(i * 4.3) * 420 + i * 7) % 420));
    if (u < w.u0 - 8 || u > w.u1 + 8 || u < w.tail) continue;
    const behind = Math.max(0, back - u), fade = 1 - behind / 230;
    if (fade <= 0 || hash(i * 2.9 + 7) > fade + 0.15) continue;
    const s = Math.round(Math.min(u < back ? sheetAt(w, u) : w.Hs, 7)), len = 2 + Math.round(hash(i * 1.7) * 7 * fade);
    const sh = Math.round(((f * 0.35 + i * 13) % 6) - 3);
    rect(fade > 0.5 ? FOAM : FOAM_SHADE, u + sh, s, len, 1);
    if (len > 4 && fade > 0.4) rect(FOAM_SHADE, u + sh + 1, s + 1, len - 2, 1);
  }
  // The foam crest: clumps along the top, round the lip and down to the tip, churning
  const ncrest = 9 + Math.round(R * 0.5);
  for (let i = 0; i < ncrest; i++) {
    const t = ((i + (f * 0.06) % 1) / ncrest);
    const x = bez(crest[0], w.lip1[0], w.lip2[0], tip[0], t);
    const y = bez(crest[1], w.lip1[1], w.lip2[1], tip[1], t);
    const churn = Math.sin(f * 0.31 + i * 1.7) * 0.5 + 0.5;
    const r = (1.6 + churn * 1.8 + (1 - Math.abs(t - 0.35)) * 1.6) * sc;
    clump(x + Math.sin(f * 0.2 + i) * 0.8, y + 1 + churn, r);
  }
  // (and back down the back of it a way, whiter at the top)
  for (let i = 0; i < 6; i++) {
    const t = (i + (f * 0.04) % 1) / 6;
    // (down the back slope: its bezier, run from the crest end)
    const q = 1 - t * 0.28;
    const x = bez(back, back * 0.55, crest[0] - R * 1.9, crest[0], q);
    const y = bez(w.Hs, w.Hs + w.H * 0.12, w.H * 0.97, crest[1], q) + 0.5;
    clump(x, y, (2.6 - t * 1.6) * sc + Math.sin(f * 0.27 + i * 2.3) * 0.6);
  }
  // (foam lace hanging off the lip and running down the face)
  for (let i = 0; i < 5; i++) {
    const t = ((f * 0.9 + hash(i * 3.3) * 40) % 40) / 40;
    const x = Math.round(tip[0] - 2 - i * R * 0.2 - t * 4), y = Math.round(tip[1] - t * (tip[1] * 0.75));
    if (y > 2) rect(FOAM_SHADE, x, y, 1, 2 + Math.round((1 - t) * 3));
  }
  // Spray off the lip, thrown forward and falling; and flecks blown off the top of the crest
  for (let i = 0; i < 18; i++) {
    const per = 22 + hash(i * 2.2) * 16, t = ((f + hash(i * 7.7) * per) % per) / per;
    const vx = 8 + hash(i * 3.7) * (14 + R * 0.9), vy = 3 + hash(i * 5.1) * (6 + R * 0.25);
    const x = Math.round(tip[0] - 2 + vx * t), y = Math.round(tip[1] + R * 0.3 + vy * t - t * t * (14 + R * 0.6));
    if (y < -2) continue;
    const s = t < 0.35 && i % 3 === 0 ? 2 : 1;
    rect(t < 0.5 ? FOAM : FOAM_SHADE, x, y, s, s);
  }
  for (let i = 0; i < 10; i++) {
    const per = 30 + hash(i * 4.9) * 20, t = ((f + hash(i * 6.1) * per) % per) / per;
    const x = Math.round(crest[0] + R * 0.6 - t * (10 + hash(i) * 22) + t * hash(i * 8.8) * 30), y = Math.round(crest[1] + 2 + t * (6 + hash(i * 1.3) * 10) - t * t * 8);
    if ((f + i) % 7) rect(t < 0.4 ? FOAM : FOAM_SHADE, x, y, 1, 1);
  }
  // The foot frothing where it hits the ground, splashes kicked up ahead of it
  const nfoot = 7;
  for (let i = 0; i < nfoot; i++) {
    const t = i / (nfoot - 1);
    const churn = Math.sin(f * 0.45 + i * 2.1) * 0.5 + 0.5;
    const x = foot - 18 + t * 24 + Math.sin(f * 0.3 + i) * 1.5;
    const y = 1 + (1 - Math.abs(t - 0.45) * 1.6) * (2 + R * 0.12) + churn * 1.5;
    clump(x, y, (1.6 + churn * 1.6 + (1 - Math.abs(t - 0.5)) * 1.2) * Math.min(1.2, sc + 0.3));
  }
  for (let i = 0; i < 9; i++) {
    const per = 14 + hash(i * 3.9) * 10, t = ((f + hash(i * 1.9) * per) % per) / per;
    const x = Math.round(foot + 2 + t * (6 + hash(i * 2.7) * 14)), y = Math.round(2 + t * (5 + hash(i * 4.4) * 7) - t * t * 10);
    if (y < 0) continue;
    rect(t < 0.5 ? FOAM : FOAM_SHADE, x, y, 1, 1);
  }
  flush(g, FOAM_ORDER);
  blit(ctx, w, b.c, b.bw, b.bh);
};
