// THE BASEMENT: XENOSCARE's maintenance tunnels, in the dark, and the queen hunting him through them (a chase, not a
// fight). He came down through the floor she smashed (show.ts).
//
//   THE DARK      a tight light round him, a flickering emergency strip here and there, the rest near black. The hum,
//                 drips, a hiss in the pipes, her screech far off (the stage's own sounds).
//   HER           silent (screeches, clicks, hydraulics: no words). She comes in ENCOUNTERS, each told first (her clicks
//                 coming, a screech, or her silhouette crawling past along the pipes in the FOREGROUND), then down out
//                 of a ceiling vent and along the tunnel (prowling, sniffing at a spot), and back up a vent. She sees
//                 him if he's in front of her and near (or right on her); she HEARS him (shooting, jumping, landing,
//                 charging are loud; walking's quiet; standing still, nothing): loud enough with her about, she comes to
//                 it; loud enough with her away, she comes down for a look. Seen, she runs him down. Touched: one shot
//                 (she grabs him up, her inner jaws out into his head: a hurt of its own, its own lines).
//   HIDING        the cast members' lockers and dark corners: hold up at one and he's in (peeking out through the
//                 slats, his heartbeat). In, she goes right by. In with her on him (seen, and close), she finds him.
//   WEAPONS       go through her (nothing down here hurts her); they're loud.
//   THE TEACHING  the first: her silhouette over the pipes ahead, then down out of a vent ahead and walking his way,
//                 slowly, with a locker right there. Then from behind; then a sniff at a spot; then a double pass; then
//                 she's after him for real and it's a run for the disco's door (or a locker), and he kicks it in.
//
// Kept across his deaths: nothing of hers (a death's back at the checkpoint with the encounters past it done); the
// door, once kicked in, stays in.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import type { Block } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { setUi } from '../../store';
import { hands, meatheadSays, box, label } from '../section';
import { ink } from '../../../m1/game/render/npc/kit';
import { stamp } from '../../../m1/game/render/stamp';
import { GY } from '../geometry';
import { BASE_L, BASE_R, DOOR_X, DISCO_L } from './geo';
import { drawQueen } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const B = BASE_L;
/** The basement's ceiling (its underside). */
export const CEIL_B = GY - 330;
/** The checkpoint half way (the graveyard). */
export const GRAVEYARD_CP = 72;

/** Her one-shot (the grab, the inner jaw), its lines; the body after: the death screen's. */
const JAW = 'm2:sp_queen_jaw';
registerHurtLines(JAW, L.HURT_JAW, L.DEATH_JAW);
registerDeathKind(JAW, 'impaled');

/** Kept across his deaths: the disco's door is in. */
export const DOOR_MEMO = 'm2:space:discoDoor';

// ---------------------------------------------------------------------------------------------------------------
// The layout

/** Where he can hide: the cast members' lockers, dark corners (the graveyard's junk). */
export const HIDES: { x: number; kind: 'locker' | 'dark' }[] = [
  { x: B + 780, kind: 'locker' }, { x: B + 1500, kind: 'locker' }, { x: B + 2300, kind: 'locker' }, { x: B + 3080, kind: 'dark' },
  { x: B + 3520, kind: 'locker' }, { x: B + 4300, kind: 'locker' }, { x: B + 4880, kind: 'dark' }, { x: B + 5420, kind: 'locker' },
];
/** The emergency strips (flickering), along the tunnel. */
export const STRIPS = [B + 420, B + 1180, B + 1960, B + 2640, B + 3300, B + 4080, B + 4600, B + 5150, B + 5700];

/** Her visits: where he sets one off (`at`), the tell (her silhouette over the pipes in front, or a screech behind),
 *  the vent she comes down out of, her way along (`stop`: frames she stands sniffing at that point), how fast; the
 *  last, she's after him from the off (`hunt`). */
