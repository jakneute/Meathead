// The enchanted glen's far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the fireflies, the drifting motes and the castle's sparkles live). The glen's enchanted: green and in
// flower in the middle of the snow (the park's gag), the winter all round it far off:
//
//   the sky by the hour (banded, dithered between), stepped cumulus drifting; THE ALPS (the square's: snowfields, rock
//   ribs, no volcanoes); THE GREAT PIXIE'S CASTLE on its crag, bigger than from the wheel (monument.ts), always clear
//   over the treetops (its foot lost in them, more of it in the clearings); the park beyond the forest (snowy hills and
//   pines; THE FAIRY WHEEL he's come from, bulbs on after dark; Hogsmeat's steeple and clock tower; RAPUNZEL'S TOWER and
//   her braid; the BEANSTALK up into its cloud and the giant's castle on it; a windmill; TRUELLING TRAGONS' three
//   tracks knotted round their loops, its station, where he's going; gift-shop turrets and their pennants); the
//   storybook forest's far edge (round crowns in greens, blossom and lilac, frosted pines, a spire tree or two; a
//   clearing with a thatched cottage, a dark ride's castle front, its windows lit after dark; mist low in among them);
//   and nearer the forest proper (big oaks and beeches, their trunks with fairy doors and bracket fungi, ivy, lanterns
//   strung between them, toadstools at their feet, mist between).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, jag, mist } from '../../adventure/farArt';
import { stamp, hazeBands, pixelBlob } from '../../intro/art/kit';
import { box, mix, hash, checker, INK, type Ctx } from '../kit';
import { leafMass, limb, quad, knot } from './paint';
import { MONUMENT_AT, drawCastleAt } from '../monument';
import { SECTIONS, GY } from '../geometry';
import { paintAlps, MW, MH, farPine } from '../square/far';
import { farWheel, farTragons } from '../glimpse';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down as the camera climbs the lair's staircase). */
export const horizonY = (state: GameState) => Math.round(440 + Math.max(-20, Math.min(90, (50 - state.camera.y) * 0.1)));

const SKY = ['#2A3C8E', '#4068C0', '#6E96DC', '#A4C4EE', '#DCE2F2', '#F6D4DA'];

