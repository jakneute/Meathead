// THE CLAPPERBOARD (Hollywood Land): snap it and somebody yells ACTION, and a stunt driver in a red sports car comes
// flying in out of nowhere from behind Meathead, up off a ramp nobody can see, higher than his head, the way he's
// facing: a jump, sailing over him and coming down out in front of him, through everybody in its way (every one of
// them obliterated, the way the tsunami does it). Where it comes down is the stunt: it hits the ground nose first, a
// flip and a fireball, and the stuntman's thrown out the front of it, flying on, a bonus projectile, taking
// out whoever he comes down on; and the first thing he hits, he splats on (a man, a wall, the floor: that's him done). The fireball's a big one: it
// takes out a wide stretch round the wreck. It goes straight through the first wall or ceiling it meets (bricks
// everywhere); a second stops it, and that's where the stunt goes off.

import { dismember, tickDismember, drawDismember, stopDismember } from './dismember';
import type { Enemy, Projectile } from '../../m1/types';
import { poofEnemy } from '../../m1/game/core/cartoonKills';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { specialsHalf, heavyHit, HALF } from './half';
import { subBossDmg } from './subBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { ART_K, drawCarArt, drawWreckArt, drawStuntmanArt, type StuntPose } from './stuntCarArt';
import { grabCallout } from '../moves/callouts';
import { struckAt } from './strikes';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** How fast it comes, how far past him it goes before the stunt, its size; the stuntman's hit; the wait between takes. */
/** The jump: how fast it comes, how high over his feet it comes in, how hard it's falling, where it comes down past him. */
const CAR_SCALE = 1.55;
const CAR = { speed: 18, rise: 170, vy: -4, gravity: 0.42, land: 240, w: Math.round(112 * CAR_SCALE), h: Math.round(34 * CAR_SCALE) };
/** Snapped crouching: in low (just over his ducked head), flatter, coming down further out. */
const LOW = { rise: 62, vy: -1.2, land: 330 };
/** The fireball at the end: this wide, this hard in the middle (falling off to the edge). */
const BLAST = { radius: 170, dmg: 140, edge: 40 };
const MAN_SCALE = 1.4;
const STUNTMAN = { dmg: 90, w: Math.round(18 * MAN_SCALE), h: Math.round(30 * MAN_SCALE), reach: 520 };
const COOLDOWN = 100, MIDBOSS_HIT = 150;
/** The paint jobs (body, its lit top, its shadow, the stripe): never more than two of one on the screen at once. */
const PAINT = [
  { body: '#DC2626', top: '#F87171', low: '#991B1B', stripe: '#FFFFFF' },
  { body: '#2563EB', top: '#60A5FA', low: '#1E3A8A', stripe: '#FFFFFF' },
  { body: '#FACC15', top: '#FEF08A', low: '#A16207', stripe: '#18181B' },
  { body: '#16A34A', top: '#4ADE80', low: '#14532D', stripe: '#FDE047' },
  { body: '#27272A', top: '#52525B', low: '#09090B', stripe: '#F97316' },
  { body: '#F8FAFC', top: '#FFFFFF', low: '#94A3B8', stripe: '#DC2626' },
  { body: '#9333EA', top: '#C084FC', low: '#581C87', stripe: '#F8FAFC' },
  { body: '#F97316', top: '#FDBA74', low: '#9A3412', stripe: '#18181B' },
];
type Paint = (typeof PAINT)[number];

type Part = { kind: 'car'; dir: 1 | -1; endX: number; hit: string[]; wheel: number; wreck: number; through: number; inWall: boolean; seen?: boolean; paint: number; fromX?: number }
  | { kind: 'stuntman'; dir: 1 | -1; hit: string[]; spin: number; down: number; target: Enemy | null };
const partOf = (p: Projectile) => p.customData as Part;

/** The clapperboard over his head (snapping shut, ACTION!), frames left. */
let clap = 0, clapDir: 1 | -1 = 1;
/** Burning wrecks left lying where the stunt went off (`rot0`: how it was tipped coming down, for its flip over). */
let wrecks: { x: number; y: number; dir: 1 | -1; t: number; paint: number; rot0: number }[] = [];
/** The flourishes (looks only: nothing here touches what the stunt does). Skid marks and gouges on the floor; the
 *  fireball going up and its black smoke. Both capped. */
let skids: { x0: number; x1: number; y: number; t: number; gouge: boolean }[] = [];
let booms: { x: number; y: number; t: number; seed: number }[] = [];
/** The wreck's flip over onto its roof: this many frames. */
const FLIP = 16;
/** Its own dice (the look's): never the game's. */
let lookS = 0x57a7c4;
const lr = () => { lookS = (lookS * 1664525 + 1013904223) >>> 0; return lookS / 4294967296; };
const skid = (x0: number, x1: number, y: number, gouge = false) => { if (skids.length >= 70) skids.shift(); skids.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), y, t: 0, gouge }); };

