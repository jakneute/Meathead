// After the demon: the cutscene (the HUD down from its first frame; skippable, all of it, SKIP >>). He whines for his
// dad (DEMON_BEATEN) and sinks away into the floor; Meathead has something to say about it; the lava lake behind the
// pit churns and SATAN comes up out of it (big: the camera pulls back to take him in); Meathead says hi; Satan's line
// (SATAN_CORE, always), and a parting shot by the state of his pants; the floor under Meathead glows and cracks, and a
// lava geyser blows him straight up and out of hell (into Donnie's control room: DOORS.control.start).
//
// The geyser's vent (VENT_X, EXPRESS TO SURFACE) stays: stepping on it (once the demon's beaten) blows him up there
// again, no Satan (a revisit, or starting from the doorstep).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, teleport, meatheadSays, speak, saidOver, box, type Said } from '../section';
import { DOORS, GY } from '../geometry';
import { ARENA_MID, VENT_X } from './layout';
import { hellOf } from './state';
import { INK, stamp, LAVA } from './paint';
import { paintSatan, drawSatanFace } from './satanArt';
import { demonOf, demonSays, sinkDemon, tickSink, settleDemon } from './demon';
import { DEMON_BEATEN, MH_LEAVES, MH_SATAN, MH_LAUNCH, SATAN_CORE, SATAN_PARTING } from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;

type Step = 'whine' | 'sink' | 'leaves' | 'rise' | 'hi' | 'core' | 'parting' | 'glow' | 'launch' | 'fade';
export interface Finale {
  step: Step; t: number; total: number;
  /** Waiting on a line: set true when it's done. */
  done: boolean; asked: boolean;
  /** Satan: how far up out of the lava (0..1), what he's saying; the geyser (where, how high). */
  rise: number; said: Said | null; gx: number; geyser: number;
  /** The whole thing, or just the vent (no Satan): the way up again. */
  full: boolean;
  /** The white at the end (0..1). */
  white: number;
}

/** Satan's middle, and how tall he stands up out of the lake when he's all the way up. */
const SATAN_X = ARENA_MID, SATAN_H = 700;

