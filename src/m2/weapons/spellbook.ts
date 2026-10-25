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
// One opted in (weapons/half.ts: the Ensemble Cast) is only hit if it's one of that storm's own three (no splash on the
// rest of them), and then hard (ON_CAST: shares of its real health; a fresh one mostly lives through it, a hurt one
// doesn't), the comet's freeze and the meteor's burn at half; it never dies the spell's death (its own fight's).

import { emptyCue } from './dry';
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
import * as H from './heldArt';
import { seated } from './seated';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { BULK_LINES, BULK_FAIL_LINES } from '../lines/weaponLines';
// (the bulked head stomp's leftovers lie on the floor behind him: drawn with the bulk-up's things)
import { drawPoseSprite, drawPoseHead, bulkFinishing, drawPulped } from '../moves/grab';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../m1/game/render/player/body';
import { setArmor } from '../../m1/game/core/resist';
import { vineGrip } from '../../m1/game/combat/muzzle';
import { specialsHalf, specialsOff, realMax, HALF } from './half';
import { subBossDmg, landBoss } from './subBoss';
import { since } from '../frames';
import { struckAt } from './strikes';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

const CAST_COOLDOWN = 80, REACH = 680, CAST_POSE = 32;
/** The wind-up: this long reading it out, the runes building, before the storm comes (he's stood there for it). */
// (a little quicker (the user's: "slightly speed up spellbooks' cast time"): was 40)
const WINDUP = 34;
/** The storm still to come (the wind-up's frames left), and the cast to finish when it's done. */
let winding = 0;
const METEOR = { dmg: 80, edge: 25, radius: 95, burn: 240, burnDmg: 0.4 };
const COMET = { dmg: 45, freeze: 320 };
/** The lightning: a strike this often, this hard, for this long (three seconds: about 180 in all, a shooter's dead, a
 * bouncer's still standing). */
const BOLT = { every: 14, dmg: 15, maxFrames: 186 };
/** On one opted in, as shares of its real health: the meteor's blast, the comet's, a lightning strike (a dozen or so of
 *  them), the burning a frame. */
const ON_CAST = { meteor: 0.45, comet: 0.45, bolt: 0.04, burn: 0.0011 };
/** The last storm's three (the only opted-in ones its meteor and comet can touch). */
let castThree: Enemy[] = [];
/** What each costs in mana: a storm 7 to 10, a roll each time (8.5 on average); bulking up a lot more. (Somewhat less
 *  for both, the user's: were 9-13 and 24.) */
const MANA = { storm: [7, 10] as const };
const BULK = { mana: 18, frames: 720, cooldown: 480, speed: 1.6, size: 1.3, knock: 2.2 };

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
const mid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

// ---------------------------------------------------------------------------------------------------------------
// The storm

type Element = 'meteor' | 'comet';
interface Fall { el: Element; target: Enemy | null; to: { x: number; y: number }; three?: Enemy[] }
const fallOf = (p: Projectile) => p.customData as Fall;

/** Whoever's struck over and over, and when next. */
let bolts: { e: Enemy; next: number; until: number; flash: number; path: { x: number; y: number }[]; rift: { x: number; y: number } | null }[] = [];

/**
 * A stage's own say over who the storm goes for (Hollywood Land's Stuntman Steve: the meteor for a red car, the comet
 * for a blue one, the lightning for him, each only if there's one on the screen), or null for the usual (the nearest
 * three). A null in it: none of that one this time.
 */
export interface StormPick { meteor: Enemy | null; comet: Enemy | null; bolt: Enemy | null }
let stormPick: ((state: GameState, px: number, py: number) => StormPick | null) | null = null;
export const setStormPick = (fn: typeof stormPick) => { stormPick = fn; };
/** ...and over what the storm does to whoever it lands on: true, it's dealt with it (the spell's own hurt, burning and
 *  freezing are skipped for that one). */
export type StormEl = 'meteor' | 'comet' | 'bolt';
let stormHit: ((ctx: FrameContext, e: Enemy, el: StormEl, dmg: number) => boolean) | null = null;
export const setStormHit = (fn: typeof stormHit) => { stormHit = fn; };
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
let pending: { at: number; el: Element; target: Enemy | null; to: { x: number; y: number }; from: { x: number; y: number }; three: Enemy[] }[] = [];

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
  // (a land boss: half, and his fight takes its own share of that; a sub-boss: its share, weapons/subBoss.ts)
  if (specialsOff(e)) dmg = landBoss(e) ? dmg * 0.5 : subBossDmg(e, dmg, false);
  e.health -= dmg;
  if (e.health <= 0) { if (isMidBoss(e)) e.health = 1; else { spellKill(ctx, e, how); return true; } }
  ctx.fx.spawnDamageNumber(e.pos, Math.round(dmg), dmg > 30);
  return false;
};

/** Fire: the mana spent, and the reading starts: the storm itself comes at the end of the wind-up (unleash). */
const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
  const pl = state.player;
  // (sat in a set piece's own pose: no reading, nothing spent)
  if (seated(pl)) return;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SPELLBOOK = Math.max(0, pl.weaponAmmo.SPELLBOOK - (MANA.storm[0] + Math.floor(Math.random() * (MANA.storm[1] - MANA.storm[0] + 1))));
  pl.shootCooldown = CAST_COOLDOWN + WINDUP;
  winding = WINDUP; casting = WINDUP + CAST_POSE;
  playSound('spell', 0.5, -6);
  // (a rune circle opening on the ground under him for the reading: looks only)
  mark('cast', null, { x: pl.pos.x + pl.width / 2, y: pl.pos.y + pl.height }, WINDUP + CAST_POSE);
};

