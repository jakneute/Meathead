// THE SPELLBOOK OF THE DAMNED (Fantasy Land): a heavy black tome, a skull on the cover, pages that glow. Fire reads
// out an elemental storm on whoever's about (up to three of them, nearest first): a METEOR that comes down on one and
// goes up in a blast (anybody it doesn't kill is left burning a while), a COMET that comes down on another (it hurts,
// and anybody it doesn't kill is frozen solid a good while), and LIGHTNING that strikes a third over and over for
// a few seconds (the beefy ones can live through it). Fewer than three about, and some of them get more than one of it at once. A spell's a while coming back.
// Secondary fire (Y, or F) is the support spell, BULK UP: for a while he's a lot faster, a lot bigger, and whatever he
// charges or throws goes a lot further; it costs more mana than a storm, and it's a while coming back. Its ammo's MANA (pickups fill it the same).
// Hanging off a vine (Meathead 2's jungle), both work one-handed, the other hand on the vine: the storm read out of the
// book thrust out at arm's length, its pages flipping over, the vine fizzing in his other fist; the bulk-up a one-armed
// flex, the book up in his fist.

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { setBuffs } from '../../m1/game/core/buffs';
import { say, MEATHEAD_VOICE, pickLine } from '../../m1/game/platform/speech';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_Y } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { BULK_LINES, BULK_FAIL_LINES } from '../lines/weaponLines';
import { drawPoseSprite, drawPoseHead } from '../moves/grab';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../m1/game/render/player/body';
import { setArmor } from '../../m1/game/core/resist';
import { vineGrip } from '../../m1/game/combat/muzzle';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

const CAST_COOLDOWN = 80, REACH = 680, CAST_POSE = 32;
/** The wind-up: this long reading it out, the runes building, before the storm comes (he's stood there for it). */
const WINDUP = 40;
/** The storm still to come (the wind-up's frames left), and the cast to finish when it's done. */
let winding = 0;
const METEOR = { dmg: 80, edge: 25, radius: 95, burn: 240, burnDmg: 0.4 };
const COMET = { dmg: 45, freeze: 320 };
/** The lightning: a strike this often, this hard, for this long (three seconds: about 180 in all, a shooter's dead, a
 * bouncer's still standing). */
const BOLT = { every: 14, dmg: 15, maxFrames: 186 };
/** What each costs in mana: a storm 9 to 13, a roll each time (11 on average); bulking up a lot more. */
const MANA = { storm: [9, 13] as const };
const BULK = { mana: 24, frames: 720, cooldown: 480, speed: 1.6, size: 1.3, knock: 2.2 };

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
const mid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

// ---------------------------------------------------------------------------------------------------------------
// The storm

type Element = 'meteor' | 'comet';
interface Fall { el: Element; target: Enemy | null; to: { x: number; y: number } }
const fallOf = (p: Projectile) => p.customData as Fall;

/** Whoever's struck over and over, and when next. */
let bolts: { e: Enemy; next: number; until: number; flash: number; path: { x: number; y: number }[]; rift: { x: number; y: number } | null }[] = [];
/** Whoever's burning, and how long for. */
const burning = new Map<Enemy, number>();
/** The cast itself (runes round him), frames left. */
let casting = 0;
/** Shockwave rings going out from what's landed, and the whole screen flashing (lightning, the meteor going up). */
let rings: { x: number; y: number; t: number; life: number; r: number; color: string }[] = [];
let flash = 0, flashColor = '255, 255, 255';
const ring = (x: number, y: number, r: number, color: string, life = 18) => rings.push({ x, y, t: 0, life, r, color });
/**
 * The void: everything the book calls comes out of a tear in the sky, opened up on the screen a moment before
 * (black, starry, rimmed in violet, swirling), the meteor or the comet pushed out of it, the lightning dropping out of
 * one that hangs over its man for as long as it's striking him. `life` frames in all; `hold`: it stays open while
 * that's true.
 */
interface Rift { x: number; y: number; t: number; life: number; size: number; seed: number; follow?: () => { x: number } | null }
let rifts: Rift[] = [];
const RIFT_OPEN = 16;
const openRift = (x: number, y: number, size: number, life: number, follow?: Rift['follow']) => { const r: Rift = { x, y, t: 0, life, size, seed: Math.random() * 1000, follow }; rifts.push(r); playSound('alienCharge', 0.5, -10); return r; };
/**
 * Where a rift can go: on the screen (clear of the HUD, not down at the bottom), and never in a wall, a ceiling or a
 * floor (the whole tear clear of anything solid). As near to where it's wanted as it can be, the way down from it to
 * `to` clear too if there's a spot like that; failing a clear way down, just somewhere clear; failing that, where it
 * was wanted.
 */
