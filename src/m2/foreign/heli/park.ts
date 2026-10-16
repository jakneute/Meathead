// The flight's world, ZOOMED OUT (the user: "should look like i'm going around the park like the clearing in the
// adventure stage"): Happy Land's FOREIGN LANDS laid out below and round him, and the helicopter flying a circuit of
// it. The clearing's orbit trick (adventure/clearing/orbit.ts): one camera going round a ring, looking in at its
// middle, everything put through it (proj) and drawn back to front; the floor Mode 7 style (each row of it scaled for
// how far off it is, chunky).
//
//   The middle: the LAGOON (its ripples), its promenade round it, and round that the ten PAVILIONS he walked (each by
//   its own landmark where it has one), small, crude, recognizable (Mexico's stepped pyramid, Norway's stave church, China's
//   pagoda and wall, Germany's steep roofs and tower, Italy's campanile, Japan's pagoda and torii, Morocco's minaret,
//   France's mansards and glass pyramid, the UK's clock tower, Canada's chateau and totem), tiny guests milling on the
//   paths; a hedge ring; then THE CIRCUIT (R_MECH) the giant landmarks stand round, one to a plinth (the Eiffel
//   Tower's right behind France); the service road Harry runs along; the parking lot; the fields; the rest of Happy
//   Land on the horizon (the castle, the needle, the sign, the volcano); the sky by the hour.
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
// on screen.

import type { GameState } from '../../../m1/game/core/state';
import { timeOfDay, skyRamp, farTint, hourMix, drawStars, drawMoon, sunAt, drawSun, cloudTint } from '../../timeOfDay';
import { pixelBlob } from '../../intro/art/kit';
import { heliOf, type Heli, type Mech } from './state';
import { Z, BASE_SCREEN, SW, SH, MEMO, toScreen } from './geo';
import { MECHS } from './lines';
import { drawMech, mechLook } from './mechArt';

type Ctx = CanvasRenderingContext2D;
type P3 = { x: number; y: number; z: number };

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
/** Each pavilion's plaza paving. */
const PLAZA: Record<PavId, number[]> = {
  mexico: [196, 120, 80], norway: [150, 128, 96], china: [176, 72, 60], germany: [168, 156, 140], italy: [214, 176, 112],
  japan: [190, 184, 168], morocco: [222, 196, 150], france: [212, 204, 186], uk: [160, 92, 76], canada: [104, 146, 84],
};
const LAGOON_R = 220, PROM_R0 = 232, PROM_R1 = 268, HEDGE_R0 = 505, HEDGE_R1 = 530, PAD_R = 118;
const ROAD_HALF = 14, LOT_R0 = 740, LOT_R1 = 1420;
/** Where the helicopter took off (the ride's helipad by the road): the tour starts round here. */
const HELIPAD = polar(ROAD_R + 60, phiOf(-2.6) + 0.15);

// ---------------------------------------------------------------------------------------------------------------
// The floor: Mode 7, row by row, chunky (a quarter size, blown up)

const FS = 4, FW = SW / FS, FH = SH / FS;
let floorCanvas: HTMLCanvasElement | null = null, floorImg: ImageData | null = null;
const hash2 = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5; return x - Math.floor(x); };
const rgbOf = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const WATER = [[38, 98, 156], [46, 112, 172], [60, 132, 190]], WATER_LIT = [150, 200, 230];
const STONE_EDGE = [201, 191, 168], PROM = [214, 203, 180], PROM_JOINT = [184, 172, 150];
const HEDGE = [[34, 86, 40], [44, 102, 48]], LAWN = [[70, 128, 54], [80, 140, 60]], LAWN_DOT = [100, 156, 70];
const PLINTH = [184, 178, 166], PLINTH_RIM = [150, 144, 132], SCORCH = [46, 40, 36], SCORCH_EDGE = [86, 70, 56];
const ROAD = [72, 72, 80], ROAD_LINE = [234, 196, 60], CURB = [176, 170, 160];
const LOT = [92, 92, 98], LOT_LINE = [210, 210, 214], FIELD = [[94, 140, 70], [104, 150, 76]], TREES = [48, 92, 48];
const PAD = [150, 150, 156], PAD_LINE = [250, 220, 60];
const CARS = [[180, 40, 40], [40, 80, 170], [220, 220, 220], [40, 40, 44], [200, 170, 60]];
const MECH_AT = MECHS.map((_, i) => polar(R_MECH, mechAngle(i)));

