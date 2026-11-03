// DEAD-EYE DOOLEY'S SHOOTIN' GALLERY: Sawdust Gulch's minigame, on Main Street just before the saloon. The owner's:
// "new minigame. wilderness land before the saloon, there's a shooting gallery minigame. it's like a standard wild west
// shooting gallery. simple controls: dpad/left stick moves cursor: X or RT fires. for kb/m use just mouse motion and
// clicking. the thing about this is, you don't win like you think you do. meathead uses his ray gun on the flying duck
// obstacles and they disintegrate confounding and increasingly irritating the man running the shooting gallery booth
// 'oh god, they no longer exist'. he increasingly has more an more existential panic as you disintegrate his set and
// obstacles. you can eventually shoot everything until it is gone. however much is gone by the end of the time limit,
// or if you just disintegrate everything he goes into full panic mode when it is in side scrolling view. he's really
// chewing you out and having a total panic attack. you just shoot him and the shard is yours. its a red herring
// minigame. you can do anything, just cause him to panic and its yours." Then: "you can only shoot him after the
// minigame is over"; "he will chew you out when it transitions back to the standard side view, then control is given
// back to the character as he continues to chew you out. this is when you can shoot him"; "do a score counter just to
// fuck with the player, along with question marks"; "the shooting gallery is 'first person' just so you know".
//
// How it goes (one Gallery a build of the town: what's been done this attempt is in stageMemo, the shard in the save):
//
//   idle     the booth (galleryArt.ts), Dooley behind the counter, pitching (a greeting the first time he sees him).
//            He's scenery: not in the enemies, so nothing touches him (shots, moves, grabs, the amulet's yell).
//            UP at the counter (TALK): his offer (pants variants), then the ask (minigameConfirm.ts: A accept, B back).
//   play     FIRST PERSON, full screen, the HUD away (inCutscene), the world held (enemies paused, nothing hurts
//            him): the gallery, every piece of the set its own (galleryArt.ts pieceDefs). First (ready) Dooley's rules,
//            calm ("IT'S REAL SIMPLE, SONNY."), then 3, 2, 1, GO!: no crosshair, no shots, the clock stopped till GO;
//            the hand round the gun (first person, from just behind) slides after the cursor. The cursor: the stick or
//            the d-pad (or the arrow keys); the mouse moves it straight to where it is. Fire (X or RT; the left mouse
//            button): his ray gun (his left arm, the gun turned at the cursor, recoiling) zaps; whatever's under the
//            cursor is DISINTEGRATED (lit pink, then eaten away from the side the beam came in, the bits blowing off),
//            gone for good: ducks, bandits (their boots left smoking on the fence), bottles, prizes, the moon, the
//            wheel, the score board, the rails (the ducks on a gone stretch drop off), the shelves (what's on them
//            falls), the fence, the posts, the awning's scallops, the sign, the counter, the backdrop's panels, the
//            plywood behind them, till there's nothing but the void. 50 seconds (shown). Dooley's gross-up in the
//            corner and his running reaction (one line at a time, never over anybody): confused, then irritated, then
//            existential (OH GOD, THEY NO LONGER EXIST.), by how much of the set is gone; a word for the moon, the sky,
//            the void, the counter... The SCORE board counts like a real one, then goes wrong as things stop existing
//            (wrong digits, question marks, ??!?), and can be zapped like the rest. There's no winning: the score
//            means nothing.
//   over     time's up, or there's nothing left: back to the street (the booth as wrecked as the gallery got).
//   beat     a short non-interactive beat (no HUD, no controls): Dooley out front, his panic attack, chewing him out
//            (his first line by how much he lost), Meathead's "so do I get a prize?".
//   panic    control back, the HUD back: Dooley's a person now (the kind below: a killable townsman who never hurts
//            him), pacing, clutching his head, hyperventilating, still ranting (plain words over his head, one line
//            at a time). Kill him any way at all: the CHARGE SHARD drops out of him. He's terrified of the ray gun:
//            out and on him (or a bolt by him), he cowers, backing off, begging (NOT THE GUN!). How he goes (the
//            owner's, 2026-11-02):
//              the ray gun   one shot: erase. No control, no HUD, nothing can touch Meathead; the camera pushes in and
//                            he's eaten away slowly from the edges in (his legs first, his screaming head last), his
//                            last words thrown back and fading, fading, fading (an echo on the voice, the words with
//                            it); back out, the shard where he stood. "NOW YOU NO LONGER EXIST."
//              the stunt car crushed, the car's own way, nothing said.
//              any other special weapon  misses him, always (he's `innocent` to them while one's out and Meathead's
//                            not right on him); the near miss scares him into a heart attack: he clutches his chest
//                            and keels over, thanking him for a real death. One near miss is enough.
//              hands, charges, grabs  land as on anybody; a kill's a plain death, and the same thanks.
//   dead     the shard lying in the street till it's picked up: the card (the explain screens' buffer), and it's his
//            for good (the save: one a save). After that the booth stays wrecked and empty.
//
// Nothing erased at all when the time's up (never fired, or never hit anything): the lazy fail (no meltdown, no
// shard; a short scene at the booth, then talk to him to go again). Anything erased wins it, when the time's up or
// there's nothing left. There's no backing out once it's on (no QUIT MINIGAME: the punchline).
//
// The set holds itself up: what rests on a shelf, a rail, the fence, the wall falls when that goes, onto whatever's
// under it (and on again if that goes), and can be shot where it lands; the small stuff erases in one hit, bigger pieces
// take a good few (TOUGH), worn as they go.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { NO_CONTROLS, getLastInputDevice } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, isTalking, say, cutVoice, cancelSpeech, speak as speakLine, MEATHEAD_VOICE } from '../../../m1/game/platform/speech';
import type { ClipEcho } from '../../../m1/game/platform/voiceclips';
import { rayGun } from '../../../m1/game/combat/rayGun';
import { getActiveGamepad, getGamepadMovement } from '../../../m1/game/platform/gamepad';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerM2Kind } from '../../kinds';
import { setUi } from '../../store';
import { awardShard, shardWon as wonShard, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { onFloorish, upStart } from '../../upZone';
import { minigamePausable } from '../../minigamePause';
import { walkOff, walkOffDue, type WalkOff } from '../../walkOffCall';
import type { GameCue } from '../../music/moments';
import { reaction, moodOf, frameOf, type Pose } from '../../spooky/costume';
import { meatheadSays, speak, voice, byPants, saidOver, label, box, ledge, type Said } from '../section';
import type { ByPants } from '../talk';
import { GY } from '../geometry';
import { X } from './layout';
import { townOf, type Town } from './state';
import {
  ART_W, ART_H, FENCE_Y, RAIL_A, RAIL_C, DUCK_W, BANDIT_H, HAND_W, HAND_H, HAND_PIVOT, HAND_MUZZLE, BOOTH_W, COUNTER_H, DOOLEY_SEED,
  bake, pinkOf, paintVoid, drawVisor, paintGunHand, pieceDefs, dooleyBust, drawBoothBack, drawBoothFront, drawDooleyAt, drawDooleyKind, drawShard,
  type PieceDef, type DooleyLook,
} from './galleryArt';
import {
  DOOLEY_VOICE, DOOLEY_CALM_VOICE, DOOLEY_GREET, DOOLEY_LEAVE, DOOLEY_LEAVE_PANIC, DOOLEY_OFFER, DOOLEY_DECLINED, DOOLEY_NOT_NOW, DOOLEY_RULES_A, DOOLEY_RULES_B, DOOLEY_IDLE, DOOLEY_TIERS, DOOLEY_SAW,
  DOOLEY_OPEN_SMALL, DOOLEY_OPEN_BIG, DOOLEY_OPEN_ALL, DOOLEY_PANIC, DOOLEY_MUTTER, DOOLEY_GUN, DOOLEY_ERASED, DOOLEY_THANKS,
  DOOLEY_LAZY_A, DOOLEY_LAZY_B, DOOLEY_LAZY_C, DOOLEY_RETRY, MH_ACCEPT, MH_PRIZE, MH_KILL, MH_ERASE, MH_LAZY, MH_SHARD,
} from './galleryLines';

type Ctx = CanvasRenderingContext2D;

/** stageMemo: the gallery played this attempt (how much of it went: '0'..'1'); Dooley dead (where his shard lies, or
 *  'taken'). The shard itself: the save's collectibles (one a save). */
export const GALLERY_MEMO = 'fr-gallery', GALLERY_DEAD = 'fr-gallery-dead';
export const SHARD_LAND = 'frontier', SHARD_ID = 'shard-gallery';
const shardWon = () => wonShard(SHARD_LAND, SHARD_ID);

/** The booth: its left at the play plane, the counter's ledge, where Dooley stands behind it. */
export const BOOTH = { a: X(3484), b: X(3484) + BOOTH_W, man: X(3570) } as const;
/** Frames: the gallery's time, the fades, the end card, the card's buffer; the beat's longest. */
const TIME = 3000, FADE = 18, OVER_T = 70, BEAT_MAX = 1200, TIPS_T = 300;
/** The start (the owner's, 2026-11-02: "make sure the guy speaks for a bit, give a countdown, then you can start
 *  shooting"): his rules (calm), a breath, then 3, 2, 1 (CD_STEP frames each), GO! (shown GO_T into the play); the rules
 *  given up on after READY_MAX. His lines in the play: CALM_GAP frames of quiet after one ends before the next,
 *  REPEAT_GAP before another of the same tier (the owner's: "he speaks too frantically"). */
const CD_STEP = 50, CD_LEAD = 30, GO_T = 45, READY_MAX = 900, CALM_GAP = 110, REPEAT_GAP = 240;
/** The disintegration: lit up first, then eaten away. */
const VH = 8, VG = 22;
/** How much has to be gone for each tier of his reaction (1..5), and the score board's going wrong. */
const TIERS = [0.001, 0.12, 0.3, 0.55, 0.8];
const VALUE: Partial<Record<PieceDef['kind'], number>> = { duck: 100, bandit: 250, bottle: 50, moon: 1000, wheel: 500, prize: 300 };
/** Ray hits to erase, by size (the owner's: "larger support structures take more ray gun bullets to disintegrate than
 *  smaller ones. quite a bit more"): the small stuff one; anything else 1. */
const TOUGH: Partial<Record<PieceDef['kind'], number>> = {
  score: 4, wheel: 5, pshelf: 4, bshelf: 4, rail: 5, scallop: 6, sign: 8, crail: 9, fence: 10, plank: 15, post: 18, panel: 20, counter: 22,
};
/** What things rest on (falling things land on them), and what has to be erased whole before it stops holding. */
const SURFACE = new Set<PieceDef['kind']>(['rail', 'pshelf', 'bshelf', 'fence', 'crail', 'counter']);

type Phase = 'idle' | 'offer' | 'ask' | 'fadeIn' | 'ready' | 'play' | 'over' | 'fadeOut' | 'lazy' | 'beat' | 'panic' | 'erase' | 'heart' | 'dead' | 'card' | 'done';
interface Piece extends PieceDef {
  cv: HTMLCanvasElement | null; pk: HTMLCanvasElement | null;
  x0: number; y0: number;
  /** Still there to be drawn; counted gone (hit, or falling); frames into its disintegration (-1: not hit); the side
   *  the beam came in; falling (off a gone rail or shelf). */
  alive: boolean; gone: boolean; vt: number; dir: 1 | -1; vy: number; falling: boolean;
  /** (the wheel, the lantern) Its turn when it was hit (it goes as it was). */
  rot: number;
  /** Ray hits it takes to go (by size: TOUGH), hits taken; lit up from the last hit (frames); the pocks eaten out of it
   *  where it's been hit (local art px); come to rest where it fell (shootable there); what it counts for (its size). */
  hp: number; hits: number; flash: number; pocks: { x: number; y: number; r: number }[]; landed: boolean; wt: number;
}
interface Bit { x: number; y: number; vx: number; vy: number; life: number; col: string; s: number }
/** Erased by the ray gun (the cutscene): where, frames in, frames into the camera's way back out; him baked (two
 *  frames, and lit pink); his last words (when they started (-1: not yet), how long, when the echo's rung out). */
interface Erase { x: number; face: 1 | -1; t: number; out: number; cv: HTMLCanvasElement[]; pk: HTMLCanvasElement[]; said: { text: string; at: number; ms: number; end: number } | null }
/** The heart attack: where, which way he's falling, frames in; him clutching his chest (two frames), and dead. */
interface Fall { x: number; face: 1 | -1; t: number; cv: HTMLCanvasElement[]; dead: HTMLCanvasElement }
interface Gallery {
  phase: Phase; t: number;
  ask: Ask | null;
  /** How wrecked the booth's drawn (0..3), how much of the gallery went (0..1). */
  lvl: number; gone: number;
  ledge: Block | null;
  /** Dooley: the person (once he can be killed), where he stands otherwise, his words; greeted yet. */
  man: Enemy | null; manX: number; manFace: 1 | -1;
  talk: Said | null; mh: Said | null; lastLine: number; greeted: boolean; upLatch: boolean; upBuf?: number;
  /** The gallery. */
  pieces: Piece[]; baked: number; voidCv: HTMLCanvasElement | null;
  /** The hand round the gun: at rest, firing. */
  gunCv: [HTMLCanvasElement, HTMLCanvasElement] | null;
  /** The start: his rules said (then the countdown); frames into the countdown (-1: not yet). */
  rulesDone: boolean; cd: number;
  cur: { x: number; y: number }; held: boolean; cool: number; recoil: number; aimSpd: number;
  bolt: { x0: number; y0: number; x1: number; y1: number; t: number } | null;
  bits: Bit[]; boots: { x: number; y: number }[];
  score: number; time: number; lastShot: number; tier: number; said: number; sawQ: string[]; sawDone: Set<string>; idleSaid: boolean;
  from: { x: number; y: number };
  shard: { x: number; y: number; vy: number } | null;
  card: ShardCard | null;
  bustK: number;
  /** Built into the panic (a death, a checkpoint after the gallery this attempt): he mutters first. */
  rebuilt: boolean;
  /** Calling after him as he walks off out of sight (walkOffCall.ts). */
  leave: WalkOff;
  /** The ray gun on him: frames of terror left, when he last broke off a line for it; his health last frame, a ray
   *  bolt by him last frame (the hit that left him standing: the ray's one shot is the end of him all the same); the
   *  shoot cooldown last frame (a special weapon fired), frames till a near miss drops him. */
  terror: number; gunCut: number; hp: number; rayNear: boolean; rayHit: boolean; lastCool: number; scare: number;
  /** Things erased this round (none at the end: the lazy fail); failed lazy this visit (his retry offer); the
   *  participation sticker on him (the lazy fail's scene). */
  erasedN: number; lazy: boolean; sticker: boolean;
  erase: Erase | null; fall: Fall | null;
  /** Where his words go once he's not a person any more (dying). */
  wordsAt: { x: number; y: number } | null;
}
const ALL = new WeakMap<Town, Gallery>();
const gal = (state: GameState) => ALL.get(townOf(state)) ?? null;

// ---------------------------------------------------------------------------------------------------------------
// The mouse (keyboard and mouse players aim with it: where it is on the game's canvas, in its 800 x 600)

let mouse = { x: 400, y: 300, moved: false };
let canvasEl: HTMLCanvasElement | null = null;
const gameCanvas = () => {
  if (canvasEl && canvasEl.isConnected) return canvasEl;
  let best: HTMLCanvasElement | null = null, area = 0;
  document.querySelectorAll('canvas').forEach(c => { const r = c.getBoundingClientRect(), a = r.width * r.height; if (a > area && Math.abs(r.width / Math.max(1, r.height) - 4 / 3) < 0.05) { area = a; best = c; } });
  canvasEl = best;
  return best as HTMLCanvasElement | null;
};
if (typeof window !== 'undefined') window.addEventListener('mousemove', e => {
  const cv = gameCanvas();
  if (!cv) return;
  const r = cv.getBoundingClientRect();
  mouse = { x: ((e.clientX - r.left) / r.width) * CANVAS_WIDTH, y: ((e.clientY - r.top) / r.height) * CANVAS_HEIGHT, moved: true };
});

// ---------------------------------------------------------------------------------------------------------------
// Speech

/** Dooley says it (queued: never over anybody); his words shown while it's said (the gallery's corner, or over him). */
const dooley = (g: Gallery, state: GameState, pool: ByPants, onDone?: () => void, voiceId = DOOLEY_VOICE) => {
  g.lastLine = state.frame;
  // (the quiet after a line counted from when it ends)
  speak(voiceId, pickLine(byPants(state, pool)), s => { g.talk = s; if (!s) g.lastLine = state.frame; }, true, onDone);
};
/** Meathead in the gallery (his words low on the screen: he's not in view). */
const mhSays = (g: Gallery, state: GameState, pool: ByPants) => {
  const s = { text: pickLine(byPants(state, pool)) };
  const shown = say(s.text, MEATHEAD_VOICE, 'queue', {
    always: true,
    onShow: spoken => { g.mh = s; if (!spoken) setTimeout(() => { if (g.mh === s) g.mh = null; }, Math.max(1800, s.text.length * 70)); },
    onHide: () => { if (g.mh === s) g.mh = null; },
    onDropped: () => { if (g.mh === s) g.mh = null; },
  });
  void shown;
};

// ---------------------------------------------------------------------------------------------------------------
// Dooley, the person (after the gallery: killable, harmless)

const DOOLEY_KIND = 'm2:fr_dooley';
/** Where he's pacing to. */
const GOAL = new WeakMap<Enemy, number>();
/** Cowering from the ray gun till this frame (gallery.ts's say, each frame it's on him). */
const TERROR = new WeakMap<Enemy, number>();
const lookOfAi = (e: Enemy): DooleyLook => (e.aiState === 'point' ? 'point' : e.aiState === 'gasp' ? 'gasp' : 'panic');
registerM2Kind({
  kind: DOOLEY_KIND, stats: { w: 42, h: 76, hp: 20, contact: 0, mass: 200 }, humanoid: true, gender: 'm', head: { x: 1, y: -70, r: 11 }, pathing: false,
  ai: (ctx, e) => {
    const { state } = ctx, p = state.player, pm = p.pos.x + p.width / 2, m = e.pos.x + e.width / 2;
    // (his body never hurts him: he's having a panic attack, not a fight)
    e.trippedUntil = state.frame + 2;
    // (the ray gun on him: cowering, facing it, backing off (not far from his booth))
    if ((TERROR.get(e) ?? 0) > state.frame) {
      e.aiState = 'cower'; e.facing = pm < m ? -1 : 1;
      const away = pm < m ? 1 : -1, nx = m + away * 4;
      e.vel.x = nx > BOOTH.a - 220 && nx < BOOTH.b + 220 ? away * 0.9 : 0;
      return false;
    }
    if (e.aiState === 'cower') { e.aiState = 'pace'; e.aiTimer = 0; }
    e.aiTimer = (e.aiTimer || 0) + 1;
    const s = e.aiState || 'pace';
    if (s === 'pace') {
      const goal = GOAL.get(e) ?? (BOOTH.a - 30);
      const d = goal - m;
      e.facing = d < 0 ? -1 : 1;
      e.vel.x = Math.abs(d) < 8 ? 0 : Math.sign(d) * 1.7;
      if (Math.abs(pm - m) < 64) e.vel.x = (pm < m ? 1 : -1) * 2.2;
      if (Math.abs(d) < 8 || e.aiTimer > 200) {
        GOAL.set(e, m < (BOOTH.a + BOOTH.b) / 2 ? BOOTH.b + 40 + Math.random() * 40 : BOOTH.a - 40 - Math.random() * 40);
        e.aiState = ['point', 'gasp', 'panic'][Math.floor(Math.random() * 3)]; e.aiTimer = 0; e.vel.x = 0;
      }
    } else {
      e.vel.x = 0; e.facing = pm < m ? -1 : 1;
      if (e.aiTimer > 70 + Math.random() * 60) { e.aiState = 'pace'; e.aiTimer = 0; }
    }
    return false;
  },
  draw: (c, e, f) => {
    const r = reaction(e), walk = Math.abs(e.vel.x) > 0.3;
    const pose: Pose = r?.pose ?? (walk ? 'walk' : 'stand');
    const F = frameOf(DOOLEY_SEED, f, pose, r?.md ?? moodOf(e), 0, false, lookOfAi(e));
    if (!r && !walk) F.fr = Math.floor(f / 7) % 2;
    // (cowering: shaking)
    const jit = e.aiState === 'cower' ? (f % 4 < 2 ? 1 : -1) : 0;
    if (jit) c.translate(jit, 0);
    drawDooleyKind(c, F);
    if (jit) c.translate(-jit, 0);
  },
});

// ---------------------------------------------------------------------------------------------------------------
// Building (with the town, every death)

const lvlOf = (gone: number) => (gone <= 0 ? 0 : gone < 0.35 ? 1 : gone < 0.999 ? 2 : 3);
export const buildGallery = (state: GameState) => {
  const old = ALL.get(townOf(state));
  if (old?.ask) closeAsk();
  if (old?.card) closeShardCard();
  if (old && old.phase !== 'idle') setUi({ chordTips: null });
  const memo = state.stageMemo[GALLERY_MEMO], dead = state.stageMemo[GALLERY_DEAD];
  const gone = memo !== undefined ? Math.max(0, Math.min(1, Number(memo) || 0)) : 0;
  const g: Gallery = {
    phase: 'idle', t: 0, ask: null, lvl: lvlOf(gone), gone, ledge: null,
    man: null, manX: BOOTH.man, manFace: -1, talk: null, mh: null, lastLine: -9999, greeted: false, upLatch: true, leave: walkOff(),
    pieces: [], baked: 0, voidCv: null, gunCv: null, rulesDone: false, cd: -1, cur: { x: 400, y: 260 }, held: true, cool: 0, recoil: 0, aimSpd: 0, bolt: null,
    bits: [], boots: [], score: 0, time: TIME, lastShot: 0, tier: 0, said: 0, sawQ: [], sawDone: new Set(), idleSaid: false,
    from: { x: 0, y: 0 }, shard: null, card: null, bustK: 0, rebuilt: false,
    erasedN: 0, lazy: false, sticker: false,
    terror: 0, gunCut: -9999, hp: 0, rayNear: false, rayHit: false, lastCool: 0, scare: 0, erase: null, fall: null, wordsAt: null,
  };
  ALL.set(townOf(state), g);
  if (shardWon()) { g.phase = 'done'; g.lvl = g.lvl === 3 ? 3 : 2; }
  else if (dead !== undefined) {
    g.phase = 'dead';
    if (dead !== 'taken') g.shard = { x: Number(dead) || BOOTH.b + 30, y: GY - 16, vy: 0 };
  } else if (memo !== undefined) { g.phase = 'panic'; g.rebuilt = true; spawnMan(state, g, BOOTH.b + 30); }
  if (g.lvl < 3) g.ledge = ledge(state, BOOTH.a + 4, GY - COUNTER_H, BOOTH_W - 8, { hidden: true });
};

const spawnMan = (state: GameState, g: Gallery, x: number) => {
  const e = makeKindEnemy(DOOLEY_KIND as EnemyKind, x - 21, GY - 76);
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.facing = -1; e.aiState = 'panic'; e.aiTimer = 0;
  state.enemies.push(e);
  g.man = e; g.hp = e.health;
};

// ---------------------------------------------------------------------------------------------------------------
// The gallery's pieces

const bakeSome = (g: Gallery, n: number) => {
  if (!g.pieces.length) g.pieces = pieceDefs().map(d => ({ ...d, cv: null, pk: null, x0: d.x, y0: d.y, alive: true, gone: false, vt: -1, dir: 1, vy: 0, falling: false, rot: 0,
    hp: TOUGH[d.kind] ?? 1, hits: 0, flash: 0, pocks: [], landed: false, wt: Math.sqrt(d.w * d.h) }));
  if (!g.voidCv) { g.voidCv = bake(ART_W, ART_H, paintVoid); n--; }
  if (!g.gunCv) { g.gunCv = [bake(HAND_W, HAND_H, paintGunHand(false)), bake(HAND_W, HAND_H, paintGunHand(true))]; n--; }
  for (; n > 0 && g.baked < g.pieces.length; n--, g.baked++) {
    const p = g.pieces[g.baked];
    p.cv = bake(p.w, p.h, p.paint); p.pk = pinkOf(p.cv);
  }
};
const fresh = (g: Gallery) => {
  for (const p of g.pieces) { p.x = p.x0; p.y = p.y0; p.alive = true; p.gone = false; p.vt = -1; p.vy = 0; p.falling = false; p.landed = false; p.hits = 0; p.flash = 0; p.pocks = []; p.rot = 0; }
  g.erasedN = 0;
  g.bits = []; g.boots = []; g.score = 0; g.time = TIME; g.tier = 0; g.said = 0; g.sawQ = []; g.sawDone.clear(); g.idleSaid = false; g.lastShot = 0; g.rulesDone = false; g.cd = -1;
  g.cur = { x: 400, y: 250 }; mouse.moved = false; g.held = true; g.cool = 10; g.recoil = 0; g.bolt = null; g.aimSpd = 0;
};
const byId = (g: Gallery, id: string) => g.pieces.find(p => p.id === id);
/** How much of the set's gone (bigger pieces counting for more: by the square root of their size). */
const goneFrac = (g: Gallery) => { let all = 0, gone = 0; for (const p of g.pieces) { all += p.wt; if (p.gone) gone += p.wt; } return all ? gone / all : 0; };

/** Where a piece is this frame (moving ones), and whether it can be hit there. */
const placeOf = (g: Gallery, p: Piece, t: number): { x: number; y: number; on: boolean; rot?: number } => {
  // (fallen, or falling: where it is, as it was)
  if (p.falling || p.landed) return { x: p.x, y: p.y, on: true, rot: p.rot };
  switch (p.kind) {
    case 'duck': {
      const dir = p.row ? -1 : 1, sp = p.row ? 1.05 : 0.85;
      const span = 360, base = (p.x0 - 20 + dir * t * sp) % span;
      const x = 20 - DUCK_W + ((base + span) % span);
      return { x, y: p.y, on: x > 12 && x < 380 };
    }
    case 'bandit': {
      const per = 260, ph = (t + p.i * 87) % per, up = ph < 30 ? ph / 30 : ph < 150 ? 1 : ph < 180 ? 1 - (ph - 150) / 30 : 0;
      return { x: p.x, y: p.y0 + (1 - up) * (BANDIT_H - 2), on: up > 0.5 };
    }
    case 'moon': {
      const k = ((t * 0.0018) + 0.15) % 1, x = 30 + k * 330;
      return { x, y: 34 + 24 * (1 - Math.sin(Math.PI * k)), on: true };
    }
    case 'wheel': return { x: p.x, y: p.y, on: true, rot: t * 0.035 };
    case 'lantern': return { x: p.x, y: p.y, on: true, rot: Math.sin(t * 0.05) * 0.18 };
    default: return { x: p.x, y: p.y, on: true };
  }
};
const hitOf = (g: Gallery, p: Piece, ax: number, ay: number, t: number) => {
  const q = placeOf(g, p, t);
  if (!q.on) return false;
  if (p.kind === 'wheel') return Math.hypot(ax - (q.x + 24), ay - (q.y + 24)) < 23;
  if (p.kind === 'moon') return Math.hypot(ax - (q.x + 13), ay - (q.y + 13)) < 14 || (ax > q.x + 10 && ax < q.x + 16 && ay > q.y + 22 && ay < q.y + 44);
  if (p.kind === 'scallop') return ax >= q.x && ax < q.x + p.w && ay >= q.y && ay < q.y + 16 + Math.sqrt(Math.max(0, 625 - (ax - q.x - 25) ** 2));
  if (p.kind === 'bandit' && !p.landed && ay > FENCE_Y + 4) return false;
  return ax >= q.x && ax < q.x + p.w && ay >= q.y && ay < q.y + p.h;
};

const tierOf = (gone: number) => { let k = 0; for (let i = 0; i < TIERS.length; i++) if (gone >= TIERS[i]) k = i + 1; return k; };

const zap = (state: GameState, g: Gallery, p: Piece, fromX: number) => {
  const t = g.t;
  const q = placeOf(g, p, t);
  p.x = q.x; p.y = q.y; p.rot = q.rot ?? 0; // (frozen where it was hit)
  p.vt = 0; p.gone = true; p.falling = false; p.dir = fromX <= q.x + p.w / 2 ? 1 : -1;
  g.score += VALUE[p.kind] ?? 10; g.erasedN++;
  playSound('rayFizzle', 0.8, Math.random() * 4 - 2);
  // (a word for some of them, once each)
  const saw = p.kind === 'moon' ? 'moon' : p.kind === 'panel' ? 'sky' : p.kind === 'plank' ? 'void' : p.kind === 'counter' ? 'counter' : p.kind === 'score' ? 'score' : p.kind === 'bandit' ? 'bandit' : p.kind === 'prize' ? 'prize' : null;
  if (saw && !g.sawDone.has(saw)) { g.sawDone.add(saw); g.sawQ = [saw]; }
  if (p.kind === 'bandit') g.boots.push({ x: q.x + 3, y: FENCE_Y - 4 });
  void state;
};

/** Standing, not falling or going: holds things up. */
const solid = (q: Piece) => q.alive && !q.gone && !q.falling && q.vt < 0;
/** One that's still where it was built (not fallen anywhere). */
const held = (g: Gallery, id: string) => { const q = byId(g, id); return !!q && solid(q) && !q.landed; };
/** Is it still held up? Where it was built: by what it was built on (the ducks their stretch of rail, the bottles and
 *  prizes their shelves, the bandits the fence, the wheel, the board and the shelves the wall behind them, the lantern
 *  its post, the sign the awning, the rails and the fence the posts). Fallen: by whatever it landed on. */
const supported = (g: Gallery, p: Piece): boolean => {
  if (p.landed) return g.pieces.some(q => q !== p && SURFACE.has(q.kind) && solid(q) && Math.abs(q.y - (p.y + p.h)) <= 3 && p.x + p.w / 2 >= q.x && p.x + p.w / 2 <= q.x + q.w);
  const over = (k: (q: Piece) => boolean) => g.pieces.some(q => q !== p && k(q) && solid(q) && !q.landed && q.x < p.x + p.w && q.x + q.w > p.x);
  switch (p.kind) {
    case 'duck': {
      const q = placeOf(g, p, g.t);
      if (!q.on) return true;
      const seg = Math.max(0, Math.min(2, Math.floor((q.x + DUCK_W / 2 - 20) / 120)));
      return held(g, `rail${p.row ?? 0}${seg}`);
    }
    case 'bottle': return held(g, 'bshelf');
    case 'prize': return held(g, 'pshelf');
    case 'bandit': return held(g, 'fence');
    case 'lantern': return held(g, 'postL');
    case 'wheel': case 'score': case 'pshelf': case 'bshelf': return over(q => q.kind === 'plank' || q.kind === 'panel');
    case 'sign': return over(q => q.kind === 'scallop');
    case 'rail': case 'fence': return held(g, 'postL') || held(g, 'postR');
    case 'crail': return held(g, 'postL') || held(g, 'postR') || g.pieces.some(q => q.kind === 'counter' && solid(q));
    default: return true;
  }
};
/** What's lost what held it up falls (the owner's: "if a shelf that housed an obstacle is obliterated, the obstacles on
 *  the shelf fall on the floor"), down to the next thing under it, or the counter; and again if that goes later. */
const drops = (g: Gallery) => {
  for (const p of g.pieces) {
    if (!p.alive || p.gone || p.falling || p.vt >= 0 || supported(g, p)) continue;
    const q = placeOf(g, p, g.t);
    p.x = q.x; p.y = q.y; p.rot = q.rot ?? p.rot; p.landed = false; p.falling = true; p.vy = p.kind === 'duck' ? -1 : 0;
  }
};
/** A frame of something falling: down onto whatever's under it (a little bounce, a clatter), or out the bottom. */
const fallStep = (g: Gallery, pc: Piece) => {
  const prevB = pc.y + pc.h;
  pc.vy = Math.min(9, pc.vy + 0.35); pc.y += pc.vy;
  const cx = pc.x + pc.w / 2, nb = pc.y + pc.h;
  if (pc.vy > 0) for (const q of g.pieces) {
    if (q === pc || !SURFACE.has(q.kind) || !solid(q) || cx < q.x || cx > q.x + q.w || prevB > q.y + 1 || nb < q.y) continue;
    pc.y = q.y - pc.h;
    if (pc.vy > 3) pc.vy = -pc.vy * 0.3;
    else { pc.vy = 0; pc.falling = false; pc.landed = true; }
    playSound(pc.kind === 'bottle' ? 'glass' : 'clang', pc.kind === 'bottle' ? 0.3 : 0.5, 2 + Math.random() * 4);
    for (let n = 0; n < 4; n++) bit(g, cx, q.y, n % 2 ? '#A8A29E' : '#57534E', 1.4);
    return;
  }
  if (pc.y > ART_H + 10) { pc.alive = false; pc.gone = true; pc.falling = false; }
};

const bit = (g: Gallery, x: number, y: number, col: string, sp = 2.4, s = 1) => {
  if (g.bits.length > 420) g.bits.shift();
  g.bits.push({ x, y, vx: (Math.random() - 0.5) * sp, vy: -Math.random() * sp - 0.3, life: 18 + Math.random() * 22, col, s });
};
const VAPOR = ['#FF8CE4', '#FFFFFF', '#EC44C4', '#A8A29E', '#FFD8F6', '#57534E'];
/** The eaten edge's x for a piece (art px, local to its left), t frames into going. */
const edgeX = (p: Piece) => { const k = Math.max(0, Math.min(1, (p.vt - VH) / VG)); return p.dir > 0 ? -6 + k * (p.w + 12) : p.w + 6 - k * (p.w + 12); };

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const hostileNear = (state: GameState, g: Gallery) => state.enemies.some(e => e !== g.man && e.health > 0 && !e.isBlownAway && !e.innocent && !e.harmless && e.kind !== 'm2:fr_tntcrate'
  && Math.abs(e.pos.x + e.width / 2 - (BOOTH.a + BOOTH.b) / 2) < 560 && Math.abs(e.pos.y + e.height - GY) < 300);
const holdWorld = (state: GameState, g: Gallery) => {
  for (const e of state.enemies) if (e !== g.man) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2);
  state.projectiles = state.projectiles.filter(q => q.owner !== 'enemy');
  state.player.untouchable = true;
};
const releaseWorld = (state: GameState) => { state.player.untouchable = false; state.player.inCutscene = false; };

