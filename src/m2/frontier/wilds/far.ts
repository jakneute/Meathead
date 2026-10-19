// The wilds' far off (screen space; the backdrop), back to front, each layer on its own ground with the haze over its
// feet, each painted once for the hour into a tile and slid along:
//
//   the big western sky by the hour (banded, the sun and moon, the stars after dark) and its drifting cumulus;
//   the REAL Rockies a long way off, past the park's fence (snow on the peaks, gullies, the timber up their flanks): the
//     real wilderness out there, where the land ends up;
//   the PARK's painted mountains, nearer: plywood flats, the peaks painted on too blue and too pink, the snow brushed on
//     with its drips, the raw ply along their cut edges, 2x4 braces and sandbags behind, a light stand, a stencil on one;
//   two rows of pines between (stepped tiers, the light down their left flanks), a fire lookout, and one "pine" that's
//     a cell tower in a fake-bough costume.
//
// No volcanoes anywhere.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { type RangeLook, range, mist, snap2, wave, jag, fillUnder, wrapAt } from '../../adventure/farArt';
import { type Ctx, box, checker, mix, hash, stamp, bandedGradient, hazeBands, pixelBlob, INK, FAR, NEEDLE, PLY, STEEL } from './paint';
import { signText } from '../../signLetters';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** The frontier's sky, top to horizon: a deep western blue down to a warm dusty band. */
const SKY = ['#1C4AA8', '#2E62C0', '#4C82D2', '#7AA6DE', '#B4CEE6', '#E6DCC0'];

/** Where the ground strip's far edge sits on screen (the far layers stand on it; it moves as the camera climbs). */
export const groundLine = (state: GameState) => {
  const eyeS = CANVAS_HEIGHT * 0.42;
  return eyeS + (GY - state.camera.y - eyeS) * FAR;
};

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  for (let x = -((off % tw) + tw) % tw; x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `${key}-${fontIn()}`, 0, 0, tw, h, paint); c.restore(); }
};

