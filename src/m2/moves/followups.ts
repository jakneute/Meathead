// The hidden upgrades' FOLLOW-UPS (upgrades/SPEC.md: the sabatons, pauldrons, armguards, leg armor; "Follow-ups,
// generally"), run as grabs of their own inside the grab system (grab.ts hands its phases here).
//
//   SABATONS  the MISSILE: Y + B in or just after a dive kick (no hit needed): he flips upside down over them, takes
//             them by the shoulders, flips on round swinging them up and over, and hurls them straight ahead, fast
//             (gravity arcs it down; no steering). Whoever they hit takes their weight and speed, more than a throw's.
//   PAULDRONS PLANTED: Y + B in or just after a charge, on one standing on the ground (the reach is wide): up against
//             them, both fists raised overhead, and one BONK on the top of the head drives them into the ground like a
//             rail spike till only the head's out (the owner's "an overhead 'bonk' with his fist that sends them into
//             the ground like a rail spike"), stuck a good while (it digs out), harmless.
//             THE HEAD KICK: B by a head in the ground (a B prompt over it) kicks it off like a football into the
//             nearest enemy that way; nobody that way but somebody the other way, he walks round it, points, kicks.
//   ARMGUARDS the NINJA DROP: Y + B in or just after an uppercut: an Izuna drop (the owner: "make the uppercut followup
//             look more like ryu hayabusa, like a fancy wrestling move"): on up with them in a full flip, them upside
//             down under him, then down, corkscrewing, head first into the ground; steered forward or back on the way
//             (left / right; nothing held, it arcs on forward) (regular enemies: dead, legs up out of it).
//   LEG ARMOR the FLASH KICK: up + B any time in a slide (not a follow-up to a hit: B's held through a slide, so up's
//             pressed with it, or B pressed with up held): free (no power cell: the owner's "make the flash kick not require a
//             meter"), a backflip with the leg up
//             in an arc, about half the uppercut's height. Everything round him in a big circle takes 150 (bosses and
//             sub-bosses: it's an uppercut to them, the engine's and their fights' own, counted as the slide's piece:
//             tuning.ts meleeMoveOf, bossMelee's armored share); whatever it kills is sliced in half down the forehead
//             (weapons/dismember.ts sliceInHalf: the halves baked once, drawn turned); an animal nose to tail through
//             the head, its top half sliding off its bottom.
//
// People and animals go different ways (the owner's "account for the correct orientation, like we did with shakedowns
// and beatdowns"; grab.ts's way: a person upright or flat, an animal on end by the scruff or rolled legs up): the
// missile takes an animal by the scruff, its body trailing round the swing; the spin drills one in on end, rump first;
// the ninja drop drives one down on end head first and leaves it on its back, four legs up, kicking; the head kick
// punts its head (cut out of it as it looked alive, on end the way it was stuck).
//
// The follow-ups need that move's piece; on a grab-immune regular enemy, the hand armor too; never a critter (Y + B on
// one is still the critter grab), a boss or a sub-boss. None of them heals (the owner: "followup grabs shouldn't heal. they are meant for big damage mainly"). The window, the
// reach and the rest: upgrades/tune.ts.
//
// NO HIT NEEDED (the owner's "not require a hit confirmation but rather just within a quick window of doing the
// charge->grab", "give the new 'special grabs' a wide berth, wider than what appears"): Y + B while he's in the move or
// within FOLLOW_WINDOW frames of it ending takes the nearest one it works on in a reach bigger than it looks (the one
// the move hit, if it's still in reach). While it's on offer, the one it'd take glints in the piece's colors, the
// piece on him twinkles, a Y + B prompt hangs over it and a twinkle sounds; the follow-up starts with a burst.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import type { Block, Enemy } from '../../m1/types';
import type { MeleeMove } from '../../m1/game/core/tuning';
import { kindHead, isHumanoidKind } from '../../m1/game/render/enemies';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { interrupt } from '../../m1/game/enemies/enemies';
import { playSound } from '../../m1/game/platform/audio';
import { floorTopAt } from '../../m1/game/core/terrain';
import { UPPERCUT_SPEED, UPPERCUT_DURATION, PLAYER_GRAVITY, CANVAS_HEIGHT, CANVAS_WIDTH, HUD_CLEAR_Y } from '../../m1/constants';
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
import { worldPrompt } from '../store';
import {
  FOLLOW_WINDOW, FOLLOW_REACH, FOLLOW_REACH_CHARGE, FOLLOW_REACH_UP, FOLLOW_REACH_BEHIND, MISSILE_SPEED, MISSILE_HIT_K,
  HEAD_KICK_SPEED, HEAD_HIT, HEAD_KICK_REACH, BURIED_MAX, BURIED_FREE, BURIED_DIG, NINJA_FALL, NINJA_DAMAGE, NINJA_METEOR_R, NINJA_METEOR_DMG, NINJA_METEOR_STUN, FLASH_RISE, FLASH_RADIUS, FLASH_DAMAGE,
} from '../upgrades/tune';
import { grabKit as K, grabbable, isCritter, handsOnlyFoe, drawEnemyAt, drawPoseSprite as sprite, drawPoseHead as head, type Grab } from './grab';
import { grabCallout } from './callouts';
import { m2Kill } from './killLines';
import { sliceInHalf, bakeEnemyCut, bakeEnemyCutAlive, type BakedCut, type Cut } from '../weapons/dismember';
import { meteorLooks } from '../weapons/spellbook';
import { zoneCountsIn, hazardKill } from '../hazardHit';

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
  /** The ninja drop's drift across (px a frame): steered forward or back. */
  vx: number;
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
  c0: { x: 0, y: 0 }, ef: { x: 0, y: 0 }, sh: { x: 0, y: 0 }, ground: 0, sink: 0, vy: 0, spin: 0, vx: 0, hits: new Set(), said: false,
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

/** A person goes in feet first, upright; an animal's turned up on end first, head up, hind legs down (the way the grabs
 *  hold one by the neck, grab.ts drawHeldByNeck: the owner's "account for the correct orientation... it's different for
 *  humans/animals"). */
const animal = (e: Enemy) => !isHumanoidKind(e.kind);
/** An animal's neck, from its feet, facing `face` (just behind its head), and how far down it hangs below it on end. */
const neckOf = (e: Enemy, face: 1 | -1) => { const hd = headOf(e); return { x: face * (hd.x - hd.r * 0.6), y: hd.y + hd.r * 0.5 }; };
const hangOf = (e: Enemy) => Math.round(e.width * 0.85);
/** An animal drawn on end, its neck at (nx, ny), turned `tip` of the way up (0: stood as it stands), and then turned
 *  `turn` more about its neck (the missile's swing; the ninja drop's PI: on end head down, rump up). `how`: held by
 *  the scruff (the drawers that pose for it do). */
const drawOnEnd = (c: Ctx, state: GameState, e: Enemy, nx: number, ny: number, face: 1 | -1, tip: number, turn = 0, how?: 'neck') => {
  const nk = neckOf(e, face);
  c.save(); c.translate(nx, ny); c.rotate(-face * Math.PI / 2 * tip + turn);
  drawEnemyAt(c, e, state, -nk.x, -nk.y, 0, face, how);
  c.restore();
};
/** How far below his feet the ninja drop's one reaches, held upside down under him: a person's height; an animal on end
 *  head down: its body up against his soles, its head hanging below its neck. */
