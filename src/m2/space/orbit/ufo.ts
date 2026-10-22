// THE FLYING SAUCER: the orbit's sub-boss, there the whole way. A big classic saucer, its dome tinted so nobody sees in.
// Zorblax's widow on its loudspeaker (her girls are aboard: she says so).
//
// It comes on as he gets out into space and stays: hanging off the right of the screen, moving about, its health bar
// up the whole time, spewing out the waves he fights (fighters and kamikazes out of its hatch: waves.ts), and having a
// go itself now and then: bolts at him; rings of them (from the spread on); a ram straight across (from the plasma on).
// His bolts barely chip it (gun.ts's SAUCER_SHARE): it's the space radiation that does it. Once the gun's the BEAM (the
// screen stopped: he's shut in with it till it's done), its health pours out. Lots of health, no breather (the
// sub-boss rule); its health is its own (the enemy carries a pool: what comes out of it each frame is the damage).
// Starting again at a checkpoint, it's as worn as it was when he got there (state.stageMemo).
//
// Worn down, it's had it: pissed, red all over, it takes him (the cutscene: no HUD, all-or-nothing skip). Its hatch
// opens over him and the beam pulls him up in. Nobody sees inside: he says "MORNING, LADIES." (or AFTERNOON, or
// EVENING: timeOfDay()), a beat, a few thumps, and it blows up. Then the cutaway: speed lines, zooming in on the
// burning wreck going down, the ground coming up; the flash; black, the gun: "GOING BACK TO FACTORY SETTINGS." (the
// suit comes off with it); on to the crater, on foot. It's down for good (state.stageMemo).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { say, pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import type { EnemyKind } from '../../../m1/types';
import { timeOfDay, farTint } from '../../timeOfDay';
import { bandedGradient, hazeBands, checker } from '../../../m1/game/render/pixelArt';
import { mix } from '../../../m1/game/render/backdrops/core';
import { drawCloud, hash } from '../needle/sky';
import { voice, meatheadSays, hands, teleport, box, label, saidOver } from '../section';
import { DOORS } from '../geometry';
import { K, spawn } from './kinds';
import { bolt, boltV, blast } from './hazards';
import { drawSaucer, sphere, INK } from './art';
import { orbitOf, MEMO, type Saucer } from './state';
import { CY, W, H, X0, X1 } from './geo';
import { SAUCER_INTRO, SAUCER_TAUNT, SAUCER_HURT, SAUCER_PISSED, MH_WHO, MH_LADIES, GUN_FACTORY, type ByPants } from './lines';
import { SAUCER_SHARE, SAUCER_FLOOR, MAX_LEVEL, gunSays, gunWords } from './gun';
import { takeOffSuit } from '../needle/suit';
import { releaseWeapon } from '../../weaponLock';

type Ctx = CanvasRenderingContext2D;

export const SAUCER_NAME = 'FLYING SAUCER';
/** Its health. Bolts do a sliver of their 25 (gun.ts): the beam (40 a frame) does the rest. */
const HP = 9000;
const POOL = 100000;
const SHOT_DMG = 11;
/** Where it hangs (screen x, its feet's screen y): off the right while it scrolls; further in for the end. */
const HANG_X = 700, ARENA_X = 600, HOME_Y = 250;
/** Where it's pulled him up to (its hatch, from its feet). */
const HATCH_Y = -14;
/** Its health, as it was at the last checkpoint (kept across his deaths). */
const HP_MEMO = 'm2:orbit:ufohp';

const dressed = (state: GameState): keyof ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const pool = (state: GameState, b: ByPants) => b[dressed(state)];
const SAY = voice('m2.space.saucer');

/** She says something (over the saucer while it's said). `after`: waits its turn; otherwise dropped if anyone's talking. */
const saucerSays = (state: GameState, s: Saucer, text: string, after: boolean, onDone?: () => void) => {
  const shown = say(text, SAY, after ? 'queue' : 'casual', {
    always: after,
    onShow: spoken => { s.said = { text }; if (!spoken) setTimeout(() => { if (s.said?.text === text) s.said = null; onDone?.(); }, Math.max(1800, text.length * 70)); },
    onHide: () => { if (s.said?.text === text) s.said = null; onDone?.(); },
    onDropped: () => onDone?.(),
  });
  if (!shown && after) onDone?.();
  return shown;
};

