// THE BOOTH (the user's): as Meathead cuts the whole line and drops into a log, Tucker (a hole through his eye, somehow
// still going) bursts into the ride's control booth, shoves the real operator out of it, and at the controls: "TIME TO
// ENGAGE THE BUZZSAWS". He slams the button: BUZZSAW MODE (the console's panel lit, the ride's PA chirping it); the
// ride's saws come on all down the line, and one drops out of the sky (nowhere to be seen before: down through the
// station's roof and the booth's), straight into his forehead (the user's playtest note). The mutilation close-up rule: an ANIMATED, GRAPHIC close-up of
// it happening (this job's wound painter on tucker.ts's close-up): the blade coming down out of the dark, the bite
// through the cap's crown (the brass plate flying), the grind down into his forehead (sparks, bone, blood in a spray),
// stuck there spinning down, the blood running down over his face and into the hole where his eye was, his one eye
// rolling up at it; his last words (his splitting headache). Back out: he goes over flat, apparently dead, the saw
// still in his head (TUCKER_SAW_MEMO: on him for the rest of the land, tucker.ts draws it). Meathead's line, the
// operator back up (keep your arms inside), and the log goes. A cutscene from the burst on: no HUD, SKIP >> for all of
// it.
//
// The operator: a person of the park's (people.ts: seeded by the visit, a man or a woman), in the ride's frontier
// vest; her lines by the state of him (lines.ts). Back in a log after the scene (a death, another visit): no scene,
// just her (OP_AGAIN) and the log goes; this visit, Tucker's still on the booth's floor with the saw in his head.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { signText } from '../../signLetters';
import { steppedGlow } from '../../intro/art/kit';
import { stillAt, checker, PLANK, STEEL } from './paint';
import { drawOperator } from './people';
import { hands, meatheadSays, speak, saidOver, byPants, landVisit, tuckerWoundsOf } from '../section';
import { GY } from '../geometry';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { box, mix, INK, painted, type Ctx } from '../kit';
import { drawTucker, drawTuckerCloseup, drawTuckerCap, registerWoundPainter } from '../tucker';
import { rideOf, type Scene } from './state';
import { X, waterY, BOOTH, LOAD_X } from './layout';
import { RIDE_VOICES, TUCKER_ENGAGE, TUCKER_SAWED, OP_CUT, OP_SHOVED, OP_AFTER, OP_AGAIN, DEAD_AGAIN, SPIEL_BUZZMODE } from './lines';
import { drawSawDisc } from './hazards';
import { rideStartLine } from './ride';

/** The saw's in Tucker's forehead (for good: tucker.ts draws it on him from here on). */
export const TUCKER_SAW_MEMO = 'frontier-tucker-saw';
export const sawed = (state: GameState) => state.stageMemo[TUCKER_SAW_MEMO] === '1';

/** This visit, the booth's scene was played (his body's on its floor). */
let bodyVisit = -1;
/** The operator: a man or a woman, by the visit. */
const opSeed = () => 300 + (landVisit() * 37) % 200;
const opWoman = () => (landVisit() % 2) === 1;
const opVoice = () => (opWoman() ? RIDE_VOICES.operatorf : RIDE_VOICES.operator);

/** Where things are in the booth (world): its left wall, its console, the saw's hanger. */
const BX0 = X(BOOTH.a), BX1 = X(BOOTH.b), FLOOR = GY - BOOTH.floor;
const CONSOLE_X = BX1 - 40, SAW_X = CONSOLE_X - 26;
const TUCK_AT = CONSOLE_X - 30, OP_AT = CONSOLE_X - 20;
/** The saw out of the sky: how long it takes to come down, the station's roof and the booth's it comes through, where it
 *  falls from (over the top of the scene's view) and to (his head). */
const DROP_T = 26, ROOF_Y = GY - 290, BOOTH_ROOF = FLOOR - BOOTH.top - 10, FALL_FROM = GY - 560, FALL_TO = FLOOR - 90;
const sawFallY = (_state: GameState, k: number) => FALL_FROM + (FALL_TO - FALL_FROM) * k * k;
/** Splintered boards and dust off a roof it's come through. */
const splinters = (state: GameState, y: number) => {
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: SAW_X + (Math.random() - 0.5) * 30, y }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 36, color: i % 3 ? '#8A5A30' : '#C8A070', size: 2 + Math.random() * 3 });
};

