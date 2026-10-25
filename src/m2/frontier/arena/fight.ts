// TUCKER'S FIGHT (the user's design, verbatim in frontier-spec.md; job G, first pass). Every number that matters is up
// top, to tune.
//
//   BLIND       The felled tree drove the saw down through his optic nerves (the arena entry): he can't see a thing. He
//               can still hear: every noise Meathead makes (a jump's takeoff, a landing, footsteps at a run, a shot) is
//               where Tucker thinks he is, a bit off, and that's where he aims; stood still and quiet, he loses him (and
//               aims at where he last heard him). Jump over to his other side and he hears it and turns round.
//   THE GUN     A flintlock, Oily Oscar's way (aim, lock, fire) but a lot faster, far more erratic and far less homing:
//               the cock (the click-clack, the pistol up by his face), the aim (out at arm's length, the far hand cupped
//               behind his ear, trembling, wandering after what he hears: a dotted line off the muzzle shows where it's
//               pointing), the FLASH IN THE PAN (the priming catches: sparks, a fizz, the line blinks bright: the shot's a
//               beat off; move NOW), the bang (a fast ball, straight; a big puff of smoke), then the reload (ramming the
//               rod down by feel, the ledger out loud: the window to get at him). A hit is HEAVY: far the worst thing in
//               the fight. Faster and more erratic the lower his health.
//   HE MOVES    Slowly, cautiously: a shuffle toward where he heard him, never too near, backing off if he is; kept on
//               the screen (the camera holds them both while it can; off its edge, he hurries back into it).
//   BEES        The commotion's stirred up a swarm (two later): they chase Meathead (nothing kills them), a mild sting,
//               then off a moment; they sting any critter they catch (hazards hurt enemies too); they leave the blind man
//               be (he's not the one jumping around).
//   STAMPEDES   Every bang sends the small wildlife running for it across the glade, on the ground and in the air
//               (critters.ts): they don't go for him but they hurt to run into. His ball kills whatever it hits on the
//               way. They're what the SOUL SUCKER fills off here: about one or two stampedes' worth sucked up makes a
//               spray (the bag's emptied when the fight starts; his own blood, drawn by the sucker, doesn't go in it).
//   WEAKNESS    The soul sucker's spray, on him: showered in blood (enough of the spray landing on him), the scent draws
//               the MOUNTAIN LIONS out of the woods, from both ends; they pounce and maul him (heavy damage; he can't be
//               hurt by anything else meanwhile; a brief punch-in), then slink off; he gets up more clawed every time.
//               Slinking off, each is a real enemy (critters.ts LION_KIND): full, harmless, a lot of poise; sucked up
//               (a big helping in the bag) or killed before it's off the view's edge, else just gone.
//   HURTING HIM The ray gun and Meathead's moves at Meathead 1's boss values; anything else 35%; the 60-frame breather.
//
// Two deaths (the land bosses' rule): the weakness (the lions' mauling the last thing to hurt him): THE SLOW-MO KILL
// (the kill cam, slowed: the close-up of them at his throat and his split crown, then a TUG OF WAR: one cat's jaws in
// his chest, the other's in his shins, each wrenching back in turn, him stretched long at the waist (the cloth, then his
// belly skin, splitting, then raw meat necking thin) till he tears in two with a burst; each backs off into the trees with
// its half, his cap left spinning). Any other way: he falls over, apparently dead; Meathead walks up; he pops up AAHHH
// (his jumpscare); gloating, he can't see the GRIZZLY come up behind him; the close-up of its mauling (the mutilation
// rule); then pushed in on it pinning him by the chest and hauling his head up off him by its jaws a wrench at a time,
// his neck stretched out of his collar (skin, splitting, the raw strap muscles and windpipe) till the head comes away in
// a spray; the body slumps, the stump pumping; the bear walks off with his head. Both cutscenes (no HUD, no controls;
// SKIP >> all of it). The pieces of him: gore.ts (sprites, stretched; never repainted a frame).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { hazardHit, hazardVictims, boxHits } from '../../hazardHit';
import { setGoreBag, goreBag, SPRAY, noBagFrom, onGlobHit, beingSucked } from '../../weapons/soulSucker';
import { grabHolding } from '../../moves/grab';
import { box, label, saidOver, speak, meatheadSays, byPants, hands } from '../section';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { mix, INK, type Ctx } from '../kit';
import { pixelBlob, checker } from '../../../m1/game/render/pixelArt';
import { drawTucker, drawTuckerCloseup, drawTuckerCap, tuckerMuzzle, TUCKER_H, type TuckerPose, type TuckerFace, type TuckerWounds } from '../tucker';
import { drawLion, drawGrizzly, lionJaw, bearJaw, BEAR_TUG_STEPS, type LionPose, type BearPose, type LionCarry } from './beasts';
import { drawTugged, drawTuckerHalf, halfEnd, drawStrand, drawNeckStump, drawHeadlessBody, drawBodyForNeck, drawStretchedNeck, drawTuckerHeadAt, BITE_TOP, BITE_LEGS, COLLAR, HEAD_CROWN, HEAD_SOCKET } from './gore';
import { kindOf, GROUND_CRITTERS, FLYING_CRITTERS, critterSpeed, critterDmg, isCritter, isLion, LION_KIND, LION, MAULING, type Critter } from './critters';
import { GY, ARENA_L, ARENA_R, ROCK_X, ROCK_HW, ROCK_H, LION_FROM_L, LION_FROM_R } from './layout';
import { type Box, around } from '../../deathFrame';
import { WOUNDS_SPLIT } from './cast';
import * as L from './lines';

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here). Pairs are [at full health, near dead]: he gets faster and more erratic as he goes.

/** His health (the land bosses'), and the engine's stand-in (never runs out: the hits come off ours). */
const HP = 666, BIG = 100000;
/** Anything but the ray gun and his moves: this share; the breather after a hit. */
const SHARE = 0.35, IFRAMES = BOSS_IFRAMES;
/** The routine (frames): listening between shots, the cock, the aim, the flash in the pan, the kick after, the reload. */
const LISTEN: [number, number] = [80, 30], COCK: [number, number] = [16, 10], AIM: [number, number] = [54, 26];
const PAN: [number, number] = [22, 13], RECOIL: [number, number] = [16, 10], RELOAD: [number, number] = [66, 32];
/** How quickly the aim follows what he heard (a share a frame: Oscar's laser 0.3, far more homing); how far it wanders
 *  (px at the target, a wobble plus sudden jerks), how often it jerks. */
const TRACK: [number, number] = [0.05, 0.085], WOBBLE: [number, number] = [20, 58], JERK: [number, number] = [0.03, 0.1];
/** The ball: how fast (px a frame: Oscar's rocket 19), how hard (before M2's x0.65: ~30 off his 100), a little spread. */
const BALL_V: [number, number] = [18, 25], BALL_DMG = 46, SPREAD = 0.03;
/** A wild shot off the hip on his blind run: a lot less than the planted, aimed one (the user's). */
const HIP_DMG = 26;
/** His shuffle (px a frame), how near he'll come (and backs off nearer), how far he wants to be; hurrying back on screen. */
// (far more on the move (the user's: "it's too easy to infinite dive kick on tucker. make him far more mobile"): were
// 0.45-0.85 and 0.3-0.55 runs)
const WALK: [number, number] = [0.9, 1.5], TOO_NEAR = 150, WANT = 300, HURRY = 2.4;
/** The blind run (the user's: now and then he runs about flailing, firing as he goes): how likely instead of a planted
 *  shot, how fast, how long (frames), the gap between shots off the hip, how far off those go (px at what he heard). */
const RUN_CHANCE: [number, number] = [0.5, 0.75], RUN_V: [number, number] = [3.2, 4.6], RUN_LEN: [number, number] = [70, 140];
const RUN_FIRE: [number, number] = [26, 46], RUN_ERR = 90;
/** The noises: how far off he hears each (px of error either way). */
const ERR = { jump: 40, land: 30, step: 70, shot: 16, hit: 0 };
/** The stampede after each bang: how many (more later), how soon the first comes, the gaps, how many fly. */
// (toned down (the user's): still stampedes, a touch smaller and looser, with lulls between them (LULL))
// (a touch more often again (the user's): the gaps and the lull a bit shorter; were [9, 24] and 330)
const CRITTERS: [number, number] = [4, 7], FIRST_IN = 22, GAP: [number, number] = [8, 20], FLY_SHARE = 0.3;
/** A quiet spell after a stampede: a shot in it sends nothing running (frames from the last one's start, and while any are
 *  still coming or about). */
// (the user's: always some gap between stampedes, smaller as the fight goes on: from the first to the last, by phaseK)
const LULL: [number, number] = [330, 170];
/** The most critters about at once (the user's: a lot, but limited; and the game slowed with tons of them), and the most
 *  of their bodies left lying (the oldest cleared away). */
const MAX_CRITTERS = 8, MAX_CORPSES = 6;
/** The bees: their speed, the sting (before M2's x0.65), how often, then off a while; a second swarm below this health. */
const BEE_V: [number, number] = [1.5, 2.3], STING = 3, STING_GAP = 55, BEE_OFF = 50, SECOND_SWARM = 0.4;
/** The weakness: how many globs of the spray on him make him showered; the lions' wait (frames after the shower), their
 *  run, the mauling's length and its damage (in ticks), the punch-in. */
/** The lions' leaps in out of the foreground and back out into it (frames each; how high the bound, px in the plane). */
const LEAP_IN_T = 34, LEAP_OUT_T = 26, LEAP_H = 70;
const SHOWERED = 5, LION_WAIT = 46, LION_V = 7.5, MAUL_T = 170, MAUL_DMG = 140, MAUL_TICKS = 5, PUNCH_T = 54;
/** Talking: his taunts, Meathead's hints. */
const TAUNT_EVERY = 520, HINT_GAP = 900;

const lerp = (r: [number, number], k: number) => r[0] + (r[1] - r[0]) * k;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act = 'listen' | 'cock' | 'aim' | 'pan' | 'recoil' | 'reload' | 'bloody' | 'mauled' | 'getup' | 'run';
interface Shot { x: number; y: number; vx: number; vy: number; life: number; dmg: number }
interface Queued { at: number; c: Critter; dir: 1 | -1; y: number; sp: number }
interface Swarm { x: number; y: number; t: number; cd: number; off: number; gone: number }
interface Lion { x: number; y: number; vx: number; vy: number; dir: 1 | -1; mode: 'wait' | 'leapIn' | 'run' | 'pounce' | 'maul' | 'tug' | 'drag' | 'leapOut' | 'gone'; t: number; wait: number; side: number; carry: LionCarry | null;
  /** Out of the play plane toward the lens (0 in it, 1 right up against the glass): the leaps in and out (see depthOf). */
  z?: number;
  /** On him: the real enemy it is while it mauls (it can be killed or sucked off him; then it's gone from here). */
  e?: Enemy }
interface Death {
  how: 'lions' | 'grizzly'; t: number; step: string; at: number; done: boolean;
  /** His last say's been said (the grizzly's: it's over once the bear's gone too). */
  said?: boolean;
  /** The grizzly: where, which way, what it's doing; its wrench on his head (the tug: 0 .. BEAR_TUG_STEPS - 1). */
  bx: number; bdir: 1 | -1; bear: BearPose | null; pull: number;
  /** Which way he's lying (flat on his back, his head that way's back: the grizzly's). */
  lie: 1 | -1;
  /** Tucker's figure: where he's thrown (a hop), the halves of him (the lions' tear: how far apart, 0..1). */
  ty: number; tvy: number; tear: number;
  /** The lions' tug of war: how far each cat's hauled back (left, right), the tug going (which side, its ticks), when
   *  he came apart (-1: not yet). */
  eL: number; eR: number; tugSide: number; tugT: number; snap: number;
  /** A close-up's k (0..1), the cap where it fell. */
  k: number; cap: { x: number; y: number; vx: number; vy: number; rot: number } | null;
}
/** The kill cam / punch-in: frames, the slow motion's carry, the zoom now, where it's going, the most it's been going
 *  to (the focus eases to the middle of the shot by how far in), the slow motion (1: none). */
interface Cam { t: number; acc: number; z: number; zt: number; top: number; slow: number }

export interface Fight {
  mode: 'on' | 'dead'; t: number;
  hp: number; iframes: number; flash: number;
  e: Enemy; moveSeen: number | undefined;
  /** The same hit landing on him over and over (bossSpam.ts). */
  spam: Spam;
  // ---- Tucker: where, which way, what he's at; the gun's angle (off straight ahead, + down), where it's aimed (world)
  tx: number; facing: 1 | -1; act: Act; actT: number; aim: number; aimX: number; aimY: number; jerkX: number; jerkY: number;
  /** Jostled by the critters running through him (px a frame, easing off), and how long he's been stumbling (frames). */
  shove: number; bumped: number;
  /** Where he heard Meathead last (world), and when. */
  heard: { x: number; y: number; at: number };
  /** A blind run (the user's): which way, frames left of it, to his next shot off the hip, the shot's pose held. */
  runDir: 1 | -1; runN: number; runFire: number; runShot: number;
  wasGrounded: boolean; pShots: number; stepT: number;
  shots: Shot[]; smoke: { x: number; y: number; t: number }[];
  // ---- the critters coming, the rustle where they're coming from
  queue: Queued[]; rustle: { x: number; t: number } | null; stampedes: number; lastStampede?: number;
  // ---- the bees
  swarms: Swarm[];
  // ---- the weakness: the blood on him, how much of the spray's landed; the cats; how many times they've had him
  bloody: number; shower: number; lions: Lion[]; /** How many cats the shower called (each its share of the mauling). */ pack: number; maulT: number; maulDealt: number; clawed: number;
  // ---- talking
  said: string | null; talking: boolean; tauntT: number; hintAt: number; wrongN: number; lowSaid: boolean; bagSaid: boolean; beeSaidAt: number;
  // ---- the camera (held on them both), a death, the kill cam / punch-in, SKIP
  camX: number; death: Death | null; cam: Cam | null; skipT: number;
}

