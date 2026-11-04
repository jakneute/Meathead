// Pausing in a minigame (the owner's: "yes allow pausing" and "pausing shows special controls too").
//
// Every minigame runs as a cutscene to the engine (player.inCutscene: nothing touches him, only the minigame reads the
// buttons), and a cutscene can't be paused (App.tsx: ui.noPause). A minigame opts back in, a frame at a time: each
// frame it's in a stretch that can be paused (the game itself: not its A/B ask, not its own controls card or the award
// card, not its scenes in the world), it calls
//
//     minigamePausable(state, 'bumper');
//
// from its update. App.tsx's frame hook (syncMinigame) reads it straight after the land's update: marked this frame,
// START (or ESC / P) opens the pause menu after all, the menu showing that minigame's controls (PauseControls.tsx
// pauseCard, by the same id) in place of the weapons, weapon switching off, and QUIT MINIGAME where BACK TO HUB goes
// (the owner's: "pausing a minigame should replace the 'back to hub' option to 'quit minigame' if the user wants to back
// out for whatever reason"). Not marked: a cutscene as ever. Nothing to clear: a minigame that ends, or a death, or
// leaving, just stops marking it.
//
// QUIT MINIGAME (asked first, ARE YOU SURE?): YES resumes, and the first frame back the `quit` handed in with the mark
// runs (App.tsx's frame hook, syncMinigame: the minigame's had that one frame, its buttons still held off). It backs
// out clean: its screens and asks and tips down, the voices cut, him let go (or let go once the button's up) by
// wherever he started it, no prize, no win; its music goes as its phase does.
//
// Paused, the land's update doesn't run at all (stepGame: a paused game is frozen), so the minigame's own frame
// counters stop with it; the voices are held too (speech.ts pauseSpeech, App.tsx). Resumed, the buttons held from the
// pause menu don't count as presses: the engine's controls are gated till let go (GameCanvas.tsx), and so are Meathead
// 2's own (input.ts holdM2Presses: confirm / back / the face buttons). A mouse click on the pause menu never reaches a
// minigame that reads clicks itself: check gamePaused() in the listener (adventure/dino/hack.ts does).
//
// A NEW MINIGAME: add its id to MinigameId, its card to PauseControls.tsx pauseCard (the real bindings its code reads),
// and call minigamePausable from its playing phases. Use game frames for its timers (state.frame or its own counter
// stepped in its update), never the wall clock, so a pause doesn't eat its time.

import type { GameState } from '../m1/game/core/state';
import { holdControlsTillRelease } from '../m1/game/core/heldOff';
import { holdM2Presses } from './input';

/** The minigames with a pause-menu controls card (PauseControls.tsx pauseCard). */
export type MinigameId = 'plunge' | 'bumper' | 'gallery' | 'mash' | 'hack' | 'lockpick';

/** How a minigame backs out (QUIT MINIGAME): called with the state it was marked with, the first frame after the pause. */
export type MinigameQuit = (state: GameState) => void;

let markId: MinigameId | null = null, markFrame = -1, markQuit: MinigameQuit | null = null, markState: GameState | null = null;
let live: MinigameId | null = null, liveQuit: MinigameQuit | null = null, liveState: GameState | null = null;
let paused = false;
/** QUIT MINIGAME said yes to: run on the next frame played. */
let pendingQuit: { quit: MinigameQuit; state: GameState } | null = null;

// ---------------------------------------------------------------------------------------------------------------
// His hands, in and out of a minigame (the owner: "when ending the minigame, he fired the spellbook of the damned" and
// "any action you may have initiated at the start of the minigame gets eaten if you start it").
//
// A minigame takes him over (its UP start, or its A/B ask: minigameConfirm.ts openAsk calls this too, so every one's
// covered by its ask even if its start doesn't say so) with minigameTakeover(). On the next frame hook (syncMinigame,
// straight after the land's update, before the engine reads his buttons or ticks the weapons) whatever he had going is
// called off: dropActions.ts (the spellbook's reading would otherwise finish under the minigame, the flintlock's bead
// goes off when the buttons go). Then the session's on till he's let go (player.inCutscene off, alive): there it's all
// dropped again and the action buttons are held off till every one's been let go (heldOff.ts; Meathead 2's own presses
// too, input.ts), so a fire held, or pressed on the minigame's last screen, never goes off as play comes back. However
// it ends (won, lost, BACK on the ask, QUIT MINIGAME, its card closed) it ends by letting him go, so that's the one
// place it's caught. A death, or leaving (dropMinigamePause), just forgets the session.

