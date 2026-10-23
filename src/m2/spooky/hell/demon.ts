// BRATHAZAR: real hell's sub-boss. Satan's boy: a big lanky punk demon kid (liberty spikes, studded horns, a leather
// jacket, a spiked flying-V he swings like an axe), desperate to impress his dad. Found shredding for nobody; he sees
// Meathead and it's his big chance.
//
// No trip, no gimmick: a moveset to learn, Dark Souls style. Every attack has its own wind-up (a pose, a sound, a
// flash), some have a delayed or faked beat, and every one leaves him open after:
//   LEAP     a deep crouch, his horns going red-hot: up and over at him, his shadow on the floor where he'll come down.
//            Under him, crushed; landing, a shockwave runs out along the floor both ways (jump it). Sometimes (hurt
//            past 60%) the crouch is a fake: a little hop, a laugh, then the real one. He's winded after.
//   SWEEP    down low, the guitar dragged back behind him striking sparks, the floor out in front of him flashing: then
//            it sweeps along the floor (jump it). He overswings.
//   RUSH     head down, horns out, pawing the floor three times (thud, thud, thud), arrows on the floor his way: then
//            he charges the length of the pit (jump him, or be up on a ledge). He ends up horns-first in the fire wall
//            with his mohawk alight: a good long opening.
//   PILLARS  his arm up, then pointing: the floor glows and bubbles where he points (where Meathead stands, and either
//            side; or a row marching out at him): then hellfire up out of it, ledge-high and over (move off it). Hurt
//            past half, one more comes up late wherever Meathead went. After, he throws the horns and looks up for his
//            dad (an opening).
//   BREATH   he rears back, chest and cheeks swelling, smoke out his nose: then hunched over, a jet of fire straight
//            out at waist height (duck it, or be up out of it). He coughs after.
//   COMBO    a step in, the guitar cocked over his shoulder, an eye glint: a swing (chest high: duck it or back off),
//            a backhand up (don't jump in), then the guitar over his head, held... held (a look up at his dad: how long
//            varies)... and SMASH, stepping in. It sticks in the floor (his back to hit).
// Hurt enough at a go (when he's not mid-attack), he staggers and whines. Under 40%, the wind-ups shorten (still read).
// Charge moves (shoulder charge, slide, uppercut) bounce Meathead way back off him (he's built like a truck); a dive
// kick bounces him up (and the power back: chains of those are the game's own). Shooting's the way.
// Beaten, he doesn't die: he sits down, bawls for his dad, and sinks away into the floor (satan.ts: the rest).
//
// One invisible enemy (the engine's hits, shots and moves all land on it as usual), kept where his body is; it carries
// a big pool of health and this keeps his own (what comes out of the pool each frame is his damage), so the engine
// never kills him (he leaves). The arena's far side is a wall of fire till he's beaten; the way in's shut once he's
// roused. Beaten once (checkpoint DONE_CP on), he's gone for good.

import type { Enemy, Block, Rect, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { type Box, around, join } from '../../deathFrame';
import { elbow, knee, reachTo } from '../../art/limb';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { hazardVictims, boxHits, setHazardZones } from '../../hazardHit';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { say, cutVoice, pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { rectsOverlap, boundsOf } from '../../../m1/game/core/utils';
import { getAttackHitbox, recoilOff } from '../../../m1/game/player/player';
import { POWER_CELLS, BOUNCE_FRAMES } from '../../../m1/constants';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import { solid, box, label, saidOver, meatheadSays, voice, type Said } from '../section';
import { GY } from '../geometry';
import { ARENA_IN, ARENA_OUT, DEMON_HOME } from './layout';
import { hazeBands } from '../../../m1/game/render/pixelArt';
import { INK, checker, mix, LAVA, blob, thick, inked, flashed } from './paint';
import { hellOf } from './state';
import { HELL_KINDS } from './kinds';
import {
  DEMON_NAME, DEMON_INTRO, DEMON_CHATTER, DEMON_HIT, DEMON_HURT, DEMON_FEINT, MH_DEMON, MH_BOUNCE,
  HURT_GUITAR, DEATH_GUITAR, HURT_CRUSH, DEATH_CRUSH, HURT_WAVE, DEATH_WAVE, HURT_RUSH, DEATH_RUSH, HURT_PILLAR, DEATH_PILLAR,
  HURT_BREATH, DEATH_BREATH, HURT_AIRBODY, DEATH_AIRBODY, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE, HURT_BUMP, DEATH_BUMP,
} from './demonLines';
import type { Dressed, ByPants } from './lines';
import { markBossFight } from '../../bossQuiet';
import { drawSinkBack, drawSinkFront, drawSunk, sinkFx, sinkGulp } from './demonPool';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

export const DEMON_KIND = 'm2:demon';
const GUITAR = 'm2:demon_guitar', CRUSH = 'm2:demon_crush', WAVE = 'm2:demon_wave', RUSH = 'm2:demon_rush';
const PILLAR = 'm2:demon_pillar', BREATH = 'm2:demon_breath', AIRBODY = 'm2:demon_airbody', FIRE_BOUNCE = 'm2:demon_bounce_fire';
/** Beaten, and past him: this checkpoint on, he's gone for good. */
export const DONE_CP = 53;

// The numbers
/** His health (was 2400 as the fat one, with the trip's ×2.5 window and shots cut to 55%: no trip now, so less of
 *  him, and shots get more of it through). */
const HP = 1800, POOL = 100000, W = 90, H = 165, MASS = 2400;
/** What a shot (or anything else that isn't one of his moves) gets through. */
const SHOT_SHARE = 0.7;
/** How hard his moves bounce off him. */
const RECOIL_MASS = 450;
/** A charge (shoulder, slide, uppercut) into him: thrown back this hard (and up), locked out of it this long. */
const CHARGE_BOUNCE = { x: 46, y: -8, lock: 44 };
/** A dive kick on his head: he's thrown way up (chains of them stay his: never capped). */
const STOMP_LAUNCH = 21;
/** The fire walls' height (up out of frame) and the arena's roof (out of frame, over the highest stomp launch). */
const WALL_H = 4000, ROOF_H = 760;
/** The fire walls (the way in's, the far one's), and how far over he can get between them. */
const BACK_X = ARENA_IN + 20, WALL_W = 30, D_MIN = BACK_X + WALL_W + 58, D_MAX = ARENA_OUT - 58;
const FLOOR_L = BACK_X + WALL_W + 20, FLOOR_R = ARENA_OUT - 20;
/** Damage, before M2's own cut (×0.65). The fat one's were 22-28 a hit; these are meant to be dodged. */
// (eased about a fifth (the user's: somewhat less): was crush 44, wave 24, airbody 22, sweep 34, rush 40, pillar 32,
// breath 34, swing 22, upswing 22, smash 46, bump 14)
const DMG = { crush: 34, wave: 19, airbody: 17, sweep: 27, rush: 31, pillar: 25, breath: 27, swing: 17, upswing: 17, smash: 36, bump: 11 };
/** His moves on him (his own say, not the engine's: see demonTouch). */
const MELEE = { charge: 34, slide: 22, uppercut: 110, divekick: 60 };
/** Wind-ups (frames; ×0.8 under 40%). */
const WIND = { crouch: 40, sweep: 46, rush: 56, point: 34, glow: 56, inhale: 52, combo: 26 };
/** Recoveries: how long he's open after each (frames). */
const OPEN = { land: 56, sweep: 42, crash: 80, pose: 50, cough: 44, stuck: 58 };
/** Reach: the sweep's (from his middle, a lunge in it), the breath's, the combo's swings and its smash. */
const SWEEP_REACH = 215, BREATH_NEAR = 80, BREATH_REACH = 360, SWING_REACH = 185, SMASH_NEAR = 50, SMASH_FAR = 235;
const RUSH_SPEED = 12, RUSH_TOP = 96;
const PILLAR_W = 56, PILLAR_H = 340, PILLAR_BURN = 34;
const WAVE_SPEED = 7.5, WAVE_H = 30;
/** Hurt this much in a short while (and caught not mid-attack), and he staggers. */
const STAGGER_AT = 450, STAGGER_FRAMES = 70;
const GRAV = 0.6;
/** Touching a fire wall (the engine's own fire hurt: its lines, the burnt death). */
const FIRE_WALL_DMG = 10;

type Atk = 'leap' | 'sweep' | 'rush' | 'pillars' | 'breath' | 'combo';
type St = 'lounge' | 'rise' | 'walk'
  | 'crouch' | 'feint' | 'air' | 'land'
  | 'sweepWind' | 'sweep' | 'sweepRec'
  | 'rushWind' | 'rush' | 'crash'
  | 'point' | 'pillars' | 'pose'
  | 'inhale' | 'breath' | 'cough'
  | 'comboWind' | 'swing' | 'upswing' | 'raise' | 'smash' | 'stuck'
  | 'stagger' | 'beaten' | 'sink';
/** Mid-attack (wind-up or strike): no stagger then (he's committed). */
const COMMITTED = new Set<St>(['crouch', 'feint', 'air', 'sweepWind', 'sweep', 'rushWind', 'rush', 'point', 'pillars', 'inhale', 'breath', 'comboWind', 'swing', 'upswing', 'raise', 'smash']);

interface Pillar { x: number; t: number; hit: boolean; follow: boolean }
interface Wave { x: number; dir: number; hit: boolean; life: number }

export interface Demon {
  fight: 'wait' | 'on' | 'beaten' | 'gone';
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  st: St; t: number; cd: number;
  hp: number; flash: number; hurtSince: number; hurtAt: number;
  e: Enemy | null; lock: Block | null;
  /** The fire wall over the way in: up once he's roused (no backing out), down when he's beaten. */
  back: Block | null;
  /** The arena's roof (out of frame, solid), with the walls: boxed in. */
  roof: Block | null;
  /** When a charge last bounced him off (into the fire behind him: its own hurt lines); how many times this fight. */
  bouncedAt: number; bounces: number;
  /** The leap's landing; whether this strike's landed yet; the rush's way; the combo's hold; a feint owed. */
  jumpTo: number; hit: boolean; rushDir: 1 | -1; hold: number; feint: boolean;
  /** What he's done lately (newest first): never the same thing three times running. */
  last: Atk[];
  pillars: Pillar[]; waves: Wave[];
  said: Said | null; talkAt: number; used: string[];
  /** Beaten: the guitar left lying where he dropped it; how far he's sunk away. */
  guitarAt: number | null; sink: number;
  /** The frame he went all the way under (the puddle cooling after him: demonPool.ts); long ago, just the scorch. */
  sunkAt: number;
}
export const demonOf = (state: GameState) => hellOf(state).demon;

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const fresh = (d: Demon, pool: readonly string[]) => {
  let left = pool.filter(l => !d.used.includes(l));
  if (!left.length) { d.used = d.used.filter(l => !pool.includes(l)); left = [...pool]; }
  return pick(left);
};
/** He says something (`wait`: in turn; otherwise only if nobody's talking). Whether it'll be said. */
export const demonSays = (state: GameState, d: Demon, pool: ByPants | readonly string[], wait: boolean, onDone?: () => void) => {
  const lines = Array.isArray(pool) ? pool as readonly string[] : (pool as ByPants)[dressed(state)];
  const text = fresh(d, lines), s: Said = { text };
  let done = false;
  const end = () => { if (d.said === s) d.said = null; if (!done) { done = true; onDone?.(); } };
  const ok = say(text, voice('m2.demon'), wait ? 'queue' : 'casual', {
    always: true,
    onShow: spoken => { d.said = s; if (!spoken) setTimeout(end, Math.max(1800, text.length * 70)); },
    onHide: end, onDropped: end,
  });
  if (ok) d.used.push(text);
  else if (onDone) { d.said = s; setTimeout(end, Math.max(1800, text.length * 70)); }
  return ok;
};

// ---------------------------------------------------------------------------------------------------------------

const blank = (): Demon => ({
  fight: 'wait', x: DEMON_HOME, y: GY, vx: 0, vy: 0, facing: -1, st: 'lounge', t: 0, cd: 60,
  hp: HP, flash: 0, hurtSince: 0, hurtAt: -999, e: null, lock: null, back: null, roof: null, bouncedAt: -999, bounces: 0,
  jumpTo: 0, hit: false, rushDir: 1, hold: 0, feint: false, last: [], pillars: [], waves: [],
  said: null, talkAt: 0, used: [], guitarAt: null, sink: 0, sunkAt: -1e9,
});
export const buildDemon = (state: GameState) => {
  const h = hellOf(state);
  if (state.checkpoint >= DONE_CP) { h.demon = gone(); return; }
  const d = blank();
  d.lock = solid(state, ARENA_OUT, GY - WALL_H, 30, WALL_H, { hidden: true, tag: 'hell-lock' });
  const e = makeKindEnemy(DEMON_KIND as EnemyKind, d.x, GY);
  e.health = e.maxHealth = POOL; e.harmless = true; e.unshakeable = true; e.noCrowd = true; e.seen = true; e.pos.y = -100000;
  d.e = e; state.enemies.push(e);
  h.demon = d;
};
const gone = (): Demon => ({ ...blank(), fight: 'gone', st: 'sink', cd: 0, hp: 0, hurtAt: 0, guitarAt: DEMON_HOME - 110, sink: 1 });

const place = (d: Demon) => {
  const e = d.e;
  if (!e) return;
  if (d.fight !== 'on') { e.pos.y = -100000; return; }
  // (head down in the rush or the breath, he's lower)
  const h = d.st === 'rush' || d.st === 'rushWind' || d.st === 'breath' ? RUSH_TOP + 10 : H;
  e.pos.x = d.x - W / 2; e.pos.y = d.y - h; e.width = W; e.height = h; e.facing = d.facing; e.vel.x = 0; e.vel.y = 0;
};
const shrugOff = (e: Enemy) => {
  e.frozenTimer = 0; e.isTased = false; e.pauseTimer = 0; e.sludgeTimer = 0; e.isOiled = false; e.isOnFire = false;
  e.fireTimer = 0; e.needleCount = 0; e.shockedUntil = undefined; e.runFrom = undefined; e.puppet = false;
  e.pose = undefined; e.frozeAt = undefined; e.returnHome = false; e.vel.x = 0; e.vel.y = 0;
};

const hurtbox = (state: GameState): Rect => {
  const p = state.player;
  return p.isDucking ? { x: p.pos.x + 2, y: p.pos.y + (p.height - 26), w: p.width - 4, h: 26 } : boundsOf(p);
};
/** A box in front of him: from `a` to `b` out from his middle (the way he faces), `top` to `bot` up from his feet. */
const ahead = (d: Demon, a: number, b: number, top: number, bot: number): Rect => {
  const x1 = d.x + d.facing * a, x2 = d.x + d.facing * b;
  return { x: Math.min(x1, x2), y: d.y - top, w: Math.abs(x2 - x1), h: top - bot };
};

/** Something of his has got him: hurt, thrown, and a show-off for his dad (now and then). */
const land = (ctx: FrameContext, d: Demon, dmg: number, source: string, kx: number, ky: number) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.untouchable) return false;
  hurtPlayer(ctx, dmg, source, { x: kx, y: ky });
  playSound('crunch', 1, -6); shakeScreen(ctx.state, 10, 5);
  if (p.health > 0 && Math.random() < 0.45) demonSays(ctx.state, d, DEMON_HIT, true);
  return true;
};
/** The strike under way (once a strike). */
const strike = (ctx: FrameContext, d: Demon, dmg: number, source: string, kx: number, ky: number) => {
  if (d.hit) return;
  if (land(ctx, d, dmg, source, kx, ky)) d.hit = true;
};