const riftHalf = (size: number) => ({ w: 46 * size, h: 30 * size });
const inSolid = (state: GameState, x: number, y: number, size: number) => {
  const { w, h } = riftHalf(size);
  return state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && !b.oneWay && x - w < b.x + b.w && x + w > b.x && y - h < b.y + b.h && y + h > b.y);
};
const clearLine = (state: GameState, a: { x: number; y: number }, b: { x: number; y: number }) => {
  for (let i = 1; i < 12; i++) { const k = i / 12, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k; if (state.blocks.some(q => q.type !== 'pit' && q.type !== 'door' && !q.oneWay && x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h)) return false; }
  return true;
};
const riftSpot = (state: GameState, want: { x: number; y: number }, size: number, to: { x: number; y: number } | null) => {
  const { w, h } = riftHalf(size);
  const x0 = state.camera.x + w + 8, x1 = state.camera.x + CANVAS_WIDTH - w - 8;
  const y0 = state.camera.y + HUD_CLEAR_Y + h + 4, y1 = Math.max(y0, Math.min(state.camera.y + CANVAS_HEIGHT * 0.6, (to ? to.y : Infinity) - 40));
  const clampX = (x: number) => Math.max(x0, Math.min(x1, x)), clampY = (y: number) => Math.max(y0, Math.min(y1, y));
  const spots: { x: number; y: number }[] = [];
  for (const dy of [0, 25, 50, 80, 115, 150, 190]) for (const dx of [0, 40, -40, 80, -80, 130, -130, 190, -190, 260, -260, 340, -340]) spots.push({ x: clampX(want.x + dx), y: clampY(want.y + dy) });
  return spots.find(q => !inSolid(state, q.x, q.y, size) && (!to || clearLine(state, q, to)))
    ?? spots.find(q => !inSolid(state, q.x, q.y, size))
    ?? { x: clampX(want.x), y: clampY(want.y) };
};
/** Things still to come out of a rift that's opening. */
let pending: { at: number; el: Element; target: Enemy | null; to: { x: number; y: number }; from: { x: number; y: number } }[] = [];

/** A scorch on the floor where something hit it (lies there, fading slowly). */
const scorch = (state: GameState, x: number, y: number, size: number, color = '#1C1917', life = 400) => {
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * size * 2, y: y - 1 }, vel: { x: 0, y: 0 }, life: life + Math.random() * life * 0.5, color, size: size * (0.5 + Math.random() * 0.5), isSplat: true });
};
/** Bits thrown up off what's hit: chunks that fall and bounce. */
const debris = (state: GameState, x: number, y: number, n: number, colors: string[], speed = 7, life = 50) => {
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, sp = speed * (0.4 + Math.random() * 0.8); state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: life + Math.random() * life * 0.8, color: colors[i % colors.length], size: 2 + Math.random() * 3, grav: 0.35, chunk: true }); }
};

/** Killed by a spell: his own death for what got him, the line, the callout. */
const spellKill = (ctx: FrameContext, e: Enemy, how: 'charred' | 'fried' | 'pancaked') => {
  ctx.fx.killWithAnimation(e, how, m2Kill('spell_kill'), grabCallout('spell'));
  bolts = bolts.filter(b => b.e !== e); burning.delete(e);
};
const hurt = (ctx: FrameContext, e: Enemy, dmg: number, how: 'charred' | 'fried' | 'pancaked') => {
  if (isMidBoss(e)) dmg *= 0.5;
  e.health -= dmg;
  if (e.health <= 0) { if (isMidBoss(e)) e.health = 1; else { spellKill(ctx, e, how); return true; } }
  ctx.fx.spawnDamageNumber(e.pos, Math.round(dmg), dmg > 30);
  return false;
};

/** Fire: the mana spent, and the reading starts: the storm itself comes at the end of the wind-up (unleash). */
const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SPELLBOOK = Math.max(0, pl.weaponAmmo.SPELLBOOK - (MANA.storm[0] + Math.floor(Math.random() * (MANA.storm[1] - MANA.storm[0] + 1))));
  pl.shootCooldown = CAST_COOLDOWN + WINDUP;
  winding = WINDUP; casting = WINDUP + CAST_POSE;
  playSound('spell', 0.5, -6);
};

/** Read the storm out: on the nearest three about (fewer, and they get more of it), one of each. */
const unleash = (ctx: FrameContext) => {
  const { state } = ctx;
  const pl = state.player;
  const px = pl.pos.x + pl.width / 2, py = pl.pos.y + pl.height / 2;
  const onScreen = (e: Enemy) => e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  const targets = state.enemies.filter(e => alive(e) && onScreen(e) && Math.hypot(mid(e).x - px, mid(e).y - py) < REACH)
    .sort((a, b) => Math.hypot(mid(a).x - px, mid(a).y - py) - Math.hypot(mid(b).x - px, mid(b).y - py)).slice(0, 3);
  const at = (i: number) => (targets.length ? targets[i % targets.length] : null);
  const ahead = { x: px + pl.facing * 260, y: pl.pos.y + pl.height };
  fall(state, 'meteor', at(0), ahead);
  fall(state, 'comet', at(1), { x: ahead.x + pl.facing * 90, y: ahead.y });
  const z = at(2);
  if (z) {
    const bolt = { e: z, next: state.frame + RIFT_OPEN + 2, until: state.frame + BOLT.maxFrames, flash: 0, path: [] as { x: number; y: number }[], rift: null as Rift | null };
    const at = riftSpot(state, { x: mid(z).x, y: state.camera.y + HUD_CLEAR_Y + 20 }, 0.8, mid(z));
    bolt.rift = openRift(at.x, at.y, 0.8, BOLT.maxFrames + 12, () => (bolts.includes(bolt) ? mid(bolt.e) : null));
    bolts.push(bolt);
  }
  playSound('spell');
};

