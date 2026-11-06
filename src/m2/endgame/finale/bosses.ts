// THE KAIJU FINALE's bosses: SATAN and ZARBLAX (the widow), embiggened, side by side against him. The owner's:
// "satan and the widow will have simple attacks, jumping around shooting lasers or breathing fire. the fight is more
// about spectacle. they will have 'stagger' meters ... they are more vulnerable to a certain weapon based on what land
// you are demolishing ... filling the 'stagger' meter on one boss will stun them and have a Y+B prompt over their
// heads", and "they can stagger quite quickly if you use the right weapon".
//
// No health. Each has a STAGGER meter (0 to 100) filled by what hits them: the section's weakness weapon fast (about
// 5 to 8 seconds of decent use: FILL below), anything else a third as fast. Full: STUNNED (down on their backside,
// birdies round the head, the beatdown's buttons over them) for STUN_T; not grabbed by then, they're up again at
// half. The throw itself is throw.ts's.
//
// Where they go: ahead of him (one nearer, one further: spectacle in front of him, never behind for long), within the
// section, keeping clear of its throw target's gate; passed, they leap back over him. Between moves they walk; each
// boss's next move is its own clock (the two seldom line up: the owner liked two threats going off out of sync).
//   SATAN   LEAP (a crouch, up, down where he was: a slam and a shockwave along the ground both ways: jump it);
//           BREATH (an inhale, the smoke; fire down the ground in front of him: get behind him or clear, jump the
//           low end); FIREBALLS (three lobbed, their shadows on the ground first); CLAW (close in: a wind-up and a
//           swipe); RAIN (arms up: fire drops out of the sky, their shadows first)
//   WIDOW   HOP (a squat, up, down on her backside where he was); LASER (her eye glows, a line aimed at his chest:
//           duck); LOW LASER (bent over, a beam swept along the ground at his ankles: jump it); UFOS (she calls her
//           boys: little saucers over him dropping minions and plinking); BUTT (her cigarette flicked: it burns where it
//           lands a moment)
// Hits on him are small (he's resilient: no knockback, no flinch: the finale's hurt() in index.ts), each move a
// telegraph first. A boss being hit on and on for ~4 s (one attack spammed) leaps off somewhere else: never docile.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { endgameBoss, peekTag, bulkedNow } from '../../weapons/endgameDamage';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { speak, saidOver } from '../../adventure/section';
import { floorY } from './geo';
import { drawSatanBody, drawWidowBody, SATAN_H, WIDOW_H, type SatanPose, type WidowPose } from './bossArt';
import { puff, dustLine, debris } from './fx';
import type { SectionDef, Weak } from './sections';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
export type Who = 'satan' | 'widow';

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** What one counted hit puts in the meter (out of 100), by weapon, when it's the section's weakness; anything else a
 *  third of its number (WRONG). Counted hits are held to one each HIT_GATE frames per boss (a spray, a swarm of
 *  goblins, a three-spell storm count as a hit every gate), so the numbers are roughly "per landed hit" of each
 *  weapon's own pace: the aim is a meter full in about 5 s of decent use of the weakness, ~15 s of anything else
 *  (two holds of 5 s a land, so the stagger's quick: each half under 30 s). */
export const FILL: Record<string, number> = {
  SPELLBOOK: 10, STUNT_CAR: 13.5, FLINTLOCK: 30, SPAWNER: 4, CROSSBOW: 4, SOUVENIR: 9, MALLET: 8, SOUL_SUCKER: 4,
  GUN: 5.2, MELEE: 11,
};
export const WRONG = 1 / 3, HIT_GATE = 10;
/** Enraged: its tells this much of the usual. */
export const RAGE_TELL = 0.65;
/** How long a stun lasts (frames), and the meter after it wears off ungrabbed. */
export const STUN_T = 540, STUN_AFTER = 50;
/** His hurts from them (before the game's own cut: M2 takes 0.65 of everything; a tenth or so of his health a big one). */
const DMG = { slam: 6, wave: 4, breath: 3, fireball: 4, claw: 5, rain: 3, hop: 6, laser: 4, low: 4, bolt: 1.5, butt: 4, burn: 2 };
const GRAV = 0.36;

// ---------------------------------------------------------------------------------------------------------------

const BIG = 100000;
/** Cartoon Land: once both are down (dazed), they can be hit again: each landed hit's the finishers' to count
 *  (onKoHit). The first one down sits there out of it till then, as the grotto's two demons do. */
let koHittable = false;
export const setKoHittable = (on: boolean) => { koHittable = on; };
const KIND: Record<Who, string> = { satan: 'm2:fin_satan', widow: 'm2:fin_widow' };
for (const who of ['satan', 'widow'] as Who[]) {
  registerM2Kind({
    kind: KIND[who] as `m2:${string}`, stats: { w: 60, h: who === 'satan' ? SATAN_H : WIDOW_H, hp: BIG, contact: 0, mass: 2000, air: true },
    make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
    gender: who === 'satan' ? 'm' : 'f', humanoid: true, grab: 'none', midBoss: true, blood: who === 'satan' ? '#7F1D1D' : '#3FA34D',
    head: { x: 10, y: who === 'satan' ? -140 : -136, r: 18 },
    draw: () => {}, ai: () => true,
  });
  ownShare(KIND[who]);
  endgameBoss(KIND[who]);
  TOO_BIG_BY_KIND[KIND[who]] = ['TOO BIG TO GRAB. KNOCK HIM SILLY FIRST.', "SHE'S TOO BIG. STAGGER HER FIRST."];
}

/** 'away': thrown in the land's first half, sat out the second (the owner's "it cycles between two on one to one on
 *  one"): no moves, no shots, not drawn, not there to be hit, till the next land. */
/** 'dizzy': a land's opening, still seeing stars from the last land's throws (no moves, no hits either way) till it
 *  shakes it off; 'ko': Cartoon Land, out of health: collapsed, staying down. */
export type Mode = 'off' | 'walk' | 'tell' | 'do' | 'recover' | 'stunned' | 'held' | 'carried' | 'flying' | 'wreck' | 'leave' | 'away' | 'dizzy' | 'ko';
export interface Boss {
  who: Who; e: Enemy; moveSeen?: number;
  x: number; y: number; vx: number; vy: number; air: boolean; face: 1 | -1;
  meter: number; gate: number; flash: number; calloutAt: number;
  mode: Mode; move: string | null; last: string | null; t: number; T: number; next: number;
  /** Leap/hop target; the laser's aim (a point on its line, world). */
  tx: number; aimX: number; aimY: number;
  stunT: number;
  /** Hits counted in a row (each within a second of the last): the spam breaker. */
  streak: number; lastHitAt: number;
  said: string | null; tauntAt: number; hurtSaidAt: number;
  /** The thrown boss's spin, its arc (throw.ts); out of the wreck. */
  spin: number; wreckT: number;
  /** Enraged (the other one's been thrown: this land's second half): quicker tells, shorter gaps, an extra move. */
  rage: boolean;
  /** Health, 0..1 (only the mobile beatdown takes it: the owner's 1/8 a land at most), and the meter head start the
   *  last beatdown bought (its next fight's meter starts there). */
  hp: number; carry: number;
  /** Thrown in the land's first half: out of the wreck, it sits out the second ('away'). */
  sitOut: boolean;
  /** Dead (Cartoon Land's water tower): lying where it went down. */
  dead: boolean;
}

interface Shot { on: boolean; kind: 'fireball' | 'butt' | 'drop' | 'bolt' | 'wave' | 'burn'; x: number; y: number; vx: number; vy: number; t: number; life: number; dir: number }
interface Saucer { on: boolean; x: number; y: number; tx: number; t: number; fired: number; dropped: boolean }
export interface Bosses {
  satan: Boss; widow: Boss;
  shots: Shot[]; ufos: Saucer[];
  /** The breath's fire (Satan's do, world): on, its mouth, which way. */
  breath: { on: boolean; x: number; y: number; dir: number; t: number };
  /** A beam this frame (the widow's): from, to. */
  beam: { on: boolean; x0: number; y0: number; x1: number; y1: number; low: boolean };
}
export const newBosses = (): Bosses => ({
  satan: mk('satan'), widow: mk('widow'),
  shots: Array.from({ length: 40 }, () => ({ on: false, kind: 'fireball' as const, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 0, dir: 1 })),
  ufos: Array.from({ length: 4 }, () => ({ on: false, x: 0, y: 0, tx: 0, t: 0, fired: 0, dropped: false })),
  breath: { on: false, x: 0, y: 0, dir: 1, t: 0 }, beam: { on: false, x0: 0, y0: 0, x1: 0, y1: 0, low: false },
});
const mk = (who: Who): Boss => {
  const e = makeKindEnemy(KIND[who] as EnemyKind, 0, 0);
  e.seen = true; e.id = `fin-${who}`;
  return {
    who, e, moveSeen: e.hitByMove, x: 0, y: 0, vx: 0, vy: 0, air: false, face: -1, meter: 0, gate: 0, flash: 0, calloutAt: 0,
    mode: 'off', move: null, last: null, t: 0, T: 0, next: 0, tx: 0, aimX: 0, aimY: 0, stunT: 0, streak: 0, lastHitAt: -999,
    said: null, tauntAt: 400 + (who === 'widow' ? 260 : 0), hurtSaidAt: 0, spin: 0, wreckT: 0, rage: false, hp: 1, carry: 0, sitOut: false, dead: false,
  };
};
export const bossH = (b: Boss) => (b.who === 'satan' ? SATAN_H : WIDOW_H);
export const bossList = (bs: Bosses) => [bs.satan, bs.widow];
const dressed = (state: GameState) => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
let tok = 0;
/** A boss's bark: never over anybody (dropped if anybody's talking), over them only while said. */
export const bossSays = (state: GameState, b: Boss, pool: L.ByPants | string[]) => {
  if (b.said || isTalking()) return;
  const text = pickLine(Array.isArray(pool) ? pool : pool[dressed(state)]);
  const my = ++tok, bb = b;
  speak(b.who === 'satan' ? L.SATAN_VOICE : L.WIDOW_VOICE, text, s => { bb.said = s?.text ?? null; }, false);
  void my;
};

/** Put one at x, on the ground, walking (a section's start, a respawn). */
export const placeBoss = (b: Boss, x: number, face: 1 | -1) => {
  b.x = x; b.y = floorY(x); b.vx = 0; b.vy = 0; b.air = false; b.face = face; b.mode = 'walk'; b.move = null; b.t = 0; b.next = 0; b.flash = 0;
};

// ---------------------------------------------------------------------------------------------------------------
// The engine's enemy: where the hits land

const syncEnemy = (state: GameState, b: Boss) => {
  const e = b.e, live = b.mode !== 'off' && b.mode !== 'carried' && b.mode !== 'flying' && b.mode !== 'wreck' && b.mode !== 'leave' && b.mode !== 'away' && b.mode !== 'dizzy' && (b.mode !== 'ko' || (koHittable && !b.dead));
  const i = state.enemies.indexOf(e);
  if (!live) { if (i >= 0) state.enemies.splice(i, 1); return; }
  const h = bossH(b) - (b.mode === 'stunned' ? 32 : 0);
  e.pos.x = b.x - 30; e.pos.y = b.y - h; e.width = 60; e.height = h; e.vel.x = 0; e.vel.y = 0; e.facing = b.face;
  e.health = Math.max(e.health, 1);
  if (i < 0) state.enemies.push(e);
};

/** What hit it this frame, and what it puts in the meter. */
/** Cartoon Land: health off a hit, per meter point it'd have been worth (the stunt car takes a full one down in about
 *  20 s of decent use; anything else a third as fast). */
export const HP_K = 0.0024;
const takeHits = (ctx: FrameContext, b: Boss, weak: Weak, onWeak: (b: Boss) => void, onStun: (b: Boss) => void, hpMode = false, onKo?: (b: Boss, w: string) => void) => {
  const { state } = ctx, e = b.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== b.moveSeen;
  b.moveSeen = e.hitByMove;
  if (dealt <= 0 || b.mode === 'stunned') return;
  if (state.frame - b.gate < HIT_GATE) return;
  b.gate = state.frame;
  const tag = peekTag(state, e);
  let w: string, move: string | null = null;
  if (tag) { w = tag.w; move = tag.move; }
  else if (melee) { if (bulkedNow()) { w = 'SPELLBOOK'; move = 'bulk'; } else w = 'MELEE'; }
  else w = state.player.currentWeapon;
  // (dazed, both down: the finishers' count; a charge just bounces off them)
  if (b.mode === 'ko') {
    if (w === 'MELEE') { playSound('boing', 0.8, 0); const p = state.player; p.vel.x = -(Math.sign(b.x - (p.pos.x + p.width / 2)) || 1) * 6; return; }
    b.flash = 6; onKo?.(b, w); return;
  }
  const only = b.who === 'satan' ? weak.satan : weak.widow;
  const isWeak = w === weak.w && (!only || !move || only.includes(move));
  const add = (FILL[w] ?? 4) * (isWeak ? 1 : WRONG);
  if (hpMode) {
    b.hp = Math.max(0, b.hp - add * HP_K); b.flash = 6;
    playSound('gunhit', 0.5, b.who === 'satan' ? -6 : 2);
    if (b.hp <= 0) knockOut(state, b);
    else if (state.frame - b.hurtSaidAt > 240 && Math.random() < 0.3) { b.hurtSaidAt = state.frame; bossSays(state, b, b.who === 'satan' ? L.SATAN_HURT : L.WIDOW_HURT); }
    return;
  }
  b.meter = Math.min(100, b.meter + add);
  b.flash = 6;
  playSound('gunhit', 0.5, b.who === 'satan' ? -6 : 2);
  for (let k = 0; k < (isWeak ? 6 : 3); k++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 40, y: b.y - bossH(b) * (0.4 + Math.random() * 0.4) }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 20, color: isWeak ? '#FDE047' : '#F8FAFC', size: 2 + Math.random() * 2 } as never);
  if (isWeak) {
    onWeak(b);
    if (state.frame - b.calloutAt > 70) { b.calloutAt = state.frame; state.damageNumbers.push({ id: `fin-weak-${state.frame}-${b.who}`, text: 'WEAK!', pos: { x: b.x, y: b.y - bossH(b) - 16 }, vel: { x: 0, y: -2 }, life: 50, maxLife: 50, isCritical: true, isCallout: true, color: '#FDE047' } as never); }
  }
  // (the spam breaker: hit and hit for ~4 s straight, it's off somewhere else)
  b.streak = state.frame - b.lastHitAt < 70 ? b.streak + 1 : 1; b.lastHitAt = state.frame;
  if (b.meter >= 100) { b.meter = 100; stun(state, b); onStun(b); return; }
  if (state.frame - b.hurtSaidAt > 240 && Math.random() < 0.3) { b.hurtSaidAt = state.frame; bossSays(state, b, b.who === 'satan' ? L.SATAN_HURT : L.WIDOW_HURT); }
};

