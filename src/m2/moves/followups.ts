// The hidden upgrades' FOLLOW-UPS (upgrades/SPEC.md: the sabatons, pauldrons, armguards, leg armor; "Follow-ups,
// generally"), run as grabs of their own inside the grab system (grab.ts hands its phases here).
//
//   SABATONS  the MISSILE: Y + B just after a dive kick that didn't kill: he flips upside down over them, takes them by
//             the shoulders, flips on round swinging them up and over, and hurls them straight ahead, fast (gravity arcs
//             it down; no steering). Whoever they hit takes their weight and speed, more than a thrown body's.
//   PAULDRONS the GROUND SPIN: Y + B after a charge that didn't kill, on one standing on the ground (the charge pushed
//             them back: the reach is wide): spun down into the ground till only the head's out, stuck for good,
//             harmless. THE HEAD KICK: B by a head in the ground kicks it off like a football into the nearest enemy
//             that way; nobody that way but somebody the other way, he walks round it, points at them, then kicks.
//   ARMGUARDS the NINJA DROP: Y + B after an uppercut that didn't kill: on up with them, them upside down under him,
//             then down, spinning like a top, head first into the ground (regular enemies: dead, legs up out of it).
//   LEG ARMOR the FLASH KICK: up + B any time in a slide (not a follow-up to a hit: B's held through a slide, so up's
//             pressed with it, or B pressed with up held): one power cell (none, no kick), a backflip with the leg up
//             in an arc, about half the uppercut's height. Everything round him in a big circle takes 150 (bosses and
//             sub-bosses: it's an uppercut to them, the engine's and their fights' own, counted as the slide's piece:
//             tuning.ts meleeMoveOf, bossMelee's armored share); whatever it kills is sliced in half down the forehead
//             (weapons/dismember.ts sliceInHalf: the halves baked once, drawn turned).
//
// The follow-ups need that move's piece; on a grab-immune regular enemy, the hand armor too; never a critter (Y + B on
// one is still the critter grab), a boss or a sub-boss. Each heals like the other grabs (FOLLOW_HEAL). The window, the
// reach and the rest: upgrades/tune.ts.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import type { Enemy } from '../../m1/types';
import type { MeleeMove } from '../../m1/game/core/tuning';
import { kindHead } from '../../m1/game/render/enemies';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { interrupt } from '../../m1/game/enemies/enemies';
import { playSound } from '../../m1/game/platform/audio';
import { floorTopAt } from '../../m1/game/core/terrain';
import { notePowerShort } from '../../m1/game/player/powerShort';
import { UPPERCUT_SPEED, UPPERCUT_DURATION, PLAYER_GRAVITY, CANVAS_HEIGHT } from '../../m1/constants';
import { isMachineKind } from '../../m1/game/enemies/kinds';
import { markMachineGore } from '../../m1/game/enemies/machineGore';
import { markKindGore, kindGore } from '../../m1/game/enemies/kindBlood';
import { drawLeg, drawArmTo, drawTorsoFromHips, type Mood } from '../../m1/game/render/player/body';
import { viewRectOf, inView } from '../../m1/game/render/viewCull';
import { elbow, knee, reachTo, type P2 } from '../art/limb';
import { since } from '../frames';
import { has, type ArmorPiece } from '../upgrades/state';
import { raged } from '../upgrades/amulet';
import { lastMelee, stampMelee, clearMelee } from '../upgrades/lastHit';
import {
  FOLLOW_WINDOW, FOLLOW_REACH, FOLLOW_REACH_CHARGE, FOLLOW_REACH_UP, FOLLOW_HEAL, MISSILE_SPEED, MISSILE_HIT_K,
  HEAD_KICK_SPEED, HEAD_HIT, HEAD_KICK_REACH, BURIED_MAX, NINJA_FALL, NINJA_DAMAGE, NINJA_METEOR_R, NINJA_METEOR_DMG, NINJA_METEOR_STUN, FLASH_RISE, FLASH_RADIUS, FLASH_DAMAGE,
} from '../upgrades/tune';
import { grabKit as K, grabbable, isCritter, handsOnlyFoe, drawEnemyAt, drawPoseSprite as sprite, drawPoseHead as head, type Grab } from './grab';
import { grabCallout } from './callouts';
import { m2Kill } from './killLines';
import { sliceInHalf, bakeEnemyCut, type BakedCut, type Cut } from '../weapons/dismember';
import { meteorLooks } from '../weapons/spellbook';

type Ctx = CanvasRenderingContext2D;

export type FollowPhase = 'fmissile' | 'fspin' | 'fdrop' | 'fflash' | 'fkick';
export const FOLLOW_PHASES = new Set<string>(['fmissile', 'fspin', 'fdrop', 'fflash', 'fkick']);

/** What a follow-up keeps while it's on. */
export interface Follow {
  /** His middle as it started; the one he's got: where its feet were, and its shoulders. */
  c0: { x: number; y: number };
  ef: { x: number; y: number };
  sh: { x: number; y: number };
  /** The floor under them (the spin), how far they go into it. */
  ground: number;
  sink: number;
  /** His own up/down speed (the drop, the flash kick), and the spin (the spin, the drop). */
  vy: number;
  spin: number;
  /** The flash kick: who it's had; a line said yet. */
  hits: Set<Enemy>;
  said: boolean;
  /** The head kick: the head, the way it'll go, where he's walking to, round it or not, which part he's at, its frames. */
  bur: Buried | null;
  kdir: 1 | -1;
  walkTo: number;
  around: boolean;
  step: 'walk' | 'point' | 'kick';
  st: number;
}
const newFollow = (): Follow => ({
  c0: { x: 0, y: 0 }, ef: { x: 0, y: 0 }, sh: { x: 0, y: 0 }, ground: 0, sink: 0, vy: 0, spin: 0, hits: new Set(), said: false,
  bur: null, kdir: 1, walkTo: 0, around: false, step: 'walk', st: 0,
});

/** Each follow-up's move and the piece it takes. */
const PIECE: Partial<Record<MeleeMove, ArmorPiece>> = { divekick: 'sabatons', charge: 'pauldrons', uppercut: 'armguards' };
/** The middle of him at his feet's height less this (the poses turn about it, like the air grab's). */
const PIVOT = 34;

const pmid = (state: GameState) => ({ x: K.centerX(state), y: K.feetY(state) - PIVOT });
const emid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });
const ease = (k: number) => { const t = Math.max(0, Math.min(1, k)); return t * t * (3 - 2 * t); };
const rot = (x: number, y: number, a: number): P2 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
/** Where its head is from its feet, facing right (its own, or a fair guess). */
const headOf = (e: Enemy) => (e.kind && kindHead(e.kind, e.variant)) || { x: 0, y: -e.height * 0.85, r: Math.max(6, Math.min(12, e.width * 0.2)) };

/** One the follow-ups can be done to: not a critter, a boss, a sub-boss; one the grabs work on, or with the hand armor,
 *  one they don't. */
const followable = (e: Enemy) => !isCritter(e) && e.type !== 'boss' && !isMidBoss(e) && e.health > 0 && !e.isBlownAway && !e.innocent
  && (grabbable(e) || (has('hands') && handsOnlyFoe(e)));

