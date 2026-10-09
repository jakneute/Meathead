// THE T. REX: the paddock's sub-boss. A broken animatronic, out to kill him: slow, stomping, menacing.
//
// It's in four parts, each with its own health: HEAD, BODY, LEGS, TAIL. Each part is its own (invisible) enemy the
// engine hits as usual (shots, the moves, the weapons' mid-boss hits), placed over the drawing as it moves; this file
// keeps their health in a big pool and takes whatever's come out of it each frame as that part's damage. It's down
// when all four are wrecked (wrecked parts are visibly off, sparking, limp; shots go past them).
//
// Hit one part too much and it goes LIVE (sparks, arcs, a glow that builds; each part's meter rises with the damage it
// takes, cools down after a while untouched): shots into a live part do a fraction of the damage, and any move into
// it (a charge, a slide, an uppercut, a dive kick) shocks him back, hurt, the move over. Spread it around.
// Sliding into its legs while they're not live does a lot (the slide's real job here): it staggers, and a sprinting
// rex is tripped flat. Wrecking a part blows him back hard, whatever he was doing (a dive-kick chain included).
//
// What it does: walks at him, slowly, stomping (the screen shakes); now and then roars, crouches and SPRINTS at him
// (to the fence: into it, and it's stunned a while); close in front, rears its head back, jaw open, and LUNGES for a
// bite (up at him on the lower feeding platforms too); behind it, it raises its tail and WHIPS it; otherwise it turns
// round, slowly. Up on the top platform out of its reach, it backs off and RAMS the platform's post, shaking him off.
// Wrecked legs: it limps, and no more sprints. Wrecked tail: no more whips, and it turns slower. Wrecked head: the jaw
// hangs, the bite's weaker. All gone: it comes apart, the head rolls, its speaker still doing the friendly bit.
//
// The far fence is closed off till it's down (the near one never is: back out and in again whenever). Started by
// walking into the paddock (or shooting it). Once he's past the temple fence (checkpoint 33 on), it's gone for good.

import type { Enemy, Block, Rect } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import type { EnemyKind } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { getAttackHitbox } from '../../../m1/game/player/player';
import { rectsOverlap, boundsOf } from '../../../m1/game/core/utils';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import { getAdv, solid, box, label, saidOver, speak, meatheadSays, type Said } from '../section';
import { GY } from '../geometry';
import {
  HURT_REX, DEATH_REX, HURT_REX_BITE, DEATH_REX_BITE, HURT_REX_SPRINT, DEATH_REX_SPRINT, HURT_REX_TAIL, DEATH_REX_TAIL,
  HURT_REX_SHOCK, DEATH_REX_SHOCK, MEATHEAD_REX_INTRO, REX_SPEAKER_DYING,
} from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const REX_KIND = 'm2:rex';
export const REX_NAME = 'TYRANNOSAURUS WRECKS';

// ---------------------------------------------------------------------------------------------------------------
// The numbers

type PartId = 'head' | 'body' | 'legs' | 'tail';
/** In order (an enemy's `variant` says which it is). */
const PARTS: PartId[] = ['head', 'body', 'legs', 'tail'];
const PART_NAME: Record<PartId, string> = { head: 'HEAD', body: 'BODY', legs: 'LEGS', tail: 'TAIL' };
/** Each part's health (the ray gun does 25 a bolt, 5 a second; a charge 14, an uppercut or a dive kick 45). */
const PART_HP: Record<PartId, number> = { head: 520, body: 650, legs: 460, tail: 360 };
/** What each part's enemy carries: what comes out of it each frame is the damage (it's topped back up). */
const POOL = 100000;
/** The live meter (0..100): how much a hit puts in it (its damage times this, at most CAP)... */
const METER_PER_DMG = 0.42, METER_CAP = 30;
/** ...live at ON, back off under OFF; cooling once it's gone COOL_AFTER frames untouched, by DECAY a frame. */
const LIVE_ON = 70, LIVE_OFF = 35, COOL_AFTER = 45, DECAY = 0.32;
/** A live part takes this share of what goes into it. */
const LIVE_SHARE = 0.3;
/** A slide into its legs (not live): this, not the slide's usual 14; and that much more on the meter. */
const SLIDE_LEG_DAMAGE = 75, SLIDE_LEG_METER = 22;
/** What it does to him. */
const BUMP_DMG = 10, BITE_DMG = 18, GUM_DMG = 10, SPRINT_DMG = 22, TAIL_DMG = 16, SHOCK_DMG = 14;
const WALK = 1.05, LIMP = 0.55, SPRINT = 7.2;
/** Frames between sprints (and a random bit more). */
const SPRINT_EVERY = 330, SPRINT_JITTER = 120;
/** Up out of its reach this long, and it goes for the platform's post. */
const CAMP_FRAMES = 150;
/** How far a wrecked part's blast reaches him. */
const BLAST_RANGE = 520;

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Part {
  id: PartId; hp: number; max: number;
  meter: number; live: boolean; lastHit: number; flash: number; broken: boolean;
  e: Enemy | null;
}
type RexState = 'idle' | 'intro' | 'walk' | 'turn' | 'open' | 'lunge' | 'chew' | 'crouch' | 'sprint' | 'skid' | 'crash'
  | 'stumble' | 'tailup' | 'whip' | 'backup' | 'ram' | 'dying' | 'dead';
interface Post { x1: number; x2: number; y: number }
interface Rex {
  fight: 'wait' | 'on' | 'dying' | 'dead' | 'gone';
  x: number; vx: number; facing: 1 | -1;
  st: RexState; t: number; stagger: number;
  parts: Record<PartId, Part>;
  /** The pose (smoothed toward what the state wants): crouched down, the head's offset, the jaw (0..1), the tail
   *  (-1 raised .. 1 down, whipped), the walk's phase. */
  crouch: number; hx: number; hy: number; jaw: number; tail: number; step: number;
  biteX: number; biteY: number; bit: boolean;
  sprintCd: number; campT: number; post: number; postShake: number; postShook: number;
  /** A slide into its legs this frame (its move), for the damage it does. */
  slideMove: number | null; slideAt: number;
  said: Said | null;
  /** Coming apart: frames of it, its head off and rolling, the body going over, the oil. */
  dieT: number; head: { x: number; y: number; vx: number; vy: number; rot: number } | null; fall: number; oil: number;
  minX: number; maxX: number; inX: number; outX: number;
  /** The far fence closed off (till it's down), and the near one, once the fight's on (shut in with it). */
  lock: Block | null; back: Block | null; posts: Post[];
}
const rexOf = (state: GameState) => (getAdv(state)?.s as Record<string, unknown> | undefined)?.rex as Rex | undefined;
const dinoMode = (state: GameState) => {
  const d = (getAdv(state)?.s as { dino?: { hostile?: boolean; held?: boolean } } | undefined)?.dino;
  return { hostile: d?.hostile ?? true, held: d?.held ?? false };
};

