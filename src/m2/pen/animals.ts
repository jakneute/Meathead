// The staff room's animals, for practicing the grabs on (the owner's "spawn in mid sized animals in the break room too for
// practice" / "like golden retrievers, lol"): mid-sized, so every grab and follow-up works on them (grab: 'body'), and,
// like everybody in there, harmless and moved by hand (pen/index.ts).
//
//   retriever  somebody's golden retriever, brought in to work and never taken home: dopey, the tongue out, the tail
//              going, a red collar with its tag; it bounds over to him and jumps up at him, and never learns
//   wolf       one of the wilds' gray wolves, got out (Wilderness Land's art: frontier/wilds/kindArt.ts)
//   jaguar     one of the jungle's jaguars, got out (Jungle Land's art: adventure/jungle/animalArt.ts)
//
// The wolf and the jaguar run off from him like the staff do; the retriever comes to him. Each drawn on the move
// whenever it's moved by hand (their art goes by their speed, and in here they're put where they go, not sped there).
//
// The retriever, drawn the wilds' animals' way (peak SNES: an ink line round every part, each material in steps, fur
// ticked in, a glint in the eye): standing (the tail wagging, panting), trotting (four frames), jumping up (reared up on
// its hind legs, front paws out at him), hurt (eyes screwed shut) and dead (belly up, legs stiff, eyes crossed out, the
// tongue out). Each frame painted once into a stamp; facing right from its feet, at its base size (scaled up by RS).

import type { Enemy } from '../../m1/types';
import { stamp } from '../../m1/game/render/stamp';
import { limb as stroke } from '../../m1/game/render/npc/kit';
import { registerM2Kind } from '../kinds';
import { mix, rampOf, part, INK } from '../frontier/wilds/paint';
import { drawWolf } from '../frontier/wilds/kindArt';
import { drawJaguarArt } from '../adventure/jungle/animalArt';
import { penMoving } from './staff';

type Ctx = CanvasRenderingContext2D;
type Mood = 'ok' | 'hurt' | 'dead';
const mood = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');

export const PEN_RETRIEVER = 'm2:pen_retriever', PEN_WOLF = 'm2:pen_wolf', PEN_JAGUAR = 'm2:pen_jaguar';
/** The animals in there (pen/index.ts keeps a few about). */
export const PEN_ANIMALS: string[] = [PEN_RETRIEVER, PEN_WOLF, PEN_JAGUAR];
/** The retriever's jumping up at him (pen/index.ts sets it: drawn reared up while it's in the air). */
export const penJumping = new WeakSet<Enemy>();

// ---------------------------------------------------------------------------------------------------------------
// The retriever

const GOLD = '#D9A441', GOLD_D = '#A8742A', CREAM = '#F4D88E', NOSE = '#2A1A14', TONGUE = '#EC7A92', COLLAR = '#C8282E';
const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
const dark = (c: string, k = 0.3) => mix(c, INK, k);
const ink = (g: Ctx, path: () => void, fill: string, line = 1) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); };
const sh = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1) => part(g, path, rampOf(col), x, y, w, h, line);
/** A leg, hip to joint to paw; the feathering down the back of it. */
const leg = (g: Ctx, hx: number, hy: number, jx: number, jy: number, fx: number, fy: number, col: string, back: boolean) => {
  stroke(g, hx, hy, jx, jy, 4.2, col);
  stroke(g, jx, jy, fx, fy, 3, col);
  g.fillStyle = lite(col, 0.2); g.fillRect(Math.min(hx, jx) - 0.5, Math.min(hy, jy), 1, Math.abs(jy - hy) * 0.7);
  // (the feathers off the back of the leg, the gold's long hair)
  if (back) { g.fillStyle = lite(col, 0.32); for (let k = 0; k < 3; k++) g.fillRect(Math.round(hx - 3 + (jx - hx) * k * 0.3), Math.round(hy + 2 + (jy - hy) * k * 0.3), 2, 2); }
  ink(g, () => g.ellipse(fx + 0.8, fy, 3, 1.7, 0, 0, Math.PI * 2), lite(col, 0.1), 0.8);
};
/** Fur ticked in over a box. */
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = rampOf(col);
  for (let i = 0; i < n; i++) {
    const a = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = a - Math.floor(a), b = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = b - Math.floor(b);
    g.fillStyle = k2 < 0.5 ? r[2] : r[4]; g.fillRect(x + k * w, y + k2 * h, 1, 2);
  }
};

