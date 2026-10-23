// DAD MAN in bits: the weakness death (the user's: "stupid dad won't say anything after getting killed by the car
// that smashes him to death. his parts will be everywhere. the zoomed in camera will linger on his decapitated head";
// "his decapitated head as it flies through the air"; "stupid dad's other parts go flying elsewhere too"). The 6th
// stunt car comes down on him and he goes off like a dropped water balloon full of meat: not a word out of him.
//
// His head comes off whole and goes up end over end, spraying out of the neck, the kill cam riding along with it in
// slow motion, gross-up close (the user's "gross ren and stimpy style close ups"); it bounces, rolls, rocks up onto its
// stump and sits there on the deck in a spreading puddle, staring, while the camera lingers on it (a fly finds it). The
// rest of him goes everywhere at once: his arms (the anchor tattoo), a hand, his legs (the boxer cuffs, the black socks,
// the slippers), the beer gut whole in its stained tank top, a slab of chest with the ribs out of it, the seat of the
// boxers, rags of the tank top fluttering down, a rope of gut, a length of spine, lumps of him, the SWILL LITE can and
// the headset's beltpack: big arcs both ways across the set, some up out of the shot, whizzing past the head on its way
// up; landing, bouncing, sliding to a stop in a splat of their own. The wide shot after shows where it all ended up.
//
// In his units (dad.ts: DAD_K to the world), his ramps; each bit about its own middle, its long way along x. Flying
// they're drawn live (they spin); come to rest they're stamped (flat, mirrored at most), only the drips live.

import { type Ctx, type Ramp, shape, shapeTop, ell, px, line, limb, fill, dith } from './paint';
import { DAD_K, SKIN, FLUSH, TANK, BOXER, SOCK, SLIPPER, HAIR, STRIPE, STAIN, MUSTARD, SPOT, VEIN, TAT, MIC, IRIS, TEETH, can } from './dad';
import { BLOOD, gutRope, tooth } from './carnage';

const hash = (n: number) => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
const MEAT: Ramp = ['#F08A86', '#C8383C', '#9A1C24', '#6A0A12', '#2E0206'];
const BONE: Ramp = ['#FFFBEA', '#F0E6C8', '#D8C9A0', '#B0A070', '#5A4A2A'];
const TONGUE: Ramp = ['#FFB4BC', '#F08C9A', '#DA6A7E', '#B84C62', '#5A1A2A'];
const FAT = '#F2DC9A', LIPS = '#B0505A', MOUTH = '#3A0A14', CRUST = '#E8D27A';

// ---------------------------------------------------------------------------------------------------------------
// The pieces and how they fly

export type BitKind = 'arm' | 'upper' | 'hand' | 'leg' | 'shin' | 'gut' | 'chest' | 'seat' | 'tank' | 'boxer' | 'slipper' | 'can' | 'pack' | 'meat' | 'rope' | 'spine';
export interface Bit {
  kind: BitKind; seed: number;
  /** World: where (its middle), going, its turn and spin; mirrored either way (a rest's turn folded into these). */
  x: number; y: number; vx: number; vy: number; rot: number; vr: number; fx: 1 | -1; fy: 1 | -1;
  /** How high its middle sits lying on the deck (px); its fall (a rag floats); its bounce; down yet, stopped. */
  lie: number; g: number; bounce: number; landed: boolean; still: boolean; t: number;
}
/** A splat where something came down (world x, how big). */
export interface Splat { x: number; w: number; seed: number }
/** The head: where (the middle of the skull, world), going, its turn; flying, rocking up onto its stump, sat there; down
 *  yet (first touch), the frames since it started to settle, its rock, the puddle under it (0..1). */
export interface Head { x: number; y: number; vx: number; vy: number; rot: number; vr: number; state: 'fly' | 'settle' | 'rest'; landed: boolean; u: number; wob: number; pool: number }

/** The head's size (a touch over his: it's the star of the shot), its fall. */
export const HEAD_S = DAD_K * 1.1;
const HEAD_G = 0.42;
/** How high its middle sits on the deck at a turn: up on its stump (0), on its cheek, on its dome. */
const restOf = (rot: number) => { const c = Math.cos(rot); return HEAD_S * (15 + 8 * Math.max(0, c) + 5 * Math.max(0, -c)); };

/** The car comes down on him at (x, floorY - 40): the head up and away `side`, everything else everywhere. */
export const burst = (x: number, floorY: number, side: 1 | -1): { head: Head; bits: Bit[] } => {
  const head: Head = { x, y: floorY - 44, vx: side * 3.4, vy: -11.6, rot: 0, vr: side * 0.21, state: 'fly', landed: false, u: 0, wob: 0, pool: 0 };
  const bits: Bit[] = [];
  // (kind, how many, how heavy (slower, lower), whether it floats (a rag), how thick lying down)
  const set: [BitKind, number, number, boolean, number][] = [
    ['arm', 1, 0.8, false, 8.5], ['upper', 1, 0.7, false, 9], ['hand', 1, 0.5, false, 5], ['leg', 1, 1, false, 11], ['shin', 1, 0.8, false, 5],
    ['gut', 1, 1.6, false, 17], ['chest', 1, 1.3, false, 9], ['seat', 1, 1.3, false, 10], ['tank', 3, 1, true, 1], ['boxer', 2, 1, true, 1],
    ['slipper', 1, 0.6, false, 4], ['can', 1, 0.6, false, 4.5], ['pack', 1, 0.6, false, 5], ['meat', 6, 0.6, false, 4], ['rope', 2, 0.8, false, 4], ['spine', 1, 0.8, false, 3.5],
  ];
  let n = 0;
  for (const [kind, count, heavy, rag, lie] of set) for (let i = 0; i < count; i++, n++) {
    const s = hash(n * 3.1 + 7), dir = (n % 2 ? 1 : -1) as 1 | -1;
    // (a few up with the head, through its shot (the hand, the can, a lump, a rag); a few right up out of it, coming down
    // far off; the heavy ones low and short; the rest big arcs both ways, out across the set)
    const withHead = kind === 'hand' || kind === 'can' || (kind === 'meat' && i < 2) || (kind === 'tank' && i === 0);
    const high = !withHead && (kind === 'slipper' || kind === 'pack' || (kind === 'meat' && i === 2) || kind === 'spine');
    let vx: number, vy: number;
    if (withHead) { vx = side * (2.2 + s * 2.6); vy = -10.5 - hash(n + 1) * 3; }
    else if (high) { vx = dir * (3 + s * 3); vy = -15 - hash(n + 2) * 3; }
    else if (rag) { vx = dir * (1.5 + s * 4); vy = -4 - hash(n + 3) * 4; }
    else { vx = dir * (1.5 + s * 5.5) / Math.sqrt(heavy); vy = -(5 + hash(n + 3) * 5) / Math.sqrt(heavy); }
    bits.push({
      kind, seed: n, x: x + (hash(n + 4) - 0.5) * 40, y: floorY - 20 - hash(n + 5) * 30, vx, vy,
      rot: hash(n + 6) * 6, vr: (hash(n + 7) - 0.5) * (rag ? 0.2 : 0.6) / Math.sqrt(heavy), fx: 1, fy: 1,
      lie: lie * DAD_K, g: rag ? 0.16 : 0.42, bounce: rag ? 0 : kind === 'gut' ? 0.45 : 0.3, landed: false, still: false, t: 0,
    });
  }
  return { head, bits };
};

