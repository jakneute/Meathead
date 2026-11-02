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
//            him): the gallery, every piece of the set its own (galleryArt.ts pieceDefs). The cursor: the stick or
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
//            at a time). Kill him any way at all: the CHARGE SHARD drops out of him.
//   dead     the shard lying in the street till it's picked up: the card (the explain screens' buffer), and it's his
//            for good (the save: one a save). After that the booth stays wrecked and empty.
//
// Firing nothing at all still ends it (the time runs out): a smaller panic, still killable, still the shard.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { NO_CONTROLS, getLastInputDevice } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, isTalking, say, cutVoice, MEATHEAD_VOICE } from '../../../m1/game/platform/speech';
import { getActiveGamepad, getGamepadMovement } from '../../../m1/game/platform/gamepad';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerM2Kind } from '../../kinds';
import { setUi } from '../../store';
import { awardShard, shardWon as wonShard, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { reaction, moodOf, frameOf, type Pose } from '../../spooky/costume';
import { meatheadSays, speak, byPants, saidOver, label, box, ledge, type Said } from '../section';
import type { ByPants } from '../talk';
import { GY } from '../geometry';
import { X } from './layout';
import { townOf, type Town } from './state';
import {
  ART_W, ART_H, FENCE_Y, RAIL_A, RAIL_C, COUNTER_Y, DUCK_W, BANDIT_H, GUN_W, GUN_H, GUN_PIVOT, GUN_MUZZLE, BOOTH_W, COUNTER_H, DOOLEY_SEED,
  bake, pinkOf, paintVoid, drawVisor, paintGunArm, pieceDefs, dooleyBust, drawBoothBack, drawBoothFront, drawDooleyAt, drawDooleyKind, drawShard,
  type PieceDef, type DooleyLook,
} from './galleryArt';
import {
  DOOLEY_VOICE, DOOLEY_GREET, DOOLEY_OFFER, DOOLEY_DECLINED, DOOLEY_NOT_NOW, DOOLEY_START, DOOLEY_IDLE, DOOLEY_TIERS, DOOLEY_SAW,
  DOOLEY_OPEN_NONE, DOOLEY_OPEN_SMALL, DOOLEY_OPEN_BIG, DOOLEY_OPEN_ALL, DOOLEY_PANIC, DOOLEY_MUTTER, MH_ACCEPT, MH_PRIZE, MH_KILL, MH_SHARD,
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
/** The disintegration: lit up first, then eaten away. */
const VH = 8, VG = 22;
/** How much has to be gone for each tier of his reaction (1..5), and the score board's going wrong. */
const TIERS = [0.001, 0.12, 0.3, 0.55, 0.8];
const VALUE: Partial<Record<PieceDef['kind'], number>> = { duck: 100, bandit: 250, bottle: 50, moon: 1000, wheel: 500, prize: 300 };

type Phase = 'idle' | 'offer' | 'ask' | 'fadeIn' | 'play' | 'over' | 'fadeOut' | 'beat' | 'panic' | 'dead' | 'card' | 'done';
interface Piece extends PieceDef {
  cv: HTMLCanvasElement | null; pk: HTMLCanvasElement | null;
  x0: number; y0: number;
  /** Still there to be drawn; counted gone (hit, or falling); frames into its disintegration (-1: not hit); the side
   *  the beam came in; falling (off a gone rail or shelf). */
  alive: boolean; gone: boolean; vt: number; dir: 1 | -1; vy: number; falling: boolean;
  /** (the wheel, the lantern) Its turn when it was hit (it goes as it was). */
  rot: number;
}
interface Bit { x: number; y: number; vx: number; vy: number; life: number; col: string; s: number }
interface Gallery {
  phase: Phase; t: number;
  ask: Ask | null;
  /** How wrecked the booth's drawn (0..3), how much of the gallery went (0..1). */
  lvl: number; gone: number;
  ledge: Block | null;
  /** Dooley: the person (once he can be killed), where he stands otherwise, his words; greeted yet. */
  man: Enemy | null; manX: number; manFace: 1 | -1;
  talk: Said | null; mh: Said | null; lastLine: number; greeted: boolean; upLatch: boolean;
  /** The gallery. */
  pieces: Piece[]; baked: number; voidCv: HTMLCanvasElement | null; gunCv: HTMLCanvasElement | null;
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
const dooley = (g: Gallery, state: GameState, pool: ByPants, onDone?: () => void) => {
  g.lastLine = state.frame;
  speak(DOOLEY_VOICE, pickLine(byPants(state, pool)), s => { g.talk = s; }, true, onDone);
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
const lookOfAi = (e: Enemy): DooleyLook => (e.aiState === 'point' ? 'point' : e.aiState === 'gasp' ? 'gasp' : 'panic');
registerM2Kind({
  kind: DOOLEY_KIND, stats: { w: 42, h: 76, hp: 20, contact: 0, mass: 200 }, humanoid: true, gender: 'm', head: { x: 1, y: -70, r: 11 }, pathing: false,
  ai: (ctx, e) => {
    const { state } = ctx, p = state.player, pm = p.pos.x + p.width / 2, m = e.pos.x + e.width / 2;
    // (his body never hurts him: he's having a panic attack, not a fight)
    e.trippedUntil = state.frame + 2;
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
    drawDooleyKind(c, F);
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
    man: null, manX: BOOTH.man, manFace: -1, talk: null, mh: null, lastLine: -9999, greeted: false, upLatch: true,
    pieces: [], baked: 0, voidCv: null, gunCv: null, cur: { x: 400, y: 260 }, held: true, cool: 0, recoil: 0, aimSpd: 0, bolt: null,
    bits: [], boots: [], score: 0, time: TIME, lastShot: 0, tier: 0, said: 0, sawQ: [], sawDone: new Set(), idleSaid: false,
    from: { x: 0, y: 0 }, shard: null, card: null, bustK: 0, rebuilt: false,
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
  g.man = e;
};

// ---------------------------------------------------------------------------------------------------------------
// The gallery's pieces

const bakeSome = (g: Gallery, n: number) => {
  if (!g.pieces.length) g.pieces = pieceDefs().map(d => ({ ...d, cv: null, pk: null, x0: d.x, y0: d.y, alive: true, gone: false, vt: -1, dir: 1, vy: 0, falling: false, rot: 0 }));
  if (!g.voidCv) { g.voidCv = bake(ART_W, ART_H, paintVoid); n--; }
  if (!g.gunCv) { g.gunCv = bake(GUN_W, GUN_H, paintGunArm); n--; }
  for (; n > 0 && g.baked < g.pieces.length; n--, g.baked++) {
    const p = g.pieces[g.baked];
    p.cv = bake(p.w, p.h, p.paint); p.pk = pinkOf(p.cv);
  }
};
const fresh = (g: Gallery) => {
  for (const p of g.pieces) { p.x = p.x0; p.y = p.y0; p.alive = true; p.gone = false; p.vt = -1; p.vy = 0; p.falling = false; }
  g.bits = []; g.boots = []; g.score = 0; g.time = TIME; g.tier = 0; g.said = 0; g.sawQ = []; g.sawDone.clear(); g.idleSaid = false; g.lastShot = 0;
  g.cur = { x: 400, y: 250 }; mouse.moved = false; g.held = true; g.cool = 10; g.recoil = 0; g.bolt = null; g.aimSpd = 0;
};
const byId = (g: Gallery, id: string) => g.pieces.find(p => p.id === id);
const goneFrac = (g: Gallery) => (g.pieces.length ? g.pieces.filter(p => p.gone).length / g.pieces.length : 0);

/** Where a piece is this frame (moving ones), and whether it can be hit there. */
const placeOf = (g: Gallery, p: Piece, t: number): { x: number; y: number; on: boolean; rot?: number } => {
  switch (p.kind) {
    case 'duck': {
      if (p.falling) return { x: p.x, y: p.y, on: true };
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
  if (p.kind === 'bandit' && ay > FENCE_Y + 4) return false;
  return ax >= q.x && ax < q.x + p.w && ay >= q.y && ay < q.y + p.h;
};

const tierOf = (gone: number) => { let k = 0; for (let i = 0; i < TIERS.length; i++) if (gone >= TIERS[i]) k = i + 1; return k; };

const zap = (state: GameState, g: Gallery, p: Piece, fromX: number) => {
  const t = g.t;
  const q = placeOf(g, p, t);
  p.x = q.x; p.y = q.y; p.rot = q.rot ?? 0; // (frozen where it was hit)
  p.vt = 0; p.gone = true; p.dir = fromX <= q.x + p.w / 2 ? 1 : -1;
  g.score += VALUE[p.kind] ?? 10;
  playSound('rayFizzle', 0.8, Math.random() * 4 - 2);
  // (a word for some of them, once each)
  const saw = p.kind === 'moon' ? 'moon' : p.kind === 'panel' ? 'sky' : p.kind === 'plank' ? 'void' : p.kind === 'counter' ? 'counter' : p.kind === 'score' ? 'score' : p.kind === 'bandit' ? 'bandit' : p.kind === 'prize' ? 'prize' : null;
  if (saw && !g.sawDone.has(saw)) { g.sawDone.add(saw); g.sawQ.push(saw); }
  if (p.kind === 'bandit') g.boots.push({ x: q.x + 3, y: FENCE_Y - 4 });
  void state;
};

/** What's on a gone rail or shelf falls. */
const drops = (g: Gallery) => {
  const railGone = (row: number, s: number) => { const r = byId(g, `rail${row}${s}`); return !r || r.gone; };
  for (const p of g.pieces) {
    if (!p.alive || p.gone || p.falling) continue;
    if (p.kind === 'duck') {
      const q = placeOf(g, p, g.t), cx = q.x + DUCK_W / 2;
      if (!q.on) continue;
      const s = Math.max(0, Math.min(2, Math.floor((cx - 20) / 120)));
      if (railGone(p.row ?? 0, s)) { p.x = q.x; p.y = q.y; p.falling = true; p.gone = true; p.vy = -1; }
    } else if ((p.kind === 'bottle' && byId(g, 'bshelf')?.gone) || (p.kind === 'prize' && byId(g, 'pshelf')?.gone)) { p.falling = true; p.gone = true; p.vy = 0; }
  }
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
  const near = pm > BOOTH.a - 24 && pm < BOOTH.b + 24 && Math.abs(feet - GY) < 8;
  const free = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;

  switch (g.phase) {
    case 'idle': {
      g.manFace = pm < BOOTH.man ? -1 : 1;
      if (!g.greeted && free && Math.abs(pm - BOOTH.man) < 380 && !isTalking()) { g.greeted = true; g.lastLine = state.frame; speak(DOOLEY_VOICE, pickLine(byPants(state, DOOLEY_GREET)), s => { g.talk = s; }, false); }
      if (near && free && p.isGrounded) {
        setUi({ upPrompt: 'TALK' });
        if (upIn) {
          if (hostileNear(state, g)) { if (!g.talk) dooley(g, state, DOOLEY_NOT_NOW); return { ...out, up: false }; }
          g.phase = 'offer'; g.t = 0; p.inCutscene = true; p.vel.x = 0;
          holdWorld(state, g);
          dooley(g, state, DOOLEY_OFFER, () => { if (g.phase === 'offer' && gal(state) === g) { g.phase = 'ask'; g.ask = openAsk("DEAD-EYE DOOLEY'S SHOOTIN' GALLERY", "SHOOT THE TIN DUCKS. 50 SECONDS. EVERYBODY'S A WINNER. YOU'LL USE YOUR OWN GUN."); } });
          return { ...NO_CONTROLS };
        }
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
      dooley(g, state, DOOLEY_START);
      playSound('menuok', 0.6);
      return { ...NO_CONTROLS };
    }
    case 'fadeIn': case 'play': case 'over': case 'fadeOut':
      runGallery(state, g, controls);
      return { ...NO_CONTROLS };
    case 'beat': {
      p.inCutscene = true; p.vel.x = 0;
      holdWorld(state, g);
      if (g.t > BEAT_MAX) toPanic(state, g);
      return { ...NO_CONTROLS };
    }
    case 'panic': {
      const e = g.man;
      if (e && (e.health <= 0 || e.isBlownAway || !state.enemies.includes(e))) { killed(state, g, e); return out; }
      // (still ranting, one line at a time, a breath between)
      if (e && !g.talk && !isTalking() && state.frame - g.lastLine > 50 && Math.abs(pm - (e.pos.x + e.width / 2)) < 900) {
        dooley(g, state, g.rebuilt && g.said++ === 0 ? DOOLEY_MUTTER : DOOLEY_PANIC);
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

const killed = (state: GameState, g: Gallery, e: Enemy) => {
  cutVoice(DOOLEY_VOICE); g.talk = null;
  const x = Math.max(BOOTH.a - 80, Math.min(BOOTH.b + 80, e.pos.x + e.width / 2));
  g.shard = { x, y: Math.min(GY - 16, e.pos.y + e.height / 2), vy: -5 };
  g.phase = 'dead'; g.man = null;
  state.stageMemo[GALLERY_DEAD] = String(Math.round(x));
  playSound('powerup', 0.5, 6);
  meatheadSays(state, pickLine(byPants(state, MH_KILL)));
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
    } else if (pc.falling) {
      pc.vy += 0.35; pc.y += pc.vy;
      if (pc.y + pc.h > COUNTER_Y + 6) {
        pc.alive = false;
        if (pc.kind === 'bottle') { playSound('glass', 0.6, Math.random() * 4); for (let n = 0; n < 10; n++) bit(g, pc.x + 4, COUNTER_Y, n % 2 ? '#9AB8C8' : '#3A7A3A', 3); }
        else playSound('clang', 0.5, 4 + Math.random() * 4);
      }
    }
  }
  if (g.phase === 'fadeIn') { if (++g.t >= FADE) { g.phase = 'play'; g.t = 0; } }
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
    if (hitOf(g, pc, ax, ay, g.t)) { zap(state, g, pc, m.x / 2); return; }
  }
  // (a miss: a fizzle into the nothing)
  for (let n = 0; n < 4; n++) bit(g, ax, ay, n % 2 ? '#FF8CE4' : '#FFFFFF', 1.5);
};

const talkGallery = (state: GameState, g: Gallery) => {
  if (g.talk || isTalking() || state.frame - g.lastLine < 40) return;
  const saw = g.sawQ.shift();
  if (saw) { dooley(g, state, DOOLEY_SAW[saw]); return; }
  if (g.tier > g.said) {
    // (a new tier: its first line first)
    g.said = g.tier;
    const pool = DOOLEY_TIERS[g.tier - 1];
    g.lastLine = state.frame;
    const first = { clean: [pool.clean[0]], shitty: [pool.shitty[0]], nude: [pool.nude[0]] };
    dooley(g, state, first);
    return;
  }
  if (g.tier === 0) {
    if (!g.idleSaid && g.t > 420) { g.idleSaid = true; dooley(g, state, DOOLEY_IDLE); }
    return;
  }
  if (state.frame - g.lastLine > 150) dooley(g, state, DOOLEY_TIERS[g.tier - 1]);
};

const endGallery = (state: GameState, g: Gallery) => {
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
  const pool = g.gone <= 0 ? DOOLEY_OPEN_NONE : g.gone < 0.15 ? DOOLEY_OPEN_SMALL : g.gone < 0.999 ? DOOLEY_OPEN_BIG : DOOLEY_OPEN_ALL;
  playSound('thud', 0.5, -6);
  dooley(g, state, pool, () => meatheadSays(state, pickLine(byPants(state, MH_PRIZE)), true, () => toPanic(state, g)));
};

const muzzle = (g: Gallery) => {
  const [px0, py0] = GUN_PIV, a = aimAngle(g), back = g.recoil * 12;
  const lx = (GUN_MUZZLE[0] - GUN_PIVOT[0]) * GUN_S - back, ly = (GUN_MUZZLE[1] - GUN_PIVOT[1]) * GUN_S;
  return { x: px0 + Math.cos(a) * lx - Math.sin(a) * ly, y: py0 + Math.sin(a) * lx + Math.cos(a) * ly };
};
/** The shoulder (screen): low at the left, off the bottom (his left arm: he's left-handed); the arm's scale. */
const GUN_PIV = [90, 670] as const, GUN_S = 2.3;
const aimAngle = (g: Gallery) => Math.max(-1.95, Math.min(-0.08, Math.atan2(g.cur.y - GUN_PIV[1], g.cur.x - GUN_PIV[0])));

// ---------------------------------------------------------------------------------------------------------------
// Drawing: in the world

/** Is the gallery up (first person) or fading? (the music's 'gallery'; the world's not to be seen) */
export const galleryOn = (state: GameState) => { const g = gal(state); return !!g && (g.phase === 'fadeIn' || g.phase === 'play' || g.phase === 'over' || g.phase === 'fadeOut'); };

/** The booth's back, Dooley behind the counter (or out front in the beat), the counter. */
export const drawGalleryWorld = (c: Ctx, state: GameState) => {
  const g = gal(state);
  if (!g) return;
  const v = state.view, f = state.frame;
  if (v && (BOOTH.b + 200 < v.x || BOOTH.a - 200 > v.x + v.w)) return;
  drawBoothBack(c, BOOTH.a, GY, g.lvl);
  if (g.phase === 'idle' || g.phase === 'offer' || g.phase === 'ask') {
    const p = state.player, pm = p.pos.x + p.width / 2, close = Math.abs(pm - BOOTH.man) < 300;
    drawDooleyAt(c, BOOTH.man, GY, g.manFace, close || g.talk ? 'pitch' : 'idle', f);
  }
  drawBoothFront(c, BOOTH.a, GY, g.lvl);
  // (his counter's top going back, lit along the front: he stands on it)
  if (g.lvl < 3) { box(c, BOOTH.a, GY - COUNTER_H - 3, BOOTH_W, 1, '#3A2010'); box(c, BOOTH.a, GY - COUNTER_H - 2, BOOTH_W, 1, '#FFE8A0'); box(c, BOOTH.a, GY - COUNTER_H - 1, BOOTH_W, 1, '#E8C060'); }
  if (g.phase === 'beat') drawDooleyAt(c, g.manX, GY, g.manFace, Math.floor(g.t / 50) % 3 === 1 ? 'point' : 'panic', f, false);
  // (the shard, lying in the street)
  if (g.shard) drawShard(c, g.shard.x, g.shard.y - 4 + Math.sin(f * 0.08) * 3, 1, f);
};
/** His words over his head (plain, while they're said: not in the gallery, where they're in its corner). */
export const drawGalleryWords = (c: Ctx, state: GameState) => {
  const g = gal(state);
  if (!g || !g.talk || galleryOn(state) || g.phase === 'card') return;
  const x = g.man ? g.man.pos.x + g.man.width / 2 : g.phase === 'beat' ? g.manX : BOOTH.man;
  const top = g.man ? g.man.pos.y : GY - 84;
  saidOver(c, g.talk.text, x, top - 12, '#FDE68A');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the gallery (over everything: the HUD's pass)

const drawPiece = (c: Ctx, g: Gallery, p: Piece) => {
  if (!p.alive || !p.cv) return;
  const q = p.vt >= 0 || p.falling ? { x: p.x, y: p.y, on: true, rot: p.rot } : placeOf(g, p, g.t);
  c.save();
  // (the ducks run inside the posts; the bandits drop in behind their fence)
  if (p.kind === 'duck' && !p.falling) { c.beginPath(); c.rect(20, 0, 360, ART_H); c.clip(); }
  if (p.kind === 'bandit') { c.beginPath(); c.rect(0, 0, ART_W, FENCE_Y + 5); c.clip(); }
  let lx = q.x, ly = q.y;
  if (p.kind === 'wheel' || p.kind === 'lantern') {
    const px0 = q.x + p.w / 2, py0 = p.kind === 'wheel' ? q.y + p.h / 2 : q.y;
    c.translate(px0, py0); c.rotate(q.rot ?? 0); lx = -p.w / 2; ly = p.kind === 'wheel' ? -p.h / 2 : 0;
  }
  if (p.vt < 0) c.drawImage(p.cv, Math.round(lx), Math.round(ly));
  else if (p.vt < VH) {
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
    const a = aimAngle(g);
    c.save(); c.translate(GUN_PIV[0], GUN_PIV[1]); c.rotate(a); c.translate(-g.recoil * 12, 0); c.scale(GUN_S, GUN_S);
    c.drawImage(g.gunCv, -GUN_PIVOT[0], -GUN_PIVOT[1]);
    // (the coils glowing)
    if (f % 10 < 5) { c.fillStyle = 'rgba(255,140,228,0.55)'; c.fillRect(136, 6, 10, 17); }
    c.restore();
  }
  // THE CURSOR: a crosshair, pink and white, inked
  {
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
  if (g.talk) saidOver(c, g.talk.text, 640, 360, '#FDE68A', 300);
  if (g.mh) saidOver(c, g.mh.text, 360, 470, '#FFFFFF', 300);
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
  const W = 196, H = 220, tier = g.tier, sh = tier >= 3 ? tier - 1 : 0;
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
    for (let n = 0; n < tier * 2; n++) { const sx = x + 30 + ((n * 47) % (W - 60)), sy = y + 40 + ((f * (1.2 + n * 0.2) + n * 37) % (H - 60)); box(c, sx, sy, 3, 5, '#9AD8F8'); box(c, sx, sy, 1, 2, '#FFFFFF'); }
    c.restore();
  }
  box(c, x + 6, y + 6, 72, 14, 'rgba(0,0,0,0.6)');
  c.font = '7px "Press Start 2P"'; c.fillStyle = '#FDE68A'; c.fillText('DOOLEY', x + 10, y + 17);
};

/** The town going away under it (a death mid-ask): the box down. */
export const dropGallery = (state: GameState) => { const g = gal(state); if (g?.ask) { closeAsk(); g.ask = null; } if (g?.card) { closeShardCard(); g.card = null; } if (g && g.phase !== 'idle') setUi({ chordTips: null }); };

void RAIL_A; void RAIL_C;