/** A meteor or a comet, out of the sky over him (from off to one side), coming down on him. */
const fall = (state: GameState, el: Element, target: Enemy | null, fallback: { x: number; y: number }) => {
  const to = target ? mid(target) : fallback;
  const side = Math.random() < 0.5 ? -1 : 1;
  // (the rift it comes out of: up in the sky, off to one side of him, on the screen, below the HUD)
  const size = el === 'meteor' ? 1.15 : 0.9;
  const from = riftSpot(state, { x: to.x + side * (130 + Math.random() * 90), y: state.camera.y + HUD_CLEAR_Y + 30 + Math.random() * 40 }, size, to);
  openRift(from.x, from.y, size, RIFT_OPEN + 34);
  pending.push({ at: state.frame + RIFT_OPEN, el, target, to, from });
};
/** Out of the rift, at last. */
const emerge = (state: GameState, q: (typeof pending)[number]) => {
  const { el, target, from } = q;
  const to = target && alive(target) ? mid(target) : q.to;
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1, sp = el === 'meteor' ? 13 : 15;
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: from.x, y: from.y }, vel: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 3 }, life: 18, color: i % 2 ? '#A855F7' : '#1E1B4B', size: 3 + Math.random() * 3 });
  playSound('whoosh', 0.9, el === 'meteor' ? -6 : 3);
  const size = el === 'meteor' ? 26 : 18;
  state.projectiles.push({
    id: `spell-${el}-${state.frame}-${Math.random()}`, pos: { x: from.x - size / 2, y: from.y - size / 2 },
    vel: { x: (to.x - from.x) / d * sp, y: (to.y - from.y) / d * sp }, width: size, height: size, health: 1, maxHealth: 1,
    type: 'projectile', damage: 0, owner: 'player', custom: 'SPELLBOOK', customData: { el, target, to } satisfies Fall,
  });
};

const solid = (state: GameState, x: number, y: number) =>
  state.blocks.some(b => b.type !== 'pit' && b.type !== 'door' && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && (!b.oneWay || y <= b.y + 6));

/** A meteor or a comet coming down: steering in on him as he moves, till it hits him, somebody else, or the ground. */
const update = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const f = fallOf(p);
  if (f.target && alive(f.target)) {
    const t = mid(f.target), c = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
    const sp = Math.hypot(p.vel.x, p.vel.y), d = Math.hypot(t.x - c.x, t.y - c.y) || 1;
    p.vel.x += ((t.x - c.x) / d * sp - p.vel.x) * 0.12; p.vel.y += ((t.y - c.y) / d * sp - p.vel.y) * 0.12;
  }
  p.pos.x += p.vel.x; p.pos.y += p.vel.y;
  const c = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  // (its trail: fire and smoke, or ice and sparkle)
  for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: c.x + (Math.random() - 0.5) * p.width * 0.6, y: c.y + (Math.random() - 0.5) * p.height * 0.6 }, vel: { x: -p.vel.x * 0.15 + (Math.random() - 0.5), y: -p.vel.y * 0.15 + (Math.random() - 0.5) }, life: 16 + Math.random() * 10, color: f.el === 'meteor' ? ['#F97316', '#FDE047', '#57534E'][i + Math.floor(Math.random() * 2)] : ['#BAE6FD', '#FFFFFF', '#7DD3FC'][i + Math.floor(Math.random() * 2)], size: 3 + Math.random() * 4 });
  const hit = state.enemies.find(e => alive(e) && c.x > e.pos.x - 4 && c.x < e.pos.x + e.width + 4 && c.y > e.pos.y - 4 && c.y < e.pos.y + e.height + 4);
  if (hit || solid(state, c.x, c.y + p.height / 2) || c.y > state.camera.y + 900) {
    if (f.el === 'meteor') meteorBlast(ctx, c); else cometHit(ctx, c, hit ?? null);
    return false;
  }
  return true;
};

/** The meteor going up: a blast, everybody in it hurt by how near, and whoever lives through it left burning. */
const meteorBlast = (ctx: FrameContext, at: { x: number; y: number }) => {
  const { state, fx } = ctx;
  playSound('boom'); playSound('crash', 0.7, -6); shakeScreen(state, 22, 12);
  fx.spawnExplosion(at, '#F97316', 44, 0, 26); fx.spawnExplosion(at, '#FDE047', 28, 0, 18); fx.spawnExplosion(at, '#FFFFFF', 10, 0, 10); fx.spawnExplosion(at, '#57534E', 22, 0, 22);
  ring(at.x, at.y, METEOR.radius * 1.4, '253, 186, 116', 20); ring(at.x, at.y, METEOR.radius * 0.8, '255, 255, 255', 10);
  flash = 6; flashColor = '255, 200, 120';
  debris(state, at.x, at.y, 16, ['#57534E', '#78716C', '#F97316', '#7C2D12'], 9);
  // (a pall of smoke hanging over it, and embers)
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 60, y: at.y - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() * 0.8 }, life: 60 + Math.random() * 40, color: 'rgba(68, 64, 60, 0.45)', size: 10 + Math.random() * 10 });
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 40, y: at.y }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 4 }, life: 50 + Math.random() * 30, color: i % 2 ? '#FDE047' : '#FB923C', size: 2 });
  scorch(state, at.x, at.y + 8, 14);
  for (const e of [...state.enemies]) {
    if (!alive(e)) continue;
    const d = Math.hypot(mid(e).x - at.x, mid(e).y - at.y);
    if (d > METEOR.radius + e.width / 2) continue;
    const k = Math.max(0, 1 - d / (METEOR.radius + e.width / 2));
    if (!hurt(ctx, e, METEOR.edge + (METEOR.dmg - METEOR.edge) * k, 'charred')) {
      burning.set(e, METEOR.burn);
      e.vel = { x: Math.sign(mid(e).x - at.x || 1) * 4 * k, y: -4 * k };
    }
  }
};

