// The wilds' animals, drawn (the final pass: peak SNES, the jungle's animals' way): an ink line round every part,
// each material in steps (its shadow, its shade, itself, lit, its highlight), fur ticked in, glints in the eyes; frames
// for what they're doing (a walk, a gallop, the wind-up, the attack stretched out with it), hurt (eyes screwed shut,
// flinching) and dead (belly up, legs stiff in the air, eyes crossed out, tongue out: nobody dies with dignity in this
// game): the engine's special deaths (headshots, the drownings, the wall-splats, the soul sucker, the puke...) all play
// out on these, so every one reads dead as well as alive. Each frame's painted once into a stamp (by kind, look and
// frame) and put down after that; what turns or reaches by the frame (the trout's leap, the hive's sway, the snake's
// strike) is drawn live.
//
// All drawn facing right from a point at the feet (the engine turns it round), at their base size (kinds.ts scales
// each kind up: the playtest's sizes).

import type { Enemy } from '../../../m1/types';
import { stamp } from '../../../m1/game/render/stamp';
import { limb as stroke } from '../../../m1/game/render/npc/kit';
import { mix, rampOf, part, INK } from './paint';

type Ctx = CanvasRenderingContext2D;
type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
const put = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => stamp(c, `fwa-${key}`, x, y, w, h, paint);

// ---------------------------------------------------------------------------------------------------------------
// Bits

const R = (c: string) => rampOf(c);
const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
const dark = (c: string, k = 0.3) => mix(c, INK, k);
/** A fill with its ink line. */
const ink = (g: Ctx, path: () => void, fill: string, line = 1) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); };
/** A shaded part (paint.ts's: clipped, stepped, dithered, inked). */
const sh = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1) => part(g, path, R(col), x, y, w, h, line);
/** A two-joint leg: hip to joint to foot, the upper thicker; a hoof or a paw at the end. */
const leg = (g: Ctx, hx: number, hy: number, jx: number, jy: number, fx: number, fy: number, w1: number, w2: number, col: string, foot?: string) => {
  stroke(g, hx, hy, jx, jy, w1, col);
  stroke(g, jx, jy, fx, fy, w2, col);
  g.fillStyle = lite(col, 0.18); g.fillRect(Math.min(hx, jx) - 0.5, Math.min(hy, jy), 1, Math.abs(jy - hy) * 0.7);
  if (foot) ink(g, () => g.ellipse(fx + 0.5, fy, w2 * 0.75 + 0.5, 1.6, 0, 0, Math.PI * 2), foot, 0.8);
};
/** Fur ticked in over a box: short strokes, dark and light. */
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = R(col);
  for (let i = 0; i < n; i++) {
    const a = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = a - Math.floor(a), b = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = b - Math.floor(b);
    g.fillStyle = k2 < 0.5 ? r[2] : r[4]; g.fillRect(x + k * w, y + k2 * h, 1, 2);
  }
};
/** An eye: open (the iris, the pupil, a glint; `brow` an angry line over it), screwed shut (hurt), crossed out (dead). */
const eye = (g: Ctx, x: number, y: number, md: Mood, r = 1.6, iris = INK, brow = false) => {
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x - r, y + r); g.lineTo(x + r, y - r); g.stroke(); return; }
  if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - r, y - r * 0.7); g.lineTo(x + r * 0.7, y); g.lineTo(x - r, y + r * 0.7); g.stroke(); return; }
  ink(g, () => g.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2), iris, 0.7);
  if (iris !== INK) { g.fillStyle = INK; g.fillRect(x - r * 0.25, y - r * 0.7, r * 0.6, r * 1.4); }
  g.fillStyle = '#FFFFFF'; g.fillRect(x - r * 0.6, y - r * 0.6, Math.max(1, r * 0.5), Math.max(1, r * 0.5));
  if (brow) { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - r * 1.5, y - r * 1.8); g.lineTo(x + r * 1.3, y - r * 0.9); g.stroke(); }
};
/** The tongue hanging out (dead), or panting. */
const tongue = (g: Ctx, x: number, y: number, len: number) => { ink(g, () => g.ellipse(x, y + len / 2, 1.8, len / 2 + 0.8, 0.2, 0, Math.PI * 2), '#E87A90', 0.8); g.fillStyle = '#B04A62'; g.fillRect(x - 0.4, y + 1, 0.8, len - 1); };
/** Belly up: the lot flipped over onto its back, its back on the ground (`h` its height standing). */
const bellyUp = (g: Ctx, h: number) => { g.translate(0, -h); g.scale(1, -1); };
/** A cycle's frame from the game's frame (n frames, `per` game frames each), offset by the animal's variant. */
const cyc = (f: number, e: Enemy, n: number, per: number) => Math.floor((f + (e.variant ?? 0) * 7) / per) % n;

// ---------------------------------------------------------------------------------------------------------------
// Deer: the doe (no antlers, big ears, the white flag of a tail up when she bolts) and the buck (a big stepped rack,
// a darker, thicker neck in the rut). Poses: grazing (head down), alert, walking, galloping (four frames), the kick
// (both hind legs back), head down (the buck's charge, the doe cornered and stamping, ramming), hurt, dead.

const FAWN = '#A8743E', FAWN_B = '#8A5A30', BELLY = '#EEDCC0', HOOF = '#2A1A10';

/** Leg ends for the deer's pose: [front far, front near, hind far, hind near] as [jointDx, jointDy, footDx, footDy]. */
type Leg4 = [number, number, number, number][];
const DEER_LEGS: Record<string, Leg4> = {
  stand: [[1, 12, 0, 26], [1, 12, 0, 26], [-3, 13, 1, 26], [-3, 13, 1, 26]],
  walk0: [[3, 12, 4, 26], [-1, 12, -3, 26], [-4, 13, -2, 26], [-1, 13, 4, 26]],
  walk1: [[-1, 12, -3, 26], [3, 12, 4, 26], [-1, 13, 4, 26], [-4, 13, -2, 26]],
  run0: [[8, 9, 14, 20], [6, 10, 12, 22], [-8, 11, -14, 22], [-6, 12, -12, 24]],
  run1: [[3, 10, -2, 22], [1, 11, -4, 24], [4, 10, 6, 22], [6, 9, 10, 20]],
  run2: [[-4, 12, -8, 26], [-2, 12, -6, 26], [6, 11, 12, 24], [8, 11, 14, 25]],
  run3: [[5, 7, 2, 16], [4, 8, 0, 16], [-2, 8, 2, 16], [0, 8, 4, 17]],
  kick: [[2, 12, 4, 26], [0, 12, 2, 26], [-10, 6, -22, 6], [-12, 5, -24, 3]],
  stamp: [[1, 12, 0, 26], [4, 8, 6, 20], [-3, 13, 1, 26], [-3, 13, 1, 26]],
  dead: [[10, 2, 21, 6], [8, 3, 19, 8], [-10, 2, -21, 6], [-8, 3, -19, 8]],
};