// ---------------------------------------------------------------------------------------------------------------
// Where its parts are (facing right, from its feet: x along, y up from the ground, negative)

const HEAD_W = 95, HEAD_H = 58;
/** The head's middle, at rest. */
const HEAD_REST = { x: 48 + HEAD_W / 2, y: -218 + HEAD_H / 2 };
const localBox = (r: Rex, id: PartId): Rect => {
  const cr = r.crouch;
  switch (id) {
    case 'legs': return { x: -38, y: -82 + cr * 0.5, w: 76, h: 82 - cr * 0.5 };
    case 'body': return { x: -72, y: -165 + cr, w: 132, h: 83 };
    case 'tail': {
      const ty = r.tail * 70;
      return r.tail > 0.4 ? { x: -215, y: -120 + cr + ty * 0.6, w: 145, h: 60 } : { x: -205, y: -150 + cr + ty, w: 135, h: 45 };
    }
    case 'head': return { x: 48 + r.hx, y: -218 + cr + r.hy, w: HEAD_W, h: HEAD_H };
  }
};
const worldBox = (r: Rex, id: PartId): Rect => {
  const b = localBox(r, id);
  return { x: r.facing > 0 ? r.x + b.x : r.x - (b.x + b.w), y: GY + b.y, w: b.w, h: b.h };
};
const centerOf = (b: Rect) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

// ---------------------------------------------------------------------------------------------------------------
// Putting it in the world

/** The rex and its paddock: `x` where it stands, the paddock's fences (`inX`, `outX`) and their top. */
export const buildRex = (state: GameState, o: { x: number; inX: number; outX: number; top: number }) => {
  const s = getAdv(state)!.s as Record<string, unknown>;
  // (past the temple fence already: it's scrap, long since)
  if (state.checkpoint >= 33) { s.rex = { fight: 'gone' } as Rex; return; }
  const parts = {} as Record<PartId, Part>;
  for (const id of PARTS) parts[id] = { id, hp: PART_HP[id], max: PART_HP[id], meter: 0, live: false, lastHit: -999, flash: 0, broken: false, e: null };
  const r: Rex = {
    fight: 'wait', x: o.x, vx: 0, facing: -1, st: 'idle', t: 0, stagger: 0, parts,
    crouch: 0, hx: 0, hy: 0, jaw: 0, tail: 0, step: 0, biteX: 0, biteY: 0, bit: false,
    sprintCd: 200, campT: 0, post: -1, postShake: 0, postShook: -1, slideMove: null, slideAt: -99, said: null,
    dieT: 0, head: null, fall: 0, oil: 0,
    minX: o.inX + 20 + 80, maxX: o.outX - 80, inX: o.inX, outX: o.outX, lock: null, back: null, posts: [],
  };
  // (its feeding platforms: their posts are what it rams)
  for (const b of state.blocks) if (b.type === 'platform' && b.oneWay && b.x > o.inX && b.x + b.w < o.outX) r.posts.push({ x1: b.x, x2: b.x + b.w, y: b.y });
  // The far fence, closed off up high till it's down (the near one never is)
  r.lock = solid(state, o.outX, GY - 1000, 20, o.top - (GY - 1000), { hidden: true, tag: 'dino' });
  PARTS.forEach((id, i) => {
    const e = makeKindEnemy(REX_KIND as EnemyKind, o.x, GY);
    e.variant = i; e.health = e.maxHealth = POOL;
    e.harmless = true; e.unshakeable = true; e.noCrowd = true; e.seen = true;
    parts[id].e = e;
    state.enemies.push(e);
  });
  s.rex = r;
  placeParts(r);
};

const placeParts = (r: Rex) => {
  for (const id of PARTS) {
    const p = r.parts[id], e = p.e;
    if (!e) continue;
    if (p.broken) { e.pos.y = -100000; continue; }
    const b = worldBox(r, id);
    e.pos.x = b.x; e.pos.y = b.y; e.width = b.w; e.height = b.h; e.facing = r.facing; e.vel.x = 0; e.vel.y = 0;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Taking hits

/** Whatever the engine's put on it this frame (it's a machine: no burning, freezing, oiling, needling, holding still). */
const shrugOff = (e: Enemy) => {
  e.frozenTimer = 0; e.isTased = false; e.pauseTimer = 0; e.sludgeTimer = 0; e.isOiled = false; e.isOnFire = false;
  e.fireTimer = 0; e.needleCount = 0; e.shockedUntil = undefined; e.runFrom = undefined; e.puppet = false;
};

const damage = (ctx: FrameContext, r: Rex, part: Part, raw: number) => {
  const { state } = ctx;
  const e = part.e!;
  const slid = part.id === 'legs' && r.slideMove !== null && state.frame - r.slideAt <= 2;
  let dmg = slid ? SLIDE_LEG_DAMAGE : raw;
  if (part.live) dmg *= LIVE_SHARE;
  if (slid) r.slideMove = null;
  part.hp -= dmg; part.flash = 5; part.lastHit = state.frame;
  part.meter = Math.min(100, part.meter + Math.min(METER_CAP, raw * METER_PER_DMG) + (slid ? SLIDE_LEG_METER : 0));
  // (the numbers that went up over it: what it really took)
  const k = dmg / raw;
  for (const n of state.damageNumbers) {
    if (n.value === undefined || n.life < n.maxLife - 2 || Math.abs(n.pos.x - e.pos.x) > 40 || Math.abs(n.pos.y - e.pos.y) > 40) continue;
    if (k !== 1) n.value = Math.max(0, Math.floor(n.value * k));
    if (part.live) n.color = '#67E8F9';
  }
  if (!part.live && part.meter >= LIVE_ON) goLive(ctx, r, part);
  if (part.hp <= 0) wreck(ctx, r, part);
};

const goLive = (ctx: FrameContext, r: Rex, part: Part) => {
  part.live = true;
  playSound('taser', 0.7, -4); playSound('bolt', 0.4, 6);
  const c = centerOf(worldBox(r, part.id));
  ctx.fx.spawnDamageNumber({ x: c.x - 20, y: c.y - 30 }, `${PART_NAME[part.id]} LIVE!`, true, '#67E8F9');
  sparks(ctx.state, c.x, c.y, 18, '#A5F3FC');
};

const sparks = (state: GameState, x: number, y: number, n: number, col = '#FDE047') => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
    state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp - 2 }, life: 8 + Math.random() * 14, color: i % 3 ? col : '#FFFFFF', size: 1.5 + Math.random() * 2, grav: 0.2 });
  }
};
const scrap = (state: GameState, x: number, y: number, n: number, dir = 0) => {
  const COLS = ['#5C5348', '#3E372F', '#7A7064', '#A1A1AA', '#52525B'];
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30 }, vel: { x: dir * 3 + (Math.random() - 0.5) * 12, y: -3 - Math.random() * 8 }, life: 40 + Math.random() * 30, color: COLS[i % COLS.length], size: 3 + Math.random() * 6, grav: 0.4, chunk: true });
};
const oilSpurt = (state: GameState, x: number, y: number, n: number, dir = 0) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 4) + (Math.random() - 0.5) * 3, y: -2 - Math.random() * 5 }, life: 30 + Math.random() * 20, color: i % 2 ? '#1C1917' : '#292524', size: 3 + Math.random() * 4, grav: 0.35 });
};

