// What the plain pistol (GUN: not Dirty Dan's LMG, nothing special) does to what it kills, in place of the usual burst:
//   people:   one through the forehead (a hole in front, his brains out the back, the head snapping back), then over he
//             goes, stiff as a board or knees first, back or on his face, and bursts on whatever he comes down on (shot
//             in the air: he drops, and bursts where he lands)
//   jet ski:  the rider takes it the same, slumps over his bars, rides on a little, and the lot goes up
//   birds:    stiff, feet up, and down like a stone, bursting on the ground (the eagle leaves a feather drifting down, the
//             pelican a fish flopping about, the seagull his fries, the pigeon craps all the way down, the vulture
//             corkscrews, the hawk lawn-darts into the dirt beak first, the grackle bounces)
//   goat:     faints: locks up, trembles, keels over legs up, and bursts lying there
//   coyote:   leaps, hangs in the air legs going, sweats, and drops like a stone
//   pit bull: "bang, play dead" for real: knocked over onto his back, legs paddling the air, slowing, stiff; bursts
//   longhorn: sways, rolls over legs up with the ground shaking, swells up, and bursts (his horns stick in the dirt)
//   gator:    a death roll, over and over, ends up belly up, legs twitching, and bursts
//   shark:    belly up, drifts up, swells, pops: and out falls a license plate
//   mutant fish: belly up, swells, fizzing green, pops in green and red
// The small critters (isSmallCritter), the machines, the mid-bosses and the bosses go the usual way.
// And the lowriders on Tommy's bike run: however one's killed, its crew go flying out of it and splat on the road.

import { Enemy, Particle } from '../../types';
import { GRAVITY, PARTICLE_PALETTES } from '../../constants';
import type { GameState } from '../core/state';
import { shakeScreen } from '../core/state';
import { floorTopAt } from '../core/terrain';
import { isMidBoss } from '../combat/midBoss';
import { playSound } from '../platform/audio';
import { getStageLayout } from '../stages';
import { isSmallCritter } from './kinds';
import { LOWRIDER_WINDOWS } from './kinds/tommy';
import { kindHead, isHumanoidKind, isLyingKind } from '../render/enemies/index';
import type { EnemyDeath } from './deaths';

export type GunMode = 'person' | 'lying' | 'jetski' | 'bird' | 'goat' | 'coyote' | 'pitbull' | 'longhorn' | 'gator' | 'shark' | 'mutantfish';

/** Something it leaves behind, flying about then lying there a while. */
export interface GunProp { kind: 'fish' | 'fry' | 'plate' | 'feather' | 'horn'; x: number; y: number; vx: number; vy: number; rot: number; vr: number; landed: boolean; age: number }

export interface GunDeath {
  mode: GunMode;
  /** Which way the round was going. */
  b: 1 | -1;
  /** (people) Which way he goes over, whether he goes at the knees first. */
  fall: 1 | -1;
  limp: boolean;
  /** (people) His lean, about his feet, and how fast it's coming; his head snapped back on his neck; squashed at the knees. */
  th: number; om: number; snap: number;
  /** (animals) Squash/flip, offset, turn; turning about its feet (else its middle). */
  sx: number; sy: number; ox: number; oy: number; rot: number; pf: boolean;
  /** Up in the air when it died (it comes down first). */
  air: boolean;
  /** Where its sequence is, and how long it's been at it. */
  step: number; k: number;
  /** Its legs going (drawn as running), and the frame of that. */
  run: number; anim: number;
  bounces: number;
  /** The water's top under it, if it's over water. */
  water?: number;
  burstAt?: number;
  props: GunProp[];
}

const G = GRAVITY * 0.8;
const MAX_PARTICLES = 2500;
/** How long what's left lies about (then it fades over the last 30). */
export const PROP_LIFE = 170;

const BIRDS = new Set(['eagle', 'pelican', 'vulture', 'seagull', 'pigeon', 'hawk', 'grackle']);
const BEASTS = new Set(['goat', 'coyote', 'pitbull', 'longhorn', 'gator', 'shark', 'mutantfish']);

