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
//               whenever one's there): snatches them up, sucks them dry (a husk drops), heals a lot, and then...
//   THE SPEW    ...hangs in the air and sprays the blood back out at Meathead like a machine gun: a stream of it, aimed,
//               the aim dragging after him (keep moving, jump it).
//
// Hurting him: most things barely do now (SHARE of the usual, a short breather after each hit). His weakness is the
// SOUVENIR LAUNCHER, and only one souvenir in its bag: CHRIST THE REDEEMER. That one stuns him (down out of the air,
// smoking, on his backside: the window) and takes a big chunk off. The rest of the bag hits him like anything else
// (SHARE). And any time one of the lesser souvenirs could finish him (at his health now, counting the ones already in
// the air), the launcher's next one out is always the Redeemer, and no lesser one ever does: a souvenir kill on
// Donnie is always the Redeemer's (the weakness death: the kill cam, and he burns up to a pile of ash).
//
// Two deaths: by the Redeemer (the weakness: the kill cam, a white flash, the cut in close, slow motion; he catches
// fire, flails, and crumbles to a pile of ash, his wig on top of it, the little statue standing in it); any other way,
// his powers go out and he drops out of the air in a belly flop, his trousers down round his ankles, rear up in his
// bat boxers, and the disco ball comes down on it. Satan takes his soul either way.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { say, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { ENEMY_HIT_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { setSouvenirPick, setSouvenirHit, souvenirMaxHit } from '../../weapons/souvenir';
import { drawPerson, lookOf } from '../../adventure/temple/people';
import { drawDonnie, drawLooseWig, DONNIE_H, type DonniePose } from '../../cast/donnie';
import { box, label, saidOver, hands, speak, voice, meatheadSays } from '../section';
import { GY } from '../geometry';
import { DRAIN, drawHusk } from './husk';
import { ARENA_L, ARENA_R, ARENA_MID, CIRCLE_X } from './arena';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** His health (Meathead 1's bosses'), and the enemy's (never runs out: the hits are taken off ours). */
const HP = 666, BIG = 100000;
/** Most weapons: this share of their usual damage gets through (at least 1), and a short breather after each hit. */
const SHARE = 0.35, IFRAMES = Math.round(ENEMY_HIT_COOLDOWN / 3);
/** The Redeemer: what it takes off him, how long he's down for. */
const REDEEMER_DMG = 150, REDEEMER_STUN = 150;
/** Hovering about between goes (frames, by phase); how high (feet above the floor). */
const HOVER_T = [0, 150, 115, 90], HOVER_UP = 190;
/** The grab: the tell, the swoop's length, how far past him it carries on. */
const AIM_T = [0, 40, 32, 26], DIVE_T = [0, 50, 44, 38], DIVE_PAST = 240;
/** Held: a drain every so often (his damage, Donnie's heal), let go after this long at most, or this many presses. */
const DRAIN_EVERY = 18, DRAIN_DMG = 5, DRAIN_HEAL = 8, DRAIN_MAX = 150, ESCAPE_PRESSES = 9;
/** The guests: how often one runs through (by phase), how fast; sucking one dry, how long and what it heals. */
const GUEST_EVERY = [0, 640, 520, 420], GUEST_SPEED = 3.4, SUCK_T = 90, GUEST_HEAL = 30;
/** The spew: the aim first, then the stream (by phase), a drop every so often, how hard, how fast; how fast his aim
 *  can follow Meathead (px a frame: about his walk, so standing still or walking straight away gets you hosed). */
const SPEW_AIM = 26, SPEW_T = [0, 60, 76, 92], SPEW_EVERY = 3, BLOOD_DMG = 4, BLOOD_SPEED = 8.5, AIM_FOLLOW = 3.6;
/** Satan's nags, Donnie's taunts: every so often (frames). */
const NAG_EVERY = 900, TAUNT_EVERY = 520;

/** Sources of hurt (each with its lines and its death screen). */
const BLOOD = 'm2:donnie_blood';
registerHurtLines(DRAIN, L.HURT_DRAIN, L.DEATH_DRAIN);
registerHurtLines(BLOOD, L.HURT_BLOOD, L.DEATH_BLOOD);

// ---------------------------------------------------------------------------------------------------------------
// The state

type Intro = 'plead' | 'reply' | 'open' | 'bestow' | 'rise' | 'powered' | 'soul' | 'panic' | 'mh' | 'close';
export type Mode = 'intro' | 'hover' | 'aim' | 'dive' | 'drain' | 'rise' | 'hunt' | 'suck' | 'spew' | 'stunned' | 'dead';