/** Stood on the floor (a flyer never is): the floor's top, or null. */
const standing = (state: GameState, e: Enemy) => {
  if (K.flier(e)) return null;
  const feet = e.pos.y + e.height, top = floorTopAt(state.blocks, e.pos.x + e.width / 2, feet, 10);
  return top !== null && Math.abs(top - feet) <= 10 ? top : null;
};

/** Out of whatever move he was in: the follow-up's his now. */
const stopMoves = (state: GameState) => {
  const p = state.player;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.uppercutBoost = undefined;
  p.recoiling = false; p.lockTimer = 0; p.pushbackTimer = 0; p.isHarmlessPushback = false; p.slideRecoil = false; p.isDucking = false;
};

/** Health back, like the other grabs (by the one he's got, nothing off what gives nothing). */
const heal = (ctx: FrameContext, g: Grab, e: Enemy) => {
  if (e.noHeal) return;
  const p = ctx.state.player, n = K.healOf(e, FOLLOW_HEAL);
  p.health = Math.min(p.maxHealth, p.health + n); g.hp = p.health;
  ctx.fx.spawnDamageNumber({ x: K.centerX(ctx.state), y: p.pos.y - 20 }, `+${n} HP`, true, '#4ADE80');
};

/** A kill's callout where it is now (it's out of the enemy list by then). */
const calloutAt = (ctx: FrameContext, e: Enemy, x: number, y: number, how: Parameters<typeof grabCallout>[0]) =>
  ctx.fx.spawnKillCallout({ pos: { x: x - e.width / 2, y: y - e.height / 2 }, width: e.width, height: e.height, kind: e.kind, health: 0, isBlownAway: true }, grabCallout(how));

// ---------------------------------------------------------------------------------------------------------------------
// Heads in the ground (the spin's), and the bodies the head kick and the ninja drop leave in it
// ---------------------------------------------------------------------------------------------------------------------
interface Buried {
  e: Enemy; x: number; ground: number; sink: number; face: 1 | -1;
  /** 'head': in to the neck (alive, the spin's); 'legs': head first, legs up out of it (the ninja drop's, dead). */
  mode: 'head' | 'legs'; born: number; stage: string;
  /** The frame its head was kicked off (then it's a stump, and goes after a while). */
  gone: number | null;
  /** Legs up, dead: its picture painted the once (drawn turned: the stamp cache won't take a turn). */
  bake?: BakedCut;
}
let buried: Buried[] = [];
/** How long a stump, or a body legs up, stays (frames), and fades out over. */
const STUMP_LIFE = 360, LEGS_LIFE = 540, BURIED_FADE = 40;

interface Head { e: Enemy; x: number; y: number; vx: number; vy: number; rot: number; vr: number; r: number; face: 1 | -1; cut: Cut; cx: number; cy: number; bake: BakedCut | null; t: number; down: boolean; bounces: number; hit: Set<Enemy>; stage: string }
let heads: Head[] = [];
const HEAD_G = 0.45, HEAD_LIE = 420, HEAD_FADE = 40;

/** All of it gone (a new game, the stage's own reset). */
export const stopFollowUps = () => { buried = []; heads = []; clearMelee(); };

/** A head out of the ground he can kick from where he is (his feet on its floor, near enough). */
const headNear = (state: GameState) => {
  const p = state.player, cx = K.centerX(state), fy = K.feetY(state), stage = String(state.stageId);
  let best: Buried | null = null, bestD = Infinity;
  for (const b of buried) {
    if (b.mode !== 'head' || b.gone !== null || b.stage !== stage || Math.abs(b.ground - fy) > 30) continue;
    const d = Math.abs(b.x - cx);
    if (d < HEAD_KICK_REACH && d < bestD && p.isGrounded) { bestD = d; best = b; }
  }
  return best;
};

/** Enemies a kicked head can be sent at: in reach either side of it, alive, fair game. */
const foes = (state: GameState, x: number, y: number) => state.enemies.filter(o => o.health > 0 && !o.isBlownAway && !o.innocent && !o.harmless
  && o.type !== 'boss' && !isMidBoss(o) && Math.abs(o.pos.x + o.width / 2 - x) < 900 && Math.abs(o.pos.y + o.height / 2 - y) < 320);

// ---------------------------------------------------------------------------------------------------------------------
// Starting one
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Y + B with a hit just landed that didn't kill (the grab's idle, whatever he's in the middle of): that move's
 * follow-up, if he's its piece and it's one it works on, near enough. True: it's on.
 */
export const startFollowUp = (ctx: FrameContext, g: Grab) => {
  const { state } = ctx, p = state.player, h = lastMelee();
  if (!h || h.at === null || since(state.frame, h.at) > FOLLOW_WINDOW) return false;
  const piece = PIECE[h.move], e = h.e;
  if (!piece || !has(piece) || !followable(e) || !state.enemies.includes(e)) return false;
  const pm = pmid(state), em = emid(e);
  if (Math.abs(em.x - pm.x) > (h.move === 'charge' ? FOLLOW_REACH_CHARGE : FOLLOW_REACH) || Math.abs(em.y - pm.y) > FOLLOW_REACH_UP) return false;
  if (!K.clearTo(state, e)) return false;
  const ground = h.move === 'charge' ? standing(state, e) : 0;
  if (ground === null) return false;
  clearMelee();
  stopMoves(state);
  const d = (Math.sign(em.x - pm.x) || p.facing) as 1 | -1;
  g.dir = d; p.facing = d; g.t = 0;
  K.take(state, e); g.held = e; e.facing = (-d) as 1 | -1; e.vel = { x: 0, y: 0 }; e.melee = undefined; e.rotation = 0;
  const fu = newFollow();
  fu.c0 = pm; fu.ef = { x: em.x, y: e.pos.y + e.height }; fu.sh = { x: em.x, y: e.pos.y + e.height * 0.18 };
  g.fu = fu;
  if (h.move === 'divekick') { g.phase = 'fmissile'; playSound('whoosh', 1, -6); }
  else if (h.move === 'charge') {
    g.phase = 'fspin'; fu.ground = ground; fu.ef.y = ground;
    const hd = headOf(e); fu.sink = Math.max(0, -hd.y - hd.r);
    playSound('snort', 0.9, -4);
  } else {
    g.phase = 'fdrop'; fu.vy = -8;
    // (room under him for them, upside down, before the floor)
    const fy = K.feetY(state), floor = floorTopAt(state.blocks, pm.x, fy, 2);
    if (floor !== null && fy + e.height + 6 > floor) p.pos.y -= fy + e.height + 6 - floor;
    playSound('whoosh', 1.1, -2); playSound('jump', 0.8, -4);
  }
  p.vel = { x: 0, y: 0 };
  return true;
};

/** Rise of the flash kick's own speed off the floor: a share of the uppercut's (its speed less gravity, its frames). */
const flashLaunch = () => Math.sqrt(2 * PLAYER_GRAVITY * (UPPERCUT_SPEED - PLAYER_GRAVITY) * UPPERCUT_DURATION * FLASH_RISE);

/**
 * The grab's idle, before anything else of it: up + B in a slide with the leg armor (the flash kick), or B on its own by
 * a head in the ground (the head kick). The controls the rest of him gets if one's started (null: nothing doing).
 */
