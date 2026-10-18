// TUCKER'S ARENA ENTRY (the user's: "after getting impaled by the tree branch, he runs off to the right, taunting you to
// fight him, man to man. there's a tree with a lumberjack axe sticking in it. with one swing, meathead chops down the
// tree and it falls on his head, pushing the buzzsaw in his forehead further down splitting his face up to his nose in
// half now. then the fight begins. be sure to show a closeup of this happening.")
//
// Straight on from the fake-out's "NOW! ABOUT THAT FARE!", the same cutscene (no HUD, no controls; SKIP >> for all of
// it lands on the fight's start with the tree down and him split): Tucker runs off right past the oak to the axe tree
// (a tall pine, a lumberjack's axe stuck in its near side) and turns round just past it: MAN TO MAN (TUCKER_TAUNT).
// Meathead walks up to the tree (MH_AXE), yanks the axe out, hoists it over his shoulder and with ONE swing (his own pose:
// Player.axeSwing) goes clean through the trunk. It creaks over, faster and faster, onto Tucker's head, still gloating.
// THE CLOSE-UP (the mutilation rule: animated, graphic, full detail; this file's 'split' painter on tucker.ts's close-up,
// the head itself drawn split as it goes): the trunk coming down on him, the slam onto the saw's back, the saw driven
// down through his skull to the top of his nose, his face splitting in half up from there (the two halves shoved apart,
// the skull's bone white at the lips, brains bulging), the far eye bursting out of its socket on its snapped nerve, the
// spectacles snapped at the bridge, blood and bone and bark chips everywhere; the trunk bouncing off him; the blood
// fountaining up out of the V a beat at a time; his scream (TUCKER_SPLIT). Behind the close-up the trunk slides off the
// stump to the ground (from then on a low log, its bare part a ledge) and Meathead plants the axe in the stump (it stays
// there: scenery, not a pickup). Wide: Tucker staggers out from under it, groping, blind: "I CAN'T SEE!" (TUCKER_BLIND);
// Meathead's say (MH_BLIND); "...DOESN'T MATTER!" squared up at nothing (TUCKER_MATTER). His fight starts there (`onUp`).
// SPLIT_MEMO ('frontier-tucker-split') is set: tucker.ts draws him split and blind from here on (`split`).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { AXE_BITE } from '../../../m1/game/render/player/moves';
import { hands, saidOver, teleport, ledge } from '../section';
import { box, mix, INK, type Ctx } from '../kit';
import { drawTuckerCloseup, drawBough, registerWoundPainter, SPLIT_EYES_AT, type TuckerFace } from '../tucker';
import { GY, AXE_TREE_X, AXE_TR, CUT_H, MH_CHOP_X, TAUNT_X, FIGHT_X, LOG_X, LOG_BARE } from './layout';
import { arenaOf, next, markIntroSeen, UP_MEMO, SPLIT_MEMO, type Arena } from './state';
import { tuckerSays, meatheadLine, camTo, camSnap, tickTucker, WOUNDS_ALL } from './cast';
import { setBranchMemos } from './catchup';
import { TUCKER_TAUNT, MH_AXE, TUCKER_SPLIT, TUCKER_BLIND, MH_BLIND, TUCKER_MATTER } from './lines';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** How far over the trunk's tipped when it meets the top of the saw on his head (him taunting at TAUNT_X, facing back
 *  at the tree: the saw's top ~102 up, 5 in front of his middle), its underside on it. */
const TH_HIT = (() => {
  const cx = TAUNT_X - 5.3 - AXE_TREE_X, cy = 101.7 - CUT_H, d = Math.hypot(cx, cy);
  return Math.atan2(cx, cy) - Math.asin(AXE_TR / d);
})();

/** The felled trunk's bare part: a low ledge (its lit top drawn by art.ts), laid once it's down. */
export const layLog = (state: GameState, s: Arena) => {
  if (s.logLaid) return;
  s.logLaid = true;
  ledge(state, LOG_X, GY - 2 * AXE_TR, LOG_BARE, { hidden: true });
};
/** The world after the entry: the tree down along the ground, the axe in the stump, him split (a retry, a skip, a
 *  revisit). */
export const setFelled = (state: GameState, s: Arena) => {
  s.tree = 'down'; s.treeTh = Math.PI / 2; s.treeVth = 0; s.treeDrop = 1; s.axe = 'stump'; s.split = true; s.snapped = true;
  layLog(state, s);
};

