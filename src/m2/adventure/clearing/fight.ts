// SAFARI ARTIE, the fight. Three bushes in the clearing, and his game:
//
//   HIDDEN BALL  He dives into a bush and shuffles: dives (a leap over, plain to see) and, later, crawls (a ripple
//                through the grass, his helmet just showing) between the bushes, faster and more of them as the fight
//                goes on; late on, a bush he isn't in rustles too. Then he comes up out of one:
//                  - Meathead at that bush (its plane): he grabs him and guts him with his knife (three stabs), then
//                    drops him.
//                  - Anywhere else: the blowgun, a quick dart; it poisons him (damage over a few seconds, then it's
//                    done). If the poison kills him, he pukes himself to death.
//                While he's up out of the bush, one shot knocks him out of it into the clearing, seeing stars: the
//                window to blast him.
//   THE WHISTLE  After that (stunned or not) he's out in the open: his mating whistle, and here they come, a rhino, a
//                hippo, an elephant (one at a time early on, several later, spaced unevenly). One gets to him and he
//                leaps up out of its way onto a vine. Then back into a bush, and round again.
//
// His weakness is the spawner. Its litter goes for a bush if it sees the bush before it sees anybody, and eats it: the
// fewer bushes, the fewer places to hide (two: the shuffle's between two; one: no shuffle; none: no more hiding, he
// whistles up the herd and goes up his vine to stay). Enough of them on him at once and he loses it (agitated): too
// busy slapping at them to get out of the way, and the first animal through flattens him (a big hit).
//
//   THE VINE     Flattened, he doesn't lie there: he scrambles up a vine and stays up it (with no bushes left, he goes
//                up and stays up any time), the herd thundering by under him one after another, and now and then a
//                dart down at Meathead. Shots and blows hurt him up there the same as anywhere, but nothing knocks him
//                off it: only the litter, chewing through the vine over his hands. Down he drops, and it's the fall
//                that leaves him seeing stars (the window to blast him), and the first animal through flattens him
//                again: back up. Whatever's stampeding runs over the litter (squashed).
//
// Two deaths, Meathead 1's way: beaten by his weakness (finished off by the litter, or while they're on him, or by the
// stampede they left him in the way of), he's eaten alive (eaten.ts: the gory one); beaten any other way, he goes down
// face first in the dirt, rear in the air, and lets one last one go.
//
// The old rules for hurting a boss (Meathead 1's): after a hit, a breather (ENEMY_HIT_COOLDOWN frames, flickering)
// when nothing else gets in. The litter's nibbles don't count as hits: they get through, and give him no breather.
// (He's a mid-boss to the engine, so every weapon hits him its mid-boss way; his own health is kept here, the enemy's
// is just what tells us he's been hit.)

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, WeaponType } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hurtTaken } from '../../../m1/game/core/resist';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerDeathKind, type MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { body as drawMeatheadBody } from '../../../m1/game/render/player/deathAnim';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { aliensOn, brushOff, popAliensIn, setSpawnerBaits, takeBites, type SpawnerBait } from '../../weapons/spawner';
import { grabCallout } from '../../moves/callouts';
import { type Eaten, startEaten, updateEaten, landEaten, collapse, drawEatenStanding, drawEatenLoose, swarmAt, FLESH_END, COLLAPSE_MIN, COLLAPSE_MAX } from './eaten';
import { drawSafariArtie, ROOF_SCUFFS, type ArtiePose } from '../river/artie';
import { box, label, saidOver, hands, speak, voice, meatheadSays } from '../section';
import { GY } from '../geometry';
import { ARENA_L, ARENA_R, ARENA_MID, BLIND_X, BLIND_Y, BUSH_X, BUSH_W, BUSH_H } from './arena';
import { type Animal, type Beast, BEASTS, makeStampede, updateStampede, stampedeOver, nearestTo, clearStampede, drawStampede, drawWarnings } from './stampede';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------------------------------------------------------
// The numbers

/** His health (Meathead 1's bosses: 666), and the enemy's (never runs out: the hits are taken off ours). */
const HP = 666, BIG = 100000;
/** The breather after a hit (Meathead 1's). */
const IFRAMES = ENEMY_HIT_COOLDOWN;
/** A bush: how much chewing it takes (a litter of three on it eats one in about five seconds). */
const BUSH_HP = 90;
/** Stunned: shot out of his bush, or dropped off his chewed-through vine. */
const STUN = 170;
/** Up his vine to stay: a dart down at Meathead every so often (by how far on the fight is), the blowgun up this long first. */
const SPIT_EVERY = [0, 170, 140, 110], SPIT_AIM = 24;
/** Run down while he's agitated: the big hit. */
const TRAMPLE_DMG = 150;
/** The litter's bites, on him: only this share of each (one of them's nothing to him; it's what they do to him). */
const NIBBLE_SHARE = 0.2;
/** His vine: how much chewing it takes (it's the same vine each time he goes up, till it's chewed through). */
const VINE_HP = 30;
/** Hanging off it: how much vine there is above his hands (what they can get at). */
const VINE_UP = 150;
/** Hanging off it: how high his feet are (over the elephant's back; in reach of a jump and an uppercut). */
const VINE_AT = 172;
/** This many of the litter on him at once and he's lost it. */
const AGITATE_AT = 4;
/** The knife: each stab, the last one (and the drop); the blowgun's dart, the poison (every so often, for so long). */
const STAB = 9, STAB_LAST = 10, DART_DMG = 5, DART_SPEED = 11, POISON_TICK = 3, POISON_EVERY = 30, POISON_LEN = 240;
/** How far off a bush's middle still counts as at it (its plane), and how high up off the ground. */
const PLANE = BUSH_W / 2 + 12, PLANE_UP = 110;
/** The puke death, how long. */
const PUKE_LEN = 190;

/** Sources of hurt (each with its lines and its death screen). */
const KNIFE = 'm2:safari_knife', BLOWDART = 'm2:safari_dart', POISON = 'm2:safari_poison';
registerHurtLines(KNIFE, L.HURT_KNIFE, L.DEATH_KNIFE);
registerHurtLines(BLOWDART, L.HURT_BLOWDART, L.DEATH_BLOWDART);
registerHurtLines(POISON, L.HURT_POISON, L.DEATH_POISON);
registerHurtLines('m2:rhino', L.HURT_RHINO, L.DEATH_RHINO);
registerHurtLines('m2:hippo', L.HURT_HIPPO, L.DEATH_HIPPO);
registerHurtLines('m2:elephant', L.HURT_ELEPHANT, L.DEATH_ELEPHANT);
// (the rhino knocks him clean out of his boots; the hippo and the elephant flatten him)
registerDeathKind('m2:rhino', 'roadkill');
registerDeathKind('m2:hippo', 'flattened');
registerDeathKind('m2:elephant', 'flattened');

// ---------------------------------------------------------------------------------------------------------------
// The state

export type Mode =
  | 'intro'    // down out of his blind, diving into the first bush
  | 'hidden'   // in a bush, waiting
  | 'move'     // the shuffle: diving or crawling from one bush to the next
  | 'rise'     // coming up out of one
  | 'reach'    // reaching out for him
  | 'gut'      // got him: the knife
  | 'aim'      // the blowgun up
  | 'exposed'  // done: stood there in the bush a moment
  | 'hop'      // out of the bush into the open
  | 'knocked'  // shot out of it, flying
  | 'stunned'  // on his backside, stars
  | 'whistle'  // the mating whistle
  | 'watch'    // the stampede going by
  | 'dodge'    // up on a vine out of the way of one (or to stay: `perch`)
  | 'trampled' // run down (agitated): flying
  | 'divein'   // back into a bush
  | 'dead';

interface Bush { x: number; hp: number; shake: number; gone: boolean; goneAt: number; chewed: number; bait: SpawnerBait }
interface Move { to: number; how: 'dive' | 'crawl'; d: number; pause: number; fromX: number }
interface Dart { x: number; y: number; vx: number; vy: number; life: number }

