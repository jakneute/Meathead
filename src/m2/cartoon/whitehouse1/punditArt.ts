// The pundits, drawn the show's way (Saturday morning caricatures: big heads on little bodies, flat bright color, fat
// black outlines): the impersonators' costumes, played straight. Feet at the origin, facing right (in the fight the
// engine turns them round; the scene's and the reel's drawn in the world, turned here).
//
//   PEROT    a little wiry man in a gray suit, a blue tie, a huge head with a buzz cut gone thin on top, a grin full of
//            teeth, beady eyes and HUGE jug ears (flapping like wings as he floats down on them); a pointer stick in
//            one hand; a pie chart held up over his head (the tell)
//   FALWELL  a big round man in a navy suit, a red tie, a round head with jowls, a silver swoop of hair, square
//            glasses; a black Bible in one hand, a little wooden pulpit under the other arm (set down and the Bible
//            thumped on it: the tell); a finger up to heaven when he preaches at the cat
// Reeling (his last words): spinning, stars round his head. The bits his costume's flung off in out of his puff, and
// what he throws.

import type { Ctx } from '../kit';
import { INK } from '../kit';
import type { Pundit, PunditId, PunditThrow, PuffBit } from './state';
import { star } from './poof';

interface SimView { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; kind: PunditThrow['kind'] | null }

const ink = (c: Ctx, path: () => void, fill: string, w = 2.4) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const limb = (c: Ctx, ax: number, ay: number, bx: number, by: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.lineCap = 'butt';
};
const hand = (c: Ctx, x: number, y: number, r = 3.6) => ink(c, () => c.arc(x, y, r, 0, Math.PI * 2), '#F2C6A0', 1.8);

type Pose = 'stand' | 'talk' | 'tell' | 'throw' | 'air' | 'glide' | 'reel' | 'land';
const poseOf = (q: Pundit, s: SimView, reel: number): Pose => {
  if (reel > 0) return 'reel';
  if (s.air) return s.vy > 0 && q.id === 'perot' ? 'glide' : 'air';
  if (q.act === 'wind' || q.act === 'second') return 'tell';
  if (q.act === 'after' && q.actT < 12) return 'throw';
  if (q.said) return 'talk';
  return 'stand';
};

/** A pie chart (its middle at (x, y), radius r, turned a; `squash` across for the spin). */
export const pieChart = (c: Ctx, x: number, y: number, r: number, a: number, squash = 1) => {
  c.save(); c.translate(x, y); c.scale(squash, 1); c.rotate(a);
  ink(c, () => c.arc(0, 0, r, 0, Math.PI * 2), '#F8FAFC', 2.2);
  const cuts = [0, 0.38, 0.62, 0.83, 1], cols = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E'];
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r - 1.5, cuts[i] * Math.PI * 2, cuts[i + 1] * Math.PI * 2); c.closePath(); c.fillStyle = cols[i]; c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const t = cuts[i] * Math.PI * 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t) * r, Math.sin(t) * r); c.stroke(); }
  c.restore();
};
const bible = (c: Ctx, x: number, y: number, a: number, s = 1) => {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  ink(c, () => c.roundRect(-8, -10, 16, 20, 1.5), '#18181B', 2);
  c.fillStyle = '#FDE68A'; c.fillRect(6, -9, 2, 18);
  c.fillStyle = '#EAB308'; c.fillRect(-1, -6, 2, 10); c.fillRect(-4, -3, 8, 2);
  c.fillStyle = '#DC2626'; c.fillRect(-3, 9, 2, 4);
  c.restore();
};
const pulpit = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  ink(c, () => { c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(8, -26); c.lineTo(-8, -26); c.closePath(); }, '#92400E', 2);
  ink(c, () => { c.moveTo(-13, -26); c.lineTo(13, -26); c.lineTo(11, -32); c.lineTo(-11, -32); c.closePath(); }, '#B45309', 2);
  c.fillStyle = '#FDE68A'; c.fillRect(-1.5, -20, 3, 10); c.fillRect(-4.5, -17, 9, 2.5);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Perot

const perotHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number, flap = 0) => {
  // (the ears: huge pink jugs out both sides; flapping when he floats)
  for (const s of [-1, 1]) {
    c.save(); c.translate(hx + s * 17, hy + 2); c.rotate(s * (0.15 + flap));
    ink(c, () => c.ellipse(s * 9, 0, 12, 16, 0, 0, Math.PI * 2), '#F5B7A0', 2.4);
    ink(c, () => c.ellipse(s * 9, 1, 6, 10, 0, 0, Math.PI * 2), '#E28A78', 1.4);
    c.restore();
  }
  // (the head: big, square jawed)
  ink(c, () => c.roundRect(hx - 17, hy - 20, 34, 38, [14, 14, 12, 12]), '#F6C9A8', 2.6);
  // (the buzz cut, thin on top)
  c.fillStyle = '#9CA3AF'; c.fillRect(hx - 15, hy - 18, 5, 12); c.fillRect(hx + 10, hy - 18, 5, 12);
  for (let k = 0; k < 6; k++) c.fillRect(hx - 9 + k * 3.5, hy - 19, 1.4, 3);
  if (pose === 'reel') {
    c.strokeStyle = INK; c.lineWidth = 2;
    for (const ex of [-6, 7]) { c.beginPath(); c.moveTo(hx + ex - 3, hy - 6); c.lineTo(hx + ex + 3, hy); c.moveTo(hx + ex + 3, hy - 6); c.lineTo(hx + ex - 3, hy); c.stroke(); }
  } else {
    // (beady eyes, the brows up, sly)
    for (const ex of [-6, 7]) { ink(c, () => c.ellipse(hx + ex, hy - 3, 3.4, 3.8, 0, 0, Math.PI * 2), '#FFFFFF', 1.6); c.fillStyle = INK; c.beginPath(); c.arc(hx + ex + 1, hy - 3, 1.6, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#6B7280'; c.fillRect(hx - 10, hy - 11, 8, 2); c.fillRect(hx + 3, hy - 12, 8, 2);
  }
  // (the nose: big, pink at the end)
  ink(c, () => c.ellipse(hx + 12, hy + 3, 5, 4, 0.2, 0, Math.PI * 2), '#F2B08E', 2);
  // (the mouth: a grin full of teeth; talking it flaps; the tell, a gleeful O)
  const open = pose === 'talk' ? [3, 7, 4, 8][(f >> 2) % 4] : pose === 'tell' || pose === 'reel' ? 7 : pose === 'throw' ? 6 : 4;
  ink(c, () => c.roundRect(hx - 9, hy + 8, 20, open + 2, 4), '#7F1D1D', 2);
  c.fillStyle = '#FFFFFF'; c.fillRect(hx - 7, hy + 9, 16, Math.min(3, open)); c.fillStyle = INK; for (let k = -4; k <= 6; k += 3.4) c.fillRect(hx + k, hy + 9, 0.8, Math.min(3, open));
};
const paintPerot = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel), ph = f * 0.35;
  const flap = pose === 'glide' ? Math.sin(f * 0.9) * 0.55 : pose === 'air' ? -0.2 : 0;
  // (legs: little gray trouser legs, shiny black shoes)
  const lA = pose === 'air' || pose === 'glide' ? [-6, -8] : pose === 'tell' ? [-7, 0] : [-4, 0], lB = pose === 'air' || pose === 'glide' ? [8, -12] : pose === 'tell' ? [8, 0] : [5, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.4, -30, lx, ly - 4, 6, '#6B7280'); ink(c, () => c.roundRect(lx - 3, ly - 5, 11, 5, [2, 3, 1, 1]), '#111827', 1.6); }
  // (the far arm: the pointer stick; up with the pie chart in the tell)
  const far: [number, number] = pose === 'tell' ? [-6, -84] : pose === 'glide' ? [-20, -54 + Math.sin(f * 0.9) * 6] : pose === 'throw' ? [-16, -52] : [-14, -36];
  limb(c, -6, -56, far[0], far[1], 5, '#9CA3AF'); hand(c, far[0], far[1]);
  if (pose !== 'tell') { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(far[0], far[1]); c.lineTo(far[0] - 4, far[1] - 26); c.stroke(); c.strokeStyle = '#D6A86A'; c.lineWidth = 1.5; c.stroke(); }
  // (the suit: a narrow gray jacket, the white shirt, the blue tie)
  ink(c, () => { c.moveTo(-10, -30); c.lineTo(-12, -58); c.quadraticCurveTo(0, -62, 12, -58); c.lineTo(10, -30); c.closePath(); }, '#9CA3AF');
  ink(c, () => { c.moveTo(-4, -60); c.lineTo(5, -60); c.lineTo(0.5, -44); c.closePath(); }, '#FFFFFF', 1.4);
  ink(c, () => { c.moveTo(-1.5, -58); c.lineTo(2.5, -58); c.lineTo(3, -42); c.lineTo(0.5, -39); c.lineTo(-2, -42); c.closePath(); }, '#2563EB', 1.2);
  c.fillStyle = '#6B7280'; c.fillRect(-10, -36, 20, 2);
  perotHead(c, 2, -80, pose, f, flap);
  // (the near arm: the pie chart up in the tell, flung out in the throw, a thumb up talking)
  const near: [number, number] = pose === 'tell' ? [10, -96] : pose === 'throw' ? [26, -58] : pose === 'talk' ? [20, -64 + ((f >> 3) % 2) * 3] : pose === 'glide' ? [24, -56 - Math.sin(f * 0.9) * 6] : [14, -36];
  limb(c, 6, -56, near[0], near[1], 5, '#9CA3AF'); hand(c, near[0], near[1]);
  if (pose === 'tell') pieChart(c, near[0] - 4, near[1] - 14, 14, f * 0.05);
  if (pose === 'reel') for (let i = 0; i < 4; i++) { const a = f * 0.22 + (i / 4) * Math.PI * 2; star(c, Math.cos(a) * 28, -110 + Math.sin(a) * 6, 5, i % 2 ? '#FDE047' : '#FFFFFF'); }
  void ph;
};

