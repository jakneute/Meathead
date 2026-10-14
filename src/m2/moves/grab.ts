// Meathead 2's grabs, on top of Meathead 1's moves:
//
// Like a fighting game's grabs: once one's started, he's committed to it.
//
//   BEATDOWN (Y + B, or R): a quick windup (coiled down low), then a short lunge.
//   Catch somebody and he's down, Meathead on top of him, and every press of X, B or Y is a punch, each
//   one giving him a little health back (and a lot when it's over). Jump to get off. Nothing that hurts him knocks him
//   off. Whiff, and he's stood there wide open.
//
//   SHAKEDOWN (Y + X, or T): a quicker windup (hands out for the throat) that nothing stops, and if there's somebody
//   there at the end of it, up by the neck and shaken (nothing stops that either: he takes the hits and carries on);
//   the ammo falls out of him; and at the end he's
//   thrown whichever way's held (left, right, up), into whoever's in the way, or slammed down into the floor (more
//   damage, but nobody else gets hit). He can be grabbed again, as often as you like; only the first time has ammo in him.
//
// While he's at either he's armored, fighting-game style: what hits him (a club, a bullet, a body) still hurts, but
// nothing knocks him back or out of it.
//
// Both work on people and the mid-sized animals (Meathead 2's own robots of that size too: scrap, not gore); the
// little ones (and birds, and whatever swims, or hangs off a branch or a stalk: torn loose) are grabbed one-handed and
// pitched; the big ones and the bosses can't be got hold of (the lunge stops dead against them, the hands close on air).
// Swimming, or hanging off a vine, it's only the one-handed kind (no floor to slam anybody into).

import { pickLine } from '../../m1/game/platform/speech';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import type { Enemy, EnemyKind, WeaponType } from '../../m1/types';
import { isHumanoidKind, drawKindEnemy, kindHead, kindFacing } from '../../m1/game/render/enemies';
import { getEnemyMass } from '../../m1/game/combat/knockback';
import { setArmor } from '../../m1/game/core/resist';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { impactKill, ceilingSplat } from '../../m1/game/enemies/enemies';
import { buffs } from '../../m1/game/core/buffs';
import { playSound } from '../../m1/game/platform/audio';
import { INITIAL_PLAYER_HEALTH } from '../../m1/constants';
import { beginSprite, endSprite } from '../../m1/game/render/player/spriteOutline';
import { drawLeg, drawArmTo, drawTorsoFromHips, drawHead, type Mood } from '../../m1/game/render/player/body';
import { drawPlayer } from '../../m1/game/render/player/player';
import { btn, pressed, pollM2 } from '../input';
import { grabCallout, type GrabCallout } from './callouts';
import { m2Kill } from './killLines';
import { m2Grab, m2Kind } from '../kinds';
import { drawingHeld, type HeldHow } from '../held';
import { isMachineKind } from '../../m1/game/enemies/kinds';
import { markMachineGore } from '../../m1/game/enemies/machineGore';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { enemyGender } from '../../m1/content/gender';
import { meatheadSays } from '../adventure/section';
import { TOO_BIG_LINES, TOO_BIG_BY_KIND, GRAB_IMMUNE_LINES } from '../lines/weaponLines';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------------
// AIR GRAB TUNING: up + Y + B on a pad, W + R on the keyboard. Every number the air grab uses is here.
// (speeds are px per frame, times are frames at 60 a second, angles radians; the engine's gravity is about 0.61 a frame
// on top of the arc's own, and a normal jump goes up at 7)
// ---------------------------------------------------------------------------------------------------------------------
export const AIR_GRAB = {
  /** Wind-up before the launch (a hit in it knocks him out of it, like the beatdown's). */
  WINDUP: 15,
  /** Started in the air: the fastest he sinks through the wind-up (he hangs there, coiled). */
  WINDUP_MAX_FALL: 1.5,
  /** The launch: a little forward, a lot up. */
  LAUNCH_VX: 3.5,
  LAUNCH_VY: 14,
  /** The longest the hands are out on the way up (it's over sooner once he's started falling). */
  LUNGE_FRAMES: 20,
  /** How far the hands reach: ahead of his front, over his head, under his feet (that's what gets ground enemies). */
  REACH_FRONT: 30, REACH_UP: 24, REACH_DOWN: 28,
  /** Caught one: the little hop up together before it all comes down (up speed). */
  ARC_POP: 5,
  /** The arc's own pull down, each frame (on top of the engine's gravity), and the fastest they fall. */
  ARC_GRAV: 0.45, ARC_MAX_FALL: 20,
  /** Sideways speed of each arc: back held (backflip), forward held (dive), nothing held (piledriver). */
  ARC_BACK_VX: 6, ARC_FWD_VX: 9, ARC_DOWN_VX: 0.5,
  /** How fast the sideways speed follows the stick (0..1, a share of the gap each frame). */
  ARC_STEER: 0.2,
  /** Where each arc turns them to (headfirst straight down is PI; the dive stays well short of upside down). */
  BACK_ANGLE: Math.PI, FWD_ANGLE: 1.15, DOWN_ANGLE: Math.PI,
  /** How fast they turn toward it (radians a frame). */
  SPIN: 0.24,
  /** Going at least this fast into a wall or ceiling, the impact happens there (slower, they just stop against it). */
  SPLAT_SPEED: 3,
  /** How far ahead of him the wall check looks (the one he's holding is out in front). */
  WALL_LEAD: 16,
  /** Longest an arc can last before he just lets go (a safety net, shouldn't come up). */
  ARC_MAX_FRAMES: 150,
  /** Impact damage: this share of their max health, times how fast they hit (from MIN_K up to 1 at ARC_MAX_FALL), plus FLAT. */
  DAMAGE_SHARE: 0.6, DAMAGE_FLAT: 10, MIN_K: 0.55,
  /** The same speed factor for a wall or ceiling splat (there's no fall to measure). */
  SPLAT_K: 0.8,
  /** Health back for Meathead on every impact, flat. */
  HEAL: 12,
  /** A survivor bounces off it this fast (away, up), and is dazed this long. */
  BOUNCE_VX: 5, BOUNCE_VY: 7, DAZE: 80,
  /** Meathead's own bounce up off a floor impact, and the frames till he's his own again. */
  SELF_BOUNCE: -7, LAND_FRAMES: 12,
  /** Screen shake on impact: frames, strength. */
  SHAKE_T: 16, SHAKE_POW: 9,
  /** The one he's got, in his arms through the arc: feet this far ahead of and up from his (facing right, unturned). */
  HOLD_X: 26, HOLD_Y: -16,
  /** Bailing out of the arc (jump): his kick off, back and up. */
  BAIL_VX: 3, BAIL_VY: 8,
  /** What they turn about, up from his feet (his middle). */
  PIVOT: 34,
};
const A = AIR_GRAB;

// The beatdown
/** Like a fighting game's grab: once it's going, he's committed. The beatdown's windup is a real one (a quarter second,
 * coiled down low: seen coming, and a hit in it knocks him out of it, it being so strong); the shakedown's is nearly
 * instant, and nothing stops it. */
const WINDUP = 15, LUNGE = 7, LUNGE_SPEED = 21, WHIFF = 22, REACH = 6;
/** How far ahead of him, as he lunges, he can still get hold of somebody. */
const LUNGE_REACH = 20;
/**
 * A punch's damage: the same for everybody, so the tougher he is the more it takes (a shooter about four, a bouncer
 * nine, a wolverine three). Each heals a little, the last a lot.
 */
const PUNCH_DAMAGE = 28, PUNCH_HEAL = 2, KILL_HEAL = 10, PUNCH_FRAMES = 6, PUNCH_GAP = 3;
// The shakedown
/** Thrown, it takes a modest share of him; slammed, a big one. */
/** Each throw's animation: how long, and the frame he lets go on. */
const TOSS: Record<Toss, { len: number; release: number }> = { forward: { len: 16, release: 7 }, back: { len: 24, release: 12 }, up: { len: 16, release: 6 }, down: { len: 18, release: 8 } };
/** A slam's bounce (up, a frame) for Meathead; a suplex's share of who he suplexes. */
/** The up throw's launch (about as far up as the others go along). */
const THROW_UP = 16;
/** The boot's share of him (the forward throw), on top of whatever he hits after. */
const BOOT_SHARE = 0.14;
/** How much what he hits after a boot hurts him, against an up throw's or a suplex's (the boot's done most of it). */
const BOOTED_IMPACT = 0.5;
const SLAM_BOUNCE = -13.5, SUPLEX_SHARE = 0.4;
/** Plummeting together after a grab in the air: how fast it builds and tops out; the beatdown's landing's share of him at full speed. */
const PLUMMET_ACCEL = 0.9, PLUMMET_MAX = 20, PLUMMET_SHARE = 0.55;
/** Frames a grab asked for while he couldn't is kept for. */
const GRAB_BUFFER = 10;
const GRAB_REACH = 64, SHAKE_FRAMES = 44, SHAKE_AMMO = 3, SHAKE_DROP_EVERY = 12, THROW_SPEED = 17, THROW_SHARE = 0.15, SLAM_SHARE = 0.5, GRAB_MISS = 12;
/** How long Y can be held on its own and still count as a tap (its own button: secondary fire), let go of. */
const Y_TAP = 15;
/** How long after a grab he's still armored (nothing knocks him about). */
const CONTACT_GRACE = 30;
/** How near together B (or X) and Y count as pressed together: frames B's held back, waiting for Y. */
const CHORD_WINDOW = 4;

/** The animals that are a handful but not too much. */
const MID_ANIMALS = new Set<EnemyKind>(['wolverine', 'goat', 'gator', 'coyote', 'pitbull']);
/** People who are behind something, up in something, or not there to be grabbed. */
const NOT_PEOPLE = new Set<EnemyKind>(['doorman', 'manhole', 'tenant', 'cardoor', 'jetskier', 'cower']);

/** The little ones (and the birds): grabbed one-handed and pitched, not beaten or shaken (see the 'critter' phase). */
const CRITTERS = new Set<EnemyKind>(['rat', 'crab', 'iguana', 'raccoon', 'armadillo', 'scorpion', 'rattlesnake', 'salamander', 'sludgeling',
  'pigeon', 'seagull', 'pelican', 'eagle', 'vulture', 'hawk', 'grackle']);
/** (Meathead 2's own say what they are: see registerM2Kind's `grab`) */
export const isCritter = (e: Enemy) => !!e.kind && (m2Grab(e) ?? (CRITTERS.has(e.kind) ? 'critter' : null)) === 'critter' && e.health > 0 && !e.isBlownAway && e.type !== 'boss';

// (held by hand isn't held off: the break room's dummies are all puppets, and a cutscene's puppets are out of his reach
// anyway, him being out of his own hands then)
export const grabbable = (e: Enemy) => e.type !== 'boss' && !isMidBoss(e) && e.health > 0 && !e.isBlownAway && !!e.kind
  && (m2Grab(e) ? m2Grab(e) === 'body' : (isHumanoidKind(e.kind) && !NOT_PEOPLE.has(e.kind)) || MID_ANIMALS.has(e.kind));

/** Swimming, or hanging off a vine: only what goes in the one hand (nothing to stand on to beat or shake anybody). */
const handsOnly = (state: GameState) => !!(state.player.swimming || state.player.carried);
/** One he could get hold of right now, the way he is. */
const canGrab = (state: GameState, e: Enemy) => isCritter(e) || (grabbable(e) && !handsOnly(state));

/** Some bite back just for being picked up (a poison frog in his bare hand, a live eel): its own hurt, its own lines. */
const grabbedHurts = (ctx: FrameContext, e: Enemy) => {
  const h = m2Kind(e.kind)?.grabHurts, p = ctx.state.player;
  if (!h || (h.when && !h.when(e)) || (p.invincibilityTimer ?? 0) > 0) return;
  hurtPlayer(ctx, h.dmg, e.kind!, { x: 0, y: 0 }, 0);
};

type Phase = 'idle' | 'windup' | 'lunge' | 'whiff' | 'mount' | 'kill' | 'reach' | 'shake' | 'toss' | 'miss' | 'plummet' | 'drop' | 'critter' | 'pitch' | 'smash'
  // (the air grab: wound up, launched with hands out, the arc down with one in his arms, the impact)
  | 'awind' | 'alunge' | 'aarc' | 'aland';
/** The air grab's arc: back held (a backflip), forward held (a dive), nothing (a piledriver straight down). */
type Arc = 'back' | 'fwd' | 'down';
/** Which throw: on the way he's facing, back (a suplex), straight up, or slammed down. */
type Toss = 'forward' | 'back' | 'up' | 'down';

export interface Grab {
  phase: Phase;
  t: number;
  dir: 1 | -1;
  held: Enemy | null;
  /** Frames into the punch being thrown (counts down), and when the next can start. */
  punchT: number;
  /** Punches thrown this beatdown (they come left, right, left...). */
  punchN: number;
  /** Ammo still to come out of whoever he's shaking. */
  ammoLeft: number;
  nextPunchAt: number;
  /** His health last frame (anything taking it off him breaks a grab). */
  hp: number;
  /** Y: how long it's been held, and whether it went into a grab while it was. */
  yHeld: number;
  yChord: boolean;
  /** B or X pressed without Y: held back a moment in case Y comes with it (pressed together, near enough). */
  pend: { k: 'b' | 'x'; t: number } | null;
  /** A grab asked for while he couldn't (mid-charge, knocked back): kept a few frames and started the moment he can. */
  queued: { want: 'beat' | 'shake' | 'air'; t: number } | null;
  /** Air grab used: no charge moves (charge, slide, uppercut, dive kick) till he's back on the ground. */
  airLock: boolean;
  /** ...except the dive kick, after one that caught nobody. */
  diveOk: boolean;
  /** Jump held last frame in the air grab's arc (a fresh press bails out of it). */
  arcJump: boolean;
  /** The air grab's arc: which way it's steered, how far he's turned, how fast they're going, where it hit. */
  arc: Arc;
  ang: number;
  avx: number;
  avy: number;
  hitAt: { x: number; y: number } | null;
  /** His health as the beatdown's windup began (less, and it's off). */
  windHp: number;
  /** His knockback last frame, and how long what's left of it is from bumping into somebody (a grab beats that). */
  pb: number;
  /** Missed a grab in the air: none again till he's landed. */
  airSpent: boolean;
  bumpT: number;
  /** The controls last frame (to catch presses). */
  was: Controls;
  /** Shaken down already: no more ammo in them (they can still be grabbed and thrown again). */
  shaken: WeakSet<Enemy>;
  /** The throw he's doing at the end of a shakedown, and who's just gone flying from it (not held back by keepClear). */
  toss: Toss;
  thrown: Enemy | null;
  /** Bodies he's thrown, still flying: who each has hit already (once each), and how long it's been going. */
  flying: { e: Enemy; hit: Set<string>; t: number; fall: number; still: number; how: GrabCallout; oneChunk: boolean; impact: number }[];
  /** Which way a critter was pitched. */
  pitch: 'left' | 'right' | 'up' | 'down';
  /** Which way a critter held up is aimed right now (null: no direction held). */
  aim: 'left' | 'right' | 'up' | 'down' | null;
  /** The fastest they've come down, plummeting together (for how hard they land). */
  fall: number;
  /** Frames body contact still can't hurt him (a grab's on, or just finished). */
  clearT: number;
  /** Small fry near him made harmless to bump into while he grabs one (and a moment after): back as they were after. */
  calmed: Set<Enemy>;
  /** Buttons still held from the grab (the last punch): they don't start a charge or a shot till they're let go. */
  gate: Set<keyof Controls>;
}