// ---------------------------------------------------------------------------------------------------------------
// The beat (on from the fake-out: the same cutscene)

export const startEntry = (state: GameState) => {
  const s = arenaOf(state), p = state.player;
  s.phase = 'entry'; next(s, 'run'); s.busy = false; s.said = null; s.talking = false;
  setBranchMemos(state); state.stageMemo[UP_MEMO] = '1'; markIntroSeen();
  s.tMode = 'up'; s.ty = GY; s.hop = null; s.tvx = 0; s.tvy = 0; s.tFacing = 1; s.pose = 'run'; s.face = 'manic'; s.snapped = true;
  p.inCutscene = true; p.vel.x = 0; p.isDucking = false;
};

/** A frame of it (it has the controls). Null once it's over. `onUp`: the fight's on. */
export const updateEntry = (ctx: FrameContext, onUp: (state: GameState) => void): Controls | null => {
  const { state } = ctx, s = arenaOf(state), p = state.player;
  if (s.phase !== 'entry') return null;
  s.t++; s.all++;
  p.inCutscene = true;
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finishEntry(state, true); onUp(state); return hands(); } }
  tickTucker(s);
  tickTree(state, s);
  if (s.squash > 0 && !(s.step === 'close' && s.t < 40)) s.squash = Math.max(0, s.squash - 0.03);
  const mid = pmid(state);
  switch (s.step) {
    case 'run':
      // (off to the right, past the oak, manic, fists pumping; Meathead left standing)
      p.vel.x = 0;
      s.tx = Math.min(TAUNT_X, s.tx + 4.4);
      if (s.t % 12 === 0) playSound('land', 0.3, 6);
      camTo(state, s, Math.max((mid + s.tx) / 2, s.tx - 330), 0.1);
      if (s.tx >= TAUNT_X) { s.tFacing = -1; s.pose = 'furious'; s.face = 'manic'; next(s, 'taunt'); }
      break;
    case 'taunt':
      // (round, just past the axe tree: man to man)
      p.vel.x = 0;
      camTo(state, s, Math.max((mid + s.tx) / 2, s.tx - 330), 0.1);
      if (s.t === 8) { s.pose = 'point'; tuckerSays(state, s, TUCKER_TAUNT, () => next(s, 'walk')); }
      break;
    case 'walk':
      // (Meathead walks up to the tree; Tucker stamping, waiting on him)
      s.pose = 'furious';
      camTo(state, s, (mid + s.tx) / 2, 0.1);
      if (mid < MH_CHOP_X - 3) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; p.facing = 1; teleport(state, MH_CHOP_X, GY); next(s, 'mh');
      break;
    case 'mh':
      p.vel.x = 0;
      if (s.t === 6) { s.pose = 'point'; meatheadLine(state, s, MH_AXE, () => next(s, 'swing')); }
      break;
    case 'swing': {
      // (the axe: yanked out (0..0.2), hoisted over his shoulder (to 0.48), ONE swing (to the bite))
      p.vel.x = 0; p.facing = 1;
      if (s.t === 1) s.axe = 'held';
      const t = s.t, k = t < 30 ? 0.2 * (t / 30) : t < 64 ? 0.2 + 0.28 * ((t - 30) / 34) : 0.48 + (AXE_BITE - 0.48) * ((t - 64) / 5);
      p.axeSwing = Math.min(AXE_BITE, k);
      if (t === 10 || t === 20) playSound('crack', 0.35, -10 + t / 4);
      if (t === 27) { playSound('whoosh', 0.5, -8); playSound('crack', 0.5, -4); }
      if (t === 64) playSound('whoosh', 1, -6);
      if (k >= AXE_BITE) chop(state, s);
      break;
    }
    case 'fall': {
      // (the follow-through held; the tree creaking over, faster and faster, onto his head: he's still gloating)
      p.vel.x = 0;
      p.axeSwing = Math.min(1, (p.axeSwing ?? AXE_BITE) + (p.axeSwing! < 0.62 ? 0.016 : 0.008));
      camTo(state, s, (MH_CHOP_X + TAUNT_X) / 2 + 20, 0.1);
      if (s.t === 30) { s.face = 'shock'; s.pose = 'stand'; }
      if (s.treeTh >= TH_HIT) hit(state, s);
      break;
    }
    case 'close': {
      // (the close-up: the trunk on his head, the saw driven down, his face split to the nose; his scream; then wide.
      // Behind it the trunk slides off the stump to the ground, the axe goes in the stump)
      s.splitK = Math.min(1, s.t / 170);
      if (s.t === 2) { playSound('crunch', 1, -10); playSound('crack', 1, -6); }
      if (s.t === 9) { playSound('squish', 1, -4); playSound('splat', 1, -6); }
      if (s.t === 16) { playSound('gorespray', 1, -2); playSound('crunch', 1, 2); shakeScreen(state, 10, 5); }
      if (s.t === 26) playSound('splat', 0.8, 10);
      if (s.t > 40 && s.t < 150 && s.t % 28 === 0) playSound('gush', 0.5, -4 + (s.t % 56) / 8);
      if (s.t === 70) { s.tree = 'falling'; s.treeVth = Math.max(s.treeVth, 0.03); }
      if (s.t === 100) { p.axeSwing = undefined; s.axe = 'stump'; }
      if (s.t === 175) tuckerSays(state, s, TUCKER_SPLIT, () => next(s, 'wide'));
      break;
    }
    case 'wide':
      // (back out: he staggers out from under it, groping, blind)
      if (s.t === 1) { if (s.tree !== 'down') land(state, s); p.axeSwing = undefined; s.axe = 'stump'; s.squash = 0; s.pose = 'hurt'; s.face = 'ow'; s.tFacing = -1; }
      camTo(state, s, (MH_CHOP_X + s.tx) / 2, 0.1);
      if (s.t <= 50) s.tx = TAUNT_X - (TAUNT_X - FIGHT_X) * (s.t / 50);
      if (s.t === 30) { s.pose = 'grope'; s.face = 'yell'; }
      if (s.t === 44) { s.face = 'talk'; tuckerSays(state, s, TUCKER_BLIND, () => { s.face = 'shock'; next(s, 'mhblind'); }); }
      break;
    case 'mhblind':
      // (him feeling his way round, turning to every sound but the right one)
      s.pose = 'grope';
      if (s.t % 70 === 35) s.tFacing = s.tFacing > 0 ? -1 : 1;
      if (s.t === 10) meatheadLine(state, s, MH_BLIND, () => next(s, 'matter'));
      break;
    case 'matter':
      // (...doesn't matter: squared up at nothing, the wrong way)
      if (s.t === 1) { s.tFacing = 1; s.pose = 'point'; s.face = 'manic'; tuckerSays(state, s, TUCKER_MATTER, () => next(s, 'go')); }
      break;
    case 'go':
      finishEntry(state, false); onUp(state);
      return hands();
  }
  return hands();
};

