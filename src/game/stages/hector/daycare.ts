// The Eye's dead and the storm with it: sunshine. Cut to a daycare in Miami, the
// kids out playing... and then everything the hurricane had sucked up comes
// down on it at once. The flood flattens the place; Meathead drops out of the
// sky with it and lands in the wreckage without a scratch. The kids are fine
// (soaked, and they want to go again); the two grown-ups on duty, who knew what
// was coming and tried to run, are not. The boss door's just up ahead.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { say, isTalking, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { DAYCARE_LINES } from '../../../content/dialogue';
import { floorTopAt } from '../../core/terrain';
import { BOSS_DOOR_X } from '../../../constants';
import { COURSE, CP } from './course';
import { isShat } from '../../player/gut';

export interface Daycare {
  phase: 'waiting' | 'cutscene' | 'done';
  t: number;
  /** Has the flood hit it yet (and when). */
  hitAt: number;
  /** When he hit the ground. */
  landedAt: number;
  /** What each of them is saying right now (by who: kid0..kid4, teacher0, teacher1), for their bubbles. */
  saying: Record<string, string>;
  /** The kids' chatter up on the wreck: when the next line's due, and the last one said. */
  chatterAt: number;
  lastChatter: string;
}

/** Their voices. */
const voiceOf = (who: string): Voice => ({ id: `hector.${who}`, pitch: who.startsWith('kid') ? 1.8 : 1.1, rate: 1.1 });
/** A line from one of them, in turn after whoever's talking (`casual`: only if nobody is), up over their head while it's said. */
const daycareSays = (dc: Daycare, who: string, text: string, casual = false) =>
  say(text, voiceOf(who), casual ? 'casual' : 'queue', {
    onShow: () => { dc.saying[who] = text; },
    onHide: () => { if (dc.saying[who] === text) delete dc.saying[who]; },
  });
/** How often a kid on the wreck pipes up (frames, give or take), and how close he has to be to hear it. */
const CHATTER_EVERY = 420, CHATTER_NEAR = 900;

const D = () => COURSE.daycare;
/** Timeline (frames): the flood starts coming down, it hits, Meathead drops in, his line, done. */
const FALL_AT = 100, HIT_AT = 140, DROP_AT = 190, LINE_AT = 250, DONE_AT = 330;
/** When the kids look up and see it coming (the drawing's clock too). */
const LOOK_UP = 100;

export const createDaycare = (state: GameState, startedAt: number): Daycare => {
  const done = startedAt >= CP.DOOR;
  // A wall behind the daycare (the ocean's on the other side of it)
  state.blocks.push({ x: D().x1 - 60, y: -3000, w: 60, h: 4000, type: 'wall', hidden: true, tag: 'daycare-wall' });
  // A big health and ammo refill before the boss door
  (['large_health', 'large_ammo'] as const).forEach((type, i) => state.pickups.push({
    id: `hector-door-refill-${i}`, pos: { x: BOSS_DOOR_X - 300 + i * 80 - 10, y: D().y - 50 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9,
  }));
  return { phase: done ? 'done' : 'waiting', t: 0, hitAt: done ? -9999 : 0, landedAt: 0, saying: {}, chatterAt: 0, lastChatter: '' };
};

export const inDaycare = (x: number) => x >= D().x1 - 100;

/** Start the scene (the Eye's just died). */
export const startDaycare = (state: GameState, dc: Daycare, afterNews = false) => {
  // (after the news, which showed it coming from afar, cut in close just before it lands)
  dc.phase = 'cutscene'; dc.t = afterNews ? FALL_AT - 50 : 0;
  const p = state.player;
  p.hidden = true;
  p.inCutscene = true;
  p.pos = { x: D().building + 300, y: -1400 };
  p.vel = { x: 0, y: 0 };
  state.cameraOverride = { x: D().building - 330, y: D().y - 550 };
  state.camera.x = state.cameraOverride.x; state.camera.y = state.cameraOverride.y;
  state.cameraMinX = D().x1;
};

const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'urgent', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 150; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 120; }
};