const dropLen = (e: Enemy) => (animal(e) ? hangOf(e) + headOf(e).r * 1.6 : e.height);
/** How far an animal's in the floor on its back after the ninja drop (its back in the dirt, four legs up). */
const BACK_SINK = 0.22;
/** Where a buried one's head is (to kick it, to spurt from its stump): a person's up off its feet; an animal's straight
 *  up off its neck at the floor. */
const headSpot = (b: { e: Enemy; x: number; ground: number }, face: 1 | -1) => {
  const hd = headOf(b.e);
  return animal(b.e) ? { x: b.x - face * hd.r * 0.5, y: b.ground - hd.r * 1.1 } : { x: b.x + face * hd.x, y: b.ground - hd.r };
};

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

/** A kill's callout where it is now (it's out of the enemy list by then). */
const calloutAt = (ctx: FrameContext, e: Enemy, x: number, y: number, how: Parameters<typeof grabCallout>[0]) =>
  ctx.fx.spawnKillCallout({ pos: { x: x - e.width / 2, y: y - e.height / 2 }, width: e.width, height: e.height, kind: e.kind, health: 0, isBlownAway: true }, grabCallout(how));

// ---------------------------------------------------------------------------------------------------------------------
// Heads in the ground (the spin's), and the bodies the head kick and the ninja drop leave in it
// ---------------------------------------------------------------------------------------------------------------------
interface Buried {
  e: Enemy; x: number; ground: number; sink: number; face: 1 | -1;
  /** 'head': in to the neck (alive, the spin's: digging out after BURIED_FREE); 'legs': head first, legs up out of it
   *  (the ninja drop's, dead). */
  mode: 'head' | 'legs'; born: number; stage: string;
  /** The frame its head was kicked off (then it's a stump, and goes after a while). */
  gone: number | null;
  /** Legs up, dead: its picture painted the once (drawn turned: the stamp cache won't take a turn). */
  bake?: BakedCut;
  /** What it's planted in (the owner's "if you plant a guy on a moving platform, he moves with it": the bus's roof, a
   *  lift, a car), and where that was last frame; the hazards on it as it went in (one come onto it since knocks it
   *  loose: a train, the bus's front). Set by plantAt. */
  on?: Block | null; onX?: number; onY?: number; base?: Map<string, { n: number; cx: number }>;
}
let buried: Buried[] = [];
/** How long a stump, or a body legs up, stays (frames), and fades out over. */
const STUMP_LIFE = 360, LEGS_LIFE = 540, BURIED_FADE = 40;

interface Head { e: Enemy; x: number; y: number; vx: number; vy: number; rot: number; vr: number; r: number; face: 1 | -1; cut: Cut; cx: number; cy: number; bake: BakedCut | null; t: number; down: boolean; bounces: number; hit: Set<Enemy>; stage: string }
let heads: Head[] = [];
const HEAD_G = 0.45, HEAD_LIE = 420, HEAD_FADE = 40;

// ---- Planted bodies and what they're planted in: one rule for all of them (feet first to the neck, head first legs up,
// an animal on its back, a stump). The owner's "if you plant a guy on a moving platform, he moves with it"; "make sure
// their bodies quickly move away though if they get planted in the ground part of the stage"; "planting them feet first
// or leg first should follow the same logic".

/** The floor a body's planted in: the nearest top at its ground, over it (a one-way ledge too: the bus's roof). */
const carrierAt = (state: GameState, x: number, ground: number): Block | null => {
  let best: Block | null = null, bd = 6;
  for (const k of state.blocks) {
    if (k.type === 'pit' || k.type === 'door' || x < k.x || x > k.x + k.w) continue;
    const d = Math.abs(k.y - ground);
    if (d < bd) { bd = d; best = k; }
  }
  return best;
};
/** The bit of it out of the floor (what a hazard come along would hit). */
const plantBox = (b: Buried) => {
  const e = b.e, top = b.mode === 'legs' && b.gone === null ? b.ground - Math.max(8, e.height - b.sink) : b.ground - headOf(e).r * 2 - 4;
  const w = Math.max(12, e.width * 0.6);
  return { x: b.x - w / 2, y: top, w, h: Math.max(4, b.ground - 1 - top) };
};
const zc = new Map<string, { n: number; cx: number }>();
/** A new one in the ground: what it's in, and the hazards already on it (those don't count as coming onto it). */
const plantAt = (state: GameState, b: Buried): Buried => {
  const k = carrierAt(state, b.x, b.ground);
  b.on = k; b.onX = k?.x ?? 0; b.onY = k?.y ?? 0;
  const q = plantBox(b), base = new Map<string, { n: number; cx: number }>();
  // (its middle against what it's in: one riding along with it hasn't moved onto it)
  for (const [o, v] of zoneCountsIn(state, q.x, q.y, q.w, q.h, zc)) base.set(o, { n: v.n, cx: v.cx - (k?.x ?? 0) });
  b.base = base;
  return b;
};
/** Near enough the screen that it's seen going (off it, things just stop being tracked). */
const nearView = (state: GameState, x: number, y: number) =>
  x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300 && y > state.camera.y - 300 && y < state.camera.y + CANVAS_HEIGHT + 300;

/** Out of the ground, flung (a train, the bus, a hazard come onto it; the floor gone from under it): a live head's a kill
 *  (it's run over); a body legs up goes tumbling, dead as it was; a stump goes to bits. The caller drops it from the
 *  list. */
const knockLoose = (ctx: FrameContext, b: Buried, vel: { x: number; y: number }, call: string) => {
  const { state, fx } = ctx, e = b.e, dir = Math.sign(vel.x) || 1;
  const hs = headSpot(b, b.face);
  markKindGore(state, e.kind, b.x - 50, b.ground - 70, 100, 80, 14);
  for (let i = 0; i < 16; i++) state.particles.push(kindGore({ pos: { x: b.x + (Math.random() - 0.5) * 16, y: b.ground - 6 - Math.random() * 20 }, vel: { x: dir * (1 + Math.random() * 5), y: -2 - Math.random() * 5 }, life: 30, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 }, e.kind));
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 20, y: b.ground - 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 22, color: i % 2 ? '#6B4423' : '#78716C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('splat', 1, -2); playSound('crunch', 0.8, -4);
  // (a stump: its head's off already (a thing of its own); the rest goes to bits)
  if (b.gone !== null) { fx.spawnDeathShower({ x: hs.x, y: b.ground - 10 }, dir, 1); return; }
  e.rotation = b.mode === 'legs' ? Math.PI : 0;
  e.pos = { x: b.x - e.width / 2, y: b.ground - e.height - 4 };
  e.melee = undefined; e.meleeFlung = false; e.pauseTimer = 0;
  if (b.mode === 'head' && e.health > 0) {
    // (alive in it to the neck: that's a kill now, the usual one)
    e.isBlownAway = false;
    K.release(state, e);
    hazardKill(ctx, e, b.x - dir * 40, call, { fling: vel, sound: 'splat' });
    return;
  }
  // (dead already, legs up: back in the world as a body, flying; no second kill)
  e.health = Math.min(0, e.health); e.isBlownAway = true; e.vel = { ...vel };
  K.release(state, e);
  fx.spawnDeathShower(e.pos, dir, 1.2);
  fx.spawnDamageNumber({ x: b.x - 20, y: b.ground - e.height - 20 }, call, true, '#FCA5A5');
};

