// What's playing, and when it changes. The menus say what they want (the title, the map, the cutscenes, the weapon
// screen); in a stage the game decides: the stage's theme, arranged for wherever he is in it, a mid-boss's theme
// while one's on screen, the boss's once the arena's locked, the jingle when the boss goes down, and the one when he
// dies. Ducked while anyone's talking; muffled while it's paused, and under water.

import { GameStatus } from '../types';
import type { GameState } from './core/state';
import { getAudioContext } from './platform/audio';
import { isTalking } from './platform/speech';
import { play, stop, setMix, useContext, warmUp } from './platform/music/engine';
import { SONGS } from './platform/music/songs';
import { getStageLayout } from './stages';
import { isMidBoss } from './combat/midBoss';

export interface Cue { song: string; arr?: string }

/** Each stage's theme (they share their stage's name). */
const STAGE_SONG: Record<string, string> = {
  'Artie Avalanche': 'artie', 'Victor Volcano': 'victor', 'Ernie Earthquake': 'ernie', 'Hector Hurricane': 'hector',
  'Toxic Tommy': 'tommy', 'Blackout Barry': 'barry', 'Oily Oscar': 'oscar', 'Drug Trade Dale': 'dale',
};

/** What the menus want (undefined: it's the game's call), whether it's paused, and how to ask the game. */
let screenCue: Cue | null | undefined;
/** The sound test (the cheat panel): whatever it's playing wins. */
let testCue: Cue | null = null;
let paused = false;
/** Music on or off (the title screen's switch; remembered). */
let enabled = (() => { try { return localStorage.getItem('meathead-music') !== 'off'; } catch { return true; } })();
export const musicEnabled = () => enabled;
export const setMusicEnabled = (on: boolean) => {
  enabled = on;
  try { localStorage.setItem('meathead-music', on ? 'on' : 'off'); } catch { /* not remembered, then */ }
  last = '#';
  // (the sound test goes quiet with it)
  if (!on) testCue = null;
  start();
};
let fromGame: (() => { cue: Cue | null; muffled: boolean }) | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let last = '';

export const setScreenMusic = (cue: Cue | null | undefined) => { screenCue = cue; start(); };
export const setSoundTest = (cue: Cue | null) => { testCue = cue; start(); };
/** Every song and arrangement, in order (for the sound test). */
export const ALL_CUES: Cue[] = Object.entries(SONGS).flatMap(([song, s]) => Object.keys(s.arrangements ?? { main: 0 }).map(arr => ({ song, arr })));
export const setMusicPaused = (on: boolean) => { paused = on; };
export const setGameMusic = (fn: () => { cue: Cue | null; muffled: boolean }) => { fromGame = fn; start(); };

const apply = () => {
  const game = fromGame?.();
  const cue = !enabled ? null : testCue ?? (screenCue !== undefined ? screenCue : game?.cue ?? null);
  const key = cue ? `${cue.song}:${cue.arr ?? ''}` : '';
  if (key !== last) {
    last = key;
    if (!cue || !SONGS[cue.song]) stop(0.3);
    else play(cue.song, SONGS[cue.song], cue.arr ?? Object.keys(SONGS[cue.song].arrangements ?? { main: 0 })[0]);
  }
  setMix(isTalking(), !testCue && (paused || (screenCue === undefined && !!game?.muffled)));
};

const start = () => {
  if (timer || typeof window === 'undefined') return;
  useContext(getAudioContext);
  // (the instruments get made a few at a time in the background, so none of them hitches the first time it's played)
  setTimeout(() => warmUp(), 1500);
  timer = setInterval(() => { try { apply(); } catch (err) { console.error('music', err); } }, 100);
  // (the browser won't make a sound till someone's pressed something: the first press starts it)
  const unlock = () => { try { const c = getAudioContext(); if (c.state === 'suspended') c.resume(); } catch { /* no audio */ } };
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
};

/** In a stage: what should be on. */
export const gameMusicCue = (state: GameState, status: GameStatus, stageId: string | null): Cue | null => {
  const song = stageId ? STAGE_SONG[stageId] : undefined;
  if (!stageId || !song) return null;
  if (status === GameStatus.BOSS_TRANSITION) return null;
  if (state.deathTimer > 0) return { song: 'death' };
  if (state.bossExplosionTimer > 0 || state.victoryString || state.bossCorpse) return { song: 'victory' };
  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0);
  if (status === GameStatus.BOSS_INTRO || (boss && state.arenaLocked)) return { song: 'boss', arr: stageId };
  const cam = state.camera;
  const mid = state.enemies.find(e => isMidBoss(e) && e.health > 0 && !e.isBlownAway && e.pos.x + e.width > cam.x - 100 && e.pos.x < cam.x + 900);
  if (mid) return { song: 'midboss' };
  const arr = getStageLayout(stageId)?.music?.(state);
  return { song, arr };
};