/** What the pistol does to this one, or null for the usual. */
export const gunDeathMode = (e: Enemy): GunMode | null => {
  const k = e.kind;
  if (!k || e.type === 'boss' || isMidBoss(e) || k === 'tenant' || isSmallCritter(k)) return null;
  if (k === 'jetskier') return 'jetski';
  if (isHumanoidKind(k)) return isLyingKind(k, e.variant) ? 'lying' : 'person';
  if (BIRDS.has(k)) return 'bird';
  if (BEASTS.has(k)) return k as GunMode;
  return null;
};

/** The top of the water under (x, y), if there's any within reach below. */
const waterBelow = (state: GameState, x: number, y: number) => {
  const at = getStageLayout(state.stageId)?.waterBodyAt;
  if (!at) return undefined;
  for (let yy = y - 10; yy < y + 700; yy += 30) { const w = at(state, x, yy); if (w) return w.surface; }
  return undefined;
};

/** What it's going to come down on at x: a floor, a ledge, the water (Infinity: nothing, a pit). */
const groundAt = (state: GameState, g: GunDeath, x: number, from: number) => {
  const f = floorTopAt(state.blocks, x, from, 4);
  return Math.min(f ?? Infinity, g.water !== undefined && g.water >= from - 4 ? g.water : Infinity);
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const push = (state: GameState, p: Particle) => { if (state.particles.length < MAX_PARTICLES) state.particles.push(p); };

const GORE = PARTICLE_PALETTES.GORE, FLESH = PARTICLE_PALETTES.FLESH;
const MEAT = ['#9F1239', '#7F1D1D', '#BE123C', '#FCA5A5'];

/**
 * Burst: the blood and the flesh (they land as splats), the pop of it, and the meat and bone that bounce and lie there.
 * Thrown up and out (it's come down on something), leaning `dir`; `extra` mixed in for what else it was full of.
 */
export const gibs = (state: GameState, x: number, y: number, dir: number, mult: number, extra?: string[]) => {
  const n = Math.round(100 * mult);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.35, sp = rnd(2, 13) * (0.7 + mult * 0.3);
    const own = extra && i % 3 === 1;
    push(state, {
      pos: { x: x + rnd(-6, 6), y: y + rnd(-6, 6) }, vel: { x: Math.cos(a) * sp + dir * 3, y: Math.sin(a) * sp },
      life: rnd(30, 100), color: own ? extra![i % extra!.length] : i % 3 === 0 ? FLESH[i % FLESH.length] : GORE[i % GORE.length],
      size: i % 3 === 0 ? rnd(1, 5) : rnd(2, 11), grav: own ? 0.3 : undefined,
    });
  }
  for (let i = 0; i < 10 * mult; i++) push(state, { pos: { x, y }, vel: { x: rnd(-7, 7), y: rnd(-8, 3) }, life: rnd(8, 22), color: i % 3 ? '#FF4500' : '#FFFF00', size: rnd(2, 7) });
  for (let i = 0; i < 6 * mult; i++) push(state, { pos: { x: x + rnd(-4, 4), y: y - 4 }, vel: { x: rnd(-6, 6) + dir * 2, y: rnd(-9, -3) }, life: rnd(170, 240), color: MEAT[i % MEAT.length], size: rnd(3, 5.5), grav: 0.45, chunk: true });
  for (let i = 0; i < 2; i++) push(state, { pos: { x, y: y - 4 }, vel: { x: rnd(-5, 5), y: rnd(-8, -4) }, life: rnd(170, 240), color: '#F5F5F4', size: 3, grav: 0.45, chunk: true });
  playSound('splat');
};

/** Dust kicked up off the ground at (x, y), out either side. */
const dust = (state: GameState, x: number, y: number, n: number, spread: number) => {
  for (let i = 0; i < n; i++) push(state, { pos: { x: x + rnd(-spread, spread), y: y - 3 }, vel: { x: (i % 2 ? 1 : -1) * rnd(1, 4), y: rnd(-1.6, -0.3) }, life: rnd(18, 30), color: i % 3 ? '#A8A29E' : '#D6D3D1', size: rnd(4, 8) });
};

/** A little blood out of where it was hit. */
const nick = (state: GameState, x: number, y: number, dir: number, n = 6) => {
  for (let i = 0; i < n; i++) push(state, { pos: { x, y }, vel: { x: dir * rnd(1.5, 4.5), y: rnd(-3.5, -0.5) }, life: rnd(14, 30), color: GORE[i % GORE.length], size: rnd(1.5, 4) });
};

