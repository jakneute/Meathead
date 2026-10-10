// The jungle's animals, drawn the way Meathead 1's best wildlife is (an ink line round every part, each material in
// steps: its shadow, its shade, itself, lit, its highlight; glints in the eyes, fur ticked in), with frames for what
// they're doing: idling (breathing, blinking, a tail going), moving (a walk cycle, a flap), winding up, attacking
// (stretched out with it), hurt (squashed, eyes screwed shut) and dead (limp, eyes crossed out, tongue out: nobody
// dies with dignity in this game). Each frame's painted once into a stamp, by kind, look and frame, and put down with
// one drawImage after that (the boa's hanging body is the exception: it's strung live from its branch to its head).
//
// All drawn facing right from a point at the feet (the caller flips it), inside the same boxes as before.

import type { Enemy } from '../../../m1/types';
import { stamp } from '../../../m1/game/render/stamp';
import { mix } from '../../../m1/game/render/backdrops/core';
import { INK, ink, eye, limb, lite, dark } from '../../../m1/game/render/npc/kit';

type Ctx = CanvasRenderingContext2D;

/** The five steps of a material: its shadow, its shade, itself, lit, its highlight. */
const ramp = (c: string) => [dark(c, 0.5), dark(c, 0.26), c, lite(c, 0.22), lite(c, 0.45)];

/**
 * A part in steps: clipped to its shape, its color; lit toward the upper left (a band, then a smaller highlight),
 * shaded toward the lower right (a band, then the darkest rim); dithered where the light meets the color; inked.
 */
const part = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1) => {
  const r = ramp(col);
  g.save(); g.beginPath(); path(); g.clip();
  g.fillStyle = r[2]; g.fillRect(x, y, w, h);
  g.fillStyle = r[1]; g.beginPath(); g.ellipse(x + w * 0.78, y + h * 0.8, w * 0.55, h * 0.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[0]; g.beginPath(); g.ellipse(x + w * 0.95, y + h * 1.0, w * 0.4, h * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[3]; g.beginPath(); g.ellipse(x + w * 0.3, y + h * 0.28, w * 0.42, h * 0.36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[4]; g.beginPath(); g.ellipse(x + w * 0.24, y + h * 0.2, w * 0.18, h * 0.14, 0, 0, Math.PI * 2); g.fill();
  // (a dither row where the lit band meets the color)
  g.fillStyle = r[3];
  for (let px = x; px < x + w; px += 2) g.fillRect(px, y + h * 0.56 + ((px >> 1) % 2), 1, 1);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke();
};
/** Fur ticked in over a part: short strokes, dark and light. */
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = ramp(col);
  for (let i = 0; i < n; i++) {
    const s = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = s - Math.floor(s), s2 = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = s2 - Math.floor(s2);
    g.fillStyle = k2 < 0.5 ? r[1] : r[3];
    g.fillRect(x + k * w, y + k2 * h, 1, 2);
  }
};
/** Eyes screwed shut (hurt), or crossed out (dead). */
const shut = (g: Ctx, x: number, y: number, s = 2) => { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y); g.lineTo(x - s, y + s); g.stroke(); };
const crossed = (g: Ctx, x: number, y: number, s = 2) => { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); };
const tongue = (g: Ctx, x: number, y: number, len = 5) => { ink(g, () => g.ellipse(x, y + len / 2, 2, len / 2 + 1, 0.2, 0, Math.PI * 2), '#E87A90', 0.8); g.fillStyle = '#C0506A'; g.fillRect(x - 0.5, y + 1, 1, len - 1); };

/** What it's doing, for its look. */
type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
/** Puts a frame down: painted once for this key. */
const put = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => stamp(c, `jga-${key}`, x, y, w, h, paint);

// ---------------------------------------------------------------------------------------------------------------
// Monkey: a capuchin, sat up on a branch: the brown body, the cream face and shoulders, the dark cap, the long tail
// hanging off the branch. Idle: breathing, blinking, the tail swaying, scratching now and then. Throwing: the arm back
// over its head with it (shit, mostly), then over. Hurt: hunched, eyes shut, screeching. Dead: slumped, tongue out.

const MONKEY_FUR = ['#6B4423', '#7A5230', '#5E3B22'];

