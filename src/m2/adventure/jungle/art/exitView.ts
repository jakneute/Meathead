// The Jungle Cruise, through the gap in the trees at the jungle's end: far back (one depth, D, behind everything
// nearer; the jungle round the gap drawn over its edges), as it looks now and busy. A hazy treeline and palms over the
// far bank; the long queue house off left (thatch on bamboo, the line's heads under it); the boathouse on its piles
// over the river (two tiers of thatch in rows, weathered plank walls, the line on its deck under the lower eave, the
// carved JUNGLE CRUISE board stood up on log posts on the ridge, a skull either end); the dock off right on its piles
// (rope rail, a skipper), a launch tied up at it (white hull, green boot stripe, red at the waterline, life rings, her
// number on the bow, the striped canopy with its scallops, guests aboard); the skipper's lookout on its stilts with its
// pennant; bunting across. The river: banded, ripples, everything's reflection broken up in it. A second launch goes
// by on the river (live, its wake behind it). The still art's painted once an hour (stamps); all of it in the hour's
// light and the distance's haze. Nothing out there lit along a top like a ledge (none of it's to stand on). No volcanoes.

import { GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, skyRamp, skyAt, farTint, type TimeOfDay } from '../../../timeOfDay';
import { stamp, bandedGradient, checker, pixelBlob, steppedGlow } from '../../../intro/art/kit';
import { crown, palm } from '../../farArt';
import { signAt, signW, carved as carvedLook, print } from '../../letters';
import { SIGNS, X, Y } from '../layout';
import { atDepth } from './ground';
import { type Ctx, type View, INK, box, mix, hash, poly, clump, rampOf, LEAF } from './paint';

const GY = GROUND_Y;
/** How far back it is (of the way from the eye). */
const D = 0.55;
const EXIT = SIGNS.find(s => s[4] === 'exit')!;
const exitX = X(EXIT[0]);
/** The gap: its span, how high it reaches; the river's surface (the far bank's foot). */
const x0 = X(11780), x1 = X(12500), TOP = Y(560), CX = (x0 + x1) / 2, W = GY - 70;
/** The gap's outline (the view's clipped to it). */
const gapPath = (g: Ctx) => { g.beginPath(); g.ellipse(CX, GY - 40, (x1 - x0) / 2, GY - TOP, 0, Math.PI, 0); g.lineTo(x1, GY + 100); g.lineTo(x0, GY + 100); g.closePath(); };

type Tint = (c: string) => string;
type Ramp = string[];

// ---------------------------------------------------------------------------------------------------------------
// The kit (every color through the tint: the hour's light and the haze)

/** A pole (bamboo with its nodes, or a log): lit down the left, shade down the right, an ink edge. */
const pole = (g: Ctx, x: number, top: number, bot: number, w: number, P: Ramp, ink: string, nodes = 0) => {
  const h = bot - top, sh = Math.max(1, Math.round(w / 4));
  box(g, x - 1, top, w + 2, h, ink);
  box(g, x, top, w, h, P[2]); box(g, x, top, Math.max(1, Math.round(w / 3)), h, P[3]); box(g, x, top, 1, h, P[4]); box(g, x + w - sh, top, sh, h, P[1]);
  if (nodes) for (let y = top + nodes; y < bot - 4; y += nodes) { box(g, x - 1, y, w + 2, 2, P[0]); box(g, x, y + 2, w, 1, P[3]); }
};

/** A beam across: lit along its top, shade under, grain, an ink edge. */
const beam = (g: Ctx, a: number, b: number, y: number, h: number, P: Ramp, ink: string, seed = 0) => {
  box(g, a - 1, y - 1, b - a + 2, h + 2, ink);
  box(g, a, y, b - a, h, P[2]); box(g, a, y, b - a, Math.max(1, Math.round(h / 3)), P[3]); box(g, a, y + h - 2, b - a, 2, P[1]);
  for (let k = 0; k < (b - a) / 14; k++) box(g, a + hash(seed + k) * (b - a - 12), y + 2 + Math.floor(hash(seed + k * 3.1) * (h - 3)), 6 + hash(k + seed) * 10, 1, P[1]);
};

/** Rope lashed round something (turns, lit on top). */
const lash = (g: Ctx, x: number, y: number, w: number, RP: Ramp, ink: string, turns = 2) => {
  for (let i = 0; i < turns; i++) { const ly = y + i * 3; box(g, x - 1, ly - 1, w + 2, 4, ink); box(g, x, ly, w, 2, RP[3]); box(g, x, ly + 2, w, 1, RP[1]); }
};