/** A paint job for the next one: any of them, but not one that's already on the screen twice (cars and wrecks both). */
const pickPaint = (state: GameState) => {
  const count = PAINT.map(() => 0);
  for (const q of state.projectiles) if (q.custom === 'STUNT_CAR' && partOf(q).kind === 'car') count[(partOf(q) as { paint: number }).paint]++;
  for (const w of wrecks) if (w.x > state.camera.x - 100 && w.x < state.camera.x + CANVAS_WIDTH + 100) count[w.paint]++;
  const ok = PAINT.map((_, i) => i).filter(i => count[i] < 2);
  return ok[Math.floor(Math.random() * ok.length)] ?? 0;
};

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
const floorAt = (state: GameState, x: number) => groundLineAt(state.groundRuns, x);
/** The first thing to land on at x from `from` down: the top of a platform or a ledge (up on one with him), else the
 *  ground. */
const surfaceUnder = (state: GameState, x: number, from: number) => {
  let best = floorAt(state, x);
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || x < b.x || x > b.x + b.w) continue;
    if (b.y >= from - 2 && b.y < best) best = b.y;
  }
  return best;
};

/** A fight's own say over the clapperboard (DAD MAN's: each snap's car goes for one of his TV family, with a wait
 *  between takes so it can't be spammed): true, and it's dealt with there (no regular stunt). Elsewhere it's itself. */
let fireHook: ((ctx: FrameContext) => boolean) | null = null;
export const setStuntCarHook = (fn: ((ctx: FrameContext) => boolean) | null) => { fireHook = fn; };
/** For such a hook: the clapperboard snapped over his head (ACTION!), the take's ammo used, the usual wait. */
export const snapClapper = (ctx: FrameContext) => {
  const pl = ctx.state.player;
  clap = 30; clapDir = pl.facing;
  pl.shootCooldown = COOLDOWN;
  if (!ctx.cheats.infiniteAmmo) pl.weaponAmmo.STUNT_CAR--;
  playSound('clap'); playSound('carroar', 1, 0);
};

const fire = (ctx: FrameContext) => {
  if (fireHook && fireHook(ctx)) return;
  const { state, cheats } = ctx;
  const pl = state.player;
  const dir = pl.facing;
  const px = pl.pos.x + pl.width / 2;
  // (out of nowhere, up in the air behind him: started so its jump comes down a little way out in front of him)
  // (where it comes down: off his own height, onto whatever's there at it (the platform he's up on), else lower)
  // (snapped crouching: the same way he's facing, but in low (the user's): just over his ducked head, a flatter jump,
  // coming down further out: through what's at his own height, under what's up high)
  const J0 = pl.isDucking ? LOW : CAR;
  const feet = pl.pos.y + pl.height;
  // (under a low ceiling (a mine, a tunnel): it comes in under it, flat, in his own lane, not into the rock over him
  // (the playtest: it went off on the ceiling before it reached anybody))
  const lo = Math.min(px - dir * 900, px + dir * J0.land), hi = Math.max(px - dir * 900, px + dir * J0.land);
  let ceil = -Infinity;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || b.oneWay || b.x + b.w < lo || b.x > hi) continue;
    const bot = b.y + b.h;
    if (bot <= pl.pos.y + 4 && bot > ceil) ceil = bot;
  }
  const room = feet - ceil - CAR.h - 6;
  const J = room < J0.rise ? { rise: Math.max(8, room), vy: 0, land: J0.land } : J0;
  const landY = surfaceUnder(state, px + dir * J.land, feet - 4);
  const drop = (landY < 2000 ? landY : feet) - (feet - J.rise);
  const T = (-J.vy + Math.sqrt(J.vy * J.vy + 2 * CAR.gravity * Math.max(0, drop))) / CAR.gravity;
  const startX = px + dir * J.land - dir * CAR.speed * T - CAR.w / 2;
  const y = feet - J.rise - CAR.h;
  playSound('whoosh', 1, -8);
  state.projectiles.push({
    id: `stuntcar-${state.frame}`, pos: { x: startX, y }, vel: { x: dir * CAR.speed, y: J.vy }, width: CAR.w, height: CAR.h,
    health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'STUNT_CAR',
    customData: { kind: 'car', dir, endX: px + dir * J.land, hit: [], wheel: 0, wreck: 0, through: 0, inWall: false, paint: pickPaint(state), fromX: px } satisfies Part,
  });
  clap = 30; clapDir = dir;
  pl.shootCooldown = COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.STUNT_CAR--;
  playSound('clap'); playSound('carroar', 1, 0);
};