/** Where its head is, in the world (as it was when it died). */
const headAt = (d: EnemyDeath) => {
  const s = d.sprite!, hd = kindHead(s.kind, s.variant);
  return { x: d.x + d.w / 2 + hd.x * s.facing, y: d.y + d.h + hd.y, r: hd.r };
};

/** In the front, out the back: a hole, and his brains and a bit of skull out the far side the way the round went. */
const throughTheHead = (state: GameState, d: EnemyDeath, b: number) => {
  const h = headAt(d), ex = h.x + b * h.r * 0.8, ey = h.y - h.r * 0.2;
  for (let i = 0; i < 16; i++) push(state, { pos: { x: ex, y: ey + rnd(-2, 2) }, vel: { x: b * rnd(3, 10), y: rnd(-4, 1) }, life: rnd(20, 45), color: GORE[i % GORE.length], size: rnd(1.5, 4.5) });
  for (let i = 0; i < 7; i++) push(state, { pos: { x: ex, y: ey }, vel: { x: b * rnd(2, 7), y: rnd(-4.5, -0.5) }, life: rnd(30, 55), color: i % 2 ? FLESH[0] : FLESH[1], size: rnd(2.5, 5) });
  for (let i = 0; i < 2; i++) push(state, { pos: { x: ex, y: ey }, vel: { x: b * rnd(2, 5), y: rnd(-5, -2) }, life: rnd(150, 210), color: '#F5F5F4', size: 2, grav: 0.45, chunk: true });
  nick(state, h.x - b * h.r * 0.5, ey, -b, 3);
};

/** Sets up the pistol's death on a record startEnemyDeath has just made. */
export const startGunDeath = (state: GameState, d: EnemyDeath, e: Enemy, mode: GunMode, vel?: { x: number; y: number }) => {
  const facing = d.sprite?.facing ?? 1;
  const b = (Math.sign(vel?.x ?? 0) || -facing) as 1 | -1;
  const cx = d.x + d.w / 2, feet = d.y + d.h;
  const g: GunDeath = {
    mode, b, fall: Math.random() < 0.7 ? b : (-b as 1 | -1), limp: Math.random() < 0.4, th: 0, om: 0.01, snap: 0,
    sx: 1, sy: 1, ox: 0, oy: 0, rot: 0, pf: false, air: false, step: 0, k: 0, run: 0, anim: 0, bounces: 0, props: [],
    water: waterBelow(state, cx, feet),
  };
  d.gd = g;
  d.vx = 0; d.vy = 0;
  if (mode === 'jetski' || mode === 'shark') { g.air = false; d.floorY = feet; }
  else {
    const ground = groundAt(state, g, cx, feet);
    g.air = ground - feet > 3;
    d.floorY = Number.isFinite(ground) ? ground : feet + 2000;
  }
  if (mode === 'person' || mode === 'lying' || mode === 'jetski') {
    throughTheHead(state, d, b);
    if (g.air) { d.vx = b * 1.2; d.vy = Math.min(0, e.vel.y) * 0.4; }
    if (mode === 'jetski') d.vx = e.vel.x;
    return;
  }
  // (an animal: hit about its middle)
  nick(state, cx, d.y + d.h * 0.4, b, 8);
  if (mode === 'bird') {
    // A puff of its feathers; it's carried on a little the way it was going
    for (let i = 0; i < 12; i++) push(state, { pos: { x: cx + rnd(-8, 8), y: d.y + d.h * 0.4 }, vel: { x: rnd(-2.5, 2.5) + b, y: rnd(-3, 0.5) }, life: rnd(60, 110), color: i % 3 ? d.color : '#E7E5E4', size: rnd(2, 3.5), grav: 0.035, chunk: true });
    d.vx = e.vel.x * 0.6; d.vy = Math.min(0, e.vel.y) * 0.3;
    if (!g.air) d.vy = -5;
    g.air = true;
  }
  if (mode === 'longhorn') playSound('bellow', 0.6);
  if (mode === 'coyote') { g.run = 5; if (!g.air) d.vy = -7.5; }
  if (mode === 'shark' || mode === 'mutantfish') d.vx = e.vel.x * 0.5;
};

