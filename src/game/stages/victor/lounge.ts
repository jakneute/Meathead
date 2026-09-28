// The top of the shaft: a window, and through it the VIP lounge. The party's in
// full swing (velvet, a DJ, men in sunglasses at night). Meathead comes through
// the window off the left of the shot, feet first, lands: "IT'S PARTY TIME."
// The guests panic. The camera pulls out and out until it's the whole volcano,
// all quiet; then a blast near the top, right where the lounge is, and a long
// way off, muffled, screaming. No explanation. Back in, down into the black,
// and up on what's left of the lounge, and of everybody in it. The boss door's
// just ahead.

import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { playSound, playGlassShatterSound } from '../../audio';
import { say, MEATHEAD_VOICE } from '../../speech';
import { COURSE, CP } from './course';

export type LoungePhase = 'party' | 'crash' | 'wide' | 'wrecked';
export interface Lounge {
  phase: LoungePhase;
  t: number;
  /** What Meathead's saying, and for how long. */
  line: string;
  lineT: number;
}

/** In the lounge: a beat of the party, his flight in through the window, then the panic. */
export const PARTY_FRAMES = 70, FLIGHT_FRAMES = 34, PANIC_FRAMES = 150;
export const CRASH_FRAMES = PARTY_FRAMES + FLIGHT_FRAMES + PANIC_FRAMES;
/** The wide shot: pull out to the whole volcano, a beat, the blast, the screaming, a beat, push back in, down to black. */
export const ZOOM_OUT = 80, BLAST_AT = 125, SCREAM_AT = 150, ZOOM_IN_AT = 280, WIDE_FRAMES = 350;
/** Back in the lounge afterwards: up out of the black. */
export const FADE_IN = 40;

export const createLounge = (startedAt: number): Lounge => ({ phase: startedAt >= CP.LOUNGE ? 'wrecked' : 'party', t: FADE_IN, line: '', lineT: 0 });

/** He's at the window: in he goes. */
export const startCrash = (state: GameState, lg: Lounge) => {
  lg.phase = 'crash'; lg.t = 0;
  const p = state.player;
  p.hidden = true;
  p.inCutscene = true;
  p.vel = { x: 0, y: 0 };
  const L = COURSE.lounge;
  state.cameraOverride = { x: L.x1 - 40, y: L.y - 550 };
  state.camera.x = state.cameraOverride.x; state.camera.y = state.cameraOverride.y;
  state.cameraMinX = L.x1 - 40;
};

/** Where Meathead is while he flies in through the window (world), t frames after he comes through it (landed from FLIGHT_FRAMES on). */
export const crashPose = (t: number) => {
  const L = COURSE.lounge;
  const k = Math.min(1, t / FLIGHT_FRAMES);
  // From off the left of the shot, through the glass, a flying kick down into the middle of the room
  const x = L.x1 - 140 + k * 420;
  const y = L.y - 330 + k * 266 - Math.sin(k * Math.PI) * 60;
  return { x, y, k };
};

const meatheadSays = (lg: Lounge, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', { onShow: () => { lg.line = text; lg.lineT = 120; }, onHide: () => { if (lg.line === text) lg.lineT = Math.min(lg.lineT, 30); } });
  if (!shown) { lg.line = text; lg.lineT = 100; }
};

export const updateLounge = (ctx: FrameContext, lg: Lounge, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  if (lg.lineT > 0) lg.lineT--;
  if (lg.phase === 'party') return controls;
  if (lg.phase === 'wrecked') { if (lg.t < FADE_IN) lg.t++; return controls; }
  lg.t++;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  const L = COURSE.lounge;
  if (lg.phase === 'crash') {
    if (lg.t === PARTY_FRAMES) { playGlassShatterSound(); shakeScreen(state, 14, 6); }
    if (lg.t === PARTY_FRAMES + FLIGHT_FRAMES) { playSound('nuke'); shakeScreen(state, 16, 7); meatheadSays(lg, "IT'S PARTY TIME."); }
    if (lg.t >= CRASH_FRAMES) { lg.phase = 'wide'; lg.t = 0; }
  } else if (lg.phase === 'wide') {
    if (lg.t === BLAST_AT) playSound('nuke');
    if (lg.t === SCREAM_AT) playSound('screams');
    if (lg.t >= WIDE_FRAMES) {
      // Back inside: what's left
      lg.phase = 'wrecked'; lg.t = 0;
      p.hidden = false;
      p.inCutscene = false;
      p.pos = { x: L.x1 + 280, y: L.y - p.height };
      p.vel = { x: 0, y: 0 };
      p.facing = 1;
      state.cameraOverride = null;
      state.camera.x = L.x1 - 40; state.camera.y = L.y - 550;
      state.cameraRestY = L.y - 550;
      state.cameraMinX = L.x1 - 40;
      state.checkpoint = Math.max(state.checkpoint, CP.LOUNGE);
    }
  }
  return { ...NO_CONTROLS };
};

/** The blast in the wide shot (0 none .. 1 full). */
export const blastAmount = (lg: Lounge) => (lg.phase !== 'wide' || lg.t < BLAST_AT ? 0 : Math.min(1, (lg.t - BLAST_AT) / 20));
