// The jungle's set dressing going back (the SNES pass): on the ground strip behind the play plane, each at its own depth
// (one eye: drawn d of the way from where he's looking, hazier the further), the park's fakery and the ruins it's
// dressed with, so no screen of it's just bushes: tiki torches burning (lit after dark), an idol head (fiberglass: its
// seam bolted down the side, a speaker grille for a mouth, LED eyes after dark), a broken ruin (column drums, a carved
// lintel), a stele (and its REPLICA plaque), a fiberglass boulder with its hatch hanging open, a painted backdrop flat on
// its braces and sandbags, an explorer's camp (the tent, the crate, the skeleton in the pith helmet), a tiki totem, a
// fog machine piping mist into a bush, a tree stump that's a breaker box, a camera on a too-perfect bamboo pole, a
// crashed prop biplane. Over the ravines: a rope bridge snapped in two and hanging, a mossy log fallen across, a zip line
// with an animatronic explorer stuck halfway. Still art is stamped once per hour and depth; the flames, the fog, the
// blinking lights and the swinging explorer are live.

import { timeOfDay, farTint, skyAt, type TimeOfDay } from '../../../timeOfDay';
import { stamp, steppedGlow, pixelBlob, rampOf } from '../../../intro/art/kit';
import { GROUND_Y } from '../../../../m1/constants';
import { X } from '../layout';
import { RUNS, PITS, atDepth } from './ground';
import { signAt, print, stencil as stencilLook } from '../../letters';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, clump, fern, leaf, bigLeaf, post, lashing, bamboo, LEAF, MOSS, BARK, PIX } from './paint';

const GY = GROUND_Y;
type T = (col: string) => string;

/** The hour's light on it and the haze between it and him, by how far back it is. */
const tintFor = (d: number, tod: TimeOfDay): T => {
  const haze = skyAt(0.9, tod), k = Math.min(0.62, (1 - d) * 0.85);
  return col => mix(farTint(mix(col, '#000000', 0.06), 0.5, tod), haze, k);
};
const rT = (col: string, t: T) => rampOf(col).map(t);

const STONE = ['#24221C', '#38352B', '#4F4B3C', '#69644F', '#878068', '#A8A086', '#C6BEA2'];

// ---------------------------------------------------------------------------------------------------------------
// The pieces (each at the play plane, its foot at `foot`, its middle at x; every color through `t`)

/** Stepped columns across a box (lit left, shaded right), dithered at each step: stone, fiberglass, wood. */
const stepped = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], order = [4, 5, 4, 3, 3, 3, 2, 2, 1, 1]) => {
  for (let i = 0; i < order.length; i++) {
    const a = x + Math.floor((w * i) / order.length), b = x + Math.floor((w * (i + 1)) / order.length);
    box(g, a, y, b - a, h, R[order[i]]);
    if (i && order[i] !== order[i - 1]) checker(g, a - PIX, y, PIX, h, R[order[i]], 0);
  }
};
/** A hex bolt head. */
const bolt = (g: Ctx, x: number, y: number, t: T) => { box(g, x - 1, y - 1, 4, 4, t(INK)); box(g, x, y, 2, 2, t('#8A8E96')); box(g, x, y, 1, 1, t('#D8DCE2')); };
/** Moss over a top edge (x..x+w at y), dripping. */
const mossTop = (g: Ctx, x: number, y: number, w: number, t: T, seed: number) => {
  for (let k = 0; k < w; k += 4) {
    const h = hash(seed + k * 0.37);
    if (h < 0.25) continue;
    box(g, x + k, y - 1, 4, 3, t(MOSS[h > 0.7 ? 4 : 3])); box(g, x + k, y - 1, 3, 1, t(MOSS[5]));
    if (h > 0.8) box(g, x + k + 1, y + 2, 2, 3 + Math.floor(h * 8), t(MOSS[2]));
  }
};

/** A tiki torch: a bamboo pole, its woven cup lashed on (the flame's live). */
const tikiTorch = (g: Ctx, x: number, foot: number, t: T, h = 92) => {
  const B = rT('#B89A4E', t);
  box(g, x - 4, foot - h, 8, h, t(INK));
  stepped(g, x - 3, foot - h, 6, h, B, [4, 3, 3, 2, 1, 0]);
  for (let y = foot - h + 16; y < foot - 6; y += 22) { box(g, x - 4, y, 8, 2, B[0]); box(g, x - 3, y + 2, 6, 1, B[4]); }
  // (the cup: woven, flared, lashed on; scorched at the rim)
  const S = rT('#A88448', t);
  poly(g, [[x - 9, foot - h - 14], [x + 9, foot - h - 14], [x + 6, foot - h + 4], [x - 6, foot - h + 4]], t(INK));
  poly(g, [[x - 8, foot - h - 13], [x + 8, foot - h - 13], [x + 5, foot - h + 3], [x - 5, foot - h + 3]], S[2]);
  for (let k = 0; k < 4; k++) box(g, x - 7 + k, foot - h - 11 + k * 4, 14 - k * 2, 2, k % 2 ? S[1] : S[3]);
  for (let k = -6; k < 6; k += 3) box(g, x + k, foot - h - 13, 1, 16, S[0]);
  box(g, x - 8, foot - h - 14, 16, 2, t('#2A1A0E'));
  lashing(g, x, foot - h + 6, 8, 2);
  fern(g, x + 3, foot, 16, x, 0.1, LEAF.map(t), 3);
};

