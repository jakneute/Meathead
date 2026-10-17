// The flight's world, ZOOMED OUT (the user: "should look like i'm going around the park like the clearing in the
// adventure stage"): Happy Land's FOREIGN LANDS laid out below and round him, and the helicopter flying a circuit of
// it. The clearing's orbit trick (adventure/clearing/orbit.ts): one camera going round a ring, looking in at its
// middle, everything put through it (proj) and drawn back to front; the floor Mode 7 style (each row of it scaled for
// how far off it is, chunky).
//
//   The middle: the LAGOON (banded deeper toward its middle, dithered where the bands meet, ripples glinting, the
//   fireworks barge), its stone coping and the promenade's pavers round it, and round that the ten PAVILIONS he walked
//   (each by its own landmark where it has one), small but recognizable versions of their street art (parkModels.ts,
//   through the landmarks' own renderer), each plaza paved its own way (Mexico's terracotta, China's brick, Japan's
//   raked gravel, Morocco's zellige ...), lawns and flowerbeds between, tiny guests milling on the paths; a hedge
//   ring; then THE CIRCUIT (R_MECH) the giant landmarks stand round, one to a plinth (the Eiffel Tower's right behind
//   France), a gravel ring round each; the service road Harry runs along; the parking lot, its cars in their stalls;
//   the farm fields; the rest of Happy Land on the horizon (Spooky Land's castle, Space Land's needle, the Hollywood
//   Land sign, Jungle Land's giant tree: no volcano), its hills in ranges; the sky by the hour, banded, its clouds.
//
// SELLING THE SCALE: the landmarks are about as tall as the park is wide: a pavilion's no higher than a landmark's knee.
//
// The circuit: the camera's angle round the ring follows h.prog (which landmark's round in front; fractional while
// it turns), so the next one stands ahead round the ring (right, further off), the ones after across the back, and the
// beaten ones' wrecks stay where they fell (left, then round behind). The camera's fitted (FIT) so the landmark round
// in front lands exactly on BASE at the field's own scale: there the engine's world takes over (it's drawn in world
// space while it's up and fighting: mechs.ts has its boxes), with no seam either way.
//
// Fake-3D rules: one eye for the whole scene; straight walls; back to front, piece by piece; culled by where it lands
// on screen. Cheap: the floor's worked out once and kept while the camera and the hour hold still (every fight; its
// ripples tick over every few frames), the sky's bands painted once for the hour and the horizon, the trees and the
// sky's clouds painted once a size into sprites.

import type { GameState } from '../../../m1/game/core/state';
import { timeOfDay, skyRamp, farTint, hourMix, drawStars, drawMoon, sunAt, drawSun, cloudTint } from '../../timeOfDay';
import { pixelBlob, bandedGradient, checker, mix } from '../../intro/art/kit';
import { hour, ramp6 } from '../kit';
import { heliOf, type Heli, type Mech } from './state';
import { Z, BASE_SCREEN, SW, SH, MEMO, toScreen } from './geo';
import { MECHS } from './lines';
import { mechLook } from './mechArt';
import { drawLandmark, viewOf, type FootW } from './landmarks3d';
import { prepare, paint, emptyPrep, scl, type Place } from './mesh3d';
import { parkModel, type ParkModel } from './parkModels';

type Ctx = CanvasRenderingContext2D;
type P3 = { x: number; y: number; z: number };
const INK = '#1A0B06';

// ---------------------------------------------------------------------------------------------------------------
// The camera

/** The circuit the landmarks stand round; the camera's distance out from the park's middle and its height (up). */
export const R_MECH = 600, DC = 1700, HC = 600;
/** How far round past the near point the landmark in front stands (it's on the right: he faces right). */
const DELTA = 0.55;
/** One landmark to the next round the circuit (the nine take one lap). */
export const STEP = (Math.PI * 2) / 9;
/** The Eiffel Tower's angle (France's). */
const A0 = 0;
export const mechAngle = (i: number) => A0 + i * STEP;
/** The camera's angle round the park for a progress (the landmark round in front, fractional). */
export const phiOf = (prog: number) => A0 - DELTA + prog * STEP;

export interface Cam { phi: number; cos: number; sin: number; hc: number; fy: number; fz: number; uy: number; uz: number; F: number; ppx: number; ppy: number }
const basis = (hc: number) => { const l = Math.hypot(hc, DC), fy = -hc / l, fz = -DC / l; return { fy, fz, uy: -fz, uz: fy }; };
/** Fitted at full height: the landmark round in front lands on BASE_SCREEN at the field's scale (Z). */
const FIT = (() => {
  const b = basis(HC), X = R_MECH * Math.sin(DELTA), dy = -HC, dz = R_MECH * Math.cos(DELTA) - DC;
  const zc = dy * b.fy + dz * b.fz, yc = dy * b.uy + dz * b.uz;
  return { F: Z * zc, ppx: BASE_SCREEN.x - Z * X, ppy: BASE_SCREEN.y + Z * yc };
})();

/** The camera now: round to the progress, up as far as the lift's got, pulled back (or punched in) about (pullX, pullY). */
export const camOf = (h: Heli): Cam => {
  const phi = phiOf(h.prog), up = Math.max(0, Math.min(1, h.up)), hc = 90 + (HC - 90) * up * up * (3 - 2 * up), b = basis(hc), k = h.pull;
  return { phi, cos: Math.cos(phi), sin: Math.sin(phi), hc, ...b, F: FIT.F * k, ppx: h.pullX + (FIT.ppx - h.pullX) * k, ppy: h.pullY + (FIT.ppy - h.pullY) * k };
};
/** The camera as the fight's world has it (no pull back): the landmark round in front lands on BASE at the field's
 *  scale, so screen over Z is world (landmarks3d.ts draws the one he's fighting through it, in world space). */
export const camFit = (h: Heli): Cam => ({ ...camOf(h), F: FIT.F, ppx: FIT.ppx, ppy: FIT.ppy });
/** A world point (x, z on the ground, y up) on screen: where, its scale, how far off. */
export const proj = (cam: Cam, x: number, y: number, z: number) => {
  const X = x * cam.cos - z * cam.sin, Zp = x * cam.sin + z * cam.cos;
  const dy = y - cam.hc, dz = Zp - DC;
  const zc = dy * cam.fy + dz * cam.fz, yc = dy * cam.uy + dz * cam.uz, k = cam.F / Math.max(30, zc);
  return { x: cam.ppx + X * k, y: cam.ppy - yc * k, k, z: zc };
};
const camPos = (cam: Cam): P3 => ({ x: DC * cam.sin, y: cam.hc, z: DC * cam.cos });
const horizonOf = (cam: Cam) => cam.ppy - cam.F * (cam.uz / cam.fz);
export const polar = (r: number, a: number) => ({ x: r * Math.sin(a), z: r * Math.cos(a) });
void camPos;

/** The near side of a ring of radius r on screen, at screen x (the camera turns about the ring's middle, so this never
 *  changes with its angle): where the ground there is. Fitted camera, no pull back. Beyond its ends, its ends. */
const nearCurve = (r: number) => {
  const cam: Cam = { phi: 0, cos: 1, sin: 0, hc: HC, ...basis(HC), ...FIT };
  const pts: { x: number; y: number }[] = [];
  for (let a = -1.5; a <= 1.5; a += 0.01) { const p = polar(r, a), q = proj(cam, p.x, 0, p.z); pts.push({ x: q.x, y: q.y }); }
  return (sx: number) => {
    if (sx <= pts[0].x) return pts[0].y;
    for (let i = 1; i < pts.length; i++) if (pts[i].x >= sx) { const a = pts[i - 1], b = pts[i], k = (sx - a.x) / (b.x - a.x || 1); return a.y + (b.y - a.y) * k; }
    return pts[pts.length - 1].y;
  };
};
/** The circuit's ground at screen x (where things the landmarks throw land; where their feet are). */
export const ringY = nearCurve(R_MECH);
/** The service road Harry runs along (screen y at screen x). */
export const ROAD_R = 700;
export const roadY = nearCurve(ROAD_R);

// ---------------------------------------------------------------------------------------------------------------
// The park's plan

/** The pavilions round the lagoon, a tenth of the way round each, placed so each landmark that has a country here
 *  stands by its own (the user: "the eiffel tower by france, big ben by the uk"): France by the Eiffel Tower, Italy by
 *  the Leaning Tower, the UK by Big Ben, Morocco by the Pyramid. */
const PAV_IDS = ['france', 'mexico', 'norway', 'italy', 'china', 'germany', 'uk', 'japan', 'morocco', 'canada'] as const;
type PavId = typeof PAV_IDS[number];
const PAV_R = 400;
const pavAngle = (j: number) => A0 + j * ((Math.PI * 2) / 10);
const LAGOON_R = 220, PROM_R0 = 232, PROM_R1 = 268, HEDGE_R0 = 505, HEDGE_R1 = 530, PAD_R = 118;
const ROAD_HALF = 14, LOT_R0 = 740, LOT_R1 = 1420;
/** Where the helicopter took off (the ride's helipad by the road): the tour starts round here. */
const HELIPAD = polar(ROAD_R + 60, phiOf(-2.6) + 0.15);
/** The fireworks barge out on the lagoon (clear of where the Opera House and the moai come up). */
const BARGE = { r: 132, a: mechAngle(4.6) };
const MECH_AT = MECHS.map((_, i) => polar(R_MECH, mechAngle(i)));

// ---------------------------------------------------------------------------------------------------------------
// The floor: Mode 7, row by row, chunky (a quarter size, blown up); every surface in stepped ramps, dithered (a checker
// of the two) where its steps meet

const FS = 4, FW = SW / FS, FH = SH / FS;
let floorCanvas: HTMLCanvasElement | null = null, floorImg: ImageData | null = null, floorKey = '';
const hash2 = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5; return x - Math.floor(x); };
const rgbOf = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const T = rgbOf;

