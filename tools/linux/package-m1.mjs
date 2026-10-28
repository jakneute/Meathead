// `npm run release:linux`: Meathead 1 as a Linux desktop app (Steam Machine / SteamOS).
// Needs `vite build --mode steam` to have run first — `npm run release:linux` does both.
// Output: release-m1/linux/ — a folder containing the Meathead executable. Zip it up and put it on a USB stick or
// transfer it over the network; the friend runs ./Meathead from it, or adds it as a Non-Steam game on SteamOS.

import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const page = path.join(root, '.steam-build', 'page', 'index.html');
const voices = path.join(root, 'src', 'm1', 'generated', 'voices-m1.bin');
const stage = path.join(root, '.linux-build-m1', 'app');
const extra = path.join(root, '.linux-build-m1', 'extra');
const outTmp = path.join(root, '.linux-build-m1', 'out');
const dest = path.join(root, 'release-m1', 'linux');

if (!fs.existsSync(page)) { console.error('No .steam-build/page/index.html: run vite build --mode steam first.'); process.exit(1); }
if (fs.readFileSync(page, 'utf8').includes('data:application/octet-stream;base64,')) { console.error('The steam page still has voices inside it.'); process.exit(1); }

const electronVersion = createRequire(import.meta.url)('electron/package.json').version;

for (const d of [stage, extra, outTmp]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true }); fs.mkdirSync(extra, { recursive: true });
fs.copyFileSync(voices, path.join(extra, 'voices.bin'));
for (const f of ['main.cjs', 'preload.cjs', 'steam.cjs', 'package.json']) fs.copyFileSync(path.join(root, 'electron', f), path.join(stage, f));
fs.copyFileSync(page, path.join(stage, 'Meathead.html'));

const [built] = await packager({
  dir: stage, out: outTmp,
  name: 'Meathead', executableName: 'Meathead',
  platform: 'linux', arch: 'x64',
  electronVersion, asar: true,
  extraResource: [path.join(extra, 'voices.bin')],
  prune: false, overwrite: true,
  appVersion: JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8')).version,
});

// (Chromium locale files: the game is always American English; the rest go)
const locales = path.join(built, 'locales');
for (const f of fs.readdirSync(locales)) if (f !== 'en-US.pak') fs.rmSync(path.join(locales, f), { force: true });

fs.rmSync(dest, { recursive: true, force: true });
fs.renameSync(built, dest);
fs.rmSync(path.join(root, '.linux-build-m1'), { recursive: true, force: true });

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`release-m1/linux/Meathead (Electron ${electronVersion}): ${(size(dest) / 1048576).toFixed(1)} MB`);
