// TEST YOUR PLUNGE (the owner's: "the second toilet, you cannot shit on it until it is plunged. you get a 'test your
// plunge' minigame like mortal kombat. it alternates between a stardew valley fishing minigame where instead of lining
// a fish you line a turd. you gotta hold the button but release it strategically. it then alternates between accurate
// pressing and rapid pressing. after getting the 'success' meter all the way up (should take maybe 30-45 seconds), you
// win a charge shard in the toilet. you can then shit on it like normal. the announcer isn't too pleased about cleaning
// the clog." Then: "you gotta press 'up' to plunge the toilet, not down"; "make sure an announcer says 'test your
// plunge'"; and every minigame asks first, A to accept, B to go back: minigameConfirm.ts).
//
// THE GODFATHER'S CLOG (stop 2's toilet), its stop's staff dead, not plunged yet: UP's prompt by it, PLUNGE IT
// (index.ts; holding down there only gets his "it's clogged" line: thrones.ts). UP: the ask (TEST YOUR PLUNGE? ACCEPT /
// BACK). Accepted: he hops up onto the plinth by the bowl with the plunger out of it, the world dimmed round him (the
// player's held: inCutscene, no HUD, enemies paused, no harm), the announcer booms TEST YOUR PLUNGE!, and it runs till
// it's won (no losing it: a bad round only costs some of the meter). One button for all of it: JUMP (its real button
// shown live up top: ui.chordTips). The rounds go round in turn:
//
//   THE TURD LINE   (Stardew's fishing bar) a turd bobs about a pipe; his bar rises while JUMP's held, sinks when it's
//                   let go (and bounces off the bottom). The turd inside the bar fills SUCCESS; outside it, drains.
//   ON THE NOSE     a marker sweeps back and forth over a bar; press with it in the sweet spot: PERFECT (the middle),
//                   GOOD (the rest of it), MISS (anywhere else, or too slow). Five presses, faster each time.
//   MASH IT         mash JUMP to push the gauge past the line before the time's up (it sinks back on its own).
//
// THE NUMBERS (sim'd with a decent bot: about 35-40 s to fill; a sharp player about 30): the turd line's 8 s, gaining
// LINE_GAIN a frame on the turd, losing LINE_DRAIN off it; ON THE NOSE +TAP_PERFECT / +TAP_GOOD / -TAP_MISS a press;
// MASH IT's push +MASH_WIN, a miss -MASH_FAIL. SUCCESS full: the clog blows clear (a geyser), a CHARGE SHARD pops up
// out of the bowl (upgrades/state.ts: shards + 1, saved; the find's kept in the save so it's never won twice: thrones.ts
// SHARD_ID), the card (how many, how many to the next power cell; the explain-screen buffer: CARD_HOLD frames, every
// button let go, then a fresh press). Then it's a toilet like the others (thrones.ts: hold down to shit on it).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { setUi, markCollectibleFound } from '../../store';
import { saveProgress } from '../../save';
import { shards, setShards, powerCells, MAX_SHARDS } from '../../upgrades/state';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { minigamePausable } from '../../minigamePause';
import { meatheadSays, speak, saidOver, box, type Said } from '../section';
import { byPants } from '../blvd/kinds';
import { throneAt, plunged, PLUNGED_MEMO, SHARD_LAND, SHARD_ID } from './thrones';
import type { Coaster } from './state';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type Game = 'line' | 'tap' | 'mash';
type Phase = 'ask' | 'leave' | 'intro' | 'title' | Game | 'win' | 'card';

/** Frames: the intro (TEST YOUR PLUNGE!); a round's title; the turd line; a press's wait on the nose; MASH IT's time;
 *  the win (the geyser, the shard coming up) before the card; the card's buffer. */
const INTRO_T = 150, TITLE_T = 70, LINE_T = 480, TAP_WAIT = 210, TAP_N = 5, MASH_T = 300, WIN_T = 110, CARD_HOLD = 90;
/** SUCCESS (0..1): the turd line's gain on it / drain off it a frame; a press on the nose; MASH IT's push, its miss. */
export const LINE_GAIN = 0.0009, LINE_DRAIN = 0.00036, TAP_PERFECT = 0.055, TAP_GOOD = 0.035, TAP_MISS = 0.03, MASH_WIN = 0.16, MASH_FAIL = 0.05;
/** The turd line's bar (a share of the pipe), its push up held, its fall let go, its top speed. */
const BAR_H = 0.26, BAR_UP = 0.0016, BAR_DOWN = 0.0016, BAR_MAX = 0.028;
/** On the nose: the sweet spot's half-widths (perfect, good), the marker's first speed and its gain a press. */
const PERFECT_W = 0.03, GOOD_W = 0.085, TAP_SPEED = 0.016, TAP_SPEEDUP = 0.003;
/** MASH IT: a press's push, the sink a frame, the line. */
const MASH_PUSH = 0.06, MASH_SINK = 0.0035, MASH_LINE = 0.8;
const TITLES: Record<Game, string> = { line: 'THE TURD LINE', tap: 'ON THE NOSE', mash: 'MASH IT!' };
const TIPS: Record<Game, string> = { line: 'HOLD: RAISE THE BAR. KEEP THE TURD IN IT', tap: 'PRESS IN THE SWEET SPOT', mash: 'MASH! PAST THE LINE!' };
const NEXT: Record<Game, Game> = { line: 'tap', tap: 'mash', mash: 'line' };

