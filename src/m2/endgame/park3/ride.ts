// GUPPLAX'S LAST RIDE (the owner's, 2026-11-11: "like endgame boss 3 should explode in the wave pool and meathead rides
// his dead body in the air, as it flies to the parking lot. do a victory callout as he flies then he lands in the
// parking, starting stage 4 with the necromancer refights").
//
// Two halves, one in each stage:
//
//   THE FLIGHT  (pool.ts runs it: the wave pool's end) The blast throws the corpse up out of the pool with him astride
//               it; they arc over the water park toward the lot. He's world space (the engine draws him, sat on it);
//               everything round him is the backdrop, screen space, here: the night sky, and the park far below going
//               by right to left as he goes, small when he's high: THE WAVE POOL (the water column still coming down),
//               THE LAZY RIVER (burnt out: charred palms, smoke), the goth son's GROTTO, MOUNT EVEREST BUT BETTER (a
//               fake snowy peak, its slide down it, prayer flags: not a volcano), the tube slides and LIL SQUIRT, the
//               entry plaza and its gate, then THE LOT: the stalls, the lamps, the picture pylons, his truck where Satan
//               threw it. Painted once (chunks, a canvas each, painted one a frame while GUPPLAX swells: nothing painted
//               in the flight), laid down scaled.
//   THE LANDING (park4/lot.ts calls it: two lines there, updateCrash and drawCrash) Level 4's lot, built as ever; the
//               corpse comes down behind him with a slam, he's thrown off it head over heels, lands, gets up. The
//               corpse stays there, smoking, for that visit. Then Ned's intro, as ever. A death or a reload in level 4
//               starts it as ever (the flag's taken the once).
//
// Depth (the flight): the sky, the stars, the far park's ridge (screen); the park below (screen, scaled by his height);
// the water column (screen, over the pool in the park below); the corpse (world, pool.ts drawPoolBack); him (the engine,
// on it); the smoke and the gore (particles); VICTORY over all of it (the HUD layer). Nothing of the pool's world art is
// drawn in the flight (the pool below's the backdrop's).
// Depth (the landing): the lot's ring (drawBack), then the corpse (drawBack, after the ring: on the asphalt, behind
// him), him; the dust and the gore (particles, in front).

import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { setUi } from '../../store';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H, GROUND_Y, RENDER_SCALE } from '../../../m1/constants';
import { timeOfDay, drawNightSky } from '../../timeOfDay';
import { bandedGradient, checker, mix, hash } from '../../intro/art/kit';
import { WATER_PARK_NAME } from '../stages';
import { drawBurst } from './gupArt';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#05070C';
/** Night over all of it (the park's lit bits aren't). */
const nite = (col: string, k = 0.42) => mix(col, '#16203C', k);

// ---------------------------------------------------------------------------------------------------------------
// The park below: a panorama, left to right as he flies, its ground line at GL (things stand on it; under it, the
// ground seen from up high, nearer further down)

const PANO_W = 5600, PANO_H = 440, GL = 250, CHUNK = 700;
/** Where he is over it: the wave pool's middle at the start, the lot's landing spot at the end. */
export const PANO_FROM = 520, PANO_TO = 5060;
const ZONE = { pool: [0, 1320], river: [1320, 2300], mount: [2300, 3320], tubes: [3320, 4020], gate: [4020, 4420], lot: [4420, PANO_W] } as const;

const groundOf = (x: number) => (x < ZONE.pool[1] ? '#8A8478' : x < ZONE.river[1] ? '#3A3428' : x < ZONE.mount[1] ? '#4A6A3A' : x < ZONE.tubes[1] ? '#8A8478' : x < ZONE.gate[1] ? '#9A8C70' : '#2A2C30');

