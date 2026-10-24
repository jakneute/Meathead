// The stunt stage's far off (screen space; the backdrop): the boulevard's own far layers by the hour (blvd/far.ts: the
// smoggy LA sky banded down to the horizon, the mountains, the HAPPYWOOD hill on its foothills, the city in the haze, the
// studio lot, the palms), each on its own ground where the scene's one eye puts it (its line at the camera's rest; each
// drops as he's thrown up, by how near it is), and nearest, what stands round the outside of the amphitheater over the
// set's tops: its light towers (lattice masts, their lamp banks lit after dark with a stepped glow round each), Steve's
// billboards up on scaffold (yellow: everything of his is), bunting strung tower to tower, a camera crane. The backlot
// behind still smoking thin from the havoc till the land's cleared. Each layer painted once for the hour and slid along.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, type TimeOfDay } from '../../timeOfDay';
import { mist } from '../../adventure/farArt';
import { FAR, tile, farCol, rampF, paintMountains, paintFoothills, drawHill, paintCity, paintLot, paintPalms } from '../blvd/far';
import { HWX } from '../geometry';
import { realDisastersOn } from '../section';
import { isLandCleared } from '../../store';
import { steveBoard, boardFrame } from '../posters';
import { GY, CAM_ROW } from './arena';
import { type Ctx, INK, box, mix, hash, poly, timeOfDay, hourMix, skyAt, STEVE, bunting, wisp, EYE_UP } from './paint';
import { hazeBands, bandedGradient, steppedGlow } from '../blvd/kit';
import { drawHwSky, drawHwHorizon, drawHwLandmarks } from '../landmarks';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** The camera's rest (y), the eye's line on screen at rest. */
const CAM_REST = GY - CAM_ROW, EYE = CAM_ROW - EYE_UP;
const groundAt = (k: number) => EYE + EYE_UP * k;
const K = { mtn: 0.003, hill: 0.004, foot: 0.008, city: 0.022, lot: 0.055, palms: 0.11, rig: 0.2 } as const;

// ---------------------------------------------------------------------------------------------------------------
// Round the outside of the amphitheater: the light towers, Steve's billboards, the bunting, a crane

const RW = 1600, RH = 340, RG = 24;
/** The light towers (tile x) and how tall. */
const TOWERS: [number, number][] = [[150, 262], [880, 280], [1430, 250]];

type T = (c: string) => string;
/** A light tower: a lattice mast (four legs in steps, braced in X's), a ladder up it, its head a bank of lamps on a frame
 *  with a catwalk, lit after dark. */