/** A frame of them flying (world: the deck, the walls either side); `land` each one's first touch down (where, how hard). */
export const tickBits = (bits: Bit[], splats: Splat[], floorY: number, lo: number, hi: number, land: (b: Bit, hard: number) => void) => {
  for (const b of bits) {
    if (b.still) continue;
    b.t++;
    const rag = b.g < 0.3;
    if (rag) { b.vx *= 0.985; b.vy = Math.min(b.vy, 2.4); b.vr = Math.sin(b.t * 0.15 + b.seed) * 0.08; }
    b.x += b.vx; b.y += b.vy; b.vy += b.g; b.rot += b.vr;
    if (b.x < lo || b.x > hi) { b.x = b.x < lo ? lo : hi; b.vx = -b.vx * 0.45; splats.push({ x: b.x, w: 5, seed: b.seed + 50 }); }
    const ground = floorY - b.lie;
    if (b.y < ground || b.vy < 0) continue;
    b.y = ground;
    if (!b.landed) { b.landed = true; land(b, b.vy); splats.push({ x: b.x, w: 6 + b.lie * 0.9 + hash(b.seed) * 6, seed: b.seed }); }
    if (b.vy > 2.4 && b.bounce > 0) { b.vy = -b.vy * b.bounce; b.vx *= 0.6; b.vr *= 0.5; continue; }
    // (down for good: sliding to a stop, flopping flat (the turn folded into a mirror: no flip as it goes flat))
    b.vy = 0; b.vx *= rag ? 0.6 : 0.8; b.vr = 0;
    let r = Math.atan2(Math.sin(b.rot), Math.cos(b.rot));
    if (Math.abs(r) > Math.PI / 2) { b.fx = -b.fx as 1 | -1; b.fy = -b.fy as 1 | -1; r -= Math.sign(r) * Math.PI; }
    b.rot = r * 0.7;
    if (Math.abs(b.vx) < 0.15 && Math.abs(b.rot) < 0.03) { b.still = true; b.rot = 0; b.vx = 0; }
  }
};

/** A frame of the head: flying (end over end), bouncing and rolling, rocking up onto its stump, sat; `bounce` each time
 *  it hits (the first, how hard). */
export const tickHead = (h: Head, floorY: number, lo: number, hi: number, bounce: (first: boolean, hard: number) => void) => {
  if (h.state === 'rest') { h.pool = Math.min(1, h.pool + 0.004); return; }
  if (h.state === 'settle') {
    // (rocked up onto the stump, wobbling to a stop face out)
    h.u++;
    h.rot = h.wob * Math.pow(0.9, h.u) * Math.cos(h.u * 0.42);
    h.y = floorY - restOf(h.rot);
    h.pool = Math.min(1, h.pool + 0.004);
    if (h.u >= 44) { h.state = 'rest'; h.rot = 0; h.y = floorY - restOf(0); }
    return;
  }
  h.x += h.vx; h.y += h.vy; h.vy += HEAD_G; h.rot += h.vr;
  if (h.x < lo || h.x > hi) { h.x = h.x < lo ? lo : hi; h.vx = -h.vx * 0.5; }
  const ground = floorY - restOf(h.rot);
  if (h.y < ground || h.vy < 0) return;
  h.y = ground;
  const first = !h.landed;
  h.landed = true;
  if (h.vy > 2.4) { bounce(first, h.vy); h.vy = -h.vy * 0.38; h.vx *= 0.62; h.vr = h.vx / (15 * HEAD_S); return; }
  // (rolling along the deck, slowing; then up onto the stump)
  h.vy = 0; h.vx *= 0.9; h.vr = h.vx / (15 * HEAD_S);
  if (Math.abs(h.vx) < 0.3) { h.state = 'settle'; h.u = 0; h.wob = Math.atan2(Math.sin(h.rot), Math.cos(h.rot)); h.vx = 0; h.vr = 0; }
};

/** Skipped: everything where it ends up (run on till it's all down, the head sat on its stump). */
export const settleAll = (head: Head, bits: Bit[], splats: Splat[], floorY: number, lo: number, hi: number) => {
  for (let k = 0; k < 900 && (head.state !== 'rest' || bits.some(b => !b.still)); k++) { tickBits(bits, splats, floorY, lo, hi, () => {}); tickHead(head, floorY, lo, hi, () => {}); }
  head.pool = 1;
};

/** Where the neck's stump is (world) and which way it points, for the spray off it in flight. */
export const stumpOf = (h: Head) => ({ x: h.x - Math.sin(h.rot) * 22 * HEAD_S, y: h.y + Math.cos(h.rot) * 22 * HEAD_S, ux: -Math.sin(h.rot), uy: Math.cos(h.rot) });

// ---------------------------------------------------------------------------------------------------------------
// Torn ends

/** A torn end of him at (x, y), `r` the half-thickness, facing `dir` along x: the ragged skin, the fat, the meat, the
 *  bone out of it, the strings of it hanging, a drip. */