/** The gallery's say over the controls (null: it's not on, pass them on). Also the TALK prompt and the shard. */
export const updateGallery = (ctx: FrameContext, controls: Controls, out: Controls): Controls => {
  const { state } = ctx, g = gal(state);
  if (!g) return out;
  const p = state.player, pm = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  g.t++;
  if (!controls.up) g.upLatch = false;
  const upIn = !!controls.up && !g.upLatch;
  if (upIn) g.upLatch = true;
  // (UP's zone: the whole booth and a good step either side, on the floor, up on the counter, or hopping (the owner's,
  // 2026-11-02: "i really don't want players to miss it. same for all"): upZone.ts)
  const near = pm > BOOTH.a - 36 && pm < BOOTH.b + 36 && onFloorish(feet, GY, COUNTER_H + 12);
  const free = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;

  switch (g.phase) {
    case 'idle': {
      g.manFace = pm < BOOTH.man ? -1 : 1;
      if (!g.greeted && free && Math.abs(pm - BOOTH.man) < 380 && !isTalking()) { g.greeted = true; g.lastLine = state.frame; speak(DOOLEY_VOICE, pickLine(byPants(state, DOOLEY_GREET)), s => { g.talk = s; }, false); }
      // (walked off out of sight after his greeting: once a leaving, "WHERE ARE YOU GOING? COME BACK!")
      if (walkOffDue(state, g.leave, BOOTH.man, g.greeted, !g.talk && state.frame - g.lastLine > 120)) {
        g.lastLine = state.frame; speak(DOOLEY_VOICE, pickLine(byPants(state, DOOLEY_LEAVE)), s => { g.talk = s; }, false);
      }
      if (near && free) setUi({ upPrompt: 'TALK' });
      if (upStart(g, upIn, near && free, p.isGrounded)) {
        if (hostileNear(state, g)) { if (!g.talk) dooley(g, state, DOOLEY_NOT_NOW); return { ...out, up: false }; }
        g.phase = 'offer'; g.t = 0; p.inCutscene = true; p.vel.x = 0;
        holdWorld(state, g);
        dooley(g, state, g.lazy ? DOOLEY_RETRY : DOOLEY_OFFER, () => { if (g.phase === 'offer' && gal(state) === g) { g.phase = 'ask'; g.ask = openAsk("DEAD-EYE DOOLEY'S SHOOTIN' GALLERY", "SHOOT THE TIN DUCKS. 50 SECONDS. EVERYBODY'S A WINNER. YOU'LL USE YOUR OWN GUN."); } });
        return { ...NO_CONTROLS };
      }
      return out;
    }
    case 'offer':
    case 'ask': {
      p.inCutscene = true; p.vel.x = 0;
      holdWorld(state, g);
      // (painting what the gallery needs while he's asked: a few pieces a frame, his faces one a frame)
      bakeSome(g, 4);
      if (g.bustK < 4) dooleyBust(g.bustK++);
      if (g.phase === 'offer') { if (g.t > 600) { g.phase = 'ask'; g.ask = openAsk("DEAD-EYE DOOLEY'S SHOOTIN' GALLERY", "SHOOT THE TIN DUCKS. 50 SECONDS. EVERYBODY'S A WINNER."); } return { ...NO_CONTROLS }; }
      const r = tickAsk(g.ask!, state.frame);
      if (r === 'wait') return { ...NO_CONTROLS };
      g.ask = null;
      if (r === 'back') { g.phase = 'idle'; releaseWorld(state); dooley(g, state, DOOLEY_DECLINED); g.upLatch = true; return { ...NO_CONTROLS }; }
      // (on: the world held, the gallery up)
      bakeSome(g, 999);
      while (g.bustK < 4) dooleyBust(g.bustK++);
      fresh(g);
      g.from = { x: p.pos.x, y: p.pos.y };
      g.phase = 'fadeIn'; g.t = 0;
      holdWorld(state, g);
      mhSays(g, state, MH_ACCEPT);
      // (his rules, calm and folksy, one line then the other: then the countdown)
      dooley(g, state, DOOLEY_RULES_A, () => {
        if (gal(state) !== g || (g.phase !== 'fadeIn' && g.phase !== 'ready')) return;
        dooley(g, state, DOOLEY_RULES_B, () => { if (gal(state) === g) g.rulesDone = true; }, DOOLEY_CALM_VOICE);
      }, DOOLEY_CALM_VOICE);
      playSound('menuok', 0.6);
      return { ...NO_CONTROLS };
    }
    case 'fadeIn': case 'ready': case 'play': case 'over': case 'fadeOut':
      runGallery(state, g, controls);
      // (first person, START pauses it, the pause menu showing its controls (minigamePause.ts); no QUIT MINIGAME: the
      // owner's "the one minigame you cannot 'back out of' because it would ruin the punchline")
      if (galleryOn(state)) minigamePausable(state, 'gallery', null);
      return { ...NO_CONTROLS };
    case 'beat': {
      p.inCutscene = true; p.vel.x = 0;
      holdWorld(state, g);
      if (g.t > BEAT_MAX) toPanic(state, g);
      return { ...NO_CONTROLS };
    }
    case 'lazy': {
      p.inCutscene = true; p.vel.x = 0;
      holdWorld(state, g);
      if (++g.t > BEAT_MAX + 600) lazyDone(state, g);
      return { ...NO_CONTROLS };
    }
    case 'panic': {
      const e = g.man;
      if (e) {
        // (the ray gun's one shot is the end of him: a hit that left him standing erases him all the same)
        if (e.health > 0 && e.health < g.hp && g.rayNear) { e.health = 0; g.rayHit = true; }
        g.hp = e.health;
      }
      if (e && (e.health <= 0 || e.isBlownAway || !state.enemies.includes(e))) { killed(state, g, e); return (g.phase as Phase) === 'erase' ? { ...NO_CONTROLS } : out; }
      if (e) {
        const em = e.pos.x + e.width / 2;
        // (the ray gun out and on him, or a bolt by him: he cowers, begging, the line he was on cut off for it (the
        // owner's: "he is really fucking frightened of the ray gun"))
        if (rayOut(state) && (aimedAt(state, e, 560) || rayNearMan(state, e, 160))) {
          if (g.terror <= 0 && state.frame - g.gunCut > 240) { g.gunCut = state.frame; cutVoice(DOOLEY_VOICE); g.talk = null; dooley(g, state, DOOLEY_GUN); }
          g.terror = 60;
        } else if (g.terror > 0) g.terror--;
        if (g.terror > 0) TERROR.set(e, state.frame + 2);
        g.rayNear = rayNearMan(state, e, 70);
        // (any other special weapon (bar the stunt car) misses him: their hits pass him by while one's out and he's
        // not right on him (hands, charges and grabs still land); a near miss scares him into a heart attack)
        const special = p.currentWeapon !== 'GUN' && p.currentWeapon !== 'STUNT_CAR' && !p.holstered;
        const close = Math.abs(pm - em) < 70 && Math.abs(feet - (e.pos.y + e.height)) < 60;
        e.innocent = special && !close;
        if (special && g.scare <= 0) {
          const fired = p.shootCooldown > g.lastCool;
          const whiz = state.projectiles.some(q => q.owner === 'player' && !q.isRay && q.custom !== 'STUNT_CAR' && byMan(q, e, 40));
          if (whiz || (fired && aimedAt(state, e, 460))) g.scare = whiz ? 6 : 14;
        }
        g.lastCool = p.shootCooldown;
        if (g.scare > 0 && --g.scare === 0) { heartAttack(state, g, e); return out; }
      }
      // (walked off out of sight from his panic attack: once a leaving, he yells after him, ahead of the next rant)
      if (e && walkOffDue(state, g.leave, e.pos.x + e.width / 2, true, !g.talk)) {
        g.lastLine = state.frame; speak(DOOLEY_VOICE, pickLine(byPants(state, DOOLEY_LEAVE_PANIC)), s => { g.talk = s; }, false);
      }
      // (still ranting, one line at a time, a breath between)
      if (e && !g.talk && !isTalking() && state.frame - g.lastLine > 50 && Math.abs(pm - (e.pos.x + e.width / 2)) < 900) {
        dooley(g, state, g.terror > 0 ? DOOLEY_GUN : g.rebuilt && g.said++ === 0 ? DOOLEY_MUTTER : DOOLEY_PANIC);
      }
      return out;
    }
    case 'erase': {
      const er = g.erase;
      if (!er) { g.phase = 'dead'; releaseWorld(state); return out; }
      // (no control, no HUD, nothing touches him: the camera's in on Dooley)
      p.inCutscene = true; p.vel.x = 0; p.noContactUntil = state.frame + 10;
      holdWorld(state, g);
      tickErase(state, g, er);
      return { ...NO_CONTROLS };
    }
    case 'heart': {
      const fl = g.fall;
      if (fl && ++fl.t === FALL_LAND) {
        playSound('thud', 0.7, -8);
        dropShard(state, g, Math.max(BOOTH.a - 80, Math.min(BOOTH.b + 80, fl.x + fl.face * 40)), GY - 30);
        meatheadSays(state, pickLine(byPants(state, MH_KILL)));
      }
      return out;
    }
    case 'dead': {
      const s = g.shard;
      if (s) {
        if (s.vy !== 0 || s.y < GY - 16) { s.vy += 0.4; s.y += s.vy; if (s.y >= GY - 16) { s.y = GY - 16; s.vy = 0; } }
        const touch = free && pm > s.x - 24 && pm < s.x + 24 && p.pos.y < s.y + 14 && feet > s.y - 14;
        if (touch) {
          // (his for good: the save's written there and then; the card (YOU GOT A CHARGE SHARD) with its buffer)
          g.shard = null; state.stageMemo[GALLERY_DEAD] = 'taken';
          if (awardShard(SHARD_LAND, SHARD_ID)) { g.phase = 'card'; g.card = openShardCard(); p.inCutscene = true; p.vel.x = 0; }
          else g.phase = 'done';
          return { ...NO_CONTROLS };
        }
      }
      return out;
    }
    case 'card': {
      p.inCutscene = true; p.vel.x = 0;
      // (the explain screens' buffer (shardAward.ts): held a while, every button let go once, then a fresh press)
      if (g.card && tickShardCard(g.card, state.frame)) {
        g.card = null; g.phase = 'done'; p.inCutscene = false;
        meatheadSays(state, pickLine(byPants(state, MH_SHARD)));
      }
      return { ...NO_CONTROLS };
    }
    default: return out;
  }
};