/** A part wrecked: a burst of scrap, sparks and oil out of it, and he's blown back off it, hard, out of whatever he was doing. */
const wreck = (ctx: FrameContext, r: Rex, part: Part) => {
  const { state } = ctx;
  const c = centerOf(worldBox(r, part.id));
  part.broken = true; part.hp = 0; part.live = false; part.meter = 0;
  if (part.e) part.e.pos.y = -100000;
  playSound('crash', 1, -4); playSound('clang', 0.9, -6); playSound('boom', 0.7, -2);
  shakeScreen(state, 18, 9);
  scrap(state, c.x, c.y, 26); sparks(state, c.x, c.y, 30); oilSpurt(state, c.x, c.y, 16);
  ctx.fx.spawnDamageNumber({ x: c.x - 30, y: c.y - 40 }, `${PART_NAME[part.id]} WRECKED!`, true, '#FB923C');
  blast(ctx, r, c);
  if (PARTS.every(id => r.parts[id].broken)) { die(ctx, r); return; }
  // (it reels)
  if (r.st !== 'dying') { r.st = 'crash'; r.t = 0; r.stagger = 50; }
};

const blast = (ctx: FrameContext, r: Rex, from: { x: number; y: number }) => {
  const p = ctx.state.player;
  const pc = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  const d = Math.hypot(pc.x - from.x, pc.y - from.y);
  if (d > BLAST_RANGE || p.health <= 0) return;
  const dir = Math.sign(pc.x - r.x) || -r.facing;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.slideRecoil = false;
  p.vel = { x: dir * (d < 300 ? 17 : 11), y: -9 };
  p.lockTimer = Math.max(p.lockTimer, 26); p.recoiling = true; p.isHarmlessPushback = true; p.smugTimer = 0;
};

/** Into a live part with a move: shocked back off it, hurt, the move over. */
const shock = (ctx: FrameContext, r: Rex, part: Part, e: Enemy) => {
  const { state } = ctx, p = state.player;
  const c = centerOf(boundsOf(e)), pc = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  const dir = Math.sign(pc.x - c.x) || -r.facing;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.slideRecoil = false;
  e.hitByMove = p.moveId; e.hitCooldown = 20;
  if (p.invincibilityTimer <= 0) hurtPlayer(ctx, SHOCK_DMG, 'm2:rex_shock', { x: dir * 9, y: -7 });
  else { p.vel = { x: dir * 9, y: -7 }; p.lockTimer = Math.max(p.lockTimer, 16); p.recoiling = true; p.isHarmlessPushback = true; }
  playSound('taser', 1, 0); playSound('bolt', 0.6, 2);
  shakeScreen(state, 8, 5);
  ctx.fx.spawnDamageNumber({ x: pc.x - 10, y: p.pos.y - 20 }, 'ZAP!', true, '#67E8F9');
  // (the arc from it into him)
  for (let i = 0; i < 12; i++) {
    const k = i / 12;
    state.particles.push({ pos: { x: c.x + (pc.x - c.x) * k + (Math.random() - 0.5) * 14, y: c.y + (pc.y - c.y) * k + (Math.random() - 0.5) * 14 }, vel: { x: 0, y: 0 }, life: 6 + Math.random() * 6, color: i % 2 ? '#E0F2FE' : '#22D3EE', size: 3 });
  }
  sparks(state, pc.x, pc.y, 14, '#A5F3FC');
  void part;
};

/** Its parts' own AI: each frame, a move of his into a live part shocks him (before the engine lands it); a slide into
 *  its legs (not live) is noted for the damage it does, and staggers it (trips it, sprinting). */
const partAI = (ctx: FrameContext, e: Enemy): boolean => {
  e.vel.x = 0; e.vel.y = 0;
  const r = rexOf(ctx.state);
  if (!r || r.fight === 'gone' || r.fight === 'dying' || r.fight === 'dead') return true;
  const part = r.parts[PARTS[e.variant ?? 0]];
  if (!part || part.broken) return true;
  const p = ctx.state.player;
  if (!(p.isCharging || p.isUppercutting || p.isDivekicking) || p.health <= 0) return true;
  if (p.isUppercutting && p.uppercutHitIds.includes(e.id)) return true;
  if (p.isDivekicking && p.diveKickHitIds.includes(e.id)) return true;
  if (e.hitCooldown && e.hitCooldown > 0 && e.hitByMove === p.moveId) return true;
  if (!rectsOverlap(getAttackHitbox(ctx), boundsOf(e))) return true;
  if (part.live) { shock(ctx, r, part, e); return true; }
  if (part.id === 'legs' && p.isCharging && p.isSliding) {
    r.slideMove = p.moveId ?? 0; r.slideAt = ctx.state.frame;
    const c = centerOf(boundsOf(e));
    playSound('crunch', 1, -4); playSound('clang', 0.8, -8); sparks(ctx.state, c.x, GY - 30, 22); scrap(ctx.state, c.x, GY - 30, 6);
    shakeScreen(ctx.state, 10, 6);
    if (r.st === 'sprint' || r.st === 'ram') {
      r.st = 'crash'; r.t = 0; r.stagger = 100; r.vx *= 0.4;
      ctx.fx.spawnDamageNumber({ x: c.x - 20, y: GY - 180 }, 'TRIPPED!', true, '#FDE047');
      playSound('thud', 1, -8);
    } else if (r.st !== 'crash' && r.st !== 'intro') { r.st = 'stumble'; r.t = 0; }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// What it does

/** How far into the paddock he has to be before it's on (and he's shut in with it). */
const ENGAGE = 340;

const startFight = (state: GameState, r: Rex) => {
  r.fight = 'on'; r.st = 'intro'; r.t = 0;
  // (the near fence shuts behind him: no going back out to pick off raptors, no fighting it from outside)
  r.back = solid(state, r.inX, GY - 1000, 20, 1000, { hidden: true, tag: 'dino' });
  const p = state.player;
  if (p.pos.x < r.inX + 20) p.pos.x = r.inX + 22;
  r.facing = state.player.pos.x + state.player.width / 2 < r.x ? -1 : 1;
  meatheadSays(state, pick(MEATHEAD_REX_INTRO), true);
};

const die = (ctx: FrameContext, r: Rex) => {
  r.fight = 'dying'; r.st = 'dying'; r.t = 0; r.dieT = 0; r.vx = 0;
  for (const id of PARTS) { const e = r.parts[id].e; if (e) { e.health = 0; e.seen = true; } r.parts[id].e = null; }
  if (r.lock) r.lock.x = -1e7;
  if (r.back) r.back.x = -1e7;
  speak('m2.rex', pick(REX_SPEAKER_DYING), s => { r.said = s; }, true);
  const c = centerOf(worldBox(r, 'body'));
  ctx.fx.spawnDamageNumber({ x: c.x - 40, y: c.y - 80 }, 'EXTINCT!', true, '#FDE047');
  playSound('alarm', 0.4, -8);
};

const bump = (ctx: FrameContext, dmg: number, source: string, kx: number, ky: number) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0) return false;
  hurtPlayer(ctx, dmg, source, { x: kx, y: ky });
  return true;
};