interface Encounter { at: number; fg: boolean; from: number; path: { x: number; stop?: number }[]; speed: number; hunt?: boolean }
const ENCOUNTERS: Encounter[] = [
  // (teaching: ahead of him, coming his way slowly, a locker right there)
  { at: B + 620, fg: true, from: B + 1380, path: [{ x: B + 120 }], speed: 1.4 },
  // (from behind)
  { at: B + 1750, fg: false, from: B + 980, path: [{ x: B + 2760 }], speed: 1.7 },
  // (the graveyard: she stops and sniffs about, right by the dark corner)
  { at: B + 2860, fg: true, from: B + 3720, path: [{ x: B + 3160, stop: 150 }, { x: B + 2420 }], speed: 1.6 },
  // (there and back: a double pass)
  { at: B + 4000, fg: false, from: B + 4760, path: [{ x: B + 3640, stop: 60 }, { x: B + 5260 }], speed: 1.9 },
  // (after him for real: run for the disco's door, or a locker if she's not on him yet)
  { at: B + 5250, fg: true, from: B + 4420, path: [{ x: B + 5800 }], speed: 3.0, hunt: true },
];

// ---------------------------------------------------------------------------------------------------------------
// The state

type Mode = 'away' | 'tell' | 'drop' | 'prowl' | 'hunt' | 'search' | 'climb' | 'kill';
export interface Hunter {
  /** Set up against where he really is (the first frame: the checkpoint's put him there after the build). */
  init: boolean;
  mode: Mode; t: number; x: number; dir: 1 | -1; speed: number;
  /** Where she's going (the encounter's points), which she's at, how long she's stood sniffing. */
  path: { x: number; stop?: number }[]; leg: number; sniff: number;
  enc: number; done: Set<number>;
  /** The foreground pass (screen space: its x across, which way, how far through). */
  fg: { t: number; dir: 1 | -1 } | null;
  /** His noise (decays); a quiet spell before she'll come down for a look on her own. */
  noise: number; cool: number; lastX: number;
  /** He's hidden (in which spot), and since when; she found him. */
  hid: number; hidT: number; heart: number;
  /** He was hidden while she went by close: his say once she's gone. */
  passedClose: boolean;
  /** Said: the dark, the first sighting, the useless gun; when he last said something in hiding. */
  saidDark: boolean; saidSpot: boolean; saidGun: boolean; hideSaidAt: number;
  /** The door: shut, being kicked (the frames), in. */
  door: 'shut' | 'kicking' | 'in'; doorT: number; block: Block | null;
  wasGrounded: boolean; lastVy: number; lastShoot: boolean; lastJump: boolean; lastMove: boolean;
  /** This life's one free loud thing (a shot or a charge move): nothing hears it; he catches himself. */
  warned: boolean; freeMove: boolean;
}
export const makeHunter = (state: GameState): Hunter => {
  const cx = state.player.pos.x + state.player.width / 2;
  const done = new Set<number>();
  // (back at a checkpoint: what's behind him is done with)
  ENCOUNTERS.forEach((e, i) => { if (e.at < cx - 50) done.add(i); });
  return {
    init: false, mode: 'away', t: 0, x: 0, dir: -1, speed: 1.5, path: [], leg: 0, sniff: 0, enc: -1, done, fg: null,
    noise: 0, cool: 600, lastX: cx, hid: -1, hidT: 0, heart: 0, passedClose: false,
    saidDark: cx > B + 400, saidSpot: cx > B + 700, saidGun: false, hideSaidAt: -99999,
    door: state.stageMemo[DOOR_MEMO] ? 'in' : 'shut', doorT: 0, block: null,
    wasGrounded: true, lastVy: 0, lastShoot: false, lastJump: false, lastMove: false, warned: false, freeMove: false,
  };
};
export const buildHunter = (state: GameState, h: Hunter) => {
  if (h.door === 'in') return;
  h.block = { x: DOOR_X - 20, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'disco-door' } as Block;
  state.blocks.push(h.block);
};
export const doorIn = (h: Hunter) => h.door === 'in';
/** In already (a fresh start inside the disco: the checkpoint's set after the build). */
export const forceDoorIn = (state: GameState, h: Hunter) => {
  if (h.door === 'in') return;
  h.door = 'in'; state.stageMemo[DOOR_MEMO] = '1';
  if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
};
export const doorKicking = (h: Hunter) => h.door === 'kicking';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;
const inPlay = (h: Hunter) => h.mode === 'drop' || h.mode === 'prowl' || h.mode === 'hunt' || h.mode === 'search' || h.mode === 'climb' || h.mode === 'kill';
const to = (h: Hunter, m: Mode) => { h.mode = m; h.t = 0; };
const vol = (state: GameState, x: number, k: number) => Math.max(0, k * (1 - Math.abs(x - pmid(state)) / 1000));

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the stage's controls in; what the engine gets out, or null: his own)