/** Down it goes, gravity `acc` a frame; true once it's down on something (`bottom`: how far below d.y its lowest point is). */
const drop = (state: GameState, d: EnemyDeath, g: GunDeath, acc = G, cap = 16, bottom = d.h): boolean => {
  const from = d.y + bottom;
  d.vy = Math.min(cap, d.vy + acc); d.x += d.vx; d.y += d.vy; d.vx *= 0.97;
  if (d.vy <= 0) return false;
  const f = groundAt(state, g, d.x + d.w / 2, from);
  if (Number.isFinite(f)) d.floorY = f;
  if (d.y + bottom >= f) { d.y = f - bottom; return true; }
  return false;
};

const burst = (state: GameState, d: EnemyDeath, g: GunDeath, x: number, y: number, dir: number, mult: number, extra?: string[]) => {
  gibs(state, x, y, dir, mult, extra);
  g.burstAt = d.t;
  shakeScreen(state, Math.round(3 + mult * 3));
};

const addProp = (g: GunDeath, kind: GunProp['kind'], x: number, y: number, vx: number, vy: number, vr = rnd(-0.3, 0.3)) =>
  g.props.push({ kind, x, y, vx, vy, rot: rnd(0, 6), vr, landed: false, age: 0 });

/** A thing left behind: flying, then lying there (the fish flops about; the feather sways down; a horn sticks in). */
const stepProp = (state: GameState, g: GunDeath, p: GunProp) => {
  p.age++;
  if (p.landed) {
    if (p.kind === 'fish' && p.age < 130 && p.age % 15 === 0) { p.vy = rnd(-4, -2.5); p.vx = rnd(-1.2, 1.2); p.vr = rnd(-0.5, 0.5); p.landed = false; }
    return;
  }
  const from = p.y;
  if (p.kind === 'feather') { p.vy = Math.min(0.6, p.vy + 0.04); p.x += p.vx + Math.sin(p.age * 0.11) * 0.9; p.vx *= 0.95; p.rot = Math.sin(p.age * 0.11) * 0.7; }
  else { p.vy = Math.min(14, p.vy + G); p.x += p.vx; p.rot += p.vr; }
  p.y += p.vy;
  const f = groundAt(state, g, p.x, from);
  if (p.vy > 0 && p.y >= f) {
    p.y = f; p.landed = true; p.vx = 0; p.vy = 0;
    if (p.kind !== 'horn' && p.kind !== 'feather') p.rot = Math.round(p.rot / Math.PI) * Math.PI;
  }
  if (p.y > f + 1500) p.age = PROP_LIFE;
};

/** One frame of it. False once it's over. */
export const updateGunDeath = (state: GameState, d: EnemyDeath): boolean => {
  const g = d.gd!;
  d.t++;
  if (g.burstAt !== undefined) {
    let live = false;
    for (const p of g.props) { stepProp(state, g, p); if (p.age < PROP_LIFE) live = true; }
    return live;
  }
  switch (g.mode) {
    case 'person': case 'lying': case 'jetski': person(state, d, g); break;
    case 'bird': bird(state, d, g); break;
    default: beast(state, d, g); break;
  }
  return g.burstAt !== undefined || d.y < d.floorY + 1200;
};

/** (people) The head snapping back, and a pulse or two out of it. */
const snapHead = (state: GameState, d: EnemyDeath, g: GunDeath) => {
  g.snap = g.b * (d.t < 3 ? 0.62 * d.t / 3 : 0.62 - 0.3 * Math.min(1, (d.t - 3) / 10));
  if (d.t < 16 && d.t % 4 === 0) {
    const h = headAt(d);
    push(state, { pos: { x: h.x + g.b * h.r * 0.6, y: h.y }, vel: { x: g.b * rnd(1, 3), y: rnd(-2, 0) }, life: 20, color: GORE[d.t % GORE.length], size: rnd(1.5, 3) });
  }
};