/** Read the storm out: on the nearest three about (fewer, and they get more of it), one of each. */
const unleash = (ctx: FrameContext) => {
  const { state } = ctx;
  const pl = state.player;
  const px = pl.pos.x + pl.width / 2, py = pl.pos.y + pl.height / 2;
  // (the book going off in his hand: a flare, the pages spitting sparkles)
  const book = bookAt(state);
  flare(book.x, book.y, ARCANE, 30, 14);
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (lr() - 0.5) * 2.4, sp = 1.5 + lr() * 3; sparkle(book.x, book.y, Math.cos(a) * sp, Math.sin(a) * sp, 20 + lr() * 14, i % 3 ? '#E9D5FF' : '#FFFFFF', i % 4 === 0); }
  // (the stage's own pick, if it has one and there's anything in it)
  const own = stormPick?.(state, px, py);
  if (own && (own.meteor || own.comet || own.bolt)) {
    castThree = [own.meteor, own.comet, own.bolt].filter((e): e is Enemy => !!e);
    const ahead = { x: px + pl.facing * 260, y: pl.pos.y + pl.height };
    if (own.meteor) fall(state, 'meteor', own.meteor, ahead);
    if (own.comet) fall(state, 'comet', own.comet, { x: ahead.x + pl.facing * 90, y: ahead.y });
    if (own.bolt) strike(state, own.bolt);
    playSound('spell');
    return;
  }
  const onScreen = (e: Enemy) => e.pos.x + e.width > state.camera.x && e.pos.x < state.camera.x + CANVAS_WIDTH;
  const targets = state.enemies.filter(e => alive(e) && onScreen(e) && Math.hypot(mid(e).x - px, mid(e).y - py) < REACH)
    .sort((a, b) => Math.hypot(mid(a).x - px, mid(a).y - py) - Math.hypot(mid(b).x - px, mid(b).y - py)).slice(0, 3);
  castThree = targets;
  const at = (i: number) => (targets.length ? targets[i % targets.length] : null);
  const ahead = { x: px + pl.facing * 260, y: pl.pos.y + pl.height };
  fall(state, 'meteor', at(0), ahead);
  fall(state, 'comet', at(1), { x: ahead.x + pl.facing * 90, y: ahead.y });
  const z = at(2);
  if (z) strike(state, z);
  playSound('spell');
};
/** The lightning on him: a rift over him, and a strike out of it over and over for a few seconds. */
const strike = (state: GameState, z: Enemy) => {
  const bolt = { e: z, next: state.frame + RIFT_OPEN + 2, until: state.frame + BOLT.maxFrames, flash: 0, path: [] as { x: number; y: number }[], rift: null as Rift | null };
  const at = riftSpot(state, { x: mid(z).x, y: state.camera.y + HUD_CLEAR_Y + 20 }, 0.8, mid(z));
  bolt.rift = openRift(at.x, at.y, 0.8, BOLT.maxFrames + 12, () => (bolts.includes(bolt) ? mid(bolt.e) : null));
  bolts.push(bolt);
  mark('bolt', z, mid(z), BOLT.maxFrames);
};

/** A meteor or a comet, out of the sky over him (from off to one side), coming down on him. */
const fall = (state: GameState, el: Element, target: Enemy | null, fallback: { x: number; y: number }) => {
  const to = target ? mid(target) : fallback;
  const side = Math.random() < 0.5 ? -1 : 1;
  // (the rift it comes out of: up in the sky, off to one side of him, on the screen, below the HUD)
  const size = el === 'meteor' ? 1.15 : 0.9;
  const from = riftSpot(state, { x: to.x + side * (130 + Math.random() * 90), y: state.camera.y + HUD_CLEAR_Y + 30 + Math.random() * 40 }, size, to);
  openRift(from.x, from.y, size, RIFT_OPEN + 34);
  pending.push({ at: state.frame + RIFT_OPEN, el, target, to, from, three: castThree });
  mark(el, target, target ? { x: to.x, y: target.pos.y + target.height } : to, RIFT_OPEN + 70);
};
/** Out of the rift, at last. */
const emerge = (state: GameState, q: (typeof pending)[number]) => {
  const { el, target, from, three } = q;
  const to = target && alive(target) ? mid(target) : q.to;
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1, sp = el === 'meteor' ? 13 : 15;
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: from.x, y: from.y }, vel: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 3 }, life: 18, color: i % 2 ? '#A855F7' : '#1E1B4B', size: 3 + Math.random() * 3 });
  playSound('whoosh', 0.9, el === 'meteor' ? -6 : 3);
  const size = el === 'meteor' ? 26 : 18;
  state.projectiles.push({
    id: `spell-${el}-${state.frame}-${Math.random()}`, pos: { x: from.x - size / 2, y: from.y - size / 2 },
    vel: { x: (to.x - from.x) / d * sp, y: (to.y - from.y) / d * sp }, width: size, height: size, health: 1, maxHealth: 1,
    type: 'projectile', damage: 0, owner: 'player', custom: 'SPELLBOOK', customData: { el, target, to, three } satisfies Fall,
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
    if (f.el === 'meteor') meteorBlast(ctx, c, f.three ?? []); else cometHit(ctx, c, hit ?? null, f.three ?? []);
    return false;
  }
  return true;
};

/** Who wants to know where a meteor's gone up (a stage's own say over it: the space queen's oil, that won't burn). */
const meteorHooks = new Set<(ctx: FrameContext, at: { x: number; y: number }) => void>();
export const onMeteorBlast = (fn: (ctx: FrameContext, at: { x: number; y: number }) => void) => { meteorHooks.add(fn); };
// (dev: the headless checks set one off by hand)
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as { __meteorHooks?: unknown }).__meteorHooks = meteorHooks;

/** The meteor going up: a blast, everybody in it hurt by how near, and whoever lives through it left burning. */
const meteorBlast = (ctx: FrameContext, at: { x: number; y: number }, three: Enemy[] = []) => {
  const { state, fx } = ctx;
  for (const h of meteorHooks) h(ctx, at);
  struckAt(at.x - METEOR.radius, at.y - METEOR.radius, at.x + METEOR.radius, at.y + METEOR.radius, METEOR.dmg);
  playSound('boom'); playSound('crash', 0.7, -6); shakeScreen(state, 22, 12);
  fx.spawnExplosion(at, '#F97316', 44, 0, 26); fx.spawnExplosion(at, '#FDE047', 28, 0, 18); fx.spawnExplosion(at, '#FFFFFF', 10, 0, 10); fx.spawnExplosion(at, '#57534E', 22, 0, 22);
  ring(at.x, at.y, METEOR.radius * 1.4, '253, 186, 116', 20); ring(at.x, at.y, METEOR.radius * 0.8, '255, 255, 255', 10);
  flash = 6; flashColor = '255, 200, 120';
  debris(state, at.x, at.y, 16, ['#57534E', '#78716C', '#F97316', '#7C2D12'], 9);
  // (a pall of smoke hanging over it, and embers)
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 60, y: at.y - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() * 0.8 }, life: 60 + Math.random() * 40, color: 'rgba(68, 64, 60, 0.45)', size: 10 + Math.random() * 10 });
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 40, y: at.y }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 4 }, life: 50 + Math.random() * 30, color: i % 2 ? '#FDE047' : '#FB923C', size: 2 });
  scorch(state, at.x, at.y + 8, 14);
  // (the flourish: a stepped flare, its rune circle gone out, a crater in the floor under it and dust rolling off along it)
  flare(at.x, at.y, FIRE, 64, 18); unmark('meteor', at);
  const fl = floorBelow(state, at.x, at.y);
  if (fl !== null) {
    if (craters.length >= 6) craters.shift();
    craters.push({ x: at.x, y: fl, t: 0, r: 40 + lr() * 10, seed: lr() * 100 });
    for (let i = 0; i < 10; i++) { const s = i % 2 ? 1 : -1; state.particles.push({ pos: { x: at.x + s * lr() * 20, y: fl - 4 }, vel: { x: s * (2 + lr() * 4), y: -0.3 - lr() * 0.9 }, life: 30 + lr() * 18, color: i % 3 ? 'rgba(168, 162, 158, 0.55)' : 'rgba(120, 113, 108, 0.6)', size: 6 + lr() * 6 }); }
  }
  for (const e of [...state.enemies]) {
    if (!alive(e)) continue;
    const d = Math.hypot(mid(e).x - at.x, mid(e).y - at.y);
    if (d > METEOR.radius + e.width / 2) continue;
    const k = Math.max(0, 1 - d / (METEOR.radius + e.width / 2));
    const half = specialsHalf(e);
    if (half && !three.includes(e)) continue;
    if (stormHit?.(ctx, e, 'meteor', METEOR.edge + (METEOR.dmg - METEOR.edge) * k)) continue;
    if (!hurt(ctx, e, half ? realMax(e) * ON_CAST.meteor : METEOR.edge + (METEOR.dmg - METEOR.edge) * k, 'charred')) {
      burning.set(e, half ? METEOR.burn * HALF : METEOR.burn);
      e.vel = { x: Math.sign(mid(e).x - at.x || 1) * 4 * k, y: -4 * k };
    }
  }
};

