// Thrones of the Stars' far off (screen space; the backdrop): the boulevard's own far off (blvd/far.ts: the smoggy sky
// by the hour, the mountains, the HAPPYWOOD hill on its foothills, the city in the haze, the studio lot, the palms along
// the boulevard), and the coaster's: the rest of the monstrosity across the park (its lattice towers, its lift hills and
// drops, a top hat, a corkscrew, the INSANITY LOOPS getting smaller in a row) in two rows going back, each standing on
// its own stretch of the park; nearest, Happy Land's park itself down under it all (the backs of the boulevard's
// plywood fronts on their bracing, the tram's garages, the queue canopies, the paths with the guests on them).
//
// Up on the structure the horizon stays about level with his eye and everything under it drops away: each layer sinks
// by how high he is times how near it is (the far mountains barely, the park under him a long way), its own ground
// filled down under it so nothing's left hanging. Each layer is painted once for the hour and slid along.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist, snap2, wrapAt } from '../../adventure/farArt';
import { type Ctx, INK, box, checker, mix, hash, hazeBands, bandedGradient, pixelBlob, signText, plain } from '../blvd/kit';
import { FAR, tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms, streetPalm } from '../blvd/far';
import { HWX } from '../geometry';
import { STEVE } from '../blvd/kit';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

// ---------------------------------------------------------------------------------------------------------------
// The monstrosity across the park (painted once for the hour at each size)

type T = (c: string) => string;
/** A run of track: its points (local), drawn inked: the crimson spine, the gold rail lit along its top. */
const run = (g: Ctx, pts: [number, number][], s: number, T: T) => {
  if (pts.length < 2) return;
  const path = () => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = T(INK); g.lineWidth = Math.max(2, 6 * s); g.beginPath(); path(); g.stroke();
  g.strokeStyle = T('#7A121C'); g.lineWidth = Math.max(1.5, 4.4 * s); g.beginPath(); path(); g.stroke();
  g.save(); g.translate(0, -Math.max(1, 1.6 * s));
  g.strokeStyle = T('#C8962E'); g.lineWidth = Math.max(1, 1.8 * s); g.beginPath(); path(); g.stroke();
  g.translate(-0.5, -0.5); g.strokeStyle = T('#FFE89A'); g.lineWidth = Math.max(0.6, 0.7 * s); g.beginPath(); path(); g.stroke();
  g.restore();
  g.lineCap = 'butt';
};
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 40): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
};
/** A far lattice leg (thin: two chords, a zigzag), down to the ground line. */
const farLeg = (g: Ctx, x: number, top: number, foot: number, s: number, T: T) => {
  const w = Math.max(3, 9 * s), cw = Math.max(1, Math.round(1.6 * s));
  box(g, x - w / 2 - 1, top, w + 2, foot - top, T('#1A1C22'));
  box(g, x - w / 2, top, w, foot - top, T('#3A3E48'));
  box(g, x - w / 2, top, cw, foot - top, T('#8890A0')); box(g, x + w / 2 - cw, top, cw, foot - top, T('#4A505C'));
  if (s > 0.45) {
    g.strokeStyle = T('#626A76'); g.lineWidth = 1; g.beginPath();
    for (let y = top + 4; y < foot - 2; y += 14 * s) { g.moveTo(x - w / 2 + cw, y); g.lineTo(x + w / 2 - cw, y + 7 * s); g.lineTo(x - w / 2 + cw, y + 14 * s); }
    g.stroke();
  }
  box(g, x - w / 2 - 2, foot - 2, w + 4, 2, T('#5C5654'));
};

/**
 * The monstrosity: `w` wide (local px at scale 1 the full one), its ground at f. The lift hill (its chain), the first
 * drop, a big loop, a top hat, the INSANITY LOOPS (ten, each smaller, in a row), a corkscrew (its back strands behind
 * in shade), a cobra roll; lattice legs down from everything to the ground; the station's gold crown at its foot.
 */
