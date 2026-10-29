// THE CROSSBOW OF PLAGUES (Adventure Land): a jungle crossbow, rattling off darts dipped in something that should have
// stayed in the jungle. Held, it fires fast. A dart's barely a scratch; what's on it is the thing. Everybody's only got
// so much TOLERANCE for it (a bar over his head, going down; the bigger he is, the more he's got), and when it's gone he
// starts throwing up: projectile vomiting, in heaves, at whoever's nearest. He's in no state to fight while he's at it:
// no shooting, no swinging, no coming at Meathead, harmless to bump into; all he does is stand there spewing on his buddy. A face full of it wears down that one's
// tolerance in turn, and in a while he's at it too, on the next, and so on: chain puking. Stick another one and you've
// a new chain going. Nobody about to throw up on, he throws up straight up, and it comes down on him. The puke stings;
// enough of it kills (it's his weapon's kill, a kill line and all). It never touches Meathead. Its puddles sting too, a
// little at a time, anybody stood in one. Puked to death is a death of its own: buckling, one last torrent of it (onto
// whoever's near: it can still pass it on), keeling over face first into it, and lying there with the flies.
// Every enemy gets the animation: rearing back, heaving forward over it, a green look about him, his mouth going.
// A boss or a mid-boss never gets sick on it (unless his own fight says otherwise: setDartTaker; HELICOPTER HARRY's
// does, the user's opt-in: his weakness, and his fight does what it does to him): the darts just hit him harder, a
// machine gun (BOSS_DART_DMG; a sub-boss, its share of that: weapons/subBoss.ts). One opted in (weapons/half.ts: the
// Ensemble Cast) does get sick, at half: the darts' extra hurt at a sub-boss's share, and half as many heaves; it dies
// its own fight's way (never puked to death).

import type { Enemy, Projectile } from '../../m1/types';
import { poofEnemy } from '../../m1/game/core/cartoonKills';
import { shieldStops, clang } from './shield';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { KIND_HEAD, KIND_TOP_REACH, kindFacing, isHumanoidKind } from '../../m1/game/render/enemies';
import { CANVAS_WIDTH } from '../../m1/constants';
import * as H from './heldArt';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { drawEnemyAt, setHeldFilter } from '../moves/grab';
import { drawComposited } from '../../m1/game/render/composite';
import { isRobot } from '../kinds';
import { specialsHalf, specialsOff, realMax, HALF } from './half';
import { subBossDmg } from './subBoss';
import { drawGooPuddle, drawGooOverhang, drawGooString, gooOverhangDrips, type GooPalette } from '../../m1/game/render/goo';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** The darts: the wait between them, how fast, how much they hurt (not much), and how much tolerance each takes. */
const DART = { cooldown: 7, speed: 17, dmg: 2, sick: 1, gravity: 0.05, up: 0.55, down: 0.8 };
/** A dart in a boss or a mid-boss: what's on it does nothing to him (no tolerance, no puking), but it hits harder: a
 *  machine gun. 14 a dart, a dart every 7 frames: ~120 a second, about the ray gun's 125 (25 every 12). */
const BOSS_DART_DMG = 14;
/** Through a shield: this share of a dart's scratch and its dose gets to him (it takes that many more). */
const SHIELD_THROUGH = 0.35;
/** Up or down held: the bow looks for somebody to lock on to (up: up in the air; down: on the ground), out in front,
 *  on the screen, this far off at most. */
const LOCK_REACH = 560;
let locked: Enemy | null = null;
/** A boss whose own fight takes the darts (opted in to the sickness: the user's call per boss): it's handed each dart
 *  that sticks in him (true: dealt with, instead of the boss rule's plain hit), and the bow locks on to him. */
const dartTakers = new Map<string, (ctx: FrameContext, e: Enemy) => boolean>();
export const setDartTaker = (kind: string, take: (ctx: FrameContext, e: Enemy) => boolean) => { dartTakers.set(kind, take); };
const takerOf = (e: Enemy) => (e.kind ? dartTakers.get(e.kind) : undefined);
const airborne = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || (e.vel.y !== 0 && Math.abs(e.vel.y) > 0.5);
const lockOn = (state: GameState, up: boolean): Enemy | null => {
  const pl = state.player, f = pl.facing, mx = pl.pos.x + pl.width / 2;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (!alive(e) || (specialsOff(e) && !takerOf(e))) continue;
    const dx = (e.pos.x + e.width / 2 - mx) * f;
    if (dx < 10 || dx > LOCK_REACH || e.pos.x + e.width < state.camera.x || e.pos.x > state.camera.x + CANVAS_WIDTH) continue;
    // (up: whoever's in the air, or stood up over him, on a floor he could jump up through, say; down: whoever's on the
    // ground at his level or under him)
    const over = e.pos.y + e.height < pl.pos.y + 12;
    if ((airborne(e) || over) !== up) continue;
    const ey = e.pos.y + e.height / 2, my = pl.pos.y + pl.height / 2;
    // (and a clear shot at him: a floor the darts go up through's fine, a solid one isn't)
    let clear = true;
    for (let k = 1; k < 12 && clear; k++) { const u = k / 12; if (blockAt(state, mx + dx * f * u - 1, my + (ey - my) * u - 1, 2, 2)) clear = false; }
    if (!clear) continue;
    const d = Math.hypot(dx, ey - my);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};
/** Where its tip is from the grip (as the engine's muzzle has it); how far it's tilted up right now (up held: it
 *  swings up, let go: back down level). */
const TIP = { x: 27, y: -4 };
let aim = 0;
/** Looks only: his animation's frame at the last shot (the string snapping forward, humming; the skull kicked about). */
let firedAt = -1000;
/** Tolerance: a few darts' worth, and more by how much of him there is. Unhit a while, it comes back. */
const tolMax = (e: Enemy) => 2 + realMax(e) / 35;
const REGEN_AFTER = 120, REGEN = 0.03;
/** Being sick: so many heaves, each this long (rearing back, spewing, getting his breath). After, a short spell he's
 *  over it, then he can be got again. */
const HEAVE = 90, HEAVES = 4, REAR = 14, SPEW_END = 72, IMMUNE = 90;
/** The puke: a glob every so often while he's spewing; what one does to whoever it lands on (his own, coming down on
 *  him, hurts a bit more); how far he'll look for somebody to throw up on. */
// (a bit harder, the user's: a good hurling should be a sure kill; was 1.1 and 1)
const PUKE = { every: 2, gravity: 0.35, dmg: 1.5, selfDmg: 1.4, sick: 0.6, reach: 460 };
/** How green he looks, sick. */
/** ...a robot, sick: on the fritz (flickering, washed out). */
const ROBOT_SICK_LOOK = ['saturate(0.3) brightness(1.25)', 'saturate(0.6) brightness(0.8) contrast(1.4)'];
const SICK_LOOK = ['sepia(0.6) hue-rotate(42deg) saturate(2.3)', 'sepia(0.7) hue-rotate(48deg) saturate(2.8) brightness(0.92)'];
/** ...and before it comes up: going green round the gills as his tolerance goes (a touch, then more). */
const QUEASY_LOOK = ['sepia(0.25) hue-rotate(40deg) saturate(1.4)', 'sepia(0.45) hue-rotate(44deg) saturate(1.9)'];

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
  /** While he's sick, his own goings-on held off (and harmless): what he was before, to put back after. */
  held: { puppet?: boolean; harmless?: boolean } | null;
  /** Worn at but not sick yet: the queasy sway's on him (looks only: queasy()). */
  queasy?: boolean;
}
const sickness = new WeakMap<Enemy, Sick>();
const sickOf = (e: Enemy) => { let s = sickness.get(e); if (!s) { s = { tol: tolMax(e), max: tolMax(e), lastHit: -999, t: -1, immuneUntil: 0, target: null, dir: 1, doused: 0, hurk: 0, held: null }; sickness.set(e, s); } return s; };
/** Everybody being (or that's been) got at, for the tick and the drawing (the WeakMap can't be walked). */
let tracked = new Set<Enemy>();

/** A dart: `down`, shot down at him from up in the air (over a shield: it's an overhead shot). */
type Part = { kind: 'dart'; down?: boolean; seed?: number } | { kind: 'puke'; from: Enemy; self: boolean; t: number; seed: number };
const partOf = (p: Projectile) => p.customData as Part;