export const followIdle = (ctx: FrameContext, g: Grab, controls: Controls, press: (k: keyof Controls) => boolean): Controls | null => {
  const { state } = ctx, p = state.player;
  if (p.inCutscene || p.noSpecials || K.handsOnly(state)) return null;
  // The flash kick: B's held through a slide, so up pressed with it does it, or B pressed with up held
  if (p.isSliding && has('legs') && controls.up && controls.special && (press('up') || press('special'))) {
    if (!ctx.cheats.infinitePower) {
      if (p.power < 1) { notePowerShort(); return null; }
      p.power -= 1;
    }
    stopMoves(state);
    const fu = newFollow();
    fu.vy = -flashLaunch(); fu.c0 = pmid(state);
    g.fu = fu; g.phase = 'fflash'; g.t = 0; g.dir = p.facing; g.held = null;
    p.moveId = (p.moveId || 0) + 1; p.uppercutHitIds = []; p.chargeFace = p.facing;
    p.isGrounded = false;
    flashHold(state, g);
    playSound('whoosh', 1.2, 4); playSound('jump', 1, -2);
    return { ...NO_CONTROLS };
  }
  // The head kick: B on its own, stood by one
  if (press('special') && !controls.up && !controls.down && p.isGrounded && !p.isCharging && !p.isUppercutting && !p.isDivekicking
    && p.lockTimer <= 0 && !(p.pushbackTimer > 0)) {
    const b = headNear(state);
    if (b) { startKick(ctx, g, b); return { ...NO_CONTROLS }; }
  }
  return null;
};

const KICK_STAND = 30;
const startKick = (ctx: FrameContext, g: Grab, b: Buried) => {
  const { state } = ctx, p = state.player, cx = K.centerX(state);
  const fu = newFollow();
  const hd = headOf(b.e), hy = b.ground - hd.r;
  const all = foes(state, b.x, hy), side = (s: number) => all.filter(o => (o.pos.x + o.width / 2 - b.x) * s > 0);
  const away = (Math.sign(b.x - cx) || p.facing) as 1 | -1;
  fu.around = !side(away).length && side(-away).length > 0;
  fu.kdir = fu.around ? (-away as 1 | -1) : away;
  fu.walkTo = b.x - fu.kdir * KICK_STAND;
  fu.bur = b; fu.step = 'walk'; fu.st = 0;
  g.fu = fu; g.phase = 'fkick'; g.t = 0; g.held = null; g.dir = p.facing;
};

// ---------------------------------------------------------------------------------------------------------------------
// Running them
// ---------------------------------------------------------------------------------------------------------------------

/** The missile's frames: flipped over onto them, swung up and over (let go at the end), then righting himself. */
const M = { GRIP: 8, SWING: 12, RECOVER: 10 };
/** His hands over his head, from his middle (facing right, unturned). */
const HAND: P2 = [8, -42];
/** Where everything is in the missile at frame t: his middle, how far he's turned, his hands, and (held) its feet and turn. */
const missileGeo = (g: Grab) => {
  const fu = g.fu!, d = g.dir, t = g.t, e = g.held;
  const target = { x: fu.sh.x + d * 8, y: fu.sh.y - 42 };
  let r: number, C: { x: number; y: number };
  if (t <= M.GRIP) { const k = ease(t / M.GRIP); r = Math.PI * k; C = { x: fu.c0.x + (target.x - fu.c0.x) * k, y: fu.c0.y + (target.y - fu.c0.y) * k }; }
  else { C = target; r = Math.PI + 1.5 * Math.PI * ease((t - M.GRIP) / M.SWING); }
  const [hx, hy] = rot(HAND[0], HAND[1], r), hand = { x: C.x + d * hx, y: C.y + hy };
  const a = r - Math.PI, sh = (e?.height ?? 60) * 0.82;
  const feet = { x: hand.x - d * sh * Math.sin(a), y: hand.y + sh * Math.cos(a) };
  return { C, r, hand, feet, a };
};

/** The spin's frames: in to them, up off the floor, spun down into it, then a moment dusting off. */
const S = { CLOSE: 6, LIFT: 8, DRILL: 30, HOLD: 14 };
const spinGeo = (g: Grab) => {
  const fu = g.fu!, t = g.t, a = S.CLOSE + S.LIFT, b = a + S.DRILL;
  const yOff = t < S.CLOSE ? 0 : t < a ? -14 * ease((t - S.CLOSE) / S.LIFT) : t < b ? -14 + (fu.sink + 14) * Math.pow((t - a) / S.DRILL, 1.4) : fu.sink;
  return { yOff, buriedAt: b };
};

/** The ninja drop's rise (frames), before it comes down. */
const N_RISE = 12;
/** The flash kick's frames the circle's out, and the longest it can go before it's called off (he's not down). */
const F_ACTIVE: [number, number] = [2, 16], F_MAX = 80, F_FLIP = 22;
/** The head kick's frames: walking (the most), pointing, the kick landing, done. */
const KK = { WALK_MAX: 120, POINT: 34, HIT: 9, LEN: 22, SPEED: 3.2 };

/** The flash kick, kept going: to the engine (and the bosses' fights) it's an uppercut, rising and falling at its own
 *  pace (uppercutBoost: the engine sets his speed off it); the regular enemies are the circle's, not the engine's. */
const flashHold = (state: GameState, g: Grab) => {
  const p = state.player, fu = g.fu!;
  p.isUppercutting = true; p.flashKick = true; p.uppercutTimer = 99; p.uppercutBoost = -fu.vy / UPPERCUT_SPEED;
  p.isCharging = false; p.isSliding = false; p.isDivekicking = false; p.lockTimer = 0; p.recoiling = false;
  p.facing = g.dir; p.chargeFace = g.dir; p.vel.x = -g.dir * 1.3;
  for (const e of state.enemies) if (e.type !== 'boss' && !isMidBoss(e) && !p.uppercutHitIds.includes(e.id)) p.uppercutHitIds.push(e.id);
};
const clearFlash = (state: GameState) => {
  const p = state.player;
  if (!p.flashKick) return;
  p.flashKick = false; p.isUppercutting = false; p.uppercutBoost = undefined;
  if (!p.isGrounded) p.powerLocked = true;
};

