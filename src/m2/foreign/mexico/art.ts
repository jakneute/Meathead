// MEXICO's art (the SNES pass): the land's gate (two stepped pylons hung with bunting, the starred beam), the stucco
// fronts (stucco in hot pink, marigold and turquoise, talavera tile bands, barrel-tile eaves, arched doorways, iron
// grilles, geranium pots, painted boards; braced from behind like the plywood they are), THE PYRAMID behind its
// terraces (cut stone in courses, a stepped fret frieze round every tier, the stair up its middle with its serpent
// heads, and in its great arch the MERCADO: the painted dusk, the stalls' striped awnings and goods, string lights),
// the terraces' stone pillars, the TEMPLE's carved face, the taco cart (planks, the scalloped awning, the griddle, the
// spoked wheels), the cantina's iron balcony, the potted cacti. Still art painted once for the hour; only what moves
// live. No layout here: index.ts says where everything is.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, ramp6, dimmed, hour, slab, post, ball, timeOfDay, glassOf, steppedGlow,
  stoneBlocks, stucco, barrelTile, planks, hole, facade, still, board, LOOKS, onScreen, swag,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** An arched doorway (local: its foot at (x, 0)): the dark inside (lit warm after dark), a tile surround, a keystone. */
export const archDoor = (g: Ctx, x: number, w: number, h: number, tile: string[], glow = true) => {
  const r = w / 2, on = lampsOn() && glow;
  // (the tile surround: a band of blue-and-white squares round the arch)
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 7, 0); g.lineTo(x - 7, -h + r); g.arc(x + r, -h + r, r + 7, Math.PI, 0); g.lineTo(x + w + 7, 0); g.closePath(); g.fill();
  g.fillStyle = tile[3]; g.beginPath(); g.moveTo(x - 6, 0); g.lineTo(x - 6, -h + r); g.arc(x + r, -h + r, r + 6, Math.PI, 0); g.lineTo(x + w + 6, 0); g.closePath(); g.fill();
  for (let y = -h + r; y < 0; y += 6) { box(g, x - 6, y, 6, 3, tile[1]); box(g, x + w, y + 3, 6, 3, tile[1]); }
  for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI; box(g, x + r + Math.cos(a) * (r + 3) - 2, -h + r + Math.sin(a) * (r + 3) - 2, 4, 4, k % 2 ? tile[1] : tile[4]); }
  // (the inside)
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1, 0); g.lineTo(x - 1, -h + r); g.arc(x + r, -h + r, r + 1, Math.PI, 0); g.lineTo(x + w + 1, 0); g.closePath(); g.fill();
  g.fillStyle = on ? '#B07024' : '#1C1014'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -h + r); g.arc(x + r, -h + r, r, Math.PI, 0); g.lineTo(x + w, 0); g.closePath(); g.fill();
  if (on) { box(g, x + 3, -h + r, w - 6, h * 0.35, '#E8A646'); checker(g, x + 3, -h + r + h * 0.35, w - 6, 2, '#E8A646', 0, 1); }
  else { box(g, x, -h + r, w, 3, '#2A1A1E'); }
  // (the keystone)
  box(g, x + r - 5, -h - 9, 10, 10, INK); box(g, x + r - 4, -h - 8, 8, 8, tile[4]); box(g, x + r - 4, -h - 8, 8, 2, '#FFFFFF');
};
/** A window with its iron grille (local: top-left at x, y), its flower box of geraniums under it. */
export const grilleWindow = (g: Ctx, x: number, y: number, w: number, h: number, wall: string[], seed: number) => {
  hole(g, x, y, w, h, true);
  const I = ramp6(dimmed('#2A2422'));
  for (let k = 1; k < w / 7; k++) box(g, x + k * 7, y, 1, h, I[1]);
  box(g, x, y + h / 3, w, 1, I[1]); box(g, x, y + (h * 2) / 3, w, 1, I[1]);
  for (let k = 0; k < w / 7; k++) { g.strokeStyle = I[2]; g.lineWidth = 1; g.beginPath(); g.arc(x + k * 7 + 3.5, y + 3, 3, Math.PI, 0); g.stroke(); }
  // (the shutters, folded back, painted)
  for (const sx of [x - 9, x + w + 2]) { box(g, sx - 1, y - 1, 9, h + 2, INK); box(g, sx, y, 7, h, wall[1]); for (let yy = y + 2; yy < y + h; yy += 3) box(g, sx + 1, yy, 5, 1, wall[0]); box(g, sx, y, 1, h, wall[3]); }
  // (the flower box, the geraniums)
  const P = ramp6(dimmed('#B45309'));
  box(g, x - 4, y + h + 2, w + 8, 8, INK); box(g, x - 3, y + h + 3, w + 6, 6, P[3]); box(g, x - 3, y + h + 3, w + 6, 1, P[4]); box(g, x - 3, y + h + 7, w + 6, 2, P[1]);
  for (let k = 0; k < (w + 6) / 5; k++) {
    const fx = x - 2 + k * 5, t = hash(seed + k);
    box(g, fx, y + h - 2, 4, 5, dimmed('#2F6B2A')); box(g, fx + 1, y + h - 1, 2, 2, dimmed('#4A8A3A'));
    if (t > 0.35) { box(g, fx, y + h - 4, 3, 3, dimmed(t > 0.7 ? '#DC2626' : '#F472B6')); box(g, fx, y + h - 4, 1, 1, dimmed('#FECACA')); }
  }
};
/** A talavera tile band across (local), blue and white with a yellow fleck, inked. */
export const tileBand = (g: Ctx, x: number, y: number, w: number, h = 8) => {
  const B = ramp6(dimmed('#1E40AF')), Wt = ramp6(dimmed('#F1F5F9'));
  box(g, x, y - 1, w, h + 2, INK);
  for (let k = 0; k < w / h; k++) {
    const tx = x + k * h, c0 = k % 2 ? Wt[3] : B[3];
    box(g, tx, y, h - 1, h, c0); box(g, tx, y, h - 1, 1, k % 2 ? Wt[5] : B[4]);
    box(g, tx + h / 2 - 2, y + h / 2 - 2, 3, 3, k % 2 ? B[3] : Wt[4]); box(g, tx + h / 2 - 1, y + h / 2 - 1, 1, 1, dimmed('#FBBF24'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The land's gate

const GATE_D = 0.95;
export const paintGate = (g: Ctx) => {
  const S = ramp6(dimmed('#E7E5E4')), Bl = ramp6(dimmed('#1E3A8A')), Rd = ramp6(dimmed('#B91C1C')), Gd = ramp6(dimmed('#CA8A04'));
  for (const px0 of [40, 440]) {
    // (the pylon: a stepped plinth, the shaft of cut stone, its cap, a gold globe on top)
    box(g, px0 - 13, -42, 96, 42, INK); stoneBlocks(g, px0 - 12, -41, 94, 41, S, px0, 24, 14);
    box(g, px0 - 7, -56, 84, 15, INK); stoneBlocks(g, px0 - 6, -55, 82, 14, S, px0 + 3, 20, 7);
    box(g, px0 - 1, -301, 72, 246, INK); stoneBlocks(g, px0, -300, 70, 245, S, px0 + 9, 35, 20);
    box(g, px0, -300, 3, 245, S[5]); box(g, px0 + 64, -300, 6, 245, S[1]); checker(g, px0 + 60, -300, 4, 245, S[1], 0, 1);
    box(g, px0 - 7, -314, 84, 15, INK); box(g, px0 - 6, -313, 82, 13, S[3]); box(g, px0 - 6, -313, 82, 2, S[5]); box(g, px0 - 6, -303, 82, 3, S[1]);
    ball(g, px0 + 35, -326, 11, dimmed('#EAB308'));
    // (the banner down its face: stripes red, white and blue, stars on the blue, its rod and tassels)
    const bx = px0 + 12, bw = 46;
    box(g, bx - 4, -286, bw + 8, 4, INK); box(g, bx - 3, -285, bw + 6, 2, Gd[4]);
    box(g, bx - 1, -282, bw + 2, 206, INK);
    for (let y = -282, k = 0; y < -86; y += 14, k++) { const R = k % 2 ? S : Rd; box(g, bx, y, bw, 14, R[3]); box(g, bx, y, bw, 1, R[4]); box(g, bx + bw - 4, y, 4, 14, R[2]); }
    box(g, bx, -282, bw, 60, Bl[3]); box(g, bx + bw - 4, -282, 4, 60, Bl[2]);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { box(g, bx + 6 + q * 14 + (r % 2) * 7, -274 + r * 14, 3, 3, S[5]); }
    poly(g, [[bx - 1, -86], [bx + bw + 1, -86], [bx + bw / 2, -70]], INK); poly(g, [[bx, -86], [bx + bw, -86], [bx + bw / 2, -72]], Rd[3]);
    box(g, bx + bw / 2 - 1, -72, 2, 8, Gd[3]);
  }
  // (the beam across: steel faced in blue, a band of white stars, its edges lit, rivets)
  box(g, 38, -332, 474, 44, INK); box(g, 40, -330, 470, 40, Bl[3]); box(g, 40, -330, 470, 3, Bl[5]); box(g, 40, -293, 470, 3, Bl[1]); checker(g, 40, -296, 470, 2, Bl[2], 0, 1);
  for (let k = 0; k < 12; k++) { const sx = 56 + k * 38; poly(g, [[sx, -318], [sx + 3, -311], [sx + 10, -311], [sx + 4, -306], [sx + 7, -299], [sx, -304], [sx - 7, -299], [sx - 4, -306], [sx - 10, -311], [sx - 3, -311]], S[5]); }
  for (let x = 46; x < 506; x += 16) { box(g, x, -327, 2, 2, Bl[1]); box(g, x, -296, 2, 2, Bl[1]); }
  // (bunting swagged under the beam, red, white and blue)
  for (let k = 0; k < 10; k++) {
    const sx = 112 + k * 33;
    poly(g, [[sx - 1, -290], [sx + 31, -290], [sx + 15, -274]], INK);
    poly(g, [[sx, -290], [sx + 30, -290], [sx + 15, -276]], [Rd, S, Bl][k % 3][3]);
    box(g, sx + 2, -289, 12, 2, [Rd, S, Bl][k % 3][4]);
  }
};
export const drawGate = (c: Ctx, v: View, x: number) => facade(c, v, 'mx-gate', x, 560, 340, paintGate, GATE_D, 30, 30, false);

// ---------------------------------------------------------------------------------------------------------------
// The fronts (FACADE_D: stucco over plywood, braced)

export interface MxFront { rx: number; w: number; h: number; col: string; name: string; sub: string }
export const paintFront = (g: Ctx, f: MxFront) => {
  const { w, h } = f, R = ramp6(dimmed(f.col)), T = ramp6(dimmed('#B45309')), Tl = ramp6(dimmed('#1E40AF')), seed = f.rx;
  // (the wall: stucco, stepped, its plywood edge showing along the top)
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R);
  stucco(g, 0, -h, w, h, R, seed);
  // (a curved parapet up the middle, the bell niche in it)
  const cw = Math.min(110, w * 0.4), cx = w / 2;
  poly(g, [[cx - cw / 2 - 1, -h], [cx - cw / 2 - 1, -h - 14], [cx - 18, -h - 34], [cx + 18, -h - 34], [cx + cw / 2 + 1, -h - 14], [cx + cw / 2 + 1, -h]], INK);
  poly(g, [[cx - cw / 2, -h], [cx - cw / 2, -h - 13], [cx - 17, -h - 33], [cx + 17, -h - 33], [cx + cw / 2, -h - 13], [cx + cw / 2, -h]], R[3]);
  poly(g, [[cx - cw / 2, -h], [cx - cw / 2, -h - 13], [cx - 17, -h - 33], [cx - 12, -h - 33], [cx - cw / 2 + 4, -h - 10], [cx - cw / 2 + 4, -h]], R[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(cx, -h - 14, 8, Math.PI, 0); g.lineTo(cx + 8, -h - 4); g.lineTo(cx - 8, -h - 4); g.fill();
  ball(g, cx, -h - 10, 4, dimmed('#CA8A04'));
  // (the barrel-tile eave along the top, its shadow)
  box(g, -8, -h - 2, w + 16, 12, INK); barrelTile(g, -7, -h - 1, w + 14, 10, T, 5);
  box(g, -7, -h + 10, w + 14, 3, 'rgba(28, 16, 20, 0.35)');
  // (the talavera band under it)
  tileBand(g, 0, -h + 16, w, 8);
  // (the arched doorway, the windows with their grilles and geraniums)
  archDoor(g, w / 2 - 22, 44, 84, Tl, true);
  for (const wx of [18, w - 48]) grilleWindow(g, wx, -h + 44, 30, 34, R, seed + wx);
  // (a lamp bracket by the door, a painted board over it with the shop's name)
  for (const lx of [w / 2 - 36, w / 2 + 36]) { box(g, lx - 1, -76, 3, 10, INK); box(g, lx - 3, -84, 7, 9, INK); box(g, lx - 2, -83, 5, 7, lampsOn() ? '#FFE7A0' : dimmed('#E8D8A8')); }
  board(g, w / 2, -h + 36 + (h > 180 ? 8 : 0), [f.name], LOOKS.mexico(1), dimmed('#7C2D12'), ramp6(dimmed('#CA8A04')), 4);
  if (f.sub) board(g, w / 2, -104, [f.sub], { sx: 1, sy: 1, fill: dimmed('#3B0764') }, dimmed('#FEF3C7'), ramp6(dimmed('#7C2D12')), 3);
  // (grime and a scuffed skirting up the foot)
  box(g, 0, -10, w, 10, R[1]); checker(g, 0, -14, w, 4, R[1], 1, 2);
};
export const drawFront = (c: Ctx, v: View, x: number, f: MxFront) => facade(c, v, `mx-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 50, 20);

// ---------------------------------------------------------------------------------------------------------------
// THE PYRAMID (set back at 0.95 behind its terraces) and the mercado in its arch

const PYR_D = 0.95;
const STONE = '#B8A27A', STONE_D = '#8C7A58';
/** A stepped fret (greca) frieze across a tier: the key pattern in relief, lit on top, shaded under. */
const fret = (g: Ctx, x: number, y: number, w: number, R: string[]) => {
  box(g, x, y, w, 14, R[1]); box(g, x, y, w, 1, R[3]);
  for (let k = x + 2; k < x + w - 14; k += 16) {
    poly(g, [[k, y + 12], [k, y + 3], [k + 10, y + 3], [k + 10, y + 9], [k + 5, y + 9], [k + 5, y + 7], [k + 8, y + 7], [k + 8, y + 5], [k + 2, y + 5], [k + 2, y + 12]], R[3]);
    box(g, k, y + 3, 10, 1, R[4]);
  }
  box(g, x, y + 13, w, 1, R[0]);
};
const paintPyramid = (g: Ctx, W: number) => {
  for (let k = 0; k < 5; k++) {
    const inset = k * 110, h0 = k * 100, x0 = inset, w = W - inset * 2, R = ramp6(dimmed(k % 2 ? STONE : STONE_D));
    box(g, x0 - 1, -h0 - 101, w + 2, 101, INK);
    stoneBlocks(g, x0, -h0 - 100, w, 100, R, k * 97, 50, 20);
    // (the tier's sloped batter: the lower blocks lit, its edge in shadow at the right)
    box(g, x0, -h0 - 100, 4, 100, R[4]); box(g, x0 + w - 8, -h0 - 100, 8, 100, R[1]); checker(g, x0 + w - 12, -h0 - 100, 4, 100, R[1], 0, 1);
    fret(g, x0 + 6, -h0 - 92, w - 12, R);
    box(g, x0, -h0 - 100, w, 2, dimmed('#E7D8B0'));
    box(g, x0, -h0 - 4, w, 4, R[1]);
  }
  // (the stair up the middle (behind the shrine), its balustrades, the serpent heads at its foot)
  const sx = W / 2 - 70, sw = 140, S = ramp6(dimmed('#C9B88E'));
  box(g, sx - 15, -501, sw + 30, 501, INK);
  for (let y = -500; y < 0; y += 10) { box(g, sx, y, sw, 10, S[2]); box(g, sx, y, sw, 2, S[4]); box(g, sx, y + 8, sw, 2, S[1]); }
  for (const bx of [sx - 14, sx + sw]) { box(g, bx, -500, 14, 500, S[3]); box(g, bx, -500, 3, 500, S[5]); box(g, bx + 11, -500, 3, 500, S[1]); }
  paintMercado(g, W);
  for (const [hx, d] of [[120 - 14, -1], [W - 120 + 14, 1]] as const) {
    // (a feathered serpent's head, jaws open, its eye)
    const Sp = ramp6(dimmed('#8A9A6A'));
    poly(g, [[hx, -6], [hx, -40], [hx + d * 30, -42], [hx + d * 42, -30], [hx + d * 38, -18], [hx + d * 24, -22], [hx + d * 36, -8], [hx + d * 20, 0], [hx, 0]], INK);
    poly(g, [[hx, -7], [hx, -39], [hx + d * 29, -41], [hx + d * 40, -30], [hx + d * 36, -19], [hx + d * 23, -23], [hx + d * 34, -9], [hx + d * 19, -1], [hx, -1]], Sp[3]);
    poly(g, [[hx, -39], [hx + d * 29, -41], [hx + d * 40, -30], [hx + d * 20, -32], [hx, -30]], Sp[4]);
    box(g, hx + d * 22 - 2, -36, 4, 4, INK); box(g, hx + d * 22 - 1, -35, 2, 2, dimmed('#FDE047'));
    for (let k = 0; k < 4; k++) box(g, hx + d * (26 + k * 3), -22, 2, 4, dimmed('#F5F5F4'));
    for (let k = 0; k < 5; k++) poly(g, [[hx, -40 + k * 7], [hx - d * 8, -44 + k * 7], [hx, -36 + k * 7]], [dimmed('#16A34A'), dimmed('#DC2626'), dimmed('#F59E0B')][k % 3]);
  }
};
/** The great arch at the pyramid's foot: the mercado inside, the plaza under the painted dusk. */
const paintMercado = (g: Ctx, W: number) => {
  const ia = 120, ib = W - 120, top = -330;
  box(g, ia - 4, top - 4, ib - ia + 8, -top + 4, INK);
  const dusk = ['#1E1B4B', '#2E1B5A', '#4A2266', '#6B2A6A', '#93366E', '#B4436A', '#D05A62', '#E2725B', '#F08E58', '#F4A259'];
  dusk.forEach((col, k) => { box(g, ia, top + k * 24, ib - ia, 25, mix(col, '#000000', 0.12)); if (k) checker(g, ia, top + k * 24 - 1, ib - ia, 2, mix(col, '#000000', 0.12), k % 2); });
  for (let k = 0; k < 60; k++) { const t = hash(k * 1.7); box(g, ia + hash(k * 3.1) * (ib - ia), top + hash(k + 50) * 110, t > 0.85 ? 2 : 1, t > 0.85 ? 2 : 1, '#FEF3C7'); }
  // (a painted moon, a painted mesa line along the bottom of the painted sky, the brushwork showing)
  g.fillStyle = '#FEF3C7'; g.beginPath(); g.arc(ia + 180, top + 48, 18, 0, Math.PI * 2); g.fill(); g.fillStyle = mix('#1E1B4B', '#000000', 0.12); g.beginPath(); g.arc(ia + 188, top + 44, 15, 0, Math.PI * 2); g.fill();
  poly(g, [[ia, -100], [ia + 60, -150], [ia + 200, -150], [ia + 240, -120], [ia + 420, -130], [ia + 470, -160], [ia + 640, -160], [ia + 700, -110], [ib, -120], [ib, -90], [ia, -90]], mix('#3B1E5A', '#000000', 0.25));
  // (the stalls under it: counters of planks, striped awnings with scalloped valances, the goods)
  const PIC = ['#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EF4444'];
  for (let k = 0; k < 6; k++) {
    const sx0 = ia + 40 + k * ((ib - ia - 120) / 5), A = ramp6(dimmed(PIC[k % PIC.length])), Wd = ramp6(dimmed('#7C4A2A'));
    box(g, sx0 - 1, -71, 102, 71, INK); planks(g, sx0, -70, 100, 70, Wd, true, k * 13, 10);
    box(g, sx0 - 4, -72, 108, 6, INK); box(g, sx0 - 3, -71, 106, 4, Wd[4]);
    // (the goods on the counter: pots, folded blankets, little sombreros, pinatas hung up)
    for (let q = 0; q < 5; q++) {
      const gx = sx0 + 8 + q * 19, kind = (k + q) % 4;
      if (kind === 0) { ball(g, gx + 4, -79, 6, dimmed('#C2410C')); box(g, gx + 1, -86, 6, 3, dimmed('#9A3412')); }
      else if (kind === 1) { for (let s = 0; s < 3; s++) { box(g, gx - 1, -78 - s * 4, 14, 4, INK); box(g, gx, -77 - s * 4, 12, 3, dimmed(PIC[(q + s + k) % PIC.length])); } }
      else if (kind === 2) { g.fillStyle = INK; g.beginPath(); g.ellipse(gx + 6, -75, 9, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#FCD34D'); g.beginPath(); g.ellipse(gx + 6, -75, 8, 2, 0, 0, Math.PI * 2); g.fill(); box(g, gx + 3, -82, 6, 7, dimmed('#FBBF24')); box(g, gx + 3, -78, 6, 1, dimmed('#DC2626')); }
      else { box(g, gx + 2, -80, 10, 8, INK); box(g, gx + 3, -79, 8, 6, dimmed('#E7E5E4')); box(g, gx + 3, -79, 8, 2, dimmed('#FFFFFF')); }
    }
    // (the awning on its poles, striped, its scalloped edge)
    for (const px0 of [sx0 - 2, sx0 + 98]) box(g, px0, -126, 4, 56, dimmed('#5C3A1A'));
    box(g, sx0 - 9, -129, 118, 26, INK);
    for (let s = 0; s < 7; s++) { const R = s % 2 ? ramp6(dimmed('#FFF7ED')) : A; box(g, sx0 - 8 + s * 17, -128, 17, 22, R[3]); box(g, sx0 - 8 + s * 17, -128, 17, 3, R[4]); box(g, sx0 - 8 + s * 17 + 14, -128, 3, 22, R[2]); g.fillStyle = INK; g.beginPath(); g.arc(sx0 - 8 + s * 17 + 8.5, -106, 8.5, 0, Math.PI); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(sx0 - 8 + s * 17 + 8.5, -106, 7.5, 0, Math.PI); g.fill(); }
    // (a pinata hung off the awning: a star, its streamers)
    if (k % 2 === 0) { const px0 = sx0 + 50, py = -96; for (let s = 0; s < 5; s++) { const a = -Math.PI / 2 + (s / 5) * Math.PI * 2; poly(g, [[px0, py], [px0 + Math.cos(a - 0.3) * 6, py + Math.sin(a - 0.3) * 6], [px0 + Math.cos(a) * 14, py + Math.sin(a) * 14], [px0 + Math.cos(a + 0.3) * 6, py + Math.sin(a + 0.3) * 6]], dimmed(PIC[(s + k) % PIC.length])); } ball(g, px0, py, 6, dimmed('#F472B6')); }
  }
  // (the arch's voussoirs round its top: cut stone, a keystone)
  const V = ramp6(dimmed('#C9B88E'));
  box(g, ia - 14, top - 18, ib - ia + 28, 18, INK); for (let x = ia - 13; x < ib + 13; x += 26) { box(g, x, top - 17, 25, 16, V[3]); box(g, x, top - 17, 25, 2, V[5]); box(g, x + 22, top - 17, 3, 16, V[1]); }
  for (const px0 of [ia - 14, ib]) { box(g, px0, top - 2, 14, -top + 2, INK); stoneBlocks(g, px0 + 1, top - 1, 12, -top + 1, V, px0, 12, 18); }
};
/** The pyramid's string lights through the plaza (live: they glow by the hour, and their bulbs swing). */
export const drawPyramid = (c: Ctx, v: View, x: number, W: number) => {
  facade(c, v, 'mx-pyramid', x, W, 520, g => paintPyramid(g, W), PYR_D, 30, 30, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane's pieces

/** A terrace's stone pillar (holding the one-way terrace up), from its underside down to the plaza floor. */
export const pillar = (c: Ctx, x: number, top: number, foot: number) => {
  const R = ramp6(hour(STONE_D)), h = foot - top;
  still(c, `fl-mx-pillar-${Math.round(h)}`, x, top, -6, -2, 24, h + 4, g => {
    box(g, -1, 0, 12, h, INK); stoneBlocks(g, 0, 0, 10, h, R, h, 10, 16);
    box(g, 0, 0, 2, h, R[4]); box(g, 8, 0, 2, h, R[1]);
    box(g, -5, 0, 20, 6, INK); box(g, -4, 0, 18, 5, R[3]); box(g, -4, 0, 18, 1, R[5]); box(g, -4, 4, 18, 1, R[1]);
    box(g, -5, h - 6, 20, 6, INK); box(g, -4, h - 5, 18, 5, R[2]); box(g, -4, h - 5, 18, 1, R[4]);
  });
};
/** The TEMPLE OF THE SUN (GIFT SHOP)'s carved face (over its box): the doorway, the sun disc, the glyph frieze. */
export const templeFace = (c: Ctx, x: number, top: number, w: number, h: number) => {
  still(c, `fl-mx-temple-${w}x${h}`, x, top, 0, -30, w, h + 30, g => {
    const R = ramp6(hour('#C9A86A')), G = ramp6(hour('#CA8A04'));
    // (the frieze: glyph blocks in a row, each its own face)
    box(g, 4, 8, w - 8, 22, R[1]);
    for (let k = 0; k < (w - 16) / 22; k++) {
      const gx = 8 + k * 22;
      box(g, gx, 10, 19, 18, R[3]); box(g, gx, 10, 19, 1, R[5]); box(g, gx + 17, 10, 2, 18, R[1]);
      box(g, gx + 4, 14, 3, 3, R[0]); box(g, gx + 12, 14, 3, 3, R[0]); box(g, gx + 5, 21, 9, 2, R[0]); if (k % 2) box(g, gx + 8, 11, 3, 2, R[0]);
    }
    // (sun discs either side of the doorway, gold, rayed)
    for (const cx of [32, w - 32]) {
      const cy = 78;
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; poly(g, [[cx + Math.cos(a - 0.15) * 11, cy + Math.sin(a - 0.15) * 11], [cx + Math.cos(a) * 18, cy + Math.sin(a) * 18], [cx + Math.cos(a + 0.15) * 11, cy + Math.sin(a + 0.15) * 11]], G[k % 2 ? 2 : 4]); }
      ball(g, cx, cy, 11, hour('#EAB308'));
      box(g, cx - 5, cy - 3, 3, 2, G[0]); box(g, cx + 2, cy - 3, 3, 2, G[0]); box(g, cx - 4, cy + 4, 8, 2, G[0]);
    }
    // (the doorway: dark, a gift shop's glow, its lintel)
    const dx = 70, dw = 40, dy = 50, dh = 70;
    box(g, dx - 6, dy - 8, dw + 12, 8, INK); box(g, dx - 5, dy - 7, dw + 10, 6, R[4]); box(g, dx - 5, dy - 7, dw + 10, 1, R[5]);
    box(g, dx - 1, dy - 1, dw + 2, dh + 1, INK); box(g, dx, dy, dw, dh, lampsOn() ? '#B07024' : '#1C1014');
    if (lampsOn()) box(g, dx + 2, dy + 2, dw - 4, 20, '#E8A646');
    else { box(g, dx + 4, dy + 30, 8, 40, '#2A1E22'); box(g, dx + 26, dy + 24, 10, 46, '#2A1E22'); }
    void h;
  });
};
/** The taco cart's bits over its box: the awning (striped, scalloped) on its poles, the griddle and its steam, the
 *  bottles, the spoked wheels. */
export const drawCart = (c: Ctx, a: number, b: number, top: number, f: number) => {
  const w = b - a;
  still(c, `fl-mx-cart-${w}`, a, top, -16, -92, w + 32, 140, g => {
    const P = ramp6(dimmed('#78716C')), Gn = ramp6(dimmed('#16A34A')), Wt = ramp6(dimmed('#F8FAFC')), Rd = ramp6(dimmed('#DC2626'));
    for (const px0 of [6, w - 10]) { box(g, px0 - 1, -70, 6, 70, INK); box(g, px0, -70, 4, 70, P[3]); box(g, px0, -70, 1, 70, P[5]); }
    box(g, -11, -83, w + 22, 18, INK);
    for (let k = 0; k < Math.ceil((w + 20) / 22); k++) { const R = [Gn, Wt, Rd][k % 3]; box(g, -10 + k * 22, -82, 22, 14, R[3]); box(g, -10 + k * 22, -82, 22, 2, R[4]); box(g, -10 + k * 22 + 19, -82, 3, 14, R[2]); g.fillStyle = INK; g.beginPath(); g.arc(-10 + k * 22 + 11, -68, 11, 0, Math.PI); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(-10 + k * 22 + 11, -68, 10, 0, Math.PI); g.fill(); }
    // (the griddle on the counter, the bottles of salsa, a stack of plates)
    const M = ramp6(hour('#52525B'));
    box(g, 20, -8, 70, 8, INK); box(g, 21, -7, 68, 6, M[2]); box(g, 21, -7, 68, 1, M[4]);
    for (let k = 0; k < 4; k++) { box(g, 26 + k * 16, -11, 12, 4, hour('#F5DEB3')); box(g, 26 + k * 16, -11, 12, 1, hour('#FFF7E0')); box(g, 28 + k * 16, -12, 3, 1, hour('#B91C1C')); }
    // (the menu painted on its side)
    box(g, 30, 22, w - 60, 32, INK); box(g, 31, 23, w - 62, 30, hour('#FEF3C7'));
    for (let r = 0; r < 3; r++) { box(g, 36, 28 + r * 9, (w - 80) * (0.5 + hash(r) * 0.3), 2, hour('#7C2D12')); box(g, w - 50, 28 + r * 9, 12, 2, hour('#16A34A')); }
  });
  // (the wheels: rims, spokes turning slowly as if it might roll, hubs)
  for (const wx of [a + 30, b - 30]) {
    const cy = GY - 13, R = ramp6(hour('#3F3F46'));
    c.fillStyle = INK; c.beginPath(); c.arc(wx, cy, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[2]; c.beginPath(); c.arc(wx, cy, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[4]; c.beginPath(); c.arc(wx - 1, cy - 1, 12, Math.PI * 1.05, Math.PI * 1.6); c.lineTo(wx - 1, cy - 1); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(wx, cy, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = hour('#A8A29E'); c.beginPath(); c.arc(wx, cy, 8, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2 + f * 0.002; c.moveTo(wx, cy); c.lineTo(wx + Math.cos(ang) * 8, cy + Math.sin(ang) * 8); } c.stroke();
    ball(c, wx, cy, 3, '#D6D3D1');
  }
  // (the griddle's steam: puffs going up, live)
  for (let k = 0; k < 4; k++) { const t = ((f * 0.6 + k * 25) % 100) / 100, sx = a + 40 + k * 14 + Math.sin(t * 6 + k) * 4, sy = top - 12 - t * 50; c.globalAlpha = 0.5 * (1 - t); box(c, sx - 2, sy - 2, 5, 4, '#F5F5F4'); box(c, sx - 1, sy - 3, 3, 1, '#FFFFFF'); c.globalAlpha = 1; }
};
/** The cantina's balcony: its brackets under it (stepped iron scrolls), its iron rail with scrollwork, a pot of
 *  bougainvillea spilling over. */
export const drawBalcony = (c: Ctx, a: number, b: number, y: number) => {
  const w = b - a;
  still(c, `fl-mx-balc-${w}`, a, y, -10, -34, w + 20, 90, g => {
    const I = ramp6(hour('#2A2422'));
    for (let x = 12; x < w; x += 44) { box(g, x - 1, 13, 6, 32, INK); box(g, x, 14, 4, 30, I[3]); g.strokeStyle = I[4]; g.lineWidth = 2; g.beginPath(); g.arc(x - 6, 20, 7, -0.3, Math.PI * 0.7); g.stroke(); }
    box(g, 0, -28, w, 4, INK); box(g, 1, -27, w - 2, 2, I[4]);
    box(g, 0, -4, w, 3, INK);
    for (let x = 4; x < w - 2; x += 10) { box(g, x, -25, 2, 22, I[2]); box(g, x, -25, 1, 22, I[4]); }
    for (let x = 9; x < w - 6; x += 20) { g.strokeStyle = I[3]; g.lineWidth = 1.5; g.beginPath(); g.arc(x, -18, 4, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x, -10, 4, 0, Math.PI * 2); g.stroke(); }
    // (the bougainvillea: a pot at the end, magenta flowers spilling over the rail)
    const P = ramp6(hour('#B45309'));
    box(g, w - 30, -16, 22, 14, INK); box(g, w - 29, -15, 20, 12, P[3]); box(g, w - 29, -15, 20, 2, P[4]);
    for (let k = 0; k < 40; k++) { const fx = w - 70 + hash(k * 1.3) * 66, fy = -36 + hash(k * 2.7) * 40 + Math.max(0, (w - 40 - fx) * 0.3); box(g, fx, fy, 3, 3, k % 3 ? hour('#C026D3') : hour('#2F6B2A')); if (k % 5 === 0) box(g, fx, fy, 1, 1, hour('#F5D0FE')); }
  });
};
/** A potted saguaro by the fronts (scenery, dimmed): its terracotta pot, the cactus ribbed in steps, its arms. */
export const pottedCactus = (c: Ctx, x: number) => {
  still(c, `fl-mx-cactus`, x, GY, -16, -80, 50, 82, g => {
    const C = ramp6(dimmed('#2F7A3A')), P = ramp6(dimmed('#B45309'));
    const trunk = (tx: number, ty: number, tw: number, th: number) => { box(g, tx - 1, ty - 1, tw + 2, th + 1, INK); box(g, tx, ty, tw, th, C[3]); box(g, tx, ty, 2, th, C[4]); box(g, tx + tw - 3, ty, 3, th, C[1]); for (let k = 3; k < tw - 3; k += 3) box(g, tx + k, ty + 2, 1, th - 2, C[2]); box(g, tx + 1, ty - 1, tw - 2, 1, C[5]); };
    trunk(0, -70, 14, 60);
    trunk(-10, -54, 8, 14); box(g, -10, -42, 12, 6, INK); box(g, -9, -41, 10, 4, C[3]);
    trunk(16, -60, 8, 18); box(g, 12, -46, 12, 6, INK); box(g, 12, -45, 10, 4, C[3]);
    for (let k = 0; k < 6; k++) box(g, 2 + k * 2, -68 + k * 9, 1, 1, dimmed('#F5F5F4'));
    box(g, -7, -13, 28, 13, INK); box(g, -6, -12, 26, 12, P[3]); box(g, -6, -12, 26, 2, P[4]); box(g, -6, -4, 26, 4, P[2]); box(g, -8, -14, 30, 3, P[4]);
    box(g, -2, -9, 4, 4, dimmed('#1E40AF')); box(g, 8, -9, 4, 4, dimmed('#F1F5F9'));
  });
};
/** The string lights through the plaza, live (their glow follows the hour, and they sway a touch). */
export const plazaLights = (c: Ctx, v: View, x0: number, x1: number, y: number, f: number) => {
  for (let x = x0; x < x1; x += 260) if (onScreen(v, x, x + 260)) swag(c, x, y + Math.sin(f * 0.02 + x) * 1, x + 260, y, 14, ['#FDE68A'], 'bulbs', 14);
};
/** A lamp's glow over the stalls (after dark), live. */
export const stallGlow = (c: Ctx, x: number, y: number) => { if (lampsOn()) steppedGlow(c, x, y, 60, '#FFB060', 0, 0.12, 4); };

void at; void glassOf; void post; void mix;
