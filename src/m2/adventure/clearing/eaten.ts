// SAFARI ARTIE, eaten alive (his weakness death: the spawner's litter, or the stampede he couldn't get out of the way
// of for them). Meathead 1's weakness deaths are the gory ones; this is his.
//
// Down he comes (off his vine, out of the air) and they're all over him, the ones on him and a swarm more, and he's
// flailing; then he's being eaten standing up, bite by bite (the bites go in where they're chewing: red-rimmed holes,
// and his bones under them): the helmet knocked off and rolling (they're at his scalp), the arm off and on the ground,
// his guts out and dragged off across the dirt by one of them, his arms up, screaming. The flesh goes; he's a bloody
// skeleton still in his tube socks, his boots and his heart boxers (they don't eat those), the jaw still going (he
// never shuts up). Then it all comes down in a heap: the skull bouncing off on its own, the buck teeth out of it, the
// litter on him bursting, full.
//
// All of it in his own space: his feet the origin, facing right (the caller turns it round). The standing part is drawn
// by the enemy (in under the litter the gun draws over it); the loose bits (the helmet, the arm, the heap) by the fight.

import { playSound } from '../../../m1/game/platform/audio';
import type { GameState } from '../../../m1/game/core/state';
import { drawSafariArtie } from '../river/artie';

type Ctx = CanvasRenderingContext2D;

/** Its beats (frames, from when he's on the ground). */
export const HELMET_AT = 58, ARM_AT = 96, GUT_AT = 116, FLESH_END = 178, FLESH_FADE = 20;
/** The heap: when it comes down at the earliest, and at the latest (whatever he's still saying). */
export const COLLAPSE_MIN = FLESH_END + 50, COLLAPSE_MAX = 640;

interface Bite { x: number; y: number; r: number }
/** One of the swarm (drawn here: the gun's own are on him too): where on him, when it gets there, which side it's from. */
interface Gob { x: number; y: number; at: number; from: number; skin: number; ph: number; eyes: number }
/** A loose bit: the helmet, the arm, a bone, a tooth (his space: the ground at 0). */
interface Bit { kind: 'helmet' | 'arm' | 'long' | 'skull' | 'ribs' | 'pelvis' | 'boxers' | 'boot' | 'tooth' | 'tag'; x: number; y: number; vx: number; vy: number; a: number; va: number; l: number; s: number; still: boolean; reach: number }

