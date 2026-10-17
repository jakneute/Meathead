// The streets' backdrop (screen space; ONE for the whole walk, so nothing pops walking from one pavilion into the
// next): the sky by the hour (timeOfDay.ts), the lagoon along the back with its big fake FIREWORKS barge (it drifts
// across the whole walk, slow: the far shore's that far off), and each pavilion's far landmark (Mexico's mesas and saguaros,
// Norway's fjord, China's ridge with the wall on it, Germany's castle on its hill, Italy's (straight) bell tower and its hills,
// Fuji, the dunes, the minaret, the cathedral, the Ferris wheel, the Rockies, the helicopter ride's globe) slid in by parallax round where its
// pavilion is, so they come and go as he walks. All of it tinted far into the haze.
//
// The SNES pass (Mexico's, Norway's, China's and Germany's so far; the rest still the first pass's live painters, below): each landmark
// painted once for the hour into a stamp (STILLS: real silhouettes, stepped strata and flanks, snow, forests, the haze
// over their feet), with only what moves drawn live over it (the falls); the lagoon in banded
// water under the far shore's tree line (a tile for the hour), glinting; the barge painted for the hour (its hull and
// tire fenders, the mortar racks, the shack and its board), its reflection wobbling, and after dark its show (stepped
// shells going up, bursts in rings of square sparks with their trails, falling and fading).
//
// Up a climb (the Great Wall) the horizon sinks: more sky.

import type { GameState } from '../../m1/game/core/state';
import { drawTodSky, farTint, timeOfDay, hourMix, skyAt, type TimeOfDay } from '../timeOfDay';
import { farCol } from '../hollywood/blvd/far';
import { mist, falls } from '../adventure/farArt';
import { box, poly, mix, hash, checker, stamp, bandedGradient, pixelBlob, signText, plain, INK } from './kit';
import { SECTIONS, FLX, type ForeignId } from './geometry';

type Ctx = CanvasRenderingContext2D;
const W = 800, H = 600;

const SKY = ['#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#FDE68A'];
/** How far the landmarks slide (of the camera's travel), and the barge. */
const K = 0.22, BARGE_K = 0.02;

// ---------------------------------------------------------------------------------------------------------------
// The stamped landmarks (the SNES pass): each painted with its middle-bottom at (w / 2, h) in its own box

type T = (c: string) => string;
interface Far { w: number; h: number; /** how far into the haze */ k: number; paint: (g: Ctx, T: T, tod: TimeOfDay) => void; live?: (c: Ctx, x0: number, top: number, f: number, T: T) => void }
/** A ramp for a far thing: shadow, shade, itself, lit, highlight (each for the hour). */
const rampT = (T: T, c: string) => [T(mix(c, '#1C1430', 0.5)), T(mix(c, '#1C1430', 0.26)), T(c), T(mix(c, '#F4E8D0', 0.24)), T(mix(c, '#FFFFFF', 0.45))];

/** A mesa: a flat-topped butte, its cap rock, its strata banded down (lit on its left face, shaded right), its talus
 *  skirt; gullies down it. */
const mesa = (g: Ctx, x0: number, x1: number, top: number, foot: number, R: string[], seed: number) => {
  const w = x1 - x0, inset = 18;
  const face: [number, number][] = [[x0, foot], [x0 + inset, top + 10], [x0 + inset + 4, top], [x1 - inset - 4, top], [x1 - inset, top + 10], [x1, foot]];
  poly(g, face, R[2]);
  g.save(); g.beginPath(); face.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  // (the strata: bands, alternately lit and shaded, dithered at their seams)
  for (let y = top + 12, k = 0; y < foot; k++) { const bh = 8 + Math.floor(hash(seed + k) * 10); box(g, x0, y, w, bh, R[k % 2 ? 2 : 3]); checker(g, x0, y - 1, w, 2, R[k % 2 ? 2 : 3], k % 2); box(g, x0, y + bh - 1, w, 1, R[1]); y += bh; }
  // (the left face in the sun, the right in shade)
  box(g, x0, top, inset + 14, foot - top, R[3]); checker(g, x0 + inset + 14, top, 4, foot - top, R[3], 0);
  box(g, x1 - inset - 22, top, inset + 22, foot - top, R[1]); checker(g, x1 - inset - 26, top, 4, foot - top, R[1], 1);
  // (gullies: streaks of shade down from the rim)
  for (let i = 0; i < w / 26; i++) { const gx = x0 + inset + 8 + hash(seed + i * 3.1) * (w - inset * 2 - 16); for (let y = top + 10; y < foot - 4; y += 2) box(g, gx + Math.round(Math.sin(y * 0.15 + i) * 1.5), y, 2, 2, R[0]); box(g, gx - 1, top + 10, 1, (foot - top) * 0.5, R[4]); }
  g.restore();
  // (the cap rock: a darker lip with a lit top edge)
  box(g, x0 + inset + 2, top, w - inset * 2 - 4, 6, R[1]); box(g, x0 + inset + 4, top, w - inset * 2 - 8, 2, R[4]);
  // (the talus skirt: the rubble fanning out round its foot)
  poly(g, [[x0 - 30, foot], [x0 + inset + 10, foot - 40], [x1 - inset - 10, foot - 40], [x1 + 30, foot]], R[1]);
  for (let i = 0; i < w / 6; i++) box(g, x0 - 20 + hash(seed + i * 0.7) * (w + 40), foot - 2 - hash(seed + i * 1.9) * 30, 2, 1, R[i % 3 ? 2 : 3]);
};
/** A giant plywood saguaro: a ribbed trunk (lit left), arms up, the 2x4 brace behind it showing. */
const saguaro = (g: Ctx, x: number, foot: number, h: number, R: string[], seed: number) => {
  const arm = (ax: number, ay: number, dir: number, up: number) => {
    box(g, ax - (dir < 0 ? 12 : 0), ay, 12, 7, INK); box(g, ax - (dir < 0 ? 11 : -1), ay + 1, 10, 5, R[2]);
    const cx = ax + dir * 10;
    box(g, cx - 4, ay - up, 9, up + 7, INK); box(g, cx - 3, ay - up + 1, 7, up + 5, R[2]); box(g, cx - 3, ay - up + 1, 2, up + 5, R[3]); box(g, cx + 2, ay - up + 1, 2, up + 5, R[1]);
    box(g, cx - 2, ay - up, 5, 2, INK);
  };
  box(g, x + 6, foot - h * 0.6, 2, h * 0.6, R[0]);
  box(g, x - 7, foot - h, 14, h, INK); box(g, x - 6, foot - h + 1, 12, h - 1, R[2]);
  box(g, x - 6, foot - h + 1, 3, h - 1, R[3]); box(g, x - 5, foot - h + 1, 1, h - 1, R[4]); box(g, x + 3, foot - h + 1, 3, h - 1, R[1]);
  for (const rx of [x - 2, x + 1]) box(g, rx, foot - h + 3, 1, h - 4, R[1]);
  box(g, x - 4, foot - h - 1, 8, 2, INK);
  if (hash(seed) > 0.2) arm(x - 6, foot - h * 0.55, -1, h * 0.25);
  if (hash(seed + 1) > 0.35) arm(x + 6, foot - h * 0.42, 1, h * 0.22);
};
/** A sheer fjord wall: rising in steps to its crest, vertical striations down its face (lit edges), snow along the top
 *  and in its gullies, a forest of firs along its foot. `dir`: which way it faces the water (1 right). */
