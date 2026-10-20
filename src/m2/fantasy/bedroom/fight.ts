// PIPER THE PIXIE, the fight (the user's design; first pass). Every number that matters is up top, to tune.
//
//   THE INTRO   (a cutscene: no input, no HUD, SKIP >> for the lot) He walks up to her door and KICKS IT IN (both
//               leaves off their hinges, flat on her carpet); his line. Her, lounging on her chaise, still purring (the
//               last man standing). The dust clears: her face, close up. Him seeing her (naked: the boner that's been
//               up since the glass goes down, slowly, in three sad sags and a little sad boing). He tells her how fat
//               she is, and how ugly. She's ENRAGED (her lust was for men killing each other over her; now one's at her
//               door insulting her): up off the chaise, the close-up gone red; her line, his; on. Roses grow across the
//               doorway behind him: nobody leaves.
//   HER         Waddles at him (her belly bumps him away: a little hurt). Then the SLAM: a crouch, her too-small wings
//               buzzing uselessly, a shout; up to the ceiling; she hangs there over him (a shadow on the floor growing
//               under her, tracking him), locks on (the shadow goes red), and CRASHES down. Under her: a big hit.
//               THE EARTHQUAKE: the screen shakes and if he's stood on anything (the floor, the furniture) he's
//               knocked off his feet a moment (no hurt; a hop, stars); in the air, he's fine (jump as she lands).
//               DEBRIS: bits of her ceiling come down at spots round the room (dust trickles and a shadow first; one
//               of them at him), more as the room goes. Each slam wrecks the room a stage more (room.ts), up to six.
//   THE MAINS   Her slams tear the theme park's plumbing loose, in the user's order: the 2nd a HEAT PIPE (venting fire
//               down to the floor), the 4th a LIQUID NITROGEN main (the park's ice effects: squirting along the floor;
//               hit, he's FROZEN in a block of ice: MASH A to break out (only A: the user's), the prompt with the real button),
//               the 6th the water main and the FX POWER: LIVE WIRES IN A FLOODED PATCH (electrified). Three unsafe
//               areas at most (these three), each on its own clock, every time telegraphed (steam and an orange glow;
//               frost and a sputter; sparks over the water) before it goes. The 5th slam brings a chandelier down (it
//               swings, its chain spits sparks, its shadow, then it falls). NONE OF IT HURTS HER (the user's).
//   THROWS      Near a loose part, she rips a bit of it off and shouts its name: "FIRE BALL!" (lobbed, it burns where
//               it lands a while), "ICE BALL!" (straight at him: frozen, mash), "LIGHTNING BOLT!" (the cable's end
//               aimed: a flickering line first, then the bolt down it).
//   HURTING HER The ray gun and his moves in full; any other weapon 35% (every land boss's way); the 60-frame
//               breather. Her WEAKNESS is the FLINTLOCK (no headshot, the user's opt-in: holes): a ball in her blows a
//               HOLE in her, fat and gore jetting out, and she goes round the room like a let-go balloon (ricocheting
//               off the walls and the ceiling; touching her hurts; she can't be shot while she's at it), leaking all
//               over the carpet (looks only: it's no slicker), thinner each time. The fourth hole's the end of her.
//               He thinks out loud about the flintlock (only if he's got it).
//
// Two deaths (both a cutscene: no input, SKIP >> for the lot).
//   THE CORK (the usual): one last belly flop through the wrecked floor; she's wedged in it to the waist (her legs
//     kicking in the room below, the wings buzzing); the broken mains' pressure builds under her (rumbling, steam
//     out of the cracks, her going purple), and she pops out like a CHAMPAGNE CORK straight up through her ceiling
//     and the roof (the mains gushing up after her), a scream going up and away, shitting herself on the way (it
//     comes back down through the hole). A beat; a distant thud; a puff of fairy dust down through the hole.
//   THE DEFLATED BALLOON (the weakness, the kill cam): she goes round the room one last time, the raspberry of a
//     balloon let go, lands on her feet and goes down: thinner and thinner till she's a SUPERMODEL (she loves it;
//     him too: naked, it's back up, hopeful), then on down, dangerously thin, skin and bone, and she CRUMBLES (a heap
//     of gown, a tiara on top, dust).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { piperLine, piperMust } from '../piperLines';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerDeathKind, type MeatheadDeathKind } from '../../../m1/game/player/deathAnim';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE, BOSS_CHARGE_DAMAGE, BOSS_UPPERCUT_DAMAGE } from '../../../m1/constants';
import { setErect } from '../../../m1/game/render/player/body';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { setUi } from '../../store';
import { box, label, saidOver, voice, meatheadSays, landVisit } from '../section';
import { hash } from '../kit';
import type { ByPants } from '../talk';
import { drawPiper, drawPiperCloseup, piperBodyW, PIPER_H, type PiperPose, type PiperFace } from '../piper';
import { GY, DOOR_X, KICK_AT, ARENA_L, ARENA_R, ARENA_W, ARENA_MID, CEIL_Y, CAM_Y, LEDGES, CHANDELIERS, CHAISE_X, MAX_STAGE, CP_FIGHT, R } from './layout';
import { drawCavity, drawChandelier, CHANDELIER_Y } from './room';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Pants = 'clean' | 'shitty' | 'nude';
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** Her health (the land bosses'), and the enemy's (never runs out: the hits come off ours). */
const HP = 666, BIG = 100000;
/** Anything but the ray gun and his moves: this share; the breather after a hit. */
const SHARE = 0.35, IFRAMES = ENEMY_HIT_COOLDOWN;
/** The flintlock: a hole's damage (the ball's own boss hit, as the number that comes up says), holes to kill her. */
const HOLE_DMG = 150, HOLES_TO_DIE = 4;
/** Her box (the enemy's), feet to the top of her beehive. */
const EW = 100, EH = 168;
/** By phase (her health's thirds): her waddle (px a frame), how long she waddles between slams, sat after one. */
const WALK_V = [0, 1.3, 1.6, 1.95], WALK_T: [number, number][] = [[0, 0], [150, 210], [110, 170], [80, 130]], SIT_T = [0, 60, 50, 40];
/** The slam: the crouch (the tell), the rise, the hang tracking him (how fast), the lock (the shadow red), the fall's
 *  pull; where her feet get to up there. */
const CROUCH_T = 46, RISE_T = 30, HANG_T = 36, TRACK_V = 7, LOCK_T = 14, FALL_G = 2.2, APEX = CEIL_Y + 200;
/** What hurts him: her landing on him, her belly, her bouncing, a bit of ceiling, the chandelier. */
const SLAM_DMG = 22, BODY_DMG = 10, BOUNCE_DMG = 14, DEBRIS_DMG = 11, CHANDELIER_DMG = 24;
/** The quake: knocked off his feet this long (no hurt). */
const STUN_T = 26;
/** Debris: the warning (dust, the shadow), how many (2 + the stage, at most). */
const DEBRIS_WARN = 80, DEBRIS_MAX = 6;
/** The mains' clocks: quiet, the tell, on (frames). */
// (more deadly, the user's: on longer, off shorter, wider, harder)
const HAZ = { heat: [95, 55, 150], nitro: [90, 55, 140], wires: [85, 45, 140] } as const;
const HEAT_DMG = 24, NITRO_DMG = 14, SHOCK_DMG = 26;
/** After thawing, frames the nitrogen can't freeze him again (it's on for good: time to get clear of it). */
const NITRO_REFREEZE = 70;
/** The heat pipe's flame (half-width), the fire on the floor under it; the nitrogen's jet (length, height); the
 *  flooded patch (half-width). */
const HEAT_HW = 44, HEAT_FLOOR = 90, NITRO_LEN = 280, NITRO_H = 70, PUDDLE_HW = 150;
/** Her throws: how often at most, how near a loose part she has to be; their damage. */
const THROW_GAP = 360, THROW_NEAR = 170, RIP_T = 36, THROW_T = 18, FIREBALL_DMG = 12, ICEBALL_DMG = 6, BOLT_DMG = 14;
/** Frozen: a press's worth of the meter, its drain a frame, out on his own at the most. */
const MASH_STEP = 0.11, MASH_DRAIN = 0.0035, ICE_MAX = 260;
/** The bounce: how long (and longer each hole), how fast. */
const BOUNCE_T = 150, BOUNCE_EACH = 30, BOUNCE_V = 10;
/** Taunts; the hint's gap. */
const TAUNT_EVERY = 700, HINT_GAP = 600;
/** A retry's entrance beat (frames): her waiting, no slams. */
const ENTRANCE_T = 100;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Act = 'hop' | 'walk' | 'crouch' | 'rise' | 'hang' | 'lock' | 'fall' | 'sit' | 'rip' | 'throw' | 'bounce' | 'flop' | 'getup' | 'entrance';
type Element = 'fire' | 'ice' | 'shock';
type HazardKind = 'heat' | 'nitro' | 'wires';
interface Hazard { kind: HazardKind; x: number; t: number; dir: 1 | -1; hit: boolean }
interface Debris { x: number; y: number; land: number; vy: number; t: number; size: number; seed: number; hit: boolean }
interface Shot { kind: Element; x: number; y: number; vx: number; vy: number; t: number; tx: number; ty: number; hit: boolean }
interface Patch { x: number; t: number }
interface Splat { x: number; w: number; col: string; dy: number }
interface Hole { x: number; y: number }
interface Chand { i: number; x: number; y: number; t: number; vy: number; falling: boolean; hit: boolean }
interface Ice { t: number; fill: number; prev: boolean }
interface KillCam { t: number; acc: number; z: number; out: boolean }
type IntroStep = 'approach' | 'kick' | 'kickline' | 'pan' | 'reveal' | 'closeup' | 'sees' | 'fat' | 'ugly' | 'rage' | 'fight' | 'on';
interface Death {
  how: 'cork' | 'balloon'; t: number; step: string; at: number;
  x: number; y: number; vy: number;
  /** (the cork) the brown trail she leaves going up; the turd coming back down; the geyser; the fairy dust. */
  trail: { x: number; y: number }[]; turd: { y: number; vy: number; down: boolean } | null; gush: number; dust: number;
  said: Set<string>;
}

export interface Fight {
  mode: 'intro' | 'on' | 'dead'; total: number;
  hp: number; iframes: number; flash: number;
  /** Her: feet (x, y), which way she faces, what she's at and for how long (and how long it'll go), her spin. */
  x: number; y: number; vy: number; facing: 1 | -1; act: Act; actT: number; actLen: number; rot: number; ang: number;
  slams: number; stage: number; slamHit: boolean;
  hazards: Hazard[]; debris: Debris[]; rubble: { x: number; y: number; w: number; seed: number }[];
  shots: Shot[]; patches: Patch[]; splats: Splat[]; holes: Hole[]; thin: number;
  chand: Chand | null; chandDown: number | null;
  /** The hole she went out through (the cork), x. */
  roofHole: number | null;
  /** Him: knocked off his feet (frames left), frozen. */
  stun: number; ice: Ice | null;
  /** Just thawed: frames his specials (the charge, the dash) stay off, so the press that broke the ice can't fire one. */
  thawT: number; thawedAt: number;
  throwAt: number; rip: Element | null;
  /** A hop over to a loose part to throw from it (from, to: x); the camera pulled out for a throw from far off (its scale, eased). */
  hopFrom: number; hopTo: number; zo: number;
  e: Enemy; moveSeen: number | undefined;
  said: string | null; tauntT: number; tauntHer: boolean; hintAt: number; wrongN: number; lowSaid: boolean;
  intro: IntroStep; introT: number; skipT: number; camX: number; doorT: number | null;
  closeup: { face: PiperFace; t: number } | null;
  /** Naked: how hard he is (the hall: up; the reveal: going down; the supermodel: hopeful). */
  erect: number;
  death: Death | null; deathSaid: number; cam: KillCam | null;
  entrance: number;
}

/** Seen the intro this visit (a retry from a checkpoint skips it: the door's already down). */
let introVisit = -1;
export const introSeen = () => introVisit === landVisit();
let game: GameState | null = null;
const pants = (): Pants => (!game ? 'clean' : isNude(game) ? 'nude' : isShat(game) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// Her, the enemy (the engine's: for the hits; drawn here). Her hurts on him, their lines and deaths.

const PIPER_KIND = 'm2:piper' as const;
registerM2Kind({
  kind: PIPER_KIND,
  stats: { w: EW, h: EH, hp: BIG, contact: 0, mass: 600, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'f', humanoid: true, grab: 'none', midBoss: true,
  head: { x: 8, y: -150, r: 18 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[PIPER_KIND] = L.GRAB_PIPER;
for (const [source, l] of Object.entries(L.HURT)) registerHurtLines(source, l.hurt, l.death);
for (const [source, kind] of Object.entries(L.DEATH_KIND)) registerDeathKind(source, kind as MeatheadDeathKind);

// ---------------------------------------------------------------------------------------------------------------
// Saying things (one at a time; words only while said)

let token = 0;
const tokened = (fn: () => void) => { const tok = token; return () => { if (tok === token) fn(); }; };
const quiet = (f: Fight, state: GameState) => !f.said && state.playerVulgarityTimer <= 0;
/** She says this (waits its turn). */
const herSays = (f: Fight, text: string, onDone?: () => void) => {
  const tok = token;
  say(text, voice(L.PIPER_VOICE), 'queue', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; if (tok === token) onDone?.(); }, Math.max(1800, text.length * 70)); },
    onHide: () => { if (f.said === text) f.said = null; if (tok === token) onDone?.(); },
    onDropped: () => { if (tok === token) onDone?.(); },
  });
};
/** A scripted line of hers (a beat waits on it): one she hasn't said this life (piperLines.ts), else pickLine. */
const herLine = (f: Fight, lines: ByPants, onDone?: () => void) => herSays(f, piperMust(lines[pants()]), onDone);
/** A now-and-then line of hers: nothing if she's said them all this life (and whatever waited on it goes straight on). */
const herMaybe = (f: Fight, lines: ByPants, onDone?: () => void) => { const t = piperLine(lines[pants()]); if (t) herSays(f, t, onDone); else onDone?.(); };
/** A bark of hers: dropped if anybody's talking, or if she's said every one of them this life. */
const bark = (f: Fight, state: GameState, pool: readonly string[]) => {
  if (!quiet(f, state)) return;
  const text = piperLine(pool);
  if (!text) return;
  say(text, voice(L.PIPER_VOICE), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1400, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
const hisLine = (state: GameState, lines: ByPants, onDone?: () => void) => meatheadSays(state, pick(lines[pants()]), true, onDone);

// ---------------------------------------------------------------------------------------------------------------
// Starting

const clampCam = (x: number, inHall = false) => Math.max(inHall ? DOOR_X - 900 : ARENA_L, Math.min(ARENA_R - CANVAS_WIDTH, x));
const camFor = (x: number, inHall = false) => clampCam(x - CANVAS_WIDTH / 2, inHall);
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });

const fresh = (state: GameState, e: Enemy): Fight => ({
  mode: 'intro', total: 0, hp: HP, iframes: 0, flash: 0,
  x: CHAISE_X, y: GY, vy: 0, facing: -1, act: 'walk', actT: 0, actLen: 160, rot: 0, ang: 0,
  slams: 0, stage: 0, slamHit: false,
  hazards: [], debris: [], rubble: [], shots: [], patches: [], splats: [], holes: [], thin: 0,
  chand: null, chandDown: null, roofHole: null, stun: 0, ice: null, thawT: 0, thawedAt: -9999, throwAt: -9999, rip: null, hopFrom: 0, hopTo: 0, zo: 1,
  e, moveSeen: e.hitByMove, said: null, tauntT: 0, tauntHer: true, hintAt: -9999, wrongN: 0, lowSaid: false,
  intro: 'approach', introT: 0, skipT: 0, camX: state.camera.x, doorT: null, closeup: null,
  erect: 1, death: null, deathSaid: 0, cam: null, entrance: 0,
});

/** Up to her door the first time (the intro), or back in (a retry: the door's down, straight to it). */
export const startFight = (state: GameState, retry: boolean): Fight => {
  game = state; token++;
  const e = makeKindEnemy(PIPER_KIND as EnemyKind, CHAISE_X, GY);
  e.facing = -1; e.seen = true;
  const f = fresh(state, e);
  if (retry) {
    f.doorT = 999; f.erect = 0;
    f.x = ARENA_MID; f.facing = -1;
    beginFight(state, f);
    f.entrance = ENTRANCE_T; f.act = 'entrance';
    herLine(f, L.PIPER_AGAIN, tokened(() => hisLine(state, L.MH_AGAIN)));
    return f;
  }
  state.player.inCutscene = true;
  return f;
};

/** On: out of the cutscene, her in the world, the doorway shut behind him. */
/** How far off her he is at the least as it starts. */
const START_GAP = 460;
const beginFight = (state: GameState, f: Fight) => {
  token++; introVisit = landVisit();
  f.said = null; f.closeup = null;
  state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.isDucking = false; p.kickPose = 0;
  f.mode = 'on'; f.act = 'walk'; f.actT = 0; f.actLen = walkLen(f); f.doorT = 999;
  // (never starting on top of him (the user's): a good way off, on whichever side has the room)
  { const me = pmid(state).x;
    if (Math.abs(f.x - me) < START_GAP) f.x = me + START_GAP <= ARENA_R - 80 ? me + START_GAP : Math.max(ARENA_L + 80, me - START_GAP); }
  f.erect = 0;
  state.checkpoint = Math.max(state.checkpoint, CP_FIGHT);
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// THE INTRO

/** The droop (naked): from up to down in three sad sags, a wobble after each, and a little sad boing at the bottom. */
const DROOP = [[0, 1], [40, 0.72], [80, 0.45], [120, 0.18], [150, 0]] as const;
const droopAt = (t: number) => {
  for (let i = DROOP.length - 1; i >= 0; i--) if (t >= DROOP[i][0]) {
    const [t0, k] = DROOP[i], wob = Math.max(0, 1 - (t - t0) / 20);
    return Math.max(0, k + Math.sin((t - t0) * 0.9) * 0.06 * wob);
  }
  return 1;
};

const intro = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true;
  // (the boot's pose runs down (only the M1 boss door's own code ever counts it down))
  if ((p.kickPose ?? 0) > 0) p.kickPose!--;
  if (f.skipT > SKIP_AFTER) offerSkip();
  if (f.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0;
    // (skipped: the door's in, he's through it, she's up and furious)
    if (p.pos.x + p.width / 2 < ARENA_L + 120) { p.pos.x = ARENA_L + 160 - p.width / 2; p.vel.x = 0; }
    f.x = Math.max(f.x, pmid(state).x + 500);
    beginFight(state, f);
    return { ...NO_CONTROLS };
  }
  const t = f.introT, me = pmid(state).x;
  let out: Controls = { ...NO_CONTROLS };
  const walkTo = (x: number) => { if (Math.abs(me - x) > 3) out = { ...NO_CONTROLS, [x > me ? 'right' : 'left']: true }; else p.vel.x = 0; };
  let want = f.camX;
  switch (f.intro) {
    case 'approach':
      walkTo(KICK_AT);
      want = camFor(DOOR_X - 200, true);
      if (Math.abs(me - KICK_AT) <= 3 && p.isGrounded) { f.intro = 'kick'; f.introT = 0; p.facing = 1; }
      break;
    case 'kick':
      want = camFor(DOOR_X - 200, true);
      if (t === 14) { p.kickPose = 24; playSound('whoosh', 0.6, -4); }
      if (t === 23) {
        f.doorT = 0;
        playSound('crash', 1, -6); playSound('punch', 1, -8); playSound('thud', 1, -10); shakeScreen(state, 14, 8);
        for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: DOOR_X + (Math.random() - 0.3) * 80, y: GY - Math.random() * 200 }, vel: { x: 1 + Math.random() * 5, y: -Math.random() * 3 }, life: 50 + Math.random() * 30, color: k % 3 ? 'rgba(232, 214, 222, 0.8)' : '#F2C84A', size: 4 + Math.random() * 6 });
      }
      if (t === 40) { f.intro = 'kickline'; f.introT = 0; hisLine(state, L.MH_KICK, tokened(() => { f.intro = 'pan'; f.introT = 0; })); }
      break;
    case 'kickline':
      want = camFor(DOOR_X, true);
      break;
    case 'pan':
      // (in he walks; the camera on into the room to her, lounging on her chaise as if nothing's happened)
      walkTo(ARENA_L + 200);
      want = camFor(CHAISE_X - 120);
      if (t === 60) { f.intro = 'reveal'; f.introT = 0; herLine(f, L.PIPER_REVEAL, tokened(() => { f.intro = 'closeup'; f.introT = 0; f.closeup = { face: 'sultry', t: 0 }; playSound('ding', 0.6, -6); })); }
      break;
    case 'reveal':
      walkTo(ARENA_L + 200);
      want = camFor(CHAISE_X - 120);
      break;
    case 'closeup':
      // (the dust clears: her, close up)
      walkTo(ARENA_L + 200);
      if (f.closeup) f.closeup.t++;
      if (t === 70) {
        f.closeup = null; f.intro = 'sees'; f.introT = 0;
        hisLine(state, L.MH_SEES, tokened(() => { f.intro = 'fat'; f.introT = 0; hisLine(state, L.MH_FAT, tokened(() => { f.intro = 'ugly'; f.introT = 0; hisLine(state, L.MH_UGLY, tokened(() => {
          f.intro = 'rage'; f.introT = 0; f.closeup = { face: 'rage', t: 0 }; playSound('roar', 0.5, 10);
          herLine(f, L.PIPER_ENRAGED, tokened(() => { f.closeup = null; f.intro = 'fight'; f.introT = 0; herLine(f, L.PIPER_FIGHT, tokened(() => { f.intro = 'on'; f.introT = 0; hisLine(state, L.MH_ON, tokened(() => beginFight(state, f))); })); }));
        })); })); }));
      }
      break;
    case 'sees':
      // (naked: it goes down while he looks)
      want = camFor((me + f.x) / 2);
      if (pants() === 'nude') { f.erect = droopAt(t); if (t === 40 || t === 80 || t === 120) playSound('squish', 0.5, -6 - t / 20); if (t === 150) playSound('boing', 0.5, -14); }
      break;
    case 'fat': case 'ugly':
      want = camFor((me + f.x) / 2);
      // (and whatever's left of it keeps going down)
      if (pants() === 'nude') { f.erect = Math.max(0, f.erect - 0.008); if (f.erect > 0 && f.erect < 0.008) playSound('boing', 0.5, -14); }
      break;
    case 'rage':
      if (f.closeup) f.closeup.t++;
      want = camFor(f.x - 100);
      break;
    case 'fight': case 'on':
      want = camFor((me + f.x) / 2);
      break;
  }
  f.camX += (want - f.camX) * (f.intro === 'approach' || f.intro === 'kick' ? 0.2 : 0.07);
  if (f.mode === 'intro') { state.cameraOverride = { x: f.camX, y: CAM_Y }; state.camera.x = f.camX; state.camera.y = CAM_Y; }
  void controls;
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP * 0.66 ? 1 : f.hp > HP * 0.33 ? 2 : 3);
const walkLen = (f: Fight) => { const [a, b] = WALK_T[phase(f)]; return a + Math.floor(Math.random() * (b - a)); };
const setAct = (f: Fight, a: Act, len = 0) => { f.act = a; f.actT = 0; f.actLen = len; };
const airborne = (f: Fight) => f.act === 'rise' || f.act === 'hang' || f.act === 'lock' || f.act === 'fall';
const canHurtHim = (state: GameState) => { const p = state.player; return p.health > 0 && !p.inCutscene && (p.invincibilityTimer ?? 0) <= 0 && !p.untouchable; };
const overlaps = (state: GameState, x0: number, y0: number, x1: number, y1: number) => { const p = state.player; return p.pos.x < x1 && p.pos.x + p.width > x0 && p.pos.y < y1 && p.pos.y + p.height > y0; };
const attacking = (state: GameState) => { const p = state.player; return p.isCharging || p.isUppercutting || !!p.isDivekicking || p.isSliding; };

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  game = state;
  f.total++;
  if (f.mode === 'intro') { const out = intro(ctx, f, controls); sync(state, f); return out; }
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  tickHazards(ctx, f);
  tickDebris(ctx, f);
  tickChandelier(ctx, f);
  tickShots(ctx, f);
  if (f.mode === 'dead') { setUi({ iceMash: null }); return dying(ctx, f); }
  takeHits(ctx, f);
  if (f.mode !== 'on') { setUi({ iceMash: null }); return { ...NO_CONTROLS }; }
  ai(ctx, f);
  if (f.mode !== 'on') return { ...NO_CONTROLS };
  contact(ctx, f);
  talk(ctx, f);
  sync(state, f);
  tickRangeZoom(state, f);
  f.thin +=(f.holes.length * 0.18 - f.thin) * 0.05;
  return himself(ctx, f, controls);
};