const paintMonkey = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const fur = MONKEY_FUR[v % 3], cream = '#E6CBA0', cap = dark(fur, 0.45);
  const bob = pose === 'sit' ? [0, -0.5, -1, -0.5][fr] : 0;
  const sq = md === 'hurt' ? 1.5 : 0, slump = md === 'dead' ? 4 : 0;
  // The tail: off the back of the branch and down, curled at the end, swaying
  const sway = md === 'dead' ? 0 : [-3, -1, 2, 1][fr];
  g.lineCap = 'round';
  for (const [col, w] of [[INK, 5], [dark(fur, 0.2), 3], [lite(fur, 0.15), 1]] as [string, number][]) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(-8, -6); g.bezierCurveTo(-18, -2, -16 + sway, 16, -10 + sway, 24); g.quadraticCurveTo(-4 + sway, 30, -8 + sway, 32); g.stroke();
  }
  g.lineCap = 'butt';
  g.save(); g.translate(0, sq + slump * 0.5); g.rotate(md === 'dead' ? -0.35 : 0);
  // The haunch and foot, the back arm resting
  part(g, () => g.ellipse(-2, -6, 9, 6, 0, 0, Math.PI * 2), dark(fur, 0.1), -11, -12, 18, 12);
  ink(g, () => g.ellipse(6, -1.5, 5, 2, 0, 0, Math.PI * 2), '#3A2414', 0.8);
  // The body: a pear, the cream throat and shoulders
  const by = -15 + bob;
  part(g, () => g.ellipse(0, by, 9, 11 - sq, -0.1, 0, Math.PI * 2), fur, -9, by - 11, 18, 22);
  tick(g, -6, by - 8, 12, 14, fur, 14, v + 1);
  ink(g, () => g.ellipse(3, by - 6, 5, 4, 0, 0, Math.PI * 2), cream, 0.8);
  // The head: the cap, the ears, the cream face, the eyes, the muzzle
  const hx = 4, hy = -27 + bob + sq * 1.5;
  for (const ex of [hx - 7, hx + 7]) ink(g, () => g.arc(ex, hy + 1, 3, 0, Math.PI * 2), cream, 0.8);
  part(g, () => g.arc(hx, hy, 8, 0, Math.PI * 2), fur, hx - 8, hy - 8, 16, 16);
  ink(g, () => { g.moveTo(hx - 7, hy - 2); g.quadraticCurveTo(hx - 2, hy - 11, hx + 6, hy - 5); g.quadraticCurveTo(hx, hy - 5, hx - 7, hy - 2); }, cap, 0.6);
  part(g, () => g.ellipse(hx + 2, hy + 1.5, 5.6, 5.4, 0, 0, Math.PI * 2), cream, hx - 4, hy - 4, 12, 11, 0.8);
  if (md === 'dead') { crossed(g, hx, hy, 1.5); crossed(g, hx + 4.5, hy, 1.5); tongue(g, hx + 4, hy + 4, 4); }
  else if (md === 'hurt' || (pose === 'sit' && fr === 3)) { shut(g, hx, hy); shut(g, hx + 4.5, hy); }
  else { eye(g, hx + 0.5, hy - 0.5, 1.6, 0.6, 0, '#F4E8D0'); eye(g, hx + 5, hy - 0.5, 1.6, 0.6, 0, '#F4E8D0'); }
  g.fillStyle = INK; g.fillRect(hx + 4, hy + 2.5, 1, 1); g.fillRect(hx + 6, hy + 2.5, 1, 1);
  if (md === 'hurt' || pose === 'throw') { ink(g, () => g.ellipse(hx + 5, hy + 5, 2, 2.4, 0, 0, Math.PI * 2), '#5A1A1A', 0.7); g.fillStyle = '#FFFFFF'; g.fillRect(hx + 4, hy + 3, 2, 1); }
  else { g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(hx + 3, hy + 5); g.quadraticCurveTo(hx + 5, hy + 6, hx + 7, hy + 4.5); g.stroke(); }
  // The front arm: on the knee; up scratching its head; back over its head with something in its fist; over and out
  const sh = { x: 4, y: by - 4 };
  let hand = { x: 9, y: -4 };
  if (md === 'dead') hand = { x: 10, y: 2 };
  else if (md === 'hurt') hand = { x: 9, y: -22 };
  else if (pose === 'sit' && fr === 2) hand = { x: hx - 2, y: hy - 8 };
  else if (pose === 'windup') hand = [{ x: -2, y: -34 }, { x: -8, y: -38 }, { x: -10, y: -36 }][fr];
  else if (pose === 'throw') hand = [{ x: 14, y: -26 }, { x: 16, y: -16 }][fr];
  const elbow = { x: (sh.x + hand.x) / 2 + (pose === 'windup' ? -4 : 3), y: (sh.y + hand.y) / 2 + 3 };
  limb(g, sh.x, sh.y, elbow.x, elbow.y, 4, fur); limb(g, elbow.x, elbow.y, hand.x, hand.y, 3.4, lite(fur, 0.1));
  ink(g, () => g.arc(hand.x, hand.y, 2.4, 0, Math.PI * 2), '#3A2414', 0.8);
  if (pose === 'windup') { ink(g, () => g.ellipse(hand.x - 1, hand.y - 3, 4, 3, 0, 0, Math.PI * 2), '#5A3A12', 0.8); g.fillStyle = '#7C5A2A'; g.fillRect(hand.x - 3, hand.y - 5, 2, 1); }
  g.restore();
};

