// SKULL GROTTO: MEHPHISTO, Satan's other son (level 2's boss; the demon one in the water park's alien / demon order).
// A ROUGH DRAFT: the owner gives the real mechanics, the damage table and the weakness later. 999 HP like the
// rematches; otherwise the standing boss rules: the 75-frame breather after a hit; the ray gun and his moves in full,
// anything else 25% for now; no more than about five seconds of one attack (the spam breaker: he goes up in smoke and
// comes down somewhere else).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD) He walks up to the grotto's door (a plywood board in the
//               cave's mouth: KEEP OUT. SERIOUSLY.) and kicks it in. The son's sunk in his beanbag at the back in the
//               smoke, a lava lamp, a bong; he doesn't get up (the gross-up); his say, Meathead's, his again; on. A
//               retry (dead, back in through the door): a beat for him to say so, then on.
//   LAZY        His default: he fights half-assedly. Long pauses, shuffling, slumped; the moves are slow and their tells
//               long:
//     FLICK     the lighter clicked twice (the tell), a lit roach flicked in an arc at where he is: a patch of fire
//               there a while.
//     RING      the vape up, a long drag, cheeks puffing (the tell): a big slow smoke ring blown along at him, hot
//               (high: duck it; low: jump it; which, it's held at the height it's coming at through the tell).
//     BURP      a hand on his belly, a gurgle (the tell): a burp of fire rolled along the floor at him (jump it).
//   TRYING      Mock him (Meathead does, on his own, as the fight goes: his dad, his brother) and he snaps: up off the
//               slouch, horns lit, eyes open, yelling for his dad. Ten seconds of really trying, quicker, meaner:
//     PILLARS   pointing (the tell): the floor glowing where he is and either side, then fire up out of it.
//     VOLLEY    an arm up, a fireball in it (the tell): three, aimed, one after another.
//     DROP      up in a puff of smoke; his shadow on the floor where he is (the tell); then down on it out of the
//               ceiling, and a burp of fire either way off the landing (jump it).
//               It wears off: WHATEVER, and he sits down in a sulk (a good opening), then lazy again.
//
// His standard death (no weakness yet; the undignified one): he staggers, his last line (the leak: did he see?); his
// joint drops into his coat and it goes up, and so does he: screaming for his dad, running round in circles on fire
// (he thought he was fireproof), till he trips on his coat and goes face down, ass up, smoldering, his vape rolling
// off. Then Meathead's line, VICTORY, the hour's on (12), control's his: out through the back of the cave to level 3.

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
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { bossIntroSeen, markBossIntroSeen } from '../../bossIntro';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { byPants } from '../park1/kinds';
import { drawSon, sonHand, sonMouth, paintSonDead, SON_W, SON_H, type SonPose } from './sonArt';
import { drawSonGross, drawSonGrossBack, warmSonGross } from './sonGross';
import { shoot2, fireball, lob, clearFire, flame, fireRow, FIRE } from './fire';
import { GROTTO, GY } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const SON_HP = 999;
const BIG = 100000, SHARE = 0.25;
const ARENA_L = GROTTO.door + 60, ARENA_R = GROTTO.R - 50;
/** Where his beanbag is (he sits in it for the intro and his sulks). */
export const BEANBAG_X = GROTTO.R - 150;
/** Tells (frames): lazy (long), trying (short). */
const TELL = { flick: 36, ring: 44, burp: 32, pillars: 30, volley: 24, drop: 40 };
const PAUSE_LAZY = [60, 110], PAUSE_TRY = [16, 36];
const TRY_T = 600, SULK_T = 100;
const DMG = { flick: 12, ring: 14, burp: 14, pillar: 18, ball: 14, drop: 20, touch: 10 };
/** Meathead mocks him at these shares of his health (and every so long, lazy). */
const MOCK_AT = [0.8, 0.55, 0.3], MOCK_EVERY = 1500;

