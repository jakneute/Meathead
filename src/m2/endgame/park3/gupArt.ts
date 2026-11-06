// GUPPLAX, drawn (the wave pool's boss: full detail even in the first pass, like the other water park bosses). An
// alien lifeguard, Zorblax and Zarblax's brother: a bloated pear of translucent green flesh in steps (the light through
// it, the guts dimly showing), six nipples in two rows down his gut, rolls, a big head too heavy for the neck, four
// eyes (two on veiny stalks waving, two sunk in the face), gills on the neck flapping, a fat nose striped with zinc,
// buck teeth with gaps, a whistle on a lanyard he's always got in his mouth; red lifeguard trunks two sizes small
// (GUARD across the seat); flabby arms, webbed hands; stubby legs, webbed feet. Every elbow and knee from art/limb.ts.
//
// Origin: his waist (the trunks' waistband, middle), facing right; in the water that's at the surface. Poses below
// (SpriteKind): stamped per pose and frame.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { mix } from '../../intro/art/kit';
import { checker } from '../../../m1/game/render/pixelArt';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const INK = '#06100A';
/** His flesh, darkest first (translucent green: the light comes through at the edges). */
export const FLESH = ['#0E3A1E', '#1A5A2C', '#2A7E3C', '#3EA24E', '#62C46A', '#A6EAA0'];
const GUT = ['#3A5A1E', '#5A7A2A'];
const TRUNK = ['#5A0A0A', '#8A1414', '#C02020', '#E04A3A', '#F68A6A'];
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0, a0 = 0, a1 = Math.PI * 2) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, a0, a1); c.fill(); };
const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: P[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) c.lineTo(q[0], q[1]); c.stroke(); };
/** A blob in steps: inked, its body, lit up top-left, shaded under. */
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, L: string[], rot = 0) => {
  ell(c, x, y, rx + 2, ry + 2, INK, rot);
  ell(c, x, y, rx, ry, L[2], rot);
  ell(c, x + rx * 0.08, y + ry * 0.18, rx * 0.86, ry * 0.78, L[1], rot);
  ell(c, x - rx * 0.06, y - ry * 0.06, rx * 0.8, ry * 0.72, L[2], rot);
  ell(c, x - rx * 0.3, y - ry * 0.36, rx * 0.42, ry * 0.3, L[3], rot);
  ell(c, x - rx * 0.4, y - ry * 0.48, rx * 0.16, ry * 0.12, L[5], rot);
};

export type GupPose = 'idle' | 'swim' | 'whistle' | 'blow' | 'hork' | 'spit' | 'crouch' | 'leap' | 'flop' | 'dive' | 'breach' | 'hurt' | 'talk' | 'chair' | 'dead' | 'puffed' | 'skin';
export const GUP_POSES: GupPose[] = ['idle', 'swim', 'whistle', 'blow', 'hork', 'spit', 'crouch', 'leap', 'flop', 'dive', 'breach', 'hurt', 'talk', 'chair', 'dead', 'puffed', 'skin'];
export interface GupLook { pose: GupPose; q: number; mouth?: boolean; crushed?: boolean }