/** A spurt of him (he bleeds, black-red, hot) where a hit's gone in. */
const spurt = (state: GameState, x: number, y: number, n: number, dir: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y }, vel: { x: dir * (1 + Math.random() * 5) + (Math.random() - 0.5) * 3, y: -2 - Math.random() * 5 }, life: 24 + Math.random() * 16, color: i % 3 ? '#7F1D1D' : '#F97316', size: 2 + Math.random() * 4, grav: 0.35 });
};

/** His moves landing on him (the engine asks first: KindDef's `touch`); his body's own bumps are think()'s. */
const demonTouch = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = state.player;
  const d = demonOf(state);
  if (!d || d.fight !== 'on' || d.e !== e) return true;
  if (!(p.isCharging || p.isUppercutting || p.isDivekicking) || p.health <= 0) return true;
  if (p.isUppercutting && p.uppercutHitIds.includes(e.id)) return true;
  if (p.isDivekicking && p.diveKickHitIds.includes(e.id)) return true;
  // (a sub-boss has no breather: only the same move can't land twice)
  if (e.hitByMove === p.moveId) return true;
  if (!rectsOverlap(getAttackHitbox(ctx), boundsOf(e))) return true;
  const up = !!p.isUppercutting, dk = !!p.isDivekicking, slide = !up && !dk && !!p.isSliding;
  const dmg = up ? MELEE.uppercut : dk ? MELEE.divekick : slide ? MELEE.slide : MELEE.charge;
  e.hitByMove = p.moveId; e.hitCooldown = 0;
  if (up) p.uppercutHitIds.push(e.id);
  if (dk) p.diveKickHitIds.push(e.id);
  const pc = p.pos.x + p.width / 2, dir = Math.sign(d.x - pc) || 1;
  const at = { x: d.x - dir * W * 0.4, y: dk ? d.y - H + 10 : up ? d.y - H * 0.6 : slide ? d.y - 20 : d.y - H * 0.45 };
  hurt(ctx, d, dmg);
  ctx.fx.spawnDamageNumber({ x: at.x - 10, y: at.y - 20 }, dmg, up || dk);
  ctx.fx.playGunSound(dk ? 'stomp' : 'punch');
  spurt(state, at.x, at.y, up ? 16 : 8, -dir);
  if (d.fight !== 'on') return true;
  if (up) { shakeScreen(state, 10, 6); ctx.fx.spawnExplosion(at, '#FFD700', 15, 0, 12); playSound('crunch', 0.8, -6); }
  if (dk) {
    // (the stomp: the bounce and the power back, as off anything; chains of them are the game's own, never capped)
    p.power = Math.min(POWER_CELLS, p.power + 1);
    ctx.fx.playGunSound('boing', 0.6);
    p.vel.y = -STOMP_LAUNCH; p.vel.x *= 0.5; p.isGrounded = false;
    p.lockTimer = BOUNCE_FRAMES; p.recoiling = true;
    playSound('boing', 1, -8);
  } else {
    // (a shoulder charge, a slide, an uppercut: it goes in, and it throws him back hard, a long way, off his feet: in
    // this room, likely into the fire behind him. He's built like a truck)
    recoilOff(ctx, RECOIL_MASS);
    // (a pushback, not a recoil: the recoil's drag would have him stop short)
    p.recoiling = false; p.isHarmlessPushback = true; p.isSliding = false;
    p.vel.x = -dir * CHARGE_BOUNCE.x; p.vel.y = CHARGE_BOUNCE.y; p.isGrounded = false;
    p.pushbackTimer = Math.max(p.pushbackTimer, CHARGE_BOUNCE.lock); p.lockTimer = Math.max(p.lockTimer, CHARGE_BOUNCE.lock);
    d.bouncedAt = state.frame; d.bounces++;
    playSound('boing', 0.9, -10); playSound('thud', 0.8, -6); shakeScreen(state, 8, 4);
    ctx.fx.spawnDamageNumber({ x: pc - 30, y: p.pos.y - 30 }, 'BOING!', true, '#FDE68A');
    // (Meathead working it out: the second bounce, the fifth)
    if (d.bounces === 2) meatheadSays(state, MH_BOUNCE[0], false);
    if (d.bounces === 5) meatheadSays(state, MH_BOUNCE[1], false);
  }
  return true;
};

/** Damage into him: his health, the flash, the stagger (enough at a go, not mid-attack), beaten. */
const hurt = (ctx: FrameContext, d: Demon, dmg: number) => {
  const { state } = ctx, f = state.frame;
  d.hp -= dmg; d.flash = 6;
  if (f - d.hurtAt > 240) d.hurtSince = 0;
  d.hurtSince += dmg; d.hurtAt = f;
  if (d.hp <= 0) { beaten(ctx, d); return; }
  tryStagger(ctx, d);
};
const tryStagger = (ctx: FrameContext, d: Demon) => {
  if (d.hurtSince < STAGGER_AT || COMMITTED.has(d.st) || d.st === 'stagger' || d.st === 'rise' || d.y < GY) return;
  d.st = 'stagger'; d.t = 0; d.vx = 0; d.hurtSince = 0;
  playSound('bellow', 0.8, 4); shakeScreen(ctx.state, 8, 4);
  demonSays(ctx.state, d, DEMON_HURT, false);
};

/** The fire wall over the way in (between the arch's posts), and the far one. */
const startFight = (state: GameState, d: Demon) => {
  d.fight = 'on'; d.st = 'rise'; d.t = 0; d.bounces = 0;
  d.back = solid(state, BACK_X, GY - WALL_H, WALL_W, WALL_H, { hidden: true, tag: 'hell-lock' });
  d.roof = solid(state, BACK_X, GY - ROOF_H - 30, ARENA_OUT + 30 - BACK_X, 30, { hidden: true, tag: 'hell-lock' });
  const p = state.player;
  if (p.pos.x < BACK_X + WALL_W + 2) p.pos.x = BACK_X + WALL_W + 2;
  playSound('flame', 1, -6); playSound('ignite', 0.9, -4); shakeScreen(state, 8, 4);
  for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: BACK_X + Math.random() * WALL_W, y: GY - Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -3 - Math.random() * 6 }, life: 30, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
  meatheadSays(state, pick(MH_DEMON), true);
  demonSays(state, d, DEMON_INTRO, true);
  d.talkAt = state.frame + 900;
};

/** The pit taking hold as the walls go up: any of hell's wildlife that followed him in (between the walls) goes off
 *  like a balloon full of meat on the spot; anything caught across a wall is put out the far side of it. */
const WILD = new Set<string>(Object.values(HELL_KINDS));
const purgeArena = (ctx: FrameContext, d: Demon) => {
  const { state, fx } = ctx, L = BACK_X + WALL_W, R = ARENA_OUT;
  let popped = 0;
  for (const e of [...state.enemies]) {
    if (e === d.e || e.health <= 0 || e.isBlownAway || e.type === 'boss' || !WILD.has(e.kind ?? '')) continue;
    const a = e.pos.x, b = e.pos.x + e.width, m = (a + b) / 2;
    if (m > L && m < R) {
      const at = { x: m, y: e.pos.y + e.height / 2 };
      e.health = 0;
      state.enemies = state.enemies.filter(o => o !== e);
      fx.spawnDeathShower(at, 0, 2.2);
      fx.spawnExplosion(at, '#F97316', 10, 0, 30); fx.spawnExplosion(at, '#FDE047', 6, 0, 24);
      fx.spawnDamageNumber({ x: at.x - 20, y: at.y - 30 }, 'POP!', true, '#FCA5A5');
      popped++;
    } else if (b > BACK_X - 14 && a < L + 14) e.pos.x = m < BACK_X + WALL_W / 2 ? BACK_X - 16 - e.width : L + 16;
    else if (b > R - 14 && a < R + 30 + 14) e.pos.x = R + 30 + 16;
  }
  if (popped) { playSound('splat', 1, -4); playSound('boom', 0.8, -6); shakeScreen(state, 10, 5); }
};

/** While the pit's shut (the walls up): the camera's held between them. Null when it's open. */
export const demonCamLock = (state: GameState) => {
  const d = demonOf(state);
  if (!d || d.fight !== 'on') return null;
  const min = BACK_X + WALL_W / 2, max = ARENA_OUT + 15 - CANVAS_WIDTH;
  return max >= min ? { min, max } : { min: (min + max) / 2, max: (min + max) / 2 };
};

/** Beaten with him a way off the screen (the camera only goes so far across the pit): what has to be on it, him and
 *  his guitar, while he bawls and sinks (deathFrame.ts). Null otherwise. */
export const demonDeathNeed = (state: GameState): Box | null => {
  const d = demonOf(state);
  if (!d || d.fight !== 'beaten') return null;
  return join(around(d.x, d.y, W / 2 + 30, H + 40, 8), d.guitarAt === null ? null : around(d.guitarAt, GY, 50, 60, 6));
};