export const createGrab = (state: GameState): Grab => ({
  phase: 'idle', t: 0, dir: 1, held: null, punchT: 0, punchN: 0, ammoLeft: 0, nextPunchAt: 0, hp: state.player.health, yHeld: 0, yChord: false, was: { ...NO_CONTROLS }, shaken: new WeakSet(), gate: new Set(), pend: null, clearT: 0, calmed: new Set(), toss: 'forward', thrown: null, flying: [], fall: 0, pitch: 'right', aim: null, queued: null, windHp: 0, pb: 0, bumpT: 0, airSpent: false,
  airLock: false, diveOk: false, arcJump: true, arc: 'down', ang: 0, avx: 0, avy: 0, hitAt: null,
});

const feetY = (state: GameState) => state.player.pos.y + state.player.height;
const centerX = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** Into the wall? (the lunge stops at one) */
/** Something solid he'd be in at x (a wall, the side of a ledge; not what he's standing on, nor a one-way platform). */
const solidAt = (state: GameState, x: number) => {
  const p = state.player;
  return state.blocks.find(b => !b.oneWay && b.type !== 'pit' && x < b.x + b.w && x + p.width > b.x && p.pos.y + 4 < b.y + b.h && p.pos.y + p.height - 4 > b.y);
};
const walled = (state: GameState, x: number) => !!solidAt(state, x);
/** The nearest solid thing between his front and the point `to` (world x), at his height: a wall, a column, a beam.
 *  Nothing reaches, grabs or lunges through one. */
const wallBetween = (state: GameState, to: number) => {
  const p = state.player, mid = p.pos.x + p.width / 2;
  const a = Math.min(mid, to), b = Math.max(mid, to);
  let best: { x: number; w: number } | null = null, bestD = Infinity;
  for (const k of state.blocks) {
    if (k.oneWay || k.type === 'pit' || k.x >= b || k.x + k.w <= a) continue;
    if (!(p.pos.y + 4 < k.y + k.h && p.pos.y + p.height - 4 > k.y)) continue;
    // (one he's already standing in doesn't count: that's the floor's business)
    if (k.x < mid && k.x + k.w > mid) continue;
    const d = to > mid ? k.x - mid : mid - (k.x + k.w);
    if (d < bestD) { bestD = d; best = k; }
  }
  return best;
};
/** Can he get at this one without anything solid in between? */
const clearTo = (state: GameState, e: Enemy) => !wallBetween(state, e.pos.x + e.width / 2);
/** Puts him at x, or as near it as he'll go without being inside anything solid (backed out the way he came). */
const placeAt = (state: GameState, x: number, from: number) => {
  const p = state.player;
  const b = solidAt(state, x);
  if (!b) { p.pos.x = x; return; }
  p.pos.x = from <= x ? b.x - p.width : b.x + b.w;
  if (solidAt(state, p.pos.x)) p.pos.x = from;
};

/** Back on its feet in the world (let go of, still alive): a moment to get its wits back. */
/** Back into the world, but never inside anything solid: set down against it, on his side of it. */
const release = (state: GameState, e: Enemy) => {
  const mid = centerX(state);
  for (let k = 0; k < 2; k++) {
    const b = state.blocks.find(b => !b.oneWay && b.type !== 'pit' && e.pos.x < b.x + b.w && e.pos.x + e.width > b.x && e.pos.y + 4 < b.y + b.h && e.pos.y + e.height - 4 > b.y);
    if (!b) break;
    e.pos.x = mid < b.x + b.w / 2 ? b.x - e.width : b.x + b.w;
    if (Math.sign(e.vel.x) === Math.sign(b.x + b.w / 2 - mid)) e.vel.x = 0;
  }
  state.enemies.push(e);
};

const putBack = (state: GameState, e: Enemy, x: number) => {
  e.pos = { x: x - e.width / 2, y: feetY(state) - e.height };
  e.vel = { x: 0, y: 0 };
  e.rotation = 0;
  e.pauseTimer = Math.max(e.pauseTimer || 0, 26);
  release(state, e);
};

const GATED: (keyof Controls)[] = ['special', 'shoot', 'secondary', 'charge'];
const end = (state: GameState, g: Grab) => {
  g.phase = 'idle'; g.t = 0; g.held = null; g.punchT = 0; g.ammoLeft = 0;
  for (const k of GATED) g.gate.add(k);
  state.player.hidden = false;
};

/** Lets go of whoever he's got (he got hurt, or jumped off), alive. */
const letGo = (state: GameState, g: Grab, toss = false) => {
  const e = g.held;
  if (e) putBack(state, e, g.phase === 'mount' ? centerX(state) + g.dir * 18 : centerX(state) + g.dir * 30);
  // (jumped off a beatdown: he's sent up in the air again)
  if (e && toss) { e.vel = { x: g.dir * 2, y: -10 }; e.pauseTimer = Math.max(e.pauseTimer || 0, 40); }
  end(state, g);
};

/** Somebody the grabs don't work on: a boss, a mid-boss, a machine, an animal far too big, a person they're no good on. */
const tooBigAnimal = (e: Enemy | null) => !!e && e.health > 0 && !e.isBlownAway && !e.innocent && !isCritter(e) && !grabbable(e);
/** ...and he says so (not every time), by what it is. */
let tooBigAt = -9999;
const tooBig = (state: GameState, e: Enemy) => {
  if (state.frame - tooBigAt < 150) return;
  tooBigAt = state.frame;
  const own = (e.kind && TOO_BIG_BY_KIND[e.kind]) || [];
  const general = e.type === 'boss' || isMidBoss(e) ? GRAB_IMMUNE_LINES.boss
    : isMachineKind(e.kind) || !!m2Kind(e.kind)?.robot ? GRAB_IMMUNE_LINES.machine
    : enemyGender(e) === 'n' ? TOO_BIG_LINES : GRAB_IMMUNE_LINES.person;
  const pool = own.length && Math.random() < 0.7 ? own : general;
  meatheadSays(state, pickLine(pool), false);
};

/** The nearest one he could get his hands on, in front of him, within `reach` of his front (`any`: whether he could or not). */
const inReach = (state: GameState, dir: number, reach: number, any = false) => {
  const p = state.player;
  const front = dir > 0 ? p.pos.x + p.width : p.pos.x;
  let best: Enemy | null = null, bestD = Infinity;
  const mid = p.pos.x + p.width / 2;
  for (const e of state.enemies) {
    const critter = isCritter(e);
    if (any ? e.health <= 0 || e.isBlownAway || e.innocent : !canGrab(state, e)) continue;
    // (forgiving up and down: somebody just landing from a throw, still bouncing, is in reach; a bird a good way up too)
    const slack = critter ? 60 : 24;
    if (e.pos.y > p.pos.y + p.height + slack || e.pos.y + e.height < p.pos.y - slack) continue;
    const near = dir > 0 ? e.pos.x - front : front - (e.pos.x + e.width);
    // (anybody from right up against him, even a little behind his middle, out to the reach)
    const behind = dir > 0 ? mid - 16 - (e.pos.x + e.width) : e.pos.x - (mid + 16);
    if (near > reach || behind > 0) continue;
    if (!clearTo(state, e)) continue;
    if (Math.abs(near) < bestD) { bestD = Math.abs(near); best = e; }
  }
  return best;
};

/**
 * The first body in the way of this frame's lunge: anything whose box crosses the stretch from his front now to his
 * front a frame on (plus the lunge's reach), at his height (a bird a bit above or below too). Nearest first.
 */
const lungeHits = (state: GameState, dir: number) => {
  const p = state.player;
  const front = dir > 0 ? p.pos.x + p.width : p.pos.x;
  const a = Math.min(front, front + dir * (LUNGE_SPEED + LUNGE_REACH)), b = Math.max(front, front + dir * (LUNGE_SPEED + LUNGE_REACH));
  const mid = p.pos.x + p.width / 2;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent) continue;
    const slack = isCritter(e) ? 60 : 12;
    if (e.pos.y > p.pos.y + p.height + slack || e.pos.y + e.height < p.pos.y - slack) continue;
    // (anything whose near side is in the stretch, or that he's already partly into, ahead of his middle)
    const near = dir > 0 ? e.pos.x : e.pos.x + e.width;
    const ahead = dir > 0 ? e.pos.x + e.width > mid : e.pos.x < mid;
    const inSpan = (near >= a && near <= b) || (ahead && e.pos.x < b && e.pos.x + e.width > a);
    if (!inSpan || !clearTo(state, e)) continue;
    const d = Math.abs(near - front);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

const take = (state: GameState, e: Enemy) => { e.wasGrabbed = true; state.enemies = state.enemies.filter(o => o !== e); };

/**
 * While he's busy with one, nobody else crowds in on him or stands on him. Anyone who runs at him (to hit him, to
 * charge him) goes on through: they come out the other side of him, a little clear, turned round, and wait a bit
 * before they come at him again. Whatever's just standing about up against him is moved back out to its own side.
 */
const CLEAR_GAP = 18, REGROUP = 50;
const PRE_GRAB = new Set<Phase>(['windup', 'lunge', 'reach', 'whiff', 'miss', 'awind', 'alunge']);
const keepClear = (state: GameState, g: Grab) => {
  const p = state.player, cx = centerX(state), half = p.width / 2 + CLEAR_GAP;
  for (const e of state.enemies) {
    if (e === g.held || e === g.thrown || e.health <= 0 || e.isBlownAway || e.type === 'boss') continue;
    const ex = e.pos.x + e.width / 2;
    if (Math.abs(ex - cx) >= half + e.width / 2) continue;
    if (e.pos.y > p.pos.y + p.height || e.pos.y + e.height < p.pos.y - 40) continue;
    const side = ex < cx ? -1 : ex > cx ? 1 : -g.dir;
    // (coming at him: through and out the far side, turned round, waiting a moment; otherwise just back out)
    const charging = Math.sign(e.vel.x) === -side && Math.abs(e.vel.x) > 1;
    const out = charging ? -side : side;
    e.pos.x = cx + out * (half + e.width / 2) - e.width / 2;
    e.vel.x = 0;
    if (e.vel.y < 0 && e.pos.y + e.height < p.pos.y + p.height) e.vel.y = 0;
    if (charging) { e.facing = (-out) as 1 | -1; e.pauseTimer = Math.max(e.pauseTimer || 0, REGROUP); }
    else e.pauseTimer = Math.max(e.pauseTimer || 0, 3);
  }
};

/** While a grab's on, everyone shooting at him does it at a bit over half the rate (it's less of a firing squad; still not safe). */
const GRAB_FIRE_SLOW = 0.45;
const easeOff = (state: GameState, g: Grab) => {
  for (const e of state.enemies) if (e !== g.held && e.health > 0 && !e.isBlownAway && e.shootTimer > 0) e.shootTimer -= GRAB_FIRE_SLOW;
};

/** Sets a thrown body (alive) flying into whoever's in the way (the engine's own body-into-body shove is held off it). */
/**
 * `oneChunk`: the floor's already had him (the suplex): coming down again after doesn't hurt, flying into somebody does.
 * `impact`: how much what he hits hurts him (less after a boot).
 */
const fly = (g: Grab, e: Enemy, how: GrabCallout = 'thrown', oneChunk = false, impact = 1) => {
  g.flying.push({ e, hit: new Set([e.id]), t: 0, fall: 0, still: 0, how, oneChunk, impact });
  e.enemyCollisionCooldown = FLY_FRAMES * 2;
};
const FLY_FRAMES = 70;
/** How long one who's lived through being thrown is dazed for, once he's down. */
const THROW_STUN = 70;
/** A body he's thrown takes out whoever it flies into, by its weight and speed, and knocks them on the way it's going. */
const flyInto = (ctx: FrameContext, g: Grab) => {
  const { state, fx } = ctx;
  g.flying = g.flying.filter(fl => {
    const e = fl.e;
    fl.t++;
    const speed = Math.hypot(e.vel.x, e.vel.y);
    if (e.isBlownAway || e.health <= 0) { e.enemyCollisionCooldown = 0; return false; }
    // Into a wall: splatted on it, hard (killed, he slides down it)
    if (wallSplat(ctx, e) || ceilingBonk(ctx, e)) { e.enemyCollisionCooldown = 0; return !e.isBlownAway && e.health > 0; }
    catchOnFloor(state, e);
    // Coming down: the floor's what hurts him, by how hard he hits it
    if (fl.fall > 2 && e.vel.y <= 0.5 && !fl.oneChunk) {
      hurtThrown(ctx, fl, Math.max(4, Math.round(e.maxHealth * THROW_SHARE * fl.impact * Math.max(0.6, Math.min(1.8, fl.fall / 9)))));
      playSound('thud', 1, -3); shakeScreen(state, 6, 4);
      fl.fall = 0;
    }
    if (e.vel.y > 0) fl.fall = e.vel.y;
    // Down and stopped, still alive: seeing stars a moment
    // (stopped for a few frames running: down; a moment's stillness at the top of a throw up doesn't count)
    fl.still = speed < 1.5 && fl.fall === 0 ? fl.still + 1 : 0;
    if (fl.t > FLY_FRAMES * 2 || (fl.t > 6 && fl.still > 5)) { e.enemyCollisionCooldown = 0; e.vel.x = 0; e.pauseTimer = Math.max(e.pauseTimer || 0, THROW_STUN); return false; }
    for (const o of state.enemies) {
      if (o === e || fl.hit.has(o.id) || o.health <= 0 || o.isBlownAway || o.type === 'boss' || o.innocent) continue;
      if (o.pos.x > e.pos.x + e.width || o.pos.x + o.width < e.pos.x || o.pos.y > e.pos.y + e.height || o.pos.y + o.height < e.pos.y) continue;
      fl.hit.add(o.id);
      // (by how heavy the body is and how fast it's going: a bouncer through a wolverine doesn't leave a wolverine)
      const dmg = Math.round(Math.max(10, Math.min(160, speed * getEnemyMass(e) / 28)));
      o.health -= dmg;
      const dir = Math.sign(e.vel.x) || g.dir;
      fx.spawnDamageNumber(o.pos, dmg, dmg > 30);
      fx.spawnExplosion({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 }, '#8B0000', 6 + Math.min(12, Math.round(dmg / 5)), 0, 8);
      playSound('thud'); shakeScreen(state, 6, 4);
      const push = Math.max(0.3, Math.min(1.6, getEnemyMass(e) / getEnemyMass(o)));
      if (o.health <= 0) {
        // (sent the way the body was going: on along the floor, or, from an alley-oop going up, up with it)
        fx.blowAwayEnemy(o, { x: e.vel.x * 0.7 * push + dir * 4, y: Math.min(-6, e.vel.y * 0.8 * push) }, m2Kill('throw_kill'), dir);
        o.meleeFlung = true;
        fx.spawnKillCallout(o, 'crush');
      } else {
        o.vel = { x: e.vel.x * 0.6 * push, y: Math.min(o.vel.y, -3, e.vel.y * 0.65 * push) };
        o.pauseTimer = Math.max(o.pauseTimer || 0, 30);
      }
      // (and the one thrown takes it too, and loses some of his way)
      hurtThrown(ctx, fl, Math.round(dmg * 0.6 * fl.impact));
      e.vel.x *= 0.75;
      if (e.health <= 0) break;
    }
    return true;
  });
};

