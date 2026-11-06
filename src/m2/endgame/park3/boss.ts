// THE WAVE POOL: GUPPLAX, the alien lifeguard (level 3's boss; the alien one in the water park's alien / demon order).
// A ROUGH DRAFT (the owner: "he will be erratic, the scene will be extra wide, and the wave pool will push you back.
// all the way to the 'shallow' end. if you are in the shallow end, the boss will taunt you to 'come back to the deep
// end, pussy'. i don't have his mechanics down quite yet"). The standing rules: 999 HP, the 75-frame breather after a
// hit, his moves and the ray gun in full, every special 35% (the owner's water park rule: no weakness, the specials
// generally better; all die the same), no more than about five seconds of one attack (the spam breaker: he dives).
//
//   THE INTRO   (a cutscene, skippable, all of it; no HUD; after the flush in (pool.ts)) Up on his lifeguard tower at the
//               deep end, blowing his whistle at nothing: the gross-up; his say (who he is, the grudge: Meathead killed
//               his nephew on the mountain), Meathead's, his again; a cannonball off the tower into the deep end: on.
//               A retry: his line from the tower, the cannonball, on.
//   GUPPLAX     erratic: he darts about the deep end in fits, giggling, screaming, picks his moves in no order, but
//               every one has the same long, clear tell, and a window after it (winded at the surface) to hit him in:
//     WAVE      up out of the water, cheeks ballooning, the whistle up (the tell): TWEEEET, and the wave machine throws a
//               wall of water down the pool at him (dive under it: it's all at the top; on the beach, jump it).
//     LOOGIES   the hork: his throat bulging, glowing green (the tell); three gobs of alien snot lobbed at him and either
//               side; where they land on the water, a slick that burns a while (keep your head out of it).
//     FLOP      sinks low, arms up (the tell); up out of the pool in a leap, his shadow on the water where he'll come
//               down (it follows him, then sets); the belly flop: a ring of splash that hurts and a small wave.
//     BREACH    a gulp, under (the tell); a line of bubbles comes along the surface after him, stops, rings (the tell):
//               then up out of it, jaws first. Only ever at him in the water.
//   THE SHALLOW END  the waves keep pushing him back to the beach (pool.ts); there, he's out of reach, and he taunts.
//   DEATH       his standard (no weakness yet): choking on his whistle, swelling up, belly up (pool.ts's end: the deflate,
//               the drain).

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
import { endgameBoss, endgameHit, endgameMelee } from '../../weapons/endgameDamage';
import { registerM2Kind } from '../../kinds';
import { ownShare } from '../../weapons/subBoss';
import { setSickHurl, takeSickBurst } from '../../weapons/crossbow';
import { newSpam, spamTick, hitKey, swatOff, type Spam, BOSS_IFRAMES } from '../../bossSpam';
import { TOO_BIG_BY_KIND } from '../../lines/weaponLines';
import { box, label, saidOver, speak, voice, meatheadSays } from '../../adventure/section';
import { cheapShotGate, cheapShotStunned, endCheapStun, registerClearThreats, crushGroups, crushLines } from '../../upgrades/cheapShot';
import { byPants } from '../park1/kinds';
import { drawGup, GUP_W, GUP_H, type GupPose } from './gupArt';
import { drawGupGross, drawGupGrossBack, warmGupGross } from './gupGross';
import { WP } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

export const GUP_HP = 999;
const BIG = 100000;
/** His stretch of the deep end; his tower (on the deck past the deep end's wall). */
export const GX0 = WP.x0 + 1180, GX1 = WP.x1 - 110;
export const TOWER = { x: WP.x1 + 70, seat: WP.surf - 170 };
/** Where he floats (his waist: at the surface, his top half out). */
const FLOAT = WP.surf + 6;
/** Damage, before Meathead 2's own cut (×0.65): meant to be dodged. */
const DMG = { wave: 14, loogie: 13, slick: 7, flop: 22, splash: 14, breach: 24, touch: 10 };
const WIND = { whistle: 46, hork: 40, crouch: 40, sink: 26, set: 32 };
const OPEN = { wave: 44, spit: 40, flop: 56, breach: 44 };
export const CREST = { speed: 4.6, h: 70, under: 64 };
const SLICK_LIFE = 250;