/** Darts stuck in somebody (where on him, at what angle), or in a wall; puddles of it. */
let stuck: { e: Enemy | null; x: number; y: number; a: number; t: number }[] = [];
/** A puddle of it (like Meathead 1's sludge): `x` its middle, `w` half its width, `y` the floor it's on; it runs no
 *  further than whatever it's lying on does (`lo`, `hi`). Up on a drop-through ledge it soaks through (`ledge`: the
 *  ledge's underside), dripping off the bottom of it onto whatever's under it, and the first of it coming through in a
 *  string (`soak`: when). */
interface Puddle { x: number; y: number; w: number; t: number; seed: number; lo: number; hi: number; ledge?: { y: number; x1: number; x2: number }; soak: number }
let puddles: Puddle[] = [];
const STUCK_LIFE = 360, PUDDLE_LIFE = 480, PUDDLE_MAX = 46, MAX_PUDDLES = 80;
/** How long it takes to soak through a ledge before the first string of it comes through. */
const SOAK = 16;
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
  let a = aim + (Math.random() - 0.5) * 0.04;
  // (off the tip, wherever it's pointing: turned about the grip)
  const grip = { x: muzzle.x - dir * TIP.x, y: muzzle.y - TIP.y };
  const tx = TIP.x * Math.cos(aim) - TIP.y * Math.sin(aim), ty = TIP.x * Math.sin(aim) + TIP.y * Math.cos(aim);
  const from = { x: grip.x + dir * tx, y: grip.y + ty };
  // (locked on: straight at the middle of him, a touch high for the dart's drop)
  if (locked && alive(locked) && state.enemies.includes(locked)) {
    const dx = (locked.pos.x + locked.width / 2 - from.x) * dir, t = Math.max(1, Math.abs(dx) / DART.speed);
    const dy = locked.pos.y + locked.height / 2 - from.y - 0.5 * DART.gravity * t * t;
    a = Math.atan2(dy, Math.max(1, dx));
  }
  state.projectiles.push({
    id: `dart-${state.frame}-${Math.random()}`, pos: { x: from.x - 5, y: from.y - 1.5 }, vel: { x: dir * Math.cos(a) * DART.speed, y: Math.sin(a) * DART.speed },
    width: 10, height: 3, health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'CROSSBOW', customData: { kind: 'dart', down: aim > DART.down * 0.5, seed: Math.random() } satisfies Part,
  });
  pl.shootCooldown = DART.cooldown;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.CROSSBOW--;
  playSound('twang');
  firedAt = state.playerAnimFrame;
};

/** A dart in him: a scratch, and the stuff on it working on him. */
const darted = (ctx: FrameContext, e: Enemy, p: Projectile, through = 1) => {
  const { state } = ctx;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  stuck.push({ e, x: Math.max(0.1, Math.min(0.9, (cx - e.pos.x) / e.width)), y: Math.max(0.1, Math.min(0.9, (cy - e.pos.y) / e.height)), a: Math.atan2(p.vel.y, p.vel.x), t: 0 });
  if (stuck.filter(s => s.e === e).length > 12) stuck.splice(stuck.findIndex(s => s.e === e), 1);
  for (let i = 0; i < 2; i++) puff(state, { pos: { x: cx, y: cy }, vel: { x: -Math.sign(p.vel.x) * Math.random() * 2, y: -Math.random() * 2 }, life: 12, color: i ? '#B91C1C' : '#84CC16', size: 1.5 });
  playSound('click', 0.4, 10);
  { const take = takerOf(e); if (take && take(ctx, e)) return; }
  // (a sub-boss: its share of it, in hurt; the Ensemble Cast's share stands in for the half it was)
  if (specialsOff(e)) { const n = hurt(ctx, e, BOSS_DART_DMG); e.hitFlash = 2; ctx.fx.spawnDamageNumber(e.pos, Math.round(n)); return; }
  if (specialsHalf(e)) { hurt(ctx, e, BOSS_DART_DMG * through); e.hitFlash = 2; }
  else hurt(ctx, e, DART.dmg * through);
  if (!alive(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.lastHit = state.frame;
  if (s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= DART.sick * through; if (s.tol <= 0) getSick(state, e, s); }
};

/** Hurt by it (a dart, the puke, a puddle of it): dead of any of it, it's the plague that got him: puked to death. A
 *  sub-boss takes its share of any of it (weapons/subBoss.ts). What it took, back. */
const hurt = (ctx: FrameContext, e: Enemy, dmg: number) => {
  dmg = subBossDmg(e, dmg, false);
  e.health -= dmg;
  if (e.health > 0 || isMidBoss(e)) return dmg;
  pukedToDeath(ctx, e);
  return dmg;
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
  // (cartoon kills: a puff, no body)
  if (state.cartoonKills) {
    poofEnemy(state, e);
    fx.spawnPickup(e.pos); fx.speakVulgarity(m2Kill('plague_kill')); fx.spawnKillCallout(e, grabCallout('plague'));
    state.player.killSatisfactionTimer = 60;
    return;
  }
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
  if (c.t >= BUCKLE && c.t < TORRENT_END && globs < MAX_GLOBS) {
    globs++;
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
    const robot = isRobot(e);
    if (y < c.y + 60 && !robot) pool(state, at, y, Math.max(14, e.height * 0.4));
    for (let i = 0; i < 8; i++) puff(state, { pos: { x: at, y: c.y - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 2.5 }, life: robot ? 120 : 18, color: robot ? OIL_BITS[i % 3] : PUKE_COLORS[i % 3], size: 3 + Math.random() * 2, grav: 0.3, chunk: robot });
  }
};

/** Over it (or gone): himself again, as he was. */
const recover = (e: Enemy, s: Sick) => { if (!s.held) return; e.puppet = s.held.puppet; e.harmless = s.held.harmless; s.held = null; };

/** His tolerance gone: he's going to be sick. */
const getSick = (state: GameState, e: Enemy, s: Sick) => {
  s.t = 0; s.tol = 0; s.hurk = 36; s.target = null;
  if (!s.held) { s.held = { puppet: e.puppet, harmless: e.harmless }; e.puppet = true; e.harmless = true; }
  playSound('retch');
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Being sick

/** Nothing solid between (ax, ay) and (bx, by): a wall, a floor, a ceiling (pits and one-way ledges don't block). */
const seesTo = (state: GameState, ax: number, ay: number, bx: number, by: number) => {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 8));
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.oneWay) continue;
    if (Math.max(ax, bx) < b.x || Math.min(ax, bx) > b.x + b.w || Math.max(ay, by) < b.y || Math.min(ay, by) > b.y + b.h) continue;
    for (let i = 1; i < n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return false;
    }
  }
  return true;
};

/** Somebody to throw up on: the nearest (one not already at it, if there's a choice), close enough, and that he can
 *  see (the user's: not at anybody behind a wall or up through a floor). */