const fjordWall = (g: Ctx, pts: [number, number][], foot: number, dir: number, R: string[], snow: string[], fir: string[], seed: number) => {
  const xs = pts.map(p => p[0]), xa = Math.min(...xs), xb = Math.max(...xs);
  const shape: [number, number][] = [[xa, foot], ...pts, [xb, foot]];
  poly(g, shape, R[2]);
  g.save(); g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  // (the face toward the water lit or shaded by which way it looks; striations down it)
  for (let x = xa; x < xb; x += 4) { const t = hash(seed + x * 0.21); if (t > 0.55) box(g, x, 0, 2, foot, t > 0.85 ? R[3] : R[1]); }
  const edge = dir > 0 ? xb - 40 : xa;
  box(g, edge, 0, 40, foot, dir > 0 ? R[1] : R[3]); checker(g, dir > 0 ? edge - 4 : edge + 40, 0, 4, foot, dir > 0 ? R[1] : R[3], 0);
  // (ledges across in steps, a lit top on each)
  for (let k = 0; k < 6; k++) { const y = 40 + k * 34 + hash(seed + k) * 18; box(g, xa, y, xb - xa, 2, R[0]); box(g, xa, y - 1, xb - xa, 1, R[3]); }
  // (snow in the gullies off the crest)
  for (let i = 0; i < (xb - xa) / 18; i++) { const sx = xa + hash(seed + i * 2.7) * (xb - xa); for (let y = 0; y < 60 + hash(seed + i) * 50; y += 2) box(g, sx + Math.round(Math.sin(y * 0.2 + i) * 2), y, 2, 2, snow[1]); }
  g.restore();
  // (the snow along the crest, lit, its shaded underside)
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    for (let x = ax; x < bx; x += 2) { const t = (x - ax) / (bx - ax || 1), y = Math.round(ay + (by - ay) * t), d = 4 + Math.round(hash(seed + x) * 6); box(g, x, y, 2, d, snow[2]); box(g, x, y, 2, 1, snow[3]); box(g, x, y + d, 2, 1, snow[0]); }
  }
  // (firs along the foot: stepped triangles, a lit left side)
  for (let i = 0; i < (xb - xa) / 7; i++) {
    const fx = xa + i * 7 + hash(seed + i) * 4, fh = 12 + hash(seed + i * 1.7) * 14;
    poly(g, [[fx - fh * 0.32, foot], [fx, foot - fh], [fx + fh * 0.32, foot]], fir[1]);
    poly(g, [[fx - fh * 0.32, foot], [fx, foot - fh], [fx, foot]], fir[2]);
    box(g, fx - 1, foot - fh, 1, 2, fir[3]);
  }
};

/** A crest through points (linear between them). */
const crestOf = (pts: [number, number][]) => (x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; return ay + ((x - ax) / (bx - ax || 1)) * (by - ay); }
  return pts[pts.length - 1][1];
};
/** A range column by column under its crest: the flanks facing the light (rising to the right: lit from the upper left)
 *  lit with a rim, the others in shade, dithered into the body; gullies streaked down; ledges across. `snow`: white
 *  down from the crest where it's over `line`. */
const rangeCols = (g: Ctx, crest: (x: number) => number, xa: number, xb: number, foot: number, R: string[], seed: number, snow?: { S: string[]; line: number }) => {
  for (let x = xa; x < xb; x += 2) {
    const y = Math.round(crest(x)), sl = crest(x + 4) - crest(x - 4), lit = sl < -1.2, shade = sl > 1.2;
    box(g, x, y, 2, foot - y, R[2]);
    const band = 18 + Math.round(hash(seed + x * 0.11) * 14);
    if (lit) { box(g, x, y, 2, band, R[3]); box(g, x, y, 2, 2, R[4]); if ((x >> 1) % 2) box(g, x, y + band, 2, 2, R[3]); }
    else if (shade) { box(g, x, y, 2, band + 8, R[1]); if ((x >> 1) % 2) box(g, x, y + band + 8, 2, 2, R[1]); }
    else box(g, x, y, 2, 1, R[3]);
    if (hash(seed + x * 0.37) > 0.9) for (let yy = y + 8; yy < Math.min(foot, y + 40 + hash(seed + x) * 60); yy += 2) box(g, x + Math.round(Math.sin(yy * 0.2)), yy, 2, 2, R[0]);
    if (snow && y < snow.line) {
      const d = Math.round((snow.line - y) * 0.45 + hash(seed + x * 0.5) * 6);
      box(g, x, y, 2, d, lit ? snow.S[3] : shade ? snow.S[1] : snow.S[2]); box(g, x, y, 2, 1, snow.S[4]);
      if ((x >> 1) % 2) box(g, x, y + d, 2, 2, snow.S[1]);
    }
  }
  for (let k = 0; k < 7; k++) {
    const ly = foot - 30 - k * 26 - hash(seed + k) * 10;
    for (let x = xa; x < xb; x += 2) if (crest(x) < ly - 6 && hash(seed + k * 3 + Math.floor(x / 30)) > 0.45) { box(g, x, ly, 2, 1, R[1]); box(g, x, ly - 1, 2, 1, R[3]); }
  }
};
/** The Great Wall snaking along a crest: a band sat on the ridge (lit along its top), battlements, its watchtowers (lit
 *  left, a dark door, their own battlements). `k`: how big (near 1, far smaller). */
