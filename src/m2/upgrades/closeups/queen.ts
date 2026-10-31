// The cheap shot's own close-up for THE QUEEN (LEGALLY DISTINCT) (the robot). Her glossy black latex ribs over the hips,
// chrome ball joints, pistons, red hydraulic hoses with zip ties, a torn spot showing the yellow foam; over her crotch a
// bolted ACCESS PANEL. His big white cartoon glove (the hand armor) comes in, grabs its edge and RIPS it off (the bolts
// popping, sparks off the torn wires, the panel spinning away), showing the egg bay: two glowing green robot ovaries in
// chrome cradles, copper coils, the BROOD UNIT. Then the boot: green glass, gears, springs and bolts everywhere, oil
// spraying, arcs crackling across the bay, the whole picture flickering as she shorts out. ERROR: NO HEIRS.
//
// Still layers baked once (closeUp.ts bakeOnce); per frame the stamps plus a few dozen shapes.

import { type CloseUpPaint, PANEL_W, PANEL_H, CX, CLOSE_HIT, bakeOnce, bootAt, drawKick, rnd, clamp, lerp } from '../closeUp';
import {
  type Ramp, INK, orb, bands, banded, clipTo, stroke, dith, scanlines, tag, shake, flash, sheet, stampCell, debris, drops, runs,
  sparks, smoke, bigWord,
} from './specialKit';

type Ctx = CanvasRenderingContext2D;

// (her ramps, darkest first: space/queen/paint.ts's)
const LAT: Ramp = ['#06070B', '#15161F', '#242733', '#3E4458', '#7C8AAA'];
const GLOSS = '#B9C6DE';
const CHROME: Ramp = ['#18181B', '#52525B', '#8E8E99', '#C9CBD3', '#FAFAFA'];
const STEEL: Ramp = ['#111114', '#2E2E35', '#4A4A54', '#6E6E7A', '#A6A6B2'];
const FOAM: Ramp = ['#3A2A08', '#A07B22', '#D6AE4A', '#EED27E', '#FFF1BE'];
const GREEN: Ramp = ['#0B2A06', '#2F7A12', '#5CC22A', '#9BF25E', '#E4FFC8'];
const HOSE: Ramp = ['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5'];
const COPPER: Ramp = ['#3A1A06', '#7C3A12', '#B45F24', '#E08A44', '#FFC48A'];
const OIL: Ramp = ['#050505', '#141018', '#7C3AED'];
const OIL_RUN: Ramp = ['#000000', '#141018', '#6D28D9'];
const GLOVE = '#FFFFFF', GLOVE_SH = '#C8CCD6';
const MEAT: Ramp = ['#6B3A22', '#B87A52', '#E3AE86', '#F6D2B0'];

const BAY_X = CX, BAY_Y = 140, BAY_W = 200, BAY_H = 146;
const OV: readonly [number, number][] = [[CX - 32, 152], [CX + 32, 152]];
/** The plate's six bolts (from its middle) and when each pops. */
const BOLTS: readonly [number, number][] = [[-84, -58], [84, -58], [-84, 58], [84, 58], [0, -64], [0, 64]];
const RIP = 10;

const octo = (g: Ctx, cx: number, cy: number, w: number, h: number, ch: number) => () => {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  g.moveTo(x0 + ch, y0); g.lineTo(x1 - ch, y0); g.lineTo(x1, y0 + ch); g.lineTo(x1, y1 - ch); g.lineTo(x1 - ch, y1); g.lineTo(x0 + ch, y1); g.lineTo(x0, y1 - ch); g.lineTo(x0, y0 + ch); g.closePath();
};
const tube = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, R: Ramp) => {
  const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
  g.save(); g.translate(x1, y1); g.rotate(a);
  banded(g, () => g.rect(0, -w / 2, len, w), 0, -w / 2, len, w, [R[1], R[3], R[4], R[2], R[1]], true, INK, 2);
  g.restore();
};

