// The weapon-get screen's face-off: Meathead square to the camera in a boxing guard, in the void, about to deck it.
// Painted the gross-up way (see grossUp.ts): in far more detail than he's ever drawn anywhere else. The flat-top
// bristle by bristle, the stubble, the pores, the bloodshot eyes dead on the lens, the broken nose, the chipped tooth
// when the lips peel back; the traps like hills, the pecs, the abs in their rows, the veins, the sweat; the lifting
// belt's stitching and the buckle's shine; the tactical pants creased and pocketed, the steel toes scuffed.
//
// In the old picture's coordinates (200 x 440: the head at the top, the boots at the bottom), lit from the upper
// left. `windup` (0..1) draws the left fist back, narrows the eyes and bares the teeth; `punching` takes the left
// arm away (it's coming at the lens) and drives the shoulder forward.

import { INK, hash, shape, speckle } from './art/ink';
import { vein, bead } from './grossUp';

type Ctx = CanvasRenderingContext2D;

export const SKIN_LIT = '#F6CF9C', SKIN = '#E0AC69', SKIN_MID = '#C98A48', SKIN_DARK = '#8E5A28', SKIN_DEEP = '#5E3A18';

/** Fill a path with skin, lit from the upper left, an olive tinge down in the shadows, and an ink line round it. */
export const skin = (ctx: Ctx, path: () => void, x0: number, y0: number, x1: number, y1: number, line = 2.6) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, SKIN_LIT); g.addColorStop(0.35, SKIN); g.addColorStop(0.75, SKIN_MID); g.addColorStop(1, SKIN_DARK);
  shape(ctx, path, g, line);
};

/** A round of muscle (a delt, a pec, a bicep): a hot highlight up and to the left of its middle, dark at its rim. */
export const bulge = (ctx: Ctx, path: () => void, cx: number, cy: number, r: number, line = 2.4) => {
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.08, cx, cy, r * 1.15);
  g.addColorStop(0, '#FFE9C8'); g.addColorStop(0.3, SKIN_LIT); g.addColorStop(0.62, SKIN); g.addColorStop(0.88, SKIN_MID); g.addColorStop(1, SKIN_DARK);
  shape(ctx, path, g, line);
};

/** Inside a path: pores and freckles, a few hairs. */
export const pores = (ctx: Ctx, path: () => void, x: number, y: number, w: number, h: number, seed: number, n = 140) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  speckle(ctx, x, y, w, h, n, 'rgba(110, 60, 25, 0.35)', seed, 0.5);
  speckle(ctx, x, y, w, h, Math.floor(n / 3), 'rgba(255, 240, 215, 0.35)', seed + 7, 0.45);
  ctx.restore();
};

/** A muscle groove: a soft dark line with a lighter edge beside it. */
export const groove = (ctx: Ctx, pts: number[], w = 1.6, a = 0.55) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(90, 45, 15, ${a})`; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 190, ${a * 0.55})`; ctx.lineWidth = w * 0.45;
  ctx.beginPath(); ctx.moveTo(pts[0] - 0.8, pts[1] - 0.8); ctx.bezierCurveTo(pts[2] - 0.8, pts[3] - 0.8, pts[4] - 0.8, pts[5] - 0.8, pts[6] - 0.8, pts[7] - 0.8); ctx.stroke();
};

/** Cross-hatching inside a path, down the shadow side of a form (the strokes go up and to the right). */
export const shadeIn = (ctx: Ctx, path: () => void, x: number, y: number, w: number, h: number, a = 0.3, step = 2.2) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.strokeStyle = `rgba(60, 28, 8, ${a})`; ctx.lineWidth = 0.55;
  for (let k = -h; k < w; k += step) { ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h * 0.55, y); ctx.stroke(); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// From the ground up
// ---------------------------------------------------------------------------