/** An idol head: a stone face on a plinth (fiberglass: a bolted seam down its side, a hatch; its mouth a speaker). */
const idol = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const R = STONE.map(t), w = 96, l = x - w / 2, top = foot - 120;
  // (the plinth: coursed blocks, its top lit)
  box(g, l - 13, foot - 17, w + 26, 17, R[0]);
  stepped(g, l - 12, foot - 16, w + 24, 16, R);
  box(g, l - 12, foot - 16, w + 24, 2, R[5]);
  for (let k = 0; k < w + 24; k += 22) box(g, l - 12 + k + (k % 44 ? 0 : 6), foot - 13, 1, 13, R[1]);
  box(g, l - 12, foot - 9, w + 24, 1, R[1]);
  // (the hatch in the plinth, a padlock on it, AUDIO stenciled)
  box(g, x + 26, foot - 14, 18, 12, R[1]); box(g, x + 27, foot - 13, 16, 10, R[2]); box(g, x + 27, foot - 13, 16, 1, R[4]);
  box(g, x + 33, foot - 9, 4, 4, t('#B8A040')); box(g, x + 34, foot - 11, 2, 2, t('#6A6A70'));
  // The head: its block stepped across, the headdress tier over it
  box(g, l - 1, top - 1, w + 2, foot - 16 - top + 1, R[0]);
  stepped(g, l, top, w, foot - 16 - top, R);
  // (the headdress: a band of zigzag fret, three stepped crests)
  box(g, l - 7, top - 18, w + 14, 20, R[0]); stepped(g, l - 6, top - 17, w + 12, 18, R);
  for (let k = 0; k < w + 8; k += 8) { poly(g, [[l - 4 + k, top - 4], [l + k, top - 13], [l + 4 + k, top - 4]], R[1]); poly(g, [[l - 3 + k, top - 5], [l + k, top - 11], [l + 1 + k, top - 5]], R[4]); }
  box(g, l - 6, top - 17, w + 12, 2, R[5]);
  for (const [cx, ch] of [[x - 30, 20], [x, 30], [x + 30, 20]] as [number, number][]) {
    for (let s = 0; s < 3; s++) { const sw = 22 - s * 6; box(g, cx - sw / 2 - 1, top - 18 - (s + 1) * (ch / 3) - 1, sw + 2, ch / 3 + 1, R[0]); stepped(g, cx - sw / 2, top - 18 - (s + 1) * (ch / 3), sw, ch / 3, R, [5, 4, 3, 2, 1]); }
  }
  // (the brow: a ledge, its shadow under it)
  box(g, l + 8, top + 22, w - 16, 7, R[4]); box(g, l + 8, top + 22, w - 16, 1, R[6]); box(g, l + 8, top + 29, w - 16, 4, R[0]);
  // (the eyes: deep sockets, a hard pupil carved in)
  for (const s of [-1, 1]) {
    const ex = x + s * 22 - 11;
    box(g, ex, top + 33, 22, 14, R[0]); box(g, ex + 2, top + 35, 18, 10, t('#0E0C08'));
    box(g, ex + 7, top + 38, 8, 5, R[1]);
  }
  // (the nose: broad, lit down its left; the nostrils)
  poly(g, [[x - 7, top + 32], [x + 7, top + 32], [x + 13, top + 62], [x - 13, top + 62]], R[0]);
  poly(g, [[x - 6, top + 33], [x + 6, top + 33], [x + 11, top + 61], [x - 11, top + 61]], R[3]);
  poly(g, [[x - 6, top + 33], [x - 1, top + 33], [x - 4, top + 61], [x - 11, top + 61]], R[5]);
  poly(g, [[x + 3, top + 33], [x + 6, top + 33], [x + 11, top + 61], [x + 5, top + 61]], R[2]);
  box(g, x - 9, top + 58, 5, 3, R[0]); box(g, x + 4, top + 58, 5, 3, R[0]);
  // (the ears: spools)
  for (const s of [-1, 1]) { const ex = s < 0 ? l - 8 : l + w; box(g, ex, top + 36, 8, 26, R[0]); box(g, ex + 1, top + 37, 6, 24, R[s < 0 ? 4 : 2]); box(g, ex + 2, top + 44, 4, 8, R[0]); }
  // (the mouth: a grimace, square teeth, and behind them, a speaker's grille)
  const my = top + 68;
  box(g, x - 32, my, 64, 22, R[0]);
  box(g, x - 29, my + 3, 58, 16, t('#1A1C20'));
  for (let k = my + 5; k < my + 18; k += 3) box(g, x - 28, k, 56, 1, t('#3A3E46'));
  for (let k = 0; k < 7; k++) { box(g, x - 28 + k * 8, my + 2, 6, 5, R[5]); box(g, x - 28 + k * 8, my + 6, 6, 1, R[2]); box(g, x - 28 + k * 8, my + 15, 6, 5, R[4]); }
  box(g, x - 32, my + 22, 64, 2, R[1]);
  // (cracks, chips)
  g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(l + 14, top); g.lineTo(l + 20, top + 12); g.lineTo(l + 16, top + 20); g.moveTo(x + 36, my + 24); g.lineTo(x + 30, my + 32); g.lineTo(x + 34, foot - 18); g.stroke();
  // (the seam: fiberglass halves bolted together down the side)
  box(g, l + w - 9, top - 16, 1, foot - 16 - top + 16, t('#D8D0B4'));
  for (let y = top - 10; y < foot - 20; y += 14) bolt(g, l + w - 10, y, t);
  // (moss over the top and the brow, a vine down it, ferns at its foot)
  mossTop(g, l - 6, top - 17, w + 12, t, seed); mossTop(g, l + 8, top + 22, w - 16, t, seed + 3); mossTop(g, l - 12, foot - 16, 40, t, seed + 7);
  for (let y = top - 6; y < top + 60; y += 3) { box(g, l + 4 + Math.round(Math.sin(y * 0.2) * 2), y, 2, 3, t(LEAF[3])); if (y % 9 === 0) leaf(g, l + 5, y, 7, Math.PI - 0.4, LEAF.map(t), 3, false); }
  fern(g, l - 10, foot, 30, seed, -0.2, LEAF.map(t), 3); fern(g, l + w + 14, foot, 24, seed + 2, 0.2, LEAF.map(t), 3);
};

/** A ruin: two column stubs of drums (one broken off short), the lintel fallen across them askew, a drum on its side. */
const ruin = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const R = STONE.map(t);
  const column = (cx: number, h: number, broken: boolean) => {
    const w = 30, l = cx - w / 2;
    box(g, l - 5, foot - 10, w + 10, 10, R[0]); stepped(g, l - 4, foot - 9, w + 8, 9, R); box(g, l - 4, foot - 9, w + 8, 1, R[5]);
    for (let y = foot - 10; y > foot - h; y -= 22) {
      const dh = Math.min(22, y - (foot - h));
      box(g, l - 1, y - dh, w + 2, dh, R[0]); stepped(g, l, y - dh + 1, w, dh - 1, R);
      // (the fluting)
      for (let k = 4; k < w - 2; k += 5) box(g, l + k, y - dh + 2, 1, dh - 3, R[1]);
    }
    if (broken) { poly(g, [[l - 1, foot - h], [l + 8, foot - h - 8], [l + 15, foot - h - 3], [l + 22, foot - h - 12], [l + w + 1, foot - h]], R[0]); poly(g, [[l, foot - h + 1], [l + 8, foot - h - 6], [l + 15, foot - h - 1], [l + 22, foot - h - 10], [l + w, foot - h + 1]], R[4]); }
    mossTop(g, l, foot - h - (broken ? 2 : 0), w, t, cx);
  };
  column(x - 50, 110, false);
  column(x + 46, 66, true);
  // (the lintel, fallen across: its carved band of glyphs, one end down on the broken column)
  g.save(); g.translate(x - 4, foot - 116); g.rotate(0.28);
  box(g, -62, -1, 124, 24, R[0]); stepped(g, -61, 0, 122, 22, R, [5, 5, 4, 4, 3, 3, 3, 2, 2, 1]);
  box(g, -61, 0, 122, 2, R[6]);
  for (let k = -54; k < 50; k += 18) { box(g, k, 6, 12, 11, R[1]); box(g, k + 2, 8, 3, 3, R[0]); box(g, k + 7, 8, 3, 3, R[0]); box(g, k + 3, 13, 6, 2, R[0]); box(g, k, 6, 12, 1, R[5]); }
  g.restore();
  // (a drum rolled off, on its side)
  g.fillStyle = R[0]; g.beginPath(); g.ellipse(x + 96, foot - 13, 9, 14, 0, 0, Math.PI * 2); g.fill();
  box(g, x + 70, foot - 27, 26, 27, R[0]); stepped(g, x + 70, foot - 26, 26, 25, R, [5, 4, 3, 3, 2, 1]);
  g.fillStyle = R[3]; g.beginPath(); g.ellipse(x + 96, foot - 13, 8, 13, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.ellipse(x + 97, foot - 12, 4, 7, 0, 0, Math.PI * 2); g.fill();
  // (the jungle taking it back)
  clump(g, x - 92, foot - 18, 30, 20, seed, LEAF.map(t), 1);
  fern(g, x + 4, foot, 32, seed + 1, 0, LEAF.map(t), 3); bigLeaf(g, x + 120, foot, 16, -Math.PI / 2 + 0.4, LEAF.map(t), 3);
  for (let y = foot - 106; y < foot - 20; y += 3) box(g, x - 38 + Math.round(Math.sin(y * 0.15) * 2), y, 2, 3, t(y % 9 ? LEAF[2] : LEAF[4]));
};