type Move = 'flick' | 'ring' | 'burp' | 'pillars' | 'volley' | 'drop';
type Act = 'pause' | 'tell' | 'do' | 'recover' | 'gone' | 'sulk' | 'mock';
type Intro = 'kick' | 'walk' | 'view' | 'gross' | 'talk' | 'retry';
export interface Fight2 {
  mode: 'intro' | 'on' | 'dying' | 'dead';
  e: Enemy;
  hp: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vy: number; face: 1 | -1; vx: number;
  act: Act; actT: number; T: number; move: Move | null; last: Move | null; shots: number; high: boolean; dropX: number;
  /** Trying (frames left: 0 lazy); the mocks had; frames lazy since the last. */
  tryT: number; mocks: number; lazyT: number; total: number; tauntAt: number; lowSaid: boolean;
  intro: Intro; introT: number; skipT: number; said: string | null; talkStep: number;
  death: { t: number; step: 'stagger' | 'line' | 'burn' | 'trip' | 'flop' | 'done'; dir: 1 | -1 } | null;
  /** The door (kicked in): 0 up, 1 down flat. */
  door: number;
  sitting: boolean;
}

const SON_KIND = 'm2:wp2_sonboss' as const;
registerM2Kind({
  kind: SON_KIND, stats: { w: SON_W, h: SON_H, hp: BIG, contact: 0, mass: 300, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#7F1D1D',
  head: { x: 26, y: -124, r: 14 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[SON_KIND] = L.GRAB_SON;

let token = 0;
export const resetFight2 = () => { token++; };

const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const sonSays = (f: Fight2, text: string, onDone?: () => void) => { const tok = token; speak(L.SON_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); }); };
const bark = (state: GameState, f: Fight2, lines: L.ByPants) => {
  if (f.said) return;
  const text = pick(byPants(state, lines)), tok = token;
  say(text, voice(L.SON_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
const rand = (r: number[]) => r[0] + Math.random() * (r[1] - r[0]);
const setAct = (f: Fight2, a: Act, T: number) => { f.act = a; f.actT = 0; f.T = Math.max(1, Math.round(T)); };

export const startFight2 = (state: GameState): Fight2 => {
  token++;
  const e = makeKindEnemy(SON_KIND as EnemyKind, BEANBAG_X, GY);
  e.seen = true;
  const f: Fight2 = {
    mode: 'intro', e, hp: SON_HP, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(),
    x: BEANBAG_X, y: GY, vy: 0, face: -1, vx: 0, act: 'pause', actT: 0, T: 60, move: null, last: null, shots: 0, high: false, dropX: 0,
    tryT: 0, mocks: 0, lazyT: 0, total: 0, tauntAt: 700, lowSaid: false,
    intro: 'kick', introT: 0, skipT: 0, said: null, talkStep: 0, death: null, door: 0, sitting: true,
  };
  warmSonGross();
  state.player.inCutscene = true;
  if (bossIntroSeen(state, 'mehphisto')) { f.intro = 'retry'; f.door = 1; }
  return f;
};
const beginFight = (state: GameState, f: Fight2) => {
  token++; markBossIntroSeen(state, 'mehphisto');
  f.said = null; state.cameraOverride = null;
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  f.mode = 'on'; f.door = 1; f.sitting = false;
  setAct(f, 'pause', 50);
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro

const updateIntro = (ctx: FrameContext, f: Fight2): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x = 0;
  const skippable = f.intro !== 'retry';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; p.pos.x = GROTTO.door + 120 - p.width / 2; p.facing = 1; beginFight(state, f); return hands(); }
  const t = f.introT;
  switch (f.intro) {
    case 'kick':
      p.facing = 1;
      if (t === 2) meatheadSays(state, pick(byPants(state, L.MH_DOOR)), false);
      if (t === 8) p.kickPose = 22;
      if (t === 16) { f.door = 0.01; playSound('crash', 1, -6); playSound('crack', 0.9, -4); shakeScreen(state, 12, 5); }
      if (f.door > 0) f.door = Math.min(1, f.door + 0.12);
      if (t > 36) { f.intro = 'walk'; f.introT = 0; p.kickPose = 0; }
      break;
    case 'walk':
      p.facing = 1; p.vel.x = 2.2;
      if (p.pos.x + p.width / 2 > GROTTO.door + 120) { p.vel.x = 0; f.intro = 'view'; f.introT = 0; }
      break;
    case 'view':
      // (him in his beanbag in the smoke; a bubble of the bong; a beat)
      if (t === 20) playSound('glug', 0.6, -6);
      if (t > 60) { f.intro = 'gross'; f.introT = 0; playSound('snort', 0.5, -10); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; sonSays(f, pick(byPants(state, L.SON_INTRO)), () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_INTRO2)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; sonSays(f, pick(byPants(state, L.SON_INTRO2)), () => { f.talkStep = 6; }); }
      if (f.talkStep === 6) beginFight(state, f);
      if (t > 1600) beginFight(state, f);
      break;
    case 'retry':
      if (t === 1) bark(state, f, L.SON_RETRY);
      if (t > 70) beginFight(state, f);
      break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

const trying = (f: Fight2) => f.tryT > 0;
const choose = (f: Fight2): Move => {
  const pool: Move[] = trying(f) ? ['pillars', 'volley', 'drop', 'volley', 'pillars'] : ['flick', 'ring', 'burp', 'ring', 'flick'];
  const ok = pool.filter(m => m !== f.last);
  return ok[Math.floor(Math.random() * ok.length)];
};
const startMove = (state: GameState, f: Fight2, m: Move) => {
  f.move = m; f.last = m; f.shots = 0; f.high = Math.random() < 0.5;
  f.face = pmid(state).x < f.x ? -1 : 1;
  setAct(f, 'tell', TELL[m] * (f.hp < SON_HP / 3 ? 0.85 : 1));
  if (m === 'flick') playSound('click', 0.6, 4);
  if (m === 'ring') playSound('suck', 0.4, 8);
  if (m === 'burp') playSound('glug', 0.6, -10);
  if (m === 'pillars') playSound('ignite', 0.6, -6);
  if (m === 'volley') playSound('ignite', 0.5, 8);
  if (m === 'drop') { playSound('poof', 0.7, -4); puff(state, f.x, f.y - 70); }
};
const puff = (state: GameState, x: number, y: number) => { for (let k = 0; k < 22; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 90 }, vel: { x: (Math.random() - 0.5) * 2.4, y: -0.6 - Math.random() * 1.4 }, life: 40, color: k % 2 ? '#5A5266' : '#3A3444', size: 5 + Math.random() * 5 }); };

/** Meathead mocks him (his line, then the son's snap): he's trying. */
const mock = (state: GameState, f: Fight2) => {
  f.mocks++; f.lazyT = 0;
  setAct(f, 'mock', 400);
  meatheadSays(state, pick(byPants(state, L.MH_MOCK)), true, () => {
    if (f.mode !== 'on') return;
    sonSays(f, pick(byPants(state, L.SON_SNAP)));
    f.tryT = TRY_T; f.sitting = false;
    playSound('roar', 0.5, 10); shakeScreen(state, 8, 4);
    setAct(f, 'pause', 20);
  });
};

const updateOn = (ctx: FrameContext, f: Fight2) => {
  const { state } = ctx, pl = state.player, p = pmid(state);
  f.total++; f.actT++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  const dx = p.x - f.x;
  if (trying(f)) {
    f.tryT--;
    if (f.tryT === 0) {
      // (it's worn off: whatever; a sulk in the beanbag)
      bark(state, f, L.SON_SULK);
      setAct(f, 'sulk', SULK_T); f.move = null;
    }
  } else if (f.act !== 'sulk' && f.act !== 'mock') f.lazyT++;
  // (the mocks: at his health's marks, and every so long)
  if (!trying(f) && f.act === 'pause' && !f.said && (f.mocks < MOCK_AT.length && f.hp < SON_HP * MOCK_AT[f.mocks] || f.lazyT > MOCK_EVERY)) mock(state, f);
  // (his mutters: lazy and trying)
  if (f.total > f.tauntAt && !f.said && f.act !== 'mock') { f.tauntAt = f.total + 560 + Math.floor(Math.random() * 400); bark(state, f, trying(f) ? L.SON_TRY : L.SON_LAZY); }
  if (!f.lowSaid && f.hp < SON_HP / 3 && !f.said) { f.lowSaid = true; bark(state, f, L.SON_LOW); }
  switch (f.act) {
    case 'pause': {
      // (shuffling about: lazy, toward the middle or not at all; trying, after him)
      const want = trying(f) ? (Math.abs(dx) > 240 ? Math.sign(dx) : Math.abs(dx) < 110 ? -Math.sign(dx) : 0) : (Math.abs(dx) < 120 ? -Math.sign(dx) : 0);
      f.vx += (want * (trying(f) ? 2.2 : 0.9) - f.vx) * 0.1;
      if (Math.abs(f.vx) > 0.3) f.face = f.vx > 0 ? 1 : -1;
      if (f.actT >= f.T) startMove(state, f, choose(f));
      break;
    }
    case 'tell':
      f.vx *= 0.75;
      if (f.move !== 'drop') f.face = dx < 0 ? -1 : 1;
      if (f.move === 'drop' && f.actT === 1) { f.dropX = p.x; }
      if (f.move === 'drop') f.dropX += Math.max(-2.5, Math.min(2.5, p.x - f.dropX)) * 0.4;
      if (f.actT >= f.T) doMove(ctx, f);
      break;
    case 'do': runMove(ctx, f); break;
    case 'gone':
      // (his shadow following him a while, then set)
      if (f.actT < f.T - 10) f.dropX += Math.max(-3, Math.min(3, p.x - f.dropX)) * 0.5;
      if (f.actT >= f.T) { f.act = 'do'; f.actT = 0; f.T = 60; f.x = Math.max(ARENA_L, Math.min(ARENA_R, f.dropX)); f.y = GY - 420; f.vy = 4; }
      break;
    case 'recover':
      f.vx *= 0.85;
      if (f.actT >= f.T) setAct(f, 'pause', rand(trying(f) ? PAUSE_TRY : PAUSE_LAZY));
      break;
    case 'sulk':
      // (back in the beanbag, sulking: open to it)
      f.vx = 0; f.sitting = Math.abs(f.x - BEANBAG_X) < 30;
      if (!f.sitting) f.x += Math.sign(BEANBAG_X - f.x) * Math.min(3, Math.abs(BEANBAG_X - f.x));
      if (f.actT >= f.T) { f.sitting = false; setAct(f, 'pause', 40); }
      break;
    case 'mock':
      f.vx *= 0.8;
      if (f.actT >= f.T) setAct(f, 'pause', 30);
      break;
  }
  if (f.act !== 'gone' && !(f.act === 'do' && f.move === 'drop')) { f.x += f.vx; f.x = Math.max(ARENA_L, Math.min(ARENA_R, f.x)); }
  // (touching him hurts, outside the drop's fall (that's its own))
  const bx = sonBox(f);
  if (f.act !== 'gone' && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && pl.pos.x + pl.width > bx.x + 6 && pl.pos.x < bx.x + bx.w - 6 && pl.pos.y + pl.height > bx.y + 10 && pl.pos.y < bx.y + bx.h) {
    hurtPlayer(ctx, DMG.touch, 'm2:wp2_son', { x: Math.sign(dx || 1) * 7, y: -6 }, 20); shakeScreen(state, 5, 3);
  }
  const e = f.e;
  e.pos.x = bx.x; e.pos.y = bx.y; e.width = bx.w; e.height = bx.h; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
  if (f.act === 'gone' && state.enemies.includes(e)) state.enemies = state.enemies.filter(q => q !== e);
  if (f.act !== 'gone' && !state.enemies.includes(e)) state.enemies.push(e);
  takeHits(ctx, f);
};
export const sonBox = (f: Fight2) => ({ x: f.x - SON_W / 2, y: f.y - (f.sitting ? 90 : SON_H), w: SON_W, h: f.sitting ? 90 : SON_H });

const doMove = (ctx: FrameContext, f: Fight2) => {
  const { state } = ctx, p = pmid(state), pl = state.player;
  switch (f.move) {
    case 'flick': {
      const [hx, hy] = sonHand('flick');
      lob(state, f.x + hx * f.face, f.y + hy, p.x + pl.vel.x * 10, GY, 40, 'm2:wp2_sonflick', DMG.flick);
      playSound('whoosh', 0.5, 8); setAct(f, 'do', 30); break;
    }
    case 'ring': {
      const [mx] = sonMouth('blow');
      shoot2(state, { kind: 'ring', x: f.x + mx * f.face, y: f.high ? GY - 58 : GY - 18, vx: f.face * 2.8, vy: 0, src: 'm2:wp2_sonring', dmg: DMG.ring, life: 300, r: 14 });
      playSound('whoosh', 0.7, -10); setAct(f, 'do', 40); break;
    }
    case 'burp': {
      const [mx] = sonMouth('burp');
      shoot2(state, { kind: 'burp', x: f.x + mx * f.face, y: GY, vx: f.face * 4.4, vy: 0, src: 'm2:wp2_sonburp', dmg: DMG.burp, life: 140, r: 16, floor: GY });
      playSound('burp', 1, -8); playSound('ignite', 0.6, -6); setAct(f, 'do', 40); break;
    }
    case 'pillars': {
      const at = [p.x, p.x - 140, p.x + 140, ...(f.hp < SON_HP * 0.4 ? [p.x + (Math.random() < 0.5 ? -70 : 70)] : [])];
      at.forEach((x, i) => shoot2(state, { kind: 'pillar', x: Math.max(GROTTO.L + 20, Math.min(GROTTO.R - 20, x)), y: GY, vx: 0, vy: 0, src: 'm2:wp2_sonpillar', dmg: DMG.pillar, life: 86 + i * 10, r: 22, tell: 40 + i * 10, floor: GY }));
      playSound('rumble', 0.8, -6); setAct(f, 'do', 60); break;
    }
    case 'volley': setAct(f, 'do', 44); break;
    case 'drop':
      // (up in the smoke: gone, his shadow where he'll come down)
      setAct(f, 'gone', 34); break;
    default: setAct(f, 'pause', 30);
  }
};
const runMove = (ctx: FrameContext, f: Fight2) => {
  const { state } = ctx, p = pmid(state), pl = state.player;
  const t = f.actT;
  switch (f.move) {
    case 'volley':
      if (t % 12 === 1 && f.shots < 3) { f.shots++; const [hx, hy] = sonHand('throw'); fireball(state, f.x + hx * f.face, f.y + hy, p.x + pl.vel.x * 8, p.y, 6.5, 'm2:wp2_sonball', DMG.ball); }
      if (t >= f.T) setAct(f, 'recover', 20);
      break;
    case 'drop':
      if (f.y < GY) {
        f.vy += 0.9; f.y += f.vy;
        if (f.y >= GY) {
          f.y = GY; f.vy = 0;
          playSound('slam', 1, -10); playSound('thud', 1, -12); shakeScreen(state, 14, 6);
          if (Math.abs(p.x - f.x) < 46 && pl.pos.y + pl.height > GY - 40 && pl.health > 0 && pl.invincibilityTimer <= 0) hurtPlayer(ctx, DMG.drop, 'm2:wp2_sondrop', { x: Math.sign(p.x - f.x || 1) * 8, y: -7 }, 22);
          for (const d of [-1, 1]) shoot2(state, { kind: 'burp', x: f.x + d * 30, y: GY, vx: d * 4, vy: 0, src: 'm2:wp2_sonburp', dmg: DMG.burp, life: 110, r: 16, floor: GY });
          puff(state, f.x, GY - 30);
          setAct(f, 'recover', 34);
        }
      }
      break;
    default:
      if (t >= f.T) setAct(f, 'recover', trying(f) ? 16 : 30);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Hits on him

const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return bossMelee(p);
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};
const takeHits = (ctx: FrameContext, f: Fight2) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  if (dealt <= 0 || f.iframes > 0 || f.act === 'gone') return;
  const dmg = plainHit(state, melee) ?? Math.max(1, dealt * SHARE);
  f.hp -= dmg; f.iframes = BOSS_IFRAMES; f.flash = 8;
  playSound('gunhit', 0.6, -2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - SON_H - 10 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: f.x, y: f.y - 90 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#7F1D1D', size: 2 + Math.random() * 3, grav: 0.3 });
  if (f.hp > 0 && Math.random() < 0.2) bark(state, f, L.SON_HURT);
  // (sat on in his sulk: up off it)
  if (f.act === 'sulk' && f.actT > 30) { f.sitting = false; setAct(f, 'pause', 20); }
  // (the same hit for ~4 s: up in smoke, down somewhere else (swatted off his head, or out of his face, first))
  if (f.hp > 0 && spamTick(f.spam, state.frame, hitKey(state.player, melee))) {
    if (melee) swatOff(state, f.x);
    f.move = 'drop'; f.last = 'drop'; puff(state, f.x, f.y - 70); playSound('poof', 0.7, -4); f.dropX = Math.random() < 0.5 ? ARENA_L + 60 : ARENA_R - 60; setAct(f, 'gone', 30);
  }
  if (f.hp <= 0) die(ctx, f);
};

// ---------------------------------------------------------------------------------------------------------------
// His standard death: the stagger, the leak, the coat going up, running round on fire, face down, ass up

let onKilled2: ((state: GameState) => void) | null = null;
export const setOnKilled2 = (fn: (state: GameState) => void) => { onKilled2 = fn; };
const die = (ctx: FrameContext, f: Fight2) => {
  const { state } = ctx;
  f.hp = 0; f.mode = 'dying'; f.death = { t: 0, step: 'stagger', dir: f.face }; token++; f.said = null; f.sitting = false;
  silenceAll();
  clearFire(state);
  state.enemies = state.enemies.filter(q => q !== f.e);
  state.player.inCutscene = true; state.player.untouchable = true;
  f.y = GY; f.vy = 0; f.vx = 0;
  playSound('roar', 0.6, 14); shakeScreen(state, 10, 5);
  onKilled2?.(state);
};
const updateDying = (ctx: FrameContext, f: Fight2): Controls => {
  const { state } = ctx, d = f.death!, p = state.player;
  d.t++;
  p.inCutscene = true; p.vel.x = 0;
  switch (d.step) {
    case 'stagger':
      f.x += Math.sin(d.t * 0.2) * 1.4;
      if (d.t > 40) { d.step = 'line'; d.t = 0; sonSays(f, pick(byPants(state, L.SON_DEATH)), () => { if (f.death?.step === 'line') { f.death.step = 'burn'; f.death.t = 0; } }); }
      break;
    case 'line':
      if (d.t > 420) { d.step = 'burn'; d.t = 0; }
      break;
    case 'burn':
      // (the joint into his coat; up he goes; round and round, screaming for his dad)
      if (d.t === 1) { playSound('ignite', 1, -6); playSound('screams', 0.6, 8); sonSays(f, pick(byPants(state, L.SON_BURNING))); }
      if (d.t % 40 === 0) playSound('screams', 0.4, 10);
      f.x += d.dir * 3.4;
      if (f.x > ARENA_R - 20 || f.x < ARENA_L + 20) d.dir = (d.dir * -1) as 1 | -1;
      f.face = d.dir;
      if (d.t % 3 === 0) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 30, y: f.y - 60 - Math.random() * 80 }, vel: { x: -d.dir * 1.5, y: -1.5 }, life: 26, color: FIRE[1 + (d.t % 4)], size: 3 + Math.random() * 3 });
      if (d.t > 170 && !f.said) { d.step = 'trip'; d.t = 0; playSound('whoosh', 0.8, -6); }
      if (d.t > 600) { d.step = 'trip'; d.t = 0; }
      break;
    case 'trip':
      f.x += d.dir * 2;
      if (d.t > 16) { d.step = 'flop'; d.t = 0; playSound('thud', 1, -12); playSound('crash', 0.5, -8); shakeScreen(state, 10, 4); puff(state, f.x, GY - 10); }
      break;
    case 'flop':
      // (face down, ass up, smoldering; a last little puff out the back of the coat)
      if (d.t === 50) { playSound('fart', 0.5, -4); puff(state, f.x - d.dir * 30, GY - 30); }
      if (d.t > 90) { d.step = 'done'; f.mode = 'dead'; }
      break;
    case 'done': break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

/** A frame of the grotto's fight. */
export const updateFight2 = (ctx: FrameContext, f: Fight2, controls: Controls): Controls => {
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'dying') return updateDying(ctx, f);
  if (f.mode === 'dead') return hands();
  updateOn(ctx, f);
  return controls;
};
export const fight2Dead = (f: Fight2) => f.mode === 'dead';

const poseOf = (f: Fight2): SonPose => {
  if (f.mode === 'intro') return f.intro === 'talk' && f.said ? 'sit' : 'sit';
  if (f.mode === 'dying') { const s = f.death!.step; return s === 'burn' ? 'burn' : s === 'trip' ? 'stagger' : s === 'line' ? 'talk' : 'stagger'; }
  if (f.sitting) return 'sit';
  if (f.flash > 4) return 'hurt';
  switch (f.act) {
    case 'tell': return f.move === 'flick' ? 'flick' : f.move === 'ring' ? 'inhale' : f.move === 'burp' ? 'burp' : f.move === 'pillars' ? 'point' : f.move === 'volley' ? 'throw' : 'try';
    case 'do': return f.move === 'ring' ? 'blow' : f.move === 'burp' ? 'burp' : f.move === 'flick' ? 'flick' : f.move === 'pillars' ? 'point' : f.move === 'volley' ? 'throw' : f.move === 'drop' ? (f.y < GY ? 'drop' : 'try') : 'idle';
    case 'mock': return 'idle';
    default: return f.said ? 'talk' : Math.abs(f.vx) > 0.4 ? 'walk' : trying(f) ? 'try' : 'idle';
  }
};

/** World space: the beanbag (his), him, his words; the drop's shadow. */
export const drawFight2 = (c: Ctx, state: GameState, f: Fight2) => {
  const fr = state.frame;
  if (f.mode === 'dead' || (f.mode === 'dying' && f.death!.step === 'flop')) { drawSonDead(c, f.x, f.death?.dir ?? 1, fr); return; }
  // (the drop's tell: his shadow on the floor where he'll come down)
  if (f.mode === 'on' && f.move === 'drop' && (f.act === 'gone' || (f.act === 'do' && f.y < GY))) {
    const k = f.act === 'gone' ? Math.min(1, f.actT / f.T) : 1;
    c.globalAlpha = 0.3 + 0.4 * k; c.fillStyle = '#050208'; c.beginPath(); c.ellipse(f.dropX, GY - 2, 18 + 14 * k, 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    if (f.act === 'gone') return;
  }
  const pose = poseOf(f);
  const q = pose === 'walk' || pose === 'burn' ? Math.floor(fr / (pose === 'burn' ? 4 : 7)) % 8 : pose === 'idle' || pose === 'talk' || pose === 'try' ? Math.floor(fr / 12) % 8 : 0;
  const alpha = f.iframes > 0 && f.mode === 'on' && Math.floor(f.iframes / 4) % 2 === 0 ? 0.7 : 1;
  const sitX = f.sitting || f.mode === 'intro' ? BEANBAG_X : f.x;
  drawSon(c, sitX, f.y - (pose === 'sit' ? 14 : 0), f.mode === 'intro' ? -1 : f.face, { pose, q, mouth: !!f.said }, fr, trying(f) && f.mode === 'on' ? 0.8 + 0.2 * Math.sin(fr * 0.3) : 0, alpha);
  // (on fire: the flames up him)
  if (f.mode === 'dying' && (f.death!.step === 'burn' || f.death!.step === 'trip')) { for (let k = 0; k < 4; k++) flame(c, f.x - 18 + k * 12, f.y - 20 - k * 22, 14, 40, fr, 60 + k); fireRow(c, f.x - 24, f.x + 24, f.y - 100, 34, fr, 14, 9); }
  if (f.said) saidOver(c, f.said, sitX, f.y - SON_H - 34, '#D8B4FE', 280);
};
let deadImg: HTMLCanvasElement | null = null;
const drawSonDead = (c: Ctx, x: number, dir: number, fr: number) => {
  if (!deadImg && typeof document !== 'undefined') { const S = 2, cv = document.createElement('canvas'); cv.width = 160 * S; cv.height = 60 * S; const g = cv.getContext('2d')!; g.scale(S, S); g.translate(80, 56); paintSonDead(g); deadImg = cv; }
  if (!deadImg) return;
  c.save(); c.translate(Math.round(x), GY); if (dir < 0) c.scale(-1, 1); c.drawImage(deadImg, -80, -56, 160, 60); c.restore();
  // (smoldering: a thread of smoke off his back, an ember)
  if (fr % 5 === 0) flame(c, x - dir * 10, GY - 26, 6, 10, fr, 3);
};

/** Screen space: his bar in the top band; the intro's letterbox, the gross-up, SKIP. */
export const drawFight2Hud = (c: Ctx, state: GameState, f: Fight2, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry') return;
    if (f.intro === 'gross') { drawSonGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawSonGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 40 < 18, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / SON_HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#E9D5FF' : trying(f) ? '#EF4444' : '#A855F7');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, L.SON_NAME, band.mid, 50, '#D8B4FE', 7);
};
export const doorState2 = (f: Fight2 | null) => (f ? f.door : 0);
