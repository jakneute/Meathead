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
import { MONUMENT_AT, drawCastleAt } from '../monument';
import { SECTIONS } from '../geometry';
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

export const FW = 1600, FH = 230, FG = FH - 20;
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
// The forest proper (nearer): big oaks and beeches, fairy doors, fungus, ivy, lanterns strung between, toadstools

const GW = 1400, GH = 600, GG = GH - 16;
interface Big { x: number; w: number; top: number; kind: 'oak' | 'beech' | 'birch'; seed: number }
const BIGS: Big[] = (() => {
  const out: Big[] = [];
  for (let x = 30, i = 0; x < GW - 40; i++) {
    const s = i * 17 + 3, t = hash(s);
    const kind: Big['kind'] = t > 0.75 ? 'birch' : t > 0.45 ? 'beech' : 'oak';
    const w = kind === 'birch' ? 12 + hash(s * 2) * 6 : 22 + hash(s * 2) * 20;
    out.push({ x, w, top: 30 + hash(s * 3) * 30, kind, seed: s });
    x += 120 + hash(s * 5) * 110;
  }
  return out;
})();
const paintForest = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.12);
  const floorR = [T('#1A3424'), T('#244632'), T('#30583C')];
  // (the far trunks between, thin and misty, up into the canopy; the canopy only seen from up high: a ceiling of
  //  leaves in steps across the top, hanging down in lobes)
  const FT = farCol(tod, 0.42);
  for (let x = 40; x < GW; x += 90 + Math.floor(hash(x) * 40)) { const w = 5 + hash(x) * 6; box(g, x, 20, w, GG - 60, FT('#2A3A34')); box(g, x, 20, 2, GG - 60, FT('#3E5248')); }
  for (let x = 0; x < GW; x += 26) crown(g, x, 4 + hash(x * 1.3) * 26, 30, [T('#12281F'), T('#1C382A'), T('#284C36'), T('#3A6446')], x * 0.7);
  mist(g, GW, 260, GG - 300, skyAt(0.9, tod), 0.0, 0.3, 6);
  // (the floor: moss and ferns going off into the trees)
  box(g, 0, GG - 20, GW, GH - GG + 20, floorR[1]); box(g, 0, GG - 20, GW, 3, floorR[2]); checker(g, 0, GG - 17, GW, 2, floorR[2], 0, 2);
  for (let x = 0; x < GW; x += 7) if (hash(x * 0.9) > 0.5) poly(g, [[x, GG - 18], [x + 4, GG - 26 - hash(x) * 6], [x + 8, GG - 18]], floorR[2]);
  // (the big trees: trunks in steps, roots spread, bark grooves, moss up the shaded side, ivy; fairy doors (lit after
  //  dark), bracket fungi; their crowns over the top)
  const BARK: Record<Big['kind'], string[]> = {
    oak: [T('#2A1C16'), T('#3E2A1E'), T('#56402C'), T('#72583C')],
    beech: [T('#3A3A42'), T('#565660'), T('#74747E'), T('#9696A0')],
    birch: [T('#5A5A60'), T('#B4B2AC'), T('#D8D6CE'), T('#F2F0E8')],
  };
  for (const b of BIGS) {
    const R = BARK[b.kind], x = b.x, w = b.w, top = b.top;
    // (roots)
    poly(g, [[x - w * 0.9, GG - 14], [x - w * 0.2, GG - 40], [x + w * 1.2, GG - 40], [x + w * 1.9, GG - 14]], R[0]);
    poly(g, [[x - w * 0.7, GG - 15], [x, GG - 38], [x + w * 0.5, GG - 38], [x + w * 0.3, GG - 15]], R[1]);
    box(g, x - 1, top, w + 2, GG - 30 - top, T(INK));
    box(g, x, top, w, GG - 30 - top, R[2]); box(g, x, top, Math.max(2, w * 0.25), GG - 30 - top, R[3]); box(g, x + w * 0.7, top, w * 0.3, GG - 30 - top, R[1]);
    checker(g, x + w * 0.6, top, 2, GG - 30 - top, R[1], 0, 1);
    if (b.kind === 'birch') { for (let y = top + 6; y < GG - 34; y += 7 + Math.floor(hash(y + b.seed) * 9)) box(g, x + hash(y) * (w - 6), y, 3 + hash(y * 2) * 5, 2, R[0]); }
    else for (let k = 0; k < Math.floor(w / 6); k++) { const gx = x + 3 + k * 6 + (hash(b.seed + k) * 3); box(g, gx, top + 4, 1, GG - 40 - top, R[1]); }
    if (b.kind === 'oak') { box(g, x + w * 0.7, top + 30, w * 0.3, GG - 70 - top, T('#3E6A34')); checker(g, x + w * 0.6, top + 30, w * 0.12, GG - 70 - top, T('#3E6A34'), 1, 1); }
    // (ivy up some)
    if (b.seed % 3 === 1) for (let y = GG - 40; y > top + 40; y -= 5) box(g, x + w * 0.5 + Math.sin(y * 0.12) * w * 0.3, y, 3, 3, T(y % 10 ? '#3E7A3A' : '#5A9A4A'));
    // (a fairy door at the foot of the wide ones)
    if (w > 30 && b.seed % 2 === 1) {
      const dx = x + w * 0.35, dy = GG - 34;
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(dx - 6, dy); g.lineTo(dx - 6, dy - 12); g.arc(dx, dy - 12, 6, Math.PI, 0); g.lineTo(dx + 6, dy); g.closePath(); g.fill();
      g.fillStyle = T('#8A3A6A'); g.beginPath(); g.moveTo(dx - 5, dy); g.lineTo(dx - 5, dy - 12); g.arc(dx, dy - 12, 5, Math.PI, 0); g.lineTo(dx + 5, dy); g.closePath(); g.fill();
      box(g, dx + 2, dy - 8, 1, 1, T('#F6D365')); box(g, dx - 2, dy - 16, 4, 3, winLit(tod, b.seed) ?? T('#4A2A40'));
      box(g, dx - 7, dy, 14, 2, T('#6A6A6A'));
    }
    // (bracket fungi)
    for (let k = 0; k < 3; k++) { const fy = top + 60 + hash(b.seed + k * 3) * (GG - 140 - top), fx = k % 2 ? x - 4 : x + w - 4; box(g, fx, fy, 9, 3, T('#D8B888')); box(g, fx, fy, 9, 1, T('#F2DCB0')); box(g, fx + 1, fy + 3, 7, 1, T('#8A6A44')); }
    // (a low bough off it, leaves on it: the rest of its crown's up in the canopy)
    const CR = b.kind === 'birch' ? [T('#2A4A28'), T('#3E6A34'), T('#5A8A44'), T('#7AAA5A')] : b.kind === 'beech' ? [T('#20402C'), T('#2E5638'), T('#3E6E44'), T('#5A8A58')] : [T('#1A3A2A'), T('#264E34'), T('#346440'), T('#4E7E50')];
    crown(g, x + w / 2, top - 4, 40 + w * 0.6, CR, b.seed);
    if (b.kind !== 'birch') {
      const s = b.seed % 2 ? 1 : -1, by = 150 + hash(b.seed * 7) * 120, ex = x + w / 2 + s * (50 + w);
      g.strokeStyle = T(INK); g.lineWidth = 7; g.beginPath(); g.moveTo(x + w / 2, by + 30); g.quadraticCurveTo(x + w / 2 + s * 30, by, ex, by - 10); g.stroke();
      g.strokeStyle = R[2]; g.lineWidth = 5; g.stroke(); g.strokeStyle = R[3]; g.lineWidth = 1; g.stroke();
      crown(g, ex, by - 16, 22, CR, b.seed + 3);
    }
  }
  // (lanterns strung tree to tree, sagging; their glass lit after dark)
  for (let i = 0; i < BIGS.length - 1; i++) {
    const a = BIGS[i], b = BIGS[i + 1], ax = a.x + a.w, bx = b.x, y0 = GG - 230 - (i % 3) * 34;
    g.strokeStyle = T('#2A2430'); g.lineWidth = 1; g.beginPath(); g.moveTo(ax, y0); g.quadraticCurveTo((ax + bx) / 2, y0 + 30, bx, y0); g.stroke();
    for (let k = 1; k < 8; k++) {
      const t = k / 8, lx = ax + (bx - ax) * t, ly = y0 + 2 * t * (1 - t) * 30;
      if (k % 2) { box(g, lx - 2, ly, 4, 5, T(INK)); box(g, lx - 1, ly + 1, 2, 3, tod.lamps > 0.3 ? '#FFD88A' : T('#E8C888')); }
      else box(g, lx, ly + 1, 1, 1, tod.lamps > 0.3 ? BULB[(i + k) % 4] : T(BULB[(i + k) % 4]));
    }
  }
  // (toadstools, ferns and stumps at their feet)
  for (let x = 20; x < GW; x += 50 + Math.floor(hash(x) * 60)) {
    const t = hash(x * 3.7);
    if (t > 0.55) { const s = 0.6 + hash(x) * 0.8; box(g, x - 2 * s, GG - 14 - 10 * s, 4 * s, 10 * s, T('#E8DFC6')); g.fillStyle = T('#B42A2A'); g.beginPath(); g.ellipse(x, GG - 14 - 10 * s, 9 * s, 6 * s, 0, Math.PI, 0); g.fill(); box(g, x - 4 * s, GG - 19 - 10 * s, 2, 2, T('#FFF2E0')); box(g, x + 2 * s, GG - 17 - 10 * s, 2, 2, T('#FFF2E0')); }
    else if (t > 0.3) { for (let k = -2; k <= 2; k++) poly(g, [[x, GG - 14], [x + k * 7, GG - 26 + Math.abs(k) * 3], [x + k * 5, GG - 14]], T(k % 2 ? '#3E7A3A' : '#2E6030')); }
    else { box(g, x - 8, GG - 26, 16, 12, T('#5A4030')); box(g, x - 8, GG - 26, 16, 3, T('#A08060')); box(g, x - 4, GG - 25, 8, 1, T('#7A5A40')); }
  }
  box(g, 0, GG - 14, GW, 14, floorR[0]); checker(g, 0, GG - 16, GW, 2, floorR[0], 0, 2);
  mist(g, GW, GG - 70, 60, skyAt(0.94, tod), 0.0, 0.22, 4);
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