export interface Eaten {
  t: number;
  /** His feet, falling (he died up his vine or flying): down first. */
  y: number; vy: number; landed: boolean;
  bites: Bite[]; swarm: Gob[]; bits: Bit[];
  armOff: boolean; gut: number;
  /** In a heap (from when). */
  heapAt: number;
  /** Where in his own space the arena's walls are (the loose bits stop at them). */
  lo: number; hi: number;
  cv: HTMLCanvasElement | null;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export const startEaten = (feetY: number, lo: number, hi: number): Eaten => {
  const swarm: Gob[] = [];
  // (where they get to on him: legs, belly, chest, arms, shoulders, head)
  const SPOTS = [[-3, -10], [5, -16], [-6, -24], [6, -33], [-4, -40], [2, -46], [-8, -52], [9, -54], [-2, -60], [4, -74], [-9, -66], [12, -64], [-13, -46], [0, -28], [8, -42], [-5, -80]];
  SPOTS.forEach(([x, y], i) => swarm.push({ x, y, at: 4 + i * 3 + Math.floor(Math.random() * 4), from: i % 2 ? 1 : -1, skin: i % 4, ph: Math.random() * 6, eyes: 1 + (i % 3) }));
  return { t: 0, y: feetY, vy: 0, landed: false, bites: [], swarm, bits: [], armOff: false, gut: 0, heapAt: -1, lo, hi, cv: null };
};

/**
 * A frame of it. `at(x, y)`: his space to the world (for the blood). Returns what's just happened, for the caller's
 * sounds and lines: 'landed', 'helmet', 'arm', 'gut'.
 */
export const updateEaten = (state: GameState, g: Eaten, at: (x: number, y: number) => { x: number; y: number }): string | null => {
  // Falling: down first (whatever's on him holding on)
  if (!g.landed) {
    g.vy += 0.5; g.y += g.vy;
    return null;
  }
  g.t++;
  const t = g.t;
  let ev: string | null = null;
  const blood = (x: number, y: number, n: number, up = 3) => {
    const w = at(x, y);
    for (let i = 0; i < n; i++) state.particles.push({ pos: { x: w.x, y: w.y }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * up }, life: 26 + Math.random() * 14, color: ['#B91C1C', '#7F1D1D', '#991B1B', '#DC2626'][i % 4], size: 2 + Math.random() * 3, grav: 0.3 });
  };
  // The bites, while there's flesh: slow, then faster, more where they're at (and none on what's off him)
  if (t > 8 && t < FLESH_END) {
    const n = t < 40 ? (t % 3 === 0 ? 1 : 0) : t < 120 ? 2 : 3;
    const on = g.swarm.filter(s => s.at + 14 <= t);
    for (let i = 0; i < n; i++) {
      let x: number, y: number;
      if (on.length && Math.random() < 0.55) { const s = on[Math.floor(Math.random() * on.length)]; x = s.x + rnd(-5, 5); y = s.y + rnd(-5, 5); }
      else { y = rnd(-92, -2); x = y < -60 ? rnd(-12, 14) : rnd(-17, 17); }
      g.bites.push({ x, y, r: rnd(3.5, 7) });
      if (Math.random() < 0.5) blood(x, y, 2);
    }
    if (t % 5 === 0) playSound('gnaw', 0.55, rnd(-3, 4));
    if (t % 23 === 0) playSound('chitter', 0.35, rnd(0, 6));
  }
  // The helmet knocked off (they're at his scalp)
  if (t === HELMET_AT) {
    ev = 'helmet';
    for (let i = 0; i < 10; i++) g.bites.push({ x: rnd(-12, 12), y: rnd(-94, -80), r: rnd(5, 8) });
    g.bits.push(bit('helmet', 1, -84, -2.6, -6.5, 0, -0.22, 0, 0, 7));
    blood(0, -84, 10, 5);
  }
  // The arm off: chewed through at the shoulder, down it goes, one of them still on it
  if (t === ARM_AT) {
    ev = 'arm'; g.armOff = true;
    for (let k = 0; k <= 1.001; k += 0.1) g.bites.push({ x: 6 + 14 * k, y: -56 - 16 * k, r: 7 });
    g.bits.push(bit('arm', 14, -64, 2.6, -4.5, -0.6, 0.28, 0, 0, 3));
    for (const s of g.swarm) if (s.x > 8 && s.y < -50) { s.x = 3; s.y = -48; }
    blood(7, -57, 18, 6);
  }
  // The guts: out of him, and off across the dirt with one of them
  if (t === GUT_AT) {
    ev = 'gut';
    for (let i = 0; i < 8; i++) g.bites.push({ x: rnd(-4, 10), y: rnd(-42, -30), r: rnd(5, 8) });
    blood(3, -36, 16, 4);
  }
  if (t > GUT_AT && g.gut < 1) g.gut = Math.min(1, g.gut + 0.012);
  // (the flesh gone: a bloody skeleton, dripping)
  if (t > FLESH_END && g.heapAt < 0 && t % 4 === 0) blood(rnd(-10, 10), rnd(-80, -10), 1, 0.2);
  // (bleeding all the while he's flesh: a spurt out of somewhere)
  if (t < FLESH_END && t % 9 === 0) blood(rnd(-12, 12), rnd(-75, -20), 5, 4);
  // The loose bits: falling, bouncing, rolling flat, lying there
  for (const b of g.bits) tumble(g, b);
  return ev;
};
/** Down off the vine (or out of the air): landed. */
export const landEaten = (g: Eaten) => { g.landed = true; g.vy = 0; };

const bit = (kind: Bit['kind'], x: number, y: number, vx: number, vy: number, a: number, va: number, l: number, s: number, reach: number): Bit =>
  ({ kind, x, y, vx, vy, a, va, l, s, still: false, reach });

