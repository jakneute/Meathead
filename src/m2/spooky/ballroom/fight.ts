// DONNIE DRACULA, the fight (the user's design, first pass). Every number that matters is up top, to tune.
//
//   THE INTRO   (a cutscene, skippable, all of it) Donnie cowering in the far corner, begging. A demonic circle opens
//               in the dance floor: Satan's voice out of it gives Donnie real power and wants Meathead's SOUL for it.
//               Donnie rises out of his corner, changed (real fangs, red eyes, real wings), and couldn't care less about
//               the soul: he wants to show off his sick new powers by killing him. Satan: "ONE DAY YOUR SOUL WILL BE
//               MINE." Donnie panics. The circle closes; on.
//   HOVER       He flies about over the dance floor, showing off (taunting), Satan nagging him about the soul now and
//               then. Then one of:
//   THE GRAB    A beat (the wings out, his eyes flaring: the tell), then a swoop down at him and back up. It gets him:
//               he's in Donnie's clutches, the fangs in his neck, his life drained a bit at a time (Donnie healed by it)
//               till he mashes his way loose (any button, fast) or Donnie's had his fill. Killed by it: drained to a
//               husk (husk.ts).
//   A GUEST     Every so often a panicked park guest runs across the ballroom. Donnie goes for them (it's what he does
//               whenever one's there): snatches them up, sucks them dry (a husk drops), a little health back each gulp (a charge into him stops it), and then...
//   THE SPEW    ...hangs in the air and sprays the blood back out at Meathead like a machine gun: a stream of it, aimed,
//               the aim dragging after him (keep moving, jump it).
//
//   GLUTTONY    His sin. Every gulp (Meathead's blood or a guest's) swells him a step (the gut out over his belt, the
//               cheeks and chins puffing up), and after every drink a burp and his say ("SECONDS."). Full, he's slower
//               and sloppier (the window: lower in the air, a longer tell, a slower swoop, a wider spray, winded
//               longer), and thins back down over a few seconds. And he can't help himself: a guest coming near while
//               he's at Meathead (even with his fangs in him) can pull him off it to feed (each guest the once, mostly).
//
// Hurting him: the ray gun and his moves in full; any other special weapon but the weakness barely does (SHARE: every land
// boss's way); and a boss's usual breather after each hit. His weakness is the
// SOUVENIR LAUNCHER, and only one souvenir in its bag: CHRIST THE REDEEMER. That one stuns him (down out of the air,
// smoking, on his backside: the window) and takes a big chunk off. The rest of the bag hits him like anything else
// (SHARE). And any time one of the lesser souvenirs could finish him (at his health now, counting the ones already in
// the air), the launcher's next one out is always the Redeemer, and no lesser one ever does: a souvenir kill on
// Donnie is always the Redeemer's (the weakness death: the kill cam, and he burns up to a pile of ash).
//
// Two deaths: by the Redeemer (the weakness: the kill cam, a white flash, the cut in close, slow motion; he catches
// fire, flails, and crumbles to a pile of ash, his wig on top of it, the little statue standing in it); any other way,
// everything he's drunk catches up with him: he swells up in the air past full (the buttons popping, a burp to shake
// the room), his powers go out and he drops out of the air in a belly flop, his trousers down round his ankles, rear up
// in his bat boxers, the disco ball comes down on it, and he shits himself, going down like a balloon. Satan takes his
// soul either way.

import { paintSatan, drawSatanFace } from '../hell/satanArt';
import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, cutVoice, pickLine, pickFreshLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { setSouvenirPick, setSouvenirHit, souvenirMaxHit } from '../../weapons/souvenir';
import { drawPerson, lookOf } from '../../adventure/temple/people';
import { drawDonnie, drawLooseWig, DONNIE_H, type DonniePose } from '../../cast/donnie';
import { box, label, saidOver, hands, speak, voice, meatheadSays } from '../section';
import { GY } from '../geometry';
import { inputDevice, padFamily } from '../../../m1/game/platform/device';
import { drawPadFace } from '../../../m1/game/render/padGlyph';
import { DRAIN, drawHusk } from './husk';
import { ARENA_L, ARENA_R, ARENA_MID, CIRCLE_X } from './arena';
import { discoBall } from './art';
import { INK, checker, pixelBlob } from '../control/paint';
import * as L from './lines';
import { since } from '../../frames';
import { drawBurn, burnLights } from './burn';
import { drawDonnieGross, drawDonnieGrossBack } from '../../cast/donnieGross';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** His health (Meathead 1's bosses'), and the enemy's (never runs out: the hits are taken off ours). */
const HP = 666, BIG = 100000;
/** Most weapons: what of their usual damage gets through (a land boss shrugs off what isn't his weakness; at least 1); after each hit, a boss's breather (the
 *  standard one, as every boss has it: blinking, nothing lands). */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** The launcher's other souvenirs (it hits hard, and they bounce back for more): a smaller share (the Redeemer's the
 *  point of it, not the rest of the bag); the same breather. */
const SOUV_SHARE = 0.15, SOUV_IFRAMES = ENEMY_HIT_COOLDOWN;
/** The Redeemer: what it takes off him, how long he's down for. */
const REDEEMER_DMG = 90, REDEEMER_STUN = 120;
/** After one's put him down, he's wise to it a while: another in that time is just a souvenir (unless it'd finish him). */
const REDEEMER_GRACE = 300;
/** Hovering about between goes (frames, by phase); how high (feet above the floor). */
const HOVER_T = [0, 140, 110, 88], HOVER_UP = 160;
/** Now and then, hovering, he swoops down low across the floor (in the line of fire) for a while: every this often,
 *  for this long (frames), down to this far off the floor. */
const SWOOP_EVERY = 300, SWOOP_T = 110, SWOOP_UP = 34;
/** His poise: knocked off what he's doing by a charge move at most this often (frames); his sucking a guest, always. */
const POISE_T = 170;
/** After his hover, the spew instead of the grab this often (it's his whether or not he's had a drink). */
const SPEW_CHANCE = 0.3;
/** Winded (down on the floor, catching his breath: the window), after a swoop that missed and after the spew (by phase). */
const WINDED_T = [0, 78, 62, 50];
/** The grab: the tell, the swoop's length, how far past him it carries on. */
const AIM_T = [0, 46, 38, 32], DIVE_T = [0, 50, 44, 38], DIVE_PAST = 240;
// (only on the way down and at the bottom: once he's pulling back up past the mark, he can't get hold of anybody)
/** The grab's target is locked this long before he goes (the marker stops following him: move off it). */
const LOCK_T = 10;
/** ...but the swoop still bends after him on the way down: this far a frame (by phase), till this far through it. */
const HOME = [0, 2.6, 3.4, 4.2], HOME_TILL = 0.45;
/** How close his claws have to come (px, either way, across and up and down). */
const CLAW_X = 42, CLAW_Y = 50;
/** Held: a drain every so often (his damage, Donnie's heal), let go after this long at most, or this many presses. */
const DRAIN_EVERY = 18, DRAIN_DMG = 5, DRAIN_HEAL = 5, DRAIN_MAX = 150, ESCAPE_PRESSES = 9;
/** The guests: how often one runs through (by phase), how fast; sucking one dry, how long and what it heals. */
const GUEST_EVERY = [0, 640, 520, 420], GUEST_SPEED = 3.4, SUCK_T = 90, GUEST_HEAL = 3;
/** The spew: the aim first, then the stream (by phase), a drop every so often, how hard, how fast; how fast his aim
 *  can follow Meathead (px a frame: about his walk, so standing still or walking straight away gets you hosed). */
const SPEW_AIM = 34, SPEW_T = [0, 99, 120, 144], SPEW_EVERY = 3, BLOOD_DMG = 14, BLOOD_SPEED = 8.5, AIM_FOLLOW = 3.2;
/** The spray: drops a go, how wide the cone (radians either side of the aim), how big a drop's hit is (px about it). */
const SPRAY_N = 2, SPRAY_CONE = 0.13, DROP_HIT = 5;
/** The stream comes in bursts: this many frames on, this many off. */
const BURST_ON = 18, BURST_OFF = 12;
/** Satan's nags, Donnie's taunts: every so often (frames). */
const NAG_EVERY = 1300, TAUNT_EVERY = 800;
/** At least this long between one of Satan and Donnie's beats and the next (frames). */
const BEAT_GAP = 360;
/** How long he spends admiring himself as the fight starts (frames): one loop-the-loop. */
const ADMIRE_T = 120;
/** At least this long between Meathead's hints about the souvenirs (frames). */
const HINT_GAP = 600;
/** Gluttony. How full a gulp makes him (a step is 1: drawn a whole step at a time, from the first gulp), Meathead's
 *  blood (a drain's tick) or a guest's (a guest's gulp); the most he holds; how long he stays that full after his last
 *  gulp, then how fast he thins back down (steps a frame: all three in four seconds). */
const FULL_GULP = 0.25, FULL_GUEST = 0.15, FULL_MAX = 3, FULL_HOLD = 90, FULL_THIN = 1 / 80;
/** Full, he's slower and sloppier, a step at a time (the window): his flying, his swoop and his aim this much slower
 *  a step; the grab's tell this many frames longer a step; hanging this much lower a step (px); winded this much longer
 *  a step; the spew's spray this much wider a step. */
const FULL_SLOW = 0.12, FULL_TELL = 6, FULL_SAG = 22, FULL_WINDED = 0.25, FULL_SPRAY = 0.5;
/** The burp after every drink: when it comes up (frames after), when he has his say, how long he's holding his gut. */
const BURP_AT = 8, BURP_SAY = 34, BURP_T = 46;
/** A guest this near (px across) while he's at Meathead pulls him off it to feed, this often (each guest the once). */
const TEMPT_R = 260, TEMPT_CHANCE = 0.6;
/** Eating himself to death (the usual death): how long he swells up in the air before he drops. */
const GORGE_T = 100;

/** Sources of hurt (each with its lines and its death screen). */
const BLOOD = 'm2:donnie_blood';
registerHurtLines(DRAIN, L.HURT_DRAIN, L.DEATH_DRAIN);
registerHurtLines(BLOOD, L.HURT_BLOOD, L.DEATH_BLOOD);