/**
 * A thrown (or booted) body flying into a wall: the side of anything solid, not the floor under it. Going at it hard,
 * he's splatted on it (half of him and more, the faster he's going the more; with the landing, it finishes most); slower, he just stops
 * against it. Never through it. True if he hit one.
 */
const WALL_SHARE = 0.45, WALL_SHARE_PER_SPEED = 0.035, WALL_SPLAT_SPEED = 3;
const wallSplat = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  const vx = e.vel.x;
  if (Math.abs(vx) < 0.5) return false;
  // (where he'll be next frame, swept from where he is: caught before the engine's own, lighter, wall knock gets him)
  const mid = e.pos.x + e.width / 2, x0 = Math.min(e.pos.x, e.pos.x + vx), x1 = Math.max(e.pos.x, e.pos.x + vx) + e.width;
  const wall = state.blocks.find(b => !b.oneWay && b.type !== 'pit' && b.type !== 'door'
    && x0 < b.x + b.w && x1 > b.x && e.pos.y + 6 < b.y + b.h && e.pos.y + e.height - 6 > b.y
    && !(mid > b.x && mid < b.x + b.w));
  if (!wall) return false;
  const dir = Math.sign(vx);
  e.pos.x = dir > 0 ? wall.x - e.width : wall.x + wall.w;
  if (Math.abs(vx) < WALL_SPLAT_SPEED) { e.vel.x = 0; return true; }
  const dmg = Math.round(Math.max(30, e.maxHealth * Math.min(1, WALL_SHARE + WALL_SHARE_PER_SPEED * Math.abs(vx))));
  const at = { x: dir > 0 ? wall.x : wall.x + wall.w, y: e.pos.y + e.height / 2 };
  playSound('splat'); playSound('thud', 1.2, -5); shakeScreen(state, 10, 6);
  fx.spawnExplosion(at, '#8B0000', 14, -dir * 4, 10);
  e.health -= dmg;
  if (e.health <= 0) { e.vel.x = 0; impactKill(ctx, e, 'wallsplat', -dir); fx.speakVulgarity(m2Kill('throw_kill')); return true; }
  fx.spawnDamageNumber(e.pos, dmg, true);
  // (off it again, a little way, and down)
  e.vel = { x: -dir * 2, y: Math.min(e.vel.y, -2) };
  e.pauseTimer = Math.max(e.pauseTimer || 0, THROW_STUN);
  return true;
};

/**
 * The same going up into a ceiling (the underside of anything solid over him): swept a frame ahead, so a body going up
 * fast never ends up through it and on top; splatted on it, hard, by how fast (killed, he's stuck up there, dripping),
 * or just stopped under it, slow. True if he hit one.
 */
const ceilingBonk = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  const vy = e.vel.y;
  if (vy > -0.5) return false;
  const top = e.pos.y + vy;
  const ceil = state.blocks.find(b => !b.oneWay && b.type !== 'pit' && b.type !== 'door'
    && e.pos.x + 6 < b.x + b.w && e.pos.x + e.width - 6 > b.x
    && b.y + b.h <= e.pos.y + 2 && b.y + b.h > top);
  if (!ceil) return false;
  e.pos.y = ceil.y + ceil.h;
  if (-vy < WALL_SPLAT_SPEED) { e.vel.y = 0.5; return true; }
  const dmg = Math.round(Math.max(30, e.maxHealth * Math.min(1, WALL_SHARE + WALL_SHARE_PER_SPEED * -vy)));
  playSound('splat'); playSound('thud', 1.2, -5); shakeScreen(state, 10, 6);
  e.health -= dmg;
  if (e.health <= 0) { e.health = 0; e.vel = { x: 0, y: 0 }; ceilingSplat(ctx, e, e.pos.y); fx.speakVulgarity(m2Kill('throw_kill')); return true; }
  fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y }, '#8B0000', 14, 0, 10);
  fx.spawnDamageNumber(e.pos, dmg, true);
  // (back down off it)
  e.vel = { x: e.vel.x * 0.5, y: 2 };
  e.pauseTimer = Math.max(e.pauseTimer || 0, THROW_STUN);
  return true;
};

/**
 * And coming down, however fast (spiked, slammed, dropped from way up): swept a frame ahead too, so he lands on the
 * floor (a platform he'd stand on included), never through it. Put right on it, still coming down: the engine lands
 * him there, and the landing's hurt is flyInto's, by how hard.
 */
const catchOnFloor = (state: GameState, e: Enemy) => {
  const vy = e.vel.y;
  if (vy <= 0) return;
  const feet = e.pos.y + e.height;
  const floor = state.blocks.find(b => b.type !== 'pit' && b.type !== 'door'
    && e.pos.x + 6 < b.x + b.w && e.pos.x + e.width - 6 > b.x
    && b.y >= feet - 2 && b.y <= feet + vy);
  if (floor) e.pos.y = floor.y - e.height;
};

/** The one he's thrown, hurt by what he's hit; a hit that finishes him sends him on his way, the grab's kill. */
const hurtThrown = (ctx: FrameContext, fl: { e: Enemy; how: GrabCallout }, dmg: number) => {
  const { fx } = ctx, e = fl.e;
  e.health -= dmg;
  if (e.health > 0) { fx.spawnDamageNumber(e.pos, dmg, dmg > 30); return; }
  fx.blowAwayEnemy(e, { x: e.vel.x * 0.6, y: Math.min(-4, e.vel.y) }, m2Kill('throw_kill'), Math.sign(e.vel.x) || 1);
  e.meleeFlung = true;
  fx.spawnKillCallout(e, grabCallout(fl.how));
};

/** Runs the grabs. Returns the controls the rest of him gets (none while he's busy). */
/** Is a grab on (or Y's being held toward one)? For the weapons that use Y themselves, so they keep out of its way. */
let busy = false;
export const grabBusy = () => busy;
/** Who he's got hold of right now (nobody else gets to eat him). */
let holding: Enemy | null = null;
export const grabHolding = () => holding;
export const updateGrab = (ctx: FrameContext, g: Grab, controls: Controls): Controls => {
  const out = stepGrab(ctx, g, controls);
  busy = g.phase !== 'idle' || g.yChord;
  holding = g.held;
  // (a machine in his hands is out of the enemy list: what comes off it, punched, shaken, smashed, is scrap all the same)
  if (g.held && isMachineKind(g.held.kind)) { const p = ctx.state.player; markMachineGore(ctx.state, p.pos.x - 70, p.pos.y - 70, p.width + 140, p.height + 80, 30); }
  // (a thrown body's hits first: whoever's where it's landing gets it before they're moved out of his way)
  if (g.flying.length) flyInto(ctx, g);
  // (only once he's got hold of somebody: before that, whoever he's going for has to stay where he can get them)
  if (g.phase !== 'idle') { if (!PRE_GRAB.has(g.phase)) keepClear(ctx.state, g); easeOff(ctx.state, g); }
  // (armor, fighting-game style: through a grab, and for a moment after, with whoever he's just put down still at his
  // feet, anything that hits him hurts him, but nothing knocks him about or out of what he's doing)
  // (not in the beatdown's windup: that's open, a hit knocks him out of it, back as it would)
  if (g.phase !== 'idle' && g.phase !== 'windup' && g.phase !== 'awind') g.clearT = CONTACT_GRACE; else if (g.clearT > 0) g.clearT--;
  setArmor(g.clearT > 0);
  // (going for a critter, holding one, pitching one: the little things right by him don't hurt just for touching him,
  // or snatching one up would cost a bite most times; back to themselves once it's over)
  const p = ctx.state.player, cx = p.pos.x + p.width / 2;
  if (g.clearT > 0) {
    for (const e of ctx.state.enemies) {
      if (e.harmless || !isCritter(e) || Math.abs(e.pos.x + e.width / 2 - cx) > 90 || Math.abs(e.pos.y + e.height / 2 - (p.pos.y + p.height / 2)) > 90) continue;
      e.harmless = true; g.calmed.add(e);
    }
  } else if (g.calmed.size) { for (const e of g.calmed) e.harmless = false; g.calmed.clear(); }
  return out;
};