export interface Fight {
  hp: number; iframes: number; flash: number;
  mode: Mode; t: number;
  /** Where he is: his middle, his feet; which way he faces. */
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  /** An arc he's on (intro, hop, dive in): from, to, how long, how high. */
  arc: { x0: number; y0: number; x1: number; y1: number; d: number; up: number } | null;
  bush: number; bushes: Bush[];
  moves: Move[]; moveI: number; decoy: number; wait: number;
  /** What comes after the stun. */
  after: 'whistle' | 'bush'; stunLen: number;
  agitated: boolean; calmT: number; swatT: number;
  herd: Animal[]; stampedes: number; overT: number;
  darts: Dart[];
  /** Him: poisoned (frames left); grabbed. */
  poison: number; pokes: number;
  said: string | null; nextCups: number;
  /** How the last of his health went: the litter's nibbles, or the stampede he couldn't dodge (his weakness, both). */
  byWeakness: boolean;
  death: { how: 'eaten' | 'flat'; t: number; x: number; facing: 1 | -1 } | null;
  /** Eaten alive (his weakness death): how it's going; his say through it (which line he's on; Meathead's after). */
  eaten: Eaten | null; eatenSaid: number; eatenOver: boolean;
  /** The kill cam on it (Meathead 1's alien kill): the cut in close, the slow motion. */
  cam: KillCam | null;
  puke: { x: number; y: number; facing: 1 | -1; lastT: number } | null;
  noBushesSaid: boolean;
  /** His vine: what's left of it, what's been chewed off it since; snapped (the bit that came down with him, falling). */
  vineHp: number; vineChewed: number; vine: SpawnerBait; snap: { x: number; y: number; t: number } | null;
  /** Dropped off his chewed-through vine, seeing stars: the first animal through runs him down. */
  dropped: boolean;
  /** No bushes left: the gap before the next animal of the endless stampede comes out (after the last one). */
  feedGap: number;
  /** Up his vine to stay (flattened, or no bushes left): till the litter chews through it. The next dart's count. */
  perch: boolean; spitT: number;
  e: Enemy;
}

/** The fight going on now (the bushes the spawner sees; Artie's look). */
let live: Fight | null = null;
/** A fresh start (a new life): nothing of the last one's left to see. */
export const resetFight = () => { live = null; };

setSpawnerBaits(() => (live && live.mode !== 'dead' ? [...live.bushes.filter(b => !b.gone).map(b => b.bait), live.vine] : []));
/** Hanging off his vine (up, and staying there). */
const hanging = (f: Fight) => f.mode === 'dodge' && f.t > 12 && f.vy === 0;

// ---------------------------------------------------------------------------------------------------------------
// Artie, the enemy

const ARTIE_KIND = 'm2:safariartie' as const;
registerM2Kind({
  kind: ARTIE_KIND,
  // (in the air, as far as the engine's concerned: he puts himself where he is, no floor under him to snap to)
  stats: { w: 34, h: 86, hp: BIG, contact: 0, mass: 260, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm',
  humanoid: true, grab: 'none', midBoss: true,
  head: { x: 2, y: -66, r: 10 },
  draw: (c, _e, fr) => {
    const f = live;
    if (!f) { drawSafariArtie(c, 0, 0, 1, fr, 'stand'); return; }
    // (eaten alive: that, instead)
    if (f.eaten) { drawEatenStanding(c, f.eaten, fr, beaten(f), !!f.said); return; }
    const blink = f.iframes > 0 && f.mode !== 'dead' && Math.floor(fr / 4) % 2 === 0;
    if (blink) c.globalAlpha = 0.45;
    // (coming up out of the bush: none of him below the ground)
    const sunk = f.y - GY;
    if (sunk > 0) { c.save(); c.beginPath(); c.rect(-120, -300, 240, 300 - sunk); c.clip(); }
    drawSafariArtie(c, 0, 0, 1, fr, poseOf(f), beaten(f));
    if (sunk > 0) c.restore();
    if (blink) c.globalAlpha = 1;
  },
  ai: () => true,
});

/** How beaten up he looks: his real HP (the enemy's own is only a hit detector), on top of the roof's scuffs. */
const beaten = (f: Fight) => Math.max(ROOF_SCUFFS, 1 - Math.max(0, f.hp) / HP);

const poseOf = (f: Fight): ArtiePose => {
  // (hit up his vine, he hangs on: no letting go to clutch himself)
  if (f.flash > 0 && f.mode !== 'stunned' && f.mode !== 'gut' && f.mode !== 'dodge') return 'hurt';
  switch (f.mode) {
    case 'reach': case 'gut': return 'grab';
    case 'aim': return 'blowgun';
    case 'exposed': return f.agitated ? 'agitated' : 'talk';
    case 'hop': return f.agitated ? 'agitated' : 'run';
    case 'knocked': case 'trampled': case 'dead': return 'hurt';
    case 'stunned': return 'stunned';
    case 'whistle': return 'whistle';
    case 'watch': return f.agitated ? 'agitated' : f.said ? 'talk' : 'point';
    case 'dodge': return 'dodge';
    default: return f.said ? 'talk' : 'stand';
  }
};

/** He's out where he can be hit (in the world, as an enemy). */
const OUT: ReadonlySet<Mode> = new Set(['reach', 'gut', 'aim', 'exposed', 'hop', 'knocked', 'stunned', 'whistle', 'watch', 'dodge', 'trampled']);
/** Up out of a bush: a hit there knocks him out of it. */
const IN_BUSH: ReadonlySet<Mode> = new Set(['rise', 'reach', 'gut', 'aim', 'exposed']);
const isOut = (f: Fight) => OUT.has(f.mode) || (f.mode === 'rise' && f.t >= 16);

// ---------------------------------------------------------------------------------------------------------------
// Saying things (he never shuts up: barks, dropped if somebody's already talking; the big ones wait their turn)

const bark = (f: Fight, lines: readonly string[]) => {
  const text = pick(lines);
  say(text, voice('m2.safari'), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
const announce = (f: Fight, lines: readonly string[], onDone?: () => void) => speak('m2.safari', pick(lines), s => { f.said = s?.text ?? null; }, true, onDone);

// ---------------------------------------------------------------------------------------------------------------
// Starting

export const startFight = (state: GameState): Fight => {
  const e = makeKindEnemy(ARTIE_KIND as EnemyKind, BLIND_X, BLIND_Y);
  e.facing = -1; e.seen = true;
  const f: Fight = {
    hp: HP, iframes: 0, flash: 0, mode: 'intro', t: 0, x: BLIND_X, y: BLIND_Y, vx: 0, vy: 0, facing: -1, arc: null,
    bush: 2, bushes: [], moves: [], moveI: 0, decoy: -1, wait: 0, after: 'whistle', stunLen: STUN,
    agitated: false, calmT: 0, swatT: 0, herd: [], stampedes: 0, overT: 0, darts: [], poison: 0, pokes: 0,
    said: null, nextCups: 0, byWeakness: false, death: null, eaten: null, eatenSaid: 0, eatenOver: false, cam: null, puke: null, noBushesSaid: false,
    vineHp: VINE_HP, vineChewed: 0, vine: null as unknown as SpawnerBait, snap: null, dropped: false, feedGap: 0, perch: false, spitT: 0, e,
  };
  // (the vine: up over his hands while he's hanging off it)
  f.vine = {
    get x() { return f.x - 8; }, get y() { return f.y - 86 - VINE_UP; }, w: 16, h: VINE_UP, air: true,
    alive: () => live === f && hanging(f),
    bite: d => { f.vineChewed += d; },
  };
  f.bushes = BUSH_X.map(x => {
    const b: Bush = { x, hp: BUSH_HP, shake: 0, gone: false, goneAt: 0, chewed: 0, bait: null as unknown as SpawnerBait };
    b.bait = { x: x - BUSH_W / 2, y: GY - BUSH_H, w: BUSH_W, h: BUSH_H, alive: () => !b.gone && live === f && f.mode !== 'dead', bite: d => { b.chewed += d; } };
    return b;
  });
  // (down out of his blind, into the bush furthest from him)
  const p = state.player, px = p.pos.x + p.width / 2;
  f.bush = Math.abs(px - BUSH_X[0]) > Math.abs(px - BUSH_X[2]) ? 0 : 2;
  f.arc = { x0: BLIND_X, y0: BLIND_Y, x1: BUSH_X[f.bush], y1: GY, d: 46, up: 90 };
  live = f;
  playSound('jump', 0.8);
  announce(f, L.ARTIE_START);
  return f;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const phase = (f: Fight) => (f.hp > HP * 0.66 ? 1 : f.hp > HP * 0.33 ? 2 : 3);
const liveBushes = (f: Fight) => f.bushes.map((b, i) => (b.gone ? -1 : i)).filter(i => i >= 0);
const to = (f: Fight, m: Mode) => { f.mode = m; f.t = 0; };
const px = (state: GameState) => state.player.pos.x + state.player.width / 2;
const inPlane = (state: GameState, f: Fight) => {
  const p = state.player;
  return Math.abs(px(state) - f.bushes[f.bush].x) < PLANE && p.pos.y + p.height > GY - PLANE_UP && p.health > 0 && state.deathTimer <= 0;
};
const faceHim = (state: GameState, f: Fight) => { f.facing = px(state) < f.x ? -1 : 1; };

export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx;
  live = f;
  f.t++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  takeHits(ctx, f);
  if (f.hp <= 0 && f.mode !== 'dead') die(ctx, f);
  chewBushes(ctx, f);
  chewVine(ctx, f);
  for (const b of f.bushes) if (b.shake > 0) b.shake--;
  if (isOut(f) && f.mode !== 'dead') agitation(ctx, f);
  tickPoison(ctx, f);
  let out = controls;
  switch (f.mode) {
    case 'intro': if (onArc(f)) { landInBush(state, f); hide(f); } break;
    case 'hidden': if (f.t >= f.wait) { if (f.moves.length) { to(f, 'move'); f.moveI = 0; } else to(f, 'rise'); } break;
    case 'move': shuffle(ctx, f); break;
    case 'rise': rise(ctx, f); break;
    case 'reach':
      faceHim(state, f);
      if (f.t >= 12) {
        if (inPlane(state, f)) { to(f, 'gut'); bark(f, L.ARTIE_GRAB); playSound('punch', 0.6); }
        else to(f, 'exposed');
      }
      break;
    case 'gut': out = gut(ctx, f, controls); break;
    case 'aim':
      faceHim(state, f);
      if (f.t === 1 && Math.random() < 0.6) bark(f, L.ARTIE_DART);
      if (f.t >= 30) { fireDart(state, f); to(f, 'exposed'); }
      break;
    case 'exposed': if (f.t >= 40) hopOut(state, f); break;
    case 'hop': if (onArc(f)) whistle(f); break;
    case 'knocked': case 'trampled':
      f.x = Math.max(ARENA_L + 30, Math.min(ARENA_R - 30, f.x + f.vx)); f.vy += 0.5; f.y += f.vy;
      if (f.y >= GY) {
        f.y = GY; playSound('thud', 0.8); shakeScreen(state, 8, 4);
        // (flattened: no lying there, it's up a vine and staying there; dropped, or shot out of his bush: stars)
        if (f.mode === 'trampled') perch(f);
        else to(f, 'stunned');
      }
      break;
    case 'stunned':
      if (f.t % 40 === 1) playSound('twinkle', 0.4, 6);
      if (f.t >= f.stunLen) {
        f.dropped = false;
        if (!stampedeOver(f.herd)) to(f, 'watch');
        else if (f.after === 'whistle' || f.agitated) whistle(f);
        else diveIn(state, f);
      }
      break;
    case 'whistle':
      if (f.t === 1) { playSound('beep', 0.7, 14); bark(f, L.ARTIE_WHISTLE); }
      if (f.t === 14) playSound('beep', 0.7, 20);
      if (f.t === 30) playSound('beep', 0.6, 16);
      if (f.t % 10 === 0) state.particles.push({ pos: { x: f.x + f.facing * 10, y: f.y - 76 }, vel: { x: f.facing * 0.6, y: -1.2 }, life: 40, color: '#F472B6', size: 4 });
      if (f.t >= 60) stampede(state, f);
      break;
    case 'watch': watch(state, f); break;
    case 'dodge':
      // (up onto the vine; hanging on till it's gone by (or, up to stay, till it's chewed through); down)
      if (f.t <= 12) { f.y = GY - VINE_AT * Math.sin((f.t / 12) * Math.PI / 2); f.vy = 0; }
      else if (f.vy === 0 && (staying(f) || nearestTo(f.herd, f.x) < 150)) { if (staying(f)) perched(ctx, f); }
      else { f.vy += 0.6; f.y = Math.min(GY, f.y + f.vy); if (f.y >= GY) { f.vy = 0; playSound('land', 0.6); to(f, 'watch'); } }
      break;
    case 'divein': if (onArc(f)) { if (f.bushes[f.bush].gone) diveIn(state, f); else { landInBush(state, f); hide(f); } } break;
    case 'dead':
      if (!f.death) break;
      f.death.t++;
      if (f.eaten) eatenAlive(ctx, f);
      else {
        // (the standard death's beats: face first into the dirt, then the last one out of him)
        const t = f.death.t;
        if (t === 38) { playSound('thud', 1, -4); playSound('crash', 0.4, -6); shakeScreen(state, 6, 3); }
        if (t === 84) playSound('fart', 1, -2);
        if (t === 150) playSound('fart', 0.5, 8);
      }
      break;
  }
  if (f.snap && ++f.snap.t > 50) f.snap = null;
  feed(state, f);
  updateStampede(ctx, f.herd, isOut(f) && f.mode !== 'dead' ? f.x : null, a => animalAtArtie(ctx, f, a), f.mode === 'gut');
  updateDarts(ctx, f);
  sync(state, f);
  return out;
};

/** He's on an arc (intro, hop, dive in): along it. True when he's there. */
const onArc = (f: Fight) => {
  const a = f.arc;
  if (!a) return true;
  const k = Math.min(1, f.t / a.d);
  f.x = a.x0 + (a.x1 - a.x0) * k;
  f.y = a.y0 + (a.y1 - a.y0) * k - Math.sin(k * Math.PI) * a.up;
  f.facing = a.x1 < a.x0 ? -1 : 1;
  if (k >= 1) { f.arc = null; return true; }
  return false;
};

const leaves = (state: GameState, x: number, n: number, y = GY - BUSH_H * 0.6) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * BUSH_W * 0.8, y: y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 30 + Math.random() * 20, color: ['#15803D', '#166534', '#65A30D'][i % 3], size: 3 + Math.random() * 3, grav: 0.15 });
};