const say = (state: GameState, s: Scene, who: 'tucker' | 'op', pool: ByPants, done?: () => void) => {
  s.busy = true;
  const text = pickLine(byPants(state, pool));
  if (who === 'tucker') { s.tuckerTalking = true; speak(TUCKER_VOICE, text, said => { s.tucker = said; if (!said) s.tuckerTalking = false; }, true, () => { s.tuckerTalking = false; s.busy = false; done?.(); }); }
  else { s.opTalking = true; speak(opVoice(), text, said => { s.op = said; if (!said) s.opTalking = false; }, true, () => { s.opTalking = false; s.busy = false; done?.(); }); }
};
const next = (s: Scene, step: Scene['step']) => { s.step = step; s.t = 0; };
const inScene = (s: Scene) => s.step !== 'wait' && s.step !== 'done';

/** Starts the scene (he's dropped into the log, the first time). */
export const startScene = (state: GameState) => {
  const s = rideOf(state).scene;
  silenceAll();
  s.step = 'burst'; s.t = 0; s.all = 0; s.busy = false; s.tx = BX0 - 30; s.ox = OP_AT; s.oy = FLOOR; s.ovx = 0; s.ovy = 0; s.opDown = false; s.sawK = 0; s.k = 0; s.roof = false; s.booth = false;
  state.player.inCutscene = true;
  state.cameraOverride = { x: X(BOOTH.a) - 180, y: GY - 470 };
  playSound('slam', 1, -6);
};

/** The booth's operator barks at him for cutting (once, as he goes by her window). */
export const updateBooth = (state: GameState) => {
  const r = rideOf(state), p = state.player, cx = p.pos.x + p.width / 2;
  if (!r.said.opcut && r.log.mode === 'off' && cx > BX0 - 160 && cx < X(LOAD_X) && p.health > 0) {
    r.said.opcut = true;
    speak(opVoice(), pickLine(byPants(state, OP_CUT)), said => { r.bark = said; }, false);
  }
};

/** A frame of the scene (it has the controls). Returns null once it's over (the log goes). */
export const updateScene = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, r = rideOf(state), s = r.scene, p = state.player;
  if (!inScene(s)) return null;
  s.t++; s.all++;
  p.inCutscene = true;
  if (s.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finishScene(state, true); return null; } }
  // (the operator, shoved: through the booth's door, down on the platform)
  if (s.ovx || s.ovy) { s.ox += s.ovx; s.oy += s.ovy; s.ovy += 0.6; if (s.oy >= FLOOR) { s.oy = FLOOR; s.ovx *= 0.6; if (Math.abs(s.ovx) < 0.3) s.ovx = 0; s.ovy = 0; } }
  switch (s.step) {
    case 'burst':
      // (in through the booth's back door at a run, manic)
      s.tx = Math.min(TUCK_AT - 26, s.tx + 3.4);
      if (s.t % 12 === 0) playSound('step_wood', 0.6);
      if (s.tx >= TUCK_AT - 26) next(s, 'shove');
      break;
    case 'shove':
      if (s.t === 6) {
        playSound('punch', 0.9, -2); playSound('whoosh', 0.7);
        s.ovx = 3.6; s.ovy = -4.5; s.opDown = true;
      }
      if (s.t > 6 && s.t < 20) s.tx = Math.min(TUCK_AT, s.tx + 2);
      if (s.t === 30) say(state, s, 'op', OP_SHOVED, () => next(s, 'engage'));
      break;
    case 'engage':
      if (s.t === 1) say(state, s, 'tucker', TUCKER_ENGAGE, () => next(s, 'press'));
      break;
    case 'press':
      // (the button: slammed; the klaxon; BUZZSAW MODE; the saws coming on all down the line; the PA says so)
      if (s.t === 12) { playSound('slam', 1, -4); playSound('alarm', 0.8); shakeScreen(state, 6, 3); }
      if (s.t === 22) playSound('grind', 1, -8);
      if (s.t === 30) { s.busy = true; speak(RIDE_VOICES.spiel, pickLine(SPIEL_BUZZMODE), said => { r.pa = said; }, true, () => { s.busy = false; next(s, 'drop'); playSound('whoosh', 1, -8); }); }
      break;
    case 'drop': {
      // (out of the sky: whistling down through the station's roof, then the booth's, into his head; then the close-up)
      s.sawK = Math.min(1, s.t / DROP_T);
      const y = sawFallY(state, s.sawK);
      if (!s.roof && y >= ROOF_Y) { s.roof = true; playSound('crash', 1, -6); shakeScreen(state, 5, 2); splinters(state, ROOF_Y); }
      if (!s.booth && y >= BOOTH_ROOF) { s.booth = true; playSound('crash', 0.9, -2); splinters(state, BOOTH_ROOF); }
      if (s.t >= DROP_T) { next(s, 'close'); playSound('grind', 1, -2); }
      break;
    }
    case 'close': {
      // (the close-up: the blade down into his forehead; his last words; then back out)
      s.k = Math.min(1, s.t / 150);
      if (s.t === 38) { playSound('clang', 1, 6); playSound('crunch', 1, -6); shakeScreen(state, 12, 6); }
      if (s.t === 44) playSound('gorespray', 1, -2);
      if (s.t > 38 && s.t < 96 && s.t % 9 === 0) { playSound('grind', 0.9, -6 + (s.t % 18) / 3); playSound('splat', 0.4, -4); }
      if (s.t === 100) playSound('crunch', 0.8, -10);
      if (s.t === 160) say(state, s, 'tucker', TUCKER_SAWED, () => next(s, 'fall'));
      break;
    }
    case 'last': break;
    case 'fall':
      // (over he goes, flat: the saw stays where it is)
      if (s.t === 1) { state.stageMemo[TUCKER_SAW_MEMO] = '1'; bodyVisit = landVisit(); }
      if (s.t === 14) { playSound('thud', 1, -6); shakeScreen(state, 6, 3); }
      if (s.t === 40) { s.busy = true; meatheadSays(state, pickLine(byPants(state, DEAD_AGAIN)), true, () => { s.busy = false; next(s, 'after'); }); }
      break;
    case 'after':
      if (s.t === 1) { s.opDown = false; say(state, s, 'op', OP_AFTER, () => next(s, 'go')); }
      break;
    case 'go':
      finishScene(state, false);
      return null;
  }
  return hands();
};