const stepGrab = (ctx: FrameContext, g: Grab, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  pollM2(state.frame);
  const was = g.was;
  g.was = controls;
  g.hp = p.health;
  const press = (k: keyof Controls) => !!controls[k] && !was[k];
  if (state.deathTimer > 0 || p.health <= 0) { if (g.phase !== 'idle') letGo(state, g); return controls; }
  g.t++;
  const hold = () => { p.vel.x = 0; return { ...NO_CONTROLS }; };

  switch (g.phase) {
    case 'idle': {
      // (whatever was being pressed as the grab ended, still held: nothing till it's let go)
      if (g.gate.size) {
        const c = { ...controls };
        for (const k of [...g.gate]) { if (controls[k]) c[k] = false as never; else g.gate.delete(k); }
        controls = c;
      }
      let out = controls;
      // Y on its own is a button of its own (secondary fire) on a tap; held, it's half of a grab
      const y = btn('y');
      let want: 'beat' | 'shake' | null = pressed('beatKey') ? 'beat' : pressed('shakeKey') ? 'shake' : null;
      // B or X first, on its own: held back a few frames for Y (a grab's two buttons are never quite together);
      // no Y, and it goes through as itself (its charge, its shot), a moment late
      if (!y && !g.pend) { if (pressed('b')) g.pend = { k: 'b', t: 0 }; else if (pressed('x')) g.pend = { k: 'x', t: 0 }; }
      if (g.pend) {
        const ctl = g.pend.k === 'b' ? 'special' : 'shoot';
        if (y) { if (!want) want = g.pend.k === 'b' ? 'beat' : 'shake'; g.pend = null; }
        else if (++g.pend.t > CHORD_WINDOW) { out = { ...out, [ctl]: true }; g.pend = null; }
        else out = { ...out, [ctl]: false };
      }
      // Y first (or both on the one frame), then B or X
      if (!want && y && pressed('b')) want = 'beat';
      if (!want && y && pressed('x')) want = 'shake';
      if (y) {
        g.yHeld++;
        out = { ...out, special: false, shoot: false, secondary: false };
      } else if (g.yHeld > 0) {
        if (!g.yChord && g.yHeld < Y_TAP) out = { ...out, secondary: true };
        g.yHeld = 0; g.yChord = false;
      }
      // (on the ground or in the air: up there, he and whoever he gets hold of come down together). Bumped back by
      // somebody he's touching: a grab beats that (it's the body he's after); knocked back by anything else, not till
      // it's over. Asked for when he can't: kept a few frames, and it goes the moment he can
      const pb = p.pushbackTimer ?? 0;
      if (pb > g.pb && state.enemies.some(e => canGrab(state, e) && e.pos.x < p.pos.x + p.width + 12 && e.pos.x + e.width > p.pos.x - 12 && e.pos.y < p.pos.y + p.height + 12 && e.pos.y + e.height > p.pos.y - 12)) g.bumpT = pb;
      else if (g.bumpT > 0) g.bumpT--;
      g.pb = pb;
      const touching = pb > 0 && g.bumpT > 0;
      if (p.isGrounded || handsOnly(state)) g.airSpent = false;
      const free = !g.airSpent && !p.isCharging && !p.isSliding && !p.isUppercutting && !p.isDivekicking && !p.inCutscene && !p.noSpecials && (!(p.pushbackTimer && p.pushbackTimer > 0) || touching);
      // (up held with the beatdown's buttons: the air grab instead)
      let wantNow: 'beat' | 'shake' | 'air' | null = want;
      if (want === 'beat' && controls.up && !handsOnly(state)) wantNow = 'air';
      if (wantNow) g.queued = { want: wantNow, t: 0 };
      else if (g.queued && ++g.queued.t > GRAB_BUFFER) g.queued = null;
      // (an air grab's been used: no charge moves till he's down again)
      if (g.airLock && (p.isGrounded || handsOnly(state))) g.airLock = false;
      // (whiffed it: the dive kick's still there on the way down, down + B; nothing else)
      if (g.airLock) out = g.diveOk && out.down && !p.isGrounded ? { ...out, charge: false } : { ...out, special: false, charge: false };
      if (!g.queued || !free) return out;
      const go = g.queued.want; g.queued = null;
      if (touching) { p.pushbackTimer = 0; p.vel.x = 0; }
      if (y) g.yChord = true;
      g.dir = p.facing; g.t = 0;
      if (go === 'air') {
        // Engaged: whatever power he had's gone, and no charge moves till he lands
        g.phase = 'awind'; g.windHp = p.health; g.airLock = true; g.diveOk = false; p.power = 0; p.powerLocked = true; g.hitAt = null;
        playSound('snort', 0.9, -8);
        return airHold(state);
      }
      if (go === 'beat') {
        g.phase = 'windup'; g.windHp = p.health;
        playSound('snort', 0.8, -4);
        return hold();
      }
      g.phase = 'reach';
      playSound('whoosh', 0.6, 3);
      return hold();
    }

    case 'awind':
      // Coiled for it (hanging, in the air): he takes a hit and goes anyway (no knocking him out of this one)
      p.power = 0;
      if (g.t >= A.WINDUP) {
        // Launched: a little forward, a lot up, hands out
        g.phase = 'alunge'; g.t = 0; g.avx = g.dir * A.LAUNCH_VX;
        p.vel.y = -A.LAUNCH_VY; p.isGrounded = false; p.jumpHoldTimer = 0;
        playSound('whoosh', 1, -4); playSound('jump', 0.9, -3);
        return airHold(state, false);
      }
      return airHold(state);

    case 'alunge': {
      p.power = 0; p.vel.x = 0; p.jumpHoldTimer = 0;
      // (forward, never through a wall)
      const nx = p.pos.x + g.avx, w = wallBetween(state, g.avx > 0 ? nx + p.width : nx);
      if (w) { p.pos.x = g.avx > 0 ? w.x - p.width : w.x + w.w; g.avx = 0; } else if (!walled(state, nx)) p.pos.x = nx;
      const hit = airReach(state, g.dir);
      if (hit && !canGrab(state, hit)) {
        // (a boss, something far too big: the hands close on nothing, and down he comes)
        playSound('thud', 0.8, -4); shakeScreen(state, 4, 3);
        if (tooBigAnimal(hit) || hit.type === 'boss' || isMidBoss(hit)) tooBig(state, hit);
        g.airSpent = true; g.diveOk = true; p.vel.y = Math.max(p.vel.y, 0); end(state, g);
        return { ...NO_CONTROLS };
      }
      if (hit) {
        // Got him: a hop up together, then the arc down
        g.phase = 'aarc'; g.t = 0; g.held = hit; take(state, hit); g.fall = 0; g.ang = 0; g.arc = 'down'; g.arcJump = true;
        g.avy = Math.min(p.vel.y, -A.ARC_POP);
        hit.facing = (-g.dir) as 1 | -1;
        playSound('punch', 1, -4); playSound('slam', 0.6, 4); shakeScreen(state, 6, 4);
        grabbedHurts(ctx, hit);
        return airArc(ctx, g, controls);
      }
      // Nobody: it's over once he's on the way down (falling as normal, no charge moves till he lands)
      if (g.t >= A.LUNGE_FRAMES || (g.t > 3 && (p.vel.y >= 0 || p.isGrounded))) {
        g.airSpent = !p.isGrounded; g.diveOk = true; end(state, g); playSound('whoosh', 0.5, 6);
        return { ...NO_CONTROLS };
      }
      return { ...NO_CONTROLS };
    }

    case 'aarc':
      return airArc(ctx, g, controls);

    case 'aland':
      p.vel.x = 0;
      if (g.t >= A.LAND_FRAMES) end(state, g);
      return { ...NO_CONTROLS };

    case 'reach': {
      // Hands out for his throat: committed (whatever hits him, he takes it, and keeps coming); anybody who comes into
      // reach while they're going out is got hold of then and there
      const e = inReach(state, g.dir, GRAB_REACH);
      if (!e) {
        if (g.t >= REACH) {
          g.phase = 'miss'; g.t = 0; playSound('whoosh', 0.5, 6);
          // (hands out at something far too big to get hold of)
          const big = inReach(state, g.dir, GRAB_REACH, true);
          if (tooBigAnimal(big)) tooBig(state, big!);
        }
        return hold();
      }
      if (isCritter(e)) return grabCritter(ctx, g, e, hold);
      // Got him: up by the neck (in the air: down they both come first, no harm in the landing for him)
      g.phase = p.isGrounded ? 'shake' : 'drop'; g.t = 0; g.held = e; g.thrown = null; take(state, e); g.fall = 0;
      e.facing = (-g.dir) as 1 | -1;
      playSound('punch', 0.8, 4);
      return hold();
    }

    case 'windup':
      // Coiled up for it, half a second: hurt in that time, and he's knocked out of it (the hit's own knockback goes)
      if (p.health < g.windHp) { end(state, g); playSound('thud', 0.5, 4); return controls; }
      if (g.t >= WINDUP) { g.phase = 'lunge'; g.t = 0; playSound('whoosh', 1, -2); }
      return hold();

    case 'lunge': {
      // (in the air, he holds his height through it)
      if (!p.isGrounded) p.vel.y = Math.min(p.vel.y, 0);
      // Swept, not stepped: the first body anywhere along this frame's stretch of it stops him there, right up against
      // it (at this speed he'd otherwise go clean through one between frames); one he can't grab, and he's stopped dead
      const hit = lungeHits(state, g.dir);
      if (hit && !canGrab(state, hit)) {
        placeAt(state, g.dir > 0 ? hit.pos.x - p.width : hit.pos.x + hit.width, p.pos.x);
        g.phase = 'whiff'; g.t = 0; playSound('thud', 0.8, -4); shakeScreen(state, 4, 3);
        if (tooBigAnimal(hit)) tooBig(state, hit);
        return hold();
      }
      if (!hit) {
        // (the step swept, not jumped: a thin column at this speed would otherwise be stepped clean over)
        const nx = p.pos.x + g.dir * LUNGE_SPEED, w = wallBetween(state, g.dir > 0 ? nx + p.width : nx);
        if (w) { p.pos.x = g.dir > 0 ? w.x - p.width : w.x + w.w; g.phase = 'whiff'; g.t = 0; playSound('thud', 0.8, -4); shakeScreen(state, 4, 3); return hold(); }
        if (!walled(state, nx)) p.pos.x = nx;
      }
      else placeAt(state, g.dir > 0 ? hit.pos.x - p.width + 6 : hit.pos.x + hit.width - 6, p.pos.x);
      const e = hit ?? inReach(state, g.dir, LUNGE_REACH);
      if (e && isCritter(e)) return grabCritter(ctx, g, e, hold);
      if (e) {
        // Down he goes, Meathead on top of him (in the air, the two of them plummet first)
        g.phase = p.isGrounded ? 'mount' : 'plummet'; g.t = 0; g.held = e; take(state, e); g.fall = 0;
        g.nextPunchAt = 4; g.punchT = 0;
        placeAt(state, e.pos.x + e.width / 2 - p.width / 2, p.pos.x);
        e.facing = (-g.dir) as 1 | -1;
        playSound('slam'); playSound('punch', 1.2, -3);
        shakeScreen(state, 8, 5);
        return hold();
      }
      if (g.t >= LUNGE) { g.phase = 'whiff'; g.t = 0; playSound('land', 0.8, -4); }
      return hold();
    }

    case 'critter': {
      // Up in his fist, squirming: a direction, and it's pitched that way. A beat first while it's brought up to his
      // ear (shorter than a shakedown), so whatever was held going into the grab doesn't fling it straight off: the aim
      // shows, and can be changed, till then. Nothing held: at whoever's near (somebody to throw it at), or forward
      const e = g.held!;
      const d = controls.down ? 'down' : controls.up ? 'up' : controls.left ? 'left' : controls.right ? 'right' : null;
      g.aim = d;
      if (g.t >= CRITTER_SETTLE) {
        const target = d ? null : throwTarget(state, e);
        const way = d ?? (target ? (target.pos.x + target.width / 2 < centerX(state) ? 'left' : 'right') : (p.facing > 0 ? 'right' : 'left'));
        g.pitch = way; g.phase = 'pitch'; g.t = 0;
        if (way === 'left' || way === 'right') p.facing = (way === 'left' ? -1 : 1);
        g.dir = p.facing;
        pitchCritter(ctx, g, e, target);
        g.held = null;
        return hold();
      }
      if (g.t >= CRITTER_HOLD) {
        // (squeaked free: out of his hand and off, running; back to whatever it was doing)
        if (e.aiState === 'loose') { e.aiState = 'idle'; e.aiTimer = 0; }
        putBack(state, e, centerX(state) + g.dir * 26);
        e.vel = { x: g.dir * 4, y: -6 }; e.pauseTimer = 20;
        playSound('boing', 0.6, 14);
        end(state, g);
        return controls;
      }
      if (g.t % 14 === 0) playSound('boing', 0.25, 18);
      return hold();
    }

    case 'pitch':
      if (g.t >= PITCH_FOLLOW) end(state, g);
      return hold();

    case 'plummet':
    case 'drop': {
      // Coming down together, fast: him on top (a beatdown), or him held by the neck (a shakedown)
      p.vel.x = 0;
      p.vel.y = Math.min(PLUMMET_MAX, Math.max(p.vel.y, 3) + PLUMMET_ACCEL);
      g.fall = Math.max(g.fall, p.vel.y);
      if (!p.isGrounded) return { ...NO_CONTROLS };
      const e = g.held!;
      shakeScreen(state, 10, 7); playSound('slam');
      if (g.phase === 'drop') { g.phase = 'shake'; g.t = 0; return hold(); }
      // A beatdown's: he's driven into the floor under Meathead, by how fast they came down; it might be all it takes
      const dmg = Math.round(e.maxHealth * PLUMMET_SHARE * Math.min(1, g.fall / PLUMMET_MAX)) + 6;
      e.health -= dmg;
      playSound('crunch', 1, -3);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: centerX(state), y: feetY(state) - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#8B0000' : '#A8A29E', size: 2 + Math.random() * 3 });
      if (e.health <= 0) {
        e.pos = { x: e.pos.x, y: feetY(state) - e.height };
        release(state, e);
        fx.blowAwayEnemy(e, { x: g.dir * 2, y: -3 }, m2Kill('beatdown_kill'), g.dir);
        fx.spawnKillCallout(e, grabCallout('beatdown'));
        g.held = null; g.phase = 'kill'; g.t = 0;
        return hold();
      }
      fx.spawnDamageNumber({ x: centerX(state), y: p.pos.y - 10 }, dmg, true);
      g.phase = 'mount'; g.t = 0; g.nextPunchAt = 4;
      return hold();
    }

    case 'whiff':
    case 'miss':
      // (missed up in the air: no face-down on nothing, he's straight back to falling, in his own hands, with no
      // second go at a grab till he's landed)
      if (!p.isGrounded) { g.airSpent = true; end(state, g); return controls; }
      if (g.t >= (g.phase === 'whiff' ? WHIFF : GRAB_MISS)) end(state, g);
      return hold();

    case 'mount': {
      const e = g.held!;
      // Jumped off (nothing knocks him off: armor)
      if (press('jump')) { letGo(state, g, true); return { ...controls, jump: true }; }
      if (g.punchT > 0) g.punchT--;
      // (any of X, B or Y throws one)
      if ((press('shoot') || press('special') || press('secondary') || pressed('y')) && g.t >= g.nextPunchAt) {
        g.punchT = PUNCH_FRAMES; g.nextPunchAt = g.t + PUNCH_GAP; g.punchN++;
        // (bulked up: a lot more in each one)
        const dmg = Math.round(PUNCH_DAMAGE * (bulked() ? BULK_PUNCH : 1));
        e.health -= dmg;
        p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + PUNCH_HEAL); g.hp = p.health;
        const hx = e.pos.x + e.width / 2 + g.dir * 14, hy = feetY(state) - 8;
        fx.spawnDamageNumber({ x: hx, y: hy - 30 }, dmg);
        aftershock(ctx, g, centerX(state), feetY(state), dmg);
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 22, color: i % 2 ? '#8B0000' : '#B91C1C', size: 2 + Math.random() * 2 });
        playSound('punch', 0.9 + Math.random() * 0.3, Math.random() * 4 - 2);
        shakeScreen(state, 4, 3);
        // Bulked up, the last one's not a punch: both fists up over his head, and down
        if (e.health <= 0 && bulked()) { g.phase = 'smash'; g.t = 0; g.punchT = 0; playSound('whoosh', 1.1, -6); return hold(); }
        if (e.health <= 0) {
          // Done: the rest of the health back, and him left lying there
          p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + KILL_HEAL); g.hp = p.health;
          e.pos = { x: e.pos.x, y: feetY(state) - e.height };
          release(state, e);
          fx.blowAwayEnemy(e, { x: g.dir * 1.5, y: -2 }, m2Kill('beatdown_kill'), g.dir);
          fx.spawnKillCallout(e, grabCallout('beatdown'));
          fx.spawnDamageNumber({ x: centerX(state), y: p.pos.y - 20 }, `+${KILL_HEAL} HP`, true, '#4ADE80');
          playSound('crunch'); shakeScreen(state, 10, 6);
          g.held = null; g.phase = 'kill'; g.t = 0;
        }
      }
      return hold();
    }

    case 'kill':
      if (g.t >= 14) end(state, g);
      return hold();

    case 'smash':
      // Up... and down: him burst like a dropped melon, bits of him everywhere (and into whoever's about)
      if (g.t === SMASH_RAISE && g.held) smashHim(ctx, g, g.held);
      if (g.t >= SMASH_RAISE + 16) end(state, g);
      return hold();

    case 'shake': {
      // (nothing makes him let go: he takes whatever hits him and carries on shaking)
      const e = g.held!;
      g.aim = controls.down ? 'down' : controls.up ? 'up' : controls.left ? 'left' : controls.right ? 'right' : null;
      if (g.t % 6 === 0) playSound('thud', 0.35, 6);
      // The ammo shaken out of him as he's shaken, a bit at a time, falling out the front of him (clear of Meathead, so
      // it's seen to drop before it's picked up) (the first time he's shaken: after that, he's empty)
      if (g.t === 1 && !g.shaken.has(e)) { g.shaken.add(e); g.ammoLeft = SHAKE_AMMO; }
      if (g.ammoLeft > 0 && g.t % SHAKE_DROP_EVERY === SHAKE_DROP_EVERY - 1) {
        const k = SHAKE_AMMO - g.ammoLeft--;
        state.pickups.push({ id: `shake-${state.frame}-${k}`, pos: { x: centerX(state) + g.dir * 46 - 10, y: p.pos.y + 20 }, vel: { x: g.dir * (1.5 + k * 1.2), y: -4 - k }, width: 20, height: 20, type: 'small_ammo', life: 600 });
        playSound('clink', 1 - k * 0.1, 2 + k * 3);
      }
      if (g.t < SHAKE_FRAMES) return hold();
      // ...and thrown: down slams him, up launches him, the way he's facing (or nothing held) forward, the other way
      // back over his shoulder
      g.toss = controls.down ? 'down' : controls.up ? 'up' : (controls.left && g.dir > 0) || (controls.right && g.dir < 0) ? 'back' : 'forward';
      g.phase = 'toss'; g.t = 0;
      return hold();
    }

    case 'toss': {
      const e = g.held;
      if (e && g.t === TOSS[g.toss].release) { letFly(ctx, g, e); g.held = null; g.thrown = e; }
      if (g.t >= TOSS[g.toss].len) end(state, g);
      return hold();
    }
  }
};

/** Bulked up (the spellbook's bulk up): a punch is this many times as hard, and the last one's the double-fisted smash. */
const BULK_PUNCH = 2.2, SMASH_RAISE = 12, GIBS = 12, GIB_DMG = 35;
const bulked = () => buffs.knock > 1;

/**
 * The smash: both fists down on him, and he goes everywhere. No body left: his blood all over, the screen jumping, and
 * a dozen chunks of him flung up and out (gore chunks, the same the soul sucker sprays: they hurt whoever they land
 * on, and stain what they hit). All the health back for it, and the line and the callout.
 */
const smashHim = (ctx: FrameContext, g: Grab, e: Enemy) => {
  const { state, fx } = ctx;
  const p = state.player;
  const at = { x: e.pos.x + e.width / 2, y: feetY(state) - 10 };
  // (a machine: it's bits of casing that go everywhere, and oil and sparks, not meat)
  const scrap = isMachineKind(e.kind);
  if (scrap) markMachineGore(state, at.x - 80, at.y - 80, 160, 120, 40);
  g.held = null;
  e.health = 0; e.isBlownAway = true; e.pos = { x: at.x - e.width / 2, y: at.y - e.height / 2 };
  p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + KILL_HEAL); g.hp = p.health;
  playSound('slam'); playSound('crunch', 1.2, -6); playSound('splat', 1.2, -4); playSound('boom', 0.5, -10);
  shakeScreen(state, 20, 10);
  for (let k = 0; k < 3; k++) fx.spawnDeathShower(at, (k - 1) * 0.8, 2.2, false, 80);
  for (let i = 0; i < GIBS; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.8, sp = 7 + Math.random() * 8, size = 7 + Math.random() * 6;
    state.projectiles.push({
      id: `gib-${state.frame}-${i}`, pos: { x: at.x - size / 2, y: at.y - size / 2 - 6 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp },
      width: size, height: size, health: 1, maxHealth: 1, type: 'projectile', damage: GIB_DMG, owner: 'player',
      custom: 'SOUL_SUCKER', customData: { life: 70, hit: [] as string[], chunk: true, spin: Math.random() * 6, shade: i % 3, scrap },
    });
  }
  fx.spawnDamageNumber({ x: centerX(state), y: p.pos.y - 20 }, `+${KILL_HEAL} HP`, true, '#4ADE80');
  fx.spawnKillCallout(e, grabCallout('smash'));
  fx.speakVulgarity(m2Kill('beatdown_kill'));
  p.killSatisfactionTimer = 60;
};