const landInBush = (state: GameState, f: Fight) => {
  const b = f.bushes[f.bush];
  f.x = b.x; f.y = GY; b.shake = 18;
  leaves(state, b.x, 8);
  playSound('crash', 0.35, 6);
};

/** Into the bush: and the shuffle planned (between however many are left). */
const hide = (f: Fight) => {
  to(f, 'hidden');
  f.wait = 30;
  f.moves = []; f.decoy = -1;
  const bs = liveBushes(f);
  if (bs.length >= 2) {
    const ph = phase(f);
    const n = ph === 1 ? 3 : ph === 2 ? 4 : 5;
    const d = ph === 1 ? 32 : ph === 2 ? 26 : 20, pause = ph === 1 ? 16 : ph === 2 ? 11 : 7;
    const crawl = ph === 1 ? 0 : ph === 2 ? 0.35 : 0.45;
    let at = f.bush;
    for (let i = 0; i < n; i++) {
      const others = bs.filter(j => j !== at);
      const next = pick(others);
      const how = Math.random() < crawl ? 'crawl' : 'dive';
      f.moves.push({ to: next, how, d: how === 'crawl' ? Math.round(d * 1.3) : d, pause, fromX: f.bushes[at].x });
      at = next;
    }
    // (late on, another bush rustles too, as he comes up)
    if (ph === 3 && Math.random() < 0.6) { const o = bs.filter(j => j !== at); if (o.length) f.decoy = pick(o); }
  } else f.wait = 70;
};

/** The shuffle: each move, there and a pause; then up he comes. */
const shuffle = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const m = f.moves[f.moveI];
  if (!m) { to(f, 'rise'); return; }
  if (f.moveI === 0 && f.t === 1 && state.frame >= f.nextCups) { bark(f, L.ARTIE_CUPS); f.nextCups = state.frame + 400; }
  const tx = f.bushes[m.to].x;
  if (f.t === 1) { f.bushes[f.bush].shake = 12; playSound(m.how === 'dive' ? 'whoosh' : 'step_dirt', 0.5, m.how === 'dive' ? 4 : 0); }
  if (f.t <= m.d) {
    const k = f.t / m.d;
    f.x = m.fromX + (tx - m.fromX) * k;
    f.y = m.how === 'dive' ? GY - Math.sin(k * Math.PI) * 110 : GY;
    f.facing = tx < m.fromX ? -1 : 1;
    if (m.how === 'crawl' && f.t % 3 === 0) state.particles.push({ pos: { x: f.x, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() }, life: 16, color: '#65A30D', size: 3, grav: 0.2 });
    if (f.t === m.d) {
      f.bush = m.to;
      // (it's been eaten while he was on his way: he lands in nothing, in the open)
      if (f.bushes[f.bush].gone) { f.x = tx; f.y = GY; knock(ctx, f, false); return; }
      landInBush(state, f);
    }
    return;
  }
  if (f.t >= m.d + m.pause) {
    f.moveI++; f.t = 0;
    if (f.moveI >= f.moves.length) { to(f, 'rise'); if (f.decoy >= 0 && !f.bushes[f.decoy].gone) f.bushes[f.decoy].shake = 30; }
  }
};