/** One boot (s: -1 his right, our left; 1 the other): black leather, its shine, the laces, the steel toe, a scuff. */
export const boot = (ctx: Ctx, s: number) => {
  const X = (x: number) => 100 + s * (x - 100);
  // The boot: black leather, its shine, the laces, the steel toe, a scuff
  const boot = () => { ctx.moveTo(X(40), 402); ctx.lineTo(X(98), 402); ctx.lineTo(X(100), 432); ctx.lineTo(X(36), 432); ctx.closePath(); };
  const bg = ctx.createLinearGradient(0, 402, 0, 432);
  bg.addColorStop(0, '#3F3F46'); bg.addColorStop(0.4, '#18181B'); bg.addColorStop(1, '#09090B');
  shape(ctx, boot, bg, 2.6);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(46), 406); ctx.lineTo(X(84), 405); ctx.stroke();
  ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 0.9;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(X(58 + k * 6), 404); ctx.lineTo(X(64 + k * 6), 412); ctx.moveTo(X(64 + k * 6), 404); ctx.lineTo(X(58 + k * 6), 412); ctx.stroke(); }
  const toe = () => { ctx.moveTo(X(36), 420); ctx.lineTo(X(56), 418); ctx.lineTo(X(56), 432); ctx.lineTo(X(36), 432); ctx.closePath(); };
  const tg = ctx.createLinearGradient(0, 418, 0, 432);
  tg.addColorStop(0, '#E2E8F0'); tg.addColorStop(0.5, '#94A3B8'); tg.addColorStop(1, '#475569');
  shape(ctx, toe, tg, 1.6);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.5;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X(40 + k * 4), 423 + k); ctx.lineTo(X(43 + k * 4), 427 + k); ctx.stroke(); }
  ctx.fillStyle = '#27272A'; ctx.fillRect(Math.min(X(36), X(100)), 430, 64, 2.5);
};

/** The tactical pants and the boots: a wide boxer's stance, creased, cargo pockets, steel toes, scuffed. */
const legs = (ctx: Ctx) => {
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const leg = () => { ctx.moveTo(X(58), 244); ctx.lineTo(X(46), 404); ctx.lineTo(X(94), 404); ctx.lineTo(X(100), 290); ctx.closePath(); };
    const g = ctx.createLinearGradient(X(46), 0, X(100), 0);
    g.addColorStop(0, s < 0 ? '#2B4CA8' : '#16285E'); g.addColorStop(0.5, '#1E3A8A'); g.addColorStop(1, s < 0 ? '#172554' : '#24438F');
    shape(ctx, leg, g, 2.6);
    ctx.save(); ctx.beginPath(); leg(); ctx.clip();
    // (the creases: dragged across the thigh, bunched over the boot)
    ctx.strokeStyle = 'rgba(10, 18, 50, 0.6)'; ctx.lineWidth = 1.4;
    for (const [a, b, c, d] of [[62, 262, 84, 276], [58, 300, 80, 296], [54, 372, 86, 380], [52, 388, 90, 394]] as const) { ctx.beginPath(); ctx.moveTo(X(a), b); ctx.quadraticCurveTo(X((a + c) / 2), b + 8, X(c), d); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(147, 170, 230, 0.35)'; ctx.lineWidth = 0.8;
    for (const [a, b, c, d] of [[63, 260, 84, 273], [56, 370, 86, 377]] as const) { ctx.beginPath(); ctx.moveTo(X(a), b - 1.5); ctx.quadraticCurveTo(X((a + c) / 2), b + 6, X(c), d - 1.5); ctx.stroke(); }
    // (the knee, catching the light)
    const kg = ctx.createRadialGradient(X(72), 336, 1, X(72), 336, 16);
    kg.addColorStop(0, 'rgba(120, 150, 220, 0.4)'); kg.addColorStop(1, 'rgba(120, 150, 220, 0)');
    ctx.fillStyle = kg; ctx.fillRect(X(56) - 20, 316, 60, 40);
    // (the seam down the outside, stitched)
    ctx.strokeStyle = 'rgba(8, 14, 40, 0.8)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(X(57), 250); ctx.lineTo(X(47), 400); ctx.stroke(); ctx.setLineDash([]);
    speckle(ctx, X(s < 0 ? 46 : 54) - (s < 0 ? 0 : 54), 250, 54, 150, 90, 'rgba(255,255,255,0.05)', 3 + s, 0.6);
    ctx.restore();
    // The cargo pocket: its flap, its stitching, a snap
    const pk = () => ctx.roundRect(Math.min(X(56), X(86)), 336, 30, 26, 4);
    shape(ctx, pk, '#1B347C', 1.8);
    shape(ctx, () => ctx.roundRect(Math.min(X(55), X(87)), 332, 32, 10, 3), '#203E90', 1.8);
    ctx.strokeStyle = 'rgba(147, 170, 230, 0.4)'; ctx.lineWidth = 0.6; ctx.setLineDash([1.5, 1.5]);
    ctx.strokeRect(Math.min(X(58), X(84)) + 0.5, 339, 26, 20); ctx.setLineDash([]);
    shape(ctx, () => ctx.arc(X(71), 338, 1.6, 0, Math.PI * 2), '#9CA3AF', 0.6);
    boot(ctx, s);
  }
};

