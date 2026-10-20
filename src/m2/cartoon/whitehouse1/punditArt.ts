// The pundits, drawn the show's way at the land bosses' grade (Stupid Dad's and Piper's: every material its own ramp,
// lit, itself, shade, deep, in stepped bands with dithered seams; and over it the show's fat black outline, because it's
// a Saturday morning cartoon): big caricature heads on little bodies, played straight. Feet at the origin, facing right
// (in the fight the engine turns them round; the scene's and the reel's drawn in the world, turned here).
//
//   PEROT    a little wiry man in a gray double-breasted suit (a pocket square), a white shirt, a blue tie with a
//            clip, a huge square head with a buzz cut gone thin on top, a grin full of teeth, beady eyes under arched
//            brows, a big pink-tipped nose and HUGE jug ears (veined, flapping like wings as he floats down on them); a
//            pointer stick in one hand; a pie chart held up over his head (the tell)
//   FALWELL  a big round man in a navy three-piece suit (a gold watch chain, a cross on the lapel), a red tie, a
//            round head with jowls and a double chin, a silver pompadour swooped back, square glasses; a black Bible
//            (gilt edges, a ribbon) in one hand, a little oak pulpit under the other arm (set down and the Bible
//            thumped on it: the tell); a finger up to heaven when he preaches at the cat
// Reeling (his last words): spinning, stars round his head. The bits his costume's flung off in out of his puff, and
// what he throws.

import type { Ctx } from '../kit';
import { INK, mix } from '../kit';
import type { Pundit, PunditId, PunditThrow, PuffBit } from './state';
import { star } from './poof';
import { dith } from '../amphi/paint';

interface SimView { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; kind: PunditThrow['kind'] | null }

/** light, base, shade, deep */
type Rp = readonly [string, string, string, string];
const rp = (col: string): Rp => [mix(col, '#FFFFFF', 0.3), col, mix(col, INK, 0.22), mix(col, INK, 0.44)];
const SKIN: Rp = ['#FFE4CE', '#F6C9A8', '#DFA484', '#BC7C60'];
const SKIN_F: Rp = ['#FFE0CC', '#F6C3AA', '#E0A088', '#C07A62'];
const EAR: Rp = ['#FFD2C0', '#F5B7A0', '#E08E7A', '#BA6450'];
const GRAY: Rp = rp('#9CA3AF');
const NAVY_S: Rp = ['#4A5874', '#26324A', '#1A2438', '#10182A'];
const BLUE: Rp = rp('#2F6BE6');
const RED: Rp = rp('#DC2626');
const SHIRT: Rp = ['#FFFFFF', '#F2F2F8', '#D6D6E4', '#ACACC2'];
const SHOE: Rp = ['#4A4E5E', '#22242E', '#16171E', '#0C0C12'];
const SILVER: Rp = ['#FFFFFF', '#E6E8EE', '#C4C8D2', '#9CA2B0'];
const OAKP: Rp = ['#D2985A', '#AE6E34', '#864E22', '#5E3416'];
const BOOK: Rp = ['#4A4A58', '#22222C', '#16161E', '#0A0A10'];

const BIG = 4000;
/** A part: filled in its ramp, lit down the left, shaded then deep down the right (dithered seams), inked fat. */
const part = (c: Ctx, path: () => void, r: Rp, x0: number, x1: number, lw = 2.2, flip = false) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const w = x1 - x0;
  const band = (a: number, b: number, col: string | CanvasPattern) => { c.fillStyle = col; const l = flip ? x1 - b * w : x0 + a * w; c.fillRect(l, -BIG, (b - a) * w + 1, BIG * 2); };
  band(-0.1, 0.2, r[0]); band(0.2, 0.27, dith(c, r[0]));
  band(0.6, 0.67, dith(c, r[2])); band(0.67, 1.1, r[2]);
  band(0.84, 0.9, dith(c, r[3])); band(0.9, 1.1, r[3]);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