export const drawMonkeyArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), t = e.aiTimer ?? 0;
  let pose = 'sit', fr = Math.floor((f + (e.variant ?? 0) * 13) / 14) % 4;
  // (scratching and blinking: only now and then)
  if (fr === 2 && ((f >> 6) + (e.variant ?? 0)) % 3) fr = 1;
  if (fr === 3 && ((f >> 5) + (e.variant ?? 0)) % 4) fr = 0;
  if (e.aiState === 'windup') { if (t < 16) { pose = 'windup'; fr = Math.min(2, Math.floor(t / 6)); } else { pose = 'throw'; fr = Math.min(1, Math.floor((t - 16) / 4)); } }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `monkey-${(e.variant ?? 0) % 3}-${pose}-${fr}-${md}`, -26, -48, 52, 84, g => paintMonkey(g, e.variant ?? 0, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Chimp: big, black, knuckle-walking; the bare face and ears, the brow; hooting with its arms up, then a leap, arms
// out, mouth wide. Squashed on landing (the recover), stretched in the air.

const paintChimp = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const fur = ['#2B211B', '#33261E', '#262019'][v % 3], skin = '#C9A08A', skinD = '#9A7462';
  const step = pose === 'walk' ? [3, 1, -3, -1][fr] : 0;
  const squash = pose === 'land' ? 4 : md === 'hurt' ? 3 : 0, stretch = pose === 'leap' ? 3 : 0;
  g.save();
  if (md === 'dead') { g.translate(0, 0); g.rotate(-0.15); }
  // The legs: short, bent; back one darker
  for (const [lx, d, s] of [[-8, 0.15, -step], [6, 0, step]] as [number, number, number][]) {
    limb(g, lx, -18 + squash, lx + s * 0.4, -8 + squash * 0.5, 8, dark(fur, d));
    limb(g, lx + s * 0.4, -8 + squash * 0.5, lx + s, -2, 7, dark(fur, d));
    ink(g, () => g.ellipse(lx + s + 2, -1.5, 5, 2, 0, 0, Math.PI * 2), skinD, 0.8);
  }
  // The back arm: down on its knuckles walking; up hooting; out, leaping
  const armUp = pose === 'hoot' || pose === 'leap';
  const backHand = md === 'dead' ? { x: -16, y: -2 } : armUp ? { x: -14, y: pose === 'leap' ? -50 : -58 + (fr % 2) * 4 } : { x: -12 - step, y: -2 };
  limb(g, -4, -38 + squash, (backHand.x - 4) / 2 - 2, (backHand.y - 38) / 2 + 2, 8, dark(fur, 0.2)); limb(g, (backHand.x - 4) / 2 - 2, (backHand.y - 38) / 2 + 2, backHand.x, backHand.y, 7, dark(fur, 0.2));
  ink(g, () => g.arc(backHand.x, backHand.y, 3.5, 0, Math.PI * 2), skinD, 0.8);
  // The body: hunched, broad shoulders, lit along the back
  const by = -30 + squash - stretch;
  part(g, () => g.ellipse(0, by, 16, 17 - squash * 0.6 + stretch, pose === 'leap' ? -0.3 : 0.15, 0, Math.PI * 2), fur, -16, by - 17, 32, 34, 1.2);
  tick(g, -12, by - 12, 24, 22, fur, 30, v + 7);
  // The head: brow ridge, the bare face, ears; hooting (lips out, an O), snarling on the leap
  const hx = 11, hy = -44 + squash - stretch;
  for (const ex of [hx - 9]) ink(g, () => g.ellipse(ex, hy + 1, 3.4, 4.4, 0, 0, Math.PI * 2), skin, 0.8);
  part(g, () => g.arc(hx, hy, 10, 0, Math.PI * 2), fur, hx - 10, hy - 10, 20, 20, 1.1);
  part(g, () => { g.moveTo(hx - 3, hy - 4); g.quadraticCurveTo(hx + 6, hy - 9, hx + 11, hy - 3); g.quadraticCurveTo(hx + 12, hy + 6, hx + 7, hy + 9); g.quadraticCurveTo(hx, hy + 9, hx - 3, hy + 3); g.closePath(); }, skin, hx - 3, hy - 9, 15, 18, 0.9);
  g.fillStyle = skinD; g.fillRect(hx - 1, hy - 4, 11, 2);
  if (md === 'dead') { crossed(g, hx + 2, hy - 1, 1.6); crossed(g, hx + 7, hy - 1, 1.6); tongue(g, hx + 7, hy + 6, 6); }
  else if (md === 'hurt') { shut(g, hx + 2, hy - 1); shut(g, hx + 7, hy - 1); }
  else { eye(g, hx + 2.5, hy - 1, 1.6, 0.6, 0, '#E8D8B0'); eye(g, hx + 7.5, hy - 1, 1.6, 0.6, 0, '#E8D8B0'); }
  g.fillStyle = INK; g.fillRect(hx + 7, hy + 2, 1, 1); g.fillRect(hx + 9, hy + 2, 1, 1);
  if (pose === 'hoot') { const o = 2 + (fr % 2) * 1.5; ink(g, () => g.ellipse(hx + 9, hy + 6, 2.6, o, 0, 0, Math.PI * 2), '#4A1212', 0.8); }
  else if (pose === 'leap' || md === 'hurt') { ink(g, () => { g.moveTo(hx + 3, hy + 4); g.lineTo(hx + 12, hy + 3); g.lineTo(hx + 11, hy + 9); g.lineTo(hx + 4, hy + 8); g.closePath(); }, '#4A1212', 0.8); g.fillStyle = '#F8FAFC'; g.fillRect(hx + 4, hy + 4, 7, 1.4); g.fillRect(hx + 5, hy + 7, 5, 1); }
  else { g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(hx + 4, hy + 6); g.lineTo(hx + 10, hy + 6); g.stroke(); }
  // The front arm
  const frontHand = md === 'dead' ? { x: 18, y: -2 } : armUp ? { x: 18, y: pose === 'leap' ? -46 : -58 + ((fr + 1) % 2) * 4 } : { x: 16 + step, y: -2 };
  const el = { x: (6 + frontHand.x) / 2 + (armUp ? 4 : 2), y: (by - 4 + frontHand.y) / 2 };
  limb(g, 6, by - 4, el.x, el.y, 8, fur); limb(g, el.x, el.y, frontHand.x, frontHand.y, 7, lite(fur, 0.08));
  ink(g, () => g.arc(frontHand.x, frontHand.y, 3.6, 0, Math.PI * 2), skinD, 0.8);
  g.restore();
};