// ---------------------------------------------------------------------------------------------------------------
// The state

type Intro = 'plead' | 'reply' | 'open' | 'bestow' | 'rise' | 'gross' | 'powered' | 'soul' | 'panic' | 'mh' | 'close';
export type Mode = 'intro' | 'hover' | 'aim' | 'dive' | 'drain' | 'rise' | 'hunt' | 'suck' | 'spew' | 'winded' | 'flinch' | 'stunned' | 'dead';

interface Guest { x: number; dir: 1 | -1; seed: number; state: 'run' | 'held' | 'fall' | 'husk'; y: number; vy: number; t: number; said: string | null; facing: 1 | -1;
  /** Got away from him once (he was knocked off them): he won't go after that one again. */
  spared?: boolean;
  /** Came near him while he was at Meathead (he's had his chance to break off for them: the once). */
  tempted?: boolean }
interface Drop { x: number; y: number; vx: number; vy: number; r: number }
interface Splat { x: number; w: number; t: number }
export interface KillCam { t: number; acc: number; z: number; out: boolean }

export interface Fight {
  hp: number; iframes: number; flash: number;
  mode: Mode; t: number; total: number;
  /** Where he is (his middle, his feet), how he's moving, which way he faces. */
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  intro: Intro; introT: number; skipT: number;
  /** The fight's first moments: him admiring his new self (frames left). */
  admireT: number;
  /** The circle in the floor (0 shut, 1 open), and him changed. */
  circle: number; powered: boolean;
  /** The swoop: its curve (from, the bottom of it at him, on past), how long. */
  dive: { ax: number; ay: number; cx: number; cy: number; bx: number; by: number; d: number; tx: number; ty: number } | null;
  /** Where the swoop's going to bottom out (shown on the floor through the tell): following him, then locked. */
  mark: { x: number; y: number; locked: boolean } | null;
  held: { t: number; presses: number; was: Controls } | null;
  guests: Guest[]; guestT: number; prey: Guest | null;
  drops: Drop[]; splats: Splat[]; aimX: number; aimY: number;
  stunT: number; side: 1 | -1;
  /** When the Redeemer can put him down again (frames, by f.total). */
  redeemAt: number;
  /** When a hit last knocked him off what he was doing (he won't be knocked about again for a while: his poise). */
  staggerAt: number;
  /** The wrong souvenirs: how many have hit him, when Meathead last had a think about it out loud. */
  wrongN: number; hintAt: number;
  /** He's knocked a guest loose off him with a charge (so he knows): no more hints about it. */
  knockedLoose: boolean;
  said: string | null; satanSaid: string | null; nagT: number; tauntT: number;
  /** What a souvenir did to him this frame (the launcher tells us: its hit hook). */
  souvenir: { id: string } | null;
  /** The last of Meathead's moves that landed on him. */
  moveSeen: number | undefined;
  /** Gluttony: how full he is (steps, 0..FULL_MAX), when he last had a gulp; the burp after a drink (frames into it). */
  full: number; fullAt: number; burpT: number;
  death: { how: 'flat' | 'burn'; t: number; x: number; y: number; vy: number; facing: 1 | -1; land: number; bloat: number } | null;
  deathSaid: number;
  cam: KillCam | null;
  /** Satan and Donnie's beats: the next one waiting its turn, one going now, which have gone (the once-only ones),
   *  how many guests he's sucked dry; flinching (frames), and where the phases have got to. */
  beat: { s: L.ByPants; d: L.ByPants; flinch: boolean } | null; beatOn: boolean; beatEnd: number; beatsDone: Set<string>; guestKills: number;
  /** The wig, off (knocked off half way), lying where it fell. */
  wigOff: { x: number; y: number; vy: number } | null;
  e: Enemy;
}

/** The fight going on now (the launcher's hooks look at it). */
let live: Fight | null = null;
let game: GameState | null = null;
const pants = (): L.Dressed => (!game ? 'clean' : isNude(game) ? 'nude' : isShat(game) ? 'shitty' : 'clean');
export const resetFight = () => { live = null; };

// ---------------------------------------------------------------------------------------------------------------
// The weakness: the souvenir launcher's say (which comes out of the bag), and its hits on him

/** What a lesser souvenir (anything but the Redeemer) could take off him at most. */
const lesserMax = (all: readonly { id: string; dmg: number }[]) => Math.max(0, ...all.filter(t => t.id !== 'redeemer').map(t => Math.max(1, souvenirMaxHit(t.dmg) * SOUV_SHARE)));
setSouvenirPick(all => {
  const f = live;
  if (!f || !game || f.mode === 'dead' || f.mode === 'intro') return null;
  // (counting the lesser ones already in the air: any of them could land too)
  let inAir = 0;
  for (const p of game.projectiles) {
    if (p.custom !== 'SOUVENIR') continue;
    const t = (p.customData as { t?: { id: string; dmg: number } } | undefined)?.t;
    if (t && t.id !== 'redeemer') inAir += Math.max(1, souvenirMaxHit(t.dmg) * SOUV_SHARE);
  }
  return f.hp <= lesserMax(all) + inAir ? 'redeemer' : null;
});
// (the Redeemer comes apart on him: one hit, its one chunk, no bouncing back for more)
setSouvenirHit((e, id) => { if (!live || e !== live.e) return false; live.souvenir = { id }; return id === 'redeemer'; });

// ---------------------------------------------------------------------------------------------------------------
// Donnie, the enemy (the engine's: for the hits. He's drawn here, not by it)

const DONNIE_KIND = 'm2:donnie' as const;
registerM2Kind({
  kind: DONNIE_KIND,
  stats: { w: 44, h: 84, hp: BIG, contact: 0, mass: 320, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 2, y: -74, r: 12 },
  draw: () => {},
  ai: () => true,
  // (grabbed at: too much of a greasy fatass to hold on to; he squirts out)
  onGrab: ctx => (live && live.mode !== 'dead' && live.mode !== 'intro' && live.mode !== 'drain' ? greased(ctx, live) : undefined),
});

/** The words over a grab at him, at most this often (frames); whose turn it is (him, then Meathead, and round). */
const GREASE_SAY_GAP = 150;
let greaseSaidAt = -9999, greaseN = 0;
/** A grab at him: his flab squirts out of Meathead's arms in a spray of grease, Meathead's hands slide off and he goes
 *  stumbling back off him (thrown off balance a beat), and Donnie scoots off the other way. */
const greased = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  const dir = p.pos.x + p.width / 2 < f.x ? -1 : 1;
  p.isCharging = false; p.isDivekicking = false; p.isUppercutting = false;
  p.vel = { x: dir * 7, y: -5 };
  p.lockTimer = Math.max(p.lockTimer, 22); p.recoiling = true; p.slipT = 22;
  f.vx -= dir * 5;
  playSound('squish', 0.9, -2); playSound('oil', 0.8, 2);
  const hx = p.pos.x + p.width / 2 - dir * 14, hy = p.pos.y + p.height * 0.4;
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: hx + (Math.random() - 0.5) * 10, y: hy + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 26 + Math.random() * 14, color: ['#FDE68A', '#FACC15', '#A16207'][i % 3], size: 2 + Math.random() * 3, grav: 0.3 });
  if (since(state.frame, greaseSaidAt) >= GREASE_SAY_GAP) {
    greaseSaidAt = state.frame;
    if (greaseN++ % 2 === 0 && quiet(f)) bark(f, L.DONNIE_GREASED);
    else meatheadSays(state, pick(L.MEATHEAD_GREASE), false);
  }
  return { said: true, free: true };
};

// ---------------------------------------------------------------------------------------------------------------
// Saying things