/** The ground at world (x, z): its color. `dead[i]`: the i-th landmark's plinth scorched. */
const groundAt = (x: number, z: number, f: number, dead: boolean[]): number[] => {
  const r = Math.hypot(x, z);
  if (r < LAGOON_R) {
    // (the lagoon: banded deeper toward the middle, ripples catching the light, drifting)
    if (hash2(Math.floor(x / 26), Math.floor(z / 9 + f * 0.012)) > 0.93) return WATER_LIT;
    return WATER[r < 90 ? 0 : r < 170 ? 1 : 2];
  }
  if (r < PROM_R0) return STONE_EDGE;
  if (r < PROM_R1) return ((Math.floor(x / 22) + Math.floor(z / 22)) & 1) ? PROM : PROM_JOINT;
  const a = Math.atan2(x, z);
  if (r < HEDGE_R0) {
    // (the pavilions' plazas, each in its own paving; a lawn strip between them)
    const sec = ((((a - pavAngle(0)) / ((Math.PI * 2) / 10)) % 10) + 10.5) % 10, j = Math.floor(sec) % 10, off = Math.abs(sec - Math.floor(sec) - 0.5);
    if (off > 0.43) return LAWN[(Math.floor(x / 40) + Math.floor(z / 40)) & 1];
    const p = PLAZA[PAV_IDS[j]];
    return hash2(Math.floor(x / 16), Math.floor(z / 16)) > 0.8 ? p.map(v => v * 0.9) : p;
  }
  if (r < HEDGE_R1) return HEDGE[hash2(Math.floor(x / 14), Math.floor(z / 14)) > 0.5 ? 1 : 0];
  if (r < ROAD_R - ROAD_HALF - 6) {
    // (the circuit's lawn, mowed in stripes; each landmark's plinth, scorched where one's been wrecked)
    for (let i = 0; i < MECH_AT.length; i++) {
      const p = MECH_AT[i], d = Math.hypot(x - p.x, z - p.z);
      if (d < PAD_R) return dead[i] ? (d < PAD_R - 22 ? SCORCH : SCORCH_EDGE) : d > PAD_R - 10 ? PLINTH_RIM : PLINTH;
    }
    const hx = x - HELIPAD.x, hz = z - HELIPAD.z, hp = Math.hypot(hx, hz);
    if (hp < 60) return (hp > 50 && hp < 56) || (Math.abs(hx) < 18 && Math.abs(hz) < 5) || (Math.abs(hz) < 22 && Math.abs(Math.abs(hx) - 15) < 4) ? PAD_LINE : PAD;
    if (hash2(Math.floor(x / 30), Math.floor(z / 30)) > 0.9) return LAWN_DOT;
    return LAWN[Math.floor(r / 34) & 1];
  }
  if (r < ROAD_R - ROAD_HALF) return CURB;
  if (r < ROAD_R + ROAD_HALF) {
    // (the service road, a dashed yellow line down its middle)
    if (Math.abs(r - ROAD_R) < 1.6 && (Math.floor((a * ROAD_R) / 22) & 1)) return ROAD_LINE;
    return ROAD;
  }
  if (r < LOT_R0) return CURB;
  if (r < LOT_R1) {
    // (the parking lot: rows of stalls, cars parked in some)
    const row = (r - LOT_R0) % 120, al = (((a * r) % 34) + 34) % 34;
    if (row < 3 || ((row < 46 || row > 74) && al < 1.6)) return LOT_LINE;
    if ((row > 8 && row < 40) || (row > 80 && row < 112)) {
      const n = Math.floor((a * r) / 34) * 7 + Math.floor((r - LOT_R0) / 60);
      if (hash2(n, 3) > 0.45 && Math.abs(al - 17) < 10) return CARS[Math.floor(hash2(n, 7) * 5)];
    }
    return LOT;
  }
  if (hash2(Math.floor(x / 120), Math.floor(z / 120)) > 0.82) return TREES;
  return FIELD[(Math.floor(x / 260) + Math.floor(z / 260)) & 1];
};

const drawFloor = (c: Ctx, cam: Cam, f: number, dead: boolean[], mul: number[]) => {
  if (typeof document === 'undefined') return;
  if (!floorCanvas) { floorCanvas = document.createElement('canvas'); floorCanvas.width = FW; floorCanvas.height = FH; floorImg = floorCanvas.getContext('2d')!.createImageData(FW, FH); }
  const d = floorImg!.data;
  d.fill(0);
  const tod = timeOfDay(), haze = rgbOf(tod.haze), hazeDay = [176, 200, 214];
  const H = haze.map((v, i) => hazeDay[i] + (v - hazeDay[i]) * Math.min(1, tod.skyK));
  for (let ry = 0; ry < FH; ry++) {
    const sy = ry * FS + FS / 2, yr = -(sy - cam.ppy) / cam.F;
    const dy = yr * cam.uy + cam.fy;
    if (dy > -0.0008) continue;
    const dz = yr * cam.uz + cam.fz, t = -cam.hc / dy;
    for (let rx = 0; rx < FW; rx++) {
      const xr = (rx * FS + FS / 2 - cam.ppx) / cam.F;
      const X = t * xr, Zp = DC + t * dz;
      const x = X * cam.cos + Zp * cam.sin, z = -X * cam.sin + Zp * cam.cos;
      const dist = t * Math.hypot(xr, dz, dy);
      const col = groundAt(x, z, f, dead);
      // (banded haze with distance, in steps)
      const fog = dist > 5200 ? 0.7 : dist > 3800 ? 0.5 : dist > 2900 ? 0.3 : dist > 2300 ? 0.14 : 0;
      const o = (ry * FW + rx) * 4;
      for (let k = 0; k < 3; k++) { const v = (col[k] * mul[k]) / 255; d[o + k] = v + (H[k] - v) * fog; }
      d[o + 3] = 255;
    }
  }
  floorCanvas!.getContext('2d')!.putImageData(floorImg!, 0, 0);
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(floorCanvas!, 0, 0, SW, SH);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Solids: faces in 3D, the turned-away ones culled, each lit by how it faces the sun, in flat steps

const SUN3 = (() => { const v = { x: -0.55, y: 0.75, z: 0.38 }, l = Math.hypot(v.x, v.y, v.z); return { x: v.x / l, y: v.y / l, z: v.z / l }; })();
const shadeRgb = (rgb: number[], k: number, mul: number[]) => 'rgb(' + rgb.map((v, i) => Math.max(0, Math.min(255, Math.round((v * k * mul[i]) / 255)))).join(',') + ')';
interface Solid { faces: P3[][]; col: number[]; mid: P3; y0: number; trim?: number[] }

const solidMid = (faces: P3[][]): P3 => { let x = 0, y = 0, z = 0, n = 0; for (const f of faces) for (const p of f) { x += p.x; y += p.y; z += p.z; n++; } return { x: x / n, y: y / n, z: z / n }; };
const drawSolid = (c: Ctx, cam: Cam, s: Solid, mul: number[]) => {
  const cp = camPos(cam);
  for (const face of s.faces) {
    const a = face[0], b = face[1], d = face[2];
    let nx = (b.y - a.y) * (d.z - a.z) - (b.z - a.z) * (d.y - a.y), ny = (b.z - a.z) * (d.x - a.x) - (b.x - a.x) * (d.z - a.z), nz = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x);
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    let mx = 0, my = 0, mz = 0; for (const p of face) { mx += p.x; my += p.y; mz += p.z; } mx /= face.length; my /= face.length; mz /= face.length;
    if (nx * (mx - s.mid.x) + ny * (my - s.mid.y) + nz * (mz - s.mid.z) < 0) { nx = -nx; ny = -ny; nz = -nz; }
    if (nx * (cp.x - a.x) + ny * (cp.y - a.y) + nz * (cp.z - a.z) <= 0) continue;
    const lit = 0.58 + 0.46 * Math.max(0, nx * SUN3.x + ny * SUN3.y + nz * SUN3.z);
    const k = lit > 0.95 ? 1.04 : lit > 0.82 ? 0.9 : lit > 0.7 ? 0.78 : 0.64;
    const pts = face.map(p => proj(cam, p.x, p.y, p.z));
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
    c.fillStyle = shadeRgb(s.col, k, mul); c.fill();
    c.strokeStyle = shadeRgb(s.col, 0.42, mul); c.lineWidth = 1; c.stroke();
    // (a lit lip round a flat top: it reads as a top)
    if (ny > 0.9 && s.trim) { c.strokeStyle = shadeRgb(s.trim, 1.12, mul); c.stroke(); }
  }
};

