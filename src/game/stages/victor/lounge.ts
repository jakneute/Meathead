// The top of the shaft: a window, and through it the VIP lounge. The party's in
// full swing (velvet, a DJ, men in sunglasses at night). Meathead comes through
// the window off the left of the shot, feet first, lands: "IT'S PARTY TIME."
// The guests panic. The camera pulls out and out until it's the whole volcano,
// all quiet; then a blast near the top, right where the lounge is, and a long
// way off, muffled, screaming. No explanation. Back in, down into the black,
// and up on what's left of the lounge, and of everybody in it. The boss door's
// just ahead.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound, playGlassShatterSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
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

/** How long after it's faded back up (and he's back in control) before he says it. */
const AFTERMATH_LINE_DELAY = 35;
/** What he's got to say about the VIP lounge once the smoke clears. */
const AFTERMATH_LINES = [
  "NOW THAT'S WHAT I CALL AN AFTER-PARTY.",
  "GUEST LIST'S A LOT SHORTER NOW.",
  "BOTTLE SERVICE? ANYONE? ...ANYONE?",
  "SORRY. I THOUGHT IT WAS A MOSH PIT.",
  "THEY SAID THIS PLACE WAS TO DIE FOR.",
  "FIVE STARS. VERY EXCLUSIVE NOW.",
];

// (coming back to it after a death it's already been said: no fade, no line)
export const createLounge = (startedAt: number): Lounge => ({ phase: startedAt >= CP.LOUNGE ? 'wrecked' : 'party', t: FADE_IN + AFTERMATH_LINE_DELAY, line: '', lineT: 0 });

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
  if (lg.phase === 'wrecked') {
    if (lg.t < FADE_IN + AFTERMATH_LINE_DELAY) {
      lg.t++;
      // Up out of the black onto what's left of the VIP lounge, back in control, a beat to take it in: his review
      if (lg.t === FADE_IN + AFTERMATH_LINE_DELAY) {
        const text = AFTERMATH_LINES[Math.floor(Math.random() * AFTERMATH_LINES.length)];
        const shown = say(text, MEATHEAD_VOICE, 'urgent', {
          onShow: spoken => { state.playerLastVulgarity = text; state.playerVulgarityTimer = spoken ? 9999 : 170; },
          onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
        });
        if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 170; }
      }
    }
    return controls;
  }
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