/** Beaten (satan.ts takes it from here): he drops the guitar and sits down; the fire walls are out. */
const beaten = (ctx: FrameContext, d: Demon) => {
  d.fight = 'beaten'; d.st = 'beaten'; d.t = 0; d.vx = 0; d.hp = 0; d.flash = 0; d.pillars = []; d.waves = [];
  // (from the killing blow on, his: nothing gets a hit in on him before the scene's started)
  { const p = ctx.state.player; p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 30); }
  d.guitarAt = d.x + d.facing * 100;
  if (d.e) { const i = ctx.state.enemies.indexOf(d.e); if (i >= 0) ctx.state.enemies.splice(i, 1); d.e = null; }
  if (d.lock) d.lock.x = -1e7;
  if (d.back) d.back.x = -1e7;
  if (d.roof) d.roof.x = -1e7;
  cutVoice('m2.demon'); d.said = null;
  ctx.state.checkpoint = Math.max(ctx.state.checkpoint, DONE_CP);
  playSound('thud', 1, -10); playSound('clang', 0.8, -8); shakeScreen(ctx.state, 14, 6);
  ctx.fx.spawnDamageNumber({ x: d.x - 40, y: d.y - H - 30 }, 'HE QUITS!', true, '#FDE047');
};

/** Landing from the leap: under him, crushed; a shockwave out along the floor both ways. */
const landQuake = (ctx: FrameContext, d: Demon) => {
  const { state } = ctx, p = state.player;
  playSound('rumble', 0.9, -7); playSound('thud', 1, -9); playSound('slam', 0.9, -4);
  shakeScreen(state, 18, 8);
  for (const dir of [-1, 1]) {
    d.waves.push({ x: d.x + dir * 40, dir, hit: false, life: 0 });
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: d.x + dir * (30 + i * 4), y: GY - 4 - Math.random() * 6 }, vel: { x: dir * (3 + Math.random() * 3), y: -1 - Math.random() * 2 }, life: 30, color: i % 3 ? 'rgba(120, 53, 15, 0.7)' : 'rgba(168, 162, 158, 0.6)', size: 6 + Math.random() * 7 });
  }
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: ARENA_IN + Math.random() * (ARENA_OUT - ARENA_IN), y: state.camera.y + Math.random() * 20 }, vel: { x: 0, y: 2 + Math.random() * 3 }, life: 80, color: '#57534E', size: 2 + Math.random() * 3 });
  if (rectsOverlap(hurtbox(state), { x: d.x - W / 2, y: d.y - H, w: W, h: H })) land(ctx, d, DMG.crush, CRUSH, (Math.sign(p.pos.x + p.width / 2 - d.x) || 1) * 12, -8);
};

// ---------------------------------------------------------------------------------------------------------------

export const updateDemon = (ctx: FrameContext) => {
  const { state } = ctx;
  const d = demonOf(state);
  if (!d || d.fight === 'gone') return;
  // (started past him: gone; see buildDemon)
  if (d.fight === 'wait' && state.checkpoint >= DONE_CP) {
    if (d.lock) d.lock.x = -1e7;
    if (d.back) d.back.x = -1e7;
    if (d.roof) d.roof.x = -1e7;
    if (d.e) { const de = d.e; state.enemies = state.enemies.filter(o => o !== de); }
    Object.assign(d, gone()); return;
  }
  const p = state.player, f = state.frame;
  if (d.fight === 'on') markBossFight(state, 'demon');
  if (d.flash > 0) d.flash--;
  // What's come out of his pool since last frame
  const e = d.e;
  if (e) {
    const killed = e.health <= 0 || !!e.isBlownAway || !state.enemies.includes(e);
    const lost = killed ? 60 : POOL - e.health;
    e.health = POOL; shrugOff(e);
    if (killed) { e.isBlownAway = false; e.meleeFlung = false; e.uppercutFlung = false; e.rotation = 0; if (!state.enemies.includes(e)) state.enemies.push(e); }
    if (d.fight === 'on' && lost > 0.01) {
      for (const n of state.damageNumbers) {
        if (n.value === undefined || n.life < n.maxLife - 2 || Math.abs(n.pos.x - e.pos.x) > W + 30 || Math.abs(n.pos.y - e.pos.y) > H) continue;
        n.value = Math.max(1, Math.round(n.value * SHOT_SHARE));
      }
      hurt(ctx, d, lost * SHOT_SHARE);
      if (d.fight === 'on') spurt(state, d.x - d.facing * 10 + (Math.random() - 0.5) * W * 0.6, d.y - H * (0.3 + Math.random() * 0.4), 3, -d.facing);
    }
    if (d.fight !== 'on' && d.fight !== 'wait') return;
  }
  if (d.fight === 'beaten') { d.t++; return; }
  if (d.fight === 'wait') {
    d.t++;
    // (shredding for nobody: a power chord every so often)
    if (d.t % 90 === 30 && Math.abs(d.x - p.pos.x) < 900) playSound('grind', 0.35, 6);
    if (p.health > 0 && p.pos.x + p.width / 2 > ARENA_IN + 150 && p.pos.x < ARENA_OUT) { startFight(state, d); purgeArena(ctx, d); }
    place(d);
    return;
  }
  // (the fire walls: touch one and it burns; anybody else too, and they keep back from them)
  const walls = [d.back, d.lock].filter(w => w && w.x > -1e6) as { x: number; w: number }[];
  setHazardZones(state, 'hell-firewalls', walls.map(w => ({ x0: w.x - 12, x1: w.x + w.w + 12, y0: GY - 300, y1: GY })));
  for (const w of walls) for (const v of hazardVictims(state, { not: o => o === d.e })) if (boxHits(v, w.x - 12, GY - 300, w.w + 24, 300)) {
    ctx.fx.killWithAnimation(v, 'charred', 'flamethrower_kill', 'cooked');
    ctx.fx.spawnDamageNumber({ x: v.pos.x, y: v.pos.y - 30 }, 'TORCHED!', true, '#FDBA74');
    playSound('ignite', 0.8, -4);
  }
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6 || p.health <= 0 || p.invincibilityTimer > 0) continue;
    if (rectsOverlap(hurtbox(state), { x: w.x - 12, y: GY - WALL_H, w: w.w + 24, h: WALL_H })) {
      const away = p.pos.x + p.width / 2 < w.x + w.w / 2 ? -1 : 1;
      hurtPlayer(ctx, FIRE_WALL_DMG, state.frame - d.bouncedAt < 90 ? FIRE_BOUNCE : 'fire', { x: away * 9, y: -8 });
    }
  }
  think(ctx, d);
  hazards(ctx, d);
  // (showing off for his dad, now and then)
  if (f > d.talkAt && p.health > 0) d.talkAt = f + (demonSays(state, d, DEMON_CHATTER, false) ? 900 + Math.random() * 400 : 90);
  place(d);
};

/** His pillars and shockwaves, along on their own. */
const hazards = (ctx: FrameContext, d: Demon) => {
  const { state } = ctx, p = state.player, hb = hurtbox(state);
  const pc = p.pos.x + p.width / 2;
  for (const pl of d.pillars) {
    pl.t++;
    if (pl.t === 0 && pl.follow) { pl.x = Math.max(FLOOR_L + PILLAR_W / 2, Math.min(FLOOR_R - PILLAR_W / 2, pc)); playSound('rumble', 0.6, 2); }
    if (pl.t > 0 && pl.t % 9 === 0 && pl.t < pillarGlow(d)) playSound('glug', 0.4, 4);
    if (pl.t === pillarGlow(d)) { playSound('flame', 1, -4); playSound('boom', 0.6, -6); shakeScreen(state, 8, 4); }
    const burning = pl.t >= pillarGlow(d) && pl.t < pillarGlow(d) + PILLAR_BURN;
    if (burning && !pl.hit && rectsOverlap(hb, { x: pl.x - PILLAR_W / 2, y: GY - PILLAR_H, w: PILLAR_W, h: PILLAR_H })) {
      if (land(ctx, d, DMG.pillar, PILLAR, (Math.sign(pc - pl.x) || 1) * 8, -12)) pl.hit = true;
    }
    if (burning && pl.t % 3 === 0) state.particles.push({ pos: { x: pl.x + (Math.random() - 0.5) * PILLAR_W, y: GY - Math.random() * PILLAR_H }, vel: { x: (Math.random() - 0.5) * 2, y: -4 - Math.random() * 4 }, life: 20, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3 });
  }
  d.pillars = d.pillars.filter(pl => pl.t < pillarGlow(d) + PILLAR_BURN + 8);
  for (const w of d.waves) {
    w.x += w.dir * WAVE_SPEED; w.life++;
    if (w.life % 3 === 0) state.particles.push({ pos: { x: w.x, y: GY - 4 }, vel: { x: w.dir * 1.5, y: -2 - Math.random() * 2 }, life: 16, color: w.life % 2 ? '#FB923C' : '#78350F', size: 3 + Math.random() * 3, grav: 0.2 });
    if (!w.hit && rectsOverlap(hb, { x: w.x - 16, y: GY - WAVE_H, w: 32, h: WAVE_H })) {
      if (land(ctx, d, DMG.wave, WAVE, w.dir * 9, -9)) w.hit = true;
    }
  }
  d.waves = d.waves.filter(w => w.x > FLOOR_L && w.x < FLOOR_R);
};
const madOf = (d: Demon) => (d.hp < HP * 0.4 ? 0.8 : 1);
const pillarGlow = (d: Demon) => Math.round(WIND.glow * madOf(d));

/** What next: by where Meathead is; never the same thing three times running, less of what he just did. */
const choose = (d: Demon, adx: number, level: boolean, cornered: boolean): Atk => {
  const w: [Atk, number][] = !level
    ? [['pillars', 3], ['leap', 3], ['rush', 0.5]]
    : adx > 330 ? [['rush', 3], ['pillars', 2.5], ['leap', 2], ['breath', 0.5]]
    : adx > 170 ? [['breath', 3], ['leap', 2], ['pillars', 1.5], ['rush', 1.2], ['sweep', adx < 250 ? 2.5 : 0]]
    : [['combo', cornered ? 0 : 3], ['sweep', 3], ['breath', 1.5], ['leap', 1.2]];
  for (const it of w) {
    if (d.last[0] === it[0]) it[1] *= d.last[1] === it[0] ? 0 : 0.35;
  }
  const sum = w.reduce((s, it) => s + it[1], 0);
  if (sum <= 0) return 'leap';
  let r = Math.random() * sum;
  for (const it of w) { r -= it[1]; if (r <= 0) return it[0]; }
  return w[0][0];
};

const begin = (ctx: FrameContext, d: Demon, a: Atk, pc: number, toward: 1 | -1) => {
  const { state } = ctx;
  d.last = [a, ...d.last].slice(0, 3);
  d.t = 0; d.vx = 0; d.hit = false; d.facing = toward;
  switch (a) {
    case 'leap':
      d.st = 'crouch'; d.jumpTo = Math.max(D_MIN, Math.min(D_MAX, pc));
      d.feint = d.hp < HP * 0.6 && Math.random() < 0.4;
      playSound('snort', 1, -12);
      break;
    case 'sweep': d.st = 'sweepWind'; playSound('grind', 0.7, -2); break;
    case 'rush': d.st = 'rushWind'; d.rushDir = toward; playSound('bellow', 0.9, -6); break;
    case 'pillars': d.st = 'point'; playSound('rumble', 0.7, -2); break;
    case 'breath': d.st = 'inhale'; playSound('suck', 0.9, -8); break;
    case 'combo': d.st = 'comboWind'; playSound('clink', 0.8, 8); break;
  }
  void state;
};
/** Back to walking about (an opening's over). */
const recover = (d: Demon, cd: number) => { d.st = 'walk'; d.t = 0; d.vx = 0; d.cd = cd + Math.random() * 24; };

