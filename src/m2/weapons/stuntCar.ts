// THE CLAPPERBOARD (Hollywood Land): snap it and somebody yells ACTION, and a stunt driver in a red sports car comes
// flying in out of nowhere from behind Meathead, up off a ramp nobody can see, higher than his head, the way he's
// facing: a jump, sailing over him and coming down out in front of him, through everybody in its way (every one of
// them obliterated, the way the tsunami does it). Where it comes down is the stunt: it hits the ground nose first, a
// flip and a fireball, and the stuntman's thrown out the front of it, flying on, a bonus projectile, taking
// out whoever he comes down on; and the first thing he hits, he splats on (a man, a wall, the floor: that's him done). The fireball's a big one: it
// takes out a wide stretch round the wreck. It goes straight through the first wall or ceiling it meets (bricks
// everywhere); a second stops it, and that's where the stunt goes off.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { groundLineAt } from '../../m1/game/core/terrain';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** How fast it comes, how far past him it goes before the stunt, its size; the stuntman's hit; the wait between takes. */
/** The jump: how fast it comes, how high over his feet it comes in, how hard it's falling, where it comes down past him. */
const CAR_SCALE = 1.55;
const CAR = { speed: 18, rise: 170, vy: -4, gravity: 0.42, land: 240, w: Math.round(112 * CAR_SCALE), h: Math.round(34 * CAR_SCALE) };
/** The fireball at the end: this wide, this hard in the middle (falling off to the edge). */
const BLAST = { radius: 170, dmg: 140, edge: 40 };
const MAN_SCALE = 1.4;
const STUNTMAN = { dmg: 90, w: Math.round(18 * MAN_SCALE), h: Math.round(30 * MAN_SCALE), reach: 520 };
/** Up there in the air (a bird, a drone). */
const flies = (e: Enemy) => e.enemyType === 'flyer' || e.enemyType === 'drone' || e.behavior === 'fly' || e.behavior === 'hover';
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

type Part = { kind: 'car'; dir: 1 | -1; endX: number; hit: string[]; wheel: number; wreck: number; through: number; inWall: boolean; seen?: boolean; paint: number }
  | { kind: 'stuntman'; dir: 1 | -1; hit: string[]; spin: number; down: number; target: Enemy | null };
const partOf = (p: Projectile) => p.customData as Part;

/** The clapperboard over his head (snapping shut, ACTION!), frames left. */
let clap = 0, clapDir: 1 | -1 = 1;
/** Burning wrecks left lying where the stunt went off. */
let wrecks: { x: number; y: number; dir: 1 | -1; t: number; paint: number }[] = [];

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

const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const dir = pl.facing;
  const px = pl.pos.x + pl.width / 2;
  // (out of nowhere, up in the air behind him: started so its jump comes down a little way out in front of him)
  const feet = pl.pos.y + pl.height, landY = floorAt(state, px + dir * CAR.land);
  const drop = (landY < 2000 ? landY : feet) - (feet - CAR.rise);
  const T = (-CAR.vy + Math.sqrt(CAR.vy * CAR.vy + 2 * CAR.gravity * Math.max(0, drop))) / CAR.gravity;
  const startX = px + dir * CAR.land - dir * CAR.speed * T - CAR.w / 2;
  const y = feet - CAR.rise - CAR.h;
  playSound('whoosh', 1, -8);
  state.projectiles.push({
    id: `stuntcar-${state.frame}`, pos: { x: startX, y }, vel: { x: dir * CAR.speed, y: CAR.vy }, width: CAR.w, height: CAR.h,
    health: 1, maxHealth: 1, type: 'projectile', damage: 0, owner: 'player', custom: 'STUNT_CAR',
    customData: { kind: 'car', dir, endX: px + dir * CAR.land, hit: [], wheel: 0, wreck: 0, through: 0, inWall: false, paint: pickPaint(state) } satisfies Part,
  });
  clap = 30; clapDir = dir;
  pl.shootCooldown = COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.STUNT_CAR--;
  playSound('clap'); playSound('carroar', 1, 0);
};