interface Plunge {
  phase: Phase; t: number; total: number; meter: number; game: Game;
  ask: Ask | null; prev: boolean; anyPrev: boolean; from: { x: number; y: number };
  /** The turd line: his bar (its foot, 0 bottom .. 1 top) and its speed; the turd, its target, frames to a new one. */
  bar: number; vb: number; turd: number; target: number; retarget: number; ease: number; on: boolean;
  /** On the nose: the marker, its way, its speed; the sweet spot's middle; presses made; frames waiting; the verdict. */
  mark: number; dir: number; speed: number; spot: number; taps: number; tapT: number; marks: ('perfect' | 'good' | 'miss')[];
  /** A verdict up (PERFECT, GOOD, MISS, PUSHED!, MISSED!), frames left. */
  flash: string | null; flashT: number; flashGood: boolean;
  /** MASH IT: the gauge; done (pushed or timed out). */
  gauge: number; done: number;
  /** His push (0..1, eased: the plunger's depth, his squash); the panel's shake; the last grunt (frame). */
  pump: number; shake: number; gruntAt: number; duringSaid: number;
  /** The announcer's TEST YOUR PLUNGE (shown while it's said). */
  boom: Said | null;
  cardArmed: boolean;
}
const ALL = new WeakMap<Coaster, Plunge>();
export const plungeOf = (co: Coaster) => ALL.get(co) ?? null;
/** The Godfather's look (shrine.ts paintToilet): 2 plunged, 1 being plunged (he's got the plunger), 0 as ever. */
export const plungeLook = (state: GameState, co: Coaster) => { if (plunged(state)) return 2; const ph = ALL.get(co)?.phase; return ph && ph !== 'ask' && ph !== 'leave' ? 1 : 0; };

/** UP by the clog (index.ts, its prompt up): the ask first. */
export const startPlunge = (state: GameState, co: Coaster) => {
  const p = state.player;
  p.inCutscene = true;
  ALL.set(co, {
    phase: 'ask', t: 0, total: 0, meter: 0, game: 'line', ask: openAsk('TEST YOUR PLUNGE?', "THE GODFATHER'S CLOG HAS BEEN IN THERE SINCE 1994. PLUNGE IT CLEAR TO USE IT. NO DYING, NO QUITTING ONCE IT STARTS."),
    prev: true, anyPrev: true, from: { x: p.pos.x, y: p.pos.y },
    bar: 0, vb: 0, turd: 0.5, target: 0.5, retarget: 0, ease: 0.04, on: false,
    mark: 0, dir: 1, speed: TAP_SPEED, spot: 0.5, taps: 0, tapT: 0, marks: [],
    flash: null, flashT: 0, flashGood: true, gauge: 0, done: 0,
    pump: 0, shake: 0, gruntAt: -9999, duringSaid: 0, boom: null, cardArmed: false,
  });
};

const toGame = (pg: Plunge, g: Game) => {
  pg.game = g; pg.phase = 'title'; pg.t = 0;
  if (g === 'line') { pg.bar = 0; pg.vb = 0; pg.turd = 0.5; pg.target = 0.5; pg.retarget = 0; }
  if (g === 'tap') { pg.taps = 0; pg.marks = []; pg.speed = TAP_SPEED; pg.mark = 0; pg.dir = 1; pg.tapT = 0; pg.spot = 0.25 + Math.random() * 0.5; }
  if (g === 'mash') { pg.gauge = 0; pg.done = 0; }
};
const verdict = (pg: Plunge, text: string, good: boolean) => { pg.flash = text; pg.flashT = 40; pg.flashGood = good; };
const gain = (pg: Plunge, d: number) => { pg.meter = Math.max(0, Math.min(1, pg.meter + d)); };
/** A grunt, now and then (not over anybody). */
const grunt = (state: GameState, pg: Plunge) => {
  if (isTalking() || state.frame - pg.gruntAt < 540) return;
  pg.gruntAt = state.frame; meatheadSays(state, pickLine(byPants(state, L.PLUNGE_GRUNT)), false);
};
/** The bowl's mouth (world). */
const bowl = (g: ReturnType<typeof throneAt>) => ({ x: g.mx + 10, y: g.top - 31 });

const end = (state: GameState, co: Coaster) => {
  const p = state.player;
  ALL.delete(co);
  p.inCutscene = false; p.carried = false; p.spriteScaleY = undefined; p.isGrounded = true; p.vel.x = 0; p.vel.y = 0;
  setUi({ chordTips: null });
};

