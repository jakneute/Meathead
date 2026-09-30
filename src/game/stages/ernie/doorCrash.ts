// Right outside Ernie's door, in the citadel's last vault: a second tour, the
// night tour of the dungeons. The guide's telling them these vaults have stood
// untouched since 1859. Then a whistle from above, and the hipster, who went
// off the ramp after Meathead on his standby jet ski (he's been in the air all
// this time), comes down through the vault on top of the lot of them, and goes
// up. The vault
// caves in behind Meathead: there's no going back. He doesn't survive his own
// landing. "...THERE HE WENT."

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { say, canSpeak, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { GROUND_Y } from '../../../constants';
import { COURSE, CP } from './course';

export type DoorCrashPhase = 'waiting' | 'scene' | 'done';
export interface DoorCrash {
  phase: DoorCrashPhase;
  t: number;
  /** The scene's beats (each line waits for the one before it), when the beat started, the line being said and by whom. */
  step: number;
  stepAt: number;
  talk: { at: number; len: number; spoken: boolean; done: boolean } | null;
  line: string;
  who: 'guide' | 'meathead' | 'hipster' | '';
  lineT: number;
  /** When the whistle started (he's on his way down), when he hit, when the vault came in behind. */
  whistleAt: number;
  impactAt: number;
  caveAt: number;
}

const C = COURSE.cellblock;
/** Where the tour's stood (and he comes down), where Meathead walks into it, and the vault that caves in behind him. */
export const CRASH_X = C.x2 - 400;
const TRIGGER_X = C.x2 - 640;
export const CAVE_X = C.x2 - 740, CAVE_W = 50;
/** How long he takes to come down through the vault (slowed by the brick and bedrock he's coming through). */
export const DROP_FRAMES = 70;
const Y = GROUND_Y;
const GUIDE_VOICE: Voice = { id: 'guide', pitch: 0.95, rate: 0.9 };
const HIPSTER_VOICE: Voice = { id: 'hipster', pitch: 1.4, rate: 1.1 };

/** The night tour: who's where (from CRASH_X), and how they look (the same folk as the day tour's). */
export const NIGHT_TOUR = [
  { dx: -120, look: 'grandpa' }, { dx: -78, look: 'mom' }, { dx: -40, look: 'kid' }, { dx: 2, look: 'dad' },
  { dx: 44, look: 'selfie' }, { dx: 84, look: 'backpacker' }, { dx: 130, look: 'guide' },
] as const;

export const createDoorCrash = (state: GameState, startedAt: number): DoorCrash => {
  const done = startedAt >= CP.DOOR;
  if (done) caveIn(state);
  return { phase: done ? 'done' : 'waiting', t: 0, step: 0, stepAt: 0, talk: null, line: '', who: '', lineT: 0, whistleAt: done ? -999 : 0, impactAt: done ? -999 : 0, caveAt: done ? -999 : 0 };
};

/** The vault behind him, come down: nothing gets back past it. */
const caveIn = (state: GameState) => {
  if (!state.blocks.some(b => b.tag === 'door-cavein')) state.blocks.push({ x: CAVE_X, y: Y - 3000, w: CAVE_W, h: 3000, type: 'wall', hidden: true, tag: 'door-cavein' });
};

const speak = (dc: DoorCrash, who: 'guide' | 'meathead' | 'hipster', text: string) => {
  const t = { at: dc.t, len: text.length, spoken: false, done: false };
  dc.talk = t; dc.line = text; dc.who = who; dc.lineT = 9999;
  t.spoken = say(text, who === 'guide' ? GUIDE_VOICE : who === 'hipster' ? HIPSTER_VOICE : MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {}, onDone: () => { t.done = true; } }) && canSpeak();
};
/** The line being said is over (spoken to the end; with no voice, up long enough to read; and never forever). */
const talkOver = (dc: DoorCrash) => {
  const t = dc.talk;
  if (!t) return true;
  const age = dc.t - t.at;
  const over = age > 20 && (t.done || (!t.spoken && age > 45 + t.len * 3) || age > 60 + t.len * 5);
  if (over) { dc.talk = null; if (dc.lineT > 20) dc.lineT = 20; }
  return over;
};