const pickTarget = (state: GameState, e: Enemy) => {
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  let best: Enemy | null = null, score = Infinity;
  for (const o of state.enemies) {
    if (o === e || !alive(o)) continue;
    const d = Math.hypot(o.pos.x + o.width / 2 - cx, o.pos.y + o.height / 2 - cy);
    if (d > PUKE.reach) continue;
    if (!seesTo(state, cx, e.pos.y + e.height * 0.3, o.pos.x + o.width / 2, o.pos.y + o.height / 2)) continue;
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
  if (n >= (specialsHalf(e) ? Math.ceil(HEAVES * HALF) : HEAVES)) { s.t = -1; s.tol = s.max; s.immuneUntil = state.frame + IMMUNE; s.target = null; e.pose = undefined; recover(e, s); return; }
  // (in no state to fight: his AI held off, no shooting, stood there; it's not a daze, no stars)
  e.pauseTimer = Math.max(e.pauseTimer || 0, 2); e.shootTimer = 0; e.vel.x *= 0.6;
  if (cyc === 0 || (s.target && !alive(s.target)) || (s.target && !state.enemies.includes(s.target)) || (s.target && !seesTo(state, e.pos.x + e.width / 2, e.pos.y + e.height * 0.3, s.target.pos.x + s.target.width / 2, s.target.pos.y + s.target.height / 2))) s.target = pickTarget(state, e);
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
  e.pose = { lean, sx, sy, filter: (isRobot(e) ? ROBOT_SICK_LOOK : SICK_LOOK)[Math.floor(state.frame / 10) % 2], face: dir };
  // Spewing: a glob at a time, a long arc onto him (or straight up)
  if (cyc >= REAR && cyc < SPEW_END) {
    if (cyc === REAR || cyc === REAR + 30) playSound('gush');
    if (cyc % PUKE.every === 0 && globs < MAX_GLOBS) {
      globs++;
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

/** Worn at, not sick yet: a sway on him that gets worse the less tolerance he's got left, going green round the gills
 *  (a robot: the odd flicker), the odd string of drool. Looks only: his own goings-on go on as ever. Back to himself
 *  when it's all come back. */
const queasy = (state: GameState, e: Enemy, s: Sick) => {
  const q = 1 - s.tol / s.max;
  if (q <= 0.01) { if (s.queasy) { e.pose = undefined; s.queasy = false; } return; }
  const f = state.frame, ph = e.pos.x * 0.01;
  const lean = Math.sin(f * 0.21 + ph) * 0.045 * q, sy = 1 - Math.abs(Math.sin(f * 0.13 + ph)) * 0.025 * q;
  const filter = isRobot(e) ? (q > 0.6 && (f + Math.floor(ph * 50)) % 23 < 2 ? ROBOT_SICK_LOOK[0] : undefined) : q > 0.66 ? QUEASY_LOOK[1] : q > 0.33 ? QUEASY_LOOK[0] : undefined;
  e.pose = { lean, sx: 1, sy, filter };
  s.queasy = true;
  if (!isRobot(e) && q > 0.5 && Math.random() < 0.02 * q) {
    const m = mouthOf(e, (e.kind ? kindFacing(e, state) : e.facing ?? 1) as number, lean);
    puff(state, { pos: { x: m.x, y: m.y }, vel: { x: 0, y: 0.3 }, life: 20, color: '#C5D33B', size: 1.5, grav: 0.15 });
  }
};

/** One glob of it landing on somebody: it stings, it's all over him, and it's working on him too. */
const pukedOn = (ctx: FrameContext, e: Enemy, p: Projectile, part: Extract<Part, { kind: 'puke' }>) => {
  const { state } = ctx;
  const own = e === part.from;
  const bolt = isRobot(part.from);
  for (let i = 0; i < 6; i++) puff(state, { pos: { x: p.pos.x + G / 2, y: p.pos.y + G / 2 }, vel: { x: -Math.sign(p.vel.x || 1) * Math.random() * 3 + (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2.5 }, life: 18, color: bolt ? (i % 2 ? '#FDE047' : OIL_BITS[i % 3]) : i === 5 ? BITS[i % 4] : PUKE_COLORS[i % 3], size: 3 + Math.random() * 3, grav: 0.3 });
  if (bolt) { if (Math.random() < 0.5) playSound('clink', 0.35, 4); }
  else splashes.push({ x: p.pos.x + G / 2, y: p.pos.y + G / 2, dir: -Math.sign(p.vel.x || 1), t: 0, seed: Math.random() });
  if (splashes.length > MAX_SPLASHES) splashes.shift();
  if (Math.random() < 0.3) playSound('splat', 0.3, 6);
  hurt(ctx, e, own ? PUKE.selfDmg : PUKE.dmg);
  if (!alive(e) || specialsOff(e)) return;
  const s = sickOf(e); tracked.add(e);
  s.doused = 120; s.lastHit = state.frame;
  if (!own && s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= PUKE.sick; if (s.tol <= 0) getSick(state, e, s); }
};

const PUKE_COLORS = ['#A3B320', '#C5D33B', '#7C8A12'];
/** A robot's: oil and metal, not puke. */
const OIL_BITS = ['#0A0A0A', '#4B5563', '#9CA3AF'];
/** A robot's bolt landing (on the floor, off a wall): a clink and a spark, and it lies there a while. */
const boltDown = (state: GameState, p: Projectile) => {
  const x = p.pos.x + G / 2, y = p.pos.y + G / 2;
  for (let i = 0; i < 2; i++) puff(state, { pos: { x, y }, vel: { x: -p.vel.x * 0.2 + (Math.random() - 0.5) * 2, y: -1.5 - Math.random() * 2 }, life: 200, color: i ? '#9CA3AF' : '#6B7280', size: 3, grav: 0.35, chunk: true });
  puff(state, { pos: { x, y }, vel: { x: 0, y: -1 }, life: 6, color: '#FDE047', size: 2 });
  if (Math.random() < 0.4) playSound('clink', 0.3, 6);
};
/** Where a glob's landed on somebody: a splash of it thrown back off him, a few frames (drawn over him: you see it hit). */
let splashes: { x: number; y: number; dir: number; t: number; seed: number }[] = [];
const SPLASH = 12, MAX_SPLASHES = 50;
/** What it can have going at once, so a room full of them at it doesn't bring the game to its knees: so many globs in
 *  the air (past it, a heave just spews thinner), so many specks of it about (past it, no more till there's room). */
const MAX_GLOBS = 70, PARTICLE_BUDGET = 600;
let globs = 0;
const puff = (state: GameState, p: GameState['particles'][number]) => { if (state.particles.length < PARTICLE_BUDGET) state.particles.push(p); };
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
      // (into his shield: it goes through it, but only so much of what's on it gets to him: it takes more of them)
      if (shieldStops(e, p) && !(partOf(p) as { down?: boolean }).down) { clang(state, e, p.pos.y + 1.5); darted(ctx, e, p, SHIELD_THROUGH); return false; }
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
  const bolt = isRobot(part.from);
  if (state.frame % 2 === 0 && Math.random() < 0.6) puff(state, { pos: { x: p.pos.x + Math.random() * G, y: p.pos.y + G / 2 }, vel: { x: p.vel.x * 0.2, y: 0.3 }, life: 12, color: bolt ? OIL_BITS[Math.floor(Math.random() * 3)] : Math.random() < 0.2 ? BITS[Math.floor(Math.random() * 4)] : PUKE_COLORS[Math.floor(Math.random() * 3)], size: 2 + Math.random() * 2, grav: 0.2 });
  for (const e of state.enemies) {
    if (!alive(e)) continue;
    // (his own: only coming back down on him, when he threw it up)
    if (e === part.from && (!part.self || p.vel.y < 0)) continue;
    // (out of his mouth a few frames before it lands on anybody: point blank, you still see it go)
    if (part.t < 4) continue;
    if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
    pukedOn(ctx, e, p, part);
    return false;
  }
  const floor = floorBelow(state, p.pos.x + G / 2, p.pos.y);
  if (p.vel.y > 0 && p.pos.y + p.height >= floor) { if (bolt) boltDown(state, p); else splat(state, p.pos.x + G / 2, floor); return false; }
  const b = blockAt(state, p.pos.x, p.pos.y, p.width, p.height);
  if (b && bolt) { boltDown(state, p); return false; }
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
/** Drops of it falling (off a wall, or through a ledge: `small`, a drip off a ledge's underside). */
let drops: { x: number; y: number; vy: number; small?: boolean }[] = [];
/** The first of a puddle on a ledge coming through it: a string of it stretched down off the underside (`from`), a glob
 *  on the end, slow, till it's too long and lets go (`snap`); it puddles under it as big as the one up there (`w`). */
let strands: { x: number; y: number; vy: number; from: number; w: number; snap: number; seed: number }[] = [];
const stuckGoo = (state: GameState, x: number, y: number, side: number) => {
  for (let i = 0; i < 4; i++) puff(state, { pos: { x, y }, vel: { x: side * (0.5 + Math.random() * 2), y: (Math.random() - 0.3) * 2 }, life: 12, color: PUKE_COLORS[i % 3], size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('splat', 0.25, 8);
  const near = goo.find(g => Math.abs(g.x - x) < 8 && Math.abs(g.y - y) < 8);
  if (near) { near.t = Math.min(near.t, 60); near.drips = Math.max(0, near.drips - 1); return; }
  goo.push({ x, y, side, t: 0, next: 40 + Math.floor(Math.random() * 50), drips: 0 });
};
/** A drip of it off a ledge on somebody's head: this much hurt, this much of his tolerance. */
const DRIP = { dmg: 0.4, sick: 0.2 };
/** Something of it falling through a ledge (a drip; `big`, the string of it letting go) landing on somebody under it:
 *  a splash on him, and it's working on him. True if it landed on somebody. */
const dripHits = (ctx: FrameContext, x: number, y: number, big: boolean) => {
  const { state } = ctx;
  for (const e of state.enemies) {
    if (!alive(e) || x < e.pos.x || x > e.pos.x + e.width || y < e.pos.y || y > e.pos.y + e.height) continue;
    splashes.push({ x, y, dir: Math.random() < 0.5 ? -1 : 1, t: 0, seed: Math.random() });
    if (splashes.length > MAX_SPLASHES) splashes.shift();
    if (Math.random() < (big ? 0.6 : 0.2)) playSound('splat', 0.3, 6);
    hurt(ctx, e, big ? PUKE.dmg : DRIP.dmg);
    if (!alive(e) || specialsOff(e)) return true;
    const s = sickOf(e); tracked.add(e);
    s.doused = Math.max(s.doused, big ? 120 : 50); s.lastHit = state.frame;
    if (s.t < 0 && state.frame >= s.immuneUntil) { s.tol -= big ? PUKE.sick : DRIP.sick; if (s.tol <= 0) getSick(state, e, s); }
    return true;
  }
  return false;
};
const drip = (ctx: FrameContext) => {
  const { state } = ctx;
  for (const g of goo) {
    g.t++;
    if (g.drips < 4 && g.t >= g.next) { g.drips++; g.next = g.t + 50 + Math.floor(Math.random() * 70); drops.push({ x: g.x + g.side * 1.5, y: g.y + (g.side ? Math.min(16, g.t * 0.08) : 3), vy: 0.5 }); }
  }
  goo = goo.filter(g => g.t < GOO_LIFE);
  // Puddles up on drop-through ledges, soaking through (Meathead 1's sludge does): the first of it coming through in a
  // string; after that, drips gathering on the underside and letting go, one after another, as long as it's lying there
  for (const q of puddles) {
    if (!q.ledge || q.t > PUDDLE_LIFE - 60) continue;
    if (q.t === q.soak) strands.push({ x: Math.max(q.ledge.x1 + 4, Math.min(q.ledge.x2 - 4, q.x)), y: q.ledge.y + 2, vy: 0.2, from: q.ledge.y, w: q.w, snap: 30 + Math.random() * 30, seed: Math.random() });
    if (q.t < q.soak) continue;
    const d = gooOverhangDrips(puddleShape(q), q.ledge, state.frame);
    if (d) for (const k of d.drips) if (k.phase === k.letGo) drops.push({ x: k.x, y: q.ledge.y + 14, vy: 1, small: true });
  }
  strands = strands.filter(k => {
    // (stretching, slow; then, too long, it lets go and drops)
    k.vy = k.y - k.from < k.snap ? Math.min(1.2, k.vy + 0.04) : Math.min(10, k.vy + PUKE.gravity);
    k.y += k.vy;
    if (dripHits(ctx, k.x, k.y, true)) return false;
    const floor = floorBelow(state, k.x, k.y - k.vy - 1);
    if (k.y >= floor) { splat(state, k.x, floor, k.w); playSound('splat', 0.35, 4); return false; }
    return k.y < state.camera.y + 2000;
  });
  drops = drops.filter(d => {
    d.vy = Math.min(9, d.vy + 0.3); d.y += d.vy;
    if (d.small && dripHits(ctx, d.x, d.y, false)) return false;
    const floor = floorBelow(state, d.x, d.y - d.vy - 1);
    if (d.y >= floor) { splat(state, d.x, floor); return false; }
    return d.y < state.camera.y + 2000;
  });
};

/** What it's lying on at (x, y): how far that runs either way (on along whatever's flush with it), and if it's a
 *  drop-through ledge, the underside of it (it soaks through). The ground: no end to it. */
const surfaceAt = (state: GameState, x: number, y: number): { lo: number; hi: number; ledge?: Puddle['ledge'] } => {
  const g = groundLineAt(state.groundRuns, x);
  const b = Math.abs(g - y) < 1 ? undefined : state.blocks.find(o => solid(o) && Math.abs(o.y - y) < 1 && x >= o.x - 1 && x <= o.x + o.w + 1);
  if (!b) return { lo: -Infinity, hi: Infinity };
  let lo = b.x, hi = b.x + b.w;
  for (let more = true; more;) {
    more = false;
    for (const o of state.blocks) {
      if (!solid(o) || Math.abs(o.y - y) >= 1) continue;
      if (o.x < lo && o.x + o.w >= lo - 1) { lo = o.x; more = true; }
      if (o.x + o.w > hi && o.x <= hi + 1) { hi = o.x + o.w; more = true; }
    }
  }
  return { lo, hi, ledge: b.oneWay ? { y: b.y + b.h, x1: b.x, x2: b.x + b.w } : undefined };
};

/** It on the floor (on a ledge, on a rock, wherever it's come down): a puddle, or more of one where there's one
 *  already (it spreads; `w`: at least this big). */
const pool = (state: GameState, x: number, y: number, w: number, grow = 0.8) => {
  if (!(y < state.camera.y + 2000)) return;
  const near = puddles.find(q => Math.abs(q.x - x) < q.w && Math.abs(q.y - y) < 4);
  if (near) { near.w = Math.min(PUDDLE_MAX, Math.max(near.w + grow, w)); near.t = Math.min(near.t, 60); return; }
  const on = surfaceAt(state, x, y);
  puddles.push({ x, y, w: Math.min(PUDDLE_MAX, w), t: 0, seed: Math.floor(Math.random() * 997), lo: on.lo, hi: on.hi, ledge: on.ledge, soak: SOAK + Math.floor(Math.random() * 10) });
  if (puddles.length > MAX_PUDDLES) puddles.shift();
};

/** On the floor: a splash, and a puddle (one spreading where there's one already). */
const splat = (state: GameState, x: number, y: number, w = 6 + Math.random() * 4) => {
  for (let i = 0; i < 3; i++) puff(state, { pos: { x, y: y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 1.5 }, life: 12, color: PUKE_COLORS[i], size: 2, grav: 0.3 });
  // (and spatter: a flat splat, droplets thrown out low along the floor: drawOverlay)
  if (spats.length >= MAX_SPATS) spats.shift();
  spats.push({ x, y, t: 0, seed: Math.random() });
  pool(state, x, y, w);
};
/** Where a glob's just hit the floor: the spatter, a few frames. */
let spats: { x: number; y: number; t: number; seed: number }[] = [];
const SPAT = 12, MAX_SPATS = 24;

/** A puddle as the goo drawing has it: no further than what it's on, and thicker the bigger it is. */
const puddleShape = (q: Puddle) => {
  const x0 = Math.max(q.lo, q.x - q.w), x1 = Math.min(q.hi, q.x + q.w), h = 7 + q.w * 0.12;
  return { pos: { x: x0, y: q.y - h }, width: Math.max(4, x1 - x0), height: h, id: 'puke', seed: q.seed };
};
/** Puke, on the level: yellow-green, carrot and corn in it. */
const PUKE_GOO: GooPalette = {
  dark: '#5B6410', mid: '#7C8A12', light: '#A3B320',
  skin: '#C5D33B', skinLit: '#E2EC7A', ink: '#3F470A', sheen: '#F4F8B8',
  fleck: '#5B6410', fleckLit: '#A3B320',
  chunkShadow: '#3F470A', chunkA: '#EA7A12', chunkB: '#FACC15', chunkALit: '#FDBA74', chunkBLit: '#FEF08A',
  bubble: '#C5D33B', bubbleInk: '#5B6410', bubbleLit: '#E2EC7A',
  strand: '#5B6410', strandMid: '#A3B320', strandLit: '#E2EC7A',
};

// ---------------------------------------------------------------------------------------------------------------
// Every frame

const tick = (ctx: FrameContext, input: { moveUp: boolean; moveDown: boolean }, equipped: boolean) => {
  const { state } = ctx;
  // (up: tilted up; down, up in the air: tilted down, at their heads from above; never on a vine)
  const pl = state.player;
  // (hanging off a vine: straight out level, always; up and down are for climbing it)
  // (down only aims (and locks) up in the air; on the ground it's the crouch, a straight shot as ever)
  const up = equipped && input.moveUp && !pl.isDucking, down = equipped && input.moveDown && !pl.isGrounded;
  locked = !pl.vine && (up || down) ? lockOn(state, up) : null;
  let want = !equipped ? 0 : up ? -DART.up : down && !pl.isGrounded ? DART.down : 0;
  if (locked) {
    const dx = (locked.pos.x + locked.width / 2 - (pl.pos.x + pl.width / 2)) * pl.facing, dy = locked.pos.y + locked.height / 2 - (pl.pos.y + pl.height * 0.4);
    want = Math.max(-1.2, Math.min(1.2, Math.atan2(dy, Math.max(1, dx))));
  }
  aim = pl.vine ? 0 : aim + (want - aim) * 0.35;
  globs = 0;
  for (const q of state.projectiles) if (q.custom === 'CROSSBOW' && partOf(q).kind === 'puke') globs++;
  for (const e of tracked) {
    const s = sickness.get(e);
    if (!s || !alive(e) || !state.enemies.includes(e)) {
      // (dead, or picked up: he's not being sick any more; picked up and put down, he's himself again)
      e.pose = undefined; if (s) { s.t = -1; s.tol = s.max; recover(e, s); }
      tracked.delete(e); continue;
    }
    if (s.hurk > 0) s.hurk--;
    if (s.t >= 0) { heave(ctx, e, s); s.queasy = false; }
    else if (state.frame - s.lastHit > REGEN_AFTER) s.tol = Math.min(s.max, s.tol + REGEN);
    if (s.t < 0) queasy(state, e, s);
    // Dripping with it
    if (s.doused > 0) {
      s.doused--;
      if (state.frame % 4 === 0) puff(state, { pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + e.height * (0.2 + Math.random() * 0.6) }, vel: { x: 0, y: 0.6 }, life: 18, color: PUKE_COLORS[Math.floor(Math.random() * 3)], size: 2, grav: 0.2 });
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
      // (on the slope it's lying along, where he's stood)
      if (!puddles.some(q => { const sh = puddleShape(q), g = q.lo === -Infinity ? groundLineAt(state.groundRuns, cx) : q.y; return cx > sh.pos.x - e.width * 0.3 && cx < sh.pos.x + sh.width + e.width * 0.3 && Math.abs(fy - (Math.abs(g - q.y) < 24 ? g : q.y)) < 6; })) continue;
      puff(state, { pos: { x: cx + (Math.random() - 0.5) * e.width * 0.6, y: fy - 2 }, vel: { x: 0, y: -0.8 }, life: 14, color: 'rgba(163, 179, 32, 0.8)', size: 2 });
      hurt(ctx, e, PUDDLE_STING.dmg);
    }
  }
  drip(ctx);
  for (const k of splashes) k.t++;
  splashes = splashes.filter(k => k.t < SPLASH);
  for (const k of spats) k.t++;
  spats = spats.filter(k => k.t < SPAT);
  for (const c of corpses) rotCorpse(ctx, c);
  corpses = corpses.filter(c => c.t < LIE_END + GONE);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A dart: a thin dark shaft, a green-smeared tip, red and green fletching. Drawn along +x, the tip at the origin. */
/** `spin`: in flight, the fletching turning (the vanes going edge on and round, swapping sides), a corkscrew of red and
 *  green specks off it behind, and a sick glint on the tip. */
const drawDart = (c: Ctx, x: number, y: number, a: number, len = 11, spin?: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-len - 1, -1.5, len + 1, 3);
  c.fillStyle = '#A16207'; c.fillRect(-len, -0.5, len - 2, 1);
  c.fillStyle = '#84CC16'; c.fillRect(-3, -1, 3, 2);
  if (spin === undefined) { c.fillStyle = '#DC2626'; c.fillRect(-len - 1, -3, 4, 2); c.fillStyle = '#16A34A'; c.fillRect(-len - 1, 1, 4, 2); }
  else {
    const cs = Math.cos(spin), vh = Math.max(1, Math.round(Math.abs(cs) * 2.5)), top = cs >= 0 ? '#DC2626' : '#16A34A', bot = cs >= 0 ? '#16A34A' : '#DC2626';
    c.fillStyle = top; c.fillRect(-len - 1, -1 - vh, 4, vh); c.fillStyle = bot; c.fillRect(-len - 1, 1, 4, vh);
    for (let i = 1; i <= 3; i++) { c.globalAlpha = 0.75 - i * 0.18; c.fillStyle = i % 2 ? top : bot; c.fillRect(-len - 1 - i * 4, Math.round(Math.sin(spin - i * 1.2) * 2.5) - 0.5, 2, 1); }
    c.globalAlpha = 1;
    c.fillStyle = '#ECFCCB'; c.fillRect(-2, -1, 1, 1);
  }
  c.restore();
};

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const part = partOf(p);
  if (part.kind === 'dart') {
    const tx = p.vel.x > 0 ? p.pos.x + p.width : p.pos.x, ty = p.pos.y + 1.5, sd = part.seed ?? 0;
    drawDart(c, tx, ty, Math.atan2(p.vel.y, p.vel.x), 11, frame * 0.9 + sd * 6);
    // (what's on the tip catching the light: a sickly green twinkle, every so often)
    if ((frame + Math.floor(sd * 12)) % 12 < 3) {
      const gx = Math.round(tx), gy = Math.round(ty);
      c.fillStyle = '#BEF264'; c.fillRect(gx - 3, gy, 7, 1); c.fillRect(gx, gy - 3, 1, 7);
      c.fillStyle = '#FFFFFF'; c.fillRect(gx, gy, 1, 1);
    }
    return;
  }
  // (a machine's: it can't throw up, so it throws up what it's got: nuts and bolts)
  if (isRobot(part.from)) { drawBolt(c, p.pos.x + G / 2, p.pos.y + G / 2, frame * 0.4 + part.seed * 6, part.seed); return; }
  // A glob: a lumpy wad of it, three or four lobes stretched out along the way it's going, wobbling; chunks of things in
  // it (carrot, corn, something brown nobody wants to know about); a wet shine on top
  const x = p.pos.x + G / 2, y = p.pos.y + G / 2, a = Math.atan2(p.vel.y, p.vel.x), sd = part.seed;
  // (behind it, back along the way it came, chunky stepped wads of it on the 2px grid: one glob to the next, a stream)
  for (let i = 3; i >= 1; i--) {
    const k = i * 0.55;
    if (k > part.t) continue;
    const bx = Math.round((x - p.vel.x * k) / 2) * 2, by = Math.round((y - p.vel.y * k - PUKE.gravity * k * k * 0.5) / 2) * 2, r = 5 - i;
    c.fillStyle = '#3F470A'; c.fillRect(bx - r - 1, by - r - 1, r * 2 + 2, r * 2 + 2);
    c.fillStyle = i === 2 ? '#7C8A12' : '#A3B320'; c.fillRect(bx - r, by - r, r * 2, r * 2);
    c.fillStyle = '#C5D33B'; c.fillRect(bx - r, by - r, r, 1);
  }
  const lobes: [number, number, number][] = [[0, 0, 5.2], [-4.5, 1.5 - sd * 3, 3.6 + sd], [3.5, -1 + sd * 2.5, 3.4]];
  c.save(); c.translate(x, y); c.rotate(a);
  const wob = Math.sin(frame * 0.8 + sd * 9);
  for (const [col, g] of [['#3F470A', 1.2], ['#A3B320', 0]] as const) {
    c.fillStyle = col;
    for (const [lx, ly, r] of lobes) { c.beginPath(); c.ellipse(lx * (1 + wob * 0.06), ly, Math.max(0.5, r + g + wob * 0.3), Math.max(0.5, r * 0.85 + g - wob * 0.3), 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the bits in it)
  for (let i = 0; i < 3; i++) { const k = (sd * 7 + i * 3.1) % 1; c.fillStyle = BITS[Math.floor((sd * 10 + i) % 4)]; c.fillRect(Math.round(-4 + k * 8), Math.round(-2 + ((k * 5) % 1) * 4), i === 0 ? 3 : 2, 2); }
  c.fillStyle = '#E2EC7A'; c.fillRect(-2, -4, 3, 1); c.fillRect(-5, -1, 1, 1);
  c.restore();
};

/** A bolt (a hex head, a threaded shank) and a nut with it, tumbling: what a robot barfs. */
const drawBolt = (c: Ctx, x: number, y: number, a: number, sd: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-7, -3, 15, 6);
  c.fillStyle = '#9CA3AF'; c.fillRect(-6, -2, 4, 4);
  c.fillStyle = '#6B7280'; c.fillRect(-2, -1, 9, 2);
  c.fillStyle = '#D1D5DB'; c.fillRect(-6, -2, 4, 1);
  for (let i = 0; i < 4; i++) { c.fillStyle = '#4B5563'; c.fillRect(-1 + i * 2, -1, 1, 2); }
  c.restore();
  const nx = Math.round(x + Math.cos(a * 1.7 + sd * 5) * 6), ny = Math.round(y + Math.sin(a * 1.3) * 4);
  c.fillStyle = INK; c.fillRect(nx - 3, ny - 3, 6, 6);
  c.fillStyle = '#A1A1AA'; c.fillRect(nx - 2, ny - 2, 4, 4);
  c.fillStyle = INK; c.fillRect(nx - 1, ny - 1, 2, 2);
};

/** Each puddle painted the once (all but its bubbles) at the scale it's shown at, kept till it grows or the scale
 *  changes: a crowd puking left the floor covered in puddles that were each a few hundred fills a frame (the user's:
 *  slowdown "when using the crossbow and a ton of people are hurling"). The bubbles are live, over it. */
const baked = new WeakMap<Puddle, { key: string; cv: HTMLCanvasElement; x: number; y: number; w: number; h: number }>();
const PAD_X = 24, PAD_UP = 40, PAD_DOWN = 30;
const drawPuddle = (c: Ctx, state: GameState, q: Puddle, sh: ReturnType<typeof puddleShape>) => {
  const m = c.getTransform(), k = Math.round(Math.hypot(m.a, m.b) * 16) / 16;
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || k <= 0) { drawGooPuddle(c, state, sh, PUKE_GOO); return; }
  const x = Math.floor(sh.pos.x) - PAD_X, base = sh.pos.y + sh.height, y = Math.floor(base) - PAD_UP;
  const w = Math.ceil(sh.width) + PAD_X * 2, h = PAD_UP + PAD_DOWN;
  const key = `${x},${y},${w},${k}`;
  let b = baked.get(q);
  if (!b || b.key !== key) {
    const cv = b?.cv ?? document.createElement('canvas');
    cv.width = Math.ceil(w * k); cv.height = Math.ceil(h * k);
    const g = cv.getContext('2d')!;
    g.setTransform(k, 0, 0, k, -x * k, -y * k);
    drawGooPuddle(g, state, sh, PUKE_GOO, 'still');
    b = { key, cv, x, y, w, h };
    baked.set(q, b);
  }
  c.drawImage(b.cv, b.x, b.y, b.w, b.h);
  drawGooPuddle(c, state, sh, PUKE_GOO, 'bubbles');
};

const drawOverlay = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The lock: brackets round him, closing in and out
  if (locked && alive(locked) && state.enemies.includes(locked)) {
    const e = locked, k = 4 + Math.round(Math.sin(f * 0.3) * 2), x0 = Math.round(e.pos.x) - k, y0 = Math.round(e.pos.y) - k, x1 = Math.round(e.pos.x + e.width) + k, y1 = Math.round(e.pos.y + e.height) + k;
    c.fillStyle = '#84CC16';
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]] as const) { c.fillRect(sx > 0 ? x : x - 8, y - (sy > 0 ? 0 : 2), 8, 2); c.fillRect(x - (sx > 0 ? 0 : 2), sy > 0 ? y : y - 8, 2, 8); }
  }
  // Puddles of it
  // (lying along whatever they're on, like Meathead 1's sludge, in puke; up on a ledge, soaking through and hanging off
  // the underside of it in drips: the drops that let go are real ones, falling, see drip)
  const vx0 = state.camera.x - 80, vx1 = state.camera.x + CANVAS_WIDTH + 80;
  for (const q of puddles) {
    if (q.x + q.w < vx0 || q.x - q.w > vx1) continue;
    c.globalAlpha = q.t > PUDDLE_LIFE - 60 ? (PUDDLE_LIFE - q.t) / 60 : 1;
    const sh = puddleShape(q);
    drawPuddle(c, state, q, sh);
    if (q.ledge && q.t >= q.soak) drawGooOverhang(c, sh, q.ledge, f, PUKE_GOO, 0);
  }
  // (steam coming up off them, warm still: a couple of wisps of stepped specks a puddle, wavering, fading as they go;
  // the nearest dozen or so)
  let steamed = 0;
  for (const q of puddles) {
    if (steamed >= 14 || q.x + q.w < vx0 || q.x - q.w > vx1 || q.t > PUDDLE_LIFE - 90) continue;
    steamed++;
    const sh = puddleShape(q), warm = q.t < 30 ? q.t / 30 : 1;
    for (let w = 0; w < 2; w++) {
      const ph = (f * 0.012 + q.seed * 0.137 + w * 0.5) % 1, sx = sh.pos.x + sh.width * (0.25 + w * 0.5 + ((q.seed * (w + 3)) % 10) * 0.01);
      c.globalAlpha = (1 - ph) * 0.4 * warm;
      c.fillStyle = '#E2EC7A';
      for (let d = 0; d < 3; d++) c.fillRect(Math.round(sx + Math.sin(ph * 6 + d * 0.8 + w) * 2.5), Math.round(q.y - 8 - ph * 22 - d * 4), 2, 2);
    }
  }
  c.globalAlpha = 1;
  // (the spatter where a glob's just hit the floor: a flat splat and droplets thrown out low either side)
  for (const k of spats) {
    const a = k.t / SPAT;
    c.globalAlpha = 1 - a * 0.7;
    if (k.t < 5) { c.fillStyle = '#3F470A'; c.fillRect(Math.round(k.x) - 6, Math.round(k.y) - 2, 12, 2); c.fillStyle = '#A3B320'; c.fillRect(Math.round(k.x) - 5, Math.round(k.y) - 2, 10, 1); }
    for (let i = 0; i < 6; i++) {
      const sd = i % 2 ? 1 : -1, sp = 1.2 + ((k.seed * 7 + i * 0.37) % 1) * 1.6, up = 1.4 + ((k.seed * 3 + i * 0.61) % 1) * 1.4;
      const dx = sd * sp * k.t, dy = -up * k.t + 0.3 * k.t * k.t;
      if (dy > 0) continue;
      c.fillStyle = i < 2 ? '#C5D33B' : PUKE_COLORS[i % 3]; c.fillRect(Math.round(k.x + dx), Math.round(k.y - 2 + dy), 2, 2);
    }
  }
  c.globalAlpha = 1;
  // Strings of it coming through a ledge, a glob on the end
  for (const k of strands) {
    const r = 3 + Math.min(3, k.w * 0.08);
    if (k.y - k.from < k.snap) drawGooString(c, { pos: { x: k.x - r, y: k.y - r }, width: r * 2, height: r * 2 }, k.from, PUKE_GOO);
    c.fillStyle = '#3F470A'; c.beginPath(); c.ellipse(k.x, k.y, r + 1, r + 1.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(k.x, k.y, r, r + 0.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BITS[Math.floor(k.seed * 4)]; c.fillRect(Math.round(k.x - 1), Math.round(k.y), 2, 2);
    c.fillStyle = '#E2EC7A'; c.fillRect(Math.round(k.x - r * 0.5), Math.round(k.y - r * 0.6), 2, 1);
  }
  // Splashes on people: a flat splat on him, and a crown of droplets thrown back the way it came
  for (const k of splashes) {
    const a = k.t / SPLASH, reach = 16 * Math.sqrt(a), r = 3.2 * (1 - a * 0.5);
    c.globalAlpha = 1 - a * 0.6;
    c.fillStyle = '#3F470A'; c.beginPath(); c.ellipse(k.x, k.y, 6 + a * 4, 5 + a * 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A3B320'; c.beginPath(); c.ellipse(k.x, k.y, 4.5 + a * 4, 3.8 + a * 2, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 6; i++) {
      const ang = (k.dir > 0 ? 0 : Math.PI) + (i / 5 - 0.5) * 2.2 + (k.seed - 0.5) * 0.4;
      const x = k.x + Math.cos(ang) * reach, y = k.y + Math.sin(ang) * reach - 4 * a + a * a * 8;
      c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 0.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = i % 2 ? '#C5D33B' : '#A3B320'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = BITS[Math.floor(k.seed * 4)]; c.fillRect(k.x - 1, k.y - 1, 3, 2);
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
    // (green: put on him once, the whole of him, not shape by shape)
    const filter = k.t < FALL_END ? SICK_LOOK[Math.floor(f / 10) % 2] : 'sepia(0.55) hue-rotate(45deg) saturate(1.6) brightness(0.8)';
    const r = Math.max(e.width, e.height) * 1.3 + 30;
    drawComposited(c, { x: k.x - r, y: k.y - r, w: r * 2, h: r + 20 }, g => {
      if (k.animal) {
        // (turned about its middle: on its back, its middle stays where it was)
        g.translate(k.x, k.y - e.height / 2 * ps.sy); g.scale(ps.sx, ps.sy); g.rotate(k.face * ps.a);
        drawEnemyAt(g, e, state, 0, e.height / 2, 0, k.face);
      } else {
        // (a man, about his feet; lying down, he's lifted by half his thickness: on the floor, not through it)
        g.translate(k.x, k.y - ps.lift * e.width * 0.5 * ps.sx); g.scale(ps.sx, ps.sy);
        drawEnemyAt(g, e, state, 0, 0, k.face * ps.a, k.face);
      }
    }, { filter });
    c.restore();
    if (k.t > FALL_END && k.t < LIE_END) {
      // (the flies: turning up one at a time, five at most, looping figure eights over him; the odd one landing on him a
      // while, rubbing its hands; the stink coming off him)
      const lay = k.t - FALL_END, fade = k.t > LIE_END - 40 ? (LIE_END - k.t) / 40 : 1;
      const hx = k.animal ? k.x : k.x + k.face * e.height * 0.45, hy = k.animal ? k.y - e.height - 4 : k.y - e.width * 0.6 - 6;
      const n = Math.min(5, 1 + Math.floor(lay / 30));
      c.globalAlpha = fade;
      for (let i = 0; i < n; i++) {
        const a = f * (0.17 + i * 0.03) + i * 2.1;
        let fx = hx + Math.cos(a) * (8 + i * 3), fy = hy + Math.sin(a * 2) * 4 - i * 3;
        // (landed: on him, somewhere along him, sat there)
        const cyc = (f + i * 37) % 150, sits = i % 2 === 1 && cyc < 50, land = sits ? Math.min(1, Math.min(cyc, 50 - cyc) / 8) : 0;
        if (land > 0) {
          const sx = k.animal ? k.x + (i - 2) * e.width * 0.15 : k.x + k.face * e.height * (0.2 + i * 0.12), sy = k.animal ? k.y - e.height * 0.85 : k.y - e.width * 0.55;
          fx += (sx - fx) * land; fy += (sy - fy) * land;
        }
        c.fillStyle = '#0B0B0F'; c.fillRect(Math.round(fx), Math.round(fy), 2, land >= 1 ? 1 : 2);
        if (land >= 1) { if ((f >> 3) % 3 === 0) { c.fillStyle = '#0B0B0F'; c.fillRect(Math.round(fx) + (f % 2 ? -1 : 2), Math.round(fy), 1, 1); } }
        else if (f % 4 < 2) { c.fillStyle = 'rgba(226, 232, 240, 0.7)'; c.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 1, 1); c.fillRect(Math.round(fx) + 2, Math.round(fy) - 1, 1, 1); }
      }
      const sx = k.animal ? k.x : k.x + k.face * e.height * 0.3, sy = k.animal ? k.y - e.height * 0.8 : k.y - e.width * 0.5;
      for (let i = 0; i < 2; i++) {
        const ph = (f * 0.02 + i / 2) % 1, x = sx + (i ? 6 : -6), y = sy - ph * 18;
        c.strokeStyle = `rgba(163, 179, 32, ${(0.55 * (1 - ph) * fade).toFixed(2)})`; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 3, x, y - 6); c.quadraticCurveTo(x - 3, y - 9, x, y - 12); c.stroke();
      }
      c.globalAlpha = 1;
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
      // (just hit: the bar jolts and flashes, and what's in it sloshes, settling)
      const since = f - s.lastHit, jolt = since < 6 ? (since % 2 ? 1 : -1) : 0, slosh = 0.6 + 2 * Math.max(0, 1 - since / 36);
      const bx = x + jolt;
      c.fillStyle = since < 4 ? '#ECFCCB' : INK; c.fillRect(bx - 1, y - 1, w + 2, 6);
      c.fillStyle = '#3F3F46'; c.fillRect(bx, y, w, 4);
      // (liquid, not a plain bar: in rows, a stepped ramp top to bottom, its end slopping back and forth row by row)
      const fw = w * k, low = k < 0.3, blink = f % 8 < 4;
      const rows = low ? (blink ? ['#E2EC7A', '#A3B320', '#A3B320', '#7C8A12'] : ['#F4F8B8', '#E2EC7A', '#E2EC7A', '#A3B320']) : ['#BEF264', '#65A30D', '#65A30D', '#3F6212'];
      for (let r = 0; r < 4; r++) {
        const end = Math.round(fw + Math.sin(f * 0.3 + r * 0.9 + e.pos.x * 0.05) * slosh * Math.min(1, fw / 4));
        if (end <= 0) continue;
        c.fillStyle = rows[r]; c.fillRect(bx, y + r, Math.min(w, end), 1);
      }
      // (a bubble or two drifting in it)
      if (fw > 4) { c.fillStyle = '#ECFCCB'; for (let i = 0; i < 2; i++) c.fillRect(bx + Math.floor((f * (0.4 + i * 0.25) + e.pos.x + i * 13) % Math.max(1, fw - 2)), y + 1 + i, 1, 1); }
      // (and a little green face at the end of it, going greener, wobbling worse)
      const fy = y + Math.round(Math.sin(f * 0.4 + e.pos.x) * (1 - k) * 1.5);
      c.fillStyle = INK; c.fillRect(bx - 9, fy - 2, 7, 8); c.fillStyle = k < 0.5 ? '#A3B320' : '#FCD34D'; c.fillRect(bx - 8, fy - 1, 5, 6);
      c.fillStyle = INK; c.fillRect(bx - 7, fy + 1, 1, 1); c.fillRect(bx - 5, fy + 1, 1, 1); c.fillRect(bx - 7, fy + 3, 3, 1);
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

/** In his fist: a jungle crossbow. A bamboo stock (lit along the top, its nodes ridged), a leather-wrapped grip, a bow
 *  of bent horn lashed across the front with twine; the string humming after every shot, snapping forward and drawn
 *  back, a dart nocked in the groove (fletched, its tip green with the stuff, a sickly bead forming and dripping off
 *  it); a little skull hanging off it on a cord, swinging. The stock, bow and skull are stamps (heldArt.ts). */
const paintBow = (g: Ctx) => {
  // (the grip: leather wrapped round, stitched)
  H.box(g, -3, -2, 6, 10, INK);
  H.box(g, -2, -1, 4, 8, '#7C2D12');
  for (let y = -1; y < 7; y += 1.6) { H.poly(g, [[-2, y], [2, y + 0.8], [2, y + 1.4], [-2, y + 0.6]], '#9A3412'); H.box(g, -2, y, 1.2, 0.4, '#C2410C'); }
  H.box(g, 1.4, -1, 0.6, 8, '#431407');
  for (let y = 0; y < 7; y += 2) H.box(g, -0.4, y + 0.4, 0.4, 0.4, '#FDBA74');
  // (the stock: bamboo, banded from the lit top down, grained; its nodes ridged and lit)
  H.box(g, -3, -5, 27, 6, INK);
  H.box(g, -2, -4, 25, 4, '#CA8A04');
  H.box(g, -2, -4, 25, 0.6, '#FDE047'); H.box(g, -2, -3.4, 25, 0.6, '#EAB308'); H.box(g, -2, -1.6, 25, 0.6, '#A16207'); H.box(g, -2, -1, 25, 1, '#854D0E');
  for (const x of [1, 9, 15, 20]) H.box(g, x + H.hash(x) * 2, -2.6, 2.6, 0.35, '#B45309');
  for (const x of [6, 12]) { H.box(g, x - 0.2, -5.5, 2.4, 7, INK); H.box(g, x, -5, 2, 6, '#78350F'); H.box(g, x, -5, 0.6, 6, '#B45309'); H.box(g, x, -5, 2, 0.5, '#FDE68A'); }
  // (the bow: bent horn, inked, a dark side and a lit one, ridged; dark nocks on its tips)
  const arc = (w: number, col: string, dx = 0) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(16 + dx, -14); g.quadraticCurveTo(23 + dx, -2, 16 + dx, 10); g.stroke(); };
  arc(3.5, INK); arc(2.2, '#A8A29E'); arc(1, '#F5F5F4', -0.5);
  for (let t = 0.12; t < 0.95; t += 0.11) {
    const x = (1 - t) * (1 - t) * 16 + 2 * (1 - t) * t * 23 + t * t * 16, y = (1 - t) * (1 - t) * -14 + 2 * (1 - t) * t * -2 + t * t * 10;
    H.box(g, x - 0.2, y, 1, 0.35, '#78716C');
  }
  H.ell(g, 16, -14, 1.2, 1.2, INK); H.ell(g, 16, 10, 1.2, 1.2, INK); H.box(g, 15.6, -14.6, 0.6, 0.6, '#78716C');
  // (the twine lashing it to the stock)
  H.box(g, 15, -5.8, 4.6, 7.4, INK);
  H.box(g, 15.5, -5.3, 3.6, 6.4, '#A8A29E');
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(15.5, -5); g.lineTo(19, 0.8); g.moveTo(19, -5); g.lineTo(15.5, 0.8); g.moveTo(15.5, -2.2); g.lineTo(19, -2.2); g.stroke();
  H.box(g, 15.5, 0.6, 3.6, 0.5, '#57534E');
};
const paintSkull = (g: Ctx) => {
  g.strokeStyle = '#78350F'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(4, 1); g.lineTo(4, 6.4); g.stroke();
  H.box(g, 3.4, 2.6, 1.2, 0.8, '#A16207');
  H.box(g, 1, 6, 7, 6, INK);
  H.box(g, 2, 7, 5, 4, '#E7E0CC'); H.box(g, 2, 7, 5, 1, '#FFFBEB'); H.box(g, 2, 7, 1, 3, '#F5F0E1'); H.box(g, 6.2, 8, 0.8, 3, '#B8AE94'); H.box(g, 2, 10.4, 5, 0.6, '#B8AE94');
  H.box(g, 3, 8, 1.2, 1.2, INK); H.box(g, 5, 8, 1.2, 1.2, INK);
  H.box(g, 4.4, 9.4, 0.4, 0.5, '#57534E');
  for (const x of [2.6, 3.8, 5, 6]) H.box(g, x, 10.6, 0.4, 0.8, INK);
  H.box(g, 5.6, 7, 0.4, 1, '#78716C');
};
const drawHeld = (c: Ctx, frame: number) => {
  const a = frame - firedAt;
  c.save(); c.rotate(aim);
  H.snapOrigin(c);
  // (the skull swinging on its cord: kicked about by the shots)
  const sw = Math.sin(frame * 0.07) * 0.14 + (a >= 0 && a < 16 ? Math.sin(a * 0.8) * 0.4 * (1 - a / 16) : 0);
  c.save(); c.translate(4, 1); c.rotate(sw); c.translate(-4, -1);
  H.heldStamp(c, 'xbow:skull', 0, 0, 9, 13, paintSkull);
  c.restore();
  H.heldStamp(c, 'xbow', -4, -16, 29, 28, paintBow);
  // The string: let go, it snaps forward and shivers; then it's drawn back and the next dart's dropped in; cocked, it
  // hums a while after
  let mid = 9, nocked = true;
  if (a >= 0 && a < 3) { mid = 16.4 + Math.sin(a * 2.6) * 1.4 * (1 - a / 3); nocked = false; }
  else if (a >= 3 && a < 7) { mid = 16.4 - (16.4 - 9) * ((a - 3) / 4); nocked = a >= 5; }
  else if (a >= 7 && a < 40) mid = 9 + Math.sin(a * 1.9) * 0.6 * (1 - (a - 7) / 33);
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(16, -14); c.lineTo(mid, -2); c.lineTo(16, 10); c.stroke();
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.6; c.stroke();
  c.lineCap = 'butt';
  if (nocked) {
    // the dart: fletched at the nock, the shaft lit, the tip green with the stuff, the stuff smeared down the shaft
    const x0 = Math.min(mid, 11);
    c.fillStyle = INK; c.fillRect(x0 - 0.5, -4.6, 28 - x0, 2);
    c.fillStyle = '#A16207'; c.fillRect(x0, -4, 26 - x0, 1); c.fillStyle = '#FDE68A'; c.fillRect(x0, -4, 26 - x0, 0.35);
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(x0, -4); c.lineTo(x0 + 3, -4); c.lineTo(x0 + 0.6, -6); c.closePath(); c.fill();
    c.fillStyle = '#16A34A'; c.beginPath(); c.moveTo(x0, -3); c.lineTo(x0 + 3, -3); c.lineTo(x0 + 0.6, -1.4); c.closePath(); c.fill();
    c.fillStyle = '#3F6212'; c.fillRect(22, -4, 3, 1); c.fillStyle = '#65A30D'; c.fillRect(23, -4.2, 1, 0.5);
    c.fillStyle = INK; c.beginPath(); c.moveTo(24.4, -5.8); c.lineTo(28.8, -3.5); c.lineTo(24.4, -2.2); c.closePath(); c.fill();
    c.fillStyle = '#84CC16'; c.beginPath(); c.moveTo(25, -5); c.lineTo(28, -3.5); c.lineTo(25, -2.8); c.closePath(); c.fill();
    c.fillStyle = '#D9F99D'; c.fillRect(25.2, -4.8, 1, 0.4);
  }
  c.restore();
  // (a sickly bead forming under the tip, swelling, letting go and dripping straight down)
  const d = frame % 84;
  if (nocked && a >= 7 && d < 58) {
    const tx = 26.4 * Math.cos(aim) + 2.8 * Math.sin(aim), ty2 = 26.4 * Math.sin(aim) - 2.8 * Math.cos(aim);
    const grow = Math.min(1, d / 40), fall = d < 40 ? 0 : (d - 40) * (d - 40) * 0.05;
    const s = 0.5 + grow * 0.7;
    c.fillStyle = '#4D7C0F'; c.fillRect(tx - s / 2, ty2 + fall, s, s + (d < 40 ? grow * 0.5 : 0.4));
    c.fillStyle = '#A3E635'; c.fillRect(tx - s / 2, ty2 + fall, s * 0.5, s * 0.5);
  }
};

/** Everything going, stopped (through a door). */
export const stopCrossbow = () => {
  aim = 0;
  for (const e of tracked) { e.pose = undefined; const s = sickness.get(e); if (s) { s.t = -1; recover(e, s); } }
  tracked = new Set(); stuck = []; puddles = []; corpses = []; goo = []; drops = []; strands = []; splashes = []; spats = [];
};

/** For tests: everybody's tolerance and sickness. */
export const crossbowForTests = (state: GameState) => state.enemies.filter(e => sickness.has(e)).map(e => { const s = sickness.get(e)!; return `${e.kind}:${s.tol.toFixed(1)}/${s.max.toFixed(1)}:${s.t >= 0 ? 'SICK' + s.t : '-'}:${Math.round(e.health)}${s.t >= 0 ? `>${s.target?.kind ?? 'UP'}:face${e.pose?.face}:drawn${e.kind ? kindFacing(e, state) : '?'}` : ''}`; });

export const registerCrossbow = () => {
  // (in his hands, sick still looks sick)
  setHeldFilter((e, f) => { const s = sickness.get(e); return s && s.t >= 0 ? (isRobot(e) ? ROBOT_SICK_LOOK : SICK_LOOK)[Math.floor(f / 10) % 2] : null; });
  registerWeapon('CROSSBOW', { fire: (ctx, input, muzzle) => fire(ctx, input, muzzle), update, draw, drawHeld, tick: (ctx, input, equipped) => tick(ctx, input, equipped), drawOverlay });
};
