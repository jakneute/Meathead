// The dungeon's paint kit (the final pass: peak SNES): its stone, its spikes, its iron, the props in the cells. Shared
// by the stairs, the cells and the chamber (index.ts), the rope walk and the deaths. Still art goes down as stamps
// (painted once, at its own origin, so one picture can go down in many places); what moves is drawn live.

import { INK, box, pole, slab, rampOf, mix, checker, hazeBands, bandedGradient, brickPattern, tilePattern, stamp, hash, sign } from '../../intro/art/kit';
import { GY } from '../geometry';

export type Ctx = CanvasRenderingContext2D;
export { INK, box, pole, slab, rampOf, mix, checker, hazeBands, bandedGradient, brickPattern, tilePattern, stamp, hash };

export const STONE = rampOf('#4A443E'), IRON = rampOf('#3E3E46'), WOOD = rampOf('#5A3A20'), RUST = rampOf('#6A3A22');
export const STEEL = ['#4A4A52', '#7A7A84', '#A8A8B2', '#D4D4DC', '#F4F4F8'];
export const BLOOD = ['#3A0606', '#5A0A0A', '#7F1D1D', '#A82A2A'];

/** Puts a stamp down at (x, y), its picture painted round its own origin. */
export const put = (c: Ctx, key: string, x: number, y: number, l: number, t: number, w: number, h: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(x, y); stamp(c, key, l, t, w, h, paint); c.restore();
};

/** A plaque on the wall, its words on it, centered at (x, y). */
export const plaque = (c: Ctx, x: number, y: number, words: string, face = '#27272A', ink = '#FCA5A5', frame = '#5A5A62') => {
  c.font = '8px "Press Start 2P"';
  const w = Math.round(c.measureText(words).width) + 16;
  sign(c, x - w / 2, y - 9, w, 18, face, words, ink, 8, frame);
};

/** Dressed stone blocks (a fill, lined up with whatever's the origin when it's used): each block lit along its top and
 *  left, shaded under and right, mortar dark between. */
export const blockFill = (c: Ctx, key: string, col: string) => {
  const R = rampOf(col);
  return tilePattern(c, `dBlock:${key}`, 80, 80, t => {
    t.fillStyle = mix(R[0], INK, 0.4); t.fillRect(0, 0, 80, 80);
    for (const [x, y, w] of [[0, 0, 38], [40, 0, 38], [-20, 40, 38], [20, 40, 38], [60, 40, 38]] as const) {
      const k = hash(x * 3.1 + y * 7.7), b = k < 0.33 ? R[1] : k < 0.66 ? R[2] : mix(R[1], R[2], 0.5);
      t.fillStyle = b; t.fillRect(x, y, w, 38);
      t.fillStyle = R[3]; t.fillRect(x, y, w, 2); t.fillRect(x, y, 2, 38);
      t.fillStyle = R[0]; t.fillRect(x, y + 35, w, 3); t.fillRect(x + w - 2, y, 2, 38);
      t.fillStyle = mix(b, R[0], 0.5); for (let p = 0; p < 6; p++) t.fillRect(x + 4 + Math.floor(hash(x + y + p) * (w - 8)), y + 6 + Math.floor(hash(x * 2 + y + p * 5) * 26), 2, 2);
    }
  });
};

/** Riveted iron plate (the spiked ceiling's block: iron, not the walls' stone, so it reads as the thing coming down). */
export const plateFill = (c: Ctx) => tilePattern(c, 'dPlate', 60, 40, t => {
  const R = rampOf('#4E4A54');
  t.fillStyle = INK; t.fillRect(0, 0, 60, 40);
  t.fillStyle = R[1]; t.fillRect(0, 0, 58, 38); t.fillStyle = R[2]; t.fillRect(2, 2, 54, 34);
  t.fillStyle = R[3]; t.fillRect(0, 0, 58, 2); t.fillRect(0, 0, 2, 38); t.fillStyle = R[0]; t.fillRect(2, 34, 56, 4); t.fillRect(54, 2, 4, 34);
  t.fillStyle = R[4]; for (const [x, y] of [[5, 5], [50, 5], [5, 30], [50, 30]]) t.fillRect(x, y, 2, 2);
  t.fillStyle = R[1]; t.fillRect(10, 14, 20, 2); t.fillRect(30, 24, 14, 2);
});