/** A stele: a carved slab (a face, dot-and-bar numbers, a border), and a brass REPLICA plaque at its foot. */
const stele = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const R = STONE.map(t), w = 54, h = 124, l = x - w / 2, top = foot - h;
  poly(g, [[l - 1, foot], [l - 1, top + 12], [l + 10, top - 1], [l + w - 10, top - 1], [l + w + 1, top + 12], [l + w + 1, foot]], R[0]);
  g.save(); g.beginPath(); g.moveTo(l, foot); g.lineTo(l, top + 12); g.lineTo(l + 10, top); g.lineTo(l + w - 10, top); g.lineTo(l + w, top + 12); g.lineTo(l + w, foot); g.closePath(); g.clip();
  stepped(g, l, top, w, h, R);
  g.restore();
  // (the border, cut)
  g.strokeStyle = R[1]; g.lineWidth = 2; g.strokeRect(l + 5, top + 12, w - 10, h - 20);
  // (the face: square-spiral eyes, a fanged mouth, earflares)
  const fy = top + 22;
  box(g, l + 10, fy, w - 20, 40, R[2]); box(g, l + 10, fy, w - 20, 1, R[5]);
  for (const s of [-1, 1]) { const ex = x + s * 9 - 5; box(g, ex, fy + 8, 10, 10, R[0]); box(g, ex + 2, fy + 10, 6, 6, R[4]); box(g, ex + 4, fy + 12, 4, 2, R[0]); }
  box(g, x - 12, fy + 26, 24, 8, R[0]); for (let k = 0; k < 4; k++) box(g, x - 10 + k * 6, fy + 26, 3, 4, R[5]);
  box(g, x - 2, fy + 18, 4, 7, R[1]);
  // (the numbers: dots over bars)
  for (let r = 0; r < 3; r++) {
    const ny = fy + 50 + r * 14;
    for (let k = 0; k < 1 + ((seed + r) % 3); k++) { box(g, x - 10 + k * 8, ny, 4, 4, R[0]); box(g, x - 10 + k * 8, ny, 3, 1, R[5]); }
    box(g, x - 14, ny + 6, 28, 3, R[0]); box(g, x - 14, ny + 6, 28, 1, R[5]);
  }
  mossTop(g, l + 8, top + 1, w - 16, t, seed);
  // (the plaque: brass, on a stake)
  box(g, x + 33, foot - 18, 2, 18, t('#4A4A50'));
  box(g, x + 22, foot - 28, 26, 13, t(INK)); box(g, x + 23, foot - 27, 24, 11, t('#B8963A')); box(g, x + 23, foot - 27, 24, 1, t('#F0D47A'));
  signAt(g, 'REPLICA', x + 35, foot - 19, 5, print(5, t('#3A2A0A')));
  fern(g, l - 6, foot, 26, seed + 3, -0.1, LEAF.map(t), 3);
};

/** A fiberglass boulder: blocky rock in steps, a row of hex bolts down a seam, HL-ROCK stenciled faint, its hatch
 *  hanging open (dark inside, an extension cord). */
const fakeRock = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const R = ['#2A2824', '#3E3B33', '#56523F', '#706A55', '#8E876C', '#ACA486'].map(t);
  const pts: [number, number][] = [[x - 62, foot], [x - 58, foot - 40], [x - 38, foot - 70], [x - 6, foot - 82], [x + 30, foot - 74], [x + 54, foot - 46], [x + 64, foot]];
  poly(g, pts.map(([px, py]) => [px + (px < x ? -1 : 1), py - 1] as [number, number]), R[0]);
  poly(g, pts, R[2]);
  poly(g, [[x - 58, foot - 40], [x - 38, foot - 70], [x - 6, foot - 82], [x + 2, foot - 64], [x - 26, foot - 50], [x - 44, foot - 26]], R[4]);
  poly(g, [[x - 38, foot - 70], [x - 6, foot - 82], [x - 10, foot - 72], [x - 30, foot - 64]], R[5]);
  poly(g, [[x + 30, foot - 74], [x + 54, foot - 46], [x + 64, foot], [x + 30, foot], [x + 22, foot - 40]], R[1]);
  checker(g, x - 44, foot - 46, 60, PIX, R[3], 0);
  // (too smooth: and the seam gives it away, bolted)
  box(g, x + 4, foot - 80, 1, 80, R[5]);
  for (let y = foot - 74; y < foot - 6; y += 12) bolt(g, x + 3, y, t);
  signAt(g, 'HL-ROCK 23', x - 22, foot - 22, 5, stencilLook(5, mix(R[1], R[2], 0.5)));
  // (the hatch, hanging open on its hinge: the hollow inside, an orange cord out of it)
  box(g, x + 22, foot - 34, 22, 26, t('#0A0806')); box(g, x + 22, foot - 34, 22, 2, R[0]);
  poly(g, [[x + 44, foot - 34], [x + 52, foot - 30], [x + 52, foot - 4], [x + 44, foot - 8]], R[3]); box(g, x + 44, foot - 32, 1, 24, t(INK));
  g.strokeStyle = t('#E0701E'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 30, foot - 12); g.quadraticCurveTo(x + 40, foot + 2, x + 78, foot - 2); g.stroke();
  mossTop(g, x - 36, foot - 70, 30, t, seed);
  fern(g, x - 66, foot, 24, seed, -0.2, LEAF.map(t), 3);
};

/** A painted backdrop flat: two plywood panels painted with a view (a sky, a purple mountain, palms, a river, a parrot),
 *  the seam taped, a corner peeling, SET 4B on it; its braces and sandbags behind, bushes up its foot. */
const flat = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const w = 236, h = 156, l = x - w / 2, top = foot - h;
  // (the braces behind, out either side: 2x4s down to the ground, sandbags on their feet)
  const wood = rT('#A88A5A', t);
  for (const s of [-1, 1]) {
    const bx = s < 0 ? l + 20 : l + w - 20;
    g.strokeStyle = t(INK); g.lineWidth = 6; g.beginPath(); g.moveTo(bx, top + 30); g.lineTo(bx + s * 40, foot); g.stroke();
    g.strokeStyle = wood[2]; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, top + 30); g.lineTo(bx + s * 40, foot); g.stroke();
    for (let k = 0; k < 2; k++) { const sx = bx + s * 34 - 10 + k * 8; g.fillStyle = t(INK); g.beginPath(); g.ellipse(sx, foot - 5 - k * 4, 10, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = t('#8A7A52'); g.beginPath(); g.ellipse(sx, foot - 5 - k * 4, 9, 5, 0, 0, Math.PI * 2); g.fill(); box(g, sx - 6, foot - 9 - k * 4, 6, 1, t('#B4A478')); }
  }
  // (the panels: the edge showing its plywood, then the paint)
  box(g, l - 1, top - 1, w + 2, h + 1, t(INK));
  box(g, l, top, w, h, wood[3]);
  const P = (col: string) => t(col);
  // the painted sky, in flat bands (painted: a few hard steps, brush streaks between)
  const sky = ['#6AA8D8', '#86BCE0', '#A8D0E6', '#CCE4EA'];
  for (let i = 0; i < 4; i++) box(g, l + 2, top + 2 + i * 16, w - 4, 16, P(sky[i]));
  for (let k = 0; k < 20; k++) box(g, l + 4 + hash(seed + k) * (w - 30), top + 6 + hash(seed + k * 2) * 56, 14 + hash(k) * 16, 1, P(sky[Math.min(3, 1 + (k % 3))]));
  // (a painted cloud, a painted mountain, purple, a white cap, a painted falls)
  pixelBlob(g, l + 60, top + 16, 26, 6, P('#F4F8FA'));
  poly(g, [[l + 90, top + 82], [l + 150, top + 26], [l + 214, top + 82]], P('#7A6AA8'));
  poly(g, [[l + 150, top + 26], [l + 214, top + 82], [l + 168, top + 82]], P('#5E5088'));
  poly(g, [[l + 138, top + 38], [l + 150, top + 26], [l + 162, top + 38], [l + 154, top + 34], [l + 146, top + 40]], P('#F4F4FA'));
  box(g, l + 176, top + 52, 4, 30, P('#DCF0FA'));
  // (painted jungle: green humps, a river through it, two palms)
  for (let k = 0; k < 10; k++) { g.fillStyle = P(k % 2 ? '#3A8A3A' : '#2E7230'); g.beginPath(); g.ellipse(l + 10 + k * 24, top + 92, 20, 16, 0, Math.PI, 0); g.fill(); }
  box(g, l + 2, top + 92, w - 4, h - 94, P('#2A6A2E'));
  poly(g, [[l + 70, foot - 2], [l + 120, top + 96], [l + 132, top + 96], [l + 140, foot - 2]], P('#4A9AC0'));
  box(g, l + 104, top + 110, 12, 1, P('#C8ECF8')); box(g, l + 98, top + 126, 18, 1, P('#C8ECF8'));
  for (const [px, ph] of [[l + 40, 60], [l + 200, 70]] as [number, number][]) {
    g.strokeStyle = P('#6A4A2A'); g.lineWidth = 4; g.beginPath(); g.moveTo(px, top + 112); g.quadraticCurveTo(px + 6, top + 112 - ph / 2, px + 2, top + 112 - ph); g.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.6; g.strokeStyle = P('#2E8A3A'); g.lineWidth = 3; g.beginPath(); g.moveTo(px + 2, top + 112 - ph); g.quadraticCurveTo(px + 2 + Math.cos(a) * 14, top + 112 - ph + Math.sin(a) * 14 - 4, px + 2 + Math.cos(a) * 22, top + 112 - ph + Math.sin(a) * 18 + 6); g.stroke(); }
  }
  // (a painted parrot, badly)
  box(g, l + 160, top + 100, 8, 12, P('#D82A20')); box(g, l + 166, top + 98, 5, 5, P('#D82A20')); box(g, l + 170, top + 100, 3, 2, P('#F0C020')); box(g, l + 158, top + 104, 4, 8, P('#2A5AD0'));
  // (the seam, taped; the corner peeling to the plywood; SET 4B; nail heads)
  box(g, x - 1, top, 2, h, t('#5A4A2A')); for (let y = top + 6; y < foot; y += 26) box(g, x - 4, y, 8, 12, t('#D8D0B0'));
  poly(g, [[l + w - 2, foot - 40], [l + w - 2, foot - 2], [l + w - 34, foot - 2]], wood[2]); poly(g, [[l + w - 34, foot - 2], [l + w - 2, foot - 40], [l + w - 12, foot - 14]], P('#3A7A3E'));
  signAt(g, 'SET 4B', l + 26, foot - 8, 5, stencilLook(5, t('#E8E0C0')));
  box(g, l, top, w, 2, wood[4]); box(g, l + w - 2, top, 2, h, wood[1]);
  // (the jungle up its foot, hiding where it stands)
  for (let k = 0; k < 6; k++) clump(g, l + 8 + k * 44 + hash(seed + k) * 10, foot - 10, 26, 16, seed + k * 3, LEAF.map(t), 1);
};

