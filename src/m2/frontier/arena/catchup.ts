// THE CATCH-UP (the user's: "at the end of the sequence, go back to sideview and meathead catches up to tucker. he goes
// 'you took them all out?' he gets furious. he cannot stand people cutting line expecting a free ride. he 'doesn't give
// hand outs'. eventually he crashes into a tree with a pointy branch that impales him through his chest. show this in
// detail. he is missing an eye, has a buzzsaw in his forehead and is impaled on a giant tree branch through his chest and
// he crashes").
//
// One cutscene (no HUD from its first frame; SKIP >> for all of it), up out of the chase's black: back in side view,
// Meathead on the kid's bike up a real dirt trail; ahead, Tucker on the one he stole, coughing, sputtering out (the
// chase ran it dry). Meathead pulls up behind him. Tucker hops off, turns: "YOU TOOK THEM ALL OUT?" Furious (red to the
// ears, stamping): the line-cutter rant (everybody waits, everybody pays, nobody rides free); Meathead's say; "I DON'T
// GIVE HANDOUTS!" He hops back on, kicks it over, revs, yells he's running him over (on the house), and guns it off up
// the trail to get a run at him, looking back... straight onto the giant oak's pointed branch at chest height.
// THE CLOSE-UP (the mutilation rule: animated, graphic, full detail; this file's wound painter on tucker.ts's close-up):
// the branch coming at him, the point punching into his vest (the buttons and his badge popping off), on through him and
// bursting out behind his far shoulder (blood, coat, a rib), him shoved on up it to the thick of it, the blood pumping
// down his front, out of his mouth, dripping off the point; the oak's leaves shaken down on him; his last words. Then
// wide: him hung on the branch by his chest, limp, the bike nosed into the oak under him and wrecked, its back wheel
// turning. Meathead rides up under him, his line, and gets off (the kid's bike stays parked there for good).
// BRANCH_MEMO ('frontier-tucker-branch') is set: tucker.ts draws the branch through him from here on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hands, saidOver, teleport } from '../section';
import { TEENS_MEMO } from '../dirtbike';
import { box, mix, INK, type Ctx } from '../kit';
import { drawTuckerCloseup, drawCloseupBranch, registerWoundPainter, CLOSE_BRANCH, CLOSE_BRANCH_TIP, closeBranchY, type TuckerFace } from '../tucker';
import { GY, TREE_X, MH_START, TUCK_START, MH_PARK, TIP } from './layout';
import { arenaOf, next, BRANCH_MEMO, type Arena } from './state';
import { tuckerSays, meatheadLine, camTo, camSnap, tickTucker, WOUNDS_BEFORE } from './cast';
import { leafBurst } from './art';
import { TUCKER_CAUGHT, TUCKER_RANT, MH_CAUGHT, TUCKER_HANDOUT, TUCKER_GUN, TUCKER_SKEWERED, MH_SKEWERED } from './lines';

/** Every memo the catch-up stands on and leaves (a skip, a cheat start, a checkpoint past it: the world as a run left it). */
export const setBranchMemos = (state: GameState) => {
  for (const m of [TEENS_MEMO, BRANCH_MEMO, 'frontier-tucker-eye', 'frontier-tucker-saw', 'frontier-tucker-grime']) state.stageMemo[m] = '1';
};
export const branchDone = (state: GameState) => state.stageMemo[BRANCH_MEMO] === '1';

/** Him on the kid's bike at x (the bike's middle): his seat's a touch ahead of it (woods' drawBike). */
const onBike = (state: GameState, bx: number) => { const p = state.player; p.pos.x = bx + 7 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; };
const dust = (state: GameState, x: number, n: number, dir = 0) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: GY - 2 }, vel: { x: dir * Math.random() * 3 + (Math.random() - 0.5) * 2, y: -Math.random() * 2.4 }, life: 26, color: i % 2 ? '#A8865A' : '#C8A878', size: 3 + Math.random() * 3 });
};
const smoke = (state: GameState, x: number, y: number, dark = false) => {
  state.particles.push({ pos: { x, y }, vel: { x: -0.6 - Math.random(), y: -0.6 - Math.random() * 0.6 }, life: 36, color: dark ? '#292524' : '#A8A29E', size: 4 + Math.random() * 4 });
};