/** Whoever it comes into: gone (a mid-boss takes a big hit, once). */
const runDown = (ctx: FrameContext, e: Enemy, dir: number, speed: number, how: 'car' | 'stuntman') => {
  const { fx, state } = ctx;
  // (one opted in, weapons/half.ts: the car's a heavy hit, not the end of him; knocked flying, dazed half as long)
  if (specialsHalf(e)) {
    // (the stuntman's a plain hit: its share, weapons/subBoss.ts)
    const dmg = how === 'car' ? heavyHit(e) : subBossDmg(e, STUNTMAN.dmg);
    e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true);
    e.vel = { x: dir * 6, y: -5 }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40 * HALF);
    return;
  }
  // (a sub-boss: its share of it, weapons/subBoss.ts)
  if (isMidBoss(e)) { const dmg = subBossDmg(e, MIDBOSS_HIT); e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); return; }
  if (how === 'stuntman' && e.health > STUNTMAN.dmg) {
    e.health -= STUNTMAN.dmg; fx.spawnDamageNumber(e.pos, STUNTMAN.dmg, true);
    e.vel = { x: dir * 6, y: -5 }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40);
    return;
  }
  e.health = 0;
  // (the car's: burst on the spot, the moment it hits, not knocked anywhere: meat on the bonnet and all over the road)
  if (how === 'car' && state.cartoonKills) {
    // (cartoon kills: a puff of smoke where the car hit him)
    poofEnemy(state, e);
    fx.spawnPickup(e.pos); fx.speakVulgarity(m2Kill('stunt_kill')); fx.spawnKillCallout(e, grabCallout('stunt'));
    playSound('crunch', 1, -2); shakeScreen(state, 8, 5);
    return;
  }
  if (how === 'car') {
    const at = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
    fx.spawnDeathShower(e.pos, dir, 2.2);
    fx.spawnExplosion(at, '#8B0000', 26, dir * 4, 14);
    // (and every piece of them off in the carnage: the head, the trunk, the arms, the legs)
    dismember(state, e, dir, 1.2);
    fx.spawnPickup(e.pos);
    fx.speakVulgarity(m2Kill('stunt_kill'));
    fx.spawnKillCallout(e, grabCallout('stunt'));
    playSound('splat', 1, -3); playSound('crunch', 1, -2); shakeScreen(state, 8, 5);
    state.enemies = state.enemies.filter(o => o !== e);
    return;
  }
  // (the stuntman's: on into whoever's behind)
  fx.blowAwayEnemy(e, { x: dir * (speed + 6), y: -10 - Math.random() * 6 }, m2Kill('stunt_kill'), dir, 1.5);
  e.meleeFlung = true;
  fx.spawnKillCallout(e, grabCallout('stunt'));
  playSound('crunch', 1, -2); shakeScreen(state, 8, 5);
};

/** The stunt: a flip and a fireball where it ends (or where it hits something solid), and the stuntman out the front. */
const stunt = (ctx: FrameContext, p: Projectile, car: Extract<Part, { kind: 'car' }>) => {
  const { state, fx } = ctx;
  // (from the middle of it: never already through a wall the front's gone into)
  const front = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  playSound('crash'); playSound('boom', 0.9, -4); shakeScreen(state, 18, 9);
  fx.spawnExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, '#F97316', 36, 0, 24);
  fx.spawnExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, '#FDE047', 20, 0, 16);
  fx.spawnExplosion({ x: p.pos.x + p.width / 2, y: p.pos.y }, '#57534E', 16, 0, 22);
  // The fireball: everybody within a good way of it, hurt by how near, most of them gone
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  struckAt(cx - BLAST.radius, cy - BLAST.radius, cx + BLAST.radius, cy + BLAST.radius, BLAST.dmg);
  for (const e of [...state.enemies]) {
    if (!alive(e) || car.hit.includes(e.id)) continue;
    const d = Math.hypot(e.pos.x + e.width / 2 - cx, e.pos.y + e.height / 2 - cy);
    if (d > BLAST.radius + e.width / 2) continue;
    // (a sub-boss takes its share of it: weapons/subBoss.ts)
    const k = Math.max(0, 1 - d / (BLAST.radius + e.width / 2)), dmg = subBossDmg(e, Math.round(BLAST.edge + (BLAST.dmg - BLAST.edge) * k));
    const away = Math.sign(e.pos.x + e.width / 2 - cx) || car.dir;
    if (specialsHalf(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); e.vel = { x: away * 7 * k * HALF, y: -6 * k * HALF }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40 * HALF); continue; }
    if (isMidBoss(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); continue; }
    e.health -= dmg;
    if (e.health <= 0) { fx.blowAwayEnemy(e, { x: away * (8 + 10 * k), y: -10 - 8 * k }, m2Kill('stunt_kill'), away, 1.5); e.meleeFlung = true; fx.spawnKillCallout(e, grabCallout('stunt')); }
    else { fx.spawnDamageNumber(e.pos, dmg, true); e.vel = { x: away * 7 * k, y: -6 * k }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40); }
  }
  for (let i = 0; i < 3; i++) fx.spawnExplosion({ x: cx + (i - 1) * 60, y: cy - 10 }, i === 1 ? '#FDE047' : '#F97316', 18, 0, 20);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height }, vel: { x: car.dir * (2 + Math.random() * 5), y: -3 - Math.random() * 6 }, life: 60, color: [PAINT[car.paint].body, '#18181B', '#A1A1AA', '#7DD3FC'][i % 4], size: 2 + Math.random() * 3, grav: 0.35, chunk: true });
  // (the wreck, lying there burning a while)
  const wy = surfaceUnder(state, p.pos.x + p.width / 2, p.pos.y + p.height - 6);
  wrecks.push({ x: p.pos.x + p.width / 2, y: wy, dir: car.dir, t: 0, paint: car.paint, rot0: Math.atan2(p.vel.y, Math.abs(p.vel.x)) * 0.8 });
  // (the flourish: the fireball going up, a gouge ploughed into the floor behind where it hit, dust rolling off both ways)
  if (booms.length >= 4) booms.shift();
  booms.push({ x: cx, y: cy, t: 0, seed: lr() * 100 });
  if (wy < 2000 && Math.abs(wy - (p.pos.y + p.height)) < 40) {
    skid(cx - car.dir * 130, cx + car.dir * 20, wy, true);
    for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1; state.particles.push({ pos: { x: cx + s * lr() * 30, y: wy - 4 }, vel: { x: s * (2 + lr() * 5), y: -0.4 - lr() }, life: 34 + lr() * 20, color: i % 3 ? 'rgba(168, 162, 158, 0.55)' : 'rgba(214, 211, 209, 0.5)', size: 7 + lr() * 7 }); }
  }
  // The stuntman, launched out over the hood, every time (out on the screen, wherever it went up): if there's
  // something flying near, he goes for it, a dive, arms out, straight at it; otherwise up and on, tumbling
  const from = { x: Math.max(state.camera.x + 30, Math.min(state.camera.x + CANVAS_WIDTH - 30, front.x)), y: front.y - STUNTMAN.h };
  // (his target: whoever's left that he can see, anywhere on the screen, up, down, behind: the nearest; he homes in on
  // them like a missile (the user's))
  const seenNow = (e: Enemy) => e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH && e.pos.y + e.height > state.camera.y && e.pos.y < state.camera.y + 600;
  const bird = state.enemies.filter(e => alive(e) && !e.innocent && seenNow(e))
    .sort((a, b) => Math.hypot(a.pos.x - from.x, a.pos.y - from.y) - Math.hypot(b.pos.x - from.x, b.pos.y - from.y))[0] ?? null;
  // (off the edge of the screen it went up at: thrown back in, the way he came)
  const offEdge = from.x !== front.x;
  const dir = (bird ? Math.sign(bird.pos.x + bird.width / 2 - from.x) || car.dir : offEdge ? -car.dir : car.dir) as 1 | -1;
  let vel = { x: dir * 13, y: -9 };
  if (bird) { const tx = bird.pos.x + bird.width / 2 - from.x, ty = bird.pos.y + bird.height / 2 - from.y, d = Math.hypot(tx, ty) || 1; vel = { x: (tx / d) * 16, y: (ty / d) * 16 - 3 }; }
  state.projectiles.push({
    id: `stuntman-${state.frame}`, pos: { x: from.x - STUNTMAN.w / 2, y: from.y }, vel,
    width: STUNTMAN.w, height: STUNTMAN.h, health: 1, maxHealth: 1, type: 'projectile', damage: STUNTMAN.dmg, owner: 'player', custom: 'STUNT_CAR',
    customData: { kind: 'stuntman', dir, hit: [], spin: 0, down: 0, target: bird } satisfies Part,
  });
  playSound('whoosh', 1, -3);
};