/** The fight going on now (the soul sucker's hook looks at it). */
let live: Fight | null = null;
let game: GameState | null = null;
let token = 0;
export const resetFight = () => { live = null; token++; };
/** Dev only (tools/perf): the next frame, him showered (the lions called); 'kill': at 1 HP first, so it's the kill. */
let devShower: '' | 'maul' | 'kill' = '';
if (import.meta.env.DEV) (window as unknown as { __m2TuckerShower: (k?: 'maul' | 'kill') => void }).__m2TuckerShower = (k = 'maul') => { devShower = k; };

// ---------------------------------------------------------------------------------------------------------------
// Tucker, the enemy (the engine's: for the hits; drawn here)

const TUCKER_KIND = 'm2:fr_tucker_boss' as const;
registerM2Kind({
  kind: TUCKER_KIND,
  stats: { w: 40, h: 92, hp: BIG, contact: 0, mass: 260, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 3, y: -84, r: 12 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[TUCKER_KIND] = L.GRAB_TUCKER;

// (the spray landing on him: his weakness, not a hit)
onGlobHit((ctx, e) => {
  const f = live;
  if (!f || e !== f.e) return false;
  if (f.mode === 'on' && f.act !== 'mauled' && f.act !== 'bloody' && f.act !== 'getup') {
    f.shower++; f.bloody = Math.min(1, f.bloody + 0.14);
    for (let i = 0; i < 4; i++) ctx.state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 24, y: GY - 40 - Math.random() * 50 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 });
    if (f.shower >= SHOWERED) showered(ctx, f);
  }
  return true;
});

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one at a time; words only while said)

const pants = (lines: ByPants) => pickLine(game ? byPants(game, lines) : lines.clean);
const tok = (fn: () => void) => { const t = token; return () => { if (t === token) fn(); }; };
/** He says one (waited on: `done` after). */
const tuckerSays = (f: Fight, lines: ByPants, done?: () => void) => {
  const t = token;
  f.talking = true;
  speak(TUCKER_VOICE, pants(lines), s => { if (t !== token) return; f.said = s?.text ?? null; if (!s) f.talking = false; }, true, () => { if (t === token) { f.talking = false; done?.(); } });
};
/** A bark: dropped if he's talking already. */
const bark = (f: Fight, lines: ByPants) => {
  if (f.said || f.talking) return;
  const t = token;
  f.talking = true;
  speak(TUCKER_VOICE, pants(lines), s => { if (t !== token) return; f.said = s?.text ?? null; if (!s) f.talking = false; }, false, () => { if (t === token) f.talking = false; });
};
const mhSays = (state: GameState, lines: ByPants, after = true, done?: () => void) => meatheadSays(state, pants(lines), after, done ? tok(done) : undefined);

// ---------------------------------------------------------------------------------------------------------------
// Starting

const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const clampCam = (x: number) => Math.max(ARENA_L, Math.min(ARENA_R - CANVAS_WIDTH, x));

/** On: Tucker in the world where he stands (his x), facing that way; the bag emptied (the critters fill it here). */
export const startFight = (state: GameState, tx: number, facing: 1 | -1): Fight => {
  game = state; token++; lionsWaiting = false;
  const e = makeKindEnemy(TUCKER_KIND as EnemyKind, tx, GY);
  e.noCrowd = true;
  e.facing = facing; e.seen = true;
  noBagFrom.add(e);
  state.enemies.push(e);
  setGoreBag(0);
  const m = pmid(state);
  const f: Fight = {
    mode: 'on', t: 0, hp: HP, iframes: 0, flash: 0, e, moveSeen: e.hitByMove, spam: newSpam(),
    tx, facing, act: 'listen', actT: 20, aim: 0.6, aimX: m.x, aimY: m.y, jerkX: 0, jerkY: 0, shove: 0, bumped: 0,
    heard: { x: m.x, y: m.y, at: 0 }, runDir: 1, runN: 0, runFire: 0, runShot: 0, wasGrounded: state.player.isGrounded, pShots: 0, stepT: 0,
    shots: [], smoke: [], queue: [], rustle: null, stampedes: 0, swarms: [],
    bloody: 0, shower: 0, lions: [], pack: 2, maulT: 0, maulDealt: 0, clawed: 0,
    said: null, talking: false, tauntT: 200, hintAt: -9999, wrongN: 0, lowSaid: false, bagSaid: false, beeSaidAt: -9999,
    camX: clampCam(state.camera.x), death: null, cam: null, skipT: 0,
  };
  live = f;
  return f;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phaseK = (f: Fight) => Math.max(0, Math.min(1, 1 - f.hp / HP));
const setAct = (f: Fight, a: Act) => { f.act = a; f.actT = 0; };

/** A frame of it (Meathead's free while it's on: null; a death's a cutscene: what it scripts him to do). */
export const updateFight = (ctx: FrameContext, f: Fight): Controls | null => {
  const { state } = ctx;
  live = f; game = state;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  tickCam(f);
  tickShots(ctx, f);
  tickSmoke(f);
  tickCritters(ctx, f);
  quietCarnage(state, f);
  // (nothing dropped off a kill in the fight: the critters give no health or ammo (the user's); the refills before the
  // arena are its own)
  if (state.pickups.some(q => q.id.startsWith('pickup-'))) state.pickups = state.pickups.filter(q => !q.id.startsWith('pickup-'));
  tickBees(ctx, f);
  tickLions(ctx, f);
  tickLionsWaiting(state, f);
  if (f.mode === 'dead') {
    const walk = dying(ctx, f);
    sync(state, f);
    return walk ? ({ ...hands(), right: walk > 0, left: walk < 0 } as Controls) : hands();
  }
  if (devShower && f.act !== 'mauled' && f.act !== 'bloody') { if (devShower === 'kill') f.hp = 1; devShower = ''; showered(ctx, f); }
  takeHits(ctx, f);
  if (f.hp <= 0) { die(ctx, f, false); sync(state, f); return hands(); }
  listen(state, f);
  tucker(ctx, f);
  talk(state, f);
  camera(state, f);
  sync(state, f);
  return null;
};

/** Held in the arena: never out of it, whatever sends him flying. */
export const holdIn = (state: GameState) => {
  const p = state.player, lo = ARENA_L, hi = ARENA_R - p.width;
  if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
  if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
};

// ---- the noises he hears (where he thinks Meathead is: a bit off)
const hear = (f: Fight, x: number, y: number, err: number) => {
  const nx = x + (Math.random() - 0.5) * 2 * err;
  // (heard on his other side: round he comes, the aim swinging with him; and he says so, now and then)
  const side = (Math.sign(nx - f.tx) || f.facing) as 1 | -1;
  if (side !== f.facing && f.act !== 'mauled' && f.act !== 'bloody' && f.act !== 'getup') {
    f.facing = side;
    f.aimX = f.tx + side * Math.abs(f.aimX - f.tx);
    if (Math.random() < 0.45) bark(f, L.TF_HEAR);
  }
  f.heard = { x: nx, y, at: f.t };
};
const listen = (state: GameState, f: Fight) => {
  const p = state.player, m = pmid(state);
  if (p.health <= 0) return;
  const grounded = p.isGrounded;
  if (!grounded && f.wasGrounded && p.vel.y < -2) hear(f, m.x, m.y, ERR.jump);
  if (grounded && !f.wasGrounded) hear(f, m.x, p.pos.y + p.height - 30, ERR.land);
  f.wasGrounded = grounded;
  if (grounded && Math.abs(p.vel.x) > 1.6 && ++f.stepT % 18 === 0) hear(f, m.x, p.pos.y + p.height - 30, ERR.step);
  const shots = state.projectiles.reduce((n, q) => n + (q.owner === 'player' ? 1 : 0), 0);
  if (shots > f.pShots) hear(f, m.x, m.y, ERR.shot);
  f.pShots = shots;
};

/** Is he in the view (the shot's only taken from where Meathead can see him). */
const inView = (state: GameState, x: number, pad = 30) => x > state.camera.x + pad && x < state.camera.x + CANVAS_WIDTH - pad;

/** Tucker himself: the routine, the shuffle, the cats. */
const tucker = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, k = phaseK(f);
  f.actT++;
  // ---- his feet: a cautious shuffle toward what he heard (not too near; backing off if it is), hurrying back on screen
  const moving = f.act === 'listen' || f.act === 'reload';
  if (moving) {
    const dx = f.heard.x - f.tx, d = Math.abs(dx), v = lerp(WALK, k);
    let step = d > WANT ? Math.sign(dx) * v : d < TOO_NEAR ? -Math.sign(dx) * v * 0.8 : 0;
    // (off the screen's edge: back into it, quick)
    const lo = state.camera.x + 50, hi = state.camera.x + CANVAS_WIDTH - 50;
    if (f.tx < lo) step = HURRY; else if (f.tx > hi) step = -HURRY;
    f.tx = Math.max(ARENA_L + 50, Math.min(ARENA_R - 50, f.tx + step));
  } else if (!inView(state, f.tx, 10) && f.act !== 'mauled') {
    // (anything else carried off the screen by the camera: still hurried back on)
    f.tx += f.tx < state.camera.x ? HURRY : -HURRY;
  }
  switch (f.act) {
    case 'listen':
      // (stood listening, groping; then up comes the gun, so long as he's where Meathead can see him)
      // (the roll's made once, as the listening's done: a run, or the planted shot)
      if (Math.round(f.actT) === Math.round(lerp(LISTEN, k)) && state.player.health > 0 && Math.random() < lerp(RUN_CHANCE, k)) {
        // (off he goes, blind, flailing: either way, toward the noise or away from it, it's all the same to him)
        setAct(f, 'run');
        f.runDir = (Math.random() < 0.5 ? f.facing : -f.facing) as 1 | -1;
        f.runN = Math.round(lerp(RUN_LEN, Math.random()));
        f.runFire = Math.round(lerp(RUN_FIRE, Math.random()) * 0.6);
        f.runShot = 0;
        if (Math.random() < 0.5) bark(f, L.TF_TAUNT);
      } else if (f.actT >= lerp(LISTEN, k) && inView(state, f.tx) && state.player.health > 0) { setAct(f, 'cock'); playSound('click', 0.9, -4); }
      if (++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 160); bark(f, f.hp < HP * 0.3 && Math.random() < 0.4 ? L.TF_LOW : L.TF_TAUNT); }
      break;
    case 'cock':
      if (f.actT === Math.round(lerp(COCK, k) * 0.6)) playSound('click', 1, 2);
      if (f.actT >= lerp(COCK, k)) { setAct(f, 'aim'); f.aimX = f.tx + f.facing * 160; f.aimY = GY - 60; }
      break;
    case 'aim': {
      // (out at arm's length, wandering after what he heard: slow to follow, trembling, jerking about; worse later)
      const W = lerp(WOBBLE, k), t = f.t;
      if (Math.random() < lerp(JERK, k)) { f.jerkX = (Math.random() - 0.5) * 2 * W * 1.4; f.jerkY = (Math.random() - 0.5) * W; }
      f.jerkX *= 0.94; f.jerkY *= 0.94;
      const wantX = f.heard.x + Math.sin(t * 0.11) * W + Math.sin(t * 0.29) * W * 0.4 + f.jerkX;
      const wantY = f.heard.y + Math.sin(t * 0.13 + 1) * W * 0.5 + f.jerkY;
      const tr = lerp(TRACK, k);
      f.aimX += (wantX - f.aimX) * tr; f.aimY += (wantY - f.aimY) * tr;
      aimAngle(f);
      if (f.actT >= lerp(AIM, k)) { setAct(f, 'pan'); playSound('primed', 0.9, 4); playSound('ignite', 0.4, 10); }
      break;
    }
    case 'pan':
      // (the flash in the pan: frozen, fizzing; the shot's a beat off)
      if (f.actT % 4 === 0) state.particles.push({ pos: muzzleAt(f, true), vel: { x: (Math.random() - 0.5) * 1.6, y: -1 - Math.random() * 1.4 }, life: 14, color: f.actT % 8 ? '#FDE047' : '#FFFFFF', size: 1.5 });
      if (f.actT >= lerp(PAN, k)) fire(ctx, f);
      break;
    case 'recoil':
      f.aim += (aimTarget(f) - 0.5 - f.aim) * 0.3;
      if (f.actT >= lerp(RECOIL, k)) { setAct(f, 'reload'); playSound('reload', 0.6, -6); if (Math.random() < 0.3) bark(f, L.TF_RELOAD); }
      break;
    case 'reload':
      if (f.actT % 14 === 0) playSound('clink', 0.35, 6);
      if (f.actT >= lerp(RELOAD, k)) { setAct(f, 'listen'); f.aim = 0.6; }
      break;
    case 'bloody':
      // (showered: stood there feeling it, sniffing, wiping his heads; the cats on their way)
      break;
    case 'mauled':
      maul(ctx, f);
      break;
    case 'getup':
      if (f.actT >= 56) { setAct(f, 'listen'); f.actT = 30; }
      break;
    case 'run': {
      // (flat out, blind, arms going: a stagger in it; into the arena's end, he bounces off it and goes back the other
      // way; a shot off the hip now and then at whatever he last heard, way off)
      f.facing = f.runDir;
      f.tx += f.runDir * (lerp(RUN_V, k) + Math.sin(f.actT * 0.4) * 0.8);
      if (f.tx < ARENA_L + 50 || f.tx > ARENA_R - 50) {
        f.tx = Math.max(ARENA_L + 50, Math.min(ARENA_R - 50, f.tx));
        f.runDir = (-f.runDir) as 1 | -1;
        playSound('thud', 0.9, -6); shakeScreen(state, 4, 2);
      }
      if (f.actT % 16 === 0) playSound('thud', 0.25, 8);
      if (f.runShot > 0) f.runShot--;
      if (--f.runFire <= 0 && inView(state, f.tx) && state.player.health > 0) {
        f.runFire = Math.round(lerp(RUN_FIRE, Math.random()));
        f.aimX = f.heard.x + (Math.random() - 0.5) * 2 * RUN_ERR;
        f.aimY = f.heard.y + (Math.random() - 0.5) * RUN_ERR * 0.6;
        f.aim = aimTarget(f);
        const n = f.runN, t = f.actT, d = f.runDir;
        fire(ctx, f, true);
        // (on he runs: the shot doesn't stop him)
        f.act = 'run'; f.actT = t; f.runN = n; f.runDir = d; f.runShot = 10;
      }
      if (--f.runN <= 0) { setAct(f, 'listen'); f.actT = 0; }
      break;
    }
  }
};

