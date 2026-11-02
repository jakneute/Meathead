// A minigame's host calling after him as he walks off (the owner's, 2026-11-02: "for any npcs that initiate minigames
// like the arcade, bumper cars or shooting gallery, the guy will call you out if you leave the screen scrolling right
// 'where are you going? come back' as sample lines").
//
// One WalkOff a host. Each frame the host hands in where it stands and whether it's met him (it's been flagging him
// down, or he's been up to it); the call's due once he's come near it, then walked off till it's gone off the screen's
// edge (either way). Once a leaving: it's armed again only by his coming back near. Never over anybody (nobody
// talking), never in a cutscene or a minigame (the host's own phase says), never hard on another host's call-out. Too
// far gone before it got its turn (a line playing the whole way out, a door): it's dropped, not shouted a screen late.
// The words go up over the host as ever (saidOver slides them in whole off the screen's edge, toward him).

import type { GameState } from '../m1/game/core/state';
import { CANVAS_WIDTH } from '../m1/constants';
import { isTalking } from '../m1/game/platform/speech';

export interface WalkOff { armed: boolean }
export const walkOff = (): WalkOff => ({ armed: false });

/** Near enough to count as having been by it; how far past the screen's edge it has to be (off, sprite and all); how
 *  far past that it's too late; the least time between any two hosts' call-outs (ms). */
const NEAR = 340, OFF = 40, LATE = 320, GAP_MS = 9000;
let lastAt = -1e9;

/**
 * True the frame it's time to call after him (the host says the line). `x`: the host (world, its middle). `met`: it's
 * been trying to get his attention, or he's talked to it. `ok`: the host's own say (not mid-minigame, not just said
 * something).
 */
export const walkOffDue = (state: GameState, w: WalkOff, x: number, met: boolean, ok: boolean): boolean => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (met && Math.abs(cx - x) < NEAR) { w.armed = true; return false; }
  if (!w.armed) return false;
  const vx = state.view?.x ?? state.camera.x, vw = state.view?.w ?? CANVAS_WIDTH;
  const past = x < vx ? vx - x : x > vx + vw ? x - (vx + vw) : -1;
  if (past < OFF) return false;
  if (past > LATE) { w.armed = false; return false; }
  const free = !p.inCutscene && p.health > 0 && state.deathTimer <= 0;
  if (!free || !ok || isTalking() || Date.now() - lastAt < GAP_MS) return false;
  w.armed = false; lastAt = Date.now();
  return true;
};