const solidAhead = (state: GameState, p: Projectile) =>
  state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y + 4 < b.y + b.h && p.pos.y + p.height - 6 > b.y);

const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const part = partOf(p);
  if (part.kind === 'car') {
    // In the air: the jump, coming down
    p.vel.y += CAR.gravity;
    const bottom0 = p.pos.y + p.height;
    p.pos.x += p.vel.x; p.pos.y += p.vel.y;
    part.wheel += 1.2;
    // (exhaust streaming off the back)
    const back = part.dir > 0 ? p.pos.x : p.pos.x + p.width;
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: back, y: p.pos.y + p.height - 8 }, vel: { x: -part.dir * (1 + Math.random() * 2), y: -0.3 - Math.random() * 0.5 }, life: 18, color: 'rgba(120, 113, 108, 0.5)', size: 4 + Math.random() * 4 });
    // Down: nose into the ground, and that's the stunt
    // (onto a platform as well as the ground: whatever it comes down on first)
    const floor = surfaceUnder(state, p.pos.x + p.width / 2, bottom0);
    const frontNow = part.dir > 0 ? p.pos.x + p.width : p.pos.x;
    const passed = part.fromX === undefined || (frontNow - part.fromX) * part.dir > 0;
    if (p.vel.y > 0 && p.pos.y + p.height >= floor) {
      // (down behind him, short of his lane: it lands driving and keeps coming, along the ground; past him, the stunt)
      if (!passed) {
        // (the flourish: rubber laid down under both wheels and dust kicked up off them; a puff each way the moment it lands)
        const was = p.vel.y;
        p.pos.y = floor - p.height; p.vel.y = 0;
        const rear = part.dir > 0 ? p.pos.x + p.width * 0.18 : p.pos.x + p.width * 0.82, fore = part.dir > 0 ? p.pos.x + p.width * 0.8 : p.pos.x + p.width * 0.2;
        skid(rear - p.vel.x, rear, floor); skid(fore - p.vel.x, fore, floor);
        if (was > 3) for (let i = 0; i < 8; i++) { const s = i % 2 ? 1 : -1; state.particles.push({ pos: { x: rear + s * 10, y: floor - 3 }, vel: { x: s * (1.5 + lr() * 3), y: -0.5 - lr() * 1.2 }, life: 26 + lr() * 12, color: 'rgba(214, 211, 209, 0.55)', size: 6 + lr() * 5 }); }
        if (state.frame % 2 === 0) state.particles.push({ pos: { x: rear, y: floor - 3 }, vel: { x: -part.dir * (1 + lr() * 2), y: -0.6 - lr() }, life: 20, color: 'rgba(168, 162, 158, 0.5)', size: 5 + lr() * 5 });
      }
      else { p.pos.y = floor - p.height; stunt(ctx, p, part); return false; }
    }
    for (const e of state.enemies) {
      if (!alive(e) || part.hit.includes(e.id)) continue;
      if (e.pos.x > p.pos.x + p.width || e.pos.x + e.width < p.pos.x || e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y) continue;
      part.hit.push(e.id);
      runDown(ctx, e, part.dir, CAR.speed, 'car');
    }
    // A wall (or a ceiling coming down on it): the first one, it's straight through it, bricks everywhere; the next
    // one stops it, and that's the stunt
    // (behind him it's coming out of nowhere: rock or walls back there don't count; only once its front's past him, in
    // his lane, does it meet things (the playtest: in the mine it went off in the rock behind him))
    const frontX = part.dir > 0 ? p.pos.x + p.width : p.pos.x;
    const pastHim = part.fromX === undefined || (frontX - part.fromX) * part.dir > 0;
    const inWall = pastHim && solidAhead(state, p);
    if (inWall && !part.inWall) {
      if (part.through >= 1) { stunt(ctx, p, part); return false; }
      part.through++;
      playSound('crash'); playSound('crunch', 1, -6); shakeScreen(state, 12, 7);
      const fx0 = part.dir > 0 ? p.pos.x + p.width : p.pos.x;
      for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: fx0, y: p.pos.y + Math.random() * p.height }, vel: { x: part.dir * (2 + Math.random() * 7), y: -2 - Math.random() * 6 }, life: 50, color: ['#78716C', '#A8A29E', '#57534E', '#D6D3D1'][i % 4], size: 3 + Math.random() * 4, grav: 0.35, chunk: true });
      ctx.fx.spawnExplosion({ x: fx0, y: p.pos.y + p.height / 2 }, '#A8A29E', 16, part.dir * 6, 20);
    }
    part.inWall = inWall;
    // (and once it's come on screen, it never drives off it: going out of view, or out past the end of the stage, it
    // goes up right there)
    const onScreen = p.pos.x + p.width > state.camera.x && p.pos.x < state.camera.x + CANVAS_WIDTH;
    // (coming into view: a burst of exhaust off the back of it, out of nowhere, off its ramp nobody can see)
    if (onScreen && !part.seen) { const bx = part.dir > 0 ? p.pos.x : p.pos.x + p.width; for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: bx, y: p.pos.y + p.height * (0.4 + lr() * 0.5) }, vel: { x: -part.dir * (1 + lr() * 3), y: (lr() - 0.5) * 2 }, life: 22 + lr() * 14, color: i % 3 ? 'rgba(120, 113, 108, 0.55)' : 'rgba(214, 211, 209, 0.6)', size: 7 + lr() * 7 }); }
    if (onScreen) part.seen = true;
    const front = part.dir > 0 ? p.pos.x + p.width : p.pos.x;
    const leaving = part.seen && (part.dir > 0 ? front > state.camera.x + CANVAS_WIDTH : front < state.camera.x);
    if (leaving) { stunt(ctx, p, part); return false; }
    return true;
  }
  // The stuntman: a missile (the user's): homing on whoever's left that he can see, anywhere on the screen; his target
  // gone, on to the next nearest; nobody left, he sails on off the screen
  if (!part.target || !alive(part.target)) {
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
    part.target = state.enemies.filter(e => alive(e) && !e.innocent && e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH && e.pos.y + e.height > state.camera.y && e.pos.y < state.camera.y + 600)
      .sort((a, b) => Math.hypot(a.pos.x - cx, a.pos.y - cy) - Math.hypot(b.pos.x - cx, b.pos.y - cy))[0] ?? null;
  }
  if (part.target) {
    const t = part.target, tx = t.pos.x + t.width / 2 - (p.pos.x + p.width / 2), ty = t.pos.y + t.height / 2 - (p.pos.y + p.height / 2), d = Math.hypot(tx, ty) || 1;
    const sp = Math.max(14, Math.hypot(p.vel.x, p.vel.y));
    p.vel.x += ((tx / d) * sp - p.vel.x) * 0.16; p.vel.y += ((ty / d) * sp - p.vel.y) * 0.16;
    if (tx) part.dir = (tx > 0 ? 1 : -1);
  } else p.vel.y += 0.45;
  const bottom0 = p.pos.y + p.height;
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  part.spin = part.target ? Math.atan2(p.vel.y, Math.abs(p.vel.x)) * part.dir + part.dir * Math.PI / 2 : part.spin + part.dir * 0.35;
  const into = state.enemies.find(e => alive(e) && !(e.pos.x > p.pos.x + p.width || e.pos.x + e.width < p.pos.x || e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y));
  if (into) { runDown(ctx, into, part.dir, Math.abs(p.vel.x), 'stuntman'); splat(ctx, p, 'man'); return false; }
  // (nothing else stops him (the user's): no walls, no floor: he flies on through it all till he's off the screen, or
  // into somebody, the backup missile for whoever the blast missed)
  void bottom0;
  const off = p.pos.x + p.width < state.camera.x - 40 || p.pos.x > state.camera.x + CANVAS_WIDTH + 40 || p.pos.y > state.camera.y + 700;
  return !off;
};