/** A bark: dropped if somebody's talking. */
/** Nobody in the fight saying anything just now (Donnie, Satan, a guest): one voice at a time, text only while said. */
const quiet = (f: Fight) => !f.said && !f.satanSaid && !f.beatOn && !f.guests.some(g => g.said);
const bark = (f: Fight, lines: L.ByPants) => { if (quiet(f)) sayBark(f, pick(lines[pants()])); };
/** A bark only if one of them's not been said lately (one that comes round a lot: never the same twice in a while). */
const barkFresh = (f: Fight, lines: L.ByPants) => { if (!quiet(f)) return; const t = pickFreshLine(lines[pants()]); if (t) sayBark(f, t); };
const sayBark = (f: Fight, text: string) => {
  say(text, voice('m2.donnie'), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
/** A line that waits its turn, then (if the scene's still the same) on to whatever's next. */
let token = 0;
const line = (f: Fight, who: 'donnie' | 'satan', lines: L.ByPants, onDone?: () => void) => {
  const tok = token;
  speak(who === 'satan' ? 'm2.satan' : 'm2.donnie', pick(lines[pants()]), s => { if (tok !== token) return; if (who === 'satan') f.satanSaid = s?.text ?? null; else f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); });
};

// ---------------------------------------------------------------------------------------------------------------
// Starting: the intro

/** Where he cowers (the far corner), how high he flies. */
const CORNER_X = ARENA_R - 70;

export const startFight = (state: GameState): Fight => {
  game = state; token++;
  const e = makeKindEnemy(DONNIE_KIND as EnemyKind, CORNER_X, GY);
  e.facing = -1; e.seen = true;
  const f: Fight = {
    hp: HP, iframes: 0, flash: 0, mode: 'intro', t: 0, total: 0, x: CORNER_X, y: GY, vx: 0, vy: 0, facing: -1,
    intro: 'plead', introT: 0, skipT: 0, admireT: 0, circle: 0, powered: false, dive: null, mark: null, held: null,
    guests: [], guestT: 0, prey: null, drops: [], splats: [], aimX: 0, aimY: 0, stunT: 0, side: -1, redeemAt: 0, staggerAt: -99999, wrongN: 0, hintAt: -99999, knockedLoose: false,
    said: null, satanSaid: null, nagT: 0, tauntT: 0, souvenir: null, moveSeen: e.hitByMove,
    death: null, deathSaid: 0, cam: null, wigOff: null, e, full: 0, fullAt: -9999, burpT: 0,
    beat: null, beatOn: false, beatEnd: -9999, beatsDone: new Set(), guestKills: 0,
  };
  live = f;
  // (a retry: he's up and waiting already, powered, no cutscene; a beat for his entrance first (a loop and a taunt,
  // nothing at him): the user's "give a beat for him to make his entrance before you can take damage")
  if (introSeen) { f.x = ARENA_MID + 140; f.y = GY - HOVER_UP; beginFight(state, f, true); return f; }
  state.player.inCutscene = true;
  line(f, 'donnie', L.DONNIE_PLEAD, () => { f.intro = 'open'; f.introT = 0; });
  return f;
};
/** Seen the intro this time through (a retry from outside the doors skips it). Reset coming at the land fresh. */
let introSeen = false;
export const forgetFightIntro = () => { introSeen = false; };
const tokened = (fn: () => void) => { const tok = token; return () => { if (tok === token) fn(); }; };

/** The intro, each frame (out of his hands; skippable, all of it). */
const intro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  p.facing = (f.x < p.pos.x + p.width / 2 ? -1 : 1);
  if (f.skipT > SKIP_AFTER) offerSkip();
  if (f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; beginFight(state, f); return hands(); }
  const t = f.introT;
  switch (f.intro) {
    case 'open':
      // (the floor splitting in a ring, red light up out of it, the rumble)
      f.circle = Math.min(1, t / 70);
      if (t % 8 === 0) { playSound('rumble', 0.5 + f.circle * 0.5, -8); shakeScreen(state, 2 + f.circle * 6, 3); }
      if (t === 40) playSound('thunder', 0.8, -6);
      if (t >= 80) { f.intro = 'bestow'; f.introT = 0; line(f, 'satan', L.SATAN_GRANT, () => { f.intro = 'rise'; f.introT = 0; }); }
      break;
    case 'rise':
      // (up out of his corner, changed: lifted, the flash, the wings out)
      f.y = GY - Math.min(1, t / 70) * HOVER_UP;
      f.x += (ARENA_MID + 140 - f.x) * 0.03;
      if (t === 36) {
        f.powered = true; playSound('thunder', 1, -2); playSound('roar', 0.7, 4); shakeScreen(state, 14, 8);
        // (the drumstick he'd been cowering with, dropped: he's after bigger things now)
        for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: f.x + f.facing * 14, y: f.y - 60 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - i }, life: 50, color: ['#B8701E', '#F1E6C8', '#E09A3A'][i], size: 4 - i, grav: 0.35 });
      }
      if (t >= 80) { f.intro = 'gross'; f.introT = 0; playSound('roar', 0.6, -2); playSound('ding', 0.5, -8); }
      break;
    case 'gross':
      // (changed: his face, close up and gross, a beat; silent but the roar)
      if (t >= GROSS_T) { f.intro = 'close'; f.introT = 0; }
      break;
    case 'close':
      f.circle = Math.max(0, 1 - t / 40);
      if (t === 2) playSound('slam', 0.8, -6);
      if (t >= 44) beginFight(state, f);
      break;
    default: break;
  }
  if (f.intro !== 'plead' && f.intro !== 'reply' && f.intro !== 'open' && f.intro !== 'bestow' && f.intro !== 'rise') f.y += (GY - HOVER_UP + Math.sin(f.total * 0.05) * 8 - f.y) * 0.1;
  return hands();
};

/** On: out of the cutscene, into the air, the circle shut. */
const beginFight = (state: GameState, f: Fight, retry = false) => {
  token++; introSeen = true;
  f.said = null; f.satanSaid = null;
  f.powered = true; f.circle = 0;
  if (f.y > GY - HOVER_UP + 20) { f.y = GY - HOVER_UP; f.x = ARENA_MID + 140; }
  to(f, 'hover'); f.nagT = NAG_EVERY - 300; f.tauntT = 0; f.guestT = 0;
  state.player.inCutscene = false;
  // (and straight away, smitten with himself: a loop-the-loop and a gush about it)
  // (a retry's entrance: the same loop, nothing at him through it, his taunt for coming back)
  f.admireT = ADMIRE_T; playSound('whoosh', 0.8, 6);
  line(f, 'donnie', retry ? L.DONNIE_ENTRANCE : L.DONNIE_ENAMORED);
  state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP * 0.66 ? 1 : f.hp > HP * 0.33 ? 2 : 3);
