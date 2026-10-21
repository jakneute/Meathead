// Timber Tumble's park half, drawn (peak SNES): everything of the PARK's the log goes by, its fakery on show. The earth
// the ride's cut into (topsoil, clay, rock in stepped strata, roots, the odd buried pipe), the station (board-and-batten
// walls under a timber header, the big burned TIMBER TUMBLE board on its chains, the posters and the plywood
// lumberjack you must be this tall to ride, caged bulbs, the way out to the ride behind its rubber flaps, the last of the
// line on its switchbacks (one cached layer: static guests, seeded), the WAIT boards, the platform's lit lip), the
// fiberglass canyon (molded crags stood back, their seams and bolts, plywood pines on 2x4s and sandbags, Beaver Creek's
// plastic reeds in their planter and the fake lodge), the Old Sawmill's shed (weathered boards, windows by the hour, the
// trusses the saws hang from, a line shaft and its belts, the decorative wheel), the splash pool (its fiberglass bank,
// the viewing bridge and its soaked guests, the ride photo's camera, the SPLASH ZONE board), the lumber camp (canvas
// tents, cordwood, the cookfire that's a silk flame on a fan, a lantern, the camp's washing), the break (the back lot's
// chain-link, AUTHORIZED ONLY, then the fault line and the chasm down to the sewer).

import type { GameState } from '../../../m1/game/core/state';
import { bust, randomBust, drawBust, HAIR } from '../../grossBust';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { steppedGlow } from '../../intro/art/kit';
import { GY } from '../geometry';
import { onScreen, parkSign, burned, painted } from '../kit';
import { drawGuest } from '../town/people';
import {
  type Ctx, box, checker, mix, hash, stillAt, fiberglass, glass, warmth, flame, INK, hr, asIs, timeOfDay, dimmed,
  DIRT, STONE, GRASS, PLANK, PLY, STEEL, FIBER, NEEDLE, BARK, CONCRETE, CANVAS, RINGS, BRASS, TOPLIP, POOL,
} from './paint';
import { X, waterY, PLATFORM_END, CHASM } from './layout';
import { flumeY } from './flume';
import { rideOf } from './state';

/** (hazards.ts's beat: the giant saw hits the ground SLAM_AT frames after it lets go) */
export const SLAM_AT = 16;

// ---------------------------------------------------------------------------------------------------------------
// The earth the ride's cut into (-300 .. 8440): strata in tiles (cached), clipped under its top, the turf along it

const ET = 256;
const paintEarth = (g: Ctx, j: number, i: number) => {
  const D = hr('dirt', DIRT, 0.16), S = hr('stone', STONE, 0.16), G = hr('grass', GRASS, 0.16);
  for (let y = 0; y < ET; y += 4) {
    const depth = j * ET + y, k = Math.min(1, depth / 900);
    // (topsoil, then clay, then rock, banded down in steps, dithered at each change)
    const band = Math.floor(depth / 60), col = depth < 40 ? D[3] : depth < 500 ? (band % 2 ? D[2] : mix(D[2], D[3], 0.4)) : band % 2 ? S[2] : mix(S[2], D[1], 0.4);
    box(g, 0, y, ET, 4, mix(col, INK, k * 0.35));
    if (depth % 60 === 56) checker(g, 0, y, ET, 4, mix(col, INK, 0.2), band % 2);
  }
  // (pebbles and stones, lit on top; roots near the top; the odd buried thing)
  for (let n = 0; n < 26; n++) {
    const sx = hash(i * 13 + j * 7 + n) * ET, sy = hash(i * 5 + j * 11 + n * 3) * ET, r = 1 + hash(n + i + j) * (j > 1 ? 7 : 3), deep = j * ET + sy > 500;
    const R = deep ? S : D;
    box(g, sx - r, sy - r * 0.6, r * 2, r * 1.2, R[1]); box(g, sx - r + 1, sy - r * 0.6, r * 2 - 2, r * 0.6, R[4]); box(g, sx - r + 1, sy - r * 0.6, r, 1, R[5]);
  }
  if (j === 0) for (let n = 0; n < 6; n++) {
    let x = hash(i * 3 + n) * ET, y = 2;
    g.strokeStyle = D[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += (hash(i + n * 9 + s) - 0.5) * 16; y += 6 + hash(n + s) * 8; g.lineTo(x, y); }
    g.stroke(); g.strokeStyle = D[4]; g.lineWidth = 1; g.stroke();
  }
  if (hash(i * 7.7 + j) > 0.82 && j > 0) { const py = 40 + hash(i + j) * 160; box(g, 0, py, ET, 10, INK); box(g, 0, py + 1, ET, 8, mix(CONCRETE[3], D[1], 0.3)); box(g, 0, py + 1, ET, 2, CONCRETE[5]); for (let x = 30; x < ET; x += 90) box(g, x, py - 1, 8, 12, CONCRETE[2]); }
  void G;
};
/** The earth's top at x: the park's ground, or down by a cut where the flume runs low through it. */
const earthTop = (rx: number) => {
  // (down by the splash pool and the camp, where the flume runs low; back up to the park's ground before the break (the
  // giant saw comes down on it, the fault line runs along it))
  if (rx >= 5450 || rx < 3900) return GY - 4;
  const cut = Math.max(GY - 4, Math.min(GY + 60, flumeY(rx)) - 50);
  return rx < 5300 ? cut : cut + ((GY - 4 - cut) * (rx - 5300)) / 150;
};

/** The earth's strata over world a..b, top..bot (the caller clips it): the sewer's veil. */
export const earthPatch = (c: Ctx, state: GameState, a: number, b: number, top: number, bot: number) => {
  const t = Math.max(top, state.camera.y - 20), bt = Math.min(bot, state.camera.y + 640);
  for (let ix = Math.floor((a - X(-300)) / ET); X(-300) + ix * ET < b; ix++) for (let jy = Math.max(0, Math.floor((t - GY + 4) / ET)); GY - 4 + jy * ET < bt; jy++) {
    stillAt(c, `lr-earth-${ix % 5}-${Math.min(jy, 5)}`, X(-300) + ix * ET, GY - 4 + jy * ET, 0, 0, ET, ET, g => paintEarth(g, Math.min(jy, 5), ix % 5));
  }
};