/** Cartoon Land: out of health: collapsed, dizzy, down for good (no longer a threat). */
const knockOut = (state: GameState, b: Boss) => {
  b.mode = 'ko'; b.move = null; b.vx = 0; b.air = false; b.y = floorY(b.x);
  playSound('bonk', 1, -12); playSound('slam', 0.8, -10); shakeScreen(state, 16, 4);
  state.damageNumbers.push({ id: `fin-ko-${state.frame}-${b.who}`, text: 'KNOCKED OUT!', pos: { x: b.x, y: b.y - bossH(b) - 20 }, vel: { x: 0, y: -1.5 }, life: 90, maxLife: 90, isCritical: true, isCallout: true, color: '#F97316' } as never);
  b.said = null;
};
const stun = (state: GameState, b: Boss) => {
  b.mode = 'stunned'; b.stunT = 0; b.move = null; b.vx = 0;
  playSound('bonk', 0.9, -8); playSound('twinkle', 0.7, 0); shakeScreen(state, 10, 3);
  state.damageNumbers.push({ id: `fin-stun-${state.frame}-${b.who}`, text: 'STAGGERED!', pos: { x: b.x, y: b.y - bossH(b) - 20 }, vel: { x: 0, y: -1.5 }, life: 80, maxLife: 80, isCritical: true, isCallout: true, color: '#F97316' } as never);
  b.said = null;
  setTimeout(() => bossSays(state, b, b.who === 'satan' ? L.SATAN_DAZED : L.WIDOW_DAZED), 300);
};

