// The way out. With the thing dead the whole sewer starts to go: rumbling,
// the roof coming down in chunks. There's a second hazmat suit on a rack by
// the door; he goes for it, gets it on, and the whole lot goes up under him
// and blows him out of the ground.
//
// Then: the water tower up over the East Side, its manhole cover ahead of him
// like a bullet. Straight through the tank; the town's water pours out of the
// hole; he comes down on top of it, and it starts to go over. A family on the
// couch in front of the TV, having a nice night. It gets darker in the room.
// The tower comes down through the roof and the water comes with it, and it
// eats everyone in the room but him (it gets his suit).
//
// And then he's stood in what's left of the house. Past it the ground's
// fallen into the sewer, a long, long way down, and Tommy's door's at the
// bottom.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { GROUND_Y, BOSS_DOOR_X, DOOR_WIDTH, CANVAS_WIDTH } from '../../../constants';
import { COURSE, CP, RUINS_Y } from './course';
import { Talk, queueLines, quiet, hush } from './script';
import { arrive } from './runtime';

export type EscapePhase = 'waiting' | 'rumble' | 'run' | 'suit' | 'blast' | 'tower' | 'family' | 'crush' | 'melt' | 'ruins' | 'drop' | 'done';
export interface Escape {
  phase: EscapePhase;
  t: number;
  /** Chunks of the roof coming down in the cistern. */
  chunks: { x: number; y: number; vy: number; r: number }[];
  /** The drop: frames into the fall (and the fade), and when he landed. */
  dropT: number;
  landedT: number;
  /** How far in the camera's pushed in, in the little cavern outside Tommy's door (0 not at all .. 1 all the way). */
  zoomK: number;
}

/** How long each of the cut scenes runs. */
export const TOWER_FRAMES = 330, FAMILY_FRAMES = 250, CRUSH_FRAMES = 300, MELT_FRAMES = 110;
/** The fall: how long to black, and how long it takes to come back up once he's landed. */
export const DROP_FADE = 45, DROP_FADE_IN = 40;

export const createEscape = (state: GameState, startedAt: number): Escape => {
  void state;
  return { phase: startedAt >= CP.RUINS ? 'ruins' : 'waiting', t: 0, chunks: [], dropT: 0, landedT: 0, zoomK: 0 };
};

/** The thing's dead: the sewer starts to come apart. */
export const startEscape = (es: Escape) => { if (es.phase === 'waiting') { es.phase = 'rumble'; es.t = 0; } };

