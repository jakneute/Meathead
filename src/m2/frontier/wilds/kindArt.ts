// The wilds' animals, drawn (the prototype first pass: crude but readable: simple shapes, flat colors with a lit and a
// shaded tone each, an ink outline, recognizable silhouettes). Each drawn standing at the origin (its feet), facing
// right (the engine turns it round), in its poses (from its AI's state), hurt (eyes screwed shut) and dead (limp, on its
// side or belly up, eyes crossed out, tongue out): the engine's special deaths (headshots, the drownings, the
// wall-splats, the soul sucker, the puke...) all play out on these, so every one looks right dead as well as alive.

import type { Enemy } from '../../../m1/types';
import { INK } from '../kit';

type Ctx = CanvasRenderingContext2D;
type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');

const blob = (c: Ctx, path: () => void, col: string, lw = 1.2) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0, lw = 1.2) => blob(c, () => c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2), col, lw);
const dot = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const limb = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
/** An eye: open (a dot with a glint), screwed shut (hurt), crossed out (dead). */
const eye = (c: Ctx, x: number, y: number, md: Mood, r = 1.6, angry = false) => {
  if (md === 'dead') { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x - r, y + r); c.lineTo(x + r, y - r); c.stroke(); return; }
  if (md === 'hurt') { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x - r, y - r * 0.6); c.lineTo(x + r * 0.6, y); c.lineTo(x - r, y + r * 0.6); c.stroke(); return; }
  dot(c, x - r * 0.7, y - r * 0.7, r * 1.4, r * 1.4, INK); dot(c, x - r * 0.3, y - r * 0.6, r * 0.5, r * 0.5, '#FFFFFF');
  if (angry) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x - r * 1.4, y - r * 1.6); c.lineTo(x + r * 1.2, y - r * 0.9); c.stroke(); }
};
const tongue = (c: Ctx, x: number, y: number, len: number) => { c.strokeStyle = '#E86A7A'; c.lineCap = 'round'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 2, y + len * 0.6, x + 1, y + len); c.stroke(); };
/** Lying dead: the whole of it rolled onto its side (belly to us), legs stuck out stiff. */
const rolled = (c: Ctx, md: Mood, h: number) => { if (md === 'dead') { c.translate(0, -2); c.rotate(0.08); c.translate(0, h * 0.25); } };

// ---------------------------------------------------------------------------------------------------------------
// Deer: the doe (no antlers, the white tail flagged up when she bolts) and the buck (a big rack, a darker neck)

const FAWN = '#B8844E', FAWN_D = '#8A5E32', FAWN_L = '#D8A870', BELLY = '#F2E2C8';