/** How far a throw takes him, by his weight: about 1 for a man of 220, more for lighter, less for heavier (within reason). */
const heft = (e: Enemy) => Math.max(0.7, Math.min(1.3, Math.sqrt(220 / getEnemyMass(e)))) * buffs.knock;

/**
 * The slam's shock through the floor: everybody within reach of where he went in takes some of it, the most right at
 * the middle, tailing off to nothing at the edge (by how heavy the one slammed is), and is knocked away from it.
 */
const SLAM_REACH = 160;
const slamShock = (ctx: FrameContext, e: Enemy, x: number, floorY: number) => {
  const { state, fx } = ctx;
  const m = getEnemyMass(e);
  let any = false;
  for (const o of state.enemies) {
    if (o === e || o.health <= 0 || o.isBlownAway || o.type === 'boss' || o.innocent) continue;
    if (o.pos.y + o.height < floorY - 60 || o.pos.y > floorY) continue;
    const d = Math.abs(o.pos.x + o.width / 2 - x), k = 1 - d / SLAM_REACH;
    if (k <= 0) continue;
    any = true;
    const dmg = Math.round(Math.max(6, Math.min(150, m * 0.4 * k + 6)));
    o.health -= dmg;
    const away = Math.sign(o.pos.x + o.width / 2 - x) || 1, push = Math.max(0.4, Math.min(2, m / getEnemyMass(o)));
    fx.spawnDamageNumber(o.pos, dmg, dmg > 30);
    if (o.health <= 0) { fx.blowAwayEnemy(o, { x: away * 10 * push * k, y: -9 * k - 3 }, m2Kill('throw_kill'), away); o.meleeFlung = true; fx.spawnKillCallout(o, 'crush'); }
    else { o.vel = { x: away * 7 * push * k, y: -6 * k - 2 }; o.pauseTimer = Math.max(o.pauseTimer || 0, Math.round(30 + 40 * k)); }
  }
  // (the shock wave along the floor, dust thrown up either way)
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x, y: floorY - 3 }, vel: { x: (i % 2 ? 1 : -1) * (3 + Math.random() * 6), y: -1 - Math.random() * 2 }, life: 22, color: i % 3 ? '#A8A29E' : '#D6D3D1', size: 3 + Math.random() * 3 });
  if (any) playSound('crunch', 1, -6);
};

/**
 * Each punch of a ground and pound goes through the floor: anyone close by takes an aftershock of it (a fraction of the
 * punch, less the further off they are) and a little jolt away. Only the one under him takes the full thing.
 */
const AFTERSHOCK_REACH = 150, AFTERSHOCK_SHARE = 0.4;
const aftershock = (ctx: FrameContext, g: Grab, x: number, floorY: number, punch: number) => {
  const { state, fx } = ctx;
  for (const o of state.enemies) {
    if (o === g.held || o.health <= 0 || o.isBlownAway || o.type === 'boss' || o.innocent) continue;
    if (o.pos.y + o.height < floorY - 40 || o.pos.y > floorY) continue;
    const k = 1 - Math.abs(o.pos.x + o.width / 2 - x) / AFTERSHOCK_REACH;
    if (k <= 0) continue;
    const dmg = Math.max(1, Math.round(punch * AFTERSHOCK_SHARE * k));
    o.health -= dmg;
    fx.spawnDamageNumber(o.pos, dmg);
    const away = Math.sign(o.pos.x + o.width / 2 - x) || 1;
    if (o.health <= 0) { fx.blowAwayEnemy(o, { x: away * 6, y: -6 }, m2Kill('beatdown_kill'), away); fx.spawnKillCallout(o, grabCallout('beatdown')); }
    else { o.vel = { x: away * 2.5 * k, y: -2.5 * k }; o.pauseTimer = Math.max(o.pauseTimer || 0, 12); }
  }
};

/** Driven down onto whoever's there (the suplex's impact): each takes the weight of him, by how heavy he is, and is knocked on. */
const crushUnder = (ctx: FrameContext, e: Enemy, dir: number) => {
  const { state, fx } = ctx;
  const hit: string[] = [];
  const m = getEnemyMass(e);
  for (const o of state.enemies) {
    if (o === e || o.health <= 0 || o.isBlownAway || o.type === 'boss' || o.innocent) continue;
    if (o.pos.x > e.pos.x + e.width + 10 || o.pos.x + o.width < e.pos.x - 10 || o.pos.y > e.pos.y + e.height || o.pos.y + o.height < e.pos.y) continue;
    hit.push(o.id);
    const dmg = Math.round(Math.max(20, Math.min(180, m * 0.45)));
    o.health -= dmg;
    fx.spawnDamageNumber(o.pos, dmg, true);
    fx.spawnExplosion({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 }, '#8B0000', 12, 0, 10);
    const push = Math.max(0.4, Math.min(2, m / getEnemyMass(o)));
    if (o.health <= 0) { fx.blowAwayEnemy(o, { x: dir * 12 * push, y: -8 }, m2Kill('throw_kill'), dir); o.meleeFlung = true; fx.spawnKillCallout(o, 'crush'); }
    else { o.vel = { x: dir * 9 * push, y: -5 }; o.pauseTimer = Math.max(o.pauseTimer || 0, 40); }
  }
  if (hit.length) { playSound('crunch', 1, -4); shakeScreen(state, 12, 7); }
  return hit;
};

/** Up in his fist, one-handed, a critter: held there till a direction's pressed (see the 'critter' phase). */
const CRITTER_HOLD = 120, PITCH_FOLLOW = 12;
/** Frames it's brought up to his ear before it can be pitched (a shakedown's SHAKE_FRAMES, this is well under). */
const CRITTER_SETTLE = 16;
const grabCritter = (ctx: FrameContext, g: Grab, e: Enemy, hold: () => Controls) => {
  g.phase = 'critter'; g.t = 0; g.held = e; take(ctx.state, e);
  e.facing = g.dir;
  // (one of Meathead 2's own: torn loose from whatever it hung off or lived in, a branch, a stalk, a hole: drawn
  // dangling, not tied back to it; its AI's not running while he's got it)
  if (m2Kind(e.kind)) e.aiState = 'loose';
  playSound('boing', 0.4, 16);
  grabbedHurts(ctx, e);
  return hold();
};

/**
 * Let fly: pitched like a fastball (left or right), spiked into the floor (down), or heaved up into the air (up). It's
 * done for either way (a body now, flying on and taking out whoever it hits, splatting on whatever it meets).
 */
/** Somebody near to throw a critter at (no direction held): the nearest that's fair game, in front or behind, in reach. */
const THROW_AT = 520;
/** What a thrown critter does to whoever it hits, at the least (they're light: a help, not a kill). */
const CRITTER_HIT = 10;
const throwTarget = (state: GameState, held: Enemy): Enemy | null => {
  const p = state.player, cx = centerX(state), cy = p.pos.y + p.height / 2;
  let best: Enemy | null = null, bestD = Infinity;
  for (const o of state.enemies) {
    if (o === held || o.health <= 0 || o.isBlownAway || o.innocent || o.harmless || o.puppet) continue;
    const ox = o.pos.x + o.width / 2, oy = o.pos.y + o.height / 2, dd = Math.hypot(ox - cx, (oy - cy) * 1.5);
    if (dd < THROW_AT && Math.abs(oy - cy) < 260 && dd < bestD) { bestD = dd; best = o; }
  }
  return best;
};

const pitchCritter = (ctx: FrameContext, g: Grab, e: Enemy, at: Enemy | null = null) => {
  const { state, fx } = ctx;
  const p = state.player;
  const hand = { x: centerX(state) + g.dir * 18, y: p.pos.y + 6 };
  e.pos = { x: hand.x - e.width / 2, y: hand.y - e.height / 2 };
  // (at somebody: straight at them, hard, a little high for the drop)
  const aimed = at && (() => { const dx = at.pos.x + at.width / 2 - hand.x, dy = at.pos.y + at.height / 2 - hand.y, n = Math.hypot(dx, dy) || 1; return { x: (dx / n) * 26, y: (dy / n) * 26 - Math.min(6, n * 0.012) }; })();
  const v = aimed || (g.pitch === 'down' ? { x: g.dir * 4, y: 24 } : g.pitch === 'up' ? { x: g.dir * 2, y: -24 } : { x: g.dir * 26, y: -2 });
  release(state, e);
  e.health = 0;
  // (light: it's no cannonball, but whoever it hits feels it)
  e.minCollateral = CRITTER_HIT;
  fx.blowAwayEnemy(e, v, m2Kill('pitch_kill'), g.dir);
  e.meleeFlung = true;
  fx.spawnKillCallout(e, grabCallout(g.pitch === 'down' ? 'slam' : g.pitch === 'up' ? 'launched' : 'thrown'));
  playSound('whoosh', 1.3, 6);
  if (g.pitch === 'down') { playSound('splat'); shakeScreen(state, 6, 4); }
};

/** Lets go of him, the way the throw's going: slammed down in front, suplexed down behind, launched up, or flung forward. */
const letFly = (ctx: FrameContext, g: Grab, e: Enemy) => {
  const { state, fx } = ctx;
  const p = state.player;
  e.rotation = 0;
  if (g.toss === 'down') {
    // Slammed: into the floor right there, hard; nobody else gets a piece of it
    // (laid down clear of him, in front: overlapping him, the engine would have him bounce off the body)
    e.pos = { x: centerX(state) + g.dir * (p.width / 2 + e.width / 2 + 6) - e.width / 2, y: feetY(state) - e.height };
    e.vel = { x: 0, y: 0 };
    const dmg = Math.max(20, Math.round(e.maxHealth * SLAM_SHARE));
    e.health -= dmg;
    release(state, e);
    playSound('slam'); playSound('crunch', 0.8); shakeScreen(state, 12, 7);
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: feetY(state) - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#8B0000' : '#A8A29E', size: 2 + Math.random() * 3 });
    if (e.health <= 0) { fx.blowAwayEnemy(e, { x: 0, y: -1 }, m2Kill('throw_kill'), g.dir); fx.spawnKillCallout(e, grabCallout('slam')); }
    else { e.pauseTimer = 60; fx.spawnDamageNumber(e.pos, dmg, true); }
    // (anyone near where he hit takes the shock of it, the nearer the worse)
    slamShock(ctx, e, e.pos.x + e.width / 2, feetY(state));
    // (and the force of it bounces Meathead up off the floor)
    p.vel = { x: 0, y: SLAM_BOUNCE }; p.isGrounded = false;
    return;
  }
  if (g.toss === 'back') {
    // Suplexed: arched back over him and driven down behind, head and shoulders first, skidding off a little
    const dir = -g.dir;
    e.pos = { x: centerX(state) + dir * (p.width / 2 + e.width / 2 + 4) - e.width / 2, y: feetY(state) - e.height };
    // (thrown about as far as a forward throw, the other way; lighter ones further)
    const w = heft(e);
    e.vel = { x: dir * THROW_SPEED * w, y: -6 };
    const dmg = Math.max(14, Math.round(e.maxHealth * SUPLEX_SHARE));
    e.health -= dmg;
    release(state, e);
    playSound('slam'); playSound('crunch', 0.9, -2); shakeScreen(state, 10, 6);
    for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: feetY(state) - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 22, color: i % 2 ? '#8B0000' : '#A8A29E', size: 2 + Math.random() * 3 });
    // (whoever's where he comes down gets the weight of him)
    const crushed = crushUnder(ctx, e, dir);
    if (e.health <= 0) { fx.blowAwayEnemy(e, { x: dir * THROW_SPEED * w * 0.7, y: -4 }, m2Kill('throw_kill'), dir); e.meleeFlung = true; fx.spawnKillCallout(e, grabCallout('suplex')); }
    else { e.pauseTimer = 50; e.chargedAt = state.frame; fx.spawnDamageNumber(e.pos, dmg, true); fly(g, e, 'suplex', true); crushed.forEach(id => g.flying[g.flying.length - 1].hit.add(id)); }
    return;
  }
  const dir = g.dir;
  // (how far by how heavy he is: a pit bull goes a lot further than a bouncer)
  const w = heft(e);
  const v = g.toss === 'up' ? { x: g.dir * 2.5, y: -THROW_UP * w } : { x: dir * THROW_SPEED * w, y: -6 };
  e.pos = { x: centerX(state) + dir * (p.width / 2 + e.width / 2 + 6) - e.width / 2, y: p.pos.y - (g.toss === 'up' ? 40 : 16) };
  e.vel = { ...v };
  // (the throw itself doesn't hurt him: what he hits does, another body, a wall, the floor coming up at him)
  release(state, e);
  playSound('whoosh', 1.2, -3);
  e.pauseTimer = 45;
  e.chargedAt = state.frame;
  const how: GrabCallout = g.toss === 'up' ? 'launched' : 'thrown';
  // (the boot: it hurts, a bit, there and then; the rest's what he hits after)
  if (g.toss === 'forward') {
    const boot = Math.max(5, Math.round(e.maxHealth * BOOT_SHARE));
    e.health -= boot;
    playSound('punch', 1.1, -4);
    if (e.health <= 0) { fx.blowAwayEnemy(e, v, m2Kill('throw_kill'), dir); e.meleeFlung = true; fx.spawnKillCallout(e, grabCallout(how)); return; }
    fx.spawnDamageNumber(e.pos, boot);
  }
  fly(g, e, how, false, g.toss === 'forward' ? BOOTED_IMPACT : 1);
};

// ---------------------------------------------------------------------------
// The air grab
// ---------------------------------------------------------------------------

/** Held still for the wind-up: no walking, and in the air hanging there (sinking slowly at most). */
const airHold = (state: GameState, hang = true): Controls => {
  const p = state.player;
  p.vel.x = 0; p.jumpHoldTimer = 0;
  if (hang && !p.isGrounded) p.vel.y = Math.min(p.vel.y, A.WINDUP_MAX_FALL);
  return { ...NO_CONTROLS };
};