const to = (f: Fight, m: Mode) => { f.mode = m; f.t = 0; };
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const faceHim = (state: GameState, f: Fight) => { f.facing = pmid(state).x < f.x ? -1 : 1; };
const canHurtHim = (state: GameState) => { const p = state.player; return p.health > 0 && state.deathTimer <= 0; };

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  live = f; game = state;
  f.total++;
  if (f.mode === 'intro') { const out = intro(ctx, f); sync(state, f); return out; }
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  takeHits(ctx, f);
  if (f.hp <= 0 && f.mode !== 'dead') die(ctx, f);
  let out = controls;
  const ph = phase(f);
  // Satan and Donnie: their beats, at their moments
  if (f.mode !== 'dead') {
    if (ph >= 2) queueBeat(f, 'yours', L.SATAN_SOUL, L.DONNIE_SATAN_PANIC, true);
    if (f.hp < HP * 0.25) queueBeat(f, 'low', L.SATAN_LOW, L.DONNIE_LOW, true);
    runBeat(f);
  }
  // (half gone: the wig comes off, and stays off)
  if (!f.wigOff && f.hp < HP / 2 && f.mode !== 'dead') { f.wigOff = { x: f.x, y: f.y - 90, vy: -4 }; playSound('whoosh', 0.5, 8); }
  if (f.wigOff && f.wigOff.y < GY - 4) { f.wigOff.vy += 0.4; f.wigOff.y = Math.min(GY - 4, f.wigOff.y + f.wigOff.vy); }
  guests(ctx, f);
  if (f.mode !== 'dead') { gorge(ctx, f); tempt(state, f); }
  const sl = slow(f), sag = FULL_SAG * steps(f);
  switch (f.mode) {
    case 'hover': {
      // (about over the floor, off to one side of him, bobbing; showing off; Satan on at him about the soul)
      // (full: hanging lower, heavier, slower about it)
      const px = pmid(state).x;
      let hx = Math.max(ARENA_L + 90, Math.min(ARENA_R - 90, px + f.side * 210)), hy = GY - HOVER_UP + sag + Math.sin(f.total * 0.05) * 14;
      // (now and then a swoop: down low, across the floor past him and up the other side; he's in the line of fire)
      const sw = f.total % SWOOP_EVERY;
      if (f.admireT <= 0 && sw < SWOOP_T) {
        const k = Math.sin((sw / SWOOP_T) * Math.PI);
        hy = GY - HOVER_UP + sag + (HOVER_UP - sag - SWOOP_UP) * k;
        hx = Math.max(ARENA_L + 90, Math.min(ARENA_R - 90, px - f.side * 260 + f.side * 520 * (sw / SWOOP_T)));
        if (sw === 1) playSound('whoosh', 0.7, -2);
      }
      // (the first moments: showing himself off, a big loop in the air, not after him yet)
      if (f.admireT > 0) { const a = (1 - f.admireT / ADMIRE_T) * Math.PI * 2; hx = f.x + Math.sin(a) * 40; hy = GY - HOVER_UP - (1 - Math.cos(a)) * 70; f.admireT--; if (f.admireT % 40 === 0) playSound('whoosh', 0.5, 8); }
      f.vx = (f.vx + (hx - f.x) * 0.012 * sl) * 0.9; f.vy = (f.vy + (hy - f.y) * 0.02 * sl) * 0.88;
      f.x += f.vx; f.y += f.vy;
      faceHim(state, f);
      if (f.admireT <= 0 && ++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 120); bark(f, L.DONNIE_TAUNT); }
      if (++f.nagT >= NAG_EVERY) { f.nagT = Math.floor(Math.random() * 200); queueBeat(f, 'nag', L.SATAN_NAG, L.DONNIE_SHOWOFF, false, true); }
      // (a guest in the room: he can't help himself)
      const prey = f.guests.find(g => g.state === 'run' && !g.spared && g.x > ARENA_L + 40 && g.x < ARENA_R - 40);
      if (prey && f.t > 30 && f.admireT <= 0) { f.prey = prey; to(f, 'hunt'); bark(f, L.DONNIE_SNATCH); playSound('whoosh', 0.8, -4); break; }
      if (f.t >= HOVER_T[ph] && f.admireT <= 0 && f.total % SWOOP_EVERY >= SWOOP_T) {
        f.side = f.side > 0 ? -1 : 1;
        // (the grab, or the spew: he's got blood in him to spit whether or not he's just had a drink)
        if (Math.random() < SPEW_CHANCE) { to(f, 'spew'); f.aimX = pmid(state).x; f.aimY = pmid(state).y; bark(f, L.DONNIE_SPEW); }
        else to(f, 'aim');
      }
      break;
    }
    case 'aim':
      // (the tell: hanging there, wings wide, eyes flaring, a screech)
      faceHim(state, f); f.vx *= 0.8; f.vy *= 0.8; f.x += f.vx; f.y += f.vy;
      if (f.t === 1) { playSound('screams', 0.35, 10); if (Math.random() < 0.4) bark(f, L.DONNIE_DIVE); }
      {
        // (the marker: on him (his feet), till it locks)
        const m = pmid(state), p = state.player;
        if (!f.mark || !f.mark.locked) f.mark = { x: m.x, y: Math.min(GY, p.pos.y + p.height), locked: f.t >= aimT(f) - LOCK_T };
        if (f.mark.locked && f.t === aimT(f) - LOCK_T) playSound('click', 0.6, 8);
      }
      if (f.t >= aimT(f)) {
        const mk = f.mark!, tx = mk.x, ty = Math.min(GY, mk.y - 30 + 45);
        const bx = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, tx + f.facing * DIVE_PAST)), by = GY - HOVER_UP + sag;
        // (a curve from him, through him at the bottom, back up the far side; slower, full)
        f.dive = { ax: f.x, ay: f.y, cx: 2 * tx - (f.x + bx) / 2, cy: 2 * ty - (f.y + by) / 2, bx, by, d: Math.round(DIVE_T[ph] / sl), tx, ty };
        to(f, 'dive'); playSound('whoosh', 1, -4); f.mark = null;
      }
      break;
    case 'dive': {
      const d = f.dive!, s = Math.min(1, f.t / d.d), u = 1 - s;
      // (homing: the bottom of the swoop dragged after him, so a little step aside isn't enough; jump it, or run)
      if (s < HOME_TILL) {
        const pm = pmid(state).x;
        d.tx += Math.max(-HOME[ph] * sl, Math.min(HOME[ph] * sl, pm - d.tx));
        d.bx = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, d.tx + (d.tx >= d.ax ? 1 : -1) * DIVE_PAST));
        d.cx = 2 * d.tx - (d.ax + d.bx) / 2;
      }
      const nx = u * u * d.ax + 2 * u * s * d.cx + s * s * d.bx, ny = u * u * d.ay + 2 * u * s * d.cy + s * s * d.by;
      f.vx = nx - f.x; f.vy = ny - f.y; f.x = nx; f.y = Math.min(GY, ny);
      if (Math.abs(f.vx) > 0.3) f.facing = f.vx < 0 ? -1 : 1;
      if (state.frame % 2 === 0) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: -f.vx * 0.2, y: -f.vy * 0.2 }, life: 14, color: 'rgba(127, 29, 29, 0.6)', size: 6 });
      // (his claws on him: got him)
      const m = pmid(state), p = state.player;
      if (s < 0.62 && canHurtHim(state) && p.invincibilityTimer <= 0 && Math.abs(m.x - f.x) < CLAW_X && Math.abs(m.y - (f.y - 46)) < CLAW_Y) { grab(state, f, controls); break; }
      if (s >= 1) { f.dive = null; to(f, 'winded'); }
      break;
    }
    case 'drain': out = drain(ctx, f, controls); break;
    case 'winded':
      // (down on the floor, bent over, puffing: the window to get at him)
      f.vx *= 0.85; f.x += f.vx; f.y += (GY - f.y) * 0.18;
      if (f.t === 12) playSound('land', 0.6, -2);
      if (f.t % 24 === 0) state.particles.push({ pos: { x: f.x + f.facing * 16, y: f.y - 70 }, vel: { x: f.facing * 0.6, y: -0.6 }, life: 20, color: 'rgba(230, 230, 230, 0.6)', size: 4 });
      // (full: puffing longer)
      if (f.t >= WINDED_T[ph] * (1 + FULL_WINDED * steps(f))) { to(f, 'rise'); f.vy = -3; }
      break;
    case 'rise':
      f.vy = (f.vy + (GY - HOVER_UP + sag - f.y) * 0.03) * 0.85; f.y += f.vy; f.x += f.vx; f.vx *= 0.92;
      if (f.t > 40) to(f, 'hover');
      break;
    case 'hunt': {
      // (down on the guest, fast)
      const g = f.prey;
      if (!g || g.state !== 'run' || g.x < ARENA_L - 20 || g.x > ARENA_R + 20) { f.prey = null; to(f, 'rise'); break; }
      const tx = g.x - g.dir * 6, ty = GY - 8, dx = tx - f.x, dy = ty - f.y, dist = Math.hypot(dx, dy) || 1;
      const sp = Math.min(dist, 9.5 * sl);
      f.x += (dx / dist) * sp; f.y += (dy / dist) * sp; f.facing = dx < 0 ? -1 : 1;
      if (dist < 16) { g.state = 'held'; g.t = 0; to(f, 'suck'); playSound('crunch', 0.8); playSound('screams', 0.6, 4); }
      break;
    }
    case 'suck': {
      // (up off the floor with them, the fangs in, them going gray and thin; a husk drops)
      const g = f.prey!;
      f.y += (GY - 40 - f.y) * 0.08;
      // (him, a beat in, till he's done it once: knock him off them)
      if (f.t === 24 && !f.knockedLoose && f.total - f.hintAt > HINT_GAP) { f.hintAt = f.total; meatheadSays(state, pick(L.MEATHEAD_CHARGE_HINT), false); }
      g.t++;
      // (a little back with every gulp, while it lasts: a charge into him knocks the guest loose and stops it)
      if (f.t % 14 === 0 && f.hp > 0) {
        f.hp = Math.min(HP, f.hp + GUEST_HEAL);
        eat(f, FULL_GUEST);
        for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 30, y: f.y - 60 - Math.random() * 30 }, vel: { x: 0, y: -1.2 }, life: 24, color: '#DC2626', size: 3 });
      }
      if (f.t % 14 === 0) { playSound('suck', 0.5, 2); state.particles.push({ pos: { x: f.x + f.facing * 14, y: f.y - 70 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 }, life: 20, color: '#B91C1C', size: 3, grav: 0.3 }); }
      if (f.t >= SUCK_T) {
        g.state = 'fall'; g.vy = -1; g.y = f.y - 30; g.facing = f.facing;
        f.prey = null;
        if (++f.guestKills === 1 || f.guestKills === 3) queueBeat(f, 'guest' + f.guestKills, L.SATAN_GUEST, L.DONNIE_GUEST, false);
        playSound('crumble', 0.8);
        // (the burp, his say after it (not the spew's): then it all back out at Meathead)
        to(f, 'spew'); f.aimX = pmid(state).x; f.aimY = pmid(state).y;
        burp(f);
      }
      break;
    }
    case 'spew': {
      // (up into the air; the aim; then the stream, the aim dragging after him; full, lower, his aim lazier, the spray
      // all over the place)
      f.vy = (f.vy + (GY - 170 + sag - f.y) * 0.03) * 0.85; f.y += f.vy;
      faceHim(state, f);
      const m = pmid(state), follow = AIM_FOLLOW * sl;
      f.aimX += Math.max(-follow, Math.min(follow, m.x - f.aimX)); f.aimY += Math.max(-follow, Math.min(follow, m.y - f.aimY));
      const firing = f.t > SPEW_AIM && (f.t - SPEW_AIM) % (BURST_ON + BURST_OFF) < BURST_ON;
      if (firing && f.t % SPEW_EVERY === 0) {
        const mx = f.x + f.facing * 14, my = f.y - 74, dx = f.aimX - mx, dy = f.aimY - my;
        // (a spray: a few at a go, spread about the aim, some bigger than others)
        const a0 = Math.atan2(dy, dx);
        for (let k = 0; k < SPRAY_N; k++) {
          const a = a0 + (Math.random() * 2 - 1) * SPRAY_CONE * (1 + FULL_SPRAY * steps(f)), sp = BLOOD_SPEED * (0.9 + Math.random() * 0.25);
          f.drops.push({ x: mx, y: my, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4 + Math.random() * 4 });
        }
        if (f.t % 6 === 0) playSound('gush', 0.25, 6 + Math.random() * 4);
      }
      if (f.t >= SPEW_AIM + SPEW_T[ph]) to(f, 'winded');
      break;
    }
    case 'flinch':
      // (Satan's got to him: a shudder in the air, a dip, a beat where he's not paying attention)
      f.vy = (f.vy + (GY - HOVER_UP + 30 - f.y) * 0.04) * 0.85; f.y += f.vy; f.x += Math.sin(f.t * 1.3) * 1.2;
      if (f.t >= 50) to(f, 'hover');
      break;
    case 'stunned':
      // (down out of the air, onto his backside, smoking; then back up)
      if (f.y < GY) { f.vy += 0.6; f.y = Math.min(GY, f.y + f.vy); if (f.y >= GY) { playSound('thud', 1, -4); shakeScreen(state, 8, 4); } }
      if (f.t % 6 === 0) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 24, y: f.y - 40 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5), y: -1.2 }, life: 30, color: 'rgba(200, 200, 200, 0.5)', size: 5, grav: -0.02 });
      if (f.t % 40 === 1) playSound('twinkle', 0.4, 6);
      if (f.t >= f.stunT) { to(f, 'rise'); f.vy = -3; }
      break;
    case 'dead': dying(ctx, f); break;
  }
  f.x = Math.max(ARENA_L + 30, Math.min(ARENA_R - 30, f.x));
  updateDrops(ctx, f);
  sync(state, f);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The grab and the drain