// ---------------------------------------------------------------------------------------------------------------
// Falwell

const falwellHead = (c: Ctx, hx: number, hy: number, pose: Pose, f: number) => {
  // (the round head, jowls hanging, ears)
  for (const s of [-1, 1]) ink(c, () => c.ellipse(hx + s * 16, hy + 1, 4, 6, 0, 0, Math.PI * 2), '#F2B9A0', 1.8);
  ink(c, () => { c.moveTo(hx - 16, hy - 6); c.quadraticCurveTo(hx - 16, hy - 22, hx, hy - 22); c.quadraticCurveTo(hx + 17, hy - 22, hx + 16, hy - 6); c.quadraticCurveTo(hx + 20, hy + 16, hx + 4, hy + 20); c.quadraticCurveTo(hx - 12, hy + 21, hx - 17, hy + 10); c.closePath(); }, '#F6C3AA', 2.6);
  // (the jowls' fold, the double chin)
  c.strokeStyle = '#D9927A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 10, hy + 12); c.quadraticCurveTo(hx + 2, hy + 18, hx + 13, hy + 11); c.stroke();
  // (the silver hair: swept back in a swoop)
  ink(c, () => { c.moveTo(hx - 17, hy - 4); c.quadraticCurveTo(hx - 20, hy - 26, hx + 2, hy - 26); c.quadraticCurveTo(hx + 18, hy - 26, hx + 16, hy - 12); c.quadraticCurveTo(hx + 4, hy - 20, hx - 8, hy - 14); c.quadraticCurveTo(hx - 12, hy - 10, hx - 17, hy - 4); c.closePath(); }, '#E5E7EB', 2);
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(hx - 10 + k * 6, hy - 22); c.quadraticCurveTo(hx + k * 6, hy - 25, hx + 6 + k * 4, hy - 18); c.stroke(); }
  // (the glasses, the eyes behind them; X'd out reeling)
  for (const ex of [-5, 8]) {
    ink(c, () => c.roundRect(hx + ex - 5, hy - 7, 10, 8, 2), 'rgba(219, 234, 254, 0.9)', 2);
    if (pose === 'reel') { c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + ex - 2.5, hy - 5); c.lineTo(hx + ex + 2.5, hy - 1); c.moveTo(hx + ex + 2.5, hy - 5); c.lineTo(hx + ex - 2.5, hy - 1); c.stroke(); }
    else { c.fillStyle = INK; c.beginPath(); c.arc(hx + ex + 1, hy - 3, 1.5, 0, Math.PI * 2); c.fill(); }
  }
  c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, hy - 4); c.lineTo(hx + 3, hy - 4); c.stroke();
  c.fillStyle = '#9CA3AF'; c.fillRect(hx - 10, hy - 11, 9, 2); c.fillRect(hx + 4, hy - 11, 9, 2);
  // (the nose, the mouth: preaching wide, or a pursed frown)
  ink(c, () => c.ellipse(hx + 9, hy + 3, 4.5, 3.6, 0, 0, Math.PI * 2), '#EDA88E', 1.8);
  const open = pose === 'talk' ? [3, 7, 5, 8][(f >> 2) % 4] : pose === 'tell' || pose === 'throw' ? 7 : pose === 'reel' ? 8 : 0;
  if (open > 0) { ink(c, () => c.ellipse(hx + 4, hy + 11, 7, open / 2 + 1, 0, 0, Math.PI * 2), '#7F1D1D', 1.8); c.fillStyle = '#FFFFFF'; c.fillRect(hx - 1, hy + 9, 10, 1.6); }
  else { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(hx + 4, hy + 15, 5, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
};
const paintFalwell = (c: Ctx, q: Pundit, s: SimView, f: number, reel: number) => {
  const pose = poseOf(q, s, reel);
  // (legs: stout navy trouser legs, black shoes)
  const lA = pose === 'air' ? [-7, -10] : [-7, 0], lB = pose === 'air' ? [9, -14] : [8, 0];
  for (const [lx, ly] of [lA, lB]) { limb(c, lx * 0.5, -32, lx, ly - 4, 9, '#1E293B'); ink(c, () => c.roundRect(lx - 4, ly - 6, 14, 6, [2, 3, 1, 1]), '#0B0B0F', 1.6); }
  // (the far arm: the pulpit under it; set down in front in the tell)
  const far: [number, number] = pose === 'tell' ? [16, -40] : pose === 'air' ? [-24, -70] : [-16, -44];
  if (pose !== 'tell' && pose !== 'air' && pose !== 'reel') pulpit(c, -20, -24, -0.25);
  limb(c, -8, -66, far[0], far[1], 8, '#1E293B'); hand(c, far[0], far[1], 4.2);
  // (the body: a big round navy suit, the white shirt, the red tie, a gold cross on the lapel)
  ink(c, () => { c.moveTo(-15, -30); c.quadraticCurveTo(-22, -52, -14, -70); c.quadraticCurveTo(0, -76, 14, -70); c.quadraticCurveTo(24, -50, 16, -30); c.closePath(); }, '#1E293B', 2.6);
  ink(c, () => { c.moveTo(-5, -72); c.lineTo(6, -72); c.lineTo(0.5, -52); c.closePath(); }, '#FFFFFF', 1.4);
  ink(c, () => { c.moveTo(-2, -70); c.lineTo(3, -70); c.lineTo(4, -50); c.lineTo(0.5, -46); c.lineTo(-3, -50); c.closePath(); }, '#DC2626', 1.2);
  c.fillStyle = '#FACC15'; c.fillRect(-11, -64, 2, 6); c.fillRect(-13, -62, 6, 2);
  c.fillStyle = '#334155'; c.beginPath(); c.ellipse(2, -44, 16, 4, 0, 0, Math.PI); c.fill();
  // (the pulpit set down in front of him, the Bible thumped on it)
  if (pose === 'tell') pulpit(c, 30, 0, 0);
  falwellHead(c, 2, -88, pose, f);
  // (the near arm: the Bible; thumped on the pulpit in the tell; flung in the throw; up to heaven preaching)
  const thump = pose === 'tell' ? ((f >> 3) % 2) * 6 : 0;
  const near: [number, number] = pose === 'tell' ? [28, -46 + thump] : pose === 'throw' ? [30, -70] : pose === 'talk' ? [14, -108] : pose === 'air' ? [24, -76] : [18, -46];
  limb(c, 8, -66, near[0], near[1], 8, '#1E293B'); hand(c, near[0], near[1], 4.2);
  if (pose === 'talk') { c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(near[0], near[1]); c.lineTo(near[0] + 1, near[1] - 8); c.stroke(); c.strokeStyle = '#F2C6A0'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; bible(c, -20, -50, 0.1, 0.9); }
  else if (pose !== 'throw') bible(c, near[0] + 2, near[1] - 4, pose === 'tell' ? 1.5 : 0.1);
  if (pose === 'reel') for (let i = 0; i < 4; i++) { const a = f * 0.2 + (i / 4) * Math.PI * 2; star(c, Math.cos(a) * 30, -122 + Math.sin(a) * 6, 5, i % 2 ? '#FDE047' : '#FFFFFF'); }
};

/** A pundit, feet at the origin (facing right) in the fight; in the world (`world`: at his sim's feet, turned his way). */
export const drawPundit = (c: Ctx, id: PunditId, q: Pundit, s: SimView, f: number, reel: number, _k: number, world = false) => {
  c.save();
  if (world) { c.translate(Math.round(s.x), Math.round(s.y)); c.scale(s.facing, 1); }
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
      ink(c, () => { c.moveTo(0, 0); c.arc(0, 0, 10, -0.5, 0.6); c.closePath(); }, ['#EF4444', '#3B82F6', '#FACC15'][Math.abs(Math.round(t.vx * 10)) % 3], 1.8);
      c.restore(); break;
    }
    case 'bible': bible(c, t.x, t.y, t.spin); break;
    case 'plate': {
      c.save(); c.translate(t.x, t.y);
      ink(c, () => c.ellipse(0, 0, 11, 3.5 + Math.abs(Math.sin(t.spin)) * 1.5, 0, 0, Math.PI * 2), '#EAB308', 2);
      c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(-1, -0.5, 7, 1.6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A16207'; c.fillRect(-3, -1, 2, 1.5); c.fillRect(2, 0, 2, 1.5);
      c.restore(); break;
    }
  }
};

