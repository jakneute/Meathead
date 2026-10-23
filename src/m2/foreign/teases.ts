// Foreign Lands' far teases (screen space; the streets' backdrop, Harry's far skyline): across the lagoon, the OTHER
// pavilions on the far shore, each one's own landmark small in the haze, where it really is round the water.
//
// The World Showcase is a ring round its lagoon: the walk goes round it (Mexico first, on round to Canada, the helipad
// and the AMERICA pavilion's dig last, back by the start). Each pavilion has its spot on the ring (`at`: how far round
// the walk it is). From wherever he is on the shore, looking out across the water, a pavilion round the ring shows at
// half the angle it's round from him (the inscribed angle: the one straight across dead ahead, the ones just ahead and
// just behind off to the sides), so they slide by steady as he walks, the ones coming up drifting in from the right,
// the ones done with going off left; his own is never in it (it's beside him). One eye: the shore's tree line slides at
// the same rate in front of their feet.
//
//   MEXICO the stepped pyramid and its temple    NORWAY the stave church, its dragon heads    CHINA the wall's pagoda
//   GERMANY the castle and the cuckoo clock      ITALY the campanile, its pizza              JAPAN the five-story pagoda
//   MOROCCO the tower, its green dome            FRANCE the Arc and the glass pyramid        UK the tallest phone box, Tower Bridge
//   CANADA the falls, the carved poles, the flume   THE HELIPAD the globe on its pylon, the mast
//   AMERICA (the dig, Harry's): the steel going up, the tower crane, the flag
//
// Out past the far shore, the neighbors: Jungle Land's temple and its paddock's T. rex, Future Land's needle and atom
// (frontier/teases.ts's painter), each seen in its own direction off the ring (far enough off to slide at the full
// angle). And over the lagoon, the helicopter tour going round (it's the helipad's; he'll be in it). Each landmark's
// painted once for the hour into a stamp; only what moves is live. No volcanoes anywhere.

import { CANVAS_WIDTH } from '../../m1/constants';
import { type TimeOfDay, timeOfDay, skyAt, farTint } from '../timeOfDay';
import { farCol } from '../hollywood/blvd/far';
import { mist } from '../adventure/farArt';
import { box, poly, mix, hash, checker, stamp, pixelBlob, INK } from './kit';
import { FLX } from './geometry';
import { paintFuture, FUTURE_W, FUTURE_H } from '../frontier/teases';

