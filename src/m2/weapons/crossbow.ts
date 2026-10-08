// THE CROSSBOW OF PLAGUES (Adventure Land): a jungle crossbow, rattling off darts dipped in something that should have
// stayed in the jungle. Held, it fires fast. A dart's barely a scratch; what's on it is the thing. Everybody's only got
// so much TOLERANCE for it (a bar over his head, going down; the bigger he is, the more he's got), and when it's gone he
// starts throwing up: projectile vomiting, in heaves, at whoever's nearest. He's not stunned by it: he carries on with
// whatever he was doing, only he's spewing on his buddy while he does it. A face full of it wears down that one's
// tolerance in turn, and in a while he's at it too, on the next, and so on: chain puking. Stick another one and you've
// a new chain going. Nobody about to throw up on, he throws up straight up, and it comes down on him. The puke stings;
// enough of it kills (it's his weapon's kill, a kill line and all). It never touches Meathead.
// Every enemy gets the animation: rearing back, heaving forward over it, a green look about him, his mouth going.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { KIND_HEAD, KIND_TOP_REACH } from '../../m1/game/render/enemies';
import { deathFacing } from '../../m1/game/enemies/deaths';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** The darts: the wait between them, how fast, how much they hurt (not much), and how much tolerance each takes. */
const DART = { cooldown: 7, speed: 17, dmg: 2, sick: 1, gravity: 0.05, up: 0.55 };
/** Tolerance: a few darts' worth, and more by how much of him there is. Unhit a while, it comes back. */
const tolMax = (e: Enemy) => 3 + e.maxHealth / 22;
const REGEN_AFTER = 120, REGEN = 0.03;
/** Being sick: so many heaves, each this long (rearing back, spewing, getting his breath). After, a short spell he's
 *  over it, then he can be got again. */
const HEAVE = 70, HEAVES = 3, REAR = 14, SPEW_END = 50, IMMUNE = 90;
/** The puke: a glob every so often while he's spewing; what one does to whoever it lands on (his own, coming down on
 *  him, hurts a bit more); how far he'll look for somebody to throw up on. */
const PUKE = { every: 2, gravity: 0.35, dmg: 1.5, selfDmg: 1.3, sick: 0.45, reach: 460 };
/** How green he looks, sick. */
const SICK_LOOK = 'sepia(0.45) hue-rotate(40deg) saturate(1.6)';

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';

interface Sick {
  tol: number; max: number; lastHit: number;
  /** Frames into being sick (-1: he's not). */
  t: number; immuneUntil: number;
  /** Who he's throwing up on (null: straight up); which way that is. */
  target: Enemy | null; dir: 1 | -1;
  /** Frames left of dripping with it (somebody else's, or his own). */
  doused: number;
  /** The HURK! when it starts. */
  hurk: number;
}
const sickness = new WeakMap<Enemy, Sick>();
const sickOf = (e: Enemy) => { let s = sickness.get(e); if (!s) { s = { tol: tolMax(e), max: tolMax(e), lastHit: -999, t: -1, immuneUntil: 0, target: null, dir: 1, doused: 0, hurk: 0 }; sickness.set(e, s); } return s; };
/** Everybody being (or that's been) got at, for the tick and the drawing (the WeakMap can't be walked). */
let tracked = new Set<Enemy>();

type Part = { kind: 'dart' } | { kind: 'puke'; from: Enemy; self: boolean; t: number; chunk: boolean };
const partOf = (p: Projectile) => p.customData as Part;

/** Darts stuck in somebody (where on him, at what angle), or in a wall; puddles of it. */
let stuck: { e: Enemy | null; x: number; y: number; a: number; t: number }[] = [];
let puddles: { x: number; y: number; w: number; t: number }[] = [];
const STUCK_LIFE = 360, PUDDLE_LIFE = 480;

// ---------------------------------------------------------------------------------------------------------------
// Walls and floors