/** An explorer's camp (props): a striped canvas tent, a crate (PROPS), a lantern on a pole, and the explorer's skeleton
 *  sat against the crate in his pith helmet, his canteen still on. */
const camp = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const C = rT('#D8C8A0', t), S = rT('#7A8A4A', t);
  // (the tent: an A-frame of canvas, a stripe, its flap tied back, the dark inside)
  poly(g, [[x - 86, foot], [x - 40, foot - 74], [x + 6, foot]], t(INK));
  poly(g, [[x - 84, foot - 1], [x - 40, foot - 72], [x + 4, foot - 1]], C[2]);
  poly(g, [[x - 84, foot - 1], [x - 40, foot - 72], [x - 52, foot - 1]], C[3]);
  poly(g, [[x - 40, foot - 72], [x + 4, foot - 1], [x - 12, foot - 1]], C[1]);
  poly(g, [[x - 40, foot - 46], [x - 26, foot - 1], [x - 54, foot - 1]], t('#141008'));
  poly(g, [[x - 40, foot - 46], [x - 54, foot - 1], [x - 64, foot - 1]], C[4]);
  for (let k = 0; k < 3; k++) box(g, x - 74 + k * 4, foot - 18 - k * 14, 44 - k * 8, 3, t('#A8463A'));
  box(g, x - 41, foot - 80, 2, 10, t('#5A4022'));
  g.strokeStyle = t('#8A7A5A'); g.lineWidth = 1; g.beginPath(); g.moveTo(x - 84, foot - 1); g.lineTo(x - 100, foot); g.moveTo(x + 4, foot - 1); g.lineTo(x + 20, foot); g.stroke();
  // (the crate, PROPS on it; its lid off and leant)
  const cx = x + 24, cw = 50, ch = 34;
  box(g, cx - 1, foot - ch - 1, cw + 2, ch + 1, t(INK));
  const W = rT('#9A6A36', t);
  box(g, cx, foot - ch, cw, ch, W[2]);
  for (let y = foot - ch + 8; y < foot; y += 9) { box(g, cx, y, cw, 1, W[1]); box(g, cx, y + 1, cw, 1, W[3]); }
  box(g, cx, foot - ch, cw, 2, W[4]); box(g, cx, foot - ch, 4, ch, W[1]); box(g, cx + cw - 4, foot - ch, 4, ch, W[1]);
  signAt(g, 'PROPS', cx + cw / 2, foot - 14, 5, stencilLook(5, t('#2A1608')));
  // (a lantern on a bamboo pole: its glow is live)
  bamboo(g, cx + cw + 10, foot - 70, 70, 4);
  box(g, cx + cw + 14, foot - 72, 10, 2, t('#3A3A3A')); box(g, cx + cw + 16, foot - 70, 1, 4, t('#3A3A3A'));
  box(g, cx + cw + 13, foot - 66, 10, 13, t(INK)); box(g, cx + cw + 14, foot - 65, 8, 11, t('#C8A060')); box(g, cx + cw + 14, foot - 65, 8, 2, t('#3A2A14'));
  // (the explorer: bones in khaki, sat against the crate, his helmet tipped over one eye socket)
  const sx = cx - 6;
  limbBone(g, sx, foot - 8, sx - 22, foot - 3, t); limbBone(g, sx - 22, foot - 3, sx - 34, foot - 1, t);
  poly(g, [[sx - 10, foot - 34], [sx + 6, foot - 34], [sx + 8, foot - 4], [sx - 12, foot - 4]], S[2]);
  box(g, sx - 10, foot - 34, 4, 30, S[3]); box(g, sx - 2, foot - 32, 1, 26, S[0]);
  box(g, sx - 6, foot - 22, 8, 2, S[0]);
  for (let k = 0; k < 4; k++) box(g, sx - 6, foot - 30 + k * 4, 8, 1, t('#E8E0C8'));
  limbBone(g, sx - 8, foot - 30, sx - 18, foot - 14, t); limbBone(g, sx - 18, foot - 14, sx - 12, foot - 6, t);
  g.fillStyle = t(INK); g.beginPath(); g.arc(sx - 2, foot - 42, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = t('#E8E0C8'); g.beginPath(); g.arc(sx - 2, foot - 42, 8, 0, Math.PI * 2); g.fill();
  box(g, sx - 6, foot - 43, 3, 3, t(INK)); box(g, sx + 1, foot - 43, 3, 3, t(INK)); box(g, sx - 3, foot - 36, 6, 2, t(INK)); for (let k = 0; k < 3; k++) box(g, sx - 3 + k * 2, foot - 36, 1, 2, t('#E8E0C8'));
  g.fillStyle = t(INK); g.beginPath(); g.ellipse(sx - 1, foot - 48, 13, 5, -0.25, Math.PI, 0); g.fill();
  g.fillStyle = t('#E8DCB0'); g.beginPath(); g.ellipse(sx - 1, foot - 48, 12, 4, -0.25, Math.PI, 0); g.fill();
  g.fillStyle = t('#E8DCB0'); g.beginPath(); g.ellipse(sx - 2, foot - 51, 8, 6, -0.25, Math.PI, 0); g.fill(); box(g, sx - 9, foot - 50, 15, 1, t('#8A7A4A'));
  ballOf(g, sx + 8, foot - 24, 4, t('#6A7A8A'), t);
  fern(g, x - 100, foot, 22, seed, -0.2, LEAF.map(t), 3); bigLeaf(g, x + 92, foot, 14, -Math.PI / 2 + 0.3, LEAF.map(t), 3);
};
const limbBone = (g: Ctx, x0: number, y0: number, x1: number, y1: number, t: T) => {
  g.strokeStyle = t(INK); g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = t('#E8E0C8'); g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.lineCap = 'butt';
};
const ballOf = (g: Ctx, x: number, y: number, r: number, col: string, t: T) => {
  g.fillStyle = t(INK); g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  box(g, x - r * 0.5, y - r * 0.5, 2, 1, t('#E8ECF0'));
};

