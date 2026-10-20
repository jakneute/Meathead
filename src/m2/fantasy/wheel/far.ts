// The fairy wheel's far off (screen space: the backdrop). The wheel's 1300 px tall, so the camera climbs: every layer
// slides down as he goes up by how near it is (the horizon barely; the fairground a lot), so going up the near things
// sink out of the bottom and more sky comes in over the top, and at every height and every x there's something
// specific. Each layer is painted once for the hour into a tile and slid along (the drop tower's seats, the swing ride,
// birds by day, fireworks after dark, balloons got away and the snow live):
//
//   the sky by the hour (banded, dithered between), high cirrus, stepped cumulus at three heights (the tallest only
//   seen from up the wheel); THE ALPS (the square's: snowfields, rock ribs, no volcanoes); THE GREAT PIXIE'S CASTLE on
//   its crag, bigger than from the square (monument.ts); the park beyond (the enchanted glen's forest, misty; Truelling
//   Tragons' three tracks knotted round their loops, its station; the teacups; the flying pixies; Hogsmeat's roofs and
//   steeple; turrets; the frozen lake with skaters); and the fairground round the wheel (a big top, THE WAND drop tower,
//   a helter-skelter, the swing ride, the galleon swing, the dark ride's castle front, the gift shop's turret, the
//   balloon man's kiosk, flag masts and bunting slung between the tops, snowy pines and bare trees strung with lights,
//   the crowds along the paths).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, jag, mist } from '../../adventure/farArt';
import { stamp, hazeBands, pixelBlob } from '../../intro/art/kit';
import { box, mix, hash, checker, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawCastleAt } from '../monument';
import { SECTIONS, GY } from '../geometry';
import { paintAlps, MW, MH, farPine, snowfall } from '../square/far';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** How far up he's taken the camera (0 on the plaza, ~1300 at the top of the wheel). */
export const climbOf = (state: GameState) => Math.max(0, Math.min(1500, GY - 430 - state.camera.y));

const SKY = ['#243488', '#3A5CBC', '#6890DA', '#9CBCEE', '#D6D8F4', '#F6CCDE'];

/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  if (y > H || y + h < 0) return;
  const tod = timeOfDay();
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `fa-wh-${key}-${tod.key}`, 0, 0, tw, h, paint); c.restore(); }
};
/** Each repeat of a tile's x on screen (for the live bits laid over it). */
const repeats = (off: number, tw: number, x: number, pad: number, fn: (sx: number) => void) => {
  for (let b = -(((off % tw) + tw) % tw); b < W + tw; b += tw) { const sx = b + x; if (sx > -pad && sx < W + pad) fn(sx); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** A ramp of four round a color (shade, itself, lit, highlight), for the hour at haze k. */
const r4 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.3)), T(mix(col, '#FFFFFF', 0.6))];
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const winLit = (tod: TimeOfDay, i: number) => tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : null) : (hash(i * 1.7) > 0.75 ? '#E8B070' : null);
const BULB = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8'];

// ---------------------------------------------------------------------------------------------------------------
// The sky's clouds: cirrus streaks high up, stepped cumulus (`seed` a set of them, `s` their size)