/** How much bigger than its base drawing it is (a big dumb dog). */
const RS = 1.3;
const sz = (n: number) => Math.round(n * RS);

/** Its coat by its look (a pale one, a red one, the classic). */
const COATS = [GOLD, '#E6BC6A', '#C8823A'];

const paintRetriever = (g: Ctx, pose: string, fr: number, wag: number, md: Mood, v: number) => {
  const fur = COATS[v % COATS.length], furD = dark(fur, 0.22), pale = mix(fur, CREAM, 0.6);
  g.save();
  if (md === 'dead') { g.translate(0, -34); g.scale(1, -1); }
  if (md === 'hurt') g.translate(-1, 2);
  const jump = pose === 'jump';
  // (reared up on its hind legs, about its back feet)
  if (jump) { g.translate(-12, 0); g.rotate(-0.62); g.translate(12, 0); }
  const tr = [[4, -4], [-4, 4], [3, -3], [-3, 3]][fr] ?? [0, 0];
  const go = pose === 'trot';
  const legAt = (x: number, front: boolean, far: boolean) => {
    const col = far ? furD : fur, hy = -15;
    if (md === 'dead') { leg(g, x, hy, x + (front ? 3 : -3), hy + 7, x + (front ? 5 : -5), -2, col, !front); return; }
    // (jumping: the front legs out at him, paws up; the hind ones planted)
    if (jump && front) { leg(g, x, hy, x + 7, hy + 2, x + 13 + (far ? -2 : 0), hy - 2 + (far ? -2 : 0), col, false); return; }
    const sw = go ? (front ? tr[0] : tr[1]) * (far ? -1 : 1) : 0;
    leg(g, x, hy, x + sw * 0.5 + (front ? 1 : -2), hy + 7, x + sw, -1, col, !front);
  };
  legAt(12, true, true); legAt(-11, false, true);
  // (the tail: a big plume, wagging: up and over one way, then the other)
  const ta = [-0.75, -0.2, 0.35][wag] ?? 0, tl = md === 'dead' ? 0.4 : ta;
  g.save(); g.translate(-15, -22); g.rotate(-1.15 + tl);
  ink(g, () => { g.moveTo(0, -2); g.quadraticCurveTo(10, -7, 19, -3); g.quadraticCurveTo(13, 4, 0, 3); g.closePath(); }, lite(fur, 0.08), 1);
  g.fillStyle = lite(fur, 0.35); for (let k = 0; k < 4; k++) g.fillRect(4 + k * 3.5, 1 - k * 0.6, 2, 1);
  g.fillStyle = dark(fur, 0.15); for (let k = 0; k < 3; k++) g.fillRect(5 + k * 4, -3 - k * 0.4, 2, 1);
  g.restore();
  // (the body: deep-chested, stepped; the pale belly with its feathers hanging; the fur ticked in)
  sh(g, () => g.ellipse(0, -21, 16.5, 8, 0, 0, Math.PI * 2), fur, -16.5, -29, 33, 16);
  g.save(); g.beginPath(); g.ellipse(0, -21, 16.5, 8, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = pale; g.beginPath(); g.ellipse(4, -14, 12, 3.2, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  g.fillStyle = pale; for (let k = 0; k < 5; k++) { g.fillRect(-6 + k * 3.5, -14 + (k % 2), 2, 3); }
  tick(g, -12, -27, 24, 9, fur, 16, v + 5);
  legAt(14, true, false); legAt(-9, false, false);
  // (the head: a broad skull, a short blunt muzzle, a soft ear hanging, the collar; the mouth wide open in a dumb grin,
  // the tongue hanging out the side and bobbing with the panting)
  const hx = 19, hy = -28;
  sh(g, () => g.ellipse(hx - 4, hy + 5, 6, 7, 0.3, 0, Math.PI * 2), fur, hx - 10, hy - 2, 12, 14);
  // (the collar: red, its gold tag)
  ink(g, () => { g.moveTo(hx - 9, hy + 3); g.lineTo(hx - 4, hy + 1); g.lineTo(hx - 1, hy + 8); g.lineTo(hx - 6, hy + 10); g.closePath(); }, COLLAR, 0.8);
  g.fillStyle = lite(COLLAR, 0.3); g.fillRect(hx - 7, hy + 4, 3, 1);
  ink(g, () => g.arc(hx - 2.5, hy + 11, 1.8, 0, Math.PI * 2), '#F2C21A', 0.6);
  sh(g, () => g.ellipse(hx, hy, 7.5, 6.6, 0, 0, Math.PI * 2), fur, hx - 7.5, hy - 6.6, 15, 13);
  // (the muzzle, blunt; the jaw hanging open)
  const open = md === 'hurt' ? 1 : 3 + (pose === 'stand' || jump ? fr % 2 : 0);
  ink(g, () => { g.moveTo(hx + 4, hy - 2); g.lineTo(hx + 12, hy - 0.5); g.quadraticCurveTo(hx + 13.5, hy + 2, hx + 12, hy + 3); g.lineTo(hx + 4, hy + 4); g.closePath(); }, lite(fur, 0.14), 1);
  ink(g, () => { g.moveTo(hx + 4, hy + 4); g.lineTo(hx + 11, hy + 3 + open * 0.4); g.lineTo(hx + 10, hy + 4 + open); g.lineTo(hx + 3, hy + 6); g.closePath(); }, '#7A2A30', 0.9);
  g.fillStyle = pale; g.beginPath(); g.ellipse(hx + 8, hy + 1.5, 4, 1.6, 0, 0, Math.PI * 2); g.fill();
  // (the tongue: long, out the side of the grin, the pant bobbing it)
  const tlen = md === 'dead' ? 8 : 6 + (fr % 2) * 1.5;
  ink(g, () => g.ellipse(hx + 7, hy + 4 + open * 0.6 + tlen / 2, 2.2, tlen / 2 + 0.6, 0.15, 0, Math.PI * 2), TONGUE, 0.8);
  g.fillStyle = dark(TONGUE, 0.3); g.fillRect(hx + 6.6, hy + 5 + open * 0.6, 0.8, tlen - 1.5);
  g.fillStyle = lite(TONGUE, 0.4); g.fillRect(hx + 5.6, hy + 5 + open * 0.6, 1, 2);
  ink(g, () => g.ellipse(hx + 12.6, hy - 0.6, 1.9, 1.5, 0, 0, Math.PI * 2), NOSE, 0.6);
  g.fillStyle = '#8A7A74'; g.fillRect(hx + 12, hy - 1.6, 1, 1);
  // (the eye: big, brown, not much going on in there; the brow up, dopey; a crossed-out eye dead, screwed shut hurt)
  const ex = hx + 2, ey = hy - 2.5;
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.moveTo(ex - 1.8, ey - 1.8); g.lineTo(ex + 1.8, ey + 1.8); g.moveTo(ex - 1.8, ey + 1.8); g.lineTo(ex + 1.8, ey - 1.8); g.stroke(); }
  else if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.moveTo(ex - 1.8, ey - 1.2); g.lineTo(ex + 1.2, ey); g.lineTo(ex - 1.8, ey + 1.2); g.stroke(); }
  else {
    ink(g, () => g.ellipse(ex, ey, 2.2, 2.1, 0, 0, Math.PI * 2), '#FFFFFF', 0.6);
    // (the pupil off up toward nothing in particular)
    ink(g, () => g.ellipse(ex + 0.5, ey - 0.4, 1.4, 1.5, 0, 0, Math.PI * 2), '#4A2A14', 0.4);
    g.fillStyle = '#FFFFFF'; g.fillRect(ex - 0.2, ey - 1.4, 1, 1);
    g.strokeStyle = dark(fur, 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(ex - 2, ey - 3.6); g.quadraticCurveTo(ex, ey - 5, ex + 2.2, ey - 3.8); g.stroke();
  }
  // (the ear: soft, hanging down over the side of its head, flapping as it goes)
  const flop = go || jump ? [-0.15, 0.1, -0.1, 0.15][fr] ?? 0 : 0;
  g.save(); g.translate(hx - 3, hy - 4); g.rotate(0.35 + flop);
  sh(g, () => g.ellipse(0, 5, 3.6, 6.4, 0, 0, Math.PI * 2), mix(fur, GOLD_D, 0.55), -3.6, -1.4, 7.2, 12.8, 0.9);
  g.restore();
  g.restore();
};

export const drawRetriever = (c: Ctx, e: Enemy, f: number) => {
  const md = mood(e), v = e.variant ?? 0;
  let pose = 'stand', fr = Math.floor((f + v * 5) / 8) % 2;
  const moving = penMoving.has(e);
  if (penJumping.has(e) && md === 'ok' && e.vel.y !== 0) pose = 'jump';
  else if (moving || Math.abs(e.vel.x) > 0.6) { pose = 'trot'; fr = Math.floor((f + v * 7) / 4) % 4; }
  // (the tail never stops: faster the happier, which is always)
  const wag = md === 'ok' ? [0, 1, 2, 1][Math.floor((f + v * 3) / (pose === 'stand' ? 4 : 3)) % 4] : 1;
  if (md !== 'ok') { pose = 'stand'; fr = 0; }
  c.save(); c.scale(RS, RS);
  stamp(c, `pen-retriever-${v % COATS.length}-${pose}-${fr}-${wag}-${md}`, -40, -56, 84, 66, g => paintRetriever(g, pose, fr, wag, md, v));
  c.restore();
};

registerM2Kind({
  kind: PEN_RETRIEVER, stats: { w: sz(46), h: sz(34), hp: 90, contact: 0, mass: 75 },
  head: { x: 19 * RS, y: -28 * RS, r: 7.5 * RS }, gender: 'n', grab: 'body', pathing: false,
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  // (moved by hand in the staff room, like everybody in there)
  ai: (_ctx, e) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => drawRetriever(c, e, f),
});

// ---------------------------------------------------------------------------------------------------------------
// The wolf and the jaguar: the lands' own art, drawn on the move when they're moved by hand

/** Their art goes by their speed and their AI's state: moved by hand, they're given a trot's speed and no state to
 *  draw by, just for the drawing. */
const onTheMove = (e: Enemy, draw: () => void, speed: number) => {
  const v = e.vel.x, a = e.aiState;
  if (penMoving.has(e)) { e.vel.x = (e.facing ?? 1) * speed; e.aiState = undefined; }
  else if (e.health > 0) e.aiState = undefined;
  try { draw(); } finally { e.vel.x = v; e.aiState = a; }
};
const WS = 1.4;
registerM2Kind({
  kind: PEN_WOLF, stats: { w: Math.round(50 * WS), h: Math.round(32 * WS), hp: 95, contact: 0, mass: 100 },
  head: { x: 24 * WS, y: -26 * WS, r: 7 * WS }, gender: 'n', grab: 'body', pathing: false,
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  ai: (_ctx, e) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => onTheMove(e, () => { c.save(); c.scale(WS, WS); drawWolf(c, e, f); c.restore(); }, 1.5),
});
registerM2Kind({
  kind: PEN_JAGUAR, stats: { w: 72, h: 36, hp: 120, contact: 0, mass: 100 },
  head: { x: 32, y: -28, r: 10 }, gender: 'n', grab: 'body', pathing: false,
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  ai: (_ctx, e) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => onTheMove(e, () => drawJaguarArt(c, e, f), 1.5),
});