export const updateEscape = (ctx: FrameContext, es: Escape, talk: Talk, controls: Controls): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  es.t++;
  const C = COURSE.sewer.cistern;
  // Down outside the door it's a tight little space: the camera pushed in on it, easing back out as the door opens
  const cramped = p.pos.x > COURSE.ruins.pit - 300 && p.pos.y > GROUND_Y - 400 && state.doorState === 'closed' && es.phase !== 'drop';
  es.zoomK += ((cramped ? 1 : 0) - es.zoomK) * (cramped ? 0.06 : 0.08);
  if (es.zoomK < 0.005 || (state.doorState !== 'closed' && state.doorState !== 'opening')) es.zoomK = 0;
  switch (es.phase) {
    case 'waiting': case 'done': return controls;
    case 'rumble':
      // The room coming apart: he gets a moment to take it in
      rumble(state, es);
      if (es.t === 20) queueLines(state, talk, [{ who: 'meathead', text: "THAT'S NOT GOOD. THAT'S A LOT OF RUMBLING." }]);
      if (es.t > 90) { es.phase = 'run'; es.t = 0; }
      return controls;
    case 'run': {
      // Straight for the suit on the rack
      rumble(state, es);
      p.inCutscene = true;
      p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
      const px = p.pos.x + p.width / 2;
      if (Math.abs(px - C.rack) > 8) return { ...NO_CONTROLS, left: px > C.rack, right: px < C.rack, jump: !!p.swimming && state.frame % 12 < 6 };
      if (p.isGrounded) { es.phase = 'suit'; es.t = 0; playSound('tinkle'); fx.spawnDamageNumber({ x: p.pos.x - 60, y: p.pos.y - 70 }, 'SUITED UP!', true, '#FACC15'); }
      return { ...NO_CONTROLS };
    }
    case 'suit':
      rumble(state, es);
      p.inCutscene = true;
      if (es.t === 40) queueLines(state, talk, [{ who: 'meathead', text: 'OKAY. SUIT. NOW WHAT?' }]);
      if (es.t > 100) {
        // Now what: the lot goes up
        es.phase = 'blast'; es.t = 0;
        playSound('nuke'); playSound('tsunami');
        shakeScreen(state, 80, 20);
      }
      return { ...NO_CONTROLS };
    case 'blast':
      // A column of it, and him on top of it, straight up and out of sight
      p.inCutscene = true;
      if (es.t === 1) { p.vel = { x: 0, y: -24 }; p.isGrounded = false; }
      p.vel.y = Math.min(p.vel.y, -18);
      if (es.t % 2 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + p.height }, vel: { x: (Math.random() - 0.5) * 4, y: 6 + Math.random() * 6 }, life: 30, color: i % 2 ? '#65A30D' : '#A3E635', size: 6 + Math.random() * 8 });
      state.cameraOverride = { x: state.camera.x, y: state.camera.y };
      if (es.t > 70) { es.phase = 'tower'; es.t = 0; hush(state, talk); p.hidden = true; }
      return { ...NO_CONTROLS };
    case 'tower':
      p.inCutscene = true; p.hidden = true; p.vel = { x: 0, y: 0 };
      if (es.t === 100) { playSound('ice'); playSound('tsunami'); }
      if (es.t === 150) { playSound('nuke'); }
      if (es.t === 220) queueLines(state, talk, [{ who: 'meathead', text: 'UH OH.' }]);
      if (es.t > TOWER_FRAMES) { es.phase = 'family'; es.t = 0; }
      return { ...NO_CONTROLS };
    case 'family':
      p.inCutscene = true; p.hidden = true;
      if (es.t === 15) queueLines(state, talk, [
        { who: 'dad', text: 'HA! PASS THE CHIPS.' },
        { who: 'kid', text: "WHY'S IT GETTING DARK?" },
      ]);
      if ((es.t > FAMILY_FRAMES - 40 && quiet(talk)) || es.t > FAMILY_FRAMES + 200) { es.phase = 'crush'; es.t = 0; playSound('nuke'); shakeScreen(state, 60, 18); }
      return { ...NO_CONTROLS };
    case 'crush':
      p.inCutscene = true; p.hidden = true;
      if (es.t === 20) { playSound('tsunami'); playSound('screams'); }
      if (es.t > CRUSH_FRAMES) {
        // In what's left of the living room, the suit coming off him in strips
        es.phase = 'melt'; es.t = 0;
        hush(state, talk);
        state.checkpoint = Math.max(state.checkpoint, CP.RUINS);
        arrive(state, COURSE.ruins.house + 130, RUINS_Y);
        p.inCutscene = true;
      }
      return { ...NO_CONTROLS };
    case 'melt':
      p.inCutscene = true;
      if (es.t === 20) playSound('barf');
      if (es.t === MELT_FRAMES - 30) queueLines(state, talk, [{ who: 'meathead', text: 'EXCUSE ME. SORRY. WRONG HOUSE.' }]);
      if (es.t > MELT_FRAMES) { es.phase = 'ruins'; es.t = 0; p.inCutscene = false; }
      return { ...NO_CONTROLS };
    case 'ruins':
      // (up top the camera stops where the ground does: nothing past the end of it on show)
      state.cameraMaxX = p.pos.y < GROUND_Y - 1000 ? COURSE.ruins.x2 - CANVAS_WIDTH : undefined;
      // Walking on over the rubble, to the edge of the pit and over it
      // (only from up there: not a respawn down at the door dropping in from above it)
      if (p.pos.x + p.width / 2 > COURSE.ruins.pit && p.pos.y > RUINS_Y - 20 && p.pos.y < RUINS_Y + 200 && !p.isGrounded) { es.phase = 'drop'; es.t = 0; es.dropT = 0; es.landedT = 0; hush(state, talk); queueLines(state, talk, [{ who: 'meathead', text: 'AAAAAAAAAAAAAAAAAAAAAAAA' }]); }
      return controls;
    case 'drop': {
      // A long way down: black before the bottom, and back as he hits it
      es.dropT++;
      p.inCutscene = true;
      p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
      // (the camera goes down with him, till he's down: then it's let go of)
      if (!es.landedT) {
        state.cameraOverride = { x: Math.min(state.camera.x, BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH), y: p.pos.y - 300 };
        state.camera.y = Math.min(p.pos.y - 300, GROUND_Y - 550);
      }
      if (p.isGrounded && p.pos.y + p.height >= GROUND_Y - 2) {
        if (!es.landedT) {
          es.landedT = es.dropT;
          shakeScreen(state, 30, 12); playSound('nuke');
          p.squash = 1;
          for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: p.pos.x + 22, y: GROUND_Y - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 7 }, life: 30, color: i % 2 ? '#57534E' : '#A8A29E', size: 4 + Math.random() * 6 });
          state.cameraOverride = null; state.cameraMaxX = undefined;
          state.cameraRestY = GROUND_Y - 550; state.camera.y = GROUND_Y - 550;
          // (up against the closed door: the room past it stays out of sight till it opens)
          state.cameraMinX = Math.min(COURSE.ruins.pit - 100, BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH);
          state.camera.x = Math.max(state.cameraMinX, Math.min(BOSS_DOOR_X + DOOR_WIDTH - CANVAS_WIDTH, p.pos.x - 250));
        }
        if (es.dropT === es.landedT) hush(state, talk);
        if (es.dropT - es.landedT > DROP_FADE_IN + 20) { es.phase = 'done'; p.inCutscene = false; state.cameraOverride = null; queueLines(state, talk, [{ who: 'meathead', text: "...OW. OKAY. THAT'S TOMMY'S DOOR." }]); }
      }
      return { ...NO_CONTROLS };
    }
    default: return controls;
  }
};