const shoulder = (f: Fight) => ({ x: f.tx + f.facing * 13, y: GY - 58 });
/** The gun's angle off straight ahead (+ down) toward the aim point, kept to what an arm can do. */
const aimTarget = (f: Fight) => { const s = shoulder(f); return Math.max(-0.95, Math.min(0.75, Math.atan2(f.aimY - s.y, Math.max(20, (f.aimX - s.x) * f.facing)))); };
const aimAngle = (f: Fight) => { f.aim += (aimTarget(f) - f.aim) * 0.5; };
const muzzleAt = (f: Fight, pan = false) => {
  if (pan) { const s = shoulder(f); return { x: s.x + f.facing * Math.cos(f.aim) * 26, y: s.y + Math.sin(f.aim) * 26 - 6 }; }
  const [mx, my] = tuckerMuzzle(f.aim);
  return { x: f.tx + f.facing * mx, y: GY + my };
};

/** BANG: the ball, the smoke, the kick; the critters off and running, the bees up. */
const fire = (ctx: FrameContext, f: Fight, hip = false) => {
  const { state } = ctx, k = phaseK(f);
  const m = muzzleAt(f), a = f.aim + (Math.random() - 0.5) * 2 * SPREAD, v = lerp(BALL_V, k);
  f.shots.push({ x: m.x, y: m.y, vx: f.facing * Math.cos(a) * v, vy: Math.sin(a) * v, life: 120, dmg: hip ? HIP_DMG : BALL_DMG });
  f.smoke.push({ x: m.x, y: m.y, t: 0 });
  playSound('flintlock', 1.1, -2); playSound('boom', 0.5, 4);
  shakeScreen(state, 6, 3);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: f.facing * (1 + Math.random() * 4), y: (Math.random() - 0.5) * 3 }, life: 30 + Math.random() * 20, color: i % 3 ? 'rgba(214, 211, 209, 0.8)' : '#FDE68A', size: 3 + Math.random() * 4 });
  f.tx -= f.facing * 3;
  setAct(f, 'recoil');
  if (Math.random() < 0.5) bark(f, L.TF_FIRE);
  stampede(state, f);
  // (no bees: the user's, they're out of the fight; the swarm code stays dormant (BEES_ON) in case they come back)
  if (BEES_ON) {
    const want = f.hp < HP * SECOND_SWARM ? 2 : 1;
    if (f.swarms.filter(s => !s.gone).length < want) {
      const p = pmid(state), fromL = p.x > state.camera.x + CANVAS_WIDTH / 2;
      f.swarms.push({ x: fromL ? state.camera.x + 20 : state.camera.x + CANVAS_WIDTH - 20, y: GY - 300, t: 0, cd: 60, off: 0, gone: 0 });
      playSound('chitter', 0.9, 4);
    }
  }
};
/** The bees in Tucker's fight (off: the user's). */
const BEES_ON = false as boolean;

// ---- the ball
const tickShots = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.shots = f.shots.filter(s => {
    s.x += s.vx; s.y += s.vy; s.life--;
    const puff = (col: string) => { for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: -Math.sign(s.vx) * Math.random() * 2, y: -Math.random() * 2.5 }, life: 20, color: col, size: 2 + Math.random() * 2 }); playSound('crack', 0.25, 8); };
    // (him: ducked under, it's over him)
    const top = p.isDucking ? p.pos.y + p.height - 26 : p.pos.y;
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && s.x > p.pos.x && s.x < p.pos.x + p.width && s.y > top && s.y < p.pos.y + p.height) {
      hurtPlayer(ctx, s.dmg, 'm2:fr_tucker_shot', { x: Math.sign(s.vx) * 8, y: -5 });
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: Math.sign(s.vx) * Math.random() * 4, y: -Math.random() * 3 }, life: 26, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 });
      shakeScreen(state, 10, 5);
      if (f.mode === 'on' && Math.random() < 0.6) bark(f, L.TF_HIT);
      return false;
    }
    // (whatever's in its way: dead (the critters: anything's enough))
    // (a critter in its way: obliterated, and the ball goes on through (the user's): a burst of it, nothing left, nothing
    // dropped, no callout)
    for (const e of hazardVictims(state)) {
      if (!boxHits(e, s.x - 2, s.y - 2, 4, 4)) continue;
      if (!isCritter(e)) { hazardHit(ctx, e, 60, s.x - s.vx, 'SHOT!'); return false; }
      const at = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
      ctx.fx.spawnDeathShower(at, Math.sign(s.vx), 0.8);
      ctx.fx.spawnExplosion(at, '#B91C1C', 14, s.vx * 0.3, 10);
      playSound('splat', 0.7, 4);
      state.enemies = state.enemies.filter(o => o !== e);
    }
    // (the ground; the boulder; the woods past the ends)
    if (s.y >= GY - 1) { puff('rgba(120, 90, 60, 0.8)'); return false; }
    if (Math.abs(s.x - ROCK_X) < ROCK_HW + 10 && s.y > GY - ROCK_H) { puff('rgba(160, 160, 168, 0.8)'); return false; }
    if (s.x < ARENA_L - 40 || s.x > ARENA_R + 40 || s.life <= 0) { puff('rgba(110, 78, 48, 0.8)'); return false; }
    return true;
  });
};
const tickSmoke = (f: Fight) => { for (const s of f.smoke) { s.t++; s.y -= 0.3; } f.smoke = f.smoke.filter(s => s.t < 70); };

// ---- the stampedes
const stampede = (state: GameState, f: Fight) => {
  // (the lull: one running, or one just gone by, and the shot's left alone)
  if (f.queue.length || f.t - (f.lastStampede ?? -9999) < LULL[0] + (LULL[1] - LULL[0]) * phaseK(f)) return;
  f.lastStampede = f.t;
  const k = phaseK(f), n = Math.round(lerp(CRITTERS, k)) + (Math.random() < 0.5 ? 1 : 0);
  // (they come from one end, the view's edge, and run from the bang across it: all of them one way, and a stampede
  // that comes while the last is still running goes the same way (the user's: never two ways at once))
  const running = f.queue.length ? f.queue[0].dir : (state.enemies.find(e => isCritter(e) && e.health > 0 && !e.isBlownAway)?.facing as 1 | -1 | undefined);
  const dir: 1 | -1 = running ?? (Math.random() < 0.5 ? 1 : -1);
  let at = f.t + FIRST_IN;
  for (let i = 0; i < n; i++) {
    const fly = Math.random() < FLY_SHARE;
    const c = fly ? FLYING_CRITTERS[Math.floor(Math.random() * FLYING_CRITTERS.length)] : GROUND_CRITTERS[Math.floor(Math.random() * GROUND_CRITTERS.length)];
    const d = dir;
    const y = fly ? GY - (c === 'bat' ? 150 + Math.random() * 80 : 60 + Math.random() * 70) : GY;
    f.queue.push({ at, c, dir: d, y, sp: critterSpeed(c) * (1 + 0.3 * k) * (0.9 + Math.random() * 0.25) });
    at += Math.round(lerp(GAP, Math.random()));
  }
  f.rustle = { x: dir > 0 ? state.camera.x + 10 : state.camera.x + CANVAS_WIDTH - 10, t: FIRST_IN + 10 };
  f.stampedes++;
  if (f.stampedes === 1 || Math.random() < 0.35) setTimeout(tok(() => { if (live === f && f.mode === 'on') bark(f, L.TF_STAMPEDE); }), 900);
};
const tickCritters = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.rustle) {
    // (the tell: the undergrowth at that edge thrashing, leaves flying, the chatter)
    if (f.rustle.t % 5 === 0) state.particles.push({ pos: { x: f.rustle.x + (Math.random() - 0.5) * 20, y: GY - 10 - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: ['#B45309', '#4D7C0F', '#92400E'][f.rustle.t % 3], size: 3 });
    if (f.rustle.t % 12 === 0) playSound('chitter', 0.5, 6);
    if (--f.rustle.t <= 0) f.rustle = null;
  }
  // (in: from just off the view's edge at their end, running; a lot of them, but never more than MAX_CRITTERS about at
  // once (the user's): the rest wait their turn till some are gone)
  let about = state.enemies.reduce((n, e) => n + (isCritter(e) && e.health > 0 && !e.isBlownAway ? 1 : 0), 0);
  // (their bodies: only the newest few left lying; the oldest go (each a live paint when it's tumbling: the slowdown))
  const dead = state.enemies.filter(e => isCritter(e) && (e.health <= 0 || e.isBlownAway));
  if (dead.length > MAX_CORPSES) { const drop = new Set(dead.slice(0, dead.length - MAX_CORPSES)); state.enemies = state.enemies.filter(e => !drop.has(e)); }
  f.queue = f.queue.filter(q => {
    if (f.t < q.at) return true;
    if (f.mode !== 'on') return false;
    if (about >= MAX_CRITTERS) { q.at = f.t + 6; return true; }
    about++;
    const ex = q.dir > 0 ? state.camera.x - 30 : state.camera.x + CANVAS_WIDTH + 30;
    const e = makeKindEnemy(kindOf(q.c) as EnemyKind, ex, q.y);
    e.facing = q.dir; e.aiX = q.sp; e.aiY = q.y - e.height; e.variant = Math.floor(Math.random() * 7); e.seen = true; e.aiState = 'run';
    // (they give nothing back (the user's): no heal or ammo off a beatdown or a shakedown; no drops either, see tickFight)
    e.noHeal = true;
    // (fewer of them now (toned down): each fills the soul sucker's bag that much more, so the weakness comes as soon)
    (e as typeof e & { goreMul?: number }).goreMul = 1.8;
    // (they run straight through Tucker and each other, harmless to him: never shoved about by anybody (the playtest: they
    // got stuck on him))
    e.noCrowd = true;
    state.enemies.push(e);
    return false;
  });
  // (they hurt running into him, a little (the user's: "the critters should hurt... not a lot, but chippable if you are
  // reckless"): their own AI runs them, so the engine's bump never got its turn; once a hit, the usual flinch after)
  { const p = state.player;
    if (f.mode === 'on' && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && state.frame >= (p.noContactUntil ?? -1) && !p.untouchable) {
      const hb = p.isDucking ? { x: p.pos.x + 2, y: p.pos.y + p.height - 26, w: p.width - 4, h: 26 } : { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
      const hit = state.enemies.find(e => isCritter(e) && e.health > 0 && !e.isBlownAway && !e.puppet && e.pos.x < hb.x + hb.w && e.pos.x + e.width > hb.x && e.pos.y < hb.y + hb.h && e.pos.y + e.height > hb.y);
      if (hit) hurtPlayer(ctx, critterDmg(hit), hit.kind!, { x: (hit.facing ?? 1) * 4, y: -3 });
    } }
  // (the critters running through him (the user's): they don't hurt him or stop what he's at, they jostle him along
  // the way they're going, a stumble each, a little off; it makes where he'll be a lot harder to call)
  if (f.mode === 'on' && f.act !== 'mauled' && f.act !== 'bloody' && f.act !== 'getup') {
    for (const e of state.enemies) {
      if (!isCritter(e) || e.health <= 0 || e.isBlownAway || e.pos.y + e.height < GY - 90) continue;
      if (Math.abs(e.pos.x + e.width / 2 - f.tx) > 26 + e.width / 2) continue;
      f.shove += (e.facing ?? 1) * (0.35 + Math.random() * 0.45); f.bumped = Math.max(f.bumped, 18);
      if (Math.random() < 0.04) playSound('thud', 0.3, 6);
    }
  }
  if (f.shove) {
    f.shove = Math.max(-5, Math.min(5, f.shove)) * 0.86;
    f.tx = Math.max(ARENA_L + 50, Math.min(ARENA_R - 50, f.tx + f.shove + (Math.random() - 0.5) * Math.abs(f.shove) * 0.6));
    if (Math.abs(f.shove) < 0.05) f.shove = 0;
  }
  if (f.bumped > 0) f.bumped--;
  // (out: off the view's far edge (or the arena's), just gone: never a kill, never a callout)
  state.enemies = state.enemies.filter(e => {
    // (a lion leaving: off either edge of the view (it came on in it; the sucker can turn it round), or at the wall it's
    // heading for)
    if (isLion(e) && e.health > 0 && !e.isBlownAway) {
      if (MAULING.has(e)) return true;
      const x = e.pos.x + e.width / 2, dir = e.facing ?? 1;
      // (a short lope, then the leap out past the lens (the user's: out into the foreground): the fight's own again from
      // there, out of reach; not while the sucker's on it or he's got hold of it)
      if ((e.aiTimer ?? 0) >= LION.lope && !beingSucked(e, state.frame) && grabHolding() !== e && !e.puppet) {
        f.lions.push({ x, y: GY, vx: 0, vy: 0, dir: dir > 0 ? 1 : -1, mode: 'leapOut', t: 0, wait: 0, side: e.variant ? 1 : -1, carry: null, z: 0 });
        playSound('whoosh', 0.7, -4);
        return false;
      }
      return !(x < state.camera.x - 70 || x > state.camera.x + CANVAS_WIDTH + 70 || (dir > 0 ? e.pos.x + e.width >= ARENA_R - 4 : e.pos.x <= ARENA_L + 4));
    }
    if (!isCritter(e)) return true;
    // (any critter a little way off the view, either side, above or below (knocked back off the near edge, flung up,
    // left behind as the camera moves), live or a body: gone (the user's: for the slowdown and the chaos))
    const x = e.pos.x + e.width / 2, y = e.pos.y + e.height / 2, dir = e.facing ?? 1;
    const outside = x < state.camera.x - 80 || x > state.camera.x + CANVAS_WIDTH + 80 || y < state.camera.y - 80 || y > state.camera.y + CANVAS_HEIGHT + 80;
    if (outside) return false;
    if (e.health <= 0 || e.isBlownAway) return true;
    // (the arena's walls stand at the view's edges once the camera's against them: reaching a wall, it's out of the scene
    // (they used to stop dead at the wall, off view only by a whisker, and pile up there for good: the playtest))
    const off = dir > 0
      ? x > state.camera.x + CANVAS_WIDTH + 30 || e.pos.x + e.width >= ARENA_R - 4
      : x < state.camera.x - 30 || e.pos.x <= ARENA_L + 4;
    return !off;
  });
};
/** Every live critter (and lion leaving) gone (a death's cutscene: nothing running about in it). */
const clearCritters = (state: GameState, f: Fight) => { f.queue = []; f.rustle = null; state.enemies = state.enemies.filter(e => !(isCritter(e) || isLion(e)) || e.health <= 0 || !!e.isBlownAway); };

// ---- the bees
const tickBees = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player, k = phaseK(f);
  f.swarms = f.swarms.filter(s => {
    s.t++;
    if (s.gone) { s.gone++; s.x += Math.sin(s.t * 0.21) * 1.5 + 0.8; s.y -= 2; return s.gone < 120; }
    if (f.mode !== 'on') { s.gone = 1; return true; }
    const m = pmid(state), v = lerp(BEE_V, k);
    let tx = m.x, ty = m.y - 10;
    // (just stung him: off up and away a moment)
    if (s.off > 0) { s.off--; tx = s.x + (s.x < m.x ? -120 : 120); ty = m.y - 140; }
    const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy) || 1;
    s.x += (dx / d) * Math.min(v, d) + Math.sin(s.t * 0.3) * 1.1;
    s.y += (dy / d) * Math.min(v, d) + Math.cos(s.t * 0.27) * 1.1;
    if (s.cd > 0) s.cd--;
    if (s.off <= 0 && s.cd <= 0 && p.health > 0 && !p.inCutscene && Math.hypot(m.x - s.x, m.y - s.y) < 30) {
      s.cd = STING_GAP; s.off = BEE_OFF;
      hurtPlayer(ctx, STING, 'm2:fr_glade_bees', undefined, 4);
      if (f.t - f.beeSaidAt > 600 && Math.random() < 0.5) { f.beeSaidAt = f.t; bark(f, L.TF_BEES); }
    }
    // (any critter they catch: stung (anything's enough))
    // (the middle of the swarm only: most of a stampede gets past them, for the sucker)
    for (const e of hazardVictims(state)) if (isCritter(e) && Math.hypot(e.pos.x + e.width / 2 - s.x, e.pos.y + e.height / 2 - s.y) < 16) hazardHit(ctx, e, 30, s.x, 'STUNG!', { knock: 3 });
    if (s.t % 12 === 0) playSound('chitter', 0.55, 10);
    return true;
  });
};