/** A far layer's color for the hour, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A48', 0.18), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.88, tod), k);
const lookOf = (T: (c: string) => string, base: string): RangeLook => ({ body: T(base), lit: T(mix(base, '#F4ECD8', 0.28)), hi: T(mix(base, '#FFFFFF', 0.45)), shade: T(mix(base, '#141A30', 0.22)), deep: T(mix(base, '#141A30', 0.38)) });

// ---------------------------------------------------------------------------------------------------------------
// Clouds: big stepped cumulus, lit from the upper left, flat bottoms

export const CW = 1100, CH = 130;
export const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#9AA8C0', '#C2CCDC', '#E4EAF2', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 6; i++) {
    const cx = 80 + i * (CW / 6) + hash(i * 3.1) * 60, base = 70 + hash(i * 1.7) * 44, w = 90 + hash(i * 2.3) * 110;
    wrapAt(CW, cx, x => {
      // (lumps along a flat bottom, the biggest in the middle)
      const n = 5 + Math.floor(hash(i) * 3);
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.7) * w * 0.2; pixelBlob(g, x - w / 2 + u * w, base - r * 0.6, r, r * 0.8, C[1]); }
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = (0.5 + Math.sin(u * Math.PI) * 0.7) * w * 0.2; pixelBlob(g, x - w / 2 + u * w - r * 0.2, base - r * 0.8, r * 0.75, r * 0.6, C[2]); pixelBlob(g, x - w / 2 + u * w - r * 0.35, base - r * 1.0, r * 0.38, r * 0.3, C[3]); }
      box(g, x - w / 2, base - 4, w, 6, C[0]); checker(g, x - w / 2, base - 6, w, 2, C[0]);
    }, 200);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The real Rockies, far off (past the park's fence: the real thing)

export const TW = 1024, MH = 230;
const mtnY = (x: number) => snap2(MH - 150 + wave(x, TW, 2.2) * 50 + jag(x, TW, 8, 3) * 10 - Math.max(0, wave(x, TW, 5.1, 2)) * 26);
export const paintRockies = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.5), L = lookOf(T, '#7E88A8');
  range(g, TW, mtnY, MH, L, 7, { gullies: 34, d: 14, forest: [T('#3E5A5A'), T('#56706A')], forestY: x => MH - 54 + wave(x, TW, 4.4, 2) * 10 });
  // (the snow: down from every peak above the snowline, ragged at its foot, lit up the left flanks, blue in the shade)
  const snowLine = MH - 120;
  const S = [T('#9AA8C8'), T('#C8D2E6'), T('#F2F6FC')];
  for (let x = 0; x < TW; x += 2) {
    const y = mtnY(x);
    if (y >= snowLine) continue;
    const foot = snowLine - 8 + jag(x, TW, 6, 11) * 26 + wave(x, TW, 9.3, 3) * 10;
    if (foot <= y) continue;
    const lit = mtnY(x + 4) < y || (mtnY(x + 4) === y && mtnY(x - 4) > y);
    box(g, x, y, 2, foot - y, lit ? S[2] : S[0]);
    if (lit) box(g, x, y + (foot - y) * 0.6, 2, (foot - y) * 0.4, S[1]);
    if ((x >> 1) % 3 === 0) box(g, x, foot, 2, 4 + hash(x) * 8, S[0]);
  }
  mist(g, TW, MH - 90, 90, skyAt(0.92, tod), 0, 0.55, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// The park's painted mountains: plywood flats

export const PW = 1400, PH = 200;
/** One flat's outline (a peak or two painted on a cut sheet), local to its left foot. */
const flatPeaks = (w: number, h: number, seed: number) => {
  const pts: [number, number][] = [[0, 0]];
  const n = 5 + Math.floor(hash(seed) * 3);
  for (let i = 1; i < n; i++) {
    const u = i / n, peak = Math.sin(u * Math.PI) * (0.6 + hash(seed + i) * 0.4);
    pts.push([snap2(u * w), snap2(-h * (0.35 + peak * 0.65) + (i % 2 ? 0 : h * 0.22))]);
  }
  pts.push([w, 0]);
  return pts;
};
export const paintFlats = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3);
  // (the painted colors: the park's, too blue, too pink in the light; the snow brushed on)
  const P = [T('#3A3C7A'), T('#4E56A0'), T('#6A78C2'), T('#9AA4DC'), T('#D4A0B8')];
  const SN = [T('#B8C4E8'), T('#E8EEFA'), T('#FFFFFF')];
  const BR = PLY.map(T), ST = STEEL.map(T);
  const flats: [number, number, number][] = [[20, 300, 150], [260, 360, 186], [560, 280, 140], [760, 340, 176], [1040, 300, 160]];
  flats.forEach(([fx, fw, fh], i) => {
    const foot = PH, pts = flatPeaks(fw, fh, i * 7 + 3).map(([x, y]) => [fx + x, foot + y] as [number, number]);
    // (behind it first: 2x4 braces from its back down to the ground, sandbags on their feet; they show past its ends)
    for (const bx of [fx + fw * 0.2, fx + fw * 0.55, fx + fw * 0.85]) {
      g.strokeStyle = BR[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, foot - fh * 0.5); g.lineTo(bx + 34, foot); g.stroke();
      g.strokeStyle = BR[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 1, foot - fh * 0.5); g.lineTo(bx + 33, foot); g.stroke();
      box(g, bx + 26, foot - 6, 16, 6, T('#8A7A5A')); box(g, bx + 27, foot - 6, 14, 2, T('#B0A07A'));
    }
    // (its raw edge: the ply showing along the cut, offset a pixel right and down: the sheet's thickness)
    g.fillStyle = BR[4]; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x + 3, y + 1) : g.moveTo(x + 3, y + 1))); g.closePath(); g.fill();
    g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x + 1, y - 1) : g.moveTo(x + 1, y - 1))); g.closePath(); g.fill();
    // (the paint: banded down, darker at the foot; the lit flanks painted on as brush strokes; the snow with drips)
    g.save(); g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    bandedGradient(g, fx, foot - fh - 4, fw, fh + 4, [P[3], P[2], P[2], P[1], P[0]], 6);
    for (let k = 1; k < pts.length - 1; k++) {
      const [px, py] = pts[k];
      if (pts[k - 1][1] > py && pts[k + 1][1] > py) {
        // (a painted lit flank: diagonal strokes down the left of the peak)
        for (let s = 0; s < 9; s++) { g.strokeStyle = s % 2 ? P[3] : P[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(px - 2 - s * 3, py + 4 + s * 5); g.lineTo(px - 20 - s * 7, py + 36 + s * 9); g.stroke(); }
        // (the snow: a cap painted on, its drips running)
        g.fillStyle = SN[1]; g.beginPath(); g.moveTo(px - 30, py + 34); g.lineTo(px, py - 2); g.lineTo(px + 26, py + 30); g.lineTo(px + 14, py + 24); g.lineTo(px + 4, py + 34); g.lineTo(px - 10, py + 26); g.closePath(); g.fill();
        g.fillStyle = SN[2]; g.beginPath(); g.moveTo(px - 26, py + 30); g.lineTo(px - 1, py); g.lineTo(px - 6, py + 22); g.closePath(); g.fill();
        for (let d = 0; d < 4; d++) box(g, px - 20 + d * 12, py + 28, 2, 6 + hash(i + d * 3) * 10, SN[0]);
      }
    }
    // (painted pines along its foot: little triangles, too regular, the park's)
    for (let tx = fx + 6; tx < fx + fw - 6; tx += 12) { const th = 16 + ((tx * 7) % 9); g.fillStyle = T('#1E3A30'); g.beginPath(); g.moveTo(tx, foot - th - 14); g.lineTo(tx + 6, foot - 14); g.lineTo(tx - 6, foot - 14); g.closePath(); g.fill(); box(g, tx - 1, foot - 16, 1, th - 2, T('#2E5040')); }
    box(g, fx, foot - 16, fw, 16, T('#1E3A30'));
    g.restore();
    // (a stencil on one: the park's inventory number, the way scenery gets marked)
    if (i === 2) signText(g, 'SCENIC FLAT 12', fx + fw / 2, foot - 24, { sx: 1, sy: 1, fill: T('#2A2E5A') });
  });
  // (a light stand: a steel pole on its tripod, a lamp head on a crossbar, aimed at the flats)
  const lx = 1300;
  box(g, lx, PH - 150, 3, 150, ST[3]); box(g, lx, PH - 150, 1, 150, ST[5]);
  g.strokeStyle = ST[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(lx + 1, PH - 30); g.lineTo(lx - 18, PH); g.moveTo(lx + 1, PH - 30); g.lineTo(lx + 20, PH); g.stroke();
  box(g, lx - 16, PH - 154, 36, 3, ST[3]);
  for (const hx of [lx - 16, lx + 10]) { box(g, hx, PH - 164, 10, 10, INK); box(g, hx + 1, PH - 163, 8, 8, ST[2]); box(g, hx + 1, PH - 163, 8, 2, ST[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The pines between (two rows), the lookout, the cell tower in its costume

/** A row of stepped conifers along the tile, their feet at `foot`. */
const pineRow = (g: Ctx, tw: number, foot: number, hMin: number, hMax: number, R: string[], seed: number, gap: number) => {
  for (let x = -20, i = 0; x < tw + 20; x += gap * (0.6 + hash(seed + i * 1.3) * 0.7), i++) {
    const h = hMin + hash(seed + i * 2.7) * (hMax - hMin), w = h * (0.32 + hash(seed + i) * 0.1);
    wrapAt(tw, x, xx => {
      const tiers = Math.max(3, Math.round(h / 12));
      for (let k = 0; k < tiers; k++) {
        const t = (k + 1) / tiers, y0 = foot - h + (k * h * 0.86) / tiers, y1 = y0 + h / tiers + 6, half = 3 + w * 0.5 * t;
        g.fillStyle = R[0]; g.beginPath(); g.moveTo(xx, y0 - 1); g.lineTo(xx + half + 1, y1 + 1); g.lineTo(xx - half - 1, y1 + 1); g.closePath(); g.fill();
        g.fillStyle = R[1]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx + half, y1); g.lineTo(xx - half, y1); g.closePath(); g.fill();
        g.fillStyle = R[2]; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx - half, y1); g.lineTo(xx - half * 0.3, y1); g.closePath(); g.fill();
        if (half > 6) checker(g, xx - half * 0.6, y1 - 3, half * 0.5, 2, R[2], k % 2);
      }
      box(g, xx - 1, foot - 6, 2, 6, R[0]);
    }, 40);
  }
};
export const RW1 = 900, RH1 = 120, RW2 = 1000, RH2 = 160;
export const paintPines1 = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.32), R = [T('#0E2018'), T('#1C3A2C'), T('#2E5442')];
  pineRow(g, RW1, RH1, 44, 84, R, 3, 22);
  fillUnder(g, RW1, () => RH1 - 4, RH1, R[1]);
  // (a fire lookout on its tall timber legs, a cab up top with windows all round)
  const lx = 610, top = RH1 - 118;
  for (const dx of [-12, 12]) { box(g, lx + dx - 1, top + 20, 2, 98, T('#3A2C22')); }
  g.strokeStyle = T('#3A2C22'); g.lineWidth = 1; g.beginPath(); for (let y = top + 24; y < RH1 - 10; y += 16) { g.moveTo(lx - 12, y); g.lineTo(lx + 12, y + 16); g.moveTo(lx + 12, y); g.lineTo(lx - 12, y + 16); } g.stroke();
  box(g, lx - 15, top + 6, 30, 14, T('#5A4636')); box(g, lx - 13, top + 9, 26, 6, tod.lamps > 0.3 ? '#F2C870' : T('#A8C0D0'));
  g.fillStyle = T('#3A2C22'); g.beginPath(); g.moveTo(lx - 18, top + 6); g.lineTo(lx, top - 4); g.lineTo(lx + 18, top + 6); g.closePath(); g.fill();
  mist(g, RW1, RH1 - 60, 60, skyAt(0.92, tod), 0, 0.45, 5);
};
export const paintPines2 = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.14), R = NEEDLE.slice(1, 4).map(T);
  pineRow(g, RW2, RH2, 70, 130, [T(NEEDLE[0]), R[0], R[2]], 17, 30);
  // (the cell tower, in a fake-bough costume: a steel trunk too straight, the boughs too even, the antenna panels in
  // among the top ones)
  const cx = 300, base = RH2, ht = 150;
  box(g, cx - 2, base - ht, 4, ht, T('#5A5048')); box(g, cx - 2, base - ht, 1, ht, T('#8A8070'));
  for (let k = 0; k < 9; k++) { const y = base - ht + 8 + k * 14, half = 8 + k * 3.4; box(g, cx - half, y, half * 2, 3, T('#2E5040')); box(g, cx - half, y, half, 1, T('#4A7058')); box(g, cx - half, y + 3, half * 2, 1, T('#14281E')); }
  for (const [dx, dy] of [[-10, 24], [7, 24], [-2, 38]] as const) { box(g, cx + dx, base - ht + dy, 4, 12, T('#C8CCD0')); box(g, cx + dx, base - ht + dy, 1, 12, T('#F0F2F4')); }
  fillUnder(g, RW2, () => RH2 - 8, RH2, R[0]);
  mist(g, RW2, RH2 - 50, 50, skyAt(0.92, tod), 0, 0.28, 4);
};