interface Guest { x: number; dir: 1 | -1; seed: number; state: 'run' | 'held' | 'fall' | 'husk'; y: number; vy: number; t: number; said: string | null; facing: 1 | -1 }
interface Drop { x: number; y: number; vx: number; vy: number }
interface Splat { x: number; w: number }
export interface KillCam { t: number; acc: number; z: number; out: boolean }

export interface Fight {
  hp: number; iframes: number; flash: number;
  mode: Mode; t: number; total: number;
  /** Where he is (his middle, his feet), how he's moving, which way he faces. */
  x: number; y: number; vx: number; vy: number; facing: 1 | -1;
  intro: Intro; introT: number; skipT: number;
  /** The circle in the floor (0 shut, 1 open), and him changed. */
  circle: number; powered: boolean;
  /** The swoop: its curve (from, the bottom of it at him, on past), how long. */
  dive: { ax: number; ay: number; cx: number; cy: number; bx: number; by: number; d: number } | null;
  held: { t: number; presses: number; was: Controls } | null;
  guests: Guest[]; guestT: number; prey: Guest | null;
  drops: Drop[]; splats: Splat[]; aimX: number; aimY: number;
  stunT: number; side: 1 | -1;
  said: string | null; satanSaid: string | null; nagT: number; tauntT: number;
  /** What a souvenir did to him this frame (the launcher tells us: its hit hook). */
  souvenir: { id: string } | null;
  /** The last of Meathead's moves that landed on him. */
  moveSeen: number | undefined;
  death: { how: 'flat' | 'burn'; t: number; x: number; y: number; vy: number; facing: 1 | -1; land: number } | null;
  deathSaid: number;
  cam: KillCam | null;
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
const lesserMax = (all: readonly { id: string; dmg: number }[]) => Math.max(0, ...all.filter(t => t.id !== 'redeemer').map(t => Math.max(1, souvenirMaxHit(t.dmg) * SHARE)));
setSouvenirPick(all => {
  const f = live;
  if (!f || !game || f.mode === 'dead' || f.mode === 'intro') return null;
  // (counting the lesser ones already in the air: any of them could land too)
  let inAir = 0;
  for (const p of game.projectiles) {
    if (p.custom !== 'SOUVENIR') continue;
    const t = (p.customData as { t?: { id: string; dmg: number } } | undefined)?.t;
    if (t && t.id !== 'redeemer') inAir += Math.max(1, souvenirMaxHit(t.dmg) * SHARE);
  }
  return f.hp <= lesserMax(all) + inAir ? 'redeemer' : null;
});
setSouvenirHit((e, id) => { if (live && e === live.e) live.souvenir = { id }; });

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
});

// ---------------------------------------------------------------------------------------------------------------
// Saying things

