// THE OTHERWORLDLY SPAWNER (Space Land): a gun that gives birth. How is nobody's business (it's beyond human
// comprehension, and better off there). Every shot squirts out a litter of tiny wet aliens, and they're off: running
// down whoever's nearest (spreading themselves round, not all on the one; nobody about, scurrying all over looking), leaping like fleas, far higher than he can
// jump, to drag a bird out of the air, and once they're on somebody, latched on and gnawing. One of them's nothing (a
// nibble at a time); it's the stacking. They don't live long: when one's time's up it pops, wherever it is, mid-chew or
// not, bursting into a little puddle of green blood. However many he fires, they're all there: none's ever cleared
// off to make room. When whoever they're on dies, they let go and go looking for the next.
// Gnawed to death is a death of its own, for everybody: the flesh eaten off him bite by bite down to a bloody skeleton,
// left standing (or lying, or dropped out of the sky) a while, and then it crumbles: the bones come apart and fall in a
// heap.

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { isHumanoidKind } from '../../m1/game/render/enemies';
import { CANVAS_WIDTH } from '../../m1/constants';
import { drawEnemyAt, grabHolding } from '../moves/grab';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** A shot: this many born at once; the wait between shots. */
const LITTER = 3, COOLDOWN = 20;
/** How long one lives (frames, give or take); the last stretch of it, it's sputtering out. */
const LIFE = 480, LIFE_VARY = 120, DYING = 60;
/** On foot: how fast, how hard it falls, its biggest leap (that's about 360 up), how near it'll leap from. */
const RUN = 3.3, GRAVITY = 0.5, LEAP = 19, LEAP_RANGE = 190;
/** One bite: this much, every so many frames. */
const BITE = { dmg: 1, every: 9 };
/** A gnawed corpse: the flesh comes off over this long; then the skeleton stands this long, then crumbles. */
const EAT = 54, STAND = 110, TEETER = 22;
/** Bones lying in a heap: this long, then fading this long. */
const LIE = 300, FADE = 60;

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
const flies = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';

/** What one looks like: their skin (light, mid, dark, outline). No two litters quite alike; they've one, two or three eyes. */
const SKINS = [
  { hi: '#D9F99D', mid: '#84CC16', lo: '#4D7C0F', line: '#1A2E05' },
  { hi: '#A5F3FC', mid: '#22D3EE', lo: '#0E7490', line: '#082F49' },
  { hi: '#F5D0FE', mid: '#D946EF', lo: '#86198F', line: '#2E0A33' },
  { hi: '#BBF7D0', mid: '#4ADE80', lo: '#15803D', line: '#052E16' },
];

interface Alien {
  x: number; y: number; vx: number; vy: number; ground: boolean; face: 1 | -1;
  life: number; max: number; skin: number; eyes: 1 | 2 | 3; seed: number;
  target: Enemy | null; retarget: number; leapWait: number;
  /** Latched on: to him (alive), or to what's left of him (a corpse), where on him (fractions of him). */
  on: { e: Enemy; ox: number; oy: number; corpse: Corpse | null } | null;
  bite: number; chomp: number;
  /** Nobody to go for: where it's scurrying to, looking. */
  roamTo: number | null;
}

/** One bone, in the skeleton's own space (its feet the origin, facing right). */
interface Bone { kind: 'long' | 'vert' | 'rib' | 'hrib' | 'pelvis' | 'skull' | 'snout' | 'beak'; x: number; y: number; a: number; l: number; s: number; flip: 1 | -1; blood: number }
/** ...and come loose: in the world, falling. */
interface Piece { b: Bone; x: number; y: number; a: number; vx: number; vy: number; va: number; face: 1 | -1; t: number; still: boolean }

interface Corpse {
  e: Enemy; x: number; y: number; vy: number; t: number; face: 1 | -1; bones: Bone[];
  /** His flesh, as he was drawn the moment he died, eaten away bite by bite; where his feet are in it. */
  flesh: HTMLCanvasElement | null; fx: number; fy: number;
  landedAt: number;
}

let aliens: Alien[] = [];
let corpses: Corpse[] = [];
let pieces: Piece[] = [];
/** The gun's sac, squeezing a litter out (frames left). */
let birthing = 0;
/** Where they burst: a little puddle of green blood each. */
let puddles: { x: number; y: number; w: number; t: number }[] = [];
const GREEN_BLOOD = ['#65A30D', '#84CC16', '#3F6212'];
const PUDDLE = 420;

// ---------------------------------------------------------------------------------------------------------------
// The ground under their feet

