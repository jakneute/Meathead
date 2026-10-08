// THE SOUL SUCKER (Spooky Land): a haunted-house shop vac with a meat grinder where the bag should be. Hold fire and
// it pulls on everybody in a big, short cone in front of it: it doesn't stop them, but it drags at them (they're slowed,
// and plenty of them turn round and try to get away from it), and it wears their poise down, quicker the closer they
// are (everybody's got some, shown on them, the beefier the more). Poise gone, they're done: they go in, feet first,
// and through the grinder, into the gore bag. Sucking uses its ammo; what it grinds fills the gore bag (separate, and
// it starts empty), up to four sprays' worth. Secondary fire (Y, or F) empties one spray's worth: once pressed, a long
// gush of gore out the front, all over whoever's there, like Dirty Dan's machine gun. A full bag won't suck any more
// till some's been sprayed out. Ammo pickups fill its ammo, never the bag: only sucking does.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { drawEnemyAt } from '../moves/grab';
import { KIND_TOP_REACH } from '../../m1/game/render/enemies';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

// ---------------------------------------------------------------------------------------------------------------
// The gore bag

/** One spray's worth of gore; the bag holds four. */
export const SPRAY = 100, MAX_SPRAYS = 4;
let gore = 0;
const listeners = new Set<() => void>();
/** How much gore's in the bag, and in sprays (whole and part). */
export const goreBag = () => gore;
export const goreSprays = () => gore / SPRAY;
export const onGore = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
const setGore = (v: number) => { const n = Math.max(0, Math.min(SPRAY * MAX_SPRAYS, v)); if (n !== gore) { gore = n; listeners.forEach(f => f()); } };

// ---------------------------------------------------------------------------------------------------------------
// Poise

/** Everybody's poise: how much pulling they'll take before they go in (the beefier, the more). */
const poiseMax = (e: Enemy) => Math.round(e.maxHealth * 0.6 + 10);
interface Poise { left: number; lastPulled: number; flees: boolean }
const poise = new WeakMap<Enemy, Poise>();
const poiseOf = (e: Enemy) => {
  let p = poise.get(e);
  if (!p) { p = { left: poiseMax(e), lastPulled: -999, flees: Math.random() < 0.6 }; poise.set(e, p); }
  return p;
};
/** (for tests) */
export const poiseLeft = (e: Enemy) => poise.get(e)?.left;
/** What can be pulled in: anybody but a boss, a mid-boss or a bystander. */
const suckable = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss' && !isMidBoss(e);

// ---------------------------------------------------------------------------------------------------------------
// The pull

/** The cone: out to REACH in front of the intake, opening wide (it's a big short cone). */
const REACH = 190, SPREAD = 1.05;
/** Poise worn off a frame: at the edge of the cone, right up at the intake. */
const DRAIN_FAR = 0.5, DRAIN_NEAR = 1.9;
/** After this long not being pulled, poise comes back, this much a frame. */
const REGEN_AFTER = 50, REGEN = 0.5;

let suckingAt = -10;
/** Somebody going in: flying into the intake, shrinking, turning, over SWALLOW frames. */
interface Swallow { e: Enemy; t: number; from: { x: number; y: number } }
const SWALLOW = 14;
let swallowing: Swallow[] = [];

const inCone = (state: GameState, e: Enemy, mouth: { x: number; y: number }) => {
  const f = state.player.facing;
  const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
  const dx = (ex - mouth.x) * f, dy = ey - mouth.y;
  if (dx < -e.width / 2 || dx > REACH) return null;
  const d = Math.hypot(Math.max(0, dx), dy);
  if (d > REACH + e.width / 2 || Math.abs(Math.atan2(dy, Math.max(1, dx))) > SPREAD) return null;
  return 1 - Math.min(1, d / REACH);
};

