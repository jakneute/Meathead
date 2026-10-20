// PIPER'S LAIR, its traps drawn (the user's: "make the lightning and ice traps in her lair look more detailed too", the
// fire one with them so the three match): the mains her quakes tear loose, as real plumbing, and her elemental throws.
//
//   THE HEAT MAIN (fire): down through the cornice in shredded lagging (silver bands, the fibers hanging), a bolted
//     flange pair, a red gate valve, the scorched elbow and the flanged nozzle; in the tell the bare metal goes dull red
//     to orange to white-hot, heat shimmer and steam roaring off it, molten drips; on, a stepped column of fire to the
//     floor (tongues licking off it, a white core, embers, black smoke rolling along the ceiling) and the carpet ablaze.
//   THE NITROGEN MAIN (ice): low out of the wall, rimed in frost (a lumpy white crust, icicles), torn foam lagging, an
//     iced-over blue valve, frosted flanges, a hazard band, its end split open; frost ferns creep over the wall and the
//     floor and the icicles grow in the tell, vapor dribbling and rolling along the carpet; on, a roaring white-blue
//     plume along the floor, fog rolling off it and on past its end, the carpet frosted.
//   THE LIVE WIRES (shock): the burst copper water main out of the ceiling, gushing into a flooded patch (banded, the
//     room's light in it, ripples); the FX POWER cable hanging into it, its jacket split, three conductors splayed into
//     bare copper; sparks spitting off the copper and over the water in the tell; live, arcs crawling all over the
//     water, a blue glow, steam spitting up where they strike.
//
// Same places, sizes and timings as before (fight.ts owns them): the still plumbing is painted once per look into a
// stamp; the fire, the frost, the water and the arcs are drawn live over it.

import { box, hash, polyF, still, INK, type Ctx } from '../kit';
import { GY, CEIL_Y } from './layout';
import { drawCavity } from './room';

/** The mains' sizes (fight.ts's). */
export interface MainDims { heatHW: number; heatFloor: number; nitroLen: number; nitroH: number; puddleHW: number }
export type MainPhase = { s: 'quiet' | 'tell' | 'on'; k: number };

// Ramps, darkest first
const STEEL = ['#140C0A', '#2E2420', '#4A3C36', '#6A5A52', '#8E7E74', '#B4A498'];
const HOT1 = ['#1A0604', '#4A0E08', '#7A1A0C', '#A82A12', '#CC4A1E', '#E87038'];
const HOT2 = ['#4A1006', '#8A2A0C', '#C84A14', '#EE7A24', '#FBA848', '#FFD488'];
const HOT3 = ['#7A2A0C', '#C85A18', '#F09030', '#FBC850', '#FFEA98', '#FFFCE8'];
const LAG = ['#2A2018', '#5A4A38', '#8A7860', '#B4A286', '#D8CAAE', '#F2EAD6'];
const ALU = ['#2A2E36', '#5A606C', '#8A92A0', '#B4BCC8', '#D8DEE6', '#FFFFFF'];
const RED = ['#2A0606', '#5A0E0E', '#8E1A1A', '#C02A26', '#E05A4A', '#FF9A84'];
const COLD = ['#0E1A2A', '#22364E', '#3A5674', '#5A7A9A', '#86A4C0', '#B8D0E4'];
const ICE = ['#1E4A7A', '#3A72AA', '#5AA0D8', '#9ACCF0', '#D0ECFF', '#FFFFFF'];
const BLUEV = ['#0A1A3A', '#1A3A7A', '#2A5AB8', '#4A84E0', '#8AB8F8', '#D0E6FF'];
const FOAM = ['#4A4230', '#7A6E50', '#A89C74', '#CEC49C', '#EAE2C2', '#FAF6E6'];
const COPPER = ['#2A1206', '#5A2A10', '#8A4A1E', '#B87038', '#E0A060', '#FFD8A0'];
const WATER = ['#0E2440', '#1E3A5A', '#2E5A88', '#3A72AA', '#4A90C8', '#8AC8F0'];
const FIRE = ['#5A0A04', '#A81A0A', '#E04A12', '#F98A1E', '#FDD34A', '#FFF7D6'];