/** Rough rock (the mass the stairs are cut through). */
export const rockFill = (c: Ctx) => tilePattern(c, 'dRock', 64, 64, t => {
  t.fillStyle = '#100C0A'; t.fillRect(0, 0, 64, 64);
  for (let k = 0; k < 18; k++) { const x = Math.floor(hash(k * 1.3) * 60), y = Math.floor(hash(k * 2.9) * 60), w = 4 + Math.floor(hash(k * 4.1) * 10); t.fillStyle = k % 3 ? '#18120F' : '#1E1713'; t.fillRect(x, y, w, 4); t.fillStyle = '#261D18'; t.fillRect(x, y, w, 1); }
});

/** One spike (point up, its foot at y, its tip at tip): lit on its left face, shaded on its right, an ink edge. */
export const spikeUp = (c: Ctx, x: number, y: number, w: number, tip: number) => {
  const m = x + w / 2;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 1, y); c.lineTo(m, tip - 2); c.lineTo(x + w + 1, y); c.closePath(); c.fill();
  c.fillStyle = STEEL[1]; c.beginPath(); c.moveTo(x, y); c.lineTo(m, tip); c.lineTo(x + w, y); c.closePath(); c.fill();
  c.fillStyle = STEEL[3]; c.beginPath(); c.moveTo(x + 1, y); c.lineTo(m, tip + 1); c.lineTo(m, y); c.closePath(); c.fill();
  box(c, m - 1, tip + 2, 1, Math.max(0, (y - tip) * 0.4), STEEL[4]);
};
/** One spike pointing down (the ceiling's), its root at y, its tip at tip. */
export const spikeDown = (c: Ctx, x: number, y: number, w: number, tip: number) => {
  const m = x + w / 2;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 1, y); c.lineTo(m, tip + 2); c.lineTo(x + w + 1, y); c.closePath(); c.fill();
  c.fillStyle = STEEL[1]; c.beginPath(); c.moveTo(x, y); c.lineTo(m, tip); c.lineTo(x + w, y); c.closePath(); c.fill();
  c.fillStyle = STEEL[3]; c.beginPath(); c.moveTo(x + 1, y); c.lineTo(m, tip - 1); c.lineTo(m, y); c.closePath(); c.fill();
};

/** A torch in an iron bracket on the wall: its flame's foot at (x, y); the flame live, dim (no glare). */
export const torch = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 3, y + 2, 6, 26, INK); box(c, x - 2, y + 2, 4, 24, WOOD[2]); box(c, x - 2, y + 2, 1, 24, WOOD[3]);
  box(c, x - 6, y, 12, 6, INK); box(c, x - 5, y + 1, 10, 4, IRON[2]); box(c, x - 5, y + 1, 10, 1, IRON[4]);
  box(c, x - 8, y + 20, 16, 4, INK); box(c, x - 7, y + 21, 14, 2, IRON[2]);
  const fl = (f + x) % 7 < 3 ? 2 : 0, cols = ['#9A3A12', '#C8601A', '#E09030', '#F0C060'];
  for (let s = 0; s < 4; s++) { const h = 18 - s * 4 + fl, w = 12 - s * 3; box(c, x - w / 2, y - h, w, h, cols[s]); }
  if ((f + x) % 20 < 10) box(c, x - 1 + ((f >> 2) % 3) - 1, y - 24 - ((f + x) % 10), 2, 2, cols[2]);
};

/** A chain hung from y0 down to y1 (links, lit on one side). */
export const chain = (c: Ctx, x: number, y0: number, y1: number) => {
  c.strokeStyle = IRON[1]; c.lineWidth = 3; c.setLineDash([5, 3]); c.beginPath(); c.moveTo(x + 1.5, y0); c.lineTo(x + 1.5, y1); c.stroke();
  c.strokeStyle = IRON[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 0.5, y0); c.lineTo(x + 0.5, y1); c.stroke(); c.setLineDash([]);
};

/** A standable stone ledge: its body, its lit top lip. */
export const stoneLedge = (c: Ctx, x: number, y: number, w: number, col = '#5A524A') => {
  const R = rampOf(col);
  box(c, x - 1, y - 1, w + 2, 18, INK); box(c, x, y, w, 16, R[2]); box(c, x, y + 12, w, 4, R[0]); checker(c, x, y + 10, w, 2, R[1]);
  for (let k = x + 20; k < x + w - 4; k += 34) box(c, k, y + 4, 2, 8, R[1]);
  box(c, x, y, w, 2, R[4]); box(c, x, y + 2, w, 2, R[3]);
};

