// THE UNITED KINGDOM's art (the SNES pass): the terraces (brick in Flemish bond or white stucco over a rusticated ground
// floor, sash windows six over six in their white box frames under gauged arches or stucco hoods, the black front doors
// and their fanlights and brass, the area railings, the long balconies, the parapets and cornices, the slate roofs and
// the chimney stacks and their clay pots; painted shopfronts with gilt fascias and windows of goods; braced from
// behind), the palace gate (the palace beyond in Portland stone, the rusticated piers and their lamps, the railings and
// their gilt spear tips, the gates and their crest), the sentry boxes, the red telephone boxes (the TELEPHONE fascia,
// the glazing in its little panes, the domed roof and its crown), the bus stop, THE DOUBLE-DECKER BUS (its two decks,
// the cream band, the open platform, the cab, the blind, the advert, the wheels), THE PUB (the brick over the green
// front, the gilt fascia, the etched windows glowing after dark, the hanging baskets, the painted sign on its bracket),
// the barrels, the tea cart, TOWER BRIDGE (the towers in cut stone, their gothic windows, the turrets and the roofs set
// back over them, the high walkway's lattice girder, the chains, the bascules), the fog in stepped banks, the Union
// Jack in its folds, the street lamps; and THE WORLD'S TALLEST PHONE BOX (the back of it in its glazing bars and panes
// and what's on it, its red cast iron, the crown over it, the wall phone, the handset and its cord, the floors, the
// moldings). Still art painted once for the hour; only what moves live. No layout here: index.ts and clocktower.ts say
// where.

import { GY } from '../geometry';
import {
  type Ctx, type View, type Look, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow, pixelBlob,
  stoneBlocks, planks, stucco, facade, still, board, words, plain, onScreen, lip, topBack, sideBack, underBack, box3Back, ledge3, glassOf, skyAt, signText, rampDown, LOOKS,
} from '../kit';

type Tn = (c: string) => string;
const lampsOn = () => timeOfDay().lamps > 0.3;
export const PILLAR = '#C8102E', BRICK = '#8E3B28', STOCK = '#B8925E', STUCCO = '#ECE6D8', SLATE = '#4A5262', IRON = '#202628', PORTLAND = '#D6CEBA', GILT = '#CA8A04', STEELBLUE = '#5B8FC8', PUBGREEN = '#17432C', BAKELITE = '#18181B', GRANITE = '#BDB5A2';
/** Gilt sign-writing (the pub's fascia, a shopfront's): gold serifs, shaded, a dark drop. */
const GILT_LOOK = (s = 1): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.3), serif: true, shadow: '#0A1A10', drop: 1, gap: 2 });

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** Brick in Flemish bond (local): stretchers and headers by turns in every course, each brick its own step (seeded;
 *  the headers burnt darker), lit along its top, the mortar shaded. */
export const bricks = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  box(g, x, y, w, h, R[1]);
  for (let yy = y, row = 0; yy < y + h; yy += 6, row++) {
    const rh = Math.min(5, y + h - yy);
    for (let xx = x - (row % 2 ? 9 : 0), k = 0; xx < x + w; k++) {
      const bw = k % 2 ? 5 : 11, a = Math.max(x, xx), b = Math.min(x + w, xx + bw);
      if (b > a) {
        const t = hash(seed + xx * 0.31 + row * 2.7), col = k % 2 ? mix(R[2], R[1], t * 0.6) : R[t > 0.86 ? 4 : t > 0.3 ? 3 : 2];
        box(g, a, yy, b - a, rh, col);
        if (rh > 2) box(g, a, yy, b - a, 1, mix(col, R[5], 0.25));
      }
      xx += bw + 1;
    }
  }
};

/** A little crown (local; its band's middle at x, y): the band and its jewels, three points and their pearls, the arch
 *  and the cross on top. */
export const crown = (g: Ctx, x: number, y: number, Gd: string[], s = 1) => {
  box(g, x - 8 * s, y - 1 * s, 16 * s, 5 * s, INK);
  box(g, x - 7 * s, y, 14 * s, 3 * s, Gd[3]); box(g, x - 7 * s, y, 14 * s, 1 * s, Gd[5]);
  for (const dx of [-6, 0, 6]) {
    poly(g, [[x + (dx - 2.5) * s, y], [x + dx * s, y - 6 * s], [x + (dx + 2.5) * s, y]], INK);
    poly(g, [[x + (dx - 1.6) * s, y], [x + dx * s, y - 5 * s], [x + (dx + 1.6) * s, y]], dx < 0 ? Gd[4] : Gd[3]);
    box(g, x + (dx - 1) * s, y - 8 * s, 2 * s, 2 * s, Gd[5]);
  }
  box(g, x - 1 * s, y - 12 * s, 2 * s, 5 * s, Gd[3]); box(g, x - 2 * s, y - 11 * s, 4 * s, 1 * s, Gd[3]);
  box(g, x - 4 * s, y + 1 * s, 2 * s, 1 * s, '#DC2626'); box(g, x - 1 * s, y + 1 * s, 2 * s, 1 * s, '#1D4ED8'); box(g, x + 2 * s, y + 1 * s, 2 * s, 1 * s, '#16A34A');
};

/** A sash window (local, its glass x, y, w, h): the white box frame, two sashes of six panes (the glass by the hour; net
 *  curtains in some; warm after dark), the meeting rail; the stone sill under it; over it a gauged brick arch (`arch`), a
 *  stucco hood on its consoles (`hood`), or nothing. */
const sash = (g: Ctx, x: number, y: number, w: number, h: number, tn: Tn, over: 'arch' | 'hood' | 'none', seed: number, Wl?: string[]) => {
  const on = lampsOn() && hash(seed) > 0.3, G = glassOf(), Fr = ramp6(tn('#F1EDE4')), S = ramp6(tn(PORTLAND));
  box(g, x - 3, y - 3, w + 6, h + 6, INK);
  box(g, x - 2, y - 2, w + 4, h + 4, Fr[3]); box(g, x - 2, y - 2, w + 4, 1, Fr[5]); box(g, x + w + 1, y - 2, 1, h + 4, Fr[1]);
  const glass = (gy: number, gh: number) => {
    box(g, x, gy, w, gh, on ? '#B07024' : G[1]); box(g, x, gy, w, Math.round(gh * 0.45), on ? '#E8A646' : G[2]); checker(g, x, gy + Math.round(gh * 0.45), w, 2, on ? '#E8A646' : G[2], 0, 1);
    if (!on) { box(g, x + 1, gy + 1, 2, gh - 3, G[4]); box(g, x + 4, gy + 1, 1, Math.round(gh * 0.5), G[3]); }
  };
  const mh = Math.round(h / 2);
  glass(y, mh - 1); glass(y + mh + 2, h - mh - 2);
  // (net curtains in the lower sash of some: lace, dithered)
  if (hash(seed + 3) > 0.5) checker(g, x, y + mh + 2, w, h - mh - 2, on ? '#FFE2A8' : Fr[4], 0, 1);
  // (the glazing bars: two up, one across each sash; the meeting rail)
  for (const k of [1, 2]) box(g, x + Math.round((w * k) / 3), y, 1, h, Fr[3]);
  for (const yy of [Math.round(mh / 2), mh + 2 + Math.round((h - mh - 2) / 2)]) box(g, x, y + yy, w, 1, Fr[3]);
  box(g, x, y + mh - 1, w, 3, Fr[4]); box(g, x, y + mh + 1, w, 1, Fr[1]);
  // (the sill)
  box(g, x - 6, y + h + 3, w + 12, 4, INK); box(g, x - 5, y + h + 3, w + 10, 2, S[4]); box(g, x - 5, y + h + 5, w + 10, 1, S[2]);
  if (over === 'arch' && Wl) {
    // (a gauged arch: rubbed bricks on end, the key brick)
    box(g, x - 4, y - 11, w + 8, 8, INK);
    for (let k = 0; k < w + 6; k += 3) box(g, x - 3 + k, y - 10, 2, 6, Wl[(k / 3) % 2 ? 3 : 4]);
    box(g, x + w / 2 - 2, y - 12, 4, 9, S[4]); box(g, x + w / 2 - 2, y - 12, 4, 1, S[5]);
  } else if (over === 'hood') {
    // (a stucco hood: its cornice, the consoles either end)
    box(g, x - 8, y - 12, w + 16, 7, INK); box(g, x - 7, y - 11, w + 14, 5, S[3]); box(g, x - 7, y - 11, w + 14, 1, S[5]); box(g, x - 7, y - 7, w + 14, 1, S[1]);
    for (const cx of [x - 6, x + w + 2]) { box(g, cx, y - 6, 4, 10, INK); box(g, cx + 1, y - 6, 2, 9, S[3]); }
  }
};

/** A Georgian front door (local; its foot at `foot`): the panelled door (six panels in steps), the brass knocker,
 *  letterbox and knob; the fanlight over it (its bars fanned, lit after dark); the doorcase (pilasters, a cornice); the
 *  stone step. */
const frontDoor = (g: Ctx, x: number, foot: number, w: number, h: number, col: string, tn: Tn) => {
  const D = ramp6(tn(col)), S = ramp6(tn(STUCCO)), Br = ramp6(tn(GILT)), G = glassOf(), on = lampsOn();
  const top = foot - h, fr = Math.round(w / 2);
  box(g, x - 9, top - fr - 10, w + 18, h + fr + 10, INK);
  for (const px0 of [x - 8, x + w + 2]) { box(g, px0, top - fr - 4, 6, h + fr + 4, S[3]); box(g, px0, top - fr - 4, 2, h + fr + 4, S[4]); box(g, px0 + 5, top - fr - 4, 1, h + fr + 4, S[1]); }
  box(g, x - 10, top - fr - 10, w + 20, 6, S[3]); box(g, x - 10, top - fr - 10, w + 20, 1, S[5]); box(g, x - 10, top - fr - 5, w + 20, 1, S[1]);
  g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, top, fr + 1, Math.PI, 0); g.fill();
  g.fillStyle = on ? '#E8A646' : G[2]; g.beginPath(); g.arc(x + w / 2, top, fr - 1, Math.PI, 0); g.fill();
  g.strokeStyle = S[4]; g.lineWidth = 1; g.beginPath();
  for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; g.moveTo(x + w / 2, top); g.lineTo(x + w / 2 + Math.cos(a) * (fr - 1), top + Math.sin(a) * (fr - 1)); }
  g.stroke(); g.beginPath(); g.arc(x + w / 2, top, fr * 0.4, Math.PI, 0); g.stroke();
  box(g, x - 1, top - 1, w + 2, 2, INK);
  box(g, x, top + 1, w, h - 1, D[3]); box(g, x, top + 1, 2, h - 1, D[4]); box(g, x + w - 2, top + 1, 2, h - 1, D[1]);
  const pw = Math.round((w - 9) / 2), rh = Math.round((h - 8) / 3);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
    const px0 = x + 3 + k * (pw + 3), py0 = top + 4 + r * rh, ph = rh - 4;
    box(g, px0, py0, pw, ph, D[2]); box(g, px0, py0, pw, 1, D[1]); box(g, px0, py0, 1, ph, D[1]); box(g, px0 + 1, py0 + ph - 1, pw - 1, 1, D[4]); box(g, px0 + pw - 1, py0 + 1, 1, ph - 1, D[4]);
  }
  box(g, x + w / 2 - 2, top + 12, 4, 5, Br[4]); box(g, x + w / 2 - 3, top + 17, 6, 2, Br[3]);
  box(g, x + w / 2 - 6, top + h * 0.55, 12, 3, INK); box(g, x + w / 2 - 5, top + h * 0.55, 10, 2, Br[3]);
  box(g, x + w - 6, top + h * 0.5, 3, 3, Br[4]);
  box(g, x - 6, foot - 5, w + 12, 5, INK); box(g, x - 5, foot - 4, w + 10, 4, S[3]); box(g, x - 5, foot - 4, w + 10, 1, S[5]);
};

/** A chimney stack (local; its foot at y, its middle at x): brick, the stone cap, a row of clay pots (each its own
 *  height, stepped, rimmed). */
const chimney = (g: Ctx, x: number, y: number, n: number, tn: Tn, seed: number, hh = 26) => {
  const B = ramp6(tn(BRICK)), S = ramp6(tn(PORTLAND)), P = ramp6(tn('#B8683E'));
  const w = n * 8 + 6, x0 = Math.round(x - w / 2);
  box(g, x0 - 1, y - hh - 1, w + 2, hh + 1, INK); bricks(g, x0, y - hh, w, hh, B, seed); box(g, x0 + w - 4, y - hh, 4, hh, B[1]);
  box(g, x0 - 3, y - hh - 5, w + 6, 5, INK); box(g, x0 - 2, y - hh - 4, w + 4, 3, S[3]); box(g, x0 - 2, y - hh - 4, w + 4, 1, S[5]);
  for (let k = 0; k < n; k++) {
    const ph = 8 + Math.round(hash(seed + k * 3.3) * 6), px0 = x0 + 3 + k * 8;
    box(g, px0 - 1, y - hh - 5 - ph, 7, ph + 1, INK); box(g, px0, y - hh - 4 - ph, 5, ph, P[3]); box(g, px0, y - hh - 4 - ph, 2, ph, P[4]); box(g, px0 + 4, y - hh - 4 - ph, 1, ph, P[1]);
    box(g, px0 - 1, y - hh - 6 - ph, 7, 2, P[2]); box(g, px0 - 1, y - hh - 6 - ph, 7, 1, P[5]);
  }
};