/** ONE swing: clean through. The tree starts over. */
const chop = (state: GameState, s: Arena) => {
  next(s, 'fall');
  state.player.axeSwing = AXE_BITE;
  playSound('crunch', 1, -8); playSound('crack', 1, -12); playSound('thud', 1, -6); shakeScreen(state, 8, 4);
  s.tree = 'falling'; s.treeTh = 0.015; s.treeVth = 0.003; s.treeDrop = 0;
  const x = AXE_TREE_X - AXE_TR, y = GY - CUT_H;
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + Math.random() * 6, y: y + (Math.random() - 0.5) * 8 }, vel: { x: -1 - Math.random() * 4, y: -1 - Math.random() * 4 }, life: 36, color: i % 3 ? '#D8B886' : '#6E4E30', size: 2 + Math.random() * 2.5 });
  playSound('crack', 0.6, -16);
};

/** The trunk on the saw on his head: the close-up. */
const hit = (state: GameState, s: Arena) => {
  next(s, 'close');
  s.treeTh = TH_HIT; s.treeVth = 0; s.tree = 'falling';
  playSound('slam', 1, -10); playSound('crunch', 1, -6); playSound('thud', 1, -10); shakeScreen(state, 18, 9);
  s.split = true; state.stageMemo[SPLIT_MEMO] = '1';
  s.squash = 1; s.pose = 'hurt'; s.face = 'ow'; s.splitK = 0; s.said = null;
  camSnap(state, s, (MH_CHOP_X + TAUNT_X) / 2 + 60);
};

/** The trunk coming down (chopped through: tipping over its butt, faster and faster; once it's past him (the close-up's
 *  blow done), the butt sliding off the stump to the ground and the lot landing along it). */