const CIW = 1200, CIH = 70;
const paintCirrus = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#C8D0EE', '#E4E8F8', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 16; i++) {
    const x = hash(i * 4.7) * CIW, y = 8 + hash(i * 2.9) * (CIH - 20), w = 60 + hash(i * 1.3) * 160;
    for (let k = 0; k < 4; k++) {
      const sx = x + k * w * 0.18 + hash(i + k) * 10, sw = w * (1 - k * 0.2);
      for (const o of [0, CIW, -CIW]) { box(g, sx + o, y + k * 3, sw, 2, C[k % 2]); checker(g, sx + o + sw, y + k * 3, 12, 2, C[0], 0, 2); if (k === 1) box(g, sx + o + 8, y + k * 3, sw * 0.4, 1, C[2]); }
    }
  }
};
const CUW = 1100;
const paintCumulus = (g: Ctx, tod: TimeOfDay, seed: number, s0: number, h: number) => {
  const C = ['#8C96C0', '#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  const n = 7;
  for (let i = 0; i < n; i++) {
    const cx = (i * CUW) / n + hash(i * 3.3 + seed) * 70, cy = h - 40 - hash(i * 5.1 + seed) * (h - 90), s = s0 * (0.6 + hash(i * 7.7 + seed) * 0.8);
    const puffs = 4 + Math.floor(hash(i + seed) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.92], [2, -3, 0.75], [3, -6, 0.45]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 16 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 18 * s + dy * s;
        const r = (12 + hash(i * 11 + p + seed) * 10) * s * k;
        for (const ox of [0, CUW, -CUW]) pixelBlob(g, px + ox - (L === 3 ? 4 : 0), py, r * 1.3, r * 0.8, C[L]);
      }
    }
    for (const ox of [0, CUW, -CUW]) { box(g, cx + ox - puffs * 8 * s, cy + 10 * s, puffs * 16 * s, 3, C[0]); checker(g, cx + ox - puffs * 8 * s, cy + 8 * s, puffs * 16 * s, 2, C[0], 0, 2); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park beyond: the glen's forest, Truelling Tragons, the teacups, the flying pixies, Hogsmeat, turrets, the lake

const PW = 1800, PH = 240, PG = PH - 44;
const ridge = (x: number) => snap2(PG - 34 + wave(x, PW, 3.1, 2) * 12 + jag(x, PW, 8, 5) * 4 - (x < 640 ? 30 * Math.sin((x / 640) * Math.PI) : 0));

const turret = (g: Ctx, T: (c: string) => string, x: number, foot: number, w: number, h: number, roof: string, tod: TimeOfDay, i: number) => {
  const S = r4(T, '#C8BCD8'), Rf = r4(T, roof);
  box(g, x - w / 2 - 1, foot - h, w + 2, h, T(INK));
  box(g, x - w / 2, foot - h, w, h, S[1]); box(g, x - w / 2, foot - h, w * 0.3, h, S[2]); box(g, x + w * 0.2, foot - h, w * 0.3, h, S[0]);
  for (let k = 0; k < Math.floor(h / 14); k++) { const c = winLit(tod, i * 7 + k); box(g, x - 1, foot - h + 6 + k * 14, 3, 5, c ?? T('#4A4066')); }
  poly(g, [[x - w / 2 - 3, foot - h], [x, foot - h - w * 1.5], [x + w / 2 + 3, foot - h]], Rf[1]);
  poly(g, [[x - w / 2 - 3, foot - h], [x, foot - h - w * 1.5], [x - w * 0.12, foot - h]], Rf[2]);
  box(g, x - w / 2 - 3, foot - h - 2, w + 6, 2, T('#F4F8FF'));
  box(g, x, foot - h - w * 1.5 - 9, 1, 9, T('#4A4060'));
  poly(g, [[x + 1, foot - h - w * 1.5 - 9], [x + 10, foot - h - w * 1.5 - 7], [x + 1, foot - h - w * 1.5 - 5]], T(i % 2 ? '#F49AC8' : '#F6D365'));
};

const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.34), Sn = T('#E8EEF8');
  // (the ridge behind it all, and the glen's forest heaped up on the left: tall snowy pines, mist in among them)
  g.fillStyle = T('#2E4A54'); g.beginPath(); g.moveTo(0, PH);
  for (let x = 0; x <= PW; x += 4) g.lineTo(x, ridge(x));
  g.lineTo(PW, PH); g.closePath(); g.fill();
  for (let x = 2; x < PW; x += 7) { const y = ridge(x), big = x < 640 ? 1.6 : 1; farPine(g, x + hash(x) * 4, y + 8, (12 + hash(x * 1.3) * 14) * big, [T('#1E3A3A'), T('#30584E')], Sn); }
  for (let x = 30; x < 620; x += 23) { const y = ridge(x) + 18 + hash(x) * 10; farPine(g, x, y + 22, 20 + hash(x * 2.1) * 18, [T('#183230'), T('#284C44')], Sn); }
  hazeBands(g, 0, PG - 70, 640, 50, skyAt(0.9, tod), 0.1, 0.35, 4);
  // (bare trees along the meadow, strung with lights)
  for (let i = 0; i < 26; i++) {
    const x = 20 + i * 69 + hash(i * 3) * 30, h = 18 + hash(i) * 12;
    g.strokeStyle = T('#4A3A40'); g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, PG); g.lineTo(x, PG - h); for (let b = 0; b < 4; b++) { const by = PG - h * (0.4 + b * 0.15), s = b % 2 ? 1 : -1; g.moveTo(x, by); g.lineTo(x + s * (6 - b), by - 6); } g.stroke();
    if (tod.lamps > 0.3) for (let b = 0; b < 5; b++) box(g, x - 5 + hash(i * 9 + b) * 10, PG - h * (0.3 + hash(i + b) * 0.6), 1, 1, BULB[(i + b) % 4]);
  }
  // (Truelling Tragons: three tracks on lattice legs, knotted round each other and their loops; the gothic station)
  const t0 = 660, t1 = 1160, base = PG;
  const trackY = (k: number, x: number) => base - 56 - Math.sin((x - t0) * 0.016 + k * 2.1) * 32 - Math.sin((x - t0) * 0.039 + k) * 14 - k * 7;
  for (let x = t0; x < t1; x += 12) for (let k = 0; k < 3; k++) { const y = trackY(k, x); box(g, x, y, 1, base - y, T('#625C82')); if (x % 36 === 0) { g.strokeStyle = T('#544E74'); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + 12, base); g.stroke(); } }
  const TR = ['#D8402E', '#7AC8F0', '#F2D24A'];
  for (let k = 0; k < 3; k++) {
    for (const [col, lw, dy] of [[mix(TR[k], INK, 0.45), 5, 1], [TR[k], 3, 0], [mix(TR[k], '#FFFFFF', 0.45), 1, -1]] as const) {
      g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath();
      for (let x = t0; x <= t1; x += 4) (x === t0 ? g.moveTo(x, trackY(k, x) + dy) : g.lineTo(x, trackY(k, x) + dy));
      g.stroke();
    }
    const lx = t0 + 100 + k * 130, ly = trackY(k, lx) - 32;
    for (const [col, lw] of [[mix(TR[k], INK, 0.45), 5], [TR[k], 3]] as const) { g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath(); g.ellipse(lx, ly, 22, 32, 0, 0, Math.PI * 2); g.stroke(); }
    box(g, lx - 1, ly + 32, 2, base - ly - 32, T('#625C82'));
  }
  const sx = t1 - 30;
  box(g, sx - 34, base - 44, 68, 44, T('#5E5480')); box(g, sx - 34, base - 44, 68, 2, T('#8E84AA')); box(g, sx + 20, base - 44, 14, 44, T('#4A426A'));
  for (let k = 0; k < 4; k++) { box(g, sx - 28 + k * 15, base - 34, 5, 10, winLit(tod, 40 + k) ?? T('#2A2440')); }
  poly(g, [[sx - 38, base - 44], [sx, base - 72], [sx + 38, base - 44]], T('#33304E')); poly(g, [[sx - 38, base - 44], [sx, base - 72], [sx - 6, base - 44]], T('#4A4668'));
  box(g, sx - 38, base - 46, 76, 2, Sn);
  poly(g, [[sx - 10, base - 56], [sx + 14, base - 62], [sx + 10, base - 52]], T('#4A8A5A')); box(g, sx + 10, base - 60, 2, 2, T('#F2D24A'));
  // (the teacups: a striped canopy on a ring of posts, the cups tipping round under it)
  const tx = 1240;
  box(g, tx - 40, base - 8, 80, 8, T('#8A7AA8'));
  for (let k = 0; k < 5; k++) { const cx = tx - 32 + k * 16, col = ['#F49AC8', '#9CD0F4', '#F6D365', '#B8A0F0', '#A8E8C8'][k]; box(g, cx - 6, base - 18, 12, 9, T(INK)); box(g, cx - 5, base - 17, 10, 7, T(col)); box(g, cx - 5, base - 17, 10, 2, T(mix(col, '#FFFFFF', 0.4))); box(g, cx + 5, base - 15, 2, 3, T(col)); }
  for (const px of [tx - 38, tx + 37]) box(g, px, base - 44, 2, 36, T('#C8BCD8'));
  for (let k = 0; k < 8; k++) poly(g, [[tx - 46 + k * 11.5, base - 44], [tx, base - 64], [tx - 34.5 + k * 11.5, base - 44]], T(k % 2 ? '#FFF0F8' : '#E86AA8'));
  for (let k = 0; k < 8; k++) { g.fillStyle = T(k % 2 ? '#FFF0F8' : '#E86AA8'); g.beginPath(); g.arc(tx - 40 + k * 11.5, base - 44, 5.5, 0, Math.PI); g.fill(); }
  box(g, tx - 1, base - 74, 2, 12, T('#4A4060')); poly(g, [[tx + 1, base - 74], [tx + 10, base - 71], [tx + 1, base - 68]], T('#F6D365'));
  // (the flying pixies: a hub on a post, arms out, a pixie pod on each)
  const fx = 330, fy = base - 46;
  box(g, fx - 2, fy, 4, base - fy, T('#B8A0D0'));
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3, ex = fx + Math.cos(a) * 34, ey = fy + Math.sin(a) * 9; g.strokeStyle = T('#8A7AA8'); g.lineWidth = 1; g.beginPath(); g.moveTo(fx, fy - 4); g.lineTo(ex, ey); g.stroke(); box(g, ex - 4, ey - 2, 8, 5, T(['#F49AC8', '#A8E8C8', '#F6D365'][k % 3])); box(g, ex - 6, ey - 4, 3, 2, T('#E8E0FF')); box(g, ex + 3, ey - 4, 3, 2, T('#E8E0FF')); }
  ballR4(g, fx, fy - 6, 6, r4(T, '#F6C84A'));
  // (Hogsmeat's roofs, off on the right: crooked, snowed on, lit; the steeple, a chimney or two)
  for (let i = 0; i < 12; i++) {
    const x = 1330 + i * 34 + hash(i * 5) * 8, w = 24 + hash(i * 2) * 16, h = 20 + hash(i * 3) * 24, top = base - h;
    const wall = T(['#A8968A', '#8A7E8E', '#B0A08C', '#9A8A7A'][i % 4]);
    box(g, x, top, w, h, wall); box(g, x + w - 4, top, 4, h, T('#6A5E6E'));
    for (let k = 0; k < Math.floor(w / 9); k++) box(g, x + 3 + k * 9, top + 5, 3, 4, winLit(tod, i * 5 + k) ?? T('#3A3456'));
    const px = x + w / 2 + (hash(i * 9) - 0.5) * 6;
    poly(g, [[x - 2, top], [px, top - w * 0.6], [x + w + 2, top]], T('#3E4058'));
    poly(g, [[x - 2, top], [px, top - w * 0.6], [px - 2, top - w * 0.6 + 5], [x - 2, top - 2]], Sn);
    if (i % 3 === 1) { box(g, x + w * 0.7, top - w * 0.5, 4, 10, T('#6A4A3A')); box(g, x + w * 0.7 - 1, top - w * 0.5 - 2, 6, 2, Sn); }
  }
  const stx = 1540;
  box(g, stx - 7, base - 70, 14, 70, T('#A49AB4')); box(g, stx - 7, base - 70, 4, 70, T('#C4BCD2'));
  poly(g, [[stx - 9, base - 70], [stx, base - 112], [stx + 9, base - 70]], T('#3A4058')); poly(g, [[stx - 9, base - 70], [stx, base - 112], [stx - 2, base - 70]], Sn);
  box(g, stx - 2, base - 60, 4, 6, winLit(tod, 77) ?? T('#3A3456'));
  turret(g, T, 600, base, 12, 44, '#4A78D4', tod, 1);
  turret(g, T, 1190, base, 10, 30, '#C8508E', tod, 2);
  turret(g, T, 1300, base, 14, 52, '#6A4A9A', tod, 3);
  turret(g, T, 1740, base, 16, 58, '#4A78D4', tod, 4);
  turret(g, T, 1770, base, 10, 32, '#3A8A6A', tod, 5);
  // (the snowy meadow; the lake iced over: banded, skaters on it and their scratches, the far shore's reflection)
  box(g, 0, PG, PW, 10, T('#D8E2F2')); box(g, 0, PG, PW, 2, T('#F4F8FF'));
  const ICE = ['#8EA8D0', '#A6BEE0', '#BED2EC', '#D2E2F4'].map(T);
  for (let i = 0; i < 4; i++) box(g, 0, PG + 10 + i * 8, PW, 8, ICE[3 - i]);
  checker(g, 0, PG + 16, PW, 2, ICE[2], 0, 1); checker(g, 0, PG + 24, PW, 2, ICE[1], 1, 1);
  for (let i = 0; i < 50; i++) { const x = hash(i * 2.3) * PW, y = PG + 12 + hash(i * 4.1) * 28; box(g, x, y, 6 + hash(i) * 16, 1, T('#EEF4FC')); }
  for (let i = 0; i < 22; i++) { const x = hash(i * 6.1) * PW, y = PG + 14 + hash(i * 7.3) * 22, col = T(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA'][i % 5]); box(g, x, y - 5, 2, 4, col); box(g, x, y - 7, 2, 2, T('#E8B890')); box(g, x - 1, y - 1, 1, 1, T('#3A3456')); box(g, x + 2, y - 1, 1, 1, T('#3A3456')); }
  box(g, 0, PH - 6, PW, 6, ICE[0]);
  mist(g, PW, PG - 80, 80, skyAt(0.9, tod), 0.05, 0.4, 5);
};
const ballR4 = (g: Ctx, x: number, y: number, r: number, R: string[]) => {
  g.fillStyle = R[0]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[1]; g.beginPath(); g.arc(x - r * 0.15, y - r * 0.15, r * 0.75, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2); g.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The fairground round the wheel (the rides' tops stick up over the near stalls; from up the wheel, they're what's
// left standing up out of the bottom of the picture)

const FW = 2000, FH = 520, FG = FH - 60;
/** The drop tower (tile x, its top) and the swing ride: their live bits drawn over the tile. */
const TOWER = { x: 400, h: 420 }, SWING = { x: 800, h: 220 };

const stripes = (g: Ctx, x: number, y: number, w: number, h: number, n: number, a: string, b: string) => { for (let k = 0; k < n; k++) box(g, x + (k * w) / n, y, w / n + 1, h, k % 2 ? a : b); };
/** A big top: a peaked, striped circus tent (two poles), scalloped valance, pennants, its door flap. */
const bigTop = (g: Ctx, T: (c: string) => string, x: number, w: number, h: number, A: string, tod: TimeOfDay) => {
  const foot = FG, wall = h * 0.35, top = foot - h, a = r4(T, A), b = r4(T, '#FFF4F8');
  box(g, x - 1, foot - wall - 1, w + 2, wall + 1, T(INK));
  stripes(g, x, foot - wall, w, wall, 12, a[1], b[1]);
  box(g, x + w - 10, foot - wall, 10, wall, T(mix(A, INK, 0.4)));
  box(g, x + w / 2 - 10, foot - wall * 0.75, 20, wall * 0.75, tod.lamps > 0.3 ? '#FFC870' : T('#3A2A40'));
  // (the roof: two peaks; stripes running up to each)
  const p1 = x + w * 0.3, p2 = x + w * 0.7;
  for (const [px, ph] of [[p1, top], [p2, top + 10]] as const) {
    for (let k = 0; k < 8; k++) {
      const l = x + (k * w) / 8, r = x + ((k + 1) * w) / 8;
      if (Math.abs((l + r) / 2 - px) > w * 0.4) continue;
      poly(g, [[l, foot - wall], [px, ph], [r, foot - wall]], k % 2 ? a[1] : b[1]);
    }
    poly(g, [[px, ph], [px - 3, foot - wall], [px - w * 0.18, foot - wall]], T(mix(A, '#FFFFFF', 0.2)));
    box(g, px - 1, ph - 16, 2, 16, T('#4A4060'));
    poly(g, [[px + 1, ph - 16], [px + 13, ph - 13], [px + 1, ph - 10]], T(px === p1 ? '#F6D365' : '#9CD0F4'));
  }
  for (let k = 0; k < Math.floor(w / 10); k++) { g.fillStyle = k % 2 ? a[0] : T('#F6D365'); g.beginPath(); g.arc(x + 5 + k * 10, foot - wall, 5, 0, Math.PI); g.fill(); }
  box(g, x - 1, foot - wall - 2, w + 2, 2, T('#F4F8FF'));
  if (tod.lamps > 0.3) for (let k = 0; k < Math.floor(w / 8); k++) box(g, x + 4 + k * 8, foot - wall + 6, 2, 2, BULB[k % 4]);
};
const paintFair = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.2), Sn = T('#EEF2FA'), night = tod.lamps > 0.3;
  const I = r4(T, '#B8A8D0'), G = r4(T, '#E0AE3A'), Pk = r4(T, '#F49AC8'), Mn = r4(T, '#9EE6C8'), Lv = r4(T, '#B8A0F0');
  // (the tree line behind it all: snowy pines and bare trees with lights)
  for (let x = 0; x < FW; x += 14) {
    const h = 50 + hash(x * 0.7) * 50;
    if (hash(x * 1.9) > 0.3) farPine(g, x + hash(x) * 6, FG, h, [T('#1C3634'), T('#2C524A')], Sn);
    else { g.strokeStyle = T('#3E3038'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, FG); g.lineTo(x, FG - h); for (let b = 0; b < 5; b++) { const by = FG - h * (0.35 + b * 0.13), s = b % 2 ? 1 : -1; g.moveTo(x, by); g.lineTo(x + s * (14 - b * 2), by - 10); } g.stroke(); if (night) for (let b = 0; b < 8; b++) box(g, x - 10 + hash(x + b) * 20, FG - h * (0.3 + hash(x * 2 + b) * 0.65), 2, 2, BULB[b % 4]); }
  }
  // (a big top)
  bigTop(g, T, 30, 250, 180, '#E0408A', tod);
  // (THE WAND: the drop tower, a lattice mast up to a gilt star; its seat ring's drawn live)
  {
    const x = TOWER.x, top = FG - TOWER.h;
    box(g, x - 13, top, 26, TOWER.h, T(INK)); box(g, x - 12, top, 24, TOWER.h, I[1]); box(g, x - 12, top, 6, TOWER.h, I[2]); box(g, x + 6, top, 6, TOWER.h, I[0]);
    g.strokeStyle = I[0]; g.lineWidth = 1;
    for (let y = top + 8; y < FG; y += 16) { g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x + 12, y + 16); g.moveTo(x + 12, y); g.lineTo(x - 12, y + 16); g.stroke(); }
    for (let y = top + 20; y < FG - 10; y += 28) box(g, x - 1, y, 2, 2, night ? '#FFE9A8' : I[3]);
    box(g, x - 22, top - 6, 44, 10, T(INK)); box(g, x - 21, top - 5, 42, 8, Pk[1]); box(g, x - 21, top - 5, 42, 2, Pk[3]);
    const st: [number, number][] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 9 : 22; st.push([x + Math.cos(a) * r, top - 26 + Math.sin(a) * r]); }
    poly(g, st.map(([a, b]) => [a + 1, b + 1] as [number, number]), T(INK)); poly(g, st, G[1]); poly(g, st.slice(0, 4).concat([[x, top - 26]]), G[3]);
    box(g, x - 30, FG - 30, 60, 30, T(INK)); box(g, x - 29, FG - 29, 58, 29, Lv[1]); box(g, x - 29, FG - 29, 58, 3, Lv[3]);
  }
  // (the helter-skelter: a striped tower tapering up, the slide spiraling round it, a cone roof and its flag)
  {
    const x = 590, h = 240, top = FG - h;
    poly(g, [[x - 26, FG], [x - 16, top], [x + 16, top], [x + 26, FG]], T(INK));
    for (let k = 0; k < 10; k++) { const y0 = top + (k * h) / 10, y1 = top + ((k + 1) * h) / 10, w0 = 16 + (k / 10) * 10, w1 = 16 + ((k + 1) / 10) * 10; poly(g, [[x - w0 + 1, y0], [x + w0 - 1, y0], [x + w1 - 1, y1], [x - w1 + 1, y1]], k % 2 ? Pk[1] : T('#FFF4F8')); }
    for (let y = top; y < FG; y += 2) { const w = 16 + ((y - top) / h) * 10; checker(g, x + w * 0.45, y, w * 0.5, 2, T(mix('#E0408A', INK, 0.5)), (y / 2) % 2, 1); }
    for (let k = 0; k < 5; k++) { const y = top + 20 + k * 44; g.strokeStyle = T(INK); g.lineWidth = 6; g.beginPath(); g.moveTo(x - 30, y + 30); g.quadraticCurveTo(x, y + 52, x + 30, y + 10); g.stroke(); g.strokeStyle = G[1]; g.lineWidth = 4; g.stroke(); g.strokeStyle = G[3]; g.lineWidth = 1; g.stroke(); }
    poly(g, [[x - 22, top], [x, top - 46], [x + 22, top]], T(INK)); poly(g, [[x - 20, top - 1], [x, top - 44], [x + 20, top - 1]], Mn[1]); poly(g, [[x - 20, top - 1], [x, top - 44], [x - 4, top - 1]], Mn[2]);
    box(g, x - 1, top - 60, 2, 16, T('#4A4060')); poly(g, [[x + 1, top - 60], [x + 14, top - 56], [x + 1, top - 52]], Pk[2]);
  }
  // (the swing ride: its tower and its crown canopy; the chairs flying out on their chains are drawn live)
  {
    const x = SWING.x, top = FG - SWING.h;
    box(g, x - 7, top, 14, SWING.h, T(INK)); box(g, x - 6, top, 12, SWING.h, G[1]); box(g, x - 6, top, 4, SWING.h, G[2]); box(g, x + 3, top, 3, SWING.h, G[0]);
    for (let y = top + 30; y < FG; y += 30) box(g, x - 8, y, 16, 3, Pk[1]);
    poly(g, [[x - 60, top + 18], [x, top - 14], [x + 60, top + 18]], T(INK));
    for (let k = 0; k < 8; k++) poly(g, [[x - 58 + k * 14.5, top + 17], [x, top - 12], [x - 58 + (k + 1) * 14.5, top + 17]], k % 2 ? Lv[1] : T('#FFF4F8'));
    for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? G[1] : Lv[0]; g.beginPath(); g.arc(x - 51 + k * 14.5, top + 17, 7, 0, Math.PI); g.fill(); }
    ballR4(g, x, top - 16, 6, G);
    if (night) for (let k = 0; k < 12; k++) box(g, x - 56 + k * 10, top + 20, 2, 2, BULB[k % 4]);
    box(g, x - 46, FG - 12, 92, 12, T(INK)); box(g, x - 45, FG - 11, 90, 11, Lv[0]); box(g, x - 45, FG - 11, 90, 2, Lv[2]);
  }
  // (the galleon swing: THE JOLLY PIXIE on its A-frame, swung out to one side)
  {
    const x = 1030, top = FG - 160;
    for (const s of [-1, 1]) { g.strokeStyle = T(INK); g.lineWidth = 6; g.beginPath(); g.moveTo(x + s * 60, FG); g.lineTo(x, top); g.stroke(); g.strokeStyle = I[1]; g.lineWidth = 4; g.stroke(); }
    g.strokeStyle = I[0]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, top); g.lineTo(x - 70, top + 100); g.moveTo(x, top); g.lineTo(x - 30, top + 112); g.stroke();
    g.save(); g.translate(x - 50, top + 112); g.rotate(0.45);
    poly(g, [[-62, -14], [62, -14], [48, 12], [-48, 12]], T(INK)); poly(g, [[-60, -12], [60, -12], [46, 10], [-46, 10]], T('#8A4A2E')); box(g, -60, -12, 120, 4, T('#C8784A')); box(g, -46, 2, 92, 3, G[1]);
    for (let k = 0; k < 6; k++) box(g, -44 + k * 16, -20, 8, 8, T(['#E8B890', '#8E5A3A', '#F2C8A0', '#5A3420'][k % 4]));
    box(g, -2, -60, 3, 48, T('#5E3E2A')); poly(g, [[1, -58], [30, -40], [1, -24]], T('#FFF4F8'));
    g.restore();
    box(g, x - 4, top - 4, 8, 8, G[1]);
  }
  // (the dark ride's front: a storybook castle facade, gate and turrets, the queue's lit doorway)
  {
    const x = 1210, w = 210, h = 130, top = FG - h, S = r4(T, '#B8ACD0');
    box(g, x - 1, top - 1, w + 2, h + 1, T(INK)); box(g, x, top, w, h, S[1]); box(g, x, top, w, 3, S[3]);
    for (let y = top + 10; y < FG; y += 10) box(g, x, y, w, 1, S[0]);
    for (let k = 0; k < Math.floor(w / 14); k++) box(g, x + k * 14, top - 8, 8, 8, S[1]);
    g.fillStyle = T(INK); g.beginPath(); g.arc(x + w / 2, FG - 40, 26, Math.PI, 0); g.fill(); box(g, x + w / 2 - 26, FG - 40, 52, 40, T(INK));
    g.fillStyle = night ? '#FFB060' : T('#3A2440'); g.beginPath(); g.arc(x + w / 2, FG - 40, 22, Math.PI, 0); g.fill(); box(g, x + w / 2 - 22, FG - 40, 44, 40, night ? '#FFB060' : T('#3A2440'));
    for (let k = 0; k < 4; k++) box(g, x + w / 2 - 20 + k * 12, FG - 64, 2, 64, T('#2A1A30'));
    for (const tx of [x + 10, x + w - 10]) turret(g, T, tx, FG, 34, h + 40, '#4A78D4', tod, Math.round(tx));
    turret(g, T, x + w / 2, top, 26, 40, '#C8508E', tod, 9);
    for (let k = 0; k < 4; k++) box(g, x + 40 + k * 40, top + 26, 8, 14, winLit(tod, 60 + k) ?? T('#3A3456'));
  }
  // (the gift shop's turret, the tallest round tower along there)
  turret(g, T, 1520, FG, 46, 170, '#6A4A9A', tod, 12);
  turret(g, T, 1566, FG, 26, 100, '#4A78D4', tod, 13);
  box(g, 1480, FG - 40, 110, 40, T(INK)); box(g, 1481, FG - 39, 108, 39, Pk[1]); box(g, 1481, FG - 39, 108, 3, Pk[3]);
  for (let k = 0; k < 4; k++) box(g, 1488 + k * 26, FG - 30, 16, 18, night ? '#FFD88A' : T('#E8D8F0'));
  // (a second, smaller big top)
  bigTop(g, T, 1640, 170, 130, '#4A78D4', tod);
  // (flag masts and the balloon man's kiosk, a bunch of balloons tied up over it)
  for (const [mx, mh, col] of [[1850, 200, '#E0408A'], [1900, 170, '#F6D365'], [1950, 220, '#4A78D4'], [300, 190, '#9EE6C8'], [940, 180, '#F6D365'], [1440, 210, '#E0408A']] as const) {
    box(g, mx - 2, FG - mh, 4, mh, T(INK)); box(g, mx - 1, FG - mh, 2, mh, I[2]); ballR4(g, mx, FG - mh - 3, 3, G);
    poly(g, [[mx + 2, FG - mh + 2], [mx + 30, FG - mh + 8], [mx + 22, FG - mh + 14], [mx + 30, FG - mh + 20], [mx + 2, FG - mh + 22]], T(col));
    box(g, mx + 2, FG - mh + 2, 26, 2, T(mix(col, '#FFFFFF', 0.4)));
  }
  box(g, 1880, FG - 34, 50, 34, T(INK)); stripes(g, 1881, FG - 33, 48, 33, 6, Mn[1], T('#FFF4F8'));
  for (let k = 0; k < 9; k++) { const bx = 1905 + (hash(k * 3) - 0.5) * 44, by = FG - 80 - hash(k * 5) * 40, col = ['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#C084FC'][k % 5]; g.strokeStyle = T('#E8E0F0'); g.lineWidth = 1; g.beginPath(); g.moveTo(1905, FG - 34); g.lineTo(bx, by + 7); g.stroke(); g.fillStyle = T(INK); g.beginPath(); g.ellipse(bx, by, 6, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T(col); g.beginPath(); g.ellipse(bx, by, 5, 6, 0, 0, Math.PI * 2); g.fill(); box(g, bx - 3, by - 4, 2, 2, T('#FFFFFF')); }
  // (bunting slung between the tops: little pennants in turn, sagging)
  const sling = (ax: number, ay: number, bx: number, by: number, sag: number, seed: number) => {
    const n = Math.max(4, Math.floor(Math.abs(bx - ax) / 12));
    const P = (t: number): [number, number] => [ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(t * Math.PI) * sag];
    g.strokeStyle = T('#4A4060'); g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = P(i / n); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let i = 0; i < n; i++) { const [x, y] = P((i + 0.5) / n); poly(g, [[x - 4, y], [x + 4, y], [x, y + 8]], T(['#E0408A', '#F6D365', '#4A78D4', '#9EE6C8', '#FFF4F8'][(i + seed) % 5])); if (night && i % 2) box(g, x, y - 1, 2, 2, BULB[i % 4]); }
  };
  sling(155, FG - 196, TOWER.x - 12, FG - 300, 30, 1);
  sling(TOWER.x + 12, FG - 280, 590, FG - 260, 24, 2);
  sling(590, FG - 240, SWING.x, FG - SWING.h - 10, 20, 3);
  sling(SWING.x, FG - SWING.h + 20, 940, FG - 180, 22, 4);
  sling(940, FG - 176, 1230, FG - 186, 34, 0);
  sling(1240, FG - 170, 1440, FG - 210, 26, 1);
  sling(1440, FG - 206, 1520, FG - 224, 12, 2);
  sling(1566, FG - 150, 1720, FG - 140, 22, 3);
  sling(1850, FG - 196, 1950, FG - 216, 14, 4);
  sling(1950, FG - 210, 2000 + 155, FG - 196, 30, 0);
  // (the paths along the bottom: the stalls' roofs, the crowds milling along, lamp posts)
  box(g, 0, FG, FW, FH - FG, T('#5E5874')); box(g, 0, FG, FW, 3, T('#9A94AE'));
  for (let i = 0; i < 60; i++) { const x = i * 34 + hash(i) * 12, w = 18 + hash(i * 2) * 10, col = ['#E0408A', '#4A78D4', '#F6D365', '#9EE6C8', '#B8A0F0'][i % 5]; if (i % 4 === 0) { box(g, x, FG - 16, w, 16, T('#E8D8F0')); stripes(g, x - 2, FG - 22, w + 4, 6, 4, T(col), T('#FFF4F8')); box(g, x + 3, FG - 12, w - 6, 6, night ? '#FFD88A' : T('#5A4A6A')); } }
  for (let i = 0; i < 220; i++) { const x = hash(i * 1.37) * FW, y = FG + 4 + hash(i * 2.11) * 40, col = T(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA', '#E86AA8', '#F4F0FA', '#3A3448'][i % 8]); box(g, x, y - 6, 3, 6, col); box(g, x, y - 9, 3, 3, T(['#F2C8A0', '#C47A48', '#6E4428', '#E8B890'][i % 4])); }
  for (let x = 60; x < FW; x += 160) { box(g, x, FG - 40, 2, 44, T('#2A2840')); box(g, x - 3, FG - 46, 8, 7, night ? '#FFE9A8' : T('#E8D8A8')); }
  hazeBands(g, 0, FG - 20, FW, FH - FG + 20, skyAt(0.9, tod), 0.05, 0.3, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Live: the drop tower's seats, the swing ride's chairs, birds, fireworks, balloons got away

const liveFair = (c: Ctx, off: number, y: number, f: number, tod: TimeOfDay) => {
  const T = farCol(tod, 0.2), seat = T('#F49AC8'), dark = T(INK), chain = T('#8A7AA8');
  repeats(off, FW, TOWER.x, 60, sx => {
    // (up slow, a hold at the top, dropped)
    const ph = (f % 420) / 420, u = ph < 0.6 ? ph / 0.6 : ph < 0.75 ? 1 : Math.max(0, 1 - ((ph - 0.75) / 0.06) ** 2);
    const sy = y + FG - 40 - u * (TOWER.h - 70);
    box(c, sx - 22, sy - 1, 44, 12, dark); box(c, sx - 21, sy, 42, 10, seat); box(c, sx - 21, sy, 42, 2, T('#FFD0E8'));
    for (let k = 0; k < 5; k++) { box(c, sx - 18 + k * 8, sy + 10, 4, 6, T(['#2E5AAE', '#C8283E', '#E0AE3A', '#2E8A5A', '#7A3AAA'][k])); box(c, sx - 18 + k * 8, sy - 4, 4, 4, T(['#F2C8A0', '#C47A48', '#6E4428', '#E8B890', '#F2C8A0'][k])); }
  });
  repeats(off, FW, SWING.x, 90, sx => {
    const top = y + FG - SWING.h + 16;
    for (let k = 0; k < 10; k++) {
      const a = f * 0.03 + (k * Math.PI * 2) / 10, dx = Math.cos(a) * 70, front = Math.sin(a) > 0;
      const ex = sx + dx, ey = top + 46 + (front ? 4 : -2);
      c.strokeStyle = chain; c.lineWidth = 1; c.beginPath(); c.moveTo(sx + Math.cos(a) * 44, top); c.lineTo(ex, ey); c.stroke();
      box(c, ex - 3, ey, 7, 5, front ? dark : T('#3A3048')); box(c, ex - 2, ey + 1, 5, 3, front ? T(['#F6D365', '#9EE6C8', '#F49AC8'][k % 3]) : T('#5A4E70'));
    }
  });
};

const birds = (c: Ctx, f: number, climb: number) => {
  c.fillStyle = farTint('#2A2840', 0.4);
  for (let fl = 0; fl < 3; fl++) {
    const bx = ((f * (0.25 + fl * 0.1) + fl * 500) % (W + 300)) - 150, by = 110 + fl * 70 + Math.sin(f * 0.01 + fl) * 10 + climb * 0.18;
    if (by > H) continue;
    for (let k = 0; k < 6; k++) {
      const x = bx - Math.abs(k - 2.5) * 12 - (k > 2 ? 4 : 0), y = by + Math.abs(k - 2.5) * 7, up = Math.sin(f * 0.25 + k) > 0 ? -2 : 1;
      c.fillRect(Math.round(x - 3), Math.round(y + up), 3, 1); c.fillRect(Math.round(x), Math.round(y), 1, 1); c.fillRect(Math.round(x + 1), Math.round(y + up), 3, 1);
    }
  }
};

const FW_COLS = [['#FFE9A8', '#F6C84A'], ['#FFB0D8', '#F472B6'], ['#A8E8FF', '#60A5FA'], ['#C8FFB8', '#4ADE80'], ['#E8C8FF', '#C084FC']];
const fireworks = (c: Ctx, f: number, climb: number) => {
  for (let n = 0; n < 4; n++) {
    const per = 110 + n * 23, t = (f + n * 41) % per, id = Math.floor((f + n * 41) / per) * 4 + n;
    if (t > 70) continue;
    const x = 80 + hash(id * 1.3) * (W - 160), y = 60 + hash(id * 2.7) * 200 + climb * 0.12, cols = FW_COLS[id % 5];
    if (t < 18) { const ry = y + (18 - t) * 9; c.fillStyle = '#FFE9C8'; c.fillRect(Math.round(x), Math.round(ry), 2, 4); continue; }
    const s = t - 18, r = 6 + s * 1.6 - s * s * 0.012, a = Math.max(0, 1 - s / 52);
    c.globalAlpha = a;
    for (let k = 0; k < 18; k++) {
      const ang = (k / 18) * Math.PI * 2 + id, px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r + s * s * 0.01;
      c.fillStyle = cols[0]; c.fillRect(Math.round(px), Math.round(py), 2, 2);
      c.fillStyle = cols[1]; c.fillRect(Math.round(x + Math.cos(ang) * r * 0.7), Math.round(y + Math.sin(ang) * r * 0.7 + s * s * 0.008), 2, 2);
    }
    if (s < 4) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - 3), Math.round(y - 3), 6, 6); }
    c.globalAlpha = 1;
  }
};