export const stepFollow = (ctx: FrameContext, g: Grab, controls: Controls): Controls => {
  void controls;
  const { state } = ctx, p = state.player, fu = g.fu;
  if (!fu) { K.end(state, g); return { ...NO_CONTROLS }; }
  const d = g.dir;
  switch (g.phase as FollowPhase) {
    case 'fmissile': {
      const e = g.held, rel = M.GRIP + M.SWING;
      if (g.t <= rel) {
        const geo = missileGeo(g);
        K.placeAt(state, geo.C.x - p.width / 2, p.pos.x);
        p.pos.y = geo.C.y + PIVOT - p.height; p.vel = { x: 0, y: 0 }; p.isGrounded = false;
        if (g.t === M.GRIP) { playSound('punch', 0.9, -4); shakeScreen(state, 4, 3); }
        if (g.t === M.GRIP + 4) playSound('whoosh', 1.1, -6);
        if (e && g.t === rel) {
          // Let go: straight ahead, fast; whoever's in the way takes it (mass × speed, more than a throw)
          e.rotation = 0;
          e.pos = { x: geo.hand.x + d * e.width * 0.3 - e.width / 2, y: geo.hand.y - e.height / 2 };
          e.vel = { x: d * MISSILE_SPEED, y: -2 };
          e.dropping = true; e.pauseTimer = Math.max(e.pauseTimer || 0, 600); e.chargedAt = state.frame;
          g.held = null;
          K.release(state, e);
          K.fly(g, e, 'missile', false, 1, MISSILE_HIT_K);
          heal(ctx, g, e);
          playSound('whoosh', 1.4, -8); playSound('slam', 0.6, 4); shakeScreen(state, 8, 5);
          for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: geo.hand.x, y: geo.hand.y }, vel: { x: -d * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 3 }, life: 16, color: 'rgba(255, 255, 255, 0.6)', size: 3 + Math.random() * 3 });
        }
      } else p.vel.x = 0;
      if (g.t >= rel + M.RECOVER) { K.end(state, g); g.airSpent = !p.isGrounded; p.vel = { x: -d * 1.5, y: Math.min(p.vel.y, -2) }; }
      return { ...NO_CONTROLS };
    }

    case 'fspin': {
      const e = g.held, geo = spinGeo(g);
      p.vel.x = 0;
      if (g.t <= S.CLOSE) {
        // In to them (the charge pushed them off): stood right up against them
        const to = fu.ef.x - d * (p.width / 2 + (e?.width ?? 30) / 2 - 4);
        K.placeAt(state, fu.c0.x + (to - fu.c0.x) * ease(g.t / S.CLOSE) - p.width / 2, p.pos.x);
        // (on their floor: a charge in the air comes down to it)
        p.pos.y = fu.ground - p.height; p.vel.y = 0; p.isGrounded = true;
      }
      if (g.t === S.CLOSE) { playSound('punch', 0.8, -2); playSound('whoosh', 0.8, -8); }
      if (e && g.t > S.CLOSE + S.LIFT && g.t < geo.buriedAt) {
        // Spun down into it: the floor churned up either side, a grinding as he goes
        fu.spin += 0.55;
        if (g.t % 5 === 0) playSound('crunch', 0.5, -6 - (g.t % 3));
        for (let i = 0; i < 2; i++) {
          const side = Math.random() < 0.5 ? -1 : 1;
          state.particles.push({ pos: { x: fu.ef.x + side * e.width * 0.4, y: fu.ground - 2 }, vel: { x: side * (1 + Math.random() * 3), y: -2 - Math.random() * 4 }, life: 22, color: Math.random() < 0.5 ? '#6B4423' : '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 });
        }
      } else if (e && g.t > S.CLOSE) fu.spin += 0.3;
      if (e && g.t >= geo.buriedAt) {
        // In to the neck: stuck there for good, harmless (it's out of the world's list: a head now)
        g.held = null;
        e.vel = { x: 0, y: 0 }; e.melee = undefined; e.pauseTimer = 0; e.rotation = 0;
        buried.push({ e, x: fu.ef.x, ground: fu.ground, sink: fu.sink, face: (-d) as 1 | -1, mode: 'head', born: state.frame, stage: String(state.stageId), gone: null });
        trimBuried();
        heal(ctx, g, e);
        calloutAt(ctx, e, fu.ef.x, fu.ground - 30, 'planted');
        playSound('thud', 1, -6); playSound('slam', 0.7, -2); shakeScreen(state, 8, 5);
        for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: fu.ef.x + (Math.random() - 0.5) * 30, y: fu.ground - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: i % 2 ? '#6B4423' : '#78716C', size: 2 + Math.random() * 3, grav: 0.25 });
      }
      if (g.t >= geo.buriedAt + S.HOLD) K.end(state, g);
      return { ...NO_CONTROLS };
    }

    case 'fdrop': {
      const e = g.held;
      if (!e) { K.end(state, g); return { ...NO_CONTROLS }; }
      p.vel.x = 0;
      fu.vy = g.t <= N_RISE ? -8 * (1 - g.t / N_RISE) : Math.min(NINJA_FALL, fu.vy + 1.3);
      if (fu.vy < 0 && K.ceilingOver(state, fu.vy - 2)) fu.vy = 0;
      fu.spin += 0.25 + Math.min(0.5, g.t * 0.012);
      if (g.t % 6 === 0 && g.t > N_RISE) playSound('whoosh', 0.6, 4 + Math.min(8, g.t / 8));
      const fy = K.feetY(state), headY = fy + e.height, cx = K.centerX(state);
      if (g.t > N_RISE) {
        const floor = floorTopAt(state.blocks, cx, headY - 2, 4);
        if (floor !== null && headY + fu.vy >= floor) return ninjaImpact(ctx, g, e, floor);
        if (p.isGrounded) return ninjaImpact(ctx, g, e, fy);
        // (nothing under them at all, a long way: let go, him dead, falling on down)
        if (floor === null && g.t > N_RISE + 60) {
          g.held = null; e.health = 0;
          e.pos = { x: cx - e.width / 2, y: fy };
          K.release(state, e);
          ctx.fx.blowAwayEnemy(e, { x: 0, y: 10 }, m2Kill('airgrab_kill'), d);
          K.end(state, g);
          return { ...NO_CONTROLS };
        }
      }
      p.vel.y = fu.vy; p.isGrounded = false;
      return { ...NO_CONTROLS };
    }

    case 'fflash': {
      fu.vy += PLAYER_GRAVITY;
      flashHold(state, g);
      if (g.t >= F_ACTIVE[0] && g.t <= F_ACTIVE[1]) flashCircle(ctx, g);
      if (g.t === F_ACTIVE[0]) { playSound('whoosh', 1.3, 8); shakeScreen(state, 5, 3); }
      if ((g.t > 6 && fu.vy > 0 && p.isGrounded) || g.t > F_MAX) { clearFlash(state); K.end(state, g); }
      return { ...NO_CONTROLS };
    }

    case 'fkick': {
      const b = fu.bur;
      p.vel.x = 0;
      if (!b || b.gone !== null || !buried.includes(b)) { K.end(state, g); return { ...NO_CONTROLS }; }
      fu.st++;
      const cx = K.centerX(state);
      if (fu.step === 'walk') {
        const dx = fu.walkTo - cx;
        if (Math.abs(dx) <= KK.SPEED || fu.st > KK.WALK_MAX) {
          fu.step = fu.around && Math.abs(dx) <= KK.SPEED ? 'point' : 'kick'; fu.st = 0;
          // (didn't get round it: it goes the way he's facing it from)
          if (Math.abs(dx) > KK.SPEED) fu.kdir = (Math.sign(b.x - cx) || p.facing) as 1 | -1;
          g.dir = fu.kdir; p.facing = fu.kdir;
        } else {
          const was = p.pos.x;
          K.placeAt(state, p.pos.x + Math.sign(dx) * Math.min(KK.SPEED, Math.abs(dx)), p.pos.x);
          p.facing = (Math.sign(dx) || 1) as 1 | -1; g.dir = p.facing;
          if (Math.abs(p.pos.x - was) < 0.5) fu.st = KK.WALK_MAX + 1;
        }
      } else if (fu.step === 'point') {
        if (fu.st === 1) playSound('snort', 0.7, 2);
        if (fu.st >= KK.POINT) { fu.step = 'kick'; fu.st = 0; }
      } else {
        if (fu.st === 3) playSound('whoosh', 1, -4);
        if (fu.st === KK.HIT) kickHead(ctx, g, b);
        if (fu.st >= KK.LEN) K.end(state, g);
      }
      return { ...NO_CONTROLS };
    }
  }
  return { ...NO_CONTROLS };
};