/** Him: knocked off his feet, or frozen solid (mash out); else his own controls. */
const himself = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  // (frozen: nothing but A breaks it (the user's), and no dashing or charging out of it)
  if (f.thawT > 0 && --f.thawT === 0 && !f.ice) p.noSpecials = false;
  if (f.ice) {
    p.noSpecials = true;
    const I = f.ice;
    I.t++;
    p.vel.x = 0; p.isDucking = false;
    const down = !!controls.jump;
    if (down && !I.prev) { I.fill += MASH_STEP; playSound('crack', 0.35, 4 + I.fill * 8); }
    I.prev = down;
    I.fill = Math.max(0, I.fill - MASH_DRAIN);
    if (I.fill >= 1 || I.t > ICE_MAX || p.health <= 0) {
      f.ice = null;
      playSound('glass', 0.9, 2);
      for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + Math.random() * p.height }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 4 }, life: 30, color: k % 2 ? '#E0F2FE' : '#BAE6FD', size: 3 + Math.random() * 3, grav: 0.3 });
      setUi({ iceMash: null });
      f.thawT = 15; f.thawedAt = f.total;
      return { ...NO_CONTROLS };
    }
    setUi({ iceMash: I.fill });
    return { ...NO_CONTROLS };
  }
  setUi({ iceMash: null });
  if (f.stun > 0) { f.stun--; p.vel.x *= 0.8; return { ...NO_CONTROLS }; }
  return controls;
};