/** Each frame, while it's on (the ask, the game, the card): the controls to pass on (none), or null (not on). */
export const updatePlunge = (ctx: FrameContext, co: Coaster, controls: Controls, pa: (line: string) => void): Controls | null => {
  const pg = ALL.get(co);
  if (!pg) return null;
  const { state } = ctx, p = state.player, g = throneAt(1), b = bowl(g);
  p.inCutscene = true; p.vel.x = 0;
  // THE ASK: A to accept, B back (nothing changed)
  if (pg.phase === 'leave') {
    const any = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
    if (!any || ++pg.t > 40) { ALL.delete(co); p.inCutscene = false; }
    return { ...NO_CONTROLS };
  }
  if (pg.phase === 'ask') {
    const r = tickAsk(pg.ask!, state.frame);
    // (back: nothing changed; held a moment till the button's let go, so the B that said no doesn't fire his special)
    if (r === 'back') { pg.phase = 'leave'; pg.t = 0; return { ...NO_CONTROLS }; }
    if (r === 'wait') return { ...NO_CONTROLS };
    // (accepted: the announcer first, then him, then the ride's narrator, each in turn)
    pg.ask = null; pg.phase = 'intro'; pg.t = 0; pg.prev = true; pg.anyPrev = true;
    pg.from = { x: p.pos.x, y: p.pos.y };
    speak('announcer', L.ANNOUNCE_PLUNGE, s => { pg.boom = s; }, true);
    meatheadSays(state, pickLine(byPants(state, L.PLUNGE_START)), true);
    pa(pickLine(L.SPIEL_PLUNGE_START));
    playSound('thud', 0.8, -8); shakeScreen(state, 8, 6);
  }
  pg.t++; pg.total++;
  const held = !!controls.jump, press = held && !pg.prev; pg.prev = held;
  const anyHeld = !!(controls.jump || controls.shoot || controls.special || controls.secondary || controls.charge);
  const anyPress = anyHeld && !pg.anyPrev; pg.anyPrev = anyHeld;
  if (pg.flashT > 0 && --pg.flashT === 0) pg.flash = null;
  pg.shake *= 0.85;

  // Him: up on the plinth by the bowl (a hop from where he stood), facing it, the plunger in it, pumping
  p.carried = true; p.vel.y = 0; p.facing = -1; p.isDucking = false; p.isCharging = false; p.isSliding = false;
  const sx = g.mx + 40 - p.width / 2, sy = g.top - p.height, k = Math.min(1, pg.total / 14);
  p.pos.x = pg.from.x + (sx - pg.from.x) * k; p.pos.y = pg.from.y + (sy - pg.from.y) * k - Math.sin(k * Math.PI) * 22;
  p.isGrounded = k >= 1;
  p.spriteScaleY = 1 - 0.09 * pg.pump;

  let push = 0;
  switch (pg.phase) {
    case 'intro':
      if (pg.t >= INTRO_T && !pg.boom) toGame(pg, 'line');
      break;
    case 'title':
      push = 0.3 + 0.3 * Math.sin(pg.t * 0.2);
      if (pg.t === 1) playSound('ding', 0.6, 2);
      if (pg.t >= TITLE_T) { pg.phase = pg.game; pg.t = 0; }
      break;
    case 'line': {
      // (his bar: up held, down let go, bouncing off the floor of the pipe)
      pg.vb = Math.max(-BAR_MAX, Math.min(BAR_MAX, pg.vb + (held ? BAR_UP : -BAR_DOWN)));
      pg.bar += pg.vb;
      if (pg.bar < 0) { pg.bar = 0; pg.vb = -pg.vb * 0.35; }
      if (pg.bar > 1 - BAR_H) { pg.bar = 1 - BAR_H; pg.vb = 0; }
      // (the turd: darting from spot to spot, sometimes lazy, sometimes a sudden dash; wobbling)
      if (--pg.retarget <= 0) {
        pg.target = 0.06 + Math.random() * 0.88; pg.retarget = 30 + Math.floor(Math.random() * 70);
        pg.ease = Math.random() < 0.25 ? 0.09 : 0.025 + Math.random() * 0.03;
      }
      pg.turd += (pg.target - pg.turd) * pg.ease + Math.sin(pg.t * 0.37) * 0.002;
      pg.turd = Math.max(0.03, Math.min(0.97, pg.turd));
      pg.on = pg.turd >= pg.bar && pg.turd <= pg.bar + BAR_H;
      gain(pg, pg.on ? LINE_GAIN : -LINE_DRAIN);
      push = held ? 0.6 + 0.4 * Math.abs(Math.sin(pg.t * 0.25)) : 0.15;
      if (pg.on && pg.t % 24 === 0) playSound('glug', 0.35, -4 + Math.random() * 4);
      if (held && pg.t % 16 === 0) playSound('suck', 0.25, -6);
      if (pg.on && pg.t % 120 === 60) grunt(state, pg);
      if (pg.t >= LINE_T) toGame(pg, NEXT.line);
      break;
    }
    case 'tap': {
      if ((pg.flashT > 20 && pg.flash) || pg.taps >= TAP_N) { push = pg.flashGood ? 1 : 0.2; if (pg.taps >= TAP_N && pg.flashT === 0) toGame(pg, NEXT.tap); break; } // (a beat on the verdict)
      pg.mark += pg.dir * pg.speed;
      if (pg.mark > 1) { pg.mark = 1; pg.dir = -1; }
      if (pg.mark < 0) { pg.mark = 0; pg.dir = 1; }
      pg.tapT++;
      let v: 'perfect' | 'good' | 'miss' | null = null;
      if (press) { const d = Math.abs(pg.mark - pg.spot); v = d <= PERFECT_W ? 'perfect' : d <= GOOD_W ? 'good' : 'miss'; }
      else if (pg.tapT > TAP_WAIT) v = 'miss';
      if (v) {
        pg.marks.push(v); pg.taps++; pg.tapT = 0; pg.speed += TAP_SPEEDUP; pg.spot = 0.15 + Math.random() * 0.7;
        if (v === 'perfect') { gain(pg, TAP_PERFECT); verdict(pg, 'PERFECT!', true); playSound('suck', 0.8, -2); playSound('splat', 0.6, -8); pg.shake = 6; shakeScreen(state, 4, 3); grunt(state, pg); }
        else if (v === 'good') { gain(pg, TAP_GOOD); verdict(pg, 'GOOD', true); playSound('suck', 0.6, -4); pg.shake = 3; }
        else { gain(pg, -TAP_MISS); verdict(pg, 'MISS', false); playSound('fart', 0.4, 8); }
      }
      push = 0.2;
      if (pg.taps >= TAP_N && pg.flashT === 0) toGame(pg, NEXT.tap);
      break;
    }
    case 'mash': {
      if (pg.done > 0) { if (++pg.done > 50) toGame(pg, NEXT.mash); push = pg.flashGood ? 1 : 0.1; break; }
      if (press) { pg.gauge = Math.min(1, pg.gauge + MASH_PUSH); pg.pump = 1; pg.shake = 2; playSound('suck', 0.4, -8 + pg.gauge * 10); }
      pg.gauge = Math.max(0, pg.gauge - MASH_SINK);
      push = press ? 1 : pg.pump * 0.9;
      if (pg.gauge >= MASH_LINE) {
        gain(pg, MASH_WIN); verdict(pg, 'PUSHED!', true); pg.done = 1; pg.shake = 10;
        playSound('glug', 1, -10); playSound('splat', 0.8, -10); shakeScreen(state, 10, 8); grunt(state, pg);
      } else if (pg.t >= MASH_T) { gain(pg, -MASH_FAIL); verdict(pg, 'TOO WEAK!', false); pg.done = 1; playSound('fart', 0.5, 4); }
      break;
    }
    case 'win': {
      push = 0;
      if (pg.t === 1) {
        // THE CLOG BLOWS CLEAR: and up comes the shard (his for good: saved there and then)
        state.stageMemo[PLUNGED_MEMO] = '1';
        setShards(shards() + 1); markCollectibleFound(SHARD_LAND, SHARD_ID); saveProgress();
        playSound('boom', 0.7, -10); playSound('poopsplat', 1, -6); playSound('splash', 1, -10); playSound('glug', 1, -14);
        shakeScreen(state, 22, 14);
        setUi({ chordTips: null });
        meatheadSays(state, pickLine(byPants(state, L.PLUNGE_WIN)), true);
        pa(pickLine(L.SPIEL_PLUNGE_WIN));
      }
      if (pg.t < 70 && pg.t % 2 === 0) {
        // (the geyser: brown, green, paper, a chunk of 1994)
        for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: b.x + (Math.random() - 0.5) * 14, y: b.y - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -9 - Math.random() * 10 * (1 - pg.t / 90) }, life: 50 + Math.random() * 40, color: ['#5C3A16', '#78350F', '#3F2A10', '#5E5628', '#84CC16', '#F4F0E6'][(i + pg.t) % 6], size: 3 + Math.random() * 5, grav: 0.4 });
      }
      if (pg.t === 60) playSound('powerup', 0.8);
      if (pg.t >= WIN_T) { pg.phase = 'card'; pg.t = 0; pg.cardArmed = false; }
      break;
    }
    case 'card': {
      // (the explain screens' buffer: CARD_HOLD frames, every button let go once, then a fresh press)
      if (!pg.cardArmed && pg.t > CARD_HOLD && !anyHeld) pg.cardArmed = true;
      if (pg.cardArmed && anyPress) { end(state, co); pa(pickLine(L.SPIEL_PLUNGE_AFTER)); return { ...NO_CONTROLS }; }
      break;
    }
  }
  pg.pump += (push - pg.pump) * 0.35;
  // (the ride's narrator, annoyed, partway in: he'll be the one cleaning it)
  if ((pg.phase === 'line' || pg.phase === 'tap' || pg.phase === 'mash') && pg.duringSaid < 2 && pg.total > 900 + pg.duringSaid * 1000 && !isTalking()) { pg.duringSaid++; pa(pickLine(byPants(state, L.SPIEL_PLUNGE_DURING))); }
  // SUCCESS full: won
  if (pg.meter >= 1 && pg.phase !== 'win' && pg.phase !== 'card' && pg.phase !== 'intro') { pg.phase = 'win'; pg.t = 0; pg.flash = null; }
  // (the one button, shown up top live while a round's on)
  const tipOn = pg.phase === 'title' || pg.phase === 'line' || pg.phase === 'tap' || pg.phase === 'mash';
  // (START pauses it, the pause menu showing its controls: minigamePause.ts; not on the ask or the shard's card)
  if (tipOn || pg.phase === 'intro' || pg.phase === 'win') minigamePausable(state, 'plunge');
  setUi({ chordTips: tipOn ? [{ pad: ['A'], kb: ['@jump'], label: pg.phase === 'title' ? TIPS[pg.game] : TIPS[pg.phase as Game] }] : null });
  return { ...NO_CONTROLS };
};