/** The comet: it hurts whoever it comes down on; living through it, he's frozen solid (anybody right by it too). */
const cometHit = (ctx: FrameContext, at: { x: number; y: number }, hit: Enemy | null, three: Enemy[] = []) => {
  const { state, fx } = ctx;
  struckAt(at.x - 40, at.y - 40, at.x + 40, at.y + 40, COMET.dmg);
  playSound('ice'); playSound('glass', 0.9, 4); playSound('crack', 0.8, 2); shakeScreen(state, 12, 6);
  fx.spawnExplosion(at, '#BAE6FD', 34, 0, 20); fx.spawnExplosion(at, '#FFFFFF', 18, 0, 12); fx.spawnExplosion(at, '#7DD3FC', 14, 0, 16);
  ring(at.x, at.y, 80, '186, 230, 253', 18); ring(at.x, at.y, 40, '255, 255, 255', 10);
  flash = 4; flashColor = '200, 235, 255';
  debris(state, at.x, at.y, 14, ['#E0F2FE', '#BAE6FD', '#FFFFFF', '#7DD3FC'], 8, 30);
  // (frost hanging in the air a moment)
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: at.x + (Math.random() - 0.5) * 50, y: at.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -0.3 - Math.random() * 0.4 }, life: 50, color: 'rgba(224, 242, 254, 0.5)', size: 6 + Math.random() * 8 });
  scorch(state, at.x, at.y + 8, 12, 'rgba(186, 230, 253, 0.8)', 70);
  // (the flourish: a stepped ice flare, its rune circle out, and glitter thrown off it)
  flare(at.x, at.y, ICE, 48, 16); unmark('comet', at);
  for (let i = 0; i < 12; i++) { const a = lr() * Math.PI * 2, sp = 1 + lr() * 4; sparkle(at.x, at.y, Math.cos(a) * sp, Math.sin(a) * sp - 1, 22 + lr() * 18, i % 3 ? '#E0F2FE' : '#FFFFFF', i % 4 === 0); }
  for (const e of [...state.enemies]) {
    if (!alive(e)) continue;
    const near = e === hit || Math.hypot(mid(e).x - at.x, mid(e).y - at.y) < 34 + e.width / 2;
    if (!near) continue;
    const half = specialsHalf(e);
    if (half && !three.includes(e)) continue;
    if (stormHit?.(ctx, e, 'comet', e === hit ? COMET.dmg : COMET.dmg * 0.5)) continue;
    if (!hurt(ctx, e, half ? realMax(e) * ON_CAST.comet : e === hit ? COMET.dmg : COMET.dmg * 0.5, 'pancaked') && !specialsOff(e)) { e.frozeAt = state.frame; e.frozenTimer = half ? COMET.freeze * HALF : COMET.freeze; }
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
const syncArmor = () => { const want = casting > 0 || posing > 0; if (want !== armored) { armored = want; setArmor(want, 'spellbook'); } };

const tick = (ctx: FrameContext, input: { secondary?: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const pl = state.player;
  // (sat in a set piece's own pose, or forced onto another weapon: any reading or flexing dropped, so the seat's pose shows)
  if ((seated(pl) || pl.currentWeapon !== 'SPELLBOOK') && (casting > 0 || posing > 0 || winding > 0)) { casting = 0; posing = 0; winding = 0; pl.hidden = false; syncArmor(); }
  if (casting > 0) {
    // (reading it out: struck in the pose a moment, standing his ground; hurt, he takes it, but nothing knocks him out
    // of it (armor: core/resist); only dying does)
    if (state.deathTimer > 0) { casting = 0; winding = 0; pl.hidden = false; }
    else if (winding > 0 && --winding === 0) unleash(ctx);
    else { casting--; pl.vel.x = 0; pl.pushbackTimer = 0; pl.lockTimer = Math.max(pl.lockTimer, 2); pl.hidden = casting > 0 && !pl.vine; }
  }
  if (flash > 0) flash--;
  fxTick(state);
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
  if (equipped && press && !seated(pl)) {
    const mana = ctx.cheats.infiniteAmmo || pl.weaponAmmo.SPELLBOOK >= BULK.mana;
    if (bulkLeft <= 0 && bulkCool <= 0 && posing <= 0 && (pl.isGrounded || !!pl.vine) && mana) {
      if (!ctx.cheats.infiniteAmmo) pl.weaponAmmo.SPELLBOOK -= BULK.mana;
      // First the pose: the book held up, flexing, the power going into him
      posing = POSE;
      playSound('spell', 1, -8);
      meatheadSays(state, pickLine(BULK_LINES));
    } else if (posing <= 0) {
      // (it won't: a click, and he says why, a while apart)
      const why = bulkLeft > 0 ? 'already' : bulkCool > 0 ? 'cooldown' : !mana ? 'mana' : 'air';
      // (out of mana for it: the book's empty cue, weapons/dry.ts)
      if (why === 'mana') emptyCue(ctx, 'SPELLBOOK'); else playSound('click', 0.7, -4);
      if (since(state.frame, bulkFailSaidAt) > 150) { bulkFailSaidAt = state.frame; const pool = BULK_FAIL_LINES[why]; meatheadSays(state, pickLine(pool)); }
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
      flare(pl.pos.x + pl.width / 2, pl.pos.y + pl.height * 0.4, RAGE, 56, 16);
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; state.particles.push({ pos: { x: pl.pos.x + pl.width / 2, y: pl.pos.y + pl.height / 2 }, vel: { x: Math.cos(a) * 6, y: Math.sin(a) * 6 }, life: 22, color: i % 2 ? '#F87171' : '#FDE047', size: 4 }); }
    }
  }
  if (bulkLeft > 0) {
    // (steam coming off him, red)
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: pl.pos.x + Math.random() * pl.width, y: pl.pos.y + Math.random() * pl.height * 0.6 }, vel: { x: (Math.random() - 0.5), y: -1.5 - Math.random() }, life: 24, color: 'rgba(248, 113, 113, 0.45)', size: 4 + Math.random() * 4 });
    // (held still while a bulked finisher plays (grab.ts: the smash, the stomp, the bearhug): never shrinking mid-kill)
    if (!bulkFinishing() && --bulkLeft <= 0) { setBuffs({ speed: 1, size: 1, knock: 1 }); bulkCool = BULK.cooldown; playSound('whoosh', 0.6, -8); }
  } else if (bulkCool > 0) bulkCool--;
  publish();
  // The burning: a little every frame till it's out (or he's dead)
  for (const [e, left] of burning) {
    if (!alive(e)) { burning.delete(e); continue; }
    if (left <= 0) { burning.delete(e); continue; }
    burning.set(e, left - 1);
    for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.7 }, vel: { x: (Math.random() - 0.5), y: -1.2 - Math.random() * 1.8 }, life: 16 + Math.random() * 8, color: Math.random() < 0.25 ? 'rgba(68, 64, 60, 0.6)' : Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
    const bd = specialsHalf(e) ? realMax(e) * ON_CAST.burn : subBossDmg(e, METEOR.burnDmg, false);
    e.health -= bd;
    if (left % 20 === 0) ctx.fx.spawnDamageNumber(e.pos, Math.round(bd * 20));
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
      // (the flourish: forks off the bolt, its afterglow hanging a moment, a flare where it lands)
      if (zaps.length >= 6) zaps.shift();
      zaps.push({ path: b.path, forks: forksOf(b.path), t: 0, at: hitAt });
      flare(mid(b.e).x, b.e.pos.y + b.e.height * 0.3, BOLT_RAMP, 30, 10);
      // (and he's shown taking it: lit up, jerking, the current crawling over him, till the next one)
      b.e.shockedUntil = state.frame + BOLT.every;
      if (!stormHit?.(ctx, b.e, 'bolt', BOLT.dmg)) {
        if (!specialsOff(b.e)) b.e.pauseTimer = Math.max(b.e.pauseTimer || 0, 6);
        hurt(ctx, b.e, specialsHalf(b.e) ? realMax(b.e) * ON_CAST.bolt : BOLT.dmg, 'fried');
      }
    }
  }
};