const solid = (b: GameState['blocks'][number]) => b.type !== 'pit' && b.type !== 'door';
const wallAt = (state: GameState, x: number, y: number, w: number, h: number) =>
  state.blocks.some(b => solid(b) && !b.oneWay && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
/** The top of whatever's under x at or below y (a platform, from above, counts). */
const floorBelow = (state: GameState, x: number, y: number) => {
  let best = groundLineAt(state.groundRuns, x);
  if (!(best >= y - 0.5)) best = Infinity;
  for (const b of state.blocks) if (solid(b) && x >= b.x && x <= b.x + b.w && b.y >= y - 0.5 && b.y < best) best = b.y;
  return best;
};

// ---------------------------------------------------------------------------------------------------------------
// Firing: a litter

const fire = (ctx: FrameContext, input: { moveUp: boolean }, muzzle: { x: number; y: number }) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const dir = pl.facing as 1 | -1;
  const skin = Math.floor(Math.random() * SKINS.length);
  for (let i = 0; i < LITTER; i++) {
    const max = LIFE + Math.floor((Math.random() - 0.5) * LIFE_VARY);
    aliens.push({
      x: muzzle.x, y: muzzle.y + 4, vx: dir * (7 + Math.random() * 5) + pl.vel.x * 0.5, vy: input.moveUp ? -11 - Math.random() * 3 : -3 - Math.random() * 4,
      ground: false, face: dir, life: max, max, skin: Math.random() < 0.8 ? skin : Math.floor(Math.random() * SKINS.length),
      eyes: (1 + Math.floor(Math.random() * 3)) as 1 | 2 | 3, seed: Math.random(), target: null, retarget: 0, leapWait: 0, on: null, bite: 0, chomp: 0, roamTo: null,
    });
  }
  // (born wet: slime off the end of it)
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: muzzle.x, y: muzzle.y }, vel: { x: dir * (1 + Math.random() * 3), y: -1 + Math.random() * 2 }, life: 18, color: i % 2 ? '#BEF264' : '#F0ABFC', size: 2 + Math.random() * 2, grav: 0.25 });
  birthing = 12;
  pl.shootCooldown = COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SPAWNER--;
  playSound('spawn'); playSound('chitter', 0.6, 4);
};

/** One's time is up (or it's one too many): it bursts, a splash of goo. */
const pop = (state: GameState, a: Alien) => {
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: a.x, y: a.y - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: GREEN_BLOOD[i % 3], size: 1.5 + Math.random() * 2, grav: 0.3 });
  // (and a little puddle of it, on whatever's under where it went)
  const y = floorBelow(state, a.x, a.y - 2);
  if (y < a.y + 400) puddles.push({ x: a.x, y, w: 7 + Math.random() * 5, t: 0 });
  playSound('splat', 0.25, 9); playSound('chitter', 0.3, 10);
};

// ---------------------------------------------------------------------------------------------------------------
// Who they go for

/** Anybody in view worth eating: never somebody Meathead's got hold of. */
const edible = (state: GameState, e: Enemy) =>
  alive(e) && e.seen !== false && e !== grabHolding() && e.pos.x + e.width > state.camera.x - 80 && e.pos.x < state.camera.x + CANVAS_WIDTH + 80;

/** The nearest, more or less: one that's crowded already counts as further off, so they spread round. */
const pickTarget = (state: GameState, a: Alien) => {
  const crowd = new Map<Enemy, number>();
  for (const o of aliens) { const t = o.on?.corpse ? null : o.on?.e ?? o.target; if (t) crowd.set(t, (crowd.get(t) ?? 0) + 1); }
  let best: Enemy | null = null, score = Infinity;
  for (const e of state.enemies) {
    if (!edible(state, e)) continue;
    const dx = e.pos.x + e.width / 2 - a.x, dy = e.pos.y + e.height / 2 - a.y;
    if (Math.abs(dx) > 700) continue;
    const s = Math.abs(dx) + Math.max(0, -dy - 300) * 2 + (crowd.get(e) ?? 0) * 55;
    if (s < score) { score = s; best = e; }
  }
  return best;
};

const touching = (a: Alien, e: Enemy) => a.x + 5 > e.pos.x && a.x - 5 < e.pos.x + e.width && a.y > e.pos.y && a.y - 9 < e.pos.y + e.height;

const latch = (a: Alien, e: Enemy) => {
  // (wherever on him: they're all over him, not piled up on the side they came at)
  a.on = { e, ox: 0.12 + Math.random() * 0.76, oy: 0.15 + Math.random() * 0.75, corpse: null };
  a.face = (a.x < e.pos.x + e.width / 2 ? 1 : -1);
  a.vx = 0; a.vy = 0; a.bite = 3 + Math.floor(Math.random() * BITE.every);
  a.target = e;
  if (Math.random() < 0.3) playSound('chitter', 0.4, 2);
};

/** Off whoever it was on (dead, or eaten down to the bone): a hop off, and looking for the next. */
const letGo = (a: Alien) => { a.on = null; a.target = null; a.retarget = 0; a.ground = false; a.vy = -5 - Math.random() * 3; a.vx = (Math.random() - 0.5) * 6; };

// ---------------------------------------------------------------------------------------------------------------
// Every frame

const tick = (ctx: FrameContext) => {
  const { state } = ctx;
  if (birthing > 0) birthing--;
  const live: Alien[] = [];
  for (const a of aliens) {
    a.life--;
    if (a.life <= 0) { pop(state, a); continue; }
    if (a.on) { if (gnaw(ctx, a)) live.push(a); continue; }
    roam(ctx, a);
    // (gone down a pit, or way off out of it)
    if (a.y > state.camera.y + 1400 || Math.abs(a.x - (state.camera.x + CANVAS_WIDTH / 2)) > CANVAS_WIDTH * 2) continue;
    live.push(a);
  }
  aliens = live;
  for (const c of corpses) rot(ctx, c);
  corpses = corpses.filter(c => c.t <= EAT + STAND + 400 && !(c.t > EAT && c.bones.length === 0));
  for (const p of pieces) tumble(state, p);
  for (const p of puddles) p.t++;
  puddles = puddles.filter(p => p.t < PUDDLE);
  pieces = pieces.filter(p => p.t < LIE + FADE);
};