const paintMonster = (g: Ctx, s: number, T: T, wide: number, f: number, seed: number) => {
  const X = (x: number) => x * s, Y = (y: number) => f - y * s;
  const legsUnder: [number, number][] = [];
  const leg = (x: number, y: number) => legsUnder.push([x, y]);
  // (the parts, local x along it, heights up from the ground)
  const runs: [number, number][][] = [];
  const push = (pts: [number, number][]) => runs.push(pts.map(([x, y]) => [X(x), Y(y)] as [number, number]));
  const o = seed % 2 ? 0 : 60;
  // The lift hill, the crest, the first drop
  push([[o + 30, 40], [o + 278, 500]]);
  push(arc(o + 300, 500, 22, Math.PI, 0, 10));
  push([[o + 322, 500], [o + 470, 40]]);
  for (let k = 0; k <= 8; k++) leg(o + 30 + k * 31, 40 + k * 57);
  for (let k = 1; k <= 4; k++) leg(o + 322 + k * 30, 500 - k * 93);
  // A big loop, a run along to it
  push([[o + 470, 40], [o + 560, 40]]);
  push(arc(o + 610, 160, 120, -Math.PI / 2, Math.PI * 1.5, 48));
  leg(o + 610, 40);
  // The top hat: straight up, over, straight down
  push([[o + 660, 40], [o + 740, 40], [o + 760, 80], [o + 760, 600]]);
  push(arc(o + 800, 600, 40, Math.PI, 0, 14));
  push([[o + 840, 600], [o + 840, 80], [o + 860, 40]]);
  leg(o + 760, 300); leg(o + 840, 300);
  // THE INSANITY LOOPS: ten, each smaller, in a row along a low run
  let x = o + 900;
  push([[o + 860, 40], [o + 1500, 40]]);
  [96, 80, 66, 54, 44, 36, 29, 23, 18, 14].forEach(r => { push(arc(x + r, 40 + r, r, -Math.PI / 2, Math.PI * 1.5, Math.max(16, Math.round(r)))); leg(x + r, 40); x += r * 2 + 10; });
  // The corkscrew going back (its back strands first, in shade), then a cobra roll up and over
  const cx0 = Math.max(x + 20, o + 1360), cx1 = cx0 + 220;
  const back: [number, number][] = [], front: [number, number][] = [];
  for (let k = 0; k <= 60; k++) { const t = k / 60, px = cx0 + (cx1 - cx0) * t, a = t * Math.PI * 6, py = 200 + Math.sin(a) * 42; (Math.cos(a) < 0 ? back : front).push([px, py]); }
  const strands = (pts: [number, number][]) => { const out: [number, number][][] = []; let cur: [number, number][] = []; pts.forEach((p, i) => { if (i && Math.abs(p[0] - pts[i - 1][0]) > 6) { out.push(cur); cur = []; } cur.push(p); }); out.push(cur); return out; };
  const shade = (c: string) => T(mix(c, '#1A1830', 0.35));
  for (const st of strands(back)) run(g, st.map(([px, py]) => [X(px), Y(py)] as [number, number]), s * 0.85, shade);
  leg(cx0 + 40, 160); leg(cx1 - 40, 160);
  push([[cx1, 200], [cx1 + 60, 200], [cx1 + 120, 380]]);
  push(arc(cx1 + 180, 380, 60, Math.PI, 0, 18));
  push([[cx1 + 240, 380], [cx1 + 300, 120], [Math.min(wide / s - 10, cx1 + 380), 40]]);
  leg(cx1 + 120, 300); leg(cx1 + 240, 300);
  // (the legs: behind the track)
  for (const [lx, ly] of legsUnder) farLeg(g, X(lx), Y(ly) + 2 * s, f, s, T);
  // (the station's gold crown at the lift hill's foot)
  box(g, X(o) - 1, Y(40) - 1, X(60) + 2, 40 * s + 2, T(INK)); box(g, X(o), Y(40), X(60), 40 * s, T('#6A0A1E'));
  for (let k = 0; k < 4; k++) { const px = X(o + 4 + k * 14); g.fillStyle = T('#E8C25A'); g.beginPath(); g.moveTo(px, Y(40)); g.lineTo(px + 7 * s, Y(54)); g.lineTo(px + 14 * s, Y(40)); g.closePath(); g.fill(); }
  box(g, X(o), Y(40), X(60), Math.max(1, 3 * s), T('#E8C25A'));
  for (const r of runs) run(g, r, s, T);
  for (const st of strands(front)) run(g, st.map(([px, py]) => [X(px), Y(py)] as [number, number]), s, T);
  // (the lights along it: a bulb every so far on the big loop and the lift, lit after dark)
  if (timeOfDay().lamps > 0.3) for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; box(g, X(o + 610 + Math.cos(a) * 124), Y(160 + Math.sin(a) * 124), 2, 2, k % 2 ? '#FFE8A0' : '#FF8A6A'); }
};
/** Its ground: the park's far pavement, a fence along the near edge, the trees. */
const monsterGround = (g: Ctx, wide: number, f: number, gh: number, T: T) => {
  box(g, 0, f, wide, gh, T('#8A8278')); box(g, 0, f, wide, 1, T('#A89E92')); checker(g, 0, f + 3, wide, 2, T('#7A7268'));
  for (let x = 4; x < wide; x += 7) box(g, x, f + gh - 6, 1, 5, T('#4A4446'));
  box(g, 0, f + gh - 7, wide, 1, T('#5A5456'));
  for (let i = 0; i < wide / 40; i++) { const x = hash(i * 3.1) * wide, r = 4 + hash(i * 1.7) * 5; pixelBlob(g, x, f + 2, r, r * 0.6, T('#3E5230')); pixelBlob(g, x - 1, f, r * 0.6, r * 0.35, T('#5A7240')); }
};

