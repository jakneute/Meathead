// THE SOUL SUCKER (Spooky Land): a haunted-house shop vac with a meat grinder where the bag should be. Hold fire and
// it pulls on everybody in a big, short cone in front of it (and sucks up any bullets coming at him through it): it doesn't stop them, but it drags at them (they're slowed,
// and plenty of them turn round and try to get away from it), and it wears their poise down, quicker the closer they
// are (everybody's got some, shown on them, the beefier the more). Poise gone, they're done: they go in, feet first,
// and through the grinder, into the gore bag. Sucking uses its ammo; what it grinds fills the gore bag (separate, and
// it starts empty), up to five sprays' worth. Secondary fire (Y, or F) empties one spray's worth: once pressed, a long
// gush of gore out the front, all over whoever's there, like Dirty Dan's machine gun. A full bag won't suck any more
// till some's been sprayed out. Ammo pickups fill its ammo, never the bag: only sucking does.
// A boss or a mid-boss won't come: it doesn't pull on him at all. It draws the blood out of him instead (a machine:
// bolts, oil, and a little blood too), a stream of it across into the intake, a gulp at a time, hurting him about as
// much as the ray gun would, and every gulp of it goes in the bag. One opted in (weapons/half.ts: the Ensemble Cast)
// comes, the whole way, in and through the grinder (no body left), but only one of them at a time: the nearest.

import type { Enemy, Particle, Projectile } from '../../m1/types';
import { poofEnemy } from '../../m1/game/core/cartoonKills';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { setArmor } from '../../m1/game/core/resist';
import { startGoreSlide, tickGoreSlides, drawGoreSlides, stopGoreSlides } from './goreSlide';
import { playSound } from '../../m1/game/platform/audio';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { getEnemyMass } from '../../m1/game/combat/knockback';
import { drawEnemyAt } from '../moves/grab';
import { KIND_TOP_REACH } from '../../m1/game/render/enemies';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { FULL_BAG_LINES, EMPTY_BAG_LINES } from '../lines/weaponLines';
import { emptyCue } from './dry';
import { isRobot } from '../kinds';
import { specialsHalf, specialsOff, realMax, halfKill } from './half';
import { subBossDmg } from './subBoss';
import { since } from '../frames';
import { setUi } from '../store';
import { struckAt } from './strikes';
import { bloodOf, bloodCtx, bloodCtxOf, bloodGore, kindGore, markKindGore } from '../../m1/game/enemies/kindBlood';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

// ---------------------------------------------------------------------------------------------------------------
// The gore bag

/** One spray's worth of gore; the bag holds five. */
export const SPRAY = 100, MAX_SPRAYS = 5;
let gore = 0;
const listeners = new Set<() => void>();
/** How much gore's in the bag, and in sprays (whole and part). */
export const goreBag = () => gore;
export const goreSprays = () => gore / SPRAY;
export const onGore = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
/** How much more than its due an enemy puts in the bag (a stage can set `goreMul` on it: Tucker's critters, fewer of
 *  them now, each worth more, so the weakness fills as fast as it did). */
const bagMul = (e: Enemy) => (e as Enemy & { goreMul?: number }).goreMul ?? 1;
const setGore = (v: number) => { const n = Math.max(0, Math.min(SPRAY * MAX_SPRAYS, v)); if (n !== gore) { gore = n; if (bagOther > gore) bagOther = gore; listeners.forEach(f => f()); } };
/** How much of what's in the bag isn't red (an alien ground up, its slime: kindBlood), and what it is: the spray's
 *  globs come out that color as often as it's that share of the bag. */
let bagOther = 0, bagBlood: string | null = null;
/** Into the bag, off `e`: its own blood's share of it kept count of. */
const intoBag = (e: Enemy, amt: number) => {
  const was = gore;
  setGore(gore + amt);
  const blood = bloodOf(e.kind);
  if (blood && gore > was) { bagOther += gore - was; bagBlood = blood; }
};
/** The spray going now: how much of it is the other blood. */
let sprayShare = 0;
/** (for tests) */
export const setGoreBag = (v: number) => setGore(v);

// ---------------------------------------------------------------------------------------------------------------
// Poise

/** Everybody's poise: how much pulling they'll take before they go in (the beefier, the more). */
// (a stage can set `poiseMul` on one: Tucker's lions leaving, very hard to get in (it wants `goreMul` to match, so the bag
// gets no more off it))
const poiseMax = (e: Enemy) => Math.round((realMax(e) * 0.6 + 10) * ((e as Enemy & { poiseMul?: number }).poiseMul ?? 1));
interface Poise { left: number; lastPulled: number; fleeUntil: number; /** Panicking, he's no fight in him: what he was before, to put back. */ held?: { puppet?: boolean; harmless?: boolean } }
/** Everybody panicking right now (their fight held off till they've got over it). */
const panicking = new Set<Enemy>();
const poise = new WeakMap<Enemy, Poise>();
const poiseOf = (e: Enemy) => {
  let p = poise.get(e);
  if (!p) { p = { left: poiseMax(e), lastPulled: -999, fleeUntil: -1 }; poise.set(e, p); }
  return p;
};
/** Is it pulling on him right now (or was, a moment ago)? */
export const beingSucked = (e: Enemy, frame: number) => { const ps = poise.get(e); return !!ps && (ps.lastPulled >= frame - 2 || ps.fleeUntil >= frame); };
/** (for tests) */
export const poiseLeft = (e: Enemy) => poise.get(e)?.left;
/** What can be pulled in: anybody but a boss, a mid-boss or a bystander. */
const suckable = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss' && !specialsOff(e);
/** What's too big to pull in, so it's bled instead: a mid-boss (Meathead 2's bosses are, to the engine). */
const bleedable = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss' && specialsOff(e);

// ---------------------------------------------------------------------------------------------------------------
// The pull

/** The cone: out to REACH in front of the intake, opening wide (it's a big short cone). */
const REACH = 190, SPREAD = 1.05;
/** In front of him, as near as this (melee range): the full pull, whatever height he's at. */
const CLOSE = 60;
/**
 * Poise worn off a frame: at the edge of the cone, right up at the intake; it climbs steeply as he gets closer (by the
 * cube of how near), so further off it's barely a tug and up close it's a different thing altogether.
 */
const DRAIN_FAR = 0.15, DRAIN_NEAR = 6.8;
/** Frames of sucking a unit of its ammo lasts. */
const SUCK_COST_EVERY = 3;
/** After this long not being pulled, poise comes back, this much a frame. */
const REGEN_AFTER = 50, REGEN = 0.5;
/** How fast they run from it, and how long they keep running once it's let them go. */
const FLEE_RUN = 1.7, PANIC = 70;
/**
 * The drag on them (how far a frame they're hauled toward the intake): some even out at the edge, a lot more nearer in
 * (by the square of how near: it reaches further than the wearing down does), and by how light they are: a man of about
 * Meathead's mass as it says, a dog or a bird several times over (they're hauled in, kicking), a big lump less.
 */
const DRAG = { edge: 1.5, near: 7, mass: 200, light: 3.2, heavy: 0.55 };
const dragOf = (e: Enemy, near: number) => (DRAG.edge + DRAG.near * near * near) * Math.max(DRAG.heavy, Math.min(DRAG.light, DRAG.mass / Math.max(1, getEnemyMass(e))));
const flies = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';
const solidAt = (state: GameState, x: number, e: Enemy) => state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && x < b.x + b.w && x + e.width > b.x && e.pos.y + 4 < b.y + b.h && e.pos.y + e.height - 4 > b.y);
/** A step away from him (not into a wall), facing away. */
const runAway = (state: GameState, e: Enemy, away: number) => {
  e.facing = away as 1 | -1;
  // (the lighter he is, the less his legs do against it)
  const nx = e.pos.x + away * FLEE_RUN * Math.min(1, getEnemyMass(e) / DRAG.mass);
  if (!state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && nx < b.x + b.w && nx + e.width > b.x && e.pos.y + 4 < b.y + b.h && e.pos.y + e.height - 4 > b.y)) e.pos.x = nx;
};