const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  // A full bag: it won't pull (the motor chokes, a puff of red out the intake); empty some of it first (secondary fire)
  if (gore >= SPRAY * MAX_SPRAYS) {
    pl.shootCooldown = 18;
    playSound('click', 0.8, -6);
    for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y }, vel: { x: pl.facing * (0.5 + Math.random()), y: -0.5 - Math.random() }, life: 16, color: i % 2 ? 'rgba(185, 28, 28, 0.7)' : 'rgba(200, 200, 200, 0.5)', size: 3 + Math.random() * 3 });
    return;
  }
  suckingAt = state.frame;
  pl.shootCooldown = 0;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SOUL_SUCKER--;
  if (state.frame % 9 === 0) playSound('suck', 0.8);
  for (const e of state.enemies) {
    if (!suckable(e)) continue;
    const near = inCone(state, e, mouth);
    if (near === null) continue;
    const ps = poiseOf(e);
    ps.lastPulled = state.frame;
    ps.left -= DRAIN_FAR + (DRAIN_NEAR - DRAIN_FAR) * near;
    // Dragged at: slowed, pulled in toward the intake a little (the nearer the harder), and plenty of them turn round to
    // get away from it (it doesn't stop what they're doing)
    const toward = mouth.x < e.pos.x + e.width / 2 ? -1 : 1;
    e.vel.x *= 0.55;
    e.pos.x += toward * (0.5 + near * 1.6);
    if (ps.flees) e.facing = (-toward) as 1 | -1;
    // (bits of the floor and the air going in with them)
    if (Math.random() < 0.35) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: toward * (2 + near * 4), y: (mouth.y - e.pos.y - e.height / 2) * 0.03 }, life: 14, color: Math.random() < 0.5 ? 'rgba(220, 220, 220, 0.6)' : '#78716C', size: 1.5 + Math.random() * 1.5 });
    if (ps.left <= 0) swallow(ctx, e);
  }
};

/** Poise gone: in he goes. Out of the fight right away; drawn going in, and ground up at the end of it. */
const swallow = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  state.enemies = state.enemies.filter(o => o !== e);
  swallowing.push({ e, t: 0, from: { x: e.pos.x + e.width / 2, y: e.pos.y + e.height } });
  playSound('whoosh', 0.9, 4);
};

/** Through the grinder and into the bag: the gore for it (by how much of him there was), blood out the intake, the line. */
const grind = (ctx: FrameContext, s: Swallow) => {
  const { state, fx } = ctx;
  const pl = state.player, mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  setGore(gore + poiseMax(s.e));
  s.e.health = 0;
  playSound('grind'); playSound('splat', 0.7, -3);
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: mouth.x, y: mouth.y }, vel: { x: pl.facing * (Math.random() * 3) + (Math.random() - 0.5) * 3, y: -1 - Math.random() * 3 }, life: 20 + Math.random() * 20, color: i % 3 ? '#8B0000' : '#B91C1C', size: 2 + Math.random() * 3 });
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
const SPRAY_FRAMES = 100, GLOB_EVERY = 2, GLOB_DMG = 13, GLOB_SPEED = 15, GLOB_SPREAD = 0.2, GLOB_LIFE = 40;
let sprayLeft = 0;

const tick = (ctx: FrameContext, input: { secondary?: boolean; moveUp: boolean; moveDown: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const pl = state.player;
  // Secondary: a spray's worth out of the bag (once it's going it goes; another waits till it's done)
  if (equipped && input.secondary && sprayLeft <= 0 && gore >= SPRAY) { setGore(gore - SPRAY); sprayLeft = SPRAY_FRAMES; }
  if (sprayLeft > 0) {
    sprayLeft--;
    const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
    if (sprayLeft % GLOB_EVERY === 0) {
      const aim = input.moveUp ? -0.45 : input.moveDown && !pl.isGrounded ? 0.45 : 0;
      const a = aim + (Math.random() * 2 - 1) * GLOB_SPREAD;
      const size = 7 + Math.random() * 5;
      state.projectiles.push({
        id: `gore-${state.frame}-${Math.random()}`, pos: { x: mouth.x - size / 2, y: mouth.y - size / 2 },
        vel: { x: pl.facing * Math.cos(a) * GLOB_SPEED + pl.vel.x, y: Math.sin(a) * GLOB_SPEED },
        width: size, height: size, health: 1, maxHealth: 1, type: 'projectile', damage: GLOB_DMG, owner: 'player',
        custom: 'SOUL_SUCKER', customData: { life: GLOB_LIFE, hit: [] as string[] },
      });
    }
    if (sprayLeft % 12 === 0) playSound('gorespray');
  }
  // Poise comes back to whoever's been let go a while
  if (state.frame % 2 === 0) for (const e of state.enemies) {
    const ps = poise.get(e);
    if (ps && state.frame - ps.lastPulled > REGEN_AFTER && ps.left < poiseMax(e)) ps.left = Math.min(poiseMax(e), ps.left + REGEN * 2);
  }
  // Whoever's going in
  if (swallowing.length) {
    for (const s of swallowing) if (++s.t === SWALLOW) grind(ctx, s);
    swallowing = swallowing.filter(s => s.t < SWALLOW);
  }
};

/** A glob of gore: straight out, dropping a little, through whoever it hits (once each), splatting on whatever's solid. */
const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state, fx } = ctx;
  const g = p.customData as { life: number; hit: string[] };
  p.vel.y += 0.25;
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  const splat = () => { for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 }, vel: { x: -p.vel.x * 0.1 + (Math.random() - 0.5) * 2, y: -Math.random() * 2 }, life: 18, color: '#7F1D1D', size: 2 + Math.random() * 2 }); };
  if (--g.life <= 0) return false;
  if (state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && p.pos.x < b.x + b.w && p.pos.x + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height > b.y)) { splat(); return false; }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent || e.type === 'boss' || g.hit.includes(e.id)) continue;
    if (p.pos.x > e.pos.x + e.width || p.pos.x + p.width < e.pos.x || p.pos.y > e.pos.y + e.height || p.pos.y + p.height < e.pos.y) continue;
    g.hit.push(e.id);
    e.health -= p.damage;
    splat();
    const dir = Math.sign(p.vel.x) || 1;
    if (e.health <= 0) { fx.blowAwayEnemy(e, { x: dir * 6, y: -6 }, m2Kill('gore_kill'), dir); fx.spawnKillCallout(e, grabCallout('gorespray')); }
    else { fx.spawnDamageNumber(e.pos, p.damage); e.vel.x += dir * 0.6; }
    // (one in two goes on through: it's a gush, not bullets)
    if (g.hit.length > 1 || Math.random() < 0.5) return false;
  }
  return true;
};