const tickTree = (state: GameState, s: Arena) => {
  if (s.tree !== 'falling' || (s.step === 'close' && s.t < 70)) return;
  s.treeVth += 0.0009 + 0.0045 * Math.sin(s.treeTh);
  s.treeTh += s.treeVth;
  if (s.step === 'fall' && s.t % 14 === 0) playSound('crack', 0.3, -18 + s.treeTh * 4);
  if (s.treeTh > TH_HIT) s.treeDrop = Math.min(1, (s.treeTh - TH_HIT) / (Math.PI / 2 - TH_HIT));
  if (s.treeTh >= Math.PI / 2) land(state, s);
};
/** Down: a crash, the ground shaking, dust and needles along it. */
const land = (state: GameState, s: Arena) => {
  setFelled(state, s);
  playSound('crash', 0.8, -14); playSound('thud', 1, -14); shakeScreen(state, 12, 6);
  for (let i = 0; i < 24; i++) {
    const x = LOG_X + Math.random() * 260;
    state.particles.push({ pos: { x, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 3 }, life: 34, color: i % 3 ? '#A8865A' : '#2A5530', size: 3 + Math.random() * 4 });
  }
};

/** Over (played through, or skipped): the tree down, the axe in the stump, him split and blind at his spot squared up,
 *  checkpoint 60. (Skipped: Meathead where he'd be, by the stump.) */
