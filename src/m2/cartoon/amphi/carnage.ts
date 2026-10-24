// What the stunt cars leave of DAD GUY's TV family, and of him: a pre-drawn set piece of chaos for each of them,
// painted the once and stamped down from then on (only the sparks, the twitching, the fire and the smoke live).
//
// Each animatronic, under its wreck: torn in two (the half pinned under the car, the half flung out past it), the torn
// latex and the costume ragged at the tear, the steel spine and the servos out of it, the wiring spilling, a hydraulic
// hose pumping red; skid marks in to it, the oil and the hydraulic fluid splashed across the deck, the glass, the
// gears and the screws. And each its own: MOM's casserole all over, her pearls everywhere, her perm off, her face
// peeled back to the steel skull; THE BOY's base on its back, his head off on its spring, his face mask lying there
// like a dropped Halloween mask, his circuit board in bits, his beer foaming out; SIS squashed flat cross-legged, her
// arm off (steel fingers still flexing), her ponytail wig, her retainer, a sneaker; GRAMPS's recliner snapped in two,
// the springs and the foam out of it, the newspaper everywhere, his glasses cracked, his toupee, his dentures chattering
// on the floor by themselves.
//
// DAD GUY's own (the weakness): flesh, not a robot: a lake of blood out from under him, the spray across the deck,
// his guts squeezed out both sides (a can of SWILL LITE in them), an eyeball popped out on its stalk, his teeth all over,
// the TV dinner's peas and corn in it all.

import { stamp } from '../../../m1/game/render/stamp';
import { type Ctx, type Ramp, rampOf, shape, ell, px, line, limb, fill, sparks, dith } from './paint';
import { drawMom, drawGramps, drawSis, drawBoy, type Anim } from './family';
import { can } from './dad';
import { mix } from '../kit';

export type Member = 'mom' | 'boy' | 'sis' | 'gramps';
const OFF: Anim = { mode: 'off', f: 0, talking: false };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const WAX: Ramp = ['#FFF0E2', '#F4CFB2', '#DCAC8C', '#B8876C', '#5E3A2A'];
const STEEL: Ramp = ['#E4E8EE', '#AEB5BF', '#808893', '#5A616B', '#22262C'];
const OIL = '#0C0A09', HYD = ['#4A0508', '#7F1D1D', '#B91C1C', '#EF4444'];
const WIRES = ['#DC2626', '#FACC15', '#1C1C1C', '#2563EB', '#16A34A'];

const drawWho = (c: Ctx, who: Member) => {
  if (who === 'mom') drawMom(c, 0, 0, OFF);
  else if (who === 'gramps') drawGramps(c, 0, 0, OFF);
  else if (who === 'sis') drawSis(c, 0, 0, OFF);
  else drawBoy(c, 0, 0, OFF, 0, false);
};
/** A piece of one of them: drawn about (ox, oy) turned `rot`, only the band y0..y1 of it (its own upright units, its
 *  feet at 0); `more` drawn on in the same frame, unclipped (the tear, the guts). */
const piece = (c: Ctx, who: Member, ox: number, oy: number, rot: number, y0: number, y1: number, more?: () => void, sx = 1, sy = 1) => {
  c.save(); c.translate(ox, oy); c.rotate(rot); c.scale(sx, sy);
  c.save(); c.beginPath(); c.rect(-90, y0, 180, y1 - y0); c.clip(); drawWho(c, who); c.restore();
  more?.();
  c.restore();
};

