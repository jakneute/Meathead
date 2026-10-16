// Donnie's weakness death, drawn (fight.ts runs its beats: t is the death's own clock, frozen once the fight's over;
// `fr` is the game's frame, held still in the kill cam's slow motion, for what flickers and drifts). The little Christ
// the Redeemer sets him alight: a flare off him as it takes, then flame tongues licking up him in a stepped ramp (dark
// red edge, red, orange, yellow, a white-yellow heart), dithered where one meets the next, each its own flicker, licks
// breaking off the tips; the char climbing him from the feet up behind a glowing edge, the firelight on what's left;
// he flails, then sinks into his own pile of ash, flakes coming off him as he goes. The pile: stepped grays, embers
// breathing in it, a scrap of the cape, his wig on top, the little statue standing in it (glowing, a glint as it shows),
// his name tag. Smoke in stepped grays (fire-lit underneath while it's young), embers and sparks up and drifting, the
// air shimmering over it. Its light goes into the scene's lighting (burnLights): the room, the statue, him.

import { drawDonnie, drawLooseWig, DONNIE_H } from '../../cast/donnie';
import type { Light } from '../../../m1/game/render/lighting';
import { box } from '../section';
import { GY } from '../geometry';
import { INK, checker, pixelBlob } from '../control/paint';

type Ctx = CanvasRenderingContext2D;

/** What of his death this needs. */
export interface Burn { t: number; x: number; y: number; facing: 1 | -1 }

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const P = 2;
const snap = (v: number) => Math.round(v / P) * P;

// ---------------------------------------------------------------------------------------------------------------
// The beats (the same numbers fight.ts always had: alight and flailing to 90, sunk into the pile by 160, the statue
// and the wig showing at 150)

/** How far down into the pile he's gone (0..1). */
const sinkOf = (t: number) => clamp01((t - 90) / 70);
/** How big the pile's got. */
const pileOf = (t: number) => Math.min(1, t / 140);
/** The fire on him. */
const bodyFire = (t: number) => (t < 90 ? Math.min(1, (t + 3) / 10) : Math.max(0, 1 - (t - 90) / 75));
/** The fire on the pile (catching as he goes in, dying down after). */
const pileFire = (t: number) => (t < 85 ? 0 : t < 150 ? (t - 85) / 65 : Math.max(0, 1 - (t - 150) / 150));
/** The embers left breathing in the ash. */
const smolder = (t: number) => clamp01((t - 130) / 40);
/** How high the char's climbed him. */
const charOf = (t: number) => snap(Math.min(DONNIE_H + 24, t * 1.15));
/** The flicker, all over (two sines beating). */
const flick = (fr: number, s = 0) => 0.5 + 0.5 * Math.sin(fr * 0.53 + s * 5.1) * Math.sin(fr * 0.21 + s * 2.3);

// ---------------------------------------------------------------------------------------------------------------
// Flame

/** The ramp: dark red edge, red, orange, yellow, the white-yellow heart. */
const FIRE = ['#7F1D1D', '#DC2626', '#F97316', '#FACC15', '#FEF9C3'];
/** Each band's share of the tongue: across, and up. */
const BAND_W = [1, 0.78, 0.58, 0.4, 0.22];
const BAND_H = [1, 0.84, 0.66, 0.48, 0.28];

/**
 * One tongue of flame: its foot at (x, base), w across, h tall. In rows of the art's pixel, each band a narrower,
 * shorter copy of the one round it, all swaying together (the tip most), a dither down each seam; a lick breaks off the
 * tip and goes up.
 */