/** Whoever it comes into: gone (a mid-boss takes a big hit, once). */
const runDown = (ctx: FrameContext, e: Enemy, dir: number, speed: number, how: 'car' | 'stuntman') => {
  const { fx, state } = ctx;
  if (isMidBoss(e)) { e.health -= MIDBOSS_HIT; fx.spawnDamageNumber(e.pos, MIDBOSS_HIT, true); return; }
  if (how === 'stuntman' && e.health > STUNTMAN.dmg) {
    e.health -= STUNTMAN.dmg; fx.spawnDamageNumber(e.pos, STUNTMAN.dmg, true);
    e.vel = { x: dir * 6, y: -5 }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40);
    return;
  }
  e.health = 0;
  // (the car's: up over the roof and away, not shoved on ahead of it into the next one, out of its way; the stuntman's:
  // on into whoever's behind)
  const car = how === 'car';
  fx.blowAwayEnemy(e, car ? { x: dir * (6 + Math.random() * 6), y: -16 - Math.random() * 6 } : { x: dir * (speed + 6), y: -10 - Math.random() * 6 }, m2Kill('stunt_kill'), dir, 1.5);
  e.meleeFlung = !car;
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
  for (const e of [...state.enemies]) {
    if (!alive(e) || car.hit.includes(e.id)) continue;
    const d = Math.hypot(e.pos.x + e.width / 2 - cx, e.pos.y + e.height / 2 - cy);
    if (d > BLAST.radius + e.width / 2) continue;
    const k = Math.max(0, 1 - d / (BLAST.radius + e.width / 2)), dmg = Math.round(BLAST.edge + (BLAST.dmg - BLAST.edge) * k);
    const away = Math.sign(e.pos.x + e.width / 2 - cx) || car.dir;
    if (isMidBoss(e)) { e.health -= dmg; fx.spawnDamageNumber(e.pos, dmg, true); continue; }
    e.health -= dmg;
    if (e.health <= 0) { fx.blowAwayEnemy(e, { x: away * (8 + 10 * k), y: -10 - 8 * k }, m2Kill('stunt_kill'), away, 1.5); e.meleeFlung = true; fx.spawnKillCallout(e, grabCallout('stunt')); }
    else { fx.spawnDamageNumber(e.pos, dmg, true); e.vel = { x: away * 7 * k, y: -6 * k }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40); }
  }
  for (let i = 0; i < 3; i++) fx.spawnExplosion({ x: cx + (i - 1) * 60, y: cy - 10 }, i === 1 ? '#FDE047' : '#F97316', 18, 0, 20);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height }, vel: { x: car.dir * (2 + Math.random() * 5), y: -3 - Math.random() * 6 }, life: 60, color: [PAINT[car.paint].body, '#18181B', '#A1A1AA', '#7DD3FC'][i % 4], size: 2 + Math.random() * 3, grav: 0.35, chunk: true });
  // (the wreck, lying there burning a while)
  wrecks.push({ x: p.pos.x + p.width / 2, y: floorAt(state, p.pos.x + p.width / 2), dir: car.dir, t: 0, paint: car.paint });
  // The stuntman, launched out over the hood, every time (out on the screen, wherever it went up): if there's
  // something flying near, he goes for it, a dive, arms out, straight at it; otherwise up and on, tumbling
  const from = { x: Math.max(state.camera.x + 30, Math.min(state.camera.x + CANVAS_WIDTH - 30, front.x)), y: front.y - STUNTMAN.h };
  const bird = state.enemies.filter(e => alive(e) && flies(e) && Math.hypot(e.pos.x + e.width / 2 - from.x, e.pos.y + e.height / 2 - from.y) < STUNTMAN.reach)
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
    p.pos.x += p.vel.x; p.pos.y += p.vel.y;
    part.wheel += 1.2;
    // (exhaust streaming off the back)
    const back = part.dir > 0 ? p.pos.x : p.pos.x + p.width;
    if (state.frame % 2 === 0) state.particles.push({ pos: { x: back, y: p.pos.y + p.height - 8 }, vel: { x: -part.dir * (1 + Math.random() * 2), y: -0.3 - Math.random() * 0.5 }, life: 18, color: 'rgba(120, 113, 108, 0.5)', size: 4 + Math.random() * 4 });
    // Down: nose into the ground, and that's the stunt
    const floor = floorAt(state, p.pos.x + p.width / 2);
    if (p.vel.y > 0 && p.pos.y + p.height >= floor) { p.pos.y = floor - p.height; stunt(ctx, p, part); return false; }
    for (const e of state.enemies) {
      if (!alive(e) || part.hit.includes(e.id)) continue;
      if (e.pos.x > p.pos.x + p.width || e.pos.x + e.width < p.pos.x || e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y) continue;
      part.hit.push(e.id);
      runDown(ctx, e, part.dir, CAR.speed, 'car');
    }
    // A wall (or a ceiling coming down on it): the first one, it's straight through it, bricks everywhere; the next
    // one stops it, and that's the stunt
    const inWall = solidAhead(state, p);
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
    if (onScreen) part.seen = true;
    const front = part.dir > 0 ? p.pos.x + p.width : p.pos.x;
    const leaving = part.seen && (part.dir > 0 ? front > state.camera.x + CANVAS_WIDTH : front < state.camera.x);
    if (leaving) { stunt(ctx, p, part); return false; }
    return true;
  }
  // The stuntman: flying, tumbling, till the first thing he hits; whatever it is, he splats on it. Going for a bird,
  // he dives at it, steering in on it as it moves (he can still miss)
  if (part.target && alive(part.target)) {
    const t = part.target, tx = t.pos.x + t.width / 2 - (p.pos.x + p.width / 2), ty = t.pos.y + t.height / 2 - (p.pos.y + p.height / 2), d = Math.hypot(tx, ty) || 1;
    const sp = Math.hypot(p.vel.x, p.vel.y);
    p.vel.x += ((tx / d) * sp - p.vel.x) * 0.08; p.vel.y += ((ty / d) * sp - p.vel.y) * 0.08;
    p.vel.y += 0.12;
  } else { part.target = null; p.vel.y += 0.45; }
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  part.spin = part.target ? Math.atan2(p.vel.y, Math.abs(p.vel.x)) * part.dir + part.dir * Math.PI / 2 : part.spin + part.dir * 0.35;
  const into = state.enemies.find(e => alive(e) && !(e.pos.x > p.pos.x + p.width || e.pos.x + e.width < p.pos.x || e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y));
  if (into) { runDown(ctx, into, part.dir, Math.abs(p.vel.x), 'stuntman'); splat(ctx, p, 'man'); return false; }
  const floor = floorAt(state, p.pos.x + p.width / 2);
  if (p.vel.y > 0 && p.pos.y + p.height >= floor) { p.pos.y = floor - p.height; splat(ctx, p, 'floor'); return false; }
  if (solidAhead(state, p)) { splat(ctx, p, 'wall'); return false; }
  // (gone off the screen: he's out of the picture)
  const off = p.pos.x + p.width < state.camera.x - 40 || p.pos.x > state.camera.x + CANVAS_WIDTH + 40;
  return p.pos.y < state.camera.y + 1200 && !off;
};