/** Over (played through, or skipped): Tucker down with the saw in him, the operator up, the log away. */
const finishScene = (state: GameState, skipped: boolean) => {
  const r = rideOf(state), s = r.scene;
  if (skipped) silenceAll();
  state.stageMemo[TUCKER_SAW_MEMO] = '1'; bodyVisit = landVisit();
  s.step = 'done'; s.tucker = null; s.op = null; s.busy = false; s.opDown = false; s.ox = OP_AT + 90; s.oy = FLOOR; s.ovx = 0; s.ovy = 0;
  state.player.inCutscene = false;
  state.cameraOverride = null;
  r.log.mode = 'ride';
  rideStartLine(state);
};

/** He's back in a log after the scene's been (a death, another visit): her line, and away. */
export const againLine = (state: GameState) => {
  const r = rideOf(state);
  speak(opVoice(), pickLine(byPants(state, OP_AGAIN)), said => { r.bark = said; }, true);
};

export const sceneHasCamera = (state: GameState) => inScene(rideOf(state).scene);

// ---------------------------------------------------------------------------------------------------------------
// The close-up's wound: the saw into his forehead (the mutilation close-up rule), in the head's units (its middle at
// the origin, facing right, about 24 across). k 0..1: coming down (to 0.25), the bite through the cap and the grind
// down into his forehead (to 0.65), stuck there spinning down after.

/** The saw's middle when it's in (head units), its radius. */
const SX = 4, SY_IN = -18.5, SR = 13;
const rnd = (n: number) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };
/** The head's outline (tucker.ts's skull, and the cap over it): for the part of the saw that's buried. */
const headPath = (c: Ctx) => {
  c.moveTo(-10.4, -5); c.quadraticCurveTo(-10.8, -13.6, -0.6, -13.8); c.quadraticCurveTo(9.4, -13.8, 10.6, -5.6);
  c.quadraticCurveTo(12, 1, 11.4, 5.4); c.quadraticCurveTo(10.6, 10.8, 6, 12.6); c.quadraticCurveTo(1.4, 14.2, -3.2, 12.8);
  c.quadraticCurveTo(-9.4, 10.6, -10.6, 4); c.quadraticCurveTo(-11.2, -0.4, -10.4, -5); c.closePath();
};