/** A bark: dropped if somebody's talking. */
const bark = (f: Fight, lines: L.ByPants) => {
  const text = pick(lines[pants()]);
  say(text, voice('m2.donnie'), 'casual', {
    always: true,
    onShow: spoken => { f.said = text; if (!spoken) setTimeout(() => { if (f.said === text) f.said = null; }, Math.max(1600, text.length * 65)); },
    onHide: () => { if (f.said === text) f.said = null; },
  });
};
const satanBark = (f: Fight, lines: L.ByPants) => {
  const text = pick(lines[pants()]);
  say(text, voice('m2.satan'), 'casual', {
    always: true,
    onShow: spoken => { f.satanSaid = text; if (!spoken) setTimeout(() => { if (f.satanSaid === text) f.satanSaid = null; }, Math.max(1800, text.length * 65)); },
    onHide: () => { if (f.satanSaid === text) f.satanSaid = null; },
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
    intro: 'plead', introT: 0, skipT: 0, circle: 0, powered: false, dive: null, held: null,
    guests: [], guestT: 0, prey: null, drops: [], splats: [], aimX: 0, aimY: 0, stunT: 0, side: -1,
    said: null, satanSaid: null, nagT: 0, tauntT: 0, souvenir: null, moveSeen: e.hitByMove,
    death: null, deathSaid: 0, cam: null, wigOff: null, e,
  };
  live = f;
  state.player.inCutscene = true;
  line(f, 'donnie', L.DONNIE_PLEAD, () => { f.intro = 'reply'; f.introT = 0; meatheadSays(state, pick(L.MEATHEAD_INTRO), true, tokened(() => { f.intro = 'open'; f.introT = 0; })); });
  return f;
};
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
      if (t >= 80) { f.intro = 'bestow'; f.introT = 0; line(f, 'satan', L.SATAN_BESTOW, () => { f.intro = 'rise'; f.introT = 0; }); }
      break;
    case 'rise':
      // (up out of his corner, changed: lifted, the flash, the wings out)
      f.y = GY - Math.min(1, t / 70) * HOVER_UP;
      f.x += (ARENA_MID + 140 - f.x) * 0.03;
      if (t === 36) { f.powered = true; playSound('thunder', 1, -2); playSound('roar', 0.7, 4); shakeScreen(state, 14, 8); }
      if (t >= 80) { f.intro = 'powered'; f.introT = 0; line(f, 'donnie', L.DONNIE_POWERED, () => { f.intro = 'soul'; f.introT = 0; line(f, 'satan', L.SATAN_SOUL, () => { f.intro = 'panic'; f.introT = 0; line(f, 'donnie', L.DONNIE_SATAN_PANIC, () => { f.intro = 'mh'; meatheadSays(state, pick(L.MEATHEAD_SATAN), true, tokened(() => { f.intro = 'close'; f.introT = 0; })); }); }); }); }
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
const beginFight = (state: GameState, f: Fight) => {
  token++;
  f.said = null; f.satanSaid = null;
  f.powered = true; f.circle = 0;
  if (f.y > GY - HOVER_UP + 20) { f.y = GY - HOVER_UP; f.x = ARENA_MID + 140; }
  to(f, 'hover'); f.nagT = NAG_EVERY - 300; f.tauntT = 120; f.guestT = 0;
  state.player.inCutscene = false;
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
  // (half gone: the wig comes off, and stays off)
  if (!f.wigOff && f.hp < HP / 2 && f.mode !== 'dead') { f.wigOff = { x: f.x, y: f.y - 90, vy: -4 }; playSound('whoosh', 0.5, 8); }
  if (f.wigOff && f.wigOff.y < GY - 4) { f.wigOff.vy += 0.4; f.wigOff.y = Math.min(GY - 4, f.wigOff.y + f.wigOff.vy); }
  guests(ctx, f);
  switch (f.mode) {
    case 'hover': {
      // (about over the floor, off to one side of him, bobbing; showing off; Satan on at him about the soul)
      const px = pmid(state).x;
      const hx = Math.max(ARENA_L + 90, Math.min(ARENA_R - 90, px + f.side * 210)), hy = GY - HOVER_UP + Math.sin(f.total * 0.05) * 14;
      f.vx = (f.vx + (hx - f.x) * 0.012) * 0.9; f.vy = (f.vy + (hy - f.y) * 0.02) * 0.88;
      f.x += f.vx; f.y += f.vy;
      faceHim(state, f);
      if (++f.tauntT >= TAUNT_EVERY) { f.tauntT = Math.floor(Math.random() * 120); bark(f, L.DONNIE_TAUNT); }
      if (++f.nagT >= NAG_EVERY) { f.nagT = Math.floor(Math.random() * 200); satanBark(f, L.SATAN_NAG); }
      // (a guest in the room: he can't help himself)
      const prey = f.guests.find(g => g.state === 'run' && g.x > ARENA_L + 40 && g.x < ARENA_R - 40);
      if (prey && f.t > 30) { f.prey = prey; to(f, 'hunt'); bark(f, L.DONNIE_SNATCH); playSound('whoosh', 0.8, -4); break; }
      if (f.t >= HOVER_T[ph]) { to(f, 'aim'); f.side = f.side > 0 ? -1 : 1; }
      break;
    }
    case 'aim':
      // (the tell: hanging there, wings wide, eyes flaring, a screech)
      faceHim(state, f); f.vx *= 0.8; f.vy *= 0.8; f.x += f.vx; f.y += f.vy;
      if (f.t === 1) { playSound('screams', 0.35, 10); if (Math.random() < 0.6) bark(f, L.DONNIE_DIVE); }
      if (f.t >= AIM_T[ph]) {
        const m = pmid(state), tx = m.x, ty = Math.min(GY, m.y + 45);
        const bx = Math.max(ARENA_L + 60, Math.min(ARENA_R - 60, tx + f.facing * DIVE_PAST)), by = GY - HOVER_UP;
        // (a curve from him, through him at the bottom, back up the far side)
        f.dive = { ax: f.x, ay: f.y, cx: 2 * tx - (f.x + bx) / 2, cy: 2 * ty - (f.y + by) / 2, bx, by, d: DIVE_T[ph] };
        to(f, 'dive'); playSound('whoosh', 1, -4);
      }
      break;
    case 'dive': {
      const d = f.dive!, s = Math.min(1, f.t / d.d), u = 1 - s;
      const nx = u * u * d.ax + 2 * u * s * d.cx + s * s * d.bx, ny = u * u * d.ay + 2 * u * s * d.cy + s * s * d.by;
      f.vx = nx - f.x; f.vy = ny - f.y; f.x = nx; f.y = Math.min(GY, ny);
      if (Math.abs(f.vx) > 0.3) f.facing = f.vx < 0 ? -1 : 1;
      if (state.frame % 2 === 0) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: -f.vx * 0.2, y: -f.vy * 0.2 }, life: 14, color: 'rgba(127, 29, 29, 0.6)', size: 6 });
      // (his claws on him: got him)
      const m = pmid(state), p = state.player;
      if (canHurtHim(state) && p.invincibilityTimer <= 0 && Math.abs(m.x - f.x) < 34 && Math.abs(m.y - (f.y - 46)) < 46) { grab(state, f, controls); break; }
      if (s >= 1) { f.dive = null; to(f, 'hover'); }
      break;
    }
    case 'drain': out = drain(ctx, f, controls); break;
    case 'rise':
      f.vy = (f.vy + (GY - HOVER_UP - f.y) * 0.03) * 0.85; f.y += f.vy; f.x += f.vx; f.vx *= 0.92;
      if (f.t > 40) to(f, 'hover');
      break;
    case 'hunt': {
      // (down on the guest, fast)
      const g = f.prey;
      if (!g || g.state !== 'run' || g.x < ARENA_L - 20 || g.x > ARENA_R + 20) { f.prey = null; to(f, 'rise'); break; }
      const tx = g.x - g.dir * 6, ty = GY - 8, dx = tx - f.x, dy = ty - f.y, dist = Math.hypot(dx, dy) || 1;
      const sp = Math.min(dist, 9.5);
      f.x += (dx / dist) * sp; f.y += (dy / dist) * sp; f.facing = dx < 0 ? -1 : 1;
      if (dist < 16) { g.state = 'held'; g.t = 0; to(f, 'suck'); playSound('crunch', 0.8); playSound('screams', 0.6, 4); }
      break;
    }
    case 'suck': {
      // (up off the floor with them, the fangs in, them going gray and thin; a husk drops)
      const g = f.prey!;
      f.y += (GY - 40 - f.y) * 0.08;
      g.t++;
      if (f.t % 14 === 0) { playSound('suck', 0.5, 2); state.particles.push({ pos: { x: f.x + f.facing * 14, y: f.y - 70 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 }, life: 20, color: '#B91C1C', size: 3, grav: 0.3 }); }
      if (f.t >= SUCK_T) {
        g.state = 'fall'; g.vy = -1; g.y = f.y - 30; g.facing = f.facing;
        f.hp = Math.min(HP, f.hp + GUEST_HEAL); f.prey = null;
        playSound('crumble', 0.8);
        to(f, 'spew'); f.aimX = pmid(state).x; f.aimY = pmid(state).y;
        bark(f, L.DONNIE_SPEW);
      }
      break;
    }
    case 'spew': {
      // (up into the air; the aim; then the stream, the aim dragging after him)
      f.vy = (f.vy + (GY - 170 - f.y) * 0.03) * 0.85; f.y += f.vy;
      faceHim(state, f);
      const m = pmid(state);
      f.aimX += Math.max(-AIM_FOLLOW, Math.min(AIM_FOLLOW, m.x - f.aimX)); f.aimY += Math.max(-AIM_FOLLOW, Math.min(AIM_FOLLOW, m.y - f.aimY));
      if (f.t > SPEW_AIM && f.t % SPEW_EVERY === 0) {
        const mx = f.x + f.facing * 14, my = f.y - 74, dx = f.aimX - mx, dy = f.aimY - my, dd = Math.hypot(dx, dy) || 1;
        f.drops.push({ x: mx, y: my, vx: (dx / dd) * BLOOD_SPEED + (Math.random() - 0.5) * 0.6, vy: (dy / dd) * BLOOD_SPEED + (Math.random() - 0.5) * 0.6 });
        if (f.t % 6 === 0) playSound('gush', 0.25, 6 + Math.random() * 4);
      }
      if (f.t >= SPEW_AIM + SPEW_T[ph]) to(f, 'hover');
      break;
    }
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
  if (Math.random() < 0.7) bark(f, L.DONNIE_DRAIN);
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
    playSound('suck', 0.6, 4);
    for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + f.facing * -4, y: p.pos.y + 14 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() }, life: 22, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.3 });
  }
  const dead = p.health <= 0 || state.deathTimer > 0;
  if (dead || h.presses >= ESCAPE_PRESSES || h.t >= DRAIN_MAX) {
    const escaped = !dead && h.presses >= ESCAPE_PRESSES;
    f.held = null;
    if (!dead) { p.vel.x = -f.facing * 6; p.vel.y = -6; p.invincibilityTimer = Math.max(p.invincibilityTimer, 50); }
    if (escaped) { bark(f, L.DONNIE_ESCAPED); f.vx = f.facing * -3; playSound('punch', 0.6, -2); }
    to(f, 'rise'); f.vy = -4;
    return controls;
  }
  return hands();
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
    say(text, voice(lookOf(g.seed).woman ? 'm2.guest' : 'm2.guest2'), 'casual', {
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

const updateDrops = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx, p = state.player;
  f.drops = f.drops.filter(d => {
    d.x += d.vx; d.y += d.vy; d.vy += 0.08;
    if (d.y >= GY - 2) { if (f.splats.length < 60) f.splats.push({ x: d.x, w: 4 + Math.random() * 6 }); return false; }
    if (d.x < ARENA_L - 40 || d.x > ARENA_R + 40) return false;
    const top = p.pos.y + (p.isDucking || p.isSliding ? 28 : 0);
    if (canHurtHim(state) && p.invincibilityTimer <= 0 && f.mode !== 'drain' && d.x > p.pos.x - 3 && d.x < p.pos.x + p.width + 3 && d.y > top && d.y < p.pos.y + p.height) {
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
  f.moveSeen = e.hitByMove;
  const sv = f.souvenir; f.souvenir = null;
  if (f.mode === 'dead' || dealt <= 0 || !state.enemies.includes(e)) return;
  // The Redeemer: down he goes, and it hurts (no breather can stop it)
  if (sv?.id === 'redeemer') {
    f.hp -= REDEEMER_DMG; f.flash = 16; f.iframes = IFRAMES;
    playSound('ding', 1, 6); playSound('crack', 0.8, -4); shakeScreen(state, 10, 5);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: f.x, y: f.y - 50 }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 4 }, life: 30, color: ['#FEF9C3', '#FDE047', '#ECFCCB', '#FFFFFF'][i % 4], size: 2 + Math.random() * 3, grav: 0.15 });
    if (f.hp <= 0) { f.hp = 0; die(ctx, f, true); return; }
    stun(state, f);
    bark(f, L.DONNIE_REDEEMER);
    return;
  }
  if (f.iframes > 0) return;
  let dmg = Math.max(1, dealt * SHARE);
  // (a lesser souvenir never finishes him: a souvenir kill on him is the Redeemer's, always)
  if (sv && f.hp - dmg <= 0) dmg = Math.max(0, f.hp - 1);
  f.hp -= dmg; f.iframes = IFRAMES; f.flash = 8;
  ctx.fx.spawnDamageNumber({ x: f.x - 10, y: f.y - 90 }, Math.max(1, Math.round(dmg)), false);
  if (f.hp > 0 && Math.random() < 0.18) bark(f, L.DONNIE_HURT);
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
  f.drops = []; f.dive = null;
  if (f.held) { f.held = null; state.player.vel.y = -4; }
  if (f.prey) { f.prey.state = 'run'; f.prey.y = GY; f.prey = null; }
  state.enemies = state.enemies.filter(o => o !== e);
  f.death = { how: redeemer ? 'burn' : 'flat', t: 0, x: f.x, y: f.y, vy: 0, facing: f.facing, land: f.y >= GY - 1 ? 1 : 0 };
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
  if (d.how === 'flat') {
    // (the powers out: the eyes go dark, down he drops, flailing; a belly flop; the trousers down; the disco ball)
    if (d.y < GY) { d.vy += 0.5; d.y = Math.min(GY, d.y + d.vy); if (d.y >= GY) { playSound('thud', 1.2, -6); playSound('splat', 0.6, -4); shakeScreen(state, 12, 6); d.land = t; } }
    if (d.land && t === d.land + 70) { playSound('whoosh', 0.6, 6); }
    if (d.land && t === d.land + 90) { playSound('bonk', 1, -2); playSound('glass', 0.5, 2); shakeScreen(state, 6, 3); }
    if (d.land && t === d.land + 150) playSound('fart', 0.8, -2);
  } else {
    // (alight: flailing, then down, then ash)
    if (d.y < GY) { d.vy += 0.3; d.y = Math.min(GY, d.y + d.vy); }
    if (t % 5 === 0 && t < 150) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 30, y: d.y - Math.random() * 80 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1.5 - Math.random() * 2 }, life: 30, color: ['#FDE047', '#F97316', '#DC2626'][t % 3], size: 3 + Math.random() * 4, grav: -0.05 });
    if (t === 100) playSound('crumble', 1, -4);
    if (f.cam && t > 170) f.cam.out = true;
  }
  // (Satan takes what's his, then Meathead has his say; then it's over)
  if (f.deathSaid === 1 && t > 160) { f.deathSaid = 2; f.circle = 0.001; line(f, 'satan', L.SATAN_CLAIM, () => { f.deathSaid = 3; meatheadSays(state, pick(d.how === 'burn' ? L.MEATHEAD_WON_WEAK : L.MEATHEAD_WON), true, tokened(() => { f.deathSaid = 4; })); }); }
  if (f.deathSaid >= 2 && f.deathSaid < 4) f.circle = Math.min(0.6, f.circle + 0.02);
  if (f.deathSaid >= 4) f.circle = Math.max(0, f.circle - 0.03);
  // (it never hangs)
  if (t > 1500) f.deathSaid = 4;
};

