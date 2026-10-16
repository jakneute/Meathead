// The secret warehouse's far off (screen space; the backdrop), seen once the walls are down, between the frame's columns
// and over the fallen back wall: the boulevard's own far off (blvd/far.ts: the smoggy sky by the hour, the mountains,
// the HAPPYWOOD hill on its foothills, the city in the haze, the studio lot's soundstages and water tower, the palms
// along the next street over), each on its own ground at the depth its slide says it's at (one eye: its ground lands
// where the eye's perspective puts it), and nearest, the production's base camp parked out on the lot behind the
// warehouse (the honeywagons, the grip and electric trucks, the generator, the wardrobe trailer, a crane truck, the
// cast's trailers, the catering tent; light towers over it), on its asphalt, which goes on down to the fallen wall.
// Each layer's painted once for the hour into a tile and slid along; as he climbs, each drops by how near it is.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, skyAt, hourMix, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { type Ctx, INK, box, checker, mix, hash, hazeBands, bandedGradient, signText, plain, STEVE } from '../blvd/kit';
import { FAR, tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms } from '../blvd/far';
import { HWX } from '../geometry';
import { GY } from './layout';
import { REST } from './paint';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The camera's rest (y). */
const CAM_REST = GY - 550;
/** The eye's line on screen (the horizon). */
const EYE = 252;
/** Where a layer's ground lands at depth k (the eye's perspective), at rest. */
const groundAt = (k: number) => EYE + REST * k;

// ---------------------------------------------------------------------------------------------------------------
// Base camp: the production's trucks and trailers parked out on the lot

