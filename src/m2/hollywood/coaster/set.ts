// The bathroom set (the user: the station and the stops are a FACSIMILE OF A BATHROOM, still outdoors), and what it's
// built on, in fake 3D (one eye: paint.ts):
//   the deck      its top going back to the set's wall (bathroom floor tiles, checkered per place), its front a riveted
//                 I-beam (the lit lip along its top: he stands on it), lattice struts down to the park, knee braces
//   the set wall  a freestanding tiled flat along the back (WALL_D), braced from behind at its ends with 2x4s and
//                 sandbags (it's a set: the sky over it; its plywood edge on top), its tiles stepped and grouted, a
//                 mosaic band, subway-tile wainscot, a cove base; on it the fittings, set back and dimmed: toilet stalls
//                 with gold stars, urinals, mirrors over sinks, hand dryers, towel dispensers, EMPLOYEES MUST WASH HANDS
//                 (stop 3's grimy: stains, cracked and missing tiles, one urinal full, the mirror cracked). Painted once
//                 per hour in strips and stamped
//   the doors     at the play plane, built out from the wall: the STAFF ONLY toilet stall the staff burst out of, the
//                 janitor's closet (louvered), the SERVICE STAIRS restroom door with its lamp
//   the catwalks  grating, lit along their lips, the rail behind, hung on rods up into the structure
//   the pylons    the coaster's riveted columns at the decks' ends (the track through their arches, barred)

import { GY } from '../geometry';
import { type Ctx, type CView, INK, vis, pal, lattice, member, rivets, hazard, goldStar, PORCELAIN, CHROME } from './paint';
import {
  box, checker, mix, hash, poly, at, atDepth, still, stillAt, timeOfDay, signW, PLY, SAND, STEEL, LIP, ramp6, hour, dimmed,
  board, plain, deco, words, sideBack, topBack, underBack, glassOf, pixelBlob,
} from '../blvd/kit';
import type { Place } from './layout';

/** Where the set's wall stands (back from the play plane), and how tall it is. */
export const WALL_D = 0.94, WALL_H = 210;

// ---------------------------------------------------------------------------------------------------------------
// Each place's look

interface Look { tile: string; grout: string; band: string; band2: string; cap: string; wain: string; floor: [string, string]; door: string; dirt?: boolean }
const LOOKS: Record<Place, Look> = {
  station: { tile: '#C2D2C6', grout: '#8E9C92', band: '#7F1D1D', band2: '#C8962E', cap: '#3A2E2A', wain: '#A8B8AC', floor: ['#E8E4DA', '#2A2830'], door: '#8E9A86' },
  0: { tile: '#E6C2CC', grout: '#B08E98', band: '#9D174D', band2: '#F2D27A', cap: '#4C0519', wain: '#D2A8B4', floor: ['#F4D8DE', '#3A1420'], door: '#C49AA6' },
  1: { tile: '#B4C084', grout: '#7E8A58', band: '#713F12', band2: '#E8D8A0', cap: '#3F3F1F', wain: '#98A46C', floor: ['#ECE2C0', '#4A3A18'], door: '#8E9A5C' },
  2: { tile: '#7A8070', grout: '#4E5246', band: '#26262A', band2: '#5C6A3A', cap: '#1C1917', wain: '#6A6E60', floor: ['#8A8A7E', '#2A2A26'], door: '#6A6E5E', dirt: true },
};
export const lookOf = (pl: Place) => LOOKS[pl];

// ---------------------------------------------------------------------------------------------------------------
// The fittings (painted into the wall's strips; local: x from the fitting's left, y up from the floor (negative))

type Fitting = 'stalls' | 'urinals' | 'sink' | 'dryer' | 'towels' | 'sign';
const FIT_W: Record<Fitting, number> = { stalls: 170, urinals: 140, sink: 64, dryer: 34, towels: 38, sign: 100 };
const ORDER: Fitting[] = ['stalls', 'sign', 'sink', 'sink', 'dryer', 'urinals', 'towels', 'sink', 'dryer', 'stalls', 'urinals', 'sign'];
const FITS = new Map<Place, [Fitting, number][]>();
const fitsFor = (pl: Place, a: number, b: number, keep: [number, number][], low: [number, number][]) => {
  let out = FITS.get(pl);
  if (out) return out;
  out = [];
  let x = a + 40, k = 0;
  for (let guard = 0; x < b - 40 && guard < 200; guard++) {
    const f = ORDER[k % ORDER.length], w = FIT_W[f];
    const hit = keep.find(([p, q]) => x < q && x + w > p) ?? (f === 'sign' ? low.find(([p, q]) => x < q + 14 && x + w > p - 14) : undefined);
    if (hit) { x = hit[1] + 14; continue; }
    if (x + w > b - 40) break;
    out.push([f, x]); x += w + 26; k++;
  }
  FITS.set(pl, out);
  return out;
};

