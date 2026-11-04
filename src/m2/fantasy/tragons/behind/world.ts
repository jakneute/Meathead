// The ride from behind's world (draw.ts puts it together): the sky by the hour and the far off round the horizon (the
// classic ride's own layers, far.ts: the Alps, THE GREAT PIXIE'S CASTLE, the glen's park beyond, the rest of Truelling
// Tragons across the park, the glen's forest edge, the park near the ride: the same pictures, painted once for the
// hour and shared with the station's side view, slid round the horizon as the ride turns); the park's lawn below the
// tracks in mowed bands going away (its paths, flower beds, the lagoon's water and kerb), the park's things along it
// (pines, turrets, gift shops, lamp posts, hedges: billboards at their depth); the mountain's face and its mouth; the
// inside of it (ribbed rock in steps between plaster ribs, the work lamps, damp glints, the way out glowing ahead),
// lit by the land's lighting (behindLight: the work lamps, the dragons' lamps, the exit); the splashdown's spray; the
// speed lines, the snow.

import type { GameState } from '../../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { box, mix, INK, polyF, hash, hour, SNOW, checker, type Ctx } from '../../kit';
import { drawTodSky, timeOfDay, skyAt, farTint, hourMix, type TimeOfDay } from '../../../timeOfDay';
import { bandedAt } from '../cache';
import { paintAlps, MW, MH } from '../../square/far';
import { paintCirrus, paintCumulus, CIW, CIH, CUW } from '../../wheel/far';
import { paintPark as paintGlenPark, PW as GPW, PH as GPH, PG as GPG, paintFarForest, FW as GFW, FH as GFH, FG as GFG } from '../../glen/far';
import { paintRideRow, RW, RH, RG, paintParkNear, NW, NH, NG } from '../far';
import { drawCastleAt } from '../../monument';
import { LANE_COL } from '../layout';
import { tragonsOf, type Tragons } from '../state';
import { SEG, DRAW, LANE_W, TUNNEL, LAGOON, trackAt, project, curveX, inTunnel, zOf, noseS, type TP, type SP } from './geom';
import { pic, hazeOf, pine, turret, shop, lampPost, hedge, HAZE, type Placed } from './sprites';
import type { Bv } from './state';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** hazeOf, remembered (per color: its twelve hazes). */
const hzMemo = new Map<string, string[]>();
export const hz = (col: string, step: number, cave: boolean) => {
  let m = hzMemo.get(col);
  if (!m) { if (hzMemo.size > 2048) hzMemo.clear(); m = []; hzMemo.set(col, m); }
  const i = step + (cave ? HAZE : 0);
  return m[i] ??= hazeOf(col, step, cave);
};
/** (a new hour: the lawn's colors again) */
let hzHour = '';
const hourCheck = () => { const k = timeOfDay().key; if (k !== hzHour) { hzHour = k; hzMemo.clear(); } };

