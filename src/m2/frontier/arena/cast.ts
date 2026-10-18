// The catch-up and the arena's cast, shared by its scenes: saying things (one at a time, words up only while said),
// Tucker in the world by what he's doing (on his bike, hopping, hung on the oak, flat, popped up, up), the bikes, the
// oak's branch in front of or behind him, the camera.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays, speak, saidOver, byPants } from '../section';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { type Ctx } from '../kit';
import { drawTucker, TUCKER_H, type TuckerPose, type TuckerOpts, type TuckerWounds } from '../tucker';
import { drawDirtBike } from '../woods/teens';
import { x0, x1, GY, HANG_X, HANG_FEET, MH_BIKE, TUCK_BIKE } from './layout';
import { drawOakBranch, drawWreck, drawAxeTree } from './art';
import { arenaOf, BRANCH_MEMO, type Arena } from './state';

/** Before the branch: the eye, the saw, the woods' grime (whatever the memos say: a cheat start sees him right). */
export const WOUNDS_BEFORE: TuckerWounds = { eye: true, saw: true, grime: true };
/** From the branch on. */
export const WOUNDS_ALL: TuckerWounds = { eye: true, saw: true, grime: true, branch: true };
/** From the arena entry's felled tree on: split to the nose, blind. */
export const WOUNDS_SPLIT: TuckerWounds = { ...WOUNDS_ALL, split: true };

// ---------------------------------------------------------------------------------------------------------------
// Saying things

/** Tucker says one from the pool (the scene waits on `busy`), his words up while it's said. */
export const tuckerSays = (state: GameState, s: Arena, pool: ByPants, done?: () => void) => {
  s.busy = true; s.talking = true;
  speak(TUCKER_VOICE, pickLine(byPants(state, pool)), said => { s.said = said?.text ?? null; if (!said) s.talking = false; }, true, () => { s.busy = false; s.talking = false; done?.(); });
};
/** A bark of his (not waited on: Meathead's free; up only while said). */
export const tuckerBarks = (state: GameState, s: Arena, pool: ByPants) => {
  s.talking = true;
  speak(TUCKER_VOICE, pickLine(byPants(state, pool)), said => { s.said = said?.text ?? null; if (!said) s.talking = false; }, false, () => { s.talking = false; });
};
/** Meathead says one (the scene waits on `busy`). */
export const meatheadLine = (state: GameState, s: Arena, pool: ByPants, done?: () => void) => {
  s.busy = true;
  meatheadSays(state, pickLine(byPants(state, pool)), true, () => { s.busy = false; done?.(); });
};

// ---------------------------------------------------------------------------------------------------------------
// The camera (the scenes': eased toward a middle, kept in the section)

export const camTo = (state: GameState, s: Arena, mid: number, ease = 0.12) => {
  const want = Math.max(x0, Math.min(x1 - CANVAS_WIDTH, mid - CANVAS_WIDTH / 2));
  s.camX += (want - s.camX) * ease;
  if (Math.abs(want - s.camX) < 0.5) s.camX = want;
  state.cameraOverride = { x: Math.round(s.camX), y: GY - 550 };
};
export const camSnap = (state: GameState, s: Arena, mid: number) => { s.camX = Math.max(x0, Math.min(x1 - CANVAS_WIDTH, mid - CANVAS_WIDTH / 2)); state.cameraOverride = { x: Math.round(s.camX), y: GY - 550 }; };

// ---------------------------------------------------------------------------------------------------------------
// Tucker's moves (a hop; a leap with gravity)

export const tickTucker = (s: Arena) => {
  if (s.hop) {
    s.hop.k = Math.min(1, s.hop.k + 1 / 14);
    s.tx = s.hop.fx + (s.hop.tx - s.hop.fx) * s.hop.k; s.ty = GY - Math.sin(s.hop.k * Math.PI) * 26;
    if (s.hop.k >= 1) { s.hop = null; s.ty = GY; }
  } else if (s.tvy !== 0 || s.ty < GY) {
    s.tvy += 0.6; s.tx += s.tvx; s.ty += s.tvy;
    if (s.ty >= GY) { s.ty = GY; s.tvy = 0; s.tvx = 0; }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world)

/** A dirt bike with Tucker on it (drawBike's way: he's sat on its seat, tipped with its wheelie). */
const drawRider = (c: Ctx, bx: number, tilt: number, spin: number, f: number, pose: TuckerPose, opts: TuckerOpts) => {
  drawDirtBike(c, bx, GY, 1, 1, tilt, spin, TUCK_BIKE, 66);
  c.save(); c.translate(Math.round(bx), GY);
  c.translate(-24, -11); c.rotate(tilt); c.translate(24, 11);
  drawTucker(c, -11, -4, 1, f, pose, opts);
  c.restore();
};

/** Behind Meathead: the oak's branch (unless he's on it), the wreck, the kid's bike, Tucker (and the branch over him). */
export const drawArenaCast = (c: Ctx, state: GameState) => {
  const s = arenaOf(state), f = state.frame;
  const branched = state.stageMemo[BRANCH_MEMO] === '1' || s.tMode === 'impaled';
  const wounds = s.split ? WOUNDS_SPLIT : branched ? WOUNDS_ALL : WOUNDS_BEFORE;
  if (s.tMode !== 'impaled') drawOakBranch(c, s.snapped ? 'snapped' : 'whole');
  drawAxeTree(c, state, s);
  if (s.wreck) drawWreck(c, state);
  // (the kid's bike: under him in the scene, parked on its stand after)
  if (s.mx !== null) drawDirtBike(c, s.mx, GY + (s.riding ? 4 : 0), 1, 1, s.mtilt, s.mspin, MH_BIKE, 7);
  switch (s.tMode) {
    case 'gone': break;
    case 'ride': drawRider(c, s.bx, s.btilt, s.bspin, f, s.pose, { wounds, talking: s.talking, face: s.face }); break;
    case 'impaled':
      drawTucker(c, HANG_X, HANG_FEET, 1, f, 'impaled', { wounds: WOUNDS_ALL, face: s.face ?? 'out', talking: s.talking, onBranch: true });
      drawOakBranch(c, 'him');
      break;
    default:
      // (his bike, stood where it coughed out, while he's off it)
      if (s.step && s.phase === 'catchup' && !s.wreck) drawDirtBike(c, s.bx, GY, 1, 1, 0, s.bspin, TUCK_BIKE, 66);
      // (squashed down by the trunk's blow, springing back)
      if (s.squash > 0) {
        c.save(); c.translate(Math.round(s.tx), Math.round(s.ty)); c.scale(1 + s.squash * 0.25, 1 - s.squash * 0.3);
        drawTucker(c, 0, 0, s.tFacing, f, s.pose, { wounds, talking: s.talking, face: s.face });
        c.restore();
      } else drawTucker(c, s.tx, s.ty, s.tFacing, f, s.pose, { wounds, talking: s.talking, face: s.face });
  }
};

/** His words over him while they're said (world; not while a close-up or the jumpscare has the screen). */
export const drawTuckerWords = (c: Ctx, state: GameState) => {
  const s = arenaOf(state);
  if (!s.said) return;
  const [x, y] = s.tMode === 'ride' ? [s.bx, GY - TUCKER_H - 44] : s.tMode === 'impaled' ? [HANG_X, HANG_FEET - TUCKER_H - 24] : [s.tx, s.ty - TUCKER_H - 22];
  saidOver(c, s.said, x, y, '#FDE68A', 260);
};