const grab = (state: GameState, f: Fight, controls: Controls) => {
  to(f, 'drain'); f.dive = null;
  f.held = { t: 0, presses: 0, was: { ...controls } };
  f.y = GY - 4; f.vx = 0; f.vy = 0;
  faceHim(state, f);
  playSound('punch', 0.8); playSound('crunch', 0.6, 4); shakeScreen(state, 6, 3);
  if (Math.random() < 0.5) bark(f, L.DONNIE_DRAIN);
};
const KEYS: (keyof Controls)[] = ['jump', 'shoot', 'special', 'left', 'right', 'up', 'down', 'secondary', 'charge'];
const drain = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, h = f.held!;
  h.t++;
  // (mashing: every fresh press counts)
  for (const k of KEYS) if (controls[k] && !h.was[k]) h.presses++;
  h.was = { ...controls };
  // (held up in front of him, the fangs in his neck)
  p.pos.x = f.x + f.facing * 20 - p.width / 2; p.pos.y = GY - 6 - p.height; p.vel.x = 0; p.vel.y = 0;
  p.facing = (f.facing > 0 ? -1 : 1);
  if (h.t % DRAIN_EVERY === 0 && p.health > 0) {
    hurtPlayer(ctx, DRAIN_DMG, DRAIN, undefined, 0);
    f.hp = Math.min(HP, f.hp + DRAIN_HEAL);
    eat(f, FULL_GULP);
    playSound('suck', 0.6, 4);
    for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + f.facing * -4, y: p.pos.y + 14 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() }, life: 22, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 });
  }
  const dead = p.health <= 0 || state.deathTimer > 0;
  if (dead || h.presses >= ESCAPE_PRESSES || h.t >= DRAIN_MAX) {
    const escaped = !dead && h.presses >= ESCAPE_PRESSES;
    f.held = null;
    if (!dead) { p.vel.x = -f.facing * 6; p.vel.y = -6; p.invincibilityTimer = Math.max(p.invincibilityTimer, 62); }
    if (escaped) { bark(f, L.DONNIE_ESCAPED); f.vx = f.facing * -3; playSound('punch', 0.6, -2); }
    to(f, 'rise'); f.vy = -4;
    if (!dead) burp(f);
    return controls;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Gluttony: full, the burp, the guest he can't say no to

/** How full he is, in whole steps (a step from his first gulp); how much slower that makes him. */
const steps = (f: Fight) => Math.max(0, Math.min(FULL_MAX, Math.ceil(f.full - 0.15)));
const slow = (f: Fight) => 1 - FULL_SLOW * steps(f);
const aimT = (f: Fight) => AIM_T[phase(f)] + FULL_TELL * steps(f);
/** A gulp. */
const eat = (f: Fight, k: number) => { f.full = Math.min(FULL_MAX, f.full + k); f.fullAt = f.total; };
/** After a drink: the burp coming up. */
const burp = (f: Fight) => { if (f.mode !== 'dead') f.burpT = 1; };

/** Each frame: thinning back down a while after his last gulp; the burp, and his say after it. */
const gorge = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.mode !== 'drain' && f.mode !== 'suck' && f.total - f.fullAt > FULL_HOLD) f.full = Math.max(0, f.full - FULL_THIN);
  if (f.burpT <= 0) return;
  f.burpT++;
  if (f.burpT === BURP_AT) {
    const n = steps(f);
    playSound('burp', 0.8 + n * 0.1, -n * 1.5);
    shakeScreen(state, 2 + n, 2);
    // (up out of him in a cloud, red-tinged, a fleck or two of something in it)
    const mx = f.x + f.facing * 16, my = f.y - 74;
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: mx, y: my }, vel: { x: f.facing * (1 + Math.random() * 2.4), y: -0.6 - Math.random() * 1.2 }, life: 26 + Math.random() * 14, color: i % 4 === 0 ? 'rgba(185, 28, 28, 0.7)' : 'rgba(230, 200, 200, 0.45)', size: 4 + Math.random() * 4, grav: -0.02 });
  }
  if (f.burpT === BURP_SAY) barkFresh(f, L.DONNIE_GORGE);
  if (f.burpT >= BURP_T) f.burpT = 0;
};

/** What he's doing at Meathead that a guest near enough can pull him off. */
const TEMPTED: ReadonlySet<Mode> = new Set<Mode>(['aim', 'dive', 'spew', 'winded', 'rise', 'flinch', 'drain']);
/** A guest coming near while he's at Meathead: he may drop it (and him) and go for them. Each guest the once. */
const tempt = (state: GameState, f: Fight) => {
  if (!TEMPTED.has(f.mode) || f.admireT > 0) return;
  const g = f.guests.find(q => q.state === 'run' && !q.spared && !q.tempted && q.x > ARENA_L + 40 && q.x < ARENA_R - 40 && Math.abs(q.x - f.x) < TEMPT_R);
  if (!g) return;
  g.tempted = true;
  if (Math.random() >= TEMPT_CHANCE) return;
  // (off Meathead, if he'd got his fangs in him: dropped, and a beat to get clear)
  if (f.held) { const p = state.player; f.held = null; p.vel.x = -f.facing * 5; p.vel.y = -5; p.invincibilityTimer = Math.max(p.invincibilityTimer, 62); }
  f.dive = null; f.mark = null; f.prey = g;
  to(f, 'hunt'); playSound('whoosh', 0.8, -4);
  bark(f, L.DONNIE_TEMPTED);
};

// ---------------------------------------------------------------------------------------------------------------
// The guests (running through, screaming), and what's left of them

const guests = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.mode !== 'dead' && f.mode !== 'intro' && ++f.guestT >= GUEST_EVERY[phase(f)] && !f.guests.some(g => g.state === 'run' || g.state === 'held')) {
    f.guestT = 0;
    const dir = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;
    const g: Guest = { x: dir > 0 ? ARENA_L - 30 : ARENA_R + 30, dir, seed: 40 + Math.floor(Math.random() * 400), state: 'run', y: GY, vy: 0, t: 0, said: null, facing: dir };
    f.guests.push(g);
    playSound('screams', 0.4, 6);
    const text = pick(L.GUEST_SCREAM);
    if (quiet(f) && Math.random() < 0.5) say(text, voice(lookOf(g.seed).woman ? 'm2.guest' : 'm2.guest2'), 'casual', {
      always: true,
      onShow: spoken => { g.said = text; if (!spoken) setTimeout(() => { if (g.said === text) g.said = null; }, 1800); },
      onHide: () => { if (g.said === text) g.said = null; },
    });
  }
  for (const g of f.guests) {
    if (g.state === 'run') { g.x += g.dir * GUEST_SPEED; g.t++; }
    else if (g.state === 'held') { g.x = f.x + f.facing * 14; g.y = f.y - 14; g.facing = (f.facing > 0 ? -1 : 1); }
    else if (g.state === 'fall') { g.vy += 0.5; g.y = Math.min(GY, g.y + g.vy); if (g.y >= GY) { g.state = 'husk'; playSound('thud', 0.6, 6); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: g.x, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() }, life: 26, color: 'rgba(180, 160, 130, 0.6)', size: 4, grav: 0.05 }); } }
  }
  // (gone out the far door)
  f.guests = f.guests.filter(g => g.state !== 'run' || (g.x > ARENA_L - 60 && g.x < ARENA_R + 60));
};

// ---------------------------------------------------------------------------------------------------------------
// The blood (the spew): drops flying at him, a splat where they land

/** A guest caught in the spew: burst open, a shower of it, gone (their scream cut off). */
const hosed = (ctx: FrameContext, f: Fight, g: Guest, dir: number) => {
  const { state, fx } = ctx;
  f.guests = f.guests.filter(q => q !== g);
  if (g.said) { cutVoice('m2.guest'); g.said = null; }
  fx.spawnDeathShower({ x: g.x, y: GY - 40 }, dir, 2.5);
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: g.x, y: GY - 30 - Math.random() * 30 }, vel: { x: dir * Math.random() * 6 + (Math.random() - 0.5) * 3, y: -2 - Math.random() * 6 }, life: 50, color: ['#7F1D1D', '#B91C1C', '#F9A8D4', '#FDE68A'][i % 4], size: 3 + Math.random() * 4, grav: 0.35, chunk: i % 3 === 0 });
  f.splats.push({ x: g.x, w: 40, t: state.frame });
  fx.spawnDamageNumber({ x: g.x - 30, y: GY - 100 }, 'HOSED DOWN!', true, '#FCA5A5');
  playSound('splat', 1, -4); playSound('crunch', 0.6, 2); shakeScreen(state, 5, 3);
};

const updateDrops = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.drops = f.drops.filter(d => {
    d.x += d.vx; d.y += d.vy; d.vy += 0.08;
    if (d.y >= GY - 2) {
      // (a splash, and the pool growing where they land)
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: d.x, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2.5 }, life: 16, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 });
      const near = f.splats.find(sp => Math.abs(sp.x - d.x) < sp.w / 2 + 6);
      if (near) near.w = Math.min(90, near.w + 1.2);
      else if (f.splats.length < 90) f.splats.push({ x: d.x, w: 8 + Math.random() * 10, t: state.frame });
      if (state.frame % 4 === 0) playSound('splat', 0.18, 6);
      return false;
    }
    if (d.x < ARENA_L - 40 || d.x > ARENA_R + 40) return false;
    // (a guest running through the stream of it: hosed down, burst open where they stand; not the one he's after)
    const g = f.guests.find(q => q.state === 'run' && q !== f.prey && Math.abs(d.x - q.x) < 14 && d.y > GY - 70 && d.y < GY);
    if (g) { hosed(ctx, f, g, Math.sign(d.vx) || 1); return false; }
    const top = p.pos.y + (p.isDucking || p.isSliding ? 28 : 0);
    if (canHurtHim(state) && p.invincibilityTimer <= 0 && f.mode !== 'drain' && d.x > p.pos.x - DROP_HIT && d.x < p.pos.x + p.width + DROP_HIT && d.y > top - DROP_HIT && d.y < p.pos.y + p.height) {
      hurtPlayer(ctx, BLOOD_DMG, BLOOD, { x: Math.sign(d.vx) * 2, y: -2 }, 6);
      for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 20, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
      playSound('splat', 0.4, 4);
      return false;
    }
    return true;
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Hits