/** Stop the lot (the stage going away under it). */
export const dropPlunge = (co: Coaster) => { if (ALL.get(co)?.phase === 'ask') closeAsk(); ALL.delete(co); };

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const INK = '#1C1014';
const GOLD = ['#5A3A06', '#8A5A0A', '#C08414', '#E8B420', '#FDE047', '#FFF6C0'];
const POO = ['#1E1006', '#3A220C', '#5C3A16', '#7A4E1E', '#9A6A2E', '#BC8A48'];
const txt = (c: Ctx, s: string, x: number, y: number, size: number, col: string, shadow = '#000000', align: CanvasTextAlign = 'center') => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = align;
  c.fillStyle = shadow; c.fillText(s, x + Math.max(1, size / 8), y + Math.max(1, size / 8));
  c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
/** A framed panel: ink, a gold bevel, a navy body banded darker toward its foot, rivets at the corners. */
const frame = (c: Ctx, x: number, y: number, w: number, h: number) => {
  box(c, x - 4, y - 4, w + 8, h + 8, INK);
  box(c, x - 3, y - 3, w + 6, h + 6, GOLD[2]); box(c, x - 3, y - 3, w + 6, 1, GOLD[4]); box(c, x - 3, y - 3, 1, h + 6, GOLD[4]);
  box(c, x - 3, y + h + 2, w + 6, 1, GOLD[0]); box(c, x + w + 2, y - 3, 1, h + 6, GOLD[0]);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  const B = ['#1E1B4B', '#1A1740', '#161334', '#110F28'];
  for (let k = 0; k < 4; k++) box(c, x, y + (h * k) / 4, w, h / 4 + 1, B[k]);
  for (const [rx, ry] of [[x + 3, y + 3], [x + w - 6, y + 3], [x + 3, y + h - 6], [x + w - 6, y + h - 6]]) { box(c, rx, ry, 3, 3, GOLD[1]); box(c, rx, ry, 1, 1, GOLD[5]); }
};
/** A turd (the line's): three coils stepped, lit, a glint, a fly or two. */
const turd = (c: Ctx, x: number, y: number, f: number) => {
  const ell = (ex: number, ey: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
  for (const [dx, dy, rx, ry] of [[0, 5, 11, 5], [1, 0, 8, 4.5], [0, -5, 5, 3.5]] as const) { ell(x + dx, y + dy, rx + 1.5, ry + 1.5, INK); }
  for (const [dx, dy, rx, ry] of [[0, 5, 11, 5], [1, 0, 8, 4.5], [0, -5, 5, 3.5]] as const) { ell(x + dx, y + dy, rx, ry, POO[2]); ell(x + dx - rx * 0.2, y + dy - ry * 0.3, rx * 0.6, ry * 0.5, POO[3]); box(c, x + dx - rx * 0.5, y + dy - ry * 0.6, 2, 1, POO[5]); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, y - 8); c.quadraticCurveTo(x + 1, y - 14, x + 4, y - 11); c.lineTo(x + 2, y - 7); c.fill();
  box(c, x + 1, y - 11, 2, 2, POO[4]);
  const a = f * 0.3; box(c, x + Math.cos(a) * 15, y - 10 + Math.sin(a * 1.3) * 5, 2, 2, INK);
};
/** The SUCCESS meter: segments, banded red to gold to green as it fills, a shine along the top. */
const meterBar = (c: Ctx, x: number, y: number, w: number, v: number, f: number) => {
  box(c, x - 2, y - 2, w + 4, 22, INK); box(c, x - 1, y - 1, w + 2, 20, '#3F3F46');
  const n = 20, sw = w / n;
  for (let i = 0; i < n; i++) {
    const on = (i + 1) / n <= v + 1e-6, part = !on && i / n < v;
    const u = i / (n - 1), col = u < 0.35 ? ['#7F1D1D', '#DC2626', '#FCA5A5'] : u < 0.7 ? ['#854D0E', '#EAB308', '#FEF08A'] : ['#14532D', '#22C55E', '#BBF7D0'];
    const sx = x + i * sw + 1;
    if (on || part) { box(c, sx, y + 1, sw - 2, 16, col[0]); box(c, sx, y + 1, sw - 2, 11, col[1]); box(c, sx, y + 2, sw - 2, 2, col[2]); if (part && f % 20 < 10) box(c, sx, y + 1, sw - 2, 16, 'rgba(255,255,255,0.3)'); }
    else box(c, sx, y + 1, sw - 2, 16, '#18181B');
  }
};
/** The charge shard: a crystal, stepped gold-white, a bolt in it, its glow banded. */
export const drawShardGem = (c: Ctx, x: number, y: number, s: number, f: number) => {
  const w = Math.abs(Math.cos(f * 0.08)) * 0.7 + 0.3;
  for (const [r, a] of [[26, 0.12], [18, 0.16], [11, 0.2]] as const) { c.fillStyle = `rgba(253, 224, 71, ${a})`; c.beginPath(); c.arc(x, y, r * s, 0, Math.PI * 2); c.fill(); }
  const pts = (k: number) => { c.beginPath(); c.moveTo(x, y - 16 * s * k); c.lineTo(x + 8 * s * w * k, y - 4 * s * k); c.lineTo(x + 5 * s * w * k, y + 14 * s * k); c.lineTo(x - 5 * s * w * k, y + 14 * s * k); c.lineTo(x - 8 * s * w * k, y - 4 * s * k); c.closePath(); };
  pts(1.15); c.fillStyle = INK; c.fill();
  pts(1); c.fillStyle = '#EAB308'; c.fill();
  c.save(); pts(1); c.clip();
  box(c, x - 8 * s, y - 16 * s, 8 * s * w, 32 * s, '#FDE047'); box(c, x - 6 * s * w, y - 12 * s, 3 * s, 20 * s, '#FFF9DB');
  box(c, x + 3 * s * w, y - 16 * s, 6 * s, 32 * s, '#A16207');
  c.restore();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(1, 1.5 * s); c.beginPath(); c.moveTo(x + 2 * s * w, y - 8 * s); c.lineTo(x - 2 * s * w, y + 1 * s); c.lineTo(x + 2 * s * w, y + 1 * s); c.lineTo(x - 2 * s * w, y + 10 * s); c.stroke();
  if (f % 30 < 4) { box(c, x - 1, y - 22 * s, 2, 6 * s, '#FFFFFF'); box(c, x - 3 * s, y - 19 * s, 6 * s, 2, '#FFFFFF'); }
};

/** In the world, over him: the plunger in his hands down into the bowl (pumping); the shard coming up out of it. */
export const drawPlungeWorld = (c: Ctx, state: GameState, co: Coaster) => {
  const pg = ALL.get(co);
  if (!pg || pg.phase === 'ask' || pg.phase === 'leave') return;
  const g = throneAt(1), b = bowl(g), p = state.player, f = state.frame;
  if (pg.phase !== 'win' && pg.phase !== 'card') {
    const hx = p.pos.x + p.width * 0.28, hy = p.pos.y + p.height * (0.42 + 0.08 * pg.pump);
    const cx = b.x + 2, cy = b.y + 2 + pg.pump * 3, sq = 1 - 0.35 * pg.pump;
    c.lineCap = 'round';
    for (const [w, col] of [[6, INK], [4, '#A16207'], [1, '#D4A040']] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(cx, cy - 8 * sq); c.lineTo(hx, hy); c.stroke(); }
    c.lineCap = 'butt';
    // (the cup: squashed flat on a push, ridged, lit)
    c.fillStyle = INK; c.beginPath(); c.moveTo(cx - 12 - pg.pump * 3, cy + 1); c.quadraticCurveTo(cx, cy - 14 * sq, cx + 12 + pg.pump * 3, cy + 1); c.closePath(); c.fill();
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(cx - 10 - pg.pump * 3, cy); c.quadraticCurveTo(cx, cy - 12 * sq, cx + 10 + pg.pump * 3, cy); c.closePath(); c.fill();
    box(c, cx - 6, cy - 6 * sq, 3, 1, '#FCA5A5'); box(c, cx - 9, cy - 2, 18, 1, '#7F1D1D');
    // (the murk round it, slopping on a push; a bubble now and then)
    if (pg.pump > 0.6 && f % 6 < 3) { box(c, cx - 16, cy - 3, 3, 2, '#5E5628'); box(c, cx + 14, cy - 4, 3, 2, '#5E5628'); }
    if (f % 40 < 10) { c.strokeStyle = '#A3A86A'; c.lineWidth = 1; c.beginPath(); c.arc(cx + 8, cy - 2, 2 + (f % 40) * 0.3, Math.PI, 0); c.stroke(); }
  }
  if (pg.phase === 'win' && pg.t > 30) {
    const u = Math.min(1, (pg.t - 30) / 40);
    drawShardGem(c, b.x, b.y - 20 - 80 * (1 - (1 - u) * (1 - u)), 1, f);
  }
};

/** Over everything (the HUD's pass): the dim round him, the panel, the card. True while it's up. */
export const drawPlungeHud = (c: Ctx, state: GameState, co: Coaster, pa: Said | null): boolean => {
  const pg = ALL.get(co);
  if (!pg || pg.phase === 'ask' || pg.phase === 'leave') return false;
  const g = throneAt(1), f = state.frame;
  const cx = g.mx + 20 - state.camera.x, cy = g.top - 50 - state.camera.y;
  // The world dimmed, banded, round him and the toilet
  for (const r of [250, 215, 185]) { c.fillStyle = 'rgba(8, 4, 16, 0.2)'; c.beginPath(); c.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); c.ellipse(cx, cy, r, r * 0.8, 0, 0, Math.PI * 2); c.fill('evenodd'); }
  // (the ride's narrator's words, low and whole: his own over his head are up in the world)
  if (pa) saidOver(c, pa.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 36, '#FDE68A', 560);
  if (pg.phase === 'card') { drawCard(c, f, pg.cardArmed); return true; }
  // The panel: on the side away from him
  const PW = 236, PH = 360, sh = pg.shake, jx = sh > 0.5 ? (Math.random() - 0.5) * sh : 0, jy = sh > 0.5 ? (Math.random() - 0.5) * sh : 0;
  const px = Math.round((cx > CANVAS_WIDTH / 2 ? 28 : CANVAS_WIDTH - 28 - PW) + jx), py = Math.round(180 + jy);
  frame(c, px, py, PW, PH);
  const mid = px + PW / 2;
  // (the title: slammed in at the start, while the announcer booms it)
  const slam = pg.phase === 'intro' ? Math.max(1, 2.4 - pg.t / 8) : 1;
  c.save(); c.translate(mid, py + 26); c.scale(slam, slam);
  txt(c, 'TEST YOUR', 0, 0, 10, GOLD[4], '#7F1D1D');
  txt(c, 'PLUNGE!', 0, 24, 18, (pg.boom && f % 16 < 8) ? '#FFFFFF' : GOLD[4], '#7F1D1D');
  c.restore();
  box(c, px + 10, py + 60, PW - 20, 2, GOLD[1]); box(c, px + 10, py + 60, PW - 20, 1, GOLD[3]);
  const top = py + 72;
  if (pg.phase === 'intro') {
    txt(c, 'FILL THE SUCCESS', mid, top + 100, 8, '#E4E4E7');
    txt(c, 'METER TO CLEAR', mid, top + 116, 8, '#E4E4E7');
    txt(c, 'THE CLOG', mid, top + 132, 8, '#E4E4E7');
  } else if (pg.phase === 'title') {
    const k = Math.min(1, pg.t / 10);
    txt(c, 'NEXT:', mid, top + 92, 8, '#A1A1AA');
    c.save(); c.translate(mid, top + 122); c.scale(2 - k, 2 - k); txt(c, TITLES[pg.game], 0, 0, 12, '#FDE047', '#7F1D1D'); c.restore();
  } else if (pg.phase === 'line') drawLine(c, pg, mid, top, f);
  else if (pg.phase === 'tap') drawTap(c, pg, px, top, PW, f);
  else if (pg.phase === 'mash') drawMash(c, pg, mid, top, f);
  else if (pg.phase === 'win') {
    const s = 1 + 0.15 * Math.sin(pg.t * 0.4);
    c.save(); c.translate(mid, top + 110); c.scale(s, s); txt(c, 'UNCLOGGED!', 0, 0, 14, '#86EFAC', '#14532D'); c.restore();
  }
  // (the verdict)
  if (pg.flash) txt(c, pg.flash, mid, top + 212, 12, pg.flashGood ? '#FDE047' : '#F87171', '#000000');
  // SUCCESS
  txt(c, 'SUCCESS', px + 12, py + PH - 46, 8, '#E4E4E7', '#000000', 'left');
  meterBar(c, px + 12, py + PH - 36, PW - 24, pg.meter, f);
  return true;
};