const ladies = () => {
  const n = timeOfDay().name;
  return n === 'morning' ? MH_LADIES.morning : n === 'midday' || n === 'afternoon' || n === 'golden hour' ? MH_LADIES.afternoon : MH_LADIES.evening;
};

// ---------------------------------------------------------------------------------------------------------------
// On

/** On, as he gets out into space (as worn as it was at the checkpoint he's starting from). */
export const startSaucer = (state: GameState) => {
  const o = orbitOf(state);
  if (o.saucer || state.stageMemo[MEMO.ufo]) return;
  const cam = state.camera.x;
  const e = makeKindEnemy(K.ufo as EnemyKind, cam + 1000, CY - 60);
  e.health = POOL; e.maxHealth = POOL; e.facing = 1;
  state.enemies.push(e);
  const hp = Math.min(HP, +(state.stageMemo[HP_MEMO] ?? HP) || HP);
  o.saucer = {
    e, st: 'enter', t: 0, total: 0, hp, max: HP, x: cam + 1000, y: CY - 60, tx: cam + HANG_X, ty: CY + HOME_Y,
    move: 'idle', mt: 0, mt2: 0, next: 200, last: '', ray: 0, hurtAt: Math.floor((1 - hp / HP) * 4), said: null, talkAt: 0, asked: false, done: false,
    lift: 0, fromX: 0, fromY: 0, open: 0, red: 0, flash: 0, zoom: 0, white: 0,
  };
  playSound('alienCharge', 0.9, -10);
};
/** A checkpoint reached: its health as it stands, kept. */
export const noteSaucerHp = (state: GameState) => {
  const s = orbitOf(state).saucer;
  if (s && s.st === 'fight') state.stageMemo[HP_MEMO] = String(Math.round(s.hp));
};
/** Where it'd let something out of its hatch (world), or null (it's not about). */
export const hatch = (state: GameState) => {
  const s = orbitOf(state).saucer;
  return s && (s.st === 'fight' || s.st === 'enter') && s.x < state.camera.x + W + 60 ? { x: s.x, y: s.y - 10 } : null;
};
/** Out of its hatch: a puff, the hatch open a moment. */
export const spewed = (state: GameState) => {
  const s = orbitOf(state).saucer;
  if (!s) return;
  s.open = 1; s.mt2 = 20;
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * 30, y: s.y - 12 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 2 }, life: 16, color: '#FEF9C3', size: 3 + Math.random() * 3 });
};

const place = (s: Saucer) => { s.e.pos.x = s.x - s.e.width / 2; s.e.pos.y = s.y - s.e.height; };
const go = (s: Saucer, st: Saucer['st']) => { s.st = st; s.t = 0; s.asked = false; s.done = false; };

// ---------------------------------------------------------------------------------------------------------------
// The fight

const pickMove = (s: Saucer, level: number, end: boolean): Saucer['move'] => {
  const list: Saucer['move'][] = end ? ['drones', 'ring', 'drones', 'aim'] : level >= 4 ? ['aim', 'ring', 'ram'] : level >= 2 ? ['aim', 'ring'] : ['aim'];
  const options = list.length > 1 ? list.filter(m => m !== s.last) : list;
  const m = options[Math.floor(Math.random() * options.length)];
  s.last = m;
  return m;
};