/** A tiki totem: three faces stacked, carved, their paint flaking (red, teal, yellow). */
const totem = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const W = rT('#7A5634', t), w = 40, l = x - w / 2, h = 156;
  box(g, l - 1, foot - h - 1, w + 2, h + 1, t(INK));
  stepped(g, l, foot - h, w, h, W, [3, 4, 3, 2, 2, 2, 1, 1, 0]);
  const paint = ['#B8382A', '#2A8A8A', '#D8A82A'];
  for (let k = 0; k < 3; k++) {
    const fy = foot - h + 8 + k * 50, col = t(paint[((Math.floor(k + seed) % 3) + 3) % 3]);
    // (the brow band, painted)
    box(g, l, fy, w, 6, col); box(g, l, fy, w, 1, t('#FFF0C8')); for (let c = 0; c < w; c += 5) if (hash(seed + c + k) > 0.6) box(g, l + c, fy + 2, 3, 3, W[2]);
    // (the eyes: big ovals, bored; the nose; the mouth: teeth or a tongue out)
    for (const s of [-1, 1]) { g.fillStyle = t(INK); g.beginPath(); g.ellipse(x + s * 9, fy + 14, 7, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = t('#E8DCC0'); g.beginPath(); g.ellipse(x + s * 9, fy + 14, 6, 4, 0, 0, Math.PI * 2); g.fill(); box(g, x + s * 9 - 2, fy + 12, 4, 4, t(INK)); }
    poly(g, [[x - 3, fy + 16], [x + 3, fy + 16], [x + 6, fy + 28], [x - 6, fy + 28]], W[1]); box(g, x - 3, fy + 16, 2, 12, W[4]);
    box(g, x - 13, fy + 31, 26, 11, t(INK)); box(g, x - 12, fy + 32, 24, 9, t('#2A0E08'));
    if (k === 1) { box(g, x - 4, fy + 36, 8, 10, t('#C84A5A')); box(g, x - 1, fy + 37, 1, 7, t('#8A2A3A')); }
    else for (let c = 0; c < 5; c++) { box(g, x - 11 + c * 5, fy + 32, 3, 3, t('#E8DCC0')); box(g, x - 11 + c * 5, fy + 38, 3, 3, t('#E8DCC0')); }
    box(g, l, fy + 46, w, 2, W[0]);
  }
  // (its ears, on top: a flared crest)
  poly(g, [[l - 10, foot - h + 4], [l, foot - h - 6], [l + w, foot - h - 6], [l + w + 10, foot - h + 4]], t(INK));
  poly(g, [[l - 8, foot - h + 3], [l + 1, foot - h - 5], [l + w - 1, foot - h - 5], [l + w + 8, foot - h + 3]], W[3]);
  mossTop(g, l, foot - h - 5, w, t, seed);
  fern(g, l - 4, foot, 26, seed, -0.2, LEAF.map(t), 3); fern(g, l + w + 6, foot, 20, seed + 1, 0.2, LEAF.map(t), 3);
};

/** A fog machine (its puffs are live): a gray box on rubber feet, a dial, a hose snaking off into a bush. */
const fogMachine = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const M = rT('#7A8088', t);
  box(g, x - 23, foot - 31, 46, 28, t(INK));
  stepped(g, x - 22, foot - 30, 44, 26, M, [4, 3, 3, 2, 2, 2, 2, 1, 1, 0]);
  box(g, x - 22, foot - 30, 44, 2, M[4]);
  for (let k = 0; k < 5; k++) box(g, x - 18, foot - 24 + k * 3, 14, 1, M[0]);
  box(g, x + 4, foot - 25, 12, 8, t(INK)); box(g, x + 5, foot - 24, 10, 6, t('#E8E0C0')); box(g, x + 9, foot - 23, 1, 4, t('#C81E1E'));
  signAt(g, 'FOG', x + 10, foot - 10, 5, print(5, t('#F0D040')));
  for (const fx of [x - 18, x + 14]) box(g, fx, foot - 4, 6, 4, t('#1A1A1A'));
  // (the hose, ribbed, off to a bush)
  g.strokeStyle = t(INK); g.lineWidth = 7; g.beginPath(); g.moveTo(x + 22, foot - 18); g.quadraticCurveTo(x + 46, foot - 2, x + 70, foot - 14); g.stroke();
  g.strokeStyle = t('#3A3E44'); g.lineWidth = 5; g.stroke();
  for (let k = 0; k < 8; k++) { const u = k / 8, hx = (1 - u) * (1 - u) * (x + 22) + 2 * u * (1 - u) * (x + 46) + u * u * (x + 70), hy = (1 - u) * (1 - u) * (foot - 18) + 2 * u * (1 - u) * (foot - 2) + u * u * (foot - 14); box(g, hx - 1, hy - 2, 1, 4, t('#6A6E76')); }
  clump(g, x + 82, foot - 18, 30, 20, seed, LEAF.map(t), 1);
  fern(g, x - 30, foot, 18, seed + 1, -0.2, LEAF.map(t), 3);
};

/** A stump that's a breaker box: bark painted on fiberglass (too even), its rings painted on top, its door hanging open
 *  on the breakers, a HIGH VOLTAGE plate, the conduit into the ground. */
const stumpBox = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const B = BARK.map(t), w = 56, h = 50, l = x - w / 2;
  box(g, l - 1, foot - h - 1, w + 2, h + 1, t(INK));
  stepped(g, l, foot - h, w, h, B.slice(1));
  // (bark painted on: grooves too evenly spaced)
  for (let k = 5; k < w - 2; k += 7) box(g, l + k, foot - h + 6, 2, h - 8, B[1]);
  // (the top: painted rings)
  g.fillStyle = t(INK); g.beginPath(); g.ellipse(x, foot - h, w / 2 + 1, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = t('#B8925E'); g.beginPath(); g.ellipse(x, foot - h, w / 2, 6, 0, 0, Math.PI * 2); g.fill();
  for (const r of [0.7, 0.45, 0.2]) { g.strokeStyle = t('#8A6A40'); g.lineWidth = 1; g.beginPath(); g.ellipse(x, foot - h, (w / 2) * r, 6 * r, 0, 0, Math.PI * 2); g.stroke(); }
  // (the door, open: the breakers in rows inside, one flipped red)
  box(g, l + 10, foot - h + 10, 26, 32, t('#1A1C20'));
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { box(g, l + 13 + k * 8, foot - h + 13 + r * 7, 5, 5, t('#5A5E66')); box(g, l + 14 + k * 8, foot - h + 14 + r * 7, 3, 2, t(r === 2 && k === 1 ? '#D82A20' : '#C8CCD2')); }
  poly(g, [[l + 10, foot - h + 10], [l - 8, foot - h + 14], [l - 8, foot - h + 38], [l + 10, foot - h + 42]], B[3]);
  for (let k = -6; k < 8; k += 5) box(g, l + k, foot - h + 16, 2, 22, B[1]);
  // (HIGH VOLTAGE: a yellow plate, the bolt on it)
  poly(g, [[l + 46, foot - h + 12], [l + 54, foot - h + 26], [l + 38, foot - h + 26]], t(INK));
  poly(g, [[l + 46, foot - h + 14], [l + 52, foot - h + 25], [l + 40, foot - h + 25]], t('#F2C21E'));
  poly(g, [[l + 47, foot - h + 16], [l + 44, foot - h + 21], [l + 47, foot - h + 21], [l + 45, foot - h + 24]], t(INK));
  // (the conduit)
  box(g, l + w - 6, foot - 10, 16, 6, t(INK)); box(g, l + w - 6, foot - 9, 16, 4, t('#8A8E96'));
  fern(g, l - 10, foot, 22, seed, -0.2, LEAF.map(t), 3); bigLeaf(g, l + w + 16, foot, 12, -Math.PI / 2 + 0.3, LEAF.map(t), 3);
};