const BW = 1400, BH = 150, BG = 10;
type T = (c: string) => string;
const trailer = (g: Ctx, T: T, x: number, f: number, w: number, h: number, body: string, label: string | null, star: boolean, i: number) => {
  const R = rampF(T, body);
  // (the hitch, the wheels, the steps up to its door; the AC on its roof)
  box(g, x - 10, f - 10, 12, 3, T('#2A2A30'));
  for (const wx of [x + w * 0.62, x + w * 0.62 + 14]) { box(g, wx - 1, f - 9, 12, 9, INK); box(g, wx, f - 8, 10, 8, T('#26262C')); box(g, wx + 3, f - 6, 4, 4, T('#7A7A84')); }
  box(g, x - 1, f - h - 9, w + 2, h + 1, INK);
  box(g, x, f - h - 8, w, h, R[2]); box(g, x, f - h - 8, w, 2, R[3]); box(g, x, f - h - 8, 2, h, R[3]); box(g, x + w - 3, f - h - 8, 3, h, R[1]);
  for (let k = x + 4; k < x + w - 3; k += 6) box(g, k, f - h - 6, 1, h - 4, R[1]);
  box(g, x, f - 14, w, 6, R[1]); checker(g, x, f - 16, w, 2, R[1], 0, 2);
  box(g, x + w * 0.3, f - h - 13, 16, 5, INK); box(g, x + w * 0.3 + 1, f - h - 12, 14, 4, T('#B8B8C0'));
  // (its door: a star on the cast's; the steps)
  const dx = x + 10 + (i % 3) * 6;
  box(g, dx - 1, f - h + 3, 14, h - 13, INK); box(g, dx, f - h + 4, 12, h - 14, R[1]); box(g, dx + 9, f - h * 0.55, 2, 2, T('#E8C25A'));
  if (star) { g.fillStyle = T('#E8C25A'); g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 1.6 : 4; g.lineTo(dx + 6 + Math.cos(a) * rr, f - h + 12 + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  box(g, dx - 2, f - 8, 16, 2, T('#5A5A62')); box(g, dx, f - 5, 12, 2, T('#4A4A52'));
  // (windows: lit after dark)
  for (let k = 0; k < Math.floor((w - 40) / 22); k++) { const wx = dx + 22 + k * 22; box(g, wx - 1, f - h + 5, 12, 9, INK); box(g, wx, f - h + 6, 10, 7, timeOfDay().lamps > 0.3 && hash(i * 7 + k) > 0.4 ? '#FFD88A' : T('#3A4258')); box(g, wx, f - h + 6, 10, 1, T('#7A8AA0')); }
  if (label) signText(g, label, x + w * 0.62, f - h + 22, plain(1, 1, T('#2A2228')));
};
const truck = (g: Ctx, T: T, x: number, f: number, w: number, box2: string, cab: string, label: string, i: number) => {
  const R = rampF(T, box2), C = rampF(T, cab), h = 46;
  // (the box)
  box(g, x - 1, f - h - 9, w + 2, h + 1, INK);
  box(g, x, f - h - 8, w, h, R[2]); box(g, x, f - h - 8, w, 2, R[3]); box(g, x, f - h - 8, 2, h, R[3]); box(g, x + w - 3, f - h - 8, 3, h, R[1]);
  box(g, x + 4, f - 18, w - 8, 3, R[1]);
  // (the lift gate down, a pile of apple boxes and cable on it, a C-stand cart)
  box(g, x + w - 2, f - 10, 14, 3, T('#6A6A72'));
  signText(g, label, x + w / 2, f - h + 12, plain(1, 1, T('#2A2228')));
  // (the cab)
  box(g, x - 25, f - 37, 26, 29, INK); box(g, x - 24, f - 36, 24, 28, C[2]); box(g, x - 24, f - 36, 24, 2, C[3]); box(g, x - 22, f - 33, 12, 9, T('#5A7088')); box(g, x - 22, f - 33, 12, 2, T('#A8B8C8'));
  box(g, x - 26, f - 14, 4, 4, T('#E8E0B0'));
  for (const wx of [x - 16, x + w * 0.7, x + w * 0.7 + 14]) { box(g, wx - 1, f - 10, 12, 10, INK); box(g, wx, f - 9, 10, 9, T('#26262C')); box(g, wx + 3, f - 7, 4, 4, T('#7A7A84')); }
  void i;
};
const genny = (g: Ctx, T: T, x: number, f: number) => {
  // (the generator on its trailer: a big boxy hum, louvers, its exhaust stack)
  const R = rampF(T, '#6A7A5A');
  box(g, x - 1, f - 39, 62, 31, INK); box(g, x, f - 38, 60, 29, R[2]); box(g, x, f - 38, 60, 2, R[3]);
  for (let k = 0; k < 6; k++) box(g, x + 6 + k * 8, f - 32, 5, 14, R[1]);
  box(g, x + 50, f - 52, 4, 14, T('#2A2A30'));
  signText(g, 'GENNY', x + 30, f - 12, plain(1, 1, T('#E8E4C0')));
  for (const wx of [x + 10, x + 40]) { box(g, wx - 1, f - 9, 10, 9, INK); box(g, wx, f - 8, 8, 8, T('#26262C')); }
};
const lightTower = (g: Ctx, T: T, x: number, f: number) => {
  box(g, x - 1, f - 110, 3, 104, T('#3A3438'));
  box(g, x - 12, f - 8, 26, 8, INK); box(g, x - 11, f - 7, 24, 6, T('#C8A020'));
  box(g, x - 12, f - 122, 25, 12, INK);
  for (let k = 0; k < 4; k++) box(g, x - 11 + k * 6, f - 121, 5, 10, timeOfDay().lamps > 0.3 ? '#FFF2C8' : T('#C8C8B8'));
};
const tent = (g: Ctx, T: T, x: number, f: number, w: number) => {
  // (the catering tent: white, peaked, its tables under it; the line of crew at it)
  for (const px of [x, x + w]) box(g, px - 1, f - 34, 2, 34, T('#5A5A62'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 6, f - 32); g.lineTo(x + w / 2, f - 52); g.lineTo(x + w + 6, f - 32); g.closePath(); g.fill();
  g.fillStyle = T('#F0ECE2'); g.beginPath(); g.moveTo(x - 4, f - 33); g.lineTo(x + w / 2, f - 50); g.lineTo(x + w + 4, f - 33); g.closePath(); g.fill();
  g.fillStyle = T('#C8C2B6'); g.beginPath(); g.moveTo(x + w / 2, f - 50); g.lineTo(x + w + 4, f - 33); g.lineTo(x + w / 2, f - 33); g.closePath(); g.fill();
  for (let k = x - 4; k < x + w + 4; k += 8) box(g, k, f - 33, 4, 4, k % 16 ? T('#B4243A') : T('#F0ECE2'));
  box(g, x + 6, f - 14, w - 12, 3, T('#E8E4DA')); box(g, x + 8, f - 11, 2, 11, T('#5A5A62')); box(g, x + w - 10, f - 11, 2, 11, T('#5A5A62'));
  for (let k = 0; k < Math.floor(w / 10); k++) { const gx = x + 4 + k * 10; box(g, gx, f - 9 - (k % 2), 3, 9, T(['#2A2A30', '#3A3A44', '#5A4A3A'][k % 3])); box(g, gx, f - 13 - (k % 2), 3, 3, T(['#E2B48C', '#8A5A36', '#C8946A'][k % 3])); }
};
const paintBaseCamp = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.06), f = BH - BG;
  // (back to front along it: a crane truck with its arm up, the trailers, the trucks, the generator, the tent)
  const crane = (x: number) => {
    const R = rampF(T, '#C8A020');
    box(g, x - 1, f - 31, 82, 23, INK); box(g, x, f - 30, 80, 21, R[2]); box(g, x, f - 30, 80, 2, R[3]);
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 50, f - 30); g.lineTo(x + 10, f - 128); g.stroke();
    g.strokeStyle = R[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 50, f - 30); g.lineTo(x + 10, f - 128); g.stroke();
    box(g, x + 6, f - 134, 10, 8, INK); box(g, x + 7, f - 133, 8, 6, T('#2A2A30'));
    for (const wx of [x + 8, x + 30, x + 62]) { box(g, wx - 1, f - 10, 12, 10, INK); box(g, wx, f - 9, 10, 9, T('#26262C')); }
  };
  const items: ((x: number, i: number) => number)[] = [
    (x, i) => { trailer(g, T, x, f, 150, 60, '#E8E4DA', 'SUPERBMAN', true, i); return 150; },
    (x, i) => { truck(g, T, x, f, 120, '#E2E2E6', '#B4243A', 'GRIP', i); return 120; },
    (x, i) => { trailer(g, T, x, f, 130, 52, '#D8D4CA', 'HONEYWAGON', false, i); return 130; },
    (x) => { genny(g, T, x, f); return 60; },
    (x, i) => { trailer(g, T, x, f, 140, 56, '#E8E4DA', 'WARDROBE', false, i); return 140; },
    (x) => { crane(x); return 90; },
    (x, i) => { truck(g, T, x, f, 130, '#E2E2E6', '#3A6AB8', 'ELECTRIC', i); return 130; },
    (x) => { tent(g, T, x, f, 110); return 110; },
    (x, i) => { trailer(g, T, x, f, 150, 60, '#ECE6D8', 'THUD', true, i); return 150; },
  ];
  let x = 20;
  items.forEach((it, i) => { const w = it(x, i); if (i % 3 === 2) lightTower(g, T, x + w + 18, f); x += w + 40 + hash(i * 3.7) * 24; });
  // (a poster of Steve's on the honeywagon's end: he's everywhere)
  box(g, 330, f - 46, 14, 18, INK); box(g, 331, f - 45, 12, 16, T(STEVE[3]));
  // (the lot's asphalt under it: banded, cable runs, the parking lines)
  box(g, 0, f, BW, BG, T('#5A5458')); box(g, 0, f, BW, 1, T('#7A7478'));
  for (let k = 0; k < BW; k += 30) box(g, k, f + 4, 12, 1, T('#8A8478'));
  mist(g, BW, 0, f, skyAt(0.9, tod), 0.16, 0.04, 4);
};