/** The rag of the costume and the latex at a tear across y (half-width w), its tatters hanging off toward `out`. */
const tear = (c: Ctx, y: number, w: number, col: string, out: 1 | -1, seed: number) => {
  const n = 7, pts: number[] = [-w, y - out * 2];
  for (let k = 0; k <= n; k++) pts.push(-w + (k / n) * w * 2, y + out * (1.5 + hash(seed + k) * 4.5) * (k % 2 ? 1 : 0.4));
  pts.push(w, y - out * 2);
  fill(c, mix(col, '#1A1028', 0.6), () => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1] + out * 0.8); c.closePath(); });
  fill(c, col, () => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); });
  // (a strip of the latex skin under it, peeled back and curling)
  fill(c, WAX[1], () => { c.moveTo(-w * 0.5, y); c.quadraticCurveTo(-w * 0.2, y + out * 7, w * 0.1, y + out * 4); c.lineTo(w * 0.3, y); c.closePath(); });
  line(c, [-w * 0.5, y, -w * 0.2, y + out * 5.4, w * 0.1, y + out * 4], 0.5, WAX[3]);
};
/** What comes out of a tear: the steel spine, a vertebra or two, the wires spilling, the hydraulic hose bleeding red. */
const innards = (c: Ctx, y: number, out: 1 | -1, seed: number, len = 12) => {
  shape(c, () => c.rect(-1.6, Math.min(y, y + out * len), 3.2, len), STEEL, -1.6, 1.6, 0.6);
  for (let k = 1; k < 3; k++) shape(c, () => c.rect(-3.2, y + out * k * len / 3 - 1, 6.4, 2), STEEL, -3.2, 3.2, 0.5);
  ell(c, 0, y + out * len, 2.2, 1.4, STEEL[0]);
  for (let k = 0; k < 5; k++) {
    const sx = -4 + k * 2, ex = sx + (hash(seed + k * 3) - 0.5) * 22, ey = y + out * (6 + hash(seed + k) * 14);
    c.strokeStyle = WIRES[k]; c.lineWidth = 0.9; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, y); c.quadraticCurveTo(sx + (ex - sx) * 0.2, ey, ex, ey - out * 2); c.stroke();
    px(c, ex - 0.6, ey - out * 2 - 0.6, 1.2, 1.2, '#E8C060');
  }
  line(c, [3, y, 9, y + out * 6, 7, y + out * 13], 2.6, '#1C1C1C'); line(c, [3, y, 9, y + out * 6, 7, y + out * 13], 1, '#3A3A44');
  ell(c, 7, y + out * 14, 1.6, 1.6, HYD[2]);
};
/** The servo pulled out on its wires. */
const servoOut = (c: Ctx, x: number, y: number) => {
  shape(c, () => c.rect(x - 4, y - 3, 8, 6), STEEL, x - 4, x + 4, 0.6); px(c, x - 3, y - 1, 4.4, 1.4, '#E8E4D8'); px(c, x - 3, y - 0.6, 2, 0.6, '#C83A3A');
  ell(c, x + 2, y - 3.4, 1.4, 1, '#F4F4F0');
};
const gear = (c: Ctx, x: number, y: number, r: number, col = STEEL[2]) => {
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; px(c, x + Math.cos(a) * r - 0.9, y + Math.sin(a) * r * 0.5 - 0.6, 1.8, 1.2, col); }
  ell(c, x, y, r, r * 0.5, col); ell(c, x - r * 0.2, y - r * 0.1, r * 0.6, r * 0.28, STEEL[1]); ell(c, x, y, r * 0.3, r * 0.15, STEEL[4]);
};
const screw = (c: Ctx, x: number, y: number, rot: number) => { c.save(); c.translate(x, y); c.rotate(rot); px(c, -2, -0.5, 4, 1, STEEL[2]); px(c, -2.6, -1, 1, 2, STEEL[1]); for (let k = 0; k < 3; k++) px(c, -1 + k * 1.2, -0.5, 0.4, 1, STEEL[4]); c.restore(); };
const spring = (c: Ctx, x0: number, y0: number, x1: number, y1: number, n = 8, w = 3) => {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, pts = [x0, y0];
  for (let k = 1; k < n; k++) { const u = k / n, s = k % 2 ? w : -w; pts.push(x0 + dx * u + nx * s, y0 + dy * u + ny * s); }
  pts.push(x1, y1);
  line(c, pts, 1.6, STEEL[4]); line(c, pts, 0.8, STEEL[1]);
};
const shard = (c: Ctx, x: number, y: number, s: number, seed: number) => {
  fill(c, hash(seed) < 0.5 ? '#BAE6FD' : '#E0F2FE', () => { c.moveTo(x, y); c.lineTo(x + s * (0.6 + hash(seed + 1)), y - s * 0.8); c.lineTo(x + s * 1.4, y + s * 0.2); c.closePath(); });
  px(c, x + s * 0.5, y - s * 0.3, 0.8, 0.6, '#FFFFFF');
};

/** The deck under it all: the skid marks in, the oil, the hydraulic fluid, the glass, the screws and gears. `d` the way
 *  the flung half went (the car came in from the other side). */