const tongue = (c: Ctx, x: number, base: number, w: number, h: number, seed: number, fr: number) => {
  if (h < 4 || w < 3) return;
  const sway = (u: number) => Math.sin(fr * 0.29 + seed * 6.3 + u * 3.4) * w * 0.42 * u * u + Math.sin(fr * 0.11 + seed) * w * 0.12 * u;
  for (let b = 0; b < 5; b++) {
    const hb = h * BAND_H[b], wb = w * BAND_W[b], rows = Math.max(1, Math.round(hb / P));
    c.fillStyle = FIRE[b];
    for (let r = 0; r < rows; r++) {
      const u = r / rows, ua = (r * P) / h;
      const prof = Math.min(1, 0.5 + u * 2.4) * Math.pow(1 - u, 0.8);
      const half = Math.round((wb * prof) / 2 / P);
      if (half < 1 && b > 0) continue;
      const cx = snap(x + sway(ua)), y = snap(base) - (r + 1) * P, hw = Math.max(1, half) * P;
      c.fillRect(cx - hw, y, hw * 2, P);
      // (the seam into the band round it: every other row, a cell out either side)
      if (b > 0 && (r + b + (fr >> 1)) % 2 === 0) { c.fillRect(cx - hw - P, y, P, P); c.fillRect(cx + hw, y, P, P); }
    }
  }
  // (the lick off the tip, going up, shrinking, cooling)
  const per = 12 + Math.floor(hash(seed) * 8), a = ((fr + seed * 37) % per) / per;
  const lx = snap(x + sway(1) + Math.sin(a * 4 + seed) * w * 0.2), ly = snap(base - h * (0.92 + a * 0.55)), s = Math.max(1, Math.round((1 - a) * w * 0.18 / P)) * P;
  c.fillStyle = FIRE[0]; c.fillRect(lx - s / 2 - P / 2, ly - P / 2, s + P, s + P);
  c.fillStyle = FIRE[a < 0.4 ? 3 : a < 0.7 ? 2 : 1]; c.fillRect(lx - s / 2, ly, s, s);
};