/** Latched on: hanging on where it bit in, chewing. False when it's done for. */
const gnaw = (ctx: FrameContext, a: Alien) => {
  const { state } = ctx;
  const on = a.on!, e = on.e;
  // On what's left of him: it eats on till he's down to the bone, then goes
  if (on.corpse) {
    const c = on.corpse;
    a.x = c.x - c.e.width / 2 + on.ox * c.e.width; a.y = c.y - c.e.height + on.oy * c.e.height;
    a.chomp++;
    if (c.t >= EAT - 4) letGo(a);
    return true;
  }
  if (!alive(e) || !state.enemies.includes(e) || e === grabHolding()) { letGo(a); return true; }
  a.x = e.pos.x + on.ox * e.width; a.y = e.pos.y + on.oy * e.height + 4;
  a.chomp++;
  if (--a.bite > 0) return true;
  a.bite = BITE.every + Math.floor(Math.random() * 3);
  e.health -= BITE.dmg;
  // (a squirt of him)
  if (Math.random() < 0.5) state.particles.push({ pos: { x: a.x + a.face * 4, y: a.y - 6 }, vel: { x: -a.face * (0.5 + Math.random() * 2), y: -1 - Math.random() * 2 }, life: 16, color: Math.random() < 0.5 ? '#B91C1C' : '#7F1D1D', size: 1.5 + Math.random() * 2, grav: 0.3 });
  if (Math.random() < 0.25) playSound('gnaw', 0.5);
  if (e.health <= 0 && !isMidBoss(e)) eatenAlive(ctx, e);
  return true;
};

/** Loose: after somebody, leaping for what's up high; nobody about, scurrying round looking. */
const roam = (ctx: FrameContext, a: Alien) => {
  const { state } = ctx;
  if (a.leapWait > 0) a.leapWait--;
  if (--a.retarget <= 0 || (a.target && !edible(state, a.target))) { a.target = pickTarget(state, a); a.retarget = 20 + Math.floor(Math.random() * 10); }
  const sputter = a.life < DYING ? 0.5 : 1;
  const t = a.target;
  if (a.ground) {
    let goal: number; const speed = RUN * (0.85 + a.seed * 0.3) * sputter;
    if (t) {
      const tx = t.pos.x + t.width / 2, ty = t.pos.y + t.height / 2, dx = tx - a.x, rise = a.y - ty;
      goal = tx;
      // Up high (a bird, somebody up on a ledge), near enough under him: a flea's leap, right at him
      if (rise > 34 && Math.abs(dx) < LEAP_RANGE && a.leapWait <= 0) {
        const vy = -Math.min(LEAP, Math.sqrt(2 * GRAVITY * (rise + 14)));
        const T = -vy / GRAVITY;
        a.vy = vy * (sputter < 1 ? 0.7 : 1); a.vx = Math.max(-8, Math.min(8, (dx + (t.vel?.x ?? 0) * T) / T)); a.ground = false; a.leapWait = 30;
        if (Math.random() < 0.4) playSound('chitter', 0.35, 6);
      } else if (Math.abs(dx) < 46 && rise > -10 && a.leapWait <= 0) {
        // (on the ground with him: a pounce)
        a.vy = -5 - Math.random() * 2; a.vx = Math.sign(dx) * 4; a.ground = false; a.leapWait = 16;
      }
    } else {
      // Nobody (yet): scurrying all over, looking, each its own way, a new spot whenever it gets where it was going
      // (never far off the screen), hopping now and then
      const lo = state.camera.x + 20, hi = state.camera.x + CANVAS_WIDTH - 20;
      if (a.roamTo === null || Math.abs(a.roamTo - a.x) < 12 || a.roamTo < lo - 200 || a.roamTo > hi + 200) a.roamTo = lo + Math.random() * (hi - lo);
      goal = a.roamTo;
      if (Math.random() < 0.015) { a.vy = -4 - Math.random() * 4; a.ground = false; }
    }
    if (a.ground) {
      const want = Math.sign(goal - a.x) * (Math.abs(goal - a.x) < 4 ? 0 : speed);
      a.vx += (want - a.vx) * 0.35;
      if (Math.abs(a.vx) > 0.3) a.face = (a.vx > 0 ? 1 : -1);
    }
  } else a.vy += GRAVITY;
  // Across (a wall: up it goes over it, if it's on its feet)
  const nx = a.x + a.vx;
  if (wallAt(state, nx - 5, a.y - 9, 10, 8)) {
    a.vx = 0;
    if (a.ground) { a.vy = -11; a.ground = false; }
  } else a.x = nx;
  // Down (or up into a ceiling)
  const ny = a.y + a.vy;
  if (a.vy < 0 && wallAt(state, a.x - 5, ny - 9, 10, 2)) a.vy = 0;
  else {
    const floor = floorBelow(state, a.x, a.y - 2);
    if (a.vy >= 0 && ny >= floor) { a.y = floor; a.vy = 0; a.ground = true; }
    else { a.y = ny; a.ground = a.vy === 0 && a.y >= floor - 0.5; if (!a.ground && a.vy === 0) a.vy = 0.1; }
  }
  // Anybody it runs (or leaps) into, it's on
  for (const e of state.enemies) if (edible(state, e) && touching(a, e)) { latch(a, e); break; }
};

// ---------------------------------------------------------------------------------------------------------------
// Eaten alive: a death of its own