/** Up out of the bush: a shake, then him; then what he does depends on where Meathead is. */
const rise = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const b = f.bushes[f.bush];
  if (b.gone) { knock(ctx, f, false); return; }
  f.x = b.x;
  if (f.t < 16) { b.shake = Math.max(b.shake, 4); f.y = GY + 60; return; }
  if (f.t === 16) { playSound('crash', 0.4, 8); leaves(state, b.x, 6); }
  faceHim(state, f);
  f.y = GY + 60 * Math.max(0, 1 - (f.t - 16) / 12);
  if (f.t >= 28) { f.y = GY; to(f, inPlane(state, f) ? 'reach' : 'aim'); }
};

/** Got him: pinned in front of him, stabbed three times, dropped. */
const gut = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  if (p.health <= 0 || state.deathTimer > 0) { to(f, 'exposed'); return controls; }
  p.pos.x = f.x + f.facing * 26 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0;
  p.facing = (f.facing > 0 ? -1 : 1);
  if (f.t === 18 || f.t === 38) {
    hurtPlayer(ctx, STAB, KNIFE, undefined, 0);
    blood(state, p.pos.x + p.width / 2, p.pos.y + p.height * 0.5, f.facing);
    playSound('splat', 0.8); playSound('punch', 0.5, 6);
  }
  if (f.t === 60) {
    hurtPlayer(ctx, STAB_LAST, KNIFE, { x: f.facing * 7, y: -6 }, 18);
    blood(state, p.pos.x + p.width / 2, p.pos.y + p.height * 0.5, f.facing);
    playSound('splat', 1); shakeScreen(state, 10, 5);
    to(f, 'exposed');
  }
  return hands();
};
const blood = (state: GameState, x: number, y: number, dir: number) => {
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 4), y: -2 - Math.random() * 3 }, life: 30, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.35 });
};

const fireDart = (state: GameState, f: Fight, sx = f.x + f.facing * 46, sy = f.y - 62) => {
  const p = state.player;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.35;
  const d = Math.hypot(tx - sx, ty - sy) || 1;
  f.darts.push({ x: sx, y: sy, vx: ((tx - sx) / d) * DART_SPEED, vy: ((ty - sy) / d) * DART_SPEED, life: 120 });
  playSound('dart', 0.9, 4); playSound('whoosh', 0.4, 10);
};

const updateDarts = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.darts = f.darts.filter(d => {
    d.x += d.vx; d.y += d.vy; d.life--;
    if (d.life <= 0 || d.y > GY || d.x < ARENA_L - 40 || d.x > ARENA_R + 40) return false;
    const top = p.pos.y + (p.isDucking || p.isSliding ? 28 : 0);
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && d.x > p.pos.x - 4 && d.x < p.pos.x + p.width + 4 && d.y > top && d.y < p.pos.y + p.height) {
      hurtPlayer(ctx, DART_DMG, BLOWDART, { x: Math.sign(d.vx) * 3, y: -3 }, 10);
      f.poison = POISON_LEN; f.pokes = 0;
      playSound('squish', 0.6);
      return false;
    }
    return true;
  });
};

/** Poisoned: a bit at a time, then it's run its course. Killed by it, he pukes himself to death. */
const tickPoison = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  if (f.poison <= 0 || p.health <= 0 || state.deathTimer > 0) return;
  f.poison--;
  if (f.poison % 8 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + p.facing * 8, y: p.pos.y + 16 }, vel: { x: p.facing * 0.3, y: 0.6 }, life: 24, color: '#84CC16', size: 2, grav: 0.2 });
  if (f.poison % POISON_EVERY !== 0) return;
  f.pokes++;
  if (!ctx.cheats.invincible) p.health -= hurtTaken(ctx.stageId, POISON_TICK);
  state.lastHurt = { source: POISON, at: state.frame };
  playSound('retch', 0.45, Math.random() * 4);
  if (p.health <= 0) { pukeDeath(state, f); return; }
  if (f.pokes % 3 === 1) ctx.fx.speakVulgarity('hurt', POISON);
};

const pukeDeath = (state: GameState, f: Fight) => {
  const p = state.player;
  p.health = 0;
  p.hidden = true;
  f.puke = { x: p.pos.x + p.width / 2, y: Math.min(GY, p.pos.y + p.height), facing: p.facing, lastT: -1 };
  // (the death's his own: the stage plays it, then the screen goes up)
  state.deathScene = { t: 0, len: PUKE_LEN, voiced: false };
};

/** Out of the bush, into the open (to whistle). */
const hopOut = (state: GameState, f: Fight) => {
  to(f, 'hop');
  const dir = f.x < ARENA_MID ? 1 : -1;
  f.arc = { x0: f.x, y0: GY, x1: Math.max(ARENA_L + 40, Math.min(ARENA_R - 40, f.x + dir * 90)), y1: GY, d: 24, up: 50 };
  leaves(state, f.x, 6);
};

const whistle = (f: Fight) => { to(f, 'whistle'); f.facing = f.x < ARENA_MID ? 1 : -1; };

/** The herd, by how far on the fight is: one early, then two, then three, spaced unevenly. */
const stampede = (state: GameState, f: Fight) => {
  const ph = Math.max(phase(f), liveBushes(f).length === 0 ? 2 : 1);
  const n = ph;
  const order: Beast[] = ['rhino', 'hippo', 'elephant'];
  const kinds: Beast[] = [];
  for (let i = 0; i < n; i++) kinds.push(f.stampedes < 3 && i === 0 ? order[f.stampedes] : pick(order));
  const gaps = kinds.slice(1).map((k, i) => {
    // (one quicker behind a slower one gets more room, so it doesn't run up its back)
    const faster = BEASTS[k].speed > BEASTS[kinds[i]].speed;
    return Math.max(faster ? 70 : 34, pick([34, 50, 75, 100, 125]));
  });
  // (they come from the side he's furthest from: plenty of warning)
  const dir: 1 | -1 = px(state) < ARENA_MID ? -1 : 1;
  f.herd = f.herd.filter(a => !a.done).concat(makeStampede(kinds, dir, gaps));
  f.stampedes++;
  to(f, 'watch');
  f.facing = (-dir) as 1 | -1;
};

/** Watching them go by; when they're through, back into a bush (or, none left, whistle up the next lot). */
const watch = (state: GameState, f: Fight) => {
  if (!stampedeOver(f.herd)) { f.overT = 0; const a = f.herd.find(h => !h.done); if (a) f.facing = (-a.dir) as 1 | -1; return; }
  f.overT++;
  if (f.agitated) { if (f.overT > 30) whistle(f); return; }
  if (liveBushes(f).length) { if (f.overT > 20) diveIn(state, f); return; }
  if (!f.noBushesSaid) { f.noBushesSaid = true; bark(f, L.ARTIE_NO_BUSHES); }
  // (a breather, short: then he's at it again)
  if (f.overT > 20) whistle(f);
};

/**
 * No bushes left: the stampede doesn't stop while he's up his vine or seeing stars (one after
 * another, the same way, a fair gap each: more after the elephant, the one he has to go up and over); back on his
 * feet, none new start.
 */
const feed = (state: GameState, f: Fight) => {
  // (not while there's a bush left: then it's just the stampede he whistled up, however long he's up his vine)
  if (f.mode === 'dead' || liveBushes(f).length) return;
  const up = f.mode === 'dodge' || f.mode === 'stunned' || f.mode === 'knocked' || f.mode === 'trampled';
  if (!up || f.herd.some(a => !a.done && a.warn > 0)) return;
  const running = f.herd.filter(a => !a.done);
  const last = running.reduce<Animal | null>((m, a) => (!m || a.t < m.t ? a : m), null);
  if (last && last.t < f.feedGap) return;
  const kind = pick(['rhino', 'hippo', 'elephant'] as const);
  const dir: 1 | -1 = last ? last.dir : px(state) < ARENA_MID ? -1 : 1;
  f.herd = running.concat(makeStampede([kind], dir, []));
  // (the gap behind this one, before the next: so no faster one runs up its back, and there's room to get over it)
  f.feedGap = kind === 'elephant' ? 60 + Math.random() * 30 : 10 + Math.random() * 40;
};