const deck = (c: Ctx, d: 1 | -1, seed: number) => {
  // (the skid marks: two black streaks in from the car's side, tread in them, dithered at the edges)
  for (const [y, w] of [[3, 3], [8, 3.6]] as const) {
    const a = -d * 172, b = -d * 30, lo = Math.min(a, b), hi = Math.max(a, b);
    px(c, lo, y - 0.6, hi - lo, 0.6, dith(c, '#1C1917')); px(c, lo, y, hi - lo, w, '#1C1917'); px(c, lo, y + w, hi - lo, 0.6, dith(c, '#1C1917'));
    for (let x = lo + 2; x < hi; x += 5) px(c, x, y + 0.8, 2, w - 1.6, '#2E2A27');
    // (fading in where the brakes went on)
    px(c, d > 0 ? lo : hi - 26, y - 0.6, 26, w + 1.2, dith(c, '#57524F'));
  }
  // (the oil: a black pool, its sheen, a rainbow in it)
  ell(c, -d * 70, 4, 44, 5, OIL); ell(c, -d * 74, 3.4, 30, 3, '#1C1917'); px(c, -d * 80 - 8, 3, 10, 0.8, '#7C3AED'); px(c, -d * 70, 3, 8, 0.8, '#0EA5E9'); px(c, -d * 62, 3.4, 6, 0.6, '#EAB308');
  // (the hydraulic fluid: red, splashed out the way the half went)
  ell(c, d * 60, 5, 36, 4, HYD[0]); ell(c, d * 58, 4.6, 28, 2.8, HYD[1]); px(c, d * 50 - 6, 3.6, 12, 0.8, HYD[3]);
  for (let k = 0; k < 14; k++) { const sx = d * (40 + hash(seed + k) * 120), sy = 2 + hash(seed + k * 2) * 8, r = 1 + hash(seed + k * 3) * 2.4; ell(c, sx, sy, r * 1.6, r * 0.6, k % 3 ? HYD[1] : HYD[2]); }
  // (the glass, the screws, the gears, a hubcap, a length of chrome trim)
  for (let k = 0; k < 18; k++) shard(c, -160 + hash(seed * 3 + k) * 320, 2 + hash(seed + k * 5) * 9, 2 + hash(k) * 2.4, seed + k);
  for (let k = 0; k < 6; k++) screw(c, -140 + hash(seed * 7 + k) * 280, 4 + hash(seed + k * 9) * 6, hash(k * 3) * 3);
  gear(c, d * 128, 8, 5); gear(c, -d * 134, 6, 3.4); gear(c, d * 96, 10, 2.6, STEEL[1]);
  ell(c, -d * 150, 7, 7, 3, '#2E333B'); ell(c, -d * 150, 6.4, 6, 2.4, '#AEB5BF'); ell(c, -d * 151, 6, 3.4, 1.2, '#E2E6EC'); ell(c, -d * 150, 6.4, 1.4, 0.6, '#2E333B');
  c.save(); c.translate(d * 150, 10); c.rotate(-d * 0.12); px(c, -12, -1, 24, 2.4, '#2E333B'); px(c, -11.4, -0.6, 22.8, 0.8, '#FFFFFF'); px(c, -11.4, 0.2, 22.8, 1, '#AEB5BF'); c.restore();
};
/** A small fire on the oil (the base: the live flames go over it): a scorch. */
const scorch = (c: Ctx, x: number) => { ell(c, x, 3, 16, 3, dith(c, '#1C1917')); ell(c, x, 3, 10, 2, '#1C1917'); };

/** The glass eye out on the deck, staring. */
const glassEye = (c: Ctx, x: number, y: number, r = 3.4) => { ell(c, x, y, r + 0.6, r + 0.6, '#5E3A2A'); ell(c, x, y, r, r, '#FBFBF8'); ell(c, x + r * 0.3, y, r * 0.5, r * 0.5, '#2A4A6A'); px(c, x + r * 0.2, y - r * 0.2, 1, 1, '#000000'); px(c, x - r * 0.4, y - r * 0.5, 1, 1, '#FFFFFF'); line(c, [x - r, y, x - r - 4, y + 1, x - r - 7, y - 1], 0.6, '#C83A3A'); };
/** A wig off on the deck (the mesh cap under it showing). */
const wig = (c: Ctx, x: number, y: number, col: string, kind: 'perm' | 'pony' | 'toupee') => {
  const R = rampOf(col);
  if (kind === 'perm') { for (let k = 0; k < 9; k++) shape(c, () => c.ellipse(x - 12 + k * 3, y - 4 - (k % 3) * 2, 5, 4, 0, 0, Math.PI * 2), R, x - 18, x + 18, 0.6); }
  else if (kind === 'toupee') { shape(c, () => c.ellipse(x, y - 2, 10, 3.4, 0, 0, Math.PI * 2), R, x - 10, x + 10, 0.6); for (let k = 0; k < 6; k++) line(c, [x - 8 + k * 3, y - 3, x - 6 + k * 3, y - 5], 0.6, R[0]); }
  else { shape(c, () => c.ellipse(x, y - 3, 9, 4, 0, 0, Math.PI * 2), R, x - 9, x + 9, 0.6); limb(c, x + 7, y - 3, 3.4, x + 22, y - 1, 2.2, R); ell(c, x + 9, y - 3, 2.4, 2, '#EC4899'); }
  // (the mesh cap and the tape under its edge)
  px(c, x - 6, y - 1.6, 12, 1.6, '#D8CDB8'); for (let k = 0; k < 6; k++) px(c, x - 5.6 + k * 2, y - 1.6, 0.6, 1.6, '#A89C88');
};

// ---------------------------------------------------------------------------------------------------------------
// The four, each laid out about the middle of its wreck (x 0, the deck at 0); `d` the way the flung half went