/** The stuntman, splatted: a burst of him, red all over what he hit (flat on the floor, a smear down a wall), the callout. */
const splat = (ctx: FrameContext, p: Projectile, on: 'man' | 'floor' | 'wall') => {
  const { state, fx } = ctx;
  const part = partOf(p);
  const at = { x: p.pos.x + p.width / 2, y: on === 'floor' ? p.pos.y + p.height : p.pos.y + p.height / 2 };
  playSound('splat', 1.2, -3); playSound('crunch', 0.8, 0); shakeScreen(state, 6, 4);
  fx.spawnDeathShower(at, part.dir, 2.2);
  fx.spawnExplosion(at, '#8B0000', 16, 0, 12);
  // (what's left of him lying there: red, his white helmet, a bit of the jumpsuit)
  const lie = (dx: number, dy: number, size: number, color: string) => state.particles.push({ pos: { x: at.x + dx, y: at.y + dy }, vel: { x: 0, y: 0 }, life: 260 + Math.random() * 120, color, size, ...(on === 'floor' ? { isSplat: true } : { isStuck: true }) });
  for (let i = 0; i < 6; i++) lie((Math.random() - 0.5) * (on === 'wall' ? 8 : 34), on === 'wall' ? (Math.random() - 0.5) * 30 + i * 3 : -1, 3 + Math.random() * 4, i % 3 ? '#7F1D1D' : '#991B1B');
  if (on !== 'man') { lie(part.dir * 4, on === 'floor' ? -2 : -4, 3, '#F8FAFC'); lie(-part.dir * 6, on === 'floor' ? -1 : 4, 3, '#DC2626'); }
};

