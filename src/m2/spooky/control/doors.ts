// The GRAND BALLROOM's doors, at the end of the chase. Donnie's through them first: they slam, a deadbolt goes, a lock
// clicks, and his muffled voice comes through them (the doors rattling as he talks). Meathead walks up and kicks them
// in (Meathead 1's boot): a short cutscene, skippable, no HUD; the doors burst in, splinters and dust, his line. Then
// he's in the ballroom (the fight). The doors stay down after (a retry walks straight in; revisits find them lying
// there). A checkpoint's just outside them (index.ts), the big refill beside it.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { box, wallSign, hands, speak, meatheadSays, saidOver } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, KICK_POSE_FRAMES } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { drawBars } from './cine';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export interface Doors {
  /** Open (Donnie not through yet), locked (him behind them), kicking (the cutscene), down. */
  state: 'open' | 'locked' | 'kicking' | 'down';
  t: number; said: string | null; spoke: boolean; talkDone: boolean;
  /** Burst in (drawn down), the cutscene still finishing. */
  broken: boolean;
  block: Block | null; x: number;
}
/** Kicked in this time through (a retry from outside them finds them down). */
let kicked = false;
export const forgetDoors = () => { kicked = false; };
export const doorsKicked = () => kicked;

export const makeDoors = (x: number): Doors => ({ state: 'open', t: 0, said: null, spoke: false, talkDone: false, broken: false, block: null, x });

/** Shut across the way (till they're kicked in): a wall the width of the doorway. */
export const buildDoors = (state: GameState, d: Doors) => {
  d.block = { x: d.x - 70, y: GY - 180, w: 140, h: 180, type: 'wall', hidden: true, tag: 'ballroom-doors' } as Block;
  state.blocks.push(d.block);
};
/** Down already (a retry, a revisit). */
export const doorsDown = (state: GameState, d: Doors) => {
  d.state = 'down'; kicked = true;
  if (d.block) { state.blocks = state.blocks.filter(b => b !== d.block); d.block = null; }
};

/** Donnie's through them: the slam, the bolt, the lock, his voice through them. */
export const lockDoors = (d: Doors) => { if (d.state === 'open') { d.state = 'locked'; d.t = 0; } };

/** Each frame; the cutscene's controls while it's on (else null). */
export const tickDoors = (ctx: FrameContext, d: Doors): Controls | null => {
  const { state } = ctx, p = state.player;
  if (d.state === 'locked') {
    d.t++;
    if (d.t === 1) { playSound('slam', 1, -2); shakeScreen(state, 5, 3); }
    if (d.t === 18) playSound('clang', 0.7, 4);
    if (d.t === 30) playSound('click', 0.9, 6);
    if (d.t === 38) playSound('click', 0.7, 10);
    if (d.t === 50 && !d.spoke) {
      d.spoke = true;
      speak('m2.donnie', pick(L.DONNIE_LOCKED[dressed(state)]), s => { d.said = s?.text ?? null; }, true, () => { d.talkDone = true; });
    }
    if (d.t > 600) d.talkDone = true;
    // (up to them, him done talking: the boot)
    const px = p.pos.x + p.width / 2;
    if (d.talkDone && px > d.x - 70 - 140 && p.isGrounded && p.health > 0 && state.deathTimer <= 0) { d.state = 'kicking'; d.t = 0; }
    return null;
  }
  if (d.state === 'kicking') {
    d.t++;
    p.inCutscene = true; p.facing = 1; p.vel.x = 0;
    // (anybody about holds off: it's his moment)
    for (const e of state.enemies) if (Math.abs(e.pos.x - d.x) < 500) { e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); e.vel.x = 0; }
    if (d.t > SKIP_AFTER) offerSkip();
    if (d.t > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; burst(state, d, true); end(state, d); return hands(); }
    // (stepped up to them)
    const want = d.x - 70 - 30 - p.width / 2;
    if (d.t < 8) p.pos.x += (want - p.pos.x) * 0.3;
    if ((p.kickPose || 0) > 0) p.kickPose!--;
    if (d.t === 10) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
    if (d.t === 20) { burst(state, d, false); meatheadSays(state, pick(L.MEATHEAD_DOOR_KICK), true); }
    if (d.t >= 70) end(state, d);
    return hands();
  }
  return null;
};
const burst = (state: GameState, d: Doors, quiet: boolean) => {
  // (the way's open; the cutscene runs on till it's done: end() puts them down for good)
  kicked = true; d.broken = true;
  if (d.block) { state.blocks = state.blocks.filter(b => b !== d.block); d.block = null; }
  d.t = Math.max(d.t, 20);
  if (quiet) return;
  playSound('crash', 1, -4); playSound('crack', 1, -2); playSound('boom', 0.6, 2); shakeScreen(state, 14, 7);
  for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: d.x - 60 + Math.random() * 30, y: GY - 20 - Math.random() * 150 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: ['#581C87', '#6B21A8', '#A16207', '#FDE047'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 120, y: GY - 10 }, vel: { x: (Math.random() - 0.3) * 2, y: -0.5 - Math.random() }, life: 60, color: 'rgba(200, 190, 180, 0.5)', size: 8 + Math.random() * 8, grav: -0.01 });
};
const end = (state: GameState, d: Doors) => {
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  d.state = 'down'; d.said = null;
};