/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  if (y > H || y + h < 0) return;
  const tod = timeOfDay();
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `fa-gl-${key}-${tod.key}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** Four steps round a color (shade, itself, lit, highlight), for the hour. */
const r4 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.3)), T(mix(col, '#FFFFFF', 0.6))];
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const BULB = ['#FFE9A8', '#FFB0D8', '#A8E8FF', '#C8FFB8'];
const winLit = (tod: TimeOfDay, i: number) => tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : null) : (hash(i * 1.7) > 0.75 ? '#E8B070' : null);
/** A round crown in four steps (a pixel blob each: shade under, body, lit up and left, a highlight). */
const crown = (g: Ctx, x: number, y: number, r: number, R: string[], seed: number) => {
  const lumps = 3 + Math.floor(hash(seed) * 3);
  for (let k = 0; k < lumps; k++) { const a = (k / lumps) * Math.PI * 2 + seed, lx = x + Math.cos(a) * r * 0.45, ly = y + Math.sin(a) * r * 0.3; pixelBlob(g, lx, ly + 2, r * 0.7, r * 0.55, R[0]); }
  pixelBlob(g, x, y + 2, r, r * 0.8, R[0]);
  pixelBlob(g, x - r * 0.06, y - 1, r * 0.92, r * 0.72, R[1]);
  for (let k = 0; k < lumps; k++) { const a = (k / lumps) * Math.PI * 2 + seed; pixelBlob(g, x + Math.cos(a) * r * 0.42 - r * 0.1, y + Math.sin(a) * r * 0.28 - r * 0.12, r * 0.45, r * 0.34, R[1]); }
  pixelBlob(g, x - r * 0.28, y - r * 0.28, r * 0.5, r * 0.36, R[2]);
  pixelBlob(g, x - r * 0.4, y - r * 0.42, r * 0.22, r * 0.14, R[3]);
  checker(g, x - r * 0.9, y + r * 0.3, r * 1.8, 2, R[0], 0, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// Clouds: stepped cumulus

const CUW = 1100, CUH = 150;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#8C96C0', '#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 8; i++) {
    const cx = (i * CUW) / 8 + hash(i * 3.3 + 5) * 70, cy = 40 + hash(i * 5.1 + 5) * 70, s = 0.6 + hash(i * 7.7 + 5) * 0.8;
    const puffs = 4 + Math.floor(hash(i + 5) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.92], [2, -3, 0.75], [3, -6, 0.45]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 16 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 16 * s + dy * s;
        const r = (12 + hash(i * 11 + p + 5) * 10) * s * k;
        for (const ox of [0, CUW, -CUW]) pixelBlob(g, px + ox - (L === 3 ? 4 : 0), py, r * 1.3, r * 0.8, C[L]);
      }
    }
    for (const ox of [0, CUW, -CUW]) { box(g, cx + ox - puffs * 8 * s, cy + 10 * s, puffs * 16 * s, 3, C[0]); checker(g, cx + ox - puffs * 8 * s, cy + 8 * s, puffs * 16 * s, 2, C[0], 0, 2); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park beyond the forest: snowy hills, the wheel, Hogsmeat, Rapunzel's tower, the beanstalk, a windmill,
// Truelling Tragons, turrets

export const PW = 1800, PH = 270, PG = PH - 40;
const hills = (x: number) => snap2(PG - 30 + wave(x, PW, 1.7, 2) * 14 + jag(x, PW, 8, 13) * 4);

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

export const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.4), Sn = T('#E8EEF8'), SnL = T('#FFFFFF');
  // (the snowy hills: snow on their crowns, banded down into blue shade, pines along them)
  const HL = ['#5E6C98', '#7482AE', '#93A0C8', '#B8C4E0'].map(T);
  for (let x = 0; x < PW; x += 2) {
    const y = hills(x), lit = hills(x + 2) < hills(x - 2);
    box(g, x, y, 2, 6, lit ? SnL : Sn); box(g, x, y + 6, 2, 10, HL[lit ? 3 : 2]); box(g, x, y + 16, 2, 14, HL[lit ? 2 : 1]); box(g, x, y + 30, 2, PH - y - 30, HL[lit ? 1 : 0]);
  }
  checker(g, 0, PG - 6, PW, 2, HL[1], 0, 2);
  for (let x = 6; x < PW; x += 11) { const y = hills(x); if (hash(x * 0.3) > 0.35) farPine(g, x + hash(x) * 4, y + 8, 10 + hash(x * 1.3) * 12, [T('#22403E'), T('#335C52')], Sn); }
  // (THE FAIRY WHEEL, back the way he came)
  const wr = 52;
  farWheel(g, T, 130, PG - 30 - wr - 8, wr, PG - 24, tod.lamps > 0.3);
  // (Hogsmeat off past it: roofs, the steeple, the clock tower)
  for (let i = 0; i < 9; i++) {
    const x = 220 + i * 26 + hash(i * 5) * 6, w = 18 + hash(i * 2) * 12, h = 14 + hash(i * 3) * 18, top = PG - 24 - h;
    box(g, x, top, w, h + 24, T(['#A8968A', '#8A7E8E', '#B0A08C', '#9A8A7A'][i % 4])); box(g, x + w - 3, top, 3, h + 24, T('#6A5E6E'));
    for (let k = 0; k < Math.floor(w / 8); k++) box(g, x + 3 + k * 8, top + 5, 2, 3, winLit(tod, i * 5 + k) ?? T('#3A3456'));
    const px = x + w / 2 + (hash(i * 9) - 0.5) * 4;
    poly(g, [[x - 2, top], [px, top - w * 0.6], [x + w + 2, top]], T('#3E4058'));
    poly(g, [[x - 2, top], [px, top - w * 0.6], [px - 2, top - w * 0.6 + 4], [x - 2, top - 2]], Sn);
  }
  const stx = 300;
  box(g, stx - 6, PG - 100, 12, 76, T('#A49AB4')); box(g, stx - 6, PG - 100, 3, 76, T('#C4BCD2'));
  poly(g, [[stx - 8, PG - 100], [stx, PG - 140], [stx + 8, PG - 100]], T('#3A4058')); poly(g, [[stx - 8, PG - 100], [stx, PG - 140], [stx - 2, PG - 100]], Sn);
  box(g, stx - 1, PG - 150, 1, 10, T('#C8A040'));
  const ctx = 360;
  box(g, ctx - 9, PG - 90, 18, 66, T('#8E8298')); box(g, ctx - 9, PG - 90, 4, 66, T('#ACA0B6'));
  g.fillStyle = T('#F4ECD8'); g.beginPath(); g.arc(ctx, PG - 78, 6, 0, Math.PI * 2); g.fill(); box(g, ctx, PG - 83, 1, 5, T(INK)); box(g, ctx, PG - 78, 4, 1, T(INK));
  poly(g, [[ctx - 11, PG - 90], [ctx, PG - 108], [ctx + 11, PG - 90]], T('#3E4058')); poly(g, [[ctx - 11, PG - 90], [ctx, PG - 108], [ctx - 3, PG - 90]], Sn);
  // (RAPUNZEL'S TOWER: tall and thin, one window up top, her braid hanging out of it to the ground)
  const rx = 620, rtop = PG - 170;
  const St = r4(T, '#B8AAC4');
  box(g, rx - 10, rtop, 20, PG - 24 - rtop, T(INK)); box(g, rx - 9, rtop, 18, PG - 24 - rtop, St[1]); box(g, rx - 9, rtop, 5, PG - 24 - rtop, St[2]); box(g, rx + 4, rtop, 5, PG - 24 - rtop, St[0]);
  for (let y = rtop + 8; y < PG - 24; y += 9) box(g, rx - 9, y, 18, 1, St[0]);
  for (let k = 0; k < 6; k++) { box(g, rx - 12 + k * 4, rtop - 6, 3, 6, St[2]); }
  poly(g, [[rx - 14, rtop - 6], [rx, rtop - 46], [rx + 14, rtop - 6]], T('#7A3A8A')); poly(g, [[rx - 14, rtop - 6], [rx, rtop - 46], [rx - 3, rtop - 6]], T('#A05AB0'));
  box(g, rx - 14, rtop - 8, 28, 2, Sn); box(g, rx, rtop - 56, 1, 10, T('#4A4060')); poly(g, [[rx + 1, rtop - 56], [rx + 9, rtop - 53], [rx + 1, rtop - 50]], T('#F6D365'));
  box(g, rx - 4, rtop + 14, 8, 10, winLit(tod, 600) ?? T('#3A2A40')); box(g, rx - 4, rtop + 14, 8, 2, St[3]);
  for (let y = rtop + 22, k = 0; y < PG - 24; y += 2, k++) box(g, rx + 3 + ((k >> 1) % 2), y, 2, 2, T(k % 4 < 2 ? '#F6D365' : '#D8A838'));
  // (THE BEANSTALK, up into its cloud, the giant's castle on the cloud)
  const bx = 900;
  for (let y = PG - 24; y > 34; y -= 2) {
    const t = (PG - 24 - y) / (PG - 58), sx = bx + Math.sin(y * 0.05) * 9 * (1 - t * 0.4);
    box(g, sx - 4, y, 9, 2, T('#2E6A2A')); box(g, sx - 4, y, 3, 2, T('#4E9A3E')); box(g, sx + 3, y, 2, 2, T('#1E4A1E'));
    if (Math.floor(y / 2) % 9 === 0) { const s = Math.floor(y / 18) % 2 ? 1 : -1; poly(g, [[sx + s * 3, y], [sx + s * 16, y - 6], [sx + s * 12, y + 2]], T('#4E9A3E')); box(g, sx + s * 8, y - 2, 3, 1, T('#7AC85A')); }
  }
  const CL = ['#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (const [dx, dy, r] of [[-40, 30, 18], [-14, 22, 24], [16, 24, 22], [42, 30, 17], [0, 34, 26]] as const) { pixelBlob(g, bx + dx, dy + 4, r * 1.2, r * 0.6, CL[0]); pixelBlob(g, bx + dx - 2, dy, r * 1.1, r * 0.55, CL[1]); pixelBlob(g, bx + dx - 5, dy - 3, r * 0.6, r * 0.3, CL[2]); }
  const GC = r4(T, '#9C92B4');
  box(g, bx - 16, 2, 32, 18, GC[1]); box(g, bx - 16, 2, 8, 18, GC[2]); for (const tx of [bx - 20, bx + 14]) { box(g, tx, -8, 8, 28, GC[1]); poly(g, [[tx - 2, -8], [tx + 4, -22], [tx + 10, -8]], T('#4A4A7A')); }
  box(g, bx - 3, 10, 6, 10, T('#2A2440')); for (let k = 0; k < 4; k++) box(g, bx - 15 + k * 9, -1, 5, 3, GC[2]);
  // (a windmill: a stone tower, its cap, its sails crossed)
  const mx = 1130, mtop = PG - 90;
  poly(g, [[mx - 14, PG - 24], [mx - 9, mtop], [mx + 9, mtop], [mx + 14, PG - 24]], T('#C8B8A8')); poly(g, [[mx - 14, PG - 24], [mx - 9, mtop], [mx - 4, mtop], [mx - 7, PG - 24]], T('#E0D4C4'));
  poly(g, [[mx - 12, mtop], [mx, mtop - 16], [mx + 12, mtop]], T('#8A3A2A')); box(g, mx - 12, mtop - 2, 24, 2, Sn);
  box(g, mx - 3, PG - 40, 6, 16, T('#4A3428')); box(g, mx - 2, mtop + 16, 4, 5, winLit(tod, 1130) ?? T('#3A3456'));
  for (let k = 0; k < 4; k++) {
    const a = 0.4 + (k * Math.PI) / 2, ex = mx + Math.cos(a) * 46, ey = mtop - 4 + Math.sin(a) * 46;
    g.strokeStyle = T('#5A4030'); g.lineWidth = 2; g.beginPath(); g.moveTo(mx, mtop - 4); g.lineTo(ex, ey); g.stroke();
    const nx = -Math.sin(a) * 8, ny = Math.cos(a) * 8;
    poly(g, [[mx + Math.cos(a) * 12, mtop - 4 + Math.sin(a) * 12], [ex, ey], [ex + nx, ey + ny], [mx + Math.cos(a) * 12 + nx, mtop - 4 + Math.sin(a) * 12 + ny]], T('#E8E0D0'));
  }
  // (TRUELLING TRAGONS ahead: three tracks on lattice legs, knotted round their loops; the station)
  farTragons(g, T, 1240, 1640, PG - 24, tod.lamps > 0.3);
  turret(g, T, 470, PG - 24, 12, 40, '#4A78D4', tod, 1);
  turret(g, T, 760, PG - 24, 10, 30, '#C8508E', tod, 2);
  turret(g, T, 1020, PG - 24, 14, 46, '#6A4A9A', tod, 3);
  turret(g, T, 1680, PG - 24, 16, 52, '#4A78D4', tod, 4);
  turret(g, T, 1720, PG - 24, 10, 30, '#3A8A6A', tod, 5);
  // (the snowy meadows at their feet, mist coming up over them)
  box(g, 0, PG - 24, PW, 6, Sn); box(g, 0, PG - 24, PW, 1, SnL); box(g, 0, PG - 18, PW, PH - PG + 18, HL[1]);
  mist(g, PW, PG - 90, 90, skyAt(0.9, tod), 0.05, 0.45, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The storybook forest's far edge

export const FW = 1600, FG = 210, FH = FG + 220;
interface FarTree { x: number; r: number; y: number; kind: 'oak' | 'blossom' | 'lilac' | 'pine' | 'spire'; seed: number }
const FAR_TREES: FarTree[] = (() => {
  const out: FarTree[] = [];
  for (let x = 0, i = 0; x < FW; i++) {
    const s = i * 13 + 7, t = hash(s);
    // (the clearing: low hedges and the cottage there)
    if (x > 560 && x < 760) { x += 30; continue; }
    const kind: FarTree['kind'] = t > 0.9 ? 'spire' : t > 0.72 ? 'pine' : t > 0.6 ? 'blossom' : t > 0.52 ? 'lilac' : 'oak';
    const r = kind === 'pine' ? 14 + hash(s * 2) * 8 : kind === 'spire' ? 12 : 22 + hash(s * 2) * 16;
    out.push({ x, r, y: FG - 50 - hash(s * 3) * 30 - (kind === 'spire' ? 70 : 0), kind, seed: s });
    x += r * (kind === 'pine' || kind === 'spire' ? 1.3 : 1.15);
  }
  return out;
})();
export const paintFarForest = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.26);
  const OAK = r4(T, '#2E5E3E'), OAK2 = r4(T, '#3E6A34'), BLO = r4(T, '#C27AA4'), LIL = r4(T, '#8A78C0'), PIN = [T('#1A3634'), T('#2A4E46')], Sn = T('#E4ECF6');
  // (the forest's dark floor behind it all)
  box(g, 0, FG - 50, FW, FH - FG + 50, T('#1E3A2E'));
  for (let i = 0; i < 4; i++) { const y = FG + 4 + i * 26, col = T(['#22402F', '#264532', '#2A4A35', '#2E5038'][i]); box(g, 0, y, FW, FH - y, col); checker(g, 0, y - 2, FW, 2, col, i % 2, 2); }
  // (the back rank: a dark wall of crowns)
  for (let x = 0; x < FW; x += 18) crown(g, x, FG - 54 - hash(x * 0.7) * 16, 22, [T('#14302A'), T('#1E3E30'), T('#28503A'), T('#36624A')], x);
  // (the clearing: a thatched cottage, hedges, a dark ride's castle front)
  const cx = 660;
  box(g, cx - 34, FG - 40, 56, 34, T('#D8CCB0')); box(g, cx - 34, FG - 40, 14, 34, T('#ECE2CA')); box(g, cx + 16, FG - 40, 6, 34, T('#B0A488'));
  for (const [tx, ty] of [[-30, -34], [-30, -22], [-16, -40]] as const) { box(g, cx + tx, FG + ty, 2, 10, T('#5A3A28')); }
  box(g, cx - 28, FG - 30, 8, 8, winLit(tod, 660) ?? T('#3A3020')); box(g, cx + 2, FG - 30, 8, 8, winLit(tod, 661) ?? T('#3A3020'));
  box(g, cx - 12, FG - 20, 8, 14, T('#5A3A22'));
  poly(g, [[cx - 40, FG - 38], [cx - 8, FG - 64], [cx + 28, FG - 38]], T('#A88A4A')); poly(g, [[cx - 40, FG - 38], [cx - 8, FG - 64], [cx - 14, FG - 38]], T('#C8AA62'));
  for (let k = 0; k < 6; k++) box(g, cx - 36 + k * 10, FG - 40, 6, 2, T('#7A6230'));
  box(g, cx + 8, FG - 66, 6, 14, T('#7A5A4A')); box(g, cx + 7, FG - 68, 8, 2, T('#9A7A6A'));
  for (let x = 570; x < 750; x += 12) crown(g, x, FG - 12, 9, OAK2, x);
  // (the dark ride's front: a crooked little castle, a witch's head over its door, its windows lit)
  const dx = 1300;
  const DS = r4(T, '#6A5A7E');
  box(g, dx - 40, FG - 70, 80, 64, DS[1]); box(g, dx - 40, FG - 70, 18, 64, DS[2]); box(g, dx + 24, FG - 70, 16, 64, DS[0]);
  for (let k = 0; k < 7; k++) box(g, dx - 40 + k * 12, FG - 76, 8, 6, DS[1]);
  for (const tx of [dx - 46, dx + 34]) { box(g, tx, FG - 100, 14, 94, DS[1]); box(g, tx, FG - 100, 4, 94, DS[2]); poly(g, [[tx - 3, FG - 100], [tx + 7, FG - 130 - (tx > dx ? 10 : 0)], [tx + 17, FG - 100]], T('#3A2A50')); }
  g.fillStyle = T('#1A1424'); g.beginPath(); g.moveTo(dx - 12, FG - 6); g.lineTo(dx - 12, FG - 30); g.quadraticCurveTo(dx, FG - 44, dx + 12, FG - 30); g.lineTo(dx + 12, FG - 6); g.closePath(); g.fill();
  poly(g, [[dx - 14, FG - 50], [dx + 2, FG - 66], [dx + 16, FG - 56], [dx + 22, FG - 46], [dx + 8, FG - 44], [dx - 4, FG - 40]], T('#4A8A3A'));
  box(g, dx + 4, FG - 58, 3, 2, T('#F6D365')); poly(g, [[dx - 16, FG - 62], [dx + 4, FG - 86], [dx + 10, FG - 64]], T('#1A1424'));
  for (const wx of [dx - 30, dx + 22]) box(g, wx, FG - 56, 6, 10, winLit(tod, wx) ?? T('#2A2238'));
  // (the front rank: oaks, blossom, lilac (the enchanted ones), frosted pines, a spire tree or two)
  for (const t of FAR_TREES) {
    if (t.kind === 'pine' || t.kind === 'spire') {
      const h = t.kind === 'spire' ? 150 : 50 + t.r * 2;
      farPine(g, t.x, FG - 4, h, PIN, Sn);
      continue;
    }
    box(g, t.x - 2, t.y, 5, FG - t.y, T('#3A2A22')); box(g, t.x - 2, t.y, 2, FG - t.y, T('#5A4434'));
    crown(g, t.x, t.y, t.r, t.kind === 'blossom' ? BLO : t.kind === 'lilac' ? LIL : (t.seed % 2 ? OAK : OAK2), t.seed);
    if (t.kind === 'blossom') for (let k = 0; k < 6; k++) box(g, t.x - t.r * 0.6 + hash(t.seed + k) * t.r * 1.2, t.y - t.r * 0.5 + hash(t.seed * 2 + k) * t.r, 2, 2, T('#FFE0F0'));
    if (tod.lamps > 0.3 && t.seed % 3 === 0) for (let k = 0; k < 5; k++) box(g, t.x - t.r * 0.7 + k * t.r * 0.35, t.y + t.r * 0.4 - Math.sin(k) * 3, 1, 1, BULB[k % 4]);
  }
  hazeBands(g, 0, FG - 60, FW, 60, skyAt(0.92, tod), 0.0, 0.4, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The forest proper (nearer): big oaks, beeches and birches standing on the forest floor (their roots gripping it, moss
// heaped round their feet), fairy doors, glowing toadstools, fungus, ivy, boughs forking out into leaf, lanterns strung
// between (the wire sagging trunk to trunk)

/** How far back the forest proper stands (one eye with the play: its floor's on the ground line for this depth, and it
 *  slides along at this rate), behind everything in the glen (the meadow's far edge is at 0.62, a gorge's at 0.7). */
export const FOREST_D = 0.58;
const GW = 1400, GG = 684, GH = GG + 150;
interface Big { x: number; w: number; top: number; kind: 'oak' | 'beech' | 'birch'; seed: number }
const BIGS: Big[] = (() => {
  const out: Big[] = [];
  for (let x = 30, i = 0; x < GW - 120; i++) {
    const s = i * 17 + 3, t = hash(s);
    const kind: Big['kind'] = t > 0.75 ? 'birch' : t > 0.45 ? 'beech' : 'oak';
    const w = kind === 'birch' ? 12 + hash(s * 2) * 6 : 22 + hash(s * 2) * 20;
    out.push({ x, w, top: 130 + hash(s * 3) * 30, kind, seed: s });
    x += 120 + hash(s * 5) * 110;
  }
  return out;
})();
/** Six steps round a color (shadow .. highlight), for the hour. */
const r6 = (T: (c: string) => string, col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.28), mix(col, '#FFFFFF', 0.56)].map(T);
const BARKC: Record<Big['kind'], string> = { oak: '#5E4432', beech: '#6E6E7E', birch: '#C8C6BC' };
const LEAFC: Record<Big['kind'], string> = { oak: '#346440', beech: '#3E6E44', birch: '#5A8A44' };
/** The forest floor's color nearest him (what's under the tile, if the floor runs off its foot). */
const FLOORC = '#30583C';
const ff = (tod: TimeOfDay) => r6(farCol(tod, 0.12), FLOORC);

/** A toadstool that glows after dark (by day just pale): its stem, its cap in steps, its spots. */
const glowCap = (g: Ctx, x: number, y: number, s: number, col: string, T: (c: string) => string, night: boolean) => {
  const C = night ? [mix(col, INK, 0.4), col, mix(col, '#FFFFFF', 0.5)] : [T(mix(col, INK, 0.45)), T(mix(col, '#9AA0A8', 0.35)), T(mix(col, '#FFFFFF', 0.3))];
  if (night) { g.globalAlpha = 0.22; g.fillStyle = col; g.fillRect(Math.round(x - 7 * s), Math.round(y - 12 * s), Math.round(14 * s), Math.round(14 * s)); g.globalAlpha = 0.35; g.fillRect(Math.round(x - 4 * s), Math.round(y - 9 * s), Math.round(8 * s), Math.round(8 * s)); g.globalAlpha = 1; }
  box(g, x - 1.5 * s, y - 6 * s, 3 * s, 6 * s, T(INK)); box(g, x - s, y - 6 * s, 2 * s, 6 * s, night ? mix(col, '#FFFFFF', 0.6) : T('#E2DCC8'));
  g.fillStyle = T(INK); g.beginPath(); g.ellipse(x, y - 6 * s, 5 * s + 1, 3.5 * s + 1, 0, Math.PI, 0); g.fill();
  g.fillStyle = C[1]; g.beginPath(); g.ellipse(x, y - 6 * s, 5 * s, 3.5 * s, 0, Math.PI, 0); g.fill();
  box(g, x - 5 * s, y - 7 * s, 10 * s, 1, C[0]); box(g, x - 3 * s, y - 9 * s, 3 * s, 1, C[2]); box(g, x + s, y - 8 * s, 1, 1, C[2]);
};

/** A fern: fronds fanned out from the ground, each lit along its top. */
const fern = (g: Ctx, x: number, y: number, s: number, F: string[]) => {
  for (let f = -3; f <= 3; f++) { const tx = x + f * 6 * s, ty = y - (14 - Math.abs(f) * 3) * s; poly(g, [[x, y], [tx, ty], [tx + Math.sign(f || 1) * 2 * s, ty + 3 * s], [x + f * 2 * s, y]], F[2 + (f & 1)]); box(g, tx - 1, ty, 2, 1, F[4]); }
};

/** The forest floor coming toward him from the trees (bands lighter as they come, dithered between) and what's on it
 *  between y0 and y1 (ferns, stones, tufts and flowers, a fallen branch, toadstools that glow after dark). */
const floorStuff = (g: Ctx, T: (c: string) => string, F: string[], y0: number, y1: number, night: boolean, salt: number) => {
  const St = r6(T, '#7A7890'), Ca = ['#7AE8F0', '#F49AD8', '#C8F070'];
  for (let x = 6; x < GW; x += 9 + Math.floor(hash(x * 0.37 + salt) * 14)) {
    const y = y0 + hash(x * 1.31 + salt) * (y1 - y0), s = 0.7 + ((y - (GG - 24)) / 160) * 0.9, t = hash(x * 2.7 + salt);
    if (t > 0.86) fern(g, x, y, s, F);
    else if (t > 0.74) { pixelBlob(g, x, y - 2 * s, 5 * s, 3 * s, St[1]); pixelBlob(g, x - 1, y - 3 * s, 3.5 * s, 2 * s, St[3]); box(g, x - 2 * s, y - 4.5 * s, 2, 1, St[5]); }
    else if (t > 0.7) for (let k = 0; k < 3; k++) glowCap(g, x + k * 5 * s - 4, y + (k % 2) * 2, s * (0.7 + (k % 2) * 0.3), Ca[Math.floor(hash(x) * 3)], T, night);
    else if (t > 0.45) { box(g, x, y - 4 * s, 1, 4 * s, F[4]); box(g, x + 2, y - 6 * s, 1, 6 * s, F[3]); box(g, x + 4, y - 3 * s, 1, 3 * s, F[4]); }
    else if (t > 0.38) { box(g, x, y - 3, 2, 2, T(['#F49AC8', '#FDE68A', '#FFFFFF', '#A8C8FF'][Math.floor(hash(x * 5) * 4)])); box(g, x, y - 1, 1, 2, F[2]); }
    else if (t < 0.02 && y > GG + 16) {
      // (a fallen branch, moss on it)
      const B = r6(T, BARKC.oak), M = r6(T, '#4E7E3A'), l = 30 + hash(x) * 30;
      box(g, x - 1, y - 6, l + 2, 7, T(INK)); box(g, x, y - 5, l, 5, B[2]); box(g, x, y - 5, l, 1, B[4]); box(g, x, y - 1, l, 1, B[0]);
      box(g, x + l * 0.3, y - 7, l * 0.4, 2, M[3]); box(g, x + l * 0.3, y - 7, l * 0.2, 1, M[4]);
      g.fillStyle = B[1]; g.beginPath(); g.ellipse(x + l, y - 3, 2, 3, 0, 0, Math.PI * 2); g.fill(); box(g, x + l - 1, y - 4, 1, 1, B[4]);
    }
  }
};

/** One of the big trees, standing on the floor at GG (`ox`: drawn again a tile over, so the tile wraps). */
const paintBig = (g: Ctx, b: Big, ox: number, T: (c: string) => string, F: string[], tod: TimeOfDay) => {
  const night = tod.lamps > 0.3, ink = T(INK), R = r6(T, BARKC[b.kind]), M = r6(T, '#4E7E3A'), Lf = r6(T, LEAFC[b.kind]);
  const x = b.x + ox, w = b.w, top = b.top, cx = x + w / 2, birch = b.kind === 'birch', fy = GG - 72, foot = GG - 4;
  const flare = (y: number) => (y <= fy ? 0 : w * 0.55 * Math.pow((y - fy) / (foot - fy), 2.4));
  // (its shadow on the floor round its foot)
  pixelBlob(g, cx + 4, GG - 1, w * 1.8, 6, F[0]); checker(g, cx - w * 1.9, GG - 6, w * 3.9, 2, F[0], 0, 1);
  // (the boughs off it first: the trunk goes over where they join)
  if (!birch) {
    const s = b.seed % 2 ? 1 : -1, by = top + 120 + hash(b.seed * 7) * 120, ex = cx + s * (50 + w), ey = by - 10;
    const main = quad(cx + s * w * 0.3, by + 30, cx + s * (w * 0.5 + 30), by, ex, ey);
    const [fx, fy2] = main(0.6);
    limb(g, quad(fx, fy2, fx + s * 8, fy2 - 22, fx - s * 4, fy2 - 40), Math.max(2, w * 0.12), 1, R, ink, 6);
    limb(g, main, Math.max(3, w * 0.3), 1.5, R, ink, 10);
    if (b.seed % 4 === 1) {
      // (a lantern hung off it)
      const [lx, ly] = main(0.5);
      for (let y = ly + 3; y < ly + 18; y += 3) box(g, lx, y, 1, 2, T('#4C4A66'));
      box(g, lx - 3, ly + 18, 7, 9, ink); box(g, lx - 2, ly + 19, 5, 7, night ? '#FFD88A' : T('#D8B880')); box(g, lx - 2, ly + 19, 5, 2, night ? '#FFF4C8' : T('#E8D0A0')); box(g, lx - 4, ly + 17, 9, 2, T('#36344E'));
      if (night) { g.globalAlpha = 0.18; g.fillStyle = '#FFC870'; g.fillRect(Math.round(lx - 10), Math.round(ly + 12), 21, 21); g.globalAlpha = 1; }
    }
    leafMass(g, fx - s * 4, fy2 - 48, 16, Lf, b.seed + 5);
    leafMass(g, ex, ey - 16, 22, Lf, b.seed + 3);
  } else {
    // (a birch's thin limbs drooping, little clumps along them)
    for (let k = 0; k < 2; k++) {
      const s = k ? 1 : -1, by = top + 90 + hash(b.seed * 3 + k) * 200, ex = cx + s * (26 + w), ey = by + 6;
      limb(g, quad(cx, by + 10, cx + s * (w * 0.5 + 10), by - 12, ex, ey), 3, 1, R, ink, 6);
      leafMass(g, ex, ey - 4, 11, Lf, b.seed + k * 7);
    }
  }
  // (the trunk: its straight run, stepped across: lit left, its core shadow, light thrown back up off the floor down
  //  its right; then its foot flaring out onto the floor, row by row)
  const shade = (l: number, ww: number, y: number, h: number) => {
    const q = (f: number) => Math.round(ww * f);
    box(g, l - 1, y, ww + 2, h, ink); box(g, l, y, ww, h, R[3]); box(g, l, y, q(0.24), h, R[4]); box(g, l + 1, y, Math.max(1, q(0.07)), h, R[5]);
    box(g, l + q(0.58), y, q(0.16), h, R[2]); box(g, l + q(0.72), y, q(0.16), h, R[1]); box(g, l + q(0.86), y, ww - q(0.86) - 1, h, R[2]); box(g, l + ww - 1, y, 1, h, R[0]);
  };
  shade(x, w, top, fy - top);
  checker(g, x + Math.round(w * 0.24), top, 2, fy - top, R[4], 0, 1); checker(g, x + Math.round(w * 0.58), top, 2, fy - top, R[2], 1, 1); checker(g, x + Math.round(w * 0.72), top, 2, fy - top, R[1], 0, 1);
  for (let y = fy; y < foot; y += 2) { const e = flare(y); shade(x - e * 0.9, w + e * 1.9, y, 2); }
  // (the bark: an oak's grooves and the cracks across its plates; a beech smooth, its rings and the eyes where limbs
  //  fell; a birch's black marks; all following the flare out at the foot)
  const along = (gx0: number, y: number) => { const e = flare(y), rel = (gx0 - cx) / (w / 2); return gx0 + rel * e * (rel < 0 ? 0.9 : 1); };
  if (b.kind === 'oak') {
    for (let k = 0; k < Math.floor(w / 5); k++) {
      const gx0 = x + 3 + k * 5 + hash(b.seed + k) * 2, u = (gx0 - x) / w;
      for (let y = top; y < foot - 2; y += 4) {
        const wob = Math.round(Math.sin((y + k * 13 + b.seed) * 0.06) * 1.2), gx = along(gx0, y) + wob, r = hash(y * 0.13 + k + b.seed);
        box(g, gx, y, 1, 4, u < 0.55 ? R[2] : R[0]);
        if (r > 0.86) box(g, gx + 1, y, 2, 2, u < 0.3 ? R[5] : u < 0.6 ? R[4] : R[2]);
        else if (r < 0.05 && u < 0.8) { box(g, gx + 1, y, 4, 1, R[1]); box(g, gx + 1, y + 1, 4, 1, u < 0.5 ? R[4] : R[2]); }
      }
    }
  } else if (b.kind === 'beech') {
    for (let y = top + 20; y < fy; y += 34 + Math.floor(hash(y + b.seed) * 40)) { box(g, x + w * 0.1, y, w * 0.5, 1, R[2]); box(g, x + w * 0.62, y, w * 0.25, 1, R[1]); box(g, x + w * 0.1, y + 1, w * 0.4, 1, R[4]); }
    for (let k = 0; k < 3; k++) {
      const ey = top + 60 + hash(b.seed * 5 + k) * (fy - top - 120), ex = x + w * (0.3 + hash(b.seed + k * 3) * 0.3);
      for (let i = -4; i <= 4; i++) box(g, ex + i, ey + Math.round((i * i) / 6), 1, 1, R[0]);
      box(g, ex - 3, ey - 2, 6, 1, R[4]);
    }
    for (let k = 0; k < 4; k++) pixelBlob(g, x + w * (0.12 + hash(b.seed * 9 + k) * 0.25), top + 40 + hash(b.seed * 11 + k) * (fy - top - 60), 3, 2, T('#A8B890'));
  } else {
    for (let y = top + 4; y < foot - 4; y += 5 + Math.floor(hash(y * 0.7 + b.seed) * 8)) { const bx = along(x + hash(y + b.seed) * (w - 5), y); box(g, bx, y, 3 + hash(y * 2) * 5, 2, R[0]); box(g, bx + 1, y + 2, 2, 1, R[1]); }
    // (a birch's foot dark and rough)
    for (let y = GG - 50; y < foot; y += 2) { const e = flare(y), l = x - e * 0.9, ww = w + e * 1.9; for (let k = 0; k < ww; k += 3) if (hash(k * 1.7 + y * 0.3 + b.seed) > 0.45 + (GG - y) / 120) box(g, l + k, y, 2, 2, R[k < ww * 0.5 ? 1 : 0]); }
  }
  if (!birch) for (let k = 0; k < 2; k++) if (hash(b.seed * 13 + k) > 0.3) knot(g, x + w * (0.3 + hash(b.seed * 17 + k) * 0.3), top + 120 + hash(b.seed * 19 + k) * (fy - top - 200), 2 + hash(b.seed + k) * 2, R);
  // (moss up its shaded side from the floor, dithered off; on its root tops)
  if (!birch) {
    const mh = 90 + hash(b.seed * 23) * 110;
    for (let y = foot - mh; y < foot; y += 2) {
      const e = flare(y), l = x - e * 0.9, ww = w + e * 1.9, u = (foot - y) / mh, mw = ww * (0.38 - u * 0.12);
      box(g, l + ww - mw - 1, y, mw, 2, u > 0.8 ? (Math.floor(y / 2) % 2 ? M[2] : R[1]) : M[2]);
      if (u < 0.75 && hash(y * 0.31 + b.seed) > 0.8) box(g, l + ww - mw, y, 2, 1, M[4]);
    }
    checker(g, x + w * 0.56, foot - mh - 10, w * 0.32, 10, M[2], 0, 1);
  }
  // (ivy up some)
  if (b.seed % 3 === 1) for (let y = foot - 6; y > top + 80; y -= 4) { const ix = cx + Math.sin(y * 0.045 + b.seed) * w * 0.36; box(g, ix, y, 1, 4, Lf[1]); if (Math.floor(y / 4) % 2 === 0) { const sd = Math.floor(y / 8) % 2 ? 1 : -2; box(g, ix + sd, y, 3, 3, Lf[2]); box(g, ix + sd, y, 1, 1, Lf[4]); } }
  // (bracket fungi, in steps)
  for (let k = 0; k < 3; k++) {
    const fy3 = top + 80 + hash(b.seed + k * 3) * (fy - top - 120), fw = 8 + hash(b.seed * 2 + k) * 6, fx = k % 2 ? x - fw * 0.55 : x + w - fw * 0.45, Fu = r6(T, '#D8B888');
    box(g, fx - 1, fy3 - 1, fw + 2, 6, ink); box(g, fx, fy3, fw, 2, Fu[4]); box(g, fx, fy3, fw * 0.5, 1, Fu[5]); box(g, fx + 1, fy3 + 2, fw - 2, 2, Fu[3]); box(g, fx + 2, fy3 + 4, fw - 4, 1, Fu[1]);
  }
  // (its roots: out over the floor either side and gripping down into it, one coming toward him; moss over their
  //  backs, their tips going under)
  const nr = 4 + (b.seed % 2);
  for (let i = 0; i < nr; i++) {
    const s = i % 2 ? 1 : -1, k = Math.floor(i / 2), sx = cx + s * (w * 0.35 + k * w * 0.12), l = w * (0.55 + hash(b.seed * 3 + i) * 0.5) * (1 - k * 0.2), ey = GG + 1 + k * 3 + hash(b.seed + i) * 3;
    const P = quad(sx, foot - 8 - k * 3, sx + s * l * 0.55, foot - 6, sx + s * l, ey);
    limb(g, P, Math.max(3, w * 0.2 - k * 1.5), 1, R, ink, 6);
    const [mx, my] = P(0.35); box(g, mx - 2, my - 3, 5, 1, M[3]); box(g, mx - 1, my - 4, 2, 1, M[4]);
    const [tx, ty] = P(1); pixelBlob(g, tx, ty, 4, 2, F[2]); box(g, tx - 2, ty - 2, 1, 2, F[4]); box(g, tx + 1, ty - 3, 1, 3, F[3]);
  }
  poly(g, [[cx - w * 0.22, foot - 2], [cx + w * 0.12, foot - 2], [cx + w * 0.02, GG + 9], [cx - w * 0.1, GG + 9]], ink);
  poly(g, [[cx - w * 0.2, foot - 2], [cx + w * 0.1, foot - 2], [cx + w * 0.01, GG + 8], [cx - w * 0.09, GG + 8]], R[2]);
  box(g, cx - w * 0.18, foot - 2, Math.max(1, w * 0.08), 8, R[4]);
  // (moss and grass heaped round its foot, tufts lit at their tips)
  const span = w * 1.5 + w * 0.6;
  pixelBlob(g, cx, GG + 1, span * 0.62, 4, M[1]); pixelBlob(g, cx - 2, GG, span * 0.5, 3, M[2]);
  for (let k = 0; k < span; k += 3) { const tx = cx - span / 2 + k, th = 2 + hash(k * 0.7 + b.seed) * 4; if (hash(k * 1.3 + b.seed) > 0.4) { box(g, tx, GG + 1 - th, 1, th, M[3]); box(g, tx, GG + 1 - th, 1, 1, M[5]); } }
  // (a fairy door at the foot of the wide ones: its frame, its planks, its round window lit, a step; a lantern by it)
  if (w > 28 && b.seed % 2 === 1) {
    const dx = cx - w * 0.12, dy = foot - 2, dw = 10, dh = 15, Dc = r6(T, ['#8A2A5A', '#2A6A6A', '#6A3A8A'][b.seed % 3]);
    const arch = (pad: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(dx - dw / 2 - pad, dy); g.lineTo(dx - dw / 2 - pad, dy - dh + dw / 2); g.arc(dx, dy - dh + dw / 2, dw / 2 + pad, Math.PI, 0); g.lineTo(dx + dw / 2 + pad, dy); g.closePath(); g.fill(); };
    arch(2, ink); arch(1, R[1]); arch(0, Dc[3]);
    box(g, dx - dw / 2, dy - dh + 4, 2, dh - 4, Dc[4]); box(g, dx + dw / 2 - 2, dy - dh + 4, 2, dh - 4, Dc[1]); box(g, dx, dy - dh + 6, 1, dh - 6, Dc[1]);
    box(g, dx - 2, dy - dh + 2, 4, 4, ink); box(g, dx - 1, dy - dh + 3, 2, 2, night ? '#FFD88A' : T('#C8A070'));
    box(g, dx + 3, dy - 7, 1, 1, T('#F6D365'));
    box(g, dx - 7, dy, 14, 2, ink); box(g, dx - 6, dy, 12, 1, T('#9A94AE'));
    box(g, dx + dw / 2 + 3, dy - 12, 3, 5, ink); box(g, dx + dw / 2 + 4, dy - 11, 1, 3, night ? '#FFE8A0' : T('#E8C888'));
    if (night) { g.globalAlpha = 0.2; g.fillStyle = '#FFC870'; g.fillRect(Math.round(dx - 8), Math.round(dy - 18), 22, 18); g.globalAlpha = 1; }
  }
  // (toadstools glowing round its roots after dark)
  if (b.seed % 3 !== 2) { const col = ['#7AE8F0', '#F49AD8', '#C8F070'][b.seed % 3]; for (let k = 0; k < 3; k++) glowCap(g, cx + [-(w * 0.75 + 6), w * 0.7 + 4, w * 0.95 + 10][k], GG + 2 + (k % 2) * 3, 0.8 + hash(b.seed + k) * 0.5, col, T, night); }
  // (its crown up in the canopy, the limbs forking up into it)
  for (const s of [-1, 1]) limb(g, quad(cx, top + 40, cx + s * w * 0.3, top + 10, cx + s * w * 0.9, top - 14), Math.max(2, w * 0.32), 2, R, ink, 6);
  leafMass(g, cx, top - 4, 40 + w * 0.6, Lf, b.seed);
};

/** The fairy lights between two trunks: the wire knotted round each, sagging between (lower in the middle the longer
 *  the run), bulbs on it and little lanterns hung off it on drops; lit after dark. */
const paintLights = (g: Ctx, ax: number, ya: number, bx: number, yb: number, i: number, T: (c: string) => string, tod: TimeOfDay) => {
  const night = tod.lamps > 0.3, span = bx - ax, sag = 14 + span * 0.12, ink = T(INK), wire = T('#2A2430');
  const Y = (t: number) => ya + (yb - ya) * t + 4 * sag * t * (1 - t);
  box(g, ax - 3, ya - 1, 4, 3, ink); box(g, ax - 3, ya - 1, 4, 1, T('#4A4458')); box(g, bx - 1, yb - 1, 4, 3, ink); box(g, bx - 1, yb - 1, 4, 1, T('#4A4458'));
  for (let x = 0; x <= span; x++) box(g, ax + x, Y(x / span), 1, 1, wire);
  const n = Math.max(4, Math.floor(span / 16));
  for (let k = 1; k < n; k++) {
    const t = k / n, lx = ax + span * t, ly = Y(t), col = BULB[(i + k) % 4];
    if (k % 3 === 0) {
      box(g, lx, ly + 1, 1, 4, wire); box(g, lx - 2, ly + 5, 5, 6, ink); box(g, lx - 1, ly + 6, 3, 4, night ? '#FFD88A' : T('#E8C888')); box(g, lx - 1, ly + 6, 3, 1, night ? '#FFF4C8' : T('#F2DCA8'));
      if (night) { g.globalAlpha = 0.18; g.fillStyle = '#FFC870'; g.fillRect(Math.round(lx - 6), Math.round(ly + 2), 13, 13); g.globalAlpha = 1; }
    } else {
      box(g, lx - 1, ly + 1, 3, 4, ink); box(g, lx, ly + 2, 1, 2, night ? col : T(mix(col, '#8A8A9A', 0.3))); box(g, lx - 1, ly + 1, 3, 1, T('#3A3A48'));
      if (night) { g.globalAlpha = 0.25; g.fillStyle = col; g.fillRect(Math.round(lx - 3), Math.round(ly), 7, 7); g.globalAlpha = 1; }
    }
  }
};

const paintForest = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.12), night = tod.lamps > 0.3, F = ff(tod);
  // (the far trunks between, thin and misty, up into the canopy, standing on the floor's far edge; the canopy only
  //  seen from up high: a ceiling of leaves in steps across the top, hanging down in lobes)
  const FT = farCol(tod, 0.42);
  for (let x = 40; x < GW; x += 90 + Math.floor(hash(x) * 40)) {
    const w = 5 + hash(x) * 6;
    box(g, x, 120, w, GG - 142, FT('#2A3A34')); box(g, x, 120, 2, GG - 142, FT('#3E5248'));
    box(g, x - 2, GG - 30, w + 4, 8, FT('#2A3A34')); box(g, x - 4, GG - 26, w + 8, 4, FT('#22302C'));
  }
  for (let x = 0; x < GW; x += 26) crown(g, x, 104 + hash(x * 1.3) * 26, 30, [T('#12281F'), T('#1C382A'), T('#284C36'), T('#3A6446')], x * 0.7);
  mist(g, GW, GG - 324, 284, skyAt(0.9, tod), 0.0, 0.3, 6);
  // (the floor: its far edge at the far trunks' feet, coming toward him in bands, lighter as they come)
  const bands: [number, string][] = [[GG - 24, F[1]], [GG - 12, F[1]], [GG + 4, F[2]], [GG + 30, F[2]], [GG + 66, F[3]], [GG + 110, F[3]]];
  bands.forEach(([y, col], i) => { box(g, 0, y, GW, GH - y, col); if (i) checker(g, 0, y - 2, GW, 2, col, i % 2, 1); });
  box(g, 0, GG - 24, GW, 1, F[2]);
  floorStuff(g, T, F, GG - 20, GG - 6, night, 1);
  // (the big trees, standing on it; drawn again a tile over where they'd cross its edge, so it wraps)
  for (const b of BIGS) {
    paintBig(g, b, 0, T, F, tod);
    if (b.x < 220) paintBig(g, b, GW, T, F, tod);
    if (b.x > GW - 260) paintBig(g, b, -GW, T, F, tod);
  }
  // (lanterns strung tree to tree, sagging; their glass lit after dark)
  for (let i = 0; i < BIGS.length; i++) {
    const a = BIGS[i], last = i === BIGS.length - 1, b = last ? BIGS[0] : BIGS[i + 1], bxw = last ? b.x + GW : b.x;
    const ya = GG - 230 - (i % 3) * 34, yb = GG - 236 - ((i + 1) % 3) * 30;
    for (const ox of last ? [0, -GW] : [0]) paintLights(g, a.x + a.w + ox, ya, bxw + ox, yb, i, T, tod);
  }
  // (the floor in front of their feet)
  floorStuff(g, T, F, GG + 4, GH - 4, night, 2);
  mist(g, GW, GG - 160, 110, skyAt(0.94, tod), 0.0, 0.14, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Live: fireflies after dark, motes drifting by day

const fireflies = (c: Ctx, state: GameState, hz: number, tod: TimeOfDay) => {
  const f = state.frame, n = Math.round(30 * Math.min(1, (tod.lamps - 0.2) * 2));
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 1.37 + 2), h2 = hash(i * 2.71 + 9), ph = i * 1.9;
    const x = ((h1 * (W + 80) + Math.sin(f * 0.013 + ph) * 30 - state.camera.x * (0.2 + h2 * 0.2)) % (W + 80) + W + 80) % (W + 80) - 40;
    const y = hz - 150 + h2 * 200 + Math.sin(f * 0.021 + ph * 2) * 18;
    const on = Math.sin(f * 0.07 + ph * 3);
    if (on < 0) continue;
    c.globalAlpha = 0.25 * on; c.fillStyle = '#E8FF8A'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
    c.globalAlpha = Math.min(1, 0.5 + on); c.fillStyle = on > 0.7 ? '#FFFFD0' : '#D8F270'; c.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
  c.globalAlpha = 1;
};
const motes = (c: Ctx, state: GameState, hz: number) => {
  const f = state.frame;
  for (let i = 0; i < 18; i++) {
    const h1 = hash(i * 3.1 + 4), h2 = hash(i * 1.3 + 8);
    const x = ((h1 * (W + 40) + f * 0.2 + Math.sin(f * 0.02 + i) * 12 - state.camera.x * 0.3) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = hz - 200 + ((h2 * 260 - f * 0.12) % 260 + 260) % 260;
    c.globalAlpha = 0.5 + 0.4 * Math.sin(f * 0.1 + i); c.fillStyle = i % 3 ? '#FFF6C8' : '#FFD0E8';
    c.fillRect(Math.round(x), Math.round(y), 1, 1); if (i % 4 === 0) { c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); }
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------

/** The far off's horizon lifted off the old one (so the far forest's feet show over the forest proper's floor). */
const LIFT = 60;
export const drawGlenFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cx = state.camera.x, f = state.frame;
  // (the forest proper's floor on the ground line for its depth (the one eye: the play's); the far off's horizon kept
  //  over it however he climbs or drops, its far forest's feet just over that floor's far edge)
  const eyeY = H * 0.42, base = Math.round(eyeY + (GY - state.camera.y - eyeY) * FOREST_D);
  const hz = Math.min(horizonY(state) - LIFT, base - 16);
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [640, 110], moon: [150, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.06, hz - 390, CUH, CUW, g => paintClouds(g, tod));
  tile(c, 'alps', cx * 0.03, hz - MH + 6, MH, MW, g => paintAlps(g, tod));
  // (the castle on its crag, drifting across as he goes, its foot lost in the trees)
  const at = MONUMENT_AT.glen, { x0, x1 } = SECTIONS.glen, k = Math.max(0, Math.min(1, (cx - x0) / Math.max(1, x1 - x0 - W)));
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), Math.round(at.base + (hz - 440)), at.k, f);
  // (laid from the section's start: the wheel he's come from back to the left, Truelling Tragons coming in on the right
  //  as he nears its queue)
  tile(c, 'park', (cx - x0) * 0.06, hz - PG - 20, PH, PW, g => paintPark(g, tod));
  tile(c, 'farwood2', cx * 0.13, hz - FG - 12, FH, FW, g => paintFarForest(g, tod));
  const gy = base - GG;
  tile(c, 'wood2', cx * FOREST_D, gy, GH, GW, g => paintForest(g, tod));
  if (gy + GH < H) box(c, 0, gy + GH - 1, W, H, ff(tod)[3]);
  if (tod.lamps > 0.2) fireflies(c, state, hz, tod); else motes(c, state, hz);
  return true;
};