export const tickHunter = (ctx: FrameContext, h: Hunter, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (cx < B - 60 || cx > DOOR_X + 40 && h.door !== 'kicking') return null;
  if (!h.init) {
    h.init = true;
    ENCOUNTERS.forEach((e, i) => { if (e.at < cx - 50) h.done.add(i); });
    h.saidDark = h.saidDark || cx > B + 400; h.saidSpot = h.saidSpot || cx > B + 700; h.lastX = cx;
  }
  h.t++;
  if (h.cool > 0) h.cool--;
  if (h.door === 'kicking') return kick(ctx, h);
  // The ambience: hum, drips, the pipes, her far off
  ambience(state, h);
  // His lines along the way
  if (!h.saidDark && cx > B + 420 && p.isGrounded) { h.saidDark = true; meatheadSays(state, pick(L.MH_DARK), false); }
  // Hiding: up at a spot (on the floor, not in the middle of anything)
  const spot = HIDES.findIndex(s => Math.abs(s.x - cx) < 36);
  let out: Controls | null = null;
  if (h.mode !== 'kill' && p.health > 0) {
    if (spot >= 0 && h.hid < 0) setUi({ upPrompt: 'HIDE' });
    if (spot >= 0 && controls.up && p.isGrounded && (h.hid >= 0 || !p.isCharging)) {
      if (h.hid < 0) {
        h.hid = spot; h.hidT = 0;
        playSound('clink', 0.5, -6);
        // (his whisper about it, now and then)
        if (state.frame - h.hideSaidAt > 900) { h.hideSaidAt = state.frame; meatheadSays(state, pick((HIDES[spot].kind === 'locker' ? L.MH_HIDE : L.MH_HIDE_DARK)[dressed(state)]), false); }
        // (in, with her on him and close: she saw that)
        if (h.mode === 'hunt' && Math.abs(h.x - cx) < 240) h.hidT = -1;
      }
      h.hidT = h.hidT < 0 ? h.hidT : h.hidT + 1;
      p.hidden = true; p.vel.x = 0; p.pos.x += (HIDES[spot].x - cx) * 0.4;
      out = hands();
    } else if (h.hid >= 0) { h.hid = -1; p.hidden = false; playSound('clink', 0.4, -2); }
  }
  // (his heart, in there: quicker with her near)
  if (h.hid >= 0 && --h.heart <= 0) { const near = inPlay(h) && Math.abs(h.x - cx) < 400; h.heart = near ? 22 : 44; playSound('thud', near ? 0.45 : 0.25, -14); }
  // His noise: what he's doing, how loud
  hearHim(state, h, controls);
  // Her visits: set off as he goes; or by his noise with her away
  if (h.mode === 'away') {
    const i = ENCOUNTERS.findIndex((e, k) => !h.done.has(k) && cx > e.at);
    if (i >= 0) startEncounter(state, h, i);
    else if (h.noise > 100 && h.cool <= 0) {
      // (she heard that: down for a look, behind him)
      const side = p.facing > 0 ? -1 : 1, from = Math.max(B + 200, Math.min(BASE_R - 200, cx + side * 520));
      h.enc = -2; h.path = [{ x: cx, stop: 120 }, { x: from }]; h.x = from; h.speed = 2; h.fg = null;
      to(h, 'tell'); h.cool = 900;
    }
  }
  runHer(ctx, h);
  return out;
};

const ambience = (state: GameState, h: Hunter) => {
  const r = Math.random();
  if (r < 1 / 160) playSound('tinkle', 0.15, -4 + Math.random() * 8);
  if (state.frame % 260 === 0) playSound('engine', 0.06, -20);
  if (r > 1 - 1 / 420) playSound('gush', 0.1, -12);
  if (h.mode === 'away' && Math.random() < 1 / 1100) playSound('screams', 0.1, -14);
};