/** The lifting belt: thick leather, stitched round its edges, the holes, the brass buckle and its shine. */
const belt = (ctx: Ctx) => {
  const path = () => { ctx.moveTo(57, 222); ctx.lineTo(143, 222); ctx.lineTo(144, 250); ctx.lineTo(56, 250); ctx.closePath(); };
  const g = ctx.createLinearGradient(0, 222, 0, 250);
  g.addColorStop(0, '#9A4A14'); g.addColorStop(0.35, '#7A3610'); g.addColorStop(1, '#4A1F08');
  shape(ctx, path, g, 2.6);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  speckle(ctx, 56, 222, 88, 28, 120, 'rgba(30, 10, 2, 0.4)', 11, 0.6);
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.55)'; ctx.lineWidth = 0.6; ctx.setLineDash([2, 1.6]);
  ctx.beginPath(); ctx.moveTo(58, 225.5); ctx.lineTo(142, 225.5); ctx.moveTo(57, 246.5); ctx.lineTo(143, 246.5); ctx.stroke(); ctx.setLineDash([]);
  for (const x of [64, 72, 128, 136]) shape(ctx, () => ctx.ellipse(x, 236, 1.6, 2.2, 0, 0, Math.PI * 2), '#1C0A02', 0.4);
  ctx.restore();
  // The buckle: a frame of brass, bevelled, the prong across it, a hard glint
  const bk = () => ctx.roundRect(86, 223, 28, 26, 3);
  const bkg = ctx.createLinearGradient(86, 223, 114, 249);
  bkg.addColorStop(0, '#FEF3C7'); bkg.addColorStop(0.3, '#FACC15'); bkg.addColorStop(0.7, '#CA8A04'); bkg.addColorStop(1, '#713F12');
  shape(ctx, bk, bkg, 2.2);
  shape(ctx, () => ctx.roundRect(92, 229, 16, 14, 2), '#5B2A0C', 1.2);
  ctx.fillStyle = '#E5B53A'; ctx.fillRect(99, 229, 2, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(88, 226); ctx.lineTo(96, 225); ctx.lineTo(89, 229); ctx.closePath(); ctx.fill();
};

/** The lats, flaring out from under the arms behind him (the V of him), in shadow. */
export const lats = (ctx: Ctx) => {
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const path = () => { ctx.moveTo(X(52), 106); ctx.bezierCurveTo(X(30), 124, X(28), 168, X(44), 196); ctx.bezierCurveTo(X(52), 210, X(58), 220, X(60), 228); ctx.lineTo(X(70), 150); ctx.closePath(); };
    const g = ctx.createLinearGradient(X(28), 0, X(70), 0);
    g.addColorStop(0, SKIN_DEEP); g.addColorStop(0.6, SKIN_DARK); g.addColorStop(1, SKIN_MID);
    shape(ctx, path, g, 2.4);
    shadeIn(ctx, path, Math.min(X(28), X(70)), 106, 42, 122, 0.35);
    groove(ctx, [X(36), 140, X(42), 160, X(46), 180, X(52), 200], 1.2, 0.5);
  }
};