const torn = (c: Ctx, x: number, y: number, r: number, dir: 1 | -1, seed: number, bone = true, skin: Ramp = SKIN) => {
  const pts: number[] = [];
  for (let k = 0; k <= 8; k++) pts.push(x + dir * (k % 2 ? 1.6 + hash(seed + k) * 2.2 : 0), y - r + (k / 8) * r * 2);
  fill(c, skin[3], () => { c.moveTo(x - dir * 2, y - r); for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineTo(x - dir * 2, y + r); c.closePath(); });
  ell(c, x + dir * 0.4, y, r * 0.5, r * 0.94, FAT);
  ell(c, x + dir * 0.7, y, r * 0.42, r * 0.8, MEAT[2]);
  ell(c, x + dir * 0.9, y - r * 0.2, r * 0.26, r * 0.42, MEAT[1]);
  px(c, x + dir * 0.6 - 0.3, y - r * 0.5, 0.6, r * 0.4, MEAT[0]);
  if (bone) {
    const bx = x + dir * 2.4;
    shape(c, () => c.rect(Math.min(x, bx + dir * 2), y - 1.4, Math.abs(bx + dir * 2 - x), 2.8), BONE, Math.min(x, bx), Math.max(x, bx), 0.5);
    ell(c, bx + dir * 2, y - 1.2, 1.5, 1.3, BONE[1]); ell(c, bx + dir * 2, y + 1.2, 1.5, 1.3, BONE[1]);
    ell(c, bx + dir * 2.2, y, 0.8, 0.7, BLOOD[2]);
  }
  for (let k = 0; k < 3; k++) { const sy = y - r * 0.6 + k * r * 0.6; line(c, [x + dir, sy, x + dir * (3 + hash(seed + k * 5) * 3), sy + 1.6 + hash(seed + k) * 2.4], 0.6, k % 2 ? MEAT[1] : BLOOD[3]); }
  ell(c, x + dir * 0.6, y + r + 0.8, 0.9, 1.3, BLOOD[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// The bits (his units, about the middle, lying along x)

const hand = (c: Ctx, x: number, y: number, curl = 0) => {
  shape(c, () => c.ellipse(x, y, 5.6, 5, 0, 0, Math.PI * 2), SKIN, x - 5.6, x + 5.6, 0.8);
  for (let k = 0; k < 4; k++) { const fy = y - 3.6 + k * 2.4; limb(c, x + 4, fy, 1.7, x + 9 - curl * 2.6, fy + curl * 1.6, 1.4, SKIN, 0, 0.55); ell(c, x + 9.2 - curl * 2.6, fy + curl * 1.4, 0.6, 0.5, '#E8D8A8'); }
  limb(c, x - 1, y - 4, 2, x + 3.6, y - 6.6, 1.6, SKIN, 0, 0.55);
  ell(c, x + 1, y - 1, 0.8, 0.6, SPOT); ell(c, x - 1.6, y + 0.6, 0.6, 0.5, SPOT);
};
const tattoo = (c: Ctx, ax: number, ay: number) => {
  line(c, [ax - 2.4, ay, ax + 2, ay], 0.7, TAT); line(c, [ax + 1, ay - 1.8, ax + 2.4, ay, ax + 1, ay + 1.8], 0.7, TAT); px(c, ax - 1.6, ay - 1.2, 0.6, 2.4, TAT);
};
const hairs = (c: Ctx, x0: number, x1: number, y: number) => { for (let x = x0; x < x1; x += 2.2) px(c, x, y - 0.4 + (x % 3 > 1.5 ? 0.6 : 0), 0.6, 1.4, HAIR[2]); };
const sock = (c: Ctx, x0: number, x1: number, y: number, r: number) => limb(c, x0, y, r, x1, y, r * 0.92, SOCK);
const slipper = (c: Ctx, x: number, y: number) => {
  // (on its side at the end of the leg, its sole toward +x, the toe up (-y): brown terry, the heel trodden flat)
  shape(c, () => { c.moveTo(x, y + 3); c.lineTo(x + 4, y + 3); c.quadraticCurveTo(x + 7, y - 5, x + 3.6, y - 12); c.quadraticCurveTo(x, y - 13, x - 0.6, y - 9); c.closePath(); }, SLIPPER, x - 1, x + 7);
  for (let k = 0; k < 4; k++) px(c, x + 0.6 + (k % 2), y - 9 + k * 2.6, 0.8, 0.8, SLIPPER[3]);
  px(c, x + 4.6, y - 8, 1, 9, SLIPPER[4]);
};
const tankRag = (c: Ctx, w: number, h: number, seed: number) => {
  const pts: number[] = [];
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, rr = 0.7 + hash(seed + k) * 0.5; pts.push(Math.cos(a) * w * rr, Math.sin(a) * h * rr); }
  const path = () => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); };
  shape(c, path, TANK, -w, w, 0.7);
  c.save(); c.beginPath(); path(); c.clip();
  for (let x = -w; x < w; x += 2.4) line(c, [x, -h, x + 1, h], 0.35, TANK[2]);
  ell(c, -w * 0.2, -h * 0.1, w * 0.5, h * 0.5, dith(c, STAIN)); ell(c, w * 0.35, h * 0.3, 1.6, 2.2, MUSTARD);
  ell(c, w * 0.5, -h * 0.4, w * 0.3, h * 0.35, BLOOD[3]); ell(c, w * 0.45, -h * 0.45, w * 0.18, h * 0.2, BLOOD[2]);
  c.restore();
};
const boxerRag = (c: Ctx, w: number, h: number, seed: number) => {
  const pts: number[] = [];
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, rr = 0.7 + hash(seed + k * 2) * 0.5; pts.push(Math.cos(a) * w * rr, Math.sin(a) * h * rr); }
  const path = () => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); };
  shape(c, path, BOXER, -w, w, 0.7);
  c.save(); c.beginPath(); path(); c.clip();
  for (let x = -w; x < w; x += 3.4) { px(c, x, -h, 1.1, h * 2, STRIPE); px(c, x + 1.1, -h, 0.5, h * 2, BOXER[0]); }
  ell(c, -w * 0.4, h * 0.3, w * 0.4, h * 0.4, BLOOD[3]);
  c.restore();
};
const meat = (c: Ctx, seed: number) => {
  const w = 4 + hash(seed) * 3, h = 3 + hash(seed + 1) * 2;
  shape(c, () => { c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.8, -h * 1.3, 0, -h); c.quadraticCurveTo(w * 1.1, -h * 0.9, w, 0.4); c.quadraticCurveTo(w * 0.6, h, -w * 0.2, h * 0.9); c.closePath(); }, MEAT, -w, w, 0.7);
  // (a strip of his skin on it, the fat under it, a hair or two; the shine)
  fill(c, SKIN[1], () => { c.moveTo(-w * 0.8, -h * 0.6); c.quadraticCurveTo(0, -h * 1.25, w * 0.7, -h * 0.7); c.lineTo(w * 0.5, -h * 0.35); c.quadraticCurveTo(0, -h * 0.8, -w * 0.6, -h * 0.3); c.closePath(); });
  line(c, [-w * 0.6, -h * 0.3, 0, -h * 0.75, w * 0.5, -h * 0.35], 0.6, FAT);
  if (seed % 2) { px(c, -1, -h * 1.1, 0.5, 1.4, HAIR[2]); px(c, 1, -h * 1.15, 0.5, 1.2, HAIR[2]); }
  ell(c, -w * 0.3, h * 0.2, 1, 0.6, MEAT[0]);
  if (seed % 3 === 0) { shape(c, () => c.rect(w * 0.2, -0.8, w * 0.9, 1.6), BONE, w * 0.2, w * 1.1, 0.4); ell(c, w * 1.15, 0, 1, 1.1, BONE[1]); }
};