const paintMom = (c: Ctx, d: 1 | -1) => {
  deck(c, d, 11);
  scorch(c, -d * 70);
  // (the casserole: the dish in bits, the sauce and the cheese all over, a noodle on the oil)
  ell(c, -d * 20, 9, 34, 4, '#7A2A14'); ell(c, -d * 22, 8.4, 26, 3, '#C24A2A'); for (let k = 0; k < 9; k++) ell(c, -d * (6 + k * 6), 7 + (k % 3), 3, 1.2, '#F2C94C');
  for (let k = 0; k < 5; k++) line(c, [-d * (10 + k * 7), 8, -d * (14 + k * 7), 5 - (k % 2) * 2, -d * (18 + k * 7), 8], 1, '#F7D774');
  for (let k = 0; k < 4; k++) { const sx = -d * (40 + k * 9), sy = 9 + (k % 2) * 2; fill(c, '#F2E6D0', () => { c.moveTo(sx, sy); c.lineTo(sx + 5, sy - 3); c.lineTo(sx + 7, sy + 1); c.closePath(); }); px(c, sx + 1, sy - 0.6, 4, 0.6, '#A89268'); }
  // (her legs and skirt out from under the car, the far side: the torn top of the skirt toward the wreck)
  piece(c, 'mom', -d * 128, -14, d * Math.PI / 2, -40, 4, () => { tear(c, -40, 16, '#7C3A6A', -1, 3); innards(c, -40, -1, 4, 10); });
  // (her top half flung past it: the sweater torn off at the waist, the guts out of it; her face peeled back)
  const ox = d * 72, oy = -16, rot = d * (Math.PI / 2 + 0.1);
  piece(c, 'mom', ox, oy, rot, -120, -37, () => {
    tear(c, -37, 15, '#F472B6', 1, 7); innards(c, -37, 1, 8, 14); servoOut(c, -9, -24);
    // (the latex peeled off half her face: the steel skull under it, the eye socket, its eye out on a spring)
    fill(c, STEEL[2], () => { c.moveTo(-1, -86); c.lineTo(7, -84); c.lineTo(8, -74); c.lineTo(2, -70); c.lineTo(-2, -77); c.closePath(); });
    px(c, 0, -84, 6, 1, STEEL[0]); for (let k = 0; k < 3; k++) ell(c, 1 + k * 2.4, -73, 0.6, 0.6, STEEL[4]);
    ell(c, 3, -79, 2.4, 2.4, '#1A1416'); fill(c, WAX[2], () => { c.moveTo(-1, -86); c.quadraticCurveTo(-6, -90, -8, -84); c.lineTo(-3, -80); c.closePath(); });
    spring(c, 3, -79, 12, -84, 6, 1.4); ell(c, 13, -84.6, 2.6, 2.6, '#FBFBF8'); ell(c, 14, -84.6, 1.2, 1.2, '#2A4A6A');
  });
  // (the pearls everywhere, the perm off, an oven mitt)
  for (let k = 0; k < 16; k++) { const sx = d * (30 + hash(k * 2.3) * 130), sy = 3 + hash(k * 7.1) * 8; ell(c, sx, sy, 1.4, 1.3, '#FBF7EE'); px(c, sx - 0.6, sy - 0.8, 0.6, 0.6, '#FFFFFF'); }
  wig(c, -d * 160, 4, '#8A4A1C', 'perm');
  ell(c, d * 148, 6, 6, 3.6, '#3F7A4A'); ell(c, d * 147, 5, 3, 1.6, '#6AA874');
};

const paintBoy = (c: Ctx, d: 1 | -1) => {
  deck(c, d, 23);
  scorch(c, -d * 70);
  // (his base on its back, the castors up, the antenna snapped)
  c.save(); c.translate(-d * 120, -4); c.scale(1, -1);
  shape(c, () => c.roundRect(-12, -6, 24, 8, 2), ['#B8BCC4', '#8E949E', '#6E747E', '#50565E', '#22262C'], -12, 12);
  c.restore();
  line(c, [-d * 112, -2, -d * 100, -10, -d * 96, -9], 0.8, '#9AA0AA');
  // (his legs, still bolted to it, buckled; the torn waist)
  piece(c, 'boy', -d * 108, -8, d * 1.2, -46, -8, () => { tear(c, -46, 12, '#3B5EA8', -1, 5); innards(c, -46, -1, 6, 9); });
  // (his chest flung out the other side; the head off it, up on its spring, the jack-in-the-box)
  const ox = d * 70, oy = -14, rot = d * (Math.PI / 2 + 0.05);
  piece(c, 'boy', ox, oy, rot, -60, -43, () => { tear(c, -43, 12, '#F4F1EA', 1, 9); innards(c, -43, 1, 10, 10); servoOut(c, 10, -50); });
  // (the circuit board in bits, its chips; the beer foaming out of the crushed can)
  for (let k = 0; k < 4; k++) { const sx = d * (24 + k * 14), sy = 6 + (k % 2) * 3; px(c, sx - 4, sy - 2, 8, 4, '#1E5A2E'); px(c, sx - 3, sy - 1, 2, 2, '#18181B'); line(c, [sx - 4, sy + 1, sx + 4, sy + 1], 0.5, '#C8B048'); }
  ell(c, -d * 30, 8, 20, 3.4, '#FEF3C7'); for (let k = 0; k < 8; k++) ell(c, -d * (20 + k * 3), 6 - (k % 3), 2.4, 2, '#FFFBEB');
  can(c, -d * 38, 4, 1.4, 1);
  // (his face, the latex mask of it, peeled off whole and lying there: the eyeholes, the freckles, the grin)
  const mx = d * 150;
  fill(c, WAX[3], () => c.ellipse(mx, 6, 12, 4.6, 0, 0, Math.PI * 2)); fill(c, WAX[1], () => c.ellipse(mx, 5.4, 11, 4, 0, 0, Math.PI * 2));
  ell(c, mx - 4, 4.6, 2.2, 1.2, '#2A1A14'); ell(c, mx + 3, 4.6, 2.2, 1.2, '#2A1A14');
  c.strokeStyle = '#5E3A2A'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(mx, 6.6, 4, 1.4, 0, 0.2, Math.PI - 0.2); c.stroke();
  for (let k = 0; k < 5; k++) px(c, mx - 6 + k * 3, 5.6 + (k % 2), 0.8, 0.6, '#B5774E');
  ell(c, mx + 7, 5.6, 1.6, 0.8, '#F49AA0');
  glassEye(c, d * 132, 10); glassEye(c, d * 120, 6, 3);
};

