// `npm run release:steam:m2`: Meathead 2 as a Windows desktop app, for Steam.
// Needs `npm run release:m2` to have run first — `npm run release:steam:m2` does both.
// Output: release-m2/windows/ — a folder containing Meathead2.exe and its files.
// The voices are bundled inside the page (unlike the M1 steam build which puts them beside it), so the folder is
// larger (~200–250 MB), but there's nothing else to carry alongside it.

import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const page = path.join(root, 'release-m2', 'app', 'Meathead2.html');
const stage = path.join(root, '.steam-build-m2', 'app');
const outTmp = path.join(root, '.steam-build-m2', 'out');
const dest = path.join(root, 'release-m2', 'windows');

if (!fs.existsSync(page)) { console.error('No release-m2/app/Meathead2.html: run npm run release:m2 first.'); process.exit(1); }

const electronVersion = createRequire(import.meta.url)('electron/package.json').version;

for (const d of [stage, outTmp]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const f of ['main-m2.cjs', 'preload.cjs', 'steam.cjs', 'icon.ico']) fs.copyFileSync(path.join(root, 'electron', f), path.join(stage, f));
fs.copyFileSync(path.join(root, 'electron', 'package-m2.json'), path.join(stage, 'package.json'));
fs.copyFileSync(page, path.join(stage, 'Meathead2.html'));

const [built] = await packager({
  dir: stage, out: outTmp,
  name: 'Meathead2', executableName: 'Meathead2',
  icon: path.join(root, 'electron', 'icon.ico'),
  platform: 'win32', arch: 'x64',
  electronVersion, asar: true,
  prune: false, overwrite: true,
  appVersion: JSON.parse(fs.readFileSync(path.join(stage, 'package.json'), 'utf8')).version,
  win32metadata: { ProductName: 'Meathead 2', FileDescription: 'Meathead 2', InternalName: 'Meathead2', OriginalFilename: 'Meathead2.exe' },
});

const locales = path.join(built, 'locales');
for (const f of fs.readdirSync(locales)) if (f !== 'en-US.pak') fs.rmSync(path.join(locales, f), { force: true });

fs.rmSync(dest, { recursive: true, force: true });
fs.renameSync(built, dest);
fs.rmSync(path.join(root, '.steam-build-m2'), { recursive: true, force: true });

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`release-m2/windows/Meathead2.exe (Electron ${electronVersion}): ${(size(dest) / 1048576).toFixed(1)} MB`);
