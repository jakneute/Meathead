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
// pauseCard, by the same id) in place of the weapons, weapon switching off, no BACK TO HUB (QUIT still reloads the
// page, clean). Not marked: a cutscene as ever. Nothing to clear: a minigame that ends, or a death, or leaving, just
// stops marking it.
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

/** The minigames with a pause-menu controls card (PauseControls.tsx pauseCard). */
export type MinigameId = 'plunge' | 'bumper' | 'gallery' | 'mash' | 'hack' | 'lockpick';

let markId: MinigameId | null = null, markFrame = -1;
let live: MinigameId | null = null;
let paused = false;

/** This frame, the minigame `id` is on and can be paused (call it every frame it can be, from its update). */
export const minigamePausable = (state: GameState, id: MinigameId) => { markId = id; markFrame = state.frame; };

/** (App.tsx's frame hook, after the land's update) Which minigame's pausable this frame, or null. */
export const syncMinigame = (state: GameState): MinigameId | null => { live = markFrame === state.frame ? markId : null; markId = null; return live; };

/** The minigame that's pausable (as of the last frame played: it holds through a pause), or null. */
export const liveMinigame = () => live;

/** (App.tsx) The game's paused or not. */
export const setGamePaused = (on: boolean) => { paused = on; };
/** The game's paused (the pause menu, the park map out of play): a minigame's own mouse listener ignores clicks then. */
export const gamePaused = () => paused;