/** Every frame: the clapperboard, the wrecks burning. */
const tick = (ctx: FrameContext) => {
  const { state } = ctx;
  if (clap > 0) clap--;
  for (const w of wrecks) {
    w.t++;
    if (w.t < 140 && state.frame % 2 === 0) state.particles.push({ pos: { x: w.x + (Math.random() - 0.5) * 60, y: w.y - 20 - Math.random() * 10 }, vel: { x: (Math.random() - 0.5), y: -1 - Math.random() * 1.5 }, life: 24, color: Math.random() < 0.4 ? 'rgba(68, 64, 60, 0.55)' : Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5 });
  }
  wrecks = wrecks.filter(w => w.t < 200);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The car: a low red sports car, a white racing stripe, the stunt driver's helmet in it, wheels spinning; speed lines. */
const drawCar = (c: Ctx, x: number, y: number, dir: number, wheel: number, rot: number, paint: Paint) => {
  c.save(); c.translate(x, y); c.scale(dir * CAR_SCALE, CAR_SCALE); c.rotate(rot);
  const W = 112, H = 34;
  // (speed lines behind)
  if (Math.abs(rot) < Math.PI / 2) { c.fillStyle = 'rgba(255, 255, 255, 0.6)'; for (let i = 0; i < 4; i++) c.fillRect(-W / 2 - 30 - i * 14, -H / 2 + 4 + i * 6, 24, 2); }
  const body = () => { c.beginPath(); c.moveTo(-W / 2, -2); c.lineTo(-W / 2 + 4, -14); c.lineTo(-18, -16); c.lineTo(-6, -28); c.lineTo(22, -28); c.lineTo(36, -16); c.lineTo(W / 2 - 2, -12); c.lineTo(W / 2, -2); c.lineTo(W / 2 - 4, 6); c.lineTo(-W / 2 + 2, 6); c.closePath(); };
  body(); c.fillStyle = INK; c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
  body(); c.fillStyle = paint.body; c.fill();
  c.save(); body(); c.clip(); c.fillStyle = paint.top; c.fillRect(-W / 2, -30, W, 6); c.fillStyle = paint.low; c.fillRect(-W / 2, 0, W, 8); c.fillStyle = paint.stripe; c.fillRect(-W / 2, -9, W, 3); c.restore();
  // windows, the driver in his helmet
  c.fillStyle = '#7DD3FC'; c.beginPath(); c.moveTo(-3, -26); c.lineTo(20, -26); c.lineTo(31, -16); c.lineTo(-14, -16); c.closePath(); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(8, -19, 5.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#18181B'; c.fillRect(9, -21, 5, 3);
  // lights
  c.fillStyle = '#FEF08A'; c.fillRect(W / 2 - 7, -9, 5, 3); c.fillStyle = '#B91C1C'; c.fillRect(-W / 2 + 1, -10, 4, 3);
  // wheels
  for (const wx of [-W / 2 + 22, W / 2 - 22]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, 4, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#27272A'; c.beginPath(); c.arc(wx, 4, 8.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(wx, 4, 4, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#52525B'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(wx + Math.cos(wheel) * 4, 4 + Math.sin(wheel) * 4); c.lineTo(wx - Math.cos(wheel) * 4, 4 - Math.sin(wheel) * 4); c.stroke();
  }
  c.restore();
};

/** The stuntman: red jumpsuit, white helmet, arms and legs everywhere. `pose`: tumbling, down, or up (thumbs up). */
const drawStuntman = (c: Ctx, x: number, y: number, dir: number, rot: number, pose: 'tumble' | 'down' | 'up' | 'dive') => {
  c.save(); c.translate(x, y); c.scale(dir * MAN_SCALE, MAN_SCALE); c.rotate(rot);
  const limb = (x0: number, y0: number, x1: number, y1: number, col: string) => { c.strokeStyle = INK; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = col; c.lineWidth = 4; c.stroke(); };
  if (pose === 'dive') {
    // (Superman: arms out straight ahead of him, fists together, body behind, legs together trailing; head first along -y)
    limb(-3, 8, -4, 20, '#B91C1C'); limb(3, 8, 4, 20, '#DC2626');
    c.fillStyle = INK; c.fillRect(-6, -8, 12, 17); c.fillStyle = '#DC2626'; c.fillRect(-5, -7, 10, 15); c.fillStyle = '#FFFFFF'; c.fillRect(-1, -7, 2, 15);
    limb(-4, -6, -2, -24, '#DC2626'); limb(4, -6, 2, -24, '#DC2626');
    c.fillStyle = INK; c.beginPath(); c.arc(0, -12, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(0, -12, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#18181B'; c.fillRect(-3, -16, 6, 3);
  } else if (pose === 'down') {
    limb(-12, -2, 12, -2, '#DC2626'); limb(10, -2, 18, 0, '#DC2626'); limb(-6, -3, -2, -10, '#DC2626');
    c.fillStyle = INK; c.beginPath(); c.arc(-15, -4, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(-15, -4, 5, 0, Math.PI * 2); c.fill();
  } else {
    const t = pose === 'tumble';
    limb(-3, -12, t ? -10 : -4, t ? -2 : 0, '#B91C1C'); limb(3, -12, t ? 12 : 4, t ? -4 : 0, '#DC2626');
    c.fillStyle = INK; c.fillRect(-6, -28, 12, 17); c.fillStyle = '#DC2626'; c.fillRect(-5, -27, 10, 15); c.fillStyle = '#FFFFFF'; c.fillRect(-1, -27, 2, 15);
    limb(-5, -24, t ? -14 : -9, t ? -32 : -14, '#DC2626');
    if (pose === 'up') { limb(5, -24, 11, -34, '#DC2626'); c.fillStyle = '#F2C29B'; c.fillRect(10, -40, 3, 5); }
    else limb(5, -24, 14, -18, '#DC2626');
    c.fillStyle = INK; c.beginPath(); c.arc(0, -34, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(0, -34, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#18181B'; c.fillRect(1, -36, 6, 3);
  }
  c.restore();
};

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const part = partOf(p);
  if (part.kind === 'car') { drawCar(c, p.pos.x + p.width / 2, p.pos.y + p.height - 6 * CAR_SCALE, part.dir, part.wheel, Math.atan2(p.vel.y, Math.abs(p.vel.x)) * 0.8, PAINT[part.paint]); return; }
  if (part.target && alive(part.target)) {
    // (the one he's going for, marked: a red reticle closing on it)
    const t = part.target, tx = t.pos.x + t.width / 2, ty = t.pos.y + t.height / 2, r = 14 + Math.sin(frame * 0.5) * 3;
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(tx, ty, r, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#EF4444'; c.lineWidth = 2; c.beginPath(); c.arc(tx, ty, r, 0, Math.PI * 2); c.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { c.beginPath(); c.moveTo(tx + dx * (r - 5), ty + dy * (r - 5)); c.lineTo(tx + dx * (r + 6), ty + dy * (r + 6)); c.stroke(); }
    drawStuntman(c, p.pos.x + p.width / 2, p.pos.y + p.height / 2, part.dir, part.spin, 'dive');
  } else drawStuntman(c, p.pos.x + p.width / 2, p.pos.y + p.height - 14 * MAN_SCALE, part.dir, part.spin, 'tumble');
};

const drawOverlay = (c: Ctx, state: GameState) => {
  // The wrecks: on their roofs, burning
  for (const w of wrecks) {
    if (w.t > 170 && w.t % 4 < 2) continue;
    drawCar(c, w.x, w.y - 16 * CAR_SCALE, w.dir, 0, Math.PI, PAINT[w.paint]);
  }
  // The clapperboard over his head: the clapper snapping down, ACTION!
  if (clap > 0) {
    const pl = state.player, x = pl.pos.x + pl.width / 2, y = pl.pos.y - 34, k = clap / 30;
    const shut = clap < 24, open = shut ? 0 : (clap - 24) / 6 * 0.6;
    c.save(); c.translate(x, y);
    c.fillStyle = INK; c.fillRect(-21, -6, 42, 28); c.fillStyle = '#27272A'; c.fillRect(-20, -5, 40, 26);
    c.fillStyle = '#F8FAFC'; c.font = '5px "Press Start 2P"'; c.textAlign = 'center'; c.fillText('SCENE 1', 0, 6); c.fillText('TAKE 1', 0, 15);
    c.save(); c.translate(-20, -6); c.rotate(-open);
    c.fillStyle = INK; c.fillRect(-1, -8, 42, 8);
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#18181B' : '#F8FAFC'; c.beginPath(); c.moveTo(1 + i * 8, -7); c.lineTo(9 + i * 8, -7); c.lineTo(7 + i * 8, -1); c.lineTo(-1 + i * 8, -1); c.closePath(); c.fill(); }
    c.restore();
    if (shut) { c.fillStyle = `rgba(253, 224, 71, ${Math.min(1, k * 1.6).toFixed(2)})`; c.font = '8px "Press Start 2P"'; c.fillText('ACTION!', clapDir * 4, -18); }
    c.textAlign = 'left';
    c.restore();
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
export const stopStuntCar = () => { clap = 0; wrecks = []; };

export const registerStuntCar = () => registerWeapon('STUNT_CAR', { fire: ctx => fire(ctx), update, draw, drawHeld: c => drawHeld(c), tick: ctx => tick(ctx), drawOverlay });