let suckingAt = -10, fullSaidAt = -9999;
const FULL_LINE_GAP = 360;
/** Trying to suck with the bag full: since when (each try's a frame it's held; they come every shootCooldown), the last
 *  try, and whether the spray's button is up for it (the user's: after a little while of trying, "Y: spray blood"). */
let fullTryFrom = -9999, fullTryAt = -9999, sprayTip = false;
/** Trying this long, the tip; let go this long (or sprayed, or the bag's not full), it comes down. */
const TIP_AFTER = 70, TRY_GAP = 24, TIP_DROP = 45;
const showSprayTip = (on: boolean) => { if (on !== sprayTip) { sprayTip = on; setUi({ sprayTip: on }); } };
/** His line, up while it's said (and not at all if it can't be said now). */
const meatheadSays = (state: GameState, text: string) => {
  say(text, MEATHEAD_VOICE, 'casual', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
};
/** Somebody going in: flying into the intake, shrinking, turning, over SWALLOW frames. */
interface Swallow { e: Enemy; t: number; from: { x: number; y: number } }
const SWALLOW = 14;
let swallowing: Swallow[] = [];

const inCone = (state: GameState, e: Enemy, mouth: { x: number; y: number }) => {
  const f = state.player.facing;
  const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
  // Right up against him in front (at his feet, at his chest, over his head a little): that's as close as it gets,
  // the full pull, wherever the nozzle's pointing (a crab at his ankles isn't out of it for being under the cone)
  const pl = state.player, front = (ex - (pl.pos.x + pl.width / 2)) * f;
  if (front > -6 && front - e.width / 2 < CLOSE && e.pos.y + e.height > pl.pos.y - 24 && e.pos.y < pl.pos.y + pl.height + 6) return 1;
  const dx = (ex - mouth.x) * f, dy = ey - mouth.y;
  if (dx < -e.width / 2 || dx > REACH) return null;
  const d = Math.hypot(Math.max(0, dx), dy);
  if (d > REACH + e.width / 2 || Math.abs(Math.atan2(dy, Math.max(1, dx))) > SPREAD) return null;
  return 1 - Math.min(1, d / REACH);
};

// ---------------------------------------------------------------------------------------------------------------
// The bleed (a boss: too big to pull in)

/**
 * Blood drawn a frame: from BLEED.far at the cone's edge up to BLEED.near right up at him (2 a frame: 120 a second, about
 * the ray gun's 125, 25 every 12; it's all close in, and it fills the bag). It goes in as a gulp every BLEED.gulp frames
 * (one number, one hit: a boss with Meathead 1's breather, Safari Artie, counts one hit a second, so ~40 a second on
 * him, the gun's 25). Each point of it puts BLEED.bag in the bag (a spray's worth for every 250 drawn).
 */
const BLEED = { near: 2, far: 0.8, gulp: 20, bag: 0.4 };
let bleedFrom: Enemy | null = null, bleedBank = 0, bleedT = 0, bleedAt = -10, bleedRobot = false;
/** Where it's coming out of him (the side of him nearest the intake). */
const bleedSrc = { x: 0, y: 0 };
/** The stream: drops on their way across, made once and reused. `k`: how far across (0..1); `sp`: how fast; `off`:
 *  how far it bows out of line; `kind`: 0-1 blood (big, small), 2 a bolt, 3 oil, 4 a spark. */
interface Drop { on: boolean; k: number; sp: number; off: number; kind: number }
const DROPS: Drop[] = Array.from({ length: 40 }, () => ({ on: false, k: 0, sp: 0, off: 0, kind: 0 }));
const spawnDrop = (kind: number) => {
  for (const d of DROPS) if (!d.on) { d.on = true; d.k = 0; d.sp = 0.07 + Math.random() * 0.05; d.off = (Math.random() - 0.5) * 14; d.kind = kind; return; }
};
const bleed = (ctx: FrameContext, e: Enemy, near: number, mouth: { x: number; y: number }) => {
  const { state, fx } = ctx;
  // (nothing out of the dead: nothing in the bag for it)
  if (e.health <= 0 || e.isBlownAway) return;
  // (a fresh go at him: the first gulp comes quicker)
  if (bleedFrom !== e || since(state.frame, bleedAt) > 2) { bleedFrom = e; bleedT = BLEED.gulp >> 1; bleedBank = 0; }
  bleedAt = state.frame;
  bleedRobot = isRobot(e);
  bleedSrc.x = Math.max(e.pos.x + 4, Math.min(e.pos.x + e.width - 4, mouth.x));
  bleedSrc.y = Math.max(e.pos.y + 6, Math.min(e.pos.y + e.height - 6, mouth.y));
  bleedBank += BLEED.far + (BLEED.near - BLEED.far) * near;
  // (the stream: blood; a machine's mostly bolts and oil and sparks, with a bit of blood in it: they bleed too)
  const n = near > 0.5 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    spawnDrop(bleedRobot ? (r < 0.3 ? 2 : r < 0.6 ? 3 : r < 0.8 ? 4 : 1) : (r < 0.55 ? 0 : 1));
  }
  if (++bleedT % BLEED.gulp !== 0) return;
  const dmg = Math.floor(bleedBank);
  bleedBank -= dmg;
  if (dmg <= 0) return;
  // (a sub-boss loses its share of what's drawn (weapons/subBoss.ts); the bag fills by all of it, as ever)
  const lost = subBossDmg(e, dmg);
  e.health -= lost; e.hitFlash = 3;
  fx.spawnDamageNumber(e.pos, lost);
  if (!noBagFrom.has(e)) intoBag(e, dmg * BLEED.bag * bagMul(e));
  playSound('glug', 0.6, -3);
  if (bleedRobot) playSound('clink', 0.4, 4); else playSound('splat', 0.35, 2);
  // (a spurt out of the hole, some of it going down him)
  for (let i = 0; i < 5; i++) state.particles.push(kindGore({ pos: { x: bleedSrc.x, y: bleedSrc.y }, vel: { x: (Math.random() - 0.5) * 2.5, y: -0.5 - Math.random() * 1.5 }, life: 26, color: bleedRobot && i % 2 ? (i === 1 ? '#FDE047' : '#0A0A0A') : (i % 2 ? '#B91C1C' : '#7F1D1D'), size: 2, grav: 0.3 }, e.kind));
};

