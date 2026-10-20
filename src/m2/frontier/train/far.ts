// The train's far off (screen space; the backdrop), sinking as the line climbs and rising as it drops (the horizon kept
// level; the train tilts, not the sky). Back to front:
//
//   the wilds' far off itself (wilds/far.ts, the same sky, the REAL Rockies past the park, the park's painted plywood
//     mountain flats, the two rows of pines, the lookout and the cell tower in its costume), slid along by how far the
//     world's gone by: it's the same land going past;
//   nearer, the PARK's frontier going by (the land's joke: the real wilderness comes later), a tile of it painted once
//     for the hour: fiberglass buttes in molded courses (seams, bolts, a chip to the white gelcoat), plywood pine
//     cutouts on their 2x4 braces and sandbags, a few real pines among them, the guests' viewing deck (WAVE AT THE
//     TRAIN!, the guests waving: drawn live, seeded), a painted billboard on its posts and catwalk, a prop mine (a
//     timber portal over a black-painted sheet of ply, an ore cart of gold-painted rocks, GOLD! on a board);
//   the park's split-rail fence along the front of it, then the grass down to the embankment.
//
// No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { burned, painted } from '../kit';
import { GY } from '../geometry';
import { drawFar } from '../wilds/far';
import { type Ctx, box, checker, mix, hash, INK, still, slab, post, fiberglass, pine, near, FIBER, PLANK, PLY, STEEL, GRASS, DIRT, NEEDLE, BRASS, timeOfDay, skyAt, bandedGradient } from './paint';
import { trainOf } from './state';
import { BERM_Y } from './passers';
import { screenY, ZOOM } from './view';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The park's tile: its width, height (its ground at the bottom), how fast it goes by (of the world's speed). */
const TW = 1800, TH = 230, SPEED = 0.45;
/** The wilds' far off: their ground line sat this far up from the park's tile's. */
const FAR_UP = 54;
/** The park's props stand this far up from the embankment's foot (the fence, nearer, lower down in front of them). */
const PARK_UP = 22;

// ---------------------------------------------------------------------------------------------------------------
// The park's pieces (local: the tile's ground at y = TH)

/** A fiberglass butte: a stepped mesa cut out of molded "rock", its courses lit along their tops, a seam bolted down it,
 *  the light down its left flank, the shade down its right, a chip to the white gelcoat; a 2x4 brace showing at its foot
 *  where the shell doesn't quite meet the ground. */
const butte = (g: Ctx, x: number, w: number, h: number, seed: number) => {
  const F = near(FIBER), base = TH;
  const pts: [number, number][] = [[x, base], [x + w * 0.06, base - h * 0.42], [x + w * 0.12, base - h * 0.48], [x + w * 0.16, base - h * 0.86], [x + w * 0.24, base - h], [x + w * 0.62, base - h * 0.97], [x + w * 0.7, base - h * 0.74], [x + w * 0.78, base - h * 0.7], [x + w * 0.86, base - h * 0.4], [x + w, base]];
  const path = () => { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); };
  g.fillStyle = INK; g.save(); g.translate(0, -1); path(); g.fill(); g.restore(); path(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.save(); path(); g.clip();
  fiberglass(g, x, base - h, w, h, F, seed, true);
  // (the light down the left of each step, the shade down the right; the top's worn pale)
  g.fillStyle = F[5]; g.beginPath(); g.moveTo(x + w * 0.16, base - h * 0.86); g.lineTo(x + w * 0.24, base - h); g.lineTo(x + w * 0.3, base - h); g.lineTo(x + w * 0.22, base - h * 0.6); g.closePath(); g.fill();
  checker(g, x + w * 0.18, base - h * 0.84, w * 0.1, h * 0.3, F[4], 0);
  g.fillStyle = F[1]; g.beginPath(); g.moveTo(x + w * 0.62, base - h * 0.97); g.lineTo(x + w, base); g.lineTo(x + w * 0.8, base); g.lineTo(x + w * 0.66, base - h * 0.6); g.closePath(); g.fill();
  checker(g, x + w * 0.6, base - h * 0.6, w * 0.08, h * 0.6, F[2], 1);
  box(g, x + w * 0.24, base - h, w * 0.38, 2, F[6]);
  // (dark at its foot, the grass against it)
  box(g, x, base - 8, w, 8, F[1]); checker(g, x, base - 12, w, 4, F[2], 0);
  g.restore();
  // (the brace showing under its lip, the sandbag on it)
  const P = near(PLY);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + w * 0.86, base - h * 0.3); g.lineTo(x + w + 18, base); g.stroke();
  g.strokeStyle = P[3]; g.lineWidth = 2; g.stroke();
  box(g, x + w + 8, base - 6, 16, 6, INK); box(g, x + w + 9, base - 5, 14, 5, '#8A7A5A'); box(g, x + w + 9, base - 5, 14, 1, '#B0A07A');
};