/** A flagstone floor run (the lit edge he walks along, the flags' thickness, the dark under). */
export const flagFloor = (c: Ctx, a: number, b: number, y = GY) => {
  const R = rampOf('#5A544C');
  box(c, a, y, b - a, 2, R[4]); box(c, a, y + 2, b - a, 2, R[3]); checker(c, a, y + 4, b - a, 2, R[3]);
  box(c, a, y + 4, b - a, 12, R[2]); box(c, a, y + 14, b - a, 2, R[0]);
  for (let x = Math.floor(a / 64) * 64; x < b; x += 64) if (x > a) box(c, x, y + 4, 2, 12, R[0]);
  c.fillStyle = blockFill(c, 'under', '#2A2622'); c.fillRect(a, y + 16, b - a, 384);
  hazeBands(c, a, y + 16, b - a, 90, '#060504', 0.2, 0.9, 5);
  box(c, a, y + 106, b - a, 294, '#060504');
};

// ---------------------------------------------------------------------------------------------------------------
// The props (painted at their own origin: feet at 0)

/** A cell: iron bars in a stone frame, the straw in it, a bucket; a prop skeleton in one of them. */
export const paintCell = (g: Ctx, k: number) => {
  box(g, 0, -260, 220, 260, '#0A0807');
  bandedGradient(g, 0, -260, 220, 260, ['#060504', '#0E0B09', '#16110D'], 5);
  for (let s = 0; s < 14; s++) box(g, 10 + Math.floor(hash(s + k * 9) * 190), -6 - Math.floor(hash(s * 3 + k) * 8), 10, 2, s % 2 ? '#6A5A28' : '#4A3E1C');
  if (k === 1) {
    // (a prop skeleton, slumped against the back wall, chained up)
    const B = ['#8A8478', '#B8B2A4', '#DAD5C8'];
    box(g, 120, -60, 26, 22, INK); box(g, 121, -59, 24, 20, B[2]); box(g, 125, -52, 6, 6, INK); box(g, 135, -52, 6, 6, INK); box(g, 128, -43, 10, 2, INK);
    for (let r = 0; r < 4; r++) box(g, 116, -34 + r * 6, 34, 2, B[1]);
    box(g, 131, -38, 3, 34, B[2]); box(g, 100, -30, 18, 3, B[1]); box(g, 148, -30, 18, 3, B[1]);
    box(g, 106, -6, 24, 3, B[1]); box(g, 140, -6, 24, 3, B[1]);
    box(g, 96, -100, 2, 70, IRON[2]); box(g, 168, -100, 2, 70, IRON[2]);
  } else {
    box(g, 30 + k * 40, -30, 26, 30, INK); box(g, 31 + k * 40, -29, 24, 28, WOOD[1]); box(g, 31 + k * 40, -29, 24, 3, IRON[3]); box(g, 31 + k * 40, -12, 24, 3, IRON[2]);
  }
  // (the frame: stone jambs and a lintel)
  for (const jx of [-10, 216]) { box(g, jx - 1, -272, 16, 272, INK); box(g, jx, -270, 14, 270, STONE[2]); box(g, jx, -270, 3, 270, STONE[3]); box(g, jx + 11, -270, 3, 270, STONE[0]); }
  box(g, -12, -282, 244, 20, INK); box(g, -11, -281, 242, 18, STONE[2]); box(g, -11, -281, 242, 2, STONE[3]); box(g, -11, -266, 242, 3, STONE[0]);
  // (the bars: round iron, lit on their left; the cross bands; the door's hinges and its lock)
  for (let b = 0; b < 9; b++) pole(g, 8 + b * 24, -262, 6, 262, IRON[2]);
  for (const by of [-220, -120, -30]) { box(g, 4, by - 1, 212, 8, INK); box(g, 5, by, 210, 6, IRON[2]); box(g, 5, by, 210, 1, IRON[4]); for (let r = 12; r < 210; r += 24) box(g, 5 + r - 2, by + 2, 2, 2, IRON[0]); }
  box(g, 130, -140, 24, 30, INK); box(g, 131, -139, 22, 28, RUST[2]); box(g, 131, -139, 22, 3, RUST[3]); box(g, 140, -130, 4, 10, INK);
};