const wallAlong = (g: Ctx, crest: (x: number) => number, xa: number, xb: number, W: string[], k: number, towers: number[]) => {
  const th = Math.max(2, Math.round(5 * k));
  for (let x = xa; x < xb; x += 2) {
    const y = Math.round(crest(x)) - th + 1;
    box(g, x, y, 2, th, W[2]); box(g, x, y, 2, 1, W[3]); box(g, x, y + th - 1, 2, 1, W[1]);
    if (k > 0.6 && (x >> 1) % 3 === 0) box(g, x, y - 2, 2, 2, W[2]);
  }
  for (const tx of towers) {
    const y = Math.round(crest(tx)), tw = Math.round(12 * k), tt = Math.round(16 * k);
    box(g, tx - tw / 2 - 1, y - tt - 1, tw + 2, tt + 1, INK);
    box(g, tx - tw / 2, y - tt, tw, tt, W[2]); box(g, tx - tw / 2, y - tt, Math.max(1, tw / 3), tt, W[3]); box(g, tx + tw / 2 - 2, y - tt, 2, tt, W[1]);
    box(g, tx - 1, y - Math.round(tt * 0.5), 2, Math.round(tt * 0.4), INK);
    for (let bx = tx - tw / 2; bx < tx + tw / 2; bx += 4) box(g, bx, y - tt - 2, 2, 2, W[2]);
  }
};
/** Little firs (stepped: shade, lit left, a tip) scattered `n` under a crest. */
const firsUnder = (g: Ctx, crest: (x: number) => number, w: number, foot: number, F: string[], n: number, seed: number, skip?: (x: number, y: number) => boolean) => {
  for (let i = 0; i < n; i++) {
    const x = hash(seed + i * 1.37) * w, y = crest(x) + 12 + hash(seed + i * 2.9) * 115, ph = 6 + hash(seed + i * 3.7) * 7;
    if (y > foot - 5 || skip?.(x, y)) continue;
    poly(g, [[x - ph * 0.38, y], [x, y - ph], [x + ph * 0.38, y]], F[1]); poly(g, [[x - ph * 0.38, y], [x, y - ph], [x, y]], F[2]); box(g, x - 1, y - ph, 1, 1, F[3]);
  }
};