const dressedPool = (state: GameState) => SATAN_PARTING[isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean'];

/** The demon's just been beaten: the cutscene. */
export const startFinale = (state: GameState) => {
  hellOf(state).fin = { step: 'whine', t: 0, total: 0, done: false, asked: false, rise: 0, said: null, gx: 0, geyser: 0, full: true, white: 0 };
  state.player.inCutscene = true;
};
/** On the vent: up the geyser (no Satan). */
export const startVent = (state: GameState) => {
  hellOf(state).fin = { step: 'glow', t: 0, total: 0, done: false, asked: false, rise: 0, said: null, gx: VENT_X, geyser: 0, full: false, white: 0 };
  state.player.inCutscene = true;
  playSound('rumble', 0.8, -4);
};

const go = (fin: Finale, step: Step) => { fin.step = step; fin.t = 0; fin.done = false; fin.asked = false; };

const out = (state: GameState) => {
  const h = hellOf(state), p = state.player;
  const d = demonOf(state);
  if (d && d.fight !== 'gone') { d.fight = 'gone'; d.sink = 1; d.said = null; }
  h.fin = null;
  p.inCutscene = false;
  teleport(state, DOORS.control.start.x, DOORS.control.start.y);
  p.facing = 1;
};

/** Each frame of it: true while it's running (it has the controls). */
export const runFinale = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, p = state.player;
  const fin = hellOf(state).fin;
  if (!fin) return null;
  fin.t++; fin.total++;
  p.inCutscene = true;
  if (fin.total > SKIP_AFTER) offerSkip();
  if (fin.total > SKIP_AFTER && takeSkip()) { silenceAll(); out(state); return hands(); }
  const d = demonOf(state);
  // (he stays put through it; the launch excepted)
  if (fin.step !== 'launch' && fin.step !== 'fade') { p.vel.x = 0; p.isCharging = false; p.isSliding = false; }
  /** Ask a line once; the step's done when it is (or a long while's gone by: nothing hangs). */
  const line = (ask: () => void, maxT = 600) => { if (!fin.asked) { fin.asked = true; ask(); } return fin.done || fin.t > maxT; };
  switch (fin.step) {
    case 'whine':
      if (d) settleDemon(state, d);
      if (d && line(() => demonSays(state, d, DEMON_BEATEN, true, () => { fin.done = true; }))) { sinkDemon(d); go(fin, 'sink'); }
      else if (!d) go(fin, 'leaves');
      break;
    case 'sink':
      if (d) tickSink(state, d);
      if (!d || d.fight === 'gone') go(fin, 'leaves');
      break;
    case 'leaves':
      if (fin.t > 20 && line(() => meatheadSays(state, pick(MH_LEAVES), true, () => { fin.done = true; }))) { go(fin, 'rise'); playSound('rumble', 1, -10); }
      break;
    case 'rise':
      fin.rise = Math.min(1, fin.t / 160);
      if (fin.t % 20 === 0) { shakeScreen(state, 10, 6); playSound('rumble', 0.7, -12); }
      if (fin.t === 60) playSound('roar', 1, -14);
      if (fin.t > 30 && fin.t % 3 === 0) state.particles.push({ pos: { x: SATAN_X + (Math.random() - 0.5) * 500, y: GY - 110 }, vel: { x: (Math.random() - 0.5) * 2, y: -4 - Math.random() * 4 }, life: 40, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
      if (fin.t > 175) go(fin, 'hi');
      break;
    case 'hi':
      if (line(() => meatheadSays(state, pick(MH_SATAN), true, () => { fin.done = true; }))) go(fin, 'core');
      break;
    case 'core':
      if (line(() => speak('m2.satan', SATAN_CORE, s => { fin.said = s; }, true, () => { fin.done = true; }), 900)) go(fin, 'parting');
      break;
    case 'parting':
      if (line(() => speak('m2.satan', pick(dressedPool(state)), s => { fin.said = s; }, true, () => { fin.done = true; }))) {
        go(fin, 'glow'); fin.gx = p.pos.x + p.width / 2; playSound('rumble', 1, -4);
      }
      break;
    case 'glow':
      // (the floor under him going hot and cracking: his line about it, if it's the whole thing)
      if (fin.full && !fin.asked) line(() => meatheadSays(state, pick(MH_LAUNCH), true, () => { fin.done = true; }));
      if (fin.t % 10 === 0) { shakeScreen(state, 6, 4); state.particles.push({ pos: { x: fin.gx + (Math.random() - 0.5) * 50, y: GY - 2 }, vel: { x: 0, y: -2 }, life: 20, color: '#FDE047', size: 3 }); }
      if (fin.t > (fin.full ? 70 : 40) && (fin.done || !fin.full || fin.t > 400)) {
        go(fin, 'launch');
        playSound('boom', 1, -8); playSound('flame', 1, -6); shakeScreen(state, 24, 10);
        p.pos.x = fin.gx - p.width / 2;
      }
      break;
    case 'launch':
      fin.geyser = Math.min(1, fin.t / 10);
      p.vel.x = 0; p.vel.y = -24; p.isGrounded = false;
      if (fin.t % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: fin.gx + (Math.random() - 0.5) * 60, y: GY - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -6 - Math.random() * 8 }, life: 30, color: i % 2 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5, grav: 0.2 });
      if (fin.t > 55) go(fin, 'fade');
      break;
    case 'fade':
      p.vel.y = -24;
      fin.white = Math.min(1, fin.t / 24);
      if (fin.t > 30) { out(state); fin.white = 1; }
      break;
  }
  return hands();
};