/** A security camera on a bamboo pole (molded plastic, every node the same), its cable taped down it. */
const cameraPole = (g: Ctx, x: number, foot: number, t: T) => {
  const B = rT('#B8A25A', t), h = 150;
  box(g, x - 4, foot - h, 8, h, t(INK)); stepped(g, x - 3, foot - h, 6, h, B, [4, 3, 3, 2, 1, 0]);
  for (let y = foot - h + 20; y < foot; y += 20) { box(g, x - 4, y, 8, 2, B[0]); box(g, x - 3, y + 2, 6, 1, B[4]); }
  box(g, x + 3, foot - h + 10, 1, h - 10, t('#1A1A1A'));
  for (let y = foot - h + 30; y < foot; y += 34) box(g, x + 2, y, 4, 3, t('#C8C0A0'));
  // (the camera: a white housing, its hood, its lens)
  box(g, x - 3, foot - h - 4, 10, 6, t('#5A5E66'));
  poly(g, [[x - 4, foot - h - 16], [x + 22, foot - h - 12], [x + 22, foot - h - 2], [x - 4, foot - h - 4]], t(INK));
  poly(g, [[x - 3, foot - h - 15], [x + 21, foot - h - 11], [x + 21, foot - h - 3], [x - 3, foot - h - 5]], t('#E4E6EA'));
  box(g, x - 3, foot - h - 15, 24, 2, t('#F8F8FA')); box(g, x - 3, foot - h - 7, 24, 2, t('#A8ACB4'));
  box(g, x + 20, foot - h - 11, 4, 6, t('#1A1C22')); box(g, x + 21, foot - h - 10, 1, 1, t('#8AC8F8'));
  fern(g, x, foot, 30, x, 0, LEAF.map(t), 3);
};

/** A crashed prop biplane, nose down in the bushes: its fuselage in olive drab, the roundel, a wing snapped, the
 *  propeller bent, the tail up with HL-2 on it, vines grown over. */
