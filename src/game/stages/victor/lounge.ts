// The top of the shaft: a window, and through it the VIP lounge. The party's in
// full swing (velvet, a DJ, men in sunglasses at night). Meathead comes through
// the window off the left of the shot, feet first: "IT'S PARTY TIME." Cut to the
// volcano from a long way off, all quiet, then a blast near the top, right
// where the lounge is. No explanation. Cut back: what's left of the lounge, and
// of everybody in it. The boss door's just ahead.

import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { playSound } from '../../audio';
import { say, MEATHEAD_VOICE } from '../../speech';
import { COURSE, CP } from './course';

export type LoungePhase = 'party' | 'crash' | 'wide' | 'wrecked';
export interface Lounge {
  phase: LoungePhase;
  t: number;
  /** Where he is flying in from, mid-crash (world), and what he's saying. */
  line: string;
  lineT: number;
}

/** Timeline: the party (a beat), he comes through the window, the cut to the wide shot, the blast, and back. */
export const PARTY_FRAMES = 70, CRASH_FRAMES = 60, WIDE_FRAMES = 230, BLAST_AT = 70;

export const createLounge = (startedAt: number): Lounge => ({ phase: startedAt >= CP.LOUNGE ? 'wrecked' : 'party', t: 0, line: '', lineT: 0 });

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

/** Where Meathead is while he flies in through the window (world), t frames after he comes through it. */
export const crashPose = (t: number) => {
  const L = COURSE.lounge;
  const k = Math.min(1, t / 34);
  // From off the left of the shot, through the glass, a flying kick down into the middle of the room
  const x = L.x1 - 140 + k * 420;
  const y = L.y - 330 + k * 260 - Math.sin(k * Math.PI) * 60;
  return { x, y, k };
};

export const updateLounge = (ctx: FrameContext, lg: Lounge, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  if (lg.lineT > 0) lg.lineT--;
  if (lg.phase === 'party' || lg.phase === 'wrecked') return controls;
  lg.t++;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  const L = COURSE.lounge;
  if (lg.phase === 'crash') {
    // (a beat of the party first, then the glass goes)
    if (lg.t === PARTY_FRAMES) { playSound('nuke'); shakeScreen(state, 14, 6); }
    if (lg.t === PARTY_FRAMES + 8) {
      const text = "IT'S PARTY TIME.";
      const shown = say(text, MEATHEAD_VOICE, 'urgent', { onShow: () => { lg.line = text; lg.lineT = 110; }, onHide: () => { if (lg.line === text) lg.lineT = Math.min(lg.lineT, 30); } });
      if (!shown) { lg.line = text; lg.lineT = 90; }
    }
    if (lg.t >= PARTY_FRAMES + CRASH_FRAMES) { lg.phase = 'wide'; lg.t = 0; }
  } else if (lg.phase === 'wide') {
    // The volcano from a long way off; then, near the top, the blast
    if (lg.t === BLAST_AT) playSound('nuke');
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
      shakeScreen(state, 20, 5);
    }
  }
  return { ...NO_CONTROLS };
};

/** The explosion in the wide shot (0 none .. 1 full), and whether it's over. */
export const blastAmount = (lg: Lounge) => (lg.phase !== 'wide' || lg.t < BLAST_AT ? 0 : Math.min(1, (lg.t - BLAST_AT) / 20));