export const updateDaycare = (ctx: FrameContext, dc: Daycare, controls: Controls): Controls => {
  const { state } = ctx;
  const { player } = state;
  if (dc.phase === 'done') { chatter(state, dc); return controls; }
  if (dc.phase !== 'cutscene') return controls;
  dc.t++;
  const t = dc.t;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  if (t === FALL_AT) { playSound('slam'); shakeScreen(state, 60, 5); }
  // The kids cheering it in, the grown-ups losing it; whooping as they ride it in
  for (const l of isShat(state) ? DAYCARE_LINES.cheerShat : DAYCARE_LINES.cheer) if (t === LOOK_UP + l.at) daycareSays(dc, l.who, l.text);
  if (t === HIT_AT + 12) daycareSays(dc, DAYCARE_LINES.ride.who, DAYCARE_LINES.ride.text);
  if (t === HIT_AT) {
    dc.hitAt = state.frame;
    shakeScreen(state, 70, 14);
    playSound('tsunami');
    // Everything the storm took, coming down (and the grown-ups going under it)
    const bx = D().building;
    for (const dx of [-150, 150]) for (let i = 0; i < 26; i++) state.particles.push({
      pos: { x: bx + dx + (Math.random() - 0.5) * 20, y: D().y - 30 - Math.random() * 30 },
      vel: { x: (Math.random() - 0.5) * 14 + Math.sign(dx) * 4, y: -3 - Math.random() * 9 }, life: 50 + Math.random() * 40,
      color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 3 + Math.random() * 6,
    });
    for (let i = 0; i < 80; i++) {
      state.particles.push({
        pos: { x: bx + (Math.random() - 0.5) * 260, y: D().y - 40 - Math.random() * 120 },
        vel: { x: (Math.random() - 0.5) * 22, y: -4 - Math.random() * 12 }, life: 60 + Math.random() * 50,
        color: ['#38BDF8', '#E0F2FE', '#FDE68A', '#F472B6', '#A16207', '#F8FAFC'][i % 6], size: 5 + Math.random() * 10,
      });
    }
  }
  if (t === DROP_AT) {
    // And Meathead with it
    player.hidden = false;
    player.pos = { x: D().building + 300, y: state.camera.y - 120 };
    player.vel = { x: 0, y: 14 };
  }
  if (t < DROP_AT) {
    // (held up out of sight until he drops in)
    player.pos = { x: D().building + 300, y: state.camera.y - 1400 };
    player.vel = { x: 0, y: 0 };
  } else if (!dc.landedAt && player.isGrounded) {
    // Down in the wreckage, not a scratch on him
    dc.landedAt = t;
    player.squash = 1;
    shakeScreen(state, 18, 8);
    const ground = floorTopAt(state.blocks, player.pos.x + player.width / 2, state.camera.y, 0) ?? D().y;
    for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: player.pos.x + 22, y: ground - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 7 }, life: 30, color: i % 2 ? '#7DD3FC' : '#E0F2FE', size: 4 + Math.random() * 6 });
  }
  if (t === LINE_AT) meatheadSays(state, "DAYCARE'S CLOSED.");
  if (t === LINE_AT + 40) daycareSays(dc, DAYCARE_LINES.again.who, DAYCARE_LINES.again.text);
  if (t >= DONE_AT) {
    dc.phase = 'done';
    player.inCutscene = false;
    player.isDucking = false;
    state.cameraOverride = null;
    state.checkpoint = Math.max(state.checkpoint, CP.DOOR);
    player.facing = 1;
  }
  // (a crouched superhero landing for a moment)
  return { ...NO_CONTROLS, down: !!dc.landedAt && t < dc.landedAt + 30 };
};

/** Up on the wreck, every so often (while he's about), one of the kids pipes up. */
const chatter = (state: GameState, dc: Daycare) => {
  const p = state.player;
  if (Math.abs(p.pos.x - D().building) > CHATTER_NEAR) return;
  if (!dc.chatterAt) dc.chatterAt = state.frame + 120;
  if (state.frame < dc.chatterAt || isTalking()) return;
  dc.chatterAt = state.frame + CHATTER_EVERY + Math.floor(Math.random() * 240);
  const pool = ((isShat(state) ? DAYCARE_LINES.chatterShat : DAYCARE_LINES.chatter) as readonly string[]).filter(l => l !== dc.lastChatter);
  const text = pool[Math.floor(Math.random() * pool.length)];
  dc.lastChatter = text;
  daycareSays(dc, `kid${Math.floor(Math.random() * 5)}`, text, true);
};