/** A pavilion's local frame: u along the ring (its width), v out from the lagoon (its depth), y up. */
const frame = (a: number, r: number) => {
  const cx = r * Math.sin(a), cz = r * Math.cos(a), tx = Math.cos(a), tz = -Math.sin(a), nx = Math.sin(a), nz = Math.cos(a);
  return (u: number, v: number, y: number): P3 => ({ x: cx + tx * u + nx * v, y, z: cz + tz * u + nz * v });
};
type Fr = ReturnType<typeof frame>;
const box = (P: Fr, u0: number, u1: number, v0: number, v1: number, y0: number, y1: number, col: number[], trim?: number[]): Solid => {
  const b = [P(u0, v0, y0), P(u1, v0, y0), P(u1, v1, y0), P(u0, v1, y0)], t = [P(u0, v0, y1), P(u1, v0, y1), P(u1, v1, y1), P(u0, v1, y1)];
  const faces = [[b[0], b[1], t[1], t[0]], [b[1], b[2], t[2], t[1]], [b[2], b[3], t[3], t[2]], [b[3], b[0], t[0], t[3]], [t[0], t[1], t[2], t[3]]];
  return { faces, col, mid: solidMid(faces), y0, trim };
};
/** A roof: a ridge along u (`ridge` 0: to a point, a hip; 1: gable end to end), up `h` over its base at y0. */
const roof = (P: Fr, u0: number, u1: number, v0: number, v1: number, y0: number, h: number, col: number[], ridge = 0.5): Solid => {
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2, rh = ((u1 - u0) / 2) * ridge;
  const b = [P(u0, v0, y0), P(u1, v0, y0), P(u1, v1, y0), P(u0, v1, y0)], ra = P(um - rh, vm, y0 + h), rb = P(um + rh, vm, y0 + h);
  const faces = rh > 0.5 ? [[b[0], b[1], rb, ra], [b[1], b[2], rb], [b[2], b[3], ra, rb], [b[3], b[0], ra]] : [[b[0], b[1], ra], [b[1], b[2], ra], [b[2], b[3], ra], [b[3], b[0], ra]];
  return { faces, col, mid: { x: (b[0].x + b[2].x) / 2, y: y0 + h / 3, z: (b[0].z + b[2].z) / 2 }, y0 };
};
/** An eight-sided tower (its middle at u, v), from y0 to y1, tapering to `top` of its radius (a dome, a spire). */
const oct = (P: Fr, u: number, v: number, r: number, y0: number, y1: number, col: number[], top = 1): Solid => {
  const ring = (y: number, rr: number) => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; return P(u + Math.cos(a) * rr, v + Math.sin(a) * rr, y); });
  const b = ring(y0, r), t = ring(y1, r * Math.max(0.02, top));
  const faces = b.map((p, i) => [p, b[(i + 1) % 8], t[(i + 1) % 8], t[i]]);
  if (top > 0.05) faces.push(t);
  return { faces, col, mid: solidMid([b, t]), y0 };
};

const C = (hex: string) => rgbOf(hex);
const STUCCO = C('#EDE4D2'), TERRA = C('#C2643E'), OCHRE = C('#D8A24A'), RED = C('#B8322A'), JADE = C('#2F7A5A'), SLATE = C('#4A5568');
const WOOD = C('#6B4A2E'), DKWOOD = C('#3E2A1A'), WHITE = C('#F2F0EA'), SAND = C('#DCC18C'), BRICK = C('#A0503C'), COPPER = C('#5FA88E');
const GLASS = C('#9CC9E6'), STONE = C('#B6AE9E'), GOLD = C('#D4A62A'), CREAM = C('#E8DCC0'), BLUE = C('#2A5C9A');