/** The first body his hands reach on the way up: in front of his middle, from over his head to under his feet. */
const airReach = (state: GameState, dir: number) => {
  const p = state.player, mid = centerX(state);
  const front = dir > 0 ? p.pos.x + p.width : p.pos.x;
  const a = Math.min(mid, front + dir * A.REACH_FRONT), b = Math.max(mid, front + dir * A.REACH_FRONT);
  const top = p.pos.y - A.REACH_UP, bottom = feetY(state) + A.REACH_DOWN;
  let best: Enemy | null = null, bestD = Infinity;
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.innocent) continue;
    if (e.pos.x > b || e.pos.x + e.width < a || e.pos.y > bottom || e.pos.y + e.height < top) continue;
    if (!clearTo(state, e)) continue;
    const d = Math.abs(e.pos.x + e.width / 2 - mid) + Math.abs(e.pos.y + e.height / 2 - (p.pos.y + p.height / 2)) * 0.5;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

/** Where the one he's got is through the arc: his feet in the world, and its middle. */
const arcHold = (state: GameState, g: Grab, e: Enemy) => {
  const x = centerX(state), y = feetY(state), a = g.ang * g.dir;
  const dx = A.HOLD_X, dy = A.HOLD_Y + A.PIVOT, c = Math.cos(a), s = Math.sin(a);
  const lx = dx * c - dy * s, ly = dx * s + dy * c - A.PIVOT;
  const feet = { x: x + g.dir * lx, y: y + ly };
  const mid = { x: feet.x + Math.sin(g.ang) * e.height / 2, y: feet.y - Math.cos(g.ang) * e.height / 2 };
  return { feet, mid };
};

/** The underside of anything solid he'd go up into this frame. */
const ceilingOver = (state: GameState, vy: number) => {
  const p = state.player;
  return state.blocks.find(b => !b.oneWay && b.type !== 'pit' && b.type !== 'door'
    && p.pos.x + 4 < b.x + b.w && p.pos.x + p.width - 4 > b.x && b.y + b.h <= p.pos.y + 2 && b.y + b.h > p.pos.y + vy) ?? null;
};

/** The arc down together: steered back (a backflip), forward (a dive) or not at all (a piledriver), till something stops it. */
const airArc = (ctx: FrameContext, g: Grab, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  p.power = 0; p.vel.x = 0; p.jumpHoldTimer = 0;
  // (in the water, or somehow going on forever: let go of him, alive)
  if (p.swimming || g.t > A.ARC_MAX_FRAMES) { letGo(state, g); return { ...NO_CONTROLS }; }
  // (jump: bail out of it (heading somewhere bad): he lets go and kicks off; no slam, no heal; the one he had falls on
  // his own, the way he was going, and the floor hurts him by how hard he hits it, like any thrown body)
  const jumpNow = !!controls.jump, fresh = jumpNow && !g.arcJump;
  g.arcJump = jumpNow;
  if (fresh && g.held) {
    const e = g.held, at = arcHold(state, g, e).feet;
    e.pos = { x: at.x - e.width / 2, y: Math.min(at.y, feetY(state)) - e.height };
    e.vel = { x: g.avx, y: Math.max(2, g.avy) };
    e.rotation = 0;
    g.held = null;
    release(state, e);
    fly(g, e, 'thrown');
    end(state, g);
    p.vel = { x: -g.dir * A.BAIL_VX, y: -A.BAIL_VY }; p.isGrounded = false;
    playSound('whoosh', 0.8, 2);
    return { ...controls, special: false, charge: false };
  }
  const back = g.dir > 0 ? controls.left : controls.right, fwd = g.dir > 0 ? controls.right : controls.left;
  // (a flip or a dive, once it's picked, is it: no changing his mind mid-air; from the plain piledriver he can still pick one)
  if (g.arc !== 'back' && g.arc !== 'fwd') g.arc = back ? 'back' : fwd ? 'fwd' : 'down';
  const tvx = g.arc === 'back' ? -g.dir * A.ARC_BACK_VX : g.arc === 'fwd' ? g.dir * A.ARC_FWD_VX : g.dir * A.ARC_DOWN_VX;
  g.avx += (tvx - g.avx) * A.ARC_STEER;
  const tang = g.dir * (g.arc === 'back' ? -A.BACK_ANGLE : g.arc === 'fwd' ? A.FWD_ANGLE : A.DOWN_ANGLE);
  g.ang += Math.max(-A.SPIN, Math.min(A.SPIN, tang - g.ang));
  // Down on the floor (coming down): the impact
  if (p.isGrounded && g.t > 1 && g.avy >= 0) return airImpact(ctx, g, 'floor');
  g.avy = Math.min(A.ARC_MAX_FALL, g.avy + A.ARC_GRAV);
  g.fall = Math.max(g.fall, g.avy);
  // Up into a ceiling, hard: there
  if (g.avy < 0) {
    const c = ceilingOver(state, g.avy);
    if (c) { if (-g.avy >= A.SPLAT_SPEED) return airImpact(ctx, g, 'ceiling', c); g.avy = 0; }
  }
  // Sideways into a wall, hard: there
  if (Math.abs(g.avx) > 0.2) {
    const s = Math.sign(g.avx), nx = p.pos.x + g.avx;
    const w = wallBetween(state, s > 0 ? nx + p.width + A.WALL_LEAD : nx - A.WALL_LEAD);
    if (w && (s > 0 ? w.x - (nx + p.width) : nx - (w.x + w.w)) < A.WALL_LEAD) {
      if (Math.abs(g.avx) >= A.SPLAT_SPEED) return airImpact(ctx, g, 'wall', w);
      g.avx = 0;
    } else if (!walled(state, nx)) p.pos.x = nx;
  }
  p.vel.y = g.avy;
  return { ...NO_CONTROLS };
};

/**
 * Driven in: big damage (not always a kill), health back for Meathead, the screen jumping, blood (or scrap). Dead, he
 * goes like the rest of the grabs' kills, line and callout; alive, he bounces off it dazed, into whoever's there.
 */
const airImpact = (ctx: FrameContext, g: Grab, where: 'floor' | 'wall' | 'ceiling', block?: { x: number; y?: number; w: number; h?: number }): Controls => {
  const { state, fx } = ctx, p = state.player, e = g.held!;
  const { mid } = arcHold(state, g, e);
  const how: GrabCallout = g.arc === 'back' ? 'backdrop' : g.arc === 'fwd' ? 'spear' : 'piledriver';
  const s = Math.sign(g.avx) || g.dir;
  // (where he ends up: on the floor under where he was, against the wall, under the ceiling)
  let at: { x: number; y: number };
  if (where === 'floor') {
    e.pos = { x: mid.x - e.width / 2, y: feetY(state) - e.height };
    at = { x: mid.x, y: feetY(state) - 4 };
  } else if (where === 'wall') {
    const b = block!;
    e.pos = { x: s > 0 ? b.x - e.width : b.x + b.w, y: Math.min(mid.y - e.height / 2, feetY(state) - e.height) };
    at = { x: s > 0 ? b.x : b.x + b.w, y: e.pos.y + e.height / 2 };
  } else {
    const b = block as { x: number; y: number; w: number; h: number };
    e.pos = { x: mid.x - e.width / 2, y: b.y + b.h };
    at = { x: mid.x, y: b.y + b.h + 4 };
  }
  e.rotation = 0;
  g.held = null; g.hitAt = at;
  release(state, e);
  const k = where === 'floor' ? Math.max(A.MIN_K, Math.min(1, g.fall / A.ARC_MAX_FALL)) : A.SPLAT_K;
  const dmg = Math.round((e.maxHealth * A.DAMAGE_SHARE * k + A.DAMAGE_FLAT) * buffs.knock);
  e.health -= dmg;
  p.health = Math.min(INITIAL_PLAYER_HEALTH, p.health + A.HEAL); g.hp = p.health;
  fx.spawnDamageNumber({ x: centerX(state), y: p.pos.y - 20 }, `+${A.HEAL} HP`, true, '#4ADE80');
  // (blood, or scrap off a machine)
  const scrap = isMachineKind(e.kind) || !!m2Kind(e.kind)?.robot;
  if (scrap) markMachineGore(state, at.x - 80, at.y - 80, 160, 120, 30);
  playSound('slam'); playSound('crunch', 1.1, -5); playSound('splat', 1, -2);
  shakeScreen(state, A.SHAKE_T, A.SHAKE_POW);
  fx.spawnExplosion(at, scrap ? '#57534E' : '#8B0000', 16, 0, 10);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { ...at }, vel: { x: (Math.random() - 0.5) * 9, y: -1 - Math.random() * 4 }, life: 26, color: i % 2 ? (scrap ? '#78716C' : '#8B0000') : '#A8A29E', size: 2 + Math.random() * 3 });
  const away = where === 'wall' ? -s : Math.sign(e.pos.x + e.width / 2 - centerX(state)) || g.dir;
  if (e.health <= 0) {
    if (where === 'wall') { e.vel.x = 0; impactKill(ctx, e, 'wallsplat', -s); fx.speakVulgarity(m2Kill('airgrab_kill')); }
    else if (where === 'ceiling') { e.health = 0; e.vel = { x: 0, y: 0 }; ceilingSplat(ctx, e, e.pos.y); fx.speakVulgarity(m2Kill('airgrab_kill')); }
    else { fx.blowAwayEnemy(e, { x: away * A.BOUNCE_VX, y: -A.BOUNCE_VY }, m2Kill('airgrab_kill'), away); e.meleeFlung = true; fx.spawnKillCallout(e, grabCallout(how)); }
    p.killSatisfactionTimer = 60;
  } else {
    fx.spawnDamageNumber(e.pos, dmg, true);
    e.vel = { x: away * A.BOUNCE_VX, y: where === 'ceiling' ? 2 : -A.BOUNCE_VY };
    e.pauseTimer = Math.max(e.pauseTimer || 0, A.DAZE);
    e.chargedAt = state.frame;
    // (bounced off it into whoever's there: mass times speed, like any thrown body)
    fly(g, e, how, true);
  }
  // (and the floor shakes under whoever's stood about where they went in)
  if (where === 'floor') slamShock(ctx, e, at.x, feetY(state));
  p.vel = { x: 0, y: where === 'floor' ? A.SELF_BOUNCE : Math.max(0, p.vel.y) };
  if (where === 'floor') p.isGrounded = false;
  g.phase = 'aland'; g.t = 0;
  return { ...NO_CONTROLS };
};

/** Busy with a grab (the player's drawn by drawGrab, not the usual way)? */
export const grabbing = (g: Grab) => g.phase !== 'idle';

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** An enemy drawn somewhere else than where it stands: its feet at (x, y), turned by `angle` about them. */
/** `face`: which way he faces before he's turned (a person's drawn facing whoever's watching, so he's mirrored to it). */
/** `how`: how he's holding it (the drawers that can pose it for that do: see held.ts). */
export const drawEnemyAt = (ctx: Ctx, e: Enemy, state: GameState, x: number, y: number, angle: number, face: 1 | -1, how?: HeldHow) => {
  const pos = e.pos, facing = e.facing;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  e.pos = { x: -e.width / 2, y: -e.height };
  e.facing = face;
  // (a person, not behind a shield, turns to face Meathead whatever, a charger the way he's running: drawn here, at the
  // origin, that's one way or the other, so he's mirrored if it's not the way wanted)
  if (kindFacing(e, state) !== face) ctx.scale(-1, 1);
  try { drawingHeld(e, how, () => drawKindEnemy(ctx, e, state)); } finally { e.pos = pos; e.facing = facing; ctx.restore(); }
};

/**
 * Pinned on his back under him, head toward Meathead's front (where the punches land): a person laid flat, face up;
 * an animal rolled right over, legs in the air. `jolt` when one's just landed, `squirm` between.
 */
const drawPinned = (ctx: Ctx, e: Enemy, state: GameState, x: number, groundY: number, dir: 1 | -1, jolt: number, squirm: number) => {
  const face = (-dir) as 1 | -1;
  if (isHumanoidKind(e.kind)) drawEnemyAt(ctx, e, state, x - dir * e.height * 0.45, groundY - 5 + jolt * 2, dir * (Math.PI / 2 + jolt * 0.12) + squirm, face, 'pinned');
  // (upside down: feet up at the top of where he lies, his back on the floor)
  else drawEnemyAt(ctx, e, state, x + dir * 6, groundY - e.height - 2 + jolt * 2, Math.PI + squirm, face, 'pinned');
};

/**
 * Held up by the neck at (hx, hy), facing Meathead: a person hanging upright from it; an animal turned up on end, head
 * up, hind legs hanging down. `swing` turns him about the neck.
 */
const drawHeldByNeck = (ctx: Ctx, e: Enemy, state: GameState, hx: number, hy: number, dir: 1 | -1, swing: number, byFace = false) => {
  const face = (-dir) as 1 | -1, person = isHumanoidKind(e.kind);
  const hd = e.kind ? kindHead(e.kind, e.variant) : null;
  // (where his neck is, from his feet, the way he's facing; a person's under his head, an animal's just behind its head;
  // held by the face, it's the middle of the head)
  const neck = byFace && hd ? { x: face * hd.x, y: hd.y }
    : person ? { x: 0, y: hd ? hd.y + hd.r : -e.height * 0.8 } : { x: face * (hd ? hd.x - hd.r * 0.6 : e.width * 0.35), y: hd ? hd.y + hd.r * 0.5 : -e.height * 0.6 };
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate((person ? 0 : -face * Math.PI / 2) + swing);
  drawEnemyAt(ctx, e, state, -neck.x, -neck.y, 0, face, 'neck');
  ctx.restore();
};

/** Meathead in one of the engine's own poses (crouched, charging, standing), drawn where he is. */
const asPose = (ctx: Ctx, state: GameState, pose: Partial<GameState['player']>, dx = 0) => {
  const p = state.player;
  const clone = { ...p, ...pose, hidden: false, pos: { x: p.pos.x + dx, y: p.pos.y } };
  drawPlayer(ctx, clone, state, { currentWeapon: p.currentWeapon as WeaponType, showFilthShield: false, invincibilityEnabled: false });
};

/** Draws him into a sprite (outlined, like the rest of him), feet at (x, y), facing `dir`. */
const sprite = (world: Ctx, x: number, y: number, dir: number, paint: (c: Ctx) => void) => {
  // (pumped up: bigger, from his feet)
  if (buffs.size !== 1) { world.save(); world.translate(x, y); world.scale(buffs.size, buffs.size); world.translate(-x, -y); }
  try { spriteAt(world, x, y, dir, paint); } finally { if (buffs.size !== 1) world.restore(); }
};
const spriteAt = (world: Ctx, x: number, y: number, dir: number, paint: (c: Ctx) => void) => {
  const s = beginSprite(world);
  const c = s ?? world;
  c.save();
  if (!s) c.translate(x, y);
  c.scale(dir, 1);
  paint(c);
  c.restore();
  if (s) endSprite(world, x, y);
};

const head = (c: Ctx, x: number, y: number, rot: number, mood: Mood, f: number) => { c.save(); c.translate(x, y); c.rotate(rot); drawHead(c, 0, 0, mood, f); c.restore(); };
/** (for the other moves and weapons that put him in a pose of their own) */
export { sprite as drawPoseSprite, head as drawPoseHead };

/**
 * Ground and pound, MMA style: knees down either side of him (full mount), hips low on him, the off hand pinning his
 * chest, the other hand hammering down (`k` 0 cocked up by his ear .. 1 landed), his whole back behind it.
 */