// ---- the weakness: showered, the cats, the mauling
const showered = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, k = phaseK(f);
  setAct(f, 'bloody'); f.bloody = 1; f.shower = 0;
  playSound('splat', 1, -6); playSound('gush', 0.7, -2);
  tuckerSays(f, L.TF_BLOODY);
  mhSays(state, L.MH_SPRAY, false);
  // (the last lot still slinking off: no new ones till they're gone or dead (the user's): the scent waits for them)
  if (lionsAbout(state)) { lionsWaiting = true; return; }
  callLions(state, f, k);
};
/** A shower's lions held back till the last lot have left or died. */
let lionsWaiting = false;
const lionsAbout = (state: GameState) => state.enemies.some(e => isLion(e) && e.health > 0 && !e.isBlownAway) || !!live?.lions.some(l => l.mode === 'leapOut');
/** Each frame: a held-back shower's lions come once the last lot's gone. */
const tickLionsWaiting = (state: GameState, f: Fight) => {
  if (!lionsWaiting || f.mode !== 'on') { if (f.mode !== 'on') lionsWaiting = false; return; }
  if (f.act !== 'bloody') { lionsWaiting = false; return; }
  if (!lionsAbout(state)) { lionsWaiting = false; callLions(state, f, phaseK(f)); }
};
const callLions = (state: GameState, f: Fight, k: number) => {
  // (out of the woods, one from each end (a third later), a roar off in the trees first)
  const n = k > 0.6 ? 3 : 2;
  f.lions = []; f.pack = n;
  for (let i = 0; i < n; i++) {
    const fromL = i % 2 === 0 ? f.tx > (ARENA_L + ARENA_R) / 2 : f.tx <= (ARENA_L + ARENA_R) / 2;
    f.lions.push({ x: fromL ? Math.max(LION_FROM_L, state.camera.x - 80) : Math.min(LION_FROM_R, state.camera.x + CANVAS_WIDTH + 80), y: GY, vx: 0, vy: 0, dir: fromL ? 1 : -1, mode: 'wait', t: 0, wait: LION_WAIT + i * 18, side: fromL ? -1 : 1, carry: null });
  }
  setTimeout(tok(() => { playSound('roar', 0.7, 6); playSound('snort', 0.4, 10); }), 400);
};

const tickLions = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  for (const l of f.lions) {
    l.t++;
    switch (l.mode) {
      case 'wait':
        if (l.t >= l.wait) {
          // (the user's: in out of the foreground, Mode 7 style: from right up at the lens, off to its side of the view,
          // one bound down into the arena a way in from the edge it came from)
          l.mode = 'leapIn'; l.t = 0; l.z = 1;
          l.x = l.dir > 0 ? Math.max(ARENA_L + 60, state.camera.x + 150) : Math.min(ARENA_R - 60, state.camera.x + CANVAS_WIDTH - 150);
          playSound('roar', 0.6, 4 + Math.random() * 4); playSound('whoosh', 0.7, -6);
          if (l === f.lions[0]) mhSays(state, L.MH_LIONS, true);
        }
        break;
      case 'leapIn': {
        const u = Math.min(1, l.t / LEAP_IN_T);
        l.z = 1 - u; l.y = GY - Math.sin(u * Math.PI) * LEAP_H; l.x += l.dir * 2.5;
        if (u >= 1) { l.z = 0; l.y = GY; l.mode = 'run'; l.t = 0; playSound('thud', 0.8, -4); shakeScreen(state, 4, 3); }
        break;
      }
      case 'leapOut': {
        const u = Math.min(1, l.t / LEAP_OUT_T);
        l.z = u; l.y = GY - Math.sin(u * Math.PI) * LEAP_H; l.x += l.dir * LION.walk;
        if (u >= 1) l.mode = 'gone';
        break;
      }
      case 'run': {
        // (flat out at him; near, the pounce)
        const to = f.tx - l.side * 30;
        l.x += l.dir * LION_V;
        if ((to - l.x) * l.dir < 120) { l.mode = 'pounce'; l.t = 0; l.vy = -7; l.vx = (to - l.x) / 26; playSound('whoosh', 0.8, -4); }
        break;
      }
      case 'pounce':
        l.x += l.vx; l.vy += 0.55; l.y += l.vy;
        if (l.y >= GY) { l.y = GY; l.mode = 'maul'; l.t = 0; playSound('thud', 0.9, -6); if (f.mode === 'on') l.e = maulingCat(state, l); if (f.act !== 'mauled' && f.mode === 'on') startMaul(ctx, f); }
        break;
      case 'maul':
        l.x += ((f.tx - l.side * 30) - l.x) * 0.2;
        if (l.e) {
          // (killed, or sucked off him: gone from the pile (the engine has the body))
          if (l.e.health <= 0 || l.e.isBlownAway || !state.enemies.includes(l.e)) { MAULING.delete(l.e); l.e = undefined; l.mode = 'gone'; break; }
          pinCat(l);
        }
        if (l.t % 9 === 0) state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 40, y: GY - 10 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 30, color: Math.random() < 0.6 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 });
        if (l.t % 16 === 0) playSound(Math.random() < 0.5 ? 'squish' : 'snort', 0.5, Math.random() * 6);
        break;
      case 'drag': {
        // (half of him: backing off with it, slower, the torn end dripping)
        const half = l.carry === 'top' || l.carry === 'legs';
        l.x += l.dir * (half ? 2.3 : 3.4); l.y += (GY - l.y) * 0.3;
        if (half && l.t % 5 === 0) state.particles.push({ pos: { x: l.x - l.dir * 70, y: GY - 16 }, vel: { x: (Math.random() - 0.5) * 1.2, y: 0.5 }, life: 26, color: l.t % 10 ? '#7F1D1D' : '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
        if (l.x < ARENA_L - 160 || l.x > ARENA_R + 160 || !inView(state, l.x, half ? -200 : -140)) l.mode = 'gone';
        break;
      }
      case 'tug':
        // (placed by the kill (lionsKill): just the noise of it)
        if (l.t % 20 === 0) playSound('snort', 0.4, 4 + Math.random() * 4);
        break;
    }
  }
  f.lions = f.lions.filter(l => l.mode !== 'gone');
};

const startMaul = (ctx: FrameContext, f: Fight) => {
  setAct(f, 'mauled'); f.maulT = 0; f.maulDealt = 0;
  playSound('screams', 0.6, -4); playSound('roar', 0.8, 2); shakeScreen(ctx.state, 12, 6);
  tuckerSays(f, L.TF_MAULED);
  // (a brief punch-in on it)
  f.cam = { t: 0, acc: 0, z: 1, zt: 1.45, top: 1.45, slow: 1 };
};
/** A frame of the mauling: the damage in ticks; his death if it's that; then the cats off. */
const maul = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.maulT++;
  // (the punch-in's on Tucker: nothing he can't see touches him while it's on, and for a beat after it pulls back out)
  state.player.noContactUntil = Math.max(state.player.noContactUntil ?? 0, state.frame + 45);
  if (f.cam && f.cam.slow === 1 && f.maulT === PUNCH_T) f.cam.zt = 1;
  // (the cats on him: whichever have got there pile in)
  for (const l of f.lions) if (l.mode === 'run' || l.mode === 'wait') { l.mode = 'run'; }
  const tickEvery = Math.floor(MAUL_T / (MAUL_TICKS + 1));
  // (every cat killed or sucked off him early: it's over, and he's got off light)
  const on = f.lions.filter(l => l.mode === 'maul').length, coming = f.lions.some(l => l.mode === 'run' || l.mode === 'pounce' || l.mode === 'leapIn' || l.mode === 'wait');
  if (!on && !coming && f.maulT > 4) f.maulT = MAUL_T;
  if (f.maulT % tickEvery === 0 && f.maulDealt < MAUL_TICKS && on) {
    f.maulDealt++;
    // (each cat its share: the fewer left on him, the less he takes)
    const dmg = MAUL_DMG / MAUL_TICKS * Math.min(1, on / Math.max(1, f.pack));
    f.hp -= dmg; f.flash = 6;
    ctx.fx.spawnDamageNumber({ x: f.tx - 10, y: GY - 60 }, Math.round(dmg), true);
    playSound('crunch', 0.8, -2 + Math.random() * 4); playSound('splat', 0.6, 2);
    shakeScreen(state, 5, 3);
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 30, y: GY - 16 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 4 }, life: 40, color: ['#DC2626', '#B91C1C', '#7F1D1D', '#F4C2B0'][i % 4], size: 2 + Math.random() * 3, grav: 0.35, chunk: i % 4 === 3 });
    if (f.hp <= 0) { die(ctx, f, true); return; }
  }
  if (f.maulT >= MAUL_T) {
    // (done with him: off back into the trees, red to the eyes; real enemies now, each one (critters.ts): sucked up,
    // killed, or gone off the view's edge, none of it touches the next shower's cats)
    for (const l of f.lions) {
      if (l.e) { MAULING.delete(l.e); l.e.aiTimer = 0; l.e.facing = l.side < 0 ? -1 : 1; }
      else if (l.mode !== 'gone') leave(state, l);
    }
    f.lions = [];
    f.clawed++; f.bloody = 0.25; f.shower = 0;
    setAct(f, 'getup');
    tuckerSays(f, L.TF_GETUP);
  }
};

/** A cat landing on him: a real enemy from here (harmless to Meathead), held on him by the fight (pinCat). */
const maulingCat = (state: GameState, l: Lion) => {
  const e = makeKindEnemy(LION_KIND as EnemyKind, l.x, GY);
  e.seen = true; e.variant = l.side < 0 ? 0 : 1; e.noHeal = true; e.noCrowd = true;
  Object.assign(e, { poiseMul: LION.poiseMul, goreMul: 1 / LION.poiseMul });
  MAULING.add(e);
  state.enemies.push(e);
  const pinned = { ...l, e };
  pinCat(pinned);
  return e;
};
/** Held where the fight has it, facing him, whatever's knocked it about. */
const pinCat = (l: Lion) => {
  const e = l.e!;
  e.pos.x = l.x - e.width / 2; e.pos.y = GY - e.height; e.vel.x = 0; e.vel.y = 0;
  e.facing = l.side < 0 ? 1 : -1;
};
/** A cat done with him, made a real enemy where it stands, slinking off the way it came (critters.ts LION_KIND). */
const leave = (state: GameState, l: Lion) => {
  const e = makeKindEnemy(LION_KIND as EnemyKind, l.x, GY);
  e.pos.x = l.x - e.width / 2; e.pos.y = GY - e.height; e.vel.x = 0; e.vel.y = 0;
  e.facing = l.side < 0 ? -1 : 1; e.seen = true; e.variant = l.side < 0 ? 0 : 1;
  // (it gives nothing back, like the critters: no heal or ammo off a beatdown or a shakedown; no drops, see updateFight)
  e.noHeal = true; e.noCrowd = true;
  // (very hard to suck up (the user's): ×3 the pulling, the bag off it the same as it was)
  Object.assign(e, { poiseMul: LION.poiseMul, goreMul: 1 / LION.poiseMul });
  state.enemies.push(e);
};