/** The turd line: the pipe (sewer water banded down it), his bar (green, lit along its top), the turd. */
const drawLine = (c: Ctx, pg: Plunge, mid: number, top: number, f: number) => {
  const tw = 40, th = 190, tx = mid - tw / 2 - 30, ty = top + 8;
  box(c, tx - 3, ty - 3, tw + 6, th + 6, INK);
  const W = ['#3A3A1A', '#45441E', '#504E22', '#5B5826'];
  for (let k = 0; k < 4; k++) box(c, tx, ty + (th * k) / 4, tw, th / 4 + 1, W[3 - k]);
  for (let k = 0; k < 6; k++) { const yy = ty + ((f * 0.6 + k * 33) % th); box(c, tx + 4 + ((k * 13) % (tw - 8)), yy, 2, 2, '#6E6A30'); }
  box(c, tx - 3, ty - 3, 3, th + 6, '#71717A'); box(c, tx + tw, ty - 3, 3, th + 6, '#3F3F46');
  // (his bar)
  const by = ty + th * (1 - pg.bar - BAR_H), bh = th * BAR_H, col = pg.on ? ['#15803D', '#22C55E', '#BBF7D0'] : ['#14532D', '#16A34A', '#86EFAC'];
  c.globalAlpha = 0.8; box(c, tx + 2, by, tw - 4, bh, col[0]); box(c, tx + 4, by + 2, tw - 8, bh - 4, col[1]); c.globalAlpha = 1;
  box(c, tx + 2, by, tw - 4, 2, col[2]); box(c, tx + 2, by + bh - 2, tw - 4, 2, col[0]);
  turd(c, tx + tw / 2, ty + th * (1 - pg.turd), f);
  // (time left, down the side; ON IT!)
  const left = 1 - pg.t / LINE_T, gx = mid + 34;
  box(c, gx - 1, ty - 1, 10, th + 2, INK); box(c, gx, ty + th * (1 - left), 8, th * left, '#A78BFA'); box(c, gx, ty + th * (1 - left), 2, th * left, '#DDD6FE');
  if (pg.on && f % 20 < 14) txt(c, 'ON IT!', mid + 30, ty + th + 18, 8, '#86EFAC');
  else if (!pg.on) txt(c, 'LOST IT', mid + 30, ty + th + 18, 8, '#F87171');
};
/** On the nose: the bar (red, the good zone, the perfect middle), the marker, the presses so far. */
const drawTap = (c: Ctx, pg: Plunge, px: number, top: number, PW: number, f: number) => {
  const bw = PW - 40, bx = px + 20, by = top + 70, bh = 30;
  box(c, bx - 3, by - 3, bw + 6, bh + 6, INK);
  for (let k = 0; k < 3; k++) box(c, bx, by + k * 10, bw, 10, ['#991B1B', '#7F1D1D', '#5F1414'][k]);
  const gz = bx + bw * (pg.spot - GOOD_W), pz = bx + bw * (pg.spot - PERFECT_W);
  box(c, gz, by, bw * GOOD_W * 2, bh, '#CA8A04'); box(c, gz, by, bw * GOOD_W * 2, 3, '#FDE047');
  box(c, pz, by, bw * PERFECT_W * 2, bh, '#16A34A'); box(c, pz, by, bw * PERFECT_W * 2, 3, '#86EFAC');
  const mx = bx + bw * pg.mark;
  box(c, mx - 2, by - 10, 4, bh + 20, INK); box(c, mx - 1, by - 9, 2, bh + 18, '#FFFFFF');
  c.fillStyle = INK; c.beginPath(); c.moveTo(mx - 7, by - 16); c.lineTo(mx + 7, by - 16); c.lineTo(mx, by - 7); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(mx - 5, by - 15); c.lineTo(mx + 5, by - 15); c.lineTo(mx, by - 9); c.fill();
  // (the presses: a plunger cup each, filled by how it went)
  for (let i = 0; i < TAP_N; i++) {
    const cx = px + PW / 2 + (i - 2) * 30, cy = by + 80, m = pg.marks[i];
    const col = m === 'perfect' ? '#22C55E' : m === 'good' ? '#EAB308' : m === 'miss' ? '#52525B' : '#27272A';
    c.fillStyle = INK; c.beginPath(); c.moveTo(cx - 11, cy + 1); c.quadraticCurveTo(cx, cy - 15, cx + 11, cy + 1); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(cx - 9, cy); c.quadraticCurveTo(cx, cy - 12, cx + 9, cy); c.fill();
    if (m === 'miss') { box(c, cx - 5, cy - 7, 10, 2, '#F87171'); }
  }
  void f;
};
/** MASH IT: the gauge (banded up as it fills), the line to beat, time left. */
const drawMash = (c: Ctx, pg: Plunge, mid: number, top: number, f: number) => {
  const gw = 46, gh = 180, gx = mid - gw / 2 - 20, gy = top + 12;
  box(c, gx - 3, gy - 3, gw + 6, gh + 6, INK); box(c, gx, gy, gw, gh, '#18181B');
  const fh = gh * pg.gauge, R = ['#7F1D1D', '#B91C1C', '#EA580C', '#EAB308', '#FDE047'];
  for (let k = 0; k < 5; k++) { const y0 = gy + gh - fh * (k + 1) / 5; box(c, gx + 2, y0, gw - 4, fh / 5 + 1, R[k]); }
  if (fh > 2) box(c, gx + 2, gy + gh - fh, gw - 4, 2, '#FFF6C0');
  box(c, gx + 4, gy + gh - fh, 3, fh, 'rgba(255,255,255,0.25)');
  const ly = gy + gh * (1 - MASH_LINE);
  box(c, gx - 8, ly - 1, gw + 16, 3, f % 10 < 5 ? '#FFFFFF' : '#FDE047');
  txt(c, 'BLAST', gx + gw + 30, ly + 4, 7, '#FDE047');
  const left = Math.max(0, 1 - pg.t / MASH_T), tx = mid + 40;
  box(c, tx - 1, gy - 1, 10, gh + 2, INK); box(c, tx, gy + gh * (1 - left), 8, gh * left, '#A78BFA');
  if (!pg.done && f % 12 < 8) txt(c, 'MASH!', mid - 20, gy + gh + 20, 10, '#FFFFFF', '#7F1D1D');
};
/** The card: YOU GOT A CHARGE SHARD, how many of how many, what's next; PRESS ANY BUTTON once it's armed. */
const drawCard = (c: Ctx, f: number, armed: boolean) => {
  const w = 460, h = 220, x = (CANVAS_WIDTH - w) / 2, y = 190;
  frame(c, x, y, w, h);
  const n = shards(), toNext = 3 - (n % 3), cells = powerCells();
  txt(c, 'YOU GOT', CANVAS_WIDTH / 2, y + 26, 9, GOLD[4]);
  txt(c, 'A CHARGE SHARD!', CANVAS_WIDTH / 2, y + 52, 16, '#FFFFFF', '#7F1D1D');
  drawShardGem(c, x + 58, y + 120, 1.4, f);
  drawShardGem(c, x + w - 58, y + 120, 1.4, f + 40);
  txt(c, `CHARGE SHARDS: ${n} / ${MAX_SHARDS}`, CANVAS_WIDTH / 2, y + 96, 9, '#FDE047');
  const next = n >= MAX_SHARDS ? 'EVERY SHARD FOUND!' : n % 3 === 0 ? `A NEW POWER CELL! ${cells} CELLS NOW` : `${toNext} MORE TO THE NEXT POWER CELL`;
  txt(c, next, CANVAS_WIDTH / 2, y + 122, 8, '#E4E4E7');
  txt(c, 'EVERY 3 YOU FIND MAKE', CANVAS_WIDTH / 2, y + 146, 7, '#A1A1AA');
  txt(c, 'ANOTHER POWER CELL', CANVAS_WIDTH / 2, y + 160, 7, '#A1A1AA');
  if (armed && f % 40 < 28) txt(c, 'PRESS ANY BUTTON', CANVAS_WIDTH / 2, y + h - 18, 8, '#D4D4D8');
};