export const inCatchup = (state: GameState) => arenaOf(state).phase === 'catchup';

/** Starts it (in off the chase, or walked in with it not done yet). */
export const startCatchup = (state: GameState) => {
  const s = arenaOf(state), p = state.player;
  silenceAll();
  s.phase = 'catchup'; next(s, 'in'); s.all = 0; s.busy = false; s.fade = 1; s.said = null; s.talking = false;
  s.tMode = 'ride'; s.bx = TUCK_START; s.bvx = 2.6; s.btilt = 0; s.bspin = 0; s.pose = 'ride'; s.face = 'manic'; s.tFacing = 1;
  s.mx = MH_START; s.riding = true; s.mspin = 0; s.mtilt = 0; s.wreck = false; s.snapped = false; s.closeK = 0; s.hop = null;
  p.inCutscene = true; p.jetski = true; p.moto = true; p.facing = 1; p.isDucking = false;
  onBike(state, s.mx);
  camSnap(state, s, (s.mx + s.bx) / 2);
  playSound('engine', 0.8, -2);
};

/** A frame of it (it has the controls). Null once it's over. */
export const updateCatchup = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, s = arenaOf(state), p = state.player;
  if (s.phase !== 'catchup') return null;
  s.t++; s.all++;
  p.inCutscene = true;
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finishCatchup(state, true); return hands(); } }
  tickTucker(s);
  const mine = s.mx ?? MH_START;
  switch (s.step) {
    case 'in': {
      // (up out of the black: him riding up the trail; Tucker ahead, his bike coughing, running dry, rolling to a stop)
      s.fade = Math.max(0, s.fade - 1 / 30);
      if (s.bvx > 0) {
        s.bvx *= 0.985; if (s.bvx < 0.4) { s.bvx = 0; playSound('boom', 0.35, 14); smoke(state, s.bx - 34, GY - 28, true); smoke(state, s.bx - 34, GY - 28, true); }
        s.bx += s.bvx; s.bspin += s.bvx * 0.12;
        if (s.t % 9 === 0) { smoke(state, s.bx - 34, GY - 28, s.t % 27 === 0); playSound('engine', 0.35, -12 + (s.t % 18) / 3); }
      }
      const gap = s.bx - mine, v = gap > 260 ? 6 : Math.max(0, Math.min(6, (gap - 130) * 0.06));
      s.mx = mine + v; s.mspin += v * 0.12; onBike(state, s.mx);
      if (v > 0.2 && s.t % 4 === 0) dust(state, s.mx - 20, 1, -1);
      camTo(state, s, (s.mx + s.bx) / 2, 0.08);
      if (s.bvx === 0 && v < 0.05 && s.t > 50) { next(s, 'hop'); dust(state, s.mx + 30, 6, 1); }
      break;
    }
    case 'hop':
      // (off the bike, round to face him)
      if (s.t === 4) { s.tMode = 'hop'; s.tFacing = -1; s.pose = 'stand'; s.face = 'shock'; s.tx = s.bx - 11; s.ty = GY; s.hop = { fx: s.bx - 11, tx: s.bx - 46, k: 0 }; playSound('jump', 0.6, -4); }
      if (s.t > 4 && !s.hop) { s.tMode = 'stand'; playSound('land', 0.6); next(s, 'caught'); }
      break;
    case 'caught':
      if (s.t === 8) { s.pose = 'talk'; s.face = 'shock'; tuckerSays(state, s, TUCKER_CAUGHT, () => next(s, 'rant')); }
      break;
    case 'rant':
      if (s.t === 1) { s.pose = 'furious'; s.face = 'manic'; shakeScreen(state, 4, 2); tuckerSays(state, s, TUCKER_RANT, () => next(s, 'mh')); }
      break;
    case 'mh':
      if (s.t === 1) meatheadLine(state, s, MH_CAUGHT, () => next(s, 'handout'));
      break;
    case 'handout':
      if (s.t === 1) { s.pose = 'point'; s.face = 'manic'; tuckerSays(state, s, TUCKER_HANDOUT, () => next(s, 'mount')); }
      break;
    case 'mount':
      // (back on it, round the right way; a kick, and it catches)
      if (s.t === 1) { s.tMode = 'hop'; s.tFacing = 1; s.pose = 'stand'; s.face = 'manic'; s.hop = { fx: s.tx, tx: s.bx - 11, k: 0 }; playSound('jump', 0.6, -4); }
      if (s.t > 1 && !s.hop && s.tMode === 'hop') { s.tMode = 'ride'; s.pose = 'ride'; playSound('engine', 1, -4); smoke(state, s.bx - 34, GY - 28, true); next(s, 'rev'); }
      break;
    case 'rev':
      // (revving, the front wheel lifting and dropping, while he says it)
      s.btilt = -0.12 - Math.max(0, Math.sin(s.t * 0.3)) * 0.14;
      if (s.t % 10 === 0) { playSound('engine', 0.6, -6 + (s.t % 30) / 4); smoke(state, s.bx - 34, GY - 28); }
      if (s.t === 1) { s.pose = 'ridepoint'; tuckerSays(state, s, TUCKER_GUN, () => next(s, 'go')); }
      camTo(state, s, (mine + s.bx) / 2, 0.08);
      break;
    case 'go': {
      // (he guns it off up the trail to get a run at him: never once looks where he's going)
      if (s.t === 1) { s.pose = 'ride'; s.face = 'manic'; playSound('engine', 1, -8); dust(state, s.bx - 24, 10, -1); }
      s.bvx = Math.min(9, s.bvx + 0.3); s.bx += s.bvx; s.bspin += s.bvx * 0.12;
      s.btilt += (-0.14 - s.btilt) * 0.2;
      if (s.t % 3 === 0) dust(state, s.bx - 24, 1, -1);
      if (s.t % 6 === 0) playSound('engine', 0.5, -4 + Math.min(10, s.t / 6));
      camTo(state, s, s.bx + 140, 0.14);
      // (his chest at the branch's point: the crash; the close-up)
      if (s.bx + 3 >= TIP.x) crash(state, s);
      break;
    }
    case 'close': {
      // (the close-up: the branch through him; his last words; then wide)
      s.closeK = Math.min(1, s.t / 150);
      if (s.t === 2) { playSound('crack', 1, -6); playSound('crunch', 1, -8); }
      if (s.t === 30) { playSound('splat', 1, -4); playSound('gorespray', 1, -2); shakeScreen(state, 14, 7); }
      if (s.t === 46) { playSound('crunch', 1, 4); playSound('gush', 0.8, -4); }
      if (s.t === 60) { playSound('thud', 1, -8); shakeScreen(state, 8, 4); }
      if (s.t > 46 && s.t < 120 && s.t % 13 === 0) playSound('splat', 0.4, -6 + (s.t % 26) / 4);
      if (s.t === 150) playSound('crunch', 0.6, -12);
      if (s.t === 165) tuckerSays(state, s, TUCKER_SKEWERED, () => next(s, 'wide'));
      break;
    }
    case 'wide': {
      // (back out: him hung there; Meathead rides up under him)
      if (s.t === 1) { s.face = 'out'; s.closeK = 1; }
      const want = MH_PARK;
      if (mine < want) {
        const v = Math.max(1, Math.min(5, (want - mine) * 0.05 + 0.6));
        s.mx = Math.min(want, mine + v); s.mspin += v * 0.12; onBike(state, s.mx);
        if (s.mx >= want) { dust(state, s.mx + 26, 8, 1); playSound('crunch', 0.4, 8); s.hopFrom = s.t; }
      } else if (s.t - s.hopFrom === 24) meatheadLine(state, s, MH_SKEWERED, () => next(s, 'off'));
      break;
    }
    case 'off': {
      // (off the bike: it stays there on its stand)
      if (s.t === 1) { p.jetski = false; p.moto = false; s.riding = false; playSound('jump', 0.5, -6); }
      const k = Math.min(1, s.t / 12), from = mine + 7, to = mine + 40;
      p.pos.x = from + (to - from) * k - p.width / 2; p.pos.y = GY - p.height - Math.sin(k * Math.PI) * 18;
      if (s.t === 12) playSound('land', 0.6);
      if (s.t >= 20) { finishCatchup(state, false); return hands(); }
      break;
    }
  }
  return hands();
};

