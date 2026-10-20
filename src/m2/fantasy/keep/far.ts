// The castle's base's far off (screen space: the backdrop), every layer painted once for the hour into a tile or a
// stamp and slid along (only the birds or fireworks, the balloons, the snow, Piper's window's glow and its sparkles
// live). He's AT the castle now, so the monument hands over (no castle on a far crag in this sky): instead THE INNER
// WARD towers over the walls he's climbing, painted close at the screen's own pixels:
//
//   the sky by the hour (banded, dithered between), cirrus and stepped cumulus (the high ones only seen from up the
//   tower); birds by day, fireworks after dark; THE ALPS on the horizon (no volcanoes); the park beyond (the glen's: the
//   fairy wheel he came from, Hogsmeat, Rapunzel's tower, the beanstalk, Truelling Tragons); the castle's own grounds
//   (only seen from up on the walls, as from the broom: green lawns under patchy snow, the drained moat partly frozen
//   with skaters on its ice, the hedge maze capped in snow, frosted paths of guests between lamp posts, queue
//   canopies, the broom port's stands far off, flower beds blooming through the snow, a carousel); and THE INNER WARD
//   over it all: its curtain wall and round towers, the chapel and its star spire, the great hall's slates and dormers,
//   the clock tower, THE KEEP (buttressed, three tiers of lancets, a rose window, long banners, a machicolated crown,
//   corner turrets under blue cones) and up out of it THE HIGHEST SPIRE with PIPER'S WINDOW lit pink up near its top.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { stamp, hazeBands } from '../../intro/art/kit';
import { box, mix, hash, checker, polyF, INK, SNOW, type Ctx } from '../kit';
import { paintAlps, MW, MH, snowfall } from '../square/far';
import { paintPark, PW, PH, PG } from '../glen/far';
import { paintCirrus, paintCumulus, CIW, CIH, CUW, birds, fireworks, balloons } from '../wheel/far';
import { ashlar, merlons, slit, lancet, banner, cone, drum, guest, PALE, ROOF, PINK, PLUM, GOLD, TIMBER, RED } from './paint';
import { GY, x0, RUNWAY } from './layout';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const SKY = ['#22327E', '#3A5ABA', '#6890DA', '#A0C0EE', '#DAD6F2', '#F6CCDC'];

/** How far up he's taken the camera (0 on the ground; ~800 at the tower's gallery). */
export const climbOf = (state: GameState) => Math.max(0, Math.min(1400, GY - 500 - state.camera.y));
/** Where the horizon sits on screen (sinking a little as he climbs). */
export const horizonY = (state: GameState) => Math.round(440 + climbOf(state) * 0.06);

