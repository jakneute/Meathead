// THE SPELLBOOK OF THE DAMNED (Fantasy Land): a heavy black tome, a skull on the cover, pages that glow. Fire reads
// out an elemental storm on whoever's about (up to three of them, nearest first): a METEOR that comes down on one and
// goes up in a blast (anybody it doesn't kill is left burning a while), a COMET that comes down on another (it hurts,
// and anybody it doesn't kill is frozen solid a good while), and LIGHTNING that strikes a third over and over till
// he's dead. Fewer than three about, and some of them get more than one of it at once. A spell's a while coming back.
// Secondary fire (Y, or F) is the support spell, BULK UP: for a while he's a lot faster, a lot bigger, and whatever he
// charges or throws goes a lot further; a long while coming back. Its ammo's MANA (pickups fill it the same).

import type { Enemy, Projectile } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { registerWeapon } from '../../m1/game/combat/customWeapons';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { setBuffs } from '../../m1/game/core/buffs';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { CANVAS_WIDTH } from '../../m1/constants';
import { m2Kill } from '../moves/killLines';
import { grabCallout } from '../moves/callouts';
import { BULK_LINES } from '../lines/weaponLines';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

const CAST_COOLDOWN = 80, REACH = 680;
const METEOR = { dmg: 80, edge: 25, radius: 95, burn: 240, burnDmg: 0.4 };
const COMET = { dmg: 45, freeze: 320 };
const BOLT = { every: 14, dmg: 15, maxFrames: 900 };
const BULK = { frames: 480, cooldown: 720, speed: 1.6, size: 1.3, knock: 2.2 };

const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway && !e.innocent && e.type !== 'boss';
const mid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

// ---------------------------------------------------------------------------------------------------------------
// The storm

type Element = 'meteor' | 'comet';
interface Fall { el: Element; target: Enemy | null; to: { x: number; y: number } }
const fallOf = (p: Projectile) => p.customData as Fall;

/** Whoever's struck over and over, and when next. */
let bolts: { e: Enemy; next: number; until: number; flash: number; path: { x: number; y: number }[] }[] = [];
/** Whoever's burning, and how long for. */
const burning = new Map<Enemy, number>();
/** The cast itself (runes round him), frames left. */
let casting = 0;

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

/** Read the storm out: on the nearest three about (fewer, and they get more of it), one of each. */
const fire = (ctx: FrameContext) => {
  const { state, cheats } = ctx;
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
  if (z) bolts.push({ e: z, next: state.frame + 18, until: state.frame + BOLT.maxFrames, flash: 0, path: [] });
  pl.shootCooldown = CAST_COOLDOWN;
  if (!cheats.infiniteAmmo) pl.weaponAmmo.SPELLBOOK--;
  casting = 26;
  playSound('spell');
};

/** A meteor or a comet, out of the sky over him (from off to one side), coming down on him. */
const fall = (state: GameState, el: Element, target: Enemy | null, fallback: { x: number; y: number }) => {
  const to = target ? mid(target) : fallback;
  const side = Math.random() < 0.5 ? -1 : 1;
  const from = { x: to.x + side * (140 + Math.random() * 80), y: state.camera.y - 50 };
  const d = Math.hypot(to.x - from.x, to.y - from.y) || 1, sp = el === 'meteor' ? 13 : 15;
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
  playSound('boom'); shakeScreen(state, 14, 8);
  fx.spawnExplosion(at, '#F97316', 30, 0, 20); fx.spawnExplosion(at, '#FDE047', 18, 0, 14); fx.spawnExplosion(at, '#57534E', 14, 0, 18);
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
  playSound('ice'); playSound('glass', 0.7, 4);
  fx.spawnExplosion(at, '#BAE6FD', 22, 0, 16); fx.spawnExplosion(at, '#FFFFFF', 12, 0, 10);
  for (const e of [...state.enemies]) {
    if (!alive(e)) continue;
    const near = e === hit || Math.hypot(mid(e).x - at.x, mid(e).y - at.y) < 34 + e.width / 2;
    if (!near) continue;
    if (!hurt(ctx, e, e === hit ? COMET.dmg : COMET.dmg * 0.5, 'pancaked') && !isMidBoss(e)) { e.frozeAt = state.frame; e.frozenTimer = COMET.freeze; }
  }
};

/** A lightning bolt's path down out of the sky to him: jagged. */
const boltPath = (state: GameState, to: { x: number; y: number }) => {
  const pts = [{ x: to.x + (Math.random() - 0.5) * 80, y: state.camera.y - 10 }];
  const n = 9;
  for (let i = 1; i < n; i++) { const k = i / n; pts.push({ x: pts[0].x + (to.x - pts[0].x) * k + (Math.random() - 0.5) * 34, y: pts[0].y + (to.y - pts[0].y) * k }); }
  pts.push(to);
  return pts;
};