const deer = (c: Ctx, e: Enemy, f: number, buck: boolean) => {
  const md = mood(e), st = e.aiState;
  const run = st === 'bolt' || st === 'charge' || (Math.abs(e.vel.x) > 1.5 && md !== 'dead');
  const graze = st === 'graze' || (st === 'idle' && Math.sin(f * 0.02 + (e.variant ?? 0)) > 0.3 && !buck);
  const s = buck ? 1.15 : 1;
  c.save(); c.scale(s, s);
  rolled(c, md, 46);
  const ph = f * (run ? 0.4 : 0.15);
  const legSwing = (k: number) => (run ? Math.sin(ph + k) * 9 : md === 'dead' ? 6 : 0);
  // (legs: thin, the far pair darker; stiff out when dead)
  const legs: [number, number][] = [[-16, 0], [-10, 1.5], [12, 3], [18, 4.5]];
  legs.forEach(([lx, k], i) => {
    const far = i % 2 === 0, col = far ? FAWN_D : FAWN;
    const kick = st === 'kick' && lx < 0 ? -12 : 0;
    limb(c, lx, -26, lx + legSwing(k) + kick, md === 'dead' ? -4 : -2, 3, col);
    dot(c, lx + legSwing(k) + kick - 2, -3, 4, 3, INK);
  });
  // (the body: a long barrel, the pale belly, the rump and its tail (white, flagged up when she runs))
  ell(c, 0, -32, 22, 10, FAWN);
  ell(c, 2, -27, 15, 4, BELLY, 0, 0.6);
  dot(c, -18, -40, 30, 3, FAWN_L);
  const tailUp = run || st === 'kick';
  blob(c, () => { c.moveTo(-21, -36); c.lineTo(-27, tailUp ? -46 : -32); c.lineTo(-22, tailUp ? -44 : -30); c.closePath(); }, tailUp ? '#FFFFFF' : FAWN_D, 1);
  // (the neck and the head: down to the grass grazing, up and alert otherwise; the buck's neck thicker and darker)
  const hx = graze ? 26 : 22, hy = graze ? -14 : st === 'charge' ? -34 : -50;
  limb(c, 16, -36, hx - 2, hy + 4, buck ? 9 : 7, buck ? FAWN_D : FAWN);
  c.save(); c.translate(hx, hy); c.rotate(graze ? 1.1 : st === 'charge' ? 0.6 : 0);
  ell(c, 2, 0, 7, 5, FAWN);
  ell(c, 8, 1.5, 3, 2.6, '#3A2414', 0, 0.8);
  dot(c, 9, 0, 1.6, 1.4, '#1C1209');
  eye(c, 1.5, -1.5, md, 1.4, st === 'charge' || st === 'paw');
  // (the big ears)
  blob(c, () => { c.moveTo(-3, -3); c.lineTo(-9, -11); c.lineTo(-1, -6); c.closePath(); }, FAWN_L, 0.8);
  if (md === 'dead') tongue(c, 7, 4, 5);
  // (the buck's rack: two branching antlers up off his head)
  if (buck) {
    c.strokeStyle = INK; c.lineWidth = 3.4; c.lineCap = 'round';
    const rack = () => { c.beginPath(); c.moveTo(0, -4); c.lineTo(-4, -16); c.lineTo(-10, -24); c.moveTo(-4, -16); c.lineTo(2, -22); c.moveTo(-7, -20); c.lineTo(-6, -28); c.moveTo(0, -4); c.lineTo(4, -14); c.lineTo(10, -20); c.moveTo(4, -14); c.lineTo(3, -24); c.stroke(); };
    rack(); c.strokeStyle = '#E8DCC0'; c.lineWidth = 1.6; rack();
  }
  c.restore();
  c.restore();
};

export const drawDoe = (c: Ctx, e: Enemy, f: number) => deer(c, e, f, false);
export const drawBuck = (c: Ctx, e: Enemy, f: number) => deer(c, e, f, true);

// ---------------------------------------------------------------------------------------------------------------
// Gray wolf: low, lean, a bushy tail, hackles up when it's stalking, the jaws open on the lunge

const WOLF = '#8A8A8E', WOLF_D = '#5E5E64', WOLF_L = '#C4C4C8';

