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
// (the kill cam, slowed: the close-up of them at his throat and his split crown, then him torn in two between them in
// the glade, then dragged off into the trees half each, his cap left spinning). Any other way: he falls over, apparently
// dead; Meathead walks up; he pops up AAHHH (his jumpscare); gloating, he can't see the GRIZZLY come up behind him; the
// close-up of its mauling (the mutilation rule); then chunks of him everywhere, the bear off with a leg. Both cutscenes
// (no HUD, no controls; SKIP >> all of it).

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
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { hazardHit, hazardVictims, boxHits } from '../../hazardHit';
import { setGoreBag, goreBag, SPRAY, noBagFrom, onGlobHit } from '../../weapons/soulSucker';
import { box, label, saidOver, speak, meatheadSays, byPants, hands } from '../section';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { mix, INK, type Ctx } from '../kit';
import { pixelBlob, checker } from '../../../m1/game/render/pixelArt';
import { drawTucker, drawTuckerCloseup, drawTuckerCap, tuckerMuzzle, TUCKER_H, type TuckerPose, type TuckerFace, type TuckerWounds } from '../tucker';
import { drawLion, drawGrizzly, type LionPose, type BearPose } from './beasts';
import { kindOf, GROUND_CRITTERS, FLYING_CRITTERS, critterSpeed, isCritter, isLion, LION_KIND, type Critter } from './critters';
import { GY, ARENA_L, ARENA_R, ROCK_X, ROCK_HW, ROCK_H, LION_FROM_L, LION_FROM_R } from './layout';
import { WOUNDS_SPLIT } from './cast';
import * as L from './lines';

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here). Pairs are [at full health, near dead]: he gets faster and more erratic as he goes.

/** His health (the land bosses'), and the engine's stand-in (never runs out: the hits come off ours). */
const HP = 666, BIG = 100000;
/** Anything but the ray gun and his moves: this share; the breather after a hit. */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** The routine (frames): listening between shots, the cock, the aim, the flash in the pan, the kick after, the reload. */
const LISTEN: [number, number] = [80, 30], COCK: [number, number] = [16, 10], AIM: [number, number] = [54, 26];
const PAN: [number, number] = [22, 13], RECOIL: [number, number] = [16, 10], RELOAD: [number, number] = [66, 32];
/** How quickly the aim follows what he heard (a share a frame: Oscar's laser 0.3, far more homing); how far it wanders
 *  (px at the target, a wobble plus sudden jerks), how often it jerks. */
const TRACK: [number, number] = [0.05, 0.085], WOBBLE: [number, number] = [20, 58], JERK: [number, number] = [0.03, 0.1];
/** The ball: how fast (px a frame: Oscar's rocket 19), how hard (before M2's x0.65: ~30 off his 100), a little spread. */
const BALL_V: [number, number] = [18, 25], BALL_DMG = 46, SPREAD = 0.03;
/** His shuffle (px a frame), how near he'll come (and backs off nearer), how far he wants to be; hurrying back on screen. */
const WALK: [number, number] = [0.45, 0.85], TOO_NEAR = 150, WANT = 300, HURRY = 2.4;
/** The blind run (the user's: now and then he runs about flailing, firing as he goes): how likely instead of a planted
 *  shot, how fast, how long (frames), the gap between shots off the hip, how far off those go (px at what he heard). */
const RUN_CHANCE: [number, number] = [0.3, 0.55], RUN_V: [number, number] = [3.2, 4.6], RUN_LEN: [number, number] = [70, 140];
const RUN_FIRE: [number, number] = [26, 46], RUN_ERR = 90;
/** The noises: how far off he hears each (px of error either way). */
const ERR = { jump: 40, land: 30, step: 70, shot: 16, hit: 0 };
/** The stampede after each bang: how many (more later), how soon the first comes, the gaps, how many fly. */
const CRITTERS: [number, number] = [5, 8], FIRST_IN = 22, GAP: [number, number] = [6, 20], FLY_SHARE = 0.3;
/** The most critters about at once (the user's: a lot, but limited; and the game slowed with tons of them), and the most
 *  of their bodies left lying (the oldest cleared away). */
