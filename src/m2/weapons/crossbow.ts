// THE CROSSBOW OF PLAGUES (Adventure Land): a jungle crossbow, rattling off darts dipped in something that should have
// stayed in the jungle. Held, it fires fast. A dart's barely a scratch; what's on it is the thing. Everybody's only got
// so much TOLERANCE for it (a bar over his head, going down; the bigger he is, the more he's got), and when it's gone he
// starts throwing up: projectile vomiting, in heaves, at whoever's nearest. He's not stunned by it: he carries on with
// whatever he was doing, only he's spewing on his buddy while he does it. A face full of it wears down that one's
// tolerance in turn, and in a while he's at it too, on the next, and so on: chain puking. Stick another one and you've
// a new chain going. Nobody about to throw up on, he throws up straight up, and it comes down on him. The puke stings;
// enough of it kills (it's his weapon's kill, a kill line and all). It never touches Meathead. Its puddles sting too, a
// little at a time, anybody stood in one. Puked to death is a death of its own: buckling, one last torrent of it (onto
// whoever's near: it can still pass it on), keeling over face first into it, and lying there with the flies.
// Every enemy gets the animation: rearing back, heaving forward over it, a green look about him, his mouth going.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { KIND_HEAD, KIND_TOP_REACH, kindFacing, isHumanoidKind } from '../../m1/game/render/enemies';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { drawEnemyAt } from '../moves/grab';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** The darts: the wait between them, how fast, how much they hurt (not much), and how much tolerance each takes. */
const DART = { cooldown: 7, speed: 17, dmg: 2, sick: 1, gravity: 0.05, up: 0.55 };
/** Where its tip is from the grip (as the engine's muzzle has it); how far it's tilted up right now (up held: it
 *  swings up, let go: back down level). */
const TIP = { x: 27, y: -4 };
let aim = 0;
/** Tolerance: a few darts' worth, and more by how much of him there is. Unhit a while, it comes back. */
const tolMax = (e: Enemy) => 2 + e.maxHealth / 35;
const REGEN_AFTER = 120, REGEN = 0.03;
/** Being sick: so many heaves, each this long (rearing back, spewing, getting his breath). After, a short spell he's
 *  over it, then he can be got again. */
const HEAVE = 90, HEAVES = 4, REAR = 14, SPEW_END = 72, IMMUNE = 90;
/** The puke: a glob every so often while he's spewing; what one does to whoever it lands on (his own, coming down on
 *  him, hurts a bit more); how far he'll look for somebody to throw up on. */
const PUKE = { every: 2, gravity: 0.35, dmg: 1.1, selfDmg: 1, sick: 0.6, reach: 460 };
/** How green he looks, sick. */
const SICK_LOOK = ['sepia(0.6) hue-rotate(42deg) saturate(2.3)', 'sepia(0.7) hue-rotate(48deg) saturate(2.8) brightness(0.92)'];

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

type Part = { kind: 'dart' } | { kind: 'puke'; from: Enemy; self: boolean; t: number; seed: number };
const partOf = (p: Projectile) => p.customData as Part;

/** Darts stuck in somebody (where on him, at what angle), or in a wall; puddles of it. */
let stuck: { e: Enemy | null; x: number; y: number; a: number; t: number }[] = [];
let puddles: { x: number; y: number; w: number; t: number }[] = [];
const STUCK_LIFE = 360, PUDDLE_LIFE = 480;
/** A puddle's sting: this much, every so often, to anybody stood in one. */
const PUDDLE_STING = { every: 20, dmg: 1 };

// ---------------------------------------------------------------------------------------------------------------
// Walls and floors

