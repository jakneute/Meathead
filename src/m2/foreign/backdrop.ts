// The streets' backdrop (screen space; ONE for the whole walk, so nothing pops walking from one pavilion into the
// next): the sky by the hour (timeOfDay.ts), the lagoon along the back with its big fake FIREWORKS barge (it drifts
// across the whole walk, slow: the far shore's that far off), and each pavilion's far landmark (Mexico's mesas and saguaros,
// Norway's fjord, China's ridge with the wall on it, Germany's castle on its hill, Italy's bell tower and its hills,
// Fuji, the dunes, the tower, the clock tower, the Rockies, the helicopter tour's giant replicas) slid in by parallax round where its
// pavilion is, so they come and go as he walks. Crude (the first pass), all of it tinted far into the haze.
//
// Up a climb (the Great Wall) the horizon sinks: more sky.

import type { GameState } from '../../m1/game/core/state';
import { drawTodSky, farTint, timeOfDay, hourMix } from '../timeOfDay';
import { box, poly, mix } from './kit';
import { SECTIONS, FLX, type ForeignId } from './geometry';

type Ctx = CanvasRenderingContext2D;
const W = 800, H = 600;

const SKY = ['#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#FDE68A'];
/** How far the landmarks slide (of the camera's travel), and the barge. */
const K = 0.22, BARGE_K = 0.02;

/** Each pavilion's far landmark, painted about (0, horizon) (its middle at x 0), tinted far. */
const LANDMARKS: Partial<Record<ForeignId, (c: Ctx, hz: number, f: number) => void>> = {
  mexico: (c, hz, f) => {
    // (desert mesas, flat-topped and banded, a row of giant saguaros along the foot (painted plywood), a pyramid in
    // front of it all)
    void f;
    poly(c, [[-330, hz], [-300, hz - 130], [-150, hz - 130], [-120, hz]], farTint('#9A3412', 0.6));
    box(c, -300, hz - 104, 150, 6, farTint('#C2410C', 0.6));
    poly(c, [[110, hz], [140, hz - 170], [300, hz - 170], [330, hz]], farTint('#7C2D12', 0.6));
    box(c, 140, hz - 136, 160, 6, farTint('#C2410C', 0.6));
    for (const x of [-230, -60, 60, 230]) { box(c, x - 6, hz - 90, 12, 90, farTint('#3F6212', 0.55)); box(c, x - 22, hz - 64, 10, 30, farTint('#3F6212', 0.55)); box(c, x - 22, hz - 64, 16, 8, farTint('#3F6212', 0.55)); box(c, x + 12, hz - 76, 10, 34, farTint('#3F6212', 0.55)); box(c, x + 6, hz - 46, 16, 8, farTint('#3F6212', 0.55)); }
    for (let k = 0; k < 5; k++) box(c, -150 + k * 18, hz - 26 - k * 22, 300 - k * 36, 24, farTint('#A8A29E', 0.55));
  },
  norway: (c, hz) => {
    // (the fjord: sheer cliffs either side of a long arm of water, snow on top, a thin waterfall)
    poly(c, [[-330, hz], [-260, hz - 240], [-170, hz - 260], [-90, hz]], farTint('#1E3A3A', 0.6));
    poly(c, [[60, hz], [140, hz - 280], [240, hz - 250], [330, hz]], farTint('#163030', 0.6));
    poly(c, [[-260, hz - 240], [-215, hz - 252], [-170, hz - 260], [-200, hz - 230]], farTint('#F8FAFC', 0.5));
    poly(c, [[140, hz - 280], [190, hz - 266], [240, hz - 250], [180, hz - 258]], farTint('#F8FAFC', 0.5));
    box(c, 120, hz - 200, 3, 200, farTint('#E0F2FE', 0.5));
    box(c, -90, hz - 6, 150, 6, farTint('#1E3A8A', 0.6));
  },
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
    // (an Eiffel-ish tower, far)
    poly(c, [[-70, hz], [-6, hz - 300], [6, hz - 300], [70, hz]], farTint('#57534E', 0.6));
    poly(c, [[-40, hz], [0, hz - 70], [40, hz]], farTint('#BFDBFE', 0.5));
  },
  uk: (c, hz) => {
    box(c, -24, hz - 260, 48, 260, farTint('#A16207', 0.55)); poly(c, [[-28, hz - 260], [0, hz - 320], [28, hz - 260]], farTint('#3F3F46', 0.55));
    c.fillStyle = farTint('#F8FAFC', 0.5); c.beginPath(); c.arc(0, hz - 220, 14, 0, Math.PI * 2); c.fill();
  },
  canada: (c, hz) => {
    poly(c, [[-400, hz], [-240, hz - 260], [-120, hz - 150], [20, hz - 300], [160, hz - 170], [300, hz - 240], [420, hz]], farTint('#334155', 0.6));
    for (const [x, y] of [[-240, -260], [20, -300], [300, -240]] as const) poly(c, [[x - 40, hz + y + 50], [x, hz + y], [x + 40, hz + y + 50]], farTint('#F8FAFC', 0.5));
  },
  heli: (c, hz) => {
    // (the helicopter tour's giant replicas, far over the water and still huge: an Eiffel, a pyramid, a moai's head)
    poly(c, [[-260, hz], [-180, hz - 380], [-168, hz - 380], [-90, hz]], farTint('#57534E', 0.65));
    poly(c, [[-40, hz], [90, hz - 200], [220, hz]], farTint('#D97706', 0.6));
    box(c, 240, hz - 190, 70, 190, farTint('#78716C', 0.6)); box(c, 228, hz - 200, 86, 22, farTint('#57534E', 0.6));
  },
};

