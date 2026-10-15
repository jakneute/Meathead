// What the page gets from the desktop app (window.meatheadDesktop): the files on disk the saves go in, the window's
// fullscreen, and quitting. Synchronous where the game's storage is (see src/m1/game/save/storage.ts). The game's side
// of it is src/m1/game/platform/desktop.ts; in the browser there's none of this, and the game does as it always did.

const { contextBridge, ipcRenderer } = require('electron');

const fullscreenListeners = new Set();
ipcRenderer.on('fullscreen-changed', (_e, on) => { fullscreenListeners.forEach(fn => { try { fn(!!on); } catch { /* theirs */ } }); });

contextBridge.exposeInMainWorld('meatheadDesktop', {
  isDesktop: true,
  storage: {
    read: name => { try { const s = ipcRenderer.sendSync('storage-read', String(name)); return typeof s === 'string' ? s : null; } catch { return null; } },
    write: (name, data) => { try { return ipcRenderer.sendSync('storage-write', String(name), String(data)) === true; } catch { return false; } },
    remove: name => { try { ipcRenderer.sendSync('storage-remove', String(name)); } catch { /* nothing to remove, then */ } },
  },
  /** Whether the browser's saves (the app's own localStorage) have been copied onto the disk yet: once, the first time. */
  migrated: () => { try { return ipcRenderer.sendSync('storage-migrated') === true; } catch { return true; } },
  markMigrated: () => { try { ipcRenderer.sendSync('storage-mark-migrated'); } catch { /* next time, then */ } },
  isFullscreen: () => { try { return ipcRenderer.sendSync('fullscreen-get') === true; } catch { return false; } },
  setFullscreen: on => { ipcRenderer.send('fullscreen-set', !!on); },
  /** The window going in or out of fullscreen (any way: the options, F11, Alt+Enter). Returns the unsubscribe. */
  onFullscreenChange: fn => { fullscreenListeners.add(fn); return () => { fullscreenListeners.delete(fn); }; },
  quit: () => { ipcRenderer.send('quit'); },
});
