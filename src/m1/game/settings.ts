// The options screen's settings: the volumes, the video, the keyboard's keys. Remembered (one blob, through save/storage:
// localStorage in the browser; global, not per save file), put into effect the moment they change and when the game starts (loadSettings, from Meathead 1's App; Meathead 2
// doesn't call it, and everything here defaults to how the game always was).

import { setMixLevel } from './platform/mixer';
import { DEFAULT_KEYS, sanitizeKeys, setKeyBindings, type KeyBindings } from './platform/keys';
import { storage, readJson, writeJson } from './save/storage';
import { desktop } from './platform/desktop';

export type Scaling = 'sharp' | 'stretch';
export type ShakeLevel = 'heavy' | 'mild' | 'none';

export interface Settings {
  /** Volumes, 0 to 100 in tens. */
  master: number;
  music: number;
  sfx: number;
  voice: number;
  fullscreen: boolean;
  scaling: Scaling;
  shake: ShakeLevel;
  reduceFlashing: boolean;
  keys: KeyBindings;
}

export const DEFAULT_SETTINGS: Settings = {
  master: 100, music: 100, sfx: 100, voice: 100,
  fullscreen: false, scaling: 'stretch', shake: 'heavy', reduceFlashing: false,
  keys: DEFAULT_KEYS,
};

const STORE = 'meathead-settings';
/** The title screen's old music switch (on or off): read once, if there's nothing newer. */
const OLD_MUSIC = 'meathead-music';

let current: Settings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

const vol = (v: unknown, d: number) => (typeof v === 'number' && isFinite(v) ? Math.max(0, Math.min(100, Math.round(v / 10) * 10)) : d);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (opts.includes(v as T) ? (v as T) : d);

export const getSettings = () => current;
export const subscribeSettings = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

// ---- what each one does, read where it's applied
let shakeScaleNow = 1;
let reduceFlashingNow = false;
/** How much of the screen shake to use (1 the full shake; the options screen's MILD and NONE). */
export const shakeScale = () => shakeScaleNow;
/** Reduce flashing is on. */
export const reduceFlashing = () => reduceFlashingNow;
/** The most a full-screen flash may cover the screen with reduce flashing on. */
export const FLASH_CAP = 0.18;
/**
 * A full-screen flash's opacity, as it should be shown: as asked, or with reduce flashing on, held down low (and a
 * strobe going on and off held at the one low level, `steady`, rather than blinking).
 */
export const flashAlpha = (a: number, steady?: number) => (reduceFlashingNow ? Math.min(steady ?? a, FLASH_CAP) : a);

const apply = () => {
  setMixLevel('master', current.master / 100);
  setMixLevel('music', current.music / 100);
  setMixLevel('sfx', current.sfx / 100);
  setMixLevel('voice', current.voice / 100);
  shakeScaleNow = current.shake === 'heavy' ? 1 : current.shake === 'mild' ? 0.4 : 0;
  reduceFlashingNow = current.reduceFlashing;
  setKeyBindings(current.keys);
};

const save = () => { writeJson(STORE, current); };

export const updateSettings = (patch: Partial<Settings>) => {
  current = { ...current, ...patch };
  save();
  apply();
  listeners.forEach(f => f());
};

/** Reads what's remembered and puts it into effect (once, as the game starts). */
export const loadSettings = () => {
  let raw: Record<string, unknown> | null = null;
  const r = readJson(STORE);
  if (r && typeof r === 'object') raw = r as Record<string, unknown>;
  if (raw && typeof raw === 'object') {
    current = {
      master: vol(raw.master, 100), music: vol(raw.music, 100), sfx: vol(raw.sfx, 100), voice: vol(raw.voice, 100),
      fullscreen: raw.fullscreen === true,
      scaling: oneOf(raw.scaling, ['sharp', 'stretch'] as const, 'stretch'),
      shake: oneOf(raw.shake, ['heavy', 'mild', 'none'] as const, 'heavy'),
      reduceFlashing: raw.reduceFlashing === true,
      keys: sanitizeKeys(raw.keys),
    };
  } else {
    // (the music was switched off on the title screen, before there were options: it stays off)
    const musicOff = storage().read(OLD_MUSIC) === 'off';
    current = { ...DEFAULT_SETTINGS, music: musicOff ? 0 : 100 };
  }
  apply();
  listeners.forEach(f => f());
  watchFullscreen();
};

// ---- fullscreen (the whole page: the game's what's on it; in the desktop app, the window itself)
const isFullscreen = () => (desktop ? desktop.isFullscreen() : !!document.fullscreenElement);
export const setFullscreen = (on: boolean) => {
  // (the desktop app: the window goes fullscreen, no press needed first, and F11 / Alt+Enter come back through watchFullscreen)
  if (desktop) {
    desktop.setFullscreen(on);
    if (current.fullscreen !== on) updateSettings({ fullscreen: on });
    return;
  }
  try {
    if (on && !isFullscreen()) document.documentElement.requestFullscreen?.().catch(() => { if (current.fullscreen !== isFullscreen()) updateSettings({ fullscreen: isFullscreen() }); });
    else if (!on && isFullscreen()) document.exitFullscreen?.().catch(() => { /* already out */ });
  } catch { /* no fullscreen here */ }
  if (current.fullscreen !== on) updateSettings({ fullscreen: on });
};
let watching = false;
const watchFullscreen = () => {
  if (watching || typeof document === 'undefined') return;
  watching = true;
  if (desktop) {
    // (the window's opened the way it was left; the setting follows it in and out, however it went: F11, Alt+Enter)
    desktop.onFullscreenChange(on => { if (current.fullscreen !== on) updateSettings({ fullscreen: on }); });
    if (current.fullscreen !== desktop.isFullscreen()) desktop.setFullscreen(current.fullscreen);
    return;
  }
  // (out with Esc, or in or out any other way: the setting follows)
  document.addEventListener('fullscreenchange', () => { if (current.fullscreen !== isFullscreen()) updateSettings({ fullscreen: isFullscreen() }); });
  // (remembered on: the browser only lets it go fullscreen off a press, so the first one does it)
  if (current.fullscreen && !isFullscreen()) {
    const go = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') return;
      window.removeEventListener('keydown', go, true); window.removeEventListener('pointerdown', go, true);
      if (current.fullscreen && !isFullscreen()) try { document.documentElement.requestFullscreen?.().catch(() => { /* refused */ }); } catch { /* none */ }
    };
    window.addEventListener('keydown', go, true); window.addEventListener('pointerdown', go, true);
  }
};