// ---- her hips: latex ribs, joints, pistons, hoses, foam; the bay (under the plate)
const body = () => bakeOnce('queen-body', g => {
  bands(g, 0, 0, PANEL_W, PANEL_H, [LAT[1], LAT[2], LAT[1], LAT[0]]);
  // (the ribs: each a glossy black ridge, a gloss line, a shadow under)
  for (let y = 4; y < PANEL_H; y += 22) {
    for (const s of [-1, 1]) {
      const path = () => { g.moveTo(CX + s * 20, y); g.quadraticCurveTo(CX + s * 140, y - 10 + Math.abs(y - 140) * 0.05, CX + s * 300, y + 6); g.lineTo(CX + s * 300, y + 18); g.quadraticCurveTo(CX + s * 140, y + 6, CX + s * 20, y + 16); g.closePath(); };
      banded(g, path, CX - 300, y - 12, 600, 34, [LAT[4], LAT[3], LAT[2], LAT[1]], true, INK, 2);
      stroke(g, () => { g.moveTo(CX + s * 40, y + 3); g.quadraticCurveTo(CX + s * 140, y - 5, CX + s * 260, y + 6); }, GLOSS, 1);
    }
  }
  // (a torn spot: the yellow foam under the latex)
  const tear = () => { for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 2, r = 22 * (1 + (rnd(i % 14 + 3) - 0.5) * 0.6); const x = 70 + Math.cos(a) * r * 1.4, y = 210 + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); };
  banded(g, tear, 30, 180, 80, 60, [FOAM[4], FOAM[3], FOAM[2], FOAM[1]], true, INK, 3);
  for (let i = 0; i < 30; i++) { g.fillStyle = FOAM[i % 2]; g.fillRect(Math.round(46 + rnd(i * 3.1) * 48), Math.round(196 + rnd(i * 5.3) * 28), 2, 2); }
  // (the hip joints: big chrome balls; pistons down the thighs)
  for (const s of [-1, 1]) {
    tube(g, CX + s * 196, 92, CX + s * 170, PANEL_H + 10, 14, CHROME);
    tube(g, CX + s * 196, 92, CX + s * 230, 10, 10, STEEL);
    orb(g, CX + s * 196, 92, 30, 30, CHROME);
  }
  // (hydraulic hoses, red, zip-tied)
  for (const s of [-1, 1]) {
    const pts: [number, number][] = []; for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push([CX + s * (120 + k * 40), -4 + k * 290 + Math.sin(k * 6) * 10]); }
    for (let pass = 0; pass < 3; pass++) { g.strokeStyle = [INK, HOSE[2], HOSE[4]][pass]; g.lineWidth = [10, 6, 2][pass]; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x - (pass === 2 ? 1 : 0), y) : g.moveTo(x, y))); g.stroke(); }
    for (const i of [3, 7, 10]) { const [x, y] = pts[i]; g.fillStyle = INK; g.fillRect(x - 8, y - 2, 16, 5); g.fillStyle = '#F4F4F5'; g.fillRect(x - 7, y - 1, 14, 3); g.fillRect(x + 7, y - 4, 4, 3); }
  }
  // (the bay, under the plate: a chrome rim round a dark machine cavity)
  g.fillStyle = INK; g.beginPath(); octo(g, BAY_X, BAY_Y, BAY_W + 16, BAY_H + 16, 30)(); g.fill();
  banded(g, octo(g, BAY_X, BAY_Y, BAY_W + 10, BAY_H + 10, 28), BAY_X - 110, BAY_Y - 80, 220, 160, [CHROME[4], CHROME[3], CHROME[2], CHROME[1]], true, INK, 2);
  clipTo(g, octo(g, BAY_X, BAY_Y, BAY_W, BAY_H, 26), () => {
    bands(g, BAY_X - 100, BAY_Y - 73, 200, 146, [STEEL[0], STEEL[1], STEEL[1], STEEL[0]]);
    // (panel lines, a grid of rivets)
    g.strokeStyle = STEEL[2]; g.lineWidth = 1; g.beginPath(); for (let x = BAY_X - 90; x < BAY_X + 100; x += 30) { g.moveTo(x, BAY_Y - 73); g.lineTo(x, BAY_Y + 73); } g.stroke();
    for (let x = BAY_X - 90; x < BAY_X + 100; x += 30) for (let y = BAY_Y - 60; y < BAY_Y + 70; y += 24) { g.fillStyle = STEEL[3]; g.fillRect(x - 1, y, 3, 3); g.fillStyle = INK; g.fillRect(x + 1, y + 2, 1, 1); }
    // (wire bundles across the back)
    for (const [col, dy] of [['#EF4444', 0], ['#3B82F6', 6], ['#FACC15', 12], ['#22C55E', 18]] as const) stroke(g, () => { g.moveTo(BAY_X - 100, BAY_Y + 30 + dy); g.bezierCurveTo(BAY_X - 40, BAY_Y + 70 + dy, BAY_X + 40, BAY_Y - 10 + dy, BAY_X + 100, BAY_Y + 40 + dy); }, col, 3);
    // (copper coils at the corners)
    for (const s of [-1, 1]) for (let k = 0; k < 7; k++) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(BAY_X + s * 76, BAY_Y - 40 + k * 7, 12, 4, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = COPPER[3 - (k % 2)]; g.lineWidth = 2; g.stroke(); }
    // (the BROOD UNIT: a chrome canister up the middle, ribbed hoses out to the cradles)
    for (const [ox, oy] of OV) for (let k = 0; k < 6; k++) { const u = k / 6; orb(g, lerp(BAY_X, ox, u), lerp(BAY_Y - 30, oy - 14, u), 5, 5, CHROME, INK, false); }
    banded(g, () => g.roundRect(BAY_X - 18, BAY_Y - 70, 36, 64, 6), BAY_X - 18, BAY_Y - 70, 36, 64, [CHROME[2], CHROME[4], CHROME[3], CHROME[1]], false, INK, 2);
    g.fillStyle = '#FACC15'; g.fillRect(BAY_X - 18, BAY_Y - 46, 36, 12);
    tag(g, 'BROOD', BAY_X, BAY_Y - 36, INK, 6, 'center');
    // (the cradles the ovaries sit in)
    for (const [ox, oy] of OV) banded(g, () => { g.arc(ox, oy, 28, 0.15, Math.PI - 0.15); g.lineTo(ox - 20, oy + 8); g.arc(ox, oy, 21, Math.PI - 0.3, 0.3, true); g.closePath(); }, ox - 30, oy, 60, 30, [CHROME[4], CHROME[3], CHROME[2]], true, INK, 2);
    tag(g, 'EGG BAY', BAY_X - 90, BAY_Y + 66, '#FACC15', 6);
    tag(g, '(LEGALLY DISTINCT)', BAY_X - 4, BAY_Y + 66, '#A3E635', 5);
    scanlines(g, 0.18);
  });
  tag(g, 'SCAN', 12, 20, '#A3E635');
});