const hearHim = (state: GameState, h: Hunter, controls: Controls) => {
  const p = state.player;
  if (h.hid >= 0) { h.noise *= 0.95; return; }
  let n = 0;
  if (Math.abs(p.vel.x) > 0.5 && p.isGrounded) n += 0.5;
  const shot = !!controls.shoot && !h.lastShoot, moving = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking, moveStart = moving && !h.lastMove;
  // (the first loud thing this life, a shot or a charge move: nothing hears it; he catches himself, whispering. One
  // warning a life, the two shared; after it, every one counts)
  if (!h.warned && (shot || moveStart)) {
    h.warned = true; h.freeMove = !shot;
    meatheadSays(state, pick(shot ? L.MH_WARN_SHOOT : L.MH_WARN_MOVE), false);
  } else {
    if (shot) {
      n += 45;
      if (inPlay(h) && !h.saidGun) { h.saidGun = true; meatheadSays(state, pick(L.MH_USELESS), false); }
    }
    // (the warned one itself, start to finish, is free)
    if (moving && !h.freeMove) n += moveStart ? 30 : 2.5;
  }
  if (controls.jump && !h.lastJump && p.isGrounded) n += 14;
  if (!h.wasGrounded && p.isGrounded && h.lastVy > 7) n += 40;
  h.lastShoot = !!controls.shoot; h.lastJump = !!controls.jump; h.wasGrounded = p.isGrounded; h.lastVy = p.vel.y; h.lastMove = moving;
  if (!moving) h.freeMove = false;
  h.noise = h.noise * 0.97 + n;
  // (loud with her about and in earshot: she comes to it)
  if (n >= 14 && (h.mode === 'prowl' || h.mode === 'search') && Math.abs(h.x - pmid(state)) < 800) {
    h.path = [{ x: pmid(state), stop: 90 }, ...h.path.slice(h.leg)]; h.leg = 0; to(h, 'prowl'); h.speed = Math.max(h.speed, 2.6);
    playSound('screams', 0.3, -6);
  }
};

const startEncounter = (state: GameState, h: Hunter, i: number) => {
  const e = ENCOUNTERS[i];
  h.done.add(i); h.enc = i;
  h.x = e.from; h.path = e.path.map(q => ({ ...q })); h.leg = 0; h.speed = e.speed;
  h.fg = e.fg ? { t: 0, dir: e.from > pmid(state) ? -1 : 1 } : null;
  to(h, 'tell');
  playSound('screams', 0.35, -8);
};

/** Her: the tell, down out of the vent, along, sniffing, after him, gone again. */
const runHer = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (h.fg) { h.fg.t++; if (h.fg.t > 170) h.fg = null; }
  switch (h.mode) {
    case 'away': return;
    case 'tell': {
      // (her clicks getting nearer, a screech; the foreground pass if it's that sort; the vent rattling)
      if (h.t % 10 === 0) playSound('click', 0.15 + h.t / 400, -2);
      if (h.fg && h.fg.t === 40 && !h.saidSpot) { h.saidSpot = true; meatheadSays(state, pick(L.MH_SPOT), false); }
      if (h.t === 110) { playSound('clang', 0.5, -4); shakeScreen(state, 3, 2); }
      if (h.t >= 150) { to(h, 'drop'); playSound('thud', 0.8, -8); }
      return;
    }
    case 'drop':
      h.dir = cx < h.x ? -1 : 1;
      if (h.t === 18) { playSound('land', 0.8, -10); shakeScreen(state, 5, 3); }
      if (h.t >= 22) {
        const e = h.enc >= 0 ? ENCOUNTERS[h.enc] : null;
        if (e?.hunt) { to(h, 'hunt'); playSound('roar', 0.8, -8); meatheadSays(state, pick(L.MH_SEEN), false); }
        else to(h, 'prowl');
      }
      return;
    case 'prowl': {
      const tgt = h.path[h.leg];
      if (!tgt) { to(h, 'climb'); return; }
      const dx = tgt.x - h.x;
      if (Math.abs(dx) > 4) { h.dir = dx < 0 ? -1 : 1; h.x += h.dir * Math.min(Math.abs(dx), h.speed); h.sniff = 0; }
      else if ((h.sniff += 1) >= (tgt.stop ?? 0)) { h.leg++; h.sniff = 0; }
      else if (h.sniff % 30 === 0) { h.dir = (-h.dir) as 1 | -1; playSound('snort', 0.4 + vol(state, h.x, 0.3), -10); }
      steps(state, h, 24);
      if (sees(state, h)) { to(h, 'hunt'); playSound('roar', 0.9, -6); shakeScreen(state, 4, 2); meatheadSays(state, pick(L.MH_SEEN), false); }
      if (h.hid >= 0 && Math.abs(h.x - cx) < 260) h.passedClose = true;
      break;
    }
    case 'hunt': {
      // (after him: he's hidden from her (not seen going in): lost him; seen going in: found)
      if (h.hid >= 0 && h.hidT >= 0) { to(h, 'search'); h.path = [{ x: cx, stop: 140 }]; h.leg = 0; h.speed = 2; break; }
      h.dir = cx < h.x ? -1 : 1;
      const fast = h.enc >= 0 && ENCOUNTERS[h.enc]?.hunt ? 3.0 : 4.2;
      h.x += h.dir * fast;
      steps(state, h, 12);
      if (h.hid >= 0 && h.hidT < 0 && Math.abs(h.x - cx) < 60) { p.hidden = false; h.hid = -1; startKill(state, h); }
      break;
    }
    case 'search': {
      const tgt = h.path[0];
      if (tgt && Math.abs(tgt.x - h.x) > 4) { h.dir = tgt.x < h.x ? -1 : 1; h.x += h.dir * h.speed; }
      else if (h.t % 30 === 0) { h.dir = (-h.dir) as 1 | -1; playSound('snort', 0.5, -10); }
      steps(state, h, 26);
      if (h.hid >= 0 && Math.abs(h.x - cx) < 300) h.passedClose = true;
      if (sees(state, h)) { to(h, 'hunt'); playSound('roar', 0.9, -6); }
      if (h.t > 200) to(h, 'climb');
      break;
    }
    case 'climb':
      if (h.t === 2) playSound('clang', 0.5, -2);
      if (h.t >= 24) {
        to(h, 'away'); h.enc = -1; h.cool = Math.max(h.cool, 600);
        if (h.passedClose && p.health > 0) meatheadSays(state, pick(L.MH_PASSED), false);
        h.passedClose = false;
      }
      return;
    case 'kill': killing(ctx, h); return;
  }
  // Touched: one shot
  if (h.hid < 0 && p.health > 0 && state.deathTimer <= 0 && Math.abs(h.x - cx) < 48 && p.pos.y + p.height > GY - 230) startKill(state, h);
  h.x = Math.max(B - 20, Math.min(BASE_R - 40, h.x));
};