const think = (ctx: FrameContext, d: Demon) => {
  const { state } = ctx, p = state.player;
  d.t++;
  if (d.cd > 0) d.cd--;
  const pc = p.pos.x + p.width / 2, pFeet = p.pos.y + p.height;
  const dx = pc - d.x, adx = Math.abs(dx), toward = (dx < 0 ? -1 : 1) as 1 | -1;
  const mad = madOf(d);
  const hb = hurtbox(state);
  const alive = p.health > 0;
  switch (d.st) {
    case 'rise':
      d.vx = 0; d.facing = toward;
      if (d.t === 20) playSound('grind', 0.9, -4);
      if (d.t > 100) { d.st = 'walk'; d.t = 0; d.cd = 24; }
      break;
    case 'walk':
    default: {
      d.st = 'walk';
      if (d.t > 8) d.facing = toward;
      // (he's backed out of the pit: back to his spot; but shoot him from out there and he comes down on the gate)
      if (pc < ARENA_IN - 10) {
        const home = DEMON_HOME - d.x;
        d.vx = Math.abs(home) > 20 ? Math.sign(home) * 1.2 : 0;
        if (d.cd <= 0 && state.frame - d.hurtAt < 4) { begin(ctx, d, 'leap', D_MIN, -1); d.feint = false; }
        break;
      }
      // (eager: in after him, quick)
      d.vx = adx > 140 ? toward * 1.8 : 0;
      tryStagger(ctx, d);
      if (d.st !== 'walk' || d.cd > 0 || !alive) break;
      const level = pFeet > GY - 40;
      const wallBehind = toward > 0 ? ARENA_OUT - pc : pc - (BACK_X + WALL_W);
      begin(ctx, d, choose(d, adx, level, wallBehind < 220), pc, toward);
      break;
    }
    // LEAP ---------------------------------------------------------------------------------------------------------
    case 'crouch':
      d.vx = 0;
      if (d.feint && d.t > WIND.crouch * mad * 0.75) {
        // (the fake: a little hop where he stands, and a laugh at him for flinching)
        d.st = 'feint'; d.t = 0; d.vy = -6; d.feint = false; playSound('jump', 0.6, 4);
        demonSays(state, d, DEMON_FEINT, false);
        break;
      }
      if (d.t > WIND.crouch * mad) {
        d.st = 'air'; d.t = 0; d.hit = false;
        const T = 2 * 16 / GRAV;
        d.vy = -16; d.vx = (d.jumpTo - d.x) / T; d.facing = (d.vx < 0 ? -1 : d.vx > 0 ? 1 : d.facing) as 1 | -1;
        playSound('whoosh', 1, -12); playSound('jump', 0.8, -12);
      }
      break;
    case 'feint':
      d.vy += GRAV; d.y += d.vy;
      if (d.y >= GY && d.vy > 0) {
        d.y = GY; d.vy = 0;
        // (and now the real one, quicker, at where he is now)
        d.st = 'crouch'; d.t = Math.round(WIND.crouch * mad * 0.45); d.facing = toward; d.jumpTo = Math.max(D_MIN, Math.min(D_MAX, pc));
        playSound('snort', 1, -10);
      }
      break;
    case 'air':
      // (up in the air, coming at him: touch him and it hurts (a dive kick on top excepted: that lands))
      if (alive && !p.isDivekicking && state.frame - d.bouncedAt > 12 && rectsOverlap(hb, { x: d.x - W / 2 + 6, y: d.y - H + 10, w: W - 12, h: H - 30 })) {
        if (land(ctx, d, DMG.airbody, AIRBODY, (Math.sign(pc - d.x) || -d.facing) * 12, -7)) d.bouncedAt = state.frame;
      }
      d.vy += GRAV; d.y += d.vy;
      if (d.y >= GY && d.vy > 0) { d.y = GY; d.vy = 0; d.vx = 0; d.st = 'land'; d.t = 0; landQuake(ctx, d); }
      break;
    case 'land':
      d.vx = 0;
      if (d.t > OPEN.land * mad) recover(d, 26);
      break;
    // SWEEP --------------------------------------------------------------------------------------------------------
    case 'sweepWind':
      d.vx = 0;
      if (d.t % 5 === 0) state.particles.push({ pos: { x: d.x - d.facing * 80, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: '#FDE047', size: 2 });
      if (d.t % 15 === 0) playSound('grind', 0.5, 2);
      if (d.t > WIND.sweep * mad) { d.st = 'sweep'; d.t = 0; d.hit = false; playSound('whoosh', 1, -2); }
      break;
    case 'sweep':
      d.vx = d.t < 8 ? d.facing * 5 : 0;
      if (d.t >= 2 && d.t <= 11 && rectsOverlap(hb, ahead(d, -20, SWEEP_REACH, 30, 0))) strike(ctx, d, DMG.sweep, GUITAR, d.facing * 10, -10);
      if (d.t % 2 === 0 && d.t < 14) state.particles.push({ pos: { x: d.x + d.facing * (40 + d.t * 13), y: GY - 6 }, vel: { x: d.facing * 2, y: -1.5 }, life: 16, color: '#FDE047', size: 3 });
      if (d.t > 14) { d.st = 'sweepRec'; d.t = 0; d.vx = 0; }
      break;
    case 'sweepRec':
      if (d.t > OPEN.sweep * mad) recover(d, 20);
      break;
    // RUSH ---------------------------------------------------------------------------------------------------------
    case 'rushWind': {
      d.vx = 0; d.facing = d.rushDir;
      const step = Math.round(WIND.rush * mad / 4);
      if (d.t === step || d.t === step * 2 || d.t === step * 3) {
        playSound('thud', 0.9, -4); shakeScreen(state, 4, 3);
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: d.x - d.facing * 20, y: GY - 4 }, vel: { x: -d.facing * (1 + Math.random() * 3), y: -1 - Math.random() * 2 }, life: 20, color: 'rgba(120, 53, 15, 0.7)', size: 5 + Math.random() * 4 });
      }
      if (d.t % 6 === 0) state.particles.push({ pos: { x: d.x + d.facing * 40, y: d.y - 74 }, vel: { x: d.facing * 1.5, y: -0.8 }, life: 18, color: 'rgba(214, 211, 209, 0.6)', size: 4 });
      if (d.t > WIND.rush * mad) { d.st = 'rush'; d.t = 0; d.hit = false; playSound('bellow', 1, -10); playSound('whoosh', 1, -14); }
      break;
    }
    case 'rush': {
      d.vx = d.rushDir * Math.min(RUSH_SPEED, 4 + d.t * 1.4);
      if (rectsOverlap(hb, { x: d.x - W / 2 + (d.rushDir > 0 ? 20 : -10), y: d.y - RUSH_TOP, w: W - 10, h: RUSH_TOP })) strike(ctx, d, DMG.rush, RUSH, d.rushDir * 16, -10);
      if (d.t % 2 === 0) state.particles.push({ pos: { x: d.x - d.rushDir * 30, y: GY - 6 }, vel: { x: -d.rushDir * 2, y: -1 - Math.random() * 2 }, life: 18, color: 'rgba(120, 53, 15, 0.6)', size: 6 + Math.random() * 5 });
      const end = d.rushDir > 0 ? D_MAX : D_MIN;
      if ((d.rushDir > 0 && d.x + d.vx >= end) || (d.rushDir < 0 && d.x + d.vx <= end)) {
        // (horns first into the fire wall: his mohawk goes up)
        d.x = end; d.vx = 0; d.st = 'crash'; d.t = 0;
        playSound('slam', 1, -8); playSound('ignite', 1, 2); shakeScreen(state, 14, 6);
      }
      break;
    }
    case 'crash':
      d.vx = 0;
      if (d.t % 4 === 0 && d.t < OPEN.crash * 0.7) state.particles.push({ pos: { x: d.x + (Math.random() - 0.3) * 30 * d.facing, y: d.y - H - 10 }, vel: { x: (Math.random() - 0.5) * 2, y: -3 - Math.random() * 3 }, life: 20, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 3 });
      if (d.t === 14) playSound('bellow', 0.7, 8);
      if (d.t > OPEN.crash * mad) recover(d, 24);
      break;
    // PILLARS ------------------------------------------------------------------------------------------------------
    case 'point':
      d.vx = 0; d.facing = toward;
      if (d.t > WIND.point * mad) {
        d.st = 'pillars'; d.t = 0;
        const clampX = (x: number) => Math.max(FLOOR_L + PILLAR_W / 2, Math.min(FLOOR_R - PILLAR_W / 2, x));
        if (Math.random() < 0.55) {
          // (where he stands, and either side)
          for (const o of [0, -190, 190]) d.pillars.push({ x: clampX(pc + o), t: o === 0 ? 0 : -6, hit: false, follow: false });
        } else {
          // (a row marching out at him from where he points)
          for (let i = 0; i < 5; i++) d.pillars.push({ x: clampX(d.x + d.facing * (110 + i * 120)), t: -i * 9, hit: false, follow: false });
        }
        // (hurt past half: one more, late, wherever he went)
        if (d.hp < HP * 0.5) d.pillars.push({ x: pc, t: -40, hit: false, follow: true });
        playSound('rumble', 1, -4);
      }
      break;
    case 'pillars':
      d.vx = 0;
      if (!d.pillars.length) { d.st = 'pose'; d.t = 0; playSound('grind', 0.6, 10); }
      break;
    case 'pose':
      // (throwing the horns, looking up for his dad)
      if (d.t > OPEN.pose * mad) recover(d, 20);
      break;
    // BREATH -------------------------------------------------------------------------------------------------------
    case 'inhale':
      d.vx = 0;
      if (d.t % 8 === 0) state.particles.push({ pos: { x: d.x + d.facing * 26, y: d.y - 140 }, vel: { x: d.facing * 0.6, y: -1 }, life: 22, color: 'rgba(120, 113, 108, 0.6)', size: 4 + Math.random() * 3 });
      if (d.t > WIND.inhale * mad) { d.st = 'breath'; d.t = 0; d.hit = false; playSound('flame', 1, -10); playSound('roar', 0.7, 6); }
      break;
    case 'breath': {
      const reach = BREATH_NEAR + (BREATH_REACH - BREATH_NEAR) * Math.min(1, d.t / 10);
      if (d.t <= 42 && rectsOverlap(hb, ahead(d, BREATH_NEAR, reach, 74, 30))) strike(ctx, d, DMG.breath, BREATH, d.facing * 9, -7);
      if (d.t % 6 === 0) playSound('flame', 0.6, -6);
      if (d.t > 44) { d.st = 'cough'; d.t = 0; }
      break;
    }
    case 'cough':
      if (d.t % 14 === 2) { playSound('snort', 0.7, 6); state.particles.push({ pos: { x: d.x + d.facing * 30, y: d.y - 120 }, vel: { x: d.facing * 1.5, y: -1 }, life: 26, color: 'rgba(87, 83, 78, 0.7)', size: 6 }); }
      if (d.t > OPEN.cough * mad) recover(d, 22);
      break;
    // COMBO --------------------------------------------------------------------------------------------------------
    case 'comboWind':
      d.vx = d.t < 12 ? d.facing * 1.5 : 0;
      if (d.t > WIND.combo * mad) { d.st = 'swing'; d.t = 0; d.hit = false; playSound('whoosh', 1, 0); }
      break;
    case 'swing':
      d.vx = d.t < 5 ? d.facing * 3 : 0;
      if (d.t >= 2 && d.t <= 7 && rectsOverlap(hb, ahead(d, 10, SWING_REACH, 110, 30))) strike(ctx, d, DMG.swing, GUITAR, d.facing * 8, -6);
      if (d.t > 16) { d.st = 'upswing'; d.t = 0; d.hit = false; d.facing = toward; playSound('whoosh', 1, 4); }
      break;
    case 'upswing':
      d.vx = d.t < 5 ? d.facing * 2 : 0;
      if (d.t >= 3 && d.t <= 8 && rectsOverlap(hb, ahead(d, -20, SWING_REACH - 20, 260, 40))) strike(ctx, d, DMG.upswing, GUITAR, d.facing * 6, -12);
      if (d.t > 16) {
        d.st = 'raise'; d.t = 0; d.hit = false; d.facing = toward;
        // (the hold: how long varies; the longer ones, a look up at his dad first)
        d.hold = Math.round((18 + Math.random() * 42) * mad);
        playSound('grind', 0.5, 12);
      }
      break;
    case 'raise':
      d.vx = 0;
      if (d.t > d.hold) { d.st = 'smash'; d.t = 0; d.hit = false; playSound('whoosh', 1, -10); }
      break;
    case 'smash':
      d.vx = d.t < 5 ? d.facing * 6 : 0;
      if (d.t === 5) {
        playSound('slam', 1, -6); playSound('crunch', 0.8, -8); shakeScreen(state, 14, 6);
        const sx = d.x + d.facing * 160;
        for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: sx + (Math.random() - 0.5) * 60, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 5 }, life: 30, color: i % 2 ? '#78350F' : '#FB923C', size: 3 + Math.random() * 4, grav: 0.3 });
      }
      if (d.t >= 3 && d.t <= 8 && rectsOverlap(hb, ahead(d, SMASH_NEAR, SMASH_FAR, 240, 0))) strike(ctx, d, DMG.smash, GUITAR, d.facing * 8, -11);
      if (d.t > 9) { d.st = 'stuck'; d.t = 0; d.vx = 0; }
      break;
    case 'stuck':
      // (the guitar stuck in the floor: tugging at it, his back to him)
      if (d.t % 16 === 0) playSound('grind', 0.4, -4);
      if (d.t > OPEN.stuck * mad) { recover(d, 20); playSound('crunch', 0.6, 4); }
      break;
    case 'stagger':
      d.vx = 0;
      if (d.t > STAGGER_FRAMES) recover(d, 16);
      break;
  }
  // Along, kept in his pit
  d.x = Math.max(D_MIN, Math.min(D_MAX, d.x + d.vx));
  // (just walked into: a shove)
  const walking = d.st === 'walk' || d.st === 'rise';
  if (walking && alive && p.isGrounded && p.invincibilityTimer <= 0 && !(p.isCharging || p.isUppercutting || p.isDivekicking) && rectsOverlap(hb, { x: d.x - W / 2 + 10, y: d.y - H + 20, w: W - 20, h: H - 20 })) {
    hurtPlayer(ctx, DMG.bump, DEMON_KIND, { x: toward * -8, y: -6 });
  }
};