const person = (state: GameState, d: EnemyDeath, g: GunDeath) => {
  snapHead(state, d, g);
  const fx = d.x + d.w / 2, fy = d.y + d.h;
  if (g.mode === 'lying') {
    // (on her towel already: a jolt, and she goes up where she lies)
    g.oy = d.t < 4 ? -2 : 0;
    if (d.t >= 18) burst(state, d, g, fx, fy - 6, 0, 1.1);
    return;
  }
  if (g.mode === 'jetski') {
    // Slumped over his bars, riding on a little, and then it goes up
    d.x += d.vx; d.vx *= 0.96;
    const s = Math.min(1, Math.max(0, (d.t - 7) / 14));
    g.th = (d.sprite?.facing ?? 1) * 0.75 * s * s * (3 - 2 * s);
    if (d.t > 30 && d.t % 5 === 0) push(state, { pos: { x: fx + rnd(-10, 10), y: fy - 14 }, vel: { x: rnd(-0.4, 0.4), y: rnd(-1.4, -0.8) }, life: 30, color: 'rgba(68, 64, 60, 0.6)', size: rnd(5, 8) });
    if (d.t >= 52) {
      burst(state, d, g, fx, fy - 14, 0, 1.3);
      for (let i = 0; i < 26; i++) push(state, { pos: { x: fx + rnd(-16, 16), y: fy - 12 }, vel: { x: rnd(-6, 6), y: rnd(-9, -1) }, life: rnd(15, 40), color: PARTICLE_PALETTES.FIRE[i % PARTICLE_PALETTES.FIRE.length], size: rnd(4, 10) });
      for (let i = 0; i < 6; i++) push(state, { pos: { x: fx + rnd(-16, 16), y: fy - 12 }, vel: { x: rnd(-6, 6), y: rnd(-10, -4) }, life: rnd(150, 210), color: i % 2 ? '#F1F5F9' : '#DC2626', size: rnd(3, 5), grav: 0.45, chunk: true });
      for (let i = 0; i < 6; i++) push(state, { pos: { x: fx + rnd(-12, 12), y: fy - 18 }, vel: { x: rnd(-0.8, 0.8), y: rnd(-1.6, -0.6) }, life: 50, color: 'rgba(68, 64, 60, 0.6)', size: rnd(8, 14) });
      playSound('boom', 0.7);
    }
    return;
  }
  if (g.air) {
    // Shot in the air: he drops, going limp, and bursts where he lands
    g.th += g.fall * Math.max(0, 0.05 - Math.abs(g.th) * 0.03);
    if (drop(state, d, g)) burst(state, d, g, d.x + d.w / 2, d.floorY - d.h * 0.25, g.fall * 0.4, 1.3);
    return;
  }
  if (d.t < (g.limp ? 3 : 7)) return;
  // Over he goes, about his feet (at the knees first, if he's gone limp), faster as he goes
  if (g.limp) g.sy = Math.max(0.74, g.sy - 0.035);
  g.om += 0.003 + 0.022 * Math.sin(Math.min(1.5, Math.abs(g.th)));
  g.th += g.fall * g.om;
  const len = d.h * g.sy;
  const tx = fx + Math.sin(g.th) * len, ty = fy - Math.cos(g.th) * len;
  // What his head comes down on: a wall in the way, or the floor
  const wall = state.blocks.find(bk => bk.type !== 'pit' && bk.type !== 'door' && !bk.oneWay && tx > bk.x && tx < bk.x + bk.w && ty > bk.y && ty < bk.y + bk.h && bk.y < fy - 4);
  if (wall || Math.abs(g.th) >= 1.32 || ty >= d.floorY - 4) {
    const k = wall ? 0.8 : 0.55;
    burst(state, d, g, fx + Math.sin(g.th) * len * k, Math.min(d.floorY - 6, fy - Math.cos(g.th) * len * k), g.fall * 0.5, 1.35);
  }
};

const BIRD_FLIP = 6;