// ---- hits on him
const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE;
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};
const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  if (dealt <= 0 || !state.enemies.includes(e)) return;
  // (heard that: he knows where Meathead is)
  hear(f, pmid(state).x, pmid(state).y, ERR.hit);
  // (the cats on him: nothing else gets a look in)
  if (f.act === 'mauled' || f.iframes > 0) return;
  const plain = plainHit(state, melee);
  // (no hint at a weapon he hasn't got (the user's))
  if (plain === null && state.player.availableWeapons.includes('SOUL_SUCKER') && state.player.currentWeapon !== 'SOUL_SUCKER' && (++f.wrongN === 2 || f.wrongN % 5 === 0) && f.t - f.hintAt > HINT_GAP) {
    f.hintAt = f.t; mhSays(state, L.MH_HINT, false);
  }
  const dmg = plain ?? Math.max(1, dealt * SHARE);
  f.hp -= dmg; f.iframes = IFRAMES; f.flash = 8;
  // (stomped on or bashed up close: he bolts, blind, away from it (no standing there to be dive kicked again and again))
  if (melee && f.hp > 0 && (f.act === 'listen' || f.act === 'cock' || f.act === 'aim' || f.act === 'pan' || f.act === 'recoil' || f.act === 'reload')) {
    setAct(f, 'run');
    f.runDir = (pmid(state).x < f.tx ? 1 : -1) as 1 | -1;
    f.runN = 50 + Math.round(Math.random() * 40);
    f.runFire = 40; f.runShot = 0;
  }
  // (the user's: "i don't want the player to be given more than 5 uninterrupted seconds spamming the same attack on a
  // boss": the same hit landing for 4 s. Shot at from one spot (he hears every shot, near enough): the gun up at it now,
  // or off the hip if he's running; chased down and kicked on his run: shoved off him (no hurt) and away the other way)
  if (f.hp > 0 && f.act !== 'bloody' && f.act !== 'getup' && spamTick(f.spam, state.frame, hitKey(state.player, melee))) {
    if (melee) {
      swatOff(state, f.tx);
      setAct(f, 'run'); f.runDir = (pmid(state).x < f.tx ? 1 : -1) as 1 | -1; f.runN = 60 + Math.round(Math.random() * 40); f.runFire = 30; f.runShot = 0;
    } else if (f.act === 'run') f.runFire = 1;
    else if (f.act === 'listen' || f.act === 'reload' || f.act === 'recoil') { setAct(f, 'cock'); playSound('click', 0.9, -4); bark(f, L.TF_HEAR); }
  }
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.tx, y: GY - 60 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, 2);
  ctx.fx.spawnDamageNumber({ x: f.tx - 10, y: GY - TUCKER_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (f.hp > 0 && Math.random() < 0.25) bark(f, L.TF_HURT);
};

// ---- talking: low once; the bag's first spray's worth; the hints after stampedes
const talk = (state: GameState, f: Fight) => {
  if (!f.lowSaid && f.hp < HP * 0.25 && !f.said) { f.lowSaid = true; tuckerSays(f, L.TF_LOW); }
  if (!f.bagSaid && goreBag() >= SPRAY) { f.bagSaid = true; mhSays(state, L.MH_BAG, false); }
  if (f.stampedes >= 2 && f.stampedes % 3 === 2 && state.player.availableWeapons.includes('SOUL_SUCKER') && goreBag() < SPRAY && f.t - f.hintAt > HINT_GAP && f.act === 'reload' && f.actT === 20) { f.hintAt = f.t; mhSays(state, L.MH_HINT, false); }
};

// ---- the camera: on them both while it can (the arena's two screens), always on Meathead
const camera = (state: GameState, f: Fight) => {
  const m = pmid(state).x;
  let want = (m + f.tx) / 2 - CANVAS_WIDTH / 2;
  want = Math.max(m - CANVAS_WIDTH + 90, Math.min(m - 90, want));
  f.camX += (clampCam(want) - f.camX) * 0.1;
  state.cameraOverride = { x: Math.round(f.camX), y: GY - 550 };
};

/** The engine's Tucker, where he is (in the play plane at his x; out of reach while the cats have him down). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = f.tx - e.width / 2; e.pos.y = GY - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (ctx: FrameContext, f: Fight, lions: boolean) => {
  const { state } = ctx, p = state.player;
  if (f.mode === 'dead') return;
  token++;
  silenceAll();
  f.mode = 'dead'; f.said = null; f.talking = false;
  state.enemies = state.enemies.filter(o => o !== f.e);
  for (const l of f.lions) if (l.e) { MAULING.delete(l.e); state.enemies = state.enemies.filter(o => o !== l.e); l.e = undefined; }
  clearCritters(state, f);
  f.shots = [];
  for (const s of f.swarms) s.gone = s.gone || 1;
  state.damageNumbers = [];
  p.inCutscene = true; p.vel.x = 0; p.isDucking = false;
  f.skipT = 0;
  f.death = { how: lions ? 'lions' : 'grizzly', t: 0, step: lions ? 'close' : 'fall', at: 0, done: false, bx: 0, bdir: 1, bear: null, pull: 0, lie: f.facing, ty: GY, tvy: 0, tear: 0, eL: 0, eR: 0, tugSide: 0, tugT: 99, snap: -1, k: 0, cap: null };
  if (lions) {
    // (the kill cam: slowed, pushed in on them)
    f.cam = { t: 0, acc: 0, z: f.cam?.z ?? 1, zt: 2, top: 2, slow: 0.3 };
    playSound('roar', 1, -2); playSound('screams', 0.7, -6);
    for (const l of f.lions) if (l.mode !== 'maul') { l.mode = 'maul'; l.x = f.tx - l.side * 30; l.y = GY; l.z = 0; }
    f.lions = f.lions.filter(l => l.mode !== 'gone');
  } else {
    f.cam = null;
    playSound('hurt', 0.8, -4);
  }
};

const next = (d: Death, step: string) => { d.step = step; d.at = d.t; };

/** A frame of a death; which way it walks Meathead (0: not). */
const dying = (ctx: FrameContext, f: Fight): number => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++; f.skipT++;
  p.inCutscene = true;
  // (all or nothing: skipped, it's over: what's left of him, the beasts gone)
  if (!d.done && f.skipT > SKIP_AFTER) {
    offerSkip();
    if (takeSkip()) {
      token++; silenceAll(); state.playerVulgarityTimer = 0;
      f.said = null; f.talking = false;
      f.lions = []; d.bear = null; d.k = 1; d.tear = 1;
      next(d, 'over'); d.cap = { x: f.tx + 40, y: GY - 4, vx: 0, vy: 0, rot: 0.3 };
      if (f.cam) { f.cam.zt = 1; f.cam.slow = 1; }
      d.done = true;
      return 0;
    }
  }
  const walk = d.how === 'grizzly' ? grizzly(ctx, f, d) : (lionsKill(ctx, f, d), 0);
  // (the camera: on him, kept to the arena)
  // (the bear in it as it comes; not followed off: it walks out of the view)
  const want = clampCam((d.step === 'walk' || d.step === 'beat' ? (pmid(state).x + f.tx) / 2 : d.bear && d.bx && d.step !== 'chunks' ? (d.bx + f.tx) / 2 : f.tx) - CANVAS_WIDTH / 2);
  f.camX += (want - f.camX) * 0.08;
  state.cameraOverride = { x: Math.round(f.camX), y: GY - 550 };
  // (the cap, knocked off: falling, coming to rest)
  if (d.cap) { const c = d.cap; c.vy += 0.4; c.x += c.vx; c.y += c.vy; c.rot += c.vx * 0.08; if (c.y >= GY - 4) { c.y = GY - 4; c.vy = 0; c.vx *= 0.8; } }
  // (it never hangs)
  if (d.t > 3000) d.done = true;
  return walk;
};

/** THE STANDARD DEATH: down; the walk up; AAHHH; gloating, the grizzly behind him; its mauling; chunks everywhere. */
const grizzly = (ctx: FrameContext, f: Fight, d: Death): number => {
  const { state } = ctx, p = state.player, t = d.t - d.at;
  const m = pmid(state).x;
  let walk = 0;
  switch (d.step) {
    case 'fall':
      // (staggering, the last words, over flat on his back)
      if (t === 6) tuckerSays(f, L.TF_FALL, tok(() => next(d, 'down')));
      break;
    case 'down':
      if (t === 1) { playSound('thud', 1, -8); shakeScreen(state, 6, 3); f.said = null; }
      if (t >= 50) next(d, 'walk');
      break;
    case 'walk': {
      // (Meathead walks up to him himself)
      const to = f.tx - (Math.sign(f.tx - m) || 1) * 70;
      if (Math.abs(to - m) > 6 && t < 400 && p.isGrounded) walk = Math.sign(to - m);
      else if (p.isGrounded || t >= 400) { p.vel.x = 0; p.facing = (Math.sign(f.tx - m) || 1) as 1 | -1; next(d, 'ask'); }
      break;
    }
    case 'ask':
      p.vel.x = 0;
      if (t === 6) mhSays(state, L.MH_WALKUP, true, () => next(d, 'beat'));
      break;
    case 'beat':
      // (a beat: nothing; he leans in...)
      if (t > 20 && t < 40) p.pos.x += 0.5 * p.facing;
      if (t >= 60) {
        // (AAHHH: up at him, the jumpscare)
        next(d, 'pop');
        playSound('slam', 1, -10); playSound('alarm', 1, 14); playSound('roar', 0.4, 12); shakeScreen(state, 18, 10);
        d.tvy = -7; d.ty = GY;
        f.facing = (Math.sign(m - f.tx) || 1) as 1 | -1;
        tuckerSays(f, L.TF_POP);
        p.vel.x = -4.5 * p.facing; p.vel.y = -7;
      }
      break;
    case 'pop':
      if (d.tvy !== 0 || d.ty < GY) { d.tvy += 0.6; d.ty += d.tvy; if (d.ty >= GY) { d.ty = GY; d.tvy = 0; } }
      if (t >= 56 && !f.talking) { next(d, 'popped'); mhSays(state, L.MH_POPPED, true, () => next(d, 'gloat')); }
      break;
    case 'popped':
      break;
    case 'gloat':
      // (gloating, jabbing the ledger finger the wrong way; the grizzly up out of nowhere behind him, the far side from
      // Meathead, walking up quiet, then reared up over him)
      if (t === 1) {
        // (in from whichever side of him has more room to the arena's end (the user's), from off the view's edge)
        d.bdir = (f.tx - ARENA_L > ARENA_R - f.tx ? 1 : -1) as 1 | -1;
        d.bx = d.bdir > 0 ? Math.min(f.tx - 480, f.camX - 120) : Math.max(f.tx + 480, f.camX + CANVAS_WIDTH + 120);
        d.bear = 'walk';
        tuckerSays(f, L.TF_GLOAT, tok(() => { next(d, 'swipe'); d.bear = 'rear'; playSound('roar', 1.2, -6); shakeScreen(state, 12, 6); }));
      }
      if (d.bear === 'walk') {
        const to = f.tx - d.bdir * 70;
        if ((to - d.bx) * d.bdir > 0) d.bx += d.bdir * Math.max(2.4, Math.abs(to - d.bx) / 90); else d.bear = 'stand';
        if (t % 40 === 0) playSound('snort', 0.4, -4);
      }
      break;
    case 'swipe':
      // (up behind him, reared up roaring; down onto him)
      d.bx += ((f.tx - d.bdir * 60) - d.bx) * 0.2;
      if (t === 30) { d.bear = 'maul'; d.bx = f.tx - d.bdir * 50; playSound('slam', 1, -8); playSound('crunch', 1, -4); shakeScreen(state, 16, 8); next(d, 'close'); f.said = null; }
      break;
    case 'close':
      // (the close-up: its mauling, animated; his last words in it)
      d.k = Math.min(1, t / 250);
      if (t === 4) { playSound('roar', 1, -4); playSound('screams', 0.6, -2); }
      if (t === 40 || t === 80 || t === 132 || t === 186) { playSound('crunch', 1, -6 + t / 40); playSound('splat', 0.9, -2); shakeScreen(state, 8, 4); }
      if (t % 30 === 15) playSound('gush', 0.4, -4);
      if (t === 120) tuckerSays(f, L.TF_LAST_BEAR);
      if (d.k >= 1 && !f.talking) {
        // (wide again, pushed in: flat on his back under it, a forepaw pinning his chest, its jaws on his head)
        next(d, 'neck');
        d.lie = (-d.bdir) as 1 | -1; d.bear = 'tug'; d.pull = 0; d.bx = f.tx - BEAR_AT * d.bdir;
        f.cam = { t: 0, acc: 0, z: f.cam?.z ?? 1, zt: NECK_ZOOM, top: NECK_ZOOM, slow: 1 };
        playSound('crunch', 1, -6); playSound('roar', 0.7, -10); shakeScreen(state, 8, 4);
        d.cap = { x: f.tx + d.bdir * 60, y: GY - 30, vx: d.bdir * 2.6, vy: -6, rot: 0 };
      }
      break;
    case 'neck': {
      // (the head hauled up off him a wrench at a time, his neck drawn out longer and thinner each one: the skin, the
      // skin splitting, the raw meat of it; a beat of it quivering at full stretch; then it comes away)
      const at = NECK_TUGS.indexOf(t);
      if (at >= 0) {
        d.pull = Math.min(BEAR_TUG_STEPS - 1, at + 1);
        playSound('squish', 1, -6 + at); playSound('crunch', 0.5 + at * 0.07, -12 + at * 2); shakeScreen(state, 3 + at, 3);
        if (at === 1 || at === 4) playSound('screams', 0.5, 4 + at);
        if (at >= 3) { const g = neckOf(f, d); for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: (g.colX + g.sockX) / 2 + (Math.random() - 0.5) * 6, y: (g.colY + g.sockY) / 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 34, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 }); }
      }
      if (t > NECK_TUGS[NECK_TUGS.length - 1] && t % 7 === 0) playSound('squish', 0.35, 10);
      if (t === 2) playSound('screams', 0.7, 0);
      if (t >= NECK_POP) {
        // (it comes away: a spray off the stump, the bear's head jerked back with his in its jaws)
        const g = neckOf(f, d);
        next(d, 'chunks');
        playSound('gorespray', 1, -2); playSound('crunch', 1.2, -12); playSound('splat', 1, -4); shakeScreen(state, 14, 7);
        ctx.fx.spawnDeathShower({ x: g.colX, y: g.colY - 6 }, d.bdir, 0.5, false, 50);
        for (let i = 0; i < 22; i++) {
          const a = -Math.PI / 2 + d.bdir * 0.5 + (Math.random() - 0.5) * 1.4, sp = 3 + Math.random() * 6;
          state.particles.push({ pos: { x: g.colX, y: g.colY - 4 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 40 + Math.random() * 30, color: ['#DC2626', '#B91C1C', '#7F1D1D', '#F4C2B0'][i % 4], size: 2 + Math.random() * 3, grav: 0.32, chunk: i % 5 === 0 });
        }
      }
      break;
    }
    case 'chunks': {
      // (his body slumped headless, the stump pumping in spurts, weaker each; the bear turns and walks off the way it
      // came with his head, gone once it's off the view (whichever edge); it's over when Meathead's had his say and the
      // bear's gone: it never hangs about on screen into the VICTORY (the playtest))
      if (t < 72 && t % 8 === 0) {
        const g = neckOf(f, d), n = Math.max(1, 4 - Math.floor(t / 20));
        for (let i = 0; i < n; i++) state.particles.push({ pos: { x: g.colX + d.lie * -4, y: g.colY - 3 }, vel: { x: -d.lie * (1 + Math.random() * 2.4), y: -3 - Math.random() * (5 - t / 20) }, life: 40, color: i % 2 ? '#DC2626' : '#B91C1C', size: 2 + Math.random() * 2.4, grav: 0.32 });
        if (t % 16 === 0) playSound('gush', 0.6 - t / 160, -2);
      }
      if (t === 40) { d.bear = 'walk'; d.bdir = (-d.bdir) as 1 | -1; if (f.cam) f.cam.zt = 1; }
      if (d.bear === 'walk' && t > 40) {
        d.bx += d.bdir * 3.2;
        if (t % 40 === 0) playSound('snort', 0.4, -4);
        if (d.bx < f.camX - 140 || d.bx > f.camX + CANVAS_WIDTH + 140) d.bear = null;
      }
      if (t === 64) mhSays(state, L.MH_GRIZZLY, true, () => { d.said = true; });
      if (d.said && !d.bear && t > 40) d.done = true;
      break;
    }
  }
  return walk;
};

