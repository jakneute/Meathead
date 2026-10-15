// What a section of Adventure Land is, and the bits every section uses (laying ground down, moving him on to the next
// section, cutscene control, saying things). Each section's in its own folder (jungle/, river/, dino/...), exporting a
// Section; index.ts runs whichever one he's in.

import type { GameState } from '../../m1/game/core/state';
import type { FrameContext } from '../../m1/game/core/context';
import type { Controls } from '../../m1/game/platform/input';
import type { WaterBody } from '../../m1/game/stages/index';
import type { SceneLight, Light } from '../../m1/game/render/lighting';
import type { Block } from '../../m1/types';
import { groundBlocks, type GroundRun } from '../../m1/game/core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../m1/constants';
import { say, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import type { SectionId } from './geometry';

type Ctx = CanvasRenderingContext2D;

/** Adventure Land's own state (state.stage): which section he's in, and each section's own state by its id. (Other
 *  lands built the same way, Spooky Land, use it with their own section ids.) */
export interface Adv<Id extends string = SectionId> {
  section: Id;
  /** Each section's own (it puts whatever it likes in here, under its id). */
  s: Partial<Record<Id, unknown>>;
}
export const getAdv = (state: GameState) => state.stage as Adv | null;
/** A section's own state, made the first time it's asked for. */
export const sectionState = <T, Id extends string = SectionId>(state: GameState, id: Id, make: () => T): T => {
  const adv = state.stage as Adv<Id>;
  return (adv.s[id] ??= make()) as T;
};

export interface Section<Id extends string = SectionId> {
  id: Id;
  x0: number; x1: number;
  /** Its checkpoints (numbered across the whole stage, in order): where he starts again from each. */
  checkpoints: {
    name: string; cp: number; x: number; y: number;
    /** A boss's (or a sub-boss's) checkpoint: starting again from it, nobody's about this far left and right of it. */
    clear?: [number, number];
  }[];
  /** Puts its ground, its walls, its enemies and its set pieces into the world (all at once, at the start). */
  build: (state: GameState) => void;
  /** Each frame he's in it: its set pieces, its enemies' business, its cutscenes (it can take the controls). */
  update?: (ctx: FrameContext, controls: Controls) => Controls;
  /** The water in it, if any (he swims in it). */
  waterBodyAt?: (state: GameState, x: number, y: number) => WaterBody | null;
  /** Screen space: its sky, its far-off scenery. Return false for nothing. */
  drawBackdrop?: (c: Ctx, state: GameState) => boolean;
  /** World space, behind everything that moves. */
  drawBack?: (c: Ctx, state: GameState) => void;
  /** World space, in front of everything. */
  drawFront?: (c: Ctx, state: GameState) => void;
  /** Screen space, over the world (a meter, a cutscene's picture-in-picture). */
  drawHud?: (c: Ctx, state: GameState) => void;
  /** The camera pushed in (or pulled out: scale under 1) about a world point (and that point moved on screen by the shift). */
  zoom?: (state: GameState) => { scale: number; x: number; y: number; shiftX?: number; shiftY?: number } | null;
  /** Slow motion: true for a tick that runs no game time (Meathead 1's kill cam). Called every real tick. */
  holdTick?: (ctx: FrameContext) => boolean;
  lighting?: (state: GameState) => SceneLight | null;
  /** How open to the sky it is here (1 open air; less under a canopy or the water; left out: indoors), for the time of
   *  day's light over it (timeOfDay.ts). Only when it has no lighting of its own. */
  outdoors?: (state: GameState) => number;
  /** Its lamps (torches, signs, lit windows), glowing as the day goes: world space. */
  lamps?: (state: GameState) => Light[];
  /** Where on screen his feet sit (default 550 of 600). */
  cameraRow?: (state: GameState) => number | undefined;
  /** The world wrapped round a turning cylinder of this radius (Meathead 1's storm-climb trick), or null: flat. */
  cylinder?: (state: GameState) => { radius: number } | null;
  /** The camera's limits in it (default its x0..x1). */
  cameraX?: (state: GameState) => { min: number; max: number } | undefined;
  /** The world's view swaying (drawn turned by `angle` about the world point (x, y)): see StageLayout's worldTilt. */
  worldTilt?: (state: GameState) => { x: number; y: number; angle: number } | null;
}

// ---------------------------------------------------------------------------------------------------------------
// Ground

/** Lays ground down: runs of floor (flat, or sloping from y1 to y2), as the engine's ground and its blocks. */
export const lay = (state: GameState, runs: GroundRun[]) => {
  state.groundRuns.push(...runs);
  state.blocks.push(...groundBlocks(runs));
};
/** A solid block (a wall, a ledge, a box). */
export const solid = (state: GameState, x: number, y: number, w: number, h: number, extra: Partial<Block> = {}) => {
  const b: Block = { x, y, w, h, type: 'wall', ...extra } as Block;
  state.blocks.push(b);
  return b;
};
/** A platform you can jump up through and stand on. */
export const ledge = (state: GameState, x: number, y: number, w: number, extra: Partial<Block> = {}) => {
  const b: Block = { x, y, w, h: 16, type: 'platform', oneWay: true, ...extra } as Block;
  state.blocks.push(b);
  return b;
};

// ---------------------------------------------------------------------------------------------------------------
// Moving him on, and cutscenes

/** On to somewhere else in the world, now (the camera with him: no swinging across). */
export const teleport = (state: GameState, x: number, feetY: number) => {
  const p = state.player;
  p.pos.x = x - p.width / 2; p.pos.y = feetY - p.height;
  p.vel.x = 0; p.vel.y = 0;
  state.camera.x = x - CANVAS_WIDTH / 2;
};

/** Nobody touches anything (a cutscene). */
export const hands = (): Controls => ({}) as Controls;

/** He says something (in his voice): up over him while it's said. */
export const meatheadSays = (state: GameState, text: string, after = true, onDone?: () => void) => {
  const shown = say(text, MEATHEAD_VOICE, after ? 'queue' : 'casual', {
    always: true,
    onShow: spoken => {
      state.playerLastVulgarity = text; state.playerVulgarityTimer = 9999;
      // (not recorded: the engine never takes it down, so it's up its usual while, then done)
      if (!spoken) setTimeout(() => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; onDone?.(); }, Math.max(1800, text.length * 70));
    },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; onDone?.(); },
    // (waiting its turn, it never got one: on with the scene anyway)
    onDropped: () => onDone?.(),
  });
  // (not taken: somebody's talking (a bark), or too many waiting their turn. Its words never go up without its voice,
  // over somebody else's: on with the scene, that's all)
  if (!shown) setTimeout(() => onDone?.(), 0);
};