const bird = (state: GameState, d: EnemyDeath, g: GunDeath) => {
  const kind = d.sprite?.kind, facing = d.sprite?.facing ?? 1;
  g.k++;
  const cx = () => d.x + d.w / 2;
  // Stuck in the ground (the hawk): legs going a while, then it goes
  if (g.step === 1) {
    g.ox = g.k % 6 < 3 ? 1 : -1;
    if (g.k >= 30) burst(state, d, g, cx(), d.floorY - 4, 0, 0.9);
    return;
  }
  if (kind === 'hawk') g.rot = facing * (Math.PI / 2) * Math.min(1, g.k / 8);
  else g.sy = Math.cos(Math.PI * Math.min(1, g.k / BIRD_FLIP));
  if (kind === 'vulture') { d.x += Math.sin(g.k * 0.38) * 3.2; g.rot += 0.22 * facing; }
  if (kind === 'pigeon' && g.k % 3 === 0 && d.vy > 1) push(state, { pos: { x: cx() - facing * d.w * 0.35, y: d.y + d.h * 0.5 }, vel: { x: rnd(-0.4, 0.4), y: d.vy * 0.5 }, life: 200, color: g.k % 2 ? '#F8FAFC' : '#D6D3D1', size: rnd(2, 3), grav: 0.5, chunk: true });
  const bottom = kind === 'hawk' ? d.h / 2 + d.w * 0.45 * Math.min(1, g.k / 8) : d.h;
  if (!drop(state, d, g, G * 1.15, 18, bottom)) return;
  const hit = d.vy, fy = d.floorY;
  if (kind === 'grackle' && g.bounces < 2 && hit > 3) {
    d.vy = -Math.max(6.5, hit * 0.6) / (g.bounces + 1); d.vx += rnd(-1.5, 1.5); g.bounces++;
    nick(state, cx(), fy - 4, 0, 5); playSound('boing', 0.5);
    return;
  }
  if (kind === 'hawk') { g.step = 1; g.k = 0; nick(state, cx(), fy - 2, 0, 8); dust(state, cx(), fy, 6, 6); playSound('thud', 0.6); return; }
  burst(state, d, g, cx(), fy - 5, 0, kind === 'pelican' || kind === 'vulture' || kind === 'eagle' ? 1 : 0.8);
  if (kind === 'eagle') { addProp(g, 'feather', cx(), fy - 20, rnd(-0.5, 0.5), -3); addProp(g, 'feather', cx() + 6, fy - 26, rnd(-0.5, 0.5), -4.5); }
  if (kind === 'pelican') addProp(g, 'fish', cx(), fy - 10, rnd(-2, 2), -6, 0.3);
  if (kind === 'seagull') for (let i = 0; i < 4; i++) addProp(g, 'fry', cx(), fy - 8, rnd(-3.5, 3.5), rnd(-8, -4), rnd(-0.5, 0.5));
  if (kind === 'pigeon') for (let i = 0; i < 6; i++) push(state, { pos: { x: cx(), y: fy - 6 }, vel: { x: rnd(-4, 4), y: rnd(-5, -1) }, life: 200, color: '#F8FAFC', size: rnd(2, 4), grav: 0.5, chunk: true });
};

/** (animals) Swelling up: 0..1 of the way to `max` times its size, with a wobble that gets worse; kept sat on the ground. */
const bloat = (d: EnemyDeath, g: GunDeath, u: number, max: number, flip = -1, grounded = true) => {
  const s = 1 + (max - 1) * u * u + Math.sin(d.t * 0.9) * 0.035 * u;
  g.sx = s; g.sy = flip * s * (1 + Math.sin(d.t * 0.9 + 1.5) * 0.03 * u);
  if (grounded) g.oy = -d.h * (s - 1) / 2;
};