const tower = (g: Ctx, T: T, tod: TimeOfDay, x: number, f: number, h: number) => {
  const S = rampF(T, '#8A92A0'), top = f - h;
  // (the legs, tapering in toward the top)
  for (const s of [-1, 1]) {
    for (let y = top; y < f; y += 2) {
      const u = (y - top) / h, lx = Math.round(x + s * (5 + u * 9));
      box(g, lx - 1, y, 3, 2, INK); box(g, lx, y, 1, 2, s < 0 ? S[3] : S[1]);
    }
  }
  // (the bracing: X's up it, banded)
  g.lineWidth = 1;
  for (let y = top + 8; y < f - 10; y += 16) {
    const u0 = (y - top) / h, u1 = (y + 16 - top) / h, a0 = 5 + u0 * 9, a1 = 5 + u1 * 9;
    g.strokeStyle = S[2]; g.beginPath(); g.moveTo(x - a0, y); g.lineTo(x + a1, y + 16); g.moveTo(x + a0, y); g.lineTo(x - a1, y + 16); g.stroke();
    box(g, x - a0, y, a0 * 2, 1, S[3]);
  }
  // (the ladder up the middle)
  box(g, x - 2, top + 30, 1, h - 30, S[0]); box(g, x + 2, top + 30, 1, h - 30, S[0]);
  for (let y = top + 32; y < f; y += 4) box(g, x - 2, y, 5, 1, S[1]);
  // (the head: a frame, the lamps in rows, a catwalk under them with its rail)
  const hw = 58, hh = 36, hx = x - hw / 2, hy = top - hh;
  box(g, hx - 1, hy - 1, hw + 2, hh + 2, INK); box(g, hx, hy, hw, hh, S[1]); box(g, hx, hy, hw, 1, S[3]);
  const on = tod.lamps > 0.3;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) {
    const lx = hx + 3 + k * 11, ly = hy + 3 + r * 11;
    box(g, lx, ly, 9, 9, INK);
    if (on) { box(g, lx + 1, ly + 1, 7, 7, '#F8E8A8'); box(g, lx + 2, ly + 2, 4, 4, '#FFFBEA'); }
    else { box(g, lx + 1, ly + 1, 7, 7, T('#A8AAA0')); box(g, lx + 1, ly + 1, 3, 3, T('#E2E4DA')); box(g, lx + 5, ly + 5, 2, 2, T('#6A6C64')); }
  }
  box(g, hx - 4, top - 1, hw + 8, 3, INK); box(g, hx - 3, top - 1, hw + 6, 1, S[3]);
  for (let k = hx - 3; k < hx + hw + 3; k += 6) box(g, k, top - 7, 1, 6, S[2]);
  box(g, hx - 3, top - 8, hw + 6, 1, S[3]);
  // (its guy wires, out to the ground)
  g.strokeStyle = T('#6A6E78'); g.beginPath(); g.moveTo(x - 4, top + 40); g.lineTo(x - 70, f); g.moveTo(x + 4, top + 40); g.lineTo(x + 70, f); g.stroke();
};

/** Scaffold under a billboard: tubes in steps, braced, the board's catwalk with its gooseneck lamps. */
const scaffold = (g: Ctx, T: T, x0: number, x1: number, top: number, f: number) => {
  const S = rampF(T, '#9AA0AA');
  for (let x = x0 + 6; x <= x1 - 6; x += Math.max(30, (x1 - x0 - 12) / 4)) { box(g, x - 1, top, 4, f - top, INK); box(g, x, top, 2, f - top, S[2]); box(g, x, top, 1, f - top, S[4]); }
  g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath();
  for (let y = top + 10; y < f - 10; y += 26) { g.moveTo(x0 + 6, y); g.lineTo(x1 - 6, y + 26); g.moveTo(x1 - 6, y); g.lineTo(x0 + 6, y + 26); }
  g.stroke();
  for (let y = top + 10; y < f; y += 26) { box(g, x0 + 4, y, x1 - x0 - 8, 2, S[1]); box(g, x0 + 4, y, x1 - x0 - 8, 1, S[3]); }
};

/** One of Steve's billboards (yellow, like everything of his): its frame, the face painted like the print shop's
 *  (posters.ts: him or his car jumping the port-a-potties, the band, a starburst), the goosenecks over it. */
const billboard = (g: Ctx, T: T, tod: TimeOfDay, x: number, y: number, w: number, h: number, lines: [string, number, string][], him: boolean, band: string, burst: string[]) => {
  boardFrame(g, T, x, y, w, h, x);
  steveBoard(g, T, x, y, w, h, lines, { him, band, burst: burst.length ? burst : undefined, seed: x });
  // (the goosenecks over it, lit after dark)
  for (let k = x + 30; k < x + w; k += 80) {
    box(g, k, y - 12, 2, 10, INK); box(g, k - 2, y - 14, 10, 3, INK); box(g, k + 4, y - 13, 5, 3, tod.lamps > 0.3 ? '#FFF2C0' : T('#7A7E86'));
  }
};