/** The comet: it hurts whoever it comes down on; living through it, he's frozen solid (anybody right by it too). */
const cometHit = (ctx: FrameContext, at: { x: number; y: number }, hit: Enemy | null) => {
  const { state, fx } = ctx;
  playSound('ice'); playSound('glass', 0.9, 4); playSound('crack', 0.8, 2); shakeScreen(state, 12, 6);
  fx.spawnExplosion(at, '#BAE6FD', 34, 0, 20); fx.spawnExplosion(at, '#FFFFFF', 18, 0, 12); fx.spawnExplosion(at, '#7DD3FC', 14, 0, 16);
  ring(at.x, at.y, 80, '186, 230, 253', 18); ring(at.x, at.y, 40, '255, 255, 255', 10);
  flash = 4; flashColor = '200, 235, 255';
  debris(state, at.x, at.y, 14, ['#E0F2FE', '#BAE6FD', '#FFFFFF', '#7DD3FC'], 8, 30);
  // (frost hanging in the air a moment)
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 50, y: at.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -0.3 - Math.random() * 0.4 }, life: 50, color: 'rgba(224, 242, 254, 0.5)', size: 6 + Math.random() * 8 });
  scorch(state, at.x, at.y + 8, 12, 'rgba(186, 230, 253, 0.8)', 70);
  for (const e of [...state.enemies]) {
    if (!alive(e)) continue;
    const near = e === hit || Math.hypot(mid(e).x - at.x, mid(e).y - at.y) < 34 + e.width / 2;
    if (!near) continue;
    if (!hurt(ctx, e, e === hit ? COMET.dmg : COMET.dmg * 0.5, 'pancaked') && !isMidBoss(e)) { e.frozeAt = state.frame; e.frozenTimer = COMET.freeze; }
  }
};

/** A lightning bolt's path down out of the sky to him: jagged. */
const boltPath = (state: GameState, to: { x: number; y: number }, from: { x: number; y: number } | null) => {
  const pts = [from ? { x: from.x, y: from.y } : { x: to.x + (Math.random() - 0.5) * 80, y: state.camera.y - 10 }];
  const n = 9;
  for (let i = 1; i < n; i++) { const k = i / n; pts.push({ x: pts[0].x + (to.x - pts[0].x) * k + (Math.random() - 0.5) * 34, y: pts[0].y + (to.y - pts[0].y) * k }); }
  pts.push(to);
  return pts;
};

// ---------------------------------------------------------------------------------------------------------------
// Bulk up

let bulkLeft = 0, bulkCool = 0, secondaryWas = false;
/** The bulk-up's pose, frames left: struck before it takes (nothing interrupts it: hurt, he takes it, but he isn't knocked about). */
let posing = 0, bulkFailSaidAt = -9999;
const POSE = 40;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(f => f());
/** The bulk-up's state, for the HUD: on (and how much is left of it), or how long till it can be again. */
export const bulkState = () => bulkStateNow;
let bulkStateNow = { on: 0, cool: 0 };
export const onBulk = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
const publish = () => { const on = Math.ceil(bulkLeft / 60), cool = Math.ceil(bulkCool / 60); if (on !== bulkStateNow.on || cool !== bulkStateNow.cool) { bulkStateNow = { on, cool }; notify(); } };
export const BULK_SECONDS = BULK.frames / 60;

const meatheadSays = (state: GameState, text: string) => {
  say(text, MEATHEAD_VOICE, 'casual', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 180; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
  });
};

/** Armored while he's reading a storm out or bulking up: hurt, but not knocked about or out of it (core/resist). */
let armored = false;
const syncArmor = () => { const want = casting > 0 || posing > 0; if (want !== armored) { armored = want; setArmor(want); } };

