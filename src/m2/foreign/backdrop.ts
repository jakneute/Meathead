// The streets' backdrop (screen space; ONE for the whole walk, so nothing pops walking from one pavilion into the
// next): the sky by the hour (timeOfDay.ts), the lagoon along the back with its big fake FIREWORKS barge (it drifts
// across the whole walk, slow: the far shore's that far off), and each pavilion's far landmark (Mexico's mesas and saguaros,
// Norway's fjord, China's ridge with the wall on it, Germany's castle on its hill, Italy's (straight) bell tower and its hills,
// Fuji, the dunes, the minaret, the cathedral, the Ferris wheel, the Rockies, the helicopter ride's globe) slid in by parallax round where its
// pavilion is, so they come and go as he walks. All of it tinted far into the haze.
//
// The SNES pass (Mexico's and Norway's so far; the rest still the first pass's live painters, below): each landmark
// painted once for the hour into a stamp (STILLS: real silhouettes, stepped strata and flanks, snow, forests, the haze
// over their feet), with only what moves drawn live over it (the volcano's smoke, the falls); the lagoon in banded
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

const STILLS: Partial<Record<ForeignId, Far>> = {
  mexico: {
    // (a VOLCANO far off (a smoking cone, snow on its shoulders: the park's "Popo", fiberglass by its seams up close,
    // but this far it's a mountain), desert mesas either side, flat-topped and banded, and a row of giant plywood
    // saguaros along the foot, on its sand)
    w: 960, h: 340, k: 0.6,
    paint: (g, T, tod) => {
      const w = 960, h = 340, foot = h - 14;
      // The volcano: its cone in steps (lit up its left flank), gullies radiating off the crater, the snow, the notch
      const V = rampT(T, '#7A6E86'), S = rampT(T, '#F1F5F9');
      const cx = 470, peak = 42, base = 380;
      const cone: [number, number][] = [[cx - base, foot], [cx - 70, peak + 34], [cx - 40, peak + 4], [cx - 18, peak], [cx + 22, peak + 2], [cx + 44, peak + 8], [cx + 78, peak + 40], [cx + base, foot]];
      poly(g, cone, V[2]);
      g.save(); g.beginPath(); cone.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      poly(g, [[cx - base, foot], [cx - 70, peak + 34], [cx - 40, peak + 4], [cx - 18, peak], [cx - 10, foot]], V[3]);
      checker(g, cx - 14, 0, 4, foot, V[3], 0);
      poly(g, [[cx + 60, foot], [cx + 44, peak + 8], [cx + 78, peak + 40], [cx + base, foot]], V[1]);
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI / 2 + (i / 25 - 0.5) * 2.4, len = 80 + hash(i * 3.3) * 200;
        for (let s = 10; s < len; s += 3) box(g, cx + Math.cos(a) * s * 1.6 + Math.sin(s * 0.1 + i) * 1.5, peak + 6 + s * 0.95, 2, 2, i % 3 ? V[0] : V[4]);
      }
      // (the snow on its shoulders, ragged at its foot; streaks down the gullies)
      poly(g, [[cx - 92, peak + 64], [cx - 70, peak + 34], [cx - 40, peak + 4], [cx - 18, peak], [cx + 22, peak + 2], [cx + 44, peak + 8], [cx + 78, peak + 40], [cx + 100, peak + 70], [cx + 70, peak + 56], [cx + 50, peak + 78], [cx + 24, peak + 50], [cx, peak + 74], [cx - 26, peak + 52], [cx - 50, peak + 80], [cx - 70, peak + 60]], S[2]);
      poly(g, [[cx - 92, peak + 64], [cx - 70, peak + 34], [cx - 40, peak + 4], [cx - 18, peak], [cx - 10, peak + 70], [cx - 50, peak + 80], [cx - 70, peak + 60]], S[3]);
      for (let i = 0; i < 12; i++) { const sx = cx - 80 + i * 15; for (let y = peak + 60; y < peak + 90 + hash(i) * 40; y += 2) box(g, sx + Math.round(Math.sin(y * 0.2) * 2), y, 2, 2, S[1]); }
      g.restore();
      // (the crater's notch, dark, a glow in it after dark)
      box(g, cx - 18, peak - 1, 40, 4, V[0]); box(g, cx - 14, peak, 32, 2, tod.lamps > 0.3 ? '#C2410C' : V[1]);
      // The mesas, either side
      mesa(g, 20, 330, 168, foot, rampT(T, '#B4532A'), 11);
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
    live: (c, x0, top, f, T) => {
      // (the volcano's smoke: puffs rising off the crater, drifting right, stepped, thinning)
      const cx = x0 + 472, cy = top + 40;
      for (let k = 0; k < 7; k++) {
        const t = ((f * 0.25 + k * 40) % 280) / 280, r = 8 + t * 26, px = cx + t * 90 + Math.sin(t * 6 + k) * 6, py = cy - t * 150;
        const col = T(mix('#D6D3D1', '#78716C', t));
        c.globalAlpha = 0.75 * (1 - t);
        pixelBlob(c, px, py, r, r * 0.7, col); pixelBlob(c, px - r * 0.3, py - r * 0.25, r * 0.55, r * 0.4, T(mix('#F5F5F4', '#A8A29E', t)));
        c.globalAlpha = 1;
      }
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
  china: (c, hz) => {
    // (a ridge of mountains, the wall snaking along its crest with its towers)
    poly(c, [[-420, hz], [-300, hz - 160], [-200, hz - 120], [-60, hz - 250], [80, hz - 170], [220, hz - 230], [420, hz]], farTint('#3F6212', 0.6));
    const crest: [number, number][] = [[-300, hz - 160], [-200, hz - 120], [-60, hz - 250], [80, hz - 170], [220, hz - 230]];
    c.strokeStyle = farTint('#D6D3D1', 0.5); c.lineWidth = 4; c.beginPath(); crest.forEach(([x, y], i) => (i ? c.lineTo(x, y - 4) : c.moveTo(x, y - 4))); c.stroke();
    for (const [x, y] of crest) box(c, x - 6, y - 18, 12, 14, farTint('#A8A29E', 0.5));
  },
  germany: (c, hz) => {
    // (the castle on its hill: towers with pointy blue roofs)
    poly(c, [[-260, hz], [-80, hz - 120], [80, hz - 130], [260, hz]], farTint('#365314', 0.6));
    for (const [x, h, w] of [[-60, 90, 34], [-14, 140, 26], [26, 110, 30], [64, 80, 22]] as const) {
      box(c, x - w / 2, hz - 120 - h, w, h, farTint('#E7E5E4', 0.5));
      poly(c, [[x - w / 2 - 4, hz - 120 - h], [x, hz - 120 - h - w * 1.4], [x + w / 2 + 4, hz - 120 - h]], farTint('#1E40AF', 0.5));
    }
  },
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