export const paintGup = (c: Ctx, L: GupLook, face: 1 | -1 = 1) => {
  const { pose, q } = L, ph = (q / 8) * Math.PI * 2;
  if (pose === 'skin') return paintSkin(c, q);
  if (pose === 'dead' || pose === 'puffed') return paintDead(c, pose === 'puffed', q);
  const puff = pose === 'blow' ? 1 : pose === 'whistle' ? 0.6 : 0;
  // ---- the skeleton (where the head, the hands and the feet go)
  let headY = -80, headX = 6, bodyTilt = 0, sq = 1;
  let hN: P = [46, -12], hF: P = [-40, -10], fN: P = [20, 62], fF: P = [-18, 62];
  switch (pose) {
    case 'swim': hN = [54, -4 + Math.sin(ph) * 14]; hF = [-48, -4 - Math.sin(ph) * 14]; fN = [24, 58 + Math.sin(ph) * 6]; fF = [-22, 58 - Math.sin(ph) * 6]; break;
    case 'whistle': hN = [30, -86]; hF = [-44, -20]; headY = -84; break;
    case 'blow': hN = [28, -88]; hF = [-56, -60]; headY = -86; break;
    case 'hork': hN = [40, -40]; hF = [-34, -8]; headY = -74; headX = 0; bodyTilt = -0.08; break;
    case 'spit': hN = [52, -26]; hF = [-46, -30]; headY = -82; headX = 14; bodyTilt = 0.1; break;
    case 'crouch': hN = [40, -96]; hF = [-40, -96]; headY = -70; sq = 0.86; fN = [26, 44]; fF = [-24, 44]; break;
    case 'leap': hN = [70, -60]; hF = [-70, -60]; fN = [40, 52]; fF = [-38, 52]; break;
    case 'flop': hN = [74, -8]; hF = [-74, -8]; fN = [50, 30]; fF = [-48, 30]; headY = -74; sq = 0.82; break;
    case 'dive': hN = [60, -110]; hF = [44, -116]; headY = -60; headX = 30; bodyTilt = 0.55; break;
    case 'breach': hN = [56, -120]; hF = [-40, -124]; headY = -88; break;
    case 'hurt': hN = [20, -70]; hF = [-50, -40]; headX = -6; bodyTilt = -0.14; break;
    case 'chair': hN = [44, -20]; hF = [-38, -24]; fN = [36, 40]; fF = [16, 44]; break;
    default: hN = [46, -12 + Math.sin(ph) * 3]; hF = [-40, -10 - Math.sin(ph) * 3]; break;
  }
  c.save(); c.rotate(bodyTilt); c.scale(1, sq);
  const sN: P = [34, -50], sF: P = [-30, -50];
  // ---- the far arm and leg (darker)
  const arm = (s: P, h: P, near: boolean) => {
    const e = elbow(s[0], s[1], h[0], h[1], 28, 26, 1), end = reachTo(s[0], s[1], h[0], h[1], 28, 26);
    const col = near ? FLESH[2] : FLESH[1];
    line(c, [s, e, end], 17, INK); line(c, [s, e, end], 14, col); line(c, [[s[0] - 2, s[1] - 2], [e[0] - 2, e[1] - 2]], 4, near ? FLESH[3] : FLESH[2]);
    // (the flab hanging off the upper arm)
    ell(c, (s[0] + e[0]) / 2, (s[1] + e[1]) / 2 + 7, 8, 6, col);
    // (the hand: webbed, four fat fingers)
    ell(c, end[0], end[1], 9, 8, INK); ell(c, end[0], end[1], 7.5, 6.5, near ? FLESH[3] : FLESH[2]);
    for (let k = 0; k < 4; k++) { const a = -0.9 + k * 0.6; ell(c, end[0] + Math.cos(a) * 8, end[1] + Math.sin(a) * 8, 3, 2.4, near ? FLESH[3] : FLESH[2], a); }
    c.globalAlpha = 0.5; ell(c, end[0] + 5, end[1], 6, 5, FLESH[4]); c.globalAlpha = 1;
    return end;
  };
  const leg = (hip: P, f: P, near: boolean) => {
    const k = knee(hip[0], hip[1], f[0], f[1], 26, 24, 1), end = reachTo(hip[0], hip[1], f[0], f[1], 26, 24);
    const col = near ? FLESH[2] : FLESH[1];
    line(c, [hip, k, end], 19, INK); line(c, [hip, k, end], 16, col);
    // (the foot: webbed, flat, splayed)
    c.fillStyle = INK; c.beginPath(); c.moveTo(end[0] - 8, end[1] - 4); c.lineTo(end[0] + 22, end[1] + 2); c.lineTo(end[0] + 20, end[1] + 8); c.lineTo(end[0] - 8, end[1] + 6); c.closePath(); c.fill();
    c.fillStyle = near ? FLESH[3] : FLESH[2]; c.beginPath(); c.moveTo(end[0] - 6, end[1] - 2); c.lineTo(end[0] + 19, end[1] + 3); c.lineTo(end[0] + 17, end[1] + 6); c.lineTo(end[0] - 6, end[1] + 4); c.closePath(); c.fill();
  };
  arm(sF, hF, false);
  leg([-18, 14], fF, false);
  // ---- the body: the pear of him, his rolls, the guts dimly through, the six nipples, a navel
  blob(c, 0, -14, 54, 50, FLESH);
  c.globalAlpha = 0.35; ell(c, 6, -8, 26, 20, GUT[0]); ell(c, -8, 4, 16, 10, GUT[1]); line(c, [[-14, -2], [4, 8], [16, -4], [8, -16]], 4, GUT[1]); c.globalAlpha = 1;
  for (const y of [-34, 2]) { c.strokeStyle = FLESH[1]; c.lineWidth = 2; c.beginPath(); c.ellipse(4, y, 44, 6, 0, 0.2, Math.PI - 0.2); c.stroke(); }
  for (let r = 0; r < 3; r++) for (const sx of [-1, 1]) { const nx = 10 + sx * 18 - r * 2, ny = -38 + r * 14; ell(c, nx, ny, 3.6, 3, INK); ell(c, nx, ny, 2.6, 2.2, '#7A4A6A'); rect(c, nx - 1, ny - 1, 1, 1, '#D8A8C8'); }
  ell(c, 8, 4, 3, 2, INK);
  checker(c, -40, -10, 18, 20, FLESH[1], 0, 2);
  // ---- the trunks: two sizes small, red, a white stripe down the side, GUARD across the seat
  c.fillStyle = INK; c.beginPath(); c.moveTo(-46, -4); c.lineTo(48, -4); c.lineTo(42, 22); c.lineTo(8, 26); c.lineTo(-6, 26); c.lineTo(-40, 22); c.closePath(); c.fill();
  c.fillStyle = TRUNK[2]; c.beginPath(); c.moveTo(-44, -2); c.lineTo(46, -2); c.lineTo(40, 20); c.lineTo(8, 24); c.lineTo(-6, 24); c.lineTo(-38, 20); c.closePath(); c.fill();
  rect(c, -44, -2, 90, 4, TRUNK[3]); rect(c, -44, -2, 90, 1, TRUNK[4]); rect(c, -30, 10, 70, 4, TRUNK[1]);
  rect(c, 26, 0, 4, 20, '#F1EFEA');
  // (the letters the right way round whichever way he faces)
  c.save(); c.translate(-2, 10); c.scale(face, 1); c.font = '7px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#F1EFEA'; c.fillText('GUARD', 0, 4); c.textAlign = 'left'; c.restore();
  // (his gut hanging over the waistband)
  c.fillStyle = FLESH[2]; c.beginPath(); c.ellipse(4, -6, 46, 9, 0, Math.PI, 0); c.fill();
  leg([16, 14], fN, true);
  // ---- the head: too big, on a fat neck with gills
  const hx = headX, hy = headY;
  ell(c, hx - 4, hy + 30, 26, 16, INK); ell(c, hx - 4, hy + 30, 24, 14, FLESH[2]);
  for (let k = 0; k < 3; k++) { const fl = Math.sin(ph * 2 + k) * 1.5; c.strokeStyle = FLESH[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 22 + k * 5, hy + 22 + fl); c.lineTo(hx - 18 + k * 5, hy + 38 + fl); c.stroke(); c.strokeStyle = '#C04A6A'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 21 + k * 5, hy + 24 + fl); c.lineTo(hx - 17 + k * 5, hy + 36 + fl); c.stroke(); }
  blob(c, hx, hy, 44 + puff * 6, 36 + puff * 3, FLESH);
  // (the double chin sagging off it; sweat beading; a wart with a hair in it)
  ell(c, hx + 8, hy + 30, 30, 10, INK); ell(c, hx + 8, hy + 29, 28, 8, FLESH[2]); ell(c, hx + 2, hy + 27, 18, 4, FLESH[3]);
  for (const [sx, sy] of [[-20, -18], [-30, 4], [14, -26], [-6, -30]] as P[]) { ell(c, hx + sx, hy + sy, 2.4, 3, '#E0FFE8'); rect(c, hx + sx - 1, hy + sy - 2, 1, 1, '#FFFFFF'); }
  ell(c, hx - 24, hy - 8, 3.5, 3, FLESH[1]); line(c, [[hx - 24, hy - 10], [hx - 27, hy - 17]], 1, INK);
  // (the cheeks, ballooned when he blows)
  if (puff > 0) { blob(c, hx + 24, hy + 10, 14 + puff * 10, 11 + puff * 8, FLESH); }
  // (the eyestalks: two, veiny, waving; the eyes on them yellow, slit-pupiled, bloodshot)
  for (const [k, sx] of [[0, -8], [1, 12]] as const) {
    const wave = Math.sin(ph + k * 2) * 6 + (pose === 'hurt' ? -8 : 0), tip: P = [hx + sx + wave, hy - 52 - k * 6 + (pose === 'blow' ? -8 : 0)];
    line(c, [[hx + sx, hy - 26], [hx + sx + wave * 0.5, hy - 40], tip], 8, INK); line(c, [[hx + sx, hy - 26], [hx + sx + wave * 0.5, hy - 40], tip], 5, FLESH[2]);
    line(c, [[hx + sx + 1, hy - 28], [tip[0] + 1, tip[1] + 6]], 1, '#C04A6A');
    ell(c, tip[0], tip[1], 10, 9, INK); ell(c, tip[0], tip[1], 8.5, 7.5, '#F4E86A'); ell(c, tip[0] - 2, tip[1] - 2, 3, 2, '#FFFBD0');
    line(c, [[tip[0] - 7, tip[1] + 2], [tip[0] - 3, tip[1] + 1]], 1, '#D03030'); line(c, [[tip[0] + 6, tip[1] - 3], [tip[0] + 3, tip[1] - 1]], 1, '#D03030');
    rect(c, tip[0] + 1, tip[1] - 5, 2, 9, INK);
  }
  // (the two sunk in the face: little, mean, pink-rimmed)
  for (const ex of [10, 26]) { ell(c, hx + ex, hy - 4, 6, 5, INK); ell(c, hx + ex, hy - 4, 4.5, 3.5, '#F4E86A'); rect(c, hx + ex, hy - 6, 1.5, 4, INK); c.strokeStyle = '#D06080'; c.lineWidth = 1; c.beginPath(); c.ellipse(hx + ex, hy - 4, 6, 5, 0, 0, Math.PI * 2); c.stroke(); }
  // (the nose: fat, a bulb, striped with zinc)
  ell(c, hx + 36, hy + 4, 11, 9, INK); ell(c, hx + 36, hy + 4, 9.5, 7.5, FLESH[3]); rect(c, hx + 30, hy, 13, 4, '#F8FAFC'); rect(c, hx + 31, hy + 4, 11, 2, '#E2E8F0');
  ell(c, hx + 40, hy + 9, 2, 1.5, INK);
  // (the mouth: buck teeth with gaps, the whistle in it (or not: open, spitting, talking), drool)
  const open = pose === 'spit' || pose === 'breach' ? 14 : pose === 'hork' ? 4 : pose === 'hurt' ? 9 : L.mouth || pose === 'talk' ? 7 : 2;
  const mx = hx + 22, my = hy + 18;
  ell(c, mx, my + open / 2, 18, 4 + open / 2, INK);
  if (open > 3) { ell(c, mx, my + open / 2, 16, 2 + open / 2, '#4A0A1A'); ell(c, mx + 2, my + open - 2, 8, 3, '#C04A5A'); }
  for (const tx of [-8, -1, 8]) rect(c, mx + tx, my - 1, 5, 6, '#F0E6B8');
  rect(c, mx - 8, my + 4, 5, 1, '#A89A60'); rect(c, mx + 8, my + 4, 5, 1, '#A89A60');
  if (pose === 'breach') { for (let k = 0; k < 6; k++) rect(c, mx - 12 + k * 5, my + open - 4, 3, 5, '#F0E6B8'); }
  // (the throat's bulge, glowing, in the hork)
  if (pose === 'hork') { ell(c, hx - 2, hy + 32, 14, 10, INK); ell(c, hx - 2, hy + 32, 12, 8, '#8AF040'); ell(c, hx - 5, hy + 29, 4, 3, '#E0FFB0'); }
  // (the whistle: on its lanyard round the neck; in the mouth (whistle, blow, idle, swim, chair))
  const inMouth = pose === 'whistle' || pose === 'blow' || pose === 'idle' || pose === 'swim' || pose === 'chair' || pose === 'crouch';
  const wx = inMouth ? mx + 18 : hx + 16, wy = inMouth ? my + 2 : hy + 52;
  line(c, [[hx - 18, hy + 26], [hx, hy + 48], [wx - 4, wy]], 2, '#F8FAFC');
  rect(c, wx - 6, wy - 4, 14, 8, INK); rect(c, wx - 5, wy - 3, 12, 6, '#E8C020'); rect(c, wx - 5, wy - 3, 12, 2, '#FFF2A0'); rect(c, wx + 4, wy - 2, 2, 2, INK);
  if (pose !== 'blow' && pose !== 'whistle') { rect(c, mx - 12, my + 4 + open, 2, 6 + (q % 4), '#B8F0A0'); }
  arm(sN, hN, true);
  c.restore();
};
/** Dead: belly up on the water, X'd eyes on their stalks drooping, tongue out; `puffed`: swollen up round, purple
 *  blotches, the whistle stuck in his throat. */