const D = (c: string) => dimmed(c);
const RD = (c: string) => ramp6(dimmed(c));
const paintFitting = (g: Ctx, f: Fitting, x: number, L: Look, pl: Place, seed: number) => {
  const P = PORCELAIN.map(D), C = CHROME.map(D);
  if (f === 'stalls') {
    // (two stalls, their doors shut, the gap under them (dark), a gold star on each door; the partitions' pilasters)
    const Dr = RD(L.door), G = ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8'].map(D);
    for (let i = 0; i < 2; i++) {
      const sx = x + i * 82;
      box(g, sx + 8, -150, 74, 140, D('#16141A'));
      box(g, sx + 10, -148, 66, 128, INK); box(g, sx + 11, -147, 64, 126, Dr[3]); box(g, sx + 11, -147, 64, 2, Dr[4]); box(g, sx + 11, -147, 2, 126, Dr[4]); box(g, sx + 72, -147, 3, 126, Dr[2]);
      checker(g, sx + 68, -147, 4, 126, Dr[2], 0, 2);
      box(g, sx + 62, -90, 7, 5, INK); box(g, sx + 63, -89, 5, 3, (seed + i) % 3 ? D('#B91C1C') : D('#15803D'));
      // (the star)
      g.fillStyle = INK; g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 3.4 : 8, an = -Math.PI / 2 + (j * Math.PI) / 5; g.lineTo(sx + 43 + Math.cos(an) * r, -118 + Math.sin(an) * r + 1); } g.closePath(); g.fill();
      g.fillStyle = G[3]; g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 3 : 7, an = -Math.PI / 2 + (j * Math.PI) / 5; g.lineTo(sx + 43 + Math.cos(an) * r, -118 + Math.sin(an) * r); } g.closePath(); g.fill();
      box(g, sx + 41, -122, 2, 2, G[5]);
      // (feet under one: somebody's in there)
      if ((seed + i) % 3 === 0) { box(g, sx + 30, -12, 9, 4, D('#2A2420')); box(g, sx + 44, -12, 9, 4, D('#2A2420')); box(g, sx + 32, -10, 20, 2, D('#5A6A8A')); }
    }
    for (const px of [x, x + 82, x + 164]) { box(g, px, -154, 10, 144, INK); box(g, px + 1, -153, 8, 142, Dr[2]); box(g, px + 1, -153, 2, 142, Dr[4]); box(g, px + 1, -14, 8, 4, C[3]); }
    box(g, x - 2, -158, 178, 5, INK); box(g, x - 1, -157, 176, 3, C[3]); box(g, x - 1, -157, 176, 1, C[5]);
  } else if (f === 'urinals') {
    for (let i = 0; i < 3; i++) {
      const ux = x + 10 + i * 44;
      // (the flush valve, its pipe)
      box(g, ux + 10, -118, 5, 26, INK); box(g, ux + 11, -117, 3, 24, C[3]); box(g, ux + 11, -117, 1, 24, C[5]);
      box(g, ux + 6, -112, 13, 6, INK); box(g, ux + 7, -111, 11, 4, C[4]); box(g, ux + 17, -110, 6, 2, C[2]);
      // (the bowl: porcelain, stepped, lit up its left; the dark inside; the drain)
      g.fillStyle = INK; g.beginPath(); g.roundRect(ux - 1, -95, 28, 52, [6, 6, 12, 12]); g.fill();
      g.fillStyle = P[3]; g.beginPath(); g.roundRect(ux, -94, 26, 50, [5, 5, 11, 11]); g.fill();
      box(g, ux + 2, -92, 4, 40, P[4]); box(g, ux + 2, -92, 2, 20, P[5]); box(g, ux + 21, -90, 3, 38, P[2]);
      g.fillStyle = P[1]; g.beginPath(); g.roundRect(ux + 6, -80, 15, 28, [3, 3, 7, 7]); g.fill();
      g.fillStyle = P[0]; g.beginPath(); g.roundRect(ux + 8, -66, 11, 12, [2, 2, 5, 5]); g.fill();
      box(g, ux + 11, -59, 5, 2, C[2]);
      // (the urinal cake: blue; stop 3's: one full of something)
      if (pl === 2 && i === 1) { box(g, ux + 7, -76, 13, 20, D('#5C3A16')); box(g, ux + 8, -76, 6, 2, D('#7A4E1E')); }
      else box(g, ux + 10, -58, 7, 3, D(i % 2 ? '#38BDF8' : '#E879F9'));
      // (the privacy divider between)
      if (i < 2) { box(g, ux + 32, -118, 5, 78, INK); box(g, ux + 33, -117, 3, 76, RD(L.door)[3]); box(g, ux + 33, -117, 1, 76, RD(L.door)[4]); }
    }
  } else if (f === 'sink') {
    // (a mirror over a sink: the glass with the sky in it (banded), a frame; a faucet; the basin; its pipes)
    const Gl = glassOf().map(D);
    box(g, x + 3, -170, 58, 72, INK); box(g, x + 4, -169, 56, 70, C[3]); box(g, x + 4, -169, 56, 1, C[5]); box(g, x + 4, -169, 1, 70, C[4]);
    for (let k = 0; k < 5; k++) box(g, x + 7, -166 + k * 13, 50, 13, Gl[Math.min(5, 1 + k)]);
    checker(g, x + 7, -141, 50, 2, Gl[3], 0, 2);
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 14, -106); g.lineTo(x + 34, -160); g.moveTo(x + 27, -104); g.lineTo(x + 45, -150); g.stroke();
    if (L.dirt) {
      // (cracked; graffiti; a sticker)
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 40, -168); g.lineTo(x + 30, -140); g.lineTo(x + 36, -128); g.lineTo(x + 22, -104); g.moveTo(x + 30, -140); g.lineTo(x + 52, -132); g.stroke();
      box(g, x + 10, -130, 18, 3, D('#3F3F46')); box(g, x + 46, -120, 8, 8, D('#DC2626'));
    }
    box(g, x + 1, -74, 62, 16, INK); box(g, x + 2, -73, 60, 14, P[3]); box(g, x + 2, -73, 60, 2, P[5]); box(g, x + 2, -73, 3, 14, P[4]); box(g, x + 56, -73, 6, 14, P[2]);
    box(g, x + 8, -72, 48, 4, P[1]);
    box(g, x + 29, -86, 6, 14, INK); box(g, x + 30, -85, 4, 12, C[3]); box(g, x + 30, -86, 14, 4, INK); box(g, x + 31, -85, 12, 2, C[4]);
    box(g, x + 22, -82, 4, 4, C[4]); box(g, x + 38, -82, 4, 4, C[4]);
    box(g, x + 28, -58, 8, 24, INK); box(g, x + 29, -58, 6, 24, C[2]); box(g, x + 29, -58, 2, 24, C[4]);
    box(g, x + 24, -38, 16, 4, C[2]);
  } else if (f === 'dryer') {
    box(g, x - 1, -121, 36, 30, INK); box(g, x, -120, 34, 28, C[3]); box(g, x, -120, 34, 3, C[5]); box(g, x, -120, 3, 28, C[4]); box(g, x + 30, -120, 4, 28, C[1]);
    box(g, x + 12, -93, 10, 7, INK); box(g, x + 13, -92, 8, 5, C[1]);
    box(g, x + 6, -112, 22, 9, D('#18181B')); words(g, 'PUSH', x + 17, -105, plain(1, 1, D('#F8FAFC')));
    box(g, x + 15, -98, 4, 3, D('#B91C1C'));
  } else if (f === 'towels') {
    box(g, x - 1, -151, 40, 46, INK); box(g, x, -150, 38, 44, C[3]); box(g, x, -150, 38, 2, C[5]); box(g, x, -150, 2, 44, C[4]); box(g, x + 34, -150, 4, 44, C[2]);
    box(g, x + 7, -140, 24, 3, C[1]); box(g, x + 8, -128, 22, 10, D('#18181B'));
    box(g, x + 10, -107, 18, 12, P[4]); box(g, x + 10, -107, 18, 2, P[5]); box(g, x + 26, -107, 2, 12, P[2]);
    if (L.dirt) for (let k = 0; k < 3; k++) box(g, x - 4 + k * 14, -6, 8, 4, P[3]);
  } else {
    // EMPLOYEES MUST WASH HANDS (screwed to the tiles)
    board(g, x + 50, -110, ['EMPLOYEES MUST', 'WASH HANDS'], plain(1, 1, D('#1E3A8A')), D('#F8FAFC'), STEEL.map(D), 6);
    box(g, x + 14, -124, 72, 2, D('#B91C1C'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wall, a strip at a time

const STRIP = 480;
/** The strip `k` of a wall from a to b (local: x from a + k * STRIP, y up from the deck). */
const paintStrip = (g: Ctx, pl: Place, a: number, b: number, k: number, fits: [Fitting, number][]) => {
  const L = LOOKS[pl], sx = a + k * STRIP, w = Math.min(STRIP, b - sx), top = -WALL_H;
  const T = RD(L.tile), Gr = RD(L.grout), Bd = RD(L.band), B2 = RD(L.band2), Wn = RD(L.wain), Cp = RD(L.cap);
  // (the grout behind it all)
  box(g, 0, top, w, WALL_H, Gr[2]);
  // The tiles: 16 square, each stepped (lit along its top and left, shaded along its bottom and right), grouted
  for (let ty = top + 10; ty < -58; ty += 16) {
    for (let tx = -((sx - a) % 16); tx < w; tx += 16) {
      const wx = sx + tx, h = hash(wx * 0.071 + ty * 0.13 + (pl === 'station' ? 0 : (pl as number) + 1));
      if (L.dirt && h > 0.965) { box(g, tx + 1, ty + 1, 14, 14, D(PLY[1])); box(g, tx + 1, ty + 1, 14, 3, D(PLY[0])); continue; }
      const base = h > 0.9 ? T[2] : T[3];
      box(g, tx + 1, ty + 1, 14, 14, base); box(g, tx + 1, ty + 1, 14, 1, T[4]); box(g, tx + 1, ty + 1, 1, 14, T[4]);
      box(g, tx + 1, ty + 14, 14, 1, T[2]); box(g, tx + 14, ty + 1, 1, 14, T[2]);
      if (h < 0.03) box(g, tx + 3, ty + 3, 3, 2, T[5]);
      if (L.dirt && h > 0.93) { g.strokeStyle = Gr[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(tx + 2, ty + 3); g.lineTo(tx + 8, ty + 9); g.lineTo(tx + 13, ty + 7); g.stroke(); }
    }
  }
  // (the mosaic band: little squares in two colors; its trim)
  box(g, 0, -58, w, 12, Bd[2]);
  for (let tx = -((sx - a) % 6); tx < w; tx += 6) for (let r = 0; r < 2; r++) box(g, tx + 1, -57 + r * 6, 4, 4, (Math.floor((sx + tx) / 6) + r) % 3 === 0 ? B2[3] : Bd[3]);
  box(g, 0, -59, w, 1, Bd[4]); box(g, 0, -46, w, 1, Bd[1]);
  // (the wainscot: subway tiles, staggered; the cove base)
  box(g, 0, -45, w, 45, Gr[1]);
  for (let r = 0; r < 5; r++) {
    const ty = -45 + r * 8;
    for (let tx = -((sx - a + (r % 2) * 12) % 24); tx < w; tx += 24) { box(g, tx + 1, ty + 1, 22, 6, Wn[3]); box(g, tx + 1, ty + 1, 22, 1, Wn[4]); box(g, tx + 1, ty + 6, 22, 1, Wn[2]); }
  }
  box(g, 0, -6, w, 6, Cp[2]); box(g, 0, -6, w, 1, Cp[4]);
  // (the cap along the top: dark, not a lip: it's not for standing on)
  box(g, 0, top, w, 8, Cp[2]); box(g, 0, top + 7, w, 1, Cp[0]);
  // (grime: stop 3's stains running down; everybody's a little at the foot)
  checker(g, 0, -14, w, 4, Gr[1], 1, 2);
  if (L.dirt) for (let j = 0; j < 7; j++) { const gx = hash(k * 9 + j * 3.7) * w, h2 = 30 + hash(k + j) * 90; g.fillStyle = 'rgba(60, 46, 24, 0.45)'; g.fillRect(Math.round(gx), top + 8, 3 + (j % 3), Math.round(h2)); pixelBlob(g, gx + 1, top + 8 + h2, 5, 3, 'rgba(60, 46, 24, 0.35)'); }
  // (the fittings on this strip)
  for (const [f, fx] of fits) { const lx = fx - sx; if (lx > w + 10 || lx + FIT_W[f] < -10) continue; paintFitting(g, f, lx, L, pl, Math.round(fx)); }
};

/** The 2x4 braces out the back of the flat at its ends, the sandbags on their feet (live: at just behind the wall). */
const braces = (c: Ctx, v: CView, a: number, b: number, y: number) => {
  const P = pal().ply, S = pal().sand, top = y - WALL_H;
  atDepth(c, v.eye, WALL_D - 0.012, () => {
    for (const [ex, s] of [[a, -1], [b, 1]] as const) {
      const two4 = (x0: number, y0: number, x1: number, y1: number, w: number) => { member(c, x0, y0, x1, y1, w, P); };
      two4(ex - s * 10, top + 24, ex + s * 70, y - 4, 6);
      two4(ex - s * 10, top + 110, ex + s * 40, y - 4, 4);
      two4(ex - s * 4, y - 70, ex + s * 70, y - 70, 4);
      for (const [dx, dy] of [[56, 0], [72, 0], [64, -7]] as const) {
        const bx = ex + s * dx;
        c.fillStyle = INK; c.beginPath(); c.ellipse(bx, y - 4 + dy, 10, 5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = S[2]; c.beginPath(); c.ellipse(bx, y - 4 + dy, 9, 4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = S[4]; c.beginPath(); c.ellipse(bx - 2, y - 5 + dy, 4, 2, 0, 0, Math.PI * 2); c.fill();
      }
    }
  });
};

/**
 * The set: from a to b (world) at the back of a deck at y; the fittings round what's kept clear (world x ranges), the
 * signs clear of the low catwalks. Its strips stamped for the hour.
 */
export const drawSet = (c: Ctx, v: CView, pl: Place, a: number, b: number, y: number, keep: [number, number][], low: [number, number][]) => {
  if (!vis(v, a - 120, b + 120, y - WALL_H - 20, y, WALL_D)) return;
  braces(c, v, a, b, y);
  const fits = fitsFor(pl, a, b, keep, low);
  atDepth(c, v.eye, WALL_D, () => {
    for (let k = 0; a + k * STRIP < b; k++) {
      const sx = a + k * STRIP, w = Math.min(STRIP, b - sx);
      if (!vis(v, sx, sx + w, y - WALL_H, y, WALL_D)) continue;
      still(c, `hwc-wall-${pl}-${k}`, sx, y, -2, -WALL_H - 2, w + 4, WALL_H + 4, g => { g.save(); g.beginPath(); g.rect(0, -WALL_H, w, WALL_H); g.clip(); paintStrip(g, pl, a, b, k, fits); g.restore(); box(g, -1, -WALL_H, 1, WALL_H, INK); box(g, w, -WALL_H, 1, WALL_H, INK); });
    }
  });
  // (the flat's plywood edge on top, going back, and down its ends: it's a set)
  const P = pal().ply;
  topBack(c, v.eye, a, b, y - WALL_H, WALL_D, WALL_D - 0.012, P, 2);
  sideBack(c, v.eye, a, -1, y - WALL_H, y, WALL_D, WALL_D - 0.012, P, 1, false);
  sideBack(c, v.eye, b, 1, y - WALL_H, y, WALL_D, WALL_D - 0.012, P, 1, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The deck: its floor going back, its front, its struts

/** The floor going back from the play plane to the wall: checkered bathroom tiles in perspective (if he's over it). */
export const deckTop = (c: Ctx, v: CView, pl: Place, a: number, b: number, y: number, d1 = WALL_D) => {
  const eye = v.eye;
  if (eye.y >= y - 1) return;
  const L = LOOKS[pl], A = ramp6(hour(L.floor[0])), B = ramp6(hour(L.floor[1])), n = 4, step = 24;
  const l = Math.max(a, v.vx - 40), r = Math.min(b, v.vx + v.vw + 40);
  if (r <= l) return;
  for (let i = 0; i < n; i++) {
    const d0 = 1 - ((1 - d1) * i) / n, dd = 1 - ((1 - d1) * (i + 1)) / n;
    for (let x = Math.floor((l - a) / step) * step + a; x < r; x += step) {
      const xb = Math.min(b, x + step), on = (Math.floor((x - a) / step) + i) % 2 === 0;
      const R = on ? A : B;
      poly(c, [at(eye, x, y, d0), at(eye, xb, y, d0), at(eye, xb, y, dd), at(eye, x, y, dd)], R[i === 0 ? 3 : i === 1 ? 3 : 2]);
    }
  }
  // (grout lines across, the shine on the near row; stop 3's puddles)
  for (let i = 1; i < n; i++) { const d = 1 - ((1 - d1) * i) / n, [p, py] = at(eye, l, y, d), [q] = at(eye, r, y, d); box(c, p, py, q - p, 1, hour(L.grout)); }
  if (L.dirt) for (let x = Math.floor(l / 300) * 300; x < r; x += 300) { const h = hash(x * 0.01); if (h < 0.4) continue; const [px, py] = at(eye, x + h * 100, y, 0.975); c.fillStyle = 'rgba(60, 70, 40, 0.5)'; c.beginPath(); c.ellipse(px, py, 22, 2.5, 0, 0, Math.PI * 2); c.fill(); }
};
/** The deck's front at the play plane: a riveted I-beam (the lit lip along its top), its stiffeners; lattice struts
 *  down to the park, knee braces. */
export const deckFront = (c: Ctx, v: CView, a: number, b: number, y: number, struts = true) => {
  if (!vis(v, a, b, y - 10, GY)) return;
  const S = pal().steel, Lp = pal().lip, l = Math.max(a, v.vx - 60), r = Math.min(b, v.vx + v.vw + 60);
  if (struts && v.vy + v.vh > y + 40) {
    for (let x = a + 60; x < b - 30; x += 240) {
      if (x < l - 40 || x > r + 40) continue;
      lattice(c, x, y + 40, GY, 22, S, 56);
      member(c, x + 12, y + 160, x + 110, y + 41, 5, S);
    }
  }
  box(c, l, y, r - l, 40, INK);
  box(c, l, y + 4, r - l, 30, S[2]); checker(c, l, y + 30, r - l, 4, S[1], 0, 2);
  box(c, l, y + 33, r - l, 6, S[3]); box(c, l, y + 33, r - l, 1, S[4]);
  for (let x = Math.floor((l - a) / 40) * 40 + a; x < r; x += 40) { box(c, x, y + 6, 4, 27, S[3]); box(c, x, y + 6, 1, 27, S[5]); box(c, x + 3, y + 6, 1, 27, S[1]); }
  rivets(c, Math.ceil((l - a) / 12) * 12 + a + 4, r, y + 36, 12, S);
  // (its top: the lit lip)
  box(c, l, y, r - l, 4, Lp[1]); box(c, l, y, r - l, 2, Lp[2]); box(c, l, y, r - l, 1, Lp[3]);
  if (a >= l) box(c, a, y, 2, 40, S[4]);
  if (b <= r) box(c, b - 3, y, 3, 40, S[1]);
};

/** The train's rail along a deck's top (over the deck's front: the deck carries it), its chairs bolted down. */
export const deckRail = (c: Ctx, v: CView, a: number, b: number, y: number) => {
  const l = Math.max(a, v.vx - 60), r = Math.min(b, v.vx + v.vw + 60);
  if (r <= l || !vis(v, l, r, y - 8, y + 4)) return;
  const G = pal().gold, S = pal().steel;
  for (let x = Math.floor((l - a) / 30) * 30 + a; x < r; x += 30) { box(c, x - 1, y - 3, 8, 4, INK); box(c, x, y - 2, 6, 2, S[3]); }
  box(c, l, y - 5, r - l, 5, INK); box(c, l, y - 4, r - l, 3, G[3]); box(c, l, y - 4, r - l, 1, G[5]); box(c, l, y - 2, r - l, 1, G[2]);
};

// ---------------------------------------------------------------------------------------------------------------
// The catwalks

/** A catwalk (stand on it): its grating going back a little, the rail behind, its rods up into the structure; its front
 *  channel lit along the lip. */
export const catwalk = (c: Ctx, v: CView, x: number, y: number, w: number) => {
  if (!vis(v, x - 20, x + w + 20, y - 700, y + 20)) return;
  const S = pal().steel, eye = v.eye, d1 = 0.972;
  // (the rods up into the structure: from the rail's posts)
  for (const rx of [x + 10, x + w - 12]) { const [px, py] = at(eye, rx, y - 30, d1); box(c, px - 1, py - 700, 3, 700, INK); box(c, px, py - 700, 1, 700, S[4]); for (let k = py - 680; k < py; k += 90) box(c, px - 2, k, 5, 4, S[2]); }
  // (the rail behind: posts, the top rail, a mid rail)
  for (let rx = x + 6; rx <= x + w - 6; rx += Math.max(30, (w - 12) / Math.max(1, Math.round((w - 12) / 60)))) { const [px, py] = at(eye, rx, y, d1), [, ty] = at(eye, rx, y - 30, d1); box(c, px - 1, ty, 3, py - ty, INK); box(c, px, ty, 1, py - ty, S[4]); }
  for (const h of [30, 15]) { const [ax, ay] = at(eye, x + 4, y - h, d1), [bx] = at(eye, x + w - 4, y - h, d1); box(c, ax, ay - 1, bx - ax, 3, INK); box(c, ax, ay, bx - ax, 1, S[h === 30 ? 4 : 3]); }
  // (the grating, going back: dark with its bars)
  if (eye.y < y) { const [ax, ay] = at(eye, x, y, d1), [bx] = at(eye, x + w, y, d1); poly(c, [[x, y], [x + w, y], [bx, ay], [ax, ay]], S[1]); for (let gx = x + 4; gx < x + w; gx += 6) { const [px, py] = at(eye, gx, y, d1); c.strokeStyle = S[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, y); c.lineTo(px, py); c.stroke(); } }
  still(c, `hwc-catwalk-${w}`, x, y, -3, -3, w + 6, 16, g => {
    box(g, -2, -1, w + 4, 12, INK); box(g, -1, 0, w + 2, 10, S[2]);
    for (let k = 2; k < w - 2; k += 5) box(g, k, 4, 3, 4, S[0]);
    box(g, -1, 8, w + 2, 2, S[1]);
    const L2 = pal().lip; box(g, -1, -1, w + 2, 3, L2[2]); box(g, -1, -1, w + 2, 1, L2[3]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The doors (at the play plane, built out from the wall)

export type DoorKind = 'restroom' | 'stall' | 'closet';
/** A plate with words on it (a sign screwed on): its middle at (x, y). */
const plate = (c: Ctx, key: string, x: number, y: number, text: string, col: string, bg: string) => {
  const L = plain(1, 1, col), w = signW(text, L) + 14;
  still(c, `hwc-plate-${key}`, x, y, -w / 2 - 4, -10, w + 8, 20, g => board(g, 0, 0, [text], L, bg, STEEL.map(cc => hour(cc)), 5));
};
/**
 * A door at x on the floor at feetY: `k` how far open (0 shut); its sign. `kind`: a toilet stall's (STAFF ONLY: the
 * partitions out from the wall either side, the gap under it, a gold star on it, its latch), a janitor's closet
 * (louvered), a restroom door (the little man and woman on it) in its frame. `light`: its lamp (the stairs' lock).
 * `back`: how far back its sides go (to the wall, or less on a catwalk).
 */
export const door = (c: Ctx, v: CView, x: number, feetY: number, k: number, sign: string, signCol: string, signBg: string, light?: 'red' | 'green', kind: DoorKind = 'restroom', pl: Place = 'station', back = WALL_D) => {
  if (!vis(v, x - 70, x + 70, feetY - 170, feetY)) return;
  const eye = v.eye, S = pal().steel, L = LOOKS[pl], Dr = ramp6(hour(L.door)), w = 52 * (1 - k * 0.85);
  const hw = kind === 'stall' ? 36 : 34, top = feetY - (kind === 'stall' ? 132 : 120);
  // (its sides going back to the wall: whichever he can see)
  const SideR = kind === 'stall' ? ramp6(hour(mix(L.door, '#3A3A40', 0.25))) : ramp6(hour(kind === 'closet' ? '#7A7E84' : '#5A5658'));
  sideBack(c, eye, x - hw, -1, top, kind === 'stall' ? feetY - 12 : feetY, 1, back, SideR, 2);
  sideBack(c, eye, x + hw, 1, top, kind === 'stall' ? feetY - 12 : feetY, 1, back, SideR, 2);
  topBack(c, eye, x - hw, x + hw, top, 1, back, SideR, 2);
  // (the dark inside; through it, open, a glimpse: a toilet at the back of the stall, a mop and bucket in the closet)
  box(c, x - 28, top + 8, 56, feetY - top - 8, '#0E0C12');
  if (k > 0.05) {
    const P = PORCELAIN.map(cc => hour(mix(cc, '#0E0C12', 0.55)));
    if (kind === 'stall') {
      // (the tank and its lid, a handle; the seat; the bowl tapering to its foot)
      box(c, x - 4, feetY - 44, 18, 26, P[2]); box(c, x - 4, feetY - 44, 4, 26, P[3]); box(c, x + 11, feetY - 44, 3, 26, P[1]);
      box(c, x - 6, feetY - 48, 22, 4, P[3]); box(c, x - 6, feetY - 48, 22, 1, P[4]); box(c, x, feetY - 40, 4, 2, P[4]);
      box(c, x - 8, feetY - 22, 24, 10, P[3]); box(c, x - 8, feetY - 22, 24, 2, P[4]); box(c, x - 8, feetY - 15, 24, 3, P[2]);
      box(c, x - 2, feetY - 12, 12, 12, P[1]); box(c, x - 2, feetY - 12, 3, 12, P[2]);
    }
    else if (kind === 'closet') { box(c, x + 4, feetY - 22, 18, 22, hour(mix('#EAB308', '#0E0C12', 0.5))); box(c, x + 12, feetY - 76, 3, 56, hour(mix('#A16207', '#0E0C12', 0.5))); }
    else for (let s = 0; s < 4; s++) box(c, x - 26 + s * 6, feetY - 20 - s * 18, 40, 4, hour(mix('#57534E', '#0E0C12', 0.5)));
  }
  // (the frame: pilasters either side, the header across the top)
  const F = kind === 'stall' ? ramp6(hour(mix(L.door, '#2A2A30', 0.3))) : ramp6(hour(kind === 'closet' ? '#4B5563' : '#3F3F46'));
  for (const px of [x - hw, x + hw - 8]) { box(c, px - 1, top, 10, (kind === 'stall' ? feetY - 12 : feetY) - top, INK); box(c, px, top + 1, 8, (kind === 'stall' ? feetY - 13 : feetY - 1) - top, F[3]); box(c, px, top + 1, 2, (kind === 'stall' ? feetY - 13 : feetY - 1) - top, F[4]); box(c, px + 6, top + 1, 2, (kind === 'stall' ? feetY - 13 : feetY - 1) - top, F[2]); }
  if (kind === 'stall') for (const px of [x - hw, x + hw - 8]) { box(c, px, feetY - 12, 8, 12, CHROME.map(cc => hour(cc))[2]); box(c, px, feetY - 12, 8, 2, CHROME.map(cc => hour(cc))[4]); }
  box(c, x - hw - 2, top - 2, hw * 2 + 4, 10, INK); box(c, x - hw - 1, top - 1, hw * 2 + 2, 8, F[3]); box(c, x - hw - 1, top - 1, hw * 2 + 2, 2, F[4]); box(c, x - hw - 1, top + 5, hw * 2 + 2, 2, F[2]);
  // The door itself, hinged at its left
  const dTop = top + 8, dBot = kind === 'stall' ? feetY - 14 : feetY - 1;
  if (w > 2) {
    box(c, x - 27, dTop, w + 2, dBot - dTop, INK);
    const Rd = kind === 'stall' ? Dr : kind === 'closet' ? ramp6(hour('#6B7280')) : ramp6(hour('#6A5A4A'));
    box(c, x - 26, dTop + 1, w, dBot - dTop - 2, Rd[3]); box(c, x - 26, dTop + 1, Math.min(3, w), dBot - dTop - 2, Rd[4]); box(c, x - 26, dTop + 1, w, 2, Rd[4]);
    if (w > 8) { box(c, x - 26 + w - 4, dTop + 1, 4, dBot - dTop - 2, Rd[2]); checker(c, x - 26 + w - 7, dTop + 1, 3, dBot - dTop - 2, Rd[2], 0, 2); }
    if (w > 30) {
      if (kind === 'stall') { goldStar(c, x - 26 + w / 2, dTop + 22, 8); box(c, x - 26 + w - 12, dTop + 52, 7, 5, INK); box(c, x - 26 + w - 11, dTop + 53, 5, 3, k > 0.1 ? '#4ADE80' : '#DC2626'); }
      else if (kind === 'closet') { for (let yy = dTop + 12; yy < dTop + 46; yy += 5) { box(c, x - 22, yy, w - 10, 3, Rd[1]); box(c, x - 22, yy, w - 10, 1, Rd[4]); } for (let yy = dBot - 30; yy < dBot - 8; yy += 5) { box(c, x - 22, yy, w - 10, 3, Rd[1]); box(c, x - 22, yy, w - 10, 1, Rd[4]); } }
      else {
        // (the little man and woman on a plate; a kick plate along the foot)
        const P = ramp6(hour('#E5E7EB')), Bl = hour('#1E3A8A');
        box(c, x - 23, dTop + 10, 28, 24, INK); box(c, x - 22, dTop + 11, 26, 22, P[3]); box(c, x - 22, dTop + 11, 26, 1, P[5]);
        for (const [fx, dress] of [[x - 15, false], [x - 4, true]] as const) {
          box(c, fx - 2, dTop + 13, 4, 4, Bl);
          if (dress) { c.fillStyle = Bl; c.beginPath(); c.moveTo(fx, dTop + 18); c.lineTo(fx + 4, dTop + 27); c.lineTo(fx - 4, dTop + 27); c.closePath(); c.fill(); box(c, fx - 2, dTop + 27, 1, 4, Bl); box(c, fx + 1, dTop + 27, 1, 4, Bl); }
          else { box(c, fx - 2, dTop + 18, 4, 8, Bl); box(c, fx - 2, dTop + 26, 1, 5, Bl); box(c, fx + 1, dTop + 26, 1, 5, Bl); }
        }
        const Cr = CHROME.map(cc => hour(cc));
        box(c, x - 26, dBot - 12, w, 11, Cr[2]); box(c, x - 26, dBot - 12, w, 1, Cr[4]);
      }
      // (the handle)
      const Cr = CHROME.map(cc => hour(cc));
      box(c, x - 26 + w - 8, dTop + 50, 4, 10, INK); box(c, x - 25 + w - 8, dTop + 51, 2, 8, Cr[4]);
    }
  }
  // (its sign, on the header: screwed on)
  plate(c, `${sign}-${signBg}`, x, top - 12, sign, signCol, signBg);
  if (light) {
    const on = light === 'red' ? '#EF4444' : '#4ADE80';
    box(c, x + hw + 2, feetY - 78, 10, 12, INK); box(c, x + hw + 3, feetY - 77, 8, 10, S[2]); box(c, x + hw + 4, feetY - 76, 6, 6, on); box(c, x + hw + 4, feetY - 76, 2, 2, '#FFFFFF');
  }
  void underBack; void deco; void stillAt; void SAND; void LIP; void timeOfDay; void words;
};

// ---------------------------------------------------------------------------------------------------------------
// The pylons

/**
 * A pylon at a deck's end: the coaster's riveted column (two chords, plate between, braced), up out of sight and down
 * to its pier in the park; its side going back; the train's arch through it at the deck, barred (the striped boom down,
 * its lamp blinking) unless the train's going through. It's a wall: it reads as one.
 */
export const pylon = (c: Ctx, v: CView, x: number, deckY: number, open: boolean, f: number, crimson = false) => {
  const top = deckY - 1500, w = 44;
  if (!vis(v, x - 30, x + w + 30, top, GY)) return;
  const S = pal().steel, Cm = pal().crimson, R = crimson ? Cm : S;
  const lo = Math.max(top, v.vy - 80), hi = Math.min(GY, v.vy + v.vh + 80);
  if (hi <= lo) return;
  // (its side going back)
  sideBack(c, v.eye, x, -1, lo, hi, 1, WALL_D, R, 2, false);
  sideBack(c, v.eye, x + w, 1, lo, hi, 1, WALL_D, R, 2, false);
  // (the plate between the chords: panels, their seams bevelled, rivets)
  box(c, x - 1, lo, w + 2, hi - lo, INK);
  box(c, x, lo, w, hi - lo, R[1]);
  const p0 = top + Math.max(0, Math.floor((lo - top) / 64)) * 64;
  for (let y = p0; y < hi; y += 64) { box(c, x + 8, y, w - 16, 1, R[0]); box(c, x + 8, y + 1, w - 16, 1, R[3]); rivets(c, x + 10, x + w - 12, y + 5, 8, R); }
  // (the bracing over the plate: an X in every bay)
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath();
  for (let y = p0; y < hi; y += 64) { c.moveTo(x + 8, y); c.lineTo(x + w - 8, y + 64); c.moveTo(x + w - 8, y); c.lineTo(x + 8, y + 64); }
  c.stroke();
  c.strokeStyle = R[2]; c.lineWidth = 3; c.beginPath();
  for (let y = p0; y < hi; y += 64) { c.moveTo(x + 8, y); c.lineTo(x + w - 8, y + 64); c.moveTo(x + w - 8, y); c.lineTo(x + 8, y + 64); }
  c.stroke();
  // (the chords: stepped across, lit on the left one)
  box(c, x, lo, 8, hi - lo, R[3]); box(c, x, lo, 3, hi - lo, R[5]); box(c, x + 7, lo, 1, hi - lo, R[1]);
  box(c, x + w - 8, lo, 8, hi - lo, R[2]); box(c, x + w - 8, lo, 2, hi - lo, R[3]); box(c, x + w - 1, lo, 1, hi - lo, R[0]);
  // The train's arch at the deck: the dark through it, a hazard header over it, the boom
  if (deckY - 112 < hi && deckY > lo) {
    box(c, x + 1, deckY - 104, w - 2, 104, '#0A080C');
    box(c, x + 1, deckY - 104, w - 2, 6, '#1E1A22');
    hazard(c, x, deckY - 116, w, 12, 6);
    box(c, x - 1, deckY - 117, w + 2, 1, INK); box(c, x - 1, deckY - 104, w + 2, 1, INK);
    if (!open) {
      // (the boom: striped bars across the arch, stepped)
      for (let k = 0; k < 5; k++) { const by = deckY - 96 + k * 20; box(c, x - 2, by - 1, w + 4, 12, INK); for (let s = 0; s < w; s += 11) box(c, x + s, by, Math.min(11, w - s), 10, (Math.floor(s / 11) + k) % 2 ? '#F8FAFC' : '#DC2626'); box(c, x, by, w, 2, 'rgba(255,255,255,0.45)'); box(c, x, by + 8, w, 2, 'rgba(0,0,0,0.25)'); }
      box(c, x + w / 2 - 4, deckY - 128, 8, 8, INK); box(c, x + w / 2 - 3, deckY - 127, 6, 6, (f >> 4) % 2 ? '#FF4A3A' : '#7A1A14');
    } else for (const sx of [x + 1, x + w - 5]) { box(c, sx, deckY - 100, 4, 96, '#DC2626'); for (let y = deckY - 100; y < deckY - 4; y += 16) box(c, sx, y, 4, 8, '#F8FAFC'); }
  }
  // (its pier in the park)
  if (hi >= GY - 14) { box(c, x - 12, GY - 16, w + 24, 16, INK); const K = pal().concrete; box(c, x - 11, GY - 15, w + 22, 15, K[3]); box(c, x - 11, GY - 15, w + 22, 2, K[5]); box(c, x + w + 6, GY - 15, 5, 15, K[2]); }
};

void deco; void mix;