/** The stuntman, splatted: a burst of him, red all over what he hit (flat on the floor, a smear down a wall), the callout. */
const splat = (ctx: FrameContext, p: Projectile, on: 'man' | 'floor' | 'wall') => {
  const { state, fx } = ctx;
  const part = partOf(p);
  const at = { x: p.pos.x + p.width / 2, y: on === 'floor' ? p.pos.y + p.height : p.pos.y + p.height / 2 };
  playSound('splat', 1.2, -3); playSound('crunch', 0.8, 0); shakeScreen(state, 6, 4);
  fx.spawnDeathShower(at, part.dir, 2.2);
  fx.spawnExplosion(at, '#8B0000', 16, 0, 12);
  // (what's left of him lying there: red, his white helmet, a bit of the jumpsuit; off a man, it drops to the floor and
  // lies there its while (it was stuck fast in mid-air where he hit, for good: a stuck bit never goes, and they piled up))
  const lie = (dx: number, dy: number, size: number, color: string) => state.particles.push({ pos: { x: at.x + dx, y: at.y + dy }, vel: { x: 0, y: 0 }, life: 260 + Math.random() * 120, color, size, ...(on === 'floor' ? { isSplat: true } : on === 'wall' ? { isStuck: true } : { grav: 0.35 }) });
  for (let i = 0; i < 6; i++) lie((Math.random() - 0.5) * (on === 'wall' ? 8 : 34), on === 'wall' ? (Math.random() - 0.5) * 30 + i * 3 : -1, 3 + Math.random() * 4, i % 3 ? '#7F1D1D' : '#991B1B');
  if (on !== 'man') { lie(part.dir * 4, on === 'floor' ? -2 : -4, 3, '#F8FAFC'); lie(-part.dir * 6, on === 'floor' ? -1 : 4, 3, '#DC2626'); }
};