const MAX_CRITTERS = 10, MAX_CORPSES = 6;
/** The bees: their speed, the sting (before M2's x0.65), how often, then off a while; a second swarm below this health. */
const BEE_V: [number, number] = [1.5, 2.3], STING = 3, STING_GAP = 55, BEE_OFF = 50, SECOND_SWARM = 0.4;
/** The weakness: how many globs of the spray on him make him showered; the lions' wait (frames after the shower), their
 *  run, the mauling's length and its damage (in ticks), the punch-in. */
const SHOWERED = 5, LION_WAIT = 46, LION_V = 7.5, MAUL_T = 170, MAUL_DMG = 140, MAUL_TICKS = 5, PUNCH_T = 54;
/** Talking: his taunts, Meathead's hints. */
const TAUNT_EVERY = 520, HINT_GAP = 900;

const lerp = (r: [number, number], k: number) => r[0] + (r[1] - r[0]) * k;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act = 'listen' | 'cock' | 'aim' | 'pan' | 'recoil' | 'reload' | 'bloody' | 'mauled' | 'getup' | 'run';
interface Shot { x: number; y: number; vx: number; vy: number; life: number }
interface Queued { at: number; c: Critter; dir: 1 | -1; y: number; sp: number }
interface Swarm { x: number; y: number; t: number; cd: number; off: number; gone: number }
interface Lion { x: number; y: number; vx: number; vy: number; dir: 1 | -1; mode: 'wait' | 'run' | 'pounce' | 'maul' | 'drag' | 'gone'; t: number; wait: number; side: number; carry: 'arm' | 'leg' | 'cap' | null }
interface Death {
  how: 'lions' | 'grizzly'; t: number; step: string; at: number; done: boolean;
  /** His last say's been said (the grizzly's: it's over once the bear's gone too). */
  said?: boolean;
  /** The grizzly: where, which way, what it's doing. */
  bx: number; bdir: 1 | -1; bear: BearPose | null;
  /** Tucker's figure: where he's thrown (a hop), the halves of him (the lions' tear: how far apart, 0..1). */
  ty: number; tvy: number; tear: number;
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
  // ---- Tucker: where, which way, what he's at; the gun's angle (off straight ahead, + down), where it's aimed (world)
  tx: number; facing: 1 | -1; act: Act; actT: number; aim: number; aimX: number; aimY: number; jerkX: number; jerkY: number;
  /** Where he heard Meathead last (world), and when. */
  heard: { x: number; y: number; at: number };
  /** A blind run (the user's): which way, frames left of it, to his next shot off the hip, the shot's pose held. */
  runDir: 1 | -1; runN: number; runFire: number; runShot: number;
  wasGrounded: boolean; pShots: number; stepT: number;
  shots: Shot[]; smoke: { x: number; y: number; t: number }[];
  // ---- the critters coming, the rustle where they're coming from
  queue: Queued[]; rustle: { x: number; t: number } | null; stampedes: number;
  // ---- the bees
  swarms: Swarm[];
  // ---- the weakness: the blood on him, how much of the spray's landed; the cats; how many times they've had him
  bloody: number; shower: number; lions: Lion[]; maulT: number; maulDealt: number; clawed: number;
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
  game = state; token++;
  const e = makeKindEnemy(TUCKER_KIND as EnemyKind, tx, GY);
  e.noCrowd = true;
  e.facing = facing; e.seen = true;
  noBagFrom.add(e);
  state.enemies.push(e);
  setGoreBag(0);
  const m = pmid(state);
  const f: Fight = {
    mode: 'on', t: 0, hp: HP, iframes: 0, flash: 0, e, moveSeen: e.hitByMove,
    tx, facing, act: 'listen', actT: 20, aim: 0.6, aimX: m.x, aimY: m.y, jerkX: 0, jerkY: 0,
    heard: { x: m.x, y: m.y, at: 0 }, runDir: 1, runN: 0, runFire: 0, runShot: 0, wasGrounded: state.player.isGrounded, pShots: 0, stepT: 0,
    shots: [], smoke: [], queue: [], rustle: null, stampedes: 0, swarms: [],
    bloody: 0, shower: 0, lions: [], maulT: 0, maulDealt: 0, clawed: 0,
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
  // (nothing dropped off a kill in the fight: the critters give no health or ammo (the user's); the refills before the
  // arena are its own)
  if (state.pickups.some(q => q.id.startsWith('pickup-'))) state.pickups = state.pickups.filter(q => !q.id.startsWith('pickup-'));
  tickBees(ctx, f);
  tickLions(ctx, f);
  if (f.mode === 'dead') {
    const walk = dying(ctx, f);
    sync(state, f);
    return walk ? ({ ...hands(), right: walk > 0, left: walk < 0 } as Controls) : hands();
  }
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
        fire(ctx, f);
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
const fire = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, k = phaseK(f);
  const m = muzzleAt(f), a = f.aim + (Math.random() - 0.5) * 2 * SPREAD, v = lerp(BALL_V, k);
  f.shots.push({ x: m.x, y: m.y, vx: f.facing * Math.cos(a) * v, vy: Math.sin(a) * v, life: 120 });
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
      hurtPlayer(ctx, BALL_DMG, 'm2:fr_tucker_shot', { x: Math.sign(s.vx) * 8, y: -5 });
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
  const k = phaseK(f), n = Math.round(lerp(CRITTERS, k)) + (Math.random() < 0.5 ? 1 : 0);
  // (they come from one end (later, a few the other way too), the view's edge: they run from the bang across it)
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  let at = f.t + FIRST_IN;
  for (let i = 0; i < n; i++) {
    const fly = Math.random() < FLY_SHARE;
    const c = fly ? FLYING_CRITTERS[Math.floor(Math.random() * FLYING_CRITTERS.length)] : GROUND_CRITTERS[Math.floor(Math.random() * GROUND_CRITTERS.length)];
    const d: 1 | -1 = k > 0.5 && Math.random() < 0.3 ? (-dir as 1 | -1) : dir;
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
    // (they run straight through Tucker and each other, harmless to him: never shoved about by anybody (the playtest: they
    // got stuck on him))
    e.noCrowd = true;
    state.enemies.push(e);
    return false;
  });
  // (out: off the view's far edge (or the arena's), just gone: never a kill, never a callout)
  state.enemies = state.enemies.filter(e => {
    // (a lion leaving: off either edge of the view (it came on in it; the sucker can turn it round), or at the wall it's
    // heading for)
    if (isLion(e) && e.health > 0 && !e.isBlownAway) {
      const x = e.pos.x + e.width / 2, dir = e.facing ?? 1;
      return !(x < state.camera.x - 70 || x > state.camera.x + CANVAS_WIDTH + 70 || (dir > 0 ? e.pos.x + e.width >= ARENA_R - 4 : e.pos.x <= ARENA_L + 4));
    }
    if (!isCritter(e) || e.health <= 0 || e.isBlownAway) return true;
    // (the arena's walls stand at the view's edges once the camera's against them: reaching a wall, it's out of the scene
    // (they used to stop dead at the wall, off view only by a whisker, and pile up there for good: the playtest))
    const x = e.pos.x + e.width / 2, dir = e.facing ?? 1;
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
  // (out of the woods, one from each end (a third later), a roar off in the trees first)
  const n = k > 0.6 ? 3 : 2;
  f.lions = [];
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
        if (l.t >= l.wait) { l.mode = 'run'; l.t = 0; playSound('roar', 0.6, 4 + Math.random() * 4); if (l === f.lions[0]) mhSays(state, L.MH_LIONS, true); }
        break;
      case 'run': {
        // (flat out at him; near, the pounce)
        const to = f.tx - l.side * 30;
        l.x += l.dir * LION_V;
        if ((to - l.x) * l.dir < 120) { l.mode = 'pounce'; l.t = 0; l.vy = -7; l.vx = (to - l.x) / 26; playSound('whoosh', 0.8, -4); }
        break;
      }
      case 'pounce':
        l.x += l.vx; l.vy += 0.55; l.y += l.vy;
        if (l.y >= GY) { l.y = GY; l.mode = 'maul'; l.t = 0; playSound('thud', 0.9, -6); if (f.act !== 'mauled' && f.mode === 'on') startMaul(ctx, f); }
        break;
      case 'maul':
        l.x += ((f.tx - l.side * 30) - l.x) * 0.2;
        if (l.t % 9 === 0) state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 40, y: GY - 10 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 30, color: Math.random() < 0.6 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 });
        if (l.t % 16 === 0) playSound(Math.random() < 0.5 ? 'squish' : 'snort', 0.5, Math.random() * 6);
        break;
      case 'drag':
        l.x += l.dir * 3.4; l.y += (GY - l.y) * 0.3;
        if (l.x < ARENA_L - 160 || l.x > ARENA_R + 160 || !inView(state, l.x, -140)) l.mode = 'gone';
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
  if (f.cam && f.cam.slow === 1 && f.maulT === PUNCH_T) f.cam.zt = 1;
  // (the cats on him: whichever have got there pile in)
  for (const l of f.lions) if (l.mode === 'run' || l.mode === 'wait') { l.mode = 'run'; }
  const tickEvery = Math.floor(MAUL_T / (MAUL_TICKS + 1));
  if (f.maulT % tickEvery === 0 && f.maulDealt < MAUL_TICKS) {
    f.maulDealt++;
    const dmg = MAUL_DMG / MAUL_TICKS;
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
    for (const l of f.lions) leave(state, l);
    f.lions = [];
    f.clawed++; f.bloody = 0.25; f.shower = 0;
    setAct(f, 'getup');
    tuckerSays(f, L.TF_GETUP);
  }
};

