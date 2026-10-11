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
import { INK, checker, mix, stamp, LAVA, blob, thick, inked, path } from './paint';
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

const RED = ['#220303', '#420606', '#640C0A', '#861612', '#A6261C', '#C4422E'];
const HORNS = ['#0A0808', '#1A1414', '#2C2424', '#443838', '#5E5050'];
const HAIR = ['#060404', '#141010', '#241C1C'];
const WING = ['#160404', '#260808', '#3A0E0C', '#521612'];
/** The lava's light from under him on a color. */
const under = (c: string, k = 0.4) => mix(c, '#F07A30', k);

/** The still part of him (local: x 0 his middle, y 0 the top of his horns' reach; 640 tall), painted once. */
const paintSatan = (g: Ctx) => {
  // The wings: spread behind his shoulders, finger bones out to their claws, the membranes scalloped between
  for (const s of [-1, 1]) {
    const sx = s * 150, sy = 300;
    const tips: [number, number][] = [[s * 330, 70], [s * 360, 190], [s * 340, 320], [s * 290, 420]];
    const edge: [number, number][] = [[sx, sy - 20], [s * 250, 40], ...tips.flatMap(([tx, ty], i): [number, number][] => [[tx, ty], [s * (300 - i * 12), ty + 50]]), [s * 200, 470]];
    inked(g, edge, WING[1], 3);
    g.save(); path(g, edge); g.clip();
    for (const [tx, ty] of tips) { g.fillStyle = WING[2]; g.beginPath(); g.moveTo(sx, sy - 10); g.lineTo(tx, ty); g.lineTo(tx - s * 30, ty + 50); g.closePath(); g.fill(); }
    checker(g, s < 0 ? -380 : 0, 0, 380, 500, WING[0], 0);
    g.restore();
    // (the arm of the wing, and its fingers)
    thick(g, sx, sy - 20, s * 250, 40, 14, WING);
    for (const [tx, ty] of tips) thick(g, s * 250, 40, tx, ty, 6, WING);
    for (const [tx, ty] of tips) { box(g, tx - 3, ty - 3, 6, 6, INK); box(g, tx - 2, ty - 2, 4, 4, HORNS[4]); }
    inked(g, [[s * 248, 34], [s * 262, 8], [s * 256, 40]], HORNS[3]);
  }
  // The shoulders and chest: a wrestler's; the collarbones, the pecs, the gut's top ridges (lit from under)
  inked(g, [[-300, 640], [-280, 360], [-230, 300], [-120, 270], [120, 270], [230, 300], [280, 360], [300, 640]], RED[2], 3);
  for (const s of [-1, 1]) blob(g, s * 212, 350, 80, 60, RED);
  blob(g, -68, 404, 86, 48, RED); blob(g, 68, 404, 86, 48, RED);
  for (const s of [-1, 1]) {
    box(g, Math.min(s * 40, s * 130), 292, 90, 4, RED[1]); box(g, Math.min(s * 40, s * 130), 296, 90, 2, RED[4]);
  }
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) blob(g, s * 30, 500 + i * 46, 26, 20, RED, true, 2);
  box(g, -3, 300, 6, 340, RED[0]);
  // The arms, folded across him: the near forearm over the far, the fists, the claws
  thick(g, -250, 380, -180, 520, 70, RED); thick(g, 250, 380, 180, 520, 70, RED);
  blob(g, -40, 488, 170, 34, RED); thick(g, -200, 492, 120, 486, 58, RED);
  blob(g, 140, 484, 34, 30, RED);
  for (let i = 0; i < 3; i++) { inked(g, [[166, 466 + i * 16], [184, 470 + i * 16], [172, 478 + i * 16]], HORNS[3]); }
  blob(g, 40, 534, 170, 30, RED); thick(g, 200, 540, -120, 532, 52, RED);
  blob(g, -136, 528, 30, 28, RED);
  for (let i = 0; i < 3; i++) { inked(g, [[-160, 512 + i * 14], [-178, 516 + i * 14], [-166, 524 + i * 14]], HORNS[3]); }
  // The neck
  inked(g, [[-56, 300], [-48, 240], [48, 240], [56, 300]], RED[2], 3);
  box(g, -46, 250, 92, 40, RED[1]); box(g, -46, 244, 20, 50, RED[3]);
  for (const s of [-1, 1]) { g.strokeStyle = RED[0]; g.lineWidth = 4; g.beginPath(); g.moveTo(s * 30, 248); g.lineTo(s * 50, 300); g.stroke(); }
  // The head: long, gaunt; the ears; the horns; the hair
  for (const s of [-1, 1]) inked(g, [[s * 70, 130], [s * 118, 96], [s * 92, 150], [s * 74, 176]], s < 0 ? RED[2] : RED[3], 3);
  for (const s of [-1, 1]) {
    const hp: [number, number][] = [[s * 40, 84], [s * 90, 56], [s * 140, 20], [s * 150, -30], [s * 128, -70], [s * 134, -24], [s * 116, 18], [s * 80, 56], [s * 60, 96]];
    inked(g, hp, HORNS[2], 3);
    g.save(); path(g, hp); g.clip();
    box(g, s < 0 ? -160 : 100, -80, 60, 60, HORNS[3]);
    for (let i = 0; i < 6; i++) box(g, s * (70 + i * 13) - 6, 70 - i * 22, 14, 3, HORNS[0]);
    box(g, s < 0 ? -160 : 120, -80, 40, 200, HORNS[1]);
    g.restore();
    box(g, s * 128 - 2, -66, 4, 6, HORNS[4]);
  }
  // (the face)
  const face: [number, number][] = [[-76, 90], [-60, 50], [0, 34], [60, 50], [76, 90], [74, 170], [50, 230], [0, 262], [-50, 230], [-74, 170]];
  inked(g, face, RED[3], 3);
  g.save(); path(g, face); g.clip();
  box(g, -80, 30, 160, 240, RED[3]);
  box(g, -80, 30, 44, 240, RED[4]); checker(g, -36, 30, 4, 240, RED[4]);
  box(g, 44, 30, 40, 240, RED[2]); checker(g, 40, 30, 4, 240, RED[2], 1);
  // (the cheekbones' hollows, stepped)
  for (const s of [-1, 1]) { g.fillStyle = RED[1]; g.beginPath(); g.moveTo(s * 70, 150); g.lineTo(s * 40, 176); g.lineTo(s * 56, 222); g.lineTo(s * 74, 186); g.closePath(); g.fill(); }
  // (lit from under: the jaw and chin's undersides hot)
  box(g, -60, 236, 120, 30, under(RED[3], 0.3));
  g.restore();
  // (the hair: slicked back off a widow's peak)
  inked(g, [[-80, 96], [-70, 44], [-30, 22], [0, 18], [30, 22], [70, 44], [80, 96], [62, 64], [24, 52], [0, 82], [-24, 52], [-62, 64]], HAIR[1], 3);
  for (let i = 0; i < 5; i++) box(g, -50 + i * 22, 30 + (i % 2) * 4, 12, 2, HAIR[2]);
  // (the brows, down hard; the eyes' sockets; the nose)
  for (const s of [-1, 1]) {
    inked(g, [[s * 8, 118], [s * 64, 96], [s * 70, 108], [s * 14, 128]], HAIR[1], 2);
    g.fillStyle = RED[1]; g.beginPath(); g.moveTo(s * 14, 128); g.lineTo(s * 60, 112); g.lineTo(s * 58, 148); g.lineTo(s * 18, 146); g.closePath(); g.fill();
  }
  inked(g, [[-8, 128], [8, 128], [16, 186], [0, 194], [-16, 186]], RED[3], 2);
  box(g, -12, 182, 8, 4, RED[0]); box(g, 4, 182, 8, 4, RED[0]); box(g, -6, 140, 4, 40, RED[4]);
  // (the mustache, curled up at the ends; the pointed beard)
  inked(g, [[-6, 198], [-56, 200], [-70, 184], [-58, 194], [-20, 190], [0, 196], [20, 190], [58, 194], [70, 184], [56, 200], [6, 198]], HAIR[1], 2);
  inked(g, [[-30, 236], [30, 236], [6, 320], [0, 336], [-6, 320]], HAIR[1], 2);
  box(g, -20, 242, 4, 40, HAIR[2]);
};

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
  c.save(); c.translate(x, top + 0);
  stamp(c, 'hell-satan', -400, -90, 800, 740, paintSatan);
  // The eyes: burning (hot yellow, slit; no glow round them)
  for (const s of [-1, 1]) {
    const ex = s * 36, ey = 132;
    c.fillStyle = INK; c.beginPath(); c.moveTo(ex - 18, ey + 2); c.lineTo(ex + s * 4, ey - 9); c.lineTo(ex + 18, ey - 2); c.lineTo(ex - s * 2, ey + 8); c.closePath(); c.fill();
    c.fillStyle = LAVA[6]; c.beginPath(); c.moveTo(ex - 14, ey + 1); c.lineTo(ex + s * 4, ey - 6); c.lineTo(ex + 14, ey - 1); c.lineTo(ex - s * 2, ey + 5); c.closePath(); c.fill();
    box(c, ex - 6, ey - 3, 10, 4, LAVA[7]); box(c, ex - 1, ey - 6, 3, 11, INK);
  }
  // The mouth: a grin under the mustache, moving when he speaks; the teeth, a forked tongue
  const open = talking ? 6 + Math.round(Math.abs(Math.sin(f * 0.35)) * 14) : 4;
  box(c, -48, 203, 96, open + 6, INK);
  box(c, -46, 205, 92, open + 2, '#1C0303');
  for (let i = 0; i < 7; i++) { box(c, -40 + i * 12, 205, 8, 6, '#F2E6C8'); box(c, -40 + i * 12, 209, 8, 2, '#C8B890'); }
  for (const s of [-1, 1]) { c.fillStyle = '#F2E6C8'; c.beginPath(); c.moveTo(s * 34, 205); c.lineTo(s * 30, 217); c.lineTo(s * 26, 205); c.fill(); }
  if (open > 10) { box(c, -12, 205 + open - 4, 24, 6, '#9E2A3A'); box(c, -8, 205 + open - 4, 6, 2, '#C8505E'); }
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
