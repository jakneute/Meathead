// THE SUMMIT: ZORZARBLAX, Zorblax and Zarblax's kid (level 1's boss). A ROUGH DRAFT: the owner gives the real
// mechanics and the weakness later. The owner's: "heavily erratic and unpredictable"; 999 HP like the rematches.
// Otherwise the standing boss rules: the 75-frame breather after a hit; the ray gun and his moves in full, every special
// 35% (the owner's rule for every water park boss, 2026-11-05: "none are a major weakness but they are generally better
// than the ray gun. the 35 percent damage thingy should balance it"; all die the same); no more than about five seconds
// of one attack (the spam breaker: he glitches away).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) Up the stairs onto the summit: he kicks the door in. The kid's
//               sat at the slide's mouth at the far end, legs over the edge, looking at the view, his back to him; turns
//               round (the gross-up); his say, Meathead's, his again; on. A retry (dead, back up the Hillary Step's stairs):
//               a beat for the kid to turn round and say so, then on.
//   THE KID     Never the same twice running, and never on a beat you can count: a pause of his own length between
//               (shuffling about), and now and then a spasm (a twitch, a squeal, all three arms going) that's nothing at
//               all. Every attack has its tell:
//     LUNGE     crouches, all three eyes swivel onto him (the tell), and leaps: an arc of its own height every time,
//               coming down where he is; landing on him hurts, and sometimes the landing throws a crack along the floor
//               both ways (jump it).
//     RAY       one of his three arms comes up glowing (the tell; which one says what's coming): the long gun arm, one
//               big fast bolt right at him; the far arm, three in a spread; the little chest arm, five slow ones in a
//               wild fan.
//     TANTRUM   stamps his feet, fists up, screaming (the tell): fake snow off the summit's peak, five ice balls lobbed
//               all over (one at him).
//     BLINK     the whole of him glitches (the tell: he jitters, flickers) and he's gone, back somewhere else on the
//               summit (never on top of him), and half the time straight into a lunge.
//     FLAIL     close up to him a while: all three arms windmilling (the tell's their wind-up). Don't hug the kid.
//
// His standard death (no weakness yet): he staggers, all the arms going, his last line; trips over his short leg and
// goes over backward, flat on his belly into the slide's mouth. Then THE DESCENT (descent.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BULLET_DAMAGE } from '../../../m1/constants';
import { bossMelee } from '../../upgrades/bossMelee';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { SUMMIT } from './geo';
import { fire, fireBolt, byPants, clearShots } from './kinds';
import { drawKid, kidPalm, KID_W, KID_H, type KidPose } from './kidArt';
import { drawKidGross, drawKidGrossBack, warmKidGross } from './kidGross';
import { cheapShotGate, cheapShotStunned, endCheapStun, registerClearThreats, crushGroups, crushLines, isCrushed } from '../../upgrades/cheapShot';
import { CRUSHED } from '../../upgrades/crushedLines';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const KID_HP = 999;
const BIG = 100000, SHARE = 0.35;
const G = 0.55;
/** Tells (frames), at full health; a third left, they're quicker (LOW_K). */
const TELL = { lunge: 32, ray: 36, tantrum: 28, blink: 24, flail: 22 };
const LOW_K = 0.8;
/** Between attacks: a pause of his own, anywhere in here (frames). */
const PAUSE = [18, 72];
/** A spasm instead of a pause, now and then (nothing comes of it). */
const SPASM = 0.28, SPASM_T = 24;
const DMG = { slam: 20, crack: 12, big: 16, spread: 12, fan: 10, snow: 12, flail: 14, touch: 10 };
/** Close to him this long (frames): the flail's on the cards. */
const HUG = 50, HUG_R = 130;
const ARENA_L = SUMMIT.L + 40, ARENA_R = SUMMIT.R - 40;
const GY = SUMMIT.y;

// ---------------------------------------------------------------------------------------------------------------