// ---------------------------------------------------------------------------------------------------------------

export const drawFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame, gl = Math.round(groundLine(state));
  const hz = gl - 6;
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: hz, sun: [610, 110], moon: [170, 80], t: f, scroll: cam * 0.01 });
  tile(c, `fw-cloud-${tod.key}`, cam * 0.012 + f * 0.05, 26 + (gl - 426) * 0.15, CH, CW, g => paintClouds(g, tod));
  // (the dust along the horizon)
  hazeBands(c, 0, hz - 150, W, 150, hourMix('#E6D2A8', '#E8A878', '#2A2E4A', tod), 0, 0.22, 6);
  tile(c, `fw-rockies-${tod.key}`, cam * 0.018 + 200, gl - MH + 8 - (gl - 426) * 0.4, MH, TW, g => paintRockies(g, tod));
  tile(c, `fw-flats-${tod.key}`, cam * 0.06 + 500, gl - PH + 20 - (gl - 426) * 0.25, PH, PW, g => paintFlats(g, tod));
  hazeBands(c, 0, gl - 60, W, 60, skyAt(0.94, tod), 0, 0.2, 4);
  tile(c, `fw-pines1-${tod.key}`, cam * 0.12 + 140, gl - RH1 + 16 - (gl - 426) * 0.12, RH1, RW1, g => paintPines1(g, tod));
  tile(c, `fw-pines2-${tod.key}`, cam * 0.22 + 60, gl - RH2 + 22, RH2, RW2, g => paintPines2(g, tod));
  // (under it, down to the bottom: the forest floor going back, banded darker nearer)
  const T = farCol(tod, 0.08);
  if (gl + 20 < H) bandedGradient(c, 0, gl + 20, W, H - gl - 20, [T('#1C3418'), T('#182C14'), T('#142412'), T('#101C0E')], 5);
  return true;
};