const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  // A full bag: it won't pull (the motor chokes, a puff of red out the intake); empty some of it first (secondary fire)
  if (gore >= SPRAY * MAX_SPRAYS) {
    // (and he says so: once a go, a while apart)
    if (since(state.frame, suckingAt) > 30 && since(state.frame, fullSaidAt) > FULL_LINE_GAP) { fullSaidAt = state.frame; meatheadSays(state, pickLine(FULL_BAG_LINES)); }
    // (still trying, or a fresh go at it)
    if (since(state.frame, fullTryAt) > TRY_GAP) fullTryFrom = state.frame;
    fullTryAt = state.frame;
    suckingAt = state.frame - 2;
    pl.shootCooldown = 18;
    playSound('click', 0.8, -6);
    for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y }, vel: { x: pl.facing * (0.5 + Math.random()), y: -0.5 - Math.random() }, life: 16, color: i % 2 ? 'rgba(185, 28, 28, 0.7)' : 'rgba(200, 200, 200, 0.5)', size: 3 + Math.random() * 3 });
    return;
  }
  suckingAt = state.frame;
  pl.shootCooldown = 0;
  // (the cone's pull on anything in it that isn't somebody: a stage's breakables)
  struckAt(mouth.x, mouth.y - 70, mouth.x + pl.facing * REACH, mouth.y + 70, 3);
  // (a unit every third frame of sucking: a full tank's half a minute of it (the playtest: it was every frame, ten
  // seconds, bled dry way too quickly))
  if (!cheats.infiniteAmmo && state.frame % SUCK_COST_EVERY === 0) pl.weaponAmmo.SOUL_SUCKER--;
  if (state.frame % 9 === 0) playSound('suck', 0.8);
  // Bullets too: anything shot at him that comes into the cone is bent round into the intake, and gone (not a stage's
  // hazards: boulders, sludge and the like still get him)
  state.projectiles = state.projectiles.filter(q => {
    if (q.owner !== 'enemy' || !q.shooterKind || q.thrown || q.isBoulder || q.isSludge || q.isPoop || q.isShrapnel || q.isCocaine || q.isMethBarrel) return true;
    const qx = q.pos.x + q.width / 2, qy = q.pos.y + q.height / 2;
    const dx = (qx - mouth.x) * pl.facing, dy = qy - mouth.y, d = Math.hypot(dx, dy);
    if (dx < -12 || d > REACH + 20 || (d > 24 && Math.abs(Math.atan2(dy, Math.max(1, dx))) > SPREAD)) return true;
    if (d < 24) {
      playSound('click', 0.5, 8);
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y }, vel: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }, life: 8, color: '#FDE047', size: 2 });
      return false;
    }
    const sp = Math.max(7, Math.hypot(q.vel.x, q.vel.y));
    q.vel.x = ((mouth.x - qx) / d) * sp; q.vel.y = ((mouth.y - qy) / d) * sp;
    return true;
  });
  // (the opted-in ones: only the nearest of them in it is pulled, and none while one's already going in)
  let one: Enemy | null = null, oneNear = -1;
  if (!swallowing.some(s => specialsHalf(s.e))) for (const e of state.enemies) {
    if (!suckable(e) || !specialsHalf(e)) continue;
    const near = inCone(state, e, mouth);
    if (near !== null && near > oneNear) { one = e; oneNear = near; }
  }
  for (const e of state.enemies) {
    if (!suckable(e) || (specialsHalf(e) && e !== one)) continue;
    const near = inCone(state, e, mouth);
    if (near === null) continue;
    const ps = poiseOf(e);
    ps.lastPulled = state.frame;
    const pull = near * near * near;
    ps.left -= DRAIN_FAR + (DRAIN_NEAR - DRAIN_FAR) * pull;
    // Dragged at: slowed, and pulled in toward the intake (the nearer the harder); and every one of them turns and runs
    // for it (it doesn't stop what they're doing): out at the edge of the cone they can get away, close in they can't
    const toward = mouth.x < e.pos.x + e.width / 2 ? -1 : 1;
    e.vel.x *= 0.8 - pull * 0.55;
    runAway(state, e, -toward);
    // (hauled in: never through a wall, never past the intake; a bird, up or down to it too)
    const cx = e.pos.x + e.width / 2, d = dragOf(e, near);
    const step = Math.min(d, Math.max(0, Math.abs(mouth.x - cx) - e.width * 0.3));
    if (step > 0 && !solidAt(state, e.pos.x + toward * step, e)) e.pos.x += toward * step;
    if (flies(e)) { const dy = mouth.y - (e.pos.y + e.height / 2); e.pos.y += Math.sign(dy) * Math.min(Math.abs(dy), d * 0.6); }
    ps.fleeUntil = state.frame + PANIC;
    // (panicking: no fight in him, no swinging, no shooting, harmless to bump; just trying to get away)
    if (!ps.held) { ps.held = { puppet: e.puppet, harmless: e.harmless }; e.puppet = true; e.harmless = true; panicking.add(e); }
    e.pauseTimer = Math.max(e.pauseTimer || 0, 2); e.shootTimer = 0;
    e.runFrom = ps.fleeUntil;
    // (bits of the floor and the air going in with them)
    if (Math.random() < 0.35) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: toward * (2 + near * 4), y: (mouth.y - e.pos.y - e.height / 2) * 0.03 }, life: 14, color: Math.random() < 0.5 ? 'rgba(220, 220, 220, 0.6)' : '#78716C', size: 1.5 + Math.random() * 1.5 });
    if (ps.left <= 0) swallow(ctx, e);
  }
  // Too big to pull in: the nearest of them in it is bled (no pull at all)
  let big: Enemy | null = null, bigNear = -1;
  for (const e of state.enemies) {
    if (!bleedable(e)) continue;
    const near = inCone(state, e, mouth);
    if (near !== null && near > bigNear) { big = e; bigNear = near; }
  }
  if (big) bleed(ctx, big, bigNear, mouth);
};

/** Poise gone: in he goes. Out of the fight right away; drawn going in, and ground up at the end of it. */
const swallow = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  state.enemies = state.enemies.filter(o => o !== e);
  // (one opted in: dead to its own fight now, no body; it's in the bag)
  if (specialsHalf(e)) { halfKill(ctx, e, 'gone'); e.health = 1; }
  swallowing.push({ e, t: 0, from: { x: e.pos.x + e.width / 2, y: e.pos.y + e.height } });
  playSound('whoosh', 0.9, 4);
};

/** Through the grinder and into the bag: the gore for it (by how much of him there was), blood out the intake, the line. */
const grind = (ctx: FrameContext, s: Swallow) => {
  const { state, fx } = ctx;
  const pl = state.player, mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  intoBag(s.e, poiseMax(s.e) * bagMul(s.e));
  s.e.health = 0;
  // (cartoon kills: through the grinder in a puff of smoke, nothing out the intake)
  if (state.cartoonKills) {
    playSound('grind');
    s.e.pos = { x: mouth.x - s.e.width / 2, y: mouth.y - s.e.height / 2 };
    poofEnemy(state, s.e);
    fx.spawnKillCallout(s.e, grabCallout('shred'));
    fx.speakVulgarity(m2Kill('shred_kill'));
    pl.killSatisfactionTimer = 60;
    return;
  }
  playSound('grind'); playSound('splat', 0.9, -3); playSound('crunch', 0.8, -4);
  // (out of the enemies by now: what comes out the intake is its blood (an alien's, green: kindBlood))
  markKindGore(state, s.e.kind, mouth.x - 80, mouth.y - 80, 160, 140, 12);
  // (it all comes back out the intake as it goes through: a gusher of blood and bits, up and out and all over the floor)
  fx.spawnDeathShower({ x: mouth.x, y: mouth.y }, pl.facing, 2.6, false, 70);
  for (let i = 0; i < 80; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4 + pl.facing * 0.45, sp = 4 + Math.random() * 9;
    state.particles.push({ pos: { x: mouth.x + (Math.random() - 0.5) * 10, y: mouth.y + (Math.random() - 0.5) * 10 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 50 + Math.random() * 50, color: ['#DC2626', '#B91C1C', '#EF4444', '#991B1B', '#F87171'][i % 5], size: 3 + Math.random() * 5 });
  }
  // (a red mist hanging there a moment, and bits: gristle, bone)
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: mouth.x + (Math.random() - 0.5) * 16, y: mouth.y - Math.random() * 16 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -0.4 - Math.random() * 0.6 }, life: 24, color: 'rgba(220, 38, 38, 0.45)', size: 8 + Math.random() * 8 });
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y }, vel: { x: pl.facing * (1 + Math.random() * 4) + (Math.random() - 0.5) * 3, y: -3 - Math.random() * 5 }, life: 80, color: ['#F4C2B0', '#E8A598', '#F5F5F4', '#B91C1C'][i % 4], size: 3 + Math.random() * 2, grav: 0.35, chunk: true });
  // (who he was, and that he's done: the callout and the line, the way any kill goes)
  s.e.pos = { x: mouth.x - s.e.width / 2, y: mouth.y - s.e.height / 2 };
  s.e.isBlownAway = true;
  fx.spawnKillCallout(s.e, grabCallout('shred'));
  fx.speakVulgarity(m2Kill('shred_kill'));
  pl.killSatisfactionTimer = 60;
};