type Move = 'lunge' | 'ray' | 'tantrum' | 'blink' | 'flail';
type Act = 'pause' | 'spasm' | 'tell' | 'do' | 'gone' | 'appear' | 'recover';
type Intro = 'kick' | 'walk' | 'view' | 'turn' | 'gross' | 'talk' | 'retry';
export interface Fight {
  mode: 'intro' | 'on' | 'dying' | 'dead';
  e: Enemy;
  hp: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vx: number; vy: number; face: 1 | -1;
  act: Act; actT: number; move: Move | null; last: Move | null; arm: 0 | 1 | 2; T: number; shots: number;
  hug: number; total: number;
  intro: Intro; introT: number; skipT: number; said: string | null; talkStep: number;
  tauntAt: number; lowSaid: boolean;
  death: { t: number; step: 'stagger' | 'line' | 'fall' | 'flop' | 'done' } | null;
  /** The door (kicked in): 0 up, 1 down flat. */
  door: number;
}

const KID_KIND = 'm2:wp_kidboss' as const;
registerM2Kind({
  kind: KID_KIND, stats: { w: KID_W, h: KID_H, hp: BIG, contact: 0, mass: 400, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#3FA34D',
  head: { x: 30, y: -150, r: 22 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[KID_KIND] = L.GRAB_KID;
// (every special's 35% taken here, in the fight: not cut again as a sub-boss's)
ownShare(KID_KIND);
setSickHurl(KID_KIND);
// (the hand armor's cheap shot (upgrades/cheapShot.ts): after it, his hurt and taunt lines from the crushed-nuts pool;
// its free window, the moment the stun starts: every bolt, ice ball and crack of his in the air gone in a puff)
crushGroups('kid', { hurt: [L.KID_HURT], taunt: [L.KID_TAUNT, L.KID_LOW] });
registerClearThreats('kid', state => {
  const f = live;
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: (f?.x ?? SUMMIT.L) + (Math.random() - 0.5) * 300, y: GY - Math.random() * 200 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 26, color: i % 2 ? '#7CFF3A' : '#E8F0FA', size: 3 + Math.random() * 3 });
  clearShots(state);
  playSound('rayFizzle', 0.6, -6);
});

let live: Fight | null = null;
let token = 0;
export const resetFight = () => { live = null; token++; };

const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const lowK = (f: Fight) => (f.hp < KID_HP / 3 ? LOW_K : 1);
const kidSays = (f: Fight, text: string, after = true, onDone?: () => void) => {
  const tok = token;
  speak(L.KID_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, after, () => { if (tok === token) onDone?.(); });
};
/** A bark (dropped if anybody's talking). */
const bark = (state: GameState, f: Fight, lines: L.ByPants) => {
  if (f.said) return;
  const text = pick(byPants(state, lines)), tok = token;
  say(text, voice(L.KID_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

export const startFight = (state: GameState): Fight => {
  token++;
  const e = makeKindEnemy(KID_KIND as EnemyKind, SUMMIT.R - 90, GY);
  e.seen = true;
  const f: Fight = {
    mode: 'intro', e, hp: KID_HP, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(),
    x: SUMMIT.R - 70, y: GY, vx: 0, vy: 0, face: 1, act: 'pause', actT: 0, move: null, last: null, arm: 0, T: 40, shots: 0,
    hug: 0, total: 0, intro: 'kick', introT: 0, skipT: 0, said: null, talkStep: 0, tauntAt: 600, lowSaid: false, death: null, door: 0,
  };
  live = f;
  warmKidGross();
  state.player.inCutscene = true;
  // (a retry: the kid's already up and about, turned round; a beat for it)
  if (bossIntroSeen(state, 'zorzarblax')) { f.intro = 'retry'; f.x = SUMMIT.R - 200; f.face = -1; f.door = 1; }
  return f;
};

const beginFight = (state: GameState, f: Fight) => {
  token++; markBossIntroSeen(state, 'zorzarblax');
  f.said = null; state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  f.mode = 'on'; f.act = 'pause'; f.actT = 0; f.T = 60; f.door = 1;
  if (f.intro !== 'retry') { f.x = SUMMIT.R - 200; f.face = -1; }
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro

const updateIntro = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  const skippable = f.intro !== 'retry';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; p.pos.x = SUMMIT.L + 140 - p.width / 2; p.facing = 1; beginFight(state, f); return hands(); }
  const t = f.introT;
  switch (f.intro) {
    case 'kick':
      // (the door kicked in: his boot, the door down flat inward)
      p.facing = 1;
      if (t === 6) p.kickPose = 22;
      if (t === 14) { f.door = 0.01; playSound('crash', 1, -6); playSound('slam', 0.9, -8); shakeScreen(state, 12, 5); }
      if (f.door > 0) f.door = Math.min(1, f.door + 0.12);
      if (t > 34) { f.intro = 'walk'; f.introT = 0; }
      break;
    case 'walk':
      // (in a few steps)
      p.facing = 1; p.vel.x = 2.2;
      if (p.pos.x + p.width / 2 > SUMMIT.L + 140) { p.vel.x = 0; f.intro = 'view'; f.introT = 0; }
      break;
    case 'view':
      // (the kid, his back to him, sat on the slide's mouth looking at the view; a beat)
      if (t === 20) playSound('beep', 0.4, -10);
      if (t > 70) { f.intro = 'turn'; f.introT = 0; playSound('snort', 0.6, -6); }
      break;
    case 'turn':
      if (t === 10) { f.face = -1; f.x = SUMMIT.R - 120; }
      if (t > 26) { f.intro = 'gross'; f.introT = 0; playSound('roar', 0.6, 4); shakeScreen(state, 8, 4); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; kidSays(f, pick(byPants(state, L.KID_INTRO)), true, () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_INTRO)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; kidSays(f, pick(byPants(state, L.KID_INTRO2)), true, () => { f.talkStep = 6; }); }
      if (f.talkStep === 6) beginFight(state, f);
      // (and a safety: never stuck here)
      if (t > 1500) beginFight(state, f);
      break;
    case 'retry':
      // (back up the stairs: the kid turns round, says so, and it's on)
      if (t === 1) bark(state, f, L.KID_RETRY);
      if (t > 70) beginFight(state, f);
      break;
  }
  return hands();
};
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });

// ---------------------------------------------------------------------------------------------------------------
// The fight

const choose = (state: GameState, f: Fight): Move => {
  const near = Math.abs(pmid(state).x - f.x) < HUG_R;
  const pool: Move[] = ['lunge', 'ray', 'tantrum', 'blink', 'ray', 'lunge'];
  if (f.hug > HUG && near) return 'flail';
  const ok = pool.filter(m => m !== f.last);
  return ok[Math.floor(Math.random() * ok.length)];
};
const setAct = (f: Fight, a: Act, T: number) => { f.act = a; f.actT = 0; f.T = Math.max(1, Math.round(T)); };
const startMove = (state: GameState, f: Fight, m: Move, quick = false) => {
  f.move = m; f.last = m; f.shots = 0;
  // (nutless: now and then he squeaks his rage going into one)
  if (isCrushed(f.e) && Math.random() < 0.25) bark(state, f, CRUSHED.kid.attack as unknown as L.ByPants);
  f.arm = (Math.floor(Math.random() * 3)) as 0 | 1 | 2;
  f.face = pmid(state).x < f.x ? -1 : 1;
  setAct(f, 'tell', TELL[m] * lowK(f) * (quick ? 0.6 : 1));
  if (m === 'lunge') playSound('beep', 0.5, 10);
  if (m === 'ray') playSound('alienCharge', 0.6, 0);
  if (m === 'tantrum') playSound('roar', 0.5, 6);
  if (m === 'blink') playSound('rayFizzle', 0.6, -8);
};

const updateOn = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, pl = state.player, p = pmid(state);
  // (the cheap shot: up for it on the floor, out in the open (not blinked off, not mid-lunge); frozen in its cutscene,
  // then stunned: planted, no attacks, taking hits)
  const cs = cheapShotGate(state, f.e, 'kid', f.y >= GY - 0.5 && f.act !== 'gone' && f.act !== 'appear' && !(f.act === 'tell' && f.move === 'blink'));
  if (cs === 'frozen') return;
  if (cs === 'stunned') {
    if (f.iframes > 0) f.iframes--;
    if (f.flash > 0) f.flash--;
    f.vx = 0; f.vy = 0; f.y = GY; f.act = 'recover'; f.actT = 0; f.T = 20; f.move = null; f.hug = 0;
    const box = kidBox(f), e = f.e;
    e.pos.x = box.x; e.pos.y = box.y; e.width = box.w; e.height = box.h; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
    if (!state.enemies.includes(e)) state.enemies.push(e);
    takeHits(ctx, f);
    return;
  }
  f.total++; f.actT++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  const dx = p.x - f.x;
  f.hug = Math.abs(dx) < HUG_R ? f.hug + 1 : Math.max(0, f.hug - 2);
  // (the taunts, now and then)
  if (f.total > f.tauntAt && !f.said) { f.tauntAt = f.total + 620 + Math.floor(Math.random() * 400); bark(state, f, crushLines(f.e, L.KID_TAUNT)); }
  if (!f.lowSaid && f.hp < KID_HP / 3) { f.lowSaid = true; bark(state, f, crushLines(f.e, L.KID_LOW)); }
  // (gravity, when he's up off the floor)
  const air = f.y < GY - 0.5 || f.vy < 0;
  switch (f.act) {
    case 'pause': {
      // (shuffling about: toward him or away, his own mind)
      const want = Math.abs(dx) > 260 ? Math.sign(dx) : Math.abs(dx) < 120 ? -Math.sign(dx) : 0;
      f.vx += ((want * 1.6) - f.vx) * 0.1;
      if (Math.abs(f.vx) > 0.3) f.face = f.vx > 0 ? 1 : -1;
      if (f.actT >= f.T) {
        if (Math.random() < SPASM && f.last !== null) { setAct(f, 'spasm', SPASM_T); playSound('beep', 0.4, 16); }
        else startMove(state, f, choose(state, f));
      }
      break;
    }
    case 'spasm':
      f.vx *= 0.8;
      if (f.actT >= f.T) startMove(state, f, choose(state, f));
      break;
    case 'tell':
      f.vx *= 0.75;
      if (f.move !== 'lunge') f.face = dx < 0 ? -1 : 1;
      if (f.actT >= f.T) doMove(ctx, f);
      break;
    case 'do':
      runMove(ctx, f, dx);
      break;
    case 'gone':
      if (f.actT >= f.T) {
        // (back somewhere else on the summit: never on top of him)
        let x = f.x;
        for (let k = 0; k < 12; k++) { x = ARENA_L + 40 + Math.random() * (ARENA_R - ARENA_L - 80); if (Math.abs(x - p.x) > 220) break; }
        f.x = x; f.y = GY; f.vx = 0; f.vy = 0; f.face = p.x < f.x ? -1 : 1;
        setAct(f, 'appear', 14); playSound('rayFizzle', 0.7, 8);
      }
      break;
    case 'appear':
      if (f.actT >= f.T) { if (Math.random() < 0.5) startMove(state, f, 'lunge', true); else setAct(f, 'pause', rand(PAUSE) * lowK(f)); }
      break;
    case 'recover':
      f.vx *= 0.85;
      if (f.actT >= f.T) setAct(f, 'pause', rand(PAUSE) * lowK(f));
      break;
  }
  // (moving him: the floor under him, the arena's ends)
  if (f.act !== 'gone') {
    if (air || f.vy !== 0) { f.vy += G; f.y += f.vy; }
    f.x += f.vx;
    if (f.y >= GY) { if (f.vy > 4 && f.move === 'lunge') landed(ctx, f); f.y = GY; f.vy = 0; }
    f.x = Math.max(ARENA_L, Math.min(ARENA_R, f.x));
  }
  // (touching him hurts, outside his breather and his blink)
  const box = kidBox(f);
  if (f.act !== 'gone' && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && pl.pos.x + pl.width > box.x + 8 && pl.pos.x < box.x + box.w - 8 && pl.pos.y + pl.height > box.y + 10 && pl.pos.y < box.y + box.h) {
    hurtPlayer(ctx, f.act === 'do' && f.move === 'lunge' ? DMG.slam : DMG.touch, f.act === 'do' && f.move === 'lunge' ? 'm2:wp_kidslam' : 'm2:wp_kid', { x: Math.sign(dx || 1) * 7, y: -6 }, 20);
    shakeScreen(state, 6, 3);
  }
  // (the engine's enemy, where he is: the hits; out of it while he's blinked away)
  const e = f.e;
  e.pos.x = box.x; e.pos.y = box.y; e.width = box.w; e.height = box.h; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
  if (f.act === 'gone' && state.enemies.includes(e)) state.enemies = state.enemies.filter(q => q !== e);
  if (f.act !== 'gone' && !state.enemies.includes(e)) state.enemies.push(e);
  takeHits(ctx, f);
};
const rand = (r: number[]) => r[0] + Math.random() * (r[1] - r[0]);
export const kidBox = (f: Fight) => ({ x: f.x - KID_W / 2, y: f.y - KID_H, w: KID_W, h: KID_H });

const doMove = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, pl = state.player, p = pmid(state);
  switch (f.move) {
    case 'lunge': {
      // (an arc of its own every time: its own height and time, down where he is now, give or take)
      const T = 38 + Math.random() * 22, tx = Math.max(ARENA_L, Math.min(ARENA_R, p.x + pl.vel.x * 8 + (Math.random() - 0.5) * 120));
      f.vx = (tx - f.x) / T; f.vy = -(G * T) / 2; f.y -= 1;
      f.face = f.vx < 0 ? -1 : 1;
      setAct(f, 'do', T + 30); playSound('jump', 0.8, -10); playSound('whoosh', 0.7, -6);
      break;
    }
    case 'ray': setAct(f, 'do', 40); break;
    case 'tantrum': setAct(f, 'do', 70); break;
    case 'blink':
      setAct(f, 'gone', 20); playSound('rayFizzle', 0.8, -14);
      for (let k = 0; k < 20; k++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 60, y: f.y - Math.random() * KID_H }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 20, color: k % 2 ? '#7CFF3A' : '#F472B6', size: 3 });
      break;
    case 'flail': setAct(f, 'do', 44); playSound('whoosh', 0.7, -4); break;
    default: setAct(f, 'pause', 30);
  }
};
const runMove = (ctx: FrameContext, f: Fight, dx: number) => {
  const { state } = ctx, pl = state.player, p = pmid(state);
  const t = f.actT;
  switch (f.move) {
    case 'lunge':
      if (f.y >= GY && f.vy === 0 && t > 6) { f.vx *= 0.7; if (t >= f.T) setAct(f, 'recover', 24); }
      break;
    case 'ray': {
      if (t === 2) {
        const [px, py] = kidPalm(f.arm);
        const sx = f.x + px * f.face, sy = f.y + py;
        if (f.arm === 0) shotsAimed(state, sx, sy, p.x, p.y, 8.5, [0], DMG.big);
        else if (f.arm === 1) shotsAimed(state, sx, sy, p.x, p.y, 6.5, [-0.26, 0, 0.26], DMG.spread);
        else shotsAimed(state, sx, sy, p.x, p.y, 4.4, [-0.7, -0.35, 0, 0.35, 0.7].map(a => a + (Math.random() - 0.5) * 0.3), DMG.fan);
        playSound('alienBeam', 0.7, f.arm * 3);
        shakeScreen(state, 4, 2);
      }
      if (t >= f.T) setAct(f, 'recover', 16);
      break;
    }
    case 'tantrum':
      if (t % 12 === 0 && f.shots < 5) {
        f.shots++;
        const aimed = f.shots === 3, tx = aimed ? p.x : ARENA_L + Math.random() * (ARENA_R - ARENA_L), T = 46 + Math.random() * 12;
        const sx = f.x, sy = f.y - KID_H - 10;
        fire(state, { x: sx, y: sy, vx: (tx - sx) / T, vy: (GY - 10 - sy - 0.5 * 0.32 * T * T) / T, kind: 'snow', src: 'm2:wp_kidsnow', dmg: DMG.snow });
        playSound('whoosh', 0.4, 6);
      }
      if (t % 10 === 0) { shakeScreen(state, 4, 2); playSound('thud', 0.5, -6); }
      if (t >= f.T) setAct(f, 'recover', 20);
      break;
    case 'flail':
      f.vx = Math.sign(dx) * 0.8;
      if (t % 10 === 5 && Math.abs(dx) < 110 && Math.abs(p.y - (f.y - KID_H / 2)) < 120 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, DMG.flail, 'm2:wp_kid', { x: Math.sign(dx || 1) * 9, y: -6 }, 20); shakeScreen(state, 7, 3); }
      if (t % 8 === 0) playSound('whoosh', 0.4, 4 + (t % 3));
      if (t >= f.T) { f.hug = 0; setAct(f, 'recover', 30); }
      break;
    default:
      setAct(f, 'pause', 30);
  }
};
const shotsAimed = (state: GameState, x: number, y: number, tx: number, ty: number, speed: number, offs: number[], dmg: number) => {
  const a = Math.atan2(ty - y, tx - x);
  // (his are green: Zorblax's people's own, not the soldiers' pink)
  for (const o of offs) fireBolt(state, x, y, x + Math.cos(a + o) * 100, y + Math.sin(a + o) * 100, speed, 'm2:wp_kidshot', dmg, 'kid');
};
/** Landing out of a lunge: the thud, and (sometimes) the cracks along the floor both ways. */
const landed = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  playSound('slam', 1, -10); playSound('thud', 1, -12); shakeScreen(state, 12, 6);
  for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 70, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 4 }, life: 30, color: k % 2 ? '#E8F0FA' : '#CBD5E1', size: 3 + Math.random() * 4 });
  if (Math.random() < 0.55) for (const d of [-1, 1]) fire(state, { x: f.x + d * 50, y: GY, vx: d * 6, vy: 0, kind: 'wave', src: 'm2:wp_kidslam', dmg: DMG.crack, floor: GY });
};