export interface Crest { x: number; t: number; dmg: number; hit: boolean; big: boolean; dir: 1 | -1 }
interface Glob { x: number; y: number; vx: number; vy: number }
interface Slick { x: number; w: number; t: number }
type Move = 'wave' | 'loogie' | 'flop' | 'breach';
type Intro = 'view' | 'gross' | 'talk' | 'jump' | 'retry';
export interface Fight3 {
  mode: 'intro' | 'on' | 'dead';
  intro: Intro; introT: number; skipT: number; talkStep: number;
  e: Enemy; hp: number; iframes: number; flash: number; moveSeen?: number; spam: Spam;
  x: number; y: number; vx: number; vy: number; face: 1 | -1;
  st: string; t: number; T: number; move: Move | null; last: Move[]; cd: number; dart: number;
  /** The flop's and the breach's target (his shadow, the bubbles), a move's hit had; the globs thrown. */
  aim: number; hit: boolean; shots: number;
  crests: Crest[]; globs: Glob[]; slicks: Slick[];
  said: string | null; total: number; tauntAt: number; patterAt: number; lowSaid: boolean; frozen: boolean;
}

const KIND = 'm2:wp3_gupplax' as const;
registerM2Kind({
  kind: KIND, stats: { w: GUP_W, h: GUP_H, hp: BIG, contact: 0, mass: 400, air: true },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true }),
  gender: 'm', humanoid: true, grab: 'none', midBoss: true, blood: '#3FA34D',
  head: { x: 30, y: -GUP_H + 20, r: 22 },
  draw: () => {},
  ai: () => true,
});
TOO_BIG_BY_KIND[KIND] = L.GRAB_GUP;
// (every special's hit worked out here, in the fight, off the table: not cut again as a sub-boss's)
ownShare(KIND);
// (every special's hit off the water park's own damage table, by weapon and move: weapons/endgameDamage.ts)
endgameBoss(KIND);
setSickHurl(KIND);
// (the hand armor's cheap shot (upgrades/cheapShot.ts): his own crushed set)
crushGroups('gupplax', { hurt: [L.GUP_HURT], taunt: [L.GUP_PATTER, L.GUP_TAUNT] });
registerClearThreats('gupplax', state => {
  const f = current; if (!f) return;
  for (const g of f.globs) for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: g.x, y: g.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 3 }, life: 24, color: '#9AF060', size: 3 });
  f.globs.length = 0; f.slicks.length = 0; f.crests.length = 0;
});
let current: Fight3 | null = null;