export const drawWolf = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  const run = (st === 'stalk' || st === 'idle') && Math.abs(e.vel.x) > 0.6 || st === 'lunge';
  const crouch = st === 'crouch' ? 6 : 0;
  c.save();
  rolled(c, md, 34);
  const ph = f * (run ? 0.45 : 0.12);
  for (const [lx, k, far] of [[-14, 0, true], [-9, 2, false], [11, 1, true], [16, 3, false]] as const) {
    const sw = st === 'lunge' ? (lx < 0 ? -10 : 10) : run ? Math.sin(ph + k) * 7 : md === 'dead' ? 5 : 0;
    limb(c, lx, -16 + crouch, lx + sw, md === 'dead' ? -3 : -2, 3, far ? WOLF_D : WOLF);
  }
  // (the bushy tail: down and out, up when it lunges)
  blob(c, () => { c.moveTo(-18, -22 + crouch); c.quadraticCurveTo(-32, st === 'lunge' ? -32 : -18, -30, st === 'lunge' ? -30 : -10); c.quadraticCurveTo(-24, -14, -16, -18 + crouch); c.closePath(); }, WOLF_D);
  // (the body, the pale belly, the hackles)
  ell(c, 0, -21 + crouch, 19, 8, WOLF);
  ell(c, 2, -16 + crouch, 13, 3, WOLF_L, 0, 0.6);
  if (st === 'stalk' || st === 'crouch') for (let k = 0; k < 5; k++) dot(c, 2 + k * 3, -30 + crouch - (k % 2), 2, 3, WOLF_D);
  // (the head: long muzzle, ears up, the eyes yellow; jaws wide on the lunge)
  const hx = 22, hy = -24 + crouch + (st === 'crouch' ? 3 : 0);
  ell(c, hx, hy, 8, 6, WOLF);
  const open = st === 'lunge' || st === 'crouch' ? 4 : md === 'dead' ? 3 : 0;
  blob(c, () => { c.moveTo(hx + 4, hy - 3); c.lineTo(hx + 15, hy - 1); c.lineTo(hx + 15, hy + 1); c.lineTo(hx + 4, hy + 2); c.closePath(); }, WOLF_L, 1);
  if (open) { blob(c, () => { c.moveTo(hx + 4, hy + 2); c.lineTo(hx + 14, hy + 2 + open); c.lineTo(hx + 4, hy + 4); c.closePath(); }, '#C04A4A', 1); dot(c, hx + 8, hy + 2, 1, 2, '#FFFFFF'); dot(c, hx + 11, hy + 2, 1, 2, '#FFFFFF'); }
  dot(c, hx + 14, hy - 2, 2, 2, INK);
  blob(c, () => { c.moveTo(hx - 4, hy - 4); c.lineTo(hx - 2, hy - 13); c.lineTo(hx + 2, hy - 5); c.closePath(); }, WOLF_D, 1);
  if (md === 'ok') { dot(c, hx + 1, hy - 3, 3, 2, '#FACC15'); dot(c, hx + 2, hy - 3, 1, 2, INK); } else eye(c, hx + 2, hy - 2, md, 1.6);
  if (md === 'dead') tongue(c, hx + 10, hy + 3, 6);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Cougar: tawny, long, a thick tail with a black tip, low in the crouch, stretched out in the pounce

const PUMA = '#C89A5E', PUMA_D = '#9A6E3A', PUMA_L = '#EED2A8';