// ---------------------------------------------------------------------------------------------------------------
// Hits on him

const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return bossMelee(p);
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};
const takeHits = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  const burst = takeSickBurst(e);
  if (f.act === 'gone' || (!burst && (dealt <= 0 || f.iframes > 0))) return;
  const dmg = burst || (plainHit(state, melee) ?? Math.max(1, dealt * SHARE));
  f.hp -= dmg; if (!burst) f.iframes = BOSS_IFRAMES; f.flash = 8;
  playSound('gunhit', 0.6, -2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - KID_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: f.x, y: f.y - 90 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#3FA34D', size: 2 + Math.random() * 3, grav: 0.3 });
  if (f.hp > 0 && Math.random() < 0.2) bark(state, f, crushLines(f.e, L.KID_HURT));
  // (the same hit landing on him for ~4 s: he glitches off somewhere else; off his head or out of his face first)
  if (f.hp > 0 && !burst && spamTick(f.spam, state.frame, hitKey(state.player, melee))) {
    if (melee) swatOff(state, f.x);
    f.move = 'blink'; f.last = 'blink'; setAct(f, 'tell', 8);
  }
  if (f.hp <= 0) die(ctx, f);
};

// ---------------------------------------------------------------------------------------------------------------
// His standard death: the stagger, the last line, over backward into the slide's mouth