registerWoundPainter('saw', (c, k, frame) => {
  const line = (pts: number[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  const ell = (x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, Math.PI * 2); c.fill(); };
  // (where the blade is: falling in from far above, then the grind down into him)
  const fall = Math.min(1, k / 0.25), grind = Math.max(0, Math.min(1, (k - 0.25) / 0.4)), after = Math.max(0, (k - 0.65) / 0.35);
  const sy = k < 0.25 ? -70 + (SY_IN - 7 + 70) * fall * fall : SY_IN - 7 + 7 * grind;
  const spin = frame * (0.9 - after * 0.85);
  const depth = k < 0.25 ? 0 : grind;
  // ---- the cap: split in two by the blade, the halves pushed apart, the brass plate gone flying
  if (k >= 0.25) {
    const open = Math.min(1, grind * 1.5);
    c.save(); c.beginPath(); c.rect(-30, -40, 30 + SX, 60); c.clip();
    c.translate(-open * 2.6, -open * 0.6); c.rotate(-open * 0.12); drawTuckerCap(c, 0, -10, 0, 1); c.restore();
    c.save(); c.beginPath(); c.rect(SX, -40, 30, 60); c.clip();
    c.translate(open * 2.6, -open * 0.4); c.rotate(open * 0.12); drawTuckerCap(c, 0, -10, 0, 1); c.restore();
    // (the plate: off and away, end over end)
    if (grind < 1) { const t = Math.min(1, grind * 1.4); c.save(); c.translate(SX + 4 + t * 22, -16 - t * 18 + t * t * 26); c.rotate(t * 9); c.fillStyle = '#4A3608'; c.fillRect(-4.9, -2.2, 9.8, 4.4); c.fillStyle = '#F4CC4E'; c.fillRect(-4.5, -1.8, 9, 3.6); c.restore(); }
  } else {
    drawTuckerCap(c, 0, -10, 0, 1);
  }
  // ---- the wound: the slot the blade's made down into his forehead (meat, white bone at its lips, the pink of what's
  // inside), opening as it goes in
  if (depth > 0) {
    const half = 1.2 + depth * 2.2, bottom = sy + SR - 0.5;
    c.fillStyle = '#4A0A0A'; c.beginPath(); c.moveTo(SX - half - 1.4, -14.6); c.lineTo(SX + half + 1.4, -13.6); c.lineTo(SX + half * 0.6, bottom); c.lineTo(SX - half * 0.6, bottom); c.closePath(); c.fill();
    c.fillStyle = '#8A1414'; c.beginPath(); c.moveTo(SX - half, -14.2); c.lineTo(SX + half, -13.4); c.lineTo(SX + half * 0.4, bottom - 0.6); c.lineTo(SX - half * 0.4, bottom - 0.6); c.closePath(); c.fill();
    ell(SX, (bottom - 14) / 2 - 3, half * 0.5, Math.max(0.5, (bottom + 14) * 0.3), '#F2A8B0');
    line([SX - half - 1.2, -14.6, SX - half * 0.6 - 0.4, bottom], 0.6, '#F5F0E6');
    line([SX + half + 1.2, -13.6, SX + half * 0.6 + 0.4, bottom], 0.6, '#F5F0E6');
  }
  // ---- the blade: whatever of it isn't inside his head (the head's outline, and the cap's, cut out of it)
  c.save();
  c.beginPath(); c.rect(-60, -90, 120, 140); headPath(c);
  if (k < 0.25) { /* (still clear of him: all of it) */ c.restore(); c.save(); }
  else c.clip('evenodd');
  drawSawDisc(c, SX, sy, SR, spin, after > 0.9 ? 1 : 0);
  c.restore();
  // (loose, out of the sky: no arm; coming down, its streaks)
  if (k < 0.25) { c.globalAlpha = 0.5; for (let i = -1; i <= 1; i++) line([SX + i * 6, sy - SR - 4, SX + i * 6, sy - SR - 30], 0.8, '#F1F5F9'); c.globalAlpha = 1; }
  // ---- the bite: sparks off the cap's brass, then bone chips and blood in a spray off the blade's back edge
  if (k >= 0.25 && grind < 1) {
    const t = grind;
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI * 0.85 + rnd(i) * 0.9, sp = 6 + rnd(i + 20) * 22, ph = ((frame * 0.07 + rnd(i + 40)) % 1);
      const x = SX + Math.cos(a) * sp * ph, y = -14 + Math.sin(a) * sp * ph + 10 * ph * ph;
      c.globalAlpha = 1 - ph;
      if (t < 0.25 && i % 2 === 0) ell(x, y, 0.5, 0.5, i % 4 ? '#FDE047' : '#F97316');
      else if (i % 5 === 0) ell(x, y, 0.7, 0.5, '#F5F0E6');
      else ell(x, y, 0.5 + rnd(i) * 0.8, 0.4 + rnd(i) * 0.6, i % 2 ? '#B91C1C' : '#7F1D1D');
    }
    c.globalAlpha = 1;
    // (the mist)
    c.globalAlpha = 0.35 * (1 - t); ell(SX - 6, -20, 8 + t * 6, 4 + t * 3, '#991B1B'); c.globalAlpha = 1;
  }
  // ---- the blood: out of the slot, down his brow, over the spectacles and down into the empty socket, off his jaw
  if (k > 0.3) {
    const run = Math.min(1, (k - 0.3) * 2.4);
    line([SX + 2, -12, SX + 3, -12 + 8 * run, 6.2, -12 + 12 * run, 6.4, -12 + 24 * run], 1.6, '#8A1414');
    line([SX + 2.2, -12, SX + 3.2, -12 + 8 * run, 6.4, -12 + 12 * run, 6.6, -12 + 24 * run], 0.5, '#D43A3A');
    line([SX - 1, -12.5, SX - 2, -12.5 + 10 * run, -0.5, -12.5 + 19 * run], 1.2, '#8A1414');
    line([SX + 4.5, -11.5, SX + 6.5, -11.5 + 6 * run, 9.4, -11.5 + 9 * run], 1, '#8A1414');
    if (run >= 1) for (let i = 0; i < 3; i++) { const d = ((frame * 0.02 + i / 3) % 1); ell(6.6, 12 + d * 12, 0.6, 0.9, '#991B1B'); }
  }
  // ---- after: the saw winding down, smoking, a last spit of blood off its teeth now and then
  if (after > 0) {
    c.globalAlpha = Math.min(0.5, after); for (let i = 0; i < 3; i++) ell(SX + 6 + i * 1.6, sy - SR - 2 - i * 2.4 - after * 6, 1 + i * 0.6, 0.8 + i * 0.5, '#D6D3D1'); c.globalAlpha = 1;
    if (frame % 40 < 6) for (let i = 0; i < 4; i++) ell(SX + SR * 0.8 + i * 1.4, sy - 3 - i * 1.2, 0.5, 0.4, '#B91C1C');
  }
});

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the booth (its window, the console and its big red button under the flip cover, the saw on its hanger),
// Tucker in it, the operator; his words; the close-up