const MW = 2640;
/** A row of the monstrosity, a tile `MW * s` wide, on its ground. */
const paintMonsterRow = (g: Ctx, s: number, tod: TimeOfDay, k: number, h: number, gh: number, seed: number) => {
  const T = farCol(tod, k), f = h - gh, wide = Math.round(MW * s);
  paintMonster(g, s, T, wide, f, seed);
  monsterGround(g, wide, f, gh, T);
  mist(g, wide, f - 80 * s, 80 * s, skyAt(0.9, tod), 0, 0.35, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The park under it all: Hollywood Land's backs

const KW = 1600, KH = 210, KG = 54;
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.08), f = KH - KG;
  // (the plywood fronts from behind: raw sheet, their 2x4 bracing, sandbags; a soundstage, the tram's garages, a tent,
  // the queue canopies (striped), palms between)
  let x = 0;
  for (let i = 0; x < KW; i++) {
    const kind = Math.floor(hash(i * 2.3) * 5), w = 70 + hash(i * 1.1) * 90;
    if (kind <= 1) {
      // a front's back
      const h = 70 + hash(i * 4.4) * 60, R = rampF(T, '#B08A58');
      box(g, x - 1, f - h - 1, w + 2, h + 1, T(INK)); box(g, x, f - h, w, h, R[2]); box(g, x, f - h, 2, h, R[3]); box(g, x + w - 3, f - h, 3, h, R[1]);
      for (let k = x + 16; k < x + w; k += 24) box(g, k, f - h, 1, h, R[1]);
      for (let k = x + 6; k < x + w - 6; k += 30) { g.strokeStyle = T('#80562A'); g.lineWidth = 2; g.beginPath(); g.moveTo(k, f - h + 10); g.lineTo(k + 18, f); g.stroke(); box(g, k + 14, f - 5, 9, 5, T('#9C8C72')); }
      if (hash(i * 9.1) > 0.6) { box(g, x + w * 0.3, f - h - 12, w * 0.4, 12, T('#3A3438')); box(g, x + w * 0.3 + 1, f - h - 11, w * 0.4 - 2, 10, T(STEVE[3])); }
    } else if (kind === 2) {
      // a soundstage's flank (corrugated, its roof)
      const h = 100 + hash(i * 5.5) * 30, R = rampF(T, '#C8BCA8');
      box(g, x - 1, f - h - 1, w + 2, h + 1, T(INK)); box(g, x, f - h, w, h, R[2]);
      for (let k = x + 2; k < x + w; k += 4) box(g, k, f - h, 1, h, R[1]);
      box(g, x, f - h, w, 3, R[4]); box(g, x, f - 8, w, 8, R[1]);
    } else if (kind === 3) {
      // a striped queue canopy on its poles
      const h = 40, R = ['#B4243A', '#F4EEE2'];
      for (let k = x + 6; k < x + w; k += 34) box(g, k, f - h, 2, h, T('#3A3438'));
      for (let k = 0; k < w; k += 10) { g.fillStyle = T(R[((Math.floor(k / 10) % 2) + 2) % 2]); g.beginPath(); g.moveTo(x + k, f - h); g.lineTo(x + k + 5, f - h - 12); g.lineTo(x + k + 10, f - h); g.closePath(); g.fill(); }
      box(g, x, f - h, w, 3, T('#7A1424'));
      for (let k = x + 4; k < x + w - 4; k += 5) box(g, k, f - 6 - (hash(k) > 0.5 ? 1 : 0), 2, 6, T(['#B4243A', '#3A6AB8', '#F4EEE2', '#2A8A4A', '#E8C25A'][Math.floor(hash(k * 1.3) * 5)]));
    } else {
      // the tram's garage: a low shed, roller doors
      const h = 46, R = rampF(T, '#8A8E96');
      box(g, x - 1, f - h - 1, w + 2, h + 1, T(INK)); box(g, x, f - h, w, h, R[2]); box(g, x, f - h, w, 3, R[4]);
      for (let k = x + 6; k + 26 < x + w; k += 32) { box(g, k, f - 32, 26, 32, R[1]); for (let y = f - 30; y < f; y += 4) box(g, k, y, 26, 1, R[0]); }
    }
    x += w + 10 + hash(i * 6.6) * 30;
  }
  for (let i = 0; i < 12; i++) { const px = snap2(hash(i * 5.3 + 2) * KW), h = 90 + hash(i * 1.9) * 50; wrapAt(KW, px, xx => streetPalm(g, xx, f + 2, h, (hash(i) - 0.5) * 10, T, i + 40), 40); }
  // (the paths: pale concrete, the lawns, the guests going about on them (dots of color))
  box(g, 0, f, KW, KG, T('#6E7A4E')); checker(g, 0, f + 2, KW, 2, T('#5A6640'));
  box(g, 0, f + 10, KW, 18, T('#B8B0A2')); box(g, 0, f + 10, KW, 1, T('#D2CABC')); box(g, 0, f + 27, KW, 1, T('#8A8478'));
  for (let k = 0; k < KW; k += 12) box(g, k, f + 11, 1, 16, T('#A49C90'));
  box(g, 0, f + 38, KW, 12, T('#A8A094')); box(g, 0, f + 38, KW, 1, T('#C8C0B4'));
  const cols = ['#B4243A', '#3A6AB8', '#F4EEE2', '#2A8A4A', '#E8C25A', '#8A3AB8', '#F08A3A'];
  for (let i = 0; i < 160; i++) {
    const gx = hash(i * 1.37) * KW, row = hash(i * 2.9) > 0.45 ? f + 14 : f + 40;
    box(g, gx, row, 2, 3, T(cols[i % cols.length])); box(g, gx, row - 2, 2, 2, T(['#E2B48C', '#8A5A36', '#C8946A', '#5A3A24'][i % 4]));
  }
  mist(g, KW, 0, f, skyAt(0.9, tod), 0.14, 0, 4);
};