/** Each frame: carried with what it's in; knocked loose if a hazard's come onto it, or that's gone from under it. True:
 *  it's out (drop it). */
const carry = (ctx: FrameContext, b: Buried): boolean => {
  const { state } = ctx, k = b.on;
  if (k) {
    const dx = k.x - (b.onX ?? k.x), dy = k.y - (b.onY ?? k.y);
    // (gone from the world, or jumped off somewhere (taken away): out from under it)
    const gone = Math.abs(dx) > 80 || Math.abs(dy) > 80 || (state.frame % 15 === 0 && !state.blocks.includes(k));
    if (gone) {
      b.on = null;
      if (nearView(state, b.x, b.ground)) { knockLoose(ctx, b, { x: (dx < 0 ? -1 : 1) * 4, y: -5 }, 'UPROOTED!'); return true; }
    } else if (dx || dy) { b.x += dx; b.ground += dy; b.onX = k.x; b.onY = k.y; }
  }
  // (a hazard come onto it since it went in (more of its zones on it, or the one there then moved: the bus come on
  // through): knocked out of the ground, away from it)
  const q = plantBox(b);
  for (const [o, v] of zoneCountsIn(state, q.x, q.y, q.w, q.h, zc)) {
    const was = b.base?.get(o);
    if (was && v.n <= was.n && Math.abs(v.cx - (b.on?.x ?? 0) - was.cx) < 40) continue;
    const away = Math.sign(b.x - v.cx) || 1;
    knockLoose(ctx, b, { x: away * 10, y: -9 }, 'UPROOTED!');
    return true;
  }
  return false;
};

/** A vehicle on rails (a train, a tram, a cart, the bus) at this box this frame: whatever's planted in its way is
 *  knocked out of the ground and flung away from `fromX` (its back: the way it's going). Cheap with nobody planted. */
export const knockPlantedIn = (ctx: FrameContext, x: number, y: number, w: number, h: number, fromX: number, call = 'RUN OVER!') => {
  if (!buried.length) return;
  const stage = String(ctx.state.stageId);
  buried = buried.filter(b => {
    if (b.stage !== stage) return true;
    const q = plantBox(b);
    if (q.x + q.w <= x || q.x >= x + w || q.y + q.h <= y || q.y >= y + h) return true;
    const away = Math.sign(b.x - fromX) || 1;
    knockLoose(ctx, b, { x: away * 12, y: -10 }, call);
    return false;
  });
};

/** A stage whose ground goes by (the Wilderness train: the train stands still, the world moves): every body planted in
 *  the band `y0`..`y1` between `x0` and `x1` is knocked out of it and flung back with the ground (`vx`: its speed, px a
 *  frame; heads lying there go by with it, and off the back gone). */
export const plantedOnMovingGround = (ctx: FrameContext, x0: number, x1: number, y0: number, y1: number, vx: number, cullX: number) => {
  if (buried.length) {
    const stage = String(ctx.state.stageId);
    buried = buried.filter(b => {
      if (b.stage !== stage || b.x < x0 || b.x > x1 || b.ground < y0 || b.ground > y1) return true;
      knockLoose(ctx, b, { x: vx * 1.4, y: -7 }, 'RUN OVER!');
      return false;
    });
  }
  if (heads.length) heads = heads.filter(h => {
    if (!h.down || h.x < x0 || h.x > x1 || h.y < y0 - 30 || h.y > y1) return true;
    h.x += vx;
    return h.x > cullX;
  });
};

/** All of it gone (a new game, the stage's own reset). */
export const stopFollowUps = () => { buried = []; heads = []; clearMelee(); lastMove = null; ready = null; burst = null; };

// ---------------------------------------------------------------------------------------------------------------------
// The window: the last of the three moves he was in, and who a Y + B would take now
// ---------------------------------------------------------------------------------------------------------------------
type FollowMove = 'divekick' | 'charge' | 'uppercut';
/** The last of his three follow-up moves he was in, and the last frame he was in it (the window counts on from there). */
let lastMove: { move: FollowMove; at: number; face: 1 | -1 } | null = null;
/** Who a Y + B would take right now (the cue's), and by which move's follow-up. */
let ready: { e: Enemy; move: FollowMove } | null = null;
/** The follow-up's start burst: where, when, the colors. */
let burst: { x: number; y: number; ex: number; ey: number; at: number; cols: readonly [string, string, string]; stage: string } | null = null;
/** One a bit behind him counts as this much further off (one in front's the one he means). */
const BEHIND = 80;
/** Each piece's colors (its land look: armorArt.ts): the bright, the main, the deep. */
const FOLLOW_COLS: Record<FollowMove, readonly [string, string, string]> = {
  divekick: ['#FFF2B0', '#F0C850', '#A4532A'], // sabatons: cowbell gold on rusted iron
  charge: ['#FFEDB8', '#EEC676', '#65A30D'], // pauldrons: leopard on jungle green
  uppercut: ['#E0FFFF', '#22D3EE', '#E879F9'], // armguards: chrome, neon cyan and magenta
};
const FOLLOW_NAME: Record<FollowMove, string> = { divekick: 'MISSILE!', charge: 'PLANTED!', uppercut: 'NINJA DROP!' };

/** Which of the three he's in this frame (the flash kick's an uppercut to the engine: not one of these). */
const moveNow = (state: GameState): FollowMove | null => {
  const p = state.player;
  if (p.flashKick || p.swimming) return null;
  return p.isDivekicking ? 'divekick' : p.isUppercutting ? 'uppercut' : p.isCharging && !p.isSliding ? 'charge' : null;
};

/** The one that move's follow-up would take: the nearest it works on in the (generous) reach, one in front before one
 *  behind, the one the move hit if it's still there; a charge's only one stood on the floor; nothing in between. */
const followTarget = (state: GameState, move: FollowMove): Enemy | null => {
  const p = state.player, pm = pmid(state), h = lastMelee();
  const pref = h && h.move === move ? h.e : null;
  const across = move === 'charge' ? FOLLOW_REACH_CHARGE : FOLLOW_REACH;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (!followable(e)) continue;
    const em = emid(e), dx = em.x - pm.x, dy = em.y - pm.y;
    // (to their near edge, not their middle: bigger than it looks)
    if (Math.abs(dx) > across + e.width / 2 || Math.abs(dy) > FOLLOW_REACH_UP + e.height / 2) continue;
    if (Math.sign(dx) === -p.facing && Math.abs(dx) > FOLLOW_REACH_BEHIND + e.width / 2) continue;
    const d = Math.hypot(dx, dy) + (Math.sign(dx) === -p.facing ? BEHIND : 0) - (e === pref ? 1e4 : 0);
    if (d >= bestD) continue;
    if (move === 'charge' && standing(state, e) === null) continue;
    if (!K.clearTo(state, e)) continue;
    best = e; bestD = d;
  }
  return best;
};