const paintDead = (c: Ctx, puffed: boolean, q: number) => {
  const k = puffed ? 1.25 : 1;
  blob(c, 0, -10, 64 * k, 34 * k, puffed ? FLESH.map(col => mix(col, '#7A3A8A', 0.3)) : FLESH);
  if (puffed) for (let i = 0; i < 6; i++) ell(c, -40 + i * 16, -14 + (i % 2) * 10, 6, 5, '#6A2A7A');
  for (let r = 0; r < 3; r++) ell(c, -20 + r * 18, -30 * k, 3, 2.4, '#7A4A6A');
  // (the trunks up top, the head off to the side, upside down)
  rect(c, -10, -44 * k, 34, 12, INK); rect(c, -9, -43 * k, 32, 10, TRUNK[2]);
  blob(c, 66 * k, -6, 30, 24, FLESH);
  for (const s of [-1, 1]) { line(c, [[60 * k, -20], [60 * k + s * 14, -40 - (q % 3)], [60 * k + s * 20, -44]], 5, INK); ell(c, 60 * k + s * 20, -46, 7, 6, '#F4E86A'); line(c, [[60 * k + s * 20 - 4, -50], [60 * k + s * 20 + 4, -42]], 2, INK); line(c, [[60 * k + s * 20 + 4, -50], [60 * k + s * 20 - 4, -42]], 2, INK); }
  ell(c, 80 * k, 8, 8, 5, '#C04A5A');
  if (puffed) { rect(c, 74 * k, -4, 12, 8, INK); rect(c, 75 * k, -3, 10, 6, '#E8C020'); }
  // (arms and legs stuck up stiff)
  for (const [x, y] of [[-40, -38], [-10, -46], [24, -44], [44, -36]] as P[]) { line(c, [[x * k, y * 0.6], [x * k + 4, y * k - 10]], 12, INK); line(c, [[x * k, y * 0.6], [x * k + 4, y * k - 10]], 9, FLESH[2]); }
};
/** What's left once he's let all his air out: a limp skin flat on the water, the trunks, the whistle. */
const paintSkin = (c: Ctx, q: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 70, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = FLESH[2]; c.beginPath(); c.ellipse(0, -1, 68, 8, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 5; i++) ell(c, -50 + i * 25, -1 + (i % 2) * 2, 10, 3, FLESH[1]);
  rect(c, -12, -6, 30, 8, TRUNK[2]);
  for (const s of [-1, 1]) line(c, [[54, -4], [60 + s * 4, -10 - (q % 2)], [64 + s * 8, -6]], 3, FLESH[1]);
  rect(c, 66, -8, 10, 6, '#E8C020');
};

const BOX = { x: -150, y: -200, w: 300, h: 290 };
/** Him, at (x, y: his waist), facing. Stamped per pose and frame; `alpha` (his breather's flicker). */
export const drawGup = (c: Ctx, x: number, y: number, face: 1 | -1, L: GupLook, f: number, alpha = 1) => {
  const q = L.pose === 'swim' ? Math.floor(f / 6) % 8 : L.pose === 'idle' || L.pose === 'talk' || L.pose === 'chair' ? Math.floor(f / 10) % 8 : L.pose === 'dead' || L.pose === 'skin' ? Math.floor(f / 16) % 3 : 0;
  c.save(); c.translate(Math.round(x), Math.round(y));
  if (alpha < 1) c.globalAlpha = alpha;
  stamp(c, `wp3-gup-${L.pose}-${q}-${L.mouth ? 1 : 0}-${face}`, BOX.x, BOX.y, BOX.w, BOX.h, g => { g.scale(face, 1); paintGup(g, { ...L, q }, face); });
  c.restore();
};
export const GUP_W = 110, GUP_H = 150;
