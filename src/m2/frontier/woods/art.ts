// The woods, drawn (the final pass: peak SNES): REAL woods, outside the park, straight on from the log ride's real river
// and the crew's clearing (the same kit, the same trees: paint.ts). Back to front: the far off (far.ts: the real sky,
// the real Rockies, the ridge with the clear-cut, and behind him the park from the outside: its back fence, the BACKS of
// its painted mountains, the log ride's lift hill), the ground going back and the trees (ground.ts), the power line
// along the trail (creosoted poles, crossarms, glass insulators, a transformer can, a pair of sneakers slung over a
// span), the kids' lot in the back lanes (dirt jumps, a plywood ramp on cinder blocks, a burnt couch, a fire ring,
// DIRT RATS sprayed on a boulder), the big trees by the trail, the NO TRESPASSING sign nailed to one (buckshot through
// it), then the trail coming toward him and what's on it: trash everywhere (a NO DUMPING sign in the middle of it), the
// scout troop's hand-painted ivy warning, the fallen tree and the boulder (lit along their tops: his to stand on), the
// leaf pile. The left end's a dead end: the bank drops into the river and a thicket closes it off.
// No park lettering out here (printed, stenciled, brushed on, sprayed).

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { GY } from '../geometry';
import {
  type Ctx, type View, box, checker, mix, hash, stillAt, atDepth, at, viewOf, INK, hr, skyAt, timeOfDay, pixelBlob,
  DIRT, GRANITE, MOSS, BARK, STEEL, PLY, RUST, RINGS, LIP, POLE, CHAR, ASH, BLOCK, GOLD, BROWN, DUFF, NEEDLE,
  printed, sprayed, brush, leafAt, firOf,
} from './paint';
import { extrude } from '../wilds/paint';
import { drawWoodsFar } from './far';
import { drawGoingBack, drawTrees, drawPlayFloor, drawDeadEndBack, drawDeadEndFront } from './ground';
import { drawTeenPerson, teenOf } from './teens';
import {
  X, SIGN_TREE, POLES, FALLEN, BOULDER, SCOUT_SIGN, LITTER, PILE, COUCH, FIRE, RAMP, TAG_ROCK, MOUNDS, SULK, LANES, type Litter,
} from './layout';

/** Is world a..b at depth d on screen (by where it's drawn)? */
const seenAt = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, GY, d), [sb] = at(v.eye, b, GY, d);
  return sb > v.cam.x - pad && sa < v.cam.x + 800 + pad;
};
/** Scenery stood back (a step toward the hazy air: none of it reads as somewhere to stand). */
const back = (R: string[], k = 0.16) => { const haze = skyAt(0.9, timeOfDay()); return R.map(col => mix(col, haze, k)); };

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

export const drawWoodsBackdrop = (c: Ctx, state: GameState) => drawWoodsFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

/** Depths of what stands back (between the trees): the power line and the dumped trash (behind the lot's lanes, so no
 *  rider ever goes by in front of something nearer), the lot's far lane, its near lane, the NO DUMPING sign, the NO
 *  TRESPASSING tree (and the cart and the TV by the trail). */
const POLE_D = 0.82, TRASH_D = 0.82, LOT_FAR_D = 0.84, LOT_NEAR_D = 0.91, DUMP_D = 0.93, SIGN_D = 0.95;

export const drawWoodsBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  // (deepest first: nothing stood back is drawn over anything nearer)
  drawGoingBack(c, v);
  drawTrees(c, v, 0, POLE_D);
  drawPowerLine(c, v, state.frame);
  // (the far side's dumped trash, back on the ground going back)
  for (const [rx, what] of LITTER) { const d = litterDepth(what); if (d === TRASH_D && seenAt(v, X(rx) - 50, X(rx) + 50, d)) atDepth(c, v.eye, d, () => litter(c, X(rx), what)); }
  drawTrees(c, v, TRASH_D, LOT_FAR_D);
  drawLot(c, v, state.frame, 2);
  drawTrees(c, v, LOT_FAR_D, 0.86);
  drawDeadEndBack(c, v);
  drawTrees(c, v, 0.86, LOT_NEAR_D);
  drawLot(c, v, state.frame, 1);
  drawTrees(c, v, LOT_NEAR_D, DUMP_D);
  if (seenAt(v, X(1470) - 40, X(1470) + 40, DUMP_D)) atDepth(c, v.eye, DUMP_D, () => noDumping(c, X(1470)));
  drawTrees(c, v, DUMP_D, SIGN_D);
  for (const [rx, what] of LITTER) { const d = litterDepth(what); if (d === SIGN_D && seenAt(v, X(rx) - 50, X(rx) + 50, d)) atDepth(c, v.eye, d, () => litter(c, X(rx), what)); }
  if (seenAt(v, X(SIGN_TREE) - 70, X(SIGN_TREE) + 70, SIGN_D)) atDepth(c, v.eye, SIGN_D, () => noTrespassing(c, X(SIGN_TREE)));
  drawTrees(c, v, SIGN_D, 1.01);
  // ---- the trail coming toward him, and what's on it
  drawPlayFloor(c, v);
  for (const [rx, what] of LITTER) if (litterDepth(what) === 1 && seenAt(v, X(rx) - 40, X(rx) + 40)) litter(c, X(rx), what);
  if (seenAt(v, X(SCOUT_SIGN) - 70, X(SCOUT_SIGN) + 70)) scoutSign(c, X(SCOUT_SIGN));
  if (seenAt(v, X(FALLEN[0]) - 50, X(FALLEN[1]) + 50)) fallenTree(c);
  if (seenAt(v, X(BOULDER[0]) - 20, X(BOULDER[1]) + 20)) boulder(c, v);
};

// ---------------------------------------------------------------------------------------------------------------
// The power line