/** The rack: a wooden frame, a roller at each end with its crank, the ropes; a skeleton prop on it. */
export const paintRack = (g: Ctx) => {
  slab(g, 0, -62, 170, 14, WOOD[2], { edge: 2 });
  for (const lx of [4, 152]) { box(g, lx - 1, -48, 16, 48, INK); pole(g, lx, -48, 14, 48, WOOD[2], false); }
  for (const ex of [-6, 162]) { slab(g, ex, -74, 14, 34, WOOD[1], { edge: 2 }); box(g, ex + 4, -92, 4, 20, STEEL[1]); box(g, ex - 4, -94, 12, 4, STEEL[2]); box(g, ex + 3, -66, 8, 8, IRON[3]); }
  const B = ['#8A8478', '#B8B2A4', '#DAD5C8'];
  box(g, 29, -72, 112, 8, INK); box(g, 30, -71, 110, 6, B[2]); for (let r = 0; r < 6; r++) box(g, 60 + r * 8, -74, 2, 10, B[1]);
  box(g, 20, -78, 16, 15, INK); box(g, 21, -77, 14, 13, B[2]); box(g, 24, -73, 3, 3, INK); box(g, 29, -73, 3, 3, INK);
  box(g, 8, -68, 22, 2, '#B8A47A'); box(g, 140, -68, 22, 2, '#B8A47A');
};

/** The iron maiden: a coffin stood on end with a face on its lid, the lid hung open, the spikes inside. */
export const paintMaiden = (g: Ctx) => {
  const shape = (inset: number) => { g.beginPath(); g.moveTo(-34 + inset, 0); g.lineTo(-40 + inset, -140); g.lineTo(-24 + inset, -210 + inset); g.lineTo(24 - inset, -210 + inset); g.lineTo(40 - inset, -140); g.lineTo(34 - inset, 0); g.closePath(); };
  g.fillStyle = INK; shape(-2); g.fill(); g.fillStyle = IRON[1]; shape(0); g.fill(); g.fillStyle = IRON[2]; shape(6); g.fill();
  g.save(); shape(6); g.clip(); box(g, -40, -210, 18, 210, IRON[3]); box(g, -40, -210, 6, 210, IRON[4]); box(g, 20, -210, 20, 210, IRON[1]); g.restore();
  // (the face on it: a stern lady, painted)
  box(g, -12, -194, 24, 30, INK); box(g, -11, -193, 22, 28, '#B8B2A8'); box(g, -11, -193, 6, 28, '#D8D2C8');
  box(g, -7, -183, 5, 3, INK); box(g, 3, -183, 5, 3, INK); box(g, -4, -172, 8, 2, '#7F1D1D'); box(g, -13, -198, 26, 6, '#3A2A1A');
  for (const by of [-120, -50]) { box(g, -36, by, 72, 4, INK); box(g, -35, by + 1, 70, 2, RUST[2]); }
  // (the lid, swung open on its hinges; the spikes on its inside)
  box(g, 35, -201, 52, 198, INK); box(g, 36, -200, 50, 196, IRON[1]); box(g, 36, -200, 50, 3, IRON[3]);
  for (let k = 0; k < 7; k++) { const y = -186 + k * 26; c2spike(g, 40, y); c2spike(g, 60, y + 12); }
  for (const hy of [-180, -40]) box(g, 30, hy, 10, 8, RUST[2]);
};
const c2spike = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 18, y); g.lineTo(x, y + 4); g.closePath(); g.fill();
  g.fillStyle = STEEL[2]; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 16, y); g.lineTo(x, y); g.closePath(); g.fill();
};

/** The crate (up on it to the lever): wood, banded in iron, lit along its top. Feet at 0. */
export const paintCrate = (g: Ctx, w: number, h: number) => {
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  box(g, 0, -h, w, h, WOOD[2]);
  for (let k = 0; k < 5; k++) box(g, 0, -h + 4 + k * (h / 5), w, 1, WOOD[1]);
  box(g, 0, -h, 4, h, WOOD[3]); box(g, w - 4, -h, 4, h, WOOD[0]);
  g.strokeStyle = WOOD[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(6, -6); g.lineTo(w - 6, -h + 6); g.stroke();
  g.strokeStyle = WOOD[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(5, -8); g.lineTo(w - 7, -h + 4); g.stroke();
  for (const by of [-h + 6, -12]) { box(g, 0, by, w, 6, IRON[1]); box(g, 0, by, w, 1, IRON[3]); for (let r = 6; r < w; r += 20) box(g, r, by + 2, 2, 2, IRON[4]); }
  box(g, 0, -h, w, 2, '#E0B080'); box(g, 0, -h + 2, w, 2, '#C08A5A');
};