/** The kid's dead: the hour goes on and the file's past level 1 (the stage listens for it). */
let onKilled: ((state: GameState) => void) | null = null;
export const setOnKilled = (fn: (state: GameState) => void) => { onKilled = fn; };
const die = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  endCheapStun(f.e);
  f.hp = 0; f.mode = 'dying'; f.death = { t: 0, step: 'stagger' }; token++; f.said = null;
  silenceAll();
  clearShots(state);
  state.enemies = state.enemies.filter(q => q !== f.e);
  state.player.inCutscene = true; state.player.untouchable = true;
  f.vx = 0; f.vy = 0; f.y = GY;
  playSound('roar', 0.8, 10); shakeScreen(state, 10, 5);
  onKilled?.(state);
};
/** The mouth he ends up flopped into (his middle, world). */
export const MOUTH_AT = { x: SUMMIT.mouthX + 30, y: GY };
const updateDying = (ctx: FrameContext, f: Fight): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  p.inCutscene = true; p.vel.x = 0;
  switch (d.step) {
    case 'stagger':
      // (staggering about, all three arms going, green out of him: drunken lurches, but always on over toward the slide's
      // mouth (the owner's "the level one boss will stumble and fall over so he's always near the slide on death"), so
      // he goes over into it wherever on the summit he was killed)
      { const to = MOUTH_AT.x - 70, lurch = Math.max(0, Math.sin(d.t * 0.22)) * 3.2;
        f.x += Math.sign(to - f.x) * Math.min(Math.abs(to - f.x), lurch) + Math.sin(d.t * 0.5) * 1.2;
        if (Math.abs(to - f.x) > 6) f.face = to > f.x ? 1 : -1;
        if (d.t % 18 === 9) playSound('thud', 0.4, 4); }
      f.x = Math.max(ARENA_L, Math.min(ARENA_R - 40, f.x));
      if (d.t % 6 === 0) state.particles.push({ pos: { x: f.x, y: f.y - 100 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 3 }, life: 30, color: '#3FA34D', size: 3 + Math.random() * 3, grav: 0.3 });
      if (d.t > 60 && Math.abs(MOUTH_AT.x - 70 - f.x) < 40 || d.t > 360) { f.face = MOUTH_AT.x > f.x ? -1 : 1; d.step = 'line'; d.t = 0; kidSays(f, pick(byPants(state, L.KID_DEATH)), true, () => { if (f.death) { f.death.step = 'fall'; f.death.t = 0; } }); }
      break;
    case 'line':
      if (d.t > 400) { d.step = 'fall'; d.t = 0; }
      break;
    case 'fall': {
      // (backward, tripping over his short leg, toward the mouth: over he goes)
      const k = Math.min(1, d.t / 40);
      f.x += (MOUTH_AT.x - 40 - f.x) * 0.08;
      if (d.t === 20) playSound('whoosh', 0.7, -8);
      if (k >= 1) { d.step = 'flop'; d.t = 0; playSound('splash', 1, -8); playSound('splat', 0.9, -6); shakeScreen(state, 10, 4); for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: MOUTH_AT.x, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 34, color: i % 3 ? '#7DD3FC' : '#3FA34D', size: 2 + Math.random() * 3 }); }
      break;
    }
    case 'flop':
      if (d.t > 30) { d.step = 'done'; f.mode = 'dead'; }
      break;
    case 'done': break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