/** A cat done with him, made a real enemy where it stands, slinking off the way it came (critters.ts LION_KIND). */
const leave = (state: GameState, l: Lion) => {
  const e = makeKindEnemy(LION_KIND as EnemyKind, l.x, GY);
  e.pos.x = l.x - e.width / 2; e.pos.y = GY - e.height; e.vel.x = 0; e.vel.y = 0;
  e.facing = l.side < 0 ? -1 : 1; e.seen = true; e.variant = l.side < 0 ? 0 : 1;
  // (it gives nothing back, like the critters: no heal or ammo off a beatdown or a shakedown; no drops, see updateFight)
  e.noHeal = true; e.noCrowd = true;
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
  clearCritters(state, f);
  f.shots = [];
  for (const s of f.swarms) s.gone = s.gone || 1;
  state.damageNumbers = [];
  p.inCutscene = true; p.vel.x = 0; p.isDucking = false;
  f.skipT = 0;
  f.death = { how: lions ? 'lions' : 'grizzly', t: 0, step: lions ? 'close' : 'fall', at: 0, done: false, bx: 0, bdir: 1, bear: null, ty: GY, tvy: 0, tear: 0, k: 0, cap: null };
  if (lions) {
    // (the kill cam: slowed, pushed in on them)
    f.cam = { t: 0, acc: 0, z: f.cam?.z ?? 1, zt: 2, top: 2, slow: 0.3 };
    playSound('roar', 1, -2); playSound('screams', 0.7, -6);
    for (const l of f.lions) if (l.mode !== 'maul') { l.mode = 'maul'; l.x = f.tx - l.side * 30; l.y = GY; }
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
        next(d, 'chunks');
        // (wide: chunks of him everywhere)
        for (let i = 0; i < 70; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, sp = 4 + Math.random() * 10;
          state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 30, y: GY - 20 - Math.random() * 30 }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 60 + Math.random() * 60, color: ['#DC2626', '#B91C1C', '#7F1D1D', '#F4C2B0', '#36467E', '#982F35', '#F5F5F4'][i % 7], size: 3 + Math.random() * 5, grav: 0.35, chunk: i % 3 === 0 });
        }
        ctx.fx.spawnDeathShower({ x: f.tx, y: GY - 30 }, d.bdir, 2.6, false, 90);
        playSound('gorespray', 1, -4); playSound('crunch', 1, -8); shakeScreen(state, 14, 7);
        d.cap = { x: f.tx, y: GY - 80, vx: -d.bdir * 3, vy: -8, rot: 0 };
      }
      break;
    case 'chunks':
      // (the bear off the way it came with the leg, gone once it's off the view (whichever edge); it's over when he's
      // had his say and the bear's gone: it never hangs about on screen into the VICTORY (the playtest))
      if (t === 70) { d.bear = 'walk'; d.bdir = (-d.bdir) as 1 | -1; }
      if (d.bear === 'walk' && t > 70) {
        d.bx += d.bdir * 3.2;
        if (d.bx < f.camX - 140 || d.bx > f.camX + CANVAS_WIDTH + 140) d.bear = null;
      }
      if (t === 100) mhSays(state, L.MH_GRIZZLY, true, () => { d.said = true; });
      if (d.said && !d.bear && t > 70) d.done = true;
      break;
  }
  return walk;
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
        // (stood up between them for it: one at his shoulders, one at his legs)
        f.lions = f.lions.slice(0, 2);
        while (f.lions.length < 2) f.lions.push({ x: f.tx, y: GY, vx: 0, vy: 0, dir: 1, mode: 'maul', t: 0, wait: 0, side: f.lions.length ? 1 : -1, carry: null });
        f.lions[0].side = -1; f.lions[1].side = 1;
      }
      break;
    case 'tear': {
      // (pulled apart: the halves going their ways, the blood strung out between, bits hung in the air)
      d.tear = Math.min(1, t / 70);
      for (const l of f.lions) { l.mode = 'maul'; l.x = f.tx + l.side * (36 + d.tear * 70); }
      if (t === 18) { playSound('gorespray', 1, -10); playSound('crunch', 1.2, -12); playSound('screams', 0.5, -10); shakeScreen(state, 14, 7); }
      if (t >= 18 && t % 3 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.tx + (Math.random() - 0.5) * 60 * d.tear, y: GY - 40 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 5, y: -3 - Math.random() * 4 }, life: 50, color: ['#DC2626', '#B91C1C', '#7F1D1D', '#F4C2B0'][i % 4], size: 2 + Math.random() * 4, grav: 0.3, chunk: i === 3 });
      if (t === 20) d.cap = { x: f.tx, y: GY - 96, vx: 2.4, vy: -7, rot: 0 };
      if (t >= 80) {
        next(d, 'drag');
        if (f.cam) { f.cam.zt = 1; f.cam.slow = 1; }
        f.lions[0].carry = 'arm'; f.lions[1].carry = 'leg';
        for (const l of f.lions) { l.mode = 'drag'; l.dir = l.side < 0 ? -1 : 1; }
      }
      break;
    }
    case 'drag':
      // (off into the trees with half of him each (tickLions walks them off); the cap left spinning)
      if (t === 60) mhSays(state, L.MH_LIONS_WON, true, () => { d.done = true; });
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (slowed: the lions) and the mauling's punch-in

