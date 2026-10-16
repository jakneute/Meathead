// The walk-away from STUNTMAN STEVE (Hollywood Land's boss): back out across the stunt stage toward the camera at
// whatever hour it is now (timeOfDay.ts). The stage's asphalt (banded, its aggregate, joints, oil, his yellow mark tape
// down the middle, the lanes' worn paint, the drift marks all over it). Far off, the land's own far layers (blvd/far.ts:
// the mountains, the HAPPYWOOD hill, the foothills, the city), and behind him the amphitheater as it is in the fight
// (stunt/): its stands up both sides in Steve's yellow and stunt red (half empty, their light towers), the street set
// along the back (the pawnshop, the diner, the gas station's canopy, the bank, the liquor store, the four bays), the
// truss over it with the marquee dark and SHOW CANCELED taped across it, his yellow banner, STEVE-O-VISION on color
// bars; smoke going up off the stage. Along the way, the posse's wrecks (red and blue: one on its roof, one stoved in,
// still burning), hula hoops lying where they came down, cones, a tire, hubcaps, a dropped foam finger, Steve's yellow
// fliers trodden on. And Steve's fate: killed by his weakness (the lightning), a pile of ash with his gold aviators on
// top and his neck brace beside it; any other way, him face down by the crash mat he missed, rear up in his
// star-spangled briefs, his yellow pants burnt off him lying by. His toy: the STUNT CAR (its walk-away act: the
// clapperboard, walkAway/acts.ts).

import { type Ctx, type Prop, type SceneDef, INK, HOR, LW, box, hash, smoke, fire, mix } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay } from '../timeOfDay';
import { slate } from './toys';
import { drawSteve, drawSteveAsh, drawSteveBrace } from '../hollywood/stunt/steve';
import { FAR, paintMountains, paintFoothills, paintCity, drawHill } from '../hollywood/blvd/far';
import { steveCard } from '../hollywood/blvd/props';
import { checker, ramp6, STEVE, CONCRETE } from '../hollywood/blvd/kit';
import { signText } from '../signLetters';

const SW = LW + 40;
const ASPH = ['#141218', '#201E24', '#2C2A32', '#3A3842', '#4A4852', '#5E5C66'];
const RED = ['#2A0606', '#5A1010', '#8A1A1A', '#B42222', '#DC4A3E'];
const BLUE = ['#0A1030', '#16285A', '#1E3A8A', '#2A52B4', '#4A78D4'];
const SOOT = '#141110';