/** Y + B would start a follow-up now: in the window, in the piece, someone it works on in reach. */
const followReady = (state: GameState): { e: Enemy; move: FollowMove } | null => {
  const p = state.player;
  if (!lastMove || since(state.frame, lastMove.at) > FOLLOW_WINDOW) return null;
  if (p.inCutscene || p.noSpecials || K.handsOnly(state) || p.health <= 0) return null;
  const piece = PIECE[lastMove.move];
  if (!piece || !has(piece)) return null;
  const e = followTarget(state, lastMove.move);
  return e ? { e, move: lastMove.move } : null;
};

/** A follow-up's there for the taking right now (grab.ts: on a pad, Y onto a B still held counts as Y + B). */
export const followArmed = (state: GameState) => followReady(state) !== null;

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
 * Y + B in one of his three moves or just after it (the grab's idle, whatever he's in the middle of): that move's
 * follow-up on the nearest one it works on in reach, if he's its piece. No hit needed. True: it's on.
 */
export const startFollowUp = (ctx: FrameContext, g: Grab) => {
  const { state } = ctx, p = state.player;
  const r = followReady(state);
  if (!r) return false;
  const { e, move } = r, moveFace = lastMove?.face ?? p.facing;
  const ground = move === 'charge' ? standing(state, e) : 0;
  if (ground === null) return false;
  clearMelee(); lastMove = null; ready = null;
  const pm = pmid(state), em = emid(e);
  stopMoves(state);
  // (the missile: thrown the way he was facing in the dive kick (the owner: "they fly in the same direction meathead is
  // facing when the hit connects"), wherever the stomp's bounce has left him; the others: toward them)
  const d = move === 'divekick' ? moveFace : (Math.sign(em.x - pm.x) || p.facing) as 1 | -1;
  g.dir = d; p.facing = d; g.t = 0;
  K.take(state, e); g.held = e; e.facing = (-d) as 1 | -1; e.vel = { x: 0, y: 0 }; e.melee = undefined; e.rotation = 0;
  const fu = newFollow();
  fu.c0 = pm; fu.ef = { x: em.x, y: e.pos.y + e.height }; fu.sh = { x: em.x, y: e.pos.y + e.height * 0.18 };
  // (an animal's taken by the scruff of its neck, the way the grabs hold one: grab.ts drawHeldByNeck)
  if (animal(e)) { const nk = neckOf(e, (-d) as 1 | -1); fu.sh = { x: fu.ef.x + nk.x, y: fu.ef.y + nk.y }; }
  g.fu = fu;
  if (move === 'divekick') { g.phase = 'fmissile'; playSound('whoosh', 1, -6); }
  else if (move === 'charge') {
    g.phase = 'fspin'; fu.ground = ground; fu.ef.y = ground;
    const hd = headOf(e); fu.sink = animal(e) ? hangOf(e) : Math.max(0, -hd.y - hd.r);
    playSound('snort', 0.9, -4);
  } else {
    // (off a way from them: a dash over to them first (N_DASH, in the step), then up with them)
    g.phase = 'fdrop'; fu.vy = -8;
    fu.sink = Math.abs(em.x - pm.x) < 24 ? 1 : 0;
    if (fu.sink) dropRoom(state, e);
    playSound('whoosh', 1.1, -2); playSound('jump', 0.8, -4);
  }
  p.vel = { x: 0, y: 0 };
  kickoff(ctx, move, pm, em);
  return true;
};

/** The ninja drop: room under him for them, upside down, before the floor. */
const dropRoom = (state: GameState, e: Enemy) => {
  const p = state.player, fy = K.feetY(state), floor = floorTopAt(state.blocks, K.centerX(state), fy, 2);
  if (floor !== null && fy + dropLen(e) + 6 > floor) p.pos.y -= fy + dropLen(e) + 6 - floor;
};