/** Frozen solid: the cold's hurt, the block of ice, the mash. */
const freezeHim = (ctx: FrameContext, f: Fight, dmg: number, src: string) => {
  const { state } = ctx;
  hurtPlayer(ctx, dmg, src, { x: 0, y: 0 }, 1);
  if (state.player.health <= 0) return;
  f.ice = { t: 0, fill: 0, prev: true };
  f.stun = 0;
  playSound('ice', 1, -4); playSound('glass', 0.5, 8);
  if (quiet(f, state) && Math.random() < 0.6) hisLine(state, L.MH_FROZEN);
};

// ---------------------------------------------------------------------------------------------------------------
// Her

/** Her hop over to a loose part: how often a frame (once the throws' gap is up), how long, how high. */
const HOP_CHANCE = 0.008, HOP_T = 46, HOP_H = 170;
/** Ripping a bit off a loose part (near it): the shout, the element. */
const startRip = (f: Fight, h: { kind: string; x: number }) => {
  f.rip = h.kind === 'heat' ? 'fire' : h.kind === 'nitro' ? 'ice' : 'shock';
  f.facing = h.x < f.x ? -1 : 1;
  setAct(f, 'rip', RIP_T); f.throwAt = f.total;
  // (a shout she hasn't used this life; all used, she throws without one)
  const shout = piperLine(L.ELEMENT_SHOUT[f.rip]);
  if (shout) herSays(f, shout);
  playSound(f.rip === 'fire' ? 'ignite' : f.rip === 'ice' ? 'ice' : 'taser', 0.7, 4);
};

const ai = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player, m = pmid(state);
  f.actT++;
  const ph = phase(f);
  switch (f.act) {
    case 'entrance':
      f.facing = m.x < f.x ? -1 : 1;
      if (f.actT >= ENTRANCE_T) setAct(f, 'walk', walkLen(f));
      break;
    case 'walk': {
      f.facing = m.x < f.x ? -1 : 1;
      if (Math.abs(m.x - f.x) > 50) f.x += f.facing * WALK_V[ph];
      f.x = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, f.x));
      // (near a loose part, now and then, with nobody talking (the shout has to be heard): rip a bit off it)
      if (f.total - f.throwAt > THROW_GAP && quiet(f, state) && Math.random() < 0.03) {
        const h = f.hazards.find(z => Math.abs(z.x - f.x) < THROW_NEAR);
        if (h) { startRip(f, h); break; }
      }
      // (now and then, the user's: she leaps over to a loose part, however far, to throw from it at range; the camera
      // pulls out if it's far, so he sees it coming)
      if (f.hazards.length && f.total - f.throwAt > THROW_GAP && quiet(f, state) && Math.random() < HOP_CHANCE) {
        const h = f.hazards[Math.floor(Math.random() * f.hazards.length)];
        if (Math.abs(h.x - f.x) >= THROW_NEAR) {
          f.hopFrom = f.x; f.hopTo = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, h.x - Math.sign(h.x - m.x || 1) * 40));
          f.throwAt = f.total;
          setAct(f, 'hop', HOP_T); playSound('jump', 0.9, -8); playSound('whoosh', 0.7, -6);
          break;
        }
      }
      if (f.actT >= f.actLen) {
        setAct(f, 'crouch', CROUCH_T);
        if (Math.random() < 0.55) bark(f, state, L.PIPER_LEAP[pants()]);
        playSound('whoosh', 0.4, -8);
      }
      break;
    }
    case 'crouch':
      f.facing = m.x < f.x ? -1 : 1;
      if (f.actT % 6 === 0) playSound('click', 0.15, 12);
      if (f.actT >= f.actLen) { setAct(f, 'rise', RISE_T); playSound('jump', 1, -10); playSound('whoosh', 0.8, -6); f.slamHit = false; }
      break;
    case 'rise': {
      const k = f.actT / RISE_T, e = 1 - (1 - k) * (1 - k);
      f.y = GY + (APEX - GY) * e;
      f.x += Math.max(-3, Math.min(3, m.x - f.x));
      if (f.actT >= RISE_T) setAct(f, 'hang', HANG_T);
      break;
    }
    case 'hang':
      f.y = APEX + Math.sin(f.actT * 0.5) * 2;
      f.x += Math.max(-TRACK_V, Math.min(TRACK_V, m.x - f.x));
      f.x = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, f.x));
      if (f.actT % 4 === 0) playSound('click', 0.12, 16);
      if (f.actT >= HANG_T) { setAct(f, 'lock', LOCK_T); playSound('beep', 0.5, 6); }
      break;
    case 'lock':
      f.y = APEX + (f.actT % 4 < 2 ? 1 : -1);
      if (f.actT >= LOCK_T) { setAct(f, 'fall'); f.vy = 4; }
      break;
    case 'fall':
      f.vy += FALL_G; f.y += f.vy;
      if (!f.slamHit && canHurtHim(state) && overlaps(state, f.x - 46, f.y - EH, f.x + 46, f.y)) {
        f.slamHit = true;
        const away = (Math.sign(m.x - f.x) || 1) as 1 | -1;
        hurtPlayer(ctx, SLAM_DMG, L.SRC.slam, { x: away * 9, y: -6 });
        f.ice = null;
      }
      if (f.y >= GY) { f.y = GY; land(ctx, f); }
      break;
    case 'hop': {
      // (an arc over to it: no slam, no quake; a thud as she lands, then she rips a bit off it)
      const k = Math.min(1, f.actT / HOP_T);
      f.x = f.hopFrom + (f.hopTo - f.hopFrom) * k;
      f.y = GY - Math.sin(Math.PI * k) * HOP_H;
      f.facing = f.hopTo < f.hopFrom ? -1 : 1;
      if (f.actT >= HOP_T) {
        f.y = GY; playSound('thud', 0.9, -8); shakeScreen(state, 4, 3);
        const h = f.hazards.reduce<typeof f.hazards[number] | null>((b, z) => (!b || Math.abs(z.x - f.x) < Math.abs(b.x - f.x) ? z : b), null);
        if (h) startRip(f, h); else setAct(f, 'walk', walkLen(f));
      }
      break;
    }
    case 'sit':
      if (f.actT >= f.actLen) setAct(f, 'walk', walkLen(f));
      break;
    case 'rip':
      if (f.actT >= f.actLen) { setAct(f, 'throw', THROW_T); }
      break;
    case 'throw':
      f.facing = m.x < f.x ? -1 : 1;
      if (f.actT === 6 && f.rip) throwAt(ctx, f, f.rip);
      if (f.actT >= f.actLen) { f.rip = null; setAct(f, 'walk', walkLen(f)); }
      break;
    case 'bounce': bounce(ctx, f); break;
    case 'flop':
      if (f.actT >= f.actLen) setAct(f, 'getup', 30);
      break;
    case 'getup':
      if (f.actT >= f.actLen) setAct(f, 'walk', walkLen(f));
      break;
  }
  void p;
};

/** Down she comes: the quake, the debris, the room a stage worse, what's torn loose. */
const land = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  playSound('slam', 1.2, -8); playSound('crash', 0.9, -10); playSound('thud', 1.2, -12); playSound('rumble', 0.8, -4);
  shakeScreen(state, 22, 10);
  for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 140, y: GY - 4 }, vel: { x: (k % 2 ? 1 : -1) * (1 + Math.random() * 6), y: -1 - Math.random() * 3 }, life: 50, color: k % 4 ? 'rgba(232, 214, 222, 0.85)' : '#F43F6E', size: 4 + Math.random() * 6 });
  // (THE EARTHQUAKE: stood on anything, he's knocked off his feet a moment (no hurt); in the air he's fine)
  if (p.isGrounded && !f.ice && p.health > 0 && !f.slamHit) { f.stun = STUN_T; p.vel.y = -4; p.isGrounded = false; }
  f.slams++;
  const was = f.stage;
  f.stage = Math.min(MAX_STAGE, f.slams);
  // (the canopy comes down at the third)
  if (was < 3 && f.stage >= 3) { state.blocks = state.blocks.filter(b => b.tag !== 'pp-canopy'); playSound('crack', 1, -6); }
  // (what's torn loose: the user's order)
  if (f.slams === 2) loosen(ctx, f, 'heat');
  if (f.slams === 4) loosen(ctx, f, 'nitro');
  if (f.slams === 6) loosen(ctx, f, 'wires');
  if (f.slams === 5 && f.chandDown === null && !f.chand) {
    const i = Math.abs(R(CHANDELIERS[0]) - pmid(state).x) < Math.abs(R(CHANDELIERS[1]) - pmid(state).x) ? 0 : 1;
    f.chand = { i, x: R(CHANDELIERS[i]), y: CHANDELIER_Y, t: 0, vy: 0, falling: false, hit: false };
  }
  // (the debris: one at him, the rest about the room)
  const n = Math.min(DEBRIS_MAX, 2 + f.stage);
  const xs: number[] = [Math.max(ARENA_L + 40, Math.min(ARENA_R - 40, pmid(state).x + (Math.random() - 0.5) * 60))];
  for (let tries = 0; xs.length < n && tries < 40; tries++) {
    const x = ARENA_L + 60 + Math.random() * (ARENA_R - ARENA_L - 120);
    if (xs.every(o => Math.abs(o - x) > 110)) xs.push(x);
  }
  for (const x of xs) f.debris.push({ x, y: CEIL_Y + 8, land: debrisFloor(f, x), vy: 0, t: 0, size: 20 + Math.random() * 16, seed: Math.random() * 100, hit: false });
  setAct(f, 'sit', SIT_T[phase(f)]);
};

/** Where a bit of ceiling comes to rest at x: the top of the furniture under it, or the floor. */
const debrisFloor = (f: Fight, x: number) => {
  let y = GY;
  for (const [lx, w, h, what] of LEDGES) {
    if (what === 'canopy' && f.stage >= 3) continue;
    if (x >= R(lx) && x <= R(lx) + w) y = Math.min(y, GY - h);
  }
  return y;
};

/** A part torn loose where she landed (kept clear of the others and the walls): one of the three unsafe areas. */
const loosen = (ctx: FrameContext, f: Fight, kind: HazardKind) => {
  const { state } = ctx;
  const ok = (x: number) => x > ARENA_L + 260 && x < ARENA_R - 260 && f.hazards.every(h => Math.abs(h.x - x) > 420);
  let x = f.x;
  for (let d = 0; d < 60 && !ok(x); d++) for (const s of [1, -1]) { const c = f.x + s * d * 40; if (ok(c)) { x = c; break; } }
  f.hazards.push({ kind, x, t: 0, dir: x < ARENA_MID ? 1 : -1, hit: false });
  playSound('crack', 1, -8); playSound('clang', 0.8, -6);
  if (kind === 'heat') playSound('ignite', 0.8, -4);
  if (kind === 'nitro') playSound('ice', 0.8, -6);
  if (kind === 'wires') { playSound('splash', 0.9, -4); playSound('taser', 0.6, 0); }
  for (let k = 0; k < 20; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: CEIL_Y + 10 }, vel: { x: (Math.random() - 0.5) * 3, y: Math.random() * 3 }, life: 50, color: 'rgba(240, 230, 220, 0.85)', size: 3 + Math.random() * 5, grav: 0.2 });
  hisLine(state, L.MH_LOOSE[kind]);
};

// ---------------------------------------------------------------------------------------------------------------
// The mains (they never hurt her)