/** Done with: his death played out, everybody's had their say. */
export const fightOver = (f: Fight) => f.mode === 'dead' && !!f.death && f.deathSaid >= 4 && f.death.t > 260 && (!f.cam || f.cam.z <= 1);
export const endFight = (state: GameState, f: Fight) => { state.player.inCutscene = false; f.drops = []; live = null; };
export const killedByWeakness = (f: Fight) => f.death?.how === 'burn';

/** The enemy, where he is (in the world while it's on; out of it for the intro and after). */
const sync = (state: GameState, f: Fight) => {
  const e = f.e;
  e.pos.x = f.x - e.width / 2; e.pos.y = f.y - e.height - 2;
  e.vel.x = 0; e.vel.y = 0; e.facing = f.facing; e.initialY = e.pos.y;
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
const LOOK = (f: Fight) => ({ wig: !f.wigOff, cape: true, fangs: !f.powered, powered: f.powered });

const poseOf = (f: Fight): DonniePose => {
  if (f.flash > 0 && f.mode !== 'drain' && f.mode !== 'stunned') return 'hurt';
  switch (f.mode) {
    case 'intro':
      if (f.intro === 'plead' || f.intro === 'reply' || f.intro === 'open' || f.intro === 'bestow') return 'cower';
      if (f.intro === 'rise') return f.introT < 36 ? 'summon' : 'fly';
      if (f.intro === 'panic') return 'panic';
      return 'fly';
    case 'drain': case 'suck': return 'bite';
    case 'spew': return f.t > SPEW_AIM ? 'spew' : 'fly';
    case 'stunned': return 'stunned';
    case 'aim': return 'summon';
    case 'hunt': case 'dive': return 'lunge';
    default: return 'fly';
  }
};

/** The circle in the floor: a ring of fire, the light up out of it, him in the light (horns, eyes). World space. */
const drawCircle = (c: Ctx, k: number, fr: number) => {
  if (k <= 0) return;
  const x = CIRCLE_X, rx = 110 * k, ry = 16 * k;
  // (the light up out of it: stepped columns)
  for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(220, 38, 38, ${(0.07 * (4 - i) * k).toFixed(3)})`; c.fillRect(Math.round(x - rx * (0.4 + i * 0.2)), GY - 420, Math.round(rx * 2 * (0.4 + i * 0.2)), 420); }
  // (him, in it: the horns, the eyes, enormous and faint)
  if (k > 0.5) {
    const a = (k - 0.5) * 2 * (0.7 + 0.3 * Math.sin(fr * 0.05));
    c.fillStyle = `rgba(20, 0, 0, ${(0.55 * a).toFixed(2)})`;
    c.beginPath(); c.ellipse(x, GY - 250, 90, 110, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 50, GY - 320); c.quadraticCurveTo(x + s * 110, GY - 380, x + s * 80, GY - 420); c.quadraticCurveTo(x + s * 80, GY - 360, x + s * 30, GY - 330); c.closePath(); c.fill(); }
    c.fillStyle = `rgba(253, 224, 71, ${(0.9 * a).toFixed(2)})`;
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * 34, GY - 270, 16, 6, s * 0.25, 0, Math.PI * 2); c.fill(); }
  }
  // (the ring: the hole, the fire round its edge)
  c.fillStyle = '#0A0000'; c.beginPath(); c.ellipse(x, GY, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(x, GY, rx * 0.8, ry * 0.7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(x, GY, rx * 0.5, ry * 0.45, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, fx = x + Math.cos(a) * rx, fy = GY + Math.sin(a) * ry, h = (10 + 8 * Math.sin(fr * 0.4 + i * 1.7)) * k;
    box(c, fx - 3, fy - h, 6, h, i % 2 ? '#F97316' : '#FDE047');
  }
};

/** World space, behind him: the circle, the blood on the floor, the husks, the wig once it's off. */
export const drawFightBack = (c: Ctx, state: GameState, f: Fight) => {
  for (const s of f.splats) { c.fillStyle = '#7F1D1D'; c.fillRect(Math.round(s.x - s.w / 2), GY - 1, Math.round(s.w), 3); }
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
      c.fillStyle = `rgba(120, 104, 80, ${(0.7 * k).toFixed(2)})`; c.fillRect(-16, -82, 32, 82);
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
    if (f.mode === 'spew' && f.t > SPEW_AIM) { const mx = f.x + f.facing * 14, my = f.y - 74; c.fillStyle = '#B91C1C'; for (let i = 0; i < 3; i++) c.fillRect(Math.round(mx + f.facing * i * 3) - 2, Math.round(my - 1 + Math.sin(fr + i)), 4, 3); }
    // (stunned: the little statue's halo of stars over him)
    if (f.mode === 'stunned') for (let i = 0; i < 4; i++) { const a = fr * 0.12 + i * 1.57; box(c, f.x + Math.cos(a) * 22 - 2, f.y - 80 + Math.sin(a) * 5 - 2, 4, 4, i % 2 ? '#FDE047' : '#ECFCCB'); }
  }
  // The blood in the air
  for (const d of f.drops) { box(c, d.x - 3, d.y - 2, 6, 4, '#7F1D1D'); box(c, d.x - 2, d.y - 1.5, 4, 3, '#DC2626'); }
  // His words; Satan's (up over the room, out of nowhere, red)
  if (f.said) saidOver(c, f.said, f.mode === 'dead' && f.death ? f.death.x : f.x, (f.mode === 'dead' && f.death ? f.death.y : f.y) - DONNIE_H - 16, '#FDE68A');
  if (f.satanSaid) saidOver(c, f.satanSaid, CIRCLE_X, GY - 330, '#F87171', 300);
};

/** His two deaths, drawn. */
const drawDeath = (c: Ctx, f: Fight, fr: number) => {
  const d = f.death!, t = d.t;
  if (d.how === 'flat') {
    if (d.y < GY) { drawDonnie(c, d.x, d.y, d.facing, fr, 'hurt', 1, { cape: true, wig: !f.wigOff }); return; }
    // Face down, rear up, trousers round his ankles, the bat boxers; the disco ball down on him and off again
    const lt = d.land ? t - d.land : 0;
    const bounce = lt < 12 ? Math.sin((lt / 12) * Math.PI) * 0.1 : 0;
    c.save(); c.translate(d.x, GY - 22); c.rotate(d.facing * (Math.PI / 2 + 0.25 - bounce));
    drawDonnie(c, 0, 22, d.facing, fr, 'dead', 1, { cape: true, wig: !f.wigOff, pantsDown: lt > 20 });
    c.restore();
    // (the disco ball: down on its snapped wire, onto his rear, a bonk, off and rolling)
    if (lt > 60) {
      const k = Math.min(1, (lt - 60) / 30), rx = d.x - d.facing * 26;
      const by = lt < 90 ? 60 + (GY - 60 - 40) * k * k : GY - 40 - Math.max(0, Math.sin(((lt - 90) / 20) * Math.PI)) * 30 * (lt < 110 ? 1 : 0) + (lt >= 110 ? 26 : 0);
      const roll = Math.sign(ARENA_MID - rx) || 1, bx = lt < 110 ? rx : rx + roll * Math.min(140, (lt - 110) * 2);
      const by2 = lt >= 110 ? GY - 14 : by;
      c.fillStyle = '#1A0B06'; c.beginPath(); c.arc(bx, by2, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(bx, by2, 14, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 12; i++) box(c, bx - 12 + (i % 4) * 6, by2 - 10 + Math.floor(i / 4) * 6, 4, 4, (i + Math.floor(fr / 6)) % 3 ? '#E4E4E7' : '#FFFFFF');
    }
    // (the last one out of him)
    if (lt > 150 && lt < 260) { const s = (lt - 150) / 110; c.fillStyle = `rgba(163, 190, 60, ${(0.5 * (1 - s)).toFixed(2)})`; c.beginPath(); c.arc(d.x - d.facing * 30, GY - 40 - s * 30, 6 + s * 20, 0, Math.PI * 2); c.fill(); }
    return;
  }
  // Burning up: alight and flailing; down; to a pile of ash, the wig on top, the little statue standing in it
  const k = Math.min(1, Math.max(0, (t - 90) / 70));
  if (k < 1) {
    c.save();
    // (sinking into the pile as he goes)
    c.beginPath(); c.rect(d.x - 80, d.y - 200, 160, 200 - 70 * k); c.clip();
    c.translate(0, 70 * k);
    drawDonnie(c, d.x + Math.sin(t * 0.7) * 3 * (1 - k), d.y, d.facing, fr, t < 90 ? 'panic' : 'hurt', 1, { cape: true, wig: !f.wigOff, powered: t < 40 });
    // (charring: black over him, stepped, from the feet up)
    for (let i = 0; i < 8; i++) if (t / 12 > i) { c.fillStyle = 'rgba(20, 12, 8, 0.45)'; c.fillRect(d.x - 30, d.y - (i + 1) * 12, 60, 12); }
    c.restore();
    for (let i = 0; i < 6; i++) { const h = 20 + 16 * Math.abs(Math.sin(fr * 0.3 + i)); box(c, d.x - 30 + i * 11, d.y - 40 - h * (1 - k * 0.5), 8, h, ['#F97316', '#FDE047', '#DC2626'][i % 3]); }
  }
  // (the pile)
  const pile = Math.min(1, t / 140);
  c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(d.x, GY, 34 * pile + 2, 16 * pile + 1, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#57534E'; c.beginPath(); c.ellipse(d.x, GY, 32 * pile, 14 * pile, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#78716C'; c.beginPath(); c.ellipse(d.x - 6, GY - 2, 18 * pile, 8 * pile, 0, Math.PI, 0); c.fill();
  if (t > 150) {
    drawLooseWig(c, d.x + 6, GY - 16 * pile - 2, fr, 0.9, 0.2);
    // (the little statue, glowing, arms out, standing in the ash)
    const gx = d.x - 18, gy = GY - 10;
    c.fillStyle = 'rgba(217, 249, 157, 0.35)'; c.beginPath(); c.arc(gx, gy - 12, 14, 0, Math.PI * 2); c.fill();
    box(c, gx - 2, gy - 18, 4, 16, '#D9F99D'); box(c, gx - 9, gy - 16, 18, 3, '#D9F99D'); box(c, gx - 2, gy - 23, 4, 4, '#ECFCCB');
    // (the name tag, come down on the pile)
    box(c, d.x + 14, GY - 8, 12, 7, '#FFFFFF'); box(c, d.x + 14, GY - 8, 12, 2, '#DC2626');
  }
  if (t > 160) for (let i = 0; i < 3; i++) { const u = ((fr + i * 30) % 90) / 90; c.fillStyle = `rgba(160, 160, 160, ${(0.4 * (1 - u)).toFixed(2)})`; c.beginPath(); c.arc(d.x - 10 + i * 10, GY - 20 - u * 50, 3 + u * 8, 0, Math.PI * 2); c.fill(); }
};

/** Screen space: his bar, in the top band clear of the HUD. */
export const drawFightHud = (c: Ctx, f: Fight, band: { x1: number; x2: number; mid: number }, inCutscene: boolean) => {
  if (inCutscene || f.mode === 'dead' || f.mode === 'intro') return;
  const w = band.x2 - band.x1, k = Math.max(0, f.hp / HP);
  box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, f.iframes > 0 && Math.floor(f.iframes / 4) % 2 ? '#FCA5A5' : '#DC2626');
  label(c, 'DONNIE DRACULA', band.mid, 50, '#FCA5A5', 7);
};
/** The intro's skippable (for the stage's skip prompt). */
export const introOn = (f: Fight) => f.mode === 'intro';
export const introSkipT = (f: Fight) => f.skipT;