const paintSis = (c: Ctx, d: 1 | -1) => {
  deck(c, d, 37);
  scorch(c, -d * 70);
  // (her: squashed flat where she sat, under the car's far end: the jeans, the sneakers out each side)
  piece(c, 'sis', -d * 96, 0, 0, -50, 2, undefined, 1.5, 0.32);
  // (her top half flung out, the far arm off it)
  const ox = d * 66, oy = -12, rot = d * (Math.PI / 2 + 0.2);
  piece(c, 'sis', ox, oy, rot, -70, -10, () => { tear(c, -10, 11, '#65A30D', 1, 13); innards(c, -10, 1, 14, 10); });
  // (her arm, torn off at the shoulder: the steel fingers out of the split glove of skin (live: flexing))
  limb(c, -d * 60, 8, 3, -d * 40, 6, 2.6, rampOf('#65A30D')); ell(c, -d * 40, 6, 2.6, 2.6, '#3A3A44'); px(c, -d * 40 - 1, 5, 2, 2, '#9AA0AA');
  // (the ponytail wig, the retainer, a sneaker, her smiley's button)
  wig(c, d * 156, 6, '#C2873A', 'pony');
  glassEye(c, -d * 24, 11);
  c.save(); c.translate(d * 128, 9); c.strokeStyle = '#C9CDD4'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(0, 0, 5, 2, 0, Math.PI, Math.PI * 2); c.stroke(); ell(c, 0, 0.6, 5, 1.6, '#F9A8D4'); for (let k = 0; k < 5; k++) px(c, -3.6 + k * 1.8, -0.8, 1.2, 1.4, '#FFFFFF'); c.restore();
  shape(c, () => c.roundRect(-d * 150 - 6, 2, 12, 6, 2), ['#FFFFFF', '#F0F0F0', '#D4D4D4', '#A8A8A8', '#4A4A4A'], -d * 150 - 6, -d * 150 + 6); px(c, -d * 150 - 6, 7, 12, 1, '#EC4899');
  ell(c, d * 112, 10, 4, 2, '#FDE047'); px(c, d * 111, 9.4, 0.8, 0.6, '#1A1A1A'); px(c, d * 113, 9.4, 0.8, 0.6, '#1A1A1A');
};

const paintGramps = (c: Ctx, d: 1 | -1) => {
  deck(c, d, 51);
  scorch(c, -d * 70);
  const R = rampOf('#5E7A3E');
  // (the recliner snapped in two: the back flat out one side, the footrest bent up the other; the springs and the
  // foam out of the break)
  c.save(); c.translate(d * 120, -4); c.rotate(d * 1.3);
  shape(c, () => { c.moveTo(-8, 0); c.lineTo(8, 0); c.lineTo(10, -40); c.quadraticCurveTo(0, -46, -10, -40); c.closePath(); }, R, -10, 10);
  px(c, -4, -30, 8, 7, '#B4B8C0'); px(c, -4, -30, 8, 1.2, '#D4D8E0');
  c.restore();
  shape(c, () => c.roundRect(-d * 140 - 14, -8, 28, 8, 3), R, -d * 140 - 14, -d * 140 + 14);
  for (let k = 0; k < 4; k++) spring(c, -d * (40 + k * 22), 4, -d * (46 + k * 22), -10 - (k % 2) * 6, 7, 2.4);
  for (let k = 0; k < 7; k++) ell(c, d * (20 + k * 14), 4 + (k % 3) * 2, 4 + (k % 2) * 2, 2.6, k % 2 ? '#F2D27A' : '#E8C25A');
  // (his legs, still on the footrest, sticking out; his top half out the far side, in his cardigan)
  piece(c, 'gramps', -d * 112, -2, 0, -60, -18, () => { tear(c, -40, 8, '#6B6F7A', -1, 17); });
  const ox = d * 80, oy = -12, rot = d * (Math.PI / 2 + 0.05);
  piece(c, 'gramps', ox, oy, rot, -120, -60, () => { tear(c, -60, 14, '#8A6A3A', 1, 19); innards(c, -60, 1, 20, 12); servoOut(c, 12, -66); });
  // (the newspaper everywhere, his glasses cracked, the toupee)
  for (let k = 0; k < 6; k++) {
    const sx = (hash(k * 4.1) - 0.5) * 300, sy = 3 + hash(k * 1.7) * 7, r = (hash(k) - 0.5) * 0.6;
    c.save(); c.translate(sx, sy); c.rotate(r); px(c, -9, -3, 18, 6, '#EDEAE0'); px(c, -9, -3, 18, 0.6, '#FFFFFF'); for (let j = 0; j < 3; j++) px(c, -7, -1.6 + j * 1.6, 14, 0.5, '#8A8678'); px(c, -7, -2.4, 6, 0.8, '#2A2A2A'); c.restore();
  }
  c.save(); c.translate(-d * 30, 8); c.strokeStyle = '#2A2A2A'; c.lineWidth = 0.9; c.strokeRect(-6, -2, 5, 3.4); c.strokeRect(1, -2, 5, 3.4); line(c, [-1, -1, 1, -1], 0.8, '#2A2A2A'); line(c, [2, -2, 4, 1.4, 3, 1.4], 0.4, '#FFFFFF'); c.restore();
  wig(c, -d * 160, 4, '#7A5A3A', 'toupee');
  glassEye(c, d * 40, 11, 3);
};