const hurtbox = (state: GameState): Rect => {
  const p = state.player;
  return p.isDucking ? { x: p.pos.x + 2, y: p.pos.y + (p.height - 26), w: p.width - 4, h: 26 } : boundsOf(p);
};

const near = (state: GameState, x: number) => Math.abs(x - (state.camera.x + 400)) < 700;

/** Each frame (the dino park's update calls it). */
export const updateRex = (ctx: FrameContext) => {
  const { state } = ctx;
  const r = rexOf(state);
  if (!r || r.fight === 'gone') return;
  const p = state.player;
  // What's come out of each part since last frame
  for (const id of PARTS) {
    const part = r.parts[id], e = part.e;
    if (!e) continue;
    const lost = POOL - e.health;
    e.health = POOL; shrugOff(e);
    if (part.flash > 0) part.flash--;
    if (part.broken) continue;
    // (not till he's well into its paddock: nothing gets through to it from outside, or from just inside the gate)
    if (lost > 0.01 && r.fight === 'on') damage(ctx, r, part, lost);
    if (r.fight !== 'on') continue;
    // (cooling off, untouched a while)
    if (state.frame - part.lastHit > COOL_AFTER) part.meter = Math.max(0, part.meter - DECAY);
    if (part.live && part.meter < LIVE_OFF) part.live = false;
    // (sparking, the more the hotter; crackling, live)
    if (part.meter > 20 && Math.random() < part.meter / 260) { const b = worldBox(r, id); sparks(state, b.x + Math.random() * b.w, b.y + Math.random() * b.h, 2, '#A5F3FC'); }
    if (part.live && state.frame % 24 === 0 && near(state, r.x)) playSound('taser', 0.18, -6 + Math.random() * 4);
  }
  for (const id of PARTS) {
    // (wrecked: sparking now and then, smoking)
    const part = r.parts[id];
    if (!part.broken || r.fight !== 'on') continue;
    const b = worldBox(r, id);
    if (Math.random() < 0.08) sparks(state, b.x + Math.random() * b.w, b.y + Math.random() * b.h, 3);
    if (state.frame % 6 === 0) state.particles.push({ pos: { x: b.x + Math.random() * b.w, y: b.y }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.8 - Math.random() * 0.6 }, life: 40, color: '#44403C', size: 5 + Math.random() * 5, alpha: 0.5 });
  }
  if (r.fight === 'dying' || r.fight === 'dead') { updateDeath(ctx, r); return; }
  const m = dinoMode(state);
  if (!m.hostile || m.held) { r.st = 'idle'; r.vx = 0; pose(r, 0, 0, 0, 0, 0, state.frame); placeParts(r); return; }
  if (r.fight === 'wait') {
    pose(r, 0, Math.sin(state.frame * 0.03) * 4, Math.sin(state.frame * 0.02) * 3, 0, 0, state.frame);
    if (p.health > 0 && p.pos.x + p.width / 2 > r.inX + ENGAGE && p.pos.x < r.outX) startFight(state, r);
    placeParts(r);
    // (till then there's nothing there to hit: shots and moves go clean through it)
    if (r.fight === 'wait') for (const id of PARTS) { const e = r.parts[id].e; if (e) e.pos.y = -100000; }
    return;
  }
  think(ctx, r);
  placeParts(r);
};

/** Eases the pose toward what's wanted: crouch, head offset, jaw, tail (k: how fast). */
const pose = (r: Rex, crouch: number, hx: number, hy: number, jaw: number, tail: number, _f: number, k = 0.18) => {
  r.crouch += (crouch - r.crouch) * k; r.hx += (hx - r.hx) * k; r.hy += (hy - r.hy) * k;
  r.jaw += (jaw - r.jaw) * Math.min(1, k * 1.6); r.tail += (tail - r.tail) * k;
};