// ---------------------------------------------------------------------------------------------------------------
// Moving and the moves

export interface Arena {
  /** The section (null: AMERICA USA or the end: they just keep ahead). */
  sec: SectionDef | null;
  /** Where they're kept between (world). */
  a: number; b: number;
  /** One of them's tied up (Ben's): who. */
  held: Who | null;
  /** Nobody moves (a throw, a cutscene, the needle's fall). */
  frozen: boolean;
  /** Nobody attacks (AMERICA USA, the run's end, a section won). */
  calm: boolean;
  /** A stun doesn't wear off (unused now: kept for the switch). */
  holdStun?: boolean;
  /** Cartoon Land: no stagger; hits go straight to health (HP_K of what they'd have put in the meter), at none: KO. */
  hpMode?: boolean;
  /** Both down: a hit on either, with what weapon (melee: bounced off) */
  onKoHit?: (b: Boss, w: string) => void;
  /** Something heavy came down here (a landing): flatten what's under it. */
  crush: (x0: number, x1: number) => void;
  /** Him hurt (dmg, source, frames of breather after). */
  hurt: (dmg: number, src: string) => void;
  /** A minion in (the saucers' drops). */
  minion: (x: number) => void;
}

const SPAWN_TELL = 30;
const pBox = (state: GameState) => { const p = state.player, lo = p.isDucking || p.isSliding; return { x0: p.pos.x, x1: p.pos.x + p.width, y0: p.pos.y + (lo ? 28 : 0), y1: p.pos.y + p.height }; };
const hittable = (state: GameState) => { const p = state.player; return p.health > 0 && !p.inCutscene && !p.untouchable && p.invincibilityTimer <= 0; };
const inBox = (state: GameState, x0: number, x1: number, y0: number, y1: number) => {
  if (!hittable(state)) return false;
  const b = pBox(state), a = Math.min(x0, x1), z = Math.max(x0, x1);
  return b.x1 > a && b.x0 < z && b.y1 > y0 && b.y0 < y1;
};
const shot = (bs: Bosses, kind: Shot['kind'], x: number, y: number, vx: number, vy: number, life: number, dir = 1) => {
  const s = bs.shots.find(q => !q.on); if (!s) return;
  s.on = true; s.kind = kind; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.t = 0; s.life = life; s.dir = dir;
};
const TELL: Record<string, number> = { leap: 28, breath: 44, fireballs: 30, claw: 22, rain: 30, hop: 26, laser: 40, lowlaser: 32, ufos: 34, butt: 24 };
const DO: Record<string, number> = { leap: 400, breath: 72, fireballs: 20, claw: 14, rain: 80, hop: 400, laser: 56, lowlaser: 46, ufos: 20, butt: 16 };