/** Every frame: the clapperboard, the wrecks burning. */
const tick = (ctx: FrameContext) => {
  tickDismember(ctx.state);
  const { state } = ctx;
  if (clap > 0) clap--;
  for (const w of wrecks) {
    w.t++;
    if (w.t < 140 && state.frame % 2 === 0) state.particles.push({ pos: { x: w.x + (Math.random() - 0.5) * 60, y: w.y - 20 - Math.random() * 10 }, vel: { x: (Math.random() - 0.5), y: -1 - Math.random() * 1.5 }, life: 24, color: Math.random() < 0.4 ? 'rgba(68, 64, 60, 0.55)' : Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5 });
  }
  wrecks = wrecks.filter(w => w.t < 200);
  for (const s of skids) s.t++;
  skids = skids.filter(s => s.t < 420);
  for (const b of booms) b.t++;
  booms = booms.filter(b => b.t < 90);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The car (weapons/stuntCarArt.ts: a muscle car, drawn ART_K bigger than the box it hits with), its middle at (x, y),
 *  wheels spinning, `dents` from what it's been through. */
const drawCar = (c: Ctx, x: number, y: number, dir: number, wheel: number, rot: number, paint: Paint, driver = true, dents = 0) => {
  const i = Math.max(0, PAINT.indexOf(paint));
  drawCarArt(c, x, y, CAR_SCALE * ART_K, dir, wheel, rot, i, paint, { driver, dents });
};

/** The stuntman (weapons/stuntCarArt.ts). `pose`: tumbling, down, up (thumbs up, then a wave: `f` the frame), diving. */
const drawStuntman = (c: Ctx, x: number, y: number, dir: number, rot: number, pose: StuntPose, f = 0) => drawStuntmanArt(c, x, y, MAN_SCALE, dir, rot, pose, f);

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const part = partOf(p);
  // (motion lines streaming off the back of it, back along the way it's going: white, then grey, flickering in length)
  {
    const sp = Math.hypot(p.vel.x, p.vel.y) || 1, ux = -p.vel.x / sp, uy = -p.vel.y / sp, nx = -uy, ny = ux;
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2, car = part.kind === 'car';
    const n = car ? 5 : 3, back = car ? p.width * 0.5 : p.width * 0.6, span = car ? p.height * 0.9 : p.height * 0.6;
    c.lineCap = 'butt';
    for (let i = 0; i < n; i++) {
      const o = (i / (n - 1) - 0.5) * span, len = (car ? 46 : 26) * (0.6 + 0.4 * (((frame + i * 3) % 5) / 4)), gap = 6 + ((i * 7 + frame) % 3) * 4;
      const x0 = cx + ux * (back + gap) + nx * o, y0 = cy + uy * (back + gap) + ny * o;
      c.strokeStyle = i % 2 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(214, 211, 209, 0.6)'; c.lineWidth = i % 2 ? 2 : 3;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + ux * len, y0 + uy * len); c.stroke();
    }
  }
  // (the art's bigger than the box: its wheels' bottoms kept to the box's bottom)
  if (part.kind === 'car') { drawCar(c, p.pos.x + p.width / 2, p.pos.y + p.height - 15 * CAR_SCALE * ART_K + 4, part.dir, part.wheel, Math.atan2(p.vel.y, Math.abs(p.vel.x)) * 0.8, PAINT[part.paint], true, Math.min(3, part.hit.length + part.through)); return; }
  if (part.target && alive(part.target)) {
    // (the one he's going for, marked: a red reticle closing on it)
    const t = part.target, tx = t.pos.x + t.width / 2, ty = t.pos.y + t.height / 2, r = 14 + Math.sin(frame * 0.5) * 3;
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(tx, ty, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#EF4444'; c.lineWidth = 2; c.beginPath(); c.arc(tx, ty, r, 0, Math.PI * 2); c.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { c.beginPath(); c.moveTo(tx + dx * (r - 5), ty + dy * (r - 5)); c.lineTo(tx + dx * (r + 6), ty + dy * (r + 6)); c.stroke(); }
    drawStuntman(c, p.pos.x + p.width / 2, p.pos.y + p.height / 2, part.dir, part.spin, 'dive', frame);
  } else drawStuntman(c, p.pos.x + p.width / 2, p.pos.y + p.height - 14 * MAN_SCALE, part.dir, part.spin, 'tumble', frame);
};

const drawOverlay = (c: Ctx, state: GameState) => {
  drawDismember(c, state);
  // The fireballs: stepped lobes of flame boiling up and burning out, black smoke rolling up off the top of them (behind
  // the wreck: it comes flipping over out of it)
  for (const b of booms) drawBoom(c, b);
  // The wrecks: on their roofs, burning; first, flipping over onto it, up off its nose and over, motion arcs round it
  for (const w of wrecks) {
    if (w.t > 170 && w.t % 4 < 2) continue;
    if (w.t < FLIP) {
      const k = w.t / FLIP, e = k * k * (3 - 2 * k), rot = w.rot0 + (Math.PI - w.rot0) * e;
      // (up off the floor as it goes over: stood on its end it's never down through the floor)
      const mx = w.x + w.dir * (e - 0.5) * 24, my = w.y - 15 * CAR_SCALE * ART_K + 4 - Math.sin(k * Math.PI) * 52 - Math.abs(Math.sin(rot)) * 75;
      // (the arcs: three stepped curves trailing round behind the way it's turning)
      for (let i = 0; i < 3; i++) {
        const R = 58 + i * 12, a1 = (w.dir > 0 ? rot : Math.PI - rot) - Math.PI / 2 * w.dir, a0 = a1 - w.dir * (0.9 - i * 0.2);
        c.strokeStyle = i === 1 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(214, 211, 209, 0.6)'; c.lineWidth = i === 1 ? 3 : 2;
        c.beginPath(); c.arc(mx, my, R, Math.min(a0, a1), Math.max(a0, a1)); c.stroke();
      }
      drawCar(c, mx, my, w.dir, 0, rot, PAINT[w.paint], false, 3);
      continue;
    }
    drawWreckArt(c, w.x, w.y, CAR_SCALE * ART_K, w.dir, w.paint, PAINT[w.paint], { t: w.t, f: state.frame, burn: w.t < 140 ? 1 : 0.5 });
  }
  // The clapperboard over his head: the clapper snapping down, ACTION!
  if (clap > 0) {
    // (hanging off a vine, his hand up on it over his head: up off to the front of it, clear of his fist)
    const pl = state.player, x = pl.pos.x + pl.width / 2 + (pl.vine ? pl.facing * 26 : 0), y = pl.pos.y - (pl.vine ? 26 : 34), k = clap / 30;
    const shut = clap < 24, open = shut ? 0 : (clap - 24) / 6 * 0.6;
    c.save(); c.translate(x, y);
    c.fillStyle = INK; c.fillRect(-21, -6, 42, 28); c.fillStyle = '#27272A'; c.fillRect(-20, -5, 40, 26);
    c.fillStyle = '#F8FAFC'; c.font = '5px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('SCENE 1', 0, 6); c.fillText('TAKE 1', 0, 15);
    c.save(); c.translate(-20, -6); c.rotate(-open);
    c.fillStyle = INK; c.fillRect(-1, -8, 42, 8);
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#18181B' : '#F8FAFC'; c.beginPath(); c.moveTo(1 + i * 8, -7); c.lineTo(9 + i * 8, -7); c.lineTo(7 + i * 8, -1); c.lineTo(-1 + i * 8, -1); c.closePath(); c.fill(); }
    c.restore();
    if (shut) {
      // (the snap: impact ticks off the top of the board the moment it claps shut)
      const tt = 24 - clap;
      if (tt < 5) { c.fillStyle = '#FFFFFF'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5, d0 = 16 + tt * 3; for (let s = 0; s < 3; s++) c.fillRect(Math.round(Math.cos(a) * (d0 + s * 3)) - 1, Math.round(-12 + Math.sin(a) * (d0 + s * 3)) - 1, 2, 2); } }
      // ACTION!: popping out of a spiky red burst, overshooting and settling, a hair crooked
      const s = tt < 3 ? 0.4 + tt * 0.42 : tt < 7 ? 1.66 - (tt - 3) * 0.13 : 1.14 - (tt - 7) * 0.006, al = Math.min(1, k * 1.6);
      c.save(); c.translate(clapDir * 4, -24); c.rotate(-0.08 * clapDir); c.scale(s, s); c.globalAlpha *= al;
      const burst = (rx: number, ry: number, col: string, dx = 0, dy = 0) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 0.72 : 1 + ((i * 5) % 3) * 0.06; const px = dx + Math.cos(a) * rx * rr, py = dy + Math.sin(a) * ry * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.fill(); };
      burst(42, 15, INK, 2, 2); burst(42, 15, INK); burst(39, 13, '#DC2626'); burst(30, 9, '#F97316');
      c.font = '8px "Press Start 2P"'; c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = INK; c.strokeText('ACTION!', 0, 4);
      // (two-tone, stepped: white over, yellow under)
      c.fillStyle = '#FFFFFF'; c.fillText('ACTION!', 0, 3);
      c.fillStyle = '#FDE047'; c.save(); c.beginPath(); c.rect(-40, 1, 80, 6); c.clip(); c.fillText('ACTION!', 0, 4); c.restore();
      c.restore();
    }
    c.textAlign = 'left';
    c.restore();
  }
};

