// Truelling Tragons' far off (screen space: the backdrop), every layer painted once for the hour into a tile (a stamp)
// and slid along as the world goes by under the ride. The horizon sits at the scene's eye (the trains' middle: the
// camera keeps them framed, so the sky's always the top half of the picture and the ground the bottom), and the layers
// stand going back on the ground between the horizon and where the park round the ride takes over (scenery.ts: depth
// 0.5), each at its own depth, so climbing the lift hill spreads them down the picture and diving at the camera closes
// them up; zoomed out, they're drawn a little smaller (more of them in). Far to near:
//
//   the sky by the hour (banded, dithered between); clouds at four heights (cirrus and the tall cumulus only come into
//   the picture as the ride climbs), birds by day, fireworks after dark, balloons got away, snow coming down; THE ALPS
//   (the square's: snowfields, rock ribs, no volcanoes); THE GREAT PIXIE'S CASTLE on its crag (monument.ts, the ride's
//   size, drifting across as the ride goes); the park beyond (the glen's: snowy hills, the fairy wheel, Hogsmeat's
//   steeple and clock tower, Rapunzel's tower, the beanstalk and the giant's castle, a windmill, turrets); THE REST OF
//   TRUELLING TRAGONS across the park (three tracks in their colors on lattice legs: the station with its three heads,
//   the lift hill, the loops, the triple helix, a corkscrew, the fake mountain (snow-capped plaster, no crater) and the
//   lagoon's spray); the enchanted glen's forest edge (the glen's: oaks, blossom, lilac, frosted pines, the cottage,
//   the dark ride); and the park near the ride (gift shops and turrets, queue canopies full of guests, a carousel, the
//   teacups, hedges and dragon topiary, lamp posts and banners, food stalls, crowds along the paths).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist, snap2, wave, jag } from '../../adventure/farArt';
import { hazeBands, pixelBlob } from '../../intro/art/kit';
import { banded, bandedAt } from './cache';
import { box, mix, hash, checker, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawCastleAt } from '../monument';
import { paintAlps, MW, MH, farPine, snowfall } from '../square/far';
import { paintCirrus, paintCumulus, CIW, CIH, CUW, birds, fireworks, balloons } from '../wheel/far';
import { paintPark as paintGlenPark, PW as GPW, PH as GPH, PG as GPG, paintFarForest, FW as GFW, FH as GFH, FG as GFG } from '../glen/far';
import { GY, END_S } from './layout';
import { tragonsOf } from './state';
import { viewOf, toScreen } from './ride';
import { sceneEye, scrollOf } from './scene';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const SKY = ['#283A8C', '#3E62BE', '#6A90DC', '#A0C0EE', '#DCDCF4', '#F6CCDA'];

/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
const r4 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.3)), T(mix(col, '#FFFFFF', 0.6))];
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const winLit = (tod: TimeOfDay, i: number) => tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : null) : (hash(i * 1.7) > 0.75 ? '#E8B070' : null);
const BULB = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8'];

// ---------------------------------------------------------------------------------------------------------------
// The rest of Truelling Tragons, across the park