const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  const sv = f.souvenir; f.souvenir = null;
  // (a charge move landing on him: knocked back, and whatever he'd got hold of (a guest) let go)
  // (his poise: a charge move only knocks him off what he's doing every so often; off a guest, always)
  if (melee && dealt > 0 && f.mode !== 'dead' && f.mode !== 'drain' && f.mode !== 'stunned' && state.enemies.includes(e)) {
    if (f.prey || f.total - f.staggerAt >= POISE_T) stagger(state, f);
    // (a dive kick that doesn't knock him about: he slides out from under it, away across the room)
    else if (state.player.isDivekicking) dodge(state, f);
  }
  if (f.mode === 'dead' || dealt <= 0 || !state.enemies.includes(e)) return;
  // The Redeemer: down he goes, and it hurts (in his breather, it's not landed: it bounces about, it'll be back)
  // (once per go: it bounces about and hits him again, but it's the first one that puts him down; down already, it's
  // just another souvenir till he's back up)
  if (sv?.id === 'redeemer' && f.iframes <= 0 && ((f.mode !== 'stunned' && f.total >= f.redeemAt) || f.hp <= REDEEMER_DMG)) {
    f.redeemAt = f.total + REDEEMER_STUN + REDEEMER_GRACE;
    f.hp -= REDEEMER_DMG; f.flash = 16; f.iframes = IFRAMES;
    playSound('ding', 1, 6); playSound('crack', 0.8, -4); shakeScreen(state, 10, 5);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 4 }, life: 30, color: ['#FEF9C3', '#FDE047', '#ECFCCB', '#FFFFFF'][i % 4], size: 2 + Math.random() * 3, grav: 0.15 });
    if (f.hp <= 0) { f.hp = 0; die(ctx, f, true); return; }
    stun(state, f);
    if (!f.beatsDone.has('stun')) queueBeat(f, 'stun', L.SATAN_STUN, L.DONNIE_STUN, false);
    else bark(f, L.DONNIE_REDEEMER);
    return;
  }
  if (f.iframes > 0) return;
  // (the ray gun and his own moves in full; any other special weapon a land boss mostly shrugs off; the lesser souvenirs
  // least of all)
  let dmg = sv ? Math.max(1, dealt * SOUV_SHARE) : plainHit(state, melee) ?? Math.max(1, dealt * SHARE);
  // (a lesser souvenir never finishes him: a souvenir kill on him is the Redeemer's, always)
  if (sv && f.hp - dmg <= 0) dmg = Math.max(0, f.hp - 1);
  // (a souvenir that isn't the one: Meathead thinking out loud that something in the bag must work; the first time,
  // then every few, never too often; not once the Redeemer's found him)
  if (sv && sv.id !== 'redeemer' && f.redeemAt === 0 && (++f.wrongN === 1 || f.wrongN % 3 === 0) && f.total - f.hintAt > HINT_GAP) { f.hintAt = f.total; meatheadSays(state, pick(L.MEATHEAD_SOUVENIR_HINT), false); }
  f.hp -= dmg; f.iframes = sv ? SOUV_IFRAMES : IFRAMES; f.flash = 8;
  for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, 2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - 90 }, Math.max(1, Math.round(dmg)), false);
  if (f.hp > 0 && Math.random() < 0.12) bark(f, L.DONNIE_HURT);
};

/** The ray gun and his own moves: what they do to any boss, Meathead 1's way (a shot 25; the charge and slide 35; the
 *  uppercut and dive kick 50). Null: a special weapon. */
const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return p.isUppercutting || p.isDivekicking ? BOSS_UPPERCUT_DAMAGE : BOSS_CHARGE_DAMAGE;
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};

/** A charge move: knocked back off him, the guest dropped (they run for it), back up into the air. */
const stagger = (state: GameState, f: Fight) => {
  const dir = pmid(state).x < f.x ? 1 : -1;
  // (the guest he had, or was after, gets away; and he won't go after that one again)
  // (knocked off a drink he'd started: it still comes up)
  const drinking = f.mode === 'suck';
  if (f.prey) { f.prey.state = 'run'; f.prey.y = GY; f.prey.spared = true; f.prey = null; f.knockedLoose = true; bark(f, L.DONNIE_HURT); }
  f.staggerAt = f.total;
  if (drinking) burp(f);
  f.dive = null; f.mark = null;
  f.vx = dir * 7; f.vy = -4;
  to(f, 'rise');
  playSound('punch', 0.9, -2); shakeScreen(state, 5, 3);
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: dir * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#B91C1C' : '#18181B', size: 2 + Math.random() * 3, grav: 0.3 });
};

/** Stomped on with his poise up: out from under it, a quick slide away and up (he's not a trampoline). */
const dodge = (state: GameState, f: Fight) => {
  const dir = pmid(state).x < f.x ? 1 : -1;
  f.vx = dir * 8; f.vy = -5;
  if (f.mode === 'hover') f.t = 0;
  playSound('whoosh', 0.8, 4);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: f.x, y: f.y - 30 }, vel: { x: -dir * (1 + Math.random() * 2), y: (Math.random() - 0.5) * 2 }, life: 18, color: 'rgba(24, 24, 27, 0.7)', size: 4 + Math.random() * 3 });
};

/** The Redeemer got him: whatever he was at, dropped (Meathead let go, the guest let go: they run), and down. */
const stun = (state: GameState, f: Fight) => {
  if (f.held) { const p = state.player; p.vel.x = -f.facing * 5; p.vel.y = -5; f.held = null; }
  if (f.prey) { f.prey.state = 'run'; f.prey.y = GY; f.prey = null; }
  f.dive = null; f.vy = 0;
  to(f, 'stunned'); f.stunT = REDEEMER_STUN;
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (ctx: FrameContext, f: Fight, redeemer = false) => {
  const { state } = ctx, e = f.e;
  token++;
  to(f, 'dead');
  f.drops = []; f.dive = null; f.burpT = 0;
  if (f.held) { f.held = null; state.player.vel.y = -4; }
  if (f.prey) { f.prey.state = 'run'; f.prey.y = GY; f.prey = null; }
  state.enemies = state.enemies.filter(o => o !== e);
  // (the usual way: up off the floor to swell up first, so he always lands after it)
  f.death = { how: redeemer ? 'burn' : 'flat', t: 0, x: f.x, y: f.y, vy: 0, facing: f.facing, land: redeemer && f.y >= GY - 1 ? 1 : 0, bloat: steps(f) };
  state.damageNumbers = [];
  f.said = null;
  if (redeemer) {
    // (the kill cam: a white flash, the cut in close, slow motion; Meathead's out of it till it's over)
    f.cam = { t: 0, acc: 0, z: 1, out: false };
    state.player.inCutscene = true;
    // (Meathead out of the way: the kill's what's in the picture, not him in front of it)
    const p = state.player, pc = p.pos.x + p.width / 2, CLEAR = 170;
    if (Math.abs(pc - f.x) < CLEAR) {
      const side = pc < f.x ? (f.x - CLEAR > ARENA_L + 30 ? -1 : 1) : (f.x + CLEAR < ARENA_R - 30 ? 1 : -1);
      p.pos.x = f.x + side * CLEAR - p.width / 2; p.vel.x = 0;
      p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
    }
    playSound('ding', 1.2, 0); playSound('thunder', 0.8, 2); playSound('ignite', 1, -2);
    line(f, 'donnie', L.DONNIE_BURNS, () => { f.deathSaid = 1; });
  } else {
    playSound('hurt', 0.8, -4);
    line(f, 'donnie', L.DONNIE_DIES, () => { f.deathSaid = 1; });
  }
};

/** The deaths' beats. */
const dying = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, d = f.death!;
  d.t++;
  const t = d.t;
  if (d.how === 'flat' && t <= GORGE_T) {
    // (first, everything he's drunk catching up with him: up off the floor if he's low, swelling a step at a time past
    // full, the buttons popping off him, a burp to shake the room)
    if (d.y > GY - 70) d.y -= Math.min(2.5, d.y - (GY - 70));
    for (const [at, k] of [[16, 2], [40, 3], [64, 4]] as const) if (t === at) {
      d.bloat = Math.max(d.bloat, k);
      playSound('squish', 0.9, -k); playSound('crunch', 0.4, 6);
      shakeScreen(state, 2 + k, 3);
      // (buttons, off like shots)
      if (k >= 3) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: d.x + d.facing * 20, y: d.y - 50 + i * 6 }, vel: { x: d.facing * (3 + Math.random() * 4), y: -2 - Math.random() * 3 }, life: 40, color: '#F1EEE6', size: 2, grav: 0.35 });
    }
    if (t === 84) {
      playSound('burp', 1.3, -6); shakeScreen(state, 8, 5);
      for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: d.x + d.facing * 16, y: d.y - 74 }, vel: { x: d.facing * (1.5 + Math.random() * 3), y: -1 - Math.random() * 1.6 }, life: 34 + Math.random() * 16, color: i % 3 === 0 ? 'rgba(185, 28, 28, 0.7)' : 'rgba(230, 200, 200, 0.5)', size: 5 + Math.random() * 5, grav: -0.02 });
    }
  } else if (d.how === 'flat') {
    // (the powers out: the eyes go dark, down he drops, flailing; a belly flop (the gut bounces him); the trousers down;
    // the disco ball; and then he shits himself, going down like a balloon)
    if (d.y < GY) { d.vy += 0.5; d.y = Math.min(GY, d.y + d.vy); if (d.y >= GY) { playSound('thud', 1.2, -6); playSound('splat', 0.6, -4); playSound('squish', 1, -6); shakeScreen(state, 12, 6); d.land = t; } }
    if (d.land && t === d.land + 70) { playSound('whoosh', 0.6, 6); }
    if (d.land && t === d.land + 90) { playSound('bonk', 1, -2); playSound('glass', 0.5, 2); shakeScreen(state, 6, 3); }
    if (d.land && t === d.land + 150) { playSound('fart', 0.9, -3); playSound('poopsplat', 0.6, -2); }
    if (d.land && t === d.land + 190) playSound('fart', 0.6, 2);
  } else {
    // (alight: flailing, then down, then ash)
    if (d.y < GY) { d.vy += 0.3; d.y = Math.min(GY, d.y + d.vy); }
    // (the flames, the embers, the smoke: drawn, burn.ts)
    if (t === 100) playSound('crumble', 1, -4);
    if (f.cam && t > 170) f.cam.out = true;
  }
  // (Satan takes what's his, then Meathead has his say; then it's over)
  if (f.deathSaid === 1 && t > (d.how === 'flat' ? GORGE_T + 160 : 160)) { f.deathSaid = 2; f.circle = 0.001; line(f, 'satan', L.SATAN_CLAIM, () => { f.deathSaid = 3; meatheadSays(state, pick(d.how === 'burn' ? L.MEATHEAD_WON_WEAK : L.MEATHEAD_WON), true, tokened(() => { f.deathSaid = 4; })); }); }
  if (f.deathSaid >= 2 && f.deathSaid < 4) f.circle = Math.min(0.6, f.circle + 0.02);
  if (f.deathSaid >= 4) f.circle = Math.max(0, f.circle - 0.03);
  // (it never hangs)
  if (t > 1500) f.deathSaid = 4;
};