const pickMove = (state: GameState, b: Boss, ar: Arena) => {
  const list: string[] = b.who === 'satan' ? (ar.sec?.satan ?? ['leap']) : (ar.sec?.widow ?? ['hop']);
  const px = state.player.pos.x + state.player.width / 2, d = Math.abs(px - b.x);
  // (enraged: a move more)
  const all = b.rage ? [...new Set([...list, ...(b.who === 'satan' ? ['leap', 'rain'] : ['hop', 'ufos'])])] : list;
  let opts = all.filter(m => m !== b.last);
  if (d > 150) opts = opts.filter(m => m !== 'claw');
  if (!opts.length) opts = all;
  return opts[Math.floor(Math.random() * opts.length)];
};

const startMove = (state: GameState, b: Boss, m: string) => {
  b.move = m; b.last = m; b.mode = 'tell'; b.t = 0; b.T = Math.round((TELL[m] ?? 30) * (b.rage ? RAGE_TELL : 1));
  const p = state.player, px = p.pos.x + p.width / 2;
  b.face = px >= b.x ? 1 : -1;
  if (m === 'laser') { b.aimX = px; b.aimY = floorY(px) - 44; }
  if (m === 'breath') playSound('snort', 0.6, -10);
  if (m === 'leap' || m === 'hop') playSound('bellow', 0.4, b.who === 'satan' ? -12 : 6);
  if (m === 'ufos') playSound('alienCharge', 0.5, 4);
};

/** Into the air at tx (a leap, a hop, the spam breaker's, leaving for the next section). */
const launch = (b: Boss, tx: number, frames: number) => {
  b.tx = tx; b.air = true; b.vx = (tx - b.x) / frames; b.vy = -GRAV * frames / 2;
  if (Math.abs(b.vx) > 0.2) b.face = b.vx > 0 ? 1 : -1;
};

const land = (state: GameState, bs: Bosses, b: Boss, ar: Arena) => {
  b.air = false; b.vy = 0; b.vx = 0; b.y = floorY(b.x);
  dustLine(b.x - 40, b.x + 40, b.y, 6, '#C8BCA8', 1.2);
  playSound('slam', 0.7, b.who === 'satan' ? -10 : -4); shakeScreen(state, b.who === 'satan' ? 10 : 7, b.who === 'satan' ? 3 : 2);
  if (ar.calm || b.mode === 'leave') return;
  if (b.move === 'leap') {
    if (inBox(state, b.x - 40, b.x + 40, b.y - 90, b.y + 4)) ar.hurt(DMG.slam, 'm2:fin_slam');
    for (const d of [-1, 1]) shot(bs, 'wave', b.x + d * 30, b.y, d * 6, 0, 48, d);
  }
  if (b.move === 'hop' && inBox(state, b.x - 42, b.x + 42, b.y - 70, b.y + 4)) ar.hurt(DMG.hop, 'm2:fin_hop');
};