/** One's got to him. */
const animalAtArtie = (ctx: FrameContext, f: Fight, a: Animal) => {
  if (f.mode === 'dead' || a.tame) return;
  // (down off his chewed-through vine, seeing stars: run down, the same as agitated, breather or not)
  if (f.dropped && (f.mode === 'stunned' || f.mode === 'knocked')) { f.dropped = false; flatten(ctx, f, a); return; }
  const free = f.mode === 'watch' || f.mode === 'whistle' || f.mode === 'hop' || f.mode === 'exposed';
  if (!free) return;
  // (too busy with the litter: flattened)
  if (f.agitated) { flatten(ctx, f, a); return; }
  to(f, 'dodge'); f.vy = 0;
  playSound('jump', 0.6, 4);
  if (Math.random() < 0.6) bark(f, L.ARTIE_DODGE);
};

/** Run down (too busy with the litter, or lying there off his vine): the big hit, flying; then up a vine (perch). */
const flatten = (ctx: FrameContext, f: Fight, a: Animal) => {
  const { state } = ctx;
  {
    f.hp -= TRAMPLE_DMG; f.iframes = IFRAMES; f.flash = 14;
    ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - 100 }, TRAMPLE_DMG, true);
    f.agitated = false; f.calmT = 0;
    to(f, 'trampled'); f.vx = a.dir * 5; f.vy = -11; f.after = 'bush';
    playSound('crunch', 1); playSound(BEASTS[a.kind].call, 0.8, BEASTS[a.kind].pitch); shakeScreen(state, 18, 9);
    blood(state, f.x, f.y - 40, a.dir);
    if (f.hp <= 0) { f.byWeakness = true; die(ctx, f); return; }
    bark(f, L.ARTIE_TRAMPLED);
  }
};

/** Up his vine to stay (he's been flattened: he's not lying about for the next one). */
const perch = (f: Fight) => {
  to(f, 'dodge'); f.vy = 0; f.perch = true; f.spitT = 0;
  playSound('jump', 0.6, 2);
  bark(f, L.ARTIE_PERCH);
};
/** He's staying up it (till it's chewed through). */
const staying = (f: Fight) => f.perch || liveBushes(f).length === 0;
/** Up there to stay: watching Meathead, and now and then the blowgun up, one-handed, and a dart down at him. */
const perched = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.perch = true;
  faceHim(state, f);
  if (p.health <= 0 || state.deathTimer > 0) { f.spitT = 0; return; }
  f.spitT++;
  if (f.spitT === SPIT_EVERY[phase(f)] - SPIT_AIM && Math.random() < 0.5) bark(f, L.ARTIE_DART);
  if (f.spitT >= SPIT_EVERY[phase(f)]) { f.spitT = 0; const m = mouth(f); fireDart(state, f, m.x, m.y); }
};
/** His mouth, hanging off the vine. */
const mouth = (f: Fight) => ({ x: f.x + f.facing * 4, y: f.y - 70 });
/** The blowgun's up (hanging off the vine): aiming. */
const aiming = (f: Fight) => f.mode === 'dodge' && f.perch && f.vy === 0 && f.t > 12 && f.spitT >= SPIT_EVERY[phase(f)] - SPIT_AIM;

/** The vine chewed: frayed, then through, and down he comes (seeing stars, for whatever's coming). */
const chewVine = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  if (f.vineChewed <= 0) return;
  f.vineHp -= f.vineChewed; f.vineChewed = 0;
  if (f.vineHp > 0 || !hanging(f)) return;
  f.vineHp = VINE_HP; f.perch = false;
  f.snap = { x: f.x, y: f.y - 86, t: 0 };
  to(f, 'knocked'); f.vx = 0; f.vy = 0; f.after = 'whistle'; f.stunLen = STUN; f.dropped = true;
  playSound('crack', 0.9, 4); playSound('whoosh', 0.5, -2);
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: f.x, y: f.y - 90 - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: i % 2 ? '#3F6212' : '#65A30D', size: 2 + Math.random() * 3, grav: 0.2 });
  bark(f, L.ARTIE_VINE_SNAP);
};

/** Shot out of his bush (or left in the open when it's eaten under him): flying out into the clearing, then stars. */
const knock = (ctx: FrameContext, f: Fight, shot: boolean) => {
  const { state } = ctx;
  to(f, 'knocked');
  f.vx = (f.x < ARENA_MID ? 1 : -1) * 3.5; f.vy = shot ? -9 : -6; f.y = Math.min(f.y, GY);
  f.after = 'whistle'; f.stunLen = STUN;
  if (f.bushes[f.bush] && !f.bushes[f.bush].gone) { f.bushes[f.bush].shake = 26; leaves(state, f.x, 10); }
  playSound('punch', 0.8); playSound('crash', 0.4, 4);
  bark(f, L.ARTIE_KNOCKED);
};

const diveIn = (state: GameState, f: Fight) => {
  const bs = liveBushes(f);
  if (!bs.length) { to(f, 'watch'); f.overT = 0; return; }
  // (the nearest, as often as not; or the furthest from him)
  const p = px(state);
  const far = bs.slice().sort((a, b) => Math.abs(f.bushes[b].x - p) - Math.abs(f.bushes[a].x - p))[0];
  const near = bs.slice().sort((a, b) => Math.abs(f.bushes[a].x - f.x) - Math.abs(f.bushes[b].x - f.x))[0];
  f.bush = Math.random() < 0.5 ? far : near;
  to(f, 'divein');
  f.arc = { x0: f.x, y0: f.y, x1: f.bushes[f.bush].x, y1: GY, d: 30, up: 100 };
  playSound('whoosh', 0.6);
};

/** The litter's on him: enough of them and he's lost it, slapping at himself (he gets one off now and then). */
const agitation = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const n = aliensOn(f.e);
  if (!f.agitated && n >= AGITATE_AT) {
    f.agitated = true; f.calmT = 0; f.swatT = 0;
    bark(f, L.ARTIE_AGITATED);
    // (up in a bush: out of it, flailing, and the whistle to have the herd run them off him)
    if (f.mode === 'gut') { const p = state.player; p.vel = { x: f.facing * 5, y: -5 }; }
    if (IN_BUSH.has(f.mode)) hopOut(state, f);
  }
  if (!f.agitated) return;
  if (n === 0) { if (++f.calmT > 120) f.agitated = false; } else f.calmT = 0;
  if (f.mode !== 'stunned' && f.mode !== 'knocked' && f.mode !== 'trampled' && ++f.swatT % 50 === 0) { brushOff(f.e, 1); playSound('punch', 0.3, 8); }
};

/** The hits: the enemy's health tells us he's been hit (and by how much); ours is kept here, by the old rules. */
const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const bites = takeBites(e);
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  if (f.mode === 'dead' || dealt <= 0 || !state.enemies.includes(e)) return;
  const nib = Math.min(dealt, bites), hit = dealt - nib;
  // (the litter's nibbles: always, no breather)
  if (nib > 0) { f.hp -= nib * NIBBLE_SHARE; if (f.hp <= 0) f.byWeakness = true; }
  if (hit > 0.5 && f.iframes <= 0) {
    f.hp -= hit; f.iframes = IFRAMES; f.flash = 10;
    if (f.hp <= 0) { f.byWeakness = aliensOn(e) > 0; return; }
    if (IN_BUSH.has(f.mode)) knock(ctx, f, true);
  }
};

/** A bush chewed: thinner, then gone (and if he's in it, out he comes). */
const chewBushes = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  f.bushes.forEach((b, i) => {
    if (b.gone || b.chewed <= 0) return;
    b.hp -= b.chewed; b.chewed = 0;
    if (state.frame % 3 === 0) b.shake = Math.max(b.shake, 3);
    if (b.hp > 0) return;
    b.gone = true; b.goneAt = state.frame;
    leaves(state, b.x, 24, GY - 30);
    playSound('crash', 0.5, 4); playSound('gnaw', 0.8);
    if (f.mode !== 'dead') bark(f, L.ARTIE_BUSH);
    if (f.bush === i && (f.mode === 'hidden' || f.mode === 'rise')) { f.x = b.x; f.y = GY; knock(ctx, f, false); }
    else if (f.bush === i && IN_BUSH.has(f.mode) && f.mode !== 'gut') hopOut(state, f);
  });
};

