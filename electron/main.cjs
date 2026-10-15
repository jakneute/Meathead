// Meathead 1 on the desktop: the public build (Meathead.html, the very same page the browser plays) in a window of its
// own. No menu, no dev tools, no browser shortcuts (Ctrl+R and the rest went with the menu); F11 and Alt+Enter take the
// window in and out of fullscreen; the saves and settings are real files on disk (saveDir() below: what Steam Cloud will
// sync), read and written for the page over synchronous IPC (see preload.cjs). Packaged by tools/steam/package.mjs
// (`npm run release:steam`).

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const steam = require('./steam.cjs');

app.setName('Meathead');
// (one copy running at a time: two writing the same save files would trample each other)
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

// ---- the files on disk ---------------------------------------------------------------------------------------------
// %APPDATA%\Meathead\saves\meathead-save-1.json .. 3 (the save files), %APPDATA%\Meathead\settings.json (the options),
// anything else the game remembers in %APPDATA%\Meathead\data\.
const userDir = () => app.getPath('userData');
const saveDir = () => path.join(userDir(), 'saves');
const MIGRATED = () => path.join(userDir(), 'data', '.migrated');

/** Where a blob of this name lives (null: not a name the game would use). */
const fileFor = name => {
  if (typeof name !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(name)) return null;
  if (/^meathead-save-\d+$/.test(name)) return path.join(saveDir(), `${name}.json`);
  if (name === 'meathead-settings') return path.join(userDir(), 'settings.json');
  return path.join(userDir(), 'data', `${name}.txt`);
};

const readFile = name => {
  const f = fileFor(name);
  if (!f) return null;
  try { return fs.readFileSync(f, 'utf8'); } catch { return null; }
};

/** Written whole or not at all: into a temp file first, then renamed over the old one. */
const writeFile = (name, data) => {
  const f = fileFor(name);
  if (!f) return false;
  const tmp = `${f}.tmp`;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const fd = fs.openSync(tmp, 'w');
    try { fs.writeFileSync(fd, data, 'utf8'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try { fs.renameSync(tmp, f); }
    catch {
      // (Windows: something, a virus scanner, holding the old one for a moment: once more, then copy over it)
      try { fs.renameSync(tmp, f); } catch { fs.copyFileSync(tmp, f); fs.rmSync(tmp, { force: true }); }
    }
    return true;
  } catch {
    try { fs.rmSync(tmp, { force: true }); } catch { /* never made */ }
    return false;
  }
};

const removeFile = name => {
  const f = fileFor(name);
  if (f) try { fs.rmSync(f, { force: true }); } catch { /* not there */ }
};

ipcMain.on('storage-read', (e, name) => { e.returnValue = readFile(name); });
ipcMain.on('storage-write', (e, name, data) => { e.returnValue = typeof data === 'string' && writeFile(name, data); });
ipcMain.on('storage-remove', (e, name) => { removeFile(name); e.returnValue = true; });
ipcMain.on('storage-migrated', e => { e.returnValue = fs.existsSync(MIGRATED()); });
ipcMain.on('storage-mark-migrated', e => {
  try { fs.mkdirSync(path.dirname(MIGRATED()), { recursive: true }); fs.writeFileSync(MIGRATED(), String(Date.now())); } catch { /* next time */ }
  e.returnValue = true;
});

/** The options' FULLSCREEN as it was left (read here so the window opens that way, no flash of the other). */
const savedFullscreen = () => {
  try { return JSON.parse(readFile('meathead-settings') || '{}').fullscreen === true; } catch { return false; }
};

// ---- the window ----------------------------------------------------------------------------------------------------
let win = null;

const createWindow = () => {
  const fullscreen = savedFullscreen();
  win = new BrowserWindow({
    title: 'Meathead',
    width: 1280, height: 960, minWidth: 800, minHeight: 600,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'icon.ico'),
    fullscreen,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
      // (the music and voices play from the first frame: no click needed first, as a browser wants)
      autoplayPolicy: 'no-user-gesture-required',
      spellcheck: false,
    },
  });
  win.setMenu(null);
  win.once('ready-to-show', () => { if (!fullscreen) win.maximize(); win.show(); win.focus(); });

  // (the page's <title> stays out of the title bar's way: it's Meathead)
  win.on('page-title-updated', e => e.preventDefault());
  const tell = () => { if (win && !win.isDestroyed()) win.webContents.send('fullscreen-changed', win.isFullScreen()); };
  win.on('enter-full-screen', tell);
  win.on('leave-full-screen', () => { tell(); if (win && !win.isMaximized()) win.maximize(); });

  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    // F11, or Alt+Enter: fullscreen in and out (the options' FULLSCREEN follows: see fullscreen-changed)
    if ((input.key === 'F11' && !input.alt && !input.control) || (input.key === 'Enter' && input.alt)) {
      e.preventDefault();
      if (!input.isAutoRepeat) win.setFullScreen(!win.isFullScreen());
    } else if (!app.isPackaged && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  // (the game never goes anywhere else, and opens nothing)
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());

  win.on('closed', () => { win = null; });
  win.loadFile(path.join(__dirname, 'Meathead.html'));
};

ipcMain.on('fullscreen-get', e => { e.returnValue = !!win && win.isFullScreen(); });
ipcMain.on('fullscreen-set', (_e, on) => { if (win && win.isFullScreen() !== !!on) win.setFullScreen(!!on); });
ipcMain.on('quit', () => { app.quit(); });

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  // (no menu at all: and with it go its shortcuts, Ctrl+R's reload, Ctrl+Shift+I's dev tools, the zooms)
  Menu.setApplicationMenu(null);
  steam.init();
  createWindow();
});
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => steam.shutdown());