const doMove = (ctx: FrameContext, bs: Bosses, b: Boss, ar: Arena) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2, m = b.move!;
  const t = b.t;
  const keep = (x: number) => Math.max(ar.a + 60, Math.min(ar.b - 60, x));
  switch (m) {
    case 'leap': if (t === 0) { launch(b, keep(px + (Math.random() - 0.5) * 80), 50); playSound('whoosh', 0.6, -8); } if (!b.air && t > 2) b.T = 0; break;
    case 'hop': if (t === 0) { launch(b, keep(px), 46); playSound('whoosh', 0.5, -2); } if (!b.air && t > 2) b.T = 0; break;
    case 'breath': {
      const mouthX = b.x + b.face * 26, mouthY = b.y - 128;
      bs.breath = { on: true, x: mouthX, y: mouthY, dir: b.face, t };
      if (t % 4 === 0) playSound('flame', 0.35, -6);
      // (the cone: from the mouth down to the ground 120 out, then low along it to 290)
      const dx = (px - mouthX) * b.face, top = pBox(state).y0, feet = p.pos.y + p.height, gy = floorY(px);
      if (dx > -10 && dx < 290) {
        const band = dx < 120 ? mouthY + (gy - mouthY) * (dx / 120) - 18 : gy - 26;
        if (feet > band && top < gy && inBox(state, px - 1, px + 1, band, gy + 2)) ar.hurt(DMG.breath, 'm2:fin_fire');
      }
      break;
    }
    case 'fireballs':
      if (t === 0) { for (const off of [-80, 0, 80]) { const tx = px + off; shot(bs, 'fireball', b.x + b.face * 20, b.y - 160, (tx - b.x) / 52, -GRAV * 26, 120); } playSound('ignite', 0.6, -6); }
      break;
    case 'claw':
      if (t === 2) { playSound('whoosh', 0.7, -4); if (inBox(state, b.x + b.face * 10, b.x + b.face * 100, b.y - 120, b.y)) ar.hurt(DMG.claw, 'm2:fin_claw'); }
      break;
    case 'rain':
      if (t % 9 === 0 && t < 72) { const x = px + (Math.random() - 0.5) * 300; shot(bs, 'drop', x, state.camera.y - 30, 0, 0, 200); }
      break;
    case 'laser': {
      // (her eye to the aim, and on past it: locked when it fires)
      const ex = b.x + b.face * 12, ey = b.y - 136, dx = b.aimX - ex, dy = b.aimY - ey, len = Math.hypot(dx, dy) || 1;
      const x1 = ex + (dx / len) * 900, y1 = ey + (dy / len) * 900;
      bs.beam = { on: true, x0: ex, y0: ey, x1, y1, low: false };
      if (t % 6 === 0) playSound('alienBeam', 0.3, 4);
      // (his box against the line where it crosses him)
      const k = (px - ex) / (x1 - ex);
      if (k > 0 && k < 1) { const ly = ey + (y1 - ey) * k; if (inBox(state, px - 2, px + 2, ly - 4, ly + 4)) ar.hurt(DMG.laser, 'm2:fin_laser'); }
      break;
    }
    case 'lowlaser': {
      const ex = b.x + b.face * 16, ey = b.y - 110, reach = 40 + (t / DO.lowlaser) * 360, x1 = ex + b.face * reach, y1 = floorY(x1) - 6;
      bs.beam = { on: true, x0: ex, y0: ey, x1, y1, low: true };
      if (t % 6 === 0) playSound('alienBeam', 0.3, -2);
      if (Math.abs(px - x1) < 16 && inBox(state, x1 - 16, x1 + 16, y1 - 12, y1 + 8)) ar.hurt(DMG.low, 'm2:fin_laser');
      if (t % 5 === 0) puff(x1, y1 + 4, 4, '#3A3436', 0, -0.5, 20);
      break;
    }
    case 'ufos':
      if (t === 0) for (let k = 0; k < 3; k++) { const u = bs.ufos.find(q => !q.on); if (!u) break; u.on = true; u.x = state.camera.x + (k === 1 ? -40 : W + 40); u.y = state.camera.y + 90 + k * 22; u.tx = px + (k - 1) * 110; u.t = -k * 20; u.fired = 0; u.dropped = false; }
      break;
    case 'butt':
      if (t === 0) { shot(bs, 'butt', b.x + b.face * 40, b.y - 112, (px - b.x) / 44, -GRAV * 22, 160); playSound('whoosh', 0.5, 6); }
      break;
  }
};