/** A fireball (where the stunt went off): seven lobes of stepped flame boiling up out of it and burning out, white-hot
 *  at first, going orange, red, then gone; black smoke rolling up off the top, stepped grey to black, thinning out. */
const drawBoom = (c: Ctx, b: { x: number; y: number; t: number; seed: number }) => {
  const t = b.t, h = (i: number) => { const s = Math.sin((b.seed + i) * 127.1) * 43758.5453; return s - Math.floor(s); };
  // (the smoke first: behind the flame)
  if (t > 6) for (let i = 0; i < 7; i++) {
    const u = (t - 6 - i * 3) / 70; if (u <= 0 || u >= 1) continue;
    const px = b.x + (h(i) - 0.5) * 90 + (h(i + 9) - 0.5) * 40 * u, py = b.y - 40 - u * 140 - h(i + 3) * 30, r = 12 + u * 26 + h(i + 5) * 8;
    c.globalAlpha = u > 0.6 ? (1 - u) / 0.4 : 1;
    c.fillStyle = '#09090B'; c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#27272A'; c.beginPath(); c.arc(px - r * 0.2, py - r * 0.22, r * 0.72, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(px - r * 0.38, py - r * 0.4, r * 0.32, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  if (t >= 34) return;
  // (the flame: each lobe's ramp stepped down as it burns out)
  const RAMP = ['#7F1D1D', '#DC2626', '#F97316', '#FDE047', '#FFFBEB'];
  const heat = t < 6 ? 4 : t < 14 ? 3 : t < 22 ? 2 : t < 28 ? 1 : 0;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + h(i) * 0.6, grow = Math.min(1, t / 5), fall = t > 18 ? 1 - (t - 18) / 16 : 1;
    const px = b.x + Math.cos(a) * 46 * grow * (0.6 + h(i + 2) * 0.5), py = b.y - t * 1.6 + Math.sin(a) * 30 * grow - (i === 0 ? 20 : 0);
    const r = (26 + h(i + 4) * 18) * grow * (0.4 + 0.6 * fall);
    if (r < 2) continue;
    for (let j = 0; j <= heat; j++) {
      c.fillStyle = RAMP[j]; c.beginPath(); c.arc(px + j * 1.5, py - j * 2, r * (1 - j * 0.19), 0, Math.PI * 2); c.fill();
    }
  }
};