const solid = (b: GameState['blocks'][number]) => b.type !== 'pit' && b.type !== 'door';
const blockAt = (state: GameState, x: number, y: number, w: number, h: number) =>
  state.blocks.find(b => solid(b) && !b.oneWay && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
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
  void input;
  const a = aim + (Math.random() - 0.5) * 0.04;
  // (off the tip, wherever it's pointing: turned about the grip)
  const grip = { x: muzzle.x - dir * TIP.x, y: muzzle.y - TIP.y };
  const tx = TIP.x * Math.cos(aim) - TIP.y * Math.sin(aim), ty = TIP.x * Math.sin(aim) + TIP.y * Math.cos(aim);
  const from = { x: grip.x + dir * tx, y: grip.y + ty };
  state.projectiles.push({
    id: `dart-${state.frame}-${Math.random()}`, pos: { x: from.x - 5, y: from.y - 1.5 }, vel: { x: dir * Math.cos(a) * DART.speed, y: Math.sin(a) * DART.speed },
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
  hurt(ctx, e, DART.dmg);
  if (!alive(e) || isMidBoss(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.lastHit = state.frame;
  if (s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= DART.sick; if (s.tol <= 0) getSick(state, e, s); }
};

/** Hurt by it (a dart, the puke, a puddle of it): dead of any of it, it's the plague that got him: puked to death. */
const hurt = (ctx: FrameContext, e: Enemy, dmg: number) => {
  e.health -= dmg;
  if (e.health > 0 || isMidBoss(e)) return;
  pukedToDeath(ctx, e);
};

// ---------------------------------------------------------------------------------------------------------------
// Puked to death

/** How it goes: his knees going; the last of it, all of it, coming up; over, face first; lying in it (with the flies). */
const BUCKLE = 18, TORRENT_END = 66, FALL_END = 80, LIE_END = 420, GONE = 60;
/** `animal`: it doesn't go over on its face, it rolls over onto its back, legs up (turned about its middle, not its feet). */
interface Corpse { e: Enemy; x: number; y: number; vy: number; t: number; face: 1 | -1; animal: boolean }
let corpses: Corpse[] = [];

const pukedToDeath = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  // (facing whoever he was being sick on; otherwise whichever way he's drawn facing)
  const face = (e.pose?.face ?? (e.kind ? kindFacing(e, state) : e.facing ?? 1)) as 1 | -1;
  e.health = 0; e.pose = undefined;
  state.enemies = state.enemies.filter(o => o !== e);
  e.isBlownAway = true;
  corpses.push({ e, x: e.pos.x + e.width / 2, y: e.pos.y + e.height, vy: 0, t: 0, face, animal: !!e.kind && !isHumanoidKind(e.kind) });
  fx.spawnPickup(e.pos);
  fx.speakVulgarity(m2Kill('plague_kill'));
  fx.spawnKillCallout(e, grabCallout('plague'));
  state.player.killSatisfactionTimer = 60;
  playSound('retch', 1, -3);
};

/** Where he's leaning to and how he's squashed, by how far it's gone. */
const corpsePose = (c: Corpse) => {
  const t = c.t, shake = Math.sin(t * 2.1) * 0.04;
  if (c.animal) {
    // (an animal: its head going down, then over onto its back, legs in the air, the odd kick)
    if (t < BUCKLE) { const k = t / BUCKLE; return { a: 0.12 * k + shake, sx: 1, sy: 1 - 0.08 * k, lift: 0 }; }
    if (t < TORRENT_END) { const k = (t - BUCKLE) / (TORRENT_END - BUCKLE); return { a: 0.2 + Math.sin(t * 1.4) * 0.05, sx: 1 - 0.1 * k, sy: 0.92 + Math.sin(t * 0.9) * 0.03, lift: 0 }; }
    if (t < FALL_END) { const k = (t - TORRENT_END) / (FALL_END - TORRENT_END); return { a: 0.2 + (Math.PI - 0.2) * k * k, sx: 0.9, sy: 0.92, lift: k * k }; }
    return { a: Math.PI + ((t % 47) < 5 ? Math.sin(t * 3) * 0.08 : 0), sx: 0.9, sy: 0.92, lift: 1 };
  }
  if (t < BUCKLE) { const k = t / BUCKLE; return { a: 0.18 * k + shake, sx: 1, sy: 1 - 0.08 * k, lift: 0 }; }
  if (t < TORRENT_END) { const k = (t - BUCKLE) / (TORRENT_END - BUCKLE); return { a: 0.38 + Math.sin(t * 1.4) * 0.06, sx: 1 - 0.16 * k, sy: 0.92 + Math.sin(t * 0.9) * 0.03, lift: 0 }; }
  if (t < FALL_END) { const k = (t - TORRENT_END) / (FALL_END - TORRENT_END); return { a: 0.38 + (Math.PI / 2 - 0.38) * k * k, sx: 0.84, sy: 0.92, lift: k * k }; }
  // (lying in it: a twitch now and then)
  const tw = (t % 53) < 4 ? Math.sin(t * 3) * 0.06 : 0;
  return { a: Math.PI / 2 + tw, sx: 0.84, sy: 0.92, lift: 1 };
};

const rotCorpse = (ctx: FrameContext, c: Corpse) => {
  const { state } = ctx;
  c.t++;
  const e = c.e;
  // (dropping, if he died up in the air)
  const floor = floorBelow(state, c.x, c.y - 2);
  if (c.y < floor - 0.5) { c.vy += 0.5; c.y = Math.min(floor, c.y + c.vy); if (c.y >= floor) c.vy = 0; }
  const ps = corpsePose(c);
  if (c.t === BUCKLE) playSound('gush'); if (c.t === BUCKLE + 28) playSound('gush', 0.8, -2);
  // The last of it: a torrent, onto whoever's near (it's still catching), otherwise down in front of him
  if (c.t >= BUCKLE && c.t < TORRENT_END) {
    const kh = e.kind ? KIND_HEAD[e.kind] : undefined;
    const hx = kh ? kh.x + kh.r * 0.8 : e.width * 0.3, hy = kh ? kh.y + kh.r * 0.3 : -e.height * 0.85;
    const th = c.face * ps.a, rx = c.face * hx * ps.sx, ry = (hy + (c.animal ? e.height / 2 : 0)) * ps.sy;
    const px = c.x, py = c.y - (c.animal ? e.height / 2 * ps.sy : 0);
    const m = { x: px + rx * Math.cos(th) - ry * Math.sin(th), y: py + rx * Math.sin(th) + ry * Math.cos(th) };
    let near: Enemy | null = null, nd = PUKE.reach * 0.6;
    for (const o of state.enemies) { if (!alive(o)) continue; const d = Math.hypot(o.pos.x + o.width / 2 - c.x, o.pos.y + o.height / 2 - (c.y - e.height / 2)); if (d < nd && Math.sign(o.pos.x + o.width / 2 - c.x) === c.face) { nd = d; near = o; } }
    let vel: { x: number; y: number };
    if (near) {
      const tx = near.pos.x + near.width / 2 + (Math.random() - 0.5) * near.width * 0.6, ty = near.pos.y + near.height * (0.25 + Math.random() * 0.4);
      const dx = tx - m.x, dy = ty - m.y, T = Math.max(8, Math.min(26, Math.abs(dx) / 11));
      vel = { x: dx / T + (Math.random() - 0.5) * 0.6, y: dy / T - 0.5 * PUKE.gravity * T + (Math.random() - 0.5) * 0.8 };
    } else vel = { x: c.face * (3 + Math.random() * 4), y: -1 + Math.random() * 2.5 };
    state.projectiles.push({
      id: `puke-${state.frame}-${Math.random()}`, pos: { x: m.x - G / 2, y: m.y - G / 2 }, vel, width: G, height: G, health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'CROSSBOW',
      customData: { kind: 'puke', from: e, self: false, t: 0, seed: Math.random() } satisfies Part,
    });
  }
  // Down: face first, into a puddle of it
  if (c.t === FALL_END) {
    playSound('thud', 0.8); playSound('splat', 0.6, -4);
    const at = c.animal ? c.x : c.x + c.face * e.height * 0.55, y = floorBelow(state, at, c.y - 4);
    if (y < c.y + 60) puddles.push({ x: at, y, w: Math.max(14, e.height * 0.4), t: 0 });
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: at, y: c.y - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 2.5 }, life: 18, color: PUKE_COLORS[i % 3], size: 3 + Math.random() * 2, grav: 0.3 });
  }
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
  const natural = (e.kind ? kindFacing(e, state) : e.facing ?? 1) as 1 | -1;
  s.dir = (t ? (Math.sign(t.pos.x + t.width / 2 - (e.pos.x + e.width / 2)) || natural) : natural) as 1 | -1;
  const dir = s.dir, up = !t;
  // The pose: rearing back, then over it (or head back, if it's going up), then getting his breath
  let lean = 0, sy = 1, sx = 1;
  if (cyc < REAR) { const k = cyc / REAR; lean = -dir * 0.14 * k; sy = 1 + 0.06 * k; sx = 1 - 0.04 * k; }
  else if (cyc < SPEW_END) { lean = up ? -dir * 0.32 : dir * (0.3 + Math.sin(cyc * 1.3) * 0.04); sy = 0.95 + Math.sin(cyc * 0.9) * 0.03; sx = 1.03; }
  else { const k = (cyc - SPEW_END) / (HEAVE - SPEW_END); lean = (up ? -dir * 0.32 : dir * 0.3) * (1 - k); }
  // (green, going greener and back, all the while he's sick)
  e.pose = { lean, sx, sy, filter: SICK_LOOK[Math.floor(state.frame / 10) % 2], face: dir };
  // Spewing: a glob at a time, a long arc onto him (or straight up)
  if (cyc >= REAR && cyc < SPEW_END) {
    if (cyc === REAR || cyc === REAR + 30) playSound('gush');
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
        id: `puke-${state.frame}-${Math.random()}`, pos: { x: m.x - G / 2, y: m.y - G / 2 }, vel, width: G, height: G, health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'CROSSBOW',
        customData: { kind: 'puke', from: e, self: !t, t: 0, seed: Math.random() } satisfies Part,
      });
    }
  }
  s.t++;
};