/** A frame of the summit's fight. */
export const updateFight = (ctx: FrameContext, f: Fight, controls: Controls): Controls => {
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'dying') return updateDying(ctx, f);
  if (f.mode === 'dead') return hands();
  updateOn(ctx, f);
  return controls;
};
export const fightDead = (f: Fight) => f.mode === 'dead';

/** The kid's pose this frame. */
const poseOf = (f: Fight): KidPose => {
  if (f.mode === 'intro') return f.intro === 'view' || (f.intro === 'kick' || f.intro === 'walk') || (f.intro === 'turn' && f.introT < 10) ? 'sit' : f.intro === 'talk' && f.said ? 'talk' : 'idle';
  if (f.mode === 'dying') { const s = f.death!.step; return s === 'stagger' ? 'stagger' : s === 'line' ? 'talk' : 'stagger'; }
  if (f.mode === 'on' && cheapShotStunned(f.e)) return 'stun';
  if (f.flash > 4) return 'hurt';
  switch (f.act) {
    case 'spasm': return 'flail';
    case 'tell': return f.move === 'lunge' ? 'crouch' : f.move === 'ray' ? 'aim' : f.move === 'tantrum' ? 'stomp' : f.move === 'blink' ? 'glitch' : 'flail';
    case 'do': return f.move === 'lunge' ? (f.y < GY - 1 ? 'leap' : 'land') : f.move === 'ray' ? 'fire' : f.move === 'tantrum' ? (f.actT % 12 < 6 ? 'throw' : 'stomp') : f.move === 'flail' ? 'flail' : 'idle';
    case 'appear': return 'glitch';
    case 'recover': return f.move === 'lunge' ? 'land' : 'idle';
    default: return f.said ? 'talk' : Math.abs(f.vx) > 0.4 ? 'walk' : 'idle';
  }
};