const tickCam = (f: Fight) => {
  const cam = f.cam;
  if (!cam) return;
  cam.t++;
  cam.z += (cam.zt - cam.z) * (cam.zt > cam.z ? 0.2 : 0.07);
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
  const fx = Math.max(state.camera.x + m, Math.min(state.camera.x + CANVAS_WIDTH - m, f.tx)), fy = GY - 50;
  const k = Math.min(1, (cam.z - 1) / Math.max(0.001, cam.top - 1));
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};

export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death?.done && (!f.cam || f.cam.z < 1.02);
export const killedByWeakness = (f: Fight) => f.death?.how === 'lions';
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
      default: drawRemains(c, f.tx, fr); return;
    }
  }
  // (the lions: down under them; then torn in two between them; then gone with them)
  if (d.step === 'close') { drawTucker(c, f.tx, GY, f.facing, fr, 'mauled', { wounds: w, face: 'yell' }); return; }
  if (d.step === 'tear' || (d.step === 'over' && d.tear < 1)) {
    const cut = GY - 40, k = d.tear, lift = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 26;
    // (the top half, up and away with the near cat; the legs the other way)
    for (const half of [-1, 1] as const) {
      c.save();
      const dx = half * k * 70, dy = half < 0 ? -lift : -lift * 0.3, rot = half * k * 0.9;
      c.translate(f.tx + dx, cut + dy); c.rotate(rot); c.translate(-f.tx, -cut);
      c.beginPath(); if (half < 0) c.rect(f.tx - 80, cut - 200, 160, 200); else c.rect(f.tx - 80, cut, 160, 120); c.clip();
      drawTucker(c, f.tx, GY, f.facing, fr, 'hurt', { wounds: w, face: 'yell' });
      c.restore();
      // (the torn edge: ragged meat in steps, a knob of spine, strings of gut)
      c.save(); c.translate(f.tx + dx, cut + dy); c.rotate(rot);
      const rag = (e: number) => { c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(-14 + i * 3.5, ((i % 2 ? 3 : -3) - e * Math.sign(i % 2 ? 3 : -3)) * half); c.lineTo(14, 0); c.closePath(); };
      rag(-1); c.fillStyle = '#3A0606'; c.fill();
      rag(0); c.fillStyle = '#7F1D1D'; c.fill();
      rag(1.4); c.fillStyle = '#B82828'; c.fill();
      box(c, -4, -2.6, 8, 5.2, INK); box(c, -3, -2, 6, 4, '#E2DAC4'); box(c, -3, -2, 6, 1, '#FFFBF0'); box(c, -1, -1, 2, 2, '#9A2020');
      c.restore();
    }
    // (the gut strung out between them, stepped: its line, its pink, a wet glint)
    c.lineCap = 'round';
    c.strokeStyle = '#5A1A24'; c.lineWidth = 4.4; c.beginPath(); c.moveTo(f.tx - k * 70, cut - lift); c.quadraticCurveTo(f.tx, cut + 20, f.tx + k * 70, cut - lift * 0.3); c.stroke();
    c.strokeStyle = '#C86070'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = '#F0A8B8'; c.lineWidth = 1; c.beginPath(); c.moveTo(f.tx - k * 70, cut - lift - 0.8); c.quadraticCurveTo(f.tx, cut + 19, f.tx + k * 70, cut - lift * 0.3 - 0.8); c.stroke();
    c.lineCap = 'butt';
    return;
  }
  // (dragged off: nothing left but the blood where it happened)
  bloodPool(c, f.tx, 46, 4);
};

