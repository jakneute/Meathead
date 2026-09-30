// Off the tram and a little way into the woods: the mountain rumbles. The ground
// shakes, a low boom rolls down from somewhere up top, snow sifts down out of
// the sky and slides off the pines. Meathead stops and looks up. "...WHAT WAS
// THAT?" A beat. "EH. PROBABLY NOTHING." (It's the avalanche, and it isn't
// nothing: he'll set it off himself at the summit.) Once, the first time through
// (not again after a death in the woods).

import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { holdForSpeech, say, MEATHEAD_VOICE } from '../../platform/speech';
import type { GameState } from '../../core/state';
import { COURSE, CP } from './course';
import type { Tram } from './tram';

/** A line of his, in his own bubble (the scene waits for it to be said). */
const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};

export interface Tease { phase: 'waiting' | 'rumble' | 'done'; t: number; quiet: { n: number } }

export const createTease = (startedAt: number): Tease => ({ phase: startedAt < CP.TOP ? 'waiting' : 'done', t: 0, quiet: { n: 0 } });

/** The beats: the boom, his first line, the second (each waits for the one before to be said), the end. */
const BOOM = 10, LINE1 = 80, LINE2 = 130, END = 180;
const HOLDS = new Set([LINE2, END]);

export const updateTease = (ctx: FrameContext, tz: Tease, tram: Tram, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  if (tz.phase === 'done') return controls;
  if (tz.phase === 'waiting') {
    if (tram.phase === 'done' && p.isGrounded && p.pos.x > COURSE.woods.x1 + 140) { tz.phase = 'rumble'; tz.t = 0; p.vel.x = 0; }
    return controls;
  }
  if (holdForSpeech(tz.t, HOLDS, tz.quiet)) tz.t++;
  const t = tz.t;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  // The rumble: building, then dying away
  const k = t < 60 ? t / 60 : Math.max(0, 1 - (t - 60) / 70);
  if (t % 24 === 1 && t < 130) playSound('rumble', 0.4 + k * 0.5, -6);
  if (t === BOOM) playSound('thunder', 0.5, -10);
  if (k > 0.05 && t % 3 === 0) shakeScreen(state, 4, 1 + k * 5);
  // Snow sifting down out of the sky over the whole screen; clumps sliding off the pines
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
  if (k > 0.1) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: v.x + Math.random() * v.w, y: v.y - 10 }, vel: { x: (Math.random() - 0.5) * 0.6, y: 1.2 + Math.random() * 1.8 }, life: 160, color: '#F8FAFC', size: 2 + Math.random() * 2 });
  if (t > 20 && t < 100 && t % 9 === 0) {
    const on = COURSE.woods.pines.filter(pn => pn.x > v.x && pn.x < v.x + v.w);
    const pn = on[Math.floor(Math.random() * on.length)];
    if (pn) for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: pn.x + (Math.random() - 0.5) * 40, y: pn.y - pn.h * (0.3 + Math.random() * 0.5) }, vel: { x: (Math.random() - 0.5) * 1.5, y: 1 + Math.random() * 2 }, life: 60, color: '#EEF4FB', size: 4 + Math.random() * 5 });
  }
  if (t === LINE1) meatheadSays(state, '...WHAT WAS THAT?');
  if (t === LINE2) meatheadSays(state, 'EH. PROBABLY NOTHING.');
  if (t >= END) { tz.phase = 'done'; p.inCutscene = false; return controls; }
  return { ...NO_CONTROLS };
};