/** A pole's crossarm height above the ground (play-plane units). */
const ARM = 300;
const paintPole = (g: Ctx, i: number) => {
  const P = hr('pole', POLE, 0.2), S = hr('steel', STEEL, 0.2), Pl = hr('ply', PLY, 0.2);
  // (the pole: creosoted, checked with age, step bolts up it, a tag, staples and an old flyer)
  box(g, -6, -ARM - 16, 12, ARM + 16, INK); box(g, -5, -ARM - 16, 10, ARM + 16, P[3]); box(g, -5, -ARM - 16, 3, ARM + 16, P[5]); box(g, -4, -ARM - 16, 1, ARM + 16, P[6]); box(g, 2, -ARM - 16, 3, ARM + 16, P[1]);
  for (let y = -ARM; y < -6; y += 9) box(g, -2 + ((y * 7) & 3), y, 1, 5 + ((y * 3) & 3), P[2]);
  for (let y = -ARM + 60; y < -80; y += 22) { box(g, (y / 22) % 2 ? 5 : -9, y, 4, 2, INK); box(g, (y / 22) % 2 ? 5 : -9, y, 3, 1, S[5]); }
  box(g, -4, -90, 8, 6, S[4]); box(g, -4, -90, 8, 1, S[6]); box(g, -2, -88, 4, 1, S[1]);
  for (let k = 0; k < 9; k++) box(g, -4 + hash(i * 9 + k) * 7, -150 + hash(k * 3 + i) * 50, 1, 1, S[5]);
  if (i === 0) {
    // (a LOST DOG flyer, sun-faded, rain-rippled)
    box(g, -10, -152, 20, 26, INK); box(g, -9, -151, 18, 24, '#E8E2CC'); box(g, -9, -151, 18, 2, '#F4F0E0');
    signText(g, 'LOST', 0, -144, printed('#3A3A3A')); box(g, -6, -141, 12, 8, '#9A8C70'); box(g, -4, -139, 6, 4, '#5A4C38');
    for (let k = 0; k < 4; k++) box(g, -7 + k * 4, -130, 2, 3, '#B8B2A0');
  }
  // (the crossarm, its braces, glass insulators on their pins)
  box(g, -38, -ARM - 2, 76, 8, INK); box(g, -37, -ARM - 1, 74, 6, Pl[2]); box(g, -37, -ARM - 1, 74, 2, Pl[4]); box(g, -37, -ARM + 4, 74, 1, Pl[0]);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, -ARM + 6); g.lineTo(-2, -ARM + 34); g.moveTo(26, -ARM + 6); g.lineTo(2, -ARM + 34); g.stroke();
  g.strokeStyle = S[4]; g.lineWidth = 1; g.stroke();
  for (const ix of [-30, 30]) { box(g, ix - 4, -ARM - 11, 8, 10, INK); box(g, ix - 3, -ARM - 10, 6, 8, '#3A8A86'); box(g, ix - 3, -ARM - 10, 2, 8, '#7ED0C4'); box(g, ix - 3, -ARM - 6, 6, 1, '#1E5A58'); box(g, ix - 1, -ARM - 2, 2, 2, S[3]); }
  // (every other pole a transformer can, its bushings, the ground wire down)
  if (i % 2 === 1) {
    box(g, 5, -ARM + 40, 18, 30, INK); box(g, 6, -ARM + 41, 16, 28, S[4]); box(g, 6, -ARM + 41, 5, 28, S[5]); box(g, 18, -ARM + 41, 4, 28, S[2]);
    box(g, 6, -ARM + 41, 16, 2, S[6]); box(g, 6, -ARM + 52, 16, 1, S[2]); box(g, 9, -ARM + 36, 3, 6, '#7A6A5A'); box(g, 16, -ARM + 36, 3, 6, '#7A6A5A');
    box(g, 6, -ARM + 60, 16, 4, '#B8B0A0');
  }
  box(g, 3, -ARM + 20, 1, ARM - 20, '#5A4A3A');
};