const tick = (ctx: FrameContext, input: { secondary?: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const pl = state.player;
  if (casting > 0) {
    // (reading it out: struck in the pose a moment, standing his ground; hurt, he takes it, but nothing knocks him out
    // of it (armor: core/resist); only dying does)
    if (state.deathTimer > 0) { casting = 0; winding = 0; pl.hidden = false; }
    else if (winding > 0 && --winding === 0) unleash(ctx);
    else { casting--; pl.vel.x = 0; pl.pushbackTimer = 0; pl.lockTimer = Math.max(pl.lockTimer, 2); pl.hidden = casting > 0 && !pl.vine; }
  }
  if (flash > 0) flash--;
  // Rifts opening, hanging there, closing; what's due out of them
  for (const r of rifts) {
    r.t++; const at = r.follow?.(); if (r.follow && !at && r.life - r.t > 12) r.life = r.t + 12;
    // (going along over him: on the screen, and never into a wall)
    if (at) { const { w } = riftHalf(r.size); const nx = Math.max(state.camera.x + w + 8, Math.min(state.camera.x + CANVAS_WIDTH - w - 8, r.x + (at.x - r.x) * 0.15)); if (!inSolid(state, nx, r.y, r.size)) r.x = nx; }
  }
  rifts = rifts.filter(r => r.t < r.life);
  if (pending.length) { for (const q of pending.filter(q => q.at <= state.frame)) emerge(state, q); pending = pending.filter(q => q.at > state.frame); }
  if (rings.length) { rings.forEach(r => r.t++); rings = rings.filter(r => r.t < r.life); }
  // Bulk up: secondary, when it's ready
  const press = !!input.secondary && !secondaryWas;
  secondaryWas = !!input.secondary;
  if (equipped && press) {
    const mana = ctx.cheats.infiniteAmmo || pl.weaponAmmo.SPELLBOOK >= BULK.mana;
    if (bulkLeft <= 0 && bulkCool <= 0 && posing <= 0 && (pl.isGrounded || !!pl.vine) && mana) {
      if (!ctx.cheats.infiniteAmmo) pl.weaponAmmo.SPELLBOOK -= BULK.mana;
      // First the pose: the book held up, flexing, the power going into him
      posing = POSE;
      playSound('spell', 1, -8);
      meatheadSays(state, pickLine(BULK_LINES));
    } else if (posing <= 0) {
      // (it won't: a click, and he says why, a while apart)
      playSound('click', 0.7, -4);
      const why = bulkLeft > 0 ? 'already' : bulkCool > 0 ? 'cooldown' : !mana ? 'mana' : 'air';
      if (state.frame - bulkFailSaidAt > 150) { bulkFailSaidAt = state.frame; const pool = BULK_FAIL_LINES[why]; meatheadSays(state, pickLine(pool)); }
    }
  }
  syncArmor();
  if (posing > 0) {
    // (held there: no moving, no shooting, and nothing knocks him out of it; it still hurts)
    pl.vel.x = 0; pl.lockTimer = Math.max(pl.lockTimer, 2); pl.hidden = !pl.vine;
    pl.pushbackTimer = 0;
    if (state.frame % 2 === 0) { const a = Math.random() * Math.PI * 2, r = 50; state.particles.push({ pos: { x: pl.pos.x + pl.width / 2 + Math.cos(a) * r, y: pl.pos.y + pl.height / 2 + Math.sin(a) * r }, vel: { x: -Math.cos(a) * 3, y: -Math.sin(a) * 3 }, life: 16, color: Math.random() < 0.5 ? '#C084FC' : '#F87171', size: 3 }); }
    if (--posing === 0) {
      // ...and it takes: the burst, and he's huge
      pl.hidden = false;
      bulkLeft = BULK.frames;
      setBuffs({ speed: BULK.speed, size: BULK.size, knock: BULK.knock });
      playSound('slam', 0.9, -6); playSound('boom', 0.6, -8); shakeScreen(state, 12, 6);
      ring(pl.pos.x + pl.width / 2, pl.pos.y + pl.height, 90, '248, 113, 113', 18);
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; state.particles.push({ pos: { x: pl.pos.x + pl.width / 2, y: pl.pos.y + pl.height / 2 }, vel: { x: Math.cos(a) * 6, y: Math.sin(a) * 6 }, life: 22, color: i % 2 ? '#F87171' : '#FDE047', size: 4 }); }
    }
  }
  if (bulkLeft > 0) {
    // (steam coming off him, red)
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: pl.pos.x + Math.random() * pl.width, y: pl.pos.y + Math.random() * pl.height * 0.6 }, vel: { x: (Math.random() - 0.5), y: -1.5 - Math.random() }, life: 24, color: 'rgba(248, 113, 113, 0.45)', size: 4 + Math.random() * 4 });
    if (--bulkLeft <= 0) { setBuffs({ speed: 1, size: 1, knock: 1 }); bulkCool = BULK.cooldown; playSound('whoosh', 0.6, -8); }
  } else if (bulkCool > 0) bulkCool--;
  publish();
  // The burning: a little every frame till it's out (or he's dead)
  for (const [e, left] of burning) {
    if (!alive(e)) { burning.delete(e); continue; }
    if (left <= 0) { burning.delete(e); continue; }
    burning.set(e, left - 1);
    for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.7 }, vel: { x: (Math.random() - 0.5), y: -1.2 - Math.random() * 1.8 }, life: 16 + Math.random() * 8, color: Math.random() < 0.25 ? 'rgba(68, 64, 60, 0.6)' : Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
    e.health -= METEOR.burnDmg;
    if (left % 20 === 0) ctx.fx.spawnDamageNumber(e.pos, Math.round(METEOR.burnDmg * 20));
    if (e.health <= 0) { if (isMidBoss(e)) e.health = 1; else spellKill(ctx, e, 'charred'); }
  }
  // The lightning: strike, strike, strike, for a few seconds (or till he's dead)
  for (const b of [...bolts]) {
    if (b.flash > 0) b.flash--;
    if (!alive(b.e) || state.frame > b.until) { bolts = bolts.filter(o => o !== b); continue; }
    // (the whole time it's on him he's in it: lit up, jerking, going nowhere)
    if (state.frame >= b.next - BOLT.every) b.e.shockedUntil = state.frame + 1;
    if (state.frame >= b.next) {
      b.next = state.frame + BOLT.every; b.flash = 6;
      b.path = boltPath(state, { x: mid(b.e).x, y: b.e.pos.y + b.e.height * 0.3 }, b.rift);
      playSound('bolt'); playSound('taser', 0.6, 3); shakeScreen(state, 7, 4);
      flash = 3; flashColor = '220, 245, 255';
      const hitAt = { x: mid(b.e).x, y: b.e.pos.y + b.e.height };
      ring(hitAt.x, hitAt.y, 46, '165, 243, 252', 12);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { ...mid(b.e) }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 12 + Math.random() * 8, color: i % 3 ? '#FFFFFF' : '#A5F3FC', size: 2 + Math.random() * 2 });
      for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: hitAt.x + (Math.random() - 0.5) * 20, y: hitAt.y - 4 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 2 }, life: 30, color: 'rgba(87, 83, 78, 0.5)', size: 5 + Math.random() * 4 });
      scorch(state, hitAt.x, hitAt.y, 8);
      // (and he's shown taking it: lit up, jerking, the current crawling over him, till the next one)
      b.e.shockedUntil = state.frame + BOLT.every;
      if (!isMidBoss(b.e)) b.e.pauseTimer = Math.max(b.e.pauseTimer || 0, 6);
      hurt(ctx, b.e, BOLT.dmg, 'fried');
    }
  }
};

/** Everything it was in the middle of, stopped (through a door): no storm, no burning, no bulk. */
/** (for tests: hold him in the cast pose, or the bulk-up's) */
export const holdPoseForTests = (cast: number, bulk = 0) => { casting = cast; posing = bulk; };
/** For tests: where the rifts are, and whether any's in something solid or off the screen. */
export const riftsForTests = (state: GameState) => rifts.map(r => `${Math.round(r.x - state.camera.x)},${Math.round(r.y - state.camera.y)}${inSolid(state, r.x, r.y, r.size) ? ':IN-WALL' : ''}`);