const rumble = (state: GameState, es: Escape) => {
  const C = COURSE.sewer.cistern;
  if (state.frame % 30 === 0) { shakeScreen(state, 20, 5); playSound('thunder'); }
  if (state.frame % 18 === 0) es.chunks.push({ x: C.x1 + 60 + Math.random() * (C.x2 - C.x1 - 120), y: GROUND_Y - 520, vy: 2, r: 6 + Math.random() * 10 });
  es.chunks = es.chunks.filter(c => { c.vy += 0.5; c.y += c.vy; if (c.y > GROUND_Y - 6) { for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: c.x, y: GROUND_Y - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 }, life: 24, color: '#57534E', size: 3 + Math.random() * 3 }); return false; } return true; });
};

/** The cut scenes run over the whole screen (the stage draws them). */
export const inCutScene = (es: Escape) => es.phase === 'tower' || es.phase === 'family' || es.phase === 'crush';

/** Black over the fall: 0..1. */
export const dropFade = (es: Escape) => {
  if (es.phase !== 'drop') return 0;
  if (!es.landedT) return Math.min(1, es.dropT / DROP_FADE);
  return Math.max(0, 1 - (es.dropT - es.landedT) / DROP_FADE_IN);
};

export const escapeDeathMessage = (es: Escape): string | undefined => (es.phase === 'drop' ? 'A LONG WAY DOWN' : undefined);

/** The push in outside Tommy's door: about the door's edge and the floor (so they stay put on the screen, and it closes in on him). */
/** How far it's pushed in outside the door. */
export const DOOR_ZOOM = 1.4;
/** (it comes back out as the door opens, whatever else is running then: all the way out by the time it's open) */
export const doorZoom = (state: GameState, es: Escape) => {
  const k = state.doorState === 'closed' ? es.zoomK : state.doorState === 'opening' ? es.zoomK * Math.max(0, 1 - state.doorOpenAmount / 150) : 0;
  return k > 0 ? { scale: 1 + k * (DOOR_ZOOM - 1), x: state.camera.x + CANVAS_WIDTH, y: GROUND_Y } : null;
};
