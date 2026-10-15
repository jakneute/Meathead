// (Electron's side of make.mjs: open the page offscreen, ask it for the icons, write them out, quit)
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const [page, mood, out] = process.argv.slice(-3);
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 300, height: 300, webPreferences: { offscreen: true } });
  try {
    await win.loadFile(page);
    const urls = await win.webContents.executeJavaScript(`window.makeIcons(${JSON.stringify(mood)})`);
    fs.writeFileSync(out, JSON.stringify(urls));
    app.exit(0);
  } catch (e) { console.error(e); app.exit(1); }
});