export const stopSpellbook = () => { posing = 0; casting = 0; winding = 0; syncArmor(); bolts = []; burning.clear(); casting = 0; rings = []; flash = 0; rifts = []; pending = []; bulkLeft = 0; setBuffs({ speed: 1, size: 1, knock: 1 }); publish(); };

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const f = fallOf(p);
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2, r = p.width / 2;
  if (f.el === 'meteor') {
    c.fillStyle = 'rgba(249, 115, 22, 0.35)'; c.beginPath(); c.arc(x, y, r * 1.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7C2D12'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9A3412'; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.25, r * 0.65, 0, Math.PI * 2); c.fill();
    c.fillStyle = frame % 6 < 3 ? '#FDE047' : '#F97316'; for (const [dx, dy] of [[-0.4, 0.2], [0.3, -0.3], [0.2, 0.4]]) c.fillRect(x + dx * r - 2, y + dy * r - 2, 4, 4);
  } else {
    c.fillStyle = 'rgba(186, 230, 253, 0.35)'; c.beginPath(); c.arc(x, y, r * 1.7, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.beginPath(); c.moveTo(x, y - r - 2); c.lineTo(x + r + 2, y); c.lineTo(x, y + r + 2); c.lineTo(x - r - 2, y); c.closePath(); c.fill();
    c.fillStyle = '#7DD3FC'; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fill();
    c.fillStyle = '#E0F2FE'; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x - r, y); c.lineTo(x, y); c.closePath(); c.fill();
    c.fillStyle = '#FFFFFF'; c.fillRect(x - 2, y - 2, 3, 3);
  }
};

