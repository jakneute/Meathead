// The Eye's dead and the storm with it: sunshine. Cut to a daycare in Miami, the
// kids out playing... and then everything the hurricane had sucked up comes
// down on it at once. The flood flattens the place; Meathead drops out of the
// sky with it and lands in the wreckage without a scratch. The kids are fine
// (soaked, and they want to go again). The boss door's just up ahead.

import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { playSound } from '../../audio';
import { say, MEATHEAD_VOICE } from '../../speech';
import { floorTopAt } from '../../terrain';
import { BOSS_DOOR_X } from '../../../constants';
import { COURSE, CP } from './course';

export interface Daycare {
  phase: 'waiting' | 'cutscene' | 'done';
  t: number;
  /** Has the flood hit it yet (and when). */
  hitAt: number;
  /** The kids' line after. */
  kidLine: string;
  kidLineT: number;
  /** When he hit the ground. */
  landedAt: number;
}

const D = () => COURSE.daycare;
/** Timeline (frames): the flood starts coming down, it hits, Meathead drops in, his line, done. */
const FALL_AT = 100, HIT_AT = 140, DROP_AT = 190, LINE_AT = 250, DONE_AT = 330;

export const createDaycare = (state: GameState, startedAt: number): Daycare => {
  const done = startedAt >= CP.DOOR;
  // A wall behind the daycare (the ocean's on the other side of it)
  state.blocks.push({ x: D().x1 - 60, y: -3000, w: 60, h: 4000, type: 'wall', hidden: true, tag: 'daycare-wall' });
  // A big health and ammo refill before the boss door
  (['large_health', 'large_ammo'] as const).forEach((type, i) => state.pickups.push({
    id: `hector-door-refill-${i}`, pos: { x: BOSS_DOOR_X - 300 + i * 80 - 10, y: D().y - 50 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9,
  }));
  return { phase: done ? 'done' : 'waiting', t: 0, hitAt: done ? -9999 : 0, kidLine: '', kidLineT: 0, landedAt: 0 };
};

export const inDaycare = (x: number) => x >= D().x1 - 100;

/** Start the scene (the Eye's just died). */
export const startDaycare = (state: GameState, dc: Daycare, afterNews = false) => {
  // (after the news, which showed it all coming down, cut straight to it landing)
  dc.phase = 'cutscene'; dc.t = afterNews ? FALL_AT - 1 : 0;
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
  if (dc.kidLineT > 0) dc.kidLineT--;
  if (dc.phase !== 'cutscene') return controls;
  dc.t++;
  const t = dc.t;
  player.invincibilityTimer = Math.max(player.invincibilityTimer, 2);
  if (t === FALL_AT) { playSound('nuke'); shakeScreen(state, 60, 5); }
  if (t === HIT_AT) {
    dc.hitAt = state.frame;
    shakeScreen(state, 70, 14);
    playSound('tsunami');
    // Everything the storm took, coming down
    const bx = D().building;
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
  if (t === LINE_AT + 40) { dc.kidLine = 'AGAIN! AGAIN!'; dc.kidLineT = 150; }
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
