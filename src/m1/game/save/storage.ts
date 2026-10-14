// Where everything that's remembered goes (the save files, the options' settings): a named blob of text, read,
// written or removed. In the browser that's localStorage; the Steam build swaps in its own (real files on disk, which
// Steam Cloud picks up) with setStorage, before anything's read. Kept synchronous: a desktop build can read and write
// its files straight off the disk (the way localStorage does), so nothing that calls it has to wait.

export interface Storage {
  /** The blob saved under this name, or null if there's none (or it can't be read). */
  read(name: string): string | null;
  /** Saves it under this name. False if it couldn't be. */
  write(name: string, data: string): boolean;
  /** Removes whatever's saved under this name (nothing there: nothing happens). */
  remove(name: string): void;
}

/** The browser's: localStorage (a private window, storage blocked or full: nothing's read, nothing's kept, no crash). */
export const browserStorage: Storage = {
  read: name => { try { return typeof localStorage === 'undefined' ? null : localStorage.getItem(name); } catch { return null; } },
  write: (name, data) => { try { if (typeof localStorage === 'undefined') return false; localStorage.setItem(name, data); return true; } catch { return false; } },
  remove: name => { try { if (typeof localStorage !== 'undefined') localStorage.removeItem(name); } catch { /* nothing to remove, then */ } },
};

let current: Storage = browserStorage;

/** What's in use. */
export const storage = (): Storage => current;
/** Swaps in another (the desktop build's files on disk). */
export const setStorage = (s: Storage) => { current = s; };

/** Reads a blob as JSON: missing, or not JSON (corrupt, half-written), is null. */
export const readJson = (name: string): unknown => {
  const s = current.read(name);
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
};
export const writeJson = (name: string, value: unknown): boolean => {
  try { return current.write(name, JSON.stringify(value)); } catch { return false; }
};