/**
 * Somebody else says something, in their voice: `set` gets what's shown (null when it's done), for drawing it over
 * their head. Unrecorded lines still show a while, so nothing hangs waiting on them. One not taken (a bark with
 * somebody talking) isn't shown at all: nobody's words up over anybody else's.
 */
export interface Said { text: string }
export const voice = (id: string) => ({ id, pitch: 0, rate: 1 });
export const speak = (voiceId: string, text: string, set: (s: Said | null) => void, after = true, onDone?: () => void) => {
  const s = { text };
  const shown = say(text, voice(voiceId), after ? 'queue' : 'casual', {
    always: true,
    // (not recorded: the engine never takes it down, so it's up its usual while, then done)
    onShow: spoken => { set(s); if (!spoken) setTimeout(() => { set(null); onDone?.(); }, Math.max(1800, text.length * 70)); },
    onHide: () => { set(null); onDone?.(); },
    onDropped: () => { set(null); onDone?.(); },
  });
  // (not taken: somebody's talking (a bark), or too many waiting their turn. Never its words up without its voice, over
  // somebody else's: on with the scene)
  if (!shown) setTimeout(() => onDone?.(), 0);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, crude (the first pass: Atari-2600 boxes and words, to get the feel before the real look goes on)

export const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export const label = (c: Ctx, s: string, x: number, y: number, col = '#FFFFFF', size = 8) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  c.fillStyle = '#000'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
/** Words over somebody's head, wrapped (only while they're said). */
export const saidOver = (c: Ctx, s: string, x: number, y: number, col = '#FFFFFF', wide = 240) => {
  c.font = '7px "Press Start 2P"';
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > wide && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  // (kept whole on screen: slid in off the edges, down off the top and out from under the HUD; a speaker near an
  // edge, or a fixed camera framing them close to it, would cut the words off)
  // (the render scale off the canvas's height: a cylinder's strip is wider than the screen, never taller)
  const m = c.getTransform(), k = c.canvas.height / CANVAS_HEIGHT;
  // (a kill cam pushed in: the words kept their own size, not blown up with it)
  const z = m.a / k;
  if (m.a > 0 && m.d > 0 && z > 1.01) {
    const L = -m.e / m.a, R = (c.canvas.width - m.e) / m.a, T = -m.f / m.d;
    const half = (Math.max(...lines.map(l => c.measureText(l).width)) / 2 + 6) / z, up = ((lines.length - 1) * 11 + 9) / z;
    x = Math.min(Math.max(x, L + half), R - half); y = Math.max(y, T + 6 / z + up);
    c.save(); c.translate(x, y); c.scale(1 / z, 1 / z);
    lines.forEach((l, i) => label(c, l, 0, -(lines.length - 1 - i) * 11, col, 7));
    c.restore();
    return;
  }
  if (m.a > 0 && m.d > 0) {
    const half = Math.max(...lines.map(l => c.measureText(l).width)) / 2 + 6, top = y - (lines.length - 1) * 11 - 9;
    const L = -m.e / m.a, R = (c.canvas.width - m.e) / m.a, T = -m.f / m.d;
    x = Math.min(Math.max(x, L + half), R - half);
    let dy = Math.max(0, T + 6 - top);
    const hudR = (HUD_CLEAR_X * k - m.e) / m.a, hudB = (HUD_CLEAR_Y * k - m.f) / m.d;
    if (x - half < hudR && top + dy < hudB) dy = hudB + 4 - top;
    y += dy;
  }
  lines.forEach((l, i) => label(c, l, x, y - (lines.length - 1 - i) * 11, col, 7));
};