let token = 0;
const pmid = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const hands = (): Controls => ({ left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false });
const setSt = (f: Fight3, st: string, T: number) => { f.st = st; f.t = 0; f.T = Math.max(1, Math.round(T)); };
/** A line of his, its turn (waits for anybody talking), `onDone` after. */
const gupSays = (f: Fight3, text: string, onDone?: () => void) => { const tok = token; speak(L.GUP_VOICE, text, s => { if (tok === token) f.said = s?.text ?? null; }, true, () => { if (tok === token) onDone?.(); }); };
/** A bark (dropped if anybody's talking). */
const bark = (state: GameState, f: Fight3, lines: L.ByPants) => {
  if (f.said) return;
  const text = pick([...byPants(state, lines)]), tok = token;
  say(text, voice(L.GUP_VOICE), 'casual', {
    always: true,
    onShow: spoken => { if (tok !== token) return; f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};

export const startGup = (state: GameState, retry: boolean): Fight3 => {
  token++;
  const e = makeKindEnemy(KIND as EnemyKind, TOWER.x, TOWER.seat);
  e.seen = true;
  const f: Fight3 = {
    mode: 'intro', intro: retry ? 'retry' : 'view', introT: 0, skipT: 0, talkStep: 0,
    e, hp: GUP_HP, iframes: 0, flash: 0, moveSeen: e.hitByMove, spam: newSpam(),
    x: TOWER.x, y: TOWER.seat, vx: 0, vy: 0, face: -1, st: 'chair', t: 0, T: 60, move: null, last: [], cd: 60, dart: 0,
    aim: 0, hit: false, shots: 0, crests: [], globs: [], slicks: [], said: null, total: 0, tauntAt: 300, patterAt: 500, lowSaid: false, frozen: false,
  };
  current = f;
  warmGupGross();
  state.player.inCutscene = true;
  return f;
};
const beginFight = (state: GameState, f: Fight3) => {
  token++;
  f.said = null; state.cameraOverride = null;
  state.player.inCutscene = false;
  f.mode = 'on'; f.x = GX1 - 160; f.y = FLOAT; f.vx = 0; f.vy = 0;
  setSt(f, 'swim', 40); f.cd = 70;
  if (!state.enemies.includes(f.e)) state.enemies.push(f.e);
};

// ---------------------------------------------------------------------------------------------------------------
// The intro (after the flush): the tower, the gross-up, the talk, the cannonball

/** The cannonball: off the tower, into the deep end (a big splash), frames. */
const JUMP_T = 46;
const updateIntro = (ctx: FrameContext, f: Fight3): Controls => {
  const { state } = ctx, p = state.player;
  f.introT++; f.skipT++;
  p.inCutscene = true; p.vel.x *= 0.9;
  const skippable = f.intro !== 'retry' && f.intro !== 'jump';
  if (skippable && f.skipT > SKIP_AFTER) offerSkip();
  if (skippable && f.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; splash(state, GX1 - 160, 30); beginFight(state, f); return hands(); }
  const t = f.introT;
  // (the camera: on the tower)
  state.cameraOverride = { x: Math.min(WP.x1 + 200 - CANVAS_WIDTH, TOWER.x - 520), y: f.intro === 'jump' ? WP.surf - 300 : WP.surf - 420 };
  switch (f.intro) {
    case 'view':
      if (t % 40 === 10) playSound('beep', 0.5, 14);
      if (t > 70) { f.intro = 'gross'; f.introT = 0; playSound('snort', 0.6, -6); }
      break;
    case 'gross':
      if (t > 105) { f.intro = 'talk'; f.introT = 0; f.talkStep = 0; }
      break;
    case 'talk':
      if (f.talkStep === 0) { f.talkStep = 1; gupSays(f, pick(byPants(state, L.GUP_INTRO)), () => { f.talkStep = 2; }); }
      if (f.talkStep === 2) { f.talkStep = 3; meatheadSays(state, pick(byPants(state, L.MH_GUP)), true, () => { f.talkStep = 4; }); }
      if (f.talkStep === 4) { f.talkStep = 5; gupSays(f, pick(byPants(state, L.GUP_INTRO2)), () => { f.talkStep = 6; }); }
      if (f.talkStep === 6 || t > 1800) { f.intro = 'jump'; f.introT = 0; playSound('jump', 0.9, -12); }
      break;
    case 'retry':
      if (t === 1) bark(state, f, L.GUP_RETRY);
      if (t > 80) { f.intro = 'jump'; f.introT = 0; playSound('jump', 0.9, -12); }
      break;
    case 'jump': {
      // (balled up, off the tower in an arc, into the deep end)
      const k = Math.min(1, t / JUMP_T), tx = GX1 - 160;
      f.x = TOWER.x + (tx - TOWER.x) * k; f.y = TOWER.seat + (FLOAT - TOWER.seat) * k - Math.sin(k * Math.PI) * 140;
      if (t >= JUMP_T) { splash(state, tx, 36); playSound('splash', 1, -14); playSound('thud', 0.8, -14); shakeScreen(state, 12, 6); beginFight(state, f); }
      break;
    }
  }
  return hands();
};
/** A big splash at the surface (spray up, a ring). */
export const splash = (state: GameState, x: number, n = 24) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 80, y: WP.surf - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 8 }, life: 34, color: i % 3 ? '#BAE6FD' : '#F0F9FF', size: 3 + Math.random() * 4, grav: 0.3 });
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

const pickMove = (f: Fight3, inWater: boolean): Move => {
  const pool: Move[] = inWater ? ['wave', 'loogie', 'flop', 'breach', 'loogie', 'flop', 'breach'] : ['wave', 'loogie', 'wave', 'loogie', 'flop'];
  const ok = pool.filter(m => m !== f.last[0]);
  return ok[Math.floor(Math.random() * ok.length)] ?? 'loogie';
};
const begin = (state: GameState, f: Fight3, m: Move) => {
  f.move = m; f.last = [m, ...f.last].slice(0, 3); f.hit = false; f.shots = 0;
  const p = pmid(state);
  f.face = p.x < f.x ? -1 : 1; f.vx = 0;
  switch (m) {
    case 'wave': setSt(f, 'whistle', WIND.whistle); playSound('suck', 0.6, 4); break;
    case 'loogie': setSt(f, 'hork', WIND.hork); playSound('retch', 0.7, 6); break;
    case 'flop': setSt(f, 'crouch', WIND.crouch); playSound('glug', 0.6, -8); break;
    case 'breach': setSt(f, 'sink', WIND.sink); playSound('glug', 0.8, -4); break;
  }
};
const finish = (f: Fight3) => { setSt(f, 'swim', 0); f.move = null; f.cd = 30 + Math.random() * 50; f.dart = Math.random() < 0.5 ? 1 : 0; };
const meBox = (state: GameState) => { const p = state.player; return { x: p.pos.x + 6, y: p.pos.y + (p.isDucking ? 24 : 0), w: p.width - 12, h: p.height - (p.isDucking ? 24 : 0) }; };
const hurtIf = (ctx: FrameContext, f: Fight3, x: number, y: number, w: number, h: number, dmg: number, src: string, kx: number, ky: number, once = true) => {
  const pl = ctx.state.player;
  if ((once && f.hit) || pl.health <= 0 || pl.invincibilityTimer > 0 || pl.inCutscene) return false;
  const b = meBox(ctx.state);
  if (b.x < x + w && b.x + b.w > x && b.y < y + h && b.y + b.h > y) { f.hit = true; hurtPlayer(ctx, dmg, src, { x: kx, y: ky }, 22); shakeScreen(ctx.state, 8, 4); return true; }
  return false;
};
/** Where a target on the water can be (the breach's, the flop's): in the pool, out of the beach. */
const waterX = (x: number) => Math.max(WP.beach + 140, Math.min(GX1, x));