const think = (ctx: FrameContext, r: Rex) => {
  const { state } = ctx, p = state.player, f = state.frame;
  r.t++;
  if (r.sprintCd > 0) r.sprintCd--;
  if (r.postShake > 0) r.postShake--;
  const legs = !r.parts.legs.broken, tail = !r.parts.tail.broken, head = !r.parts.head.broken;
  const pc = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  const pFeet = p.pos.y + p.height;
  const dx = pc.x - r.x, adx = Math.abs(dx), toward = (dx < 0 ? -1 : 1) as 1 | -1;
  const front = toward === r.facing;
  const alive = p.health > 0;
  const hb = hurtbox(state);
  const touching = (id: PartId) => rectsOverlap(hb, worldBox(r, id));
  const attacking = p.isCharging || p.isUppercutting || !!p.isDivekicking;
  /** Where the head would have to go to get him (from its rest), and whether it can. */
  const reachY = pc.y - GY - (HEAD_REST.y + r.crouch);
  const canBite = front && adx > 50 && adx < 265 && pc.y - GY > -275 && alive;
  const walkSpeed = legs ? WALK : LIMP;
  const sway = Math.sin(f * 0.04) * 3;
  let stomping = false;
  switch (r.st) {
    case 'intro':
      r.vx = 0;
      pose(r, r.t < 70 ? 10 : 0, -10, -30, r.t > 8 && r.t < 70 ? 1 : 0, -0.5, f);
      if (r.t === 10) { playSound('roar', 1, -6); shakeScreen(state, 26, 6); }
      if (r.t > 90) { r.st = 'walk'; r.t = 0; }
      break;
    case 'idle':
    case 'walk':
    default: {
      r.st = 'walk';
      pose(r, 0, sway, sway * 0.6, 0, 0, f);
      // Him up out of reach on a platform: it'll have him off it
      const onPlatform = p.isGrounded && pFeet < GY - 20;
      if (onPlatform && !canBite && adx < 500) r.campT++; else r.campT = Math.max(0, r.campT - 2);
      if (r.campT > CAMP_FRAMES) {
        const i = r.posts.findIndex(q => pc.x > q.x1 - 10 && pc.x < q.x2 + 10 && Math.abs(pFeet - q.y) < 8);
        if (i >= 0) { r.post = i; r.st = 'backup'; r.t = 0; r.campT = 0; r.facing = (((r.posts[i].x1 + r.posts[i].x2) / 2) < r.x ? -1 : 1); playSound('roar', 0.8, -2); break; }
      }
      if (!front && adx < 700 && r.t > 20) {
        if (tail && adx < 250 && pFeet > GY - 150) { r.st = 'tailup'; r.t = 0; playSound('grind', 0.5, -6); }
        else { r.st = 'turn'; r.t = 0; playSound('grind', 0.4, -10); }
        r.vx = 0;
        break;
      }
      if (canBite && r.t > 30) { r.st = 'open'; r.t = 0; r.vx = 0; playSound('snort', 1, -10); break; }
      if (legs && r.sprintCd <= 0 && front && adx > 260 && adx < 1100 && pFeet > GY - 40 && alive) { r.st = 'crouch'; r.t = 0; r.vx = 0; break; }
      r.vx = adx > 160 ? toward * walkSpeed : 0;
      if (r.vx !== 0) r.facing = toward;
      stomping = true;
      break;
    }
    case 'turn':
      r.vx = 0;
      pose(r, 6, -10, 10, 0, 0.2, f);
      if (r.t === Math.floor((tail ? 30 : 48) / 2)) { r.facing = (-r.facing) as 1 | -1; playSound('stomp', 0.7, -10); }
      if (r.t > (tail ? 30 : 48)) { r.st = 'walk'; r.t = 0; }
      break;
    case 'tailup':
      r.vx = 0;
      pose(r, 8, 20, 30, 0.3, -1, f, 0.2);
      if (r.t > 26) { r.st = 'whip'; r.t = 0; playSound('whoosh', 1, -8); }
      break;
    case 'whip':
      pose(r, 8, 20, 30, 0.3, 1, f, 0.5);
      if (r.t > 2 && r.t < 10 && touching('tail')) bump(ctx, TAIL_DMG, 'm2:rex_tail', toward * 11, -7);
      if (r.t === 5) { shakeScreen(state, 8, 4); playSound('slam', 0.6, -6); }
      if (r.t > 34) { r.st = front ? 'walk' : 'turn'; r.t = 0; }
      break;
    case 'open': {
      r.vx = 0;
      const wait = head ? 34 : 44;
      // (rearing back, jaw wide: up at him if he's up on a platform)
      pose(r, 4, -22, Math.min(-10, reachY * 0.3) - 14, 1, 0, f);
      if (r.t > wait) {
        r.biteX = Math.max(-10, Math.min(125, adx - HEAD_REST.x));
        r.biteY = Math.max(-95, Math.min(130, reachY));
        r.st = 'lunge'; r.t = 0; r.bit = false; playSound('whoosh', 0.9, -6);
      }
      break;
    }
    case 'lunge':
      pose(r, 6, r.biteX, r.biteY, r.t < 6 ? 1 : 0, 0, f, 0.45);
      r.vx = r.t < 6 ? r.facing * 2.5 : 0;
      if (!r.bit && touching('head')) { r.bit = bump(ctx, head ? BITE_DMG : GUM_DMG, 'm2:rex_bite', r.facing * 8, -6) || r.bit; }
      if (r.t === 6) playSound('crunch', 1, -8);
      if (r.t > 10) { r.st = 'chew'; r.t = 0; r.vx = 0; }
      break;
    case 'chew':
      // (head down where it bit, chomping: the head's in reach a moment)
      pose(r, 6, r.biteX, r.biteY, (Math.floor(r.t / 6) % 2) * 0.4, 0, f, 0.2);
      if (r.t > 44) { r.st = 'walk'; r.t = 0; }
      break;
    case 'crouch':
      // Head down, a roar, pawing at the dirt: it's coming
      r.vx = 0;
      pose(r, 22, 18, 50, r.t > 4 && r.t < 40 ? 1 : 0.2, -0.4, f);
      if (r.t === 4) { playSound('roar', 1, -2); shakeScreen(state, 12, 4); }
      if (r.t % 12 === 0) { const b = worldBox(r, 'legs'); for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: b.x + Math.random() * b.w, y: GY - 4 }, vel: { x: -r.facing * (1 + Math.random() * 3), y: -1 - Math.random() * 2 }, life: 24, color: '#A3825C', size: 4 + Math.random() * 3, grav: 0.15 }); }
      if (r.t % 8 === 0) { const b = worldBox(r, 'body'); state.particles.push({ pos: { x: b.x + b.w / 2, y: b.y }, vel: { x: 0, y: -1.5 }, life: 30, color: '#E7E5E4', size: 7, alpha: 0.6 }); }
      if (r.t > 56) { r.st = 'sprint'; r.t = 0; r.facing = toward; r.sprintCd = SPRINT_EVERY + Math.random() * SPRINT_JITTER; }
      break;
    case 'sprint':
      pose(r, 14, 30, 34, 0.6, 0.3, f, 0.3);
      r.vx = r.facing * SPRINT;
      stomping = true;
      if (touching('legs') || touching('body') || touching('head')) bump(ctx, SPRINT_DMG, 'm2:rex_sprint', r.facing * 13, -9);
      if (Math.sign(pc.x - r.x) !== r.facing && adx > 200) { r.st = 'skid'; r.t = 0; }
      else if (r.t > 110) { r.st = 'skid'; r.t = 0; }
      break;
    case 'skid':
      r.vx *= 0.9;
      pose(r, 10, 10, 20, 0, 0.2, f);
      if (r.t % 4 === 0 && Math.abs(r.vx) > 1) state.particles.push({ pos: { x: r.x, y: GY - 4 }, vel: { x: -r.vx * 0.3, y: -1.5 }, life: 20, color: '#A3825C', size: 6, grav: 0.1 });
      if (r.t > 36) { r.st = 'walk'; r.t = 0; r.vx = 0; }
      break;
    case 'backup':
      // (backing off from the post, eyes on it, then...)
      pose(r, 12, 10, 40, 0.5, -0.3, f);
      r.vx = -r.facing * 1.4;
      if (r.t > 50) { r.st = 'ram'; r.t = 0; playSound('roar', 1, 0); }
      break;
    case 'ram': {
      pose(r, 18, 30, 60, 0.2, 0.3, f, 0.3);
      r.vx = r.facing * 6;
      stomping = true;
      if (touching('legs') || touching('body') || touching('head')) bump(ctx, SPRINT_DMG, 'm2:rex_sprint', r.facing * 13, -9);
      const q = r.posts[r.post];
      const postX = q ? (q.x1 + q.x2) / 2 : r.x;
      if (!q || (r.facing > 0 ? r.x + 70 >= postX : r.x - 70 <= postX) || r.t > 120) {
        if (q) ramPost(ctx, r, q);
        r.st = 'crash'; r.t = 0; r.stagger = 60; r.vx = 0;
      }
      break;
    }
    case 'crash':
      // (staggered: hit the fence, tripped, a post rammed, a part wrecked: head down, a window)
      r.vx *= 0.8;
      pose(r, 16, 20, 70, 0.7, 0.6, f);
      if (r.t % 10 === 0) { const c = centerOf(worldBox(r, 'head')); sparks(state, c.x, c.y - 20, 3); }
      if (r.t > r.stagger) { r.st = 'walk'; r.t = 0; }
      break;
    case 'stumble':
      r.vx = 0;
      pose(r, 18, 0, 30, 0.4, 0.4, f, 0.3);
      if (r.t > 36) { r.st = 'walk'; r.t = 0; }
      break;
  }
  // Along, and kept in the paddock (sprinting or ramming into the fence: crunch, stunned)
  const nx = r.x + r.vx;
  if (nx < r.minX || nx > r.maxX) {
    r.x = Math.max(r.minX, Math.min(r.maxX, nx));
    if (r.st === 'sprint' || r.st === 'ram') {
      r.st = 'crash'; r.t = 0; r.stagger = 80; r.vx = 0;
      playSound('crash', 1, -6); playSound('clang', 1, -10); shakeScreen(state, 22, 8);
      const fx = r.facing > 0 ? r.outX : r.inX + 20;
      sparks(state, fx, GY - 120, 24); scrap(state, fx, GY - 100, 8);
    } else r.vx = 0;
  } else r.x = nx;
  // The stomps
  if (stomping && Math.abs(r.vx) > 0.1) {
    const was = Math.floor(r.step / Math.PI);
    r.step += Math.abs(r.vx) * (r.st === 'sprint' || r.st === 'ram' ? 0.045 : 0.06) * (legs ? 1 : 0.8);
    if (Math.floor(r.step / Math.PI) !== was && near(state, r.x)) {
      const big = Math.abs(r.vx) > 3;
      playSound('stomp', big ? 0.9 : 0.75, big ? -6 : -10); shakeScreen(state, big ? 6 : 5, big ? 4 : 3);
      // (limping on wrecked legs: a scrape and sparks on every other step)
      if (!legs) { const b = worldBox(r, 'legs'); sparks(state, b.x + b.w / 2, GY - 6, 5); }
    }
  }
  // Just walking into it: stepped on
  if (r.st !== 'sprint' && r.st !== 'ram' && !attacking && (touching('legs') || touching('body'))) bump(ctx, BUMP_DMG, REX_KIND, toward * 8, -6);
};