/** One glob of it landing on somebody: it stings, it's all over him, and it's working on him too. */
const pukedOn = (ctx: FrameContext, e: Enemy, p: Projectile, part: Extract<Part, { kind: 'puke' }>) => {
  const { state } = ctx;
  const own = e === part.from;
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: p.pos.x + G / 2, y: p.pos.y + G / 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2.5 }, life: 18, color: i === 5 ? BITS[i % 4] : PUKE_COLORS[i % 3], size: 3 + Math.random() * 3, grav: 0.3 });
  if (Math.random() < 0.3) playSound('splat', 0.3, 6);
  hurt(ctx, e, own ? PUKE.selfDmg : PUKE.dmg);
  if (!alive(e) || isMidBoss(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.doused = 120; s.lastHit = state.frame;
  if (!own && s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= PUKE.sick; if (s.tol <= 0) getSick(state, e, s); }
};

const PUKE_COLORS = ['#A3B320', '#C5D33B', '#7C8A12'];
/** A glob's size; the bits in it (carrot, corn, something brown). */
const G = 13;
const BITS = ['#EA7A12', '#FACC15', '#78350F', '#F97316'];

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
  if (state.frame % 2 === 0 && Math.random() < 0.6) state.particles.push({ pos: { x: p.pos.x + Math.random() * G, y: p.pos.y + G / 2 }, vel: { x: p.vel.x * 0.2, y: 0.3 }, life: 12, color: Math.random() < 0.2 ? BITS[Math.floor(Math.random() * 4)] : PUKE_COLORS[Math.floor(Math.random() * 3)], size: 2 + Math.random() * 2, grav: 0.2 });
  for (const e of state.enemies) {
    if (!alive(e)) continue;
    // (his own: only coming back down on him, when he threw it up)
    if (e === part.from && (!part.self || p.vel.y < 0)) continue;
    if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
    pukedOn(ctx, e, p, part);
    return false;
  }
  const floor = floorBelow(state, p.pos.x + G / 2, p.pos.y);
  if (p.vel.y > 0 && p.pos.y + p.height >= floor) { splat(state, p.pos.x + G / 2, floor); return false; }
  const b = blockAt(state, p.pos.x, p.pos.y, p.width, p.height);
  if (b) {
    // Into a wall (it was clear of it a step ago, across) or up into a ceiling: it sticks there, and drips down
    const across = !wallAt(state, p.pos.x - p.vel.x, p.pos.y, p.width, p.height);
    const x = across ? (p.vel.x > 0 ? b.x : b.x + b.w) : Math.max(b.x, Math.min(b.x + b.w, p.pos.x + G / 2));
    const y = across ? Math.max(b.y, Math.min(b.y + b.h, p.pos.y + G / 2)) : (p.vel.y < 0 ? b.y + b.h : b.y);
    if (!across && p.vel.y >= 0) { splat(state, x, y); return false; }
    stuckGoo(state, x, y, across ? (p.vel.x > 0 ? -1 : 1) : 0);
    return false;
  }
  return true;
};

