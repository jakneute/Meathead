// The desktop app's (Electron's: see electron/preload.cjs) side of things, when the game's running in it: the saves and
// settings in real files on disk, the window's own fullscreen, and quitting to the desktop. In a browser there's none of
// it (`desktop` is null) and everything does as it always did.

import { browserStorage, setStorage, type Storage } from '../save/storage';

interface DesktopBridge {
  isDesktop: true;
  storage: Storage;
  migrated(): boolean;
  markMigrated(): void;
  isFullscreen(): boolean;
  setFullscreen(on: boolean): void;
  onFullscreenChange(fn: (on: boolean) => void): () => void;
  quit(): void;
}

/** The desktop app, if that's where it's running (null in a browser). */
export const desktop: DesktopBridge | null =
  typeof window !== 'undefined' && (window as unknown as { meatheadDesktop?: DesktopBridge }).meatheadDesktop?.isDesktop
    ? (window as unknown as { meatheadDesktop: DesktopBridge }).meatheadDesktop : null;

/** Running as the desktop app (QUIT GAME, QUIT TO DESKTOP and the like only show there). */
export const isDesktop = !!desktop;

/** Quits to the desktop (the desktop app only). */
export const quitToDesktop = () => { desktop?.quit(); };

// The files on disk, swapped in before anything's read (this module's imported first: see index.tsx). The first time,
// whatever the app's own browser storage already had (the game's names: meathead-...) is copied onto the disk, unless
// the disk's already got its own.
if (desktop) {
  if (!desktop.migrated()) {
    try {
      const names: string[] = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('meathead-')) names.push(k); }
      for (const name of names) {
        const s = browserStorage.read(name);
        if (s !== null && desktop.storage.read(name) === null) desktop.storage.write(name, s);
      }
    } catch { /* nothing there to bring over */ }
    desktop.markMigrated();
  }
  setStorage(desktop.storage);
}