const hazPhase = (h: Hazard) => {
  // (in and out (the user's): quiet (a gap to cross), the tell, on; round again. The tell's still safe)
  const [q, tl, on] = HAZ[h.kind], t = h.t % (q + tl + on);
  if (t < q) return { s: 'quiet' as const, k: t / q };
  if (t < q + tl) return { s: 'tell' as const, k: (t - q) / tl };
  return { s: 'on' as const, k: (t - q - tl) / on };
};

const tickHazards = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player, m = pmid(state);
  for (const h of f.hazards) {
    const was = hazPhase(h).s;
    h.t++;
    const ph = hazPhase(h);
    if (ph.s !== was) {
      h.hit = false;
      if (ph.s === 'tell') playSound(h.kind === 'heat' ? 'oil' : h.kind === 'nitro' ? 'suck' : 'taser', 0.35, h.kind === 'wires' ? 10 : 2);
      if (ph.s === 'on') {
        if (h.kind === 'heat') { playSound('flame', 0.9, -4); playSound('ignite', 0.6, -2); }
        if (h.kind === 'nitro') { h.dir = (-h.dir) as 1 | -1; playSound('ice', 0.9, -2); playSound('suck', 0.5, -6); }
        if (h.kind === 'wires') { playSound('taser', 0.9, -4); playSound('bolt', 0.5, 4); }
      }
    }
    if (ph.s === 'on' && h.kind === 'heat' && state.frame % 12 === 0) playSound('flame', 0.3, Math.random() * 4);
    if (ph.s === 'on' && h.kind === 'wires' && state.frame % 9 === 0) playSound('taser', 0.25, 6 + Math.random() * 6);
    if (ph.s !== 'on' || f.mode !== 'on' || !canHurtHim(state)) continue;
    const away = (Math.sign(m.x - h.x) || 1) as 1 | -1;
    if (h.kind === 'heat') {
      const inCol = overlaps(state, h.x - HEAT_HW, CEIL_Y + 40, h.x + HEAT_HW, GY);
      const inFire = overlaps(state, h.x - HEAT_FLOOR, GY - 30, h.x + HEAT_FLOOR, GY);
      if (inCol || inFire) hurtPlayer(ctx, HEAT_DMG, L.SRC.heat, { x: away * 7, y: -6 });
    } else if (h.kind === 'nitro') {
      const a = h.x, b = h.x + h.dir * NITRO_LEN * Math.min(1, ph.k * 6);
      // (always on now: just thawed, a moment to get out of it before it has him again)
      if (!f.ice && f.total - f.thawedAt > NITRO_REFREEZE && overlaps(state, Math.min(a, b), GY - NITRO_H, Math.max(a, b), GY)) freezeHim(ctx, f, NITRO_DMG, L.SRC.nitro);
    } else {
      const feet = p.pos.y + p.height;
      if (feet >= GY - 6 && m.x > h.x - PUDDLE_HW && m.x < h.x + PUDDLE_HW) {
        hurtPlayer(ctx, SHOCK_DMG, L.SRC.shock, { x: away * 5, y: -10 });
        f.ice = null;
        playSound('taser', 1, -2);
      }
    }
  }
  // (the fire balls' burning patches)
  for (const q of f.patches) {
    q.t--;
    if (q.t > 0 && f.mode === 'on' && canHurtHim(state) && overlaps(state, q.x - 40, GY - 26, q.x + 40, GY)) hurtPlayer(ctx, FIREBALL_DMG * 0.7, L.SRC.fireball, { x: (Math.sign(m.x - q.x) || 1) * 6, y: -6 });
  }
  f.patches = f.patches.filter(q => q.t > 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The debris, the chandelier

const tickDebris = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  for (const d of f.debris) {
    d.t++;
    if (d.t < DEBRIS_WARN) {
      // (the tell (the user's: telegraphed): plaster sifting down in a stream, the bit shaking loose up there, creaking)
      if (d.t % 3 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * d.size * 0.6, y: CEIL_Y + 10 }, vel: { x: 0, y: 1.5 + Math.random() }, life: 60, color: 'rgba(240, 232, 224, 0.9)', size: 2 + Math.random() * 2, grav: 0.12 });
      if (d.t % 20 === 10) playSound('crack', 0.2, 8 + Math.random() * 6);
      if (d.t === 1) playSound('crack', 0.25, 6 + Math.random() * 6);
      continue;
    }
    d.vy += 0.9; d.y += d.vy;
    if (!d.hit && f.mode === 'on' && canHurtHim(state) && overlaps(state, d.x - d.size / 2, d.y - d.size, d.x + d.size / 2, d.y)) {
      d.hit = true;
      hurtPlayer(ctx, DEBRIS_DMG, L.SRC.debris, { x: (Math.sign(pmid(state).x - d.x) || 1) * 4, y: -4 });
      d.y = d.land;
    }
    if (d.y >= d.land) {
      d.y = d.land;
      playSound('crash', 0.5, 4 + Math.random() * 4);
      for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: d.x, y: d.land - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 30, color: k % 2 ? '#F6EADA' : '#D8C8B8', size: 2 + Math.random() * 3, grav: 0.35 });
      if (f.rubble.length < 40) f.rubble.push({ x: d.x, y: d.land, w: d.size, seed: d.seed });
    }
  }
  f.debris = f.debris.filter(d => d.y < d.land);
};

const tickChandelier = (ctx: FrameContext, f: Fight) => {
  const C = f.chand;
  if (!C) return;
  const { state } = ctx;
  C.t++;
  if (!C.falling) {
    // (the tell: it swings, its chain spits sparks, it creaks; its shadow on the floor)
    if (C.t % 10 === 0) { playSound('crack', 0.35, 4); state.particles.push({ pos: { x: C.x, y: CEIL_Y + 6 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 }, life: 18, color: '#FDE047', size: 2 }); }
    if (C.t >= 70) { C.falling = true; playSound('clang', 0.9, -4); }
    return;
  }
  C.vy += 1.2; C.y += C.vy;
  if (!C.hit && f.mode === 'on' && canHurtHim(state) && overlaps(state, C.x - 48, C.y - 40, C.x + 48, C.y + 20)) {
    C.hit = true; hurtPlayer(ctx, CHANDELIER_DMG, L.SRC.chandelier, { x: (Math.sign(pmid(state).x - C.x) || 1) * 7, y: -6 });
  }
  if (C.y >= GY - 10) {
    playSound('glass', 1.2, -4); playSound('crash', 1, -6); shakeScreen(state, 10, 5);
    for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: C.x, y: GY - 10 }, vel: { x: (Math.random() - 0.5) * 10, y: -2 - Math.random() * 5 }, life: 40, color: k % 3 ? '#E0F2FE' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.35 });
    f.chandDown = C.i; f.chand = null;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Her throws

const throwAt = (ctx: FrameContext, f: Fight, kind: Element) => {
  const { state } = ctx, m = pmid(state);
  const sx = f.x + f.facing * 46, sy = f.y - 150;
  if (kind === 'fire') {
    // (lobbed: it lands where he is now)
    // (from far off it takes longer, so it's seen coming)
    const g = 0.35, tx = m.x + state.player.vel.x * 12, ty = GY - 10, T = Math.round(Math.max(40, Math.min(90, 40 + Math.abs(tx - sx) / 25)));
    f.shots.push({ kind, x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * g * T, t: 0, tx, ty, hit: false });
    playSound('flame', 0.9, -2);
  } else if (kind === 'ice') {
    const d = Math.hypot(m.x - sx, m.y - sy) || 1;
    f.shots.push({ kind, x: sx, y: sy, vx: ((m.x - sx) / d) * 7.5, vy: ((m.y - sy) / d) * 7.5, t: 0, tx: m.x, ty: m.y, hit: false });
    playSound('ice', 0.8, 2);
  } else {
    // (the cable's end aimed at him: the line first, where he's headed)
    f.shots.push({ kind, x: sx, y: sy, vx: 0, vy: 0, t: 0, tx: m.x + state.player.vel.x * 10, ty: m.y, hit: false });
    playSound('taser', 0.6, 8);
  }
};

/** The bolt's aim (frames), then how long it's down the line. */
const AIM_T = 24, STRIKE_T = 10;
const tickShots = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, m = pmid(state);
  for (const s of f.shots) {
    s.t++;
    if (s.kind === 'shock') {
      if (s.t === AIM_T) { playSound('bolt', 1, -2); playSound('thunder', 0.5, 6); }
      if (s.t >= AIM_T && s.t < AIM_T + STRIKE_T && !s.hit && f.mode === 'on' && canHurtHim(state)) {
        // (along the line from her hand through where it was aimed, on to the floor or the wall)
        const dx = s.tx - s.x, dy = s.ty - s.y, L2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, ((m.x - s.x) * dx + (m.y - s.y) * dy) / L2);
        const cx = s.x + dx * u, cy = s.y + dy * u;
        if (Math.hypot(m.x - cx, m.y - cy) < 24) { s.hit = true; hurtPlayer(ctx, BOLT_DMG, L.SRC.bolt, { x: Math.sign(dx) * 6, y: -8 }); f.ice = null; }
      }
      continue;
    }
    if (s.kind === 'fire') s.vy += 0.35;
    s.x += s.vx; s.y += s.vy;
    if (s.t % 3 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5), y: -0.5 }, life: 16, color: s.kind === 'fire' ? (s.t % 2 ? '#FDBA74' : '#F97316') : '#E0F2FE', size: 3 + Math.random() * 3 });
    if (!s.hit && f.mode === 'on' && canHurtHim(state) && overlaps(state, s.x - 12, s.y - 12, s.x + 12, s.y + 12)) {
      s.hit = true;
      if (s.kind === 'fire') hurtPlayer(ctx, FIREBALL_DMG, L.SRC.fireball, { x: Math.sign(s.vx) * 6, y: -6 });
      else if (!f.ice) freezeHim(ctx, f, ICEBALL_DMG, L.SRC.iceball);
    }
    if (s.kind === 'fire' && s.y >= GY - 6 && !s.hit) { s.hit = true; f.patches.push({ x: s.x, t: 80 }); playSound('ignite', 0.7, 0); }
    if (s.kind === 'ice' && (s.y >= GY - 4 || s.x < ARENA_L || s.x > ARENA_R) && !s.hit) { s.hit = true; playSound('glass', 0.5, 6); }
  }
  f.shots = f.shots.filter(s => !s.hit && s.t < 200 && s.x > ARENA_L - 40 && s.x < ARENA_R + 40);
};

// ---------------------------------------------------------------------------------------------------------------
// Her belly, and him touching her

const contact = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, m = pmid(state);
  if (!canHurtHim(state)) return;
  const away = (Math.sign(m.x - f.x) || 1) as 1 | -1;
  if (f.act === 'bounce') {
    if (Math.hypot(m.x - f.x, m.y - (f.y - 85)) < 78) hurtPlayer(ctx, BOUNCE_DMG, L.SRC.bounce, { x: away * 9, y: -7 });
    return;
  }
  if (airborne(f) || f.act === 'flop' || attacking(state)) return;
  if (overlaps(state, f.x - 44, f.y - 150, f.x + 44, f.y)) hurtPlayer(ctx, BODY_DMG, L.SRC.body, { x: away * 9, y: -5 });
};

// ---------------------------------------------------------------------------------------------------------------
// Hits on her

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
  if (dealt <= 0 || !state.enemies.includes(e) || f.mode !== 'on') return;
  const p = state.player;
  // (the flintlock: a hole, breather or no)
  if (!melee && p.currentWeapon === 'FLINTLOCK') { hole(ctx, f); return; }
  if (f.iframes > 0) return;
  const plain = plainHit(state, melee);
  // (him thinking out loud about the flintlock, now and then; never about a weapon he hasn't got)
  if (p.availableWeapons.includes('FLINTLOCK') && !f.holes.length && (++f.wrongN === 2 || f.wrongN % 5 === 0) && f.total - f.hintAt > HINT_GAP && quiet(f, state)) {
    f.hintAt = f.total; hisLine(state, L.MH_HINT);
  }
  hurt(ctx, f, plain ?? Math.max(1, dealt * SHARE));
};

const hurt = (ctx: FrameContext, f: Fight, dmg: number) => {
  const { state } = ctx;
  f.hp -= dmg; f.iframes = IFRAMES; f.flash = 8;
  for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: f.x, y: f.y - 90 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: i % 2 ? '#B91C1C' : '#F6E7A8', size: 2 + Math.random() * 2, grav: 0.3 });
  playSound('gunhit', 0.5, -2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - PIPER_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  if (Math.random() < 0.15) bark(f, state, L.PIPER_HURT[pants()]);
  if (f.hp <= 0) die(ctx, f, false);
};

