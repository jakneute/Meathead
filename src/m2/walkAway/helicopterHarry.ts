// The walk-away from HELICOPTER HARRY (Foreign Lands' boss): back out across the crash site toward the camera at
// whatever hour it is now (timeOfDay.ts). The AMERICA pavilion's poured slab (in steps: its aggregate, the sawn joints
// lit along their lips, scorch, her concrete set in puddles, the holes her torch punched, cracks, the surveyors' paint,
// spent brass everywhere). Far off behind him: the rest of Foreign Lands burning in the haze, the pavilion's steel and
// its crane; the dig between the two scaffold towers, its berm with the gauntlet's nine wrecked landmarks along it (the
// heli's 3D wrecks, the same ones: on their sides, eyes X'd), burning and smoking, and in it, where she went over, her
// hand up out of the rubble. Along the way: her head blown open (hollow concrete, rebar, the crown's broken rays), her
// revolver, her torch (or, if she came apart, her torch snapped and her pieces), chunks of her green shell, his tie-dye
// in shreds, the ride's emergency jetpack. And Harry's fate, as it went: buried under her concrete (his socks and
// sandals out of one end, his arm out the top flipping the bird, his blood seeped out round it), face down in his own
// puke pool (barfed to death), or in a heap on his back shot full of his own rounds, in his blood (anything else). His toy: the
// SOUVENIR launcher (its walk-away act: walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, INK, HOR, LW, box, hash, smoke, fire, mix } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay } from '../timeOfDay';
import { souvenir } from './toys';
import { keptForRevisits } from '../store';
import { drawRambo } from '../foreign/harry/rambo';
import { drawRevolverAt, drawTorchAt, PAT, CONC, PUKE } from '../foreign/harry/liberty';
import { MEMO_DEATH, MEMO_CRUMBLED } from '../foreign/harry/fight';
import { TIEDYE, dith, shapeR, ellR, lineR, SKIN_R, DENIM_R, SOCK_R, LEATHER_R, GRAY_R, BAND_R, type Ramp } from '../foreign/heli/harryArt';
import { drawWreck3d } from '../foreign/heli/landmarks3d';
import { shoreFrom, paintMark } from '../foreign/teases';
import { DC, type Cam } from '../foreign/heli/park';
import type { MechId } from '../foreign/heli/lines';

const SW = LW + 40;
/** The slab's concrete (darkest first), her concrete set hard, the blood. */
const SLAB = ['#3E3A36', '#5A5550', '#76706A', '#8E8880', '#A8A29A', '#C6C0B6'];
const SET: Ramp = ['#A8A29E', '#7C766F', '#5E5853', '#44403C', '#1C1917'];
const BLOOD = ['#2A0404', '#5A0A0A', '#8B1010', '#B91C1C', '#E04848'];