const toPanic = (state: GameState, g: Gallery) => {
  // (a stale callback, the town rebuilt under it since (a death): nothing)
  if (g.phase !== 'beat' || gal(state) !== g) return;
  g.phase = 'panic'; g.t = 0;
  releaseWorld(state);
  spawnMan(state, g, g.manX);
  if (g.man) { g.man.facing = g.manFace; g.man.aiState = 'point'; }
};

/** Dead: how decides what's next (the shard his whichever way: dropped where he went). */
const killed = (state: GameState, g: Gallery, e: Enemy) => {
  e.innocent = false;
  const x = Math.max(BOOTH.a - 80, Math.min(BOOTH.b + 80, e.pos.x + e.width / 2));
  // (the ray gun: not the engine's vaporizing, his own slow erasing, the camera in on it)
  const vi = state.enemyDeaths.findIndex(d => d.kind === 'vaporized' && (d.sprite?.kind as string | undefined) === DOOLEY_KIND);
  if (vi >= 0 || g.rayHit) {
    if (vi >= 0) state.enemyDeaths.splice(vi, 1);
    state.enemies = state.enemies.filter(o => o !== e);
    startErase(state, g, e, x);
    return;
  }
  cutVoice(DOOLEY_VOICE); g.talk = null;
  dropShard(state, g, x, Math.min(GY - 16, e.pos.y + e.height / 2));
  // (the stunt car: just crushed, nothing said (the owner's: "he just gets crushed and says nothing and dies"))
  if (state.projectiles.some(q => q.custom === 'STUNT_CAR')) return;
  thanks(state, g, x, GY - 70);
  meatheadSays(state, pickLine(byPants(state, MH_KILL)));
};
/** The shard out of him, where he went (his for good once it's picked up). */
const dropShard = (state: GameState, g: Gallery, x: number, y: number) => {
  g.shard = { x, y, vy: -5 };
  g.phase = 'dead'; g.man = null;
  state.stageMemo[GALLERY_DEAD] = String(Math.round(x));
  playSound('powerup', 0.5, 6);
};
/** A real death, a body left: he thanks him for it. */
const thanks = (state: GameState, g: Gallery, x: number, y: number) => {
  g.wordsAt = { x, y };
  speak(DOOLEY_VOICE, pickLine(byPants(state, DOOLEY_THANKS)), s => { g.talk = s; }, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The ray gun, to him

/** His last words thrown back: a repeat every 0.42 s, each 0.62 of the one before (about 4 dB down) and duller (a
 *  2.2 kHz low-pass in the loop), the repeats at 0.8; counted done 3.4 s after the line (about 7 repeats heard). */
const RAY_ECHO: ClipEcho = { delay: 0.42, feedback: 0.62, tone: 2200, wet: 0.8, tail: 3.4 };
const rayOut = (state: GameState) => { const p = state.player; return rayGun() && p.currentWeapon === 'GUN' && !p.holstered && p.health > 0; };
/** A projectile within `r` of him (and about his height). */
const byMan = (q: { pos: { x: number; y: number }; width: number; height: number }, e: Enemy, r: number) =>
  q.pos.x + q.width > e.pos.x - r && q.pos.x < e.pos.x + e.width + r && q.pos.y + q.height > e.pos.y - 40 && q.pos.y < e.pos.y + e.height + 20;
const rayNearMan = (state: GameState, e: Enemy, r: number) => state.projectiles.some(q => q.isRay && q.owner === 'player' && byMan(q, e, r));
/** Meathead facing him, within `far`, about level with him (the gun on him). */
const aimedAt = (state: GameState, e: Enemy, far: number) => {
  const p = state.player, pm = p.pos.x + p.width / 2, m = e.pos.x + e.width / 2, py = p.pos.y + p.height * 0.4;
  return Math.sign(m - pm) === p.facing && Math.abs(m - pm) < far && py > e.pos.y - 50 && py < e.pos.y + e.height + 30;
};

/** Him, baked once at 3x (looked at close in the push-in): `look` in frames 0 and 7 (his two panting frames). */
const ES = 3, DW = 140, DH = 144, DOX = 64, DOY = 140;
const bakeDooley = (look: DooleyLook, md: 'ok' | 'dead', frames = [0, 7]) =>
  frames.map(f => bake(DW * ES, DH * ES, c => { c.scale(ES, ES); drawDooleyAt(c, DOX, DOY, 1, look, f, false, undefined, md); }));
/** The erasing (frames): lit up pink and shaking, then eaten away (EAT_T), the push-in and the pull back out, the
 *  longest it waits on his echo; how far in; the eaten bands (art px) and how far either side of him he reaches. */
const LIT = 40, EAT_T = 280, EAT_END = LIT + EAT_T, ZIN = 36, ZOUT = 40, ER_MAX = 640, ER_Z = 1.75, BAND = 6, HALF_W = 48;
const smooth = (u: number) => u * u * (3 - 2 * u);
const eraseK = (er: Erase) => smooth(Math.min(1, er.t / ZIN)) * (1 - smooth(Math.min(1, er.out / ZOUT)));

const startErase = (state: GameState, g: Gallery, e: Enemy, x: number) => {
  cancelSpeech(); g.talk = null; g.mh = null;
  const cv = bakeDooley('panic', 'ok');
  g.erase = { x, face: e.facing ?? 1, t: 0, out: 0, cv, pk: cv.map(c => pinkOf(c)), said: null };
  g.man = null; g.phase = 'erase'; g.t = 0;
  playSound('alienBeam', 0.8, -10);
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.killSatisfactionTimer = 60;
  holdWorld(state, g);
};
/** What's left of him, frames in: a span a band, his legs going first and his screaming head last. */
const spansOf = (t: number) => {
  const out: { l: number; r: number; y: number }[] = [];
  const k = Math.max(0, Math.min(1, (t - LIT) / EAT_T)) ** 1.2;
  for (let y = 0, b = 0; y < DH; y += BAND, b++) {
    const kk = Math.min(1, k * (y < 95 ? 1 : 1.5)), wob = (1 - kk) * 7, half = HALF_W * (1 - kk);
    const l = DOX - half + Math.abs(Math.sin(b * 2.3 + t * 0.09)) * wob, r = DOX + half - Math.abs(Math.sin(b * 1.7 - t * 0.07)) * wob;
    if (r - l > 1) out.push({ l, r, y });
  }
  return out;
};
const sayErased = (state: GameState, er: Erase) => {
  const text = pickLine(byPants(state, DOOLEY_ERASED));
  const s = { text, at: -1, ms: 0, end: 0 };
  er.said = s;
  // (from when it's actually heard; not recorded: up its usual while, echo and all)
  const begin = (ms: number) => { if (s.at >= 0) return; s.at = state.frame; s.ms = ms; s.end = state.frame + ms * 0.06 + RAY_ECHO.tail * 60; };
  speakLine(text, voice(DOOLEY_VOICE), { echo: RAY_ECHO, onStart: ms => begin(ms ?? text.length * 70), onDone: () => begin(Math.max(1800, text.length * 70)) });
};
const tickErase = (state: GameState, g: Gallery, er: Erase) => {
  er.t++;
  if (er.t === 14) sayErased(state, er);
  if (er.t > LIT && er.t < EAT_END) {
    if (er.t % 18 === 0) playSound('rayFizzle', 0.5, -6 + Math.random() * 4);
    const spans = spansOf(er.t);
    for (let n = 0; n < 3 && spans.length; n++) {
      const sp = spans[Math.floor(Math.random() * spans.length)], left = Math.random() < 0.5, lx = left ? sp.l : sp.r;
      state.particles.push({ pos: { x: er.x + er.face * (lx - DOX), y: GY - DOY + sp.y + Math.random() * BAND }, vel: { x: er.face * (left ? -1 : 1) * (0.4 + Math.random() * 1.4), y: -0.4 - Math.random() * 1.4 }, life: 20 + Math.random() * 25, color: VAPOR[(er.t + n) % VAPOR.length], size: 1.5 + Math.random() * 2 });
    }
  }
  // (he's gone, and his echo's rung out (or it's waited long enough): the camera back out, then on)
  const heard = !!er.said && er.said.at >= 0 && state.frame >= er.said.end;
  if (er.t >= EAT_END && (heard || er.t >= ER_MAX) && ++er.out >= ZOUT) {
    g.erase = null;
    releaseWorld(state);
    dropShard(state, g, er.x, GY - 40);
    meatheadSays(state, pickLine(byPants(state, MH_ERASE)));
  }
};
/** The camera's push-in on him (index.ts, over the town's own zoom `base`): eased in, held, eased back out. */
export const galleryZoom = (state: GameState, base: number) => {
  const g = gal(state), er = g?.erase;
  if (!g || g.phase !== 'erase' || !er) return null;
  const k = eraseK(er), sc = base + (ER_Z - base) * k, cam = state.camera, fx = er.x, fy = GY - 56;
  // (where he'd be on screen at the town's zoom, slid to the middle as it pushes in)
  const tx0 = (fx - cam.x - CANVAS_WIDTH / 2) * base + CANVAS_WIDTH / 2, ty0 = (fy - cam.y - 300) * base + 300;
  const tx = tx0 + (CANVAS_WIDTH / 2 - tx0) * k, ty = ty0 + (330 - ty0) * k;
  return { scale: sc, x: fx, y: fy, shiftX: tx - (fx - cam.x), shiftY: ty - (fy - cam.y) };
};

// ---------------------------------------------------------------------------------------------------------------
// The heart attack (any other special weapon's near miss)

const FALL_CLUTCH = 40, FALL_LAND = 62;
const heartAttack = (state: GameState, g: Gallery, e: Enemy) => {
  e.innocent = false;
  const x = e.pos.x + e.width / 2;
  state.enemies = state.enemies.filter(o => o !== e);
  cutVoice(DOOLEY_VOICE); g.talk = null;
  g.fall = { x, face: e.facing ?? 1, t: 0, cv: bakeDooley('gasp', 'ok'), dead: bakeDooley('gasp', 'dead', [0])[0] };
  g.man = null; g.phase = 'heart';
  state.player.killSatisfactionTimer = 60;
  playSound('thud', 0.3, 8);
  thanks(state, g, x, GY - 84);
};

/** A frame of the gallery itself: the cursor, the gun, the pieces, the clock, his reaction; the fades either end. */
const runGallery = (state: GameState, g: Gallery, controls: Controls) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  holdWorld(state, g);
  // (the bits blowing off, the bolt fading, the recoil easing)
  for (const b of g.bits) { b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.life--; }
  g.bits = g.bits.filter(b => b.life > 0);
  if (g.bolt && --g.bolt.t <= 0) g.bolt = null;
  g.recoil *= 0.7; if (g.cool > 0) g.cool--;
  // (the pieces going: disintegrating, falling)
  for (const pc of g.pieces) {
    if (!pc.alive) continue;
    if (pc.vt >= 0) {
      pc.vt++;
      if (pc.vt > VH) { const ex = pc.x + edgeX(pc); for (let n = 0; n < 3; n++) bit(g, ex, pc.y + Math.random() * pc.h, VAPOR[(n + pc.vt) % VAPOR.length], 2.6); }
      if (pc.vt > VH + VG) { pc.alive = false; for (let n = 0; n < 8; n++) bit(g, pc.x + Math.random() * pc.w, pc.y + Math.random() * pc.h, n % 2 ? '#A8A29E' : '#57534E', 1.6); }
    } else if (pc.falling) fallStep(g, pc);
    if (pc.flash > 0) pc.flash--;
  }
  if (g.phase === 'fadeIn') { if (++g.t >= FADE) { g.phase = 'ready'; g.t = 0; } }
  else if (g.phase === 'ready') {
    // (no crosshair, no shooting, the clock stopped: his rules, a breath, 3, 2, 1, GO!)
    g.t++;
    if (g.cd < 0 && ((g.rulesDone && !g.talk) || g.t > READY_MAX)) g.cd = 0;
    if (g.cd >= 0) {
      const at = g.cd - CD_LEAD;
      if (at >= 0 && at % CD_STEP === 0 && at < CD_STEP * 3) playSound('beep', 0.8, 0);
      if (at >= CD_STEP * 3) { g.phase = 'play'; g.t = 0; g.cool = 0; playSound('beep', 0.9, 12); playSound('ding', 0.6, 0); }
      g.cd++;
    }
  }
  else if (g.phase === 'play') {
    g.t++; g.time--;
    // THE CURSOR: the stick or the d-pad, the arrow keys; the mouse straight to where it is
    const gp = getActiveGamepad(), mv = getGamepadMovement(gp, 0.18);
    let dx = mv.x, dy = mv.y;
    if (!dx) dx = mv.left ? -1 : mv.right ? 1 : 0;
    if (!dy) dy = mv.up ? -1 : mv.down ? 1 : 0;
    if (!dx) dx = controls.left ? -1 : controls.right ? 1 : 0;
    if (!dy) dy = controls.up ? -1 : controls.down ? 1 : 0;
    const mag = Math.min(1, Math.hypot(dx, dy));
    g.aimSpd = mag > 0 ? Math.min(11, g.aimSpd + 0.8) : 3;
    if (mag > 0) { const k = (g.aimSpd * mag) / (Math.hypot(dx, dy) || 1); g.cur.x += dx * k; g.cur.y += dy * k; }
    if (mouse.moved) { g.cur.x = mouse.x; g.cur.y = mouse.y; mouse.moved = false; }
    g.cur.x = Math.max(4, Math.min(CANVAS_WIDTH - 4, g.cur.x)); g.cur.y = Math.max(4, Math.min(CANVAS_HEIGHT - 4, g.cur.y));
    // FIRE: a press, or held (a steady zap)
    const fire = !!controls.shoot;
    if (fire && g.cool <= 0) shoot(state, g);
    g.held = fire;
    drops(g);
    // HIS REACTION: a tier by how much is gone; one line at a time, a breath between, never over anybody
    g.gone = goneFrac(g);
    g.tier = tierOf(g.gone);
    talkGallery(state, g);
    // (its buttons, the real ones, up top for its first few seconds (then out of the way of the top row))
    const kbm = getLastInputDevice() !== 'gamepad';
    setUi({ chordTips: g.t < TIPS_T ? [{ pad: ['LSTICK', 'DPAD'], join: '/', label: kbm ? 'AIM: MOVE THE MOUSE' : 'AIM' }, { pad: ['X', 'RT'], join: '/', mouse: 'left', label: 'FIRE' }] : null });
    const allGone = g.pieces.every(pc => !pc.alive);
    if (g.time <= 0 || allGone) { g.phase = 'over'; g.t = 0; playSound(allGone ? 'alienBeam' : 'ding', 0.7, allGone ? -8 : 0); }
  } else if (g.phase === 'over') { setUi({ chordTips: null }); if (++g.t >= OVER_T) { g.phase = 'fadeOut'; g.t = 0; } }
  else if (g.phase === 'fadeOut') {
    if (++g.t >= FADE) endGallery(state, g);
  }
};

const shoot = (state: GameState, g: Gallery) => {
  g.cool = 12; g.recoil = 1; g.lastShot = g.t;
  playSound('raygun', 0.8);
  const m = muzzle(g);
  g.bolt = { x0: m.x, y0: m.y, x1: g.cur.x, y1: g.cur.y, t: 7 };
  const ax = g.cur.x / 2, ay = g.cur.y / 2;
  for (let i = g.pieces.length - 1; i >= 0; i--) {
    const pc = g.pieces[i];
    if (!pc.alive || pc.vt >= 0 || pc.falling) continue;
    if (hitOf(g, pc, ax, ay, g.t)) { hitPiece(state, g, pc, m.x / 2, ax, ay); return; }
  }
  // (a miss: a fizzle into the nothing)
  for (let n = 0; n < 4; n++) bit(g, ax, ay, n % 2 ? '#FF8CE4' : '#FFFFFF', 1.5);
};

/** A ray hit: the small stuff goes at once; anything bigger wears (lit up, fizzing, a pock eaten out where it hit, a
 *  crackle lower the further gone it is) till its last hit. */
const hitPiece = (state: GameState, g: Gallery, p: Piece, fromX: number, ax: number, ay: number) => {
  p.hits++;
  if (p.hits >= p.hp) { zap(state, g, p, fromX); return; }
  const q = placeOf(g, p, g.t), k = p.hits / p.hp;
  p.flash = 8;
  if (p.pocks.length < 16) p.pocks.push({ x: ax - q.x, y: ay - q.y, r: 1.5 + k * 6 + Math.random() * 1.5 });
  for (let n = 0; n < 6; n++) bit(g, ax, ay, VAPOR[n % VAPOR.length], 2);
  playSound('rayFizzle', 0.55, 5 - k * 10);
};

const talkGallery = (state: GameState, g: Gallery) => {
  // (unhurried: a good few seconds of quiet after each line (counted from its end), one at a time, never over anybody;
  // the real meltdown's for the street after)
  if (g.talk || isTalking() || state.frame - g.lastLine < CALM_GAP) return;
  // (calm only till the first thing's gone: from the first disintegration he's frantic)
  const voiceOf = (_tier: number) => DOOLEY_VOICE;
  if (g.tier > g.said) {
    // (a new tier: its first line first (tiers passed in the quiet: just the newest))
    g.said = g.tier;
    const pool = DOOLEY_TIERS[g.tier - 1];
    const first = { clean: [pool.clean[0]], shitty: [pool.shitty[0]], nude: [pool.nude[0]] };
    dooley(g, state, first, undefined, voiceOf(g.tier));
    return;
  }
  const saw = g.sawQ.shift();
  if (saw) { dooley(g, state, DOOLEY_SAW[saw]); return; }
  if (g.tier === 0) {
    if (!g.idleSaid && g.t > 420) { g.idleSaid = true; dooley(g, state, DOOLEY_IDLE, undefined, DOOLEY_CALM_VOICE); }
    return;
  }
  if (state.frame - g.lastLine > REPEAT_GAP) dooley(g, state, DOOLEY_TIERS[g.tier - 1], undefined, voiceOf(g.tier));
};

/** Nothing erased at all, the time up (the owner's: "in case the player is extra lazy. then you 'fail' and need to
 *  retry"): a short scene at the booth (no control, no HUD), Dooley calm and baffled, a participation sticker, and back to
 *  how it was: no meltdown, no shard, the booth whole; talk to him to go again (his retry offer). */
const lazyFail = (state: GameState, g: Gallery) => {
  g.gone = 0; g.lvl = lvlOf(0);
  const p = state.player;
  p.pos.x = g.from.x; p.pos.y = g.from.y; p.vel.x = 0; p.vel.y = 0;
  p.facing = BOOTH.man > p.pos.x + p.width / 2 ? 1 : -1;
  g.manFace = BOOTH.man > p.pos.x + p.width / 2 ? -1 : 1;
  g.phase = 'lazy'; g.t = 0; g.lazy = true; g.sticker = false;
  const on = () => gal(state) === g && g.phase === 'lazy';
  dooley(g, state, DOOLEY_LAZY_A, () => {
    if (!on()) return;
    dooley(g, state, DOOLEY_LAZY_B, () => {
      if (!on()) return;
      meatheadSays(state, pickLine(byPants(state, MH_LAZY)), true, () => {
        if (!on()) return;
        dooley(g, state, DOOLEY_LAZY_C, () => lazyDone(state, g), DOOLEY_CALM_VOICE);
      });
    }, DOOLEY_CALM_VOICE);
    // (the sticker's on him as he says so)
    g.sticker = true; playSound('ding', 0.5, 7);
  }, DOOLEY_CALM_VOICE);
};
const lazyDone = (state: GameState, g: Gallery) => {
  if (gal(state) !== g || g.phase !== 'lazy') return;
  g.phase = 'idle'; g.t = 0; g.upLatch = true; g.greeted = true; g.sticker = false;
  releaseWorld(state);
};

const endGallery = (state: GameState, g: Gallery) => {
  if (g.erasedN === 0) { lazyFail(state, g); return; }
  g.gone = goneFrac(g);
  state.stageMemo[GALLERY_MEMO] = g.gone.toFixed(3);
  g.lvl = lvlOf(g.gone);
  if (g.lvl >= 3 && g.ledge) { g.ledge.y = -99999; g.ledge = null; }
  // (back in the street: Dooley out in front of the booth, by him, the beat)
  const p = state.player;
  p.pos.x = g.from.x; p.pos.y = g.from.y; p.vel.x = 0; p.vel.y = 0;
  const pm = p.pos.x + p.width / 2;
  g.manX = pm + 78 < BOOTH.b + 120 ? pm + 78 : pm - 78;
  g.manFace = g.manX > pm ? -1 : 1;
  p.facing = g.manX > pm ? 1 : -1;
  g.phase = 'beat'; g.t = 0;
  const pool = g.gone < 0.15 ? DOOLEY_OPEN_SMALL : g.gone < 0.999 ? DOOLEY_OPEN_BIG : DOOLEY_OPEN_ALL;
  playSound('thud', 0.5, -6);
  dooley(g, state, pool, () => meatheadSays(state, pickLine(byPants(state, MH_PRIZE)), true, () => toPanic(state, g)));
};

/** The hand (screen): its wrist low, left of middle (his left: he's left-handed), sliding after the cursor and kicked
 *  down by the recoil, the gun turned to point at it (within reason); at rest (lower, pointing up the middle) till GO. */
const HAND_S = 2;
const handPose = (g: Gallery) => {
  const aiming = g.phase !== 'fadeIn' && g.phase !== 'ready';
  const cx = aiming ? g.cur.x : 400, cy = aiming ? g.cur.y : 330;
  const x = 300 + (cx - 400) * 0.4, y = 604 + (cy - 300) * 0.12 + g.recoil * 14 + (aiming ? 0 : 16);
  const lean = Math.atan2(HAND_MUZZLE[0] - HAND_PIVOT[0], HAND_PIVOT[1] - HAND_MUZZLE[1]);
  const a = Math.max(-0.6, Math.min(0.6, Math.atan2(cx - x, y - cy) - lean)) - g.recoil * 0.06;
  return { x, y, a };
};
const muzzle = (g: Gallery) => {
  const { x, y, a } = handPose(g);
  const lx = (HAND_MUZZLE[0] - HAND_PIVOT[0]) * HAND_S, ly = (HAND_MUZZLE[1] - HAND_PIVOT[1]) * HAND_S;
  return { x: x + Math.cos(a) * lx - Math.sin(a) * ly, y: y + Math.sin(a) * lx + Math.cos(a) * ly };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: in the world

/** The music's (cues.ts): the gallery's own song while it's up (the ask's the land's), the sting when the time's up. */
export const galleryMusic = (state: GameState): GameCue | null => {
  const ph = gal(state)?.phase;
  return ph === 'fadeIn' || ph === 'ready' || ph === 'play' ? { song: 'game:gallery' } : ph === 'over' || ph === 'fadeOut' ? { song: null, sting: 'game:gallery-end' } : null;
};
/** Is the gallery up (first person) or fading? (the world's not to be seen) */
export const galleryOn = (state: GameState) => { const g = gal(state); return !!g && (g.phase === 'fadeIn' || g.phase === 'ready' || g.phase === 'play' || g.phase === 'over' || g.phase === 'fadeOut'); };

/** The booth's back, Dooley behind the counter (or out front in the beat), the counter. */
export const drawGalleryWorld = (c: Ctx, state: GameState) => {
  const g = gal(state);
  if (!g) return;
  const v = state.view, f = state.frame;
  if (v && (BOOTH.b + 200 < v.x || BOOTH.a - 200 > v.x + v.w)) return;
  drawBoothBack(c, BOOTH.a, GY, g.lvl);
  if (g.phase === 'idle' || g.phase === 'offer' || g.phase === 'ask' || g.phase === 'lazy') {
    const p = state.player, pm = p.pos.x + p.width / 2, close = Math.abs(pm - BOOTH.man) < 300;
    drawDooleyAt(c, BOOTH.man, GY, g.manFace, close || g.talk ? 'pitch' : 'idle', f);
  }
  drawBoothFront(c, BOOTH.a, GY, g.lvl);
  // (his counter's top going back, lit along the front: he stands on it)
  if (g.lvl < 3) { box(c, BOOTH.a, GY - COUNTER_H - 3, BOOTH_W, 1, '#3A2010'); box(c, BOOTH.a, GY - COUNTER_H - 2, BOOTH_W, 1, '#FFE8A0'); box(c, BOOTH.a, GY - COUNTER_H - 1, BOOTH_W, 1, '#E8C060'); }
  if (g.phase === 'beat') drawDooleyAt(c, g.manX, GY, g.manFace, Math.floor(g.t / 50) % 3 === 1 ? 'point' : 'panic', f, false);
  if (g.erase) drawErase(c, g.erase, f);
  if (g.fall) drawFall(c, g.fall, f);
  // (the shard, lying in the street)
  if (g.shard) drawShard(c, g.shard.x, g.shard.y - 4 + Math.sin(f * 0.08) * 3, 1, f);
};
/** The lazy fail's participation sticker, on his chest: a gold star. */
const drawSticker = (c: Ctx, state: GameState) => {
  const p = state.player, x = p.pos.x + p.width / 2 + p.facing * 5, y = p.pos.y + p.height * 0.36;
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 2.2 : 5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath(); c.fillStyle = '#5A3A08'; c.lineWidth = 2; c.strokeStyle = '#5A3A08'; c.stroke(); c.fillStyle = '#FFD84A'; c.fill();
  box(c, x - 1, y - 2, 1, 1, '#FFFFFF');
};
/** Erased: lit up, shaking, then eaten away band by band from both sides (baked once; clipped and drawn each frame),
 *  the eaten edges glowing pink. */
const drawErase = (c: Ctx, er: Erase, f: number) => {
  const t = er.t, fr = Math.floor(f / 5) % 2, cv = er.cv[fr], pk = er.pk[fr];
  if (t >= EAT_END) return;
  const shake = ((t >> 1) % 2 ? 1 : -1) * (t < LIT ? 2 : 1);
  c.save(); c.translate(Math.round(er.x + shake), GY); c.scale(er.face, 1); c.imageSmoothingEnabled = false;
  if (t <= LIT) {
    c.drawImage(cv, -DOX, -DOY, DW, DH);
    c.globalAlpha = 0.2 + 0.55 * ((t >> 2) % 2); c.drawImage(pk, -DOX, -DOY, DW, DH);
  } else {
    const spans = spansOf(t);
    if (spans.length) {
      c.save(); c.beginPath(); for (const sp of spans) c.rect(sp.l - DOX, sp.y - DOY, sp.r - sp.l, BAND); c.clip();
      c.drawImage(cv, -DOX, -DOY, DW, DH);
      c.globalAlpha = 0.25 + 0.4 * ((t - LIT) / EAT_T); c.drawImage(pk, -DOX, -DOY, DW, DH);
      c.restore();
      for (const sp of spans) for (const ex of [sp.l, sp.r - 3]) { const sx = Math.max(0, Math.min(DW - 3, ex)); c.drawImage(pk, sx * ES, sp.y * ES, 3 * ES, BAND * ES, sx - DOX, sp.y - DOY, 3, BAND); }
    }
  }
  c.restore();
};
/** The heart attack: clutching his chest, staggering, then over like a tree (baked once, drawn turned); then lying there. */
const drawFall = (c: Ctx, fl: Fall, f: number) => {
  const k = fl.t < FALL_CLUTCH ? 0 : Math.min(1, ((fl.t - FALL_CLUTCH) / (FALL_LAND - FALL_CLUTCH)) ** 2);
  const lying = fl.t >= FALL_LAND, wob = fl.t < FALL_CLUTCH ? Math.sin(fl.t * 0.5) * 0.06 : 0;
  c.save(); c.translate(Math.round(fl.x), GY); c.scale(fl.face, 1); c.translate(0, -k * 14); c.rotate(k * Math.PI / 2 + wob); c.imageSmoothingEnabled = false;
  c.drawImage(lying ? fl.dead : fl.cv[Math.floor(f / 6) % 2], -DOX, -DOY, DW, DH);
  c.restore();
};
/** Erased: his last words, fading as the echo does, the end of them thrown back again and again, fainter each time. */
const drawEchoWords = (c: Ctx, state: GameState, er: Erase) => {
  const s = er.said!, el = state.frame - s.at, msF = s.ms * 0.06, tailF = RAY_ECHO.tail * 60, step = RAY_ECHO.delay * 60;
  if (el < 0 || el > msF + tailF) return;
  const fade = el < msF ? 1 : Math.max(0, 1 - (el - msF) / tailF), top = GY - 100;
  c.save();
  c.globalAlpha = fade;
  saidOver(c, s.text, er.x, top, '#FDE68A');
  const last = s.text.replace(/[!?.]+$/, '').split(' ').slice(-2).join(' ') + '...';
  for (let n = 1; n <= 7; n++) {
    const a = fade * RAY_ECHO.feedback ** n;
    if (el < msF * 0.5 + n * step || a < 0.03) break;
    c.globalAlpha = a;
    saidOver(c, last, er.x + (n % 2 ? 1 : -1) * n * 6, top - 12 - n * 11, '#FDE68A');
  }
  c.restore();
};
/** His words over his head (plain, while they're said: not in the gallery, where they're in its corner). */
export const drawGalleryWords = (c: Ctx, state: GameState) => {
  const g = gal(state);
  if (g?.phase === 'erase' && g.erase?.said && g.erase.said.at >= 0) { drawEchoWords(c, state, g.erase); return; }
  if (g?.sticker && g.phase === 'lazy') drawSticker(c, state);
  if (!g || !g.talk || galleryOn(state) || g.phase === 'card') return;
  const x = g.man ? g.man.pos.x + g.man.width / 2 : g.wordsAt ? g.wordsAt.x : g.phase === 'beat' ? g.manX : BOOTH.man;
  const top = g.man ? g.man.pos.y : g.wordsAt ? g.wordsAt.y : GY - 84;
  saidOver(c, g.talk.text, x, top - 12, '#FDE68A');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the gallery (over everything: the HUD's pass)

const drawPiece = (c: Ctx, g: Gallery, p: Piece) => {
  if (!p.alive || !p.cv) return;
  const q = p.vt >= 0 || p.falling ? { x: p.x, y: p.y, on: true, rot: p.rot } : placeOf(g, p, g.t);
  c.save();
  // (the ducks run inside the posts; the bandits drop in behind their fence)
  if (p.kind === 'duck' && !p.falling && !p.landed) { c.beginPath(); c.rect(20, 0, 360, ART_H); c.clip(); }
  if (p.kind === 'bandit' && !p.falling && !p.landed) { c.beginPath(); c.rect(0, 0, ART_W, FENCE_Y + 5); c.clip(); }
  let lx = q.x, ly = q.y;
  if (p.kind === 'wheel' || p.kind === 'lantern') {
    const px0 = q.x + p.w / 2, py0 = p.kind === 'wheel' ? q.y + p.h / 2 : q.y;
    c.translate(px0, py0); c.rotate(q.rot ?? 0); lx = -p.w / 2; ly = p.kind === 'wheel' ? -p.h / 2 : 0;
  }
  if (p.vt < 0) {
    c.drawImage(p.cv, Math.round(lx), Math.round(ly));
    // (worn: eaten through where it's been hit, the holes' edges pink; lit up from the last hit)
    if (p.pocks.length) {
      c.save(); c.beginPath(); c.rect(lx, ly, p.w, p.h); c.clip();
      for (const k of p.pocks) { c.fillStyle = '#FF8CE4'; c.beginPath(); c.arc(lx + k.x, ly + k.y, k.r + 1, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#0A0614';
      for (const k of p.pocks) { c.beginPath(); c.arc(lx + k.x, ly + k.y, k.r, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    if (p.flash > 0) { c.globalAlpha = p.flash / 10; c.drawImage(p.pk!, Math.round(lx), Math.round(ly)); c.globalAlpha = 1; }
  } else if (p.vt < VH) {
    c.drawImage(p.cv, Math.round(lx), Math.round(ly));
    c.globalAlpha = p.vt % 2 ? 0.75 : 0.45; c.drawImage(p.pk!, Math.round(lx), Math.round(ly)); c.globalAlpha = 1;
  } else {
    // (eaten away from the side the beam came in: a ragged edge, white-hot just ahead of it)
    const ex = edgeX(p), seed = p.i * 13 + p.id.length;
    c.beginPath();
    const far = p.dir > 0 ? p.w + 2 : -2;
    c.moveTo(lx + far, ly - 2);
    for (let yy = -2; yy <= p.h + 3; yy += 3) c.lineTo(lx + ex + (Math.sin(yy * 1.7 + seed) + Math.sin(yy * 0.6 + seed * 3)) * 3, ly + yy);
    c.lineTo(lx + far, ly + p.h + 3); c.closePath();
    c.save(); c.clip();
    c.drawImage(p.cv, Math.round(lx), Math.round(ly));
    c.globalAlpha = 0.35; c.drawImage(p.pk!, Math.round(lx), Math.round(ly)); c.globalAlpha = 1;
    c.restore();
    for (let yy = 0; yy < p.h; yy += 3) { const jx = lx + ex + (Math.sin(yy * 1.7 + seed) + Math.sin(yy * 0.6 + seed * 3)) * 3; box(c, jx - 1, ly + yy, 2, 3, (yy / 3 + g.t) % 2 ? '#FFFFFF' : '#FF8CE4'); }
  }
  c.restore();
};

const scoreText = (g: Gallery) => {
  const n = String(Math.min(99999, g.score)).padStart(5, '0'), t = g.tier, f = g.t;
  const rnd = (k: number) => Math.floor(Math.abs(Math.sin(k * 12.9898 + Math.floor(f / 8) * 78.233)) * 43758.5453) % 1000 / 1000;
  // (a real gallery's at first; then digits going wrong; then question marks creeping in; then nothing but)
  if (t <= 1) return n;
  if (t === 2) return f % 40 < 9 ? n.split('').map((ch, i) => (rnd(i) < 0.4 ? String(Math.floor(rnd(i + 9) * 10)) : ch)).join('') : n;
  if (t === 3) return n.split('').map((ch, i) => (rnd(i) < 0.4 ? '?' : ch)).join('');
  if (t === 4) return ['?0?3?', '??!??', '?????', '0?!?0'][Math.floor(f / 12) % 4];
  return ['?????', '??!??', '!?!?!', '-????', '?!?!?', '    ?'][Math.floor(f / 9) % 6];
};

export const drawGalleryHud = (c: Ctx, state: GameState) => {
  const g = gal(state);
  if (!g) return;
  // (erased: the bars in with the push-in)
  if (g.phase === 'erase' && g.erase) {
    const bar = Math.round(eraseK(g.erase) * 44);
    if (bar > 0) { c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
    return;
  }
  if (!galleryOn(state)) return;
  const f = g.t;
  c.save();
  c.imageSmoothingEnabled = false;
  // THE SET (art px: two screen pixels each)
  c.save(); c.scale(2, 2);
  if (g.voidCv) c.drawImage(g.voidCv, 0, 0);
  for (const pc of g.pieces) drawPiece(c, g, pc);
  // (bandits' boots, smoking on the fence where they stood (gone with the fence))
  if (!byId(g, 'fence')?.gone) for (const b of g.boots) { box(c, b.x, b.y, 6, 4, '#2A1A0E'); box(c, b.x + 8, b.y, 6, 4, '#2A1A0E'); box(c, b.x, b.y, 6, 1, '#5A3A1E'); if ((f + b.x) % 20 < 12) box(c, b.x + 5 + Math.sin(f * 0.1 + b.x) * 2, b.y - 4 - ((f / 3 + b.x) % 8), 1, 1, '#A8A29E'); }
  for (const b of g.bits) box(c, b.x, b.y, b.s, b.s, b.col);
  c.restore();
  // (the score board's digits: counting, then going wrong)
  const sb = byId(g, 'score');
  if (sb?.alive && sb.vt < 0) {
    c.font = '8px "Press Start 2P"'; c.textAlign = 'center';
    c.fillStyle = '#5A0A0A'; c.fillText('88888', sb.x * 2 + 70, sb.y * 2 + 32);
    c.fillStyle = g.tier >= 3 && f % 6 < 2 ? '#FFFFFF' : '#FF4A3A'; c.fillText(scoreText(g), sb.x * 2 + 70, sb.y * 2 + 32);
    c.font = '5px "Press Start 2P"'; c.fillStyle = '#E8C060'; c.fillText('SCORE', sb.x * 2 + 70, sb.y * 2 + 16);
    c.textAlign = 'left';
  }
  // THE BOLT: his ray, muzzle to the cursor, white-hot in the pink
  if (g.bolt) {
    const b = g.bolt, w = b.t > 4 ? 1 : 0.6;
    c.lineCap = 'round';
    for (const [lw, col] of [[10 * w, 'rgba(236,68,196,0.5)'], [6 * w, '#FF8CE4'], [2, '#FFFFFF']] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(b.x0, b.y0); c.lineTo(b.x1, b.y1); c.stroke(); }
    c.lineCap = 'butt';
    for (const r of [14, 9]) { c.fillStyle = r > 10 ? 'rgba(255,140,228,0.5)' : '#FFFFFF'; c.beginPath(); c.arc(b.x0, b.y0, r * w, 0, Math.PI * 2); c.fill(); }
  }
  // HIS ARM AND THE RAY GUN, turned at the cursor, kicking back as it fires
  if (g.gunCv) {
    const h = handPose(g);
    c.save(); c.translate(h.x, h.y); c.rotate(h.a); c.scale(HAND_S, HAND_S);
    c.drawImage(g.gunCv[g.recoil > 0.3 ? 1 : 0], -HAND_PIVOT[0], -HAND_PIVOT[1]);
    c.restore();
  }
  // THE CURSOR: a crosshair, pink and white, inked (not till GO)
  if (g.phase !== 'fadeIn' && g.phase !== 'ready') {
    const x = Math.round(g.cur.x), y = Math.round(g.cur.y), r = 12 + (g.recoil > 0.3 ? 4 : 0);
    for (const [lw, col] of [[4, '#1A0B06'], [2, f % 20 < 10 ? '#FF8CE4' : '#FFFFFF']] as const) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(x - r - 6, y); c.lineTo(x - 4, y); c.moveTo(x + 4, y); c.lineTo(x + r + 6, y); c.moveTo(x, y - r - 6); c.lineTo(x, y - 4); c.moveTo(x, y + 4); c.lineTo(x, y + r + 6); c.stroke();
    }
    box(c, x - 1, y - 1, 2, 2, '#FFFFFF');
  }
  // THE CLOCK
  const secs = Math.max(0, Math.ceil(g.time / 60));
  label(c, 'TIME', CANVAS_WIDTH / 2, 98, '#FDE68A', 8);
  label(c, String(secs), CANVAS_WIDTH / 2, 122, secs <= 10 && f % 30 < 15 ? '#FF4A3A' : '#FFFFFF', 18);
  // DOOLEY: his gross-up in the corner, leaning in, sweating, shaking worse the more's gone
  drawDooleyInset(c, g, f);
  // (his words: the rules up the middle before GO (nothing to aim at yet); in the play, just over his corner)
  if (g.talk) { if (g.phase === 'ready' || g.phase === 'fadeIn') saidOver(c, g.talk.text, CANVAS_WIDTH / 2, 250, '#FDE68A', 380); else saidOver(c, g.talk.text, CANVAS_WIDTH - 190, 452, '#FDE68A', 300); }
  if (g.mh) saidOver(c, g.mh.text, 360, 470, '#FFFFFF', 300);
  // THE COUNTDOWN: 3, 2, 1 (each punched in big and settling), GO!
  {
    const at = g.phase === 'ready' && g.cd >= CD_LEAD ? g.cd - CD_LEAD : -1;
    const n = at >= 0 ? 3 - Math.floor(at / CD_STEP) : 0, go = g.phase === 'play' && g.t < GO_T;
    if (n > 0 || go) {
      const k = go ? g.t : at % CD_STEP, s = 1 + Math.max(0, 1 - k / 8) * 0.8;
      c.save(); c.translate(CANVAS_WIDTH / 2, 290); c.scale(s, s);
      label(c, go ? 'GO!' : String(n), 0, 0, go ? '#86EFAC' : '#FDE047', go ? 44 : 56);
      c.restore();
    }
  }
  // THE END: time, or nothing left
  if (g.phase === 'over') {
    const all = g.pieces.every(pc => !pc.alive), s = 1 + Math.max(0, 1 - g.t / 10);
    c.save(); c.translate(CANVAS_WIDTH / 2, 300); c.scale(s, s);
    label(c, all ? 'NOTHING LEFT.' : 'TIME!', 0, 0, all ? '#C8B8F0' : '#FDE047', 28);
    c.restore();
  }
  // (the fades in and out: stepped)
  const k = g.phase === 'fadeIn' ? 1 - g.t / FADE : g.phase === 'fadeOut' ? g.t / FADE : 0;
  if (k > 0) { c.fillStyle = `rgba(0,0,0,${Math.round(k * 4) / 4})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  c.restore();
};

const drawDooleyInset = (c: Ctx, g: Gallery, f: number) => {
  // (small, tucked in the bottom-right corner over the counter: clear of the targets and the score (the owner's: "make
  // dooley take up less screen space"))
  const W = 112, H = 126, tier = g.tier, sh = tier >= 3 ? tier - 1 : 0;
  const x = CANVAS_WIDTH - W - 10 + (sh ? Math.round(Math.sin(f * 1.7) * sh) : 0), y = CANVAS_HEIGHT - H - 8 + (sh ? Math.round(Math.cos(f * 2.3) * sh * 0.7) : 0) + (g.talk && f % 16 < 8 ? 1 : 0);
  box(c, x - 4, y - 4, W + 8, H + 8, '#1A0B06'); box(c, x - 3, y - 3, W + 6, H + 6, '#D8A830'); box(c, x - 3, y - 3, W + 6, 1, '#F8E080'); box(c, x - 1, y - 1, W + 2, H + 2, '#1A0B06');
  const bg = tier >= 4 ? ['#1C1232', '#160E28', '#100A1E', '#0A0614'] : ['#5A2A3A', '#4A2232', '#3A1A2A', '#2A1220'];
  for (let i = 0; i < 4; i++) box(c, x, y + (H * i) / 4, W, H / 4 + 1, bg[i]);
  const k = tier <= 0 ? 0 : tier <= 2 ? 1 : tier <= 4 ? 2 : 3;
  const bu = dooleyBust(k);
  if (bu.img) {
    c.save(); c.beginPath(); c.rect(x, y, W, H); c.clip();
    const s = Math.min(W / 150, H / 170), dw = Math.round(150 * s), vis = Math.min(200, H / s), dh = Math.round(vis * s);
    const ox = Math.round(x + (W - dw) / 2), oy = Math.round(y + H - dh);
    c.drawImage(bu.img, 61, 4, 150, vis, ox, oy, dw, dh);
    drawVisor(c, bu, ox, oy, s);
    // (sweat rolling down him, more the worse it gets)
    for (let n = 0; n < tier * 2; n++) { const sx = x + 18 + ((n * 29) % (W - 36)), sy = y + 24 + ((f * (0.8 + n * 0.15) + n * 23) % (H - 36)); box(c, sx, sy, 2, 4, '#9AD8F8'); box(c, sx, sy, 1, 1, '#FFFFFF'); }
    c.restore();
  }
  box(c, x + 3, y + 3, 46, 10, 'rgba(0,0,0,0.6)');
  c.font = '5px "Press Start 2P"'; c.fillStyle = '#FDE68A'; c.fillText('DOOLEY', x + 6, y + 11);
};

/** The town going away under it (a death mid-ask): the box down. */
export const dropGallery = (state: GameState) => { const g = gal(state); if (g?.ask) { closeAsk(); g.ask = null; } if (g?.card) { closeShardCard(); g.card = null; } if (g && g.phase !== 'idle') setUi({ chordTips: null }); };

void RAIL_A; void RAIL_C;
