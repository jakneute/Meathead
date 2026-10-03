// The landing. Meathead comes down out of the sky in the middle of nowhere, right
// on top of Dale and his crew loading his truck at a turnout. Dale takes one look:
// "OH NO! THE FEDS!", drops what he's carrying, runs for the cab and floors it
// off across the desert. His goons stay put (they weren't told).

import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { playSound } from '../../platform/audio';
import { isSpeaking } from '../../platform/speech';
import { shakeScreen } from '../../core/state';
import { COURSE, CP } from './course';
import { Talk, queueLines } from './script';

export interface Intro {
  phase: 'loading' | 'spotted' | 'running' | 'driving' | 'gone';
  t: number;
  /** Where Dale is (his feet, middle), and the truck (its back end), and how fast it's going. */
  daleX: number;
  truckX: number;
  speed: number;
  /** The crate he was carrying, dropped. */
  crate: { x: number; y: number; vy: number; broke: boolean } | null;
  /** When he spotted him, and when the truck started up. */
  spotT: number;
  goT: number;
  /** Whether this scene has him in a cutscene (it set inCutscene, and takes it off). */
  held?: boolean;
}

export const createIntro = (startedAt: number): Intro => ({
  phase: startedAt === CP.LANDING ? 'loading' : 'gone', t: 0,
  daleX: COURSE.landing.daleX, truckX: COURSE.landing.truckX, speed: 0, crate: null, spotT: 0, goT: 0,
});

/** When he spots him, when he's in the cab, when the truck goes. */
const SPOT_AT = 10, CAB_AT = 95, GO_AT = 110, GONE_AFTER = 260;

export const updateIntro = (ctx: FrameContext, it: Intro, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  if (it.phase === 'gone') return controls;
  it.t++;
  const cabX = it.truckX + 290;
  // Nobody's starting anything till the truck's going
  if (it.phase !== 'driving') state.gapGrace = Math.max(state.gapGrace || 0, 2);
  // (he lets Meathead finish his line from the landing first)
  if (it.phase === 'loading' && it.t >= SPOT_AT && (!isSpeaking() || it.t > 150)) {
    it.phase = 'spotted'; it.spotT = it.t;
    queueLines(state, talk, [{ who: 'dale', text: 'OH NO! THE FEDS!' }, { who: 'dale', text: "DROP EVERYTHING! I'M OUTTA HERE!" }]);
    it.crate = { x: it.daleX + 8, y: 550 - 60, vy: -3, broke: false };
  }
  if (it.phase === 'spotted' && it.t >= it.spotT + 30) it.phase = 'running';
  if (it.phase === 'running') {
    // Legging it for the cab
    it.daleX = Math.min(cabX, it.daleX + 6);
    if (it.t >= it.spotT + CAB_AT - SPOT_AT) { it.phase = 'driving'; it.goT = it.t; playSound('truckhorn'); shakeScreen(state, 6, 3); }
  }
  if (it.phase === 'driving') {
    if (it.t >= it.goT + GO_AT - CAB_AT) { it.speed = Math.min(18, it.speed + 0.35); it.truckX += it.speed; }
    if (it.t === it.goT + GO_AT - CAB_AT + 20) queueLines(state, talk, [{ who: 'meathead', text: "FEDS? I WISH, DALE. I'M WAY WORSE." }]);
    // Dust kicked up behind it
    if (it.speed > 1 && state.frame % 2 === 0) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: it.truckX + Math.random() * 20, y: 540 }, vel: { x: -1 - Math.random() * 3, y: -Math.random() * 2 }, life: 40, color: Math.random() < 0.5 ? '#D6A77A' : '#B5703D', size: 6 + Math.random() * 8 });
    if (it.t > it.goT + GO_AT - CAB_AT + GONE_AFTER) it.phase = 'gone';
  }
  // The crate he dropped
  const cr = it.crate;
  if (cr && !cr.broke) {
    cr.vy += 0.6; cr.y += cr.vy;
    if (cr.y >= 550 - 26) { cr.y = 550 - 26; cr.broke = true; ctx.fx.spawnPowderExplosion({ x: cr.x + 13, y: cr.y + 13 }, 20); }
  }
  // Hands off the controls till he's in the cab (a cutscene till then: the HUD's put away)
  const p = state.player;
  if (it.phase !== 'driving') { p.inCutscene = true; it.held = true; }
  else if (it.held) { p.inCutscene = false; it.held = false; }
  return it.phase === 'driving' ? controls : { ...NO_CONTROLS };
};

/** Dale in view (not in the cab yet). */
export const daleVisible = (it: Intro) => it.phase === 'loading' || it.phase === 'spotted' || it.phase === 'running';