const WATER = ['#0E3060', '#16427A', '#1E5692', '#2A6CA8', '#3E86BC'].map(T), GLINT = T('#C4E8F8'), GLINT2 = T('#7EBCE0'), FOAM = T('#DCEEF6');
const COPING = ['#7E7666', '#A89E88', '#D2C8B0', '#E8E0CA'].map(T);
const PAVER = ['#A69A82', '#BCB09A', '#D2C6AE', '#E0D6C0'].map(T);
const HEDGE = ['#12301A', '#1C4624', '#285E30', '#3C7A40'].map(T);
const LAWN = ['#3A7232', '#46823A', '#529244', '#68A650'].map(T);
const FLOWERS = ['#E8506A', '#F4C430', '#F8F0F4', '#B05CD0', '#F08A3A'].map(T);
const GRAVEL = ['#9A8C76', '#B4A890', '#CABEA6'].map(T);
const PLINTH = ['#6E685E', '#948E80', '#B4AEA0', '#D0CABC'].map(T);
const SCORCH = ['#141010', '#241C18', '#3A2E24', '#5A4836'].map(T), EMBER = T('#F97316'), EMBER2 = T('#FDE047');
const ROADC = ['#34343C', '#3E3E46', '#4A4A52'].map(T), ROAD_LINE = T('#EAC43C'), ROAD_EDGE = T('#D2D2CA');
const CURB = ['#8E887C', '#BCB6AA', '#D6D0C4'].map(T);
const LOT = ['#46464E', '#505058', '#5A5A62'].map(T), LOT_LINE = T('#D8D8DC');
/** The parked cars (shade, body, lit): red, blue, white, black, gold, green, silver. */
const CAR = [['#5A1414', '#A81E1E', '#DC4A40'], ['#14285A', '#2A4CA0', '#5A80D0'], ['#9A9CA4', '#D8DAE0', '#F8F8FA'], ['#141418', '#2A2A30', '#4A4A54'], ['#7A5A10', '#C89A22', '#ECC85A'], ['#143A20', '#2A6A3A', '#4E9A5A'], ['#5A5E68', '#8E949E', '#C2C8D0']].map(r => r.map(T));
const CAR_GLASS = T('#1C2A38'), CAR_GLINT = T('#7E9AB4');
const FIELD = [['#4E7A34', '#5E8A40', '#6E9A4A'], ['#7E8A3A', '#949E46', '#AAB252'], ['#6A5236', '#7E6442', '#94784E']].map(r => r.map(T));
const CLUMP = ['#163A1E', '#245028', '#3A6E34'].map(T);
const PAD = ['#7E7E86', '#94949C', '#A8A8B0'].map(T), PAD_LINE = T('#F2CC3C');

/** Each plaza's paving (its base, the street art's own): shade, itself, lit, an accent. */
const PLAZA_HEX: Record<PavId, string[]> = {
  mexico: ['#8E4A2E', '#B4643E', '#CE8456', '#E0B060'], norway: ['#6E6A66', '#8C8782', '#A8A29A', '#5E5244'], china: ['#7A2A24', '#9E3E30', '#B85844', '#D8B060'],
  germany: ['#7A6E62', '#968A7C', '#B0A492', '#6A5A48'], italy: ['#B49A74', '#CEB48C', '#E4CEA8', '#A86E4E'], japan: ['#A4A096', '#BCB8AC', '#D2CEC2', '#6E6A62'],
  morocco: ['#B48A5A', '#CEA672', '#E2C290', '#2E7A8A'], france: ['#B4AC98', '#CEC6B0', '#E2DCC8', '#9A927E'], uk: ['#6E2E28', '#8E443A', '#A85C4C', '#8C8A84'],
  canada: ['#3E6A34', '#4E7E40', '#62944E', '#7A6448'],
};
const PLAZA = Object.fromEntries(Object.entries(PLAZA_HEX).map(([k, v]) => [k, v.map(T)])) as Record<PavId, number[][]>;
/** The UK's flagstones (between its brick), a step lit. */
const UK_FLAG = [T('#8C8A84'), T('#A2A098')];