/** A follow-up kicking in: a burst of the piece's colors off him and them, the jolt, a bang, its name. */
const kickoff = (ctx: FrameContext, move: FollowMove, pm: { x: number; y: number }, em: { x: number; y: number }) => {
  const { state, fx } = ctx, cols = FOLLOW_COLS[move];
  burst = { x: pm.x, y: pm.y, ex: em.x, ey: em.y, at: state.frame, cols, stage: String(state.stageId) };
  shakeScreen(state, 8, 6);
  playSound('slam', 0.8, 6); playSound('twinkle', 1, -6);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, v = 3 + Math.random() * 4;
    state.particles.push({ pos: { x: pm.x, y: pm.y }, vel: { x: Math.cos(a) * v, y: Math.sin(a) * v }, life: 18 + Math.random() * 8, color: cols[i % 3], size: 2 + Math.random() * 3 });
  }
  fx.spawnDamageNumber({ x: pm.x - 30, y: pm.y - 60 }, FOLLOW_NAME[move], true, cols[1]);
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
  // (on the keys, the slide key (C) overrides up: W held with it counts too, C + W)
  const up = controls.up || !!controls.upHeld;
  if (p.isSliding && has('legs') && up && controls.special && (press('up') || press('upHeld') || press('special'))) {
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

/** The bonk's frames: in to them, both fists wound up overhead, the bonk driving them in (fast: a spike), then a moment
 *  stood over the head. */
const S = { CLOSE: 6, WIND: 12, DRIVE: 4, HOLD: 20 };
const spinGeo = (g: Grab) => {
  const fu = g.fu!, t = g.t, a = S.CLOSE + S.WIND, b = a + S.DRIVE;
  // (wound up: them squashed a hair as it's coming; then in, all at once)
  const yOff = t < a ? 0 : t < b ? fu.sink * Math.pow((t - a) / S.DRIVE, 0.6) : fu.sink;
  return { yOff, hitAt: a, buriedAt: b };
};

/** The ninja drop's rise (frames), before it comes down; the dash over to them first, if they're off a way. */
const N_RISE = 12, N_DASH = 5;
/** Its drift across, steered (px a frame), and nothing held (on forward, an arc). */
const N_STEER = 4.5, N_DRIFT = 2;
/** How fast the drop picks up speed coming down (px a frame, a frame; was 1.3: slowed so it reads, the owner's "slow
 *  down the izuna drop animation a bit so it's clearer what is happening ... like on the way down"). */
const N_FALL_ACC = 0.75;
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
      if (g.t === S.CLOSE) playSound('whoosh', 0.7, -10);
      if (e && g.t === geo.hitAt) {
        // BONK: on the top of the head, and in they go, the floor bursting up either side
        playSound('punch', 1.2, -8); playSound('slam', 1, -4); shakeScreen(state, 12, 7);
        for (let i = 0; i < 18; i++) {
          const side = i % 2 ? -1 : 1;
          state.particles.push({ pos: { x: fu.ef.x + side * e.width * 0.35, y: fu.ground - 2 }, vel: { x: side * (1.5 + Math.random() * 4), y: -2 - Math.random() * 5 }, life: 24, color: Math.random() < 0.5 ? '#6B4423' : '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 });
        }
      }
      if (e && g.t >= geo.buriedAt) {
        // In to the neck: stuck there a good while, harmless (out of the world's list: a head now) till it digs out
        g.held = null;
        e.vel = { x: 0, y: 0 }; e.melee = undefined; e.pauseTimer = 0; e.rotation = 0;
        buried.push(plantAt(state, { e, x: fu.ef.x, ground: fu.ground, sink: fu.sink, face: (-d) as 1 | -1, mode: 'head', born: state.frame, stage: String(state.stageId), gone: null }));
        trimBuried();
        calloutAt(ctx, e, fu.ef.x, fu.ground - 30, 'planted');
        playSound('thud', 1, -6);
        for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: fu.ef.x + (Math.random() - 0.5) * 30, y: fu.ground - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: i % 2 ? '#6B4423' : '#78716C', size: 2 + Math.random() * 3, grav: 0.25 });
      }
      if (g.t >= geo.buriedAt + S.HOLD) K.end(state, g);
      return { ...NO_CONTROLS };
    }

    case 'fdrop': {
      const e = g.held;
      if (!e) { K.end(state, g); return { ...NO_CONTROLS }; }
      p.vel.x = 0;
      // (off a way from them: over to them first, at a dash, hanging there; then the room made under him, and up)
      if (!fu.sink) {
        K.placeAt(state, fu.c0.x + (fu.ef.x - fu.c0.x) * ease(g.t / N_DASH) - p.width / 2, p.pos.x);
        p.vel.y = 0; p.isGrounded = false;
        if (g.t >= N_DASH) { dropRoom(state, e); fu.sink = 1; g.t = 0; }
        return { ...NO_CONTROLS };
      }
      fu.vy = g.t <= N_RISE ? -8 * (1 - g.t / N_RISE) : Math.min(NINJA_FALL, fu.vy + N_FALL_ACC);
      // (steered: forward or back with left / right, the whole way; nothing held, it arcs on the way he's facing)
      const steer = controls.left && !controls.right ? -1 : controls.right && !controls.left ? 1 : 0;
      fu.vx += ((steer ? steer * N_STEER : d * N_DRIFT) - fu.vx) * 0.18;
      K.placeAt(state, p.pos.x + fu.vx, p.pos.x);
      if (fu.vy < 0 && K.ceilingOver(state, fu.vy - 2)) fu.vy = 0;
      fu.spin += 0.16 + Math.min(0.24, g.t * 0.006);
      if (g.t % 6 === 0 && g.t > N_RISE) playSound('whoosh', 0.6, 4 + Math.min(8, g.t / 8));
      const fy = K.feetY(state), headY = fy + dropLen(e), cx = K.centerX(state);
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

/** Driven in head first: NINJA_DAMAGE, the shock through the floor, the meteor. Killed, legs up out of the floor; a tanky
 *  one it doesn't kill (the owner's "the ninja drop can be non-fatal to some tankier enemies") is let go of there, on
 *  its feet, seeing stars. */
const ninjaImpact = (ctx: FrameContext, g: Grab, e: Enemy, floor: number): Controls => {
  const { state, fx } = ctx, p = state.player, x = K.centerX(state);
  const dmg = raged(NINJA_DAMAGE);
  if (e.health > dmg) return ninjaSurvived(ctx, g, e, floor, dmg);
  e.health = Math.min(0, e.health - dmg); e.isBlownAway = true; e.vel = { x: 0, y: 0 };
  // (a person: head first, legs up out of it; an animal: on its back in the dirt, four legs up, painted as it looked
  // alive and put down upside down: its dead picture's lying down already, or belly up)
  const beast = animal(e), sink = Math.round(e.height * (beast ? BACK_SINK : 0.3)), face = (-g.dir) as 1 | -1;
  g.held = null;
  buried.push(plantAt(state, { e, x, ground: floor, sink, face, mode: 'legs', born: state.frame, stage: String(state.stageId), gone: null,
    bake: beast ? bakeEnemyCutAlive(state, e, face, legsCut(e)) : undefined }));
  trimBuried();
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

/** The ninja drop on one too tough for it: slammed head first into the floor and bounced back up off it (the owner's
 *  "otherwise they bounce back"), not stuck in it; hurt and dazed a while, the shock and the meteor all the same; him
 *  hopping off it. */
const ninjaSurvived = (ctx: FrameContext, g: Grab, e: Enemy, floor: number, dmg: number): Controls => {
  const { state, fx } = ctx, p = state.player, x = K.centerX(state);
  e.health -= dmg;
  g.held = null;
  e.rotation = 0;
  e.pos = { x: x - e.width / 2, y: floor - e.height - 2 };
  K.release(state, e);
  e.vel = { x: g.dir * NINJA_BOUNCE_X, y: -NINJA_BOUNCE_Y };
  e.pauseTimer = Math.max(e.pauseTimer || 0, NINJA_SURVIVE_STUN); e.chargedAt = state.frame;
  fx.spawnDamageNumber(e.pos, dmg, true);
  fx.spawnExplosion({ x, y: floor - 4 }, '#8B0000', 12, 0, 10);
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: floor - 2 }, vel: { x: (Math.random() - 0.5) * 9, y: -1 - Math.random() * 5 }, life: 28, color: i % 3 ? '#6B4423' : '#A8A29E', size: 2 + Math.random() * 3, grav: 0.3 });
  K.slamShock(ctx, e, x, floor);
  meteorLooks(ctx, { x, y: floor - 6 });
  ninjaMeteor(ctx, e, x, floor - 6);
  playSound('slam', 1.1, -4); playSound('crunch', 1, -2);
  shakeScreen(state, 14, 8);
  // Him: up off its head with a hop, its body no harm to him on the way down
  p.pos.y = floor - e.height - p.height; p.vel = { x: -g.dir * 2.5, y: -8 }; p.isGrounded = false;
  p.noContactUntil = state.frame + NINJA_SURVIVE_GRACE;
  g.hitAt = { x, y: floor }; g.phase = 'aland'; g.t = 0; g.fu = null;
  return { ...NO_CONTROLS };
};
/** How long one that lived through it is dazed, and how long its body can't hurt him as he comes off it (frames). */
const NINJA_SURVIVE_STUN = 90, NINJA_SURVIVE_GRACE = 45;
/** Its bounce back up off the floor: along the way he was facing, and up (px a frame). */
const NINJA_BOUNCE_X = 3, NINJA_BOUNCE_Y = 11;

/** The picture a body legs up is put down from: the whole of it, room round it. */
const legsCut = (e: Enemy): Cut => ({ circle: false, x0: -e.width / 2 - 24, y0: -e.height - 26, x1: e.width / 2 + 24, y1: 3 });

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
  const hd = headOf(e), face = faceOf(state, b), hs = headSpot(b, face), hx = hs.x, hy = hs.y;
  const dir = fu.kdir;
  const tgt = foes(state, hx, hy).filter(o => (o.pos.x + o.width / 2 - hx) * dir > 0)
    .sort((a, c) => Math.abs(a.pos.x - hx) - Math.abs(c.pos.x - hx))[0];
  const vx = dir * HEAD_KICK_SPEED;
  let vy = -9;
  if (tgt) {
    const dx = Math.abs(tgt.pos.x + tgt.width / 2 - hx), dy = tgt.pos.y + tgt.height * 0.4 - hy, T = Math.max(8, dx / HEAD_KICK_SPEED);
    vy = Math.max(-15, Math.min(-2, (dy - 0.5 * HEAD_G * T * T) / T));
  }
  // (its head cut out of its picture: an animal's painted there and then as it looked alive, its head where it stands
  // (its dead picture's lying down, or belly up), and it comes off turned the way it was stuck in the ground, on end)
  const cut: Cut = { circle: true, x: hd.x, y: hd.y, r: hd.r * 1.35 }, beast = animal(e);
  heads.push({ e, x: hx, y: hy, vx, vy, rot: beast ? -face * Math.PI / 2 : 0, vr: dir * 0.35, r: hd.r, face, cut, cx: hd.x, cy: hd.y, bake: beast ? bakeEnemyCutAlive(state, e, face, cut) : null, t: 0, down: false, bounces: 0, hit: new Set(), stage: b.stage });
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