const drawOverlay = (c: Ctx, state: GameState) => {
  // The rifts: torn open in the sky, black and full of stars, a violet rim, swirling, motes drifting into them
  for (const r of rifts) {
    const open = Math.min(1, r.t / 10) * Math.min(1, (r.life - r.t) / 12);
    if (open <= 0) continue;
    const w = 46 * r.size * open, h = 18 * r.size * open, f = state.frame;
    c.fillStyle = `rgba(168, 85, 247, ${(0.22 * open).toFixed(2)})`; c.beginPath(); c.ellipse(r.x, r.y, w * 1.6, h * 2.2, 0, 0, Math.PI * 2); c.fill();
    const edge = () => { c.beginPath(); for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI * 2, j = 1 + 0.18 * Math.sin(a * 5 + f * 0.2 + r.seed); i ? c.lineTo(r.x + Math.cos(a) * w * j, r.y + Math.sin(a) * h * j) : c.moveTo(r.x + Math.cos(a) * w * j, r.y + Math.sin(a) * h * j); } c.closePath(); };
    edge(); c.fillStyle = '#05020D'; c.fill();
    c.save(); edge(); c.clip();
    c.fillStyle = 'rgba(76, 29, 149, 0.6)'; c.beginPath(); c.ellipse(r.x, r.y, w * 0.6, h * 0.6, f * 0.05, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 14; i++) { const a = r.seed + i * 2.4 + f * 0.03, d = (i * 7.3 % 1) * 0.9 + 0.1; c.fillStyle = i % 4 ? '#E9D5FF' : '#FFFFFF'; c.fillRect(r.x + Math.cos(a) * w * d - 1, r.y + Math.sin(a) * h * d - 1, i % 3 ? 1.5 : 2.5, i % 3 ? 1.5 : 2.5); }
    c.restore();
    edge(); c.strokeStyle = '#C084FC'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(250, 245, 255, 0.8)'; c.lineWidth = 1; c.stroke();
    if (f % 2 === 0) state.particles.push({ pos: { x: r.x + (Math.random() - 0.5) * w * 3, y: r.y + (Math.random() - 0.5) * h * 4 }, vel: { x: 0, y: 0 }, life: 14, color: '#A855F7', size: 2 });
  }
  // The burning: flames licking up off whoever's alight
  for (const [e] of burning) {
    if (!alive(e)) continue;
    const f = state.frame;
    for (let i = 0; i < 4; i++) {
      const x = e.pos.x + e.width * (0.15 + i * 0.23), base = e.pos.y + e.height * 0.75, hgt = e.height * (0.45 + 0.25 * Math.sin(f * 0.4 + i * 2));
      c.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.85)' : 'rgba(234, 88, 12, 0.85)';
      c.beginPath(); c.moveTo(x - 6, base); c.quadraticCurveTo(x - 4, base - hgt * 0.6, x + Math.sin(f * 0.3 + i) * 3, base - hgt); c.quadraticCurveTo(x + 5, base - hgt * 0.5, x + 6, base); c.closePath(); c.fill();
      c.fillStyle = 'rgba(253, 224, 71, 0.9)';
      c.beginPath(); c.moveTo(x - 3, base); c.quadraticCurveTo(x - 2, base - hgt * 0.4, x, base - hgt * 0.6); c.quadraticCurveTo(x + 3, base - hgt * 0.3, x + 3, base); c.closePath(); c.fill();
    }
  }
  // The bulk-up pose: a double biceps, the book held up high in his fist, glowing, him shaking with it
  if (posing > 0) {
    const pl = state.player, f = state.frame, k = 1 - posing / POSE;
    const x = pl.pos.x + pl.width / 2 + (f % 2 ? 1 : -1) * k * 1.5, y = pl.pos.y + pl.height;
    c.fillStyle = `rgba(192, 132, 252, ${(0.15 + 0.2 * k).toFixed(2)})`; c.beginPath(); c.ellipse(x, pl.vine ? pl.pos.y + pl.height / 2 : y - 34, 34 + k * 14, 46 + k * 14, 0, 0, Math.PI * 2); c.fill();
    // (on a vine: he's drawn hanging off it, flexing the one arm, the book up in his fist: vineArm, below)
    if (!pl.vine) drawPoseSprite(c, x, y, pl.facing, g => {
      drawLeg(g, [-5, -24], [-13, -12], [-17, 0], 0, true);
      drawLeg(g, [5, -24], [13, -12], [17, 0], 0, false);
      g.save(); g.translate(0, -24);
      drawArmTo(g, [-8, -22], [-21, -27], [-15, -42], true, 6);
      drawTorsoFromHips(g);
      drawPoseHead(g, 2, -37, 0, k > 0.4 ? 'roar' : 'grit', f);
      drawArmTo(g, [11, -22], [23, -30], [17, -47], false, 6);
      // (the book, up in his fist, open, light pouring out of it)
      g.fillStyle = INK; g.fillRect(9, -64, 18, 13); g.fillStyle = '#27272A'; g.fillRect(10, -63, 16, 11);
      g.fillStyle = f % 6 < 3 ? '#E9D5FF' : '#C084FC'; g.fillRect(12, -62, 5, 9); g.fillRect(19, -62, 5, 9);
      g.restore();
    });
    // (light shooting up out of the book)
    c.fillStyle = `rgba(233, 213, 255, ${(0.3 + 0.3 * Math.sin(f * 0.5)).toFixed(2)})`;
    const bx = x + pl.facing * 18; if (!pl.vine) { c.beginPath(); c.moveTo(bx - 8, y - 88); c.lineTo(bx + 8, y - 88); c.lineTo(bx + 22, y - 180); c.lineTo(bx - 22, y - 180); c.closePath(); c.fill(); }
  }
  // The whole screen lit up a moment
  if (flash > 0) { c.fillStyle = `rgba(${flashColor}, ${(flash * 0.07).toFixed(2)})`; c.fillRect(state.camera.x - 20, state.camera.y - 20, CANVAS_WIDTH + 40, 700); }
  // Shockwaves going out from what's landed
  for (const r of rings) {
    const k = r.t / r.life, rr = r.r * (0.25 + k * 0.75);
    c.strokeStyle = `rgba(${r.color}, ${(0.9 * (1 - k)).toFixed(2)})`; c.lineWidth = 5 * (1 - k) + 1;
    c.beginPath(); c.ellipse(r.x, r.y, rr, rr * 0.45, 0, 0, Math.PI * 2); c.stroke();
  }
  // The lightning, while it's lit: a fat glow round a white core, a branch or two off it
  for (const b of bolts) {
    if (b.flash <= 0 || !b.path.length) continue;
    const k = b.flash / 6;
    if (b.path.length > 5) { const at = b.path[4]; c.strokeStyle = `rgba(255, 255, 255, ${(0.7 * k).toFixed(2)})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(at.x, at.y); c.lineTo(at.x + 26, at.y + 30); c.lineTo(at.x + 18, at.y + 52); c.stroke(); }
    for (const [w, col] of [[16, `rgba(103, 232, 249, ${(0.18 * k).toFixed(2)})`], [8, `rgba(165, 243, 252, ${(0.45 * k).toFixed(2)})`], [3, `rgba(255, 255, 255, ${k.toFixed(2)})`]] as const) {
      c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(b.path[0].x, b.path[0].y);
      for (const pt of b.path) c.lineTo(pt.x, pt.y);
      c.stroke();
    }
  }
  // The cast: the buff spellcaster's pose (the book thrust out in front, open and blazing, the other arm flung up at the
  // sky, chest out, roaring up at it), runes going round him
  if (casting > 0) {
    const pl = state.player, f = state.frame, x = pl.pos.x + pl.width / 2, y = pl.pos.y + pl.height;
    // (on a vine: he's drawn hanging off it, the book thrust out in his free hand: vineArm, below)
    if (!pl.vine) drawPoseSprite(c, x, y, pl.facing, g => {
      drawLeg(g, [-5, -24], [-12, -12], [-16, 0], 0, true);
      drawLeg(g, [5, -24], [14, -13], [18, 0], 0, false);
      g.save(); g.translate(0, -24); g.rotate(-0.08);
      drawArmTo(g, [-8, -22], [-12, -38], [-8, -56], true, 6);
      drawTorsoFromHips(g);
      drawPoseHead(g, 3, -37, -0.2, 'yell', f);
      drawArmTo(g, [11, -22], [22, -24], [33, -28], false, 6);
      // (the book, held out open, light pouring off its pages)
      g.fillStyle = INK; g.fillRect(29, -38, 20, 14); g.fillStyle = '#27272A'; g.fillRect(30, -37, 18, 12);
      g.fillStyle = f % 6 < 3 ? '#E9D5FF' : '#C084FC'; g.fillRect(32, -36, 6, 10); g.fillRect(40, -36, 6, 10);
      g.fillStyle = 'rgba(233, 213, 255, 0.5)'; g.beginPath(); g.moveTo(31, -38); g.lineTo(47, -38); g.lineTo(58, -70); g.lineTo(26, -70); g.closePath(); g.fill();
      g.restore();
    });
    // (sparks off the raised hand: on a vine, the one round the vine, the vine fizzing)
    const raised = pl.vine ? (() => { const g = vineGrip(pl); return { x: x + pl.facing * g.x, y: y + g.y }; })() : { x: x - pl.facing * 10, y: y - 82 };
    if (f % 2 === 0) state.particles.push({ pos: raised, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 14, color: Math.random() < 0.5 ? '#C084FC' : '#FFFFFF', size: 2 });
    const cx = pl.pos.x + pl.width / 2, cy = pl.pos.y + pl.height / 2, k = casting / CAST_POSE;
    c.strokeStyle = `rgba(192, 132, 252, ${(0.8 * k).toFixed(2)})`; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, 44 - k * 10, 0, Math.PI * 2); c.stroke();
    c.fillStyle = `rgba(233, 213, 255, ${k.toFixed(2)})`;
    for (let i = 0; i < 8; i++) { const a = state.frame * 0.12 + (i / 8) * Math.PI * 2, rr = 44 - k * 10; c.fillRect(cx + Math.cos(a) * rr - 2, cy + Math.sin(a) * rr - 3, 4, 6); }
  }
};

/**
 * On a vine (vineArm: the arm's level frame, the shoulder at (sx, sy)), one-handed. Reading the storm out: the book
 * thrust out at arm's length, open and blazing, its pages flipping over and over, light pouring up off it. Bulking up:
 * a one-armed flex, the elbow out level, the book up in his fist, open, light shooting up out of it, shaking with it.
 */
const vineArm = (state: GameState) => {
  const pl = state.player;
  if (!pl.vine || pl.currentWeapon !== 'SPELLBOOK' || (casting <= 0 && posing <= 0)) return null;
  return (c: Ctx, f: number, sx: number, sy: number, behind: boolean) => {
    if (behind) return;
    if (posing > 0) {
      const k = 1 - posing / POSE, j = (f % 2 ? 1 : -1) * k * 1.2;
      const el: [number, number] = [sx + 13, sy - 5 + j], fist: [number, number] = [sx + 8, sy - 23 + j];
      c.fillStyle = `rgba(233, 213, 255, ${(0.3 + 0.3 * Math.sin(f * 0.5)).toFixed(2)})`;
      c.beginPath(); c.moveTo(fist[0] - 7, fist[1] - 16); c.lineTo(fist[0] + 9, fist[1] - 16); c.lineTo(fist[0] + 22, fist[1] - 110); c.lineTo(fist[0] - 20, fist[1] - 110); c.closePath(); c.fill();
      drawArmTo(c, [sx, sy], el, fist, false, 6);
      c.fillStyle = INK; c.fillRect(fist[0] - 8, fist[1] - 17, 18, 13); c.fillStyle = '#27272A'; c.fillRect(fist[0] - 7, fist[1] - 16, 16, 11);
      c.fillStyle = f % 6 < 3 ? '#E9D5FF' : '#C084FC'; c.fillRect(fist[0] - 5, fist[1] - 15, 5, 9); c.fillRect(fist[0] + 2, fist[1] - 15, 5, 9);
      return;
    }
    // (thrust out level, a little up; the fist under the book)
    const fist: [number, number] = [sx + 21, sy - 4];
    drawArmTo(c, [sx, sy], [sx + 11, sy + 2], fist, false, 6);
    const bx = fist[0] - 4, by = fist[1] - 10;
    c.fillStyle = 'rgba(233, 213, 255, 0.5)'; c.beginPath(); c.moveTo(bx + 2, by); c.lineTo(bx + 18, by); c.lineTo(bx + 30, by - 34); c.lineTo(bx - 4, by - 34); c.closePath(); c.fill();
    c.fillStyle = INK; c.fillRect(bx, by, 20, 14); c.fillStyle = '#27272A'; c.fillRect(bx + 1, by + 1, 18, 12);
    c.fillStyle = f % 6 < 3 ? '#E9D5FF' : '#C084FC'; c.fillRect(bx + 3, by + 2, 6, 10); c.fillRect(bx + 11, by + 2, 6, 10);
    // (a page flipping over, spine to edge and over again: narrowing to the spine and out the other side)
    const ph = (f % 8) / 8, w = Math.cos(ph * Math.PI) * 7;
    c.fillStyle = '#FAF5FF'; c.fillRect(Math.min(bx + 10, bx + 10 + w), by + 1 - Math.sin(ph * Math.PI) * 3, Math.abs(w) || 1, 10);
  };
};

/** In his fist: the tome, black and bound in iron, a skull on the cover, the pages glowing out the edge. */
const drawHeld = (c: Ctx, frame: number) => {
  c.fillStyle = INK; c.fillRect(-2, -8, 20, 18);
  c.fillStyle = '#27272A'; c.fillRect(-1, -7, 18, 16);
  c.fillStyle = '#3F3F46'; c.fillRect(-1, -7, 18, 2);
  c.fillStyle = frame % 30 < 15 ? '#C084FC' : '#E9D5FF'; c.fillRect(17, -6, 2, 14);
  c.fillStyle = '#A1A1AA'; c.fillRect(-1, -7, 3, 3); c.fillRect(14, -7, 3, 3); c.fillRect(-1, 6, 3, 3); c.fillRect(14, 6, 3, 3);
  c.fillStyle = '#E7E5E4'; c.fillRect(5, -4, 6, 5); c.fillRect(6, 1, 4, 2);
  c.fillStyle = INK; c.fillRect(6, -2, 2, 2); c.fillRect(9, -2, 2, 2); c.fillRect(7, 1, 1, 2); c.fillRect(9, 1, 1, 2);
  if (frame % 40 < 20) { c.fillStyle = 'rgba(192, 132, 252, 0.5)'; c.fillRect(19, -4 - (frame % 20) * 0.3, 2, 2); }
};

export const registerSpellbook = () => registerWeapon('SPELLBOOK', { fire: ctx => fire(ctx), update, draw, drawHeld, tick, drawOverlay, vineArm });