/** Which pavilion's plaza (j) an angle's in, and how far off its middle (0 .. 0.5 of the way to the next). */
const plazaOf = (a: number) => { const sec = ((((a - pavAngle(0)) / ((Math.PI * 2) / 10)) % 10) + 10.5) % 10, j = Math.floor(sec) % 10; return { j, off: Math.abs(sec - Math.floor(sec) - 0.5) }; };
const wrapA = (a: number) => Math.abs(((a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);

/** A plaza's paving at (x, z): its own pattern (by its tiles, never finer than the floor's chunk). `par` the dither's
 *  checker. */
const plazaAt = (id: PavId, x: number, z: number, r: number, a: number, par: number): number[] => {
  const P = PLAZA[id];
  switch (id) {
    case 'mexico': { const tx = Math.floor(x / 24), tz = Math.floor(z / 24), h = hash2(tx, tz); return h > 0.86 ? P[0] : (tx + tz) & 1 ? P[1] : P[2]; }
    case 'china': case 'uk': { const row = Math.floor(z / 14), tx = Math.floor((x + (row & 1) * 16) / 32), h = hash2(tx, row); return id === 'uk' && hash2(Math.floor(x / 60), Math.floor(z / 60)) > 0.7 ? UK_FLAG[h > 0.5 ? 0 : 1] : h > 0.8 ? P[0] : h > 0.35 ? P[1] : P[2]; }
    case 'norway': case 'germany': { const h = hash2(Math.floor(x / 14), Math.floor(z / 14)); return h > 0.9 ? P[3] : h > 0.6 ? P[0] : h > 0.25 ? P[1] : P[2]; }
    case 'italy': { const d = ((x + z) % 56 + 56) % 56, e = ((x - z) % 56 + 56) % 56; if (d < 7 || e < 7) return P[3]; return hash2(Math.floor(x / 40), Math.floor(z / 40)) > 0.5 ? P[1] : P[2]; }
    case 'japan': {
      // (raked gravel in rings round the pagoda's plaza, stepping stones across it)
      if (hash2(Math.floor(x / 30), Math.floor(z / 30)) > 0.9) return P[3];
      const ring = (r % 12 + 12) % 12; return ring < 3 ? P[0] : ring < 4.5 && par ? P[0] : ring > 9 ? P[2] : P[1];
    }
    case 'morocco': { const tx = Math.floor(x / 16), tz = Math.floor(z / 16); if ((tx + tz) % 4 === 0 && hash2(Math.floor(x / 64), Math.floor(z / 64)) > 0.3) return P[3]; return (tx + tz) & 1 ? P[1] : P[2]; }
    case 'france': { const tx = Math.floor(x / 36), tz = Math.floor((z + (tx & 1) * 18) / 36), h = hash2(tx, tz); return h > 0.7 ? P[2] : h > 0.2 ? P[1] : P[0]; }
    case 'canada': { const h = hash2(Math.floor(x / 26), Math.floor(z / 26)); return h > 0.86 ? P[3] : h > 0.5 ? P[1] : h > 0.2 ? P[2] : P[0]; }
  }
  void a;
  return P[1];
};

interface Ruin { ax: number; az: number; dx: number; dz: number; l2: number }
/** The ground at world (x, z): its color. `dead[i]`: the i-th landmark's plinth scorched; `ruin` the scorched paths. */
const groundAt = (x: number, z: number, f6: number, dead: boolean[], ruin: Ruin[], par: number): number[] => {
  const r = Math.hypot(x, z);
  if (r < LAGOON_R) {
    // (the lagoon: deeper toward the middle in steps, dithered where they meet; ripples glinting, drifting; foam along
    // the coping)
    const g = hash2(Math.floor(x / 26), Math.floor(z / 9 + f6 * 0.07));
    if (g > 0.955) return GLINT;
    if (g > 0.925) return GLINT2;
    if (r > LAGOON_R - 6) return par ? FOAM : WATER[4];
    const edges = [80, 135, 180, 205];
    let i = 0; while (i < 4 && r > edges[i]) i++;
    for (let e = 0; e < 4; e++) if (Math.abs(r - edges[e]) < 6) return WATER[par ? e : e + 1];
    return WATER[i];
  }
  if (r < PROM_R0) return r < LAGOON_R + 4 ? COPING[3] : r < LAGOON_R + 8 ? COPING[2] : COPING[1];
  if (r < PROM_R1) {
    // (the promenade's pavers, each its own step, the joints between them a step down)
    const tx = Math.floor(x / 22), tz = Math.floor(z / 22), h = hash2(tx, tz);
    if (r > PROM_R1 - 4) return COPING[0];
    return h > 0.85 ? PAVER[3] : h > 0.45 ? PAVER[2] : h > 0.12 ? PAVER[1] : PAVER[0];
  }
  const a = Math.atan2(x, z);
  let col: number[];
  if (r < HEDGE_R0) {
    // (the pavilions' plazas, each in its own paving, a path up its middle; a lawn strip between them, its flowerbeds)
    const { j, off } = plazaOf(a);
    if (off > 0.43) {
      const fb = hash2(Math.floor(x / 20), Math.floor(z / 20));
      col = off > 0.445 && fb > 0.78 ? FLOWERS[Math.floor(hash2(Math.floor(x / 10), Math.floor(z / 10)) * 5)] : LAWN[(Math.floor(x / 40) + Math.floor(z / 40)) & 1 ? 1 : 2];
    } else if (off < 0.035 && r < 300) col = PAVER[(Math.floor(r / 18) & 1) + 2];
    else col = plazaAt(PAV_IDS[j], x, z, r, a, par);
  } else if (r < HEDGE_R1) {
    // (the hedge: lit along its inner edge, shaded along its outer, clipped in clumps)
    const hh = hash2(Math.floor(x / 14), Math.floor(z / 14));
    col = r < HEDGE_R0 + 4 ? HEDGE[3] : r > HEDGE_R1 - 5 ? HEDGE[0] : hh > 0.6 ? HEDGE[2] : HEDGE[1];
  } else if (r < ROAD_R - ROAD_HALF - 6) {
    // (the circuit's lawn, mowed in stripes (dithered where they change); gravel paths out to each landmark's plinth;
    // each plinth's paving, its rim in steps, scorched where one's been wrecked, the embers in it)
    col = LAWN[0];
    let done = false;
    for (let i = 0; i < MECH_AT.length; i++) {
      const p = MECH_AT[i], d = Math.hypot(x - p.x, z - p.z);
      if (d < PAD_R) {
        if (dead[i]) {
          const e = hash2(Math.floor(x / 12), Math.floor(z / 12) + f6 * 0.3);
          col = d < PAD_R - 26 ? (e > 0.975 ? EMBER2 : e > 0.94 ? EMBER : e > 0.5 ? SCORCH[1] : SCORCH[0]) : d < PAD_R - 18 ? (par ? SCORCH[1] : SCORCH[2]) : par ? SCORCH[3] : PLINTH[1];
        } else col = d > PAD_R - 6 ? PLINTH[0] : d > PAD_R - 11 ? PLINTH[3] : hash2(Math.floor(x / 30), Math.floor(z / 30)) > 0.5 ? PLINTH[2] : PLINTH[1];
        done = true; break;
      }
      // (a gravel ring round the plinth, where the guests stood to look up at it)
      if (d < PAD_R + 9) { col = d > PAD_R + 6 ? GRAVEL[0] : par ? GRAVEL[1] : GRAVEL[2]; done = true; break; }
    }
    if (!done) {
      const hx = x - HELIPAD.x, hz = z - HELIPAD.z, hp = Math.hypot(hx, hz);
      if (hp < 60) col = (hp > 50 && hp < 56) || (Math.abs(hx) < 18 && Math.abs(hz) < 5) || (Math.abs(hz) < 22 && Math.abs(Math.abs(hx) - 15) < 4) ? PAD_LINE : hp > 56 ? PAD[0] : (Math.floor(hx / 20) + Math.floor(hz / 20)) & 1 ? PAD[1] : PAD[2];
      else {
        const s = r / 34, fr = s - Math.floor(s), band = Math.floor(s) & 1;
        col = fr < 0.12 ? LAWN[par ? band + 1 : 2 - band] : LAWN[band + 1];
        if (hash2(Math.floor(x / 30), Math.floor(z / 30)) > 0.93) col = LAWN[3];
      }
    }
  } else if (r < ROAD_R - ROAD_HALF) col = r < ROAD_R - ROAD_HALF - 3 ? CURB[2] : CURB[0];
  else if (r < ROAD_R + ROAD_HALF) {
    // (the service road: asphalt in patches, the dashed yellow line down its middle, the white edge lines)
    if (Math.abs(r - ROAD_R) < 1.6 && (Math.floor((a * ROAD_R) / 22) & 1)) col = ROAD_LINE;
    else if (Math.abs(Math.abs(r - ROAD_R) - (ROAD_HALF - 2.5)) < 1) col = ROAD_EDGE;
    else { const h = hash2(Math.floor(x / 34), Math.floor(z / 34)); col = h > 0.8 ? ROADC[2] : h > 0.3 ? ROADC[1] : ROADC[0]; }
  } else if (r < LOT_R0) col = r < LOT_R0 - 3 ? CURB[1] : CURB[0];
  else if (r < LOT_R1) {
    // (the parking lot: rows of stalls, cars parked in some (the roof lit, the glass front and back, the shaded side);
    // the asphalt patched)
    const row = (r - LOT_R0) % 120, al = (((a * r) % 34) + 34) % 34;
    col = hash2(Math.floor(x / 50), Math.floor(z / 50)) > 0.7 ? LOT[2] : par && hash2(Math.floor(x / 12), Math.floor(z / 12)) > 0.8 ? LOT[0] : LOT[1];
    if (row < 3 || ((row < 46 || row > 74) && al < 1.6)) col = LOT_LINE;
    else if ((row > 8 && row < 40) || (row > 80 && row < 112)) {
      const n = Math.floor((a * r) / 34) * 7 + Math.floor((r - LOT_R0) / 60);
      if (hash2(n, 3) > 0.45 && Math.abs(al - 17) < 10) {
        const C = CAR[Math.floor(hash2(n, 7) * CAR.length)], o = row > 80 ? row - 80 : row - 8, ac = Math.abs(al - 17);
        col = ac > 8 ? C[0] : (o > 7 && o < 10) || (o > 22 && o < 25) ? (ac < 3 ? CAR_GLINT : CAR_GLASS) : o >= 10 && o <= 22 ? C[2] : C[1];
      }
    }
  } else {
    // (the farm fields beyond: crops in rows, a plowed field, a stand of trees here and there)
    const t = hash2(Math.floor(x / 120), Math.floor(z / 120));
    if (t > 0.82) col = CLUMP[t > 0.95 ? 2 : par ? 1 : 0];
    else { const F = FIELD[Math.floor(hash2(Math.floor(x / 260), Math.floor(z / 260)) * 3)], rows = ((x + z * 0.3) % 24 + 24) % 24; col = rows < 8 ? F[0] : rows < 16 ? F[1] : F[2]; }
  }
  // (scorched along the way a landmark tramped in: a burnt band, dithered at its edges, embers in it)
  if (ruin.length && r < LOT_R1 + 100) {
    for (const s of ruin) {
      const k = Math.max(0, Math.min(1, ((x - s.ax) * s.dx + (z - s.az) * s.dz) / s.l2)), ex = x - s.ax - k * s.dx, ez = z - s.az - k * s.dz, d2 = ex * ex + ez * ez;
      if (d2 > 3600) continue;
      const e = hash2(Math.floor(x / 14), Math.floor(z / 14) + f6 * 0.21);
      if (d2 < 1600) return e > 0.97 ? EMBER : e > 0.6 ? SCORCH[2] : e > 0.25 ? SCORCH[1] : SCORCH[0];
      return par ? SCORCH[3] : col;
    }
  }
  return col;
};

/** The haze with distance, in steps (each a step thicker), dithered where they change. */
const FOG_AT = [2300, 2900, 3800, 5200], FOG_K = [0, 0.14, 0.3, 0.5, 0.7];
const fogOf = (dist: number, par: number) => {
  let i = 0; while (i < 4 && dist > FOG_AT[i]) i++;
  for (let e = 0; e < 4; e++) if (Math.abs(dist - FOG_AT[e]) < 140) return FOG_K[par ? e : e + 1];
  return FOG_K[i];
};

const drawFloor = (c: Ctx, cam: Cam, f: number, dead: boolean[], mul: number[], segs: Seg[]) => {
  if (typeof document === 'undefined') return;
  if (!floorCanvas) { floorCanvas = document.createElement('canvas'); floorCanvas.width = FW; floorCanvas.height = FH; floorImg = floorCanvas.getContext('2d')!.createImageData(FW, FH); }
  const tod = timeOfDay(), f6 = Math.floor(f / 6);
  const key = [cam.phi.toFixed(5), cam.hc.toFixed(2), cam.F.toFixed(2), cam.ppx.toFixed(1), cam.ppy.toFixed(1), tod.key, f6, dead.map(d => (d ? 1 : 0)).join(''), segs.map(s => `${Math.round(s.bx)},${Math.round(s.bz)}`).join(';')].join('|');
  if (key !== floorKey) {
    floorKey = key;
    const d = floorImg!.data;
    d.fill(0);
    const haze = rgbOf(tod.haze), hazeDay = [176, 200, 214];
    const H = haze.map((v, i) => hazeDay[i] + (v - hazeDay[i]) * Math.min(1, tod.skyK));
    const ruin: Ruin[] = segs.map(s => { const dx = s.bx - s.ax, dz = s.bz - s.az; return { ax: s.ax, az: s.az, dx, dz, l2: dx * dx + dz * dz || 1 }; });
    for (let ry = 0; ry < FH; ry++) {
      const sy = ry * FS + FS / 2, yr = -(sy - cam.ppy) / cam.F;
      const dy = yr * cam.uy + cam.fy;
      if (dy > -0.0008) continue;
      const dz = yr * cam.uz + cam.fz, t = -cam.hc / dy;
      for (let rx = 0; rx < FW; rx++) {
        const xr = (rx * FS + FS / 2 - cam.ppx) / cam.F;
        const X = t * xr, Zp = DC + t * dz;
        const x = X * cam.cos + Zp * cam.sin, z = -X * cam.sin + Zp * cam.cos;
        const dist = t * Math.hypot(xr, dz, dy), par = (rx + ry) & 1;
        const col = groundAt(x, z, f6, dead, ruin, par);
        const fog = fogOf(dist, par);
        const o = (ry * FW + rx) * 4;
        for (let k = 0; k < 3; k++) { const v = (col[k] * mul[k]) / 255; d[o + k] = v + (H[k] - v) * fog; }
        d[o + 3] = 255;
      }
    }
    floorCanvas!.getContext('2d')!.putImageData(floorImg!, 0, 0);
  }
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(floorCanvas!, 0, 0, SW, SH);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The pavilions, the barge: 3D models through the landmarks' renderer (parkModels.ts)

interface Pav { id: ParkModel; at: number; bx: number; bz: number; R: { x: number; z: number }; F: { x: number; z: number } }
const placeAt = (id: ParkModel, a: number, r: number): Pav => {
  const p = polar(r, a);
  return { id, at: a, bx: p.x, bz: p.z, R: { x: Math.cos(a), z: -Math.sin(a) }, F: { x: Math.sin(a), z: Math.cos(a) } };
};
let built: Pav[] | null = null;
const pavilions = () => (built ??= PAV_IDS.map((id, j) => placeAt(id, pavAngle(j), PAV_R)));
const BARGE_AT = placeAt('barge', BARGE.a, BARGE.r);
const CRUSH = scl(1, 0.32, 1);

/** One of them drawn (its faces back to front, inked; small, its details left out; caved in, a third its height and
 *  blackened). */
const drawModel = (c: Ctx, cam: Cam, pv: Pav, f: number, crushed: boolean, k: number) => {
  const view = viewOf(cam, f), P = emptyPrep();
  view.lod = k < 0.22;
  view.variant = crushed ? 'wreck' : 'n';
  view.wear = crushed ? 0.7 : 0;
  const pl: Place = { bx: pv.bx, by: 0, bz: pv.bz, R: pv.R, F: pv.F, all: crushed ? CRUSH : undefined };
  prepare(c, parkModel(pv.id), pl, view, P);
  paint(c, P, view, INK, view.lod ? 0.8 : 1.2);
};

// ---------------------------------------------------------------------------------------------------------------
// Trees: round ones, pines (Norway, Canada), palms (Morocco); painted once a size and an hour into a sprite, stepped
// (the crown's shade side down the right, lit up the left, dithered between, a highlight), a shadow under it

type TreeKind = 'round' | 'pine' | 'palm';
const TREE_AT: { x: number; z: number; h: number; kind: TreeKind; seed: number }[] = (() => {
  const out: { x: number; z: number; h: number; kind: TreeKind; seed: number }[] = [];
  const kindAt = (a: number): TreeKind => { const id = PAV_IDS[plazaOf(a).j]; return id === 'canada' || id === 'norway' ? 'pine' : id === 'morocco' ? 'palm' : 'round'; };
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + 0.05, p = polar(PROM_R1 + 12, a); out.push({ ...p, h: 34 + (i % 3) * 6, kind: kindAt(a), seed: i }); }
  for (let j = 0; j < 10; j++) for (const s of [-1, 1]) { const a = pavAngle(j) + s * 0.31, p = polar(PAV_R + 40, a); out.push({ ...p, h: 46, kind: kindAt(a), seed: 40 + j * 2 + (s > 0 ? 1 : 0) }); }
  for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2; if (MECHS.some((_, k) => wrapA(a - mechAngle(k)) < 0.2)) continue; out.push({ ...polar(HEDGE_R1 + 8, a), h: 40, kind: 'round', seed: 80 + i }); }
  return out;
})();
const treeSprites = new Map<string, { cv: HTMLCanvasElement; ox: number; oy: number }>();
const treeSprite = (kind: TreeKind, R: number, v: number) => {
  const tod = timeOfDay(), key = `${kind}|${R}|${v}|${tod.key}`;
  let s = treeSprites.get(key);
  if (s || typeof document === 'undefined') return s ?? null;
  if (treeSprites.size > 600) treeSprites.clear();
  const w = Math.ceil(R * 3.4) + 6, hh = Math.ceil(R * 4.2) + 8, cv = document.createElement('canvas');
  cv.width = w; cv.height = hh;
  const g = cv.getContext('2d')!, ox = Math.round(w / 2), oy = hh - Math.ceil(R * 0.5) - 2;
  const disc = (x: number, y: number, rr: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, rr), 0, Math.PI * 2); g.fill(); };
  const dith = (x: number, y: number, rr: number, col: string) => { g.save(); g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.clip(); checker(g, x - rr, y - rr, rr * 2, rr * 2, col, 0, 1); g.restore(); };
  // (its shadow, off to the lower right)
  g.fillStyle = 'rgba(16, 24, 16, 0.38)'; g.beginPath(); g.ellipse(ox + R * 0.45, oy, R * 1.15, R * 0.42, 0, 0, Math.PI * 2); g.fill();
  const trunk = ramp6(hour(kind === 'palm' ? '#8A6A44' : '#6A4A2E'));
  if (kind === 'round') {
    const L = ramp6(hour(v ? '#3E8040' : '#2E7238')), top = oy - R * 2.1;
    g.fillStyle = INK; g.fillRect(ox - 2, top, 4, oy - top); g.fillStyle = trunk[2]; g.fillRect(ox - 1, top, 2, oy - top); g.fillStyle = trunk[4]; g.fillRect(ox - 1, top, 1, oy - top);
    disc(ox, top, R + 1, INK);
    disc(ox + R * 0.12, top + R * 0.12, R, L[0]);
    dith(ox - R * 0.04, top - R * 0.02, R * 0.94, L[1]);
    disc(ox - R * 0.08, top - R * 0.06, R * 0.82, L[1]);
    dith(ox - R * 0.2, top - R * 0.2, R * 0.66, L[2]);
    disc(ox - R * 0.24, top - R * 0.24, R * 0.54, L[2]);
    disc(ox - R * 0.36, top - R * 0.36, R * 0.28, L[3]);
    // (clumps of leaves: lit flecks up the left, dark ones down the right)
    for (let i = 0; i < Math.max(2, R * 0.8); i++) { const a = i * 2.4 + v, d = R * (0.3 + ((i * 37) % 7) / 10); g.fillStyle = Math.cos(a) < 0 ? L[4] : L[0]; g.fillRect(Math.round(ox + Math.cos(a) * d * 0.8), Math.round(top + Math.sin(a) * d * 0.8), R > 6 ? 2 : 1, 1); }
  } else if (kind === 'pine') {
    const L = ramp6(hour('#1F4A2E')), top = oy - R * 3.6;
    g.fillStyle = INK; g.fillRect(ox - 2, oy - R * 0.9, 4, R * 0.9); g.fillStyle = trunk[2]; g.fillRect(ox - 1, oy - R * 0.9, 2, R * 0.9);
    for (let t = 0; t < 3; t++) {
      const y1 = oy - R * 0.6 - t * R * 0.95, y0 = y1 - R * 1.5, hw = R * (1.05 - t * 0.25);
      const tri = (col: string, dx: number, wk: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(ox + dx, y0); g.lineTo(ox + dx + hw * wk, y1); g.lineTo(ox + dx - hw * wk, y1); g.closePath(); g.fill(); };
      tri(INK, 0, 1.12); tri(L[1], 0, 1);
      g.fillStyle = L[3]; g.beginPath(); g.moveTo(ox, y0); g.lineTo(ox, y1); g.lineTo(ox - hw, y1); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.moveTo(ox, y0); g.lineTo(ox + hw * 0.5, y1); g.lineTo(ox, y1); g.closePath(); g.clip(); checker(g, ox - 1, y0, hw, y1 - y0, L[1], 0, 1); g.restore();
      g.fillStyle = L[0]; g.fillRect(ox - hw, y1 - 1, hw * 2, 1);
      g.fillStyle = L[4]; g.fillRect(ox - hw * 0.5, y1 - 2, Math.max(1, hw * 0.3), 1);
    }
    void top;
  } else {
    // (a palm: the trunk leaning, its rings; the fronds drooping out from the top, lit and shaded)
    const L = ramp6(hour('#3E8A3A')), top = oy - R * 3;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ox, oy); g.quadraticCurveTo(ox + R * 0.5, oy - R * 1.5, ox + R * 0.2, top); g.stroke();
    g.strokeStyle = trunk[2]; g.lineWidth = 2; g.stroke();
    for (let k = 0; k < 5; k++) { g.fillStyle = trunk[0]; g.fillRect(Math.round(ox + R * 0.32 - k * 0.04 * R), Math.round(oy - (k + 1) * R * 0.5), 2, 1); }
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3, ex = ox + R * 0.2 + Math.cos(a) * R * 1.3, ey = top + Math.sin(a) * R * 0.5 + R * 0.5;
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(ox + R * 0.2, top); g.quadraticCurveTo((ox + R * 0.2 + ex) / 2, top - R * 0.5, ex, ey); g.stroke();
      g.strokeStyle = Math.cos(a) < 0 ? L[3] : L[1]; g.lineWidth = 1.5; g.stroke();
    }
  }
  s = { cv, ox, oy };
  treeSprites.set(key, s);
  return s;
};
const drawTree = (c: Ctx, cam: Cam, t: { x: number; z: number; h: number; kind: TreeKind; seed: number }) => {
  const b = proj(cam, t.x, 0, t.z), R = Math.max(2, Math.round(13 * b.k * (t.h / 40)));
  const s = treeSprite(t.kind, R, t.seed % 2);
  if (s) c.drawImage(s.cv, Math.round(b.x - s.ox), Math.round(b.y - s.oy));
};