/** Driven in head first: dead (a regular enemy: NINJA_DAMAGE), legs up out of the floor, the shock through it. */
const ninjaImpact = (ctx: FrameContext, g: Grab, e: Enemy, floor: number): Controls => {
  const { state, fx } = ctx, p = state.player, x = K.centerX(state);
  e.health -= Math.max(NINJA_DAMAGE, e.health);
  e.health = Math.min(0, e.health); e.isBlownAway = true; e.vel = { x: 0, y: 0 };
  const sink = Math.round(e.height * 0.3);
  g.held = null;
  buried.push({ e, x, ground: floor, sink, face: (-g.dir) as 1 | -1, mode: 'legs', born: state.frame, stage: String(state.stageId), gone: null });
  trimBuried();
  heal(ctx, g, e);
  const scrap = isMachineKind(e.kind);
  if (scrap) markMachineGore(state, x - 80, floor - 80, 160, 120, 30);
  markKindGore(state, e.kind, x - 80, floor - 80, 160, 120, 30);
  fx.spawnExplosion({ x, y: floor - 4 }, scrap ? '#57534E' : '#8B0000', 18, 0, 12);
  fx.spawnDeathShower({ x, y: floor - 6 }, 0, 1.4);
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: floor - 2 }, vel: { x: (Math.random() - 0.5) * 9, y: -1 - Math.random() * 5 }, life: 28, color: i % 3 ? '#6B4423' : '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 });
  K.slamShock(ctx, e, x, floor);
  // (and a meteor going off where they went in: its look, and a blast of its own round it)
  meteorLooks(ctx, { x, y: floor - 6 });
  ninjaMeteor(ctx, e, x, floor - 6);
  calloutAt(ctx, e, x, floor - e.height, 'ninja');
  fx.speakVulgarity(m2Kill('airgrab_kill'));
  fx.spawnPickup({ x: x - 10, y: floor - 30 });
  p.killSatisfactionTimer = 60;
  playSound('slam', 1.1, -4); playSound('crunch', 1.2, -6); playSound('splat', 1, -3);
  shakeScreen(state, 18, 10);
  // Him: up on its soles, then a hop off them
  p.pos.y = floor - (e.height - sink) - p.height; p.vel = { x: 0, y: -8 }; p.isGrounded = false;
  g.hitAt = { x, y: floor }; g.phase = 'aland'; g.t = 0; g.fu = null;
  return { ...NO_CONTROLS };
};

/** The ninja drop's meteor (the owner's "a localized 'meteor' impact too"): everybody else close round where they went
 *  in (regular enemies: not a boss, a sub-boss, an innocent) takes up to NINJA_METEOR_DMG by how near; killed, blown
 *  away with a callout; living, knocked away and stunned. On top of the slam's own shock. */
const ninjaMeteor = (ctx: FrameContext, buriedOne: Enemy, x: number, y: number) => {
  const { state, fx } = ctx;
  for (const e of [...state.enemies]) {
    if (e === buriedOne || e.type === 'boss' || isMidBoss(e) || e.health <= 0 || e.isBlownAway || e.innocent) continue;
    const m = emid(e), d = Math.hypot(m.x - x, m.y - y) - Math.min(e.width, e.height) / 2;
    if (d > NINJA_METEOR_R) continue;
    const k = Math.max(0.25, 1 - Math.max(0, d) / NINJA_METEOR_R), dmg = raged(Math.round(NINJA_METEOR_DMG * k));
    const away = Math.sign(m.x - x) || 1;
    e.health -= dmg;
    fx.spawnDamageNumber(e.pos, dmg, true);
    if (e.health <= 0) {
      e.health = 0; e.isBlownAway = true;
      e.vel = { x: away * (6 + 6 * k), y: -6 - 5 * k };
      fx.spawnKillCallout(e, grabCallout('ninja'));
      fx.spawnPickup(e.pos);
      continue;
    }
    if (!e.unshakeable) e.vel = { x: away * (3 + 5 * k), y: -3 - 4 * k };
    e.pauseTimer = Math.max(e.pauseTimer || 0, NINJA_METEOR_STUN);
    interrupt(e);
  }
};

/** The flash kick's circle: everyone in it (not a boss or a sub-boss: they're the uppercut's) takes it once. */
const flashCircle = (ctx: FrameContext, g: Grab) => {
  const { state, fx } = ctx, p = state.player, fu = g.fu!;
  const cx = K.centerX(state), cy = p.pos.y + p.height / 2 - 6, R2 = FLASH_RADIUS * FLASH_RADIUS;
  for (const e of [...state.enemies]) {
    if (e.type === 'boss' || isMidBoss(e) || e.health <= 0 || e.isBlownAway || e.innocent || fu.hits.has(e)) continue;
    const nx = Math.max(e.pos.x, Math.min(cx, e.pos.x + e.width)), ny = Math.max(e.pos.y, Math.min(cy, e.pos.y + e.height));
    if ((nx - cx) ** 2 + (ny - cy) ** 2 > R2) continue;
    fu.hits.add(e);
    const dmg = raged(FLASH_DAMAGE);
    e.health -= dmg;
    e.hitByMove = p.moveId;
    fx.spawnDamageNumber(e.pos, dmg, true);
    playSound('punch', 1.1, -2);
    if (e.health <= 0) { sliced(ctx, g, e); continue; }
    const away = Math.sign(e.pos.x + e.width / 2 - cx) || g.dir;
    if (!e.unshakeable) e.vel = { x: away * 6, y: -5 };
    e.pauseTimer = Math.max(e.pauseTimer || 0, 40);
    interrupt(e);
    for (let i = 0; i < 6; i++) state.particles.push(kindGore({ pos: { x: nx, y: ny }, vel: { x: away * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 20, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 }, e.kind));
  }
};

/** Split down the forehead: the halves fall apart (dismember.ts), blood up out of the cut. */
const sliced = (ctx: FrameContext, g: Grab, e: Enemy) => {
  const { state, fx } = ctx, p = state.player, fu = g.fu!;
  const at = emid(e), top = e.pos.y, h = e.height;
  e.health = 0; e.isBlownAway = true;
  sliceInHalf(state, e);
  state.enemies = state.enemies.filter(o => o !== e);
  const scrap = isMachineKind(e.kind);
  if (scrap) markMachineGore(state, at.x - 60, at.y - 60, 120, 120, 20);
  markKindGore(state, e.kind, at.x - 60, at.y - 60, 120, 120, 20);
  for (let i = 0; i < 18; i++) state.particles.push(kindGore({ pos: { x: at.x + (Math.random() - 0.5) * 3, y: top + (i / 18) * h }, vel: { x: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 2.5), y: -1.5 - Math.random() * 3 }, life: 30 + Math.random() * 16, color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 }, e.kind));
  fx.spawnDeathShower({ x: at.x, y: top + 8 }, 0, 1.2);
  ctx.fx.spawnKillCallout(e, grabCallout('sliced'));
  if (!fu.said) { fx.speakVulgarity('uppercut_kill'); fu.said = true; }
  fx.spawnPickup(e.pos);
  p.killSatisfactionTimer = 60;
  playSound('splat', 1.2, 2); playSound('crack', 0.6, 6);
  shakeScreen(state, 7, 4);
};

