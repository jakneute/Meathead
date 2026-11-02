// SPAZ & STINKY'S BUMPER BASH CHALLENGE, painted. Everything here's baked once into its own canvas (the arena, each
// car with its driver squeezed in, each burnt-out hulk, each driver flung and flattened) and put down each frame:
// cars turned with drawImage (baked once, then drawn turned: the stamp cache rejects rotations), nothing painted per
// pixel per frame. SNES: six-step ramps, banded fills, dithered seams, the ink line round everything.
//
//   THE ARENA      overhead: the diamond-plate floor in bands (darker out toward the rail), hazard stripes round its
//                  edge, the fat rubber bumper rail, the chain-link and the crowd behind it, the back wall's scoreboard
//                  (SPAZ & STINKY'S BUMPER BASH: the clock and the cars left lit on it live), the ceiling's wire grid
//                  over it all (its own canvas, laid over the cars: they're under it)
//   THE CARS       from above: the rubber ring round each, the body banded in its color, the number on the hood, the
//                  seat, the wheel, the driver from above (hair, nose, shoulders, arms to the wheel): skinny ones lost
//                  in the seat, heavy ones spilling over its sides, men and women, skin tones, hair; MEATHEAD in his
//                  (red, #1: shirtless, the flat-top, the thick glasses, his lap clean, shat or bare)
//   THE HULKS      a killed car: blown up and burnt out, charred black, the paint blistered, the ring torn, the seat
//                  empty and smoking (pushable: bumper.ts)
//   THE DRIVERS    flung (front-on, flailing, screaming: two frames), flattened (a Looney Tunes pancake: spread-eagle,
//                  eyes spun, tongue out, edges crinkled), and run over after (OVERKILL: tread marks across, the eyes
//                  popped out on springs)
//   THE CARNY      in the bumper bash's booth (side view, the land's people drawer: a heavy man in a candy-striped vest,
//                  a straw boater, a cigar, sleeve garters); and from above at his podium by the rink
//
// Looney Tunes violence: nobody bleeds in here; they flatten, they crinkle, their eyes pop out.

import type { Ctx } from '../kit';
import { INK, ramp6, hash } from '../kit';
import { elbowFront } from '../../art/limb';
import {
  type Pose, type Frame, part, px, bodyOf, legs, torso, arm, headShape, faceOn, frameOf, putFrame, dk, lt,
} from '../../spooky/costume';

// ---------------------------------------------------------------------------------------------------------------
// The rink's shape (screen space: it's a full-screen mode)

export const W = 800, H = 600;
/** The floor inside the rail (car middles keep R inside it). */
export const RINK = { x0: 46, y0: 104, x1: 754, y1: 574 };
/** The rail's thickness (outside the floor). */
export const RAIL = 14;
/** A car's rubber ring (collision radius). */
export const R = 23;
/** The carny's podium (from above), top-left outside the rail. */
export const PODIUM = { x: 84, y: 52 };