export const drawCougar = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  const crouch = st === 'crouch' ? 8 : 0, pounce = st === 'pounce';
  c.save();
  rolled(c, md, 34);
  if (pounce) c.rotate(-0.15);
  const ph = f * 0.12;
  for (const [lx, k, far] of [[-20, 0, true], [-14, 2, false], [16, 1, true], [22, 3, false]] as const) {
    const sw = pounce ? (lx < 0 ? -14 : 14) : Math.abs(e.vel.x) > 0.5 ? Math.sin(ph * 3 + k) * 6 : md === 'dead' ? 5 : 0;
    limb(c, lx, -16 + crouch, lx + sw, -2, 4, far ? PUMA_D : PUMA);
  }
  blob(c, () => { c.moveTo(-24, -22 + crouch); c.quadraticCurveTo(-40, -18, -42, -4 + (st === 'crouch' ? Math.sin(f * 0.3) * 3 : 0)); c.lineTo(-38, -4); c.quadraticCurveTo(-36, -16, -22, -18 + crouch); c.closePath(); }, PUMA);
  ell(c, -40, -4, 3, 3, '#2A1A0C', 0, 0.8);
  ell(c, 0, -22 + crouch, 25, 9, PUMA);
  ell(c, 2, -16 + crouch, 17, 3.4, PUMA_L, 0, 0.6);
  const hx = 28, hy = -26 + crouch;
  ell(c, hx, hy, 8, 7, PUMA);
  ell(c, hx + 6, hy + 2, 4, 3, PUMA_L, 0, 0.8);
  dot(c, hx + 9, hy, 2, 2, '#3A2414');
  blob(c, () => { c.moveTo(hx - 4, hy - 5); c.lineTo(hx - 3, hy - 11); c.lineTo(hx + 1, hy - 6); c.closePath(); }, PUMA_D, 1);
  if (md === 'ok') { dot(c, hx + 2, hy - 3, 3, 2, '#A3E635'); dot(c, hx + 3, hy - 3, 1, 2, INK); } else eye(c, hx + 3, hy - 2, md, 1.6);
  if (pounce || st === 'crouch') { blob(c, () => { c.moveTo(hx + 4, hy + 3); c.lineTo(hx + 11, hy + 6); c.lineTo(hx + 4, hy + 6); c.closePath(); }, '#C04A4A', 0.8); dot(c, hx + 6, hy + 3, 1, 2, '#FFFFFF'); }
  if (md === 'dead') tongue(c, hx + 8, hy + 4, 6);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Beaver: up out of the water (the caller's water covers its bottom), buck teeth, the flat tail slapping

const BEAV = '#7A4A26', BEAV_D = '#5A3418', BEAV_L = '#A06A3C';

export const drawBeaver = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  c.save();
  if (md === 'dead') { c.rotate(Math.PI); c.translate(0, 14); }
  const slap = st === 'slap' ? Math.sin(Math.min(1, (e.aiTimer ?? 0) / 10) * Math.PI) : 0;
  // (the tail: flat, crosshatched, up and smacking down on a slap)
  c.save(); c.translate(-12, -8); c.rotate(-0.3 - slap * 1.4);
  blob(c, () => c.ellipse(-8, 0, 9, 4, 0, 0, Math.PI * 2), '#3A2A1E');
  c.strokeStyle = '#5A4632'; c.lineWidth = 0.6; for (let k = -12; k < -2; k += 3) { c.beginPath(); c.moveTo(k, -3); c.lineTo(k + 2, 3); c.stroke(); }
  c.restore();
  ell(c, 0, -10, 14, 10, BEAV);
  ell(c, -2, -14, 9, 4, BEAV_L, 0, 0);
  // (the head, its little ears, the buck teeth (orange, as they are), whiskers)
  const hx = 12, hy = -16 + (st === 'bite' ? 3 : 0);
  ell(c, hx, hy, 7, 6, BEAV);
  ell(c, hx - 4, hy - 5, 2, 2, BEAV_D, 0, 0.8);
  dot(c, hx + 5, hy - 1, 3, 2, INK);
  blob(c, () => c.rect(hx + 3, hy + 3, 4, 5), '#F59E0B', 0.8);
  dot(c, hx + 5, hy + 3, 0.6, 5, '#B45309');
  eye(c, hx + 1, hy - 2, md, 1.3);
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(hx + 6, hy + 1); c.lineTo(hx + 12, hy); c.moveTo(hx + 6, hy + 2); c.lineTo(hx + 12, hy + 3); c.stroke();
  if (md === 'dead') tongue(c, hx + 2, hy + 6, 4);
  c.restore();
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// Rattlesnake: coiled up at its hole, the rattle up and buzzing, the head struck out (the strike's own reach)

const SNAKE = '#C2A26B', SNAKE_D = '#7A5A30';

export const drawRattler = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  // (the hole: a dark mouth in a ring of dirt)
  ell(c, 0, -1, 15, 4, '#2A1A0C', 0, 1);
  if (md === 'dead') {
    // (stretched out of the hole, belly up, limp)
    c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -3); c.quadraticCurveTo(0, -8, 16, -3); c.stroke();
    c.strokeStyle = '#E8D8A8'; c.lineWidth = 5; c.stroke();
    eye(c, 15, -5, 'dead', 1.4);
    return;
  }
  const hidden = st === 'hide';
  // (the coil: two loops of banded snake)
  if (!hidden) {
    for (let k = 0; k < 2; k++) { ell(c, -2 + k * 2, -5 - k * 5, 12 - k * 3, 4, k ? SNAKE : SNAKE_D); for (let i = -2; i <= 2; i++) dot(c, -2 + k * 2 + i * 4, -7 - k * 5, 2, 3, '#4A3418'); }
    // (the rattle, up and buzzing)
    const buzz = st === 'rattle' ? Math.sin(f * 2.4) * 2 : 0;
    blob(c, () => c.ellipse(-12 + buzz, -16, 2, 4, 0.3, 0, Math.PI * 2), '#E8D8A8', 0.8);
  }
  // (the head and neck: peeking out, reared up rattling, or struck out at him)
  const reach = st === 'strike' ? Math.min(1, (e.aiTimer ?? 0) / 6) * 46 : 0;
  const hx = hidden ? 2 : 6 + reach, hy = hidden ? -4 : st === 'rattle' ? -20 : -14 + reach * 0.15;
  c.strokeStyle = INK; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(2, -10); c.quadraticCurveTo(hx - 6, hy - 6, hx, hy); c.stroke();
  c.strokeStyle = SNAKE; c.lineWidth = 4; c.stroke();
  blob(c, () => { c.moveTo(hx - 2, hy - 3); c.lineTo(hx + 7, hy - 1); c.lineTo(hx + 7, hy + 2); c.lineTo(hx - 2, hy + 3); c.closePath(); }, SNAKE_D, 1);
  eye(c, hx + 2, hy - 1, md, 1, true);
  if (st === 'strike' || st === 'rattle') { c.strokeStyle = '#DC2626'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + 7, hy + 1); c.lineTo(hx + 11, hy); c.lineTo(hx + 12, hy - 1); c.moveTo(hx + 11, hy); c.lineTo(hx + 12, hy + 2); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Crow: black, a beak, wings beating (tucked in the swoop)