/** Each pavilion, built (local: u across, v out from the lagoon: its front faces the water, v negative). */
const BUILD: Record<PavId, (P: Fr) => Solid[]> = {
  mexico: P => [box(P, -60, 60, -10, 70, 0, 22, TERRA), box(P, -44, 44, 2, 58, 22, 44, TERRA), box(P, -28, 28, 14, 46, 44, 66, OCHRE), box(P, -14, 14, 22, 38, 66, 84, CREAM), box(P, 66, 110, -20, 30, 0, 26, STUCCO), roof(P, 66, 110, -20, 30, 26, 10, RED, 0.8)],
  norway: P => [box(P, -30, 20, 10, 60, 0, 34, DKWOOD), roof(P, -30, 20, 10, 60, 34, 34, DKWOOD, 0), box(P, -10, 0, 30, 40, 50, 92, DKWOOD), roof(P, -12, 2, 28, 42, 92, 26, DKWOOD, 0), box(P, 34, 104, -10, 40, 0, 26, WOOD), roof(P, 34, 104, -10, 40, 26, 22, JADE, 0.9)],
  china: P => [
    ...[0, 1, 2, 3].flatMap(i => { const w = 30 - i * 5, y = i * 26; return [box(P, -w, w, 30 - w, 30 + w, y, y + 18, RED), roof(P, -w - 10, w + 10, 20 - w, 40 + w, y + 18, 9, JADE, 0)]; }),
    box(P, 44, 120, -10, 20, 0, 26, STONE, STONE), box(P, -120, -46, -10, 20, 0, 26, STONE, STONE),
  ],
  germany: P => [box(P, -76, -24, 0, 50, 0, 42, STUCCO), roof(P, -76, -24, 0, 50, 42, 34, RED, 0.9), box(P, -20, 30, 6, 56, 0, 48, CREAM), roof(P, -20, 30, 6, 56, 48, 36, BRICK, 0.9), box(P, 40, 64, 20, 44, 0, 104, STONE), roof(P, 38, 66, 18, 46, 104, 40, SLATE, 0)],
  italy: P => [box(P, -86, 20, 0, 60, 0, 44, OCHRE), roof(P, -86, 20, 0, 60, 44, 10, TERRA, 0.8), box(P, 34, 58, 18, 42, 0, 132, BRICK), box(P, 32, 60, 16, 44, 132, 146, STUCCO), roof(P, 32, 60, 16, 44, 146, 18, TERRA, 0)],
  japan: P => [
    ...[0, 1, 2, 3, 4].flatMap(i => { const w = 22 - i * 3, y = i * 22; return [box(P, -w, w, 40 - w, 40 + w, y, y + 14, RED), roof(P, -w - 9, w + 9, 31 - w, 49 + w, y + 14, 8, SLATE, 0)]; }),
    box(P, -70, -64, -40, -34, 0, 52, RED), box(P, 64, 70, -40, -34, 0, 52, RED), box(P, -80, 80, -42, -32, 52, 60, DKWOOD), box(P, -72, 72, -40, -34, 42, 47, RED),
  ],
  morocco: P => [box(P, -70, 50, 0, 60, 0, 36, WHITE, SAND), box(P, -64, 44, 6, 54, 36, 40, SAND), box(P, 60, 84, 20, 44, 0, 124, SAND, SAND), box(P, 64, 80, 24, 40, 124, 140, WHITE), oct(P, 72, 32, 7, 140, 152, GOLD, 0.2), oct(P, -10, 30, 22, 40, 62, JADE, 0.2)],
  france: P => [box(P, -86, 50, 10, 66, 0, 40, CREAM), roof(P, -86, 50, 10, 66, 40, 22, SLATE, 0.75), roof(P, 64, 116, -16, 36, 0, 46, GLASS, 0)],
  uk: P => [box(P, -100, 10, 4, 50, 0, 38, WHITE), roof(P, -100, 10, 4, 50, 38, 24, DKWOOD, 0.9), box(P, 30, 56, 14, 40, 0, 120, SAND, SAND), box(P, 28, 58, 12, 42, 120, 134, SAND), roof(P, 28, 58, 12, 42, 134, 34, SLATE, 0), box(P, 64, 74, -36, -26, 0, 40, RED)],
  canada: P => [box(P, -70, 40, 6, 60, 0, 50, STONE, STONE), roof(P, -70, -30, 6, 60, 50, 46, COPPER, 0.4), roof(P, -30, 40, 6, 60, 50, 36, COPPER, 0.8), oct(P, 0, 24, 14, 86, 120, COPPER, 0.1), box(P, 76, 84, -30, -22, 0, 76, BLUE), box(P, 70, 90, -30, -22, 60, 66, RED)],
};
/** Built once (the plan never moves: the camera goes round it). */
let built: { solids: Solid[]; at: number }[] | null = null;
const pavilions = () => (built ??= PAV_IDS.map((id, j) => ({ solids: BUILD[id](frame(pavAngle(j), PAV_R)), at: pavAngle(j) })));