const stepGup = (ctx: FrameContext, f: Fight3) => {
  const { state } = ctx, pl = state.player, p = pmid(state), dx = p.x - f.x;
  const inWater = pl.swimming || p.x > WP.beach + 60;
  f.t++;
  switch (f.st) {
    case 'swim': {
      // (erratic: fits of darting about the deep end, giggling; otherwise a bob, facing him)
      if (f.dart > 0) {
        if (f.dart === 1) { f.aim = GX0 + Math.random() * (GX1 - GX0); f.dart = 2; }
        f.vx += (Math.sign(f.aim - f.x) * 6 - f.vx) * 0.15;
        if (Math.abs(f.aim - f.x) < 20) { f.dart = 0; f.vx *= 0.3; }
      } else f.vx *= 0.9;
      f.x = Math.max(GX0, Math.min(GX1, f.x + f.vx));
      f.y = FLOAT + Math.sin(state.frame * 0.08) * 3;
      f.face = dx < 0 ? -1 : 1;
      f.cd--;
      if (f.cd <= 0 && f.dart === 0) begin(state, f, pickMove(f, inWater));
      break;
    }
    // WAVE: up out of the water, cheeks ballooning, the whistle (the tell); TWEEEET: the wall of water down the pool
    case 'whistle':
      f.y = FLOAT - 24 * Math.min(1, f.t / 12);
      if (f.t === 2) bark(state, f, L.GUP_WAVE);
      if (f.t >= f.T) { setSt(f, 'blow', 34); playSound('alarm', 0.8, 12); playSound('rumble', 0.9, -8); shakeScreen(state, 6, 4); f.crests.push({ x: GX1 + 60, t: 0, dmg: DMG.wave, hit: false, big: true, dir: -1 }); }
      break;
    case 'blow':
      if (f.t >= f.T) setSt(f, 'open', OPEN.wave);
      break;
    // LOOGIES: the hork (the throat's bulge, glowing), three gobs lobbed at him and either side of him
    case 'hork':
      f.y = FLOAT - 10;
      if (f.t >= f.T) setSt(f, 'spit', 30);
      break;
    case 'spit':
      if (f.t % 8 === 1 && f.shots < 3) {
        const tx = [p.x, p.x - 130, p.x + 130][f.shots++], T = 46, sx = f.x + f.face * 40, sy = f.y - 110;
        const ty = Math.min(WP.surf - 6, pl.pos.y + pl.height - 10);
        f.globs.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 0.3 * T * T) / T });
        playSound('splat', 0.5, 8);
      }
      if (f.t >= f.T) setSt(f, 'open', OPEN.spit);
      break;
    // FLOP: sinks low, arms up (the tell); the leap, his shadow following him then set; the belly flop
    case 'crouch':
      f.y = FLOAT + 18 * Math.min(1, f.t / 20);
      if (f.t >= f.T) { setSt(f, 'air', 54); f.aim = waterX(p.x); f.vx = 0; f.vy = -13; playSound('jump', 1, -14); splash(state, f.x, 14); }
      break;
    case 'air': {
      // (the target: after him the first two thirds, then set)
      if (f.t < 34) f.aim += Math.max(-4, Math.min(4, waterX(p.x) - f.aim)) * 0.4;
      const left = Math.max(1, f.T - f.t);
      f.x += (f.aim - f.x) / left;
      f.vy += 0.48; f.y += f.vy;
      if (f.vy > 0) hurtIf(ctx, f, f.x - 50, f.y - 130, 100, 150, DMG.flop, 'm2:wp3_flop', Math.sign(dx || 1) * 8, -7);
      if (f.y >= FLOAT && f.vy > 0) {
        f.y = FLOAT; f.vy = 0;
        splash(state, f.x, 40); playSound('splash', 1, -16); playSound('slam', 0.8, -14); shakeScreen(state, 14, 6);
        // (the splash ring, near the surface; a small wave either way)
        hurtIf(ctx, f, f.x - 110, WP.surf - 90, 220, 140, DMG.splash, 'm2:wp3_flop', Math.sign(dx || 1) * 9, -8);
        f.crests.push({ x: f.x - 40, t: 0, dmg: 8, hit: false, big: false, dir: -1 });
        setSt(f, 'flopped', OPEN.flop);
      }
      break;
    }
    case 'flopped':
      if (f.t >= f.T) { f.x = Math.max(GX0 - 300, f.x); setSt(f, 'open', 1); }
      break;
    // BREACH: a gulp, under; the bubbles along the surface after him, set (they ring), then up out of it jaws first
    case 'sink':
      f.y = FLOAT + 60 * Math.min(1, f.t / f.T);
      if (f.t >= f.T) { setSt(f, 'under', 70); f.aim = f.x; f.y = WP.deep - 40; }
      break;
    case 'under':
      f.aim += Math.max(-3.4, Math.min(3.4, waterX(p.x) - f.aim));
      if (f.t >= f.T) { setSt(f, 'set', WIND.set); playSound('glug', 0.9, -10); }
      break;
    case 'set':
      if (f.t >= f.T) { setSt(f, 'breach', 26); f.x = f.aim; f.y = WP.deep - 40; playSound('splash', 1, -6); playSound('roar', 0.5, 6); }
      break;
    case 'breach':
      f.y = Math.max(FLOAT - 70, f.y - 22);
      hurtIf(ctx, f, f.x - 40, f.y - 150, 80, WP.deep - f.y + 150, DMG.breach, 'm2:wp3_breach', Math.sign(dx || 1) * 6, -10);
      if (f.t === 4) splash(state, f.x, 30);
      if (f.t >= f.T) setSt(f, 'open', OPEN.breach);
      break;
    case 'open':
      f.vx *= 0.85; f.x = Math.max(GX0 - 300, Math.min(GX1, f.x + f.vx));
      f.y += (FLOAT - f.y) * 0.15;
      if (f.t >= f.T) {
        // (drifted out of his deep end in a flop or a breach: he swims back)
        if (f.x < GX0) { f.dart = 2; f.aim = GX0 + 120 + Math.random() * 300; }
        finish(f);
      }
      break;
  }
};