/** A plywood pine cutout: painted too regular (two greens, a trunk), the raw ply edge along its cut, a 2x4 brace off its
 *  back to a sandbag, its inventory number stenciled on the trunk. */
const cutout = (g: Ctx, x: number, h: number, seed: number) => {
  const base = TH, P = near(PLY), G = near(['#0E2414', '#18381E', '#22502A', '#2E6636', '#3E7E44']);
  // (the brace behind)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 2, base - h * 0.55); g.lineTo(x + h * 0.36, base); g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 2; g.stroke();
  box(g, x + h * 0.36 - 8, base - 6, 16, 6, INK); box(g, x + h * 0.36 - 7, base - 5, 14, 5, '#8A7A5A');
  const tier = (k: number) => { const t = (k + 1) / 3, y0 = base - h + k * h * 0.22, y1 = y0 + h * 0.34, half = h * (0.1 + t * 0.2); return [[x, y0], [x + half, y1], [x - half, y1]] as [number, number][]; };
  // (its raw edge: the sheet's thickness, offset right and down)
  for (let k = 0; k < 3; k++) { const tp = tier(k); g.fillStyle = P[4]; g.beginPath(); tp.forEach(([px, py], i) => (i ? g.lineTo(px + 3, py + 1) : g.moveTo(px + 3, py + 1))); g.closePath(); g.fill(); }
  box(g, x - 3, base - h * 0.34, 7, h * 0.34, P[4]);
  for (let k = 0; k < 3; k++) {
    const tp = tier(k);
    g.fillStyle = INK; g.beginPath(); tp.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.fill();
    g.fillStyle = G[2]; g.beginPath(); g.moveTo(tp[0][0], tp[0][1] + 1); g.lineTo(tp[1][0] - 1, tp[1][1]); g.lineTo(tp[2][0] + 1, tp[2][1]); g.closePath(); g.fill();
    g.fillStyle = G[3]; g.beginPath(); g.moveTo(tp[0][0], tp[0][1] + 2); g.lineTo(tp[2][0] + 2, tp[2][1]); g.lineTo(tp[0][0] - 2, tp[2][1]); g.closePath(); g.fill();
    // (the brush strokes: painted needles, too even)
    for (let i = 0; i < 6; i++) box(g, tp[2][0] + 6 + i * ((tp[1][0] - tp[2][0] - 12) / 6), tp[2][1] - 4 - (i % 2) * 3, 2, 3, G[4]);
    box(g, tp[2][0] + 1, tp[2][1] - 2, tp[1][0] - tp[2][0] - 2, 2, G[1]);
  }
  box(g, x - 4, base - h * 0.34, 7, h * 0.34, INK); box(g, x - 3, base - h * 0.34, 5, h * 0.34, '#5A3A1E'); box(g, x - 3, base - h * 0.34, 1, h * 0.34, '#7A5230');
  if (h > 80) signText(g, `${10 + (seed % 89)}`, x - 1, base - 8, { sx: 1, sy: 1, fill: '#2A1A0C' });
};

/** The guests' viewing deck: its plank floor on posts, the railing (rails, balusters), the WAVE AT THE TRAIN! board on
 *  its own posts over it. (The guests are drawn live.) */