export const drawGlenFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [640, 110], moon: [150, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.06, hz - 390, CUH, CUW, g => paintClouds(g, tod));
  tile(c, 'alps', cx * 0.03, hz - MH + 6, MH, MW, g => paintAlps(g, tod));
  // (the castle on its crag, drifting across as he goes, its foot lost in the trees)
  const at = MONUMENT_AT.glen, { x0, x1 } = SECTIONS.glen, k = Math.max(0, Math.min(1, (cx - x0) / Math.max(1, x1 - x0 - W)));
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), Math.round(at.base + (hz - 440)), at.k, f);
  // (laid from the section's start: the wheel he's come from back to the left, Truelling Tragons coming in on the right
  //  as he nears its queue)
  tile(c, 'park', (cx - x0) * 0.06, hz - PG - 20, PH, PW, g => paintPark(g, tod));
  tile(c, 'farwood', cx * 0.13, hz - FG + 20, FH, FW, g => paintFarForest(g, tod));
  const gy = hz - GG + 70;
  tile(c, 'wood', cx * 0.24, gy, GH, GW, g => paintForest(g, tod));
  if (gy + GH < H) box(c, 0, gy + GH - 1, W, H, farCol(tod, 0.12)('#1A3424'));
  if (tod.lamps > 0.2) fireflies(c, state, hz, tod); else motes(c, state, hz);
  return true;
};