/** World space: the kid (and his words over him). */
export const drawFight = (c: Ctx, state: GameState, f: Fight) => {
  if (f.mode === 'dead' || (f.mode === 'dying' && (f.death!.step === 'flop' || f.death!.step === 'done'))) return;
  if (f.act === 'gone' && f.mode === 'on') return;
  const pose = poseOf(f);
  const glow = pose === 'aim' ? Math.min(1, f.actT / f.T) : pose === 'fire' ? 1 : 0;
  // (the blink: he jitters, slices of him off to the sides)
  const glitch = pose === 'glitch';
  c.save();
  c.translate(Math.round(f.x + (glitch ? (Math.random() - 0.5) * 10 : 0)), Math.round(f.y));
  // (falling over backward into the mouth: tipped back about his feet)
  if (f.mode === 'dying' && f.death!.step === 'fall') c.rotate(-f.face * Math.min(1.4, f.death!.t / 28));
  if (f.face < 0) c.scale(-1, 1);
  if (f.iframes > 0 && f.mode === 'on' && Math.floor(f.iframes / 4) % 2 === 0) c.globalAlpha = 0.7;
  if (glitch && state.frame % 3 === 0) c.globalAlpha = 0.45;
  drawKid(c, { pose, q: 0, arm: f.arm, mouth: !!f.said }, state.frame, glow);
  c.restore();
  if (f.said) saidOver(c, f.said, f.x, f.y - KID_H - 30, '#BEF264', 280);
};
/** The summit's door (kicked in: down flat) at its left. */
export const doorState = (f: Fight | null) => (f ? f.door : 0);

/** Screen space: his bar in the top band; the intro's letterbox, the gross-up, SKIP. */
export const drawFightHud = (c: Ctx, state: GameState, f: Fight, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry') return;
    if (f.intro === 'gross') { drawKidGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawKidGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 30 < 16, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / KID_HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#D9F99D' : '#84CC16');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, L.KID_NAME, band.mid, 50, '#BEF264', 7);
};
export const fightLive = () => live;