/** His box (where he's hit and touches): the top half over the water; all of him in the air. */
export const gupBox = (f: Fight3) => {
  if (f.st === 'air') return { x: f.x - 50, y: f.y - 130, w: 100, h: 170 };
  if (f.st === 'breach') return { x: f.x - 44, y: f.y - 150, w: 88, h: 160 };
  return { x: f.x - 50, y: f.y - 130, w: 100, h: 140 };
};
const under = (f: Fight3) => f.st === 'under' || f.st === 'set' || (f.st === 'sink' && f.t > f.T * 0.6);

const plainHit = (state: GameState, melee: boolean): number | null => {
  const p = state.player;
  if (melee) return endgameMelee(p);
  return p.currentWeapon === 'GUN' ? BULLET_DAMAGE : null;
};
const takeHits = (ctx: FrameContext, f: Fight3, gone: boolean) => {
  const { state } = ctx, e = f.e;
  const dealt = Math.max(0, BIG - e.health);
  e.health = BIG; e.maxHealth = BIG;
  const melee = e.hitByMove !== f.moveSeen;
  f.moveSeen = e.hitByMove;
  const burst = takeSickBurst(e);
  if (gone || (!burst && (dealt <= 0 || f.iframes > 0))) return;
  const dmg = burst || (plainHit(state, melee) ?? endgameHit(state, e, dealt));
  f.hp -= dmg; if (!burst) f.iframes = BOSS_IFRAMES; f.flash = 8;
  playSound('gunhit', 0.6, -2);
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - 160 }, Math.max(1, Math.round(dmg)), dmg > 40);
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: f.x, y: f.y - 80 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 22, color: '#3FA34D', size: 2 + Math.random() * 3, grav: 0.3 });
  if (f.hp > 0 && Math.random() < 0.22) bark(state, f, crushLines(f.e, L.GUP_HURT));
  // (the same hit landing on him ~4 s running: under and away, swatted off first)
  if (f.hp > 0 && !burst && spamTick(f.spam, state.frame, hitKey(state.player, melee)) && (f.st === 'swim' || f.st === 'open' || f.st === 'flopped')) {
    if (melee) swatOff(state, f.x);
    begin(state, f, 'breach'); f.T = 10;
  }
  if (f.hp <= 0) {
    endCheapStun(f.e);
    f.hp = 0; f.mode = 'dead'; f.vx = 0; f.vy = 0; f.said = null; token++;
    f.crests.length = 0; f.globs.length = 0; f.slicks.length = 0;
    state.enemies = state.enemies.filter(q => q !== e);
  }
};

