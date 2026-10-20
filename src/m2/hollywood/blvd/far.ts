// The boulevard's far off (screen space; the backdrop): the sky by the hour (banded, LA's smog lying brown along the
// horizon), the mountains far off past the basin, the HAPPYWOOD hill in front of them on its own foothills (its letters
// on their scaffold legs, the second O fallen and lying down the slope, the radio mast blinking), the foothills with
// houses up them, the city's sprawl in the haze (downtown's towers, the tall skinny palms over the rooftops, billboards),
// the studio lot (the soundstages with their numbers, the water tower, the offices, a painted sky backdrop propped up on
// its 2x4s), THRONES OF THE STARS rising out of the lot toward the end, and the row of palms along the far side of the
// next street over, their billboards. Each layer stands on its own ground with the haze lying over its feet; each is
// painted once for the hour into a tile and slid along.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { type RangeLook, range, mist, snap2, wave, jag, palm as farPalm, fillUnder } from '../../adventure/farArt';
import { type Ctx, INK, box, checker, mix, hash, stamp, poly, bandedGradient, hazeBands, pixelBlob, signText, words, plain, deco } from './kit';
import { hillside } from '../../hub/letters';
import { HWX } from '../geometry';
import { drawHwSky, drawHwHorizon, drawHwLandmarks } from '../landmarks';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down a little as the camera climbs). */
export const horizonY = (state: GameState) => 430 - Math.min(0, state.camera.y) * 0.12;

/** The boulevard's own sky, top to horizon: a washed blue down into LA's smog, brown-gold at the bottom. */
const SKY = ['#2E5CB0', '#4676C2', '#6C92C8', '#9CAEC2', '#C6BC9E', '#DEBE8A'];

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');

