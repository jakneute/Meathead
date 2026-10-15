// `npm run icon`: Meathead 1's icon, made from the game's own art. render.ts (Meathead's close-up from the cutscenes,
// cropped to his head) is bundled and drawn on a page in Electron, offscreen; each size comes back a PNG. They're kept in
// tools/icon/png/, packed into electron/icon.ico (the desktop app's: the exe and its window), and the 32 goes into
// index.html as the browser build's favicon. A one-off: run it again only if the art or the crop changes.

import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const here = path.join(root, 'tools', 'icon');
const mood = process.argv[2] || 'dumb';
const SIZES = [256, 128, 64, 48, 32, 24, 16];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'meathead-icon-'));
await build({ entryPoints: [path.join(here, 'render.ts')], bundle: true, format: 'iife', platform: 'browser', outfile: path.join(tmp, 'render.js'), logLevel: 'error', loader: { '.png': 'dataurl', '.bin': 'empty' } });
fs.writeFileSync(path.join(tmp, 'index.html'), '<!DOCTYPE html><meta charset="utf-8"><body><script src="render.js"></script>');
fs.copyFileSync(path.join(here, 'shoot.cjs'), path.join(tmp, 'shoot.cjs'));

const electron = createRequire(import.meta.url)('electron');
const run = spawnSync(electron, [path.join(tmp, 'shoot.cjs'), path.join(tmp, 'index.html'), mood, path.join(tmp, 'out.json')], { stdio: 'inherit', env: (({ ELECTRON_RUN_AS_NODE, ...rest }) => rest)(process.env) });
if (run.status !== 0 || !fs.existsSync(path.join(tmp, 'out.json'))) { console.error('The icon page failed.'); process.exit(1); }
const urls = JSON.parse(fs.readFileSync(path.join(tmp, 'out.json'), 'utf8'));
fs.rmSync(tmp, { recursive: true, force: true });

const pngs = Object.fromEntries(SIZES.map(s => [s, Buffer.from(urls[s].split(',')[1], 'base64')]));
fs.mkdirSync(path.join(here, 'png'), { recursive: true });
for (const s of SIZES) fs.writeFileSync(path.join(here, 'png', `meathead-${s}.png`), pngs[s]);

// The .ico: a 6-byte header, a 16-byte entry per size, then each size's PNG whole (Windows reads PNGs in an .ico)
const head = Buffer.alloc(6 + 16 * SIZES.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(SIZES.length, 4);
let at = head.length;
SIZES.forEach((s, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(s >= 256 ? 0 : s, e); head.writeUInt8(s >= 256 ? 0 : s, e + 1);
  head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(pngs[s].length, e + 8); head.writeUInt32LE(at, e + 12);
  at += pngs[s].length;
});
fs.writeFileSync(path.join(root, 'electron', 'icon.ico'), Buffer.concat([head, ...SIZES.map(s => pngs[s])]));

// The browser build's favicon: the 32, inline in index.html's head (the release builds are one self-contained file)
const index = path.join(root, 'index.html');
const link = `<link rel="icon" type="image/png" href="data:image/png;base64,${pngs[32].toString('base64')}" />`;
let html = fs.readFileSync(index, 'utf8');
html = /<link rel="icon"[^>]*\/>/.test(html) ? html.replace(/<link rel="icon"[^>]*\/>/, link) : html.replace(/(\s*)<title>/, `$1${link}$1<title>`);
fs.writeFileSync(index, html);

console.log(`Icon (${mood}): tools/icon/png/meathead-*.png, electron/icon.ico (${at} bytes), index.html's favicon`);