/** Each frame: both of them. */
export const updateBosses = (ctx: FrameContext, bs: Bosses, ar: Arena, weak: Weak, onWeak: (b: Boss) => void, onStun: (b: Boss) => void) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  bs.breath.on = false; bs.beam.on = false;
  const pair = bossList(bs);
  pair.forEach((b, i) => {
    if (b.flash > 0) b.flash--;
    syncEnemy(state, b);
    if (b.mode === 'off' || b.mode === 'carried' || b.mode === 'flying' || b.mode === 'away') return;
    if (b.mode === 'ko') { if (koHittable && !b.dead) takeHits(ctx, b, weak, onWeak, onStun, false, ar.onKoHit); return; }
    if (b.mode === 'dizzy') { b.t++; if (b.t > 120) { b.mode = 'walk'; b.next = state.frame + 30; playSound('snort', 0.5, b.who === 'satan' ? -10 : 6); } return; }
    if (b.mode !== 'wreck' && b.mode !== 'leave') takeHits(ctx, b, weak, onWeak, onStun, !!ar.hpMode);
    if (ar.frozen) return;
    // (in the air: a leap, a hop, leaving)
    if (b.air) {
      b.x += b.vx; b.y += b.vy; b.vy += GRAV;
      if (b.vy > 0 && b.y >= floorY(b.x)) { land(state, bs, b, ar); if (b.mode === 'leave') { b.mode = 'walk'; b.next = state.frame + 60; } }
      if (b.mode === 'do') b.t++;
      return;
    }
    if (b.mode === 'stunned') {
      b.stunT++;
      if (b.stunT % 50 === 0) playSound('twinkle', 0.35, 4);
      if (b.stunT > STUN_T && !ar.holdStun) { b.mode = 'walk'; b.meter = STUN_AFTER; b.next = state.frame + 40; }
      return;
    }
    if (b.mode === 'held') { b.face = (px >= b.x ? 1 : -1); return; }
    if (b.mode === 'wreck') {
      b.wreckT++;
      if (b.wreckT === 70) { bossSays(state, b, b.who === 'satan' ? L.SATAN_UP : L.WIDOW_UP); }
      return;
    }
    if (b.mode === 'leave') return;
    // ---- the spam breaker
    if (b.streak > 24 && state.frame - b.lastHitAt < 20 && b.mode === 'walk') {
      b.streak = 0; b.mode = 'do'; b.move = b.who === 'satan' ? 'leap' : 'hop'; b.t = 0; b.T = 400;
      launch(b, Math.max(ar.a + 60, Math.min(ar.b - 60, px + (px < b.x ? 360 : -360) * (Math.random() < 0.7 ? 1 : -1))), 46);
      return;
    }
    // ---- the moves
    if (b.mode === 'tell') { b.t++; b.vx = 0; if (b.t >= b.T) { b.mode = 'do'; b.t = 0; b.T = DO[b.move!] ?? 30; } return; }
    if (b.mode === 'do') { doMove(ctx, bs, b, ar); b.t++; if (!b.air && b.t >= b.T) { b.mode = 'recover'; b.t = 0; b.T = 24; } return; }
    if (b.mode === 'recover') { b.t++; if (b.t >= b.T) { b.mode = 'walk'; b.next = state.frame + (b.rage ? 28 + Math.floor(Math.random() * 30) : 60 + Math.floor(Math.random() * 60) + i * 25); } return; }
    // ---- walking: to their spot ahead of him; passed, back over him; their next move when it's time
    const ahead = (i === 0) === ((ar.sec?.half ?? 1) === 1) ? 230 : 410;
    const home = Math.max(ar.a + 80, Math.min(ar.b - 80, px + ahead));
    if (px > b.x + 60 && px < ar.b - 120 && !ar.calm) { b.mode = 'do'; b.move = b.who === 'satan' ? 'leap' : 'hop'; b.t = 0; b.T = 400; launch(b, home, 50); return; }
    const d = home - b.x;
    b.vx = Math.abs(d) > 24 ? Math.sign(d) * (b.who === 'satan' ? 1.5 : 1.3) * (b.rage ? 1.35 : 1) : 0;
    if (Math.abs(d) > 260) b.vx *= 2.2;
    b.x += b.vx; b.y = floorY(b.x);
    b.face = px >= b.x ? 1 : -1;
    if (Math.abs(b.vx) > 0.1 && state.frame % 22 === i * 11) { puff(b.x, b.y, 6); playSound('thud', 0.3, b.who === 'satan' ? -12 : -6); }
    if (ar.calm || ar.held === b.who) return;
    if (state.frame >= b.next) startMove(state, b, pickMove(state, b, ar));
    if (state.frame > b.tauntAt) { b.tauntAt = state.frame + 600 + Math.floor(Math.random() * 400); bossSays(state, b, b.who === 'satan' ? L.SATAN_TAUNT : L.WIDOW_TAUNT); }
  });
  updateShots(ctx, bs, ar);
};

const updateShots = (ctx: FrameContext, bs: Bosses, ar: Arena) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  for (const s of bs.shots) {
    if (!s.on) continue;
    if (ar.frozen) continue;
    s.t++;
    if (s.t > s.life) { s.on = false; continue; }
    switch (s.kind) {
      case 'wave': {
        s.x += s.vx; const gy = floorY(s.x);
        if (inBox(state, s.x - 10, s.x + 10, gy - 16, gy + 2)) ar.hurt(DMG.wave, 'm2:fin_slam');
        if (s.t % 4 === 0) puff(s.x, gy, 4, '#C8BCA8', 0, -0.6, 24);
        break;
      }
      case 'fireball': case 'butt': {
        s.x += s.vx; s.y += s.vy; s.vy += GRAV;
        const gy = floorY(s.x);
        if (s.y >= gy) {
          if (s.kind === 'fireball') { if (inBox(state, s.x - 24, s.x + 24, gy - 40, gy + 4)) ar.hurt(DMG.fireball, 'm2:fin_fire'); debris(s.x, gy - 4, 6, ['#F97316', '#FDE047', '#7F1D1D'], 2, 3); puff(s.x, gy - 6, 12, '#5A4A48'); playSound('boom', 0.4, 0); s.on = false; }
          else { s.kind = 'burn'; s.y = gy; s.t = 0; s.life = 100; playSound('ignite', 0.4, 4); }
        } else if (inBox(state, s.x - 8, s.x + 8, s.y - 8, s.y + 8)) { ar.hurt(s.kind === 'butt' ? DMG.butt : DMG.fireball, s.kind === 'butt' ? 'm2:fin_butt' : 'm2:fin_fire'); if (s.kind === 'fireball') s.on = false; }
        break;
      }
      case 'burn': if (inBox(state, s.x - 18, s.x + 18, s.y - 14, s.y + 2)) ar.hurt(DMG.burn, 'm2:fin_butt'); break;
      case 'drop': {
        // (a shadow first: it lands DROP_T after it's called)
        const gy = floorY(s.x), land = 44;
        s.y = state.camera.y - 30 + (gy + 30 - state.camera.y) * Math.min(1, (s.t / land) ** 2);
        if (s.t >= land) { if (inBox(state, s.x - 16, s.x + 16, gy - 50, gy + 2)) ar.hurt(DMG.rain, 'm2:fin_fire'); puff(s.x, gy - 4, 9, '#5A4A48'); debris(s.x, gy - 2, 4, ['#F97316', '#FDE047'], 2, 2); playSound('boom', 0.25, 6); s.on = false; }
        break;
      }
      case 'bolt': {
        s.x += s.vx; s.y += s.vy;
        if (inBox(state, s.x - 4, s.x + 4, s.y - 4, s.y + 4)) { ar.hurt(DMG.bolt, 'm2:fin_ufo'); s.on = false; }
        if (s.y > floorY(s.x)) s.on = false;
        break;
      }
    }
  }
  for (const u of bs.ufos) {
    if (!u.on) continue;
    if (ar.frozen) continue;
    u.t++;
    if (u.t < 0) continue;
    if (u.t < 200) { u.x += (u.tx - u.x) * 0.04; u.tx += (px - u.tx) * 0.01; }
    else { u.y -= 3; u.x += 2; if (u.y < state.camera.y - 60) u.on = false; }
    if (u.t === 80 && !u.dropped) { u.dropped = true; ar.minion(u.x); playSound('alienCharge', 0.3, 10); }
    if (u.t > 60 && u.t < 190 && u.t % 45 === 0) { const dx = px - u.x, dy = p.pos.y + 30 - u.y, l = Math.hypot(dx, dy) || 1; shot(bs, 'bolt', u.x, u.y + 6, (dx / l) * 5, (dy / l) * 5, 120); playSound('raygun', 0.25, 12); }
  }
};