export const drawEarth = (c: Ctx, state: GameState) => {
  const a = Math.max(X(-300), state.camera.x - 20), b = Math.min(X(8440), state.camera.x + CANVAS_WIDTH + 20);
  if (b <= a) return;
  const G = hr('grass', GRASS, 0.16), D = hr('dirt', DIRT, 0.16);
  const step = 20, ra = Math.floor((a - X(0)) / step) * step, rb = b - X(0);
  // (clipped under its top)
  c.save(); c.beginPath(); c.moveTo(X(ra), GY + 1400);
  for (let rx = ra; rx <= rb + step; rx += step) c.lineTo(X(rx), earthTop(rx));
  c.lineTo(X(rb + step), GY + 1400); c.closePath(); c.clip();
  const top = Math.max(GY - 4, state.camera.y - 20), bot = Math.min(GY + 1300, state.camera.y + 640);
  for (let ix = Math.floor((a - X(-300)) / ET); X(-300) + ix * ET < b; ix++) for (let jy = Math.max(0, Math.floor((top - GY + 4) / ET)); GY - 4 + jy * ET < bot; jy++) {
    const tx = X(-300) + ix * ET, ty = GY - 4 + jy * ET;
    stillAt(c, `lr-earth-${ix % 5}-${Math.min(jy, 5)}`, tx, ty, 0, 0, ET, ET, g => paintEarth(g, Math.min(jy, 5), ix % 5));
  }
  c.restore();
  // (the turf along its top: a grass lip, tufts, the dirt edge under)
  for (let rx = ra; rx <= rb; rx += step) {
    const y = earthTop(rx), y2 = earthTop(rx + step), x = X(rx);
    if (y !== y2) { c.strokeStyle = G[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x + step, y2 + 1); c.stroke(); continue; }
    box(c, x, y - 1, step, 1, INK); box(c, x, y, step, 2, G[5]); box(c, x, y + 2, step, 2, G[3]); checker(c, x, y + 4, step, 2, D[3], (rx / step) % 2);
    for (let k = 0; k < 3; k++) { const tx = x + hash(rx + k) * step; box(c, tx, y - 3, 1, 3, G[4]); box(c, tx + 2, y - 2, 1, 2, G[6]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The station

const ST_TOP = GY - 280;

/** A chunk of the station's back wall (board and batten under a timber header, a wainscot, posts every 160). */
const paintStationWall = (g: Ctx, v: number) => {
  const P = asIs(PLANK), B = asIs(BARK), h = GY - ST_TOP;
  // (the boards: wide, stood up, each a shade off, battens over the joints)
  for (let x = 0, i = 0; x < 300; x += 22, i++) {
    const tone = hash(v * 31 + i), col = tone < 0.25 ? P[2] : tone > 0.8 ? mix(P[3], P[4], 0.4) : mix(P[2], P[3], 0.5);
    box(g, x, 0, 22, h, col); box(g, x + 2, 0, 1, h, mix(col, '#FFFFFF', 0.08));
    for (let y = 10 + hash(i + v) * 20; y < h; y += 30 + hash(i * 3 + y) * 40) box(g, x + 4 + hash(y) * 12, y, 3, 2, P[1]);
    box(g, x + 20, 0, 4, h, INK); box(g, x + 21, 0, 2, h, P[3]); box(g, x + 21, 0, 1, h, P[4]);
  }
  // (the wainscot: lower boards laid along, darker, a chair rail lit along its top)
  for (let y = h - 100; y < h; y += 10) { box(g, 0, y, 300, 10, P[1]); box(g, 0, y, 300, 1, P[2]); }
  box(g, 0, h - 104, 300, 6, INK); box(g, 0, h - 103, 300, 4, P[4]); box(g, 0, h - 103, 300, 1, P[6]);
  // (a post: a peeled log, stepped)
  const px = 20 + (v % 2) * 140;
  box(g, px - 1, 0, 16, h, INK); box(g, px, 0, 14, h, B[3]); box(g, px, 0, 4, h, B[5]); box(g, px + 10, 0, 4, h, B[2]);
  for (let y = 6; y < h; y += 12) box(g, px + 4 + ((y * 3) % 6), y, 2, 4, B[1]);
  // (the header beam over it all, the rafters' ends)
  box(g, 0, 0, 300, 3, INK);
  for (let x = 10; x < 300; x += 60) { box(g, x - 1, 0, 14, 18, INK); box(g, x, 0, 12, 16, B[3]); box(g, x, 0, 12, 3, B[5]); g.fillStyle = INK; g.beginPath(); g.arc(x + 6, 9, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = RINGS[3]; g.beginPath(); g.arc(x + 6, 9, 3, 0, Math.PI * 2); g.fill(); }
};

let queueLayer: HTMLCanvasElement | null = null, queueKey = '';
const QA = -300, QB = 300;
/** The last of the line: two switchback rows on the platform, the back one up a step (dimmed: not for standing on);
 *  the pipe rails on their posts; the guests (the front ones, the ones he cut, sore about it). One layer for the hour. */
const queueRows = (q: Ctx) => {
  const a = X(QA), b = X(QB), P = dimmed(PLANK, 0.12), S = hr('steel', STEEL);
  box(q, a, GY - 27, b - a, 27, INK); box(q, a, GY - 26, b - a, 26, P[2]); box(q, a, GY - 26, b - a, 2, P[3]); box(q, a, GY - 24, b - a, 1, P[1]);
  for (let x = a; x < b; x += 30) { box(q, x, GY - 22, 1, 22, P[1]); box(q, x + 1, GY - 22, 1, 22, P[3]); }
  const rows: [number, number][] = [[GY - 26, 0.84], [GY, 1]];
  rows.forEach(([y, s], ri) => {
    for (const ry of [y - 40 * s, y - 22 * s]) { box(q, a, ry - 1, b - a, Math.max(2, 3 * s) + 2, INK); box(q, a, ry, b - a, Math.max(2, 3 * s), S[3]); box(q, a, ry, b - a, 1, S[6]); }
    for (let x = a + 10; x <= b; x += 46) { box(q, x - 1, y - 42 * s - 1, Math.max(2, 4 * s) + 2, 42 * s + 1, INK); box(q, x, y - 42 * s, Math.max(2, 4 * s), 42 * s, S[2]); box(q, x, y - 42 * s, 1, 42 * s, S[5]); }
    if (ri === 0) { box(q, b - 3, y - 42 * s - 1, 6, 42 * s + 27, INK); box(q, b - 2, y - 42 * s, 4, 42 * s + 26, S[3]); box(q, b - 2, y - 42 * s, 1, 42 * s + 26, S[6]); }
    const n = Math.floor((b - a) / (30 * s));
    for (let k = 0; k < n; k++) {
      const gx = a + 16 + k * 30 * s + hash(k + ri * 40) * 6, seed = 211 + ri * 61 + k * 19, cut = ri === 1 && gx > X(120);
      drawGuest(q, gx, y - 1, { seed, f: 0, pose: cut && k % 2 ? 'point' : hash(seed) < 0.12 ? 'photo' : 'stand', mood: cut ? 'angry' : hash(seed + 1) < 0.2 ? 'happy' : 'bored', facing: cut ? 1 : hash(seed + 4) < 0.5 ? 1 : -1, scale: s });
    }
  });
};

export const drawStation = (c: Ctx, state: GameState) => {
  const f = state.frame, top = ST_TOP;
  // ---- the back wall, in chunks (still)
  for (let i = 0; i < 4; i++) { const x = X(-300) + i * 300; if (onScreen(state, x, x + 300)) stillAt(c, `lr-stwall-${i % 3}`, x, top, 0, -4, 300, GY - top + 4, g => paintStationWall(g, i)); }
  box(c, X(-300), top - 22, X(900) - X(-300), 22, INK); box(c, X(-300), top - 20, X(900) - X(-300), 18, asIs(BARK)[2]); box(c, X(-300), top - 20, X(900) - X(-300), 3, asIs(BARK)[4]);
  // ---- the bulbs: caged, on their cords, glowing soft
  for (let x = X(-200); x < X(900); x += 180) {
    if (x < state.camera.x - 40 || x > state.camera.x + CANVAS_WIDTH + 40) continue;
    const sw = Math.sin(f * 0.03 + x) * 1.5;
    box(c, x, top, 1, 28, INK);
    steppedGlow(c, x + sw, top + 34, 26, '#FEE9A0', 0.02, 0.22, 4);
    c.fillStyle = INK; c.beginPath(); c.arc(x + sw, top + 34, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFF4C0'; c.beginPath(); c.arc(x + sw, top + 34, 4.5, 0, Math.PI * 2); c.fill();
    box(c, x + sw - 1, top + 31, 2, 2, '#FFFFFF');
    box(c, x + sw - 5, top + 33, 10, 1, '#3F3F46'); box(c, x + sw - 1, top + 28, 2, 12, '#3F3F46'); box(c, x + sw - 4, top + 26, 8, 3, '#52525B');
  }
  // ---- the ride's big sign: burned planks on chains, the axes crossed over it
  if (onScreen(state, X(20), X(280))) stillAt(c, 'lr-st-sign', X(150), top + 58, -150, -60, 300, 100, g => {
    const P = asIs(PLANK), S = asIs(STEEL);
    for (const cx of [-110, 110]) for (let y = -58; y < -26; y += 5) { box(g, cx - 2, y, 4, 4, INK); box(g, cx - 1, y + 1, 2, 2, S[4]); }
    box(g, -131, -29, 262, 58, INK);
    for (let r = 0; r < 3; r++) { const y = -28 + r * 19; box(g, -130, y, 260, 18, r % 2 ? P[3] : mix(P[3], P[4], 0.4)); box(g, -130, y, 260, 1, P[5]); box(g, -130, y + 17, 260, 1, P[1]); for (let k = 0; k < 4; k++) box(g, -126 + hash(r * 7 + k) * 200, y + 6, 30 + hash(k + r) * 30, 1, P[2]); }
    for (const nx of [-124, 120]) for (const ny of [-22, 22]) { box(g, nx, ny, 3, 3, '#26262C'); box(g, nx, ny, 1, 1, '#A1A1AA'); }
    signText(g, 'TIMBER TUMBLE', 0, 8, burned(3, 4));
    // (the axes crossed under it: hickory hafts, steel heads lit)
    for (const s of [-1, 1]) {
      g.save(); g.translate(0, 34); g.rotate(s * 0.7);
      box(g, -3, -6, 6, 52, INK); box(g, -2, -6, 4, 52, P[4]); box(g, -2, -6, 1, 52, P[6]);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-3, 38); g.lineTo(s * 18 - 3, 32); g.lineTo(s * 20, 50); g.lineTo(-3, 48); g.closePath(); g.fill();
      g.fillStyle = S[4]; g.beginPath(); g.moveTo(-2, 39); g.lineTo(s * 17 - 2, 34); g.lineTo(s * 18, 48); g.lineTo(-2, 47); g.closePath(); g.fill();
      box(g, s > 0 ? 14 : -18, 34, 3, 13, S[6]);
      g.restore();
    }
  });
  // ---- the posters: RULES; YOU WILL GET WET; the plywood lumberjack with his hand out (you must be this tall)
  if (onScreen(state, X(-200), X(0))) stillAt(c, 'lr-st-posters', X(-150), top + 120, -10, -6, 210, 170, g => {
    const P = asIs(PLANK);
    box(g, -2, -2, 74, 94, INK); box(g, 0, 0, 70, 90, P[4]); box(g, 3, 3, 64, 84, '#E7D8B0'); box(g, 3, 3, 64, 2, '#F4ECD0'); checker(g, 3, 80, 64, 4, '#CDBE94', 0);
    signText(g, 'RULES', 35, 18, painted(1, '#7F1D1D', '#E7D8B0'));
    for (let k = 0; k < 6; k++) { box(g, 9, 28 + k * 9, 4, 4, '#7F1D1D'); box(g, 16, 29 + k * 9, 40 - (k * 7) % 14, 2, '#6A5A3A'); }
    box(g, 30, -6, 10, 6, '#A1A1AA');
    box(g, 88, 8, 70, 60, INK); box(g, 90, 10, 66, 56, '#2A6AA8'); box(g, 90, 10, 66, 2, '#5A9AD8');
    signText(g, 'YOU WILL', 123, 24, painted(1, '#FDE047', '#0A2A4A')); signText(g, 'GET WET', 123, 58, painted(1, '#FDE047', '#0A2A4A'));
    for (let k = 0; k < 7; k++) box(g, 96 + k * 9, 30 + (k % 3) * 4, 3, 8 + (k % 2) * 4, '#BFE4F8');
    // (the soaked rider: a gross-up in print (grossBust.ts), gasping, dripping)
    drawBust(g, bust('lr-getwet', randomBust(1955, { mouth: 'gape', extras: ['sweaty', 'drool'], hair: 'slick', hairRamp: HAIR.brown }), 'poster'), 112, 28, 22, 22, 150);
  });
  if (onScreen(state, X(-80), X(20))) stillAt(c, 'lr-st-jack', X(-30), GY - 26, -40, -150, 90, 152, g => {
    const Pl = asIs(PLY);
    // (a plywood lumberjack cutout, painted (plaid, a beard, a grin), his arm out flat at the mark, the brace behind)
    g.strokeStyle = Pl[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -60); g.lineTo(-30, 0); g.stroke();
    const out = () => { g.moveTo(-14, 0); g.lineTo(-16, -60); g.lineTo(-20, -96); g.lineTo(-14, -118); g.lineTo(-10, -136); g.lineTo(8, -138); g.lineTo(14, -118); g.lineTo(18, -100); g.lineTo(44, -102); g.lineTo(44, -94); g.lineTo(18, -88); g.lineTo(16, -60); g.lineTo(14, 0); g.closePath(); };
    g.fillStyle = Pl[4]; g.save(); g.translate(2, 1); g.beginPath(); out(); g.fill(); g.restore();
    g.fillStyle = INK; g.beginPath(); out(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    g.save(); g.beginPath(); out(); g.clip();
    box(g, -22, -60, 44, 60, '#2E4A7A'); box(g, -22, -100, 70, 40, '#B91C1C');
    for (let x = -22; x < 48; x += 7) box(g, x, -100, 2, 40, '#7F1D1D'); for (let y = -98; y < -60; y += 7) box(g, -22, y, 70, 2, '#7F1D1D');
    box(g, -12, -136, 22, 20, '#F0C8A0'); box(g, -12, -122, 22, 8, '#7A4A24'); box(g, -6, -130, 2, 2, INK); box(g, 4, -130, 2, 2, INK); box(g, -4, -124, 8, 2, '#FEF3C7');
    box(g, -14, -140, 26, 6, '#B91C1C'); box(g, 36, -102, 8, 8, '#F0C8A0');
    g.restore();
    signText(g, 'THIS TALL', 2, -40, painted(1, '#FEF3C7', '#3F2A14'));
  });
  // ---- the way out to the ride: a dark doorway in a heavy frame, its rubber flaps swaying, FLOAT ON over it
  if (onScreen(state, X(780), X(940))) {
    stillAt(c, 'lr-st-door', X(862), GY, -60, -184, 120, 186, g => {
      const B = asIs(BARK);
      box(g, -46, -154, 92, 154, INK); box(g, -42, -150, 84, 150, '#0E0A06');
      for (let k = 0; k < 4; k++) { g.globalAlpha = 0.3 - k * 0.06; box(g, -42, -150 + k * 34, 84, 34, '#1E3A4A'); } g.globalAlpha = 1;
      for (const px of [-52, 40]) { box(g, px - 1, -160, 14, 160, INK); box(g, px, -159, 12, 159, B[3]); box(g, px, -159, 4, 159, B[5]); box(g, px + 9, -159, 3, 159, B[2]); }
      box(g, -56, -182, 112, 24, INK); box(g, -54, -180, 108, 20, '#7F1D1D'); box(g, -54, -180, 108, 2, '#B83A2A'); box(g, -54, -162, 108, 2, '#4A0E0A');
      signText(g, 'FLOAT ON', 0, -166, painted(1, '#FDE047', '#1C1209'));
      box(g, -42, -150, 84, 6, '#27272A');
    });
    for (let k = 0; k < 7; k++) { const sx = X(822) + k * 11 + Math.sin(f * 0.1 + k) * 2; box(c, sx, GY - 144, 10, 112, INK); box(c, sx + 1, GY - 144, 8, 111, '#2A2A30'); box(c, sx + 1, GY - 144, 2, 111, '#3F3F48'); }
  }
  // ---- the last of the line (one layer for the hour)
  const key = `${timeOfDay().key}`, ltop = GY - 140;
  if (typeof document !== 'undefined' && (!queueLayer || queueKey !== key)) {
    queueKey = key; queueLayer = document.createElement('canvas');
    queueLayer.width = X(QB) - X(QA) + 60; queueLayer.height = GY + 6 - ltop;
    const q = queueLayer.getContext('2d')!; q.imageSmoothingEnabled = false; q.translate(-(X(QA) - 30), -ltop); queueRows(q);
  }
  if (queueLayer && onScreen(state, X(QA) - 30, X(QB) + 30)) c.drawImage(queueLayer, X(QA) - 30, ltop);
  parkSign(c, X(40), GY - 26, ['15 MIN', 'FROM HERE'], { seed: 15, tall: 96 });
  parkSign(c, X(250), GY, ['NEXT LOG', 'ALMOST THERE'], { seed: 1, tall: 112 });
  // ---- the platform (to stand on: its lit lip), its face down to the trough
  const pa = X(-300), pb = X(PLATFORM_END);
  for (let x = pa; x < pb; x += 200) if (onScreen(state, x, x + 200)) stillAt(c, `lr-st-deck-${((x - pa) / 200) % 2}-${Math.min(200, pb - x)}`, x, GY, 0, -1, Math.min(200, pb - x), 42, g => {
    const P = asIs(PLANK), w = Math.min(200, pb - x);
    box(g, 0, -1, w, 42, INK);
    for (let y = 3, i = 0; y < 40; y += 9, i++) { box(g, 0, y, w, 9, i % 2 ? P[3] : P[2]); box(g, 0, y, w, 1, P[4]); box(g, 0, y + 8, w, 1, P[1]); box(g, (i * 67 + x) % w, y, 1, 9, P[0]); }
    for (let jx = 14; jx < w; jx += 60) { box(g, jx, 3, 6, 37, P[1]); box(g, jx, 3, 1, 37, P[3]); }
    const L = asIs(TOPLIP); box(g, 0, 0, w, 1, L[3]); box(g, 0, 1, w, 1, L[2]); box(g, 0, 2, w, 1, L[1]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The fiberglass canyon and Beaver Creek

/** A molded crag of the canyon's (stood back a step, dimmed: not somewhere to stand): lumps, seams, bolts. */
const paintCrag = (g: Ctx, w: number, h: number, seed: number) => {
  const F = dimmed(FIBER, 0.1);
  const pts: [number, number][] = [[0, h]];
  for (let k = 0; k <= 8; k++) pts.push([(w * k) / 8, (k === 0 || k === 8 ? h * 0.35 : hash(seed + k) * h * 0.4)]);
  pts.push([w, h]);
  g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 2) : g.moveTo(x - 2, y))); g.closePath(); g.fill();
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  fiberglass(g, 0, 0, w, h, F, seed);
  box(g, w * 0.68, 0, w * 0.32, h, F[2]); checker(g, w * 0.68 - 4, 0, 4, h, F[2], 0); box(g, w - 6, 0, 6, h, F[1]);
  for (let i = 0; i < 3; i++) box(g, 0, h - 24 + i * 8, w, 8, mix(F[3], INK, 0.12 + i * 0.08));
  g.restore();
  // (a lit lip along its lumpy top)
  for (let k = 0; k < 8; k++) { const [x1, y1] = pts[k + 1], [x2, y2] = pts[k + 2]; g.strokeStyle = F[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(x1 + 1, y1 + 2); g.lineTo(x2 - 1, y2 + 2); g.stroke(); }
};
/** A plywood pine: flat, painted two greens, its raw ply edge, a 2x4 brace and a sandbag behind. */
const paintPlyPine = (g: Ctx, h: number) => {
  const Pl = dimmed(PLY, 0.1), N = dimmed(NEEDLE, 0.1);
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(4, -h * 0.55); g.lineTo(30, 0); g.stroke(); g.strokeStyle = Pl[2]; g.lineWidth = 3; g.stroke();
  box(g, 22, -8, 18, 8, INK); box(g, 23, -7, 16, 7, '#7A6A50'); box(g, 23, -7, 16, 2, '#9C8C6E');
  const tri = (dx: number, dy: number) => { g.beginPath(); g.moveTo(dx, -h + dy); g.lineTo(h * 0.32 + dx, -10 + dy); g.lineTo(h * 0.12 + dx, -12 + dy); g.lineTo(h * 0.26 + dx, -h * 0.35 + dy); g.lineTo(-h * 0.26 + dx, -h * 0.35 + dy); g.lineTo(-h * 0.12 + dx, -12 + dy); g.lineTo(-h * 0.32 + dx, -10 + dy); g.closePath(); };
  g.fillStyle = Pl[4]; tri(3, 1); g.fill();
  g.fillStyle = INK; tri(0, 0); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  g.save(); tri(0, 0); g.clip();
  box(g, -h, -h, h * 2, h, N[3]); box(g, -h, -h, h, h, N[4]);
  for (let y = -h + 14; y < -10; y += 12) { box(g, -h * 0.3, y, h * 0.6, 2, N[2]); box(g, -h * 0.3, y - 2, h * 0.25, 1, N[5]); }
  g.restore();
  box(g, -3, -12, 6, 12, INK); box(g, -2, -12, 4, 12, Pl[2]);
};

export const drawCanyon = (c: Ctx, state: GameState) => {
  for (let rx = 920; rx < 2500; rx += 140) {
    const h = 170 + hash(rx) * 60, top = GY - 20 - h;
    if (onScreen(state, X(rx), X(rx + 140))) stillAt(c, `lr-crag-${rx}`, X(rx), top, -4, -4, 138, h + 8, g => paintCrag(g, 130, h, rx));
    if (hash(rx + 9) > 0.5 && onScreen(state, X(rx + 30), X(rx + 120))) { const ph = 120 + hash(rx + 2) * 40; stillAt(c, `lr-plypine-${Math.round(ph / 10)}`, X(rx + 70), GY - 20, -ph * 0.4, -ph - 4, ph * 0.8 + 50, ph + 6, g => paintPlyPine(g, ph)); }
  }
  // (Beaver Creek: the beavers' "lodge", fiberglass sticks molded in a heap, a speaker grille in it)
  if (onScreen(state, X(2080), X(2260))) stillAt(c, 'lr-lodge', X(2170), GY - 18, -80, -70, 160, 72, g => {
    const B = dimmed(BARK, 0.1), F = dimmed(FIBER, 0.1);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 74, 58, 0, Math.PI, 0); g.fill();
    g.fillStyle = B[3]; g.beginPath(); g.ellipse(0, 0, 72, 56, 0, Math.PI, 0); g.fill();
    for (let k = 0; k < 40; k++) { const a = Math.PI + hash(k) * Math.PI, r = hash(k * 3) * 60, x = Math.cos(a) * r, y = Math.sin(a) * r * 0.75; g.save(); g.translate(x, y); g.rotate(hash(k * 7) * 3); box(g, -10, -1, 20, 3, k % 3 ? B[4] : B[2]); box(g, -10, -1, 20, 1, B[5]); g.restore(); }
    box(g, -12, -30, 24, 14, INK); box(g, -11, -29, 22, 12, F[2]); for (let i = 0; i < 5; i++) box(g, -9 + i * 4, -27, 2, 8, F[0]);
  });
  // (the plastic reeds in their planter along the creek: too green, too even, a zip tie round a clump)
  for (let rx = 1820; rx < 2480; rx += 60) if (onScreen(state, X(rx), X(rx + 60))) stillAt(c, `lr-reeds-${(rx / 60) % 3}`, X(rx), GY - 14, 0, -64, 60, 66, g => {
    const G = hr('grass', GRASS, 0.12), k = (rx / 60) % 3;
    box(g, 0, -8, 60, 8, INK); box(g, 1, -7, 58, 7, '#3A3A40'); box(g, 1, -7, 58, 1, '#5A5A64');
    for (let i = 0; i < 12; i++) { const x = 3 + i * 5, h = 30 + ((i * 7 + k * 3) % 4) * 6; box(g, x, -8 - h, 2, h, i % 2 ? '#3AB04A' : '#2A9038'); box(g, x, -8 - h, 1, h, '#6ADA6A'); if (i % 3 === 1) { box(g, x - 1, -8 - h - 10, 4, 10, INK); box(g, x, -8 - h - 9, 2, 8, '#7A4A1E'); } }
    if (k === 1) box(g, 24, -26, 14, 2, '#F4F4F0');
    void G;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The Old Sawmill's shed

const SHED_A = 3000, SHED_B = 3900;
const shedTop = () => waterY(3400) - 290;

const paintShedWall = (g: Ctx, v: number, h: number) => {
  const P = asIs(PLANK), B = asIs(BARK), warm = warmth();
  // (weathered vertical boards, gray-brown, knots and cracks)
  for (let x = 0, i = 0; x < 300; x += 18, i++) {
    const tone = hash(v * 17 + i), col = mix(tone < 0.3 ? P[1] : tone > 0.8 ? P[3] : P[2], '#4A4440', 0.25);
    box(g, x, 0, 18, h, col); box(g, x, 0, 1, h, mix(col, '#000000', 0.4)); box(g, x + 1, 0, 1, h, mix(col, '#FFFFFF', 0.1));
    for (let y = 20 + hash(i) * 40; y < h; y += 50 + hash(i + y) * 60) { box(g, x + 5, y, 4, 3, mix(col, '#000000', 0.35)); box(g, x + 6, y, 1, 1, mix(col, '#FFFFFF', 0.15)); }
  }
  // (girts across, lit along their tops)
  for (const y of [70, 170, h - 40]) { box(g, 0, y, 300, 8, INK); box(g, 0, y + 1, 300, 6, B[3]); box(g, 0, y + 1, 300, 2, B[5]); }
  // (a window: sash and muntins, the day or the night through it)
  const wx = 40 + (v % 3) * 70;
  box(g, wx - 3, 92, 66, 56, INK); box(g, wx - 2, 93, 64, 54, P[4]); glass(g, wx + 2, 97, 56, 46, warm * 0.2);
  box(g, wx + 29, 97, 3, 46, P[3]); box(g, wx + 2, 118, 56, 3, P[3]); box(g, wx - 4, 147, 68, 4, P[5]);
  // (the trusses under the roof: a bottom chord, king post, struts)
  box(g, 0, 0, 300, 18, INK); box(g, 0, 2, 300, 14, B[3]); box(g, 0, 2, 300, 3, B[5]);
  for (const tx of [0, 150]) {
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(tx + 10, 16); g.lineTo(tx + 75, 46); g.lineTo(tx + 140, 16); g.stroke();
    g.strokeStyle = B[4]; g.lineWidth = 5; g.stroke();
    box(g, tx + 72, 16, 7, 34, INK); box(g, tx + 73, 16, 5, 32, B[3]); box(g, tx + 73, 16, 1, 32, B[5]);
  }
  // (sawdust drifted along the foot)
  for (let x = 0; x < 300; x += 3) box(g, x, h - 4 - hash(v + x) * 6, 3, 10, mix('#D8B878', P[3], hash(x) * 0.5));
};

export const drawShedBack = (c: Ctx, state: GameState) => {
  const top = shedTop(), wy = waterY(3400), h = wy + 30 - top, f = state.frame;
  for (let i = 0; i < 3; i++) { const x = X(SHED_A) + i * 300; if (onScreen(state, x, x + 300)) stillAt(c, `lr-shed-${i}`, x, top, 0, 0, 300, h, g => paintShedWall(g, i, h)); }
  // (the line shaft along under the trusses, its pulleys turning, belts down to nothing much)
  const sy = top + 40;
  box(c, X(SHED_A), sy - 3, 900, 6, INK); box(c, X(SHED_A), sy - 2, 900, 4, '#71717A'); box(c, X(SHED_A), sy - 2, 900, 1, '#C4CCD6');
  for (const px of [3120, 3420, 3720]) {
    if (!onScreen(state, X(px) - 30, X(px) + 30)) continue;
    const a = f * 0.08;
    c.fillStyle = INK; c.beginPath(); c.arc(X(px), sy, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6A6A72'; c.beginPath(); c.arc(X(px), sy, 13, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3F3F46'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(X(px), sy); c.lineTo(X(px) + Math.cos(a + k * Math.PI / 2) * 12, sy + Math.sin(a + k * Math.PI / 2) * 12); c.stroke(); }
    box(c, X(px) - 2, sy - 2, 4, 4, '#C4CCD6');
    // (the belt down, its lacing going round)
    box(c, X(px) - 13, sy, 3, 90, INK); box(c, X(px) + 10, sy, 3, 90, INK); box(c, X(px) - 12, sy, 1, 90, '#5A3A22'); box(c, X(px) + 11, sy, 1, 90, '#5A3A22');
    box(c, X(px) - 13, sy + ((f * 2) % 90), 3, 3, '#C8A070'); box(c, X(px) + 10, sy + 90 - ((f * 2) % 90), 3, 3, '#C8A070');
  }
  // (the decorative mill wheel on the back wall, turning by a motor (no water to it), its paddles)
  const wx = X(3260), wyC = top + 210;
  if (onScreen(state, wx - 60, wx + 60)) {
    const a = f * 0.01, B = asIs(BARK);
    c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.arc(wx, wyC, 50, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = B[3]; c.lineWidth = 6; c.stroke(); c.strokeStyle = B[5]; c.lineWidth = 1; c.beginPath(); c.arc(wx, wyC, 52, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    for (let k = 0; k < 8; k++) {
      const t = a + (k * Math.PI) / 4, ex = wx + Math.cos(t) * 50, ey = wyC + Math.sin(t) * 50;
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(wx, wyC); c.lineTo(ex, ey); c.stroke(); c.strokeStyle = B[4]; c.lineWidth = 3; c.stroke();
      c.save(); c.translate(ex, ey); c.rotate(t); box(c, -2, -9, 12, 18, INK); box(c, -1, -8, 10, 16, B[3]); box(c, -1, -8, 10, 2, B[5]); c.restore();
    }
    c.fillStyle = INK; c.beginPath(); c.arc(wx, wyC, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#52525B'; c.beginPath(); c.arc(wx, wyC, 6, 0, Math.PI * 2); c.fill(); box(c, wx - 2, wyC - 3, 2, 2, '#A1A1AA');
  }
  // (THE OLD SAWMILL, burned on a board hung off a truss on chains)
  if (onScreen(state, X(3380), X(3620))) stillAt(c, 'lr-shed-sign', X(3500), top + 64, -110, -40, 220, 64, g => {
    const P = asIs(PLANK), S = asIs(STEEL);
    for (const cx of [-80, 80]) for (let y = -40; y < -14; y += 5) { box(g, cx - 2, y, 4, 4, INK); box(g, cx - 1, y + 1, 2, 2, S[4]); }
    box(g, -101, -15, 202, 32, INK); box(g, -100, -14, 200, 30, P[3]); box(g, -100, -14, 200, 2, P[5]); box(g, -100, 14, 200, 2, P[1]);
    for (let k = 0; k < 5; k++) box(g, -96 + hash(k) * 150, -8 + k * 5, 30, 1, P[2]);
    signText(g, 'THE OLD SAWMILL', 0, 8, burned(2, 3));
  });
};
export const drawShedFront = (c: Ctx, state: GameState) => {
  const top = shedTop(), wy = waterY(3400), B = asIs(BARK);
  // (its doorposts at either end, big peeled logs, a lintel)
  for (const dx of [SHED_A, SHED_B - 10]) {
    if (!onScreen(state, X(dx) - 20, X(dx) + 20)) continue;
    box(c, X(dx) - 9, top, 20, wy + 30 - top, INK); box(c, X(dx) - 8, top, 18, wy + 30 - top, B[3]); box(c, X(dx) - 8, top, 5, wy + 30 - top, B[5]); box(c, X(dx) + 5, top, 5, wy + 30 - top, B[2]);
    for (let y = top + 8; y < wy + 30; y += 14) box(c, X(dx) - 3 + ((y * 3) % 8), y, 2, 5, B[1]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The splash pool

export const drawSplashPool = (c: Ctx, state: GameState) => {
  const f = state.frame, py = waterY(4300);
  // (its far bank: a fiberglass crag)
  if (onScreen(state, X(4280), X(4480))) stillAt(c, 'lr-poolrock', X(4280), py - 120, -4, -4, 208, 118, g => paintCrag(g, 200, 110, 4280));
  // (the viewing bridge over the pool's far side, on its posts; soaked guests on it, cheering, taking pictures)
  if (onScreen(state, X(4360), X(4660))) {
    stillAt(c, 'lr-poolbridge', X(4380), py - 150, -6, -36, 272, 160, g => {
      const P = hr('plank', PLANK), S = hr('steel', STEEL);
      for (const px of [10, 240]) { box(g, px - 1, 10, 10, 140, INK); box(g, px, 10, 8, 140, P[3]); box(g, px, 10, 2, 140, P[5]); }
      box(g, -2, -2, 264, 14, INK); box(g, 0, 0, 260, 10, P[3]); box(g, 0, 0, 260, 2, P[5]); box(g, 0, 8, 260, 2, P[1]);
      for (let x = 0; x <= 260; x += 26) { box(g, x - 1, -30, 4, 30, INK); box(g, x, -30, 2, 30, S[4]); }
      box(g, -2, -32, 264, 4, INK); box(g, 0, -31, 260, 2, S[5]);
    });
    for (let k = 0; k < 5; k++) drawGuest(c, X(4400) + k * 46, py - 150, { seed: 331 + k * 23, f, pose: k % 2 ? 'cheer' : 'photo', mood: 'happy', facing: k === 4 ? -1 : 1 });
    // (SPLASH ZONE hung under the deck on chains)
    stillAt(c, 'lr-splashzone', X(4510), py - 120, -60, -14, 120, 40, g => {
      const S = hr('steel', STEEL);
      for (const cx of [-40, 40]) for (let y = -12; y < 4; y += 4) box(g, cx - 1, y, 3, 3, S[4]);
      box(g, -55, 3, 110, 22, INK); box(g, -54, 4, 108, 20, '#8E1C16'); box(g, -52, 6, 104, 1, '#F2E8D0'); box(g, -52, 21, 104, 1, '#F2E8D0');
      signText(g, 'SPLASH ZONE', 0, 18, { ...painted(1, '#FDE047', '#3A0A06'), dither: true });
    });
  }
  // (the ride photo's camera on its pole, its flash)
  if (onScreen(state, X(4220), X(4290))) {
    stillAt(c, 'lr-photocam', X(4253), py, -20, -190, 40, 192, g => {
      const S = hr('steel', STEEL);
      box(g, -4, -170, 7, 170, INK); box(g, -3, -170, 5, 170, S[3]); box(g, -3, -170, 1, 170, S[5]);
      box(g, -16, -188, 32, 22, INK); box(g, -15, -187, 30, 20, S[2]); box(g, -15, -187, 30, 3, S[4]); box(g, -18, -190, 36, 4, S[1]);
    });
    c.fillStyle = INK; c.beginPath(); c.arc(X(4253), py - 176, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = rideOf(state).flash > 0 ? '#FFFFFF' : '#5A7A98'; c.beginPath(); c.arc(X(4253), py - 176, 4.5, 0, Math.PI * 2); c.fill();
    box(c, X(4251), py - 179, 2, 2, '#E0F2FE');
    if (rideOf(state).flash > 0) steppedGlow(c, X(4253), py - 176, 40, '#FFFFFF', 0.05, 0.5, 4);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lumber camp

export const drawCamp = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (let rx = 4600; rx < 5500; rx += 300) {
    if (!onScreen(state, X(rx) - 20, X(rx) + 240)) continue;
    const y = waterY(rx) - 14, k = (rx / 300) % 3;
    stillAt(c, `lr-camp-${k}`, X(rx), y, -16, -90, 260, 92, g => {
      const Cv = hr('canvas', CANVAS), B = hr('bark', BARK), R = hr('rings', RINGS), P = hr('plank', PLANK);
      // (a wall tent: canvas over a ridge pole, the flap tied back, guy lines to pegs, the dark inside)
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(8, -50); g.lineTo(-12, 0); g.moveTo(92, -50); g.lineTo(112, 0); g.stroke();
      box(g, -14, -3, 4, 4, B[2]); box(g, 110, -3, 4, 4, B[2]);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-2, 1); g.lineTo(4, -44); g.lineTo(50, -74); g.lineTo(96, -44); g.lineTo(102, 1); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(6, -43); g.lineTo(50, -71); g.lineTo(94, -43); g.lineTo(100, 0); g.closePath(); g.clip();
      box(g, -2, -74, 104, 76, Cv[4]); box(g, -2, -74, 50, 76, Cv[5]); box(g, 60, -74, 44, 76, Cv[3]);
      for (let x = 10; x < 100; x += 14) box(g, x, -60, 1, 60, Cv[3]);
      box(g, -2, -6, 104, 6, Cv[2]); checker(g, -2, -9, 104, 3, Cv[3], 0);
      g.fillStyle = '#1A140C'; g.beginPath(); g.moveTo(40, 0); g.lineTo(50, -44); g.lineTo(62, 0); g.closePath(); g.fill();
      g.fillStyle = Cv[5]; g.beginPath(); g.moveTo(50, -44); g.lineTo(36, 0); g.lineTo(42, 0); g.closePath(); g.fill();
      g.restore();
      box(g, 48, -80, 4, 8, B[3]);
      // (cordwood stacked between stakes, the ends ringed)
      box(g, 138, -60, 4, 60, INK); box(g, 139, -60, 2, 60, B[4]); box(g, 214, -60, 4, 60, INK); box(g, 215, -60, 2, 60, B[4]);
      for (let r = 0; r < 4; r++) for (let j = 0; j < 4 - (r === 3 ? 1 : 0); j++) {
        const cx = 152 + j * 18 + (r % 2) * 8, cy = -9 - r * 15;
        g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 8.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = R[3]; g.beginPath(); g.arc(cx, cy, 7.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = R[4]; g.beginPath(); g.arc(cx - 1, cy - 1, 5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = R[1]; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 3.5, 0, Math.PI * 2); g.stroke(); box(g, cx - 1, cy - 1, 2, 2, R[0]);
      }
      // (a fiberglass stump with a rubber axe in it, now and then a lantern)
      if (k !== 1) { box(g, 112, -18, 22, 18, INK); box(g, 113, -17, 20, 17, B[3]); box(g, 113, -17, 6, 17, B[5]); box(g, 113, -17, 20, 3, R[3]); box(g, 121, -32, 3, 18, P[5]); box(g, 116, -34, 10, 6, '#9CA3AF'); }
      else { box(g, 120, -60, 2, 60, P[2]); box(g, 114, -58, 14, 2, P[2]); box(g, 113, -52, 8, 10, INK); box(g, 114, -51, 6, 8, '#FDE68A'); }
    });
    // (the cookfire: a silk flame on a fan (the fan's hum, the cloth flapping), a ring of fiberglass stones, a pot)
    if (k === 0 || k === 2) {
      const fx = X(rx + 250), fy = y;
      stillAt(c, 'lr-cookring', fx, fy, -26, -14, 52, 16, g => { const F = hr('fiber', FIBER); for (let i = 0; i < 7; i++) { const sx = -22 + i * 7; g.fillStyle = INK; g.beginPath(); g.ellipse(sx, -3, 5, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[3 + (i % 2)]; g.beginPath(); g.ellipse(sx - 0.5, -3.5, 4, 3, 0, 0, Math.PI * 2); g.fill(); } box(g, -8, -8, 16, 6, '#26262C'); for (let i = 0; i < 3; i++) box(g, -6 + i * 5, -10, 2, 3, '#3F3F46'); });
      for (let i = 0; i < 3; i++) { const ph = Math.sin(f * 0.5 + i * 2.1); c.save(); c.translate(fx - 6 + i * 6, fy - 8); c.scale(1, 0.85 + ph * 0.15); flame(c, 0, 0, 22 - i * 3, f, i); c.restore(); }
      box(c, fx - 9, fy - 30 - Math.abs(Math.sin(f * 0.6)) * 3, 18, 2, 'rgba(255, 220, 160, 0.5)');
      steppedGlow(c, fx, fy - 14, 34, '#FCA54A', 0.02, 0.18, 4);
    }
    // (the camp's washing on a line: flannel shirts, long johns)
    if (k === 1) {
      const lx = X(rx + 230), ly = y - 70;
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + 30, ly + 8, lx + 60, ly); c.stroke();
      box(c, lx - 1, ly, 3, 70, INK); box(c, lx + 59, ly, 3, 70, INK);
      const sw = Math.sin(f * 0.05) * 2;
      for (const [dx, col, h] of [[10, '#B91C1C', 18], [30, '#E8DCC8', 26], [46, '#1F5A8A', 16]] as const) { box(c, lx + dx + sw * 0.5, ly + 4, 12, h, INK); box(c, lx + dx + 1 + sw * 0.5, ly + 5, 10, h - 2, col); if (col !== '#E8DCC8') for (let yy = 0; yy < h - 2; yy += 4) box(c, lx + dx + 1 + sw * 0.5, ly + 5 + yy, 10, 1, mix(col, '#000000', 0.35)); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The break: the back lot's fence, the fault line, the chasm

export const drawBreak = (c: Ctx, state: GameState) => {
  const r = rideOf(state), t = r.cutT;
  if (onScreen(state, X(5880), X(6160))) stillAt(c, 'lr-backlot', X(5900), GY, -10, -106, 260, 108, g => {
    const S = hr('steel', STEEL);
    // (chain-link: galvanized posts, top rail, the diamond mesh, barbed wire on arms)
    for (let x = 0; x <= 240; x += 60) { box(g, x - 2, -96, 5, 96, INK); box(g, x - 1, -96, 3, 96, S[4]); box(g, x - 1, -96, 1, 96, S[6]); g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, -96); g.lineTo(x + 6, -104); g.stroke(); }
    box(g, 0, -92, 240, 3, S[4]); box(g, 0, -92, 240, 1, S[6]);
    g.strokeStyle = S[5]; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath();
    for (let x = -90; x < 240; x += 8) { g.moveTo(x, 0); g.lineTo(x + 90, -90); g.moveTo(x + 90, 0); g.lineTo(x, -90); }
    g.save(); g.rect(0, -90, 240, 90); g.clip(); g.stroke(); g.restore(); g.globalAlpha = 1;
    for (let x = 0; x < 240; x += 4) box(g, x, -102 + ((x >> 2) % 2), 3, 1, S[5]);
    // (AUTHORIZED ONLY: a white enamel plate wired to the mesh)
    box(g, 39, -71, 112, 26, INK); box(g, 40, -70, 110, 24, '#E8EAEC'); box(g, 40, -70, 110, 2, '#FFFFFF'); box(g, 42, -68, 106, 1, '#B91C1C'); box(g, 42, -49, 106, 1, '#B91C1C');
    signText(g, 'AUTHORIZED ONLY', 95, -54, painted(1, '#B91C1C', '#E8EAEC'));
    for (const wx of [44, 146]) box(g, wx, -66, 2, 2, S[2]);
  });
  if (t < SLAM_AT) return;
  const open = t >= 999 ? 1 : Math.min(1, (t - SLAM_AT) / 44);
  const a = X(CHASM.a), b = X(CHASM.b), mid = (a + b) / 2, half = ((b - a) / 2) * open, bottom = waterY(CHASM.b) - 236;
  const D = hr('dirt', DIRT), S = hr('stone', STONE), G = hr('grass', GRASS);
  // (the cracks, running off along the ground from it, growing: dark, lit along their lower lips)
  for (const [dir, len] of [[-1, 200], [1, 170]] as const) {
    const pts: [number, number][] = [[mid + dir * half, GY - 3]];
    for (let k = 1; k <= 8; k++) pts.push([mid + dir * (half + (len * open * k) / 8), GY - 3 + (k % 2 ? 4 : -1) + hash(k + dir) * 6]);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = D[5]; c.lineWidth = 1; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y + 2) : c.moveTo(x, y + 2))); c.stroke();
  }
  if (half < 2) return;
  // (the chasm: jagged walls of dirt and rock down into the dark, strata in its faces, roots, a broken pipe)
  const edge = (side: -1 | 1) => { const pts: [number, number][] = []; for (let k = 0; k <= 10; k++) { const y = GY - 4 + ((bottom - GY + 4) * k) / 10, w = half * (1 - k * 0.04) + (hash(k * 3 + side) - 0.5) * 14 * open; pts.push([mid + side * w, y]); } return pts; };
  const L = edge(-1), R = edge(1);
  c.fillStyle = '#060402'; c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (const p of L) c.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  // (its faces: banded darker going down, lit on the far (right) wall's edge facing the light)
  for (let k = 0; k < 10; k++) {
    const y0 = L[k][1], y1 = L[k + 1][1], dk = k / 10;
    c.fillStyle = mix(k < 4 ? D[3] : S[3], INK, 0.2 + dk * 0.5); c.beginPath(); c.moveTo(L[k][0], y0); c.lineTo(L[k][0] + 14, y0); c.lineTo(L[k + 1][0] + 14, y1); c.lineTo(L[k + 1][0], y1); c.closePath(); c.fill();
    c.fillStyle = mix(k < 4 ? D[4] : S[4], INK, 0.15 + dk * 0.5); c.beginPath(); c.moveTo(R[k][0], y0); c.lineTo(R[k][0] - 12, y0); c.lineTo(R[k + 1][0] - 12, y1); c.lineTo(R[k + 1][0], y1); c.closePath(); c.fill();
  }
  c.strokeStyle = INK; c.lineWidth = 2;
  for (const side of [L, R]) { c.beginPath(); c.moveTo(side[0][0], side[0][1]); for (const p of side) c.lineTo(p[0], p[1]); c.stroke(); }
  for (let k = 0; k < 8; k++) { const p = (k % 2 ? L : R)[1 + k]; box(c, p[0] - 6, p[1], 12, 7, INK); box(c, p[0] - 5, p[1] + 1, 10, 5, k % 3 ? D[3] : S[4]); box(c, p[0] - 5, p[1] + 1, 10, 1, k % 3 ? D[5] : S[6]); }
  for (let k = 0; k < 4; k++) { const p = L[1 + k]; c.strokeStyle = D[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(p[0], p[1] + 2); c.quadraticCurveTo(p[0] + 10, p[1] + 10, p[0] + 6 + k * 2, p[1] + 22); c.stroke(); }
  // (the ground's torn edges, the turf turned up)
  for (const [ex, w] of [[mid - half - 16, 18], [mid + half - 2, 18]] as const) { box(c, ex - 1, GY - 8, w + 2, 9, INK); box(c, ex, GY - 7, w, 7, D[3]); box(c, ex, GY - 7, w, 2, G[5]); box(c, ex, GY - 5, w, 1, G[3]); }
  void POOL; void BRASS;
};