const eatenAlive = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  e.health = 0;
  state.enemies = state.enemies.filter(o => o !== e);
  e.isBlownAway = true;
  const face = (isHumanoidKind(e.kind) ? (state.player.pos.x + state.player.width / 2 > e.pos.x + e.width / 2 ? 1 : -1) : (e.facing ?? 1)) as 1 | -1;
  const c: Corpse = { e, x: e.pos.x + e.width / 2, y: e.pos.y + e.height, vy: 0, t: 0, face, bones: skeleton(e), flesh: null, fx: 0, fy: 0, landedAt: -1 };
  // (him as he was: drawn off to the side, to be eaten away)
  try {
    const W = Math.ceil(e.width * 2.6 + 60), H = Math.ceil(e.height * 1.8 + 40);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    if (g) { g.imageSmoothingEnabled = false; c.fx = W / 2; c.fy = H - 14; drawEnemyAt(g, e, state, c.fx, c.fy, 0, face); c.flesh = cv; }
  } catch { c.flesh = null; }
  corpses.push(c);
  // (whoever was on him stays on what's left, till it's bone)
  for (const a of aliens) if (a.on && a.on.e === e && !a.on.corpse) a.on.corpse = c;
  fx.spawnPickup(e.pos);
  fx.speakVulgarity(m2Kill('alien_kill'));
  fx.spawnKillCallout(e, grabCallout('alien'));
  state.player.killSatisfactionTimer = 60;
  playSound('gnaw', 1, -4); playSound('splat', 0.6, -2);
};

/** A corpse, going: eaten down to the bone, the skeleton standing, then falling to bits. */
const rot = (ctx: FrameContext, c: Corpse) => {
  const { state } = ctx;
  c.t++;
  // (dropping, if he died up in the air; he lands, whatever's left of him)
  const floor = floorBelow(state, c.x, c.y - 2);
  if (c.y < floor - 0.5) { c.vy += 0.5; c.y = Math.min(floor, c.y + c.vy); if (c.y >= floor) { c.vy = 0; c.landedAt = c.t; playSound('thud', 0.5); } }
  else if (c.landedAt < 0) c.landedAt = c.t;
  const e = c.e;
  // The flesh, bitten away (bites go in where they're chewing, and all over)
  if (c.t <= EAT && c.flesh) {
    const g = c.flesh.getContext('2d')!;
    const r = Math.max(3, Math.min(9, Math.min(e.width, e.height) * 0.15));
    const n = Math.ceil(((e.width * 1.6) * (e.height * 1.3)) / (Math.PI * r * r) / EAT * 3);
    const chewers = aliens.filter(a => a.on?.corpse === c);
    for (let i = 0; i < n; i++) {
      let bx = c.fx + (Math.random() - 0.5) * e.width * 1.6, by = c.fy - Math.random() * e.height * 1.25;
      if (chewers.length && Math.random() < 0.4) { const a = chewers[Math.floor(Math.random() * chewers.length)]; bx = c.fx + (a.x - c.x) + (Math.random() - 0.5) * r * 2; by = c.fy + (a.y - c.y) - 4 + (Math.random() - 0.5) * r * 2; }
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = Math.random() < 0.5 ? '#7F1D1D' : '#991B1B';
      g.beginPath(); g.arc(bx, by, r + 2.5, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill();
      if (Math.random() < 0.15) state.particles.push({ pos: { x: c.x + (bx - c.fx), y: c.y + (by - c.fy) }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 20, color: '#991B1B', size: 2 + Math.random() * 2, grav: 0.3 });
    }
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(127, 29, 29, 0.05)'; g.fillRect(0, 0, c.flesh.width, c.flesh.height);
    g.globalCompositeOperation = 'source-over';
    if (state.frame % 5 === 0) playSound('gnaw', 0.6);
  }
  if (c.t === EAT) c.flesh = null;
  // The skeleton: dripping
  if (c.t > EAT && c.bones.length && state.frame % 5 === 0) {
    const b = c.bones[Math.floor(Math.random() * c.bones.length)];
    state.particles.push({ pos: { x: c.x + c.face * b.x, y: c.y + b.y }, vel: { x: 0, y: 0.5 }, life: 26, color: '#991B1B', size: 2, grav: 0.25 });
  }
  // ...and down it comes, in bits (once it's on the floor and has stood there a while)
  const down = c.landedAt >= 0 && c.t >= Math.max(EAT + STAND, c.landedAt + 40);
  if (down && c.bones.length) crumble(state, c);
};

/** Down it goes: every bone loose, falling in a heap (the long ones snapping, sometimes), a puff of bone dust. */
const crumble = (state: GameState, c: Corpse) => {
  for (const b of c.bones) {
    const x = c.x + c.face * b.x;
    const bits = b.kind === 'long' && b.l > 14 && Math.random() < 0.35
      ? [{ ...b, l: b.l / 2, x: b.x - Math.cos(b.a) * b.l / 4, y: b.y - Math.sin(b.a) * b.l / 4 }, { ...b, l: b.l / 2, x: b.x + Math.cos(b.a) * b.l / 4, y: b.y + Math.sin(b.a) * b.l / 4 }]
      : [b];
    for (const k of bits) {
      const skull = k.kind === 'skull' || k.kind === 'snout' || k.kind === 'beak';
      pieces.push({ b: { ...k, x: 0, y: 0 }, x: c.x + c.face * k.x, y: c.y + k.y, a: c.face * k.a, vx: (x - c.x) * 0.03 + (Math.random() - 0.5) * 2, vy: skull ? -3 - Math.random() * 2 : -Math.random() * 2, va: (Math.random() - 0.5) * 0.3, face: c.face, t: 0, still: false });
    }
  }
  c.bones = [];
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: c.x + (Math.random() - 0.5) * c.e.width, y: c.y - Math.random() * c.e.height }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 30, color: i % 2 ? 'rgba(231, 229, 228, 0.6)' : 'rgba(168, 162, 158, 0.5)', size: 4 + Math.random() * 4 });
  playSound('crumble');
};