/** The kick lands: the head's off, sailing at whoever's that way; what's left a stump in the floor, spurting. */
const kickHead = (ctx: FrameContext, g: Grab, b: Buried) => {
  const { state, fx } = ctx, p = state.player, fu = g.fu!, e = b.e;
  const hd = headOf(e), face = faceOf(state, b), hx = b.x + face * hd.x, hy = b.ground - hd.r;
  const dir = fu.kdir;
  const tgt = foes(state, hx, hy).filter(o => (o.pos.x + o.width / 2 - hx) * dir > 0)
    .sort((a, c) => Math.abs(a.pos.x - hx) - Math.abs(c.pos.x - hx))[0];
  const vx = dir * HEAD_KICK_SPEED;
  let vy = -9;
  if (tgt) {
    const dx = Math.abs(tgt.pos.x + tgt.width / 2 - hx), dy = tgt.pos.y + tgt.height * 0.4 - hy, T = Math.max(8, dx / HEAD_KICK_SPEED);
    vy = Math.max(-15, Math.min(-2, (dy - 0.5 * HEAD_G * T * T) / T));
  }
  heads.push({ e, x: hx, y: hy, vx, vy, rot: 0, vr: dir * 0.35, r: hd.r, face, cut: { circle: true, x: hd.x, y: hd.y, r: hd.r * 1.35 }, cx: hd.x, cy: hd.y, bake: null, t: 0, down: false, bounces: 0, hit: new Set(), stage: b.stage });
  if (heads.length > 8) heads.splice(0, heads.length - 8);
  b.gone = state.frame;
  e.health = 0; e.isBlownAway = true;
  calloutAt(ctx, e, hx, hy - 20, 'punted');
  fx.speakVulgarity(m2Kill('throw_kill'));
  fx.spawnPickup({ x: hx - 10, y: hy - 20 });
  p.killSatisfactionTimer = 60;
  markKindGore(state, e.kind, hx - 40, hy - 60, 80, 80, 20);
  for (let i = 0; i < 14; i++) state.particles.push(kindGore({ pos: { x: hx, y: b.ground - 2 }, vel: { x: (Math.random() - 0.5) * 3 + dir, y: -3 - Math.random() * 5 }, life: 30, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 }, e.kind));
  playSound('punch', 1.3, -6); playSound('splat', 1, 2); playSound('crunch', 0.8, -2);
  shakeScreen(state, 9, 5);
};

/** Which way a buried one's drawn facing: a live head looks at him. */
const faceOf = (state: GameState, b: Buried) => (b.mode === 'head' && b.gone === null ? ((Math.sign(K.centerX(state) - b.x) || b.face) as 1 | -1) : b.face);

const trimBuried = () => {
  // (too many: the oldest stumps and bodies go first, then the oldest heads)
  while (buried.length > BURIED_MAX) {
    const i = buried.findIndex(b => b.mode === 'legs' || b.gone !== null);
    buried.splice(i >= 0 ? i : 0, 1);
  }
};

// ---------------------------------------------------------------------------------------------------------------------
// Every frame (from the grab's update)
// ---------------------------------------------------------------------------------------------------------------------

/** Before the grab's step: the last hit stamped, the heads in the ground and the flying ones kept up. */
export const followTick = (ctx: FrameContext, g: Grab) => {
  void g;
  const { state } = ctx;
  stampMelee(state.frame);
  const stage = String(state.stageId);
  if (buried.length) buried = buried.filter(b => {
    if (b.stage !== stage) return false;
    const age = b.gone !== null ? state.frame - b.gone : state.frame - b.born;
    if (age < 0) return false;
    // (the stump: spurting a while)
    if (b.gone !== null && age < 120 && age % 3 === 0) {
      const hd = headOf(b.e);
      state.particles.push(kindGore({ pos: { x: b.x + b.face * hd.x, y: b.ground - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -3 - Math.random() * 3 * (1 - age / 120) }, life: 26, color: age % 2 ? '#B91C1C' : '#991B1B', size: 2 + Math.random() * 2, grav: 0.3 }, b.e.kind));
    }
    if (b.gone !== null) return age < STUMP_LIFE;
    if (b.mode === 'legs') return age < LEGS_LIFE;
    return true;
  });
  if (heads.length) tickHeads(ctx, stage);
};

const solidAt = (state: GameState, x: number, y: number) => state.blocks.some(b => !b.oneWay && b.type !== 'pit' && b.type !== 'door' && x > b.x && x < b.x + b.w && y > b.y + 2 && y < b.y + b.h);

const tickHeads = (ctx: FrameContext, stage: string) => {
  const { state, fx } = ctx;
  const bottom = state.camera.y + CANVAS_HEIGHT + 400;
  heads = heads.filter(h => {
    if (h.stage !== stage) return false;
    h.t++;
    if (h.down) return h.t < HEAD_LIE;
    h.vy = Math.min(16, h.vy + HEAD_G); h.x += h.vx; h.y += h.vy; h.rot += h.vr;
    if (h.t % 2 === 0) state.particles.push(kindGore({ pos: { x: h.x, y: h.y }, vel: { x: -h.vx * 0.1, y: 0 }, life: 18, color: '#991B1B', size: 2, grav: 0.2 }, h.e.kind));
    // Into somebody: it takes the hit, the head bounces off it
    for (const o of state.enemies) {
      if (h.hit.has(o) || o.health <= 0 || o.isBlownAway || o.innocent || o.type === 'boss' || isMidBoss(o)) continue;
      const nx = Math.max(o.pos.x, Math.min(h.x, o.pos.x + o.width)), ny = Math.max(o.pos.y, Math.min(h.y, o.pos.y + o.height));
      if ((nx - h.x) ** 2 + (ny - h.y) ** 2 > h.r * h.r) continue;
      h.hit.add(o);
      const dir = Math.sign(h.vx) || 1, dmg = raged(Math.round(HEAD_HIT * (o.throwVuln ?? 1)));
      o.health -= dmg;
      fx.spawnDamageNumber(o.pos, dmg, true);
      fx.spawnExplosion({ x: nx, y: ny }, '#8B0000', 8, dir * 2, 8);
      playSound('thud', 1.1, -2); playSound('crunch', 0.6, 2); shakeScreen(state, 6, 4);
      if (o.health <= 0) { fx.blowAwayEnemy(o, { x: dir * 8, y: -6 }, m2Kill('throw_kill'), dir); o.meleeFlung = true; fx.spawnKillCallout(o, 'crush'); }
      else { if (!o.unshakeable) o.vel = { x: dir * 5, y: -4 }; o.pauseTimer = Math.max(o.pauseTimer || 0, 45); interrupt(o); }
      h.vx *= -0.35; h.vy = -5;
      break;
    }
    // A wall: back off it; the floor: a bounce or two, then it lies there
    if (solidAt(state, h.x, h.y)) { h.x -= h.vx; h.vx *= -0.35; }
    if (h.vy > 0) {
      const floor = floorTopAt(state.blocks, h.x, h.y - h.vy + h.r, 2);
      if (floor !== null && h.y + h.r >= floor) {
        h.y = floor - h.r;
        if (h.vy > 3 && h.bounces < 2) { h.bounces++; h.vy = -h.vy * 0.4; h.vx *= 0.6; h.vr *= 0.6; playSound('thud', 0.6, 6); }
        else { h.down = true; h.t = 0; h.vx = 0; h.vy = 0; state.particles.push(kindGore({ pos: { x: h.x, y: floor - 0.5 }, vel: { x: 0, y: 0 }, life: HEAD_LIE, color: '#7F1D1D', size: 5, isSplat: true }, h.e.kind)); }
      }
    }
    return h.y < bottom;
  });
};