/** Beaten up in the air: he comes down (with a thump). */
export const settleDemon = (state: GameState, d: Demon) => {
  if (d.y >= GY) return;
  d.vy += GRAV; d.y = Math.min(GY, d.y + d.vy);
  if (d.y >= GY) { d.vy = 0; playSound('thud', 1, -10); shakeScreen(state, 12, 5); }
};
/** He's sinking away (satan.ts says when). */
/** How long he takes to sink away. */
const SINK_T = 110;
export const sinkDemon = (d: Demon) => { d.st = 'sink'; d.t = 0; };
export const tickSink = (state: GameState, d: Demon) => {
  d.t++; d.sink = Math.min(1, d.t / SINK_T);
  sinkFx(state, d.x, d.t);
  if (d.t % 30 === 0) playSound('glug', 0.7, -8);
  if (d.sink >= 1) { d.fight = 'gone'; d.sunkAt = state.frame; sinkGulp(state, d.x); }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, world space, behind Meathead: a big SNES boss sprite (every part a stepped ramp lit from the upper left,
// dithered between the steps, inked; the lava's light along his undersides). Tall and lanky-strong: green liberty
// spikes, studded horns with rings in them, an open leather jacket (studs, patches, safety pins) over a cut red
// torso, ripped jeans, a chain, combat boots, a tail with a spiked collar on it, piercings, a sneer. His spiked
// flying-V. Between moves he keeps glancing up to see if his dad's watching.

const SKIN = ['#2E0604', '#560C08', '#7E1610', '#A2241A', '#C23E28', '#DE6646'];
const JEANS = ['#141C30', '#22304E', '#34487A', '#4A64A0', '#6C88C0', '#9AB0DA'];
const LEATHER = ['#060608', '#101014', '#1C1C22', '#2C2C34', '#44444E', '#62626E'];
const STEEL = ['#3A3A42', '#6A6A76', '#A0A0AC', '#D8D8E2', '#FFFFFF'];
const HAIR = ['#0A3010', '#16601A', '#28922A', '#4CC23E', '#9AEE6A'];
const HORNC = ['#4A3E30', '#7A6A54', '#A89678', '#D0C0A0', '#F0E4C8'];
const GTR = ['#12061E', '#24103A', '#3C1A5E', '#5C2A88', '#8648B4'];
const WOOD = ['#1E120A', '#3A2416', '#5A3A22'];
const EYE = '#F6D860';
const HOTT = ['#9A2A0A', '#E06010', '#F8A830', '#FFF0A0'];

type P2 = [number, number];
/** A stud: a steel dot, lit. */
const stud = (c: Ctx, x: number, y: number) => { box(c, x - 2, y - 2, 4, 4, INK); box(c, x - 1, y - 1, 3, 3, STEEL[2]); box(c, x - 1, y - 1, 1, 1, STEEL[4]); };
/** A ring (a piercing, a hoop): a steel loop. */
const ring = (c: Ctx, x: number, y: number, r: number) => {
  c.lineWidth = 2; c.strokeStyle = INK; c.beginPath(); c.arc(x, y, r + 0.5, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1; c.strokeStyle = STEEL[3]; c.beginPath(); c.arc(x, y, r, Math.PI * 0.9, Math.PI * 2.1); c.stroke();
};

/** The guitar: the grip at (hx, hy), pointing `ang` (0 forward): the bat-wing headstock behind the hand, the neck, the
 *  spiked flying-V out at the end; glinting at its tips when he's about to use it; its spikes going red-hot. */
const guitar = (c: Ctx, hx: number, hy: number, ang: number, glint: boolean, hot: number, broken = false) => {
  c.save(); c.translate(Math.round(hx), Math.round(hy)); c.rotate(ang);
  // (the headstock: a bat wing, three spikes, the tuners)
  inked(c, [[-4, -5], [-18, -9], [-30, -14], [-26, -4], [-34, 0], [-26, 4], [-30, 12], [-18, 8], [-4, 5]], GTR[1]);
  box(c, -24, -6, 16, 2, GTR[3]);
  for (const x of [-22, -16, -10]) { box(c, x, -8, 3, 3, STEEL[2]); box(c, x, 5, 3, 3, STEEL[1]); }
  // (the neck: frets, the strings)
  box(c, -6, -4, 78, 8, INK); box(c, -5, -3, 76, 6, WOOD[1]); box(c, -5, -3, 76, 2, WOOD[2]); box(c, -5, 2, 76, 1, WOOD[0]);
  for (let x = 2; x < 70; x += 8) box(c, x, -3, 1, 6, STEEL[1]);
  for (const x of [10, 26, 42]) box(c, x, -1, 2, 2, '#E8E0D0');
  // (the body: a flying V, its two wings in steps, a pinstripe, spikes off the tips)
  const T = hot > 0 ? (hot > 0.6 ? [HOTT[2], HOTT[3]] : [HOTT[0], HOTT[1]]) : [STEEL[2], STEEL[4]];
  const V: P2[] = [[64, -6], [76, -13], [134, -32], [140, -22], [102, -4], [102, 4], [140, 22], [134, 32], [76, 13], [64, 6]];
  inked(c, V, GTR[2]);
  c.fillStyle = GTR[3]; c.beginPath(); c.moveTo(68, -5); c.lineTo(78, -11); c.lineTo(133, -29); c.lineTo(136, -24); c.lineTo(100, -6); c.closePath(); c.fill();
  checker(c, 84, -16, 40, 4, GTR[4]);
  c.fillStyle = GTR[1]; c.beginPath(); c.moveTo(68, 5); c.lineTo(78, 11); c.lineTo(133, 29); c.lineTo(136, 24); c.lineTo(100, 6); c.closePath(); c.fill();
  checker(c, 84, 14, 40, 4, GTR[0]);
  c.strokeStyle = '#E8E0D0'; c.lineWidth = 1; c.beginPath(); c.moveTo(72, -8); c.lineTo(132, -28); c.moveTo(72, 8); c.lineTo(132, 28); c.stroke();
  for (const [x, y, s] of [[136, -34, -1], [136, 34, 1], [118, -26, -1], [118, 26, 1]] as [number, number, number][]) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 5, y - s * 2); c.lineTo(x + 1, y + s * 10); c.lineTo(x + 5, y - s * 2); c.fill();
    c.fillStyle = T[0]; c.beginPath(); c.moveTo(x - 3, y - s * 1); c.lineTo(x + 1, y + s * 7); c.lineTo(x + 3, y - s * 1); c.fill();
    box(c, x - 1, y, 1, 2, T[1]);
  }
  // (pickups, the bridge, the knobs, the strings over it all)
  box(c, 72, -6, 8, 12, INK); box(c, 73, -5, 6, 10, LEATHER[3]); box(c, 86, -6, 8, 12, INK); box(c, 87, -5, 6, 10, LEATHER[3]);
  box(c, 96, -4, 4, 8, STEEL[2]); box(c, 96, -4, 1, 8, STEEL[4]);
  for (const [x, y] of [[112, 12], [120, 16]]) { box(c, x - 2, y - 2, 5, 5, INK); box(c, x - 1, y - 1, 3, 3, STEEL[3]); }
  c.fillStyle = 'rgba(232, 224, 208, 0.7)'; for (const y of [-2, -1, 1, 2]) c.fillRect(-4, y, 102, 1);
  if (broken) { c.fillStyle = INK; c.fillRect(30, -5, 3, 10); c.fillRect(33, -2, 3, 4); c.fillStyle = '#E8E0D0'; c.fillRect(34, 3, 12, 1); c.fillRect(32, 5, 10, 1); }
  if (glint) { box(c, 136, -40, 3, 14, '#FFFFFF'); box(c, 130, -34, 15, 3, '#FFFFFF'); box(c, 136, 26, 3, 14, '#FFFFFF'); box(c, 130, 32, 15, 3, '#FFFFFF'); }
  c.restore();
};

const UPPER = 42, FORE = 40, THIGH = 40, SHIN = 36;
/** A hand brought within reach of the shoulder (src/m2/art/limb.ts). */
const reach = (sx: number, sy: number, hx: number, hy: number): P2 => reachTo(sx, sy, hx, hy, UPPER, FORE);

/** An arm: the jacket's studded shoulder, the leather sleeve to the elbow (a torn cuff), the bare red forearm, a
 *  spiked wristband, the fist (`horns`: index and pinkie up). `far`: the one behind, a shade darker. */
const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, S: readonly string[], far = false, horns = false) => {
  const R = far ? S.map(x => mix(x, INK, 0.2)) : S, L = far ? LEATHER.map(x => mix(x, INK, 0.2)) : LEATHER;
  // (the elbow by anatomy (src/m2/art/limb.ts): drawn facing right, the forearm folds toward the front of the upper
  // arm: down when reaching out, forward when the guitar's overhead, back when the hand's low behind him)
  [hx, hy] = reachTo(sx, sy, hx, hy, UPPER, FORE);
  const [ex, ey] = elbow(sx, sy, hx, hy, UPPER, FORE, 1);
  thick(c, ex, ey, hx, hy, 14, R);
  thick(c, sx, sy, ex, ey, 19, L);
  // (the sleeve's torn cuff)
  const ax = (hx - ex), ay = (hy - ey), al = Math.hypot(ax, ay) || 1, cx = ex + ax / al * 6, cy = ey + ay / al * 6;
  thick(c, ex - ax / al * 4, ey - ay / al * 4, cx, cy, 20, L);
  box(c, cx - 3, cy + 4, 2, 4, L[3]); box(c, cx + 2, cy + 5, 2, 3, L[3]);
  blob(c, sx, sy, 12, 10, L, false);
  stud(c, sx - 6, sy - 6); stud(c, sx + 2, sy - 9); stud(c, sx + 9, sy - 5);
  // (the wristband: black, spiked)
  const wx = hx - ax / al * 9, wy = hy - ay / al * 9, nx = -ay / al, ny = ax / al;
  thick(c, wx - ax / al * 4, wy - ay / al * 4, wx + ax / al * 2, wy + ay / al * 2, 15, LEATHER);
  for (const k of [-1, 1]) { c.fillStyle = STEEL[3]; c.beginPath(); c.moveTo(wx + nx * 8 * k - ax / al * 3, wy + ny * 8 * k - ay / al * 3); c.lineTo(wx + nx * 13 * k, wy + ny * 13 * k); c.lineTo(wx + nx * 8 * k + ax / al * 3, wy + ny * 8 * k + ay / al * 3); c.fill(); }
  blob(c, hx, hy, 9, 8, R, false);
  if (horns) {
    // (the horns: index and pinkie up, a claw on each)
    for (const o of [-5, 5]) { box(c, hx + o - 2, hy - 20, 5, 16, INK); box(c, hx + o - 1, hy - 19, 3, 14, R[3]); box(c, hx + o - 1, hy - 22, 3, 3, INK); }
  }
};

interface Pose {
  squat: number; lean: number; tilt: number; stride: number;
  near: P2; far: P2;
  gtr: { ang: number; glint: boolean; hot: number; behind: boolean } | null;
  /** The far hand on the guitar's neck too (two hands). */
  both: boolean;
  mouth: number; puff: number; look: boolean; sat: boolean; tuck: boolean; hornHot: number; hairFire: boolean; hornsUp: boolean; cry: boolean;
}