/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  for (let x = -((((off) % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `${key}-${fontIn()}`, 0, 0, tw, h, paint); c.restore(); }
};
/** Something at tile x, and again a tile over if it's near an edge. */
const wrap = (tw: number, x: number, draw: (x: number) => void, reach = 240) => { draw(x); if (x < reach) draw(x + tw); if (x > tw - reach) draw(x - tw); };

/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A70', 0.2), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.86, tod), k);
const rampF = (T: (c: string) => string, base: string) => [mix(base, INK, 0.55), mix(base, INK, 0.3), base, mix(base, '#FFFFFF', 0.22), mix(base, '#FFFFFF', 0.45)].map(T);
const lookOf = (T: (c: string) => string, base: string): RangeLook => ({ body: T(base), lit: T(mix(base, '#F4E8D0', 0.26)), hi: T(mix(base, '#FFFFFF', 0.4)), shade: T(mix(base, '#1C1430', 0.2)), deep: T(mix(base, '#1C1430', 0.34)) });
/** A lit window, or the glass by day. */
const winCol = (tod: TimeOfDay, T: (c: string) => string, i: number) => (tod.lamps > 0.3 && hash(i * 1.7) > 0.45 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : T('#3A4258'));

// ---------------------------------------------------------------------------------------------------------------
// The mountains past the basin; the foothills

const TW = 1024;
const MH = 200;
const mtnY = (x: number) => snap2(MH - 132 + wave(x, TW, 1.3) * 34 + jag(x, TW, 10, 2) * 8);
const paintMountains = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.52), haze = skyAt(0.9, tod);
  range(g, TW, mtnY, MH, lookOf(T, '#8E8CB2'), 4, { gullies: 30, d: 16 });
  mist(g, TW, 40, MH - 40, haze, 0, 0.6, 6);
};
const FH = 110;
const footY = (x: number) => snap2(FH - 62 + wave(x, TW, 4.1, 2) * 12 + jag(x, TW, 6, 5) * 3);
const paintFoothills = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.34), haze = skyAt(0.9, tod), L = lookOf(T, '#8A8A6A');
  range(g, TW, footY, FH, L, 11, { gullies: 18, d: 10, forest: [T('#5E6A46'), T('#7A8A58')], forestY: x => footY(x) + 16 + wave(x, TW, 2.2, 3) * 5 });
  // (houses up the slopes: white boxes, red tile roofs, their windows lit after dark; a road zigzagging up)
  for (let i = 0; i < 46; i++) {
    const x = snap2(hash(i * 2.9 + 1) * TW), y = footY(x) + 6 + hash(i * 4.3) * 24;
    if (y > FH - 10) continue;
    box(g, x, y, 5, 3, T('#E8E0D0')); box(g, x - 1, y - 1, 7, 1, T('#B8604A'));
    if (tod.lamps > 0.3 && hash(i) > 0.4) box(g, x + 1, y + 1, 1, 1, '#FFD88A');
  }
  mist(g, TW, FH - 50, 50, haze, 0, 0.55, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// THE HAPPYWOOD HILL (a landmark: painted once, where it is; its foot under the foothills)

const HW = 620, HHT = 250;
const hillY = (x: number) => {
  // (a lumpy ridge: the summit left of middle, a shoulder to the right, falling away either end)
  const u = x / HW, base = Math.sin(Math.PI * u) ** 0.8;
  return snap2(HHT - (base * 190 + Math.sin(u * 9.4 + 1) * 10 + Math.max(0, 1 - Math.abs(u - 0.42) * 6) * 26) - (hash(Math.floor(x / 6)) - 0.5) * 4);
};
const paintHill = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.26), L = lookOf(T, '#9A8458');
  // (the hill: chaparral in steps, lit up its left flanks, gullies, scrub in lumps, a fire road zigzagging up it)
  range(g, HW, hillY, HHT + 10, L, 21, { gullies: 16, d: 14 });
  const scrub = [T('#4E5A34'), T('#66743E'), T('#86904E')];
  for (let i = 0; i < 160; i++) {
    const x = hash(i * 1.37) * HW, top = hillY(x), y = top + 8 + hash(i * 2.11) * (HHT - top);
    if (y > HHT) continue;
    const r = 2 + hash(i * 3.3) * 3;
    pixelBlob(g, x, y, r, r * 0.7, scrub[0]); pixelBlob(g, x - 1, y - 1, r * 0.6, r * 0.4, scrub[(i % 2) + 1]);
  }
  g.strokeStyle = T('#C8B088'); g.lineWidth = 2; g.beginPath();
  const road: [number, number][] = [[HW * 0.78, HHT], [HW * 0.6, HHT - 40], [HW * 0.74, HHT - 80], [HW * 0.55, HHT - 120], [HW * 0.47, HHT - 170]];
  road.forEach(([x, y], i) => (i ? g.lineTo(x, Math.max(y, hillY(x) + 6)) : g.moveTo(x, y)));
  g.stroke();
  // (the radio mast on the summit, guyed, its beacon (live: drawn after))
  const mx = HW * 0.42, mt = hillY(mx);
  box(g, mx - 1, mt - 54, 2, 54, T('#4A4E5A')); for (let y = mt - 50; y < mt; y += 6) box(g, mx - 2, y, 4, 1, T('#6A6E7A'));
  g.strokeStyle = T('#6A6E7A'); g.lineWidth = 1; g.beginPath(); g.moveTo(mx, mt - 40); g.lineTo(mx - 24, mt + 6); g.moveTo(mx, mt - 40); g.lineTo(mx + 26, mt + 8); g.stroke();
  // The letters, on their scaffold legs along the slope under the crest (white panels, a shade under each); the second
  // O fallen on its side, lying down the slope below its gap, its legs sticking up bare
  const Lk = hillside({ sx: 3, sy: 5 }, T('#FAF6EE'), T('#A49E92'));
  const word = 'HAPPYWOOD', step = 22, left = HW * 0.5 - (step * word.length) / 2;
  for (let i = 0; i < word.length; i++) {
    const lx = left + i * step + step / 2, base = Math.max(hillY(lx - 8), hillY(lx + 8)) + 46;
    // (the legs behind each panel, down into the scrub)
    for (const dx of [-6, 0, 6]) box(g, lx + dx - 1, base - 30, 2, 40, T('#5A5048'));
    box(g, lx - 9, base - 18, 18, 1, T('#5A5048'));
    if (i === 7) continue;
    signText(g, word[i], lx, base, Lk);
    box(g, lx - 8, base, 16, 2, T('#4E4434'));
  }
  const fx = left + 7 * step + step / 2 + 14, fy = hillY(left + 7 * step + 4) + 84;
  g.save(); g.translate(fx, fy); g.rotate(1.25); signText(g, 'O', 0, 0, Lk); g.restore();
  box(g, fx - 14, fy + 6, 26, 2, T('#4E4434'));
  // (its foot: into the haze)
  mist(g, HW, HHT - 60, 70, skyAt(0.9, tod), 0, 0.5, 5);
};
const drawHill = (c: Ctx, x: number, foot: number, f: number) => {
  const tod = timeOfDay();
  c.save(); c.translate(Math.round(x - HW / 2), Math.round(foot - HHT));
  stamp(c, `hb-hill-${tod.key}-${fontIn()}`, -4, -80, HW + 8, HHT + 90, g => paintHill(g, tod));
  c.restore();
  // (the mast's beacon, blinking)
  if ((f >> 5) % 2 === 0) { const mx = x - HW / 2 + HW * 0.42, my = foot - HHT + hillY(HW * 0.42) - 56; box(c, mx - 1, my, 3, 3, tod.lamps > 0.25 ? '#FF4A4A' : '#C83A3A'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The city in the haze

const CH = 180, CG = 14;
const paintCity = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.42), f = CH - CG;
  const cols = ['#B8A898', '#C8B8A0', '#A8A0A0', '#D0C0A8', '#9A9AA8'];
  // (downtown, once: a cluster of towers in the haze, the tallest with its helipad; the rest low sprawl)
  const dx = 640;
  [[0, 34, 112], [30, 26, 150], [52, 22, 96], [70, 30, 128], [96, 20, 84], [-26, 22, 76], [114, 18, 66]].forEach(([ox, w, h], i) => {
    const R = rampF(T, cols[i % cols.length]), x = dx + ox;
    box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 3, h, R[3]); box(g, x + w - 4, f - h, 4, h, R[1]);
    for (let y = f - h + 6; y < f - 6; y += 6) for (let wx = x + 4; wx < x + w - 5; wx += 4) box(g, wx, y, 2, 2, winCol(tod, T, wx * 3 + y));
    box(g, x - 1, f - h - 2, w + 2, 2, R[4]);
    if (i === 1) { box(g, x + 6, f - h - 6, w - 12, 4, R[1]); box(g, x + w / 2, f - h - 22, 1, 16, R[0]); if (tod.lamps > 0.25) box(g, x + w / 2 - 1, f - h - 24, 3, 2, '#FF5A5A'); }
  });
  // (the sprawl: low blocks shoulder to shoulder, flat roofs with their tanks and signs)
  for (let x = 0, i = 0; x < TW; i++) {
    const w = 18 + hash(i * 1.9) * 34, h = 12 + hash(i * 3.7) * 34;
    if (x > dx - 44 && x < dx + 140) { x += w; continue; }
    const R = rampF(T, cols[i % cols.length]);
    box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 2, h, R[3]); box(g, x + w - 3, f - h, 3, h, R[1]);
    box(g, x, f - h, w, 1, R[4]);
    for (let y = f - h + 5; y < f - 4; y += 6) for (let wx = x + 3; wx < x + w - 4; wx += 5) box(g, wx, y, 2, 2, winCol(tod, T, wx + y * 7));
    if (hash(i * 5.1) > 0.7) { box(g, x + w * 0.3, f - h - 6, 6, 6, R[1]); box(g, x + w * 0.3 + 1, f - h - 7, 4, 1, R[3]); }
    x += w + (hash(i * 7.3) > 0.8 ? 6 : 0);
  }
  // (billboards on poles over the rooftops)
  for (const [bx, col] of [[120, '#EAB516'], [430, '#B4243A'], [880, '#3A6AB8']] as const) {
    box(g, bx + 10, f - 60, 2, 30, T('#3A3438'));
    box(g, bx - 1, f - 75, 30, 17, T('#2A2428')); box(g, bx, f - 74, 28, 15, T(col)); box(g, bx, f - 74, 28, 2, T(mix(col, '#FFFFFF', 0.4)));
  }
  // (the tall skinny palms, sticking up over it all)
  for (let i = 0; i < 16; i++) {
    const x = snap2(hash(i * 4.7 + 3) * TW), h = 70 + hash(i * 2.3) * 46;
    wrap(TW, x, xx => farPalm(g, xx, f, h, (hash(i) - 0.5) * 8, [T('#4A3A30'), T('#7A6450')], [T('#2E3A26'), T('#46563A'), T('#62744A')], i), 30);
  }
  // (its ground: the basin's floor, banded)
  box(g, 0, f, TW, CG, T('#8A8070')); box(g, 0, f, TW, 1, T('#A89C88')); checker(g, 0, f + 4, TW, 2, T('#7A7062'));
  mist(g, TW, 30, CH - 30, skyAt(0.9, tod), 0, 0.5, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// The studio lot: the soundstages, the water tower, the offices, the painted sky

const SH = 230, SG = 22, LW = 1800;
type Lot = (g: Ctx, T: (c: string) => string, tod: TimeOfDay, x: number, f: number, i: number) => number;
/** A soundstage: a big barn of corrugated steel under a low gable, its number painted big in a circle, the elephant
 *  door, a stair up its side, the AC units on the roof. Returns its width. */
const soundstage = (n: number): Lot => (g, T, tod, x, f, i) => {
  const w = 150 + hash(i * 2.2) * 50, h = 96 + hash(i * 3.3) * 28;
  const R = rampF(T, ['#C8BCA8', '#B8B0A4', '#D2C4AA'][i % 3]);
  // (the roof: a low gable, lit up its left slope, its ridge vents)
  poly(g, [[x - 5, f - h + 1], [x + w / 2, f - h - 20], [x + w + 5, f - h + 1]], INK);
  poly(g, [[x - 3, f - h], [x + w / 2, f - h - 18], [x + w / 2, f - h]], R[3]);
  poly(g, [[x + w / 2, f - h - 18], [x + w + 3, f - h], [x + w / 2, f - h]], R[1]);
  for (let k = 0; k < 4; k++) { const vx = x + w * 0.2 + k * w * 0.18; box(g, vx, f - h - 6 - Math.min(k, 3 - k) * 5, 8, 6, R[0]); box(g, vx, f - h - 6 - Math.min(k, 3 - k) * 5, 8, 1, R[3]); }
  // (the walls: corrugated, banded across the ribs, lit down the left, grimy at the foot)
  box(g, x - 1, f - h, w + 2, h, INK);
  box(g, x, f - h, w, h, R[2]);
  for (let rx = x + 2; rx < x + w; rx += 4) box(g, rx, f - h, 1, h, R[1]);
  box(g, x, f - h, 4, h, R[3]); box(g, x + w - 6, f - h, 6, h, R[1]); checker(g, x + w - 10, f - h, 4, h, R[1], 0, 2);
  box(g, x, f - 10, w, 10, R[1]); checker(g, x, f - 14, w, 4, R[1], 1, 2);
  // (its number, painted big in a circle)
  const cx = x + w * 0.28, cy = f - h + 34;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#D8D0C2'); g.beginPath(); g.arc(cx + 2, cy + 2, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4EEE2'); g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fill();
  signText(g, String(n), cx, cy + 7, plain(2, 2, T('#2A2228')));
  // (the elephant door: tall, ribbed, a little door cut in it, a red light over it: SHOOTING)
  const dx = x + w * 0.52, dw = Math.min(56, w * 0.32), dh = Math.min(h - 16, 74);
  box(g, dx - 1, f - dh - 1, dw + 2, dh + 1, INK); box(g, dx, f - dh, dw, dh, R[1]);
  for (let y = f - dh + 4; y < f; y += 5) box(g, dx, y, dw, 1, R[0]);
  box(g, dx, f - dh, dw, 2, R[3]);
  box(g, dx + dw - 14, f - 22, 10, 22, R[0]);
  box(g, dx + dw / 2 - 3, f - dh - 7, 6, 4, INK); box(g, dx + dw / 2 - 2, f - dh - 6, 4, 2, hash(i * 9.9) > 0.5 ? '#E84A4A' : T('#6A2A2A'));
  // (the stair up its side: a zigzag of landings)
  g.strokeStyle = T('#3A3438'); g.lineWidth = 1; g.beginPath();
  const sx = x + w - 22;
  for (let k = 0; k < 3; k++) { const y0 = f - k * 28; g.moveTo(sx + (k % 2 ? 14 : 0), y0); g.lineTo(sx + (k % 2 ? 0 : 14), y0 - 28); }
  g.stroke();
  for (let k = 1; k < 4; k++) box(g, sx - 2, f - k * 28, 18, 2, T('#3A3438'));
  // (lit windows high up its end after dark)
  if (tod.lamps > 0.3) for (let k = 0; k < 3; k++) if (hash(i * 4 + k) > 0.4) box(g, x + 10 + k * 8, f - h + 8, 4, 3, '#FFD88A');
  return w;
};
const waterTower: Lot = (g, T, tod, x, f, i) => {
  // (a tank of riveted steel on six legs, cross braced, its conical cap and finial; HAPPYWOOD on it)
  const w = 74, top = f - 190, tank = 58, R = rampF(T, '#C8D0D8');
  for (const lx of [x + 8, x + 24, x + 50, x + 66]) { box(g, lx - 1, top + tank, 3, f - top - tank, INK); box(g, lx, top + tank, 1, f - top - tank, R[3]); }
  g.strokeStyle = T('#4A4E58'); g.lineWidth = 1; g.beginPath();
  for (let y = top + tank; y < f - 20; y += 34) { g.moveTo(x + 8, y); g.lineTo(x + 66, y + 34); g.moveTo(x + 66, y); g.lineTo(x + 8, y + 34); }
  g.stroke();
  box(g, x - 1, top - 1, w + 2, tank + 2, INK);
  for (let k = 0; k < w; k++) { const u = k / w; box(g, x + k, top, 1, tank, u < 0.12 ? R[2] : u < 0.36 ? R[4] : u < 0.55 ? R[3] : u < 0.82 ? R[2] : R[1]); }
  for (let y = top + 8; y < top + tank; y += 10) box(g, x, y, w, 1, R[1]);
  poly(g, [[x - 4, top + 1], [x + w / 2, top - 26], [x + w + 4, top + 1]], INK);
  poly(g, [[x - 2, top], [x + w / 2, top - 24], [x + w / 2, top]], R[3]); poly(g, [[x + w / 2, top - 24], [x + w + 2, top], [x + w / 2, top]], R[1]);
  box(g, x + w / 2 - 1, top - 34, 2, 10, R[0]); box(g, x + w / 2 - 2, top - 36, 4, 3, R[4]);
  box(g, x - 4, top + tank, w + 8, 3, INK); box(g, x - 3, top + tank, w + 6, 2, R[2]);
  signText(g, 'HAPPYWOOD', x + w / 2, top + 28, plain(1, 2, T('#B4243A')));
  signText(g, 'STUDIOS', x + w / 2, top + 44, plain(1, 1, T('#2A2228')));
  if (tod.lamps > 0.25) box(g, x + w / 2 - 1, top - 38, 3, 2, '#FF5A5A');
  void i;
  return w;
};
const offices: Lot = (g, T, tod, x, f, i) => {
  // (the studio offices: a stucco block with arched windows, a tile roof, its name in deco letters on the parapet)
  const w = 130, h = 80, R = rampF(T, '#E2D2B4'), Rr = rampF(T, '#B8603E');
  box(g, x - 1, f - h - 1, w + 2, h + 1, INK);
  box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 3, h, R[3]); box(g, x + w - 4, f - h, 4, h, R[1]);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) {
    const wx = x + 8 + k * 17, wy = f - h + 12 + r * 22;
    box(g, wx, wy, 8, 12, INK); box(g, wx + 1, wy + 1, 6, 11, winCol(tod, T, i * 50 + r * 7 + k)); box(g, wx + 1, wy, 6, 2, R[1]);
  }
  box(g, x - 4, f - h - 6, w + 8, 7, INK); box(g, x - 3, f - h - 5, w + 6, 5, Rr[2]); for (let k = x - 3; k < x + w + 3; k += 4) box(g, k, f - h - 5, 2, 5, Rr[3]);
  box(g, x + 20, f - h - 18, w - 40, 12, INK); box(g, x + 21, f - h - 17, w - 42, 10, T('#1C1014'));
  signText(g, 'HAPPYWOOD PICTURES', x + w / 2, f - h - 9, plain(1, 1, T('#E8C25A')));
  return w;
};
const paintedSky: Lot = (g, T, _tod, x, f) => {
  // (a painted sky backdrop, a flat of plywood on its 2x4 braces: blue with clouds, a seam down it, peeling)
  const w = 160, h = 110;
  g.strokeStyle = T('#80562A'); g.lineWidth = 2; g.beginPath();
  for (let k = 0; k < 4; k++) { g.moveTo(x + 20 + k * 40, f - h + 10); g.lineTo(x + 34 + k * 40, f); }
  g.stroke();
  box(g, x - 1, f - h - 1, w + 2, h - 8, INK);
  bandedGradient(g, x, f - h, w, h - 10, [T('#4A82D0'), T('#7AA6DA'), T('#B4CCE2')], 5);
  for (const [cx, cy, r] of [[x + 40, f - h + 30, 16], [x + 110, f - h + 50, 20], [x + 70, f - h + 70, 12]]) { pixelBlob(g, cx, cy, r, r * 0.5, T('#F2F4F8')); pixelBlob(g, cx - 4, cy - 3, r * 0.6, r * 0.3, T('#FFFFFF')); }
  box(g, x + w / 2, f - h, 1, h - 10, T('#3A5A8A'));
  box(g, x + w - 20, f - h + 6, 14, 10, T('#C8A878'));
  return w;
};
const LOT_PIECES: Lot[] = [soundstage(3), offices, soundstage(7), waterTower, soundstage(12), paintedSky, soundstage(14), soundstage(9)];
const paintLot = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.2), f = SH - SG;
  // (light towers between: lattice masts with a bank of lamps up top)
  const tower = (x: number) => {
    box(g, x - 1, f - 150, 3, 150, T('#3A3438'));
    g.strokeStyle = T('#4A4448'); g.lineWidth = 1; g.beginPath(); for (let y = f - 146; y < f; y += 10) { g.moveTo(x - 3, y); g.lineTo(x + 3, y + 10); } g.stroke();
    box(g, x - 9, f - 160, 19, 10, INK); for (let k = 0; k < 3; k++) box(g, x - 8 + k * 6, f - 159, 5, 8, tod.lamps > 0.3 ? '#FFF2C8' : T('#C8C8B8'));
  };
  let x = 10;
  LOT_PIECES.forEach((p, i) => { if (x > LW - 210) return; const w = p(g, T, tod, x, f, i); if (i % 3 === 1) tower(x + w + 12); x += w + 26 + hash(i * 6.1) * 20; });
  // (the lot's ground: asphalt, its parking lines, a fence along the near edge)
  box(g, 0, f, LW, SG, T('#6A6466')); box(g, 0, f, LW, 1, T('#8A8486'));
  for (let k = 0; k < LW; k += 22) box(g, k, f + 6, 1, 8, T('#B8B2A8'));
  for (let k = 0; k < LW; k += 6) box(g, k, f + SG - 9, 1, 8, T('#4A4446'));
  box(g, 0, f + SG - 10, LW, 1, T('#5A5456'));
  mist(g, LW, f - 60, 60, skyAt(0.9, tod), 0, 0.3, 4);
  mist(g, LW, f, SG, skyAt(0.9, tod), 0.25, 0.1, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The palms along the next street over, its rooftops and billboards

const PW = 1536, PH = 270, PG = 26;
const paintPalms = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.12), f = PH - PG;
  // (the rooftops behind: one and two storeys, parapets, a billboard up on a few)
  for (let x = 0, i = 0; x < PW; i++) {
    const w = 60 + hash(i * 2.7) * 80, h = 34 + hash(i * 1.3) * 40, R = rampF(T, ['#C2A88A', '#B49890', '#CCB494', '#A89C94'][i % 4]);
    box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 3, h, R[3]); box(g, x + w - 4, f - h, 4, h, R[1]);
    box(g, x - 1, f - h - 3, w + 2, 4, R[1]); box(g, x - 1, f - h - 3, w + 2, 1, R[2]);
    for (let k = x + 8; k < x + w - 12; k += 14) { box(g, k, f - h + 10, 6, 8, winCol(tod, T, k + i)); box(g, k, f - h + 10, 6, 1, R[1]); }
    x += w;
  }
  const bill = (x: number, y: number, w: number, h: number, paintFace: () => void) => {
    // (a billboard on its steel frame and legs, its catwalk under it, its lamps over it)
    for (const lx of [x + 12, x + w - 14]) { box(g, lx - 1, y + h, 3, f - y - h, INK); box(g, lx, y + h, 1, f - y - h, T('#6A6E78')); }
    g.strokeStyle = T('#4A4E58'); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 12, y + h); g.lineTo(x + w - 14, f - 6); g.moveTo(x + w - 14, y + h); g.lineTo(x + 12, f - 6); g.stroke();
    box(g, x - 2, y - 2, w + 4, h + 4, INK);
    paintFace();
    box(g, x - 4, y + h + 2, w + 8, 2, T('#3A3E48'));
    for (let k = x + 10; k < x + w; k += 30) { box(g, k, y - 8, 1, 6, T('#3A3E48')); box(g, k - 2, y - 9, 5, 2, tod.lamps > 0.3 ? '#FFF2C8' : T('#5A5E68')); }
  };
  // STUNTMAN STEVE (yellow, his face, his thumb), REVENGERS 15 (COMING SOON), HAPPYWOOD (THE STUDIO TOUR)
  bill(200, f - 150, 150, 56, () => {
    box(g, 200, f - 150, 150, 56, T('#EAB516')); box(g, 200, f - 150, 150, 3, T('#FFF08A')); box(g, 200, f - 98, 150, 4, T('#C08A10'));
    box(g, 212, f - 144, 30, 40, T('#E2B48C')); box(g, 208, f - 148, 38, 10, T('#8A5A2A')); box(g, 240, f - 140, 8, 30, T('#8A5A2A'));
    box(g, 214, f - 132, 26, 4, T('#2A2228')); box(g, 216, f - 120, 22, 3, T('#6A4020')); box(g, 216, f - 120, 3, 8, T('#6A4020')); box(g, 235, f - 120, 3, 8, T('#6A4020'));
    box(g, 210, f - 108, 34, 5, T('#F4F0E8'));
    signText(g, 'STUNTMAN STEVE', 296, f - 128, plain(1, 2, T('#2A1408')));
    signText(g, 'LIVE! DAILY!', 296, f - 110, plain(1, 1, T('#B4243A')));
  });
  bill(760, f - 140, 160, 52, () => {
    bandedGradient(g, 760, f - 140, 160, 52, [T('#1E2A6A'), T('#2E3E8A'), T('#4A2A6A')], 4);
    for (let k = 0; k < 5; k++) { const hx = 776 + k * 30; box(g, hx, f - 116, 12, 26, T(['#B4243A', '#3A6AB8', '#2A8A4A', '#8A3AB8', '#C8962E'][k])); box(g, hx + 2, f - 126, 8, 9, T('#D8A880')); }
    signText(g, 'REVENGERS 15', 840, f - 124, plain(1, 2, T('#FAD43A')));
    signText(g, 'RESEMBLE. SOON.', 840, f - 94, plain(1, 1, T('#F4F0E8')));
  });
  bill(1240, f - 136, 140, 50, () => {
    box(g, 1240, f - 136, 140, 50, T('#F4EEE2')); box(g, 1240, f - 136, 140, 3, T('#FFFFFF'));
    signText(g, 'HAPPYWOOD', 1310, f - 112, plain(2, 2, T('#B4243A')));
    signText(g, 'THE STUDIO TOUR', 1310, f - 96, plain(1, 1, T('#2A2228')));
  });
  // (the palms: tall, skinny, leaning a little, their skirts of dead fronds, every so far along the street)
  for (let i = 0; i < 14; i++) {
    const x = snap2(40 + i * (PW / 14) + (hash(i * 3.3) - 0.5) * 40), h = 170 + hash(i * 7.7) * 70;
    wrap(PW, x, xx => streetPalm(g, xx, f + 4, h, (hash(i * 1.1) - 0.5) * 18, T, i), 60);
  }
  // (the far sidewalk, a low wall, the street lamps along it)
  box(g, 0, f, PW, PG, T('#9A9086')); box(g, 0, f, PW, 2, T('#BAB0A4')); checker(g, 0, f + 8, PW, 2, T('#8A8076'));
  box(g, 0, f - 8, PW, 8, T('#A89A8A')); box(g, 0, f - 8, PW, 1, T('#C2B4A2'));
  for (let x = 30; x < PW; x += 120) { box(g, x, f - 56, 2, 52, T('#2A2E2E')); box(g, x - 3, f - 60, 8, 5, INK); box(g, x - 2, f - 59, 6, 3, tod.lamps > 0.3 ? '#FFE8A8' : T('#C8C0A8')); }
  mist(g, PW, f - 120, 120, skyAt(0.92, tod), 0, 0.16, 4);
};
/** A street palm (Washingtonia): a tall banded trunk, its skirt of dead fronds, a head of fan fronds; in steps. */
export const streetPalm = (g: Ctx, x: number, foot: number, h: number, lean: number, T: (c: string) => string, seed: number) => {
  const tr = [T('#3A2A1E'), T('#5A4430'), T('#7A6048'), T('#9A7E62')];
  for (let k = 0; k < h; k += 2) {
    const t = k / h, px = Math.round(x + lean * t * t), w = t < 0.1 ? 6 : 4;
    box(g, px - 1, foot - k - 2, w + 2, 2, INK);
    box(g, px, foot - k - 2, w, 2, (k >> 1) % 4 === 0 ? tr[1] : tr[2]);
    box(g, px, foot - k - 2, 1, 2, tr[3]);
  }
  const tx = Math.round(x + lean) + 2, ty = foot - h;
  // (the skirt: dead fronds hanging down the top of the trunk)
  for (let k = 0; k < 14; k++) { const sx = tx - 7 + k, len = 10 + hash(seed * 3 + k) * 8; box(g, sx, ty + 2, 1, len, k % 3 ? T('#7A6448') : T('#5A4834')); }
  // (the head: fan fronds out round it, drooping, lit up top)
  const F = [T('#24361E'), T('#3A5428'), T('#567238'), T('#7A9448')];
  for (let k = 0; k < 11; k++) {
    const a = Math.PI + (k / 10) * Math.PI + (hash(seed + k) - 0.5) * 0.3, len = 18 + hash(seed * 7 + k) * 8;
    for (let s = 0; s < len; s += 2) {
      const u = s / len, xx = Math.round(tx + Math.cos(a) * s), yy = Math.round(ty + Math.sin(a) * s * 0.7 + u * u * 10);
      box(g, xx - 1, yy, 3, 2, Math.sin(a) < -0.6 ? F[3] : u < 0.5 ? F[2] : F[1]);
      if (s % 4 === 0) box(g, xx, yy + 2, 2, 2, F[0]);
    }
  }
  box(g, tx - 3, ty - 2, 6, 5, F[0]); box(g, tx - 2, ty - 2, 3, 2, F[2]);
};