/** It rams a feeding platform's post: the platform shakes, and him off it. */
const ramPost = (ctx: FrameContext, r: Rex, q: Post) => {
  const { state } = ctx, p = state.player;
  playSound('crash', 1, -8); playSound('slam', 1, -6); shakeScreen(state, 24, 8);
  r.postShake = 24; r.postShook = r.posts.indexOf(q);
  const cx = (q.x1 + q.x2) / 2;
  sparks(state, cx, GY - 60, 10, '#D6B88A'); scrap(state, cx, GY - 60, 6);
  const pc = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (pc > q.x1 - 10 && pc < q.x2 + 10 && Math.abs(feet - q.y) < 10) {
    const dir = Math.sign(pc - cx) || -r.facing;
    p.vel = { x: dir * 6, y: -11 }; p.isGrounded = false;
    p.lockTimer = Math.max(p.lockTimer, 14); p.recoiling = true; p.isHarmlessPushback = true;
  }
};

/** Coming apart: the head off and rolling, the body going over, the oil. */
const updateDeath = (ctx: FrameContext, r: Rex) => {
  const { state } = ctx;
  r.dieT++;
  const t = r.dieT;
  const body = centerOf(worldBox(r, 'body'));
  if (t < 30) { if (t % 3 === 0) sparks(state, body.x + (Math.random() - 0.5) * 100, body.y + (Math.random() - 0.5) * 60, 4, Math.random() < 0.5 ? '#A5F3FC' : '#FDE047'); r.x += (t % 2 ? 2 : -2); }
  if (t === 24) {
    // The head pops off
    const h = centerOf(worldBox(r, 'head'));
    r.head = { x: h.x, y: h.y, vx: r.facing * 4 + (Math.random() - 0.5), vy: -10, rot: 0 };
    playSound('clang', 1, 4); playSound('boom', 0.8, -4); shakeScreen(state, 14, 6);
    oilSpurt(state, h.x - r.facing * 30, h.y + 10, 30, -r.facing); scrap(state, h.x, h.y, 12);
  }
  if (t > 24 && t < 70 && t % 4 === 0) oilSpurt(state, r.x + r.facing * 50, GY - 160 + r.fall * 100, 4, r.facing);
  if (t > 40) r.fall = Math.min(1, r.fall + (t < 70 ? 0.02 : 0.05));
  if (t === 78) { playSound('crash', 1, -12); playSound('thud', 1, -10); shakeScreen(state, 28, 10); scrap(state, r.x - r.facing * 60, GY - 30, 30); sparks(state, r.x, GY - 40, 30); }
  if (t > 78) r.oil = Math.min(1, r.oil + 0.01);
  // The head, rolling (it bounces off the fences)
  const h = r.head;
  if (h) {
    h.vy += 0.5; h.x += h.vx; h.y += h.vy;
    if (h.y > GY - 24) {
      h.y = GY - 24;
      if (h.vy > 2.5) { h.vy = -h.vy * 0.35; playSound('clang', 0.6, -2 + Math.random() * 4); } else h.vy = 0;
      h.vx *= 0.985;
    }
    if (h.x < r.inX + 50 || h.x > r.outX - 30) { h.vx = -h.vx * 0.6; h.x = Math.max(r.inX + 50, Math.min(r.outX - 30, h.x)); playSound('clang', 0.6, 0); }
    h.rot += h.vx / 24;
  }
  if (t > 300) { r.fight = 'dead'; r.st = 'dead'; }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass) — world space, behind him (the dino park's back layer calls it)

const REX = '#5C5348', REX_LO = '#3E372F', REX_HI = '#7A7064', INK = '#1A0B06', METAL = '#3F3F46';
const poly = (c: Ctx, pts: number[], col: string) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
};
const bolts = (c: Ctx, pts: number[]) => { c.fillStyle = '#D4D4D8'; for (let i = 0; i < pts.length; i += 2) c.fillRect(pts[i] - 1, pts[i + 1] - 1, 2, 2); };
/** A panel gone (dark inside, wires). */
const hole = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  c.fillStyle = '#0C0A09'; c.fillRect(x, y, w, h);
  const W = ['#DC2626', '#2563EB', '#FACC15'];
  for (let i = 0; i < 3; i++) { c.strokeStyle = W[i]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 3 + i * (w / 4), y + 2); c.quadraticCurveTo(x + w / 2, y + h + 6 + Math.sin(f * 0.1 + i) * 2, x + w - 4 - i * 3, y + h - 2); c.stroke(); }
};
/** How beaten up it looks: 0 fine .. 3 wrecked. */
const wear = (p: Part) => (p.broken ? 3 : p.hp < p.max * 0.33 ? 2 : p.hp < p.max * 0.66 ? 1 : 0);
const tint = (p: Part, col: string) => (p.broken ? '#2E2924' : p.flash > 0 ? '#D6D3D1' : col);