/** A ball from the flintlock: a hole in her, and off she goes round the room. */
const hole = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.hp -= HOLE_DMG; f.flash = 10;
  f.holes.push({ x: -28 + Math.random() * 56, y: -120 + Math.random() * 76 });
  playSound('splat', 1, -6); playSound('gorespray', 0.8, 0); playSound('fart', 0.7, 6);
  ctx.fx.spawnDamageNumber({ x: f.x - 20, y: f.y - PIPER_H - 30 }, 'POP!', true, '#F6E7A8');
  for (let k = 0; k < 24; k++) state.particles.push({ pos: { x: f.x, y: f.y - 90 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 5 }, life: 40, color: k % 2 ? '#8B0000' : '#F6E7A8', size: 3 + Math.random() * 3, grav: 0.35 });
  if (f.holes.length >= HOLES_TO_DIE || f.hp <= 0) { die(ctx, f, true); return; }
  // (whatever she was at, she's off: a let-go balloon)
  f.slamHit = true;
  setAct(f, 'bounce', BOUNCE_T + f.holes.length * BOUNCE_EACH);
  f.ang = -Math.PI / 2 + (Math.random() < 0.5 ? -0.7 : 0.7);
  state.enemies = state.enemies.filter(o => o !== f.e);
  token++; f.said = null;
  herMaybe(f, L.PIPER_HOLE, tokened(() => hisLine(state, L.MH_HOLE)));
};

/** Round the room like a let-go balloon: a jet of her out of every hole, off the walls and the ceiling. */
const bounce = (ctx: FrameContext, f: Fight, endless = false) => {
  const { state } = ctx;
  const S = BOUNCE_V + f.holes.length * (endless ? 2 : 1);
  const ending = !endless && f.actT >= f.actLen;
  if (ending) f.ang += (Math.PI / 2 - f.ang) * 0.2;
  else f.ang += (Math.random() - 0.5) * 0.35;
  f.x += Math.cos(f.ang) * S; f.y += Math.sin(f.ang) * S;
  f.rot += 0.22 * (Math.cos(f.ang) >= 0 ? 1 : -1);
  const boing = () => { playSound('boing', 0.5, -4 + Math.random() * 6); playSound('thud', 0.5, -6); shakeScreen(state, 4, 3); };
  if (f.x < ARENA_L + 60) { f.x = ARENA_L + 60; f.ang = Math.PI - f.ang; boing(); wallSplat(f, -1); }
  if (f.x > ARENA_R - 60) { f.x = ARENA_R - 60; f.ang = Math.PI - f.ang; boing(); wallSplat(f, 1); }
  if (f.y - EH < CEIL_Y + 6) { f.y = CEIL_Y + 6 + EH; f.ang = -f.ang; boing(); }
  if (f.y > GY) {
    f.y = GY;
    if (ending) { setAct(f, 'flop', 50); f.rot = 0; playSound('thud', 1.2, -10); playSound('squish', 0.8, -8); shakeScreen(state, 8, 5); if (!state.enemies.includes(f.e)) state.enemies.push(f.e); return; }
    f.ang = -f.ang; boing();
  }
  leak(state, f, 2);
  if (f.actT % 7 === 0) playSound('fart', 0.25, 4 + Math.random() * 8);
};

/** The fat and the gore out of her holes: jets off her, and puddles on the carpet under her. */
const leak = (state: GameState, f: Fight, n: number) => {
  const bw = piperBodyW(f.thin);
  for (const h of f.holes) for (let k = 0; k < n; k++) {
    const a = f.rot, hx = h.x * bw * f.facing, hy = h.y + 85;
    const wx = f.x + hx * Math.cos(a) - hy * Math.sin(a), wy = f.y - 85 + hx * Math.sin(a) + hy * Math.cos(a);
    const out = Math.atan2(wy - (f.y - 85), wx - f.x) || 0;
    state.particles.push({ pos: { x: wx, y: wy }, vel: { x: Math.cos(out) * (3 + Math.random() * 3), y: Math.sin(out) * (3 + Math.random() * 3) }, life: 30 + Math.random() * 20, color: Math.random() < 0.5 ? '#8B0000' : Math.random() < 0.5 ? '#F6E7A8' : '#E8C860', size: 2 + Math.random() * 3, grav: 0.3 });
  }
  if (state.frame % 4 === 0 && f.splats.length < 90) f.splats.push({ x: f.x + (Math.random() - 0.5) * 80, w: 10 + Math.random() * 26, col: Math.random() < 0.5 ? '#7F1D1D' : '#E8D490', dy: Math.random() * 6 });
};
const wallSplat = (f: Fight, side: 1 | -1) => { if (f.splats.length < 90) f.splats.push({ x: side < 0 ? ARENA_L + 6 : ARENA_R - 30, w: 24, col: '#7F1D1D', dy: -1 }); };

// ---------------------------------------------------------------------------------------------------------------
// Talking during it

const talk = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.tauntT++;
  if (f.entrance > 0) f.entrance--;
  if (!f.lowSaid && f.hp < HP * 0.33 && quiet(f, state)) { f.lowSaid = true; herLine(f, L.PIPER_LOW); return; }
  if (f.tauntT > TAUNT_EVERY && quiet(f, state) && f.act !== 'bounce' && f.act !== 'rip') {
    f.tauntT = 0; f.tauntHer = !f.tauntHer;
    if (f.tauntHer) herMaybe(f, L.PIPER_TAUNT); else hisLine(state, L.MH_TAUNT);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Dying

const die = (ctx: FrameContext, f: Fight, weak: boolean) => {
  const { state } = ctx, p = state.player;
  if (f.mode === 'dead') return;
  token++; silenceAll();
  f.mode = 'dead';
  state.enemies = state.enemies.filter(o => o !== f.e);
  f.shots = []; f.debris = []; f.ice = null; f.stun = 0; f.said = null;
  state.damageNumbers = [];
  setUi({ iceMash: null });
  p.inCutscene = true;
  f.skipT = 0;
  f.death = { how: weak ? 'balloon' : 'cork', t: 0, step: 'start', at: 0, x: f.x, y: f.y, vy: f.vy, trail: [], turd: null, gush: 0, dust: 0, said: new Set() };
  f.camX = state.camera.x;
  if (weak) { f.cam = { t: 0, acc: 0, z: 1, out: false }; f.act = 'bounce'; f.actT = 0; playSound('flintlock', 0.6, -6); }
  else playSound('roar', 0.6, 6);
};

/** The death's beats (a cutscene: SKIP >> for the lot). */
const dying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  p.inCutscene = true; p.vel.x *= 0.8;
  f.skipT++;
  const skippable = f.deathSaid < 4 && d.t > 8;
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) {
    token++; silenceAll(); state.playerVulgarityTimer = 0; f.said = null;
    if (d.how === 'cork') { d.step = 'gone'; d.y = CEIL_Y - 2000; f.roofHole = d.x; d.turd = null; d.gush = 0; }
    else { d.step = 'pile'; f.thin = 2; }
    if (f.cam) { f.cam.out = true; f.cam.z = 1; }
    f.erect = 0;
    f.deathSaid = 4; d.t = Math.max(d.t, 201);
    return { ...NO_CONTROLS };
  }
  if (d.how === 'cork') cork(ctx, f, d); else balloon(ctx, f, d);
  // (the camera on her, held to the room)
  const want = camFor(d.how === 'cork' ? d.x : f.x);
  f.camX = clampCam(f.camX + (want - f.camX) * 0.08);
  state.cameraOverride = { x: f.camX, y: CAM_Y }; state.camera.x = f.camX; state.camera.y = CAM_Y;
  if (d.t > 2400) f.deathSaid = 4;
  return { ...NO_CONTROLS };
};

/** THE CORK. */
const cork = (ctx: FrameContext, f: Fight, d: Death) => {
  const { state } = ctx, t = d.t;
  switch (d.step) {
    case 'start':
      // (one last belly flop: up, and down through the wrecked floor)
      if (t === 1) { herLine(f, L.PIPER_LAST); d.vy = d.y >= GY - 1 ? -17 : Math.max(0, d.vy); playSound('jump', 1, -10); }
      d.vy += d.vy < 0 ? 0.9 : FALL_G; d.y += d.vy;
      if (d.y >= GY && d.vy > 0) {
        d.y = GY + 96; d.step = 'wedge'; d.at = t;
        playSound('crash', 1.3, -12); playSound('crack', 1.2, -10); playSound('slam', 1.2, -10); shakeScreen(state, 30, 12);
        for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 160, y: GY }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 50, color: k % 3 ? '#9A3466' : '#D8C8B8', size: 3 + Math.random() * 5, grav: 0.35 });
        f.rubble.push({ x: d.x - 90, y: GY, w: 30, seed: 3 }, { x: d.x + 90, y: GY, w: 26, seed: 7 });
      }
      break;
    case 'wedge':
      if (t === d.at + 30) herLine(f, L.PIPER_STUCK, tokened(() => { d.step = 'pressure'; d.at = d.t; hisLine(state, L.MH_PRESSURE); }));
      break;
    case 'pressure': {
      // (the mains backing up under her: the rumble, steam out of the cracks, her going purple, shaking)
      const k = Math.min(1, (t - d.at) / 170);
      if (t % Math.max(6, Math.round(22 - k * 16)) === 0) { playSound('rumble', 0.5 + k * 0.5, -4 + k * 6); shakeScreen(state, 6, 2 + k * 5); }
      if (t % 3 === 0) state.particles.push({ pos: { x: d.x + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 30), y: GY }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - k * 4 }, life: 40, color: 'rgba(240, 240, 250, 0.7)', size: 6 + Math.random() * 8 });
      if (t - d.at >= 170 && quiet(f, state)) {
        d.step = 'pop'; d.at = t; d.vy = -30;
        playSound('boom', 1.3, -6); playSound('boing', 1.2, -10); playSound('splash', 1.2, -6); shakeScreen(state, 20, 10);
        herSays(f, piperMust(L.PIPER_POP));
      }
      break;
    }
    case 'pop':
      // (out like a champagne cork, straight up: through the ceiling, the roof; the mains gushing up after her; shitting
      // herself on the way)
      d.y += d.vy;
      d.gush = Math.min(1, (t - d.at) / 10);
      if (t % 2 === 0) d.trail.push({ x: d.x + (Math.random() - 0.5) * 6, y: d.y + 10 });
      if (d.y - PIPER_H < CEIL_Y && f.roofHole === null) {
        f.roofHole = d.x;
        playSound('crash', 1.2, -4); playSound('crack', 1, -8);
        for (let k = 0; k < 6; k++) f.debris.push({ x: d.x + (Math.random() - 0.5) * 120, y: CEIL_Y + 8, land: GY, vy: 0, t: DEBRIS_WARN, size: 18 + Math.random() * 14, seed: Math.random() * 99, hit: true });
      }
      if (t === d.at + 40) d.turd = { y: CEIL_Y - 20, vy: 0, down: false };
      if (t >= d.at + 90) { d.step = 'gone'; d.at = t; }
      break;
    case 'gone':
      d.gush = Math.max(0, d.gush - 0.01);
      if (t === d.at + 80) { playSound('thud', 0.6, -14); shakeScreen(state, 8, 3); }
      if (t === d.at + 110) d.dust = 1;
      if (t === d.at + 170 && f.deathSaid === 0) { f.deathSaid = 1; hisLine(state, L.MH_WON, tokened(() => { f.deathSaid = 4; })); }
      break;
  }
  if (d.turd && !d.turd.down) {
    d.turd.vy += 0.5; d.turd.y += d.turd.vy;
    if (d.turd.y >= GY - 4) { d.turd.y = GY - 4; d.turd.down = true; playSound('poopsplat', 1, 0); }
  }
  if (d.dust > 0 && d.dust < 80) { d.dust++; if (d.dust % 2 === 0) state.particles.push({ pos: { x: (f.roofHole ?? d.x) + (Math.random() - 0.5) * 40, y: CEIL_Y }, vel: { x: (Math.random() - 0.5) * 0.8, y: 0.8 + Math.random() }, life: 90, color: ['#FFFFFF', '#F9A8D4', '#FDE68A', '#C4B5FD'][d.dust % 4], size: 2 }); if (d.dust === 2) playSound('twinkle', 0.7, 0); }
};