// ---- the ACCESS PANEL (it comes off)
const plate = () => bakeOnce('queen-plate', g => {
  g.translate(104, 78);
  g.fillStyle = INK; g.beginPath(); octo(g, 0, 0, BAY_W + 8, BAY_H + 8, 28)(); g.fill();
  banded(g, octo(g, 0, 0, BAY_W + 2, BAY_H + 2, 27), -102, -74, 204, 148, [LAT[4], LAT[3], LAT[2], LAT[1], LAT[0]], true, CHROME[3], 3);
  for (let y = -50; y < 60; y += 18) { stroke(g, () => { g.moveTo(-80, y); g.quadraticCurveTo(0, y + 8, 80, y); }, INK, 3); stroke(g, () => { g.moveTo(-76, y - 2); g.quadraticCurveTo(0, y + 6, 76, y - 2); }, GLOSS, 1); }
  // (a hazard stripe, the stencils)
  clipTo(g, () => g.rect(-60, 40, 120, 14), () => { g.fillStyle = '#FACC15'; g.fillRect(-60, 40, 120, 14); g.fillStyle = INK; for (let x = -70; x < 70; x += 14) { g.beginPath(); g.moveTo(x, 54); g.lineTo(x + 7, 54); g.lineTo(x + 21, 40); g.lineTo(x + 14, 40); g.fill(); } });
  tag(g, 'ACCESS PANEL', 0, -14, '#FACC15', 8, 'center');
  tag(g, 'NO USER SERVICEABLE', 0, 4, '#E4E4E7', 5, 'center');
  tag(g, 'PARTS INSIDE', 0, 14, '#E4E4E7', 5, 'center');
  for (const [x, y] of BOLTS) orb(g, x, y, 5, 5, CHROME);
}, 208, 156);