const PAINTS: Record<Member, (c: Ctx, d: 1 | -1) => void> = { mom: paintMom, boy: paintBoy, sis: paintSis, gramps: paintGramps };

/** Which way each one's set piece went, fixed the first time it's drawn (Dad walking past it never flips it). */
const sides = new Map<string, 1 | -1>();
/** Where each one's live bits are (local to its set piece). */
const LIVE: Record<Member, { spark: [number, number][]; hand: [number, number] }> = {
  mom: { spark: [[84, -40], [-90, -24]], hand: [-52, 10]} ,
  boy: { spark: [[96, -36], [-74, -40]], hand: [40, 12]} ,
  sis: { spark: [[70, -26], [-40, 6]], hand: [-62, 8]} ,
  gramps: { spark: [[96, -50], [-120, -28]], hand: [52, 12]} ,
};

/** What a stunt car left of one of the family: its set piece (stamped), the live bits over it. */
export const drawCarnage = (c: Ctx, who: Member, x: number, floorY: number, f: number, dir: 1 | -1) => {
  const key = `${who}@${Math.round(x)}`;
  let d = sides.get(key);
  if (!d) { d = dir; if (sides.size > 64) sides.clear(); sides.set(key, d); }
  c.save(); c.translate(Math.round(x), Math.round(floorY));
  stamp(c, `ct-carnage-${who}-${d}`, -190, -130, 380, 148, g => PAINTS[who](g, d!));
  const L = LIVE[who];
  // (the fire on the oil, its smoke going up in a column)
  const fx = -d * 70;
  for (let k = 0; k < 4; k++) {
    const h = 6 + ((f * 3 + k * 13) % 9), bx = fx - 9 + k * 6;
    fill(c, '#EA580C', () => { c.moveTo(bx - 3, 4); c.lineTo(bx, 4 - h); c.lineTo(bx + 3, 4); c.closePath(); });
    fill(c, '#FDE047', () => { c.moveTo(bx - 1.4, 4); c.lineTo(bx, 4 - h * 0.55); c.lineTo(bx + 1.4, 4); c.closePath(); });
  }
  for (let k = 0; k < 6; k++) {
    const u = ((f * 0.5 + k * 16) % 96) / 96, r = 3 + u * 9;
    ell(c, fx + Math.sin(u * 6 + k) * 4 * u, -6 - u * 120, r, r * 0.85, u < 0.3 ? 'rgba(41,37,36,0.55)' : `rgba(87,83,78,${(0.5 * (1 - u)).toFixed(2)})`);
  }
  // (sparks off the torn wires, now and then)
  for (const [i, [sx, sy]] of L.spark.entries()) if ((f + i * 23 + who.length * 7) % 40 < 6) sparks(c, d * sx, sy, f);
  // (a hand, still twitching: its fingers curling and letting go in jerks)
  const [hx0, hy] = L.hand, hx = d * hx0, tw = Math.floor(f / 5) % 7 === 0 ? 1 : Math.floor(f / 5) % 11 === 3 ? 0.5 : 0;
  if (who === 'sis') {
    // (her steel fingers)
    for (let k = 0; k < 4; k++) { const a = -0.6 + k * 0.4 + tw * 0.5; line(c, [hx, hy, hx - d * Math.cos(a) * 5, hy + Math.sin(a) * 5 - 1], 1, '#9AA0AA'); }
  } else {
    ell(c, hx, hy, 3.4, 2.4, who === 'mom' ? '#3F7A4A' : WAX[1]);
    for (let k = 0; k < 4; k++) { const a = -0.8 + k * 0.45 + tw * 0.7; line(c, [hx + d * 2, hy - 0.6, hx + d * (2 + Math.cos(a) * 4), hy - 0.6 + Math.sin(a) * 3 - tw], 1.2, who === 'mom' ? '#3F7A4A' : WAX[2]); }
    line(c, [hx - d * 3, hy, hx - d * 8, hy + 1], 1, '#C83A3A'); line(c, [hx - d * 3, hy + 0.6, hx - d * 7, hy + 2], 0.8, '#1C1C1C');
  }
  if (who === 'gramps') {
    // (his dentures, chattering across the deck by themselves)
    const cx = d * 140 + Math.sin(f * 0.05) * 4, open = Math.floor(f / 4) % 2 ? 2.2 : 0.4;
    ell(c, cx, 8 - open, 4.4, 1.6, '#E8899A'); px(c, cx - 3.6, 8.4 - open, 7.2, 1.2, '#FBF7EE');
    ell(c, cx, 9, 4.4, 1.6, '#E8899A'); px(c, cx - 3.6, 7.4, 7.2, 1.2, '#FBF7EE');
  }
  if (who === 'boy') {
    // (his head, up on its spring off the neck, boinging)
    const nx = d * 108, ny = -18, bob = Math.sin(f * 0.25) * 4 * (0.4 + 0.6 * ((Math.floor(f / 90) % 2))), hx2 = nx + d * 6 + bob * 0.6, hy2 = -46 + bob;
    spring(c, nx, ny, hx2, hy2 + 8, 8, 2.6);
    c.save(); c.translate(hx2, hy2 + 70); c.rotate(bob * 0.03);
    c.beginPath(); c.rect(-30, -82, 60, 22); c.clip();
    drawBoy(c, 0, 0, { mode: 'glitch', f, talking: false }, 0, false);
    c.restore();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// DAD GUY's own: flesh, under the last car

export const GUT: Ramp = ['#FBC4D4', '#EC8FB0', '#D46A8E', '#A84A6A', '#5A1E33'];
export const BLOOD = ['#3A0306', '#5A0A10', '#8A1018', '#B91C1C', '#E04848'];
export const tooth = (c: Ctx, x: number, y: number, rot: number, gold = false) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  fill(c, '#5A4A3A', () => { c.moveTo(-1.6, -1.4); c.lineTo(1.6, -1.4); c.lineTo(1.8, 1.8); c.lineTo(0.6, 3.2); c.lineTo(0, 1.8); c.lineTo(-0.6, 3.2); c.lineTo(-1.8, 1.8); c.closePath(); });
  fill(c, gold ? '#F2C84A' : '#F4EDD6', () => { c.moveTo(-1.2, -1); c.lineTo(1.2, -1); c.lineTo(1.4, 1.4); c.lineTo(0.5, 2.6); c.lineTo(0, 1.6); c.lineTo(-0.5, 2.6); c.lineTo(-1.4, 1.4); c.closePath(); });
  px(c, -0.8, -0.6, 0.8, 1, gold ? '#FFF0A8' : '#FFFFFF'); px(c, -1.2, 1.6, 2.4, 1, BLOOD[3]);
  c.restore();
};
/** A rope of gut: a chain of fat tubes along the points, a bead of shine on each. */
export const gutRope = (c: Ctx, pts: number[], r: number) => {
  for (let i = 0; i + 3 < pts.length; i += 2) limb(c, pts[i], pts[i + 1], r, pts[i + 2], pts[i + 3], r * 0.94, GUT, 0, 0.8);
  for (let i = 0; i + 1 < pts.length; i += 4) ell(c, pts[i] - 0.6, pts[i + 1] - r * 0.5, r * 0.4, r * 0.22, '#FFE4EC');
};

const paintDadGore = (c: Ctx, facing: 1 | -1) => {
  const hs = -facing;
  // (the lake: dark, then its lobes splashed out, the spray streaking off across the deck, the drops beyond)
  ell(c, 0, 1, 150, 10, BLOOD[0]); ell(c, 0, 0.6, 136, 8, BLOOD[1]); ell(c, -6, 0, 110, 6, BLOOD[2]);
  for (let k = 0; k < 18; k++) { const a = hash(k * 3.3) * Math.PI * 2, rx = 110 + hash(k * 1.1) * 50, sx = Math.cos(a) * rx, sy = Math.sin(a) * 9; ell(c, sx, sy + 1, 6 + hash(k) * 10, 2 + hash(k + 4) * 2.4, k % 3 ? BLOOD[1] : BLOOD[2]); }
  for (let k = 0; k < 16; k++) {
    const s = k % 2 ? 1 : -1, y = -2 + hash(k * 5.7) * 12, x0 = s * (80 + hash(k) * 30), x1 = s * (170 + hash(k * 2.2) * 50);
    fill(c, BLOOD[2], () => { c.moveTo(x0, y - 1.2); c.lineTo(x1, y + (y - 4) * 0.2); c.lineTo(x0, y + 1.2); c.closePath(); });
    ell(c, x1 + s * 4, y + (y - 4) * 0.2, 2, 1, BLOOD[3]);
  }
  for (let k = 0; k < 30; k++) { const sx = (hash(k * 9.1) - 0.5) * 420, sy = -3 + hash(k * 4.4) * 13; ell(c, sx, sy, 1 + hash(k) * 2, 0.6 + hash(k) * 0.8, k % 4 ? BLOOD[2] : BLOOD[3]); }
  px(c, -70, -0.6, 40, 0.8, BLOOD[4]); px(c, 20, -0.2, 30, 0.6, BLOOD[4]); px(c, -100, 1.6, 14, 0.6, '#F8A0A0');
  // (the guts squeezed out both sides: ropes of it looped over themselves, a lump of liver, his stomach split with a
  // can of SWILL LITE in it)
  for (const s of [-1, 1]) {
    const b = s * 74, pts: number[] = [];
    for (let k = 0; k < 9; k++) pts.push(b + s * k * 7.4, -3 - Math.sin(k * 1.4) * 4.6 + (k % 2) * 2);
    gutRope(c, pts, 3.4);
    const pts2: number[] = []; for (let k = 0; k < 6; k++) pts2.push(b + s * (10 + k * 6), 3 + Math.cos(k * 1.7) * 3);
    gutRope(c, pts2, 2.8);
    shape(c, () => c.ellipse(b + s * 64, 2, 9, 4.4, s * 0.2, 0, Math.PI * 2), ['#B04A4A', '#8A2A2A', '#6A1A1A', '#4A0E0E', '#200404'], b + s * 55, b + s * 73);
  }
  shape(c, () => c.ellipse(-hs * 104, -3, 12, 6, 0, 0, Math.PI * 2), ['#F4C8C0', '#E2A49A', '#C4827A', '#9A5A54', '#4A2420'], -hs * 104 - 12, -hs * 104 + 12);
  ell(c, -hs * 100, -6, 4, 2, '#C9A23A'); can(c, -hs * 108, -6, -hs * 1.1, 0.4); ell(c, -hs * 96, -1, 5, 1.6, '#E0B820');
  // (the eyeball popped, out on its stalk off where his head is; his teeth all over; the gold one)
  const ex = hs * 106, ey = -4;
  line(c, [hs * 66, -2, hs * 80, -7, hs * 94, -3, ex - hs * 4, ey], 2.2, '#8A1018'); line(c, [hs * 66, -2, hs * 80, -7, hs * 94, -3, ex - hs * 4, ey], 1, '#E04848');
  shape(c, () => c.ellipse(ex, ey, 5.6, 5.6, 0, 0, Math.PI * 2), ['#FFFFFF', '#F5E4DC', '#E0C4B8', '#B89488', '#5A3A30'], ex - 5.6, ex + 5.6, 0.8);
  for (let k = 0; k < 4; k++) line(c, [ex - hs * 5, ey + (k - 1.5) * 1.6, ex - hs * 2.4, ey + (k - 1.5) * 1.2], 0.4, '#E0707A');
  ell(c, ex + hs * 2.4, ey - 0.4, 2.4, 2.6, '#7EA4C8'); ell(c, ex + hs * 2.8, ey - 0.4, 1.2, 1.4, '#101820'); px(c, ex + hs * 1.6, ey - 2, 1, 1, '#FFFFFF');
  for (let k = 0; k < 11; k++) tooth(c, hs * (70 + hash(k * 2.7) * 90) + (hash(k * 8.8) - 0.5) * 30, -2 + hash(k * 3.9) * 10, hash(k) * 6, k === 4);
  // (the TV dinner: the peas, the corn, a smear of the mashed potatoes and the gravy through it all)
  for (let k = 0; k < 22; k++) ell(c, (hash(k * 6.3) - 0.5) * 240, -1 + hash(k * 2.1) * 9, 1.3, 1.1, k % 3 === 0 ? '#F2C84A' : '#4E8A2E');
  ell(c, facing * 40, 7, 12, 2.4, '#F4EFE2'); ell(c, facing * 42, 6.4, 6, 1.2, '#7A4A1C');
};

/** His gore under and round the pancake (and left there after): stamped; the squirts pulsing out live while it's fresh
 *  (`t` the frames since). */
export const drawDadGore = (c: Ctx, x: number, floorY: number, f: number, facing: 1 | -1, t: number) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY));
  stamp(c, `ct-dadgore-${facing}`, -240, -40, 480, 56, g => paintDadGore(g, facing));
  // (pumping: an arc of it out each side, beat by beat, weaker as it goes)
  if (t < 700) {
    const beat = (f % 46) / 46, k = 1 - t / 700;
    if (beat < 0.5) for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const u = beat * 2 - i * 0.07; if (u <= 0) continue;
      const sx = s * (70 + u * 70 * k), sy = -6 - Math.sin(u * Math.PI) * 30 * k;
      ell(c, sx, sy, 2.2 - i * 0.2, 1.8 - i * 0.2, i % 2 ? BLOOD[3] : BLOOD[2]);
    }
  }
  c.restore();
};

/** The TV dinner's tray, stuck to him (live: it's on the pancake, which flutters): foil, its compartments, the food. */
export const drawTray = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  px(c, -17, -5, 34, 10, '#4A4E56'); px(c, -16, -4, 32, 8, '#AEB5BF'); px(c, -16, -4, 32, 1.4, '#E2E6EC');
  px(c, -16, 2.6, 32, 1.4, '#808893'); px(c, -3, -4, 1, 8, '#808893'); px(c, 6, -4, 1, 8, '#808893');
  ell(c, -10, 0, 5, 2.6, '#6A3A1A'); ell(c, -11, -0.6, 3, 1.2, '#8A5A2A');
  for (let k = 0; k < 6; k++) ell(c, 0 + (k % 3) * 1.6, -1.6 + Math.floor(k / 3) * 2, 0.9, 0.9, '#4E8A2E');
  ell(c, 11, 0, 4, 2.4, '#F4EFE2'); ell(c, 11, -0.6, 2, 0.9, '#7A4A1C');
  ell(c, -14, -6, 2, 1, BLOOD[3]); px(c, 8, 4, 2, 3, BLOOD[2]);
  c.restore();
};