/** The torso: the pecs, the six-pack in its rows, the obliques, the trail down to the belt, veins, sweat, a scar. */
export const torso = (ctx: Ctx, t: number) => {
  const path = () => { ctx.moveTo(50, 100); ctx.lineTo(60, 240); ctx.lineTo(140, 240); ctx.lineTo(150, 100); ctx.closePath(); };
  skin(ctx, path, 50, 100, 150, 240);
  pores(ctx, path, 50, 100, 100, 140, 21, 260);
  // The abs: three rows of two, each a rounded block lit along its top, in shadow along its bottom
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) {
    const x = s < 0 ? 74 : 102, y = 140 + r * 23, w = 24, h = 19;
    const blk = () => ctx.roundRect(x, y, w, h, 7);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#F9DAB0'); g.addColorStop(0.45, SKIN); g.addColorStop(1, SKIN_DARK);
    shape(ctx, blk, g, 0);
    ctx.strokeStyle = 'rgba(90, 45, 15, 0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); blk(); ctx.stroke();
    ctx.fillStyle = 'rgba(255, 250, 235, 0.55)'; ctx.beginPath(); ctx.ellipse(x + w * 0.38, y + 4.5, w * 0.24, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // (the obliques, serrated down the sides)
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) groove(ctx, [100 + s * 38, 140 + k * 16, 100 + s * 34, 146 + k * 16, 100 + s * 32, 150 + k * 16, 100 + s * 28, 154 + k * 16], 1.2, 0.5);
  // (the V down into the belt, a vein along it)
  groove(ctx, [70, 206, 80, 214, 90, 220, 96, 228], 1.6, 0.6); groove(ctx, [130, 206, 120, 214, 110, 220, 104, 228], 1.6, 0.6);
  vein(ctx, [[78, 200], [84, 210], [86, 218], [92, 226]], 1.2, 1 + Math.sin(t / 300) * 0.1);
  // (the navel, the trail of hair down from it)
  shape(ctx, () => ctx.ellipse(100, 211, 2.4, 3.4, 0, 0, Math.PI * 2), '#6B3A14', 0.8);
  ctx.strokeStyle = 'rgba(40, 20, 8, 0.65)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 26; k++) { const x = 100 + (hash(k) - 0.5) * 8, y = 214 + hash(k * 3) * 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (hash(k * 5) - 0.5) * 2, y + 2.4); ctx.stroke(); }
  ctx.restore();
  // The pecs: two slabs, a hard highlight on each, the shadow under them, the nipples
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const pec = () => { ctx.moveTo(X(52), 100); ctx.bezierCurveTo(X(52), 134, X(96), 140, X(98), 108); ctx.bezierCurveTo(X(98), 95, X(64), 94, X(52), 100); ctx.closePath(); };
    ctx.save(); ctx.translate(0, 3); ctx.beginPath(); pec(); ctx.fillStyle = 'rgba(70, 35, 10, 0.45)'; ctx.fill(); ctx.restore();
    bulge(ctx, pec, X(74), 112, 24, 2.4);
    pores(ctx, pec, Math.min(X(52), X(98)), 94, 46, 44, 30 + s, 90);
    shape(ctx, () => ctx.ellipse(X(80), 122, 3.4, 2.8, 0, 0, Math.PI * 2), '#B5654A', 0.8);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(X(80) - 1, 121, 1.2, 1);
    // (a few hairs on the chest)
    ctx.strokeStyle = 'rgba(40, 20, 8, 0.55)'; ctx.lineWidth = 0.35;
    for (let k = 0; k < 10; k++) { const x = X(88 + hash(k * 2 + s) * 10), y = 104 + hash(k * 7 + s) * 18; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1.5, y + 1, x + 0.5, y + 2.6); ctx.stroke(); }
  }
  // (a scar across the left pec, pale and puckered, with its stitch marks)
  ctx.strokeStyle = '#F2D1B3'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(110, 104); ctx.quadraticCurveTo(122, 108, 134, 104); ctx.stroke();
  ctx.strokeStyle = 'rgba(150, 80, 60, 0.7)'; ctx.lineWidth = 0.6;
  for (let k = 0; k < 6; k++) { const x = 112 + k * 4; ctx.beginPath(); ctx.moveTo(x, 104); ctx.lineTo(x + 0.6, 109); ctx.stroke(); }
  // Sweat: beads on the chest, one running down the abs
  for (const [x, y, r] of [[66, 132, 1.6], [126, 128, 1.4], [92, 150, 1.2], [112, 176, 1.5], [84, 190, 1.1]] as const) bead(ctx, x, y, r);
  const run = (t / 30) % 60;
  bead(ctx, 104, 150 + run, 1.4);
  ctx.strokeStyle = 'rgba(255, 245, 225, 0.25)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(104, 150); ctx.lineTo(104, 150 + run); ctx.stroke();
};

/** The traps, up like two hills from the shoulders into the neck, striated. */
export const traps = (ctx: Ctx) => {
  const path = () => { ctx.moveTo(46, 102); ctx.bezierCurveTo(56, 76, 70, 62, 78, 58); ctx.lineTo(122, 58); ctx.bezierCurveTo(130, 62, 144, 76, 154, 102); ctx.closePath(); };
  const g = ctx.createLinearGradient(0, 58, 0, 102);
  g.addColorStop(0, SKIN_LIT); g.addColorStop(0.5, SKIN_MID); g.addColorStop(1, SKIN_DARK);
  shape(ctx, path, g, 2.6);
  pores(ctx, path, 46, 58, 108, 44, 41, 120);
  for (let k = 0; k < 5; k++) { groove(ctx, [74 - k * 3, 64 + k * 3, 66 - k * 3, 76 + k * 3, 60 - k * 2, 88 + k * 2, 56 - k, 98], 0.8, 0.4); groove(ctx, [126 + k * 3, 64 + k * 3, 134 + k * 3, 76 + k * 3, 140 + k * 2, 88 + k * 2, 144 + k, 98], 0.8, 0.4); }
};

