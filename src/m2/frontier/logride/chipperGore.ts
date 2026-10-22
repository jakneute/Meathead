// The woodchipper's gore (the user's: "show more gore when throwing an enemy in the woodchipper"). Whoever goes into
// the hopper (chipper.ts chipThrown: the kill, its timing and CHIPPED! are its own, untouched) comes back out the chute
// as an over-the-top cartoon burst: the big ones (a grown logger) choke it first, a beat of the engine sputtering and
// black smoke and the whole machine shaking, then it clears all at once: a big red jet arcing out over the truck (blood
// mist), and the chunks in it (bits of meat, bone shards, an eyeball, teeth, a boot, the scraps of their flannel and
// hi-vis, their hard hat), raining down onto the truck's bed and the clearing. Where it lands it stays (the visit's):
// blood pools and red-soaked sawdust, the bits lying where they fell; the hopper's lip and its knives and the chute's
// mouth left bloody; and the screen's edges catch some of it (red splats running down, fading).
//
// Peak SNES: every bit's a cached sprite (inked, stepped shading, a glint), the pools banded; the mist plain pixels.
// Capped (the mist, the bits, the pools), so a burst is never a long frame.

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { onScreen } from '../kit';
import { type Ctx, box, hash, mix, stillAt, puff, INK } from './paint';
import { rideOf } from './state';
import { CHIPPER } from './layout';
import { CHUTE } from './chipper';
import { loggerColors, LOGGER } from './kinds';

// ---------------------------------------------------------------------------------------------------------------
// State (on the ride: it stays for the visit, through the station's reset)

type Bit = 'meat0' | 'meat1' | 'meat2' | 'bone' | 'eye' | 'tooth' | 'boot' | 'hat' | 'cloth' | 'vest';
interface Gib { x: number; y: number; vx: number; vy: number; rot: number; spin: number; bit: Bit; col: string; bounced: boolean; rest: boolean }
interface Mist { x: number; y: number; vx: number; vy: number; life: number; s: number; c: number }
interface Pool { x: number; y: number; k: number; w: number }
interface Burst { t: number; big: boolean; hat: string; check: string; vest: boolean; skin: string; seed: number }
export interface Gore { bursts: Burst[]; gibs: Gib[]; mist: Mist[]; pools: Pool[]; bloody: number; lens: number; lensSeed: number; jam: number }

const goreOf = (state: GameState): Gore => {
  const r = rideOf(state);
  return (r.gore ??= { bursts: [], gibs: [], mist: [], pools: [], bloody: 0, lens: 0, lensSeed: 0, jam: 0 });
};

/** The choke (frames, the big ones), the burst after it, the dribble. */
const JAM = 24, JET = 40, DRIBBLE = 34;
const MAX_MIST = 300, MAX_GIBS = 110, MAX_POOLS = 64, LENS = 160;
const REDS = ['#5A0A0A', '#8B1010', '#B91C1C', '#DC2626', '#F87171'];

/** True while it's choking on a big one (chipper.ts holds its own red spray off for it; chipperArt.ts shakes it). */
export const chipperJammed = (state: GameState) => goreOf(state).jam > 0;

/** Somebody's gone in (chipper.ts chipThrown): their burst, after a choke if they're a big one. */
export const startGore = (state: GameState, e: Enemy) => {
  const G = goreOf(state);
  const big = e.height >= 60;
  const lc = (e.kind as string | undefined) === LOGGER ? loggerColors(e) : null;
  G.bursts.push({
    t: big ? 0 : JAM, big, seed: Math.floor(Math.random() * 1000),
    hat: lc?.hat ?? '#FACC15', check: lc?.check ?? '#B91C1C', vest: lc?.vest ?? false, skin: lc?.skin ?? '#E0AC80',
  });
  if (big) { G.jam = JAM; playSound('clang', 0.9, -10); playSound('thud', 0.8, -14); }
};

// ---------------------------------------------------------------------------------------------------------------
// Where it lands: the truck's bed (its heap of chips), the cab's roof, else the clearing