/** A part lit from above (a belly, a jowl, a cushion). */
const partTop = (c: Ctx, path: () => void, r: Rp, y0: number, y1: number, lw = 2.2) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0;
  c.fillStyle = r[0]; c.fillRect(-BIG, y0 - 4, BIG * 2, h * 0.22 + 4);
  c.fillStyle = dith(c, r[0]); c.fillRect(-BIG, y0 + h * 0.22, BIG * 2, Math.max(1, h * 0.08));
  c.fillStyle = dith(c, r[2]); c.fillRect(-BIG, y0 + h * 0.6, BIG * 2, Math.max(1, h * 0.08));
  c.fillStyle = r[2]; c.fillRect(-BIG, y0 + h * 0.68, BIG * 2, h + 4);
  c.fillStyle = r[3]; c.fillRect(-BIG, y0 + h * 0.9, BIG * 2, h + 4);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
const flat = (c: Ctx, path: () => void, fill: string, w = 1.6) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); if (w > 0) { c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); } };
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
/** A limb: a tapered tube, in its ramp, inked. */
const limb = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, r: Rp, wb = w * 0.85) => {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ra = w / 2, rb = wb / 2;
  const path = () => { c.moveTo(ax + nx * ra, ay + ny * ra); c.lineTo(bx + nx * rb, by + ny * rb); c.arc(bx, by, rb, Math.atan2(ny, nx), Math.atan2(-ny, -nx)); c.lineTo(ax - nx * ra, ay - ny * ra); c.arc(ax, ay, ra, Math.atan2(-ny, -nx), Math.atan2(ny, nx)); };
  part(c, path, r, Math.min(ax, bx) - ra, Math.max(ax, bx) + ra, 2);
};
const hand = (c: Ctx, x: number, y: number, r = 3.8, skin: Rp = SKIN) => {
  part(c, () => c.arc(x, y, r, 0, Math.PI * 2), skin, x - r, x + r, 1.8);
  px(c, x - r * 0.5, y - r * 0.6, 1.5, 1.5, skin[0]);
};
const shoe = (c: Ctx, x: number, y: number, w = 11) => {
  partTop(c, () => c.roundRect(x - 3, y - 5, w, 5.5, [2, 3, 1, 1]), SHOE, y - 5, y, 1.8);
  px(c, x - 1, y - 4, 4, 1, '#8A8EA0');
};

/** (the show's other people are painted the same way: Chelsea, the animator's hand) */
export { part as toonPart, partTop as toonTop, flat as toonFlat, limb as toonLimb, rp as toonRamp, type Rp };

type Pose = 'stand' | 'talk' | 'tell' | 'throw' | 'air' | 'glide' | 'reel' | 'land';
const poseOf = (q: Pundit, s: SimView, reel: number): Pose => {
  if (reel > 0) return 'reel';
  if (s.air) return s.vy > 0 && q.id === 'perot' ? 'glide' : 'air';
  if (q.act === 'wind' || q.act === 'second') return 'tell';
  if (q.act === 'after' && q.actT < 12) return 'throw';
  if (q.said) return 'talk';
  return 'stand';
};

/** A pie chart (its middle at (x, y), radius r, turned a; `squash` across for the spin): a stepped rim, wedges each lit
 *  on their upper side, a shine. */