const mkCanvas = (w: number, h: number) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
  return { cv, g };
};
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const dither = (g: Ctx, x: number, y: number, w: number, h: number, col: string, odd = 0) => {
  g.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + odd) % 2; xx < w; xx += 2) g.fillRect(x + xx, y + yy, 1, 1);
};
const rr = (g: Ctx, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

// ---------------------------------------------------------------------------------------------------------------
// The arena (one canvas, the ceiling grid another)

let arena: HTMLCanvasElement | null = null;
let grid: HTMLCanvasElement | null = null;

const STEEL = ['#1A1E2C', '#272D40', '#363E56', '#48526E', '#5E6A88', '#8490AE'];
const RUBBER = ['#0C0A10', '#18141E', '#26202E', '#352D40', '#4A4058', '#6A5E7C'];
const CROWD = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#C084FC', '#F472B6', '#F8FAFC', '#FB923C'];
const CROWD_SKIN = ['#F6DCC8', '#E0B088', '#C68642', '#8D5524', '#5C3A21', '#F1C27D'];

const paintArena = (g: Ctx) => {
  // (out past the rail: the canopy's shade over the concrete apron, purple-black)
  box(g, 0, 0, W, H, '#140A1E');
  for (let y = 0; y < H; y += 2) if (y % 8 < 2) box(g, 0, y, W, 1, '#1A1028');
  // (the chain-link, sides and bottom: diamonds of wire, and the crowd pressed against it beyond)
  const crowd = (x0: number, y0: number, w: number, h: number, seed: number) => {
    for (let k = 0; k < (w * h) / 70; k++) {
      const x = x0 + hash(seed + k * 1.7) * w, y = y0 + hash(seed + k * 2.9) * h;
      const sh = CROWD[Math.floor(hash(seed + k * 3.1) * CROWD.length)], sk = CROWD_SKIN[Math.floor(hash(seed + k * 4.3) * CROWD_SKIN.length)];
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, y + 4, 7, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = dk(sh, 0.35); g.beginPath(); g.ellipse(x, y + 4, 6, 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = dk(sk, 0.3); g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
      box(g, x - 1, y - 2, 1, 1, dk(sk, 0.05));
    }
  };
  crowd(2, 120, 28, 470, 11); crowd(W - 30, 120, 28, 470, 23); crowd(40, H - 14, W - 80, 12, 37);
  g.strokeStyle = '#6B6880'; g.lineWidth = 1;
  for (const [x0, y0, w, h] of [[0, 96, 32, H - 96], [W - 32, 96, 32, H - 96], [0, H - 18, W, 18]] as const) {
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    for (let d = -H; d < W + H; d += 8) { g.beginPath(); g.moveTo(d, y0); g.lineTo(d + (H - y0), H); g.stroke(); g.beginPath(); g.moveTo(d, H); g.lineTo(d + (H - y0), y0); g.stroke(); }
    g.restore();
  }
  // (the fence's posts)
  for (let y = 120; y < H - 10; y += 96) { box(g, 30, y, 4, 8, '#9C98B0'); box(g, W - 34, y, 4, 8, '#9C98B0'); }
  // (the back wall: cinder block in the zone's purple, the scoreboard hung on it (its face live: drawn on top))
  for (let y = 0; y < 92; y += 10) for (let x = (y / 10) % 2 ? -12 : 0; x < W; x += 24) { box(g, x, y, 23, 9, '#3B1F5C'); box(g, x, y, 23, 1, '#4C2A74'); box(g, x, y + 8, 23, 1, '#2A1442'); }
  for (let x = 0; x < W; x += 2) if ((x >> 1) % 2) box(g, x, 88, 1, 4, '#1A0B2A');
  // (the board: a fat lumpy frame, hot pink and lime, chaser bulbs round it)
  const bx = 150, by = 6, bw = 500, bh = 76;
  g.fillStyle = INK; rr(g, bx - 4, by - 4, bw + 8, bh + 8, 14); g.fill();
  const Pk = ramp6('#EC4899');
  for (let i = 0; i < 4; i++) { g.fillStyle = Pk[1 + i]; rr(g, bx - 2 + i, by - 2 + i, bw + 4 - i * 2, bh + 4 - i * 2, 12 - i); g.fill(); }
  g.fillStyle = INK; rr(g, bx + 8, by + 8, bw - 16, bh - 16, 6); g.fill();
  g.fillStyle = '#0B0612'; rr(g, bx + 10, by + 10, bw - 20, bh - 20, 5); g.fill();
  for (let y = by + 12; y < by + bh - 12; y += 3) dither(g, bx + 12, y, bw - 24, 1, '#140C1E', y % 2);
  for (let i = 0; i < 34; i++) { const x = bx + 6 + i * ((bw - 12) / 33); for (const y of [by + 2, by + bh - 4]) { g.fillStyle = INK; g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FEF08A'; g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); } }
  // (the floor: diamond plate, banded darker out toward the rail, dithered where the bands meet)
  const { x0, y0, x1, y1 } = RINK, fw = x1 - x0, fh = y1 - y0;
  const bands = [STEEL[1], STEEL[2], STEEL[3], STEEL[3], STEEL[3]];
  for (let i = 0; i < bands.length; i++) {
    const inset = i * 26;
    box(g, x0 + inset, y0 + inset, fw - inset * 2, fh - inset * 2, bands[i]);
    if (i) { dither(g, x0 + inset, y0 + inset, fw - inset * 2, 2, bands[i - 1], 0); dither(g, x0 + inset, y1 - inset - 2, fw - inset * 2, 2, bands[i - 1], 1); dither(g, x0 + inset, y0 + inset, 2, fh - inset * 2, bands[i - 1], 0); dither(g, x1 - inset - 2, y0 + inset, 2, fh - inset * 2, bands[i - 1], 1); }
  }
  // (the plate's raised diamonds: a lit pixel up-left, a dark one down-right)
  for (let y = y0 + 6; y < y1 - 4; y += 8) for (let x = x0 + 6 + ((y / 8) % 2) * 4; x < x1 - 4; x += 8) {
    box(g, x, y, 3, 1, STEEL[5]); box(g, x + 1, y + 1, 3, 1, STEEL[1]);
  }
  // (scuffs and tire smears, a seam every so often)
  for (let k = 0; k < 60; k++) {
    const x = x0 + 30 + hash(k * 3.3) * (fw - 60), y = y0 + 30 + hash(k * 5.1) * (fh - 60), a = hash(k * 7.7) * Math.PI;
    g.strokeStyle = 'rgba(10,8,16,0.28)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 18 + hash(k) * 40, a, a + 0.8 + hash(k * 2) * 1.2); g.stroke();
  }
  for (let x = x0 + 118; x < x1; x += 118) { box(g, x, y0, 1, fh, STEEL[0]); box(g, x + 1, y0, 1, fh, STEEL[4]); }
  // (the hazard stripes round the floor's edge)
  g.save(); g.beginPath(); g.rect(x0, y0, fw, fh); g.rect(x0 + 10, y0 + 10, fw - 20, fh - 20); g.clip('evenodd');
  box(g, x0, y0, fw, fh, '#FACC15');
  g.fillStyle = '#1A1028';
  for (let d = -fh; d < fw + fh; d += 16) { g.beginPath(); g.moveTo(x0 + d, y0); g.lineTo(x0 + d + 8, y0); g.lineTo(x0 + d + 8 - fh, y1); g.lineTo(x0 + d - fh, y1); g.closePath(); g.fill(); }
  g.restore();
  // (the logo in the middle of the floor, worn: SPAZ & STINKY, a big lumpy star)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  g.save(); g.globalAlpha = 0.22;
  g.fillStyle = '#F472B6'; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 46 : 104; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.82); }
  g.closePath(); g.fill();
  g.restore();
  g.font = '12px "Press Start 2P"'; g.textAlign = 'center'; g.globalAlpha = 0.28; g.fillStyle = '#FDE047';
  g.fillText("SPAZ & STINKY'S", cx, cy - 6); g.fillText('BUMPER BASH', cx, cy + 14); g.globalAlpha = 1;
  // (the rail: a fat rubber tube all round, outer dark, a lit line along its middle, inner shade; posts at the corners)
  const rail = (inset: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; rr(g, x0 - RAIL / 2 - inset * 0, y0 - RAIL / 2, fw + RAIL, fh + RAIL, 18); g.stroke(); };
  rail(0, INK, RAIL + 4); rail(0, RUBBER[1], RAIL); rail(0, RUBBER[2], RAIL - 4); rail(0, RUBBER[3], RAIL - 8); rail(0, RUBBER[5], 2);
  for (let k = 0; k < 40; k++) { const t = k / 40; for (const [x, y] of [[x0 + fw * t, y0 - RAIL / 2], [x0 + fw * t, y1 + RAIL / 2]]) box(g, x, y - 1, 2, 2, RUBBER[4]); }
  for (const [x, y] of [[x0 - RAIL / 2, y0 - RAIL / 2], [x1 + RAIL / 2, y0 - RAIL / 2], [x0 - RAIL / 2, y1 + RAIL / 2], [x1 + RAIL / 2, y1 + RAIL / 2]]) {
    g.fillStyle = INK; g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fill();
    const Y = ramp6('#FACC15'); for (let i = 0; i < 4; i++) { g.fillStyle = Y[1 + i]; g.beginPath(); g.arc(x - i * 0.8, y - i * 0.8, 9 - i * 2, 0, Math.PI * 2); g.fill(); }
  }
  // (the carny's podium, top left: a little striped box)
  g.fillStyle = INK; rr(g, PODIUM.x - 20, PODIUM.y - 14, 40, 28, 4); g.fill();
  for (let i = 0; i < 5; i++) box(g, PODIUM.x - 18 + i * 8, PODIUM.y - 12, 4, 24, i % 2 ? '#F8FAFC' : '#DC2626');
};

/** The ceiling's wire grid seen from above, laid over the cars (thin, see-through), its hangers. */
const paintGrid = (g: Ctx) => {
  const { x0, y0, x1, y1 } = RINK;
  g.strokeStyle = 'rgba(160,150,190,0.22)'; g.lineWidth = 1;
  for (let x = x0 - 6; x <= x1 + 6; x += 24) { g.beginPath(); g.moveTo(x + 0.5, y0 - 8); g.lineTo(x + 0.5, y1 + 8); g.stroke(); }
  for (let y = y0 - 6; y <= y1 + 6; y += 24) { g.beginPath(); g.moveTo(x0 - 8, y + 0.5); g.lineTo(x1 + 8, y + 0.5); g.stroke(); }
  // (the trusses it hangs from: heavier bars every few, lit along one edge)
  for (let x = x0 + 114; x < x1; x += 168) { box(g, x, y0 - 10, 4, y1 - y0 + 20, 'rgba(40,34,56,0.55)'); box(g, x, y0 - 10, 1, y1 - y0 + 20, 'rgba(190,180,220,0.35)'); }
};

export const arenaCanvas = () => {
  if (!arena) { const { cv, g } = mkCanvas(W, H); paintArena(g); arena = cv; }
  return arena;
};
export const gridCanvas = () => {
  if (!grid) { const { cv, g } = mkCanvas(W, H); paintGrid(g); grid = cv; }
  return grid;
};

// ---------------------------------------------------------------------------------------------------------------
// Drivers: who they are

/** 0 skinny, 1 average, 2 heavy. */
export type Build = 0 | 1 | 2;
export interface Look {
  woman: boolean; build: Build; skin: string; hair: string; shirt: string; pants: string;
  long: boolean; bald: boolean; seed: number;
  /** Meathead (his own drawing); his pants: clean, shat, bare. */
  meathead?: 'clean' | 'shitty' | 'nude';
}
export const MH_SKIN = '#E0AC69';

// ---------------------------------------------------------------------------------------------------------------
// The cars, from above (facing +x), baked once each: 76x64, the car's middle at (38, 32)

export const CAR_W = 76, CAR_H = 64;
const cars = new Map<string, HTMLCanvasElement>();
const hulks = new Map<string, HTMLCanvasElement>();
const shoulderOf = (b: Build) => [8.5, 11, 14.5][b];

/** The driver from above (facing +x): thighs forward under the dash, a heavy one's belly, the shoulders across (wide
 *  or narrow: who's heavy reads at a glance), arms out to the wheel (elbows out: limb.ts), the head (hair, the nose
 *  poking forward). */
const driverTop = (g: Ctx, L: Look) => {
  const mh = !!L.meathead, sh = mh ? 13 : shoulderOf(L.build), skin = mh ? MH_SKIN : L.skin;
  const Tr = ramp6(mh ? MH_SKIN : L.shirt), Sk = ramp6(skin);
  const lw = mh ? 5.6 : [3, 4.2, 6][L.build];
  const seg = (x1: number, y1: number, x2: number, y2: number, w: number, col: string) => { g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  // (the thighs, forward from the hips under the dash: jeans, shat jeans, bare)
  const lap = mh ? (L.meathead === 'nude' ? MH_SKIN : '#1E3A8A') : L.pants;
  const lapW = mh ? 6 : [4, 5.4, 7.5][L.build];
  for (const s of [-1, 1]) { seg(-4, s * Math.min(sh * 0.4, 5.5), 9, s * 4, lapW, lap); box(g, -2, s * Math.min(sh * 0.4, 5.5) - 1, 9, 1, lt(lap, 0.3)); }
  if (L.meathead === 'shitty') { g.fillStyle = '#5B3A12'; g.beginPath(); g.ellipse(-2, 0, 5, 6, 0, 0, Math.PI * 2); g.fill(); box(g, 0, -2, 3, 2, '#7C5420'); box(g, 4, 3, 2, 1, '#7C5420'); }
  if (L.meathead === 'nude') { g.fillStyle = Sk[2]; g.beginPath(); g.ellipse(1, 0, 2.2, 1.6, 0, 0, Math.PI * 2); g.fill(); }
  // (a heavy one's belly, out over the lap and the seat's sides)
  if (L.build === 2 && !mh) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(-1, 0, 10, sh + 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Tr[2]; g.beginPath(); g.ellipse(-1, 0, 9, sh + 1.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Tr[3]; g.beginPath(); g.ellipse(0, -1, 6.5, sh - 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Tr[4]; g.beginPath(); g.ellipse(1, -3, 3, sh * 0.45, 0, 0, Math.PI * 2); g.fill();
  }
  // (the arms, shoulder to the wheel, the elbows out to the sides: limb.ts)
  const wheelX = 11;
  for (const s of [-1, 1]) {
    const sx = -6, sy = s * (sh - lw * 0.5), hx = wheelX, hy = s * 4.5;
    const [ex, ey] = elbowFront(sx, sy, hx, hy, 9.5, 9.5, s);
    seg(sx, sy, ex, ey, lw, mh ? Sk[3] : Tr[3]); seg(ex, ey, hx, hy, lw - 0.6, Sk[3]);
    g.fillStyle = INK; g.beginPath(); g.arc(hx, hy, lw * 0.5 + 1.2, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[4]; g.beginPath(); g.arc(hx, hy, lw * 0.5, 0, Math.PI * 2); g.fill();
  }
  // (the shoulders across: a slab as wide as they are, lit along its front edge, the seam down the back)
  const tw = 5 + L.build * 1.2 + (mh ? 2 : 0);
  g.fillStyle = INK; g.beginPath(); g.ellipse(-7, 0, tw + 1, sh + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = mh ? Sk[2] : Tr[2]; g.beginPath(); g.ellipse(-7, 0, tw, sh, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = mh ? Sk[3] : Tr[3]; g.beginPath(); g.ellipse(-6, 0, tw - 1.5, sh - 1.6, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) box(g, -5, s * (sh - 3.5) - 1, 3, 2, mh ? Sk[4] : Tr[4]);
  if (mh) { box(g, -12, -1, 6, 2, Sk[1]); for (const s of [-1, 1]) { box(g, -9, s * 7 - 1, 4, 2, Sk[1]); box(g, -4, s * 10 - 1, 2, 2, Sk[5]); } }
  // (the head: long hair down the back first; the head; ears; the nose poking forward; the hair on top)
  const hx = -7, hr = mh ? 5.8 : L.build === 2 ? 6.2 : 5.4;
  if (!mh && L.long) { g.fillStyle = INK; g.beginPath(); g.ellipse(hx - 5, 0, 7.5, 6.2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = L.hair; g.beginPath(); g.ellipse(hx - 5, 0, 6.5, 5.2, 0, 0, Math.PI * 2); g.fill(); box(g, hx - 10, -1, 7, 1, lt(L.hair, 0.25)); }
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(hx + 0.5, s * hr, 1.8, 2.4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[3]; g.beginPath(); g.ellipse(hx + 0.5, s * hr, 1.1, 1.6, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = INK; g.beginPath(); g.arc(hx, 0, hr + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[3]; g.beginPath(); g.arc(hx, 0, hr, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx + hr + 0.6, 0, 2.4, 1.9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[4]; g.beginPath(); g.ellipse(hx + hr + 0.6, 0, 1.6, 1.2, 0, 0, Math.PI * 2); g.fill();
  if (mh) {
    // (his flat-top: a squared brush of black, scalp showing round it; the thick nerd glasses across his face)
    g.fillStyle = INK; g.beginPath(); g.roundRect(hx - 5, -4.6, 7.6, 9.2, 1.5); g.fill();
    g.fillStyle = '#18181B'; g.beginPath(); g.roundRect(hx - 4.4, -4, 6.6, 8, 1); g.fill();
    box(g, hx - 3.5, -3, 1, 5, '#52525B');
    g.fillStyle = INK; g.fillRect(hx + hr - 2.2, -5.6, 2.6, 11.2);
    box(g, hx + hr - 1.6, -4.4, 1.2, 3, '#BFDBFE'); box(g, hx + hr - 1.6, 1.4, 1.2, 3, '#BFDBFE');
  } else if (L.bald) {
    box(g, hx - 2, -2, 3, 2, Sk[5]); box(g, hx - 1, -1, 1, 1, '#FFFFFF');
    g.fillStyle = L.hair; g.beginPath(); g.arc(hx, 0, hr - 0.4, Math.PI * 0.75, Math.PI * 1.25); g.lineTo(hx - 1, 0); g.fill();
  } else {
    const Hr = ramp6(L.hair);
    g.fillStyle = Hr[2]; g.beginPath(); g.arc(hx - 0.6, 0, hr - 0.2, Math.PI * 0.36, Math.PI * 1.64); g.closePath(); g.fill();
    g.fillStyle = Hr[3]; g.beginPath(); g.arc(hx - 1.4, -0.4, hr - 2.2, Math.PI * 0.45, Math.PI * 1.55); g.closePath(); g.fill();
    box(g, hx - 4, -2, 4, 1, Hr[4]);
    if (L.woman && !L.long) { g.fillStyle = INK; g.beginPath(); g.arc(hx - hr - 1.8, 0, 2.8, 0, Math.PI * 2); g.fill(); g.fillStyle = Hr[2]; g.beginPath(); g.arc(hx - hr - 1.8, 0, 2, 0, Math.PI * 2); g.fill(); box(g, hx - hr + 0.2, -1, 1, 2, '#F472B6'); }
  }
};

const paintCar = (g: Ctx, color: string, num: number, L: Look | null, burnt: boolean) => {
  g.save(); g.translate(CAR_W / 2, CAR_H / 2);
  const C = burnt ? ['#07070A', '#121012', '#1E1A1A', '#2A2422', '#3A302C', '#54463E'] : ramp6(color);
  // (the rubber ring all round: ink, the tube, a lit line round its middle, the shade inside)
  const ring = (w: number, h: number, r: number, col: string) => { g.fillStyle = col; rr(g, -w / 2, -h / 2, w, h, r); g.fill(); };
  ring(64, 50, 24, INK); ring(61, 47, 22, RUBBER[2]); ring(57, 43, 20, RUBBER[3]);
  g.strokeStyle = RUBBER[5]; g.lineWidth = 1; rr(g, -29, -22, 58, 44, 21); g.stroke();
  ring(51, 37, 16, INK);
  if (burnt) {
    // (the ring torn: gaps where it burnt through, curls of melted rubber)
    for (const [a, l] of [[0.5, 0.5], [2.6, 0.4], [4.4, 0.6]]) { g.strokeStyle = '#2A1A10'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 28, 21.5, 0, a, a + l); g.stroke(); g.strokeStyle = '#E25822'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 28, 21.5, 0, a + 0.1, a + l * 0.5); g.stroke(); }
  }
  // (the body: banded from its rim in to the light down its middle, dithered at the seams)
  const bands = [C[1], C[2], C[3], C[4]];
  for (let i = 0; i < bands.length; i++) { g.fillStyle = bands[i]; rr(g, -24 + i * 3, -17 + i * 2.5, 48 - i * 6, 34 - i * 5, 14 - i * 2); g.fill(); }
  for (let i = 1; i < bands.length; i++) { g.save(); rr(g, -24 + i * 3, -17 + i * 2.5, 48 - i * 6, 34 - i * 5, 14 - i * 2); g.clip(); g.strokeStyle = bands[i - 1]; g.setLineDash([1, 1]); g.lineWidth = 1; rr(g, -24 + i * 3 + 0.5, -17 + i * 2.5 + 0.5, 47 - i * 6, 33 - i * 5, 14 - i * 2); g.stroke(); g.restore(); }
  // (the hood up front: a bulge, the number disc on it)
  g.fillStyle = INK; g.beginPath(); g.ellipse(19, 0, 7, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = C[3]; g.beginPath(); g.ellipse(19, 0, 6, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = C[4]; g.beginPath(); g.ellipse(20, -2, 3.5, 5.5, 0, 0, Math.PI * 2); g.fill();
  if (!burnt) {
    g.fillStyle = INK; g.beginPath(); g.arc(21, 0, 4.6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(21, 0, 3.7, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(21, 0); g.rotate(Math.PI / 2); g.fillStyle = INK; g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(num), 0.5, 0.5); g.restore();
    // (a racing stripe down each side)
    box(g, -18, -14, 26, 2, lt(color, 0.5)); box(g, -18, 12, 26, 2, lt(color, 0.5));
  } else {
    // (blistered paint: patches of the old color left, cracks, the soot)
    for (let k = 0; k < 7; k++) { const x = -18 + hash(num * 3 + k) * 36, y = -12 + hash(num * 7 + k * 2) * 24; g.fillStyle = dk(color, 0.55); g.beginPath(); g.arc(x, y, 1.5 + hash(k + num) * 2.5, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#000'; g.lineWidth = 1; for (let k = 0; k < 5; k++) { const a = hash(num + k * 9) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 4, Math.sin(a) * 3); g.lineTo(Math.cos(a) * 18, Math.sin(a) * 13); g.stroke(); }
    for (let k = 0; k < 6; k++) box(g, -16 + hash(num * 5 + k) * 32, -10 + hash(num * 2 + k * 3) * 20, 1, 1, k % 2 ? '#F97316' : '#FDE047');
  }
  // (the seat: a vinyl tub at the back, the steering column and wheel ahead of it)
  g.fillStyle = INK; rr(g, -19, -12, 22, 24, 7); g.fill();
  g.fillStyle = burnt ? '#1A1414' : '#3F1D38'; rr(g, -18, -11, 20, 22, 6); g.fill();
  g.fillStyle = burnt ? '#241C1A' : '#5B2A52'; rr(g, -15, -8, 14, 16, 4); g.fill();
  if (!burnt) for (let y = -6; y < 7; y += 4) box(g, -14, y, 12, 1, '#7A3A6E');
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(11, 0, 5.5, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = burnt ? '#2A2422' : '#27272A'; g.lineWidth = 1.6; g.stroke();
  if (L) driverTop(g, L);
  else if (burnt) {
    // (the empty seat, scorched: a smoking dent where they sat)
    g.fillStyle = '#0A0808'; g.beginPath(); g.ellipse(-7, 0, 6, 7, 0, 0, Math.PI * 2); g.fill();
    box(g, -8, -1, 2, 2, '#F97316');
  }
  // (the pole's socket at the back, its spring)
  g.fillStyle = INK; g.beginPath(); g.arc(-22, 0, 4.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = burnt ? '#3A302C' : '#A1A1AA'; g.beginPath(); g.arc(-22, 0, 3.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = burnt ? '#54463E' : '#E4E4E7'; g.beginPath(); g.arc(-22.6, -0.6, 1.4, 0, Math.PI * 2); g.fill();
  g.restore();
};

const lookKey = (L: Look) => `${L.seed}-${L.build}-${L.woman ? 1 : 0}-${L.meathead ?? ''}`;
/** A car with its driver in it (baked). */
export const carCanvas = (color: string, num: number, L: Look) => {
  const k = `${color}-${num}-${lookKey(L)}`;
  let cv = cars.get(k);
  if (!cv) { const m = mkCanvas(CAR_W, CAR_H); paintCar(m.g, color, num, L, false); cv = m.cv; cars.set(k, cv); }
  return cv;
};
/** A killed car, blown up and burnt out (baked). */
export const hulkCanvas = (color: string, num: number) => {
  const k = `${color}-${num}`;
  let cv = hulks.get(k);
  if (!cv) { const m = mkCanvas(CAR_W, CAR_H); paintCar(m.g, color, num, null, true); cv = m.cv; hulks.set(k, cv); }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The drivers out of their cars: flung (two frames), flattened, run over. Front-on, baked big (BIG times), drawn down.

export const BIG = 4;
/** The figure's box at 1x: feet at (0, 0), head up; the canvas is BIG times this. */
const FIG = { x: -30, y: -50, w: 60, h: 56 };
const figs = new Map<string, HTMLCanvasElement>();
export type FigMode = 'fly0' | 'fly1' | 'flat' | 'over' | 'back';

const paintFigure = (g: Ctx, L: Look, mode: FigMode) => {
  const flat = mode === 'flat' || mode === 'over';
  const bw = [0.78, 1, 1.42][L.build], Sk = ramp6(L.skin), Tr = ramp6(L.shirt), Pn = ramp6(L.pants);
  // (flattened: wider, a touch shorter, the edge crinkled)
  const sx = flat ? 1.35 : 1, sy = flat ? 0.92 : 1;
  g.save(); g.scale(sx, sy);
  const k = mode === 'fly1' ? 1 : 0;
  const hipY = -18, shY = -33, headY = -41, sw = 7.5 * bw, hw = 6.5 * bw;
  const seg = (x1: number, y1: number, x2: number, y2: number, w: number, col: string) => { g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  const limbW = [3.2, 4.2, 6.2][L.build];
  // (legs: splayed; flailing they kick)
  for (const s of [-1, 1]) {
    const hip: [number, number] = [s * hw * 0.5, hipY + 1];
    const foot: [number, number] = flat ? [s * (hw + 9), -1] : [s * (hw + 6 + (k ^ (s > 0 ? 1 : 0)) * 4), -2 - (k ^ (s > 0 ? 0 : 1)) * 5];
    const [kx, ky] = elbowFront(hip[0], hip[1], foot[0], foot[1], 10, 10, s);
    seg(hip[0], hip[1], kx, ky, limbW + 0.6, Pn[3]); seg(kx, ky, foot[0], foot[1], limbW, Pn[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(foot[0] + s * 2, foot[1], 4, 2.6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#27272A'; g.beginPath(); g.ellipse(foot[0] + s * 2, foot[1], 3, 1.8, 0, 0, Math.PI * 2); g.fill();
  }
  // (arms: flung up and out, flailing; flat, spread wide)
  for (const s of [-1, 1]) {
    const sh: [number, number] = [s * (sw - 1), shY + 2];
    const hand: [number, number] = flat ? [s * (sw + 15), shY - 6] : [s * (sw + 11), shY - 12 + ((k ^ (s > 0 ? 1 : 0)) ? 8 : -2)];
    const [ex, ey] = elbowFront(sh[0], sh[1], hand[0], hand[1], 9, 9, s);
    seg(sh[0], sh[1], ex, ey, limbW + 0.4, Tr[3]); seg(ex, ey, hand[0], hand[1], limbW - 0.4, Sk[3]);
    g.fillStyle = INK; g.beginPath(); g.arc(hand[0], hand[1], limbW * 0.6 + 1.2, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[4]; g.beginPath(); g.arc(hand[0], hand[1], limbW * 0.6, 0, Math.PI * 2); g.fill();
    // (fingers spread)
    for (let f = -1; f <= 1; f++) box(g, hand[0] + s * 2 + f, hand[1] - 3 - Math.abs(f), 1, 2, Sk[4]);
  }
  // (the torso: shirt banded, the belly on a heavy one, the pants' waist)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-hw - 1, hipY + 2); g.lineTo(-sw - 1, shY - 1); g.lineTo(sw + 1, shY - 1); g.lineTo(hw + 1, hipY + 2); g.closePath(); g.fill();
  g.fillStyle = Tr[2]; g.beginPath(); g.moveTo(-hw, hipY + 1); g.lineTo(-sw, shY); g.lineTo(sw, shY); g.lineTo(hw, hipY + 1); g.closePath(); g.fill();
  g.fillStyle = Tr[3]; g.fillRect(-sw * 0.6, shY + 1, sw * 1.1, hipY - shY - 1);
  if (L.build === 2) { g.fillStyle = INK; g.beginPath(); g.ellipse(0, hipY - 4, hw + 1.5, 7.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Tr[3]; g.beginPath(); g.ellipse(0, hipY - 4, hw + 0.5, 6.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Tr[4]; g.beginPath(); g.ellipse(-2, hipY - 6, hw * 0.5, 3, 0, 0, Math.PI * 2); g.fill(); box(g, -1, hipY - 2, 2, 1, Sk[2]); }
  if (L.woman) { box(g, -sw * 0.55, shY + 5, sw * 0.4, 2, Tr[4]); box(g, sw * 0.15, shY + 5, sw * 0.4, 2, Tr[4]); }
  box(g, -hw, hipY, hw * 2, 3, Pn[2]);
  // (the head: big, the hair, the face screaming flying; spun eyes and the tongue out flattened)
  const hr = L.build === 2 ? 9.5 : 8.6;
  if (L.long) { g.fillStyle = INK; g.beginPath(); g.ellipse(0, headY + 3, hr + 3.5, hr + 2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = L.hair; g.beginPath(); g.ellipse(0, headY + 3, hr + 2.5, hr + 1, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, headY, hr + 1, hr + 1.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[3]; g.beginPath(); g.ellipse(0, headY, hr, hr + 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[4]; g.beginPath(); g.ellipse(-2.5, headY - 3, hr * 0.5, hr * 0.45, 0, 0, Math.PI * 2); g.fill();
  if (!L.bald) {
    const Hr = ramp6(L.hair);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, headY - hr * 0.55, hr + 1, hr * 0.55, 0, Math.PI, 0); g.fill();
    g.fillStyle = Hr[2]; g.beginPath(); g.ellipse(0, headY - hr * 0.55, hr, hr * 0.48, 0, Math.PI, 0); g.fill();
    // (flying: the hair blown straight up)
    if (!flat) for (let t = -2; t <= 2; t++) { g.fillStyle = INK; g.beginPath(); g.moveTo(t * 3 - 1.6, headY - hr * 0.8); g.lineTo(t * 3.6, headY - hr - 6 - Math.abs(t) * -1); g.lineTo(t * 3 + 1.6, headY - hr * 0.8); g.fill(); g.fillStyle = Hr[3]; g.beginPath(); g.moveTo(t * 3 - 0.8, headY - hr * 0.8); g.lineTo(t * 3.6, headY - hr - 4.5); g.lineTo(t * 3 + 0.8, headY - hr * 0.8); g.fill(); }
    box(g, -3, headY - hr * 0.8, 4, 1, Hr[4]);
  } else box(g, -3, headY - hr + 2, 3, 2, Sk[5]);
  // (the face)
  const ey = headY - 1.5;
  if (!flat) {
    // (eyes bugged out, pupils tiny; the mouth a big screaming O, the uvula)
    for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(s * 3.4, ey, 3.2, 3.8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(s * 3.4, ey, 2.4, 3, 0, 0, Math.PI * 2); g.fill(); box(g, s * 3.4 - 0.5, ey - 0.5, 1, 1, INK); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, headY + 5, 3.4, 3.6 + k, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7F1D1D'; g.beginPath(); g.ellipse(0, headY + 5.4, 2.4, 2.6 + k, 0, 0, Math.PI * 2); g.fill();
    box(g, -0.5, headY + 3, 1, 2, '#F87171');
  } else {
    // (flattened: spun spiral eyes (or popped out on springs, run over), the tongue lolling out)
    if (mode === 'flat') for (const s of [-1, 1]) {
      g.fillStyle = INK; g.beginPath(); g.arc(s * 3.6, ey, 3.3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(s * 3.6, ey, 2.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); for (let a = 0; a < Math.PI * 4; a += 0.4) { const r = 0.2 + a * 0.18; g.lineTo(s * 3.6 + Math.cos(a) * r, ey + Math.sin(a) * r); } g.stroke();
    }
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, headY + 4.6, 3, 1.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = INK; g.beginPath(); g.ellipse(1.2, headY + 7.6, 2.4, 3.6, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F472B6'; g.beginPath(); g.ellipse(1.2, headY + 7.6, 1.6, 2.8, 0.2, 0, Math.PI * 2); g.fill(); box(g, 1, headY + 6, 1, 3, '#BE185D');
  }
  g.restore();
  if (flat) {
    // (the crinkled edge: a pale rim of white dents round the outline, like a squashed paper doll)
    g.save(); g.globalCompositeOperation = 'source-atop';
    for (let a = 0; a < Math.PI * 2; a += 0.22) { const x = Math.cos(a) * 26, y = -24 + Math.sin(a) * 26; box(g, x - 1, y - 1, 2, 2, 'rgba(255,255,255,0.28)'); }
    g.restore();
  }
  if (mode === 'over') {
    // (run over: two tread marks across, chevrons in them; the eyes popped out on their springs)
    g.save(); g.globalCompositeOperation = 'source-atop';
    for (const y of [-36, -16]) { box(g, -40, y, 80, 7, 'rgba(14,10,18,0.72)'); for (let x = -40; x < 40; x += 5) { g.fillStyle = 'rgba(70,64,80,0.8)'; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + 3, y + 3.5); g.lineTo(x, y + 6); g.lineTo(x + 1.5, y + 3.5); g.closePath(); g.fill(); } }
    g.restore();
    const ey2 = -1.5 - 41 * 0.92;
    for (const s of [-1, 1]) {
      const ox = s * 4.8, tx = s * 15, ty = ey2 - 13;
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ox, ey2);
      for (let t = 0; t <= 1.001; t += 0.1) g.lineTo(ox + (tx - ox) * t + Math.sin(t * Math.PI * 6) * 2, ey2 + (ty - ey2) * t);
      g.stroke();
      g.fillStyle = INK; g.beginPath(); g.arc(tx, ty, 4.4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(tx, ty, 3.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#1D4ED8'; g.beginPath(); g.arc(tx + s * 0.8, ty + 0.8, 1.6, 0, Math.PI * 2); g.fill(); box(g, tx - 1.5, ty - 2, 1, 1, '#FFFFFF');
    }
  }
};

/** A driver out of the car, front-on, feet at the canvas's (-FIG.x, -FIG.y) * BIG: drawn down by 1/BIG for real size. */
export const figCanvas = (L: Look, mode: FigMode) => {
  const k = `${lookKey(L)}-${mode}`;
  let cv = figs.get(k);
  if (!cv) {
    const m = mkCanvas(FIG.w * BIG, FIG.h * BIG);
    m.g.imageSmoothingEnabled = true;
    m.g.scale(BIG, BIG); m.g.translate(-FIG.x, -FIG.y);
    paintFigure(m.g, L, mode === 'back' ? 'flat' : mode);
    if (mode === 'back') {
      // (the back of the pancake, for its peel: the flat shape in a dark wash of their shirt, creases across it)
      const g = m.g; g.globalCompositeOperation = 'source-atop';
      g.fillStyle = dk(L.shirt, 0.62); g.fillRect(FIG.x * 2, FIG.y * 2, FIG.w * 3, FIG.h * 3);
      g.strokeStyle = dk(L.shirt, 0.35); g.lineWidth = 0.8;
      for (let y = FIG.y; y < 6; y += 5) { g.beginPath(); g.moveTo(-40, y); g.lineTo(40, y + 2); g.stroke(); }
      g.globalCompositeOperation = 'source-over';
    }
    cv = m.cv; figs.set(k, cv);
  }
  return cv;
};
/** Puts a driver down at (x, y) (their middle), `s` times real size, turned `a`. */
export const drawFig = (c: Ctx, L: Look, mode: FigMode, x: number, y: number, s: number, a = 0, sx = 1, sy = 1) => {
  const cv = figCanvas(L, mode);
  c.save(); c.translate(x, y); if (a) c.rotate(a); c.scale((s * sx) / BIG, (s * sy) / BIG);
  c.drawImage(cv, -cv.width / 2, -cv.height / 2 - 4 * BIG);
  c.restore();
};

/** A pancake peeling off the glass: everything above the fold `k` (0 flat on, 1 mostly off) has come loose and hangs
 *  folded over the front, its back showing, curling shorter as it goes. Drawn with drawImage only (two bakes). */
export const drawPeel = (c: Ctx, L: Look, x: number, y: number, s: number, k: number) => {
  const cv = figCanvas(L, 'flat'), bk = figCanvas(L, 'back'), q = s / BIG;
  const w = cv.width * q, h = cv.height * q, left = x - w / 2, top = y - h / 2 - 4 * s;
  const fs = Math.round(cv.height * (0.06 + 0.58 * k));
  c.drawImage(cv, 0, fs, cv.width, cv.height - fs, left, top + fs * q, w, (cv.height - fs) * q);
  // (the loose part, flipped down over the front: its back, foreshortened by the curl)
  const hang = fs * q * (0.85 - 0.35 * k);
  c.save(); c.translate(0, top + fs * q); c.scale(1, -1);
  c.drawImage(bk, 0, 0, cv.width, fs, left + w * 0.04, -hang, w * 0.92, hang);
  c.restore();
  // (the fold's edge: a lit lip along it)
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(left + w * 0.12, top + fs * q - 1, w * 0.76, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The carny: side view at the booth (the land's people drawer), from above at his podium

/** His seed (the people drawer: a heavy man). */
export const CARNY_SEED = 12;
const VEST_A = '#DC2626', VEST_B = '#F8FAFC', UNDERSHIRT = '#EDE6D2', SLACKS = '#27272A';
const paintCarny = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr, false), L = B.L;
  const wave = F.v.startsWith('wave'), talk = F.pose === 'tell' || F.v === 'wavet';
  legs(g, B, { col: SLACKS, shoe: 'pointy', shoeCol: '#18181B' });
  // (the far hand on his hip; the near one thumbing back at the booth, or out with a fistful of tickets, talking;
  // waving him down: both hands up over his head, swung side to side out of step (the elbows by limb.ts, in arm()))
  const W4 = WAVE_HANDS[F.fr % 4];
  const far: [number, number] = wave ? [-B.w / 2 + W4[0], B.shY + W4[1]] : [-B.w / 2 + 2, B.hipY - 2];
  const near: [number, number] = wave ? [B.w / 2 + W4[2], B.shY + W4[3]] : talk ? [B.w / 2 + 16, B.shY - 4 + (F.fr % 2) * 3] : [B.w / 2 + 6, B.shY + 16];
  arm(g, B, -1, far[0], far[1], { sleeve: UNDERSHIRT, hand: L.skin, len: 0.35 });
  const path = torso(g, B, UNDERSHIRT);
  // (the vest: candy stripes, buttoned over the belly, gaping at the bottom)
  g.save(); g.beginPath(); path(); g.clip();
  for (let x = -B.w; x < B.w; x += 5) px(g, x, B.shY, 3, B.hipY - B.shY + 4, (x / 5) % 2 ? VEST_B : VEST_A);
  px(g, -2, B.shY, 5, B.hipY - B.shY + 4, UNDERSHIRT);
  px(g, -1, B.hipY - 6, 3, 8, dk(UNDERSHIRT, 0.12));
  g.restore();
  for (let y = B.shY + 8; y < B.hipY - 4; y += 6) px(g, 3, y, 2, 2, '#FDE047');
  // (a belt under the belly, the pants hiked)
  part(g, () => g.rect(-B.hipW / 2 - 1, B.hipY - 2, B.hipW + 2, 3), '#3F2A1A', -B.hipW / 2 - 1, B.hipY - 2, B.hipW + 2, 3, 0.8);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: talk || wave ? 'smug' : 'tired', mouth: talk ? 'talk' : 'smirk', md: F.md, blink: F.blink, noseCol: '#E07A6A' });
  // (stubble, a pencil mustache, the cigar in the corner of his mouth with its ember)
  for (let k = 0; k < 9; k++) px(g, B.hx - 2 + (k % 5) * 2.2, B.hy + 5 + Math.floor(k / 5) * 2, 1, 1, dk(L.skin, 0.3));
  px(g, B.hx + 2, B.hy + 4, 7, 1.4, '#2A1A10');
  part(g, () => g.roundRect(B.hx + 7, B.hy + 5.5, 9, 2.6, 1), '#7C4A22', B.hx + 7, B.hy + 5.5, 9, 2.6, 0.8);
  px(g, B.hx + 15, B.hy + 5.6, 2, 2.4, '#F97316'); px(g, B.hx + 15.5, B.hy + 6, 1, 1, '#FDE047');
  // (the straw boater: the flat crown, the red band, the brim out each side)
  part(g, () => g.roundRect(B.hx - 13, B.hy - 9, 27, 3, 1.5), '#E8C97A', B.hx - 13, B.hy - 9, 27, 3, 1);
  part(g, () => g.rect(B.hx - 8, B.hy - 17, 17, 9), '#F2D88E', B.hx - 8, B.hy - 17, 17, 9, 1);
  px(g, B.hx - 8, B.hy - 12, 17, 3, '#B91C1C');
  for (let x = B.hx - 7; x < B.hx + 8; x += 2) px(g, x, B.hy - 16, 1, 3, '#C9A85C');
  px(g, B.hx - 7, B.hy - 16, 15, 1, '#FFF4C8');
  arm(g, B, 1, near[0], near[1], { sleeve: UNDERSHIRT, hand: L.skin, len: 0.35 });
  // (the sleeve garter round his near arm)
  px(g, B.w / 2 - 6, B.shY + 7, 6, 2, '#16A34A');
  // (waving: the open palms, fingers spread)
  if (wave) for (const [hx, hy] of [far, near]) for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + (k - 1.5) * 0.42; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(a) * 6.5, hy + Math.sin(a) * 6.5); g.stroke(); g.strokeStyle = L.skin; g.lineWidth = 1.4; g.stroke(); }
  // (talking: the fistful of tickets fanned out)
  else if (talk) for (let k = 0; k < 3; k++) { g.save(); g.translate(near[0] + 2, near[1] - 2); g.rotate(-0.5 + k * 0.4); part(g, () => g.rect(0, -2, 9, 4), k % 2 ? '#FDE047' : '#F472B6', 0, -2, 9, 4, 0.6); g.restore(); }
};
/** The wave's four frames, from the shoulders' line (far hand x off the far shoulder, y; near hand x off the near
 *  shoulder, y): both up over the hat, swung out of step, wide each way. */
const WAVE_HANDS: [number, number, number, number][] = [[-12, -30, 14, -32], [-4, -38, 6, -40], [4, -40, -2, -38], [-4, -38, 6, -40]];
const CARNY_BOX: [number, number, number, number] = [-60, -130, 130, 136];
/** The carny at (x, feet y), facing `dir`, talking or not; `waving`: flagging him down (talking too, if he's calling). */
export const drawCarny = (c: Ctx, x: number, y: number, dir: 1 | -1, talking: boolean, f: number, waving = false) => {
  const pose: Pose = waving ? 'stand' : talking ? 'tell' : 'stand';
  const F = frameOf(CARNY_SEED, talking ? Math.floor(f / 8) : f, pose, 'ok', 0, false, waving ? (talking ? 'wavet' : 'wave') : '');
  const Fr: Frame = waving ? { ...F, fr: Math.floor(f / 7) % 4, blink: false } : talking ? { ...F, fr: Math.floor(f / 8) % 2 } : F;
  c.save(); c.translate(x, y); if (dir < 0) c.scale(-1, 1);
  putFrame(c, 'ct-carny', Fr, CARNY_BOX, g => paintCarny(g, Fr));
  c.restore();
};

/** From above at his podium (bumper.ts's arena): the boater's crown and brim, the striped shoulders, a megaphone. */
let carnyTop: HTMLCanvasElement | null = null;
export const drawCarnyTop = (c: Ctx, x: number, y: number) => {
  if (!carnyTop) {
    const m = mkCanvas(48, 40), g = m.g;
    g.translate(24, 22);
    // (shoulders: the striped vest from above, the belly out front)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 2, 14, 10, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, 2, 13, 9, 0, 0, Math.PI * 2); g.clip();
    for (let x2 = -14; x2 < 14; x2 += 4) box(g, x2, -8, 2, 20, VEST_A); for (let x2 = -12; x2 < 14; x2 += 4) box(g, x2, -8, 2, 20, VEST_B);
    g.restore();
    // (the megaphone in his near hand, pointed at the rink)
    g.fillStyle = INK; g.beginPath(); g.moveTo(8, 4); g.lineTo(21, 9); g.lineTo(21, 17); g.lineTo(8, 9); g.closePath(); g.fill();
    g.fillStyle = '#F8FAFC'; g.beginPath(); g.moveTo(9, 5); g.lineTo(20, 10); g.lineTo(20, 15.5); g.lineTo(9, 8); g.closePath(); g.fill(); box(g, 18, 10, 2, 5, '#DC2626');
    // (the boater: brim, crown, band)
    g.fillStyle = INK; g.beginPath(); g.arc(0, -2, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E8C97A'; g.beginPath(); g.arc(0, -2, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#B91C1C'; g.beginPath(); g.arc(0, -2, 6.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F2D88E'; g.beginPath(); g.arc(0, -2, 5.4, 0, Math.PI * 2); g.fill();
    box(g, -3, -5, 3, 1, '#FFF4C8');
    for (let a = 0; a < Math.PI * 2; a += 0.5) box(g, Math.cos(a) * 8.3, -2 + Math.sin(a) * 8.3, 1, 1, '#C9A85C');
    carnyTop = m.cv;
  }
  c.drawImage(carnyTop, Math.round(x - 24), Math.round(y - 22));
};

/** A kind look for the contact sheet: every bake, once. */
export const _bakeAll = (looks: Look[], colors: string[]) => { looks.forEach((L, i) => { carCanvas(colors[i % colors.length], i + 1, L); hulkCanvas(colors[i % colors.length], i + 1); for (const m of ['fly0', 'fly1', 'flat', 'over'] as FigMode[]) figCanvas(L, m); }); };
export { mkCanvas };