/** The tongues on him: where on him each starts, how big. Odd ones in front of him, even ones behind. */
const TONGUES = Array.from({ length: 9 }, (_, i) => ({
  dx: (hash(i + 1) - 0.5) * 46, frac: 0.04 + (i / 8) * 0.74 + (hash(i + 7) - 0.5) * 0.08,
  h: 26 + hash(i + 13) * 30, w: 12 + hash(i + 19) * 10, seed: i * 1.37 + 0.4,
}));
const bodyTongues = (c: Ctx, x: number, feet: number, sink: number, pileTop: number, t: number, fr: number, front: boolean) => {
  const I = bodyFire(t), ch = t * 1.15 + 26;
  if (I <= 0) return;
  TONGUES.forEach((g, i) => {
    if ((i % 2 === 1) !== front) return;
    // (catching from the feet up, as the char goes)
    const at = g.frac * DONNIE_H;
    if (at > ch) return;
    const grow = clamp01((ch - at) / 20);
    const base = Math.min(pileTop, feet - at + sink);
    const h = g.h * I * grow * (0.62 + 0.38 * flick(fr, g.seed)) * (front ? 0.8 : 1.1);
    tongue(c, x + g.dx * (front ? 0.8 : 1), base, g.w * (front ? 0.85 : 1.15) * (0.6 + 0.4 * I), h, g.seed, fr);
  });
};
const PILE_TONGUES = Array.from({ length: 6 }, (_, i) => ({ dx: (i / 5 - 0.5) * 50 + (hash(i + 31) - 0.5) * 6, h: 16 + hash(i + 37) * 20, w: 10 + hash(i + 41) * 8, seed: i * 2.11 + 9 }));
const pileTongues = (c: Ctx, x: number, t: number, fr: number) => {
  const I = pileFire(t), pk = pileOf(t);
  if (I <= 0.02) return;
  for (const g of PILE_TONGUES) {
    const u = Math.abs(g.dx) / 30, base = GY - 15 * pk * Math.sqrt(Math.max(0, 1 - u * u)) + 2;
    tongue(c, x + g.dx * pk, base, g.w * (0.5 + 0.5 * I), g.h * I * (0.55 + 0.45 * flick(fr, g.seed)), g.seed, fr);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him, alight: drawn into a canvas of his own so the char and the firelight land on him and nowhere else

let spr: HTMLCanvasElement | null = null;
let sprRes = 0;
const SW = 220, SH = 250, FX = 110, FY = 226;
const charred = (c: Ctx, b: Burn, wig: boolean, fr: number) => {
  const t = b.t;
  const m = c.getTransform?.(), res = Math.max(1, Math.min(6, Math.ceil(m ? Math.hypot(m.a, m.b) : 1)));
  if (!spr || sprRes !== res) { spr = document.createElement('canvas'); spr.width = SW * res; spr.height = SH * res; sprRes = res; }
  const g = spr.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, spr.width, spr.height);
  g.setTransform(res, 0, 0, res, 0, 0);
  // (flailing: hands up at his face, then thrown back, by turns, faster as it takes; then just the flinch, going down)
  const flail = t < 90 ? Math.floor(t / (t < 40 ? 9 : 6)) % 2 === 0 : false;
  drawDonnie(g, FX, FY, b.facing, fr, flail ? 'panic' : 'hurt', 1, { cape: true, wig, powered: t < 40 });
  g.globalCompositeOperation = 'source-atop';
  // (the firelight on him: warm all over, flickering, hotter on the near side)
  const I = Math.max(bodyFire(t), pileFire(t) * 0.6);
  g.fillStyle = `rgba(249, 115, 22, ${(0.12 + 0.1 * flick(fr) * I).toFixed(3)})`; g.fillRect(0, 0, SW, SH);
  checker(g, 0, 0, SW, SH, `rgba(253, 186, 116, ${(0.035 * Math.round(I * 4)).toFixed(3)})`, (fr >> 2) & 1);
  // (the char: black from the feet up, a dithered step into it, the burning edge glowing along its front)
  const ch = charOf(t), top = FY - ch;
  g.fillStyle = 'rgba(28, 18, 14, 0.9)'; g.fillRect(0, top + 8, SW, SH);
  checker(g, 0, top, SW, 8, 'rgba(28, 18, 14, 0.9)');
  checker(g, 0, top - 6, SW, 6, 'rgba(68, 40, 24, 0.55)', 1);
  if (ch < DONNIE_H + 20) for (let x = 0; x < SW; x += P) {
    const k = hash(x * 0.37 + Math.floor(fr / 3) * 0.71);
    if (k < 0.35) continue;
    g.fillStyle = k > 0.85 ? '#FEF9C3' : k > 0.65 ? '#FACC15' : '#F97316';
    g.fillRect(x, top + 6 + snap(hash(x + 3) * 4), P, P);
  }
  // (the cracks in the char breathing orange)
  for (let j = 0; j < 14; j++) {
    const cy = FY - snap(hash(j + 51) * Math.min(ch, DONNIE_H)) - 4;
    if (cy < top + 10) continue;
    const pulse = flick(fr * 0.6, j);
    if (pulse < 0.3) continue;
    const cx = snap(FX + (hash(j + 57) - 0.5) * 44);
    g.fillStyle = pulse > 0.75 ? '#FACC15' : pulse > 0.5 ? '#F97316' : '#B91C1C';
    g.fillRect(cx, cy, P * 2, P); g.fillRect(cx + P, cy + P, P, P);
  }
  g.globalCompositeOperation = 'source-over';
  return spr;
};

// ---------------------------------------------------------------------------------------------------------------
// Smoke, embers, sparks, shimmer

/** Where the smoke and the embers come up from. */
const sourceY = (b: Burn, t: number) => {
  const sink = sinkOf(t), pk = pileOf(t);
  return t < 150 ? Math.min(GY - 14 * pk, b.y - DONNIE_H * 0.8 + sink * DONNIE_H) : GY - 14 * pk;
};
const SMOKE = ['rgba(41, 37, 36, 0.78)', 'rgba(68, 64, 60, 0.62)', 'rgba(87, 83, 78, 0.46)', 'rgba(120, 113, 108, 0.3)'];
const smoke = (c: Ctx, b: Burn, fr: number) => {
  const t = b.t, I = Math.max(bodyFire(t), pileFire(t), smolder(t) * 0.45);
  if (t < 4) return;
  const y0 = sourceY(b, t);
  for (let j = 0; j < 12; j++) {
    const per = 80 + Math.floor(hash(j + 3) * 30), cyc = Math.floor((fr + j * 23) / per), a = ((fr + j * 23) % per) / per;
    if (hash(j * 7 + cyc * 13) > I) continue;
    const x = b.x + (hash(j + cyc * 3) - 0.5) * 30 + Math.sin(a * 5 + j) * 8 + a * 26, y = y0 - 10 - a * 150;
    const r = 5 + a * 18;
    const step = Math.min(3, Math.floor(a * 4));
    pixelBlob(c, snap(x), snap(y), r, r * 0.8, SMOKE[step]);
    // (young: lit from under by the fire)
    if (a < 0.3 && I > 0.3) pixelBlob(c, snap(x), snap(y + r * 0.45), r * 0.7, r * 0.35, `rgba(249, 115, 22, ${(0.35 * (1 - a / 0.3) * I).toFixed(3)})`);
  }
};
const EMBER = ['#FEF9C3', '#FDE047', '#F97316', '#DC2626', '#7F1D1D'];
const embers = (c: Ctx, b: Burn, fr: number) => {
  const t = b.t, I = Math.max(bodyFire(t), pileFire(t) * 0.9, smolder(t) * 0.25);
  if (I <= 0) return;
  const y0 = sourceY(b, t);
  for (let j = 0; j < 26; j++) {
    const per = 40 + Math.floor(hash(j) * 34), cyc = Math.floor((fr + hash(j + 1) * per) / per), a = ((fr + hash(j + 1) * per) % per) / per;
    if (hash(j * 3.1 + cyc * 17) > I) continue;
    const sx = b.x + (hash(j + 3 + cyc) - 0.5) * 54, sy = y0 + 10 - hash(j + 5 + cyc) * 40;
    const x = snap(sx + Math.sin(a * 6 + j) * 10 * a + a * 16), y = snap(sy - a * (70 + hash(j + 9) * 70));
    const step = Math.min(4, Math.floor(a * 5)), s = a < 0.45 ? 3 : 2;
    box(c, x, y, s, s, EMBER[step]);
  }
  // (sparks: the crackle while it's roaring, streaking out and up)
  if (bodyFire(t) > 0.4 || pileFire(t) > 0.6) for (let j = 0; j < 8; j++) {
    const per = 16 + Math.floor(hash(j + 71) * 10), a = ((fr + j * 11) % per) / per, cyc = Math.floor((fr + j * 11) / per);
    if (hash(j + cyc * 5) < 0.45) continue;
    const ang = -Math.PI / 2 + (hash(j + cyc * 2 + 77) - 0.5) * 2.2, sp = 50 + hash(j + 79) * 40;
    const ox = b.x + (hash(j + cyc + 83) - 0.5) * 30, oy = y0 + 4;
    const x = ox + Math.cos(ang) * sp * a, y = oy + Math.sin(ang) * sp * a + a * a * 24;
    box(c, snap(x), snap(y), P, P, a < 0.5 ? '#FEF9C3' : '#FACC15');
    box(c, snap(x - Math.cos(ang) * 4), snap(y - Math.sin(ang) * 4), P, P, a < 0.5 ? '#FACC15' : '#F97316');
  }
};
/** The air over the fire wavering: rows of what's already there nudged side to side (the canvas over itself). */
const shimmer = (c: Ctx, x: number, y0: number, y1: number, w: number, fr: number, amt: number) => {
  if (amt < 0.05 || !c.getTransform) return;
  const m = c.getTransform();
  if (m.b || m.c || m.a <= 0 || m.d <= 0) return;
  const W = c.canvas.width, H = c.canvas.height;
  const L = Math.max(0, Math.floor(m.a * (x - w) + m.e)), R = Math.min(W, Math.ceil(m.a * (x + w) + m.e));
  const T = Math.max(0, Math.floor(m.d * y0 + m.f)), B = Math.min(H, Math.ceil(m.d * y1 + m.f));
  if (R - L < 4 || B - T < 4) return;
  const band = Math.max(2, Math.round(m.d * P));
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = T; y < B; y += band) {
    const k = (y - T) / (B - T);
    const off = Math.round(Math.sin(fr * 0.45 + ((y - T) / m.d) * 0.17) * m.a * amt * (0.35 + 0.65 * k));
    if (!off) continue;
    const h = Math.min(band, B - y);
    c.drawImage(c.canvas, L, y, R - L, h, L + off, y, R - L, h);
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The pile, the statue

const ASH = ['#1C1917', '#292524', '#44403C', '#57534E', '#78716C', '#A8A29E'];
const pile = (c: Ctx, x: number, t: number, fr: number) => {
  const pk = pileOf(t);
  if (pk <= 0.02) return;
  const W = 34 * pk, H = Math.max(2, 16 * pk), rows = Math.max(1, Math.round(H / P));
  // (an inked mound in rows, darker at its foot, lighter up top, lit up its left where the room's light is)
  const halfAt = (r: number) => Math.round((W * Math.sqrt(Math.max(0, 1 - Math.pow(r / rows, 2)))) / P) * P;
  c.fillStyle = INK;
  for (let r = 0; r < rows; r++) { const hw = halfAt(r) + P; c.fillRect(snap(x) - hw, GY - (r + 1) * P - P, hw * 2, P * 2); }
  for (let r = 0; r < rows; r++) {
    const hw = halfAt(r), y = GY - (r + 1) * P, u = r / rows, cx = snap(x);
    if (hw <= 0) continue;
    const col = ASH[1 + Math.min(3, Math.floor(u * 4))];
    c.fillStyle = col; c.fillRect(cx - hw, y, hw * 2, P);
    // (the left shoulder lit, a step up; the right a step down)
    c.fillStyle = ASH[Math.min(5, 2 + Math.floor(u * 4))]; c.fillRect(cx - hw, y, Math.max(P, snap(hw * 0.5)), P);
    c.fillStyle = ASH[Math.max(0, Math.floor(u * 4))]; c.fillRect(cx + hw - Math.max(P, snap(hw * 0.35)), y, Math.max(P, snap(hw * 0.35)), P);
    if ((r & 1) === 0) checker(c, cx - hw, y, hw * 2, P, 'rgba(28, 25, 23, 0.35)', r & 2 ? 1 : 0);
  }
  // (flecks: bits of bone-white and black through it)
  for (let j = 0; j < 18; j++) {
    const u = hash(j + 101), r = hash(j + 107) * 0.85, hw = halfAt(Math.floor(r * rows));
    if (hw < 4) continue;
    box(c, snap(x + (u - 0.5) * 2 * (hw - 2)), GY - snap(r * H) - P, P, P, j % 3 ? '#1C1917' : '#D6D3D1');
  }
  // (a scrap of the cape poking out, its red lining)
  if (pk > 0.6) {
    const sx = snap(x + 18 * pk), sy = GY - 6;
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 3, sy + 3); c.lineTo(sx + 10, sy - 6); c.lineTo(sx + 9, sy + 3); c.closePath(); c.fill();
    box(c, sx, sy - 2, 6, 3, '#18181B'); box(c, sx + 2, sy, 5, 2, '#7F1D1D');
  }
  // (embers breathing in it, stepped)
  const S = Math.max(smolder(t), pileFire(t));
  if (S > 0) for (let j = 0; j < 12; j++) {
    const pulse = flick(fr * 0.5, j + 200) * S;
    if (pulse < 0.18) continue;
    const r = hash(j + 131) * 0.7, hw = halfAt(Math.floor(r * rows));
    if (hw < 4) continue;
    const ex = snap(x + (hash(j + 137) - 0.5) * 2 * (hw - 3)), ey = GY - snap(r * H) - P;
    box(c, ex - P, ey, P * 3, P, pulse > 0.55 ? '#DC2626' : '#7F1D1D');
    box(c, ex, ey, P, P, pulse > 0.7 ? '#FDE047' : pulse > 0.4 ? '#F97316' : '#DC2626');
  }
};

/** The little Christ the Redeemer, in glow-in-the-dark plastic, standing in the ash: stepped lime, inked, its glow
 *  round it, the fire's warm rim down its right side; a glint off its head as it shows. */
const statue = (c: Ctx, gx: number, gy: number, t: number, fr: number, warm: number) => {
  gx = snap(gx); gy = snap(gy);
  const glow = 0.75 + 0.25 * Math.sin(fr * 0.08);
  for (let i = 3; i >= 1; i--) pixelBlob(c, gx, gy - 16, 8 + i * 6, 8 + i * 6, `rgba(217, 249, 157, ${(0.06 * (4 - i) * glow).toFixed(3)})`);
  // (the parts, as rects: inked all round first, then filled)
  type R = [number, number, number, number, string];
  const parts: R[] = [
    [-5, -4, 10, 4, '#65A30D'],                       // the plinth, sunk in the ash
    [-4, -8, 8, 4, '#A3E635'], [-3, -14, 6, 6, '#D9F99D'], [-3, -22, 6, 8, '#D9F99D'], // the robe, flaring to his feet
    [-14, -24, 28, 3, '#D9F99D'],                     // the arms, straight out
    [-8, -21, 5, 3, '#A3E635'], [3, -21, 5, 3, '#A3E635'], // the sleeves hanging under them
    [-2, -30, 4, 5, '#ECFCCB'],                       // the head, bowed
  ];
  for (const [x, y, w, h] of parts) box(c, gx + x - 1, gy + y - 1, w + 2, h + 2, INK);
  for (const [x, y, w, h, col] of parts) box(c, gx + x, gy + y, w, h, col);
  // (stepped shade: the left side away from the fire a step down, the folds, the top lit)
  box(c, gx - 4, gy - 8, 2, 4, '#65A30D'); box(c, gx - 3, gy - 22, 1, 14, '#A3E635');
  box(c, gx, gy - 20, 1, 12, '#84CC16');
  box(c, gx - 14, gy - 24, 28, 1, '#F7FEE7');
  box(c, gx - 2, gy - 30, 1, 5, '#D9F99D'); box(c, gx - 1, gy - 27, 2, 1, '#A3E635');
  // (the fire's rim down its right side)
  if (warm > 0.05) {
    const a = (0.5 + 0.4 * flick(fr, 3)) * warm;
    c.fillStyle = `rgba(251, 146, 60, ${a.toFixed(3)})`;
    c.fillRect(gx + 2, gy - 22, 1, 14); c.fillRect(gx + 3, gy - 8, 1, 4); c.fillRect(gx + 13, gy - 24, 1, 3); c.fillRect(gx + 1, gy - 30, 1, 5);
  }
  // (the glint as it shows: a four-point star, stepped, off its head)
  const gt = t - 150;
  if (gt >= 0 && gt < 24) {
    const s = gt < 12 ? gt / 12 : 1 - (gt - 12) / 12, L = Math.round(2 + s * 8);
    const sx = gx + 1, sy = gy - 31;
    box(c, sx - L, sy, L * 2 + 1, 1, '#F7FEE7'); box(c, sx, sy - L, 1, L * 2 + 1, '#F7FEE7');
    box(c, sx - 1, sy - 1, 3, 3, '#FFFFFF');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot

/** World space: his whole burning death, as it is at b.t. */
export const drawBurn = (c: Ctx, b: Burn, wig: boolean, fr: number) => {
  const t = b.t, x = b.x, sink = sinkOf(t), pk = pileOf(t), pileTop = GY - 14 * pk;
  const I = bodyFire(t), PI = pileFire(t), heat = Math.max(I, PI);
  const fl = flick(fr);
  // (the floor lit round it: stepped pools)
  if (heat > 0.02) for (let i = 3; i >= 1; i--) pixelBlob(c, snap(x), GY + 1, 26 + i * 22, 3 + i * 2, `rgba(249, 115, 22, ${(0.07 * (4 - i) * heat * (0.8 + 0.2 * fl)).toFixed(3)})`);
  // (the heat round him: a stepped halo)
  if (I > 0.02) for (let i = 3; i >= 1; i--) pixelBlob(c, snap(x), snap(b.y - 44 + sink * 60), 22 + i * 10, 40 + i * 8 - sink * 30, `rgba(249, 115, 22, ${(0.045 * (4 - i) * I * (0.8 + 0.2 * fl)).toFixed(3)})`);
  smoke(c, b, fr);
  // The ignition: a ring of flame thrown off him as it takes
  if (t < 10) {
    const r = 10 + t * 7;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; box(c, snap(x + Math.cos(a) * r * 0.8) - 2, snap(b.y - 46 + Math.sin(a) * r) - 2, 4, 4, t < 5 ? '#FEF9C3' : i % 2 ? '#FACC15' : '#F97316'); }
  }
  // Behind him: the tongues at his back, the pile's
  bodyTongues(c, x, b.y, sink * DONNIE_H, pileTop, t, fr, false);
  // Him: alight, flailing, charring, then down into his pile
  if (sink < 1) {
    const img = charred(c, b, wig, fr);
    const wob = t < 90 ? Math.sin(t * 0.7) * 3 : 0, tip = t < 90 ? Math.sin(t * 0.45) * 0.06 : 0;
    c.save();
    c.beginPath(); c.rect(x - SW / 2 - 20, b.y - SH - 20, SW + 40, Math.max(0, pileTop + 2 - (b.y - SH - 20))); c.clip();
    c.translate(x + wob, b.y - 40); c.rotate(tip * b.facing); c.translate(-(x + wob), -(b.y - 40));
    c.drawImage(img, x + wob - FX, b.y + sink * DONNIE_H - FY, SW, SH);
    c.restore();
    // (flakes of him coming off as he goes in)
    if (t > 90) for (let j = 0; j < 14; j++) {
      const a = ((t - 90 + j * 5) % 22) / 22, top = b.y - DONNIE_H + sink * DONNIE_H;
      if (top >= pileTop) break;
      const fx = x + (hash(j + 61) - 0.5) * 50 + (hash(j + 67) - 0.5) * 16 * a, fy = top + hash(j + 71) * (pileTop - top) * 0.6 + a * a * 30;
      if (fy > pileTop) continue;
      box(c, snap(fx), snap(fy), P, P, j % 5 === 0 ? '#F97316' : ASH[1 + (j % 3)]);
    }
  }
  pile(c, x, t, fr);
  pileTongues(c, x, t, fr);
  // In front of him: the tongues licking up his front
  bodyTongues(c, x, b.y, sink * DONNIE_H, pileTop, t, fr, true);
  // What's left: the wig on top, the little statue standing in it, the name tag come down on it
  if (t > 150) {
    drawLooseWig(c, x + 6, GY - 16 * pk - 2, fr, 0.9, 0.2);
    statue(c, x - 18, GY - 8, t, fr, Math.max(PI, smolder(t) * 0.4));
    const tx = snap(x + 14), ty = GY - 8;
    box(c, tx - 1, ty - 1, 14, 9, INK); box(c, tx, ty, 12, 7, '#F5F5F4'); box(c, tx, ty, 12, 2, '#DC2626');
    box(c, tx + 2, ty + 3, 8, 1, '#A8A29E'); box(c, tx + 9, ty + 5, 3, 2, '#44403C'); box(c, tx + 10, ty + 4, 2, 1, '#78716C');
  }
  embers(c, b, fr);
  // The air over it wavering
  shimmer(c, x, sourceY(b, t) - 110, sourceY(b, t) - 6, 46, fr, Math.max(I, PI * 0.8, smolder(t) * 0.25) * 1.2);
};

/** The fire's light, for the scene's lighting: on the room, the statue, him. */
export const burnLights = (b: Burn, fr: number): Light[] => {
  const t = b.t, out: Light[] = [];
  const I = bodyFire(t), PI = pileFire(t), S = smolder(t), fl = flick(fr), sink = sinkOf(t);
  if (t < 12) out.push({ x: b.x, y: b.y - 50, r: 460, a: 1 - t / 12, color: `rgba(254, 249, 195, ${(0.3 * (1 - t / 12)).toFixed(3)})` });
  if (I > 0.02) {
    const y = Math.min(GY - 20, b.y - 50 + sink * DONNIE_H);
    out.push({ x: b.x, y, r: 250 + 40 * fl, a: Math.min(1, 0.95 * I), color: `rgba(249, 115, 22, ${(0.2 * I).toFixed(3)})` });
    out.push({ x: b.x, y: y + 6, r: 110 + 20 * fl, a: 0.8 * I, color: `rgba(253, 224, 71, ${(0.14 * I).toFixed(3)})` });
  }
  if (PI > 0.02) out.push({ x: b.x, y: GY - 24, r: 170 + 50 * PI + 20 * fl, a: Math.min(1, 0.85 * PI), color: `rgba(249, 115, 22, ${(0.17 * PI).toFixed(3)})` });
  if (S > 0) out.push({ x: b.x, y: GY - 8, r: 80, a: 0.5 * S * (0.75 + 0.25 * flick(fr * 0.5, 9)), color: `rgba(220, 38, 38, ${(0.1 * S).toFixed(3)})` });
  if (t > 150) out.push({ x: b.x - 18, y: GY - 24, r: 70, a: 0.6, color: 'rgba(217, 249, 157, 0.12)' });
  return out;
};