export const pieChart = (c: Ctx, x: number, y: number, r: number, a: number, squash = 1) => {
  c.save(); c.translate(x, y); c.scale(squash, 1);
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, r + 1.4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C8C8D6'; c.beginPath(); c.arc(0, 1, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(0, 0, r - 0.5, 0, Math.PI * 2); c.fill();
  c.rotate(a);
  const cuts = [0, 0.38, 0.62, 0.83, 1], cols = [['#F05A5A', '#C83A3A'], ['#3B82F6', '#2A62C6'], ['#FACC15', '#D8A808'], ['#22C55E', '#16A04A']];
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r - 2, cuts[i] * Math.PI * 2, cuts[i + 1] * Math.PI * 2); c.closePath(); c.fillStyle = cols[i][0]; c.fill();
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, (r - 2) * 0.55, cuts[i] * Math.PI * 2, cuts[i + 1] * Math.PI * 2); c.closePath(); c.fillStyle = cols[i][1]; c.fill();
  }
  c.strokeStyle = INK; c.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const t = cuts[i] * Math.PI * 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t) * (r - 1), Math.sin(t) * (r - 1)); c.stroke(); }
  c.rotate(-a);
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(-r * 0.55, -r * 0.6, r * 0.35, 2); c.fillRect(-r * 0.62, -r * 0.4, 2, r * 0.25);
  c.restore();
};
const bible = (c: Ctx, x: number, y: number, a: number, s = 1) => {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  part(c, () => c.roundRect(-8, -10, 16, 20, 1.5), BOOK, -8, 8, 2);
  px(c, 6, -9, 2, 18, '#F2D06A'); px(c, 7, -9, 1, 18, '#FFF0A8');
  px(c, -1, -6, 2, 10, '#EAB308'); px(c, -4, -3, 8, 2, '#EAB308'); px(c, -1, -6, 1, 4, '#FFF0A8');
  px(c, -3, 9, 2, 5, '#DC2626'); px(c, -3, 13, 1, 1, '#7A0E1C');
  c.restore();
};
const pulpit = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  part(c, () => { c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(8, -26); c.lineTo(-8, -26); c.closePath(); }, OAKP, -10, 10, 2);
  partTop(c, () => { c.moveTo(-13, -26); c.lineTo(13, -26); c.lineTo(11, -32); c.lineTo(-11, -32); c.closePath(); }, OAKP, -32, -26, 2);
  px(c, -1.5, -20, 3, 10, '#FDE68A'); px(c, -4.5, -17, 9, 2.5, '#FDE68A'); px(c, -1.5, -20, 1, 10, '#FFF8D0');
  px(c, -8, -4, 16, 2, OAKP[3]);
  c.restore();
};
/** Stars spinning round a reeling head. */
const dizzy = (c: Ctx, y: number, r: number, f: number) => { for (let i = 0; i < 4; i++) { const a = f * 0.22 + (i / 4) * Math.PI * 2; star(c, Math.cos(a) * r, y + Math.sin(a) * 6, 5, i % 2 ? '#FDE047' : '#FFFFFF'); } };

// ---------------------------------------------------------------------------------------------------------------
// Perot

const perotHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number, flap = 0) => {
  // (the ears: huge pink jugs out both sides, veined, a lit rim; flapping when he floats)
  for (const s of [-1, 1]) {
    c.save(); c.translate(hx + s * 17, hy + 2); c.rotate(s * (0.15 + flap));
    part(c, () => c.ellipse(s * 9, 0, 12, 16, 0, 0, Math.PI * 2), EAR, s * 9 - 12, s * 9 + 12, 2.4, s < 0);
    part(c, () => c.ellipse(s * 9, 1, 6, 10, 0, 0, Math.PI * 2), [EAR[2], EAR[2], EAR[3], mix(EAR[3], INK, 0.3)], s * 9 - 6, s * 9 + 6, 1.2, s < 0);
    c.strokeStyle = '#D0707A'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(s * 13, -8); c.quadraticCurveTo(s * 16, 0, s * 14, 8); c.stroke();
    px(c, s * 9 - 5, -12, 3, 2, EAR[0]);
    c.restore();
  }
  // (the head: big, square jawed, stepped across; the jaw's shadow)
  part(c, () => c.roundRect(hx - 17, hy - 20, 34, 38, [14, 14, 12, 12]), SKIN, hx - 17, hx + 17, 2.6);
  c.fillStyle = dith(c, SKIN[2]); c.fillRect(hx - 12, hy + 12, 26, 4);
  // (the buzz cut, thin on top: stubble sides in steps, a few stragglers over the shine)
  for (const [x0, w] of [[hx - 15, 5], [hx + 10, 5]] as [number, number][]) { px(c, x0, hy - 18, w, 13, '#8A909E'); px(c, x0 + (x0 < hx ? 0 : w - 2), hy - 18, 2, 13, '#6A707E'); c.fillStyle = dith(c, '#B8BEC8'); c.fillRect(x0, hy - 18, w, 13); }
  for (let k = 0; k < 6; k++) px(c, hx - 9 + k * 3.5, hy - 19, 1.4, 3, '#8A909E');
  px(c, hx - 8, hy - 17, 10, 2, '#FFF2E4'); px(c, hx - 6, hy - 15, 4, 1, '#FFFFFF');
  if (pose === 'reel') {
    c.strokeStyle = INK; c.lineWidth = 2.2;
    for (const ex of [-6, 7]) { c.beginPath(); c.moveTo(hx + ex - 3, hy - 6); c.lineTo(hx + ex + 3, hy); c.moveTo(hx + ex + 3, hy - 6); c.lineTo(hx + ex - 3, hy); c.stroke(); }
  } else {
    // (beady eyes, white, a glint; the brows arched up, sly)
    for (const ex of [-6, 7]) { flat(c, () => c.ellipse(hx + ex, hy - 3, 3.4, 3.8, 0, 0, Math.PI * 2), '#FFFFFF', 1.6); px(c, hx + ex - 2, hy - 1, 4, 1, '#D6D6E4'); c.fillStyle = INK; c.beginPath(); c.arc(hx + ex + 1, hy - 3, 1.7, 0, Math.PI * 2); c.fill(); px(c, hx + ex + 1, hy - 4.5, 1, 1, '#FFFFFF'); }
    const up = pose === 'tell' || pose === 'talk' ? 2 : 0;
    flat(c, () => { c.moveTo(hx - 11, hy - 10 - up); c.quadraticCurveTo(hx - 6, hy - 14 - up, hx - 2, hy - 10); c.lineTo(hx - 3, hy - 9); c.quadraticCurveTo(hx - 6, hy - 12 - up, hx - 10, hy - 9 - up); c.closePath(); }, '#6B7280', 1);
    flat(c, () => { c.moveTo(hx + 3, hy - 10); c.quadraticCurveTo(hx + 7, hy - 15 - up, hx + 12, hy - 11 - up); c.lineTo(hx + 11, hy - 10 - up); c.quadraticCurveTo(hx + 7, hy - 13 - up, hx + 4, hy - 9); c.closePath(); }, '#6B7280', 1);
  }
  // (the nose: big, the tip pink, stepped)
  part(c, () => c.ellipse(hx + 12, hy + 3, 5.5, 4.4, 0.2, 0, Math.PI * 2), ['#FFD2C0', '#F2B08E', '#E08A72', '#C06A58'], hx + 6, hx + 18, 2);
  px(c, hx + 10, hy + 1, 2, 1, '#FFFFFF');
  // (the mouth: a grin full of teeth; talking it flaps; the tell, a gleeful O; the dimples)
  const open = pose === 'talk' ? [3, 7, 4, 8][(f >> 2) % 4] : pose === 'tell' || pose === 'reel' ? 7 : pose === 'throw' ? 6 : 4;
  flat(c, () => c.roundRect(hx - 9, hy + 8, 20, open + 2, 4), '#5A0E14', 2);
  px(c, hx - 6, hy + 8 + open - 1, 14, 2, '#C8344A');
  px(c, hx - 7, hy + 9, 16, Math.min(3, open), '#FFFFFF'); px(c, hx - 7, hy + 9 + Math.min(3, open) - 1, 16, 1, '#D6D6E4');
  c.fillStyle = INK; for (let k = -4; k <= 6; k += 3.4) c.fillRect(hx + k, hy + 9, 0.8, Math.min(3, open));
  c.strokeStyle = SKIN[3]; c.lineWidth = 1; c.beginPath(); c.arc(hx - 11, hy + 10, 2, -0.5, 1.4); c.arc(hx + 13, hy + 10, 2, 1.7, 3.6); c.stroke();
};
const paintPerot = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel);
  const flap = pose === 'glide' ? Math.sin(f * 0.9) * 0.55 : pose === 'air' ? -0.2 : 0;
  // (legs: skinny gray trouser legs, creased, shiny black shoes)
  const air = pose === 'air' || pose === 'glide';
  const lA = air ? [-6, -8] : pose === 'tell' ? [-7, 0] : [-4, 0], lB = air ? [8, -12] : pose === 'tell' ? [8, 0] : [5, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.4, -30, lx, ly - 4, 6.5, GRAY, 5.5); shoe(c, lx, ly); }
  // (the far arm: the pointer stick; up with the pie chart in the tell)
  const far: [number, number] = pose === 'tell' ? [-6, -84] : pose === 'glide' ? [-20, -54 + Math.sin(f * 0.9) * 6] : pose === 'throw' ? [-16, -52] : [-14, -36];
  limb(c, -6, -56, far[0], far[1], 6, [GRAY[1], GRAY[2], GRAY[3], mix(GRAY[3], INK, 0.3)]); hand(c, far[0], far[1]);
  if (pose !== 'tell') { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(far[0], far[1]); c.lineTo(far[0] - 4, far[1] - 26); c.stroke(); c.strokeStyle = '#D6A86A'; c.lineWidth = 1.6; c.stroke(); c.strokeStyle = '#F2D29A'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(far[0] - 0.5, far[1] - 2); c.lineTo(far[0] - 4.5, far[1] - 24); c.stroke(); flat(c, () => c.arc(far[0] - 4, far[1] - 27, 1.8, 0, Math.PI * 2), '#1A1A22', 1); c.lineCap = 'butt'; }
  // (the suit: a narrow double-breasted gray jacket in steps, lapels, two rows of buttons, a pocket square)
  part(c, () => { c.moveTo(-10, -30); c.lineTo(-12, -58); c.quadraticCurveTo(0, -62, 12, -58); c.lineTo(10, -30); c.closePath(); }, GRAY, -12, 12, 2.4);
  flat(c, () => { c.moveTo(-4, -60); c.lineTo(5, -60); c.lineTo(0.5, -44); c.closePath(); }, SHIRT[1], 1.2);
  flat(c, () => { c.moveTo(-1.5, -58); c.lineTo(2.5, -58); c.lineTo(3, -42); c.lineTo(0.5, -39); c.lineTo(-2, -42); c.closePath(); }, BLUE[1], 1.2);
  px(c, -1, -57, 1, 14, BLUE[0]); px(c, -2, -50, 6, 1.5, '#E8C860');
  flat(c, () => { c.moveTo(-5, -60); c.lineTo(-9, -54); c.lineTo(-2, -46); c.closePath(); }, GRAY[0], 1);
  flat(c, () => { c.moveTo(6, -60); c.lineTo(10, -54); c.lineTo(3, -46); c.closePath(); }, GRAY[2], 1);
  for (const by of [-42, -36]) for (const bx of [-5, 5]) { flat(c, () => c.arc(bx, by, 1.2, 0, Math.PI * 2), '#2A2A36', 0.6); }
  flat(c, () => { c.moveTo(-9, -52); c.lineTo(-5, -55); c.lineTo(-4, -51); c.closePath(); }, '#FFFFFF', 0.8);
  px(c, -10, -36, 20, 2, GRAY[3]);
  perotHead(c, 2, -80, pose, f, flap);
  // (the near arm: the pie chart up in the tell, flung out in the throw, a thumb up talking)
  const near: [number, number] = pose === 'tell' ? [10, -96] : pose === 'throw' ? [26, -58] : pose === 'talk' ? [20, -64 + ((f >> 3) % 2) * 3] : pose === 'glide' ? [24, -56 - Math.sin(f * 0.9) * 6] : [14, -36];
  limb(c, 6, -56, near[0], near[1], 6, GRAY); hand(c, near[0], near[1]);
  if (pose === 'talk') { flat(c, () => c.roundRect(near[0] - 1, near[1] - 8, 3.4, 6, 1.5), SKIN[1], 1.2); }
  if (pose === 'tell') pieChart(c, near[0] - 4, near[1] - 14, 14, f * 0.05);
  if (pose === 'reel') dizzy(c, -110, 28, f);
};