/** Floors you can see the underside of (a train car's roof: its ceiling inside), by block tag, set by the stage that has
 *  them: one buried in one hangs out under it (the owner's "you should see their head on top and their body sticking
 *  below on the ceiling of the train car"). Whatever's drawn over that underside (the car shut) covers it. */
let seeThrough: ((tag: string) => boolean) | null = null;
export const setSeeThroughFloor = (fn: (tag: string) => boolean) => { seeThrough = fn; };
/** The underside of the floor a buried one's in, if it's one you can see the underside of and they come out of it. */
const undersideOf = (state: GameState, b: Buried) => {
  if (!seeThrough) return null;
  const fl = state.blocks.find(k => k.tag && !k.oneWay && b.x >= k.x && b.x <= k.x + k.w && Math.abs(k.y - b.ground) < 6);
  if (!fl || !seeThrough(fl.tag!) || fl.y + fl.h >= b.ground + b.sink) return null;
  return fl.y + fl.h;
};

/** The frame's state, for a head dug out by the trim (outside the tick). */
let game: GameState | null = null;

/** A head in the ground out of it, alive (no worse for it): popped up out of the dirt, back in the world, a moment to
 *  get its wits back. */
const digOut = (state: GameState, b: Buried) => {
  const e = b.e;
  if (e.health <= 0 || b.gone !== null || b.mode !== 'head') return;
  e.pos = { x: b.x - e.width / 2, y: b.ground - e.height };
  e.vel = { x: 0, y: -6 }; e.rotation = 0; e.isBlownAway = false;
  e.pauseTimer = Math.max(e.pauseTimer || 0, 30);
  K.release(state, e);
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 24, y: b.ground - 2 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 28, color: i % 2 ? '#6B4423' : '#78716C', size: 2 + Math.random() * 3, grav: 0.3 });
  playSound('crunch', 0.8, -4); playSound('thud', 0.6, -6);
};

/** Which way a buried one's drawn facing: a live head looks at him. */
const faceOf = (state: GameState, b: Buried) => (b.mode === 'head' && b.gone === null ? ((Math.sign(K.centerX(state) - b.x) || b.face) as 1 | -1) : b.face);

const trimBuried = () => {
  // (too many: the oldest stumps and bodies go first, then the oldest heads)
  while (buried.length > BURIED_MAX) {
    const i = buried.findIndex(b => b.mode === 'legs' || b.gone !== null);
    if (i >= 0) { buried.splice(i, 1); continue; }
    // (all live heads: the oldest one's out early, never just gone)
    const b = buried.shift()!;
    if (game) digOut(game, b);
  }
};

// ---------------------------------------------------------------------------------------------------------------------
// Every frame (from the grab's update)
// ---------------------------------------------------------------------------------------------------------------------