const plane = (g: Ctx, x: number, foot: number, t: T, seed: number) => {
  const O = rT('#6E7A44', t), C = rT('#D8C8A0', t);
  g.save(); g.translate(x, foot - 34); g.rotate(-0.32);
  // (the far wing, broken, behind)
  box(g, -40, -36, 90, 8, O[1]); box(g, -40, -36, 90, 1, O[3]);
  // (the fuselage, tapering to the tail; ribs showing through torn fabric)
  poly(g, [[-70, -14], [60, -22], [72, -10], [60, 10], [-70, 2]], t(INK));
  poly(g, [[-69, -13], [59, -21], [70, -10], [59, 9], [-69, 1]], O[2]);
  poly(g, [[-69, -13], [59, -21], [62, -16], [-69, -8]], O[3]);
  poly(g, [[-69, -3], [59, 4], [59, 9], [-69, 1]], O[1]);
  box(g, 10, -14, 22, 14, t('#141008')); for (let k = 12; k < 32; k += 5) box(g, k, -14, 2, 14, C[1]);
  // (the roundel)
  g.fillStyle = t(INK); g.beginPath(); g.arc(-20, -6, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = t('#E8E0C8'); g.beginPath(); g.arc(-20, -6, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = t('#B8382A'); g.beginPath(); g.arc(-20, -6, 4, 0, Math.PI * 2); g.fill();
  // (the cockpit and its windscreen)
  box(g, 34, -26, 14, 6, t(INK)); box(g, 35, -25, 12, 4, t('#9AC8D8'));
  // (the tail, up, HL-2 on it)
  poly(g, [[-70, -14], [-86, -44], [-74, -44], [-58, -16]], t(INK)); poly(g, [[-69, -15], [-84, -42], [-75, -42], [-60, -16]], O[2]);
  signAt(g, 'HL-2', -73, -26, 5, print(5, C[3]));
  // (the near wing: struts up, snapped off halfway)
  box(g, -20, 4, 64, 7, t(INK)); box(g, -19, 5, 62, 5, O[2]); box(g, -19, 5, 62, 1, O[4]);
  poly(g, [[43, 4], [52, 0], [48, 10], [43, 11]], O[1]);
  for (const sx of [-12, 30]) { box(g, sx, -30, 2, 34, t(INK)); box(g, sx, -30, 1, 34, C[2]); }
  box(g, -20, -34, 62, 6, t(INK)); box(g, -19, -33, 60, 4, O[3]);
  g.restore();
  // (the nose in the dirt, the propeller bent: one blade up, one curled)
  g.fillStyle = t(INK); g.beginPath(); g.arc(x + 66, foot - 50, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = t('#5A5E66'); g.beginPath(); g.arc(x + 66, foot - 50, 6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = t(INK); g.lineWidth = 5; g.beginPath(); g.moveTo(x + 66, foot - 50); g.lineTo(x + 60, foot - 84); g.moveTo(x + 66, foot - 50); g.quadraticCurveTo(x + 76, foot - 34, x + 88, foot - 36); g.stroke();
  g.strokeStyle = t('#8A6A40'); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 66, foot - 50); g.lineTo(x + 60, foot - 84); g.moveTo(x + 66, foot - 50); g.quadraticCurveTo(x + 76, foot - 34, x + 88, foot - 36); g.stroke();
  // (dirt thrown up round the nose, vines over the lot)
  for (let k = 0; k < 5; k++) pixelBlob(g, x + 50 + k * 10, foot - 6 - (k % 2) * 4, 14, 6, t(k % 2 ? '#4A3A22' : '#5E4A2C'));
  for (let i = 0; i < 4; i++) for (let y = foot - 80 + i * 6; y < foot - 20; y += 3) box(g, x - 60 + i * 36 + Math.round(Math.sin(y * 0.2 + i) * 2), y, 2, 3, t(LEAF[(y >> 2) % 2 ? 2 : 4]));
  clump(g, x + 92, foot - 16, 34, 20, seed, LEAF.map(t), 1); clump(g, x - 92, foot - 12, 28, 16, seed + 4, LEAF.map(t), 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Where they stand (x from the jungle's start, how far back, what), and the live bits

type Kind = 'tiki' | 'idol' | 'ruin' | 'stele' | 'rock' | 'flat' | 'camp' | 'totem' | 'fog' | 'stump' | 'camera' | 'plane';
const PLACED: [number, number, Kind][] = [
  [110, 0.9, 'tiki'], [420, 0.9, 'tiki'], [640, 0.7, 'idol'],
  [1300, 0.82, 'stele'], [1720, 0.72, 'rock'], [2180, 0.66, 'flat'], [2700, 0.78, 'camp'], [3080, 0.86, 'totem'], [3360, 0.74, 'fog'],
  [4620, 0.7, 'ruin'], [5020, 0.86, 'stump'],
  [5560, 0.9, 'tiki'], [5660, 0.9, 'tiki'], [6020, 0.68, 'idol'], [6420, 0.8, 'rock'], [6680, 0.9, 'camera'],
  [8000, 0.68, 'flat'], [8440, 0.8, 'totem'], [8960, 0.72, 'plane'], [9300, 0.84, 'stele'], [9560, 0.9, 'tiki'],
  [10880, 0.7, 'ruin'], [11180, 0.8, 'fog'], [11420, 0.86, 'tiki'], [11860, 0.9, 'camera'],
];
interface Piece { x: number; d: number; kind: Kind; foot: number; i: number }
const PIECES: Piece[] = PLACED.map(([rx, d, kind], i) => {
  const x = X(rx), r = RUNS.find(q => x > q.a + 20 && x < q.b - 20);
  return { x, d, kind, foot: r ? r.y : GY, i };
}).filter(p => RUNS.some(q => p.x > q.a + 20 && p.x < q.b - 20)).sort((a, b) => a.d - b.d);
const HALF: Record<Kind, number> = { tiki: 20, idol: 80, ruin: 140, stele: 60, rock: 90, flat: 180, camp: 130, totem: 50, fog: 120, stump: 60, camera: 30, plane: 140 };
const PAINT: Record<Kind, (g: Ctx, x: number, foot: number, t: T, seed: number) => void> = {
  tiki: (g, x, f, t) => tikiTorch(g, x, f, t), idol, ruin, stele, rock: fakeRock, flat, camp, totem, fog: fogMachine, stump: stumpBox,
  camera: (g, x, f, t) => cameraPole(g, x, f, t), plane,
};

/** A torch's flame (in steps), its glow after dark. */
const flame = (c: Ctx, x: number, y: number, f: number, lamps: number, s = 1) => {
  const k = (f >> 2) % 4, h = [16, 19, 17, 20][k] * s;
  if (lamps > 0.05) steppedGlow(c, x, y - 8, 46, '#FFB04A', 0.22 * lamps, 0, 4);
  poly(c, [[x - 7 * s, y], [x - 5 * s, y - h * 0.6], [x + [1, -1, 2, 0][k] * s, y - h], [x + 5 * s, y - h * 0.5], [x + 7 * s, y]], '#C2410C');
  poly(c, [[x - 5 * s, y], [x - 2 * s, y - h * 0.5], [x + [0, -1, 1, 0][k] * s, y - h * 0.75], [x + 3 * s, y - h * 0.4], [x + 5 * s, y]], '#F59E0B');
  poly(c, [[x - 2 * s, y], [x, y - h * 0.4], [x + 2 * s, y]], '#FDE68A');
  // (a spark up off it now and then)
  if ((f + x) % 40 < 10) box(c, x + Math.sin(f * 0.3 + x) * 4, y - h - ((f + x) % 40), 2, 2, '#FDE68A');
};

/** What moves on a piece (drawn at its depth, over its stamp). */
const live = (c: Ctx, p: Piece, f: number, tod: TimeOfDay) => {
  const { x, foot } = p, lamps = tod.lamps;
  if (p.kind === 'tiki') flame(c, x, foot - 104, f + p.i * 17, lamps);
  else if (p.kind === 'idol' && lamps > 0.2) {
    // (LED eyes, red, after dark: the park's idea of spooky)
    for (const s of [-1, 1]) { steppedGlow(c, x + s * 22, foot - 120 + 40, 14, '#FF3020', 0.3 * lamps, 0, 3); box(c, x + s * 22 - 3, foot - 120 + 38, 6, 4, '#FF5A3A'); box(c, x + s * 22 - 1, foot - 120 + 39, 2, 1, '#FFD0C0'); }
  } else if (p.kind === 'camp') {
    const lx = x + 24 + 50 + 18, ly = foot - 59;
    if (lamps > 0.05) { steppedGlow(c, lx, ly, 30, '#FFC060', 0.25 * lamps, 0, 3); box(c, lx - 4, ly - 5, 8, 9, '#FFE08A'); box(c, lx - 1, ly - 3, 2, 4, '#FFF6D0'); }
  } else if (p.kind === 'fog') {
    // (puffs out of the bush, drifting along the ground and thinning)
    for (let k = 0; k < 6; k++) {
      const t = ((f * 0.6 + k * 40) % 240) / 240;
      pixelBlob(c, x + 82 + t * 120 + Math.sin(t * 6 + k) * 6, foot - 10 - t * 18, 18 + t * 40, 6 + t * 8, `rgba(230, 238, 236, ${(0.35 * (1 - t)).toFixed(3)})`);
    }
  } else if (p.kind === 'camera') {
    if ((f >> 4) % 4 === 0) box(c, x + 15, foot - 150 - 13, 2, 2, '#FF2A1A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ravines' dressing (after the banks' faces: it hangs in front of them)

/** A rope bridge snapped in two: each half hanging from its posts down into the ravine, planks swinging. */
const brokenBridge = (g: Ctx, a: number, b: number, y: number, t: T) => {
  const R = rT('#C8A86A', t), W = rT('#7A5634', t);
  for (const [px, s] of [[a, 1], [b, -1]] as [number, number][]) {
    // (the posts, carved tops)
    for (const dx of [-10, 6]) { post(g, px - s * 18 + dx - 4, y - 46, y, 8, W[2]); box(g, px - s * 18 + dx - 4, y - 46, 8, 3, W[4]); }
    // (the half: rope and planks hanging down the face, a hand rope sagging after it)
    const len = 120 + (s > 0 ? 30 : 0);
    for (let k = 0; k < len; k += 7) {
      const sw = Math.sin(k * 0.05) * 6 * s;
      // (a plank gone here and there)
      if (hash(k * 0.7 + s) > 0.84) continue;
      box(g, px + s * 4 + sw - 9, y + k, 18, 5, t(INK)); box(g, px + s * 4 + sw - 8, y + k + 1, 16, 3, W[k % 14 ? 2 : 3]); box(g, px + s * 4 + sw - 8, y + k + 1, 16, 1, W[4]);
    }
    for (const dx of [-8, 8]) { g.strokeStyle = R[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(px - s * 18 + dx, y - 40); g.quadraticCurveTo(px + s * 6 + dx, y - 10, px + s * 4 + dx * 0.6, y + len); g.stroke(); }
    lashing(g, px - s * 18 - 6, y - 30, 10, 2);
  }
};
/** A tree fallen across a ravine a way back, its roots one end, its crown snapped off the other, moss along it. */
const logAcross = (g: Ctx, a: number, b: number, y: number, t: T) => {
  const B = BARK.map(t), M = MOSS.map(t);
  g.save(); g.translate(a - 30, y - 6); g.rotate(Math.atan2(-14, b - a + 60));
  const L = b - a + 60;
  box(g, 0, -11, L, 22, B[0]);
  for (const [k, c] of [[-10, 4], [-6, 5], [-2, 3], [4, 2], [8, 1]] as [number, number][]) box(g, 0, k, L, 4, B[c]);
  for (let k = 10; k < L; k += 16) { box(g, k, -4, 10, 1, B[1]); box(g, k + 4, 3, 8, 1, B[1]); }
  for (let k = 0; k < L; k += 5) { box(g, k, -12, 5, 3, M[hash(k) > 0.5 ? 3 : 2]); if (hash(k * 1.3) > 0.85) box(g, k + 1, 10, 2, 6 + hash(k) * 12, M[1]); }
  g.restore();
  // (the root plate on the near end, the broken crown's stub on the far)
  g.fillStyle = B[1]; g.beginPath(); g.ellipse(a - 34, y - 8, 14, 26, 0, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 6; k++) { g.strokeStyle = B[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(a - 34, y - 8); g.lineTo(a - 46 - hash(k) * 14, y - 30 + k * 10); g.stroke(); }
};
/** The zip line: a cable between two towers, ZIP LINE CLOSED; the stuck explorer's live. */
const zipTowers = (g: Ctx, a: number, b: number, y: number, t: T) => {
  const W = rT('#6A4A2A', t);
  for (const [px, s] of [[a - 36, 1], [b + 36, -1]] as [number, number][]) {
    for (const dx of [-16, 16]) { g.strokeStyle = t(INK); g.lineWidth = 7; g.beginPath(); g.moveTo(px + dx, y); g.lineTo(px, y - 180); g.stroke(); g.strokeStyle = W[2]; g.lineWidth = 5; g.stroke(); }
    box(g, px - 14, y - 90, 28, 4, W[1]);
    g.strokeStyle = W[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 13, y - 88); g.lineTo(px + 8, y - 40); g.moveTo(px + 13, y - 88); g.lineTo(px - 8, y - 40); g.stroke();
    box(g, px - 18, y - 186, 36, 8, t(INK)); box(g, px - 17, y - 185, 34, 6, W[3]);
    box(g, px - 4, y - 182, 8, 8, t('#5A5E66'));
    if (s > 0) {
      box(g, px - 30, y - 140, 60, 22, t(INK)); box(g, px - 29, y - 139, 58, 20, t('#F1EFEA')); box(g, px - 29, y - 139, 58, 6, t('#C81E1E'));
      signAt(g, 'ZIP LINE', px, y - 127, 5, print(5, t('#1A1A1A'))); signAt(g, 'CLOSED', px, y - 120, 5, print(5, t('#C81E1E')));
    }
  }
  // (the cable)
  g.strokeStyle = t('#2A2C30'); g.lineWidth = 2; g.beginPath(); g.moveTo(a - 36, y - 182); g.quadraticCurveTo((a + b) / 2, y - 120, b + 36, y - 182); g.stroke();
};
/** The explorer stuck on it: an animatronic in khaki hung by his harness, arms out stiff, turning slowly. */
const explorer = (c: Ctx, a: number, b: number, y: number, f: number, t: T) => {
  const u = 0.42, cx = (1 - u) * (1 - u) * (a - 36) + 2 * u * (1 - u) * ((a + b) / 2) + u * u * (b + 36);
  const cy = (1 - u) * (1 - u) * (y - 182) + 2 * u * (1 - u) * (y - 120) + u * u * (y - 182);
  const sw = Math.sin(f * 0.025) * 0.18;
  c.save(); c.translate(cx, cy); c.rotate(sw);
  // (the trolley, the straps)
  box(c, -6, -4, 12, 6, t('#5A5E66')); box(c, -1, 2, 2, 22, t('#1A1A1A'));
  // (him: boots, khaki shorts and shirt, pith helmet; one arm raised stiff as he was built, a seam at his neck)
  const K = rT('#C8B07A', t), skin = t('#E0B088');
  box(c, -8, 24, 16, 22, t(INK)); box(c, -7, 25, 14, 20, K[2]); box(c, -7, 25, 4, 20, K[3]); box(c, -2, 30, 4, 2, K[0]);
  box(c, -7, 45, 6, 14, K[1]); box(c, 1, 45, 6, 14, K[2]);
  box(c, -6, 58, 4, 10, skin); box(c, 2, 58, 4, 10, skin);
  box(c, -8, 67, 8, 5, t('#3A2A1A')); box(c, 1, 67, 8, 5, t('#3A2A1A'));
  box(c, 7, 26, 4, 18, K[2]); box(c, 8, 43, 3, 4, skin);
  box(c, -12, 10, 4, 18, K[3]); box(c, -12, 6, 4, 5, skin);
  box(c, -5, 12, 10, 12, skin); box(c, -2, 16, 2, 2, t(INK)); box(c, 2, 16, 2, 2, t(INK)); box(c, -2, 21, 5, 1, t('#7A3A2A'));
  box(c, -5, 23, 10, 1, t('#8A8E96'));
  c.fillStyle = t(INK); c.beginPath(); c.ellipse(0, 11, 11, 4, 0, Math.PI, 0); c.fill();
  c.fillStyle = K[4]; c.beginPath(); c.ellipse(0, 11, 10, 3, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(0, 9, 7, 6, 0, Math.PI, 0); c.fill();
  c.restore();
};

const RAVINE_BITS = (() => {
  const out: { a: number; b: number; y: number; d: number; kind: 'bridge' | 'log' | 'zip' }[] = [];
  for (const p of PITS) {
    if (p.ya !== GY || p.yb !== GY) { if (p.b - p.a < 700 && p.a > X(3400) && p.a < X(3600)) out.push({ a: p.a, b: p.b, y: Math.max(p.ya, p.yb), d: 0.68, kind: 'log' }); continue; }
    const w = p.b - p.a;
    if (w < 400) out.push({ ...p, y: GY, d: 0.74, kind: 'bridge' });
    else if (w > 800) out.push({ ...p, y: GY, d: 0.66, kind: 'zip' });
  }
  return out;
})();

// ---------------------------------------------------------------------------------------------------------------

/**
 * The pieces going back, from the furthest in: each one that's further back than `upTo` and not yet down this frame.
 * Called between the trees going back (so a tree nearer than a piece stands in front of it), and once more at the end.
 */
let cursor = 0;
/** From the furthest in again (at the start of each drawing of the jungle). */
export const startDressing = () => { cursor = 0; };
export const drawDressing = (c: Ctx, v: View, upTo: number) => {
  const tod = timeOfDay(), eye = v.eye;
  while (cursor < PIECES.length && PIECES[cursor].d <= upTo) {
    const p = PIECES[cursor++];
    const sx = eye.x + (p.x - eye.x) * p.d, hw = HALF[p.kind] * p.d;
    if (sx + hw < v.v0 || sx - hw > v.v1) continue;
    // (only where the ground going back is seen, or it'd stand in the air: from above the run it's on)
    if (eye.y > p.foot + 400) continue;
    const t = tintFor(p.d, tod);
    atDepth(c, eye, p.d, () => {
      stamp(c, `jg-dress-${p.i}-${tod.key}`, p.x - HALF[p.kind] - 20, p.foot - 240, HALF[p.kind] * 2 + 40, 250, g => PAINT[p.kind](g, p.x, p.foot, t, p.i * 13 + 5));
      live(c, p, v.f, tod);
    });
  }
};

/** The ravines' bridges, the fallen log, the zip line (after the banks: in front of their faces). */
export const drawRavineDressing = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye;
  RAVINE_BITS.forEach((r, i) => {
    const sa = eye.x + (r.a - eye.x) * r.d - 120, sb = eye.x + (r.b - eye.x) * r.d + 120;
    if (sb < v.v0 || sa > v.v1) return;
    const t = tintFor(r.d, tod);
    // (what hangs down into the ravine is seen only in the ravine: the nearer ground's in front of it everywhere else)
    const clip = r.kind === 'bridge' && eye.y < r.y - 2;
    if (clip) {
      const [xa, yl] = at(eye, r.a, r.y, r.d), [xb] = at(eye, r.b, r.y, r.d);
      c.save(); c.beginPath();
      c.moveTo(r.a - 400, v.top - 400); c.lineTo(r.b + 400, v.top - 400); c.lineTo(r.b + 400, yl); c.lineTo(xb, yl);
      c.lineTo(r.b, r.y); c.lineTo(r.b, v.bot + 400); c.lineTo(r.a, v.bot + 400); c.lineTo(r.a, r.y); c.lineTo(xa, yl); c.lineTo(r.a - 400, yl);
      c.closePath(); c.clip();
    }
    atDepth(c, eye, r.d, () => {
      const key = `jg-rav-${i}-${tod.key}`;
      if (r.kind === 'bridge') stamp(c, key, r.a - 60, r.y - 60, r.b - r.a + 120, 260, g => brokenBridge(g, r.a, r.b, r.y, t));
      else if (r.kind === 'log') stamp(c, key, r.a - 80, r.y - 60, r.b - r.a + 160, 100, g => logAcross(g, r.a, r.b, r.y, t));
      else { stamp(c, key, r.a - 80, r.y - 200, r.b - r.a + 160, 210, g => zipTowers(g, r.a, r.b, r.y, t)); explorer(c, r.a, r.b, r.y, v.f, t); }
    });
    if (clip) c.restore();
  });
};