export const drawCrow = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  c.save();
  if (md === 'dead') { c.rotate(Math.PI); c.translate(0, 18); }
  const flap = st === 'swoop' ? 0.6 : md === 'dead' ? 1 : Math.sin(f * 0.5);
  ell(c, 0, -9, 10, 5, '#1C1C24');
  blob(c, () => { c.moveTo(-8, -9); c.lineTo(-16, -12); c.lineTo(-15, -6); c.closePath(); }, '#1C1C24', 1);
  // (the wing: up, down)
  blob(c, () => { c.moveTo(-3, -11); c.lineTo(-6 - 4 * Math.abs(flap), -11 - 12 * flap); c.lineTo(5, -10); c.closePath(); }, '#2A2A34', 1);
  ell(c, 9, -12, 4.5, 4, '#1C1C24');
  blob(c, () => { c.moveTo(12, -13); c.lineTo(18, -11.5); c.lineTo(12, -10); c.closePath(); }, '#52525B', 0.8);
  eye(c, 10, -13, md, 1.2, st === 'swoop');
  if (md === 'dead') tongue(c, 15, -10, 3);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Porcupine: a round brown body, a fan of quills (bristled up and out when it turns its back on him)

export const drawPorcupine = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  c.save();
  rolled(c, md, 26);
  const bristle = st === 'bristle' ? 1 : 0.4;
  // (the quills: a fan of spikes, white tipped, out over the back)
  c.lineCap = 'round';
  for (let k = 0; k < 13; k++) {
    const a = -Math.PI + 0.25 + (k / 12) * (Math.PI - 0.5), len = 10 + bristle * 8 + (k % 2) * 3;
    const bx = Math.cos(a) * 12, by = -12 + Math.sin(a) * 8;
    c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len); c.stroke();
    c.strokeStyle = '#E7E5E4'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx + Math.cos(a) * len * 0.5, by + Math.sin(a) * len * 0.5); c.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len); c.stroke();
  }
  ell(c, 0, -10, 15, 10, '#5A3E26');
  for (const lx of [-8, 6]) limb(c, lx, -4, lx + (Math.abs(e.vel.x) > 0.2 ? Math.sin(f * 0.3 + lx) * 3 : 0), -1, 3, '#3A2814');
  ell(c, 13, -8, 6, 5, '#7A5A3A');
  dot(c, 18, -9, 2, 2, INK);
  eye(c, 13, -10, md, 1.2);
  if (md === 'dead') tongue(c, 17, -5, 3);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Bison: a mountain of brown, the shaggy hump and beard, short black horns, head down for the charge