const paintBit = (c: Ctx, kind: BitKind, seed: number) => {
  switch (kind) {
    case 'arm': {
      // (the near arm, whole, off at the shoulder: the bingo wing, the elbow, the anchor, the fat hand)
      limb(c, 0, 1, 6.8, 19, 0, 5.2, SKIN, 1.2); limb(c, -20, 0, 10, 0, 1, 7.2, SKIN, 3.4);
      ell(c, 0.6, 3.6, 3.6, 3, SKIN[2]); line(c, [-1, 6, 0.6, 7, 2, 6.2], 0.45, SKIN[3]);
      ell(c, -10, -1, 1.2, 0.9, SPOT); tattoo(c, 10, 0.6); hairs(c, 4, 17, -2.6);
      hand(c, 24, 0, 0.6); torn(c, -26, 0, 10.4, -1, seed);
      break;
    }
    case 'upper': {
      // (the far upper arm, off at both ends)
      limb(c, -13, 0, 10, 11, 1, 7.2, SKIN, 3.4); ell(c, -2, -2.6, 1.3, 1, SPOT);
      torn(c, -19, 0, 10.4, -1, seed); torn(c, 16, 1, 7.4, 1, seed + 3);
      break;
    }
    case 'hand': hand(c, 2, 0, 1); torn(c, -3, 0, 3.6, -1, seed); break;
    case 'leg': {
      // (a leg off at the hip: the boxer leg shredded, the bare knee, the shin and its vein, the black sock, the slipper)
      limb(c, -14, 0, 8.4, 4, 0.6, 6.4, SKIN, 1);
      limb(c, -26, 0, 12, -12, 0, 9.6, BOXER, 1.4);
      c.save(); c.beginPath(); c.rect(-38, -13, 26, 26); c.clip(); for (let x = -38; x < -12; x += 4) line(c, [x, -13, x + 0.6, 13], 1, STRIPE); c.restore();
      for (let k = 0; k < 4; k++) fill(c, BOXER[2], () => { const y = -7 + k * 4; c.moveTo(-12, y); c.lineTo(-9 + hash(seed + k) * 2, y + 1.4); c.lineTo(-12, y + 3); c.closePath(); });
      limb(c, 5, 0.6, 5, 30, 0, 3.7, SKIN, 1.6);
      ell(c, 4.6, 0.4, 6.6, 5.8, SKIN[1]); ell(c, 3.6, -1.8, 2.6, 1.5, SKIN[0]); line(c, [9, -1.6, 16, -2.4, 24, -1], 0.6, VEIN);
      sock(c, 18, 31, 0, 4.4); slipper(c, 32, 0);
      torn(c, -36, 0, 12.4, -1, seed);
      break;
    }
    case 'shin': limb(c, -12, 0, 5, 10, 0, 3.7, SKIN, 1.6); line(c, [-8, -1.6, 0, -2.2, 6, -1], 0.6, VEIN); sock(c, 2, 12, 0, 4.4); slipper(c, 13, 0); torn(c, -15, 0, 5.4, -1, seed); break;
    case 'gut': {
      // (the beer gut, whole, in the tank top: forty years of SWILL LITE; torn off top and bottom, the guts out of it)
      gutRope(c, [-14, -14, -18, -20, -10, -22, -4, -18, 2, -22, 8, -19], 3);
      gutRope(c, [6, -15, 12, -21, 18, -18, 16, -12], 2.6);
      shapeTop(c, () => c.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2), SKIN, -17, 17);
      c.save(); c.beginPath(); c.ellipse(0, 0, 22.5, 17.5, 0, 0, Math.PI * 2); c.clip();
      shape(c, () => { c.moveTo(-24, -20); c.lineTo(24, -20); c.lineTo(24, 6); c.quadraticCurveTo(0, 11, -24, 7); c.closePath(); }, TANK, -22, 22);
      for (let k = -20; k < 22; k += 3.6) line(c, [k, -18, k * 1.05, 7], 0.4, TANK[2]);
      ell(c, -9, -3, 6, 4.4, dith(c, STAIN)); ell(c, 5, -7, 2.2, 3.2, MUSTARD); px(c, 4.4, -4.4, 1.2, 3, MUSTARD);
      ell(c, 10, 0, 1.4, 1.2, '#3A2A20'); ell(c, 10, 0, 2.2, 2, dith(c, '#8A6A40'));
      ell(c, -14, -10, 5, 3, BLOOD[3]); ell(c, 14, 3, 3, 2, BLOOD[2]);
      c.restore();
      c.beginPath(); c.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2); c.strokeStyle = TANK[4]; c.lineWidth = 1; c.stroke();
      ell(c, -3, 12.6, 1.6, 1.1, SKIN[4]); for (let k = 0; k < 7; k++) px(c, -10 + k * 3, 10 + (k % 2) * 2, 0.6, 1.4, SKIN[3]);
      // (the tear across the top: ragged, red, a rope of gut hanging out of it)
      for (let k = 0; k < 9; k++) ell(c, -16 + k * 4, -14 + Math.abs(k - 4) * 0.5, 2.6, 2, k % 2 ? MEAT[2] : MEAT[1]);
      gutRope(c, [-6, -13, -8, -6, -5, 2, -9, 10, -6, 18, -2, 22], 2.4);
      ell(c, -2, 23, 1.4, 2, BLOOD[3]);
      break;
    }
    case 'chest': {
      // (a slab of chest: the tank top's strap, the white chest hair, the ribs out of the red)
      const path = () => { c.moveTo(-14, -8); c.lineTo(8, -10); c.lineTo(15, -3); c.lineTo(12, 8); c.lineTo(-10, 9); c.lineTo(-16, 2); c.closePath(); };
      shape(c, path, SKIN, -16, 15);
      c.save(); c.beginPath(); path(); c.clip();
      shape(c, () => c.rect(-16, -10, 7, 20), TANK, -16, -9, 0.6); ell(c, -12, -2, 3, 5, dith(c, STAIN));
      ell(c, 5, 2, 9, 6, MEAT[2]); ell(c, 4, 1, 7, 4.6, MEAT[1]);
      for (let k = 0; k < 4; k++) { c.strokeStyle = BONE[3]; c.lineWidth = 1.8; c.beginPath(); c.arc(4, 14 - k * 3.4, 9, -2.4, -0.7); c.stroke(); c.strokeStyle = BONE[0]; c.lineWidth = 0.8; c.stroke(); }
      c.restore();
      for (let k = 0; k < 8; k++) line(c, [-6 + k * 1.6, -9, -7 + k * 1.8, -11.6 - (k % 2)], 0.5, HAIR[1]);
      for (let k = 0; k < 6; k++) ell(c, -14 + k * 5.6, 9 + (k % 2), 1.6, 1.2, k % 2 ? MEAT[2] : BLOOD[3]);
      break;
    }
    case 'seat': {
      // (the seat of the boxers with what was in them: the stripes, the fly's button, the waistband; red out the top)
      shape(c, () => c.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2), BOXER, -18, 18);
      c.save(); c.beginPath(); c.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2); c.clip();
      for (let k = -20; k < 20; k += 4) { px(c, k, -10, 1.2, 20, STRIPE); px(c, k + 1.2, -10, 0.6, 20, BOXER[0]); }
      px(c, -20, -10, 40, 3, BOXER[3]); ell(c, 6, 3, 6, 4, dith(c, '#C8B26A'));
      c.restore();
      line(c, [-4, -4, -5, 4], 0.8, BOXER[4]); ell(c, -3.4, -2, 0.9, 0.9, '#F4F1E8');
      for (let k = 0; k < 7; k++) ell(c, -12 + k * 4, -9 + Math.abs(k - 3) * 0.4, 2.4, 1.8, k % 2 ? MEAT[1] : MEAT[2]);
      gutRope(c, [-4, -9, -1, -14, 4, -12, 6, -16], 2);
      // (the legs' stumps out the bottom)
      ell(c, -9, 8.6, 4.6, 2.2, MEAT[2]); ell(c, -9, 8.4, 1.4, 1, BONE[1]); ell(c, 9, 8.6, 4.6, 2.2, MEAT[2]); ell(c, 9, 8.4, 1.4, 1, BONE[1]);
      break;
    }
    case 'tank': tankRag(c, 9 + hash(seed) * 5, 6 + hash(seed + 1) * 3, seed); break;
    case 'boxer': boxerRag(c, 7 + hash(seed) * 4, 5 + hash(seed + 1) * 2, seed); break;
    case 'slipper': c.save(); c.rotate(Math.PI / 2); slipper(c, -3, 6); c.restore(); break;
    case 'can': can(c, 0, 0, Math.PI / 2, 0.55); ell(c, 2, -2, 2, 1.4, BLOOD[3]); px(c, -3, 1.6, 2, 1, BLOOD[2]); break;
    case 'pack': {
      // (the headset's beltpack, its clip, the green light still on, the wire torn off)
      shape(c, () => c.roundRect(-4, -5, 8, 10, 1.4), ['#4A4A52', '#2A2A30', '#1E1E24', '#141418', '#000000'], -4, 4, 0.6);
      px(c, -3, -4, 2, 1, '#22C55E'); line(c, [3, -5, 7, -9, 12, -7, 15, -10], 0.6, '#1A1A1A'); ell(c, 1, 2, 2, 1.2, BLOOD[3]);
      break;
    }
    case 'meat': meat(c, seed); break;
    case 'rope': gutRope(c, [-12, 0, -8, -4, -3, -1, 1, -5, 5, -1, 9, -4, 12, 0], 2.6); ell(c, 13, 0.6, 1.4, 1.6, BLOOD[3]); break;
    case 'spine': {
      // (a length of his spine: the knobs of it, the discs between, the cord red down the middle, torn both ends)
      for (let k = 0; k < 7; k++) { const x = -12 + k * 4; shape(c, () => c.roundRect(x - 1.6, -2.4, 3.2, 4.8, 1), BONE, x - 1.6, x + 1.6, 0.5); ell(c, x, -3.4, 1, 1.4, BONE[1]); if (k < 6) px(c, x + 1.6, -1.6, 0.8, 3.2, '#E8A0A0'); }
      line(c, [-14, 0.4, 14, 0.4], 0.8, MEAT[2]); torn(c, -15, 0, 3, -1, seed, false); torn(c, 15, 0, 3, 1, seed + 2, false);
      break;
    }
  }
};