const beast = (state: GameState, d: EnemyDeath, g: GunDeath) => {
  const kind = g.mode, cx = d.x + d.w / 2;
  // (coming down first, if it was up off the ground: the coyote does its own)
  if (g.air && kind !== 'coyote') {
    if (kind === 'mutantfish' || kind === 'gator') g.sy = Math.max(-1, g.sy - 0.25);
    if (!drop(state, d, g)) return;
    g.air = false;
    dust(state, cx, d.floorY, 4, d.w * 0.3);
  }
  g.k++;
  const k = g.k;
  switch (kind) {
    case 'goat': {
      // Faints: locks up, trembling; keels over legs up (a hop as it goes); lies there stiff; bursts
      if (k < 14) g.ox = k % 4 < 2 ? 1 : -1;
      else if (k <= 22) { const u = (k - 14) / 8; g.ox = 0; g.sy = Math.cos(Math.PI * u); g.oy = -Math.sin(Math.PI * u) * 10; if (k === 22) { playSound('thud', 0.6); dust(state, cx, d.floorY, 5, d.w * 0.4); } }
      else { g.sy = -1; g.oy = k < 26 ? -2 : 0; if (k > 34 && k % 8 < 2) g.ox = k % 2 ? 1 : 0; }
      if (k >= 52) burst(state, d, g, cx, d.floorY - 8, 0, 1.1);
      break;
    }
    case 'coyote': {
      // Up; hangs there, legs going, a bead of sweat; then down like a stone
      g.anim += 1;
      if (g.step === 0) { d.vy += G * 0.55; d.y += d.vy; if (d.vy >= 0) { d.vy = 0; g.step = 1; g.k = 0; } }
      else if (g.step === 1) {
        if (k === 12) { const h = headAt(d); push(state, { pos: { x: h.x - (d.sprite?.facing ?? 1) * 4, y: h.y - h.r }, vel: { x: -(d.sprite?.facing ?? 1) * 0.6, y: -1.2 }, life: 40, color: '#93C5FD', size: 2.5, grav: 0.12, chunk: true }); }
        g.ox = k > 22 && k % 4 < 2 ? 1 : 0;
        if (k >= 32) { g.step = 2; g.run = 0; g.ox = 0; }
      } else if (drop(state, d, g, G * 1.6, 22)) {
        dust(state, cx, d.floorY, 10, d.w * 0.5);
        burst(state, d, g, cx, d.floorY - 8, 0, 1.15);
      }
      break;
    }
    case 'pitbull': {
      // "Bang, play dead": knocked back off his feet with a hop, over onto his back; legs paddling the air like he's
      // dreaming, slower and slower; a last kick, stiff; bursts
      const back = -(d.sprite?.facing ?? 1);
      if (k <= 12) { const u = k / 12; g.ox = back * Math.round(u * 6); const c = Math.cos(Math.PI * u); g.sy = (c < 0 ? -1 : 1) * Math.max(0.25, Math.abs(c)); g.oy = -Math.sin(Math.PI * u) * 12; g.run = 0; }
      if (k === 12) { playSound('thud', 0.5); dust(state, cx, d.floorY, 5, d.w * 0.4); }
      if (k > 12) { g.sy = -1; g.oy = 0; }
      if (k > 12 && k < 44) { g.run = Math.max(0.5, 4 - (k - 12) / 8); g.anim += g.run * 0.5; }
      else if (k >= 44) { g.run = 0; if (k === 46) g.oy = -2; }
      if (k >= 58) burst(state, d, g, cx, d.floorY - 8, 0, 1.2);
      break;
    }
    case 'longhorn': {
      // Sways, slow and grand; over on his back, the ground shaking; swells up; bursts (the horns flying off)
      if (k < 40) { g.pf = true; g.rot = Math.sin(k * 0.2) * 0.09 * Math.min(1, k / 18); }
      else if (k <= 54) { g.pf = false; g.rot *= 0.8; const u = (k - 40) / 14; g.sy = Math.cos(Math.PI * u); g.oy = -Math.sin(Math.PI * u) * 14; }
      if (k === 54) { g.rot = 0; g.oy = 0; shakeScreen(state, 12); playSound('thud'); dust(state, cx, d.floorY, 14, d.w * 0.5); }
      if (k > 54) bloat(d, g, Math.min(1, (k - 54) / 36), 1.3);
      if (k >= 92) {
        burst(state, d, g, cx, d.floorY - d.h * 0.5, 0, 2.4);
        const h = headAt(d);
        for (const s of [-1, 1]) addProp(g, 'horn', h.x + s * 8, d.floorY - d.h * 0.6, s * rnd(2, 4), rnd(-12, -9), s * rnd(0.25, 0.4));
      }
      break;
    }
    case 'gator': {
      // The death roll: over and over, slowing, ending belly up; legs twitching; bursts
      if (k <= 36) { const u = k / 36; g.sy = Math.cos(Math.PI * 3 * (1 - (1 - u) * (1 - u))); g.oy = -Math.abs(Math.sin(Math.PI * 3 * u)) * 3; if (k % 6 === 0) nick(state, cx, d.floorY - 6, k % 12 ? 1 : -1, 2); }
      else { g.sy = -1; g.oy = 0; g.ox = k % 6 < 2 ? 1 : 0; }
      if (k >= 62) burst(state, d, g, cx, d.floorY - 8, 0, 1.4);
      break;
    }
    case 'shark': {
      // Belly up; drifting up and off, slowing; swelling; pops (and out falls what it ate)
      g.sy = k <= 10 ? Math.cos(Math.PI * k / 10) : g.sy;
      d.x += d.vx; d.vx *= 0.94;
      d.y -= 0.6 * Math.min(1, k / 20);
      if (k > 10) bloat(d, g, Math.min(1, (k - 10) / 50), 1.42, -1, false);
      if (k >= 62) {
        burst(state, d, g, cx, d.y + d.h / 2, 0, 1.7);
        addProp(g, 'plate', cx, d.y + d.h / 2, rnd(-2, 2), -5, rnd(-0.35, 0.35));
      }
      break;
    }
    case 'mutantfish': {
      // Belly up; swells, fizzing green; pops, green and red
      g.sy = k <= 8 && g.sy > -1 ? Math.min(g.sy, Math.cos(Math.PI * k / 8)) : -1;
      if (k > 8) bloat(d, g, Math.min(1, (k - 8) / 42), 1.38);
      if (k > 8) g.ox = k > 30 && k % 4 < 2 ? 1 : 0;
      if (k > 8 && k % 3 === 0) push(state, { pos: { x: cx + rnd(-d.w * 0.4, d.w * 0.4), y: d.y + d.h * 0.4 + g.oy }, vel: { x: rnd(-0.5, 0.5), y: rnd(-1.6, -0.6) }, life: 22, color: k % 2 ? '#A3E635' : '#D9F99D', size: rnd(2, 3.5) });
      if (k >= 52) burst(state, d, g, cx, d.floorY - 8, 0, 1.1, ['#65A30D', '#A3E635', '#4D7C0F']);
      break;
    }
  }
};