/** World space, behind: the doors (shut, rattling while he talks behind them; or kicked in, lying flat). */
export const drawDoors = (c: Ctx, d: Doors, f: number) => {
  const D = d.x;
  box(c, D - 71, GY - 181, 142, 182, '#1A0B06'); box(c, D - 70, GY - 180, 140, 180, '#A16207');
  if (d.state === 'down' || d.broken) {
    // (the doorway: dark, the ballroom's purple light and its glints through it; the doors flat on the floor inside)
    box(c, D - 62, GY - 172, 124, 172, '#2E1065');
    for (let i = 0; i < 6; i++) box(c, D - 50 + i * 20, GY - 150 + ((i * 37 + Math.floor(f / 6)) % 100), 3, 3, ['#F472B6', '#60A5FA', '#FDE047'][i % 3]);
    box(c, D - 60, GY - 10, 62, 10, '#1A0B06'); box(c, D - 59, GY - 9, 60, 8, '#6B21A8');
    box(c, D + 4, GY - 14, 60, 12, '#1A0B06'); box(c, D + 5, GY - 13, 58, 10, '#581C87'); box(c, D + 30, GY - 12, 6, 4, '#FDE047');
    // (a hinge hanging off the frame, splinters)
    box(c, D - 66, GY - 150, 6, 10, '#71717A'); box(c, D - 66, GY - 60, 6, 10, '#71717A');
    for (let i = 0; i < 5; i++) box(c, D - 64 + i * 3, GY - 120 + i * 9, 6, 2, '#A16207');
  } else {
    const shake = d.state === 'locked' && d.said ? (Math.floor(f / 3) % 2 ? 2 : -1) : 0;
    for (const dx of [-62, 2]) {
      box(c, D + dx + shake, GY - 172, 60, 172, '#581C87');
      box(c, D + dx + 8 + shake, GY - 160, 44, 60, '#6B21A8'); box(c, D + dx + 8 + shake, GY - 90, 44, 70, '#6B21A8');
    }
    box(c, D - 10 + shake, GY - 96, 6, 18, '#FDE047'); box(c, D + 4 + shake, GY - 96, 6, 18, '#FDE047');
  }
  wallSign(c, D, GY - 205, 'GRAND BALLROOM', '#3B0764', '#FDE047');
};
/** World space, in front: his voice through the doors (muffled: gray, small). */
export const drawDoorsFront = (c: Ctx, d: Doors) => { if (d.said) saidOver(c, d.said, d.x, GY - 230, '#A1A1AA', 220); };
/** Screen space: the cutscene's framing. */
export const drawDoorsHud = (c: Ctx, d: Doors) => {
  if (d.state !== 'kicking') return;
  drawBars(c, Math.min(1, d.t / 12));
  if (d.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