const fight = (ctx: FrameContext, s: Saucer) => {
  const { state } = ctx, o = orbitOf(state), p = state.player, cam = state.camera.x;
  const pm = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  const end = o.level >= MAX_LEVEL, fast = end ? 1.3 : 1 + o.level * 0.06;
  // (taunts now and then: dropped if somebody's talking)
  if (s.total > s.talkAt) { s.talkAt = s.total + 700 + Math.floor(Math.random() * 400); saucerSays(state, s, pickLine(pool(state, SAUCER_TAUNT)), false); }
  // (hurt lines, a quarter gone at a time)
  const quarters = Math.floor((1 - s.hp / s.max) * 4);
  if (quarters > s.hurtAt && quarters <= 3) { s.hurtAt = quarters; saucerSays(state, s, pool(state, SAUCER_HURT)[quarters - 1], true); }
  // Hanging about off his right, moving about (in further at the end)
  if (s.move !== 'ram') {
    s.tx = cam + (end ? ARENA_X : HANG_X) + Math.sin(s.total * 0.011) * (end ? 70 : 40);
    s.ty = Math.max(CY + 200, Math.min(CY + 560, CY + HOME_Y + 60 + Math.sin(s.total * 0.017) * 170 + Math.sin(s.total * 0.043) * 30));
  }
  if (s.mt2 > 0 && --s.mt2 === 0) s.open = 0;
  s.mt++;
  switch (s.move) {
    case 'idle':
      if (s.mt > s.next) { s.move = pickMove(s, o.level, end); s.mt = 0; }
      break;
    case 'ring': {
      const every = Math.round(34 / fast), n = end ? 14 : 10;
      if (s.mt % every === 0 && s.mt <= every * 2) {
        const turn = (s.mt / every) * 0.26;
        for (let i = 0; i < n; i++) { const a = turn + (i / n) * Math.PI * 2; boltV(state, K.ufo, s.x + Math.cos(a) * 110, s.y - 34 + Math.sin(a) * 20, Math.cos(a) * 3 + o.sv, Math.sin(a) * 3, SHOT_DMG); }
        playSound('sadBolt', 0.6, -4);
      }
      if (s.mt > every * 2 + 20) endMove(s, fast, end);
      break;
    }
    case 'aim':
      if (s.mt % 16 === 0 && s.mt <= 48) { bolt(state, K.ufo, s.x - 110, s.y - 30, pm.x, pm.y, 4.8, SHOT_DMG, o.sv); playSound('sadBolt', 0.5); }
      if (s.mt > 70) endMove(s, fast, end);
      break;
    case 'drones':
      if (s.mt === 10 || s.mt === 40) {
        spewed(state);
        const i = s.mt === 10 ? 0 : 1, sy = pm.y - CY < 300 ? [430, 160][i] : [170, 440][i];
        spawn(state, K.fighter, s.x, s.y - 10, { path: 'swoop', sy, hold: 380 + i * 60, armed: true, every: 110, sit: 200, dir: sy < 300 ? -1 : 1 });
        playSound('whoosh', 0.6, 4);
      }
      if (s.mt > 70) endMove(s, fast, end);
      break;
    case 'ram':
      // (red, lining up on him; then straight across; then back round in from the right)
      if (s.mt < 50) { s.red = Math.min(1, s.red + 0.05); s.ty = pm.y + 40; s.tx = cam + HANG_X + 30; if (s.mt === 1) playSound('alarm', 0.6, 4); }
      else if (s.x > cam - 200 && s.mt < 220) { s.tx = s.x - 14 + o.sv; if (s.mt === 50) playSound('whoosh', 1, -8); }
      else if (s.mt < 220) { s.x = cam + W + 300; s.tx = s.x; s.mt = 220; s.red = 0; }
      else { s.tx = cam + HANG_X; if (Math.abs(s.x - s.tx) < 20) endMove(s, fast, end); }
      break;
    default: endMove(s, fast, end);
  }
  // (on to where it's going: straight across when ramming, otherwise easy; it keeps up with the scroll)
  if (s.move === 'ram' && s.mt >= 50 && s.mt < 220) s.x = s.tx;
  else s.x += o.sv + (s.tx - s.x) * 0.04;
  s.y += (s.ty - s.y) * 0.035;
};
const endMove = (s: Saucer, fast: number, end: boolean) => { s.move = 'idle'; s.mt = 0; s.next = Math.round((end ? 60 : 240 + Math.random() * 160) / fast); s.ray = 0; s.red = 0; };

// ---------------------------------------------------------------------------------------------------------------
// Each frame (in the section's update): the controls, while it has them (the cutscene), or null