/** Everything it was in the middle of, stopped (through a door): no storm, no burning, no bulk. */
/** (for tests: hold him in the cast pose, or the bulk-up's) */
export const holdPoseForTests = (cast: number, bulk = 0) => { casting = cast; posing = bulk; };
/** For tests: where the rifts are, and whether any's in something solid or off the screen. */
export const riftsForTests = (state: GameState) => rifts.map(r => `${Math.round(r.x - state.camera.x)},${Math.round(r.y - state.camera.y)}${inSolid(state, r.x, r.y, r.size) ? ':IN-WALL' : ''}`);

export const stopSpellbook = () => { posing = 0; casting = 0; winding = 0; syncArmor(); bolts = []; burning.clear(); casting = 0; rings = []; flash = 0; rifts = []; pending = []; bulkLeft = 0; setBuffs({ speed: 1, size: 1, knock: 1 }); publish(); sparks = []; sigils = []; flares = []; craters = []; zaps = []; };

// ---------------------------------------------------------------------------------------------------------------
// The flourishes: sparkles off the pages, rune circles under whoever's marked, stepped flares where things go off, the
// meteor's crater, the lightning's forks and afterglow, the bulk-up's aura and the vein popping on him. Looks only:
// nothing here touches what a spell does. Every list capped; the rune circles painted the once each into a little
// canvas and put down turning; the rest a handful of flat fills a frame.

/** Its own dice (the look's): never the game's. */
let lookS = 0x5eb00c;
const lr = () => { lookS = (lookS * 1664525 + 1013904223) >>> 0; return lookS / 4294967296; };

/** Stepped ramps, darkest to white: the arcane (the reading), the meteor's fire, the comet's ice, the lightning, the rage. */
const ARCANE = ['#3B0764', '#7E22CE', '#C084FC', '#F3E8FF', '#FFFFFF'];
const FIRE = ['#7C2D12', '#EA580C', '#FB923C', '#FDE047', '#FFFFFF'];
const ICE = ['#0C4A6E', '#0284C7', '#7DD3FC', '#E0F2FE', '#FFFFFF'];
const BOLT_RAMP = ['#164E63', '#06B6D4', '#67E8F9', '#ECFEFF', '#FFFFFF'];
const RAGE = ['#7F1D1D', '#DC2626', '#F87171', '#FEF08A', '#FFFFFF'];

/** Twinkles: a little four-pointed glint, its arms coming and going, drifting. */
let sparks: { x: number; y: number; vx: number; vy: number; t: number; life: number; col: string; big: boolean }[] = [];
const sparkle = (x: number, y: number, vx: number, vy: number, life: number, col: string, big = false) => {
  if (sparks.length >= 56) sparks.shift();
  sparks.push({ x, y, vx, vy, t: 0, life, col, big });
};

/** Rune circles on the ground: under whoever a meteor, a comet or the lightning's coming for (going along with him),
 *  and under Meathead while he reads it out. */
type SigilEl = 'meteor' | 'comet' | 'bolt' | 'cast';
let sigils: { e: Enemy | null; x: number; y: number; el: SigilEl; t: number; life: number }[] = [];
const mark = (el: SigilEl, e: Enemy | null, at: { x: number; y: number }, life: number) => {
  if (sigils.length >= 8) sigils.shift();
  sigils.push({ e, x: at.x, y: at.y, el, t: 0, life });
};
/** What it was coming for has landed: its circle (the nearest of that kind) goes out. */
const unmark = (el: SigilEl, at: { x: number; y: number }) => {
  let best: (typeof sigils)[number] | null = null, bd = 260;
  for (const s of sigils) { if (s.el !== el) continue; const d = Math.hypot(s.x - at.x, s.y - at.y); if (d < bd) { bd = d; best = s; } }
  if (best) best.life = Math.min(best.life, best.t + 10);
};

/** Stepped flares: a fat four-way glint, its ramp in bands, popping out and shrinking away. */
let flares: { x: number; y: number; t: number; life: number; ramp: string[]; r: number }[] = [];
const flare = (x: number, y: number, ramp: string[], r: number, life: number) => {
  if (flares.length >= 8) flares.shift();
  flares.push({ x, y, t: 0, life, ramp, r });
};

/** Craters the meteor leaves in the floor (lying there a good while, embers in them at first). */
let craters: { x: number; y: number; t: number; r: number; seed: number }[] = [];
const floorBelow = (state: GameState, x: number, y: number) => { for (let yy = y; yy < y + 170; yy += 4) if (solid(state, x, yy)) return yy; return null; };

/** A lightning strike's forks, and its afterglow hanging after it. */
let zaps: { path: { x: number; y: number }[]; forks: { x: number; y: number }[][]; t: number; at: { x: number; y: number } }[] = [];
const forksOf = (path: { x: number; y: number }[]) => {
  const out: { x: number; y: number }[][] = [];
  for (let n = 0; n < 2 && path.length > 5; n++) {
    let p = path[2 + Math.floor(lr() * (path.length - 4))];
    const side = lr() < 0.5 ? -1 : 1, f = [p];
    for (let i = 0; i < 3; i++) { p = { x: p.x + side * (8 + lr() * 14), y: p.y + 10 + lr() * 12 }; f.push(p); }
    out.push(f);
  }
  return out;
};