const DECK_W = 250;
const viewingDeck = (g: Ctx, x: number) => {
  const base = TH, P = near(PLANK), floor = base - 22;
  // (the posts under, the floor's fascia, its lit edge)
  for (let k = 0; k <= 5; k++) post(g, x + 6 + k * 47, floor, base, 6, P);
  box(g, x - 2, floor - 1, DECK_W + 4, 8, INK); box(g, x - 1, floor, DECK_W + 2, 6, P[3]); box(g, x - 1, floor, DECK_W + 2, 1, P[5]); box(g, x - 1, floor + 5, DECK_W + 2, 1, P[1]);
  // (the steps up at its left)
  for (let k = 0; k < 3; k++) { box(g, x - 22 + k * 7, floor + 16 - k * 7, 10, 3, INK); box(g, x - 21 + k * 7, floor + 16 - k * 7, 8, 2, P[4]); }
  // (the board over it, on two peeled posts: burned in)
  const sx = x + 66, sw = 124, sy = floor - 98;
  // (its posts down to the deck's floor, behind the guests and the railing: not stopping short in the air over it)
  for (const px of [sx + 10, sx + sw - 10]) post(g, px, sy, floor, 6, P);
  box(g, sx - 1, sy - 1, sw + 2, 24, INK); slab(g, sx, sy, sw, 22, P);
  for (let gy = sy + 4; gy < sy + 20; gy += 3) box(g, sx + 4 + ((gy * 7) % 13), gy, sw * 0.4, 1, P[2]);
  for (const nx of [sx + 4, sx + sw - 6]) { box(g, nx, sy + 9, 2, 2, '#26262C'); }
  signText(g, 'WAVE AT THE TRAIN!', sx + sw / 2, sy + 15, burned(1, 7));
};
/** The deck's railing (in front of the guests). */
const railing = (g: Ctx, x: number) => {
  const P = near(PLANK), floor = TH - 22, top = floor - 26;
  for (let k = 0; k <= 10; k++) { box(g, x + k * 24 - 1, top, 4, 26, INK); box(g, x + k * 24, top, 2, 26, P[k % 5 === 0 ? 4 : 3]); }
  box(g, x - 2, top - 1, DECK_W + 4, 6, INK); box(g, x - 1, top, DECK_W + 2, 4, P[4]); box(g, x - 1, top, DECK_W + 2, 1, P[6]);
  box(g, x - 1, top + 13, DECK_W + 2, 3, INK); box(g, x - 1, top + 13, DECK_W + 2, 2, P[3]);
};

/** A painted billboard on posts with its catwalk and two gooseneck lamps: SAWDUST GULCH 3 MILES, GOLD! TIMBER! FUDGE! */
const billboard = (g: Ctx, x: number) => {
  const base = TH, P = near(PLANK), S = near(STEEL), bw = 186, bh = 74, by = base - 160;
  for (const px of [x + 24, x + bw - 24]) post(g, px, by + bh, base, 9, P);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 24, base - 40); g.lineTo(x + bw - 24, by + bh + 4); g.moveTo(x + bw - 24, base - 40); g.lineTo(x + 24, by + bh + 4); g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 2; g.stroke();
  // (the board: its frame, the paint in bands (sun-faded at the top), the lettering)
  box(g, x - 3, by - 3, bw + 6, bh + 6, INK); box(g, x - 2, by - 2, bw + 4, bh + 4, P[2]); box(g, x - 2, by - 2, bw + 4, 1, P[4]);
  bandedGradient(g, x, by, bw, bh, ['#F2E6C2', '#E8D8A8', '#DCC890', '#CDB67A'].map(c => near([c])[0]), 4);
  box(g, x + 4, by + 4, bw - 8, 1, '#8A2A1A'); box(g, x + 4, by + bh - 5, bw - 8, 1, '#8A2A1A');
  signText(g, 'SAWDUST GULCH', x + bw / 2, by + 24, painted(2, '#7A3A16', '#3A1A08'));
  signText(g, '3 MILES', x + bw / 2, by + 42, painted(1, '#3A2412', '#C8A870'));
  signText(g, 'GOLD! TIMBER! FUDGE!', x + bw / 2, by + 60, painted(1, '#B91C1C', '#3A0A06'));
  // (weathering: a peeled corner, streaks under the lamps)
  g.fillStyle = mix('#CDB67A', '#8A7A5A', 0.4); g.beginPath(); g.moveTo(x + bw - 22, by); g.lineTo(x + bw, by); g.lineTo(x + bw, by + 16); g.closePath(); g.fill();
  box(g, x + 46, by + 1, 1, 14, '#B8A06A'); box(g, x + 140, by + 1, 1, 10, '#B8A06A');
  // (the catwalk under it, the goosenecks over it)
  box(g, x - 6, by + bh + 3, bw + 12, 4, INK); box(g, x - 5, by + bh + 3, bw + 10, 3, S[3]); box(g, x - 5, by + bh + 3, bw + 10, 1, S[5]);
  for (const lx of [x + 40, x + bw - 40]) {
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, by - 2); g.quadraticCurveTo(lx, by - 16, lx + 12, by - 16); g.stroke();
    g.strokeStyle = S[4]; g.lineWidth = 1; g.stroke();
    box(g, lx + 9, by - 18, 10, 5, INK); box(g, lx + 10, by - 17, 8, 3, S[4]);
  }
};