const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  if (y > H || y + h < 0) return;
  const tod = timeOfDay();
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `fa-kp-${key}-${tod.key}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
const rampT = (T: (c: string) => string, Rr: string[]) => Rr.map(T);
const winLit = (tod: TimeOfDay, i: number) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : null) : hash(i * 1.7) > 0.8 ? '#E8B070' : null);

// ---------------------------------------------------------------------------------------------------------------
// The castle's grounds (seen from up on the walls)

const GW = 1600, GH = 260;
const paintGrounds = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), Sn = T('#E8EEF8'), SnL = T('#FFFFFF');
  // (the lawns going back, green (the Great Pixie's magic) under the land's snow: banded, mown stripes)
  const lawn = [T('#24481E'), T('#305C26'), T('#3C702E'), T('#4A843A')];
  const snow = [T('#B8C4E0'), T('#D6E0F2'), T('#ECF2FC')];
  for (let y = 0; y < GH; y += 2) { const band = Math.floor(y / (6 + y * 0.08)) % 2; box(g, 0, y, GW, 2, lawn[(y < 90 ? 1 : 2) + band]); }
  checker(g, 0, 0, GW, 4, lawn[1], 0, 2);
  // (patchy snow lying over them: wider patches nearer, the mown stripes still reading in it, a dithered edge where it
  // thins to the green; drifted deep along the far edge)
  const vn = (x: number, y: number) => { const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), h = (a: number, b: number) => hash(a * 57.31 + b * 131.7); const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1); return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy; };
  for (let y = 0; y < GH; y += 2) {
    const sc = 0.012 / (0.35 + y / GH), band = Math.floor(y / (6 + y * 0.08)) % 2, deep = Math.max(0, 1 - y / 26) * 0.5;
    // (solid stretches go down as one run each; the dithered edge a texel at a time)
    let run = -1, rx0 = 0;
    const flush = (x: number) => { if (run >= 0) box(g, rx0, y, x - rx0, 2, run === 2 ? snow[1 + band] : snow[0]); run = -1; };
    for (let x = 0; x < GW; x += 2) {
      const v = 0.5 + (vn(x * sc, y * sc * 2.2) * 0.7 + vn(x * sc * 3 + 40, y * sc * 6) * 0.3 - 0.5) * 2.4 + deep;
      const k = v > 0.6 ? 2 : v > 0.55 ? 1 : -1;
      if (k !== run) { flush(x); if (k >= 0) { run = k; rx0 = x; } }
      if (k < 0 && v > 0.5) { box(g, x + ((y >> 1) & 1), y, 1, 1, snow[0]); box(g, x + 1 - ((y >> 1) & 1), y + 1, 1, 1, snow[0]); }
      else if (k < 0 && v > 0.46 && ((x + y) & 3) === 0) box(g, x, y, 1, 1, snow[0]);
    }
    flush(GW);
  }
  // (the far rank: a row of pines and a wall of hedge, a carousel, the broom port's stands far off)
  for (let x = 4; x < GW; x += 9) { const h = 8 + hash(x) * 8; polyF(g, [[x, 6 - h], [x + 4, 6], [x - 4, 6]], T('#22403E')); box(g, x - 3, 4 - h * 0.5, 4, 1, Sn); }
  const cx = 300;
  box(g, cx - 22, -6, 44, 10, T('#C8B8D8')); for (let k = 0; k < 8; k++) box(g, cx - 20 + k * 5, -4, 2, 6, T(['#F49AC8', '#F6D365', '#9CD0F4'][k % 3]));
  polyF(g, [[cx - 26, -6], [cx, -22], [cx + 26, -6]], T('#D8609E')); for (let k = 0; k < 6; k++) polyF(g, [[cx - 26 + k * 9, -6], [cx - 21 + k * 9, -6], [cx, -22]], T(k % 2 ? '#F4F0FA' : '#D8609E'));
  polyF(g, [[cx - 8, -16], [cx, -22], [cx + 8, -16]], Sn); for (let k = 0; k < 52; k += 3) box(g, cx - 26 + k, -7, 2, 1, Sn);
  const sx = 1180;
  for (let r = 0; r < 4; r++) { box(g, sx - 60 + r * 4, -4 - r * 5, 120 - r * 8, 5, T(r % 2 ? '#5A4A7A' : '#6A5A8C')); box(g, sx - 60 + r * 4, -4 - r * 5, 120 - r * 8, 1, Sn); }
  for (let k = 0; k < 40; k++) box(g, sx - 56 + hash(k * 2.3) * 112, -18 + hash(k * 1.1) * 14, 1, 2, T(['#F472B6', '#FDE68A', '#A8C8F0', '#F4F4F5'][k % 4]));
  for (const tx of [sx - 66, sx + 62]) { box(g, tx, -40, 6, 40, T('#6A5A8C')); polyF(g, [[tx - 2, -40], [tx + 3, -50], [tx + 8, -40]], T('#C8283E')); }
  for (const hx of [sx - 20, sx + 24]) { box(g, hx, -46, 1, 30, T('#4A4060')); g.strokeStyle = T('#F2C84A'); g.lineWidth = 1; g.beginPath(); g.arc(hx, -50, 4, 0, Math.PI * 2); g.stroke(); }
  // (the drained moat across the middle (the same as from the broom): stone banks capped in snow, the mud in bands,
  // partly frozen over (sheets of ice with dithered ends), skaters on the ice, puddles in the mud)
  const my = 34;
  box(g, 0, my - 3, GW, 3, T('#9C96B0')); box(g, 0, my - 4, GW, 1, Sn);
  box(g, 0, my, GW, 14, T('#4A321A')); box(g, 0, my + 2, GW, 3, T('#5E4224')); box(g, 0, my + 8, GW, 2, T('#362412')); box(g, 0, my + 14, GW, 3, T('#7A7490')); box(g, 0, my + 14, GW, 1, Sn);
  const ice: [number, number][] = [];
  for (let x = 0; x < GW;) { const w = 60 + hash(x * 0.37) * 180, gap = 30 + hash(x * 0.91) * 120; ice.push([x, w]); x += w + gap; }
  for (const [x, w] of ice) {
    box(g, x, my + 1, w, 12, T('#A8C8E8')); box(g, x, my + 2, w, 2, T('#D8ECFA')); box(g, x, my + 8, w, 1, T('#88A8CC'));
    for (const e of [x - 1, x + w]) { const d = e < x ? -1 : 1; for (let yy = my + 1; yy < my + 13; yy++) { if ((yy & 1) === 0) box(g, e, yy, 1, 1, T('#A8C8E8')); if ((yy & 3) === 0) box(g, e + d * 2, yy, 1, 1, T('#A8C8E8')); } }
    for (let k = 0; k < 3; k++) { const cx = x + hash(x + k * 7.1) * w; box(g, cx, my + 5 + k * 2, 5, 1, T('#F4FAFF')); }
  }
  for (let i = 0; i < 40; i++) { const x = hash(i * 5.3) * GW; if (ice.some(([a, w]) => x > a - 4 && x < a + w + 4)) continue; box(g, x, my + 4 + hash(i * 2.9) * 7, 4 + hash(i) * 6, 1, T('#5A7AAA')); }
  for (let i = 0; i < 26; i++) { const [ix, iw] = ice[i % ice.length], x = ix + 4 + hash(i * 3.7) * Math.max(1, iw - 8), y = my + 4 + hash(i * 1.9) * 7; box(g, x, y - 5, 2, 5, T(['#C8283E', '#2E5AAE', '#E0AE3A', '#7A3AAA'][i % 4])); box(g, x, y - 7, 2, 2, T('#F2C8A0')); box(g, x - 2, y, 6, 1, T('#5A6A8A')); }
  // (the hedge maze: rows going back, paths between, a fountain in its heart)
  const mx0 = 520, mx1 = 980;
  for (let r = 0; r < 6; r++) {
    const y = 60 + r * 11, hh = 5 + r;
    for (let x = mx0; x < mx1; x += 2) { if (hash(Math.floor(x / 26) * 7 + r * 13) > 0.78) continue; box(g, x, y - hh, 2, hh, T(r % 2 ? '#2E5A3A' : '#3A6A44')); }
    box(g, mx0, y - hh, mx1 - mx0, 1, T('#5A8A5A')); box(g, mx0, y - hh - 1, mx1 - mx0, 1, Sn);
    // (snow capping the hedge tops in clumps, drifted along their feet)
    for (let x = mx0; x < mx1; x += 3) if (hash(x * 0.29 + r) > 0.45) box(g, x, y - hh, 2, 1, SnL);
    box(g, mx0, y, mx1 - mx0, 1, Sn); for (let x = mx0 + (r & 1); x < mx1; x += 2) box(g, x, y + 1, 1, 1, Sn);
  }
  box(g, 742, 84, 16, 6, T('#B8B2C8')); box(g, 748, 76, 4, 8, T('#B8B2C8')); box(g, 744, 84, 12, 2, T('#A8D0F0'));
  // (paths of guests between lamp posts, queue canopies, flower beds; the nearest rank biggest)
  for (const [y, s, n] of [[118, 0.8, 70], [170, 1.1, 60], [232, 1.5, 46]] as const) {
    box(g, 0, y - 2, GW, 10 * s, T('#B0AAC2')); box(g, 0, y - 2, GW, 1, T('#D0CADA')); box(g, 0, y - 3, GW, 1, Sn);
    // (frosted: rime in the gravel, snow banked along the near kerb where it's been shoveled)
    for (let x = 0; x < GW; x += 5) box(g, x + hash(x * 0.7 + y) * 4, y + hash(x * 1.3 + y) * (10 * s - 3), 1, 1, T('#D6E0F2'));
    box(g, 0, y - 2 + 10 * s, GW, 1, Sn); for (let x = (y & 1); x < GW; x += 2) box(g, x, y - 1 + 10 * s, 1, 1, Sn);
    for (let i = 0; i < n; i++) guest(g, hash(i * 1.37 + y) * GW, y + 6 * s, i * 7 + y, s * 0.8, T);
    for (let x = 60; x < GW; x += 210) { const h = 30 * s; box(g, x, y - h, 2, h, T('#2A2638')); box(g, x - 3, y - h - 4, 7, 5, tod.lamps > 0.3 ? '#FFD88A' : T('#C8C6D6')); }
    for (let x = 160 + y; x < GW; x += 380) { const w = 70 * s; box(g, x, y - 18 * s, w, 3, T('#D8609E')); for (let k = 0; k < w; k += 8) box(g, x + k, y - 18 * s, 4, 3, T('#F4F0FA')); box(g, x, y - 18 * s - 1, w, 1, SnL); for (const px of [x, x + w - 2]) box(g, px, y - 15 * s, 2, 15 * s, T('#3A3448')); for (let k = 4; k < w - 4; k += 5) box(g, x + k, y - 6 * s, 2, 6 * s, T(['#C8283E', '#2E5AAE', '#F4F0FA'][k % 3])); }
    // (the flower beds under snow, the blooms poking up through it (the park's magic))
    for (let x = 40 + y * 2; x < GW; x += 300) { box(g, x, y - 6, 60 * s, 5, T('#3E6A34')); box(g, x, y - 5, 60 * s, 4, Sn); box(g, x, y - 6, 60 * s, 1, SnL); for (let k = 0; k < 60 * s; k += 4) { box(g, x + k, y - 7, 2, 2, T(['#F472B6', '#FDE68A', '#E11D48'][k % 3])); box(g, x + k, y - 5, 1, 2, T('#3E6A34')); } }
  }
  for (let x = 0; x < GW; x += 37) if (hash(x * 0.71) > 0.6) { box(g, x, 100 + hash(x) * 120, 3, 1, SnL); }
  hazeBands(g, 0, 0, GW, 40, skyAt(0.9, tod), 0.45, 0.0, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// THE INNER WARD: the castle over the walls

/** The skyline's stamp: x 0..SW, its foot at y 0 (the horizon), up to -SH. */
export const SW = 1500, SH = 700, KX = 760;
/** Piper's window in the skyline's stamp. */
export const WIN = { x: KX + 2, y: -404 };

const paintInnerWard = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.14);
  const S = rampT(T, PALE), Sd = rampT(farCol(tod, 0.3), PALE), Rf = rampT(T, ROOF), Rd = rampT(farCol(tod, 0.3), ROOF);
  const Gd = rampT(T, GOLD), Pk = rampT(T, PINK), Pl = rampT(T, PLUM), Sl = rampT(T, ['#14142A', '#20223C', '#2E3252', '#40466A', '#5A6288', '#7C86AA']);
  const Sn = SNOW.map(T), Tm = rampT(T, TIMBER), Rd2 = rampT(T, RED);
  const win = (x: number, y: number, w: number, h: number, i: number) => { box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, winLit(tod, i) ?? S[1]); if (w > 3) box(g, x, y, 1, h, winLit(tod, i) ? '#FFF4C8' : S[2]); };

  // THE BACK RANK (far, hazier): towers and roofs between the near ones, so there's no gap of sky
  for (const [x, h, w] of [[60, 260, 40], [250, 300, 34], [420, 340, 30], [1080, 330, 36], [1250, 280, 40], [1440, 250, 38]] as const) {
    drum(g, x, -h, -60, w, Sd, x, { band: true });
    cone(g, x, -h - 2, w / 2 + 5, w * 1.5, Rd, rampT(farCol(tod, 0.3), GOLD), null, SNOW.map(farCol(tod, 0.3)));
    for (let k = 0; k < 3; k++) win(x - 2, -h + 30 + k * 50, 4, 9, x + k);
  }

  // THE CHAPEL (left): a gabled nave, its rose window, buttresses, a slender star spire
  const ch0 = 40, ch1 = 230, chTop = -190;
  box(g, ch0 - 1, chTop - 1, ch1 - ch0 + 2, -chTop + 1, INK); ashlar(g, ch0, chTop, ch1 - ch0, -chTop, S, 11, 12, 24);
  polyF(g, [[ch0 - 8, chTop + 1], [(ch0 + ch1) / 2, chTop - 70], [ch1 + 8, chTop + 1]], INK);
  polyF(g, [[ch0 - 6, chTop], [(ch0 + ch1) / 2, chTop - 67], [ch1 + 6, chTop]], Sl[3]);
  polyF(g, [[ch0 - 6, chTop], [(ch0 + ch1) / 2, chTop - 67], [(ch0 + ch1) / 2 - 20, chTop]], Sl[4]);
  for (let r = 0; r < 9; r++) { const y = chTop - 6 - r * 7, hw = ((ch1 - ch0) / 2 + 6) * (1 - (r * 7 + 6) / 67); for (let sx = -hw; sx < hw; sx += 6) box(g, (ch0 + ch1) / 2 + sx, y, 5, 1, sx < 0 ? Sl[2] : Sl[1]); }
  box(g, ch0 - 8, chTop - 2, ch1 - ch0 + 16, 3, Sn[4]); polyF(g, [[(ch0 + ch1) / 2, chTop - 67], [(ch0 + ch1) / 2 - 30, chTop - 30], [(ch0 + ch1) / 2 - 24, chTop - 30]], Sn[4]);
  { const rx = (ch0 + ch1) / 2, ry = chTop + 50; g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.arc(rx, ry, 24, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 21, 0, Math.PI * 2); g.fill();
    const lit = tod.lamps > 0.3;
    for (let a = 0; a < 12; a++) { const an = (a / 12) * Math.PI * 2; g.fillStyle = lit ? ['#FFB0D8', '#FFE9A8', '#A8D8FF'][a % 3] : T(['#8A3A6A', '#C8962A', '#3A5AAA'][a % 3]); g.beginPath(); g.moveTo(rx, ry); g.arc(rx, ry, 20, an, an + Math.PI / 6 - 0.08); g.closePath(); g.fill(); }
    g.fillStyle = lit ? '#FFF4C8' : Gd[3]; g.beginPath(); g.arc(rx, ry, 6, 0, Math.PI * 2); g.fill(); }
  for (const bx of [ch0 + 6, ch0 + 60, ch1 - 66, ch1 - 12]) { box(g, bx - 1, chTop + 10, 10, -chTop - 10, INK); box(g, bx, chTop + 10, 8, -chTop - 10, S[4]); box(g, bx + 5, chTop + 10, 3, -chTop - 10, S[2]); polyF(g, [[bx - 1, chTop + 11], [bx + 4, chTop], [bx + 9, chTop + 11]], S[5]); }
  for (const lx of [ch0 + 34, ch1 - 40]) lancet(g, lx, chTop + 100, 14, 50, S, '#3A6ACC', lx);
  { const sx = ch1 - 20, st = chTop - 120; box(g, sx - 9, st, 18, 130, INK); box(g, sx - 8, st, 16, 130, S[3]); box(g, sx - 8, st, 4, 130, S[4]); box(g, sx + 4, st, 4, 130, S[1]); win(sx - 2, st + 20, 4, 12, 33); slit(g, sx, st + 60, 14, S); cone(g, sx, st - 1, 13, 80, Rf, Gd, null, Sn);
    // (its star, gilt)
    const yy = st - 104; polyF(g, [[sx, yy - 9], [sx + 3, yy - 3], [sx + 9, yy - 3], [sx + 4, yy + 1], [sx + 6, yy + 8], [sx, yy + 4], [sx - 6, yy + 8], [sx - 4, yy + 1], [sx - 9, yy - 3], [sx - 3, yy - 3]], Gd[4]); box(g, sx - 1, yy - 5, 2, 2, '#FFFFFF'); }

  // THE GREAT HALL: a long hall, steep slates with dormers, buttresses, lancets down its side, chimneys, a bell turret
  const gh0 = 236, gh1 = 520, ghTop = -150;
  box(g, gh0 - 1, ghTop - 1, gh1 - gh0 + 2, -ghTop + 1, INK); ashlar(g, gh0, ghTop, gh1 - gh0, -ghTop, S, 23, 12, 26);
  polyF(g, [[gh0 - 6, ghTop + 1], [gh0 + 30, ghTop - 80], [gh1 - 30, ghTop - 80], [gh1 + 6, ghTop + 1]], INK);
  polyF(g, [[gh0 - 4, ghTop], [gh0 + 31, ghTop - 78], [gh1 - 31, ghTop - 78], [gh1 + 4, ghTop]], Sl[3]);
  for (let r = 0; r < 11; r++) { const y = ghTop - 4 - r * 7; for (let sx = gh0 + r * 3; sx < gh1 - r * 3; sx += 6) box(g, sx, y, 5, 1, r % 2 ? Sl[2] : Sl[1]); }
  box(g, gh0 + 30, ghTop - 80, gh1 - gh0 - 60, 3, Gd[3]); box(g, gh0 + 30, ghTop - 81, gh1 - gh0 - 60, 1, Gd[5]);
  for (let k = gh0 + 40; k < gh1 - 40; k += 24) { box(g, k - 1, ghTop - 80, 2, -6, Gd[2]); ballR(g, k, ghTop - 88, 2, Gd); }
  box(g, gh0 - 6, ghTop - 2, gh1 - gh0 + 12, 3, Sn[4]); box(g, gh0 + 30, ghTop - 83, gh1 - gh0 - 60, 2, Sn[5]);
  for (let dx = gh0 + 40; dx < gh1 - 40; dx += 56) {
    box(g, dx - 9, ghTop - 46, 18, 22, INK); box(g, dx - 8, ghTop - 45, 16, 21, S[3]); box(g, dx - 8, ghTop - 45, 3, 21, S[4]); win(dx - 4, ghTop - 40, 8, 12, dx);
    polyF(g, [[dx - 12, ghTop - 45], [dx, ghTop - 60], [dx + 12, ghTop - 45]], INK); polyF(g, [[dx - 11, ghTop - 46], [dx, ghTop - 58], [dx + 11, ghTop - 46]], Rf[3]); polyF(g, [[dx - 11, ghTop - 46], [dx, ghTop - 58], [dx - 2, ghTop - 46]], Rf[4]); box(g, dx - 12, ghTop - 47, 24, 2, Sn[4]);
  }
  for (const cx of [gh0 + 60, gh1 - 70]) { box(g, cx - 7, ghTop - 110, 14, 50, INK); box(g, cx - 6, ghTop - 109, 12, 49, Rd2[3]); box(g, cx - 6, ghTop - 109, 3, 49, Rd2[4]); for (let y = ghTop - 104; y < ghTop - 60; y += 6) box(g, cx - 6, y, 12, 1, Rd2[1]); box(g, cx - 8, ghTop - 112, 16, 4, Rd2[2]); box(g, cx - 8, ghTop - 114, 16, 2, Sn[4]); }
  for (let bx = gh0 + 10; bx < gh1; bx += 46) { box(g, bx - 1, ghTop + 6, 10, -ghTop - 6, INK); box(g, bx, ghTop + 6, 8, -ghTop - 6, S[4]); box(g, bx + 5, ghTop + 6, 3, -ghTop - 6, S[2]); polyF(g, [[bx - 1, ghTop + 7], [bx + 4, ghTop - 4], [bx + 9, ghTop + 7]], S[5]); }
  for (let lx = gh0 + 33; lx < gh1 - 20; lx += 46) lancet(g, lx, ghTop + 40, 12, 40, S, ['#C8306E', '#3A6ACC', '#E0AE3A'][((lx / 46) | 0) % 3], lx);
  { const bx = (gh0 + gh1) / 2, bt = ghTop - 130; box(g, bx - 12, bt, 24, 50, INK); box(g, bx - 11, bt + 1, 22, 49, S[3]); box(g, bx - 11, bt + 1, 4, 49, S[4]); g.fillStyle = INK; g.beginPath(); g.arc(bx, bt + 18, 7, Math.PI, 0); g.fill(); box(g, bx - 7, bt + 18, 14, 14, INK); ballR(g, bx, bt + 24, 5, Gd); cone(g, bx, bt, 16, 40, Rf, Gd, '#F49AC8', Sn); }

  // A TALL ROUND TOWER between the hall and the keep
  drum(g, 560, -330, -80, 54, S, 560, { windows: 3, glassCol: '#3A6ACC', slits: true });
  cone(g, 560, -332, 32, 92, Rf, Gd, '#F49AC8', Sn);
  banner(g, 560, -270, 18, 70, Pk, Gd, 'crown');

  // THE KEEP: buttressed, three tiers of lancets, a rose window, banners, a machicolated crown, corner turrets
  const k0 = KX - 150, k1 = KX + 150, kTop = -300;
  box(g, k0 - 1, kTop - 1, k1 - k0 + 2, -kTop + 1, INK); ashlar(g, k0, kTop, k1 - k0, -kTop, S, 41, 13, 30);
  // (its shade down the right, its lit left edge, dithered)
  box(g, k1 - 30, kTop, 30, -kTop, S[2]); checker(g, k1 - 36, kTop, 6, -kTop, S[2], 0, 1); box(g, k1 - 10, kTop, 10, -kTop, S[1]); box(g, k0, kTop, 4, -kTop, S[4]);
  // (the buttresses: stepped back as they climb, gabled caps)
  for (const bx of [k0 + 70, KX - 4, k1 - 78]) {
    for (const [y0, y1, bw] of [[-110, 0, 18], [-220, -110, 14], [-290, -220, 10]] as const) { box(g, bx - bw / 2 - 1, y0, bw + 2, y1 - y0, INK); box(g, bx - bw / 2, y0, bw, y1 - y0, S[4]); box(g, bx + bw / 2 - 4, y0, 4, y1 - y0, S[2]); box(g, bx - bw / 2, y0, 2, y1 - y0, S[5]); polyF(g, [[bx - bw / 2 - 2, y0 + 2], [bx, y0 - 8], [bx + bw / 2 + 2, y0 + 2]], INK); polyF(g, [[bx - bw / 2 - 1, y0 + 1], [bx, y0 - 6], [bx + bw / 2 + 1, y0 + 1]], S[5]); }
  }
  // (three tiers of lancets between the buttresses; a string course between tiers)
  for (const [ty, wh] of [[-90, 54], [-190, 50], [-262, 26]] as const) {
    box(g, k0, ty + wh + 14, k1 - k0, 4, S[5]); box(g, k0, ty + wh + 18, k1 - k0, 1, S[1]);
    for (const lx of [k0 + 36, k0 + 106, KX + 36, k1 - 40]) { if (ty === -190 && Math.abs(lx - KX) < 60) continue; lancet(g, lx, ty, ty === -262 ? 10 : 18, wh, S, ty === -90 ? '#C8306E' : '#3A6ACC', lx + ty); }
  }
  // (the rose window, big, over the middle)
  { const rx = KX + 2, ry = -170; g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 34, 0, Math.PI * 2); g.fill(); g.fillStyle = S[5]; g.beginPath(); g.arc(rx, ry, 32, 0, Math.PI * 2); g.fill(); g.fillStyle = S[2]; g.beginPath(); g.arc(rx + 1, ry + 1, 30, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 28, 0, Math.PI * 2); g.fill();
    const lt = tod.lamps > 0.3;
    for (let a = 0; a < 16; a++) { const an = (a / 16) * Math.PI * 2; g.fillStyle = lt ? ['#FF9AD0', '#FFE9A8', '#C8A8FF', '#A8E0FF'][a % 4] : T(['#B0306E', '#D8A030', '#6A3AAA', '#2E6AAA'][a % 4]); g.beginPath(); g.moveTo(rx, ry); g.arc(rx, ry, 27, an + 0.04, an + Math.PI / 8 - 0.04); g.closePath(); g.fill(); }
    g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = lt ? '#FF7AB8' : Pk[2]; g.beginPath(); g.arc(rx - 4, ry - 2, 5, 0, Math.PI * 2); g.arc(rx + 4, ry - 2, 5, 0, Math.PI * 2); g.fill(); polyF(g, [[rx - 9, ry], [rx, ry + 9], [rx + 9, ry]], lt ? '#FF7AB8' : Pk[2]);
    box(g, rx - 6, ry - 5, 2, 2, '#FFFFFF'); }
  // (the long banners down its face)
  banner(g, k0 + 38, -284, 22, 150, Pk, Gd, 'heart'); banner(g, k1 - 42, -284, 22, 150, Pk, Gd, 'heart');
  // (the machicolated crown: corbels, its parapet and merlons, snow on them)
  box(g, k0 - 8, kTop - 14, k1 - k0 + 16, 16, INK); box(g, k0 - 7, kTop - 13, k1 - k0 + 14, 14, S[4]); box(g, k0 - 7, kTop - 13, k1 - k0 + 14, 2, S[5]);
  for (let cx = k0 - 4; cx < k1 + 4; cx += 12) { polyF(g, [[cx, kTop + 1], [cx + 8, kTop + 1], [cx + 6, kTop + 12], [cx + 2, kTop + 12]], INK); polyF(g, [[cx + 1, kTop + 1], [cx + 7, kTop + 1], [cx + 5, kTop + 11], [cx + 3, kTop + 11]], S[3]); box(g, cx + 8, kTop + 2, 4, 6, INK); }
  merlons(g, k0 - 7, kTop - 14, k1 - k0 + 14, S, 16, 10, 16, true);
  for (const [tx, side] of [[k0 - 4, -1], [k1 + 4, 1]] as const) {
    drum(g, tx, -380, -30, 56, S, tx, { windows: 3, glassCol: '#C8306E', slits: true });
    merlons(g, tx - 30, -380, 60, S, 10, 7, 12, true);
    cone(g, tx, -396, 34, 96, Rf, Gd, side < 0 ? '#F49AC8' : '#F6D365', Sn);
  }
  // THE SIDE SPIRES and THE HIGHEST SPIRE out of the keep's roof
  for (const [sx, sh] of [[KX - 70, 140], [KX + 74, 120]] as const) {
    const st = kTop - 14 - sh;
    box(g, sx - 11, st, 22, sh, INK); box(g, sx - 10, st, 20, sh, S[3]); box(g, sx - 10, st, 5, sh, S[4]); box(g, sx + 5, st, 5, sh, S[1]);
    for (let y = st + 8; y < st + sh; y += 10) box(g, sx - 10, y, 20, 1, S[2]);
    win(sx - 2, st + 18, 5, 14, sx); slit(g, sx, st + 60, 16, S);
    box(g, sx - 14, st - 3, 28, 5, INK); box(g, sx - 13, st - 2, 26, 3, S[5]);
    cone(g, sx, st - 3, 17, 92, Rf, Gd, '#F49AC8', Sn);
  }
  const sx = KX + 2, sTop = -470, sw = 70;
  box(g, sx - sw / 2 - 1, sTop, sw + 2, kTop - 14 - sTop, INK);
  drum(g, sx, sTop, kTop - 14, sw, S, 99, { band: true });
  // (the balcony under her window: a gilt rail on corbels)
  const w = WIN;
  box(g, w.x - 24, w.y + 26, 48, 6, INK); box(g, w.x - 23, w.y + 27, 46, 4, S[5]); box(g, w.x - 23, w.y + 30, 46, 1, S[1]);
  for (let k = w.x - 20; k < w.x + 22; k += 8) { polyF(g, [[k, w.y + 32], [k + 6, w.y + 32], [k + 4, w.y + 40], [k + 2, w.y + 40]], S[2]); }
  for (let k = w.x - 22; k <= w.x + 22; k += 4) box(g, k, w.y + 16, 1, 10, Gd[3]);
  box(g, w.x - 23, w.y + 14, 46, 2, Gd[4]); box(g, w.x - 23, w.y + 16, 46, 1, Gd[1]);
  // (her window: tall, arched, pink stained glass, a gilt heart in it, the frame moulded)
  g.fillStyle = INK; g.beginPath(); g.moveTo(w.x - 15, w.y + 26); g.lineTo(w.x - 15, w.y - 22); g.arc(w.x, w.y - 22, 15, Math.PI, 0); g.lineTo(w.x + 15, w.y + 26); g.closePath(); g.fill();
  g.fillStyle = S[5]; g.beginPath(); g.moveTo(w.x - 13, w.y + 26); g.lineTo(w.x - 13, w.y - 22); g.arc(w.x, w.y - 22, 13, Math.PI, 0); g.lineTo(w.x + 13, w.y + 26); g.closePath(); g.fill();
  g.fillStyle = INK; g.beginPath(); g.moveTo(w.x - 11, w.y + 26); g.lineTo(w.x - 11, w.y - 22); g.arc(w.x, w.y - 22, 11, Math.PI, 0); g.lineTo(w.x + 11, w.y + 26); g.closePath(); g.fill();
  const PG2 = tod.lamps > 0.3 ? ['#C83A8A', '#F06AB0', '#FF9AD0', '#FFD0EC'] : ['#9A2A6A', '#C8448E', '#E870B0', '#FFB0DA'];
  for (let py = w.y - 32; py < w.y + 26; py += 5) for (let pxx = w.x - 10; pxx < w.x + 10; pxx += 5) { const t = hash(py * 0.7 + pxx * 1.3); g.fillStyle = PG2[t > 0.7 ? 3 : t > 0.35 ? 2 : 1]; g.fillRect(pxx, py, 4, 4); }
  box(g, w.x - 1, w.y - 33, 1, 59, INK); box(g, w.x - 10, w.y - 4, 20, 1, INK); box(g, w.x - 10, w.y + 12, 20, 1, INK);
  g.fillStyle = Gd[4]; g.beginPath(); g.arc(w.x - 3, w.y - 14, 3, 0, Math.PI * 2); g.arc(w.x + 3, w.y - 14, 3, 0, Math.PI * 2); g.fill(); polyF(g, [[w.x - 6, w.y - 13], [w.x, w.y - 6], [w.x + 6, w.y - 13]], Gd[4]);
  // (the spire's crown and its tallest cone, gilt-banded, a gilt star on top)
  merlons(g, sx - sw / 2 - 4, sTop, sw + 8, S, 10, 7, 12, true);
  cone(g, sx, sTop - 16, sw / 2 + 10, 150, Rf, Gd, null, Sn);
  { const yy = sTop - 16 - 150 - 24; polyF(g, [[sx, yy - 12], [sx + 4, yy - 4], [sx + 12, yy - 4], [sx + 6, yy + 2], [sx + 8, yy + 11], [sx, yy + 6], [sx - 8, yy + 11], [sx - 6, yy + 2], [sx - 12, yy - 4], [sx - 4, yy - 4]], INK);
    polyF(g, [[sx, yy - 10], [sx + 3, yy - 3], [sx + 10, yy - 3], [sx + 5, yy + 2], [sx + 7, yy + 9], [sx, yy + 5], [sx - 7, yy + 9], [sx - 5, yy + 2], [sx - 10, yy - 3], [sx - 3, yy - 3]], Gd[4]);
    box(g, sx - 2, yy - 6, 2, 3, '#FFFFFF'); }
  // (a covered bridge from the keep to the next tower)
  { const b0 = k1 + 30, b1 = 1060, by = -230; box(g, b0, by - 26, b1 - b0, 30, INK); ashlar(g, b0, by - 25, b1 - b0, 28, S, 77, 9, 18); for (let k = b0 + 10; k < b1 - 6; k += 16) win(k, by - 18, 6, 10, k); polyF(g, [[b0 - 4, by - 25], [b0 + 10, by - 40], [b1 - 10, by - 40], [b1 + 4, by - 25]], Rf[3]); box(g, b0 - 4, by - 27, b1 - b0 + 8, 2, Sn[4]); for (let k = b0 + 4; k < b1; k += 20) { polyF(g, [[k, by + 4], [k + 16, by + 4], [k + 8, by + 18]], INK); } }

  // THE CLOCK TOWER (right): a square belfry, a big gilt clock, louvred bell openings, a pyramid roof
  const ct = 1180, ctTop = -360;
  box(g, ct - 31, ctTop - 1, 62, -ctTop - 60, INK); ashlar(g, ct - 30, ctTop, 60, -ctTop - 60, S, 91, 12, 20);
  box(g, ct + 14, ctTop, 16, -ctTop - 60, S[2]); box(g, ct + 24, ctTop, 6, -ctTop - 60, S[1]);
  { const cy = ctTop + 64; g.fillStyle = INK; g.beginPath(); g.arc(ct, cy, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = Gd[3]; g.beginPath(); g.arc(ct, cy, 21, 0, Math.PI * 2); g.fill(); g.fillStyle = tod.lamps > 0.3 ? '#FFF4D8' : T('#F4ECD8'); g.beginPath(); g.arc(ct, cy, 17, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, ct + Math.cos(a) * 14 - 1, cy + Math.sin(a) * 14 - 1, 2, 2, INK); }
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(ct, cy); g.lineTo(ct, cy - 12); g.moveTo(ct, cy); g.lineTo(ct + 8, cy + 3); g.stroke(); box(g, ct - 1, cy - 1, 3, 3, Gd[1]); }
  for (const bx of [ct - 14, ct + 6]) { box(g, bx - 1, ctTop + 12, 10, 26, INK); for (let y = ctTop + 14; y < ctTop + 37; y += 4) { box(g, bx, y, 8, 2, Tm[3]); box(g, bx, y, 8, 1, Tm[5]); } }
  for (let y = ctTop + 100; y < -80; y += 50) win(ct - 3, y, 6, 14, y);
  merlons(g, ct - 32, ctTop, 64, S, 10, 6, 12, true);
  polyF(g, [[ct - 36, ctTop - 14], [ct, ctTop - 100], [ct + 36, ctTop - 14]], INK); polyF(g, [[ct - 34, ctTop - 15], [ct, ctTop - 98], [ct + 34, ctTop - 15]], Pl[3]); polyF(g, [[ct - 34, ctTop - 15], [ct, ctTop - 98], [ct - 8, ctTop - 15]], Pl[4]); polyF(g, [[ct + 14, ctTop - 15], [ct, ctTop - 98], [ct + 34, ctTop - 15]], Pl[2]);
  for (let r = 1; r < 9; r++) { const y = ctTop - 15 - r * 9, hw = 34 * (1 - (r * 9) / 83); box(g, ct - hw, y, hw * 2, 1, Pl[1]); }
  box(g, ct - 36, ctTop - 17, 72, 3, Sn[4]); box(g, ct - 1, ctTop - 112, 2, 14, Gd[2]); ballR(g, ct, ctTop - 114, 3, Gd);
  // (the inner gatehouse's twin towers, further right)
  for (const [tx, th] of [[1320, 230], [1400, 250]] as const) { drum(g, tx, -th, -70, 46, S, tx, { windows: 2, glassCol: '#E0AE3A', slits: false }); cone(g, tx, -th - 2, 28, 76, Rf, Gd, tx > 1350 ? '#F6D365' : '#F49AC8', Sn); }
  // (a gift-shop turret with a striped roof at the far right edge, to wrap)
  drum(g, 1480, -170, -70, 30, S, 1480, {}); cone(g, 1480, -172, 20, 50, rampT(T, PINK), Gd, '#F6D365', Sn);

  // THE INNER CURTAIN WALL across the foot of it all: merlons, round towers along it, banners, slits
  const wTop = -86;
  box(g, -2, wTop - 1, SW + 4, -wTop + 61, INK); ashlar(g, 0, wTop, SW, -wTop + 60, S, 5, 12, 28);
  merlons(g, 0, wTop, SW, S, 18, 12, 16, true);
  for (let x = 30; x < SW; x += 64) slit(g, x, wTop + 22, 18, S);
  for (const [x, w2] of [[150, 46], [520, 44], [990, 46], [1260, 44]] as const) {
    drum(g, x, wTop - 70, 60, w2, S, x, { slits: true });
    merlons(g, x - w2 / 2 - 4, wTop - 70, w2 + 8, S, 10, 7, 12, true);
  }
  for (const [x, col] of [[90, 0], [330, 1], [700, 0], [860, 1], [1130, 0], [1380, 1]] as const) banner(g, x, wTop + 4, 18, 48, col ? rampT(T, ['#0E1430', '#18224E', '#22327A', '#2E4EA8', '#5A7ACC', '#9AB4EC']) : Pk, Gd, col ? 'star' : 'heart');
  for (let x = 20; x < SW; x += 26) box(g, x, wTop + 50 + (x % 3) * 2, 3, 2, Sn[3]);
};
const ballR = (g: Ctx, x: number, y: number, r: number, Rr: string[]) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rr[2]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = Rr[4]; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, Math.PI * 2); g.fill();
};

/** The inner ward at screen (sx: its keep's middle, sy: its foot), its live bits over it (Piper's window glowing,
 *  breathing; sparkles drifting round the spire). */
const drawInnerWard = (c: Ctx, sx: number, sy: number, f: number, tod: TimeOfDay) => {
  const L = Math.round(sx - KX), T0 = Math.round(sy);
  c.save(); c.translate(L, T0);
  stamp(c, `fa-kp-ward-${tod.key}`, -10, -SH, SW + 20, SH + 70, g => paintInnerWard(g, tod));
  const w = WIN, glow = 0.16 + 0.08 * Math.sin(f * 0.05) + tod.lamps * 0.22;
  c.globalAlpha = Math.min(0.55, glow); c.fillStyle = '#FF8AC8';
  c.beginPath(); c.arc(w.x, w.y - 6, 26, 0, Math.PI * 2); c.fill();
  c.globalAlpha = Math.min(0.35, glow * 0.6); c.beginPath(); c.arc(w.x, w.y - 6, 42, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
  for (let i = 0; i < 9; i++) {
    const a = f * 0.018 + i * 0.7, r = 34 + (i % 3) * 12;
    const x = w.x + Math.cos(a) * r, y = w.y - 70 + Math.sin(a * 1.3) * 60;
    c.fillStyle = (f + i * 13) % 40 < 20 ? '#FFF6C8' : '#FFC8E8';
    c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1);
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

export const drawKeepFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cx = state.camera.x, f = state.frame, up = climbOf(state), hz = horizonY(state);
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [640, 104 + up * 0.03], moon: [150, 80 + up * 0.03], t: f, scroll: cx * 0.01 });
  tile(c, 'cirrus', cx * 0.01 + f * 0.04, Math.round(-80 + up * 0.16), CIH, CIW, g => paintCirrus(g, tod));
  tile(c, 'cu-high', cx * 0.012 + f * 0.05, Math.round(-300 + up * 0.24), 190, CUW, g => paintCumulus(g, tod, 23, 1.3, 190));
  tile(c, 'cu-low', cx * 0.016 + f * 0.07, Math.round(hz - 400 + up * 0.04), 160, CUW, g => paintCumulus(g, tod, 5, 0.9, 160));
  if (tod.lamps > 0.45) fireworks(c, f, up); else birds(c, f, up);
  tile(c, 'alps', cx * 0.03, hz - MH + 6, MH, MW, g => paintAlps(g, tod));
  // (laid from the section's start: Truelling Tragons he's just come off in view as he sets off, the wheel and Hogsmeat
  //  coming round after it)
  tile(c, 'park', (cx - x0) * 0.05 + 1000, hz + 18 - PG, PH, PW, g => paintPark(g, tod));
  // (the castle's own grounds, from up on the walls: the near walls cover them from the ground)
  const gy = hz + 14;
  tile(c, 'grounds', cx * 0.2, gy, GH, GW, g => paintGrounds(g, tod));
  if (gy + GH < H) box(c, 0, gy + GH - 1, W, H - gy - GH + 1, farCol(tod, 0.3)('#9AAACC'));
  mist(c, W, hz - 40, 50, skyAt(0.9, tod), 0.0, 0.3, 4);
  // (THE INNER WARD: inside the walls it drifts slowly across as he goes; out on the runway it's off to his left, the
  //  keep beside the deck, her window right up over it)
  const mid = cx + W / 2 - x0;
  const keepX = mid < RUNWAY - 150 ? 560 - 300 * Math.max(0, Math.min(1, mid / RUNWAY)) : 300 - 200 * Math.max(0, Math.min(1, (mid - RUNWAY) / 3000));
  drawInnerWard(c, keepX, hz + 4, f, tod);
  balloons(c, f, cx, up);
  snowfall(c, state, 36, 1, 0.35, 0.15, 0.55, 13);
  return true;
};