// ---------------------------------------------------------------------------------------------------------------
// The coaster far off

/**
 * THRONES OF THE STARS far off (screen space): its legs (steel lattice, braced), the lift hill, loops getting smaller
 * (the suicide run), a corkscrew; the track inked, its rails lit along the top; `k` its scale (bigger the nearer),
 * `col` its steel for the hour.
 */
export const farCoaster = (c: Ctx, sx: number, base: number, k: number, col: string) => {
  const lt = mix(col, '#FFFFFF', 0.35), dk = mix(col, INK, 0.45);
  const track = (path: () => void, w = 3) => {
    c.lineCap = 'butt'; c.lineJoin = 'round';
    c.strokeStyle = INK; c.lineWidth = Math.max(2, (w + 2) * k); c.beginPath(); path(); c.stroke();
    c.strokeStyle = col; c.lineWidth = Math.max(1, w * k); c.beginPath(); path(); c.stroke();
    c.strokeStyle = lt; c.lineWidth = Math.max(1, w * k * 0.35); c.save(); c.translate(-k * 0.6, -k * 0.8); c.beginPath(); path(); c.stroke(); c.restore();
  };
  // (the legs: lattice towers, banded, cross-braced)
  for (let i = 0; i < 9; i++) {
    const lx = sx + (i - 4) * 70 * k, top = base - (120 + (i % 3) * 90) * k, lw = Math.max(2, 8 * k);
    box(c, lx - lw / 2 - 1, top, lw + 2, base - top, INK);
    box(c, lx - lw / 2, top, lw, base - top, dk); box(c, lx - lw / 2, top, Math.max(1, lw * 0.35), base - top, col);
    if (k > 0.5) { c.strokeStyle = dk; c.lineWidth = 1; c.beginPath(); for (let y = top + 10 * k; y < base; y += 22 * k) { c.moveTo(lx - lw / 2, y); c.lineTo(lx + lw / 2, y + 11 * k); } c.stroke(); }
  }
  // (the lift hill, its chain up the middle; the loops, getting smaller (the suicide run); a corkscrew)
  track(() => { c.moveTo(sx - 330 * k, base - 40 * k); c.lineTo(sx - 200 * k, base - 380 * k); c.quadraticCurveTo(sx - 150 * k, base - 420 * k, sx - 110 * k, base - 300 * k); });
  for (let i = 0; i < 4; i++) { const r = (90 - i * 18) * k; track(() => c.arc(sx - 40 * k + i * 95 * k, base - 120 * k - r, r, 0, Math.PI * 2), 3 - i * 0.4); }
  track(() => { for (let t = 0; t < 1; t += 0.02) { const xx = sx + 280 * k + t * 160 * k, yy = base - 200 * k + Math.sin(t * Math.PI * 6) * 40 * k; if (t === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy); } });
};

