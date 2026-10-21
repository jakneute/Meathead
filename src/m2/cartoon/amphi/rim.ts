// What stands along the bowl's far rim (at D_RIM, just behind the grass bank, on its top): the amphitheater's back of
// house and its sad lawn, painted once per hour in 400 px chunks (stamps) and put down at depth to the one eye. Left to
// right: the RESTROOMS block (one door OUT OF ORDER), oaks, the back of the lawn seats (LAWN, a blanket somebody left,
// a lost cooler), a PA delay tower on its scaffold, a row of JOHNNY ON THE SPOT port-a-johns, a half-dead oak, the
// FUNNEL CAKE trailer shuttered, a picnic table, the second delay tower, the SUMMER CONCERT SERIES billboard (CANCELED
// across it), the dumpsters and a golf cart, the CAST ONLY fence; behind the band shell, the backstage: HONK's
// dressing room (an old RV, a star taped on its door, a lawn chair, a cooler of SWILL LITE, an extension cord), a
// generator, road cases, the butt can by a bench, more oaks and a light tower. Scenery all of it (dimmed toward the
// air: none of it reads as somewhere to stand).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { pixelBlob } from '../../../m1/game/render/pixelArt';
import { signText } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { timeOfDay } from '../../timeOfDay';
import { X, TOP_Y } from './layout';
import { box, hash, checker, dimmed, INK, DC, DR, STEEL, PLY, BARK, RED, tiny, small, streaks, type Ctx } from './mats';

/** The rim's depth; where it stands (the top of the grass bank). */
export const D_RIM = 0.66;
export const BANK_Y = TOP_Y - 26;
const CHUNK = 400, TALL = 300;

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

// ---------------------------------------------------------------------------------------------------------------
// The pieces (feet at y 0, x local to the chunk)

/** An oak in steps: a forked trunk, the crown in lumps, lit up top, shaded under; `dead` the one side bare. */
const oak = (g: Ctx, x: number, h: number, r: number, seed: number, dead = false) => {
  const B = DR(BARK), L = DC(['#3E6A34', '#4A7A3A', '#55803C', '#6A863A'][Math.floor(hash(seed) * 4)]);
  box(g, x - 5, -h * 0.55, 10, h * 0.55, INK); box(g, x - 4, -h * 0.55, 8, h * 0.55, B[3]); box(g, x - 4, -h * 0.55, 2, h * 0.55, B[4]); box(g, x + 2, -h * 0.55, 2, h * 0.55, B[1]);
  box(g, x - 8, -4, 16, 4, B[2]); box(g, x - 10, -2, 4, 2, B[2]); box(g, x + 6, -2, 4, 2, B[2]);
  g.lineCap = 'round';
  for (const [dx, dy, w] of [[-r * 0.6, -h * 0.95, 5], [r * 0.55, -h * 0.9, 5], [0, -h * 1.05, 4], [-r * 0.9, -h * 0.75, 3]] as const) {
    g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x, -h * 0.5); g.quadraticCurveTo(x + dx * 0.3, -h * 0.7, x + dx, dy); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = w; g.stroke();
  }
  const cy = -h - r * 0.2;
  const lumps: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + seed, d = r * (0.45 + hash(seed + i) * 0.3); if (dead && Math.cos(a) > 0.2) continue; lumps.push([x + Math.cos(a) * d * 1.2, cy + Math.sin(a) * d * 0.6, r * (0.42 + hash(seed * 2 + i) * 0.2)]); }
  if (!dead) lumps.push([x, cy, r * 0.6]);
  for (const [lx, ly, lr] of lumps) pixelBlob(g, lx + 2, ly + 3, lr + 2, lr * 0.85 + 2, INK);
  for (const [lx, ly, lr] of lumps) pixelBlob(g, lx + 1, ly + 2, lr, lr * 0.85, L[1]);
  for (const [lx, ly, lr] of lumps) pixelBlob(g, lx - 1, ly - 1, lr * 0.8, lr * 0.65, L[2]);
  for (const [lx, ly, lr] of lumps) pixelBlob(g, lx - lr * 0.3, ly - lr * 0.35, lr * 0.45, lr * 0.32, L[3]);
  for (const [lx, ly, lr] of lumps.slice(0, 4)) { pixelBlob(g, lx - lr * 0.4, ly - lr * 0.5, lr * 0.18, lr * 0.12, L[4]); checker(g, lx - lr * 0.6, ly + lr * 0.3, lr * 1.1, 4, L[0], 0, 2); }
  if (dead) { g.strokeStyle = B[2]; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 4; k++) { const bx = x + r * (0.3 + k * 0.25), by = cy - 10 + k * 8; g.moveTo(x + 4, cy + 18 - k * 4); g.lineTo(bx, by); g.lineTo(bx + 8, by - 8); } g.stroke(); }
};
/** A cinder-block outbuilding with a flat roof (x..x+w, h tall). */
const blockHut = (g: Ctx, x: number, w: number, h: number, col: string) => {
  const R = DC(col);
  box(g, x - 1, -h - 1, w + 2, h + 1, INK); box(g, x, -h, w, h, R[3]); box(g, x, -h, 3, h, R[4]); box(g, x + w - 6, -h, 6, h, R[2]); checker(g, x + w - 8, -h, 2, h, R[2], 0, 1);
  for (let y = -h + 8; y < 0; y += 8) box(g, x, y, w, 1, R[2]);
  for (let y = -h, r = 0; y < 0; y += 8, r++) for (let bx = x + (r % 2) * 10; bx < x + w; bx += 20) box(g, bx, y, 1, 8, R[2]);
  box(g, x - 4, -h - 5, w + 8, 5, INK); box(g, x - 3, -h - 4, w + 6, 3, DC('#8A8478')[4]);
  streaks(g, x + 2, -h, w - 4, h * 0.6, x, dimmed('#5A5448'), 4);
};