/** Where the book is in the cast pose (the world), for its sparkles. */
const bookAt = (state: GameState) => {
  // (on a vine it's out at arm's length off his shoulder, about the same spot: near enough for sparkles)
  const pl = state.player;
  return { x: pl.pos.x + pl.width / 2 + pl.facing * (pl.vine ? 41 : 39), y: pl.pos.y + pl.height - (pl.vine ? 58 : 56) };
};

const fxTick = (state: GameState) => {
  for (const s of sparks) { s.t++; s.x += s.vx; s.y += s.vy; s.vx *= 0.94; s.vy = s.vy * 0.94 - 0.03; }
  sparks = sparks.filter(s => s.t < s.life);
  for (const s of sigils) {
    s.t++;
    if (s.el === 'cast') { const pl = state.player; s.x = pl.pos.x + pl.width / 2; s.y = pl.pos.y + pl.height; }
    else if (s.e) {
      if (alive(s.e) && (s.el !== 'bolt' || bolts.some(b => b.e === s.e))) { s.x = mid(s.e).x; s.y = s.e.pos.y + s.e.height; }
      else { s.e = null; s.life = Math.min(s.life, s.t + 10); }
    }
    // (motes rising off it)
    if (s.t % 5 === 0 && s.t < s.life - 10) { const a = lr() * Math.PI * 2; sparkle(s.x + Math.cos(a) * 30, s.y + Math.sin(a) * 8, 0, -0.8 - lr() * 0.8, 20, (s.el === 'meteor' ? FIRE : s.el === 'comet' ? ICE : s.el === 'bolt' ? BOLT_RAMP : ARCANE)[3]); }
  }
  sigils = sigils.filter(s => s.t < s.life);
  for (const f of flares) f.t++;
  flares = flares.filter(f => f.t < f.life);
  for (const c of craters) c.t++;
  craters = craters.filter(c => c.t < 600);
  for (const z of zaps) z.t++;
  zaps = zaps.filter(z => z.t < 22);
  // (reading it out: the pages flipping, sparkles spitting up off them)
  if (winding > 0 && state.frame % 3 === 0) { const b = bookAt(state); sparkle(b.x + (lr() - 0.5) * 14, b.y - 4, (lr() - 0.5) * 1.6, -1.2 - lr() * 1.6, 18 + lr() * 12, lr() < 0.6 ? '#E9D5FF' : '#FFFFFF', lr() < 0.25); }
  // (bulked: a heartbeat every so often, quicker as it runs out, a flare of red off him)
  if (bulkLeft > 0 && bulkLeft % (bulkLeft < 120 ? 20 : 45) === 0) { const pl = state.player; for (let i = 0; i < 4; i++) sparkle(pl.pos.x + lr() * pl.width, pl.pos.y + lr() * pl.height * 0.5, (lr() - 0.5) * 2, -1 - lr(), 16, i % 2 ? '#F87171' : '#FEF08A'); }
};

/** A rune circle, painted the once per ramp (two rings, the runes between them, a hexagram in the middle). */
const runeCache = new Map<string[], HTMLCanvasElement | null>();
const RUNE_R = 50, RUNE_S = 112;
const runeRing = (ramp: string[]) => {
  if (runeCache.has(ramp)) return runeCache.get(ramp)!;
  if (typeof document === 'undefined') { runeCache.set(ramp, null); return null; }
  const cv = document.createElement('canvas'); cv.width = cv.height = RUNE_S;
  const g = cv.getContext('2d');
  if (g) {
    const o = RUNE_S / 2, R = RUNE_R;
    const circ = (r: number, w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(o, o, r, 0, Math.PI * 2); g.stroke(); };
    circ(R, 4, ramp[0]); circ(R, 2, ramp[2]); circ(R - 1.5, 1, ramp[4]);
    circ(R - 15, 3, ramp[0]); circ(R - 15, 1.5, ramp[2]);
    // (the runes round it: little stepped glyphs, no two alike side by side)
    for (let i = 0; i < 12; i++) {
      g.save(); g.translate(o, o); g.rotate((i / 12) * Math.PI * 2); g.translate(0, -(R - 8));
      g.fillStyle = ramp[3];
      const k = i % 4;
      if (k === 0) { g.fillRect(-1, -4, 2, 8); g.fillRect(-3, -4, 6, 2); }
      else if (k === 1) { g.fillRect(-3, -3, 2, 6); g.fillRect(1, -3, 2, 6); g.fillRect(-3, 0, 6, 2); }
      else if (k === 2) { g.fillRect(-3, -4, 2, 2); g.fillRect(-1, -2, 2, 2); g.fillRect(1, 0, 2, 2); g.fillRect(-3, 2, 6, 2); }
      else { g.fillRect(-1, -4, 2, 8); g.fillRect(-3, -1, 2, 2); g.fillRect(1, -3, 2, 2); }
      g.restore();
    }
    // (the hexagram, its points studded)
    const tri = (a0: number) => { g.beginPath(); for (let i = 0; i < 3; i++) { const a = a0 + (i / 3) * Math.PI * 2, x = o + Math.cos(a) * (R - 16), y = o + Math.sin(a) * (R - 16); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); };
    g.strokeStyle = ramp[1]; g.lineWidth = 3; tri(-Math.PI / 2); tri(Math.PI / 2);
    g.strokeStyle = ramp[3]; g.lineWidth = 1; tri(-Math.PI / 2); tri(Math.PI / 2);
    g.fillStyle = ramp[4];
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; g.fillRect(Math.round(o + Math.cos(a) * (R - 16)) - 2, Math.round(o + Math.sin(a) * (R - 16)) - 2, 4, 4); }
    g.fillRect(o - 2, o - 2, 4, 4);
  }
  runeCache.set(ramp, cv);
  return cv;
};