/** Done with: his death played out, everybody's had their say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && (f.death.how === 'burn' ? f.death.t > 260 : !!f.death.land && f.death.t > f.death.land + 270) && (!f.cam || f.cam.z <= 1);
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; f.drops = []; live = null; };
export const killedByWeakness = (f: Fight) => f.death?.how === 'burn';

/** The enemy, where he is (in the world while it's on; out of it for the intro and after). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = f.x - e.width / 2; e.pos.y = f.y - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  // (his breather, the engine's too: in it, shots and moves go by him as they do any boss's)
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false;
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (the weakness death): Artie's, near enough (clearing/fight.ts)

const CAM_Z = 2.2, SLOW = 0.25, SLOW_HOLD = 50, SLOW_RAMP = 110;
export const killCamTick = (f: Fight): boolean => {
  const cam = f.cam;
  if (!cam) return false;
  cam.t++;
  cam.z += ((cam.out ? 1 : CAM_Z) - cam.z) * (cam.out ? 0.05 : cam.t < 6 ? 0.35 : 0.08);
  if (cam.out && cam.z < 1.004) { cam.z = 1; }
  let rate = cam.t < SLOW_HOLD ? SLOW : Math.min(1, SLOW + ((1 - SLOW) * (cam.t - SLOW_HOLD)) / SLOW_RAMP);
  if (cam.out) rate = 1;
  cam.acc += rate;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};
export const killCamZoom = (state: GameState, f: Fight) => {
  const cam = f.cam, d = f.death;
  if (!cam || !d || cam.z <= 1) return null;
  const k = (cam.z - 1) / (CAM_Z - 1);
  const fx = d.x, fy = d.y - 50;
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};
export const drawKillCam = (c: Ctx, f: Fight) => {
  const cam = f.cam;
  if (!cam) return;
  const k = cam.out ? Math.max(0, (cam.z - 1) / (CAM_Z - 1)) : Math.min(1, cam.t / 20);
  const bar = Math.round(k * 44);
  if (bar > 0) { c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
  if (cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** How beaten up he looks. */
const beaten = (f: Fight) => Math.max(0, 1 - Math.max(0, f.hp) / HP);
/** (cowering in the intro, a drumstick still in his fist; full, swollen a step at a time) */
const LOOK = (f: Fight) => ({ wig: !f.wigOff, cape: true, fangs: !f.powered, powered: f.powered, bloat: steps(f), snack: f.mode === 'intro' && !f.powered ? 'drumstick' as const : null });

const poseOf = (f: Fight): DonniePose => {
  if (f.flash > 0 && f.mode !== 'drain' && f.mode !== 'stunned') return 'hurt';
  // (the burp coming up: both hands on his gut)
  if (f.burpT > 0 && f.burpT < BURP_T - 6 && (f.mode === 'hover' || f.mode === 'rise' || f.mode === 'flinch' || (f.mode === 'spew' && f.t <= SPEW_AIM))) return 'stuffed';
  switch (f.mode) {
    case 'intro':
      if (f.intro === 'plead' || f.intro === 'reply' || f.intro === 'open' || f.intro === 'bestow') return 'cower';
      if (f.intro === 'rise') return f.introT < 36 ? 'summon' : 'fly';
      if (f.intro === 'panic') return 'panic';
      return 'fly';
    case 'drain': case 'suck': return 'bite';
    case 'spew': return f.t > SPEW_AIM ? 'spew' : 'fly';
    case 'stunned': return 'stunned';
    case 'flinch': return 'panic';
    case 'aim': return 'summon';
    case 'hunt': case 'dive': return 'lunge';
    case 'winded': return f.t < 12 ? 'fly' : 'fumble';
    default: return 'fly';
  }
};

/** A beat waiting its turn (`key`: the once-only ones go the once; `again`: a nag, any time it's due). */
const queueBeat = (f: Fight, key: string, s: L.ByPants, d: L.ByPants, flinch: boolean, again = false) => {
  if (f.beat || (!again && f.beatsDone.has(key))) return;
  f.beatsDone.add(key);
  f.beat = { s, d, flinch };
};
/** Its turn: nobody talking, Donnie not got hold of him (the mash prompt's his alone). Satan, then Donnie back. */
const runBeat = (f: Fight) => {
  // (a breather between them: the fight's not a talk show)
  if (!f.beat || f.beatOn || !quiet(f) || f.mode === 'drain' || f.mode === 'intro' || f.total - f.beatEnd < BEAT_GAP) return;
  const b = f.beat; f.beat = null; f.beatOn = true;
  line(f, 'satan', b.s, () => {
    if (b.flinch && (f.mode === 'hover' || f.mode === 'aim' || f.mode === 'rise')) { to(f, 'flinch'); f.mark = null; playSound('screams', 0.3, 14); }
    line(f, 'donnie', b.d, () => { f.beatOn = false; f.beatEnd = f.total; });
  });
};

/** The circle in the floor: a ring of fire, the light up out of it (stepped columns), him in the light (horns, eyes).
 *  World space. */
/** Satan's painting from hell, darkened and reddened (a shadow of him in the light up out of the floor), once. */
const SATAN_SCALE = 0.58;
let shade: HTMLCanvasElement | null = null;
const satanShade = () => {
  if (shade) return shade;
  shade = document.createElement('canvas'); shade.width = 880; shade.height = 740;
  const g = shade.getContext('2d')!;
  g.translate(440, 90); paintSatan(g); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(40, 0, 0, 0.55)'; g.fillRect(0, 0, 880, 740);
  // (fading out down to nothing where he comes up out of the floor)
  g.globalCompositeOperation = 'destination-out';
  const fade = g.createLinearGradient(0, 380, 0, 740); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = fade; g.fillRect(0, 380, 880, 360);
  return shade;
};
const drawCircle = (c: Ctx, k: number, fr: number) => {
  if (k <= 0) return;
  const x = CIRCLE_X, rx = 110 * k, ry = 16 * k, cy = GY - 4;
  // (the light up out of it: stepped columns, a dither down each edge)
  for (let i = 3; i >= 1; i--) {
    const w = Math.round(rx * 2 * (0.4 + i * 0.2)), l = Math.round(x - w / 2), a = 0.07 * (4 - i) * k;
    c.fillStyle = `rgba(220, 38, 38, ${a.toFixed(3)})`; c.fillRect(l + 2, GY - 420, w - 4, 420);
    checker(c, l, GY - 420, 2, 420, `rgba(220, 38, 38, ${a.toFixed(3)})`); checker(c, l + w - 2, GY - 420, 2, 420, `rgba(220, 38, 38, ${a.toFixed(3)})`, 1);
  }
  // (him, in it: Satan as he is down in hell (his own painting), enormous and faint in the light, darkened to a shadow of
  // himself, the eyes burning through)
  if (k > 0.5) {
    const a = (k - 0.5) * 2 * (0.7 + 0.3 * Math.sin(fr * 0.05));
    const img = satanShade(), S = SATAN_SCALE, top = GY - 440 + Math.sin(fr * 0.03) * 4;
    c.save();
    c.beginPath(); c.rect(x - 300, GY - 460, 600, 450); c.clip();
    c.globalAlpha = Math.min(1, a * 0.85);
    c.drawImage(img, Math.round(x - 440 * S), Math.round(top - 90 * S), Math.round(880 * S), Math.round(740 * S));
    c.globalAlpha = Math.min(1, a);
    c.translate(x, top); c.scale(S, S); drawSatanFace(c, fr, false);
    c.restore();
  }
  // (the ring: the hole, in steps down to the fire in it; flames round its edge, inked)
  const ring = (kx: number, ky: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, cy, rx * kx, ry * ky, 0, 0, Math.PI * 2); c.fill(); };
  ring(1.04, 1.12, INK); ring(1, 1, '#0A0000'); ring(0.8, 0.7, '#450A0A'); ring(0.62, 0.52, '#7F1D1D'); ring(0.45, 0.38, '#DC2626'); ring(0.25, 0.2, '#F97316');
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, fx = Math.round(x + Math.cos(a) * rx), fy = Math.round(cy + Math.sin(a) * ry), h = Math.round((12 + 9 * Math.sin(fr * 0.4 + i * 1.7)) * k);
    if (h < 3) continue;
    box(c, fx - 4, fy - h - 1, 8, h + 2, INK);
    box(c, fx - 3, fy - h, 6, h, i % 2 ? '#DC2626' : '#F97316');
    box(c, fx - 1, fy - Math.round(h * 0.7), 3, Math.round(h * 0.7), '#FDE047');
  }
};