/** The booth, and whoever's in it (behind the cast: the platform's in front of the trough). */
export const drawBooth = (c: Ctx, state: GameState) => {
  const r = rideOf(state), s = r.scene, f = state.frame, top = FLOOR - BOOTH.top;
  if (BX1 + 200 < state.camera.x || BX0 - 200 > state.camera.x + CANVAS_WIDTH) return;
  // ---- the booth's back: paneled inside, a wall clock, a SAFETY FIRST poster, the ride's track map, the back door
  // (banged open in the scene)
  stillAt(c, 'lr-booth-back', BX0, top, -4, -4, BX1 - BX0 + 8, BOOTH.top + 4, g => {
    const w = BX1 - BX0, P = PLANK;
    box(g, -4, -4, w + 8, BOOTH.top + 4, INK);
    for (let x = 0, i = 0; x < w; x += 16, i++) { box(g, x, 0, 16, BOOTH.top, i % 2 ? mix(P[2], '#2A1E14', 0.3) : mix(P[2], P[3], 0.3)); box(g, x, 0, 1, BOOTH.top, P[1]); box(g, x + 1, 0, 1, BOOTH.top, P[3]); }
    box(g, 0, 0, w, 5, P[4]); box(g, 0, 0, w, 1, P[5]); box(g, 0, BOOTH.top - 50, w, 4, P[4]); box(g, 0, BOOTH.top - 46, w, 1, P[1]);
    box(g, 14, 28, 38, 48, INK); box(g, 16, 30, 34, 44, '#E7D8B0'); box(g, 16, 30, 34, 2, '#F4ECD0'); checker(g, 16, 70, 34, 4, '#CDBE94', 0);
    signText(g, 'SAFETY', 33, 46, painted(1, '#7F1D1D', '#E7D8B0')); signText(g, 'FIRST', 33, 58, painted(1, '#7F1D1D', '#E7D8B0'));
    // (the ride's track map: the flume's loop on a board, little lamps along it)
    box(g, 64, 22, 66, 40, INK); box(g, 66, 24, 62, 36, '#1E3A2A'); g.strokeStyle = '#7AB6D0'; g.lineWidth = 2; g.beginPath(); g.moveTo(72, 52); g.lineTo(90, 52); g.lineTo(98, 34); g.lineTo(112, 34); g.lineTo(122, 52); g.stroke();
    for (const [lx, ly] of [[80, 52], [98, 34], [112, 34], [122, 52]] as const) box(g, lx - 1, ly - 1, 3, 3, '#F2C21A');
    // (the clock)
    g.fillStyle = INK; g.beginPath(); g.arc(150, 34, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F4F0E4'; g.beginPath(); g.arc(150, 34, 9, 0, Math.PI * 2); g.fill();
    box(g, 149, 27, 2, 8, INK); box(g, 150, 33, 6, 2, INK);
  });
  const doorOpen = s.step !== 'wait';
  box(c, BX0 + 1, FLOOR - 97, 8, 97, INK); box(c, BX0 + 2, FLOOR - 96, 6, 96, doorOpen ? '#0E0A06' : PLANK[3]); if (!doorOpen) box(c, BX0 + 2, FLOOR - 96, 2, 96, PLANK[5]);
  // ---- the blood (once he's had it): up the back wall, on the console
  if (sawed(state)) { c.fillStyle = '#7F1D1D'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(SAW_X - 30 + i * 9, top + 40 + (i * 13) % 30, 2 + (i % 3), 0, Math.PI * 2); c.fill(); } box(c, SAW_X - 14, top + 50, 3, 30, '#7F1D1D'); }
  // ---- BUZZSAW MODE: the panel over the console, dark till he slams the button, lit (flashing) from then on
  const modeOn = sawed(state) || (inScene(s) && !(s.step === 'burst' || s.step === 'shove' || s.step === 'engage' || (s.step === 'press' && s.t < 12)));
  box(c, CONSOLE_X - 41, FLOOR - 113, 86, 22, INK); box(c, CONSOLE_X - 40, FLOOR - 112, 84, 20, '#3F3F46');
  const panel = modeOn ? (f % 16 < 8 || !inScene(s) ? '#DC2626' : '#7F1D1D') : '#3F1A1A';
  box(c, CONSOLE_X - 38, FLOOR - 110, 80, 16, panel); box(c, CONSOLE_X - 38, FLOOR - 110, 80, 2, mix(panel, '#FFFFFF', 0.25));
  if (modeOn && (f % 16 < 8 || !inScene(s))) steppedGlow(c, CONSOLE_X + 2, FLOOR - 102, 56, '#EF4444', 0.02, 0.22, 4);
  signText(c, 'BUZZSAW MODE', CONSOLE_X + 2, FLOOR - 98, painted(1, modeOn ? '#FEF08A' : '#5A3A3A', '#1C1209'));
  // ---- the saw (nowhere to be seen before the button): out of the sky, down through the station's roof and the
  // booth's, into his head
  if (inScene(s) && s.step === 'drop') {
    const y = sawFallY(state, s.sawK);
    c.globalAlpha = 0.45; for (let i = 0; i < 3; i++) box(c, SAW_X - 10 + i * 9, y - 70, 2, 50, '#F1F5F9'); c.globalAlpha = 1;
    drawSawDisc(c, SAW_X, y, 12, f * 0.6);
  }
  // ---- Tucker: in the scene, or flat on its floor after (this visit)
  const wounds = tuckerWoundsOf(state);
  if (inScene(s)) {
    const pose = s.step === 'burst' ? 'run' : s.step === 'shove' ? (s.t < 18 ? 'shove' : 'stand') : s.step === 'engage' ? 'slam' : s.step === 'press' ? (s.t < 12 ? 'slam' : 'press') : s.step === 'fall' || s.step === 'after' || s.step === 'go' ? 'flat' : 'press';
    const capless = s.step === 'fall' || s.step === 'after' || s.step === 'go';
    const w = s.step === 'close' || s.step === 'last' || s.step === 'fall' || s.step === 'after' || s.step === 'go' ? { ...wounds, saw: true } : wounds;
    if (pose === 'flat' && s.t < 14 && s.step === 'fall') {
      // (toppling: tipped back over his heels)
      c.save(); c.translate(s.tx, FLOOR); c.rotate(-(s.t / 14) * 1.4); drawTucker(c, 0, 0, 1, f, 'hurt', { wounds: w, face: 'out' }); c.restore();
    } else drawTucker(c, s.tx, FLOOR, 1, f, pose, { wounds: w, talking: s.tuckerTalking, capless, face: pose === 'flat' ? 'out' : undefined });
  } else if (sawed(state) && bodyVisit === landVisit()) drawTucker(c, TUCK_AT, FLOOR, 1, f, 'flat', { wounds, face: 'out' });
  else if (sawed(state)) {
    // (another visit: the chalk outline on the booth's floor)
    c.strokeStyle = '#F1F5F9'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(TUCK_AT - 6, FLOOR - 4, 40, 4, 0, 0, Math.PI * 2); c.stroke();
  }
  // ---- the console: the levers, the lamps, the big red button under its flip cover (up in the scene)
  stillAt(c, 'lr-console', CONSOLE_X, FLOOR, -16, -54, 60, 56, g => {
    const S = STEEL;
    box(g, -14, -52, 56, 52, INK); box(g, -12, -50, 52, 50, S[3]); box(g, -12, -50, 52, 6, S[5]); box(g, -12, -44, 52, 1, S[1]); box(g, -12, -50, 2, 50, S[4]); box(g, 36, -50, 4, 50, S[2]);
    for (let y = -30; y < -2; y += 6) box(g, -8, y, 40, 2, S[2]);
    for (let i = 0; i < 3; i++) { box(g, -8 + i * 8, -60 + 10, 2, 8, INK); box(g, -9 + i * 8, -53, 4, 4, i === 1 ? '#DC2626' : '#26262C'); }
    box(g, 20, -46, 18, 10, INK); box(g, 21, -45, 16, 8, '#1E3A2A'); box(g, 22, -44, 6, 2, '#4ADE80');
  });
  for (let i = 0; i < 4; i++) { const on = (f >> 4) % 4 === i; box(c, CONSOLE_X - 7 + i * 10, FLOOR - 41, 7, 7, INK); box(c, CONSOLE_X - 6 + i * 10, FLOOR - 40, 5, 5, on ? '#22C55E' : '#14532D'); if (on) box(c, CONSOLE_X - 5 + i * 10, FLOOR - 39, 2, 2, '#BBF7D0'); }
  const pressed = s.step === 'press' && s.t >= 12;
  box(c, CONSOLE_X + 21, FLOOR - 59 + (pressed ? 3 : 0), 14, 8, INK); box(c, CONSOLE_X + 22, FLOOR - 58 + (pressed ? 3 : 0), 12, 6, '#DC2626'); box(c, CONSOLE_X + 23, FLOOR - 58 + (pressed ? 3 : 0), 5, 2, '#F87171');
  const cover = s.step === 'wait' || s.step === 'burst' || s.step === 'shove';
  box(c, CONSOLE_X + 19, FLOOR - 67, 18, 5, INK); box(c, CONSOLE_X + 20, FLOOR - 66, 16, 3, cover ? '#FDE047' : '#A16207'); box(c, CONSOLE_X + 20, FLOOR - 66, 16, 1, cover ? '#FFF4A0' : '#C8862A');
  // ---- the operator (in the booth till she's shoved; then out on the platform)
  const op = r.scene.step === 'wait' && !sawed(state) ? { x: OP_AT, y: FLOOR, pose: 'stand' as const } : { x: s.ox, y: s.oy, pose: s.opDown ? (s.ovy || s.ovx ? 'fly' as const : 'sit' as const) : 'stand' as const };
  if (sawed(state) && !inScene(s)) { op.x = OP_AT + 90; op.y = FLOOR; op.pose = 'stand'; }
  drawOperator(c, op.x, op.y, { seed: opSeed(), woman: opWoman(), f, pose: op.pose === 'fly' ? 'fly' : op.pose === 'sit' ? 'down' : 'stand', talk: s.opTalking || !!r.bark, mood: s.step === 'fall' || s.step === 'after' ? 'shocked' : s.opDown ? 'scared' : 'angry', facing: -1 });
  // ---- the booth's front: its window (the glass over them, a glint), the frame and sill, the roof and its sign
  c.globalAlpha = 0.16; box(c, BX0 + 10, top + 12, BX1 - BX0 - 20, 70, '#BFE0F8'); c.globalAlpha = 0.3; box(c, BX0 + 18, top + 16, 6, 40, '#F4FAFE'); box(c, BX0 + 28, top + 16, 2, 26, '#F4FAFE'); c.globalAlpha = 1;
  stillAt(c, 'lr-booth-front', BX0, top, -6, -20, BX1 - BX0 + 12, 110, g => {
    const w = BX1 - BX0, P = PLANK;
    box(g, -4, -18, w + 8, 18, INK); box(g, -2, -16, w + 4, 14, '#7F1D1D'); box(g, -2, -16, w + 4, 2, '#B83A2A'); box(g, -2, -4, w + 4, 2, '#4A0E0A');
    signText(g, 'RIDE CONTROL', 64, -5, painted(1, '#FDE047', '#1C1209'));
    for (const fx of [4, w - 10]) { box(g, fx - 1, 0, 8, 84, INK); box(g, fx, 0, 6, 84, P[3]); box(g, fx, 0, 2, 84, P[5]); }
    box(g, 0, 0, w, 4, INK); box(g, 0, 1, w, 2, P[4]);
    box(g, -2, 81, w + 4, 8, INK); box(g, 0, 82, w, 6, P[3]); box(g, 0, 82, w, 2, P[5]); box(g, 0, 86, w, 2, P[1]);
  });
  // ---- the holes it came down through (the station's roof, the booth's), splinters hanging, daylight down them
  if (sawed(state) || (inScene(s) && s.roof)) roofHole(c, ROOF_Y, 12, true);
  if (sawed(state) || (inScene(s) && s.booth)) roofHole(c, top - 9, 9, false);
  // (the words over them while they're said)
  const sayY = top - 30;
  if (s.tucker && s.step !== 'close') saidOver(c, s.tucker.text, s.tx, sayY, '#FDE68A', 260);
  else if (s.op) saidOver(c, s.op.text, op.x, sayY - 12, '#E0F2FE', 240);
  else if (r.bark) saidOver(c, r.bark.text, op.x, sayY - 12, '#E0F2FE', 240);
};