/** THE DEFLATED BALLOON. */
const balloon = (ctx: FrameContext, f: Fight, d: Death) => {
  const { state } = ctx, t = d.t;
  const nude = pants() === 'nude';
  switch (d.step) {
    case 'start':
      // (round the room one last time, the raspberry of it)
      f.actT++;
      bounce(ctx, f, true);
      if (t % 8 === 0) playSound('fart', 0.5, Math.random() * 10 - 4);
      if (t >= 110) { d.step = 'drop'; d.at = t; f.rot = 0; }
      break;
    case 'drop':
      f.y = Math.min(GY, f.y + 9); f.x += (Math.max(ARENA_L + 200, Math.min(ARENA_R - 200, f.x)) - f.x) * 0.1;
      if (f.y >= GY) { d.step = 'deflate'; d.at = t; playSound('thud', 1, -8); if (f.cam) f.cam.out = true; }
      break;
    case 'deflate': {
      // (down to a supermodel)
      const k = Math.min(1, (t - d.at) / 130);
      f.thin = Math.max(f.thin, 0.72 + 0.28 * k);
      leak(state, f, 1);
      if (t % 18 === 0) playSound('suck', 0.35, 8 - k * 6);
      if (k >= 1) {
        d.step = 'model'; d.at = t;
        playSound('twinkle', 1, 0); playSound('ding', 0.6, 4);
        herLine(f, L.PIPER_SUPERMODEL, tokened(() => {
          if (nude) { d.said.add('up'); playSound('boing', 0.9, 4); }
          hisLine(state, L.MH_SUPERMODEL, tokened(() => { d.step = 'deflate2'; d.at = d.t; }));
        }));
      }
      break;
    }
    case 'model':
      if (t % 10 === 0) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 70, y: f.y - Math.random() * 170 }, vel: { x: 0, y: -0.5 }, life: 30, color: '#FFFFFF', size: 2 });
      if (nude && d.said.has('up')) { f.erect = Math.min(0.9, f.erect + 0.03); if (t % 12 === 0) state.particles.push({ pos: { x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y - 6 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1.3 }, life: 40, color: '#F472B6', size: 5 }); }
      break;
    case 'deflate2': {
      // (and on down: skin and bone)
      const k = Math.min(1, (t - d.at) / 170);
      f.thin = 1 + k;
      leak(state, f, 1);
      if (t % 18 === 0) playSound('suck', 0.3, 2 - k * 8);
      if (k > 0.4 && !d.said.has('thin')) { d.said.add('thin'); herLine(f, L.PIPER_TOO_THIN, tokened(() => hisLine(state, L.MH_TOO_THIN))); }
      if (d.said.has('thin') && f.erect > 0) f.erect = Math.max(0, f.erect - 0.015);
      if (k >= 1 && !d.said.has('last')) { d.said.add('last'); herSays(f, piperMust(L.PIPER_CRUMBLE), tokened(() => { d.step = 'crumble'; d.at = d.t; playSound('crumble', 1.2, -4); playSound('crumble', 0.8, 2); })); }
      break;
    }
    case 'crumble':
      if (t % 3 === 0 && t - d.at < 50) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 50, y: f.y - Math.random() * 160 }, vel: { x: (Math.random() - 0.5) * 2, y: 1 + Math.random() * 2 }, life: 40, color: k3(t), size: 3 + Math.random() * 3, grav: 0.2 });
      if (t - d.at >= 60) { d.step = 'pile'; d.at = t; playSound('thud', 0.5, -4); }
      break;
    case 'pile':
      f.erect = 0;
      if (t === d.at + 40 && f.deathSaid === 0) { f.deathSaid = 1; hisLine(state, L.MH_WON_WEAK, tokened(() => { f.deathSaid = 4; })); }
      break;
  }
};
const k3 = (t: number) => ['#D8C2B4', '#B49C8E', '#F45AAE', '#EDE4D8'][t % 4];

/** Done with: her death played out, everybody's had their say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && f.death.t > 200 && (!f.cam || f.cam.z <= 1);
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; if (f.ice || f.thawT > 0) { state.player.noSpecials = false; f.ice = null; f.thawT = 0; } state.cameraOverride = null; state.enemies = state.enemies.filter(o => o !== f.e); setUi({ iceMash: null }); };
export const killedByWeakness = (f: Fight) => f.death?.how === 'balloon';

/** The enemy, where she is. */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = f.x - e.width / 2; e.pos.y = f.y - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.hitCooldown = f.iframes;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false; e.puppet = false;
  void state;
};

/** Naked, how hard he is right now (the section sets it on the renderer every frame). */
export const erectOf = (f: Fight | null) => (f ? f.erect : 1);
export const nakedNow = () => pants() === 'nude';
export const keepErect = (state: GameState, k: number) => { if (isNude(state) && k > 0) setErect(k, state.frame); };

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (the weakness death): Steve's and Donnie's, near enough

const CAM_Z = 2.0, SLOW = 0.3, SLOW_HOLD = 40, SLOW_RAMP = 90;
export const killCamTick = (f: Fight): boolean => {
  const cam = f.cam;
  if (!cam) return false;
  cam.t++;
  cam.z += ((cam.out ? 1 : CAM_Z) - cam.z) * (cam.out ? 0.05 : cam.t < 6 ? 0.35 : 0.08);
  if (cam.out && cam.z < 1.004) cam.z = 1;
  let rate = cam.t < SLOW_HOLD ? SLOW : Math.min(1, SLOW + ((1 - SLOW) * (cam.t - SLOW_HOLD)) / SLOW_RAMP);
  if (cam.out) rate = 1;
  cam.acc += rate;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};
/** The camera pulled out for a throw from far off (the user's: so he sees it coming): the scale it eases toward, at
 *  most. */
const RANGE_Z = 0.52;
const tickRangeZoom = (state: GameState, f: Fight) => {
  const m = pmid(state), d = Math.abs(f.x - m.x);
  const throwing = f.mode === 'on' && (f.act === 'hop' || f.act === 'rip' || f.act === 'throw' || f.shots.length > 0);
  const want = throwing && d > CANVAS_WIDTH * 0.55 ? Math.max(RANGE_Z, (CANVAS_WIDTH * 0.85) / (d + 200)) : 1;
  f.zo += (want - f.zo) * (want < f.zo ? 0.08 : 0.04);
  if (f.zo > 0.997) f.zo = 1;
};
export const rangeZoom = (state: GameState, f: Fight) => {
  if (f.zo >= 1) return null;
  const k = Math.min(1, (1 - f.zo) / (1 - RANGE_Z)), m = pmid(state);
  const half = CANVAS_WIDTH / 2 / f.zo;
  const want = ARENA_W > half * 2 ? Math.max(ARENA_L + half, Math.min(ARENA_R - half, (f.x + m.x) / 2)) : ARENA_MID;
  const c0x = state.camera.x + CANVAS_WIDTH / 2, c0y = state.camera.y + CANVAS_HEIGHT / 2;
  const cx = c0x + (want - c0x) * k, cy = c0y + (GY - CANVAS_HEIGHT / 2 / f.zo + 30 - c0y) * k;
  return { scale: f.zo, x: cx, y: cy, shiftX: CANVAS_WIDTH / 2 - (cx - state.camera.x), shiftY: CANVAS_HEIGHT / 2 - (cy - state.camera.y) };
};
export const killCamZoom = (state: GameState, f: Fight) => {
  const cam = f.cam;
  if (!cam || cam.z <= 1) return null;
  const k = (cam.z - 1) / (CAM_Z - 1), m = CANVAS_WIDTH / 2 / CAM_Z;
  const fx = Math.max(state.camera.x + m, Math.min(state.camera.x + CANVAS_WIDTH - m, f.x)), fy = Math.max(state.camera.y + 160, Math.min(GY - 80, f.y - 90));
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - fy) };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight): { pose: PiperPose; sx: number; sy: number; face?: PiperFace } => {
  if (f.mode === 'intro') {
    if (f.intro === 'rage' || f.intro === 'fight' || f.intro === 'on') return { pose: 'enraged', sx: 1, sy: 1 };
    return { pose: 'lounge', sx: 1, sy: 1 };
  }
  if (f.flash > 0 && f.act !== 'bounce') return { pose: 'hurt', sx: 1, sy: 1 };
  switch (f.act) {
    case 'crouch': { const k = Math.min(1, f.actT / 12); return { pose: 'enraged', sx: 1 + 0.12 * k, sy: 1 - 0.16 * k }; }
    case 'rise': case 'hop': return { pose: 'enraged', sx: 0.92, sy: 1.08 };
    case 'hang': case 'lock': return { pose: 'enraged', sx: 1, sy: 1 };
    case 'fall': return { pose: 'enraged', sx: 0.9, sy: 1.12, face: 'shock' };
    case 'sit': { const k = Math.max(0, 1 - f.actT / 10); return { pose: 'enraged', sx: 1 + 0.2 * k, sy: 1 - 0.25 * k }; }
    case 'rip': return { pose: 'point', sx: 1, sy: 0.94 };
    case 'throw': return { pose: 'point', sx: 1, sy: 1 };
    case 'bounce': return { pose: 'hurt', sx: 1, sy: 1, face: 'shock' };
    case 'getup': case 'entrance': return { pose: 'enraged', sx: 1, sy: 1 };
    default: return { pose: f.said ? 'talk' : 'stand', sx: 1, sy: 1, face: 'rage' };
  }
};

/** A hole in her: a dark puncture, a ragged ring of fat, the ooze coming out. */
const drawHoles = (c: Ctx, f: Fight, fr: number, jet: boolean) => {
  const bw = piperBodyW(f.thin);
  for (const [i, h] of f.holes.entries()) {
    const hx = h.x * bw, hy = h.y;
    c.fillStyle = '#E8D07A'; c.beginPath(); c.ellipse(hx, hy, 6, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5A0A0A'; c.beginPath(); c.ellipse(hx, hy, 4, 3.4, 0, 0, Math.PI * 2); c.fill();
    if (jet) {
      // (a jet of it, out)
      const len = 18 + ((fr + i * 5) % 6) * 3;
      c.fillStyle = '#8B0000'; c.fillRect(hx + (hx < 0 ? -len : 0), hy - 2, len, 4);
      c.fillStyle = '#F6E7A8'; c.fillRect(hx + (hx < 0 ? -len : 0), hy - 1, len, 1);
    } else {
      // (an ooze down her)
      const run = 6 + ((fr * 0.2 + i * 7) % 18);
      c.fillStyle = '#9A1A1A'; c.fillRect(hx - 1, hy + 3, 3, run);
      c.fillStyle = '#E8D07A'; c.fillRect(hx, hy + 3, 1, run * 0.7);
    }
  }
};

const drawHer = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death;
  const mess = Math.min(1, 0.25 + 0.75 * (1 - Math.max(0, f.hp) / HP));
  if (d && d.how === 'cork') {
    if (d.step === 'gone') return;
    if (d.step === 'wedge' || d.step === 'pressure') {
      // (wedged to the waist: the top half of her out of the floor, the broken boards round her; the wings buzzing)
      const shake = d.step === 'pressure' ? (fr % 4 < 2 ? 2 : -2) * Math.min(1, (d.t - d.at) / 100) : 0;
      c.save(); c.beginPath(); c.rect(d.x - 200, CEIL_Y, 400, GY - CEIL_Y); c.clip();
      drawPiper(c, d.x + shake, d.y, f.facing, fr, d.step === 'pressure' ? 'enraged' : 'enraged', { face: d.step === 'pressure' ? 'shock' : 'rage', mess: 0.8, thin: f.thin, talking: !!f.said });
      c.restore();
      // (the splintered boards round her waist)
      for (let k = 0; k < 9; k++) { const bx = d.x - 80 + k * 20, h = 6 + hash(k * 3.3) * 14; c.fillStyle = '#5A1A3A'; c.beginPath(); c.moveTo(bx, GY); c.lineTo(bx + 8, GY - h); c.lineTo(bx + 16, GY); c.closePath(); c.fill(); }
      // (the cutaway: her legs kicking in the room below, through the hole in the floor)
      box(c, d.x - 90, GY + 4, 180, 60, '#120A10');
      for (const [lx, ph] of [[-24, 0], [24, 2]] as const) {
        const kick = Math.sin(fr * 0.35 + ph) * 10;
        c.fillStyle = '#F8CDB4'; c.fillRect(d.x + lx - 9, GY + 4, 18, 30 + kick * 0.3);
        c.fillStyle = '#A8DCF4'; c.fillRect(d.x + lx - 10 + kick * 0.4, GY + 32 + kick * 0.3, 20, 7);
      }
      box(c, d.x - 92, GY + 2, 184, 3, '#2A0E20');
      return;
    }
    if (d.step === 'pop') {
      // (going up: tiny-winged, screaming, the brown streak under her)
      for (const tr of d.trail) { c.fillStyle = '#5A3A12'; c.fillRect(tr.x - 3, tr.y, 6, 10); }
      drawPiper(c, d.x, d.y, f.facing, fr, 'hurt', { face: 'shock', mess: 1, thin: f.thin });
      return;
    }
    // (start: the last flop)
    drawPiper(c, d.x, Math.min(GY, d.y), f.facing, fr, 'enraged', { face: 'rage', mess, thin: f.thin, talking: !!f.said });
    return;
  }
  if (d && d.how === 'balloon') {
    if (d.step === 'pile') { drawPile(c, f.x, fr); return; }
    if (d.step === 'crumble') {
      // (her coming apart: settling into the heap, her going to dust)
      const k = Math.min(1, (d.t - d.at) / 60);
      c.save(); c.globalAlpha = 1 - k; c.translate(f.x, GY); c.scale(1, 1 - k * 0.85); drawPiper(c, 0, 0, f.facing, fr, 'hurt', { face: 'out', thin: 2, mess: 1 }); c.restore();
      c.globalAlpha = k; drawPile(c, f.x, fr); c.globalAlpha = 1;
      return;
    }
    if (d.step === 'start' || d.step === 'drop') {
      c.save(); c.translate(f.x, f.y - 85); c.rotate(f.rot); c.translate(-f.x, -(f.y - 85));
      drawPiper(c, f.x, f.y, f.facing, fr, 'hurt', { face: 'shock', mess: 1, thin: f.thin });
      c.translate(f.x, f.y); c.scale(f.facing, 1); drawHoles(c, f, fr, true);
      c.restore();
      return;
    }
    const pose: PiperPose = d.step === 'model' ? 'gloat' : f.thin > 1.5 ? 'hurt' : 'stand';
    const face: PiperFace = d.step === 'model' ? 'gloat' : f.thin > 1.3 ? 'shock' : 'hurt';
    drawPiper(c, f.x, f.y, f.facing, fr, pose, { face, mess: d.step === 'model' ? 0.1 : 0.6, thin: f.thin, talking: !!f.said });
    c.save(); c.translate(f.x, f.y); c.scale(f.facing, 1); drawHoles(c, f, fr, d.step === 'deflate' || d.step === 'deflate2'); c.restore();
    return;
  }
  const P = poseOf(f);
  const blink = f.iframes > 0 && Math.floor(fr / 3) % 2 === 0;
  if (blink) c.globalAlpha = 0.65;
  // (her waddle: a rock from foot to foot as she comes)
  const waddle = f.mode === 'on' && f.act === 'walk' ? Math.sin(fr * 0.18) * 0.05 : 0;
  c.save();
  if (f.act === 'bounce') { c.translate(f.x, f.y - 85); c.rotate(f.rot); c.translate(-f.x, -(f.y - 85)); }
  c.translate(f.x, f.y); c.rotate(waddle); c.scale(P.sx, P.sy); c.translate(-f.x, -f.y);
  if (f.mode === 'intro' && P.pose === 'lounge') drawPiper(c, f.x, f.y, -1, fr, 'lounge', { talking: !!f.said });
  else drawPiper(c, f.x, f.y, f.facing, fr, P.pose, { face: P.face, mess, thin: f.thin, talking: !!f.said });
  c.translate(f.x, f.y); c.scale(f.facing, 1); drawHoles(c, f, fr, f.act === 'bounce');
  c.restore();
  c.globalAlpha = 1;
};

