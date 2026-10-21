// The dungeon's paint kit (the final pass: peak SNES): its stone, its spikes, its iron, the props in the cells. Shared
// by the stairs, the cells and the chamber (index.ts), the rope walk and the deaths. Still art goes down as stamps
// (painted once, at its own origin, so one picture can go down in many places); what moves is drawn live.

import { INK, box, pole, slab, rampOf, mix, checker, hazeBands, bandedGradient, brickPattern, tilePattern, stamp, hash, sign } from '../../intro/art/kit';
import { GY } from '../geometry';
import { guestOf, lyingGuest, rackedGuest, pinnedGuest, skeleton, splat, drips, severedHand, earHat, bucketOfBits, stroller, selfieStick, souvenirCup, ticket } from './remains';
import { signW, tomb } from '../letters';

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
  // (the dungeon's lettering: cut in the stone plate and painted, chipped, moss in the cuts' feet)
  const L = tomb({ sx: 1, sy: 2 }, ink, mix(face, '#000000', 0.6), '#3F5A1E', words.length), w = Math.round(signW(words, L)) + 18;
  sign(c, x - w / 2, y - 11, w, 22, face, words, ink, 8, frame, L);
};

/** Dressed stone blocks (a fill, lined up with whatever's the origin when it's used): each block lit along its top and
 *  left, shaded under and right, mortar dark between. */