/** What the grizzly left: a blood pool, a leg (the pinstripe, the boot), ribs, the saw's blade, his spectacles, bits. */
const drawRemains = (c: Ctx, x: number, fr: number) => {
  bloodPool(c, x, 60, 5);
  // (a leg, torn off at the thigh: the gray pinstripe in steps, the boot polished, the meat and the knob of bone)
  c.save(); c.translate(x + 18, GY - 4); c.rotate(-0.1);
  box(c, -1, -4.6, 29, 9.2, INK);
  box(c, 0, -3.6, 27, 7.2, '#7A7A84'); box(c, 0, -3.6, 27, 2, '#9A9AA4'); box(c, 0, 2, 27, 1.6, '#5A5A64');
  for (const py of [-2, 0.4, 2.4]) box(c, 0, py, 27, 0.6, '#4A4A54');
  box(c, 8, -3.6, 1, 7.2, '#62626C');
  box(c, 26, -4.6, 9, 10, INK); box(c, 27, -3.6, 7, 8, '#2E2E36'); box(c, 27, -3.6, 3, 2, '#6A6A78'); box(c, 26, 4, 12, 2.4, INK); box(c, 27, 4.4, 10, 1, '#3A3A44');
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 3.8, 5.2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#921616'; c.beginPath(); c.ellipse(0, 0, 3, 4.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C83A3A'; c.beginPath(); c.ellipse(-0.6, -1, 1.8, 2.4, 0, 0, Math.PI * 2); c.fill();
  box(c, -2.6, -1.2, 3.6, 2.4, '#C8C0A8'); box(c, -2.6, -1.2, 3.6, 1, '#F5F0E6');
  c.restore();
  // (ribs: a rack of them, stepped bone, gristle red between)
  box(c, x - 27, GY - 6, 20, 4, '#6E0E0E'); box(c, x - 26, GY - 6, 18, 1, '#B82020');
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.arc(x - 22 + i * 5, GY - 2, 6, Math.PI * 1.1, Math.PI * 1.8); c.stroke();
    c.strokeStyle = '#E2DAC4'; c.lineWidth = 1.4; c.stroke();
    c.strokeStyle = '#FFFBF0'; c.lineWidth = 0.6; c.beginPath(); c.arc(x - 22 + i * 5, GY - 2.4, 6, Math.PI * 1.2, Math.PI * 1.5); c.stroke();
  }
  // (the saw's blade, flat in the leaves, its teeth, red to the hub)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x - 40, GY - 1, 11.6, 3.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8A8E96'; c.beginPath(); c.ellipse(x - 40, GY - 1.2, 10.4, 2.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C4C8D0'; c.beginPath(); c.ellipse(x - 42, GY - 2, 6, 1.2, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 9; i++) box(c, x - 51 + i * 2.6, GY - 4 + (i % 2), 1, 1, '#E8ECF0');
  box(c, x - 41, GY - 2, 2, 1.4, '#3A3C42'); box(c, x - 47, GY - 2, 7, 1.4, '#7A1212'); box(c, x - 36, GY - 1, 5, 1, '#921616');
  // (the spectacles, one lens gone, the other cracked)
  c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x + 2, GY - 3, 2.6, 2.2, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#B8902C'; c.lineWidth = 0.8; c.stroke();
  c.beginPath(); c.moveTo(x + 4.6, GY - 3); c.lineTo(x + 8, GY - 4); c.moveTo(x - 0.6, GY - 3); c.lineTo(x - 4, GY - 2); c.stroke();
  box(c, x + 1, GY - 4, 1, 1, '#E8F4FF'); box(c, x + 2, GY - 3, 1, 2, '#A8C4D8');
  // (a slow curl of steam off it, stepped)
  const s = (fr % 60) / 60, st = Math.floor(s * 4);
  c.globalAlpha = [0.3, 0.24, 0.16, 0.08][st]; pixelBlob(c, Math.round(x - 4), Math.round(GY - 10 - s * 20), 3 + s * 5, 2.6 + s * 4, '#E7E5E4'); c.globalAlpha = 1;
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