/**
 * How far into a punch, each of its frames: below 0 pulled back further than cocked (the wind-up), 1 landed in his
 * face. Fast, and a long way: the whole arm and the shoulder behind it, not a tap.
 */
const PUNCH_ARC = [-0.35, 0.45, 1, 1, 0.55, 0.15];
/**
 * Astride him, ground and pound. `k`: 0 cocked (sat up, twisted back, the fist pulled back high past his ear, the elbow
 * out behind him), 1 landed (thrown down into the face with his weight behind it: leaning right over, the shoulder
 * dropped into it, the arm all but straight), below 0 drawn back further still. `right`: which fist (they alternate;
 * the other has him by the collar). `streak`: the swing's blur.
 */
const mountPose = (c: Ctx, f: number, k: number, right = true, streak = false) => {
  const lerp = (a: number, b: number, t = k) => a + (b - a) * t;
  const sink = Math.max(0, k) * 2.5;
  drawLeg(c, [-5, -16 + sink], [-14, -4], [-26, -5], 1.4, true);
  drawLeg(c, [5, -16 + sink], [16, -4], [4, -3], 1.4, false);
  c.save(); c.translate(0, -16 + sink); c.rotate(lerp(0.12, 0.78));
  // (the punching arm: cocked high behind, landed down in front, low in the face)
  const cock = { e: [-14, -24] as [number, number], h: [-5, -41] as [number, number] }, land = { e: [24, -19] as [number, number], h: [38, -26] as [number, number] };
  const punch = (sx: number): [[number, number], [number, number]] => {
    const t = Math.max(0, k), back = Math.min(0, k);
    return [[lerp(cock.e[0], land.e[0], t) + back * 12 + sx * 0.3, lerp(cock.e[1], land.e[1], t) + back * 6], [lerp(cock.h[0], land.h[0], t) + back * 14, lerp(cock.h[1], land.h[1], t) + back * 4]];
  };
  // (the other one's got him by the shirt, down at his chest)
  const hold: [[number, number], [number, number]] = [[6, -6], [18, 4]];
  const [be, bh] = right ? hold : punch(-8);
  if (streak) { c.fillStyle = 'rgba(255, 255, 255, 0.55)'; const [, h] = right ? punch(11) : punch(-8); for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(lerp(cock.h[0], h[0], 1 - i * 0.22), lerp(cock.h[1], h[1], 1 - i * 0.22), 5 - i, 0, Math.PI * 2); c.fill(); } }
  drawArmTo(c, [-8, -22], be, bh, true);
  drawTorsoFromHips(c);
  head(c, lerp(4, 8), -36, 0.3, k > 0.3 ? 'roar' : 'grit', f);
  const [fe, fh] = right ? punch(11) : hold;
  drawArmTo(c, [11, -22], fe, fh, false, 6);
  c.restore();
};

/** Feet planted wide, leaning back against the weight, both hands round his neck up high, shaking him. */
const shakePose = (c: Ctx, f: number, jig: number) => {
  drawLeg(c, [-5, -24], [-11, -12], [-15, 0], 0, true);
  drawLeg(c, [5, -24], [13, -12], [15, 0], 0, false);
  c.save(); c.translate(0, -24); c.rotate(-0.14);
  drawArmTo(c, [-8, -22], [10, -34 + jig], [27, -45 + jig], true);
  drawTorsoFromHips(c);
  head(c, 2, -37, -0.1, 'yell', f);
  drawArmTo(c, [11, -22], [22, -30 + jig], [31, -43 + jig], false, 6);
  c.restore();
};

/** Where the shake pose's hands are (round his neck), from his feet (facing right). */
const fistAt = (jig: number) => {
  const a = -0.14, x = 30, y = -44 + jig;
  return { x: x * Math.cos(a) - y * Math.sin(a), y: -24 + x * Math.sin(a) + y * Math.cos(a) };
};

/** The beatdown's windup: sunk low in a wrestler's shooting stance, back leg loaded, hands low, head down (`k` how far in). */
const coilPose = (c: Ctx, f: number, k: number) => {
  const drop = 4 + k * 6;
  drawLeg(c, [-5, -22 + drop], [-15, -10 + drop * 0.4], [-28, 0], 0.15, true);
  drawLeg(c, [5, -22 + drop], [16, -14 + drop * 0.5], [15, 0], 0, false);
  c.save(); c.translate(0, -22 + drop); c.rotate(0.55 + k * 0.2);
  drawArmTo(c, [-8, -22], [4, -8], [14, -12], true);
  drawTorsoFromHips(c);
  head(c, 7, -34, 0.4, 'scowl', f);
  drawArmTo(c, [11, -22], [20, -8], [27, -15], false, 6);
  c.restore();
};

/**
 * The beatdown's lunge: a wrestler's double-leg shot. Dropped low, the front knee nearly on the floor, the back leg
 * driving out straight behind, his back flat, his head up and in, both arms out low for the legs (`k` how far in).
 */
const shootPose = (c: Ctx, f: number, k: number) => {
  const hipY = -18 + k * 4;
  drawLeg(c, [-5, hipY], [-18, hipY + 6], [-34, -1], 0.5, true);
  drawLeg(c, [5, hipY], [16, -5], [6, -2], 1.2, false);
  c.save(); c.translate(0, hipY); c.rotate(1.05 + k * 0.15);
  drawArmTo(c, [-8, -22], [4, -34], [10, -48 - k * 6], true);
  drawTorsoFromHips(c);
  head(c, 10, -32, -0.9, 'roar', f);
  drawArmTo(c, [11, -22], [22, -34], [22, -50 - k * 6], false, 6);
  c.restore();
};

/**
 * Round whoever he's holding (a critter up by his ear, somebody being shaken): an arrow each way they can go (right,
 * left, up, down), the one aimed lit up yellow, the rest faint; till it can go they're dim, then they pulse: ready.
 * `fallback`: the way it goes with nothing held (a shakedown's forward throw), lit when no direction is.
 */