export const drawChimpArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  let pose = 'walk', fr = Math.floor((f + (e.variant ?? 0) * 7) / 8) % 4;
  if (st === 'hoot') { pose = 'hoot'; fr = Math.floor(f / 6) % 2; }
  else if (st === 'leap') { pose = 'leap'; fr = 0; }
  else if (st === 'recover') { pose = (e.aiTimer ?? 0) < 10 ? 'land' : 'stand'; fr = 0; }
  if (Math.abs(e.vel.x) < 0.2 && pose === 'walk') { pose = 'stand'; fr = 0; }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `chimp-${(e.variant ?? 0) % 3}-${pose}-${fr}-${md}`, -34, -80, 68, 84, g => paintChimp(g, e.variant ?? 0, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Jaguar: long, low, gold with rosettes, the pale belly; a prowl cycle (four legs going, the shoulders rolling), the
// crouch (down low, the tail lashing, ears back, teeth), the pounce (stretched out flat, claws out), the landing.

const paintJaguar = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const gold = ['#E3A537', '#D99A30', '#E8AE44'][v % 3], belly = '#F4E2BC', spot = '#2E1A06';
  const low = pose === 'crouch' ? 7 : pose === 'land' || md === 'hurt' ? 4 : md === 'dead' ? 14 : 0;
  const stretch = pose === 'pounce' ? 1.16 : 1;
  const ph = pose === 'walk' ? fr * (Math.PI / 2) : 0;
  // A leg: shoulder/hip, the bend, the paw; claws out on the pounce
  const leg = (bx: number, i: number, back: boolean) => {
    const col = back ? dark(gold, 0.22) : gold;
    if (md === 'dead') { limb(g, bx, -14, bx + (i < 2 ? 10 : -10), -3, 6, col); return; }
    if (pose === 'pounce') {
      const ex = bx + (i < 2 ? 18 : -18), ey = -18 + (i % 2) * 3;
      limb(g, bx, -18, ex, ey, 6, col); ink(g, () => g.ellipse(ex + (i < 2 ? 3 : -3), ey, 4, 2.6, 0, 0, Math.PI * 2), lite(col, 0.1), 0.8);
      if (i < 2) { g.fillStyle = '#F8FAFC'; for (let k = 0; k < 3; k++) g.fillRect(ex + 6, ey - 2 + k * 1.6, 2, 0.8); }
      return;
    }
    const sw = Math.sin(ph + i * Math.PI * 0.5 + (back ? Math.PI : 0)) * 5, lift = Math.max(0, Math.cos(ph + i * Math.PI * 0.5 + (back ? Math.PI : 0))) * 3;
    const kx = bx + sw * 0.4, ky = -9 + low * 0.5;
    limb(g, bx, -17 + low, kx, ky, 7, col); limb(g, kx, ky, bx + sw, -2 - lift, 5, col);
    ink(g, () => g.ellipse(bx + sw + 2, -1.5 - lift, 4, 2, 0, 0, Math.PI * 2), lite(col, 0.08), 0.8);
  };
  leg(-22, 2, true); leg(18, 0, true);
  // The tail: thick, ringed toward the black tip, lashing in the crouch
  const lash = pose === 'crouch' ? [-6, 4][fr % 2] : pose === 'walk' ? [-2, 0, 2, 0][fr] : 0;
  g.save(); g.translate(-30 * stretch, -22 + low); g.rotate(md === 'dead' ? 0.6 : -0.2);
  const tail = () => { g.moveTo(0, -3); g.quadraticCurveTo(-14, -10 + lash, -24, -4 + lash * 1.5); g.quadraticCurveTo(-28, 0 + lash * 1.5, -24, 2 + lash * 1.5); g.quadraticCurveTo(-12, -2 + lash, 0, 4); g.closePath(); };
  part(g, tail, gold, -28, -12, 30, 18);
  g.fillStyle = spot; for (let k = 0; k < 3; k++) g.fillRect(-10 - k * 5, -5 + lash * (0.5 + k * 0.3), 2, 4);
  g.fillRect(-27, -2 + lash * 1.5, 4, 4);
  g.restore();
  // The body: long and low, the back lit, the belly pale, rosettes (rings of spots round a darker middle)
  const by = -22 + low, rx = 30 * stretch, ry = 11 - (pose === 'land' ? 2 : 0);
  const body = () => g.ellipse(0, by, rx, ry, pose === 'pounce' ? -0.12 : md === 'dead' ? 0.05 : 0, 0, Math.PI * 2);
  part(g, body, gold, -rx, by - ry, rx * 2, ry * 2, 1.2);
  g.save(); g.beginPath(); body(); g.clip();
  g.fillStyle = belly; g.beginPath(); g.ellipse(2, by + ry * 0.9, rx * 0.8, ry * 0.45, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 12; i++) {
    const sx = -rx + 7 + (i % 6) * (rx * 2 - 14) / 5 + (i >= 6 ? 4 : 0), sy = by - 6 + (i >= 6 ? 7 : 0) + ((i * 5) % 3) - 1;
    g.fillStyle = dark(gold, 0.18); g.beginPath(); g.arc(sx, sy, 2.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = spot; g.lineWidth = 1.3; g.beginPath(); g.arc(sx, sy, 3.4, 0.4, Math.PI * 2 - 0.5); g.stroke();
    g.fillStyle = spot; g.fillRect(sx - 0.6, sy - 0.6, 1.2, 1.2);
  }
  g.restore();
  leg(-16, 3, false); leg(24, 1, false);
  // The head: broad, the round ears (back in the crouch), the muzzle, whiskers; snarling with its fangs out
  const hx = 32 * stretch - 2, hy = -28 + low * 1.2 + (pose === 'pounce' ? 3 : 0);
  const earBack = pose === 'crouch' || pose === 'pounce' ? 3 : 0;
  ink(g, () => g.arc(hx - 5 - earBack, hy - 8 + earBack * 0.6, 3.6, 0, Math.PI * 2), gold, 0.9);
  ink(g, () => g.arc(hx + 1 - earBack, hy - 9 + earBack * 0.6, 3.4, 0, Math.PI * 2), dark(gold, 0.15), 0.9);
  part(g, () => g.ellipse(hx, hy, 10.5, 9, 0, 0, Math.PI * 2), gold, hx - 10, hy - 9, 21, 18, 1.1);
  g.fillStyle = spot; for (const [sx, sy] of [[-5, -4], [-2, -6], [-7, 1], [1, -3]]) g.fillRect(hx + sx, hy + sy, 1.6, 1.6);
  ink(g, () => g.ellipse(hx + 7, hy + 3, 5.5, 4, 0, 0, Math.PI * 2), belly, 0.8);
  ink(g, () => { g.moveTo(hx + 9, hy - 0.5); g.lineTo(hx + 12.5, hy - 0.5); g.lineTo(hx + 10.8, hy + 2); g.closePath(); }, '#7A3A3A', 0.6);
  const snarl = pose === 'crouch' || pose === 'pounce' || md === 'hurt';
  if (md === 'dead') { crossed(g, hx + 4, hy - 3, 1.8); tongue(g, hx + 9, hy + 6, 7); }
  else if (md === 'hurt') shut(g, hx + 4, hy - 3, 2.2);
  else { ink(g, () => g.ellipse(hx + 4, hy - 3, 2.4, 1.6, 0, 0, Math.PI * 2), '#D9F99D', 0.7); g.fillStyle = INK; g.fillRect(hx + 4.4, hy - 4.4, 1, 2.8); g.fillStyle = '#FFFFFF'; g.fillRect(hx + 3, hy - 4, 1, 1); }
  if (snarl) {
    ink(g, () => { g.moveTo(hx + 3, hy + 5); g.lineTo(hx + 12, hy + 5); g.lineTo(hx + 11, hy + 10); g.lineTo(hx + 4, hy + 9); g.closePath(); }, '#5A1414', 0.8);
    g.fillStyle = '#F8FAFC'; for (const tx of [hx + 5, hx + 10]) { g.beginPath(); g.moveTo(tx - 1, hy + 5); g.lineTo(tx, hy + 8.5); g.lineTo(tx + 1, hy + 5); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(hx + 1, hy - 6); g.lineTo(hx + 7, hy - 4.6); g.stroke();
  }
  g.strokeStyle = '#F8FAFC'; g.lineWidth = 0.5; for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(hx + 9, hy + 3 + k); g.lineTo(hx + 16, hy + 2 + k * 2); g.stroke(); }
};

export const drawJaguarArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), st = e.aiState;
  let pose = 'walk', fr = Math.floor((f + (e.variant ?? 0) * 5) / 7) % 4;
  if (st === 'crouch') { pose = 'crouch'; fr = Math.floor(f / 6) % 2; }
  else if (st === 'pounce') { pose = 'pounce'; fr = 0; }
  else if (st === 'recover') { pose = (e.aiTimer ?? 0) < 12 ? 'land' : 'stand'; fr = 0; }
  if (Math.abs(e.vel.x) < 0.2 && pose === 'walk') { pose = 'stand'; fr = 0; }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `jaguar-${(e.variant ?? 0) % 3}-${pose}-${fr}-${md}`, -72, -50, 136, 54, g => paintJaguar(g, e.variant ?? 0, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Boa: its coils round the branch and the body hanging from them are strung live (a few stepped strokes: the shadow,
// the green, its lit back, the saddle pattern along it); its head's a stamp: idle (the tongue flicking), coiled back
// (mouth open, hissing), striking (jaws wide), hurt, dead.

const BOA = ['#2E5418', '#3F6B21', '#5A8A2E', '#86B23E', '#B8D86A'];

const paintBoaHead = (g: Ctx, pose: string, fr: number, md: Mood) => {
  const open = pose === 'coil' ? 3 : pose === 'strike' ? 6 : md === 'hurt' ? 3 : md === 'dead' ? 4 : 0;
  // (the lower jaw, dropped)
  if (open) ink(g, () => { g.moveTo(-6, 2); g.quadraticCurveTo(8, 3 + open, 18, 2 + open); g.lineTo(17, 5 + open); g.quadraticCurveTo(6, 8 + open, -6, 6); g.closePath(); }, BOA[2], 0.9);
  if (open) { g.fillStyle = '#9F1239'; g.beginPath(); g.moveTo(0, 2); g.lineTo(16, 2 + open * 0.8); g.lineTo(16, 1); g.closePath(); g.fill(); g.fillStyle = '#F8FAFC'; for (const tx of [6, 12]) { g.beginPath(); g.moveTo(tx, 1); g.lineTo(tx + 1, 4); g.lineTo(tx + 2, 1); g.fill(); } }
  // (the head: broad at the back, the snout, lit along the top, the scales)
  part(g, () => { g.moveTo(-8, -6); g.quadraticCurveTo(4, -9, 14, -4); g.quadraticCurveTo(19, -1, 18, 1); g.lineTo(-2, 3); g.quadraticCurveTo(-9, 2, -8, -6); g.closePath(); }, BOA[2], -9, -9, 28, 12);
  g.fillStyle = BOA[1]; for (let k = 0; k < 4; k++) g.fillRect(-4 + k * 4, -3 + (k % 2), 2, 1);
  g.fillStyle = BOA[4]; g.fillRect(0, -7, 8, 1);
  // (the eye: yellow, slit; a dark stripe through it)
  g.fillStyle = BOA[0]; g.fillRect(0, -4, 12, 2);
  if (md === 'dead') crossed(g, 6, -4, 1.6);
  else if (md === 'hurt') shut(g, 6, -4, 1.6);
  else { ink(g, () => g.ellipse(6, -4, 2.2, 1.8, 0, 0, Math.PI * 2), '#FDE047', 0.6); g.fillStyle = INK; g.fillRect(5.6, -5.6, 1, 3.2); }
  g.fillStyle = INK; g.fillRect(15, -2, 1, 1);
  // (the tongue, flicking: out, forked)
  if (md === 'dead') { g.strokeStyle = '#DC2626'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(14, 4); g.quadraticCurveTo(18, 10, 15, 14); g.stroke(); }
  else if (!open && fr > 0) { const L = fr === 1 ? 6 : 10; g.strokeStyle = '#DC2626'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(17, 0); g.lineTo(17 + L, 0); g.lineTo(20 + L, -2); g.moveTo(17 + L, 0); g.lineTo(20 + L, 2); g.stroke(); }
};

export const drawBoaArt = (c: Ctx, e: Enemy, f: number, ax: number, ay: number, loose: boolean) => {
  const md = mood(e), hx = 0, hy = -e.height / 2;
  // The coils round the branch: three rings, lit on top
  if (!loose) for (let i = -1; i <= 1; i++) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(ax + i * 9, ay, 8, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BOA[1]; c.beginPath(); c.ellipse(ax + i * 9, ay, 7, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BOA[3]; c.beginPath(); c.ellipse(ax + i * 9 - 2, ay - 3, 4, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6E4A1E'; c.fillRect(ax + i * 9 - 2, ay + 1, 4, 3);
  }
  // The body hanging between: stepped strokes (the ink, the shadow, the green, the lit back), the saddles along it
  const mx = (ax + hx) / 2 + Math.sin(f * 0.05) * 10, my = Math.max(ay, hy) + 20;
  const path = () => { c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx - 6, hy); };
  c.lineCap = 'round';
  for (const [col, w, dy] of [[INK, 13, 0], [BOA[0], 11, 0], [BOA[2], 8, -1], [BOA[3], 3, -3]] as [string, number, number][]) { c.save(); c.translate(0, dy); c.strokeStyle = col; c.lineWidth = w; path(); c.stroke(); c.restore(); }
  c.lineCap = 'butt';
  for (let k = 1; k < 9; k++) {
    const t = k / 9, px = (1 - t) * (1 - t) * ax + 2 * t * (1 - t) * mx + t * t * (hx - 6), py = (1 - t) * (1 - t) * ay + 2 * t * (1 - t) * my + t * t * hy;
    c.fillStyle = INK; c.fillRect(px - 3, py - 3, 6, 5); c.fillStyle = '#6E4A1E'; c.fillRect(px - 2, py - 2, 4, 3); c.fillStyle = '#9A6E32'; c.fillRect(px - 2, py - 2, 2, 1);
  }
  // The head
  let pose = 'idle', fr = Math.floor(f / 5) % 8;
  fr = fr === 1 ? 1 : fr === 2 ? 2 : 0;
  if (e.aiState === 'coil') pose = 'coil';
  else if (e.aiState === 'strike') pose = 'strike';
  if (md !== 'ok') { pose = md; fr = 0; }
  c.save(); c.translate(hx + 2, hy);
  put(c, `boahead-${pose}-${fr}-${md}`, -12, -12, 48, 30, g => paintBoaHead(g, pose, fr, md));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Macaw: scarlet; the wings blue over yellow over red; a white face, the black hooked beak; the long tail. Flapping
// (four frames: up, level, down, level), the swoop (wings swept back, talons out, beak open), the climb (beating hard).

const paintMacaw = (g: Ctx, pose: string, fr: number, md: Mood) => {
  const red = '#D42A20', yellow = '#F5C518', blue = '#1F5FD0';
  const swoop = pose === 'swoop';
  // The tail: long, red, blue-tipped
  ink(g, () => { g.moveTo(-8, -10); g.lineTo(-30, swoop ? -18 : -6); g.lineTo(-29, swoop ? -14 : -1); g.lineTo(-8, -6); g.closePath(); }, red, 0.9);
  g.fillStyle = blue; g.fillRect(-29, swoop ? -17 : -5, 6, 3);
  // The far wing (behind), the body, the near wing
  const wingY = md === 'dead' ? 6 : swoop ? 4 : [-16, -6, 4, -6][fr];
  const wing = (dx: number, sh: number) => {
    const tipX = swoop ? -22 + dx : -14 + dx, tipY = -11 + wingY * 1.3;
    ink(g, () => { g.moveTo(-4 + dx, -13); g.quadraticCurveTo(-2 + dx, (tipY - 13) / 2 - 2, tipX, tipY); g.lineTo(tipX + 6, tipY + (wingY < -10 ? 3 : -2)); g.quadraticCurveTo(6 + dx, -10, 6 + dx, -12); g.closePath(); }, dark(blue, sh), 0.9);
    // (the yellow and red bands nearer the body)
    g.fillStyle = dark(yellow, sh); g.beginPath(); g.moveTo(-2 + dx, -12); g.lineTo((tipX + dx) / 2, (tipY - 12) / 2); g.lineTo(4 + dx, -11); g.fill();
    g.fillStyle = dark(red, sh); g.fillRect(-2 + dx, -13, 6, 2);
    g.fillStyle = lite(blue, 0.35); g.fillRect(Math.min(tipX, -2 + dx) + 2, Math.min(tipY, -13) + 1, 3, 1);
  };
  wing(-3, 0.3);
  part(g, () => g.ellipse(0, -11, 11, 7, swoop ? 0.35 : md === 'dead' ? 1.2 : 0, 0, Math.PI * 2), red, -11, -18, 22, 14);
  // (talons: tucked, or out on the swoop)
  g.strokeStyle = '#3A3A3A'; g.lineWidth = 1.4;
  if (swoop) { g.beginPath(); g.moveTo(4, -5); g.lineTo(9, 0); g.lineTo(11, -1); g.moveTo(9, 0); g.lineTo(10, 2); g.stroke(); }
  else { g.beginPath(); g.moveTo(0, -5); g.lineTo(-2, -2); g.stroke(); }
  // The head: red, the white face patch with its lines, the eye, the beak (open swooping)
  part(g, () => g.arc(10, -15, 6, 0, Math.PI * 2), red, 4, -21, 12, 12);
  ink(g, () => g.ellipse(12, -15, 3.6, 3, 0, 0, Math.PI * 2), '#F5F5F4', 0.6);
  g.fillStyle = '#9CA3AF'; g.fillRect(10, -13, 3, 0.6); g.fillRect(11, -12, 3, 0.6);
  if (md === 'dead') crossed(g, 12, -15.5, 1.4); else if (md === 'hurt') shut(g, 12, -15.5, 1.4);
  else { g.fillStyle = '#FDE68A'; g.fillRect(11, -16.5, 2, 2); g.fillStyle = INK; g.fillRect(11.5, -16, 1, 1); }
  const gape = swoop || md !== 'ok' ? 2 : 0;
  ink(g, () => { g.moveTo(15, -17); g.quadraticCurveTo(21, -17, 21, -11); g.lineTo(18, -13 + gape * 0.3); g.quadraticCurveTo(17, -15, 15, -14); g.closePath(); }, '#1C1917', 0.6);
  ink(g, () => { g.moveTo(15, -12 + gape); g.lineTo(18, -11 + gape); g.lineTo(15, -10 + gape); g.closePath(); }, '#3A3532', 0.5);
  g.fillStyle = '#E7E5E4'; g.fillRect(16, -16, 3, 1);
  if (md === 'dead') tongue(g, 17, -10, 3);
  wing(3, 0);
};

export const drawMacawArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e);
  let pose = 'fly', fr = Math.floor(f / (e.aiState === 'climb' ? 3 : 5)) % 4;
  if (e.aiState === 'swoop') { pose = 'swoop'; fr = 0; }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `macaw-${pose}-${fr}-${md}`, -34, -32, 60, 40, g => paintMacaw(g, pose, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// Poison dart frog: tiny, glossy, warning-colored (blue with black spots, strawberry red with blue legs, yellow and
// black); sat (the throat pulsing), crouched to hop, in the air (legs out behind it), landing (squashed flat).

const FROGS = [['#38BDF8', '#1D4ED8'], ['#E0302A', '#1E40AF'], ['#FACC15', '#111827']];

const paintFrog = (g: Ctx, v: number, pose: string, fr: number, md: Mood) => {
  const [skin, legC] = FROGS[v % 3];
  const air = pose === 'air', squash = pose === 'land' ? 2 : pose === 'crouch' ? 1 : 0;
  g.save();
  if (md === 'dead') { g.translate(0, -3); g.scale(1, -1); g.translate(0, 10); }
  // The back legs: folded under it sat; kicked out behind in the air
  if (air) { limb(g, -5, -6, -14, -3, 3, legC); limb(g, -14, -3, -19, -1, 2.4, legC); ink(g, () => g.ellipse(-20, -1, 2, 1.2, 0, 0, Math.PI * 2), legC, 0.6); }
  else { ink(g, () => g.ellipse(-5, -3 + squash * 0.5, 6, 3.4 - squash * 0.5, 0, 0, Math.PI * 2), legC, 0.8); ink(g, () => g.ellipse(-2, -0.8, 4, 1.2, 0, 0, Math.PI * 2), dark(legC, 0.2), 0.6); }
  // The body: glossy, a big highlight, the spots
  const by = -7 + squash;
  part(g, () => g.ellipse(0, by, 10 + squash, (air ? 5 : 6.5) - squash, air ? -0.15 : 0, 0, Math.PI * 2), skin, -10, by - 7, 20, 13);
  g.fillStyle = v % 3 === 1 ? '#1E1B4B' : '#0B1220';
  for (const [sx, sy, r] of [[-5, -2, 1.6], [1, 0.5, 1.4], [-2, -3.5, 1.1], [5, -2.5, 1]] as [number, number, number][]) { g.beginPath(); g.arc(sx, by + sy, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#FFFFFF'; g.fillRect(-4, by - 4.5, 3, 1); g.fillRect(-5, by - 3.5, 1, 1);
  // The front legs
  if (!air) { limb(g, 5, by + 3, 7, -1, 2.2, legC); g.fillStyle = legC; g.fillRect(6, -1.4, 3, 1.2); }
  else limb(g, 6, by + 2, 11, by + 5, 2.2, legC);
  // The eye: big, black, a glint; the throat going
  if (md === 'dead') crossed(g, 6, by - 4.5, 1.6);
  else if (md === 'hurt') shut(g, 6, by - 4.5, 1.6);
  else { ink(g, () => g.arc(6, by - 4.5, 2.6, 0, Math.PI * 2), '#0B1220', 0.6); g.fillStyle = '#FFFFFF'; g.fillRect(6, by - 6, 1, 1); }
  if (pose === 'sit' && fr === 1) ink(g, () => g.arc(7, by + 3, 2.6, 0, Math.PI * 2), lite(skin, 0.4), 0.6);
  if (md === 'dead') tongue(g, 9, by + 1, 3);
  g.restore();
};

export const drawFrogArt = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), air = e.vel.y !== 0;
  let pose = air ? 'air' : 'sit', fr = 0;
  if (!air) {
    const t = e.aiTimer ?? 0;
    fr = Math.floor(f / 12) % 4 === 0 ? 1 : 0;
    if (t < 6) pose = 'land';
    else if (t > 40) pose = 'crouch';
  }
  if (md !== 'ok') { pose = md; fr = 0; }
  put(c, `frog-${(e.variant ?? 0) % 3}-${pose}-${fr}-${md}`, -24, -22, 40, 30, g => paintFrog(g, e.variant ?? 0, pose, fr, md));
};

void mix;