/** She sees him: in front of her and near enough (or right on her), not hidden, on his feet in the tunnel. */
const sees = (state: GameState, h: Hunter) => {
  const p = state.player, dx = pmid(state) - h.x;
  if (h.hid >= 0 || p.health <= 0 || p.inCutscene) return false;
  return Math.abs(dx) < 110 || (Math.abs(dx) < 380 && Math.sign(dx) === h.dir);
};
const steps = (state: GameState, h: Hunter, every: number) => {
  if (h.t % every === 0) playSound('thud', vol(state, h.x, 0.5), -12);
  if (h.t % 13 === 0) playSound('click', vol(state, h.x, 0.35), 4);
  if (h.t % 90 === 45) playSound('gush', vol(state, h.x, 0.2), -14);
};

// ---------------------------------------------------------------------------------------------------------------
// The kill: up in her claws, her inner jaws out into his head

const startKill = (state: GameState, h: Hunter) => {
  to(h, 'kill');
  const p = state.player;
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  h.dir = pmid(state) < h.x ? -1 : 1;
  playSound('roar', 1, -4); playSound('screams', 0.6, -6); shakeScreen(state, 8, 4);
};
const killing = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player;
  // (held up in front of her face)
  const hx = h.x + h.dir * 118, hy = GY - 140 - Math.min(1, h.t / 10) * 14;
  p.pos.x = hx - p.width / 2; p.pos.y = hy - p.height * 0.5; p.vel.x = 0; p.vel.y = 0; p.facing = (h.dir > 0 ? -1 : 1);
  if (h.t === 28 || h.t === 40) {
    playSound('crunch', 1, -2); playSound('splat', 1, -4); shakeScreen(state, 10, 5);
    for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: hx, y: hy - 20 }, vel: { x: (Math.random() - 0.5) * 7 - h.dir * 2, y: -2 - Math.random() * 5 }, life: 40, color: ['#7F1D1D', '#B91C1C', '#F9A8D4', '#FDE68A'][i % 4], size: 2 + Math.random() * 4, grav: 0.35 });
  }
  if (h.t === 52) {
    p.carried = false; p.invincibilityTimer = 0; p.inCutscene = false;
    hurtPlayer(ctx, 9999, JAW, { x: -h.dir * 4, y: -2 }, 10);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The disco's door: up to it, the boot (the chase is over: she's held off for it)