/** Puke stuck on a wall or a ceiling: a splat of it there, a streak running down from it, and every so often a drop
 *  falling off it to the floor (into a puddle); then it's dried up. `side`: which way the wall's face looks (0: a ceiling). */
let goo: { x: number; y: number; side: number; t: number; next: number; drips: number }[] = [];
const GOO_LIFE = 420;
let drops: { x: number; y: number; vy: number }[] = [];
const stuckGoo = (state: GameState, x: number, y: number, side: number) => {
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x, y }, vel: { x: side * (0.5 + Math.random() * 2), y: (Math.random() - 0.3) * 2 }, life: 12, color: PUKE_COLORS[i % 3], size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('splat', 0.25, 8);
  const near = goo.find(g => Math.abs(g.x - x) < 8 && Math.abs(g.y - y) < 8);
  if (near) { near.t = Math.min(near.t, 60); near.drips = Math.max(0, near.drips - 1); return; }
  goo.push({ x, y, side, t: 0, next: 40 + Math.floor(Math.random() * 50), drips: 0 });
};
const drip = (state: GameState) => {
  for (const g of goo) {
    g.t++;
    if (g.drips < 4 && g.t >= g.next) { g.drips++; g.next = g.t + 50 + Math.floor(Math.random() * 70); drops.push({ x: g.x + g.side * 1.5, y: g.y + (g.side ? Math.min(16, g.t * 0.08) : 3), vy: 0.5 }); }
  }
  goo = goo.filter(g => g.t < GOO_LIFE);
  drops = drops.filter(d => {
    d.vy = Math.min(9, d.vy + 0.3); d.y += d.vy;
    const floor = floorBelow(state, d.x, d.y - d.vy - 1);
    if (d.y >= floor) { splat(state, d.x, floor); return false; }
    return d.y < state.camera.y + 2000;
  });
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

const tick = (ctx: FrameContext, input: { moveUp: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const want = equipped && input.moveUp && !state.player.isDucking ? -DART.up : 0;
  aim += (want - aim) * 0.35;
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
  // Stood in a puddle of it: it stings, a little at a time
  if (state.frame % PUDDLE_STING.every === 0 && puddles.length) {
    for (const e of [...state.enemies]) {
      if (!alive(e) || Math.abs(e.vel.y) > 1) continue;
      const cx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
      if (!puddles.some(q => Math.abs(cx - q.x) < q.w + e.width * 0.3 && Math.abs(fy - q.y) < 6)) continue;
      state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * e.width * 0.6, y: fy - 2 }, vel: { x: 0, y: -0.8 }, life: 14, color: 'rgba(163, 179, 32, 0.8)', size: 2 });
      hurt(ctx, e, PUDDLE_STING.dmg);
    }
  }
  drip(state);
  for (const c of corpses) rotCorpse(ctx, c);
  corpses = corpses.filter(c => c.t < LIE_END + GONE);
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
  // A glob: a lumpy wad of it, three or four lobes stretched out along the way it's going, wobbling; chunks of things in
  // it (carrot, corn, something brown nobody wants to know about); a wet shine on top
  const x = p.pos.x + G / 2, y = p.pos.y + G / 2, a = Math.atan2(p.vel.y, p.vel.x), sd = part.seed;
  const lobes: [number, number, number][] = [[0, 0, 5.2], [-4.5, 1.5 - sd * 3, 3.6 + sd], [3.5, -2 + sd * 2, 3.4], [-1, 3.5, 2.6 + sd * 1.2]];
  c.save(); c.translate(x, y); c.rotate(a);
  const wob = Math.sin(frame * 0.8 + sd * 9);
  for (const [col, g] of [['#3F470A', 1.2], ['#7C8A12', 0], ['#A3B320', -1.2]] as const) {
    c.fillStyle = col;
    for (const [lx, ly, r] of lobes) { c.beginPath(); c.ellipse(lx * (1 + wob * 0.06), ly, Math.max(0.5, r + g + wob * 0.3), Math.max(0.5, r * 0.85 + g - wob * 0.3), 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the bits in it)
  for (let i = 0; i < 3; i++) { const k = (sd * 7 + i * 3.1) % 1; c.fillStyle = BITS[Math.floor((sd * 10 + i) % 4)]; c.fillRect(Math.round(-4 + k * 8), Math.round(-2 + ((k * 5) % 1) * 4), i === 0 ? 3 : 2, 2); }
  c.fillStyle = '#E2EC7A'; c.fillRect(-2, -4, 3, 1); c.fillRect(-5, -1, 1, 1);
  c.restore();
};

const drawOverlay = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // Puddles of it
  for (const q of puddles) {
    c.globalAlpha = q.t > PUDDLE_LIFE - 60 ? (PUDDLE_LIFE - q.t) / 60 : 1;
    c.fillStyle = '#5B6410'; c.beginPath(); c.ellipse(q.x, q.y - 0.5, q.w + 1, 2.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(q.x, q.y - 0.8, q.w, 1.7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7C8A12'; c.beginPath(); c.ellipse(q.x - q.w * 0.35, q.y - 1.6, q.w * 0.3, 1.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#EA7A12'; c.fillRect(q.x - q.w * 0.3, q.y - 2.5, 3, 2); c.fillStyle = '#FACC15'; c.fillRect(q.x + q.w * 0.35, q.y - 2, 2, 2); c.fillStyle = '#78350F'; c.fillRect(q.x + q.w * 0.05, q.y - 2, 2, 1);
    c.fillStyle = '#E2EC7A'; c.fillRect(q.x - q.w * 0.5, q.y - 2, 3, 1);
  }
  c.globalAlpha = 1;
  // Stuck on walls and ceilings: the splat, the streak running down from it, the drop gathering on the end; drops falling
  for (const g of goo) {
    c.globalAlpha = g.t > GOO_LIFE - 60 ? (GOO_LIFE - g.t) / 60 : 1;
    const run = g.side ? Math.min(16, g.t * 0.08) : 3, ox = g.side * 1.5;
    c.fillStyle = '#5B6410'; c.beginPath(); c.ellipse(g.x + ox, g.y, g.side ? 3 : 6, g.side ? 6 : 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(g.x + ox, g.y, g.side ? 2 : 5, g.side ? 5 : 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7C8A12'; c.fillRect(g.x + ox - 1, g.y, 2, run);
    const swell = ((g.t - (g.next - 50)) / 50);
    c.fillStyle = '#A3B320'; c.beginPath(); c.arc(g.x + ox, g.y + run, 1.2 + Math.max(0, Math.min(1, swell)) * 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#EA7A12'; c.fillRect(g.x + ox - 2, g.y - 1, 2, 2);
  }
  c.globalAlpha = 1;
  for (const d of drops) { c.fillStyle = '#7C8A12'; c.fillRect(Math.round(d.x) - 1, Math.round(d.y) - 3, 2, 4); c.fillStyle = '#C5D33B'; c.fillRect(Math.round(d.x) - 1, Math.round(d.y) - 3, 1, 1); }
  // The puked to death: green, buckling, spewing, over face first, lying in it with the flies at him
  for (const k of corpses) {
    const ps = corpsePose(k), e = k.e;
    c.save();
    c.globalAlpha = k.t > LIE_END ? Math.max(0, 1 - (k.t - LIE_END) / GONE) : 1;
    c.filter = k.t < FALL_END ? SICK_LOOK[Math.floor(f / 10) % 2] : 'sepia(0.55) hue-rotate(45deg) saturate(1.6) brightness(0.8)';
    if (k.animal) {
      // (turned about its middle: on its back, its middle stays where it was)
      c.translate(k.x, k.y - e.height / 2 * ps.sy); c.scale(ps.sx, ps.sy); c.rotate(k.face * ps.a);
      drawEnemyAt(c, e, state, 0, e.height / 2, 0, k.face);
    } else {
      // (a man, about his feet; lying down, he's lifted by half his thickness: on the floor, not through it)
      c.translate(k.x, k.y - ps.lift * e.width * 0.5 * ps.sx); c.scale(ps.sx, ps.sy);
      drawEnemyAt(c, e, state, 0, 0, k.face * ps.a, k.face);
    }
    c.filter = 'none';
    c.restore();
    if (k.t > FALL_END && k.t < LIE_END) {
      // (the flies)
      const hx = k.animal ? k.x : k.x + k.face * e.height * 0.45, hy = k.animal ? k.y - e.height - 4 : k.y - e.width * 0.6 - 6;
      for (let i = 0; i < 3; i++) {
        const a = f * (0.17 + i * 0.03) + i * 2.1, fx = hx + Math.cos(a) * (8 + i * 3), fy = hy + Math.sin(a * 1.3) * 5 - i * 3;
        c.fillStyle = '#0B0B0F'; c.fillRect(Math.round(fx), Math.round(fy), 2, 2);
        if (f % 4 < 2) { c.fillStyle = 'rgba(226, 232, 240, 0.7)'; c.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 1, 1); c.fillRect(Math.round(fx) + 2, Math.round(fy) - 1, 1, 1); }
      }
    }
  }
  // Darts stuck in people (they go with him, leaning the way he leans) and in walls
  for (const d of stuck) {
    if (d.t > STUCK_LIFE - 40 && d.t % 4 < 2) continue;
    if (!d.e) { drawDart(c, d.x, d.y, d.a); continue; }
    const e = d.e;
    const fx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
    let lx = e.pos.x + d.x * e.width - fx, ly = e.pos.y + d.y * e.height - fy;
    const lean = e.pose?.lean ?? 0;
    // (turned round to throw up on somebody: they go round with him)
    const turned = !!e.pose?.face && !!e.kind && kindFacing(e, state) !== e.pose.face;
    let a = d.a;
    if (turned) { lx = -lx; a = Math.PI - a; }
    const cs = Math.cos(lean), sn = Math.sin(lean);
    [lx, ly] = [lx * cs - ly * sn, lx * sn + ly * cs];
    drawDart(c, fx + lx + Math.cos(a) * 2, fy + ly + Math.sin(a) * 2, a + lean, 9);
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
    // Sick: a green queasy face over his head (no bar: there's no wearing him down any more till he's over it), the
    // drool, the stink lines coming off him, and his HURK!
    if (s.t >= 0) {
      const bob = Math.sin(f * 0.2 + e.pos.x) * 2, x = Math.round(e.pos.x + e.width / 2), y = Math.round(top - 4 + bob), sw = Math.sin(f * 0.35) * 0.18;
      c.save(); c.translate(x, y); c.rotate(sw);
      c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = f % 20 < 10 ? '#84CC16' : '#A3B320'; c.beginPath(); c.arc(0, 0, 6.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D9F99D'; c.fillRect(-4, -5, 3, 1);
      // (eyes screwed up, cheeks puffed, a wobbly mouth)
      c.fillStyle = INK; c.fillRect(-4, -2, 3, 1); c.fillRect(1, -2, 3, 1);
      c.fillRect(-3, 2, 1, 1); c.fillRect(-2, 3, 1, 1); c.fillRect(-1, 2, 1, 1); c.fillRect(0, 3, 1, 1); c.fillRect(1, 2, 1, 1); c.fillRect(2, 3, 1, 1);
      c.fillStyle = '#4D7C0F'; c.fillRect(-6, 0, 2, 2); c.fillRect(4, 0, 2, 2);
      c.restore();
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
  c.save(); c.rotate(aim);
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
  c.restore();
};

/** Everything going, stopped (through a door). */
export const stopCrossbow = () => {
  aim = 0;
  for (const e of tracked) e.pose = undefined;
  tracked = new Set(); stuck = []; puddles = []; corpses = []; goo = []; drops = [];
};

/** For tests: everybody's tolerance and sickness. */
export const crossbowForTests = (state: GameState) => state.enemies.filter(e => sickness.has(e)).map(e => { const s = sickness.get(e)!; return `${e.kind}:${s.tol.toFixed(1)}/${s.max.toFixed(1)}:${s.t >= 0 ? 'SICK' + s.t : '-'}:${Math.round(e.health)}${s.t >= 0 ? `>${s.target?.kind ?? 'UP'}:face${e.pose?.face}:drawn${e.kind ? kindFacing(e, state) : '?'}` : ''}`; });

export const registerCrossbow = () => registerWeapon('CROSSBOW', { fire: (ctx, input, muzzle) => fire(ctx, input, muzzle), update, draw, drawHeld: c => drawHeld(c), tick: (ctx, input, equipped) => tick(ctx, input, equipped), drawOverlay });