export const finishEntry = (state: GameState, skipped: boolean) => {
  const s = arenaOf(state), p = state.player;
  if (skipped) silenceAll();
  setBranchMemos(state);
  state.stageMemo[UP_MEMO] = '1'; state.stageMemo[SPLIT_MEMO] = '1'; markIntroSeen();
  setFelled(state, s);
  s.step = ''; s.busy = false; s.said = null; s.talking = false; s.squash = 0; s.splitK = 1;
  s.tMode = 'up'; s.tx = FIGHT_X; s.ty = GY; s.tvx = 0; s.tvy = 0; s.hop = null; s.pose = 'grope'; s.face = 'manic';
  if (skipped) { teleport(state, MH_CHOP_X, GY); p.facing = 1; s.tFacing = -1; }
  p.axeSwing = undefined; p.inCutscene = false; p.vel.x = 0;
  state.cameraOverride = null;
  if (state.checkpoint < 60) state.checkpoint = 60;
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up's wound: the split (the mutilation close-up rule). In the head's units (its middle at the origin, facing
// right, about 24 across). tucker.ts draws the head itself split as far as `splitDrive(k)` says (the halves shoved apart,
// the gap, the saw driven down); this paints the rest over it. k 0..1: the trunk coming down at him (to 0.12), the slam,
// the saw driven down and his face split to the nose (to 0.28; the far eye bursting out on the way), the trunk bounced
// off him and gone (0.42 .. 0.6), the blood fountaining out of the V a beat at a time after.

const rnd = (n: number) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const K_HIT = 0.12, K_DRIVEN = 0.28;
/** How far the saw's driven (the head's split) at k. */
const splitDrive = (k: number) => { const l = clamp01((k - K_HIT) / (K_DRIVEN - K_HIT)); return 1 - (1 - l) * (1 - l); };
/** When the eyes go (the far one bursts out). */
const K_POP = K_HIT + (K_DRIVEN - K_HIT) * (1 - Math.sqrt(1 - SPLIT_EYES_AT));
/** The trunk, in the close-up (mirrored: him facing right, the tree's butt off to the lower right): its way toward the
 *  crown, the way from its middle to him, its radius (head units). */
const TU = { x: -Math.sin(TH_HIT), y: -Math.cos(TH_HIT) }, TN = { x: -Math.cos(TH_HIT), y: Math.sin(TH_HIT) }, TRC = AXE_TR / 1.1;
/** The saw's top at k (the trunk's underside on it). */
const sawTop = (k: number) => -17 + (-10.8 + 17) * splitDrive(k) - 10;

registerWoundPainter('split', (c, k, frame) => {
  const ell = (x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, Math.PI * 2); c.fill(); };
  const line = (pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  const hx = 4.4, top = sawTop(Math.max(k, K_HIT));
  // ---- coming down at him: its shadow over his face, the speed of it
  if (k < K_HIT) {
    c.globalAlpha = 0.4 * (k / K_HIT); c.fillStyle = '#000000'; c.fillRect(-60, -60, 120, 50); c.globalAlpha = 1;
    c.globalAlpha = 0.5;
    for (let i = 0; i < 10; i++) { const o = -40 + rnd(i) * 90, x = 30 + TU.x * o - TN.x * ((frame * 9 + rnd(i + 3) * 200) % 90), y = -40 + TU.y * o - TN.y * ((frame * 9 + rnd(i + 3) * 200) % 90); line([x, y, x + TN.x * 10, y + TN.y * 10], 0.5, '#F8FAFC'); }
    c.globalAlpha = 1;
  }
  // ---- the trunk: in on him, its underside on the saw's back as it's driven down; bounced off him and out of frame
  if (k < 0.62) {
    const far = k < K_HIT ? 70 * (1 - k / K_HIT) * (1 - k / K_HIT) : 0;
    const off = k > 0.42 ? ((k - 0.42) / 0.18) ** 2 * 110 : 0;
    const ax = hx - TN.x * (TRC + far) - 0.4 * off, ay = top - TN.y * (TRC + far) - off;
    const slope = TU.y / TU.x, r = TRC / Math.abs(TU.x);
    drawBough(c, ax - 80, ax + 60, x => ay + (x - ax) * slope, () => r, { step: 1, seed: 13 });
    // (stubs of boughs along its top, needles on them)
    for (let i = 0; i < 4; i++) {
      const bx = ax - 50 + i * 26, by = ay + (bx - ax) * slope - r;
      line([bx, by, bx - 5, by - 8], 1.4, '#3E2812');
      c.fillStyle = i % 2 ? '#1F4A2A' : '#2A5530'; c.beginPath(); c.moveTo(bx - 5, by - 14); c.lineTo(bx + 2, by - 4); c.lineTo(bx - 10, by - 4); c.closePath(); c.fill();
    }
  }
  // ---- the slam: bark chips and needles burst off it, an impact star round the saw's back
  if (k >= K_HIT && k < 0.4) {
    const ph = clamp01((k - K_HIT) / 0.28);
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 + (rnd(i + 20) - 0.5) * 3, sp = 10 + rnd(i + 21) * 30;
      const x = hx + Math.cos(a) * sp * ph, y = top + Math.sin(a) * sp * ph + 24 * ph * ph;
      c.globalAlpha = 1 - ph;
      c.save(); c.translate(x, y); c.rotate(ph * 7 + i);
      if (i % 3 === 0) { c.fillStyle = '#2A5530'; c.fillRect(-1.6, -0.2, 3.2, 0.4); } else { c.fillStyle = i % 2 ? '#6E4E30' : '#A8865A'; c.fillRect(-1, -0.6, 2, 1.2); }
      c.restore();
    }
    c.globalAlpha = 1;
    if (k < K_HIT + 0.05) {
      c.globalAlpha = 1 - (k - K_HIT) / 0.05;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; line([hx + Math.cos(a) * 6, top + Math.sin(a) * 4, hx + Math.cos(a) * 15, top + Math.sin(a) * 10], 0.8, '#FDE047'); }
      c.globalAlpha = 1;
    }
  }
  // ---- driven down: the blood and the bone burst out of the V both ways, brains with it
  if (k >= K_HIT + 0.01 && k < 0.5) {
    const ph = clamp01((k - K_HIT - 0.01) / 0.36);
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1, a = -Math.PI / 2 + side * (0.3 + rnd(i + 40) * 1.2), sp = 8 + rnd(i + 41) * 34, q = (ph * (0.75 + rnd(i) * 0.6)) % 1;
      const x = hx + Math.cos(a) * sp * q, y = -12 + Math.sin(a) * sp * q + 34 * q * q;
      c.globalAlpha = 1 - q;
      if (i % 9 === 0) { c.save(); c.translate(x, y); c.rotate(q * 6 + i); c.fillStyle = '#F5F0E6'; c.fillRect(-1.2, -0.5, 2.4, 1); c.restore(); }
      else if (i % 7 === 0) ell(x, y, 1.1, 0.8, '#E8A0A8');
      else ell(x, y, 0.5 + rnd(i) * 1, 0.4 + rnd(i + 2) * 0.7, i % 3 ? '#B91C1C' : '#7F1D1D');
    }
    c.globalAlpha = 1;
  }
  // ---- the far eye, burst out of its socket as the halves go, on its snapped nerve; the spectacles' far half with it;
  // the near socket gushing
  if (k >= K_POP && k < K_POP + 0.3) {
    const q = clamp01((k - K_POP) / 0.26), ex = -1.2 - 44 * q, ey = -2.6 - 18 * q + 70 * q * q;
    c.save(); c.translate(ex, ey); c.rotate(q * 9);
    line([0, 0, -3.2, 1.4, -5.4, 0.6, -6.6, 1.8], 0.9, '#B83A48'); line([-6.6, 1.8, -7.2, 1.2], 0.5, '#7A1212');
    ell(0, 0, 2.3, 2.3, '#4A0A0A'); ell(0, 0, 2, 2, '#FBF8F0');
    line([-1.6, -0.6, -0.6, -0.2], 0.25, '#DC2626'); line([-1.4, 1, -0.4, 0.4], 0.25, '#DC2626');
    ell(1, 0, 1.1, 1.1, '#4A7AB0'); ell(1.2, 0, 0.55, 0.55, '#0B0B0F'); c.fillStyle = '#FFFFFF'; c.fillRect(1.2, -0.7, 0.4, 0.4);
    c.restore();
    // (the lens and its arm, spinning away up the other way)
    const lx = -1.2 - 30 * q, ly = -2.6 - 30 * q + 40 * q * q;
    c.save(); c.translate(lx, ly); c.rotate(-q * 12);
    c.strokeStyle = '#5E4A1C'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(0, 0, 2.6, 2.4, 0, 0, Math.PI * 2); c.stroke();
    line([-2.6, 0, -8, 1], 0.5, '#A88A3C');
    c.restore();
    // (the sockets spurting)
    for (let i = 0; i < 10; i++) {
      const qq = (q * (0.8 + rnd(i + 60) * 0.6)) % 1, side = i % 2 ? 1 : -1, sx = side < 0 ? -1.2 : 6.4;
      c.globalAlpha = 1 - qq;
      ell(sx + side * (4 + rnd(i + 61) * 12) * qq, -2.6 - 4 * qq + 16 * qq * qq, 0.5, 0.4, '#B91C1C');
    }
    c.globalAlpha = 1;
  }
  // ---- after: the blood fountaining up out of the V, a beat at a time, both ways, and running down
  if (k >= 0.3) {
    const beat = (frame % 28) / 28;
    if (beat < 0.6) {
      const q = beat / 0.6;
      for (let i = 0; i < 12; i++) {
        const side = i % 2 ? 1 : -1, a = -Math.PI / 2 + side * (0.15 + rnd(i + 80) * 0.5), sp = 14 + rnd(i + 81) * 14;
        c.globalAlpha = 1 - q * 0.8;
        ell(hx + Math.cos(a) * sp * q, -20 + Math.sin(a) * sp * q + 30 * q * q, 0.6 + rnd(i) * 0.5, 0.5, i % 3 ? '#B91C1C' : '#7F1D1D');
      }
      c.globalAlpha = 1;
    }
  }
  // ---- the hit: a white flash, a red one as the eye goes
  if (k >= K_HIT && k < K_HIT + 0.015) { c.globalAlpha = 0.75; c.fillStyle = '#FFFFFF'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
  else if (k >= K_POP && k < K_POP + 0.012) { c.globalAlpha = 0.35; c.fillStyle = '#DC2626'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
}, splitDrive);

// ---------------------------------------------------------------------------------------------------------------
// Drawing (screen space): the close-up, his scream under it; SKIP

export const drawEntryHud = (c: Ctx, state: GameState) => {
  const s = arenaOf(state);
  if (s.phase !== 'entry') return;
  if (s.step === 'close') {
    const t = s.t, k = s.splitK, z = Math.min(1, t / 8);
    const w = 440 * (0.6 + 0.4 * z), h = 300 * (0.6 + 0.4 * z), cx = CANVAS_WIDTH / 2, cy = 200, x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.globalAlpha = Math.min(1, z * 1.4);
    box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
    for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, '#E0B040');
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    // (behind him: the real woods, in bands; pines dark behind)
    for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#24382A', '#4A5A32', i / 6));
    for (let i = 0; i < 6; i++) box(c, x + 10 + i * 78, y, 12, h, mix('#1C2414', '#2A3A22', (i % 2) * 0.5));
    const face: TuckerFace = k < K_HIT ? 'manic' : k < 0.3 ? 'shock' : k < 0.62 || s.talking ? 'yell' : 'ow';
    const jolt = k < K_HIT ? 0.1 : k < K_HIT + 0.04 ? 1.6 : k < 0.3 ? 0.7 : k < 0.6 ? 0.25 : 0.06;
    drawTuckerCloseup(c, cx, cy - 10, 4.6, state.frame, { face, jolt, wounds: WOUNDS_ALL, talking: s.talking, making: { wound: 'split', k } });
    c.restore();
    if (s.said) saidOver(c, s.said, cx, y + h + 34, '#FDE68A', 340);
  }
  if (s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