// ---------------------------------------------------------------------------------------------------------------

/** How far each layer sinks for every px he's climbed (its parallax: the nearer, the more). */
const K = { mtn: 0.003, hill: 0.004, foot: 0.008, city: 0.022, m1: 0.035, lot: 0.055, m2: 0.075, palms: 0.11, park: 0.17 } as const;

export const drawCoasterFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame;
  const up = Math.max(0, -state.camera.y);
  const hz = Math.round(430 + Math.min(up, 2400) * 0.025);
  const drop = (k: number) => Math.round(up * k);
  drawTodSky(c, 0, 0, W, H, FAR.SKY, { bands: 16, horizon: hz, sun: [620, 120], moon: [160, 90], t: f, scroll: cam * 0.02 });
  hazeBands(c, 0, Math.round(hz - 190), W, 190, hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  /** Under a layer's ground, down to the bottom: its ground going on, banded darker nearer. */
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedGradient(c, 0, y, W, H - y, [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  tile(c, `hb-mtn-${tod.key}`, cam * 0.003 + 300, hz - FAR.MH + 30 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  drawHill(c, 560 - (cam - HWX) * 0.004, hz + 18 + drop(K.hill), f);
  tile(c, `hb-foot-${tod.key}`, cam * 0.008 + 140, hz - FAR.FH + 40 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(hz + 40 + drop(K.foot), 0.34, '#8A8A6A');
  hazeBands(c, 0, Math.round(hz - 70), W, 80, hourMix('#C4A07A', '#C8865E', '#2A2840', tod), 0.04, 0.26, 5);
  tile(c, `hb-city-${tod.key}`, cam * 0.022 + 520, hz - FAR.CH + 26 + drop(K.city), FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(hz + 26 + drop(K.city), 0.42, '#8A8070');
  // (the monstrosity, far: across the park, small, hazy)
  const m1h = 360, m1g = 12;
  tile(c, `hwc-mon1-${tod.key}`, cam * K.m1 + 200, hz - m1h + 34 + drop(K.m1), m1h, Math.round(MW * 0.42), g => paintMonsterRow(g, 0.42, tod, 0.3, m1h, m1g, 1));
  under(hz + 34 + drop(K.m1), 0.3, '#8A8278');
  tile(c, `hb-lot-${tod.key}`, cam * 0.055 + 80, hz - FAR.SH + 48 + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(hz + 48 + drop(K.lot), 0.2, '#6A6466');
  // (the monstrosity, nearer: bigger, less haze)
  const m2h = 620, m2g = 16;
  tile(c, `hwc-mon2-${tod.key}`, cam * K.m2 + 900, hz - m2h + 62 + drop(K.m2), m2h, Math.round(MW * 0.72), g => paintMonsterRow(g, 0.72, tod, 0.17, m2h, m2g, 2));
  under(hz + 62 + drop(K.m2), 0.17, '#8A8278');
  tile(c, `hb-palms-${tod.key}`, cam * 0.11 + 400, hz - FAR.PH + 64 + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(hz + 64 + drop(K.palms), 0.12, '#9A9086');
  tile(c, `hwc-park-${tod.key}`, cam * K.park + 300, hz - KH + 96 + drop(K.park), KH, KW, g => paintPark(g, tod));
  under(hz + 96 + drop(K.park), 0.08, '#8E8678');
  void signText; void plain; void skyAt;
};