/** Weathered boards standing side by side: each its own shade, lit edge, grain, a knot, nails top and bottom. */
const boards = (g: Ctx, x: number, y: number, w: number, h: number, P: Ramp, ink: string, nail: string, seed: number, bw = 8) => {
  box(g, x - 1, y - 1, w + 2, h + 2, ink);
  for (let bx = x, i = 0; bx < x + w; bx += bw, i++) {
    const ww = Math.min(bw, x + w - bx), base = hash(seed + i * 1.7) > 0.7 ? P[1] : P[2];
    box(g, bx, y, ww, h, base); box(g, bx, y, 1, h, P[3]); box(g, bx + ww - 1, y, 1, h, ink);
    for (let k = 0; k < h / 5; k++) { const gy = y + 2 + Math.floor(hash(seed + i * 9 + k) * (h - 4)); box(g, bx + 2 + (k % 2), gy, 1, 3 + Math.floor(hash(k + i) * 6), k % 3 ? P[1] : P[0]); }
    if (hash(seed + i * 4.3) > 0.6) { box(g, bx + 2, y + Math.floor(h * (0.3 + hash(i + seed) * 0.4)), 3, 2, P[0]); box(g, bx + 2, y + Math.floor(h * (0.3 + hash(i + seed) * 0.4)), 1, 1, P[3]); }
    // (sun-bleached up top, darker where the damp gets in at the foot)
    checker(g, bx + 1, y, ww - 2, 2, P[4]); checker(g, bx + 1, y + h - 4, ww - 2, 4, P[0], 1);
    for (const ny of [y + 3, y + h - 5]) box(g, bx + Math.floor(ww / 2) - 1, ny, 2, 2, nail);
  }
};

/** A thatched hip roof (eave y, ridge y; the ridge `inset` in from each end): straw in rows, each row's tufts lit up
 *  the left, a dithered shadow under each row, the eave's fringe ragged, the ridge bound in a lashed bundle. */
const thatch = (g: Ctx, a: number, b: number, eave: number, ridge: number, inset: number, P: Ramp, RP: Ramp, ink: string, seed: number) => {
  const pts: [number, number][] = [[a, eave], [a + inset, ridge], [b - inset, ridge], [b, eave]];
  poly(g, [[a - 2, eave + 1], [a + inset - 1, ridge - 2], [b - inset + 1, ridge - 2], [b + 2, eave + 1]], ink);
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  box(g, a, ridge, b - a, eave - ridge, P[2]);
  // (the hip ends: the left one in the light, the right one turned away)
  poly(g, [[a, eave], [a + inset, ridge], [a + inset + 6, eave]], P[3]);
  poly(g, [[b, eave], [b - inset, ridge], [b - inset - 6, eave]], P[1]);
  for (let y = ridge, row = 0; y < eave; y += 7, row++) {
    for (let x = a; x < b; x += 2) {
      const k = hash(x * 0.37 + y * 1.3 + seed), u = (x - a) / (b - a);
      const col = k < 0.18 ? P[0] : u < 0.3 ? (k < 0.6 ? P[3] : P[4]) : u > 0.75 ? (k < 0.6 ? P[1] : P[2]) : (k < 0.5 ? P[2] : P[3]);
      box(g, x, y + 2 + (row % 2), 1, 3 + Math.floor(k * 4), col);
    }
    box(g, a, y + 6, b - a, 1, P[0]); checker(g, a, y + 4, b - a, 2, P[1], row % 2);
  }
  g.restore();
  // (the fringe hanging off the eave)
  for (let x = a; x < b; x += 2) { const k = hash(x * 0.71 + seed); box(g, x, eave, 2, 2 + Math.floor(k * 5), k < 0.3 ? P[0] : P[1]); if (k > 0.85) box(g, x, eave, 1, 2, P[3]); }
  // (the ridge: a bundle of straw, lashed)
  if (b - a - inset * 2 > 6) { beam(g, a + inset - 2, b - inset + 2, ridge - 3, 5, P, ink, seed); for (let x = a + inset + 6; x < b - inset - 4; x += 22) lash(g, x, ridge - 3, 4, RP, ink); }
};

/** A guest standing (foot at y): legs, shorts, a shirt lit up its left, arms, a head, hair or a hat; varied. */
const guest = (g: Ctx, x: number, foot: number, seed: number, T: Tint, shade = 0) => {
  const S = (c: string) => T(mix(c, '#101418', shade));
  const skin0 = ['#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#C08A5A'][Math.floor(hash(seed) * 5)], skin = S(skin0);
  const shirt = ['#D8402A', '#2E6AB8', '#F2C21E', '#2E8A4A', '#F1EFEA', '#C850A0', '#E87A2A', '#3AA8B8'][Math.floor(hash(seed * 2.3) * 8)];
  const pants = ['#2A3A5A', '#C8B48A', '#3A3A3A', '#6A8AB0'][Math.floor(hash(seed * 3.1) * 4)];
  const hair = S(['#1A1008', '#5A3418', '#C8A050', '#8A2A10', '#B8B8B0'][Math.floor(hash(seed * 4.7) * 5)]);
  const tall = 2 * Math.floor(hash(seed * 5.3) * 3), big = hash(seed * 6.1) > 0.7 ? 2 : 0;
  const top = foot - 26 - tall, ink = T(INK);
  box(g, x - 5 - big / 2, top - 1, 11 + big, foot - top + 1, ink);
  box(g, x - 4, foot - 8, 3, 8, skin); box(g, x + 1, foot - 8, 3, 8, skin);
  box(g, x - 4 - big / 2, foot - 13, 9 + big, 5, S(pants));
  box(g, x - 4 - big / 2, top + 7, 9 + big, 8 + tall, S(shirt)); box(g, x - 4 - big / 2, top + 7, 2, 8 + tall, S(mix(shirt, '#FFFFFF', 0.3))); box(g, x + 3 + big / 2, top + 7, 2, 8 + tall, S(mix(shirt, '#000000', 0.3)));
  box(g, x - 6 - big / 2, top + 8, 2, 7, skin); box(g, x + 5 + big / 2, top + 8, 2, 7, skin);
  box(g, x - 3, top, 7, 7, skin); box(g, x - 3, top, 2, 7, S(mix(skin0, '#FFFFFF', 0.15)));
  const hat = hash(seed * 8.9);
  if (hat < 0.2) { box(g, x - 5, top - 1, 11, 2, S('#E8DCB8')); box(g, x - 3, top - 4, 7, 3, S('#E8DCB8')); box(g, x - 3, top - 4, 2, 3, S('#FFF6DC')); }
  else if (hat < 0.35) { box(g, x - 3, top - 2, 7, 3, S('#C81E1E')); box(g, x + 3, top, 4, 1, S('#C81E1E')); }
  else { box(g, x - 3, top - 1, 7, 3, hair); if (hash(seed * 9.7) > 0.5) box(g, x + 3, top + 1, 2, 6, hair); }
};