const paintDeer = (g: Ctx, buck: boolean, pose: string, legs: string, md: Mood, v: number) => {
  const fur = buck ? FAWN_B : [FAWN, '#B07C44', '#9C6A38'][v % 3], furD = dark(fur, 0.22);
  const head = pose === 'graze' ? 'graze' : pose === 'down' ? 'down' : 'up';
  const run = legs.startsWith('run');
  g.save();
  // (dead: down flat on the ground, the legs stuck out stiff fore and aft)
  if (md === 'dead') g.translate(0, 18);
  const flinch = md === 'hurt' ? 2 : 0;
  g.translate(0, flinch);
  const L = DEER_LEGS[md === 'dead' ? 'dead' : legs] ?? DEER_LEGS.stand;
  const hipF = [12, -27], hipH = [-13, -29];
  // (the far legs, darker, behind the body)
  leg(g, hipF[0] - 3, hipF[1], hipF[0] - 3 + L[0][0], hipF[1] + L[0][1], hipF[0] - 3 + L[0][2], hipF[1] + L[0][3], 3.4, 2.2, furD, HOOF);
  leg(g, hipH[0] + 3, hipH[1], hipH[0] + 3 + L[2][0], hipH[1] + L[2][1], hipH[0] + 3 + L[2][2], hipH[1] + L[2][3], 4.4, 2.2, furD, HOOF);
  // (the tail: the white flag up when she runs or kicks, down and brown otherwise)
  const flag = run || pose === 'kick' || md === 'dead';
  if (flag) { ink(g, () => g.ellipse(-24, -40, 3.4, 6, -0.6, 0, Math.PI * 2), '#FFFFFF', 0.9); g.fillStyle = '#D8D0C4'; g.fillRect(-25, -38, 2, 3); }
  else ink(g, () => g.ellipse(-22, -33, 2.2, 4, 0.4, 0, Math.PI * 2), fur, 0.9);
  // (the body: the barrel, stepped; the pale belly; the white rump patch; the darker line down the spine; ticked)
  sh(g, () => g.ellipse(0, -32, 21, 10.5, run ? 0.05 : 0, 0, Math.PI * 2), fur, -21, -43, 42, 21);
  g.save(); g.beginPath(); g.ellipse(0, -32, 21, 10.5, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = BELLY; g.beginPath(); g.ellipse(3, -22, 15, 4.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = dark(BELLY, 0.15); g.fillRect(-10, -24, 26, 1);
  g.fillStyle = '#F6EEE0'; g.beginPath(); g.ellipse(-19, -33, 4, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = dark(fur, 0.32); g.fillRect(-16, -42, 30, 2);
  g.restore();
  tick(g, -16, -40, 30, 12, fur, 18, v + (buck ? 5 : 1));
  // (the near legs)
  leg(g, hipF[0], hipF[1], hipF[0] + L[1][0], hipF[1] + L[1][1], hipF[0] + L[1][2], hipF[1] + L[1][3], 3.8, 2.4, fur, HOOF);
  leg(g, hipH[0], hipH[1], hipH[0] + L[3][0], hipH[1] + L[3][1], hipH[0] + L[3][2], hipH[1] + L[3][3], 5, 2.4, fur, HOOF);
  // (the neck and the head: down to the grass grazing, up and alert, or down and forward (the charge, cornered))
  const [hx, hy, rot] = head === 'graze' ? [27, -10, 1.1] : head === 'down' ? [25, -32, 0.55] : [22, -50, 0];
  const nw = buck ? 6 : 4.6;
  ink(g, () => { g.moveTo(10, -40); g.lineTo(18, -41); g.lineTo(hx + 2, hy - nw * 0.4); g.lineTo(hx - 2, hy + nw); g.lineTo(12, -28); g.closePath(); }, buck ? dark(fur, 0.12) : fur, 1);
  g.fillStyle = lite(fur, 0.22); g.beginPath(); g.moveTo(11, -39); g.lineTo(16, -40); g.lineTo(hx, hy - nw * 0.3); g.lineTo(hx - 2, hy); g.closePath(); g.fill();
  if (buck) { g.fillStyle = dark(fur, 0.3); for (let k = 0; k < 6; k++) g.fillRect(14 + (hx - 14) * (k / 6), -34 + (hy + 4 + 34) * (k / 6), 2, 3); }
  g.fillStyle = BELLY; g.beginPath(); g.moveTo(14, -30); g.lineTo(hx - 1, hy + nw * 0.7); g.lineTo(hx - 3, hy + nw * 1.1); g.closePath(); g.fill();
  g.save(); g.translate(hx, hy); g.rotate(rot);
  // (the big ears: back, the inside pale pink)
  ink(g, () => { g.moveTo(-3, -3); g.quadraticCurveTo(-11, -12, -12, -8); g.quadraticCurveTo(-8, -3, -1, -1); g.closePath(); }, fur, 0.9);
  g.fillStyle = '#E8B8A8'; g.beginPath(); g.moveTo(-4, -3); g.quadraticCurveTo(-9, -9, -10, -7); g.quadraticCurveTo(-7, -4, -3, -2); g.closePath(); g.fill();
  // (the head: stepped, the muzzle darker, the black nose, the white chin)
  sh(g, () => { g.moveTo(-5, -3); g.quadraticCurveTo(0, -6, 5, -3); g.lineTo(11, 0); g.quadraticCurveTo(12, 3, 9, 4); g.lineTo(0, 4); g.quadraticCurveTo(-6, 3, -5, -3); g.closePath(); }, fur, -6, -6, 18, 10, 1);
  g.fillStyle = '#F2EAE0'; g.fillRect(5, 3, 4, 1);
  ink(g, () => g.ellipse(10, 0.5, 2, 1.8, 0, 0, Math.PI * 2), '#1C1209', 0.6);
  g.fillStyle = '#6A6A70'; g.fillRect(9.5, -0.5, 1, 1);
  eye(g, 1.5, -1.6, md, 1.6, INK, head === 'down');
  if (md === 'ok' && head === 'down' && !buck) { g.fillStyle = '#FFFFFF'; g.fillRect(-0.5, -1.8, 1, 1); }
  if (md === 'dead') tongue(g, 7, 4, 5);
  // (the buck's rack: two beams sweeping up and forward, tines off them; bone in steps, inked)
  if (buck) {
    const A = R('#D8C8A0');
    const beam = (dx: number, sc: number) => {
      const pts: [number, number, number, number][] = [[0, -4, -2, -14], [-2, -14, 2, -24], [2, -24, 8, -30], [-2, -14, -9, -19], [0, -20, 6, -20], [2, -24, 0, -32]];
      for (const [col, wd] of [[INK, 4.2], [A[2], 2.6], [A[4], 1]] as [string, number][]) {
        g.strokeStyle = col; g.lineWidth = wd * sc; g.lineCap = 'round'; g.beginPath();
        for (const [x1, y1, x2, y2] of pts) { g.moveTo(dx + x1 * sc, y1 * sc); g.lineTo(dx + x2 * sc, y2 * sc); }
        g.stroke();
      }
      g.lineCap = 'butt';
    };
    beam(-3, 0.92); beam(1, 1);
    ink(g, () => g.arc(0, -4, 1.8, 0, Math.PI * 2), dark('#D8C8A0', 0.3), 0.6);
  }
  g.restore();
  g.restore();
};

const deer = (c: Ctx, e: Enemy, f: number, buck: boolean) => {
  const md = mood(e), raw = e.aiState ?? 'idle';
  const st = raw === 'ram' ? 'charge' : raw;
  const moving = Math.abs(e.vel.x) > 0.3;
  const run = st === 'bolt' || st === 'charge' || (Math.abs(e.vel.x) > 1.5 && md !== 'dead');
  const graze = st === 'graze' || (st === 'idle' && !buck && Math.sin(f * 0.02 + (e.variant ?? 0)) > 0.3);
  let pose = graze ? 'graze' : 'up', legs = 'stand';
  if (st === 'charge' || st === 'cornered' || st === 'paw') pose = 'down';
  if (st === 'kick') { pose = 'kick'; legs = 'kick'; }
  else if (run) legs = `run${cyc(f, e, 4, 4)}`;
  else if (st === 'cornered' || st === 'paw') legs = cyc(f, e, 2, 8) ? 'stamp' : 'stand';
  else if (moving) legs = `walk${cyc(f, e, 2, 10)}`;
  if (md !== 'ok') { legs = md === 'dead' ? 'dead' : 'stand'; if (md === 'dead') pose = 'down'; }
  const s = buck ? 1.15 : 1;
  c.save(); c.scale(s, s);
  put(c, `${buck ? 'buck' : 'doe'}-${(e.variant ?? 0) % 3}-${pose}-${legs}-${md}`, -40, -90, 84, 96, g => paintDeer(g, buck, pose, legs, md, e.variant ?? 0));
  c.restore();
};

export const drawDoe = (c: Ctx, e: Enemy, f: number) => deer(c, e, f, false);
export const drawBuck = (c: Ctx, e: Enemy, f: number) => deer(c, e, f, true);

// ---------------------------------------------------------------------------------------------------------------
// Gray wolf: low and lean, a darker saddle, the pale cheeks and belly, a bushy tail with its dark tip, yellow eyes.
// Roaming (a trot), stalking (low, the hackles up), the crouch (lower still, the snarl), the lunge (stretched out,
// jaws wide), hurt, dead.

const WOLF = ['#8E8C88', '#7E7A74', '#9A968E'];

const paintWolf = (g: Ctx, pose: string, fr: number, md: Mood, v: number) => {
  const fur = WOLF[v % 3], saddle = dark(fur, 0.35), pale = '#DCD6CA';
  g.save();
  if (md === 'dead') bellyUp(g, 32);
  if (md === 'hurt') g.translate(-1, 2);
  const low = pose === 'crouch' ? 6 : pose === 'stalk' ? 3 : 0, lunge = pose === 'lunge';
  if (lunge) g.rotate(-0.12);
  // (the legs: for the trot, the stalk's creep, the lunge stretched out, stiff dead)
  const tr = [[4, -4], [-4, 4], [3, -3], [-3, 3]][fr] ?? [0, 0];
  const go = pose === 'trot' || pose === 'stalk';
  const legEnds: [number, number, number, number][] = lunge ? [[16, -16, 28, -6], [-14, -16, -28, -8]] as [number, number, number, number][] : [];
  const fl = (x: number, far: boolean, front: boolean) => {
    const col = far ? dark(fur, 0.2) : fur, hy = -15 + low;
    if (lunge) { const [, , ex, ey] = front ? legEnds[0] : legEnds[1]; leg(g, x, hy, x + ex * 0.5, hy + 4, x + ex, ey + (far ? -2 : 0), 3.4, 2.4, col, dark(col, 0.4)); return; }
    if (md === 'dead') { leg(g, x, hy, x + (front ? 4 : -4), hy + 8, x + (front ? 7 : -7), -2, 3.4, 2.4, col, dark(col, 0.4)); return; }
    const sw = go ? (front ? tr[0] : tr[1]) * (far ? -1 : 1) : 0;
    leg(g, x, hy, x + sw * 0.5 + (front ? 1 : -2), hy + (15 - low) * 0.5, x + sw, -1, 3.4, 2.4, col, dark(col, 0.4));
  };
  fl(13, true, true); fl(-11, true, false);
  // (the tail: bushy, down and out, tucked in the crouch, up in the lunge)
  const tail = lunge ? [[-18, -24], [-34, -30], [-32, -22]] : pose === 'crouch' ? [[-18, -18 + low], [-28, -10], [-22, -6]] : [[-18, -22 + low], [-32, -16], [-30, -8]];
  ink(g, () => { g.moveTo(tail[0][0], tail[0][1]); g.quadraticCurveTo(tail[1][0], tail[1][1] - 4, tail[2][0], tail[2][1]); g.quadraticCurveTo(tail[1][0] + 6, tail[1][1] + 2, tail[0][0] + 2, tail[0][1] + 5); g.closePath(); }, dark(fur, 0.1), 1);
  ink(g, () => g.ellipse(tail[2][0], tail[2][1], 2.4, 2.4, 0, 0, Math.PI * 2), '#2A2622', 0.6);
  // (the body: lean, stepped; the saddle; the pale belly; ticked; the hackles up stalking)
  sh(g, () => g.ellipse(0, -21 + low, 19, 8, 0, 0, Math.PI * 2), fur, -19, -29 + low, 38, 16);
  g.save(); g.beginPath(); g.ellipse(0, -21 + low, 19, 8, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = saddle; g.beginPath(); g.ellipse(-2, -28 + low, 15, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = pale; g.beginPath(); g.ellipse(3, -14 + low, 13, 3, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  tick(g, -14, -28 + low, 28, 10, fur, 16, v + 3);
  if (pose === 'stalk' || pose === 'crouch') for (let k = 0; k < 6; k++) ink(g, () => { g.moveTo(-2 + k * 3, -27 + low); g.lineTo(-1 + k * 3, -32 + low - (k % 2)); g.lineTo(1 + k * 3, -27 + low); g.closePath(); }, saddle, 0.6);
  fl(15, false, true); fl(-9, false, false);
  // (the head: the long muzzle, ears up (pinned back snarling), pale cheeks, yellow eyes; the jaws open in the lunge)
  const hx = 22, hy = -23 + low + (pose === 'crouch' ? 3 : 0);
  const snarl = pose === 'crouch' || lunge;
  ink(g, () => { g.moveTo(hx - 3, hy - 4); g.lineTo(hx + (snarl ? -6 : -2), hy - 13); g.lineTo(hx + 2, hy - 5); g.closePath(); }, saddle, 0.9);
  sh(g, () => g.ellipse(hx, hy, 8, 6.4, 0, 0, Math.PI * 2), fur, hx - 8, hy - 6, 16, 13);
  g.fillStyle = pale; g.beginPath(); g.ellipse(hx + 2, hy + 3, 5, 2.6, 0, 0, Math.PI * 2); g.fill();
  const open = lunge ? 5 : pose === 'crouch' ? 3 : md === 'dead' ? 3 : 0;
  ink(g, () => { g.moveTo(hx + 3, hy - 4); g.lineTo(hx + 15, hy - 1.5); g.lineTo(hx + 15, hy + 1); g.lineTo(hx + 3, hy + 2); g.closePath(); }, lite(fur, 0.12), 1);
  if (open) {
    ink(g, () => { g.moveTo(hx + 3, hy + 2); g.lineTo(hx + 14, hy + 2 + open); g.lineTo(hx + 3, hy + 4); g.closePath(); }, '#A83A3A', 0.9);
    g.fillStyle = '#FFFFFF'; for (const tx of [hx + 7, hx + 10, hx + 13]) { g.fillRect(tx, hy + 1, 1, 2); g.fillRect(tx - 1, hy + 2 + open * (tx - hx - 3) / 11 - 2, 1, 2); }
  }
  if (snarl && md === 'ok') { g.strokeStyle = INK; g.lineWidth = 0.8; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(hx + 6 + k * 2, hy - 4); g.lineTo(hx + 7 + k * 2, hy - 2.5); g.stroke(); } }
  g.fillStyle = INK; g.fillRect(hx + 13.5, hy - 2.5, 2.5, 2);
  eye(g, hx + 2, hy - 2.4, md, 1.6, '#F2C21A', snarl);
  if (md === 'dead') tongue(g, hx + 10, hy + 3, 6);
  g.restore();
};

export const drawWolf = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'idle';
  let pose = 'stand', fr = 0;
  if (st === 'lunge') pose = 'lunge';
  else if (st === 'crouch') pose = 'crouch';
  else if (st === 'stalk' && Math.abs(e.vel.x) > 0.3) { pose = 'stalk'; fr = cyc(f, e, 4, 6); }
  else if (st === 'stalk') pose = 'stalk';
  else if (Math.abs(e.vel.x) > 0.6) { pose = 'trot'; fr = cyc(f, e, 4, 5); }
  if (md !== 'ok') { pose = md === 'dead' ? 'stand' : pose === 'lunge' ? 'stand' : pose; fr = 0; }
  put(c, `wolf-${(e.variant ?? 0) % 3}-${pose}-${fr}-${md}`, -42, -54, 84, 60, g => paintWolf(g, pose, fr, md, e.variant ?? 0));
};

// ---------------------------------------------------------------------------------------------------------------
// Cougar: tawny and long, a small head, the white muzzle with its dark whisker pads, a thick tail with the black tip.
// Lying alert up on its ledge (the tail tip flicking), the crouch (low, haunches up, the tail lashing), the pounce
// (stretched out, forelegs reaching, claws out), prowling, hurt, dead.

const PUMA = '#C08E58';

const paintCougar = (g: Ctx, pose: string, fr: number, md: Mood) => {
  const fur = PUMA, furD = dark(fur, 0.22), pale = '#F0DEC4';
  g.save();
  if (md === 'dead') bellyUp(g, 34);
  if (md === 'hurt') g.translate(-1, 2);
  const crouch = pose === 'crouch', pounce = pose === 'pounce', lie = pose === 'lie';
  const low = crouch ? 8 : lie ? 11 : 0;
  if (pounce) g.rotate(-0.16);
  const paw = (x: number, y: number, col: string) => ink(g, () => g.ellipse(x + 1, y, 3.2, 1.8, 0, 0, Math.PI * 2), dark(col, 0.1), 0.8);
  const legAt = (x: number, front: boolean, far: boolean) => {
    const col = far ? furD : fur, hy = -16 + low;
    if (pounce) { const ex = front ? 22 : -24, ey = front ? -14 : -8; leg(g, x, hy, x + ex * 0.45, hy + 3, x + ex, ey + (far ? -2 : 0), 4.6, 3.2, col); paw(x + ex, ey + (far ? -2 : 0), col); if (front && !far) for (let k = 0; k < 3; k++) { g.fillStyle = '#F4F0E4'; g.fillRect(x + ex + 3, ey - 2 + k * 1.6, 2, 0.8); } return; }
    if (md === 'dead') { leg(g, x, hy, x + (front ? 5 : -5), hy + 8, x + (front ? 8 : -8), -2, 4.6, 3.2, col); return; }
    if (lie) { leg(g, x, hy, x + (front ? 8 : 2), -3, x + (front ? 14 : 6), -2, 4.6, 3.2, col); paw(x + (front ? 14 : 6), -2, col); return; }
    const sw = pose === 'prowl' ? [5, -5, 3, -3][fr] * (front ? 1 : -1) * (far ? -1 : 1) : 0;
    leg(g, x, hy, x + sw * 0.5 + (front ? 1 : -3), hy + (16 - low) * 0.55, x + sw, -1, 4.6, 3.2, col); paw(x + sw, -1, col);
  };
  legAt(18, true, true); legAt(-16, false, true);
  // (the tail: long and thick, curving down and up at its black tip; lashing in the crouch, flicking lying alert)
  const flick = crouch ? [-6, 0, 6, 0][fr] : lie ? [0, -3][fr % 2] : 0;
  ink(g, () => { g.moveTo(-24, -22 + low); g.bezierCurveTo(-40, -18 + low, -46, -4, -42 + flick * 0.3, -8 + flick); g.lineTo(-38 + flick * 0.3, -9 + flick); g.bezierCurveTo(-40, -6, -36, -16 + low, -22, -17 + low); g.closePath(); }, fur, 1);
  ink(g, () => g.ellipse(-41 + flick * 0.3, -8 + flick, 3, 3.4, 0, 0, Math.PI * 2), '#241A10', 0.7);
  // (the body: long, stepped; the pale belly; ticked)
  sh(g, () => g.ellipse(0, -22 + low * 0.7, 25, 9, 0, 0, Math.PI * 2), fur, -25, -31 + low * 0.7, 50, 18);
  g.save(); g.beginPath(); g.ellipse(0, -22 + low * 0.7, 25, 9, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = pale; g.beginPath(); g.ellipse(4, -14 + low * 0.7, 18, 3.6, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  tick(g, -20, -30 + low * 0.7, 40, 10, fur, 14, 9);
  legAt(22, true, false); legAt(-12, false, false);
  // (the head: small and round, the ears with their dark backs, the white muzzle, the whisker pads, green eyes)
  const hx = 28, hy = -25 + low;
  ink(g, () => { g.moveTo(hx - 5, hy - 4); g.quadraticCurveTo(hx - 5, hy - 11, hx - 1, hy - 6); g.closePath(); }, '#3A2A1A', 0.8);
  sh(g, () => g.ellipse(hx, hy, 8, 7, 0, 0, Math.PI * 2), fur, hx - 8, hy - 7, 16, 14);
  ink(g, () => g.ellipse(hx + 6, hy + 2.5, 4.4, 3.2, 0, 0, Math.PI * 2), pale, 0.8);
  g.fillStyle = '#3A2A1A'; g.fillRect(hx + 4, hy + 1, 1, 2); g.fillRect(hx + 3, hy - 1, 1, 3);
  g.fillStyle = '#C87A6A'; g.fillRect(hx + 9, hy, 2, 1.6);
  eye(g, hx + 3, hy - 2.4, md, 1.6, '#9AC83A', crouch || pounce);
  if (pounce || crouch) { ink(g, () => { g.moveTo(hx + 4, hy + 4); g.lineTo(hx + 11, hy + 6.5); g.lineTo(hx + 4, hy + 6.5); g.closePath(); }, '#A83A3A', 0.8); g.fillStyle = '#FFFFFF'; g.fillRect(hx + 5, hy + 4, 1, 2); g.fillRect(hx + 8, hy + 5, 1, 1.6); }
  if (md === 'dead') tongue(g, hx + 8, hy + 4, 6);
  g.restore();
};

export const drawCougar = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'idle';
  let pose = 'lie', fr = cyc(f, e, 2, 30);
  if (st === 'crouch') { pose = 'crouch'; fr = cyc(f, e, 4, 5); }
  else if (st === 'pounce') { pose = 'pounce'; fr = 0; }
  else if (st === 'recover') { pose = 'stand'; fr = 0; }
  else if (st === 'prowl' || Math.abs(e.vel.x) > 0.5) { pose = Math.abs(e.vel.x) > 0.3 ? 'prowl' : 'stand'; fr = cyc(f, e, 4, 8); }
  if (md !== 'ok') { pose = md === 'dead' ? 'stand' : pose; fr = 0; }
  put(c, `cougar-${pose}-${fr}-${md}`, -52, -56, 104, 62, g => paintCougar(g, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Beaver: up out of the water to its chest (the water's front covers its bottom), slick wet fur with a glint, the
// small round ears, ORANGE buck teeth (as they are), whiskers, the flat scaly tail up and smacking down on a slap.

const paintBeaver = (g: Ctx, pose: string, fr: number, md: Mood) => {
  const fur = '#6E4222';
  g.save();
  if (md === 'dead') { g.rotate(Math.PI); g.translate(0, 14); }
  const slap = pose === 'slap' ? [0.3, 1, 0.6][fr] : 0;
  // (the tail: flat, crosshatched scales, up and smacking down on a slap)
  g.save(); g.translate(-12, -8); g.rotate(-0.3 - slap * 1.4);
  ink(g, () => g.ellipse(-9, 0, 10, 4.4, 0, 0, Math.PI * 2), '#3A2E24', 1);
  g.fillStyle = '#5A4A3A'; g.fillRect(-17, -2.6, 14, 1);
  g.strokeStyle = '#1E1812'; g.lineWidth = 0.6; for (let k = -16; k < -2; k += 3) { g.beginPath(); g.moveTo(k, -3.4); g.lineTo(k + 2, 3.4); g.moveTo(k + 2, -3.4); g.lineTo(k, 3.4); g.stroke(); }
  g.restore();
  // (the body: round, wet and slick, stepped; ticked)
  sh(g, () => g.ellipse(0, -10, 14, 10.5, 0, 0, Math.PI * 2), fur, -14, -21, 28, 21);
  tick(g, -10, -18, 18, 10, fur, 10, 4);
  g.fillStyle = 'rgba(230, 240, 250, 0.55)'; g.fillRect(-8, -18, 7, 1); g.fillRect(-6, -16, 3, 1);
  // (the forepaws, little and black, up at its chest)
  ink(g, () => g.ellipse(9, -6, 2.4, 1.8, 0, 0, Math.PI * 2), '#2A1A10', 0.7);
  // (the head: round ears, the eye, the blunt muzzle, the orange buck teeth, whiskers; lower biting)
  const hx = 12, hy = -16 + (pose === 'bite' ? 3 : 0);
  ink(g, () => g.arc(hx - 4, hy - 5, 2.2, 0, Math.PI * 2), dark(fur, 0.3), 0.8);
  sh(g, () => g.ellipse(hx, hy, 7.4, 6.4, 0, 0, Math.PI * 2), fur, hx - 8, hy - 7, 16, 13);
  ink(g, () => g.ellipse(hx + 4, hy + 1.5, 4, 3.2, 0, 0, Math.PI * 2), '#8A5A34', 0.8);
  g.fillStyle = INK; g.fillRect(hx + 5.5, hy - 0.6, 2.6, 2);
  const open = pose === 'bite' || md === 'dead';
  ink(g, () => g.rect(hx + 3, hy + 3.4 + (open ? 1 : 0), 4, 5), '#E8860E', 0.8);
  g.fillStyle = '#FBBF5A'; g.fillRect(hx + 3.6, hy + 4 + (open ? 1 : 0), 1.2, 3.6); g.fillStyle = '#9A4A08'; g.fillRect(hx + 4.8, hy + 3.6 + (open ? 1 : 0), 0.6, 4.6);
  eye(g, hx + 1, hy - 2, md, 1.3);
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(hx + 6, hy + 1); g.lineTo(hx + 12, hy); g.moveTo(hx + 6, hy + 2); g.lineTo(hx + 12, hy + 3); g.stroke();
  if (md === 'dead') tongue(g, hx + 2, hy + 8, 4);
  g.restore();
};

export const drawBeaver = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'idle';
  let pose = 'swim', fr = 0;
  if (st === 'slap') { pose = 'slap'; fr = Math.min(2, Math.floor((e.aiTimer ?? 0) / 4)); }
  else if (st === 'bite') pose = 'bite';
  if (md !== 'ok') { pose = 'swim'; fr = 0; }
  put(c, `beaver-${pose}-${fr}-${md}`, -36, -40, 66, 58, g => paintBeaver(g, pose, fr, md));
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// Rattlesnake: coiled at its hole, banded diamonds down its back, the rattle up and buzzing, the head a broad
// triangle with heat pits; reared rattling, then struck out a good way (the strike's own reach, drawn live).

const SNAKE = '#B89A62', SNAKE_D = '#5E4422';

const paintCoil = (g: Ctx, buzz: number) => {
  // (the hole: a dark mouth in a ring of dug dirt)
  ink(g, () => g.ellipse(0, -1, 16, 4.4, 0, 0, Math.PI * 2), '#5A3E22', 1);
  g.fillStyle = '#1A0E06'; g.beginPath(); g.ellipse(0, -1, 12, 2.8, 0, 0, Math.PI * 2); g.fill();
  // (the coil: two loops, banded with the diamonds)
  for (let k = 0; k < 2; k++) {
    const cx = -2 + k * 2, cy = -5 - k * 5, rx = 12 - k * 3;
    sh(g, () => g.ellipse(cx, cy, rx, 4.2, 0, 0, Math.PI * 2), k ? SNAKE : dark(SNAKE, 0.12), cx - rx, cy - 4, rx * 2, 8);
    for (let i = -2; i <= 2; i++) { const dx = cx + i * 4.4; g.fillStyle = SNAKE_D; g.beginPath(); g.moveTo(dx, cy - 3.6); g.lineTo(dx + 2, cy - 1.6); g.lineTo(dx, cy + 0.4); g.lineTo(dx - 2, cy - 1.6); g.closePath(); g.fill(); g.fillStyle = '#E8D8A8'; g.fillRect(dx - 0.5, cy - 1.8, 1, 1); }
  }
  // (the rattle: its stacked segments, up and buzzing)
  g.save(); g.translate(-12 + buzz, -16); g.rotate(0.3);
  for (let k = 0; k < 4; k++) ink(g, () => g.ellipse(0, -k * 2.4, 2.2 - k * 0.2, 1.4, 0, 0, Math.PI * 2), k % 2 ? '#E8D8A8' : '#C8B888', 0.6);
  g.restore();
};
const snakeHead = (c: Ctx, hx: number, hy: number, md: Mood, tonguing: boolean) => {
  ink(c, () => { c.moveTo(hx - 3, hy - 3.6); c.lineTo(hx + 4, hy - 2.6); c.lineTo(hx + 8, hy); c.lineTo(hx + 4, hy + 2.6); c.lineTo(hx - 3, hy + 3.4); c.closePath(); }, SNAKE_D, 1);
  c.fillStyle = lite(SNAKE_D, 0.3); c.fillRect(hx - 2, hy - 2.6, 6, 1);
  c.fillStyle = INK; c.fillRect(hx + 5, hy - 0.6, 1, 1);
  eye(c, hx + 2, hy - 1, md, 1.1, '#E8C040', true);
  if (tonguing) { c.strokeStyle = '#D02A2A'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + 8, hy); c.lineTo(hx + 12, hy); c.lineTo(hx + 13.5, hy - 1.4); c.moveTo(hx + 12, hy); c.lineTo(hx + 13.5, hy + 1.4); c.stroke(); }
};

export const drawRattler = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'hide';
  if (md === 'dead') {
    put(c, 'rattler-dead', -20, -14, 44, 18, g => {
      ink(g, () => g.ellipse(0, -1, 16, 4.4, 0, 0, Math.PI * 2), '#5A3E22', 1);
      g.fillStyle = '#1A0E06'; g.beginPath(); g.ellipse(0, -1, 12, 2.8, 0, 0, Math.PI * 2); g.fill();
      // (stretched out of the hole, belly up (the pale scutes), limp, a kink in it)
      for (const [col, w] of [[INK, 7.4], ['#E8DCB0', 5.4]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(-12, -3); g.quadraticCurveTo(-2, -9, 6, -4); g.quadraticCurveTo(11, -1, 17, -4); g.stroke(); }
      g.strokeStyle = '#B8AC80'; g.lineWidth = 0.8; for (let k = -10; k < 16; k += 3) { g.beginPath(); g.moveTo(k, -6); g.lineTo(k, -2); g.stroke(); }
      g.lineCap = 'butt';
      eye(g, 16, -5, 'dead', 1.4); tongue(g, 19, -4, 3);
    });
    return;
  }
  const hidden = st === 'hide';
  const buzz = st === 'rattle' ? Math.round(Math.sin(f * 2.4) * 2) : 0;
  if (!hidden) put(c, `rattler-coil-${buzz}`, -22, -26, 44, 32, g => paintCoil(g, buzz));
  else put(c, 'rattler-hole', -18, -8, 36, 12, g => { ink(g, () => g.ellipse(0, -1, 16, 4.4, 0, 0, Math.PI * 2), '#5A3E22', 1); g.fillStyle = '#1A0E06'; g.beginPath(); g.ellipse(0, -1, 12, 2.8, 0, 0, Math.PI * 2); g.fill(); });
  // (the neck and head: peeking out, reared up rattling, or struck out at him (live: its reach goes by the frame))
  const reach = st === 'strike' ? Math.min(1, (e.aiTimer ?? 0) / 6) * 46 : 0;
  const hx = hidden ? 2 : 6 + reach, hy = hidden ? -4 : st === 'rattle' ? -20 : -14 + reach * 0.15;
  const neck = () => { c.beginPath(); c.moveTo(hidden ? 0 : 2, hidden ? -1 : -10); c.quadraticCurveTo(hx - 6, hy - 6, hx, hy); };
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 6.4; neck(); c.stroke();
  c.strokeStyle = SNAKE; c.lineWidth = 4.4; neck(); c.stroke();
  c.strokeStyle = lite(SNAKE, 0.3); c.lineWidth = 1.2; c.save(); c.translate(-0.6, -1.2); neck(); c.stroke(); c.restore();
  c.lineCap = 'butt';
  snakeHead(c, hx, hy, md, st === 'strike' || st === 'rattle' || (md === 'ok' && f % 40 < 8));
};

// ---------------------------------------------------------------------------------------------------------------
// Crow: glossy black (a blue sheen lit on it), the heavy beak, wings beating in four frames (tucked in the swoop), a
// caw on the swoop; belly up dead, feet in the air.

const CROW = '#22222C';

const paintCrow = (g: Ctx, fr: number, swoop: boolean, md: Mood) => {
  g.save();
  if (md === 'dead') { g.rotate(Math.PI); g.translate(0, 18); }
  const flap = swoop ? 0.5 : md === 'dead' ? 1 : [1, 0.3, -0.6, 0.2][fr];
  // (the far wing)
  ink(g, () => { g.moveTo(-1, -12); g.lineTo(-6 - 2 * Math.abs(flap), -12 - 9 * flap); g.lineTo(4, -11); g.closePath(); }, '#141418', 0.9);
  // (the tail: a wedge of feathers)
  ink(g, () => { g.moveTo(-8, -10); g.lineTo(-17, -13); g.lineTo(-18, -9); g.lineTo(-16, -6); g.closePath(); }, CROW, 1);
  // (the body, the head: glossy, stepped, a blue-purple sheen)
  sh(g, () => g.ellipse(0, -9, 10, 5.4, 0.1, 0, Math.PI * 2), CROW, -10, -15, 20, 11);
  g.fillStyle = '#5A6A9A'; g.fillRect(-5, -13, 7, 1);
  sh(g, () => g.ellipse(9, -12, 4.8, 4.2, 0, 0, Math.PI * 2), CROW, 4, -16, 10, 9);
  g.fillStyle = '#6A7AAA'; g.fillRect(7, -15, 3, 1);
  // (the beak: heavy, gray-black, its lit ridge)
  ink(g, () => { g.moveTo(12, -13.5); g.lineTo(19, -11.6); g.lineTo(12, -9.8); g.closePath(); }, '#3A3A44', 0.8);
  g.fillStyle = '#7A7A86'; g.fillRect(13, -13, 4, 0.8);
  if (swoop && md === 'ok') { g.fillStyle = '#A83A3A'; g.fillRect(13, -11.6, 4, 0.8); }
  eye(g, 10, -13, md, 1.2, '#1A1A20', swoop);
  // (the near wing: up, level, down; its primaries fingered)
  ink(g, () => { g.moveTo(-3, -11); g.lineTo(-7 - 4 * Math.abs(flap), -11 - 13 * flap); g.lineTo(-2 - 3 * Math.abs(flap), -10 - 12 * flap); g.lineTo(2, -11 - 9 * flap); g.lineTo(6, -10); g.closePath(); }, '#2E2E3A', 1);
  g.fillStyle = '#4A4A5E'; g.fillRect(-2, -11 - 6 * flap, 5, 1);
  // (the feet: tucked; stuck up dead)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(1, -4); g.lineTo(md === 'dead' ? 2 : 0, md === 'dead' ? 1 : -2); g.moveTo(3, -4); g.lineTo(md === 'dead' ? 5 : 3, md === 'dead' ? 1 : -2); g.stroke();
  if (md === 'dead') tongue(g, 16, -10, 3);
  g.restore();
};

export const drawCrow = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), swoop = e.aiState === 'swoop';
  const fr = md === 'ok' && !swoop ? cyc(f, e, 4, 4) : 0;
  put(c, `crow-${fr}-${swoop ? 1 : 0}-${md}`, -22, -34, 46, 40, g => paintCrow(g, fr, swoop, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Porcupine: a round, dark brown waddler under a mantle of quills (banded: dark at the root, the white tip), the
// blunt face; bristled up and out when it turns its back on him; belly up dead, its little feet up.

const paintPorcupine = (g: Ctx, bristle: boolean, fr: number, md: Mood) => {
  const fur = '#4E3622';
  g.save();
  // (dead: slumped flat, the quills lying down)
  if (md === 'dead') g.translate(0, 3);
  if (md === 'hurt') g.translate(-1, 1);
  const up = md === 'dead' ? -0.2 : bristle ? 1 : 0.35;
  // (the quills: a fan of spikes, banded (the dark root, the pale shaft, the white tip), out over the back)
  g.lineCap = 'round';
  for (let k = 0; k < 17; k++) {
    const a = -Math.PI + 0.22 + (k / 16) * (Math.PI - 0.44), len = 9 + up * 9 + (k % 2) * 3 + (k % 3);
    const bx = Math.cos(a) * 12, by = -11 + Math.sin(a) * 8, ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = '#3A2A1A'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (ex - bx) * 0.45, by + (ey - by) * 0.45); g.stroke();
    g.strokeStyle = '#D8CCB0'; g.beginPath(); g.moveTo(bx + (ex - bx) * 0.45, by + (ey - by) * 0.45); g.lineTo(bx + (ex - bx) * 0.85, by + (ey - by) * 0.85); g.stroke();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + (ex - bx) * 0.85, by + (ey - by) * 0.85); g.lineTo(ex, ey); g.stroke();
  }
  g.lineCap = 'butt';
  // (the body under it, stepped; shaggy guard hairs)
  sh(g, () => g.ellipse(0, -10, 15, 10, 0, 0, Math.PI * 2), fur, -15, -20, 30, 20);
  tick(g, -12, -18, 24, 12, fur, 14, 6);
  // (the legs: short, waddling, the claws)
  const w = md === 'ok' ? [2, -2, 1, -1][fr] : 0;
  for (const [lx, s] of [[-8, -1], [6, 1]] as const) { stroke(g, lx, -5, lx + w * s, -1, 3.4, dark(fur, 0.3)); g.fillStyle = '#D8CCB0'; g.fillRect(lx + w * s + 1, -1, 2, 1); }
  // (the face: blunt, darker, the black nose, the little eye)
  sh(g, () => g.ellipse(13, -8, 6.4, 5.4, 0, 0, Math.PI * 2), '#6E523A', 7, -13, 13, 11);
  ink(g, () => g.ellipse(18.5, -8.5, 1.8, 1.6, 0, 0, Math.PI * 2), '#1C1209', 0.6);
  eye(g, 13.5, -10, md, 1.2);
  if (md === 'dead') tongue(g, 17, -5, 3);
  g.restore();
};

export const drawPorcupine = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), bristle = e.aiState === 'bristle';
  const fr = md === 'ok' && Math.abs(e.vel.x) > 0.2 ? cyc(f, e, 4, 8) : 0;
  // (bristling, the quills rattle: a jiggle)
  const jig = bristle && md === 'ok' ? ((f >> 1) % 2) : 0;
  c.save(); c.translate(jig, 0);
  put(c, `porc-${bristle ? 1 : 0}-${fr}-${md}`, -34, -46, 68, 52, g => paintPorcupine(g, bristle, fr, md));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Bison: a mountain of brown, the shaggy hump and mane down its forelegs (darker, in clumps), the beard, short black
// horns curving up, small mean eyes; roaming, pawing (a forehoof scraping, snorting steam), the charge (head down, a
// four-frame gallop), skidding, hurt, dead.

const BIS = '#5E3E24', SHAG = '#3A2A1C';

const paintBison = (g: Ctx, pose: string, fr: number, md: Mood) => {
  g.save();
  if (md === 'dead') bellyUp(g, 70);
  if (md === 'hurt') g.translate(-2, 2);
  const charge = pose === 'charge', paw = pose === 'paw';
  const sw = (k: number) => (charge ? [10, 3, -10, -3][(fr + k) % 4] : pose === 'walk' ? [4, -4][(fr + k) % 2] : 0);
  const legAt = (x: number, k: number, far: boolean, front: boolean) => {
    const col = far ? dark(BIS, 0.25) : BIS, hy = -26;
    if (md === 'dead') { leg(g, x, hy, x + (front ? 5 : -5), hy + 12, x + (front ? 9 : -9), -3, 8, 6, col, '#140C06'); return; }
    let s = sw(k), lift = 0;
    if (paw && front && !far) { s = [6, 2, -4][fr % 3]; lift = [6, 2, 0][fr % 3]; }
    leg(g, x, hy, x + s * 0.5, hy + 12 - lift * 0.5, x + s, -3 - lift, 8, 6, col, '#140C06');
  };
  legAt(22, 1, true, true); legAt(-34, 0, true, false);
  // (the body: the lower hindquarters, the tail, the great hump up front in its shag)
  ink(g, () => { g.moveTo(-40, -42); g.quadraticCurveTo(-48, -32, -46, -26); g.lineTo(-43, -27); g.quadraticCurveTo(-44, -34, -38, -40); g.closePath(); }, dark(BIS, 0.25), 1);
  sh(g, () => g.ellipse(-14, -36, 28, 17, 0, 0, Math.PI * 2), BIS, -42, -53, 56, 34);
  tick(g, -36, -48, 40, 20, BIS, 22, 8);
  sh(g, () => g.ellipse(16, -44, 27, 25, 0, 0, Math.PI * 2), SHAG, -11, -69, 54, 50, 1.2);
  // (the shag in clumps: lit tufts up top, dark ones down the front)
  for (let k = 0; k < 14; k++) { const a = -Math.PI * 0.9 + k * 0.22, rx = 16 + Math.cos(a) * 24, ry = -44 + Math.sin(a) * 22; ink(g, () => g.ellipse(rx, ry, 4, 3, a, 0, Math.PI * 2), k < 7 ? lite(SHAG, 0.18) : SHAG, 0.6); }
  g.fillStyle = lite(SHAG, 0.32); g.fillRect(4, -66, 16, 2); g.fillRect(8, -68, 8, 1);
  legAt(32, 3, false, true); legAt(-24, 2, false, false);
  // (the mane hanging down the forelegs)
  for (let k = 0; k < 5; k++) ink(g, () => g.ellipse(28 + k * 2, -24 + (k % 2) * 3, 3, 6, 0.2, 0, Math.PI * 2), SHAG, 0.6);
  // (the head: big and low (lower charging), the beard, the dark muzzle, the horns curving up, the little mean eye)
  const hx = 40, hy = charge ? -24 : -32;
  sh(g, () => g.ellipse(hx, hy, 12, 13, 0, 0, Math.PI * 2), SHAG, hx - 12, hy - 13, 24, 26, 1.2);
  ink(g, () => { g.moveTo(hx - 3, hy + 10); g.lineTo(hx + 4, hy + 23); g.lineTo(hx + 7, hy + 18); g.lineTo(hx + 10, hy + 10); g.closePath(); }, SHAG, 1);
  sh(g, () => g.ellipse(hx + 9, hy + 4, 6.4, 6.4, 0, 0, Math.PI * 2), '#2A1A10', hx + 3, hy - 2, 13, 13, 1);
  g.fillStyle = '#0A0604'; g.fillRect(hx + 12, hy + 2.5, 2, 2);
  for (const [col, wd] of [[INK, 4.4], ['#4A4440', 2.6], ['#B8B0A8', 1]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - 3, hy - 9); g.quadraticCurveTo(hx - 4, hy - 20, hx + 5, hy - 21); g.stroke(); }
  g.lineCap = 'butt';
  eye(g, hx + 4, hy - 4, md, 1.8, '#3A1A0A', charge || paw);
  if (md === 'dead') tongue(g, hx + 8, hy + 10, 8);
  g.restore();
};

export const drawBison = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'idle';
  let pose = 'stand', fr = 0;
  if (st === 'charge') { pose = 'charge'; fr = cyc(f, e, 4, 4); }
  else if (st === 'paw') { pose = 'paw'; fr = cyc(f, e, 3, 8); }
  else if (Math.abs(e.vel.x) > 0.25) { pose = 'walk'; fr = cyc(f, e, 2, 14); }
  if (md !== 'ok') { pose = 'stand'; fr = 0; }
  put(c, `bison-${pose}-${fr}-${md}`, -56, -80, 120, 92, g => paintBison(g, pose, fr, md));
  // (pawing: steam snorted out of its nose, and dirt kicked back)
  if (st === 'paw' && md === 'ok' && f % 20 < 10) for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(240, 240, 240, 0.75)'; c.fillRect(56 + i * 3, -30 - i, 2, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// Trout: a rainbow trout (the olive back speckled black, the pink stripe, the silver belly), a mouth full of teeth (the
// park's "aggressive" stock), the fin up out of the water as the tell; arched along its leap (drawn live: it turns
// with its flight), belly up dead.

const paintTrout = (g: Ctx, open: boolean, wag: number, md: Mood, angry: boolean) => {
  // (the tail: a forked fan, wagging)
  ink(g, () => { g.moveTo(-10, 0); g.lineTo(-18, -6 + wag); g.lineTo(-15, 0 + wag * 0.3); g.lineTo(-18, 6 + wag); g.closePath(); }, '#6A7A3A', 1);
  g.fillStyle = '#8A9A4A'; g.fillRect(-16, -4 + wag, 2, 3);
  // (the dorsal fin up)
  ink(g, () => { g.moveTo(-4, -5); g.lineTo(0, -10.5); g.lineTo(3.5, -5); g.closePath(); }, '#5A6A2A', 0.8);
  // (the body: stepped; the silver belly; the pink stripe; the black speckles)
  sh(g, () => g.ellipse(0, 0, 13, 5.6, 0, 0, Math.PI * 2), '#7A8A44', -13, -6, 26, 12);
  g.save(); g.beginPath(); g.ellipse(0, 0, 13, 5.6, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = '#E4E4D8'; g.beginPath(); g.ellipse(1, 3.6, 11, 2.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E87A8A'; g.fillRect(-11, -0.6, 21, 2); g.fillStyle = '#F4A8B2'; g.fillRect(-9, -0.6, 16, 0.8);
  g.restore();
  for (const [sx, sy] of [[-8, -3], [-4, -4], [0, -3.4], [-6, 0.4], [4, -4], [-10, -1.4], [2, -1.4]] as const) { g.fillStyle = '#1C1C14'; g.fillRect(sx, sy, 1.2, 1.2); }
  // (the pectoral fin)
  ink(g, () => { g.moveTo(5, 2); g.lineTo(1, 5); g.lineTo(5, 4); g.closePath(); }, '#C8A0A0', 0.6);
  // (the head: the jaw open on teeth when it's after him, the gill line, the eye)
  g.strokeStyle = dark('#7A8A44', 0.4); g.lineWidth = 0.8; g.beginPath(); g.moveTo(6.5, -3.6); g.quadraticCurveTo(8, 0, 6.5, 3.6); g.stroke();
  if (open) { ink(g, () => { g.moveTo(9, 0.6); g.lineTo(14, -1.2); g.lineTo(14, 3.4); g.closePath(); }, '#9A2A3A', 0.8); g.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) { g.fillRect(10 + k * 1.4, -0.5, 0.8, 1.2); g.fillRect(10 + k * 1.4, 2.2, 0.8, 1); } }
  eye(g, 8.4, -2, md, 1.3, '#E8C040', angry);
  if (md === 'dead') tongue(g, 12, 2, 3);
};

export const drawTrout = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState ?? 'idle';
  const angry = st === 'chase' || st === 'leap' || st === 'fin';
  const open = angry || md === 'dead';
  const wag = md === 'dead' ? 0 : Math.round(Math.sin(f * (angry ? 0.7 : 0.25)) * 3);
  c.save();
  c.translate(0, -6);
  if (md === 'dead') c.rotate(Math.PI);
  else if (st === 'leap') c.rotate(Math.atan2(e.vel.y, Math.abs(e.vel.x) || 1) * 0.9);
  put(c, `trout-${open ? 1 : 0}-${wag}-${md}-${angry ? 1 : 0}`, -22, -14, 42, 24, g => paintTrout(g, open, wag, md, angry));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The beehive: a papery gray-brown hive hanging off its twig, banded in layers (each lit along its top), the dark
// entrance near its bottom, swaying; bees buzzing round it (fat, striped, inked); torn open dead.

const paintHive = (g: Ctx, md: Mood) => {
  const P = R(md === 'hurt' ? '#D8C8A0' : '#B0A07A');
  // (the twig it's hung from)
  g.fillStyle = INK; g.fillRect(-2, -11, 4, 13); g.fillStyle = '#5A3A1E'; g.fillRect(-1, -11, 2, 12);
  const shape = () => { g.moveTo(0, 0); g.bezierCurveTo(14, 2, 14, 26, 0, 31); g.bezierCurveTo(-14, 26, -14, 2, 0, 0); g.closePath(); };
  part(g, shape, P, -13, 0, 26, 31, 1.2);
  // (the paper in layers: each band lit along its top, a shade under it)
  g.save(); g.beginPath(); shape(); g.clip();
  for (let k = 1; k < 6; k++) { const y = k * 5, hw = 12 - Math.abs(k - 2.6) * 1.8; g.fillStyle = P[1]; g.fillRect(-hw, y, hw * 2, 1); g.fillStyle = P[5]; g.fillRect(-hw + 2, y + 1, hw * 1.2, 1); }
  g.restore();
  // (the entrance: a dark hole near the bottom; torn open when it's down)
  if (md === 'dead') { ink(g, () => { g.moveTo(-6, 10); g.lineTo(5, 12); g.lineTo(7, 22); g.lineTo(-4, 24); g.closePath(); }, '#2A1A0C', 0.8); g.fillStyle = '#E8B830'; for (let i = 0; i < 6; i++) g.fillRect(-3 + (i % 3) * 3, 14 + Math.floor(i / 3) * 4, 2, 2); }
  else { ink(g, () => g.ellipse(0, 23, 3, 2.2, 0, 0, Math.PI * 2), '#1A0E06', 0.6); }
};

export const drawHive = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e);
  const sway = Math.sin(f * 0.05 + (e.variant ?? 0)) * 0.08;
  c.save(); c.translate(0, -e.height); c.rotate(sway);
  put(c, `hive-${md}`, -16, -14, 32, 48, g => paintHive(g, md));
  c.restore();
  // (bees, buzzing round it: fat, striped, inked, their wings a blur)
  if (md !== 'dead') for (let i = 0; i < 6; i++) {
    const a = f * 0.2 + i * 1.3, bx = Math.round(Math.cos(a) * 17), by = Math.round(-e.height * 0.5 + Math.sin(a * 1.4) * 15);
    c.fillStyle = INK; c.fillRect(bx - 2, by - 2, 5, 4);
    c.fillStyle = '#F2C21A'; c.fillRect(bx - 1, by - 1, 3, 2); c.fillStyle = INK; c.fillRect(bx, by - 1, 1, 2);
    c.fillStyle = 'rgba(240, 248, 255, 0.7)'; c.fillRect(bx - 1, by - 4 + ((f + i) % 4 < 2 ? 0 : 1), 3, 1);
  }
};