/** Art turning in the air (the stamp cache won't take a turned transform, and painting it live every frame at the kill
 *  cam's zoom crawled: the user's "slows down massively during the zoom in"): painted once, flat, into its own canvas at
 *  the scale it's showing at (stepped up in doubles, so a zoom paints it a few times at most), then put down turned. */
const baked = new Map<string, HTMLCanvasElement>();
const bakedTurn = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void, most = 16) => {
  const m = c.getTransform(), sc = Math.hypot(m.a, m.b);
  const res = Math.min(most, 2 ** Math.ceil(Math.log2(Math.max(1, sc))));
  const id = `${key}@${res}`;
  let cv = baked.get(id);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = Math.ceil(w * res); cv.height = Math.ceil(h * res);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false; g.scale(res, res); g.translate(-x, -y);
    paint(g);
    baked.set(id, cv);
  }
  const was = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false; c.drawImage(cv, x, y, w, h); c.imageSmoothingEnabled = was;
};

/** A bit (world: its middle), live while it moves, stamped once it's down; the drip off a torn end while it's fresh. */
export const drawBit = (c: Ctx, b: Bit, f: number) => {
  c.save(); c.translate(b.x, b.y);
  if (b.still) {
    c.scale(DAD_K * b.fx, DAD_K * b.fy);
    // (baked, not stamped: the stamp's keyed by the scale, and the kill cam's zoom easing in and out repainted every one
    // of them every frame (the user's: the frame rate tanked lingering on his head))
    bakedTurn(c, `ct-dadbit-${b.kind}-${b.seed}`, -46, -34, 92, 68, g => paintBit(g, b.kind, b.seed), 8);
  } else {
    c.rotate(b.rot); c.scale(DAD_K * b.fx, DAD_K * b.fy);
    bakedTurn(c, `ct-dadbit-${b.kind}-${b.seed}`, -46, -34, 92, 68, g => paintBit(g, b.kind, b.seed), 8);
  }
  c.restore();
  if (b.still && b.t < 900 && b.kind !== 'tank' && b.kind !== 'boxer' && b.kind !== 'can' && b.kind !== 'pack') {
    const u = ((f + b.seed * 17) % 50) / 50;
    if (u < 0.6) ell(c, b.x + 2, b.y + b.lie * 0.4 + u * b.lie * 0.6, 0.9, 1.2, BLOOD[3]);
  }
};
/** A splat where one came down (world, on the deck): stamped. */
export const drawSplat = (c: Ctx, s: Splat, floorY: number) => {
  c.save(); c.translate(Math.round(s.x), Math.round(floorY));
  bakedTurn(c, `ct-dadsplat-${s.seed}-${Math.round(s.w)}`, -s.w * 2.4, -6, s.w * 4.8, 12, g => {
    ell(g, 0, 0, s.w, s.w * 0.18 + 1, BLOOD[1]); ell(g, -s.w * 0.1, -0.3, s.w * 0.7, s.w * 0.12 + 0.6, BLOOD[2]);
    for (let k = 0; k < 6; k++) { const a = hash(s.seed + k) - 0.5; ell(g, a * s.w * 3.4, (hash(s.seed + k * 3) - 0.5) * 3, 1 + hash(k + s.seed) * 2, 0.6 + hash(k) * 0.6, k % 2 ? BLOOD[2] : BLOOD[3]); }
    px(g, -s.w * 0.4, -0.6, s.w * 0.4, 0.6, BLOOD[4]);
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The head: the gross-up (the kill cam's all over it): front on, the neck torn off under the jowls (the slice of it: the
// skin, the fat, the meat, the windpipe, the spine), the face frozen as dumb as he lived: brows gone up, the eyes crossed
// (the near one bulging, the far one half shut), the jaw hanging, the tongue lolled out over his chin, the beer foam still
// on his lip, blood out his nose, the headset's boom snapped and dangling off his ear.

const paintHead = (c: Ctx) => {
  // (the neck under the jowls, ragged flaps of it off the bottom; the slice across the end)
  shape(c, () => { c.moveTo(-11, 6); c.lineTo(-11.6, 20); c.lineTo(11.6, 20); c.lineTo(11, 6); c.closePath(); }, SKIN, -12, 12);
  line(c, [-10, 14, 0, 15.2, 10, 14], 0.6, SKIN[3]); line(c, [-9, 17.6, 0, 18.4, 9, 17.6], 0.5, SKIN[3]);
  for (let k = 0; k < 7; k++) { const x = -10 + k * 3.4; fill(c, k % 2 ? SKIN[2] : SKIN[3], () => { c.moveTo(x - 1.6, 21); c.lineTo(x + 0.4, 24.6 + hash(k) * 2.4); c.lineTo(x + 1.8, 21); c.closePath(); }); }
  ell(c, 0, 21, 12.4, 4.2, SKIN[4]); ell(c, 0, 21, 11.6, 3.7, SKIN[2]); ell(c, 0, 21.1, 10.6, 3.2, FAT);
  ell(c, 0, 21.3, 9.4, 2.7, MEAT[1]); ell(c, -2, 20.6, 5, 1.1, MEAT[0]);
  for (let k = 0; k < 5; k++) line(c, [-8 + k * 4, 20, -7.4 + k * 4, 22.6], 0.4, MEAT[2]);
  // (the spine at the back of it, the cord in it; the windpipe at the front, its rings; the arteries, open)
  shape(c, () => c.ellipse(0, 19.8, 2.8, 1.5, 0, 0, Math.PI * 2), BONE, -2.8, 2.8, 0.5); ell(c, 0, 19.8, 0.9, 0.6, MEAT[3]);
  shape(c, () => c.ellipse(0, 22.8, 2.6, 1.3, 0, 0, Math.PI * 2), ['#FFE0E0', '#F4B8B8', '#D89090', '#B06A6A', '#5A2A2A'], -2.6, 2.6, 0.5); ell(c, 0, 22.9, 1.4, 0.6, MOUTH);
  shape(c, () => c.rect(-1.6, 22.6, 3.2, 3.6), ['#FFE0E0', '#F4B8B8', '#D89090', '#B06A6A', '#5A2A2A'], -1.6, 1.6, 0.5);
  for (let k = 0; k < 2; k++) line(c, [-1.6, 23.8 + k * 1.2, 1.6, 23.8 + k * 1.2], 0.4, '#B06A6A');
  for (const s of [-1, 1]) { ell(c, s * 5, 21.6, 1.2, 0.8, BLOOD[0]); ell(c, s * 5, 21.4, 0.6, 0.4, BLOOD[4]); }
  line(c, [-6, 22, -7, 25.6, -6.4, 28], 0.6, MEAT[1]); line(c, [4, 23, 5.4, 26.4], 0.5, BLOOD[3]);
  // (the ears: big, red at the rims, hair out of the holes; the white fringe round the back)
  for (const s of [-1, 1]) {
    shape(c, () => c.ellipse(s * 15.4, 0, 3.8, 6.4, s * 0.15, 0, Math.PI * 2), SKIN, s * 15.4 - 3.8, s * 15.4 + 3.8, 0.8, s > 0);
    ell(c, s * 15.6, 0.4, 1.5, 3.4, SKIN[3]); px(c, s * 17.6 - 0.3, -4, 0.6, 7, dith(c, FLUSH[2]));
    for (let k = 0; k < 4; k++) line(c, [s * 15.2, -0.6 + k * 0.6, s * (13.4 - k * 0.4), -2.4 + k * 0.8], 0.4, HAIR[1]);
    fill(c, HAIR[2], () => { c.moveTo(s * 11.6, -12); c.quadraticCurveTo(s * 16.6, -8, s * 15, -4); c.lineTo(s * 12.6, -2); c.quadraticCurveTo(s * 13.4, -7, s * 11, -9); c.closePath(); });
    for (let k = 0; k < 6; k++) line(c, [s * (12 + k * 0.6), -10 + k * 1.4, s * (14.4 + k * 0.5), -11 + k * 1.4], 0.45, k % 2 ? HAIR[0] : HAIR[3]);
  }
  // (the jowls and the double chin hanging off the jaw)
  shapeTop(c, () => { c.moveTo(-13.6, -1); c.quadraticCurveTo(-15.4, 12, -8, 16.6); c.quadraticCurveTo(0, 19.4, 8, 16.6); c.quadraticCurveTo(15.4, 12, 13.6, -1); c.closePath(); }, SKIN, -1, 19);
  line(c, [-8, 15.2, 0, 17.2, 8, 15.2], 0.6, SKIN[3]);
  // (the dome: bald, blotched, a forehead you could land a plane on)
  shape(c, () => c.ellipse(0, -4, 14.4, 16, 0, 0, Math.PI * 2), SKIN, -14.4, 14.4);
  for (const [sx, sy, r] of [[-7, -14, 1.8], [1.6, -17, 1.2], [6, -11, 1.5], [-10, -7, 1], [9.6, -15, 0.8], [-3, -10.6, 0.7]] as const) { ell(c, sx, sy, r, r * 0.8, SPOT); px(c, sx - r * 0.4, sy, r * 0.8, 0.4, '#9A6A46'); }
  ell(c, -6, -16, 3.6, 1.4, '#FFFFFF'); px(c, -9.6, -14, 2, 1, '#FFF4EC');
  for (let k = 0; k < 3; k++) { const y = -12 + k * 2.2, pts = [-7, y + 0.6, -3.6, y, 0, y + 0.5, 3.6, y - 0.1, 7, y + 0.6]; line(c, pts, 0.55, SKIN[3]); line(c, pts.map((v, i) => (i % 2 ? v - 0.6 : v)), 0.4, SKIN[0]); }
  // (the comb-over: three strands across the dome, blood-matted, one sprung loose and standing straight up)
  for (let k = 0; k < 3; k++) line(c, [13, -6 + k * 1.3, 8, -15 + k * 1.2, 0, -19 + k * 1.1, -8, -17 + k * 1.4, -12.6, -11 + k * 2], 0.8, k === 1 ? HAIR[0] : HAIR[2]);
  line(c, [-2, -19.4, -3, -24, -1, -27, -2.4, -29], 0.7, HAIR[1]);
  ell(c, 4, -17.6, 1.4, 0.8, BLOOD[2]);
  // (the brows: wild, grey, the near one gone right up (the last thing he thought: huh?), the far one down)
  line(c, [-10.6, -8.6, -7, -11.4, -3, -10.4], 2, HAIR[3]); line(c, [3, -7.4, 6.4, -8, 10.4, -6.8], 2, HAIR[3]);
  line(c, [-10, -9.2, -7, -11.8, -3.4, -11], 0.7, HAIR[1]); line(c, [3.4, -8, 6.4, -8.6, 10, -7.4], 0.7, HAIR[1]);
  for (let k = 0; k < 7; k++) { const x = -10 + k * 1.2; line(c, [x, -10 + Math.abs(k - 3) * 0.4, x + (k % 2 ? 1 : -0.6), -12.6 + Math.abs(k - 3) * 0.3], 0.4, k % 2 ? HAIR[4] : HAIR[2]); }
  for (let k = 0; k < 6; k++) { const x = 3.6 + k * 1.2; line(c, [x, -7.6, x + (k % 2 ? 0.8 : -0.4), -9.4], 0.4, k % 2 ? HAIR[4] : HAIR[2]); }
  // (the eyes: crossed, bloodshot, yellowed; the near one bulging out of his head, the far one half shut; the bags)
  for (const s of [-1, 1]) { ell(c, s * 5.6, -1, 3.8, 1.6, '#B98478'); line(c, [s * 3, 0, s * 5.6, 0.8, s * 8.4, 0], 0.4, SKIN[3]); line(c, [s * 3.4, 1.2, s * 5.6, 1.9, s * 8, 1.2], 0.35, SKIN[3]); }
  shape(c, () => c.ellipse(-5.8, -4.4, 3.9, 3.6, 0, 0, Math.PI * 2), ['#FFFBE6', '#F6EAC4', '#EAD6A4', '#D4BA86', '#5A4022'], -9.7, -1.9, 0.6);
  shape(c, () => c.ellipse(5.6, -3.8, 3.4, 2.6, 0, 0, Math.PI * 2), ['#FFFBE6', '#F6EAC4', '#EAD6A4', '#D4BA86', '#5A4022'], 2.2, 9, 0.6);
  for (const [ex, ey, rx, ry] of [[-5.8, -4.4, 3.9, 3.6], [5.6, -3.8, 3.4, 2.6]] as const) for (let k = 0; k < 6; k++) {
    const a = k * 1.05 + 0.3, x0 = ex + Math.cos(a) * rx * 0.95, y0 = ey + Math.sin(a) * ry * 0.95;
    line(c, [x0, y0, x0 - Math.cos(a) * 1.4 + (k % 2 ? 0.4 : -0.4), y0 - Math.sin(a) * 1.2], 0.3, k % 3 ? '#D8303C' : '#9A1622');
  }
  // (the irises in at the nose, pinprick pupils)
  ell(c, -3.4, -3.8, 1.5, 1.5, IRIS); ell(c, -3.3, -3.8, 0.55, 0.55, '#0A0A0C'); px(c, -4.2, -4.8, 0.6, 0.6, '#FFFFFF');
  ell(c, 3.4, -3.2, 1.3, 1.2, IRIS); ell(c, 3.3, -3.2, 0.5, 0.5, '#0A0A0C');
  // (the far lid down over half of it, heavy; the near one gone up out of sight; crust in the corners)
  fill(c, SKIN[2], () => { c.moveTo(2, -4); c.quadraticCurveTo(5.6, -7.2, 9.2, -4); c.lineTo(9.2, -3.6); c.quadraticCurveTo(5.6, -4.4, 2, -3.4); c.closePath(); });
  line(c, [2.2, -3.5, 5.6, -4.2, 9, -3.6], 0.6, SKIN[4]); line(c, [2.6, -5.6, 5.6, -7, 8.6, -5.6], 0.4, SKIN[3]);
  line(c, [-9.4, -6.4, -5.8, -8.6, -2.2, -6.4], 0.5, SKIN[3]);
  ell(c, -2.2, -3.6, 0.6, 0.5, CRUST); ell(c, 2.4, -3.2, 0.6, 0.5, CRUST);
  // (the nose: a swollen purple strawberry, the pores, the blackheads, the wart and its hair, hair out of both holes)
  shape(c, () => { c.moveTo(-1.4, -2.6); c.quadraticCurveTo(-2.6, 0, -4, 2); c.quadraticCurveTo(-1, -0.6, 1.4, -2.6); c.closePath(); }, FLUSH, -4, 1.4, 0.4);
  for (const s of [-1, 1]) shape(c, () => c.ellipse(s * 3.8, 4.6, 2.4, 2, 0, 0, Math.PI * 2), FLUSH, s * 3.8 - 2.4, s * 3.8 + 2.4, 0.6);
  shape(c, () => c.ellipse(0, 3, 4.8, 4.4, 0, 0, Math.PI * 2), FLUSH, -4.8, 4.8, 0.7);
  for (const [bx, by, r] of [[-2, 1.4, 1.4], [1.8, 0.6, 1.2], [0.6, 4.4, 1.3]] as const) ell(c, bx, by, r, r * 0.9, FLUSH[0]);
  for (let k = 0; k < 16; k++) px(c, -3.4 + hash(k) * 6.8, 0 + hash(k + 9) * 5.6, 0.3, 0.3, k % 4 ? FLUSH[3] : '#2A140E');
  line(c, [-3, 2, -1.6, 3.4, -2.4, 5], 0.3, VEIN); line(c, [2.4, 1, 3.4, 2.6], 0.3, VEIN);
  ell(c, 3.4, 0.8, 0.8, 0.8, '#CC9478'); line(c, [3.6, 0.2, 4.6, -1.6, 5.6, -2], 0.3, '#24140C');
  ell(c, -1.6, 6.6, 1.3, 0.8, '#2E0A16'); ell(c, 1.8, 6.6, 1.3, 0.8, '#2E0A16');
  for (let k = 0; k < 3; k++) { line(c, [-1.6 + k * 0.5, 6.8, -2 + k * 0.6, 7.8], 0.25, HAIR[3]); line(c, [1.4 + k * 0.5, 6.8, 1.2 + k * 0.7, 7.8], 0.25, HAIR[3]); }
  // (blood out of his nose, down over the lip)
  line(c, [-1.6, 7, -1.8, 8.6, -1.2, 9.4], 0.8, BLOOD[2]); line(c, [1.8, 7, 2, 8.4], 0.7, BLOOD[3]);
  // (the cheeks flushed, the broken veins)
  for (const s of [-1, 1]) { ell(c, s * 8.4, 3.6, 3.4, 2.4, dith(c, FLUSH[1])); line(c, [s * 7, 3, s * 8.6, 2.2, s * 10, 3.4], 0.3, FLUSH[3]); line(c, [s * 8, 4.6, s * 9.4, 5], 0.3, FLUSH[3]); }
  // (the white stubble with a dark follicle under each)
  for (let k = 0; k < 70; k++) {
    const x = (hash(k * 2.3) - 0.5) * 24, y = 6 + hash(k * 4.1) * 11;
    if (Math.abs(x) < 6 && y > 8 && y < 15) continue;
    if ((x / 13) ** 2 + ((y - 6) / 12) ** 2 > 1) continue;
    px(c, x, y, 0.35, 0.35, '#9A6A54'); px(c, x + 0.2, y - 0.5, 0.3, 0.6, '#F4F4F0');
  }
  // (the jaw hanging: the mouth open, the yellow teeth (a gap, a brown one), the tongue lolled out over his chin)
  ell(c, -0.2, 11.6, 4.8, 3.4, LIPS); ell(c, -0.2, 11.8, 4.2, 2.9, MOUTH);
  for (let k = 0; k < 6; k++) { if (k === 2) continue; px(c, -3.6 + k * 1.3, 9, 1.1, 1.4, k === 4 ? '#8A6634' : TEETH); px(c, -3.6 + k * 1.3, 9, 0.4, 1.4, k === 4 ? '#B08A50' : '#FFF6D0'); }
  shape(c, () => { c.moveTo(-3, 12); c.quadraticCurveTo(-3.6, 16, -2, 18.2); c.quadraticCurveTo(0, 19.6, 1.8, 17.8); c.quadraticCurveTo(2.8, 15, 2, 12); c.closePath(); }, TONGUE, -3.6, 2.8, 0.6);
  line(c, [-0.4, 12.6, -0.3, 17.4], 0.4, TONGUE[3]); ell(c, -1.4, 13.6, 0.8, 0.5, TONGUE[0]);
  tooth(c, 2.6, 14.6, 0.3);
  line(c, [-4.6, 10.4, -1, 9.4, 4.4, 10.4], 0.6, LIPS);
  // (the beer foam still on his lip; blood out the corner of his mouth down his chin)
  for (let k = 0; k < 9; k++) ell(c, -4.4 + k * 1.1, 8.6 - (k % 2) * 0.4, 0.6, 0.5, k % 3 ? '#FFFBEA' : '#F4EAC4');
  line(c, [4.4, 12, 5, 14.6, 4.6, 17], 0.7, BLOOD[2]); ell(c, 4.6, 17.4, 0.8, 1, BLOOD[3]);
  // (the headset: the tape torn off his cheek, the boom snapped, swinging off the ear by its wire, the foam ball)
  px(c, 9, 4, 3.6, 1.6, '#C8C2B0'); px(c, 9.4, 4.2, 1, 1.2, '#E4E0D4');
  line(c, [15, 3, 12.6, 9, 13.4, 14, 12.4, 19], 1, MIC); ell(c, 12.2, 19.8, 1.4, 1.4, '#222222'); px(c, 11.6, 19.2, 0.6, 0.6, '#5A5A5A');
  // (his own blood up over his face, flung up off the slice as it went)
  for (const [sx, sy, r] of [[8, -9, 1.2], [9.4, -6, 0.6], [-11, -2, 0.9], [-9, 6, 0.7], [6.6, 8, 0.6], [-4, -19, 0.8]] as const) { ell(c, sx, sy, r, r * 0.8, BLOOD[2]); px(c, sx - 0.2, sy + r * 0.6, 0.4, r * 1.6, BLOOD[2]); }
};

/** The head (world: the middle of its skull, its turn): live while it flies, stamped sat still (it's sat dead upright); the
 *  live bits over it (the drip off the stump into its puddle, the fly). `rest` the frames it's been sat. */
export const drawHead = (c: Ctx, h: Head, floorY: number, f: number, rest: number) => {
  // (the puddle under it, spreading)
  if (h.pool > 0) { const w = 6 + h.pool * 22; ell(c, h.x, floorY - 0.5, w, 1.4 + w * 0.12, BLOOD[1]); ell(c, h.x - 2, floorY - 0.8, w * 0.7, 0.6 + w * 0.08, BLOOD[2]); px(c, h.x - w * 0.5, floorY - 1.2, w * 0.3, 0.5, BLOOD[4]); }
  c.save(); c.translate(h.x, h.y);
  if (h.state === 'rest') { c.scale(HEAD_S, HEAD_S); bakedTurn(c, 'ct-dadhead', -22, -32, 44, 62, paintHead); }
  else { c.rotate(h.rot); c.scale(HEAD_S, HEAD_S); bakedTurn(c, 'ct-dadhead', -22, -32, 44, 62, paintHead); }
  if (h.state !== 'fly') {
    // (a drip off the flaps of the neck, now and then, plopping into the puddle)
    const u = (f % 38) / 38;
    ell(c, -4, 25 + u * 4, 0.8, 1 + u * 0.6, BLOOD[3]);
    // (a fly: in on him a while after he's sat, round and round, down onto his eye, off again)
    if (rest > 50) {
      const ph = (rest - 50) % 200, land = ph > 80 && ph < 150;
      const a = f * 0.23, x = land ? -5 : Math.cos(a) * 10 + Math.sin(a * 2.3) * 3, y = land ? -4.6 : -6 + Math.sin(a) * 9 + Math.cos(a * 1.7) * 2;
      px(c, x - 0.8, y - 0.5, 1.6, 1, '#141418'); px(c, x - 0.8, y - 0.5, 0.5, 0.5, '#7A2A2A'); px(c, x + 0.3, y - 0.5, 0.5, 0.5, '#7A2A2A');
      if (!land || (f >> 3) % 2) { c.globalAlpha = 0.6; px(c, x - 1.4, y - 1.6 - (f % 2) * 0.4, 1, 0.8, '#E8F0FA'); px(c, x + 0.4, y - 1.6 - ((f + 1) % 2) * 0.4, 1, 0.8, '#E8F0FA'); c.globalAlpha = 1; }
    }
  }
  c.restore();
};