/** The neck: as wide as his head, the cords of it standing out, a vein up it, the Adam's apple. */
export const neck = (ctx: Ctx, t: number, windup: number) => {
  const path = () => { ctx.moveTo(78, 60); ctx.lineTo(76, 88); ctx.lineTo(124, 88); ctx.lineTo(122, 60); ctx.closePath(); };
  const g = ctx.createLinearGradient(76, 0, 124, 0);
  g.addColorStop(0, SKIN_MID); g.addColorStop(0.4, SKIN); g.addColorStop(1, SKIN_DARK);
  shape(ctx, path, g, 2.6);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  // (the shadow of the jaw across the top of it)
  ctx.fillStyle = 'rgba(60, 30, 10, 0.45)'; ctx.fillRect(70, 60, 60, 10);
  groove(ctx, [84, 70, 88, 78, 90, 84, 94, 90], 1.6, 0.6); groove(ctx, [116, 70, 112, 78, 110, 84, 106, 90], 1.6, 0.6);
  shape(ctx, () => ctx.ellipse(100, 78, 4, 3, 0, 0, Math.PI * 2), SKIN, 0.6);
  vein(ctx, [[112, 66], [114, 74], [113, 82], [116, 90]], 1.4, 1 + windup * 0.5 + Math.sin(t / 200) * 0.08);
  ctx.restore();
};