/** Under everybody's feet (behind him): the rune circles, the craters, the bulk-up's aura. */
const drawUnderFx = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const k of craters) {
    const a = k.t > 480 ? (600 - k.t) / 120 : 1, r = k.r;
    c.save(); c.globalAlpha *= a;
    // (stepped: the lit lip, the dark bowl, the deep middle; rubble round the rim; embers glowing in it a while)
    c.fillStyle = '#A8A29E'; c.beginPath(); c.ellipse(k.x, k.y, r, r * 0.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#44403C'; c.beginPath(); c.ellipse(k.x, k.y + 1, r * 0.82, r * 0.15, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1C1917'; c.beginPath(); c.ellipse(k.x, k.y + 1.5, r * 0.5, r * 0.09, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 7; i++) { const h = (k.seed * 7.31 + i * 3.7) % 1, aa = (i / 7) * Math.PI * 2 + h; c.fillStyle = i % 2 ? '#78716C' : '#57534E'; c.fillRect(Math.round(k.x + Math.cos(aa) * r * 1.05) - 2, Math.round(k.y + Math.sin(aa) * r * 0.22) - 2, 3 + Math.round(h * 2), 3); }
    if (k.t < 160) for (let i = 0; i < 5; i++) { if ((f + i * 7) % 12 < 5) continue; c.fillStyle = i % 2 ? '#FB923C' : '#FDE047'; c.fillRect(Math.round(k.x + (i - 2) * r * 0.18), Math.round(k.y + ((i * 3) % 3) - 1), 2, 2); }
    c.restore();
  }
  for (const s of sigils) {
    const cv = runeRing(s.el === 'meteor' ? FIRE : s.el === 'comet' ? ICE : s.el === 'bolt' ? BOLT_RAMP : ARCANE);
    if (!cv) continue;
    const k = Math.min(1, s.t / 8) * Math.min(1, (s.life - s.t) / 10), size = s.el === 'meteor' ? 1.15 : s.el === 'cast' ? 0.8 : 0.85;
    if (k <= 0) continue;
    // (pulsing in steps, not smoothly: SNES)
    const pulse = (f >> 3) % 2 ? 1 : 0.86;
    c.save(); c.globalAlpha *= k * pulse;
    c.translate(s.x, s.y); c.scale(size * (0.6 + 0.4 * k), size * (0.6 + 0.4 * k) * 0.32); c.rotate(f * (s.el === 'cast' ? -0.04 : 0.05));
    c.drawImage(cv, -RUNE_S / 2, -RUNE_S / 2);
    c.restore();
  }
  // The bulk-up's aura: stepped red flames licking up round him from behind
  if (bulkLeft > 0 && !state.player.inCutscene) {
    const pl = state.player, cx = pl.pos.x + pl.width / 2, feet = pl.pos.y + pl.height, w = pl.width * BULK.size * 0.5 + 10, h = pl.height * BULK.size + 6;
    const beat = bulkLeft % (bulkLeft < 120 ? 20 : 45) < 6 ? 1.25 : 1;
    for (let i = 0; i < 9; i++) {
      const u = i / 8, x = cx + (u - 0.5) * 2 * w, base = feet - h * (0.25 + 0.75 * Math.sin(u * Math.PI)) + 8, fh = (10 + ((f * 3 + i * 11) % 14)) * beat;
      c.fillStyle = 'rgba(220, 38, 38, 0.45)'; c.beginPath(); c.moveTo(x - 6, base + 10); c.lineTo(x, base - fh); c.lineTo(x + 6, base + 10); c.closePath(); c.fill();
      c.fillStyle = 'rgba(254, 240, 138, 0.5)'; c.beginPath(); c.moveTo(x - 3, base + 8); c.lineTo(x, base - fh * 0.55); c.lineTo(x + 3, base + 8); c.closePath(); c.fill();
    }
  }
};

/** The anger vein: four stepped red brackets popping on him, inked. */
const drawVein = (c: Ctx, x: number, y: number, s: number) => {
  const q = (col: string, o: number) => {
    c.fillStyle = col;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      c.fillRect(Math.round(x + sx * 2 * s - (sx < 0 ? 5 * s : 0)) - o, Math.round(y + sy * 2 * s - (sy < 0 ? 2 * s : 0)) - o, Math.round(5 * s) + o * 2, Math.round(2 * s) + o * 2);
      c.fillRect(Math.round(x + sx * 2 * s - (sx < 0 ? 2 * s : 0)) - o, Math.round(y + sy * 2 * s - (sy < 0 ? 5 * s : 0)) - o, Math.round(2 * s) + o * 2, Math.round(5 * s) + o * 2);
    }
  };
  q(INK, 1); q('#DC2626', 0);
};