// ---------------------------------------------------------------------------
// Tommy's bike run: a lowrider done for, its crew thrown out
// ---------------------------------------------------------------------------

const ejected = new WeakSet<Enemy>();

/** The shirts the crew wear (as the car's drawn: see drawLowrider). */
const CREW_SHIRTS = ['#DC2626', '#1D4ED8', '#F8FAFC'];
export const crewShirt = (e: { homeX?: number }) => CREW_SHIRTS[Math.abs(Math.round((e.homeX || 0) / 7)) % CREW_SHIRTS.length];

/** A lowrider's gone (however it went): the two in its windows go up out of them, tumbling, to splat on the road. Once. */
export const ejectLowriderCrew = (state: GameState, e: Enemy) => {
  if (ejected.has(e)) return;
  ejected.add(e);
  const facing = e.facing === -1 ? -1 : 1, cx = e.pos.x + e.width / 2, feet = e.pos.y + e.height;
  for (const w of LOWRIDER_WINDOWS) {
    const W = 24, H = 46;
    const x = cx + w.x * facing - W / 2, y = feet + w.y - H + 14;
    state.enemyDeaths.push({
      kind: 'ejected', x, y, w: W, h: H, color: crewShirt(e), t: 0,
      vx: e.vel.x * 0.6 + rnd(-4, 4), vy: rnd(-13, -9), rot: 0, floorY: feet, landed: false, isShield: false,
      crew: { shirt: crewShirt(e), facing: (Math.random() < 0.5 ? 1 : -1), spin: rnd(0.18, 0.32) * (Math.random() < 0.5 ? 1 : -1) },
    });
  }
};

/** (a thrown crewman) Tumbling up and over, and the splat where he comes down; then he's a pancake on the road. */
export const updateEjected = (state: GameState, d: EnemyDeath): boolean => {
  d.t++;
  const from = d.y + d.h / 2 + 12;
  d.vy = Math.min(18, d.vy + G); d.x += d.vx; d.y += d.vy; d.vx *= 0.995;
  d.rot += d.crew!.spin;
  if (d.vy > 0) {
    const f = floorTopAt(state.blocks, d.x + d.w / 2, from, 4);
    if (f !== null && d.y + d.h / 2 + 12 >= f) {
      // Flat on the road where he's come down (the way any body coming down is: see splatBody)
      const hit = d.vy;
      d.kind = 'pancaked'; d.t = 0; d.rot = 0; d.vx = 0; d.vy = 0;
      d.y = f - d.h; d.floorY = f; d.landed = true;
      gibs(state, d.x + d.w / 2, f - 6, 0, 1.4);
      shakeScreen(state, hit > 12 ? 8 : 4);
      playSound('crunch', 0.7);
      return true;
    }
    if (f === null && d.y > state.camera.y + 1500) return false;
  }
  return d.t < 400;
};