/** The rex, its parts in place (the same numbers as their boxes). */
export const drawRex = (c: Ctx, state: GameState) => {
  const r = rexOf(state);
  if (!r || r.fight === 'gone') return;
  const cam = state.camera.x;
  if (r.x < cam - 500 && (!r.head || r.head.x < cam - 100)) return;
  if (r.x > cam + 1300 && (!r.head || r.head.x > cam + 900)) return;
  const f = state.frame;
  // (the feeding platforms' posts: what it rams)
  r.posts.forEach((q, i) => {
    const shake = r.postShook === i && r.postShake > 0 ? Math.sin(r.postShake * 1.7) * r.postShake * 0.2 : 0;
    const cx = (q.x1 + q.x2) / 2;
    box(c, cx - 8 + shake, q.y + 12, 16, GY - q.y - 12, '#6B4F2E'); box(c, cx - 8 + shake, q.y + 12, 4, GY - q.y - 12, '#8B6B43');
  });
  // The near fence, shut behind him once it's on
  if (r.back && r.back.x > -1e6) {
    box(c, r.inX, GY - 520, 20, 330, '#27272A');
    for (let y = GY - 500; y < GY - 200; y += 26) box(c, r.inX - 4, y, 28, 3, '#71717A');
    if (f % 40 < 30) label(c, 'LOCKED IN WITH IT', r.inX + 10, GY - 530, '#FCA5A5', 7);
  }
  // The far fence, closed off high while it's alive
  if (r.lock && r.lock.x > -1e6) {
    box(c, r.outX, GY - 520, 20, 330, '#27272A');
    for (let y = GY - 500; y < GY - 200; y += 26) box(c, r.outX - 4, y, 28, 3, '#71717A');
    if (f % 40 < 30) label(c, 'LOCKED: FEEDING TIME', r.outX + 10, GY - 530, '#FCA5A5', 7);
  }
  // The oil it's lying in
  if (r.oil > 0) { c.fillStyle = 'rgba(12, 10, 9, 0.85)'; c.beginPath(); c.ellipse(r.x - r.facing * 40, GY + 2, 40 + r.oil * 140, 4 + r.oil * 4, 0, 0, Math.PI * 2); c.fill(); }
  c.save();
  c.translate(Math.round(r.x), GY);
  c.scale(r.facing, 1);
  // (going over, dying: tipped back about its feet, sinking)
  if (r.fall > 0) { c.translate(0, r.fall * 20); c.rotate(-r.fall * 1.35); }
  drawBody(c, r, f);
  c.restore();
  // Live and wrecked parts, over it (world space)
  if (r.fight === 'on') for (const id of PARTS) drawCharge(c, r, r.parts[id], f);
  // Its head, off and rolling
  if (r.head) {
    c.save(); c.translate(r.head.x, r.head.y); c.rotate(r.head.rot); c.scale(r.facing, 1);
    drawHead(c, r, f, -HEAD_W / 2, -HEAD_H / 2, true);
    c.restore();
  }
  // What its speaker's saying (out of the head)
  if (r.said?.text) {
    const at = r.head ?? centerOf(worldBox(r, 'head'));
    saidOver(c, r.said.text, Math.max(state.camera.x + 130, Math.min(state.camera.x + CANVAS_WIDTH - 130, at.x)), at.y - 46, '#BFDBFE', 220);
  }
};

const drawBody = (c: Ctx, r: Rex, f: number) => {
  const P = r.parts, cr = r.crouch;
  const st = Math.sin(r.step);
  const lw = wear(P.legs), bw = wear(P.body), tw = wear(P.tail);
  // Legs: far, then near (a wrecked pair: one knee buckled, sparking)
  for (const [s, col] of [[-1, REX_LO], [1, REX]] as const) {
    const k = st * s * 12;
    const knee = P.legs.broken && s > 0 ? 10 : 0;
    const hipY = -82 + cr * 0.5;
    poly(c, [-28 + k * 0.4, hipY, 14 + k * 0.4, hipY, 16 + k, -36 + knee, -12 + k, -36 + knee], tint(P.legs, col));
    poly(c, [-8 + k, -40 + knee, 12 + k, -40 + knee, 8 + k, -8, -6 + k, -8], tint(P.legs, col));
    poly(c, [-14 + k, -9, 28 + k, -9, 30 + k, 0, -14 + k, 0], METAL);
    if (lw >= 2 && s > 0) hole(c, -20 + k * 0.4, hipY + 10, 26, 18, f);
  }
  // Tail (raised to whip, slammed down, or wrecked: on the ground, dragging, in bits)
  const tailCol = tint(P.tail, REX_LO);
  if (P.tail.broken) {
    poly(c, [-62, -150 + cr, -120, -40, -128, -30, -64, -110 + cr], tailCol);
    poly(c, [-130, -26, -205, -8, -208, 0, -134, -14], tailCol);
    c.strokeStyle = '#DC2626'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-128, -30); c.lineTo(-134, -18); c.stroke();
  } else {
    const ty = r.tail * 70, sw = Math.sin(f * 0.06) * 6;
    const tip = r.tail > 0.4 ? -20 : -130 + ty;
    poly(c, [-62, -155 + cr, -205, tip - 6 + sw, -210, tip + 2 + sw, -62, -98 + cr], tailCol);
    c.strokeStyle = REX; c.lineWidth = 1; for (const x of [-100, -140, -175]) { const y = -128 + cr + (tip + 130) * ((-62 - x) / 148); c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x, y + 10); c.stroke(); }
    if (tw >= 2) hole(c, -120, -140 + cr + (tip + 130) * 0.4, 22, 14, f);
  }
  // Body
  const by = -165 + cr;
  poly(c, [-72, by + 18, -40, by, 40, by - 2, 62, by + 20, 56, by + 80, -66, by + 82], tint(P.body, REX));
  c.fillStyle = P.body.broken ? '#3F3A35' : REX_HI; c.fillRect(-60, by + 6, 90, 4);
  c.strokeStyle = REX_LO; c.lineWidth = 1.5; for (const x of [-40, -10, 22]) { c.beginPath(); c.moveTo(x, by + 4); c.lineTo(x, by + 80); c.stroke(); }
  bolts(c, [-50, by + 20, -24, by + 18, 6, by + 16, -50, by + 70, -24, by + 70, 6, by + 70, 40, by + 50]);
  if (bw >= 1) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-36, by + 30, 20, 14); }
  if (bw >= 2) hole(c, -8, by + 24, 28, 30, f);
  if (bw >= 3) { hole(c, -60, by + 30, 22, 36, f); hole(c, 24, by + 36, 22, 26, f); }
  // The silly little arm
  poly(c, [50, by + 46, 64, by + 56, 62, by + 61, 48, by + 54], tint(P.body, REX_LO));
  // Neck, into the head (off and rolling, dying: a stump, wires out of it)
  if (r.head) { poly(c, [26, by + 6, 52, by - 4, 64, by - 30, 40, by - 34], tint(P.body, REX)); hole(c, 40, by - 34, 22, 8, f); return; }
  const hx = 48 + r.hx, hy = -218 + cr + r.hy;
  poly(c, [26, by + 6, 52, by - 4, hx + 12, hy + HEAD_H - 4, hx + 4, hy + 18], tint(P.body, REX));
  drawHead(c, r, f, hx, hy, false);
};