/** The heap she crumbles into: her gown in a puddle of satin, bones poking out, the tiara on top, a wand, dust. */
const drawPile = (c: Ctx, x: number, fr: number) => {
  c.fillStyle = '#A01E64'; c.beginPath(); c.ellipse(x, GY - 6, 54, 12, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#F45AAE'; c.beginPath(); c.ellipse(x - 6, GY - 8, 44, 9, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#FFB6DE'; c.fillRect(x - 30, GY - 14, 20, 2);
  for (const [bx, by, r] of [[-20, -16, 0.5], [16, -15, -0.4], [4, -20, 0.1]] as const) { c.save(); c.translate(x + bx, GY + by); c.rotate(r); c.fillStyle = '#EDE4D8'; c.fillRect(-8, -2, 16, 4); c.fillRect(-10, -3, 4, 6); c.fillRect(6, -3, 4, 6); c.restore(); }
  // (the beehive, flattened, the tiara stuck in it on top)
  c.fillStyle = '#F6E8B0'; c.beginPath(); c.ellipse(x + 26, GY - 12, 14, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F6D24E'; c.fillRect(x + 20, GY - 26, 12, 6); c.fillRect(x + 23, GY - 30, 2, 4); c.fillRect(x + 28, GY - 29, 2, 3);
  c.fillStyle = '#F43F8E'; c.fillRect(x + 25, GY - 24, 2, 2);
  if (fr % 40 < 20) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 31, GY - 30, 1, 3); }
  c.fillStyle = 'rgba(200, 190, 180, 0.4)'; c.fillRect(x - 60, GY - 4, 120, 4);
};

/** What's left of her on a revisit: the heap (the balloon), or the hole she was wedged in (the cork). */
export const drawRemains = (c: Ctx, how: 'cork' | 'balloon', x: number, fr: number) => {
  if (how === 'balloon') { drawPile(c, x, fr); return; }
  c.fillStyle = '#120A10'; c.beginPath(); c.ellipse(x, GY + 2, 80, 8, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 9; k++) { const bx = x - 80 + k * 20, h = 6 + hash(k * 3.3) * 14; c.fillStyle = '#5A1A3A'; c.beginPath(); c.moveTo(bx, GY); c.lineTo(bx + 8, GY - h); c.lineTo(bx + 16, GY); c.closePath(); c.fill(); }
};

/** The slam's mark on the floor: her shadow, growing as she comes, red once she's locked on. */
const drawMark = (c: Ctx, f: Fight, fr: number) => {
  if (!airborne(f) || f.mode !== 'on') return;
  const k = f.act === 'fall' ? 1 : f.act === 'lock' ? 0.85 : f.act === 'hang' ? 0.4 + 0.4 * (f.actT / HANG_T) : 0.3 * (f.actT / RISE_T);
  const r = 30 + 40 * k, red = f.act === 'lock' || f.act === 'fall';
  c.fillStyle = `rgba(20, 6, 14, ${(0.25 + 0.35 * k).toFixed(2)})`; c.beginPath(); c.ellipse(f.x, GY - 1, r, r * 0.2, 0, 0, Math.PI * 2); c.fill();
  if (red) { c.strokeStyle = fr % 6 < 3 ? '#EF4444' : '#FDE047'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, GY - 1, r + 4, r * 0.2 + 2, 0, 0, Math.PI * 2); c.stroke(); }
};