/** A loose bone: falling, bouncing a little, rolling flat, lying there. */
const tumble = (state: GameState, p: Piece) => {
  p.t++;
  if (p.still) return;
  const reach = p.b.kind === 'long' ? p.b.s * 0.9 + Math.abs(Math.sin(p.a)) * p.b.l * 0.5 : p.b.kind === 'rib' || p.b.kind === 'hrib' ? p.b.l * 0.4 : p.b.l * 0.6 + 1;
  p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.a += p.va;
  const floor = floorBelow(state, p.x, p.y - 10);
  if (p.y + reach >= floor) {
    p.y = floor - reach;
    if (p.vy > 2.5) { p.vy = -p.vy * 0.3; p.va *= 0.6; if (Math.random() < 0.3) playSound('crumble', 0.25, 8); }
    else p.vy = 0;
    p.vx *= 0.7;
    // (rolling over to lie flat)
    const flat = Math.round(p.a / Math.PI) * Math.PI;
    if (p.b.kind === 'long' || p.b.kind === 'vert') p.a += (flat - p.a) * 0.25;
    p.va *= 0.5;
    if (p.vy === 0 && Math.abs(p.vx) < 0.15 && Math.abs(p.va) < 0.01) p.still = true;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The skeletons: one for a man, one for a four-legged animal, one for a bird (anything that flies: drones too)

const skeleton = (e: Enemy): Bone[] => {
  const w = e.width, h = e.height;
  const s = Math.max(1.6, Math.min(4.5, h * 0.05));
  const out: Bone[] = [];
  const blood = () => (Math.random() < 0.7 ? Math.random() : 0);
  const long = (x0: number, y0: number, x1: number, y1: number, ss = s) => out.push({ kind: 'long', x: (x0 + x1) / 2, y: (y0 + y1) / 2, a: Math.atan2(y1 - y0, x1 - x0), l: Math.hypot(x1 - x0, y1 - y0), s: ss, flip: 1, blood: blood() });
  const bone = (kind: Bone['kind'], x: number, y: number, l: number, a = 0, flip: 1 | -1 = 1, ss = s) => out.push({ kind, x, y, a, l, s: ss, flip, blood: blood() });
  if (flies(e) && !isHumanoidKind(e.kind)) {
    // A bird: wings up, the beak, a little ribcage, two thin legs
    const sy = -h * 0.5;
    for (let i = 0; i < 5; i++) bone('vert', -w * 0.24 + i * w * 0.1, sy, 0, 0, 1, s * 0.7);
    for (let i = 0; i < 3; i++) bone('hrib', -w * 0.08 + i * w * 0.07, sy, h * 0.28, 0, 1, s * 0.7);
    bone('beak', w * 0.3, -h * 0.6, Math.max(3.5, Math.min(7, h * 0.18)));
    for (const [k, far] of [[1, false], [0.8, true]] as const) {
      const root = { x: far ? w * 0.04 : -w * 0.02, y: sy - 2 }, elbow = { x: -w * 0.12 * k, y: -h * (far ? 0.95 : 1.05) }, tip = { x: -w * 0.42 * k, y: -h * (far ? 1.05 : 1.2) };
      long(root.x, root.y, elbow.x, elbow.y, s * 0.8); long(elbow.x, elbow.y, tip.x, tip.y, s * 0.6);
      for (let f = 0; f < 3; f++) long(tip.x, tip.y, tip.x - w * 0.08 - f * 2, tip.y + 3 + f * 4, s * 0.4);
    }
    for (const dx of [-2, 2]) { long(dx, -h * 0.4, dx + w * 0.03, -h * 0.16, s * 0.5); long(dx + w * 0.03, -h * 0.16, dx + w * 0.03, -1, s * 0.5); }
    for (let f = 0; f < 3; f++) long(-w * 0.28, sy, -w * 0.42, sy - 4 + f * 4, s * 0.5);
  } else if (!isHumanoidKind(e.kind) && w > h * 1.1) {
    // Four legs: the spine along the top, the skull out front, ribs hanging, a tail
    const sy = -h * 0.64;
    for (let i = 0; i < 7; i++) bone('vert', -w * 0.36 + i * w * 0.095, sy, 0);
    bone('snout', w * 0.33, -h * 0.7, Math.max(4, Math.min(11, h * 0.16)));
    for (let i = 0; i < 4; i++) bone('hrib', -w * 0.08 + i * w * 0.075, sy + 1, h * 0.3);
    bone('pelvis', -w * 0.3, sy + 2, Math.max(4, h * 0.14));
    for (const [lx, far] of [[w * 0.2, 0], [w * 0.16, 1], [-w * 0.28, 0], [-w * 0.32, 1]] as const) {
      const ss = far ? s * 0.8 : s;
      long(lx, sy + 2, lx + 3, -h * 0.3, ss); long(lx + 3, -h * 0.3, lx, -1.5, ss);
    }
    if (w > 34) { long(-w * 0.4, sy, -w * 0.5, sy + h * 0.12, s * 0.6); long(-w * 0.5, sy + h * 0.12, -w * 0.56, sy + h * 0.3, s * 0.5); }
  } else {
    // A man: skull, spine, ribcage, pelvis, both arms hanging, both legs
    bone('skull', w * 0.04, -h * 0.87, Math.max(4.5, Math.min(12, h * 0.1)));
    for (let i = 0; i < 6; i++) bone('vert', 0, -h * (0.75 - i * 0.055), 0);
    for (let i = 0; i < 4; i++) for (const fl of [1, -1] as const) bone('rib', 0, -h * (0.72 - i * 0.045), w * (0.24 - i * 0.02), 0, fl, s * 0.75);
    bone('pelvis', 0, -h * 0.43, Math.max(4, w * 0.2));
    for (const sd of [1, -1]) {
      const sx = sd * w * 0.24;
      long(sx, -h * 0.74, sx + sd * w * 0.05, -h * 0.57); long(sx + sd * w * 0.05, -h * 0.57, sx + sd * w * 0.08, -h * 0.42);
      bone('vert', sx + sd * w * 0.08, -h * 0.39, 0, 0, 1, s * 0.9);
      const hx = sd * w * 0.12;
      long(hx, -h * 0.43, hx + sd * w * 0.02, -h * 0.22); long(hx + sd * w * 0.02, -h * 0.22, hx + sd * w * 0.02, -h * 0.03);
      long(hx + sd * w * 0.02, -s * 0.6, hx + sd * w * 0.02 + w * 0.13, -s * 0.6, s * 0.8);
    }
  }
  return out;
};

const BONE = '#EFE7D2', BONE_LO = '#C9BC9C', BLOOD = 'rgba(127, 29, 29, 0.9)', GORE = '#991B1B';

const circle = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); c.fill(); };