/** A ragged hole the saw punched down through a roof (its splintered boards hanging; the station's lets the daylight
 *  down). */
const roofHole = (c: Ctx, y: number, h: number, light: boolean) => {
  c.fillStyle = '#0A0806'; c.beginPath(); c.moveTo(SAW_X - 16, y - h); c.lineTo(SAW_X - 10, y + h); c.lineTo(SAW_X - 2, y + h - 3); c.lineTo(SAW_X + 6, y + h + 2); c.lineTo(SAW_X + 15, y - h + 2); c.lineTo(SAW_X + 4, y - h - 2); c.closePath(); c.fill();
  for (const [dx, a] of [[-12, 0.5], [10, -0.6], [0, 0.15]] as const) { c.save(); c.translate(SAW_X + dx, y + h - 2); c.rotate(a); box(c, -2, 0, 4, 12, '#8A5A30'); c.restore(); }
  if (light) { c.globalAlpha = 0.14; c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(SAW_X - 10, y + h); c.lineTo(SAW_X + 10, y + h); c.lineTo(SAW_X + 34, FLOOR - BOOTH.top - 18); c.lineTo(SAW_X - 34, FLOOR - BOOTH.top - 18); c.closePath(); c.fill(); c.globalAlpha = 1; }
};

/** Screen space: the close-up (the saw into his forehead), his last words under it; SKIP. */
export const drawSceneHud = (c: Ctx, state: GameState) => {
  const s = rideOf(state).scene;
  if (s.step === 'close' || (s.step === 'fall' && s.t < 1)) {
    const t = s.t, k = s.k, z = Math.min(1, t / 10);
    const w = 400 * (0.6 + 0.4 * z), h = 250 * (0.6 + 0.4 * z), cx = CANVAS_WIDTH / 2, cy = 200, x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.globalAlpha = Math.min(1, z * 1.4);
    box(c, x - 8, y - 8, w + 16, h + 16, INK); box(c, x - 6, y - 6, w + 12, h + 12, '#6B4423'); box(c, x - 6, y - 6, w + 12, 3, '#9A6A3A');
    for (const [qx, qy] of [[x - 6, y - 6], [x + w - 4, y - 6], [x - 6, y + h - 4], [x + w - 4, y + h - 4]]) box(c, qx, qy, 10, 10, '#E0B040');
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    // (behind his head: the booth's dark wall, in bands, the red of the klaxon going round)
    for (let i = 0; i < 6; i++) box(c, x, y + (i * h) / 6, w, h / 6 + 1, mix('#2A1E14', '#4A3424', i / 6));
    if ((state.frame >> 3) % 2 === 0) { c.globalAlpha = 0.18; box(c, x, y, w, h, '#DC2626'); c.globalAlpha = 1; }
    // (him: manic, looking up; the hit (the jolt, the shock); then woozy, his one eye rolled up at it)
    const face = k < 0.25 ? 'manic' : k < 0.5 ? 'shock' : 'daze';
    const jolt = k > 0.24 && k < 0.66 ? 0.5 + (k < 0.32 ? 1 : 0) : k < 0.25 ? 0.12 : 0.04;
    drawTuckerCloseup(c, cx, cy + 30, 6.2, state.frame, { face, talking: s.tuckerTalking && k > 0.9, red: k < 0.25, jolt, wounds: { eye: true }, capless: true, making: { wound: 'saw', k } });
    c.restore();
    if (s.tucker) saidOver(c, s.tucker.text, cx, y + h + 34, '#FDE68A', 340);
  }
  if (inScene(s) && s.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  void CANVAS_HEIGHT; void waterY;
};