/** Round trees: by the promenade, between the pavilions, along the hedge (not in front of a plinth). */
const TREE_AT: { x: number; z: number; h: number }[] = (() => {
  const out: { x: number; z: number; h: number }[] = [];
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + 0.05, p = polar(PROM_R1 + 12, a); out.push({ ...p, h: 34 + (i % 3) * 6 }); }
  for (let j = 0; j < 10; j++) for (const s of [-1, 1]) { const p = polar(PAV_R + 40, pavAngle(j) + s * 0.31); out.push({ ...p, h: 46 }); }
  const wrap = (a: number) => Math.abs(((a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2; if (MECHS.some((_, k) => wrap(a - mechAngle(k)) < 0.2)) continue; out.push({ ...polar(HEDGE_R1 + 8, a), h: 40 }); }
  return out;
})();
const drawTree = (c: Ctx, cam: Cam, t: { x: number; z: number; h: number }, mul: number[]) => {
  const b = proj(cam, t.x, 0, t.z), top = proj(cam, t.x, t.h, t.z), r = Math.max(2, 13 * b.k);
  c.fillStyle = shadeRgb([30, 60, 30], 1, mul); c.beginPath(); c.ellipse(b.x + r * 0.4, b.y, r * 1.1, r * 0.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = shadeRgb([90, 64, 40], 1, mul); c.fillRect(Math.round(b.x - 1), Math.round(top.y), 2, Math.round(b.y - top.y));
  c.fillStyle = shadeRgb([34, 92, 44], 1, mul); c.beginPath(); c.arc(top.x, top.y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = shadeRgb([70, 140, 64], 1, mul); c.beginPath(); c.arc(top.x - r * 0.3, top.y - r * 0.3, r * 0.55, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The guests: tiny, milling on the promenade and in the plazas; they scatter from a landmark coming up

interface Item { z: number; y0: number; draw: () => void }

const GUESTS = Array.from({ length: 90 }, (_, i) => {
  const h = (n: number) => hash2(i * 3.1 + n, n * 7.7);
  const onProm = i % 3 !== 0;
  return { a: h(1) * Math.PI * 2, r: onProm ? PROM_R0 + 6 + h(2) * (PROM_R1 - PROM_R0 - 12) : PROM_R1 + 20 + h(2) * 150, sp: (h(3) - 0.5) * 0.0016, col: ['#DC2626', '#2563EB', '#F59E0B', '#16A34A', '#F8FAFC', '#9333EA', '#EC4899'][Math.floor(h(4) * 7)] };
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
    const s = Math.max(1, Math.round(q.k * 3)), bob = run && (f >> 2) % 2 ? 1 : 0;
    out.push({ z: q.z, y0: 0, draw: () => { c.fillStyle = g.col; c.fillRect(Math.round(q.x) - s, Math.round(q.y) - s * 3 - bob, s * 2, s * 2); c.fillStyle = '#E2AC84'; c.fillRect(Math.round(q.x) - s, Math.round(q.y) - s * 4 - bob, s * 2, s); } });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky, the far lands, the clouds

const SKY = ['#2A7FC9', '#3A8FD3', '#4C9FDB', '#62AFE0', '#7CBFE4', '#98CEE6', '#B4DCE6'];

const drawSky = (c: Ctx, cam: Cam, f: number, hy: number) => {
  const tod = timeOfDay(), ramp = skyRamp(SKY, tod), top = Math.max(0, Math.min(SH, hy));
  // (in flat bands down to the horizon, the last band on under it)
  const n = ramp.length, bandH = Math.max(1, top / n);
  for (let i = 0; i < n; i++) { c.fillStyle = ramp[i]; c.fillRect(0, Math.floor(i * bandH), SW, Math.ceil(bandH) + 1); }
  c.fillStyle = ramp[n - 1]; c.fillRect(0, top, SW, SH - top);
  drawStars(c, 0, 0, SW, top, f, cam.phi * 1200, tod);
  const sk = ((((-cam.phi * 700 + 560) % 1600) + 1600) % 1600) - 400;
  drawMoon(c, sk, Math.max(24, top - 260), 16, tod);
  { const s = sunAt(sk + 300, top - 200, top, tod); drawSun(c, s.x, s.y, 20, tod); }
};

/** The rest of Happy Land on the horizon (silhouettes, hazy): its hills, Spooky Land's castle, Space Land's needle, the
 *  Hollywood Land sign, Adventure Land's volcano. */
const FAR = [{ a: 0.9, kind: 'castle' }, { a: 2.4, kind: 'needle' }, { a: 3.7, kind: 'sign' }, { a: 5.1, kind: 'volcano' }] as const;
const drawFar = (c: Ctx, cam: Cam, f: number) => {
  const tod = timeOfDay(), hill = farTint('#6E8E86', 1, tod), hillLit = farTint('#8FAEA2', 1, tod), sil = farTint('#5A6878', 1, tod), silLit = farTint('#7C8A9C', 1, tod);
  const RF = 6200;
  // (the hills, all round: a bumpy band, lit along its crest)
  const tops: { x: number; y: number }[] = [], bases: { x: number; y: number }[] = [];
  for (let k = 0; k < 360; k++) {
    const a = (k / 360) * Math.PI * 2, p = polar(RF, a), q = proj(cam, p.x, 0, p.z);
    if (q.z < 200) continue;
    const ht = 160 + 90 * Math.sin(5 * a + 1) + 60 * Math.sin(13 * a) + 30 * Math.sin(29 * a + 2);
    tops.push({ x: q.x, y: proj(cam, p.x, ht, p.z).y }); bases.push({ x: q.x, y: q.y + 4 });
  }
  const order = tops.map((_, i) => i).sort((i, j) => tops[i].x - tops[j].x);
  if (order.length > 2) for (const [dy, col] of [[0, hillLit], [5, hill]] as const) {
    c.fillStyle = col; c.beginPath();
    order.forEach((i, n) => (n ? c.lineTo(tops[i].x, tops[i].y + dy) : c.moveTo(tops[i].x, tops[i].y + dy)));
    for (let n = order.length - 1; n >= 0; n--) c.lineTo(bases[order[n]].x, bases[order[n]].y);
    c.closePath(); c.fill();
  }
  // (the other lands' landmarks)
  for (const L of FAR) {
    const p = polar(RF * 0.9, L.a), q = proj(cam, p.x, 0, p.z);
    if (q.z < 200 || q.x < -200 || q.x > SW + 200) continue;
    const k = q.k, R = (x: number, y: number, w: number, hh: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(q.x + x * k), Math.round(q.y - (y + hh) * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(hh * k))); };
    if (L.kind === 'castle') {
      R(-260, 0, 520, 260, sil);
      for (const [x, ht] of [[-280, 520], [-120, 640], [60, 760], [220, 560]]) { R(x, 0, 80, ht, sil); R(x, ht - 10, 80, 10, silLit); c.fillStyle = sil; c.beginPath(); c.moveTo(q.x + (x - 10) * k, q.y - ht * k); c.lineTo(q.x + (x + 40) * k, q.y - (ht + 200) * k); c.lineTo(q.x + (x + 90) * k, q.y - ht * k); c.fill(); }
    } else if (L.kind === 'needle') {
      R(-30, 0, 60, 1100, sil); R(-12, 0, 24, 1100, silLit);
      c.fillStyle = silLit; c.beginPath(); c.ellipse(q.x, q.y - 1120 * k, 190 * k, 50 * k, 0, 0, Math.PI * 2); c.fill();
      R(-6, 1160, 12, 260, sil);
      if ((f >> 4) % 2) R(-10, 1420, 20, 20, '#EF4444');
    } else if (L.kind === 'sign') {
      c.fillStyle = sil; c.beginPath(); c.moveTo(q.x - 900 * k, q.y); c.quadraticCurveTo(q.x, q.y - 760 * k, q.x + 900 * k, q.y); c.fill();
      for (let i = 0; i < 9; i++) R(-470 + i * 105, 380 + Math.sin(i * 0.7) * 30, 80, 120, farTint('#E5E7EB', 0.8, tod));
    } else {
      c.fillStyle = sil; c.beginPath(); c.moveTo(q.x - 900 * k, q.y); c.lineTo(q.x - 160 * k, q.y - 820 * k); c.lineTo(q.x + 140 * k, q.y - 820 * k); c.lineTo(q.x + 900 * k, q.y); c.fill();
      c.fillStyle = hourMix('#F97316', '#EA580C', '#DC2626', tod); c.fillRect(Math.round(q.x - 120 * k), Math.round(q.y - 830 * k), Math.round(240 * k), Math.max(1, Math.round(16 * k)));
      for (let i = 0; i < 4; i++) { const ph = ((f * 0.4 + i * 60) % 240) / 240; c.fillStyle = farTint('#9CA3AF', 1, tod); c.globalAlpha = 0.6 * (1 - ph); c.beginPath(); c.arc(q.x + Math.sin(ph * 5 + i) * 60 * k, q.y - (860 + ph * 900) * k, (80 + ph * 200) * k, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    }
  }
};

/** Clouds drifting over the park, below him (they go round with it). */
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ a: i * 0.9 + 0.3, r: 700 + ((i * 397) % 900), y: 470 + (i % 3) * 40, w: 1 + (i % 3) * 0.3 }));
const drawClouds = (c: Ctx, cam: Cam, f: number) => {
  const tod = timeOfDay(), cc = [cloudTint('#C8D4E4', tod), cloudTint('#EEF2F8', tod), cloudTint('#FFFFFF', tod)];
  for (const cl of CLOUDS) {
    const p = polar(cl.r, cl.a + f * 0.00012), q = proj(cam, p.x, cl.y, p.z);
    if (q.z < 120 || q.x < -260 || q.x > SW + 260) continue;
    const s = q.k * 2.2 * cl.w;
    c.globalAlpha = 0.72;
    for (const [dx, dy, rw, rh, k] of [[0, 6, 40, 10, 0], [-22, 0, 22, 12, 1], [12, -4, 26, 16, 1], [30, 4, 18, 9, 1], [4, -8, 16, 9, 2]] as const) pixelBlob(c, q.x + dx * s, q.y + dy * s, rw * s, rh * s, cc[k]);
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
const mechAt = (m: Mech | undefined, i: number) => {
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
    if (walking(m)) {
      // (its feet where they are on the ground, through the eye, in its own frame)
      const g = gaitOf(m, i);
      look.feet = [0, 1].map(k => { const fp = gaitPt(g, g.d[k]), pq = proj(cam, fp.x, 0, fp.z); return { x: (pq.x - q.x) / q.k + (k ? FOOT_X : -FOOT_X), y: (pq.y - q.y) / q.k - 7 - g.lift[k] }; });
      // (the dust where the last foot came down, at its depth)
      const pf = 1 - (g.j % 2), fp = gaitPt(g, g.d[pf]), dq = proj(cam, fp.x, 0, fp.z), age = g.fr;
      if (g.j > 0 && age < 0.9) out.push({ z: dq.z - 2, y0: 2, draw: () => stompDust(c, dq.x + (pf ? FOOT_X : -FOOT_X) * dq.k, dq.y, dq.k, age, RISE[i].r < LAGOON_R && Math.hypot(fp.x, fp.z) < LAGOON_R) });
    }
    out.push({ z: q.z, y0: 0, draw: () => drawMech(c, id, q.x, q.y, q.k, 0, look) });
  });
};
/** A foot coming down: a ring of dust (spray, in the lagoon) puffing out low along the ground, settling. */
const stompDust = (c: Ctx, x: number, y: number, k: number, age: number, wet: boolean) => {
  const a = 1 - age, R = (30 + age * 70) * k;
  c.globalAlpha = 0.7 * a;
  for (let n = 0; n < 9; n++) {
    const t = (n / 9) * Math.PI * 2, px = x + Math.cos(t) * R, py = y + Math.sin(t) * R * 0.32 - age * 14 * k;
    pixelBlob(c, px, py, (14 + (n % 3) * 5) * k * (0.7 + age), (8 + (n % 2) * 4) * k * (0.7 + age), wet ? (n % 2 ? '#F0F9FF' : '#BAE6FD') : (n % 2 ? '#A8977E' : '#6B5B45'));
  }
  c.globalAlpha = 1;
};

/** The ground where the one round in front is coming up: the cracks spreading out (through France's plaza, for the
 *  first), the hole it went down. Under it. */
const drawRevealGround = (c: Ctx, cam: Cam, h: Heli) => {
  const m = h.mechs[h.cur];
  if (!m || m.st !== 'intro' || (h.phase !== 'fly' && h.phase !== 'end')) return;
  // (first at its plinth, under the replica; then where it comes up, somewhere else in the park)
  const up = m.unfold >= 0 || m.t > m.introLen * 0.22, k = up ? Math.min(1, (m.t - m.introLen * 0.22) / Math.max(1, m.introLen * 0.08)) : Math.min(1, m.t / Math.max(1, m.introLen * 0.14));
  const at = up ? riseAt(m.i) : MECH_AT[m.i], wet = up && RISE[m.i].r < LAGOON_R;
  c.strokeStyle = wet ? '#E0F2FE' : '#1C1917';
  c.lineWidth = 2;
  for (let j = 0; j < 9; j++) {
    const a0 = j * 0.7 + 0.2, len = (130 + (j % 3) * 90) * k;
    let x = at.x, z = at.z;
    c.beginPath();
    for (let s = 0; s <= 5; s++) {
      const a = a0 + Math.sin(j * 3 + s * 1.7) * 0.35;
      if (s) { x += Math.sin(a) * (len / 5); z += Math.cos(a) * (len / 5); }
      const q = proj(cam, x, 0, z);
      if (s) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y);
    }
    c.stroke();
  }
  // (the hole it went down, while it's under or coming up)
  if (up || m.sink > 0.02) {
    const q = proj(cam, at.x, 0, at.z), w = 110 * q.k, hh = w * 0.36;
    // (in the lagoon: foam and a churning dark swirl; on land: the broken earth and the hole)
    c.fillStyle = wet ? '#F0F9FF' : '#4A3A2A'; c.beginPath(); c.ellipse(q.x, q.y, w * 1.12, hh * 1.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = wet ? '#1E3A5F' : '#140E0A'; c.beginPath(); c.ellipse(q.x, q.y, w, hh, 0, 0, Math.PI * 2); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ruin (looks only: the fight's untouched). Each landmark's walk in, from where it came up to its plinth (as far
// as it's got), is a path of wreckage: footprint craters, the cars in the lot crushed and flipped, any pavilion it went
// through caved in, fires and smoke along it; and round each plinth, fires lit as its fight goes on (all of them once
// it's down). Worked out from where the landmarks have got to, so it stacks up landmark by landmark (by the Easter
// Island head the park's a burning ruin) and comes back as it was starting again at a checkpoint.

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
/** A pavilion caved in: everything a third the height, scorched dark. Made once each. */
const crushedOf = new Map<number, Solid[]>();
const crushed = (j: number, solids: Solid[]) => {
  let c = crushedOf.get(j);
  if (!c) { c = solids.map(s => ({ ...s, faces: s.faces.map(fc => fc.map(p => ({ x: p.x, y: p.y * 0.3, z: p.z }))), col: s.col.map(v => v * 0.5), mid: { ...s.mid, y: s.mid.y * 0.3 }, y0: s.y0 * 0.3 })); crushedOf.set(j, c); }
  return c;
};

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

const drawScars = (c: Ctx, cam: Cam, h: Heli, mul: number[]) => {
  // (its footprints: craters stamped where each foot came down, under where it was drawn)
  h.mechs.forEach((m, i) => {
    const pl = plantsOf(m, i);
    if (!pl) return;
    for (const p of pl.out) {
      const g = gaitPt(pl.g, p.d), q = proj(cam, g.x, 0, g.z);
      if (q.z < 60 || q.x < -40 || q.x > SW + 40) continue;
      const x = q.x + p.s * FOOT_X * q.k, w = 24 * q.k, hh = w * 0.38;
      c.fillStyle = shadeRgb([110, 96, 80], 1, mul); c.beginPath(); c.ellipse(x, q.y, w * 1.25, hh * 1.3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = shadeRgb([34, 28, 24], 1, mul); c.beginPath(); c.ellipse(x, q.y, w, hh, 0, 0, Math.PI * 2); c.fill();
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
    // (the blood out round it in lobes, splashes thrown off)
    c.fillStyle = '#5A0A0A'; c.beginPath(); c.ellipse(q.x, q.y, 40 * k, 11 * k, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 6; i++) { const a = seed + i * 1.05, d = (34 + (i % 3) * 10) * k; c.beginPath(); c.ellipse(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * 0.28, (6 + (i % 2) * 4) * k, 3 * k, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#8B1010'; c.beginPath(); c.ellipse(q.x, q.y, 30 * k, 8 * k, 0, 0, Math.PI * 2); c.fill();
    // (him, flat: the body, the mane round his squashed head, the tail out the back, a leg each way)
    c.fillStyle = '#B45309'; c.beginPath(); c.ellipse(q.x + fl * 4 * k, q.y, 20 * k, 5 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#78350F'; c.beginPath(); c.ellipse(q.x - fl * 16 * k, q.y, 11 * k, 6 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(q.x - fl * 16 * k, q.y, 6 * k, 3.5 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(q.x + fl * 20 * k, q.y - 1 * k, fl * 14 * k, Math.max(1, 2 * k));
    for (const s of [-1, 1]) c.fillRect(q.x + s * 6 * k, q.y + 3 * k, 3 * k, Math.max(1, 4 * k));
    c.fillStyle = '#DC2626'; c.fillRect(q.x - 8 * k, q.y - 2 * k, 10 * k, Math.max(1, 1.5 * k));
  }
};

/** A car it flipped, wheels up (a little box on the ground). */
const flippedCar = (c: Ctx, q: { x: number; y: number; k: number }, n: number) => {
  const w = 34 * q.k, hh = 14 * q.k, col = ['#7F1D1D', '#1E3A8A', '#9CA3AF', '#1C1917', '#854D0E'][n % 5];
  c.save(); c.translate(q.x, q.y); c.rotate((hash2(n, 9) - 0.5) * 0.8);
  c.fillStyle = col; c.fillRect(-w / 2, -hh, w, hh); c.fillStyle = '#111827'; c.fillRect(-w / 2, -hh, w, Math.max(1, hh * 0.3));
  c.fillStyle = '#18181B'; for (const x of [-0.32, 0.32]) { c.beginPath(); c.arc(x * w, -hh - 2 * q.k, Math.max(1.5, 5 * q.k), 0, Math.PI * 2); c.fill(); }
  c.restore();
};
/** A fire on the ground: banded flames, flickering; a column of smoke going up off it. */
const drawFire = (c: Ctx, cam: Cam, x: number, z: number, sz: number, f: number, n: number, mul: number[]) => {
  const q = proj(cam, x, 0, z), k = q.k * sz, fl = Math.sin(f * 0.4 + n) * 0.15 + 1;
  for (let p = 0; p < 6; p++) {
    const ph = ((f * 0.5 + p * 37 + n * 13) % 220) / 220, s = proj(cam, x + Math.sin(ph * 4 + n) * 30, 40 + ph * 320, z);
    c.globalAlpha = 0.55 * (1 - ph); c.fillStyle = shadeRgb(p % 2 ? [70, 66, 66] : [96, 92, 90], 1, mul);
    c.beginPath(); c.arc(s.x, s.y, (10 + ph * 34) * s.k * sz, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  const band = (w: number, h: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(q.x - w * k, q.y); c.quadraticCurveTo(q.x - w * 0.4 * k, q.y - h * 0.6 * k * fl, q.x, q.y - h * k * fl); c.quadraticCurveTo(q.x + w * 0.4 * k, q.y - h * 0.6 * k * fl, q.x + w * k, q.y); c.closePath(); c.fill(); };
  band(26, 60, '#B91C1C'); band(20, 46, '#F97316'); band(12, 30, '#FDE047'); band(5, 14, '#FFFBEB');
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
  drawSky(c, cam, f, horizonOf(cam));
  drawFar(c, cam, f);
  drawFloor(c, cam, f, h.mechs.map(m => m.st === 'dead'), mul);
  drawRevealGround(c, cam, h);
  const segs = pathsOf(h);
  drawScars(c, cam, h, mul);
  drawLionStains(c, cam, state);
  const items: Item[] = [];
  pavilions().forEach((pv, j) => {
    const q = proj(cam, PAV_R * Math.sin(pv.at), 0, PAV_R * Math.cos(pv.at));
    if (q.z < 60 || q.x < -200 || q.x > SW + 200) return;
    for (const s of pavWrecked(segs, pv.at) ? crushed(j, pv.solids) : pv.solids) { const mq = proj(cam, s.mid.x, 0, s.mid.z); items.push({ z: mq.z, y0: s.y0, draw: () => drawSolid(c, cam, s, mul) }); }
  });
  // (the cars it flipped crossing the lot; the fires)
  for (const sg of segs) for (const p of along(sg, 80, 40, 30)) {
    const r = Math.hypot(p.x, p.z);
    if (r < LOT_R0 || r > LOT_R1) continue;
    const q = proj(cam, p.x, 0, p.z);
    if (q.z > 60 && q.x > -40 && q.x < SW + 40) items.push({ z: q.z, y0: 0, draw: () => flippedCar(c, q, sg.i * 31 + p.n) });
  }
  firesOf(h, segs).forEach((fz, n) => { const q = proj(cam, fz.x, 0, fz.z); if (q.z > 60 && q.x > -60 && q.x < SW + 60) items.push({ z: q.z - 1, y0: 1, draw: () => drawFire(c, cam, fz.x, fz.z, fz.s, f, n, mul) }); });
  for (const t of TREE_AT) { const q = proj(cam, t.x, 0, t.z); if (q.z > 60 && q.x > -40 && q.x < SW + 40) items.push({ z: q.z, y0: 0, draw: () => drawTree(c, cam, t, mul) }); }
  guestItems(c, cam, h, f, items);
  mechItems(c, cam, h, f, items);
  items.sort((a, b) => b.z - a.z || a.y0 - b.y0).forEach(it => it.draw());
  drawClouds(c, cam, f);
  c.globalAlpha = 1;
};