const draw = (c: Ctx, p: Projectile) => {
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2, r = p.width / 2;
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
  // (the bag, swelling with what's in it)
  const br = 3 + full * 5;
  c.fillStyle = INK; c.beginPath(); c.ellipse(8, 9 + br * 0.6, br + 1.2, br * 0.85 + 1.2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = full > 0 ? '#B91C1C' : '#78716C'; c.beginPath(); c.ellipse(8, 9 + br * 0.6, br, br * 0.85, 0, 0, Math.PI * 2); c.fill();
  if (full > 0) { c.fillStyle = '#7F1D1D'; c.fillRect(9, 9 + br * 0.6, 2, 2); c.fillStyle = '#FCA5A5'; c.fillRect(6, 8 + br * 0.3, 1, 1); }
  c.fillStyle = INK; c.fillRect(-3, -4, 18, 11);
  c.fillStyle = '#7C3AED'; c.fillRect(-2, -3, 16, 9); c.fillStyle = '#A78BFA'; c.fillRect(-2, -3, 16, 2); c.fillStyle = '#4C1D95'; c.fillRect(-2, 4, 16, 2);
  c.fillStyle = frame % 40 < 20 ? '#4ADE80' : '#86EFAC'; c.fillRect(1, -1, 5, 4);
  c.fillStyle = '#3F3F46'; c.fillRect(14, -1, 8, 4);
  c.fillStyle = INK; c.beginPath(); c.moveTo(21, -2); c.lineTo(31, -7); c.lineTo(31, 10); c.lineTo(21, 5); c.closePath(); c.fill();
  c.fillStyle = '#A1A1AA'; c.beginPath(); c.moveTo(22, -1); c.lineTo(30, -5.5); c.lineTo(30, 8.5); c.lineTo(22, 4); c.closePath(); c.fill();
  c.fillStyle = '#18181B'; c.fillRect(29, -5, 2, 13);
  c.fillStyle = '#F4F4F5'; for (let k = 0; k < 4; k++) c.fillRect(28.5, -4 + ((k * 3 + frame) % 12), 1, 1.5);
};

/** Over the enemies: everybody's poise (a bar on them, while it's been worn at or he's got the sucker out), the cone of
 * air while it's going, and whoever's going in. */
const drawOverlay = (c: Ctx, state: GameState) => {
  const pl = state.player, out = pl.currentWeapon === 'SOUL_SUCKER';
  void out;
  const sucking = state.frame - suckingAt <= 1 && out;
  const mouth = muzzlePoint(pl, 'SOUL_SUCKER');
  // The pull: streaks of air rushing in to the intake from all over the cone
  if (sucking) {
    for (let k = 0; k < 14; k++) {
      const ph = ((state.frame * 0.09 + k * 0.37) % 1), a = ((k * 0.61) % 1 - 0.5) * 2 * SPREAD;
      const d = REACH * (1 - ph);
      const x = mouth.x + pl.facing * Math.cos(a) * d, y = mouth.y + Math.sin(a) * d;
      c.strokeStyle = `rgba(230, 230, 240, ${(0.15 + ph * 0.45).toFixed(2)})`; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - pl.facing * Math.cos(a) * 14, y - Math.sin(a) * 14); c.stroke();
    }
  }
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

export const registerSoulSucker = () => registerWeapon('SOUL_SUCKER', { fire: ctx => fire(ctx), update, draw: (c, p) => draw(c, p), drawHeld, tick, drawOverlay });