/** Under him: the skid marks and gouges on the floor, fading. */
const drawUnder = (c: Ctx) => {
  for (const s of skids) {
    const a = s.t > 300 ? (420 - s.t) / 120 : 1;
    if (s.gouge) {
      c.fillStyle = `rgba(28, 25, 23, ${(0.75 * a).toFixed(2)})`; c.fillRect(Math.round(s.x0), Math.round(s.y - 3), Math.round(s.x1 - s.x0), 4);
      c.fillStyle = `rgba(120, 113, 108, ${(0.7 * a).toFixed(2)})`; c.fillRect(Math.round(s.x0), Math.round(s.y - 4), Math.round(s.x1 - s.x0), 1);
      for (let x = s.x0 + 8; x < s.x1; x += 14) { c.fillStyle = `rgba(87, 83, 78, ${(0.8 * a).toFixed(2)})`; c.fillRect(Math.round(x), Math.round(s.y - 6), 3, 2); }
    } else { c.fillStyle = `rgba(24, 24, 27, ${(0.55 * a).toFixed(2)})`; c.fillRect(Math.round(s.x0), Math.round(s.y - 2), Math.ceil(s.x1 - s.x0) + 1, 2); }
  }
};

/** In his fist: the clapperboard, striped arm on top, chalked up. */
const drawHeld = (c: Ctx) => {
  c.fillStyle = INK; c.fillRect(0, -10, 20, 16); c.fillStyle = '#27272A'; c.fillRect(1, -9, 18, 14);
  c.fillStyle = '#E5E7EB'; c.fillRect(3, -6, 10, 1); c.fillRect(3, -3, 12, 1); c.fillRect(3, 0, 8, 1);
  c.fillStyle = INK; c.fillRect(0, -15, 20, 5);
  for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#18181B' : '#F8FAFC'; c.fillRect(1 + i * 5, -14, 4, 3); }
};

/** Everything it was in the middle of, stopped (through a door). */
export const stopStuntCar = () => { clap = 0; wrecks = []; skids = []; booms = []; stopDismember(); };

/** The car and the stuntman as drawn here (for a fight's own scripted stunts: the same cars). */
export { drawCar as drawStuntCar, drawStuntman, PAINT as STUNT_PAINT, CAR_SCALE as STUNT_CAR_SCALE, ART_K as STUNT_ART_K };

export const registerStuntCar = () => registerWeapon('STUNT_CAR', { fire: ctx => fire(ctx), update, draw, drawHeld: c => drawHeld(c), tick: ctx => tick(ctx), drawOverlay, drawUnder: c => drawUnder(c) });