const poseOf = (d: Demon, f: number): Pose => {
  const st = d.st, t = d.t, mad = madOf(d);
  const talking = !!d.said;
  const glance = st === 'walk' && (f % 240) < 44;
  const P: Pose = {
    squat: 0, lean: 0.05, tilt: glance ? -0.3 : 0, stride: st === 'walk' && Math.abs(d.vx) > 0.1 ? Math.sin(f * 0.22) : 0,
    near: [40, -104], far: [-16, -78], gtr: { ang: -2.3, glint: false, hot: 0, behind: true }, both: false,
    mouth: talking && Math.floor(f / 6) % 2 ? 6 : 0, puff: 0, look: glance, sat: false, tuck: false, hornHot: 0, hairFire: false, hornsUp: false, cry: false,
  };
  const k = (n: number) => Math.min(1, t / n);
  switch (st) {
    case 'lounge': {
      // (shredding for nobody: the guitar slung low, fretting up the neck, strumming, headbanging)
      P.near = [42, -112]; P.gtr = { ang: 2.42, glint: false, hot: 0, behind: false };
      P.far = [-14 + (Math.floor(f / 5) % 2) * 6, -50]; P.tilt = Math.sin(f * 0.3) * 0.18; P.squat = 4;
      break;
    }
    case 'rise': {
      if (t < 50) { P.near = [42, -112]; P.gtr = { ang: 2.42, glint: false, hot: 0, behind: false }; P.far = [70, -116]; P.mouth = 6; }
      else { const u = k(100); P.near = [40, -104 - 10 * (1 - u)]; P.gtr = { ang: -2.3, glint: false, hot: 0, behind: true }; P.far = [-16, -78]; }
      break;
    }
    case 'crouch': {
      const u = k(10); P.squat = 26 * u; P.lean = 0.35 * u; P.near = [10, -170 + 26 * u]; P.far = [-6, -166 + 26 * u];
      P.gtr = { ang: -2.6, glint: Math.floor(t / 5) % 2 === 0, hot: 0, behind: true }; P.both = true; P.hornHot = Math.min(1, t / (WIND.crouch * mad)); P.mouth = 3;
      break;
    }
    case 'feint': P.near = [20, -190]; P.far = [-4, -186]; P.gtr = { ang: -2.4, glint: false, hot: 0, behind: true }; P.both = true; P.mouth = 8; P.look = true; P.tilt = -0.3; break;
    case 'air': P.tuck = true; P.near = [16, -180]; P.far = [0, -178]; P.gtr = { ang: -2.2, glint: false, hot: 0.4, behind: true }; P.both = true; P.mouth = 7; P.hornHot = 1; break;
    case 'land': { const u = Math.max(0, 1 - t / 14); P.squat = 20 * u + 4; P.lean = 0.45 * u + 0.1; P.near = [70, -40]; P.far = [44, -44]; P.gtr = { ang: 0.7, glint: false, hot: 0, behind: false }; P.both = true; P.mouth = 2; break; }
    case 'sweepWind': P.squat = 20; P.lean = 0.3; P.near = [-36, -50]; P.far = [-10, -70]; P.gtr = { ang: Math.PI - 0.1, glint: Math.floor(t / 6) % 2 === 0, hot: t / (WIND.sweep * mad), behind: true }; P.mouth = 3; break;
    case 'sweep': { const u = k(7); P.squat = 18; P.lean = 0.35; P.near = [-36 + 100 * u, -44 + 10 * u]; P.gtr = { ang: (Math.PI - 0.1) * (1 - u) + 0.08 * u, glint: false, hot: 1, behind: u < 0.5 }; P.far = [-14, -70]; P.mouth = 7; break; }
    case 'sweepRec': P.squat = 8; P.lean = 0.15; P.near = [56, -84]; P.gtr = { ang: -0.6, glint: false, hot: 0, behind: false }; P.far = [-18, -74]; P.look = t > 16; P.tilt = t > 16 ? -0.25 : 0; break;
    case 'rushWind': {
      // (head down, horns out; a boot pawing the floor; steam out his nose)
      P.squat = 18; P.lean = 0.95; P.tilt = 0.45; P.near = [40, -64]; P.far = [10, -60];
      P.gtr = { ang: -2.9, glint: false, hot: 0, behind: true }; P.hornHot = Math.min(1, t / (WIND.rush * mad)); P.stride = Math.sin(t * 0.5) * 0.8;
      break;
    }
    case 'rush': P.squat = 14; P.lean = 1.05; P.tilt = 0.45; P.near = [30, -56]; P.far = [0, -54]; P.gtr = { ang: -2.9, glint: false, hot: 0, behind: true }; P.hornHot = 1; P.stride = Math.sin(t * 0.7); P.mouth = 5; break;
    case 'crash': P.squat = 10; P.lean = 0.25; P.tilt = -0.15; P.near = [26, -150]; P.far = [4, -160]; P.gtr = null; P.mouth = 8; P.hairFire = t < OPEN.crash * 0.7; P.cry = t > 20; break;
    case 'point': { const u = k(14); P.near = [30 + 10 * u, -110 - 80 * u]; P.gtr = null; P.far = [-16, -80]; P.mouth = 3; P.look = false; break; }
    case 'pillars': P.near = [92, -60]; P.gtr = null; P.far = [-16, -80]; P.mouth = 4; P.tilt = 0.15; break;
    case 'pose': P.near = [30, -196]; P.gtr = null; P.far = [-10, -80]; P.hornsUp = true; P.look = true; P.tilt = -0.35; P.mouth = t % 30 < 15 ? 6 : 2; break;
    case 'inhale': { const u = k(WIND.inhale * mad); P.lean = -0.2 * u; P.tilt = -0.25 * u; P.puff = u; P.near = [44, -100]; P.far = [-20, -82]; P.gtr = { ang: -2.4, glint: false, hot: 0, behind: true }; break; }
    case 'breath': P.squat = 34; P.lean = 1.3; P.tilt = -1.15; P.mouth = 9; P.near = [44, -60]; P.far = [0, -50]; P.gtr = { ang: -2.9, glint: false, hot: 0, behind: true }; break;
    case 'cough': P.squat = 8; P.lean = 0.4; P.tilt = 0.1; P.near = [36, -112]; P.far = [-16, -76]; P.gtr = { ang: -2.4, glint: false, hot: 0, behind: true }; P.mouth = t % 14 < 6 ? 7 : 2; break;
    case 'comboWind': P.squat = 8; P.lean = 0.1; P.near = [24, -128]; P.far = [-10, -84]; P.gtr = { ang: -2.75, glint: Math.floor(t / 4) % 2 === 0, hot: 0, behind: true }; P.stride = 0.6; P.mouth = 2; break;
    case 'swing': { const u = k(5); P.squat = 6; P.lean = 0.2; P.near = [24 + 50 * u, -128 + 40 * u]; P.gtr = { ang: -2.75 * (1 - u) + 0.05 * u, glint: false, hot: 0.7, behind: u < 0.4 }; P.far = [-14, -80]; P.stride = 0.8; P.mouth = 6; break; }
    case 'upswing': { const u = k(6); P.squat = 4; P.lean = 0.1 - 0.2 * u; P.near = [70 - 20 * u, -78 - 80 * u]; P.gtr = { ang: 0.05 - 1.5 * u, glint: false, hot: 0.7, behind: false }; P.far = [-14, -80]; P.stride = -0.6; P.mouth = 6; break; }
    case 'raise': {
      // (overhead, held; trembling; on a long hold, a look up at his dad)
      const sh = Math.round(Math.sin(t * 1.3) * 1.5);
      P.near = [12 + sh, -196]; P.far = [-6 + sh, -192]; P.both = true; P.gtr = { ang: -2.5, glint: t % 8 < 3, hot: Math.min(1, t / 40), behind: true }; P.lean = -0.12;
      P.look = t > 10 && t < d.hold - 6 && d.hold > 34; P.tilt = P.look ? -0.35 : -0.1; P.mouth = 2;
      break;
    }
    case 'smash': { const u = k(5); P.squat = 16 * u; P.lean = -0.12 + 0.6 * u; P.near = [12 + 60 * u, -196 + 150 * u]; P.far = [-6 + 50 * u, -192 + 150 * u]; P.both = true; P.gtr = { ang: -2.5 + 3.4 * u, glint: false, hot: 1, behind: u < 0.4 }; P.mouth = 8; break; }
    case 'stuck': { const tug = Math.sin(t * 0.6) * 3; P.squat = 14; P.lean = 0.55; P.near = [74 + tug, -44]; P.far = [52 + tug, -46]; P.both = true; P.gtr = { ang: 0.9, glint: false, hot: 0, behind: false }; P.mouth = t % 20 < 10 ? 5 : 2; break; }
    case 'stagger': P.squat = 10; P.lean = 0.3; P.tilt = 0.2; P.near = [30, -60]; P.gtr = { ang: 0.38, glint: false, hot: 0, behind: false }; P.far = [24, -146]; P.mouth = 7; P.cry = true; break;
    case 'beaten': case 'sink': P.sat = true; P.gtr = null; P.near = [24, -100]; P.far = [14, -104]; P.mouth = 8; P.cry = true; P.tilt = -0.2; break;
  }
  return P;
};

const LEG = 86;
/** The legs (jeans ripped at the knee, combat boots), the chain off the belt; returns the hip's height. */
const legs = (c: Ctx, P: Pose, S: readonly string[], f: number) => {
  const hipY = P.sat ? -20 : -LEG + P.squat;
  const feet: [P2, P2] = P.sat ? [[70, 0], [56, -2]]
    : P.tuck ? [[18, hipY + 44], [-6, hipY + 48]]
    : [[16 + P.stride * 22, 0], [-14 - P.stride * 22, 0]];
  for (const [i, hx] of [[1, -8], [0, 10]] as [number, number][]) {
    const far = i === 1, J = far ? JEANS.map(x => mix(x, INK, 0.25)) : JEANS;
    const [fx, fy] = feet[i === 1 ? 1 : 0];
    const ank: P2 = [fx - 2, fy - 14];
    // (the knee always forward: src/m2/art/limb.ts)
    const kn = knee(hx, hipY, ank[0], ank[1], THIGH, SHIN, 1);
    thick(c, hx, hipY, kn[0], kn[1], 22, J);
    thick(c, kn[0], kn[1], ank[0], ank[1], 18, J);
    // (the rip at the knee: red showing through, the white threads)
    box(c, kn[0] - 5, kn[1] - 3, 10, 7, far ? S[1] : S[3]); box(c, kn[0] - 5, kn[1] - 3, 10, 1, '#E8E4DC'); box(c, kn[0] - 4, kn[1] + 4, 8, 1, '#E8E4DC');
    // (the boot: steel toe, thick sole, laced up)
    const B = far ? LEATHER.map(x => mix(x, INK, 0.25)) : LEATHER, toe = P.sat ? 0 : 1;
    c.save(); c.translate(fx, fy); if (P.sat) c.rotate(-1.3);
    inked(c, [[-12, 0], [-12, -22], [2, -24], [6, -12], [22 * toe + 2, -8], [24 * toe + 2, 0]], B[2]);
    box(c, -12, -4, 36 * toe + 2, 4, B[0]); checker(c, -12, -6, 36 * toe + 2, 2, B[1]);
    box(c, -10, -22, 4, 14, B[4]); box(c, 14 * toe, -9, 8 * toe, 4, STEEL[1]);
    for (let y = -20; y < -8; y += 4) box(c, -2, y, 6, 1, STEEL[2]);
    c.restore();
  }
  // (the belt: studded, the chain swinging off it to the back pocket)
  const sw = Math.round(Math.sin(f * 0.15) * 3);
  for (let i = 0; i < 7; i++) {
    const u = i / 6, x = 14 - 30 * u, y = hipY + 6 + Math.sin(u * Math.PI) * (26 + sw);
    box(c, x - 2, y - 2, 5, 4, INK); box(c, x - 1, y - 1, 3, 2, i % 2 ? STEEL[2] : STEEL[3]);
  }
  return hipY;
};