/** The grizzly's tug: where the bear stands from him (its feet behind his, so its forepaw lands on his chest), the
 *  push-in, the wrenches (ticks into it) and when his head comes away. */
const BEAR_AT = 26, NECK_ZOOM = 1.8, NECK_TUGS = [30, 52, 74, 96, 118, 140, 162], NECK_POP = 198;
/** His head in the bear's jaws (its middle, its turn, which way it faces) and his neck's ends (out of his collar, under
 *  his jaw), world, at the wrench the tug's at. The bear's frame faces right; his head's mirrored in it (he lies the
 *  other way); hauled from lying face up to hung by the crown. */
const neckOf = (f: Fight, d: Death) => {
  const J = bearJaw('tug', d.pull), k = d.pull / (BEAR_TUG_STEPS - 1);
  const rot = -Math.PI / 2 + (Math.PI / 2 - 0.15) * k, ca = Math.cos(rot), sa = Math.sin(rot);
  const R = (p: { x: number; y: number }) => ({ x: -(p.x * ca - p.y * sa), y: p.x * sa + p.y * ca });
  const cr = R(HEAD_CROWN), so = R(HEAD_SOCKET);
  const cx = J.x - cr.x, cy = J.y - cr.y;
  const W = (x: number, y: number) => ({ x: d.bx + d.bdir * x, y: GY + y });
  const c = W(cx, cy), s = W(cx + so.x, cy + so.y);
  return { cx: c.x, cy: c.y, rot, hf: -d.bdir, sockX: s.x, sockY: s.y, colX: f.tx + d.lie * COLLAR.x, colY: GY + COLLAR.y };
};

/** THE WEAKNESS KILL, slowed: the close-up of them at him; torn in two between them in the glade; dragged off. */
const lionsKill = (ctx: FrameContext, f: Fight, d: Death) => {
  const { state } = ctx, t = d.t - d.at;
  switch (d.step) {
    case 'close':
      d.k = Math.min(1, t / 140);
      if (t === 2) tuckerSays(f, L.TF_LAST_LIONS);
      if (t === 31 || t === 98) { playSound('crunch', 1, -10); playSound('squish', 1, -8); shakeScreen(state, 8, 4); }
      if (t % 26 === 13) playSound('gush', 0.5, -8);
      if (d.k >= 1) {
        next(d, 'tear');
        // (up off the ground between them for it, flat out: one at his chest, the other at his shins; pulled back a
        // touch, the slow motion eased so the tug plays out)
        f.lions = f.lions.slice(0, 2);
        while (f.lions.length < 2) f.lions.push({ x: f.tx, y: GY, vx: 0, vy: 0, dir: 1, mode: 'tug', t: 0, wait: 0, side: f.lions.length ? 1 : -1, carry: null });
        f.lions[0].side = -1; f.lions[1].side = 1;
        for (const l of f.lions) { l.mode = 'tug'; l.y = GY; l.carry = null; l.t = 0; }
        d.eL = 0; d.eR = 0; d.tugT = 99; d.snap = -1; d.tear = 0;
        if (f.cam) { f.cam.zt = TUG_ZOOM; f.cam.slow = TUG_SLOW; }
        placeTug(f, d);
        playSound('roar', 0.8, 2); playSound('screams', 0.6, 4);
      }
      break;
    case 'tear': {
      if (d.snap < 0) {
        // (THE TUG OF WAR: each cat in turn wrenches back; he stretches at the waist, the cloth, then him, thinner each
        // wrench, till he gives)
        const at = LION_TUGS.indexOf(t);
        if (at >= 0) {
          d.tugSide = at % 2 ? 1 : -1; d.tugT = 0;
          playSound('squish', 0.9, -4 + at); playSound('snort', 0.6, 2 + at); shakeScreen(state, 3 + at * 0.6, 3);
          if (at === 2 || at === 5) playSound('screams', 0.5, 2 + at);
        }
        if (d.tugT < 6) { d.tugT++; if (d.tugSide < 0) d.eL += LION_WRENCH / 6; else d.eR += LION_WRENCH / 6; }
        placeTug(f, d);
        const E = d.eL + d.eR;
        if (E > 22 && t % 4 === 0) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: f.tx + (d.eR - d.eL) / 2 + (Math.random() - 0.5) * E * 0.6, y: GY - 34 }, vel: { x: (Math.random() - 0.5) * 2, y: 0.5 + Math.random() }, life: 30, color: i ? '#7F1D1D' : '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
        if (t >= LION_TUGS[LION_TUGS.length - 1] + 6) {
          // (he gives: torn in two at the middle, a burst of him, the cap off spinning; slowed right down for it)
          d.snap = t;
          const mx = f.tx + (d.eR - d.eL) / 2;
          playSound('gorespray', 1, -6); playSound('crunch', 1.2, -12); playSound('splat', 1, -6); playSound('screams', 0.5, -10); shakeScreen(state, 14, 7);
          ctx.fx.spawnDeathShower({ x: mx, y: GY - 36 }, 0, 0.6, false, 60);
          for (let i = 0; i < 26; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, sp = 3 + Math.random() * 6;
            state.particles.push({ pos: { x: mx + (Math.random() - 0.5) * 10, y: GY - 36 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 50 + Math.random() * 30, color: ['#DC2626', '#B91C1C', '#7F1D1D', '#F4C2B0', '#E8909C'][i % 5], size: 2 + Math.random() * 3.4, grav: 0.3, chunk: i % 4 === 0 });
          }
          d.cap = { x: f.tx - 50, y: GY - 60, vx: -2.4, vy: -7, rot: 0 };
          if (f.cam) f.cam.slow = 0.3;
        }
      } else {
        // (the halves: the cats stagger back with them, the strands of him snapping back, the gut strung between)
        const q = t - d.snap;
        d.tear = Math.min(1, q / 30);
        if (q < 10) { d.eL += 2.6 * (1 - q / 10); d.eR += 2.6 * (1 - q / 10); }
        placeTug(f, d);
        if (q === 14) playSound('splat', 0.7, 4);
        if (q >= 34) {
          next(d, 'drag');
          if (f.cam) { f.cam.zt = 1; f.cam.slow = 1; }
          // (each backing off with its half, facing him: the near cat his top half, the far one his legs)
          for (const l of f.lions) { l.mode = 'drag'; l.dir = l.side < 0 ? -1 : 1; l.carry = l.side < 0 ? 'top' : 'legs'; l.t = 0; l.x += l.side * 2; }
        }
      }
      break;
    }
    case 'drag':
      // (off into the trees with half of him each (tickLions walks them off); the cap left spinning)
      if (t === 60) mhSays(state, L.MH_LIONS_WON, true, () => { d.done = true; });
      break;
  }
};

/** The tug of war: its push-in and slow motion (eased off from the close-up's), the wrenches (ticks into it: each cat in
 *  turn), how far each wrench hauls. */
const TUG_ZOOM = 1.6, TUG_SLOW = 0.55, LION_TUGS = [8, 20, 32, 44, 56, 68, 80], LION_WRENCH = 8.4;
/** The tug's cats: each where its jaws are on him (whole: their bites his length apart), hauled back by however far it's
 *  wrenched. */
const TUG_JAW = lionJaw('tug', 0).x, TUG_REST = Math.hypot(BITE_LEGS.x - BITE_TOP.x, BITE_LEGS.y - BITE_TOP.y);
const placeTug = (f: Fight, d: Death) => {
  for (const l of f.lions) l.x = f.tx + l.side * (TUG_REST / 2 + (l.side < 0 ? d.eL : d.eR) + TUG_JAW);
};
/** Where a tugging cat's jaws are (world) at `t` (its own frame count, as drawn). */
const tugJaw = (l: Lion, t: number) => { const j = lionJaw('tug', t); return { x: l.x - l.side * j.x, y: l.y + j.y }; };

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (slowed: the lions) and the mauling's punch-in

const tickCam = (f: Fight) => {
  const cam = f.cam;
  if (!cam) return;
  cam.t++;
  cam.z += (cam.zt - cam.z) * (cam.zt > cam.z ? 0.2 : 0.07);
  // (there, once it's a hair off: easing in forever, its scale crept a hair a frame, and each hair the woods' stamps
  // took for the scale held still and painted afresh at it (the mauling's slowdown); a hair's jump nobody sees)
  if (Math.abs(cam.zt - cam.z) < 0.004) cam.z = cam.zt;
  if (cam.zt === 1 && cam.z < 1.004 && cam.slow >= 1) f.cam = null;
};
/** Held this tick (slow motion): true. */
export const fightHoldTick = (f: Fight): boolean => {
  const cam = f.cam;
  if (!cam || cam.slow >= 1) return false;
  cam.acc += cam.slow;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};
export const fightZoom = (state: GameState, f: Fight) => {
  const cam = f.cam;
  if (!cam || cam.z <= 1.001) return null;
  const m = CANVAS_WIDTH / 2 / cam.z;
  // (on him wherever he is, kept far enough in from the arena's ends that it never shows past them: not the camera's
  // edges, that's still on its way to him as it starts (the user's: "if any boss gets killed slightly offscreen"))
  const fx = Math.max(ARENA_L + m, Math.min(ARENA_R - m, f.tx)), fy = GY - 50;
  const k = Math.min(1, (cam.z - 1) / Math.max(0.001, cam.top - 1));
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};

/** His death, what of it has to be on screen (deathFrame.ts): him, wherever the shot that did it caught him (the
 *  camera's only on its way there), through to what's left of him. Null till he's dead. */