// ---- his glove: the big white cartoon glove, gripping (its grip point at the sprite's (22, 22))
const glove = () => bakeOnce('queen-glove', g => {
  // (his forearm off the bottom right, the rolled cuff, the palm, four fat fingers curled over the edge)
  banded(g, () => { g.moveTo(96, 96); g.lineTo(150, 130); g.lineTo(150, 170); g.lineTo(80, 130); g.closePath(); }, 80, 96, 70, 74, [MEAT[3], MEAT[2], MEAT[1]], true, INK, 3);
  g.save(); g.translate(90, 104); g.rotate(0.6);
  g.fillStyle = INK; g.beginPath(); g.roundRect(-30, -16, 60, 32, 12); g.fill();
  g.fillStyle = GLOVE; g.beginPath(); g.roundRect(-27, -13, 54, 26, 10); g.fill();
  g.fillStyle = GLOVE_SH; g.fillRect(-27, 4, 54, 6);
  g.restore();
  const blob = (x: number, y: number, rx: number, ry: number, rot: number) => { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 3, ry + 3, rot, 0, Math.PI * 2); g.fill(); g.fillStyle = GLOVE; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); g.fillStyle = dith(g, GLOVE_SH); g.beginPath(); g.ellipse(x + rx * 0.25, y + ry * 0.3, rx * 0.7, ry * 0.6, rot, 0, Math.PI * 2); g.fill(); };
  blob(62, 66, 34, 30, 0.5);
  for (let k = 0; k < 4; k++) blob(22 + k * 9, 24 + k * 6 - (k === 3 ? 2 : 0), 10, 16, 0.9);
  blob(78, 40, 9, 18, -0.4);
  stroke(g, () => { for (let k = 0; k < 3; k++) { g.moveTo(58 + k * 8, 52 + k * 2); g.lineTo(72 + k * 8, 72 + k * 2); } }, INK, 2.5);
}, 152, 172);

// ---- the ovaries, and the junk
const ovary = () => bakeOnce('queen-ovary', g => {
  orb(g, 26, 26, 21, 21, GREEN, INK, true);
  stroke(g, () => { g.moveTo(14, 26); for (let k = 0; k < 8; k++) g.lineTo(16 + k * 3, k % 2 ? 20 : 32); }, GREEN[4], 2);
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(14, 12, 8, 3);
  // (a chrome cap, the socket)
  banded(g, () => g.rect(18, 2, 16, 6), 18, 2, 16, 6, [CHROME[4], CHROME[2]], false, INK, 1.5);
}, 52, 52);
const junk = () => sheet('queen-junk', 8, 32, (g, i) => {
  if (i === 0) {
    g.fillStyle = INK; for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.save(); g.rotate(a); g.fillRect(-3, -14, 6, 6); g.restore(); }
    orb(g, 0, 0, 11, 11, CHROME); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.save(); g.rotate(a); g.fillStyle = CHROME[3]; g.fillRect(-2, -13, 4, 4); g.restore(); }
    g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill();
  } else if (i === 1) {
    for (let k = 0; k < 6; k++) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(-10 + k * 4, 0, 4, 9, 0.2, 0, Math.PI * 2); g.stroke(); g.strokeStyle = CHROME[3]; g.lineWidth = 2; g.stroke(); }
  } else if (i === 2) {
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.lineTo(Math.cos(a) * 7, Math.sin(a) * 7); } g.closePath(); g.fillStyle = CHROME[3]; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.fillStyle = CHROME[1]; g.fillRect(-2, -2, 4, 4);
  } else if (i < 5) {
    g.beginPath(); g.moveTo(-8, -6); g.lineTo(8 - i, -9); g.lineTo(4, 8); g.closePath(); g.fillStyle = GREEN[i === 3 ? 3 : 2]; g.fill(); g.strokeStyle = GREEN[0]; g.lineWidth = 2; g.stroke(); g.fillStyle = GREEN[4]; g.fillRect(-4, -5, 4, 2);
  } else if (i === 5) {
    for (let k = 0; k < 4; k++) { g.strokeStyle = COPPER[3]; g.lineWidth = 2; g.beginPath(); g.ellipse(-6 + k * 4, 0, 3, 7, 0, 0, Math.PI * 2); g.stroke(); }
  } else if (i === 6) {
    banded(g, () => { g.moveTo(-12, -4); g.quadraticCurveTo(0, -10, 12, -4); g.lineTo(10, 4); g.quadraticCurveTo(0, -2, -10, 4); g.closePath(); }, -12, -10, 24, 14, [LAT[4], LAT[3], LAT[2]], true, INK, 2);
  } else {
    g.fillStyle = INK; g.fillRect(-10, -7, 20, 14); g.fillStyle = '#166534'; g.fillRect(-9, -6, 18, 12);
    g.fillStyle = '#18181B'; g.fillRect(-4, -3, 8, 6); g.fillStyle = '#FACC15'; for (let k = -8; k < 9; k += 3) { g.fillRect(k, -8, 1, 2); g.fillRect(k, 6, 1, 2); }
  }
});

