// `npm run release` (both games), `npm run release:m1`, `npm run release:m2`: each game's two single-file builds,
// into a folder of its own:
//   release-m1/Meathead-cheats.html   the game with the cheat panel and the debug options (the one HTML at the top)
//   release-m1/app/Meathead.html      the standard build (no cheats, the intro always)
//   release-m1/steam/                 the desktop app for Steam (npm run release:steam: the standard build)
//   release-m2/Meathead2-cheats.html  Meathead 2 with the cheat panel (the one HTML file at the folder's top: the owner's)
//   release-m2/app/Meathead2.html     Meathead 2's standard build (no cheat panel): what the Windows and Linux apps are
//                                     packaged from (tools/steam/package-m2.mjs, tools/linux/package-m2.mjs)
// `npm run release:web` (both games), `npm run release:web:m1`, `npm run release:web:m2`: the standard builds for the
// browser (itch.io: zip the folder), the voice pack beside the page instead of inside it:
//   release-m1/web/index.html + voices.bin
//   release-m2/web/index.html + voices.bin
// Vite builds each into .build/<mode>/ first, and the page is moved into place, so a folder's other files stay put.

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
const BUILDS = {
  m1: [['public', 'index.html', 'release-m1/app/Meathead.html'], ['release', 'index.html', 'release-m1/Meathead-cheats.html']],
  m2: [['m2public', 'meathead2.html', 'release-m2/app/Meathead2.html'], ['m2', 'meathead2.html', 'release-m2/Meathead2-cheats.html']],
};
const WEB = {
  m1: [['public', 'index.html', 'release-m1/web/index.html', 'src/m1/generated/voices-m1.bin']],
  m2: [['m2public', 'meathead2.html', 'release-m2/web/index.html', 'src/m2/generated/voices.bin']],
};
const web = process.argv.includes('web');
const games = process.argv.slice(2).filter(a => a === 'm1' || a === 'm2');
const which = games.length ? games : ['m1', 'm2'];
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
for (const game of which) for (const [mode, page, to, voices] of (web ? WEB : BUILDS)[game]) {
  const r = spawnSync(process.execPath, [vite, 'build', '--mode', mode], { cwd: root, stdio: 'inherit', env: web ? { ...process.env, MEATHEAD_WEB: '1' } : process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const dest = path.join(root, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, '.build', mode, page), dest);
  fs.rmSync(path.join(root, '.build', mode), { recursive: true, force: true });
  console.log(`-> ${to} (${(fs.statSync(dest).size / 1048576).toFixed(1)} MB)`);
  if (voices) {
    const vd = path.join(path.dirname(dest), 'voices.bin');
    fs.copyFileSync(path.join(root, voices), vd);
    console.log(`-> ${path.relative(root, vd).split(path.sep).join('/')} (${(fs.statSync(vd).size / 1048576).toFixed(1)} MB)`);
  }
}
fs.rmSync(path.join(root, '.build'), { recursive: true, force: true });