/** One bone, at its place (`x`, `y`, `a` in whatever space it's drawn in). */
const drawBone = (c: Ctx, b: Bone) => {
  c.save(); c.translate(b.x, b.y); c.rotate(b.a); c.scale(b.flip, 1);
  const s = b.s, l = b.l;
  switch (b.kind) {
    case 'long': {
      const h = l / 2, r = s * 0.62;
      for (const [col, g] of [[INK, 1], [BONE, 0]] as const) {
        c.fillStyle = col; c.fillRect(-h, -s / 2 - g, l, s + g * 2);
        for (const ex of [-h, h]) { circle(c, ex, -r * 0.55, r + g); circle(c, ex, r * 0.55, r + g); }
      }
      c.fillStyle = BONE_LO; c.fillRect(-h, s * 0.1, l, s * 0.4);
      if (b.blood > 0.25) { c.fillStyle = BLOOD; c.fillRect(-h + l * b.blood * 0.5, -s / 2, l * 0.35, s); }
      break;
    }
    case 'vert': {
      const z = s * 1.7;
      c.fillStyle = INK; c.fillRect(-z / 2 - 1, -z / 2 - 1, z + 2, z + 2);
      c.fillStyle = BONE; c.fillRect(-z / 2, -z / 2, z, z);
      c.fillStyle = BONE_LO; c.fillRect(-z / 2, 0, z, z / 2);
      if (b.blood > 0.4) { c.fillStyle = BLOOD; c.fillRect(-z / 2, -z / 2, z * 0.6, z); }
      break;
    }
    case 'rib': case 'hrib': {
      c.beginPath(); c.moveTo(0, 0);
      if (b.kind === 'rib') c.quadraticCurveTo(l, -l * 0.1, l * 0.85, l * 0.6);
      else c.quadraticCurveTo(l * 0.45, l * 0.45, l * 0.05, l);
      c.lineCap = 'round';
      c.strokeStyle = INK; c.lineWidth = s + 2; c.stroke();
      c.strokeStyle = BONE; c.lineWidth = s; c.stroke();
      if (b.blood > 0.3) { c.strokeStyle = BLOOD; c.lineWidth = s; c.setLineDash([l * 0.3, l]); c.stroke(); c.setLineDash([]); }
      break;
    }
    case 'pelvis': {
      for (const [col, g] of [[INK, 1], [BONE, 0]] as const) {
        c.fillStyle = col;
        c.beginPath(); c.ellipse(-l * 0.45, 0, l * 0.45 + g, l * 0.32 + g, -0.3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(l * 0.45, 0, l * 0.45 + g, l * 0.32 + g, 0.3, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = INK; circle(c, -l * 0.45, l * 0.05, l * 0.14); circle(c, l * 0.45, l * 0.05, l * 0.14);
      if (b.blood > 0.3) { c.fillStyle = BLOOD; circle(c, 0, l * 0.1, l * 0.25); }
      break;
    }
    case 'skull': {
      // (a man's, side on, looking the way he faced)
      for (const [col, g] of [[INK, 1], [BONE, 0]] as const) {
        c.fillStyle = col; circle(c, 0, 0, l + g);
        c.fillRect(-l * 0.2 - g, l * 0.4 - g, l * 1.05 + g * 2, l * 0.65 + g * 2);
      }
      c.fillStyle = BONE_LO; c.fillRect(-l * 0.2, l * 0.8, l * 1.05, l * 0.25);
      c.fillStyle = INK; circle(c, l * 0.42, -l * 0.05, l * 0.3);
      c.beginPath(); c.moveTo(l * 0.85, l * 0.15); c.lineTo(l * 0.95, l * 0.45); c.lineTo(l * 0.72, l * 0.45); c.closePath(); c.fill();
      for (let i = 0; i < 4; i++) c.fillRect(l * (0.05 + i * 0.22), l * 0.68, Math.max(0.6, l * 0.06), l * 0.2);
      if (b.blood > 0.15) { c.fillStyle = BLOOD; c.fillRect(-l * 0.6, -l * 0.5, l * 0.5, l * 0.6); c.fillRect(l * 0.3, l * 0.95, l * 0.25, l * 0.4); }
      break;
    }
    case 'snout': {
      for (const [col, g] of [[INK, 1], [BONE, 0]] as const) {
        c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, l + g, l * 0.8 + g, 0, 0, Math.PI * 2); c.fill();
        c.fillRect(l * 0.4, -l * 0.35 - g, l * 1.6 + g, l * 0.65 + g * 2);
        c.fillRect(l * 0.3, l * 0.38 - g, l * 1.5 + g, l * 0.3 + g * 2);
      }
      c.fillStyle = INK; circle(c, l * 0.35, -l * 0.2, l * 0.26);
      c.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) c.fillRect(l * (0.7 + i * 0.32), l * 0.28, Math.max(0.6, l * 0.1), l * 0.2);
      if (b.blood > 0.15) { c.fillStyle = BLOOD; c.fillRect(-l * 0.7, -l * 0.3, l * 0.6, l * 0.7); c.fillRect(l * 1.2, l * 0.4, l * 0.5, l * 0.3); }
      break;
    }
    case 'beak': {
      for (const [col, g] of [[INK, 1], [BONE, 0]] as const) {
        c.fillStyle = col; circle(c, 0, 0, l + g);
        c.beginPath(); c.moveTo(l * 0.6, -l * 0.45 - g); c.lineTo(l * 2.3 + g * 1.5, l * 0.1); c.lineTo(l * 0.6, l * 0.55 + g); c.closePath(); c.fill();
      }
      c.fillStyle = '#D6C89A'; c.beginPath(); c.moveTo(l * 0.9, l * 0.1); c.lineTo(l * 2.2, l * 0.1); c.lineTo(l * 0.9, l * 0.45); c.closePath(); c.fill();
      c.fillStyle = INK; circle(c, l * 0.1, -l * 0.15, l * 0.42);
      if (b.blood > 0.15) { c.fillStyle = BLOOD; circle(c, -l * 0.4, l * 0.3, l * 0.45); }
      break;
    }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** One of them: a fat little body on four skinny legs, a big head, its eyes (one, two or three), a mouth full of teeth. */
const drawAlien = (c: Ctx, a: Alien, f: number) => {
  const k = SKINS[a.skin];
  const dying = a.life < DYING;
  if (dying && a.life % 6 < 2) return;
  c.save(); c.translate(Math.round(a.x), Math.round(a.y)); c.scale(a.face * 1.4, 1.4);
  const px = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const skin = dying ? { hi: '#D6D3D1', mid: '#A8A29E', lo: '#78716C', line: '#292524' } : k;
  // legs: running (two and two), latched on (splayed, clinging), in the air (tucked back)
  const step = Math.floor(f / 3 + a.seed * 7) % 2;
  if (a.on) { px(-6, -6, 2, 1, skin.line); px(-6, -3, 2, 1, skin.line); px(4, -8, 1, 2, skin.line); px(-1, -1, 1, 2, skin.line); }
  else if (!a.ground) { px(-6, -4, 3, 1, skin.line); px(-5, -2, 3, 1, skin.line); px(1, -2, 2, 1, skin.line); px(3, -3, 2, 1, skin.line); }
  else { const r = Math.abs(a.vx) > 0.4 ? step : 0; px(-4 + r, -2, 1, 2, skin.line); px(-2 - r, -2, 1, 2, skin.line); px(1 + r, -2, 1, 2, skin.line); px(3 - r, -2, 1, 2, skin.line); }
  // the body
  px(-5, -7, 9, 6, skin.line); px(-4, -6, 7, 4, skin.mid); px(-3, -6, 5, 1, skin.hi); px(-4, -3, 7, 1, skin.lo);
  // the head, out front, too big for it
  const bob = a.on ? (Math.floor(a.chomp / 3) % 2) : 0;
  const hy = -12 + bob;
  px(0, hy, 7, 7, skin.line); px(1, hy + 1, 5, 5, skin.mid); px(1, hy + 1, 5, 1, skin.hi); px(1, hy + 5, 5, 1, skin.lo);
  // a feeler
  px(1, hy - 2, 1, 2, skin.line); px(1, hy - 3, 1, 1, skin.hi);
  // eyes
  const eye = (x: number, y: number, w: number) => { px(x, y, w, w, '#0B0B0F'); px(x, y, 1, 1, '#FFFFFF'); };
  if (a.eyes === 1) eye(3, hy + 1, 2);
  else if (a.eyes === 2) { eye(2, hy + 1, 1); eye(5, hy + 1, 1); }
  else { eye(2, hy + 1, 1); eye(4, hy + 1, 1); eye(3, hy + 3, 1); }
  // the mouth: chomping when it's on somebody
  const open = a.on ? Math.floor(a.chomp / 3) % 2 === 0 : !a.ground;
  if (open) { px(3, hy + 4, 4, 3, '#450A0A'); px(3, hy + 4, 1, 1, '#FFFFFF'); px(5, hy + 4, 1, 1, '#FFFFFF'); px(4, hy + 6, 1, 1, '#FFFFFF'); if (a.on) px(4, hy + 5, 2, 1, GORE); }
  else { px(3, hy + 4, 4, 1, '#450A0A'); px(4, hy + 4, 1, 1, '#FFFFFF'); }
  c.restore();
};

/** The gun's shots are its litters (not projectiles): nothing to draw for those. */
const draw = () => {};

const drawOverlay = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The corpses: the bloody skeleton, with what's left of the flesh over it
  for (const k of corpses) {
    if (!k.bones.length && !k.flesh) continue;
    c.save(); c.translate(k.x, k.y);
    const till = Math.max(EAT + STAND, k.landedAt + 40) - k.t;
    if (k.t > EAT && till < TEETER) c.rotate(Math.sin(k.t * 0.9) * 0.04 * (1 - till / TEETER));
    c.save(); c.scale(k.face, 1);
    for (const b of k.bones) drawBone(c, b);
    c.restore();
    if (k.flesh) {
      const jitter = k.t % 4 < 2 ? 1 : 0;
      c.globalAlpha = k.t > EAT - 12 ? Math.max(0, (EAT - k.t) / 12) : 1;
      c.drawImage(k.flesh, -k.fx + jitter, -k.fy);
      c.globalAlpha = 1;
    }
    c.restore();
  }
  // Green puddles where they burst: spreading out a moment, drying away at the end
  for (const p of puddles) {
    const w = p.w * Math.min(1, 0.4 + p.t / 12);
    c.globalAlpha = p.t > PUDDLE - 60 ? (PUDDLE - p.t) / 60 : 1;
    c.fillStyle = '#3F6212'; c.beginPath(); c.ellipse(p.x, p.y - 0.5, w + 1, 2.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#65A30D'; c.beginPath(); c.ellipse(p.x, p.y - 0.8, w, 1.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#BEF264'; c.fillRect(p.x - w * 0.4, p.y - 2, 2, 1);
    c.globalAlpha = 1;
  }
  // Bones in a heap
  for (const p of pieces) {
    c.save(); c.globalAlpha = p.t > LIE ? Math.max(0, 1 - (p.t - LIE) / FADE) : 1;
    c.translate(p.x, p.y); c.rotate(p.a); c.scale(p.face, 1);
    drawBone(c, p.b);
    c.restore();
  }
  // The litter
  for (const a of aliens) drawAlien(c, a, f);
};

/** In his fist: a fat lump of purple shell, a see-through green sac on top with things moving in it, a puckered pink
 *  hole at the business end. Squeezing, as it gives birth. */
const drawHeld = (c: Ctx, frame: number) => {
  const sq = birthing > 0 ? Math.sin((birthing / 12) * Math.PI) : 0;
  c.fillStyle = INK; c.fillRect(-2, -1, 6, 10); c.fillStyle = '#581C87'; c.fillRect(-1, 0, 4, 8);
  c.fillStyle = INK; c.beginPath(); c.ellipse(11, -3, 13, 6.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7C3AED'; c.beginPath(); c.ellipse(11, -3, 12, 5.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A78BFA'; c.fillRect(2, -7, 16, 2); c.fillStyle = '#4C1D95'; c.fillRect(2, 0, 18, 2);
  c.strokeStyle = '#BE123C'; c.lineWidth = 1; c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(8, 1, 14, -2); c.quadraticCurveTo(18, -4, 21, -1); c.stroke();
  // the sac, swelling and squeezing
  const rx = 6.5 * (1 - sq * 0.3), ry = 5 * (1 - sq * 0.35);
  c.fillStyle = INK; c.beginPath(); c.ellipse(9, -9, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(163, 230, 53, 0.9)'; c.beginPath(); c.ellipse(9, -9, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#D9F99D'; c.fillRect(6, -12, 3, 1);
  c.fillStyle = '#1A2E05';
  for (let i = 0; i < 3; i++) { const t = frame * 0.15 + i * 2.1; c.fillRect(Math.round(9 + Math.cos(t) * rx * 0.5), Math.round(-9 + Math.sin(t * 1.3) * ry * 0.4), 2, 1); }
  // the hole it comes out of
  const r = 3 + Math.sin(frame * 0.3) * 0.5 + sq * 1.5;
  c.fillStyle = INK; c.beginPath(); c.ellipse(24, -3, r * 0.7 + 1, r + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(24, -3, r * 0.7, r, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#450A0A'; c.beginPath(); c.ellipse(24.5, -3, r * 0.3, r * 0.55, 0, 0, Math.PI * 2); c.fill();
};

/** Everything it's got going, gone (through a door). */
export const stopSpawner = () => { aliens = []; corpses = []; pieces = []; puddles = []; birthing = 0; };

/** For tests: how many there are, what they're up to. */
export const spawnerForTests = () => ({ aliens: aliens.length, latched: aliens.filter(a => a.on).length, corpses: corpses.length, pieces: pieces.length, puddles: puddles.length, skeletons: corpses.filter(c => c.bones.length).length, ages: corpses.map(c => c.t) });

export const registerSpawner = () => registerWeapon('SPAWNER', { fire: (ctx, input, muzzle) => fire(ctx, input, muzzle), update: () => false, draw, drawHeld, tick: ctx => tick(ctx), drawOverlay });
