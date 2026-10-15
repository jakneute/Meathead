// `npm run release:steam` (after release:public): Meathead 1 as a Windows desktop app, for Steam. The public build's page
// (release-public/Meathead.html) and the Electron side (electron/) go into a staging folder, Electron's packaged round
// them, and the lot lands in release-public/steam/ (Meathead.exe and its files: no installer, Steam installs it). That
// folder's never in git (it's big: see .gitignore), and the public build leaves it alone.

import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const page = path.join(root, 'release-public', 'Meathead.html');
const stage = path.join(root, '.steam-build', 'app');
const outTmp = path.join(root, '.steam-build', 'out');
const dest = path.join(root, 'release-public', 'steam');

if (!fs.existsSync(page)) { console.error('No release-public/Meathead.html: run npm run release:public first.'); process.exit(1); }

const electronVersion = createRequire(import.meta.url)('electron/package.json').version;

fs.rmSync(path.join(root, '.steam-build'), { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
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
console.log(`release-public/steam/Meathead.exe (Electron ${electronVersion}): ${(size(dest) / 1048576).toFixed(1)} MB in all`);