const paintChunk = (g: Ctx, i: number) => {
  const x0 = i * CHUNK;
  g.save(); g.translate(-x0, 0);
  // ---- the ground under the skyline: each zone's, banded darker toward the bottom (nearer, under the night), dithered
  // where one zone meets the next
  for (let x = x0; x < x0 + CHUNK; x += 20) {
    const col = groundOf(x);
    for (let b = 0; b < 6; b++) R(g, x, GL + b * 32, 20, 33, nite(col, 0.3 + b * 0.08));
    R(g, x, GL, 20, 3, nite(mix(col, '#FFFFFF', 0.25), 0.3));
  }
  for (const e of Object.values(ZONE)) if (e[0] > x0 - 20 && e[0] < x0 + CHUNK) checker(g, e[0] - 10, GL, 20, PANO_H - GL, nite(groundOf(e[0] - 30), 0.4), 0, 4);
  // ---- THE WAVE POOL: the long pool seen from up high (shallow end pale, the deep end dark), its deck, the tower,
  // palms, the wave machine's housing at the far end
  if (x0 < ZONE.pool[1]) {
    const a = 120, b = 1120;
    R(g, a - 6, GL + 14, b - a + 12, 92, INK);
    for (let x = a; x < b; x += 10) { const k = (x - a) / (b - a); R(g, x, GL + 18, 10, 84, nite(mix('#7AD0F0', '#0A3A6A', k), 0.25)); }
    for (let y = GL + 26; y < GL + 100; y += 14) R(g, a, y, b - a, 1, nite('#BEE8F8', 0.45));
    R(g, a, GL + 18, b - a, 3, nite('#E0F6FF', 0.2));
    // (the tower, the palms behind)
    R(g, 200, GL - 70, 4, 70, nite('#E8E4DC')); R(g, 230, GL - 70, 4, 70, nite('#E8E4DC')); R(g, 196, GL - 76, 42, 8, nite('#F1EFEA')); R(g, 214, GL - 96, 4, 22, nite('#3A3A3A')); g.fillStyle = nite('#DC2626'); g.beginPath(); g.moveTo(194, GL - 92); g.quadraticCurveTo(216, GL - 110, 238, GL - 92); g.closePath(); g.fill();
    for (const px of [60, 380, 620, 900]) palm(g, px, GL, 110 + (px % 3) * 16, false);
    // (the wave machine's housing: concrete, louvers, WAVE POOL)
    R(g, 1130, GL - 150, 170, 168, INK); R(g, 1134, GL - 146, 162, 162, nite('#5A6068')); R(g, 1134, GL - 146, 162, 6, nite('#8A9098'));
    for (let y = GL - 110; y < GL; y += 18) R(g, 1150, y, 130, 4, nite('#2A3038'));
    text(g, 'WAVE POOL', 1215, GL - 124, 12, '#FACC15');
  }
  // ---- THE LAZY RIVER: burnt out (the goth son's fire): a winding channel, charred palms, the tiki towers' stumps;
  // the GROTTO's rock at its end
  if (x0 + CHUNK > ZONE.river[0] && x0 < ZONE.river[1]) {
    g.lineCap = 'round';
    for (const [w, col] of [[44, INK], [38, '#3A5A6A'], [26, '#5A7A88']] as const) { g.strokeStyle = nite(col, 0.3); g.lineWidth = w; g.beginPath(); g.moveTo(1330, GL + 70); for (let x = 1330; x <= 2140; x += 30) g.lineTo(x, GL + 70 + Math.sin(x * 0.012) * 40); g.stroke(); }
    g.lineCap = 'butt';
    for (const px of [1380, 1500, 1640, 1760, 1900, 2020]) palm(g, px, GL + 6, 90 + (px % 4) * 12, true);
    for (const px of [1560, 1830]) { R(g, px - 16, GL - 60, 32, 66, INK); R(g, px - 13, GL - 57, 26, 60, nite('#2A1A10')); for (let k = 0; k < 3; k++) R(g, px - 13, GL - 50 + k * 18, 26, 3, nite('#5A3A1A')); }
    // (the grotto: dark rock, a mouth in it)
    g.fillStyle = INK; g.beginPath(); g.moveTo(2130, GL + 8); g.quadraticCurveTo(2160, GL - 150, 2230, GL - 160); g.quadraticCurveTo(2300, GL - 120, 2310, GL + 8); g.closePath(); g.fill();
    g.fillStyle = nite('#3A3440'); g.beginPath(); g.moveTo(2136, GL + 6); g.quadraticCurveTo(2164, GL - 144, 2230, GL - 154); g.quadraticCurveTo(2296, GL - 116, 2304, GL + 6); g.closePath(); g.fill();
    g.fillStyle = nite('#5A5260'); g.beginPath(); g.moveTo(2150, GL - 30); g.quadraticCurveTo(2170, GL - 130, 2228, GL - 146); g.lineTo(2210, GL - 110); g.quadraticCurveTo(2180, GL - 80, 2160, GL - 20); g.closePath(); g.fill();
    g.fillStyle = INK; g.beginPath(); g.ellipse(2224, GL - 10, 30, 36, 0, Math.PI, 0); g.fill();
  }
  // ---- MOUNT EVEREST BUT BETTER: a fake snowy peak (plaster rock in steps, snow on top, prayer flags, the summit
  // platform), its slide winding down it to the splash pool. A mountain, not a volcano: a point, snow, no crater
  if (x0 + CHUNK > ZONE.mount[0] && x0 < ZONE.mount[1]) {
    const cx = 2810, top = GL - 230, L = 2380, Rr = 3250;
    const poly = (pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.fill(); };
    poly([[L - 4, GL + 4], [cx - 40, top - 4], [cx + 30, top - 4], [Rr + 4, GL + 4]], INK);
    poly([[L, GL + 2], [cx - 38, top], [cx + 28, top], [Rr, GL + 2]], nite('#6A6E78', 0.35));
    poly([[cx - 38, top], [cx - 10, top], [cx - 160, GL + 2], [L, GL + 2]], nite('#8A8E98', 0.35));
    poly([[cx + 28, top], [Rr, GL + 2], [Rr - 120, GL + 2], [cx + 10, top + 30]], nite('#4A4E58', 0.35));
    // (the snow: down from the top, ragged)
    poly([[cx - 38, top], [cx + 28, top], [cx + 90, top + 70], [cx + 50, top + 60], [cx + 20, top + 84], [cx - 10, top + 62], [cx - 50, top + 90], [cx - 90, top + 66]], nite('#E8F0F8', 0.25));
    poly([[cx - 38, top], [cx - 10, top], [cx - 30, top + 50], [cx - 70, top + 70]], nite('#FFFFFF', 0.2));
    // (the summit platform, the flags strung down from it)
    R(g, cx - 44, top - 14, 80, 14, INK); R(g, cx - 42, top - 12, 76, 10, nite('#8A6A4A'));
    for (const s of [-1, 1]) { g.strokeStyle = nite('#2A2A2A', 0.2); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 4, top - 30); g.quadraticCurveTo(cx + s * 80, top + 10, cx + s * 170, top + 70); g.stroke();
      for (let k = 1; k < 9; k++) { const t = k / 9, fx = (1 - t) * (1 - t) * (cx - 4) + 2 * t * (1 - t) * (cx + s * 80) + t * t * (cx + s * 170), fy = (1 - t) * (1 - t) * (top - 30) + 2 * t * (1 - t) * (top + 10) + t * t * (top + 70); R(g, fx - 3, fy, 6, 7, nite(['#E04A3A', '#F0D040', '#3A9A4A', '#3A6AD0', '#F8FAFC'][k % 5], 0.2)); } }
    R(g, cx - 6, top - 40, 4, 28, INK); R(g, cx - 2, top - 40, 16, 10, nite('#E04A3A', 0.2));
    // (the slide: a blue chute winding down the near face, round the back, out at the splash pool)
    g.lineCap = 'round';
    const pts: [number, number][] = [[cx + 30, top - 6], [cx + 140, top + 50], [cx - 60, top + 110], [cx + 200, top + 170], [3300, GL + 30]];
    for (const [w, col] of [[16, INK], [12, '#2A6AB0'], [5, '#7AC0F0']] as const) { g.strokeStyle = nite(col, 0.25); g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.stroke(); }
    g.lineCap = 'butt';
    // (the splash pool)
    g.fillStyle = INK; g.beginPath(); g.ellipse(3290, GL + 40, 70, 18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = nite('#3A9AC8', 0.25); g.beginPath(); g.ellipse(3290, GL + 40, 66, 15, 0, 0, Math.PI * 2); g.fill();
    text(g, 'MOUNT EVEREST', cx - 4, GL - 20, 10, '#F8FAFC'); text(g, 'BUT BETTER', cx - 4, GL - 6, 10, '#F8FAFC');
  }
  // ---- the tube slides (a tangle of colored tubes off two scaffold towers) and LIL SQUIRT (a mushroom fountain)
  if (x0 + CHUNK > ZONE.tubes[0] && x0 < ZONE.tubes[1]) {
    for (const tx of [3420, 3700]) { R(g, tx - 22, GL - 170, 44, 170, INK); R(g, tx - 19, GL - 167, 38, 167, nite('#8A8E98', 0.35)); for (let y = GL - 160; y < GL; y += 22) { g.strokeStyle = nite('#5A5E68', 0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(tx - 19, y); g.lineTo(tx + 19, y + 22); g.stroke(); } R(g, tx - 26, GL - 176, 52, 8, nite('#E04A3A', 0.3)); }
    g.lineCap = 'round';
    const tubes: [string, [number, number][]][] = [
      ['#E04A3A', [[3420, GL - 160], [3520, GL - 120], [3460, GL - 70], [3580, GL - 30], [3640, GL + 10]]],
      ['#3A8AE0', [[3700, GL - 160], [3600, GL - 110], [3700, GL - 60], [3800, GL - 40], [3780, GL + 10]]],
      ['#E0C03A', [[3420, GL - 120], [3330, GL - 80], [3400, GL - 30], [3360, GL + 10]]],
    ];
    for (const [col, pts] of tubes) for (const [w, cc] of [[22, INK], [18, col], [6, mix(col, '#FFFFFF', 0.4)]] as const) { g.strokeStyle = nite(cc, 0.3); g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.stroke(); }
    g.lineCap = 'butt';
    // (LIL SQUIRT: the kiddie pool's mushroom)
    R(g, 3895, GL - 50, 10, 50, INK); R(g, 3897, GL - 48, 6, 48, nite('#F0E0C0', 0.3));
    g.fillStyle = INK; g.beginPath(); g.ellipse(3900, GL - 52, 40, 20, 0, Math.PI, 0); g.fill(); g.fillStyle = nite('#E04A9A', 0.25); g.beginPath(); g.ellipse(3900, GL - 52, 37, 17, 0, Math.PI, 0); g.fill();
    for (let k = 0; k < 5; k++) { g.fillStyle = nite('#FFFFFF', 0.25); g.beginPath(); g.arc(3874 + k * 13, GL - 60 - (k % 2) * 6, 4, 0, Math.PI * 2); g.fill(); }
  }
  // ---- the entry plaza: the gate's arch and its sign, the ticket booths, the fence
  if (x0 + CHUNK > ZONE.gate[0] && x0 < ZONE.gate[1]) {
    for (let x = 4030; x < 4410; x += 16) { R(g, x, GL - 40, 3, 40, nite('#5A5E68', 0.35)); }
    R(g, 4030, GL - 40, 380, 3, nite('#7A7E88', 0.35));
    for (const bx of [4090, 4330]) { R(g, bx - 26, GL - 60, 52, 60, INK); R(g, bx - 23, GL - 57, 46, 57, nite('#E8E0C8', 0.35)); R(g, bx - 28, GL - 68, 56, 10, nite('#E04A3A', 0.25)); R(g, bx - 14, GL - 44, 28, 16, nite('#FDE68A', 0.05)); }
    // (the arch: two posts, the board across, the park's name on it, lit)
    R(g, 4150, GL - 150, 14, 150, INK); R(g, 4256, GL - 150, 14, 150, INK); R(g, 4152, GL - 148, 10, 148, nite('#3A8AE0', 0.3)); R(g, 4258, GL - 148, 10, 148, nite('#3A8AE0', 0.3));
    R(g, 4120, GL - 176, 180, 40, INK); R(g, 4124, GL - 172, 172, 32, nite('#F0C040', 0.2)); R(g, 4124, GL - 172, 172, 4, nite('#FFF0A0', 0.1));
    text(g, WATER_PARK_NAME, 4210, GL - 150, 12, '#3A2A06');
    for (let k = 0; k < 9; k++) R(g, 4130 + k * 20, GL - 182, 4, 4, '#FDE68A');
  }
  // ---- THE LOT: the stalls in rows, the lamps (lit), the cars, the picture pylons (level 4's), his truck where Satan
  // threw it (on its roof)
  if (x0 + CHUNK > ZONE.lot[0]) {
    for (let row = 0; row < 5; row++) { const y = GL + 24 + row * 36; for (let x = 4440; x < PANO_W; x += 34) R(g, x, y, 2, 20, nite('#E8E4DC', 0.45)); R(g, 4440, y + 22, PANO_W - 4440, 1, nite('#E8E4DC', 0.6)); }
    for (let k = 0; k < 26; k++) {
      const row = k % 5, x = 4460 + Math.floor(hash(k * 3.7) * 1080), y = GL + 28 + row * 36;
      const col = ['#B83A3A', '#3A5AB8', '#D8D8D0', '#2A2A2A', '#3A8A4A', '#C8A040'][k % 6];
      R(g, x - 1, y - 1, 28, 16, INK); R(g, x, y, 26, 14, nite(col, 0.35)); R(g, x + 6, y + 3, 14, 7, nite('#9AC0D8', 0.45)); R(g, x, y, 26, 2, nite(mix(col, '#FFFFFF', 0.4), 0.35));
    }
    // (the pylons: tall, each its picture on top)
    const pics = ['#4A9A3A', '#5A3A7A', '#C8C8D0', '#F0D040', '#3AA0A0', '#8A5A3A', '#9A9AB0', '#5A5A60'];
    for (let k = 0; k < 8; k++) { const px = 4500 + k * 140; R(g, px - 3, GL - 110, 6, 110, INK); R(g, px - 2, GL - 110, 4, 110, nite('#6A6E78', 0.35)); g.fillStyle = INK; g.beginPath(); g.arc(px, GL - 124, 18, 0, Math.PI * 2); g.fill(); g.fillStyle = nite(pics[k], 0.15); g.beginPath(); g.arc(px, GL - 124, 15, 0, Math.PI * 2); g.fill(); text(g, String(k + 1), px, GL - 120, 10, '#F8FAFC'); }
    // (the lamps: posts, their heads lit, a pool of light under each)
    for (let k = 0; k < 7; k++) { const lx = 4470 + k * 170; R(g, lx - 2, GL - 150, 4, 150, nite('#3A3A44', 0.3)); R(g, lx - 10, GL - 156, 20, 6, '#FDE68A'); g.globalAlpha = 0.18; g.fillStyle = '#FDE68A'; g.beginPath(); g.ellipse(lx, GL + 30, 60, 22, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    // (his truck, on its roof, where Satan threw it)
    const tx = 5280, ty = GL + 20;
    R(g, tx - 52, ty - 34, 104, 36, INK); R(g, tx - 50, ty - 32, 100, 22, nite('#8A2A1A', 0.25)); R(g, tx - 50, ty - 12, 60, 12, nite('#5A1A10', 0.25)); R(g, tx + 14, ty - 12, 30, 10, nite('#9AC0D8', 0.4));
    for (const wx of [tx - 34, tx + 34]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, ty - 36, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = nite('#4A4A50', 0.3); g.beginPath(); g.arc(wx, ty - 36, 6, 0, Math.PI * 2); g.fill(); }
  }
  g.restore();
};
const text = (g: Ctx, s: string, x: number, y: number, size: number, col: string) => {
  g.font = `${size}px "Press Start 2P"`; g.textAlign = 'center';
  g.fillStyle = INK; g.fillText(s, x + 1, y + 1); g.fillStyle = col; g.fillText(s, x, y);
  g.textAlign = 'left';
};
/** A palm (or what the fire left of one: black, no fronds, a curl of smoke). */
const palm = (g: Ctx, x: number, gy: number, h: number, burnt: boolean) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x, gy); g.quadraticCurveTo(x + 14, gy - h * 0.6, x + 6, gy - h); g.stroke();
  g.strokeStyle = burnt ? '#141008' : nite('#7A5A3A'); g.lineWidth = 6; g.beginPath(); g.moveTo(x, gy); g.quadraticCurveTo(x + 14, gy - h * 0.6, x + 6, gy - h); g.stroke();
  if (burnt) { g.strokeStyle = '#E0601A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 6, gy - h); g.lineTo(x + 8, gy - h + 6); g.stroke(); }
  else for (let a = 0; a < 6; a++) { g.strokeStyle = nite('#2A6A3A'); g.lineWidth = 5; g.beginPath(); g.moveTo(x + 6, gy - h); g.quadraticCurveTo(x + 6 + Math.cos(a) * 40, gy - h - 16 + Math.sin(a) * 6, x + 6 + Math.cos(a) * 60, gy - h + 14 + Math.abs(Math.sin(a)) * 14); g.stroke(); }
  g.lineCap = 'butt';
};

const chunks: (HTMLCanvasElement | null)[] = Array.from({ length: Math.ceil(PANO_W / CHUNK) }, () => null);
const chunkCv = (i: number) => {
  let cv = chunks[i];
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = CHUNK * RENDER_SCALE; cv.height = PANO_H * RENDER_SCALE;
  const g = cv.getContext('2d')!; g.scale(RENDER_SCALE, RENDER_SCALE);
  paintChunk(g, i);
  chunks[i] = cv;
  return cv;
};
/** (one chunk painted a call, while GUPPLAX swells: the flight never paints) */
export const warmRide = () => { const i = chunks.findIndex(v => !v); if (i >= 0) chunkCv(i); return i < 0; };

// ---------------------------------------------------------------------------------------------------------------
// The flight's backdrop

export interface Flight {
  /** How far along (0 at the pool .. 1 over the lot), how high (0..1), frames in. */
  k: number; up: number; t: number;
}
/** Where his seat is on screen (the camera's held so): the backdrop's pool lines up under him at the start. */
export const SEAT_SCREEN = { x: W / 2 - 40, y: 300 };
/** Sky, far ridge, the park below (scaled by his height), the water column over the pool, the saucers and fires. */
export const drawFlightBackdrop = (c: Ctx, state: GameState, fl: Flight) => {
  const tod = timeOfDay(), f = state.frame;
  bandedGradient(c, 0, 0, W, H, tod.sky, 16);
  drawNightSky(c, 0, 0, W, H * 0.7, W - 140 - fl.k * 60, 70, f, fl.k * 200, tod);
  // (the saucers and the demons' fires, still going at each other up there)
  for (let k = 0; k < 3; k++) { const x = ((k * 330 - fl.k * 900 + f * 0.6) % 1000 + 1100) % 1000 - 100, y = 90 + k * 40 + Math.sin(f * 0.03 + k) * 8; R(c, x - 22, y, 44, 7, '#3A4A5A'); R(c, x - 11, y - 7, 22, 7, '#5A6A7A'); if (f % 30 < 15) R(c, x - 2, y + 7, 4, 3, '#86EFAC'); }
  // ---- the park below: scaled down the higher he is; his spot over it (PANO_FROM .. PANO_TO) under him
  const s = 1 - 0.5 * fl.up, ground = SEAT_SCREEN.y + 40 + 120 * fl.up;
  const at = PANO_FROM + (PANO_TO - PANO_FROM) * fl.k;
  const top = ground - GL * s;
  // (the far horizon's haze over the ridge, a band of distant lights)
  const hz = top + 60 * s;
  R(c, 0, hz - 30, W, 30, mix(tod.sky[tod.sky.length - 1], '#0A1020', 0.3));
  for (let k = 0; k < 40; k++) { const x = ((k * 97 - at * 0.05) % 900 + 900) % 900 - 50; R(c, x, hz - 8 - (k % 3) * 4, 3, 2, '#FDE68A'); }
  const x0 = SEAT_SCREEN.x - at * s;
  for (let i = 0; i < chunks.length; i++) {
    const sx = x0 + i * CHUNK * s, sw = CHUNK * s;
    if (sx + sw < -2 || sx > W + 2) continue;
    c.drawImage(chunkCv(i), Math.floor(sx), Math.floor(top), Math.ceil(sw) + 1, Math.ceil(PANO_H * s));
  }
  // (under the panorama's foot: the ground on, darker)
  const foot = Math.floor(top + PANO_H * s);
  if (foot < H) R(c, 0, foot, W, H - foot, nite(groundOf(at), 0.7));
  // ---- the water column over the pool (the blast's): up, then coming down in sheets
  const cT = fl.t;
  if (cT < 200) {
    const px = x0 + PANO_FROM * s, hgt = Math.min(1, cT / 30) * (1 - Math.max(0, (cT - 90) / 110)) * 520 * s, wd = (60 + cT * 0.4) * s;
    if (hgt > 2 && px > -200 && px < W + 200) {
      for (let b = 0; b < 4; b++) { const w2 = wd * (1 - b * 0.22); c.globalAlpha = 0.5 + b * 0.12; R(c, px - w2 / 2, ground + 10 * s - hgt * (1 - b * 0.08), w2, hgt * (1 - b * 0.08), ['#9AD8F0', '#BEE8F8', '#E0F6FF', '#FFFFFF'][b]); }
      c.globalAlpha = 1;
      for (let k = 0; k < 10; k++) { const a = k * 0.63 + f * 0.05; R(c, px + Math.cos(a) * wd * 0.9, ground - hgt + Math.sin(a) * 20 + ((f * 3 + k * 17) % 60), 4, 6, '#E0F6FF'); }
    }
  }
  // ---- the burnt river's smoke, rising (live: a few puffs)
  for (let k = 0; k < 6; k++) {
    const px = x0 + (1400 + k * 140) * s, rise = ((f * 0.6 + k * 40) % 120);
    if (px < -40 || px > W + 40) continue;
    c.globalAlpha = 0.35 * (1 - rise / 120); c.fillStyle = '#4A4A52'; c.beginPath(); c.arc(px + rise * 0.3, top + (GL - 40) * s - rise * s, (10 + rise * 0.2) * s, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The landing (level 4's lot: park4/lot.ts calls updateCrash first thing in its update and drawCrash after its ring)

let pending = false;
/** (pool.ts, just before it goes to level 4) He's coming in on the corpse. */
export const arriveByCrash = () => { pending = true; };
interface Crash { t: number; cx: number; from: { x: number; y: number }; to: number; done: boolean }
const crashes = new WeakMap<object, Crash>();
const THROW = 44, AFTER = 40;
/** A frame of the landing (true while it plays: no input, no HUD; the lot holds everything else back). */
export const updateCrash = (state: GameState): boolean => {
  const key = state.stage as object | null;
  if (!key) return false;
  const p = state.player;
  let cr = crashes.get(key);
  if (!cr && pending) {
    pending = false;
    const x = p.pos.x + p.width / 2;
    // (the corpse's head reaches 148 px right of its saddle: laid 210 back, it ends clear of his heels)
    cr = { t: 0, cx: x - 210, from: { x: x - 210, y: GROUND_Y - 40 }, to: x, done: false };
    crashes.set(key, cr);
  }
  if (!cr || cr.done) return false;
  cr.t++;
  const t = cr.t;
  p.inCutscene = true; p.untouchable = true; p.vel.x = 0; p.vel.y = 0; setUi({ introCutscene: true });
  if (t === 1) {
    playSound('boom', 1, -10); playSound('splat', 1, -8); playSound('crash', 0.9, -12); playSound('gorespray', 0.8, -4);
    shakeScreen(state, 22, 14);
    for (let i = 0; i < 70; i++) state.particles.push({ pos: { x: cr.cx + (Math.random() - 0.5) * 160, y: GROUND_Y - 10 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 9 }, life: 40 + Math.random() * 30, color: i % 3 === 0 ? '#5ACA3A' : i % 3 === 1 ? '#7A4A8A' : '#6A6A70', size: 2 + Math.random() * 4, grav: 0.3 });
  }
  if (t <= THROW) {
    // (thrown off it head over heels, landing a way on)
    const k = t / THROW, x = cr.from.x + (cr.to - cr.from.x) * k, y = cr.from.y + (GROUND_Y - cr.from.y) * k - Math.sin(k * Math.PI) * 120;
    p.carried = true; p.hidden = false; p.logSeat = false; p.facing = 1;
    p.pos.x = x - p.width / 2; p.pos.y = y - p.height;
    if (!p.freefall) p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 };
    p.freefall.t++; p.freefall.rot = k * Math.PI * 4;
    if (t === THROW) { p.freefall = undefined; p.carried = false; p.pos.y = GROUND_Y - p.height; p.isGrounded = true; p.spriteRot = 0; playSound('land', 1, -4); playSound('thud', 0.9, -8); shakeScreen(state, 8, 4); }
    return true;
  }
  if (t < THROW + AFTER) return true;
  cr.done = true; p.untouchable = false; p.inCutscene = false; setUi({ introCutscene: false });
  return false;
};
/** The corpse on the asphalt (and while it's coming down), smoking. */
export const drawCrash = (c: Ctx, state: GameState) => {
  const cr = state.stage ? crashes.get(state.stage as object) : undefined;
  if (!cr) return;
  const f = state.frame;
  // (a scorch and a splat of green round it)
  c.fillStyle = 'rgba(10, 14, 8, 0.6)'; c.beginPath(); c.ellipse(cr.cx, GROUND_Y + 2, 150, 12, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(90, 202, 58, 0.55)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(cr.cx - 120 + k * 40, GROUND_Y + 1, 14 + (k % 3) * 6, 3, 0, 0, Math.PI * 2); c.fill(); }
  // (him: squashed a moment on the slam, then lying there)
  const sq = cr.t < 10 ? 0.75 + cr.t * 0.025 : 1;
  c.save(); c.translate(cr.cx, GROUND_Y - 58 * sq); c.scale(1, sq); drawBurst(c, 0, 0, 0.04, cr.t < THROW ? f : 0); c.restore();
  if (f % 9 === 0 && Math.abs(cr.cx - (state.camera.x + W / 2)) < W) state.particles.push({ pos: { x: cr.cx - 90 + (f % 3) * 6, y: GROUND_Y - 70 }, vel: { x: 0.2, y: -0.8 }, life: 70, color: '#5A5A60', size: 5 });
};