/** Beaten. */
const die = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const eaten = f.byWeakness || aliensOn(e) > 0;
  to(f, 'dead');
  f.poison = 0;
  // (the darts in the air: gone, a puff each)
  for (const d of f.darts) for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: d.x, y: d.y }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 18, color: i % 2 ? '#FDE047' : '#DC2626', size: 2, grav: 0.2 });
  f.darts = [];
  for (const a of f.herd) a.tame = true;
  f.flash = 0;
  f.perch = false;
  if (eaten) {
    // (he stays in the world, for the litter to keep at: and more of them pile on)
    if (!state.enemies.includes(e)) state.enemies.push(e);
    f.y = Math.min(f.y, GY); f.vx = 0; f.vy = 0;
    f.death = { how: 'eaten', t: 0, x: f.x, facing: f.facing };
    // (the arena's walls, in his own space: the loose bits of him stop at them)
    const lo = f.facing > 0 ? ARENA_L - f.x : f.x - ARENA_R, hi = f.facing > 0 ? ARENA_R - f.x : f.x - ARENA_L;
    f.eaten = startEaten(f.y - GY, lo, hi);
    if (f.y >= GY) landEaten(f.eaten);
    sync(state, f);
    ctx.fx.spawnKillCallout(e, grabCallout('alien'));
    state.player.killSatisfactionTimer = 60;
    // (the kill cam: a white flash, a cut in close on him, slow motion; out of Meathead's hands from here)
    f.cam = { t: 0, acc: 0, z: 1, payT: -1, out: false };
    state.player.inCutscene = true;
    state.damageNumbers = [];
    playSound('crack', 1.2, -10); playSound('thunder', 0.7, 4);
    playSound('gnaw', 1, -4); playSound('splat', 0.6, -2); playSound('chitter', 0.8);
    f.eatenSaid = 1;
    // (he never shuts up: through all of it, a line at a time, each when the last one's done)
    announce(f, L.ARTIE_EATEN, () => { f.eatenSaid = 2; announce(f, L.ARTIE_EATEN_MORE, () => { f.eatenSaid = 3; }); });
  } else {
    state.enemies = state.enemies.filter(o => o !== e);
    f.death = { how: 'flat', t: 0, x: f.x, facing: f.facing };
    f.y = GY;
    playSound('hurt', 0.8, -4);
    announce(f, L.ARTIE_DIES, () => meatheadSays(state, pick(L.MEATHEAD_WON)));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam (his weakness death: Meathead 1's alien kill, killCam.ts): a white flash and a cut in close on him, the
// game in slow motion, easing back up to speed as he's eaten, dipping again as the arm comes off; pulled back out once
// he's in a heap.

export interface KillCam { t: number; acc: number; z: number; payT: number; out: boolean }
/** How close it goes; the slow motion at the kill (held, then back up to speed), and again at the arm. */
const CAM_Z = 2.3, SLOW = 0.22, SLOW_HOLD = 45, SLOW_RAMP = 100, PAY_SLOW = 0.3, PAY_HOLD = 16, PAY_RAMP = 40;

/** Every real tick: the camera in (or back out), and whether this tick runs game time. True: it doesn't. */
export const killCamTick = (f: Fight): boolean => {
  const cam = f.cam;
  if (!cam) return false;
  cam.t++;
  cam.z += ((cam.out ? 1 : CAM_Z) - cam.z) * (cam.out ? 0.05 : cam.t < 6 ? 0.35 : 0.08);
  if (cam.out && cam.z < 1.004) cam.z = 1;
  let rate = cam.t < SLOW_HOLD ? SLOW : Math.min(1, SLOW + ((1 - SLOW) * (cam.t - SLOW_HOLD)) / SLOW_RAMP);
  if (cam.payT >= 0) { const d = cam.t - cam.payT; rate = Math.min(rate, d < PAY_HOLD ? PAY_SLOW : Math.min(1, PAY_SLOW + ((1 - PAY_SLOW) * (d - PAY_HOLD)) / PAY_RAMP)); }
  if (cam.out) rate = 1;
  cam.acc += rate;
  if (cam.acc >= 1) { cam.acc -= 1; return false; }
  return true;
};
/** The view pushed in on him (his middle in the middle of the screen, as far in as it's gone). */
export const killCamZoom = (state: GameState, f: Fight) => {
  const cam = f.cam, d = f.death;
  if (!cam || !d || cam.z <= 1) return null;
  const k = (cam.z - 1) / (CAM_Z - 1);
  const fx = d.x, fy = Math.min(GY, f.y) - 46;
  return { scale: cam.z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 + 40 - fy) };
};
/** Screen space: the flash it cuts in on, the bars. */
export const drawKillCam = (c: Ctx, f: Fight) => {
  const cam = f.cam;
  if (!cam) return;
  const k = cam.out ? Math.max(0, (cam.z - 1) / (CAM_Z - 1)) : Math.min(1, cam.t / 20);
  const bar = Math.round(k * 44);
  if (bar > 0) { c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
  if (cam.t < 14) { c.fillStyle = `rgba(255, 255, 255, ${(1 - cam.t / 14).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

/** Done with: the fight's over and he's had his say (the death played out). */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && (f.death.how === 'eaten' ? f.eatenOver : f.death.t > 300);

/**
 * Eaten alive, each frame: down out of the air first; then it goes on (eaten.ts), his lines through it, the skull
 * still talking; then the heap (the litter on him bursting, full), and Meathead's say.
 */
const eatenAlive = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, g = f.eaten!, d = f.death!;
  const at = (x: number, y: number) => ({ x: d.x + d.facing * x, y: GY + y });
  const ev = updateEaten(state, g, at);
  if (!g.landed) {
    f.y = GY + g.y;
    if (f.y >= GY) { f.y = GY; g.y = 0; landEaten(g); playSound('thud', 0.9); playSound('splat', 0.7); shakeScreen(state, 8, 4); }
    return;
  }
  if (ev === 'helmet') { playSound('bonk', 0.7, 4); playSound('gorespray', 0.5); }
  if (ev === 'arm') { playSound('crunch', 1, -2); playSound('gorespray', 0.9); shakeScreen(state, 6, 3); if (f.cam) f.cam.payT = f.cam.t; }
  if (ev === 'gut') { playSound('gush', 0.9, -2); playSound('squish', 0.7); }
  // (the skull's say, once the flesh is off it and he's done with the last one)
  if (f.eatenSaid === 3 && g.t > FLESH_END + 10) { f.eatenSaid = 4; announce(f, L.ARTIE_BONES, () => { f.eatenSaid = 5; }); }
  // Down it comes: when he's done talking (or he's taking too long about it)
  if (g.heapAt < 0 && ((f.eatenSaid === 5 && g.t > COLLAPSE_MIN) || g.t > COLLAPSE_MAX)) {
    collapse(g);
    // (the ones on him burst, full: his and the gun's both)
    for (const s of swarmAt(g)) { const w = at(s.x, s.y); for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: w.x, y: w.y }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 26, color: i % 2 ? '#65A30D' : '#BEF264', size: 2 + Math.random() * 2, grav: 0.3 }); }
    popAliensIn(state, f.x - 60, GY - 140, 120, 160);
    state.enemies = state.enemies.filter(o => o !== f.e);
    playSound('squish', 1, -2);
  }
  // (the kill cam pulls back out once he's in a heap)
  if (f.cam && g.heapAt >= 0 && g.t >= g.heapAt + 30) f.cam.out = true;
  // Meathead's say, after it; then it's over
  if (g.heapAt >= 0 && g.t === g.heapAt + 50) meatheadSays(state, pick(L.MEATHEAD_EATEN), true, () => { f.eatenSaid = 6; });
  if (g.heapAt >= 0 && ((f.eatenSaid === 6 && g.t > g.heapAt + 110) || g.t > g.heapAt + 600)) f.eatenOver = true;
};
/** The fight's done with: its animals' backs out of the world. */
export const endFight = (state: GameState, f: Fight) => { clearStampede(state, f.herd); };

/** The enemy, where he is (in the world while he's out, out of it while he's hidden). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  const want = isOut(f) && f.mode !== 'dead';
  const has = state.enemies.includes(e);
  if (want && !has) state.enemies.push(e);
  if (!want && has && f.mode !== 'dead') state.enemies = state.enemies.filter(o => o !== e);
  e.pos.x = f.x - e.width / 2; e.pos.y = f.y - e.height;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.returnHome = false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World space, behind everything that moves: the bushes (thinned as they're eaten, a stump of twigs once gone). */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  f.bushes.forEach(b => drawBush(c, state, b, false));
};

const LEAF = [[-46, -22, 22], [-22, -40, 26], [6, -46, 27], [32, -36, 24], [48, -18, 20], [-30, -12, 22], [20, -14, 24], [-4, -24, 24]] as const;
const drawBush = (c: Ctx, state: GameState, b: Bush, fringe: boolean) => {
  const k = b.gone ? 0 : Math.max(0, b.hp / BUSH_HP);
  const sx = b.shake > 0 ? Math.sin(state.frame * 1.7) * Math.min(6, b.shake * 0.5) : 0;
  c.save(); c.translate(Math.round(b.x + sx), GY);
  if (fringe) {
    // (the front of it, over whoever's in it: the leaves along the bottom)
    c.fillStyle = '#166534';
    for (const [x, y, r] of [[-44, -10, 20], [-16, -16, 22], [14, -16, 22], [42, -10, 20]] as const) { if (k * 4 < 0.5) break; c.beginPath(); c.arc(x, y, r * (0.6 + k * 0.4), 0, Math.PI * 2); c.fill(); }
    c.restore();
    return;
  }
  // twigs (more of them showing the more it's eaten)
  c.strokeStyle = '#4A3520'; c.lineWidth = 3;
  for (const [x, a] of [[-30, -0.5], [-8, -0.15], [12, 0.2], [34, 0.55]] as const) { c.beginPath(); c.moveTo(x * 0.4, 0); c.lineTo(x + Math.sin(a) * 30, -38 - Math.abs(x) * 0.2); c.stroke(); }
  if (b.gone) {
    // (eaten to the stalks: a few leaves lying about)
    c.fillStyle = '#365314';
    for (let i = 0; i < 5; i++) c.fillRect(-44 + i * 20, -3, 8, 3);
    c.restore();
    return;
  }
  const n = Math.max(1, Math.ceil(LEAF.length * k));
  LEAF.forEach(([x, y, r], i) => {
    if (i >= n) return;
    c.fillStyle = '#14532D'; c.beginPath(); c.arc(x, y, r + 2, 0, Math.PI * 2); c.fill();
  });
  LEAF.forEach(([x, y, r], i) => {
    if (i >= n) return;
    c.fillStyle = i % 2 ? '#15803D' : '#166534'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#22C55E'; c.fillRect(x - r * 0.4, y - r * 0.6, 4, 2);
  });
  // (bitten: holes in it)
  if (k < 1) { c.fillStyle = 'rgba(56, 189, 248, 0.35)'; for (let i = 0; i < Math.round((1 - k) * 6); i++) { c.beginPath(); c.arc(-40 + ((i * 37) % 80), -14 - ((i * 23) % 30), 6 + (i % 3) * 2, 0, Math.PI * 2); c.fill(); } }
  c.restore();
};

/** World space, over everything: the bush he's in over his legs, him when he's not an enemy, the herd, the darts, the
 *  stars, the vine, the notes, the poison on Meathead, his death, and Meathead's own (the puke). */
export const drawFightFront = (c: Ctx, state: GameState, f: Fight) => {
  const fr = state.frame;
  // Him, diving (in, between, out of the blind) or crawling: not an enemy just now, drawn here
  const travelling = f.mode === 'intro' || f.mode === 'divein' || (f.mode === 'move' && f.moves[f.moveI] && f.t <= f.moves[f.moveI].d);
  if (travelling) {
    const m = f.mode === 'move' ? f.moves[f.moveI] : null;
    if (m && m.how === 'crawl') {
      // (a ripple through the grass, the top of his helmet just showing)
      c.fillStyle = '#E8DDB5'; c.beginPath(); c.ellipse(f.x, GY - 3, 10, 7, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#78350F'; c.fillRect(f.x - 10, GY - 4, 20, 2);
      c.fillStyle = '#4D7C0F';
      for (let i = -3; i <= 3; i++) { const h = 8 + Math.abs(Math.sin(fr * 0.5 + i)) * 8; c.fillRect(f.x + i * 7 - 2, GY - h, 3, h); }
    } else {
      const k = f.mode === 'move' && m ? f.t / m.d : f.arc ? Math.min(1, f.t / f.arc.d) : 1;
      c.save(); c.translate(Math.round(f.x), Math.round(f.y - 43));
      c.rotate(f.facing * (Math.PI / 2 - 0.6 + k * 1.2));
      drawSafariArtie(c, 0, 43, f.facing, fr, 'dive', beaten(f));
      c.restore();
    }
  }
  // The bush he's in, over his legs
  if (IN_BUSH.has(f.mode) || f.mode === 'hidden') { const b = f.bushes[f.bush]; if (b && !b.gone) drawBush(c, state, b, true); }
  // The vine he's hanging off
  // (chewed: thinner where they've been at it, the more the thinner)
  if (f.mode === 'dodge') {
    const k = f.vineHp / VINE_HP, ny = f.y - 86 - VINE_UP * 0.55;
    c.strokeStyle = '#3F6212'; c.lineWidth = 4; c.beginPath(); c.moveTo(f.x, state.camera.y - 20); c.lineTo(f.x, ny - 7); c.moveTo(f.x, ny + 7); c.lineTo(f.x, f.y - 86); c.stroke();
    c.lineWidth = Math.max(1, 4 * k); c.beginPath(); c.moveTo(f.x, ny - 8); c.lineTo(f.x, ny + 8); c.stroke();
    if (k < 1) { c.strokeStyle = '#A3E635'; c.lineWidth = 1; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(f.x, ny); c.lineTo(f.x + sd * (3 + (1 - k) * 6), ny + sd * 3); c.stroke(); } }
  }
  // (snapped: the end of it coming down after him)
  if (f.snap) { const t = f.snap.t, fall = t * t * 0.25; c.strokeStyle = '#3F6212'; c.lineWidth = 3; c.beginPath(); c.moveTo(f.snap.x, f.snap.y - VINE_UP * 0.55 + fall); c.lineTo(f.snap.x + Math.sin(t * 0.3) * 6, f.snap.y + fall); c.stroke(); }
  // Stars round his head
  if (f.mode === 'stunned') for (let i = 0; i < 3; i++) { const a = fr * 0.12 + (i * Math.PI * 2) / 3; star(c, f.x + Math.cos(a) * 18, f.y - 62 + Math.sin(a) * 5, '#FDE047'); }
  // Notes, the whistle
  if (f.mode === 'whistle') for (let i = 0; i < 3; i++) { const t = (fr + i * 13) % 40; label(c, '♪', f.x + f.facing * (18 + t * 0.6), f.y - 80 - t, '#F472B6', 10); }
  // Agitated: a word over him
  if (f.agitated && isOut(f) && f.mode !== 'dead' && Math.floor(fr / 8) % 2 === 0) label(c, '!!', f.x, f.y - 110, '#F87171', 10);
  const p = state.player;
  // The herd and its warnings
  drawStampede(c, state, f.herd);
  drawWarnings(c, state, f.herd);
  // Darts
  for (const d of f.darts) { c.strokeStyle = '#000'; c.lineWidth = 3; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - d.vx * 1.2, d.y - d.vy * 1.2); c.stroke(); c.strokeStyle = '#FDE047'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - d.vx * 1.2, d.y - d.vy * 1.2); c.stroke(); box(c, d.x - 2, d.y - 2, 4, 4, '#DC2626'); }
  // Poisoned: green round the gills
  if (f.poison > 0 && p.health > 0 && !p.hidden) {
    const hx = p.pos.x + p.width / 2;
    for (let i = 0; i < 3; i++) { const t = (fr + i * 11) % 34; c.fillStyle = `rgba(132, 204, 22, ${(1 - t / 34).toFixed(2)})`; c.beginPath(); c.arc(hx - 8 + i * 8, p.pos.y - 6 - t * 0.7, 3 + t * 0.08, 0, Math.PI * 2); c.fill(); }
    label(c, 'POISONED', hx, p.pos.y - 34, '#A3E635', 6);
  }
  // Up his vine to stay, the blowgun up (one-handed, the other on the vine), aimed down at him
  if (aiming(f)) {
    const m = mouth(f), tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.35;
    const dd = Math.hypot(tx - m.x, ty - m.y) || 1, ux = (tx - m.x) / dd, uy = (ty - m.y) / dd;
    c.lineCap = 'round';
    c.strokeStyle = '#3E2E16'; c.lineWidth = 4.4; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x + ux * 40, m.y + uy * 40); c.stroke();
    c.strokeStyle = '#B89A58'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x + ux * 40, m.y + uy * 40); c.stroke();
    // (cheeks puffed)
    c.fillStyle = '#EAA080'; c.beginPath(); c.arc(m.x - f.facing, m.y + 1, 3.2 + Math.min(1, (f.spitT - SPIT_EVERY[phase(f)] + SPIT_AIM) / 12) * 1.6, 0, Math.PI * 2); c.fill();
  }
  // His death (face down in the dirt; or the loose bits of him, eaten); his words
  if (f.death?.how === 'flat') drawFlat(c, f, fr);
  if (f.eaten && f.death) { c.save(); c.translate(Math.round(f.death.x), GY); c.scale(f.death.facing, 1); drawEatenLoose(c, f.eaten, fr); c.restore(); }
  if (f.said) {
    const sx = Math.max(ARENA_L + 130, Math.min(ARENA_R - 130, f.x));
    const sy = f.mode === 'hidden' || f.mode === 'move' ? GY - BUSH_H - 40 : f.y - 104;
    saidOver(c, f.said, sx, Math.max(state.camera.y + 130, sy), '#FDE68A');
  }
  if (f.puke && state.deathScene) drawPuke(c, state, f);
};

const star = (c: Ctx, x: number, y: number, col: string) => {
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 2 : 5, a = (i * Math.PI) / 5 - Math.PI / 2; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath(); c.fill();
};

/**
 * Beaten (not by his weakness): Meathead 1's standard death, his way. He staggers back, wobbling, and goes over
 * forward, flat on his face, rear up in the air (a bounce, and the dust); lies there, a leg twitching now and then;
 * then one last one goes out of him (a long one, green, rising), and a little one after it; and the flies find him.
 */
const drawFlat = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death!, t = d.t;
  if (t < 24) {
    // (staggering back, this way and that)
    const wob = Math.sin(t * 0.55) * 0.12;
    c.save(); c.translate(d.x - d.facing * t * 0.75, GY); c.rotate(wob);
    drawSafariArtie(c, 0, 0, d.facing, fr, 'hurt', beaten(f));
    c.restore();
    return;
  }
  // Over he goes (slow, then all at once), a bounce off the ground, then lying there
  const fall = Math.min(1, (t - 24) / 14);
  const bounce = t > 38 && t < 50 ? Math.sin(((t - 38) / 12) * Math.PI) * 0.12 : 0;
  const x = d.x - d.facing * 18;
  const twitch = t > 56 && (t % 41) < 6 ? Math.sin(t * 2.2) * 0.05 : 0;
  c.save(); c.translate(x, GY - 30); c.rotate(d.facing * (fall * fall * (Math.PI / 2 + 0.45) - bounce + twitch));
  drawSafariArtie(c, 0, 12, d.facing, fr, 'stunned', beaten(f));
  c.restore();
  // (the dust where he hit, his face in it)
  if (t >= 38 && t < 80) {
    const s = (t - 38) / 42;
    for (let i = 0; i < 4; i++) {
      c.fillStyle = `rgba(168, 140, 100, ${(0.5 * (1 - s)).toFixed(2)})`;
      c.beginPath(); c.arc(x + d.facing * (40 + i * 14 + s * 20 * (i - 1)), GY - 6 - s * 10 - (i % 2) * 4, 6 + s * 10, 0, Math.PI * 2); c.fill();
    }
  }
  // One last one out of him (green, rising off his rear), and a little one after it
  const rx = x - d.facing * 8, ry = GY - 44;
  for (const [t0, len, big] of [[84, 110, 1], [150, 60, 0.45]] as const) {
    if (t < t0 || t >= t0 + len) continue;
    const s = (t - t0) / len;
    c.fillStyle = `rgba(163, 190, 60, ${(0.6 * (1 - s)).toFixed(2)})`;
    c.beginPath(); c.arc(rx - d.facing * (4 + s * 14), ry - s * 30, (8 + s * 24) * big, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(132, 160, 40, ${(0.5 * (1 - s)).toFixed(2)})`;
    c.beginPath(); c.arc(rx - d.facing * (10 + s * 20), ry - 6 - s * 36, (5 + s * 14) * big, 0, Math.PI * 2); c.fill();
    // (stink lines, wavering up off it)
    c.strokeStyle = `rgba(101, 163, 13, ${(0.8 * (1 - s)).toFixed(2)})`; c.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      for (let k = 0; k <= 6; k++) { const yy = ry - 10 - s * 30 - k * 4, xx = rx - d.facing * (8 + s * 16) + i * 9 + Math.sin(k + fr * 0.3 + i) * 2; if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
      c.stroke();
    }
  }
  // (the flies, round his rear)
  if (t > 170) for (let i = 0; i < 3; i++) { const a = fr * 0.17 + i * 2.1; c.fillStyle = '#111'; c.fillRect(Math.round(rx + Math.cos(a) * 12 + Math.sin(a * 2.7) * 3), Math.round(ry - 8 + Math.sin(a * 1.3) * 6), 2, 2); }
};

/** Meathead, poisoned to death: doubled over, heaving, then the lot comes up, again and again, and down he goes in it. */
const drawPuke = (c: Ctx, state: GameState, f: Fight) => {
  const pk = f.puke!, t = Math.min(state.deathScene!.t, PUKE_LEN);
  // (its sounds, on its beats)
  if (t !== pk.lastT) {
    if (t === 4 || t === 22) playSound('retch', 0.8, t === 4 ? 0 : -3);
    if (t === 36 || t === 64 || t === 92) playSound('gush', 0.9, -2 + t / 40);
    if (t === 120) playSound('thud', 0.7);
    if (t === 150) playSound('glug', 0.6);
    pk.lastT = t;
  }
  const { x, y, facing } = pk;
  const spew = t >= 34 && t < 112;
  const pool = Math.min(1, Math.max(0, (t - 34) / 80));
  // the pool, growing in front of him
  if (pool > 0) {
    c.fillStyle = '#4D7C0F'; c.beginPath(); c.ellipse(x + facing * 30, y - 1, 10 + pool * 46, 3 + pool * 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#84CC16'; c.beginPath(); c.ellipse(x + facing * 30, y - 2, 8 + pool * 40, 2 + pool * 3, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 4; i++) { c.fillStyle = '#A16207'; c.fillRect(x + facing * (14 + i * 12) - 2, y - 3, 3, 2); }
  }
  // him
  const d = { kind: 'boiled', x, y, facing } as MeatheadDeath;
  const fall = t < 112 ? 0 : Math.min(1, (t - 112) / 16);
  const heave = t < 34 ? Math.abs(Math.sin(t * 0.4)) * 2 : spew ? Math.abs(Math.sin(t * 0.6)) * 3 : 0;
  c.save();
  c.translate(x, y); c.rotate(facing * fall * (Math.PI / 2)); c.translate(-x, -y + heave);
  drawMeatheadBody(c, state, d, (state.player.currentWeapon ?? 'GUN') as WeaponType, { isDucking: fall === 0, deathFace: t < 112 ? 'agony' : 'dead' });
  c.restore();
  // the stream, out of his mouth in an arc to the pool
  if (spew) {
    const mx = x + facing * 12, my = y - 36 + heave;
    const surge = 0.6 + Math.abs(Math.sin(t * 0.25)) * 0.6;
    for (let i = 0; i < 14; i++) {
      const s = i / 14;
      const sx = mx + facing * s * 40 * surge, sy = my + s * s * 36 + Math.sin(t + i) * 1.5;
      c.fillStyle = i % 3 ? '#84CC16' : '#A3E635';
      c.beginPath(); c.arc(sx, sy, 4 - s * 1.5 + Math.sin(t * 0.9 + i) * 0.8, 0, Math.PI * 2); c.fill();
    }
  }
  // (a bubble or two in it, after)
  if (t > 140 && (t % 30) < 12) { c.strokeStyle = '#D9F99D'; c.lineWidth = 1; c.beginPath(); c.arc(x + facing * 40, y - 4 - (t % 30) * 0.3, 3, 0, Math.PI * 2); c.stroke(); }
};

/** Screen space: his bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FDE68A' : '#F59E0B');
  label(c, 'SAFARI ARTIE', band.mid, 50, '#FDE68A', 7);
};
