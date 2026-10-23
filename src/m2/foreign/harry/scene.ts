// The crash site drawn (the SNES pass; the fight's own pieces: rambo.ts, liberty.ts): the AMERICA pavilion's
// construction site. One eye for the scene (its horizon is the sky's; the gauntlet's wrecks are drawn in 3D through a
// camera on the same eye): the sky through the smoke at whatever hour it is, the rest of Foreign Lands far off in the
// haze with its fires; the dig's dirt berm along the back of the floor with all nine wrecked landmark mechs on it (the
// heli's 3D wrecks, landmarks3d.ts: blackened, on their sides by their folded legs, eyes X'd; painted once for the hour,
// their smoke and fires live); the poured slab he fights on (its joints going back to the eye and coming on toward
// him, cracks, scorch, the surveyors' marks); the two scaffold towers at its ends (plywood hoarding to the top of the
// shot: walls; galvanized pipe, couplers, planks; the left one's chain-link gate, shut and padlocked, kicked over,
// lying flat); the helicopter's burning wreck in its crater where he came to; the pavilion's steel going up behind the
// approach, a crane over it; the pavilion's sign between its flags. Revisits: her rubble, the gun and the torch on the
// floor, a chalk outline, his tie-dye in shreds, the spent jetpack, the gate down.

import type { GameState } from '../../../m1/game/core/state';
import { drawTodSky } from '../../timeOfDay';
import { box, mix, hour, dimmed, ramp6, viewIn, onScreen, postBoard, post, ball, stamp, atDepth, timeOfDay, lit, LOOKS, LIP, INK, signText } from '../kit';
import { drawCopter } from '../heli/copter';
import type { MechId } from '../heli/lines';
import { drawWreck3d } from '../heli/landmarks3d';
import { DC, type Cam } from '../heli/park';
import { smoke as wreckSmoke } from '../heli/mechArt';
import { flame as tongue } from '../../hollywood/havoc/paint';
import { shoreFrom, paintMark } from '../teases';
import { TIEDYE, dith, shapeR, ellR, lineR, GRAY_R, STEEL_R, BAND_R } from '../heli/harryArt';
import { x0, X, GY, VIEW_X, ARENA_L, ARENA_R, WALL_W, MID, sy, WRECK_X, BERM_Y, CLING_H } from './arena';
import { drawRubble, drawDropped, drawTorchAt, drawChunk, PAT } from './liberty';

type Ctx = CanvasRenderingContext2D;
/** His tie-dye in shreds on the floor (from MID, its color). */
const CRUMBS: [number, number, number, boolean][] = [[-300, 14, 0.4, true], [-200, 9, 1.2, true], [-60, 18, 2.1, true], [30, 11, 0.8, false], [120, 16, 2.7, true], [210, 8, 1.9, true], [300, 13, 0.2, true]];
const TIEDYE_SHREDS: [number, string][] = TIEDYE.map((col, i) => [-150 + i * 23 + (i % 2) * 9, col]);
const hsh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------------------------------------------------------
// Old Glory (the sign's two flags: thirteen stripes and the canton's stars, not two plain bands). The cloth painted
// once for the hour into a little canvas; waving, it's put down in 2px strips (the same few calls a frame as before)

const glories = new Map<string, HTMLCanvasElement>();
const GW = 48, GH = 30;
const gloryCloth = () => {
  const key = timeOfDay().key;
  let cv = glories.get(key);
  if (!cv && typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
    const g = cv.getContext('2d')!, Rd = ramp6(hour('#B91C1C')), Wh = ramp6(hour('#F1F5F9')), Bl = ramp6(hour('#1E3A8A'));
    for (let k = 0; k < 13; k++) {
      const y0 = Math.round((k * GH) / 13), y1 = Math.round(((k + 1) * GH) / 13), R = k % 2 ? Wh : Rd;
      box(g, 0, y0, GW, y1 - y0, R[3]); box(g, 0, y1 - 1, GW, 1, R[2]);
    }
    const ch = Math.round((7 * GH) / 13);
    box(g, 0, 0, 20, ch, Bl[2]); box(g, 0, 0, 20, 1, Bl[3]); box(g, 19, 0, 1, ch, Bl[1]);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 5 - (r % 2); q++) box(g, 2 + q * 4 + (r % 2) * 2, 2 + r * 4, 1, 1, Wh[4]);
    glories.set(key, cv);
  }
  return cv;
};
/** A flag on a pole (kit.flagPole's pole, its wave): Old Glory. */
const gloryPole = (c: Ctx, x: number, feetY: number, h: number, f: number) => {
  const P = ramp6(hour('#9CA3AF'));
  post(c, x, feetY - h, feetY, 4, P);
  box(c, x - 5, feetY - 5, 11, 5, INK); box(c, x - 4, feetY - 5, 9, 4, P[2]); box(c, x - 4, feetY - 5, 9, 1, P[4]);
  ball(c, x, feetY - h - 4, 3, '#CA8A04');
  box(c, x + 2, feetY - h + 2, 1, h - 40, P[1]);
  const cv = gloryCloth(), top = feetY - h + 2;
  for (let i = 0; i < GW; i += 2) {
    const ph = f * 0.08 + i * 0.12, wave = Math.round(Math.sin(ph) * 2 * (i / GW + 0.3)), lk = Math.cos(ph);
    box(c, x + 2 + i, top + wave - 1, 2, GH + 2, INK);
    if (cv) c.drawImage(cv, i, 0, 2, GH, x + 2 + i, top + wave, 2, GH);
    if (lk > 0.55) box(c, x + 2 + i, top + wave, 2, GH, 'rgba(255, 255, 255, 0.16)');
    else if (lk < -0.55) box(c, x + 2 + i, top + wave, 2, GH, 'rgba(10, 6, 20, 0.24)');
  }
};

/** Poured concrete's aggregate (a speckle tile, for one fill: lit stones and pits), per tone. */
const grits = new Map<string, CanvasPattern>();
const grit = (c: Ctx, lo: string, hi: string) => {
  const key = lo + hi;
  let p = grits.get(key);
  if (!p && typeof document !== 'undefined') {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 24;
    const g = cv.getContext('2d')!;
    for (let i = 0; i < 46; i++) { const x = Math.floor(hsh(i * 2.3) * 64), y = Math.floor(hsh(i * 5.9 + 1) * 24); box(g, x, y, i % 5 ? 1 : 2, 1, i % 3 ? lo : hi); if (i % 7 === 0) box(g, x + 1, y + 1, 1, 1, lo); }
    p = c.createPattern(cv, 'repeat') ?? undefined;
    if (p) grits.set(key, p);
  }
  return p;
};

// ---------------------------------------------------------------------------------------------------------------
// The eye (one for the scene): the screen row its horizon's on, the 3D camera the wrecks go through (the heli's park
// camera's shape: phi 0, up EYE_HC, back DC), where a spot on the berm (screen x, depth z) lands

const EYE_HC = 300, EYE_F = 380, PPX = 400, PPY = 452;
const EYE_L = Math.hypot(EYE_HC, DC);
/** The horizon on the fight's screen (the sky's, the far park's foot, the joints' vanishing row). */
export const HOR = Math.round(PPY - EYE_F * (EYE_HC / DC));
const camAt = (k: number): Cam => { const fy = -EYE_HC / EYE_L, fz = -DC / EYE_L; return { phi: 0, cos: 1, sin: 0, hc: EYE_HC, fy, fz, uy: -fz, uz: fy, F: EYE_F * k, ppx: PPX * k, ppy: PPY * k }; };
const groundAt = (sx: number, z: number) => {
  const zc = (EYE_HC * EYE_HC) / EYE_L + ((DC - z) * DC) / EYE_L, k = EYE_F / zc;
  return { x: ((sx - PPX) * zc) / EYE_F, z, k, sx, sy: PPY + z * (EYE_HC / EYE_L) * k };
};

// ---------------------------------------------------------------------------------------------------------------
// The sky (screen space): the hour's colors through the smoke, the rest of the land far off burning

/** From the AMERICA pavilion's dig, across the lagoon: the pavilions he walked, where they are round the ring
 *  (teases.ts: the same landmarks the streets' far shore has), and where each one's fire is. */
const ACROSS = shoreFrom(62400).map(o => ({ ...o, x: 400 + o.dx * 0.9 }));
const FIRES = [-60, ...ACROSS.map(o => o.x - 14), ...ACROSS.map(o => o.x + 22), 940];