const drawPowerLine = (c: Ctx, v: View, f: number) => {
  atDepth(c, v.eye, POLE_D, () => {
    for (let i = 0; i < POLES.length; i++) {
      const a = X(POLES[i]);
      if (seenAt(v, a - 50, a + 50, POLE_D)) stillAt(c, `wd-pole-${i}`, a, GY, -42, -ARM - 20, 84, ARM + 22, g => paintPole(g, i));
      if (i + 1 >= POLES.length) continue;
      const b = X(POLES[i + 1]);
      if (!seenAt(v, a, b, POLE_D)) continue;
      // (the wires sagging between, a hair of sway)
      const sway = Math.sin(f * 0.02 + i) * 1.5;
      c.strokeStyle = '#141416'; c.lineWidth = 1.4;
      for (const dx of [-30, 30]) { c.beginPath(); c.moveTo(a + dx, GY - ARM - 11); c.quadraticCurveTo((a + b) / 2, GY - ARM + 52 + sway, b + dx, GY - ARM - 11); c.stroke(); }
      // (the sneakers slung over the second span by their laces)
      if (i === 1) {
        const t = 0.56, sx = (1 - t) * (1 - t) * (a + 30) + 2 * (1 - t) * t * ((a + b) / 2) + t * t * (b + 30), sy = (1 - t) * (1 - t) * (GY - ARM - 11) + 2 * (1 - t) * t * (GY - ARM + 52 + sway) + t * t * (GY - ARM - 11);
        const swing = Math.sin(f * 0.03) * 0.08;
        c.save(); c.translate(sx, sy); c.rotate(swing);
        c.strokeStyle = '#E8E4DA'; c.lineWidth = 1; c.beginPath(); c.moveTo(-1, 0); c.lineTo(-8, 18); c.moveTo(1, 0); c.lineTo(9, 13); c.stroke();
        for (const [dx, dy, fl] of [[-8, 18, 1], [9, 13, -1]] as const) {
          c.save(); c.translate(dx, dy); c.scale(fl, 1);
          box(c, -7, 0, 15, 8, INK); box(c, -6, 1, 13, 5, '#F2F0EA'); box(c, -6, 1, 13, 1, '#FFFFFF'); box(c, -6, 5, 13, 2, '#D8D4CC');
          box(c, -2, 2, 6, 2, '#C81E1E'); box(c, 4, 1, 3, 4, '#E8E4DA'); box(c, -6, 6, 13, 1, '#5A5A60');
          c.restore();
        }
        c.restore();
      }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The kids' lot (in its back lanes: one shared eye, so the lanes' sizes)

/** The lot's dirt jumps (back lane; the riders hop them): packed dirt, tire-scored, dimmed (not his to stand on). */
const paintMound = (g: Ctx) => {
  const D = back(hr('dirt', DIRT, 0.2), 0.12);
  g.fillStyle = INK; g.beginPath(); g.moveTo(-56, 1); g.quadraticCurveTo(-6, -42, 44, 1); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-54, 0); g.quadraticCurveTo(-6, -40, 42, 0); g.closePath(); g.clip();
  for (let i = 0; i < 6; i++) box(g, -60, -40 + i * 7, 110, 8, [D[5], D[4], D[4], D[3], D[3], D[2]][i]);
  checker(g, -60, -26, 110, 2, D[3]); checker(g, -60, -12, 110, 2, D[2], 1);
  g.fillStyle = D[6]; g.beginPath(); g.moveTo(-34, -10); g.quadraticCurveTo(-14, -30, -2, -24); g.lineTo(-20, -10); g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) { box(g, -40 + k * 8, -6 - Math.sin((k / 6) * Math.PI) * 22, 5, 1, D[1]); box(g, 4 + k * 6, -18 + k * 3, 4, 1, D[1]); }
  for (let k = 0; k < 10; k++) box(g, -46 + hash(k) * 84, -2 - hash(k * 3) * 14, 2, 1, D[6]);
  g.restore();
};
/** The plywood ramp on cinder blocks. */
const paintRamp = (g: Ctx) => {
  const Bk = back(hr('block', BLOCK, 0.2)), P = back(hr('ply', PLY, 0.2));
  for (const dx of [10, 26]) {
    box(g, dx, -18, 15, 18, INK); box(g, dx + 1, -17, 13, 16, Bk[3]); box(g, dx + 1, -17, 13, 2, Bk[5]); box(g, dx + 1, -17, 2, 16, Bk[4]);
    box(g, dx + 4, -13, 3, 8, Bk[0]); box(g, dx + 9, -13, 3, 8, Bk[0]); box(g, dx + 11, -3, 3, 2, Bk[1]);
  }
  box(g, 14, -26, 12, 8, INK); box(g, 15, -25, 10, 6, Bk[3]); box(g, 15, -25, 10, 1, Bk[5]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(-52, 1); g.lineTo(44, -28); g.lineTo(44, -22); g.lineTo(-52, 4); g.closePath(); g.fill();
  g.fillStyle = P[3]; g.beginPath(); g.moveTo(-50, 0); g.lineTo(42, -27); g.lineTo(42, -23.5); g.lineTo(-50, 2.5); g.closePath(); g.fill();
  g.fillStyle = P[5]; g.beginPath(); g.moveTo(-50, 0); g.lineTo(42, -27); g.lineTo(42, -26); g.lineTo(-50, 1); g.closePath(); g.fill();
  for (let k = 0; k < 5; k++) box(g, -40 + k * 18, -1 - k * 5.4, 2, 2, STEEL[2]);
  box(g, 30, -25, 10, 2, P[1]);
  signText(g, 'SEND IT', -4, -9, sprayed('#E8E4DA', 1, undefined, 3));
};
/** The burnt couch: char and rust, the springs out, a scrap of its plaid, ash under it. */
const paintCouch = (g: Ctx) => {
  const C = back(CHAR, 0.1), A = back(ASH, 0.1), R = back(hr('rust', RUST, 0.2), 0.1), S = back(hr('steel', STEEL, 0.2), 0.1);
  g.fillStyle = A[2]; g.beginPath(); g.ellipse(0, 0, 54, 5, 0, 0, Math.PI * 2); g.fill(); checker(g, -48, -2, 96, 2, A[3]);
  // (the back and arms: char over a charred frame, the fabric burnt off in holes)
  box(g, -46, -44, 92, 20, INK); box(g, -45, -43, 90, 18, C[3]); box(g, -45, -43, 90, 2, C[5]); checker(g, -45, -34, 90, 2, C[2]);
  box(g, -50, -34, 12, 34, INK); box(g, -49, -33, 10, 32, C[2]); box(g, -49, -33, 10, 2, C[4]);
  box(g, 38, -34, 12, 34, INK); box(g, 39, -33, 10, 32, C[2]); box(g, 39, -33, 10, 2, C[4]);
  box(g, -38, -26, 76, 22, INK); box(g, -37, -25, 74, 20, C[1]);
  // (the springs: coils bare, rusted)
  g.strokeStyle = R[4]; g.lineWidth = 1;
  for (let k = 0; k < 6; k++) { const sx = -30 + k * 12; for (let t = 0; t < 3; t++) { g.beginPath(); g.ellipse(sx, -20 + t * 4, 4, 1.5, 0, 0, Math.PI * 2); g.stroke(); } }
  box(g, -36, -27, 72, 1, S[4]);
  // (a scrap of its plaid left on an arm, a slumped cushion, burnt black at its edge)
  box(g, 39, -30, 9, 10, '#7A3A2A'); box(g, 39, -27, 9, 1, '#C8A048'); box(g, 42, -30, 1, 10, '#2A4A3A'); box(g, 39, -20, 9, 2, C[0]);
  box(g, -30, -12, 26, 10, INK); box(g, -29, -11, 24, 8, '#5A4A3A'); box(g, -29, -11, 24, 2, '#7A6A54'); box(g, -29, -5, 24, 2, C[1]);
  for (let k = 0; k < 8; k++) box(g, -44 + hash(k * 2.1) * 88, -40 + hash(k * 3.3) * 10, 3, 2, A[4]);
};
/** The fire ring: a ring of creek rocks, char and half-burnt wood, the ash; beer cans round it. */
const paintFireRing = (g: Ctx) => {
  const Gr = back(hr('granite', GRANITE, 0.2), 0.08), C = back(CHAR, 0.08), A = back(ASH, 0.08), B = back(hr('bark', BARK, 0.2), 0.08);
  g.fillStyle = C[2]; g.beginPath(); g.ellipse(0, -3, 24, 5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = A[2]; g.beginPath(); g.ellipse(-2, -4, 16, 3, 0, 0, Math.PI * 2); g.fill(); checker(g, -14, -5, 26, 2, A[3]);
  // (the half-burnt sticks crossed in it)
  box(g, -16, -9, 26, 4, INK); box(g, -15, -8, 24, 2, B[3]); box(g, 4, -8, 5, 2, C[1]);
  box(g, -6, -12, 4, 9, INK); box(g, -5, -11, 2, 7, B[2]); box(g, -5, -11, 2, 2, C[1]);
  // (the rocks round it: back ones first)
  for (let k = 0; k < 11; k++) {
    const a = Math.PI + (k / 11) * Math.PI * 2, rx = Math.cos(a) * 26, ry = -3 + Math.sin(a) * 6, r = 5 + hash(k) * 3;
    g.fillStyle = INK; g.beginPath(); g.ellipse(rx, ry, r + 1, r * 0.7 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Gr[2 + (k % 3)]; g.beginPath(); g.ellipse(rx, ry, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
    box(g, rx - r * 0.5, ry - r * 0.5, r * 0.7, 1, Gr[6]);
    if (k % 3 === 0) box(g, rx - 2, ry - r * 0.6, 4, 2, C[2]);
  }
  // (the cans: crushed, standing, one shot through)
  const cans: [number, number, string, boolean][] = [[-38, 6, '#C8302A', true], [-22, 9, '#E8E8F0', false], [30, 8, '#2A6AC8', true], [42, 4, '#E8E8F0', true], [12, 10, '#C8A030', false]];
  for (const [cx, cy, col, down] of cans) can(g, cx, cy, col, down);
};
/** The boulder the kids tagged: granite, sprayed DIRT RATS, a heart, initials, a crude face. */
const paintTagRock = (g: Ctx) => {
  const Gr = back(hr('granite', GRANITE, 0.2), 0.14), Ms = back(hr('moss', MOSS, 0.2), 0.14);
  const pts: [number, number][] = [[-64, 0], [-60, -40], [-44, -78], [-12, -96], [24, -92], [52, -66], [64, -30], [66, 0]];
  g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 1) : g.moveTo(x - 1, y))); g.closePath(); g.fill();
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  for (let i = 0; i < 7; i++) box(g, -70, -100 + i * 15, 140, 16, [Gr[5], Gr[4], Gr[4], Gr[3], Gr[3], Gr[2], Gr[2]][i]);
  checker(g, -70, -55, 140, 2, Gr[3]);
  g.fillStyle = Gr[1]; g.beginPath(); g.moveTo(24, -92); g.lineTo(52, -66); g.lineTo(66, 0); g.lineTo(30, 0); g.lineTo(36, -50); g.closePath(); g.fill();
  checker(g, 26, -70, 14, 70, Gr[2], 0);
  for (let n = 0; n < 12; n++) { const lx = -50 + hash(n * 2.7) * 100, ly = -90 + hash(n * 4.1) * 80; box(g, lx, ly, 3, 2, n % 3 ? '#B8BC8A' : '#D8C878'); }
  box(g, -60, -10, 40, 10, Ms[3]); box(g, -58, -12, 20, 2, Ms[5]);
  g.restore();
  // (the tags over it: DIRT RATS big, a heart with initials, a smiley, someone's name crossed out)
  signText(g, 'DIRT', -2, -58, sprayed('#E8409A', 2, '#1A1A1A', 5));
  signText(g, 'RATS', 2, -36, sprayed('#2AD0E8', 2, '#1A1A1A', 9));
  g.strokeStyle = '#E8E4DA'; g.lineWidth = 2; g.beginPath(); g.moveTo(-44, -18); g.bezierCurveTo(-52, -28, -38, -32, -38, -22); g.bezierCurveTo(-38, -32, -24, -28, -32, -18); g.lineTo(-38, -10); g.closePath(); g.stroke();
  signText(g, 'JT+KM', -38, -2, sprayed('#E8E4DA', 1, undefined, 2));
  g.strokeStyle = '#F2C21A'; g.lineWidth = 2; g.beginPath(); g.arc(40, -16, 7, 0, Math.PI * 2); g.stroke(); box(g, 37, -19, 2, 2, '#F2C21A'); box(g, 42, -19, 2, 2, '#F2C21A'); g.beginPath(); g.arc(40, -15, 4, 0.2, Math.PI - 0.2); g.stroke();
};

const drawLot = (c: Ctx, v: View, f: number, lane: 1 | 2) => {
  const put = (rx: number, lane: number, key: string, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void, dy = 0) => {
    const L = LANES[lane], x = X(rx);
    if (x + (bx + bw) * L.s < v.cam.x - 60 || x + bx * L.s > v.cam.x + 860) return;
    c.save(); c.translate(x, L.y + dy); c.scale(L.s, L.s); stillAt(c, key, 0, 0, bx, by, bw, bh, paint); c.restore();
  };
  // (the tagged boulder and the couch on the far lane; the jumps, the ramp and the fire ring on the near one)
  if (lane === 2) {
    put(TAG_ROCK, 2, 'wd-tagrock', -72, -104, 144, 108, paintTagRock, 14);
    put(COUCH, 2, 'wd-couch', -58, -50, 116, 58, paintCouch, 18);
    return;
  }
  for (const m of MOUNDS) put(m, 1, 'wd-mound', -60, -44, 110, 46, paintMound);
  put(RAMP, 1, 'wd-ramp', -56, -32, 104, 36, paintRamp);
  put(FIRE, 1, 'wd-firering', -48, -18, 100, 32, paintFireRing, 6);
  // (a thin smoke still curling off the fire ring's ashes)
  const L = LANES[1], fx = X(FIRE), fy = L.y + 2;
  if (fx > v.cam.x - 60 && fx < v.cam.x + 860) for (let i = 0; i < 4; i++) {
    const t = ((f * 0.006 + i / 4) % 1);
    c.globalAlpha = 0.22 * (1 - t); pixelBlob(c, fx - 2 + Math.sin(t * 7 + i) * 6, fy - 8 - t * 70, 4 + t * 10, 3 + t * 6, '#C8C4BC'); c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The signs (real-world: printed, brushed on)

/** A real NO TRESPASSING sign nailed to a big fir's trunk (up out of the frame): printed orange plastic, black letters,
 *  a corner curled, buckshot through it, rust run down from the holes and the nails. */
const noTrespassing = (c: Ctx, x: number) => stillAt(c, 'wd-notrespass', x, GY, -60, -900, 120, 904, g => {
  const B = hr('bark', BARK, 0.2);
  // (the trunk: a big fir's, its bark in plates, flaring into its roots)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-15, -900); g.lineTo(15, -900); g.lineTo(18, -30); g.lineTo(34, 2); g.lineTo(-34, 2); g.lineTo(-18, -30); g.closePath(); g.fill();
  g.fillStyle = B[3]; g.beginPath(); g.moveTo(-14, -900); g.lineTo(14, -900); g.lineTo(17, -30); g.lineTo(32, 0); g.lineTo(-32, 0); g.lineTo(-17, -30); g.closePath(); g.fill();
  box(g, -14, -900, 7, 880, B[5]); box(g, -13, -900, 2, 880, B[6]); box(g, 7, -900, 7, 880, B[1]); checker(g, 3, -900, 4, 880, B[2]);
  for (let y = -892; y < -30; y += 10) { const px = -10 + ((y * 7) % 14 + 14) % 14; box(g, px, y, 6, 2, B[1]); box(g, px, y - 1, 6, 1, B[5]); }
  g.fillStyle = B[2]; g.beginPath(); g.moveTo(-17, -30); g.lineTo(-32, 0); g.lineTo(-20, 0); g.closePath(); g.fill();
  g.fillStyle = B[1]; g.beginPath(); g.moveTo(17, -30); g.lineTo(32, 0); g.lineTo(20, 0); g.closePath(); g.fill();
  box(g, -16, -24, 8, 6, hr('moss', MOSS, 0.2)[4]);
  // (the sign)
  const top = -170, w = 98, h = 58;
  box(g, -w / 2 - 1, top - 1, w + 2, h + 2, INK);
  box(g, -w / 2, top, w, h, '#E8661A'); box(g, -w / 2, top, w, 2, '#F8924A'); box(g, -w / 2, top + h - 2, w, 2, '#B4440E');
  box(g, -w / 2 + 3, top + 3, w - 6, h - 6, '#141414'); box(g, -w / 2 + 5, top + 5, w - 10, h - 10, '#F07222');
  checker(g, -w / 2 + 5, top + 5, w - 10, h - 10, '#E8661A', 0, 3);
  signText(g, 'NO', 0, top + 21, printed('#141414', 2));
  signText(g, 'TRESPASSING', 0, top + 33, printed('#141414'));
  signText(g, 'VIOLATORS WILL BE', 0, top + 43, printed('#141414'));
  signText(g, 'PROSECUTED', 0, top + 52, printed('#141414'));
  // (the curled corner, its back showing pale)
  g.fillStyle = INK; g.beginPath(); g.moveTo(w / 2 + 1, top + h - 13); g.lineTo(w / 2 + 1, top + h + 1); g.lineTo(w / 2 - 13, top + h + 1); g.closePath(); g.fill();
  g.fillStyle = '#E8DCC8'; g.beginPath(); g.moveTo(w / 2 - 1, top + h - 11); g.lineTo(w / 2 - 11, top + h - 1); g.lineTo(w / 2 - 4, top + h - 4); g.closePath(); g.fill();
  // (the nails; the buckshot pattern, each hole punched in, rust run down from it)
  for (const [nx, ny] of [[-45, 4], [43, 4], [-45, 52]] as const) { box(g, nx, top + ny, 3, 3, INK); box(g, nx, top + ny, 2, 2, '#8A8A90'); box(g, nx + 1, top + ny + 3, 1, 6, '#8A3A12'); }
  for (const [hx, hy] of [[-30, 12], [-26, 18], [-20, 10], [-33, 22], [-15, 16], [18, 44], [24, 40], [30, 47], [8, 14], [-6, 26], [34, 36], [14, 50]] as const) {
    box(g, hx - 1, top + hy - 1, 3, 3, '#F8B070'); box(g, hx, top + hy, 2, 2, INK); box(g, hx + 1, top + hy + 2, 1, 3 + ((hx * 7) & 3), '#9A3A12');
  }
});

/** NO DUMPING, on a U-channel post in the middle of the dumped trash. */
const noDumping = (c: Ctx, x: number) => stillAt(c, 'wd-nodump', x, GY, -34, -106, 68, 108, g => {
  const S = hr('steel', STEEL, 0.2);
  box(g, -3, -96, 6, 96, INK); box(g, -2, -96, 4, 96, S[4]); box(g, -2, -96, 1, 96, S[6]); box(g, 1, -96, 1, 96, S[2]);
  for (let y = -90; y < -4; y += 8) box(g, -1, y, 2, 2, S[1]);
  g.save(); g.translate(0, -78); g.rotate(0.06);
  box(g, -29, -24, 58, 40, INK); box(g, -28, -23, 56, 38, '#ECEAE2'); box(g, -28, -23, 56, 2, '#FFFFFF'); box(g, -28, 13, 56, 2, '#C8C4B8');
  box(g, -25, -20, 50, 32, '#C81E1E'); box(g, -23, -18, 46, 28, '#ECEAE2');
  signText(g, 'NO', 0, -9, printed('#C81E1E', 1));
  signText(g, 'DUMPING', 0, 0, printed('#141414', 1));
  signText(g, '$500 FINE', 0, 9, printed('#141414', 1));
  box(g, -24, -14, 8, 8, '#141414'); box(g, -23, -13, 6, 6, '#ECEAE2');
  for (const [hx, hy] of [[-10, -16], [14, 6], [20, -12]] as const) { box(g, hx, hy, 2, 2, INK); box(g, hx + 1, hy + 2, 1, 3, '#9A3A12'); }
  box(g, -2, -22, 3, 3, S[2]); box(g, -2, 10, 3, 3, S[2]);
  g.restore();
});

/** The scout troop's warning: a plank on a stake, hand-painted with a brush, the three leaves drawn on. */
const scoutSign = (c: Ctx, x: number) => stillAt(c, 'wd-scout', x, GY, -60, -84, 120, 88, g => {
  const B = hr('bark', BARK, 0.2), P = hr('ply', PLY, 0.2), D = hr('dirt', DIRT, 0.2);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 10, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = D[3]; g.beginPath(); g.ellipse(0, 0, 9, 2, 0, Math.PI, 0); g.fill();
  box(g, -3, -78, 6, 78, INK); box(g, -2, -78, 4, 78, B[4]); box(g, -2, -78, 1, 78, B[6]); box(g, 1, -78, 1, 78, B[2]);
  const top = -78, w = 108, h = 36;
  box(g, -w / 2 - 1, top - 1, w + 2, h + 2, INK); box(g, -w / 2, top, w, h, P[3]); box(g, -w / 2, top, w, 2, P[5]); box(g, -w / 2, top + h - 2, w, 2, P[1]);
  for (let gy = top + 4; gy < top + h - 3; gy += 4) box(g, -w / 2 + 3 + hash(gy) * 12, gy, w * (0.3 + hash(gy * 3) * 0.4), 1, P[2]);
  box(g, -w / 2 + 3, top + 3, w - 6, h - 6, '#2E5A2A'); box(g, -w / 2 + 3, top + 3, w - 6, 1, '#447A3A');
  signText(g, 'LEAVES OF THREE', 8, top + 15, brush('#F2EEDC'));
  signText(g, 'LET IT BE!', 8, top + 27, brush('#F2EEDC'));
  for (const [dx, dy] of [[-5, 1], [5, 1], [0, -6]] as const) { g.fillStyle = '#F2EEDC'; g.beginPath(); g.ellipse(-42 + dx, top + 20 + dy, 4.4, 3, dx * 0.15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C83A2A'; g.fillRect(-42 + dx * 0.4, top + 20 + dy * 0.4, 1, 3); }
  signText(g, 'TROOP 41', 30, top + h + 9, brush('#2E5A2A'));
  for (const nx of [-w / 2 + 4, w / 2 - 6]) box(g, nx, top + h / 2 - 1, 2, 2, STEEL[2]);
});

// ---------------------------------------------------------------------------------------------------------------
// What he can stand on (lit along its top)

/** The fallen tree over the trail: a real fir's trunk down, its bark in plates, snapped limbs, the root wad torn up at
 *  its left end, the snapped end splintered at its right, moss on its back; its top lit (his to stand on). */
const fallenTree = (c: Ctx) => {
  const [a, b, h] = FALLEN, xa = X(a), w = b - a;
  stillAt(c, 'wd-fallen', xa, GY, -46, -h - 30, w + 70, h + 34, g => {
    const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2), Ms = hr('moss', MOSS, 0.2), L = hr('lip', LIP, 0.2), D = hr('dirt', DIRT, 0.2);
    // (the root wad: a torn-up plate of roots and dirt, splayed, stones caught in it)
    g.fillStyle = INK; g.beginPath(); g.ellipse(-8, -h / 2 - 4, 22, h / 2 + 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = D[2]; g.beginPath(); g.ellipse(-8, -h / 2 - 4, 20, h / 2 + 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = D[3]; g.beginPath(); g.ellipse(-12, -h / 2 - 10, 12, h / 2 + 6, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 9; k++) { const an = -Math.PI * 0.9 + (k / 8) * Math.PI * 1.6, r = 18 + hash(k) * 10; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-8, -h / 2 - 4); g.lineTo(-8 + Math.cos(an) * r * 1.2, -h / 2 - 4 + Math.sin(an) * r * 1.3); g.stroke(); g.strokeStyle = B[2]; g.lineWidth = 1.5; g.stroke(); }
    for (let k = 0; k < 4; k++) { box(g, -20 + hash(k * 3) * 22, -h - 6 + hash(k * 5) * 30, 5, 4, INK); box(g, -19 + hash(k * 3) * 22, -h - 5 + hash(k * 5) * 30, 3, 2, hr('granite', GRANITE, 0.2)[4]); }
    // (the trunk: banded round, bark plates, snapped limb stubs)
    box(g, 0, -h - 1, w, h + 1, INK);
    const rows = [B[5], B[4], B[4], B[3], B[3], B[2], B[2], B[1]];
    for (let i = 0; i < rows.length; i++) box(g, 1, -h + (i * h) / rows.length, w - 2, h / rows.length + 1, rows[i]);
    checker(g, 1, -h * 0.4, w - 2, 2, B[3]);
    for (let y = -h + 6; y < -3; y += 6) for (let x = 3 + ((y * 5) & 7); x < w - 8; x += 14 + ((x * 3) & 5)) { box(g, x, y, 9, 1, B[1]); box(g, x, y - 1, 9, 1, B[5]); }
    for (const [lx, up] of [[30, 1], [64, -1]] as const) { box(g, lx - 1, up > 0 ? -h - 9 : -10, 6, 9, INK); box(g, lx, up > 0 ? -h - 8 : -9, 4, 8, B[3]); box(g, lx, up > 0 ? -h - 8 : -9, 4, 1, Rg[3]); }
    // (moss on its back)
    for (let x = 6; x < w - 10; x += 9) if (hash(x) > 0.4) { box(g, x, -h + 1, 7, 2, Ms[4]); box(g, x + 1, -h, 4, 1, Ms[6]); }
    // (the lit lip along its top)
    box(g, 1, -h, w - 2, 1, L[3]); box(g, 1, -h + 1, w - 2, 1, L[2]);
    // (the snapped end: splinters, the rings)
    g.fillStyle = INK; g.beginPath(); g.ellipse(w, -h / 2, 8, h / 2 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Rg[3]; g.beginPath(); g.ellipse(w, -h / 2, 7, h / 2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Rg[1]; g.lineWidth = 1; for (const rr of [0.7, 0.4]) { g.beginPath(); g.ellipse(w, -h / 2, 7 * rr, (h / 2) * rr, 0, 0, Math.PI * 2); g.stroke(); }
    for (let k = 0; k < 5; k++) { const sy = -h + 3 + k * (h / 5); g.fillStyle = INK; g.beginPath(); g.moveTo(w + 4, sy); g.lineTo(w + 14 + hash(k) * 8, sy + 2); g.lineTo(w + 4, sy + 4); g.closePath(); g.fill(); g.fillStyle = Rg[4]; g.beginPath(); g.moveTo(w + 4, sy + 1); g.lineTo(w + 11 + hash(k) * 8, sy + 2); g.lineTo(w + 4, sy + 3); g.closePath(); g.fill(); }
  });
};

/** The boulder before the wider ivy (stand on it, jump from it): real granite, lichen, moss in its cracks, lit on top. */
const boulder = (c: Ctx, v: View) => {
  const [a, b, h] = BOULDER, xa = X(a), w = b - a;
  const pts: [number, number][] = [[-2, 1], [2, -h * 0.55], [8, -h + 4], [22, -h - 2], [w - 22, -h - 1], [w - 6, -h + 6], [w + 2, -h * 0.5], [w + 3, 1]];
  // (its bulk going back: its top lit, its sides shaded, on the side he's looking at (it was a flat front))
  const Gr = hr('granite', GRANITE, 0.2);
  extrude(c, v.eye, pts.map(([x, y]) => [xa + x, GY + y] as [number, number]), 0.93, Gr[4], Gr[1]);
  stillAt(c, 'wd-boulder', xa, GY, -6, -h - 8, w + 12, h + 10, g => {
    const G = hr('granite', GRANITE, 0.2), Ms = hr('moss', MOSS, 0.2), L = hr('lip', LIP, 0.2);
    g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y - 1) : g.moveTo(x - 1, y))); g.closePath(); g.fill();
    g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    for (let i = 0; i < 6; i++) box(g, -4, -h - 4 + (i * (h + 6)) / 6, w + 10, (h + 6) / 6 + 1, [G[5], G[4], G[4], G[3], G[3], G[2]][i]);
    checker(g, -4, -h * 0.45, w + 10, 2, G[3]);
    g.fillStyle = G[1]; g.beginPath(); g.moveTo(w - 22, -h - 1); g.lineTo(w - 6, -h + 6); g.lineTo(w + 3, 1); g.lineTo(w - 18, 1); g.lineTo(w - 14, -h * 0.5); g.closePath(); g.fill();
    checker(g, w - 24, -h * 0.8, 8, h, G[2], 0);
    // (a crack, moss in it; lichen)
    g.strokeStyle = G[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(26, -h); g.lineTo(32, -h * 0.6); g.lineTo(28, -h * 0.2); g.lineTo(34, 0); g.stroke();
    box(g, 27, -h * 0.55, 5, 3, Ms[4]); box(g, 29, -h * 0.3, 4, 2, Ms[5]);
    for (let n = 0; n < 8; n++) box(g, 6 + hash(n * 2.3) * (w - 16), -h + 6 + hash(n * 4.1) * (h - 10), 3, 2, n % 2 ? '#B8BC8A' : '#D8C878');
    box(g, 2, -10, 20, 10, Ms[3]); box(g, 4, -11, 12, 2, Ms[5]);
    g.restore();
    // (the lit lip along its top)
    box(g, 22, -h - 2, w - 44, 1, L[3]); box(g, 22, -h - 1, w - 44, 1, L[2]); box(g, 10, -h + 3, 12, 1, L[2]); box(g, w - 22, -h, 14, 1, L[2]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The litter (the playtest's: lots of it; set dressing only: none in the ivy, on the trap or in the way)

/** How far back each kind lies (the far side's big dumped stuff back on the ground going back). */
const litterDepth = (what: Litter) => (what === 'mattress' || what === 'cooler' || what === 'tires' ? TRASH_D : what === 'tv' || what === 'cart' ? SIGN_D : 1);

const can = (g: Ctx, x: number, y: number, col: string, down: boolean) => {
  const lt = mix(col, '#FFFFFF', 0.4), dk = mix(col, '#000000', 0.35);
  if (down) { box(g, x - 6, y - 5, 12, 6, INK); box(g, x - 5, y - 4, 10, 4, col); box(g, x - 5, y - 4, 10, 1, lt); box(g, x - 5, y - 1, 10, 1, dk); box(g, x + 4, y - 4, 1, 4, '#C8CCD2'); box(g, x - 2, y - 3, 3, 1, '#F4F4F4'); }
  else { box(g, x - 4, y - 10, 8, 10, INK); box(g, x - 3, y - 9, 6, 8, col); box(g, x - 3, y - 9, 2, 8, lt); box(g, x + 1, y - 9, 2, 8, dk); box(g, x - 3, y - 9, 6, 1, '#D8DCE2'); box(g, x - 3, y - 2, 6, 1, '#A8ACB2'); }
};
const paintLitter = (g: Ctx, what: Litter) => {
  const S = hr('steel', STEEL, 0.2), D = hr('dirt', DIRT, 0.2);
  switch (what) {
    case 'can': can(g, 0, 0, '#C8302A', true); return;
    case 'cans': can(g, -9, 0, '#E8E8F0', false); can(g, 0, 0, '#C8302A', true); can(g, 10, 0, '#2A6AC8', true); return;
    case 'bottle': box(g, -8, -4, 16, 5, INK); box(g, -7, -3, 11, 3, '#1E7A3A'); box(g, -7, -3, 11, 1, '#5AC07A'); box(g, 4, -2, 3, 1, '#1E7A3A'); box(g, -4, -3, 4, 2, '#E8DCB0'); return;
    case 'bag': g.fillStyle = INK; g.beginPath(); g.moveTo(-9, 0); g.lineTo(-7, -7); g.lineTo(4, -9); g.lineTo(9, 0); g.closePath(); g.fill(); g.fillStyle = '#E8ECEE'; g.beginPath(); g.moveTo(-8, -1); g.lineTo(-6, -6); g.lineTo(4, -8); g.lineTo(8, -1); g.closePath(); g.fill(); box(g, -4, -5, 6, 2, '#C81E1E'); box(g, -5, -6, 4, 1, '#FFFFFF'); return;
    case 'tire':
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -8, 19, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#26262C'; g.beginPath(); g.ellipse(0, -8, 17, 8, 0, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 10; k++) { const an = (k / 10) * Math.PI * 2; box(g, Math.cos(an) * 14 - 1, -8 + Math.sin(an) * 6.5 - 1, 2, 2, '#3A3A42'); }
      g.fillStyle = '#4A4A54'; g.beginPath(); g.ellipse(-4, -12, 9, 2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = D[2]; g.beginPath(); g.ellipse(0, -8, 8, 3, 0, 0, Math.PI * 2); g.fill();
      box(g, -6, -9, 4, 1, '#3A5AA0');
      return;
    case 'mattress':
      // (dumped in the leaves, stained, a spring through it)
      box(g, -42, -14, 84, 14, INK); box(g, -41, -13, 82, 12, '#E2DACA'); box(g, -41, -13, 82, 2, '#F2ECDE'); box(g, -41, -3, 82, 2, '#B8AE98');
      for (let k = 0; k < 6; k++) { box(g, -36 + k * 14, -11, 2, 7, '#C8BFA8'); box(g, -36 + k * 14, -8, 2, 1, '#9C927C'); }
      g.fillStyle = '#A8781E'; g.beginPath(); g.ellipse(6, -8, 13, 3.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C89A3A'; g.beginPath(); g.ellipse(4, -9, 7, 1.5, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); g.ellipse(-22, -15, 3, 2, 0, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 6; k++) box(g, -40 + hash(k) * 80, -14 - hash(k * 3) * 2, 3, 2, '#B46A10');
      return;
    case 'cart':
      // (a shopping cart on its side, a wheel up, a bag snagged in it)
      g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-24, -28, 44, 22); g.strokeStyle = S[5]; g.lineWidth = 1.5; g.strokeRect(-24, -28, 44, 22);
      g.lineWidth = 1; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(-24 + k * 7.3, -28); g.lineTo(-24 + k * 7.3, -6); g.stroke(); }
      for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(-24, -28 + k * 7.3); g.lineTo(20, -28 + k * 7.3); g.stroke(); }
      box(g, 20, -30, 4, 26, INK); box(g, 21, -29, 2, 24, '#C81E1E');
      for (const [wx, wy] of [[-20, -2], [16, -2], [-26, -32]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(wx, wy, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3A3A42'; g.beginPath(); g.arc(wx, wy, 2, 0, Math.PI * 2); g.fill(); }
      box(g, -10, -20, 10, 8, '#E8ECEE'); box(g, -8, -18, 5, 2, '#2A6AC8');
      return;
    case 'tv':
      // (a busted tube TV: wood-grain cabinet, the screen kicked in, the dials)
      box(g, -24, -40, 48, 38, INK); box(g, -23, -39, 46, 36, '#6A4A2A'); box(g, -23, -39, 46, 2, '#8A6A44'); for (let y = -35; y < -4; y += 4) box(g, -22, y, 44, 1, '#5A3C20');
      box(g, -19, -35, 30, 26, INK); box(g, -18, -34, 28, 24, '#1E2830'); box(g, -18, -34, 8, 6, '#4A5A64');
      g.strokeStyle = '#C8D4DC'; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, -30); g.lineTo(-4, -22); g.lineTo(4, -30); g.moveTo(-4, -22); g.lineTo(-6, -12); g.moveTo(-4, -22); g.lineTo(6, -16); g.stroke();
      for (const dy of [-32, -24]) { box(g, 13, dy, 6, 6, INK); box(g, 14, dy + 1, 4, 4, '#A8A49C'); box(g, 14, dy + 1, 2, 1, '#E8E4DC'); }
      box(g, 12, -14, 8, 6, '#2A2A2A'); box(g, -20, -2, 6, 2, INK); box(g, 14, -2, 6, 2, INK);
      return;
    case 'bottles':
      for (const [dx, col, up] of [[-9, '#7A2E12', true], [0, '#1E7A3A', false], [9, '#8A4A12', true]] as const) {
        if (up) { box(g, dx - 3, -13, 7, 13, INK); box(g, dx - 2, -12, 5, 11, col); box(g, dx - 1, -16, 3, 4, INK); box(g, dx, -16, 1, 4, col); box(g, dx - 2, -12, 1, 11, mix(col, '#FFFFFF', 0.4)); box(g, dx - 2, -8, 5, 3, '#E8DCB0'); }
        else { box(g, dx - 7, -5, 14, 5, INK); box(g, dx - 6, -4, 10, 3, col); box(g, dx - 6, -4, 10, 1, mix(col, '#FFFFFF', 0.4)); box(g, dx + 4, -3, 3, 1, col); }
      }
      for (let k = 0; k < 5; k++) box(g, 13 + k * 3, -1 - (k % 2), 2, 1, k % 2 ? '#86EFAC' : '#3A9A5A');
      return;
    case 'fastfood':
      box(g, -11, -13, 13, 13, INK); box(g, -10, -12, 11, 12, '#D6B88A'); box(g, -10, -12, 11, 2, '#E8D0A4'); box(g, -10, -12, 2, 12, '#C8A878'); box(g, -8, -8, 7, 4, '#C81E1E'); box(g, -7, -7, 5, 1, '#F2C21A');
      box(g, 4, -11, 9, 11, INK); box(g, 5, -10, 7, 10, '#F4F4F0'); box(g, 5, -6, 7, 2, '#C81E1E'); box(g, 5, -10, 2, 10, '#FFFFFF'); box(g, 8, -15, 2, 6, '#F2A01A');
      for (let k = 0; k < 6; k++) box(g, -17 + k * 4, -1 - (k % 2), 3, 1, '#F2C21A');
      return;
    case 'cup':
      box(g, -7, -5, 14, 6, INK); box(g, -6, -4, 12, 4, '#F4F4F0'); box(g, -6, -4, 12, 1, '#FFFFFF'); box(g, -1, -4, 4, 4, '#C81E1E'); box(g, 6, -6, 5, 1, '#F2A01A');
      return;
    case 'pizza':
      box(g, -15, -4, 30, 5, INK); box(g, -14, -3, 28, 3, '#E2D2A8'); g.fillStyle = '#A8781E'; g.beginPath(); g.ellipse(3, -2, 7, 1.4, 0, 0, Math.PI * 2); g.fill();
      box(g, -15, -17, 4, 14, INK); box(g, -14, -16, 2, 12, '#E2D2A8'); box(g, -14, -12, 2, 3, '#C81E1E');
      box(g, -4, -5, 9, 2, '#D98A2A'); box(g, -4, -5, 9, 1, '#F2B44A');
      return;
    case 'cooler':
      // (a busted cooler, its lid off, a can still in it)
      box(g, -19, -20, 38, 20, INK); box(g, -18, -19, 36, 18, '#E8E8E0'); box(g, -18, -19, 36, 4, '#2A6AC8'); box(g, -18, -15, 36, 1, '#1A4A98'); box(g, -18, -3, 36, 2, '#B8B8B0'); box(g, -14, -12, 10, 2, '#B8B8B0');
      box(g, 18, -6, 24, 5, INK); box(g, 19, -5, 22, 3, '#E8E8E0'); box(g, 19, -5, 22, 1, '#2A6AC8');
      can(g, -6, -18, '#E8E8F0', false);
      return;
    case 'tires':
      for (let k = 0; k < 3; k++) {
        const y = -9 - k * 10;
        g.fillStyle = INK; g.beginPath(); g.ellipse(0, y, 20, 7, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#26262C'; g.beginPath(); g.ellipse(0, y, 18, 5.5, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#3E3E46'; g.beginPath(); g.ellipse(-5, y - 2, 9, 1.5, 0, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#141418'; g.beginPath(); g.ellipse(0, -29, 9, 2.5, 0, 0, Math.PI * 2); g.fill();
      return;
  }
};
const litter = (c: Ctx, x: number, what: Litter) => stillAt(c, `wd-litter-${what}`, x, GY, -46, -46, 92, 50, g => paintLitter(g, what));

// ---------------------------------------------------------------------------------------------------------------
// The leaf pile, the sulking kid

/** The leaf pile (the jumpscare's): a heap of turned aspen and cottonwood leaves raked up by the trail. */
const paintPile = (g: Ctx) => {
  const G = hr('gold', GOLD, 0.2), Br = hr('brown', BROWN, 0.2);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -1, 54, 26, 0, Math.PI, 0); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, -1, 52, 24, 0, Math.PI, 0); g.closePath(); g.clip();
  for (let i = 0; i < 6; i++) box(g, -54, -26 + i * 4.5, 108, 5, [G[4], G[3], G[3], Br[4], Br[3], Br[2]][i]);
  checker(g, -54, -12, 108, 2, Br[4]);
  g.restore();
  // (the leaves over it, one by one, lit up top)
  for (let i = 0; i < 70; i++) {
    const an = Math.PI + hash(i * 1.7) * Math.PI, r = Math.sqrt(hash(i * 2.9)) * 0.96;
    const x = Math.cos(an) * 50 * r, y = -1 + Math.sin(an) * 23 * r;
    leafAt(g, x, y, 3 + hash(i) * 2, hash(i * 3.3) * 6, y < -12 ? G : hash(i * 5.1) > 0.5 ? Br : G);
  }
  for (let i = 0; i < 10; i++) leafAt(g, -56 + i * 12 + hash(i) * 6, -1, 3, hash(i * 7) * 3, i % 2 ? Br : G);
};
const paintPileBurst = (g: Ctx) => {
  const G = hr('gold', GOLD, 0.2), Br = hr('brown', BROWN, 0.2), D = hr('duff', DUFF, 0.2);
  g.fillStyle = D[1]; g.beginPath(); g.ellipse(0, 0, 30, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D[2]; g.beginPath(); g.ellipse(0, -1, 22, 2, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 30; i++) leafAt(g, -80 + hash(i * 1.3) * 160, -1 + hash(i * 2.1) * 2, 3 + hash(i) * 1.5, hash(i * 3.7) * 6, i % 3 ? G : Br);
};

export const drawPile = (c: Ctx, state: GameState, burst: boolean, shiver: number) => {
  const x = X(PILE);
  if (x < state.camera.x - 100 || x > state.camera.x + 900) return;
  if (burst) { stillAt(c, 'wd-pile-burst', x, GY, -90, -8, 180, 12, paintPileBurst); return; }
  const sh = shiver > 0 ? Math.round(Math.sin(shiver * 1.6) * 2) : 0;
  stillAt(c, 'wd-pile', x + sh, GY, -60, -30, 120, 34, paintPile);
};

/** After the bounty: the kid he kicked off his bike, sulking on a stump by the trail. */
export const drawSulk = (c: Ctx, state: GameState, seed: number, talking: boolean) => {
  const x = X(SULK);
  if (x < state.camera.x - 80 || x > state.camera.x + 880) return;
  stillAt(c, 'wd-stump', x, GY, -20, -24, 40, 26, g => {
    const B = hr('bark', BARK, 0.2), Rg = hr('rings', RINGS, 0.2);
    box(g, -16, -18, 32, 18, INK); box(g, -15, -17, 30, 17, B[3]); box(g, -15, -17, 8, 17, B[5]); box(g, 8, -17, 7, 17, B[1]);
    for (let y = -14; y < -1; y += 4) box(g, -12 + ((y * 5) & 7), y, 3, 2, B[2]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -18, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Rg[3]; g.beginPath(); g.ellipse(0, -18, 15, 3, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Rg[1]; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -18, 9, 1.8, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(0, -18, 4, 0.9, 0, 0, Math.PI * 2); g.stroke();
    box(g, -18, -2, 6, 2, B[2]); box(g, 13, -2, 6, 2, B[2]);
  });
  c.save(); c.translate(x, GY - 16);
  const p = state.player, facing = p.pos.x + p.width / 2 < x ? -1 : 1;
  c.scale(facing, 1);
  drawTeenPerson(c, teenOf(seed), state.frame, 'sit', 'angry', talking);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// In front of him

/** Near trunks, nearer than the trail (dark, brought forward toward the eye): never over the lot, the signs or the
 *  hazards. And the dead end's brush, at the left end. */
const FRONT: [number, number][] = [[180, 1.12], [470, 1.12], [1160, 1.08]];
export const drawWoodsFront = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  drawDeadEndFront(c, v);
  for (const [rx, d] of FRONT) {
    const [sx] = at(v.eye, X(rx), GY, d);
    if (sx < v.cam.x - 60 || sx > v.cam.x + 860) continue;
    atDepth(c, v.eye, d, () => stillAt(c, `wd-near-${rx}`, X(rx), GY, -40, -700, 80, 740, g => {
      const B = hr('bark', BARK, 0.2).map(col => mix(col, '#080604', 0.55)), N = firOf(hr('needle', NEEDLE, 0.2)).map(col => mix(col, '#040604', 0.5));
      g.fillStyle = INK; g.beginPath(); g.moveTo(-17, -700); g.lineTo(17, -700); g.lineTo(20, -10); g.lineTo(30, 40); g.lineTo(-30, 40); g.lineTo(-20, -10); g.closePath(); g.fill();
      box(g, -16, -700, 32, 740, B[3]); box(g, -16, -700, 7, 740, B[5]); box(g, 9, -700, 7, 740, B[1]); checker(g, 5, -700, 4, 740, B[2]);
      // (the bark in long plates: fissures running up it, each plate lit down its left edge and shaded under its
      // foot, broken where they end; moss up its shaded side near the ground, lichen flecks)
      for (let col = 0; col < 5; col++) {
        const px = -15 + col * 6 + (col % 2);
        for (let y = -700 + Math.round(hash(rx + col) * 30), k = 0; y < 30; k++) {
          const ph = 22 + Math.round(hash(rx * 0.1 + col * 3.1 + k * 1.7) * 30);
          box(g, px, y, 1, ph, B[0]); box(g, px + 1, y, 1, ph - 3, col < 2 ? B[5] : B[4]); box(g, px + 1, y + ph - 3, 4, 2, B[1]); box(g, px + 1, y + ph - 1, 4, 1, B[0]);
          y += ph + 2;
        }
      }
      const M = hr('moss', MOSS, 0.2).map(col => mix(col, '#040604', 0.45));
      for (let y = -120; y < 30; y += 3) { const mw = Math.round(3 + (y + 120) * 0.04 + hash(rx + y) * 3); box(g, 16 - mw, y, mw, 3, M[Math.min(M.length - 1, 2 + ((y >> 2) % 2))]); }
      for (let k = 0; k < 18; k++) box(g, -14 + hash(rx + k * 2.3) * 26, -680 + hash(rx + k * 5.1) * 700, 2, 1, mix(B[4], '#9AA88A', 0.35));
      // (snapped-off limbs, dead, a tuft of needles left on one)
      for (const [ly, s] of [[-520, -1], [-430, 1], [-360, -1]] as const) { box(g, s > 0 ? 14 : -40, ly, 26, 5, INK); box(g, s > 0 ? 15 : -39, ly + 1, 24, 3, B[3]); box(g, s > 0 ? 15 : -39, ly + 1, 24, 1, B[4]); }
      for (let k = 0; k < 8; k++) box(g, -46 + k * 3, -526 + (k % 3) * 3, 3, 4, N[2 + (k % 2)]);
    }));
  }
};