export const deathNeed = (f: Fight): Box | null => {
  const d = f.death;
  if (f.mode !== 'dead' || !d) return null;
  return around(f.tx, Math.min(GY, d.ty), 70, 130, 10);
};
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death?.done && (!f.cam || f.cam.z < 1.02);
export const killedByWeakness = (f: Fight) => f.death?.how === 'lions';
/** Won, under the VICTORY: the cats still on screen with their halves of him keep walking till they're off it (the user's). */
export const tickFightWon = (ctx: FrameContext, f: Fight) => tickLions(ctx, f);
/** Over: the camera his again, nothing left about. */
export const endFight = (state: GameState, f: Fight) => {
  state.player.inCutscene = false; state.cameraOverride = null; live = null;
  clearCritters(state, f); f.swarms = []; f.cam = null;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const tuckerLook = (f: Fight): { pose: TuckerPose; face?: TuckerFace; aim?: number; pan?: boolean; pistol?: boolean } => {
  const hurt = f.flash > 0 && f.act !== 'mauled';
  switch (f.act) {
    case 'listen': return { pose: 'grope', pistol: true, face: hurt ? 'ow' : f.talking ? 'talk' : 'manic' };
    case 'cock': return { pose: 'cock', face: hurt ? 'ow' : 'manic' };
    case 'aim': return { pose: 'aim', aim: f.aim, face: hurt ? 'ow' : 'manic' };
    case 'pan': return { pose: 'aim', aim: f.aim, pan: true, face: 'manic' };
    case 'recoil': return { pose: 'aim', aim: f.aim, face: 'yell' };
    case 'reload': return { pose: 'reload', face: hurt ? 'ow' : f.talking ? 'talk' : 'manic' };
    case 'bloody': return { pose: 'grope', face: f.talking ? 'yell' : 'shock' };
    case 'mauled': return { pose: 'mauled', face: 'yell' };
    case 'getup': return f.actT < 26 ? { pose: 'sit', face: 'daze' } : { pose: 'hurt', face: f.talking ? 'talk' : 'ow' };
    case 'run': return f.runShot > 0 ? { pose: 'aim', aim: f.aim, face: 'yell' } : { pose: 'run', face: hurt ? 'ow' : f.talking ? 'yell' : 'manic' };
  }
};
const woundsOf = (f: Fight): TuckerWounds => ({ ...WOUNDS_SPLIT, clawed: f.clawed, bloody: f.bloody });

/** His figure as a death has him. */
const drawDead = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death!, w = woundsOf(f);
  if (d.how === 'grizzly') {
    switch (d.step) {
      case 'fall': drawTucker(c, f.tx, GY, f.facing, fr, 'hurt', { wounds: w, face: f.talking ? 'talk' : 'daze', talking: f.talking }); return;
      case 'down': case 'walk': case 'ask': case 'beat': drawTucker(c, f.tx, GY, f.facing, fr, 'flat', { wounds: w }); drawTuckerCap(c, f.tx - f.facing * 50, GY - 4, -0.3); return;
      case 'pop': case 'popped': drawTucker(c, f.tx, d.ty, f.facing, fr, d.step === 'pop' && d.t - d.at < 30 ? 'pop' : 'furious', { wounds: w, face: d.step === 'pop' ? 'yell' : 'manic', talking: f.talking }); return;
      case 'gloat': drawTucker(c, f.tx, GY, f.facing, fr, 'point', { wounds: w, face: f.talking ? 'talk' : 'manic', talking: f.talking }); return;
      case 'swipe': drawTucker(c, f.tx, GY, f.facing, fr, 'grope', { wounds: w, face: 'shock' }); return;
      case 'close': drawTucker(c, f.tx, GY, f.facing, fr, 'mauled', { wounds: w, face: 'yell' }); return;
      case 'neck': {
        // (flat on his back under it, headless but for the neck drawn up out of his collar to his head in its jaws)
        const g = neckOf(f, d);
        bloodPool(c, g.colX - d.lie * 6, 18 + d.pull * 3, 2.4);
        drawBodyForNeck(c, f.tx, GY, d.lie);
        drawStretchedNeck(c, g.colX, g.colY, g.sockX, g.sockY, fr);
        drawTuckerHeadAt(c, g.cx, g.cy, g.hf, g.rot, d.pull >= BEAR_TUG_STEPS - 2 ? 'out' : 'yell');
        return;
      }
      default: {
        drawRemains(c, f, d, fr);
        // (just come away: his head still up in its jaws, the torn neck dangling off it, before it turns to go)
        if (d.step === 'chunks' && d.bear === 'tug') {
          const g = neckOf(f, d), t = d.t - d.at;
          drawNeckStump(c, g.sockX, g.sockY, Math.atan2(g.colY - g.sockY, g.colX - g.sockX) + Math.sin(t * 0.5) * 0.3 * Math.max(0, 1 - t / 30), 10, 8);
          drawTuckerHeadAt(c, g.cx, g.cy, g.hf, g.rot, 'out');
        }
        return;
      }
    }
  }
  // (the lions: down under them; then the tug of war (drawn over the cats: drawTugOfWar); then gone with them)
  if (d.step === 'close') { drawTucker(c, f.tx, GY, f.facing, fr, 'mauled', { wounds: w, face: 'yell' }); return; }
  // (the blood where it happened, spreading once he's given)
  const k = d.step === 'tear' ? (d.snap < 0 ? 0.3 : 0.3 + 0.7 * d.tear) : 1;
  bloodPool(c, f.tx + (d.eR - d.eL) / 2, 46 * k, 4 * Math.min(1, k + 0.3));
};

/** The lions' tug of war, over the cats (their jaws on top of him): him stretched between them, then the halves. */
const drawTugOfWar = (c: Ctx, f: Fight, d: Death, fr: number) => {
  const lt = f.lions.find(l => l.side < 0), rt = f.lions.find(l => l.side > 0);
  if (!lt || !rt) return;
  const jl = tugJaw(lt, fr + lt.side * 13), jr = tugJaw(rt, fr + rt.side * 13);
  if (d.snap < 0) {
    drawTugged(c, jl, jr, 'yell', fr);
  } else {
    // (the halves, sagging at their torn ends; the strands of him snapping back into them; the gut strung between)
    const q = d.tear, sag = 0.22 * Math.min(1, q * 3);
    const end = (j: { x: number; y: number }, which: 'top' | 'legs', a: number) => { const e = halfEnd(which), ca = Math.cos(a), sa = Math.sin(a); return { x: j.x + e.x * ca - e.y * sa, y: j.y + e.x * sa + e.y * ca }; };
    const et = end(jl, 'top', sag), el = end(jr, 'legs', -sag), mx = (et.x + el.x) / 2, my = (et.y + el.y) / 2;
    if (q < 0.6) {
      const g = 1 - q / 0.6;
      c.lineCap = 'round';
      c.strokeStyle = '#5A1A24'; c.lineWidth = 4.4; c.beginPath(); c.moveTo(et.x, et.y + 4); c.quadraticCurveTo(mx, my + 16 + (1 - g) * 20, el.x, el.y + 4); c.stroke();
      c.strokeStyle = '#C86070'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = '#F0A8B8'; c.lineWidth = 1; c.beginPath(); c.moveTo(et.x, et.y + 3.2); c.quadraticCurveTo(mx, my + 15 + (1 - g) * 20, el.x, el.y + 3.2); c.stroke();
      c.lineCap = 'butt';
    }
    if (q < 0.4) {
      const g = 1 - q / 0.4;
      drawStrand(c, et.x, et.y, et.x + (mx - et.x) * g * 0.9, et.y + (my - et.y) * g * 0.9 + (1 - g) * 6, 1 + 5 * g);
      drawStrand(c, el.x, el.y, el.x + (mx - el.x) * g * 0.9, el.y + (my - el.y) * g * 0.9 + (1 - g) * 6, 1 + 5 * g);
    }
    c.save(); c.translate(jl.x, jl.y); c.rotate(sag); drawTuckerHalf(c, 'top', 'out'); c.restore();
    c.save(); c.translate(jr.x, jr.y); c.rotate(-sag); drawTuckerHalf(c, 'legs', 'out'); c.restore();
  }
  // (their fangs sunk in him, blood welling round them)
  for (const [j, dir] of [[jl, 1], [jr, -1]] as const) {
    const x = Math.round(j.x), y = Math.round(j.y);
    box(c, x - 3, y - 1, 7, 3, '#7F1D1D'); box(c, x - 2, y, 5, 1, '#B91C1C');
    for (const o of [-2, 2]) { c.fillStyle = '#5A4A34'; c.beginPath(); c.moveTo(x + o * dir - 1.2, y - 1); c.lineTo(x + o * dir, y + 3.4); c.lineTo(x + o * dir + 1.2, y - 1); c.closePath(); c.fill(); c.fillStyle = '#FBF6E8'; c.beginPath(); c.moveTo(x + o * dir - 0.8, y - 1); c.lineTo(x + o * dir, y + 2.6); c.lineTo(x + o * dir + 0.8, y - 1); c.closePath(); c.fill(); }
    if (((fr >> 3) + (dir > 0 ? 0 : 2)) % 4 === 0) box(c, x - 1, y + 3, 1, 2, '#B91C1C');
  }
};

/** What the grizzly left: him flat on his back in a pool of his own blood, headless, the stump (twitching a while). */
const drawRemains = (c: Ctx, f: Fight, d: Death, fr: number) => {
  const t = d.step === 'chunks' ? d.t - d.at : 999, x = f.tx;
  bloodPool(c, x + d.lie * COLLAR.x * 0.8, Math.min(60, 26 + t * 0.8), 5);
  drawHeadlessBody(c, x, GY, d.lie, t < 60 ? Math.sin(t * 1.7) * 0.035 * (1 - t / 60) : 0);
  // (a slow curl of steam off the stump, stepped)
  const s = (fr % 60) / 60, st = Math.floor(s * 4), sx = x + d.lie * (COLLAR.x - 8);
  c.globalAlpha = [0.3, 0.24, 0.16, 0.08][st]; pixelBlob(c, Math.round(sx), Math.round(GY - 22 - s * 20), 3 + s * 5, 2.6 + s * 4, '#E7E5E4'); c.globalAlpha = 1;
};

/** A pool of blood on the ground at x, `w` across: stepped rings (dark rim, the body, wet and glossy at its middle), a
 *  few spatters round it. */