export const updateSaucer = (ctx: FrameContext, controls: Controls): Controls | null => {
  const { state } = ctx, o = orbitOf(state), s = o.saucer;
  if (!s) return null;
  const p = state.player;
  s.t++; s.total++;
  if (s.flash > 0) s.flash--;
  // (what's come out of its pool since last frame is the damage)
  if (s.st === 'enter' || s.st === 'fight') {
    const d = POOL - s.e.health;
    s.e.health = POOL;
    if (d > 0 && s.st === 'fight') { s.hp = Math.max(Math.min(s.hp, s.max * SAUCER_FLOOR), s.hp - d * SAUCER_SHARE[Math.min(o.level, SAUCER_SHARE.length - 1)]); s.flash = 2; }
    if (s.st === 'enter') {
      s.tx = state.camera.x + HANG_X;
      s.x += o.sv + (s.tx - s.x) * 0.03; s.y += (s.ty - s.y) * 0.03;
      if (s.t === 40 && !state.stageMemo[MEMO.met]) { state.stageMemo[MEMO.met] = '1'; introLines(state, s); }
      if (s.t > 110) { go(s, 'fight'); s.next = 300; s.talkAt = 1200; }
    } else {
      fight(ctx, s);
      if (s.hp <= 0) pissed(state, s);
    }
    place(s);
    return null;
  }
  // The cutscene: it has him from here on
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  if (s.total > SKIP_AFTER) offerSkip();
  if (takeSkip()) { silenceAll(); finish(state); return hands(); }
  s.red = Math.min(1, s.red + 0.02);
  switch (s.st) {
    case 'pissed': {
      // (over him, its line said)
      s.tx = p.pos.x + p.width / 2; s.ty = p.pos.y - 70;
      s.x += (s.tx - s.x) * 0.05; s.y += (s.ty - s.y) * 0.05;
      if (!s.asked) { s.asked = true; saucerSays(state, s, pool(state, SAUCER_PISSED)[0], true, () => { s.done = true; }); }
      if ((s.done || s.t > 420) && s.t > 90 && Math.abs(s.tx - s.x) < 12) { go(s, 'beam'); s.fromX = p.pos.x; s.fromY = p.pos.y; playSound('suck', 0.9, -6); }
      break;
    }
    case 'beam':
      s.open = Math.min(1, s.t / 25);
      if (s.t > 25) {
        s.lift = Math.min(1, (s.t - 25) / 100);
        const e = s.lift * s.lift * (3 - 2 * s.lift);
        p.pos.x = s.fromX + (s.x - p.width / 2 - s.fromX) * e;
        p.pos.y = s.fromY + (s.y + HATCH_Y - p.height * 0.4 - s.fromY) * e;
        // (shrinking as he goes up the beam, down to a fraction of himself at the hatch (the user's))
        const k = 1 - 0.8 * e;
        p.spriteScaleX = k; p.spriteScaleY = k;
        // (it shrinks about his feet: lift him so what's left of him is up at the hatch, not dangling at the bottom)
        p.pos.y -= (1 - k) * p.height * 0.6;
        if (s.t % 12 === 0) playSound('suck', 0.4, 2);
        if (s.lift >= 1) { p.hidden = true; p.spriteScaleX = undefined; p.spriteScaleY = undefined; go(s, 'inside'); playSound('clang', 0.7, -6); }
      }
      break;
    case 'inside':
      // (shut; nobody sees in; he says hello; a beat; thumps)
      s.open = Math.max(0, s.open - 0.05);
      p.pos.x = s.x - p.width / 2; p.pos.y = s.y - 70 - p.height;
      if (s.t === 40) meatheadSays(state, ladies(), true, () => { s.done = true; s.mt = s.t; });
      if (s.done) {
        const since = s.t - s.mt;
        if (since === 40 || since === 62 || since === 76) { playSound('punch', 1, -8); shakeScreen(state, 5); s.x += (Math.random() - 0.5) * 8; }
        if (since > 100) boom(ctx, s);
      } else if (s.t > 600) boom(ctx, s);
      break;
    case 'boom':
      // (the wreck going down, burning)
      s.y += Math.min(9, s.t * 0.12);
      s.x -= 0.6;
      if (s.t % 6 === 0) blast(ctx, s.x + (Math.random() - 0.5) * 160, s.y - 30 + (Math.random() - 0.5) * 40, 40, 0, K.ufo, { spareHim: true });
      if (s.t > 55) { go(s, 'fall'); playSound('whoosh', 1, -14); }
      break;
    case 'fall':
      // (the cutaway: FALL frames down; the ground comes up; the hit; a flash; black)
      s.zoom = Math.min(1, s.t / FALL);
      if (s.t % 30 === 0 && s.t < FALL) playSound('rumble', 0.8, -8);
      if (s.t === FALL) { playSound('boom', 1, -14); playSound('crash', 1, -6); }
      s.white = s.t >= FALL ? 1 : 0;
      if (s.t >= FALL + FLASH) { go(s, 'factory'); s.white = 0; }
      break;
    case 'factory':
      // (black, after the flash: the gun powering down, and the suit off him with it; a beat after it, then down)
      if (s.t === 20) { takeOffSuit(state); gunSays(state, GUN_FACTORY, () => { s.done = true; s.mt = s.t; }); playSound('rayFizzle', 0.8, -6); }
      if ((s.done && s.t - s.mt > 20) || s.t > 480) finish(state);
      break;
  }
  if (s.st === 'pissed' || s.st === 'beam' || s.st === 'inside') place(s);
  return hands();
};