// ---------------------------------------------------------------------------------------------------------------
// The spray

/** One spray: this long, a glob every so often, each this hard, fanned this wide. */
const SPRAY_FRAMES = 100, GLOB_EVERY = 1, GLOB_DMG = 13, GLOB_SPEED = 15, GLOB_SPREAD = 0.14, GLOB_LIFE = 40;
/**
 * Fanned: about half go out in a tight line straight ahead (as many at the ground as ever), the rest anywhere from well
 * up (birds, somebody on a ledge) to well down (off a ledge, at whoever's below).
 */
const FAN_UP = 1.0, FAN_DOWN = 0.9, FAN_SHARE = 0.48;
let sprayLeft = 0, secondaryWas = false, emptySaidAt = -9999;
/** How often he says the bag's empty (when he does: about one try in three). */
const EMPTY_LINE_GAP = 420, EMPTY_LINE_CHANCE = 0.25;

/** Sucking: hurt, he takes it, but he's not knocked about or off the trigger (armor: core/resist). */
let armored = false;
const syncArmor = (on: boolean) => { if (on !== armored) { armored = on; setArmor(on, 'soulSucker'); } };

const tick = (ctx: FrameContext, input: { secondary?: boolean; moveUp: boolean; moveDown: boolean }, equipped: boolean) => {
  syncArmor(equipped && since(ctx.state.frame, suckingAt) <= 2);
  tickGoreSlides(ctx);
  // (got over his panic, or gone: himself again; till then, running off his own way, but not shooting)
  for (const e of panicking) { const ps = poise.get(e); if (!ps || ctx.state.frame > ps.fleeUntil || e.health <= 0 || e.isBlownAway) calmDown(e); else e.shootTimer = 0; }
  const { state } = ctx;
  const pl = state.player;
  // Secondary: a spray's worth out of the bag (once it's going it goes; another waits till it's done)
  const press = !!input.secondary && !secondaryWas;
  secondaryWas = !!input.secondary;
  // (the spray's tip: up after a while of trying on a full bag; down once he sprays, gives up trying, or can't now)
  const full = gore >= SPRAY * MAX_SPRAYS;
  if (!equipped || !full || pl.inCutscene || sprayLeft > 0 || since(state.frame, fullTryAt) > TIP_DROP) { showSprayTip(false); if (!full) fullTryAt = -9999; }
  else if (fullTryAt - fullTryFrom >= TIP_AFTER) showSprayTip(true);
  if (equipped && input.secondary && sprayLeft <= 0 && gore >= SPRAY) { sprayShare = bagOther / gore; bagOther -= SPRAY * sprayShare; setGore(gore - SPRAY); sprayLeft = SPRAY_FRAMES; }
  // (nothing in the bag: it splutters, a drip comes out; now and then he says so)
  else if (equipped && press && sprayLeft <= 0) {
    const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
    emptyCue(ctx, 'SOUL_SUCKER', { text: 'BAG EMPTY!', sound: 'dry_gore', bits: false });
    for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y + 2 }, vel: { x: pl.facing * (0.3 + Math.random()), y: 0.5 + Math.random() }, life: 30, color: i ? '#991B1B' : 'rgba(200, 200, 200, 0.5)', size: i ? 2 : 4 });
    if (since(state.frame, emptySaidAt) > EMPTY_LINE_GAP && Math.random() < EMPTY_LINE_CHANCE) { emptySaidAt = state.frame; meatheadSays(state, pickLine(EMPTY_BAG_LINES)); }
  }
  if (sprayLeft > 0) {
    sprayLeft--;
    const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
    if (sprayLeft % GLOB_EVERY === 0) {
      const aim = input.moveUp ? -0.45 : input.moveDown && !pl.isGrounded ? 0.45 : 0;
      const a = aim + (Math.random() < FAN_SHARE ? -FAN_UP + Math.random() * (FAN_UP + FAN_DOWN) : (Math.random() * 2 - 1) * GLOB_SPREAD);
      // (globs, big and wet, and every few a chunk of somebody)
      const chunk = Math.random() < 0.25;
      const size = chunk ? 7 + Math.random() * 5 : 9 + Math.random() * 8;
      state.projectiles.push({
        id: `gore-${state.frame}-${Math.random()}`, pos: { x: mouth.x - size / 2, y: mouth.y - size / 2 },
        vel: { x: pl.facing * Math.cos(a) * GLOB_SPEED + pl.vel.x, y: Math.sin(a) * GLOB_SPEED },
        width: size, height: size, health: 1, maxHealth: 1, type: 'projectile', damage: GLOB_DMG, owner: 'player',
        custom: 'SOUL_SUCKER', customData: { life: GLOB_LIFE, hit: [] as string[], chunk, spin: Math.random() * 6, shade: Math.floor(Math.random() * 3), blood: bagBlood && Math.random() < sprayShare ? bagBlood : undefined },
      });
    }
    if (sprayLeft % 12 === 0) playSound('gorespray');
    // (a mist of it hanging at the intake, thick, and drool running off it; the alien share of it green)
    const mix = () => (bagBlood && Math.random() < sprayShare ? bagBlood : null);
    state.particles.push(bloodGore({ pos: { x: mouth.x + pl.facing * 4, y: mouth.y }, vel: { x: pl.facing * (1 + Math.random() * 2.5), y: (Math.random() - 0.5) * 2.5 }, life: 12, color: 'rgba(153, 27, 27, 0.55)', size: 7 + Math.random() * 6 }, mix()));
    if (sprayLeft % 4 === 0) state.particles.push(bloodGore({ pos: { x: mouth.x, y: mouth.y + 4 }, vel: { x: pl.facing * 0.5, y: 0.5 }, life: 40, color: '#991B1B', size: 2 + Math.random() * 2 }, mix()));
  }
  // Whoever it's had hold of keeps running a while after it lets go
  for (const e of state.enemies) {
    const ps = poise.get(e);
    if (!ps || ps.fleeUntil < state.frame || ps.lastPulled >= state.frame - 1 || !suckable(e) || (e.pauseTimer || 0) > 2) continue;
    runAway(state, e, e.pos.x + e.width / 2 < pl.pos.x + pl.width / 2 ? -1 : 1);
  }
  // Poise comes back to whoever's been let go a while
  if (state.frame % 2 === 0) for (const e of state.enemies) {
    const ps = poise.get(e);
    if (ps && state.frame - ps.lastPulled > REGEN_AFTER && ps.left < poiseMax(e)) ps.left = Math.min(poiseMax(e), ps.left + REGEN * 2);
  }
  // The stream's drops, on their way across
  for (const d of DROPS) if (d.on && (d.k += d.sp) >= 1) d.on = false;
  // Whoever's going in
  if (swallowing.length) {
    for (const s of swallowing) if (++s.t === SWALLOW) grind(ctx, s);
    swallowing = swallowing.filter(s => s.t < SWALLOW);
  }
};