const bloodPool = (c: Ctx, x: number, w: number, h: number) => {
  c.fillStyle = '#3A0606'; c.beginPath(); c.ellipse(x, GY + 1, w, h, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5F0F0F'; c.beginPath(); c.ellipse(x - 3, GY + 0.6, w * 0.82, h * 0.74, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(x - 6, GY + 0.2, w * 0.56, h * 0.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A82020'; c.beginPath(); c.ellipse(x - 10, GY, w * 0.22, h * 0.24, 0, 0, Math.PI * 2); c.fill();
  box(c, Math.round(x - 14), GY - 1, 4, 1, '#E86A6A');
  for (const [dx, dy] of [[-1.12, 2], [-1.04, -1], [1.08, 1], [1.16, 3], [0.6, 4]] as const) box(c, Math.round(x + dx * w), Math.round(GY + dy), 2, 1, '#5F0F0F');
};

/** Past this far out of the plane, a leaping cat's drawn over everything (drawFightFront). */
const FRONT_Z = 0.12;
/** Where a cat out of the play plane lands on screen (the Mode 7 trick): scaled up as it nears the lens, spread out from
 *  the view's middle, its ground sliding down off the screen's bottom; its bound's height scaled with it. */
const depthOf = (state: GameState, l: Lion) => {
  const z = l.z ?? 0, s = 1 / (1 - z * 0.7), cx = state.camera.x + CANVAS_WIDTH / 2;
  const gy = GY + z * (state.camera.y + CANVAS_HEIGHT + 150 - GY);
  return { s, x: cx + (l.x - cx) * s, gy, y: gy - (GY - l.y) * s };
};
/** A cat, wherever it is in depth (in the plane: just itself). */
const drawCat = (c: Ctx, state: GameState, l: Lion, fr: number) => {
  const pose = lionPose(l), o = { carry: l.carry, bloody: l.mode === 'leapOut' ? 0.8 : undefined };
  if (!l.z) { drawLion(c, l.x, l.y, lionFacing(l), fr + l.side * 13, pose, o); return; }
  const d = depthOf(state, l);
  // (its shadow on the near ground under it, the wider and fainter the higher it is)
  const up = (GY - l.y) / LEAP_H;
  c.globalAlpha = 0.28 * (1 - up * 0.5); c.fillStyle = INK;
  c.beginPath(); c.ellipse(d.x, d.gy, 40 * d.s * (1 + up * 0.3), 7 * d.s, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
  c.save(); c.translate(Math.round(d.x), Math.round(d.y)); c.scale(d.s, d.s);
  drawLion(c, 0, 0, lionFacing(l), fr + l.side * 13, pose, o);
  c.restore();
};
const lionPose = (l: Lion): LionPose => (l.mode === 'pounce' || l.mode === 'leapIn' || l.mode === 'leapOut' ? 'pounce' : l.mode === 'maul' ? 'maul' : l.mode === 'tug' ? 'tug' : l.mode === 'drag' ? 'drag' : 'run');
/** Which way a cat's drawn: on him (mauling, tugging), toward him; backing off with half of him, still toward him. */
const lionFacing = (l: Lion) => (l.mode === 'maul' || l.mode === 'tug' ? (l.side < 0 ? 1 : -1) : l.mode === 'drag' && (l.carry === 'top' || l.carry === 'legs') ? -l.dir : l.dir);

/** World, behind Meathead: the smoke, Tucker, the cats on him, the grizzly, the balls, the aim's line, the bees. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // ---- the gun's smoke, hanging: black powder's thick white cloud, stepped puffs, thinning in steps as it spreads
  for (const s of f.smoke) { const k = s.t / 70; smokePuff(c, s.x + f.facing * k * 14, s.y - k * 10, k, s.t); }
  // ---- the aim: a dotted line off the muzzle where it's pointing (blinking bright in the pan's flash)
  if (f.mode === 'on' && (f.act === 'aim' || f.act === 'pan')) {
    const m = muzzleAt(f), dx = f.facing * Math.cos(f.aim), dy = Math.sin(f.aim), pan = f.act === 'pan';
    // (the laser: plainly seen (the playtest): a solid red beam, inked, a hot core, out to where it lands, the dot there
    // a pulsing reticle; in the pan it flashes yellow: move now)
    let len = 26 * 12;
    if (dy > 0.01) len = Math.min(len, (GY - m.y) / dy);
    const ex = m.x + dx * len, ey = m.y + dy * len, hot = pan ? '#FDE047' : '#EF4444', core = pan ? '#FFFFFF' : '#FCA5A5';
    const on = pan ? fr % 6 < 3 : true;
    c.lineCap = 'round';
    c.globalAlpha = on ? 0.85 : 0.45;
    c.strokeStyle = '#1A0606'; c.lineWidth = 5; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = hot; c.lineWidth = 3; c.stroke();
    c.strokeStyle = core; c.lineWidth = 1; c.stroke();
    const pr = 7 + Math.sin(fr * 0.3) * 2;
    c.globalAlpha = on ? 0.95 : 0.5;
    c.strokeStyle = '#1A0606'; c.lineWidth = 4; c.beginPath(); c.arc(ex, ey, pr, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = hot; c.lineWidth = 2; c.beginPath(); c.arc(ex, ey, pr, 0, Math.PI * 2); c.stroke();
    box(c, ex - 2, ey - 2, 4, 4, core);
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) box(c, ex + ox * (pr + 2) - (ox ? 0 : 1), ey + oy * (pr + 2) - (oy ? 0 : 1), ox ? 4 * ox : 2, oy ? 4 * oy : 2, hot);
    c.globalAlpha = 1;
  }
  // ---- Tucker
  if (f.mode === 'dead' && f.death) drawDead(c, f, fr);
  else {
    const look = tuckerLook(f);
    const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0;
    if (blink) c.globalAlpha = 0.65;
    // (jostled by the critters: a stumble, arms out, tipped the way he's being carried and wobbling (not over a shot:
    // the aim's the tell))
    const stumble = f.bumped > 0 && f.act !== 'aim' && f.act !== 'pan' && f.act !== 'recoil';
    if (stumble) {
      const tip = Math.max(-0.28, Math.min(0.28, f.shove * 0.07)) + Math.sin(fr * 0.6) * 0.06;
      c.save(); c.translate(f.tx, GY); c.rotate(tip); c.translate(-f.tx, -GY);
      drawTucker(c, f.tx, GY, f.facing, fr, 'hurt', { wounds: woundsOf(f), face: 'shock', talking: f.talking });
      c.restore();
    } else drawTucker(c, f.tx, GY, f.facing, fr, look.pose, { wounds: woundsOf(f), face: look.face, aim: look.aim, pan: look.pan, pistol: look.pistol, talking: f.talking });
    c.globalAlpha = 1;
    // (sat up dazed: his cap's off, beside him)
    if (look.pose === 'sit') drawTuckerCap(c, f.tx - f.facing * 30, GY - 4, 0.4);
  }
  // ---- the cats
  for (const l of f.lions) if ((l.z ?? 0) < FRONT_Z && !l.e) drawCat(c, state, l, fr);
  // ---- the lions' tug of war: him over them, their jaws in him
  const d = f.death;
  if (d && d.how === 'lions' && d.step === 'tear') drawTugOfWar(c, f, d, fr);
  // ---- the grizzly (his head in its jaws walking off)
  if (d?.bear) drawGrizzly(c, d.bx, GY, d.bdir, fr, d.bear, { carry: d.step === 'chunks' && d.bear === 'walk' ? 'head' : null, bloody: d.step === 'chunks' ? 1 : undefined, pull: d.pull });
  if (d?.cap) drawTuckerCap(c, d.cap.x, d.cap.y, d.cap.rot);
  // ---- the balls: round lead, stepped, a glint; a streak of smoke behind in stepped dots, thinning
  for (const s of f.shots) {
    for (let i = 1; i <= 6; i++) {
      const q = i / 6, sx = Math.round(s.x - s.vx * 2.4 * q), sy = Math.round(s.y - s.vy * 2.4 * q), r = Math.max(1, Math.round(2.6 - q * 1.6));
      c.globalAlpha = 0.7 - q * 0.55; box(c, sx - r, sy - r, r * 2, r * 2, i % 2 ? '#D8D4CE' : '#B8B4AE');
    }
    c.globalAlpha = 1;
    const bx = Math.round(s.x), by = Math.round(s.y);
    box(c, bx - 3, by - 2, 6, 4, INK); box(c, bx - 2, by - 3, 4, 6, INK);
    box(c, bx - 2, by - 2, 4, 4, '#5A5E66'); box(c, bx - 2, by - 2, 3, 2, '#8A909A'); box(c, bx - 1, by - 2, 1, 1, '#D8DCE2'); box(c, bx, by + 1, 2, 1, '#3A3C42');
  }
};

/** A puff of the flintlock's smoke at k 0..1 of its life: stepped (the shade under, the body, lit on top), thinning in
 *  four steps, its edge broken up. */
const smokePuff = (c: Ctx, x: number, y: number, k: number, t: number) => {
  const step = Math.min(3, Math.floor(k * 4)), r = 6 + k * 18;
  c.globalAlpha = [0.62, 0.46, 0.3, 0.16][step];
  const X = Math.round(x), Y = Math.round(y);
  pixelBlob(c, X + 1, Y + 1, r, r * 0.82, '#8E8A84');
  pixelBlob(c, X, Y, r * 0.92, r * 0.74, '#C8C4BC');
  pixelBlob(c, X - r * 0.22, Y - r * 0.24, r * 0.6, r * 0.46, '#E8E4DC');
  pixelBlob(c, X - r * 0.36, Y - r * 0.4, r * 0.24, r * 0.18, '#FFFFFF');
  // (wisps curling off its edge)
  for (let i = 0; i < 3; i++) { const a = t * 0.05 + i * 2.1; box(c, Math.round(X + Math.cos(a) * r * 1.05), Math.round(Y + Math.sin(a) * r * 0.8), 2, 2, '#D8D4CC'); }
  c.globalAlpha = 1;
};

/** World, in front: the bees, his words. */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  for (const s of f.swarms) drawSwarm(c, s.x, s.y, s.t, s.gone ? 1 - s.gone / 120 : 1);
  // (the lions bounding in out of the foreground, or back out into it: over everything)
  for (const l of f.lions) if ((l.z ?? 0) >= FRONT_Z) drawCat(c, state, l, fr);
  if (f.said) {
    const d = f.death;
    const screened = d && (d.step === 'close' || (d.step === 'pop' && d.t - d.at < 56));
    if (!screened) {
      const lying = f.act === 'mauled' || (d && (d.step === 'down' || d.step === 'fall'));
      saidOver(c, f.said, f.tx, (d && d.step === 'pop' ? d.ty : GY) - (lying ? 50 : TUCKER_H + 22), '#FDE68A', 260);
    }
  }
  void fr;
};

/** The swarm (the playtest: make the bees more noticeable): a dark, churning cloud of fat bees, a haze in it, its
 *  shadow on the ground under it. */
const drawSwarm = (c: Ctx, x: number, y: number, t: number, a: number) => {
  const A = Math.max(0, a);
  x = Math.round(x); y = Math.round(y);
  // (its shadow on the ground under it, stepped: a dithered rim round a dark core, shifting as the cloud churns)
  const sw = 36 + Math.round(Math.sin(t * 0.13) * 4);
  c.save(); c.globalAlpha = A;
  c.beginPath(); c.ellipse(x, GY - 1, sw, 6, 0, 0, Math.PI * 2); c.clip(); checker(c, x - sw, GY - 8, sw * 2, 14, '#140E06', Math.floor(t / 8) % 2, 1);
  c.restore();
  c.globalAlpha = A * 0.45; c.fillStyle = '#140E06'; c.beginPath(); c.ellipse(x, GY - 1, sw * 0.62, 3.6, 0, 0, Math.PI * 2); c.fill();
  // (the haze it makes: a dark, churning cloud, lumps rolling round inside it, a dithered core so it reads at a glance)
  c.globalAlpha = A * 0.3;
  for (let i = 0; i < 7; i++) {
    const an = t * 0.05 + i * 0.9, rr = 14 + (i % 3) * 7;
    pixelBlob(c, x + Math.cos(an) * rr, y + Math.sin(an * 1.2) * rr * 0.6, 16 + (i % 3) * 5, 12 + (i % 2) * 4, i % 2 ? '#2A1E0C' : '#1C140A');
  }
  c.save(); c.globalAlpha = A * 0.55; c.beginPath(); c.ellipse(x, y, 30 + Math.sin(t * 0.11) * 4, 20 + Math.cos(t * 0.09) * 3, 0, 0, Math.PI * 2); c.clip();
  checker(c, x - 40, y - 30, 80, 60, '#1A1208', Math.floor(t / 4) % 2, 1);
  c.restore();
  // (the bees: fat, inked, striped, the abdomen stepped yellow, a stinger, their wings a flicker of two frames)
  c.globalAlpha = A;
  for (let i = 0; i < 46; i++) {
    const sp = 0.2 + (i % 5) * 0.03, ang = t * sp + i * 2.3, r = 8 + (i % 5) * 7 + Math.sin(t * 0.1 + i) * 5;
    const bx = Math.round(x + Math.cos(ang) * r), by = Math.round(y + Math.sin(ang * 1.3) * r * 0.7);
    const dir = -Math.sin(ang) >= 0 ? 1 : -1, back = bx - dir * 3, up = (t + i) % 4 < 2;
    // (the wings behind: up, a pale blur; down, short)
    if (up) { box(c, bx - 2, by - 5, 3, 3, '#C8DCEC'); box(c, bx - 1, by - 5, 1, 1, '#FFFFFF'); box(c, bx + 1, by - 4, 3, 2, '#A8C0D4'); }
    else { box(c, bx - 2, by - 3, 4, 1, '#B8CCDC'); }
    box(c, bx - 4, by - 2, 9, 5, '#0C0A08'); box(c, bx - 3, by - 3, 7, 7, '#0C0A08');
    box(c, bx - 3, by - 2, 7, 4, '#E0A818'); box(c, bx - 3, by - 2, 7, 1, '#F8D838'); box(c, bx - 3, by + 1, 7, 1, '#A86A10');
    box(c, bx - 1, by - 2, 1, 4, '#1C1408'); box(c, bx + 1, by - 2, 1, 4, '#1C1408');
    box(c, bx + dir * 3 - (dir < 0 ? 1 : 0), by - 1, 2, 2, '#1C1408'); box(c, bx + dir * 3 + (dir > 0 ? 1 : -1), by - 1, 1, 1, '#6A5A40');
    box(c, back - (dir > 0 ? 1 : 0), by, 1, 1, '#0C0A08');
  }
  c.globalAlpha = 1;
};

/** Screen space: his bar in the top band clear of the HUD; a death's letterbox, the jumpscare, the close-ups, SKIP. */
export const drawFightHud = (c: Ctx, state: GameState, f: Fight, band: { x1: number; x2: number; mid: number }) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, d = f.death;
  if (f.mode === 'on') {
    if (state.player.inCutscene) return;
    const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP), fw = Math.round((w - 4) * k);
    // (a brass-bound bar, his conductor's brass: the bevel lit on top, shaded under; the red in steps, lit along its
    // top, dithered into its shade; notches every tenth)
    box(c, band.x1 - 1, 21, w + 2, 16, INK);
    box(c, band.x1, 22, w, 14, '#8A6A1E'); box(c, band.x1, 22, w, 1, '#F4D47A'); box(c, band.x1, 35, w, 1, '#5A4210');
    box(c, band.x1 + 2, 24, w - 4, 10, '#18120C');
    const flash = f.iframes > 0 && Math.floor(f.iframes / 4) % 2;
    box(c, band.x1 + 2, 24, fw, 10, flash ? '#FCA5A5' : '#A81818');
    box(c, band.x1 + 2, 24, fw, 3, flash ? '#FFE0E0' : '#E04040'); box(c, band.x1 + 2, 24, fw, 1, flash ? '#FFFFFF' : '#F88080');
    box(c, band.x1 + 2, 31, fw, 3, flash ? '#E08080' : '#6E0C0C'); checker(c, band.x1 + 2, 30, fw, 1, flash ? '#E08080' : '#6E0C0C', 0, 1);
    for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18120C');
    label(c, 'TUCKER', band.mid, 50, '#FDE68A', 7);
    return;
  }
  if (!d) return;
  // ---- the letterbox
  const bar = Math.round(Math.min(1, f.skipT / 20) * 40);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
  // ---- the jumpscare: his screaming face snapped into yours
  if (d.how === 'grizzly' && d.step === 'pop' && d.t - d.at < 56) {
    const t = d.t - d.at;
    for (let i = 0; i < 6; i++) box(c, 0, (i * H) / 6, W, H / 6 + 1, mix('#1A1408', '#3A2A12', i / 6));
    drawTuckerCloseup(c, W / 2, H / 2 - 50, 11, state.frame, { face: 'yell', red: true, jolt: Math.max(0.08, 0.9 - t * 0.03), wounds: woundsOf(f), talking: f.talking });
    if (t < 3) { c.globalAlpha = 1 - t * 0.25; box(c, 0, 0, W, H, '#FFFFFF'); c.globalAlpha = 1; }
    else if (t < 6) { c.globalAlpha = 0.35; box(c, 0, 0, W, H, '#DC2626'); c.globalAlpha = 1; }
    if (f.said) saidOver(c, f.said, W / 2, H - 50, '#FDE68A', 360);
  }
  // ---- the close-ups (the mutilation rule): the grizzly's mauling; the lions (slowed)
  if (d.step === 'close') closeup(c, state, f, d.how === 'grizzly' ? 'maul' : 'lions', d.k, d.t - d.at);
  if (!d.done && f.skipT > SKIP_AFTER) drawSkipPrompt(c, W);
};

const closeup = (c: Ctx, state: GameState, f: Fight, wound: 'maul' | 'lions', k: number, t: number) => {
  const z = Math.min(1, t / 8);
  const w = 440 * (0.6 + 0.4 * z), h = 300 * (0.6 + 0.4 * z), cx = CANVAS_WIDTH / 2, cy = 210, x = cx - w / 2, y = cy - h / 2;
  c.save();
  c.globalAlpha = Math.min(1, z * 1.4);
  box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
  for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, '#E0B040');
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  // (behind him: the woods' floor, close, in bands: he's down on his back in the leaves)
  for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#3A2A16', '#5A4A2A', i / 6));
  for (let i = 0; i < 30; i++) box(c, x + ((i * 97) % w), y + ((i * 53) % h), 8, 3, ['#B45309', '#92400E', '#CA8A04', '#7C2D12'][i % 4]);
  const face: TuckerFace = wound === 'maul' ? (k < 0.14 ? 'shock' : k < 0.9 ? 'yell' : 'out') : (k < 0.22 ? 'shock' : k < 0.86 ? 'yell' : 'out');
  const jolt = wound === 'maul' ? (k > 0.5 && k < 0.72 ? 1.2 : k > 0.14 ? 0.4 : 0.1) : (k > 0.4 && k < 0.7 ? 0.5 : 0.15);
  drawTuckerCloseup(c, cx, cy - 10, 4.4, state.frame, { face, jolt, wounds: woundsOf(f), talking: f.talking, making: { wound, k } });
  c.restore();
  if (f.said) saidOver(c, f.said, cx, y + h + 34, '#FDE68A', 340);
};

// ---- not too much at once (the playtest: sweeping a crowd of critters with the sucker was a blizzard of gore and
// callouts): one callout every so often at most, and the particles kept to a ceiling (the oldest go first)
const CALLOUT_GAP = 50, MAX_PARTICLES = 220;
let lastCalloutAt = -9999;
const quietCarnage = (state: GameState, f: Fight) => {
  if (f.mode !== 'on') return;
  // (Tucker's own callouts always show: only those off him are thinned)
  const fresh = state.damageNumbers.filter(d => d.isCallout && d.life >= d.maxLife - 1 && Math.abs(d.pos.x - f.tx) > 80);
  if (fresh.length) {
    const keep = f.t - lastCalloutAt >= CALLOUT_GAP ? fresh[0] : null;
    if (keep) lastCalloutAt = f.t;
    state.damageNumbers = state.damageNumbers.filter(d => !fresh.includes(d) || d === keep);
  }
  if (state.particles.length > MAX_PARTICLES) state.particles.splice(0, state.particles.length - MAX_PARTICLES);
};