/** Puts a picture down at screen (x, y) (its origin), scaled k, smoothed when it's brought down. */
export const put = (c: Ctx, p: Placed | null, x: number, y: number, k: number, a = 0) => {
  if (!p) return;
  if (Math.abs(a) < 0.002) c.drawImage(p.cv, x + p.x * k, y + p.y * k, p.w * k, p.h * k);
  else { c.save(); c.translate(x, y); c.rotate(a); c.drawImage(p.cv, p.x * k, p.y * k, p.w * k, p.h * k); c.restore(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far off

const SKY_STOPS = ['#283A8C', '#3E62BE', '#6A90DC', '#A0C0EE', '#DCDCF4', '#F6CCDA'];
export const SKY_H = 760, SKY_HORIZON = 560;
/** The sky by the hour (banded down to the horizon, its stars, the sun or the moon): 960 x 760, the horizon 560 down. */
export const sky = () => pic('sky', 960, SKY_H, 0, 0, 1, g => {
  drawTodSky(g, 0, 0, 960, SKY_H, SKY_STOPS, { horizon: SKY_HORIZON, sun: [690, 220], moon: [240, 170] });
});
/** The castle on its crag, painted once for the hour (monument.ts's, at its own size: 360 x 476, its foot at 180, 470). */
const CASTLE_K = 0.42;
const castle = () => pic('castle', Math.ceil(360 * CASTLE_K), Math.ceil(480 * CASTLE_K), 180 * CASTLE_K, 474 * CASTLE_K, 1, g => drawCastleAt(g, 0, 0, CASTLE_K, 0));

/** A far layer's color for the hour, into the sky's haze by `k` (far.ts's). */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);

/** One of the classic ride's far layers (the same cached picture: far.ts's keys), repeated round the horizon from -m
 *  to W + m, its foot at `foot`, `zs` its size, slid `o` along. */
/** The panoramas round the horizon, each painted once for the hour out of the classic ride's own far layers (the
 *  same cached pictures, far.ts's keys), every layer sized so it repeats a whole number of times round PANO: the clouds
 *  (the cirrus high, the cumulus at two heights), the far (the Alps, the castle on its crag, the glen's park beyond,
 *  the rest of Truelling Tragons across the park), the near (the glen's forest edge, the park near the ride). Distant
 *  things all slide round together as the ride turns (as they would), the near panorama set lower the more the ride
 *  climbs. Each put down as a blit or two a frame. */
const PANO = 3600;
const tiles = (g: Ctx, key: string, tw: number, h: number, ground: number, paint: (g: Ctx) => void, zs: number, foot: number, o: number) => {
  const e = bandedAt(`fa-tg-${key}-${timeOfDay().key}`, 1, 0, 0, tw, h, paint);
  if (!e) return;
  const sw = tw * zs, dh = (e.cv.height / e.s) * zs, top = foot - ground * zs;
  g.imageSmoothingEnabled = true;
  for (let x = -o; x < PANO; x += sw) g.drawImage(e.cv, x, top, (e.cv.width / e.s) * zs, dh);
};
/** Pictures' tops and bottoms about the horizon (their origin). */
const CL = { up: 420, dn: 6 }, FA = { up: 214, dn: 22 }, NE = { up: 110, dn: 16 };
const cloudPano = () => pic('pano-clouds', PANO, CL.up + CL.dn, 0, CL.up, 1, g => {
  const tod = timeOfDay();
  tiles(g, 'cirrus', CIW, CIH, CIH, gg => paintCirrus(gg, tod), PANO / CIW / 3, -300, 0);
  tiles(g, 'cu-mid', CUW, 160, 160, gg => paintCumulus(gg, tod, 29, 1.05, 160), 900 / CUW, -150, 300);
  tiles(g, 'cu-low', CUW, 140, 140, gg => paintCumulus(gg, tod, 3, 0.8, 140), 720 / CUW, -64, 520);
});
const farPano = () => pic('pano-far', PANO, FA.up + FA.dn, 0, FA.up, 1, g => {
  const tod = timeOfDay();
  tiles(g, 'alps', MW, MH, MH - 6, gg => paintAlps(gg, tod), 720 / MW, 1, 0);
  const cv = castle();
  if (cv) { g.imageSmoothingEnabled = false; g.drawImage(cv, 1700 - Math.round(180 * CASTLE_K), 2 - Math.round(474 * CASTLE_K)); }
  tiles(g, 'park', GPW, GPH, GPG - 18, gg => paintGlenPark(gg, tod), 900 / GPW, 4, 300);
  box(g, 0, 4, PANO, FA.dn, farCol(tod, 0.4)('#7482AE'));
  tiles(g, 'ride', RW, RH, RG, gg => paintRideRow(gg, tod), 900 / RW, 9, 600);
  box(g, 0, 9, PANO, FA.dn, farCol(tod, 0.3)('#D8E2F2'));
});
const nearPano = () => pic('pano-near', PANO, NE.up + NE.dn, 0, NE.up, 1, g => {
  const tod = timeOfDay();
  tiles(g, 'glen', GFW, GFH, GFG, gg => paintFarForest(gg, tod), 720 / GFW, 0, 140);
  box(g, 0, 0, PANO, NE.dn, farCol(tod, 0.26)('#1E3A2E'));
  tiles(g, 'near', NW, NH, NG, gg => paintParkNear(gg, tod), 720 / NW, 8, 520);
  box(g, 0, 8, PANO, NE.dn, farCol(tod, 0.12)('#4E7A42'));
});
/** A panorama put down round the horizon at y (its origin's row), slid `o` along, from -m to W + m. */
const pano = (c: Ctx, cv: HTMLCanvasElement | null, oy: number, y: number, o: number, m: number) => {
  if (!cv) return;
  const top = Math.round(y - oy);
  if (top > H + m || top + cv.height < -m) return;
  for (let x = Math.round(-m - (((o % PANO) + PANO) % PANO)); x < W + m; x += PANO) c.drawImage(cv, x, top);
};

/** The sky and everything round the horizon (the view's turned already). `m` how far past the screen's edges to fill;
 *  `gF` the lawn's far edge's row; `turn` how far round the ride's heading has turned (px). */
export const drawSkyFar = (c: Ctx, f: number, hy: number, gF: number, turn: number, m: number, up: number) => {
  hourCheck();
  const tod = timeOfDay();
  const sk = sky();
  // (only what's on screen of it: from the top (or its own top) down to just under the horizon, the screen's width;
  // turned, the lot, and the top band on up past it)
  const top = hy - SKY_HORIZON;
  if (!sk || m > 0 || top > 0) box(c, -m, -m, W + 2 * m, hy + m, SKY_STOPS[0]);
  if (sk) {
    const sy0 = m > 0 ? 0 : Math.max(0, -top), sy1 = m > 0 ? SKY_H : Math.min(SKY_H, SKY_HORIZON + 8);
    const sx0 = m > 0 ? 0 : 80, sw = m > 0 ? 960 : W;
    if (sy1 > sy0) c.drawImage(sk, sx0, sy0, sw, sy1 - sy0, m > 0 ? -80 : 0, top + sy0, sw, sy1 - sy0);
  }
  const G = Math.max(6, gF - hy);
  // (the clouds drifting, coming down into the picture as the ride climbs; the far off on the horizon; the near
  // panorama, lower the higher he is)
  pano(c, cloudPano(), CL.up, hy + up * 0.08, turn * 0.06 + f * 0.05, m);
  pano(c, farPano(), FA.up, hy, turn * 0.35, m);
  const ny = hy + G * 0.45;
  pano(c, nearPano(), NE.up, ny, turn * 0.35 + 1100, m);
  const y0 = Math.round(ny + NE.dn - 2);
  if (gF + 3 > y0) box(c, -m, y0, W + 2 * m, gF + 3 - y0, farCol(tod, 0.12)('#4E7A42'));
};

// ---------------------------------------------------------------------------------------------------------------
// The lawn going away

/** A row of track (draw.ts's): its track position, how far ahead, the lawn's row on screen. */
export interface Row { s: number; z: number; gy: number; ok: boolean[]; p: SP[]; phi: number[]; x: number[]; y: number[] }

const LAWN = ['#3E7432', '#4A8238', '#56903E', '#4A8238'];
const PATH = ['#8A8474', '#A8A290', '#C8C2AE'];
/** The park's paths along under the ride: their middles out from the ride's bend, their half-widths. */
const PATHS: [number, number][] = [[-LANE_W - 420, 70], [LANE_W + 380, 60], [-LANE_W * 2 - 1300, 90]];
const SP0: SP = { x: 0, y: 0, k: 1 };
/** The lawn below the tracks, all of it at once (it's flat on the ground: nothing stands under it), far to near: the
 *  mowed stripes in bands (a band one fill, however many steps it spans), a dithered line at each stripe's far edge,
 *  the lagoon's water and its ripples, its kerb; then the paths along under the ride (gravel, snow banked along both
 *  edges, a pale line down the middle near to), each one polygon a haze step. `rows` far to near from `k0`. */
export const drawLawn = (c: Ctx, cam: Bv['cam'], rows: Row[], k0: number, f: number, m: number, skip: (s: number) => boolean) => {
  let col = '', y0 = 0, y1 = 0;
  const flush = () => { if (col) box(c, -m, y0, W + 2 * m, y1 - y0 + 1, col); col = ''; };
  for (let k = k0; k >= 0; k--) {
    const r = rows[k], n = rows[k + 1];
    if (r.z < 75 || n.z <= 24 || skip(r.s)) { flush(); continue; }
    const step = Math.min(HAZE - 1, Math.floor((r.z / DRAW) * HAZE * 1.15));
    const ya = Math.min(r.gy, n.gy), yb = Math.max(r.gy, n.gy);
    if (yb < -m || ya > H + m) { flush(); continue; }
    const id = Math.floor(r.s / SEG);
    const water = r.s > LAGOON.a && r.s < LAGOON.b;
    const kerb = (r.s <= LAGOON.a && n.s > LAGOON.a) || (r.s >= LAGOON.b && r.s - SEG < LAGOON.b);
    const cc = hz(hour(water ? WATER[(id >> 1) % 2] : kerb ? '#B8B2C8' : LAWN[(id >> 2) & 3]), step, false);
    const edge = !water && !kerb && (id & 3) === 3 && yb - ya >= 2;
    if ((water && step < 4) || kerb || edge) {
      flush();
      box(c, -m, ya, W + 2 * m, yb - ya + 1, cc);
      if (kerb) box(c, -m, ya, W + 2 * m, Math.max(1, (yb - ya) * 0.3), hz(hour('#E8E2F4'), step, false));
      else if (edge) box(c, -m, ya, W + 2 * m, 1, hz(hour(LAWN[(((id >> 2) & 3) + 1) & 3]), step, false));
      else for (let i = 0; i < 3; i++) {
        // (ripples: lit dashes fixed to the water, drifting)
        const wx = curveX(r.s) + (hash(id * 3.1 + i) - 0.5) * 2400 + Math.sin(f * 0.03 + i + id) * 30;
        if (!project(cam, wx, 0, r.s, SP0)) continue;
        box(c, SP0.x, ya, Math.max(2, 40 * SP0.k), Math.max(1, (yb - ya) * 0.5), hz(hour('#A8CCF4'), step, false));
      }
      continue;
    }
    if (cc !== col) { flush(); col = cc; y0 = ya; y1 = yb; }
    else { if (ya < y0) y0 = ya; if (yb > y1) y1 = yb; }
  }
  flush();
  // the paths: one polygon each per haze group (near / middle / far), its snow banks and its middle line near to
  for (const [dx, hw] of PATHS) {
    for (const [za, zb, step] of [[1400, 2600, 3], [600, 1400, 1], [75, 600, 0]] as const) {
      const L: [number, number][] = [], R: [number, number][] = [];
      let e = 1;
      for (let k = k0 + 1; k >= 0; k--) {
        const r = rows[k];
        if (r.z < za || r.z > zb || skip(r.s) || (r.s > LAGOON.a - 60 && r.s < LAGOON.b + 60)) continue;
        const kk = 360 / r.z, px = curveX(r.s) + dx;
        L.push([W / 2 + (px - hw - cam.x) * kk, r.gy]); R.push([W / 2 + (px + hw - cam.x) * kk, r.gy]);
        e = Math.max(1, 6 * kk);
      }
      if (L.length < 2) continue;
      if (Math.max(L[0][0], L[L.length - 1][0]) < -m - 400 || Math.min(R[0][0], R[R.length - 1][0]) > W + m + 400) continue;
      polyF(c, [...L, ...[...R].reverse()], hz(hour(PATH[1]), step, false));
      if (step === 0) {
        const sh = (pts: [number, number][], d: number): [number, number][] => pts.map(([x, y]) => [x + d, y]);
        polyF(c, [...sh(L, -e), ...[...L].reverse()], hz(hour(SNOW[4]), step, false));
        polyF(c, [...R, ...[...sh(R, e)].reverse()], hz(hour(SNOW[3]), step, false));
        const M2 = L.map(([x, y], i) => [(x + R[i][0]) / 2, y] as [number, number]);
        polyF(c, [...sh(M2, -e * 0.4), ...[...sh(M2, e * 0.4)].reverse()], hz(hour(PATH[2]), step, false));
      }
    }
  }
};
const WATER = ['#2A5EA8', '#3470BC'];

/** The park's things along the lawn (a few rows apart, either side, off the tracks), at their depth. */
export const propsRow = (c: Ctx, cam: Bv['cam'], r: Row, step: number) => {
  const id = Math.floor(r.s / SEG), h1 = hash(id * 1.37);
  if (h1 > 0.3 || (r.s > LAGOON.a - 200 && r.s < LAGOON.b + 200)) return;
  const side = hash(id * 2.11) < 0.5 ? -1 : 1, far = hash(id * 3.7);
  const px = curveX(r.s) + side * (LANE_W * 1.5 + 200 + far * 1200);
  if (!project(cam, px, 0, r.s, SP0)) return;
  const k = SP0.k * 1.7;
  if (SP0.x < -200 * k || SP0.x > W + 200 * k || SP0.y < -40) return;
  const kind = Math.floor(hash(id * 5.9) * 10);
  const v = Math.floor(hash(id * 7.3) * 3);
  const p = kind < 4 ? pine(step, v % 2) : kind < 5 ? turret(step, v) : kind < 6 ? shop(step, v) : kind < 8 ? hedge(step, v % 2) : lampPost(step);
  put(c, p, SP0.x, SP0.y, kind < 4 ? k * 1.2 : k);
};

// ---------------------------------------------------------------------------------------------------------------
// The mountain

const BP: TP = { x: 0, y: 0, phi: 0 }, BQ: SP = { x: 0, y: 0, k: 1 }, BR: SP = { x: 0, y: 0, k: 1 };
/** The bore's mouth (or a rib's frame) at s, on screen: round all three tracks, from under them to well over. */
export const boreRect = (bv: Bv, s: number) => {
  trackAt(bv.rolls, 0, s, BP); const x0 = BP.x - 150, y0 = BP.y;
  trackAt(bv.rolls, 2, s, BP); const x1 = BP.x + 150;
  const top = Math.max(y0, BP.y) + 300, bot = Math.min(y0, BP.y) - 90;
  project(bv.cam, x0, top, s, BQ); project(bv.cam, x1, bot, s, BR);
  return { x0: BQ.x, y0: BQ.y, x1: BR.x, y1: BR.y, k: BQ.k };
};
export type Bore = ReturnType<typeof boreRect>;

const ROCK = ['#1E1624', '#2A2030', '#3A2E3E', '#4E3E50', '#665464', '#7E6C7A', '#9A8894'];
/** The fake mountain's face: rock from the lawn up past the top of the screen in strata (lit along their tops, dithered
 *  under), the snow on its shoulders, the mouth cut out of it in a plaster portal (blocks, a gilt keystone, ferns off its
 *  lip, its shadow in). */
export const drawFace = (c: Ctx, bv: Bv, s: number, hole: Bore, m: number) => {
  const gy = bv.cam.hy + bv.cam.y * (360 / Math.max(24, zOf(bv.cam, s))), k = hole.k;
  const R = ROCK.map(col => hour(col));
  const peak = hole.y0 - 640 * k, mx = (hole.x0 + hole.x1) / 2;
  const L = -m - 10, Rt = W + m + 10;
  const outline: [number, number][] = [[L, gy], [L, peak + 240 * k], [mx - 700 * k, peak + 120 * k], [mx - 420 * k, peak + 40 * k], [mx - 160 * k, peak], [mx + 60 * k, peak + 70 * k], [mx + 300 * k, peak + 30 * k], [mx + 600 * k, peak + 150 * k], [Rt, peak + 260 * k], [Rt, gy]];
  const path = () => { c.beginPath(); outline.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.rect(hole.x1, hole.y0, hole.x0 - hole.x1, hole.y1 - hole.y0); };
  c.save();
  path(); c.fillStyle = R[3]; c.fill('evenodd'); c.clip('evenodd');
  // (the faces in steps: lit to the upper left, shaded right)
  polyF(c, [[L, peak + 240 * k], [mx - 700 * k, peak + 120 * k], [mx - 420 * k, peak + 40 * k], [mx - 160 * k, peak], [mx - 300 * k, gy], [L, gy]], R[4]);
  polyF(c, [[mx - 160 * k, peak], [mx - 420 * k, peak + 40 * k], [mx - 560 * k, gy], [mx - 300 * k, gy]], R[5]);
  polyF(c, [[mx + 300 * k, peak + 30 * k], [mx + 600 * k, peak + 150 * k], [Rt, peak + 260 * k], [Rt, gy], [mx + 420 * k, gy]], R[2]);
  // (strata across: each lit along its top, a dither under it, a shade line)
  for (let i = 1; i < 9; i++) {
    const y = peak + i * 90 * k + ((i * 37) % 23) * k;
    box(c, L, y, Rt - L, Math.max(1, 3 * k), R[5]);
    if (k > 0.25) checker(c, L, y + 3 * k, Rt - L, Math.max(1, 2 * k), R[2], 0, Math.max(1, Math.round(2 * k)));
    box(c, L, y + 8 * k, Rt - L, Math.max(1, 2 * k), R[2]);
  }
  // (plaster seams and their bolts: it's fake)
  for (let i = -3; i <= 3; i++) { const x = mx + i * 260 * k; box(c, x, peak, Math.max(1, 2 * k), gy - peak, R[2]); for (let y = peak + 40 * k; y < gy; y += 120 * k) box(c, x - 2 * k, y, 5 * k + 1, 5 * k + 1, R[6]); }
  // (snow on its shoulders and in its gullies)
  const Sn = SNOW.map(col => hour(col));
  polyF(c, [[mx - 420 * k, peak + 40 * k], [mx - 160 * k, peak], [mx + 60 * k, peak + 70 * k], [mx + 20 * k, peak + 110 * k], [mx - 80 * k, peak + 70 * k], [mx - 200 * k, peak + 120 * k], [mx - 330 * k, peak + 80 * k]], Sn[4]);
  polyF(c, [[mx - 420 * k, peak + 40 * k], [mx - 160 * k, peak], [mx - 200 * k, peak + 50 * k], [mx - 330 * k, peak + 80 * k]], Sn[5]);
  for (const [u, v] of [[-560, 220], [360, 180], [-300, 330], [480, 300]] as const) polyF(c, [[mx + u * k, peak + v * k], [mx + (u + 40) * k, peak + (v - 60) * k], [mx + (u + 70) * k, peak + (v + 10) * k], [mx + (u + 30) * k, peak + (v + 50) * k]], Sn[3]);
  c.restore();
  // (the portal: plaster blocks round the mouth, lit, a gilt keystone; the overhang's shadow in; ferns off its lip)
  const bw = Math.max(3, 22 * k), x0 = hole.x0, x1 = hole.x1, y0 = hole.y0, y1 = hole.y1;
  box(c, x0 - bw - 2, y0 - bw - 2, x1 - x0 + bw * 2 + 4, bw + 2, INK);
  box(c, x0 - bw - 2, y0 - bw, bw + 2, y1 - y0 + bw, INK); box(c, x1, y0 - bw, bw + 2, y1 - y0 + bw, INK);
  for (let i = 0; i < 9; i++) {
    const bx = x0 - bw + i * ((x1 - x0 + bw * 2) / 9), w = (x1 - x0 + bw * 2) / 9 - 1;
    box(c, bx, y0 - bw, w, bw - 1, i % 2 ? R[5] : R[6]); box(c, bx, y0 - bw, w, Math.max(1, 3 * k), Sn[4]);
  }
  for (let j = 0; j < 6; j++) {
    const by = y0 + j * ((y1 - y0) / 6), h = (y1 - y0) / 6 - 1;
    box(c, x0 - bw, by, bw - 1, h, j % 2 ? R[5] : R[4]); box(c, x1 + 1, by, bw - 1, h, j % 2 ? R[3] : R[4]);
  }
  const kx = (x0 + x1) / 2, kw = 30 * k;
  polyF(c, [[kx - kw, y0 - bw - 2], [kx + kw, y0 - bw - 2], [kx + kw * 0.6, y0 + 10 * k], [kx - kw * 0.6, y0 + 10 * k]], INK);
  polyF(c, [[kx - kw + 2, y0 - bw], [kx + kw - 2, y0 - bw], [kx + kw * 0.6 - 2, y0 + 8 * k], [kx - kw * 0.6 + 2, y0 + 8 * k]], hour('#D09A30'));
  box(c, kx - kw + 2, y0 - bw, kw * 2 - 4, Math.max(1, 4 * k), hour('#F2C84A'));
  c.globalAlpha = 0.45; box(c, x0, y0, x1 - x0, Math.max(2, 40 * k), '#0B0612'); c.globalAlpha = 1;
  const Fn = ['#1E4A2A', '#2E6A3A', '#4A8A4A'].map(col => hour(col));
  if (k > 0.15) for (let i = 0; i < 10; i++) {
    const fx = x0 + (i + 0.5) * ((x1 - x0) / 10), len = (16 + ((i * 7) % 11)) * k;
    c.strokeStyle = Fn[i % 2]; c.lineWidth = Math.max(1, 3 * k); c.beginPath(); c.moveTo(fx, y0); c.quadraticCurveTo(fx - 6 * k, y0 + len * 0.6, fx + 3 * k, y0 + len); c.stroke();
    box(c, fx + 2 * k, y0 + len * 0.5, 3 * k, 3 * k, Fn[2]);
  }
};

/** Inside the mountain, between a rib (near, at s) and the next (far): the rock walls, roof and floor in perspective,
 *  banded darker going in, damp glints on them. */
export const caveSpan = (c: Ctx, a: Bore, b: Bore, step: number, f: number, id: number) => {
  const R = (i: number) => hz(ROCK[i], step, true);
  // (the roof, the walls, the floor: quads between the two frames)
  polyF(c, [[a.x0, a.y0], [a.x1, a.y0], [b.x1, b.y0], [b.x0, b.y0]], R(2));
  polyF(c, [[a.x0, a.y0], [b.x0, b.y0], [b.x0, b.y1], [a.x0, a.y1]], R(3));
  polyF(c, [[a.x1, a.y0], [b.x1, b.y0], [b.x1, b.y1], [a.x1, a.y1]], R(1));
  polyF(c, [[a.x0, a.y1], [a.x1, a.y1], [b.x1, b.y1], [b.x0, b.y1]], R(1));
  // (the rock's courses along the walls, lit along their tops; damp glints catching the lamps)
  for (let i = 1; i < 4; i++) {
    const u = i / 4, ya = a.y0 + (a.y1 - a.y0) * u, yb = b.y0 + (b.y1 - b.y0) * u;
    c.strokeStyle = R(4); c.lineWidth = Math.max(1, 3 * a.k);
    c.beginPath(); c.moveTo(a.x0, ya); c.lineTo(b.x0, yb); c.moveTo(a.x1, ya); c.lineTo(b.x1, yb); c.stroke();
  }
  if (step < 4) for (let i = 0; i < 4; i++) {
    const u = hash(id * 3.3 + i), v = hash(id * 5.1 + i), side = i % 2;
    const x = side ? a.x1 + (b.x1 - a.x1) * u : a.x0 + (b.x0 - a.x0) * u, y = a.y0 + (a.y1 - a.y0) * v + (b.y0 - a.y0) * u * (1 - v);
    if ((f + i * 17 + id * 5) % 90 < 40) box(c, x, y, Math.max(1, 2 * a.k), Math.max(1, 2 * a.k), hz('#C8E0F0', step, true));
  }
};

/** A rib round the bore at s: plaster, an arch of blocks inked and lit along its inner edge, its caged work lamp at the
 *  top (the light's the lighting's). */
const RIBC = ['#2A2232', '#4A3E52', '#6A5E72', '#8A7E92', '#B4A8BC'];
export const drawRib = (c: Ctx, hole: Bore, step: number) => {
  const k = hole.k, w = Math.max(2, 16 * k);
  const R = (i: number) => hz(RIBC[i], step, true);
  box(c, hole.x0 - 1, hole.y0 - 1, hole.x1 - hole.x0 + 2, w + 2, R(0));
  box(c, hole.x0 - 1, hole.y0, w + 2, hole.y1 - hole.y0, R(0)); box(c, hole.x1 - w - 1, hole.y0, w + 2, hole.y1 - hole.y0, R(0));
  box(c, hole.x0, hole.y0, hole.x1 - hole.x0, w, R(2)); box(c, hole.x0, hole.y0, w, hole.y1 - hole.y0, R(2)); box(c, hole.x1 - w, hole.y0, w, hole.y1 - hole.y0, R(1));
  // (the lit inner edge, the block joints)
  box(c, hole.x0 + w, hole.y0 + w - Math.max(1, 2 * k), hole.x1 - hole.x0 - 2 * w, Math.max(1, 2 * k), R(4));
  box(c, hole.x0 + w - Math.max(1, 2 * k), hole.y0 + w, Math.max(1, 2 * k), hole.y1 - hole.y0 - w, R(3));
  if (k > 0.45) for (let i = 1; i < 6; i++) { box(c, hole.x0 + ((hole.x1 - hole.x0) * i) / 6, hole.y0, Math.max(1, k), w, R(0)); box(c, hole.x0, hole.y0 + ((hole.y1 - hole.y0) * i) / 6, w, Math.max(1, k), R(0)); box(c, hole.x1 - w, hole.y0 + ((hole.y1 - hole.y0) * i) / 6, w, Math.max(1, k), R(0)); }
  // (the caged work lamp under its top)
  const lx = (hole.x0 + hole.x1) / 2, lw = Math.max(2, 12 * k), ly = hole.y0 + w;
  box(c, lx - lw / 2 - 1, ly, lw + 2, lw * 1.3 + 1, INK);
  box(c, lx - lw / 2, ly, lw, lw * 1.3, step > 3 ? '#8A6A30' : '#FFE6A0');
  box(c, lx - lw / 2, ly, lw, Math.max(1, lw * 0.3), '#FFFFFF');
  if (k > 0.35) { box(c, lx - lw / 2, ly + lw * 0.6, lw, Math.max(1, k), INK); box(c, lx - 1, ly, Math.max(1, k), lw * 1.3, INK); }
};

/** The work lamps' places this frame (screen), for the lighting. */
export const ribLamps: { x: number; y: number; r: number }[] = [];
/** The way out's mouth on screen this frame (for its glow and its light), or null. */
export let exitHole: Bore | null = null;
export const setExitHole = (b: Bore | null) => { exitHole = b; };

// ---------------------------------------------------------------------------------------------------------------
// The land's lighting from behind (index.ts): in the mountain the dark eased in, never black, the work lamps, the
// dragons' head lamps, the way out's daylight cut out of it; out in the open, the hour's own

const CP: TP = { x: 0, y: 0, phi: 0 }, LQ: SP = { x: 0, y: 0, k: 1 };
const LAMP_TINT = LANE_COL.map(([, light]) => {
  const n = parseInt(light.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.18)`;
});
export const behindLight = (state: GameState, base: SceneLight | null | undefined): SceneLight | null => {
  const t = tragonsOf(state), bv = t.bv;
  if (!bv || bv.dead) return base ?? null;
  const s = bv.cam.s + 200;
  const u = Math.max(0, Math.min(1, (s - TUNNEL.a + 100) / 500, (TUNNEL.b + 300 - s) / 500));
  const k = u * u * (3 - 2 * u);
  if (k <= 0.01) return base ?? null;
  const cam = state.camera, lights: Light[] = [...(base?.lights ?? [])];
  const at = (x: number, y: number) => ({ x: cam.x + x, y: cam.y + y });
  // (the dragons' head lamps: a glow ahead of each, in its color; the middle car lit by it)
  const ns = noseS(t.dist);
  for (const tr of bv.trains) {
    if (tr.phase !== 'ok' && tr.phase !== 'arrive') continue;
    trackAt(bv.rolls, tr.lane, ns, CP);
    if (!project(bv.cam, CP.x, CP.y + 90, ns, LQ)) continue;
    const p = turnedPt(bv, LQ.x, LQ.y);
    lights.push({ ...at(p.x, p.y), r: 260 * LQ.k, a: 0.85, color: LAMP_TINT[tr.lane] });
    trackAt(bv.rolls, tr.lane, t.dist + 50, CP);
    if (project(bv.cam, CP.x, CP.y + 60, t.dist + 50, LQ)) { const q = turnedPt(bv, LQ.x, LQ.y); lights.push({ ...at(q.x, q.y), r: 150 * LQ.k, a: 0.55 }); }
  }
  for (const L of ribLamps.slice(-4)) { const p = turnedPt(bv, L.x, L.y); lights.push({ ...at(p.x, p.y), r: L.r, a: 0.7, color: 'rgba(255, 220, 140, 0.16)' }); }
  if (exitHole) { const e = exitHole, p = turnedPt(bv, (e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2); lights.push({ ...at(p.x, p.y), r: Math.max(60, (e.x1 - e.x0) * 0.9), a: 0.95, color: 'rgba(255, 244, 214, 0.14)' }); }
  return { dark: Math.max(base?.dark ?? 0, 0.72 * k), shade: [10, 6, 16], rim: 0.3, grade: base?.grade, lights };
};
/** (ride.ts turned: a screen point before the view's turned, as it's drawn) */
const turnedPt = (bv: Bv, x: number, y: number) => {
  const a = bv.cam.ang, px = W / 2, py = bv.cam.hy, dx = x - px, dy = y - py, cs = Math.cos(a), sn = Math.sin(a);
  return { x: px + dx * cs - dy * sn, y: py + dx * sn + dy * cs };
};

// ---------------------------------------------------------------------------------------------------------------
// Effects

/** The splashdown: walls of spray up off both sides of every dragon as they hit the lagoon, falling back; the mist over
 *  the lot (screen space, over the picture: `x, y` his car's place, `k` its scale). */
export const splashFx = (c: Ctx, t: Tragons, f: number, x: number, y: number, k: number) => {
  const age = f - t.splashAt;
  if (age < 0 || age > 60) return;
  const u = age / 60;
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1, a = hash(i * 1.7), b = hash(i * 3.3);
    const tt = age * (0.75 + a * 0.5);
    const px = x + side * (54 + b * 70) * k + side * (0.6 + a * 1.6) * k * tt, py = y - 6 * k - (5 + b * 6) * k * tt + 0.16 * k * tt * tt;
    if (py > y + 20 * k) continue;
    const r = (4 + a * 6) * k * (1 - u * 0.6);
    // (a round blob of water in steps: its foam, its body, a glint)
    box(c, px - r, py - r * 0.6, r * 2, r * 1.2, i % 3 ? '#E8F4FF' : '#A8CCF4');
    box(c, px - r * 0.6, py - r, r * 1.2, r * 2, i % 3 ? '#E8F4FF' : '#A8CCF4');
    if (i % 4 === 0) box(c, px - r * 0.4, py - r * 0.7, r * 0.6, r * 0.4, '#FFFFFF');
  }
  if (age < 24) { c.globalAlpha = 0.3 * (1 - age / 24); box(c, 0, 0, W, H, '#E8F4FF'); c.globalAlpha = 1; }
};

/** The wake off his dragon's wheels while it's in the lagoon's water. */
export const wakeFx = (c: Ctx, f: number, x: number, y: number, k: number) => {
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1, ph = ((f * 2 + i * 9) % 24) / 24;
    const px = x + side * (50 + ph * 70) * k, py = y + 4 * k - Math.sin(ph * Math.PI) * 26 * k;
    box(c, px - 4 * k, py - 3 * k, 8 * k, 6 * k, i % 3 ? '#E8F4FF' : '#A8CCF4');
  }
};

/** The speed lines at the ride's top speed: streaks off the vanishing point out to the edges, in steps (screen space). */
export const speedLines = (c: Ctx, f: number, hy: number, amount: number) => {
  if (amount <= 0.02) return;
  c.globalAlpha = Math.min(0.5, amount * 0.5);
  c.strokeStyle = '#F8FAFC'; c.lineWidth = 2; c.beginPath();
  for (let i = 0; i < 14; i++) {
    const a = hash(i * 7.7 + (f >> 2) * 0.13) * Math.PI * 2, r0 = 240 + hash(i * 3.1 + f * 0.01) * 120, ph = ((f * 9 + i * 37) % 120) / 120;
    const r1 = r0 + ph * 260, r2 = r1 + 60 + ph * 90, cs = Math.cos(a), sn = Math.sin(a);
    c.moveTo(W / 2 + cs * r1, hy + sn * r1 * 0.7); c.lineTo(W / 2 + cs * r2, hy + sn * r2 * 0.7);
  }
  c.stroke();
  c.globalAlpha = 1;
};

/** Snow coming down in the open (flakes in three sizes, drifting with the ride's turn). */
export const snowFx = (c: Ctx, f: number, turn: number) => {
  for (let i = 0; i < 40; i++) {
    const sz = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1, sp = 0.6 + sz * 0.5;
    const x = (((hash(i * 1.3) * W - turn * 0.6 * sz + Math.sin(f * 0.02 + i) * 12) % W) + W) % W, y = ((hash(i * 2.9) * H + f * sp) % (H + 20)) - 10;
    box(c, x, y, sz, sz, i % 5 ? '#FFFFFF' : '#DCE6F6');
  }
};

export { DRAW, inTunnel };
