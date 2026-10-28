// Meathead 2 on the desktop: the standard build (Meathead2.html) in a window of its own. Identical setup to Meathead
// 1's main.cjs, but for the game file, the app name, and the voices (bundled inside the page, not a separate file).
// Packaged by tools/linux/package-m2.mjs (`npm run release:linux:m2`).

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const steam = require('./steam.cjs');

// (Steam Machine / Steam Deck: the sandbox is blocked on read-only filesystems)
if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox');

app.setName('Meathead 2');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const userDir = () => app.getPath('userData');
const saveDir = () => path.join(userDir(), 'saves');
const MIGRATED = () => path.join(userDir(), 'data', '.migrated');

const fileFor = name => {
  if (typeof name !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(name)) return null;
  if (/^meathead2-save-\d+$/.test(name)) return path.join(saveDir(), `${name}.json`);
  if (name === 'meathead2-settings') return path.join(userDir(), 'settings.json');
  return path.join(userDir(), 'data', `${name}.txt`);
};

const readFile = name => {
  const f = fileFor(name);
  if (!f) return null;
  try { return fs.readFileSync(f, 'utf8'); } catch { return null; }
};

const writeFile = (name, data) => {
  const f = fileFor(name);
  if (!f) return false;
  const tmp = `${f}.tmp`;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const fd = fs.openSync(tmp, 'w');
    try { fs.writeFileSync(fd, data, 'utf8'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try { fs.renameSync(tmp, f); }
    catch { try { fs.renameSync(tmp, f); } catch { fs.copyFileSync(tmp, f); fs.rmSync(tmp, { force: true }); } }
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

const savedFullscreen = () => {
  try { return JSON.parse(readFile('meathead2-settings') || '{}').fullscreen === true; } catch { return false; }
};

let win = null;

const createWindow = () => {
  const fullscreen = savedFullscreen();
  win = new BrowserWindow({
    title: 'Meathead 2',
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
      autoplayPolicy: 'no-user-gesture-required',
      spellcheck: false,
    },
  });
  win.setMenu(null);
  win.once('ready-to-show', () => { if (!fullscreen) win.maximize(); win.show(); win.focus(); });
  win.on('page-title-updated', e => e.preventDefault());
  const tell = () => { if (win && !win.isDestroyed()) win.webContents.send('fullscreen-changed', win.isFullScreen()); };
  win.on('enter-full-screen', tell);
  win.on('leave-full-screen', () => { tell(); if (win && !win.isMaximized()) win.maximize(); });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if ((input.key === 'F11' && !input.alt && !input.control) || (input.key === 'Enter' && input.alt)) {
      e.preventDefault();
      if (!input.isAutoRepeat) win.setFullScreen(!win.isFullScreen());
    } else if (!app.isPackaged && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.on('closed', () => { win = null; });
  win.loadFile(path.join(__dirname, 'Meathead2.html'));
};

ipcMain.on('fullscreen-get', e => { e.returnValue = !!win && win.isFullScreen(); });
ipcMain.on('fullscreen-set', (_e, on) => { if (win && win.isFullScreen() !== !!on) win.setFullScreen(!!on); });
ipcMain.on('quit', () => { app.quit(); });

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  steam.init();
  createWindow();
});
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => steam.shutdown());