// ---------------------------------------------------------------------------------------------------------------
// Bulk up

let bulkLeft = 0, bulkCool = 0, secondaryWas = false;
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

const tick = (ctx: FrameContext, input: { secondary?: boolean }, equipped: boolean) => {
  const { state } = ctx;
  const pl = state.player;
  if (casting > 0) casting--;
  // Bulk up: secondary, when it's ready
  const press = !!input.secondary && !secondaryWas;
  secondaryWas = !!input.secondary;
  if (equipped && press) {
    if (bulkLeft <= 0 && bulkCool <= 0) {
      bulkLeft = BULK.frames;
      setBuffs({ speed: BULK.speed, size: BULK.size, knock: BULK.knock });
      playSound('spell', 1, -8); playSound('slam', 0.8, -6); shakeScreen(state, 10, 5);
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; state.particles.push({ pos: { x: pl.pos.x + pl.width / 2, y: pl.pos.y + pl.height / 2 }, vel: { x: Math.cos(a) * 5, y: Math.sin(a) * 5 }, life: 20, color: i % 2 ? '#F87171' : '#FDE047', size: 4 }); }
      meatheadSays(state, BULK_LINES[Math.floor(Math.random() * BULK_LINES.length)]);
    } else playSound('click', 0.7, -4);
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
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height * 0.7 }, vel: { x: (Math.random() - 0.5), y: -1 - Math.random() * 1.5 }, life: 16, color: Math.random() < 0.3 ? '#57534E' : Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3 });
    e.health -= METEOR.burnDmg;
    if (state.frame % 30 === 0) ctx.fx.spawnDamageNumber(e.pos, Math.round(METEOR.burnDmg * 30));
    if (e.health <= 0) { if (isMidBoss(e)) e.health = 1; else spellKill(ctx, e, 'charred'); }
  }
  // The lightning: strike, strike, strike, till he's dead
  for (const b of [...bolts]) {
    if (b.flash > 0) b.flash--;
    if (!alive(b.e) || state.frame > b.until) { bolts = bolts.filter(o => o !== b); continue; }
    if (state.frame >= b.next) {
      b.next = state.frame + BOLT.every; b.flash = 6;
      b.path = boltPath(state, { x: mid(b.e).x, y: b.e.pos.y + b.e.height * 0.3 });
      playSound('taser', 0.7, 3); shakeScreen(state, 3, 2);
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { ...mid(b.e) }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 10, color: i % 2 ? '#FFFFFF' : '#A5F3FC', size: 2 });
      hurt(ctx, b.e, BOLT.dmg, 'fried');
    }
  }
};

/** Everything it was in the middle of, stopped (through a door): no storm, no burning, no bulk. */
export const stopSpellbook = () => { bolts = []; burning.clear(); casting = 0; bulkLeft = 0; setBuffs({ speed: 1, size: 1, knock: 1 }); publish(); };

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
  // The lightning, while it's lit
  for (const b of bolts) {
    if (b.flash <= 0 || !b.path.length) continue;
    const k = b.flash / 6;
    for (const [w, col] of [[7, `rgba(165, 243, 252, ${(0.35 * k).toFixed(2)})`], [3, `rgba(255, 255, 255, ${k.toFixed(2)})`]] as const) {
      c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(b.path[0].x, b.path[0].y);
      for (const pt of b.path) c.lineTo(pt.x, pt.y);
      c.stroke();
    }
  }
  // The cast: runes going round him, glowing
  if (casting > 0) {
    const pl = state.player, cx = pl.pos.x + pl.width / 2, cy = pl.pos.y + pl.height / 2, k = casting / 26;
    c.strokeStyle = `rgba(192, 132, 252, ${(0.8 * k).toFixed(2)})`; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, 44 - k * 10, 0, Math.PI * 2); c.stroke();
    c.fillStyle = `rgba(233, 213, 255, ${k.toFixed(2)})`;
    for (let i = 0; i < 8; i++) { const a = state.frame * 0.12 + (i / 8) * Math.PI * 2, rr = 44 - k * 10; c.fillRect(cx + Math.cos(a) * rr - 2, cy + Math.sin(a) * rr - 3, 4, 6); }
  }
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

export const registerSpellbook = () => registerWeapon('SPELLBOOK', { fire: ctx => fire(ctx), update, draw, drawHeld, tick, drawOverlay });