const STILLS: Partial<Record<ForeignId, Far>> = {
  china: {
    // (THE GREAT WALL far off: a far range of misty blue-green peaks, the wall a thread along it and its towers specks;
    // then the near ridge, green and banded, the wall snaking along its crest (battlements, watchtowers), pines down its
    // flanks; the haze over the feet of each)
    w: 960, h: 380, k: 0.6,
    paint: (g, T, tod) => {
      const w = 960, h = 380, foot = h - 12;
      const far = crestOf([[0, 172], [90, 128], [180, 152], [270, 86], [350, 118], [450, 66], [550, 112], [650, 74], [750, 128], [850, 92], [960, 140]]);
      rangeCols(g, far, 0, w, foot, rampT(T, '#6E8E8C'), 3);
      wallAlong(g, far, 0, w, rampT(T, '#C8C0B0'), 0.45, [90, 270, 450, 650, 850]);
      mist(g, w, 70, foot - 70, skyAt(0.9, tod), 0.05, 0.55, 6);
      const near = crestOf([[0, 232], [70, 196], [150, 220], [240, 150], [330, 182], [420, 118], [520, 168], [610, 128], [700, 188], [790, 154], [880, 206], [960, 194]]);
      rangeCols(g, near, 0, w, foot, rampT(T, '#4E6E3A'), 11);
      firsUnder(g, near, w, foot, rampT(T, '#2E4A2A'), 140, 0);
      wallAlong(g, near, 0, w, rampT(T, '#D6CDB8'), 0.85, [70, 240, 420, 610, 790]);
      mist(g, w, foot - 110, 110, skyAt(0.9, tod), 0, 0.45, 5);
    },
  },
  germany: {
    // (THE CASTLE ON ITS HILL: the snowy Alps far behind; the hill, wooded in firs, a road winding up it, the village at
    // its foot; on the crag at its top, the castle: white walls, round towers under pointed slate roofs, the tall keep,
    // the palace's steep roof, windows lit after dark, its flags)
    w: 900, h: 400, k: 0.6,
    paint: (g, T, tod) => {
      const w = 900, h = 400, foot = h - 14, lamps = tod.lamps > 0.3;
      const alps = crestOf([[0, 214], [60, 152], [110, 182], [170, 92], [230, 142], [300, 62], [360, 122], [420, 84], [480, 150], [560, 72], [630, 132], [700, 92], [770, 160], [840, 112], [900, 172]]);
      rangeCols(g, alps, 0, w, foot, rampT(T, '#6A7896'), 7, { S: rampT(T, '#EEF2F8'), line: 160 });
      mist(g, w, 90, foot - 90, skyAt(0.9, tod), 0.05, 0.55, 6);
      const hill = (x: number) => foot - 168 * Math.exp(-(((x - 450) / 230) ** 2)) - 18 * Math.exp(-(((x - 160) / 90) ** 2)) - 14 * Math.exp(-(((x - 760) / 110) ** 2));
      rangeCols(g, hill, 0, w, foot, rampT(T, '#4E7A3A'), 19);
      firsUnder(g, hill, w, foot, rampT(T, '#2A4A2A'), 220, 5, (x, y) => Math.abs(x - 450) < 56 && y < hill(450) + 40);
      // (the road winding up to the crag)
      const road = rampT(T, '#C8B48A');
      for (let k = 0; k < 120; k++) { const t = k / 120, x = 330 + Math.sin(t * 9) * 60 * (1 - t) + t * 110, y = foot - 6 - t * 150; box(g, x, y, 3, 2, road[2]); box(g, x, y, 3, 1, road[3]); }
      // (the village at the foot: little half-timbered houses, red roofs)
      for (let i = 0; i < 14; i++) {
        const x = 230 + i * 34 + hash(i * 3.3) * 12, y = foot - 2 - hash(i) * 6, hw = 12 + hash(i * 1.9) * 6;
        box(g, x - 1, y - 11, hw + 2, 12, INK); box(g, x, y - 10, hw, 10, T('#EDE6D6')); box(g, x, y - 10, 2, 10, T('#FFFFFF')); box(g, x + 3, y - 7, 2, 3, lamps && hash(i * 7) > 0.4 ? '#FFD88A' : T('#3A4258'));
        poly(g, [[x - 2, y - 10], [x + hw / 2, y - 18], [x + hw + 2, y - 10]], T('#A8402A')); box(g, x + hw / 2, y - 18, 1, 8, T('#7A2A1A'));
      }
      // (the crag: gray rock stepped out of the hilltop, lit left)
      const C = rampT(T, '#8A8A86'), top = Math.round(hill(450)) - 4;
      poly(g, [[392, top + 30], [404, top + 6], [430, top - 6], [474, top - 8], [500, top + 4], [512, top + 30]], C[2]);
      poly(g, [[392, top + 30], [404, top + 6], [430, top - 6], [440, top + 30]], C[3]); poly(g, [[474, top - 8], [500, top + 4], [512, top + 30], [486, top + 30]], C[1]);
      for (let k = 0; k < 5; k++) box(g, 404 + k * 20, top + 8 + (k % 2) * 8, 12, 1, C[0]);
      // (the castle on it: the curtain wall and its battlements, the palace's steep roof, the towers and the keep)
      const Wl = rampT(T, '#ECE8DE'), Sl = rampT(T, '#3E5A8A'), base = top - 4;
      const tower = (x: number, tw: number, th: number, roof: number) => {
        box(g, x - 1, base - th - 1, tw + 2, th + 1, INK);
        box(g, x, base - th, tw, th, Wl[2]); box(g, x, base - th, Math.max(1, Math.round(tw * 0.35)), th, Wl[3]); box(g, x + tw - 2, base - th, 2, th, Wl[1]);
        for (let y = base - th + 6; y < base - 6; y += 10) box(g, x + Math.round(tw / 2) - 1, y, 2, 3, lamps && hash(x + y) > 0.35 ? '#FFD88A' : T('#2A3048'));
        poly(g, [[x - 2, base - th], [x + tw / 2, base - th - roof], [x + tw + 2, base - th]], INK);
        poly(g, [[x - 1, base - th], [x + tw / 2, base - th - roof + 1], [x + tw + 1, base - th]], Sl[2]);
        poly(g, [[x - 1, base - th], [x + tw / 2, base - th - roof + 1], [x + tw / 2 - 1, base - th]], Sl[3]);
        box(g, x + tw / 2, base - th - roof - 6, 1, 6, T('#5A5A5A')); box(g, x + tw / 2 + 1, base - th - roof - 6, 5, 3, T('#B91C1C'));
      };
      box(g, 409, base - 23, 86, 24, INK); box(g, 410, base - 22, 84, 22, Wl[2]); box(g, 410, base - 22, 84, 2, Wl[3]);
      for (let x = 410; x < 494; x += 5) box(g, x, base - 25, 3, 3, Wl[2]);
      box(g, 431, base - 47, 42, 25, INK); box(g, 432, base - 46, 40, 24, Wl[3]); box(g, 432, base - 46, 12, 24, Wl[4]);
      for (let k = 0; k < 4; k++) box(g, 436 + k * 9, base - 40, 3, 5, lamps && k !== 2 ? '#FFD88A' : T('#2A3048'));
      poly(g, [[430, base - 46], [452, base - 70], [474, base - 46]], INK); poly(g, [[431, base - 46], [452, base - 69], [473, base - 46]], Sl[2]); poly(g, [[431, base - 46], [452, base - 69], [450, base - 46]], Sl[3]);
      tower(404, 12, 40, 22); tower(488, 12, 34, 20); tower(470, 9, 56, 18);
      tower(442, 14, 82, 30);
      mist(g, w, foot - 60, 60, skyAt(0.9, tod), 0, 0.35, 4);
      bandedGradient(g, 0, foot - 2, w, h - foot + 2, [T('#5A8A3A'), T('#4A7A30')], 2);
    },
  },
  mexico: {
    // (NO volcano (the user: we have enough volcanoes): desert mesas, flat-topped and banded, a far one in the haze
    // behind, and a row of giant plywood saguaros along the foot, on its sand)
    w: 960, h: 340, k: 0.6,
    paint: (g, T, tod) => {
      const w = 960, h = 340, foot = h - 14;
      // The mesas: a long far one in the haze, two nearer either side, one in the middle
      mesa(g, 180, 780, 96, foot, rampT(T, mix('#9A6A5A', '#C8B4A8', 0.35)), 5);
      mist(g, w, foot - 120, 120, skyAt(0.9, tod), 0, 0.3, 4);
      mesa(g, 20, 330, 168, foot, rampT(T, '#B4532A'), 11);
      mesa(g, 400, 560, 120, foot, rampT(T, '#A8482A'), 17);
      mesa(g, 640, 940, 140, foot, rampT(T, '#9A3F22'), 23);
      mist(g, w, foot - 150, 150, skyAt(0.9, tod), 0, 0.42, 6);
      // The desert floor in bands, a dune or two, scrub
      const D = rampT(T, '#D8A866');
      bandedGradient(g, 0, foot - 4, w, h - foot + 4, [D[3], D[2], D[2]], 3);
      for (let i = 0; i < 60; i++) pixelBlob(g, hash(i * 1.7) * w, foot + 2 + hash(i * 2.3) * 8, 3, 1.5, i % 2 ? T('#5E6A3A') : T('#7A6A40'));
      // The plywood saguaros along the front, their shadows on the sand
      const C = rampT(T, '#3F7A34');
      for (let i = 0; i < 9; i++) { const x = 50 + i * 108 + hash(i * 4.1) * 30, hh = 56 + hash(i * 2.9) * 54; box(g, x - 4, foot + 3, 20, 2, D[0]); saguaro(g, x, foot + 4, hh, C, i * 5); }
    },
  },
  norway: {
    // (THE FJORD: far snowy mountains, two sheer walls either side of a long arm of water going back to them, firs
    // along their feet, a waterfall down the right one (its spray live), red boathouses at the water)
    w: 900, h: 400, k: 0.6,
    paint: (g, T, tod) => {
      const w = 900, h = 400, foot = h - 16;
      // (the far mountains, blue and snowy, behind)
      const M = rampT(T, '#6A7AA0'), S = rampT(T, '#F1F5F9');
      const back: [number, number][] = [[200, foot], [300, 150], [350, 120], [400, 150], [450, 104], [520, 160], [580, 130], [700, foot]];
      poly(g, back, M[2]);
      poly(g, [[300, 150], [350, 120], [370, 170], [330, 190]], S[2]); poly(g, [[450, 104], [520, 160], [480, 180], [430, 150]], S[2]); poly(g, [[450, 104], [430, 150], [440, 170], [452, 130]], S[3]);
      mist(g, w, 120, foot - 120, skyAt(0.88, tod), 0.1, 0.5, 6);
      // (the arm of water going back between the walls: banded lighter far off, a glint)
      const WA = rampT(T, '#2E5A8A');
      poly(g, [[330, foot], [420, foot - 120], [480, foot - 120], [560, foot]], WA[2]);
      for (let k = 0; k < 5; k++) { const y = foot - 120 + k * 24, t = (y - (foot - 120)) / 120; box(g, 420 - t * 90, y, 60 + t * 180, 1, WA[3]); }
      box(g, 440, foot - 118, 20, 1, WA[4]);
      // (the walls: the left facing right, the right facing left)
      const R = rampT(T, '#3E4A52'), F = rampT(T, '#2E4A36');
      fjordWall(g, [[0, 70], [60, 46], [130, 58], [200, 30], [260, 64], [330, 96], [420, 260]], foot, 1, R, S, F, 5);
      fjordWall(g, [[470, 250], [560, 90], [640, 40], [700, 60], [780, 26], [860, 50], [900, 70]], foot, -1, R, S, F, 9);
      // (the falls down the right wall, its pool at the foot)
      falls(g, 600, 100, foot - 6, 8, { rock: R[1], water: T('#C8DCEC'), lit: T('#F4FAFF'), spray: T('#E0ECF6') });
      // (red boathouses at the water's edge, their roofs, a jetty)
      for (const [bx, bw] of [[250, 26], [282, 20], [610, 24]] as const) {
        const by = foot - 2;
        box(g, bx - 1, by - 15, bw + 2, 16, INK); box(g, bx, by - 14, bw, 14, T('#9F1239')); box(g, bx, by - 14, 3, 14, T('#BE185D'));
        poly(g, [[bx - 3, by - 14], [bx + bw / 2, by - 24], [bx + bw + 3, by - 14]], T('#3A2A2A')); box(g, bx + bw / 2 - 3, by - 8, 6, 8, T('#2A1A1A'));
        if (tod.lamps > 0.3) box(g, bx + 3, by - 10, 3, 3, '#FFD88A');
      }
      box(g, 300, foot - 2, 60, 2, T('#5C3A1A'));
      // (the near shore: banded water to the walls' feet)
      bandedGradient(g, 0, foot, w, h - foot, [WA[2], WA[1]], 2);
    },
    live: (c, x0, top, f, T) => {
      // (the falls' spray: specks drifting down its face, a mist puff at its foot)
      for (let k = 0; k < 10; k++) { const y = top + 100 + ((f * 2 + k * 29) % 270); box(c, x0 + 597 + (k % 3) * 2, y, 2, 3, T('#FFFFFF')); }
      c.globalAlpha = 0.5; pixelBlob(c, x0 + 604, top + 378 - Math.sin(f * 0.05) * 3, 22, 7, T('#F1F5F9')); c.globalAlpha = 1;
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The first pass's live painters (the other pavilions', till their SNES passes): painted about (0, horizon) (its
// middle at x 0), tinted far

/** Each pavilion's far landmark, painted about (0, horizon) (its middle at x 0), tinted far. */
const LANDMARKS: Partial<Record<ForeignId, (c: Ctx, hz: number, f: number) => void>> = {
  italy: (c, hz) => {
    // (rolling Tuscan-ish hills with their cypresses far off, a bell tower and a dome nearer)
    c.fillStyle = farTint('#4D7C0F', 0.65); c.beginPath(); c.ellipse(-230, hz, 150, 70, 0, Math.PI, 0); c.ellipse(-60, hz, 120, 50, 0, Math.PI, 0); c.fill();
    for (const [x, y] of [[-300, 40], [-250, 62], [-190, 58], [-110, 40], [-40, 30]] as const) poly(c, [[x - 6, hz - y], [x, hz - y - 46], [x + 6, hz - y]], farTint('#14532D', 0.6));
    box(c, 60, hz - 200, 34, 200, farTint('#C2410C', 0.55)); poly(c, [[56, hz - 200], [77, hz - 236], [98, hz - 200]], farTint('#7C2D12', 0.55));
    c.fillStyle = farTint('#B45309', 0.55); c.beginPath(); c.arc(170, hz - 60, 60, Math.PI, 0); c.fill(); box(c, 110, hz - 60, 120, 60, farTint('#D6D3D1', 0.55));
  },
  japan: (c, hz) => {
    poly(c, [[-320, hz], [-60, hz - 230], [60, hz - 230], [320, hz]], farTint('#475569', 0.6));
    poly(c, [[-60, hz - 230], [-30, hz - 190], [0, hz - 205], [30, hz - 188], [60, hz - 230]], farTint('#F8FAFC', 0.5));
  },
  morocco: (c, hz) => {
    for (const [x, r] of [[-200, 150], [40, 190], [260, 130]] as const) { c.fillStyle = farTint('#D97706', 0.6); c.beginPath(); c.ellipse(x, hz, r, r * 0.4, 0, Math.PI, 0); c.fill(); }
    box(c, -20, hz - 210, 30, 210, farTint('#E7D3A8', 0.55)); box(c, -26, hz - 220, 42, 12, farTint('#15803D', 0.55));
  },
  france: (c, hz) => {
    // (a Notre Dame-ish cathedral, far: the two square west towers, the rose window between, the nave behind and its
    // thin spire, flying buttresses down its side, gargoyles crouched on the towers' corners)
    const st = farTint('#A8A29E', 0.6), dk = farTint('#78716C', 0.6), lt = farTint('#D6D3D1', 0.55);
    box(c, 40, hz - 150, 220, 150, dk); poly(c, [[40, hz - 150], [150, hz - 200], [260, hz - 150]], farTint('#57534E', 0.6));
    box(c, 146, hz - 300, 6, 110, dk); poly(c, [[142, hz - 300], [149, hz - 350], [156, hz - 300]], dk);
    for (const x of [70, 120, 170, 220]) poly(c, [[x, hz - 150], [x + 22, hz - 90], [x + 26, hz - 90], [x + 4, hz - 150]], st);
    box(c, -110, hz - 260, 60, 260, st); box(c, 10, hz - 260, 60, 260, st); box(c, -50, hz - 200, 60, 200, st);
    box(c, -110, hz - 264, 60, 6, lt); box(c, 10, hz - 264, 60, 6, lt); box(c, -50, hz - 204, 60, 6, lt);
    c.fillStyle = lt; c.beginPath(); c.arc(-20, hz - 150, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = dk; c.beginPath(); c.arc(-20, hz - 150, 14, 0, Math.PI * 2); c.fill();
    for (const x of [-96, -76, 24, 44]) { box(c, x, hz - 240, 10, 60, dk); poly(c, [[x, hz - 240], [x + 5, hz - 250], [x + 10, hz - 240]], dk); }
    for (const x of [-80, -40, 0]) poly(c, [[x, hz], [x, hz - 50], [x + 10, hz - 64], [x + 20, hz - 50], [x + 20, hz]], dk);
    // (the gargoyles: hunched shapes jutting off the towers' tops)
    for (const [x, d] of [[-110, -1], [-50, 1], [10, -1], [70, 1]] as const) poly(c, [[x, hz - 262], [x + d * 16, hz - 266], [x + d * 22, hz - 258], [x + d * 12, hz - 254], [x, hz - 250]], farTint('#57534E', 0.55));
  },
  uk: (c, hz, f) => {
    // (a giant Ferris wheel (London Eye-ish), far, turning slowly: the rim, its spokes, the pods round it, the A-frame leg)
    const R = 150, cy = hz - 175, a0 = f * 0.0015, rim = farTint('#E5E7EB', 0.5), sp = farTint('#9CA3AF', 0.55);
    poly(c, [[-6, cy], [-70, hz], [-56, hz], [0, cy + 10]], farTint('#6B7280', 0.55));
    c.strokeStyle = sp; c.lineWidth = 1.5; c.beginPath();
    for (let k = 0; k < 16; k++) { const a = a0 + (k / 16) * Math.PI * 2; c.moveTo(0, cy); c.lineTo(Math.cos(a) * R, cy + Math.sin(a) * R); }
    c.stroke();
    c.strokeStyle = rim; c.lineWidth = 5; c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.arc(0, cy, R - 10, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 16; k++) { const a = a0 + (k / 16) * Math.PI * 2; c.fillStyle = farTint('#BFDBFE', 0.5); c.beginPath(); c.ellipse(Math.cos(a) * (R + 8), cy + Math.sin(a) * (R + 8), 9, 6, a, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = farTint('#6B7280', 0.55); c.beginPath(); c.arc(0, cy, 10, 0, Math.PI * 2); c.fill();
  },
  canada: (c, hz) => {
    poly(c, [[-400, hz], [-240, hz - 260], [-120, hz - 150], [20, hz - 300], [160, hz - 170], [300, hz - 240], [420, hz]], farTint('#334155', 0.6));
    for (const [x, y] of [[-240, -260], [20, -300], [300, -240]] as const) poly(c, [[x - 40, hz + y + 50], [x, hz + y], [x + 40, hz + y + 50]], farTint('#F8FAFC', 0.5));
  },
  heli: (c, hz, f) => {
    // (the helicopter ride's own landmark, far over the water: a giant globe on a pylon (ACROSS THE WORLD), turning, and a
    // radio mast blinking; the replicas the tour shows aren't seen from down here: they're the helicopter's to show)
    box(c, -10, hz - 200, 20, 200, farTint('#6B7280', 0.6)); poly(c, [[-60, hz], [-10, hz - 120], [10, hz - 120], [60, hz]], farTint('#4B5563', 0.6));
    const R = 90, cy = hz - 290;
    c.fillStyle = farTint('#2563EB', 0.55); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.clip();
    const sh = (f * 0.2) % 360;
    for (const [x, y, w, h] of [[-40, -50, 60, 40], [40, -20, 50, 70], [-80, 20, 50, 40], [140, -40, 60, 50], [-200, -30, 70, 60]] as const) { const xx = ((x + sh + 180) % 360) - 180; c.fillStyle = farTint('#16A34A', 0.55); c.beginPath(); c.ellipse(xx, cy + y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
    c.strokeStyle = farTint('#CA8A04', 0.5); c.lineWidth = 3; c.beginPath(); c.ellipse(0, cy, R + 14, 22, -0.3, 0, Math.PI * 2); c.stroke();
    box(c, 220, hz - 360, 4, 360, farTint('#9CA3AF', 0.6));
    if ((f >> 5) % 2) box(c, 218, hz - 366, 8, 8, '#EF4444');
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The far shore, the lagoon, the barge

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** The far shore: a tile (painted once for the hour), its foot on the water line at its bottom. */
const SW = 1024, SH = 34;
const paintShore = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.5);
  // (the berm, the boardwalk along it, the park's trees in a line (round, stepped, lit up top), a lamp now and then)
  const B = rampT(T, '#6A7A5A'), L = rampT(T, '#4E6E44');
  for (let x = 0; x < SW; x += 9) { const r = 7 + hash(x * 0.13) * 6, y = SH - 12 - r * 0.4; pixelBlob(g, x, y, r, r * 0.8, L[1]); pixelBlob(g, x - 1, y - 2, r * 0.75, r * 0.55, L[2]); pixelBlob(g, x - 2, y - 3, r * 0.4, r * 0.3, L[3]); }
  box(g, 0, SH - 12, SW, 8, B[2]); box(g, 0, SH - 12, SW, 1, B[3]); checker(g, 0, SH - 6, SW, 2, B[1], 0);
  box(g, 0, SH - 4, SW, 4, T('#5C4A38')); box(g, 0, SH - 4, SW, 1, T('#8A7458'));
  for (let x = 30; x < SW; x += 96) { box(g, x, SH - 22, 1, 18, T('#2E3436')); box(g, x - 1, SH - 24, 3, 2, tod.lamps > 0.3 ? '#FFE7A0' : T('#C8C0A8')); }
  mist(g, SW, 0, SH, skyAt(0.92, tod), 0.25, 0.1, 3);
};
const BW = 230, BH = 64;
/** The barge (painted once for the hour, local: its water line at y BH - 10): its hull (rust, a stripe, tire fenders),
 *  the deck, the mortar racks (tubes angled up, banded), the shack (a light in its window after dark), its board. */
const paintBarge = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.35), wl = BH - 10, x0 = 10, w = BW - 20;
  const Hu = rampT(T, '#4A4E58'), Ru = rampT(T, '#8A3A22'), D = rampT(T, '#6A6E78'), Rk = rampT(T, '#9A2A2A'), Sh = rampT(T, '#2E4A8A');
  // (the hull)
  poly(g, [[x0 - 1, wl - 15], [x0 + w + 1, wl - 15], [x0 + w - 8, wl + 2], [x0 + 6, wl + 2]], INK);
  poly(g, [[x0, wl - 14], [x0 + w, wl - 14], [x0 + w - 8, wl + 1], [x0 + 7, wl + 1]], Hu[2]);
  box(g, x0, wl - 14, w, 2, Hu[3]); box(g, x0 + 4, wl - 8, w - 10, 2, Ru[2]); box(g, x0 + 4, wl - 3, w - 14, 3, Ru[1]);
  for (let k = 0; k < 7; k++) { const tx = x0 + 14 + k * 30; g.fillStyle = INK; g.beginPath(); g.ellipse(tx, wl - 9, 4, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#2A2A2E'); g.beginPath(); g.ellipse(tx, wl - 9, 3, 4, 0, 0, Math.PI * 2); g.fill(); box(g, tx - 1, wl - 11, 1, 2, T('#5A5A60')); }
  // (the deck: a rail, crates of shells)
  box(g, x0 + 2, wl - 18, w - 4, 4, D[2]); box(g, x0 + 2, wl - 18, w - 4, 1, D[4]);
  for (let x = x0 + 4; x < x0 + w - 4; x += 10) box(g, x, wl - 26, 1, 8, D[1]); box(g, x0 + 2, wl - 27, w - 4, 1, D[3]);
  for (const cx of [x0 + 150, x0 + 166]) { box(g, cx, wl - 28, 14, 10, INK); box(g, cx + 1, wl - 27, 12, 8, T('#8A6A3A')); box(g, cx + 1, wl - 27, 12, 1, T('#B89A5A')); }
  // (the mortar racks: rows of tubes angled up, banded red and white, their mouths dark)
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) {
    const tx = x0 + 14 + r * 44 + k * 6, ty = wl - 22;
    poly(g, [[tx - 1, ty + 1], [tx + 3, ty - 16], [tx + 8, ty - 15], [tx + 5, ty + 1]], INK);
    poly(g, [[tx, ty], [tx + 3.5, ty - 15], [tx + 7, ty - 14], [tx + 4, ty]], Rk[2]); box(g, tx + 1, ty - 8, 5, 2, T('#E8E4DC')); box(g, tx + 3, ty - 15, 3, 2, INK);
  }
  // (the control shack, its window, its board: FIREWORKS)
  box(g, x0 + w - 44, wl - 46, 36, 29, INK); box(g, x0 + w - 43, wl - 45, 34, 27, Sh[2]); box(g, x0 + w - 43, wl - 45, 3, 27, Sh[3]); box(g, x0 + w - 12, wl - 45, 3, 27, Sh[1]);
  box(g, x0 + w - 46, wl - 49, 40, 4, INK); box(g, x0 + w - 45, wl - 48, 38, 2, D[3]);
  box(g, x0 + w - 36, wl - 38, 12, 8, INK); box(g, x0 + w - 35, wl - 37, 10, 6, tod.lamps > 0.3 ? '#FFD88A' : T('#7A8AA8'));
  box(g, x0 + 40, wl - 52, 2, 26, T('#3A3A40')); box(g, x0 + 96, wl - 52, 2, 26, T('#3A3A40'));
  box(g, x0 + 30, wl - 62, 78, 13, INK); box(g, x0 + 31, wl - 61, 76, 11, T('#F4F0E8'));
  signText(g, 'FIREWORKS', x0 + 69, wl - 52, plain(1, 1, T('#B91C1C')));
};
/** The show (after dark): shells going up on their trails, then bursting in rings of square sparks (white at the
 *  core, the shell's color, its shade as they fall and go out), each its own beat. */
const show = (c: Ctx, x: number, wl: number, f: number) => {
  const COLS = [['#FFF1F2', '#F87171', '#991B1B'], ['#FEFCE8', '#FDE047', '#A16207'], ['#EFF6FF', '#60A5FA', '#1E3A8A'], ['#F0FDF4', '#4ADE80', '#166534'], ['#FDF4FF', '#E879F9', '#86198F']];
  for (let s = 0; s < 3; s++) {
    const P = 170 + s * 37, t = (f + s * 61) % P, n = Math.floor((f + s * 61) / P);
    const sx = x - 70 + ((n * 53 + s * 41) % 140), top = wl - 150 - ((n * 31 + s * 17) % 70), C = COLS[(n + s * 2) % COLS.length];
    if (t < 34) {
      // (going up: the shell and its sparking trail)
      const u = t / 34, y = wl - 20 + (top - (wl - 20)) * (1 - (1 - u) * (1 - u));
      for (let k = 0; k < 5; k++) box(c, sx + Math.sin((t - k) * 0.6) * 1, y + k * 4, 2, 2, k ? C[2] : '#FFFFFF');
    } else if (t < 34 + 60) {
      const u = (t - 34) / 60, r = 4 + Math.sqrt(u) * 44, fall = u * u * 26;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + n, px = Math.round(sx + Math.cos(a) * r), py = Math.round(top + Math.sin(a) * r * 0.9 + fall);
        const col = u < 0.2 ? C[0] : u < 0.6 ? C[1] : C[2];
        if (u > 0.85 && (i + t) % 2) continue;
        box(c, px - 1, py - 1, 3, 3, col);
        if (u < 0.7) { box(c, Math.round(sx + Math.cos(a) * r * 0.8), Math.round(top + Math.sin(a) * r * 0.72 + fall * 0.8), 2, 2, C[2]); }
      }
      if (u < 0.12) { box(c, sx - 5, top - 5, 10, 10, '#FFFFFF'); box(c, sx - 8, top - 2, 16, 4, C[0]); box(c, sx - 2, top - 8, 4, 16, C[0]); }
    }
  }
};

export const drawStreetsBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera, f = state.frame, tod = timeOfDay();
  // (up a climb, the horizon sinks: more sky)
  const hz = Math.round(410 - Math.min(0, cam.y) * 0.18);
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: Math.min(H, hz), sun: [620, 110], moon: [170, 90], t: f, scroll: cam.x * 0.01 });
  // The landmarks over the far shore: the stamped ones (painted for the hour; what moves on them live), and the first
  // pass's live ones
  const mid = cam.x + W / 2;
  for (const id of Object.keys(SECTIONS) as ForeignId[]) {
    const S = STILLS[id], Lm = LANDMARKS[id];
    if (!S && !Lm) continue;
    const s = SECTIONS[id], cx = (s.x0 + s.x1) / 2, sx = W / 2 + (cx - mid) * K;
    if (sx < -560 || sx > W + 560) continue;
    if (S) {
      const x0 = Math.round(sx - S.w / 2), top = hz + 6 - S.h, T = farCol(tod, S.k * 0.5);
      c.save(); c.translate(x0, top); stamp(c, `fl-far-${id}-${tod.key}-${fontIn()}`, 0, 0, S.w, S.h, g => S.paint(g, T, tod)); c.restore();
      S.live?.(c, x0, top, f, T);
    } else { c.save(); c.translate(Math.round(sx), 0); Lm!(c, hz, f); c.restore(); }
  }
  // The far shore's tree line along the water
  const off = cam.x * 0.035;
  for (let x = -((off % SW) + SW) % SW; x < W; x += SW) { c.save(); c.translate(Math.round(x), hz - SH + 4); stamp(c, `fl-shore-${tod.key}`, 0, 0, SW, SH, g => paintShore(g, tod)); c.restore(); }
  // The lagoon: banded water (the sky in it near the shore, deeper nearer), dithered between, its glints drifting
  const water = [hourMix('#1D4ED8', '#7C3AED', '#0F172A'), hourMix('#2563EB', '#9D4E8A', '#1E293B'), hourMix('#3B82F6', '#C2678A', '#1E3A5F'), hourMix('#7AA8E8', '#E0909A', '#2A4A70')];
  const wt = hz + 4;
  if (wt < H) bandedGradient(c, 0, wt, W, H - wt, [farTint(mix(water[3], skyAt(0.95, tod), 0.4), 0.4), farTint(water[2], 0.35), farTint(water[1], 0.3), farTint(water[0], 0.25), farTint(water[0], 0.2)], 10);
  for (let k = 0; k < 18; k++) {
    const gy = wt + 4 + ((k * 13) % 70), gx = ((k * 97 + f * (0.15 + gy * 0.0008)) % (W + 40)) - 20, len = 6 + ((gy - wt) / 6) | 0;
    if ((f + k * 23) % 140 < 100) { box(c, gx, gy, len, 1, mix(water[3], '#FFFFFF', 0.45)); box(c, gx + 2, gy + 1, len - 4, 1, mix(water[2], '#FFFFFF', 0.25)); }
  }
  // The barge: its reflection wobbling under it, the barge itself (for the hour), the show after dark
  const bx = Math.round(620 - (cam.x - FLX) * BARGE_K), wl = hz + 18;
  for (let k = 0; k < 6; k++) box(c, bx - BW / 2 + 16 + Math.sin(f * 0.05 + k) * 2, wl + 1 + k * 2, BW - 40 - k * 14, 1, farTint(mix(water[0], '#000000', 0.3), 0.3));
  c.save(); c.translate(bx - BW / 2, wl - BH + 10); stamp(c, `fl-barge-${tod.key}-${fontIn()}`, 0, 0, BW, BH, g => paintBarge(g, tod)); c.restore();
  if (tod.lamps > 0.3) show(c, bx, wl, f);
  return true;
};
