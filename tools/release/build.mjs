// `npm run release` (both games), `npm run release:m1`, `npm run release:m2`: each game's two single-file builds,
// into a folder of its own:
//   release-m1/Meathead.html          the standard build (no cheats, the intro always)
//   release-m1/Meathead-cheats.html   the same with the cheat panel and the debug options
//   release-m1/steam/                 the desktop app for Steam (npm run release:steam: the standard build)
//   release-m2/Meathead2.html         Meathead 2's standard build (no cheat panel)
//   release-m2/Meathead2-cheats.html  Meathead 2 with the cheat panel
// Vite builds each into .build/<mode>/ first, and the page is moved into place, so a folder's other files stay put.

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
const BUILDS = {
  m1: [['public', 'index.html', 'release-m1/Meathead.html'], ['release', 'index.html', 'release-m1/Meathead-cheats.html']],
  m2: [['m2public', 'meathead2.html', 'release-m2/Meathead2.html'], ['m2', 'meathead2.html', 'release-m2/Meathead2-cheats.html']],
};
const which = process.argv[2] === 'm1' || process.argv[2] === 'm2' ? [process.argv[2]] : ['m1', 'm2'];
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
for (const game of which) for (const [mode, page, to] of BUILDS[game]) {
  const r = spawnSync(process.execPath, [vite, 'build', '--mode', mode], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const dest = path.join(root, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, '.build', mode, page), dest);
  fs.rmSync(path.join(root, '.build', mode), { recursive: true, force: true });
  console.log(`-> ${to} (${(fs.statSync(dest).size / 1048576).toFixed(1)} MB)`);
}
fs.rmSync(path.join(root, '.build'), { recursive: true, force: true });