// ---------------------------------------------------------------------------------------------------------------
// The guests: tiny, milling on the promenade and in the plazas; they scatter from a landmark coming up

interface Item { z: number; y0: number; draw: () => void }

const SKINS = ['#5C3A24', '#8A5A3C', '#C98E66', '#E2AC84', '#F2C9A6'];
const HAIRS = ['#1C1917', '#3F2A1C', '#78350F', '#D6A85A', '#9CA3AF'];
const GUESTS = Array.from({ length: 90 }, (_, i) => {
  const h = (n: number) => hash2(i * 3.1 + n, n * 7.7);
  const onProm = i % 3 !== 0;
  return {
    a: h(1) * Math.PI * 2, r: onProm ? PROM_R0 + 6 + h(2) * (PROM_R1 - PROM_R0 - 12) : PROM_R1 + 20 + h(2) * 150, sp: (h(3) - 0.5) * 0.0016,
    col: ['#DC2626', '#2563EB', '#F59E0B', '#16A34A', '#F8FAFC', '#9333EA', '#EC4899', '#0EA5E9'][Math.floor(h(4) * 8)],
    legs: ['#1E3A8A', '#334155', '#D6C29A', '#1C1917'][Math.floor(h(5) * 4)], skin: SKINS[Math.floor(h(6) * 5)], hair: HAIRS[Math.floor(h(8) * 5)],
  };
});
/** When each landmark came up (frames), for the scatter. */
const panics = new WeakMap<Heli, Map<number, number>>();
export const panicAt = (h: Heli, i: number, frame: number) => { let m = panics.get(h); if (!m) panics.set(h, (m = new Map())); if (!m.has(i)) m.set(i, frame); };