// ---------------------------------------------------------------------------------------------------------------
// The floor: the slab, its joints, scorch, her concrete set in puddles, the torch's holes, brass

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, SLAB[3]);
  // (the aggregate: three steps of grit, a pebble showing here and there)
  for (let i = 0; i < 1100; i++) { const t = hash(i * 0.71); box(g, hash(i * 1.3) * w, hash(i * 2.9) * h, t > 0.85 ? 2 : 1, 1, t > 0.7 ? SLAB[5] : t > 0.35 ? SLAB[2] : SLAB[4]); }
  // (the pours' sawn joints: a dark cut, a lit lip on the far side)
  for (let y = 0; y < h; y += 48) { box(g, 0, y, w, 1, SLAB[0]); box(g, 0, y + 1, w, 1, SLAB[5]); }
  for (let x = 0; x < w; x += 64) { box(g, x, 0, 1, h, SLAB[0]); box(g, x + 1, 0, 1, h, SLAB[4]); }
  // (cracks: inked zigzags, lit along one side)
  for (let k = 0; k < 6; k++) {
    let x = hash(k * 5.3) * w, y = hash(k * 7.1) * h;
    for (let s = 0; s < 6; s++) { const nx = x + 3 + hash(k * 9 + s) * 6, ny = y + (hash(k * 3 + s) - 0.5) * 8; g.strokeStyle = SLAB[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); box(g, x, y + 1, 2, 1, SLAB[5]); x = nx; y = ny; }
  }
  // (scorch: the crash, the fires; dithered round their edges)
  for (let k = 0; k < 4; k++) {
    const x = hash(k * 3.7) * w, y = hash(k * 5.1) * h, r = 14 + hash(k) * 16;
    g.fillStyle = dith(g, 'rgba(28, 25, 23, 0.6)'); g.beginPath(); g.ellipse(x, y, r + 6, r * 0.6 + 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(28, 25, 23, 0.55)'; g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); g.fill();
  }
  // (her puke, set: gray puddles in steps with a lit lip)
  for (let k = 0; k < 5; k++) {
    const x = hash(k * 8.3 + 1) * w, y = hash(k * 2.3 + 4) * h, r = 8 + hash(k * 4) * 10;
    ellR(g, x, y, r + 3, r * 0.6 + 2, INK); ellR(g, x, y, r + 2, r * 0.6 + 1, SET[2]); ellR(g, x - 1, y - 1, r, r * 0.55, SET[1]);
    ellR(g, x - 2, y - 2, r * 0.6, r * 0.3, dith(g, SET[0])); box(g, x - r * 0.4, y - r * 0.3, r * 0.6, 1, SET[0]);
  }
  // (the holes her torch punched: dark, their broken rims)
  for (let k = 0; k < 3; k++) { const x = hash(k * 13.1) * w, y = hash(k * 11.7) * h; ellR(g, x, y, 9, 4, SLAB[1]); ellR(g, x, y + 0.5, 6, 2.6, '#0E0A08'); box(g, x - 8, y - 4, 4, 2, SLAB[4]); box(g, x + 5, y - 3, 3, 2, SLAB[4]); }
  // (the surveyors' paint: pink crosses, a blue arrow)
  for (let k = 0; k < 3; k++) { const x = hash(k * 4.9) * w, y = hash(k * 6.3) * h; box(g, x - 4, y, 9, 1, '#F472B6'); box(g, x, y - 4, 1, 9, '#F472B6'); }
  box(g, w * 0.7, h * 0.4, 10, 1, '#60A5FA'); box(g, w * 0.7 + 8, h * 0.4 - 2, 2, 5, '#60A5FA');
  // (spent brass: the casing lit along its top, its rim dark)
  for (let i = 0; i < 56; i++) { const x = hash(i * 6.1) * w, y = hash(i * 9.7) * h; box(g, x, y, 3, 1, '#B7791F'); box(g, x, y, 2, 1, '#FDE047'); box(g, x + 2, y, 1, 1, '#7C4A03'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the burning land, the pavilion's steel; the dig between the towers, the wrecks along its berm, her hand

const FAR_H = 70;
const paintFar = (g: Ctx) => {
  const W2 = SW * 2, B = FAR_H * 2, tod = timeOfDay();
  const base = mix('#4A3A48', '#141832', tod.lamps * 0.5), lt = mix(base, '#FFFFFF', 0.14), air = mix('#B8A0A8', '#2A2440', tod.lamps * 0.6);
  // (Foreign Lands across the water from the dig, where they are round the ring (foreign/teases.ts: the same landmarks
  // the streets' far shore and the fight have), scorched from the foot up; the far bank's trees in steps in front)
  for (const o of shoreFrom(62400)) paintMark(g, o.id, W2 / 2 + o.dx * 0.95, B - 8, 0.42, 0.62, tod);
  g.save(); g.globalCompositeOperation = 'source-atop';
  for (let k = 0; k < 4; k++) { g.globalAlpha = 0.12 + k * 0.06; g.fillStyle = '#1A0E0C'; g.fillRect(0, B - 40 + k * 10, W2, 10); }
  g.globalAlpha = 0.16; g.fillStyle = base; g.fillRect(0, 0, W2, B);
  g.restore();
  for (let x = 0; x <= W2; x += 6) { const r = 5 + hash(x * 0.21) * 5, cy = B - 10 - r * 0.3; ellR(g, x, cy, r, r * 0.7, mix(base, INK, 0.2)); ellR(g, x - 2, cy - 2, r * 0.6, r * 0.4, base); box(g, x - 3, cy - r * 0.6, 3, 1, lt); }
  box(g, 0, B - 10, W2, 10, mix(base, INK, 0.2));
  // (the pavilion's steel going up, its crane with the flag on the jib)
  const px = 380;
  for (let k = 0; k <= 4; k++) { g.fillStyle = mix(base, '#9A3A22', 0.3); g.fillRect(px + k * 40 - 3, B - (k < 3 ? 90 : 60), 6, k < 3 ? 90 : 60); }
  for (const y of [30, 60, 90]) { g.fillStyle = mix(base, '#9A3A22', 0.3); g.fillRect(px - 4, B - y - 3, y === 90 ? 90 : 168, 6); }
  g.fillStyle = mix(base, '#E0A82E', 0.35); g.fillRect(px + 140, B - 150, 8, 150); g.fillRect(px + 30, B - 154, 160, 6);
  for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? mix(base, '#F1F5F9', 0.4) : mix(base, '#B91C1C', 0.4); g.fillRect(px + 34, B - 170 + k * 3, 22, 3); }
  // (the haze over it, dithered, and its fires)
  // (only over what's painted: no band of haze across the open sky)
  g.save(); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = dith(g, air); g.fillRect(0, B - 110, W2, 30);
  g.globalAlpha = 0.28; g.fillStyle = air; g.fillRect(0, B - 80, W2, 80);
  g.restore();
  for (const fx of [40, 150, 270, 520, 700, 860]) { g.fillStyle = dith(g, '#F97316'); g.beginPath(); g.ellipse(fx, B - 3, 16, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FB923C'; g.fillRect(fx - 4, B - 5, 8, 3); }
};

/** The 3D wrecks' camera here: far off, low (the heli park's camera's shape, phi 0). */
const DIG_HC = 260, DIG_F = 240;
const digCam = (): Cam => { const l = Math.hypot(DIG_HC, DC), fy = -DIG_HC / l, fz = -DC / l; return { phi: 0, cos: 1, sin: 0, hc: DIG_HC, fy, fz, uy: -fz, uz: fy, F: DIG_F, ppx: SW, ppy: 104 }; };
const DIG_WRECKS: [MechId, number, number, number][] = [['eiffel', 70, -200, 0.3], ['taj', 190, -260, -0.3], ['opera', 290, 100, -0.4], ['colosseum', 400, 60, 0.2], ['pyramid', 520, -240, 0.5], ['moai', 600, 120, -0.5], ['bigben', 700, -180, -0.2], ['pisa', 780, 80, 0.1], ['redeemer', 840, -160, 0.3]];

const DH = 70;
const paintDig = (g: Ctx) => {
  const W2 = SW * 2, B = DH * 2;
  const D = ['#2E2018', '#4A3424', '#664A32', '#86664A', '#A88A68', '#C8AC88'].map(c => mix(c, '#2A2440', timeOfDay().lamps * 0.35));
  // (the far bank: dirt in strata, its crest lit and dithered down into it)
  const crest = (x: number, b: number) => b + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.053) * 3;
  g.fillStyle = D[2]; g.beginPath(); g.moveTo(0, B); for (let x = 0; x <= W2; x += 10) g.lineTo(x, crest(x, 92)); g.lineTo(W2, B); g.closePath(); g.fill();
  for (let x = 0; x < W2; x += 2) { box(g, x, crest(x, 92), 2, 2, D[4]); box(g, x, crest(x, 92) + 10 + Math.sin(x * 0.04) * 2, 2, 2, D[1]); }
  g.fillStyle = dith(g, D[3]); g.fillRect(0, 100, W2, 6);
  // (the wrecks along it: the heli's 3D wrecks, small and far)
  const cam = digCam(), l = Math.hypot(DIG_HC, DC);
  for (const [id, sx, z, yaw] of DIG_WRECKS) {
    const zc = (DIG_HC * DIG_HC) / l + ((DC - z) * DC) / l;
    drawWreck3d(g, cam, id, { x: ((sx - SW) * zc) / DIG_F, z }, yaw);
  }
  // (her hand up out of the dig where she went over: patina in steps, the fingers open, nothing in it; rubble round it)
  const hx = W2 * 0.47, hy = B - 18;
  g.fillStyle = INK; g.fillRect(hx - 10, hy - 52, 20, 52);
  g.fillStyle = PAT[3]; g.fillRect(hx - 8, hy - 52, 16, 52); g.fillStyle = PAT[5]; g.fillRect(hx - 8, hy - 52, 4, 52); g.fillStyle = PAT[1]; g.fillRect(hx + 4, hy - 52, 4, 52);
  g.fillStyle = dith(g, PAT[4]); g.fillRect(hx - 4, hy - 52, 2, 52);
  for (let k = 0; k < 4; k++) { g.fillStyle = INK; g.fillRect(hx - 12 + k * 6, hy - 74 + Math.abs(k - 1.5) * 2, 7, 24); g.fillStyle = PAT[4]; g.fillRect(hx - 11 + k * 6, hy - 73 + Math.abs(k - 1.5) * 2, 5, 22); g.fillStyle = PAT[6]; g.fillRect(hx - 11 + k * 6, hy - 73 + Math.abs(k - 1.5) * 2, 2, 4); }
  g.fillStyle = INK; g.fillRect(hx + 12, hy - 58, 14, 8); g.fillStyle = PAT[4]; g.fillRect(hx + 13, hy - 57, 12, 6);
  g.fillStyle = PAT[0]; g.fillRect(hx - 8, hy - 36, 16, 2); g.fillRect(hx - 6, hy - 22, 3, 3); g.fillStyle = PAT[6]; g.fillRect(hx - 6, hy - 23, 1, 1);
  // (the near bank in front: its crest, clods, rebar, rubble of her)
  g.fillStyle = D[1]; g.beginPath(); g.moveTo(0, B); for (let x = 0; x <= W2; x += 10) g.lineTo(x, crest(x + 400, 118)); g.lineTo(W2, B); g.closePath(); g.fill();
  for (let x = 0; x < W2; x += 2) box(g, x, crest(x + 400, 118), 2, 2, D[3]);
  for (let i = 0; i < 30; i++) { const x = (i * 71 + 13) % W2, y = crest(x + 400, 120) + (i % 4) * 3; box(g, x - 1, y - 1, 7, 5, INK); box(g, x, y, 5, 3, i % 3 ? CONC[3] : PAT[3]); box(g, x, y, 5, 1, i % 3 ? CONC[5] : PAT[5]); }
  for (const x of [120, 360, 640]) { lineR(g, [x, crest(x + 400, 120), x + 8, crest(x + 400, 120) - 24], 3, '#3A1A0C'); lineR(g, [x, crest(x + 400, 120), x + 8, crest(x + 400, 120) - 24], 1.4, '#9A3412'); }
  // (the two scaffold towers either side of it: plywood, galvanized pipe, Old Glory painted up top)
  for (const tx of [10, W2 - 70]) {
    box(g, tx - 2, 0, 64, B, INK); box(g, tx, 0, 60, B, '#8A6A44'); box(g, tx, 0, 4, B, '#B8935F'); box(g, tx + 54, 0, 6, B, '#5E4630');
    for (let y = 20; y < B; y += 40) box(g, tx, y, 60, 2, '#5E4630');
    for (let k = 0; k < 5; k++) box(g, tx + 2, 8 + k * 5, 56, 3, k % 2 ? '#E2E8F0' : '#9B1C1C');
    box(g, tx + 2, 8, 20, 18, '#1E3A8A');
    for (const px of [tx + 8, tx + 48]) { box(g, px - 1, 0, 6, B, INK); box(g, px, 0, 4, B, '#7A7F88'); box(g, px + 1, 0, 1, B, '#D4D4D8'); }
    for (let y = 40; y < B; y += 46) { box(g, tx, y - 1, 60, 6, INK); box(g, tx, y, 60, 4, '#7A7F88'); box(g, tx, y, 60, 1, '#D4D4D8'); }
  }
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  c.drawImage(farStrip('pw-hh-far', SW, FAR_H, paintFar), -20 + Math.round(sway * 0.15), HOR + 4 - FAR_H);
  c.drawImage(farStrip('pw-hh-dig2', SW, DH, paintDig), -20 + Math.round(sway * 0.3), HOR + 3 - DH);
  // (smoke going up off the wrecks, fires at their feet)
  const ax = Math.round(sway * 0.3);
  for (const [x, s, seed] of [[35, 2.4, 3], [95, 1.8, 7], [200, 2.8, 11], [300, 2, 5], [390, 2.2, 9]] as const) {
    smoke(c, ax + x, HOR - 6, s, t, seed, { n: 6, rise: 0.03, drift: 0.05, size: 0.55, col: tod.lamps > 0.5 ? ['#1C1917', '#292524', '#3F3A36', '#57534E'] : ['#3F3A36', '#57534E', '#6B6460', '#78716C'] });
    fire(c, ax + x, HOR - 4, s * 0.8, t, seed);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wreckage

/** Her head, blown open, lying on its side: the face up toward the sky, eyes shut, a concrete tear; the crown's band
 *  and its windows, its broken rays; the hollow, the rebar. */
const head = (g: Ctx, w: number, h: number) => {
  const cx = w * 0.5, cy = h * 0.58, rx = w * 0.32, ry = h * 0.4;
  // (the crown's broken rays, lying out from it: in steps, riveted at their feet)
  for (const [a, l] of [[-0.3, 0.42], [0.2, 0.36], [0.7, 0.3]] as const) {
    g.save(); g.translate(cx + rx * 0.9, cy - ry * 0.2); g.rotate(a);
    g.fillStyle = INK; g.beginPath(); g.moveTo(0, -6); g.lineTo(w * l, 0); g.lineTo(0, 6); g.closePath(); g.fill();
    g.fillStyle = PAT[3]; g.beginPath(); g.moveTo(0, -4); g.lineTo(w * l - 3, 0); g.lineTo(0, 4); g.closePath(); g.fill();
    g.fillStyle = PAT[5]; g.beginPath(); g.moveTo(0, -4); g.lineTo(w * l - 3, 0); g.lineTo(0, -1); g.closePath(); g.fill();
    box(g, 1, -2, 2, 2, PAT[0]);
    g.restore();
  }
  // (the head: the patina in steps, dithered between, the far side shaded)
  ellR(g, cx, cy, rx + 1.5, ry + 1.5, INK); ellR(g, cx, cy, rx, ry, PAT[3]);
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
  box(g, cx - rx, cy + ry * 0.3, rx * 2, ry, PAT[2]); g.fillStyle = dith(g, PAT[2]); g.fillRect(cx - rx, cy + ry * 0.15, rx * 2, ry * 0.18);
  box(g, cx - rx * 0.7, cy - ry, rx * 1.2, ry * 0.5, PAT[4]); g.fillStyle = dith(g, PAT[4]); g.fillRect(cx - rx * 0.7, cy - ry * 0.5, rx * 1.2, ry * 0.18);
  g.restore();
  // (the crown's band across the top of her brow, its little windows)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(cx + rx * 0.55, cy - ry * 0.1, rx * 0.5, ry * 0.95, 0, -1.2, 1.2); g.stroke();
  g.strokeStyle = PAT[4]; g.lineWidth = 2; g.stroke();
  for (let k = -2; k <= 2; k++) box(g, cx + rx * 0.9, cy - ry * 0.1 + k * ry * 0.3, 3, 4, '#0B1512');
  // (the face: shut eyes, the long nose, the mouth turned down; a concrete tear)
  box(g, cx - rx * 0.5, cy - ry * 0.2, rx * 0.35, 1, INK); box(g, cx + rx * 0.1, cy - ry * 0.2, rx * 0.35, 1, INK);
  box(g, cx - rx * 0.5, cy - ry * 0.3, rx * 0.35, 1, PAT[5]); box(g, cx + rx * 0.1, cy - ry * 0.3, rx * 0.35, 1, PAT[5]);
  box(g, cx - 1, cy - ry * 0.15, 3, ry * 0.4, PAT[5]); box(g, cx + 2, cy - ry * 0.1, 2, ry * 0.36, PAT[1]);
  box(g, cx - rx * 0.25, cy + ry * 0.4, rx * 0.5, 1, INK); box(g, cx - rx * 0.3, cy + ry * 0.42, 2, 2, INK); box(g, cx + rx * 0.25, cy + ry * 0.42, 2, 2, INK);
  box(g, cx - rx * 0.45, cy, 2, ry * 0.3, CONC[4]); box(g, cx - rx * 0.45, cy + ry * 0.3, 3, 2, CONC[5]);
  // (the hole: her green shell's broken edge round it, hollow in steps, rebar, rusty)
  ellR(g, cx - rx * 0.55, cy - ry * 0.45, rx * 0.46, ry * 0.42, PAT[1]);
  ellR(g, cx - rx * 0.55, cy - ry * 0.45, rx * 0.4, ry * 0.35, CONC[1]); ellR(g, cx - rx * 0.58, cy - ry * 0.46, rx * 0.3, ry * 0.26, CONC[0]); ellR(g, cx - rx * 0.6, cy - ry * 0.48, rx * 0.16, ry * 0.14, '#0C0A09');
  g.strokeStyle = CONC[4]; g.lineWidth = 1; g.beginPath(); g.ellipse(cx - rx * 0.55, cy - ry * 0.45, rx * 0.4, ry * 0.35, 0, Math.PI * 0.9, Math.PI * 1.9); g.stroke();
  for (const [x2, y2] of [[cx - rx * 1.1, cy - ry * 1.0], [cx - rx * 0.9, cy - ry * 1.1], [cx - rx * 1.15, cy - ry * 0.55]] as const) { lineR(g, [cx - rx * 0.55, cy - ry * 0.45, x2, y2], 3, INK); lineR(g, [cx - rx * 0.55, cy - ry * 0.45, x2, y2], 1.6, '#9A3412'); }
};
/** Her revolver, lying. */
const gun = (g: Ctx, w: number, h: number) => { const s = w / 190; g.save(); g.translate(w * 0.24, h * 0.62); g.scale(s, s); drawRevolverAt(g, 0, 0, 0.04); g.restore(); };
/** Her torch, lying, the flame out (snapped, when she came apart). */
const torch = (snapped: boolean) => (g: Ctx, w: number, h: number) => {
  const s = w / 230; g.save(); g.translate(w * 0.3, h * 0.5); g.scale(s, s);
  if (snapped) { g.save(); g.beginPath(); g.rect(-400, -200, 470, 400); g.clip(); drawTorchAt(g, 0, 0, -Math.PI / 2 + 0.06); g.restore(); g.save(); g.translate(30, 10); g.rotate(0.3); g.beginPath(); g.rect(40, -200, 400, 400); g.clip(); drawTorchAt(g, 0, 0, -Math.PI / 2 + 0.06); g.restore(); }
  else drawTorchAt(g, 0, 0, -Math.PI / 2 + 0.06);
  g.restore();
};
/** A chunk of her: concrete inside, green out (lit along its top, shaded behind, the concrete under the broken shell). */
const chunk = (green: boolean) => (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.2, h * 0.2); g.lineTo(w * 0.7, 0); g.lineTo(w, h); g.closePath(); g.fill();
  g.fillStyle = green ? PAT[3] : CONC[3]; g.beginPath(); g.moveTo(1, h - 1); g.lineTo(w * 0.22, h * 0.25); g.lineTo(w * 0.68, 2); g.lineTo(w - 1, h - 1); g.closePath(); g.fill();
  g.fillStyle = green ? PAT[5] : CONC[5]; g.beginPath(); g.moveTo(1, h - 1); g.lineTo(w * 0.22, h * 0.25); g.lineTo(w * 0.4, h * 0.2); g.lineTo(w * 0.2, h - 1); g.closePath(); g.fill();
  g.fillStyle = dith(g, green ? PAT[1] : CONC[1]); g.beginPath(); g.moveTo(w * 0.68, 2); g.lineTo(w - 1, h - 1); g.lineTo(w * 0.6, h - 1); g.closePath(); g.fill();
  if (green) box(g, w * 0.3, h * 0.3, w * 0.3, 2, CONC[3]);
};
/** His tie-dye, a shred of it: the dye's bands, a torn edge, its shade. */
const shred = (g: Ctx, w: number, h: number) => {
  for (let k = 0; k < 4; k++) box(g, k * (w / 4), 0, w / 4 + 1, h, TIEDYE[(k * 2) % TIEDYE.length]);
  g.fillStyle = dith(g, 'rgba(20,10,30,0.4)'); g.fillRect(0, h * 0.5, w, h * 0.5);
  box(g, 0, 0, w, 1, INK); box(g, 0, h - 1, w, 1, INK); for (let x = 0; x < w; x += 3) box(g, x, (x / 3) % 2 ? 1 : 0, 1, 1, INK);
};
/** The ride's emergency jetpack, spent, on its side: the tanks banded, the red bands, the straps, the sooty nozzles. */
const jetpack = (g: Ctx, w: number, h: number) => {
  for (const y of [h * 0.18, h * 0.54]) {
    const th = h * 0.32;
    shapeR(g, () => g.roundRect(1, y, w * 0.86, th, th / 2), GRAY_R, 1, w * 0.86, 1);
    box(g, w * 0.3, y + 1, 3, th - 2, BAND_R[1]); box(g, w * 0.3, y + 1, 1, th - 2, BAND_R[0]);
    box(g, w * 0.86, y + th * 0.2, w * 0.12, th * 0.6, INK); box(g, w * 0.87, y + th * 0.3, w * 0.1, th * 0.4, '#3F3F46');
  }
  box(g, w * 0.5, 0, 2, h, LEATHER_R[2]); box(g, w * 0.62, 0, 2, h, LEATHER_R[2]);
};
/** Harry in a heap on his back, shot full of his own rounds (what goes up), the bandana down over his eyes, in his
 *  blood: the pool in steps, its lit lip. */
const harryDown = (g: Ctx, w: number, h: number) => {
  const px = w * 0.44, py = h * 0.86;
  ellR(g, px, py, w * 0.4 + 2, h * 0.14 + 1, INK); ellR(g, px, py, w * 0.4, h * 0.14, BLOOD[0]); ellR(g, px - w * 0.04, py - 0.5, w * 0.3, h * 0.09, BLOOD[1]);
  ellR(g, px - w * 0.1, py - 1, w * 0.14, h * 0.05, BLOOD[2]); box(g, px - w * 0.3, py - h * 0.1, w * 0.12, 1, BLOOD[3]);
  const s = w / 110;
  g.save(); g.translate(w * 0.42, h * 0.95 + 42 * s); g.scale(s, s);
  drawRambo(g, 0, 0, { pose: 'dead', f: 0, facing: 1, rot: -Math.PI / 2, dead: true, holes: 1 });
  g.restore();
};
/** Harry face down in his own pool of puke (barfed to death): the pool in steps going red in its middle, him in it. */
const harryBarfed = (g: Ctx, w: number, h: number) => {
  const px = w * 0.62, py = h * 0.78, pw = w * 0.36, ph = h * 0.16;
  ellR(g, px, py, pw + 2, ph + 2, INK); ellR(g, px, py, pw, ph, PUKE[0]); ellR(g, px - pw * 0.1, py - 1, pw * 0.7, ph * 0.6, PUKE[1]);
  ellR(g, px + pw * 0.1, py, pw * 0.4, ph * 0.45, BLOOD[1]); ellR(g, px + pw * 0.05, py - 0.5, pw * 0.18, ph * 0.22, BLOOD[2]);
  box(g, px - pw * 0.5, py - ph * 0.5, pw * 0.3, 1, PUKE[3]);
  const s = w / 110;
  g.save(); g.translate(w * 0.36, h * 0.95 + 30 * s); g.scale(s, s);
  drawRambo(g, 0, 0, { pose: 'dead', f: 0, facing: 1, rot: Math.PI / 2, dead: true, green: 0.5, concrete: 0.35 });
  g.restore();
};
/** Her concrete over him: a mound in steps, set, his socks and sandals out of one end, his arm out the top flipping the
 *  bird, the top of his head and the bandana out the slope, the blood seeped out round its foot. */
const mound = (g: Ctx, w: number, h: number) => {
  // (the blood pooled round its foot)
  ellR(g, w * 0.38, h * 0.97, w * 0.42, h * 0.07, BLOOD[0]); ellR(g, w * 0.36, h * 0.97, w * 0.34, h * 0.05, BLOOD[1]); box(g, w * 0.2, h * 0.95, w * 0.2, 1, BLOOD[3]);
  // (his legs out the end: jeans, the tube socks' stripes, the sandals' soles)
  for (const dy of [0, 5]) {
    const ly = h * 0.6 + dy, lx = w * 0.64;
    shapeR(g, () => g.rect(lx, ly, w * 0.2, 5), DENIM_R, lx, lx + w * 0.2, 1);
    shapeR(g, () => g.rect(lx + w * 0.2, ly, 5, 5), SOCK_R, lx + w * 0.2, lx + w * 0.2 + 5, 0.8); box(g, lx + w * 0.2 + 1, ly, 1, 5, '#DC2626'); box(g, lx + w * 0.2 + 3, ly, 1, 5, '#2563EB');
    box(g, lx + w * 0.2 + 5, ly - 1, 2, 7, LEATHER_R[1]); box(g, lx + w * 0.2 + 5, ly - 1, 1, 7, LEATHER_R[0]);
  }
  // (his arm up out of the top, set, the middle finger up: drawn first, rooted down inside the mound, so the mound's top
  // goes over it (the user: "make sure it's a part of the concrete pile, not hovering over it"))
  const ax = w * 0.34, ay = h * 0.1, S = SKIN_R;
  shapeR(g, () => g.rect(ax - 3, ay - h * 0.42, 6, h * 0.62), S, ax - 3, ax + 3, 1);
  shapeR(g, () => g.roundRect(ax - 5, ay - h * 0.52, 10, 8, 2), S, ax - 5, ax + 5, 1);
  shapeR(g, () => g.roundRect(ax - 1.5, ay - h * 0.66, 4, 8, 1.5), S, ax - 1.5, ax + 2.5, 0.8);
  // (the mound itself: set concrete in steps, its slumps)
  const m = () => { g.moveTo(0, h); g.quadraticCurveTo(w * 0.1, h * 0.1, w * 0.38, h * 0.05); g.quadraticCurveTo(w * 0.66, h * 0.1, w * 0.74, h); g.closePath(); };
  shapeR(g, m, SET, 0, w * 0.74, 1.4);
  g.save(); g.beginPath(); m(); g.clip();
  for (let i = 0; i < 3; i++) { g.strokeStyle = SET[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(0, h * (0.5 + i * 0.16)); g.quadraticCurveTo(w * 0.38, h * (0.3 + i * 0.16), w * 0.74, h * (0.56 + i * 0.16)); g.stroke(); }
  g.restore();
  box(g, w * 0.16, h * 0.3, w * 0.3, 2, SET[0]); box(g, w * 0.2, h * 0.5, 4, 2, SET[1]);
  // (blood run out through its cracks)
  for (const fx of [0.2, 0.46, 0.6]) { box(g, w * fx, h * 0.5, 2, h * 0.44, BLOOD[1]); box(g, w * fx, h * 0.5, 1, h * 0.3, BLOOD[3]); }
  // (where it comes out of the top: a lip of the concrete heaped round it, crust up the arm, the shadow at its foot)
  box(g, ax - 6, ay - 1, 12, 3, SET[1]); box(g, ax - 6, ay - 1, 12, 1, SET[0]); box(g, ax - 4, ay + 2, 8, 1, SET[3]);
  box(g, ax - 3, ay - 4, 2, 3, SET[2]); box(g, ax + 1, ay - 6, 2, 2, SET[1]);
  // (the top of his head out the near slope: gray hair, the bandana)
  const tx = w * 0.12, ty = h * 0.62;
  shapeR(g, () => g.ellipse(tx, ty, 7, 5, -0.5, Math.PI, Math.PI * 2), GRAY_R, tx - 7, tx + 7, 1);
  box(g, tx - 6, ty - 3, 11, 2, BAND_R[1]); box(g, tx + 4, ty - 5, 3, 3, BAND_R[2]);
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  const how = keptForRevisits(MEMO_DEATH) ?? (weakness ? 'buried' : 'spin'), crumbled = keptForRevisits(MEMO_CRUMBLED) === '1';
  // Harry, close by: under her concrete, face down in his puke, or in a heap on his back shot to bits
  if (how === 'buried') out.push({ id: 'hw-mound2', x: 1.4, z: 4.4, w: 1.8, h: 0.9, ppm: 44, paint: mound });
  else if (how === 'barfed') out.push({ id: 'hw-barfed', x: 1.3, z: 4.4, w: 2, h: 0.5, ppm: 50, paint: harryBarfed });
  else out.push({ id: 'hw-harry2', x: 1.3, z: 4.4, w: 2, h: 0.5, ppm: 50, paint: harryDown });
  // Her: the head blown open, the gun, the torch (she came apart: no head, no gun, the torch snapped, more of her)
  if (!crumbled) {
    out.push({ id: 'hw-head2', x: -2.6, z: 7, w: 3, h: 1.6, ppm: 28, paint: head, live: (c, sx, sy, s, t) => smoke(c, sx - s * 0.6, sy - s * 0.9, s, t, 9, { n: 4, size: 0.3, rise: 0.02, col: ['#78716C', '#A8A29E', '#D6D3D1'] }) });
    out.push({ id: 'hw-gun', x: 2.6, z: 10, w: 2.6, h: 0.9, ppm: 28, paint: gun });
  } else for (let i = 0; i < 4; i++) out.push({ id: i % 2 ? 'hw-bigchunk-g' : 'hw-bigchunk-c', x: (i % 2 ? 1 : -1) * (1.8 + i * 0.5), z: 6 + i * 2.6, w: 1.2, h: 0.7, ppm: 32, paint: chunk(i % 2 === 1) });
  out.push({ id: crumbled ? 'hw-torch-snap' : 'hw-torch', x: -2.2, z: 14, w: 3, h: 1.1, ppm: 24, paint: torch(crumbled) });
  out.push({ id: 'hw-jet2', x: -1.2, z: 6, w: 0.7, h: 0.35, ppm: 40, paint: jetpack });
  // (her chunks and his shreds strewn the whole way)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, z = 6 + hash(i * 7.1) * 30;
    if (i % 3 === 2) out.push({ id: 'hw-shred2', x: side * (0.7 + hash(i) * 1.2), z, w: 0.4, h: 0.12, ppm: 48, paint: shred, wrap: true });
    else out.push({ id: i % 3 ? 'hw-chunk-c2' : 'hw-chunk-g2', x: side * (1.4 + hash(i * 3.3) * 2.6), z, w: 0.6 + hash(i) * 0.6, h: 0.4, ppm: 32, paint: chunk(i % 3 === 0), wrap: true });
  }
  return out;
};

export const HELICOPTER_HARRY: SceneDef = {
  land: 'FOREIGN LANDS',
  weapon: 'SOUVENIR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#A8A29E',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => souvenir(c, t),
  grip: [[0, 0], [26, -14]],
  rim: '#FDBA74',
  embers: ['#FDE68A', '#FDBA74', '#F97316', '#DC2626'],
};