/** The big fake fireworks barge on the lagoon: a flat barge, mortar racks, a sign; after dark, now and then, a show. */
const barge = (c: Ctx, x: number, hz: number, f: number) => {
  box(c, x - 90, hz + 6, 180, 14, farTint('#1F2937', 0.5));
  box(c, x - 80, hz - 8, 160, 14, farTint('#374151', 0.5));
  for (let k = 0; k < 6; k++) box(c, x - 70 + k * 26, hz - 18, 10, 10, farTint('#B91C1C', 0.5));
  box(c, x - 30, hz - 36, 60, 14, farTint('#1E3A8A', 0.5));
  const tod = timeOfDay();
  if (tod.lamps > 0.3) {
    // (the show: a burst every so often, high over the barge)
    const t = f % 150, k = (f / 150) | 0;
    if (t < 50) {
      const bx = x + ((k * 53) % 120) - 60, by = hz - 160 - ((k * 31) % 60), r = t * 1.4, col = ['#F87171', '#FDE047', '#60A5FA', '#F8FAFC'][k % 4];
      c.globalAlpha = 1 - t / 50;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; box(c, bx + Math.cos(a) * r, by + Math.sin(a) * r, 3, 3, col); }
      c.globalAlpha = 1;
    }
  }
};

export const drawStreetsBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera, f = state.frame;
  // (up a climb, the horizon sinks: more sky)
  const hz = Math.round(410 - Math.min(0, cam.y) * 0.18);
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: Math.min(H, hz), sun: [620, 110], moon: [170, 90] });
  // The far shore across the lagoon (low, hazy) and the landmarks over it
  const mid = cam.x + W / 2;
  for (const id of Object.keys(LANDMARKS) as ForeignId[]) {
    const s = SECTIONS[id], cx = (s.x0 + s.x1) / 2, sx = W / 2 + (cx - mid) * K;
    if (sx < -500 || sx > W + 500) continue;
    c.save(); c.translate(Math.round(sx), 0); LANDMARKS[id]!(c, hz, f); c.restore();
  }
  box(c, 0, hz - 10, W, 12, farTint(hourMix('#64748B', '#7C5A6A', '#1E293B'), 0.6));
  // The lagoon: banded water, a glint now and then
  const water = [hourMix('#1D4ED8', '#7C3AED', '#0F172A'), hourMix('#2563EB', '#9D4E8A', '#1E293B'), hourMix('#3B82F6', '#C2678A', '#1E3A5F')];
  for (let k = 0; k < 3; k++) box(c, 0, hz + 2 + k * 8, W, H, farTint(water[2 - k], 0.4 - k * 0.1));
  for (let k = 0; k < 12; k++) { const gx = ((k * 97 + f * 0.3) % (W + 40)) - 20, gy = hz + 8 + ((k * 13) % 30); box(c, gx, gy, 10, 1, mix(water[2], '#FFFFFF', 0.4)); }
  barge(c, Math.round(620 - (cam.x - FLX) * BARGE_K), hz + 6, f);
  return true;
};