/** A Jungle Cruise launch, its waterline's left end at (x, wl), `w` long, its bow to the right (`dir` 1) or left:
 *  the striped canopy on its poles (scalloped valance, a pennant up front), guests aboard, the hull (teak rubrail,
 *  white topsides lit along the top, the green boot stripe, red at the waterline), life rings on the side, her
 *  number on a plate at the bow. */
const launch = (g: Ctx, x: number, wl: number, w: number, dir: 1 | -1, num: string, seed: number, T: Tint) => {
  const ink = T(INK), HU = rampOf('#E8E2D2').map(T), TK = rampOf('#9A6A3A').map(T), PO = rampOf('#B8BCC4').map(T);
  const SA = rampOf('#2F7A44').map(T), SB = rampOf('#EDE4C8').map(T), RD = rampOf('#A8322A').map(T), BT = rampOf('#2F6A3A').map(T);
  const L = (u: number) => (dir > 0 ? x + u : x + w - u);
  const deck = wl - 14, ctop = wl - 58;
  // (the poles, three)
  for (const u of [8, w / 2, w - 22]) pole(g, Math.round(L(u)) - 1, ctop + 6, deck, 3, PO, ink);
  // (guests aboard, on the benches: heads and shoulders over the gunwale)
  for (let u = 16, i = 0; u < w - 30; u += 13, i++) {
    const gx = Math.round(L(u)), sd = seed * 13 + i;
    const skin = T(['#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#C08A5A'][Math.floor(hash(sd) * 5)]);
    const shirt = T(['#D8402A', '#2E6AB8', '#F2C21E', '#2E8A4A', '#F1EFEA', '#C850A0'][Math.floor(hash(sd * 2.3) * 6)]);
    box(g, gx - 5, deck - 17, 11, 17, ink);
    box(g, gx - 4, deck - 9, 9, 9, shirt); box(g, gx - 4, deck - 9, 2, 9, mix(shirt, '#FFFFFF', 0.3));
    box(g, gx - 3, deck - 16, 7, 7, skin);
    if (hash(sd * 3.3) < 0.25) { box(g, gx - 5, deck - 17, 11, 2, T('#E8DCB8')); box(g, gx - 3, deck - 20, 7, 3, T('#E8DCB8')); }
    else box(g, gx - 3, deck - 17, 7, 3, T(['#1A1008', '#5A3418', '#C8A050', '#8A2A10'][Math.floor(hash(sd * 4.7) * 4)]));
  }
  // (the skipper at the wheel up front: khaki, the pith helmet)
  {
    const sx = Math.round(L(w - 14));
    box(g, sx - 5, deck - 23, 11, 23, ink); box(g, sx - 4, deck - 14, 9, 14, T('#C8B07A')); box(g, sx - 4, deck - 14, 2, 14, T('#E0CC98'));
    box(g, sx - 3, deck - 21, 7, 7, T('#D9A877')); box(g, sx - 5, deck - 22, 11, 2, T('#E8DCB8')); box(g, sx - 3, deck - 25, 7, 3, T('#F4ECD0'));
  }
  // (the canopy: green and cream stripes, the underside's shade along the bottom, a scallop under each stripe)
  const ca = Math.round(Math.min(L(0), L(w)) - 6), cb = Math.round(Math.max(L(0), L(w)) + 4);
  box(g, ca - 1, ctop - 1, cb - ca + 2, 10, ink);
  for (let k = ca, i = 0; k < cb; k += 8, i++) {
    const r = i % 2 ? SB : SA, ww = Math.min(8, cb - k);
    box(g, k, ctop, ww, 8, r[2]); box(g, k, ctop, ww, 2, r[3]); box(g, k, ctop + 6, ww, 2, r[1]);
    g.fillStyle = ink; g.beginPath(); g.arc(k + 4, ctop + 8, 4.5, 0, Math.PI); g.fill();
    g.fillStyle = r[1]; g.beginPath(); g.arc(k + 4, ctop + 8, 3.5, 0, Math.PI); g.fill();
  }
  box(g, ca, ctop + 7, cb - ca, 1, T('#C8A23A'));
  // (the pennant on the front pole)
  const fx = Math.round(L(w - 22)); box(g, fx, ctop - 14, 2, 14, PO[1]);
  for (let k = 0; k < 10; k += 2) box(g, dir > 0 ? fx + 2 + k : fx - 2 - k, ctop - 13 + k * 0.3, 2, Math.max(1, 6 - k * 0.5), k < 4 ? RD[2] : RD[3]);
  // (the hull: the bow raked up, the stern square)
  const hull = (o: number) => { g.beginPath(); g.moveTo(L(-4) , deck - o); g.lineTo(L(w + 12), deck - 4 - o); g.lineTo(L(w - 6), wl + 2 + o); g.lineTo(L(4), wl + 2 + o); g.lineTo(L(-4), deck + 6 + o); g.closePath(); };
  g.fillStyle = ink; hull(1); g.fill();
  g.save(); hull(0); g.clip();
  const hx0 = Math.min(L(-6), L(w + 14)), hx1 = Math.max(L(-6), L(w + 14));
  box(g, hx0, deck - 6, hx1 - hx0, wl - deck + 10, HU[2]);
  box(g, hx0, deck - 6, hx1 - hx0, 7, HU[3]); box(g, hx0, deck + 1, hx1 - hx0, 1, HU[4]); checker(g, hx0, deck + 2, hx1 - hx0, 2, HU[3]);
  box(g, hx0, wl - 6, hx1 - hx0, 3, BT[2]); box(g, hx0, wl - 6, hx1 - hx0, 1, BT[3]);
  box(g, hx0, wl - 3, hx1 - hx0, 6, RD[1]);
  checker(g, hx0, wl - 9, hx1 - hx0, 2, HU[1], 1);
  g.restore();
  beam(g, Math.round(Math.min(L(-4), L(w + 10))), Math.round(Math.max(L(-4), L(w + 10))), deck - 3, 3, TK, ink, seed);
  // (life rings on her side: white, four red bands)
  for (const u of [w * 0.3, w * 0.62]) {
    const rx = Math.round(L(u)), ry = deck + 5;
    g.fillStyle = ink; g.beginPath(); g.arc(rx, ry, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = T('#F4F0E8'); g.beginPath(); g.arc(rx, ry, 4, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = RD[2]; g.beginPath(); g.moveTo(rx, ry); g.arc(rx, ry, 4, i * Math.PI / 2 + 0.4, i * Math.PI / 2 + 1.1); g.closePath(); g.fill(); }
    g.fillStyle = HU[1]; g.beginPath(); g.arc(rx, ry, 1.5, 0, Math.PI * 2); g.fill();
    box(g, rx - 2, ry - 4, 2, 1, T('#FFFFFF'));
  }
  // (her number on a plate at the bow)
  const nx = Math.round(L(w - 4)) - 6;
  box(g, nx - 1, deck + 1, 14, 11, ink); box(g, nx, deck + 2, 12, 9, T('#F2E6C4')); box(g, nx, deck + 2, 12, 1, T('#FFFFFF'));
  signAt(g, num, nx + 6, deck + 9, 6, print({ sx: 1, sy: 1 }, T('#1E3A2A')));
};

/** A launch's reflection under it: broken bands of its colors, darker and shaken by the ripples. */
const launchShadow = (g: Ctx, a: number, b: number, wl: number, W0: string, Wd: string, T: Tint) => {
  for (let y = wl + 3, i = 0; y < wl + 22; y += 3, i++) {
    const j = Math.round(Math.sin(i * 1.7) * 3), cut = 4 + i * 2;
    box(g, a + cut + j, y, b - a - cut * 2, 1, i < 3 ? mix(T('#E8E2D2'), W0, 0.55) : i < 5 ? mix(T('#2F7A44'), W0, 0.5) : Wd);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The scene (painted once an hour)

const paintScene = (g: Ctx, tod: TimeOfDay) => {
  const T: Tint = col => mix(farTint(col, 0.85, tod), skyAt(0.9, tod), 0.16);
  const TF: Tint = col => mix(farTint(col, 0.7, tod), skyAt(0.85, tod), 0.42);
  const R = (col: string) => rampOf(col).map(T);
  const ink = T(INK), lamps = tod.lamps;
  g.save(); gapPath(g); g.clip();
  // The sky, banded; a few clouds in steps
  bandedGradient(g, x0, TOP - 80, x1 - x0, W - TOP + 80, skyRamp(['#8DB4E2', '#B4CEE6', '#DCE6E4'], tod, 0.4, 1), 8);
  const CL = ['#B8C4D0', '#DCE2E8', '#F4F6F8'].map(c => mix(farTint(c, 0.9, tod), skyAt(0.4, tod), 0.25));
  for (const [cx, cy, s] of [[x0 + 150, TOP + 120, 1], [x1 - 190, TOP + 190, 0.8], [CX - 30, TOP + 70, 0.6]] as [number, number, number][]) {
    pixelBlob(g, cx, cy + 4 * s, 70 * s, 16 * s, CL[0]); pixelBlob(g, cx - 10 * s, cy, 56 * s, 14 * s, CL[1]);
    pixelBlob(g, cx - 26 * s, cy - 8 * s, 30 * s, 12 * s, CL[1]); pixelBlob(g, cx - 30 * s, cy - 10 * s, 18 * s, 7 * s, CL[2]);
    box(g, cx - 70 * s, cy + 14 * s, 140 * s, 2, CL[0]);
  }
  // The far shore: a treeline in the haze, palms up out of it, the bank's mud and reeds at the water
  {
    const GR = ['#1E4430', '#2C5A3A', '#467A46', '#6A9A58'].map(TF);
    box(g, x0, W - 70, x1 - x0, 70, GR[0]);
    for (let x = x0 - 10, i = 0; x < x1 + 20; x += 24, i++) crown(g, x + hash(i) * 10, W - 74 + Math.round(Math.sin(i * 1.3) * 8 + hash(i * 2) * 8), 18 + hash(i * 3) * 6, GR);
    checker(g, x0, W - 40, x1 - x0, 20, GR[1]);
    const PT: [string, string] = [TF('#4A3A28'), TF('#7A6448')], PF: [string, string, string] = [TF('#1E5428'), TF('#3A7A34'), TF('#6AA448')];
    palm(g, x0 + 90, W - 30, 120, 14, PT, PF, 3); palm(g, x0 + 130, W - 30, 96, -10, PT, PF, 5);
    palm(g, x1 - 70, W - 30, 130, -16, PT, PF, 7); palm(g, CX + 140, W - 40, 104, 10, PT, PF, 9);
    const BK = R('#5A4A2E');
    box(g, x0, W - 12, x1 - x0, 12, BK[1]); box(g, x0, W - 12, x1 - x0, 2, BK[2]); checker(g, x0, W - 10, x1 - x0, 4, BK[2]);
    for (let x = x0; x < x1; x += 3) { const k = hash(x * 0.13); if (k > 0.45) box(g, x, W - 12 - Math.floor(k * 10), 1, Math.floor(k * 10), k > 0.8 ? T(LEAF[4]) : T(LEAF[2])); }
  }
  // The river: banded, the far bank's lit edge, ripples
  const WR = R('#3E7A6A'), Wsky = mix(WR[3], skyAt(0.6, tod), 0.4);
  box(g, x0, W, x1 - x0, GY + 100 - W, WR[1]);
  box(g, x0, W, x1 - x0, 6, Wsky); checker(g, x0, W + 6, x1 - x0, 2, Wsky);
  box(g, x0, W + 8, x1 - x0, 10, WR[2]); checker(g, x0, W + 18, x1 - x0, 2, WR[2]);
  box(g, x0, W + 30, x1 - x0, 80, WR[1]); checker(g, x0, W + 30, x1 - x0, 2, WR[2], 1);
  box(g, x0, W, x1 - x0, 1, WR[4]);
  for (let k = 0; k < 46; k++) { const rx = x0 + hash(k * 1.9) * (x1 - x0), ry = W + 4 + Math.floor(hash(k * 3.7) * 50); box(g, rx, ry, 6 + hash(k) * 12, 1, k % 3 ? WR[3] : WR[4]); box(g, rx + 2, ry + 1, 4 + hash(k) * 6, 1, WR[0]); }

  const TH = R('#C0A060'), BM = R('#C9A64E'), WD = R('#8A6440'), LG = R('#6A4A28'), RP = R('#D8C08A'), WDk = rampOf(mix('#8A6440', '#1A1208', 0.45)).map(T);
  const nail = T('#2A2A30');

  // The queue house off left: long, low, its thatch on bamboo posts, the line's heads under it, a rail along it
  {
    const qa = x0 + 20, qb = CX - 236, floor = W - 12;
    box(g, qa, floor - 54, qb - qa, 54, WDk[1]); checker(g, qa, floor - 54, qb - qa, 10, WDk[0]);
    for (let x = qa + 10, i = 0; x < qb - 6; x += 12, i++) guest(g, x, floor, 300 + i, T, 0.3);
    for (let x = qa + 4; x < qb; x += 34) pole(g, x, floor - 62, floor, 5, BM, ink, 18);
    beam(g, qa, qb, floor - 22, 4, BM, ink, 4);
    thatch(g, qa - 16, qb + 16, floor - 60, floor - 94, 30, TH, RP, ink, 11);
    beam(g, qa - 2, qb + 2, floor, 4, WD, ink, 6);
  }

  // The boathouse on its piles: the deck, the line under the lower eave, the back wall, posts, two tiers of thatch
  const bx = CX - 60, ba = bx - 150, bb = bx + 150, deck = W - 10;
  {
    // (the piles down into the water, their reflections, a ring at each)
    for (let x = ba + 6; x < bb; x += 26) {
      pole(g, x, deck, W + 6, 6, LG, ink);
      for (let y = W + 8, i = 0; y < W + 30; y += 3, i++) box(g, x + Math.round(Math.sin(i * 1.9) * 2), y, 6, 1, mix(LG[1], WR[1], 0.4 + i * 0.05));
      box(g, x - 3, W + 5, 12, 1, WR[4]);
    }
    // (the back wall in the shade of the eave, a lantern on it)
    boards(g, ba + 8, W - 98, bb - ba - 16, 88, WDk, ink, nail, 21);
    checker(g, ba + 8, W - 98, bb - ba - 16, 20, WDk[0]);
    // (the line, shuffling along the deck under the eave; the queue's switchback rail)
    for (let x = ba + 22, i = 0; x < bb - 20; x += 15, i++) guest(g, x + Math.round(hash(i * 5.5) * 4), deck - 2, 400 + i, T, 0.18);
    beam(g, ba + 4, bb - 4, deck - 22, 3, BM, ink, 9);
    for (let x = ba + 30; x < bb; x += 60) box(g, x, deck - 22, 2, 20, BM[1]);
    // (the posts, bamboo, lashed at the eave)
    for (const x of [ba, ba + 74, bx - 4, bb - 82, bb - 8]) { pole(g, x, W - 102, deck, 8, BM, ink, 22); lash(g, x - 1, W - 100, 10, RP, ink); }
    // (the deck's edge)
    beam(g, ba - 8, bb + 8, deck, 6, WD, ink, 13);
    // (the lower tier's thatch, the upper tier's walls over it, its shuttered windows, an oar pair crossed, a life ring)
    boards(g, bx - 96, W - 182, 192, 50, WD, ink, nail, 31);
    for (const wx of [bx - 70, bx + 36]) {
      box(g, wx - 1, W - 172, 36, 26, ink); box(g, wx, W - 171, 34, 24, lamps > 0.2 ? T('#FFD27A') : WDk[0]);
      if (lamps > 0.2) { box(g, wx, W - 171, 34, 3, T('#FFF0B0')); box(g, wx + 16, W - 171, 2, 24, WDk[1]); }
      else { box(g, wx + 16, W - 171, 2, 24, WDk[1]); box(g, wx, W - 160, 34, 2, WDk[1]); }
      for (const sx of [wx - 12, wx + 35]) { boards(g, sx, W - 172, 11, 26, WD, ink, nail, wx + sx, 4); }
    }
    {
      const ox = bx + 2, oy = W - 158;
      for (const s of [-1, 1]) { g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(ox - 14 * s, oy + 12); g.lineTo(ox + 14 * s, oy - 12); g.stroke(); g.strokeStyle = WD[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(ox - 14 * s, oy + 12); g.lineTo(ox + 14 * s, oy - 12); g.stroke(); poly(g, [[ox + 14 * s, oy - 12], [ox + 19 * s, oy - 19], [ox + 22 * s, oy - 16], [ox + 17 * s, oy - 10]], WD[2]); }
    }
    thatch(g, ba - 26, bb + 26, W - 98, W - 134, 44, TH, RP, ink, 23);
    thatch(g, bx - 124, bx + 124, W - 178, W - 238, 76, TH, RP, ink, 37);
    // (lanterns hung off the lower eave)
    for (const lx of [ba + 40, bb - 44]) {
      box(g, lx, W - 92, 1, 8, ink);
      box(g, lx - 4, W - 84, 9, 12, ink); box(g, lx - 3, W - 83, 7, 10, lamps > 0.2 ? T('#FFE08A') : T('#C8A060')); box(g, lx - 3, W - 83, 7, 2, T('#3A2A14')); box(g, lx - 3, W - 75, 7, 2, T('#3A2A14'));
      if (lamps > 0.2) steppedGlow(g, lx, W - 78, 24, '#FFD27A', 0.22 * lamps, 0, 3);
    }
  }
  // The sign: a carved board stood up on two log posts lashed into the ridge, a skull's grin at either end
  {
    const look = carvedLook({ sx: 3, sy: 3 }, T('#4A1A0A'), T('#F0D8A0'), 3);
    const tw = signW('JUNGLE CRUISE', look), w = Math.round(tw + 64), h = 38, l = Math.round(bx - w / 2), top = W - 310;
    for (const px of [l + 30, l + w - 40]) { pole(g, px, top + 10, W - 230, 10, LG, ink); lash(g, px - 1, W - 248, 12, RP, ink); }
    box(g, l - 2, top - 2, w + 4, h + 4, ink);
    const BD = R('#C8A070');
    box(g, l, top, w, h, BD[2]);
    for (let k = 0; k < 3; k++) { const py = top + k * 13; box(g, l, py, w, 1, BD[4]); box(g, l, py + 1, w, 2, BD[3]); box(g, l, py + 11, w, 2, BD[1]); if (k) box(g, l, py - 1, w, 1, ink); }
    for (let k = 0; k < 20; k++) box(g, l + 4 + hash(k * 2.2) * (w - 30), top + 4 + Math.floor(hash(k * 5.1) * (h - 8)), 6 + hash(k) * 14, 1, BD[1]);
    checker(g, l, top + h - 5, w, 4, BD[0], 1);
    box(g, l + 3, top + 3, w - 6, 1, BD[1]);
    signAt(g, 'JUNGLE CRUISE', bx, top + h / 2 + 5, 12, look);
    // (the skulls: bone, the eyes, the grin; nailed on)
    for (const sx of [l + 14, l + w - 14]) {
      const BN = R('#EDE4C8'), sy = top + h / 2 - 1;
      g.fillStyle = ink; g.beginPath(); g.arc(sx, sy, 8, 0, Math.PI * 2); g.fill(); box(g, sx - 5, sy + 4, 10, 6, ink);
      g.fillStyle = BN[2]; g.beginPath(); g.arc(sx, sy, 7, 0, Math.PI * 2); g.fill(); box(g, sx - 4, sy + 4, 8, 5, BN[2]);
      g.fillStyle = BN[3]; g.beginPath(); g.arc(sx - 2, sy - 2, 4, 0, Math.PI * 2); g.fill(); box(g, sx + 3, sy - 4, 3, 10, BN[1]);
      box(g, sx - 4, sy - 1, 3, 3, ink); box(g, sx + 1, sy - 1, 3, 3, ink); box(g, sx - 1, sy + 3, 2, 2, ink);
      for (let k = -3; k <= 2; k += 2) box(g, sx + k, sy + 6, 1, 3, ink);
    }
  }
  // The dock off right on its piles: planks, the rope rail on its posts, a skipper past her bow waving the next boat in
  const da = bb + 8, db = x1 - 60;
  {
    for (let x = da + 8; x < db; x += 28) { pole(g, x, deck, W + 6, 6, LG, ink); box(g, x - 3, W + 5, 12, 1, WR[4]); }
    beam(g, da, db, deck, 6, WD, ink, 17);
    for (let x = da + 10; x < db; x += 18) box(g, x, deck + 1, 1, 4, WD[1]);
    for (let x = da + 14; x < db; x += 40) { pole(g, x, deck - 26, deck, 4, LG, ink); }
    for (let x = da + 14; x + 40 < db; x += 40) { g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 2, deck - 23); g.quadraticCurveTo(x + 22, deck - 15, x + 42, deck - 23); g.stroke(); g.strokeStyle = RP[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, deck - 24); g.quadraticCurveTo(x + 22, deck - 16, x + 42, deck - 24); g.stroke(); }
    // (a skipper: khaki, the pith helmet, an arm up)
    const sx = da + 172;
    box(g, sx - 5, deck - 31, 11, 31, ink);
    box(g, sx - 4, deck - 10, 3, 10, T('#8A7A50')); box(g, sx + 1, deck - 10, 3, 10, T('#8A7A50'));
    box(g, sx - 4, deck - 22, 9, 12, T('#C8B07A')); box(g, sx - 4, deck - 22, 2, 12, T('#E0CC98'));
    box(g, sx - 3, deck - 29, 7, 7, T('#A86B43'));
    box(g, sx - 6, deck - 30, 13, 2, T('#E8DCB8')); box(g, sx - 3, deck - 34, 7, 4, T('#F4ECD0')); box(g, sx - 3, deck - 34, 2, 4, T('#FFFFFF'));
    box(g, sx + 5, deck - 36, 3, 2, ink); box(g, sx + 5, deck - 34, 2, 14, ink); box(g, sx + 6, deck - 35, 1, 13, T('#A86B43'));
  }
  // The lookout on its stilts, by the dock's end: braced, its deck and rail, the thatch cone, a lookout, the pennant
  {
    const lx = x1 - 116, ld = W - 150;
    for (const sx of [-14, 10]) pole(g, lx + sx, ld, W + 6, 5, BM, ink, 24);
    for (let y = ld + 10; y < W - 10; y += 34) { g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(lx - 12, y); g.lineTo(lx + 12, y + 30); g.moveTo(lx + 12, y); g.lineTo(lx - 12, y + 30); g.stroke(); g.strokeStyle = BM[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 12, y); g.lineTo(lx + 12, y + 30); g.moveTo(lx + 12, y); g.lineTo(lx - 12, y + 30); g.stroke(); }
    guest(g, lx - 2, ld - 2, 77, T, 0.1);
    beam(g, lx - 24, lx + 26, ld, 5, WD, ink, 41);
    beam(g, lx - 22, lx + 24, ld - 14, 3, BM, ink, 42);
    for (let x = lx - 20; x <= lx + 22; x += 7) box(g, x, ld - 12, 2, 12, BM[1]);
    for (const sx of [-22, 20]) pole(g, lx + sx, ld - 40, ld, 3, BM, ink);
    thatch(g, lx - 34, lx + 36, ld - 38, ld - 72, 33, TH, RP, ink, 47);
    box(g, lx, ld - 94, 2, 22, LG[1]);
    for (let k = 0; k < 12; k += 2) box(g, lx + 2 + k, ld - 93 + k * 0.4, 2, Math.max(1, 8 - k * 0.6), k % 4 ? T('#F4F0E8') : T('#D8402A'));
  }
  // A launch tied up at the dock, guests aboard; her reflection
  launchShadow(g, da + 10, da + 150, W + 8, WR[1], WR[0], T);
  launch(g, da + 10, W + 8, 130, 1, '7', 3, T);
  for (const rx of [da + 26, da + 124]) { g.strokeStyle = RP[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(rx, deck + 3); g.lineTo(rx + 4, W - 6); g.stroke(); }
  // The boathouse's broken reflection
  for (let y = W + 10, i = 0; y < W + 40; y += 3, i++) { const j = Math.round(Math.sin(i * 2.3) * 3); box(g, ba - 20 + j + i * 3, y, bb - ba + 40 - i * 6, 1, mix(TH[1], WR[1], 0.5 + i * 0.04)); }
  // Bunting across: a line strung over it all, flags lit up their left halves
  {
    const by = (u: number) => TOP + 92 + Math.sin(u * Math.PI) * 26;
    for (let x = x0 + 30; x < x1 - 30; x += 2) box(g, x, Math.round(by((x - x0 - 30) / (x1 - x0 - 60))), 2, 1, T('#3A2A1A'));
    for (let k = 0; k < 18; k++) {
      const u = (k + 0.5) / 18, fx = x0 + 30 + u * (x1 - x0 - 60), fy = by(u);
      const C = rampOf(['#C81E1E', '#F2C21E', '#2E7A4A', '#1E5AA8'][k % 4]).map(T);
      poly(g, [[fx - 8, fy - 1], [fx + 8, fy - 1], [fx, fy + 13]], ink);
      poly(g, [[fx - 7, fy], [fx + 7, fy], [fx, fy + 11]], C[2]);
      poly(g, [[fx - 7, fy], [fx, fy], [fx, fy + 11]], C[3]);
      box(g, fx - 6, fy, 12, 1, C[4]);
    }
  }
  g.restore();
};

/** The jungle round the gap (over the scene's edges). */
const paintFrame = (g: Ctx, tod: TimeOfDay) => {
  const cols = LEAF.map(col => mix(farTint(col, 0.6, tod), skyAt(0.9, tod), 0.2));
  for (let i = 0; i < 16; i++) { const a = Math.PI + (i / 15) * Math.PI; clump(g, CX + Math.cos(a) * (x1 - x0) / 2, GY - 40 + Math.sin(a) * (GY - TOP), 54, 40, i * 3 + 70, cols, 1); }
};

/** The launch going by on the river, painted once (bow left), and its wake. */
const PASS = { w: 150, period: 2600 };
const passing = (c: Ctx, f: number, tod: TimeOfDay) => {
  const T: Tint = col => mix(farTint(col, 0.85, tod), skyAt(0.9, tod), 0.2);
  const t = (f % PASS.period) / PASS.period, x = Math.round(x1 + 140 - t * (x1 - x0 + 420)), wl = W + 24;
  const WR = rampOf('#3E7A6A').map(T);
  c.save(); gapPath(c); c.clip();
  // (the wake: two lines spreading back from her stern, ripples breaking off them)
  for (let k = 0; k < 14; k++) {
    const bx = x + PASS.w + 4 + k * 9, sp = k * 1.4;
    box(c, bx, wl - 2 - sp, 6, 1, WR[4]); box(c, bx, wl + 2 + sp, 6, 1, k % 2 ? WR[4] : WR[3]);
    if ((f >> 3) % 2 === k % 2) box(c, bx + 2, wl, 3, 1, WR[3]);
  }
  for (let k = 0; k < 3; k++) box(c, x - 14 + ((f >> 2) % 3) - k * 2, wl - 2 + k * 2, 8, 1, WR[4]);
  c.save(); c.translate(x, wl);
  stamp(c, `jg-exitpass-${tod.key}`, -20, -90, PASS.w + 50, 120, g => { launchShadow(g, 0, PASS.w, 0, WR[1], WR[0], T); launch(g, 0, 0, PASS.w, -1, '3', 8, T); });
  c.restore();
  c.restore();
};

/** The park through the gap at the end (far back, drawn first): the Jungle Cruise. */
export const drawExitView = (c: Ctx, v: View) => {
  if (exitX < v.v0 - 1400 || exitX > v.v1 + 1400) return;
  // (culled by where it lands on the screen at its depth, its whole stamp's span)
  const sa = v.eye.x + (x0 - 160 - v.eye.x) * D, sb = v.eye.x + (x1 + 160 - v.eye.x) * D;
  if (sb < v.v0 || sa > v.v1) return;
  const tod = timeOfDay();
  atDepth(c, v.eye, D, () => {
    stamp(c, `jg-exitview2-${tod.key}`, x0 - 160, TOP - 140, x1 - x0 + 320, GY - TOP + 260, g => paintScene(g, tod));
    passing(c, v.f, tod);
    stamp(c, `jg-exitframe-${tod.key}`, x0 - 160, TOP - 140, x1 - x0 + 320, GY - TOP + 260, g => paintFrame(g, tod));
  });
};