export const blockFill = (c: Ctx, key: string, col: string) => {
  const R = rampOf(col);
  // (four courses of blocks in a 240 x 160 repeat, every block its own: its tone, a stepped bevel lit along its top and
  // left and shaded under and right (dithered between), a knocked corner, pits, now and then a crack, saltpeter
  // weeping white out of a joint, or a dark old stain)
  const TW = 240, TH = 160;
  return tilePattern(c, `dBlock2:${key}`, TW, TH, t => {
    const mortar = mix(R[0], INK, 0.4);
    t.fillStyle = mortar; t.fillRect(0, 0, TW, TH);
    const rows = [[58, 62, 54, 66], [46, 70, 60, 64], [64, 52, 68, 56], [50, 60, 72, 58]];
    let i = 0;
    rows.forEach((ws, r) => {
      const y = r * 40;
      for (let x0 = [0, -28, -14, -40][r], k = 0; x0 < TW; k++, i++) {
        const w = ws[k % ws.length], kk = hash(i * 3.1 + r * 7.7);
        const b = kk < 0.3 ? R[1] : kk < 0.6 ? R[2] : kk < 0.85 ? mix(R[1], R[2], 0.5) : mix(R[2], '#5A4A3A', 0.25);
        for (const ox of [0, -TW, TW]) {
          const x = x0 + ox; if (x > TW || x + w < 0) continue;
          const bw = w - 2, bh = 38;
          t.fillStyle = b; t.fillRect(x, y, bw, bh);
          t.fillStyle = R[3]; t.fillRect(x, y, bw, 2); t.fillRect(x, y, 2, bh);
          t.fillStyle = mix(b, R[3], 0.5); t.fillRect(x + 2, y + 2, bw - 4, 2);
          checker(t, x + 2, y + 4, bw - 4, 2, mix(b, R[3], 0.5)); checker(t, x + 2, y + 2, 2, bh - 6, mix(b, R[3], 0.5));
          t.fillStyle = R[0]; t.fillRect(x, y + bh - 3, bw, 3); t.fillRect(x + bw - 2, y, 2, bh);
          checker(t, x + 2, y + bh - 5, bw - 4, 2, mix(b, R[0], 0.5), 1);
          t.fillStyle = mortar; t.fillRect(x, y, 2, 2); if (kk > 0.55) { t.fillRect(x + bw - 5, y + bh - 5, 5, 5); t.fillStyle = R[0]; t.fillRect(x + bw - 7, y + bh - 5, 2, 2); }
          t.fillStyle = mix(b, R[0], 0.5); for (let p = 0; p < 7; p++) t.fillRect(x + 4 + Math.floor(hash(i + p * 1.3) * (bw - 8)), y + 6 + Math.floor(hash(i * 2 + p * 5) * 26), 2, 2);
          if (hash(i * 9.7 + 0.31) < 0.09) { let cx = x + 8 + Math.floor(hash(i * 2.2) * (bw * 0.5)); for (let cy = y + 4; cy < y + bh - 6; cy += 4) { t.fillStyle = INK; t.fillRect(cx, cy, 2, 4); t.fillStyle = R[3]; t.fillRect(cx + 2, cy + 2, 1, 2); cx += hash(cy + i) < 0.5 ? 2 : -2; } }
          if (hash(i * 6.1) < 0.14) { checker(t, x + 6, y + bh - 2, 10, 20, 'rgba(200, 196, 180, 0.35)'); t.fillStyle = 'rgba(200, 196, 180, 0.3)'; t.fillRect(x + 8, y + bh - 2, 4, 12); }
          if (hash(i * 4.4) < 0.1) { checker(t, x + 10, y + 8, bw - 20, bh - 16, 'rgba(40, 8, 6, 0.35)'); }
        }
        x0 += w;
      }
    });
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
export const rockFill = (c: Ctx) => tilePattern(c, 'dRock2', 128, 128, t => {
  // (rough rock: lumps of it heaped, each lit along its top, shaded under, flecked; seams of dark between)
  t.fillStyle = '#0C0908'; t.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 30; k++) {
    const x = Math.floor(hash(k * 1.3) * 128), y = Math.floor(hash(k * 2.9) * 128), w = 14 + Math.floor(hash(k * 4.1) * 22), h = 10 + Math.floor(hash(k * 5.7) * 12);
    const col = ['#16110E', '#1A1411', '#1E1713', '#151210'][k % 4];
    for (const [ox, oy] of [[0, 0], [-128, 0], [0, -128], [-128, -128]]) {
      const sx = x + ox, sy = y + oy;
      t.fillStyle = '#080605'; t.beginPath(); t.roundRect(sx - 1, sy - 1, w + 2, h + 2, 4); t.fill();
      t.fillStyle = col; t.beginPath(); t.roundRect(sx, sy, w, h, 4); t.fill();
      t.fillStyle = '#2A211B'; t.fillRect(sx + 3, sy + 1, w - 7, 1); t.fillStyle = '#231B16'; t.fillRect(sx + 2, sy + 2, w - 5, 2);
      checker(t, sx + 2, sy + 4, w - 5, 2, '#231B16');
      t.fillStyle = '#0E0B09'; t.fillRect(sx + 2, sy + h - 3, w - 4, 2);
      t.fillStyle = '#2E241E'; t.fillRect(sx + 4 + Math.floor(hash(k) * (w - 8)), sy + 5 + Math.floor(hash(k * 3) * (h - 8)), 1, 1);
    }
  }
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
  // (who's in it: the remains of earlier visitors, in their park clothes; the blood up the back wall)
  splat(g, 60 + k * 40, -150, 40, 30, k * 9); drips(g, 40 + k * 30, -140, 60, 5, 60, k);
  if (k === 0) {
    lyingGuest(g, 30, -2, guestOf(11)); bucketOfBits(g, 180, 0); ticket(g, 120, -2);
    splat(g, 70, 0, 70, 4, 3);
  } else if (k === 1) {
    // (a skeleton chained to the back wall, still in its ears hat; another on the floor)
    const B = ['#8A8478', '#B8B2A4', '#DAD5C8'];
    box(g, 120, -60, 26, 22, INK); box(g, 121, -59, 24, 20, B[2]); box(g, 125, -52, 6, 6, INK); box(g, 135, -52, 6, 6, INK); box(g, 128, -43, 10, 2, INK);
    earHat(g, 133, -60, 1);
    for (let r = 0; r < 4; r++) box(g, 116, -34 + r * 6, 34, 2, B[1]);
    box(g, 131, -38, 3, 34, B[2]); box(g, 100, -30, 18, 3, B[1]); box(g, 148, -30, 18, 3, B[1]);
    box(g, 106, -6, 24, 3, B[1]); box(g, 140, -6, 24, 3, B[1]);
    box(g, 96, -100, 2, 70, IRON[2]); box(g, 168, -100, 2, 70, IRON[2]);
    skeleton(g, 14, -2); souvenirCup(g, 196, 0, true);
  } else {
    stroller(g, 20, 0); lyingGuest(g, 80, -2, guestOf(23)); selfieStick(g, 150, -10, 36);
    splat(g, 120, 0, 80, 4, 7);
  }
  // (the frame: stone jambs and a lintel)
  for (const jx of [-10, 216]) { box(g, jx - 1, -272, 16, 272, INK); box(g, jx, -270, 14, 270, STONE[2]); box(g, jx, -270, 3, 270, STONE[3]); box(g, jx + 11, -270, 3, 270, STONE[0]); }
  box(g, -12, -282, 244, 20, INK); box(g, -11, -281, 242, 18, STONE[2]); box(g, -11, -281, 242, 2, STONE[3]); box(g, -11, -266, 242, 3, STONE[0]);
  // (the bars: round iron, lit on their left; the cross bands; the door's hinges and its lock)
  for (let b = 0; b < 9; b++) pole(g, 8 + b * 24, -262, 6, 262, IRON[2]);
  for (const by of [-220, -120, -30]) { box(g, 4, by - 1, 212, 8, INK); box(g, 5, by, 210, 6, IRON[2]); box(g, 5, by, 210, 1, IRON[4]); for (let r = 12; r < 210; r += 24) box(g, 5 + r - 2, by + 2, 2, 2, IRON[0]); }
  box(g, 130, -140, 24, 30, INK); box(g, 131, -139, 22, 28, RUST[2]); box(g, 131, -139, 22, 3, RUST[3]); box(g, 140, -130, 4, 10, INK);
  // (a hand left on a bar, still holding on)
  if (k === 0) severedHand(g, 8 + 4 * 24 + 1, -152, guestOf(5).skin);
  if (k === 2) { severedHand(g, 8 + 2 * 24 + 1, -108, guestOf(8).skin); drips(g, 44, -100, 10, 2, 40, 2); }
};

/** The rack: a wooden frame, a roller at each end with its crank, the ropes; a skeleton prop on it. */
export const paintRack = (g: Ctx) => {
  slab(g, 0, -62, 170, 14, WOOD[2], { edge: 2 });
  for (const lx of [4, 152]) { box(g, lx - 1, -48, 16, 48, INK); pole(g, lx, -48, 14, 48, WOOD[2], false); }
  for (const ex of [-6, 162]) { slab(g, ex, -74, 14, 34, WOOD[1], { edge: 2 }); box(g, ex + 4, -92, 4, 20, STEEL[1]); box(g, ex - 4, -94, 12, 4, STEEL[2]); box(g, ex + 3, -66, 8, 8, IRON[3]); }
  // (somebody half-stretched on it, roped at wrist and ankle; the bucket under it; their cup where they dropped it)
  rackedGuest(g, 2, -62, guestOf(37));
  splat(g, 85, -2, 90, 4, 21); drips(g, 40, -48, 90, 6, 30, 5);
  bucketOfBits(g, 196, 0); souvenirCup(g, -24, 0, true);
};

/** The iron maiden: a coffin stood on end with a face on its lid, the lid hung open, the spikes inside. */
export const paintMaiden = (g: Ctx) => {
  const shape = (inset: number) => { g.beginPath(); g.moveTo(-34 + inset, 0); g.lineTo(-40 + inset, -140); g.lineTo(-24 + inset, -210 + inset); g.lineTo(24 - inset, -210 + inset); g.lineTo(40 - inset, -140); g.lineTo(34 - inset, 0); g.closePath(); };
  g.fillStyle = INK; shape(-2); g.fill(); g.fillStyle = IRON[1]; shape(0); g.fill(); g.fillStyle = IRON[2]; shape(6); g.fill();
  g.save(); shape(6); g.clip(); box(g, -40, -210, 18, 210, IRON[3]); box(g, -40, -210, 6, 210, IRON[4]); box(g, 20, -210, 20, 210, IRON[1]); g.restore();
  // (open: its spiked inside, and who's still pinned in it; the blood pooled under)
  g.save(); shape(8); g.clip(); box(g, -40, -210, 80, 210, '#160C0C');
  for (let k = 0; k < 6; k++) for (const sx of [-26, 18]) { g.fillStyle = '#6A6A72'; g.beginPath(); g.moveTo(sx, -190 + k * 30); g.lineTo(sx + (sx < 0 ? 10 : -10), -186 + k * 30); g.lineTo(sx, -182 + k * 30); g.closePath(); g.fill(); }
  pinnedGuest(g, 0, -8, guestOf(52));
  g.restore();
  splat(g, 4, -2, 90, 6, 52);
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