/** A glob of gore: straight out, dropping a little, through whoever it hits (once each), splatting on whatever's solid. */
const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  // (`blood`: some of what was in the bag that isn't red (an alien's): the glob, its drips and its stains that color)
  const g = p.customData as { life: number; hit: string[]; chunk: boolean; spin: number; shade: number; scrap?: boolean; blood?: string };
  p.vel.y += g.chunk ? 0.4 : 0.25;
  g.spin += 0.3;
  // (dripping as it goes; a machine's bits, sparking and leaking oil)
  if (Math.random() < 0.3) state.particles.push(bloodGore({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: p.vel.x * 0.3, y: p.vel.y * 0.3 + 0.5 }, life: g.scrap ? 10 : 20, color: g.scrap ? (Math.random() < 0.5 ? '#FDE047' : '#1C1917') : '#B91C1C', size: 1.5 + Math.random() * 2 }, g.blood));
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  const splat = () => { for (let i = 0; i < 3; i++) state.particles.push(bloodGore({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: -p.vel.x * 0.1 + (Math.random() - 0.5) * 2, y: -Math.random() * 2 }, life: 18, color: g.scrap ? ['#FDE047', '#9CA3AF', '#0A0A0A'][i] : '#7F1D1D', size: 2 + Math.random() * 2 }, g.blood)); };
  if (--g.life <= 0) return false;
  const hit = state.blocks.find(b => b.type !== 'pit' && b.type !== 'door' && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y
    && (!b.oneWay || (p.vel.y > 0 && p.pos.y + p.height - p.vel.y <= b.y + 2)));
  // (scrap just clatters off it: no stain)
  if (hit) { splat(); if (!g.scrap) stain(state, p, hit, g.blood); else playSound('clink', 0.5, 4); return false; }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss' || g.hit.includes(e.id)) continue;
    if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
    g.hit.push(e.id);
    // (a fight with its own say over the gore landing on its boss (Tucker's: it's his weakness, not a hit): it has it)
    if (!g.scrap && [...globHooks].some(h => h(ctx, e))) { splat(); return false; }
    // (a sub-boss: its share of it: weapons/subBoss.ts)
    const dmg = subBossDmg(e, p.damage);
    e.health -= dmg;
    splat();
    const dir = Math.sign(p.vel.x) || 1;
    // (killed by it: a pratfall, slid off along the slick on their back: goreSlide; a boss's end is his own)
    if (e.health <= 0) { if (!startGoreSlide(ctx, e)) { fx.blowAwayEnemy(e, { x: dir * 6, y: -6 }, m2Kill('gore_kill'), dir); fx.spawnKillCallout(e, grabCallout('gorespray')); } }
    // (no knockback: it holds them in it, slowed, rather than washing them out of it)
    else { fx.spawnDamageNumber(e.pos, dmg); e.vel.x *= 0.8; }
    // (one in two goes on through: it's a gush, not bullets)
    if (g.hit.length > 1 || Math.random() < 0.5) return false;
  }
  return true;
};

/**
 * A stain where a glob of gore hit a wall, a floor or a ceiling: stuck there, a splatter of its own shape (each one's
 * painted from its own random lobes), a smaller spatter or two round it; on a wall or a ceiling, a run down from it.
 * They stay (the oldest go once there are a lot).
 */
const STAINS = 420;
const stains: Particle[] = [];
const stain = (state: GameState, p: Projectile, b: { x: number; y: number; w: number; h: number }, blood?: string) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  // (which face it hit: the one it came in through)
  const prevX = cx - p.vel.x, prevY = cy - p.vel.y;
  const floor = prevY <= b.y, ceil = prevY >= b.y + b.h, wallL = prevX <= b.x, wallR = prevX >= b.x + b.w;
  const at = floor ? { x: cx, y: b.y } : ceil ? { x: cx, y: b.y + b.h } : wallL ? { x: b.x, y: cy } : wallR ? { x: b.x + b.w, y: cy } : { x: cx, y: cy };
  const colors = ['#7F1D1D', '#991B1B', '#8B0000', '#6B1414'];
  const add = (x: number, y: number, size: number, onFloor: boolean, run = 0) => {
    const q: Particle = bloodGore({ pos: { x, y }, vel: { x: 0, y: 0 }, life: 999999, color: colors[Math.floor(Math.random() * colors.length)], size, ...(onFloor ? { isSplat: true } : { isStuck: true }) }, blood);
    state.particles.push(q); stains.push(q);
    // (a run of it down a wall)
    for (let k = 1; k <= run; k++) { const d: Particle = { pos: { x: x + (Math.random() - 0.5), y: y + k * size * 0.9 }, vel: { x: 0, y: 0 }, life: 999999, color: q.color, tint: q.tint, size: Math.max(1, size * (0.6 - k * 0.1)), isStuck: true }; state.particles.push(d); stains.push(d); }
  };
  add(at.x, at.y, 3 + Math.random() * 3.5, floor, !floor && Math.random() < 0.5 ? 1 + Math.floor(Math.random() * 3) : 0);
  for (let i = 0; i < 2; i++) if (Math.random() < 0.7) add(at.x + (floor || ceil ? (Math.random() - 0.5) * 22 : 0), at.y + (floor || ceil ? 0 : (Math.random() - 0.5) * 22), 1 + Math.random() * 2, floor);
  // (too many: the oldest are washed off)
  if (stains.length > STAINS) { const gone = new Set(stains.splice(0, stains.length - STAINS)); state.particles = state.particles.filter(q => !gone.has(q)); }
};

/** A body sliding along on its back (goreSlide): where the floor's not red already, it is now, a smear along it. */
export const smearFloor = (state: GameState, x: number, y: number) => {
  if (stains.some(q => q.isSplat && Math.abs(q.pos.x - x) < 7 && Math.abs(q.pos.y - y) < 4)) return;
  const colors = ['#7F1D1D', '#991B1B', '#8B0000', '#6B1414'];
  for (let k = 0; k < 2; k++) {
    const q: Particle = { pos: { x: x + (Math.random() - 0.5) * 6, y: y - Math.random() }, vel: { x: 0, y: 0 }, life: 999999, color: colors[Math.floor(Math.random() * colors.length)], size: 4 + Math.random() * 3, isSplat: true };
    state.particles.push(q); stains.push(q);
  }
  if (stains.length > STAINS) { const gone = new Set(stains.splice(0, stains.length - STAINS)); state.particles = state.particles.filter(q => !gone.has(q)); }
};