const SHAKE_READY = 16;
const aimArrows = (ctx: Ctx, cx: number, cy: number, g: Grab, f: number, ready: boolean, R = 30, fallback: 'left' | 'right' | null = null) => {
  const aim = g.aim ?? fallback;
  for (const [d, dx, dy] of [['right', 1, 0], ['left', -1, 0], ['up', 0, -1], ['down', 0, 1]] as const) {
    const on = aim === d;
    const pulse = ready && !on ? 0.15 * Math.sin(f * 0.3) : 0;
    ctx.globalAlpha = on ? (ready ? 1 : 0.7) : (ready ? 0.6 : 0.3) + pulse;
    const ax = cx + dx * R, ay = cy + dy * R, s = on ? 8 : 6;
    ctx.beginPath();
    ctx.moveTo(ax + dx * s, ay + dy * s);
    ctx.lineTo(ax - dx * s * 0.6 + dy * s, ay - dy * s * 0.6 + dx * s);
    ctx.lineTo(ax - dx * s * 0.6 - dy * s, ay - dy * s * 0.6 - dx * s);
    ctx.closePath();
    ctx.fillStyle = on ? '#FDE047' : '#F8FAFC'; ctx.fill();
    ctx.strokeStyle = '#1A0B06'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/** One-handed: the throwing hand at `arm` (from his hips, facing right), the other out in front for balance. */
const pitchPose = (c: Ctx, f: number, arm: { x: number; y: number }, k: number) => {
  drawLeg(c, [-5, -24], [-10, -12], [-14, 0], 0, true);
  drawLeg(c, [5, -24], [13, -13 + k * 2], [17, 0], 0, false);
  c.save(); c.translate(0, -24); c.rotate(-0.1 + k * 0.25);
  drawArmTo(c, [-8, -22], [-2, -14], [10, -18], true);
  drawTorsoFromHips(c);
  head(c, 3, -37, 0, k > 0.5 ? 'roar' : 'grit', f);
  drawArmTo(c, [11, -22], [(arm.x + 11) / 2 + 2, (arm.y - 22) / 2 - 4], [arm.x, arm.y], false, 6);
  c.restore();
};

/** The smash: astride him, both fists together; `k` -1 (wound up high over his head, leaning back) .. 0 .. 1 (down on him, all his weight behind it). */
const smashPose = (c: Ctx, f: number, k: number) => {
  drawLeg(c, [-5, -16], [-14, -4], [-26, -5], 1.4, true);
  drawLeg(c, [5, -16], [16, -4], [4, -3], 1.4, false);
  const t = Math.max(0, k), back = Math.max(0, -k);
  c.save(); c.translate(0, -16 + t * 3); c.rotate(-0.15 * back + 0.85 * t);
  const fist: [number, number] = [2 + 34 * t - 4 * back, -60 + 64 * t - 6 * back];
  const elbowB: [number, number] = [-8 + 22 * t, -42 + 30 * t], elbowF: [number, number] = [12 + 14 * t, -42 + 28 * t];
  drawArmTo(c, [-8, -22], elbowB, [fist[0] - 3, fist[1]], true, 6);
  drawTorsoFromHips(c);
  head(c, 5, -36, 0.2, 'roar', f);
  drawArmTo(c, [11, -22], elbowF, [fist[0] + 3, fist[1]], false, 7);
  c.restore();
};

/** The shakedown's windup: a step in, both hands open and out for the throat (`k` how far out). */
const reachPose = (c: Ctx, f: number, k: number) => {
  drawLeg(c, [-5, -24], [-10, -12], [-17, 0], 0, true);
  drawLeg(c, [5, -24], [15 + k * 3, -13], [19 + k * 4, 0], 0, false);
  c.save(); c.translate(0, -24); c.rotate(0.1 + k * 0.12);
  drawArmTo(c, [-8, -22], [9, -30], [24 + k * 8, -36], true, 4.5);
  drawTorsoFromHips(c);
  head(c, 4, -37, 0.05, 'yell', f);
  drawArmTo(c, [11, -22], [24, -28], [33 + k * 8, -34], false, 4.5);
  c.restore();
};

/** A throw's pose at one moment: how far he leans, where both hands are (in his torso's frame), how low he's sunk. */
interface TossKey { lean: number; hand: [number, number]; sink: number; turn?: number }
/** Each throw's keys (from the start through letting go to the follow-through), eased between. */
const TOSS_KEYS: Record<Toss, TossKey[]> = {
  // Forward: wound back with him over the shoulder, then heaved out in front, the body following through
  forward: [{ lean: 0, hand: [26, -42], sink: 0 }, { lean: -0.35, hand: [-6, -54], sink: 2 }, { lean: 0.4, hand: [36, -32], sink: 4 }, { lean: 0.5, hand: [34, -18], sink: 6 }],
  // Back: a suplex. Hoisted up off his feet, then Meathead arches right back over into a bridge, driving him down behind
  back: [{ lean: 0, hand: [26, -42], sink: 0 }, { lean: -0.9, hand: [8, -62], sink: 2 }, { lean: -2.0, hand: [-2, -58], sink: 10 }, { lean: -2.05, hand: [-2, -56], sink: 11 }],
  // Up: an alley-oop. Dipped down low with him, then up off the floor, both arms thrust straight up, locked out
  up: [{ lean: 0, hand: [26, -42], sink: 0 }, { lean: 0.2, hand: [20, -20], sink: 10 }, { lean: -0.1, hand: [6, -78], sink: -6 }, { lean: -0.06, hand: [4, -80], sink: -4 }],
  // Down: hoisted right up overhead, then brought down into the floor in front, sinking into it
  down: [{ lean: 0, hand: [26, -42], sink: 0 }, { lean: -0.2, hand: [6, -66], sink: -2 }, { lean: 0.7, hand: [36, -4], sink: 12 }, { lean: 0.65, hand: [36, -4], sink: 11 }],
};
/** The throw's pose `t` frames in (the release at the third key). */
const tossKey = (toss: Toss, t: number): TossKey => {
  const keys = TOSS_KEYS[toss], { len, release } = TOSS[toss];
  // (the windup up to the release, quick, then the follow-through)
  const at = t <= release ? (t / release) * 2 : 2 + Math.min(1, (t - release) / (len - release));
  const i = Math.min(keys.length - 2, Math.floor(at)), k = at - i, e = k * k * (3 - 2 * k);
  const a = keys[i], b = keys[i + 1];
  return { lean: a.lean + (b.lean - a.lean) * e, hand: [a.hand[0] + (b.hand[0] - a.hand[0]) * e, a.hand[1] + (b.hand[1] - a.hand[1]) * e], sink: a.sink + (b.sink - a.sink) * e };
};
/** Where a pose's hands are, from his feet (facing right). */
const handAt = (key: TossKey) => {
  const [x, y] = key.hand, a = key.lean;
  return { x: x * Math.cos(a) - y * Math.sin(a), y: -24 + key.sink + x * Math.sin(a) + y * Math.cos(a) };
};
/**
 * The forward throw: he boots him away. Held out in front by the neck, the knee comes up and the leg shoots out, sole
 * first, leaning back on the planted leg (`k` 0 chambered .. 1 out); once he's let go, the arms fly out for balance.
 */
const bootPose = (c: Ctx, f: number, k: number, let_: boolean) => {
  drawLeg(c, [-4, -26], [-8, -13], [-10, 0], 0, true);
  const out = Math.max(0, (k - 0.35) / 0.65);
  drawLeg(c, [5, -26], [16 + out * 8, -38 + out * 8], [12 + out * 30, -24 - out * 8], -0.4 - out * 1.1, false);
  c.save(); c.translate(-2, -26); c.rotate(-0.08 - out * 0.3);
  if (let_) drawArmTo(c, [-8, -22], [-20, -28], [-30, -22], true);
  else drawArmTo(c, [-8, -22], [8, -26], [24, -30], true, 5);
  drawTorsoFromHips(c);
  head(c, 3, -37, -0.1, out > 0.4 ? 'roar' : 'grit', f);
  if (let_) drawArmTo(c, [11, -22], [20, -12], [12, -8], false);
  else drawArmTo(c, [11, -22], [22, -24], [28, -31], false, 6);
  c.restore();
};
/** Where the boot pose holds him (his neck), from his feet (facing right). */
const BOOT_HOLD = { x: 34, y: -60 };

/**
 * The slam: an aggressive one-handed face slam. A palm over his face, hoisted, and driven down into the floor in front
 * (`k` 0 up .. 1 in the floor), bent right over after it, the other arm flung back.
 */
const slamHandAt = (k: number) => ({ x: 20 + k * 24, y: -78 + k * 74 });
const facePose = (c: Ctx, f: number, k: number) => {
  const lean = -0.15 + k * 0.95, sink = -2 + k * 13, hipY = -24 + sink;
  drawLeg(c, [-5, hipY], [-13, -12 + sink * 0.5], [-17, 0], 0, true);
  drawLeg(c, [5, hipY], [16, -13 + sink * 0.6], [19, 0], 0, false);
  // (the hand's where it is in the world; into the torso's frame for the arm)
  const h = slamHandAt(k), dx = h.x, dy = h.y - hipY, cs = Math.cos(-lean), sn = Math.sin(-lean);
  const hx = dx * cs - dy * sn, hy = dx * sn + dy * cs;
  c.save(); c.translate(0, hipY); c.rotate(lean);
  drawArmTo(c, [-8, -22], [-20, -16 - k * 6], [-30, -8 - k * 14], true);
  drawTorsoFromHips(c);
  head(c, 3, -37, 0.2 + k * 0.2, 'roar', f);
  drawArmTo(c, [11, -22], [(hx + 11) / 2 + 6, (hy - 22) / 2 - 4], [hx, hy], false, 6.5);
  c.restore();
};

/** Him in a throw: braced (or sunk) on his legs, leaning into it, both hands on the one he's throwing. */
const tossPose = (c: Ctx, f: number, key: TossKey, toss: Toss) => {
  const s = key.sink;
  drawLeg(c, [-5, -24 + s], [-12, -12 + s * 0.5], [-16, 0], 0, true);
  drawLeg(c, [5, -24 + s], [14, -13 + s * 0.6], [17, 0], 0, false);
  c.save(); c.translate(0, -24 + s); c.rotate(key.lean);
  const [hx, hy] = key.hand;
  drawArmTo(c, [-8, -22], [(hx - 8) / 2 - 2, (hy - 22) / 2 - 6], [hx - 4, hy - 1], true, 5);
  drawTorsoFromHips(c);
  head(c, 3, -37, toss === 'up' ? -0.25 : toss === 'down' ? 0.25 : toss === 'back' ? -0.3 : 0, 'roar', f);
  drawArmTo(c, [11, -22], [(hx + 11) / 2 + 4, (hy - 22) / 2 - 2], [hx + 2, hy], false, 6);
  c.restore();
};

/** The air grab's launch: springing up and forward, the front knee driven up, both hands up and out for him (`k` how far in). */
const airLungePose = (c: Ctx, f: number, k: number) => {
  drawLeg(c, [-5, -24], [-9, -10], [-15, 2], 0.9, true);
  drawLeg(c, [5, -24], [15, -22], [12, -8], 0.5, false);
  c.save(); c.translate(0, -24); c.rotate(0.22 + k * 0.1);
  drawArmTo(c, [-8, -22], [8, -36], [20, -48 - k * 4], true, 5);
  drawTorsoFromHips(c);
  head(c, 5, -37, -0.3, 'roar', f);
  drawArmTo(c, [11, -22], [25, -33], [33, -44 - k * 4], false, 6);
  c.restore();
};

/**
 * The air grab's hold through the arc: both arms locked round him, out in front. `ext` 0: knees tucked up (the
 * backflip, the piledriver); 1: legs out straight behind (the dive).
 */
const hugPose = (c: Ctx, f: number, ext: number) => {
  const l = (a: number, b: number) => a + (b - a) * ext;
  drawLeg(c, [-5, -24], [l(8, -14), l(-16, -20)], [l(-6, -34), l(-6, -16)], l(0.6, 1.4), true);
  drawLeg(c, [5, -24], [l(18, -6), l(-14, -24)], [l(6, -28), l(-2, -26)], l(0.6, 1.4), false);
  c.save(); c.translate(0, -24); c.rotate(l(0.12, 0.45));
  drawArmTo(c, [-8, -22], [10, -12], [24, -18], true, 5);
  drawTorsoFromHips(c);
  head(c, 4, -36, l(0.15, 0.35), 'roar', f);
  drawArmTo(c, [11, -22], [24, -10], [30, -22], false, 6);
  c.restore();
};

/** Draws whatever grab's on, in place of him (world space, over everything). */
export const drawGrab = (ctx: Ctx, state: GameState, g: Grab) => {
  if (g.phase === 'idle') return;
  const p = state.player, f = state.frame;
  p.hidden = true;
  const x = centerX(state), y = feetY(state);
  switch (g.phase) {
    case 'awind': {
      // Coiled (hanging there, in the air), shaking with it, steam off him, and the warning
      const k = g.t / A.WINDUP;
      sprite(ctx, x + (f % 2 ? 1 : -1) * k * 1.5, y, g.dir, c => coilPose(c, f, k));
      if (f % 4 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: p.pos.y - 10 }, vel: { x: 0, y: -1.5 }, life: 20, color: 'rgba(240, 240, 240, 0.5)', size: 3 });
      if (k > 0.6 && f % 6 < 3) { ctx.fillStyle = '#FDE047'; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', x, p.pos.y - 34); ctx.textAlign = 'left'; }
      return;
    }
    case 'alunge': {
      // Springing up at him: streaks of air off under him
      for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(255, 255, 255, ${(0.5 - i * 0.1).toFixed(2)})`; ctx.fillRect(x - 22 + i * 14 - g.dir * 6, y + 6 + ((f * 7 + i * 13) % 30), 2, 16); }
      sprite(ctx, x, y, g.dir, c => airLungePose(c, f, Math.min(1, g.t / 4)));
      return;
    }
    case 'aarc': {
      // In his arms, turned over with him: the one he's got first, then him over it (his arms round it)
      const e = g.held;
      for (let i = 0; i < 5; i++) { const sx = x - 30 + i * 15, sy = y - 90 - ((f * 9 + i * 23) % 60); ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.fillRect(sx, sy, 2, 18 + (i % 2) * 8); }
      if (e) { const { feet } = arcHold(state, g, e); drawEnemyAt(ctx, e, state, feet.x, feet.y, g.ang, (-g.dir) as 1 | -1, isCritter(e) ? 'pitch' : 'neck'); }
      const a = g.ang * g.dir, ext = g.arc === 'fwd' ? 1 : 0;
      sprite(ctx, x, y, g.dir, c => { c.translate(0, -A.PIVOT); c.rotate(a); c.translate(0, A.PIVOT); hugPose(c, f, ext); });
      return;
    }
    case 'aland': {
      // Back off it, crouched, and the burst where they went in
      asPose(ctx, state, { isDucking: p.isGrounded, facing: g.dir });
      if (g.hitAt && g.t < 6) {
        const { x: bx, y: by } = g.hitAt;
        ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; ctx.fillRect(Math.round(bx + Math.cos(an) * 20) - 2, Math.round(by + Math.sin(an) * 12) - 2, 4, 4); }
        ctx.fillStyle = '#FDE047'; ctx.fillRect(bx - 6, by - 6, 12, 12);
      }
      return;
    }
    case 'windup': {
      // Coiled down, shaking with it, steam coming off him
      const k = g.t / WINDUP;
      sprite(ctx, x + (f % 2 ? 1 : -1) * k * 1.5, y, g.dir, c => coilPose(c, f, k));
      if (f % 4 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: p.pos.y - 10 }, vel: { x: 0, y: -1.5 }, life: 20, color: 'rgba(240, 240, 240, 0.5)', size: 3 });
      if (k > 0.7 && f % 6 < 3) { ctx.fillStyle = '#FDE047'; ctx.font = '12px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', x, p.pos.y - 34); ctx.textAlign = 'left'; }
      return;
    }
    case 'lunge': {
      // Shooting in low for the legs: streaks of air off him, dust kicked up off the back foot
      const k = Math.min(1, g.t / 3);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(255, 255, 255, ${(0.55 - i * 0.1).toFixed(2)})`; ctx.fillRect(x - g.dir * (40 + i * 14 + (f % 3) * 4) - (g.dir < 0 ? 22 : 0), y - 34 + i * 7, 22, 2); }
      if (f % 2 === 0) state.particles.push({ pos: { x: x - g.dir * 30, y: y - 2 }, vel: { x: -g.dir * (1 + Math.random() * 2), y: -1 - Math.random() }, life: 16, color: 'rgba(190, 175, 150, 0.6)', size: 3 + Math.random() * 3 });
      sprite(ctx, x, y, g.dir, c => shootPose(c, f, k));
      return;
    }
    case 'reach':
    case 'miss':
      // Hands going out for his throat (or closing on air, held there a moment)
      sprite(ctx, x, y, g.dir, c => reachPose(c, f, g.phase === 'miss' ? 1 : Math.min(1, g.t / REACH)));
      return;
    case 'whiff':
      // Face down where they were
      asPose(ctx, state, { isDucking: p.isGrounded, facing: g.dir });
      return;
    case 'critter':
    case 'pitch': {
      // One-handed: wound up with it by his ear, squirming (a bird flapping); then the arm's follow-through, the way it went
      const k = g.phase === 'pitch' ? Math.min(1, g.t / 4) : 0;
      // (brought up from where he caught it to his ear, over the settle)
      const up = g.phase === 'critter' ? Math.min(1, g.t / CRITTER_SETTLE) : 1, ease = 1 - (1 - up) * (1 - up);
      const arm = g.phase === 'critter' ? { x: 24 - 30 * ease, y: -26 - 24 * ease } : g.pitch === 'down' ? { x: 28, y: -2 } : g.pitch === 'up' ? { x: 8, y: -66 } : { x: 34, y: -30 };
      sprite(ctx, x, y, g.dir, c => pitchPose(c, f, arm, k));
      if (g.held) {
        const wiggle = Math.sin(f * 0.9) * 0.25;
        const hx = x + g.dir * (arm.x * Math.cos(-0.1) + 2), hy = y - 24 + arm.y + 6;
        drawEnemyAt(ctx, g.held, state, hx, hy + g.held.height / 2, wiggle, (-g.dir) as 1 | -1, 'pitch');
        if (g.phase === 'critter') aimArrows(ctx, hx, hy + g.held.height / 2, g, f, g.t >= CRITTER_SETTLE);
      }
      return;
    }
    case 'plummet':
    case 'drop': {
      // Coming down together: air streaming up past them
      for (let i = 0; i < 5; i++) { const sx = x - 30 + i * 15, sy = y - 90 - ((f * 9 + i * 23) % 60); ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(sx, sy, 2, 18 + (i % 2) * 8); }
      if (g.phase === 'drop') {
        const fist = fistAt(0);
        sprite(ctx, x, y, g.dir, c => shakePose(c, f, 0));
        if (g.held) drawHeldByNeck(ctx, g.held, state, x + g.dir * (fist.x + 4), y + fist.y, g.dir, -g.dir * 0.2);
        return;
      }
      if (g.held) drawPinned(ctx, g.held, state, x, y + 4, g.dir, 0, 0);
      sprite(ctx, x, y, g.dir, c => mountPose(c, f, 0.1));
      return;
    }
    case 'smash': {
      // Both fists up over his head, joined, then down on him with everything
      const up = Math.min(1, g.t / SMASH_RAISE), down = g.t >= SMASH_RAISE;
      if (g.held) drawPinned(ctx, g.held, state, x, y, g.dir, 0, Math.sin(f * 0.8) * 0.08);
      sprite(ctx, x, y, g.dir, c => smashPose(c, f, down ? 1 : -up));
      if (down && g.t < SMASH_RAISE + 4) {
        const bx = x + g.dir * 40, by = y - 6;
        ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.fillRect(Math.round(bx + Math.cos(a) * 16) - 2, Math.round(by + Math.sin(a) * 8) - 2, 4, 4); }
        ctx.fillStyle = '#FDE047'; ctx.fillRect(bx - 5, by - 5, 10, 10);
      }
      return;
    }
    case 'mount':
    case 'kill': {
      // (a punch, frame by frame: pulled way back, coming down, landing, held there a beat, back up again)
      const k = g.punchT > 0 ? PUNCH_ARC[PUNCH_FRAMES - g.punchT] : 0;
      const landed = g.punchT > 0 && k >= 1;
      if (g.held) {
        // Flat on his back under him, head toward his punching hand; jolted by each one landing, squirming between
        const e = g.held;
        const squirm = Math.sin(f * 0.4) * 0.05 * (landed ? 0 : 1);
        drawPinned(ctx, e, state, x, y, g.dir, landed ? 1 : 0, squirm);
      }
      const right = g.punchN % 2 === 0;
      sprite(ctx, x, y, g.dir, c => mountPose(c, f, g.phase === 'kill' ? 0.2 : k, right, g.punchT > 0 && g.punchT >= PUNCH_FRAMES - 2));
      // (the landing: a burst where it went in)
      if (landed && g.punchT === PUNCH_FRAMES - 2) {
        const bx = x + g.dir * 46, by = y - 9;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3; ctx.fillRect(Math.round(bx + Math.cos(a) * 9) - 1, Math.round(by + Math.sin(a) * 6) - 1, i % 2 ? 2 : 3, i % 2 ? 2 : 3); }
        ctx.fillStyle = '#FDE047'; ctx.fillRect(bx - 3, by - 3, 6, 6);
      }
      return;
    }
    case 'toss': {
      const { release } = TOSS[g.toss];
      const k = Math.min(1, g.t / release), e2 = k * k * (3 - 2 * k);
      if (g.toss === 'forward') {
        // The boot: him held out by the neck while the knee comes up, then the sole into him
        // (him behind Meathead's leg, so the boot shows going into him)
        if (g.held) drawHeldByNeck(ctx, g.held, state, x + g.dir * BOOT_HOLD.x, y + BOOT_HOLD.y, g.dir, -g.dir * k * 0.15);
        sprite(ctx, x, y, g.dir, c => bootPose(c, f, e2, !g.held));
        return;
      }
      if (g.toss === 'down') {
        // The face slam: a palm over his face, up, and down into the floor face first, his body going over after
        const h = slamHandAt(e2);
        sprite(ctx, x, y, g.dir, c => facePose(c, f, g.held ? e2 : 1));
        if (g.held) drawHeldByNeck(ctx, g.held, state, x + g.dir * (h.x + 6), y + h.y, g.dir, -g.dir * e2 * Math.PI * 0.48, true);
        return;
      }
      const key = tossKey(g.toss, g.t), hand = handAt(key);
      sprite(ctx, x, y, g.dir, c => tossPose(c, f, key, g.toss));
      if (g.held) {
        // Still by the neck in his hands, swung round with them
        // (the suplex carries him over with Meathead's arch, till he's going in head first)
        const turn = g.toss === 'back' ? key.lean * 1.4 : 0;
        drawHeldByNeck(ctx, g.held, state, x + g.dir * hand.x, y + hand.y, g.dir, g.dir * turn);
      }
      return;
    }
    case 'shake': {
      const jig = Math.sin(g.t * 1.9) * 5;
      const fist = fistAt(jig);
      if (g.held) {
        // Held up by the neck, feet off the floor, swinging and kicking with the shaking (him first, then the one he's
        // holding, out in front of him, over his hands)
        sprite(ctx, x, y, g.dir, c => shakePose(c, f, jig));
        drawHeldByNeck(ctx, g.held, state, x + g.dir * (fist.x + 4), y + fist.y, g.dir, Math.sin(g.t * 1.9 + 0.8) * 0.18);
        // (which way he'll go when the shaking's done: nothing held, out the front)
        aimArrows(ctx, x + g.dir * (fist.x + 4), y + fist.y + g.held.height * 0.45, g, f, g.t >= SHAKE_FRAMES - SHAKE_READY, Math.max(34, g.held.height * 0.6 + 6), g.dir > 0 ? 'right' : 'left');
        return;
      }
      sprite(ctx, x, y, g.dir, c => shakePose(c, f, jig));
      return;
    }
  }
};