const truckX = () => CHIPPER.x + 200;
const floorAt = (x: number) => {
  const g = CHIPPER.ground, tx = truckX();
  if (x > tx + 4 && x < tx + 146) { const u = (x - tx - 4) / 142; return g - 69 - 62 * u * (1 - u); }
  if (x >= tx + 150 && x < tx + 210) return g - 90;
  return g + 2;
};

const addPool = (G: Gore, x: number, y: number, w: number) => {
  for (const p of G.pools) if (Math.abs(p.x - x) < p.w * 0.6 && Math.abs(p.y - y) < 4) { p.w = Math.min(36, p.w + 2); return; }
  if (G.pools.length >= MAX_POOLS) {
    // (full: the nearest one grows instead)
    let best = G.pools[0], d = Infinity;
    for (const p of G.pools) { const q = Math.abs(p.x - x) + Math.abs(p.y - y); if (q < d) { d = q; best = p; } }
    best.w = Math.min(36, best.w + 1);
    return;
  }
  G.pools.push({ x: Math.round(x), y: Math.round(y), k: Math.floor(Math.random() * 6), w });
};

// ---------------------------------------------------------------------------------------------------------------
// A frame of it (chipper.ts updateChipper, every frame)

const mist = (G: Gore, n: number, hard: number) => {
  for (let i = 0; i < n && G.mist.length < MAX_MIST; i++) {
    G.mist.push({
      x: CHUTE.x + 2 + Math.random() * 4, y: CHUTE.y - 6 + Math.random() * 12,
      vx: (3 + Math.random() * 8) * hard, vy: (-3 - Math.random() * 6) * hard + 1,
      life: 140, s: 1 + Math.floor(Math.random() * 3), c: Math.floor(Math.random() * 4),
    });
  }
};
const gib = (G: Gore, bit: Bit, col = '') => {
  if (G.gibs.length >= MAX_GIBS) {
    // (full: the oldest one lying about goes)
    const i = G.gibs.findIndex(q => q.rest);
    if (i < 0) return;
    G.gibs.splice(i, 1);
  }
  G.gibs.push({ x: CHUTE.x + 4, y: CHUTE.y + (Math.random() - 0.5) * 10, vx: 2 + Math.random() * 7.5, vy: -4 - Math.random() * 6, rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.5, bit, col, bounced: false, rest: false });
};