const balloons = (c: Ctx, f: number, cx: number, climb: number) => {
  const cols = ['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#C084FC', '#FB7185'];
  for (let i = 0; i < 7; i++) {
    const sp = 0.25 + hash(i * 3.1) * 0.25, span = H + 900;
    const y = H + 100 - (((f * sp + hash(i * 1.7) * span) % span)) + climb * 0.3;
    if (y < -20 || y > H + 20) continue;
    const x = ((hash(i * 5.3) * (W + 200) - cx * 0.25 + Math.sin(f * 0.02 + i) * 12) % (W + 200) + W + 200) % (W + 200) - 100;
    const col = farTint(cols[i % 6], 0.25), s = 0.7 + hash(i) * 0.5;
    c.strokeStyle = farTint('#E8E0F0', 0.3); c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 8 * s); c.quadraticCurveTo(x + Math.sin(f * 0.05 + i) * 4, y + 16 * s, x, y + 24 * s); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 6 * s + 1, 7.5 * s + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, INK, 0.3); c.beginPath(); c.ellipse(x, y, 6 * s, 7.5 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x - s, y - s, 4.6 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - 3 * s), Math.round(y - 4 * s), 2, 2);
    c.fillStyle = mix(col, INK, 0.3); c.fillRect(Math.round(x - 1), Math.round(y + 7.5 * s), 3, 2);
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawWheelFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cx = state.camera.x, f = state.frame, up = climbOf(state);
  const hz = Math.round(430 + up * 0.06);
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [620, 104 + up * 0.04], moon: [160, 80 + up * 0.04], t: f, scroll: cx * 0.01 });
  // (the clouds: cirrus way up and the tallest cumulus, only come into the picture from up the wheel; the near ones)
  tile(c, 'cirrus', cx * 0.01 + f * 0.04, Math.round(-60 + up * 0.16), CIH, CIW, g => paintCirrus(g, tod));
  tile(c, 'cu-high', cx * 0.012 + f * 0.05, Math.round(-300 + up * 0.22), 190, CUW, g => paintCumulus(g, tod, 17, 1.3, 190));
  tile(c, 'cu-low', cx * 0.016 + f * 0.07, Math.round(hz - 360 + up * 0.03), 160, CUW, g => paintCumulus(g, tod, 3, 0.9, 160));
  if (tod.lamps > 0.45) fireworks(c, f, up); else birds(c, f, up);
  tile(c, 'alps', cx * 0.03, hz - MH + 6, MH, MW, g => paintAlps(g, tod));
  // (the castle on its crag, drifting across as he goes, bigger than from the square)
  const at = MONUMENT_AT.wheel, { x0, x1 } = SECTIONS.wheel, k = Math.max(0, Math.min(1, (cx - x0) / Math.max(1, x1 - x0 - W)));
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), Math.round(at.base - 24 + (hz - 430)), at.k, f);
  // (the park beyond, and under it its ice right down)
  const py = Math.round(hz + 26 + up * 0.1 - PH);
  tile(c, 'park', cx * 0.06, py, PH, PW, g => paintPark(g, tod));
  if (py + PH < H) box(c, 0, py + PH - 1, W, H, farCol(tod, 0.34)('#8EA8D0'));
  // (the fairground round the wheel: its rides up over the near stalls, sinking away as he climbs)
  const fy = Math.round(400 + up * 0.32 - FG), foff = cx * 0.3;
  tile(c, 'fair', foff, fy, FH, FW, g => paintFair(g, tod));
  if (fy < H) liveFair(c, foff, fy, f, tod);
  if (fy + FH < H) box(c, 0, fy + FH - 1, W, H, farCol(tod, 0.2)('#5E5874'));
  balloons(c, f, cx, up);
  snowfall(c, state, 40, 1, 0.35, 0.15, 0.6, 7);
  return true;
};