const solid = (b: GameState['blocks'][number]) => b.type !== 'pit' && b.type !== 'door';
const wallAt = (state: GameState, x: number, y: number, w: number, h: number) =>
  state.blocks.some(b => solid(b) && !b.oneWay && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
const floorBelow = (state: GameState, x: number, y: number) => {
  let best = groundLineAt(state.groundRuns, x);
  if (!(best >= y - 0.5)) best = Infinity;
  for (const b of state.blocks) if (solid(b) && x >= b.x && x <= b.x + b.w && b.y >= y - 0.5 && b.y < best) best = b.y;
  return best;
};

// ---------------------------------------------------------------------------------------------------------------
// Firing

const fire = (ctx: FrameContext, input: { moveUp: boolean }, muzzle: { x: number; y: number }) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const dir = pl.facing;
  const a = input.moveUp ? -DART.up : (Math.random() - 0.5) * 0.04;
  state.projectiles.push({
    id: `dart-${state.frame}-${Math.random()}`, pos: { x: muzzle.x - 5, y: muzzle.y - 1.5 }, vel: { x: dir * Math.cos(a) * DART.speed, y: Math.sin(a) * DART.speed },
    width: 10, height: 3, health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'CROSSBOW', customData: { kind: 'dart' } satisfies Part,
  });
  pl.shootCooldown = DART.cooldown;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.CROSSBOW--;
  playSound('twang');
};