export const updateGore = (state: GameState) => {
  const G = goreOf(state);
  if (G.jam > 0) {
    G.jam--;
    // (choking on it: the engine sputtering, it bucking)
    if (G.jam % 6 === 0) { playSound('dry_gore', 0.9, -12); playSound('engine', 0.4, -16 + (G.jam % 12)); }
    if (G.jam % 8 === 0) shakeScreen(state, 3, 2);
    // (a few drips out the chute while it's stuck)
    if (G.jam % 5 === 0) mist(G, 1, 0.2);
  }
  for (const b of G.bursts) {
    b.t++;
    const k = b.t - JAM;
    if (k === 1) {
      // (it clears: all of it at once)
      playSound('gorespray', 1, -8); playSound('gorespray', 1, -2); playSound('splat', 1, -6); playSound('crunch', 1, -10); playSound('grind', 1, -12);
      shakeScreen(state, b.big ? 12 : 7, b.big ? 6 : 3);
      G.bloody = Math.min(3, G.bloody + 1);
      if (onScreen(state, CHUTE.x - 40, CHUTE.x + 40)) { G.lens = LENS; G.lensSeed = b.seed; }
      // (the bits of them: an eye, teeth, a boot, the hat, the clothes, bone)
      gib(G, 'eye'); gib(G, 'tooth'); gib(G, 'tooth'); gib(G, 'tooth'); gib(G, 'boot');
      if (b.big) gib(G, 'hat', b.hat);
      for (let i = 0; i < 4; i++) gib(G, 'cloth', b.check);
      if (b.vest) { gib(G, 'vest'); gib(G, 'vest'); }
      for (let i = 0; i < 3; i++) gib(G, 'bone');
    }
    if (k > 0 && k <= JET) {
      mist(G, 7, 1);
      if (k % 2 === 0 && k < 28) gib(G, (['meat0', 'meat1', 'meat2'] as const)[k % 3]);
      if (k % 7 === 0) playSound('gnaw', 0.9, -6);
      if (k === 18) gib(G, 'boot');
    } else if (k > JET && k <= JET + DRIBBLE) {
      if (k % 2 === 0) mist(G, 1, 0.45);
    }
  }
  G.bursts = G.bursts.filter(b => b.t - JAM <= JET + DRIBBLE);
  // (the mist: arcing out, landing as pools)
  for (const m of G.mist) {
    m.vy += 0.28; m.vx *= 0.995; m.x += m.vx; m.y += m.vy; m.life--;
    const fl = floorAt(m.x);
    if (m.y >= fl) { m.life = 0; if (Math.random() < 0.3) addPool(G, m.x, fl, 6 + Math.floor(Math.random() * 6)); }
  }
  G.mist = G.mist.filter(m => m.life > 0);
  // (the bits: tumbling, a bounce, then lying where they fell, a little pool under each)
  for (const q of G.gibs) {
    if (q.rest) continue;
    q.vy += 0.4; q.x += q.vx; q.y += q.vy; q.rot += q.spin;
    const fl = floorAt(q.x);
    if (q.y >= fl - 2) {
      q.y = fl - 2;
      if (!q.bounced && q.vy > 3) { q.bounced = true; q.vy *= -0.3; q.vx *= 0.5; q.spin *= 0.5; playSound('squish', 0.25, 4 + Math.random() * 6); addPool(G, q.x, fl, 8); }
      else { q.rest = true; q.vx = 0; q.vy = 0; q.rot = Math.round(q.rot / (Math.PI / 2)) * (Math.PI / 2) + (hash(q.x) - 0.5) * 0.6; }
    }
  }
  // (a bloody chute keeps dripping)
  if (G.bloody > 0 && state.frame % 37 === 0 && G.mist.length < MAX_MIST) G.mist.push({ x: CHUTE.x + 2, y: CHUTE.y + 10, vx: 0.4, vy: 0, life: 140, s: 2, c: 1 });
  if (G.lens > 0) G.lens--;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The pools (on the clearing and the truck's bed: drawn behind everybody, chipperArt.ts drawChipperBack). */
export const drawGorePools = (c: Ctx, state: GameState) => {
  const G = goreOf(state);
  for (const p of G.pools) {
    if (!onScreen(state, p.x - 40, p.x + 40)) continue;
    const w = Math.max(6, Math.round(p.w / 2) * 2);
    stillAt(c, `lr-gorepool-${p.k}-${w}`, p.x, p.y, -w - 6, -3, w * 2 + 12, 7, g => paintPool(g, w, p.k));
  }
};

/** A pool: banded red, an inked rim, a wet glint; half of them red-soaked sawdust round it. */
const paintPool = (g: Ctx, w: number, k: number) => {
  const h = Math.max(2, Math.round(w / 5));
  g.fillStyle = REDS[0]; g.beginPath(); g.ellipse(0, 0, w + 1, h + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = REDS[1]; g.beginPath(); g.ellipse(0, 0, w, h, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = REDS[2]; g.beginPath(); g.ellipse(-w * 0.15, -h * 0.2, w * 0.7, h * 0.6, 0, 0, Math.PI * 2); g.fill();
  // (lobes off it: splashed, not poured)
  for (let i = 0; i < 3; i++) { const a = hash(k * 7 + i) * Math.PI * 2, d = w * (0.8 + hash(k + i * 3) * 0.4); box(g, Math.cos(a) * d - 1, Math.sin(a) * h * 0.8 - 1, 3, 2, REDS[1]); }
  box(g, -w * 0.45, -h * 0.5, Math.max(2, w * 0.3), 1, REDS[4]);
  box(g, -w * 0.45 + 1, -h * 0.5 + 1, 1, 1, '#FECACA');
  if (k % 2 === 0) for (let i = 0; i < Math.round(w * 0.8); i++) {
    const x = (hash(k * 13 + i * 1.7) - 0.5) * (w * 2 + 8), y = (hash(k * 5 + i * 2.3) - 0.5) * (h * 2 + 2);
    box(g, x, y, 2, 1, i % 3 === 0 ? '#C88A5A' : i % 3 === 1 ? '#9A3A1E' : '#7A1A10');
  }
};

/** The chute's mouth, bloody (chipperArt.ts, after the chute). */
export const drawChuteBlood = (c: Ctx, state: GameState) => {
  const G = goreOf(state);
  if (G.bloody <= 0) return;
  stillAt(c, `lr-chuteblood-${G.bloody}`, CHUTE.x, CHUTE.y, -6, -14, 14, 40, g => {
    box(g, -4, -12, 10, 3, REDS[1]); box(g, -3, -9, 8, 14, REDS[2]); box(g, -3, -9, 2, 14, REDS[3]);
    for (let i = 0; i < 2 + G.bloody; i++) { const x = -3 + hash(i * 3.1) * 8, len = 6 + hash(i * 1.9) * 8 * G.bloody; box(g, x, 4, 2, len, REDS[1]); box(g, x, 4 + len, 2, 2, REDS[2]); }
  });
};

/** The hopper's lip and its knives, bloody (chipperArt.ts drawChipperFront, over the hopper). */
export const drawHopperBlood = (c: Ctx, state: GameState) => {
  const G = goreOf(state);
  if (G.bloody <= 0) return;
  const lv = G.bloody;
  stillAt(c, `lr-hopperblood-${lv}`, CHIPPER.x, CHIPPER.hopperY, -50, -26, 86, 96, g => {
    // (smeared over the lip, dripping down the funnel's face past the DANGER plate)
    for (let i = 0; i < 4 + lv * 3; i++) {
      const x = -46 + hash(i * 2.7 + 1) * 74, w = 4 + hash(i * 1.3) * 10;
      box(g, x, -24, w, 3, REDS[1]); box(g, x, -21, w, 4, REDS[2]); box(g, x + 1, -21, Math.max(1, w * 0.3), 1, REDS[4]);
      if (hash(i * 5.1) < 0.4 + lv * 0.15) { const len = 6 + hash(i * 3.3) * 14 * lv; box(g, x + w / 2 - 1, -17, 2, len, REDS[1]); box(g, x + w / 2 - 1, -17 + len, 3, 2, REDS[2]); }
    }
    // (a handprint, grabbing at the edge on the way in)
    if (lv >= 2) { box(g, 14, -14, 6, 5, REDS[2]); for (let f = 0; f < 4; f++) box(g, 14 + f * 1.6, -19 + (f === 0 ? 2 : 0), 1, 5, REDS[2]); box(g, 20, -12, 3, 1, REDS[2]); }
  });
};
export const bloodyKnives = (state: GameState) => goreOf(state).bloody > 0;

/** The bits flying and lying, the mist, the screen's splats (chipperArt.ts drawChipperFront). */
export const drawGoreFront = (c: Ctx, state: GameState) => {
  const G = goreOf(state);
  // (the black smoke of it choking, out the exhaust)
  if (G.jam > 0) for (let i = 0; i < 3; i++) { const t = ((JAM - G.jam) / JAM + i / 3) % 1; puff(c, CHIPPER.x + 119 + t * 14, CHIPPER.ground - 146 - t * 50, 6 + t * 12, ['#18181B', '#27272A', '#3F3F46'], 0.85 * (1 - t)); }
  for (const q of G.gibs) {
    if (!onScreen(state, q.x - 20, q.x + 20)) continue;
    c.save(); c.translate(Math.round(q.x), Math.round(q.y)); c.rotate(q.rest ? q.rot : Math.round(q.rot / 0.4) * 0.4);
    stillAt(c, `lr-gib-${q.bit}-${q.col}`, 0, 0, -9, -8, 18, 16, g => paintBit(g, q.bit, q.col));
    c.restore();
  }
  for (const m of G.mist) { c.fillStyle = REDS[1 + m.c]; c.fillRect(Math.round(m.x), Math.round(m.y), m.s, m.s); }
  if (G.lens > 0) drawLens(c, state, G);
};

/** Each bit, drawn once (local, about its middle; inked, stepped, a glint). */
const paintBit = (g: Ctx, bit: Bit, col: string) => {
  const blob = (w: number, h: number, ramp: string[]) => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w + 1, h + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ramp[0]; g.beginPath(); g.ellipse(0, 0, w, h, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = ramp[1]; g.beginPath(); g.ellipse(-w * 0.2, -h * 0.2, w * 0.7, h * 0.6, 0, 0, Math.PI * 2); g.fill();
    box(g, -w * 0.5, -h * 0.55, Math.max(1, w * 0.4), 1, ramp[2]);
  };
  switch (bit) {
    case 'meat0': blob(5, 3.5, ['#8B1010', '#C2414B', '#F2A8B0']); box(g, 1, -1, 3, 2, '#F5E6C8'); break;
    case 'meat1': blob(4, 4, ['#7A1414', '#B83A44', '#F0B0B4']); box(g, -3, 1, 2, 2, '#5A0A0A'); break;
    case 'meat2':
      // (a string of gut)
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-7, 2); g.quadraticCurveTo(-2, -6, 2, 0); g.quadraticCurveTo(5, 5, 7, -2); g.stroke();
      g.strokeStyle = '#C2606A'; g.lineWidth = 2.4; g.stroke(); g.strokeStyle = '#F2B8BC'; g.lineWidth = 0.8; g.stroke();
      break;
    case 'bone':
      box(g, -6, -1.5, 12, 3, INK); box(g, -5, -1, 10, 2, '#E8E2D0'); box(g, -5, -1, 10, 1, '#FFFFF4');
      for (const x of [-7, 5]) { box(g, x, -3, 3, 6, INK); box(g, x + 0.5, -2.5, 2, 5, '#D8D0B8'); }
      box(g, 3, -1, 1, 2, REDS[2]);
      break;
    case 'eye':
      blob(4, 4, ['#E8E4DC', '#FFFFFF', '#FFFFFF']);
      g.fillStyle = '#2E6AA8'; g.beginPath(); g.arc(1.4, 0, 2, 0, Math.PI * 2); g.fill();
      box(g, 1, -0.5, 1.4, 1.4, INK); box(g, 0.4, -1.6, 1, 1, '#FFFFFF');
      // (the optic nerve trailing off it)
      g.strokeStyle = REDS[2]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-4, 0); g.quadraticCurveTo(-6, 3, -8, 2); g.stroke();
      box(g, -3, -2, 1, 1, REDS[2]); box(g, -2, 2, 1, 1, REDS[2]);
      break;
    case 'tooth':
      box(g, -2, -3, 4, 6, INK); box(g, -1.5, -2.5, 3, 3, '#F8F6EC'); box(g, -1.5, 0.5, 1.2, 2, '#E8E0C8'); box(g, 0.3, 0.5, 1.2, 2, '#E8E0C8');
      box(g, -1.5, -2.5, 1, 1, '#FFFFFF'); box(g, -1, 2, 1, 1, REDS[2]);
      break;
    case 'boot':
      box(g, -6, -6, 8, 9, INK); box(g, -6, 1, 13, 5, INK);
      box(g, -5, -5, 6, 7, '#5A3A1E'); box(g, -5, 2, 11, 3, '#5A3A1E'); box(g, -5, -5, 2, 10, '#7A5430'); box(g, -5, 4, 11, 1, '#2A1A0C');
      box(g, -4, -3, 4, 1, '#C8A070'); box(g, -4, -1, 4, 1, '#C8A070');
      box(g, -6, -7, 8, 2, REDS[2]); box(g, -4, -7, 3, 1, '#F2A8B0');
      break;
    case 'hat':
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, 1, 8, 6, 0, Math.PI, 0); g.fill(); box(g, -9, 0, 18, 3, INK);
      g.fillStyle = col; g.beginPath(); g.ellipse(0, 1, 7, 5, 0, Math.PI, 0); g.fill();
      box(g, -8, 1, 16, 1, mix(col, '#000000', 0.25)); box(g, -1, -4, 2, 5, mix(col, '#FFFFFF', 0.35)); box(g, -5, -2, 2, 1, mix(col, '#FFFFFF', 0.5));
      box(g, 2, -2, 3, 3, REDS[2]); box(g, 4, 1, 2, 2, REDS[1]);
      break;
    case 'cloth': {
      g.fillStyle = INK; g.beginPath(); g.moveTo(-6, -4); g.lineTo(5, -5); g.lineTo(7, 2); g.lineTo(1, 5); g.lineTo(-7, 3); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.moveTo(-5, -3); g.lineTo(4, -4); g.lineTo(6, 2); g.lineTo(1, 4); g.lineTo(-6, 2); g.closePath(); g.clip();
      box(g, -7, -5, 14, 10, col);
      for (let i = -6; i < 7; i += 3) { box(g, i, -5, 1, 10, mix(col, '#000000', 0.45)); box(g, -7, i * 0.6, 14, 1, mix(col, '#000000', 0.45)); }
      box(g, -2, 0, 4, 3, REDS[2]);
      g.restore();
      break;
    }
    case 'vest':
      box(g, -6, -4, 12, 8, INK); box(g, -5, -3, 10, 6, '#C6F01A'); box(g, -5, -1, 10, 2, '#D4D8DC'); box(g, -5, -1, 10, 1, '#FFFFFF');
      box(g, 1, 1, 3, 2, REDS[2]);
      break;
  }
};

/** Red on the screen's edges: splats in from the sides and the top, running down, fading. */
const drawLens = (c: Ctx, state: GameState, G: Gore) => {
  const a = Math.min(1, G.lens / 70), run = LENS - G.lens;
  for (let i = 0; i < 14; i++) {
    const h0 = hash(G.lensSeed + i * 7.3), side = i % 3;
    const sx = state.camera.x + (side === 0 ? h0 * 70 : side === 1 ? CANVAS_WIDTH - h0 * 70 : 40 + h0 * (CANVAS_WIDTH - 80));
    const sy = state.camera.y + (side === 2 ? hash(i * 3.1 + G.lensSeed) * 50 : 30 + hash(i * 2.3 + G.lensSeed) * (CANVAS_HEIGHT - 120));
    const r = 6 + hash(i * 5.7 + G.lensSeed) * 14;
    c.globalAlpha = 0.8 * a;
    c.fillStyle = REDS[1]; c.beginPath(); c.ellipse(sx, sy, r, r * 0.85, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 5; k++) { const ang = hash(i * 11 + k) * Math.PI * 2, d = r * (1.1 + hash(i + k * 2) * 0.5); c.fillRect(Math.round(sx + Math.cos(ang) * d) - 2, Math.round(sy + Math.sin(ang) * d) - 2, 4, 4); }
    // (running down)
    const len = Math.min(140, run * (0.4 + hash(i * 1.9) * 0.9));
    c.fillRect(Math.round(sx - 2), Math.round(sy), 4, Math.round(len)); c.fillRect(Math.round(sx - 3), Math.round(sy + len - 2), 6, 5);
    c.fillStyle = REDS[2]; c.beginPath(); c.ellipse(sx - r * 0.15, sy - r * 0.15, r * 0.7, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.7 * a; c.fillStyle = REDS[4]; c.fillRect(Math.round(sx - r * 0.45), Math.round(sy - r * 0.45), Math.max(2, Math.round(r * 0.3)), 2);
  }
  c.globalAlpha = 1;
};
