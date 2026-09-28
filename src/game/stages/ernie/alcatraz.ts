// Alcatraz, the cell house. A guided tour's stopped on Broadway (the main
// corridor between the cells): the guide's telling them nobody ever got out
// of here. Somebody asks if anybody ever broke in. From somewhere above:
// "FIRST TIME FOR EVERYTHING!" The jet ski comes down through the skylight on
// top of the lot of them, and goes up. When the smoke clears there's one man
// standing. Ernie's door is just down the corridor.

import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { playSound, playGlassShatterSound } from '../../audio';
import { say, MEATHEAD_VOICE, Voice } from '../../speech';
import { GROUND_Y } from '../../../constants';
import { COURSE, CP } from './course';

export type TourPhase = 'waiting' | 'tour' | 'wrecked';
export interface Tour {
  phase: TourPhase;
  t: number;
  /** Who's saying what, over whom: 'guide', a tourist's index, or 'meathead' (off the top of the screen, then over him). */
  line: string;
  who: string;
  lineT: number;
}

/** The fade up from black, the lines, the ski coming down, the blast, him climbing out, and control back. */
export const FADE_IN = 30, DROP_AT = 272, IMPACT_AT = 292, CLIMB_AT = 380, TOUR_END = 500;
const GUIDE_VOICE: Voice = { pitch: 1.1, rate: 0.95 };
const TOURIST_VOICE: Voice = { pitch: 1.6, rate: 1.1 };

/** Where the tour's standing (world x from the crash spot) and who they are. */
export const TOURISTS = [
  { dx: -150, look: 'dad' }, { dx: -95, look: 'mom' }, { dx: -55, look: 'kid' }, { dx: -10, look: 'selfie' },
  { dx: 40, look: 'grandpa' }, { dx: 85, look: 'backpacker' }, { dx: 140, look: 'guide' },
] as const;

export const createTour = (startedAt: number): Tour => ({ phase: startedAt >= CP.ALCATRAZ ? 'wrecked' : 'waiting', t: 0, line: '', who: '', lineT: 0 });

/** He's gone up the ramp: cut to the cell house (he's somewhere way up over the roof). */
export const startTour = (state: GameState, tour: Tour) => {
  const C = COURSE.cellblock;
  tour.phase = 'tour'; tour.t = 0;
  const p = state.player;
  p.hidden = true;
  p.inCutscene = true;
  p.skiing = false; p.jetski = false;
  state.lockWeapon = undefined;
  state.cameraLeadX = 0;
  p.vel = { x: 0, y: 0 };
  p.pos = { x: C.crashX - p.width / 2, y: C.y - 2000 };
  state.cameraOverride = { x: C.x1, y: C.y - 550 };
  state.camera.x = C.x1; state.camera.y = C.y - 550;
  state.cameraRestY = C.y - 550;
  state.cameraMinX = C.x1;
  state.enemies = [];
  state.projectiles = [];
};

const speak = (tour: Tour, who: string, text: string, voice: Voice) => {
  tour.who = who; tour.line = text; tour.lineT = 90;
  say(text, voice, 'urgent', { onShow: () => {}, onHide: () => {} });
};

export const updateTour = (ctx: FrameContext, tour: Tour, controls: Controls): Controls => {
  const { state, fx } = ctx;
  if (tour.lineT > 0) tour.lineT--;
  if (tour.phase !== 'tour') { if (tour.phase === 'wrecked' && tour.t < 999) tour.t++; return controls; }
  const p = state.player;
  const C = COURSE.cellblock;
  tour.t++;
  const t = tour.t;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.vel = { x: 0, y: 0 };
  if (t === 40) speak(tour, 'guide', '...AND NOBODY EVER ESCAPED FROM THE ROCK.', GUIDE_VOICE);
  if (t === 125) speak(tour, '3', 'HAS ANYBODY EVER BROKEN IN?', TOURIST_VOICE);
  if (t === 190) speak(tour, 'guide', "HA! NOBODY'S THAT STUPID.", GUIDE_VOICE);
  if (t === 240) { speak(tour, 'meathead', 'FIRST TIME FOR EVERYTHIIIIING!!!', MEATHEAD_VOICE); tour.lineT = 60; }
  if (t === DROP_AT) playGlassShatterSound();
  if (t === IMPACT_AT) {
    // Down on the lot of them
    playSound('nuke'); playSound('ignite');
    shakeScreen(state, 50, 14);
    const cx = C.crashX, y = C.y;
    for (const tr of TOURISTS) fx.spawnDeathShower({ x: cx + tr.dx, y: y - 40 }, tr.dx < 0 ? -1 : 1, 2.2);
    fx.spawnExplosion({ x: cx, y: y - 30 }, '#F97316', 30, 0, 22);
    fx.spawnExplosion({ x: cx, y: y - 30 }, '#FDE047', 20, 0, 16);
    fx.spawnExplosion({ x: cx, y: y - 30 }, '#1C1917', 20, 0, 18);
    for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: cx, y: y - 20 }, vel: { x: (Math.random() - 0.5) * 16, y: -3 - Math.random() * 12 }, life: 50 + Math.random() * 40, color: ['#DC2626', '#F8FAFC', '#1C1917', '#FACC15', '#7F1D1D'][i % 5], size: 4 + Math.random() * 7 });
    tour.lineT = 0;
  }
  if (t === IMPACT_AT + 30) playSound('screams');
  if (t === CLIMB_AT) {
    // Up out of the wreck
    p.hidden = false;
    p.pos = { x: C.crashX + 30, y: C.y - p.height };
    p.facing = 1;
    p.squash = 0.6;
  }
  if (t === CLIMB_AT + 40) speak(tour, 'meathead', 'WHICH WAY TO THE GIFT SHOP?', MEATHEAD_VOICE);
  if (t >= TOUR_END) {
    tour.phase = 'wrecked'; tour.t = 999;
    p.inCutscene = false;
    state.cameraOverride = null;
    state.cameraMinX = C.x1;
    state.checkpoint = Math.max(state.checkpoint, CP.ALCATRAZ);
  }
  return { ...NO_CONTROLS };
};

/** The ski on its way down through the roof (0 before it's in view .. 1 on the floor), or -1 when it's not falling. */
export const skiDrop = (tour: Tour) => (tour.phase !== 'tour' || tour.t < DROP_AT - 8 || tour.t >= IMPACT_AT ? -1 : Math.min(1, (tour.t - (DROP_AT - 8)) / (IMPACT_AT - (DROP_AT - 8))));

export const tourWrecked = (tour: Tour) => tour.phase === 'wrecked' || (tour.phase === 'tour' && tour.t >= IMPACT_AT);

void GROUND_Y;