const introLines = (state: GameState, s: Saucer) => {
  const [a, b] = pool(state, SAUCER_INTRO);
  saucerSays(state, s, a, true);
  meatheadSays(state, MH_WHO, true);
  saucerSays(state, s, b, true);
};

/** Had it: everything else out of the sky, and it comes for him. */
const pissed = (state: GameState, s: Saucer) => {
  s.hp = 0; s.move = 'idle'; s.ray = 0;
  const og = orbitOf(state); og.beam = false; og.gun = null;
  state.projectiles = state.projectiles.filter(q => q.owner !== 'enemy');
  const o = orbitOf(state);
  for (const e of o.tracked) if (e !== s.e && e.health > 0) { e.health = 0; e.isBlownAway = false; }
  // (everything else out of the sky: tracked or not (the mines too: no fuse left beeping through the crash))
  state.enemies = state.enemies.filter(e => e === s.e || e.pos.x < X0 || e.pos.x > X1);
  silenceAll();
  s.said = null;
  go(s, 'pissed'); s.total = 0;
  playSound('alarm', 0.9, -4);
  shakeScreen(state, 8);
};

/** Up it goes: him in it. */
const boom = (ctx: FrameContext, s: Saucer) => {
  const { state } = ctx;
  state.stageMemo[MEMO.ufo] = '1';
  state.enemies = state.enemies.filter(e => e !== s.e);
  blast(ctx, s.x, s.y - 40, 160, 0, K.ufo, { spareHim: true, big: true });
  blast(ctx, s.x - 70, s.y - 30, 90, 0, K.ufo, { spareHim: true });
  blast(ctx, s.x + 80, s.y - 20, 90, 0, K.ufo, { spareHim: true });
  s.flash = 10;
  shakeScreen(state, 26, 12);
  go(s, 'boom');
};

/** Down in the crater: on foot there, the suit gone (blown off him), his own again. */
const finish = (state: GameState) => {
  const o = orbitOf(state), p = state.player, s = o.saucer;
  if (s) { state.enemies = state.enemies.filter(e => e !== s.e); s.st = 'gone'; }
  state.stageMemo[MEMO.ufo] = '1';
  state.stageMemo[MEMO.crashed] = '1';
  takeOffSuit(state);
  p.hidden = false; p.inCutscene = false; p.carried = false;
  p.vel.x = 0; p.vel.y = 0; p.facing = 1; p.invincibilityTimer = 0;
  o.on = false;
  if (o.cam) { state.cameraOverride = null; o.cam = false; }
  releaseWeapon(state);
  teleport(state, DOORS.crater.start.x, DOORS.crater.start.y);
  state.camera.y = DOORS.crater.start.y - 550;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World, in front: the ray and its warning, the tractor beam, the wreck going down, her words. */
export const drawSaucerFront = (c: Ctx, state: GameState) => {
  const s = orbitOf(state).saucer;
  if (!s || s.st === 'gone') return;
  const f = state.frame;
  if (s.st === 'beam' && s.open > 0) {
    // (the tractor beam: a cone of pale light down out of the hatch, over him, bands going up it)
    const top = s.y + HATCH_Y, bot = Math.max(top + 40, s.fromY + state.player.height + 20);
    // (in steps: a wide faint cone, a brighter one inside it, its core; its edges dithered)
    const cone = (k: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(s.x - 22 * k, top); c.lineTo(s.x + 22 * k, top); c.lineTo(s.x + 70 * k, bot); c.lineTo(s.x - 70 * k, bot); c.closePath(); c.fill(); };
    c.globalAlpha = s.open;
    c.save(); c.beginPath(); c.moveTo(s.x - 26, top); c.lineTo(s.x + 26, top); c.lineTo(s.x + 80, bot); c.lineTo(s.x - 80, bot); c.closePath(); c.clip();
    checker(c, s.x - 82, top, 164, bot - top, 'rgba(254, 249, 195, 0.35)', (f >> 2) % 2); c.restore();
    cone(1, 'rgba(254, 249, 195, 0.22)'); cone(0.7, 'rgba(254, 249, 195, 0.2)'); cone(0.4, 'rgba(255, 255, 240, 0.22)');
    c.globalAlpha = 0.5 * s.open;
    for (let i = 0; i < 6; i++) { const k = ((f * 0.02 + i / 6) % 1), y = bot - (bot - top) * k, hw = 22 + 48 * (1 - k); box(c, s.x - hw, y, hw * 2, 2, '#FFFFFF'); }
    c.globalAlpha = 1;
  }
  if (s.st === 'boom') {
    // (the wreck: the saucer, burning, going over)
    c.save(); c.translate(s.x, s.y); c.rotate(Math.min(0.9, s.t * 0.02));
    drawSaucer(c, f, s.t < 4, 1, 0);
    c.restore();
    for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * 180, y: s.y - 40 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 }, life: 24, color: Math.random() < 0.5 ? '#F97316' : '#3F3F46', size: 5 + Math.random() * 6 });
  }
  // (her words over it; under it when it's up near the top, the health bar's there)
  if (s.said) saidOver(c, s.said.text, s.x, s.y - 110 < state.camera.y + 130 ? s.y + 26 : s.y - 110, '#F9A8D4');
};