/** A dart in him: a scratch, and the stuff on it working on him. */
const darted = (ctx: FrameContext, e: Enemy, p: Projectile) => {
  const { state } = ctx;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  stuck.push({ e, x: Math.max(0.1, Math.min(0.9, (cx - e.pos.x) / e.width)), y: Math.max(0.1, Math.min(0.9, (cy - e.pos.y) / e.height)), a: Math.atan2(p.vel.y, p.vel.x), t: 0 });
  if (stuck.filter(s => s.e === e).length > 12) stuck.splice(stuck.findIndex(s => s.e === e), 1);
  for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: -Math.sign(p.vel.x) * Math.random() * 2, y: -Math.random() * 2 }, life: 12, color: i ? '#B91C1C' : '#84CC16', size: 1.5 });
  playSound('click', 0.4, 10);
  hurt(ctx, e, DART.dmg, Math.sign(p.vel.x) || 1);
  if (!alive(e) || isMidBoss(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.lastHit = state.frame;
  if (s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= DART.sick; if (s.tol <= 0) getSick(state, e, s); }
};

/** Hurt by it (a dart, the puke): dead of it, his weapon's death. */
const hurt = (ctx: FrameContext, e: Enemy, dmg: number, dir: number) => {
  const { fx } = ctx;
  e.health -= dmg;
  if (e.health > 0 || isMidBoss(e)) return;
  e.pose = undefined;
  fx.blowAwayEnemy(e, { x: dir * 3, y: -5 }, m2Kill('plague_kill'), dir, 0.7);
  fx.spawnKillCallout(e, grabCallout('plague'));
};

/** His tolerance gone: he's going to be sick. */
const getSick = (state: GameState, e: Enemy, s: Sick) => {
  s.t = 0; s.tol = 0; s.hurk = 36; s.target = null;
  playSound('retch');
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Being sick

/** Somebody to throw up on: the nearest (one not already at it, if there's a choice), close enough. */
const pickTarget = (state: GameState, e: Enemy) => {
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  let best: Enemy | null = null, score = Infinity;
  for (const o of state.enemies) {
    if (o === e || !alive(o)) continue;
    const d = Math.hypot(o.pos.x + o.width / 2 - cx, o.pos.y + o.height / 2 - cy);
    if (d > PUKE.reach) continue;
    const sk = sickness.get(o);
    const sc = d + (sk && sk.t >= 0 ? 300 : 0);
    if (sc < score) { score = sc; best = o; }
  }
  return best;
};

/** Where his mouth is, posed (`lean` about his feet; facing `dir`). */
const mouthOf = (e: Enemy, dir: number, lean: number) => {
  const kh = e.kind ? KIND_HEAD[e.kind] : undefined;
  const hx = kh ? dir * (kh.x + kh.r * 0.8) : dir * e.width * 0.3, hy = kh ? kh.y + kh.r * 0.3 : -e.height + Math.min(14, e.height * 0.25);
  const fx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
  const c = Math.cos(lean), s = Math.sin(lean);
  return { x: fx + hx * c - hy * s, y: fy + hx * s + hy * c };
};

const heave = (ctx: FrameContext, e: Enemy, s: Sick) => {
  const { state } = ctx;
  const n = Math.floor(s.t / HEAVE), cyc = s.t % HEAVE;
  if (n >= HEAVES) { s.t = -1; s.tol = s.max; s.immuneUntil = state.frame + IMMUNE; s.target = null; e.pose = undefined; return; }
  if (cyc === 0 || (s.target && !alive(s.target)) || (s.target && !state.enemies.includes(s.target))) s.target = pickTarget(state, e);
  if (cyc === 0 && n > 0) playSound('retch', 0.8);
  const t = s.target;
  const natural = deathFacing(state, e);
  s.dir = (t ? (Math.sign(t.pos.x + t.width / 2 - (e.pos.x + e.width / 2)) || natural) : natural) as 1 | -1;
  const dir = s.dir, up = !t;
  // The pose: rearing back, then over it (or head back, if it's going up), then getting his breath
  let lean = 0, sy = 1, sx = 1;
  if (cyc < REAR) { const k = cyc / REAR; lean = -dir * 0.14 * k; sy = 1 + 0.06 * k; sx = 1 - 0.04 * k; }
  else if (cyc < SPEW_END) { lean = up ? -dir * 0.32 : dir * (0.3 + Math.sin(cyc * 1.3) * 0.04); sy = 0.95 + Math.sin(cyc * 0.9) * 0.03; sx = 1.03; }
  else { const k = (cyc - SPEW_END) / (HEAVE - SPEW_END); lean = (up ? -dir * 0.32 : dir * 0.3) * (1 - k); }
  e.pose = { lean, sx: sx * (dir !== natural ? -1 : 1), sy, filter: SICK_LOOK };
  // Spewing: a glob at a time, a long arc onto him (or straight up)
  if (cyc >= REAR && cyc < SPEW_END) {
    if (cyc === REAR) playSound('gush');
    if (cyc % PUKE.every === 0) {
      const m = mouthOf(e, dir, lean);
      let vel: { x: number; y: number };
      if (t) {
        const tx = t.pos.x + t.width / 2 + (Math.random() - 0.5) * t.width * 0.6, ty = t.pos.y + t.height * (0.25 + Math.random() * 0.4);
        const dx = tx - m.x, dy = ty - m.y, T = Math.max(8, Math.min(26, Math.abs(dx) / 11));
        vel = { x: dx / T + (Math.random() - 0.5) * 0.6, y: dy / T - 0.5 * PUKE.gravity * T + (Math.random() - 0.5) * 0.8 };
      } else {
        // (straight up, to come down on his own head: about where he's stood, give or take)
        const vy = -9 - Math.random() * 3, T = (-2 * vy) / PUKE.gravity;
        vel = { x: (e.pos.x + e.width / 2 - m.x) / T + (Math.random() - 0.5) * 0.8, y: vy };
      }
      state.projectiles.push({
        id: `puke-${state.frame}-${Math.random()}`, pos: { x: m.x - 4, y: m.y - 4 }, vel, width: 8, height: 8, health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'CROSSBOW',
        customData: { kind: 'puke', from: e, self: !t, t: 0, chunk: Math.random() < 0.3 } satisfies Part,
      });
    }
  }
  s.t++;
};

/** One glob of it landing on somebody: it stings, it's all over him, and it's working on him too. */
const pukedOn = (ctx: FrameContext, e: Enemy, p: Projectile, part: Extract<Part, { kind: 'puke' }>) => {
  const { state } = ctx;
  const own = e === part.from;
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: p.pos.x + 4, y: p.pos.y + 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 16, color: PUKE_COLORS[i % 3], size: 2 + Math.random() * 2, grav: 0.3 });
  if (Math.random() < 0.3) playSound('splat', 0.3, 6);
  hurt(ctx, e, own ? PUKE.selfDmg : PUKE.dmg, Math.sign(p.vel.x) || 1);
  if (!alive(e) || isMidBoss(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.doused = 120; s.lastHit = state.frame;
  if (!own && s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= PUKE.sick; if (s.tol <= 0) getSick(state, e, s); }
};

const PUKE_COLORS = ['#A3B320', '#C5D33B', '#7C8A12'];

// ---------------------------------------------------------------------------------------------------------------
// Darts and puke, moving

const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const part = partOf(p);
  const off = p.pos.x < state.camera.x - 200 || p.pos.x > state.camera.x + CANVAS_WIDTH + 200 || p.pos.y > state.camera.y + 1400;
  if (off) return false;
  if (part.kind === 'dart') {
    p.vel.y += DART.gravity;
    p.pos.x += p.vel.x; p.pos.y += p.vel.y;
    for (const e of state.enemies) {
      if (!alive(e)) continue;
      if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
      darted(ctx, e, p);
      return false;
    }
    const tipX = p.vel.x > 0 ? p.pos.x + p.width : p.pos.x;
    if (wallAt(state, tipX - 1, p.pos.y, 2, p.height) || p.pos.y + p.height >= floorBelow(state, tipX, p.pos.y)) {
      // (stuck in the wall, or the floor)
      stuck.push({ e: null, x: tipX, y: p.pos.y + 1.5, a: Math.atan2(p.vel.y, p.vel.x), t: 0 });
      playSound('click', 0.3, 4);
      return false;
    }
    return true;
  }
  // A glob of it
  part.t++;
  p.vel.y += PUKE.gravity;
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  if (state.frame % 2 === 0 && Math.random() < 0.5) state.particles.push({ pos: { x: p.pos.x + 4, y: p.pos.y + 4 }, vel: { x: 0, y: 0.3 }, life: 10, color: PUKE_COLORS[Math.floor(Math.random() * 3)], size: 2 });
  for (const e of state.enemies) {
    if (!alive(e)) continue;
    // (his own: only coming back down on him, when he threw it up)
    if (e === part.from && (!part.self || p.vel.y < 0)) continue;
    if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
    pukedOn(ctx, e, p, part);
    return false;
  }
  const floor = floorBelow(state, p.pos.x + 4, p.pos.y);
  if (p.vel.y > 0 && p.pos.y + p.height >= floor) { splat(state, p.pos.x + 4, floor); return false; }
  if (wallAt(state, p.pos.x, p.pos.y, p.width, p.height)) { splat(state, p.pos.x + 4, floorBelow(state, p.pos.x + 4 - Math.sign(p.vel.x) * 8, p.pos.y)); return false; }
  return true;
};

/** On the floor: a splash, and a puddle (one spreading where there's one already). */
const splat = (state: GameState, x: number, y: number) => {
  for (let i = 0; i < 3; i++) state.particles.push({ pos: { x, y: y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 1.5 }, life: 12, color: PUKE_COLORS[i], size: 2, grav: 0.3 });
  if (!(y < state.camera.y + 2000)) return;
  const near = puddles.find(q => Math.abs(q.x - x) < q.w && Math.abs(q.y - y) < 4);
  if (near) { near.w = Math.min(46, near.w + 0.8); near.t = Math.min(near.t, 60); }
  else puddles.push({ x, y, w: 6 + Math.random() * 4, t: 0 });
};

// ---------------------------------------------------------------------------------------------------------------
// Every frame

const tick = (ctx: FrameContext) => {
  const { state } = ctx;
  for (const e of tracked) {
    const s = sickness.get(e);
    if (!s || !alive(e) || !state.enemies.includes(e)) { e.pose = undefined; if (!alive(e) || !state.enemies.includes(e)) tracked.delete(e); continue; }
    if (s.hurk > 0) s.hurk--;
    if (s.t >= 0) heave(ctx, e, s);
    else if (state.frame - s.lastHit > REGEN_AFTER) s.tol = Math.min(s.max, s.tol + REGEN);
    // Dripping with it
    if (s.doused > 0) {
      s.doused--;
      if (state.frame % 4 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height * (0.2 + Math.random() * 0.6) }, vel: { x: 0, y: 0.6 }, life: 18, color: PUKE_COLORS[Math.floor(Math.random() * 3)], size: 2, grav: 0.2 });
    }
  }
  for (const d of stuck) d.t++;
  stuck = stuck.filter(d => d.t < STUCK_LIFE && (!d.e || (alive(d.e) && state.enemies.includes(d.e))));
  for (const q of puddles) q.t++;
  puddles = puddles.filter(q => q.t < PUDDLE_LIFE);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A dart: a thin dark shaft, a green-smeared tip, red and green fletching. Drawn along +x, the tip at the origin. */