/** A frame of the fight (the intro's too). */
export const updateGup = (ctx: FrameContext, f: Fight3, controls: Controls): Controls => {
  const { state } = ctx, pl = state.player;
  if (f.mode === 'intro') return updateIntro(ctx, f);
  if (f.mode === 'dead') return hands();
  f.total++;
  if (f.iframes > 0) f.iframes--;
  if (f.flash > 0) f.flash--;
  // (the cheap shot: up for it at the surface, out in the open (not off in a leap or under))
  const ok = (f.st === 'swim' || f.st === 'open' || f.st === 'flopped') && Math.abs(f.y - FLOAT) < 20;
  const was = f.frozen;
  f.frozen = cheapShotGate(state, f.e, 'gupplax', ok) === 'frozen';
  if (f.frozen) return controls;
  if (was) setSt(f, 'swim', 0);
  // (the mutters; the taunt in the shallow end)
  const cx = pl.pos.x + pl.width / 2;
  if (cx < WP.shallow && f.total > f.tauntAt && !f.said && pl.health > 0) { f.tauntAt = f.total + 360 + Math.floor(Math.random() * 200); bark(state, f, crushLines(f.e, L.GUP_TAUNT)); }
  else if (f.total > f.patterAt && !f.said) { f.patterAt = f.total + 560 + Math.floor(Math.random() * 400); bark(state, f, crushLines(f.e, L.GUP_PATTER)); }
  if (!f.lowSaid && f.hp < GUP_HP * 0.35 && !f.said) { f.lowSaid = true; bark(state, f, L.GUP_LOW); }
  if (cheapShotStunned(f.e)) { f.vx = 0; if (f.st !== 'stun') { setSt(f, 'stun', 9999); f.move = null; } }
  else if (f.st === 'stun') setSt(f, 'swim', 0);
  else stepGup(ctx, f);
  // ---- the crests (down the pool), the globs, the slicks
  const b = meBox(state);
  for (let i = f.crests.length - 1; i >= 0; i--) {
    const c = f.crests[i];
    c.t++; c.x += c.dir * (c.big ? CREST.speed : CREST.speed * 0.8);
    const top = c.x < WP.beach ? WP.beachTop - CREST.h * 0.6 : WP.surf - CREST.h * (c.big ? 1 : 0.6);
    const bot = c.x < WP.beach ? WP.beachTop : WP.surf + CREST.under;
    if (!c.hit && pl.health > 0 && !pl.inCutscene && b.x < c.x + 30 && b.x + b.w > c.x - 30 && b.y < bot && b.y + b.h > top) {
      c.hit = true;
      if (pl.invincibilityTimer <= 0) hurtPlayer(ctx, c.dmg, 'm2:wp3_gupwave', { x: -9, y: -6 }, 20);
      pl.vel.x = Math.min(pl.vel.x, c.big ? -10 : -6);
    }
    if (c.x < WP.x0 + 40 || c.t > 600) f.crests.splice(i, 1);
  }
  for (let i = f.globs.length - 1; i >= 0; i--) {
    const g = f.globs[i];
    g.vy += 0.3; g.x += g.vx; g.y += g.vy;
    if (pl.health > 0 && !pl.inCutscene && g.x > b.x - 8 && g.x < b.x + b.w + 8 && g.y > b.y - 8 && g.y < b.y + b.h + 8) {
      if (pl.invincibilityTimer <= 0) { hurtPlayer(ctx, DMG.loogie, 'm2:wp3_loogie', { x: Math.sign(g.vx || 1) * 4, y: -4 }, 16); shakeScreen(state, 5, 3); }
      f.globs.splice(i, 1); continue;
    }
    const floor = g.x < WP.beach ? WP.beachTop : WP.surf;
    if (g.y >= floor && g.vy > 0) {
      f.globs.splice(i, 1);
      f.slicks.push({ x: g.x, w: 70, t: 0 });
      for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: g.x, y: floor - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 20, color: '#9AF060', size: 3 });
      playSound('splat', 0.4, 4);
    }
  }
  for (let i = f.slicks.length - 1; i >= 0; i--) {
    const s = f.slicks[i];
    s.t++;
    const y = s.x < WP.beach ? WP.beachTop : WP.surf;
    if (s.t > 20 && s.t < SLICK_LIFE - 20 && pl.health > 0 && !pl.inCutscene && b.x < s.x + s.w / 2 && b.x + b.w > s.x - s.w / 2 && b.y < y + 10 && b.y + b.h > y - 16 && state.frame % 30 === 0 && pl.invincibilityTimer <= 0) hurtPlayer(ctx, DMG.slick, 'm2:wp3_slick', { x: 0, y: -3 }, 12);
    if (s.t > SLICK_LIFE) f.slicks.splice(i, 1);
  }
  // ---- him: his box, touching him (a shove), taking hits
  const gone = under(f);
  const gb = gupBox(f), e = f.e;
  if (!gone && f.st !== 'air' && f.st !== 'breach' && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene && b.x < gb.x + gb.w - 10 && b.x + b.w > gb.x + 10 && b.y < gb.y + gb.h && b.y + b.h > gb.y + 10) {
    hurtPlayer(ctx, DMG.touch, 'm2:wp3_gup', { x: Math.sign(cx - f.x || 1) * 7, y: -5 }, 20); shakeScreen(state, 5, 3);
  }
  e.pos.x = gb.x; e.pos.y = gb.y; e.width = gb.w; e.height = gb.h; e.vel.x = 0; e.vel.y = 0; e.facing = f.face;
  if (gone && state.enemies.includes(e)) state.enemies = state.enemies.filter(q => q !== e);
  if (!gone && !state.enemies.includes(e) && f.mode === 'on') state.enemies.push(e);
  takeHits(ctx, f, gone);
  return controls;
};
export const gupDead = (f: Fight3 | null) => !!f && f.mode === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poseOf = (f: Fight3): GupPose => {
  if (f.mode === 'intro') return f.intro === 'jump' ? 'crouch' : f.said ? 'talk' : 'chair';
  if (f.st === 'stun') return 'hurt';
  if (f.flash > 4 && (f.st === 'swim' || f.st === 'open')) return 'hurt';
  switch (f.st) {
    case 'whistle': return 'whistle';
    case 'blow': return 'blow';
    case 'hork': return 'hork';
    case 'spit': return 'spit';
    case 'crouch': return 'crouch';
    case 'air': return f.vy < 0 ? 'leap' : 'flop';
    case 'flopped': return 'flop';
    case 'sink': return 'dive';
    case 'breach': return 'breach';
    case 'open': return f.move === 'wave' ? 'hurt' : 'idle';
    default: return f.said ? 'talk' : Math.abs(f.vx) > 1.2 ? 'swim' : 'idle';
  }
};