/** A main, torn loose: the pipe and its hole, and what it's doing (quiet, the tell, on). */
const drawHazard = (c: Ctx, h: Hazard, fr: number) => {
  const ph = hazPhase(h);
  if (h.kind === 'heat') {
    // (the hole in the ceiling, the heat main's end hanging out of it, bent down)
    drawCavity(c, h.x, CEIL_Y + 6, 96, 44, 51, fr);
    box(c, h.x - 9, CEIL_Y - 20, 18, 64, '#1A0A06'); box(c, h.x - 7, CEIL_Y - 20, 14, 62, '#B8401E'); box(c, h.x - 7, CEIL_Y - 20, 4, 62, '#F07A3A');
    box(c, h.x - 12, CEIL_Y + 38, 24, 6, '#4A1A0A');
    const glow = ph.s === 'tell' ? ph.k : ph.s === 'on' ? 1 : 0;
    if (glow > 0) { c.globalAlpha = 0.25 * glow; c.fillStyle = '#FDBA74'; c.beginPath(); c.arc(h.x, CEIL_Y + 44, 26 + glow * 10, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; box(c, h.x - 6, CEIL_Y + 40, 12, 4, fr % 4 < 2 ? '#FDE047' : '#F97316'); }
    // (steam: a roar of it in the tell, as it comes loose)
    const puffs = ph.s === 'quiet' ? 1 : ph.s === 'tell' ? 4 : 0;
    for (let k = 0; k < puffs; k++) { const tt = ((fr * 1.5 + k * 13) % 40) / 40; c.globalAlpha = 0.6 * (1 - tt); c.fillStyle = '#F4F4F8'; c.fillRect(h.x - 6 - tt * 14 + k * 3, CEIL_Y + 44 + tt * 40, 10 + tt * 16, 8 + tt * 8); c.globalAlpha = 1; }
    if (ph.s === 'on') {
      // (the fire: a column down to the floor, licking, banded; burning on the carpet under it)
      for (let y = CEIL_Y + 44; y < GY; y += 8) {
        const w = HEAT_HW * (0.6 + 0.4 * Math.sin(y * 0.09 + fr * 0.5)) + (y - CEIL_Y) * 0.03;
        c.fillStyle = (y + fr * 3) % 24 < 8 ? '#FDE047' : (y + fr * 3) % 24 < 16 ? '#F97316' : '#DC2626';
        c.fillRect(h.x - w, y, w * 2, 8);
        c.fillStyle = '#FFF7D6'; c.fillRect(h.x - w * 0.3, y, w * 0.6, 8);
      }
      for (let k = 0; k < 7; k++) { const fx = h.x - HEAT_FLOOR + k * (HEAT_FLOOR / 3), fh = 10 + ((fr + k * 7) % 12); c.fillStyle = k % 2 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(fx - 8, GY); c.lineTo(fx, GY - fh); c.lineTo(fx + 8, GY); c.closePath(); c.fill(); }
    }
  } else if (h.kind === 'nitro') {
    // (the main burst out of a hole low in the wall: frosted blue pipe, a split in it pointing out)
    drawCavity(c, h.x, GY - 50, 90, 70, 63, fr);
    box(c, h.x - 40, GY - 46, 80, 14, '#2A5A8A'); box(c, h.x - 40, GY - 46, 80, 4, '#D8F0FF');
    for (let k = 0; k < 8; k++) box(c, h.x - 36 + k * 10, GY - 47, 3, 2, '#FFFFFF');
    // (frost spreading on the wall round it, in the tell; a sputter)
    const frost = ph.s === 'tell' ? ph.k : ph.s === 'on' ? 1 : 0.15;
    c.globalAlpha = 0.5 * frost; c.fillStyle = '#E0F2FE'; c.beginPath(); c.ellipse(h.x, GY - 40, 60 + frost * 40, 30 + frost * 20, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    if (ph.s === 'tell' && fr % 8 < 4) box(c, h.x + h.dir * -44, GY - 42, 6, 6, '#FFFFFF');
    if (ph.s === 'on') {
      // (the squirt: a white jet along the floor, the fog rolling off it, frost on the carpet)
      const len = NITRO_LEN * Math.min(1, ph.k * 6), a = h.x, b = h.x + h.dir * len;
      for (let x = 0; x < len; x += 10) {
        const xx = a + h.dir * x, hh = NITRO_H * (0.4 + 0.6 * (x / NITRO_LEN)) * (0.8 + 0.2 * Math.sin(x * 0.2 + fr * 0.6));
        c.fillStyle = 'rgba(224, 242, 254, 0.75)'; c.fillRect(xx - 5, GY - hh, 10, hh);
        c.fillStyle = 'rgba(255, 255, 255, 0.9)'; c.fillRect(xx - 5, GY - hh * 0.6, 10, hh * 0.3);
      }
      box(c, Math.min(a, b), GY - 2, Math.abs(b - a), 3, '#F0FAFF');
    }
  } else {
    // (the water main burst: the flooded patch; the FX POWER cable down out of the ceiling into it)
    drawCavity(c, h.x + 20, CEIL_Y + 6, 80, 40, 71, fr);
    const sway = Math.sin(fr * 0.05) * 8;
    c.strokeStyle = '#111111'; c.lineWidth = 4; c.beginPath(); c.moveTo(h.x + 20, CEIL_Y + 10); c.quadraticCurveTo(h.x + 30 + sway, (CEIL_Y + GY) / 2, h.x + 10 + sway * 0.5, GY - 2); c.stroke();
    c.strokeStyle = '#E8C020'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#4A90C8'; c.beginPath(); c.ellipse(h.x, GY + 1, PUDDLE_HW, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8AC8F0'; c.beginPath(); c.ellipse(h.x - 20, GY - 1, PUDDLE_HW * 0.7, 4, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 5; k++) box(c, h.x - PUDDLE_HW + 20 + ((fr * 0.5 + k * 53) % (PUDDLE_HW * 2 - 40)), GY - 1, 8, 1, '#DFF4FF');
    // (sparks over the water: a few in the tell, arcs all over it while it's live)
    const n = ph.s === 'tell' ? 3 : ph.s === 'on' ? 9 : fr % 60 < 2 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      let x = h.x - PUDDLE_HW + Math.random() * PUDDLE_HW * 2, y = GY - 2;
      const pts: [number, number][] = [[x, y]];
      for (let m = 0; m < 4; m++) { x += (Math.random() - 0.5) * 30; y -= 6 + Math.random() * (ph.s === 'on' ? 14 : 6); pts.push([x, y]); }
      for (const [w, col] of [[5, 'rgba(165, 243, 252, 0.3)'], [2, '#67E8F9'], [1, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
    }
    if (ph.s === 'on') { c.globalAlpha = 0.18 + 0.1 * Math.sin(fr); c.fillStyle = '#A5F3FC'; c.beginPath(); c.ellipse(h.x, GY - 6, PUDDLE_HW + 10, 22, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  }
};

/** World space, behind him: the leak on the carpet, the rubble, the mains, her mark, the chandelier coming, her. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  for (const s of f.splats) { c.fillStyle = s.col; if (s.dy < 0) c.fillRect(s.x, GY - 260 + (s.x % 7) * 20, 22, 60); else c.fillRect(s.x - s.w / 2, GY - 2 + s.dy * 0.3, s.w, 3); }
  for (const r of f.rubble) { c.fillStyle = '#E8DCCC'; c.beginPath(); c.moveTo(r.x - r.w * 0.6, r.y); c.lineTo(r.x - r.w * 0.2, r.y - r.w * 0.45); c.lineTo(r.x + r.w * 0.3, r.y - r.w * 0.35); c.lineTo(r.x + r.w * 0.6, r.y); c.closePath(); c.fill(); c.fillStyle = '#B8A898'; c.fillRect(r.x - r.w * 0.5, r.y - 3, r.w, 3); }
  for (const h of f.hazards) drawHazard(c, h, fr);
  for (const q of f.patches) for (let k = 0; k < 5; k++) { const fx = q.x - 32 + k * 16, fh = 8 + ((fr + k * 5) % 10); c.fillStyle = k % 2 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(fx - 7, GY); c.lineTo(fx, GY - fh); c.lineTo(fx + 7, GY); c.closePath(); c.fill(); }
  if (f.chandDown !== null) drawChandelier(c, R(CHANDELIERS[f.chandDown]), GY, fr, true);
  drawMark(c, f, fr);
  // (the debris coming: the shadow on what it'll land on, growing; the bit itself once it's falling)
  for (const d of f.debris) {
    const k = Math.min(1, d.t / DEBRIS_WARN);
    c.fillStyle = `rgba(20, 6, 14, ${(0.15 + 0.35 * k).toFixed(2)})`; c.beginPath(); c.ellipse(d.x, d.land - 1, d.size * (0.5 + 0.5 * k), d.size * 0.15, 0, 0, Math.PI * 2); c.fill();
    if (d.t < DEBRIS_WARN) {
      // (the tell, the user's: the bit hanging off the ceiling, shaking loose, cracks round it; a faint line of dust
      // down to where it'll land; the spot ringed in red, flashing faster as it comes)
      const jig = (fr >> 1) % 2 ? 1 : -1, sag = k * 6;
      c.fillStyle = '#F6EADA'; c.fillRect(d.x - d.size / 2 + jig, CEIL_Y + 2 + sag, d.size, d.size * 0.5);
      c.fillStyle = '#C8B8A8'; c.fillRect(d.x - d.size / 2 + jig, CEIL_Y + 2 + sag + d.size * 0.35, d.size, d.size * 0.15);
      c.strokeStyle = '#3A2A30'; c.lineWidth = 1.5; c.beginPath();
      c.moveTo(d.x - d.size * 0.6, CEIL_Y + 2); c.lineTo(d.x - d.size * 0.3, CEIL_Y + 8); c.lineTo(d.x - d.size * 0.8, CEIL_Y + 12);
      c.moveTo(d.x + d.size * 0.6, CEIL_Y + 2); c.lineTo(d.x + d.size * 0.35, CEIL_Y + 9); c.lineTo(d.x + d.size * 0.85, CEIL_Y + 14); c.stroke();
      c.fillStyle = `rgba(240, 232, 224, ${(0.08 + 0.12 * k).toFixed(2)})`; c.fillRect(d.x - 2, CEIL_Y + 10, 4, d.land - CEIL_Y - 10);
      const blink = d.t % Math.max(4, Math.round(14 - 10 * k)) < 3;
      c.strokeStyle = blink ? '#FCA5A5' : '#DC2626'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(d.x, d.land - 1, d.size * 0.9, d.size * 0.26, 0, 0, Math.PI * 2); c.stroke();
    }
    if (d.t >= DEBRIS_WARN) { c.fillStyle = '#F6EADA'; c.fillRect(d.x - d.size / 2, d.y - d.size, d.size, d.size); c.fillStyle = '#C8B8A8'; c.fillRect(d.x - d.size / 2, d.y - d.size * 0.35, d.size, d.size * 0.35); c.fillStyle = '#E890B8'; c.fillRect(d.x - d.size / 2, d.y - d.size, d.size, 4); }
  }
  // (the chandelier swinging loose, then falling)
  if (f.chand) {
    const C = f.chand, sw = C.falling ? 0 : Math.sin(C.t * 0.4) * 0.12 * Math.min(1, C.t / 20);
    c.fillStyle = 'rgba(20, 6, 14, 0.35)'; c.beginPath(); c.ellipse(C.x, GY - 1, 56, 10, 0, 0, Math.PI * 2); c.fill();
    if (!C.falling && C.t % 10 < 5) { c.strokeStyle = '#F87171'; c.lineWidth = 2; c.beginPath(); c.ellipse(C.x, GY - 1, 60, 12, 0, 0, Math.PI * 2); c.stroke(); }
    c.save(); c.translate(C.x, CEIL_Y); c.rotate(sw); c.translate(-C.x, -CEIL_Y);
    if (C.falling) { c.translate(0, C.y - CHANDELIER_Y); drawChandelier(c, C.x, CHANDELIER_Y, fr, false); }
    else drawChandelier(c, C.x, CHANDELIER_Y, fr, false);
    c.restore();
  }
  // (the cork's geyser: the mains gushing up out of the floor after her, champagne style)
  const d = f.death;
  if (d && d.how === 'cork' && (d.step === 'pop' || d.step === 'gone')) drawRemains(c, 'cork', d.x, fr);
  if (d && d.how === 'cork' && d.gush > 0) {
    const top = Math.max(CEIL_Y, GY - 500 * d.gush);
    for (let y = top; y < GY; y += 6) { const w = 22 + Math.sin(y * 0.1 + fr * 0.7) * 6; c.fillStyle = (y + fr * 4) % 18 < 9 ? 'rgba(224, 242, 254, 0.8)' : 'rgba(255, 255, 255, 0.85)'; c.fillRect(d.x - w, y, w * 2, 6); }
  }
  if (d && d.turd) { c.fillStyle = '#5A3A12'; c.beginPath(); c.ellipse(d.x + 30, d.turd.y, d.turd.down ? 10 : 6, d.turd.down ? 4 : 8, 0, 0, Math.PI * 2); c.fill(); }
  if (!(d && d.how === 'cork' && d.step === 'gone')) drawHer(c, f, fr);
};

/** World space, in front: her shots, her words. */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame, p = state.player;
  for (const s of f.shots) {
    if (s.kind === 'fire') {
      c.fillStyle = '#DC2626'; c.beginPath(); c.arc(s.x, s.y, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F97316'; c.beginPath(); c.arc(s.x, s.y, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.arc(s.x - 2, s.y - 2, 4, 0, Math.PI * 2); c.fill();
    } else if (s.kind === 'ice') {
      c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(s.x, s.y, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#E0F2FE'; c.beginPath(); c.arc(s.x - 2, s.y - 2, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFFFF'; c.fillRect(s.x - 4, s.y - 5, 2, 2);
    } else {
      // (the aim: a thin flickering line off the cable's end; then the bolt down it)
      const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy) || 1, len = 1400, ex = s.x + (dx / d) * len, ey = s.y + (dy / d) * len;
      if (s.t < AIM_T) { if (fr % 4 < 2) { c.strokeStyle = 'rgba(165, 243, 252, 0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(ex, ey); c.stroke(); } }
      else if (s.t < AIM_T + STRIKE_T) {
        const pts: [number, number][] = [];
        for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push([s.x + (ex - s.x) * u + (k && k < 30 ? (Math.random() - 0.5) * 16 : 0), s.y + (ey - s.y) * u + (k && k < 30 ? (Math.random() - 0.5) * 16 : 0)]); }
        for (const [w, col] of [[8, 'rgba(165, 243, 252, 0.3)'], [3, '#67E8F9'], [1.4, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); }
      }
    }
  }
  // (frozen: him in a block of ice; knocked off his feet: stars round his head)
  if (f.ice) {
    const x = p.pos.x - 8, y = p.pos.y - 8, w = p.width + 16, h = p.height + 12;
    c.fillStyle = 'rgba(186, 230, 253, 0.55)'; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255, 255, 255, 0.6)'; c.fillRect(x + 3, y + 3, 4, h - 10); c.fillRect(x + 3, y + 3, w - 10, 3);
    c.strokeStyle = '#E0F2FE'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
    // (cracks as he mashes)
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath();
    for (let k = 0; k < Math.floor(f.ice.fill * 8); k++) { const cx = x + hash(k * 3.3) * w, cy = y + hash(k * 5.1) * h; c.moveTo(cx, cy); c.lineTo(cx + (hash(k) - 0.5) * 24, cy + (hash(k * 2) - 0.5) * 24); }
    c.stroke();
  }
  if (f.stun > 0) for (let k = 0; k < 3; k++) { const a = fr * 0.2 + (k * Math.PI * 2) / 3; c.fillStyle = '#FDE047'; c.fillRect(p.pos.x + p.width / 2 + Math.cos(a) * 16 - 2, p.pos.y - 8 + Math.sin(a) * 4 - 2, 4, 4); }
  // (her words over her head)
  if (f.said && !f.closeup) {
    const d = f.death;
    const x = d && d.how === 'cork' ? d.x : f.x, y = d && d.how === 'cork' && (d.step === 'wedge' || d.step === 'pressure') ? GY - 110 : (d && d.how === 'cork' ? d.y : f.y) - PIPER_H - 24;
    saidOver(c, f.said, x, Math.max(state.camera.y + 70, y), '#F9A8D4', 240);
  }
};

/** Screen space: the close-up (the reveal, her rage), the letterbox and SKIP, her bar. */
export const drawFightHud = (c: Ctx, state: GameState, f: Fight, band: { x1: number; x2: number; mid: number }) => {
  const fr = state.frame;
  const bars = (k: number) => { const bar = Math.round(k * 44); c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); };
  if (f.mode === 'intro') {
    if (f.closeup) {
      // (her face, close up: banded pink behind her, red for the rage)
      const rage = f.closeup.face === 'rage';
      const bands = rage ? ['#5A0A14', '#7A1420', '#9A1E2A', '#B82A34'] : ['#3A1030', '#5A1A48', '#7A2A62', '#9A3A7A'];
      bands.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, (i * CANVAS_HEIGHT) / bands.length, CANVAS_WIDTH, CANVAS_HEIGHT / bands.length + 1); });
      const k = Math.min(1, f.closeup.t / 12);
      drawPiperCloseup(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30, 3.2 + k * 0.4, fr, { face: rage ? 'rage' : f.said ? 'talk' : 'sultry', talking: !!f.said, mess: rage ? 0.5 : 0, jolt: rage ? 1.5 : 0 });
      if (f.said) saidOver(c, f.said, CANVAS_WIDTH / 2, 92, '#F9A8D4', 520);
    }
    bars(Math.min(1, f.skipT / 20));
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode === 'dead') {
    const cam = f.cam;
    if (cam && cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    bars(1);
    if (f.deathSaid < 4 && f.skipT > SKIP_AFTER && (f.death?.t ?? 0) > 8) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (state.player.inCutscene) return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FBCFE8' : '#F472B6');
  label(c, 'PIPER THE PIXIE', band.mid, 50, '#F9A8D4', 7);
  // (the holes in her, as little marks under her bar)
  for (let i = 0; i < f.holes.length; i++) { box(c, band.x2 - 14 - i * 12, 40, 8, 8, '#E8D07A'); box(c, band.x2 - 12 - i * 12, 42, 4, 4, '#5A0A0A'); }
};

/** The room's look this frame (room.ts draws it). */
export const roomBits = (f: Fight | null) => ({ stage: f?.stage ?? 0, chandelierDown: f?.chandDown ?? null, roofHole: f?.roofHole ?? null, piperX: f && !f.death ? f.x : null });