const RW = 2000, RH = 320, RG = RH - 34;
const TRK = ['#F2D24A', '#D8402E', '#7AC8F0'];
const sm = (u: number) => { const k = Math.max(0, Math.min(1, u)); return k * k * (3 - 2 * k); };
/** A lane's height along the far ride (its track over the ground line RG). */
const farY = (k: number, x: number) => {
  let y = RG - 44 - k * 16;
  // (the lift hill and its drop)
  if (x > 220 && x < 660) { const u = x < 520 ? sm((x - 220) / 300) : 1 - sm((x - 520) / 140); y -= u * (190 - k * 18); }
  // (the triple helix: wound round one line)
  if (x > 880 && x < 1220) { const w = sm((x - 880) / 50) * sm((1220 - x) / 50); y += ((RG - 96 + Math.sin((x - 880) * 0.05 + k * 2.094) * 30) - y) * w; }
  // (down into the lagoon and out)
  if (x > 1720 && x < 1900) y += Math.sin(((x - 1720) / 180) * Math.PI) * (RG - 12 - y);
  return y;
};
const run = (g: Ctx, pts: [number, number][], col: string, T: (c: string) => string, s = 1) => {
  if (pts.length < 2) return;
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = T(INK); g.lineWidth = 5 * s; path(); g.stroke();
  g.strokeStyle = T(mix(col, INK, 0.4)); g.lineWidth = 3.4 * s; g.stroke();
  g.save(); g.translate(0, -0.8 * s); g.strokeStyle = T(col); g.lineWidth = 1.6 * s; path(); g.stroke(); g.restore();
  g.save(); g.translate(0, -1.6 * s); g.strokeStyle = T(mix(col, '#FFFFFF', 0.5)); g.lineWidth = 0.7; path(); g.stroke(); g.restore();
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
const paintRideRow = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), Sn = T('#E8EEF8'), SnL = T('#FFFFFF');
  // (the snowy hill behind it, pines along it)
  const hill = (x: number) => snap2(RG - 70 + wave(x, RW, 2.3, 2) * 16 + jag(x, RW, 8, 21) * 4);
  g.fillStyle = T('#5A6A90'); g.beginPath(); g.moveTo(0, RH); for (let x = 0; x <= RW; x += 4) g.lineTo(x, hill(x)); g.lineTo(RW, RH); g.closePath(); g.fill();
  for (let x = 0; x < RW; x += 4) box(g, x, hill(x), 4, 3, Sn);
  for (let x = 5; x < RW; x += 13) if (hash(x * 0.21) > 0.4) farPine(g, x, hill(x) + 10, 14 + hash(x) * 14, [T('#20403C'), T('#30584E')], Sn);
  // (the lattice legs under every track)
  const leg = T('#5E5880'), legD = T('#4A4468');
  for (let x = 0; x < RW; x += 22) for (let k = 0; k < 3; k++) {
    if (x > 1450 && x < 1720) continue;
    const y = farY(k, x);
    box(g, x, y + 3, 2, RG - y - 3, leg); if (x % 66 === 0) { g.strokeStyle = legD; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, y + 8); g.lineTo(x + 22, RG); g.stroke(); }
  }
  // (THE STATION: a gothic hall, its three dragon heads over the door, banners)
  const sx = 110, St = r4(T, '#7A6E9A');
  box(g, sx - 70, RG - 70, 140, 70, T(INK)); box(g, sx - 69, RG - 69, 138, 69, St[1]); box(g, sx - 69, RG - 69, 30, 69, St[2]); box(g, sx + 40, RG - 69, 29, 69, St[0]);
  for (let k = 0; k < 4; k++) { box(g, sx - 56 + k * 32, RG - 56, 12, 22, T(INK)); box(g, sx - 55 + k * 32, RG - 55, 10, 20, winLit(tod, 300 + k) ?? T('#2A2440')); }
  poly(g, [[sx - 76, RG - 70], [sx, RG - 116], [sx + 76, RG - 70]], T('#33304E')); poly(g, [[sx - 76, RG - 70], [sx, RG - 116], [sx - 10, RG - 70]], T('#4A4668'));
  box(g, sx - 76, RG - 73, 152, 3, Sn);
  ([[-40, '#C42828'], [0, '#3A8ED8'], [40, '#E2B21E']] as const).forEach(([dx, col]) => { poly(g, [[sx + dx - 10, RG - 84], [sx + dx + 12, RG - 90], [sx + dx + 14, RG - 82], [sx + dx - 10, RG - 78]], T(col)); box(g, sx + dx + 6, RG - 88, 2, 2, T('#FDE047')); });
  for (const tx of [sx - 80, sx + 80]) { box(g, tx - 7, RG - 110, 14, 110, St[1]); box(g, tx - 7, RG - 110, 4, 110, St[2]); poly(g, [[tx - 10, RG - 110], [tx, RG - 140], [tx + 10, RG - 110]], T('#4A78D4')); box(g, tx, RG - 150, 1, 10, T('#4A4060')); poly(g, [[tx + 1, RG - 150], [tx + 9, RG - 147], [tx + 1, RG - 144]], T('#F49AC8')); }
  // (the three tracks along it)
  for (let k = 2; k >= 0; k--) { const pts: [number, number][] = []; for (let x = 0; x <= RW; x += 4) { if (x > 1490 && x < 1690) { if (pts.length) run(g, pts.splice(0), TRK[k], T); continue; } pts.push([x, farY(k, x)]); } run(g, pts, TRK[k], T); }
  // (the loops: one a lane, standing up off the track after the drop)
  for (let k = 0; k < 3; k++) {
    const lx = 720 + k * 64, r = 46 - k * 5, ly = farY(k, lx) - r;
    const pts: [number, number][] = []; for (let a = 0; a <= 48; a++) { const th = (a / 48) * Math.PI * 2; pts.push([lx + Math.sin(th) * r * 0.62, ly + Math.cos(th) * r]); }
    run(g, pts, TRK[k], T);
    box(g, lx - 1, ly + r, 2, RG - ly - r, leg);
  }
  // (a corkscrew: its back strands in shade, its front over)
  const shade = (c: string) => T(mix(c, '#1A1830', 0.4));
  for (const front of [false, true]) {
    let pts: [number, number][] = [];
    for (let x = 1260; x <= 1420; x += 3) {
      const a = ((x - 1260) / 160) * Math.PI * 4, y = farY(0, x) - 30 - Math.sin(a) * 26, isFront = Math.cos(a) > 0;
      if (isFront === front) pts.push([x, y]); else if (pts.length) { run(g, pts, TRK[0], front ? T : shade); pts = []; }
    }
    if (pts.length) run(g, pts, TRK[0], front ? T : shade);
  }
  // (the fake mountain: plaster, snow-capped, no crater; the tracks into its tunnel mouths)
  const mx = 1590, Rk = r4(T, '#6E5E6E');
  poly(g, [[1440, RG], [1520, RG - 120], [1560, RG - 150], [1600, RG - 210], [1630, RG - 170], [1660, RG - 180], [1700, RG - 100], [1740, RG]], T(INK));
  poly(g, [[1442, RG], [1521, RG - 118], [1561, RG - 148], [1600, RG - 207], [1630, RG - 168], [1659, RG - 177], [1698, RG - 99], [1738, RG]], Rk[1]);
  poly(g, [[1442, RG], [1521, RG - 118], [1561, RG - 148], [1600, RG - 207], [1590, RG], ], Rk[2]);
  poly(g, [[1600, RG - 207], [1630, RG - 168], [1659, RG - 177], [1698, RG - 99], [1738, RG], [1640, RG]], Rk[0]);
  poly(g, [[1600, RG - 207], [1572, RG - 140], [1584, RG - 150], [1596, RG - 132], [1610, RG - 152], [1624, RG - 140], [1640, RG - 160], [1630, RG - 168]], Sn);
  poly(g, [[1600, RG - 207], [1572, RG - 140], [1584, RG - 150], [1594, RG - 170]], SnL);
  for (let k = 0; k < 3; k++) { const y = farY(k, 1490); g.fillStyle = T('#120A18'); g.beginPath(); g.ellipse(1494, y - 6, 9, 14, 0, Math.PI, 0); g.lineTo(1503, y + 4); g.lineTo(1485, y + 4); g.fill(); const y2 = farY(k, 1690); g.beginPath(); g.ellipse(1686, y2 - 6, 9, 14, 0, Math.PI, 0); g.lineTo(1695, y2 + 4); g.lineTo(1677, y2 + 4); g.fill(); }
  box(g, mx - 40, RG - 110, 6, 90, T('#5A86D0')); box(g, mx - 40, RG - 110, 2, 90, T('#A8C8F0'));
  for (let x = 1450; x < 1730; x += 16) farPine(g, x + hash(x) * 6, RG, 14 + hash(x * 2) * 10, [T('#20403C'), T('#30584E')], Sn);
  // (the lagoon and the spray where they come down into it)
  box(g, 1740, RG - 4, 170, 8, T('#3A6CC8')); box(g, 1740, RG - 4, 170, 2, T('#A8CCF4'));
  for (let k = 0; k < 9; k++) pixelBlob(g, 1790 + hash(k) * 40, RG - 14 - hash(k * 3) * 20, 6 + hash(k * 2) * 6, 4 + hash(k * 5) * 4, T('#E8F4FF'));
  // (turrets and pennants among it; the meadow; a path with guests on it; mist low)
  for (const [tx, h, col] of [[380, 60, '#4A78D4'], [600, 46, '#C8508E'], [1020, 70, '#6A4A9A'], [1340, 52, '#4A78D4'], [1960, 64, '#3A8A6A']] as const) {
    const S = r4(T, '#C8BCD8'), w = 12 + h * 0.1;
    box(g, tx - w / 2, RG - h, w, h, S[1]); box(g, tx - w / 2, RG - h, w * 0.3, h, S[2]); box(g, tx - 1, RG - h + 8, 3, 5, winLit(tod, tx) ?? T('#4A4066'));
    poly(g, [[tx - w / 2 - 3, RG - h], [tx, RG - h - w * 1.5], [tx + w / 2 + 3, RG - h]], T(col)); box(g, tx - w / 2 - 3, RG - h - 2, w + 6, 2, Sn);
  }
  box(g, 0, RG, RW, RH - RG, T('#D8E2F2')); box(g, 0, RG, RW, 2, SnL);
  box(g, 0, RG + 12, RW, 8, T('#A8A2B8')); box(g, 0, RG + 12, RW, 1, T('#C8C2D8'));
  for (let i = 0; i < 140; i++) { const x = hash(i * 1.37) * RW, y = RG + 13 + hash(i * 2.1) * 6; box(g, x, y - 3, 2, 3, T(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA'][i % 5])); box(g, x, y - 5, 2, 2, T(['#F2C8A0', '#C47A48', '#6E4428'][i % 3])); }
  if (tod.lamps > 0.3) for (let k = 0; k < 3; k++) for (let x = 10; x < RW; x += 37) { if (x > 1450 && x < 1720) continue; box(g, x, farY(k, x) + 3, 1, 1, BULB[(x + k) % 4]); }
  mist(g, RW, RG - 60, 60, skyAt(0.9, tod), 0.0, 0.32, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The park near the ride

const NW = 1800, NH = 280, NG = 214;
const paintParkNear = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.12), Sn = T('#ECF2FC'), SnL = T('#FFFFFF'), night = tod.lamps > 0.3;
  // (the tree line behind: snowy pines, bare trees strung with lights)
  for (let x = 0; x < NW; x += 12) {
    const h = 60 + hash(x * 0.7) * 50;
    if (hash(x * 1.9) > 0.32) farPine(g, x + hash(x) * 5, NG - 20, h, [T('#1C3634'), T('#2C524A')], Sn);
    else { g.strokeStyle = T('#3E3038'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, NG - 20); g.lineTo(x, NG - 20 - h); for (let b = 0; b < 5; b++) { const by = NG - 20 - h * (0.35 + b * 0.13), s = b % 2 ? 1 : -1; g.moveTo(x, by); g.lineTo(x + s * (14 - b * 2), by - 10); } g.stroke(); if (night) for (let b = 0; b < 8; b++) box(g, x - 10 + hash(x + b) * 20, NG - 20 - h * (0.3 + hash(x * 2 + b) * 0.65), 2, 2, BULB[b % 4]); }
  }
  const shop = (x: number, w: number, h: number, i: number) => {
    const Pl = r4(T, ['#CDBCA6', '#C8B8C8', '#D8C8A8'][i % 3]), Tb = T('#4A3020'), Rf = r4(T, ['#3E4058', '#4A3E4A', '#344A5A'][i % 3]), top = NG - h;
    box(g, x - 1, top - 1, w + 2, h + 1, T(INK)); box(g, x, top, w, h, Pl[1]); box(g, x, top, 3, h, Pl[2]); box(g, x + w - 4, top, 4, h, Pl[0]);
    box(g, x, top + h * 0.45, w, 3, Tb); for (let k = x + 8; k < x + w - 4; k += 16) box(g, k, top, 2, h, Tb);
    for (let k = 0; k < Math.floor(w / 18); k++) { const c = winLit(tod, i * 9 + k) ?? T('#3A3456'); box(g, x + 5 + k * 18, top + 6, 8, 10, T(INK)); box(g, x + 6 + k * 18, top + 7, 6, 8, c); }
    box(g, x + w * 0.2, NG - 22, w * 0.6, 22, T(INK)); box(g, x + w * 0.2 + 1, NG - 21, w * 0.6 - 2, 21, night ? '#FFC870' : T('#E8C890'));
    const px = x + w / 2 + (hash(i * 9) - 0.5) * 6, rh = w * 0.55;
    poly(g, [[x - 5, top], [px, top - rh], [x + w + 5, top]], T(INK)); poly(g, [[x - 4, top], [px, top - rh + 1], [x + w + 4, top]], Rf[1]); poly(g, [[x - 4, top], [px, top - rh + 1], [px - 3, top]], Rf[2]);
    poly(g, [[x - 4, top - 1], [px, top - rh], [x + w + 4, top - 1], [x + w + 4, top - 4], [px, top - rh + 7], [x - 4, top - 4]], Sn);
    if (i % 2) { box(g, x + w * 0.7, top - rh * 0.6, 6, 14, T('#6A4A3A')); box(g, x + w * 0.7 - 1, top - rh * 0.6 - 2, 8, 3, SnL); }
  };
  const turretN = (x: number, w: number, h: number, roof: string, i: number) => {
    const S = r4(T, '#C8BCD8'), Rf = r4(T, roof);
    box(g, x - w / 2 - 1, NG - h, w + 2, h, T(INK)); box(g, x - w / 2, NG - h, w, h, S[1]); box(g, x - w / 2, NG - h, w * 0.3, h, S[2]); box(g, x + w * 0.2, NG - h, w * 0.3, h, S[0]);
    for (let k = 0; k < Math.floor(h / 16); k++) box(g, x - 1, NG - h + 8 + k * 16, 3, 6, winLit(tod, i * 7 + k) ?? T('#4A4066'));
    poly(g, [[x - w / 2 - 3, NG - h], [x, NG - h - w * 1.5], [x + w / 2 + 3, NG - h]], Rf[1]); poly(g, [[x - w / 2 - 3, NG - h], [x, NG - h - w * 1.5], [x - w * 0.12, NG - h]], Rf[2]);
    box(g, x - w / 2 - 3, NG - h - 2, w + 6, 2, Sn); box(g, x, NG - h - w * 1.5 - 10, 1, 10, T('#4A4060')); poly(g, [[x + 1, NG - h - w * 1.5 - 10], [x + 11, NG - h - w * 1.5 - 7], [x + 1, NG - h - w * 1.5 - 4]], T(i % 2 ? '#F49AC8' : '#F6D365'));
  };
  const canopy = (x: number, w: number, col: string, i: number) => {
    const h = 44;
    for (let k = x + 4; k < x + w; k += 40) box(g, k, NG - h, 2, h, T('#3A3448'));
    for (let k = 0; k < w; k += 10) poly(g, [[x + k, NG - h], [x + k + 5, NG - h - 10], [x + k + 10, NG - h]], T((k / 10) % 2 ? '#FFF4F8' : col));
    box(g, x, NG - h, w, 3, T(mix(col, INK, 0.4)));
    for (let r = 0; r < 2; r++) for (let k = x + 4; k < x + w - 4; k += 6) { const gx = k + r * 3, gy = NG - 4 - r * 6; box(g, gx, gy - 6, 3, 6, T(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA', '#E86AA8'][Math.floor(hash(gx * 1.3 + i) * 6)])); box(g, gx, gy - 9, 3, 3, T(['#F2C8A0', '#C47A48', '#6E4428', '#E8B890'][Math.floor(hash(gx * 2.1) * 4)])); }
    for (let k = x; k <= x + w; k += 16) box(g, k, NG - 16, 1, 16, T('#C8A040'));
    box(g, x, NG - 14, w, 1, T('#8A1A4A'));
  };
  const carousel = (x: number) => {
    const Pk = T('#E86AA8'), Wh = T('#FFF4F8'), Gd = r4(T, '#E0AE3A');
    box(g, x - 50, NG - 12, 100, 12, T('#6A3A8A')); box(g, x - 2, NG - 80, 4, 68, Gd[1]);
    for (let k = 0; k < 4; k++) { const hx = x - 36 + k * 24; box(g, hx, NG - 74, 1, 62, Gd[2]); box(g, hx - 7, NG - 40 - (k % 2) * 8, 14, 7, T(['#F4F0FA', '#E8C8A0', '#B8A0F0', '#F4F0FA'][k])); }
    for (let k = 0; k < 8; k++) poly(g, [[x - 56 + k * 14, NG - 76], [x, NG - 100], [x - 42 + k * 14, NG - 76]], k % 2 ? Pk : Wh);
    for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? Gd[1] : Pk; g.beginPath(); g.arc(x - 49 + k * 14, NG - 76, 7, 0, Math.PI); g.fill(); }
    if (night) for (let k = 0; k < 10; k++) box(g, x - 52 + k * 11, NG - 73, 2, 2, BULB[k % 2]);
  };
  const lamp = (x: number) => { box(g, x, NG - 44, 2, 44, T('#2A2840')); box(g, x - 3, NG - 50, 8, 7, night ? '#FFE9A8' : T('#E8D8A8')); };
  const topiary = (x: number) => { pixelBlob(g, x, NG - 16, 16, 12, T('#2E5A34')); pixelBlob(g, x + 14, NG - 34, 6, 12, T('#2E5A34')); pixelBlob(g, x + 20, NG - 46, 8, 5, T('#3E7244')); box(g, x - 12, NG - 28, 20, 2, Sn); };
  // (the park's buildings, rides and stalls, in turn)
  let x = 20;
  for (let i = 0; x < NW - 60; i++) {
    const kind = i % 7;
    if (kind === 0 || kind === 4) { const w = 80 + hash(i * 3) * 50; shop(x, w, 60 + hash(i * 5) * 30, i); x += w + 20; }
    else if (kind === 1) { turretN(x + 12, 22, 110 + hash(i) * 30, ['#4A78D4', '#C8508E', '#6A4A9A'][i % 3], i); x += 40; }
    else if (kind === 2) { const w = 140; canopy(x, w, ['#E0408A', '#2E5AAE', '#2E8A5A'][i % 3], i); x += w + 20; }
    else if (kind === 3) { carousel(x + 56); x += 130; }
    else if (kind === 5) { topiary(x + 16); lamp(x + 50); topiary(x + 76); x += 110; }
    else { turretN(x + 14, 28, 150 + hash(i * 7) * 20, '#4A78D4', i); x += 46; }
  }
  // (banners on poles between, lamp posts all along)
  for (let i = 0; i < 9; i++) { const bx = 90 + i * 200, by = NG - 120 - hash(i * 3) * 30; box(g, bx, by, 1, NG - by, T('#3A3448')); const col = ['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A'][i % 4]; box(g, bx + 1, by + 2, 10, 20, T(col)); poly(g, [[bx + 1, by + 22], [bx + 6, by + 18], [bx + 11, by + 22]], T(col)); }
  for (let lx = 40; lx < NW; lx += 120) lamp(lx);
  // (the paths, snow banked along them, the guests going about; the lawn down to the ride's park)
  box(g, 0, NG, NW, NH - NG, T('#4E7A42')); checker(g, 0, NG + 2, NW, 2, T('#5E8A4E'), 0, 2);
  box(g, 0, NG + 10, NW, 16, T('#A8A2B8')); box(g, 0, NG + 10, NW, 1, T('#C8C2D8')); box(g, 0, NG + 25, NW, 1, T('#7A748A'));
  box(g, 0, NG + 8, NW, 2, Sn); box(g, 0, NG + 26, NW, 2, Sn);
  for (let i = 0; i < 260; i++) { const gx = hash(i * 1.37) * NW, gy = NG + 14 + hash(i * 2.9) * 9; box(g, gx, gy - 4, 2, 4, T(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA', '#E86AA8', '#F4F0FA', '#3A3448'][i % 8])); box(g, gx, gy - 6, 2, 2, T(['#F2C8A0', '#C47A48', '#6E4428', '#E8B890'][i % 4])); }
  for (let i = 0; i < 30; i++) { const bx = hash(i * 4.3) * NW; box(g, bx, NG + 36 + hash(i) * 20, 30, 6, T('#4A3428')); for (let k = 0; k < 6; k++) box(g, bx + 2 + k * 5, NG + 35 + hash(i) * 20, 2, 2, T(['#F472B6', '#FDE047', '#A78BFA'][k % 3])); }
  hazeBands(g, 0, NG - 40, NW, 40, skyAt(0.92, tod), 0.0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------

const slide = { last: NaN, acc: 0 };
export const drawTragonsFar = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), tod = timeOfDay(), f = state.frame, v = viewOf(state), e = sceneEye(state, t);
  const he = toScreen(state, e.x, e.y), gs = toScreen(state, e.x, GY).y;
  const hz = Math.round(Math.max(110, Math.min(470, he.y))), G = Math.max(30, gs - he.y);
  const k = v.k, zs = 0.62 + 0.38 * k;
  // (how high the ride's taken the eye over its usual: the clouds come down into the picture)
  const up = Math.max(0, GY - 330 - e.y);
  // (how far the world's gone by, in screen px at the zoom it went by at: summed frame to frame, so a change of zoom
  // never swings the layers about; a jump (a respawn) just carries on from where it was)
  const scrollX = e.x + scrollOf(t);
  const dx = Number.isFinite(slide.last) ? scrollX - slide.last : 0;
  if (Math.abs(dx) < 400) slide.acc += dx * k;
  // (a bad frame never sticks: a NaN here would keep every layer off the screen for good)
  if (!Number.isFinite(slide.acc)) slide.acc = 0;
  slide.last = Number.isFinite(scrollX) ? scrollX : NaN;
  const off = (dl: number, base = 0) => slide.acc * dl + base;
  const tile = (key: string, o: number, top: number, h: number, tw: number, paint: (g: Ctx) => void) => {
    const sw = tw * zs;
    if (top > H || top + h * zs < 0) return;
    if (!Number.isFinite(o) || !Number.isFinite(top)) return;
    // (cached at a whole device scale and put down scaled: the zoom easing never repaints it: cache.ts. The one
    // picture, fetched once a layer, put straight into each repeat's scaled spot: no transform per repeat)
    const x0 = -(((o % sw) + sw) % sw), m = c.getTransform();
    const e = m.b === 0 && m.c === 0 ? bandedAt(`fa-tg-${key}-${tod.key}`, Math.abs(m.a) * zs, 0, 0, tw, h, paint) : null;
    if (!e) { for (let x = x0; x < W; x += sw) { c.save(); c.translate(Math.round(x), Math.round(top)); c.scale(zs, zs); banded(c, `fa-tg-${key}-${tod.key}`, 0, 0, tw, h, paint); c.restore(); } return; }
    const dw = (e.cv.width / e.s) * zs, dh = (e.cv.height / e.s) * zs, ty = Math.round(top);
    const sm = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = true;
    for (let x = x0; x < W; x += sw) c.drawImage(e.cv, Math.round(x), ty, dw, dh);
    c.imageSmoothingEnabled = sm;
  };
  /** Under a layer, its ground going on down a way (the next layer stands over it). */
  const under = (y: number, h: number, col: string) => { if (y < H) box(c, 0, Math.round(y) - 1, W, Math.min(H - y + 1, h), col); };
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [620, Math.max(40, hz - 210)], moon: [160, Math.max(40, hz - 230)], t: f, scroll: scrollX * 0.01 });
  // (the clouds at four heights: the high ones only once the ride's climbed)
  tile('cirrus', off(0.004) + f * 0.04, hz - 640 * zs + up * 0.28, CIH, CIW, g => paintCirrus(g, tod));
  tile('cu-high', off(0.006) + f * 0.05, hz - 560 * zs + up * 0.22, 190, CUW, g => paintCumulus(g, tod, 17, 1.3, 190));
  tile('cu-mid', off(0.008) + f * 0.06, hz - 360 * zs + up * 0.12, 160, CUW, g => paintCumulus(g, tod, 29, 1.05, 160));
  tile('cu-low', off(0.01) + f * 0.07, hz - 230 * zs + up * 0.05, 140, CUW, g => paintCumulus(g, tod, 3, 0.8, 140));
  if (tod.lamps > 0.45) fireworks(c, f, up * 0.5); else birds(c, f, up * 0.4);
  // (the Alps on the horizon)
  tile('alps', off(0.012), hz - (MH - 6) * zs, MH, MW, g => paintAlps(g, tod));
  // (the castle on its crag, drifting across as the ride goes, its foot among the far park)
  const at = MONUMENT_AT.tragons, kk = Math.min(1, t.dist / END_S);
  // (its size as the zoom has it: the engine's stamps scale the last one while a zoom's moving, never repainting)
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * kk), Math.round(hz + 40 + G * 0.03), at.k * zs, f);
  // (the park beyond: the glen's)
  const g1 = hz + G * 0.05, top1 = g1 - (GPG - 18) * zs;
  tile('park', off(0.05, 300), top1, GPH, GPW, g => paintGlenPark(g, tod));
  under(top1 + GPH * zs, 120, farCol(tod, 0.4)('#7482AE'));
  // (the rest of Truelling Tragons, across the park)
  const g2 = hz + G * 0.12 + 4, top2 = g2 - RG * zs;
  tile('ride', off(0.12, 900), top2, RH, RW, g => paintRideRow(g, tod));
  under(top2 + RH * zs, 120, farCol(tod, 0.3)('#D8E2F2'));
  // (the enchanted glen's forest edge)
  const g3 = hz + G * 0.22 + 8, top3 = g3 - GFG * zs;
  tile('glen', off(0.22, 140), top3, GFH, GFW, g => paintFarForest(g, tod));
  under(top3 + GFH * zs, 140, farCol(tod, 0.26)('#1E3A2E'));
  // (the park near the ride)
  const g4 = hz + G * 0.36 + 10, top4 = g4 - NG * zs;
  tile('near', off(0.36, 520), top4, NH, NW, g => paintParkNear(g, tod));
  under(top4 + NH * zs, H, farCol(tod, 0.12)('#4E7A42'));
  balloons(c, f, scrollX * 0.25, up * 0.5);
  snowfall(c, state, 34, 1, 0.35, 0.15, 0.5, 11);
  return true;
};