/** Foreign Lands far off in the haze (the stamp's local: screen, the horizon at HOR): the far bank's trees in stepped
 *  crowns, the pavilions over them scorched and smoking, the hour's air washed over all of it in dithered steps, the
 *  fires the gauntlet left along the shore. */
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), y = HOR + 2;
  // (the pavilions across the water, hazed: their landmarks as the streets have them)
  for (const o of ACROSS) paintMark(g, o.id, o.x, y - 4, 0.42, 0.8, tod);
  // (the far bank's trees in front of their feet: crowns in steps, lit up top)
  const Tr = [dimmed('#2E2A30'), dimmed('#3E3640'), dimmed('#544850'), dimmed('#6A5C62')];
  box(g, -100, y - 8, 1100, 12, Tr[0]);
  for (let x = -100; x <= 1000; x += 7) { const r = 6 + hsh(x * 0.13) * 6, cy = y - 8 - r * 0.3; ellR(g, x, cy, r, r * 0.7, Tr[1]); ellR(g, x - 2, cy - 2, r * 0.66, r * 0.42, Tr[2]); box(g, x - 3, cy - r * 0.6, 3, 1, Tr[3]); }
  // (the dusk's air over it all: a wash the fight's sky color, dithered off upward)
  const air = dimmed('#B88A88');
  g.save(); g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.42; g.fillStyle = air; g.fillRect(-100, HOR - 170, 1100, 180);
  g.globalAlpha = 1; g.fillStyle = dith(g, air); g.fillRect(-100, y - 70, 1100, 24);
  g.globalAlpha = 0.22; g.fillStyle = mix(air, '#FFFFFF', 0.2); g.fillRect(-100, y - 46, 1100, 50);
  g.restore();
  // (scorch: the pavilions blackened from the foot up, the gauntlet's work)
  g.save(); g.globalCompositeOperation = 'source-atop';
  for (let k = 0; k < 4; k++) { g.globalAlpha = 0.12 + k * 0.06; g.fillStyle = '#1A0E0C'; g.fillRect(-100, y - 40 + k * 10, 1100, 10); }
  g.restore();
  // (the fires along the shore: banded glows, their cores)
  for (const fx of FIRES) { ellR(g, fx, y - 2, 12, 4, dith(g, '#F97316')); ellR(g, fx, y - 2, 6, 2.4, '#FB923C'); box(g, fx - 1, y - 4, 2, 2, '#FDE68A'); }
};

/** A smoke puff, stepped round (shade under, body, lit top), painted once per size and tone. */
const puffs = new Map<string, HTMLCanvasElement>();
const puff = (r: number, tone: number) => {
  const key = `${r}|${tone}`;
  let cv = puffs.get(key);
  if (!cv && typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = cv.height = r * 2 + 4;
    const g = cv.getContext('2d')!;
    const S = [['#1E1416', '#2E2224', '#46383A'], ['#3A2E2E', '#54464A', '#6E6064'], ['#5A4C4E', '#7A6C70', '#9A8C90']][tone];
    const o = r + 2;
    ellR(g, o + 1, o + 2, r, r * 0.78, S[0]); ellR(g, o, o, r * 0.92, r * 0.72, S[1]); ellR(g, o - r * 0.25, o - r * 0.25, r * 0.5, r * 0.36, S[2]);
    g.fillStyle = dith(g, S[0]); g.fillRect(o - r, o + r * 0.3, r * 2, r * 0.4);
    puffs.set(key, cv);
  }
  return cv;
};
/** A column of smoke rolling up off something and away downwind: puffs growing and thinning as they rise. */
const smokeCol = (c: Ctx, x: number, y: number, f: number, seed: number, s: number, a: number, n: number) => {
  // (a third again as many puffs as asked, overlapping into one billow, each wandering off the line a little as it climbs)
  const m = Math.round(n * 1.34);
  for (let k = 0; k < m; k++) {
    const t = ((f * 0.5 + k * (200 / m) + seed * 37) % 200) / 200, r = Math.max(3, Math.round(((4 + t * 26) * s) / 3) * 3);
    const px = x + (Math.sin(t * 4 + seed) * 8 + t * 58 + (hsh(k * 3.7 + seed) - 0.5) * 18 * t) * s, py = y - t * 175 * s, cv = puff(r, t < 0.25 ? 0 : t < 0.6 ? 1 : 2);
    if (!cv) continue;
    c.globalAlpha = a * 0.75 * (1 - t) ** 1.4;
    c.drawImage(cv, Math.round(px - r - 2), Math.round(py - r - 2));
  }
  c.globalAlpha = 1;
};