const tumble = (g: Eaten, b: Bit) => {
  if (b.still) return;
  b.vy += 0.45; b.x += b.vx; b.y += b.vy; b.a += b.va;
  if (b.x < g.lo + 8 || b.x > g.hi - 8) { b.x = Math.max(g.lo + 8, Math.min(g.hi - 8, b.x)); b.vx = -b.vx * 0.4; }
  const reach = b.kind === 'long' ? b.s * 0.9 + Math.abs(Math.sin(b.a)) * b.l * 0.5 : b.reach;
  if (b.y + reach >= 0) {
    b.y = -reach;
    if (b.vy > 2.5) { b.vy = -b.vy * 0.35; b.va *= 0.6; if (Math.random() < 0.4) playSound('crumble', 0.25, 8); }
    else b.vy = 0;
    // (round things roll on; the rest skid to a stop)
    // (the skull rolls on; the rest skid to a stop, lying flat: the helmet on its crown or its back)
    b.vx *= b.kind === 'skull' ? 0.97 : 0.72;
    if (b.kind === 'skull') b.va = b.vx / Math.max(4, b.reach);
    else {
      const flat = Math.round(b.a / Math.PI) * Math.PI;
      if (b.kind === 'long' || b.kind === 'arm' || b.kind === 'helmet') b.a += (flat - b.a) * 0.25;
      b.va *= 0.5;
    }
    if (b.vy === 0 && Math.abs(b.vx) < 0.12 && (Math.abs(b.va) < 0.01 || b.kind === 'skull')) b.still = true;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// His skeleton (standing): where every bone is, from his feet, facing right (arms up, screaming, the way he went)

type Seg = [kind: 'long', x1: number, y1: number, x2: number, y2: number, s: number];
const LEGS: Seg[] = [['long', -2, -28, -1.5, -15, 2.2], ['long', 3, -28, 3.5, -15, 2.2], ['long', -1.5, -15, -1.5, -5, 1.9], ['long', 3.5, -15, 3.5, -5, 1.9]];
const SPINE: Seg[] = [['long', 0.5, -31, 0.5, -45, 1.8], ['long', 0.5, -45, 0.5, -59, 1.8], ['long', -6, -58, 7, -58, 1.4]];
const FAR_ARM: Seg[] = [['long', -5, -57, -12, -64, 1.8], ['long', -12, -64, -20, -70, 1.5]];
const NEAR_ARM: Seg[] = [['long', 6, -57, 12, -65, 1.8], ['long', 12, -65, 19, -71, 1.5]];
const segsOf = (g: Eaten) => [...LEGS, ...SPINE, ...FAR_ARM, ...(g.armOff ? [] : NEAR_ARM)];

/** Down it all comes: every bone loose, in a heap; the skull off on its own, the teeth out of it. */
export const collapse = (g: Eaten) => {
  g.heapAt = g.t;
  for (const [, x1, y1, x2, y2, s] of segsOf(g)) {
    const x = (x1 + x2) / 2, y = (y1 + y2) / 2;
    g.bits.push(bit('long', x, y, x * 0.06 + rnd(-1, 1), rnd(-2.5, 0), Math.atan2(y2 - y1, x2 - x1), rnd(-0.2, 0.2), Math.hypot(x2 - x1, y2 - y1), s, 0));
  }
  g.bits.push(bit('ribs', 0.5, -50, rnd(-0.6, 0.6), -1, 0, rnd(-0.1, 0.1), 0, 0, 7));
  g.bits.push(bit('pelvis', 0.5, -29, rnd(-0.5, 0.5), -0.5, 0, rnd(-0.1, 0.1), 0, 0, 4));
  g.bits.push(bit('boxers', 0.5, -29, rnd(-1, 1), -1.5, 0, rnd(-0.15, 0.15), 0, 0, 3));
  g.bits.push(bit('boot', -1.5, -4, -0.6, -0.5, 0, 0, 0, 0, 4), bit('boot', 3.5, -4, 0.6, -0.5, 0, 0, 0, 0, 4));
  g.bits.push(bit('skull', 1, -71, rnd(1.6, 2.6) * (Math.random() < 0.5 ? -1 : 1), -5.5, 0, 0, 0, 0, 9));
  g.bits.push(bit('tooth', 7, -63, rnd(1, 3), -6, 0, 0.5, 0, 0, 2), bit('tooth', 8.5, -63, rnd(2, 4), -5, 0, -0.6, 0, 0, 2));
  g.bits.push(bit('tag', 4, -50, rnd(-1, 1), -1, 0, 0.05, 0, 0, 1));
  playSound('crumble', 1); playSound('crunch', 0.6, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const BONE = '#E7E2D6', BONE_SH = '#B8AE9C', BONE_LINE = '#57534E', GORE = '#991B1B', GORE_DK = '#5F1010';

const boneLine = (c: Ctx, x1: number, y1: number, x2: number, y2: number, s: number) => {
  c.lineCap = 'round';
  c.strokeStyle = BONE_LINE; c.lineWidth = s + 1.6; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = BONE; c.lineWidth = s; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  // (knobby ends)
  for (const [x, y] of [[x1, y1], [x2, y2]]) { c.fillStyle = BONE_LINE; c.beginPath(); c.arc(x, y, s * 0.85 + 0.8, 0, Math.PI * 2); c.fill(); c.fillStyle = BONE; c.beginPath(); c.arc(x, y, s * 0.85, 0, Math.PI * 2); c.fill(); }
  // (gore still on it)
  c.fillStyle = GORE; c.fillRect(Math.round((x1 + x2) / 2 - 1), Math.round((y1 + y2) / 2 - 1), 2, 2);
};
const ribs = (c: Ctx, x: number, y: number) => {
  c.strokeStyle = BONE_LINE; c.lineWidth = 2.6;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x, y - 6 + i * 3, 8 - i * 0.4, 2.4, 0, 0.15, Math.PI - 0.15); c.stroke(); }
  c.strokeStyle = BONE; c.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x, y - 6 + i * 3, 8 - i * 0.4, 2.4, 0, 0.15, Math.PI - 0.15); c.stroke(); }
  c.fillStyle = GORE; c.fillRect(x - 5, y - 2, 2, 3); c.fillRect(x + 3, y + 2, 2, 2);
};
const pelvis = (c: Ctx, x: number, y: number) => {
  c.fillStyle = BONE_LINE; c.beginPath(); c.ellipse(x, y, 7.5, 4.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE; c.beginPath(); c.ellipse(x, y, 6.5, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE_SH; c.fillRect(x - 2, y - 1, 4, 3);
};
/** His heart boxers (the one thing they wouldn't eat). */
const boxers = (c: Ctx, x: number, y: number) => {
  c.fillStyle = '#7F1D1D'; c.fillRect(x - 8.5, y - 4.5, 17, 10);
  c.fillStyle = '#DC2626'; c.fillRect(x - 7.5, y - 3.5, 15, 8);
  c.fillStyle = '#FBCFE8';
  for (const [hx, hy] of [[-5, -2], [1, -1], [-2, 2.5], [4, 2.5]]) { c.fillRect(x + hx, y + hy, 1.4, 1.2); c.fillRect(x + hx + 1.6, y + hy, 1.4, 1.2); c.fillRect(x + hx + 0.6, y + hy + 1.2, 1.8, 1); }
  c.fillStyle = '#450A0A'; c.fillRect(x - 0.5, y + 1, 1, 4.5);
};
/** A tube sock and a hiking boot. */
const boot = (c: Ctx, x: number, y: number) => {
  c.fillStyle = '#5E5C50'; c.fillRect(x - 3, y - 12, 6, 10);
  c.fillStyle = '#F2F0E6'; c.fillRect(x - 2.2, y - 11.4, 4.4, 9);
  c.fillStyle = '#DC2626'; c.fillRect(x - 2.2, y - 10, 4.4, 1); c.fillStyle = '#1D4ED8'; c.fillRect(x - 2.2, y - 8.4, 4.4, 1);
  c.fillStyle = '#22150B'; c.fillRect(x - 3.6, y - 3.4, 9, 4.6);
  c.fillStyle = '#7C5432'; c.fillRect(x - 2.8, y - 2.8, 7.4, 3);
  c.fillStyle = '#A07048'; c.fillRect(x - 2.4, y - 2.6, 3, 1);
};
/** The skull: buck teeth (if they're still in it), the mullet still on the back of it, the jaw going if he's talking. */
const skull = (c: Ctx, x: number, y: number, talk: number, teeth: boolean) => {
  // (the mullet: a lank tail of it, out the back)
  c.fillStyle = '#4A341E'; c.fillRect(x - 11, y - 2, 5, 10); c.fillStyle = '#86643E'; c.fillRect(x - 10, y - 1, 3, 9);
  c.fillStyle = BONE_LINE; c.beginPath(); c.arc(x, y - 1, 9.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE; c.beginPath(); c.arc(x, y - 1, 8.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE_SH; c.fillRect(x - 7, y + 2, 4, 3);
  // (eye sockets, the nose hole; blood down the forehead)
  c.fillStyle = '#1C1917'; c.fillRect(x + 1.5, y - 3, 3.6, 3.6); c.fillRect(x - 3.5, y - 3, 3, 3.6); c.fillRect(x + 5.6, y + 1.6, 2, 2.4);
  c.fillStyle = GORE; c.fillRect(x - 2, y - 9, 2, 5); c.fillRect(x + 3, y - 8, 1, 3);
  // the jaw, dropping as he talks
  const jy = y + 5 + talk * 3;
  c.fillStyle = BONE_LINE; c.fillRect(x - 3, jy - 0.5, 12, 4.5);
  c.fillStyle = BONE; c.fillRect(x - 2.4, jy, 10.8, 3.4);
  c.fillStyle = '#1C1917'; c.fillRect(x + 2, y + 4.4, 7, jy - y - 4.4 + 0.4);
  // the buck teeth, out over the jaw
  if (teeth) { c.fillStyle = '#5E5C50'; c.fillRect(x + 5.4, y + 3, 5.2, 5); c.fillStyle = '#FFFBEB'; c.fillRect(x + 5.8, y + 3.4, 2, 4.2); c.fillRect(x + 8.2, y + 3.4, 2, 4.2); }
  else { c.fillStyle = GORE_DK; c.fillRect(x + 5.8, y + 3.4, 4.4, 1.5); }
};
/** One of the swarm: a wet little thing, eyes, teeth, chomping. */
const SKIN = [['#84CC16', '#1A2E05'], ['#22D3EE', '#082F49'], ['#D946EF', '#2E0A33'], ['#4ADE80', '#052E16']];
const gob = (c: Ctx, x: number, y: number, s: Gob, fr: number, chomp: boolean) => {
  const [mid, line] = SKIN[s.skin];
  const bob = Math.sin(fr * 0.9 + s.ph) * 0.8;
  c.fillStyle = line; c.beginPath(); c.ellipse(x, y + bob, 4.6, 3.9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = mid; c.beginPath(); c.ellipse(x, y + bob, 3.6, 2.9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFFFFF';
  for (let i = 0; i < s.eyes; i++) c.fillRect(x - 2 + i * 1.8, y - 2.4 + bob, 1.4, 1.4);
  c.fillStyle = '#000'; for (let i = 0; i < s.eyes; i++) c.fillRect(x - 1.6 + i * 1.8, y - 2 + bob, 0.7, 0.7);
  const open = chomp && Math.floor((fr + s.ph * 5) / 3) % 2 === 0;
  c.fillStyle = '#450A0A'; c.fillRect(x - 1.5, y + 0.4 + bob, 3.4, open ? 2.4 : 1);
  if (open) { c.fillStyle = '#FFFFFF'; c.fillRect(x - 1.3, y + 0.4 + bob, 0.8, 0.8); c.fillRect(x + 0.9, y + 0.4 + bob, 0.8, 0.8); c.fillStyle = GORE; c.fillRect(x - 0.4, y + 1.6 + bob, 1.4, 1); }
};

/** The standing part (the enemy draws it, at his feet, facing right): the skeleton, the flesh being eaten off it, the
 *  swarm on him, his guts going off across the dirt. */
export const drawEatenStanding = (c: Ctx, g: Eaten, fr: number, damage: number, talking: boolean) => {
  if (g.heapAt >= 0) return;
  const t = g.t;
  // His bones (under all of it; showing through the bites, then all there is)
  const talk = talking && t > FLESH_END ? (Math.floor(fr / 5) % 2 === 0 ? 1 : 0.2) : 0;
  boot(c, -1.5, 0); boot(c, 3.5, 0);
  for (const [, x1, y1, x2, y2, s] of LEGS) boneLine(c, x1, y1, x2, y2, s);
  pelvis(c, 0.5, -29);
  for (const [, x1, y1, x2, y2, s] of SPINE) boneLine(c, x1, y1, x2, y2, s);
  ribs(c, 0.5, -50);
  for (const [, x1, y1, x2, y2, s] of FAR_ARM) boneLine(c, x1, y1, x2, y2, s);
  if (!g.armOff) for (const [, x1, y1, x2, y2, s] of NEAR_ARM) boneLine(c, x1, y1, x2, y2, s);
  // (a raw red stump where the arm was)
  else { c.fillStyle = GORE_DK; c.beginPath(); c.arc(7, -57, 3.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.arc(7, -57, 2.2, 0, Math.PI * 2); c.fill(); }
  boxers(c, 0.5, -29);
  skull(c, 1, -71, talk, true);
  // The flesh over them: him as he is (flailing, then arms up, screaming), eaten away where they've bitten
  const fleshK = t < FLESH_END ? 1 : Math.max(0, 1 - (t - FLESH_END) / FLESH_FADE);
  if (fleshK > 0 && typeof document !== 'undefined') {
    const W = 150, H = 150, OX = 75, OY = 132;
    if (!g.cv) { g.cv = document.createElement('canvas'); g.cv.width = W; g.cv.height = H; }
    const k = g.cv.getContext('2d')!;
    k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1;
    k.clearRect(0, 0, W, H);
    drawSafariArtie(k, OX, OY, 1, fr, !g.landed || t > 80 ? 'hurt' : 'agitated', damage);
    // (red round every bite, then the bite out of him)
    k.globalCompositeOperation = 'source-atop';
    for (const b of g.bites) { k.fillStyle = (b.x * 7 + b.y) % 3 < 1.5 ? '#7F1D1D' : '#B91C1C'; k.beginPath(); k.arc(OX + b.x, OY + b.y, b.r + 2.4, 0, Math.PI * 2); k.fill(); }
    k.globalCompositeOperation = 'destination-out';
    for (const b of g.bites) { k.beginPath(); k.arc(OX + b.x, OY + b.y, b.r, 0, Math.PI * 2); k.fill(); }
    k.globalCompositeOperation = 'source-over';
    c.globalAlpha = fleshK;
    c.drawImage(g.cv, -OX + (g.landed && t < 90 && t % 4 < 2 ? 1 : 0), -OY);
    c.globalAlpha = 1;
  }
  // His guts, out of him and off across the dirt (one of them dragging them), sagging
  if (g.gut > 0) {
    const ex = 10 + g.gut * 78, ey = -3;
    const sx = 3, sy = -36;
    for (const [w, col] of [[5, '#9D174D'], [3.4, '#F472B6'], [1.2, '#FBCFE8']] as const) {
      c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx, sy); c.bezierCurveTo(sx + 14, sy + 6, sx + 8, -6, (sx + ex) / 2, -3 + Math.sin(fr * 0.3) * 1.5); c.quadraticCurveTo(ex - 10, -1, ex, ey); c.stroke();
    }
    // (the loops of it)
    c.fillStyle = '#EC4899'; for (let k = 0.3; k < 1; k += 0.22) c.fillRect(sx + (ex - sx) * k - 1, -4 + Math.sin(k * 9) * 1.5, 3, 2);
    gob(c, ex + 4, -4, { x: 0, y: 0, at: 0, from: 1, skin: 2, ph: 1, eyes: 3 }, fr * 2, true);
  }
  // The swarm: on their way up him from the dirt, then on him, chewing
  for (const s of g.swarm) {
    const k = g.landed ? Math.min(1, Math.max(0, (t - s.at) / 14)) : 0;
    if (k <= 0) continue;
    if (g.armOff && s.x > 8 && s.y < -50) continue;
    const x0 = s.x + s.from * 46, y0 = -3;
    const x = x0 + (s.x - x0) * k, y = y0 + (s.y - y0) * k - Math.sin(k * Math.PI) * 22;
    gob(c, x, y, s, fr, k >= 1);
  }
};

/** The loose bits (the fight draws them, at his feet, facing right): the helmet, the arm, then the heap. */
export const drawEatenLoose = (c: Ctx, g: Eaten, fr: number) => {
  for (const b of g.bits) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.a);
    switch (b.kind) {
      case 'helmet':
        c.fillStyle = '#5E5236'; c.beginPath(); c.ellipse(0, 1, 13, 3.4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#CDBC8A'; c.beginPath(); c.ellipse(0, 0.6, 12, 2.6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5E5236'; c.beginPath(); c.ellipse(0, 0, 9, 8, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#E8DCB2'; c.beginPath(); c.ellipse(0, 0, 8, 7, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#FCF6E2'; c.fillRect(-5, -5, 3, 2);
        c.fillStyle = '#5E381E'; c.fillRect(-8, -2.4, 16, 2);
        c.fillStyle = GORE; c.fillRect(-3, -1, 6, 1.4);
        break;
      case 'arm': {
        // (sleeve, the farmer's tan, the sunburned forearm, the hand; the chewed end)
        c.fillStyle = '#4A3C20'; c.fillRect(-9, -3.6, 7, 7.2); c.fillStyle = '#CAB47C'; c.fillRect(-8.4, -3, 5.8, 6);
        c.fillStyle = '#7A5040'; c.fillRect(-3, -2.6, 6, 5.2); c.fillStyle = '#FBE4D0'; c.fillRect(-2.6, -2, 5.4, 4);
        c.fillStyle = '#6E3022'; c.fillRect(2.6, -2.4, 9, 4.8); c.fillStyle = '#EAA080'; c.fillRect(3, -1.8, 8.4, 3.6);
        c.fillStyle = '#6E3C26'; c.beginPath(); c.arc(13.6, 0, 3.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F0C29C'; c.beginPath(); c.arc(13.6, 0, 2.6, 0, Math.PI * 2); c.fill();
        c.fillStyle = GORE_DK; c.beginPath(); c.arc(-9.5, 0, 3.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#DC2626'; c.beginPath(); c.arc(-9.5, 0, 2.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = BONE; c.fillRect(-12.5, -0.9, 3.4, 1.8);
        break;
      }
      case 'long': boneLine(c, -b.l / 2, 0, b.l / 2, 0, b.s); break;
      case 'ribs': ribs(c, 0, 0); break;
      case 'pelvis': pelvis(c, 0, 0); break;
      case 'boxers': boxers(c, 0, 0); break;
      case 'boot': boot(c, 0, 4); break;
      case 'skull': skull(c, 0, 0, 0.6, false); break;
      case 'tooth': c.fillStyle = '#5E5C50'; c.fillRect(-1.4, -2.4, 2.8, 4.8); c.fillStyle = '#FFFBEB'; c.fillRect(-1, -2, 2, 4); break;
      case 'tag':
        c.fillStyle = '#1C1917'; c.fillRect(-5, -3.4, 10, 6.8); c.fillStyle = '#FFFFFF'; c.fillRect(-4.4, -2.8, 8.8, 5.6);
        c.fillStyle = '#DC2626'; c.fillRect(-4.4, -2.8, 8.8, 1.8); c.fillStyle = '#1C1917'; c.fillRect(-3, 0.4, 6, 0.8);
        break;
    }
    c.restore();
  }
  // (a pool of it under the heap, spreading)
  if (g.heapAt >= 0) {
    const k = Math.min(1, (g.t - g.heapAt) / 60);
    c.fillStyle = GORE_DK; c.beginPath(); c.ellipse(0, 0, 12 + k * 26, 2 + k * 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = GORE; c.beginPath(); c.ellipse(-2, -0.5, 9 + k * 20, 1.4 + k * 1.4, 0, 0, Math.PI * 2); c.fill();
    // (flies, already)
    if (g.t - g.heapAt > 90) for (let i = 0; i < 3; i++) { const a = fr * 0.2 + i * 2.1; c.fillStyle = '#000'; c.fillRect(Math.cos(a) * 14 + Math.sin(a * 2.3) * 4, -18 + Math.sin(a * 1.7) * 6, 1.6, 1.6); }
  }
};

/** Where the swarm is on him (his space), the ones there: for their bursting when it comes down. */
export const swarmAt = (g: Eaten) => g.swarm.filter(s => !(g.armOff && s.x > 8 && s.y < -50) && s.at + 14 <= g.t);
