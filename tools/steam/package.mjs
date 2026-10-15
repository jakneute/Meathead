// `npm run release:steam` (after `vite build --mode steam`): Meathead 1 as a Windows desktop app, for Steam. The steam
// build's page (.steam-build/page/index.html: the public build, but its voices left out) and the Electron side
// (electron/) go into a staging folder, Electron's packaged round them, and the lot lands in release-public/steam/
// (Meathead.exe and its files: no installer, Steam installs it). That folder's never in git (it's big: see .gitignore),
// and the public build leaves it alone.
//
// The voice pack goes beside the app as a file of its own, resources/voices.bin, outside app.asar (the app reads it for
// the page: electron/main.cjs), so a patch that only changes code or values changes only the few-MB app.asar.

import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const page = path.join(root, '.steam-build', 'page', 'index.html');
const voices = path.join(root, 'src', 'm1', 'generated', 'voices-m1.bin');
const stage = path.join(root, '.steam-build', 'app');
const extra = path.join(root, '.steam-build', 'extra');
const outTmp = path.join(root, '.steam-build', 'out');
const dest = path.join(root, 'release-public', 'steam');

if (!fs.existsSync(page)) { console.error('No .steam-build/page/index.html: run vite build --mode steam first (npm run release:steam does).'); process.exit(1); }
if (fs.readFileSync(page, 'utf8').includes('data:application/octet-stream;base64,')) { console.error('The steam page still has the voices inside it.'); process.exit(1); }

const electronVersion = createRequire(import.meta.url)('electron/package.json').version;

for (const d of [stage, extra, outTmp]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.mkdirSync(extra, { recursive: true });
fs.copyFileSync(voices, path.join(extra, 'voices.bin'));
for (const f of ['main.cjs', 'preload.cjs', 'steam.cjs', 'package.json', 'icon.ico']) fs.copyFileSync(path.join(root, 'electron', f), path.join(stage, f));
fs.copyFileSync(page, path.join(stage, 'Meathead.html'));

const [built] = await packager({
  dir: stage,
  out: outTmp,
  name: 'Meathead',
  executableName: 'Meathead',
  // (Meathead's face, from the cutscenes: npm run icon makes it)
  icon: path.join(root, 'electron', 'icon.ico'),
  platform: 'win32',
  arch: 'x64',
  electronVersion,
  asar: true,
  // (the voices: resources/voices.bin, beside app.asar, not in it)
  extraResource: [path.join(extra, 'voices.bin')],
  prune: false,
  overwrite: true,
  appVersion: JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8')).version,
  win32metadata: { ProductName: 'Meathead', FileDescription: 'Meathead', InternalName: 'Meathead', OriginalFilename: 'Meathead.exe' },
});

// (Chromium's own UI strings, in every language: the game's only ever in American English, and there's no browser UI)
const locales = path.join(built, 'locales');
for (const f of fs.readdirSync(locales)) if (f !== 'en-US.pak') fs.rmSync(path.join(locales, f), { force: true });

fs.rmSync(dest, { recursive: true, force: true });
fs.renameSync(built, dest);
fs.rmSync(path.join(root, '.steam-build'), { recursive: true, force: true });

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
const mb = f => `${(fs.statSync(path.join(dest, f)).size / 1048576).toFixed(1)} MB`;
console.log(`release-public/steam/Meathead.exe (Electron ${electronVersion}): ${(size(dest) / 1048576).toFixed(1)} MB in all; resources/app.asar (the game) ${mb('resources/app.asar')}, resources/voices.bin ${mb('resources/voices.bin')}`);