/** Screen: its health bar (in the fight), and the cutaway of the fall. */
export const drawSaucerHud = (c: Ctx, state: GameState) => {
  const s = orbitOf(state).saucer;
  if (!s || s.st === 'gone') return;
  if (s.st === 'fight' || s.st === 'enter') {
    const band = topBand(), w = band.x2 - band.x1;
    box(c, band.x1, 18, w, 14, '#18181B');
    box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, s.hp / s.max), 10, s.hp / s.max < 0.33 ? '#EF4444' : '#EC4899');
    label(c, SAUCER_NAME, band.mid, 44, '#FBCFE8', 8);
  }
  if (s.st === 'fall') drawFall(c, state, s);
  if (s.st === 'factory') {
    box(c, 0, 0, W, H, '#000000');
    const o = orbitOf(state);
    if (o.gun) gunWords(c, o.gun.text, W / 2, H / 2 + 10);
  }
  if (s.total > SKIP_AFTER && s.st !== 'enter' && s.st !== 'fight') drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The cutaway's length (frames) and the flash at the end of it. */
const FALL = 170, FLASH = 6;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);

/**
 * The cutaway, one shot: the camera going down with the burning wreck (it stays put in the middle), the sky by the
 * hour (it's home it's going), clouds whipping up past, the ground (Futureland: the giant atom, Space Needle 2) coming
 * up from under, faster and faster, growing; speed lines out from the wreck; its fire and smoke streaming up off it
 * (it's going down). Everything by the cutaway's own clock, so nothing jumps from one frame to the next. The hit: the
 * ground's at it, a white flash, black.
 */