const drawDart = (c: Ctx, x: number, y: number, a: number, len = 11) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-len - 1, -1.5, len + 1, 3);
  c.fillStyle = '#A16207'; c.fillRect(-len, -0.5, len - 2, 1);
  c.fillStyle = '#84CC16'; c.fillRect(-3, -1, 3, 2);
  c.fillStyle = '#DC2626'; c.fillRect(-len - 1, -3, 4, 2); c.fillStyle = '#16A34A'; c.fillRect(-len - 1, 1, 4, 2);
  c.restore();
};

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const part = partOf(p);
  if (part.kind === 'dart') { drawDart(c, p.vel.x > 0 ? p.pos.x + p.width : p.pos.x, p.pos.y + 1.5, Math.atan2(p.vel.y, p.vel.x)); return; }
  // A glob: lumpy, yellow-green, a shine on it, now and then a chunk of something orange in it
  const x = p.pos.x + 4, y = p.pos.y + 4, wob = Math.sin(frame * 0.7 + p.pos.x) * 0.8;
  c.fillStyle = '#5B6410'; c.beginPath(); c.ellipse(x, y, 4.6 + wob * 0.3, 4 - wob * 0.3, Math.atan2(p.vel.y, p.vel.x), 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(x, y, 3.6 + wob * 0.3, 3 - wob * 0.3, Math.atan2(p.vel.y, p.vel.x), 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E2EC7A'; c.fillRect(x - 2, y - 2, 2, 1);
  if (part.chunk) { c.fillStyle = '#EA7A12'; c.fillRect(x, y, 2, 2); }
};

const drawOverlay = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // Puddles of it
  for (const q of puddles) {
    c.globalAlpha = q.t > PUDDLE_LIFE - 60 ? (PUDDLE_LIFE - q.t) / 60 : 1;
    c.fillStyle = '#5B6410'; c.beginPath(); c.ellipse(q.x, q.y - 0.5, q.w + 1, 2.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(q.x, q.y - 0.8, q.w, 1.7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#EA7A12'; c.fillRect(q.x - q.w * 0.3, q.y - 1.5, 2, 1); c.fillRect(q.x + q.w * 0.4, q.y - 1, 1, 1);
    c.fillStyle = '#E2EC7A'; c.fillRect(q.x - q.w * 0.5, q.y - 2, 3, 1);
  }
  c.globalAlpha = 1;
  // Darts stuck in people (they go with him, leaning the way he leans) and in walls
  for (const d of stuck) {
    if (d.t > STUCK_LIFE - 40 && d.t % 4 < 2) continue;
    if (!d.e) { drawDart(c, d.x, d.y, d.a); continue; }
    const e = d.e;
    const fx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
    let lx = e.pos.x + d.x * e.width - fx, ly = e.pos.y + d.y * e.height - fy;
    const lean = e.pose?.lean ?? 0;
    const cs = Math.cos(lean), sn = Math.sin(lean);
    [lx, ly] = [lx * cs - ly * sn, lx * sn + ly * cs];
    drawDart(c, fx + lx + Math.cos(d.a) * 2, fy + ly + Math.sin(d.a) * 2, d.a + lean, 9);
  }
  for (const e of tracked) {
    const s = sickness.get(e);
    if (!s || !alive(e)) continue;
    const top = e.pos.y - 14 - (KIND_TOP_REACH[e.kind ?? ''] ?? 0);
    // Tolerance, while it's been worn at: a sick green bar over his head, going down
    if (s.t < 0 && s.tol < s.max) {
      const w = Math.max(26, Math.min(56, e.width + 8)), x = Math.round(e.pos.x + e.width / 2 - w / 2), y = Math.round(top + Math.sin(f * 0.15 + e.pos.x) * 1.2);
      const k = Math.max(0, s.tol / s.max);
      c.fillStyle = INK; c.fillRect(x - 1, y - 1, w + 2, 6);
      c.fillStyle = '#3F3F46'; c.fillRect(x, y, w, 4);
      c.fillStyle = k < 0.3 ? (f % 8 < 4 ? '#A3B320' : '#E2EC7A') : '#65A30D';
      c.fillRect(x, y, Math.round(w * k), 4);
      c.fillStyle = 'rgba(255, 255, 255, 0.4)'; c.fillRect(x, y, Math.round(w * k), 1);
      // (and a little green face at the end of it, going greener)
      c.fillStyle = INK; c.fillRect(x - 9, y - 2, 7, 8); c.fillStyle = k < 0.5 ? '#A3B320' : '#FCD34D'; c.fillRect(x - 8, y - 1, 5, 6);
      c.fillStyle = INK; c.fillRect(x - 7, y + 1, 1, 1); c.fillRect(x - 5, y + 1, 1, 1); c.fillRect(x - 7, y + 3, 3, 1);
    }
    // Sick: stink lines coming off him, and his HURK!
    if (s.t >= 0) {
      for (let i = 0; i < 3; i++) {
        const ph = ((f * 0.03 + i / 3) % 1), x = e.pos.x + e.width * (0.25 + i * 0.25), y = top + 10 - ph * 22;
        c.strokeStyle = `rgba(163, 179, 32, ${(0.7 * (1 - ph)).toFixed(2)})`; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 3, x, y - 6); c.quadraticCurveTo(x - 3, y - 9, x, y - 12); c.stroke();
      }
    }
    if (s.hurk > 0) {
      const k = s.hurk / 36;
      c.save(); c.translate(e.pos.x + e.width / 2, top - 6 - (1 - k) * 8); c.scale(1 + (1 - k) * 0.2, 1 + (1 - k) * 0.2);
      c.font = '8px "Press Start 2P"'; c.textAlign = 'center';
      c.fillStyle = INK; c.fillText('HURK!', 1, 1); c.fillStyle = '#C5D33B'; c.fillText('HURK!', 0, 0);
      c.textAlign = 'left'; c.restore();
    }
  }
};

/** In his fist: a jungle crossbow, a bamboo stock wrapped in leather, a bow of bent horn strung across the front, a
 *  dart sat in the groove, a little skull hanging off it. */
const drawHeld = (c: Ctx) => {
  // stock
  c.fillStyle = INK; c.fillRect(-3, -5, 27, 6); c.fillRect(-3, -2, 6, 10);
  c.fillStyle = '#CA8A04'; c.fillRect(-2, -4, 25, 4); c.fillStyle = '#FDE047'; c.fillRect(-2, -4, 25, 1); c.fillStyle = '#854D0E'; c.fillRect(-2, -1, 25, 1);
  c.fillStyle = '#A16207'; c.fillRect(-2, -1, 4, 8);
  for (const x of [6, 12]) { c.fillStyle = '#78350F'; c.fillRect(x, -5, 2, 6); }
  // the bow, across the front
  c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(16, -14); c.quadraticCurveTo(23, -2, 16, 10); c.stroke();
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 2; c.beginPath(); c.moveTo(16, -14); c.quadraticCurveTo(23, -2, 16, 10); c.stroke();
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, -14); c.lineTo(9, -2); c.lineTo(16, 10); c.stroke();
  // the dart in it
  c.fillStyle = '#A16207'; c.fillRect(9, -4, 18, 1); c.fillStyle = '#84CC16'; c.fillRect(25, -5, 3, 2);
  // the skull hanging off it
  c.strokeStyle = '#78350F'; c.lineWidth = 1; c.beginPath(); c.moveTo(4, 1); c.lineTo(4, 7); c.stroke();
  c.fillStyle = INK; c.fillRect(1, 6, 7, 6); c.fillStyle = '#F5F0E1'; c.fillRect(2, 7, 5, 4);
  c.fillStyle = INK; c.fillRect(3, 8, 1, 1); c.fillRect(5, 8, 1, 1);
};

/** Everything going, stopped (through a door). */
export const stopCrossbow = () => {
  for (const e of tracked) e.pose = undefined;
  tracked = new Set(); stuck = []; puddles = [];
};

/** For tests: everybody's tolerance and sickness. */
export const crossbowForTests = (state: GameState) => state.enemies.filter(e => sickness.has(e)).map(e => { const s = sickness.get(e)!; return `${e.kind}:${s.tol.toFixed(1)}/${s.max.toFixed(1)}:${s.t >= 0 ? 'SICK' + s.t : '-'}:${Math.round(e.health)}`; });

export const registerCrossbow = () => registerWeapon('CROSSBOW', { fire: (ctx, input, muzzle) => fire(ctx, input, muzzle), update, draw, drawHeld: c => drawHeld(c), tick: ctx => tick(ctx), drawOverlay });