// ---------------------------------------------------------------------------------------------------------------
// The lot

/** The boulevard's backdrop: everything far off, back to front, each on its own ground. `along` 0..1 down the
 *  boulevard (the coaster rising nearer the end). */
export const drawFar = (c: Ctx, state: GameState, along: number) => {
  const tod = timeOfDay(), cam = state.camera.x, hz = horizonY(state), f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { bands: 16, horizon: hz, sun: [620, 120], moon: [160, 90], t: f, scroll: cam * 0.02 });
  // (the smog: brown along the horizon, thinning upward; less after dark)
  hazeBands(c, 0, Math.round(hz - 190), W, 190, hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  // (the sky kept busy: clouds, Steve's blimp, the banner plane, the searchlights after dark)
  drawHwSky(c, state, hz);
  tile(c, `hb-mtn-${tod.key}`, cam * 0.003 + 300, hz - MH + 30, MH, TW, g => paintMountains(g, tod));
  // (the park's horizon past the hill: the neighbors, Space Needle 2's shaft)
  drawHwHorizon(c, state, hz + 16);
  drawHill(c, 560 - (cam - HWX) * 0.004, hz + 18, f);
  tile(c, `hb-foot-${tod.key}`, cam * 0.008 + 140, hz - FH + 40, FH, TW, g => paintFoothills(g, tod));
  hazeBands(c, 0, Math.round(hz - 70), W, 80, hourMix('#C4A07A', '#C8865E', '#2A2840', tod), 0.04, 0.26, 5);
  tile(c, `hb-city-${tod.key}`, cam * 0.022 + 520, hz - CH + 26, CH, TW, g => paintCity(g, tod));
  // (the land's own attractions over the rooftops: Thrones of the Stars ahead, the rest further on)
  drawHwLandmarks(c, state, hz + 20);
  tile(c, `hb-lot-${tod.key}`, cam * 0.055 + 80, hz - SH + 48, SH, LW, g => paintLot(g, tod));
  tile(c, `hb-palms-${tod.key}`, cam * 0.11 + 400, hz - PH + 64, PH, PW, g => paintPalms(g, tod));
  void along;
  // (under it all, down to the bottom: the far street's ground, banded darker nearer)
  const T2 = farCol(tod, 0.1), top = Math.round(hz + 64);
  if (top < H) bandedGradient(c, 0, top, W, H - top, [T2('#7A7068'), T2('#625A54'), T2('#4E4844'), T2('#3E3A38')], 6);
  void fillUnder; void words; void deco;
};

/** The far layers' painters and sizes (the coaster's backdrop puts the same far off under its own sky, sinking as it
 *  climbs). */
export const FAR = { SKY, TW, MH, FH, CH, SH, LW, PH, PW, PG, SG, CG } as const;
export { tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms };
/** The HAPPYWOOD hill's size and its ridge (the havoc's fires run across it). */
export const HILL = { HW, HHT } as const;
export { hillY };