/** Everything of theirs in the air gone (a throw, a cutscene, a respawn). */
export const clearShots = (bs: Bosses) => { for (const s of bs.shots) s.on = false; for (const u of bs.ufos) u.on = false; bs.breath.on = false; bs.beam.on = false; };

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const satanPose = (b: Boss, f: number): SatanPose => {
  if (b.mode === 'stunned' || b.mode === 'dizzy' || b.mode === 'ko') return 'dazed';
  if (b.mode === 'held') return 'held';
  if (b.mode === 'flying' || b.mode === 'carried') return 'thrown';
  if (b.air) return 'air';
  if (b.mode === 'tell') return b.move === 'leap' ? 'crouch' : b.move === 'breath' ? 'inhale' : b.move === 'fireballs' ? 'lob' : b.move === 'claw' ? 'clawTell' : b.move === 'rain' ? 'rain' : 'idle';
  if (b.mode === 'do') return b.move === 'breath' ? 'breath' : b.move === 'claw' ? 'claw' : b.move === 'rain' ? 'rain' : b.move === 'fireballs' ? 'lob' : 'idle';
  if (b.mode === 'recover' && b.move === 'leap') return 'land';
  if (b.said) return 'talk';
  return Math.abs(b.vx) > 0.1 ? 'walk' : 'idle';
  void f;
};
const widowPose = (b: Boss): WidowPose => {
  if (b.mode === 'stunned' || b.mode === 'dizzy' || b.mode === 'ko') return 'dazed';
  if (b.mode === 'held') return 'held';
  if (b.mode === 'flying' || b.mode === 'carried') return 'thrown';
  if (b.air) return 'air';
  if (b.mode === 'tell') return b.move === 'hop' ? 'squat' : b.move === 'laser' ? 'eye' : b.move === 'lowlaser' ? 'lowlaser' : b.move === 'ufos' ? 'call' : b.move === 'butt' ? 'flick' : 'idle';
  if (b.mode === 'do') return b.move === 'laser' ? 'laser' : b.move === 'lowlaser' ? 'lowlaser' : b.move === 'ufos' ? 'call' : b.move === 'butt' ? 'flick' : 'idle';
  if (b.mode === 'recover' && b.move === 'hop') return 'squat';
  if (b.said) return 'talk';
  return Math.abs(b.vx) > 0.1 ? 'walk' : 'idle';
};
/** One of them, where they are (or wherever `at` says: carried, thrown). */
export const drawBoss = (c: Ctx, state: GameState, b: Boss, at?: { x: number; y: number; ang: number }) => {
  if (b.mode === 'off' || b.mode === 'away') return;
  const f = state.frame, talk = !!b.said;
  // (enraged: a red heat off them, stepped rings, pulsing (no glow thrown, no blur))
  if (b.rage && !at && b.mode !== 'wreck') {
    const k = 0.5 + 0.5 * Math.sin(f * 0.25), h = bossH(b);
    for (const [r, a] of [[1, 0.1], [0.8, 0.14], [0.6, 0.18]] as const) { c.globalAlpha = a * (0.6 + 0.4 * k); c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(Math.round(b.x), Math.round(b.y - h / 2), 50 * r + 4 * k, h * 0.58 * r, 0, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
  c.save();
  if (at) { c.translate(Math.round(at.x), Math.round(at.y)); c.rotate(at.ang); c.translate(0, bossH(b) / 2); }
  else c.translate(Math.round(b.x), Math.round(b.y));
  c.scale(b.face, 1);
  if (b.mode === 'wreck' && b.wreckT < 70) { c.restore(); return; }
  if (b.who === 'satan') drawSatanBody(c, at ? 'thrown' : satanPose(b, f), f, talk, b.flash);
  else drawWidowBody(c, at ? 'thrown' : widowPose(b), f, talk, b.flash);
  c.restore();
};
export const drawSaid = (c: Ctx, b: Boss) => { if (b.said && b.mode !== 'off') saidOver(c, b.said, b.x, b.y - bossH(b) - 18, b.who === 'satan' ? '#FCA5A5' : '#F9A8D4'); };

/** Their fire, beams, shots and saucers (world space, over the landmarks). */
export const drawAttacks = (c: Ctx, state: GameState, bs: Bosses) => {
  const f = state.frame;
  // (tells: the laser's thin aim line; a leap's or a hop's shadow where it'll come down)
  for (const b of bossList(bs)) {
    if (b.mode === 'tell' && b.move === 'laser') { c.globalAlpha = 0.5 + 0.3 * Math.sin(f * 0.6); c.strokeStyle = '#FCA5A5'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x + b.face * 12, b.y - 136); c.lineTo(b.aimX + (b.aimX - b.x) * 2, b.aimY + (b.aimY - (b.y - 136)) * 2); c.stroke(); c.globalAlpha = 1; }
    if (b.air && (b.mode === 'do')) { const gy = floorY(b.tx); c.fillStyle = 'rgba(0, 0, 0, 0.35)'; c.beginPath(); c.ellipse(b.tx, gy, 36, 6, 0, 0, Math.PI * 2); c.fill(); }
  }
  const br = bs.breath;
  if (br.on) {
    // (the fire: stepped tongues down the cone, dimmed oranges, flickering)
    for (let k = 0; k < 26; k++) {
      const dx = 10 + k * 11, gy = floorY(br.x + br.dir * dx), top = dx < 120 ? br.y + (gy - br.y) * (dx / 120) - 18 : gy - 26 + Math.sin(f * 0.5 + k) * 4;
      const x = br.x + br.dir * dx, h = Math.max(10, (gy - top) * (dx < 120 ? 0.45 : 1)), y = dx < 120 ? top : gy - h;
      c.fillStyle = '#9A2A10'; c.fillRect(Math.round(x - 7), Math.round(y), 14, Math.round(h));
      c.fillStyle = '#D0541C'; c.fillRect(Math.round(x - 5), Math.round(y + h * 0.15), 10, Math.round(h * 0.7));
      c.fillStyle = '#E8A040'; c.fillRect(Math.round(x - 2), Math.round(y + h * 0.35), 4, Math.round(h * 0.35));
    }
  }
  const bm = bs.beam;
  if (bm.on) {
    for (const [col, w] of [['#7F1D1D', 7], ['#EF4444', 4], ['#FECACA', 1.5]] as [string, number][]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(bm.x0, bm.y0); c.lineTo(bm.x1, bm.y1); c.stroke(); }
  }
  for (const s of bs.shots) {
    if (!s.on) continue;
    const x = Math.round(s.x), y = Math.round(s.y);
    if (s.kind === 'fireball') { c.fillStyle = '#7F1D1D'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F97316'; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x - 1, y - 1, 3, 0, Math.PI * 2); c.fill(); const gy = floorY(s.x); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 10, gy - 2, 20, 3); }
    if (s.kind === 'butt') { c.save(); c.translate(x, y); c.rotate(s.t * 0.3); c.fillStyle = '#0B0A10'; c.fillRect(-9, -3, 18, 6); c.fillStyle = '#F8F4EC'; c.fillRect(-8, -2, 12, 4); c.fillStyle = '#E8A040'; c.fillRect(4, -2, 4, 4); c.fillStyle = '#F4467C'; c.fillRect(-8, -2, 3, 4); c.restore(); }
    if (s.kind === 'burn') { for (let k = 0; k < 4; k++) { const h = 6 + ((k * 5 + (f >> 2)) % 4) * 3; c.fillStyle = '#9A3A1A'; c.fillRect(x - 16 + k * 9, y - h, 6, h); c.fillStyle = '#D8A050'; c.fillRect(x - 15 + k * 9, y - h * 0.5, 3, h * 0.5); } }
    if (s.kind === 'drop') { const gy = floorY(s.x), k = Math.min(1, s.t / 44); c.fillStyle = `rgba(0,0,0,${(0.15 + k * 0.3).toFixed(2)})`; c.beginPath(); c.ellipse(x, gy, 8 + k * 10, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7F1D1D'; c.fillRect(x - 5, y - 10, 10, 14); c.fillStyle = '#F97316'; c.fillRect(x - 3, y - 6, 6, 10); c.fillStyle = '#FDE047'; c.fillRect(x - 1, y, 3, 4); }
    if (s.kind === 'bolt') { c.fillStyle = '#86EFAC'; c.fillRect(x - 2, y - 2, 4, 4); c.fillStyle = '#F0FDF4'; c.fillRect(x - 1, y - 1, 2, 2); }
    if (s.kind === 'wave') { const gy = floorY(s.x); c.fillStyle = '#8A7A64'; c.fillRect(x - 8, gy - 12, 16, 12); c.fillStyle = '#B8A88E'; c.fillRect(x - 6, gy - 14, 12, 4); c.fillStyle = '#0B0A10'; c.fillRect(x - 8, gy - 13, 16, 1); }
  }
  for (const u of bs.ufos) {
    if (!u.on || u.t < 0) continue;
    const x = Math.round(u.x), y = Math.round(u.y);
    c.fillStyle = '#0B0A10'; c.beginPath(); c.ellipse(x, y, 17, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9CA3AF'; c.beginPath(); c.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C4B5FD'; c.beginPath(); c.ellipse(x, y - 4, 7, 5, 0, Math.PI, 0); c.fill();
    for (let k = 0; k < 5; k++) { c.fillStyle = (k + (f >> 3)) % 3 ? '#F472B6' : '#FFFFFF'; c.fillRect(x - 12 + k * 6, y + 1, 2, 1); }
    if (u.t > 60 && u.t < 100) { c.globalAlpha = 0.3; c.fillStyle = '#F9A8D4'; c.beginPath(); c.moveTo(x - 6, y + 4); c.lineTo(x + 6, y + 4); c.lineTo(x + 14, floorY(x)); c.lineTo(x - 14, floorY(x)); c.closePath(); c.fill(); c.globalAlpha = 1; }
  }
};
export const SPAWN_TELL_FRAMES = SPAWN_TELL;

/** The one still standing, the other one thrown: enraged for the rest of the land (a roar, a red flash, its line). */
export const enrage = (state: GameState, b: Boss) => {
  if (b.rage) return;
  b.rage = true; b.flash = 10; b.next = Math.min(b.next, state.frame + 40);
  playSound('roar', 0.9, b.who === 'satan' ? -10 : 6); playSound('bellow', 0.6, -6); shakeScreen(state, 18, 3);
  state.damageNumbers.push({ id: `fin-rage-${state.frame}-${b.who}`, text: 'ENRAGED!', pos: { x: b.x, y: b.y - bossH(b) - 24 }, vel: { x: 0, y: -1.2 }, life: 90, maxLife: 90, isCritical: true, isCallout: true, color: '#EF4444' } as never);
  for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 60, y: b.y - Math.random() * bossH(b) }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: k % 2 ? '#EF4444' : '#F97316', size: 3 } as never);
  b.said = null;
  setTimeout(() => bossSays(state, b, b.who === 'satan' ? L.SATAN_RAGE : L.WIDOW_RAGE), 350);
};