/** After the grab's step: a flash kick that's over (however: hurt out of it, he died) is the engine's again. */
export const followAfter = (ctx: FrameContext, g: Grab) => {
  if (g.phase !== 'fflash') clearFlash(ctx.state);
  if (!FOLLOW_PHASES.has(g.phase)) g.fu = null;
};

/** Up in the air with one (the missile, the ninja drop): nothing hurts him, like the air grab. */
export const followUntouchable = (g: Grab) => g.phase === 'fmissile' || g.phase === 'fdrop';

// ---------------------------------------------------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------------------------------------------------

/** Bones (his, drawn this way: grab.ts's poses run about these). */
const THIGH = 14, SHIN = 14, UPPER = 16, FORE = 16;
interface Pose { hipY?: number; lean?: number; feet: [P2, P2]; hands: [P2, P2]; mood: Mood; look?: number; toe?: [number, number] }
/** Him in a pose: feet from his feet (facing right), hands in his torso's frame (from the hips, leaning `lean`); the
 *  knees and elbows from limb.ts, so they bend the right way whatever. */
const figure = (c: Ctx, f: number, o: Pose) => {
  const hy = o.hipY ?? -24;
  const leg = (hx: number, foot: P2, back: boolean, toe: number) => {
    const end = reachTo(hx, hy, foot[0], foot[1], THIGH, SHIN);
    drawLeg(c, [hx, hy], knee(hx, hy, end[0], end[1], THIGH, SHIN, 1), end, toe, back);
  };
  leg(-5, o.feet[0], true, o.toe?.[0] ?? 0);
  leg(5, o.feet[1], false, o.toe?.[1] ?? 0);
  c.save(); c.translate(0, hy); c.rotate(o.lean ?? 0);
  const arm = (sx: number, hand: P2, back: boolean, r: number) => {
    const end = reachTo(sx, -22, hand[0], hand[1], UPPER, FORE);
    drawArmTo(c, [sx, -22], elbow(sx, -22, end[0], end[1], UPPER, FORE, 1), end, back, r);
  };
  arm(-8, o.hands[0], true, 5);
  drawTorsoFromHips(c);
  head(c, 3, -37, o.look ?? 0, o.mood, f);
  arm(11, o.hands[1], false, 6);
  c.restore();
};
/** A point from his feet (facing right) in the torso's frame (hips at hipY, leaning `lean`). */
const toTorso = (lean: number, hipY: number, x: number, y: number): P2 => rot(x, y - hipY, -lean);

/** Drawn about his middle, turned `r` (facing right; mirrored with him). */
const turned = (r: number, paint: (c: Ctx) => void) => (c: Ctx) => { c.translate(0, -PIVOT); c.rotate(r); c.translate(0, PIVOT); paint(c); };

const TUCK: Pose = { feet: [[-10, -10], [3, -8]], hands: [[2, -50], [12, -48]], mood: 'roar', toe: [0.8, 0.8] };
const HURL: Pose = { feet: [[-12, 0], [10, -4]], hands: [[22, -34], [30, -30]], mood: 'roar', lean: 0.2 };