/** The prop mine: a timber portal (posts, a header with its ends cut), the "shaft" a sheet of ply painted black (its raw
 *  edge and a corner peeling, the fake depth painted on in bands), a stub of track with an ore cart heaped with rocks
 *  painted gold, GOLD! on a board. */
const mineProp = (g: Ctx, x: number) => {
  const base = TH, P = near(PLANK), Pl = near(PLY), S = near(STEEL), pw = 78, ph = 82;
  // (the painted hole)
  box(g, x - 1, base - ph - 1, pw + 2, ph + 1, INK);
  bandedGradient(g, x, base - ph, pw, ph, ['#2A2A30', '#18181C', '#0E0E12', '#08080A'], 4);
  for (let k = 0; k < 3; k++) { box(g, x + 8 + k * 8, base - ph + 12 + k * 10, pw - 16 - k * 16, 1, '#2E2E36'); }
  g.fillStyle = Pl[4]; g.beginPath(); g.moveTo(x + pw - 14, base - ph); g.lineTo(x + pw, base - ph); g.lineTo(x + pw, base - ph + 14); g.closePath(); g.fill();
  box(g, x + pw - 1, base - ph, 2, ph, Pl[4]);
  // (the portal's timbers)
  for (const px of [x - 4, x + pw - 6]) { box(g, px - 1, base - ph - 2, 12, ph + 2, INK); slab(g, px, base - ph - 1, 10, ph + 1, P); }
  box(g, x - 13, base - ph - 14, pw + 26, 14, INK); slab(g, x - 12, base - ph - 13, pw + 24, 12, P);
  for (const ex of [x - 12, x + pw + 8]) { box(g, ex, base - ph - 13, 4, 12, P[5]); g.fillStyle = P[2]; g.beginPath(); g.arc(ex + 2, base - ph - 7, 2, 0, Math.PI * 2); g.fill(); }
  // (GOLD! on a board nailed over it, sat on the header (not a gap of sky under it))
  box(g, x + 8, base - ph - 38, pw - 16, 25, INK); slab(g, x + 9, base - ph - 37, pw - 18, 23, near(['#4A3008', '#6A4A10', '#8E6A1A', '#C8A030', '#E8C858', '#FFE890', '#FFF4C0']));
  signText(g, 'GOLD!', x + pw / 2, base - ph - 19, painted(2, '#7F1D1D', '#3A0A06'));
  // (the stub of track, the cart heaped with gold-painted rocks)
  box(g, x + pw + 8, base - 4, 70, 2, S[4]); for (let k = 0; k < 5; k++) box(g, x + pw + 10 + k * 14, base - 3, 6, 3, P[1]);
  const cx = x + pw + 20;
  g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 2, base - 30); g.lineTo(cx + 46, base - 30); g.lineTo(cx + 40, base - 10); g.lineTo(cx + 4, base - 10); g.closePath(); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.moveTo(cx, base - 29); g.lineTo(cx + 44, base - 29); g.lineTo(cx + 39, base - 11); g.lineTo(cx + 5, base - 11); g.closePath(); g.fill();
  box(g, cx, base - 29, 44, 2, S[5]); box(g, cx + 6, base - 22, 34, 1, S[2]);
  for (let k = 0; k < 7; k++) { const rx = cx + 4 + k * 5.6, ry = base - 33 - (k % 3) * 2; g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = BRASS[4]; g.beginPath(); g.arc(rx, ry, 3, 0, Math.PI * 2); g.fill(); box(g, rx - 2, ry - 2, 1, 1, BRASS[6]); }
  for (const wx of [cx + 10, cx + 34]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, base - 7, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.arc(wx, base - 7, 3.5, 0, Math.PI * 2); g.fill(); }
};