// ---------------------------------------------------------------------------------------------------------------
// Falwell

const falwellHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number) => {
  // (the ears, the round head in steps, the jowls hanging, the double chin)
  for (const s of [-1, 1]) part(c, () => c.ellipse(hx + s * 16, hy + 1, 4, 6, 0, 0, Math.PI * 2), SKIN_F, hx + s * 16 - 4, hx + s * 16 + 4, 1.8);
  const head = () => { c.moveTo(hx - 16, hy - 6); c.quadraticCurveTo(hx - 16, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 17, hy - 22, hx + 16, hy - 6); c.quadraticCurveTo(hx + 20, hy + 16, hx + 4, hy + 20); c.quadraticCurveTo(hx - 12, hy + 21, hx - 17, hy + 10); c.closePath(); };
  part(c, head, SKIN_F, hx - 17, hx + 20, 2.6);
  c.save(); c.beginPath(); head(); c.clip();
  c.fillStyle = dith(c, SKIN_F[2]); c.fillRect(hx - 14, hy + 9, 30, 3);
  c.fillStyle = SKIN_F[2]; c.fillRect(hx - 14, hy + 14, 34, 8);
  c.fillStyle = '#F2A8A0'; c.globalAlpha = 0.6; c.beginPath(); c.ellipse(hx + 10, hy + 6, 4, 2.5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  c.restore();
  c.strokeStyle = '#C07A62'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 10, hy + 12); c.quadraticCurveTo(hx + 2, hy + 18, hx + 13, hy + 11); c.stroke();
  // (the silver pompadour: swept back in a swoop, combed lines, a shine)
  const hair = () => { c.moveTo(hx - 17, hy - 4); c.quadraticCurveTo(hx - 20, hy - 28, hx + 2, hy - 27); c.quadraticCurveTo(hx + 19, hy - 26, hx + 16, hy - 12); c.quadraticCurveTo(hx + 4, hy - 20, hx - 8, hy - 14); c.quadraticCurveTo(hx - 12, hy - 10, hx - 17, hy - 4); c.closePath(); };
  partTop(c, hair, SILVER, hy - 28, hy - 6, 2);
  c.strokeStyle = '#9CA2B0'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(hx - 12 + k * 6, hy - 22); c.quadraticCurveTo(hx - 2 + k * 6, hy - 26, hx + 4 + k * 4, hy - 18); c.stroke(); }
  px(c, hx - 6, hy - 25, 8, 1.5, '#FFFFFF');
  // (the square glasses, the eyes behind them; X'd out reeling)
  for (const ex of [-5, 8]) {
    flat(c, () => c.roundRect(hx + ex - 5, hy - 7, 10, 8, 2), 'rgba(219, 234, 254, 0.9)', 2);
    if (pose === 'reel') { c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + ex - 2.5, hy - 5); c.lineTo(hx + ex + 2.5, hy - 1); c.moveTo(hx + ex + 2.5, hy - 5); c.lineTo(hx + ex - 2.5, hy - 1); c.stroke(); }
    else { c.fillStyle = INK; c.beginPath(); c.arc(hx + ex + 1, hy - 3, 1.6, 0, Math.PI * 2); c.fill(); px(c, hx + ex + 1, hy - 4.5, 1, 1, '#FFFFFF'); }
    px(c, hx + ex - 4, hy - 6, 3, 1, '#FFFFFF');
  }
  c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, hy - 4); c.lineTo(hx + 3, hy - 4); c.stroke();
  const brow = pose === 'tell' || pose === 'talk' ? -1.5 : 0;
  px(c, hx - 10, hy - 11 + brow, 9, 2, '#9CA2B0'); px(c, hx + 4, hy - 11 + brow, 9, 2, '#9CA2B0');
  // (the nose; the mouth: preaching wide, or a pursed frown)
  part(c, () => c.ellipse(hx + 9, hy + 3, 4.5, 3.6, 0, 0, Math.PI * 2), ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], hx + 4, hx + 14, 1.8);
  const open = pose === 'talk' ? [3, 7, 5, 8][(f >> 2) % 4] : pose === 'tell' || pose === 'throw' ? 7 : pose === 'reel' ? 8 : 0;
  if (open > 0) { flat(c, () => c.ellipse(hx + 4, hy + 11, 7, open / 2 + 1, 0, 0, Math.PI * 2), '#5A0E14', 1.8); px(c, hx - 1, hy + 9, 10, 1.6, '#FFFFFF'); px(c, hx + 1, hy + 11 + open / 2 - 1, 6, 1.4, '#C8344A'); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 4, hy + 15, 5, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
};
const paintFalwell = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel);
  // (legs: stout navy trouser legs, black shoes)
  const lA = pose === 'air' ? [-7, -10] : [-7, 0], lB = pose === 'air' ? [9, -14] : [8, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 10, NAVY_S, 8.5); shoe(c, lx, ly, 14); }
  // (the far arm: the pulpit under it; set down in front in the tell)
  const far: [number, number] = pose === 'tell' ? [16, -40] : pose === 'air' ? [-24, -70] : [-16, -44];
  if (pose !== 'tell' && pose !== 'air' && pose !== 'reel') pulpit(c, -20, -24, -0.25);
  limb(c, -8, -66, far[0], far[1], 9, [NAVY_S[1], NAVY_S[2], NAVY_S[3], '#080C18']); hand(c, far[0], far[1], 4.4, SKIN_F);
  // (the body: a big round navy three-piece in steps, the vest, the white shirt, the red tie, a gold watch chain, a
  // gold cross on the lapel)
  const body = () => { c.moveTo(-15, -30); c.quadraticCurveTo(-22, -52, -14, -70); c.quadraticCurveTo(0, -76, 14, -70); c.quadraticCurveTo(24, -50, 16, -30); c.closePath(); };
  part(c, body, NAVY_S, -22, 24, 2.6);
  flat(c, () => { c.moveTo(-8, -68); c.lineTo(9, -68); c.quadraticCurveTo(14, -48, 8, -36); c.lineTo(-6, -36); c.quadraticCurveTo(-12, -50, -8, -68); c.closePath(); }, '#2E3A56', 1.2);
  for (const by of [-60, -52, -44]) flat(c, () => c.arc(1, by, 1.1, 0, Math.PI * 2), '#C8A030', 0.6);
  flat(c, () => { c.moveTo(-5, -72); c.lineTo(6, -72); c.lineTo(0.5, -52); c.closePath(); }, SHIRT[1], 1.4);
  flat(c, () => { c.moveTo(-2, -70); c.lineTo(3, -70); c.lineTo(4, -50); c.lineTo(0.5, -46); c.lineTo(-3, -50); c.closePath(); }, RED[1], 1.2);
  px(c, -1, -69, 1, 16, RED[0]); px(c, 1.5, -60, 1.5, 10, RED[2]);
  c.strokeStyle = '#E8C040'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -44); c.quadraticCurveTo(2, -38, 10, -44); c.stroke();
  px(c, -12, -64, 2, 6, '#FACC15'); px(c, -14, -62, 6, 2, '#FACC15'); px(c, -12, -64, 1, 2, '#FFF0A8');
  c.fillStyle = dith(c, NAVY_S[3]); c.beginPath(); c.ellipse(2, -44, 16, 4, 0, 0, Math.PI); c.fill();
  // (the pulpit set down in front of him, the Bible thumped on it)
  if (pose === 'tell') pulpit(c, 30, 0, 0);
  falwellHead(c, 2, -88, pose, f);
  // (the near arm: the Bible; thumped on the pulpit in the tell; flung in the throw; up to heaven preaching)
  const thump = pose === 'tell' ? ((f >> 3) % 2) * 6 : 0;
  const near: [number, number] = pose === 'tell' ? [28, -46 + thump] : pose === 'throw' ? [30, -70] : pose === 'talk' ? [14, -108] : pose === 'air' ? [24, -76] : [18, -46];
  limb(c, 8, -66, near[0], near[1], 9, NAVY_S); hand(c, near[0], near[1], 4.4, SKIN_F);
  if (pose === 'talk') { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(near[0], near[1]); c.lineTo(near[0] + 1, near[1] - 8); c.stroke(); c.strokeStyle = SKIN_F[1]; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; bible(c, -20, -50, 0.1, 0.9); }
  else if (pose !== 'throw') bible(c, near[0] + 2, near[1] - 4, pose === 'tell' ? 1.5 : 0.1);
  if (pose === 'tell' && thump) { for (let k = 0; k < 3; k++) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(40 + k * 4, -36 - k * 5); c.lineTo(46 + k * 5, -40 - k * 6); c.stroke(); } }
  if (pose === 'reel') dizzy(c, -122, 30, f);
};