// ---------------------------------------------------------------------------------------------------------------

/** How far each layer sits back (its slide across, and how far it drops as he climbs: the nearer, the more). */
const K = { mtn: 0.003, foot: 0.008, city: 0.022, lot: 0.055, palms: 0.11, camp: 0.36 } as const;

export const drawWarehouseFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame;
  const up = CAM_REST - state.camera.y;
  const drop = (k: number) => Math.round(up * k);
  /** The horizon (the eye's line: where the far layers' ground goes off to). */
  const hz = EYE - 8 + Math.round(up * 0.002);
  drawTodSky(c, 0, 0, W, H, FAR.SKY, { bands: 16, horizon: hz + 20, sun: [620, 90], moon: [160, 70], t: f, scroll: cam * 0.02 });
  hazeBands(c, 0, Math.round(hz - 150), W, 160, hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedGradient(c, 0, Math.round(y), W, H - Math.round(y), [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  drawHill(c, 560 - (cam - HWX) * 0.004, groundAt(0.004) + 6 + drop(0.004), f);
  tile(c, `hb-foot-${tod.key}`, cam * K.foot + 140, groundAt(K.foot) - FAR.FH + 26 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(groundAt(K.foot) + 26 + drop(K.foot), 0.34, '#8A8A6A');
  tile(c, `hb-city-${tod.key}`, cam * K.city + 520, groundAt(K.city) - (FAR.CH - FAR.CG) + drop(K.city), FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(groundAt(K.city) + FAR.CG + drop(K.city), 0.42, '#8A8070');
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 80, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 400, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  // (base camp, on the lot right behind the warehouse: its asphalt going on down to the fallen wall)
  tile(c, `hww-camp-${tod.key}`, cam * K.camp + 200, groundAt(K.camp) - (BH - BG) + drop(K.camp), BH, BW, g => paintBaseCamp(g, tod));
  under(groundAt(K.camp) + BG + drop(K.camp), 0.04, '#58525A');
  void INK;
};