const drawPunk = (c: Ctx, d: Demon, f: number) => {
  const P = poseOf(d, f), fl = d.flash > 0;
  const S = flashed(SKIN, fl);
  const hipY = P.sat ? -20 : -LEG + P.squat;
  const ca = Math.cos(P.lean), sa = Math.sin(P.lean);
  /** Torso-local (the hips at 0, up the spine: -y) to his own frame. */
  const R = (x: number, y: number): P2 => [x * ca - y * sa, hipY + x * sa + y * ca];
  const nearSh = R(20, -58), farSh = R(-14, -60);
  // The hands: within reach; the guitar's grip in the near one
  const near = reach(nearSh[0], nearSh[1], P.near[0], P.near[1]);
  let far = P.far;
  if (P.both && P.gtr) far = [near[0] + Math.cos(P.gtr.ang) * 26, near[1] + Math.sin(P.gtr.ang) * 26];
  far = reach(farSh[0], farSh[1], far[0], far[1]);
  // (the tail: a whip from the small of his back, curling up behind him; a spiked collar near the end; the spade)
  const tw = Math.round(Math.sin(f * 0.12) * 8), tb = R(-14, -4);
  const tp: P2 = [tb[0] - 62, tb[1] - 40 + tw], tq: P2 = [tb[0] - 50, tb[1] + 30];
  c.lineCap = 'round';
  for (const [col, w] of [[INK, 9], [S[1], 5], [S[3], 2]] as [string, number][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(tb[0], tb[1]); c.quadraticCurveTo(tq[0], tq[1], tp[0], tp[1]); c.stroke(); }
  c.lineCap = 'butt';
  const cx = tp[0] + 6, cy = tp[1] + 12;
  box(c, cx - 6, cy - 4, 12, 8, INK); box(c, cx - 5, cy - 3, 10, 6, LEATHER[2]);
  for (const o of [-4, 0, 4]) { c.fillStyle = INK; c.beginPath(); c.moveTo(cx + o - 2, cy - 3); c.lineTo(cx + o, cy - 9); c.lineTo(cx + o + 2, cy - 3); c.fill(); box(c, cx + o - 1, cy - 5, 2, 2, STEEL[3]); }
  inked(c, [[tp[0], tp[1] - 14], [tp[0] + 10, tp[1] + 2], [tp[0], tp[1] - 2], [tp[0] - 10, tp[1] + 2]], S[2]);
  // (the guitar, if it's behind him; the far arm)
  const g = P.gtr;
  if (g && g.behind) guitar(c, near[0], near[1], g.ang, g.glint, g.hot);
  legs(c, P, S, f);
  arm(c, farSh[0], farSh[1], far[0], far[1], S, true);
  // The torso (rotated about the hips)
  c.save(); c.translate(0, hipY); c.rotate(P.lean);
  const puff = Math.round(P.puff * 5);
  // (the cut red torso: a V, pecs, abs in steps)
  inked(c, [[-15, -2], [-28 - puff, -56], [-22, -68], [28, -68], [34 + puff, -56], [18, -2]], S[3]);
  c.fillStyle = S[2]; c.beginPath(); c.moveTo(18, -2); c.lineTo(34 + puff, -56); c.lineTo(26, -50); c.lineTo(12, -4); c.fill();
  for (const px of [-2, 18]) { blob(c, px, -50, 12 + puff, 8 + puff * 0.6, S, false, 1); box(c, px - 8, -43 + puff, 16, 2, S[1]); }
  for (let r = 0; r < 3; r++) for (const ax of [2, 12]) {
    const y = -36 + r * 10;
    box(c, ax, y, 9, 8, S[3]); box(c, ax, y, 4, 2, S[5]); box(c, ax, y + 6, 9, 2, S[1]); checker(c, ax + 4, y + 2, 4, 2, S[4]);
  }
  box(c, 10, -38, 2, 34, S[1]);
  ring(c, 19, -49, 2);
  // (the jacket, open: the back panel with its patches, the front with the zipper and the safety pins, the collar)
  inked(c, [[-16, -2], [-30 - puff, -56], [-24, -70], [-4, -70], [-8, -44], [-6, -2]], LEATHER[2]);
  box(c, -24, -56, 3, 50, LEATHER[3]); checker(c, -21, -56, 2, 50, LEATHER[3]);
  box(c, -14, -6, 6, 4, LEATHER[1]);
  // (a circle-A patch, a 666 patch)
  box(c, -26, -46, 14, 14, INK); box(c, -25, -45, 12, 12, '#E8E4DC');
  c.strokeStyle = '#B91C1C'; c.lineWidth = 2; c.beginPath(); c.arc(-19, -39, 5, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(-23, -34); c.lineTo(-19, -44); c.lineTo(-15, -34); c.moveTo(-21, -38); c.lineTo(-17, -38); c.stroke();
  box(c, -26, -24, 16, 9, INK); box(c, -25, -23, 14, 7, '#C8A86A');
  for (const x of [-24, -20, -16]) { box(c, x, -22, 3, 5, '#7F1D1D'); box(c, x + 1, -20, 1, 2, '#C8A86A'); }
  inked(c, [[20, -2], [18, -40], [26, -66], [36 + puff, -56], [30, -2]], LEATHER[1]);
  box(c, 19, -40, 2, 38, STEEL[1]); checker(c, 19, -40, 2, 38, STEEL[3]);
  box(c, 32, -50, 2, 44, LEATHER[3]);
  for (const [x, y] of [[25, -32], [26, -20]] as P2[]) { box(c, x, y, 7, 1, STEEL[3]); box(c, x + 6, y - 1, 2, 3, STEEL[2]); }
  // (the belt, studded)
  box(c, -17, -8, 37, 8, INK); box(c, -16, -7, 35, 6, LEATHER[3]); for (let x = -13; x < 18; x += 6) stud(c, x, -4);
  box(c, 4, -8, 8, 8, STEEL[2]); box(c, 6, -6, 4, 4, LEATHER[1]);
  // (the neck, the spiked collar)
  box(c, 0, -78, 14, 12, INK); box(c, 1, -78, 12, 11, S[2]);
  box(c, -2, -74, 18, 6, INK); box(c, -1, -73, 16, 4, LEATHER[2]);
  for (const x of [1, 6, 11]) { c.fillStyle = STEEL[3]; c.beginPath(); c.moveTo(x, -73); c.lineTo(x + 2, -79); c.lineTo(x + 4, -73); c.fill(); }
  // The head
  c.translate(8, -78); c.rotate(P.tilt);
  head(c, P, S, d, f);
  c.restore();
  // (the near arm, and the guitar in front if it's in front)
  if (g && !g.behind) guitar(c, near[0], near[1], g.ang, g.glint, g.hot);
  arm(c, nearSh[0], nearSh[1], near[0], near[1], S, false, P.hornsUp);
};

/** A horn: from its root (bx, by) to its tip (tx, ty), curving; two steel rings round it, a stud; red-hot at the tip in a
 *  wind-up. */
const horn = (c: Ctx, bx: number, by: number, tx: number, ty: number, back: boolean, hot: number) => {
  const Hc = back ? HORNC.map(x => mix(x, INK, 0.3)) : HORNC;
  const mx = (bx + tx) / 2 + (back ? -6 : 6), my = (by + ty) / 2 + 4;
  inked(c, [[bx - 7, by], [mx - 5, my], [tx, ty], [mx + 4, my + 2], [bx + 7, by + 2]], Hc[2]);
  c.fillStyle = Hc[3]; c.beginPath(); c.moveTo(bx - 5, by); c.lineTo(mx - 3, my); c.lineTo(tx, ty); c.lineTo(mx - 1, my + 1); c.lineTo(bx - 1, by + 1); c.fill();
  c.fillStyle = Hc[1]; c.beginPath(); c.moveTo(bx + 6, by + 1); c.lineTo(mx + 3, my + 1); c.lineTo(tx, ty); c.lineTo(mx + 1, my + 3); c.fill();
  if (hot > 0) {
    c.fillStyle = hot > 0.6 ? HOTT[2] : HOTT[1];
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + (mx - tx) * 0.6 - 3, ty + (my - ty) * 0.6); c.lineTo(tx + (mx - tx) * 0.6 + 3, ty + (my - ty) * 0.6 + 2); c.fill();
    if (hot > 0.6) box(c, tx - 1, ty, 2, 3, HOTT[3]);
  }
  for (const u of [0.22, 0.45]) {
    const rx = bx + (mx - bx) * u * 2, ry = by + (my - by) * u * 2;
    box(c, rx - 7, ry - 1, 14, 4, INK); box(c, rx - 6, ry, 12, 2, STEEL[2]); box(c, rx - 6, ry, 4, 1, STEEL[4]);
  }
  stud(c, mx + (tx - mx) * 0.3, my + (ty - my) * 0.3);
};

/** His head (the neck's top at 0, facing right): the horns with rings in them, the liberty spikes, the long sneering
 *  face, the pointed ear with its gauge, the piercings. */
const head = (c: Ctx, P: Pose, S: readonly string[], d: Demon, f: number) => {
  c.scale(1.15, 1.15);
  horn(c, -8, -30, -34, -60, true, P.hornHot);
  // (the face: long, angular, the jaw out; the shaved side; the cheekbone)
  inked(c, [[-14, -32], [-16, -14], [-10, -2], [4, 4], [18, 2], [22, -8], [21, -22], [16, -34], [2, -38]], S[3]);
  c.fillStyle = S[2]; c.beginPath(); c.moveTo(-14, -30); c.lineTo(-16, -14); c.lineTo(-10, -2); c.lineTo(2, 2); c.lineTo(-2, -20); c.fill();
  checker(c, -12, -32, 12, 14, mix(S[1], '#000000', 0.2));
  box(c, 8, -16, 10, 2, S[4]); box(c, 12, -30, 6, 2, S[5]);
  box(c, 0, 1, 16, 2, S[1]);
  if (P.puff > 0) blob(c, 12, -10, 5 + P.puff * 4, 4 + P.puff * 3, S, false, 1);
  // (the ear: pointed, back; a gauge, two hoops)
  inked(c, [[-6, -24], [-24, -36], [-10, -14]], S[2]);
  ring(c, -9, -18, 3); ring(c, -16, -30, 1.5); ring(c, -13, -27, 1.5);
  // (the eye: yellow, slit; up at his dad when he's looking; the brow down hard, its rings)
  const ey = -22, up = P.look ? -2 : 0;
  box(c, 8, ey - 3, 10, 7, INK); box(c, 9, ey - 2, 8, 5, EYE);
  box(c, 12 + (P.look ? -1 : 1), ey - 2 + up + (P.look ? 1 : 0), 2, 5 + (P.look ? -2 : 0), INK);
  if (P.cry) for (let i = 0; i < 2; i++) { const ty = ((f * 2 + i * 15) % 30); box(c, 10 + i * 4, ey + 4 + ty, 2, 3, '#7DD3FC'); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(5, ey - 7 - (P.cry ? 2 : 0)); c.lineTo(20, ey - 3 + (P.cry ? -3 : 0)); c.lineTo(19, ey - 1); c.lineTo(5, ey - 4); c.fill();
  ring(c, 9, ey - 9, 1.5); ring(c, 13, ey - 9, 1.5);
  // (the nose, the septum ring)
  inked(c, [[17, -18], [24, -10], [18, -9]], S[3], 1.5);
  ring(c, 20, -7, 2);
  // (the mouth: a sneer (the lip curled up at the front, a fang out); open when he's talking, yelling, breathing fire)
  const open = Math.max(P.mouth, d.said && Math.floor(f / 6) % 2 ? 5 : 0);
  if (open > 1) {
    box(c, 6, -5, 14, open + 2, INK); box(c, 7, -4, 12, open, '#3A0808');
    if (d.st === 'breath') { box(c, 8, -4, 10, open, HOTT[2]); box(c, 10, -3, 6, open - 2, HOTT[3]); }
    else box(c, 9, -4 + open - 3, 8, 3, '#C04050');
    box(c, 15, -4, 2, 3, '#F4F0E8'); box(c, 8, -4, 2, 3, '#F4F0E8');
  } else {
    box(c, 6, -4, 14, 2, INK); box(c, 15, -6, 5, 2, INK); box(c, 16, -4, 2, 3, '#F4F0E8');
  }
  ring(c, 11, 0, 1.5);
  // (the liberty spikes: up off the top of the shaved head, fanned back; on fire, after the rush)
  const spikes: [number, number, number][] = [[12, -34, -1.25], [6, -37, -1.55], [-1, -38, -1.85], [-8, -36, -2.15], [-13, -32, -2.45]];
  spikes.forEach(([x, y, a], i) => {
    const L = 30 + (i === 2 ? 6 : i % 2 ? 2 : 0) + Math.round(Math.sin(f * 0.08 + i) * (P.hairFire ? 2 : 0));
    const tx = x + Math.cos(a) * L, ty = y + Math.sin(a) * L, nx = -Math.sin(a) * 4.5, ny = Math.cos(a) * 4.5;
    inked(c, [[x - nx, y - ny], [tx, ty], [x + nx, y + ny]], HAIR[2]);
    c.fillStyle = HAIR[3]; c.beginPath(); c.moveTo(x - nx * 0.7, y - ny * 0.7); c.lineTo(tx, ty); c.lineTo(x, y); c.fill();
    c.fillStyle = HAIR[4]; c.beginPath(); c.moveTo(x - nx * 0.4 + Math.cos(a) * L * 0.55, y - ny * 0.4 + Math.sin(a) * L * 0.55); c.lineTo(tx, ty); c.lineTo(x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.6); c.fill();
    c.fillStyle = HAIR[1]; c.beginPath(); c.moveTo(x + nx * 0.8, y + ny * 0.8); c.lineTo(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5); c.lineTo(x, y); c.fill();
    if (P.hairFire) {
      const fy = Math.floor(f / 3) % 2 ? 2 : 0;
      c.fillStyle = HOTT[1]; c.beginPath(); c.moveTo(tx - 5, ty + 4); c.lineTo(tx, ty - 12 - fy * 2); c.lineTo(tx + 5, ty + 4); c.fill();
      c.fillStyle = HOTT[3]; c.beginPath(); c.moveTo(tx - 2, ty + 2); c.lineTo(tx, ty - 6 - fy); c.lineTo(tx + 2, ty + 2); c.fill();
    }
  });
  box(c, -12, -36, 26, 3, HAIR[1]);
  horn(c, 8, -32, 22, -64, false, P.hornHot);
};

export const drawDemon = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d) return;
  const f = state.frame;
  // (the guitar he dropped: still lying there on the way back, its neck cracked)
  // (the puddle he went down in: its last gulp, crusting over, then a scorch)
  if (d.fight === 'gone' && d.sink >= 1) drawSunk(c, state, d.x, f - d.sunkAt);
  if (d.guitarAt !== null) guitar(c, d.guitarAt - 70, GY - 9, 0.04, false, 0, true);
  if (d.fight === 'gone') return;
  if (d.x < state.camera.x - 500 || d.x > state.camera.x + CANVAS_WIDTH + 500) return;
  const st = d.st, t = d.t, mad = madOf(d);
  // (his shadow where he'll come down: in steps, darker as he comes)
  if (st === 'air') {
    const k = Math.max(0.2, 1 - (GY - d.y) / 500), rw = Math.round(60 * k + 10);
    c.fillStyle = `rgba(0, 0, 0, ${(0.35 * k).toFixed(2)})`;
    c.fillRect(Math.round(d.jumpTo - rw), GY - 4, rw * 2, 6); c.fillRect(Math.round(d.jumpTo - rw * 0.7), GY - 6, Math.round(rw * 1.4), 8);
    checker(c, Math.round(d.jumpTo - rw - 6), GY - 4, rw * 2 + 12, 4, k > 0.6 ? '#F97316' : '#7F1D1D');
  }
  // (the sweep's reach, flashing along the floor: jump it)
  if (st === 'sweepWind') {
    const z = ahead(d, 20, SWEEP_REACH, 4, 0), on = Math.floor(t / 6) % 2 === 0;
    box(c, z.x, GY - 4, z.w, 4, on ? '#FDE047' : '#B45309'); checker(c, z.x, GY - 8, z.w, 4, on ? '#FDE047' : '#F97316');
  }
  // (the rush's lane: arrows along the floor his way, lighting up in turn)
  if (st === 'rushWind') {
    const end = d.rushDir > 0 ? D_MAX : D_MIN, n = Math.floor(Math.abs(end - d.x) / 70);
    for (let i = 1; i <= n; i++) {
      const x = d.x + d.rushDir * i * 70, lit = (Math.floor(t / 4) - i) % 4 === 0;
      c.fillStyle = lit ? '#FDE047' : 'rgba(239, 68, 68, 0.55)';
      c.beginPath(); c.moveTo(x - d.rushDir * 10, GY - 10); c.lineTo(x + d.rushDir * 6, GY - 5); c.lineTo(x - d.rushDir * 10, GY); c.fill();
    }
  }
  // (his pillars: the floor glowing and bubbling, then hellfire up out of it)
  const glow = pillarGlow(d);
  for (const pl of d.pillars) {
    if (pl.t < 0 && !(pl.follow)) continue;
    if (pl.t < 0) continue;
    const x = Math.round(pl.x);
    if (pl.t < glow) {
      const u = pl.t / glow, a = 0.25 + 0.35 * u + (Math.floor(pl.t / 5) % 2) * 0.15;
      for (const [r, col] of [[1, LAVA[2]], [0.7, LAVA[4]], [0.4, LAVA[6]]] as [number, string][]) { c.globalAlpha = a; box(c, x - PILLAR_W / 2 * r, GY - 3, PILLAR_W * r, 4, col); }
      c.globalAlpha = 1;
      checker(c, x - PILLAR_W / 2, GY - 7, PILLAR_W, 4, u > 0.6 ? LAVA[6] : LAVA[3]);
      for (let i = 0; i < 3; i++) { const by = GY - 8 - ((pl.t * 2 + i * 9) % 22); box(c, x - 16 + i * 14, by, 4, 4, LAVA[5]); }
      hazeBands(c, x - PILLAR_W / 2, GY - 120 * u, PILLAR_W, 120 * u, LAVA[3], 0, 0.14 * u, 3);
    } else {
      const u = Math.min(1, (pl.t - glow) / 5), dying = pl.t > glow + PILLAR_BURN - 8 ? (glow + PILLAR_BURN - pl.t) / 8 : 1;
      const top = GY - PILLAR_H * u, cols = [LAVA[2], LAVA[3], LAVA[5], LAVA[6], LAVA[7]];
      for (let i = 0; i < cols.length; i++) {
        const ww = Math.round((PILLAR_W + 8 - i * 11) * Math.max(0.2, dying));
        for (let y = Math.floor(top / 6) * 6; y < GY; y += 6) {
          const wob = Math.round(Math.sin(f * 0.5 + y * 0.06 + i * 1.3) * (3 - i * 0.4));
          box(c, x - ww / 2 + wob, y, ww, 6, cols[i]);
        }
      }
    }
  }
  // (the shockwaves: a crest of rock and fire running along the floor)
  for (const w of d.waves) {
    const x = Math.round(w.x);
    for (const [dx, h, col] of [[-12, 12, LAVA[2]], [-6, 20, LAVA[4]], [0, 26, LAVA[6]], [6, 16, LAVA[4]]] as [number, number, string][]) {
      box(c, x + dx * w.dir - 3, GY - h, 7, h, INK); box(c, x + dx * w.dir - 2, GY - h + 1, 5, h - 1, col);
    }
    box(c, x - 14, GY - 4, 28, 4, '#78350F');
  }
  // (the breath: a jet of fire straight out at his waist, in bands, white at the core)
  if (st === 'breath') {
    const reach = BREATH_NEAR + (BREATH_REACH - BREATH_NEAR) * Math.min(1, t / 10), dying = t > 36 ? (44 - t) / 8 : 1;
    const x0 = d.x + d.facing * (BREATH_NEAR + 6);
    for (const [hh, col] of [[22, LAVA[3]], [16, LAVA[5]], [10, LAVA[6]], [4, LAVA[7]]] as [number, string][]) {
      for (let s = 0; s < reach - BREATH_NEAR + 10; s += 8) {
        const k2 = s / (reach - BREATH_NEAR + 10), hw = Math.round(hh * (0.5 + 0.6 * k2) * dying + Math.sin(f * 0.8 + s * 0.2) * 2);
        box(c, x0 + d.facing * s - (d.facing < 0 ? 8 : 0), GY - 52 - hw, 8, hw * 2, col);
      }
    }
  }
  // (the hellfire getting ready in his pointing hand: a flicker)
  void mad;
  // (the puddle opening under him: its glow behind him, the far half of its splash)
  if (st === 'sink') drawSinkBack(c, d.x, t, SINK_T);
  c.save();
  if (st === 'sink') { c.beginPath(); c.rect(d.x - 220, d.y - 420, 440, 420); c.clip(); c.translate(0, d.sink * 200); }
  c.translate(Math.round(d.x), Math.round(d.y));
  c.scale(d.facing, 1);
  drawPunk(c, d, f);
  c.restore();
  if (st === 'sink') drawSinkFront(c, d.x, t, f, SINK_T);
};