type Ctx = CanvasRenderingContext2D;
type T = (c: string) => string;
const W = CANVAS_WIDTH;
/** A ramp off one color for the hour: shadow, shade, itself, lit, highlight. */
const rampT = (t: T, c: string) => [t(mix(c, '#1C1430', 0.5)), t(mix(c, '#1C1430', 0.26)), t(c), t(mix(c, '#F4E8D0', 0.24)), t(mix(c, '#FFFFFF', 0.45))];
const line = (g: Ctx, pts: number[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i], pts[i + 1]) : g.moveTo(pts[i], pts[i + 1])); g.stroke(); };
/** A column lit from the left: across [x, x+w) in steps through the ramp. */
const shaded = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => { for (let u = 0; u < w; u += 2) { const k = u / w; box(g, x + u, y, Math.min(2, w - u), h, R[k < 0.2 ? 4 : k < 0.45 ? 3 : k < 0.75 ? 2 : 1]); } };
/** A hip / pagoda roof: a flat-ish trapezoid with upturned ends, the tile rows hinted, the eave's shadow under. */
const eave = (g: Ctx, cx: number, y: number, w: number, h: number, R: string[], up = 3) => {
  poly(g, [[cx - w / 2 - 2, y + h + 1], [cx - w / 2 - 3, y + h - up - 1], [cx - w * 0.28, y - 1], [cx + w * 0.28, y - 1], [cx + w / 2 + 3, y + h - up - 1], [cx + w / 2 + 2, y + h + 1]], INK);
  poly(g, [[cx - w / 2, y + h], [cx - w / 2 - 1, y + h - up], [cx - w * 0.28, y], [cx + w * 0.28, y], [cx + w / 2 + 1, y + h - up], [cx + w / 2, y + h]], R[2]);
  poly(g, [[cx - w / 2, y + h], [cx - w / 2 - 1, y + h - up], [cx - w * 0.28, y], [cx - w * 0.05, y], [cx - w * 0.12, y + h]], R[3]);
  for (let x = cx - w / 2 + 3; x < cx + w / 2 - 2; x += 3) box(g, x, y + h - 2, 1, 2, R[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The pavilions' landmarks, small (each in a box w × h, its foot at the bottom, its middle at w / 2)

interface Mark { w: number; h: number; paint: (g: Ctx, t: T, tod: TimeOfDay) => void }
const MARKS: Record<string, Mark> = {
  mexico: {
    w: 104, h: 70, paint: (g, t) => {
      const S = rampT(t, '#B8A07A'), R = rampT(t, '#A0442A');
      for (let k = 0; k < 6; k++) {
        const w = 96 - k * 14, y = 70 - (k + 1) * 9, x0 = 52 - w / 2;
        box(g, x0 - 1, y - 1, w + 2, 10, INK); box(g, x0, y, w, 9, S[2]); box(g, x0, y, w, 1, S[4]); box(g, x0, y, 3, 9, S[3]); box(g, x0 + w - 6, y, 6, 9, S[1]);
        for (let x = x0 + 4; x < x0 + w - 6; x += 6) box(g, x, y + 4, 3, 2, S[1]);
      }
      // (the stair up its middle, the temple on top with its carved band and dark door)
      for (let y = 18; y < 70; y += 2) box(g, 46, y, 12, 1, (y >> 1) % 2 ? S[3] : S[1]);
      box(g, 45, 16, 1, 54, INK); box(g, 58, 16, 1, 54, INK);
      box(g, 39, 2, 26, 15, INK); box(g, 40, 3, 24, 13, S[2]); box(g, 40, 3, 24, 3, R[2]); box(g, 40, 3, 4, 13, S[3]);
      box(g, 48, 8, 8, 8, t('#2A1A12'));
    },
  },
  norway: {
    w: 60, h: 84, paint: (g, t) => {
      const Wd = rampT(t, '#4A2E1E'), Sh = rampT(t, '#2E2420'), Rd = rampT(t, '#9F1239');
      const tier = (cx: number, y: number, w: number, h: number) => {
        shaded(g, cx - w / 2 + 3, y + h, w - 6, 10, Wd);
        poly(g, [[cx - w / 2 - 1, y + h + 1], [cx, y - 1], [cx + w / 2 + 1, y + h + 1]], INK);
        poly(g, [[cx - w / 2, y + h], [cx, y], [cx + w / 2, y + h]], Sh[2]); poly(g, [[cx - w / 2, y + h], [cx, y], [cx - 2, y + h]], Sh[3]);
        for (let yy = y + 4; yy < y + h; yy += 3) checker(g, cx - (yy - y) * (w / 2) / h, yy, (yy - y) * w / h, 1, Sh[1]);
        // (the dragon heads off its gable ends: curled up, carved)
        for (const s of [-1, 1]) { const dx = cx + s * (w / 2 - 2); line(g, [dx, y + h - 2, dx + s * 4, y + h - 8, dx + s * 2, y + h - 11], 2, Wd[1]); }
      };
      tier(30, 52, 56, 18); tier(30, 32, 40, 18); tier(30, 14, 24, 16);
      box(g, 29, 0, 2, 14, Wd[1]);
      box(g, 24, 74, 12, 10, INK); box(g, 25, 75, 10, 9, Rd[1]);
    },
  },
  china: {
    w: 120, h: 90, paint: (g, t) => {
      const Rk = rampT(t, '#6E7A5E'), Wl = rampT(t, '#C8C0B0'), Gr = rampT(t, '#2E8A5A'), Rd = rampT(t, '#B91C1C'), Gd = rampT(t, '#D4A020');
      // (the ridge, the wall along it with its battlements, the pagoda at its top)
      poly(g, [[0, 90], [0, 74], [30, 66], [56, 50], [76, 54], [100, 66], [120, 70], [120, 90]], Rk[2]);
      for (let x = 0; x < 120; x += 4) { const y = x < 56 ? 74 - (x / 56) * 24 : 50 + ((x - 56) / 64) * 20; box(g, x, y - 4, 4, 4, Wl[2]); box(g, x, y - 4, 4, 1, Wl[4]); if ((x >> 2) % 2) box(g, x, y - 6, 2, 2, Wl[2]); }
      for (let y = 60; y < 90; y += 6) box(g, 4, y + ((y * 3) % 7), 110, 1, Rk[1]);
      const cx = 60;
      shaded(g, cx - 12, 30, 24, 18, Rd); for (let x = cx - 10; x < cx + 10; x += 5) box(g, x, 34, 2, 14, t('#3A0A0A'));
      eave(g, cx, 22, 44, 9, Gr); shaded(g, cx - 8, 14, 16, 9, Rd); eave(g, cx, 6, 30, 8, Gr);
      box(g, cx - 1, 0, 2, 6, Gd[3]); box(g, cx - 2, 2, 4, 2, Gd[2]);
    },
  },
  germany: {
    w: 120, h: 100, paint: (g, t, tod) => {
      const St = rampT(t, '#E2DED2'), Sl = rampT(t, '#3E4E66'), Wd = rampT(t, '#6A4A2A');
      // (the castle: the curtain wall, the keep, round towers under slate cones, pennants; windows lit after dark)
      box(g, 9, 54, 70, 46, INK); shaded(g, 10, 55, 68, 45, St);
      for (let x = 10; x < 78; x += 6) { box(g, x, 50, 4, 5, INK); box(g, x, 51, 3, 4, St[3]); }
      const Gd = rampT(t, '#D4A020');
      // (the keep: its body, its battlements, the round belfry up out of it (the cone used to float over a gap here))
      box(g, 31, 23, 24, 34, INK); shaded(g, 32, 24, 22, 32, St);
      for (let x = 31; x < 55; x += 5) { box(g, x, 20, 3, 4, INK); box(g, x + 0.5, 21, 2, 3, St[3]); }
      box(g, 35, 11, 16, 13, INK); shaded(g, 36, 12, 14, 12, St);
      box(g, 41, 15, 3, 5, INK); box(g, 41, 16, 2, 3, tod.lamps > 0.3 ? '#FFD88A' : St[0]);
      for (const [tx, tt] of [[12, 40], [74, 34], [43, 12]] as const) {
        if (tx !== 43) { box(g, tx - 8, tt, 16, 100 - tt, INK); shaded(g, tx - 7, tt, 14, 100 - tt, St); }
        // (the corbelled ring of battlements under the cone, as the castle has it in Germany)
        box(g, tx - 9, tt - 3, 18, 5, INK); shaded(g, tx - 8, tt - 2, 16, 3, St); box(g, tx - 8, tt - 2, 16, 1, St[4]);
        for (let x = tx - 8; x < tx + 8; x += 4) box(g, x, tt + 1, 2, 1, St[0]);
        // (the slate cone: scales in rows, lit left, shaded right)
        const ct = tt - 2, tip = ct - 20;
        poly(g, [[tx - 9, ct + 1], [tx, tip - 2], [tx + 9, ct + 1]], INK); poly(g, [[tx - 8, ct], [tx, tip], [tx + 8, ct]], Sl[2]);
        poly(g, [[tx - 8, ct], [tx, tip], [tx - 2, ct]], Sl[3]); poly(g, [[tx + 3, ct], [tx, tip], [tx + 8, ct]], Sl[1]);
        for (let r = 1; r < 5; r++) { const yy = ct - r * 4, hw = 8 * (1 - (r * 4) / 20); for (let x = tx - hw + 1; x < tx + hw - 1; x += 2) box(g, x, yy, 1, 1, Sl[(x - tx) < -2 ? 4 : 0]); }
        // (the gold finial and its ball, the blue-and-white pennant)
        box(g, tx - 1, tip - 9, 2, 10, INK); box(g, tx, tip - 8, 1, 9, Gd[3]); box(g, tx - 1, tip - 2, 3, 2, Gd[2]); box(g, tx - 1, tip - 2, 1, 1, Gd[4]);
        poly(g, [[tx + 1, tip - 9], [tx + 9, tip - 7], [tx + 1, tip - 5]], t('#1E5AA8')); poly(g, [[tx + 1, tip - 9], [tx + 5, tip - 8], [tx + 1, tip - 7]], t('#F8FAFC'));
      }
      for (const [wx, wy] of [[22, 66], [38, 32], [46, 32], [60, 66], [40, 70]] as const) { box(g, wx, wy, 3, 6, INK); box(g, wx, wy + 1, 2, 4, tod.lamps > 0.3 ? '#FFD88A' : St[0]); }
      // (the world's biggest cuckoo clock beside it: the carved house, its dial, the bird on the peak)
      const cx = 100;
      box(g, cx - 13, 54, 26, 46, INK); shaded(g, cx - 12, 55, 24, 45, Wd);
      poly(g, [[cx - 18, 56], [cx, 38], [cx + 18, 56]], INK); poly(g, [[cx - 16, 55], [cx, 40], [cx + 16, 55]], Wd[1]); poly(g, [[cx - 16, 55], [cx, 40], [cx - 3, 55]], Wd[3]);
      g.fillStyle = INK; g.beginPath(); g.arc(cx, 68, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = t('#F2ECD8'); g.beginPath(); g.arc(cx, 68, 6, 0, Math.PI * 2); g.fill();
      line(g, [cx, 68, cx, 64], 1, INK); line(g, [cx, 68, cx + 3, 69], 1, INK);
      box(g, cx - 2, 36, 4, 3, t('#6A4A2A')); box(g, cx + 2, 37, 2, 1, t('#E8A020'));
      for (const px of [cx - 5, cx + 4]) { box(g, px, 78, 1, 10, Wd[0]); box(g, px - 1, 88, 3, 5, t('#6A3A1A')); }
    },
  },
  italy: {
    w: 70, h: 128, paint: (g, t) => {
      const Br = rampT(t, '#B0603C'), Wh = rampT(t, '#E8E2D6'), Gn = rampT(t, '#4E8A6A'), Gd = rampT(t, '#D4A020');
      // (the campanile: brick between pilaster strips, the stone base, the white belfry and its bell, the green spire and the
      // gold angel; THE GIANT PIZZA nailed to it, a slice gone)
      box(g, 23, 40, 24, 88, INK); shaded(g, 24, 40, 22, 88, Br);
      for (let y = 44; y < 128; y += 4) checker(g, 26, y, 18, 1, Br[0]);
      box(g, 24, 40, 2, 88, Br[4]); box(g, 44, 40, 2, 88, Br[0]);
      shaded(g, 22, 116, 26, 12, Wh);
      shaded(g, 24, 26, 22, 14, Wh); for (const ax of [27, 35, 41]) { box(g, ax, 29, 4, 9, t('#2A2A30')); } box(g, 33, 32, 4, 5, t('#B8862E'));
      box(g, 22, 25, 26, 2, Wh[4]); box(g, 22, 39, 26, 2, Wh[1]);
      poly(g, [[23, 26], [35, 4], [47, 26]], INK); poly(g, [[25, 25], [35, 6], [45, 25]], Gn[2]); poly(g, [[25, 25], [35, 6], [33, 25]], Gn[3]);
      box(g, 34, 0, 2, 6, Gd[3]); box(g, 32, 1, 6, 1, Gd[4]);
      // (the pizza, a wedge cut out of it, pepperoni)
      const px = 35, py = 76;
      g.fillStyle = INK; g.beginPath(); g.arc(px, py, 15, 0, Math.PI * 2); g.fill();
      g.fillStyle = t('#D89A44'); g.beginPath(); g.arc(px, py, 14, 0, Math.PI * 2); g.fill();
      g.fillStyle = t('#E8C050'); g.beginPath(); g.arc(px, py, 11, 0, Math.PI * 2); g.fill();
      g.fillStyle = Br[2]; g.beginPath(); g.moveTo(px, py); g.arc(px, py, 15.5, -0.3, 0.55); g.closePath(); g.fill();
      for (const [dx, dy] of [[-6, -5], [3, -8], [-4, 5], [5, 6], [-9, 1]] as const) { box(g, px + dx - 1, py + dy - 1, 3, 3, t('#A02A1A')); }
    },
  },
  japan: {
    w: 64, h: 124, paint: (g, t) => {
      const Rd = rampT(t, '#C8401E'), Rf = rampT(t, '#3A3E48'), Gd = rampT(t, '#A08040');
      // (five stories, each narrower, a tiled eave swept up at its corners, the bronze spire with its rings)
      for (let k = 0; k < 5; k++) {
        const w = 52 - k * 7, y = 124 - (k + 1) * 19, cx = 32;
        shaded(g, cx - w * 0.3, y + 6, w * 0.6, 13, Rd);
        box(g, cx - 2, y + 9, 4, 8, t('#2A1A12'));
        eave(g, cx, y, w, 7, Rf, 4);
      }
      box(g, 31, 5, 2, 24, Gd[2]); box(g, 31, 5, 1, 24, Gd[4]);
      for (let y = 10; y < 26; y += 3) box(g, 29, y, 6, 1, Gd[1]);
      box(g, 30, 1, 4, 4, Gd[3]);
    },
  },
  morocco: {
    w: 80, h: 128, paint: (g, t) => {
      const Sd = rampT(t, '#C8A070'), Zl = rampT(t, '#2E8A6A'), Gd = rampT(t, '#D4A020');
      // (the tower: cut stone, a zellige band, its blind arches, the balcony on corbels, the lantern room, the green dome)
      box(g, 27, 30, 26, 98, INK); shaded(g, 28, 30, 24, 98, Sd);
      for (let y = 34; y < 128; y += 5) checker(g, 30, y, 20, 1, Sd[1]);
      for (const y of [44, 70]) { box(g, 33, y, 6, 12, Sd[0]); box(g, 41, y, 6, 12, Sd[0]); poly(g, [[33, y], [36, y - 3], [39, y]], Sd[0]); poly(g, [[41, y], [44, y - 3], [47, y]], Sd[0]); }
      box(g, 28, 30, 24, 6, Zl[2]); for (let x = 28; x < 52; x += 4) box(g, x, 31, 2, 2, Zl[4]);
      box(g, 25, 28, 30, 3, INK); box(g, 26, 28, 28, 2, Sd[3]);
      for (let x = 27; x < 53; x += 5) { box(g, x, 24, 3, 4, Sd[2]); }
      shaded(g, 33, 12, 14, 13, Sd);
      g.fillStyle = INK; g.beginPath(); g.arc(40, 12, 8, Math.PI, 0); g.fill(); g.fillStyle = Zl[2]; g.beginPath(); g.arc(40, 12, 7, Math.PI, 0); g.fill(); g.fillStyle = Zl[4]; g.beginPath(); g.arc(37, 10, 3, Math.PI, 0); g.fill();
      box(g, 39, 0, 2, 6, Gd[3]); for (const y of [1, 4]) box(g, 38, y, 4, 1, Gd[2]);
      // (a dome and the medina's flat roofs at its foot)
      g.fillStyle = INK; g.beginPath(); g.arc(66, 128, 13, Math.PI, 0); g.fill(); g.fillStyle = Sd[3]; g.beginPath(); g.arc(66, 128, 12, Math.PI, 0); g.fill();
      shaded(g, 2, 110, 24, 18, Sd); for (let x = 2; x < 26; x += 5) box(g, x, 107, 3, 3, Sd[2]);
    },
  },
  france: {
    w: 130, h: 86, paint: (g, t) => {
      const St = rampT(t, '#D8CCB2'), Gl = rampT(t, '#8AB0C8'), Stl = rampT(t, '#5A6068');
      // (the Arc: cut stone, its arch, the attic and its cornice, the relief panels)
      const ax = 44;
      box(g, ax - 29, 18, 58, 68, INK); shaded(g, ax - 28, 19, 56, 67, St);
      g.fillStyle = t('#3A3E4A'); g.beginPath(); g.moveTo(ax - 10, 86); g.lineTo(ax - 10, 50); g.arc(ax, 50, 10, Math.PI, 0); g.lineTo(ax + 10, 86); g.closePath(); g.fill();
      box(g, ax - 28, 18, 56, 4, St[4]); box(g, ax - 28, 30, 56, 2, St[1]); box(g, ax - 28, 22, 56, 1, St[0]);
      for (const px of [ax - 22, ax + 14]) { box(g, px, 40, 8, 12, St[1]); box(g, px + 1, 41, 6, 1, St[4]); }
      // (the glass pyramid in its steel lattice, the palace wing behind it)
      shaded(g, 70, 56, 60, 30, St); for (let x = 74; x < 128; x += 8) { box(g, x, 62, 4, 8, t('#3A4258')); box(g, x, 74, 4, 8, t('#3A4258')); }
      box(g, 70, 54, 60, 3, t('#4A5266'));
      poly(g, [[78, 87], [102, 56], [126, 87]], INK); poly(g, [[80, 86], [102, 58], [124, 86]], Gl[2]); poly(g, [[80, 86], [102, 58], [96, 86]], Gl[3]);
      for (let k = 1; k < 5; k++) { const y = 58 + k * 6; line(g, [102 - (y - 58) * 0.78, y, 102 + (y - 58) * 0.78, y], 1, Stl[3]); }
      line(g, [102, 58, 90, 86], 1, Stl[3]); line(g, [102, 58, 114, 86], 1, Stl[2]);
      box(g, 101, 59, 2, 2, Gl[4]);
    },
  },
  uk: {
    w: 120, h: 140, paint: (g, t, tod) => {
      const Rd = rampT(t, '#C81E1E'), St = rampT(t, '#B8AE98'), Sl = rampT(t, '#4A5060'), Bl = rampT(t, '#4A7AA8');
      // (the world's tallest phone box: red, its little panes, the domed roof, the TELEPHONE crown)
      const bx = 30;
      box(g, bx - 15, 24, 30, 116, INK); shaded(g, bx - 14, 25, 28, 115, Rd);
      for (let y = 34; y < 132; y += 8) for (let x = bx - 10; x < bx + 10; x += 5) box(g, x, y, 3, 6, tod.lamps > 0.3 ? '#FFE8A0' : t('#3A4A5A'));
      box(g, bx - 15, 18, 30, 7, INK); box(g, bx - 14, 19, 28, 5, t('#1A1A1A')); box(g, bx - 10, 20, 20, 3, t('#F2ECE0'));
      g.fillStyle = INK; g.beginPath(); g.ellipse(bx, 18, 16, 6, 0, Math.PI, 0); g.fill(); g.fillStyle = Rd[3]; g.beginPath(); g.ellipse(bx, 18, 15, 5, 0, Math.PI, 0); g.fill();
      box(g, bx - 3, 6, 6, 6, t('#D4A020')); box(g, bx - 4, 10, 8, 2, Rd[2]);
      // (Tower Bridge: its two towers in cut stone, their pinnacled roofs, the high walkway, the chains)
      for (const tx of [70, 106]) {
        box(g, tx - 9, 70, 18, 70, INK); shaded(g, tx - 8, 71, 16, 69, St);
        for (const y of [80, 100]) { box(g, tx - 4, y, 3, 8, St[0]); box(g, tx + 1, y, 3, 8, St[0]); }
        poly(g, [[tx - 10, 71], [tx, 54], [tx + 10, 71]], INK); poly(g, [[tx - 8, 70], [tx, 56], [tx + 8, 70]], Sl[2]); poly(g, [[tx - 8, 70], [tx, 56], [tx - 2, 70]], Sl[3]);
        for (const px of [tx - 8, tx + 7]) box(g, px, 62, 1, 9, Sl[1]);
      }
      box(g, 78, 76, 20, 5, INK); box(g, 78, 77, 20, 3, Bl[2]); box(g, 78, 77, 20, 1, Bl[4]);
      line(g, [61, 72, 54, 120], 1, Bl[1]); line(g, [115, 72, 120, 118], 1, Bl[1]); line(g, [78, 82, 88, 112, 98, 82], 1, Bl[1]);
      box(g, 50, 118, 70, 4, INK); box(g, 50, 119, 70, 2, Bl[1]);
    },
  },
  canada: {
    w: 130, h: 96, paint: (g, t) => {
      const Rk = rampT(t, '#6A6E78'), Wt = rampT(t, '#C8DCEC'), Pn = rampT(t, '#2E4A36'), Pl = rampT(t, '#B88A54'), Fl = rampT(t, '#8A6A44');
      // (the falls down their cliff, the spray at the foot; pines on top)
      poly(g, [[0, 96], [0, 30], [16, 18], [40, 14], [62, 22], [70, 96]], Rk[2]);
      for (let y = 22; y < 96; y += 8) box(g, 2, y + ((y * 7) % 5), 64, 1, Rk[1]); box(g, 0, 30, 10, 66, Rk[3]);
      box(g, 30, 16, 12, 72, Wt[2]); box(g, 31, 16, 3, 72, Wt[4]); for (let y = 20; y < 88; y += 6) box(g, 35 + ((y >> 1) % 3), y, 2, 3, Wt[4]);
      for (let k = 0; k < 6; k++) pixelBlob(g, 28 + k * 3, 88 - (k % 2) * 2, 5, 3, k % 2 ? Wt[3] : t('#F4FAFF'));
      for (const px of [6, 14, 50, 58, 64]) { poly(g, [[px - 4, 22], [px, 8], [px + 4, 22]], Pn[2]); poly(g, [[px - 4, 22], [px, 8], [px, 22]], Pn[3]); }
      // (the carved poles: plywood faces stacked, the wings bolted on top)
      for (const [px, ph] of [[84, 58], [100, 46]] as const) {
        box(g, px - 5, 96 - ph, 10, ph, INK); shaded(g, px - 4, 96 - ph, 8, ph, Pl);
        for (let y = 96 - ph + 6; y < 96; y += 12) { box(g, px - 3, y, 2, 2, INK); box(g, px + 1, y, 2, 2, INK); box(g, px - 2, y + 5, 4, 1, t('#A02A1A')); }
        poly(g, [[px - 16, 96 - ph + 2], [px, 96 - ph - 4], [px + 16, 96 - ph + 2], [px, 96 - ph + 4]], Pl[1]);
      }
      // (the flume's trestle running off right, its trough)
      for (let x = 108; x < 130; x += 6) box(g, x, 70 - (x - 108) * 0.6, 2, 30, Fl[1]);
      line(g, [104, 72, 130, 56], 4, Fl[2]); line(g, [104, 71, 130, 55], 1, Wt[3]);
    },
  },
  heli: {
    w: 90, h: 120, paint: (g, t) => {
      const St = rampT(t, '#7A808A'), Oc = rampT(t, '#2563EB'), Ld = rampT(t, '#3E8A3A'), Gd = rampT(t, '#C8961C'), Rd = rampT(t, '#B91C1C'), Wh = rampT(t, '#E8E4DC');
      // (the globe on its lattice pylon, its gold ring; the terminal's drum; the radio mast and its guys)
      const cx = 38, cy = 34;
      poly(g, [[cx - 20, 104], [cx - 4, 56], [cx + 4, 56], [cx + 20, 104]], St[1]);
      for (let y = 60; y < 104; y += 10) { const u = (y - 56) / 48, l = cx - 4 - 16 * u, r = cx + 4 + 16 * u; line(g, [l, y, r + 3, y + 10], 1, St[3]); line(g, [r, y, l - 3, y + 10], 1, St[0]); }
      g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 23, 0, Math.PI * 2); g.fill();
      g.fillStyle = Oc[1]; g.beginPath(); g.arc(cx, cy, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = Oc[2]; g.beginPath(); g.arc(cx - 3, cy - 3, 17, 0, Math.PI * 2); g.fill(); g.fillStyle = Oc[3]; g.beginPath(); g.arc(cx - 8, cy - 8, 8, 0, Math.PI * 2); g.fill();
      for (const [dx, dy, w, h] of [[-12, -14, 10, 8], [-16, -4, 6, 12], [2, -16, 12, 6], [4, -8, 10, 14], [-6, 8, 6, 8]] as const) box(g, cx + dx, cy + dy, w, h, Ld[dx < 0 ? 3 : 2]);
      g.strokeStyle = Gd[2]; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 30, 7, -0.28, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = Gd[4]; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, 30, 7, -0.28, 0.2, 1.6); g.stroke();
      box(g, cx - 30, 104, 60, 16, INK); shaded(g, cx - 29, 105, 58, 15, Wh); for (let x = cx - 26; x < cx + 26; x += 7) box(g, x, 110, 4, 5, t('#4A6A8A'));
      for (let k = 0; k < 6; k++) { g.fillStyle = (k % 2 ? Rd : Wh)[2]; g.beginPath(); g.arc(cx - 25 + k * 10, 105, 5, 0, Math.PI); g.fill(); }
      const mx = 80;
      for (const [ax] of [[60], [90]] as const) line(g, [mx, 30, ax, 120], 1, St[1]);
      for (let y = 6, k = 0; y < 120; y += 10, k++) box(g, mx - 2, y, 4, 10, (k % 2 ? Wh : Rd)[2]);
    },
  },
  america: {
    w: 140, h: 140, paint: (g, t) => {
      const Stl = rampT(t, '#8A4A2A'), Yl = rampT(t, '#E8B020'), Gy = rampT(t, '#8A8E96');
      // (the AMERICA pavilion's steel going up: columns and girders in red primer, a floor decked, the rest open)
      for (let x = 30; x <= 110; x += 20) { box(g, x - 2, 60, 4, 80, INK); box(g, x - 1, 60, 2, 80, Stl[x % 40 ? 2 : 3]); }
      for (let y = 60; y < 140; y += 20) { box(g, 28, y - 1, 84, 3, INK); box(g, 28, y, 84, 1, Stl[3]); }
      for (let x = 30; x < 110; x += 20) for (let y = 60; y < 140; y += 20) if (hash(x * 3 + y) > 0.55) line(g, [x, y, x + 20, y + 20], 1, Stl[1]);
      box(g, 28, 99, 84, 4, Gy[2]);
      // (the tower crane over it: the mast's lattice, the jib out right, the counter-jib, the cab, the hook on its line)
      const cx = 20;
      box(g, cx - 4, 10, 8, 130, INK); box(g, cx - 3, 10, 6, 130, Yl[2]); for (let y = 14; y < 140; y += 8) line(g, [cx - 3, y, cx + 3, y + 8], 1, Yl[0]);
      box(g, cx - 14, 6, 140, 5, INK); box(g, cx - 13, 7, 138, 3, Yl[2]); for (let x = cx - 12; x < cx + 124; x += 6) line(g, [x, 7, x + 3, 10], 1, Yl[0]);
      box(g, cx - 14, 10, 10, 8, Gy[1]); box(g, cx + 3, 10, 8, 7, INK); box(g, cx + 4, 11, 6, 5, t('#9CC8E8'));
      line(g, [cx, 0, cx - 14, 7], 1, Gy[1]); line(g, [cx, 0, cx + 100, 7], 1, Gy[1]); box(g, cx - 1, 0, 2, 6, Yl[1]);
      box(g, cx + 96, 11, 1, 58, Gy[1]); box(g, cx + 93, 68, 7, 4, Gy[0]);
      // (the flag on its pole at the corner of the steel)
      box(g, 116, 30, 2, 110, Gy[2]);
      for (let k = 0; k < 7; k++) box(g, 118, 30 + k * 3, 22, 3, k % 2 ? t('#F4F0E8') : t('#B91C1C'));
      box(g, 118, 30, 9, 9, t('#1E3A8A'));
    },
  },
  // (Jungle Land, out past the far shore: the temple's broken top over the crowns, the paddock's fence and the rex)
  jungle: {
    w: 200, h: 150, paint: (g, t) => {
      const Lf = rampT(t, '#2F6B22'), S = rampT(t, '#9A9488'), Rx = rampT(t, '#5A6A3A'), Fe = rampT(t, '#8A929C');
      for (let k = 0; k < 6; k++) { const w = 90 - k * 12, y = 150 - 20 - (k + 1) * 12, x0 = 60 - w / 2; box(g, x0 - 1, y - 1, w + 2, 13, INK); box(g, x0, y, w, 12, S[2]); box(g, x0, y, w, 1, S[4]); box(g, x0 + w - 6, y, 6, 12, S[1]); checker(g, x0, y, w, 2, Lf[2]); }
      const ty = 150 - 20 - 72;
      poly(g, [[38, ty], [38, ty - 16], [48, ty - 22], [58, ty - 12], [70, ty - 18], [82, ty - 10], [82, ty]], INK); poly(g, [[39, ty], [39, ty - 15], [48, ty - 20], [58, ty - 11], [70, ty - 17], [81, ty - 9], [81, ty]], S[2]);
      box(g, 54, ty - 10, 10, 10, t('#1A1610'));
      for (let k = 0; k < 4; k++) for (let y = ty + 4 + k * 6; y < 130 - k * 10; y += 2) box(g, 26 + k * 22 + Math.sin(y * 0.2 + k) * 2, y, 2, 2, Lf[(y >> 1) % 3 ? 1 : 3]);
      // (the paddock's fence, the rex's head and neck over it)
      for (let x = 112; x < 200; x += 10) { box(g, x - 1, 96, 3, 54, INK); box(g, x, 96, 1, 54, Fe[3]); }
      for (let y = 102; y < 150; y += 8) box(g, 110, y, 90, 1, Fe[1]);
      poly(g, [[150, 100], [146, 74], [150, 60], [168, 52], [186, 56], [190, 64], [176, 70], [164, 72], [160, 100]], INK);
      poly(g, [[151, 99], [148, 74], [152, 61], [168, 54], [185, 57], [188, 63], [175, 68], [163, 71], [159, 99]], Rx[2]);
      poly(g, [[152, 61], [168, 54], [185, 57], [170, 60]], Rx[3]); box(g, 170, 57, 3, 2, t('#E8C020')); line(g, [176, 66, 188, 64], 1, t('#E8E0D0'));
      for (let k = 0; k < 9; k++) { const x = 8 + k * 22, y = 140 - hash(k) * 12, r = 12 + hash(k * 3) * 8; pixelBlob(g, x, y, r, r * 0.7, Lf[1]); pixelBlob(g, x - 3, y - 3, r * 0.6, r * 0.45, Lf[2]); pixelBlob(g, x - 5, y - 5, r * 0.25, r * 0.2, Lf[3]); }
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Where they are round the ring

/** The ring's length (the walk round the lagoon, from Mexico's start) and each landmark's spot on it. */
const RING = 64000;
const ON_SHORE: [string, number][] = [['mexico', 3100], ['norway', 9000], ['china', 15600], ['germany', 22200], ['italy', 27900], ['japan', 33500], ['morocco', 38900], ['france', 44300], ['uk', 49700], ['canada', 55100], ['heli', 59300], ['america', 62400]];
/** Out past the shore (directions off the ring, as spots round it: seen in the middle when he's straight across). */
const BEYOND: [string, number][] = [['future', 14000], ['jungle', 46000]];
/** How wide the view is: px per unit of tan(bearing). */
const FOCAL = 470;

/** Where along the ring he is (the view's middle; the streets' world x from FLX). */
export const ringAt = (camX: number) => camX + W / 2 - FLX;
/** A spot round the ring's bearing from here (screen px from the middle, or null: out of view). */
const across = (here: number, at: number, beyond: boolean) => {
  const d = ((((at - here) / RING) * Math.PI * 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const b = beyond ? Math.PI - d : (Math.PI - d) / 2;
  const bb = ((b + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return Math.abs(bb) > 1.1 ? null : FOCAL * Math.tan(bb);
};

const markOf = (id: string): Mark => (id === 'future' ? { w: FUTURE_W, h: FUTURE_H, paint: (g, _t, tod) => paintFuture(g, tod) } : MARKS[id]);
/** One landmark stamped for the hour, its foot at (x middle, foot), `s` its size. `k`: how far into the haze. */
export const drawMark = (c: Ctx, id: string, x: number, foot: number, k: number, s = 1, tod = timeOfDay()) => {
  const M = markOf(id), w = M.w * s, h = M.h * s, x0 = Math.round(x - w / 2), top = Math.round(foot - h);
  if (x0 > W + 10 || x0 + w < -10) return;
  c.save(); c.translate(x0, top); if (s !== 1) c.scale(s, s);
  // (room over the top for what pokes out of it: finials, pennants (the castle's keep's were cut off))
  stamp(c, `fl-mark-${id}-${k}-${tod.key}`, -2, -26, M.w + 4, M.h + 28, g => { M.paint(g, farCol(tod, k), tod); mist(g, M.w + 4, M.h * 0.55, M.h * 0.45 + 4, skyAt(0.9, tod), 0, 0.3, 3); });
  c.restore();
};

/** The far shore's pavilions and the neighbors past it (screen space), for wherever on the ring `here` is; `shore` the
 *  screen row the far shore's tree line stands on (their feet go behind it). `layer`: the neighbors (behind the
 *  pavilions' own big far landmarks) or the shore's pavilions (in front of them). */
export const drawAcross = (c: Ctx, here: number, shore: number, layer: 'beyond' | 'shore') => {
  const tod = timeOfDay();
  if (layer === 'beyond') { for (const [id, at] of BEYOND) { const dx = across(here, at, true); if (dx !== null) drawMark(c, id, W / 2 + dx, shore + 14, 0.55, id === 'future' ? 0.5 : 1, tod); } return; }
  for (const [id, at] of ON_SHORE) { const dx = across(here, at, false); if (dx !== null) drawMark(c, id, W / 2 + dx, shore + 6, 0.42, 1, tod); }
};

/** The far shore's pavilions as seen from `here` round the ring (each one's screen offset from the middle), for painting
 *  into a backdrop's own stamp (Harry's: from the AMERICA pavilion's dig). */
export const shoreFrom = (here: number) => ON_SHORE.flatMap(([id, at]) => { const dx = across(here, at, false); return dx === null || id === 'america' ? [] : [{ id, dx }]; });
/** One landmark painted straight into `g` (no stamp: for inside another one's paint), its foot at (x, foot), `s` its size. */
export const paintMark = (g: Ctx, id: string, x: number, foot: number, k: number, s = 1, tod = timeOfDay()) => {
  const M = markOf(id);
  g.save(); g.translate(Math.round(x - (M.w * s) / 2), Math.round(foot - M.h * s)); g.scale(s, s);
  M.paint(g, farCol(tod, k), tod);
  g.restore();
};

/** The helicopter tour going round over the lagoon (live; not once he's at the helipad: it's on the pad then). */
export const drawTourCopter = (c: Ctx, here: number, hz: number, f: number) => {
  if (here > 57000) return;
  const tod = timeOfDay(), t = farCol(tod, 0.35), a = f * 0.0023 + here * 0.00004;
  const x = Math.round(W / 2 + Math.cos(a) * 470), y = Math.round(hz - 150 + Math.sin(a) * 26), s = Math.sin(a) > 0 ? 1 : -1;
  if (x < -40 || x > W + 40) return;
  // (the body: white over a red band, the bubble's glass, the tail boom, the skids; the rotor a blur flickering)
  box(c, x - 9, y - 4, 18, 9, INK); box(c, x - 8, y - 3, 16, 7, t('#F2F2EE')); box(c, x - 8, y + 1, 16, 2, t('#C81E1E'));
  box(c, x + s * 3 - 2, y - 3, 6, 4, t('#7AB0D8'));
  box(c, s > 0 ? x - 24 : x + 8, y - 1, 16, 2, t('#E8E4DC')); box(c, s > 0 ? x - 25 : x + 22, y - 5, 3, 6, t('#C81E1E'));
  box(c, x - 8, y + 7, 16, 1, INK); box(c, x - 6, y + 5, 1, 2, INK); box(c, x + 5, y + 5, 1, 2, INK);
  box(c, x - 1, y - 7, 2, 3, INK);
  const r = (f >> 1) % 2 ? 22 : 16; box(c, x - r, y - 8, r * 2, 1, t('#3A3A40'));
  box(c, s > 0 ? x - 26 : x + 21, y - 8 + ((f >> 1) % 2) * 3, 5, 1, t('#3A3A40'));
};

/** Gulls over the water (live: a few, wheeling, flapping now and then). */
export const drawGulls = (c: Ctx, f: number, cam: number, y0: number) => {
  const col = farTint('#F4F2EE', 0.2), sh = farTint('#5A5E66', 0.3);
  for (let i = 0; i < 5; i++) {
    const a = f * (0.006 + i * 0.0011) + i * 2.3, r = 40 + i * 18;
    const x = Math.round(((((100 + i * 170 - cam * 0.03 + Math.cos(a) * r) % (W + 60)) + W + 60) % (W + 60)) - 30), y = Math.round(y0 + i * 18 + Math.sin(a) * r * 0.25);
    const up = (f + i * 29) % 70 < 20 ? ((f >> 2) + i) % 2 : 0;
    c.fillStyle = sh; c.fillRect(x - 5, y - (up ? 3 : 0), 2, 1); c.fillRect(x + 4, y - (up ? 3 : 0), 2, 1);
    c.fillStyle = col; c.fillRect(x - 3, y - (up ? 2 : -1), 3, 1); c.fillRect(x, y, 1, 1); c.fillRect(x + 1, y - (up ? 2 : -1), 3, 1);
  }
};