/** The area railings along a terrace's foot (local): iron bars and their spear tips, the rails; a gap at the door. */
const areaRail = (g: Ctx, x0: number, x1: number, gapA: number, gapB: number, tn: Tn) => {
  const I = ramp6(tn(IRON));
  for (let x = x0; x < x1; x += 4) { if (x > gapA && x < gapB) continue; box(g, x, -26, 1, 26, I[2]); box(g, x - 1, -29, 3, 2, I[4]); box(g, x, -31, 1, 2, I[4]); }
  for (const [a, b] of [[x0, gapA], [gapB, x1]] as const) if (b > a) { box(g, a, -24, b - a, 2, INK); box(g, a, -24, b - a, 1, I[4]); box(g, a, -6, b - a, 1, I[3]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The terraces (FACADE_D, braced)

type Goods = 'chips' | 'biscuits' | 'tea' | 'chemist' | 'offlicence';
interface Shop { name: string; goods: Goods; paint: string }
export interface UkFront { rx: number; w: number; h: number; kind: 'brick' | 'stock' | 'stucco'; door?: string; shop?: Shop }

/** A shop window's goods (local, in its glass x, y, w, h). */
const goods = (g: Ctx, x: number, y: number, w: number, h: number, kind: Goods, tn: Tn) => {
  const R = (c: string) => ramp6(tn(c));
  for (let k = 0; k < Math.floor((w - 4) / 10); k++) {
    const gx = x + 4 + k * 10, gy = y + h - 4;
    if (kind === 'chips') {
      // (paper cones of chips, a battered fish)
      if (k % 2) { const P = R('#F4EFE4'), C = R('#E8B04A'); poly(g, [[gx, gy - 14], [gx + 8, gy - 14], [gx + 4, gy]], INK); poly(g, [[gx + 1, gy - 13], [gx + 7, gy - 13], [gx + 4, gy - 1]], P[3]); for (let s = 0; s < 4; s++) box(g, gx + 1 + s * 2, gy - 19 + (s % 2) * 2, 1, 6, C[s % 2 ? 3 : 4]); }
      else { const F = R('#C88A3A'); g.fillStyle = INK; g.beginPath(); g.ellipse(gx + 4, gy - 6, 6, 3.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[3]; g.beginPath(); g.ellipse(gx + 4, gy - 6, 5, 2.5, 0, 0, Math.PI * 2); g.fill(); poly(g, [[gx + 9, gy - 6], [gx + 12, gy - 9], [gx + 12, gy - 3]], F[2]); box(g, gx + 1, gy - 8, 4, 1, F[5]); }
    } else if (kind === 'biscuits') {
      // (tins, tartan-banded, and packets)
      const T = R(['#B91C1C', '#1E3A8A', '#14532D'][k % 3]);
      box(g, gx - 1, gy - 13, 10, 13, INK); box(g, gx, gy - 12, 8, 12, T[3]); box(g, gx, gy - 12, 2, 12, T[4]); box(g, gx, gy - 8, 8, 2, R('#FDE68A')[3]); box(g, gx, gy - 12, 8, 1, T[5]);
      for (let s = 0; s < 4; s++) box(g, gx + s * 2, gy - 8, 1, 2, T[1]);
    } else if (kind === 'tea') {
      // (tea tins, and a jug of iced tea with a lemon in it)
      if (k % 3 === 2) { const J = R('#B45309'); box(g, gx - 1, gy - 18, 10, 18, INK); box(g, gx, gy - 17, 8, 17, R('#E0F2FE')[3]); box(g, gx, gy - 12, 8, 12, J[3]); box(g, gx, gy - 12, 2, 12, J[4]); box(g, gx + 1, gy - 15, 3, 3, R('#FDE047')[4]); box(g, gx + 8, gy - 14, 2, 8, R('#E0F2FE')[2]); }
      else { const T = R(['#14532D', '#7F1D1D', '#1E3A8A'][k % 3]); box(g, gx - 1, gy - 12, 9, 12, INK); box(g, gx, gy - 11, 7, 11, T[3]); box(g, gx, gy - 11, 2, 11, T[4]); box(g, gx + 1, gy - 7, 5, 3, R(GILT)[3]); box(g, gx, gy - 13, 7, 2, R(GILT)[2]); }
    } else if (kind === 'chemist') {
      // (the carboys and the bottles)
      const B = R(['#15803D', '#B91C1C', '#1D4ED8', '#F8FAFC'][k % 4]);
      if (k % 3 === 0) { g.fillStyle = INK; g.beginPath(); g.arc(gx + 4, gy - 7, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = B[3]; g.beginPath(); g.arc(gx + 4, gy - 7, 5, 0, Math.PI * 2); g.fill(); box(g, gx + 1, gy - 10, 2, 3, B[5]); box(g, gx + 2, gy - 16, 4, 4, B[2]); }
      else { box(g, gx, gy - 12, 7, 12, INK); box(g, gx + 1, gy - 11, 5, 11, B[3]); box(g, gx + 1, gy - 11, 1, 11, B[5]); box(g, gx + 2, gy - 15, 3, 3, INK); box(g, gx + 1, gy - 7, 5, 3, R('#F8FAFC')[4]); }
    } else {
      // (wine, gin, a pyramid of beer cans)
      const B = R(['#14532D', '#7F1D1D', '#E0F2FE', '#CA8A04'][k % 4]);
      box(g, gx + 1, gy - 14, 6, 14, INK); box(g, gx + 2, gy - 13, 4, 13, B[3]); box(g, gx + 2, gy - 13, 1, 13, B[5]); box(g, gx + 3, gy - 19, 2, 6, INK); box(g, gx + 3, gy - 18, 2, 5, B[2]); box(g, gx + 2, gy - 8, 4, 3, R('#F4EFE4')[3]);
    }
  }
  box(g, x, y + h - 3, w, 3, R('#57534E')[2]);
};

/** A shopfront (local, the ground floor 0..gf): painted timber, the fascia and its gilt name, the consoles, pilasters,
 *  stallrisers, two windows of goods either side of the half-glazed door. */
const shopfront = (g: Ctx, w: number, gf: number, s: Shop, tn: Tn) => {
  const P = ramp6(tn(s.paint)), Gd = ramp6(tn(GILT)), G = glassOf(), on = lampsOn(), St = ramp6(tn(PORTLAND));
  box(g, 0, -gf, w, gf, INK); box(g, 1, -gf + 1, w - 2, gf - 1, P[3]); box(g, 1, -gf + 1, 3, gf - 1, P[4]); box(g, w - 4, -gf + 1, 3, gf - 1, P[1]);
  box(g, 0, -gf, w, 24, INK); box(g, 1, -gf + 1, w - 2, 22, P[2]); box(g, 1, -gf + 1, w - 2, 1, P[4]); box(g, 1, -gf + 22, w - 2, 1, P[0]);
  box(g, 10, -gf + 3, w - 20, 1, Gd[2]); box(g, 10, -gf + 20, w - 20, 1, Gd[1]);
  words(g, s.name, w / 2, -gf + 18, GILT_LOOK(1));
  for (const cx of [0, w - 8]) { box(g, cx, -gf - 2, 8, 28, INK); box(g, cx + 1, -gf - 1, 6, 26, P[4]); box(g, cx + 2, -gf + 4, 4, 6, Gd[3]); box(g, cx + 2, -gf + 4, 4, 1, Gd[5]); }
  for (const px0 of [2, w - 10]) { box(g, px0, -gf + 24, 8, gf - 24, P[2]); box(g, px0, -gf + 24, 2, gf - 24, P[4]); box(g, px0 + 2, -gf + 28, 4, 2, Gd[3]); }
  const dw = 30, dx = Math.round(w / 2 - dw / 2);
  for (const [sx, sw] of [[14, dx - 22], [dx + dw + 8, w - dx - dw - 22]] as const) {
    if (sw < 18) continue;
    box(g, sx - 2, -gf + 28, sw + 4, gf - 44, INK);
    box(g, sx, -gf + 30, sw, gf - 48, on ? '#C88A36' : G[1]); box(g, sx, -gf + 30, sw, Math.round((gf - 48) * 0.4), on ? '#E8A646' : G[2]);
    goods(g, sx, -gf + 30, sw, gf - 48, s.goods, tn);
    box(g, sx + Math.round(sw / 2), -gf + 30, 1, gf - 48, P[2]); if (!on) { box(g, sx + 2, -gf + 31, 1, gf - 52, G[4]); box(g, sx + 4, -gf + 31, 1, (gf - 52) / 2, G[3]); }
    box(g, sx - 2, -16, sw + 4, 16, P[2]); box(g, sx + 2, -13, sw - 4, 9, P[1]); box(g, sx + 2, -13, sw - 4, 1, P[0]); box(g, sx + 2, -5, sw - 4, 1, P[4]);
  }
  box(g, dx - 2, -gf + 26, dw + 4, gf - 26, INK); box(g, dx, -gf + 28, dw, gf - 28, P[2]); box(g, dx, -gf + 28, 2, gf - 28, P[4]);
  const gh = Math.round((gf - 28) * 0.5);
  box(g, dx + 4, -gf + 32, dw - 8, gh, on ? '#E8A646' : G[2]); if (!on) box(g, dx + 5, -gf + 33, 1, gh - 2, G[4]);
  box(g, dx + 4, -gf + 36 + gh, dw - 8, gf - 44 - gh, P[1]); box(g, dx + 4, -gf + 36 + gh, dw - 8, 1, P[0]);
  box(g, dx + dw - 7, Math.round(-gf * 0.45), 3, 3, Gd[4]);
  box(g, dx - 4, -4, dw + 8, 4, INK); box(g, dx - 3, -3, dw + 6, 3, St[3]); box(g, dx - 3, -3, dw + 6, 1, St[5]);
};

const paintTerrace = (g: Ctx, f: UkFront) => {
  const { w, h } = f, seed = f.rx, tn: Tn = dimmed;
  const S = ramp6(tn(STUCCO)), Sl = ramp6(tn(SLATE)), Wl = ramp6(tn(f.kind === 'brick' ? BRICK : f.kind === 'stock' ? STOCK : STUCCO));
  const gf = 92;
  // (the slate roof behind the parapet, its dormers; the chimney stacks on the party walls)
  const ry = -h;
  poly(g, [[6, ry], [22, ry - 30], [w - 22, ry - 30], [w - 6, ry]], INK);
  poly(g, [[7, ry], [23, ry - 29], [w - 23, ry - 29], [w - 7, ry]], Sl[2]);
  poly(g, [[7, ry], [23, ry - 29], [60, ry - 29], [44, ry]], Sl[3]);
  for (let y = ry - 26; y < ry; y += 4) box(g, 10, y, w - 20, 1, Sl[1]);
  box(g, 22, ry - 30, w - 44, 2, Sl[4]);
  const nd = Math.max(1, Math.floor(w / 110));
  for (let k = 0; k < nd; k++) {
    const dx = Math.round((w * (k + 0.5)) / nd) - 9;
    box(g, dx - 1, ry - 23, 20, 23, INK); box(g, dx, ry - 22, 18, 22, S[3]); box(g, dx, ry - 22, 2, 22, S[4]);
    poly(g, [[dx - 3, ry - 22], [dx + 9, ry - 30], [dx + 21, ry - 22]], Sl[3]);
    const on = lampsOn() && hash(seed + k) > 0.5;
    box(g, dx + 4, ry - 17, 10, 13, on ? '#E8A646' : glassOf()[1]); box(g, dx + 8, ry - 17, 1, 13, S[3]);
  }
  chimney(g, 16, ry - 2, 4, tn, seed); chimney(g, w - 16, ry - 2, 4, tn, seed + 9);
  // (the wall: brick or stucco, the party walls' shade)
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  if (f.kind === 'stucco') { slab(g, 0, -h, w, h, Wl, false); stucco(g, 0, -h, w, h, Wl, seed); }
  else bricks(g, 0, -h, w, h, Wl, seed);
  box(g, 0, -h, 2, h, Wl[4]); box(g, w - 3, -h, 3, h, Wl[1]);
  // (the parapet's coping and the cornice under it)
  box(g, -3, -h + 16, w + 6, 6, INK); box(g, -2, -h + 17, w + 4, 4, S[3]); box(g, -2, -h + 17, w + 4, 1, S[5]); box(g, -2, -h + 20, w + 4, 1, S[1]);
  for (let x = 2; x < w - 2; x += 6) box(g, x, -h + 22, 3, 3, S[2]);
  box(g, -2, -h - 2, w + 4, 4, INK); box(g, -1, -h - 1, w + 2, 2, S[4]);
  // (the ground floor: a shop, or stucco rusticated in deep channels)
  if (f.shop) shopfront(g, w, gf, f.shop, tn);
  else { slab(g, 0, -gf, w, gf, S, true); for (let y = -gf + 10; y < -6; y += 10) { box(g, 0, y, w, 1, S[1]); box(g, 0, y + 1, w, 1, S[4]); } }
  box(g, -2, -gf - 5, w + 4, 6, INK); box(g, -1, -gf - 4, w + 2, 4, S[3]); box(g, -1, -gf - 4, w + 2, 1, S[5]);
  // (the windows, floor by floor)
  const n = Math.max(2, Math.floor((w - 24) / 64)), ww = 24;
  const rows: [number, number][] = h >= 226 ? [[-gf - 56, 46], [-gf - 98, 28]] : [[-gf - 10 - Math.min(54, h - gf - 46), Math.min(54, h - gf - 46)]];
  rows.forEach(([wy, wh], r) => {
    for (let k = 0; k < n; k++) sash(g, Math.round(22 + k * ((w - 44 - ww) / (n - 1))), wy, ww, wh, tn, f.kind === 'stucco' ? (r === 0 ? 'hood' : 'none') : 'arch', seed + r * 7 + k, Wl);
  });
  // (a stucco front's long balcony along the first floor, its iron rail)
  if (f.kind === 'stucco') {
    const I = ramp6(tn(IRON)), by = -gf - 6;
    box(g, 4, by, w - 8, 4, INK); box(g, 5, by, w - 10, 3, S[3]); box(g, 5, by, w - 10, 1, S[5]);
    box(g, 5, by - 14, w - 10, 2, INK); box(g, 5, by - 14, w - 10, 1, I[4]);
    for (let x = 7; x < w - 7; x += 4) box(g, x, by - 12, 1, 12, I[2]);
    for (let x = 10; x < w - 10; x += 22) { box(g, x, by + 4, 4, 5, S[2]); box(g, x, by + 8, 4, 1, INK); }
  }
  // (a house's door and its railings)
  if (!f.shop) { frontDoor(g, Math.round(w / 2 - 15), 0, 30, 64, f.door ?? '#111827', tn); areaRail(g, 4, w - 4, w / 2 - 26, w / 2 + 26, tn); }
};
export const drawTerrace = (c: Ctx, v: View, x: number, f: UkFront) => facade(c, v, `uk-front-${f.rx}`, x, f.w, f.h, g => paintTerrace(g, f), undefined, 72, 26);

// ---------------------------------------------------------------------------------------------------------------
// The palace gate (set back), the sentry boxes, the phone boxes, the bus stop

/** The palace gate (local: its left foot at 0, 0, 460 across): the palace beyond (dimmer, farther: Portland stone, its
 *  rows of windows, the balustrade along its top, the pediment), the plinth wall, the rusticated piers and their lamps,
 *  the railings (bars, gilt spear tips, the rails), the gates in the middle and their gilt crest. */
const paintGate = (g: Ctx) => {
  const w = 460, S = ramp6(dimmed(PORTLAND)), I = ramp6(dimmed(IRON)), Gd = ramp6(dimmed(GILT)), on = lampsOn();
  const P = ramp6(mix(dimmed(PORTLAND), skyAt(0.9), 0.25)), Gl = glassOf();
  box(g, -1, -197, w + 2, 138, INK); stoneBlocks(g, 0, -196, w, 136, P, 41, 30, 12);
  for (let r = 0; r < 2; r++) for (let x = 14; x < w - 20; x += 28) { box(g, x - 1, -182 + r * 56, 14, 30, INK); box(g, x, -181 + r * 56, 12, 28, on && hash(x + r) > 0.5 ? '#C88A36' : mix(Gl[1], P[1], 0.4)); box(g, x + 6, -181 + r * 56, 1, 28, P[2]); box(g, x - 2, -184 + r * 56, 16, 2, P[4]); }
  box(g, 0, -206, w, 10, P[3]); for (let x = 2; x < w; x += 6) box(g, x, -204, 3, 7, P[1]); box(g, -2, -208, w + 4, 3, P[4]);
  poly(g, [[w / 2 - 90, -206], [w / 2, -240], [w / 2 + 90, -206]], INK); poly(g, [[w / 2 - 87, -207], [w / 2, -237], [w / 2 + 87, -207]], P[3]); poly(g, [[w / 2 - 70, -209], [w / 2, -232], [w / 2 + 70, -209]], P[2]);
  // (the plinth wall the railings stand on)
  box(g, -1, -61, w + 2, 61, INK); stoneBlocks(g, 0, -60, w, 60, S, 7, 40, 15);
  box(g, -3, -64, w + 6, 5, INK); box(g, -2, -63, w + 4, 3, S[4]); box(g, -2, -63, w + 4, 1, S[5]);
  // (the railings: bars with their gilt spear tips, the rails, a gilt rosette band)
  const piers = [0, 110, 176, 262, 328, 438], spans: [number, number][] = [[22, 110], [132, 176], [284, 328], [350, 438]];
  for (const [a, b] of spans) {
    for (let x = a + 2; x < b - 1; x += 6) { box(g, x, -194, 2, 130, I[2]); box(g, x, -194, 1, 130, I[3]); poly(g, [[x - 1, -194], [x + 1, -202], [x + 3, -194]], Gd[3]); box(g, x, -200, 1, 3, Gd[5]); }
    for (const ry of [-188, -82]) { box(g, a, ry, b - a, 3, INK); box(g, a, ry, b - a, 1, I[4]); }
    for (let x = a + 5; x < b - 3; x += 12) { box(g, x, -79, 4, 4, Gd[3]); box(g, x + 1, -78, 1, 1, Gd[5]); }
  }
  // (the gates: taller, scrolled, the gilt crest over their meeting)
  const ga = 198, gb = 262;
  for (let x = ga + 2; x < gb - 1; x += 5) { box(g, x, -206, 2, 142, I[2]); poly(g, [[x - 1, -206], [x + 1, -214], [x + 3, -206]], Gd[3]); }
  for (const ry of [-196, -150, -82]) { box(g, ga, ry, gb - ga, 3, INK); box(g, ga, ry, gb - ga, 1, I[4]); }
  g.strokeStyle = Gd[3]; g.lineWidth = 1.5;
  for (const sx of [ga + 16, gb - 16]) { g.beginPath(); g.arc(sx, -170, 9, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(sx, -116, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  box(g, (ga + gb) / 2 - 1, -206, 2, 142, INK);
  const cx = (ga + gb) / 2, cy = -230;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 19, 0, Math.PI * 2); g.fill();
  g.fillStyle = Gd[2]; g.beginPath(); g.arc(cx, cy, 18, 0, Math.PI * 2); g.fill();
  g.fillStyle = Gd[4]; g.beginPath(); g.arc(cx - 2, cy - 2, 13, 0, Math.PI * 2); g.fill();
  poly(g, [[cx - 9, cy - 9], [cx + 9, cy - 9], [cx + 9, cy + 2], [cx, cy + 11], [cx - 9, cy + 2]], INK);
  box(g, cx - 8, cy - 8, 8, 9, dimmed('#B91C1C')); box(g, cx, cy - 8, 8, 9, dimmed('#1E3A8A'));
  poly(g, [[cx - 8, cy + 1], [cx + 8, cy + 1], [cx, cy + 9]], Gd[3]);
  crown(g, cx, cy - 22, Gd, 1);
  // (the piers: rusticated stone, their caps, a lamp on each gate pier)
  for (const px0 of piers) {
    box(g, px0 - 1, -219, 24, 219, INK); stoneBlocks(g, px0, -218, 22, 218, S, px0, 22, 12);
    box(g, px0, -218, 3, 218, S[4]); box(g, px0 + 19, -218, 3, 218, S[1]);
    box(g, px0 - 3, -224, 28, 7, INK); box(g, px0 - 2, -223, 26, 5, S[4]); box(g, px0 - 2, -223, 26, 1, S[5]);
    if (px0 === 176 || px0 === 262) {
      const lx = px0 + 11;
      box(g, lx - 1, -240, 3, 16, I[2]);
      if (on) steppedGlow(g, lx, -248, 16, '#FFE7A0', 0, 0.3, 3);
      box(g, lx - 6, -258, 13, 18, INK); box(g, lx - 5, -257, 11, 16, on ? '#FFF4C8' : dimmed('#C8D0D8')); box(g, lx - 1, -257, 1, 16, I[2]);
      poly(g, [[lx - 7, -258], [lx, -266], [lx + 7, -258]], I[3]); ball(g, lx, -268, 2, dimmed(GILT), true);
    } else { g.fillStyle = INK; g.beginPath(); g.arc(px0 + 11, -230, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.arc(px0 + 11, -230, 7, 0, Math.PI * 2); g.fill(); box(g, px0 + 7, -234, 3, 3, S[5]); }
  }
};
export const drawGate = (c: Ctx, v: View, x: number) => facade(c, v, 'uk-gate', x, 460, 220, paintGate, 0.9, 60, 12, false);

/** A sentry box (a box he stands on: its flat top's the lit lip): painted planks, the arched opening dark inside (its
 *  bench), fluted pilasters, the red frieze and its gilt crown, the cornice; its gabled roof set back behind. */
export const drawSentry = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top, D = ramp6(dimmed('#1C2430'));
  const [pa, py] = at(v.eye, a + 2, top, 0.95), [pb] = at(v.eye, b - 2, top, 0.95), pm = (pa + pb) / 2;
  c.save(); c.beginPath(); c.rect(pa - 10, py - 60, pb - pa + 20, top - (py - 60)); c.clip();
  poly(c, [[pa - 2, py + 1], [pm, py - 26], [pb + 2, py + 1]], INK); poly(c, [[pa, py], [pm, py - 24], [pb, py]], D[3]); poly(c, [[pa, py], [pm, py - 24], [pm, py]], D[4]);
  box(c, pa, py - 2, pb - pa, 2, D[1]); ball(c, pm, py - 27, 2, dimmed(GILT), true);
  c.restore();
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#E8E4DA' });
  still(c, `uk-sentry-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const P = ramp6(hour('#E8E4DA')), K = ramp6(hour('#1C2430')), Gd = ramp6(hour(GILT)), Rd = ramp6(hour(PILLAR));
    box(g, -1, 0, w + 2, h + 1, INK); planks(g, 0, 0, w, h, P, true, 5, 10);
    box(g, 0, 0, w, 8, P[4]); box(g, 0, 0, w, 1, P[5]); box(g, 0, 7, w, 1, P[1]);
    box(g, 0, 8, w, 16, Rd[3]); box(g, 0, 8, w, 1, Rd[5]); box(g, 0, 23, w, 1, Rd[1]);
    crown(g, w / 2, 18, Gd, 0.8);
    const ox = 11, ow = w - 22, oy = 32, ar = ow / 2;
    g.fillStyle = INK; g.beginPath(); g.moveTo(ox - 1, h - 10); g.lineTo(ox - 1, oy + ar); g.arc(w / 2, oy + ar, ar + 1, Math.PI, 0); g.lineTo(ox + ow + 1, h - 10); g.closePath(); g.fill();
    g.fillStyle = K[1]; g.beginPath(); g.moveTo(ox, h - 10); g.lineTo(ox, oy + ar); g.arc(w / 2, oy + ar, ar, Math.PI, 0); g.lineTo(ox + ow, h - 10); g.closePath(); g.fill();
    box(g, ox + 3, oy + ar, ow - 6, h - 10 - oy - ar, '#140C10'); checker(g, ox + 1, oy + ar, 2, h - 10 - oy - ar, K[2], 0, 1);
    box(g, ox + 2, h - 44, ow - 4, 4, P[1]); box(g, ox + 2, h - 44, ow - 4, 1, P[3]);
    for (const px0 of [2, w - 9]) { box(g, px0, 24, 7, h - 34, P[3]); box(g, px0, 24, 2, h - 34, P[5]); box(g, px0 + 6, 24, 1, h - 34, P[1]); box(g, px0 + 3, 28, 1, h - 42, P[2]); }
    box(g, 0, h - 10, w, 10, K[2]); box(g, 0, h - 10, w, 1, K[4]); box(g, 0, h - 3, w, 3, K[1]);
  });
  lip(c, a, top, w);
};

/** A phone box's front (local: w x h): the red casting, stepped; the cornice; the TELEPHONE fascia; the glazing, three
 *  columns of eight little panes in their bars (warm inside after dark); the brass pull; the plinth. */
const paintBooth = (g: Ctx, w: number, h: number) => {
  const R = ramp6(hour(PILLAR)), G = glassOf(), on = lampsOn();
  box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, R, false);
  box(g, -1, 0, w + 2, 6, R[4]); box(g, -1, 0, w + 2, 1, R[5]); box(g, -1, 5, w + 2, 1, R[1]);
  box(g, 0, 6, w, 11, INK); box(g, 1, 7, w - 2, 9, on ? '#FFF8E0' : '#F1F1EE'); box(g, 1, 7, w - 2, 1, '#FFFFFF');
  signText(g, 'TELEPHONE', w / 2, 15, { sx: 1, sy: 1, fill: '#111827', gap: 0 });
  const gx0 = 6, gx1 = w - 6, gy0 = 21, gy1 = h - 14, cols = 3, rows = 8;
  box(g, gx0 - 1, gy0 - 1, gx1 - gx0 + 2, gy1 - gy0 + 2, R[1]);
  const pw = (gx1 - gx0 - (cols - 1) * 2) / cols, ph = (gy1 - gy0 - (rows - 1) * 2) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const px0 = Math.round(gx0 + k * (pw + 2)), py0 = Math.round(gy0 + r * (ph + 2)), pww = Math.round(pw), phh = Math.round(ph);
    box(g, px0, py0, pww, phh, on ? (r < 3 ? '#FFE9B0' : '#F2C870') : r < 3 ? G[2] : G[1]);
    box(g, px0, py0, pww, 1, mix(R[1], INK, 0.4));
    if (!on && k === 0) box(g, px0 + 1, py0 + 1, 1, phh - 2, G[4]);
  }
  box(g, w - 9, Math.round(h * 0.55), 3, 10, INK); box(g, w - 8, Math.round(h * 0.55) + 1, 1, 8, hour('#E8B83A'));
  box(g, -1, h - 10, w + 2, 10, R[2]); box(g, -1, h - 10, w + 2, 1, R[4]); box(g, 0, h - 3, w, 3, R[1]);
  box(g, 0, 0, 2, h, R[4]); box(g, w - 3, 0, 3, h, R[1]);
};
/** The domed roof and its crown, set back over a phone box's top (behind where he'd stand: clipped above it). */
const domeBack = (c: Ctx, v: View, a: number, b: number, top: number) => {
  const D = ramp6(dimmed(PILLAR)), Gd = ramp6(dimmed(GILT));
  const [pa, py] = at(v.eye, a + 3, top, 0.96), [pb] = at(v.eye, b - 3, top, 0.96), pm = (pa + pb) / 2, hw = (pb - pa) / 2;
  if (py >= top - 1) return;
  c.save(); c.beginPath(); c.rect(pa - 6, py - 40, pb - pa + 12, top - (py - 40)); c.clip();
  c.fillStyle = INK; c.beginPath(); c.ellipse(pm, py, hw + 1, 11, 0, Math.PI, 0); c.fill();
  c.fillStyle = D[3]; c.beginPath(); c.ellipse(pm, py, hw, 10, 0, Math.PI, 0); c.fill();
  c.fillStyle = D[4]; c.beginPath(); c.ellipse(pm - hw * 0.3, py - 2, hw * 0.45, 6, 0, Math.PI, 0); c.fill();
  crown(c, pm, py - 5, Gd, 0.6);
  c.restore();
};
/** A phone box (or two side by side: a box he stands on, its flat top the lit lip): the faces going back, the fronts
 *  stamped, the domed roofs set back. */
export const drawBooth = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top, n = w >= 90 ? 2 : 1, bw = Math.round(w / n);
  for (let k = 0; k < n; k++) domeBack(c, v, a + k * bw, a + (k + 1) * bw, top);
  box3Back(c, v, { x: a, top, w, bottom: GY, col: PILLAR });
  for (let k = 0; k < n; k++) still(c, `uk-booth-${bw}x${h}`, a + k * bw, top, -2, -1, bw + 4, h + 2, g => paintBooth(g, bw, h));
  lip(c, a, top, w);
};

/** The bus stop (its roof the ledge): the posts, the glass back panel set back (its frame, the route map), the roof. */
export const drawShelter = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const d = 0.95, [pa, py] = at(v.eye, a + 4, top + 6, d), [pb, pg] = at(v.eye, b - 4, GY, d);
  const I = ramp6(dimmed('#2A2E34')), G = glassOf();
  box(c, pa - 1, py - 1, pb - pa + 2, pg - py + 1, INK);
  c.globalAlpha = 0.6; box(c, pa, py, pb - pa, pg - py, G[2]); c.globalAlpha = 1;
  box(c, pa + 2, py + 2, 1, pg - py - 16, G[4]);
  box(c, pa, py, pb - pa, 3, I[3]); box(c, pa, pg - 12, pb - pa, 12, I[2]); box(c, pa, pg - 12, pb - pa, 1, I[4]);
  const mx = Math.round(pa + 8), my = Math.round(py + 12), mw = Math.round(Math.min(34, pb - pa - 16)), mh = 30;
  box(c, mx - 1, my - 1, mw + 2, mh + 2, INK); box(c, mx, my, mw, mh, dimmed('#F4F1E8'));
  for (const [ly, col] of [[8, '#DC2626'], [16, '#1D4ED8'], [23, '#16A34A']] as const) { box(c, mx + 2, my + ly, mw - 4, 1, dimmed(col)); for (let k = 0; k < 4; k++) box(c, mx + 3 + k * ((mw - 8) / 3), my + ly - 1, 2, 3, dimmed(col)); }
  box(c, mx + 2, my + 2, mw - 4, 3, dimmed('#1C1014'));
  const P = ramp6(hour('#2A2E34'));
  for (const px0 of [a + 6, b - 6]) post(c, px0, top, GY, 4, P);
  // (the timetable box on the near post)
  box(c, b - 13, top + 30, 14, 20, INK); box(c, b - 12, top + 31, 12, 18, hour('#F4F1E8')); for (let k = 0; k < 5; k++) box(c, b - 10, top + 34 + k * 3, 8, 1, hour('#52525B'));
  ledge3(c, v, a, top, b - a, '#2A2E34', 6);
};

// ---------------------------------------------------------------------------------------------------------------
// The double-decker bus

export const BUS_W = 300;
/** A window of the bus (local): its rubber surround, the glass (dark inside by day, the seat backs in their moquette;
 *  warm after dark), a sheen. */
const busWin = (g: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  const G = glassOf(), on = lampsOn();
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, on ? '#8A5A2A' : mix(G[1], '#141824', 0.45)); box(g, x, y, w, Math.round(h * 0.35), on ? '#C88A36' : mix(G[2], '#141824', 0.25));
  const M = ramp6(['#7F1D1D', '#14532D', '#1E3A8A'][k % 3]);
  box(g, x + 2, y + h - 11, w - 4, 8, M[2]); box(g, x + 2, y + h - 11, w - 4, 1, M[4]); for (let s = x + 4; s < x + w - 3; s += 4) box(g, s, y + h - 9, 2, 1, M[3]);
  box(g, x + 2, y + h - 3, w - 4, 3, M[1]);
  if (!on) { poly(g, [[x + 4, y], [x + 10, y], [x + 2, y + h], [x, y + h - 4]], 'rgba(255,255,255,0.14)'); box(g, x + 1, y + 1, 1, h - 2, G[4]); }
};
/** The bus's body (local: its top-left at 0, 0; w x h): rounded at the roof, red in steps; the upper deck's windows, the
 *  cream band between the decks, the advert, the lower deck's, the open platform at the back (its pole, the stair), the
 *  cab and the radiator at the front, the blind, the wheel arches, the skirt, the panel lines, the fleet name. */
const paintBus = (g: Ctx, w: number, h: number) => {
  const R = ramp6(hour(PILLAR)), Cr = ramp6(hour('#EDE4C8')), K = ramp6(hour('#20242A')), M = ramp6(hour('#B8BEC8')), Gd = ramp6(hour(GILT)), G = glassOf(), on = lampsOn();
  const r = 14, shape = () => { g.beginPath(); g.moveTo(0, h); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r); g.lineTo(w, h); g.closePath(); };
  g.save(); g.translate(-1, -1); g.scale((w + 2) / w, (h + 2) / h); g.fillStyle = INK; shape(); g.fill(); g.restore();
  g.save(); shape(); g.clip();
  slab(g, 0, 0, w, h, R, false);
  box(g, 0, 0, w, 3, R[5]); box(g, 0, 3, w, 3, R[4]); checker(g, 0, 6, w, 2, R[4], 0, 1);
  // (the upper deck)
  for (let k = 0; k < 7; k++) busWin(g, 10 + k * 40, 12, 32, 32, k);
  // (the blind over the front windows)
  box(g, w - 92, 1, 84, 10, INK); box(g, w - 91, 2, 82, 8, '#0E0E10'); signText(g, '9 CANADA', w - 50, 10, { sx: 1, sy: 1, fill: '#FDE68A', gap: 1 });
  // (the cream band between the decks, the advert panel under it)
  box(g, 0, 50, w, 7, Cr[3]); box(g, 0, 50, w, 1, Cr[5]); box(g, 0, 56, w, 1, Cr[1]);
  box(g, 44, 59, 200, 18, INK); box(g, 45, 60, 198, 16, '#F8FAFC'); box(g, 45, 60, 198, 1, '#FFFFFF'); box(g, 45, 75, 198, 1, '#CBD5E1');
  signText(g, 'SEE THE QUEEN (CARDBOARD)', 144, 72, { sx: 1, sy: 1, fill: '#1E3A8A', gap: 1, bold: true });
  // (the lower deck, the platform at the back, the cab at the front)
  for (let k = 1; k < 6; k++) busWin(g, 10 + k * 40, 82, 32, 30, k + 4);
  box(g, 3, 80, 34, h - 92, INK); box(g, 4, 81, 32, h - 94, on ? '#5A3A1A' : '#1C1014');
  for (let k = 0; k < 5; k++) { box(g, 6 + k * 5, h - 18 - k * 9, 28 - k * 5, 2, K[3]); box(g, 6 + k * 5, h - 18 - k * 9, 28 - k * 5, 1, K[5]); }
  box(g, 34, 80, 3, h - 92, M[4]); box(g, 35, 80, 1, h - 92, M[5]);
  box(g, 0, h - 14, 40, 3, M[3]); box(g, 0, h - 14, 40, 1, M[5]);
  busWin(g, w - 38, 82, 30, 26, 9);
  box(g, w - 34, 112, 26, h - 132, INK);
  for (let y = 113; y < h - 21; y += 3) { box(g, w - 33, y, 24, 2, M[2]); box(g, w - 33, y, 24, 1, M[4]); }
  box(g, w - 26, h - 18, 18, 6, INK); box(g, w - 25, h - 17, 16, 4, '#F8E048'); for (let k = 0; k < 4; k++) box(g, w - 23 + k * 4, h - 16, 2, 2, '#111827');
  // (the panel lines and their rivets; the fleet name)
  for (let x = 40; x < w - 40; x += 40) { box(g, x, 6, 1, 44, R[1]); box(g, x, 77, 1, h - 84, R[1]); }
  for (let x = 6; x < w - 6; x += 10) { box(g, x, 79, 1, 1, R[5]); box(g, x, h - 24, 1, 1, R[5]); }
  words(g, 'LONDON (OHIO)', 150, h - 30, { ...GILT_LOOK(1), sy: 1, serif: false, gap: 1 });
  // (the wheel arches, the skirt)
  for (const ax of [62, w - 62]) { g.fillStyle = INK; g.beginPath(); g.arc(ax, h + 4, 21, Math.PI, 0); g.fill(); g.fillStyle = '#140C10'; g.beginPath(); g.arc(ax, h + 4, 19, Math.PI, 0); g.fill(); }
  box(g, 0, h - 6, w, 6, K[2]); box(g, 0, h - 6, w, 1, K[4]);
  g.restore();
  void Gd; void G;
};
/** A wheel (live: it turns as it goes): the tire, stepped, its lit shoulder, the hub, its nuts going round. */
const wheel = (c: Ctx, x: number, y: number, r: number, rot: number) => {
  const K = ramp6(hour('#2A2A2E')), M = ramp6(hour('#A8AEB8'));
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = K[2]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = K[4]; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r - 2, Math.PI * 1.05, Math.PI * 1.5); c.stroke();
  c.fillStyle = M[2]; c.beginPath(); c.arc(x, y, r * 0.52, 0, Math.PI * 2); c.fill();
  c.fillStyle = M[4]; c.beginPath(); c.arc(x - 1, y - 1, r * 0.32, 0, Math.PI * 2); c.fill();
  const a0 = rot / r;
  for (let k = 0; k < 6; k++) { const a = a0 + (k / 6) * Math.PI * 2; box(c, x + Math.cos(a) * r * 0.38 - 1, y + Math.sin(a) * r * 0.38 - 1, 2, 2, INK); }
  box(c, x - 1, y - 1, 2, 2, M[5]);
};
/** The bus (live: it runs): its roof and its ends going back, the body stamped, the wheels turning, the lights (the
 *  reversing light flashing), exhaust when it's going, the roof's lit lip (a ride). */
export const drawBus = (c: Ctx, v: View, x: number, top: number, f: number, dir: number) => {
  const w = BUS_W, h = GY - 8 - top;
  if (!onScreen(v, x - 40, x + w + 40)) return;
  const R = ramp6(hour(PILLAR));
  topBack(c, v.eye, x + 6, x + w - 6, top, 1, 0.93, R, 3);
  sideBack(c, v.eye, x, -1, top + 12, GY - 8, 1, 0.93, R, 3, false);
  sideBack(c, v.eye, x + w, 1, top + 12, GY - 8, 1, 0.93, R, 3, false);
  still(c, `uk-bus-${w}x${h}`, x, top, -3, -3, w + 6, h + 6, g => paintBus(g, w, h));
  for (const wx of [x + 62, x + w - 62]) wheel(c, wx, GY - 15, 15, x);
  const on = lampsOn(), go = dir !== 0;
  if (on || go) steppedGlow(c, x + w - 3, top + h - 24, 18, '#FFF1C0', 0, 0.32, 3);
  box(c, x + w - 7, top + h - 30, 6, 9, INK); box(c, x + w - 6, top + h - 29, 4, 7, on || go || (f >> 4) % 2 ? '#FFF4C8' : '#FDE68A'); box(c, x + w - 6, top + h - 29, 1, 2, '#FFFFFF');
  if (dir < 0 && (f >> 3) % 2) { steppedGlow(c, x + 2, top + h - 24, 14, '#FFFFFF', 0, 0.35, 3); box(c, x - 1, top + h - 30, 5, 9, INK); box(c, x, top + h - 29, 3, 7, '#F8FAFC'); }
  else { box(c, x - 1, top + h - 30, 5, 9, INK); box(c, x, top + h - 29, 3, 7, '#B91C1C'); }
  if (go) for (let k = 0; k < 3; k++) { const t = (f * 2 + k * 14) % 42; c.globalAlpha = 0.45 * (1 - t / 42); pixelBlob(c, x - 4 - t * 0.7, GY - 12 - t * 0.5, 4 + t * 0.15, 3 + t * 0.1, '#9CA3AF'); }
  c.globalAlpha = 1;
  lip(c, x, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// THE PUB, the barrels, the tea cart

/** A hanging basket (local; hung from x, y): its wire bowl lined with moss, geraniums and lobelia in stepped blobs, ivy
 *  trailing down. */
const basket = (g: Ctx, x: number, y: number) => {
  const Gr = ramp6(hour('#3F6A2A')), Rd = ramp6(hour('#DC2626')), Bl = ramp6(hour('#7C3AED')), I = ramp6(hour(IRON));
  for (const dx of [-8, 0, 8]) box(g, x + dx * 0.5, y - 6, 1, 6, I[3]);
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 10, 0, Math.PI); g.fill();
  g.fillStyle = Gr[1]; g.beginPath(); g.arc(x, y, 9, 0, Math.PI); g.fill();
  for (let k = 0; k < 4; k++) box(g, x - 9 + k * 5, y + 1, 1, 6, I[3]);
  for (let k = 0; k < 7; k++) { const fx = x - 9 + k * 3, fy = y - 2 - (k % 2) * 3; pixelBlob(g, fx, fy, 2.5, 2, k % 3 === 1 ? Bl[3] : Rd[3]); box(g, fx - 1, fy - 1, 1, 1, k % 3 === 1 ? Bl[5] : Rd[5]); }
  for (const tx of [x - 7, x - 2, x + 5]) for (let k = 0; k < 4; k++) box(g, tx + (k % 2), y + 6 + k * 3, 2, 2, Gr[k % 2 ? 2 : 3]);
};
/** The pub's sign (local: its board x, y, w, h): the gilt frame, a painted queen (head and shoulders: her gray curls,
 *  her crown, pearls, the blue gown's shoulders), the sky behind her. */
const queenSign = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const Gd = ramp6(hour(GILT)), Sk = ramp6(hour('#7FA8D0')), Bl = ramp6(hour('#1E3A8A')), Sn = ramp6(hour('#E8C4A0')), Hr = ramp6(hour('#C8C8CC'));
  box(g, x - 2, y - 2, w + 4, h + 4, INK); box(g, x - 1, y - 1, w + 2, h + 2, Gd[3]); box(g, x - 1, y - 1, w + 2, 1, Gd[5]); box(g, x - 1, y - 1, 1, h + 2, Gd[4]); box(g, x + w, y - 1, 1, h + 2, Gd[1]);
  box(g, x + 1, y + 1, w - 2, h - 2, Sk[3]); box(g, x + 1, y + 1, w - 2, (h - 2) * 0.4, Sk[4]); checker(g, x + 1, y + 1 + Math.round((h - 2) * 0.4), w - 2, 2, Sk[4], 0, 1);
  const cx = x + w / 2;
  poly(g, [[x + 2, y + h - 1], [cx - 9, y + h - 14], [cx + 9, y + h - 14], [x + w - 2, y + h - 1]], Bl[3]); poly(g, [[x + 2, y + h - 1], [cx - 9, y + h - 14], [cx - 4, y + h - 14], [x + 8, y + h - 1]], Bl[4]);
  for (let k = 0; k < 5; k++) box(g, cx - 5 + k * 2.5, y + h - 13 + (k === 2 ? 1 : 0), 2, 2, '#F8FAFC');
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, y + h - 22, 8, 10, 0, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 6; k++) { const a = Math.PI + (k / 5) * Math.PI; pixelBlob(g, cx + Math.cos(a) * 7, y + h - 24 + Math.sin(a) * 6, 2.5, 2.5, Hr[k % 2 ? 3 : 4], 1); }
  g.fillStyle = Sn[3]; g.beginPath(); g.ellipse(cx, y + h - 21, 5.5, 7, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 4, y + h - 26, 2, 5, Sn[4]); box(g, cx - 3, y + h - 23, 2, 1, INK); box(g, cx + 1, y + h - 23, 2, 1, INK); box(g, cx - 2, y + h - 18, 4, 1, hour('#B4485A'));
  crown(g, cx, y + h - 30, Gd, 0.5);
};
/** The pub's front (local: its top-left 0, 0; w x h): the brick upper storey (sash windows under their arches, the
 *  cornice and its dentils), the green fascia and its gilt name, the consoles, the green-painted front (pilasters with
 *  gilt caps, the etched windows glowing after dark, the stallrisers, the double doors), hanging baskets; and off its
 *  corner the painted sign on its iron bracket. */
const paintPub = (g: Ctx, w: number, h: number) => {
  const B = ramp6(hour(BRICK)), P = ramp6(hour(PUBGREEN)), Gd = ramp6(hour(GILT)), S = ramp6(hour(PORTLAND)), I = ramp6(hour(IRON)), on = lampsOn(), G = glassOf();
  box(g, -1, 0, w + 2, h + 1, INK);
  bricks(g, 0, 0, w, 70, B, 77);
  box(g, 0, 0, w, 6, S[3]); box(g, 0, 0, w, 1, S[5]); box(g, 0, 5, w, 1, S[1]); for (let x = 3; x < w - 3; x += 6) box(g, x, 6, 3, 3, S[2]);
  for (const wx of [30, 112, 194]) sash(g, wx, 22, 26, 34, hour, 'arch', wx, B);
  // (the fascia)
  box(g, 0, 68, w, 34, INK); box(g, 1, 69, w - 2, 32, P[2]); box(g, 1, 69, w - 2, 2, P[4]); box(g, 1, 99, w - 2, 2, P[0]);
  box(g, 6, 72, w - 12, 26, P[3]); box(g, 6, 72, w - 12, 1, Gd[3]); box(g, 6, 97, w - 12, 1, Gd[2]);
  words(g, "THE QUEEN'S HEAD", w / 2, 86, GILT_LOOK(1));
  words(g, '(AND SHOULDERS)', w / 2, 96, { ...GILT_LOOK(1), sy: 1, serif: false, gap: 1 });
  for (const cx of [0, w - 10]) { box(g, cx, 66, 10, 40, INK); box(g, cx + 1, 67, 8, 38, P[4]); box(g, cx + 3, 74, 4, 10, Gd[3]); box(g, cx + 3, 74, 4, 1, Gd[5]); box(g, cx + 2, 100, 6, 4, P[1]); }
  // (the green front: pilasters, the etched windows, the stallrisers, the doors)
  box(g, 0, 102, w, h - 102, P[3]); box(g, 0, 102, 3, h - 102, P[4]); box(g, w - 4, 102, 4, h - 102, P[1]);
  for (const px0 of [0, 83, 157, w - 10]) { box(g, px0, 102, 10, h - 102, P[2]); box(g, px0, 102, 2, h - 102, P[4]); box(g, px0 + 9, 102, 1, h - 102, P[0]); box(g, px0 - 1, 104, 12, 5, Gd[3]); box(g, px0 - 1, 104, 12, 1, Gd[5]); }
  for (const [wx, ww, word] of [[13, 68, 'ALES'], [169, 69, 'SNUG']] as const) {
    box(g, wx - 1, 111, ww + 2, 40, INK);
    box(g, wx, 112, ww, 38, on ? '#C8862E' : mix(G[1], '#1C1014', 0.35)); box(g, wx, 112, ww, 14, on ? '#E8A646' : mix(G[2], '#1C1014', 0.2));
    if (on) { for (let k = 0; k < 6; k++) { box(g, wx + 6 + k * 10, 118, 4, 9, ['#7F1D1D', '#14532D', '#CA8A04'][k % 3]); box(g, wx + 7 + k * 10, 116, 2, 2, '#3A2A1A'); } box(g, wx + 2, 127, ww - 4, 2, '#6A3E12'); }
    else { poly(g, [[wx + 6, 112], [wx + 14, 112], [wx + 2, 132], [wx, 128]], 'rgba(255,255,255,0.14)'); box(g, wx + 1, 113, 1, 18, G[4]); }
    checker(g, wx, 131, ww, 19, on ? '#FFE4B0' : '#D8E0E8', 0, 1);
    g.strokeStyle = on ? '#FFF4D8' : '#F0F4F8'; g.lineWidth = 1; for (let k = 0; k < ww / 16; k++) { g.beginPath(); g.arc(wx + 8 + k * 16, 144, 5, Math.PI * 0.9, Math.PI * 2.1); g.stroke(); }
    words(g, word, wx + ww / 2, 140, plain(1, 1, on ? '#FFF8E8' : '#F8FAFC'));
    for (const k1 of [1, 2]) box(g, wx + Math.round((ww * k1) / 3), 112, 1, 38, P[1]);
    box(g, wx - 1, 151, ww + 2, h - 155, P[2]); box(g, wx + 3, 154, ww - 6, h - 160, P[1]); box(g, wx + 3, 154, ww - 6, 1, P[0]); box(g, wx + 3, h - 7, ww - 6, 1, P[4]);
  }
  const dx = 93, dw = 64;
  box(g, dx - 1, 108, dw + 2, h - 108, INK);
  for (const k of [0, 1]) {
    const x = dx + k * (dw / 2);
    box(g, x, 109, dw / 2 - 1, h - 113, P[2]); box(g, x, 109, 2, h - 113, P[4]);
    box(g, x + 4, 113, dw / 2 - 9, 26, on ? '#E8A646' : mix(G[2], '#1C1014', 0.2)); checker(g, x + 4, 126, dw / 2 - 9, 13, on ? '#FFE4B0' : '#D8E0E8', 0, 1);
    box(g, x + 4, 144, dw / 2 - 9, 16, P[1]); box(g, x + 4, 144, dw / 2 - 9, 1, P[0]);
    box(g, x + (k ? 3 : dw / 2 - 8), 120, 3, 12, Gd[4]);
  }
  box(g, dx - 4, h - 4, dw + 8, 4, S[3]); box(g, dx - 4, h - 4, dw + 8, 1, S[5]);
  for (const bx of [46, 208]) basket(g, bx, 112);
  // (the sign off the right-hand corner on its scrolled iron bracket)
  box(g, w - 2, 18, 40, 4, INK); box(g, w - 2, 19, 40, 2, I[3]); box(g, w - 2, 19, 40, 1, I[5]);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(w, 40); g.quadraticCurveTo(w + 16, 36, w + 22, 20); g.stroke();
  g.strokeStyle = I[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(w, 40); g.quadraticCurveTo(w + 16, 36, w + 22, 20); g.stroke();
  for (const sx of [w + 9, w + 31]) { box(g, sx, 21, 1, 7, I[4]); box(g, sx - 1, 27, 3, 2, I[2]); }
  queenSign(g, w + 6, 30, 28, 38);
};
export const drawPub = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 40, b + 60)) return;
  const w = b - a, h = GY - top;
  for (const rx of [a + 26, b - 54]) {
    const [px, py] = at(v.eye, rx, top, 0.95);
    if (py >= top - 1) continue;
    c.save(); c.beginPath(); c.rect(px - 30, py - 80, 60, top - (py - 80)); c.clip(); chimney(c, px, py, 4, dimmed, Math.round(rx)); c.restore();
  }
  box3Back(c, v, { x: a, top, w, bottom: GY, col: BRICK });
  still(c, `uk-pub-${w}x${h}`, a, top, -4, -1, w + 46, h + 2, g => paintPub(g, w, h));
  lip(c, a, top, w);
};

/** A barrel (local): its staves bulging, lit down its left, shaded round its right; the iron hoops in steps. */
const barrel = (g: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  const W = ramp6(hour('#8A5A2A')), I = ramp6(hour('#3A3E44'));
  const sh: [number, number][] = [[x + 3, y], [x + w - 3, y], [x + w, y + h * 0.3], [x + w, y + h * 0.7], [x + w - 3, y + h], [x + 3, y + h], [x, y + h * 0.7], [x, y + h * 0.3]];
  poly(g, sh.map(([a, b]) => [a + (a < x + w / 2 ? -1 : 1), b] as [number, number]), INK);
  g.save(); g.beginPath(); sh.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip();
  planks(g, x, y, w, h, W, true, 11 + k, 7);
  box(g, x, y, 7, h, 'rgba(255,240,210,0.16)'); box(g, x + w - 10, y, 10, h, 'rgba(28,16,20,0.3)'); box(g, x + w - 4, y, 4, h, 'rgba(28,16,20,0.3)');
  for (const hy of [y + 3, y + h * 0.28, y + h * 0.68 - 3, y + h - 7]) { box(g, x, hy, w, 3, I[3]); box(g, x, hy, w, 1, I[5]); box(g, x, hy + 3, w, 1, I[1]); for (let rx = x + 4; rx < x + w; rx += 12) box(g, rx, hy + 1, 1, 1, I[5]); }
  g.restore();
};
export const drawBarrels = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#7A4A22' });
  still(c, `uk-barrels-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const bh = h / 2;
    for (let k = 0; k < 2; k++) barrel(g, 0, k * bh, w, bh, k);
    words(g, 'ALE', w / 2, bh + bh * 0.58, plain(1, 1, hour('#F4EFE4')));
  });
  lip(c, a, top, w);
};

/** A tea urn (set back on the cart's top): brass, stepped round, its lid and knob, the tap; two cups by it. */
const urn = (c: Ctx, x: number, y: number) => {
  const Br = ramp6(dimmed('#B07A2A')), Ch = ramp6(dimmed('#F4F1EA'));
  box(c, x - 10, y - 30, 20, 30, INK); box(c, x - 9, y - 29, 18, 29, Br[3]); box(c, x - 9, y - 29, 5, 29, Br[4]); box(c, x - 8, y - 29, 1, 29, Br[5]); box(c, x + 5, y - 29, 4, 29, Br[1]);
  box(c, x - 11, y - 33, 22, 4, INK); box(c, x - 10, y - 32, 20, 2, Br[4]); ball(c, x, y - 36, 2, dimmed('#B07A2A'), true);
  box(c, x + 9, y - 12, 6, 3, INK); box(c, x + 9, y - 11, 5, 1, Br[4]); box(c, x + 12, y - 9, 2, 3, Br[2]);
  for (const cx of [x - 20, x + 18]) { box(c, cx - 4, y - 7, 9, 7, INK); box(c, cx - 3, y - 6, 7, 6, Ch[3]); box(c, cx - 3, y - 6, 2, 6, Ch[5]); box(c, cx - 3, y - 6, 7, 1, dimmed('#6A3A1A')); box(c, cx + 4, y - 5, 2, 3, Ch[2]); box(c, cx - 5, y - 1, 11, 1, Ch[2]); }
};
/** The tea cart (a box he stands on): its painted cabinet, the gilt lining and its price, the brass rail and the push
 *  handle, the spoked wheels; the urn and cups set back on top; its board up on two brass poles off its back corners. */
export const drawTeaCart = (c: Ctx, v: View, a: number, b: number, top: number, lines: string[]) => {
  if (!onScreen(v, a - 30, b + 30)) return;
  const w = b - a, h = GY - top;
  const [ux, uy] = at(v.eye, a + w * 0.62, top, 0.95);
  if (uy < top - 1) { c.save(); c.beginPath(); c.rect(ux - 40, uy - 50, 80, top - (uy - 50)); c.clip(); urn(c, ux, uy); c.restore(); }
  box3Back(c, v, { x: a, top, w, bottom: GY - 12, col: '#E8E0C8' });
  still(c, `uk-teacart-${w}x${h}`, a, top, -14, -1, w + 18, h + 2, g => {
    const P = ramp6(hour('#2F5A3A')), Cr = ramp6(hour('#E8E0C8')), Gd = ramp6(hour(GILT)), Br = ramp6(hour('#B07A2A')), K = ramp6(hour('#2A2A2E'));
    const bh = h - 12;
    box(g, -1, 0, w + 2, bh + 1, INK); slab(g, 0, 0, w, bh, P, false);
    box(g, 6, 8, w - 12, bh - 16, Cr[3]); box(g, 6, 8, w - 12, 1, Cr[5]); box(g, 6, 8, 1, bh - 16, Cr[4]); box(g, w - 7, 8, 1, bh - 16, Cr[1]); box(g, 6, bh - 9, w - 12, 1, Cr[1]);
    box(g, 9, 11, w - 18, 1, Gd[3]); box(g, 9, bh - 12, w - 18, 1, Gd[3]); box(g, 9, 11, 1, bh - 22, Gd[3]); box(g, w - 10, 11, 1, bh - 22, Gd[3]);
    words(g, 'CUPPA', w / 2, 32, { ...GILT_LOOK(1), shadow: '#5A3A1A' });
    words(g, '$9', w / 2, 50, { ...GILT_LOOK(1), shadow: '#5A3A1A' });
    box(g, 0, 0, w, 3, Br[4]); box(g, 0, 0, w, 1, Br[5]);
    // (the push handle off its left end)
    box(g, -12, 6, 13, 3, INK); box(g, -12, 6, 13, 2, Br[4]); box(g, -13, 4, 3, 8, INK); box(g, -12, 5, 1, 6, Br[5]);
    // (the wheels: spoked, iron-tired)
    for (const wx of [16, w - 16]) {
      g.fillStyle = INK; g.beginPath(); g.arc(wx, h - 11, 12, 0, Math.PI * 2); g.fill();
      g.strokeStyle = K[3]; g.lineWidth = 2; g.beginPath(); g.arc(wx, h - 11, 10, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = Br[3]; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 8; k++) { const an = (k / 8) * Math.PI * 2; g.moveTo(wx, h - 11); g.lineTo(wx + Math.cos(an) * 9, h - 11 + Math.sin(an) * 9); } g.stroke();
      ball(g, wx, h - 11, 2, hour('#B07A2A'), true);
    }
  });
  lip(c, a, top, w);
  // (the board on its brass poles off the back corners: set back, behind where he'd stand)
  atDepth(c, v.eye, 0.96, () => {
    const Br = ramp6(hour('#B07A2A'));
    for (const px0 of [a + 6, b - 6]) post(c, px0, top - 52, top, 3, Br);
    board(c, (a + b) / 2, top - 62, lines, LOOKS.uk(1), '#7F1D1D');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// TOWER BRIDGE

/** A tower's front between the walkway and its arch (local: w x h): cut granite in courses, the corner strips, the
 *  gothic windows in tiers (paired lancets under hood moulds, lit after dark), the string courses, the arch's voussoirs
 *  along its foot. */
const paintTowerFront = (g: Ctx, w: number, h: number) => {
  const S = ramp6(hour(GRANITE)), on = lampsOn(), G = glassOf();
  box(g, -1, 0, w + 2, h + 1, INK); stoneBlocks(g, 0, 0, w, h, S, 3, 30, 14);
  box(g, 0, 0, 6, h, S[4]); box(g, 1, 0, 1, h, S[5]); box(g, w - 6, 0, 6, h, S[1]);
  for (let y = 26; y < h - 50; y += 80) {
    box(g, 2, y - 8, w - 4, 4, INK); box(g, 2, y - 7, w - 4, 2, S[4]);
    for (const lx of [w / 2 - 12, w / 2 + 2]) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(lx - 1, y + 44); g.lineTo(lx - 1, y + 6); g.lineTo(lx + 5, y - 2); g.lineTo(lx + 11, y + 6); g.lineTo(lx + 11, y + 44); g.closePath(); g.fill();
      g.fillStyle = on ? '#C88A36' : G[1]; g.beginPath(); g.moveTo(lx, y + 43); g.lineTo(lx, y + 6); g.lineTo(lx + 5, y); g.lineTo(lx + 10, y + 6); g.lineTo(lx + 10, y + 43); g.closePath(); g.fill();
      box(g, lx, y + 8, 10, 12, on ? '#E8A646' : G[2]); box(g, lx + 5, y + 2, 1, 41, S[2]); box(g, lx, y + 24, 10, 1, S[2]);
    }
    poly(g, [[w / 2 - 16, y + 4], [w / 2, y - 12], [w / 2 + 16, y + 4], [w / 2 + 14, y + 6], [w / 2, y - 9], [w / 2 - 14, y + 6]], S[4]);
    box(g, w / 2 - 15, y + 46, 30, 3, S[4]); box(g, w / 2 - 15, y + 49, 30, 1, S[1]);
  }
  for (let x = 0; x < w; x += 6) { box(g, x, h - 12, 5, 11, x % 12 ? S[2] : S[4]); box(g, x, h - 12, 5, 1, S[5]); }
  box(g, 0, h - 1, w, 1, S[0]);
};
/** The tower's top set back over the walkway level (local: foot 0, `hi` up to the walkway; 0..w across): the upper
 *  stage and its tall windows, the corner turrets and their lead caps and gilt finials, the steep slate roof between
 *  them and its little lantern and finial. */
const paintTowerTop = (g: Ctx, w: number, hi: number) => {
  const S = ramp6(dimmed(GRANITE)), Sl = ramp6(dimmed('#3A4250')), Gd = ramp6(dimmed(GILT)), on = lampsOn(), G = glassOf();
  const y0 = -hi - 6;
  box(g, 7, y0 - 60, w - 14, 62, INK); stoneBlocks(g, 8, y0 - 59, w - 16, 60, S, 9, 24, 12);
  for (const lx of [w / 2 - 14, w / 2 + 4]) { box(g, lx - 1, y0 - 50, 12, 40, INK); box(g, lx, y0 - 49, 10, 38, on ? '#C88A36' : G[1]); poly(g, [[lx - 1, y0 - 49], [lx + 5, y0 - 58], [lx + 11, y0 - 49]], INK); box(g, lx, y0 - 49, 10, 10, on ? '#E8A646' : G[2]); }
  poly(g, [[6, y0 - 60], [w / 2, y0 - 150], [w - 6, y0 - 60]], INK);
  poly(g, [[8, y0 - 61], [w / 2, y0 - 147], [w - 8, y0 - 61]], Sl[2]);
  poly(g, [[8, y0 - 61], [w / 2, y0 - 147], [w / 2 - 4, y0 - 61]], Sl[3]);
  for (let y = y0 - 140; y < y0 - 62; y += 6) { const t = (y - (y0 - 147)) / 86, hw = t * (w / 2 - 8); box(g, w / 2 - hw, y, hw * 2, 1, Sl[1]); }
  box(g, w / 2 - 6, y0 - 120, 12, 14, INK); box(g, w / 2 - 5, y0 - 119, 10, 12, on ? '#E8A646' : S[2]); box(g, w / 2 - 1, y0 - 119, 1, 12, S[1]);
  box(g, w / 2 - 1, y0 - 166, 2, 20, Gd[3]); ball(g, w / 2, y0 - 168, 3, dimmed(GILT), true);
  for (const tx of [0, w - 14]) {
    box(g, tx - 1, y0 - 91, 16, 93, INK); box(g, tx, y0 - 90, 14, 92, S[3]); box(g, tx, y0 - 90, 4, 92, S[4]); box(g, tx + 11, y0 - 90, 3, 92, S[1]);
    for (let y = y0 - 80; y < y0; y += 22) { box(g, tx + 5, y, 4, 10, on ? '#C88A36' : G[1]); box(g, tx + 5, y - 2, 4, 2, S[5]); }
    box(g, tx - 2, y0 - 94, 18, 5, INK); box(g, tx - 1, y0 - 93, 16, 3, S[4]);
    poly(g, [[tx - 2, y0 - 92], [tx + 7, y0 - 128], [tx + 16, y0 - 92]], INK); poly(g, [[tx, y0 - 93], [tx + 7, y0 - 125], [tx + 14, y0 - 93]], Sl[2]); poly(g, [[tx, y0 - 93], [tx + 7, y0 - 125], [tx + 6, y0 - 93]], Sl[4]);
    box(g, tx + 6, y0 - 136, 2, 10, Gd[3]); ball(g, tx + 7, y0 - 138, 2, dimmed(GILT), true);
  }
};
/** One of the bridge's towers: its top set back over the walkway, its faces going back, its front stamped, the lit lip
 *  at the walkway's level; under it the pointed arch (the way through), its legs set back. */
export const drawBridgeTower = (c: Ctx, v: View, a: number, b: number, hiY: number, loY: number) => {
  if (!onScreen(v, a - 40, b + 40)) return;
  const w = b - a, hi = GY - hiY, h = loY - hiY;
  facade(c, v, `uk-btop-${w}`, a - 10, w + 20, hi, g => paintTowerTop(g, w + 20, hi), 0.96, 180, 12, false);
  // (the arch's legs, set back: the way through reads open)
  const S = ramp6(dimmed(GRANITE));
  for (const [lx, side] of [[a, 1], [b - 10, -1]] as const) {
    const [p0, q0] = at(v.eye, lx, loY, 0.95), [, q1] = at(v.eye, lx, GY, 0.95);
    box(c, p0 - 1, q0, 12, q1 - q0, INK); box(c, p0, q0, 10, q1 - q0, S[2]); box(c, p0 + (side > 0 ? 0 : 7), q0, 3, q1 - q0, side > 0 ? S[4] : S[1]);
  }
  underBack(c, v.eye, a, b, loY, 1, 0.95, ramp6(dimmed(GRANITE)), 2);
  box3Back(c, v, { x: a, top: hiY, w, bottom: loY, col: GRANITE });
  still(c, `uk-btower-${w}x${h}`, a, hiY, -2, -1, w + 4, h + 2, g => paintTowerFront(g, w, h));
  lip(c, a, hiY, w);
};
/** The high walkway (its deck the ledge): the lattice girder under it (chords, the Warren truss, rivets), the deck, its
 *  handrail along the back set back. */
export const drawWalkway = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a, b)) return;
  const B = ramp6(hour(STEELBLUE));
  // (the handrail along its back, set back)
  const [pa, py] = at(v.eye, a, y, 0.95), [pb] = at(v.eye, b, y, 0.95), D = ramp6(dimmed(STEELBLUE));
  if (py < y - 1) {
    c.save(); c.beginPath(); c.rect(pa, py - 30, pb - pa, y - (py - 30)); c.clip();
    box(c, pa, py - 22, pb - pa, 3, INK); box(c, pa, py - 21, pb - pa, 1, D[4]); box(c, pa, py - 10, pb - pa, 1, D[3]);
    for (let x = a; x < b; x += 20) { const [qx] = at(v.eye, x, y, 0.95); box(c, Math.round(qx), py - 21, 2, 21, D[2]); }
    c.restore();
  }
  const gy0 = y + 8, gy1 = y + 46;
  c.lineCap = 'butt';
  for (let x = a, k = 0; x < b; x += 28, k++) {
    const pts: [number, number, number, number][] = [[x, gy0, x + 14, gy1], [x + 14, gy1, Math.min(b, x + 28), gy0]];
    for (const [x0, y0, x1, y1] of pts) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = B[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = B[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 - 1, y0); c.lineTo(x1 - 1, y1); c.stroke(); }
    box(c, x + 13, gy1 - 2, 3, 3, B[4]); box(c, x - 1, gy0, 3, 3, B[4]);
  }
  box(c, a, gy1 - 1, b - a, 6, INK); box(c, a, gy1, b - a, 4, B[2]); box(c, a, gy1, b - a, 1, B[3]); box(c, a, gy1 + 3, b - a, 1, B[0]);
  for (let x = a + 4; x < b; x += 10) box(c, x, gy1 + 1, 1, 1, B[4]);
  ledge3(c, v, a, y, b - a, '#4A6A90', 8);
};
/** A bascule (live: it lifts about its hinge at hx, `s` which way it reaches): its leaf's steel side (riveted panels,
 *  blue), the road deck's edge, the railing along its back and a lamp standard; the lit lip when it's down. */
export const drawBascule = (c: Ctx, hx: number, s: 1 | -1, ang: number, half: number, down: boolean) => {
  c.save(); c.translate(hx, GY); c.rotate(-s * ang);
  const x = s > 0 ? 0 : -half, B = ramp6(hour(STEELBLUE)), K = ramp6(hour('#3A3A40')), on = lampsOn();
  box(c, x - 1, -1, half + 2, 20, INK);
  box(c, x, 0, half, 4, K[3]); box(c, x, 3, half, 1, K[1]);
  box(c, x, 4, half, 14, B[2]); box(c, x, 4, half, 1, B[4]); box(c, x, 17, half, 1, B[0]);
  for (let px0 = x + 8; px0 < x + half - 4; px0 += 24) { box(c, px0, 5, 1, 12, B[1]); box(c, px0 + 1, 5, 1, 12, B[3]); box(c, px0 + 5, 7, 1, 1, B[5]); box(c, px0 + 5, 14, 1, 1, B[5]); box(c, px0 + 17, 7, 1, 1, B[5]); box(c, px0 + 17, 14, 1, 1, B[5]); }
  box(c, x, -16, half, 3, INK); box(c, x, -15, half, 1, B[4]); box(c, x, -8, half, 1, B[3]);
  for (let px0 = x + 6; px0 < x + half; px0 += 14) box(c, px0, -14, 2, 14, B[2]);
  const lx = x + half / 2;
  box(c, lx - 2, -42, 4, 42, INK); box(c, lx - 1, -42, 2, 42, B[3]);
  box(c, lx - 5, -52, 10, 10, INK); box(c, lx - 4, -51, 8, 8, on ? '#FFF4C8' : hour('#C8D0D8')); poly(c, [[lx - 6, -52], [lx, -58], [lx + 6, -52]], B[2]);
  if (on) steppedGlow(c, lx, -47, 16, '#FFE7A0', 0, 0.3, 3);
  if (down) lip(c, x, 0, half);
  c.restore();
  // (the hinge's pivot, over it)
  c.fillStyle = INK; c.beginPath(); c.arc(hx, GY + 8, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = hour('#4A5260'); c.beginPath(); c.arc(hx, GY + 8, 6, 0, Math.PI * 2); c.fill();
  box(c, hx - 2, GY + 5, 2, 2, hour('#9CA3AF'));
};
/** A chain (set back a touch: it hangs behind the stairs) from a tower's top down to its anchor on the bank: flat links
 *  in steps, a rivet at every joint; the anchor block of granite. */
export const drawChain = (c: Ctx, v: View, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => {
  const d = 0.97, B = ramp6(hour(STEELBLUE)), S = ramp6(dimmed(GRANITE));
  const P = (x: number, y: number) => at(v.eye, x, y, d);
  const n = 16;
  let [px, py] = P(x0, y0);
  for (let i = 1; i <= n; i++) {
    const t = i / n, qx0 = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, qy0 = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const [qx, qy] = P(qx0, qy0);
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(px, py); c.lineTo(qx, qy); c.stroke();
    c.strokeStyle = B[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(qx, qy); c.stroke();
    c.strokeStyle = B[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py - 1); c.lineTo(qx, qy - 1); c.stroke();
    box(c, qx - 2, qy - 2, 4, 4, INK); box(c, qx - 1, qy - 1, 2, 2, B[5]);
    px = qx; py = qy;
  }
  const [ax, ay] = P(x1, GY);
  box(c, ax - 13, py - 6, 26, ay - py + 6, INK); box(c, ax - 12, py - 5, 24, ay - py + 5, S[3]); box(c, ax - 12, py - 5, 24, 2, S[5]); box(c, ax + 6, py - 3, 6, ay - py + 3, S[1]);
};
/** The stairs' landings up the towers (one-way): cut stone, lit lips; the iron brackets under them. */
export const drawLanding = (c: Ctx, v: View, a: number, b: number, y: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const I = ramp6(hour(IRON));
  for (const sx of [a + 8, b - 10]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, y + 10); c.lineTo(sx + (sx < (a + b) / 2 ? 10 : -10), y + 34); c.stroke(); c.strokeStyle = I[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, y + 10); c.lineTo(sx + (sx < (a + b) / 2 ? 10 : -10), y + 34); c.stroke(); }
  ledge3(c, v, a, y, b - a, GRANITE, 10, 'stone');
};

// ---------------------------------------------------------------------------------------------------------------
// The fog, the flag, the street lamps

/** The fog machine's fog: thin banks rolling through, in stepped layers (an outer haze dithered at its edges, a body,
 *  a denser core), never thick enough to hide anybody. */
export const drawFog = (c: Ctx, a: number, b: number, x0: number, x1: number, f: number) => {
  if (b <= a) return;
  for (let band = 0; band < 3; band++) {
    const y = GY - 40 - band * 150, hgt = 70 + band * 20;
    for (let x = Math.floor(a / 16) * 16; x < b; x += 16) {
      const k = 0.5 + 0.5 * Math.sin((x + f * (0.6 + band * 0.25)) * 0.006 + band * 2), edge = Math.max(0, Math.min(1, (x - x0) / 400, (x1 - x) / 400));
      if (k * edge < 0.05) continue;
      const yy = Math.round(y + Math.sin(x * 0.01 + f * 0.01) * 10), hh = Math.round(hgt * (0.55 + 0.45 * k));
      c.globalAlpha = 0.06 * edge; c.fillStyle = '#E2E8F0'; c.fillRect(x, yy - hh / 2, 16, hh);
      c.globalAlpha = 0.07 * k * edge; c.fillRect(x, Math.round(yy - hh * 0.32), 16, Math.round(hh * 0.64));
      c.globalAlpha = 0.06 * k * edge; c.fillStyle = '#F8FAFC'; c.fillRect(x, Math.round(yy - hh * 0.16), 16, Math.round(hh * 0.32));
      c.globalAlpha = 0.08 * edge; checker(c, x, Math.round(yy - hh / 2) - 4, 16, 4, '#E2E8F0', 0, 2); checker(c, x, Math.round(yy + hh / 2), 16, 4, '#E2E8F0', 1, 2);
    }
  }
  c.globalAlpha = 1;
};
/** The Union Jack's color at u, v (0..1 across, down): the blue field, the white saltire and the red one in it, the
 *  white cross and the red cross in that. */
const jackAt = (u: number, vv: number) => {
  const W = 48, H = 30, x = u * W, y = vv * H, dg = Math.hypot(W, H);
  const d1 = Math.abs(H * x - W * y) / dg, d2 = Math.abs(H * (W - x) - W * y) / dg;
  if (Math.abs(x - W / 2) < 3 || Math.abs(y - H / 2) < 3) return '#C8102E';
  if (Math.abs(x - W / 2) < 5 || Math.abs(y - H / 2) < 5) return '#F8FAFC';
  if (d1 < 1.3 || d2 < 1.3) return '#C8102E';
  if (d1 < 3.5 || d2 < 3.5) return '#F8FAFC';
  return '#012169';
};
/** The Union Jack on its pole (world: the pole's foot at x), in stepped folds (lit on the crests, shaded in the
 *  troughs), the gilt finial. */
export const drawJack = (c: Ctx, x: number, feetY: number, h: number, f: number) => {
  const P = ramp6(hour('#9CA3AF'));
  post(c, x, feetY - h, feetY, 4, P);
  box(c, x - 5, feetY - 5, 11, 5, INK); box(c, x - 4, feetY - 5, 9, 4, P[2]); box(c, x - 4, feetY - 5, 9, 1, P[4]);
  ball(c, x, feetY - h - 4, 3, GILT);
  const fw = 48, fh = 30, top = feetY - h + 2;
  for (let i = 0; i < fw; i += 2) {
    const ph = f * 0.08 + i * 0.12, wave = Math.sin(ph) * 2 * (i / fw + 0.3), lk = Math.cos(ph), sh = lk > 0.55 ? 4 : lk < -0.55 ? 2 : 3;
    box(c, x + 2 + i, top + wave - 1, 2, fh + 2, INK);
    for (let j = 0; j < fh; j += 2) box(c, x + 2 + i, top + wave + j, 2, 2, ramp6(hour(jackAt((i + 1) / fw, (j + 1) / fh)))[sh]);
  }
};
/** A Victorian street lamp (set back): the fluted cast-iron post, its base, the lantern (lit after dark) and its crown. */
export const streetLamp = (c: Ctx, v: View, x: number, h = 170) => {
  const d = 0.97, [px, py] = at(v.eye, x, GY, d), [, ty] = at(v.eye, x, GY - h, d), I = ramp6(dimmed(IRON)), on = lampsOn();
  const X0 = Math.round(px);
  box(c, X0 - 3, ty + 12, 6, py - ty - 12, INK); box(c, X0 - 2, ty + 12, 4, py - ty - 12, I[3]); box(c, X0 - 2, ty + 12, 1, py - ty - 12, I[5]);
  box(c, X0 - 6, py - 14, 12, 14, INK); box(c, X0 - 5, py - 13, 10, 13, I[2]); box(c, X0 - 5, py - 13, 10, 1, I[4]);
  box(c, X0 - 8, ty + 10, 16, 3, INK); box(c, X0 - 7, ty + 11, 14, 1, I[4]);
  if (on) steppedGlow(c, X0, ty, 26, '#FFE7A0', 0, 0.32, 4);
  poly(c, [[X0 - 7, ty + 10], [X0 - 9, ty - 8], [X0 + 9, ty - 8], [X0 + 7, ty + 10]], INK);
  poly(c, [[X0 - 6, ty + 9], [X0 - 8, ty - 7], [X0 + 8, ty - 7], [X0 + 6, ty + 9]], on ? '#FFF4C8' : dimmed('#C8D0D8'));
  box(c, X0 - 1, ty - 7, 2, 16, I[2]); if (!on) box(c, X0 - 6, ty - 6, 2, 12, dimmed('#E8EEF2'));
  poly(c, [[X0 - 10, ty - 8], [X0, ty - 16], [X0 + 10, ty - 8]], I[3]); ball(c, X0, ty - 18, 2, dimmed(GILT), true);
};

// ---------------------------------------------------------------------------------------------------------------
// THE WORLD'S TALLEST PHONE BOX

/** A coin box (local: its middle-top at x, y): grey enamel, its slot, the A and B buttons, the return; the INSERT 10P
 *  plate over it. */
const coinBox = (g: Ctx, x: number, y: number) => {
  const M = ramp6(dimmed('#71717A')), Ch = ramp6(dimmed('#D4D4D8'));
  box(g, x - 19, y - 1, 38, 52, INK); box(g, x - 18, y, 36, 50, M[3]); box(g, x - 18, y, 36, 3, M[5]); box(g, x - 18, y, 3, 50, M[4]); box(g, x + 15, y, 3, 50, M[1]);
  box(g, x - 8, y + 8, 16, 3, INK); box(g, x - 7, y + 9, 14, 1, M[1]);
  for (const [bx, t] of [[x - 12, 'A'], [x + 3, 'B']] as const) { box(g, bx - 1, y + 15, 11, 10, INK); box(g, bx, y + 16, 9, 8, Ch[3]); box(g, bx, y + 16, 9, 1, Ch[5]); signText(g, t, bx + 5, y + 23, { sx: 1, sy: 1, fill: '#1C1917' }); }
  box(g, x - 10, y + 30, 20, 12, INK); box(g, x - 9, y + 31, 18, 10, M[1]); box(g, x - 6, y + 34, 12, 4, INK);
  box(g, x - 34, y - 26, 68, 20, INK); box(g, x - 33, y - 25, 66, 18, dimmed('#F8FAFC')); box(g, x - 33, y - 25, 66, 1, '#FFFFFF');
  for (const sx of [x - 31, x + 29]) box(g, sx, y - 23, 2, 2, M[1]);
  signText(g, 'INSERT 10P', x, y - 11, { sx: 1, sy: 2, fill: dimmed('#B91C1C'), gap: 1 });
};
/** A stack of phone books on a little shelf (local: the shelf's middle at x, y): their spines in yellow and white,
 *  stepped, a lettered band. */
const phoneBooks = (g: Ctx, x: number, y: number, n: number) => {
  const Sh = ramp6(dimmed('#44403C'));
  box(g, x - 27, y - 1, 54, 7, INK); box(g, x - 26, y, 52, 5, Sh[3]); box(g, x - 26, y, 52, 1, Sh[5]);
  for (let k = 0; k < n; k++) {
    const w = 40 - (k % 2) * 4, by = y - (k + 1) * 9, R = ramp6(dimmed(k % 3 === 1 ? '#E7E5E4' : '#FACC15')), dx = (k % 2) * 3 - 1;
    box(g, x - w / 2 - 1 + dx, by - 1, w + 2, 10, INK); box(g, x - w / 2 + dx, by, w, 8, R[3]); box(g, x - w / 2 + dx, by, w, 1, R[5]); box(g, x - w / 2 + dx, by + 7, w, 1, R[1]);
    box(g, x - w / 2 + 4 + dx, by + 3, w - 8, 2, dimmed('#A16207')); box(g, x + w / 2 - 6 + dx, by + 1, 3, 6, R[1]);
  }
};
/** Calling cards taped up round (x, y) (local): each its own color, a line or two of print, a strip of tape. */
const cards = (g: Ctx, x: number, y: number, seed: number) => {
  for (let k = 0; k < 6; k++) {
    const hh = (n: number) => hash(n * 7.13 + 1.7);
    const px0 = Math.round(x + (hh(seed + k) - 0.5) * 70), py0 = Math.round(y - (hh(seed + k + 9) - 0.5) * 60);
    const C = ramp6(dimmed(['#F472B6', '#FDE68A', '#F8FAFC', '#A78BFA', '#FCA5A5'][Math.floor(hh(seed + k * 3) * 5)]));
    box(g, px0 - 8, py0 - 6, 16, 11, INK); box(g, px0 - 7, py0 - 5, 14, 9, C[3]); box(g, px0 - 7, py0 - 5, 14, 1, C[5]); box(g, px0 - 7, py0 + 3, 14, 1, C[1]);
    box(g, px0 - 5, py0 - 2, 8, 1, dimmed('#52525B')); box(g, px0 - 5, py0 + 1, 10, 1, dimmed('#52525B'));
    if (k % 2) box(g, px0 + 2, py0 - 4, 4, 3, dimmed('#DC2626'));
    box(g, px0 - 3, py0 - 7, 6, 3, mix(dimmed('#F5F5F4'), '#FFFFFF', 0.2)); box(g, px0 - 3, py0 - 7, 6, 1, '#FFFFFF');
  }
};
/** The back of the box seen from inside (local: its left foot at 0, 0; w across, h up): the red glazing frame, the panes
 *  up the whole height (the sky by the hour through them, banded, glinting), and what's on it: the coin boxes and
 *  their plates, the phone books, the calling cards taped up everywhere. `at(rx, h)` the bits' places. */
export const paintBoxBack = (g: Ctx, w: number, h: number, bits: { coins: [number, number][]; books: [number, number, number][]; cards: [number, number, number][] }) => {
  const R = ramp6(dimmed('#7F1D1D')), G = glassOf();
  box(g, -1, -h - 1, w + 2, h + 1, INK); slab(g, 0, -h, w, h, R, false);
  const gx0 = 34, gx1 = w - 34, cw = (gx1 - gx0) / 3;
  for (let y = -h + 40; y < -60; y += 52) for (let k = 0; k < 3; k++) {
    const px0 = Math.round(gx0 + k * cw + 5), pw = Math.round(cw - 10), t = (y + h) / h;
    const sky = mix(skyAt(Math.max(0.05, 0.85 - (1 - t) * 0.8)), G[1], 0.35);
    box(g, px0 - 1, y - 1, pw + 2, 46, INK); box(g, px0, y, pw, 44, mix(sky, '#1C1014', 0.25)); box(g, px0, y, pw, 3, mix(R[1], INK, 0.3));
    box(g, px0, y + 3, pw, 14, mix(sky, '#FFFFFF', 0.08)); checker(g, px0, y + 17, pw, 2, mix(sky, '#FFFFFF', 0.08), 0, 1);
    if ((k + Math.round(y / 52)) % 3 === 0) poly(g, [[px0 + 8, y], [px0 + 18, y], [px0 + 4, y + 44], [px0, y + 44], [px0, y + 30]], 'rgba(255,255,255,0.1)');
    box(g, px0 + 1, y + 1, 1, 42, mix(sky, '#FFFFFF', 0.3));
  }
  for (let k = 0; k <= 3; k++) { const bx = Math.round(gx0 + k * cw - 5); box(g, bx, -h, 10, h, R[3]); box(g, bx, -h, 2, h, R[4]); box(g, bx + 8, -h, 2, h, R[1]); }
  for (const [rx, hh] of bits.coins) coinBox(g, rx, -hh);
  for (const [rx, hh, n] of bits.books) phoneBooks(g, rx, -hh, n);
  for (const [rx, hh, s] of bits.cards) cards(g, rx, -hh, s);
};
/** A wall of the box (its red cast iron: a pillar between the floors, beaded down its edges, fluted, riveted; local w x h). */
const paintPillar = (g: Ctx, w: number, h: number) => {
  const R = ramp6(hour(PILLAR));
  box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, R, false);
  box(g, 0, 0, 2, h, R[5]); box(g, 2, 0, 2, h, R[4]); box(g, w - 3, 0, 3, h, R[1]);
  box(g, Math.round(w / 2) - 1, 0, 1, h, R[2]); box(g, Math.round(w / 2), 0, 1, h, R[4]);
  for (let y = 10; y < h; y += 40) { box(g, 5, y, 2, 2, R[5]); box(g, w - 7, y, 2, 2, R[5]); box(g, 0, y + 20, w, 2, R[2]); box(g, 0, y + 20, w, 1, R[4]); }
};
/** A wall of the box (world: x a..b, from `top` down to `bottom`): its faces going back, its front stamped; the lit lip
 *  only where he can stand on it. */
export const drawBoxWall = (c: Ctx, v: View, a: number, b: number, top: number, bottom: number, standable: boolean) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = bottom - top;
  box3Back(c, v, { x: a, top, w, bottom, col: PILLAR });
  still(c, `uk-pillar-${w}x${Math.round(h)}`, a, top, -2, -1, w + 4, h + 2, g => paintPillar(g, w, Math.round(h)));
  if (standable) lip(c, a, top, w);
};
/** The crown over the box (local: its left foot at 0, 0; W across): the red frame, the opal TELEPHONE fascia lit from
 *  inside, the cornice in steps, the domed roof (banded, its ribs), the gilt crown on top. */
const paintBoxCrown = (g: Ctx, W: number) => {
  const R = ramp6(hour(PILLAR)), Gd = ramp6(hour(GILT)), on = lampsOn();
  box(g, 5, -57, W - 10, 58, INK); box(g, 6, -56, W - 12, 56, R[3]); box(g, 6, -56, W - 12, 3, R[5]); box(g, 6, -56, 4, 56, R[4]); box(g, W - 10, -56, 4, 56, R[1]); box(g, 6, -4, W - 12, 4, R[1]);
  box(g, 18, -47, W - 36, 36, INK); box(g, 19, -46, W - 38, 34, on ? '#FFF8E0' : '#F4F1EA'); box(g, 19, -46, W - 38, 2, '#FFFFFF'); box(g, 19, -16, W - 38, 4, on ? '#F2E4B8' : '#DCD8CE');
  signText(g, 'TELEPHONE', W / 2, -18, { sx: 2, sy: 3, fill: '#111827', bold: true, gap: 1 });
  box(g, 0, -67, W, 11, INK); box(g, 1, -66, W - 2, 9, R[3]); box(g, 1, -66, W - 2, 2, R[5]); box(g, 1, -59, W - 2, 2, R[1]);
  const mid = W / 2, top = -67;
  for (let k = 0; k < 6; k++) {
    const hw = (W / 2 - 6) * Math.cos((k / 6) * Math.PI / 2), y = top - (k + 1) * 20;
    box(g, mid - hw - 1, y - 1, hw * 2 + 2, 22, INK);
  }
  for (let k = 0; k < 6; k++) {
    const hw = (W / 2 - 6) * Math.cos((k / 6) * Math.PI / 2), y = top - (k + 1) * 20, col = R[k % 2 ? 3 : 2];
    box(g, mid - hw, y, hw * 2, 20, col); box(g, mid - hw, y, hw * 2, 2, R[4]); box(g, mid - hw, y, Math.max(4, hw * 0.4), 20, mix(col, R[4], 0.5)); box(g, mid + hw * 0.7, y, hw * 0.3, 20, R[1]);
    checker(g, mid - hw, y + 18, hw * 2, 2, R[1], 0, 1);
  }
  for (const rx of [-0.5, 0, 0.5]) box(g, mid + rx * (W / 2 - 20) - 1, top - 120, 2, 120, R[1]);
  const ky = top - 120;
  crown(g, mid, ky - 2, Gd, 3);
};
export const drawBoxCrown = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 40, b + 40)) return;
  const W = b - a + 52;
  if (lampsOn()) steppedGlow(c, (a + b) / 2, top - 30, 180, '#FFF4D8', 0, 0.12, 4);
  still(c, `uk-boxcrown-${W}`, a - 26, top, -4, -230, W + 8, 232, g => paintBoxCrown(g, W));
};
/** The smashed panes in the far wall (the way out): the frame's broken glazing bar hanging, the glass left in its
 *  corners in jagged shards (glinting). */
export const drawSmashedPanes = (c: Ctx, wx: number, gy0: number, gy1: number) => {
  const R = ramp6(hour(PILLAR));
  box(c, wx, gy0, 20, 7, INK); box(c, wx, gy0, 20, 6, R[2]); box(c, wx, gy0, 20, 1, R[4]);
  box(c, wx, gy1 - 7, 20, 7, INK); box(c, wx, gy1 - 6, 20, 6, R[2]); box(c, wx, gy1 - 6, 20, 1, R[4]);
  c.save(); c.translate(wx + 10, gy0 + 6); c.rotate(0.35); box(c, -3, 0, 6, 40, INK); box(c, -2, 0, 4, 38, R[3]); box(c, -2, 0, 1, 38, R[5]); c.restore();
  box(c, wx + 7, gy1 - 24, 6, 18, R[2]); box(c, wx + 7, gy1 - 24, 6, 1, INK);
  c.globalAlpha = 0.75;
  for (const [sx, sy, dd] of [[wx + 1, gy0 + 6, 1], [wx + 13, gy0 + 6, 1], [wx + 1, gy1 - 6, -1], [wx + 13, gy1 - 6, -1]] as const) {
    poly(c, [[sx, sy], [sx + 6, sy], [sx + 4, sy + dd * 10], [sx + 2, sy + dd * 26], [sx + 1, sy + dd * 12]], '#93C5FD');
    poly(c, [[sx + 2, sy], [sx + 6, sy], [sx + 5, sy + dd * 14]], '#E0F2FE');
  }
  c.globalAlpha = 1;
};
/** A floor up inside the box (one-way): plank decking (the lit lip) on red iron brackets out of whichever wall holds it. */
export const drawBoxFloor = (c: Ctx, v: View, a: number, b: number, y: number, thick: number, wallSide: -1 | 1 | 0) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const R = ramp6(hour(PILLAR));
  const brace = (sx: number, dir: number) => { for (const [col, lw] of [[INK, 5], [R[2], 3], [R[4], 1]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(sx, y + thick + 26); c.lineTo(sx + dir * 30, y + thick); c.stroke(); } };
  if (wallSide < 0) brace(a, 1); else if (wallSide > 0) brace(b, -1);
  ledge3(c, v, a, y, b - a, '#8A5A3A', thick, 'plank');
};
/** A molding round the outside of the box (one-way: the sill, the moldings down its outside): cast red iron in an ogee,
 *  stepped, the lit lip. */
export const drawMolding = (c: Ctx, v: View, a: number, b: number, y: number, thick: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const R = ramp6(hour(PILLAR));
  ledge3(c, v, a, y, b - a, PILLAR, thick);
  box(c, a, y + 4, b - a, 1, R[5]); box(c, a, y + Math.round(thick * 0.55), b - a, 2, R[2]); box(c, a, y + thick - 3, b - a, 2, R[1]);
  lip(c, a, y, b - a);
};
/** The wall phone up top (live: it rattles, it rings): its backboard, the two chrome bells and the clapper, the bakelite
 *  box (stepped, its sheen), the dial and its finger holes, the empty cradle (it's off the hook). `jig` shakes it,
 *  `clap` swings the clapper. */
export const drawWallPhone = (c: Ctx, cx: number, py: number, jig: number, clap: number) => {
  const px = cx + jig, Ch = ramp6(hour('#D4D4D8')), K = ramp6('#2A2A30'), Wd = ramp6(dimmed('#5A3A22'));
  box(c, cx - 65, py - 51, 130, 102, INK); box(c, cx - 64, py - 50, 128, 100, Wd[3]); box(c, cx - 64, py - 50, 128, 2, Wd[5]); box(c, cx - 64, py + 46, 128, 4, Wd[1]);
  for (const sx of [cx - 58, cx + 56]) for (const sy of [py - 44, py + 42]) box(c, sx, sy, 3, 3, Wd[1]);
  for (const s of [-1, 1]) {
    const bx = px + s * 26, by = py - 42;
    c.fillStyle = INK; c.beginPath(); c.arc(bx, by, 19, Math.PI, 0); c.fill();
    c.fillStyle = Ch[2]; c.beginPath(); c.arc(bx, by, 17, Math.PI, 0); c.fill();
    c.fillStyle = Ch[3]; c.beginPath(); c.arc(bx - 2, by, 13, Math.PI, 0); c.fill();
    c.fillStyle = Ch[4]; c.beginPath(); c.arc(bx - 5, by - 2, 7, Math.PI, 0); c.fill();
    box(c, bx - 8, by - 12, 3, 3, '#FFFFFF');
  }
  box(c, px - 2, py - 52, 4, 14, INK); box(c, px - 1, py - 52, 2, 13, Ch[3]);
  box(c, px + clap * 0.5 - 4, py - 58, 8, 8, INK); box(c, px + clap * 0.5 - 3, py - 57, 6, 6, Ch[4]);
  box(c, px - 46, py - 41, 92, 82, INK); box(c, px - 45, py - 40, 90, 80, K[3]); box(c, px - 45, py - 40, 90, 3, K[5]); box(c, px - 45, py - 40, 4, 80, K[4]); box(c, px + 41, py - 40, 4, 80, K[1]); box(c, px - 45, py + 36, 90, 4, K[1]);
  c.fillStyle = INK; c.beginPath(); c.arc(px, py, 25, 0, Math.PI * 2); c.fill();
  c.fillStyle = Ch[3]; c.beginPath(); c.arc(px, py, 23, 0, Math.PI * 2); c.fill();
  c.fillStyle = Ch[4]; c.beginPath(); c.arc(px - 3, py - 3, 17, Math.PI, Math.PI * 1.5); c.lineTo(px, py); c.fill();
  for (let k = 0; k < 10; k++) { const a = -2.2 + (k / 10) * Math.PI * 1.6; c.fillStyle = INK; c.beginPath(); c.arc(px + Math.cos(a) * 15, py + Math.sin(a) * 15, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = K[2]; c.beginPath(); c.arc(px + Math.cos(a) * 15 + 1, py + Math.sin(a) * 15 + 1, 2, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = INK; c.beginPath(); c.arc(px, py, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F4F1EA'; c.beginPath(); c.arc(px, py, 6, 0, Math.PI * 2); c.fill();
  signText(c, '999', px, py + 3, { sx: 1, sy: 1, fill: '#B91C1C', gap: 0 });
  box(c, px + 18, py + 2, 12, 3, Ch[1]); box(c, px + 28, py - 2, 4, 9, Ch[2]);
  box(c, px + 37, py - 51, 6, 13, INK); box(c, px + 38, py - 50, 4, 11, K[4]); box(c, px + 51, py - 51, 6, 13, INK); box(c, px + 52, py - 50, 4, 11, K[4]);
  box(c, px + 35, py - 41, 26, 7, INK); box(c, px + 36, py - 40, 24, 5, K[3]); box(c, px + 36, py - 40, 24, 1, K[5]);
};
/** The handset (live, its middle at 0, 0 in its own swung frame): bakelite in steps (the handle, its sheen band, the ear
 *  and mouth cups hanging off its ends, their grilles). */
export const drawHandset = (c: Ctx) => {
  const K = ramp6('#2A2A30');
  box(c, -33, -15, 66, 15, INK); box(c, -32, -14, 64, 13, K[3]); box(c, -32, -14, 64, 3, K[5]); box(c, -32, -11, 64, 2, K[4]); box(c, -32, -4, 64, 3, K[1]);
  for (const s of [-1, 1]) {
    const x0 = s * 22 - 12;
    box(c, x0, -3, 24, 26, INK); box(c, x0 + 1, -2, 22, 24, K[3]); box(c, x0 + 1, -2, 4, 24, K[4]); box(c, x0 + 19, -2, 4, 24, K[1]);
    box(c, x0 + 3, 18, 18, 4, K[2]); box(c, x0 + 3, 18, 18, 1, K[4]);
    for (let k = 0; k < 4; k++) box(c, x0 + 5 + k * 4, 19, 2, 2, INK);
    box(c, x0 + 2, 0, 2, 14, K[5]);
  }
};
/** The coiled cord from (ax, ay) to (bx, by): ink under the coils, the cord's gray, a lit fiber. */
export const coil = (c: Ctx, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = Math.round(len / 7);
  for (const [w, col, off] of [[5, INK, 0], [3, '#3F3F46', 0], [1, '#8A8A92', -1]] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath();
    for (let k = 0; k <= n * 4; k++) { const s = k / (n * 4), o = Math.sin(s * n * Math.PI * 2) * 5; const x = ax + dx * s + nx * o + off, y = ay + dy * s + ny * o + off; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
  }
};
/** The ring going out (live): stepped rings of sound (a bright one, dimmer ones in behind it), little bell strokes on it. */
export const drawRing = (c: Ctx, x: number, y: number, r: number, k: number) => {
  for (const [dr, w, col, a] of [[0, 6, '#FDE68A', 1], [-10, 3, '#FEF9C3', 0.7], [-20, 2, '#FDE68A', 0.45]] as const) {
    if (r + dr <= 1) continue;
    c.globalAlpha = (1 - k) * a; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(x, y, r + dr, 0, Math.PI * 2); c.stroke();
  }
  c.globalAlpha = 1 - k;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + k; box(c, x + Math.cos(a) * (r + 6) - 2, y + Math.sin(a) * (r + 6) - 2, 4, 4, '#FFFFFF'); }
  c.globalAlpha = 1;
};
/** A Victorian gothic hall (local: its left foot at 0, 0; w x h): cut stone, buttresses and their pinnacles, tall
 *  pointed windows with their tracery (lit after dark), a crenellated parapet. (No clock: no tower.) */
const paintHall = (g: Ctx, w: number, h: number) => {
  const S = ramp6(dimmed('#C8B98E')), on = lampsOn(), G = glassOf();
  box(g, -1, -h - 1, w + 2, h + 1, INK); stoneBlocks(g, 0, -h, w, h, S, 61, 30, 12);
  for (let x = 0; x <= w; x += 52) {
    box(g, x - 5, -h - 18, 10, h + 18, INK); box(g, x - 4, -h - 17, 8, h + 17, S[3]); box(g, x - 4, -h - 17, 2, h + 17, S[5]); box(g, x + 2, -h - 17, 2, h + 17, S[1]);
    poly(g, [[x - 5, -h - 18], [x, -h - 34], [x + 5, -h - 18]], INK); poly(g, [[x - 4, -h - 18], [x, -h - 32], [x + 4, -h - 18]], S[4]);
  }
  for (let x = 2; x < w - 2; x += 8) { box(g, x, -h - 8, 5, 8, S[3]); box(g, x, -h - 8, 5, 1, S[5]); }
  for (let wx = 14; wx < w - 30; wx += 52) {
    const ww = 24;
    g.fillStyle = INK; g.beginPath(); g.moveTo(wx - 1, -50); g.lineTo(wx - 1, -170); g.lineTo(wx + ww / 2, -190); g.lineTo(wx + ww + 1, -170); g.lineTo(wx + ww + 1, -50); g.closePath(); g.fill();
    g.fillStyle = on ? '#C88A36' : G[1]; g.beginPath(); g.moveTo(wx, -51); g.lineTo(wx, -170); g.lineTo(wx + ww / 2, -188); g.lineTo(wx + ww, -170); g.lineTo(wx + ww, -51); g.closePath(); g.fill();
    box(g, wx, -170, ww, 40, on ? '#E8A646' : G[2]);
    box(g, wx + ww / 2, -186, 1, 136, S[2]);
    for (const yy of [-90, -130]) box(g, wx, yy, ww, 2, S[2]);
    g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.arc(wx + ww / 2, -170, 6, 0, Math.PI * 2); g.stroke();
    box(g, wx - 3, -48, ww + 6, 3, S[4]);
  }
  box(g, 0, -40, w, 40, S[2]); box(g, 0, -40, w, 2, S[4]);
  const dx = w / 2 - 18;
  g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 2, 0); g.lineTo(dx - 2, -40); g.lineTo(dx + 18, -60); g.lineTo(dx + 38, -40); g.lineTo(dx + 38, 0); g.closePath(); g.fill();
  g.fillStyle = on ? '#6A3E12' : '#1C1014'; g.beginPath(); g.moveTo(dx, 0); g.lineTo(dx, -40); g.lineTo(dx + 18, -58); g.lineTo(dx + 36, -40); g.lineTo(dx + 36, 0); g.closePath(); g.fill();
};
export const drawHall = (c: Ctx, v: View, x: number, w: number, h: number) => facade(c, v, `uk-hall-${w}x${h}`, x, w, h, g => paintHall(g, w, h), 0.9, 40, 10, false);

void hash; void words; void board;