/** The whole tile, painted once for the hour. */
const paintPark = (g: Ctx) => {
  const tod = timeOfDay();
  // (real pines stood about among the fakes)
  for (const [px, ph, s] of [[300, 120, 3], [880, 140, 7], [1480, 110, 11], [1730, 150, 13], [40, 96, 17]] as const) pine(g, px, TH, ph, ph * 0.42, s, near(NEEDLE));
  butte(g, 110, 230, 136, 3);
  cutout(g, 430, 92, 12); cutout(g, 482, 70, 31);
  viewingDeck(g, 640);
  billboard(g, 1000);
  butte(g, 1250, 170, 96, 9);
  mineProp(g, 1290);
  cutout(g, 1570, 104, 44); cutout(g, 1650, 80, 57);
  // (stood back: a step into the hazy air, so none of it reads as somewhere to stand)
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.2; g.fillStyle = skyAt(0.9, tod); g.fillRect(-10, -10, TW + 20, TH + 20); g.restore();
};
const paintRailings = (g: Ctx) => {
  railing(g, 640);
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.2; g.fillStyle = skyAt(0.9); g.fillRect(-10, -10, TW + 20, TH + 20); g.restore();
};

/** The park's split-rail fence (a tile 240 wide): posts, two rails each lit along its top, notched where they cross. */
const FW = 240;
const paintFence = (g: Ctx) => {
  const P = near(['#2A1A0C', '#3E2814', '#56381E', '#704A28', '#8A6034', '#A47A46', '#C29A60']);
  for (let k = 0; k < 4; k++) post(g, k * 60 + 4, 4, 34, 6, P);
  for (const ry of [10, 22]) {
    box(g, -2, ry - 1, FW + 4, 6, INK); box(g, -2, ry, FW + 4, 4, P[3]); box(g, -2, ry, FW + 4, 1, P[5]); box(g, -2, ry + 3, FW + 4, 1, P[1]);
    for (let x = 0; x < FW; x += 9) box(g, x + ((x * 7) % 5), ry + 1 + (x % 2), 4, 1, P[2]);
  }
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.14; g.fillStyle = skyAt(0.9); g.fillRect(-10, -10, FW + 20, 60); g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The guests (live: waving)

const SKINS = ['#F2CDA8', '#E0AC80', '#B87A50', '#8A5434', '#5E3820', '#F6DCC4'];
const SHIRTS = ['#D83A3A', '#3A6AD8', '#E8A020', '#2E9A5A', '#D84A9A', '#F2F2EE', '#6A4AB0', '#E86A2A'];
const HAIRS = ['#1C120A', '#4A2A12', '#8A5A2A', '#D8B060', '#E8E0D0', '#2A1A10'];
const guest = (c: Ctx, x: number, y: number, seed: number, f: number) => {
  const skin = SKINS[((Math.floor(seed) % SKINS.length) + SKINS.length) % SKINS.length], shirt = near([SHIRTS[((Math.floor(seed * 3) % SHIRTS.length) + SHIRTS.length) % SHIRTS.length]])[0], hair = HAIRS[((Math.floor(seed * 5) % HAIRS.length) + HAIRS.length) % HAIRS.length];
  const kid = seed % 5 === 3, h = kid ? 0.72 : 1, woman = seed % 2 === 0;
  const top = y - 44 * h, up = Math.sin(f * 0.22 + seed * 1.7) > 0;
  c.save(); c.globalAlpha = 1;
  // (the torso: stepped)
  box(c, x - 7, top + 14, 14, 26 * h, INK); box(c, x - 6, top + 15, 12, 25 * h, shirt); box(c, x - 6, top + 15, 3, 25 * h, mix(shirt, '#FFFFFF', 0.25)); box(c, x + 3, top + 15, 3, 25 * h, mix(shirt, INK, 0.3));
  // (the head, the hair (long on some), a souvenir hat on some)
  box(c, x - 5, top + 2, 10, 12, INK); box(c, x - 4, top + 3, 8, 10, skin); box(c, x - 4, top + 3, 2, 10, mix(skin, '#FFFFFF', 0.2));
  box(c, x - 5, top + 1, 10, 4, hair); if (woman) box(c, x - 6, top + 3, 3, 12, hair);
  box(c, x + 1, top + 7, 1, 1, INK); box(c, x - 2, top + 7, 1, 1, INK);
  if (seed % 3 === 1) { box(c, x - 9, top + 1, 18, 2, '#5A3A1E'); box(c, x - 5, top - 4, 10, 6, '#7A5230'); box(c, x - 5, top - 4, 10, 1, '#A07848'); }
  // (the waving arm; the other at the rail, or holding up a phone)
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 6, top + 18); c.lineTo(x + (up ? 14 : 11), top + (up ? -2 : 4)); c.stroke();
  c.strokeStyle = skin; c.lineWidth = 2; c.stroke();
  if (seed % 4 === 2) { box(c, x - 14, top + 10, 6, 9, INK); box(c, x - 13, top + 11, 4, 7, '#3A5A8A'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

/** Screen space: the far off and the park's frontier going by. */
export const drawScenery = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  const base = Math.round(screenY(state, BERM_Y + 24) + tr.climb * 0.5 * ZOOM);
  // (the wilds' own far off, its ground line just behind the park's)
  const gl = base - FAR_UP, eyeS = H * 0.42;
  const fake = { ...state, camera: { ...state.camera, x: state.camera.x + tr.dist, y: GY - eyeS - (gl - eyeS) / 0.7 } } as GameState;
  drawFar(c, fake);
  // (the park's ground: its grass going back, hazy, banded down to the embankment)
  const G = near(GRASS), D = near(DIRT), tod = timeOfDay(), haze = skyAt(0.9, tod), g0 = base - PARK_UP - 14;
  bandedGradient(c, 0, g0, W, Math.max(0, H - g0), [mix(G[3], haze, 0.24), mix(G[3], haze, 0.16), mix(G[2], haze, 0.1), G[2], mix(G[1], D[2], 0.4)], 5);
  checker(c, 0, g0, W, 2, mix(G[4], haze, 0.2), 0);
  // (the park's frontier: the tile, the guests on the deck, its railing in front of them)
  const off = (tr.dist * SPEED + state.camera.x * SPEED) % TW;
  for (let k = -1; k < 2; k++) {
    const bx = Math.round(k * TW - off);
    if (bx > W || bx + TW < 0) continue;
    c.save(); c.translate(bx, base - PARK_UP - TH);
    still(c, 'tr-park', -10, -10, TW + 40, TH + 12, paintPark);
    if (bx + 640 < W + 40 && bx + 640 + DECK_W > -40) for (let n = 0; n < 6; n++) guest(c, 664 + n * 38 + (n % 2) * 6, TH - 22, n * 7 + 3, f);
    still(c, 'tr-rail', 620, TH - 60, 300, 40, paintRailings);
    c.restore();
  }
  const off2 = Math.round((tr.dist * 0.55 + state.camera.x * 0.55) % FW);
  // (the fence stood along the park's near edge, just over the embankment's top)
  for (let x = -off2 - FW; x < W + FW; x += FW) { c.save(); c.translate(x, base - 40); still(c, 'tr-fence', -4, 0, FW + 8, 40, paintFence); c.restore(); }
  void hash; void STEEL;
  return true;
};