/** The RESTROOMS block: MEN, WOMEN, one door OUT OF ORDER; a drinking fountain. */
const restrooms = (g: Ctx, x: number) => {
  blockHut(g, x, 150, 74, '#C8BEA8');
  for (const [dx, name, out] of [[20, 'MEN', false], [92, 'WOMEN', true]] as const) {
    box(g, x + dx - 1, -55, 38, 55, INK); box(g, x + dx, -54, 36, 54, dimmed('#3A6A8A')); box(g, x + dx, -54, 3, 54, dimmed('#5A8AAA')); box(g, x + dx + 28, -30, 4, 3, dimmed('#C8C0A0'));
    box(g, x + dx + 2, -70, 32, 11, INK); box(g, x + dx + 3, -69, 30, 9, dimmed('#F4F1E8')); signText(g, name, x + dx + 18, -62, small(dimmed('#2A3A5A')));
    if (out) { box(g, x + dx + 4, -40, 28, 14, dimmed('#F4F1E8')); signText(g, 'OUT OF', x + dx + 18, -34, tiny(dimmed('#B91C1C'))); signText(g, 'ORDER', x + dx + 18, -27, tiny(dimmed('#B91C1C'))); box(g, x + dx + 2, -42, 3, 3, dimmed('#9AA0A8')); box(g, x + dx + 31, -42, 3, 3, dimmed('#9AA0A8')); }
  }
  const S = DR(STEEL); box(g, x + 64, -26, 14, 26, S[2]); box(g, x + 62, -30, 18, 6, S[3]); box(g, x + 62, -30, 18, 1, S[4]); box(g, x + 69, -33, 3, 3, S[4]);
  box(g, x + 140, -66, 6, 6, dimmed('#3A3A40')); box(g, x + 141, -65, 4, 2, timeOfDay().lamps > 0.3 ? '#FFE8B0' : dimmed('#C8C4B8'));
};
/** The back of the lawn seats: LAWN on a post, a blanket somebody left, a lost cooler, a frisbee. */
const lawnBack = (g: Ctx, x: number) => {
  const P = DR(PLY);
  box(g, x + 30, -46, 4, 46, P[2]); box(g, x + 4, -64, 56, 20, INK); box(g, x + 5, -63, 54, 18, dimmed('#2A5A8A')); box(g, x + 5, -63, 54, 2, dimmed('#5A8ABA'));
  signText(g, 'LAWN', x + 32, -51, small(dimmed('#FDE047'), dimmed(INK)));
  for (let k = 0; k < 6; k++) { box(g, x + 70 + k * 8, -4, 8, 4, dimmed(k % 2 ? '#C83A3A' : '#F4F1E8')); } box(g, x + 70, -5, 48, 1, dimmed('#8A2A2A'));
  box(g, x + 140, -14, 22, 14, INK); box(g, x + 141, -13, 20, 12, dimmed('#2A6AC8')); box(g, x + 141, -13, 20, 3, dimmed('#F4F1E8')); box(g, x + 141, -10, 20, 1, dimmed('#1A4A9A'));
  g.fillStyle = dimmed('#F2C030'); g.beginPath(); g.ellipse(x + 182, -2, 7, 2, 0, 0, Math.PI * 2); g.fill();
};
/** A PA delay tower: a scaffold with two speaker cabinets up top, cabled down, a tarp round its foot. */
const delayTower = (g: Ctx, x: number) => {
  const S = DR(STEEL);
  for (const s of [-1, 1]) { box(g, x + s * 16 - 1, -170, 3, 170, INK); box(g, x + s * 16, -170, 1, 170, S[4]); }
  g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); for (let y = -170; y < 0; y += 24) { g.moveTo(x - 16, y); g.lineTo(x + 16, y + 24); g.moveTo(x - 16, y + 24); g.lineTo(x + 16, y); } g.stroke();
  for (let y = -170; y < 0; y += 48) box(g, x - 17, y, 34, 2, S[3]);
  for (const [dx, dy] of [[-15, -210], [1, -206]] as const) { box(g, x + dx - 1, dy - 1, 16, 38, INK); box(g, x + dx, dy, 14, 36, dimmed('#2A2A30')); box(g, x + dx, dy, 14, 1, dimmed('#5A5A64')); g.fillStyle = dimmed('#141418'); g.beginPath(); g.arc(x + dx + 7, dy + 24, 5, 0, Math.PI * 2); g.fill(); box(g, x + dx + 3, dy + 4, 8, 6, dimmed('#3A3A44')); }
  box(g, x - 20, -172, 40, 4, S[2]);
  box(g, x - 22, -24, 44, 24, dimmed('#2A4A3A')); for (let k = 0; k < 44; k += 6) box(g, x - 22 + k, -24, 1, 24, dimmed('#1A3A2A')); box(g, x - 22, -24, 44, 2, dimmed('#4A6A5A'));
  g.strokeStyle = dimmed('#1A1A1A'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, -172); g.quadraticCurveTo(x + 30, -90, x + 26, -2); g.stroke();
};
/** A row of port-a-johns, blue, JOHNNY ON THE SPOT, one door hanging open, one OCCUPIED. */
const johns = (g: Ctx, x: number, n: number) => {
  const B = DC('#2A6AC8');
  for (let i = 0; i < n; i++) {
    const jx = x + i * 34;
    box(g, jx - 1, -78, 32, 78, INK); box(g, jx, -77, 30, 77, B[3]); box(g, jx, -77, 4, 77, B[4]); box(g, jx + 24, -77, 6, 77, B[2]); checker(g, jx + 22, -77, 2, 77, B[2], 0, 1);
    box(g, jx - 2, -84, 34, 8, INK); box(g, jx - 1, -83, 32, 6, B[4]); box(g, jx - 1, -78, 32, 1, B[1]);
    for (let k = 0; k < 5; k++) box(g, jx + 6, -72 + k * 3, 18, 1, B[1]);
    box(g, jx + 4, -40, 6, 10, dimmed(i === 2 ? '#C83A3A' : '#3AAA5A')); signText(g, i === 2 ? 'OCC' : 'VAC', jx + 15, -32, tiny(dimmed('#F4F1E8')));
    if (i === 3) { box(g, jx + 2, -66, 26, 62, dimmed('#141820')); box(g, jx + 28, -66, 8, 62, B[2]); box(g, jx + 6, -24, 18, 8, dimmed('#3A4A5A')); }
    signText(g, 'JOHNNY', jx + 15, -54, tiny(dimmed('#F4F1E8')));
  }
};
/** The FUNNEL CAKE trailer: shuttered, its hitch on a block, a menu peeling; a picnic table by it. */
const funnel = (g: Ctx, x: number) => {
  const W = DC('#F4E8D0'), R = DR(RED);
  box(g, x - 1, -86, 132, 76, INK); box(g, x, -85, 130, 74, W[3]); box(g, x, -85, 130, 3, W[5]); box(g, x + 120, -85, 10, 74, W[2]);
  for (let k = 0; k < 130; k += 10) box(g, x + k, -22, 5, 11, R[3]);
  box(g, x + 18, -70, 74, 34, dimmed('#8A8A90')); for (let k = 0; k < 34; k += 3) box(g, x + 18, -70 + k, 74, 1, dimmed('#6A6A72')); signText(g, 'CLOSED', x + 55, -50, small(dimmed('#B91C1C')));
  box(g, x + 8, -98, 110, 14, INK); box(g, x + 9, -97, 108, 12, R[3]); signText(g, 'FUNNEL CAKE', x + 63, -88, small(dimmed('#FDE68A')));
  for (const wx of [x + 26, x + 100]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -8, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#5A5A64'); g.beginPath(); g.arc(wx, -8, 5, 0, Math.PI * 2); g.fill(); }
  box(g, x - 20, -14, 22, 3, dimmed('#5A5A64')); box(g, x - 24, -10, 10, 10, DC('#9A9488')[2]);
  const P = DR(PLY); box(g, x + 150, -22, 60, 5, P[4]); box(g, x + 150, -17, 60, 2, P[1]); box(g, x + 146, -10, 68, 3, P[3]); for (const lx of [x + 156, x + 200]) { box(g, lx, -17, 3, 17, P[2]); }
};
/** The SUMMER CONCERT SERIES billboard on its posts, CANCELED slapped across. */
const billboard = (g: Ctx, x: number) => {
  const S = DR(STEEL);
  for (const lx of [x + 30, x + 150]) { box(g, lx - 2, -130, 5, 130, INK); box(g, lx - 1, -130, 3, 130, S[3]); }
  box(g, x - 1, -210, 182, 84, INK); box(g, x, -209, 180, 82, dimmed('#1E3A8A')); box(g, x, -209, 180, 4, dimmed('#3A5AB8'));
  signText(g, 'UBX AMPHITHEATER', x + 90, -194, small(dimmed('#FDE047'), dimmed(INK)));
  signText(g, "SUMMER '96", x + 90, -176, { sx: 2, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE68A')], ink: dimmed(INK) });
  signText(g, 'CONCERT SERIES', x + 90, -160, small(dimmed('#FFFFFF')));
  signText(g, 'ACTS TBA', x + 90, -146, tiny(dimmed('#C8D4F0')));
  g.save(); g.translate(x + 92, -170); g.rotate(-0.16); box(g, -84, -10, 168, 20, INK); box(g, -83, -9, 166, 18, dimmed('#DC2626')); signText(g, 'CANCELED', 0, 5, { sx: 2, sy: 2, bold: true, fill: dimmed('#FFFFFF') }); g.restore();
  streaks(g, x + 4, -205, 172, 60, x, dimmed('#14204A'), 6);
  box(g, x - 4, -128, 188, 3, S[2]);
  if (timeOfDay().lamps > 0.3) for (const lx of [x + 30, x + 90, x + 150]) box(g, lx - 3, -126, 6, 3, '#FFF0C0');
};
/** Two dumpsters (one lid up, bags), a golf cart with UBX STAFF on it. */
const dumpsters = (g: Ctx, x: number) => {
  for (let k = 0; k < 2; k++) {
    const dx = x + k * 70, D = DC(k ? '#2A6A4A' : '#3A5A8A');
    box(g, dx - 1, -40, 62, 40, INK); box(g, dx, -39, 60, 39, D[3]); box(g, dx, -39, 4, 39, D[4]); box(g, dx + 52, -39, 8, 39, D[2]); for (let r = 0; r < 4; r++) box(g, dx, -32 + r * 8, 60, 1, D[2]);
    if (k === 0) { g.fillStyle = INK; g.beginPath(); g.moveTo(dx, -40); g.lineTo(dx + 60, -40); g.lineTo(dx + 56, -68); g.lineTo(dx + 4, -60); g.closePath(); g.fill(); g.fillStyle = D[2]; g.beginPath(); g.moveTo(dx + 2, -42); g.lineTo(dx + 58, -42); g.lineTo(dx + 54, -66); g.lineTo(dx + 5, -59); g.closePath(); g.fill(); for (let b = 0; b < 4; b++) { g.fillStyle = dimmed(b % 2 ? '#2A2A30' : '#3A3A44'); g.beginPath(); g.arc(dx + 12 + b * 12, -42, 8, Math.PI, 0); g.fill(); } }
    else { box(g, dx - 2, -44, 64, 5, INK); box(g, dx - 1, -43, 62, 3, D[1]); }
    signText(g, 'NO DUMPING', dx + 30, -14, tiny(dimmed('#F4F1E8')));
  }
  const cx = x + 170, C = DC('#F4F1E8');
  box(g, cx - 1, -48, 4, 30, dimmed('#3A3A40')); box(g, cx + 46, -48, 4, 30, dimmed('#3A3A40')); box(g, cx - 4, -52, 58, 6, INK); box(g, cx - 3, -51, 56, 4, dimmed('#2A6A4A'));
  box(g, cx - 2, -22, 56, 14, INK); box(g, cx - 1, -21, 54, 12, C[3]); box(g, cx - 1, -21, 54, 2, C[5]); signText(g, 'UBX STAFF', cx + 26, -13, tiny(dimmed('#1E3A8A')));
  box(g, cx + 6, -32, 22, 10, dimmed('#3A2A2A'));
  for (const wx of [cx + 8, cx + 44]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -6, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#7A7A84'); g.beginPath(); g.arc(wx, -6, 2.5, 0, Math.PI * 2); g.fill(); }
};
/** A run of chain-link fence with green privacy slats (x..x+w), CAST ONLY on it. */
const castFence = (g: Ctx, x: number, w: number, sign: boolean) => {
  const F = DC('#2E6A4A');
  box(g, x, -48, w, 46, F[2]); for (let k = 0; k < w; k += 3) box(g, x + k, -48, 1, 46, F[1]); box(g, x, -50, w, 2, dimmed('#A2AAB4'));
  for (let k = 0; k <= w; k += 50) { box(g, x + k - 1, -54, 4, 54, INK); box(g, x + k, -54, 2, 54, dimmed('#B2BAC4')); }
  if (sign) { box(g, x + w / 2 - 34, -38, 68, 16, INK); box(g, x + w / 2 - 33, -37, 66, 14, dimmed('#F4F1E8')); signText(g, 'CAST ONLY', x + w / 2, -27, small(dimmed('#B91C1C'))); }
};
/** HONK's dressing room: an old RV, a star taped on its door, a lawn chair and a cooler of SWILL LITE by it, the
 *  extension cord, the generator, the road cases, the butt can by a bench. */
const backstage = (g: Ctx, x: number) => {
  const R = DC('#E8DCC0'), Str = DC('#A0522D');
  // (the RV: boxy, its stripes, the windows' curtains drawn, the awning out)
  box(g, x - 1, -112, 222, 102, INK); box(g, x, -111, 220, 100, R[3]); box(g, x, -111, 220, 3, R[5]); box(g, x + 208, -111, 12, 100, R[2]);
  for (const [y, c2] of [[-60, Str[3]], [-54, DC('#D9A23A')[3]], [-48, Str[2]]] as const) box(g, x, y, 220, 4, c2);
  box(g, x + 180, -111, 40, 40, R[2]); box(g, x + 186, -104, 28, 22, dimmed('#3A4A5A')); box(g, x + 186, -104, 28, 3, dimmed('#7A8A9A'));
  for (const wx of [x + 20, x + 100]) { box(g, wx, -96, 40, 24, dimmed('#2A3240')); box(g, wx, -96, 40, 24, dimmed('#C8A86A')); for (let k = 0; k < 40; k += 5) box(g, wx + k, -96, 2, 24, dimmed('#A88A4A')); }
  box(g, x + 66, -96, 26, 84, INK); box(g, x + 67, -95, 24, 83, R[2]); box(g, x + 86, -56, 3, 3, dimmed('#C9CDD4'));
  g.fillStyle = dimmed('#FDE047'); g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 4 : 9; g.lineTo(x + 79 + Math.cos(a) * r, -80 + Math.sin(a) * r); } g.closePath(); g.fill();
  signText(g, 'HONK', x + 79, -64, tiny(dimmed('#1F2937')));
  g.fillStyle = dimmed('#2A6A8A'); g.beginPath(); g.moveTo(x + 10, -116); g.lineTo(x + 170, -116); g.lineTo(x + 176, -96); g.lineTo(x + 4, -96); g.closePath(); g.fill();
  for (let k = 0; k < 172; k += 12) box(g, x + 4 + k, -100, 6, 4, dimmed('#F4F1E8'));
  for (const wx of [x + 40, x + 170]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -10, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#7A7A84'); g.beginPath(); g.arc(wx, -10, 4, 0, Math.PI * 2); g.fill(); }
  // (the lawn chair, webbed; the cooler, SWILL LITE cans on it; the cord across to the generator)
  const lc = x + 236; box(g, lc, -26, 2, 26, dimmed('#C9CDD4')); box(g, lc + 18, -26, 2, 26, dimmed('#C9CDD4')); for (let k = 0; k < 5; k++) box(g, lc, -34 + k * 6, 20, 3, dimmed(k % 2 ? '#2A8A5A' : '#F4F1E8')); box(g, lc - 2, -16, 24, 2, dimmed('#C9CDD4'));
  box(g, lc + 30, -16, 24, 16, INK); box(g, lc + 31, -15, 22, 14, dimmed('#C83A3A')); box(g, lc + 31, -15, 22, 4, dimmed('#F4F1E8'));
  for (let k = 0; k < 3; k++) { box(g, lc + 33 + k * 7, -23, 5, 8, dimmed('#C8102E')); box(g, lc + 33 + k * 7, -20, 5, 2, dimmed('#F4F1E8')); }
  g.strokeStyle = dimmed('#F2C030'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 210, -30); g.quadraticCurveTo(x + 260, 4, x + 330, -6); g.stroke();
  const gx = x + 320, G = DC('#E8B424'); box(g, gx - 1, -34, 52, 34, INK); box(g, gx, -33, 50, 33, G[3]); box(g, gx, -33, 50, 3, G[5]); box(g, gx + 42, -33, 8, 33, G[2]); for (let k = 0; k < 5; k++) box(g, gx + 6, -26 + k * 4, 22, 2, G[1]); box(g, gx + 36, -44, 4, 12, dimmed('#3A3A40'));
  const C = DC('#2A2A30');
  for (const [cx, cw, ch] of [[x + 380, 44, 28], [x + 384, 36, 22]] as const) { box(g, cx - 1, -ch - 1 - (cw === 36 ? 28 : 0), cw + 2, ch + 1, INK); box(g, cx, -ch - (cw === 36 ? 28 : 0), cw, ch, C[3]); box(g, cx, -ch - (cw === 36 ? 28 : 0), cw, 2, C[5]); for (const k of [2, cw - 6]) box(g, cx + k, -ch - (cw === 36 ? 28 : 0), 4, ch, DR(STEEL)[3]); }
  signText(g, 'UBX AUDIO', x + 402, -12, tiny(dimmed('#F4F1E8')));
};

// ---------------------------------------------------------------------------------------------------------------
// The chunks

/** What's in each 400 px chunk (rx from the section's start): the pieces, painted once per hour. */
const paintChunk = (g: Ctx, i: number) => {
  const a = i * CHUNK, at = (rx: number) => rx - a, inside = (rx: number, w: number) => rx + w > a - 90 && rx < a + CHUNK + 90;
  // (oaks all along the rim (none in front of the backstage RV), then the pieces)
  for (let rx = -560; rx < 4500; rx += 150) {
    const s = hash(rx * 0.37);
    if ((rx > 900 && rx < 1100) || (rx > 2700 && rx < 3250) || s < 0.25) continue;
    const h = 110 + s * 90, r = 46 + hash(rx * 1.3) * 30;
    if (inside(rx - r * 1.2, r * 2.4)) oak(g, at(rx + hash(rx) * 40), h, r, rx, rx === 1240);
  }
  const put = (rx: number, w: number, paint: (x: number) => void) => { if (inside(rx, w)) paint(at(rx)); };
  put(-20, 150, x => restrooms(g, x));
  put(500, 200, x => lawnBack(g, x));
  put(800, 30, x => delayTower(g, x));
  put(920, 190, x => johns(g, x, 5));
  put(1320, 220, x => funnel(g, x));
  put(1640, 30, x => delayTower(g, x));
  put(1760, 190, x => billboard(g, x));
  put(2040, 240, x => dumpsters(g, x));
  put(2380, 340, x => castFence(g, x, 340, true));
  put(2740, 470, x => backstage(g, x));
  put(3260, 1200, x => castFence(g, x, 1200, false));
};

/** The rim, behind the bank: the chunks on screen at D_RIM, back to the eye `E`. */
export const drawRim = (c: Ctx, state: GameState, E: { x: number; y: number }) => {
  const tod = timeOfDay().key, f = fontReady() ? 'f' : 'n';
  const vis = (wx: number) => E.x + (wx - E.x) * D_RIM;
  for (let i = -2; i < 12; i++) {
    const wx = X(i * CHUNK);
    const sa = vis(wx - 120), sb = vis(wx + CHUNK + 120);
    if (sb < (state.view?.x ?? state.camera.x) - 40 || sa > (state.view ? state.view.x + state.view.w : state.camera.x + CANVAS_WIDTH) + 40) continue;
    c.save(); c.translate(E.x, E.y); c.scale(D_RIM, D_RIM); c.translate(-E.x, -E.y);
    c.translate(wx, BANK_Y);
    stamp(c, `ct-am-rim-${i}-${tod}-${f}`, -60, -TALL, CHUNK + 120, TALL + 6, g => paintChunk(g, i));
    c.restore();
  }
};