/** Whatever follow-up's on, drawn in place of him (grab.ts drawGrab: world space, over everything). */
export const drawFollow = (ctx: Ctx, state: GameState, g: Grab) => {
  const fu = g.fu, p = state.player, f = state.frame, d = g.dir;
  const x = K.centerX(state), y = K.feetY(state);
  if (!fu) { K.asPose(ctx, state, { facing: d }); return; }
  switch (g.phase as FollowPhase) {
    case 'fmissile': {
      const e = g.held, rel = M.GRIP + M.SWING;
      if (g.t <= rel) {
        const geo = missileGeo(g);
        if (e) {
          if (g.t < M.GRIP) drawEnemyAt(ctx, e, state, fu.ef.x, fu.ef.y, 0, (-d) as 1 | -1);
          else drawEnemyAt(ctx, e, state, geo.feet.x, geo.feet.y, d * geo.a, (-d) as 1 | -1, 'neck');
        }
        // (swung round: streaks along where it's going)
        if (g.t > M.GRIP) { ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(geo.C.x, geo.C.y, 46, -Math.PI / 2 + d * (geo.r - 0.9), -Math.PI / 2 + d * geo.r, d < 0); ctx.stroke(); }
        sprite(ctx, x, y, d, turned(geo.r, c => figure(c, f, TUCK)));
      } else {
        const k = ease((g.t - rel) / M.RECOVER);
        sprite(ctx, x, y, d, turned(2.5 * Math.PI - 0.5 * Math.PI * k, c => figure(c, f, HURL)));
      }
      return;
    }
    case 'fspin': {
      const e = g.held, geo = spinGeo(g);
      let handAt: P2 = [24, -50];
      if (e) {
        const hd = headOf(e), sx = Math.cos(fu.spin), face = ((sx >= 0 ? -d : d)) as 1 | -1;
        const feetY = fu.ground + geo.yOff;
        ctx.save();
        ctx.beginPath(); ctx.rect(fu.ef.x - 300, fu.ground - 600, 600, 600); ctx.clip();
        ctx.translate(fu.ef.x, 0); ctx.scale(Math.max(0.15, Math.abs(sx)), 1); ctx.translate(-fu.ef.x, 0);
        drawEnemyAt(ctx, e, state, fu.ef.x, feetY, 0, face);
        ctx.restore();
        // (the hole he's going into)
        ctx.fillStyle = '#3B2614'; ctx.beginPath(); ctx.ellipse(fu.ef.x, fu.ground, e.width * 0.45 + 4, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        handAt = [d * (fu.ef.x - x), feetY + hd.y - hd.r * 0.5 - y];
      }
      const press = g.t > S.CLOSE, lean = press ? Math.max(0.15, Math.min(0.95, 0.25 + (handAt[1] + 46) / 50)) : 0.1, hipY = press ? -21 : -24;
      const h0 = toTorso(lean, hipY, handAt[0] - 4, handAt[1]), h1 = toTorso(lean, hipY, handAt[0] + 4, handAt[1] + 1);
      const jig = press && e ? (f % 2 ? 1 : -1) : 0;
      sprite(ctx, x + jig, y, d, c => figure(c, f, { hipY, lean, feet: [[-15, 0], [14, 0]], hands: [h0, h1], mood: press && e ? 'roar' : 'grit', look: 0.2 }));
      return;
    }
    case 'fdrop': {
      const e = g.held;
      // (coming down: air streaming up past them)
      if (g.t > N_RISE) for (let i = 0; i < 5; i++) { const sx = x - 30 + i * 15, sy = y - 60 - ((f * 11 + i * 23) % 70); ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.fillRect(sx, sy, 2, 20); }
      const s = Math.cos(fu.spin), dd = (s >= 0 ? d : -d) as 1 | -1;
      ctx.save();
      ctx.translate(x, 0); ctx.scale(Math.max(0.2, Math.abs(s)), 1); ctx.translate(-x, 0);
      if (e) drawEnemyAt(ctx, e, state, x + dd * 3, y + 2, Math.PI, (-dd) as 1 | -1, 'neck');
      const lean = 0.35, hipY = -15;
      sprite(ctx, x, y, dd, c => figure(c, f, { hipY, lean, feet: [[-9, 0], [9, 0]], hands: [toTorso(lean, hipY, 4, -2), toTorso(lean, hipY, 10, -2)], mood: 'roar', look: 0.3 }));
      ctx.restore();
      return;
    }
    case 'fflash': {
      // A backflip, the front leg sweeping up through an arc; the arc's blade of light out round him while it's hitting
      const t = g.t, r = -2 * Math.PI * ease(t / F_FLIP), a = 0.4 + 2.5 * ease(t / 12);
      const kick: P2 = [5 + 27 * Math.sin(a), -24 + 27 * Math.cos(a)];
      if (t >= F_ACTIVE[0] && t <= F_ACTIVE[1] + 4) {
        const k = (t - F_ACTIVE[0]) / (F_ACTIVE[1] + 4 - F_ACTIVE[0]), cy = p.pos.y + p.height / 2 - 6;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - k);
        ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(x, cy, FLASH_RADIUS * (0.55 + 0.45 * k), 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, cy, FLASH_RADIUS * (0.55 + 0.45 * k) - 5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      sprite(ctx, x, y, d, turned(r, c => figure(c, f, { feet: [[-8, -12], kick], hands: [[-22, -28], [-12, -32]], mood: 'roar', look: -0.3, toe: [0.6, -0.4] })));
      return;
    }
    case 'fkick': {
      if (fu.step === 'walk') {
        // (stepping round it: legs going)
        const ph = Math.sin(f * 0.45) * 10;
        sprite(ctx, x, y, d, c => figure(c, f, { feet: [[-ph, 0], [ph, 0]], hands: [[ph * 0.6, -8], [-ph * 0.6, -8]], mood: 'grit' }));
      } else if (fu.step === 'point') {
        // (there: pointing them out, the arm straight out at them)
        sprite(ctx, x, y, d, c => figure(c, f, { feet: [[-9, 0], [9, 0]], hands: [[-4, -6], [34, -30]], mood: 'yell', look: -0.1 }));
      } else {
        const k = fu.st / KK.HIT, kk = Math.min(1, k);
        const foot: P2 = k < 1 ? [-22 + 34 * kk * kk, -8 - 4 * kk] : [26 + Math.min(1, (fu.st - KK.HIT) / 6) * 6, -16 - Math.min(1, (fu.st - KK.HIT) / 6) * 20];
        sprite(ctx, x, y, d, c => figure(c, f, { feet: [[-4, 0], foot], hands: [[-16, -12], [18, -18]], mood: k >= 1 ? 'roar' : 'grit', lean: -0.1, toe: [0, -0.3] }));
        if (fu.st >= KK.HIT && fu.st < KK.HIT + 4 && fu.bur) {
          const bx = fu.bur.x, by = fu.bur.ground - 8;
          ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5; ctx.fillRect(Math.round(bx + Math.cos(an) * 16) - 2, Math.round(by + Math.sin(an) * 10) - 2, 4, 4); }
          ctx.fillStyle = '#FDE047'; ctx.fillRect(bx - 5, by - 5, 10, 10);
        }
      }
      return;
    }
  }
};

/** The heads in the ground, the stumps, the bodies legs up out of it, and kicked heads flying or lying (behind him:
 *  drawn with the spellbook's things, weapons/spellbook.ts drawUnder). */
export const drawFollowUnder = (c: Ctx, state: GameState) => {
  if (!buried.length && !heads.length) return;
  const view = viewRectOf(c, 160), stage = String(state.stageId);
  for (const b of buried) {
    if (b.stage !== stage || !inView(view, b.x, b.ground)) continue;
    const age = b.gone !== null ? state.frame - b.gone : state.frame - b.born;
    const life = b.gone !== null ? STUMP_LIFE : b.mode === 'legs' ? LEGS_LIFE : Infinity;
    const alpha = Math.max(0, Math.min(1, (life - age) / BURIED_FADE));
    if (alpha <= 0) continue;
    const e = b.e, face = faceOf(state, b), hd = headOf(e);
    c.save();
    c.globalAlpha = alpha;
    if (b.gone === null) {
      c.save();
      c.beginPath(); c.rect(b.x - 300, b.ground - 600, 600, 600); c.clip();
      if (b.mode === 'head') drawEnemyAt(c, e, state, b.x, b.ground + b.sink, 0, face);
      else {
        // (legs up: twitching a while; its picture baked the once, put down upside down)
        const bk = b.bake ??= bakeEnemyCut(state, e, face, { circle: false, x0: -e.width / 2 - 24, y0: -e.height - 26, x1: e.width / 2 + 24, y1: 3 });
        c.translate(b.x, b.ground - (e.height - b.sink)); c.rotate(Math.PI + (age < 150 ? Math.sin(age * 0.9) * 0.06 * (1 - age / 150) : 0));
        c.drawImage(bk.cv, bk.x, bk.y, bk.w, bk.h);
      }
      c.restore();
    } else {
      // (the stump: the neck, cut, red in the middle)
      const sx = b.x + face * hd.x;
      c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(sx, b.ground - 2, hd.r * 0.55, 2.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(sx, b.ground - 2.5, hd.r * 0.3, 1.4, 0, 0, Math.PI * 2); c.fill();
    }
    // (the churned dirt round it)
    c.fillStyle = '#4A2F17'; c.beginPath(); c.ellipse(b.x + (b.mode === 'head' ? face * hd.x : 0), b.ground, Math.max(10, hd.r * 1.3), 3.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6B4423'; c.fillRect(Math.round(b.x - hd.r * 1.2), Math.round(b.ground - 2), 3, 2); c.fillRect(Math.round(b.x + hd.r), Math.round(b.ground - 3), 2, 2);
    c.restore();
  }
  for (const h of heads) {
    if (h.stage !== stage || !inView(view, h.x, h.y)) continue;
    const alpha = h.down && h.t > HEAD_LIE - HEAD_FADE ? (HEAD_LIE - h.t) / HEAD_FADE : 1;
    if (alpha <= 0) continue;
    // (cut out of its picture the once, then just put down turned)
    if (!h.bake) h.bake = bakeEnemyCut(state, h.e, h.face, h.cut);
    const b = h.bake;
    c.save(); c.globalAlpha = alpha;
    c.translate(h.x, h.y); c.rotate(h.rot);
    c.drawImage(b.cv, b.x - h.cx * h.face, b.y - h.cy, b.w, b.h);
    c.restore();
  }
};
