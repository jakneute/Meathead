// The tour's other bits of show along the far bank, between the elephant and the signs (all the park's cheap
// fiberglass: animatronics moving in steps, their seams and bolts showing, the paint gone glossy and chipped): the
// crocodiles on the mud (a jaw on a hinge, a tail on a motor, the last guide's hat in one's mouth), the safari party up
// the dead tree with the rhino under them (its horn up the lowest one's ass, on a loop, forever), and Trader Stan's
// souvenir hut (the old village's spot, under new management: Stan on his servo, waving a shrunken head keychain).
// Drawn at the bank's depth, its foot on the bank's mud (world units, the caller's in atDepth). Nothing here's stood on.

import { box, checker, hash, rampOf, sign, stamp, INK } from '../../intro/art/kit';
import { farTint, timeOfDay } from '../../timeOfDay';
import { signAt, carved, plank, print } from '../letters';
import { WS } from './course';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
/** The mud's top, where they stand. */
const FY = WS - 22;
const FT = 0.3;
const T = (col: string) => farTint(col, FT);
const R5 = (col: string) => rampOf(T(col));

const path = (c: Ctx, pts: Pt[]) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
/** A shape inked, then filled in bands down it (`order` picks the ramp's steps, top first), each seam dithered. */
const banded = (c: Ctx, shape: () => void, ya: number, yb: number, G: string[], order = [4, 3, 2, 2, 1, 0], xa = -400, xb = 400) => {
  c.save(); shape(); c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke(); c.clip();
  const n = order.length, h = (yb - ya) / n;
  for (let i = 0; i < n; i++) box(c, xa, ya + i * h, xb - xa, h + 1, G[order[i]]);
  for (let i = 1; i < n; i++) checker(c, xa, Math.floor((ya + i * h) / 2) * 2, xb - xa, 2, G[order[i - 1]]);
  c.restore();
};
/** An inked box, lit along its top and left, shaded down its right. */
const ib = (c: Ctx, x: number, y: number, w: number, h: number, G: string[]) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, G[2]);
  box(c, x, y, w, Math.min(2, h), G[3]); box(c, x, y, Math.min(2, w), h, G[3]); box(c, x + w - 2, y + 2, 2, h - 2, G[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The crocodiles

const crocAt = (c: Ctx, x: number, f: number, dir: 1 | -1, seed: number, hat: boolean) => {
  const G = R5('#4E6A2E'), B = R5('#B8B070'), st = (f >> 3) + seed * 5;
  // (the jaw: shut, cracking open in two steps, held, then dropping shut; the tail, swinging in three)
  const ph = st % 14, ang = ph < 1 ? 0.14 : ph < 4 ? 0.3 : ph < 5 ? 0.14 : 0;
  const sw = [0, 2, 4, 2, 0, -2, -4, -2][(st >> 1) % 8];
  c.save(); c.translate(x, FY); c.scale(dir, 1);
  // The tail: four pieces off the hip, each swung a step further than the last
  let tx = -58, ty = -6;
  for (let k = 0; k < 4; k++) {
    const nx = tx - 18, ny = -3 + Math.round(sw * (k + 1) * 0.5), hw = 7 - k * 1.6;
    banded(c, () => path(c, [[tx + 2, ty - hw], [nx, ny - hw * 0.6], [nx, ny + 2], [tx + 2, 0]]), Math.min(ty, ny) - 8, 2, G, [3, 2, 1, 0]);
    for (let s = 0; s < 3; s++) box(c, Math.round(tx - 4 - s * 6), Math.round(ty - hw - 2 + (ny - ty) * (s / 3)), 3, 2, G[4]);
    tx = nx; ty = ny;
  }
  // The far legs (shadowed), the body: low, long, its back in a row of scutes, its belly pale
  for (const lx of [-34, 22]) banded(c, () => path(c, [[lx - 4, -6], [lx + 6, -6], [lx + 10, 0], [lx - 8, 0]]), -6, 0, G, [1, 0]);
  const body: Pt[] = [[-62, -4], [-46, -15], [-10, -20], [26, -18], [42, -12], [44, -4], [36, 0], [-60, 0]];
  banded(c, () => path(c, body), -20, 0, G, [4, 3, 2, 2, 1, 0]);
  c.save(); path(c, body); c.clip(); box(c, -60, -5, 104, 5, B[2]); box(c, -60, -5, 104, 1, B[3]); checker(c, -60, -7, 104, 2, B[2]);
  // (the scale rows down its flank: stepped dashes)
  for (let r = 0; r < 2; r++) for (let k = -54; k < 36; k += 7) box(c, k + (r % 2) * 3, -14 + r * 5, 4, 1, G[1]);
  // (the fiberglass seam where its two halves were bolted up, the bolts)
  for (let y = -20; y < 0; y += 2) box(c, -4, y, 1, 2, G[0]);
  for (let y = -16; y < -4; y += 5) box(c, -3, y, 2, 2, T('#C8CCD2'));
  c.restore();
  for (let k = -52; k < 30; k += 8) { const y = Math.round(-15 - Math.sin(((k + 52) / 82) * Math.PI) * 4); box(c, k - 1, y - 2, 5, 3, INK); box(c, k, y - 1, 3, 2, G[3]); box(c, k, y - 1, 3, 1, G[4]); }
  // The near legs: splayed, the claws
  for (const lx of [-40, 16]) {
    banded(c, () => path(c, [[lx - 2, -8], [lx + 8, -8], [lx + 12, 0], [lx - 6, 0]]), -8, 0, G, [3, 2, 1]);
    for (let t = 0; t < 3; t++) box(c, lx - 4 + t * 5, -1, 3, 2, T('#E8E0C0'));
  }
  // The lower jaw, its teeth up
  banded(c, () => path(c, [[36, -9], [88, -7], [90, -3], [84, 0], [38, 0]]), -9, 0, G, [2, 1, 0]);
  // (the mouth, wide, when it's open: the pink of it, the throat's dark)
  if (ang > 0) {
    const ex = 40 + 48 * Math.cos(ang) + 3 * Math.sin(ang), ey = -12 - 48 * Math.sin(ang) + 3 * Math.cos(ang);
    path(c, [[40, -9], [86, -8], [ex, ey], [40, -9]]); c.fillStyle = T('#C8606A'); c.fill();
    path(c, [[40, -9], [56, -9], [40 + 16 * Math.cos(ang), -9 - 16 * Math.sin(ang)]]); c.fillStyle = T('#5A1A20'); c.fill();
  }
  for (let k = 46; k < 86; k += 6) box(c, k, -10, 2, 3, T('#F4F0E0'));
  // The upper jaw: on its hinge (the pin showing), swung up by `ang`; teeth down its edge; the eye's bump
  c.save(); c.translate(40, -12); c.rotate(-ang);
  banded(c, () => path(c, [[-6, -8], [16, -9], [48, -5], [52, -1], [48, 3], [0, 3]]), -9, 3, G, [4, 3, 2, 1]);
  for (let k = 8; k < 48; k += 6) { box(c, k, 3, 2, 3, T('#F4F0E0')); box(c, k, 3, 2, 1, '#FFFFFF'); }
  box(c, 44, -5, 2, 2, G[0]); box(c, 46, -5, 2, 2, G[0]);
  // (the eye: a bump, the yellow, the slit)
  box(c, 0, -13, 12, 7, INK); box(c, 1, -12, 10, 6, G[3]); box(c, 1, -12, 10, 2, G[4]);
  box(c, 4, -11, 6, 4, T('#E8C830')); box(c, 7, -11, 1, 4, INK);
  // (the last guide's pith helmet in its mouth: a bite out of it)
  if (hat) {
    const H = R5('#E0D4A8');
    c.fillStyle = INK; c.beginPath(); c.ellipse(28, 6, 15, 10, 0, Math.PI, 0); c.fill(); box(c, 10, 5, 36, 4, INK);
    c.fillStyle = H[2]; c.beginPath(); c.ellipse(28, 6, 13, 9, 0, Math.PI, 0); c.fill();
    c.fillStyle = H[3]; c.beginPath(); c.ellipse(25, 3, 7, 5, 0, Math.PI, 0); c.fill();
    box(c, 11, 6, 34, 2, H[1]); box(c, 16, 2, 24, 2, T('#6A4A2A'));
    box(c, 34, -2, 4, 3, G[2]);
  }
  c.restore();
  // The hinge pin, over it all
  box(c, 37, -15, 6, 6, INK); box(c, 38, -14, 4, 4, T('#9AA0A8')); box(c, 38, -14, 2, 2, T('#E0E4E8'));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The safari party up the tree (fiberglass tourists, seeded: men, women, skin tones, builds, hair) and the rhino

const SKINS = ['#F2C8A0', '#D8A070', '#A86A40', '#7A4A2A', '#5A3420', '#E8B890'];
const SHIRTS = ['#C8B070', '#6A8A4A', '#D86A3A', '#4A7AB0', '#E8E0C8', '#B04A6A'];
const HAIRS = ['#2A1A10', '#6A3A1A', '#C89A40', '#1A1A1A', '#8A8A8A', '#B05A20'];

/** One tourist clinging to the trunk (at x: the trunk's middle; y: the hips): legs round it, arms up it, looking down
 *  at the rhino in fright. `side` the way the body hangs off the trunk; `jolt` a jerk up (poked). */
const tourist = (c: Ctx, x: number, y: number, seed: number, side: 1 | -1, jolt: number) => {
  const h = (k: number) => hash(seed * 13.7 + k);
  const skin = R5(SKINS[Math.floor(h(1) * SKINS.length)]), shirt = R5(SHIRTS[Math.floor(h(2) * SHIRTS.length)]);
  const shorts = R5(['#8A7A50', '#4A4A40', '#3A4A6A', '#A89A70'][Math.floor(h(3) * 4)]), hair = R5(HAIRS[Math.floor(h(4) * HAIRS.length)]);
  const woman = h(5) > 0.5, wide = h(6) > 0.6 ? 3 : 0, hat = h(7) > 0.55;
  y -= jolt;
  const bx = x + side * 6 - (side < 0 ? 12 + wide : 0);
  // (the far leg, behind the trunk: just its shoe showing round the other side)
  box(c, x - side * 10 - 3, y + 6, 7, 5, INK); box(c, x - side * 10 - 2, y + 7, 5, 3, T('#E8E4D8'));
  // (the arms up the trunk, the hands round it)
  ib(c, x - 3, y - 34, 6, 18, skin); ib(c, x - 6, y - 38, 12, 5, skin);
  // (the torso, off to its side; the shorts; the near leg hooked round the front of the trunk)
  ib(c, bx, y - 18, 12 + wide, 16, shirt);
  box(c, bx + 2, y - 14, 3, 2, shirt[4]); box(c, bx + (side > 0 ? 8 : 2) + (side > 0 ? wide : 0), y - 16, 2, 10, shirt[1]);
  // (the camera on its strap: they all brought one)
  box(c, bx + 3, y - 10, 6, 4, INK); box(c, bx + 4, y - 9, 4, 2, T('#5A5A5A')); box(c, bx + 6, y - 9, 1, 1, '#FFFFFF');
  ib(c, bx, y - 3, 12 + wide, 7, shorts);
  ib(c, x - 8, y + 2, 16, 5, skin);
  box(c, x + side * 8 - 3, y + 1, 7, 7, INK); box(c, x + side * 8 - 2, y + 2, 5, 5, T('#5A3A20'));
  // (the head, turned down to look at what's under them: hair, the eye, the O of the mouth)
  const hx = bx + (side > 0 ? 6 + wide : -2), hy = y - 30;
  ib(c, hx - 1, hy, 11, 11, skin);
  if (woman) { box(c, hx - 2, hy - 2, 13, 4, INK); box(c, hx - 1, hy - 1, 11, 3, hair[2]); box(c, hx + (side > 0 ? -3 : 10), hy, 3, 14, INK); box(c, hx + (side > 0 ? -2 : 10), hy + 1, 2, 12, hair[2]); box(c, hx - 1, hy - 1, 11, 1, hair[4]); }
  else if (hat) { box(c, hx - 4, hy - 1, 17, 3, INK); box(c, hx - 3, hy, 15, 1, T('#E0D4A8')); box(c, hx, hy - 5, 9, 5, INK); box(c, hx + 1, hy - 4, 7, 4, T('#E0D4A8')); box(c, hx + 1, hy - 2, 7, 1, T('#6A4A2A')); }
  else { box(c, hx - 1, hy - 1, 11, 3, hair[2]); box(c, hx - 1, hy - 1, 11, 1, hair[4]); }
  const ex = hx + (side > 0 ? 6 : 1);
  box(c, ex, hy + 5, 2, 2, INK); box(c, ex + 1, hy + 4, 1, 1, '#FFFFFF');
  box(c, ex - side, hy + 8, 3, 3, INK); box(c, ex - side + 1, hy + 9, 1, 1, T('#8A2A2A'));
};

const rhinoAt = (c: Ctx, x: number, poke: boolean) => {
  const G = R5('#7A7068');
  c.save(); c.translate(x, FY);
  // (the track it rides out on: a slot in the mud, its carriage showing)
  box(c, -50, -2, 110, 3, INK); box(c, -48, -1, 106, 1, T('#3A3A40'));
  for (const lx of [-34, 20]) banded(c, () => path(c, [[lx, -28], [lx + 13, -28], [lx + 13, 0], [lx, 0]]), -28, 0, G, [1, 1, 0]);
  const body: Pt[] = [[-46, -36], [-30, -54], [10, -58], [36, -48], [44, -30], [38, -16], [-40, -16], [-50, -26]];
  banded(c, () => path(c, body), -58, -16, G, [4, 3, 2, 2, 1, 0]);
  c.save(); path(c, body); c.clip();
  // (the folds of its hide (molded in), a hip panel bolted on, chipped to the white fiberglass at the corner)
  for (const fx of [-22, 18]) for (let y = -54; y < -16; y += 2) box(c, fx + Math.round(Math.sin(y * 0.2) * 2), y, 1, 2, G[1]);
  box(c, -40, -44, 16, 12, G[1]); box(c, -40, -44, 16, 1, G[4]); for (const [bx2, by] of [[-38, -42], [-28, -42], [-38, -35], [-28, -35]]) box(c, bx2, by, 2, 2, T('#C8CCD2'));
  box(c, 28, -52, 6, 4, T('#F0ECE0'));
  c.restore();
  for (const lx of [-42, 14]) {
    banded(c, () => path(c, [[lx, -24], [lx + 14, -24], [lx + 14, 0], [lx, 0]]), -24, 0, G, [3, 2, 2, 1]);
    for (let t = 0; t < 3; t++) box(c, lx + 1 + t * 4, -3, 3, 3, T('#D8D0B8'));
  }
  // The head on its servo: down, or thrown up (the poke), in one step
  c.save(); c.translate(36, -40); c.rotate(poke ? -0.55 : 0.12);
  banded(c, () => path(c, [[-6, -10], [14, -14], [34, -8], [42, 4], [34, 12], [2, 12], [-6, 6]]), -14, 12, G, [4, 3, 2, 1, 0]);
  // (the horns: the big one, the little one; the ear; the eye; the nostril)
  banded(c, () => path(c, [[30, -8], [44, -30], [40, -4]]), -30, -4, R5('#D8CCB0'), [4, 3, 2]);
  banded(c, () => path(c, [[18, -12], [24, -22], [26, -11]]), -22, -11, R5('#D8CCB0'), [3, 2]);
  banded(c, () => path(c, [[-2, -10], [0, -20], [6, -11]]), -20, -10, G, [3, 2]);
  box(c, 12, -6, 3, 3, INK); box(c, 13, -6, 1, 1, '#FFFFFF'); box(c, 34, 4, 3, 2, G[0]);
  c.restore();
  // (the tail: a flick)
  box(c, -50, -36, 3, 12, INK); box(c, -49, -35, 1, 10, G[2]); box(c, -51, -26, 5, 4, G[0]);
  c.restore();
};

const partyAt = (c: Ctx, x: number, f: number) => {
  const st = f >> 3, poke = st % 9 < 2;
  // The dead tree: a trunk broken off at the top, bark in steps, a snapped-off limb, a vine down it
  const W = R5('#6A5440'), top = FY - 156;
  banded(c, () => path(c, [[x - 9, FY], [x - 7, top + 8], [x - 2, top], [x + 3, top + 6], [x + 8, top + 2], [x + 9, FY]]), top, FY, W, [3, 2, 2, 2, 1, 1], x - 12, x + 12);
  for (let y = top + 12; y < FY; y += 9) box(c, x - 6 + (y % 18 ? 0 : 6), y, 5, 1, W[0]);
  box(c, x - 7, top + 12, 2, FY - top - 12, W[3]);
  banded(c, () => path(c, [[x + 8, top + 40], [x + 30, top + 26], [x + 32, top + 30], [x + 8, top + 48]]), top + 26, top + 48, W, [3, 2, 1]);
  for (const [rx, d] of [[x - 9, -1], [x + 9, 1]] as [number, 1 | -1][]) banded(c, () => path(c, [[rx, FY - 16], [rx + d * 14, FY], [rx, FY]]), FY - 16, FY, W, [2, 1]);
  const V = R5('#3A6A2A');
  for (let y = top + 20; y < FY - 20; y += 2) box(c, x - 2 + Math.round(Math.sin(y * 0.15) * 4), y, 2, 2, y % 10 < 2 ? V[3] : V[1]);
  // The party: three of them, the lowest one's ass in reach, jumping when it's got
  tourist(c, x, top + 46, 3, 1, 0);
  tourist(c, x, top + 84, 8, -1, 0);
  tourist(c, x, top + 120, 15, 1, poke ? 3 : 0);
  rhinoAt(c, x - 64, poke);
  // (the bit of a jeep they came in, tipped over behind, its spare tire)
  const J = R5('#7A7A3A');
  c.save(); c.translate(x + 60, FY);
  banded(c, () => path(c, [[0, -30], [52, -36], [56, -6], [4, 0]]), -36, 0, J, [3, 2, 2, 1, 0]);
  box(c, 10, -26, 14, 10, INK); box(c, 11, -25, 12, 8, T('#9AB8C8'));
  c.fillStyle = INK; c.beginPath(); c.arc(50, -40, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = T('#2A2A2A'); c.beginPath(); c.arc(50, -40, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = T('#8A8A8A'); c.beginPath(); c.arc(50, -40, 4, 0, Math.PI * 2); c.fill();
  signAt(c, 'SAFARI', 30, -10, 5, print(5, T('#E8E0C8')));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Trader Stan's

const paintHut = (g: Ctx, x: number) => {
  const P = R5('#8A6A3A'), Th = R5('#B89A5A'), Cn = R5('#7A4A2A');
  const w = 150, l = x - w / 2, top = FY - 120;
  // (the back wall: woven mat, in a checker of two straws)
  box(g, l + 6, top + 26, w - 12, FY - top - 26, T('#5A4428'));
  for (let y = top + 28; y < FY - 6; y += 6) for (let k = l + 6; k < l + w - 6; k += 6) box(g, k + ((y / 6) % 2 ? 3 : 0), y, 3, 3, T('#6E5634'));
  // (the shelves behind: plastic heads in rows, a price on each row; coconut cups; a stack of T-shirts)
  for (const sy of [top + 50, top + 74]) {
    box(g, l + 12, sy + 10, w - 24, 3, INK); box(g, l + 12, sy + 10, w - 24, 2, P[3]);
    for (let k = l + 18; k < l + w - 20; k += 12) {
      const H = R5(['#6A4A2A', '#5A3A20', '#7A5A30'][Math.floor(hash(k + sy) * 3)]);
      box(g, k - 1, sy - 1, 9, 11, INK); box(g, k, sy, 7, 9, H[2]); box(g, k, sy, 7, 2, H[3]); box(g, k + 5, sy + 2, 2, 7, H[1]);
      box(g, k + 1, sy + 3, 2, 1, INK); box(g, k + 4, sy + 3, 2, 1, INK);
      for (let s = 0; s < 3; s++) box(g, k + 1 + s * 2, sy + 6, 1, 2, T('#E8E0C8'));
      box(g, k, sy - 3, 7, 2, T('#1A1A1A'));
    }
  }
  signAt(g, '2 FOR $10', l + 40, top + 100, 5, print(5, T('#F8E8A0')));
  // (the posts: bamboo, the joints banded)
  for (const px of [l, l + w - 10]) {
    box(g, px - 1, top + 14, 12, FY - top - 14, INK); box(g, px, top + 14, 10, FY - top - 14, P[2]); box(g, px, top + 14, 3, FY - top - 14, P[3]); box(g, px + 8, top + 14, 2, FY - top - 14, P[1]);
    for (let y = top + 30; y < FY; y += 22) { box(g, px - 1, y, 12, 2, P[0]); box(g, px, y + 2, 10, 1, P[4]); }
  }
  // (the counter: planks, lit along the top; the board nailed over what it used to say)
  box(g, l + 4, FY - 40, w - 8, 40, INK);
  box(g, l + 5, FY - 39, w - 10, 38, Cn[2]);
  for (let y = FY - 31; y < FY; y += 8) { box(g, l + 5, y, w - 10, 1, Cn[0]); box(g, l + 5, y + 1, w - 10, 1, Cn[3]); }
  box(g, l + 2, FY - 42, w - 4, 4, INK); box(g, l + 3, FY - 41, w - 6, 2, Cn[4]);
  box(g, l + 26, FY - 30, w - 52, 18, INK); box(g, l + 27, FY - 29, w - 54, 16, T('#E8D8A8')); box(g, l + 27, FY - 29, w - 54, 2, T('#F8ECC8'));
  for (const nx of [l + 29, l + w - 31]) box(g, nx, FY - 27, 2, 2, T('#5A5A5A'));
  signAt(g, 'UNDER NEW MANAGEMENT', x, FY - 17, 5, carved(5, T('#5A2A10'), T('#F8ECC8'), 5));
  signAt(g, 'NO REFUNDS', l + w - 30, FY - 2, 5, print(5, T('#F0D890')));
  // (the roof: thatch in layers, each a fringe of stepped straw, lit along its top, shadowed under)
  for (let k = 0; k < 3; k++) {
    const y = top + k * 12, ext = 18 - k * 4;
    g.fillStyle = INK; g.beginPath(); g.moveTo(l - ext, y + 22); g.lineTo(x, y - 18 + k * 4); g.lineTo(l + w + ext, y + 22); g.closePath(); g.fill();
    g.fillStyle = Th[2 + (k === 2 ? 1 : 0)]; g.beginPath(); g.moveTo(l - ext + 3, y + 20); g.lineTo(x, y - 15 + k * 4); g.lineTo(l + w + ext - 3, y + 20); g.closePath(); g.fill();
    for (let s = l - ext + 4; s < l + w + ext - 4; s += 3) box(g, s, y + 18 + (Math.floor(hash(s * 0.7 + k) * 3)), 2, 5, (s >> 1) % 3 ? Th[1] : Th[0]);
    for (let s = l - ext + 10; s < l + w + ext - 10; s += 7) { const sy = y + 20 - Math.round(((x - Math.abs(x - s)) - (l - ext)) / (w / 2 + ext) * (34 - k * 4)); box(g, s, sy, 1, 4, Th[4]); }
  }
  // (the name board up on the roof's peak, roped on)
  sign(g, x - 52, top - 30, 104, 20, T('#D8B878'), '', INK, 6, T('#6A3A1A'));
  signAt(g, "TRADER STAN'S", x, top - 15, 6, carved(6, T('#5A1A0A'), T('#F8E8C0'), 9));
  sign(g, x - 34, top - 6, 68, 11, T('#2E4A2A'), '', INK, 5, T('#6A4A2A'));
  signAt(g, 'SOUVENIRS', x, top + 3, 5, plank(5, T('#F0D890'), undefined, undefined, 4));
  // (tiki torches either side, unlit: it's fiberglass flame)
  for (const tx of [l - 22, l + w + 18]) {
    box(g, tx - 1, FY - 70, 6, 70, INK); box(g, tx, FY - 70, 4, 70, P[2]); box(g, tx, FY - 70, 1, 70, P[3]);
    box(g, tx - 4, FY - 80, 12, 12, INK); box(g, tx - 3, FY - 79, 10, 10, T('#7A5A30')); box(g, tx - 3, FY - 79, 10, 2, T('#9A7A40'));
    box(g, tx - 2, FY - 92, 8, 12, INK); box(g, tx - 1, FY - 91, 6, 11, T('#E8702A')); box(g, tx, FY - 89, 4, 7, T('#F8C040'));
  }
};

/** Stan himself (on his servos: the head turning, the arm waving a shrunken head keychain up and down). */
const stanAt = (c: Ctx, x: number, f: number) => {
  const st = f >> 3, arm = [0, 1, 2, 1][st % 4], look = (st >> 3) % 2 ? 1 : -1;
  const sk = R5('#F0B8A0'), polo = R5('#2A8A88'), y = FY - 40;
  // (the torso over the counter: a polo, its collar, the name tag)
  ib(c, x - 14, y - 28, 28, 28, polo);
  box(c, x - 6, y - 28, 12, 4, polo[4]); box(c, x - 2, y - 26, 4, 6, sk[2]);
  box(c, x + 3, y - 18, 9, 5, INK); box(c, x + 4, y - 17, 7, 3, '#F8F8F0'); box(c, x + 5, y - 16, 5, 1, T('#B02020'));
  // (the left arm on the counter, the right up on its servo, the keychain swinging off the hand)
  ib(c, x - 22, y - 24, 8, 20, polo); ib(c, x - 22, y - 6, 12, 5, sk);
  const ay = y - 26 - arm * 6;
  ib(c, x + 14, ay, 7, y - 4 - ay, polo); ib(c, x + 14, ay - 6, 7, 7, sk);
  // (the keychain, hung off his fingers, swinging a step behind the arm)
  const hx = x + 22 + (arm === 1 ? 1 : 0), hy = ay + 2;
  box(c, hx + 4, ay - 4, 1, 6, T('#C8C8C8')); box(c, hx + 3, ay - 5, 3, 2, T('#E8E8E8'));
  box(c, hx - 1, hy - 1, 11, 13, INK); box(c, hx, hy, 9, 11, T('#6A4A2A')); box(c, hx, hy, 9, 2, T('#8A6A3A'));
  box(c, hx + 1, hy - 3, 7, 3, T('#1A1A1A')); box(c, hx + 2, hy + 4, 2, 1, INK); box(c, hx + 5, hy + 4, 2, 1, INK);
  for (let s = 0; s < 3; s++) box(c, hx + 2 + s * 2, hy + 8, 1, 2, T('#E8E0C8'));
  // (the head: balding, a comb-over, the mustache, the eyes turned this way and that)
  const H = y - 48;
  ib(c, x - 9, H, 18, 20, sk);
  box(c, x - 9, H, 18, 3, sk[4]); box(c, x - 9, H + 2, 3, 8, T('#8A6A4A')); box(c, x + 6, H + 2, 3, 8, T('#8A6A4A'));
  for (let k = -6; k < 6; k += 3) box(c, x + k, H + 1, 2, 1, T('#8A6A4A'));
  box(c, x - 5 + look, H + 7, 3, 3, '#FFFFFF'); box(c, x + 2 + look, H + 7, 3, 3, '#FFFFFF');
  box(c, x - 4 + look * 2 - (look < 0 ? 0 : 1), H + 8, 2, 2, INK); box(c, x + 3 + look * 2 - (look < 0 ? 0 : 1), H + 8, 2, 2, INK);
  box(c, x - 6, H + 13, 12, 3, T('#6A4A2A')); box(c, x - 3, H + 16, 6, 1, T('#A0505A'));
  // (the servo's seam at the neck: you can see the gap, the bolt)
  box(c, x - 6, y - 29, 12, 1, INK); box(c, x - 1, y - 30, 2, 2, T('#C8CCD2'));
};

/** The lot (world units at the bank's depth: the caller's in it). xs: where each is, by the river's own x. */
export const drawGags = (c: Ctx, f: number, at: { croc?: number; party?: number; stan?: number }) => {
  if (at.croc !== undefined) { crocAt(c, at.croc, f, 1, 0, false); crocAt(c, at.croc + 230, f, -1, 1, true); }
  if (at.party !== undefined) partyAt(c, at.party, f);
  if (at.stan !== undefined) {
    const x = at.stan;
    stamp(c, `rv-stan-${timeOfDay().key}`, x - 120, FY - 160, 240, 162, g => paintHut(g, x));
    stanAt(c, x + 18, f);
  }
};