/** His head: square, the flat-top, the stubble, the ears, the brows, the eyes (bloodshot, dead on the lens), the nose, the mouth. */
export const head = (ctx: Ctx, t: number, windup: number, punching: boolean) => {
  // The ears: thick, a cauliflower ear on the left
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const ear = () => { ctx.moveTo(X(68), 38); ctx.bezierCurveTo(X(56), 36, X(56), 58, X(69), 58); ctx.closePath(); };
    skin(ctx, ear, X(56), 36, X(69), 58, 2);
    ctx.strokeStyle = 'rgba(90, 45, 15, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(66), 42); ctx.quadraticCurveTo(X(60), 46, X(64), 54); ctx.stroke();
    if (s > 0) for (const [x, y] of [[61, 44], [60, 50], [62, 55]] as const) shape(ctx, () => ctx.arc(X(x), y, 2, 0, Math.PI * 2), '#D99A70', 0.5);
  }
  // The face: square, the jaw in its own shadow
  const face = () => { ctx.moveTo(70, 26); ctx.lineTo(130, 26); ctx.lineTo(132, 60); ctx.lineTo(120, 75); ctx.lineTo(80, 75); ctx.lineTo(68, 60); ctx.closePath(); };
  skin(ctx, face, 68, 26, 132, 75, 2.8);
  ctx.save(); ctx.beginPath(); face(); ctx.clip();
  // (the cheekbones lit, the hollows under them)
  for (const s of [-1, 1]) {
    const cg = ctx.createRadialGradient(100 + s * 22, 52, 1, 100 + s * 22, 52, 12);
    cg.addColorStop(0, 'rgba(255, 228, 190, 0.5)'); cg.addColorStop(1, 'rgba(255, 228, 190, 0)');
    ctx.fillStyle = cg; ctx.fillRect(70, 38, 60, 26);
    groove(ctx, [100 + s * 26, 58, 100 + s * 22, 62, 100 + s * 18, 64, 100 + s * 14, 64], 1.2, 0.4);
  }
  // (the stubble: dark across the jaw, the upper lip, the chin)
  speckle(ctx, 70, 56, 60, 20, 420, 'rgba(45, 25, 10, 0.55)', 51, 0.55);
  speckle(ctx, 84, 58, 32, 4, 80, 'rgba(45, 25, 10, 0.5)', 52, 0.5);
  speckle(ctx, 70, 30, 60, 30, 160, 'rgba(110, 60, 25, 0.3)', 53, 0.5);
  // (the cleft in his chin)
  groove(ctx, [100, 68, 100, 70, 100, 72, 100, 75], 1.4, 0.6);
  ctx.restore();
  // The flat-top: dead level, bristle by bristle, the top of it catching the light; the sideburns
  const hair = () => { ctx.moveTo(66, 26); ctx.lineTo(134, 26); ctx.lineTo(134, 11); ctx.lineTo(66, 11); ctx.closePath(); };
  const hg = ctx.createLinearGradient(0, 11, 0, 26);
  hg.addColorStop(0, '#52525B'); hg.addColorStop(0.3, '#27272A'); hg.addColorStop(1, '#09090B');
  shape(ctx, hair, hg, 2.6);
  ctx.save(); ctx.beginPath(); hair(); ctx.clip();
  ctx.lineWidth = 0.55;
  for (let k = 0; k < 90; k++) { const x = 66 + k * 0.76 + hash(k) * 0.6; ctx.strokeStyle = k % 3 ? 'rgba(0,0,0,0.7)' : 'rgba(161, 161, 170, 0.6)'; ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x + (hash(k * 3) - 0.5) * 0.8, 11 + hash(k * 5) * 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(228, 228, 231, 0.55)'; ctx.fillRect(66, 11, 68, 1.4);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6;
  for (let k = 0; k < 34; k++) { const x = 67 + k * 2; ctx.beginPath(); ctx.moveTo(x, 11); ctx.lineTo(x + (hash(k) - 0.5), 9 - hash(k * 7) * 1.5); ctx.stroke(); }
  for (const s of [-1, 1]) { const x = s < 0 ? 66 : 128; ctx.fillStyle = '#18181B'; ctx.fillRect(x, 26, 6, 18); speckle(ctx, x, 26, 6, 18, 30, 'rgba(82, 82, 91, 0.6)', 61 + s, 0.5); }
  // The rage vein, throbbing harder on the wind-up
  const throb = 1 + windup * 0.9 + Math.sin(t / 120) * 0.12;
  vein(ctx, [[76, 30], [80, 34], [82, 38], [79, 43]], 1.3, throb);
  // Sweat on his forehead
  for (const [x, y, r] of [[92, 31, 1.3], [110, 30, 1.1], [120, 34, 1.4], [86, 36, 0.9]] as const) bead(ctx, x, y, r);
  // The brows: thick, every hair, lower and harder as he winds up; a scar through the left one
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const brow = () => { ctx.moveTo(X(71), 38 + windup); ctx.lineTo(X(97), 45 + windup * 2.5); ctx.lineTo(X(95), 49 + windup * 1.5); ctx.lineTo(X(71), 43 + windup); ctx.closePath(); };
    shape(ctx, brow, '#141414', 1.2);
    ctx.strokeStyle = 'rgba(82, 82, 91, 0.7)'; ctx.lineWidth = 0.4;
    for (let k = 0; k < 14; k++) { const x = X(72 + k * 1.8), y = 40 + k * 0.4 + windup * (1 + k * 0.1); ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x + s * 1.6, y); ctx.stroke(); }
  }
  ctx.strokeStyle = '#F2D1B3'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(120, 37); ctx.lineTo(117, 46); ctx.stroke();
  // The eyes: narrowing as he winds up; whites gone pink, veins in them; red irises, pinprick pupils, dead on the lens
  for (const s of [-1, 1]) {
    const cx = 100 + s * 15, cy = 51, ry = Math.max(1.6, 4.4 - windup * 2.2);
    // (the bags under them)
    groove(ctx, [cx - 7, cy + 5, cx - 3, cy + 7, cx + 3, cy + 7, cx + 7, cy + 5], 1, 0.45);
    const eye = () => ctx.ellipse(cx, cy, 7.4, ry, 0, 0, Math.PI * 2);
    const wg = ctx.createRadialGradient(cx, cy, 1, cx, cy, 8);
    wg.addColorStop(0, '#FFFFFF'); wg.addColorStop(0.6, '#FDE2E2'); wg.addColorStop(1, '#F8A5A5');
    shape(ctx, eye, wg, 1.6);
    ctx.save(); ctx.beginPath(); eye(); ctx.clip();
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)'; ctx.lineWidth = 0.3;
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2 + s; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 7.4, cy + Math.sin(a) * ry); ctx.quadraticCurveTo(cx + Math.cos(a + 0.3) * 5, cy + Math.sin(a + 0.3) * ry * 0.7, cx + Math.cos(a) * 3.6, cy + Math.sin(a) * ry * 0.5); ctx.stroke(); }
    const ig = ctx.createRadialGradient(cx - 0.6, cy - 0.6, 0.2, cx, cy, 3);
    ig.addColorStop(0, '#F87171'); ig.addColorStop(0.6, '#B91C1C'); ig.addColorStop(1, '#450A0A');
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.fillRect(cx - 1.8, cy - 1.8, 1.1, 1.1);
    // (the lid's shadow across the top of it)
    ctx.fillStyle = 'rgba(90, 40, 20, 0.35)'; ctx.fillRect(cx - 8, cy - ry, 16, ry * 0.6);
    ctx.restore();
  }
  if (Math.floor(t / 90) % 30 === 0) { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(118, 45); ctx.lineTo(119, 48); ctx.lineTo(122, 49); ctx.lineTo(119, 50); ctx.lineTo(118, 53); ctx.lineTo(117, 50); ctx.lineTo(114, 49); ctx.lineTo(117, 48); ctx.closePath(); ctx.fill(); }
  // The nose: broken (a kink in the bridge), the light down it, the nostrils flared
  const nose = () => { ctx.moveTo(97, 46); ctx.lineTo(99, 51); ctx.lineTo(97.5, 54); ctx.lineTo(93, 59); ctx.quadraticCurveTo(100, 62, 107, 59); ctx.lineTo(103, 54); ctx.lineTo(103, 46); ctx.closePath(); };
  skin(ctx, nose, 93, 46, 107, 62, 1.6);
  ctx.fillStyle = 'rgba(255, 240, 215, 0.7)'; ctx.fillRect(98.8, 49, 1.2, 6);
  for (const s of [-1, 1]) shape(ctx, () => ctx.ellipse(100 + s * 3.4, 59.4, 1.9, 1.2, s * 0.3, 0, Math.PI * 2), '#3B1A08', 0.4);
  // The mouth: a hard flat line; on the wind-up, the lips peel back on gritted teeth (one chipped, one gold), the gums
  if (windup > 0.1 || punching) {
    const lips = () => { ctx.moveTo(79, 61); ctx.quadraticCurveTo(100, 59, 121, 61); ctx.lineTo(120, 71); ctx.quadraticCurveTo(100, 73, 80, 71); ctx.closePath(); };
    shape(ctx, lips, '#7F1D1D', 1.8);
    shape(ctx, () => ctx.roundRect(82, 62.5, 36, 7, 1.5), '#F5F0E1', 0.8);
    ctx.fillStyle = '#E8B4A8'; ctx.fillRect(82, 62.5, 36, 1.2); ctx.fillRect(82, 68.3, 36, 1.2);
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 0.6;
    for (let k = 1; k < 8; k++) { ctx.beginPath(); ctx.moveTo(82 + k * 4.5, 62.5); ctx.lineTo(82 + k * 4.5, 69.5); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(82, 66); ctx.lineTo(118, 66); ctx.stroke();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(104.6, 62.6, 4.4, 3.3); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(105, 63, 1.2, 1);
    ctx.fillStyle = '#3F1D0B'; ctx.beginPath(); ctx.moveTo(91.5, 66); ctx.lineTo(95, 66); ctx.lineTo(93, 68); ctx.closePath(); ctx.fill();
    // (spit, strung between the teeth)
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(86, 66); ctx.quadraticCurveTo(87, 68, 88, 66); ctx.stroke();
  } else {
    ctx.strokeStyle = '#4A2410'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(84, 65); ctx.quadraticCurveTo(100, 63, 116, 65.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 220, 190, 0.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(88, 68); ctx.quadraticCurveTo(100, 69, 112, 68); ctx.stroke();
  }
};

/** One guard arm: the delt, the upper arm down to the elbow, the forearm back up, the fist by his jaw, knuckles split. */
export const guardArm = (ctx: Ctx, s: 1 | -1, t: number) => {
  const X = (x: number) => 100 + s * (x - 100);
  // (the upper arm, down from the shoulder)
  const upper = () => { ctx.moveTo(X(168), 118); ctx.bezierCurveTo(X(184), 150, X(172), 178, X(150), 172); ctx.bezierCurveTo(X(140), 152, X(146), 128, X(152), 116); ctx.closePath(); };
  bulge(ctx, upper, X(162), 145, 26);
  pores(ctx, upper, Math.min(X(140), X(184)), 116, 44, 62, 70 + s, 80);
  shadeIn(ctx, upper, Math.min(X(140), X(184)), 140, 44, 40, 0.25);
  vein(ctx, [[X(170), 128], [X(174), 140], [X(170), 154], [X(166), 166]], 1.4, 1 + Math.sin(t / 250 + s) * 0.1);
  // (the forearm, back up to the fist)
  const fore = () => { ctx.moveTo(X(150), 172); ctx.bezierCurveTo(X(160), 150, X(150), 110, X(140), 92); ctx.lineTo(X(124), 100); ctx.bezierCurveTo(X(132), 122, X(138), 150, X(136), 172); ctx.closePath(); };
  bulge(ctx, fore, X(144), 130, 24);
  pores(ctx, fore, Math.min(X(124), X(160)), 92, 36, 80, 80 + s, 80);
  vein(ctx, [[X(146), 160], [X(142), 140], [X(144), 124], [X(138), 106]], 1.6, 1 + Math.sin(t / 220 + s * 2) * 0.12);
  vein(ctx, [[X(140), 150], [X(136), 132], [X(134), 116]], 1, 1);
  // (hair on the forearm)
  ctx.strokeStyle = 'rgba(40, 20, 8, 0.5)'; ctx.lineWidth = 0.35;
  for (let k = 0; k < 18; k++) { const x = X(132 + hash(k + s) * 22), y = 110 + hash(k * 3 + s) * 56; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * 1.2, y - 2.4); ctx.stroke(); }
  // The delt: a cannonball, striated, a hard shine on it
  const delt = () => ctx.arc(X(160), 104, 24, 0, Math.PI * 2);
  bulge(ctx, delt, X(160), 104, 24, 2.6);
  for (let k = 0; k < 4; k++) groove(ctx, [X(148 + k * 6), 86, X(150 + k * 6), 96, X(152 + k * 6), 108, X(150 + k * 7), 122], 0.7, 0.3);
  bead(ctx, X(152), 96, 1.4);
  // The fist: square, the fingers rolled under, the thumb across, the knuckles split and bloody
  const fist = () => ctx.roundRect(Math.min(X(120), X(150)), 66, 30, 32, 9);
  bulge(ctx, fist, X(135), 80, 18, 2.6);
  for (let k = 0; k < 4; k++) { const y = 72 + k * 6.5; groove(ctx, [X(122), y, X(130), y + 1, X(140), y + 1, X(148), y], 1.1, 0.6); }
  const thumb = () => ctx.roundRect(Math.min(X(118), X(140)), 86, 22, 9, 4);
  skin(ctx, thumb, X(118), 86, X(140), 95, 1.6);
  ctx.fillStyle = '#F5E6D3'; ctx.fillRect(Math.min(X(119), X(124)), 88, 5, 4);
  for (let k = 0; k < 4; k++) { const x = X(124 + k * 7); shape(ctx, () => ctx.ellipse(x, 68.5, 2.6, 1.6, 0, 0, Math.PI * 2), '#C2410C', 0.5); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 1, 68, 2, 1); }
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(X(131), 70); ctx.quadraticCurveTo(X(132), 74, X(130), 78); ctx.stroke();
};