/** A pundit, feet at the origin (facing right) in the fight; in the world (`world`: at his sim's feet, turned his way). */
export const drawPundit = (c: Ctx, id: PunditId, q: Pundit, s: SimView, f: number, reel: number, _k: number, world = false) => {
  c.save();
  if (world) { c.translate(Math.round(s.x), Math.round(s.y)); c.scale(s.facing, 1); }
  // (a ground shadow under him, dithered, when he's on his feet)
  if (!s.air && world) { c.fillStyle = dith(c, INK); c.beginPath(); c.ellipse(2, 0, 20, 3, 0, 0, Math.PI * 2); c.fill(); }
  if (reel > 0) { c.translate(0, -50); c.rotate(Math.sin(f * 0.5) * 0.3 * reel); c.translate(0, 50); }
  if (q.flash > 0) c.filter = 'brightness(1.8)';
  if (id === 'perot') paintPerot(c, q, s, f, reel); else paintFalwell(c, q, s, f, reel);
  c.restore();
};

/** What they throw (world). */
export const drawPunditThrow = (c: Ctx, t: PunditThrow) => {
  switch (t.kind) {
    case 'pie': pieChart(c, t.x, t.y, 11, t.spin, Math.abs(Math.cos(t.t * 0.15)) * 0.6 + 0.4); break;
    case 'slice': {
      c.save(); c.translate(t.x, t.y); c.rotate(t.spin);
      const col = ['#F05A5A', '#3B82F6', '#FACC15'][Math.abs(Math.round(t.vx * 10)) % 3];
      flat(c, () => { c.moveTo(0, 0); c.arc(0, 0, 10, -0.5, 0.6); c.closePath(); }, col, 1.8);
      flat(c, () => { c.moveTo(0, 0); c.arc(0, 0, 5.5, -0.5, 0.6); c.closePath(); }, mix(col, INK, 0.2), 0);
      c.restore(); break;
    }
    case 'bible': bible(c, t.x, t.y, t.spin); break;
    case 'plate': {
      // (a brass collection plate, flat, spinning, its felt bottom, coins)
      c.save(); c.translate(t.x, t.y);
      const sq = 3.5 + Math.abs(Math.sin(t.spin)) * 1.5;
      flat(c, () => c.ellipse(0, 0, 11, sq, 0, 0, Math.PI * 2), '#B88A1C', 2);
      c.fillStyle = '#7A1E2E'; c.beginPath(); c.ellipse(0, -0.5, 7, sq * 0.55, 0, 0, Math.PI * 2); c.fill();
      px(c, -8, -sq + 1, 6, 1, '#FFF0A8');
      c.fillStyle = '#F2C84A'; c.fillRect(-3, -1, 2, 1.5); c.fillRect(2, 0, 2, 1.5);
      c.restore(); break;
    }
  }
};