/** Before the grab's step: the last hit stamped, the heads in the ground and the flying ones kept up. */
export const followTick = (ctx: FrameContext, g: Grab) => {
  const { state } = ctx;
  stampMelee(state.frame);
  // (the window: the last frame he was in one of the three; and who a Y + B would take now, a twinkle as it comes on)
  const mv = moveNow(state);
  if (mv) lastMove = { move: mv, at: state.frame, face: state.player.facing };
  // (and on through the bounce off whoever it hit: the owner's "so they can be initiated during the recoil of the
  // attack as well"; the window counts on from the end of that)
  else if (lastMove && (state.player.recoiling || state.player.slideRecoil) && since(state.frame, lastMove.at) <= FOLLOW_WINDOW) lastMove.at = state.frame;
  const had = ready;
  ready = g.phase === 'idle' ? followReady(state) : null;
  if (ready && !had) playSound('twinkle', 0.7, 8);
  const stage = String(state.stageId);
  game = state;
  if (buried.length) buried = buried.filter(b => {
    if (b.stage !== stage) return false;
    // (on something that moves: carried with it; knocked loose by a hazard come onto it, or it pulled out from under)
    if (carry(ctx, b)) return false;
    const age = b.gone !== null ? state.frame - b.gone : state.frame - b.born;
    if (age < 0) return false;
    // (the stump: spurting a while)
    if (b.gone !== null && age < 120 && age % 3 === 0) {
      const hs = headSpot(b, b.face);
      state.particles.push(kindGore({ pos: { x: hs.x, y: b.ground - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -3 - Math.random() * 3 * (1 - age / 120) }, life: 26, color: age % 2 ? '#B91C1C' : '#991B1B', size: 2 + Math.random() * 2, grav: 0.3 }, b.e.kind));
    }
    if (b.gone !== null) return age < STUMP_LIFE;
    if (b.mode === 'legs') return age < LEGS_LIFE;
    // (a head: digging, then out)
    if (age >= BURIED_FREE) { digOut(state, b); return false; }
    if (age >= BURIED_FREE - BURIED_DIG) {
      const k = (age - (BURIED_FREE - BURIED_DIG)) / BURIED_DIG;
      if (age % Math.max(3, Math.round(10 - k * 7)) === 0) {
        const side = Math.random() < 0.5 ? -1 : 1;
        state.particles.push({ pos: { x: b.x + side * (6 + Math.random() * 10), y: b.ground - 2 }, vel: { x: side * (1 + Math.random() * 2.5), y: -2 - Math.random() * 3 }, life: 22, color: Math.random() < 0.5 ? '#6B4423' : '#A8A29E', size: 2 + Math.random() * 2, grav: 0.3 });
      }
      if (age % 24 === 0) playSound('crunch', 0.25 + k * 0.4, -8 + k * 4);
    }
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
          const face = (-d) as 1 | -1;
          if (g.t < M.GRIP) drawEnemyAt(ctx, e, state, fu.ef.x, fu.ef.y, 0, face);
          else if (animal(e)) {
            // (an animal: by the scruff, tipped up on end as he takes it, its body trailing from his hands round the swing)
            const tip = Math.min(1, (g.t - M.GRIP) / 4), nk = neckOf(e, face);
            drawOnEnd(ctx, state, e, fu.ef.x + nk.x + (geo.hand.x - fu.ef.x - nk.x) * tip, fu.ef.y + nk.y + (geo.hand.y - fu.ef.y - nk.y) * tip, face, tip, d * geo.a * tip, 'neck');
          } else drawEnemyAt(ctx, e, state, geo.feet.x, geo.feet.y, d * geo.a, face, 'neck');
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
      const face = (-d) as 1 | -1, struck = g.t >= geo.hitAt;
      if (e) {
        const hd = headOf(e), feetY = fu.ground + geo.yOff;
        ctx.save();
        ctx.beginPath(); ctx.rect(fu.ef.x - 300, fu.ground - 600, 600, 600); ctx.clip();
        // (a hair squashed as the fists come down, the moment before)
        const sq = !struck && g.t > geo.hitAt - 3 ? 0.92 : 1;
        ctx.translate(fu.ef.x, feetY); ctx.scale(2 - sq, sq); ctx.translate(-fu.ef.x, -feetY);
        if (animal(e)) {
          // (an animal: tipped up on end, head up, as he winds up; then spiked in tail first)
          const tip = g.t <= S.CLOSE ? 0 : Math.min(1, (g.t - S.CLOSE) / (S.WIND * 0.6)), nk = neckOf(e, face);
          const hangY = fu.ground - hd.r * 0.5 - (fu.sink - geo.yOff);
          drawOnEnd(ctx, state, e, fu.ef.x + nk.x * (1 - tip), (fu.ground + nk.y) * (1 - tip) + hangY * tip, face, tip);
        } else drawEnemyAt(ctx, e, state, fu.ef.x, feetY, 0, face);
        ctx.restore();
        // (the hole he's going into)
        ctx.fillStyle = '#3B2614'; ctx.beginPath(); ctx.ellipse(fu.ef.x, fu.ground, e.width * 0.45 + 4, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        // (the top of the head, where the fists land; an animal's, up on end)
        const top = animal(e) ? fu.ground - hd.r * 2 - (fu.sink - geo.yOff) : feetY + hd.y - hd.r;
        handAt = [d * (fu.ef.x - x), top - y];
        // (the bonk: a burst of white off the head, a few frames)
        if (struck && g.t < geo.hitAt + 6) {
          const k = (g.t - geo.hitAt) / 6, bx = fu.ef.x, by = Math.min(top, fu.ground - 6);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.9 * (1 - k)).toFixed(2)})`; ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) { const a2 = (i / 8) * Math.PI * 2, r0 = 6 + k * 10, r1 = 12 + k * 18; ctx.beginPath(); ctx.moveTo(bx + Math.cos(a2) * r0, by + Math.sin(a2) * r0 * 0.6); ctx.lineTo(bx + Math.cos(a2) * r1, by + Math.sin(a2) * r1 * 0.6); ctx.stroke(); }
        }
      }
      // Him: walking in, then both fists clasped and raised high overhead (arched back), then down on the head and
      // following it into the ground, bent over it
      const a = geo.hitAt, w = Math.max(0, Math.min(1, (g.t - S.CLOSE) / (S.WIND - 2)));
      let lean: number, hipY: number, hands: [P2, P2], mood: 'roar' | 'grit';
      if (!struck) {
        lean = 0.1 - 0.25 * w; hipY = -24;
        const hx = 10 - 8 * w, hy = -42 - 36 * w;
        hands = [toTorso(lean, hipY, hx - 3, hy), toTorso(lean, hipY, hx + 3, hy - 1)];
        mood = w > 0.3 ? 'roar' : 'grit';
      } else {
        const k = Math.min(1, (g.t - a + 1) / 2);
        lean = 0.2 + 0.5 * k; hipY = -22 + 3 * k;
        const hx = handAt[0], hy = Math.max(handAt[1], -36);
        hands = [toTorso(lean, hipY, hx - 3, hy), toTorso(lean, hipY, hx + 3, hy + 1)];
        mood = 'roar';
      }
      const jig = struck && g.t < a + 4 ? (f % 2 ? 1 : -1) : 0;
      sprite(ctx, x + jig, y, d, c => figure(c, f, { hipY, lean, feet: [[-15, 0], [14, 0]], hands, mood, look: struck ? 0.35 : -0.2 }));
      return;
    }
    case 'fdrop': {
      const e = g.held;
      if (!fu.sink) {
        // (the dash over to them: them still stood there, him streaking at them)
        if (e) drawEnemyAt(ctx, e, state, fu.ef.x, fu.ef.y, 0, (-d) as 1 | -1);
        for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(255, 255, 255, ${(0.55 - i * 0.1).toFixed(2)})`; ctx.fillRect(x - d * (30 + i * 14) - (d < 0 ? 0 : 22), y - 40 + i * 8, 22, 2); }
        sprite(ctx, x, y, d, c => figure(c, f, { feet: [[-12, -4], [10, -10]], hands: [[14, -34], [24, -30]], mood: 'roar', lean: 0.3 }));
        return;
      }
      const falling = g.t > N_RISE, eh = e ? (animal(e) ? hangOf(e) + 10 : e.height) : 40;
      // (coming down: air streaming up past them, and a corkscrew of wind wrapped round the pair)
      if (falling) {
        for (let i = 0; i < 5; i++) { const sx = x - 30 + i * 15, sy = y - 60 - ((f * 11 + i * 23) % 70); ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.fillRect(sx, sy, 2, 20); }
        const cols = FOLLOW_COLS.uppercut;
        for (let k = 0; k < 2; k++) {
          ctx.strokeStyle = cols[k]; ctx.lineWidth = 2;
          ctx.beginPath();
          for (let j = 0; j <= 24; j++) {
            const yy = y - 50 + (j / 24) * (eh + 60), a2 = fu.spin * 1.5 + j * 0.55 + k * Math.PI, rx = 26 + j * 0.4;
            const px = x + Math.cos(a2) * rx, py = yy + Math.sin(a2) * 3;
            if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
      }
      // (the pair: going up, one full flip together about where they meet; coming down, the corkscrew)
      const flip = falling ? 0 : 2 * Math.PI * ease(g.t / N_RISE) * d;
      const s = falling ? Math.cos(fu.spin) : 1, dd = (s >= 0 ? d : -d) as 1 | -1;
      const pair = (c: Ctx) => {
        if (e) {
          // (a person upside down, his feet to Meathead's soles; an animal on end head down, its rump to them)
          if (animal(e)) drawOnEnd(c, state, e, x + dd * 3, y + 2 + hangOf(e), (-dd) as 1 | -1, 1, Math.PI, 'neck');
          else drawEnemyAt(c, e, state, x + dd * 3, y + 2, Math.PI, (-dd) as 1 | -1, 'neck');
        }
        const lean = 0.35, hipY = -15;
        sprite(c, x, y, dd, cc => figure(cc, f, { hipY, lean, feet: [[-9, 0], [9, 0]], hands: [toTorso(lean, hipY, 4, -2), toTorso(lean, hipY, 10, -2)], mood: 'roar', look: 0.3 }));
      };
      // (an afterimage or two trailing up behind on the way down)
      if (falling && fu.vy > 6) for (let k = 2; k >= 1; k--) {
        ctx.save(); ctx.globalAlpha = 0.18 * (3 - k);
        ctx.translate(-fu.vx * k * 2, -fu.vy * k * 1.4);
        ctx.translate(x, 0); ctx.scale(Math.max(0.2, Math.abs(Math.cos(fu.spin - k * 0.5))), 1); ctx.translate(-x, 0);
        pair(ctx);
        ctx.restore();
      }
      ctx.save();
      if (flip) { ctx.translate(x, y); ctx.rotate(flip); ctx.translate(-x, -y); }
      ctx.translate(x, 0); ctx.scale(Math.max(0.2, Math.abs(s)), 1); ctx.translate(-x, 0);
      pair(ctx);
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

/** B on its own would kick a head out of the ground now (followIdle's own test): the head, or null. */
const kickReady = (state: GameState) => {
  const p = state.player;
  if (p.inCutscene || p.noSpecials || K.handsOnly(state) || p.health <= 0 || !p.isGrounded || p.isCharging || p.isUppercutting
    || p.isDivekicking || p.lockTimer > 0 || (p.pushbackTimer ?? 0) > 0) return null;
  return headNear(state);
};

/** The piece on him that glints while a follow-up's on offer, from his feet facing right: the sabatons at his boots, the
 *  pauldrons at his shoulder, the armguards at his forearm. */
const GLINT_AT: Record<FollowMove, [number, number]> = { divekick: [5, -4], charge: [6, -50], uppercut: [14, -32] };
/** A four-point glint, pixel-stepped. */
const glint = (c: Ctx, x: number, y: number, r: number, col: string) => {
  x = Math.round(x); y = Math.round(y);
  c.fillStyle = col;
  c.fillRect(x - r, y - 1, r * 2, 2); c.fillRect(x - 1, y - r, 2, r * 2); c.fillRect(x - 2, y - 2, 4, 4);
};

/** The prompt over the world (App's WorldPrompt reads it): which, and where on the screen (game px) off the canvas's own
 *  transform (a zoomed fight's too), kept under the HUD band and on screen. */
const setPrompt = (c: Ctx, pr: { kind: 'kick' | 'follow'; x: number; y: number } | null) => {
  if (!pr || typeof c.getTransform !== 'function' || !c.canvas) { worldPrompt.kind = null; return; }
  const m = c.getTransform(), sx = CANVAS_WIDTH / c.canvas.width, sy = CANVAS_HEIGHT / c.canvas.height;
  worldPrompt.x = Math.max(40, Math.min(CANVAS_WIDTH - 40, (m.a * pr.x + m.c * pr.y + m.e) * sx));
  worldPrompt.y = Math.max(HUD_CLEAR_Y + 30, Math.min(CANVAS_HEIGHT - 24, (m.b * pr.x + m.d * pr.y + m.f) * sy));
  worldPrompt.kind = pr.kind; worldPrompt.at = performance.now();
};

/**
 * Over everything, every frame (grab.ts drawGrab, first): a follow-up on offer (brackets and a glint on the one it'd
 * take in the piece's colors, the piece on him twinkling, the Y + B prompt over them), else a head he could kick (the B
 * prompt over it: the owner's "when near a planted enemy, show a B button prompt"); and a follow-up's start burst.
 */
export const drawFollowCue = (c: Ctx, state: GameState, g: Grab) => {
  const f = state.frame, p = state.player;
  let prompt: { kind: 'kick' | 'follow'; x: number; y: number } | null = null;
  if (burst && (burst.stage !== String(state.stageId) || since(f, burst.at) > 14)) burst = null;
  if (burst) {
    const t = since(f, burst.at), k = t / 14;
    c.save();
    c.globalAlpha = Math.max(0, 1 - k);
    for (const [bx, by, r0] of [[burst.x, burst.y, 12], [burst.ex, burst.ey, 8]]) {
      c.strokeStyle = burst.cols[0]; c.lineWidth = 4; c.beginPath(); c.arc(bx, by, r0 + 56 * k, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = burst.cols[2]; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, Math.max(1, r0 + 56 * k - 6), 0, Math.PI * 2); c.stroke();
    }
    // (a streak of it from him to them, the first frames)
    if (t < 5) { c.strokeStyle = burst.cols[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(burst.x, burst.y); c.lineTo(burst.ex, burst.ey); c.stroke(); }
    c.restore();
  }
  if (g.phase === 'idle' && !p.inCutscene && state.deathTimer <= 0) {
    if (ready && state.enemies.includes(ready.e)) {
      const e = ready.e, cols = FOLLOW_COLS[ready.move], on = f % 6 < 3;
      // (brackets at its corners, flickering)
      const x0 = Math.round(e.pos.x - 6), y0 = Math.round(e.pos.y - 6), x1 = Math.round(e.pos.x + e.width + 6), y1 = Math.round(e.pos.y + e.height + 6), L = 9;
      c.fillStyle = on ? cols[0] : cols[1];
      for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
        c.fillRect(sx > 0 ? cx : cx - L, sy > 0 ? cy : cy - 2, L, 2);
        c.fillRect(sx > 0 ? cx : cx - 2, sy > 0 ? cy : cy - L, 2, L);
      }
      glint(c, e.pos.x + e.width / 2, e.pos.y - 12, on ? 7 : 5, cols[0]);
      // (the piece on him, twinkling)
      const [gx, gy] = GLINT_AT[ready.move];
      glint(c, K.centerX(state) + p.facing * gx, K.feetY(state) + gy, on ? 6 : 4, on ? '#FFFFFF' : cols[0]);
      prompt = { kind: 'follow', x: e.pos.x + e.width / 2, y: e.pos.y - 24 };
    } else {
      const b = kickReady(state);
      if (b) { const hs = headSpot(b, faceOf(state, b)); prompt = { kind: 'kick', x: hs.x, y: hs.y - headOf(b.e).r - 10 }; }
    }
  }
  setPrompt(c, prompt);
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
      // (above the floor; and, a floor you can see under, what comes out the underside of it)
      const under = undersideOf(state, b);
      for (const [top, h] of under === null ? [[b.ground - 600, 600]] : [[b.ground - 600, 600], [under, 600]]) {
      c.save();
      c.beginPath(); c.rect(b.x - 300, top, 600, h); c.clip();
      if (b.mode === 'head') {
        // (digging out: shaking, coming up out of it a little)
        const dig = Math.max(0, (age - (BURIED_FREE - BURIED_DIG)) / BURIED_DIG);
        const shake = dig > 0 ? Math.round(Math.sin(age * 1.7) * (1 + dig * 2)) : 0;
        if (animal(e)) drawOnEnd(c, state, e, b.x + shake, b.ground - headOf(e).r * 0.5 - b.sink * dig * 0.45, face, 1);
        else drawEnemyAt(c, e, state, b.x + shake, b.ground + b.sink * (1 - dig * 0.45), 0, face);
      }
      else {
        // (legs up: twitching a while; its picture baked the once, put down upside down)
        const bk = b.bake ??= bakeEnemyCut(state, e, face, legsCut(e));
        // (an animal on its back: its legs kicking, a fit of it every so often, a little less each time)
        const fit = animal(e) && age % 70 < 14 ? Math.max(0, 1 - age / LEGS_LIFE) : 0, kick = fit ? Math.round(Math.sin(age * 2.3) * 1.5 * fit) : 0;
        c.translate(b.x, b.ground - (e.height - b.sink) + kick); c.rotate(Math.PI + (age < 150 ? Math.sin(age * 0.9) * 0.06 * (1 - age / 150) : 0) + Math.sin(age * 1.9) * 0.05 * fit);
        c.drawImage(bk.cv, bk.x, bk.y, bk.w, bk.h);
      }
      c.restore();
      }
    } else {
      // (the stump: the neck, cut, red in the middle)
      const sx = headSpot(b, face).x;
      c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(sx, b.ground - 2, hd.r * 0.55, 2.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(sx, b.ground - 2.5, hd.r * 0.3, 1.4, 0, 0, Math.PI * 2); c.fill();
    }
    // (the churned dirt round it)
    c.fillStyle = '#4A2F17'; c.beginPath(); c.ellipse(b.mode === 'head' ? headSpot(b, face).x : b.x, b.ground, Math.max(10, hd.r * 1.3), 3.5, 0, 0, Math.PI * 2); c.fill();
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