const BIS = '#5A3A22', BIS_D = '#3A2414', BIS_L = '#7A5434', SHAG = '#3A2A1C';

export const drawBison = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  const charge = st === 'charge', paw = st === 'paw';
  c.save();
  rolled(c, md, 70);
  const ph = f * (charge ? 0.35 : 0.08);
  for (const [lx, k, far] of [[-34, 0, true], [-24, 2, false], [22, 1, true], [32, 3, false]] as const) {
    const sw = charge ? Math.sin(ph + k) * 10 : paw && lx > 20 && !far ? Math.max(0, Math.sin(f * 0.4)) * -8 : md === 'dead' ? 6 : Math.abs(e.vel.x) > 0.3 ? Math.sin(ph + k) * 5 : 0;
    limb(c, lx, -26, lx + sw, -3, 7, far ? BIS_D : BIS);
    dot(c, lx + sw - 4, -4, 8, 4, INK);
  }
  // (the body: the hindquarters lower, the great hump up front; the shag over the hump and down the forelegs)
  ell(c, -14, -36, 28, 17, BIS);
  ell(c, 16, -44, 26, 24, SHAG);
  ell(c, 12, -52, 18, 10, BIS_L, 0, 0);
  blob(c, () => { c.moveTo(-40, -40); c.lineTo(-48, -30); c.lineTo(-44, -28); c.closePath(); }, BIS_D, 1);
  // (the head: big and low, the beard, the short black horns curving up)
  const hx = 40, hy = charge ? -24 : -32;
  ell(c, hx, hy, 12, 13, SHAG);
  blob(c, () => { c.moveTo(hx - 2, hy + 10); c.lineTo(hx + 6, hy + 22); c.lineTo(hx + 10, hy + 10); c.closePath(); }, SHAG, 1);
  ell(c, hx + 9, hy + 4, 6, 6, '#2A1A10');
  dot(c, hx + 12, hy + 3, 2, 2, '#0A0604');
  c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx - 2, hy - 10); c.quadraticCurveTo(hx - 2, hy - 20, hx + 6, hy - 20); c.stroke();
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 2; c.stroke();
  eye(c, hx + 4, hy - 4, md, 1.8, charge || paw);
  if (paw && f % 20 < 10) for (let i = 0; i < 3; i++) dot(c, hx + 16 + i * 3, hy + 4 - i, 2, 2, '#E7E5E4');
  if (md === 'dead') tongue(c, hx + 8, hy + 10, 8);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The beehive: a papery gray-brown hive hanging off a twig, bees buzzing round it, swaying

export const drawHive = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e);
  const sway = Math.sin(f * 0.05 + (e.variant ?? 0)) * 0.08;
  c.save(); c.translate(0, -e.height); c.rotate(sway);
  dot(c, -1, -10, 2, 12, '#5A3A1E');
  blob(c, () => { c.moveTo(0, 0); c.bezierCurveTo(14, 2, 13, 26, 0, 30); c.bezierCurveTo(-13, 26, -14, 2, 0, 0); c.closePath(); }, md === 'hurt' ? '#E7D8B8' : '#B8A47C');
  for (let k = 1; k < 5; k++) { c.strokeStyle = '#7A6A4A'; c.lineWidth = 1; c.beginPath(); c.moveTo(-11 + Math.abs(k - 2.5) * 2, k * 6); c.lineTo(11 - Math.abs(k - 2.5) * 2, k * 6); c.stroke(); }
  ell(c, 0, 22, 3, 2, '#2A1A0C', 0, 0.6);
  c.restore();
  // (bees, buzzing round it)
  if (md !== 'dead') for (let i = 0; i < 5; i++) { const a = f * 0.2 + i * 1.3, bx = Math.cos(a) * 16, by = -e.height * 0.5 + Math.sin(a * 1.4) * 14; dot(c, bx - 1, by - 1, 3, 2, '#1C1917'); dot(c, bx, by - 1, 1, 2, '#FACC15'); }
};