/** A bit of a pundit's costume flung out of his puff (world). */
export const drawPuffBit = (c: Ctx, b: PuffBit) => {
  c.save(); c.translate(b.x, b.y); c.rotate(b.rot);
  switch (b.what) {
    case 'ears': for (const s of [-1, 1]) { part(c, () => c.ellipse(s * 12, 0, 11, 15, s * 0.2, 0, Math.PI * 2), EAR, s * 12 - 11, s * 12 + 11, 2.2, s < 0); flat(c, () => c.ellipse(s * 12, 1, 5, 9, s * 0.2, 0, Math.PI * 2), EAR[2], 1.2); } break;
    case 'perothead': {
      // (the rubber caricature head, empty, its eyeholes dark, its neck hole ragged)
      part(c, () => c.roundRect(-16, -18, 32, 36, [13, 13, 11, 11]), SKIN, -16, 16, 2.4);
      c.fillStyle = INK; c.fillRect(-9, -6, 6, 5); c.fillRect(4, -6, 6, 5);
      flat(c, () => c.roundRect(-8, 8, 18, 5, 3), '#5A0E14', 1.6); px(c, -6, 9, 14, 2, '#FFFFFF');
      px(c, -14, -16, 5, 10, '#8A909E'); px(c, 9, -16, 5, 10, '#8A909E');
      for (let k = -12; k < 12; k += 4) px(c, k, 17, 3, 2, SKIN[3]);
      break;
    }
    case 'chart': pieChart(c, 0, 0, 13, 0); break;
    case 'pointer': c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.stroke(); c.strokeStyle = '#D6A86A'; c.lineWidth = 1.8; c.stroke(); c.lineCap = 'butt'; flat(c, () => c.arc(17, 0, 2, 0, Math.PI * 2), '#1A1A22', 1); break;
    case 'falhead': {
      part(c, () => c.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2), SKIN_F, -17, 17, 2.4);
      partTop(c, () => { c.moveTo(-17, -4); c.quadraticCurveTo(-18, -24, 2, -24); c.quadraticCurveTo(18, -24, 16, -10); c.quadraticCurveTo(0, -16, -17, -4); c.closePath(); }, SILVER, -24, -4, 2);
      c.fillStyle = INK; c.fillRect(-9, -6, 6, 5); c.fillRect(5, -6, 6, 5);
      for (let k = -12; k < 12; k += 4) px(c, k, 17, 3, 2, SKIN_F[3]);
      break;
    }
    case 'bible': bible(c, 0, 0, 0, 1.2); break;
    case 'pulpit': pulpit(c, 0, 14, 0); break;
    case 'glasses': for (const s of [-1, 1]) flat(c, () => c.roundRect(s * 7 - 5, -4, 10, 8, 2), 'rgba(219, 234, 254, 0.9)', 2); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, 0); c.lineTo(2, 0); c.stroke(); px(c, -10, -3, 3, 1, '#FFFFFF'); break;
  }
  c.restore();
};