export const drawSky = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, 800, 600, ['#7F1D1D', '#C2410C', '#FB923C', '#FDE68A'], { horizon: HOR, sun: [620, 110], moon: [170, 90] });
  const f = state.frame, px = (state.camera.x - VIEW_X) * 0.15;
  c.save(); c.translate(-Math.round(px), 0);
  stamp(c, `hh-far2-${timeOfDay().key}`, -100, HOR - 170, 1100, 180, paintFar);
  // (the far fires flicker; a thread of smoke off each pavilion)
  for (const [i, fx] of FIRES.entries()) if (((f >> 3) + i) % 3 === 0) box(c, fx - 2, HOR - 1, 4, 2, '#FDE68A');
  for (const [i, o] of ACROSS.entries()) if (i % 2 === 0) smokeCol(c, o.x - 10, HOR - 6, f * 0.4, i * 1.7, 0.5, 0.5, 4);
  c.restore();
  // (the smoke off the crash, the wrecks and the park: stepped puffs rolling up and off in the wind)
  const sp = (state.camera.x - VIEW_X) * 0.3;
  for (let col = 0; col < 6; col++) smokeCol(c, 70 + col * 140 - sp, HOR + 20, f * 0.6, col * 3.1, 1.6 + (col % 2) * 0.4, 0.5, 8);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Fire (small, banded, flickering: the havoc's tongues)

export const flame = (c: Ctx, x: number, y: number, s: number, f: number, seed = 0) => tongue(c, x, y, s * 1.1, s * 1.9, f, seed);

// ---------------------------------------------------------------------------------------------------------------
// The dig's berm and the nine wrecks on it (painted once for the hour: the fight's shot, 2x for a sharp scale-up)

/** Where each wreck lies on the berm (screen x in the fight's shot, its depth back from the slab, turned how), the
 *  back row first. The Leaning Tower lies flat where it fell, its legs still standing. */
const WRECKS = ([
  { id: 'eiffel', sx: 110, z: -420, yaw: 0.25 }, { id: 'taj', sx: 300, z: -440, yaw: -0.3 }, { id: 'pyramid', sx: 520, z: -460, yaw: 0.45 },
  { id: 'bigben', sx: 680, z: -420, yaw: -0.2 }, { id: 'redeemer', sx: 790, z: -400, yaw: 0.3 },
  { id: 'opera', sx: 160, z: 250, yaw: -0.35 }, { id: 'colosseum', sx: 370, z: 280, yaw: 0.15 }, { id: 'moai', sx: 575, z: 250, yaw: -0.45 },
  { id: 'pisa', sx: 700, z: 240, yaw: 0.1 },
] as { id: MechId; sx: number; z: number; yaw: number }[]).map(w => ({ ...w, g: groundAt(w.sx, w.z) }));

let cache: { c: HTMLCanvasElement; key: string } | null = null;
const crest = (x: number, base: number, a: number) => base + Math.sin(x * 0.03) * a + Math.sin(x * 0.071 + 1) * a * 0.6;
const paintBerm = (g: Ctx) => {
  const D = ramp6(hour('#7C5A3C')), R = ramp6(hour('#8A7A68'));
  // (the far bank: dirt in strata, its crest lit, dithered down into it; rubble and rebar in it)
  g.fillStyle = D[2]; g.beginPath(); g.moveTo(0, 560); for (let x = 0; x <= 800; x += 10) g.lineTo(x, crest(x, 432, 5)); g.lineTo(800, 560); g.closePath(); g.fill();
  for (let x = 0; x < 800; x += 2) { const y = crest(x, 432, 5); box(g, x, y, 2, 1, D[4]); if (x % 4 === 0) box(g, x, y + 2, 1, 1, D[3]); box(g, x, y + 8 + Math.sin(x * 0.05) * 2, 2, 1, (x >> 1) % 2 ? D[1] : D[2]); }
  g.fillStyle = dith(g, D[3]); g.fillRect(0, 440, 800, 6);
  for (let i = 0; i < 46; i++) { const x = (i * 97) % 800, y = crest(x, 438, 5) + ((i * 53) % 18); box(g, x, y, 4 + (i % 3) * 3, 3, i % 4 ? R[2] : R[3]); box(g, x, y, 2, 1, R[4]); }
  // (the back row of wrecks: the heli's 3D wrecks through the scene's eye, at 2x)
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const w of WRECKS.slice(0, 5)) drawWreck3d(g, camAt(2), w.id, { x: w.g.x, z: w.z }, w.yaw);
  g.restore();
  // (the near bank, in front of them: its crest, strata, clods, a tire, survey stakes with their pink ribbons, rebar)
  g.fillStyle = D[1]; g.beginPath(); g.moveTo(0, 560); for (let x = 0; x <= 800; x += 10) g.lineTo(x, crest(x + 300, 462, 4)); g.lineTo(800, 560); g.closePath(); g.fill();
  for (let x = 0; x < 800; x += 2) { const y = crest(x + 300, 462, 4); box(g, x, y, 2, 1, D[3]); box(g, x, y + 1, 2, 1, dith(g, D[2]) as unknown as string); box(g, x, y + 14 + Math.sin(x * 0.04) * 3, 2, 1, D[0]); }
  g.fillStyle = dith(g, D[0]); g.fillRect(0, 484, 800, 10);
  for (let i = 0; i < 40; i++) { const x = (i * 71 + 13) % 800, y = crest(x + 300, 466, 4) + ((i * 29) % 22); box(g, x - 1, y - 1, 5 + (i % 3) * 2, 4, D[0]); box(g, x, y, 3 + (i % 3) * 2, 2, i % 3 ? D[3] : R[3]); }
  for (const [x, l] of [[60, 22], [250, 16], [430, 26], [610, 18], [760, 20]] as const) {
    const y = crest(x + 300, 464, 4);
    lineR(g, [x, y + 4, x + 6, y - l], 2.4, '#3A1A0C'); lineR(g, [x, y + 4, x + 6, y - l], 1.2, '#9A3412'); lineR(g, [x + 6, y - l, x + 10, y - l - 4], 1.2, '#9A3412');
  }
  for (const [x, h] of [[200, 18], [520, 22]] as const) {
    const y = crest(x + 300, 466, 4);
    box(g, x - 1, y - h, 4, h + 2, '#2A1A0C'); box(g, x, y - h, 2, h, '#C8A27A'); box(g, x - 3, y - h + 2, 8, 3, '#EC4899'); box(g, x + 4, y - h + 3, 4, 2, '#F9A8D4');
  }
  ellR(g, 330, crest(630, 470, 4), 13, 6, '#121214'); ellR(g, 330, crest(630, 470, 4), 10, 4, '#2A2A30'); ellR(g, 330, crest(630, 470, 4), 4, 1.6, D[1]);
  // (the front row of wrecks, down the near bank)
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const w of WRECKS.slice(5)) drawWreck3d(g, camAt(2), w.id, { x: w.g.x, z: w.z }, w.yaw);
  g.restore();
  // (the bank's foot: in shade where it meets the slab's back edge)
  g.fillStyle = dith(g, D[0]); g.fillRect(0, 486, 800, 8); box(g, 0, 490, 800, 6, D[0]);
};
/** The berm and the wrecks, world space (the shot's top-left at VIEW_X, sy(0)); their smoke and fires live. */
const drawBerm = (c: Ctx, state: GameState) => {
  // (painted again only if the hour's changed: a new visit)
  const key = timeOfDay().key;
  if (typeof document !== 'undefined' && (!cache || cache.key !== key)) {
    const cv = cache?.c ?? document.createElement('canvas');
    cv.width = 1600; cv.height = 1200;
    const g = cv.getContext('2d')!;
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 800, 600);
    paintBerm(g);
    cache = { c: cv, key };
  }
  if (cache) c.drawImage(cache.c, VIEW_X, sy(0), 800, 600);
  // (each wreck's smoke rolling up off it, the fire at its foot, scaled for how far back it lies)
  for (const w of WRECKS) {
    c.save(); c.translate(VIEW_X + w.g.sx, sy(w.g.sy)); c.scale(w.g.k * 0.9, w.g.k * 0.9);
    wreckSmoke(c, state.frame + w.sx);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor: the trampled approach, the poured slab (the joints to the eye), the lit lip he stands on

const floor = (c: Ctx, state: GameState) => {
  const v = viewIn(state), a = Math.max(x0 - 200, v.cam.x - 40), b = v.cam.x + 840;
  const ex = state.camera.x + 400, horY = sy(HOR), back = 26 / (GY - horY);
  const S = ramp6(hour('#A8A29E')), D = ramp6(hour('#7C5A3C'));
  // (the approach: trampled dirt going back, coming on toward him in steps darker; tire tracks; pebbles)
  box(c, a, GY - 22, b - a, 22, D[3]); box(c, a, GY - 22, b - a, 4, dith(c, D[4]) as unknown as string); box(c, a, GY - 22, b - a, 1, D[4]);
  box(c, a, GY, b - a, 120, D[2]); box(c, a, GY + 26, b - a, 8, dith(c, D[1]) as unknown as string); box(c, a, GY + 34, b - a, 90, D[1]); box(c, a, GY + 62, b - a, 6, dith(c, D[0]) as unknown as string); box(c, a, GY + 68, b - a, 60, D[0]);
  // (the dirt's grit: clods lit, pits dark; one patterned fill)
  const dg = grit(c, D[0], D[4]);
  if (dg) { c.fillStyle = dg; c.fillRect(a, GY - 22, b - a, 142); }
  const s0 = Math.max(a, ARENA_L - WALL_W), s1 = Math.min(b, ARENA_R + WALL_W);
  for (const ty of [GY + 14, GY + 44]) for (let x = Math.ceil(a / 8) * 8; x < Math.min(b, ARENA_L - WALL_W); x += 8) { box(c, x, ty, 6, 5, D[0]); box(c, x, ty, 6, 1, D[1]); }
  for (let x = Math.ceil(a / 23) * 23; x < Math.min(b, ARENA_L - WALL_W); x += 23) { const y = GY - 18 + hsh(x) * 16, y2 = GY + 6 + hsh(x * 1.7) * 60; box(c, x, y, 3, 2, D[4]); box(c, x + 9, y2, 3, 2, D[3]); box(c, x + 9, y2 + 2, 3, 1, D[0]); }
  if (s1 > s0) {
    // (its poured ends against the dirt run back to the eye and on toward him like the joints do (one rule for both:
    // `fan`), never a square cut down the screen; only where an end's really there, not where the screen cuts it)
    const fan = (x: number, y: number) => x + (x - ex) * (y - GY) / (GY - horY);
    const fL = s0 === ARENA_L - WALL_W, fR = s1 === ARENA_R + WALL_W;
    const eL = (y: number) => (fL ? fan(s0, y) : s0), eR = (y: number) => (fR ? fan(s1, y) : s1);
    const w0 = Math.min(s0, eL(GY + 120)), w1 = Math.max(s1, eR(GY + 120)), sw = w1 - w0;
    c.save(); c.beginPath(); c.moveTo(eL(GY - 26), GY - 26); c.lineTo(eR(GY - 26), GY - 26); c.lineTo(eR(GY + 120), GY + 120); c.lineTo(eL(GY + 120), GY + 120); c.closePath(); c.clip();
    // (the slab's top going back: lit, hazier toward the back; a dithered step; its far edge)
    box(c, w0, GY - 26, sw, 26, S[3]); box(c, w0, GY - 26, sw, 6, dith(c, S[4]) as unknown as string); box(c, w0, GY - 26, sw, 1, S[5]);
    box(c, w0, GY - 13, sw, 1, S[2]);
    // (coming on toward him: a step darker, the near rows darker again)
    box(c, w0, GY, sw, 120, S[2]); box(c, w0, GY + 30, sw, 8, dith(c, S[1]) as unknown as string); box(c, w0, GY + 38, sw, 90, S[1]); box(c, w0, GY + 70, sw, 8, dith(c, S[0]) as unknown as string);
    box(c, w0, GY + 36, sw, 1, S[0]); box(c, w0, GY + 37, sw, 1, S[3]);
    // (the pour's aggregate: stones lit, pits dark; one patterned fill over the lot)
    const sg = grit(c, S[1], S[4]);
    if (sg) { c.fillStyle = sg; c.fillRect(w0, GY - 26, sw, 146); }
    // (the joints: sawn every 120, going back to the eye and coming on toward him, each a dark cut with a lit lip)
    for (let x = Math.ceil(s0 / 120) * 120; x < s1; x += 120) {
      const bx = x + (ex - x) * back, nx = x + (x - ex) * (80 / (GY - horY));
      lineR(c, [x, GY, bx, GY - 26], 1, S[0], 'butt'); lineR(c, [x + 1, GY, bx + 1, GY - 26], 1, S[4], 'butt');
      lineR(c, [x, GY + 1, nx, GY + 80], 1.2, S[0], 'butt'); lineR(c, [x + 1.4, GY + 1, nx + 1.4, GY + 80], 1, S[3], 'butt');
    }
    // (what's happened on it: cracks, scorch, the surveyors' paint, an oil stain; set once, by place)
    for (let i = 0; i < 14; i++) {
      const cx = ARENA_L + 30 + hsh(i * 3.3) * (ARENA_R - ARENA_L - 60);
      if (cx < s0 || cx > s1) continue;
      const cy = GY + 6 + hsh(i * 7.7) * 64, k = i % 4;
      if (k === 0) { c.strokeStyle = S[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 9, cy + 3); c.lineTo(cx + 14, cy + 1); c.lineTo(cx + 22, cy + 6); c.stroke(); c.strokeStyle = S[4]; c.beginPath(); c.moveTo(cx, cy + 1); c.lineTo(cx + 9, cy + 4); c.stroke(); }
      else if (k === 1) { ellR(c, cx, cy, 26, 5, dith(c, 'rgba(28, 25, 23, 0.6)')); ellR(c, cx, cy, 15, 3, 'rgba(28, 25, 23, 0.45)'); }
      else if (k === 2) { box(c, cx - 5, cy - 1, 10, 2, '#F472B6'); box(c, cx - 1, cy - 5, 2, 10, '#F472B6'); box(c, cx + 8, cy, 8, 1, '#60A5FA'); }
      else { ellR(c, cx, cy, 10, 2.6, 'rgba(12, 10, 14, 0.5)'); box(c, cx - 4, cy - 1, 3, 1, 'rgba(160, 140, 220, 0.6)'); }
    }
    c.restore();
    // (the slab's poured ends against the dirt: its edge, inked along the same line)
    if (fL) lineR(c, [eL(GY - 26), GY - 26, eL(GY + 120), GY + 120], 2, S[0], 'butt');
    if (fR) lineR(c, [eR(GY - 26), GY - 26, eR(GY + 120), GY + 120], 2, S[0], 'butt');
  }
  // (the lit lip: the line he stands on)
  box(c, a, GY, b - a, 3, LIP[2]); box(c, a, GY, b - a, 1, LIP[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// The scaffold towers and the gate

/** Galvanized scaffold pipe, vertical or across: inked, its base, a lit stripe, its shade. */
const pipeV = (c: Ctx, x: number, y0: number, y1: number) => { box(c, x - 1, y0, 6, y1 - y0, INK); box(c, x, y0, 4, y1 - y0, '#8A8F98'); box(c, x + 1, y0, 1, y1 - y0, '#E4E4E7'); box(c, x + 3, y0, 1, y1 - y0, '#52525B'); };
const pipeH = (c: Ctx, x0b: number, x1b: number, y: number) => { box(c, x0b, y - 1, x1b - x0b, 6, INK); box(c, x0b, y, x1b - x0b, 4, '#8A8F98'); box(c, x0b, y, x1b - x0b, 1, '#E4E4E7'); box(c, x0b, y + 3, x1b - x0b, 1, '#52525B'); };
const coupler = (c: Ctx, x: number, y: number) => { box(c, x - 4, y - 4, 9, 9, INK); box(c, x - 3, y - 3, 7, 7, '#52525B'); box(c, x - 3, y - 3, 7, 1, '#A1A1AA'); box(c, x, y, 2, 2, '#D4D4D8'); };

/** The gate's chain-link panel (local: its foot's left end at (0, 0)), `w` wide, 150 tall: its galvanized frame, the
 *  mesh's wires lit one way and dark the other, a padlock, a warning placard zip-tied on. */
const panel = (c: Ctx, w: number) => {
  box(c, 0, -150, w, 150, 'rgba(40, 40, 46, 0.55)');
  c.save(); c.beginPath(); c.rect(0, -150, w, 150); c.clip();
  c.lineWidth = 1;
  c.strokeStyle = '#3F3F46'; c.beginPath(); for (let k = -150; k < w; k += 8) { c.moveTo(k + 1, -150); c.lineTo(k + 151, 0); } c.stroke();
  c.strokeStyle = '#D4D4D8'; c.beginPath(); for (let k = -150; k < w; k += 8) { c.moveTo(k, -150); c.lineTo(k + 150, 0); } c.stroke();
  c.strokeStyle = '#71717A'; c.beginPath(); for (let k = -150; k < w; k += 8) { c.moveTo(k + 150, -150); c.lineTo(k, 0); } c.stroke();
  c.restore();
  for (const [x, y, ww, hh] of [[0, -150, 4, 150], [w - 4, -150, 4, 150], [0, -150, w, 4], [0, -76, w, 3], [0, -4, w, 4]] as const) { box(c, x, y, ww, hh, INK); box(c, x + 0.5, y + 0.5, ww - 1, hh - 1, '#9CA3AF'); box(c, x + 0.5, y + 0.5, Math.min(1, ww - 1), hh - 1, '#E4E4E7'); box(c, x + 0.5, y + 0.5, ww - 1, Math.min(1, hh - 1), '#E4E4E7'); }
  // (the chain round the frame, the padlock: brass, its shackle)
  for (let k = 0; k < 4; k++) { ellR(c, w / 2 - 6 + k * 4, -76, 2.4, 1.6, INK); ellR(c, w / 2 - 6 + k * 4, -76, 1.6, 0.9, '#A1A1AA'); }
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, -82, 4, Math.PI, 0); c.stroke(); c.strokeStyle = '#D4D4D8'; c.lineWidth = 1.4; c.stroke();
  shapeR(c, () => c.roundRect(w / 2 - 6, -82, 12, 12, 2), ['#FEF3A0', '#CA8A04', '#A16207', '#713F12', '#2A1802'], w / 2 - 6, w / 2 + 6, 1);
  box(c, w / 2 - 1, -77, 2, 3, INK);
  // (the placard, zip-tied on: a warning triangle)
  c.fillStyle = INK; c.beginPath(); c.moveTo(w / 2, -134); c.lineTo(w / 2 + 13, -112); c.lineTo(w / 2 - 13, -112); c.closePath(); c.fill();
  c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(w / 2, -131); c.lineTo(w / 2 + 10, -114); c.lineTo(w / 2 - 10, -114); c.closePath(); c.fill();
  c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(w / 2 + 3, -126); c.lineTo(w / 2 + 10, -114); c.lineTo(w / 2 + 3, -114); c.closePath(); c.fill();
  c.fillStyle = '#FEF08A'; c.beginPath(); c.moveTo(w / 2, -131); c.lineTo(w / 2 - 10, -114); c.lineTo(w / 2 - 8, -114); c.lineTo(w / 2, -128); c.closePath(); c.fill();
  box(c, w / 2 - 1, -127, 2, 7, INK); box(c, w / 2 - 1, -118, 2, 2, INK);
  box(c, w / 2 - 12, -112, 2, 2, '#F8FAFC'); box(c, w / 2 + 10, -112, 2, 2, '#F8FAFC');
};
/** A scaffold tower's still part (all but the gate), painted once for the hour into a stamp: plywood hoarding to the
 *  top of the shot (a wall: its face toward the floor at `side`), what's painted on it, the scaffold out front. */
const towerStill = (c: Ctx, xa: number, side: 1 | -1) => {
  const P = ramp6(hour('#B08B5A')), top = sy(-40);
  box(c, xa - 2, top, WALL_W + 4, GY - top, INK);
  // (the hoarding: 4x8 plywood sheets in steps (the grain, a knot, the screws, the lit edge, the shaded edge), seams)
  for (let y = GY - 120, n = 0; y > top - 120; y -= 120, n++) {
    const y0 = Math.max(top, y), h = y + 120 - y0;
    if (h <= 0) continue;
    box(c, xa, y0, WALL_W, h, P[3]);
    for (let k = 0; k < 6; k++) { const gx = xa + 6 + k * 8 + Math.sin(n + k) * 2; for (let yy = y0 + 2; yy < y0 + h - 2; yy += 6) box(c, gx + Math.sin(yy * 0.07 + k) * 1.4, yy, 1, 4, (k + n) % 2 ? P[2] : P[4]); }
    if (n % 3 === 1) { ellR(c, xa + 30, y0 + h * 0.5, 4, 2.6, P[1]); ellR(c, xa + 30, y0 + h * 0.5, 2, 1.2, P[0]); }
    for (let yy = y0 + 8; yy < y0 + h; yy += 24) { box(c, xa + 3, yy, 1, 1, P[0]); box(c, xa + WALL_W - 4, yy, 1, 1, P[0]); }
    // (the weather's on it: a water stain darkening up from each sheet's foot, dithered off)
    box(c, xa, y0 + h - 10, WALL_W, 6, dith(c, P[2]) as unknown as string); box(c, xa, y0 + h - 4, WALL_W, 2, P[2]);
    box(c, xa, y0, WALL_W, 2, P[1]); box(c, xa, y0 + 2, WALL_W, 1, P[4]);
  }
  box(c, side > 0 ? xa + WALL_W - 3 : xa, top, 3, GY - top, P[4]);
  box(c, side > 0 ? xa : xa + WALL_W - 4, top, 4, GY - top, P[1]); box(c, side > 0 ? xa + 4 : xa + WALL_W - 6, top, 2, GY - top, dith(c, P[1]) as unknown as string);
  // (Old Glory painted on the hoarding up top, by a roller, weathered: stripes in steps (a lit top, a shaded foot), the
  // canton's stars, the grain showing back through, chips down to bare ply, runs off the bottom stripe)
  const fx0 = xa + 2, fy0 = top + 30, fw = WALL_W - 4, Rd = ramp6(hour('#B91C1C')), Wh = ramp6(hour('#F1F5F9')), Bl = ramp6(hour('#1E3A8A'));
  for (let k = 0; k < 7; k++) { const R = k % 2 ? Wh : Rd, y = fy0 + k * 8; box(c, fx0, y, fw, 8, R[3]); box(c, fx0, y, fw, 1, R[4]); box(c, fx0, y + 7, fw, 1, R[2]); }
  box(c, fx0, fy0, 22, 26, Bl[2]); box(c, fx0, fy0, 22, 1, Bl[3]); box(c, fx0, fy0, 1, 26, Bl[3]); box(c, fx0 + 21, fy0, 1, 26, Bl[1]); box(c, fx0, fy0 + 25, 22, 1, Bl[1]);
  for (let k = 0; k < 9; k++) { const sx2 = fx0 + 4 + (k % 3) * 7, sy2 = fy0 + 4 + Math.floor(k / 3) * 8; box(c, sx2, sy2 - 1, 1, 3, Wh[4]); box(c, sx2 - 1, sy2, 3, 1, Wh[4]); box(c, sx2, sy2, 1, 1, Wh[5]); }
  c.save(); c.globalAlpha = 0.35;
  for (let k = 0; k < 6; k++) { const gx = xa + 6 + k * 8; for (let yy = fy0; yy < fy0 + 56; yy += 6) box(c, gx + Math.sin(yy * 0.07 + k) * 1.4, yy, 1, 4, P[2]); }
  c.restore();
  for (let i = 0; i < 16; i++) { const cx = fx0 + Math.floor(hsh(i * 4.1 + xa) * (fw - 4)), cy = fy0 + Math.floor(hsh(i * 9.3 + xa) * 54), w = 2 + (i % 3); box(c, cx, cy, w, 1 + (i % 2), P[3]); box(c, cx, cy, w, 1, P[4]); }
  for (let i = 0; i < 5; i++) { const rx = fx0 + 6 + Math.floor(hsh(i * 7.7 + xa) * (fw - 12)), l = 3 + (i % 3) * 2; box(c, rx, fy0 + 56, 1, l, Rd[2]); box(c, rx, fy0 + 56 + l, 1, 1, Rd[1]); }
  box(c, fx0, fy0 + 56, fw, 1, P[1]);
  // (a big stencilled star: its shadow edge, the stencil's ties left bare across its arms, sprayed thin at the edges)
  const sx0 = xa + WALL_W / 2, sty = GY - 260;
  const starPath = (dx: number, dy: number) => { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 7 : 17; c[k ? 'lineTo' : 'moveTo'](sx0 + dx + Math.cos(a) * rr, sty + dy + Math.sin(a) * rr); } c.closePath(); };
  starPath(1, 1); c.fillStyle = P[1]; c.fill();
  starPath(0, 0); c.fillStyle = Wh[3]; c.fill();
  c.save(); starPath(0, 0); c.clip();
  box(c, sx0 - 18, sty - 18, 36, 6, Wh[4]); box(c, sx0 + 2, sty - 2, 18, 20, Wh[2]); box(c, sx0 - 18, sty + 6, 36, 12, dith(c, Wh[2]) as unknown as string);
  box(c, sx0 - 1, sty - 18, 2, 7, P[3]); box(c, sx0 - 18, sty - 3, 8, 2, P[3]); box(c, sx0 + 10, sty - 3, 8, 2, P[3]); box(c, sx0 - 12, sty + 8, 6, 2, P[3]); box(c, sx0 + 6, sty + 8, 6, 2, P[3]);
  for (let i = 0; i < 8; i++) box(c, sx0 - 14 + Math.floor(hsh(i * 3.9 + xa) * 28), sty - 12 + Math.floor(hsh(i * 6.1 + xa) * 26), 2, 1, dith(c, P[3]) as unknown as string);
  c.restore();
  // (the hazard tape, round it at waist height: black and yellow chevrons, its lit top edge, its shaded foot)
  const ty = GY - 46;
  box(c, xa, ty - 1, WALL_W, 9, INK); box(c, xa, ty, WALL_W, 7, '#FACC15');
  c.save(); c.beginPath(); c.rect(xa, ty, WALL_W, 7); c.clip(); c.fillStyle = '#1C1917';
  for (let k = xa - 8; k < xa + WALL_W; k += 10) { c.beginPath(); c.moveTo(k, ty + 7); c.lineTo(k + 5, ty); c.lineTo(k + 10, ty); c.lineTo(k + 5, ty + 7); c.closePath(); c.fill(); }
  c.restore();
  box(c, xa, ty, WALL_W, 1, '#FEF08A'); box(c, xa, ty + 6, WALL_W, 1, dith(c, '#854D0E') as unknown as string);
  // (the scaffold out front: standards, ledgers every 90, couplers, a brace, the planks Harry hangs off (dimmed: no lip))
  const px = side > 0 ? xa + WALL_W - 9 : xa + 4, px2 = side > 0 ? xa + 6 : xa + WALL_W - 10;
  pipeV(c, px, top, GY); pipeV(c, px2, top, GY);
  for (let y = GY - 60; y > top; y -= 90) { pipeH(c, xa, xa + WALL_W, y); coupler(c, px + 2, y + 2); coupler(c, px2 + 2, y + 2); }
  lineR(c, [px + 2, GY - 60, px2 + 2, GY - 150], 5, INK, 'butt'); lineR(c, [px + 2, GY - 60, px2 + 2, GY - 150], 3, '#8A8F98', 'butt'); lineR(c, [px + 1, GY - 61, px2 + 1, GY - 151], 1, '#E4E4E7', 'butt');
  const ply = GY - CLING_H - 6, PL = ramp6(dimmed('#C8A272'));
  box(c, xa - 4, ply - 1, WALL_W + 8, 8, INK); box(c, xa - 3, ply, WALL_W + 6, 6, PL[3]); box(c, xa - 3, ply, WALL_W + 6, 1, PL[4]); box(c, xa - 3, ply + 4, WALL_W + 6, 2, PL[1]);
  for (let k = xa; k < xa + WALL_W; k += 14) { box(c, k, ply, 1, 6, PL[1]); box(c, k + 6, ply + 2, 3, 1, PL[2]); }
  for (const ex2 of [xa - 3, xa + WALL_W + 1]) { box(c, ex2, ply, 2, 6, PL[2]); box(c, ex2, ply + 1, 2, 1, PL[0]); }
  // (the base plates on the slab)
  for (const p0 of [px, px2]) { box(c, p0 - 4, GY - 3, 12, 3, INK); box(c, p0 - 3, GY - 3, 10, 2, '#71717A'); box(c, p0 - 3, GY - 3, 10, 1, '#A1A1AA'); }
  // (the right tower: DANGER, the dig behind it: an enamel plate bolted to the ply, its red header stepped, a chip or
  // two down to the steel, rust weeping from its bolts)
  if (side > 0) {
    const bx = xa + 6, by = GY - 128, bw = WALL_W - 12, bh = 28;
    box(c, bx - 1, by - 1, bw + 2, bh + 2, INK); box(c, bx, by, bw, bh, '#E7E5E4');
    box(c, bx, by, bw, 1, '#FFFFFF'); box(c, bx, by, 1, bh, '#FFFFFF'); box(c, bx + bw - 1, by, 1, bh, '#A8A29E'); box(c, bx, by + bh - 1, bw, 1, '#A8A29E');
    box(c, bx + 2, by + 2, bw - 4, 11, '#B91C1C'); box(c, bx + 2, by + 2, bw - 4, 1, '#EF4444'); box(c, bx + 2, by + 12, bw - 4, 1, '#7F1D1D');
    box(c, bx + 2, by + 13, bw - 4, 1, INK);
    for (const [qx, qy] of [[bx + 1, by + 1], [bx + bw - 3, by + 1], [bx + 1, by + bh - 3], [bx + bw - 3, by + bh - 3]] as const) { box(c, qx, qy, 2, 2, '#44403C'); box(c, qx, qy, 1, 1, '#D6D3D1'); }
    for (const qx of [bx + 1, bx + bw - 3]) { box(c, qx, by + bh + 1, 2, 5, dith(c, '#9A3412') as unknown as string); box(c, qx, by + bh + 1, 2, 1, '#7C2D12'); }
    box(c, bx + bw - 9, by + bh - 5, 3, 2, '#57534E'); box(c, bx + 4, by + 16, 2, 1, '#78716C');
    signText(c, 'DANGER', bx + bw / 2, by + 10, { sx: 1, sy: 1, fill: '#FFFFFF', shadow: '#450A0A', drop: 1 });
    signText(c, 'DIG', bx + bw / 2, by + 24, { sx: 1, sy: 1, fill: '#1A0B06', bold: true, gap: 1 });
  }
};
export type GateLook = { kind: 'none' | 'open' | 'standing' | 'down' } | { kind: 'falling'; k: number };
/** A scaffold tower (stamped: towerStill) and, at its foot, the gate (live: it moves). */
const tower = (c: Ctx, xa: number, side: 1 | -1, gate: GateLook, f: number) => {
  const top = sy(-40);
  stamp(c, `hh-tower-${side}-${timeOfDay().key}`, xa - 10, top - 2, WALL_W + 20, GY - top + 4, g => towerStill(g, xa, side));
  // (the gate: a chain-link panel in the doorway at the foot of it: shut, padlocked, till he kicks it in)
  if (gate.kind !== 'none') {
    const gy0 = GY - 150;
    pipeH(c, xa - 2, xa + WALL_W + 2, gy0 - 5);
    // (the doorway: the tower's inside, dark, the hoarding's back in it, a slot of light from the far side)
    box(c, xa + 2, gy0, WALL_W - 4, 150, '#1C1917'); box(c, xa + 2, gy0, 3, 150, '#27272A'); box(c, xa + 2, gy0, WALL_W - 4, 2, '#0C0A09');
    box(c, xa + 10, gy0 + 6, 2, 144, '#2A221C'); box(c, xa + 40, gy0 + 6, 2, 144, '#2A221C'); box(c, xa + WALL_W - 6, gy0 + 4, 2, 146, dith(c, '#57534E') as unknown as string);
    if (gate.kind === 'standing') { c.save(); c.translate(xa, GY); panel(c, WALL_W); c.restore(); }
    if (gate.kind === 'falling') { c.save(); c.translate(xa + WALL_W, GY); c.rotate(gate.k * gate.k * Math.PI / 2); c.translate(-WALL_W, 0); panel(c, WALL_W); c.restore(); }
    if (gate.kind === 'down') {
      // (kicked in: knocked flat, lying on the slab just inside, buckled, its padlock still on it. The way back's shut
      // in the fight all the same: the fight's own wall, not this)
      const g0 = xa + WALL_W + 4, g1 = g0 + 150, lift = (x: number) => (x - g0 < 30 ? (30 - (x - g0)) * 0.25 : 0);
      c.fillStyle = 'rgba(28, 28, 32, 0.5)'; c.beginPath(); c.moveTo(g0 + 6, GY + 6); c.lineTo(g1 + 8, GY + 6); c.lineTo(g1 + 4, GY + 9); c.lineTo(g0 + 4, GY + 9); c.closePath(); c.fill();
      c.fillStyle = 'rgba(63, 63, 70, 0.7)';
      c.beginPath(); c.moveTo(g0, GY - 2 - lift(g0)); c.lineTo(g1, GY - 2); c.lineTo(g1 + 6, GY + 5); c.lineTo(g0 + 6, GY + 5 - lift(g0)); c.closePath(); c.fill();
      c.lineWidth = 1;
      for (let x = g0; x < g1; x += 7) { c.strokeStyle = '#D4D4D8'; c.beginPath(); c.moveTo(x, GY - 2 - lift(x)); c.lineTo(x + 6, GY + 5 - lift(x)); c.stroke(); c.strokeStyle = '#71717A'; c.beginPath(); c.moveTo(x + 6, GY - 2 - lift(x)); c.lineTo(x, GY + 5 - lift(x)); c.stroke(); }
      for (const [x, y, w] of [[g0, GY - 4 - lift(g0), 4], [g1 - 2, GY - 3, 4], [g0 + 72, GY - 3, 3]] as const) { box(c, x - 1, y - 1, w + 2, 9, INK); box(c, x, y, w, 7, '#9CA3AF'); box(c, x, y, 1, 7, '#E4E4E7'); }
      box(c, g0, GY - 4, g1 - g0, 2, INK); box(c, g0, GY - 3.6, g1 - g0, 1, '#E4E4E7'); box(c, g0 + 4, GY + 4, g1 - g0, 2, INK); box(c, g0 + 4, GY + 4, g1 - g0, 1, '#9CA3AF');
      shapeR(c, () => c.roundRect(g0 + 68, GY - 8, 11, 9, 2), ['#FEF3A0', '#CA8A04', '#A16207', '#713F12', '#2A1802'], g0 + 68, g0 + 79, 1);
      c.strokeStyle = '#D4D4D8'; c.lineWidth = 1.4; c.beginPath(); c.arc(g0 + 73.5, GY - 9, 3.4, Math.PI, 0); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.moveTo(g0 + 110, GY - 1); c.lineTo(g0 + 124, GY - 1); c.lineTo(g0 + 120, GY + 5); c.lineTo(g0 + 106, GY + 5); c.closePath(); c.fill();
      c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(g0 + 111, GY); c.lineTo(g0 + 122, GY); c.lineTo(g0 + 119, GY + 4); c.lineTo(g0 + 108, GY + 4); c.closePath(); c.fill();
    }
  }
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// The crash, the pavilion going up, its sign

/** The helicopter where it came down: on its side in its crater, burning; a rotor blade snapped off and stuck in the
 *  dirt, bits of it about (a red seat cushion, a door, the peace-sign bobblehead off the dash). */
const crash = (c: Ctx, f: number) => {
  const D = ramp6(hour('#7C5A3C'));
  // (the crater: its thrown-up rim in steps, scorched inside, embers)
  ellR(c, WRECK_X, GY - 2, 146, 22, dith(c, D[1]));
  ellR(c, WRECK_X, GY - 2, 134, 18, D[1]); ellR(c, WRECK_X, GY - 1, 124, 15, '#2A1E16'); ellR(c, WRECK_X, GY, 110, 11, dith(c, '#120C08'));
  ellR(c, WRECK_X, GY, 92, 8, '#120C08');
  c.strokeStyle = D[4]; c.lineWidth = 1.4; c.beginPath(); c.ellipse(WRECK_X, GY - 2, 134, 18, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  for (let i = 0; i < 9; i++) { const ax = WRECK_X - 120 + i * 30, ay = GY + 10 + (i % 3) * 3; box(c, ax - 1, ay - 1, 9, 5, INK); box(c, ax, ay, 7, 3, D[3]); box(c, ax, ay, 7, 1, D[4]); }
  for (let i = 0; i < 6; i++) if (((f >> 2) + i * 3) % 7 < 4) box(c, WRECK_X - 70 + i * 26, GY - 1 + (i % 2), 2, 1, i % 2 ? '#FB923C' : '#FDE047');
  // (the helicopter on its side, sooted)
  c.save(); c.filter = 'brightness(0.55) sepia(0.35)';
  const h = { seat: 0, tilt: 0.55, flip: 0, rotor: 0.3 };
  drawCopter(c, 'back', WRECK_X, GY - 34, h, f, { burning: true });
  drawCopter(c, 'front', WRECK_X, GY - 34, h, f, { burning: true });
  c.restore();
  // (a rotor blade snapped off, stuck in the dirt slantwise, its yellow tip)
  c.save(); c.translate(WRECK_X + 168, GY + 2); c.rotate(-0.5);
  box(c, -4, -96, 9, 98, INK); box(c, -3, -95, 7, 96, '#52525B'); box(c, -3, -95, 2, 96, '#A1A1AA'); box(c, 2, -95, 2, 96, '#27272A'); box(c, -3, -95, 7, 12, '#FACC15'); box(c, -3, -95, 2, 12, '#FEF08A');
  c.restore();
  // (the bits: a red vinyl seat cushion, a door off its hinges, the bobblehead)
  shapeR(c, () => c.roundRect(WRECK_X - 156, GY - 9, 24, 9, 3), BAND_R, WRECK_X - 156, WRECK_X - 132, 1);
  c.save(); c.translate(WRECK_X + 112, GY - 4); c.rotate(0.12); shapeR(c, () => c.rect(-18, -6, 36, 8), ['#FFFFFF', '#E9EEF3', '#C5CED8', '#909CAA', '#3E4652'], -18, 18, 1); box(c, -14, -5, 12, 5, '#3B6AB0'); c.restore();
  ellR(c, WRECK_X + 136, GY - 5, 3.6, 4, '#E3AE86'); box(c, WRECK_X + 134, GY - 2, 4, 3, '#22C55E'); box(c, WRECK_X + 133, GY - 10, 6, 2, '#F8FAFC');
  // (its fires: banded tongues licking up out of it; the smoke rolling off)
  tongue(c, WRECK_X - 40, GY - 18, 26, 44, f, 1); tongue(c, WRECK_X + 30, GY - 44, 20, 36, f, 2); tongue(c, WRECK_X + 92, GY - 8, 14, 24, f, 3); tongue(c, WRECK_X - 90, GY - 6, 12, 20, f, 4);
  smokeCol(c, WRECK_X - 20, GY - 60, f, 2, 1.2, 0.55, 7); smokeCol(c, WRECK_X + 40, GY - 70, f, 5, 0.9, 0.5, 6);
};

/** The AMERICA pavilion going up behind the approach (set back: scenery, dimmed): its steel frame in red primer, three
 *  floors of it, a deck or two poured, a tower crane over it with the flag on its jib. Drawn through the scene's eye. */
const PAV_X = X(30), PAV_W = 480, PAV_D = 0.86;
const pavilion = (c: Ctx, state: GameState) => {
  const v = viewIn(state);
  if (!onScreen(v, PAV_X - 260, PAV_X + PAV_W + 120, PAV_D)) return;
  atDepth(c, v.eye, PAV_D, () => stamp(c, `hh-pav-${timeOfDay().key}`, PAV_X - 260, GY - 540, PAV_W + 380, 544, (g) => {
    const R = ramp6(dimmed('#9A3A22')), C = ramp6(dimmed('#9C948A')), Y = ramp6(dimmed('#E0A82E'));
    // (the shoring under the decks: timber props every 24 on their sole plates, the formwork's ply soffit along the
    // deck's underside; the props cross-braced)
    const Wd = ramp6(dimmed('#B08B5A'));
    for (const [y0, y1, w] of [[GY - 100, GY, PAV_W], [GY - 210, GY - 112, PAV_W * 0.66]] as const) {
      for (let x = PAV_X + 12; x < PAV_X + w - 6; x += 24) { box(g, x - 1, y0, 4, y1 - y0, INK); box(g, x, y0, 2, y1 - y0, Wd[2]); box(g, x, y0, 1, y1 - y0, Wd[4]); box(g, x - 3, y1 - 3, 8, 3, Wd[1]); }
      for (let x = PAV_X + 12; x < PAV_X + w - 30; x += 48) lineR(g, [x + 1, y1 - 6, x + 25, y0 + 6], 1, Wd[1]);
      box(g, PAV_X, y0 - 3, w, 3, Wd[3]); box(g, PAV_X, y0 - 1, w, 1, Wd[1]);
    }
    // (the floors poured: two concrete decks, in steps: the lit edge, the face with its aggregate, the shaded foot,
    // the form-tie holes along it)
    for (const [y, w] of [[GY - 110, PAV_W], [GY - 220, PAV_W * 0.66]] as const) {
      box(g, PAV_X - 2, y - 1, w + 4, 12, INK); box(g, PAV_X, y, w, 10, C[3]); box(g, PAV_X, y, w, 1, C[5]); box(g, PAV_X, y + 1, w, 1, C[4]);
      box(g, PAV_X, y + 6, w, 1, dith(g, C[2]) as unknown as string); box(g, PAV_X, y + 7, w, 3, C[1]);
      for (let x = PAV_X + 3; x < PAV_X + w - 2; x += 5) { box(g, x + Math.floor(hsh(x) * 3), y + 3 + Math.floor(hsh(x * 1.3) * 3), 1, 1, (x / 5) % 2 ? C[2] : C[4]); }
      for (let x = PAV_X + 10; x < PAV_X + w; x += 20) box(g, x, y + 4, 1, 1, C[0]);
      for (let x = PAV_X + 40; x < PAV_X + w; x += 80) { box(g, x, y, 1, 10, C[1]); box(g, x + 1, y, 1, 10, C[4]); }
    }
    // (the safety netting round the top deck's open bay: orange mesh, sagging between the columns)
    const NT = dimmed('#F97316');
    box(g, PAV_X + 4, GY - 326, PAV_W * 0.5 - 8, 100, dith(g, NT) as unknown as string);
    for (let x = PAV_X + 4; x < PAV_X + PAV_W * 0.5 - 4; x += 6) box(g, x, GY - 326, 1, 100, mix(NT, '#000000', 0.25));
    for (let y = GY - 326; y < GY - 226; y += 6) box(g, PAV_X + 4, y, PAV_W * 0.5 - 8, 1, mix(NT, '#000000', 0.25));
    box(g, PAV_X + 4, GY - 326, PAV_W * 0.5 - 8, 2, mix(NT, '#FFFFFF', 0.3));
    // (the columns and the girders: I-beams in red primer, their flanges lit, bolted, the splice plates)
    for (let k = 0; k <= 4; k++) {
      const cx = PAV_X + k * (PAV_W / 4), h = k < 3 ? 330 : 220;
      box(g, cx - 5, GY - h, 10, h, INK); box(g, cx - 4, GY - h, 8, h, R[2]); box(g, cx - 4, GY - h, 2, h, R[4]); box(g, cx + 2, GY - h, 2, h, R[1]);
      box(g, cx - 1, GY - h, 1, h, dith(g, R[1]) as unknown as string);
      for (const sy2 of [GY - 60, GY - 170, GY - 280]) {
        if (sy2 < GY - h + 10) continue;
        box(g, cx - 6, sy2 - 8, 12, 16, INK); box(g, cx - 5, sy2 - 7, 10, 14, R[3]); box(g, cx - 5, sy2 - 7, 10, 1, R[5]);
        for (const [bx2, by2] of [[-3, -4], [2, -4], [-3, 3], [2, 3]] as const) { box(g, cx + bx2, sy2 + by2, 2, 2, R[0]); box(g, cx + bx2, sy2 + by2, 1, 1, R[5]); }
      }
      // (the rebar left sticking up out of the topmost columns' tops, rusty)
      for (const dx of [-3, 2]) { box(g, cx + dx, GY - h - 14, 1, 14, dimmed('#7C2D12')); box(g, cx + dx, GY - h - 14, 1, 1, dimmed('#D97706')); }
    }
    for (const [y, w] of [[GY - 112, PAV_W], [GY - 222, PAV_W], [GY - 330, PAV_W / 2]] as const) {
      box(g, PAV_X - 4, y - 5, w + 8, 10, INK); box(g, PAV_X - 3, y - 4, w + 6, 8, R[3]); box(g, PAV_X - 3, y - 4, w + 6, 2, R[4]); box(g, PAV_X - 3, y + 2, w + 6, 2, R[1]);
      box(g, PAV_X - 3, y - 4, w + 6, 1, R[5]); box(g, PAV_X - 3, y, w + 6, 1, dith(g, R[2]) as unknown as string);
      for (let x = PAV_X; x <= PAV_X + w; x += PAV_W / 4) { box(g, x - 2, y - 2, 2, 2, R[5]); box(g, x + 1, y - 2, 2, 2, R[5]); box(g, x - 2, y + 1, 2, 1, R[0]); box(g, x + 1, y + 1, 2, 1, R[0]); }
      // (primer runs and rust bloom down the web)
      for (let x = PAV_X + 30; x < PAV_X + w; x += 70) { box(g, x, y + 4, 1, 3 + (x % 3), dimmed('#5A1E10')); }
    }
    // (the cross bracing in the bays: rods with their turnbuckles)
    for (let k = 0; k < 2; k++) {
      const xa = PAV_X + k * (PAV_W / 4), xb = xa + PAV_W / 4;
      lineR(g, [xa + 6, GY - 8, xb - 6, GY - 104], 2, R[1]); lineR(g, [xb - 6, GY - 8, xa + 6, GY - 104], 2, R[1]);
      lineR(g, [xa + 6, GY - 9, xb - 6, GY - 105], 1, R[3]);
      const mx2 = (xa + xb) / 2; box(g, mx2 - 3, GY - 59, 6, 6, INK); box(g, mx2 - 2, GY - 58, 4, 4, R[3]); box(g, mx2 - 2, GY - 58, 4, 1, R[5]);
    }
    // (the tower crane: its mast latticed, the jib out over it with its lattice under, the trolley and the hook block on
    // its falls, the counterweight's blocks, the cab's glazing, the flag)
    const mx = PAV_X + PAV_W - 30, mt = GY - 500;
    box(g, mx - 9, mt, 18, GY - mt, INK); box(g, mx - 8, mt, 16, GY - mt, Y[2]); box(g, mx - 8, mt, 2, GY - mt, Y[4]); box(g, mx + 6, mt, 2, GY - mt, Y[1]);
    for (let y = mt; y < GY; y += 16) { lineR(g, [mx - 6, y, mx + 6, y + 16], 1, Y[0]); lineR(g, [mx + 6, y, mx - 6, y + 16], 1, Y[0]); box(g, mx - 8, y, 16, 1, Y[4]); box(g, mx - 8, y + 1, 16, 1, Y[1]); }
    box(g, mx - 14, GY - 12, 28, 12, INK); box(g, mx - 13, GY - 11, 26, 11, C[3]); box(g, mx - 13, GY - 11, 26, 1, C[5]);
    box(g, mx - 260, mt - 8, 330, 10, INK); box(g, mx - 259, mt - 7, 328, 8, Y[3]); box(g, mx - 259, mt - 7, 328, 2, Y[5]); box(g, mx - 259, mt - 1, 328, 2, Y[1]);
    for (let x = mx - 256; x < mx + 66; x += 14) lineR(g, [x, mt - 6, x + 7, mt], 1, Y[1]);
    box(g, mx - 230, mt + 2, 300, 2, INK); box(g, mx - 230, mt + 2, 300, 1, Y[2]);
    for (let x = mx - 228; x < mx + 66; x += 14) lineR(g, [x, mt + 2, x + 7, mt + 4], 1, Y[1]);
    lineR(g, [mx, mt - 50, mx - 240, mt - 8], 1, INK); lineR(g, [mx, mt - 50, mx + 60, mt - 8], 1, INK);
    box(g, mx - 2, mt - 54, 4, 30, INK); box(g, mx - 1, mt - 54, 2, 30, Y[3]);
    for (let k = 0; k < 3; k++) { const cy = mt + 3 + k * 7; box(g, mx + 40, cy, 28, 7, INK); box(g, mx + 41, cy + 1, 26, 5, C[2]); box(g, mx + 41, cy + 1, 26, 1, C[4]); box(g, mx + 53, cy + 1, 1, 5, C[0]); }
    box(g, mx - 14, mt - 24, 18, 18, INK); box(g, mx - 13, mt - 23, 16, 16, Y[2]); box(g, mx - 13, mt - 23, 16, 1, Y[4]);
    box(g, mx - 11, mt - 21, 8, 7, dimmed('#3E5A78')); box(g, mx - 11, mt - 21, 8, 3, dimmed('#7AA2C8')); box(g, mx - 10, mt - 20, 2, 1, dimmed('#E0F2FE'));
    const tx = mx - 180;
    box(g, tx - 6, mt + 2, 12, 5, INK); box(g, tx - 5, mt + 3, 10, 3, Y[2]);
    lineR(g, [tx - 2, mt + 6, tx - 2, GY - 262], 1, INK); lineR(g, [tx + 2, mt + 6, tx + 2, GY - 262], 1, INK);
    box(g, tx - 5, GY - 266, 10, 9, INK); box(g, tx - 4, GY - 265, 8, 7, Y[2]); box(g, tx - 4, GY - 265, 8, 1, Y[4]);
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(tx, GY - 252, 4, -0.2, Math.PI + 0.6); g.stroke();
    // (the flag on the jib's end: Old Glory, waving stiff in the smoke wind, its folds shaded)
    const fx = mx - 250, fy = mt - 36, Rf = ramp6(dimmed('#B91C1C')), Wf = ramp6(dimmed('#F1F5F9')), Bf = ramp6(dimmed('#1E3A8A'));
    box(g, fx - 1, fy - 2, 1, 34, INK);
    for (let i = 0; i < 32; i += 2) {
      const wv = Math.round(Math.sin(i * 0.25) * 1.5), lk = Math.cos(i * 0.25), st = lk > 0.5 ? 4 : lk < -0.5 ? 2 : 3;
      box(g, fx + i, fy + wv - 1, 2, 23, INK);
      for (let k = 0; k < 7; k++) box(g, fx + i, fy + wv + k * 3, 2, 3, (k % 2 ? Wf : Rf)[st]);
      if (i < 12) { box(g, fx + i, fy + wv, 2, 12, Bf[st - 1]); if ((i / 2) % 2 === 0) { box(g, fx + i, fy + wv + 3, 1, 1, Wf[4]); box(g, fx + i + 1, fy + wv + 8, 1, 1, Wf[4]); } }
    }
  }));
};

/** The pavilion's sign on the way in: well left of the gate's tower (X(640)), its board's whole width clear of it,
 *  a flag on a pole either side of it. */
const SIGN_X = 440;

export interface SceneState {
  /** The gate: shut in its doorway (till he kicks it in), going over, knocked flat on the slab, or (a revisit) open. */
  gate: GateLook;
  /** She's in the dig behind (drawn by the fight between the sky and the berm). */
  between?: (c: Ctx) => void;
  /** Revisits: the aftermath on the floor (null: none): whether she crumbled in the winning run, and what's left of him
   *  (drawn by the fight: his concrete mound, his puke pool, his blood dried under the chalk). */
  aftermath: { crumbled: boolean; him: ((c: Ctx) => void) | null; outline: boolean } | null;
}

export const drawScene = (c: Ctx, state: GameState, S: SceneState) => {
  const v = viewIn(state), f = state.frame;
  pavilion(c, state);
  if (S.between) S.between(c);
  if (onScreen(v, VIEW_X - 100, VIEW_X + 900)) drawBerm(c, state);
  floor(c, state);
  if (onScreen(v, WRECK_X - 220, WRECK_X + 220)) crash(c, f);
  // (the pavilion's sign, on the way in, clear of everything; its flags)
  if (onScreen(v, X(SIGN_X) - 180, X(SIGN_X) + 180)) {
    gloryPole(c, X(SIGN_X) - 128, GY, 190, f);
    gloryPole(c, X(SIGN_X) + 128, GY, 190, f + 40);
    postBoard(c, X(SIGN_X), GY, ['AMERICA', 'THE ONLY COUNTRY', 'COMING SOON'], LOOKS.land(2), '#1E3A8A', undefined, 140);
  }
  if (onScreen(v, VIEW_X - 60, VIEW_X + 860)) {
    tower(c, ARENA_L - WALL_W, -1, S.gate, f);
    tower(c, ARENA_R, 1, { kind: 'none' }, f);
    if (S.aftermath) aftermath(c, f, S.aftermath);
  }
  void lit; void GRAY_R; void STEEL_R; void BERM_Y; void PAT;
};

/** What's left (revisits): her rubble, the gun and the torch, a chalk outline, his shirt in shreds, the jetpack. */
const aftermath = (c: Ctx, f: number, A: NonNullable<SceneState['aftermath']>) => {
  drawRubble(c, MID - 40, GY, f);
  if (A.crumbled) {
    // (she came apart: more of her broken copper about, the torch snapped in two and lying, no revolver)
    for (const [dx, s, a, g] of CRUMBS) drawChunk(c, MID + dx, GY - s * 0.5, s, a, g);
    c.save(); c.translate(MID - 250, GY - 14); c.rotate(-0.12); c.scale(0.9, 0.9);
    drawTorchAt(c, 0, 0, -Math.PI / 2 + 0.25);
    c.restore();
    shapeR(c, () => c.rect(MID - 140, GY - 8, 54, 9), [PAT[5], PAT[3], PAT[2], PAT[1], PAT[0]], MID - 140, MID - 86, 1);
    box(c, MID - 88, GY - 9, 4, 11, INK);
  } else drawDropped(c, MID + 144, MID - 240, GY, f);
  if (A.him) A.him(c);
  // (his tie-dye in shreds; the emergency jetpack, spent, on its side: the tanks banded, the straps, sooty nozzles)
  for (const [i, [dx, col]] of TIEDYE_SHREDS.entries()) { box(c, MID + dx - 1, GY - 5 - (i % 2) * 2, 10, 5, INK); box(c, MID + dx, GY - 4 - (i % 2) * 2, 8, 3, col); box(c, MID + dx, GY - 4 - (i % 2) * 2, 8, 1, mix(col, '#FFFFFF', 0.4)); }
  for (const dy of [0, 9]) { shapeR(c, () => c.roundRect(MID - 334, GY - 18 + dy, 32, 9, 4), GRAY_R, MID - 334, MID - 302, 1); box(c, MID - 322, GY - 18 + dy, 3, 9, BAND_R[1]); box(c, MID - 302, GY - 16 + dy, 5, 5, '#1C1917'); }
  box(c, MID - 326, GY - 20, 2, 20, '#3F2A1C'); box(c, MID - 312, GY - 20, 2, 20, '#3F2A1C');
  if (!A.outline) return;
  // (a chalk outline: arms and legs out, on the slab; the chalk's grain broken up, a stroke doubled here and there)
  const ox = MID + 40, oy = GY - 8;
  const chalk = (w: number, col: string | CanvasPattern) => {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.ellipse(ox - 44, oy - 3, 7, 4, 0, 0, Math.PI * 2); c.moveTo(ox - 36, oy - 4); c.lineTo(ox + 20, oy - 5); c.lineTo(ox + 40, oy - 9); c.moveTo(ox + 20, oy - 2); c.lineTo(ox + 42, oy + 2);
    c.moveTo(ox - 24, oy - 4); c.lineTo(ox - 14, oy - 12); c.moveTo(ox - 20, oy - 2); c.lineTo(ox - 8, oy + 4); c.stroke();
  };
  chalk(3, dith(c, mix('#F8FAFC', '#A8A29E', 0.3)));
  chalk(1.4, mix('#F8FAFC', '#A8A29E', 0.15));
  box(c, ox + 50, oy - 6, 10, 2, '#E4E4E7'); box(c, ox + 56, oy - 7, 3, 4, '#FDE047');
  void f;
};

export { BERM_Y };