/** Meathead, square to the lens in his guard: see the top of the file. */
export const drawFaceOff = (ctx: Ctx, t: number, windup: number, punching: boolean) => {
  const breathe = 1 + Math.sin(t / 420) * 0.012;
  ctx.save();
  ctx.translate(100, 200); ctx.scale(breathe, breathe); ctx.translate(-100, -200);
  legs(ctx);
  lats(ctx);
  torso(ctx, t);
  belt(ctx);
  traps(ctx);
  neck(ctx, t, windup);
  head(ctx, t, windup, punching);
  ctx.restore();
  // His right guard (our left), and the left (the punching arm): back on the wind-up, gone mid-punch
  // (he's a lefty: the right stays up in the guard, it's the left, on our right, that draws back and goes)
  guardArm(ctx, -1, t);
  if (!punching) {
    ctx.save(); ctx.translate(windup * 14, windup * 10); ctx.translate(160, 104); ctx.rotate(windup * 14 * Math.PI / 180); ctx.translate(-160, -104);
    guardArm(ctx, 1, t);
    ctx.restore();
  } else {
    // (the shoulder driving through, the arm already gone at the lens)
    bulge(ctx, () => ctx.arc(148, 106, 30, 0, Math.PI * 2), 148, 106, 30, 2.8);
    for (let k = 0; k < 5; k++) groove(ctx, [164 - k * 7, 84, 162 - k * 7, 98, 160 - k * 7, 112, 162 - k * 8, 128], 0.8, 0.35);
  }
};