const guestItems = (c: Ctx, cam: Cam, h: Heli, f: number, out: Item[]) => {
  const pm = panics.get(h);
  for (const g of GUESTS) {
    let p = polar(g.r, g.a + f * g.sp), run = false;
    if (pm) for (const [i, at] of pm) {
      const m = mechAt(h.mechs[i], i), dx = p.x - m.x, dz = p.z - m.z, d = Math.hypot(dx, dz) || 1;
      if (d < 420) { const k = Math.min(1, (f - at) / 150), push = (420 - d) * 0.8 * k; p = { x: p.x + (dx / d) * push, z: p.z + (dz / d) * push }; if (f - at < 240) run = true; }
    }
    const q = proj(cam, p.x, 0, p.z);
    if (q.x < -10 || q.x > SW + 10 || q.z < 60) continue;
    const s = Math.max(1, Math.round(q.k * 3)), bob = run && (f >> 2) % 2 ? 1 : 0, x = Math.round(q.x) - s, y = Math.round(q.y);
    out.push({
      z: q.z, y0: 0, draw: () => {
        // (a shadow, the legs (striding when they run), the shirt and its shade side, the head and hair; arms up running)
        c.fillStyle = 'rgba(20,16,12,0.35)'; c.fillRect(x, y, s * 3, Math.max(1, s >> 1));
        c.fillStyle = g.legs; c.fillRect(x, y - s - bob, s * 2, s); if (run && (f >> 2) % 2) c.fillRect(x + s * 2, y - s, s, s);
        c.fillStyle = g.col; c.fillRect(x, y - s * 3 - bob, s * 2, s * 2);
        if (s > 1) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + s * 2 - (s >> 1), y - s * 3 - bob, s >> 1, s * 2); }
        c.fillStyle = g.skin; c.fillRect(x, y - s * 4 - bob, s * 2, s);
        c.fillStyle = g.hair; c.fillRect(x, y - s * 4 - bob, s * 2, Math.max(1, s >> 1));
        if (run) { c.fillStyle = g.skin; c.fillRect(x - s, y - s * 5 - bob, s, s); c.fillRect(x + s * 2, y - s * 5 - bob, s, s); }
      },
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky, the far lands, the clouds

const SKY = ['#2A7FC9', '#3A8FD3', '#4C9FDB', '#62AFE0', '#7CBFE4', '#98CEE6', '#B4DCE6'];
let skyCanvas: HTMLCanvasElement | null = null, skyKey = '';

/** Banded down to the horizon (dithered where the bands meet: painted once for the hour and where the horizon is), the
 *  last band on under it; the stars, the moon or the sun; the high clouds drifting round with the camera. */
const drawSky = (c: Ctx, cam: Cam, f: number, hy: number) => {
  const tod = timeOfDay(), top = Math.max(0, Math.min(SH, Math.round(hy)));
  if (typeof document !== 'undefined') {
    if (!skyCanvas) { skyCanvas = document.createElement('canvas'); skyCanvas.width = SW; skyCanvas.height = SH; }
    const key = tod.key + '|' + top;
    if (key !== skyKey) {
      skyKey = key;
      const g = skyCanvas.getContext('2d')!, ramp = skyRamp(SKY, tod);
      g.clearRect(0, 0, SW, SH);
      if (top > 4) bandedGradient(g, 0, 0, SW, top, ramp, 14);
      g.fillStyle = ramp[ramp.length - 1]; g.fillRect(0, top, SW, SH - top);
      // (the haze along the horizon: two thin bands, the haze's own color)
      if (top > 30) { g.fillStyle = mix(ramp[ramp.length - 1], tod.haze, 0.35); g.fillRect(0, top - 14, SW, 14); checker(g, 0, top - 18, SW, 4, mix(ramp[ramp.length - 1], tod.haze, 0.35), 0, 2); }
    }
    c.drawImage(skyCanvas, 0, 0);
  }
  drawStars(c, 0, 0, SW, top, f, cam.phi * 1200, tod);
  const sk = ((((-cam.phi * 700 + 560) % 1600) + 1600) % 1600) - 400;
  drawMoon(c, sk, Math.max(24, top - 260), 16, tod);
  { const s = sunAt(sk + 300, top - 200, top, tod); drawSun(c, s.x, s.y, 20, tod); }
  drawSkyClouds(c, cam, f, top);
};

/** The high clouds (in the sky, beyond everything): fat cumulus, their undersides shaded, their tops lit, dithered at
 *  their edges; each painted once for the hour, drifting slowly and turning with the camera. */
const SKY_CLOUDS = [{ u: 120, y: 150, s: 1.1 }, { u: 520, y: 90, s: 0.8 }, { u: 860, y: 190, s: 1.3 }, { u: 1220, y: 120, s: 0.9 }, { u: 1500, y: 210, s: 0.7 }, { u: 300, y: 250, s: 0.6 }];
const skyCloudSprites = new Map<string, HTMLCanvasElement>();
const skyCloud = (n: number, s: number) => {
  const tod = timeOfDay(), key = n + '|' + tod.key;
  let cv = skyCloudSprites.get(key);
  if (cv || typeof document === 'undefined') return cv ?? null;
  cv = document.createElement('canvas'); cv.width = Math.ceil(260 * s); cv.height = Math.ceil(100 * s);
  const g = cv.getContext('2d')!, cx = cv.width / 2, cy = cv.height * 0.62;
  const shade = cloudTint('#A4B2C8', tod), body = cloudTint('#DCE4EE', tod), lit = cloudTint('#FFFFFF', tod), rim = cloudTint('#FFF4E0', tod);
  const lumps: [number, number, number, number][] = [[-80, 8, 44, 18], [-40, -6, 46, 26], [10, -16, 56, 34], [62, -2, 44, 24], [96, 10, 30, 14], [-10, 12, 90, 16]];
  for (const [dx, dy, rw, rh] of lumps) pixelBlob(g, cx + dx * s, cy + dy * s + 6 * s, rw * s, rh * s, shade);
  for (const [dx, dy, rw, rh] of lumps) pixelBlob(g, cx + dx * s - 3 * s, cy + dy * s, rw * s * 0.92, rh * s * 0.86, body);
  for (const [dx, dy, rw, rh] of lumps.slice(0, 5)) pixelBlob(g, cx + dx * s - 8 * s, cy + dy * s - rh * s * 0.35, rw * s * 0.55, rh * s * 0.45, lit);
  pixelBlob(g, cx - 2 * s, cy - 30 * s, 22 * s, 8 * s, rim);
  void n;
  skyCloudSprites.set(key, cv);
  return cv;
};
const drawSkyClouds = (c: Ctx, cam: Cam, f: number, top: number) => {
  if (top < 60) return;
  SKY_CLOUDS.forEach((cl, n) => {
    const x = ((((cl.u - cam.phi * 520 - f * 0.05) % 1800) + 1800) % 1800) - 300, y = top - cl.y * (top / 420);
    if (y < -40 || y > top - 20) return;
    const cv = skyCloud(n, cl.s);
    if (cv) c.drawImage(cv, Math.round(x - cv.width / 2), Math.round(y - cv.height * 0.62));
  });
};

/** The rest of Happy Land on the horizon (silhouettes, hazy, in two steps): its hills in two ranges (the far one paler),
 *  a tree line along their feet; Spooky Land's castle, Space Land's needle, the Hollywood Land sign, Jungle Land's giant
 *  tree (no volcano). */
const FAR = [{ a: 0.9, kind: 'castle' }, { a: 2.4, kind: 'needle' }, { a: 3.7, kind: 'sign' }, { a: 5.1, kind: 'tree' }] as const;
const drawFar = (c: Ctx, cam: Cam, f: number) => {
  const tod = timeOfDay();
  const backC = farTint('#8AA6B0', 1.6, tod), backLit = farTint('#A6C0C6', 1.6, tod);
  const hill = farTint('#6E8E86', 1, tod), hillLit = farTint('#8FAEA2', 1, tod), hillDk = farTint('#5A786E', 1, tod), trees = farTint('#3E5E4E', 0.8, tod);
  const sil = farTint('#5A6878', 1, tod), silLit = farTint('#7C8A9C', 1, tod), silDk = farTint('#46525E', 1, tod);
  const RF = 6200;
  // (the hills, all round: two ranges, each a bumpy band lit along its crest, dithered under it)
  const tops: { x: number; y: number; y2: number }[] = [], bases: { x: number; y: number }[] = [];
  for (let k = 0; k < 360; k++) {
    const a = (k / 360) * Math.PI * 2, p = polar(RF, a), q = proj(cam, p.x, 0, p.z);
    if (q.z < 200) continue;
    const ht = 160 + 90 * Math.sin(5 * a + 1) + 60 * Math.sin(13 * a) + 30 * Math.sin(29 * a + 2);
    const ht2 = 300 + 140 * Math.sin(3 * a + 2) + 70 * Math.sin(11 * a + 1) + 40 * Math.sin(23 * a);
    tops.push({ x: q.x, y: proj(cam, p.x, ht, p.z).y, y2: proj(cam, p.x, ht2, p.z).y }); bases.push({ x: q.x, y: q.y + 4 });
  }
  const order = tops.map((_, i) => i).sort((i, j) => tops[i].x - tops[j].x);
  const band = (yOf: (i: number) => number, dy: number, col: string) => {
    c.fillStyle = col; c.beginPath();
    order.forEach((i, n) => (n ? c.lineTo(tops[i].x, yOf(i) + dy) : c.moveTo(tops[i].x, yOf(i) + dy)));
    for (let n = order.length - 1; n >= 0; n--) c.lineTo(bases[order[n]].x, bases[order[n]].y);
    c.closePath(); c.fill();
  };
  if (order.length > 2) {
    band(i => tops[i].y2, 0, backLit); band(i => tops[i].y2, 4, backC);
    band(i => tops[i].y, 0, hillLit); band(i => tops[i].y, 4, hill); band(i => tops[i].y, 14, hillDk);
    // (the tree line along the near range's feet)
    c.fillStyle = trees;
    for (let n = 0; n < order.length; n += 2) { const i = order[n], b = bases[i]; c.fillRect(Math.round(b.x) - 2, Math.round(b.y) - 9 - ((i * 7) % 4), 5, 9); }
  }
  // (the other lands' landmarks)
  const night = tod.lamps > 0.3;
  for (const L of FAR) {
    const p = polar(RF * 0.9, L.a), q = proj(cam, p.x, 0, p.z);
    if (q.z < 200 || q.x < -200 || q.x > SW + 200) continue;
    const k = q.k, R = (x: number, y: number, w: number, hh: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(q.x + x * k), Math.round(q.y - (y + hh) * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(hh * k))); };
    const tri = (x0: number, x1: number, y: number, h: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(q.x + x0 * k, q.y - y * k); c.lineTo(q.x + ((x0 + x1) / 2) * k, q.y - (y + h) * k); c.lineTo(q.x + x1 * k, q.y - y * k); c.closePath(); c.fill(); };
    if (L.kind === 'castle') {
      // (Spooky Land's castle: the curtain wall and its crenels, the towers and their cones, lit windows after dark)
      R(-260, 0, 520, 260, sil); R(-260, 240, 520, 20, silLit);
      for (let x = -256; x < 256; x += 40) R(x, 260, 22, 24, sil);
      for (const [x, ht] of [[-280, 520], [-120, 640], [60, 760], [220, 560]]) {
        R(x, 0, 80, ht, sil); R(x, 0, 24, ht, silLit); R(x + 60, 0, 20, ht, silDk); tri(x - 10, x + 90, ht, 200, silDk); tri(x - 10, x + 40, ht, 200, sil);
        if (night) for (let y = 120; y < ht - 60; y += 130) R(x + 32, y, 16, 34, (f >> 5) % 7 === (x & 3) ? '#FDE68A' : '#F59E0B');
      }
    } else if (L.kind === 'needle') {
      // (Space Land's needle: the shaft lit up its left, the saucer in bands, the antenna's light blinking)
      R(-30, 0, 60, 1100, sil); R(-30, 0, 20, 1100, silLit); R(14, 0, 16, 1100, silDk);
      c.fillStyle = silDk; c.beginPath(); c.ellipse(q.x, q.y - 1110 * k, 190 * k, 54 * k, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = silLit; c.beginPath(); c.ellipse(q.x, q.y - 1124 * k, 190 * k, 44 * k, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = sil; c.beginPath(); c.ellipse(q.x, q.y - 1150 * k, 120 * k, 28 * k, 0, 0, Math.PI * 2); c.fill();
      if (night) for (let i = -3; i <= 3; i++) R(i * 44 - 6, 1110, 12, 12, '#FDE68A');
      R(-6, 1160, 12, 260, sil);
      if ((f >> 4) % 2) R(-10, 1420, 20, 20, '#EF4444');
    } else if (L.kind === 'sign') {
      // (the Hollywood Land sign on its hill: the letters' white boards on their struts)
      c.fillStyle = sil; c.beginPath(); c.moveTo(q.x - 900 * k, q.y); c.quadraticCurveTo(q.x, q.y - 760 * k, q.x + 900 * k, q.y); c.fill();
      c.fillStyle = silLit; c.beginPath(); c.moveTo(q.x - 900 * k, q.y); c.quadraticCurveTo(q.x - 200 * k, q.y - 700 * k, q.x - 40 * k, q.y - 380 * k); c.quadraticCurveTo(q.x - 300 * k, q.y - 360 * k, q.x - 900 * k, q.y); c.fill();
      for (let i = 0; i < 9; i++) { const y = 380 + Math.sin(i * 0.7) * 30; R(-470 + i * 105 + 30, y - 40, 8, 40, silDk); R(-470 + i * 105, y, 80, 120, farTint('#E5E7EB', 0.8, tod)); R(-470 + i * 105 + 60, y, 20, 120, farTint('#B8BCC4', 0.8, tod)); }
    } else {
      // (Jungle Land's giant tree: the trunk and its buttress roots, the canopy in stepped lumps, the treehouse's lit
      // windows after dark)
      c.fillStyle = silDk; c.beginPath(); c.moveTo(q.x - 260 * k, q.y); c.quadraticCurveTo(q.x - 80 * k, q.y - 120 * k, q.x - 70 * k, q.y - 620 * k); c.lineTo(q.x + 70 * k, q.y - 620 * k); c.quadraticCurveTo(q.x + 80 * k, q.y - 120 * k, q.x + 260 * k, q.y); c.closePath(); c.fill();
      R(-60, 0, 40, 600, sil);
      for (const [dx, dy, rw, rh, col] of [[0, 760, 560, 220, silDk], [-280, 640, 300, 160, silDk], [300, 660, 320, 170, silDk], [-60, 820, 420, 170, sil], [-300, 700, 200, 110, sil], [250, 720, 220, 120, sil], [-140, 880, 220, 100, silLit]] as const) {
        c.fillStyle = col; c.beginPath(); c.ellipse(q.x + dx * k, q.y - dy * k, rw * k, rh * k, 0, 0, Math.PI * 2); c.fill();
      }
      R(-120, 520, 160, 90, silDk); tri(-140, 60, 610, 60, silDk);
      if (night) { R(-90, 540, 30, 30, '#FDE68A'); R(-30, 540, 30, 30, '#F59E0B'); }
    }
  }
};

/** Clouds drifting over the park, below him (they go round with it): stepped, shaded under, lit along their tops. */
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ a: i * 0.9 + 0.3, r: 700 + ((i * 397) % 900), y: 470 + (i % 3) * 40, w: 1 + (i % 3) * 0.3 }));
const drawClouds = (c: Ctx, cam: Cam, f: number) => {
  const tod = timeOfDay(), cc = [cloudTint('#A8B6CC', tod), cloudTint('#D2DCEA', tod), cloudTint('#EEF2F8', tod), cloudTint('#FFFFFF', tod)];
  for (const cl of CLOUDS) {
    const p = polar(cl.r, cl.a + f * 0.00012), q = proj(cam, p.x, cl.y, p.z);
    if (q.z < 120 || q.x < -260 || q.x > SW + 260) continue;
    const s = q.k * 2.2 * cl.w;
    c.globalAlpha = 0.78;
    for (const [dx, dy, rw, rh, k] of [[0, 9, 42, 10, 0], [-22, 3, 22, 12, 1], [12, -1, 26, 15, 1], [30, 6, 18, 9, 1], [-18, -2, 16, 8, 2], [8, -7, 18, 10, 2], [4, -10, 10, 5, 3]] as const) pixelBlob(c, q.x + dx * s, q.y + dy * s, rw * s, rh * s, cc[k]);
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The landmarks out on the circuit (all but the one round in front while it's up: that one's the world's)

/** Whether the landmark's drawn by the world (the one he's fighting, up and about) rather than out here. While it's
 *  arriving it's out here, at its own place in the park, coming up and walking to its plinth as the camera comes round
 *  to it (it has no boxes till then). */
export const inWorld = (h: Heli, m: Mech | undefined) => !!m && m.i === h.cur && (m.st === 'fight' || m.st === 'dying') && (h.phase === 'fly' || h.phase === 'end');

/**
 * Where each one comes up (the user: "sell the idea they aren't popping from the same spot but closer to you"): its
 * own place round the park, each a different way: r out from the middle, da round from its plinth, and how far short
 * of it the camera is when it starts (the camera comes round to it as it arrives, so it's plainly somewhere else in the
 * park each time). It walks from there to its plinth while it settles.
 * Then it STOMPS in to its plinth (the user: "like they stomp through the parking lot getting rendered, causing an
 * increased catastrophe in the surrounding area"), through whatever's on the way, growing as it nears:
 *   the Eiffel Tower: out of the parking lot on the far side, across the lagoon and the pavilions, to France;
 *   the Opera House: up out of the lagoon, wading out over the promenade;
 *   Christ the Redeemer: from the far lot, across the park;
 *   the Leaning Tower: tearing up from behind Italy;
 *   the Taj Mahal: off to the side in the lot, swinging round to its plinth as the camera turns;
 *   Big Ben: from the far lot, through the middle;
 *   the Colosseum: up close on the left, out of the near lot;
 *   the Pyramid: from the far lot;
 *   the Easter Island head: out of the middle of the lagoon.
 */
export const RISE: { r: number; da: number; d: number }[] = [
  { r: 1050, da: Math.PI + 0.25, d: 0.5 }, { r: 120, da: 0.15, d: 0.5 }, { r: 1100, da: Math.PI - 0.4, d: 0.45 },
  { r: 320, da: -0.2, d: 0.4 }, { r: 980, da: 0.9, d: 0.6 }, { r: 1150, da: Math.PI + 0.3, d: 0.45 },
  { r: 820, da: -0.45, d: 0.35 }, { r: 1050, da: Math.PI - 0.2, d: 0.5 }, { r: 90, da: 0, d: 0.5 },
];
const riseAt = (i: number) => polar(RISE[i].r, mechAngle(i) + RISE[i].da);
/**
 * Its walk in, perspective-true (the user: "perspective correct as it moves forward"): it STEPS, its feet planted on
 * the park's ground. The way from where it came up to its plinth is cut into strides; each step one foot lifts and
 * comes down a stride on (the other planted), and the body's always halfway between its feet (so it surges a step at a
 * time, never sliding). Each foot's projected through the one eye where it is on the ground, so it's smaller and higher
 * further off, bigger and lower nearer; where it plants is where the dust goes up and the footprint's left.
 */
const STRIDE = 230, LIFT = 26, FOOT_X = 28;
interface Gait { a: { x: number; z: number }; ux: number; uz: number; D: number; d: [number, number]; lift: [number, number]; j: number; fr: number; n: number; s: number }
const gaitOf = (m: Mech, i: number): Gait => {
  const a = riseAt(i), b = MECH_AT[i], D = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const n = Math.max(2, Math.round(D / STRIDE)), s = D / n, N = n + 1;
  const u = Math.max(0, Math.min(1, m.walk)) * N, j = Math.min(N - 1, Math.floor(u)), fr = m.walk >= 1 ? 1 : u - j;
  const tgt = (jj: number) => (jj < 0 ? 0 : Math.min(D, (jj + 1) * s));
  const mv = j % 2, e = fr * fr * (3 - 2 * fr), from = tgt(j - 2), to = tgt(j);
  const d: [number, number] = [0, 0], lift: [number, number] = [0, 0];
  d[mv] = from + (to - from) * e; lift[mv] = to > from ? Math.sin(fr * Math.PI) * LIFT : 0;
  d[1 - mv] = tgt(j - 1);
  return { a, ux: (b.x - a.x) / D, uz: (b.z - a.z) / D, D, d, lift, j, fr, n: N, s };
};
const gaitPt = (g: Gait, d: number) => ({ x: g.a.x + g.ux * d, z: g.a.z + g.uz * d });
const walking = (m: Mech | undefined): m is Mech => !!m && m.st === 'intro' && m.unfold >= 0 && m.walk < 1;
/** Where it is now (ground): its plinth, or on its way there from where it came up (halfway between its feet). */
export const mechAt = (m: Mech | undefined, i: number) => {
  if (!walking(m)) return MECH_AT[i];
  const g = gaitOf(m, i);
  return gaitPt(g, (g.d[0] + g.d[1]) / 2);
};
/** Which step it's on (mechs.ts: a foot coming down is a stomp), and where that foot's planted (ground). */
export const mechStep = (m: Mech) => {
  const i = m.i;
  if (!walking(m)) return { j: -1, at: MECH_AT[i] };
  const g = gaitOf(m, m.i);
  return { j: g.j, at: gaitPt(g, g.d[1 - (g.j % 2)]) };
};
/** Every footprint it's left (ground distance along its way, which foot): the steps it's finished. */
const plantsOf = (m: Mech, i: number) => {
  if (m.st === 'wait' || (m.st === 'intro' && (m.unfold < 0 || m.walk <= 0))) return null;
  const g = gaitOf(m, i), done = m.walk >= 1 || m.st !== 'intro' ? g.n : g.j, out: { d: number; s: number }[] = [];
  for (let jj = 0; jj < done; jj++) out.push({ d: Math.min(g.D, (jj + 1) * g.s), s: jj % 2 ? 1 : -1 });
  return { g, out };
};

const mechItems = (c: Ctx, cam: Cam, h: Heli, f: number, out: Item[]) => {
  MECHS.forEach((id, i) => {
    const m = h.mechs[i];
    if (inWorld(h, m)) return;
    const p = mechAt(m, i), q = proj(cam, p.x, 0, p.z);
    if (q.z < 80 || q.x < -260 * q.k - 60 || q.x > SW + 260 * q.k + 60) return;
    const look = mechLook(h, m, i, f);
    let feet: FootW[] | undefined;
    if (walking(m)) {
      // (its feet where they are on the ground (the 3D legs reach down to them))
      const g = gaitOf(m, i);
      feet = [0, 1].map(k => { const fp = gaitPt(g, g.d[k]); return { x: fp.x, z: fp.z, lift: g.lift[k], side: k ? 1 : -1 } as FootW; });
      // (the dust where the last foot came down, at its depth)
      const pf = 1 - (g.j % 2), fp = gaitPt(g, g.d[pf]), dq = proj(cam, fp.x, 0, fp.z), age = g.fr;
      if (g.j > 0 && age < 0.9) out.push({ z: dq.z - 2, y0: 2, draw: () => stompDust(c, dq.x + (pf ? FOOT_X : -FOOT_X) * dq.k, dq.y, dq.k, age, RISE[i].r < LAGOON_R && Math.hypot(fp.x, fp.z) < LAGOON_R) });
    }
    out.push({ z: q.z, y0: 0, draw: () => drawLandmark(c, cam, id, i, p, look, feet) });
  });
};
/** A foot coming down: a ring of dust (spray, in the lagoon) puffing out low along the ground, settling; chunks of the
 *  ground thrown up (on land). In steps: shaded under, lit on top. */
const stompDust = (c: Ctx, x: number, y: number, k: number, age: number, wet: boolean) => {
  const a = 1 - age, R = (30 + age * 70) * k;
  const cols = wet ? ['#7EB4D8', '#BAE6FD', '#F0F9FF'] : ['#5A4A36', '#8A7860', '#B8A688'];
  c.globalAlpha = 0.75 * a;
  for (let n = 0; n < 10; n++) {
    const t = (n / 10) * Math.PI * 2, px = x + Math.cos(t) * R, py = y + Math.sin(t) * R * 0.32 - age * 14 * k, w = (14 + (n % 3) * 5) * k * (0.7 + age), hh = (8 + (n % 2) * 4) * k * (0.7 + age);
    pixelBlob(c, px + 2 * k, py + 2 * k, w, hh, cols[0]);
    pixelBlob(c, px, py, w * 0.8, hh * 0.8, cols[1]);
    pixelBlob(c, px - w * 0.25, py - hh * 0.3, w * 0.4, hh * 0.35, cols[2]);
  }
  c.globalAlpha = 1;
  if (!wet && age < 0.6) for (let n = 0; n < 6; n++) {
    const t = n * 1.05 + 0.4, d = R * (0.4 + age * 0.9), cx = x + Math.cos(t) * d, cy = y - Math.sin(age * Math.PI) * 40 * k - (n % 3) * 6 * k;
    c.fillStyle = INK; c.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, Math.max(2, Math.round(5 * k)), Math.max(2, Math.round(4 * k)));
    c.fillStyle = n % 2 ? '#7A6448' : '#4A6A34'; c.fillRect(Math.round(cx), Math.round(cy), Math.max(1, Math.round(4 * k)), Math.max(1, Math.round(3 * k)));
  }
};

/** The ground where the one round in front is coming up: the cracks spreading out (through France's plaza, for the
 *  first), the hole it went down. Under it. */
const drawRevealGround = (c: Ctx, cam: Cam, h: Heli) => {
  const m = h.mechs[h.cur];
  if (!m || m.st !== 'intro' || (h.phase !== 'fly' && h.phase !== 'end')) return;
  // (first at its plinth, under the replica; then where it comes up, somewhere else in the park)
  const up = m.unfold >= 0 || m.t > m.introLen * 0.22, k = up ? Math.min(1, (m.t - m.introLen * 0.22) / Math.max(1, m.introLen * 0.08)) : Math.min(1, m.t / Math.max(1, m.introLen * 0.14));
  const at = up ? riseAt(m.i) : MECH_AT[m.i], wet = up && RISE[m.i].r < LAGOON_R;
  // (the cracks: dark, each with a lit lip along one side (the broken edge), branching)
  const cracks: { x: number; y: number }[][] = [];
  for (let j = 0; j < 9; j++) {
    const a0 = j * 0.7 + 0.2, len = (130 + (j % 3) * 90) * k;
    let x = at.x, z = at.z;
    const pts: { x: number; y: number }[] = [];
    for (let s = 0; s <= 5; s++) {
      const a = a0 + Math.sin(j * 3 + s * 1.7) * 0.35;
      if (s) { x += Math.sin(a) * (len / 5); z += Math.cos(a) * (len / 5); }
      const q = proj(cam, x, 0, z); pts.push({ x: q.x, y: q.y });
    }
    cracks.push(pts);
  }
  const stroke = (col: string, w: number, dx: number, dy: number) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (const pts of cracks) pts.forEach((p, i) => (i ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy))); c.stroke(); };
  stroke(wet ? '#F0F9FF' : '#C8B898', 1, 0, 1.5);
  stroke(wet ? '#BAE6FD' : '#1C1917', wet ? 2 : 2.5, 0, 0);
  // (the hole it went down, while it's under or coming up: broken ground heaped round it in lumps (lit tops), the pit
  // in steps going down dark; in the lagoon: foam and a churning dark swirl)
  if (up || m.sink > 0.02) {
    const q = proj(cam, at.x, 0, at.z), w = 110 * q.k, hh = w * 0.36;
    if (wet) {
      c.fillStyle = '#BAE6FD'; c.beginPath(); c.ellipse(q.x, q.y, w * 1.18, hh * 1.25, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F0F9FF'; c.beginPath(); c.ellipse(q.x - w * 0.05, q.y - hh * 0.06, w * 1.08, hh * 1.1, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1E3A5F'; c.beginPath(); c.ellipse(q.x, q.y, w, hh, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0E2440'; c.beginPath(); c.ellipse(q.x, q.y + hh * 0.15, w * 0.7, hh * 0.6, 0, 0, Math.PI * 2); c.fill();
    } else {
      for (let n = 0; n < 12; n++) {
        const t = (n / 12) * Math.PI * 2, px = q.x + Math.cos(t) * w * 1.08, py = q.y + Math.sin(t) * hh * 1.12, rw = w * (0.16 + (n % 3) * 0.04), rh = hh * 0.34;
        c.fillStyle = INK; c.beginPath(); c.ellipse(px, py, rw + 1, rh + 1, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5A4632'; c.beginPath(); c.ellipse(px, py, rw, rh, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#8A7050'; c.beginPath(); c.ellipse(px - rw * 0.2, py - rh * 0.3, rw * 0.6, rh * 0.5, 0, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#3A2A1C'; c.beginPath(); c.ellipse(q.x, q.y, w, hh, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1E140C'; c.beginPath(); c.ellipse(q.x, q.y + hh * 0.12, w * 0.84, hh * 0.74, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0A0604'; c.beginPath(); c.ellipse(q.x, q.y + hh * 0.22, w * 0.62, hh * 0.5, 0, 0, Math.PI * 2); c.fill();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ruin (looks only: the fight's untouched). Each landmark's walk in, from where it came up to its plinth (as far
// as it's got), is a path of wreckage: the ground scorched along it (the floor), footprint craters, the cars in the lot
// crushed and flipped, any pavilion it went through caved in, fires and smoke columns along it; and round each plinth,
// fires lit as its fight goes on (all of them once it's down). Worked out from where the landmarks have got to, so it
// stacks up landmark by landmark (by the Easter Island head the park's a burning ruin) and comes back as it was starting
// again at a checkpoint.

interface Seg { ax: number; az: number; bx: number; bz: number; i: number }
const pathsOf = (h: Heli): Seg[] => {
  const out: Seg[] = [];
  h.mechs.forEach((m, i) => {
    if (m.st === 'wait' || (m.st === 'intro' && m.walk <= 0)) return;
    const a = riseAt(i), b = mechAt(m, i);
    out.push({ ax: a.x, az: a.z, bx: b.x, bz: b.z, i });
  });
  return out;
};
const segD = (x: number, z: number, s: Seg) => {
  const dx = s.bx - s.ax, dz = s.bz - s.az, l = dx * dx + dz * dz || 1, k = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / l));
  return Math.hypot(x - s.ax - k * dx, z - s.az - k * dz);
};
/** Points along a path every step (from its start), alternating either side by side. */
const along = (s: Seg, step: number, side: number, from = 0) => {
  const dx = s.bx - s.ax, dz = s.bz - s.az, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L, out: { x: number; z: number; n: number }[] = [];
  for (let d = from, n = 0; d <= L; d += step, n++) { const o = (n % 2 ? 1 : -1) * side; out.push({ x: s.ax + (dx / L) * d + nx * o, z: s.az + (dz / L) * d + nz * o, n }); }
  return out;
};
const pavWrecked = (segs: Seg[], at: number) => { const p = polar(PAV_R, at); return segs.some(s => segD(p.x, p.z, s) < 125); };

/** Where the fires are (ground): along each path, in each wrecked pavilion, round each plinth as its fight goes. */
const firesOf = (h: Heli, segs: Seg[]) => {
  const out: { x: number; z: number; s: number }[] = [];
  for (const s of segs) for (const p of along(s, 230, 30, 120)) out.push({ x: p.x, z: p.z, s: 0.8 + hash2(s.i, p.n) * 0.6 });
  pavilions().forEach((pv) => { if (pavWrecked(segs, pv.at)) { const p = polar(PAV_R + 20, pv.at); out.push({ x: p.x, z: p.z, s: 1.4 }); } });
  h.mechs.forEach((m, i) => {
    const n = m.st === 'dead' ? 4 : m.st === 'fight' || m.st === 'dying' ? Math.floor((1 - m.hp / m.max) * 4.99) : 0;
    for (let k = 0; k < n; k++) { const a = mechAngle(i) + (k - 1.5) * 0.16, p = polar(R_MECH + (k % 2 ? 90 : -90), a); out.push({ x: p.x, z: p.z, s: 1 + (k % 2) * 0.4 }); }
  });
  return out;
};

/** Its footprints: three-toed craters stamped where each foot came down (the mech's own feet): the rim heaped up and lit,
 *  the pit dark in steps, the three toes dug in ahead of it the way it was walking. */
const drawScars = (c: Ctx, cam: Cam, h: Heli, mul: number[]) => {
  const tn = (rgb: number[]) => 'rgb(' + rgb.map((v, i) => Math.round((v * mul[i]) / 255)).join(',') + ')';
  const RIM = tn([150, 132, 106]), RIM_LIT = tn([196, 178, 146]), PIT = tn([60, 48, 38]), DEEP = tn([28, 22, 18]);
  h.mechs.forEach((m, i) => {
    const pl = plantsOf(m, i);
    if (!pl) return;
    for (const p of pl.out) {
      const g = gaitPt(pl.g, p.d), q = proj(cam, g.x, 0, g.z);
      if (q.z < 60 || q.x < -40 || q.x > SW + 40) continue;
      const ahead = proj(cam, g.x + pl.g.ux * 30, 0, g.z + pl.g.uz * 30), fx = (ahead.x - q.x) / 30, fz = (ahead.y - q.y) / 30;
      const x = q.x + p.s * FOOT_X * q.k, w = 24 * q.k, hh = w * 0.38;
      c.fillStyle = RIM; c.beginPath(); c.ellipse(x, q.y, w * 1.3, hh * 1.35, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = RIM_LIT; c.beginPath(); c.ellipse(x - w * 0.12, q.y - hh * 0.2, w * 1.1, hh * 1.05, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = PIT; c.beginPath(); c.ellipse(x, q.y, w, hh, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = DEEP; c.beginPath(); c.ellipse(x + w * 0.1, q.y + hh * 0.15, w * 0.66, hh * 0.6, 0, 0, Math.PI * 2); c.fill();
      // (the toes, ahead of it, splayed)
      for (const sp of [-16, 0, 16]) {
        const tx = x + fx * 30 + sp * q.k * (1 - Math.abs(fx) * 0.5), ty = q.y + fz * 30 + sp * q.k * fx * 0.3;
        c.fillStyle = PIT; c.beginPath(); c.ellipse(tx, ty, 6 * q.k, 3 * q.k, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = DEEP; c.fillRect(Math.round(tx - 2 * q.k), Math.round(ty), Math.max(1, Math.round(4 * q.k)), Math.max(1, Math.round(1.5 * q.k)));
      }
    }
  });
};
// The Colosseum's lions that came down on the park (mechs.ts): a flattened lion pancake in its blood where each hit,
// there for the rest of the run (the stage's memo: it outlives his deaths, like the rest of the ruin).

const LION_MAX = 24;
let lionCache = { raw: '', list: [] as [number, number, number][] };
const lionsOf = (state: GameState) => {
  const raw = state.stageMemo[MEMO.lions] ?? '';
  if (raw !== lionCache.raw) { let list: [number, number, number][] = []; try { list = raw ? JSON.parse(raw) : []; } catch { list = []; } lionCache = { raw, list }; }
  return lionCache.list;
};
/** A lion splatted on the park at world x (on the circuit's ground, the near side): its stain's ground point kept. */
export const lionStain = (state: GameState, wx: number) => {
  const cam0: Cam = { phi: 0, cos: 1, sin: 0, hc: HC, ...basis(HC), ...FIT }, sx = toScreen(wx, 0).x;
  let best = 0, bd = Infinity;
  for (let a = -1.5; a <= 1.5; a += 0.01) { const p = polar(R_MECH, a), q = proj(cam0, p.x, 0, p.z), d = Math.abs(q.x - sx); if (d < bd) { bd = d; best = a; } }
  // (the camera's turned φ round: the same spot on screen is that much further round the ring)
  const g = polar(R_MECH, best + camOf(heliOf(state)).phi);
  const list = [...lionsOf(state), [Math.round(g.x), Math.round(g.z), Math.floor(Math.random() * 1000)] as [number, number, number]].slice(-LION_MAX);
  state.stageMemo[MEMO.lions] = JSON.stringify(list);
};
const drawLionStains = (c: Ctx, cam: Cam, state: GameState) => {
  for (const [x, z, seed] of lionsOf(state)) {
    const q = proj(cam, x, 0, z);
    if (q.z < 60 || q.x < -60 || q.x > SW + 60) continue;
    const k = q.k, fl = seed % 2 ? 1 : -1;
    // (the blood out round it in lobes, splashes thrown off; a wet glint)
    c.fillStyle = '#3A0606'; c.beginPath(); c.ellipse(q.x + 2 * k, q.y + 1 * k, 42 * k, 12 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5A0A0A'; c.beginPath(); c.ellipse(q.x, q.y, 40 * k, 11 * k, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 6; i++) { const a = seed + i * 1.05, d = (34 + (i % 3) * 10) * k; c.beginPath(); c.ellipse(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * 0.28, (6 + (i % 2) * 4) * k, 3 * k, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#8B1010'; c.beginPath(); c.ellipse(q.x, q.y, 30 * k, 8 * k, 0, 0, Math.PI * 2); c.fill();
    // (him, flat: the body, the mane round his squashed head, the tail out the back, a leg each way)
    c.fillStyle = '#7A3A0A'; c.beginPath(); c.ellipse(q.x + fl * 5 * k, q.y + 1 * k, 20 * k, 5 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#B45309'; c.beginPath(); c.ellipse(q.x + fl * 4 * k, q.y, 19 * k, 4.5 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D97706'; c.beginPath(); c.ellipse(q.x + fl * 1 * k, q.y - 1.5 * k, 12 * k, 2 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#78350F'; c.beginPath(); c.ellipse(q.x - fl * 16 * k, q.y, 11 * k, 6 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(q.x - fl * 16 * k, q.y, 6 * k, 3.5 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(q.x + fl * 20 * k, q.y - 1 * k, fl * 14 * k, Math.max(1, 2 * k));
    for (const s of [-1, 1]) c.fillRect(q.x + s * 6 * k, q.y + 3 * k, 3 * k, Math.max(1, 4 * k));
    c.fillStyle = '#DC2626'; c.fillRect(q.x - 8 * k, q.y - 2 * k, 10 * k, Math.max(1, 1.5 * k));
    c.fillStyle = '#F87171'; c.fillRect(q.x - 22 * k, q.y - 4 * k, Math.max(1, 3 * k), Math.max(1, 1 * k));
  }
};

/** A car it flipped, wheels up: the roof crushed in under it, the chassis on top (its exhaust, its axles), the wheels
 *  and their hubs, the doors a step lit, a shattered window. */
const flippedCar = (c: Ctx, q: { x: number; y: number; k: number }, n: number) => {
  const w = 34 * q.k, hh = 14 * q.k, C = [['#5A1414', '#8E1C1C', '#C23A34'], ['#14285A', '#22408A', '#4A6CC0'], ['#7E8088', '#B4B6BE', '#E2E4EA'], ['#121216', '#24242A', '#40404A'], ['#5E4410', '#9A7418', '#D0A440']][n % 5];
  c.save(); c.translate(q.x, q.y); c.rotate((hash2(n, 9) - 0.5) * 0.8);
  c.fillStyle = 'rgba(20,16,12,0.4)'; c.beginPath(); c.ellipse(4 * q.k, 1 * q.k, w * 0.62, hh * 0.32, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.fillRect(-w / 2 - 1, -hh - 1, w + 2, hh + 2);
  // (the crushed roof, the glass, the body; the chassis on top, its exhaust)
  c.fillStyle = C[0]; c.fillRect(-w * 0.32, -hh * 0.35, w * 0.64, hh * 0.35);
  c.fillStyle = '#1C2A38'; c.fillRect(-w * 0.28, -hh * 0.32, w * 0.2, hh * 0.25); c.fillStyle = '#6E8AA0'; c.fillRect(-w * 0.26, -hh * 0.3, Math.max(1, w * 0.06), Math.max(1, hh * 0.08));
  c.fillStyle = C[1]; c.fillRect(-w / 2, -hh, w, hh * 0.65);
  c.fillStyle = C[2]; c.fillRect(-w / 2, -hh * 0.5, w, Math.max(1, hh * 0.15));
  c.fillStyle = '#2A2A30'; c.fillRect(-w / 2, -hh, w, Math.max(1, hh * 0.3));
  c.fillStyle = '#52525B'; c.fillRect(-w * 0.4, -hh * 0.98, w * 0.8, Math.max(1, hh * 0.08));
  c.fillStyle = '#18181B'; for (const x of [-0.32, 0.32]) { c.beginPath(); c.arc(x * w, -hh - 2 * q.k, Math.max(1.5, 5 * q.k), 0, Math.PI * 2); c.fill(); c.fillStyle = '#9CA3AF'; c.fillRect(x * w - 1, -hh - 3 * q.k, Math.max(1, 2 * q.k), Math.max(1, 2 * q.k)); c.fillStyle = '#18181B'; }
  c.restore();
};
/** A fire on the ground: banded flames (its tongues licking up and off it, flickering), embers going up, and its column
 *  of smoke rolling up off it in stepped puffs (shaded under, lit up the left), spreading and thinning as it goes. */
const drawFire = (c: Ctx, cam: Cam, x: number, z: number, sz: number, f: number, n: number, mul: number[]) => {
  const q = proj(cam, x, 0, z), k = q.k * sz, fl = Math.sin(f * 0.4 + n) * 0.15 + 1;
  const tn = (rgb: number[]) => 'rgb(' + rgb.map((v, i) => Math.round((v * mul[i]) / 255)).join(',') + ')';
  const SM = [tn([46, 42, 44]), tn([72, 68, 68]), tn([104, 100, 98]), tn([140, 134, 128])];
  for (let p = 0; p < 6; p++) {
    const ph = ((f * 0.5 + p * 37 + n * 13) % 220) / 220, s = proj(cam, x + Math.sin(ph * 4 + n) * 30 + ph * 40, 40 + ph * 320, z), rr = (10 + ph * 34) * s.k * sz;
    c.globalAlpha = 0.62 * (1 - ph);
    c.fillStyle = SM[0]; c.beginPath(); c.arc(s.x + rr * 0.2, s.y + rr * 0.2, rr, 0, Math.PI * 2); c.fill();
    c.fillStyle = SM[p % 2 ? 1 : 2]; c.beginPath(); c.arc(s.x - rr * 0.08, s.y - rr * 0.08, rr * 0.82, 0, Math.PI * 2); c.fill();
    c.fillStyle = SM[3]; c.beginPath(); c.arc(s.x - rr * 0.35, s.y - rr * 0.35, rr * 0.36, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  // (the glow on the ground round it)
  c.fillStyle = 'rgba(249, 115, 22, 0.22)'; c.beginPath(); c.ellipse(q.x, q.y, 40 * k, 12 * k, 0, 0, Math.PI * 2); c.fill();
  const band = (w: number, h: number, col: string, dx = 0, ph = 0) => {
    const ff = fl + Math.sin(f * 0.7 + n + ph) * 0.12;
    c.fillStyle = col; c.beginPath(); c.moveTo(q.x + (dx - w) * k, q.y); c.quadraticCurveTo(q.x + (dx - w * 0.4) * k, q.y - h * 0.6 * k * ff, q.x + (dx + Math.sin(f * 0.3 + n + ph) * 4) * k, q.y - h * k * ff); c.quadraticCurveTo(q.x + (dx + w * 0.4) * k, q.y - h * 0.6 * k * ff, q.x + (dx + w) * k, q.y); c.closePath(); c.fill();
  };
  band(28, 62, '#7F1D1D'); band(12, 44, '#B91C1C', -20, 1); band(12, 50, '#B91C1C', 18, 2);
  band(22, 50, '#DC2626'); band(18, 40, '#F97316'); band(8, 30, '#F97316', -14, 3); band(12, 28, '#FDE047'); band(5, 14, '#FFFBEB');
  for (let e = 0; e < 3; e++) { const ph = ((f * 1.2 + e * 40 + n * 17) % 90) / 90; c.fillStyle = ph < 0.5 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(q.x + (Math.sin(ph * 6 + e + n) * 18 - 8 + e * 8) * k), Math.round(q.y - (50 + ph * 90) * k), Math.max(1, Math.round(3 * k)), Math.max(1, Math.round(3 * k))); }
};

/** The fires' glow (world space, for the lighting at dusk and after): the nearest eighteen. */
export const fireLamps = (state: GameState) => {
  const h = heliOf(state);
  if (h.phase !== 'fly' && h.phase !== 'end') return [];
  const cam = camOf(h), out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (const fz of firesOf(h, pathsOf(h))) {
    const q = proj(cam, fz.x, 20, fz.z);
    if (q.z < 60 || q.x < -60 || q.x > SW + 60) continue;
    out.push({ x: state.camera.x + SW / 2 + (q.x - SW / 2) / Z, y: state.camera.y + SH / 2 + (q.y - SH / 2) / Z, r: (160 * fz.s * q.k) / Z, a: 0.8, color: '#F97316' });
    if (out.length >= 18) break;
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------

/** The lot (screen space, under the world): sky, far lands, the floor, the park's buildings, trees, guests and the
 *  landmarks out on the circuit, back to front; the clouds over it. `alpha`: faded in over the streets (the lift). */
export const drawPark = (c: Ctx, state: GameState, alpha = 1) => {
  const h = heliOf(state), f = state.frame, cam = camOf(h), tod = timeOfDay(), mul = rgbOf(tod.mul);
  if (alpha <= 0) return;
  if (alpha < 1) c.globalAlpha = alpha;
  void hourMix;
  drawSky(c, cam, f, horizonOf(cam));
  drawFar(c, cam, f);
  const segs = pathsOf(h);
  drawFloor(c, cam, f, h.mechs.map(m => m.st === 'dead'), mul, segs);
  drawRevealGround(c, cam, h);
  drawScars(c, cam, h, mul);
  drawLionStains(c, cam, state);
  const items: Item[] = [];
  pavilions().forEach(pv => {
    const q = proj(cam, pv.bx, 0, pv.bz);
    if (q.z < 60 || q.x < -200 || q.x > SW + 200) return;
    const crushed = pavWrecked(segs, pv.at);
    items.push({ z: q.z, y0: 0, draw: () => drawModel(c, cam, pv, f, crushed, q.k) });
  });
  { const q = proj(cam, BARGE_AT.bx, 0, BARGE_AT.bz); if (q.z > 60 && q.x > -100 && q.x < SW + 100) items.push({ z: q.z, y0: 0, draw: () => drawModel(c, cam, BARGE_AT, f, false, q.k) }); }
  // (the cars it flipped crossing the lot; the fires)
  for (const sg of segs) for (const p of along(sg, 80, 40, 30)) {
    const r = Math.hypot(p.x, p.z);
    if (r < LOT_R0 || r > LOT_R1) continue;
    const q = proj(cam, p.x, 0, p.z);
    if (q.z > 60 && q.x > -40 && q.x < SW + 40) items.push({ z: q.z, y0: 0, draw: () => flippedCar(c, q, sg.i * 31 + p.n) });
  }
  firesOf(h, segs).forEach((fz, n) => { const q = proj(cam, fz.x, 0, fz.z); if (q.z > 60 && q.x > -60 && q.x < SW + 60) items.push({ z: q.z - 1, y0: 1, draw: () => drawFire(c, cam, fz.x, fz.z, fz.s, f, n, mul) }); });
  for (const t of TREE_AT) { const q = proj(cam, t.x, 0, t.z); if (q.z > 60 && q.x > -40 && q.x < SW + 40) items.push({ z: q.z, y0: 0, draw: () => drawTree(c, cam, t) }); }
  guestItems(c, cam, h, f, items);
  mechItems(c, cam, h, f, items);
  items.sort((a, b) => b.z - a.z || a.y0 - b.y0).forEach(it => it.draw());
  drawClouds(c, cam, f);
  c.globalAlpha = 1;
};