/** A bit of a pundit's costume flung out of his puff (world). */
export const drawPuffBit = (c: Ctx, b: PuffBit) => {
  c.save(); c.translate(b.x, b.y); c.rotate(b.rot);
  switch (b.what) {
    case 'ears': for (const s of [-1, 1]) { ink(c, () => c.ellipse(s * 12, 0, 11, 15, s * 0.2, 0, Math.PI * 2), '#F5B7A0', 2.2); ink(c, () => c.ellipse(s * 12, 1, 5, 9, s * 0.2, 0, Math.PI * 2), '#E28A78', 1.2); } break;
    case 'perothead': {
      // (the rubber caricature head, empty, its eyeholes dark)
      ink(c, () => c.roundRect(-16, -18, 32, 36, [13, 13, 11, 11]), '#F6C9A8', 2.4);
      c.fillStyle = INK; c.fillRect(-9, -6, 6, 5); c.fillRect(4, -6, 6, 5);
      ink(c, () => c.roundRect(-8, 8, 18, 5, 3), '#7F1D1D', 1.6);
      c.fillStyle = '#9CA3AF'; c.fillRect(-14, -16, 5, 10); c.fillRect(9, -16, 5, 10);
      break;
    }
    case 'chart': pieChart(c, 0, 0, 13, 0); break;
    case 'pointer': c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.stroke(); c.strokeStyle = '#D6A86A'; c.lineWidth = 1.8; c.stroke(); break;
    case 'falhead': {
      ink(c, () => c.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2), '#F6C3AA', 2.4);
      ink(c, () => { c.moveTo(-17, -4); c.quadraticCurveTo(-18, -24, 2, -24); c.quadraticCurveTo(18, -24, 16, -10); c.quadraticCurveTo(0, -16, -17, -4); c.closePath(); }, '#E5E7EB', 2);
      c.fillStyle = INK; c.fillRect(-9, -6, 6, 5); c.fillRect(5, -6, 6, 5);
      break;
    }
    case 'bible': bible(c, 0, 0, 0, 1.2); break;
    case 'pulpit': pulpit(c, 0, 14, 0); break;
    case 'glasses': for (const s of [-1, 1]) ink(c, () => c.roundRect(s * 7 - 5, -4, 10, 8, 2), 'rgba(219, 234, 254, 0.9)', 2); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, 0); c.lineTo(2, 0); c.stroke(); break;
  }
  c.restore();
};