/** The camera pulled back to take Satan in (eased), from his rise to the end. */
export const finaleZoom = (state: GameState) => {
  const fin = hellOf(state).fin;
  if (!fin?.full || fin.rise <= 0) return null;
  const u = Math.min(1, fin.rise * 1.6), k = u * u * (3 - 2 * u);
  const x = SATAN_X, y = GY - 330;
  return { scale: 1 - 0.38 * k, x, y, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - x), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - y) };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, world space: Satan, a big SNES boss sprite (painted once into a stamp; what moves, live over it: the crown
// of fire behind his head, his mouth). Up out of the lake: great bat wings behind him, the shoulders and chest of a
// wrestler, arms folded; a long gaunt face, horns curling up and out, slicked-back hair to a widow's peak, the brows,
// burning eyes, a pointed beard. Lit from below by the lava (the hot light along the undersides of everything).

/** Satan, up out of the lava lake behind the pit (drawn before the pit's floor: it's in front of him). */
export const drawSatan = (c: Ctx, state: GameState) => {
  const fin = hellOf(state).fin;
  if (!fin?.full || fin.rise <= 0) return;
  const f = state.frame, k = fin.rise * fin.rise * (3 - 2 * fin.rise);
  const base = GY + 40, top = Math.round(base - SATAN_H * k), x = SATAN_X;
  const talking = !!fin.said;
  // (the crown of fire behind his head: stepped tongues, dim (it's behind him; no glare))
  const cy = top + 150;
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (i - 5) * 0.24, r = 180 + Math.round(Math.sin(f * 0.2 + i) * 14) + (i % 2) * 30;
    for (const [col, kk, ww] of [[LAVA[1], 1, 0.11], [LAVA[2], 0.82, 0.08], [LAVA[3], 0.6, 0.05]] as [string, number, number][]) {
      c.fillStyle = col; c.beginPath(); c.moveTo(x + Math.cos(a - ww * 2) * 60, cy + Math.sin(a - ww * 2) * 60);
      c.lineTo(x + Math.cos(a) * r * kk, cy + Math.sin(a) * r * kk); c.lineTo(x + Math.cos(a + ww * 2) * 60, cy + Math.sin(a + ww * 2) * 60); c.fill();
    }
  }
  c.save(); c.translate(x, top);
  stamp(c, 'hell-satan2', -440, -90, 880, 740, paintSatan);
  drawSatanFace(c, f, talking);
  c.restore();
};

const GEYSER = [LAVA[2], LAVA[3], LAVA[5], LAVA[6], LAVA[7]];

/** The geyser (a column of lava up from the floor: in bands, its edges churning, blobs flung off it), and the floor
 *  going hot and cracking under him first. */
export const drawGeyser = (c: Ctx, state: GameState) => {
  const fin = hellOf(state).fin, f = state.frame;
  if (fin && fin.step === 'glow') {
    const k = Math.min(1, fin.t / 40), gx = Math.round(fin.gx);
    // (the floor going hot: stepped, the cracks running out from it)
    for (const [r, col] of [[1, LAVA[2]], [0.66, LAVA[4]], [0.33, LAVA[6]]] as [number, string][]) box(c, Math.round(gx - (30 + k * 30) * r), GY - 2, Math.round((60 + k * 60) * r), 3, col);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6, len = Math.round(40 * k);
      for (let s = 4; s < len; s += 4) box(c, Math.round(gx + Math.cos(a) * s), GY - 1 + ((s >> 2) % 2), 3, 2, s < len * 0.5 ? LAVA[6] : LAVA[4]);
    }
  }
  if (fin && (fin.step === 'launch' || fin.step === 'fade') && fin.geyser > 0) {
    const top = Math.floor((state.camera.y - 400) / 6) * 6, w = 70, gx = Math.round(fin.gx);
    for (let i = 0; i < GEYSER.length; i++) {
      const ww = w - i * 12;
      for (let y = top; y < GY; y += 6) {
        const wob = Math.round(Math.sin(f * 0.6 + y * 0.05 + i) * 4);
        box(c, gx - Math.round(ww / 2) + wob, y, ww, 6, GEYSER[i]);
      }
    }
    // (blobs flung off its sides)
    for (let i = 0; i < 6; i++) {
      const ph = (f * 4 + i * 53) % 200, s = i % 2 ? 1 : -1, bx = gx + s * (36 + ph * 0.3), by = GY - 40 - ph * 2;
      box(c, Math.round(bx) - 4, Math.round(by) - 4, 8, 8, INK); box(c, Math.round(bx) - 3, Math.round(by) - 3, 6, 6, LAVA[5]); box(c, Math.round(bx) - 2, Math.round(by) - 2, 2, 2, LAVA[7]);
    }
  }
};

/** Over everything (screen space): the letterbox (the cutscene's framing), Satan's words, the white at the end, the skip. */
export const drawFinaleHud = (c: Ctx, state: GameState) => {
  const fin = hellOf(state).fin;
  if (!fin) return;
  const bar = Math.min(1, fin.total / 20) * 48;
  box(c, 0, 0, CANVAS_WIDTH, bar, '#000000'); box(c, 0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar, '#000000');
  // (Satan's words: up top, big enough to read with the camera pulled right back)
  if (fin.said) saidOver(c, fin.said.text, CANVAS_WIDTH / 2, 112, '#FCA5A5', 460);
  if (fin.white > 0) { c.fillStyle = `rgba(255, 247, 237, ${fin.white})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (fin.total > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