/** What he's saying, over his head (only while he's saying it). */
export const drawDemonSaid = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d?.said || d.fight === 'gone') return;
  saidOver(c, d.said.text, d.x, d.y - H - 70 + d.sink * 200, '#FCA5A5', 230);
};

const WALL_FIRE = [LAVA[1], LAVA[2], LAVA[3], LAVA[4], LAVA[5], LAVA[6], LAVA[7]];

/** The walls of fire across his pit's two ways out (the way in only once he's roused), while he's at it. */
export const drawFireWall = (c: Ctx, state: GameState) => {
  const d = demonOf(state), f = state.frame;
  if (!d) return;
  const top = Math.floor((state.camera.y - 40) / 6) * 6;
  for (const w of [d.back, d.lock]) {
    if (!w || w.x < -1e6) continue;
    const x = w.x + w.w / 2;
    if (x < state.camera.x - 100 || x > state.camera.x + CANVAS_WIDTH + 100) continue;
    hazeBands(c, x - 60, GY - 30, 120, 30, LAVA[4], 0, 0.16, 3);
    for (let i = 0; i < WALL_FIRE.length; i++) {
      const ww = 44 - i * 6;
      for (let y = top; y < GY; y += 6) {
        const wob = Math.round(Math.sin(f * 0.45 + y * 0.07 + i * 1.7) * (4 - i * 0.4));
        box(c, Math.round(x - ww / 2 + wob), y, ww, 6, WALL_FIRE[i]);
      }
    }
    for (let k = 0; k < 7; k++) {
      const ty = GY - ((f * 3 + k * 97) % Math.max(1, GY - top)), tx = Math.round(x + Math.sin(f * 0.3 + k) * 14);
      c.fillStyle = k % 2 ? LAVA[6] : LAVA[7]; c.beginPath(); c.moveTo(tx - 4, ty + 10); c.lineTo(tx, ty - 14); c.lineTo(tx + 4, ty + 10); c.fill();
    }
    for (let i = 0; i < 4; i++) box(c, Math.round(x - 30 + i * 16 + Math.sin(f * 0.6 + i) * 3), GY - 6 - ((f + i * 3) % 4), 10, 6, LAVA[5 + (i % 2)]);
  }
};

/** His bar (top band, clear of the HUD). */
export const drawDemonHud = (c: Ctx, state: GameState) => {
  const d = demonOf(state);
  if (!d || d.fight !== 'on' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1;
  box(c, band.x1, 18, w, 14, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, d.hp / HP), 10, d.flash > 0 ? '#FECACA' : '#DC2626');
  label(c, DEMON_NAME, band.mid, 44, '#FDBA74', 8);
};

registerM2Kind({
  kind: DEMON_KIND, stats: { w: W, h: H, hp: POOL, contact: 0, mass: MASS }, ai: (_ctx, e) => { e.vel.x = 0; e.vel.y = 0; return true; },
  // (drawn whole by drawDemon, behind; its box draws nothing, and no daze over it)
  draw: (_c, e) => { e.pauseTimer = 0; },
  head: { x: 10, y: -150, r: 18 }, gender: 'm', grab: 'none', midBoss: true, touch: demonTouch,
});
registerHurtLines(DEMON_KIND, HURT_BUMP, DEATH_BUMP);
registerHurtLines(GUITAR, HURT_GUITAR, DEATH_GUITAR);
registerHurtLines(CRUSH, HURT_CRUSH, DEATH_CRUSH);
registerDeathKind(CRUSH, 'flattened');
registerHurtLines(WAVE, HURT_WAVE, DEATH_WAVE);
registerHurtLines(RUSH, HURT_RUSH, DEATH_RUSH);
registerHurtLines(PILLAR, HURT_PILLAR, DEATH_PILLAR);
registerDeathKind(PILLAR, 'burnt');
registerHurtLines(BREATH, HURT_BREATH, DEATH_BREATH);
registerDeathKind(BREATH, 'burnt');
registerHurtLines(AIRBODY, HURT_AIRBODY, DEATH_AIRBODY);
registerHurtLines(FIRE_BOUNCE, HURT_BOUNCE_FIRE, DEATH_BOUNCE_FIRE);
registerDeathKind(FIRE_BOUNCE, 'burnt');