const drawFall = (c: Ctx, state: GameState, s: Saucer) => {
  const t = Math.min(s.t, FALL), e = t / FALL;
  if (s.white > 0) { box(c, 0, 0, W, H, '#FFFFFF'); return; }
  // (where the wreck is: the middle, a little high; how big, easing up as it comes)
  const sc = lerp(0.62, 0.95, smooth(e)), cx = W / 2 + Math.sin(t * 0.21) * 1.5, wy = 300 + Math.sin(t * 0.17) * 1.5;
  const mid = { x: cx, y: wy - 45 * sc };
  // The sky: the hour's, in dithered bands
  const tod = timeOfDay();
  bandedGradient(c, 0, 0, W, H, tod.sky, 14);
  // (clouds whipping up past, faster as it goes: the far ones small and slow, the near ones big)
  const dist = 5 * t + 9 * t * t / FALL;
  for (let i = 0; i < 6; i++) {
    const near = i % 2, y = H + 160 - ((i * 170 + dist * (near ? 1.3 : 0.8)) % (H + 320)), x = (i * 263) % W;
    drawCloud(c, x, y, near ? 2.1 : 1.3, 40 + i, tod);
  }
  // The ground: from under the screen up to the wreck, faster and faster; Futureland on it, growing
  const gy = lerp(H + 90, wy + 4, Math.pow(e, 2.2)), k = lerp(0.35, 1.25, e * e);
  // (a ground plane, not a wall: hazy and pale far off at its edge, darker and the fields bigger nearer, each step
  // dithered into the next; roads off to a point on the horizon)
  const bands = [farTint('#B4CC8A', 1.2, tod), farTint('#94B862', 1, tod), farTint('#78A246', 0.8, tod), farTint('#628E34', 0.6, tod), farTint('#517E22', 0.4, tod), farTint('#456E1A', 0.2, tod)];
  const rowY = (i: number) => gy + (H + 40 - gy) * (i / bands.length) ** 2;
  for (let i = 0; i < bands.length; i++) box(c, 0, rowY(i), W, rowY(i + 1) - rowY(i) + 1, bands[i]);
  for (let i = 1; i < bands.length; i++) { checker(c, 0, Math.round(rowY(i) / 2) * 2 - 2, W, 2, bands[i], 0); checker(c, 0, Math.round(rowY(i) / 2) * 2, W, 2, bands[i - 1], 1); }
  // (the fields: a patchwork of darker lots, spread out from the middle the nearer they are)
  for (let i = 1; i < bands.length; i++) for (let j = -4; j <= 4; j++) {
    if (hash(i * 9 + j) < 0.5) continue;
    const y0 = rowY(i), y1 = rowY(i + 1), sp = 60 + (y1 - gy) * 1.4;
    box(c, W / 2 + j * sp + 6, y0 + 2, sp * 0.55, Math.max(2, (y1 - y0) * 0.6), mix(bands[i], '#2E4A12', 0.25));
  }
  if (H + 40 - gy > 6) hazeBands(c, 0, gy - 2, W, Math.min(60, H + 40 - gy), tod.haze, 0.55, 0.0, 5);
  box(c, 0, gy - 2, W, 2, mix('#E4EED4', tod.haze, 0.4));
  c.fillStyle = farTint('#C8B48A', 0.5, tod);
  for (const dx of [-0.9, -0.25, 0.4, 1.1]) {
    c.beginPath(); c.moveTo(W / 2 + dx * 40, gy); c.lineTo(W / 2 + dx * 40 + 3, gy); c.lineTo(W / 2 + dx * 900 + 24, H + 300); c.lineTo(W / 2 + dx * 900 - 24, H + 300); c.closePath(); c.fill();
  }
  // (the giant atom, left: a dome, its sphere, the rings round it; in steps, lit from the left)
  const ax = W / 2 - 230 * k;
  const A = ['#5C6B84', '#7E8DA6', '#A4B2C8', '#CCD6E4', '#EEF2F8'].map(col => farTint(col, 0.4, tod));
  c.fillStyle = INK; c.beginPath(); c.arc(ax, gy, 47 * k, Math.PI, 0); c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = A[i + 1]; c.beginPath(); c.arc(ax - i * 6 * k, gy, (46 - i * 9) * k, Math.PI, 0); c.fill(); }
  box(c, ax - 4 * k, gy - 46 * k, 8 * k, 46 * k, INK); box(c, ax - 3 * k, gy - 46 * k, 6 * k, 46 * k, A[2]); box(c, ax - 3 * k, gy - 46 * k, 2 * k, 46 * k, A[4]);
  c.lineWidth = Math.max(1, 4 * k);
  for (const r of [0.5, -0.5, 1.57]) { c.strokeStyle = A[0]; c.beginPath(); c.ellipse(ax, gy - 70 * k, 52 * k, 15 * k, r, 0, Math.PI * 2); c.stroke(); }
  c.lineWidth = Math.max(1, 2 * k);
  for (const r of [0.5, -0.5, 1.57]) { c.strokeStyle = A[3]; c.beginPath(); c.ellipse(ax, gy - 71 * k, 52 * k, 15 * k, r, Math.PI, Math.PI * 2); c.stroke(); }
  sphere(c, ax, gy - 70 * k, 26 * k, 26 * k, A);
  // (Space Needle 2, right: the shaft, the deck, the spire)
  const nx = W / 2 + 230 * k;
  box(c, nx - 6 * k, gy - 190 * k, 12 * k, 190 * k, INK);
  box(c, nx - 5 * k, gy - 190 * k, 10 * k, 190 * k, A[2]); box(c, nx - 5 * k, gy - 190 * k, 3 * k, 190 * k, A[4]); box(c, nx + 2 * k, gy - 190 * k, 3 * k, 190 * k, A[1]);
  c.fillStyle = INK; c.beginPath(); c.ellipse(nx, gy - 190 * k, 36 * k, 11 * k, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#126775', 0.4, tod); c.beginPath(); c.ellipse(nx, gy - 192 * k, 34 * k, 9 * k, 0, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = A[3]; c.beginPath(); c.ellipse(nx, gy - 189 * k, 34 * k, 5 * k, 0, 0, Math.PI * 2); c.fill();
  box(c, nx - 30 * k, gy - 190 * k, 60 * k, Math.max(1, 2 * k), farTint('#FDE68A', 0.3, tod));
  box(c, nx - 1.5 * k, gy - 240 * k, 3 * k, 50 * k, A[3]);
  // Speed lines: out from the wreck, streaming outward
  c.strokeStyle = '#FFFFFF';
  for (let i = 0; i < 36; i++) {
    const a = i * 2.39996, r0 = 90 + ((t * 13 + i * 47) % 440), len = 24 + r0 * 0.3;
    c.globalAlpha = Math.min(0.8, (r0 - 80) / 120) * 0.8;
    c.lineWidth = 1 + (i % 2);
    c.beginPath(); c.moveTo(mid.x + Math.cos(a) * r0, mid.y + Math.sin(a) * r0); c.lineTo(mid.x + Math.cos(a) * (r0 + len), mid.y + Math.sin(a) * (r0 + len)); c.stroke();
  }
  c.globalAlpha = 1;
  // Its trail: smoke and fire streaming up off it (it's going down), the far end of it first
  for (const smoke of [true, false]) {
    for (let i = 0; i < 30; i++) {
      const ph = ((t * 5 + i * 13.7) % 200) / 200;
      if (smoke !== ph > 0.35) continue;
      const x = mid.x - 10 * sc + Math.sin(i * 2.1 + ph * 3) * 18 * sc * (0.3 + ph), y = mid.y - 10 * sc - ph * 340;
      const r = (10 + ph * 30) * sc;
      // (no smooth fade: the smoke thins out in steps)
      c.globalAlpha = smoke ? (ph < 0.55 ? 0.8 : ph < 0.78 ? 0.5 : 0.25) : 1;
      c.fillStyle = smoke ? (ph < 0.6 ? '#52525B' : '#3F3F46') : ph < 0.12 ? '#FEF08A' : ph < 0.24 ? '#FDE047' : '#F97316';
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      if (!smoke) { c.fillStyle = ph < 0.12 ? '#FFFFFF' : ph < 0.24 ? '#FEF9C3' : '#FDBA74'; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.25, r * 0.5, 0, Math.PI * 2); c.fill(); }
    }
  }
  // The wreck: tilted, rocking a little, scorched
  c.save(); c.translate(cx, wy); c.scale(sc, sc); c.rotate(0.35 + Math.sin(t * 0.09) * 0.05);
  drawSaucer(c, t, false, 1, 0);
  // (scorched, holed, burning in the holes)
  checker(c, -90, -60, 90, 34, '#18181B', 0); checker(c, 20, -46, 80, 20, '#18181B', 1);
  c.fillStyle = '#18181B'; c.fillRect(-60, -70, 40, 20); c.fillRect(30, -40, 50, 14);
  c.fillStyle = '#B91C1C'; c.fillRect(-54, -68, 26, 14); c.fillStyle = '#F97316'; c.fillRect(-50, -66, 18, 10); c.fillStyle = '#FDE047'; c.fillRect(-46, -64, 8, 6);
  c.fillStyle = '#F97316'; c.fillRect(40, -38, 20, 8); c.fillStyle = '#FDE047'; c.fillRect(44, -36, 8, 4);
  c.restore();
};

/** Starting again from its checkpoint, or the flight starting with it down already: nothing to do. */
export const saucerDone = (state: GameState) => !!state.stageMemo[MEMO.ufo];