const draw = (c0: Ctx, p: Projectile) => {
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2, r = p.width / 2;
  const g = p.customData as { chunk?: boolean; spin?: number; shade?: number; scrap?: boolean; blood?: string };
  // (an alien's: its slime's color, kindBlood)
  const c = g.blood ? bloodCtxOf(c0, g.blood) : c0;
  if (g.chunk && g.scrap) {
    // A chunk of a machine: a bent plate of its casing, a bolt in it, a wire hanging out, tumbling
    c.save(); c.translate(x, y); c.rotate(g.spin ?? 0);
    c.fillStyle = INK; c.fillRect(-r - 1, -r * 0.7 - 1, r * 2 + 2, r * 1.4 + 2);
    c.fillStyle = ['#9CA3AF', '#6B7280', '#78716C'][g.shade ?? 0]; c.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
    c.fillStyle = '#D1D5DB'; c.fillRect(-r, -r * 0.7, r * 2, Math.max(1, r * 0.3));
    c.fillStyle = INK; c.fillRect(-r * 0.5, -r * 0.1, 2, 2);
    c.fillStyle = '#DC2626'; c.fillRect(r * 0.6, r * 0.5, 1.5, r * 0.8);
    c.restore();
    return;
  }
  if (g.chunk) {
    // A chunk of somebody: lumpy meat, a bit of fat, a bit of bone, tumbling
    c.save(); c.translate(x, y); c.rotate(g.spin ?? 0);
    c.fillStyle = INK; c.beginPath(); c.moveTo(-r - 1, -r * 0.4); c.lineTo(-r * 0.3, -r - 1); c.lineTo(r + 1, -r * 0.5); c.lineTo(r * 0.7, r + 1); c.lineTo(-r * 0.6, r * 0.8); c.closePath(); c.fill();
    c.fillStyle = ['#B91C1C', '#9F1239', '#DC2626'][g.shade ?? 0]; c.beginPath(); c.moveTo(-r, -r * 0.4); c.lineTo(-r * 0.3, -r); c.lineTo(r, -r * 0.5); c.lineTo(r * 0.7, r); c.lineTo(-r * 0.6, r * 0.8); c.closePath(); c.fill();
    c.fillStyle = '#FCA5A5'; c.fillRect(-r * 0.5, -r * 0.5, r * 0.7, r * 0.4);
    c.fillStyle = '#F5F5F4'; c.fillRect(r * 0.2, 0, r * 0.5, r * 0.35);
    c.restore();
    return;
  }
  const a = Math.atan2(p.vel.y, p.vel.x);
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = 'rgba(127, 29, 29, 0.55)'; c.beginPath(); c.ellipse(-r * 1.4, 0, r * 1.6, r * 0.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(0, 0, r * 1.1, r * 0.8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(-r * 0.15, -r * 0.2, r * 0.7, r * 0.45, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FCA5A5'; c.fillRect(r * 0.1, -r * 0.45, 1.5, 1.5);
  c.restore();
};

/** In his fist: the purple drum, its green window, the hose to the flared intake (the grinder's teeth turning in it), the gore bag under, as full as it is. */
const drawHeld = (c: Ctx, frame: number) => {
  const full = gore / (SPRAY * MAX_SPRAYS);
  // (the bag, swelling with what's in it; mostly an alien's slime, green: kindBlood)
  const br = 3 + full * 5, b = bagBlood && bagOther > gore / 2 ? bloodCtxOf(c, bagBlood) : c;
  b.fillStyle = INK; b.beginPath(); b.ellipse(8, 9 + br * 0.6, br + 1.2, br * 0.85 + 1.2, 0, 0, Math.PI * 2); b.fill();
  b.fillStyle = full > 0 ? '#B91C1C' : '#78716C'; b.beginPath(); b.ellipse(8, 9 + br * 0.6, br, br * 0.85, 0, 0, Math.PI * 2); b.fill();
  if (full > 0) { b.fillStyle = '#7F1D1D'; b.fillRect(9, 9 + br * 0.6, 2, 2); b.fillStyle = '#FCA5A5'; b.fillRect(6, 8 + br * 0.3, 1, 1); }
  c.fillStyle = INK; c.fillRect(-3, -4, 18, 11);
  c.fillStyle = '#7C3AED'; c.fillRect(-2, -3, 16, 9); c.fillStyle = '#A78BFA'; c.fillRect(-2, -3, 16, 2); c.fillStyle = '#4C1D95'; c.fillRect(-2, 4, 16, 2);
  c.fillStyle = frame % 40 < 20 ? '#4ADE80' : '#86EFAC'; c.fillRect(1, -1, 5, 4);
  c.fillStyle = '#3F3F46'; c.fillRect(14, -1, 8, 4);
  c.fillStyle = INK; c.beginPath(); c.moveTo(21, -2); c.lineTo(31, -7); c.lineTo(31, 10); c.lineTo(21, 5); c.closePath(); c.fill();
  c.fillStyle = '#A1A1AA'; c.beginPath(); c.moveTo(22, -1); c.lineTo(30, -5.5); c.lineTo(30, 8.5); c.lineTo(22, 4); c.closePath(); c.fill();
  c.fillStyle = '#18181B'; c.fillRect(29, -5, 2, 13);
  c.fillStyle = '#F4F4F5'; for (let k = 0; k < 4; k++) c.fillRect(28.5, -4 + ((k * 3 + frame) % 12), 1, 1.5);
};

const BLOOD = ['#5F0F0F', '#991B1B', '#DC2626', '#F87171'];
const drawBleed = (c0: Ctx, mouth: { x: number; y: number }) => {
  // (one that doesn't bleed red: its own color)
  const c = bloodCtx(c0, bleedFrom?.kind);
  const sx = bleedSrc.x, sy = bleedSrc.y, dx = mouth.x - sx, dy = mouth.y - sy, len = Math.hypot(dx, dy) || 1;
  // (bowed out across the line of it: square to it)
  const nx = -dy / len, ny = dx / len;
  for (const d of DROPS) {
    if (!d.on) continue;
    // (slow out of him, quicker into the intake)
    const k = d.k * d.k * 0.6 + d.k * 0.4, bow = Math.sin(d.k * Math.PI) * d.off;
    const x = Math.round(sx + dx * k + nx * bow), y = Math.round(sy + dy * k + ny * bow);
    switch (d.kind) {
      case 0: c.fillStyle = BLOOD[0]; c.fillRect(x - 2, y - 1, 4, 3); c.fillStyle = BLOOD[2]; c.fillRect(x - 1, y - 1, 2, 2); c.fillStyle = BLOOD[3]; c.fillRect(x - 1, y - 1, 1, 1); break;
      case 1: c.fillStyle = BLOOD[1]; c.fillRect(x - 1, y, 2, 2); break;
      case 2: c.fillStyle = INK; c.fillRect(x - 2, y - 2, 4, 4); c.fillStyle = '#9CA3AF'; c.fillRect(x - 1, y - 1, 2, 2); c.fillStyle = '#E5E7EB'; c.fillRect(x - 1, y - 1, 1, 1); break;
      case 3: c.fillStyle = '#0A0A0A'; c.fillRect(x - 1, y - 1, 3, 2); c.fillStyle = '#4B5563'; c.fillRect(x, y - 1, 1, 1); break;
      default: c.fillStyle = (d.k * 10) % 2 < 1 ? '#FDE047' : '#FFFFFF'; c.fillRect(x, y, 1, 1);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The suck, drawn (looks only: what pulls is REACH, SPREAD and CLOSE up top, and this keeps to that same cone)
//
// It has to read on a sunny noon and in a dark cellar both, so everything in it is inked: a dark line under a bright
// one (the dark shows on the light, the bright on the dark). A ghostly green funnel over the cone, darker and greener
// the nearer the intake, a dithered rim at its reach; rings closing in on the nozzle; streaks corkscrewing in, faster
// the nearer they get; dust whipping in; the odd wailing soul dragged in, stretched out; and on whoever it's got hold
// of, speed lines streaming off them and their soul being drawn out ahead of them into the intake. It winds up over
// its first few frames. All of it a few strokes and a few cached sprites: no filters, no gradients made per frame.

const GHOST = '#86EFAC', GHOST_HI = '#F0FDF4', GHOST_DIM = '#22C55E', VOID = '#2E1065';
/** The first frame of this go at it (it winds up from there), and the last it was going. */
let suckSince = -99, suckWas = -99;
const WIND_UP = 10;
/** Streaks in the spiral, dust, souls, rings: how many (capped; it's the same few every frame). */
const STREAKS = 12, MOTES = 9, WISPS = 4, RINGS = 3, TETHERS = 6;
/** (a fixed scatter: each streak, mote and soul its own line in, frame after frame) */
const hash = (k: number) => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The dithered rim: a 2x2 checker, a dark pixel and a pale one (it shows on anything). */
const dithers = new WeakMap<Ctx, CanvasPattern>();
const ditherOf = (c: Ctx) => {
  let p = dithers.get(c);
  if (!p) {
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
    const g = cv.getContext('2d')!;
    g.fillStyle = VOID; g.fillRect(0, 0, 1, 1); g.fillStyle = GHOST; g.fillRect(1, 1, 1, 1);
    p = c.createPattern(cv, 'repeat')!; dithers.set(c, p);
  }
  return p;
};
/** A soul being dragged in: a wailing little ghost, head first (left: facing right it's coming in leftward), its tail
 *  streaming behind; both ways round, made once. */
let wispR: HTMLCanvasElement | null = null, wispL: HTMLCanvasElement | null = null;
const WISP_W = 16, WISP_H = 12;
const wispOf = (f: number) => {
  if (!wispR) {
    const paint = (flip: boolean) => {
      const cv = document.createElement('canvas'); cv.width = WISP_W; cv.height = WISP_H;
      const g = cv.getContext('2d')!;
      if (flip) { g.translate(WISP_W, 0); g.scale(-1, 1); }
      const body = (grow: number) => {
        g.beginPath(); g.arc(6, 6, 4.5 + grow, Math.PI * 0.5, Math.PI * 1.5);
        g.lineTo(9, 1.5 - grow); g.lineTo(15 + grow, 3); g.lineTo(11, 5.5); g.lineTo(15.5 + grow, 8); g.lineTo(9, 10.5 + grow); g.closePath(); g.fill();
      };
      g.fillStyle = INK; body(1);
      g.fillStyle = GHOST; body(0);
      g.fillStyle = GHOST_HI; g.fillRect(3, 3, 3, 2);
      // (the face: hollow eyes, mouth wide open, screaming)
      g.fillStyle = INK; g.fillRect(3, 5, 2, 2); g.fillRect(7, 5, 2, 2); g.fillRect(4, 8, 3, 2);
      return cv;
    };
    wispR = paint(false); wispL = paint(true);
  }
  return f > 0 ? wispR : wispL!;
};
/** The glow in the intake's mouth (made once). */
let glow: HTMLCanvasElement | null = null;
const GLOW_R = 26;
const glowSprite = () => {
  if (!glow) {
    glow = document.createElement('canvas'); glow.width = glow.height = GLOW_R * 2;
    const g = glow.getContext('2d')!, gr = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
    gr.addColorStop(0, 'rgba(240, 253, 244, 0.95)'); gr.addColorStop(0.3, 'rgba(134, 239, 172, 0.7)'); gr.addColorStop(1, 'rgba(34, 197, 94, 0)');
    g.fillStyle = gr; g.fillRect(0, 0, GLOW_R * 2, GLOW_R * 2);
  }
  return glow;
};

const drawSuck = (c: Ctx, state: GameState, mouth: { x: number; y: number }) => {
  const f = state.player.facing, fr = state.frame, mx = mouth.x, my = mouth.y;
  const ramp = Math.min(1, (fr - suckSince + 1) / WIND_UP);
  const base = f > 0 ? 0 : Math.PI, a0 = base - SPREAD, a1 = base + SPREAD;
  /** A point in the cone: `r` out from the intake, `a` off straight ahead (up is negative). */
  const px = (r: number, a: number) => mx + f * Math.cos(a) * r, py = (r: number, a: number) => my + Math.sin(a) * r;
  const fan = (r: number) => { c.beginPath(); c.moveTo(mx, my); c.arc(mx, my, r, a0, a1); c.closePath(); };
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // The funnel: a shade over the whole cone (it darkens a sunny day a touch), then green, thicker the nearer in
  c.globalAlpha = 0.07 * ramp; c.fillStyle = VOID; fan(REACH); c.fill();
  c.fillStyle = GHOST_DIM;
  c.globalAlpha = 0.08 * ramp; fan(REACH); c.fill();
  c.globalAlpha = 0.1 * ramp; fan(REACH * 0.62); c.fill();
  c.globalAlpha = 0.14 * ramp; fan(REACH * 0.32); c.fill();
  // (its rim, at the reach: dithered, dark and pale pixels both)
  c.globalAlpha = 0.6 * ramp; c.fillStyle = ditherOf(c);
  c.beginPath(); c.arc(mx, my, REACH, a0, a1); c.arc(mx, my, REACH - 8, a1, a0, true); c.closePath(); c.fill();
  // Rings closing in on the nozzle (a ripple in the air), bolder as they near it
  for (let i = 0; i < RINGS; i++) {
    const ph = (fr * 0.022 + i / RINGS) % 1, r = REACH * (1 - ph * ph);
    if (r < 10) continue;
    const s = 0.92 - ph * 0.25;
    c.globalAlpha = (0.2 + 0.45 * ph) * ramp;
    c.strokeStyle = INK; c.lineWidth = 2.5 + ph * 1.5; c.beginPath(); c.arc(mx, my, r, base - SPREAD * s, base + SPREAD * s); c.stroke();
    c.strokeStyle = GHOST_HI; c.lineWidth = 1; c.beginPath(); c.arc(mx, my, r, base - SPREAD * s, base + SPREAD * s); c.stroke();
  }
  // The spiral: streaks corkscrewing in (slow out at the edge, whipping in at the end), a dark line under a bright one
  for (let k = 0; k < STREAKS; k++) {
    const sp = 0.016 + hash(k) * 0.01, amp = SPREAD * (0.35 + hash(k + 40) * 0.6), spin = hash(k + 80) * Math.PI * 2;
    const ph = (fr * sp + k / STREAKS) % 1;
    const at = (q: number) => { const r = REACH * (1 - q * q); return { r, a: amp * Math.sin(spin + q * 7.5) }; };
    const head = at(ph);
    if (head.r < 8) continue;
    const alpha = (0.3 + 0.65 * ph) * ramp * Math.min(1, head.r / 16, (1 - ph) * 30, ph * 8);
    c.beginPath();
    for (let j = 0; j < 5; j++) { const p = at(Math.max(0, ph - j * 0.03)); if (j) c.lineTo(px(p.r, p.a), py(p.r, p.a)); else c.moveTo(px(p.r, p.a), py(p.r, p.a)); }
    c.globalAlpha = alpha * 0.8; c.strokeStyle = INK; c.lineWidth = 2.5 + ph * 2; c.stroke();
    c.globalAlpha = alpha; c.strokeStyle = ph > 0.55 ? GHOST_HI : GHOST; c.lineWidth = 1 + ph; c.stroke();
  }
  // Dust and grit whipping straight in, each a fleck with its motion line behind it
  for (let k = 0; k < MOTES; k++) {
    const ph = (fr * (0.03 + hash(k + 120) * 0.02) + hash(k + 160)) % 1, a = (hash(k + 200) * 2 - 1) * SPREAD * 0.95;
    const r = REACH * (1 - ph * ph), rb = REACH * (1 - Math.max(0, ph - 0.09) ** 2);
    if (r < 8) continue;
    const x = Math.round(px(r, a)), y = Math.round(py(r, a));
    c.globalAlpha = 0.7 * ramp * Math.min(1, ph * 6);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(px(rb, a), py(rb, a)); c.stroke();
    c.fillStyle = INK; c.fillRect(x - 1, y - 1, 3, 3);
    c.fillStyle = k % 3 ? '#D6D3D1' : '#A8A29E'; c.fillRect(x, y, 1 + (k & 1), 1 + (k & 1));
  }
  // Souls: the odd wailing ghost dragged in, stretched out longer and thinner the nearer it gets
  const wisp = wispOf(f);
  for (let k = 0; k < WISPS; k++) {
    const ph = (fr * 0.011 + k / WISPS + hash(k + 240) * 0.1) % 1;
    const r = REACH * 0.95 * (1 - ph * ph), a = SPREAD * 0.6 * Math.sin(k * 2.1 + ph * 5);
    if (r < 12) continue;
    const sx = 1 + ph * 1.6, sy = 1 - ph * 0.45;
    c.globalAlpha = 0.9 * ramp * Math.min(1, ph * 5, r / 24);
    c.save(); c.translate(Math.round(px(r, a)), Math.round(py(r, a) + Math.sin(fr * 0.2 + k * 2) * 2)); c.rotate(f * a); c.scale(sx, sy);
    c.drawImage(wisp, -WISP_W / 2, -WISP_H / 2);
    c.restore();
  }
  // Whoever it's got hold of: speed lines streaming off the far side of them, and their soul drawn out ahead of them
  // into the intake (the nearer, the bolder)
  let tethers = 0;
  for (const e of state.enemies) {
    if (tethers >= TETHERS || !suckable(e)) continue;
    const ps = poise.get(e);
    if (!ps || ps.lastPulled < fr - 1) continue;
    const near = inCone(state, e, mouth) ?? 0;
    tethers++;
    const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2, dx = mx - ex, dy = my - ey, d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d, nx = -uy, ny = ux, back = e.width / 2 + 2, len = 10 + near * 16;
    c.globalAlpha = (0.55 + near * 0.4) * ramp;
    for (let i = -1; i <= 1; i++) {
      const off = i * e.height * 0.3, slide = ((fr * 2 + i * 5 + (e.pos.x | 0)) % 8);
      const sx0 = ex - ux * (back + slide) + nx * off, sy0 = ey - uy * (back + slide) + ny * off;
      c.beginPath(); c.moveTo(sx0, sy0); c.lineTo(sx0 - ux * len, sy0 - uy * len);
      c.strokeStyle = INK; c.lineWidth = 3; c.stroke(); c.strokeStyle = GHOST_HI; c.lineWidth = 1; c.stroke();
    }
    // (the soul: a wavering string of green blobs, out of him and on into the nozzle)
    for (let j = 0; j < 5; j++) {
      const t = ((fr * 0.05 + j / 5) % 1), wob = Math.sin(t * Math.PI) * Math.sin(fr * 0.3 + j * 1.7) * 6;
      const x = Math.round(ex + dx * t + nx * wob), y = Math.round(ey + dy * t + ny * wob), s = 3 + Math.round((1 - t) * near * 2);
      c.globalAlpha = (0.35 + near * 0.55) * ramp * Math.min(1, (1 - t) * 4);
      c.fillStyle = INK; c.fillRect(x - s / 2 - 1, y - s / 2 - 1, s + 2, s + 2);
      c.fillStyle = j & 1 ? GHOST : GHOST_HI; c.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }
  // The intake: a glow in its mouth, a dark eye of the vortex, and a churn of arcs spinning round it
  c.globalAlpha = (0.65 + Math.sin(fr * 0.4) * 0.15) * ramp;
  const gs = GLOW_R * (0.9 + Math.sin(fr * 0.4) * 0.1);
  c.drawImage(glowSprite(), mx - gs, my - gs, gs * 2, gs * 2);
  c.globalAlpha = 0.75 * ramp; c.fillStyle = VOID; c.beginPath(); c.arc(mx + f * 2, my, 4, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 3; i++) {
    const r = 9 + i * 6, s = fr * (0.35 - i * 0.07) * -f + i * 2.1;
    c.globalAlpha = (0.9 - i * 0.2) * ramp;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(mx + f * r * 0.5, my, r, s, s + 1.6); c.stroke();
    c.strokeStyle = i ? GHOST : GHOST_HI; c.lineWidth = 1.25; c.beginPath(); c.arc(mx + f * r * 0.5, my, r, s, s + 1.6); c.stroke();
  }
  c.restore();
};

/** Over the enemies: everybody's poise (a bar on them, while it's been worn at or he's got the sucker out), the cone of
 * air while it's going, and whoever's going in. */
const drawOverlay = (c: Ctx, state: GameState) => {
  drawGoreSlides(c, state);
  const pl = state.player, out = pl.currentWeapon === 'SOUL_SUCKER';
  void out;
  const sucking = since(state.frame, suckingAt) <= 1 && out;
  const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  // The pull: the vortex (the funnel, the rings, the spiral, the dust, the souls) over the cone
  if (sucking) {
    if (since(state.frame, suckWas) > 2) suckSince = state.frame;
    suckWas = state.frame;
    drawSuck(c, state, mouth);
  }
  // The bleed: drops across from him into the intake (pixels, stepped shades, no blending)
  drawBleed(c, mouth);
  // Poise, on anybody it's been worn at: a bar hovering over his head, gold going down to nothing (flashing red when
  // it's nearly gone), till it's come back full
  for (const e of state.enemies) {
    if (!suckable(e)) continue;
    const ps = poise.get(e);
    const max = poiseMax(e);
    if (!ps || ps.left >= max) continue;
    const left = ps.left;
    const bob = Math.sin(state.frame * 0.15 + e.pos.x) * 1.2;
    const w = Math.max(26, Math.min(56, e.width + 8)), x = e.pos.x + e.width / 2 - w / 2, y = e.pos.y - 14 - (KIND_TOP_REACH[e.kind ?? ''] ?? 0) + bob;
    const k = Math.max(0, left / max);
    c.fillStyle = INK; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, w + 2, 6);
    c.fillStyle = '#3F3F46'; c.fillRect(Math.round(x), Math.round(y), w, 4);
    c.fillStyle = k < 0.3 ? (state.frame % 8 < 4 ? '#EF4444' : '#FCA5A5') : '#FBBF24';
    c.fillRect(Math.round(x), Math.round(y), Math.round(w * k), 4);
    c.fillStyle = 'rgba(255, 255, 255, 0.45)'; c.fillRect(Math.round(x), Math.round(y), Math.round(w * k), 1);
  }
  // Whoever's going in: flying to the intake, shrinking and turning
  for (const s of swallowing) {
    const k = s.t / SWALLOW, ease = k * k;
    const x = s.from.x + (mouth.x - s.from.x) * ease, y = s.from.y + (mouth.y + s.e.height * 0.3 - s.from.y) * ease;
    c.save(); c.translate(x, y); c.scale(1 - ease * 0.85, 1 - ease * 0.85);
    drawEnemyAt(c, s.e, state, 0, 0, pl.facing * ease * 5, (-pl.facing) as 1 | -1);
    c.restore();
  }
};

/** Everything it was in the middle of, stopped (through a door): no spray going, nobody half way in, nothing pulled. */
const calmDown = (e: Enemy) => { const ps = poise.get(e); if (ps?.held) { e.puppet = ps.held.puppet; e.harmless = ps.held.harmless; ps.held = undefined; } panicking.delete(e); };
export const stopSoulSucker = () => {
  for (const e of [...panicking]) calmDown(e); for (const d of DROPS) d.on = false; bleedFrom = null; bleedBank = 0; sprayLeft = 0; swallowing = []; suckingAt = -10; fullTryAt = fullTryFrom = -9999; showSprayTip(false); stains.length = 0; syncArmor(false); stopGoreSlides(); };

/** (a fight's hooks, Wilderness Land's Tucker's) Bosses whose blood, drawn by the sucker, doesn't go in the bag (his
 *  fight's bag fills off the critters only: the user's "not directly"); and a say over a glob of the spray landing on
 *  somebody (true: it's had, no damage). */
export const noBagFrom = new WeakSet<Enemy>();
const globHooks = new Set<(ctx: FrameContext, e: Enemy) => boolean>();
export const onGlobHit = (fn: (ctx: FrameContext, e: Enemy) => boolean) => { globHooks.add(fn); return () => { globHooks.delete(fn); }; };

export const registerSoulSucker = () => registerWeapon('SOUL_SUCKER', { fire: ctx => fire(ctx), update, draw: (c, p) => draw(c, p), drawHeld, tick, drawOverlay });