// ---------------------------------------------------------------------------------------------------------------
// The floor: asphalt, the joints, the lanes, his mark tape, the drift marks, oil

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, ASPH[3]);
  for (let i = 0; i < 900; i++) { const t = hash(i * 0.71); box(g, hash(i * 1.3) * w, hash(i * 2.9) * h, t > 0.8 ? 2 : 1, 1, t > 0.62 ? ASPH[5] : t > 0.3 ? ASPH[2] : ASPH[1]); }
  // (the slabs' joints: dark, a lit lip on their far side)
  for (let y = 0; y < h; y += 64) { box(g, 0, y, w, 1, ASPH[0]); box(g, 0, y + 1, w, 1, ASPH[4]); }
  for (const x of [w / 2 - 96, w / 2 + 96]) { box(g, x, 0, 1, h, ASPH[0]); box(g, x + 1, 0, 1, h, ASPH[4]); }
  // (patches: newer, darker, cracked round their edges)
  for (let k = 0; k < 3; k++) { const x = hash(k * 4.4) * (w - 40), y = hash(k * 6.6) * (h - 30), pw = 20 + hash(k) * 30, ph = 12 + hash(k * 2) * 16; box(g, x - 1, y - 1, pw + 2, ph + 2, ASPH[0]); box(g, x, y, pw, ph, ASPH[2]); checker(g, x, y, pw, 2, ASPH[3], 0, 1); }
  // (oil, stepped, a sheen)
  for (let k = 0; k < 5; k++) {
    const x = hash(k * 9) * w, y = hash(k * 4) * h, r = 5 + hash(k * 2.2) * 6;
    g.fillStyle = ASPH[2]; g.beginPath(); g.ellipse(x, y, r + 3, r * 0.6 + 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ASPH[0]; g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); g.fill();
    box(g, x - r * 0.4, y - 1, 3, 1, '#4A3A6A'); box(g, x - r * 0.4 + 3, y - 1, 2, 1, '#2A4A5A');
  }
  // (the lanes' dashes down it, worn: chipped, lit along one edge)
  for (let y = 0; y < h; y += 32) for (const x of [w / 2 - 36, w / 2 + 33]) {
    box(g, x, y, 3, 16, '#B8B4AC'); box(g, x, y, 1, 16, '#E2DED6');
    for (let k = 0; k < 16; k += 3) if (hash(x + y + k) > 0.7) box(g, x + (k % 3), y + k, 1, 2, ASPH[3]);
  }
  // (his mark tape: yellow, down the middle of the way he walks)
  const Y = STEVE;
  for (let y = 0; y < h; y += 2) { if (hash(y * 0.37) > 0.95) continue; box(g, w / 2 - 1, y, 1, 2, Y[4]); box(g, w / 2, y, 1, 2, Y[3]); box(g, w / 2 + 1, y, 1, 2, Y[1]); }
  // (drift marks: arcs, each a pair of tire lines, stepped, fading at their ends)
  for (let k = 0; k < 6; k++) {
    const cx = hash(k * 7.7) * w, cy = hash(k * 3.1) * h, r = 30 + hash(k) * 60, a0 = hash(k * 5) * 6, span = 1.4 + hash(k * 8) * 1.2;
    for (let s = 0; s < 36; s++) {
      const u = s / 36, a = a0 + span * u, fade = Math.min(u, 1 - u) * 4;
      for (const o of [0, 7]) { const x = cx + Math.cos(a) * (r + o), y = cy + Math.sin(a) * (r + o); if (fade > 0.3 || s % 2) box(g, x, y, 2, 2, fade > 0.6 ? '#0C0A0C' : ASPH[1]); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the land's far layers; nearer, the amphitheater behind him

/** The far layers (the boulevard's own painters, at half their size here), painted at twice the picture's size. */
const FAR_H = 120;
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), base = FAR_H * 4, tiles = [0, FAR.TW, FAR.TW * 2];
  g.save(); g.scale(0.5, 0.5);
  for (const ox of tiles) { g.save(); g.translate(ox - 200, base - FAR.MH - 20); paintMountains(g, tod); g.restore(); }
  drawHill(g, 1080, base - 30, 0);
  for (const ox of tiles) { g.save(); g.translate(ox - 80, base - FAR.FH + 6); paintFoothills(g, tod); g.restore(); }
  for (const ox of tiles) { g.save(); g.translate(ox - 360, base - FAR.CH + 30); paintCity(g, tod); g.restore(); }
  g.restore();
};

/** The amphitheater, as it is (twice the picture's size): the stands up both sides, the set along the back, the truss
 *  over it (the marquee dark, SHOW CANCELED), the banner, the jumbotron on color bars, the light towers. */
const AH = 76, AK = 0.74;
const paintArena = (g: Ctx) => {
  const tod = timeOfDay(), W2 = SW * 2, B = AH * 2 - 4, on = tod.lamps > 0.3;
  // (all of it a touch smaller about its foot's middle: it's well behind him)
  g.save(); g.translate((W2 / 2) * (1 - AK), B * (1 - AK)); g.scale(AK, AK);
  const St = ['#2A2422', '#3E3632', '#564C46', '#70645C', '#8C8076', '#ACA096'];
  const Y = STEVE, Rr = ['#3A0A0A', '#621414', '#8A1E1E', '#B42C2C', '#D04A44'];
  // (the light towers on the stands' backs)
  for (const tx of [70, W2 - 70]) {
    box(g, tx - 3, B - 150, 6, 110, INK); box(g, tx - 2, B - 150, 2, 110, '#8A92A0'); box(g, tx, B - 150, 2, 110, '#444A54');
    for (let y = B - 146; y < B - 44; y += 10) box(g, tx - 3, y, 6, 1, '#626A76');
    box(g, tx - 17, B - 166, 34, 18, INK);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) box(g, tx - 15 + k * 8, B - 164 + r * 8, 6, 6, on ? '#FFF2C8' : (k + r) % 2 ? '#A8AAA0' : '#C8C8B8');
  }
  // (the set along the back: its fronts small, the bays dark between them)
  const set = B - 8, cx = W2 / 2, sw = 480, sx = cx - sw / 2;
  const fronts: [number, number, number, string, string][] = [[0, 50, 58, '#8A3E2C', '#C27458'], [90, 90, 46, '#2A8A8A', '#C8D0D8'], [216, 74, 50, '#E8E4DA', '#C82828'], [326, 90, 62, '#C8B08A', '#E8D8B8'], [452, 28, 50, '#4D7C3A', '#F2D79A']];
  for (const [fx, fw, fh, wall, trim] of fronts) {
    const R = ramp6(wall), T = ramp6(trim), x = sx + fx;
    box(g, x - 1, set - fh - 1, fw + 2, fh + 1, INK); box(g, x, set - fh, fw, fh, R[3]); box(g, x, set - fh, 2, fh, R[4]); box(g, x + fw - 3, set - fh, 3, fh, R[1]);
    box(g, x, set - fh, fw, 3, T[3]); box(g, x + 4, set - fh + 10, fw - 8, 6, T[2]);
    for (let k = x + 4; k < x + fw - 8; k += 12) { box(g, k, set - fh + 22, 8, 10, INK); box(g, k + 1, set - fh + 23, 6, 8, '#4A6888'); box(g, k + 1, set - fh + 23, 6, 2, '#A6C4DA'); }
  }
  // (the gas station's canopy, red)
  box(g, sx + 212, set - 54, 82, 8, INK); box(g, sx + 213, set - 53, 80, 6, '#C82828'); box(g, sx + 213, set - 51, 80, 1, '#F4F0E8');
  // (the bays: block, hazard jambs, dark)
  for (const bx of [sx + 50, sx + 180, sx + 290, sx + 416]) {
    box(g, bx - 1, set - 46, 38, 46, INK); box(g, bx, set - 45, 36, 45, '#8C8680');
    box(g, bx + 4, set - 32, 28, 32, '#0C0A0E'); box(g, bx + 4, set - 32, 28, 5, '#6A707A');
    for (let y = set - 30; y < set; y += 4) { box(g, bx + 2, y, 2, 2, '#FACC15'); box(g, bx + 32, y + 2, 2, 2, '#FACC15'); }
  }
  // (the stands up both sides: rows going up and out, seats in yellow and red, fans dotted about them, half empty)
  for (const s of [-1, 1]) {
    for (let r = 0; r < 9; r++) {
      const y = B - 14 - r * 11, inner = s < 0 ? 200 - r * 12 : W2 - 200 + r * 12, outer = s < 0 ? -10 : W2 + 10;
      const a = Math.min(inner, outer + s * 110), w = Math.abs(inner - outer) + 110;
      box(g, a, y - 11, w, 11, St[r % 2 ? 3 : 2]); box(g, a, y - 11, w, 1, St[5]); box(g, a, y - 2, w, 2, St[1]);
      for (let k = 0; k < w; k += 6) {
        const sx2 = a + k, P = Math.floor(k / 48) % 2 ? Y : Rr;
        box(g, sx2, y - 7, 4, 4, P[3]); box(g, sx2, y - 7, 4, 1, P[4]);
        if (hash(sx2 * 0.37 + r * 3.1 + s) > 0.55) { const sk = ['#F3C9A8', '#C68642', '#8D5524', '#5C3A21', '#E0A27A'][Math.floor(hash(sx2 + r) * 5)]; box(g, sx2, y - 12, 4, 5, ['#C82828', '#2A5AC8', '#EAB516', '#F4F0E8', '#2A8A4A'][Math.floor(hash(sx2 * 2 + r) * 5)]); box(g, sx2 + 1, y - 15, 3, 3, sk); }
      }
    }
    // (the stand's inner edge, its tire wall at its foot)
    const fx = s < 0 ? 200 : W2 - 200;
    box(g, s < 0 ? fx - 4 : fx, B - 24, 4, 24, '#1C1C20');
    for (let y = B - 24; y < B; y += 6) box(g, s < 0 ? fx - 4 : fx, y, 4, 1, '#4A4A54');
  }
  // (the truss over it all, its legs at the stands; the marquee on it, dark, SHOW CANCELED taped across)
  const ty = 28;
  box(g, 150, ty - 1, W2 - 300, 10, INK); box(g, 150, ty, W2 - 300, 2, '#A2ACBA'); box(g, 150, ty + 6, W2 - 300, 2, '#76808E');
  for (let x = 150; x < W2 - 150; x += 10) { box(g, x, ty + 2, 1, 4, '#525A66'); }
  for (const lx of [150, W2 - 152]) { box(g, lx, ty, 3, B - ty - 40, '#525A66'); box(g, lx, ty, 1, B - ty - 40, '#A2ACBA'); }
  const mx = cx - 120;
  box(g, mx - 1, ty - 22, 242, 22, INK); box(g, mx, ty - 21, 240, 20, '#18181B'); box(g, mx, ty - 21, 240, 2, Y[2]); box(g, mx, ty - 3, 240, 2, Y[2]);
  for (let k = 0; k < 24; k++) box(g, mx + 6 + k * 10, ty - 14, 4, 6, '#5A4A2A');
  g.save(); g.translate(cx, ty - 12); g.rotate(-0.06);
  box(g, -84, -9, 168, 18, INK); box(g, -83, -8, 166, 16, '#F4F1EA'); box(g, -83, 6, 166, 2, '#D8D2C6');
  signText(g, 'SHOW CANCELED', 0, 4, { sx: 1, sy: 1, fill: '#DC2626', gap: 1 });
  g.restore();
  // (his banner, yellow, off the truss; the jumbotron on color bars)
  const bx = cx - 170;
  box(g, bx - 1, ty + 8, 48, 44, INK); box(g, bx, ty + 9, 46, 42, Y[3]); box(g, bx, ty + 9, 46, 2, Y[5]); box(g, bx, ty + 43, 46, 8, '#B42222');
  box(g, bx + 17, ty + 15, 12, 16, '#E2B48C'); box(g, bx + 15, ty + 13, 16, 5, '#8A5A2A'); box(g, bx + 18, ty + 20, 10, 2, '#2A2A3A'); box(g, bx + 17, ty + 30, 12, 3, '#F4F0E8');
  const jx = cx + 120;
  box(g, jx - 1, ty + 10, 62, 40, INK); box(g, jx, ty + 11, 60, 38, '#36363E');
  ['#C8C8C8', '#C8C800', '#00C8C8', '#00C800', '#C800C8', '#C80000', '#0000C8'].forEach((col, i) => box(g, jx + 3 + i * 8, ty + 14, 8, 24, col));
  box(g, jx + 3, ty + 38, 54, 8, '#141418');
  // (the stage's floor in front of the set)
  box(g, -200, B - 4, W2 + 400, 8, '#3A3842'); box(g, -200, B - 4, W2 + 400, 1, '#5E5C66');
  g.restore();
  void mix;
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  c.drawImage(farStrip('pw-st-far', SW, FAR_H, paintFar), -20 + Math.round(sway * 0.12), HOR + 4 - FAR_H);
  c.drawImage(farStrip('pw-st-arena', SW, AH, paintArena), -20 + Math.round(sway * 0.5), HOR + 2 - AH);
  // (smoke going up off the stage behind him, off the wrecks there)
  const ax = Math.round(200 + sway * 0.5);
  smoke(c, ax + 34, HOR - 2, 3, t, 5, { n: 7, rise: 0.03, drift: 0.05, size: 0.6, col: ['#3F3A36', '#57534E', '#6B6460', '#78716C'] });
  smoke(c, ax - 70, HOR - 1, 2.4, t, 11, { n: 6, rise: 0.03, drift: 0.04, size: 0.55, col: ['#3F3A36', '#57534E', '#6B6460', '#78716C'] });
  fire(c, ax + 34, HOR - 1, 3, t, 7); fire(c, ax - 70, HOR, 2, t, 13);
  // (the towers' lamps after dark: a stepped glow round each)
  if (tod.lamps > 0.3) for (const tx of [70, SW * 2 - 70]) {
    const W2 = SW * 2, B = AH * 2 - 4, sx2 = (W2 / 2) * (1 - AK) + tx * AK, sy2 = B - 157 * AK;
    const gx = sx2 / 2 - 20 + Math.round(sway * 0.5), gy = HOR + 2 - AH + sy2 / 2;
    for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(255, 242, 200, ${0.06 * (4 - i)})`; c.beginPath(); c.ellipse(gx, gy, 6 + i * 6, 4 + i * 4, 0, 0, Math.PI * 2); c.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wreckage

/** A stunt car on its roof, burnt: the roof crushed under it, the body in its paint's ramp gone to soot in patches, the
 *  chassis up top (the exhaust, the driveshaft), the wheels in the air on their rims, glass in bits round it. */
const wreckFlipped = (R: string[]) => (g: Ctx, w: number, h: number) => {
  const C = R.map(col => mix(col, SOOT, 0.35));
  // (the roof, crushed flat under it; glass bits)
  box(g, w * 0.22, h * 0.78, w * 0.56, h * 0.18, INK); box(g, w * 0.23, h * 0.8, w * 0.54, h * 0.14, C[1]);
  for (let i = 0; i < 8; i++) box(g, w * 0.1 + hash(i * 3.3) * w * 0.8, h * 0.94 + hash(i) * 2, 2, 1, '#A6D4EA');
  // (the body, upside down: its side in steps, the stripe, the rocker up top now)
  box(g, 1, h * 0.36, w - 2, h * 0.44, INK);
  box(g, 2, h * 0.38, w - 4, h * 0.4, C[3]); box(g, 2, h * 0.38, w - 4, 2, C[1]); box(g, 2, h * 0.7, w - 4, 3, C[4]);
  box(g, 2, h * 0.5, w - 4, 2, '#E8E4DA'); box(g, 2, h * 0.38, 3, h * 0.4, C[4]); box(g, w - 5, h * 0.38, 3, h * 0.4, C[1]);
  // (soot over it in patches, dithered)
  for (let i = 0; i < 10; i++) { const x = hash(i * 2.3) * (w - 12), y = h * 0.38 + hash(i * 1.7) * h * 0.34; checker(g, x, y, 8 + hash(i) * 8, 4, SOOT, i % 2, 1); }
  // (the chassis up top: dark, the exhaust along it, the diff)
  box(g, 4, h * 0.3, w - 8, h * 0.08, INK); box(g, 5, h * 0.31, w - 10, h * 0.05, '#2A2A30');
  box(g, w * 0.15, h * 0.28, w * 0.6, 2, '#5E6470'); box(g, w * 0.46, h * 0.24, 8, 5, '#3A3E48');
  // (the wheels up in the air: tires, chrome rims gone dull)
  for (const wx of [0.18, 0.78]) {
    const x = w * wx, y = h * 0.24, r = h * 0.17;
    g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#26262C'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6A707A'; g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
    box(g, x - 1, y - 1, 2, 2, '#A8B0BA');
  }
};
/** A stunt car right way up, stoved in at the front, the hood buckled up, glass out, burnt. */
const wreckCrumpled = (R: string[]) => (g: Ctx, w: number, h: number) => {
  const C = R.map(col => mix(col, SOOT, 0.3));
  // (the body: its side in steps, the stripe, the rocker; the nose crushed short, the hood up in a tent)
  box(g, w * 0.08, h * 0.4, w * 0.86, h * 0.46, INK);
  box(g, w * 0.09, h * 0.42, w * 0.84, h * 0.42, C[3]); box(g, w * 0.09, h * 0.42, w * 0.84, 2, C[4]); box(g, w * 0.09, h * 0.78, w * 0.84, 3, '#18181C');
  box(g, w * 0.09, h * 0.56, w * 0.84, 2, '#E8E4DA');
  g.fillStyle = INK; g.beginPath(); g.moveTo(w * 0.62, h * 0.42); g.lineTo(w * 0.78, h * 0.2); g.lineTo(w * 0.94, h * 0.42); g.closePath(); g.fill();
  g.fillStyle = C[2]; g.beginPath(); g.moveTo(w * 0.64, h * 0.42); g.lineTo(w * 0.78, h * 0.24); g.lineTo(w * 0.92, h * 0.42); g.closePath(); g.fill();
  g.fillStyle = C[4]; g.beginPath(); g.moveTo(w * 0.64, h * 0.42); g.lineTo(w * 0.78, h * 0.24); g.lineTo(w * 0.72, h * 0.42); g.closePath(); g.fill();
  // (the cabin: its glass out, dark inside, the roll cage)
  box(g, w * 0.22, h * 0.16, w * 0.38, h * 0.27, INK); box(g, w * 0.24, h * 0.19, w * 0.34, h * 0.22, '#141418'); box(g, w * 0.24, h * 0.16, w * 0.34, 2, C[4]);
  box(g, w * 0.3, h * 0.19, 2, h * 0.22, '#3A3E48'); box(g, w * 0.5, h * 0.19, 2, h * 0.22, '#3A3E48');
  for (let i = 0; i < 10; i++) { const x = hash(i * 2.9) * (w * 0.8), y = h * 0.42 + hash(i * 1.3) * h * 0.36; checker(g, x, y, 6 + hash(i) * 8, 3, SOOT, i % 2, 1); }
  for (const wx of [0.22, 0.78]) {
    const x = w * wx, y = h * 0.84, r = h * 0.15;
    g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#26262C'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6A707A'; g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
  }
};
const burning = (c: Ctx, sx: number, sy: number, s: number, t: number) => { fire(c, sx, sy - s * 0.5, s * 0.8, t, Math.round(sx)); smoke(c, sx, sy - s * 0.9, s, t, Math.round(sx) % 7, { n: 5, size: 0.4, rise: 0.025 }); };
/** A hula hoop lying flat where it came down: taped pink and white, inked. */
const hoop = (g: Ctx, w: number, h: number) => {
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 3, h / 2 - 3, 0, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 12; i++) { g.strokeStyle = i % 2 ? '#F472B6' : '#FDF2F8'; g.lineWidth = 3; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 3, h / 2 - 3, 0, (i * Math.PI) / 6, ((i + 1) * Math.PI) / 6); g.stroke(); }
  g.strokeStyle = '#831843'; g.lineWidth = 1; g.beginPath(); g.ellipse(w / 2, h / 2 + 1, w / 2 - 3, h / 2 - 3, 0, 0.2, Math.PI - 0.2); g.stroke();
};
/** A traffic cone: stepped orange, its reflective bands, the black base. */
const cone = (g: Ctx, w: number, h: number) => {
  box(g, 0, h - 3, w, 3, INK); box(g, 1, h - 3, w - 2, 2, '#26262C');
  g.fillStyle = INK; g.beginPath(); g.moveTo(w / 2 - 1, 0); g.lineTo(w / 2 + 1, 0); g.lineTo(w - 1, h - 3); g.lineTo(1, h - 3); g.closePath(); g.fill();
  g.fillStyle = '#EA580C'; g.beginPath(); g.moveTo(w / 2, 1); g.lineTo(w - 2, h - 4); g.lineTo(2, h - 4); g.closePath(); g.fill();
  g.fillStyle = '#FB923C'; g.beginPath(); g.moveTo(w / 2, 1); g.lineTo(w / 2, h - 4); g.lineTo(2, h - 4); g.closePath(); g.fill();
  box(g, w * 0.3, h * 0.42, w * 0.4, 2, '#F8FAFC'); box(g, w * 0.22, h * 0.66, w * 0.56, 2, '#E2E8F0');
};
/** One of his yellow fliers, trodden on: a boot print over him. */
const flier = (g: Ctx, w: number, h: number) => {
  steveCard(g, w / 2, h / 2, Math.min(w / 44, h / 60), 1);
  for (let i = 0; i < 6; i++) box(g, w * 0.3 + (i % 2) * 4, h * 0.3 + i * 3, 3, 2, 'rgba(41, 37, 36, 0.7)');
};
/** The crash mat he never landed on: blue vinyl in steps, its piping, handles, CRASH MAT stenciled. */
const mat = (g: Ctx, w: number, h: number) => {
  const M = ['#0C1A3E', '#14286A', '#1E3C96', '#2C54BE', '#4A78DA', '#7EA4EE'];
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h * 0.45, M[3]); box(g, 1, 1, w - 2, 2, M[4]);
  box(g, 1, h * 0.45 + 1, w - 2, h * 0.55 - 2, M[2]); box(g, 1, h * 0.45 + 1, w - 2, 1, M[5]);
  for (const hx of [6, w - 14]) box(g, hx, h * 0.6, 8, 2, INK);
  signText(g, 'CRASH MAT', w / 2, h - 3, { sx: 1, sy: 1, fill: M[5], stencil: true, gap: 1 });
};
/** Him, face down by the mat he missed, rear up, pants off. */
const steveDown = (g: Ctx, w: number, h: number) => { g.save(); g.translate(w * 0.5, h); g.scale(w / 100, w / 100); drawSteve(g, 0, 0, 1, 'down', 0, { pantsDown: true }); g.restore(); };
/** His jumpsuit's legs, burnt off him: yellow in steps, the red stripe, scorched through. */
const pants = (g: Ctx, w: number, h: number) => {
  const Y = STEVE;
  box(g, 0, h * 0.2, w, h * 0.62, INK); box(g, 1, h * 0.24, w - 2, h * 0.54, Y[3]); box(g, 1, h * 0.24, w - 2, 2, Y[4]); box(g, 1, h * 0.7, w - 2, 2, Y[2]);
  box(g, w * 0.4, h * 0.24, 3, h * 0.54, '#DC2626'); box(g, w * 0.4, h * 0.24, 1, h * 0.54, '#F87171');
  for (let i = 0; i < 6; i++) { const x = hash(i) * (w - 6), y = h * 0.3 + hash(i * 2) * h * 0.4; box(g, x, y, 5, 3, SOOT); box(g, x + 1, y + 1, 3, 1, '#7A2A0A'); }
};
/** His ash, the gold aviators on top, the neck brace rolled off by it. */
const ash = (g: Ctx, w: number, h: number) => {
  const s = w / 130;
  g.save(); g.translate(0, h); g.scale(s, s);
  drawSteveAsh(g, 54, 0, 1, 0);
  drawSteveBrace(g, 118, 0, 0);
  g.restore();
};
/** A tire lying flat, a hubcap, a foam finger: the show's leavings. */
const tire = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2A2A30'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3E3E46'; g.beginPath(); g.ellipse(w / 2 - 1, h / 2 - 1, w / 2 - 3, h / 2 - 2, 0, Math.PI, Math.PI * 1.8); g.fill();
  g.fillStyle = '#121214'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.22, h * 0.22, 0, 0, Math.PI * 2); g.fill();
};
const hubcap = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#A8B0BA'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E2E8F0'; g.beginPath(); g.ellipse(w / 2 - 1, h / 2 - 1, w / 4, h / 4, 0, 0, Math.PI * 2); g.fill();
  box(g, w / 2 - 1, h / 2 - 1, 2, 1, '#5E6470');
};
const finger = (g: Ctx, w: number, h: number) => {
  const Y = ramp6(STEVE[3]);
  box(g, 0, h * 0.35, w * 0.7, h * 0.65, INK); box(g, 1, h * 0.38, w * 0.7 - 2, h * 0.6, Y[3]); box(g, 1, h * 0.38, 2, h * 0.6, Y[4]);
  box(g, w * 0.66, h * 0.45, w * 0.34, h * 0.22, INK); box(g, w * 0.66, h * 0.48, w * 0.32, h * 0.16, Y[3]);
  signText(g, '#1', w * 0.35, h * 0.85, { sx: 1, sy: 1, fill: '#7A1A0A' });
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // Steve, close by: ash (the lightning), or face down by the mat (anything else)
  if (weakness) out.push({ id: 'sw-ash', x: 1.3, z: 4.2, w: 1.2, h: 0.5, ppm: 40, paint: ash, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 3, { n: 4, size: 0.3, rise: 0.02, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  else {
    out.push({ id: 'sw-mat', x: -2.2, z: 5, w: 2, h: 0.5, ppm: 32, paint: mat });
    out.push({ id: 'sw-steve', x: 1.2, z: 4.6, w: 1.9, h: 0.55, ppm: 50, paint: steveDown });
    out.push({ id: 'sw-pants', x: 2.4, z: 6, w: 0.8, h: 0.35, ppm: 40, paint: pants, live: (c, sx, sy, s, t) => fire(c, sx, sy, s * 0.25, t, 4) });
  }
  // The wrecks, the hoops, the cones, the tires and hubcaps, his fliers (strewn the whole way)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = side * (2.6 + hash(i * 3.3) * 2.4), z = 7 + hash(i * 7.1) * 30, k = i % 6;
    if (k === 0) out.push({ id: 'sw-wreck-r', x, z, w: 3.2, h: 1.3, ppm: 24, paint: wreckFlipped(RED), live: burning, wrap: true });
    else if (k === 1) out.push({ id: 'sw-wreck-b', x, z, w: 3.2, h: 1.3, ppm: 24, paint: wreckCrumpled(BLUE), live: burning, wrap: true });
    else if (k === 2) out.push({ id: 'sw-hoop', x, z, w: 1.6, h: 0.5, ppm: 32, paint: hoop, wrap: true });
    else if (k === 3) out.push({ id: 'sw-tire', x: side * (1.6 + hash(i) * 1.2), z, w: 0.7, h: 0.28, ppm: 40, paint: tire, wrap: true });
    else if (k === 4) out.push({ id: 'sw-hub', x: side * (1.1 + hash(i) * 1.6), z, w: 0.4, h: 0.16, ppm: 48, paint: hubcap, wrap: true });
    else out.push({ id: 'sw-cone', x: side * (0.9 + hash(i) * 0.8), z, w: 0.35, h: 0.5, ppm: 40, paint: cone, wrap: true });
  }
  out.push({ id: 'sw-finger', x: -1.4, z: 9, w: 0.5, h: 0.3, ppm: 48, paint: finger });
  for (let i = 0; i < 6; i++) out.push({ id: 'sw-flier', x: (i % 2 ? 1 : -1) * (0.6 + hash(i * 5.1) * 1.4), z: 5 + hash(i * 2.7) * 26, w: 0.45, h: 0.6, ppm: 40, paint: flier, wrap: true });
  return out;
};

export const STUNTMAN_STEVE: SceneDef = {
  land: 'HOLLYWOOD LAND',
  weapon: 'STUNT_CAR',
  sky: ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#FDE68A', '#FEF3C7'],
  haze: '#A8A29E',
  ground, back, props,
  drawWeapon: (c: Ctx, t: number) => slate(c, t, 0),
  grip: [[0, 0], [0, -14]],
  rim: '#FDBA74',
  embers: ['#FDE68A', '#FDBA74', '#F97316', '#DC2626'],
};

void CONCRETE;