/** The crash: his chest on the branch's point at full tilt. */
const crash = (state: GameState, s: Arena) => {
  next(s, 'close');
  playSound('crash', 1, -2); playSound('slam', 1, -8); shakeScreen(state, 16, 8);
  s.tMode = 'impaled'; s.wreck = true; s.bvx = 0; s.face = 'out'; s.closeK = 0; s.said = null;
  leafBurst(s, TREE_X, GY - 300, 40, 2, 320);
  // (while the close-up has the screen: the camera onto the oak, and him back down the trail out of shot, to ride up)
  camSnap(state, s, TREE_X - 200);
  s.mx = Math.max(s.mx ?? MH_START, s.camX - 90); onBike(state, s.mx);
};

/** Over (played through, or skipped): Tucker hung on the oak, the bike wrecked under him, Meathead off the kid's bike
 *  under him, the branch memo set. */
export const finishCatchup = (state: GameState, skipped: boolean) => {
  const s = arenaOf(state), p = state.player;
  if (skipped) silenceAll();
  setBranchMemos(state);
  s.phase = 'body'; s.step = ''; s.busy = false; s.fade = 0; s.said = null; s.talking = false; s.hop = null;
  s.tMode = 'impaled'; s.face = 'out'; s.wreck = true; s.snapped = false; s.closeK = 1;
  s.mx = MH_PARK; s.riding = false; s.mspin = 0; s.mtilt = 0;
  p.jetski = false; p.moto = false; p.inCutscene = false;
  state.cameraOverride = null;
  teleport(state, MH_PARK + 40, GY);
  p.facing = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up's wound: the branch through his chest (the mutilation close-up rule), in the head's units (its middle at
// the origin, facing right, about 24 across; his chest at y ~30). k 0..1: the branch coming at him (to 0.14), the point
// in and on through him and out behind his far shoulder (to 0.36), him shoved on up it to the thick of it (to 0.6), hung
// there bleeding after.

const rnd = (n: number) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Where the point is at k. */
const tipAt = (k: number) => {
  if (k < 0.14) { const e = k / 0.14; return 70 + (CLOSE_BRANCH.x + 1 - 70) * e * e; }
  if (k < 0.36) return CLOSE_BRANCH.x + 1 + (-30 - CLOSE_BRANCH.x - 1) * ((k - 0.14) / 0.22);
  if (k < 0.6) { const e = (k - 0.36) / 0.24, sm = e * e * (3 - 2 * e); return -30 + (CLOSE_BRANCH_TIP + 30) * sm; }
  return CLOSE_BRANCH_TIP;
};
/** When the point came out behind him (k). */
const K_OUT = 0.14 + ((CLOSE_BRANCH.x + 1 - CLOSE_BRANCH.exit) / (CLOSE_BRANCH.x + 1 + 30)) * 0.22;

registerWoundPainter('branch', (c, k, frame) => {
  const ell = (x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, Math.PI * 2); c.fill(); };
  const line = (pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  const tip = tipAt(k), B = CLOSE_BRANCH, ey = closeBranchY(B.exit);
  // ---- coming at him: the speed of it (streaks going by)
  if (k < 0.16) {
    c.globalAlpha = 0.5 * (1 - k / 0.16);
    for (let i = 0; i < 12; i++) { const y = -36 + rnd(i) * 84, x = 70 - ((frame * 11 + rnd(i + 5) * 300) % 150); line([x, y, x + 10 + rnd(i + 9) * 12, y], 0.5, '#F8FAFC'); }
    c.globalAlpha = 1;
  }
  // ---- his badge and the vest's buttons, burst off as it goes in (the badge's spot covered: the lapel under it)
  if (k >= 0.14) {
    c.fillStyle = '#36467E'; c.fillRect(13.6, 22, 9.8, 4.2);
    const ph = clamp01((k - 0.14) / 0.28);
    if (ph < 1) {
      const pieces = [[18.5, 24, 1.6, -1.2, true], [1, 28, 0.9, -1.6, false], [1, 34, 1.3, -0.8, false]] as const;
      pieces.forEach(([x, y, vx, vy, badge], i) => {
        const px = x + vx * ph * 34, py = y + vy * ph * 30 + ph * ph * 40;
        c.save(); c.translate(px, py); c.rotate(ph * (8 + i * 3));
        if (badge) { c.fillStyle = '#4A3608'; c.fillRect(-4.9, -1.9, 9.8, 3.8); c.fillStyle = '#F4CC4E'; c.fillRect(-4.5, -1.5, 9, 3); c.fillStyle = '#926E16'; for (let j = 0; j < 6; j++) c.fillRect(-3.6 + j * 1.2, -0.6, 0.7, 1.4); }
        else { ell(0, 0, 1.6, 1.6, '#4A3608'); ell(0, 0, 1.2, 1.2, '#CC9E2C'); ell(-0.4, -0.4, 0.5, 0.5, '#FFF6BE'); }
        c.restore();
      });
    }
  }
  // ---- the branch itself (tucker.ts draws it: the point, the hole, the way out behind him), not snapped: on out of frame
  drawCloseupBranch(c, frame, tip, false, { open: clamp01((k - 0.14) / 0.3) });
  // ---- going in: blood out of the hole, forward and down, in a burst; then pumping, a beat at a time
  if (k >= 0.14 && k < 0.5) {
    const ph = clamp01((k - 0.14) / 0.36);
    for (let i = 0; i < 16; i++) {
      const a = -0.5 + rnd(i + 70) * 1.4, sp = 10 + rnd(i + 80) * 26, q = (ph * (0.8 + rnd(i) * 0.6)) % 1;
      c.globalAlpha = 1 - q;
      ell(B.x + 4 + Math.cos(a) * sp * q, B.y + Math.sin(a) * sp * q + 16 * q * q, 0.5 + rnd(i) * 0.9, 0.4 + rnd(i + 3) * 0.6, i % 3 ? '#B91C1C' : '#7F1D1D');
    }
    c.globalAlpha = 1;
  }
  if (k >= 0.5) {
    const beat = (frame % 30) / 30;
    if (beat < 0.4) { const q = beat / 0.4; for (let i = 0; i < 5; i++) ell(B.x + 5 + q * (6 + i * 2.4), B.y + 3 + q * q * 10 + i * 0.6, 0.7 - q * 0.3, 0.5, '#B91C1C'); }
  }
  // ---- out behind his far shoulder: a burst of it (blood, the coat's cloth, a chip of rib), and a red mist
  if (k >= K_OUT) {
    const ph = clamp01((k - K_OUT) / 0.2);
    if (ph < 1) {
      for (let i = 0; i < 22; i++) {
        const a = Math.PI + (rnd(i + 30) - 0.6) * 1.6, sp = 8 + rnd(i + 40) * 30;
        const x = B.exit + Math.cos(a) * sp * ph, y = ey + Math.sin(a) * sp * ph + 26 * ph * ph;
        c.globalAlpha = 1 - ph;
        if (i % 7 === 0) { c.save(); c.translate(x, y); c.rotate(ph * 6 + i); c.fillStyle = '#F5F0E6'; c.fillRect(-1.4, -0.4, 2.8, 0.8); c.restore(); }
        else if (i % 5 === 0) { c.save(); c.translate(x, y); c.rotate(ph * 4 + i); c.fillStyle = '#283662'; c.fillRect(-1.6, -1, 3.2, 2); c.restore(); }
        else ell(x, y, 0.6 + rnd(i) * 1, 0.5 + rnd(i + 2) * 0.7, i % 2 ? '#B91C1C' : '#7F1D1D');
      }
      c.globalAlpha = 0.4 * (1 - ph); ell(B.exit - 6 - ph * 6, ey - 2, 7 + ph * 8, 4 + ph * 4, '#991B1B'); c.globalAlpha = 1;
    }
  }
  // ---- out of his mouth: a cough of it, then a run down his chin and off it
  if (k >= 0.32) {
    const run = clamp01((k - 0.32) * 3);
    line([7.8, 8.8, 8.2, 8.8 + 3 * run, 7.6, 8.8 + 6.4 * run], 1.1, '#7A0E0E'); line([7.9, 8.9, 8.3, 8.9 + 3 * run], 0.4, '#C42A2A');
    if (k < 0.42) { const q = clamp01((k - 0.32) / 0.1); c.globalAlpha = 1 - q; for (let i = 0; i < 8; i++) ell(8 + q * (6 + rnd(i) * 10), 8 + (rnd(i + 4) - 0.5) * 6 * q + q * q * 6, 0.5, 0.4, '#B91C1C'); c.globalAlpha = 1; }
    if (run >= 1) { const d = ((frame * 0.025) % 1); ell(7.6, 15.4 + d * 10, 0.5, 0.8, '#991B1B'); }
  }
  // ---- the oak's leaves, shaken down on him by the hit; one settles on his cap
  if (k >= 0.3) {
    for (let i = 0; i < 7; i++) {
      const ph = clamp01((k - 0.3 - i * 0.05) / 0.55);
      if (ph <= 0) continue;
      const settle = i === 2;
      const x = settle ? -12 + (ph * 10) : -26 + i * 9 + Math.sin(ph * 7 + i) * 4, y = settle ? -40 + ph * 20 : -44 + ph * 92;
      c.save(); c.translate(x, y); c.rotate(settle ? -0.3 : ph * 5 + i);
      ell(0, 0, 2.6, 1.2, '#6E2A08'); ell(-0.2, -0.1, 2.2, 0.9, ['#D97706', '#B45309', '#CA8A04'][i % 3]);
      c.restore();
    }
  }
  // ---- the hit itself: a white flash, a red one
  if (k >= 0.14 && k < 0.155) { c.globalAlpha = 0.7; c.fillStyle = '#FFFFFF'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
  else if (k >= K_OUT && k < K_OUT + 0.012) { c.globalAlpha = 0.3; c.fillStyle = '#DC2626'; c.fillRect(-80, -80, 160, 160); c.globalAlpha = 1; }
});

// ---------------------------------------------------------------------------------------------------------------
// Drawing (screen space): the close-up, his last words under it; the fade up out of black; SKIP

export const drawCatchupHud = (c: Ctx, state: GameState) => {
  const s = arenaOf(state);
  if (s.phase !== 'catchup') return;
  if (s.step === 'close') {
    const t = s.t, k = s.closeK, z = Math.min(1, t / 8);
    const w = 440 * (0.6 + 0.4 * z), h = 300 * (0.6 + 0.4 * z), cx = CANVAS_WIDTH / 2, cy = 200, x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.globalAlpha = Math.min(1, z * 1.4);
    box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
    for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, '#E0B040');
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    // (behind him: the woods, in bands; the oak's trunk dark at the right where the branch comes from)
    for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#2A3A22', '#4A5A32', i / 6));
    for (let i = 0; i < 5; i++) box(c, x + 20 + i * 90, y, 14, h, mix('#1C2414', '#2A3A22', (i % 2) * 0.5));
    box(c, x + w - 46, y, 60, h, '#3F3020'); box(c, x + w - 46, y, 8, h, '#5A4630');
    const face: TuckerFace = k < 0.14 ? 'manic' : k < 0.4 ? 'shock' : k < 0.62 ? 'ow' : 'daze';
    const jolt = k < 0.14 ? 0.15 : k < 0.17 ? 1.4 : k < 0.4 ? 0.6 : k < 0.62 ? 0.25 : 0.04;
    drawTuckerCloseup(c, cx, cy - 32, 4.6, state.frame, { face, red: k < 0.14, jolt, wounds: WOUNDS_BEFORE, talking: s.talking, making: { wound: 'branch', k } });
    c.restore();
    if (s.said) saidOver(c, s.said, cx, y + h + 34, '#FDE68A', 340);
  }
  if (s.fade > 0) { c.globalAlpha = s.fade; box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000'); c.globalAlpha = 1; }
  if (s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