export const updateDoorCrash = (ctx: FrameContext, dc: DoorCrash, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  if (dc.lineT > 0) dc.lineT--;
  if (dc.phase === 'done') return controls;
  if (dc.phase === 'waiting') {
    if (!(p.isGrounded && p.pos.x + p.width / 2 >= TRIGGER_X && p.pos.x < C.x2)) return controls;
    // He's in: the camera takes the vault, and whatever's still about clears off
    dc.phase = 'scene'; dc.t = 0; dc.step = 0; dc.stepAt = 0;
    p.inCutscene = true;
    state.cameraOverride = { x: C.x2 - 800, y: Y - 550 };
    state.enemies = state.enemies.filter(e => e.type === 'boss' || e.pos.x < CAVE_X - 200);
    state.projectiles = [];
  }
  dc.t++;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.facing = 1;
  const since = dc.t - dc.stepAt;
  const next = () => { dc.step++; dc.stepAt = dc.t; };
  switch (dc.step) {
    case 0: if (since >= 25) { speak(dc, 'guide', 'AND THESE VAULTS HAVE STOOD, UNTOUCHED, SINCE EIGHTEEN FIFTY-NINE.'); next(); } break;
    case 1:
      // A whistle from somewhere above, getting louder
      if (talkOver(dc) && since > 20) { dc.whistleAt = dc.t; playSound('whoosh', 1, -8); next(); }
      break;
    case 2:
      if (since === 30) playSound('whoosh', 1, 4);
      // The vault over them coming apart as he comes through it: cracks and dust first, then brick and bedrock raining down
      if (since < 30 && state.frame % 3 === 0) state.particles.push({ pos: { x: CRASH_X + (Math.random() - 0.5) * 60, y: Y - 228 }, vel: { x: (Math.random() - 0.5) * 0.6, y: 1 + Math.random() * 2 }, life: 40, color: '#A8A29E', size: 2 + Math.random() * 3 });
      if (since >= 30) {
        if (since === 30) { playSound('crack'); shakeScreen(state, 10, 4); speak(dc, 'hipster', 'NAMASTE, PEASANTS!'); }
        // Burrowing down through the bedrock: rock sprayed out either side of him; once he's through into the vault,
        // brick raining down on the tour
        const hy = hipsterY(dc);
        if (state.frame % 3 === 0) shakeScreen(state, 4, 3);
        for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: CRASH_X + (Math.random() - 0.5) * 50, y: hy - 10 }, vel: { x: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 5), y: -2 - Math.random() * 3 }, life: 30 + Math.random() * 15, color: ['#34251E', '#57534E', '#231813', '#78716C'][(i + state.frame) % 4], size: 3 + Math.random() * 6 });
        if (hy > Y - 240) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: CRASH_X + (Math.random() - 0.5) * 140, y: Y - 232 }, vel: { x: (Math.random() - 0.5) * 4, y: 2 + Math.random() * 5 }, life: 40 + Math.random() * 20, color: ['#7C4A3A', '#5A3526', '#57534E', '#A8A29E'][(i + state.frame) % 4], size: 4 + Math.random() * 7 });
      }
      if (since === 30 + DROP_FRAMES) {
        // Down through the vault, on top of the lot of them, and up it goes
        dc.impactAt = dc.t;
        playSound('boom'); playSound('crash');
        shakeScreen(state, 50, 14);
        for (const tr of NIGHT_TOUR) fx.spawnDeathShower({ x: CRASH_X + tr.dx, y: Y - 40 }, tr.dx < 0 ? -1 : 1, 2.2);
        fx.spawnExplosion({ x: CRASH_X, y: Y - 30 }, '#F97316', 30, 0, 22);
        fx.spawnExplosion({ x: CRASH_X, y: Y - 30 }, '#FDE047', 20, 0, 16);
        fx.spawnExplosion({ x: CRASH_X, y: Y - 30 }, '#1C1917', 20, 0, 18);
        for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: CRASH_X, y: Y - 20 }, vel: { x: (Math.random() - 0.5) * 16, y: -3 - Math.random() * 12 }, life: 50 + Math.random() * 40, color: ['#DC2626', '#7C4A3A', '#1C1917', '#FACC15', '#7F1D1D'][i % 5], size: 4 + Math.random() * 7 });
        dc.lineT = 0;
        next();
      }
      break;
    case 3:
      if (since === 30) playSound('screams');
      if (since === 22) {
        // ...and the vault behind him comes in
        dc.caveAt = dc.t;
        caveIn(state);
        playSound('crash'); playSound('rumble');
        shakeScreen(state, 30, 10);
        for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: CAVE_X + Math.random() * CAVE_W, y: Y - 230 + Math.random() * 60 }, vel: { x: (Math.random() - 0.3) * 5, y: Math.random() * 3 }, life: 50 + Math.random() * 30, color: i % 3 ? '#7C4A3A' : '#A8A29E', size: 4 + Math.random() * 8 });
      }
      if (since > 90 && talkOver(dc)) { speak(dc, 'meathead', '...THERE HE WENT.'); next(); }
      break;
    case 4:
      if (talkOver(dc) && since > 40) {
        dc.phase = 'done';
        p.inCutscene = false;
        state.cameraOverride = null;
      }
      break;
  }
  return { ...NO_CONTROLS };
};

/** The vault over the tour torn open (0 whole; a little while the cracks spread; to 1 as he comes through it). */
export const ceilingTear = (dc: DoorCrash) => {
  if (crashed(dc)) return 1;
  if (dc.phase !== 'scene' || dc.step !== 2) return 0;
  const since = dc.t - dc.whistleAt;
  return since < 30 ? 0.12 * (since / 30) : 0.12 + 0.88 * Math.min(1, (since - 30) / DROP_FRAMES);
};

/** How far down through the vault he's come (0 just in view .. 1 on them), or -1 when he's not falling. */
export const dropAmount = (dc: DoorCrash) => (dc.phase !== 'scene' || dc.step !== 2 || dc.t - dc.whistleAt < 30 ? -1 : Math.min(1, (dc.t - dc.whistleAt - 30) / DROP_FRAMES));
/** Where he is on his way down: from off the top of the view, burrowing down through the bedrock, then the vault, onto them. */
export const hipsterY = (dc: DoorCrash) => Y - 640 + Math.max(0, dropAmount(dc)) * 640;

/** He's come down (the tour's gone, the wreck's burning). */
export const crashed = (dc: DoorCrash) => dc.phase === 'done' || (dc.phase === 'scene' && dc.step >= 3);
/** The vault behind's come in. */
export const cavedIn = (dc: DoorCrash) => dc.phase === 'done' || (dc.phase === 'scene' && dc.step >= 3 && dc.caveAt > 0);
/** They've heard him coming (looking up). */
export const lookingUp = (dc: DoorCrash) => dc.phase === 'scene' && dc.step >= 2;