let takeoverPending = false, session = false, sessionHeld = false;
/** dropActions.ts dropPlayerActions, handed in by App.tsx (imported here it'd pull every weapon in under the minigames:
 *  an import loop). */
let dropPlayerActions: (state: GameState) => void = () => {};
export const setDropActions = (fn: (state: GameState) => void) => { dropPlayerActions = fn; };

/** (a minigame's start, the frame it takes him over; openAsk too) Whatever he had going is called off now, and his
 *  buttons are held off as he's let go after it. */
export const minigameTakeover = () => { takeoverPending = true; };

const syncHands = (state: GameState) => {
  const p = state.player;
  if (takeoverPending) {
    takeoverPending = false; session = true; sessionHeld = !!p.inCutscene;
    dropPlayerActions(state); holdM2Presses();
    return;
  }
  if (!session) return;
  if (state.deathTimer > 0 || p.health <= 0) { session = false; return; }
  // (seen held once first: a start that holds him a frame later isn't taken for the end)
  if (p.inCutscene) { sessionHeld = true; return; }
  if (!sessionHeld) return;
  session = false;
  dropPlayerActions(state); holdControlsTillRelease(); holdM2Presses();
};

/** This frame, the minigame `id` is on and can be paused (call it every frame it can be, from its update); `quit`
 *  backs out of it (QUIT MINIGAME in the pause menu: a module-level function, not a fresh closure a frame). `quit`
 *  null: it can't be backed out of (the shooting gallery, the owner's: "the one minigame you cannot 'back out of'
 *  because it would ruin the punchline"): no QUIT MINIGAME, no BACK TO HUB, just its controls. */
export const minigamePausable = (state: GameState, id: MinigameId, quit: MinigameQuit | null) => { markId = id; markFrame = state.frame; markQuit = quit; markState = state; };

/** (App.tsx's frame hook, after the land's update) Which minigame's pausable this frame, or null. */
export const syncMinigame = (state: GameState): MinigameId | null => {
  syncHands(state);
  // (QUIT MINIGAME said yes to: done on the first frame back in play, so its lines start with the voices running)
  if (pendingQuit) {
    const q = pendingQuit;
    pendingQuit = null;
    markId = null; markQuit = null; markState = null; live = null; liveQuit = null; liveState = null;
    q.quit(q.state);
    return null;
  }
  const on = markFrame === state.frame ? markId : null;
  live = on; liveQuit = on ? markQuit : null; liveState = on ? markState : null;
  markId = null; markQuit = null; markState = null;
  return live;
};

/** (App.tsx: QUIT MINIGAME's YES, paused) Back out of the live minigame, on the next frame played (the menu resumes
 *  straight after). True if there's one to quit. */
export const quitMinigame = (): boolean => {
  if (!liveQuit || !liveState) return false;
  pendingQuit = { quit: liveQuit, state: liveState };
  return true;
};

/** (App.tsx, on any travel) Forget the lot: nothing marked, nothing live, no QUIT MINIGAME waiting to run on the next
 *  stage. The stage being left takes its minigame itself down (spooky/index.ts dropMash and the like). */
export const dropMinigamePause = () => {
  markId = null; markFrame = -1; markQuit = null; markState = null;
  live = null; liveQuit = null; liveState = null; pendingQuit = null;
  takeoverPending = false; session = false; sessionHeld = false;
};

/** The minigame that's pausable (as of the last frame played: it holds through a pause), or null. */
export const liveMinigame = () => live;
/** Can the live minigame be backed out of (QUIT MINIGAME)? */
export const minigameQuittable = () => !!live && !!liveQuit;

/** (App.tsx) The game's paused or not. */
export const setGamePaused = (on: boolean) => { paused = on; };
/** The game's paused (the pause menu, the park map out of play): a minigame's own mouse listener ignores clicks then. */
export const gamePaused = () => paused;