/** An electric arc between two points (a jagged polyline, white over blue), re-rolled each frame. */
const arc = (c: Ctx, x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const pts: [number, number][] = [[x0, y0]];
  for (let k = 1; k < 6; k++) { const u = k / 6; pts.push([lerp(x0, x1, u) + (rnd(seed + k) - 0.5) * 24, lerp(y0, y1, u) + (rnd(seed + k * 2.3) - 0.5) * 24]); }
  pts.push([x1, y1]);
  for (const [col, w] of [['#60A5FA', 5], ['#E0F2FE', 2]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
};

export const closeUp: CloseUpPaint = (c, t) => {
  const hit = t - CLOSE_HIT;
  c.save();
  c.fillStyle = INK; c.fillRect(0, 0, PANEL_W, PANEL_H);
  shake(c, hit, 12, 12);
  if (t >= RIP - 2 && t < RIP + 2) c.translate((t % 2 ? 2 : -2), 0);
  c.drawImage(body(), 0, 0);
  // (the ovaries: glowing, pulsing; smashed to a flicker)
  const alive = hit < 0 ? 1 : hit < 6 ? (t % 2 ? 0.8 : 0.2) : 0;
  if (alive > 0) { c.fillStyle = `rgba(155,242,94,${(0.22 * alive + Math.sin(t * 0.5) * 0.06).toFixed(2)})`; for (const [x, y] of OV) { c.beginPath(); c.ellipse(x, y, 36, 34, 0, 0, Math.PI * 2); c.fill(); } }
  for (let i = 0; i < 2; i++) {
    const [x, y] = OV[i];
    if (hit < 2) { const sq = hit < 0 ? 0 : hit / 2; c.save(); c.translate(x + (i ? 1 : -1) * sq * 6, y - sq * 6); c.scale(1 + sq * 0.3, 1 - sq * 0.5); c.drawImage(ovary(), -26, -26); c.restore(); }
    else { stampCell(c, junk(), 3, x - 6, y + 10, 0.5 + i, 1.3); stampCell(c, junk(), 4, x + 8, y + 12, 2 + i, 1.1); }
  }
  if (hit >= 6) runs(c, hit - 6, [[CX - 60, 206], [CX - 26, 212], [CX + 10, 212], [CX + 48, 208], [CX + 80, 196]], OIL_RUN, 70, 2, 6);
  // (the panel: bolted on, strained, ripped off and spinning away)
  if (t < RIP + 9) {
    let px = BAY_X, py = BAY_Y, rot = 0, sc = 1;
    if (t >= RIP - 3 && t < RIP) { px += (t % 2 ? 2 : -2); rot = -0.03 * (t - RIP + 3); }
    else if (t >= RIP) { const u = t - RIP; px = BAY_X + u * 28 + u * u * 2; py = BAY_Y - u * 20; rot = -0.12 - u * 0.28; sc = 1 + u * 0.05; }
    c.save(); c.translate(px, py); c.rotate(rot); c.scale(sc, sc);
    c.drawImage(plate(), -104, -78);
    // (the bolts still in it go dark where they've popped)
    for (let i = 0; i < BOLTS.length; i++) if (t >= RIP - 3 + i * 0.6) { c.fillStyle = INK; c.fillRect(BOLTS[i][0] - 4, BOLTS[i][1] - 4, 8, 8); }
    c.restore();
    // (the glove: comes in, grips the bottom corner, yanks with it)
    const cx = 90, cy = 64, gx0 = px + (Math.cos(rot) * cx - Math.sin(rot) * cy) * sc, gy0 = py + (Math.sin(rot) * cx + Math.cos(rot) * cy) * sc;
    const k = clamp(t / (RIP - 4)), gx = t < RIP - 4 ? lerp(PANEL_W + 80, gx0, k * (2 - k)) : gx0, gy = t < RIP - 4 ? lerp(PANEL_H + 110, gy0, k * (2 - k)) : gy0;
    c.drawImage(glove(), gx - 22, gy - 22);
  }
  // (the bolts popping out, spinning off)
  for (let i = 0; i < BOLTS.length; i++) {
    const u = t - (RIP - 3 + i * 0.6);
    if (u < 0 || u > 30) continue;
    const a = Math.atan2(BOLTS[i][1], BOLTS[i][0]) - 0.4 + rnd(i) * 0.8;
    stampCell(c, junk(), 2, BAY_X + BOLTS[i][0] + Math.cos(a) * u * 7, BAY_Y + BOLTS[i][1] + Math.sin(a) * u * 7 - u * 3 + 0.4 * u * u, u * 0.7, 0.9);
    sparks(c, u, BAY_X + BOLTS[i][0], BAY_Y + BOLTS[i][1], 4, i * 9, 6);
  }
  sparks(c, t - RIP, BAY_X + 70, BAY_Y + 50, 12, 99, 10);
  // (his boot)
  const b = bootAt(t);
  drawKick(c, b.x, b.y, t);
  // (the smash: green glass, gears, springs, bolts, chips; oil sprayed; sparks)
  if (hit >= 0) {
    debris(c, junk(), 28, hit, CX, 150, { seed: 21, ang: -Math.PI / 2, spread: 3.6, v0: 4, v1: 13, grav: 0.38, delay: 4, scale: 1.2, spin: 0.6 });
    drops(c, hit, CX, 150, 40, 9, OIL, { spread: 3.4, v0: 3, v1: 12, delay: 6 });
    sparks(c, hit, CX, 150, 30, 3, 18, ['#FDE047', '#FFFFFF', '#A3E635'], 10);
    smoke(c, hit - 10, CX, 130, 10, 61, { rise: 1.3, every: 6, life: 60, alpha: 0.6 });
    // (arcs across the bay, fewer as she dies)
    const nArc = hit < 20 ? 3 : hit < 50 ? (t % 3 === 0 ? 1 : 0) : (t % 9 === 0 ? 1 : 0);
    for (let i = 0; i < nArc; i++) arc(c, CX + (rnd(t * 3 + i) - 0.5) * 120, 90 + rnd(t * 5 + i) * 30, CX + (rnd(t * 7 + i) - 0.5) * 180, 150 + rnd(t * 11 + i) * 50, t * 17 + i * 5);
  }
  c.restore();
  // (the short-circuit flicker over the lot)
  if (hit >= 0 && hit < 50 && rnd(t * 7.7) < 0.35) { c.fillStyle = `rgba(0,0,0,${(0.55 - hit * 0.008).toFixed(2)})`; c.fillRect(0, 0, PANEL_W, PANEL_H); }
  bigWord(c, hit - 1, 'KRZZZT!', CX + 130, 64, 28, '#FDE047', '#0B1A04');
  flash(c, hit, '228,255,200', 3);
  if (t >= RIP && t < RIP + 2) flash(c, t - RIP, '255,255,255', 2);
  if (hit > 34) tag(c, (t >> 3) % 2 ? 'ERROR: NO HEIRS' : 'ERROR: NO HEIRS_', 12, 268, '#A3E635');
};