/** Every other pixel of a box (the dither where two steps meet). */
const dz = (g: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => {
  g.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + ph) & 1; xx < w; xx += 2) g.fillRect(Math.round(x) + xx, Math.round(y) + yy, 1, 1);
};
/** A pipe standing up (x0..x1, y0..y1) in its ramp: lit left, a highlight, shaded right, inked. */
const pipeV = (g: Ctx, x0: number, x1: number, y0: number, y1: number, R: string[]) => {
  const w = x1 - x0, h = y1 - y0;
  box(g, x0 - 1, y0, w + 2, h, INK);
  box(g, x0, y0, w, h, R[3]); box(g, x0, y0, Math.max(1, w * 0.3), h, R[4]); box(g, x0 + Math.max(1, w * 0.18), y0, 1, h, R[5]);
  dz(g, x0 + w * 0.3, y0, 2, h, R[4]); box(g, x0 + w * 0.68, y0, w * 0.32, h, R[2]); dz(g, x0 + w * 0.6, y0, 2, h, R[2], 1); box(g, x1 - 1, y0, 1, h, R[1]);
};
/** A pipe lying along (x0..x1, y0..y1): lit along its top, a highlight, shaded under, inked. */
const pipeH = (g: Ctx, x0: number, x1: number, y0: number, y1: number, R: string[]) => {
  const w = x1 - x0, h = y1 - y0;
  box(g, x0, y0 - 1, w, h + 2, INK);
  box(g, x0, y0, w, h, R[3]); box(g, x0, y0, w, Math.max(1, h * 0.3), R[4]); box(g, x0, y0 + Math.max(1, h * 0.15), w, 1, R[5]);
  dz(g, x0, y0 + h * 0.3, w, 2, R[4]); box(g, x0, y0 + h * 0.68, w, h * 0.32, R[2]); dz(g, x0, y0 + h * 0.6, w, 2, R[2], 1); box(g, x0, y1 - 1, w, 1, R[1]);
};
/** A bolt head (hex, lit up left). */
const bolt = (g: Ctx, x: number, y: number, R: string[]) => { box(g, x - 1, y - 1, 4, 4, INK); box(g, x, y, 2, 2, R[3]); box(g, x, y, 1, 1, R[5]); };
/** A flange ring round a pipe going up (a wide plate, bolts along it). */
const flangeV = (g: Ctx, cx: number, y: number, hw: number, R: string[]) => {
  box(g, cx - hw - 1, y - 1, hw * 2 + 2, 6, INK); box(g, cx - hw, y, hw * 2, 4, R[3]); box(g, cx - hw, y, hw * 2, 1, R[5]); box(g, cx - hw, y + 3, hw * 2, 1, R[1]);
  box(g, cx - hw, y, 2, 4, R[4]);
  for (let x = cx - hw + 2; x < cx + hw - 2; x += 6) bolt(g, x, y + 1, R);
};
/** A flange ring round a pipe lying along (a tall plate, bolts down it). */
const flangeH = (g: Ctx, x: number, cy: number, hh: number, R: string[]) => {
  box(g, x - 1, cy - hh - 1, 6, hh * 2 + 2, INK); box(g, x, cy - hh, 4, hh * 2, R[3]); box(g, x, cy - hh, 1, hh * 2, R[5]); box(g, x + 3, cy - hh, 1, hh * 2, R[1]);
  box(g, x, cy - hh, 4, 2, R[4]);
  for (let y = cy - hh + 2; y < cy + hh - 2; y += 6) bolt(g, x + 1, y, R);
};
/** A handwheel (a valve's), face on: the rim, four spokes, the hub. */
const wheel = (g: Ctx, x: number, y: number, r: number, R: string[]) => {
  g.lineCap = 'butt';
  for (const [w, col] of [[4, INK], [2.4, R[3]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = R[5]; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, Math.PI * 1.0, Math.PI * 1.5); g.stroke();
  g.strokeStyle = R[1]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 0.5); g.stroke();
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + (k * Math.PI) / 2; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); g.strokeStyle = R[3]; g.lineWidth = 1; g.stroke(); }
  box(g, x - 2, y - 2, 4, 4, INK); box(g, x - 1, y - 1, 2, 2, R[4]);
};
/** A stepped tongue of flame (x its middle, `base` its foot, h tall, w wide), layered dark red to a white core. */
export const flameT = (c: Ctx, x: number, base: number, h: number, w: number, fr: number, seed: number) => {
  const sway = Math.sin(fr * 0.35 + seed * 2.1) * w * 0.35;
  for (let i = 0; i < 5; i++) {
    const k = 1 - i * 0.2, hh = h * (1 - i * 0.16), ww = w * k;
    polyF(c, [[x - ww, base], [x - ww * 0.7 + sway * 0.3, base - hh * 0.45], [x + sway * (1 - i * 0.15), base - hh], [x + ww * 0.7 + sway * 0.3, base - hh * 0.5], [x + ww, base]], i === 0 ? FIRE[0] : FIRE[i]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The heat main

const heatPipe = (g: Ctx, step: number) => {
  const M = [STEEL, HOT1, HOT2, HOT3][step];
  // (the lagging, down through the cornice: fibrous, silver bands round it, torn at the bottom and the fibers hanging)
  box(g, -13, -22, 26, 38, INK); box(g, -12, -22, 24, 37, LAG[3]); box(g, -12, -22, 6, 37, LAG[4]); box(g, -11, -22, 1, 37, LAG[5]);
  dz(g, -6, -22, 2, 37, LAG[4]); box(g, 4, -22, 8, 37, LAG[2]); dz(g, 2, -22, 2, 37, LAG[2], 1); box(g, 11, -22, 1, 37, LAG[1]);
  for (let y = -20; y < 14; y += 3) box(g, -9 + ((y * 7) % 13), y, 3, 1, LAG[5 - ((y >> 1) & 1) * 3]);
  for (const y of [-16, -4, 8]) { box(g, -13, y - 1, 26, 5, INK); box(g, -12, y, 24, 3, ALU[3]); box(g, -12, y, 24, 1, ALU[5]); box(g, -12, y + 2, 24, 1, ALU[1]); box(g, -12, y, 5, 3, ALU[4]); box(g, 6, y + 1, 2, 1, ALU[0]); }
  // (soot up the lagging from the fire)
  if (step) { dz(g, -12, 6, 24, 9, '#2A1A12'); dz(g, -10, 0, 20, 6, '#3A2A1E', 1); }
  // (the torn bottom edge, the fibers hanging)
  polyF(g, [[-13, 14], [-9, 19], [-6, 15], [-2, 21], [2, 16], [6, 20], [10, 15], [13, 18], [13, 14]], LAG[2]);
  for (let k = 0; k < 9; k++) { const x = -11 + k * 2.6, len = 4 + hash(k * 3.3) * 10; box(g, x, 15, 1, len, k % 3 ? LAG[4] : LAG[1]); if (k % 2) box(g, x + 1, 15 + len - 2, 1, 2, LAG[3]); }
  // (the bare pipe under it, scorched: blistered, then glowing as it heats)
  pipeV(g, -8, 8, 14, 38, M);
  if (!step) { dz(g, -7, 22, 14, 14, '#140A08'); box(g, -4, 26, 3, 2, '#5A3020'); box(g, 2, 30, 2, 2, '#5A3020'); }
  else for (let y = 18; y < 36; y += 5) box(g, -6 + ((y * 5) % 9), y, 2, 1, M[5]);
  // (the flange pair, bolted, the gasket between)
  flangeV(g, 0, 18, 13, step >= 2 ? M : STEEL); box(g, -12, 23, 24, 1, '#3A0A06');
  flangeV(g, 0, 24, 13, M);
  // (the gate valve off its side, the red handwheel on it)
  pipeH(g, -22, -8, 28, 34, STEEL); box(g, -26, 26, 5, 10, INK); box(g, -25, 27, 3, 8, STEEL[3]); box(g, -25, 27, 1, 8, STEEL[5]);
  box(g, -31, 30, 6, 2, INK); wheel(g, -31, 31, 6, RED);
  // (the nozzle: a flanged bell opening down, its mouth dark (lit inside when it's hot))
  box(g, -14, 35, 28, 10, INK); box(g, -13, 36, 26, 8, M[3]); box(g, -13, 36, 26, 2, M[5]); box(g, -13, 36, 6, 8, M[4]); box(g, 7, 36, 6, 8, M[2]);
  for (const x of [-11, -3, 5]) bolt(g, x, 38, M);
  box(g, -9, 43, 18, 3, INK); box(g, -7, 44, 14, 2, step ? HOT3[step + 2] ?? '#FFFCE8' : '#0A0606');
  // (a split in the pipe, the heat showing through)
  polyF(g, [[3, 28], [6, 30], [4, 33], [6, 35]], INK); if (step) { box(g, 4, 30, 1, 3, HOT3[step + 2] ?? '#FFFFFF'); }
};

const drawHeat = (c: Ctx, x: number, ph: MainPhase, fr: number, D: MainDims) => {
  drawCavity(c, x, CEIL_Y + 20, 96, 44, 51, fr);
  const glow = ph.s === 'tell' ? ph.k : ph.s === 'on' ? 1 : 0;
  const step = glow <= 0 ? 0 : glow < 0.34 ? 1 : glow < 0.67 ? 2 : 3;
  still(c, `heatmain-${step}`, x, CEIL_Y, -40, -24, 76, 72, (g) => heatPipe(g, step));
  // (the glow off the hot metal, stepped rings)
  if (glow > 0) for (let i = 0; i < 3; i++) { c.globalAlpha = (0.1 + 0.05 * Math.sin(fr * 0.4)) * glow; c.fillStyle = ['#FDBA74', '#FB923C', '#FDE047'][i]; c.beginPath(); c.arc(x, CEIL_Y + 44, (44 - i * 12) * (0.7 + glow * 0.3), 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  // (heat shimmer under it: wavy bands of air)
  if (glow > 0.2 && ph.s !== 'on') for (let k = 0; k < 4; k++) { const y = CEIL_Y + 52 + k * 9; c.globalAlpha = 0.25 * glow; for (let i = -14; i < 14; i += 2) box(c, x + i, y + Math.round(Math.sin(i * 0.5 + fr * 0.4 + k) * 2), 2, 1, '#FFE8C8'); c.globalAlpha = 1; }
  // (steam roaring off it; molten drips off the nozzle in the tell; sparks)
  const puffs = ph.s === 'quiet' ? 1 : ph.s === 'tell' ? 6 : 0;
  for (let k = 0; k < puffs; k++) {
    const tt = ((fr * (ph.s === 'tell' ? 2.2 : 1) + k * 9) % 40) / 40, px = x - 4 + (k % 2 ? 1 : -1) * tt * 26, py = CEIL_Y + 46 + tt * 44, r = 4 + tt * 12;
    c.globalAlpha = 0.65 * (1 - tt);
    c.fillStyle = '#B8B6C8'; c.beginPath(); c.ellipse(px, py, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F4F4F8'; c.beginPath(); c.ellipse(px - r * 0.2, py - r * 0.2, r * 0.75, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    box(c, px - r * 0.4, py - r * 0.4, Math.max(1, r * 0.3), 1, '#FFFFFF');
    c.globalAlpha = 1;
  }
  if (ph.s === 'tell') {
    for (let k = 0; k < 2; k++) { const tt = ((fr * 1.5 + k * 13) % 26) / 26, dx = (k ? 4 : -5); box(c, x + dx, CEIL_Y + 46 + tt * tt * 60, 2, 3, tt < 0.5 ? '#FFF4C8' : '#FDBA74'); box(c, x + dx, CEIL_Y + 46 + tt * tt * 60, 1, 1, '#FFFFFF'); }
    if (fr % 4 < 2) { const sx = x - 1 + ((fr * 5) % 9) - 4; box(c, sx, CEIL_Y + 46, 2, 2, '#FDE047'); box(c, sx + 3, CEIL_Y + 49, 1, 1, '#FFFFFF'); }
  }
  if (ph.s !== 'on') return;
  // (the fire: a stepped column to the floor, licking, a white core, tongues off its edges; embers)
  const sc = (n: number) => Math.round(n);
  c.fillStyle = '#1A0A06'; c.beginPath(); c.ellipse(x, GY + 1, D.heatFloor + 12, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A1A0A'; c.beginPath(); c.ellipse(x, GY + 1, D.heatFloor - 8, 4, 0, 0, Math.PI * 2); c.fill();
  for (let y = CEIL_Y + 44; y < GY; y += 6) {
    const w = D.heatHW * (0.6 + 0.4 * Math.sin(y * 0.09 + fr * 0.5)) + (y - CEIL_Y) * 0.03, band = (y + fr * 4) % 30;
    box(c, sc(x - w - 2), y, sc(w * 2 + 4), 6, FIRE[0]);
    box(c, sc(x - w), y, sc(w * 2), 6, band < 10 ? FIRE[3] : band < 20 ? FIRE[2] : FIRE[1]);
    box(c, sc(x - w * 0.72), y, sc(w * 1.44), 6, band < 10 ? FIRE[4] : FIRE[3]);
    box(c, sc(x - w * 0.45), y, sc(w * 0.9), 6, band < 15 ? FIRE[5] : FIRE[4]);
    box(c, sc(x - w * 0.2), y, sc(w * 0.4), 6, '#FFFFFF');
    if (((y >> 1) + fr) % 2) { dz(c, x - w - 2, y, 4, 6, FIRE[1]); dz(c, x + w - 2, y, 4, 6, FIRE[1], 1); }
    if ((y / 6 + Math.floor(fr / 3)) % 3 === 0) { const s = (y / 6) % 2 ? 1 : -1; polyF(c, [[x + s * w, y], [x + s * (w + 12), y - 8], [x + s * (w + 4), y - 2], [x + s * w, y + 6]], FIRE[2]); polyF(c, [[x + s * w, y + 1], [x + s * (w + 6), y - 3], [x + s * w, y + 5]], FIRE[4]); }
  }
  // (black smoke rolling along the ceiling off it)
  for (let k = 0; k < 6; k++) { const tt = ((fr * 0.8 + k * 13) % 60) / 60, s = k % 2 ? 1 : -1; c.globalAlpha = 0.5 * (1 - tt); c.fillStyle = k % 3 ? '#2A2028' : '#3E3440'; c.beginPath(); c.ellipse(x + s * (20 + tt * 120), CEIL_Y + 34 + Math.sin(tt * 6 + k) * 4, 10 + tt * 18, 6 + tt * 8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  // (the carpet ablaze under it: tongues all along, the scorch)
  for (let k = 0; k < 9; k++) { const fx = x - D.heatFloor + k * (D.heatFloor / 4), fh = 12 + ((fr + k * 7) % 14) + hash(k) * 6; flameT(c, fx, GY, fh, 8 + (k % 3) * 2, fr, k); }
  // (light off it on the floor)
  c.globalAlpha = 0.18 + 0.06 * Math.sin(fr * 0.6); c.fillStyle = '#FDBA74'; c.beginPath(); c.ellipse(x, GY - 2, D.heatFloor + 40, 10, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // (embers going up)
  for (let k = 0; k < 7; k++) { const tt = ((fr + k * 11) % 36) / 36; box(c, x - D.heatFloor + hash(k * 3 + Math.floor((fr + k * 11) / 36)) * D.heatFloor * 2 + Math.sin(tt * 8 + k) * 3, GY - 6 - tt * 70, 2, 2, tt < 0.4 ? '#FFF7D6' : tt < 0.7 ? '#FDE047' : '#F97316'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The nitrogen main

const nitroPipe = (g: Ctx, dir: 1 | -1, step: number) => {
  // (all of it drawn facing right; flipped for left)
  g.save(); g.scale(dir, 1);
  // (the pipe out of the wall: steel gone frost-gray, rime crusted along its top, a hazard band, LN2 stenciled)
  pipeH(g, -42, 40, -48, -30, COLD);
  box(g, -24, -47, 10, 16, '#E8C020'); for (let k = 0; k < 4; k++) polyF(g, [[-24 + k * 4, -31], [-22 + k * 4, -31], [-18 + k * 4, -47], [-20 + k * 4, -47]], '#1A1A1A');
  box(g, -24, -47, 10, 1, '#FFF4A0');
  // (torn foam lagging round the near half, its torn edge)
  box(g, 0, -51, 22, 24, INK); box(g, 1, -50, 20, 22, FOAM[3]); box(g, 1, -50, 20, 6, FOAM[4]); box(g, 1, -50, 20, 1, FOAM[5]); box(g, 1, -34, 20, 6, FOAM[2]);
  for (let k = 0; k < 6; k++) box(g, 3 + ((k * 7) % 17), -48 + ((k * 5) % 18), 2, 1, FOAM[1 + (k % 2) * 4]);
  polyF(g, [[21, -51], [26, -46], [22, -42], [27, -37], [22, -33], [25, -28], [21, -27]], FOAM[2]);
  for (let k = 0; k < 4; k++) box(g, 22 + (k % 2) * 3, -46 + k * 5, 4, 1, FOAM[4]);
  // (the flanges, bolted, frosted)
  flangeH(g, -34, -39, 12, COLD); flangeH(g, -6, -39, 12, COLD);
  // (the valve on top, its blue wheel iced over)
  box(g, -15, -58, 6, 10, INK); box(g, -14, -57, 4, 9, COLD[3]); box(g, -14, -57, 1, 9, COLD[5]);
  wheel(g, -12, -62, 6, BLUEV);
  // (the rime: a lumpy white crust along the top, more of it the colder it's got)
  for (let x = -42; x < 40; x += 3) { const h = 2 + Math.round(hash(x * 0.37) * (2 + step * 1.5)); box(g, x, -48 - h, 3, h + 1, ICE[4]); box(g, x, -48 - h, 2, 1, ICE[5]); if (hash(x * 1.3) > 0.6) box(g, x + 1, -48 - h + 1, 1, 1, ICE[3]); }
  dz(g, -42, -46, 82, 4, ICE[5]);
  dz(g, -42, -36, 82, 3, ICE[4], 1);
  // (icicles hanging off the bottom, longer as it gets colder)
  for (let k = 0; k < 10; k++) {
    const x = -40 + k * 8 + (hash(k * 2.2) * 4 | 0), len = 3 + Math.round(hash(k * 5.1) * (3 + step * 4));
    polyF(g, [[x - 2, -30], [x + 2, -30], [x, -30 + len]], ICE[3]); box(g, x - 1, -30, 1, Math.max(1, len - 3), ICE[5]); box(g, x, -30 + len - 1, 1, 1, ICE[1]);
  }
  // (its end, split open: jagged, the inside dark, frost round the lips)
  polyF(g, [[40, -49], [50, -53], [46, -44], [53, -36], [44, -32], [48, -27], [40, -29]], INK);
  polyF(g, [[40, -48], [49, -52], [45, -44], [52, -36], [43, -33], [46, -28], [40, -30]], COLD[3]);
  polyF(g, [[40, -45], [44, -43], [42, -38], [45, -34], [40, -33]], '#050A12');
  box(g, 41, -49, 6, 1, ICE[5]); box(g, 46, -37, 4, 1, ICE[5]);
  g.restore();
};

/** A frost fern: a stem with its fronds off either side, white-blue, at (x, y) heading `ang`, `n` long. */
const fern = (c: Ctx, x: number, y: number, ang: number, n: number, col: string, tip: string) => {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let i = 0; i < n; i++) {
    const px = x + ca * i, py = y + sa * i;
    box(c, px, py, 1, 1, col);
    if (i % 3 === 1 && i < n - 2) { const L = Math.max(1, (n - i) * 0.4); for (const s of [-1, 1]) for (let j = 1; j <= L; j++) box(c, px + (ca * 0.6 - sa * s) * j, py + (sa * 0.6 + ca * s) * j, 1, 1, j === Math.floor(L) ? tip : col); }
  }
  box(c, x + ca * n, y + sa * n, 1, 1, tip);
};

const drawNitro = (c: Ctx, x: number, dir: 1 | -1, ph: MainPhase, fr: number, D: MainDims) => {
  drawCavity(c, x, GY - 50, 90, 70, 63, fr);
  const frost = ph.s === 'tell' ? ph.k : ph.s === 'on' ? 1 : 0.15;
  // (frost ferns creeping out over the wall round the hole, more and longer as it gets colder)
  for (let k = 0; k < Math.round(5 + frost * 15); k++) {
    const a = hash(k * 2.3) * Math.PI * 2, r = 34 + hash(k * 4.1) * (24 + frost * 46), cx = x + Math.cos(a) * r, cy = GY - 44 + Math.sin(a) * r * 0.55;
    if (cy > GY - 3) continue;
    fern(c, Math.round(cx), Math.round(cy), a + (hash(k * 7.7) - 0.5), Math.round(4 + frost * 8 * hash(k * 1.9) + 2), ICE[4], '#FFFFFF');
  }
  c.globalAlpha = 0.3 * frost; c.fillStyle = ICE[4]; c.beginPath(); c.ellipse(x, GY - 40, 56 + frost * 40, 28 + frost * 18, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // (the pipe, its rime and icicles growing with the cold)
  const step = Math.min(3, Math.floor(frost * 3.99));
  still(c, `nitromain-${dir}-${step}`, x, GY, -60, -72, 120, 72, (g) => nitroPipe(g, dir, step));
  // (frost ferns spreading over the carpet in front of it)
  for (let k = 0; k < Math.round(3 + frost * 10); k++) {
    const fx = x + dir * (10 + hash(k * 3.9) * (40 + frost * 120)) + (hash(k * 8.1) - 0.5) * 40;
    fern(c, Math.round(fx), GY - 1, Math.PI + (hash(k * 2.7) > 0.5 ? 0 : Math.PI) + (hash(k * 5.3) - 0.5) * 0.4, Math.round(4 + frost * 7 * hash(k)), ICE[3], ICE[5]);
  }
  const ex = x + dir * 41;
  // (vapor dribbling off the split end, rolling along the floor)
  if (ph.s !== 'on') {
    const n = ph.s === 'tell' ? 5 : 1;
    for (let k = 0; k < n; k++) {
      const tt = ((fr * (ph.s === 'tell' ? 1.6 : 0.6) + k * 10) % 40) / 40, px = ex + dir * (4 + tt * 34), py = Math.min(GY - 6, GY - 40 + tt * 40), r = 3 + tt * 9;
      c.globalAlpha = 0.55 * (1 - tt * 0.6);
      c.fillStyle = '#B8CCE0'; c.beginPath(); c.ellipse(px, py, r, r * 0.7, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E8F6FF'; c.beginPath(); c.ellipse(px - r * 0.2, py - r * 0.2, r * 0.75, r * 0.55, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
    }
    if (ph.s === 'tell') {
      // (the tell: it sputters: white spurts out the split end, a hiss of crystals)
      if (fr % 8 < 4) { box(c, ex + dir * 4 - 3, GY - 43, 6, 6, '#FFFFFF'); box(c, ex + dir * 4 - 1, GY - 46, 2, 12, '#FFFFFF'); box(c, ex + dir * 8 - 1, GY - 41, 6 * dir, 2, ICE[4]); }
      for (let k = 0; k < 4; k++) { const tt = ((fr * 2 + k * 7) % 20) / 20; box(c, ex + dir * (6 + tt * 24), GY - 40 + (k - 1.5) * 4 * tt, 1, 1, '#FFFFFF'); }
    }
    return;
  }
  // (the jet: a roaring white-blue plume along the floor in banded columns, its core hard white, the pressure cone at
  // the split end; fog boiling off its top and rolling on past its end; the carpet frosted under it)
  const len = D.nitroLen * Math.min(1, ph.k * 6), a = x, b = x + dir * len;
  c.fillStyle = '#C8E8FF'; c.beginPath(); c.ellipse((a + b) / 2, GY, Math.abs(b - a) / 2 + 12, 6, 0, 0, Math.PI * 2); c.fill();
  for (let xx = 0; xx < len; xx += 6) {
    const X = a + dir * xx, hh = D.nitroH * (0.4 + 0.6 * (xx / D.nitroLen)) * (0.8 + 0.2 * Math.sin(xx * 0.2 + fr * 0.6)), band = (xx + fr * 9) % 36;
    c.fillStyle = 'rgba(120, 180, 230, 0.5)'; c.fillRect(X - 3, GY - hh - 2, 6, hh + 2);
    c.fillStyle = band < 18 ? 'rgba(200, 232, 252, 0.8)' : 'rgba(176, 216, 246, 0.8)'; c.fillRect(X - 3, GY - hh * 0.85, 6, hh * 0.75);
    c.fillStyle = 'rgba(236, 248, 255, 0.92)'; c.fillRect(X - 3, GY - hh * 0.62, 6, hh * 0.4);
    c.fillStyle = '#FFFFFF'; c.fillRect(X - 3, GY - hh * 0.48, 6, Math.max(2, hh * 0.14));
    if ((xx / 6 + Math.floor(fr / 2)) % 5 === 0) box(c, X, GY - hh * 0.5 + ((fr + xx) % 7) - 3, 1, 1, ICE[2]);
  }
  for (let k = 0; k < 4; k++) { const r = 4 + k * 4; c.globalAlpha = 0.5 - k * 0.1; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex + dir * (6 + k * 6), GY - 40 + k * 3, r, r * 0.8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  // (fog boiling off it and rolling on along the carpet)
  for (let k = 0; k < 10; k++) {
    const tt = ((fr * 1.2 + k * 17) % 60) / 60, fx = a + dir * (tt * (len + 120)), r = 8 + tt * 16;
    c.globalAlpha = 0.4 * (1 - tt * 0.8) * (fx * dir > (a + dir * len) * dir ? 0.7 : 1);
    c.fillStyle = '#D8EAF8'; c.beginPath(); c.ellipse(fx, GY - 6 - (k % 3) * 6 - Math.sin(tt * 4 + k) * 4, r * 1.4, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F4FBFF'; c.beginPath(); c.ellipse(fx - r * 0.3, GY - 8 - (k % 3) * 6 - Math.sin(tt * 4 + k) * 4, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  box(c, Math.min(a, b), GY - 2, Math.abs(b - a), 3, '#F0FAFF'); dz(c, Math.min(a, b), GY - 4, Math.abs(b - a), 2, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// The live wires

const waterMain = (g: Ctx) => {
  // (the burst copper water main hanging out of the ceiling: a flange, a coupling, the end split and bent)
  pipeV(g, -5, 5, -24, 4, COPPER);
  flangeV(g, 0, -8, 9, COPPER);
  for (let y = -22; y < 0; y += 6) box(g, -4, y, 2, 1, '#3A8A6A'); // (verdigris)
  polyF(g, [[-6, 4], [6, 4], [9, 10], [4, 8], [2, 13], [-2, 9], [-6, 12], [-8, 7]], INK);
  polyF(g, [[-5, 4], [5, 4], [8, 9], [4, 7], [2, 11], [-2, 8], [-5, 10], [-7, 7]], COPPER[3]);
  box(g, -3, 5, 6, 2, '#0A0604');
  // (the cable's clamp off it, a bracket bolted to the joist)
  box(g, 6, -20, 12, 5, INK); box(g, 7, -19, 10, 3, ALU[3]); box(g, 7, -19, 10, 1, ALU[5]); bolt(g, 9, -18, ALU); bolt(g, 14, -18, ALU);
};

/** The cable's frayed end: the jacket split back, three conductors (red, black, green) splayed, bare copper strands. */
const cableEnd = (c: Ctx, x: number, y: number, fr: number, live: number) => {
  box(c, x - 4, y - 10, 8, 6, INK); box(c, x - 3, y - 9, 6, 4, '#2A2A30'); box(c, x - 3, y - 9, 6, 1, '#E8C020');
  polyF(c, [[x - 4, y - 5], [x - 7, y - 1], [x - 2, y - 4]], '#1A1A1E'); polyF(c, [[x + 4, y - 5], [x + 7, y - 2], [x + 2, y - 4]], '#1A1A1E');
  const cond: [number, string, string][] = [[-1, '#C02A26', '#E05A4A'], [0, '#18181C', '#4A4A52'], [1, '#2A8A3A', '#5AC06A']];
  for (const [s, col, hi] of cond) {
    const ex = x + s * 6, ey = y + 1 + Math.abs(s);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x + s, y - 4); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.strokeStyle = hi; c.lineWidth = 0.6; c.stroke();
    for (let k = -1; k <= 1; k++) { box(c, ex + k, ey, 1, 2 + ((k + 3) % 2), COPPER[4]); box(c, ex + k * 2, ey + 2, 1, 1, COPPER[5]); }
    if (live && (fr + (s + 1) * 3) % 5 < 2) { box(c, ex - 1 + s, ey + 2, 2, 2, '#FFFFFF'); box(c, ex + s * 3, ey - 1, 1, 1, '#A5F3FC'); }
  }
};

/** A crackle of lightning (layered glow, cyan, white core) through `pts`. */
const arc = (c: Ctx, pts: [number, number][], scale = 1) => {
  for (const [w, col] of [[7 * scale, 'rgba(165, 243, 252, 0.22)'], [3 * scale, '#67E8F9'], [1.2 * scale, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.beginPath(); pts.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
};

const drawWires = (c: Ctx, x: number, ph: MainPhase, fr: number, D: MainDims) => {
  drawCavity(c, x + 20, CEIL_Y + 20, 80, 40, 71, fr);
  still(c, 'watermain', x + 30, CEIL_Y + 24, -12, -26, 34, 42, waterMain);
  // (the water gushing out of it in a stream, splashing where it lands)
  for (let k = 0; k < 8; k++) { const tt = ((fr * 2 + k * 23) % 80) / 80; box(c, x + 29 + (k % 3), CEIL_Y + 36 + tt * (GY - CEIL_Y - 38), 2, 6, k % 2 ? '#9ACCE8' : '#C8E8F8'); }
  for (let k = 0; k < 4; k++) { const tt = ((fr + k * 6) % 16) / 16; box(c, x + 30 + (k - 1.5) * tt * 14, GY - 4 - Math.sin(tt * Math.PI) * 10, 2, 2, '#DFF4FF'); }
  // (the flood: banded, a dark rim, the room's light in it, ripples rolling out from the stream)
  const P = D.puddleHW;
  c.fillStyle = WATER[0]; c.beginPath(); c.ellipse(x, GY + 2, P + 5, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = WATER[2]; c.beginPath(); c.ellipse(x, GY + 1, P, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = WATER[3]; c.beginPath(); c.ellipse(x - 8, GY, P * 0.85, 6.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = WATER[4]; c.beginPath(); c.ellipse(x - 20, GY - 0.5, P * 0.6, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = WATER[5]; c.beginPath(); c.ellipse(x - 34, GY - 1, P * 0.3, 2, 0, 0, Math.PI * 2); c.fill();
  dz(c, x - P * 0.7, GY + 4, P * 1.4, 2, WATER[1]);
  for (let k = 0; k < 4; k++) { const rr = ((fr * 0.5 + k * 15) % 60) / 60; c.strokeStyle = `rgba(223, 244, 255, ${(0.75 * (1 - rr)).toFixed(2)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x + 30, GY + 1, 6 + rr * 60, 1.5 + rr * 5, 0, 0, Math.PI * 2); c.stroke(); }
  for (let k = 0; k < 6; k++) { const sx = x - P + 20 + ((fr * 0.5 + k * 53) % (P * 2 - 40)); box(c, sx, GY - 1, 8, 1, '#DFF4FF'); box(c, sx + 2, GY, 3, 1, WATER[5]); }
  // (the room's pink light in it)
  box(c, x - 60, GY - 1, 14, 1, '#F9A8D4'); box(c, x + 40, GY, 10, 1, '#F9A8D4');
  // (the cable hanging into it: jacket, its yellow stripe, sagging; the frayed end in the water)
  const sway = Math.sin(fr * 0.05) * 8, endX = x + 10 + sway * 0.5;
  const cable = () => { c.beginPath(); c.moveTo(x + 40, CEIL_Y + 6); c.quadraticCurveTo(x + 30 + sway, (CEIL_Y + GY) / 2, endX, GY - 8); };
  c.lineCap = 'round';
  c.strokeStyle = '#050505'; c.lineWidth = 6; cable(); c.stroke();
  c.strokeStyle = '#2A2A30'; c.lineWidth = 4; cable(); c.stroke();
  c.strokeStyle = '#4A4A52'; c.lineWidth = 1; c.save(); c.translate(-1, 0); cable(); c.stroke(); c.restore();
  c.strokeStyle = '#E8C020'; c.lineWidth = 1; c.save(); c.translate(1, 0); cable(); c.stroke(); c.restore();
  // (a split in the jacket partway down, copper showing)
  const my = (CEIL_Y + GY) / 2 + 40, mx = x + 22 + sway * 0.7;
  box(c, mx - 2, my, 5, 4, INK); box(c, mx - 1, my + 1, 3, 2, COPPER[4]);
  const live = ph.s === 'on' ? 1 : ph.s === 'tell' ? 0.5 : 0;
  cableEnd(c, endX, GY - 4, fr, live);
  // (the tell: sparks spitting off the copper and crackling over the water)
  if (ph.s === 'tell') {
    for (let k = 0; k < 4; k++) if ((fr + k * 5) % 6 < 3) { const sx = endX - 8 + k * 5, sy = GY - 8 - ((fr + k) % 6); box(c, sx, sy, 2, 2, '#FDE047'); box(c, sx + 1, sy - 2, 1, 1, '#FFFFFF'); }
    for (let k = 0; k < 3; k++) if ((fr + k * 7) % 9 < 3) { const sx = x - P + 30 + hash(k * 5 + Math.floor(fr / 9)) * (P * 2 - 60); arc(c, [[sx - 6, GY - 1], [sx - 2, GY - 4], [sx + 2, GY - 1], [sx + 6, GY - 3]], 0.5); }
  }
  if (ph.s === 'quiet' && fr % 60 < 2) box(c, endX - 1, GY - 9, 2, 2, '#FDE047');
  if (ph.s !== 'on') return;
  // (live: arcs crawling all over the water, up off it; steam spitting where they strike; the blue glow)
  for (let i = 0; i < 2; i++) { c.globalAlpha = (0.12 + 0.08 * Math.sin(fr)) * (1 - i * 0.4); c.fillStyle = '#A5F3FC'; c.beginPath(); c.ellipse(x, GY - 6, P + 10 + i * 20, 22 + i * 14, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (let k = 0; k < 5; k++) {
    // (crawling along the surface: each wanders its way across)
    const base = x - P + ((fr * (2 + k * 0.5) + k * 61) % (P * 2)), pts: [number, number][] = [];
    for (let m = 0; m < 6; m++) pts.push([base + (m - 3) * 8 + (hash(k * 9 + m + Math.floor(fr / 2)) - 0.5) * 6, GY - 1 - hash(k * 3 + m * 7 + Math.floor(fr / 2)) * 5]);
    arc(c, pts, 0.7);
  }
  for (let k = 0; k < 6; k++) {
    // (up off it)
    let ax = k === 0 ? endX : x - P + hash(k * 4.3 + Math.floor(fr / 3)) * P * 2, ay = GY - 2;
    const pts: [number, number][] = [[ax, ay]];
    for (let m = 0; m < 4; m++) { ax += (hash(k * 11 + m * 3 + fr) - 0.5) * 30; ay -= 6 + hash(k * 7 + m + fr) * 14; pts.push([ax, ay]); }
    arc(c, pts);
    box(c, pts[4][0] - 1, pts[4][1] - 1, 3, 3, '#FFFFFF');
    // (a fork off it)
    arc(c, [pts[2], [pts[2][0] + (hash(k + fr) - 0.5) * 20, pts[2][1] - 6]], 0.5);
  }
  for (let k = 0; k < 5; k++) {
    // (steam spitting up off the water where they strike)
    const tt = ((fr * 1.4 + k * 13) % 30) / 30, sx = x - P + 20 + hash(k * 6.1) * (P * 2 - 40);
    c.globalAlpha = 0.5 * (1 - tt); c.fillStyle = '#F4F4F8'; c.beginPath(); c.ellipse(sx + Math.sin(tt * 5 + k) * 3, GY - 4 - tt * 30, 3 + tt * 7, 2 + tt * 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
};

/** A main, torn loose: the plumbing and its hole, and what it's doing (quiet, the tell, on). */
export const drawMain = (c: Ctx, kind: 'heat' | 'nitro' | 'wires', x: number, dir: 1 | -1, ph: MainPhase, fr: number, D: MainDims) => {
  if (kind === 'heat') drawHeat(c, x, ph, fr, D);
  else if (kind === 'nitro') drawNitro(c, x, dir, ph, fr, D);
  else drawWires(c, x, ph, fr, D);
};

// ---------------------------------------------------------------------------------------------------------------
// Her throws, and the block of ice

/** The fire ball's burning patch on the carpet. */
export const drawPatch = (c: Ctx, x: number, fr: number) => {
  c.fillStyle = '#1A0A06'; c.beginPath(); c.ellipse(x, GY + 1, 42, 4.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A1A0A'; c.beginPath(); c.ellipse(x, GY + 1, 30, 2.5, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 5; k++) flameT(c, x - 32 + k * 16, GY, 9 + ((fr + k * 5) % 10) + hash(k * 2.1) * 4, 7, fr, k + 20);
  c.globalAlpha = 0.16; c.fillStyle = '#FDBA74'; c.beginPath(); c.ellipse(x, GY - 2, 56, 7, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  if (fr % 9 < 3) box(c, x - 20 + ((fr * 7) % 40), GY - 14 - (fr % 9) * 3, 1, 2, '#FDE047');
  for (let k = 0; k < 2; k++) { const tt = ((fr + k * 15) % 30) / 30; c.globalAlpha = 0.35 * (1 - tt); c.fillStyle = '#2A2028'; c.beginPath(); c.ellipse(x + (k ? 8 : -10), GY - 18 - tt * 30, 4 + tt * 8, 3 + tt * 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

/** A ball of fire: stepped rings, tongues licking back off it, smoke and sparks behind. */
export const drawFireball = (c: Ctx, x: number, y: number, vx: number, vy: number, fr: number) => {
  const back = Math.atan2(-vy, -vx);
  for (let k = 0; k < 4; k++) { const tt = ((fr + k * 4) % 16) / 16; c.globalAlpha = 0.35 * (1 - tt); c.fillStyle = '#3E3440'; c.beginPath(); c.ellipse(x + Math.cos(back) * (14 + tt * 22), y + Math.sin(back) * (14 + tt * 22) - tt * 6, 4 + tt * 6, 3 + tt * 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (let k = 0; k < 5; k++) { const a = back + (k - 2) * 0.45 + Math.sin(fr * 0.6 + k) * 0.15, L = 18 + ((fr + k * 3) % 6); polyF(c, [[x + Math.cos(a - 0.5) * 9, y + Math.sin(a - 0.5) * 9], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.cos(a + 0.5) * 9, y + Math.sin(a + 0.5) * 9]], k % 2 ? FIRE[2] : FIRE[1]); }
  for (let k = 0; k < 4; k++) { const a = fr * 0.5 + k * 1.6; polyF(c, [[x + Math.cos(a) * 8, y + Math.sin(a) * 8], [x + Math.cos(a + 0.3) * 15, y + Math.sin(a + 0.3) * 15], [x + Math.cos(a + 0.6) * 8, y + Math.sin(a + 0.6) * 8]], k % 2 ? FIRE[3] : FIRE[2]); }
  const rings: [number, string, number][] = [[12, FIRE[0], 0], [11, FIRE[1], 0], [9, FIRE[2], 1], [6.5, FIRE[3], 1.6], [4.5, FIRE[4], 2.2], [2.2, FIRE[5], 2.8]];
  for (const [r, col, o] of rings) { c.fillStyle = col; c.beginPath(); c.ellipse(x - o, y - o, r, r, 0, 0, Math.PI * 2); c.fill(); }
  box(c, x - 4, y - 5, 2, 1, '#FFFFFF');
  for (let k = 1; k < 5; k++) box(c, x + Math.cos(back) * k * 7 + ((fr + k) % 3) - 1, y + Math.sin(back) * k * 7 + ((fr * k) % 5) - 2, 2, 2, k % 2 ? '#FDE047' : '#F97316');
};

/** A lump of ice: a faceted crystal, stepped, glinting; frost shards spinning off it, a trail of rime. */
export const drawIceball = (c: Ctx, x: number, y: number, vx: number, fr: number) => {
  const s = Math.sign(vx || 1);
  for (let k = 1; k < 5; k++) { c.globalAlpha = 0.5 / k; c.fillStyle = ICE[4]; c.beginPath(); c.ellipse(x - k * 6 * s, y, 7 - k, 5 - k * 0.8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; box(c, x - k * 7 * s + ((fr + k) % 3) - 1, y + ((fr * k) % 7) - 3, 1, 1, '#FFFFFF'); }
  const r0 = fr * 0.08, hx = (k: number, r: number): [number, number] => [x + Math.cos((k * Math.PI) / 3 + r0) * r, y + Math.sin((k * Math.PI) / 3 + r0) * r];
  // (points sticking out of it: a crystal cluster)
  for (let k = 0; k < 6; k += 2) { const [px, py] = hx(k, 16); polyF(c, [hx(k - 0.4, 9), [px, py], hx(k + 0.4, 9)], ICE[1]); polyF(c, [hx(k - 0.2, 9), [px, py], hx(k, 9)], ICE[4]); }
  polyF(c, [0, 1, 2, 3, 4, 5].map((k) => hx(k, 11.5)), ICE[0]); polyF(c, [0, 1, 2, 3, 4, 5].map((k) => hx(k, 10)), ICE[2]);
  polyF(c, [[x, y], hx(3, 10), hx(4, 10), hx(5, 10)], ICE[3]); polyF(c, [[x, y], hx(4, 10), hx(5, 10)], ICE[4]); polyF(c, [[x, y], hx(0, 10), hx(1, 10)], ICE[1]);
  polyF(c, [[x - 1, y - 1], hx(4, 6), hx(5, 6)], ICE[5]);
  box(c, x - 4, y - 5, 2, 2, '#FFFFFF');
  if (fr % 10 < 4) { box(c, x + 3, y - 8, 1, 5, '#FFFFFF'); box(c, x + 1, y - 6, 5, 1, '#FFFFFF'); }
  // (shards spinning round it)
  for (let k = 0; k < 3; k++) { const a = fr * 0.25 + (k * Math.PI * 2) / 3; box(c, x + Math.cos(a) * 18, y + Math.sin(a) * 10, 2, 1, ICE[5]); box(c, x + Math.cos(a) * 18 + 1, y + Math.sin(a) * 10 + 1, 1, 1, ICE[3]); }
};

/** The bolt off the cable's end: the aim (a thin flicker), then the strike (forked, glowing). */
export const drawBolt = (c: Ctx, x: number, y: number, tx: number, ty: number, t: number, aimT: number, strikeT: number, fr: number) => {
  const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1, len = 1400, ex = x + (dx / d) * len, ey = y + (dy / d) * len;
  if (t < aimT) {
    if (fr % 4 < 2) { c.strokeStyle = 'rgba(165, 243, 252, 0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke(); }
    // (charging up at the cable's end: a ball of sparks gathering)
    const k = t / aimT;
    for (let m = 0; m < 5; m++) { const a = fr * 0.7 + m * 1.3, r = 10 * (1 - k) + 3; box(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2, m % 2 ? '#67E8F9' : '#FFFFFF'); }
    c.globalAlpha = 0.3 + 0.4 * k; c.fillStyle = '#A5F3FC'; c.beginPath(); c.ellipse(x, y, 4 + k * 4, 4 + k * 4, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    return;
  }
  if (t >= aimT + strikeT) return;
  const pts: [number, number][] = [];
  for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push([x + (ex - x) * u + (k && k < 30 ? (Math.random() - 0.5) * 16 : 0), y + (ey - y) * u + (k && k < 30 ? (Math.random() - 0.5) * 16 : 0)]); }
  arc(c, pts, 1.15);
  for (let f = 0; f < 4; f++) {
    // (forks off it)
    const i = 4 + f * 6, [fx, fy] = pts[i], fork: [number, number][] = [[fx, fy]];
    let ax = fx, ay = fy;
    for (let m = 0; m < 3; m++) { ax += (dx / d) * 14 + (Math.random() - 0.5) * 20; ay += (dy / d) * 14 + (Math.random() - 0.5) * 20; fork.push([ax, ay]); }
    arc(c, fork, 0.5);
  }
  c.globalAlpha = 0.5; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};

/** Him frozen in a block of ice (x, y, w, h its box; `fill` how far he's mashed out): bevelled faces in steps, bubbles and
 *  a refraction band in it, rime crusted on its edges, icicles off its foot, frost ferns out across the floor, cracks. */
export const drawIceBlock = (c: Ctx, x: number, y: number, w: number, h: number, fill: number, fr: number) => {
  // (frost ferns spreading out from its foot over the carpet)
  for (let k = 0; k < 8; k++) fern(c, Math.round(x + (k % 2 ? w + 2 : -2)), Math.round(y + h - 1), (k % 2 ? 0 : Math.PI) + (hash(k * 3.1) - 0.5) * 0.5 - 0.15, 5 + Math.round(hash(k * 1.7) * 9), ICE[3], ICE[5]);
  c.fillStyle = 'rgba(186, 230, 253, 0.5)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(224, 242, 254, 0.55)'; c.fillRect(x, y, w, 5); c.fillRect(x, y, 5, h);
  c.fillStyle = 'rgba(58, 114, 170, 0.45)'; c.fillRect(x + w - 5, y + 5, 5, h - 5); c.fillRect(x + 5, y + h - 5, w - 5, 5);
  c.fillStyle = 'rgba(30, 74, 122, 0.3)'; c.fillRect(x + w - 2, y + 5, 2, h - 5);
  c.fillStyle = 'rgba(255, 255, 255, 0.65)'; c.fillRect(x + 7, y + 7, 3, h - 16); c.fillRect(x + 7, y + 7, w - 18, 2);
  c.globalAlpha = 0.3; polyF(c, [[x + 8, y + h * 0.6], [x + w * 0.6, y + 8], [x + w * 0.8, y + 8], [x + 8, y + h * 0.8]], '#FFFFFF'); c.globalAlpha = 1;
  c.globalAlpha = 0.18; polyF(c, [[x + 8, y + h * 0.9], [x + w * 0.85, y + h * 0.3], [x + w * 0.92, y + h * 0.36], [x + 14, y + h * 0.98]], '#FFFFFF'); c.globalAlpha = 1;
  // (bubbles frozen in it)
  for (let k = 0; k < 9; k++) { const bx = x + 6 + hash(k * 4.7) * (w - 12), by = y + 10 + hash(k * 2.9) * (h - 20); box(c, bx, by, 2, 2, 'rgba(255, 255, 255, 0.7)'); box(c, bx + 1, by + 1, 1, 1, 'rgba(58, 114, 170, 0.6)'); }
  c.strokeStyle = '#E0F2FE'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  c.strokeStyle = '#3A72AA'; c.lineWidth = 1; c.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3);
  // (rime crusted along its top, its edges; icicles off it)
  for (let k = 0; k < w; k += 3) { const rh = 2 + Math.round(hash(k * 0.7) * 3); box(c, x + k, y - rh, 3, rh + 1, '#FFFFFF'); box(c, x + k, y - rh, 1, 1, ICE[4]); box(c, x + k, y + h - 1, 3, 2 + (k % 6 ? 0 : 1), '#F0FAFF'); }
  for (let k = 0; k < h; k += 5) { box(c, x - 2, y + k, 2, 3, '#F0FAFF'); box(c, x + w, y + k + 2, 2, 3, ICE[4]); }
  for (let k = 0; k < 4; k++) { const ix = x + 6 + k * ((w - 12) / 3), L = 4 + Math.round(hash(k * 6.3) * 5); polyF(c, [[ix - 2, y - 3], [ix + 2, y - 3], [ix, y - 3 + L * 0.2]], ICE[3]); }
  // (a glint running over it)
  const gt = (fr % 90) / 90; if (gt < 0.3) { const gx = x + gt / 0.3 * w; c.globalAlpha = 0.6; polyF(c, [[gx - 4, y], [gx, y], [gx - 12, y + h], [gx - 16, y + h]], '#FFFFFF'); c.globalAlpha = 1; }
  // (cracks as he mashes)
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath();
  for (let k = 0; k < Math.floor(fill * 8); k++) { const cx = x + hash(k * 3.3) * w, cy = y + hash(k * 5.1) * h, ex = cx + (hash(k) - 0.5) * 24, ey = cy + (hash(k * 2) - 0.5) * 24; c.moveTo(cx, cy); c.lineTo(ex, ey); c.lineTo(ex + (hash(k * 9) - 0.5) * 10, ey + (hash(k * 8) - 0.5) * 10); }
  c.stroke();
  c.strokeStyle = 'rgba(58, 114, 170, 0.6)'; c.beginPath();
  for (let k = 0; k < Math.floor(fill * 8); k++) { const cx = x + hash(k * 3.3) * w + 1, cy = y + hash(k * 5.1) * h + 1; c.moveTo(cx, cy); c.lineTo(cx + (hash(k) - 0.5) * 24, cy + (hash(k * 2) - 0.5) * 24); }
  c.stroke();
};