/** The head at (x, y) (its box's corner): skull, jaw (open by r.jaw; hanging off, wrecked), teeth, the eye. */
const drawHead = (c: Ctx, r: Rex, f: number, x: number, y: number, off: boolean) => {
  const P = r.parts.head;
  const broken = P.broken || off;
  const open = broken ? 22 + Math.sin(f * 0.2) * 3 : r.jaw * 26;
  const col = tint(P, REX);
  poly(c, [x, y + 4, x + 70, y, x + 95, y + 10, x + 95, y + 26, x, y + 32], col);
  c.fillStyle = broken ? '#3F3A35' : REX_HI; c.fillRect(x + 4, y + 3, 64, 3);
  // jaw (hinged at the back; wrecked, hanging off one hinge)
  const jy = y + 32;
  poly(c, [x + 4, jy, x + 92, jy - 6 + open, x + 88, jy + 8 + open, x + 6, jy + 12], tint(P, REX_LO));
  c.fillStyle = '#F4F4F5';
  for (let i = 0; i < 10; i++) {
    const tx = x + 16 + i * 7.5;
    c.fillRect(tx, y + 26, 3, 6);
    if (!(broken && i % 3 === 1)) c.fillRect(tx, jy - 6 + open * ((tx - x) / 92) + 1, 3, 5);
  }
  bolts(c, [x + 8, y + 12, x + 26, y + 20, x + 60, y + 22]);
  if (wear(P) >= 2 || broken) hole(c, x + 40, y + 8, 18, 12, f);
  // the eye: red and glowing; wrecked, dead (a flicker now and then)
  const ex = x + 34, ey = y + 12;
  const lit = !broken || (f % 50 < 4);
  if (lit) {
    c.fillStyle = broken ? 'rgba(239,68,68,0.2)' : `rgba(239, 68, 68, ${0.35 + 0.15 * Math.sin(f * 0.3)})`;
    c.beginPath(); c.arc(ex, ey, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = r.st === 'open' && !broken && f % 6 < 3 ? '#FFFFFF' : '#EF4444'; c.fillRect(ex - 4, ey - 3, 8, 6);
    c.fillStyle = '#FECACA'; c.fillRect(ex - 1, ey - 2, 3, 3);
  } else { c.fillStyle = '#18181B'; c.fillRect(ex - 4, ey - 3, 8, 6); }
};

/** A part's charge: a glow and arcs that build with its meter; live, crackling all over it, and LIVE over it. */
const drawCharge = (c: Ctx, r: Rex, p: Part, f: number) => {
  if (p.broken || p.meter < 12) return;
  const b = worldBox(r, p.id), m = p.meter / 100;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(34, 211, 238, ${(p.live ? 0.22 + 0.1 * Math.sin(f * 0.6) : 0.05 + m * 0.18)})`;
  c.beginPath(); c.ellipse(cx, cy, b.w * 0.62 + (p.live ? 8 : 0), b.h * 0.7 + (p.live ? 8 : 0), 0, 0, Math.PI * 2); c.fill();
  const arcs = Math.floor(m * 4) + (p.live ? 4 : 0);
  for (let i = 0; i < arcs; i++) {
    if (!p.live && Math.random() < 0.4) continue;
    let x = b.x + Math.random() * b.w, y = b.y + Math.random() * b.h;
    c.strokeStyle = p.live ? (i % 2 ? '#E0F2FE' : '#22D3EE') : '#A5F3FC'; c.lineWidth = p.live ? 2 : 1.2;
    c.beginPath(); c.moveTo(x, y);
    for (let s = 0; s < 4; s++) { x += (Math.random() - 0.5) * 34; y += (Math.random() - 0.5) * 26; c.lineTo(Math.max(b.x - 10, Math.min(b.x + b.w + 10, x)), Math.max(b.y - 10, Math.min(b.y + b.h + 10, y))); }
    c.stroke();
  }
  c.restore();
  if (p.live) {
    if (f % 8 < 6) { c.strokeStyle = '#67E8F9'; c.lineWidth = 2; c.setLineDash([4, 3]); c.strokeRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6); c.setLineDash([]); }
    label(c, 'LIVE!', cx, b.y - 8, f % 10 < 5 ? '#67E8F9' : '#E0F2FE', 7);
  }
};

/** The boss bar (top band, clear of the HUD): the whole of it, and each part (its health; its charge; LIVE). */
export const drawRexHud = (c: Ctx, state: GameState) => {
  const r = rexOf(state);
  if (!r || (r.fight !== 'on' && !(r.fight === 'dying' && r.dieT < 90))) return;
  const p = state.player;
  if (p.inCutscene || p.pos.x < r.inX - 500 || p.pos.x > r.outX + 300) return;
  const band = topBand(), w = band.x2 - band.x1, f = state.frame;
  const total = PARTS.reduce((s, id) => s + Math.max(0, r.parts[id].hp), 0), max = PARTS.reduce((s, id) => s + r.parts[id].max, 0);
  box(c, band.x1, 18, w, 14, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * (total / max), 10, '#DC2626');
  label(c, REX_NAME, band.mid, 44, '#FDE68A', 8);
  const pw = (w - 18) / 4;
  PARTS.forEach((id, i) => {
    const P = r.parts[id], x = band.x1 + i * (pw + 6);
    box(c, x, 52, pw, 9, P.live && f % 10 < 5 ? '#67E8F9' : '#18181B');
    box(c, x + 1, 53, (pw - 2) * Math.max(0, P.hp / P.max), 7, P.broken ? '#44403C' : '#F59E0B');
    box(c, x, 63, pw * (P.meter / 100), 3, P.live ? '#E0F2FE' : '#22D3EE');
    label(c, P.broken ? `${PART_NAME[id]} X` : P.live ? `${PART_NAME[id]} LIVE` : PART_NAME[id], x + pw / 2, 78, P.broken ? '#78716C' : P.live ? '#67E8F9' : '#E7E5E4', 6);
  });
};

// ---------------------------------------------------------------------------------------------------------------

registerM2Kind({
  kind: REX_KIND, stats: { w: 76, h: 82, hp: POOL, contact: 0, mass: 600, air: true }, ai: partAI,
  // (drawn whole by drawRex, behind; its parts' boxes draw nothing, and no daze over them)
  draw: (_c, e) => { e.pauseTimer = 0; },
  head: { x: 0, y: -20, r: 18 }, gender: 'n', robot: true, grab: 'none', midBoss: true,
});
registerHurtLines(REX_KIND, HURT_REX, DEATH_REX);
registerHurtLines('m2:rex_bite', HURT_REX_BITE, DEATH_REX_BITE);
registerHurtLines('m2:rex_sprint', HURT_REX_SPRINT, DEATH_REX_SPRINT);
registerHurtLines('m2:rex_tail', HURT_REX_TAIL, DEATH_REX_TAIL);
registerHurtLines('m2:rex_shock', HURT_REX_SHOCK, DEATH_REX_SHOCK);
