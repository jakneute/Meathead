import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { m2Stub } from './tools/m2Stub';

/** `--mode steam`: the voice pack's left out of the page (the desktop app ships it as a file of its own, read through
 * the app: see electron/main.cjs), so a code change only changes the few-MB page, not 35 MB of it. The import's URL
 * becomes a marker the game knows to ask the app for (src/m1/App.tsx). */
const externalVoices = (): Plugin => ({
  name: 'meathead-external-voices',
  enforce: 'pre',
  resolveId: id => (/voices-m1\.bin\?url$/.test(id) ? '\0meathead-desktop-voices' : null),
  load: id => (id === '\0meathead-desktop-voices' ? `export default 'desktop:voices';` : null),
});

// `vite build --mode release` packs the whole game into one self-contained HTML file; `--mode public` the same, for
// players (no cheats, the intro always: see src/m1/build.ts), into a folder of its own (not emptied first: the desktop app,
// release-public/steam/ from `npm run release:steam`, lives in it too). `--mode steam`: the public build for the desktop
// app, its voices outside the page (into .steam-build/page/, where tools/steam/package.mjs picks it up).
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    ...(mode === 'steam' ? [externalVoices()] : []),
    react(), tailwindcss(),
    ...(mode === 'release' || mode === 'public' || mode === 'steam' || mode === 'm2' ? [viteSingleFile()] : []),
    ...(mode === 'm2' ? [m2Stub()] : []),
  ],
  // (`--mode m2`: Meathead 2, from meathead2.html, into a folder of its own)
  build: mode === 'release' ? { outDir: 'release', emptyOutDir: true } : mode === 'public' ? { outDir: 'release-public', emptyOutDir: false }
    : mode === 'steam' ? { outDir: '.steam-build/page', emptyOutDir: true }
    : mode === 'm2' ? { outDir: 'release-m2', emptyOutDir: true, rollupOptions: { input: 'meathead2.html' } } : {},
}));