/** World space, behind him: the circle, the blood on the floor, the husks, the wig once it's off. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  // (the pools of it: dark round the edge, a wet highlight, spreading as more lands)
  for (const sp of f.splats) {
    pixelBlob(c, sp.x, GY, sp.w / 2 + 2, 4, '#2A0505');
    pixelBlob(c, sp.x, GY, sp.w / 2, 3, '#6B0F0F');
    box(c, sp.x - sp.w * 0.25, GY - 2, Math.max(2, sp.w * 0.3), 2, '#991B1B');
    box(c, sp.x - sp.w * 0.2, GY - 2, Math.max(2, sp.w * 0.12), 1, '#EF4444');
  }
  drawCircle(c, f.circle, state.frame);
  for (const g of f.guests) if (g.state === 'husk') drawHusk(c, g.x, GY, g.facing, 0.85, 1);
  if (f.wigOff) drawLooseWig(c, f.wigOff.x, f.wigOff.y, state.frame, 1, 0.5);
};

/** World space, over everything: him, the guests running, the blood in the air, the words. */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // The guests (running, screaming; held up and going gray)
  for (const g of f.guests) {
    if (g.state === 'husk') continue;
    c.save(); c.translate(Math.round(g.x), Math.round(g.y)); c.scale(g.state === 'run' ? g.dir : g.facing, 1);
    if (g.state === 'held') {
      const k = Math.min(1, g.t / SUCK_T);
      c.rotate(-0.3); c.scale(1 - 0.45 * k, 1 - 0.1 * k);
      drawPerson(c, { seed: g.seed, outfit: 'guest', f: fr, pose: 'fly', mood: 'shocked' });
      // (the gray coming over them, in steps: dithered, then solid)
      if (k > 0.15) checker(c, -16, -82, 32, 82, 'rgba(120, 104, 80, 0.85)');
      if (k > 0.55) checker(c, -16, -82, 32, 82, 'rgba(120, 104, 80, 0.85)', 1);
    } else if (g.state === 'fall') { c.rotate(1.2); drawHusk(c, 0, 0, 1, 0.85, 1.4); }
    else drawPerson(c, { seed: g.seed, outfit: 'guest', f: fr * 2, pose: 'walk', mood: 'scared' });
    c.restore();
    if (g.said && g.state === 'run') saidOver(c, g.said, g.x, GY - 90, '#E5E7EB', 160);
  }
  // Him
  if (f.mode === 'dead' && f.death) drawDeath(c, f, fr);
  else {
    const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0 && f.mode !== 'intro';
    if (blink) c.globalAlpha = 0.6;
    const pose = poseOf(f);
    // (on the swoop: tipped over into it)
    const tilt = f.mode === 'dive' || f.mode === 'hunt' ? Math.max(-0.7, Math.min(0.7, Math.atan2(f.vy, Math.abs(f.vx) + 0.01) * 0.6)) : 0;
    c.save(); c.translate(f.x, f.y - 45); c.rotate(tilt * f.facing); c.translate(-f.x, -(f.y - 45));
    drawDonnie(c, f.x, f.y, f.facing, fr, pose, beaten(f), LOOK(f));
    c.restore();
    if (blink) c.globalAlpha = 1;
    // (the stream out of his mouth)
    if (f.mode === 'spew' && f.t > SPEW_AIM && (f.t - SPEW_AIM) % (BURST_ON + BURST_OFF) < BURST_ON) { const mx = f.x + f.facing * 14, my = f.y - 74; for (let i = 0; i < 5; i++) { box(c, mx + f.facing * i * 5 - 4, my - 3 + Math.sin(fr + i) * 2, 9, 7, '#1A0B06'); box(c, mx + f.facing * i * 5 - 3, my - 2 + Math.sin(fr + i) * 2, 7, 5, i % 2 ? '#B91C1C' : '#DC2626'); } }
    // (stunned: the little statue's halo of stars over him)
    if (f.mode === 'stunned') for (let i = 0; i < 4; i++) { const a = fr * 0.12 + i * 1.57; box(c, f.x + Math.cos(a) * 22 - 2, f.y - 80 + Math.sin(a) * 5 - 2, 4, 4, i % 2 ? '#FDE047' : '#ECFCCB'); }
  }
  // The grab's tell: where he'll come down on (following Meathead's feet, then locked: a ring on the floor closing in)
  if (f.mode === 'aim' && f.mark) {
    const k = Math.min(1, f.t / aimT(f)), r = 34 - k * 16, lk = f.mark.locked;
    const col = lk ? (Math.floor(fr / 3) % 2 ? '#FDE047' : '#EF4444') : '#EF4444';
    c.strokeStyle = '#1A0B06'; c.lineWidth = 4; c.beginPath(); c.ellipse(f.mark.x, f.mark.y, r, r * 0.25, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = col; c.lineWidth = 2; c.stroke();
    for (const s2 of [-1, 1]) box(c, f.mark.x + s2 * (r + 4) - 3, f.mark.y - 2, 6, 4, col);
  }
  // The spew's tell: the line from his mouth to where it's aimed, before it comes (and dotted between the bursts)
  if (f.mode === 'spew') {
    const firing = f.t > SPEW_AIM && (f.t - SPEW_AIM) % (BURST_ON + BURST_OFF) < BURST_ON;
    if (!firing) {
      const mx = f.x + f.facing * 14, my = f.y - 74, n = 14;
      for (let i = 1; i < n; i++) { if ((i + Math.floor(fr / 3)) % 2) continue; const k = i / n, dx = mx + (f.aimX - mx) * k, dy = my + (f.aimY - my) * k; box(c, dx - 4, dy - 4, 8, 8, '#1A0B06'); box(c, dx - 3, dy - 3, 6, 6, '#EF4444'); }
    }
  }
  // Held: the button to mash, over him (pulsing), and how near he is to getting loose
  if (f.mode === 'drain' && f.held) {
    const p = state.player, x = p.pos.x + p.width / 2, y = GY + 22, pulse = Math.floor(fr / 5) % 2;
    if (inputDevice() === 'pad') drawPadFace(c, x, y, pulse ? 11 : 9, 'A', padFamily());
    else {
      c.font = '7px "Press Start 2P"'; const w = 44;
      box(c, x - w / 2 - 1, y - 9 - (pulse ? 1 : 0), w + 2, 18, '#1A0B06'); box(c, x - w / 2, y - 8 - (pulse ? 1 : 0), w, 16, '#E4E4E7');
      label(c, 'SPACE', x, y + 3 - (pulse ? 1 : 0), '#18181B', 7);
    }
    const k = Math.min(1, f.held.presses / ESCAPE_PRESSES);
    box(c, x + 30, y - 3, 48, 6, '#1A0B06'); box(c, x + 31, y - 2, 46 * k, 4, '#FDE047');
  }
  // The blood in the air
  for (const d of f.drops) {
    // (each a blob, stretched along its way, a lit fleck on it)
    const a = Math.atan2(d.vy, d.vx);
    c.save(); c.translate(d.x, d.y); c.rotate(a);
    c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(0, 0, d.r * 1.6 + 1, d.r + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#991B1B'; c.beginPath(); c.ellipse(0, 0, d.r * 1.6, d.r, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#EF4444'; c.beginPath(); c.ellipse(d.r * 0.4, -d.r * 0.3, d.r * 0.6, d.r * 0.35, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  // His words; Satan's (up over the room, out of nowhere, red)
  if (f.said) saidOver(c, f.said, f.mode === 'dead' && f.death ? f.death.x : f.x, (f.mode === 'dead' && f.death ? f.death.y : f.y) - DONNIE_H - 16, '#FDE68A');
  if (f.satanSaid) saidOver(c, f.satanSaid, CIRCLE_X, GY - 330, '#F87171', 300);
};

/** His two deaths, drawn. */
const drawDeath = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death!, t = d.t;
  if (d.how === 'flat') {
    // (swelling up in the air, both hands on it, shaking with it; the powers still on him till he drops)
    if (t <= GORGE_T) { const j = d.bloat >= 3 ? Math.sin(fr * 1.7) * (d.bloat - 2) : 0; drawDonnie(c, d.x + j, d.y, d.facing, fr, 'stuffed', 1, { cape: true, wig: !f.wigOff, powered: true, bloat: d.bloat }); return; }
    if (d.y < GY) { drawDonnie(c, d.x, d.y, d.facing, fr, 'hurt', 1, { cape: true, wig: !f.wigOff, bloat: d.bloat }); return; }
    // Face down, rear up, trousers round his ankles, the bat boxers; the disco ball down on him and off again; then
    // the shit spreading across the seat of them, and him going down like a balloon with it, a step at a time
    const lt = d.land ? t - d.land : 0;
    const bounce = lt < 16 ? Math.sin((lt / 16) * Math.PI) * 0.16 : 0;
    const bloat = lt < 150 ? d.bloat : Math.max(1, d.bloat - Math.floor((lt - 150) / 25));
    // (propped up off the floor on his gut, the fuller the higher)
    c.save(); c.translate(d.x, GY - 22 - bloat * 4); c.rotate(d.facing * (Math.PI / 2 + 0.25 - bounce));
    drawDonnie(c, 0, 22, d.facing, fr, 'dead', 1, { cape: true, wig: !f.wigOff, pantsDown: lt > 20, bloat, soiled: Math.max(0, Math.min(1, (lt - 150) / 40)) });
    c.restore();
    // (the disco ball: down on its snapped wire, onto his rear, a bonk, off and rolling)
    if (lt > 60) {
      const k = Math.min(1, (lt - 60) / 30), rx = d.x - d.facing * 26;
      const by = lt < 90 ? 60 + (GY - 60 - 40) * k * k : GY - 40 - Math.max(0, Math.sin(((lt - 90) / 20) * Math.PI)) * 30 * (lt < 110 ? 1 : 0) + (lt >= 110 ? 26 : 0);
      const roll = Math.sign(ARENA_MID - rx) || 1, bx = lt < 110 ? rx : rx + roll * Math.min(140, (lt - 110) * 2);
      const by2 = lt >= 110 ? GY - 14 : by;
      // (rolling: turned by how far it's gone, the way a ball turns)
      discoBall(c, bx, by2, 14, fr, (bx - rx) / 14);
    }
    // (the last one out of him)
    if (lt > 150 && lt < 260) { const s = (lt - 150) / 110; c.fillStyle = `rgba(163, 190, 60, ${(0.5 * (1 - s)).toFixed(2)})`; c.beginPath(); c.arc(d.x - d.facing * 30, GY - 40 - s * 30, 6 + s * 20, 0, Math.PI * 2); c.fill(); }
    return;
  }
  // Burning up: alight and flailing; down; to a pile of ash, the wig on top, the little statue standing in it (burn.ts)
  drawBurn(c, d, !f.wigOff, fr);
};

/** The fire's light (the weakness death), for the room's lighting. */
export const deathLights = (f: Fight, fr: number) => (f.mode === 'dead' && f.death?.how === 'burn' ? burnLights(f.death, fr) : []);

/** Screen space: his bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead' || f.mode === 'intro') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FCA5A5' : '#DC2626');
  label(c, 'DONNIE DRACULA', band.mid, 50, '#FCA5A5', 7);
};
/** His gross-up's length in the intro (frames): the first go only (a retry has no intro). */
const GROSS_T = 110;
/** Screen space, under the letterbox: the intro's gross-up of him, changed. */
export const drawIntroCloseup = (c: Ctx, f: Fight, fr: number) => {
  if (f.mode !== 'intro' || f.intro !== 'gross') return;
  drawDonnieGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawDonnieGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24, 0.9 + 0.1 * Math.min(1, f.introT / 10), fr, f.introT < 20 ? 3 : 0.6);
};
/** The intro's skippable (for the stage's skip prompt). */
export const introOn = (f: Fight) => f.mode === 'intro';
export const introSkipT = (f: Fight) => f.skipT;