const lionPose = (l: Lion): LionPose => (l.mode === 'pounce' ? 'pounce' : l.mode === 'maul' ? 'maul' : l.mode === 'drag' ? 'drag' : 'run');

/** World, behind Meathead: the smoke, Tucker, the cats on him, the grizzly, the balls, the aim's line, the bees. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // ---- the gun's smoke, hanging: black powder's thick white cloud, stepped puffs, thinning in steps as it spreads
  for (const s of f.smoke) { const k = s.t / 70; smokePuff(c, s.x + f.facing * k * 14, s.y - k * 10, k, s.t); }
  // ---- the aim: a dotted line off the muzzle where it's pointing (blinking bright in the pan's flash)
  if (f.mode === 'on' && (f.act === 'aim' || f.act === 'pan')) {
    const m = muzzleAt(f), dx = f.facing * Math.cos(f.aim), dy = Math.sin(f.aim), pan = f.act === 'pan';
    c.globalAlpha = pan ? (fr % 6 < 3 ? 0.9 : 0.4) : 0.3;
    for (let i = 1; i < 26; i++) { const x = m.x + dx * i * 12, y = m.y + dy * i * 12; if (y > GY) break; box(c, x - 1, y - 1, 3, 2, pan ? '#FDE047' : '#FCA5A5'); }
    c.globalAlpha = 1;
  }
  // ---- Tucker
  if (f.mode === 'dead' && f.death) drawDead(c, f, fr);
  else {
    const look = tuckerLook(f);
    const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0;
    if (blink) c.globalAlpha = 0.65;
    drawTucker(c, f.tx, GY, f.facing, fr, look.pose, { wounds: woundsOf(f), face: look.face, aim: look.aim, pan: look.pan, pistol: look.pistol, talking: f.talking });
    c.globalAlpha = 1;
    // (sat up dazed: his cap's off, beside him)
    if (look.pose === 'sit') drawTuckerCap(c, f.tx - f.facing * 30, GY - 4, 0.4);
  }
  // ---- the cats
  for (const l of f.lions) drawLion(c, l.x, l.y, l.mode === 'maul' ? (l.side < 0 ? 1 : -1) : l.mode === 'drag' ? l.dir : l.dir, fr + l.side * 13, lionPose(l), { carry: l.carry });
  // ---- the grizzly
  const d = f.death;
  if (d?.bear) drawGrizzly(c, d.bx, GY, d.bdir, fr, d.bear, { carry: d.step === 'chunks' && d.bear === 'walk' ? 'leg' : null, bloody: d.step === 'chunks' ? 1 : undefined });
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