export const atDoor = (state: GameState, h: Hunter) => h.door === 'shut' && pmid(state) > DOOR_X - 150 && state.player.isGrounded && state.player.health > 0 && state.deathTimer <= 0 && h.mode !== 'kill';
export const startKick = (state: GameState, h: Hunter) => {
  h.door = 'kicking'; h.doorT = 0;
  const p = state.player;
  if (h.hid >= 0) { h.hid = -1; p.hidden = false; }
  p.inCutscene = true;
};
const kick = (ctx: FrameContext, h: Hunter): Controls => {
  const { state } = ctx, p = state.player;
  h.doorT++;
  const t = h.doorT;
  p.inCutscene = true; p.facing = 1;
  if (t < 10) { p.vel.x = 0; p.pos.x += (DOOR_X - 90 - p.width / 2 - p.pos.x) * 0.3; }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (t === 8) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
  if (t === 18) {
    // (in it goes: the door flat on the floor, the music and the lights out through the hole)
    if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
    state.stageMemo[DOOR_MEMO] = '1';
    playSound('crash', 1, -4); playSound('boom', 0.6, 2); shakeScreen(state, 14, 7);
    for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: DOOR_X - 10 + Math.random() * 20, y: GY - 20 - Math.random() * 150 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: ['#C026D3', '#F472B6', '#FDE047', '#A1A1AA'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
    // (and she's done with: the chase is over)
    to(h, 'away'); h.done = new Set(ENCOUNTERS.map((_, i) => i)); h.fg = null;
  }
  if (t > 30 && pmid(state) < DISCO_L + 130) return { ...hands(), right: true } as Controls;
  if (t > 30) { h.door = 'in'; p.inCutscene = false; p.kickPose = 0; }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World space, in the play plane: her (dropping, prowling, after him, climbing out, the kill). */
export const drawHunter = (c: Ctx, state: GameState, h: Hunter) => {
  if (!inPlay(h)) return;
  const dy = h.mode === 'drop' ? -300 * Math.max(0, 1 - h.t / 20) : h.mode === 'climb' ? -300 * Math.min(1, h.t / 22) : 0;
  const pose = h.mode === 'kill' ? 'grab' : h.mode === 'hunt' ? 'stalk' : h.mode === 'search' || (h.mode === 'prowl' && h.sniff > 0) ? 'idle' : 'stalk';
  const moving = h.mode === 'prowl' && h.sniff === 0 || h.mode === 'hunt' || h.mode === 'search';
  c.save(); c.translate(h.x, GY + dy); c.scale(0.85, 0.85); c.translate(-h.x, -GY);
  drawQueen(c, h.x, h.dir, { pose, t: state.frame, ext: 0, alive: 1, beat: 0, free: true, stride: moving ? state.frame * (h.mode === 'hunt' ? 0.35 : 0.16) : 0 });
  c.restore();
};

/** World space: the hiding spots (lockers, dark corners), him in one (his eyes through the slats), the door. */
export const drawHides = (c: Ctx, state: GameState, h: Hunter) => {
  const v = state.camera.x;
  for (let i = 0; i < HIDES.length; i++) {
    const s = HIDES[i];
    if (s.x < v - 100 || s.x > v + CANVAS_WIDTH + 100) continue;
    const inIt = h.hid === i;
    if (s.kind === 'locker') {
      stamp(c, `sp-q-locker-${i}`, s.x - 30, GY - 132, 60, 134, g => {
        ink(g, () => g.rect(s.x - 26, GY - 128, 52, 128), '#475569', 2);
        g.fillStyle = '#334155'; g.fillRect(s.x - 22, GY - 124, 44, 120);
        for (let k = 0; k < 5; k++) { g.fillStyle = '#0F172A'; g.fillRect(s.x - 14, GY - 116 + k * 6, 28, 3); }
        g.fillStyle = '#E2E8F0'; g.fillRect(s.x - 16, GY - 70, 32, 10); g.fillStyle = '#0F172A'; g.font = '5px "Press Start 2P"'; g.fillText(['BRENDA', 'GARY', 'SID', 'CHUCK', 'SUSAN', 'GLENN', 'LILLY', 'MATT'][i], s.x - 14, GY - 62);
        g.fillStyle = '#94A3B8'; g.fillRect(s.x + 14, GY - 64, 3, 12);
      });
      // (him in it: his eyes through the slats, blinking now and then)
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 8, GY - 110, 4, 3, '#F8FAFC'); box(c, s.x + 4, GY - 110, 4, 3, '#F8FAFC'); box(c, s.x - 7, GY - 110, 2, 2, '#DC2626'); box(c, s.x + 5, GY - 110, 2, 2, '#DC2626'); }
    } else {
      // (a dark corner: behind a heap of broken animatronics and a tarp)
      stamp(c, `sp-q-dark-${i}`, s.x - 60, GY - 120, 120, 122, g => {
        g.fillStyle = '#0A0A0F'; g.fillRect(s.x - 40, GY - 110, 80, 110);
        ink(g, () => { g.moveTo(s.x - 56, GY); g.quadraticCurveTo(s.x - 40, GY - 120, s.x + 10, GY - 112); g.quadraticCurveTo(s.x + 50, GY - 100, s.x + 56, GY); g.closePath(); }, '#1E293B', 2);
        g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(s.x - 30, GY - 30, 16, 18, 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#0A0A0A'; g.beginPath(); g.ellipse(s.x - 36, GY - 30, 5, 3, 0.5, 0, Math.PI * 2); g.ellipse(s.x - 24, GY - 30, 5, 3, -0.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#F5F5F4'; g.fillRect(s.x + 20, GY - 26, 24, 14); g.fillStyle = '#18181B'; g.fillRect(s.x + 26, GY - 24, 8, 6);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 4, GY - 70, 3, 2, '#F8FAFC'); box(c, s.x + 5, GY - 70, 3, 2, '#F8FAFC'); }
    }
  }
  drawDoor(c, state, h);
};

/** GALACTIC GROOVE's door: chrome and purple, bulbs round it chasing, a star on it; kicked in, flat on the floor. */
const drawDoor = (c: Ctx, state: GameState, h: Hunter) => {
  if (DOOR_X < state.camera.x - 200 || DOOR_X > state.camera.x + CANVAS_WIDTH + 200) return;
  const f = state.frame, x = DOOR_X;
  box(c, x - 70, GY - 220, 140, 220, '#3B0764');
  box(c, x - 60, GY - 210, 120, 210, '#0A0510');
  for (let i = 0; i < 18; i++) {
    const a = i / 17, bx = i < 6 ? x - 66 : i < 12 ? x - 66 + (i - 6) * 26 : x + 62, by = i < 6 ? GY - a * 6 * 36 : i < 12 ? GY - 214 : GY - (17 - i) * 36;
    box(c, bx, by, 6, 6, (i + Math.floor(f / 6)) % 3 === 0 ? '#FDE047' : '#78350F');
  }
  label(c, 'GALACTIC GROOVE', x, GY - 236, (Math.floor(f / 20) % 2 ? '#F472B6' : '#C084FC'), 8);
  if (h.door !== 'in') {
    ink(c, () => c.rect(x - 56, GY - 206, 112, 206), '#7E22CE', 2);
    box(c, x - 2, GY - 206, 4, 206, '#3B0764');
    box(c, x - 50, GY - 200, 44, 194, '#A855F7'); box(c, x + 6, GY - 200, 44, 194, '#A855F7');
    box(c, x - 50, GY - 200, 44, 4, '#E9D5FF'); box(c, x + 6, GY - 200, 44, 4, '#E9D5FF');
    label(c, 'MEMBERS ONLY', x, GY - 120, '#FDE047', 6);
    // (the bass through it)
    if (f % 30 < 3) box(c, x - 50, GY - 200, 100, 194, 'rgba(255, 255, 255, 0.08)');
  } else {
    // (kicked in: the doors flat on the dance floor beyond, the light out through the hole)
    box(c, x + 10, GY - 8, 120, 8, '#7E22CE'); box(c, x + 14, GY - 10, 112, 3, '#C084FC');
    box(c, x - 56, GY - 206, 112, 206, `rgba(${f % 40 < 20 ? '244, 114, 182' : '125, 211, 252'}, 0.18)`);
  }
};

/** Screen space, over everything: the foreground pipes (parallax, near), and her silhouette crawling along them. */
let sil: HTMLCanvasElement | null = null;
export const drawHunterFront = (c: Ctx, state: GameState, h: Hunter) => {
  const cam = state.camera.x;
  if (cam + CANVAS_WIDTH < B - 100 || cam > BASE_R + 100) return;
  // (the near pipes: two thick runs along the top, a riser every so often, dark; only over the basement, not the disco)
  c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, Math.min(CANVAS_WIDTH, DOOR_X - 60 - cam)), CANVAS_HEIGHT); c.clip();
  const off = -((cam - B) * 1.35);
  c.fillStyle = '#05050A'; c.fillRect(0, 36, CANVAS_WIDTH, 26); c.fillRect(0, 74, CANVAS_WIDTH, 14);
  c.fillStyle = '#16161F'; c.fillRect(0, 36, CANVAS_WIDTH, 3); c.fillRect(0, 74, CANVAS_WIDTH, 2);
  for (let k = 0; k < 12; k++) {
    const x = ((off + k * 700) % (12 * 700) + 12 * 700) % (12 * 700) - 200;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    c.fillStyle = '#05050A'; c.fillRect(x, 36, 34, CANVAS_HEIGHT); c.fillStyle = '#16161F'; c.fillRect(x, 36, 3, CANVAS_HEIGHT);
    c.fillStyle = '#0B0B12'; c.fillRect(x - 6, 120 + (k % 3) * 120, 46, 12);
  }
  // (her, along the near pipe: big, black, sliding past, the green of her eyes)
  if (h.fg) {
    const k = h.fg.t / 170, sx = h.fg.dir < 0 ? CANVAS_WIDTH + 260 - k * (CANVAS_WIDTH + 520) : -260 + k * (CANVAS_WIDTH + 520);
    if (!sil) { sil = document.createElement('canvas'); sil.width = 640; sil.height = 420; }
    const g = sil.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 640, 420);
    g.save(); g.translate(320, 390); g.scale(1.25, 1.25); g.rotate(h.fg.dir * 0.05); g.translate(0, -GY);
    drawQueen(g, 0, h.fg.dir, { pose: 'stalk', t: state.frame, ext: 0, alive: 1, beat: 0, free: true, stride: h.fg.t * 0.2 });
    g.restore();
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#030306'; g.fillRect(0, 0, 640, 420); g.globalCompositeOperation = 'source-over';
    // (crawling along under the pipe: upside down, hanging off it)
    // (a dim red emergency light behind the pipe, so her shape stands out against it)
    c.fillStyle = 'rgba(127, 29, 29, 0.28)'; c.beginPath(); c.ellipse(sx, 190, 260, 150, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(185, 28, 28, 0.18)'; c.beginPath(); c.ellipse(sx, 190, 170, 100, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(Math.round(sx), 40); c.scale(1, -1);
    c.drawImage(sil, -320, -390, 640, 420);
    c.restore();
    // (the eyes: her green, under the crest)
    const ex = sx + h.fg.dir * 120, ey = 40 + 300;
    box(c, ex - 10, ey, 7, 4, '#84FF50'); box(c, ex + 4, ey, 7, 4, '#84FF50');
  }
  c.restore();
};

/** The dark: a tight light round him, the strips flickering, her eyes when she's about. Null outside the basement. */
export const hunterLighting = (state: GameState, h: Hunter): SceneLight | null => {
  const p = state.player, cx = pmid(state);
  if (cx < B - 80 || cx > DOOR_X + 20) return null;
  const lights: Light[] = [{ x: cx, y: p.pos.y + 30, r: h.hid >= 0 ? 60 : 150, a: 1 }];
  for (const s of STRIPS) {
    if (Math.abs(s - cx) > 900) continue;
    const on = Math.sin(state.frame * 0.13 + s) > -0.6 && (state.frame + s) % 97 > 6;
    if (on) lights.push({ x: s, y: CEIL_B + 20, r: 110, a: 0.6, color: 'rgba(239, 68, 68, 0.12)' });
  }
  // (her: the green under her crest; a little of her shape out of the dark, so she reads)
  if (inPlay(h)) { lights.push({ x: h.x + h.dir * 50, y: GY - 220, r: 80, a: 0.8, color: 'rgba(132, 255, 80, 0.22)' }); lights.push({ x: h.x, y: GY - 130, r: 170, a: 0.3 }); }
  // (the disco's door: its bulbs, the light out of it)
  if (Math.abs(DOOR_X - cx) < 900) lights.push({ x: DOOR_X, y: GY - 120, r: 200, a: 0.8, color: 'rgba(244, 114, 182, 0.12)' });
  return { dark: 0.94, shade: [2, 2, 8], lights, rim: 0.3 };
};