/** Over everything: the twinkles, the flares, the lightning's forks and afterglow, the vein on him. */
const drawOverFx = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const z of zaps) {
    // (forks while it's lit; then the afterglow, a thin violet ghost of the path, and a glow where it struck)
    if (z.t < 6) {
      const k = 1 - z.t / 6;
      for (const fork of z.forks) for (const [w, col] of [[5, `rgba(103, 232, 249, ${(0.35 * k).toFixed(2)})`], [1.5, `rgba(255, 255, 255, ${k.toFixed(2)})`]] as const) {
        c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(fork[0].x, fork[0].y); for (const p of fork) c.lineTo(p.x, p.y); c.stroke();
      }
    } else if (z.path.length) {
      const k = 1 - (z.t - 6) / 16;
      c.strokeStyle = `rgba(196, 181, 253, ${(0.45 * k).toFixed(2)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(z.path[0].x, z.path[0].y); for (const p of z.path) c.lineTo(p.x, p.y); c.stroke();
    }
    if (z.t < 14) {
      const k = 1 - z.t / 14;
      c.fillStyle = `rgba(103, 232, 249, ${(0.35 * k).toFixed(2)})`; c.beginPath(); c.ellipse(z.at.x, z.at.y, 26, 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = `rgba(236, 254, 255, ${(0.7 * k).toFixed(2)})`; c.beginPath(); c.ellipse(z.at.x, z.at.y, 12, 3, 0, 0, Math.PI * 2); c.fill();
    }
  }
  for (const fl of flares) {
    // (out in three frames, then shrinking away: each band of the ramp a cross, wide to narrow, dark to white)
    const k = fl.t < 3 ? (fl.t + 1) / 3 : 1 - (fl.t - 3) / (fl.life - 3), L = fl.r * k;
    if (L < 2) continue;
    for (let i = 0; i < fl.ramp.length; i++) {
      const s = 1 - i * 0.18, th = Math.max(1, Math.round((fl.ramp.length - i) * 1.6 * k));
      c.fillStyle = fl.ramp[i];
      c.fillRect(Math.round(fl.x - L * s), Math.round(fl.y - th / 2), Math.round(L * s * 2), th);
      c.fillRect(Math.round(fl.x - th / 2), Math.round(fl.y - L * s * 0.6), th, Math.round(L * s * 1.2));
      const d = Math.round(L * s * 0.3);
      c.fillRect(Math.round(fl.x - d / 2 - th / 2), Math.round(fl.y - d / 2 - th / 2), d + th, d + th);
    }
  }
  for (const s of sparks) {
    // (a glint: the middle, its arms out and in by turns)
    const a = s.t > s.life - 6 ? (s.life - s.t) / 6 : 1, arm = ((f + Math.floor(s.x)) >> 2) % 2 ? (s.big ? 4 : 2) : (s.big ? 2 : 1);
    c.globalAlpha = a;
    c.fillStyle = s.col; c.fillRect(Math.round(s.x) - arm, Math.round(s.y), arm * 2 + 1, 1); c.fillRect(Math.round(s.x), Math.round(s.y) - arm, 1, arm * 2 + 1);
    c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    c.globalAlpha = 1;
  }
  // (the vein popping on him, flexing, and with each heartbeat while he's bulked)
  const pl = state.player;
  if (state.deathTimer <= 0 && !pl.inCutscene && (posing > 0 || bulkLeft > 0)) {
    const per = bulkLeft < 120 ? 20 : 45, beat = posing > 0 ? (f >> 2) % 2 : bulkLeft % per < 8 ? 1 : 0;
    const big = bulkLeft > 0 ? BULK.size : 1, hx = pl.pos.x + pl.width / 2 - pl.facing * 10, hy = pl.pos.y + pl.height - (pl.vine ? 66 : 76) * big;
    if (posing > 0 || beat) drawVein(c, hx, hy, beat ? 1.5 : 1.1);
    if (bulkLeft > 0 && beat) {
      // (the heartbeat: a stepped red ring thumping out off him)
      const k = (bulkLeft % per) / 8, cx = pl.pos.x + pl.width / 2, cy = pl.pos.y + pl.height / 2;
      c.strokeStyle = `rgba(248, 113, 113, ${(0.6 * (1 - k)).toFixed(2)})`; c.lineWidth = 3;
      c.beginPath(); c.ellipse(cx, cy, 30 + k * 26, 40 + k * 30, 0, 0, Math.PI * 2); c.stroke();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const draw = (c: Ctx, p: Projectile, frame: number) => {
  const f = fallOf(p);
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height / 2, r = p.width / 2;
  // (its tail, back the way it came: u along it, n across it)
  const sp = Math.hypot(p.vel.x, p.vel.y) || 1, ux = -p.vel.x / sp, uy = -p.vel.y / sp, nx = -uy, ny = ux;
  const tail = (len: number, w: number, col: string, jag = 0) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(x + nx * w, y + ny * w);
    // (flame licks down each side, stepped by the frame)
    for (let i = 1; i <= 3; i++) { const k = i / 4, j = ((frame + i) % 3 - 1) * jag; c.lineTo(x + ux * len * k + nx * (w * (1 - k) + j), y + uy * len * k + ny * (w * (1 - k) + j)); }
    c.lineTo(x + ux * len, y + uy * len);
    for (let i = 3; i >= 1; i--) { const k = i / 4, j = ((frame + i * 2) % 3 - 1) * jag; c.lineTo(x + ux * len * k - nx * (w * (1 - k) + j), y + uy * len * k - ny * (w * (1 - k) + j)); }
    c.lineTo(x - nx * w, y - ny * w); c.closePath(); c.fill();
  };
  if (f.el === 'meteor') {
    // The fiery trail: stepped bands, dark red wide to yellow narrow, flickering in length
    const fl = frame % 4 < 2 ? 1 : 0.88;
    tail(r * 5.2 * fl, r * 1.15, 'rgba(124, 45, 18, 0.55)', 3); tail(r * 4.2 * fl, r * 0.95, '#EA580C', 3); tail(r * 3 * fl, r * 0.7, '#FB923C', 2); tail(r * 1.8 * fl, r * 0.42, '#FDE047', 1);
  } else {
    // The comet's tail: a long pale streak, a white core down it, glitter twinkling all along it
    tail(r * 7, r * 0.9, 'rgba(186, 230, 253, 0.35)'); tail(r * 5, r * 0.5, 'rgba(224, 242, 254, 0.6)'); tail(r * 3, r * 0.22, '#FFFFFF');
    for (let i = 0; i < 9; i++) {
      const d = ((i * 13 + frame * 2) % (r * 7)), side = (((i * 37) % 7) / 7 - 0.5) * r * 1.4 * (1 - d / (r * 7));
      const gx = Math.round(x + ux * d + nx * side), gy = Math.round(y + uy * d + ny * side), arm = (frame + i) % 4 < 2 ? 2 : 1;
      c.fillStyle = i % 3 ? '#E0F2FE' : '#FFFFFF'; c.fillRect(gx - arm, gy, arm * 2 + 1, 1); c.fillRect(gx, gy - arm, 1, arm * 2 + 1);
    }
  }
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
  // (dead: no casting pose or flex left over his death (the user's: any death pose overwrites a special one))
  if ((state.deathTimer > 0 || seated(state.player) || state.player.currentWeapon !== 'SPELLBOOK') && (casting > 0 || posing > 0 || winding > 0)) { casting = 0; posing = 0; winding = 0; state.player.hidden = false; syncArmor(); }
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
      // (reading it out: a page flipping over and over, spine to edge, narrowing to the spine and out the other side)
      if (winding > 0) { const ph = (f % 8) / 8, w = Math.cos(ph * Math.PI) * 8; g.fillStyle = '#FAF5FF'; g.fillRect(Math.min(39, 39 + w), -37 - Math.sin(ph * Math.PI) * 4, Math.abs(w) || 1, 11); }
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
  drawOverFx(c, state);
};

/**
 * On a vine (vineArm: the arm's level frame, the shoulder at (sx, sy)), one-handed. Reading the storm out: the book
 * thrust out at arm's length, open and blazing, its pages flipping over and over, light pouring up off it. Bulking up:
 * a one-armed flex, the elbow out level, the book up in his fist, open, light shooting up out of it, shaking with it.
 */
const vineArm = (state: GameState) => {
  const pl = state.player;
  if (!pl.vine || pl.currentWeapon !== 'SPELLBOOK' || (casting <= 0 && posing <= 0) || seated(pl)) return null;
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

/** In his fist: the tome, black leather in stepped bands, stitched round its border, a ribbed spine, iron corner
 *  brackets riveted on; a skull embossed on the cover, four runes cut round it that light up one after another, the
 *  skull's eyes glowing; the pages glowing out the fore-edge, a page corner flicking up now and then; a strap and a
 *  brass buckle over the edge. The still parts are stamps (heldArt.ts); the glow, runes and pages are live. */
const RUNES: readonly (readonly [number, number, number, number])[][] = [
  [[1.6, -2.4, 0.6, 3], [1.6, -2.4, 1.6, 0.6], [2.6, -1, 0.6, 1.6]],
  [[12.6, -2.4, 0.6, 3], [12, -1.2, 1.8, 0.6], [13.2, -2.4, 0.6, 1]],
  [[6.8, -6, 2.4, 0.6], [7.7, -6, 0.6, 1.6]],
  [[6.6, 4.8, 0.6, 1.6], [7.6, 4.4, 0.6, 2], [8.6, 4.8, 0.6, 1.6], [6.6, 4.8, 2.6, 0.5]],
];
const paintBook = (g: Ctx) => {
  H.box(g, -2, -8, 20, 18, INK);
  // (the cover: black leather, lit along the top, darkest along the bottom, dithered between; grain in it)
  H.box(g, -1, -7, 18, 16, '#27272A');
  H.box(g, -1, -7, 18, 2, '#3F3F46'); H.dither(g, -1, -5, 18, 1, '#3F3F46', 1);
  H.box(g, -1, 7, 18, 2, '#18181B'); H.dither(g, -1, 6, 18, 1, '#18181B', 0);
  H.speckle(g, 0, -4, 16, 10, '#1E1E22', 3, 7); H.speckle(g, 0, -4, 16, 10, '#38383F', 8, 9);
  // (the spine: darker, ribbed)
  H.box(g, -1, -7, 1.6, 16, '#1C1C20');
  for (const y of [-4, 0, 4]) { H.box(g, -1, y, 2, 0.8, '#52525B'); H.box(g, -1, y + 0.8, 2, 0.5, '#0C0C0E'); }
  // (stitched round the border)
  for (let x = 2.5; x < 14; x += 1.6) { H.box(g, x, -5.6, 0.8, 0.4, '#57534E'); H.box(g, x, 7.2, 0.8, 0.4, '#44403C'); }
  for (let y = -4.2; y < 7; y += 1.6) { H.box(g, 1.6, y, 0.4, 0.8, '#57534E'); H.box(g, 15, y, 0.4, 0.8, '#44403C'); }
  // (the runes cut round the skull: dark grooves, lit live)
  for (const r of RUNES) for (const [x, y, w, h] of r) { H.box(g, x, y, w, h, '#0C0C0E'); H.box(g, x, y + h, w, 0.3, '#45454D'); }
  // (the skull, embossed: its shadow on the leather, bone lit from the top left)
  H.box(g, 5.6, -3.4, 6, 5, '#0C0C0E'); H.box(g, 6.6, 1.6, 4, 2, '#0C0C0E');
  H.box(g, 5, -4, 6, 5, '#D6D3D1'); H.box(g, 6, 1, 4, 2, '#D6D3D1');
  H.box(g, 5, -4, 6, 1, '#F5F5F4'); H.box(g, 5, -4, 1, 4, '#E7E5E4'); H.box(g, 10.4, -3, 0.6, 4, '#A8A29E'); H.box(g, 6, 2.4, 4, 0.6, '#A8A29E');
  H.box(g, 6, -2, 2, 2, INK); H.box(g, 9, -2, 2, 2, INK);
  H.box(g, 8, 0, 1, 0.8, '#57534E');
  H.box(g, 7, 1, 1, 2, INK); H.box(g, 9, 1, 1, 2, INK); H.box(g, 8, 1.4, 0.4, 1.2, '#78716C');
  H.box(g, 9.6, -4, 0.4, 1.2, '#78716C'); H.box(g, 9.2, -2.8, 0.4, 0.6, '#78716C');
  // (iron brackets on the corners: lit edges, a rivet each)
  for (const [x, y, sx, sy] of [[-1, -7, 1, 1], [17, -7, -1, 1], [-1, 9, 1, -1], [17, 9, -1, -1]] as const) {
    H.poly(g, [[x, y], [x + sx * 3.6, y], [x, y + sy * 3.6]], '#71717A');
    H.poly(g, [[x, y], [x + sx * 3.6, y], [x + sx * 3, y + sy * 0.6], [x, y + sy * 0.6]], sy > 0 ? '#D4D4D8' : '#52525B');
    H.rivet(g, x + sx * 0.8 - (sx < 0 ? 1 : 0), y + sy * 0.8 - (sy < 0 ? 1 : 0), '#27272A', '#E4E4E7');
  }
  // (the fore-edge: the page ends, lined)
  H.box(g, 17, -6, 2, 14, '#E9D5FF');
  for (let y = -5.5; y < 8; y += 1) H.box(g, 17, y, 2, 0.4, '#C4B5FD');
};
const paintClasp = (g: Ctx) => {
  H.box(g, 13.6, -0.4, 6, 3.2, INK);
  H.box(g, 14, 0, 5.6, 2.4, '#44403C'); H.box(g, 14, 0, 5.6, 0.5, '#78716C'); H.box(g, 14, 1.9, 5.6, 0.5, '#292524');
  H.box(g, 15, -0.5, 2, 3.4, INK); H.box(g, 15.3, -0.2, 1.4, 2.8, '#CA8A04'); H.box(g, 15.3, -0.2, 1.4, 0.6, '#FDE68A'); H.box(g, 15.8, 0.6, 0.4, 1.2, INK);
};
const drawHeld = (c: Ctx, frame: number) => {
  c.save();
  H.snapOrigin(c);
  H.heldStamp(c, 'book', -3, -9, 23, 20, paintBook);
  // The pages glowing out the edge, breathing; a bloom off it
  const gl = 0.5 + 0.5 * Math.sin(frame * 0.21);
  c.fillStyle = `rgba(192, 132, 252, ${(0.35 + gl * 0.45).toFixed(2)})`; c.fillRect(17, -6, 2, 14);
  c.fillStyle = `rgba(233, 213, 255, ${(gl * 0.6).toFixed(2)})`; c.fillRect(17.5, -5, 1, 12);
  c.fillStyle = `rgba(192, 132, 252, ${(0.12 + gl * 0.15).toFixed(2)})`; c.fillRect(19, -5, 1.5, 12);
  // (the runes, lighting up one after another; the skull's eyes glowing)
  const step = Math.floor(frame / 14) % (RUNES.length + 2);
  RUNES.forEach((r, i) => {
    const on = i === step ? 1 : i === step - 1 ? 0.45 : 0.12;
    c.fillStyle = `rgba(192, 132, 252, ${on.toFixed(2)})`;
    for (const [x, y, w, h] of r) c.fillRect(x, y, w, h);
    if (on === 1) { c.fillStyle = 'rgba(243, 232, 255, 0.9)'; c.fillRect(r[0][0], r[0][1], 0.6, 0.6); }
  });
  const eye = 0.35 + 0.35 * Math.sin(frame * 0.09);
  c.fillStyle = `rgba(168, 85, 247, ${eye.toFixed(2)})`; c.fillRect(6, -2, 2, 2); c.fillRect(9, -2, 2, 2);
  c.fillStyle = `rgba(243, 232, 255, ${(eye * 1.2).toFixed(2)})`; c.fillRect(6.6, -1.4, 0.8, 0.8); c.fillRect(9.6, -1.4, 0.8, 0.8);
  // (a page corner flicking up off the top of the edge now and then, and settling)
  const ft = frame % 110;
  if (ft < 26) {
    const k = Math.sin((ft / 26) * Math.PI) * (ft < 13 ? 1 : 0.8), h = 0.6 + k * 2.6;
    c.fillStyle = INK; c.beginPath(); c.moveTo(15.4, -7.4); c.lineTo(19.6, -7.4 - h); c.lineTo(19.8, -6.2); c.closePath(); c.fill();
    c.fillStyle = '#FAF5FF'; c.beginPath(); c.moveTo(16.2, -7.2); c.lineTo(19.2, -7.2 - h * 0.85); c.lineTo(19.2, -6.6); c.closePath(); c.fill();
  }
  H.heldStamp(c, 'book:clasp', 13, -1, 7.5, 4.5, paintClasp);
  H.twinkle(c, frame, 15.7, 0.1, 160, 20, 1.3);
  // (motes of it drifting up off the pages)
  for (let j = 0; j < 2; j++) {
    const t = ((frame + j * 23) % 46) / 46;
    c.fillStyle = `rgba(216, 180, 254, ${(0.6 * (1 - t)).toFixed(2)})`;
    c.fillRect(Math.round((19.5 + Math.sin(t * 7 + j * 3)) * 2) / 2, Math.round((-3 + j * 4 - t * 9) * 2) / 2, 1, 1);
  }
  c.restore();
};

export const registerSpellbook = () => registerWeapon('SPELLBOOK', { fire: ctx => fire(ctx), update, draw, drawHeld, tick, drawOverlay, vineArm, drawUnder: (c, state) => { drawPulped(c, state); drawUnderFx(c, state); } });