/** World space, behind the water: him (the water's wash goes over his bottom half), the tells on the water. */
export const drawGup3 = (c: Ctx, state: GameState, f: Fight3) => {
  const fr = state.frame;
  if (f.mode === 'dead') return;
  // ---- the tells: the flop's shadow on the water, the breach's bubbles along the surface (ringing when set)
  if (f.st === 'air') {
    const k = Math.max(0.25, 1 - (FLOAT - f.y) / 300);
    c.globalAlpha = 0.25 + 0.4 * k; c.fillStyle = '#04121A'; c.beginPath(); c.ellipse(f.aim, WP.surf, 30 + 40 * k, 7, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    if (f.t >= 34) { c.fillStyle = fr % 6 < 3 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(f.aim - 40), WP.surf - 2, 80, 3); }
  }
  if (f.st === 'under' || f.st === 'set') {
    for (let k = 0; k < 5; k++) { const bx = f.aim - 20 + ((fr * 3 + k * 9) % 40), by = WP.surf - 3 - ((fr + k * 7) % 10); c.fillStyle = '#E0F2FE'; c.beginPath(); c.arc(bx, by, 3 + (k % 2), 0, Math.PI * 2); c.fill(); }
    if (f.st === 'set') { const r = 30 + (f.t % 16) * 2; c.strokeStyle = fr % 6 < 3 ? '#FDE047' : '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.aim, WP.surf, r, 6, 0, 0, Math.PI * 2); c.stroke(); }
  }
  if (under(f)) return;
  const alpha = f.iframes > 0 && Math.floor(f.iframes / 4) % 2 === 0 ? 0.7 : 1;
  drawGup(c, f.x, f.y, f.mode === 'intro' && f.intro !== 'jump' ? -1 : f.face, { pose: poseOf(f), q: 0, mouth: !!f.said }, fr, alpha);
};
/** World space, over the water: the crests, the globs, the slicks, his words. */
export const drawGupFront = (c: Ctx, state: GameState, f: Fight3) => {
  const fr = state.frame;
  for (const s of f.slicks) {
    const y = s.x < WP.beach ? WP.beachTop : WP.surf, k = Math.min(1, s.t / 20, (SLICK_LIFE - s.t) / 20);
    c.globalAlpha = 0.75 * Math.max(0, k); c.fillStyle = '#7AD03A'; c.beginPath(); c.ellipse(s.x, y, s.w / 2, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8F59A'; c.fillRect(Math.round(s.x - 14 + ((fr >> 2) % 10)), y - 2, 8, 2); c.globalAlpha = 1;
  }
  for (const g of f.globs) { c.fillStyle = '#06100A'; c.beginPath(); c.arc(g.x, g.y, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7AD03A'; c.beginPath(); c.arc(g.x, g.y, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E0FFB0'; c.fillRect(g.x - 3, g.y - 3, 3, 2); c.fillStyle = '#7AD03A'; c.fillRect(g.x - g.vx * 2, g.y - g.vy * 2, 4, 4); }
  for (const cr of f.crests) drawCrest(c, cr, fr);
  if (f.said && f.mode !== 'dead') {
    // (his words over him: kept on the screen even when he's off it (the taunts, from the deep end))
    const sx = Math.max(state.camera.x + 150, Math.min(state.camera.x + CANVAS_WIDTH - 150, f.x));
    saidOver(c, f.said, sx, Math.max(state.camera.y + 130, f.y - 190), '#BEF264', 280);
  }
};
/** A crest: a wall of water down the pool, curling over at the top, foam along it. */
const drawCrest = (c: Ctx, cr: Crest, fr: number) => {
  const beach = cr.x < WP.beach, base = beach ? WP.beachTop : WP.surf, h = (cr.big ? CREST.h : CREST.h * 0.6) * (beach ? 0.6 : 1);
  c.fillStyle = '#1E6A8A'; c.beginPath(); c.moveTo(cr.x + 60, base); c.quadraticCurveTo(cr.x + 20, base - h * 0.4, cr.x, base - h); c.quadraticCurveTo(cr.x - 22, base - h * 1.05, cr.x - 30, base - h * 0.7); c.lineTo(cr.x - 18, base); c.closePath(); c.fill();
  c.fillStyle = '#4AA8C8'; c.beginPath(); c.moveTo(cr.x + 44, base); c.quadraticCurveTo(cr.x + 14, base - h * 0.4, cr.x, base - h * 0.9); c.lineTo(cr.x - 6, base); c.closePath(); c.fill();
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F0F9FF' : '#BAE6FD'; c.fillRect(Math.round(cr.x - 30 + k * 6), Math.round(base - h * 0.95 + Math.sin(fr * 0.4 + k) * 3), 6, 4); }
};

/** Screen space: his bar in the top band; where he is when he's off the screen; the intro's letterbox, the gross-up, SKIP. */
export const drawGupHud = (c: Ctx, state: GameState, f: Fight3, band: { x1: number; x2: number; mid: number }) => {
  if (f.mode === 'intro') {
    if (f.intro === 'retry' || f.intro === 'jump') return;
    if (f.intro === 'gross') { drawGupGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT); drawGupGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6, 0.9 + 0.1 * Math.min(1, f.introT / 10), state.frame, f.introT % 40 < 18, f.introT < 16 ? 2 : 0); }
    const k = Math.min(1, f.skipT / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar);
    if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  if (f.mode !== 'on' || state.player.inCutscene) return;
  const w = band.x2 - band.x1, kk = Math.max(0, f.hp / GUP_HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * kk, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FFFFFF' : '#65A30D');
  for (let i = 1; i < 10; i++) box(c, Math.round(band.x1 + 2 + ((w - 4) * i) / 10), 24, 1, 10, '#18181B');
  label(c, L.GUP_NAME, band.mid, 48, '#BEF264', 7);
  // (off the screen: an arrow at the edge, toward him)
  const sx = f.x - state.camera.x;
  if (!under(f) && (sx > CANVAS_WIDTH + 20 || sx < -20)) {
    const right = sx > CANVAS_WIDTH, ax = right ? CANVAS_WIDTH - 22 : 22, ay = Math.max(70, Math.min(CANVAS_HEIGHT - 40, f.y - 60 - state.camera.y));
    c.fillStyle = '#06100A'; c.beginPath(); c.moveTo(ax + (right ? 14 : -14), ay); c.lineTo(ax - (right ? 8 : -8), ay - 12); c.lineTo(ax - (right ? 8 : -8), ay + 12); c.closePath(); c.fill();
    c.fillStyle = state.frame % 30 < 15 ? '#BEF264' : '#65A30D'; c.beginPath(); c.moveTo(ax + (right ? 10 : -10), ay); c.lineTo(ax - (right ? 5 : -5), ay - 8); c.lineTo(ax - (right ? 5 : -5), ay + 8); c.closePath(); c.fill();
  }
};
export { FLOAT };