/** A camera crane, parked: its base on wheels, the arm up at a slant, the camera on the end, the counterweights. */
const crane = (g: Ctx, T: T, x: number, f: number) => {
  const S = rampF(T, '#3A3E46');
  box(g, x - 22, f - 18, 44, 14, INK); box(g, x - 21, f - 17, 42, 12, S[2]); box(g, x - 21, f - 17, 42, 2, S[4]);
  for (const wx of [x - 18, x + 10]) { box(g, wx, f - 6, 9, 6, INK); box(g, wx + 2, f - 5, 5, 4, S[1]); }
  box(g, x - 3, f - 60, 6, 44, INK); box(g, x - 2, f - 60, 4, 44, S[3]);
  g.lineCap = 'butt';
  for (const [w, col] of [[6, INK], [4, S[3]], [1, S[4]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x - 50, f - 40); g.lineTo(x + 110, f - 150); g.stroke(); }
  box(g, x - 62, f - 48, 16, 18, INK); box(g, x - 61, f - 47, 14, 16, S[1]); box(g, x - 61, f - 47, 14, 2, S[3]);
  box(g, x + 104, f - 162, 22, 14, INK); box(g, x + 105, f - 161, 20, 12, S[1]); box(g, x + 125, f - 158, 6, 7, INK); box(g, x + 126, f - 157, 4, 5, T('#4A6888'));
};

const paintRig = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.06), f = RH - RG;
  // (bunting first: tower to tower, behind the boards)
  const pen = [STEVE[3], '#C82828', '#F4F0E8', '#2A2A30'].map(T);
  bunting(g, TOWERS[0][0] + 14, f - TOWERS[0][1] + 20, TOWERS[1][0] - 14, f - TOWERS[1][1] + 20, 30, pen);
  bunting(g, TOWERS[1][0] + 14, f - TOWERS[1][1] + 20, TOWERS[2][0] - 14, f - TOWERS[2][1] + 20, 34, pen);
  bunting(g, TOWERS[2][0] + 14, f - TOWERS[2][1] + 20, RW + TOWERS[0][0] - 14, f - TOWERS[0][1] + 20, 30, pen);
  // (the boards on their scaffold)
  scaffold(g, T, 330, 720, f - 140, f);
  billboard(g, T, tod, 320, f - 252, 410, 120, [['STUNTMAN STEVE', 2, '#7A1A0A'], ['AS SEEN IN A REAL MOVIE*', 1, '#2A1408'], ['*FOR ABOUT TWO SECONDS', 1, '#5A2A10']], true, 'NO NET. NO PERMIT. NO PROBLEM.', ['NOW', 'WITH', 'FIRE!']);
  scaffold(g, T, 1040, 1250, f - 110, f);
  billboard(g, T, tod, 1030, f - 196, 230, 92, [['LIVE!', 2, '#7A1A0A'], ['TWICE DAILY', 1, '#2A1408'], ['NO REFUNDS', 1, '#5A2A10']], false, 'SPLASH ZONE: ROWS 1-9', []);
  crane(g, T, 1290, f);
  for (const [x, h] of TOWERS) tower(g, T, tod, x, f, h);
  // (its foot: into the haze over the set's back)
  mist(g, RW, f - 80, 80, skyAt(0.92, tod), 0, 0.18, 4);
};
/** Where a tower's lamps are on the screen (for their glow after dark). */
const glows = (c: Ctx, off: number, top: number, f: number) => {
  const base = -((((off) % RW) + RW) % RW);
  for (let tx = base; tx < W + RW; tx += RW) for (const [x, h] of TOWERS) {
    const sx = tx + x, sy = top + RH - RG - h - 18;
    if (sx < -120 || sx > W + 120) continue;
    steppedGlow(c, sx, sy, 70 + Math.sin(f * 0.05 + x) * 2, '#FFF2C0', 0.16, 0, 5);
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawStuntFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x, f = state.frame;
  const up = CAM_REST - state.camera.y;
  const drop = (k: number) => Math.round(up * k);
  const hz = EYE - 8 + Math.round(up * 0.002);
  drawTodSky(c, 0, 0, W, H, FAR.SKY, { bands: 16, horizon: hz + 20, sun: [620, 90], moon: [160, 70], t: f, scroll: cam * 0.02 });
  hazeBands(c, 0, Math.round(hz - 150), W, 160, hourMix('#B89A72', '#C88A62', '#2E2C44', tod), 0, 0.3, 7);
  const under = (y: number, k: number, base: string) => {
    if (y >= H) return;
    const T2 = farCol(tod, k);
    bandedGradient(c, 0, Math.round(y), W, H - Math.round(y), [T2(base), T2(mix(base, '#3A3236', 0.18)), T2(mix(base, '#3A3236', 0.32))], 4);
  };
  drawHwSky(c, state, hz, realDisastersOn(state) && !isLandCleared('hollywood') ? 'real' : 'calm');
  tile(c, `hb-mtn-${tod.key}`, cam * K.mtn + 300, groundAt(K.mtn) - FAR.MH + 10 + drop(K.mtn), FAR.MH, FAR.TW, g => paintMountains(g, tod));
  drawHwHorizon(c, state, groundAt(0.0035) + 4 + drop(0.0035));
  // (the hill where the rest of the land has it, at this end of it)
  drawHill(c, 560 - (cam - HWX) * K.hill, groundAt(K.hill) + 6 + drop(K.hill), f);
  tile(c, `hb-foot-${tod.key}`, cam * K.foot + 140, groundAt(K.foot) - FAR.FH + 26 + drop(K.foot), FAR.FH, FAR.TW, g => paintFoothills(g, tod));
  under(groundAt(K.foot) + 26 + drop(K.foot), 0.34, '#8A8A6A');
  tile(c, `hb-city-${tod.key}`, cam * K.city + 520, groundAt(K.city) - (FAR.CH - FAR.CG) + drop(K.city), FAR.CH, FAR.TW, g => paintCity(g, tod));
  under(groundAt(K.city) + FAR.CG + drop(K.city), 0.42, '#8A8070');
  // (the rest of the land, back the way he came: Disaster: The Ride, the backlot, Thrones of the Stars)
  drawHwLandmarks(c, state, groundAt(0.03) + drop(0.03));
  tile(c, `hb-lot-${tod.key}`, cam * K.lot + 1000, groundAt(K.lot) - (FAR.SH - FAR.SG) + drop(K.lot), FAR.SH, FAR.LW, g => paintLot(g, tod));
  under(groundAt(K.lot) + FAR.SG + drop(K.lot), 0.2, '#6A6466');
  // (the backlot behind, where the havoc was: still smoking thin, off to the left, till the land's cleared)
  if (realDisastersOn(state) && !isLandCleared('hollywood')) for (let k = 0; k < 4; k++) {
    const sx = ((k * 173 + 40 - cam * K.lot) % 1100 + 1100) % 1100 - 150;
    wisp(c, sx, groundAt(K.lot) + drop(K.lot) - 20, f, k, 1.4);
  }
  tile(c, `hb-palms-${tod.key}`, cam * K.palms + 900, groundAt(K.palms) - (FAR.PH - FAR.PG) + drop(K.palms), FAR.PH, FAR.PW, g => paintPalms(g, tod));
  under(groundAt(K.palms) + FAR.PG + drop(K.palms), 0.12, '#6E6668');
  // (round the outside of the amphitheater: the towers, Steve's boards; the towers' lamps glowing after dark)
  const rTop = groundAt(K.rig) - (RH - RG) + drop(K.rig), rOff = cam * K.rig + 200;
  tile(c, `hst-rig-${tod.key}`, rOff, rTop, RH, RW, g => paintRig(g, tod));
  if (tod.lamps > 0.3) glows(c, rOff, rTop, f);
  under(groundAt(K.rig) + RG + drop(K.rig), 0.05, '#58525A');
  void INK; void hash; void poly;
  return true;
};
